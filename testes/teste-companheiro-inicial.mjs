/* teste-companheiro-inicial.mjs — a campanha pode começar com um companheiro

   A prova de `src/companheiro-inicial.js`. A pessoa, a 30/09
   (`mente/respondidas.md`): "A campanha pode começar com um companheiro."
   Alguém do elenco, ligado ao passado do herói, que chega com ele pela
   mesma razão da abertura, no grupo que já existe, e só em campanha nova.

   O que esta suíte tranca:
     1. as tabelas: as ligações falam a língua do registo (laço, relação),
        as classes existem e nenhuma cura, os antecedentes são os do
        catálogo, e a ficha usa os MESMOS números do companheiro convidado
        (lidos no App.jsx como texto);
     2. a porta: só Uma Vida, só campanha nova, só de grupo vazio, só com a
        abertura de pé — e lixo é não;
     3. a escolha por semente: a mesma semente dá o mesmo companheiro, ele
        é do elenco, não é ninguém que a história procura, e o antecedente
        puxa a ligação;
     4. o laço já feito: o registo, o convite e a promoção leem-no como
        conhecido de antes;
     5. sem campo novo no save, e a imutabilidade;
     6. a abertura: a frase entra na parte 2, na segunda pessoa do pedido,
        e sem ela o pedido é o de antes, letra por letra;
     7. a régua: as primeiras lutas com ele não ficam triviais, e o
        orçamento já o cobra;
     8. o golpe final do companheiro (MM3b) vale desde a primeira luta;
     9. a fiação no App.jsx (por texto) — pendente até a mão da tela a fazer;
    10. as duas fichas e a homónima (3.ª sessão de prova, defeito 3): o
        registo diz o que o grupo diz, o portão não a apaga, o nome curto
        é dela, e ela não está de plantão no posto que deixou.

   Tudo por semente: nenhum `Math.random` decide uma asserção. */
import fs from "node:fs";
import {
  PORTA_DO_COMPANHEIRO, FICHA_DO_COMPANHEIRO, QUEM_PODE_SER, CURANDEIROS_DE_FORA, LIGACOES_AO_PASSADO,
  PRONOMES_DO_COMPANHEIRO, NA_ABERTURA, NOTA_DO_PASSADO, PAPEL_NO_REGISTO,
  podeTerCompanheiro, companheiroInicial, linhaDoCompanheiro, juntarCompanheiroInicial, lacoDeAntes, convivioDaFicha,
} from "../src/companheiro-inicial.js";
import { abrirAbertura, pedidoDaAbertura, garantirAbertura, aindaSoUmNome, PALAVRAS_DE_BASTIDOR } from "../src/abertura.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { ESTRUTURAS } from "../src/historia.js";
import { ANTECEDENTES } from "../src/antecedentes.js";
import { MOLDES } from "../src/moldes.js";
import { generosDisponiveis } from "../src/nomes.js";
import { guildasDoMundo } from "../src/guildas.js";
import { elencoDoMundo, garantirElencoDoSave, promoverNoDia, diasVistosDe } from "../src/elenco.js";
import { criarNPC, garantirLaco, tipoDeLacoPorId, RELACOES_NPC, mesmoPapel, nomeComDono, primeiroNome, familiasDoOficio } from "../src/npcs.js";
import { detectarPapelTrocado, violacoesDoTurno } from "../src/portao.js";
import { mencionadosNaCena, oQueExisteAqui } from "../src/mundo-base.js";
import { genteParaPauta, NO_GRUPO } from "../src/gente-por-dentro.js";
import { nomeProcurado, procurarPessoa } from "../src/procura.js";
import { comEm } from "../src/lugar.js";
import { indoleDe, pesarConvite, garantirConvivio } from "../src/indole.js";
import { CLASSES, classePorNome } from "../src/classes.js";
import { garantirFichaCompanheiro, ehCuraDeGrupo } from "../src/companheiros.js";
import { VINCULO_INICIAL, ganharVinculo, marcoDe } from "../src/vinculos.js";
import { migrarPersonagem } from "../src/regras-jogo.js";
import { mesmaPessoa, conferir } from "../src/missoes.js";
import { MODOS } from "../src/modos.js";
import { turnoDosCompanheiros, pvEsperadoJogador } from "../src/combate.js";
import { completarInimigo } from "../src/bestiario.js";
import { quedasComEscolhaNaRodada } from "../src/golpe-final.js";
import { quantosPara, VALOR_COMPANHEIRO } from "../src/orcamento.js";
import { PRONTOS } from "../src/prontos.js";
import { simularCombate, comSorteTravada } from "./regua-combate.mjs";

let ok = 0, mal = 0, pend = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const palavra = (alts) => new RegExp(`(?<![\\p{L}\\p{N}])(${alts})(?![\\p{L}\\p{N}])`, "iu");
/* a mesma lista de teste-voz-segunda-pessoa.mjs: o pedido da abertura não
   fala por "eu" fora das aspas */
const PRIMEIRA = palavra("eu|meu|minha|meus|minhas|mim|comigo|me|estou|sou|sei|cheguei|nós|nosso|nossa|nossos|nossas|conosco");
const semFalas = (s) => String(s || "").replace(/["“«][^"”»]*["”»]/g, " ");
const congelar = (o) => { if (o && typeof o === "object") { Object.freeze(o); for (const v of Object.values(o)) congelar(v); } return o; };
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");

/* ---------------- os mundos ---------------- */
const GENEROS = generosDisponiveis();
const MUNDOS = [];
for (const g of GENEROS) for (const M of MOLDES) {
  const semente = `Sonda CI|${g}|${M.id}`;
  const mapa = gerarGeografia(semente, M);
  MUNDOS.push({ semente, genero: g, molde: M, mapa, cidade: mapa.cidades[0].nome, guildas: guildasDoMundo(semente, mapa, g, null) });
}
const montar = (w, { estrutura = "jornada", antecedente = "", heroi = { nome: "Brann", nivel: 1, classe: "Guerreiro" } } = {}) => {
  const espinha = estenderEspinha({ semente: w.semente, mapa: w.mapa, genero: w.genero, molde: w.molde, estrutura, cidadeInicial: w.cidade });
  const ab = abrirAbertura({ semente: w.semente, mapa: w.mapa, cidade: w.cidade, espinha, estrutura, antecedente, genero: w.genero, molde: w.molde, nivel: heroi.nivel, dia: 1 });
  const ctx = { semente: w.semente, mapa: w.mapa, genero: w.genero, molde: w.molde, espinha, guildas: w.guildas, cidade: w.cidade, antecedente, heroi, abertura: ab && ab.abertura };
  return { espinha, ab, ctx, ci: ab ? companheiroInicial(ctx) : null };
};
const W0 = MUNDOS[0];
const R0 = montar(W0, { antecedente: "Soldado Reformado" });

/* ============================================================ */
sec("1. as tabelas");
{
  t("as ligações têm ids únicos", new Set(LIGACOES_AO_PASSADO.map((l) => l.id)).size === LIGACOES_AO_PASSADO.length);
  t("todo laço é um tipo do registo (TIPOS_DE_LACO)", LIGACOES_AO_PASSADO.every((l) => tipoDeLacoPorId(l.laco)));
  t("toda relação é uma do registo (RELACOES_NPC)", LIGACOES_AO_PASSADO.every((l) => RELACOES_NPC[l.relacao]));
  t("a força cabe na escala do laço (1 a 3)", LIGACOES_AO_PASSADO.every((l) => l.forca >= 1 && l.forca <= 3 && garantirLaco({ tipo: l.laco, forca: l.forca }).forca === l.forca));
  t("toda classe existe no catálogo", LIGACOES_AO_PASSADO.every((l) => l.classes.length && l.classes.every((c) => classePorNome(c))));
  t("nenhuma classe da tabela é das que ficam de fora (as que curam)", LIGACOES_AO_PASSADO.every((l) => l.classes.every((c) => !CURANDEIROS_DE_FORA.includes(c))));
  t("as que ficam de fora existem (um nome errado não excluiria ninguém)", CURANDEIROS_DE_FORA.every((c) => classePorNome(c)));
  const ids = new Set(ANTECEDENTES.map((a) => a.id));
  t("os antecedentes das ligações são os do catálogo", LIGACOES_AO_PASSADO.every((l) => [...Object.keys(l.antecedentes), ...l.nunca].every((k) => ids.has(k))));
  t("todo antecedente tem ao menos uma ligação possível", ANTECEDENTES.every((a) => LIGACOES_AO_PASSADO.some((l) => !l.nunca.includes(a.id))));
  t("o vínculo de antes é um marco da casa (Confiança ou acima) e cabe na escala", LIGACOES_AO_PASSADO.every((l) => marcoDe(l.vinculo) && l.vinculo > VINCULO_INICIAL && l.vinculo <= 100));
  t("os anos são uma faixa de verdade", LIGACOES_AO_PASSADO.every((l) => l.anos.de >= 1 && l.anos.ate >= l.anos.de));
  t("cada ligação diz quem é, nos dois géneros", LIGACOES_AO_PASSADO.every((l) => Object.keys(PRONOMES_DO_COMPANHEIRO).every((g) => l.quem[g] && l.curto[g])));
  const textos = LIGACOES_AO_PASSADO.flatMap((l) => [...Object.values(l.quem), ...Object.values(l.curto), l.porque]).concat([NA_ABERTURA, NOTA_DO_PASSADO]);
  t("nenhum texto fala por \"eu\" (o pedido é da narração em 2ª pessoa)", textos.every((x) => !PRIMEIRA.test(semFalas(x))), textos.filter((x) => PRIMEIRA.test(semFalas(x))).join(" | "));
  t("nenhum texto diz o nome do mecanismo", textos.every((x) => !PALAVRAS_DE_BASTIDOR.some((p) => palavra(p).test(x))));
  t("quem pode ser: fontes que existem no elenco", QUEM_PODE_SER.fontes.every((f) => ["espinha", "chefe", "mestre", "doArco", "recorrente"].includes(f)) && !QUEM_PODE_SER.fontes.includes("espinha") && !QUEM_PODE_SER.fontes.includes("chefe"));

  /* A FICHA É A DO CONVITE. `fichaDeCompanheiro` (App.jsx) monta o
     companheiro convidado com números literais; esta tabela é o espelho
     deles. Se um dos dois mudar sozinho, aqui fica vermelho. */
  const corpo = APP.slice(APP.indexOf("const fichaDeCompanheiro = (nome, p) =>"), APP.indexOf("const notaDoRecrutamento"));
  const nv = corpo.match(/const nivelC = Math\.max\((\d+), \(\(p && p\.nivel\) \|\| 1\) - (\d+)\);/);
  const pv = corpo.match(/const vidaMaxC = (\d+) \+ \(nivelC - 1\) \* (\d+);/);
  t("o App ainda monta o convidado em fichaDeCompanheiro", corpo.length > 100 && !!nv && !!pv);
  t("o nível: herói menos dois, nunca abaixo de um — os mesmos do convite",
    !!nv && Number(nv[1]) === FICHA_DO_COMPANHEIRO.nivelMinimo && Number(nv[2]) === FICHA_DO_COMPANHEIRO.nivelAbaixoDoHeroi);
  t("o PV: base e por nível — os mesmos do convite",
    !!pv && Number(pv[1]) === FICHA_DO_COMPANHEIRO.vidaBase && Number(pv[2]) === FICHA_DO_COMPANHEIRO.vidaPorNivel);
  t("e a porta é Uma Vida, e só ela", PORTA_DO_COMPANHEIRO.modos.length === 1 && PORTA_DO_COMPANHEIRO.modos[0] === "historia" && MODOS.some((m) => m.id === "historia"));
}

/* ============================================================ */
sec("2. a porta");
{
  const a = R0.ab.abertura;
  const ok_ = { modo: "historia", capitulo: false, grupo: [], abertura: a };
  t("Uma Vida, campanha nova, grupo vazio, com abertura: sim", podeTerCompanheiro(ok_));
  t("Uma Noite (rapida): não — os pratos foram medidos com o pronto sozinho", !podeTerCompanheiro({ ...ok_, modo: "rapida" }));
  t("Duelo: não — é jogador contra jogador", !podeTerCompanheiro({ ...ok_, modo: "duelo" }));
  t("todo modo que não é historia: não", MODOS.filter((m) => m.id !== "historia").every((m) => !podeTerCompanheiro({ ...ok_, modo: m.id })));
  t("um capítulo novo: não (não é campanha nova)", !podeTerCompanheiro({ ...ok_, capitulo: true }) && !podeTerCompanheiro({ ...ok_, capitulo: { forma: "depois" } }));
  t("a sala de dois (o outro jogador já no grupo): não", !podeTerCompanheiro({ ...ok_, grupo: [{ nome: "Ana", deJogador: true }] }));
  t("uma invocação no grupo não ocupa o lugar", podeTerCompanheiro({ ...ok_, grupo: [{ nome: "Lobo Espiritual", invocada: true }] }));
  t("sem abertura, ou abertura de save antigo: não", !podeTerCompanheiro({ ...ok_, abertura: null }) && !podeTerCompanheiro({ ...ok_, abertura: garantirAbertura(null) }) && !podeTerCompanheiro({ ...ok_, abertura: { legado: true } }));
  t("modo ausente não é Uma Vida por omissão (quem chama diz o modo)", !podeTerCompanheiro({ ...ok_, modo: undefined }));
  let lixo = true;
  for (const x of [null, undefined, {}, [], "historia", 0, { modo: "historia" }]) { try { if (podeTerCompanheiro(x)) lixo = false; } catch { lixo = false; } }
  t("lixo (null, {}, [], texto, número): não, e sem erro", lixo);
}

/* ============================================================ */
sec("3. quem, por semente");
{
  t("o mundo de prova tem companheiro", !!R0.ci && !!R0.ci.nome);
  const de_novo = montar(W0, { antecedente: "Soldado Reformado" });
  t("a mesma semente dá o mesmo companheiro, ficha a ficha", JSON.stringify(de_novo.ci) === JSON.stringify(R0.ci));
  const outro = montar(MUNDOS[5], { antecedente: "Soldado Reformado" });
  t("outro mundo, outra pessoa", !!outro.ci && outro.ci.nome !== R0.ci.nome);

  /* a varredura: mundos × estruturas × antecedentes */
  const ests = Object.keys(ESTRUTURAS);
  let n = 0, com = 0, doElenco = 0, procurado = 0, fonteBoa = 0, foraDaPartida = 0, podiaFora = 0, classeBoa = 0, igualAoHeroi = 0, cura = 0, numerosBons = 0, hostil = 0, determinado = 0;
  const porAnt = {};
  const heróis = ["Guerreiro", "Mago", "Ladino", "Caçador", "Clérigo"];
  MUNDOS.forEach((w, wi) => {
    ests.forEach((estrutura, ei) => {
      const ant = ANTECEDENTES[(wi + ei) % ANTECEDENTES.length];
      const classe = heróis[(wi + ei) % heróis.length];
      const r = montar(w, { estrutura, antecedente: ei % 2 ? ant.nome : ant.id, heroi: { nome: "Brann", nivel: 1 + (ei % 3), classe } });
      if (!r.ab) return;
      n++;
      if (!r.ci) return;
      com++;
      const el = elencoDoMundo(w.semente, w.mapa, { genero: w.genero, molde: w.molde, espinha: r.espinha, guildas: w.guildas });
      const p = el.pessoas.find((x) => x.nome === r.ci.nome);
      if (p) doElenco++;
      if (p && QUEM_PODE_SER.fontes.includes(p.fonte) && !p.morto) fonteBoa++;
      if (p && QUEM_PODE_SER.propositosDeFora.includes(indoleDe(w.semente, { nome: p.nome }).proposito)) hostil++;
      const a = r.ab.abertura;
      const marcos = (r.espinha.atos || []).flatMap((x) => x.marcos || []);
      const nomes = [a.pista.nome, a.alvo.quem, ...marcos.flatMap((m) => [m.quem, m.alvo])].filter(Boolean);
      if (nomes.some((x) => norm(x) === norm(r.ci.nome) || mesmaPessoa(x, r.ci.nome))) procurado++;
      const haFora = el.pessoas.some((x) => QUEM_PODE_SER.fontes.includes(x.fonte) && norm(x.cidade) !== norm(w.cidade));
      if (haFora) { podiaFora++; if (p && norm(p.cidade) !== norm(w.cidade)) foraDaPartida++; }
      const lig = LIGACOES_AO_PASSADO.find((l) => l.id === r.ci.ligacao);
      if (lig && lig.classes.includes(r.ci.classe) && !CURANDEIROS_DE_FORA.includes(r.ci.classe)) classeBoa++;
      if (r.ci.classe === classe && lig.classes.some((c) => c !== classe)) igualAoHeroi++;
      if (r.ci.comp.habilidades.some((h) => ehCuraDeGrupo(h))) cura++;
      const nivel = Math.max(FICHA_DO_COMPANHEIRO.nivelMinimo, (1 + (ei % 3)) - FICHA_DO_COMPANHEIRO.nivelAbaixoDoHeroi);
      const marcosDoVinculo = ganharVinculo({ vidaMax: FICHA_DO_COMPANHEIRO.vidaBase + (nivel - 1) * FICHA_DO_COMPANHEIRO.vidaPorNivel, vida: 1, vinculo: VINCULO_INICIAL, marcos: [] }, lig.vinculo - VINCULO_INICIAL).membro;
      if (r.ci.comp.nivel === nivel && r.ci.comp.vidaMax === marcosDoVinculo.vidaMax && r.ci.comp.vida === r.ci.comp.vidaMax && r.ci.comp.vinculo === lig.vinculo) numerosBons++;
      const lido = ei % 2 ? ant.id : ant.nome;
      const r2 = montar(w, { estrutura, antecedente: lido, heroi: { nome: "Brann", nivel: 1 + (ei % 3), classe } });
      if (r2.ci && r2.ci.ligacao === r.ci.ligacao && r2.ci.nome === r.ci.nome) determinado++;
      (porAnt[ant.id] = porAnt[ant.id] || []).push(r.ci.ligacao);
    });
  });
  console.log(`      ${n} aberturas, ${com} com companheiro`);
  t(`toda campanha nova com abertura tem companheiro (${com} de ${n})`, n > 50 && com === n);
  t("ele é sempre do elenco do mundo — nunca gente nova", doElenco === com);
  t("de uma fonte que vive no mundo (do arco ou recorrente), vivo", fonteBoa === com);
  t("nunca com propósito hostil", hostil === 0);
  t("nunca alguém que a história procura (a pista, o alvo, a gente da espinha)", procurado === 0);
  t(`vem de outra cidade sempre que o elenco a tem (${foraDaPartida} de ${podiaFora})`, podiaFora > 0 && foraDaPartida === podiaFora);
  t("a classe é da ligação, e nunca uma das que curam", classeBoa === com);
  t("nem a mesma do herói, quando a ligação tem outra", igualAoHeroi === 0);
  t("e nenhuma habilidade de cura na ficha dele", cura === 0);
  t("o nível, o PV e o vínculo são os da tabela (o convite + os marcos já passados)", numerosBons === com);
  t("o antecedente lido por id ou por nome dá o mesmo companheiro", determinado === com);

  /* O PASSADO PUXA A LIGAÇÃO */
  const conta = (ant) => {
    const out = {};
    for (let i = 0; i < 120; i++) {
      const w = MUNDOS[i % MUNDOS.length];
      const r = montar(w, { estrutura: Object.keys(ESTRUTURAS)[i % 8], antecedente: ant, heroi: { nome: `H${i}`, nivel: 1, classe: "Mago" } });
      if (r.ci) out[r.ci.ligacao] = (out[r.ci.ligacao] || 0) + 1;
    }
    return out;
  };
  const sold = conta("soldado"), orf = conta("orfao"), eru = conta("erudito"), sem = conta("");
  const mais = (o) => Object.entries(o).sort((a, b) => b[1] - a[1])[0][0];
  console.log(`      soldado ${JSON.stringify(sold)} · órfão ${JSON.stringify(orf)} · erudito ${JSON.stringify(eru)} · sem ${JSON.stringify(sem)}`);
  t("o soldado traz, mais que tudo, quem serviu com ele", mais(sold) === "armas");
  t("o erudito, quem lhe ensinou o ofício", mais(eru) === "oficio");
  t("o órfão nunca traz o sangue que não tem", !orf.sangue);
  t("sem antecedente, todas as ligações aparecem", LIGACOES_AO_PASSADO.every((l) => sem[l.id] > 0));

  let lixo = true;
  for (const x of [null, undefined, {}, { semente: "x" }, { semente: "x", mapa: { cidades: [] } }, { semente: "x", mapa: { cidades: "nao" } }]) {
    try { if (companheiroInicial(x) !== null) lixo = false; } catch { lixo = false; }
  }
  t("sem mundo (null, {}, mapa vazio ou torto): null, e sem erro", lixo);
}

/* ============================================================ */
sec("4. o laço já feito");
{
  const ci = R0.ci;
  const npc = ci.npc;
  const lig = LIGACOES_AO_PASSADO.find((l) => l.id === ci.ligacao);
  t("no registo desde antes do dia 1 (conhecidoEm 0: 'antes do registro de dias')", npc.conhecidoEm === 0);
  const l = garantirLaco(npc.laco);
  t("com o laço da ligação, na força dela, de pé", !!l && l.tipo === lig.laco && l.forca === lig.forca && !l.rompido);
  t("e o laço é de ANTES do dia 1 (desde negativo, que garantirLaco guarda)", l.desde < 0 && lacoDeAntes(npc));
  t("a relação, o género e a nota do passado", npc.relacao === lig.relacao && ["homem", "mulher"].includes(npc.genero) && npc.notas.includes(ci.quem));
  t("o retrato é o mesmo no grupo e no registo (a mesma semente)", npc.semente === ci.comp.semente);
  t("ninguém mais nasce 'de antes': uma ficha comum, ou com laço do jogo, não é", !lacoDeAntes(criarNPC("Ana", {})) && !lacoDeAntes(criarNPC("Ana", { laco: { tipo: "amizade", forca: 3, desde: 4 } })) && !lacoDeAntes(criarNPC("Ana", { laco: { tipo: "amizade" } })) && !lacoDeAntes(null));
  t("rompido, continua de antes (conhecer não se desfaz)", lacoDeAntes({ laco: { ...npc.laco, rompido: true } }));

  /* O CONVÍVIO: a conta do App (`convivioCom`), campo a campo — e o App
     ainda a faz assim (o texto é lido abaixo) */
  const comoOApp = (n, hoje) => {
    const lx = garantirLaco(n.laco);
    return {
      dias: Math.max(0, hoje - (n.conhecidoEm != null ? n.conhecidoEm : hoje)),
      forcaDoLaco: (lx && !lx.rompido && lx.forca) || 0,
      meDeve: !!n.meDeve, euDevo: /d[íi]vida|devo|prometi/i.test(String(n.notas || "")) || (lx && lx.tipo === "divida"),
      sabeDeMim: !!n.sabeDeMim, euSeiDela: !!n.euSeiDela, euGanhei: !!n.euGanhei,
    };
  };
  const cc = APP.slice(APP.indexOf("const convivioCom = (nome) =>"), APP.indexOf("const vereditoDoConvite"));
  /* 01/10: a fiação do frontend trocou a conta à mão por convivioDaFicha —
     o texto que esta asserção conferia (dias/laço/dívida escritos à mão no
     App) deixou de existir por desenho, não por regressão. O que prova que
     o resultado não mudou é a comparação `comoOApp` × `convivioDaFicha`
     logo abaixo (21/21 para quem não é de antes); aqui só resta confirmar
     que a conta saiu mesmo de lá. */
  t("o App agora lê o convívio por convivioDaFicha (a conta saiu de lá)", cc.includes("convivioDaFicha(n, diaRef.current)"));
  const fichas = [
    criarNPC("A", {}), criarNPC("B", { conhecidoEm: 3 }), criarNPC("C", { conhecidoEm: 1, laco: { tipo: "divida", forca: 2, desde: 5 } }),
    { ...criarNPC("D", { conhecidoEm: 9, notas: "prometi voltar" }), meDeve: true, euGanhei: true },
    criarNPC("E", { laco: { tipo: "amor", forca: 3, desde: 2, rompido: true } }), {}, { conhecidoEm: null },
  ];
  let iguais = 0;
  for (const f of fichas) for (const hoje of [1, 5, 40]) {
    const a = garantirConvivio(comoOApp(f, hoje)), b = garantirConvivio(convivioDaFicha(f, hoje));
    if (JSON.stringify(a) === JSON.stringify(b) && b.deAntes === false) iguais++;
  }
  t(`para quem não é de antes, convivioDaFicha É a conta do App (${iguais} de ${fichas.length * 3})`, iguais === fichas.length * 3);
  t("convivioDaFicha(null) não estoura", (() => { try { return convivioDaFicha(null, 1).dias === 0; } catch { return false; } })());

  /* O CONVITE: se ele sair do grupo e o herói o chamar de volta no dia 1 */
  const cv = convivioDaFicha(npc, 1);
  t("o convívio dele diz que se conhecem de antes", cv.deAntes === true && garantirConvivio(cv).deAntes === true);
  const v = pesarConvite(indoleDe(W0.semente, { nome: ci.nome }), { convivio: cv, fama: 0 });
  t("o convite não lhe diz 'vocês se conheceram ontem'", !v.porques.some((x) => /ontem/.test(x)) && v.porques.includes("vocês se conhecem de antes disto tudo"));
  let aceitaDeAntes = 0, aceitaEstranho = 0, total = 0, pesaMais = 0;
  MUNDOS.forEach((w, wi) => {
    for (const ant of ["soldado", "erudito", "ladrao", "orfao", "nobre_caido"]) {
      const r = montar(w, { antecedente: ant, heroi: { nome: "Brann", nivel: 1, classe: wi % 2 ? "Mago" : "Guerreiro" } });
      if (!r.ci) continue;
      total++;
      const ind = indoleDe(w.semente, { nome: r.ci.nome });
      const deAntes = pesarConvite(ind, { convivio: convivioDaFicha(r.ci.npc, 1), fama: 0 });
      const estranho = pesarConvite(ind, { convivio: convivioDaFicha(criarNPC(r.ci.nome, { conhecidoEm: 1 }), 1), fama: 0 });
      if (deAntes.resposta === "aceita") aceitaDeAntes++;
      if (estranho.resposta === "aceita") aceitaEstranho++;
      const ordem = { recusa: 0, exige: 1, aceita: 2 };
      if (ordem[deAntes.resposta] >= ordem[estranho.resposta]) pesaMais++;
    }
  });
  console.log(`      no dia 1, sem fama: aceitam ${aceitaDeAntes} de ${total} conhecidos de antes; ${aceitaEstranho} de ${total} estranhos`);
  t("no dia 1, quem é de antes aceita voltar na grande maioria (os 13 dias de convívio já foram vividos)", total > 50 && aceitaDeAntes >= total * 0.8);
  t("e nunca pesa menos que a mesma pessoa conhecida ontem", pesaMais === total);
  t("quem foi conhecido ontem continua a ouvir 'ontem' (regressão zero)",
    pesarConvite(indoleDe("w", { nome: "Zed" }), { convivio: { dias: 1 }, fama: 0 }).porques.includes("vocês se conheceram ontem"));

  /* A PROMOÇÃO: ele já é do elenco — nunca é candidato, e nunca sai */
  const j = juntarCompanheiroInicial({ personagem: { nome: "Brann", grupo: [] }, npcs: {}, elenco: null }, ci, 1);
  t("os dias vistos: visto no dia em que a campanha começa", diasVistosDe(j.elenco, ci.nome) === 1 && j.elenco.vistos[ci.nome][0] === 1);
  const ctxEl = { genero: W0.genero, molde: W0.molde, espinha: R0.espinha, guildas: W0.guildas };
  const noElenco = (est) => elencoDoMundo(W0.semente, W0.mapa, { ...ctxEl, estado: est, npcs: j.npcs }).pessoas.some((p) => p.nome === ci.nome);
  t("ele está no elenco do mundo desde o primeiro dia", noElenco(j.elenco));
  /* o registo cheio de gente investida, para a promoção ter quem subir e
     precisar de alguém que saia */
  let npcs = { ...j.npcs };
  for (let i = 0; i < 30; i++) npcs[`Visitante ${i}`] = criarNPC(`Visitante ${i}`, { conhecidoEm: 1, laco: { tipo: "amizade", forca: 1, desde: 1 } });
  let est = j.elenco, saiu = false, subiu = false;
  for (let dia = 2; dia <= 30; dia++) {
    const r = promoverNoDia(W0.semente, W0.mapa, ctxEl, est, { npcs, grupo: j.personagem.grupo, dia });
    est = r.estado;
    if (r.saidos.some((s) => s.nome === ci.nome)) saiu = true;
    if (r.promovidos.includes(ci.nome)) subiu = true;
  }
  t("trinta dias de promoções: ele nunca sai do elenco (anda no grupo, tem laço)", !saiu && noElenco(est) && Object.keys(est.promovidos).length > 0);
  t("e nunca é 'promovido' — já era do elenco", !subiu);
  /* fora do grupo, o laço continua a guardá-lo */
  let est2 = j.elenco, saiu2 = false;
  for (let dia = 2; dia <= 30; dia++) {
    const r = promoverNoDia(W0.semente, W0.mapa, ctxEl, est2, { npcs, grupo: [], dia });
    est2 = r.estado;
    if (r.saidos.some((s) => s.nome === ci.nome)) saiu2 = true;
  }
  t("e, se deixar o grupo, o laço de antes ainda o segura no elenco", !saiu2);
}

/* ============================================================ */
sec("5. sem campo novo no save, e a imutabilidade");
{
  const ci = R0.ci;
  const heroi = congelar({ nome: "Brann", nivel: 1, classe: "Guerreiro", grupo: [], moedas: 10 });
  const npcs0 = congelar({});
  const el0 = congelar(garantirElencoDoSave(null));
  const ciCongelado = congelar(JSON.parse(JSON.stringify(ci)));
  let j = null, erro = "";
  try { j = juntarCompanheiroInicial({ personagem: heroi, npcs: npcs0, elenco: el0 }, ciCongelado, 1); } catch (e) { erro = String(e && e.message); }
  t("junta sem mexer no que recebeu (tudo congelado)", !!j && !erro, erro);
  t("o herói novo tem as MESMAS chaves de antes", JSON.stringify(Object.keys(j.personagem).sort()) === JSON.stringify(Object.keys(heroi).sort()));
  t("e o grupo ganhou um, o próprio", j.personagem.grupo.length === 1 && j.personagem.grupo[0].nome === ci.nome && heroi.grupo.length === 0);

  /* o membro do grupo: as chaves que um companheiro CONVIDADO tem depois de
     um load (a ficha do App + migrarPersonagem) — nenhuma a mais */
  const convidado = { nome: "Ana", conceito: "", nivel: 1, vida: 10, vidaMax: 10, descricao: "", habilidades: [], semente: "npc|Ana|", vinculo: VINCULO_INICIAL, marcos: [] };
  const chavesConvidado = new Set(Object.keys(migrarPersonagem({ nome: "X", grupo: [convidado] }).grupo[0]));
  const sobra = Object.keys(j.personagem.grupo[0]).filter((k) => !chavesConvidado.has(k));
  t("o membro do grupo não tem chave que o convidado não tenha", sobra.length === 0, sobra.join(", "));
  const migrado = migrarPersonagem(JSON.parse(JSON.stringify(j.personagem))).grupo[0];
  t("e um load (migrarPersonagem) devolve-o como estava", JSON.stringify(migrado) === JSON.stringify(j.personagem.grupo[0]));
  t("a ficha passa por garantirFichaCompanheiro sem mudar", JSON.stringify(garantirFichaCompanheiro(j.personagem.grupo[0])) === JSON.stringify(j.personagem.grupo[0]));

  const chavesNPC = new Set(Object.keys(criarNPC("Ana", { conhecidoEm: 1 })));
  const sobraNPC = Object.keys(j.npcs[ci.nome]).filter((k) => !chavesNPC.has(k));
  t("a ficha do registo só tem as chaves de criarNPC", sobraNPC.length === 0, sobraNPC.join(", "));
  t("o laço sai do registo pelo garantirLaco sem perder nada", JSON.stringify(garantirLaco(j.npcs[ci.nome].laco)) === JSON.stringify(j.npcs[ci.nome].laco));
  t("o campo do elenco é o de sempre (garantirElencoDoSave o devolve igual)", JSON.stringify(garantirElencoDoSave(j.elenco)) === JSON.stringify(j.elenco) && JSON.stringify(Object.keys(j.elenco).sort()) === JSON.stringify(Object.keys(el0).sort()));
  t("nada novo no retrato do save: o App não guarda 'companheiro' à parte",
    (() => { const r = APP.slice(APP.indexOf("const retratoDoJogo = () =>"), APP.indexOf("const soltosDoTurno")); return r.length > 200 && !/companheiro/i.test(r); })());

  /* a segunda vez não duplica; nome que já existe não é reescrito */
  const j2 = juntarCompanheiroInicial(j, ci, 1);
  t("juntar duas vezes não duplica", j2.personagem.grupo.length === 1 && Object.keys(j2.npcs).length === 1 && diasVistosDe(j2.elenco, ci.nome) === 1);
  const outro = criarNPC(ci.nome, { papel: "outra pessoa", conhecidoEm: 4 });
  const j3 = juntarCompanheiroInicial({ personagem: heroi, npcs: { [ci.nome]: outro }, elenco: null }, ci, 1);
  t("um nome que já está no registo é outra pessoa: não se reescreve", j3.npcs[ci.nome] === outro && j3.personagem.grupo.length === 0);
  const cheio = { ...heroi, grupo: [1, 2, 3, 4].map((i) => ({ nome: `C${i}` })) };
  t("grupo cheio: não entra", juntarCompanheiroInicial({ personagem: cheio, npcs: {}, elenco: null }, ci, 1).personagem.grupo.length === 4);
  let lixo = true;
  for (const [e, c] of [[null, ci], [{}, null], [undefined, {}], [{ personagem: null, npcs: null, elenco: null }, ci], [{ personagem: heroi }, { nome: "", comp: {}, npc: {} }]]) {
    try {
      const r = juntarCompanheiroInicial(e, c, 1);
      if (!r || !("personagem" in r) || !("npcs" in r) || !r.elenco) lixo = false;
    } catch { lixo = false; }
  }
  t("lixo de todos os lados: devolve o que veio, sem erro", lixo);
  const jn = juntarCompanheiroInicial({ personagem: { nome: "X", grupo: null }, npcs: null, elenco: null }, ci, 1);
  t("grupo null e registo null: entra na mesma, sem erro", jn.personagem.grupo.length === 1 && !!jn.npcs[ci.nome]);
}

/* ============================================================ */
sec("6. a abertura");
{
  const a = R0.ab.abertura;
  const ci = R0.ci;
  const antes = pedidoDaAbertura(a, { habilidades: ["Golpe"] });
  const depois = pedidoDaAbertura(a, { habilidades: ["Golpe"], companheiro: ci });
  t("sem companheiro, o pedido é o de sempre (null, ausente, lixo)",
    antes === pedidoDaAbertura(a, { habilidades: ["Golpe"], companheiro: null }) && antes === pedidoDaAbertura(a, { habilidades: ["Golpe"], companheiro: { nome: "Só nome" } }) && !antes.includes("não chegou só"));
  t("pedidoDaAbertura(a, null) não estoura", (() => { try { return pedidoDaAbertura(a, null).length > 100; } catch { return false; } })());
  const parte2 = depois.slice(depois.indexOf("2) ONDE O HERÓI ESTÁ"), depois.indexOf("3) A PEQUENA HISTÓRIA"));
  t("com ele, o herói não chega só — na parte 2, ao lado dele", parte2.includes("não chegou só") && parte2.includes(ci.nome) && parte2.includes(ci.quem) && parte2.includes(ci.porque));
  t("a razão é dita como a mesma do herói", parte2.includes(`a razão que o trouxe é também ${ci.dele}`));
  t("o resto do pedido não muda", depois.replace(ci.linha, "") === antes);
  t("sem primeira pessoa fora das aspas", !PRIMEIRA.test(semFalas(depois)));
  t("nem palavra de bastidor na frase dele", !PALAVRAS_DE_BASTIDOR.some((p) => palavra(p).test(ci.linha)));
  const custo = depois.length - antes.length;
  console.log(`      a frase custa ${custo} caracteres, uma vez por campanha (o pedido: ${antes.length} → ${depois.length})`);
  t("a frase custa pouco e é cobrada uma vez (≤ 320 caracteres, só no pedido da abertura)", custo > 0 && custo <= 320);
  t("linhaDoCompanheiro de lixo é vazia", [null, undefined, {}, "x", { nome: "A", quem: "B" }].every((x) => linhaDoCompanheiro(x) === ""));

  /* ele não é a pista: o nome dele não fecha o primeiro passo */
  t("o nome dele não é 'só um nome' da abertura", aindaSoUmNome(a, ci.nome, { lugar: "outro lugar", missoes: [R0.ab.missao] }) === false);
  const j = juntarCompanheiroInicial({ personagem: { nome: "Brann", grupo: [] }, npcs: {}, elenco: null }, ci, 1);
  const r = conferir([R0.ab.missao], { npcs: j.npcs, lugarAtual: { nome: a.pista.local }, cidadeAtual: a.cidade, dia: 1 });
  t("estar no lugar da pista só com ele no registo não cumpre o primeiro passo", !r.avancos.length && !r.missoes[0].etapas[0].feito);

  /* a varredura: em todos os mundos, a frase entra e fala do herói */
  let n = 0, falhas = [];
  MUNDOS.forEach((w, wi) => {
    for (const estrutura of Object.keys(ESTRUTURAS)) {
      const rr = montar(w, { estrutura, antecedente: ANTECEDENTES[(wi + n) % ANTECEDENTES.length].id });
      if (!rr.ci) continue;
      n++;
      const p = pedidoDaAbertura(rr.ab.abertura, { habilidades: ["Golpe"], companheiro: rr.ci });
      if (!p.includes(rr.ci.linha)) falhas.push(`${w.genero}/${w.molde.id}/${estrutura}: sem a frase`);
      if (PRIMEIRA.test(semFalas(p))) falhas.push(`${w.genero}/${w.molde.id}/${estrutura}: primeira pessoa`);
    }
  });
  t(`${n} aberturas com companheiro: a frase entra, e ninguém fala por "eu"`, n > 50 && !falhas.length, falhas.slice(0, 3).join(" | "));
}

/* ============================================================ */
sec("7. a régua — as primeiras lutas, sozinho e com ele");
{
  /* A RÉGUA DE UMA VIDA (`regua-combate.mjs`), a mesma `simularCombate`:
     os três heróis do roster que mais diferem (a Muralha, a Chama, a
     Sombra) nos níveis 1 a 3, contra as três lutas que a estrada dá
     (`rolarEncontro`: um bando de fracos, dois comuns, um competente um
     nível acima). O companheiro entra com a ficha DELE: o nível e o PV da
     tabela, o PV dos marcos já passados — o vigor da régua é escolhido
     para `pvEsperadoJogador` dar exatamente esse PV.

     TRIVIAL é a faixa que o orçamento descreve como "custa recursos, não
     custa medo": o grupo ganha quase sempre E o herói quase nunca cai.
     O número mora aqui, e a régua de cima diz porque é este. */
  const TRIVIAL = { vitoria: 0.98, quedaDoHeroi: 0.05 };
  const N = 120;
  const HEROIS = ["muralha", "chama", "sombra"];
  const heroiDe = (id, nivel) => { const p = PRONTOS.find((x) => x.id === id); return { nome: "Herói", classe: p.classe, nivel, vigor: p.atributos.vigor, atributos: { ...p.atributos }, arma: p.arma, armadura: p.armadura, escudo: p.escudo || null }; };
  const lutas = (L) => [{ quantos: 3, ameaca: "fraco", nivel: L }, { quantos: 2, ameaca: "comum", nivel: L }, { quantos: 1, ameaca: "competente", nivel: L + 1 }];
  const vigorPara = (nivel, pv) => (pv - 10 - (nivel - 1) * 6) / (1 + nivel * 0.3);
  const compDaRegua = (classe, nivel, vidaMax) => ({ nome: "Companheiro", classe, nivel, vigor: vigorPara(nivel, vidaMax) });
  const bateria = (L, comp) => {
    let v = 0, q = 0, k = 0;
    for (const h of HEROIS) for (const lu of lutas(L)) {
      const cen = { id: "ci", heroi: heroiDe(h, L), grupo: comp ? [comp] : [], inimigos: { ...lu, base: "Adversário" }, tetoDeRodadas: 20 };
      for (let i = 0; i < N; i++) { const c = simularCombate(cen, `ci|${i}`); v += c.vitoria; q += c.quedaDoHeroi; k++; }
    }
    return { vitoria: v / k, quedaDoHeroi: q / k };
  };
  const pct = (x) => `${(100 * x).toFixed(1)}%`;
  const ehTrivial = (m) => m.vitoria >= TRIVIAL.vitoria && m.quedaDoHeroi <= TRIVIAL.quedaDoHeroi;

  /* as fichas reais: o que o módulo dá a um herói de nível 1 a 3 */
  const fichas = new Map();
  for (const lig of LIGACOES_AO_PASSADO) for (const classe of lig.classes) {
    for (const L of [1, 2, 3]) {
      const nivel = Math.max(FICHA_DO_COMPANHEIRO.nivelMinimo, L - FICHA_DO_COMPANHEIRO.nivelAbaixoDoHeroi);
      const vidaMax = ganharVinculo({ vidaMax: FICHA_DO_COMPANHEIRO.vidaBase + (nivel - 1) * FICHA_DO_COMPANHEIRO.vidaPorNivel, vida: 1, vinculo: VINCULO_INICIAL, marcos: [] }, lig.vinculo - VINCULO_INICIAL).membro.vidaMax;
      fichas.set(`${classe}|${nivel}|${vidaMax}`, { classe, nivel, vidaMax });
    }
  }
  t("o PV da régua é o PV da ficha (o vigor escolhido bate)", [...fichas.values()].every((f) => pvEsperadoJogador(f.nivel, vigorPara(f.nivel, f.vidaMax)) === f.vidaMax));
  t("a ficha real confere: R0 tem o nível e o PV de uma das fichas medidas", fichas.has(`${R0.ci.classe}|${R0.ci.comp.nivel}|${R0.ci.comp.vidaMax}`));

  /* ANTES E DEPOIS, por nível, com o companheiro mais comum (o Guerreiro
     das armas) */
  const armas = LIGACOES_AO_PASSADO.find((l) => l.id === "armas");
  const pvArmas = [...fichas.values()].find((f) => f.classe === "Guerreiro" && f.vidaMax === ganharVinculo({ vidaMax: 10, vida: 1, vinculo: VINCULO_INICIAL, marcos: [] }, armas.vinculo - VINCULO_INICIAL).membro.vidaMax);
  let ajuda = true;
  for (const L of [1, 2, 3]) {
    const so = bateria(L, null), duo = bateria(L, compDaRegua("Guerreiro", 1, pvArmas.vidaMax));
    console.log(`      nível ${L}: sozinho ganha ${pct(so.vitoria)} e cai ${pct(so.quedaDoHeroi)} · com ele ganha ${pct(duo.vitoria)} e cai ${pct(duo.quedaDoHeroi)}`);
    if (!(duo.vitoria > so.vitoria && duo.quedaDoHeroi < so.quedaDoHeroi)) ajuda = false;
  }
  t("ele conta: com ele o herói ganha mais e cai menos, nos três níveis", ajuda);

  /* A CATRACA: nenhuma ficha possível torna as primeiras lutas triviais.
     Mede-se no nível 3, onde a régua mostrou que a luta é MAIS fácil para
     o grupo (a vitória sobe e a queda desce com o nível em todas as
     classes) — se não é trivial ali, não é antes. */
  const piores = [];
  for (const f of fichas.values()) {
    const m = bateria(3, compDaRegua(f.classe, f.nivel, f.vidaMax));
    piores.push({ ...f, ...m });
  }
  piores.sort((a, b) => b.vitoria - a.vitoria);
  console.log(`      a ficha mais forte no nível 3: ${piores[0].classe} (${piores[0].vidaMax} PV) — ganha ${pct(piores[0].vitoria)}, o herói cai ${pct(piores[0].quedaDoHeroi)}`);
  const triviais = piores.filter(ehTrivial);
  t(`nenhuma das ${piores.length} fichas possíveis torna as primeiras lutas triviais`, triviais.length === 0, triviais.map((x) => `${x.classe}/${x.vidaMax}`).join(", "));
  /* e o porquê da exclusão, medido: um clérigo com o mesmo PV seria */
  const clerigo = bateria(3, compDaRegua("Clérigo", 1, pvArmas.vidaMax));
  console.log(`      (o clérigo que ficou de fora, no nível 3: ganha ${pct(clerigo.vitoria)}, o herói cai ${pct(clerigo.quedaDoHeroi)})`);
  t("o curandeiro que a tabela tirou seria trivial — a exclusão tem número", ehTrivial(clerigo));

  /* O ORÇAMENTO JÁ O COBRA: o encontro que o sistema monta (`quantosPara`,
     a mesma porta da emboscada) conta o companheiro (VALOR_COMPANHEIRO) e
     traz mais gente. Com ele, a luta montada não fica mais fácil que a do
     herói sozinho — por isso o orçamento não muda. */
  let cobra = true;
  const linhas = [];
  for (const L of [1, 2, 3]) {
    const modelo = completarInimigo({ nome: "Adversário", ameaca: "comum", nivel: L }, L);
    const nSo = quantosPara(modelo, { nivel: L, grupo: [] }, "medio");
    const nDuo = quantosPara(modelo, { nivel: L, grupo: [{ nome: "Companheiro", vida: pvArmas.vidaMax }] }, "medio");
    let qSo = 0, qDuo = 0, k = 0;
    for (const h of HEROIS) {
      const base = { id: "ci", heroi: heroiDe(h, L), grupo: [], inimigos: { quantos: nSo, ameaca: "comum", nivel: L, base: "Adversário" }, tetoDeRodadas: 20 };
      const duo = { ...base, grupo: [compDaRegua("Guerreiro", 1, pvArmas.vidaMax)], inimigos: { ...base.inimigos, quantos: nDuo } };
      for (let i = 0; i < N; i++) { qSo += simularCombate(base, `ci|${i}`).quedaDoHeroi; qDuo += simularCombate(duo, `ci|${i}`).quedaDoHeroi; k++; }
    }
    linhas.push(`nível ${L}: ${nSo} comum(ns) sozinho, ${nDuo} com ele — o herói cai ${pct(qSo / k)} e ${pct(qDuo / k)}`);
    if (!(nDuo > nSo && qDuo >= qSo)) cobra = false;
  }
  for (const l of linhas) console.log(`      ${l}`);
  t(`o orçamento já o cobra (cada companheiro vale ${VALOR_COMPANHEIRO}): a luta montada traz mais gente e não fica mais fácil`, cobra);
}

/* ============================================================ */
sec("8. o golpe final do companheiro (MM3b), desde a primeira luta");
{
  const comp = R0.ci.comp;
  const heroi = { nome: "Brann", vida: 20, vidaMax: 20 };
  let achou = null;
  for (let i = 0; i < 60 && !achou; i++) {
    comSorteTravada(`gf|${i}`, () => {
      const lobo = { ...completarInimigo({ nome: "Lobo", ameaca: "fraco", nivel: 1 }, 1), vida: 1, derrotado: false, condicoes: [] };
      const acoes = turnoDosCompanheiros({ grupo: [comp], inimigos: [lobo], jogador: heroi, jogadorNome: heroi.nome, rodada: 3 });
      const golpes = acoes.filter((a) => (a.tipo === "ataque" || a.tipo === "habilidade") && a.r).map((a) => ({ nome: a.alvoNome, r: a.r, autor: a.companheiro }));
      const q = quedasComEscolhaNaRodada(golpes, [lobo]);
      if (q.length) achou = q[0];
    });
  }
  t("na primeira luta, o golpe dele que derruba sobe ao cartão do golpe final", !!achou && achou.autor === comp.nome && achou.nome === "Lobo");
  t("sem condição de vínculo, de dias ou de marco: basta andar no grupo e estar de pé", (comp.vida || 0) > 0 && !comp.invocada && !comp.deJogador);
}

/* ============================================================ */
sec("9. a fiação no App.jsx (por texto)");
{
  /* A mão da tela liga o módulo DEPOIS desta etapa (é do `frontend`).
     Enquanto o App não o importa, as provas desta secção ficam PENDENTES —
     contadas e ditas, nunca verdes de mentira. No dia em que o import
     aparecer, deixam de ser pendentes e passam a morder. */
  const importa = /import \{[^}]*\} from "\.\/companheiro-inicial\.js";/.test(APP);
  const prova = (nome, cond) => {
    if (!importa) { pend++; console.log("  ..  pendente (fiação do frontend): " + nome); return; }
    t(nome, cond);
  };
  const ini = APP.indexOf("const iniciar = (pers) =>");
  const cont = APP.indexOf("const continuar = (comResumo");
  const iniciar = ini >= 0 && cont > ini ? APP.slice(ini, cont) : "";
  const fimCont = APP.indexOf("\n  };\n", cont);
  const continuar = cont >= 0 ? APP.slice(cont, fimCont > cont ? fimCont : cont + 20000) : "";
  prova("a porta é perguntada em `iniciar`, com o modo, o capítulo, o grupo e a abertura",
    /podeTerCompanheiro\(\{[^}]*modo: modoRef\.current[^}]*\}\)/.test(iniciar) && /capitulo: !!cap/.test(iniciar));
  prova("o companheiro nasce em `iniciar`, depois da abertura (a pista já escolhida)",
    iniciar.indexOf("companheiroInicial(") > iniciar.indexOf("ab = abrirAbertura(") && iniciar.indexOf("ab = abrirAbertura(") > 0);
  prova("entra pelo juntar (grupo, registo e vistos, de uma vez)", /juntarCompanheiroInicial\(/.test(iniciar) && /elencoSaveRef\.current = /.test(iniciar.slice(iniciar.indexOf("juntarCompanheiroInicial("))));
  prova("dentro de calou (nunca custa o turno)", /calou\([^)]*companheiro/i.test(iniciar));
  prova("e o pedido da abertura leva-o", /pedidoDaAbertura\(ab\.abertura, \{[^}]*companheiro/.test(iniciar));
  prova("o load (`continuar`) nunca cria companheiro — save antigo fica como estava", !/companheiroInicial\(|juntarCompanheiroInicial\(/.test(continuar));
  prova("o convite lê o convívio pela mesma conta (convivioDaFicha)", /convivioDaFicha\(/.test(APP.slice(APP.indexOf("const convivioCom = (nome) =>"), APP.indexOf("const vereditoDoConvite"))));
}

/* ============================================================ */
sec("10. as duas fichas e a homónima (3.ª sessão de prova, defeito 3)");
{
  /* mente/mm11-sessao-3.md, "Os defeitos" 3, 7 e 8, e "O custo": a
     companheira de antes era "companheira de armas, Monge" no grupo e
     "vendedor de ervas" no registo (o ofício do elenco), e no M1 a serviçal
     "Iracema" da base de Vau Fincado entrou no registo pelo nome curto. O
     revisor de continuidade (chamada paga, ~2 s antes da narração) via
     contradição sempre que ela falava ou lutava: 5 das 8 chamadas de
     conserto, e duas reescreveram-na "a serviçal da taverna". */
  const J = (x) => JSON.stringify(x);
  const ci = R0.ci;
  const comp = ci.comp;
  const elW0 = elencoDoMundo(W0.semente, W0.mapa, { genero: W0.genero, molde: W0.molde, espinha: R0.espinha, guildas: W0.guildas });
  const pessoa = elW0.pessoas.find((p) => p.nome === ci.nome);
  const encher = (m, v) => m.replace(/\{(\w+)\}/g, (_, k) => v[k]);
  const pn = ci.nome.split(" ")[0];

  /* (1) O OFÍCIO — o registo diz o que o grupo diz */
  t("o papel do registo é o do grupo: a ligação e a classe (PAPEL_NO_REGISTO)",
    ci.npc.papel === encher(PAPEL_NO_REGISTO.papel, { curto: comp.conceito, classe: ci.classe }), ci.npc.papel);
  t("e já não é o ofício do elenco", !!pessoa && ci.npc.papel !== pessoa.papel, pessoa && pessoa.papel);
  t("o registo e o grupo concordam (mesmoPapel com o conceito e com a classe)",
    mesmoPapel(ci.npc.papel, comp.conceito) && mesmoPapel(ci.npc.papel, ci.classe));
  t("o ofício de antes continua a existir, como o que fazia (nas notas, depois do passado)",
    !!pessoa && ci.npc.notas.includes(encher(PAPEL_NO_REGISTO.antes, { oficio: pessoa.papel })) && ci.npc.notas.startsWith(comp.descricao.slice(0, 40)));
  let todos = 0, concordam = 0;
  MUNDOS.forEach((w) => { const r = montar(w, { antecedente: "Soldado Reformado" }); if (!r.ci) return; todos++; if (mesmoPapel(r.ci.npc.papel, r.ci.comp.conceito) && mesmoPapel(r.ci.npc.papel, r.ci.classe)) concordam++; });
  t(`nos ${todos} mundos, o registo e o grupo concordam em todos (${concordam})`, todos > 0 && concordam === todos);

  /* (1b) O PORTÃO lê o grupo. As frases são as da sessão (M12, M13, M20),
     com o nome do companheiro deste mundo. O detector do papel trocado
     lia "O golpe do lobo acerta Iracema Sousa" como "chamou-a de 'golpe
     do lobo acerta'"; para quem anda no grupo só morde um ofício que a
     casa conhece (OFICIOS) e que não é de nenhuma das fichas dela. */
  const reg = { [ci.nome]: ci.npc };
  const golpe = `O golpe do lobo acerta ${ci.nome} em cheio no ombro, e ela cai de joelhos.`;
  const agachada = `— Devia estar ali — diz ${ci.nome}, agachada perto da porta.`;
  const servical = `— Devia estar ali — diz ${ci.nome}, a serviçal da taverna, sem tirar os olhos do chão.`;
  t("M20: o golpe que a acerta não é troca de papel", detectarPapelTrocado(golpe, reg, [comp]).length === 0, J(detectarPapelTrocado(golpe, reg, [comp])));
  t("M12: 'agachada perto da porta' não é troca de papel", detectarPapelTrocado(agachada, reg, [comp]).length === 0);
  t("mas 'a serviçal da taverna' continua a morder (o erro de verdade)", detectarPapelTrocado(servical, reg, [comp]).length === 1);
  /* o save da v9.347 já gravou o ofício do elenco no registo: o portão,
     que lê o grupo todos os turnos, deixa de a ver como outra pessoa sem
     tocar no save */
  /* o papel que a sessão gravou, tal e qual (o ofício do elenco dela) */
  const regAntigo = { [ci.nome]: { ...ci.npc, papel: "vendedor de ervas" } };
  t("save da v9.347 (o ofício do elenco no registo): o golpe não morde", detectarPapelTrocado(golpe, regAntigo, [comp]).length === 0);
  t("save da v9.347: chamá-la pela classe não morde", detectarPapelTrocado(`${ci.nome}, a ${ci.classe.toLowerCase()}, ergue a tocha.`, regAntigo, [comp]).length === 0);
  t("save da v9.347: a serviçal da taverna continua a morder", detectarPapelTrocado(servical, regAntigo, [comp]).length === 1);
  t("quem NÃO anda no grupo é julgado como sempre foi (o aposto morde)",
    detectarPapelTrocado(golpe, regAntigo, []).length === 1 && detectarPapelTrocado(agachada, regAntigo).length === 1);
  const vs = violacoesDoTurno(`${golpe} ${agachada}`, { npcs: regAntigo, comGrupo: [comp], cidadeAtual: W0.cidade, mapa: W0.mapa });
  t("o portão inteiro (violacoesDoTurno, com o comGrupo que o App já passa): nenhum conserto pago", !vs.some((v) => v.id === "papel"), J(vs.map((v) => v.id)));
  t("familiasDoOficio: a serviçal é da taverna, a monge é da fé, 'golpe do lobo acerta' é de nenhuma",
    familiasDoOficio("serviçal da taverna").includes("taverna") && familiasDoOficio("Monge").includes("fe") && familiasDoOficio("golpe do lobo acerta").length === 0);

  /* (2) O NOME CURTO é de quem anda no grupo */
  const homonima = criarNPC(pn, { papel: "serviçal da taverna", local: W0.cidade, conhecidoEm: 1 });
  const regComHomonima = { ...reg, [pn]: homonima };
  t("M13: com a homónima já no registo (save da sessão), o nome curto não é dela — o portão não morde",
    detectarPapelTrocado(`— Devia estar ali — diz ${pn}, que já viu a mesma coisa.`, regComHomonima, [comp]).length === 0);
  const ctxNome = (extra = {}) => ({ importantes: [{ nome: ci.nome }], grupo: [comp], aqui: [W0.cidade], ...extra });
  const a1 = nomeComDono(pn, regComHomonima, ctxNome());
  t(`"${pn}" com a homónima no registo resolve para ${ci.nome} (o grupo), não para ela`, a1.decisao === "mesma" && a1.chave === ci.nome, J(a1));
  const a2 = nomeComDono(pn, reg, ctxNome({ papel: "serviçal" }));
  t(`"${pn}", serviçal: nunca nasce segunda pessoa (recusada, dona ${ci.nome})`, a2.decisao === "recusada" && a2.dono === ci.nome && a2.motivo === "oficio", J(a2));
  const a3 = nomeComDono(pn, reg, ctxNome({ aqui: ["Outra Cidade Qualquer"] }));
  t("quem anda no grupo está sempre onde o herói está: o lugar da ficha não a separa", a3.decisao === "mesma" && a3.chave === ci.nome, J(a3));
  const a4 = nomeComDono(pn, reg, ctxNome({ genero: ci.npc.genero === "mulher" ? "homem" : "mulher" }));
  t("o sexo dito separa (e recusa — não cria)", a4.decisao === "recusada" && a4.motivo === "sexo", J(a4));
  const a5 = nomeComDono(pn, regComHomonima, ctxNome({ grupo: [] }));
  t("sem o grupo no contexto (a fiação antiga), a regra antiga fica como estava", a5.decisao === "mesma" && a5.chave === pn, J(a5));
  t("o nome inteiro dela continua a ser ela", nomeComDono(ci.nome, regComHomonima, ctxNome()).chave === ci.nome);

  /* a porta que de facto a criou no M1: a base da cidade "mencionada" na
     narração (mencionadosNaCena). Um mundo com alguém da base de nome de
     uma palavra só — o par da "Iracema" serviçal. */
  let prova = null;
  for (const w of MUNDOS) {
    for (const c of w.mapa.cidades.slice(0, 3)) {
      const q = oQueExisteAqui(w.semente, w.mapa, c.nome, null, w.genero, w.molde, null);
      const p = (q && q.gente || []).find((x) => x && x.nome && !/\s/.test(x.nome.trim()) && x.nome.length >= 4);
      if (p) { prova = { w, cidade: c.nome, p }; break; }
    }
    if (prova) break;
  }
  t("há um mundo de prova com gente da base de nome curto", !!prova);
  if (prova) {
    const { w, cidade, p } = prova;
    const dela = { nome: `${p.nome} Sousa`, conceito: "companheira de armas", classe: "Monge" };
    const n1 = `Você chega com a poeira da estrada. ${p.nome} vem meio passo atrás, como sempre veio.`;
    const n2 = `${p.nome} Sousa ergue a tocha e espera.`;
    const sem = (nar) => mencionadosNaCena(w.semente, w.mapa, cidade, null, w.genero, nar, w.molde, null).gente.map((x) => x.nome);
    const com = (nar) => mencionadosNaCena(w.semente, w.mapa, cidade, null, w.genero, nar, w.molde, null, { grupo: [dela] }).gente.map((x) => x.nome);
    t("a porta do M1 existe: sem o grupo, o nome curto acorda a homónima da base", sem(n1).includes(p.nome));
    t("com o grupo, o nome curto é da companheira: a homónima não entra", !com(n1).includes(p.nome));
    t("e o nome inteiro dela também não acorda a homónima (era casar o pedaço)", sem(n2).includes(p.nome) && !com(n2).includes(p.nome));
    t("a homónima dita com o seu ofício também é recusada pelo registo (nomeComDono), nunca criada",
      nomeComDono(p.nome, {}, { importantes: [{ nome: dela.nome }], grupo: [dela], papel: p.papel, aqui: [cidade] }).decisao !== "nova");
    t("lixo nas opções não quebra a porta", J(mencionadosNaCena(w.semente, w.mapa, cidade, null, w.genero, n1, w.molde, null, null)) === J(mencionadosNaCena(w.semente, w.mapa, cidade, null, w.genero, n1, w.molde, null)));
  }

  /* e na escolha: um companheiro que partilha o primeiro nome com alguém
     da cidade de partida ou do elenco nasce com a homónima à porta.
     Medido antes do conserto: 11 dos 24 mundos (7 com xará na cidade de
     partida). A outra cidade continua a pesar mais (secção 3), e o xará
     escolhe-se DENTRO dela: só sobra quando todos os de fora o têm. */
  let xaras = 0, vistos = 0, evitaveis = 0;
  MUNDOS.forEach((w) => {
    const r = montar(w, { antecedente: "Soldado Reformado" });
    if (!r.ci) return;
    vistos++;
    const el = elencoDoMundo(w.semente, w.mapa, { genero: w.genero, molde: w.molde, espinha: r.espinha, guildas: w.guildas });
    const q = oQueExisteAqui(w.semente, w.mapa, w.cidade, null, w.genero, w.molde, null);
    const todos = [...((q && q.gente) || []), ...el.pessoas].filter((x) => x && x.nome);
    const temXara = (nome) => todos.some((x) => x.nome !== nome && primeiroNome(x.nome) === primeiroNome(nome));
    if (!temXara(r.ci.nome)) return;
    xaras++;
    const a = r.ab.abertura;
    const marcos = (r.espinha.atos || []).flatMap((x) => x.marcos || []);
    const procurados = [a.pista.nome, a.alvo.quem, ...marcos.flatMap((m) => [m.quem, m.alvo])].filter(Boolean);
    const deFora = el.pessoas.filter((p) => p && p.nome && !p.morto && QUEM_PODE_SER.fontes.includes(p.fonte) && norm(p.cidade) !== norm(w.cidade)
      && !procurados.some((x) => norm(x) === norm(p.nome) || mesmaPessoa(x, p.nome))
      && !QUEM_PODE_SER.propositosDeFora.includes(indoleDe(w.semente, { nome: p.nome }).proposito));
    if (deFora.some((p) => !temXara(p.nome))) evitaveis++;
  });
  t(`a escolha evita o xará: ${xaras} de ${vistos} com homónimo (eram 11 de 24), e nenhum que se pudesse evitar (${evitaveis})`, vistos > 0 && evitaveis === 0 && xaras < 11);

  /* (2c) a PROCURA que achou a Lourdes Ferreira (M3, M7): "Procuro a
     Lourdes" casava o pedaço "lourdes" de "Lourdes Ferreira", e o nome
     mais comprido ganhava. A frase que só diz o primeiro nome é de quem se
     chama exatamente assim — e, havendo grupo ou cena, de quem lá está. */
  const NOMES = ["Iracema Sousa", "Iracema", "Lourdes", "Lourdes Ferreira", "Manuel"];
  t("M3: 'Procuro a Lourdes ao balcão' procura a Lourdes, não a Lourdes Ferreira",
    nomeProcurado("Atravesso a praça com a Iracema ao lado e entro no Rabo do Diabo. Procuro a Lourdes ao balcão.", NOMES) === "Lourdes");
  t("dito o sobrenome, é a Lourdes Ferreira (o nome mais longo dito ganha)", nomeProcurado("Procuro a Lourdes Ferreira na livraria", NOMES) === "Lourdes Ferreira");
  t("'procuro a Iracema' com a Iracema Sousa no grupo (perto): é ela", nomeProcurado("procuro a Iracema", NOMES, { perto: ["Iracema Sousa"] }) === "Iracema Sousa");
  t("e mesmo sem `perto`, a procura responde 'anda comigo' (o grupo vem primeiro em procurarPessoa)",
    procurarPessoa(nomeProcurado("procuro a Iracema", NOMES), { grupo: [{ nome: "Iracema Sousa" }] }).desfecho === "no_grupo");
  t("'procuro a Lourdes' com a Lourdes Ferreira na cena (perto): é ela", nomeProcurado("procuro a Lourdes", NOMES, { perto: ["Lourdes Ferreira"] }) === "Lourdes Ferreira");

  /* (3) O "DE PLANTÃO": quem anda no grupo não está no posto que deixou */
  if (pessoa && pessoa.local) {
    const ctxG = { semente: W0.semente, mapa: W0.mapa, cidade: pessoa.cidade, genero: W0.genero, molde: W0.molde, espinha: R0.espinha, guildas: W0.guildas, npcs: reg, heroi: "Brann" };
    const pergunta = `Quem trabalha ${comEm(pessoa.local)}?`;
    const antes = genteParaPauta({ ...ctxG, grupo: [], frase: pergunta }).pergunta.join(" | ");
    const depois = genteParaPauta({ ...ctxG, grupo: [comp], frase: pergunta }).pergunta.join(" | ");
    const trabalha = (linha) => { const m = linha.match(/quem trabalha [^:]*: ([^;|]*)/); return m ? m[1] : ""; };
    t(`sem ela no grupo, ${ci.nome} trabalha ${comEm(pessoa.local)} (o elenco é verdade)`, trabalha(antes).includes(ci.nome), antes);
    t("com ela no grupo, não está entre quem trabalha lá", !trabalha(depois).includes(ci.nome), depois);
    t("e o Mestre tem o porquê, sem facto novo (NO_GRUPO)", depois.includes(`${ci.nome} (${NO_GRUPO.comPosto})`) && depois.includes(NO_GRUPO.saiu), depois);
    const plantao = genteParaPauta({ ...ctxG, grupo: [comp], lugar: { nome: pessoa.local, cidade: pessoa.cidade, distancia: "dentro" }, frase: "Quem está de plantão aqui?" }).pergunta.join(" | ");
    t("'quem está de plantão aqui?', no antigo posto: ela não está de turno", !trabalha(plantao).includes(ci.nome), plantao);
    const rotina = genteParaPauta({ ...ctxG, grupo: [comp], frase: `A que horas ${ci.nome} pega no turno?` }).pergunta.join(" | ");
    t(`'a que horas ${pn} pega no turno?': deixou o posto`, rotina.includes(NO_GRUPO.comPosto), rotina);
    t("os textos não falam do mecanismo", Object.values(NO_GRUPO).every((x) => !PALAVRAS_DE_BASTIDOR.some((p) => palavra(p).test(x))));
  } else t("o companheiro de prova tem posto no elenco", false);

  /* A FIAÇÃO que o motor pede ao App: ligada na v9.349. Eram pendências
     (`prova2`, contadas e ditas); agora mordem — se alguém desligar uma das três
     linhas, a companheira volta a ter duas fichas e a suíte cai. */
  const prova2 = (nome, cond) => t(nome, cond);
  prova2("contextoDoNome passa o grupo a nomeComDono", /const contextoDoNome = \(n\) => \{[\s\S]{0,4000}?return \{ importantes, conhecidos, recentes, grupo:/.test(APP));
  prova2("mencionadosNaCena recebe o grupo", /mencionadosNaCena\([^;]*\{ grupo: /.test(APP));
  prova2("a procura passa quem está perto (o grupo e a cena)", /nomeProcurado\(acao, nomesConhecidos\(\), \{ perto: /.test(APP));
}

console.log(`\n${ok} ok · ${mal} falhas${pend ? ` · ${pend} pendentes (fiação)` : ""}`);
process.exit(mal ? 1 : 0);
