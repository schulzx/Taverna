/* ============================================================
   A1 · B1–B9 — O RELATO TEM CASA PRÓPRIA, E O APP DIZ O QUE MUDOU
   (10/10/2026)

   B1: o registo da página (o laço de `agruparMensagens`, o
   `BlocoSistema`, as portas da seta) saiu do `App.jsx` para
   `src/painel-relato.jsx`. B2–B9: o App passou a escrever o que o relato
   e a mesa de batalha leem — o `recibo` do turno, o `naLuta` do turno da
   vitória, o `fimDaLuta`, o espólio — e a calar o que o `jogo` cortou
   (`mente/a1-jogo.md` §2 e §4).

   A suíte guarda o lado do App. O lado do `Relato` é da mesa (o
   `aprendiz` constrói a dobra e o recibo em `painel-relato.jsx` e prova-os
   em `teste-a1-moradas.mjs`); aqui só se cobra a INTERFACE entre os dois —
   a assinatura do `Relato`, as props, a forma dos campos.

   O que é conta é corrido em Node: as funções puras do recibo moram no
   topo do App, fora do componente, e são lidas deste arquivo e corridas
   aqui (como o carimbo `naLuta`). O resto é fiação, e lê-se como texto
   (JSX não corre em Node sem transformação), como `teste-r3-campo-do-turno`
   já faz com o gesto do campo.
   ============================================================ */
import { readFileSync } from "node:fs";
import { reciboDoTurno } from "../src/glifos.js";
import { etapaAtual, textoDaEtapa } from "../src/missoes.js";

const ler = (x) => readFileSync(new URL(x, import.meta.url), "utf8").split(String.fromCharCode(13)).join("");
const APP = ler("../src/App.jsx");
const RELATO = ler("../src/painel-relato.jsx");

let bons = 0, maus = 0;
const t = (o, cond, extra = "") => {
  if (cond) { bons++; console.log("  ok  " + o); }
  else { maus++; console.log("  XX  " + o + (extra ? "\n      → " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const corpoDe = (inicio, fim, de = 0) => {
  const i = APP.indexOf(inicio, de);
  if (i < 0) return "";
  const j = APP.indexOf(fim, i + inicio.length);
  return j < 0 ? "" : APP.slice(i, j + fim.length);
};

sec("1. O RELATO MORA NO MÓDULO DELE");
/* B1 → B2 (10/10): a primeira versão desta secção contava as peças de
   dentro de `painel-relato.jsx` (o laço, o bloco, "exatamente dois
   componentes"). No B2 o arquivo passou a ser da mesa, e o `aprendiz`
   está a pôr lá a dobra da luta, a do dia e o recibo — contar-lhe as
   peças era cobrar a forma de um arquivo que não é deste lado. Fica o
   que é contrato: a assinatura, que o relato não alcança o App, que nada
   do relato voltou ao App, e a lei do foco (nenhum componente nasce dentro
   de um render). */
t("painel-relato.jsx exporta `Relato` com a assinatura do contrato", /export function Relato\(\{ mensagens, carregando = false, voz = null, abertura = null, aoAbrir, aoOuvir \}\)/.test(RELATO));
t("e NENHUM pedaço do relato voltou ao App.jsx",
  !/function BlocoSistema\(|function portaDaLinhaDeSistema\(|function semSetaQueMente\(|const PORTAS_DO_SISTEMA|const SETA_DA_PORTA|agruparMensagens\(/.test(APP),
  "o relato é da mesa: um pedaço dele de volta no App pede o bastão outra vez");
t("os componentes do relato são do módulo, nunca de dentro de um render",
  !/^\s+(const|function) [A-Z]\w* = \(|^\s+function [A-Z]\w*\(/m.test(RELATO));

sec("2. O APP PASSA O QUE O LAÇO LIA, E SÓ ISSO");
const chamada = (APP.match(/<Relato [^\n]*\/>/) || [""])[0];
t("o App renderiza `<Relato …/>` uma vez", (APP.match(/<Relato /g) || []).length === 1 && !!chamada);
for (const [prop, de] of [["mensagens", "mensagens"], ["carregando", "carregando"], ["voz", "voz"], ["abertura", "abertura"], ["aoAbrir", "abrirPortaDoSistema"], ["aoOuvir", "ouvirMestre"]]) {
  t(`  ${prop}={${de}}`, chamada.includes(`${prop}={${de}}`));
}
t("o App importa `Relato` de `painel-relato.jsx`", /import \{ Relato \} from "\.\/painel-relato\.jsx";/.test(APP));
t("o relato não alcança o App por outro caminho (nenhum import do App)", !/from "\.\/App\.jsx"/.test(RELATO));

sec("3. naLuta — carimbado na ENTRADA, com a luta aberta OU a fechar");
const corpoPush = (() => {
  const i = APP.indexOf("const pushMsgs = useCallback((novas) => {");
  return i < 0 ? "" : APP.slice(i, APP.indexOf("}, []);", i));
})();
/* B1 → B2: o carimbo dizia `combateRef.current && …`, e o golpe final, o
   espólio e o "acabou" do turno da vitória chegavam com `combateRef` já
   vazio — ficavam fora da dobra. A luta que FECHOU e cujo turno ainda
   corre (`fechoDaLutaRef`) também carimba. A intenção é a mesma; a régua
   passou a ser o turno, não o instante. */
t("pushMsgs carimba com a luta aberta ou com a luta a fechar",
  /if \(\(combateRef\.current \|\| fechoDaLutaRef\.current\) && Array\.isArray\(novas\)\) novas = novas\.map\(/.test(corpoPush));
t("e quem vê abrir e fechar a luta corre ANTES do carimbo, em try/calou",
  /try \{ acompanharALuta\(\); \} catch \(e\) \{ calou\("acompanhar a luta", e\); \}\s*\n\s*try \{\s*\n\s*if \(\(combateRef/.test(corpoPush));
t("o carimbo está em try/calou, ANTES da retenção do portão (a mensagem retida também leva a marca)",
  /try \{[\s\S]*?naLuta: true[\s\S]*?\} catch \(e\) \{ calou\("carimbar naLuta na mensagem", e\); \}\s*\n\s*if \(seguraRef\.current\)/.test(corpoPush));

/* A PROVA QUE VALE: a expressão do carimbo é lida do App e corrida aqui,
   não copiada à mão. */
const expr = (corpoPush.match(/novas = (novas\.map\(\(m\) => \(.*?\)\));/) || [])[1];
t("a expressão do carimbo é legível do App", !!expr);
if (expr) {
  const carimbar = new Function("novas", `return ${expr};`);
  const jog = { autor: "jogador", texto: "golpeio" }, sis = { autor: "sistema", texto: "⚔ 6" };
  const out = carimbar([jog, sis, null]);
  t("o eco do jogador leva a marca", out[0].naLuta === true && out[0].autor === "jogador" && out[0].texto === "golpeio");
  t("a linha do sistema leva a marca", out[1].naLuta === true);
  t("imutável: a mensagem original não foi tocada", jog.naLuta === undefined && sis.naLuta === undefined && out[0] !== jog);
  t("e lixo passa intacto", out[2] === null);
  const ja = { autor: "mestre", texto: "x", naLuta: true };
  t("a que já tem a marca não é copiada outra vez", carimbar([ja])[0] === ja);
}
const acompanhar = corpoDe("const acompanharALuta = () => {", "\n  };");
t("a luta que fecha FORA de um turno não fica a carimbar: encerra-se no próximo tique",
  /if \(!turnoDoReciboRef\.current\) \{[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?encerrarOFechoDaLuta\(f, fichaViva\(\)\)/.test(acompanhar));
t("e o chão da luta é o que caiu DESDE a abertura (o que já lá estava não é espólio)",
  /!\(f\.idsNoChao \|\| \[\]\)\.includes\(it\.id\)/.test(acompanhar));

sec("4. O RECIBO E O FIM DA LUTA — as contas, corridas em Node");
/* B1 deixou aqui uma asserção TEMPORÁRIA — "o App ainda NÃO escreve
   `recibo`" — que guardava o sítio até B2. B2 chegou e ela inverte-se: o
   App escreve, pela ficha, e a conta é esta. */
const blocoPuro = (() => {
  const i = APP.indexOf("const DESFECHOS_DA_LUTA = [");
  const j = APP.indexOf("import { bonusProficiencia", i);
  return i < 0 || j < 0 ? "" : APP.slice(i, j);
})();
t("as funções puras do recibo moram no topo do App, fora do componente", blocoPuro.length > 500 && APP.indexOf("const DESFECHOS_DA_LUTA") < APP.indexOf("export default function Taverna()"));
let P = null;
try {
  P = new Function("reciboDoTurno", "etapaAtual", "textoDaEtapa", "calou",
    blocoPuro + "\nreturn { DESFECHOS_DA_LUTA, mensagensComRecibo, mensagensComFimDaLuta, caidosDaLuta, desfechoDoFecho, fimDaLutaDe, portaDoAceite };")(
    reciboDoTurno, etapaAtual, textoDaEtapa, () => []);
} catch (e) { console.log("      (não correu: " + e.message + ")"); }
t("e correm em Node com as dependências que dizem ter", !!P);
if (P) {
  const antes = { moedas: 15, vida: 20, vidaMax: 20, xp: 0, nivel: 1, inventario: [] };
  const depois = { ...antes, moedas: 0, inventario: [{ nome: "Poção de Cura" }] };
  const recibo = reciboDoTurno(antes, depois);
  const lista = [
    { autor: "mestre", texto: "a resposta de ontem" },
    { autor: "jogador", texto: "compro uma poção" },
    { autor: "mestre", texto: "O cambista sorri." },
    { autor: "sistema", texto: "Item obtido: Poção de Cura" },
  ];
  const l2 = P.mensagensComRecibo(lista, { desde: 1, texto: "O cambista sorri.", recibo });
  t("o recibo vai à resposta do Mestre DESTE turno (a primeira depois do envio), e a nenhuma outra",
    l2[2].recibo === recibo && !l2[0].recibo && !l2[3].recibo);
  t("imutável: lista nova, mensagem nova, e as outras são as mesmas", l2 !== lista && l2[2] !== lista[2] && l2[0] === lista[0] && !lista[2].recibo);
  t("recibo vazio não escreve o campo (a lista é a mesma)", P.mensagensComRecibo(lista, { desde: 1, texto: "O cambista sorri.", recibo: [] }) === lista);
  t("texto que não bate não escreve em quem não é", P.mensagensComRecibo(lista, { desde: 1, texto: "outra coisa", recibo }) === lista);
  t("e a resposta que já tem recibo não ganha outro", P.mensagensComRecibo(l2, { desde: 1, texto: "O cambista sorri.", recibo: [{ tipo: "xp", delta: 1, texto: "x" }] }) === l2);
  t("lixo passa intacto", P.mensagensComRecibo(null, { recibo }) === null);

  const luta = [
    { autor: "mestre", texto: "antes" },
    { autor: "jogador", texto: "Ataco lobo 1", naLuta: true },
    { autor: "sistema", texto: "⚔ Todos os inimigos caíram — o combate termina.", naLuta: true },
    { autor: "mestre", texto: "O lobo tomba.", naLuta: true },
    { autor: "sistema", texto: "📋 depois", naLuta: false },
  ];
  const fim = { caidos: ["lobo 1"], rodadas: 2, recibo: [], desfecho: "vitoria" };
  const l3 = P.mensagensComFimDaLuta(luta, fim, { desde: 1 });
  t("o fim da luta vai na ÚLTIMA mensagem marcada `naLuta`", l3[3].fimDaLuta === fim && !l3[2].fimDaLuta && !l3[4].fimDaLuta);
  t("e não escreve aquém do começo da luta", P.mensagensComFimDaLuta(luta, fim, { desde: 4 }) === luta);
  t("nem por cima de outro fim", P.mensagensComFimDaLuta(l3, { ...fim, rodadas: 9 }, { desde: 1 }) === l3);

  t("caídos: derrotado ou a 0, e quem fugiu não caiu",
    JSON.stringify(P.caidosDaLuta({ inimigos: [{ nome: "a", derrotado: true }, { nome: "b", vida: 0 }, { nome: "c", vida: 0, fugiu: true }, { nome: "d", vida: 5 }] })) === '["a","b"]');
  t("os desfechos são os do contrato", JSON.stringify(P.DESFECHOS_DA_LUTA) === '["vitoria","fuga","queda","encerrada"]');
  t("quem fugiu escapou", P.desfechoDoFecho({ desfecho: "vitoria" }, { vida: 5 }, true) === "fuga");
  t("o herói a 0 tombou — menos quando venceu", P.desfechoDoFecho({ desfecho: "encerrada" }, { vida: 0 }) === "queda" && P.desfechoDoFecho({ desfecho: "vitoria" }, { vida: 0 }) === "vitoria");
  t("fora da tabela, `encerrada`", P.desfechoDoFecho({ desfecho: "empate" }, { vida: 3 }) === "encerrada" && P.desfechoDoFecho(null, null) === "encerrada");
  const f = P.fimDaLutaDe({ fichaNaAbertura: antes, caidos: ["lobo 1", "lobo 1", "lobo 2"], rodadas: 0, desfecho: "vitoria" }, depois);
  t("o fim da luta: caídos sem repetição, rodadas ≥ 1, e o recibo é o da FICHA (abertura → fecho)",
    JSON.stringify(f.caidos) === '["lobo 1","lobo 2"]' && f.rodadas === 1 && JSON.stringify(f.recibo) === JSON.stringify(recibo) && f.desfecho === "vitoria");

  const missao = { titulo: "O que há no Oratório", etapas: [{ tipo: "falar_com", alvo: "Cora Guarda-Portão" }] };
  const porta = P.portaDoAceite(missao);
  t("a porta do aceite: seta, Diário, título e o próximo passo",
    porta.startsWith("▸ Diário — O que há no Oratório · próximo: ") && porta.length > 45, porta);
  t("e o nome antes do travessão é a aba (a regra de leitura de `portaDaLinhaDeSistema`)",
    porta.slice(2).split("\u2014")[0].trim() === "Diário");
  t("sem números de paga (a soleira mostrou-os antes do clique)", !/◉|XP|fama|paga/.test(porta));
}

sec("5. B2 — a foto, a espera do Cronista, o fim do turno");
const enviar = corpoDe("const enviar = useCallback(async (conteudo, persAtual, histBase) => {", "}, [historico, mensagens, aplicarResposta, salvar, nomeCampanha, mundo]);");
t("o `enviar` tira a foto do recibo DEPOIS da foto do desfeito (o topo de MM15 fica onde estava)",
  enviar.indexOf("fotoEnvio = fotografarOTurno(") > 0 && enviar.indexOf("fotoEnvio = fotografarOTurno(") < enviar.indexOf("turnoDoReciboRef.current = {"));
t("a foto guarda a ficha do envio, o índice da resposta e se o turno começou numa luta",
  /fichaNoEnvio: fichaViva\(\) \|\| persAtual \|\| personagem,/.test(enviar) && /inicio: mensagensRef\.current\.length,/.test(enviar) && /lutaNoEnvio: !!\(combateRef\.current \|\| fechoDaLutaRef\.current\),/.test(enviar));
t("um recibo ainda à espera fecha no envio seguinte (nunca conta duas vezes)",
  /if \(reciboPendenteRef\.current\) fecharORecibo\(reciboPendenteRef\.current\.id,/.test(enviar));
t("o recibo espera o Cronista, e o Cronista calado ou caído não o impede",
  /Promise\.resolve\(doCronista\)\.then\(fimDoCronista, \(\) => fimDoCronista\(null\)\)/.test(enviar) && /catch \{ if \(fimDoCronista\) fimDoCronista\(null\); \}/.test(enviar));
t("no fim do turno a luta que fechou pára de carimbar e o fim dela segue com o recibo",
  /turnoDoReciboRef\.current = null;[\s\S]*?fechoDaLutaRef\.current = null;[\s\S]*?reciboPendenteRef\.current = \{ \.\.\.reciboPendenteRef\.current, fecho: f \};[\s\S]*?else encerrarOFechoDaLuta\(f, fichaViva\(\)\);/.test(enviar));
t("e isso vem DEPOIS de o portão soltar o que retinha (que sai carimbado)",
  enviar.indexOf("liberarPortao(null); } catch { }") > 0 && enviar.indexOf("liberarPortao(null); } catch { }") < enviar.indexOf("turnoDoReciboRef.current = null;"));
const fechar = corpoDe("const fecharORecibo = (id, depois) => {", "\n  };");
t("turno que começou numa luta não tem recibo próprio (o da luta conta)", /const recibo = p\.lutaNoEnvio \? \[\] : reciboDoTurno\(p\.fichaNoEnvio, p\.aberturaNoTurno \|\| depois\);/.test(fechar));
t("o Cronista devolve a ficha que deixou", /if \(!msgs\.length && !tocouCanone && !tocouElenco\) return p;/.test(APP) && /salvar\(\{ personagem: p \}\);\s*\n(\s*\/\*[\s\S]*?\*\/\s*\n)?\s*return p;\s*\n\s*\} catch \{ \/\* o cronista NUNCA/.test(APP));
t("os 'antes' esquecem-se na campanha nova, no save carregado e no turno desfeito",
  (APP.match(/try \{ esquecerORecibo\(\); \} catch \(e\) \{ calou\("esquecer o recibo/g) || []).length === 3);
t("quem fecha a luta e sabe como diz: a vitória do golpe e a vitória declarada",
  /notarFechoDaLuta\(\{ combate: c, desfecho: caidosDaLuta\(c\)\.length \? "vitoria" : "encerrada" \}\);\s*\n\s*combateRef\.current = null;/.test(APP)
  && /if \(resp\.mudancas\.__vitoriaAuto\) \{[\s\S]{0,300}?notarFechoDaLuta\(\{ combate: combateAntes, desfecho: "vitoria"/.test(APP));
t("`reciboDoTurno` vem de glifos.js (a conta é uma, a da mesa)", /rascunhoDe, reciboDoTurno \} from "\.\/glifos\.js";/.test(APP));

sec("6. B3 — o clique registra calado, e o aceite é uma porta");
t("o eco \"Pego o cartaz\" saiu da boca do jogador", !/autor: "jogador", texto: `Pego o cartaz/.test(APP));
t("o cartaz do mural e a missão cara a cara dão a MESMA porta",
  /\{ autor: "sistema", texto: portaDoAceite\(aceita\) \}/.test(APP) && /pushMsgs\(\[\{ autor: "sistema", texto: portaDoAceite\(m\) \}\]\);/.test(APP));
t("e as linhas de cinco números do aceite sumiram", !/Missão aceita: \$\{m\.titulo\}/.test(APP) && !/primeiro passo: \$\{textoDaEtapa\(e\)\}/.test(APP));

sec("7. B4 · B5 · B6 — o mural, o chão, as marcas");
const pregar = corpoDe("const pregarNoMural = (cartaz) => {", "\n  };");
t("B4: o mural não prega trabalho de quem já tem trabalho ATIVO comigo",
  /q\.status === "ativa" && q\.dador && semNome\(q\.dador\) === semNome\(cartaz\.dador\)/.test(pregar) && /if \(comigo\) return false;/.test(pregar));
t("B5: a oferta do chão só existe na cena onde a coisa caiu",
  /if \(noChao && chao && chao\.cena && chao\.cena !== cenaDoChao\(\)\) noChao = 0;/.test(APP));
const trilho = corpoDe("function TrilhoAbas(", "\n}\n");
t("B6: o contador violeta de GESTÃO saiu do trilho e do alforje",
  !/nGrupo/.test(trilho) && !/contador: a\.id === "gestao"/.test(APP) && /contador: 0,/.test(APP));
t("B6: o trilho acende a marca na porta da coisa (a forma da fita do alforje)",
  /marcas\.includes\(aba\.id\)[\s\S]{0,200}?<MarcaDaPorta estado="novo" \/>/.test(trilho) && /<TrilhoAbas [^\n]*marcas=\{marcasDaPorta\}/.test(APP));
t("B6: e o retrato só acende quando o trilho não está à vista",
  /const trilhoAVista = useMesa\(\);\s*\n\s*const estadoDaPorta = aba \? "aberta" : \(marcasDaPorta\.length && !trilhoAVista\) \? "novo" : "porta";/.test(APP));

sec("8. B7 — o espólio e o chão vão para a mesa de batalha no fim");
const tela = corpoDe("const telaDaBatalha = emBatalha ? (", ") : null;");
t("a TelaDeBatalha recebe `espolio` e `aoRecolher` (o contrato)",
  /espolio=\{espolioDaLuta\}/.test(tela) && /aoRecolher=\{\(id\) => \{ try \{ recolherDoChao\(\[id\]\); \} catch \(e\) \{ calou\(/.test(tela));
const esp = corpoDe("const espolioDaLuta = (() => {", "})();");
t("o espólio só existe no fim (sem luta viva, com fecho conhecido) e em try/calou",
  /if \(!emBatalha \|\| combate \|\| !fimDaLuta \|\| !fechoNaTela \|\| !personagem\) return null;/.test(esp) && /calou\("o espólio do fim da luta", e\); return null;/.test(esp));
t("{ desfecho, recibo, noChao }: o recibo da ficha VIVA desde a abertura, e o recolhido marcado",
  /desfecho: desfechoDoFecho\(fechoNaTela, personagem, !!fugiuNoFim\)/.test(esp) && /recibo: reciboDoTurno\(fechoNaTela\.fichaNaAbertura, personagem\)/.test(esp) && /recolhido: !noChaoAgora\.has\(it\.id\)/.test(esp));

sec("9. B8 — o sistema não fala de si (as frases que moram no App)");
for (const [peca, rx] of [
  ["#11 os sistemas do mundo", /O mundo e os seus sistemas/],
  ["#28 o sistema pediu prova", /O sistema pediu prova/],
  ["#33 o sistema assume a viagem", /o sistema assume clima/],
  ["#33 a senha da viagem", /escreva que segue viagem para avançar/],
  ["#36 o caminho de menu do mercado", /Gestão › Mercado\./],
  ["#40 reconhecido pelo sistema", /\(reconhecido pelo sistema\)/],
  ["#40 veja o Diário", /veja o Diário\./],
  ["#43 o sistema de etapas", /anterior ao sistema de etapas/],
  ["#47 o sistema reconheceu", /O sistema reconheceu/],
  ["#57 o sistema lê a jornada", /o sistema lê sua jornada/],
  ["#66 equipe no Códex", /\(equipe no Códex\)/],
  ["#67 a mesa não anda", /a mesa não anda sem a palavra do Mestre/],
  ["#68 o sistema tropeçou", /O sistema tropeçou/],
  ["#68 não consegui dar voz", /Não consegui dar voz ao Mestre/],
  ["#69 o arquivista propôs", /O arquivista propôs/],
  ["#69 o caminho de menu da recalibração", /Confira Gestão:/],
  ["#109 tokens", /sem gastar tokens/],
  ["#110 o sistema rola a bancada", /O sistema rola a bancada/],
  ["#111 o sistema rola por trás", /quando o sistema rola por trás/],
  ["#112 o Cronista escreve", /o Cronista escreve a campanha/],
  ["#131 nenhuma voz inventa regra", /nenhuma voz inventa regra/],
  ["#131 o sistema está traduzindo", /o sistema está traduzindo/],
]) t(`saiu: ${peca}`, !rx.test(APP));
t("#36: o mercado é uma porta, nas duas falas que o ditavam",
  /"▸ Mercado — há mantimentos à venda aqui"/.test(APP) && /"▸ Mercado — veja o que ele traz"/.test(APP));
t("#27 · #140: a margem mora no véu, pela MESMA conta do desfecho",
  /const dm = desfechoDaMargem\(rolagem\.desafio, \{ total, dc, critico, desastre, emCombate: !!emCombate \}\);/.test(APP)
  && /fio === "quase" \? "Por um fio"/.test(APP) && /aoConcluir=\{concluirRolagem\} emCombate=\{!!combate\}/.test(APP));

sec("10. B9 — a linha do golpe deles diz o dano depois da reação");
t("a linha guarda o seu lugar e o dano que veio antes da reação",
  /const iDoGolpe = linhasSis\.length, danoQueVeio = a\.r\.dano;/.test(APP));
t("e é reescrita com as duas pontas e quem as separou, em try/calou",
  /danoQueVeio \+ " → " \+ rc\.danoFinal \+ " de dano" \+ \(nomeDaReacao \? " \(" \+ nomeDaReacao \+ "\)" : ""\)/.test(APP) && /calou\("a linha do golpe depois da reação", e\)/.test(APP));

console.log(`\n${bons} ok, ${maus} falhas`);
process.exit(maus ? 1 : 0);
