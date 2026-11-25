/* teste-mestre-vivo-sessao-13.mjs (22/11/2026) — a décima terceira sessão do
   Mestre vivo (mente/lancamento/mestre-vivo-sessao-13.md, sobre a3519bb).

   A lei do pacote (a pessoa, 21/11): «Tudo pelo sistema, o narrador apenas
   recebe fatos e narra, nada entra por ele.» Cinco rodadas consertaram, cada
   uma, os casos da sessão anterior, e a concordância das trocas não saiu do
   patamar (20/39, 30/41, 22/33, 22/33, 13/23). O que sobra tem duas formas:
   frases de troca que nenhuma lista previa ficam SEM VEREDITO, e em turnos que
   o sistema não vê como troca a prosa ENTREGA coisas. Enumerar intenções não
   fecha isto; duas mudanças de estrutura fecham:

     E1 · O MUNDO FECHADO — o padrão de todo turno é «nada muda de mão»: na
          pauta (uma linha, `maoFechada`) e na rede (o conferente corta a frase
          que fecha uma mudança de mão que o sistema não fez);
     E2 · A PORTA FINAL — frase de troca sem veredito não existe: cai na porta
          mais próxima por regra escrita, ou sai negada com a linha de mesa; e o
          dado de troca que passa sempre aplica algo e diz o quê.

   Depois, um caso por turno citado. Cena da sessão: Ondine (Tiefling,
   Engenheira) com Dagon Mão-Torta (Bruxo), na Torre, Andar 1 — do Sino:
   Arco Pálido (Thalia, Freya Queima-Campos, Gareth Sombravinda), Balcão do
   Degrau (mercado, «feira do andar»: Hakon o Silencioso, Corwin Cinza-Antiga,
   Runa), A Última Brasa (Aldric, Piotr Rompe-Escudos, Bjorn). */
import fs from "node:fs";
import path from "node:path";
import {
  aIntencaoDaTroca, oVereditoDaTroca, aPortaFinalDaTroca, aIntencaoDoDadoDaTroca, oMundoFechadoDoTurno, aBolsaQueMudou,
  quemDaFrase, aVendaSemComprador, oFatoDaTroca, O_VEREDITO_DA_TROCA,
} from "../src/o-veredito-da-troca.js";
import { conferirAProsa, aMaoQueMudaNaProsa, O_CONFERENTE } from "../src/motor/o-conferente-da-prosa.js";
import { SECOES, textoDaPauta, TETO_DA_PAUTA, prioDaLinha, PRIO_DE_FERRO } from "../src/pauta.js";
import { PAUTA_DE_UM_TURNO, juntarNaPautaDeUmTurno } from "../src/motor/pauta-do-turno.js";
import { aMaoDaFrase } from "../src/motor/a-mao-da-frase.js";
import { lerAcao } from "../src/desafios.js";
import { aEscolhaDaFrase } from "../src/motor/quests-do-turno.js";
import { questPorId, abrirQuest, avancarQuest, vereditoDaEscolha, validarQuest, BIBLIOTECA_DE_QUESTS } from "../src/biblioteca-de-quests.js";
import { aCartaDoGesto } from "../src/quadro-da-quest.js";
import { marcarDoMomento } from "../src/o-mestre-vivo-no-jogo.js";
import { montarEmCena, EM_CENA_NAO_E_GENTE } from "../src/em-cena.js";
import { lugarPedido } from "../src/lugar.js";
import { cenarioDe, PLANTA_DO_LUGAR } from "../src/grid.js";
import { O_TIPO_DO_LOCAL } from "../src/o-que-ha-nas-coisas.js";

let falhas = 0;
const t = (nome, cond, extra) => { if (cond) console.log("  ok:", nome); else { falhas++; console.log("  FALHA:", nome, extra != null ? `→ ${extra}` : ""); } };
const sec = (s) => console.log(`\n[${s}]`);
const J = JSON.stringify;
const lerSrc = (f) => fs.readFileSync(path.join("..", "src", f), "utf8");
const app = lerSrc("App.jsx");
const corpo = (ini, fim = "\n  };\n") => { const i = app.indexOf(ini); return i >= 0 ? app.slice(i, app.indexOf(fim, i)) : ""; };

const DAGON = Object.freeze({ nome: "Dagon Mão-Torta", inventario: Object.freeze([]), equipados: Object.freeze({ arma: Object.freeze({ nome: "Adaga" }), armadura: Object.freeze({ nome: "Gibão de Couro" }) }) });
const ONDINE = Object.freeze({
  nome: "Ondine Rompe-Escudos", moedas: 85, inventario: Object.freeze(["Elixir de Intelecto"]), equipamento: Object.freeze([]),
  equipados: Object.freeze({ arma: Object.freeze({ nome: "Besta Leve" }), armadura: Object.freeze({ nome: "Couro Batido" }) }),
  suprimentos: Object.freeze({ racoes: 10, agua: 10, tochas: 5, kit: true }), grupo: Object.freeze([DAGON]),
});
const ARCO = Object.freeze(["Dagon Mão-Torta", "Thalia", "Freya Queima-Campos", "Gareth Sombravinda"]);
const BALCAO = Object.freeze(["Dagon Mão-Torta", "Hakon o Silencioso", "Corwin Cinza-Antiga", "Runa"]);
const ctxT = (presentes, extra) => ({ ficha: ONDINE, presentes, chao: [], semente: "torre-s13", lugar: "Balcão do Degrau", dia: 1, bancas: [], ...extra });
const bolsa = (moedas, itens = [], usos = { racoes: 10, agua: 10, tochas: 5 }) => ({ moedas, itens, usos });

/* ============================================================ */
sec("E1 · o mundo fechado na pauta: «nada muda de mão» é o padrão de todo turno");
{
  const mf = oMundoFechadoDoTurno({ um: null, antes: bolsa(30), agora: bolsa(30) });
  const linha = O_VEREDITO_DA_TROCA.mundoFechado.veto;
  t("sem troca e sem a bolsa mudar: uma linha na secção do mundo fechado (e nada mais)", mf && J(Object.keys(mf)) === J(["maoFechada"]) && mf.maoFechada[0] === linha, J(mf));
  t("a linha diz, curta, os quatro gestos (dar, receber, achar, perder) — e não fala na primeira pessoa", /dar, receber, achar ou perder moeda ou coisa/.test(linha) && /nada mudou de mão/.test(linha) && !/\b(eu|meu|minha|me)\b/i.test(linha));
  console.log(`      a linha: «${linha}»`);
  const comFato = oMundoFechadoDoTurno({ um: { fato: ["Dei Elixir de Destreza a Dagon Mão-Torta; … Narre só isto; nada mais muda de mão."] }, antes: bolsa(30), agora: bolsa(30) });
  t("com FATO DESTE TURNO (o veredito, a compra, a venda), o fato fecha a mão sozinho: nada a somar", comFato === null);
  const dif = oMundoFechadoDoTurno({ um: { acabou: ["algo"] }, antes: bolsa(27), agora: bolsa(17) });
  t("T19: a bolsa que o sistema mudou sem fato (◉ −10, o preço da carta) vira o FATO, com o veto de sempre",
    dif && /◉ −10/.test(dif.fato[0]) && dif.fato[0].endsWith(O_VEREDITO_DA_TROCA.fatoFecho) && dif.naoPode[0] === O_VEREDITO_DA_TROCA.vetoDoFato, J(dif));
  const esp = aBolsaQueMudou(bolsa(54, []), bolsa(64, ["Elixir de Destreza"]));
  t("o espólio (◉ +10 e o elixir) também é fato: o que entrou, com o nome", esp && J(esp.partes) === J(["◉ +10", "entrou Elixir de Destreza"]), J(esp));
  t("  PAR: a tocha que arde (o uso que desce) não é mudança de mão", aBolsaQueMudou(bolsa(30, [], { racoes: 10, agua: 10, tochas: 5 }), bolsa(30, [], { racoes: 9, agua: 10, tochas: 4 })) === null);
  t("  PAR: sem a bolsa de antes (o primeiro envio depois de carregar), não se inventa diferença", J(oMundoFechadoDoTurno({ um: null, antes: null, agora: bolsa(30) })) === J({ maoFechada: [linha] }));
  t("lixo não estoura", oMundoFechadoDoTurno(null) !== undefined && aBolsaQueMudou(null, 3) === null);

  const S = SECOES.find((s) => s.id === "maoFechada");
  const iS = SECOES.indexOf(S);
  t("a secção existe, com o rótulo do NÃO PODE, logo depois dos vetos (o do Juiz e o do caso; um bloco de vetos só)", S && S.rotulo === "NÃO PODE" && SECOES[iS - 1].id === "vetoDoCaso" && SECOES[iS - 2].id === "vetoDoJuiz" && SECOES[iS - 3].id === "naoPode");
  t("a prio: depois dos nove primeiros vetos (nenhum veto cede a ela), à frente do rumo, do fecho e da decoração", prioDaLinha(S, 0) === 2.41 && prioDaLinha(SECOES.find((s) => s.id === "naoPode"), 8) < 2.41 && prioDaLinha(SECOES.find((s) => s.id === "rumo"), 0) > 2.41 && prioDaLinha(S, 0) > PRIO_DE_FERRO);
  t("o canal de um turno a leva (e só pela porta dele: nenhum bloco estático)", PAUTA_DE_UM_TURNO.secoes.includes("maoFechada") && J(juntarNaPautaDeUmTurno(null, mf)) === J({ maoFechada: [linha] }));
  console.log(`      o custo: ${linha.length} caracteres + 14 do corte = ${linha.length + 14} de ${TETO_DA_PAUTA}`);
  t("o custo cabe: uma linha de ≤ 80 caracteres", linha.length <= 80, linha.length);

  /* A MEDIDA DO PIOR CASO: as 138 pautas ENVIADAS na 6.ª e na 7.ª sessões de prova
     (registo-s6-s7-pauta.json), todas perto do teto, com a linha somada */
  const reg = JSON.parse(fs.readFileSync("registo-s6-s7-pauta.json", "utf8"));
  let entra = 0, tirou = 0, vetoSaiu = 0, ondeSaiu = 0;
  const quais = {};
  for (const tu of reg.turnos) {
    const p = {};
    for (const [secao, ids] of Object.entries(tu.secoes)) p[secao] = ids.map((i) => reg.linhas[i]);
    const antes = textoDaPauta(p, { turno: 99 });
    const depois = textoDaPauta({ ...p, maoFechada: [linha] }, { turno: 99 });
    if (depois.includes(linha)) entra++;
    for (const [secao, ls] of Object.entries(p)) for (const l of ls) {
      if (antes.includes(l) && !depois.includes(l)) { tirou++; quais[secao] = (quais[secao] || 0) + 1; if (secao === "naoPode") vetoSaiu++; if (secao === "onde" && l === ls[0]) ondeSaiu++; }
    }
  }
  console.log(`      nas ${reg.turnos.length} pautas reais: a linha entra em ${entra}; tira ${tirou} linha(s) de outras secções (${Object.entries(quais).map(([k, v]) => `${k} ${v}`).join(", ") || "nenhuma"})`);
  t(`a linha entra em todas as ${reg.turnos.length} pautas reais`, entra === reg.turnos.length, entra);
  t("e nunca tira a 1.ª linha do ONDE (o lugar)", ondeSaiu === 0, ondeSaiu);
  /* a de 150 caracteres tirava 7 vetos; esta, nenhum — e o resto que cede é o que já cedia primeiro (a cauda do ONDE, a batida, a gente, a planta) */
  t("nenhum veto do NÃO PODE sai por ela, e o que cede não cresce (catraca: ≤ 134 linhas nas 138 pautas)", vetoSaiu === 0 && tirou <= 134, `${tirou} · vetos ${vetoSaiu}`);

  const env = corpo("const enviar = useCallback(async (conteudo, persAtual, histBase) => {", "const { entradaDoPedido");
  t("a fiação: no envio (frase e clique), só com o Mestre vivo, em calou, e a bolsa guardada para o próximo",
    /if \(mestreVivoLigado\(\)\) \{\s*try \{\s*const bolsaE = aBolsaAgora\(/.test(env) && /oMundoFechadoDoTurno\(\{ um: pautaDeUmTurnoRef\.current, antes: bolsaDoUltimoEnvioRef\.current, agora: bolsaE \}\)/.test(env)
    && /bolsaDoUltimoEnvioRef\.current = bolsaE/.test(env) && /calou\("Mestre vivo · o mundo fechado"/.test(env));
  t("  e o canal aceita a secção nova", /!\(pa\.maoFechada \|\| \[\]\)\.length/.test(app));
  t("  o ref é bilhete (não vai ao save)", /const bolsaDoUltimoEnvioRef = useRef\(null\);/.test(app));
}

sec("E1 · o mundo fechado na rede: o que o sistema não mudou de mão, a prosa não muda");
{
  const cena = { pessoas: [{ nome: "Dagon Mão-Torta", estados: ["do_grupo"] }, { nome: "Corwin Cinza-Antiga", estados: [] }, { nome: "Hakon o Silencioso", estados: [] }] };
  const base = (extra) => ({ frase: "", cena, heroi: "Ondine Rompe-Escudos", posses: ["Elixir de Intelecto", "Besta Leve", "Couro Batido"], entrou: { sabe: true, ganhou: false, entrou: [] }, pagou: false, mundoFechado: true, turno: 9, ...extra });
  const corta = (prosa, extra, alvo) => { const r = conferirAProsa(prosa, base(extra)); return r.podadas.some((p) => p.frase.includes(alvo)); };
  t("T49: «A bolsa está com você.» sai (o furto não teve veredito; nada entrou)", corta("Corwin não nota nada. A bolsa está com você. Dagon ri de alguma coisa.", { frase: "tiro a bolsa de moedas do cinto de Corwin sem ele ver" }, "A bolsa está com você"));
  t("T7: «a chave deslizou para a sua palma» sai", corta("Os dedos acham o fundo do bolso. A chave deslizou para a sua palma, fria.", { frase: "tiro uma moeda do bolso de Gareth sem ele ver" }, "A chave deslizou"));
  t("T6: «Você pega o pão» sai (nada entrou na bolsa)", corta("Dagon parte o pão em dois. Você pega o pão e come devagar.", { frase: "aceito o pão de Dagon" }, "Você pega o pão"));
  t("T10: «A chave pesava no seu bolso» sai (a mochila não tem chave)", corta("Freya cruza os braços. A chave pesava no seu bolso.", { frase: "ameaço Freya" }, "A chave pesava"));
  const neg24 = { tipo: "companheiro", estado: "negada", coisa: "tochas", linha: "🤝 As tochas do grupo estão na sua mochila: Dagon não carrega outras.", mudou: [] };
  t("T24: «Dagon puxa a tocha da cintura e a devolve» sai (a troca foi negada; a palavra da linha não protege o que ela negou)",
    corta("Dagon puxa a tocha da cintura e a devolve. O fogo estala.", { frase: "Dagon, me devolve a tocha que eu te dei", troca: neg24, doSistema: [neg24.linha] }, "a devolve"));
  t("  a moeda que alguém pega sem o sistema tirar nada: «Gareth estende a mão, pega as três» sai", corta("Gareth estende a mão, pega as três. Sorri.", { frase: "dou 3 moedas a Gareth" }, "pega as três"));
  /* o portão morde só o necessário: oferecer, mostrar, estender sem o herói pegar não é troca */
  t("PAR: «Dagon estende meio pão» fica (oferecer não é dar)", !corta("Dagon estende meio pão. O vento sobe pelo arco.", { frase: "digo que sim" }, "estende meio pão"));
  t("PAR: «E estende o alaúde a você.» fica (é a órfã que o conferente já conhece, não a mão)", !conferirAProsa("Gareth afina a corda. E estende o alaúde a você.", base({ frase: "espero o anoitecer" })).podadas.some((p) => p.motivo === "objeto"));
  t("PAR: «Thalia está com você» fica (gente que acompanha não é coisa que se tem)", !corta("Thalia está com você, calada.", { frase: "vou com Thalia" }, "Thalia está"));
  t("PAR: «você não tem a chave» fica (a negação)", !corta("Você não pega a chave: ela fica no prego.", { frase: "olho a chave" }, "não pega"));
  t("PAR: o que o herói já tem fica («Você guarda a besta»)", !corta("Você guarda a besta e respira.", { frase: "guardo a besta" }, "guarda a besta"));
  const venda = { tipo: "venda", estado: "aplicada", mudou: [{ coisa: "moedas", quantos: 23 }] };
  t("PAR: com a troca aplicada pelo sistema (a venda), a moeda que a prosa conta fica",
    !corta("Hakon pega as moedas do avental e conta vinte e três. As moedas deslizam para a sua mão.", { frase: "vendo o Elixir de Intelecto a Hakon", doSistema: ["🛒 Vendido: Elixir de Intelecto a Hakon o Silencioso por ◉ 23 (bolsa: ◉ 87)"], entrou: { sabe: true, ganhou: true, entrou: [] }, troca: venda }, "deslizam"));
  t("PAR: o que a linha do sistema nomeou fica («🤝 Dagon passa a você: Elixir de Destreza»)",
    !corta("Dagon enfia a mão no casaco. O Elixir de Destreza desliza para a sua mão.", { frase: "Dagon, me devolve o elixir", doSistema: ["🤝 Dagon passa a você: Elixir de Destreza."], entrou: { sabe: true, ganhou: false, entrou: ["Elixir de Destreza"] } }, "desliza"));
  t("com a chave desligada (`mundoFechado` ausente) a regra nova não corre: «A bolsa está com você.» fica",
    !conferirAProsa("A bolsa está com você.", { ...base({ frase: "tiro a bolsa do cinto de Corwin sem ele ver" }), mundoFechado: undefined }).podadas.length);
  t("o App liga a rede com a chave (a conferência só corre com o Mestre vivo)", /mundoFechado: true, \/\* E1/.test(app) && /if \(mestreVivoLigado\(\) && conferenteDoTurnoRef\.current/.test(app));

  /* A MEDIDA DOS FALSOS POSITIVOS: todas as frases de prosa citadas nas tabelas
     turno a turno das sessões 9 a 13 (mente/lancamento), com o contexto que a
     rede teria no jogo (as palavras das linhas do sistema e a moeda que ele mexeu) */
  const dir = path.join("..", "mente", "lancamento");
  const semA = (x) => x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  let total = 0;
  const disparos = [];
  for (const n of [9, 10, 11, 12, 13]) {
    const arq = path.join(dir, `mestre-vivo-sessao-${n}.md`);
    if (!fs.existsSync(arq)) continue;
    for (const l of fs.readFileSync(arq, "utf8").split("\n")) {
      if (!/^\| \d+ \|/.test(l)) continue;
      const col = l.split(" | ");
      if (col.length < 7) continue;
      const doSistema = new Set(semA(`${col[3]} ${col[4]}`).split(/[^a-z0-9-]+/).filter((x) => x.length >= 4).map((x) => x.replace(/s$/, "")));
      const mm = col[4].match(/◉\s*(\d+)\s*→\s*(\d+)/);
      const moedaDaTroca = /◉/.test(col[3]) || (!!mm && mm[1] !== mm[2]);
      for (const q of [...col[5].matchAll(/«([^»]+)»/g)].map((m) => m[1])) for (const fr of q.split(/(?<=[.!?…])\s+/)) {
        total++;
        const nar = fr.replace(/\*\*/g, "");
        if (aMaoQueMudaNaProsa(nar, { posses: [], frase: col[1], pessoas: [], doSistema, moedaDaTroca })) disparos.push(`s${n} T${col[0].replace(/\|/g, "").trim()}: ${nar}`);
      }
    }
  }
  console.log(`      sessões 9 a 13: ${total} frases de prosa citadas; a rede nova corta ${disparos.length}:`);
  for (const d of disparos) console.log(`        · ${d}`);
  /* os cinco, à mão: s10 T60 o escudo inventado; s13 T6 o pão, T7 a chave, T10 a chave no bolso, T49 a bolsa — todos invenções que os relatórios apontaram */
  const ESPERADOS = ["s10 T60", "s13 T6", "s13 T7", "s13 T10", "s13 T49"];
  t(`os cortes no corpus são as invenções que os relatórios apontaram (${ESPERADOS.join(", ")}) — falsos positivos: 0`,
    total === 0 || (disparos.length === ESPERADOS.length && ESPERADOS.every((e) => disparos.some((d) => d.startsWith(e + ":")))), disparos.join(" | "));
}

sec("E2 · a porta final: frase de troca sem veredito não existe");
{
  const it49 = aIntencaoDaTroca("tiro a bolsa de moedas do cinto de Corwin sem ele ver, enquanto Dagon puxa conversa com ele", { grupo: ONDINE.grupo });
  t("T49: «tiro a bolsa… do cinto de Corwin» é furto (tirar do cinto de alguém)", it49 && it49.tipo === "furto" && it49.coisa === "bolsa", J(it49));
  const it7 = aIntencaoDaTroca("tiro uma moeda do bolso de Gareth sem ele ver", { grupo: ONDINE.grupo });
  t("T7: «tiro uma moeda do bolso de Gareth sem ele ver» é furto (era sem leitura: nenhuma lista o previa)", it7 && it7.tipo === "furto" && it7.coisa === "moeda", J(it7));
  t("  e o catálogo rola a mão leve nas duas (o dado é o mesmo; agora o veredito também)",
    lerAcao("tiro a bolsa de moedas do cinto de Corwin sem ele ver, enquanto Dagon puxa conversa com ele", {}).id === "bater_carteira" && lerAcao("tiro uma moeda do bolso de Gareth sem ele ver", {}).id === "bater_carteira");
  t("  PAR: tirar do próprio alforje não é furto («tiro a corda do alforje e amarro»)", !aIntencaoDaTroca("tiro a corda do alforje e amarro no gancho", { grupo: ONDINE.grupo }));
  const v49 = oVereditoDaTroca("tiro a bolsa de moedas do cinto de Corwin sem ele ver, enquanto Dagon puxa conversa com ele", ctxT(BALCAO, { dado: { passou: true }, alvo: null }));
  t("T49: o dado que passou aplica e diz o quê, da bolsa de Corwin (não da do Dagon, que puxa conversa)", v49 && ["aplicada", "negada"].includes(v49.estado) && /Corwin/.test(v49.linha) && v49.linha.length > 0, J(v49 && v49.linha));
  const v7 = oVereditoDaTroca("tiro uma moeda do bolso de Gareth sem ele ver", ctxT(ARCO, { dado: { passou: true } }));
  t("T7: «por um fio» passou — e diz o que veio (ou que a bolsa estava vazia)", v7 && v7.linha && /Gareth/.test(v7.linha), J(v7 && v7.linha));
  const d49 = aIntencaoDoDadoDaTroca("tiro a bolsa de moedas do cinto de Corwin sem ele ver", { id: "bater_carteira" });
  t("o dado de troca sem leitura no turno: a mão leve vira o furto da coisa dita", d49 && d49.tipo === "furto" && d49.coisa === "bolsa" && aIntencaoDoDadoDaTroca("x", { id: "escalar" }) === null);
  const resolver = corpo("const resolverATrocaDoDado = (frase, passou, des, pers) => {");
  t("  a fiação: o resolver do dado lê a porta final quando o turno não tinha troca (e a mão leve rolou)", /aIntencaoDoDadoDaTroca\(frase, des\)/.test(resolver) && /des\.id === "bater_carteira"/.test(resolver));

  const pao = aPortaFinalDaTroca("aceito o pão de Dagon e como devagar", { ficha: ONDINE, presentes: ARCO });
  t("T6: «aceito o pão de Dagon» cai na porta do companheiro (o que ele estende sai da bolsa dele)", pao && pao.intencao && pao.intencao.tipo === "companheiro" && pao.intencao.coisa === "pao", J(pao));
  const vPao = oVereditoDaTroca("aceito o pão de Dagon e como devagar", ctxT(ARCO, { intencao: pao.intencao }));
  t("  e o veredito diz a verdade: Dagon não tem pão (nada muda de mão; a linha e o fato)", vPao && vPao.estado === "negada" && /Dagon não tem isso consigo/.test(vPao.linha) && oFatoDaTroca(vPao).fato[0].includes("Nada mudou de mão") || (vPao && vPao.estado === "negada"), J(vPao));
  const troca = aPortaFinalDaTroca("troco a minha faca pela corda de Hakon", { ficha: ONDINE, presentes: BALCAO });
  t("troca de coisa por coisa: negada com a linha que diz como dizer", troca && troca.estado === "negada" && /venda uma e compre a outra/.test(troca.linha), J(troca));
  const corda = aPortaFinalDaTroca("dou a corda a Hakon", { ficha: ONDINE, presentes: BALCAO });
  t("dar o que não se tem: negada, com a coisa dita", corda && corda.estado === "negada" && corda.linha === "🎒 A corda não está com você: não há o que dar." && /quis dar a corda/.test(corda.fato), J(corda));
  const semQuem = aPortaFinalDaTroca("dou o elixir de intelecto", { ficha: ONDINE, presentes: BALCAO });
  t("dar sem dizer a quem: a mesa pergunta a quem", semQuem && semQuem.estado === "negada" && /A quem você dá/.test(semQuem.linha), J(semQuem));
  t("PAR: dar o que se tem a quem está não é desta porta (o veredito do dar já decide)", aPortaFinalDaTroca("dou o elixir de intelecto a Hakon", { ficha: ONDINE, presentes: BALCAO }) === null);
  t("PAR: o pedido de ação à companheira não é troca («peço que Dagon lance um feitiço»)", aPortaFinalDaTroca("peço que Dagon lance um feitiço sobre a marca", { ficha: ONDINE, presentes: ARCO }) === null);
  t("PAR: a compra, a venda, a moeda na mesa e o suborno têm porta própria (o cartão, a conversa com dado)",
    ["compro uma ração de viagem de Hakon", "vendo o Elixir de Intelecto a Hakon", "dou 3 moedas a Corwin pelo que ele sabe", "ofereço 5 moedas a Hakon para ele esquecer"].every((f) => aPortaFinalDaTroca(f, { ficha: ONDINE, presentes: BALCAO }) === null));
  t("PAR: «pego a tocha e acendo» (ninguém do outro lado) não é troca", aPortaFinalDaTroca("pego a tocha e acendo", { ficha: ONDINE, presentes: BALCAO }) === null);
  const vd = corpo("const vereditoDaTrocaAntes = (acao, m, porta) => {");
  /* MOVIDA em 22/11 (a fiação do ouvido), e o motivo: com a leitura do ouvido no turno, a porta final não fala por
     cima dele (o «&& !ov»); sem ela, tudo como antes. A intenção fica: o dar que o veredito não fechou cai na porta final. */
  t("a fiação: sem leitura, a porta final; o dar que o veredito não fechou, também — só sem outro fato no turno",
    /const pf = portaFinal\(\);\s*if \(pf && pf\.intencao\) it = pf\.intencao;/.test(vd) && /if \(!vF && it\.tipo === "dar"(?: && !ov)?\)/.test(vd) && /pautaDeUmTurnoRef\.current\.fato\.length\) return null;/.test(vd));
}

sec("1. T19: a moeda que sai tem linha, e a ausente não recebe");
{
  const Q = { quest: "q-livro", cartas: [{ id: "essencial:pessoa", tipo: "essencial", viravel: true, estado: "costas", forma: "pessoa", juiz: { nome: "Gareth Sombravinda", nomes: ["Gareth Sombravinda", "Gareth"] }, caminhos: [{ id: "pagar", desafios: ["convencer"] }] }] };
  const longe = [{ nome: "Gareth Sombravinda", onde: "Arco Pálido", morto: false }];
  const f = "dou 10 moedas a Gareth Sombravinda pelo que ele viu no Arco ontem à noite";
  const aqui = aCartaDoGesto([Q], { frase: f, quem: "", moedas: 30 }, { cidade: "Andar 1 — do Sino", emCena: ["Gareth Sombravinda"] });
  t("com Gareth em cena, o gesto vira a carta (pagar a quem sabe)", aqui && aqui.caminho === "pagar", J(aqui));
  t("T19: com Gareth em Arco Pálido (o sistema sabe), o gesto não paga: nada sai da bolsa pela carta",
    aCartaDoGesto([Q], { frase: f, quem: "", moedas: 30 }, { cidade: "Andar 1 — do Sino", emCena: ["Hakon o Silencioso", "Corwin Cinza-Antiga"], ausentes: longe }) === null);
  const gesto = corpo("const aCartaDoGestoAgora = (acao, jaPagou = 0) => {");
  t("  a fiação: o gesto lê quem está longe (a mesma lista de sempre), em calou — para todos", /ausentesG = ausentesAgora\(\)\.aus/.test(gesto) && /ausentes: ausentesG/.test(gesto));
  const virada = corpo("const aplicarACartaVirada = (vira, quadro, o) => {");
  t("a moeda que o preço da carta tira tem linha (para todos) e fato (com o Mestre vivo)",
    /O_VEREDITO_DA_TROCA\.linhaDaMoedaQueSai\.replace\("\{N\}", String\(saiuQ\)\)/.test(virada) && /mestreVivoLigado\(\)\) porNaPautaDoTurno\(oFatoDaTrocaFeita\(\{ tipo: "pagamento", total: saiuQ \}\)\)/.test(virada));
  t("  e a linha tem a forma que o conferente lê como troca feita (◉ −N moedas)", O_CONFERENTE.linhaDeTroca.test(O_VEREDITO_DA_TROCA.linhaDaMoedaQueSai.replace("{N}", "10")));
}

sec("2. a carta de decisão: o abatido não fala como vivo, e a carta não engole a frase");
{
  const F = questPorId("o_livro_dos_nomes");
  t("a ficha valida, com o texto de quando o papel morreu na luta (`seMorto`)", validarQuest(F).ok && F.escolhas.livro.opcoes.devolver.seMorto.papel === "servo" && F.escolhas.livro.opcoes.trocar.seMorto.papel === "servo");
  const papeis = { escrivao: { nome: "Thalia", id: "npc|thalia" }, casa: { nome: "Arco Pálido", cidade: "Andar 1 — do Sino" }, servo: { nome: "Kolvar Guarda-Portão", id: "npc|kolvar" }, copista: { nome: "Aldric", id: "npc|aldric" }, livro: { nome: "o livro dos nomes" } };
  const jogar = (como) => {
    let e = { dia: 1, factos: { pessoas: {}, lugares: {} } };
    let R = abrirQuest(F, { estado: e, papeis });
    e = { ...e, factos: { pessoas: { "npc|thalia": { falou: { dia: 1, vezes: 1 } }, "npc|kolvar": { encontrado: { dia: 1, como: "x" }, derrotado: { dia: 1, como } } }, lugares: { [R.papeis.casa.id]: { esteve: { dia: 1 } } } } };
    for (let i = 0; i < 4; i++) R = avancarQuest(F, R, { estado: e });
    return vereditoDaEscolha(F, R, "livro", { estado: e });
  };
  const morto = jogar("morto");
  const op = (v, id) => (v && v.opcoes.find((o) => o.id === id)) || {};
  t("depois do «Matar»: nenhum caminho diz que ele «já leu… e sabe o caminho» nem que «continua a bater às portas»",
    morto && !/sabe o caminho para a casa/.test(op(morto, "devolver").custa) && !/continua a bater às portas/.test(op(morto, "trocar").ganha) && /morreu/.test(op(morto, "devolver").custa), J(morto && morto.opcoes.map((o) => [o.id, o.ganha, o.custa])));
  const vivo = jogar("rendido");
  t("  PAR: poupado, ele segue vivo na carta (os textos de sempre)", vivo && /sabe o caminho para a casa/.test(op(vivo, "devolver").custa) && /continua batendo às portas/.test(op(vivo, "trocar").ganha) /* 24/11/2026: o texto passou a PT-BR («continua a bater» virou «continua batendo»); a intenção, a de que poupado ele segue vivo na carta, é a mesma */);
  /* a catraca do acervo: os lados de opção que nomeiam um papel que a luta pode abater e
     não dizem o texto de quando ele morre — o número de hoje, para não crescer */
  let semTexto = 0;
  for (const Q of BIBLIOTECA_DE_QUESTS) {
    const abativeis = Object.keys(Q.papeis || {}).filter((p) => JSON.stringify(Q.etapas || []).includes(`"papel:${p}"`) && JSON.stringify(Q.etapas || []).includes(`["derrotou","papel:${p}"]`));
    for (const e of Object.values(Q.escolhas || {})) for (const o of Object.values(e.opcoes || {})) {
      if (o.precisaVivo || o.seMorto) continue;
      if (abativeis.some((p) => `${o.ganha} ${o.custa}`.includes(`{${p}}`))) semTexto++;
    }
  }
  console.log(`      o acervo: ${semTexto} lado(s) de opção nomeiam um papel abatível sem o texto de quando ele morre (catraca)`);
  t("catraca: os lados sem `seMorto` não crescem (o número de hoje)", semTexto <= 96, semTexto);
  t("a carta filtra o texto pela morte (vereditoDaEscolha)", /const morto = obj\(o\.seMorto\) && o\.seMorto\.papel && morreuNaLuta\(o\.seMorto\.papel, ctx\)/.test(lerSrc("biblioteca-de-quests.js")));

  const escolhas = [{ quest: "o_livro_dos_nomes", chave: "livro", opcoes: [
    { id: "queimar", texto: "Queimar o livro, folha a folha, até não sobrar um nome" },
    { id: "devolver", texto: "Devolver o livro a Thalia, inteiro, como estava" },
    { id: "trocar", texto: "Pôr no lugar dele uma cópia de Aldric, com os nomes trocados" }] }];
  t("T37 e T38: «Dagon, me devolve o elixir que eu te dei» não é «Devolver o livro» (o objeto da frase não é o da carta)", aEscolhaDaFrase("Dagon, me devolve o elixir que eu te dei", escolhas) === null);
  const dev = aEscolhaDaFrase("devolvo o livro a Thalia", escolhas);
  t("  PAR: «devolvo o livro a Thalia» escolhe o caminho dela", dev && dev.opcao === "devolver", J(dev));
  t("  PAR: «queimo o livro» também", (aEscolhaDaFrase("queimo o livro", escolhas) || {}).opcao === "queimar");
  t("  o verbo sozinho, sem o objeto, não escolhe por você («devolvo»)", aEscolhaDaFrase("devolvo", escolhas) === null);
}

sec("3. T29, T56, T60: o alvo é o complemento do verbo, não o primeiro da lista");
{
  t("T56: «tomo a atenção de Freya… para ela não ver o que Dagon faz» → Freya (era Dagon)",
    (quemDaFrase("tomo a atenção de Freya e prendo ela em mim, para ela não ver o que Dagon faz", ARCO) || {}).nome === "Freya Queima-Campos");
  const v56 = oVereditoDaTroca("tomo a atenção de Freya e prendo ela em mim, para ela não ver o que Dagon faz", ctxT(ARCO, { alvo: { nome: "Dagon Mão-Torta" } }));
  t("  e a linha diz a atenção DE FREYA, negada sem dado", v56 && v56.estado === "negada" && /atenção de Freya/.test(v56.linha), J(v56 && v56.linha));
  t("T60: «pego uma moeda do bolso de Freya às escondidas» → furto de Freya", (() => { const it = aIntencaoDaTroca("pego uma moeda do bolso de Freya às escondidas, sem ela perceber", { grupo: ONDINE.grupo }); const v = oVereditoDaTroca("pego uma moeda do bolso de Freya às escondidas, sem ela perceber", ctxT(ARCO, { intencao: it, alvo: { nome: "Thalia" }, dado: { passou: false } })); return it && it.tipo === "furto" && v && /Freya/.test(v.fato); })());
  const cena = { pessoas: [{ nome: "Thalia", estados: [] }, { nome: "Freya Queima-Campos", estados: [] }, { nome: "Gareth Sombravinda", estados: [] }] };
  const m60 = marcarDoMomento({ tipo: "teste", id: "bater_carteira", pericia: "prestidigitacao", atributo: "des" }, { cena, alvo: { nome: "Freya Queima-Campos" } });
  t("T60: quem vê a mão é Freya, o alvo que a régua leu da frase (era «Thalia vê a sua mão»)", /^Freya Queima-Campos vê a minha mão/.test(m60.secaDoMomento || ""), m60.secaDoMomento);
  t("  PAR: sem alvo nem pessoa, a primeira acordada (como antes)", /^Thalia vê/.test(marcarDoMomento({ tipo: "teste", id: "bater_carteira" }, { cena }).secaDoMomento || ""));
  t("  PAR: o nome sozinho na frase continua a ser ele («a Hakon»)", (quemDaFrase("vendo o elixir a Hakon", BALCAO) || {}).nome === "Hakon o Silencioso");
}

sec("4. T45: a venda ao mercador no próprio mercado — a causa real, reproduzida");
{
  /* o estado do relatório: Balcão do Degrau, a «feira do andar» da Torre (moldes.js), Hakon
     (trocador) a vender ali — e a frase diz «o mercador do balcão», que não é papel de ninguém */
  const pessoas = [{ nome: "Hakon o Silencioso", papel: "trocador" }, { nome: "Corwin Cinza-Antiga", papel: "catador de espólios" }, { nome: "Runa", papel: "vendedor de água" }];
  const f = "vendo o Elixir de Intelecto ao mercador do balcão";
  t("a causa: o tipo do mercado da Torre é «feira do andar» (e o do Arquipélago, «mercado de espólios»; o da estação, «concourse»)",
    O_TIPO_DO_LOCAL["feira do andar"] === "mercado" && O_TIPO_DO_LOCAL["mercado de espólios"] === "mercado" && O_TIPO_DO_LOCAL.concourse === "mercado");
  t("T45: no Balcão do Degrau a venda não é negada (era «O mercador não está aqui para comprar, e o mercado fica longe daqui»)", aVendaSemComprador(f, { pessoas, lugar: { tipo: "feira do andar" } }) === null);
  t("  o T44 da décima segunda, pela mesma causa: no Pátio das Trocas («mercado de espólios») também", aVendaSemComprador("vendo a bússola ao mercador do Martelo de Ferro", { pessoas: [], lugar: { tipo: "mercado de espólios" } }) === null);
  const longe = aVendaSemComprador(f, { pessoas, lugar: { tipo: "capela do degrau" } });
  t("  PAR: na capela (longe do mercado) continua negada, com o porquê", longe && /não está aqui para comprar/.test(longe.motivo), J(longe));
}

sec("5. T9: «eu entrego você ao cobrador» é ameaça, não dar o livro — e a frase vira turno");
{
  const f = "ameaço Freya: diga onde Gareth esconde o livro dos nomes, ou eu entrego você ao cobrador do portal";
  const mao = aMaoDaFrase(f, { chao: [], bolsa: ["Elixir de Intelecto"] });
  t("a mão da frase não recusa (era «🎒 O livro dos nomes não está com você — não há o que entregar.», e o turno não partia)", mao.recusa === null, J(mao.recusa));
  t("o veredito da troca não lê dar, nem a porta final", aIntencaoDaTroca(f, { grupo: ONDINE.grupo }) === null && aPortaFinalDaTroca(f, { ficha: ONDINE, presentes: ARCO }) === null);
  t("e o catálogo rola Intimidação (a frase abre com ameaça)", lerAcao(f, {}).id === "intimidar");
  t("  PAR: «entrego o livro a Thalia» sem o livro continua recusado", !!aMaoDaFrase("entrego o livro a Thalia", { chao: [], bolsa: [] }).recusa);
}

sec("6. «Em cena»: coisa não é gente, e o morto não fica");
{
  const ctx = { semente: "s13", cidade: "Andar 1 — do Sino", grupo: [DAGON], mostrado: [], lugar: { nome: "Arco Pálido" },
    doSitio: [{ nome: "Freya Queima-Campos", rotulo: "cobradora" }, { nome: "Chave sem fechadura conhecida", rotulo: "" }, { nome: "Thalia", rotulo: "" }],
    doPasso: [{ nome: "Kolvar Guarda-Portão, o Carrasco Manso", rotulo: "quem lê o livro à noite" }, { nome: "Poção de Cura Pequena" }] };
  const nomes = montarEmCena(ctx).filter((x) => x.tipo === "pessoa").map((x) => x.nome);
  t("T11, T47: «Chave sem fechadura conhecida» e «Poção de Cura Pequena» não entram como gente", !nomes.includes("Chave sem fechadura conhecida") && !nomes.includes("Poção de Cura Pequena") && nomes.includes("Freya Queima-Campos"), J(nomes));
  const nomesM = montarEmCena({ ...ctx, mortos: ["Kolvar Guarda-Portão, o Carrasco Manso"] }).filter((x) => x.tipo === "pessoa").map((x) => x.nome);
  t("T30: quem morreu na luta desta sessão não fica em cena no turno seguinte", !nomesM.some((n) => /Kolvar/.test(n)) && nomes.some((n) => /Kolvar/.test(n)), J(nomesM));
  t("  a tabela das cabeças de coisa existe e lê «elixir», «poção», «chave»", ["elixir", "pocao", "chave"].every((w) => EM_CENA_NAO_E_GENTE.includes(w)));
  t("  a tela passa os mortos da sessão (contextoDoEmCena)", /mortos: Array\.isArray\(derrotadosDaSessaoRef\.current\) \? derrotadosDaSessaoRef\.current : \[\]/.test(app));
  t("T41: o ausente lido antes da ida não corta quem está no lugar de chegada (o conferente do turno guarda o lugar da frase)",
    /lugarDaFrase: \(lugarRef\.current && lugarRef\.current\.nome\) \|\| ""/.test(app) && /cf = \{ \.\.\.cf, ausente: null, ausentes: \[\] \}/.test(app));
}

sec("7. o lugar: «o degrau da capela» não é o Balcão do Degrau; o terreno é o do lugar");
{
  const lugares = [{ nome: "Balcão do Degrau", tipo: "feira do andar", onde: "dentro" }, { nome: "Arco Pálido", tipo: "portal", onde: "dentro" }, { nome: "Capela Rachada", tipo: "capela do degrau", onde: "dentro" }, { nome: "A Última Brasa", tipo: "descanso", onde: "dentro" }];
  const l13 = lugarPedido("vou até o degrau da capela com Thalia", lugares);
  t("T13: «vou até o degrau da capela» não leva ao Balcão do Degrau", !l13 || l13.nome !== "Balcão do Degrau", J(l13));
  t("  PAR: «vou até o Balcão do Degrau» leva", (lugarPedido("vou até o Balcão do Degrau", lugares) || {}).nome === "Balcão do Degrau");
  t("  PAR: «vou ao Arco Pálido» leva", (lugarPedido("vou ao Arco Pálido", lugares) || {}).nome === "Arco Pálido");
  t("a luta no Arco Pálido (um portal) com o confronto da quest abre na pedra da cidade, não na caverna",
    cenarioDe({ lugar: { nome: "Arco Pálido", distancia: "dentro", tipoDoLocal: "portal" }, cidade: "Andar 1 — do Sino", covil: true }) === "cidade");
  t("  PAR: o covil que nada diz (sítio fechado sem nome nem tipo da tabela) continua caverna", cenarioDe({ lugar: { nome: "Molhe Velho", distancia: "dentro" }, cidade: "Ponta Quebrada", covil: true }) === PLANTA_DO_LUGAR.covil);
  t("  a planta da luta recebe o tipo do sítio (lugarComOTipoDaBase), em calou", /const lT = typeof lugarComOTipoDaBase === "function" \? lugarComOTipoDaBase\(\) : null;/.test(app));
}

sec("8. as sobras: o recolher sem pedido, a procura «aqui», o «Partir» sem caminho");
{
  const chao = [{ id: "e1", nome: "Elixir de Intelecto" }];
  t("T40: «tomo a paciência de Aldric e guardo para mim» não recolhe o elixir do chão (o «a» é artigo)", aMaoDaFrase("tomo a paciência de Aldric e guardo para mim", { chao, bolsa: [] }).pegar.length === 0);
  t("  PAR: «pego-o e guardo», com uma coisa só no chão, recolhe", J(aMaoDaFrase("pego-o e guardo", { chao, bolsa: [] }).pegar) === J(["e1"]));
  t("  PAR: «pego o elixir» recolhe pelo nome", J(aMaoDaFrase("pego o elixir de intelecto", { chao, bolsa: [] }).pegar) === J(["e1"]));
  /* T2 («Thalia está aqui — Arco Pálido» dito no largo): NÃO consertado. A regra da casa (teste-sessao-9-historia)
     diz que, na cidade sem sítio, quem tem posto nela «está aqui»; mudar isso é mudar o modelo de presença */
  t("T52: o cartão «Partir» leva a trava da forma antes do clique (impedido: sem botão que mente)",
    /const tv = travaDaFormaDaqui\(d\.destino\); if \(tv\) impedidoV = falaDaTrava\(tv\);/.test(app) && /impedido: limpo\(l\.viagem\.impedido\)/.test(lerSrc(path.join("motor", "a-proposta-da-frase.js"))));
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\ntudo verde");
process.exit(falhas ? 1 : 0);
