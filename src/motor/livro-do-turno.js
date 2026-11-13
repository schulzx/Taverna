/* ============================================================
   O LIVRO DE FACTOS NO TURNO, NO MOTOR (08/11/2026, Fase BQ · BQ2) — src/motor/livro-do-turno.js

   A BQ1 deu o livro (livro-de-factos.js: o nome que passa a id uma vez, o
   facto que fica). Esta peça é QUEM O ESCREVE NO TURNO, e mora no motor
   por uma razão só: o replay (sessao.js) e o servidor têm de produzir o
   MESMO livro que o App, turno a turno. Uma escrita que só o App fizesse
   seria um campo do save que nenhum passo do replay reproduz — «sem dono»,
   e a régua do replay é a lei da casa.

   Três peças, todas puras, todas sobre o ESTADO (a forma do save, a de
   estado.js), e nada mais:

     elencoDoLivro(estado, { mundo }) → o elenco que resolve os nomes
       (a entrada de `idDaPessoa`/`anotarTurno`): o herói, a cidade, a
       estrada, o registo, o grupo, as pessoas do cânone, o dia e o turno,
       e a ponte do lugar para o id da base (`chaveDoLugar`, com o mundo).
       UM ELENCO SÓ: o App, o replay e o servidor chamam esta função, e um
       nome dá o mesmo id pelas três portas. Ficam DE FORA, de propósito,
       as duas fontes que o estado não leva — a gente da base (refeita pela
       semente) e o núcleo (o cache do App, que no replay é dublê): pô-las
       só de um lado daria `Cidade|gente|X` ou `npc|X` conforme quem
       escreve. Quem delas importa entra no registo quando aparece (é o
       registo que diz que alguém existe), e daí em diante tem o id dele.

     oQueACenaDaAoLivro(estado, { narrativa, modoDoNarrador }) → { emCena, lugar, afeicoes }
       o fim da resposta: quem está à vista (montarEmCena, em-cena.js — a
       régua da tela — sobre o grupo e o registo daqui, e a prosa DESTE
       turno, a resposta crua do Narrador, que o App e a gravação têm
       igual), onde o herói está, e a afeição do grupo (o vínculo).

     anotarOLivro(estado, ocorrido, { mundo }) → { factos, notas } | null
       o `anotarTurno` com o elenco do estado por baixo do que ocorreu (o
       que o ocorrido traz por definir não apaga o do elenco). NULL quando
       o estado não tem livro: a régua do minuto do replay (teste-sessao
       §11, «um estado sem relógio continua sem ele») — uma sessão gravada
       antes do livro não ganha um livro que ninguém escreveu. O App tem
       sempre livro (garantirFactos no load), e por isso escreve sempre.

   Os outros dois que escrevem no livro já são motor e emitem a mesma
   entrada como efeito (`{ tipo: "factos", ... }`): o Cronista
   (cronista-do-turno.js, a conversa, o segredo, os nomeados) e a luta
   (luta-do-turno.js, os caídos) — quem os aplica chama anotarOLivro.
   ============================================================ */
import { anotarTurno } from "../livro-de-factos.js";
import { montarEmCena } from "../em-cena.js";
import { elencoDaCena } from "../cena.js";
import { chaveDoLugar } from "../mundo-base.js";
import { portaAberta } from "./portas-do-narrador.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const fin = (x) => (typeof x === "number" && Number.isFinite(x) ? x : undefined);

/* as pessoas do cânone: o cânone guarda-as pelo nome, com o `tipo` a
   dizê-lo (a régua de ehPessoaDoCanone, prompt.js) */
const RX_PESSOA_DO_CANONE = /pessoa/i;

export function elencoDoLivro(estado, opcoes) {
  const E = obj(estado) || {};
  const p = obj(E.personagem) || {};
  const m = obj(obj(opcoes) && opcoes.mundo);
  const canone = Object.entries(obj(E.canone) || {})
    .filter(([, f]) => obj(f) && RX_PESSOA_DO_CANONE.test(String(f.tipo || "")))
    .map(([nome, f]) => ({ nome, cidade: f.cidade, local: f.local }));
  const cidade = typeof E.cidadeAtual === "string" ? E.cidadeAtual : "";
  const out = {
    heroi: typeof p.nome === "string" ? p.nome : "",
    cidade,
    naEstrada: !!E.jornada,
    npcs: obj(E.npcs) || {},
    grupo: arr(p.grupo),
    canone,
    dia: fin(E.dia),
    turno: fin(E.npcTurno),
  };
  if (m && typeof m.semente === "string" && m.semente) {
    const mapa = E.mapa;
    out.chaveDoLugar = (n, cid) => chaveDoLugar(m.semente, mapa, n, { genero: m.genero || undefined, molde: m.molde || null, lex: m.lex || m.lexico || null, cidade: cid || cidade });
  }
  return out;
}

export function oQueACenaDaAoLivro(estado, opcoes) {
  const E = obj(estado) || {};
  const o = obj(opcoes) || {};
  const p = obj(E.personagem) || {};
  const grupo = arr(p.grupo).filter((g) => obj(g) && g.nome && !g.invocada);
  const cidade = typeof E.cidadeAtual === "string" ? E.cidadeAtual : "";
  const cena = elencoDaCena(obj(E.npcs) || {}, cidade, E.mapa, { comGrupo: grupo, masmorra: E.masmorra });
  /* a porta `livroVistoDaProsa` (NE2, 13/11): o «visto» que a prosa dá
     satisfaz «conheceu» da quest — fechada no modo, só o grupo e o registo
     da cena põem alguém à vista */
  const narrativa = typeof o.narrativa === "string" && portaAberta("livroVistoDaProsa", o.modoDoNarrador) ? o.narrativa : "";
  const emCena = montarEmCena({
    cidade, grupo, presentes: cena.aqui || [], longe: cena.longe || [],
    mostrado: narrativa.trim() ? [narrativa] : [],
    combate: E.combate || null, lugar: E.lugar || null, espinha: E.espinha || null,
  });
  return {
    /* só a gente: o livro guarda pessoas (o `visto` de TIPOS_DE_FACTO) */
    emCena: arr(emCena).filter((x) => obj(x) && x.tipo === "pessoa"),
    lugar: E.lugar || null,
    afeicoes: grupo.filter((g) => typeof g.vinculo === "number").map((g) => ({ quem: g.nome, vinculo: g.vinculo })),
  };
}

export function anotarOLivro(estado, ocorrido, opcoes) {
  const E = obj(estado) || {};
  if (!obj(E.factos)) return null;
  const oc = {};
  for (const [k, v] of Object.entries(obj(ocorrido) || {})) if (v !== undefined && k !== "tipo") oc[k] = v;
  return anotarTurno(E.factos, { ...elencoDoLivro(E, opcoes), ...oc });
}
