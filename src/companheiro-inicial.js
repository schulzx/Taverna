/* ============================================================
   O COMPANHEIRO DE ANTES — a campanha pode começar com alguém ao lado

   A pessoa, em 30/09 (`mente/respondidas.md`): "A campanha pode começar
   com um companheiro." E o que isso quer dizer, dito pelo coordenador:
   alguém do ELENCO (MM8b), ligado ao PASSADO do herói, que chega com ele
   pela MESMA razão — a carta, a pista, a dívida que a abertura (MM13) já
   lhe dá —, no grupo que já existe, e só em campanha nova.

   Até aqui um companheiro só existia de uma maneira: convidado, depois de
   treze dias de convívio (o convite pesa o tempo mais que qualquer traço).
   Na segunda sessão de prova o golpe final do companheiro (MM3b) ficou sem
   prova jogada por isso mesmo: "não há companheiro possível numa sessão".
   O Matt não começa a Vox Machina com seis estranhos — começa com gente
   que já anda junta, e a história é o que eles vêm fazer.

   ---------------- O QUE ESTE MÓDULO FAZ ----------------

   1. A PORTA (`podeTerCompanheiro`): só Uma Vida, só campanha nova (nunca
      um capítulo, nunca um load), só com o grupo vazio (na sala de dois, o
      lugar ao lado já é do outro jogador), e só quando a abertura da MM13
      existe — a razão do companheiro É a razão da abertura, e sem ela ele
      chegaria sem porquê.
   2. QUEM (`companheiroInicial`): uma pessoa do elenco, pela semente do
      mundo — nunca gente nova. Das fontes que vivem no mundo (`doArco`,
      `recorrente`), viva, sem propósito hostil (um amigo de seis anos não
      nasce a tramar a traição no dia três), e sem o nome de ninguém que a
      história procura (a pista, o alvo, os marcos da espinha: a etapa
      `falar_com` casa pelo primeiro nome, e um companheiro chamado como a
      pista fecharia o primeiro passo sem encontro nenhum). De preferência
      de OUTRA cidade: ele veio com o herói, não estava à espera dele.
   3. A LIGAÇÃO AO PASSADO (`LIGACOES_AO_PASSADO`): companheiro de armas,
      o mesmo sangue, companheiro de estrada, quem lhe ensinou o ofício, a
      quem ele deve. O antecedente do herói pesa na escolha (o soldado traz
      quem serviu com ele; o erudito, quem o ensinou), e cada uma diz o que
      o laço é no registo e o que a abertura conta.
   4. A FICHA, pelas tabelas que o grupo já usa — a mesma conta de
      `fichaDeCompanheiro` (App.jsx), o mesmo `garantirFichaCompanheiro`,
      o mesmo `ganharVinculo`. Nenhum número novo de combate.
   5. O LAÇO JÁ FEITO, nos campos que o registo já tem: `laco` com força e
      `desde` ANTES do dia 1 (um dia negativo, que `garantirLaco` já
      aceita), `conhecidoEm: 0` ("antes do registro de dias", a leitura que
      a crónica e o resumo das pessoas já fazem), e o dia em que foi visto
      no `elenco.vistos`. Sem campo novo no save.

   ---------------- O QUE ELE NÃO FAZ ----------------

   · Não toca em save antigo: a porta é a criação da campanha, e o load
     nunca a chama.
   · Não escreve bloco no prompt: a única frase nova vai no pedido da
     abertura (cobrado uma vez por campanha), e daí em diante o companheiro
     é um membro do grupo como outro qualquer — o `MEU GRUPO` de sempre.
   · Não muda o orçamento de encontro. A régua mediu (o número está em
     `CURANDEIROS_DE_FORA` e na suíte): com as classes da tabela as
     primeiras lutas não ficam triviais, e as que o orçamento monta já
     cobram o companheiro (`VALOR_COMPANHEIRO`, orcamento.js).
   ============================================================ */

import { rngDe } from "./geografia.js";
import { elencoDoMundo, AGENDA, registrarVisto, garantirElencoDoSave } from "./elenco.js";
import { criarNPC, garantirLaco, tipoDeLacoPorId, RELACOES_NPC } from "./npcs.js";
import { garantirFichaCompanheiro } from "./companheiros.js";
import { classePorNome } from "./classes.js";
import { VINCULO_INICIAL, ganharVinculo } from "./vinculos.js";
import { indoleDe } from "./indole.js";
import { mesmaPessoa } from "./missoes.js";
import { DIAS_ANO } from "./calendario.js";
import { MAX_COMPANHEIROS } from "./constantes.js";
import { ANTECEDENTES } from "./antecedentes.js";

const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const txt = (x, n = 160) => (typeof x === "string" ? x.trim().slice(0, n) : "");
const encher = (modelo, v) => String(modelo || "").replace(/\{(\w+)\}/g, (_, k) => (v[k] != null ? String(v[k]) : ""));

/* ============================================================
   AS TABELAS
   ============================================================ */

/* A PORTA. `modos`: onde ele nasce. Uma Vida é o pedido. A Noite fica de
   fora porque os pratos dela foram medidos com o pronto SOZINHO (a catraca
   da arena, 35% a 65%, e o torneio é um contra um por definição) e porque
   não passa pela abertura da MM13; o Duelo é jogador contra jogador.
   `grupoVazio`: na sala de dois o outro jogador já ocupa o lugar ao lado,
   e um terceiro seria companhia que ninguém pediu. */
export const PORTA_DO_COMPANHEIRO = {
  modos: ["historia"],
  grupoVazio: true,
  precisaDaAbertura: true,
};

/* A FICHA, os mesmos números da `fichaDeCompanheiro` do App.jsx (o
   companheiro convidado): o nível é o do herói menos dois, nunca abaixo
   de um, e o PV é base + por nível. Se lá mudar, muda aqui — a suíte lê os
   dois e falha se divergirem. */
export const FICHA_DO_COMPANHEIRO = {
  nivelAbaixoDoHeroi: 2,
  nivelMinimo: 1,
  vidaBase: 10,
  vidaPorNivel: 3,
};

/* QUEM PODE SER. As fontes do elenco que vivem no mundo — a espinha é a
   gente que a história procura, o chefe é o antagonista, o mestre tem uma
   casa para governar. E os propósitos que não andam com o herói desde o
   primeiro dia: os da agenda hostil (elenco.js), a mesma lista que diz
   quem trama fora de cena. */
export const QUEM_PODE_SER = {
  fontes: ["doArco", "recorrente"],
  propositosDeFora: AGENDA.hostil.propositos,
  prefereOutraCidade: true,
};

/* AS CLASSES QUE CURAM FICAM DE FORA, e é a régua que o diz. Medido com a
   régua de Uma Vida (a que mora em `testes/`, e que o jogo nunca importa —
   a prova é `teste-companheiro-inicial.mjs`, secção 7) nas primeiras
   lutas — três heróis (a Muralha, a Chama, a Sombra) nos níveis 1 a 3,
   contra três fracos, dois comuns e um competente um nível acima, 300
   sementes cada:
     · sozinho, o herói ganha 52% a 64% e cai 36% a 50% das vezes;
     · com o Guerreiro das armas ao lado (nível 1, 14 PV), ganha 84% a 92%
       e cai 16% a 33%; a ficha mais forte da tabela (o Caçador de 14 PV)
       chega a 97,8% no nível 3, e o herói ainda cai 7,8%;
     · com um CLÉRIGO, ganha 99,9% a 100% — e no nível 3 cai só 2,9%. O
       clérigo levanta o herói caído, e a luta deixa de se poder perder.
   Um curandeiro desde o turno 1 é uma apólice, não um companheiro: as
   primeiras lutas viram aquecimento. Os três que trazem cura no catálogo
   ficam de fora da tabela das ligações (o Invocador também: as invocações
   dele encheriam o grupo antes de o herói escolher ninguém). Quem quiser
   um curandeiro convida-o — e aí o convívio já pagou por ele. */
export const CURANDEIROS_DE_FORA = ["Clérigo", "Druida", "Bardo", "Invocador"];

/* AS LIGAÇÕES AO PASSADO. Cada uma diz:
   · `laco`/`forca` — o laço no registo (`TIPOS_DE_LACO`, npcs.js);
   · `relacao` — de que lado está (`RELACOES_NPC`);
   · `anos` — há quanto tempo se conhecem (o `desde` do laço fica antes do
     dia 1, e a nota da ficha o diz);
   · `vinculo` — a afinidade do grupo (vinculos.js), aplicada por
     `ganharVinculo`: cada marco já passado dá o que sempre deu;
   · `classes` — de que classes ele pode ser (nenhuma de `CURANDEIROS_DE_FORA`);
   · `antecedentes` — quanto cada antecedente puxa esta ligação (o resto
     pesa `peso`), e `nunca` — os que não a podem ter (o órfão não tem
     sangue a quem voltar);
   · `quem` — o que ele é do herói, por género; `porque` — por que veio,
     dito em voz de mundo e na terceira pessoa (o pedido da abertura fala
     do herói ao Narrador, e é a narração que o devolve por "você"). */
export const LIGACOES_AO_PASSADO = [
  {
    id: "armas", laco: "amizade", forca: 3, relacao: "companheiro", anos: { de: 3, ate: 8 }, vinculo: 50,
    classes: ["Guerreiro", "Caçador", "Monge"], peso: 2, antecedentes: { soldado: 6, cacador: 3, nobre_caido: 2 }, nunca: [],
    quem: { homem: "antigo companheiro de armas do herói", mulher: "antiga companheira de armas do herói" },
    curto: { homem: "companheiro de armas", mulher: "companheira de armas" },
    porque: "serviram lado a lado noutra guerra, e {ele} não o deixou partir sozinho",
  },
  {
    id: "sangue", laco: "familia", forca: 3, relacao: "familia", anos: { de: 18, ate: 30 }, vinculo: 50,
    classes: ["Guerreiro", "Ladino", "Mago", "Caçador"], peso: 2, antecedentes: { nobre_caido: 5, ferreiro: 5, pragado: 3 }, nunca: ["orfao"],
    quem: { homem: "irmão do herói", mulher: "irmã do herói" },
    curto: { homem: "irmão", mulher: "irmã" },
    porque: "o que chamou o herói também é assunto da família, e o sangue não o deixa ir só",
  },
  {
    id: "estrada", laco: "amizade", forca: 2, relacao: "amigo", anos: { de: 2, ate: 6 }, vinculo: 25,
    classes: ["Ladino", "Caçador", "Monge"], peso: 2, antecedentes: { orfao: 5, naufrago: 4, artista: 4, ladrao: 2 }, nunca: [],
    quem: { homem: "companheiro de estrada do herói", mulher: "companheira de estrada do herói" },
    curto: { homem: "companheiro de estrada", mulher: "companheira de estrada" },
    porque: "há anos que os dois andam pela mesma estrada, e não ia ser esta a separá-los",
  },
  {
    id: "oficio", laco: "aprendizado", forca: 2, relacao: "aliado", anos: { de: 4, ate: 10 }, vinculo: 25,
    classes: ["Mago", "Engenheiro", "Feiticeiro", "Monge"], peso: 2, antecedentes: { erudito: 6, acolito: 4, ferreiro: 3, artista: 2 }, nunca: [],
    quem: { homem: "o mestre que ensinou ao herói o ofício", mulher: "a mestra que ensinou ao herói o ofício" },
    curto: { homem: "mestre de ofício", mulher: "mestra de ofício" },
    porque: "ensinou-lhe quase tudo o que ele sabe, e o que o herói veio procurar é coisa que {ele} quer ver com os próprios olhos",
  },
  {
    id: "credor", laco: "divida", forca: 2, relacao: "aliado", anos: { de: 1, ate: 4 }, vinculo: 25,
    classes: ["Ladino", "Bruxo", "Guerreiro"], peso: 2, antecedentes: { ladrao: 6, ex_cultista: 4, cacador: 3, nobre_caido: 2 }, nunca: [],
    quem: { homem: "o homem a quem o herói deve mais do que dinheiro", mulher: "a mulher a quem o herói deve mais do que dinheiro" },
    curto: { homem: "credor", mulher: "credora" },
    porque: "o herói deve-lhe, e {ele} decidiu que a melhor maneira de cobrar é não o perder de vista",
  },
];

/* OS PRONOMES, pelo género da pessoa (`genero_pessoa` da base). */
export const PRONOMES_DO_COMPANHEIRO = {
  homem: { ele: "ele", dele: "dele" },
  mulher: { ele: "ela", dele: "dela" },
};

/* A FRASE DA ABERTURA, que entra na parte 2 do pedido (ONDE O HERÓI
   ESTÁ). Uma frase só, cobrada uma vez por campanha. */
export const NA_ABERTURA = ", e não chegou só: {nome}, {quem}, vem com ele — {porque}; a razão que o trouxe é também {dele}";

/* A NOTA da ficha do registo e a descrição do grupo — o passado que a
   ficha por dentro (gente-por-dentro.js) não inventa para quem anda no
   grupo, porque "a história deles foi escrita na ficha do grupo". */
export const NOTA_DO_PASSADO = "{quem}; conhecem-se há {anos} anos — {porque}";

/* ============================================================
   A PORTA
   ============================================================ */

/* `ctx`: { modo, capitulo, grupo, abertura }. Só a campanha nova de Uma
   Vida, de grupo vazio (as invocações não contam: não são gente) e com a
   abertura da MM13 de pé. */
export function podeTerCompanheiro(ctx) {
  const o = obj(ctx);
  if (!PORTA_DO_COMPANHEIRO.modos.includes(o.modo)) return false;
  if (o.capitulo) return false;
  const grupo = (Array.isArray(o.grupo) ? o.grupo : []).filter((g) => g && !g.invocada);
  if (PORTA_DO_COMPANHEIRO.grupoVazio && grupo.length) return false;
  if (PORTA_DO_COMPANHEIRO.precisaDaAbertura) {
    const a = obj(o.abertura);
    if (a.legado || !obj(a.pista).nome) return false;
  }
  return true;
}

/* ============================================================
   A ESCOLHA
   ============================================================ */

const generoDe = (p) => (norm(p && p.genero_pessoa) === "mulher" ? "mulher" : "homem");

function ligacaoPara(rnd, antecedente) {
  const ref = norm(antecedente);
  const lista = LIGACOES_AO_PASSADO.filter((l) => !l.nunca.some((x) => norm(x) === ref));
  const pesos = lista.map((l) => l.peso + (Object.entries(l.antecedentes).find(([k]) => ref && norm(k) === ref) || [null, 0])[1]);
  const total = pesos.reduce((s, p) => s + p, 0);
  let d = rnd() * total;
  for (let i = 0; i < lista.length; i++) { if (d < pesos[i]) return lista[i]; d -= pesos[i]; }
  return lista[lista.length - 1];
}

/* O antecedente chega como id ou como NOME (a ficha guarda o nome) — a
   mesma porta dupla de `lacoDoAntecedente` (abertura.js), lida no
   catálogo (antecedentes.js) e não numa cópia. */
function idDoAntecedente(ref) {
  const k = norm(ref);
  if (!k) return "";
  const a = ANTECEDENTES.find((x) => norm(x.id) === k || norm(x.nome) === k);
  return a ? a.id : "";
}

function classePara(rnd, ligacao, classeDoHeroi) {
  const validas = ligacao.classes.filter((c) => classePorNome(c) && !CURANDEIROS_DE_FORA.includes(c));
  const outras = validas.filter((c) => norm(c) !== norm(classeDoHeroi));
  const pool = outras.length ? outras : validas;
  return pool.length ? pool[Math.floor(rnd() * pool.length)] : "Guerreiro";
}

/* `ctx`: { semente, mapa, genero, molde, lex, espinha, guildas, base,
     cidade (a de partida), antecedente (id ou nome), heroi (a ficha:
     nome, nivel, classe), abertura (a da MM13) }.
   Devolve { nome, ligacao, comp, npc, linha, quem, porque, dele } — o
   companheiro pronto a entrar no grupo e no registo — ou `null` quando o
   elenco não tem ninguém que sirva. Determinístico pela semente. */
export function companheiroInicial(ctx) {
  const o = obj(ctx);
  const semente = String(o.semente == null ? "" : o.semente);
  const heroi = obj(o.heroi);
  let el = null;
  try {
    el = elencoDoMundo(semente, o.mapa, { genero: o.genero, molde: o.molde, lex: o.lex, espinha: o.espinha, guildas: o.guildas, base: o.base });
  } catch { el = null; }
  if (!el || !Array.isArray(el.pessoas) || !el.pessoas.length) return null;

  /* quem a história procura não pode andar ao lado do herói */
  const a = obj(o.abertura);
  const marcos = (Array.isArray(obj(o.espinha).atos) ? o.espinha.atos : []).flatMap((x) => (x && Array.isArray(x.marcos) ? x.marcos : []));
  const procurados = [obj(a.pista).nome, obj(a.alvo).quem, heroi.nome, ...marcos.flatMap((m) => [m && m.quem, m && m.alvo])].filter(Boolean);
  const procurado = (nome) => procurados.some((x) => norm(x) === norm(nome) || mesmaPessoa(x, nome));

  const cand = el.pessoas.filter((p) => p && p.nome && !p.morto
    && QUEM_PODE_SER.fontes.includes(p.fonte)
    && !procurado(p.nome)
    && !QUEM_PODE_SER.propositosDeFora.includes(indoleDe(semente, { nome: p.nome }).proposito));
  if (!cand.length) return null;
  const partida = norm(o.cidade);
  const deFora = cand.filter((p) => norm(p.cidade) !== partida);
  const pool = QUEM_PODE_SER.prefereOutraCidade && deFora.length ? deFora : cand;

  const rnd = rngDe(`${semente}|companheiro-inicial|${String(o.cidade || "")}`);
  const pessoa = pool[Math.floor(rnd() * pool.length)];
  const ant = idDoAntecedente(o.antecedente);
  const ligacao = ligacaoPara(rnd, ant);
  const classe = classePara(rnd, ligacao, heroi.classe);
  const anos = ligacao.anos.de + Math.floor(rnd() * (ligacao.anos.ate - ligacao.anos.de + 1));
  const gen = generoDe(pessoa);
  const pr = PRONOMES_DO_COMPANHEIRO[gen];
  const quem = ligacao.quem[gen];
  const porque = encher(ligacao.porque, pr);
  const passado = encher(NOTA_DO_PASSADO, { quem, anos, porque }).slice(0, 240);

  /* A FICHA DO GRUPO — a conta do convite, a classe da ligação, e a
     afinidade que o tempo já deu */
  const F = FICHA_DO_COMPANHEIRO;
  const nivel = Math.max(F.nivelMinimo, (Number(heroi.nivel) || 1) - F.nivelAbaixoDoHeroi);
  const vidaMax = F.vidaBase + (nivel - 1) * F.vidaPorNivel;
  const papel = txt(pessoa.papel, 60);
  let comp = garantirFichaCompanheiro({
    nome: pessoa.nome, conceito: ligacao.curto[gen], nivel, xp: 0,
    vida: vidaMax, vidaMax, descricao: passado, classe,
    habilidades: [], inventario: [], equipamento: [], equipados: {},
    semente: `npc|${pessoa.nome}|${papel}`,
    vinculo: VINCULO_INICIAL, marcos: [],
  });
  comp = ganharVinculo(comp, Math.max(0, ligacao.vinculo - VINCULO_INICIAL)).membro;

  /* A FICHA DO REGISTO — o laço já feito, de antes do dia 1 */
  const npc = criarNPC(pessoa.nome, {
    papel, relacao: RELACOES_NPC[ligacao.relacao] ? ligacao.relacao : "aliado",
    genero: gen, local: txt(o.cidade, 60), notas: passado,
    conhecidoEm: 0,
    laco: { tipo: tipoDeLacoPorId(ligacao.laco) ? ligacao.laco : "amizade", forca: ligacao.forca, desde: 1 - anos * DIAS_ANO },
  });

  const linha = linhaDoCompanheiro({ nome: pessoa.nome, quem, porque, dele: pr.dele });
  return { nome: pessoa.nome, ligacao: ligacao.id, classe, anos, comp, npc, quem, porque, dele: pr.dele, linha };
}

/* A frase da abertura, de um companheiro (o objeto de `companheiroInicial`).
   Lixo, ou um companheiro sem nome, devolve "": o pedido sai como antes. */
export function linhaDoCompanheiro(c) {
  const o = obj(c);
  const nome = txt(o.nome, 60), quem = txt(o.quem, 90), porque = txt(o.porque, 200), dele = txt(o.dele, 10);
  if (!nome || !quem || !porque || !dele) return "";
  return encher(NA_ABERTURA, { nome, quem, porque, dele });
}

/* ============================================================
   O COMPANHEIRO ENTRA — no grupo, no registo e nos vistos
   ============================================================ */

/* `estado`: { personagem, npcs, elenco } (o `elenco` é o campo do save,
   `garantirElencoDoSave`). Devolve os três NOVOS — o recebido fica
   intacto. Quem já está no grupo ou no registo não é reescrito: um nome
   que já existe ali não é o companheiro de antes, é outra pessoa. */
export function juntarCompanheiroInicial(estado, ci, dia) {
  const e = obj(estado);
  const p = obj(e.personagem);
  const npcs = obj(e.npcs);
  const elenco = garantirElencoDoSave(e.elenco);
  const c = obj(ci);
  const nome = txt(c.nome, 40);
  const grupo = Array.isArray(p.grupo) ? p.grupo : [];
  const igual = { personagem: e.personagem, npcs: e.npcs, elenco };
  if (!nome || !c.comp || !c.npc) return igual;
  if (grupo.some((g) => g && norm(g.nome) === norm(nome))) return igual;
  if (grupo.filter((g) => g && !g.invocada).length >= MAX_COMPANHEIROS) return igual;
  const jaNoRegisto = Object.keys(npcs).some((k) => norm(k) === norm(nome));
  if (jaNoRegisto) return igual;
  const d = Number.isFinite(Number(dia)) ? Math.max(0, Math.floor(Number(dia))) : 1;
  return {
    personagem: { ...p, grupo: [...grupo, { ...c.comp }] },
    npcs: { ...npcs, [nome]: { ...c.npc } },
    elenco: registrarVisto(elenco, nome, d),
  };
}

/* ============================================================
   O CONVÍVIO DE QUEM SE CONHECE DE ANTES
   ============================================================ */

/* O laço é de antes da campanha quando o `desde` dele é anterior ao dia 1
   — só o companheiro de antes nasce assim (`firmarLaco` grava o dia em
   que a onda fecha, e nunca um negativo). Rompido ou não: conhecer de
   antes não se desfaz por uma briga. */
export function lacoDeAntes(ficha) {
  const l = garantirLaco(obj(ficha).laco);
  return !!l && l.desde < 0;
}

/* O CONVÍVIO DE UMA FICHA DO REGISTO, para o convite — a conta que o
   App.jsx faz em `convivioCom`, campo a campo, mais `deAntes`. Para toda
   ficha cujo laço não é de antes do dia 1, o resultado é EXATAMENTE o de
   lá (a suíte confere): o que muda é que quem o herói conhece de antes
   não é lido como quem conheceu ontem. */
export function convivioDaFicha(ficha, hoje) {
  const n = obj(ficha);
  const d = Number(hoje) || 0;
  const l = garantirLaco(n.laco);
  return {
    dias: Math.max(0, d - (n.conhecidoEm != null ? n.conhecidoEm : d)),
    forcaDoLaco: (l && !l.rompido && l.forca) || 0,
    meDeve: !!n.meDeve,
    euDevo: /d[íi]vida|devo|prometi/i.test(String(n.notas || "")) || !!(l && l.tipo === "divida"),
    sabeDeMim: !!n.sabeDeMim, euSeiDela: !!n.euSeiDela, euGanhei: !!n.euGanhei,
    deAntes: lacoDeAntes(n),
  };
}
