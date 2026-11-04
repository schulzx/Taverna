/* A FICHA DE ATOR (03/11, o Narrador ator, etapa 1) — src/motor/ficha-de-ator.js

   A pessoa decidiu em 03/11 (mente/plano-narrador-ator.md) que o Narrador
   passa a ser só a boca: o sistema decide, a ficha entrega, o ator diz. A
   etapa 1 é a ficha — cada linha da pauta vira um fato de cena ou uma
   vontade de alguém presente, nunca uma ordem, uma razão ou um rótulo.

   O que esta suíte prova:
   §1 as tabelas: a forma da ficha, os motivos fechados do corte, os números
      ditos em palavras (o corpo, a distância, a hora), o registo de fala,
      o trato do herói, a ordem do corte (sem a voz), o verificador;
   §2 o verificador apanha cada coisa que proíbe, e deixa passar a fala
      citada e o «mestre» de guilda;
   §3 o lixo (null, {}, tipos errados) não estoura, o estado que entra não
      muda, e a mesma entrada dá a mesma ficha;
   §4 os casos à mão: o «não sei» do RUMO vira fato sobre quem responde
      (e nunca a frase pronta), o dado escolhe o ramo da aposta, o golpe
      resolvido na frase vira corpo dito em palavras, quem a frase chama e
      não está é fronteira, e A VOZ NUNCA CAI — nem com a ficha a transbordar;
      A LUTA INTEIRA (03/11, depois do teste às cegas): cada forma que o App
      monta para a luta — o golpe de quem quer que seja, o companheiro, a
      fuga, o herói que cai, o golpe e as habilidades do herói, as aflições,
      o golpe nas costas, a luta sem saída — sai das peças que a produzem e
      chega ao ACONTECEU como fato, sem número nem rótulo; e a mesma pessoa
      com dois nomes é uma linha só nas FRONTEIRAS;
   §5 A PROVA sobre os casos reais: as 147 frases das sessões gravadas pelo
      caminho do servidor (oPedidoNoServidor) e os 287 de pedido-bloco.mjs —
      0 rótulos, 0 linhas sem tradução, todo motivo da lista, os nomes e os
      preços que a pauta deu estão na ficha, o tamanho dentro da meta, a voz
      do núcleo em quem tem bloco, e nenhum tique em quem não o tem;
   §6 o modo `mestre` não muda um byte: as 287 fotos do pedido, montadas no
      mesmo processo em que a ficha corre, batem com o dourado, e nenhuma
      peça do pedido de hoje importa a ficha. */
import fs from "node:fs";
import {
  aFichaDeAtor, verificarAFicha, FICHA_DE_ATOR, MOTIVOS_DO_CORTE, CORPO_FALADO, DISTANCIA_FALADA, PERIODO_DO_DIA,
  REGISTOS_DE_FALA, TRATO_DO_HEROI, ORDEM_DO_CORTE, ROTULOS_PROIBIDOS, CRIVO_DA_ORDEM, FRASE_DO_SISTEMA,
  TRADUCAO_DA_PAUTA, TRADUCAO_DOS_ENVELOPES, A_ULTIMA_PALAVRA, O_DADO_NA_FRASE, oDadoDaFrase, A_LUTA_DITA,
  O_QUE_A_FRASE_FAZ, A_INTENCAO_DITA, A_VOZ_DO_NUMERO, O_COMBINADO, A_CONVERSA_DA_FRASE, A_RESPOSTA_DITA,
  A_VOZ_QUE_PERGUNTA, A_ABERTURA_DITA, A_VOZ_QUE_MARCA, A_ESTRADA_DITA,
} from "../src/motor/ficha-de-ator.js";
import { abrirViagem, ESTADOS as ESTADOS_DA_VIAGEM } from "../src/viagem.js";
import { QUER, nucleoDaCampanha } from "../src/nucleo.js";
import { oPassoNaCidade } from "../src/motor/tempo-do-turno.js";
import { garantirAbertura, pedidoDaAbertura } from "../src/abertura.js";
import { envelopeDaCena } from "../src/biblioteca.js";
import { JOGADAS as estante } from "../src/estante.js";
import { marcaDaEtapa } from "../src/batidas.js";
import { oEnvelopeDoAcampamento, oEnvelopeDoJogador, oEnvelopeDoTempo } from "../src/motor/envelopes-do-turno.js";
import { compraNaFrase, envelopeDaCompra, vetoDaCompra, dadivaNaFrase, envelopeDaDadiva } from "../src/bolsa-da-frase.js";
import { balcaoDeMantimentos } from "../src/mercado.js";
import { garantirCoracaoDoSave } from "../src/nucleo.js";
import { LINHA_DO_CORACAO } from "../src/subtramas.js";
import { VOZ_PRESA } from "../src/nucleo.js";
import { BOATO } from "../src/boatos.js";
const tpl = (s, v) => String(s).replace(/{([A-Z])}/g, (_, k) => (v[k] != null ? v[k] : ""));
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
import { linhaParaMestre, SEVERIDADES } from "../src/combate.js";
import { oEnvelopeDaFicha, oEnvelopeDosPoderes, oEnvelopeDoDesfecho, oEnvelopeDoCorpo } from "../src/motor/envelopes-do-turno.js";
import { rolarAflicao } from "../src/aflicoes.js";
import { aplicarSemSaida, DESFECHOS_SEM_SAIDA } from "../src/saida-da-luta.js";
import { osTiquesDoOficio } from "../src/motor/pedido-do-ator.js";
import { envelopeDoTeste } from "../src/testes.js";
import { apostas, situacaoQueCasa } from "../src/mesa-posta.js";
import { SECOES } from "../src/pauta.js";
import { COMO_FALA } from "../src/nucleo.js";
import { oPedidoNoServidor } from "../src/turno-no-servidor.js";
import { estadoNoTurno } from "../src/sessao.js";
import { oPedidoDoTurno } from "../src/motor/pedido-do-turno.js";
import { lerODourado, casosDoPedido, correrAPeca, fotoDoPedido, fotoGuardada, mesmaFoto, osModulos, osPadroes } from "./pedido-bloco.mjs";
import { N_DA_PAUTA } from "./pauta-bloco.mjs";

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);
const congelar = (x) => { if (x && typeof x === "object") { Object.freeze(x); for (const v of Object.values(x)) congelar(v); } return x; };

sec("§1 as tabelas");
t("a ficha tem sete partes, e começa pela CENA e acaba nas FRONTEIRAS", FICHA_DE_ATOR.partes.length === 7 && FICHA_DE_ATOR.partes[0] === "CENA" && FICHA_DE_ATOR.partes[6] === "AS FRONTEIRAS");
t("o teto da ficha é o da meta do plano (1 a 2 mil caracteres)", FICHA_DE_ATOR.teto >= 1000 && FICHA_DE_ATOR.teto <= 2000);
t("só «sem tradução» é defeito entre os motivos do corte, e cada motivo diz porquê", "semTraducao" in MOTIVOS_DO_CORTE && Object.values(MOTIVOS_DO_CORTE).every((o) => typeof o === "string" && o.length > 20));
t("o corpo vai do inteiro ao chão, sem buraco", CORPO_FALADO[0].desde === 1 && CORPO_FALADO[CORPO_FALADO.length - 1].desde === 0 && CORPO_FALADO.every((c, i) => i === 0 || c.desde < CORPO_FALADO[i - 1].desde));
t("a distância cobre qualquer número de metros", DISTANCIA_FALADA[DISTANCIA_FALADA.length - 1].ate === Infinity && DISTANCIA_FALADA.every((d, i) => i === 0 || d.ate > DISTANCIA_FALADA[i - 1].ate));
t("a hora cobre o dia inteiro (0 a 1440 minutos)", PERIODO_DO_DIA[PERIODO_DO_DIA.length - 1].ate === 1440 && PERIODO_DO_DIA.every((p, i) => i === 0 || p.ate > PERIODO_DO_DIA[i - 1].ate));
t("o registo de fala: ids únicos, cada um com o jeito e uma expressão que lê o ofício", new Set(REGISTOS_DE_FALA.map((r) => r.id)).size === REGISTOS_DE_FALA.length && REGISTOS_DE_FALA.every((r) => r.de instanceof RegExp && r.o.length > 10));
/* MOVIDA (03/11, a 14.ª sessão, conserto 2): dizia «a fera não tem exemplo
   de fala» (`exemplos.length === 0`). Nenhum registo tem exemplo agora — a
   frase pronta copiava-se («De graça, só o conselho.» em 5 de 29 respostas)
   —, e a intenção da asserção (a fera não fala) fica, com a nova ao lado */
t("a fera não fala", REGISTOS_DE_FALA[0].id === "fera" && /não fala/.test(REGISTOS_DE_FALA[0].o));
t("e nenhum registo traz frase pronta: só o jeito descrito, sem aspas", REGISTOS_DE_FALA.every((r) => !("exemplos" in r) && !/["“«]/.test(r.o)));
t("o trato do herói acaba num que serve a toda a gente", TRATO_DO_HEROI[TRATO_DO_HEROI.length - 1].quando({}) === true);
t("o vínculo do grupo sobe o trato: 10 estrada, 30 confiança, 60 amizade, 80 lealdade",
  ["estrada", "confianca", "amizade", "lealdade"].every((id, i) => TRATO_DO_HEROI.find((x) => x.quando({ vinculo: [10, 30, 60, 80][i] })).id === id));
t("A VOZ NÃO ESTÁ NA ORDEM DO CORTE (nem o tique, nem o registo, nem o trato)", !ORDEM_DO_CORTE.some((k) => /voz|tique|registo|trato|fala/.test(k)));
t("o crivo e a frase do sistema são expressões", Object.values(CRIVO_DA_ORDEM).every((x) => x instanceof RegExp) && Object.values(FRASE_DO_SISTEMA).every((x) => x instanceof RegExp));
const rotulosDaPauta = [...new Set(SECOES.map((s) => s.rotulo))];
const semRegra = rotulosDaPauta.filter((r) => !TRADUCAO_DA_PAUTA[r]);
/* a lista de rótulos é a de pauta.js (SECOES): uma secção nova sem regra
   quebra aqui no dia em que nasce, antes de chegar ao ator como lixo */
t(`toda secção da pauta (SECOES) tem tradução${semRegra.length ? " — faltam: " + semRegra.join(", ") : ""}`, semRegra.length === 0);
t("cada regra de tradução ou cai com um motivo da lista, ou vai a um destino", Object.values(TRADUCAO_DA_PAUTA).flat().every((r) => r.de instanceof RegExp && (r.cai ? r.cai in MOTIVOS_DO_CORTE : typeof r.como === "function")));
t("cada envelope ou cai com um motivo da lista, ou vai a um destino", TRADUCAO_DOS_ENVELOPES.every((r) => r.tipo instanceof RegExp && (r.cai ? r.cai in MOTIVOS_DO_CORTE : typeof r.como === "function")));

/* 03/11, antes do teste às cegas: a última palavra diz DE QUEM é e o que
   quer, nunca a forma — a tabela não pode trazer nenhum dos fechos que o
   diagnóstico da voz (§2, causas 1 a 3) deu como causa de tique */
const formasDaTabela = Object.values(A_ULTIMA_PALAVRA).filter((x) => typeof x === "string").flatMap((x) => osTiquesDoOficio(x));
t(`a tabela da última palavra não pede forma (fala a meio, pergunta direta, dilema)${formasDaTabela.length ? " — " + formasDaTabela.map((x) => x.id).join(", ") : ""}`, formasDaTabela.length === 0);
t("o dado na frase: o fio antes do sucesso (o fio também diz SUCESSO)", O_DADO_NA_FRASE[0].ramo === "fio" && O_DADO_NA_FRASE.every((r) => r.de instanceof RegExp && ["passa", "falha", "fio"].includes(r.ramo)));
/* 03/11, depois do teste às cegas: A LUTA DITA. Cada modelo, preenchido,
   passa no verificador; e a força de cada golpe que combate.js mede chega
   ao ator como vem (o rótulo e o guia), menos o abate, que a tabela diz */
const preenchido = (x) => x.replace(/\{A\}/g, "Falk").replace(/\{B\}/g, "Freya").replace(/\{C\}/g, " (golpe pesado)").replace(/\{S\}/g, "golpe sólido").replace(/\{F\}/g, "mal, a sangrar").replace(/\{[XY]\}/g, "Bênção").replace(/\{L\}/g, "Falk, Freya").replace(/\{H\}/g, "Iara");
t("a luta dita: cada modelo é texto, e nenhum, preenchido, traz rótulo, ordem ou número", Object.values(A_LUTA_DITA).every((x) => typeof x === "string" && x.length > 0) && Object.values(A_LUTA_DITA).every((x) => verificarAFicha(preenchido(x)).length === 0 && !/\d|\{/.test(preenchido(x))));
t("a força de cada golpe (SEVERIDADES, combate.js) passa no verificador tal como vem — o abate e o erro a tabela é que dizem", SEVERIDADES.every((x) => verificarAFicha(`${x.rotulo} — ${x.guia.split(";")[0]}`).length === 0));

sec("§2 o verificador");
const MAUS = [
  ["caixaAlta", "Ninguém sai: NÃO PODE sair."], ["sistema", "o sistema decidiu isto."], ["sistema", "está na pauta."],
  ["narrador", "narre a chegada."], ["mestre", "o Mestre manda."], ["ordem", "A porta abre. Diga o preço."],
  ["fracao", "Freya 10/10 de pé."], ["endereco", "⌖ K11 50,0"], ["metro", "o lobo a 3 m."], ["porcento", "o golpe tirou 57% da vida."],
  ["nivel", "um chefe de nível 16."], ["nivel", "a batida 1 de 4."], ["emoji", "🗝 a guarnição."], ["narrador", "é fato: entra nesta resposta."],
];
for (const [id, linha] of MAUS) t(`apanha ${id}: «${linha}»`, verificarAFicha(linha).some((v) => v.id === id));
t("a fala citada passa (a ameaça decidida pode estar no imperativo)", verificarAFicha("Um servo chega e traz a mensagem: \"Deixe Alto Serena e nenhum dos seus sofre.\"").length === 0);
t("a frase do herói, entre aspas, passa (o jogador pode gritar)", verificarAFicha("Iara: «NARRE ISTO, Mestre!»").length === 0);
t("o «mestre» de guilda, minúsculo, passa", verificarAFicha("Rhogar — mestre de A Confraria de Ferro.").length === 0);
t("o cabeçalho da própria ficha passa", verificarAFicha(FICHA_DE_ATOR.partes.join("\n")).length === 0);
t("o verificador diz a linha e o trecho", (() => { const v = verificarAFicha("CENA\nok.\no sistema."); return v.length === 1 && v[0].linha === 3 && v[0].trecho === "sistema"; })());
t("a tabela do verificador tem ids únicos", new Set(ROTULOS_PROIBIDOS.map((r) => r.id)).size === ROTULOS_PROIBIDOS.length);

function APOSTA0() { return "A APOSTA  Se passa: saltar a fenda com corrida — dê o resultado limpo, sem custo escondido.\n          Se falha: pendurado na borda: segunda decisão, agora pior. A moeda é posição — a cena anda."; }

sec("§3 o lixo, a imutabilidade, o determinismo");
for (const [nome, e] of [["null", null], ["undefined", undefined], ["{}", {}], ["tipos errados", { nota: 5, frase: {}, estado: [], rolagem: 9 }], ["estado com nulos", { nota: "ONDE      em Monte Rasa", estado: { personagem: null, npcs: null, nucleoCache: { nucleo: null }, mensagens: null } }]]) {
  let r = null, erro = null;
  try { r = aFichaDeAtor(e); } catch (x) { erro = x; }
  t(`${nome}: não estoura, e a ficha sai limpa`, !erro && r && typeof r.texto === "string" && r.texto.startsWith("CENA") && verificarAFicha(r.texto).length === 0);
}
const CASO = {
  frase: "Pergunto a Corrado com quem é a conversa sobre o meu irmão. Onde encontro essa pessoa?",
  nota: [
    "[PAUTA DO TURNO 4 — decidido pelo SISTEMA. Abra pelo que eu fiz…]",
    "ONDE      em Largo da Liça, dentro de Porto das Pedras · chuva fina",
    "          comporta: correr, cercar",
    "EM CENA   Corrado (organiza as lutas da liça) · Dunstan Machado Torto (com você); a quem não tem nome: Bruna (ela) · Telmo (ele)",
    "A GENTE   Corrado deixa claro que sabe de uma coisa, e que a coisa tem preço",
    "NÃO PODE  Anselmo está em Vau Seco, a 2 dias daqui — não entra nesta cena sem 48h de estrada narradas",
    "O RUMO    responda primeiro ao que perguntei, com o que está nesta pauta; o que ninguém aqui sabe, quem responde diz que não sabe",
    "O FECHO   termine em alguém em cena deixa uma fala a meio, e acaba nela; sem cuspe, braços cruzados, olhar fixo",
  ].join("\n"),
  estado: {
    minuto: 540, personagem: { nome: "Iara", grupo: [{ nome: "Dunstan Machado Torto", vinculo: 30, classe: "Caçador" }] },
    npcs: { Corrado: { nome: "Corrado", papel: "organiza as lutas da liça", relacao: "desconhecido" } },
    nucleoCache: { nucleo: { pessoas: [{ nome: "Dunstan Machado Torto", papel: "companheiro", ficha: { fala: COMO_FALA.find((f) => f.id === "f_mar"), quer: { o: "ter um teto seu" } } }] } },
    mensagens: [{ autor: "jogador", texto: "entro na liça" }, { autor: "mestre", texto: "A areia está molhada." }],
  },
};
const antes = JSON.stringify(CASO);
const r1 = aFichaDeAtor(congelar(JSON.parse(antes)));
t("o estado que entra (congelado) não muda e não estoura", JSON.stringify(CASO) === antes && typeof r1.texto === "string");
t("a mesma entrada dá a mesma ficha, byte a byte", aFichaDeAtor(JSON.parse(antes)).texto === r1.texto);
t("e o rastro e a cobertura também", JSON.stringify(aFichaDeAtor(JSON.parse(antes)).rastro) === JSON.stringify(r1.rastro));
t("a ficha do caso sai limpa no verificador", verificarAFicha(r1.texto).length === 0);
t("as partes saem na ordem da tabela", (() => { const ix = FICHA_DE_ATOR.partes.map((p) => r1.texto.split("\n").indexOf(p)).filter((i) => i >= 0); return ix.every((v, i) => i === 0 || v > ix[i - 1]); })());

sec("§4 os casos à mão");
const L = r1.texto;
t("o «não sei» do RUMO é um fato de quem responde, com a pergunta que ficou sem resposta", /Corrado — [\s\S]*?Não sabe responder a: «Onde encontro essa pessoa\?»/.test(L));
t("e a frase pronta da pauta («diz que não sabe») não entra", !/diz que não sabe/.test(L));
t("quem responde é quem a frase chama (o Corrado), não o companheiro", r1.pessoas.find((p) => p.nome === "Corrado").naoSabe && !r1.pessoas.find((p) => p.nome === "Dunstan Machado Torto").naoSabe);
/* MOVIDA (03/11, a 14.ª sessão, conserto 2): pedia «o tique e o exemplo»
   («Amarre isso, que vem vento.»). O exemplo era uma frase pronta, e a
   sessão mediu que o ator a copia; a voz inteira é o tique (o jeito), e a
   intenção — a voz do núcleo chega sem cortes — fica */
t("a voz do Dunstan sai do núcleo inteira — o tique, e nenhuma frase pronta para copiar", L.includes("fala como marinheiro em terra firme") && !L.includes("Amarre isso, que vem vento."));
t("o Corrado, que não tem tique, fala pelo registo do ofício e trata a forasteira como forasteira", /Corrado — [^\n]*\n  Fala: frase de negociante/.test(L) && /Corrado[\s\S]*?como a forasteiro/.test(L) && !/Corrado — [^\n]*\n  Fala: [^\n]*(jura|marinheiro)/.test(L));
t("o vínculo de 30 dá ao Dunstan o trato de confiança", /Dunstan[\s\S]*?pelo nome, com confiança/.test(L));
t("o que o Corrado faz (A GENTE) é o seu «Agora», dito do herói", /Agora: deixa claro que sabe de uma coisa, e que a coisa tem preço\./.test(L));
t("o longe vira fronteira, com os dias por extenso e sem as 48h", /Anselmo está longe, em Vau Seco, a dois dias daqui\./.test(L) && !/48h/.test(L));
/* MOVIDA em 03/11 (antes do teste às cegas): esta asserção pedia «É de
   Corrado: uma fala que fica a meio» — a ficha traduzia a FORMA do fecho do
   Mestre, e a fala a meio é o tique maior da voz (diagnóstico §1.1, §2 causa
   1). Decidido: a ficha diz só de quem é a última palavra e o que quer. O
   Corrado do caso não tem querer na ficha, e a última palavra é só dele. */
t("a última palavra é de quem responde, sem a forma e sem o veto do gesto", /A ÚLTIMA PALAVRA\nÉ de Corrado\.\n/.test(L) && !/a meio|cuspe|braços cruzados/.test(L));
t("os nomes à mão vão às fronteiras, e só a gente da ficha fala", /À mão, para quem ainda não tem nome: Bruna, Telmo\./.test(L) && r1.falam.join("|") === "Dunstan Machado Torto|Corrado");
t("a hora é dita em palavras, e o tempo junta-se ao lugar", L.includes("De manhã.") && L.includes("Em Largo da Liça, dentro de Porto das Pedras, com chuva fina."));
t("o que o lugar comporta cai como regra, e a moldura como moldura", r1.cobertura.caidos.regra === 1 && r1.cobertura.caidos.moldura === 1 && r1.rastro.every((x) => x.vai || x.cai in MOTIVOS_DO_CORTE));
t("sem conteúdo decidido, o que se diz é livre", /O QUE SE DIZ\nLivre:/.test(L));
t("as duas últimas trocas vêm tal qual, para a continuidade", r1.trocas.length === 1 && r1.trocas[0].jogador === "entro na liça" && r1.trocas[0].mestre === "A areia está molhada.");

const comPedido = aFichaDeAtor({ ...CASO, nota: CASO.nota + "\nQUEM CARREGA Corrado (quem pôs o herói no caminho; é fato: vem ter com o herói e entra nesta resposta, dito por ele): PEDE ao herói: \"Meio dia de desvio até uma campa.\"" });
t("o pedido do QUEM CARREGA vai inteiro ao que o Corrado diz, e a última palavra passa a ser dele", /O QUE SE DIZ\nCorrado: pede: "Meio dia de desvio até uma campa\."/.test(comPedido.texto) && /É de Corrado/.test(comPedido.texto) && verificarAFicha(comPedido.texto).length === 0);
/* a última palavra com um querer, e com uma pergunta que o SISTEMA decidiu */
const comQuerer = aFichaDeAtor({ frase: "olho a estrada", nota: "O FECHO   termine em alguém em cena faz-me uma pergunta direta, e acaba nela; sem cuspe", estado: CASO.estado });
t("sem conteúdo decidido, o fecho de pergunta vira o querer de quem fica com a palavra — e nenhuma pergunta", /A ÚLTIMA PALAVRA\nÉ de Dunstan Machado Torto, que quer ter um teto seu\./.test(comQuerer.texto) && !/pergunt/i.test(comQuerer.partes["A ÚLTIMA PALAVRA"]));
const comPergunta = aFichaDeAtor({ ...CASO, nota: CASO.nota + "\nQUEM CARREGA Corrado (quem pôs o herói no caminho; é fato: vem ter com o herói e entra nesta resposta, dito por ele): PEDE ao herói: \"Levas esta carta ao Burgo da Prata antes da lua nova?\"" });
t("a pergunta só entra quando o sistema a decidiu, e é a dele (o conteúdo, não a forma)", /É de Corrado, e é a pergunta que tem a fazer a Iara\./.test(comPergunta.texto) && /O QUE SE DIZ\nCorrado: pede: "Levas esta carta ao Burgo da Prata antes da lua nova\?"/.test(comPergunta.texto) && osTiquesDoOficio(comPergunta.partes["A ÚLTIMA PALAVRA"]).length === 0);
const daCena = (fecho) => aFichaDeAtor({ ...CASO, nota: CASO.nota.replace(/O FECHO .*$/m, "O FECHO   termine em " + fecho) }).partes["A ÚLTIMA PALAVRA"];
t("o corte e o dilema ficam com a cena, sem as duas coisas que não cabem juntas", daCena("um corte seco: um facto ou uma ação, numa frase curta") === A_ULTIMA_PALAVRA.cena && daCena("a ficção põe-me nas mãos duas coisas que não cabem juntas, e as duas custam (sem lista de opções)") === A_ULTIMA_PALAVRA.cena);
t("a consequência fica com a cena, e com o herói pelo nome", daCena("a consequência do que eu fiz, visível agora") === "É da cena: a consequência do que Iara fez, à vista.");

const APOSTA = "A APOSTA  Se passa: saltar a fenda com corrida — dê o resultado limpo, sem custo escondido.\n          Se falha: pendurado na borda: segunda decisão, agora pior. A moeda é posição — a cena anda.";
const ap = (rolagem) => aFichaDeAtor({ nota: APOSTA, frase: "salto", rolagem }).texto;
t("o dado que falhou deixa só o ramo da falha", /O dado decidiu: pendurado na borda: segunda decisão, agora pior\./.test(ap("falha")) && !/saltar a fenda/.test(ap("falha")));
t("sem dado, a aposta fica como o que está em jogo, os dois ramos", /Em jogo, numa tentativa: se passa, saltar a fenda com corrida; se falha, pendurado na borda/.test(ap()) && verificarAFicha(ap()).length === 0);
/* O DADO NA FRASE: no App o dado rola na tela, e só depois o envelope do
   teste vai a `enviar` como a frase do turno; o servidor recebe a mesma
   frase. A pauta desse turno é a que pode trazer A APOSTA com o dado já
   decidido — e a ficha lê-o dali, sem argumento a mais. */
const sitFenda = situacaoQueCasa("salto a fenda"), apFenda = apostas(sitFenda);
const notaFenda = ["A APOSTA  Se " + apFenda.sePassa, "          Se " + apFenda.seFalha, "          Se " + apFenda.noMeio].join("\n");
const tiro = { tipo: "forca", pericia: "atletismo", nivelTreino: "treinada", motivo: "saltar a fenda", valor: 14, mod: 3, total: 17, dc: 12 };
const envPassa = envelopeDoTeste({ ...tiro, resultado: "sucesso" });
const envFalha = envelopeDoTeste({ ...tiro, valor: 5, total: 8, resultado: "falha" });
const envFio = envelopeDoTeste({ ...tiro, valor: 8, total: 11, resultado: "sucesso", meio: { porPouco: true, faixa: "por", faltou: 1, diz: "torce o tornozelo na borda" } });
t("o dado sai do envelope: passa, falha, por um fio", oDadoDaFrase(envPassa) === "passa" && oDadoDaFrase(envFalha) === "falha" && oDadoDaFrase(envFio) === "fio" && oDadoDaFrase("salto a fenda") === null && oDadoDaFrase(null) === null);
const fenda = (frase) => aFichaDeAtor({ nota: notaFenda, frase, estado: { personagem: { nome: "Iara" } } });
const fP = fenda(envPassa), fF = fenda(envFalha), fR = fenda(envFio);
t("A APOSTA com o dado que passou: o resultado em palavras, e só o ramo do sim", /Iara tentou saltar a fenda, e conseguiu\./.test(fP.texto) && /O dado decidiu: saltar a fenda com corrida\./.test(fP.texto) && !/pendurado|Em jogo/.test(fP.texto));
t("A APOSTA com o dado que falhou: só o ramo da falha", /Iara tentou saltar a fenda, e não conseguiu\./.test(fF.texto) && /O dado decidiu: pendurado na borda/.test(fF.texto) && !/com corrida|Em jogo/.test(fF.texto));
t("A APOSTA por um fio: o raspão e o preço que o sistema cobrou", /conseguiu por um fio, pagando: torce o tornozelo na borda\./.test(fR.texto) && /O dado decidiu: alcança o outro lado, e o corpo bate na borda\./.test(fR.texto));
t("e nenhum d20, dificuldade, ordem ou rótulo chega ao ator, nem fica linha sem tradução", [fP, fF, fR].every((f) => verificarAFicha(f.texto).length === 0 && !/d20|dificuldade|\b1[47]\b|REGRA|Revele/.test(f.texto) && f.rastro.every((x) => x.cai !== "semTraducao")));
t("a rolagem dita por argumento ainda manda sobre a frase", /O dado decidiu: pendurado na borda/.test(aFichaDeAtor({ nota: notaFenda, frase: envPassa, rolagem: "falha" }).texto));
const semFio = aFichaDeAtor({ nota: APOSTA0(), frase: envFio }).texto;
t("o fio numa situação sem raspão é o sim", /O dado decidiu: saltar a fenda com corrida\./.test(semFio));
const social = aFichaDeAtor({ frase: "[SOCIAL — RESOLVIDO PELO SISTEMA] Tentei convencer o guarda e NÃO consegui. O que eu pedia era passar o portão, e a resposta é não.", estado: { personagem: { nome: "Iara" } } });
t("o social que falhou: o que se pediu, e o não", /Iara tentou convencer o guarda, e não conseguiu: pedia passar o portão, e a resposta é não\./.test(social.texto) && oDadoDaFrase("[SOCIAL — RESOLVIDO PELO SISTEMA] Tentei convencer o guarda e NÃO consegui.") === "falha" && oDadoDaFrase("[SOCIAL — RESOLVIDO PELO SISTEMA] Tentei convencer o guarda e CONSEGUI.") === "passa");
const golpe = aFichaDeAtor({ frase: "Seguro a ação e observo Turno dos inimigos (resolvido pelo sistema, dano já aplicado — narre só as decisões): Falk (Golpe pesado)→Freya: 8 de dano = golpe devastador (57% da vida dele), de pé com 6/14 [narre como: brutal — quase o derruba de uma vez].", estado: { personagem: { nome: "Marga", grupo: [{ nome: "Freya" }] } } });
t("o golpe resolvido na frase vira fato, com o corpo em palavras e sem o número", /Falk acerta Freya \(golpe pesado\): golpe devastador — brutal — quase o derruba de uma vez; Freya fica mal, a sangrar\./.test(golpe.texto) && !/6\/14|57%|narre/.test(golpe.texto));
t("e a frase do herói fica só com o que ele disse", golpe.texto.includes("Marga: «Seguro a ação e observo»"));
const ausente = aFichaDeAtor({ frase: "Pergunto a Helga quem eram eles.", estado: { npcs: { Helga: { nome: "Helga", local: "Monte Rasa" } } } });
t("quem a frase chama e não está aqui é fronteira, com onde vive", /Helga não está aqui: vive em Monte Rasa, fora desta cena\./.test(ausente.texto) && !ausente.falam.includes("Helga"));
t("«Godfrey» e «Godfrey da Foz» são duas pessoas (o primeiro nome não basta)", aFichaDeAtor({ nota: "EM CENA   Godfrey (carcereiro) · Godfrey da Foz (taverneiro)" }).falam.length === 2);

/* A LUTA INTEIRA (03/11, depois do teste às cegas). A frase gravada de
   s10#58: o turno dos inimigos vazio e o golpe falhado da companheira —
   a ficha cortava os dois sem dizer nada, e nenhum narrador narrou a luta */
const s58 = aFichaDeAtor({ frase: "Seguro a ação e observo, pronto para responder Turno dos inimigos (resolvido pelo sistema, dano já aplicado — narre só as decisões): . Meus companheiros agiram: Saoirse→Capanga da faca: errou.", estado: { personagem: { nome: "Hilda Barbaforte", grupo: [{ nome: "Saoirse" }] } } });
t("s10#58: o golpe falhado da companheira é fato de cena, e quem ficou de pé também", s58.partes.ACONTECEU === "Hilda Barbaforte: «Seguro a ação e observo, pronto para responder»\nSaoirse ataca Capanga da faca, e falha.\nAinda de pé: Saoirse, Capanga da faca.");
/* UMA PESSOA, UMA LINHA: em cena «Godfrey» e «Godfrey da Foz» são dois
   (acima); longe, no mesmo lugar e com a mesma linha, são um, e fica o
   nome mais longo (a regra de vistosDaNarrativa, elenco.js) */
const longeDuplo = aFichaDeAtor({ nota: "NÃO PODE  Godfrey está em Monte Rasa, a 2 dias daqui — não entra nesta cena sem 48h de estrada narradas\n          Godfrey da Foz está em Monte Rasa, a 2 dias daqui — não entra nesta cena sem 48h de estrada narradas\n          Helga está em Alto Serena, a 1 dia daqui — não entra nesta cena sem 24h de estrada narradas", frase: "Pergunto pelo Godfrey." , estado: { npcs: { Godfrey: { nome: "Godfrey", local: "Monte Rasa" }, "Godfrey da Foz": { nome: "Godfrey da Foz", local: "Monte Rasa" } } } });
t("o longe repetido: uma pessoa, uma linha, com o nome mais longo (e o «não está aqui» da mesma pessoa também cai)", (longeDuplo.partes["AS FRONTEIRAS"].match(/Godfrey/g) || []).length === 1 && longeDuplo.texto.includes("Godfrey da Foz está longe, em Monte Rasa, a dois dias daqui.") && longeDuplo.texto.includes("Helga está longe, em Alto Serena, a um dia daqui."));
t("e lugares diferentes são duas pessoas: ficam as duas linhas", (aFichaDeAtor({ nota: "NÃO PODE  Godfrey está em Monte Rasa, a 2 dias daqui — não entra nesta cena\n          Godfrey da Foz está em Ponte Velha, a 3 dias daqui — não entra nesta cena" }).partes["AS FRONTEIRAS"].match(/Godfrey/g) || []).length === 2);

/* cada forma da luta, montada pelas peças que a produzem no App */
const IARA = { personagem: { nome: "Iara", grupo: [{ nome: "Freya" }] } };
const TI = " Turno dos inimigos (resolvido pelo sistema, dano já aplicado — narre só as decisões): ";
const rodada = TI + [linhaParaMestre("Lobo (Mordida)", "Iara", { dano: 3 }, 20, 17), linhaParaMestre("Corvo", "Freya", { dano: 0, resultado: "desastre" }, 10)].join("; ") + ". Meus companheiros agiram: " + [
  linhaParaMestre("Freya", "Corvo", { dano: 9 }, 8, 0) + " — mas foi poupado: cai desacordado, vivo, sem golpe fatal",
  "Freya lançou Cura Menor em Iara (+4 PV, agora 18/20) — o PV JÁ subiu, narre o gesto",
  "Freya usou Poção de Cura em mim — o efeito JÁ está aplicado; narre o gesto, não o número",
  "Freya usou Bênção e deixou no grupo inteiro abençoado — já aplicado, narre o gesto",
  "Freya reforçou uma guarda que já estava de pé — nada mudou na ficha; narre o gesto e não invente efeito novo",
  "Freya usou Canto (efeito de apoio, sem números novos)",
].join("; ") + ".";
const meuGolpe = aFichaDeAtor({ frase: oEnvelopeDaFicha("combateResolvido", { desfecho: `2 ataques: ${linhaParaMestre("Iara", "Lobo", { dano: 5, critico: true }, 20, 12)} — o Ataque Furtivo soma — o golpe sai com vantagem; ${oEnvelopeDoDesfecho("condicao", { alvo: "Lobo", aplicou: true, condicao: "Envenenado" })}; ${linhaParaMestre("Iara", "Lobo", { dano: 0 }, 20)}`, resumoInimigos: rodada, acao: "Avanço sobre o lobo com a adaga" }), estado: IARA });
const A1 = meuGolpe.partes.ACONTECEU;
t("o golpe do herói (COMBATE): a fala é a ação declarada, e cada golpe dele é fato", A1.startsWith("Iara: «Avanço sobre o lobo com a adaga»\nIara acerta Lobo: golpe sólido, em cheio — dói de verdade e o alvo recua um passo; Lobo fica com sangue à vista; Lobo não viu o golpe chegar.\nLobo fica envenenado.\nIara ataca Lobo, e falha."));
t("o turno dos inimigos: o acerto com o corpo que fica, e o erro feio", A1.includes("Lobo acerta Iara (mordida): golpe sólido — dói de verdade e o alvo recua um passo; Iara fica com sangue à vista.") && A1.includes("Corvo ataca Freya, e falha feio."));
t("os companheiros: quem é poupado, a cura, a poção, a bênção, a guarda e o apoio", ["Freya derruba Corvo, mas poupa-lhe a vida: Corvo cai sem sentidos.", "Freya usa Cura Menor em Iara, e as feridas fecham; Iara fica com sangue à vista.", "Freya dá Poção de Cura a Iara.", "Freya usa Bênção, e o grupo inteiro fica abençoado.", "Freya firma de novo a guarda que já sustenta.", "Freya usa Canto."].every((x) => A1.includes(x)));
t("e no fim, quem ficou de pé e quem caiu", A1.endsWith("Ainda de pé: Iara, Lobo, Freya.\nNo chão: Corvo."));
const hab = aFichaDeAtor({ frase: oEnvelopeDosPoderes("habilidadesResolvidas", { lista: `"Bola de Fogo" (5 PM — explode) e depois "Toque Vampírico" (3 PM)`, desfechos: [
  `"Bola de Fogo": ${[oEnvelopeDoDesfecho("golpe", { alvo: "Lobo", resultado: "critico", dano: 12, d20: 18, bonus: 4, total: 22, ca: 13, caiu: true }), oEnvelopeDoDesfecho("area", { alvo: "Corvo", dano: 6 }), oEnvelopeDoDesfecho("fogoAmigo", { lista: "Freya", meio: 3, habilidade: "Bola de Fogo" }), oEnvelopeDoDesfecho("condicao", { alvo: "Corvo", aplicou: false, condicao: "Queimando" })].join("; ")}`,
  `"Toque Vampírico": ${[oEnvelopeDoDesfecho("errou", { alvo: "Corvo", desastre: true, d20: 1, bonus: 2, total: 3, ca: 12 }), oEnvelopeDoDesfecho("drenou", { cura: 4 })].join("; ")}`,
  `"Colheita Final": ${oEnvelopeDoDesfecho("colheita", { nomes: ["Rato"], fracaoTxt: "1/3", habilidade: "Colheita Final" })}`,
  `"Golpe de Misericórdia": ${oEnvelopeDoDesfecho("execucao", { alvo: "Sapo", habilidade: "Golpe de Misericórdia", fracaoTxt: "1/4", vida: 2, vidaMax: 10 })}`,
  `"Raio Geminado": ${[oEnvelopeDoDesfecho("geminada", { alvo: "Corvo", dano: 4 }), oEnvelopeDoDesfecho("golpe", { alvo: "Corvo", resultado: "parcial", dano: 2, d20: 9, bonus: 1, total: 10, ca: 12 }), oEnvelopeDoDesfecho("imune", { alvo: "Dragão", gdAlvo: 9, gdMeu: 2 })].join("; ")}`,
], depois: rodada, acao: "Queimo tudo à minha frente" }), estado: IARA });
t("as habilidades do herói (HABILIDADES): cada parte do desfecho é fato, e a rodada segue depois", ["Iara: «Queimo tudo à minha frente»", "Iara acerta Lobo com Bola de Fogo, em cheio: Lobo cai.", "Bola de Fogo apanha também Corvo.", "Bola de Fogo apanha também Freya, do lado de Iara.", "Corvo resiste, e não fica queimando.", "Iara tenta Toque Vampírico contra Corvo, e falha feio.", "Iara bebe a vida que tira", "Colheita Final derruba Rato.", "Golpe de Misericórdia acaba com Sapo: Sapo cai.", "Raio Geminado salta também para Corvo.", "Corvo aguenta parte de Raio Geminado.", "Raio Geminado não fere Dragão", "Lobo acerta Iara (mordida)"].every((x) => hab.partes.ACONTECEU.includes(x)) && /No chão: [^\n]*Lobo[^\n]*Rato[^\n]*Sapo/.test(hab.partes.ACONTECEU));
const declaradas = aFichaDeAtor({ frase: oEnvelopeDosPoderes("habilidadesDeclaradas", { lista: `"Escudo Arcano" (2 PM — protege)`, mana: 7, acao: "Ergo o escudo e recuo", depois: "", extraTempo: "" }), estado: IARA });
t("as habilidades só declaradas: a fala é o como, e o fato é o que se usou", declaradas.partes.ACONTECEU === "Iara: «Ergo o escudo e recuo»\nIara usa Escudo Arcano.");
const fugaFim = aFichaDeAtor({ frase: "Seguro a ação e observo, pronto para responder Capanga da faca FUGIU da luta levando 4 de dano ao dar as costas; Rato tentou fugir e CAIU com o golpe de oportunidade (6). Com isso a luta ACABOU — narre a debandada e o silêncio depois.", estado: IARA });
t("a fuga que acaba a luta: quem foge, quem cai ao fugir, e a luta acabou (o nome com «da» inteiro)", fugaFim.partes.ACONTECEU === "Iara: «Seguro a ação e observo, pronto para responder»\nCapanga da faca foge da luta, golpeado ao dar as costas.\nRato tenta fugir, e cai, golpeado ao dar as costas.\nA luta acaba ali.\nNo chão: Rato.\nFugiram da luta: Capanga da faca.");
const queda = aFichaDeAtor({ frase: "Recuo para a porta. Lobo Cinzento FUGIU da luta ileso (rolado pelo sistema — narre a fuga, não a impeça). Corvo recuou para disparar e CAIU com o golpe de oportunidade (5) (rolado pelo sistema — narre o golpe, não o impeça)." + TI + linhaParaMestre("Urso", "Iara", { dano: 9 }, 20, 0) + ". ATENÇÃO: eu caí a 0 PV e estou inconsciente, lutando pela vida (testes de morte). Um aliado pode me estabilizar ou curar para eu voltar.", estado: IARA });
t("a fuga e o recuo no meio da rodada, e o herói que cai a zero", ["Iara: «Recuo para a porta.»", "Lobo Cinzento foge da luta.", "Corvo recua para disparar, e cai, golpeado ao sair.", "Urso derruba Iara: Iara cai.", "Iara cai sem sentidos, entre a vida e a morte"].every((x) => queda.partes.ACONTECEU.includes(x)));
const costas = aFichaDeAtor({ frase: "Afasto-me do lobo" + oEnvelopeDoCorpo("ataquesDeOportunidade", { ops: [{ inimigo: "Lobo", r: { dano: 3 } }, { inimigo: "Corvo", r: { dano: 0 } }], dano: 3 }) + TI + ".", estado: IARA });
const custo = aFichaDeAtor({ frase: "Fujo" + oEnvelopeDoCorpo("custoDaFuga", { custos: [{ nome: "Lobo", tipo: "golpe", r: { dano: 2 } }, { nome: "Arqueiro", tipo: "disparo", r: { dano: 0 } }], dano: 2 }), estado: IARA });
t("o golpe nas costas ao recuar e o custo da fuga: quem acerta e quem falha", costas.partes.ACONTECEU.includes("Ao recuar, Iara dá as costas: Lobo acerta Iara; Corvo falha.") && custo.partes.ACONTECEU.includes("Ao fugir, Iara dá as costas: Lobo acerta Iara; Arqueiro falha."));
const semSaida = Object.keys(DESFECHOS_SEM_SAIDA).map((k) => aplicarSemSaida({ heroi: { nome: "Iara", vida: 0, vidaMax: 20, grupo: [{ nome: "Freya", vida: 0, vidaMax: 10 }], moedas: 30 }, inimigos: [{ nome: "Bandido", vida: 5, vidaMax: 10 }], decisao: { desfecho: k, quem: "Bandido", motivo: "caidos" }, rolar: () => 0.5 })).filter(Boolean).map((r) => aFichaDeAtor({ frase: TI + ". " + r.envelope, estado: IARA }));
t(`a luta sem saída (${semSaida.length} desfechos de saida-da-luta.js): dita na terceira pessoa, e acaba`, semSaida.length >= 6 && semSaida.every((f) => /Bandido|O grupo/.test(f.partes.ACONTECEU) && f.partes.ACONTECEU.endsWith("A luta acaba ali.") && !/-me\b|-nos\b|\bacordo\b|\bmeu\b|\bPV\b/.test(f.partes.ACONTECEU)));
const aflicoes = [() => 0.99, () => 0.01].map((sorte) => rolarAflicao({ fonte: "mordida venenosa", nomeFonte: "Mordida", atacante: "Lobo", alvo: { nome: "Iara", condicoes: [] }, alvoNome: "Iara", sempre: true, sorte })).filter(Boolean).map((a) => aFichaDeAtor({ nota: a.nota, frase: "Seguro a ação", estado: IARA }).partes.ACONTECEU);
t("a aflição do golpe inimigo, na nota: a que pegou e a que se resistiu (aflicoes.js)", aflicoes.length === 2 && aflicoes.some((x) => x.includes("Mordida de Lobo deixa Iara envenenado.")) && aflicoes.some((x) => x.includes("Mordida de Lobo podia deixar Iara envenenado, mas Iara resiste.")));
const todasDaLuta = [s58, meuGolpe, hab, declaradas, fugaFim, queda, costas, custo, ...semSaida];
t(`em todas as ${todasDaLuta.length + aflicoes.length} fichas da luta: 0 rótulos, 0 números de jogo, 0 entradas sem tradução`, todasDaLuta.every((f) => verificarAFicha(f.texto).length === 0 && f.rastro.every((x) => x.cai !== "semTraducao") && !/\d/.test(f.partes.ACONTECEU)));
t("a forma que a régua não conhece fica no rastro como «sem tradução» (a suíte di-lo no dia em que o App mudar)", aFichaDeAtor({ frase: "Espero" + TI + ". Meus companheiros agiram: Freya dançou uma giga." }).rastro.some((x) => x.rotulo === "a luta" && x.cai === "semTraducao"));

/* A VOZ NUNCA CAI: uma ficha que transborda corta tudo o resto antes */
const cheia = aFichaDeAtor({ ...CASO, nota: CASO.nota + "\n" + Array.from({ length: 30 }, (_, i) => `PERGUNTOU Corrado sabe a coisa ${i}: uma resposta comprida sobre o que se passou na liça há muitos anos, com nomes e lugares e tudo`).join("\n") });
t("a ficha cheia passa do teto e corta (o rastro diz o quê)", cheia.cobertura.cortados.length > 0);
t("e ainda assim a voz do Dunstan fica, o tique e o registo do Corrado também", cheia.texto.includes("fala como marinheiro em terra firme") && /Corrado — [^\n]*\n  Fala: frase de negociante/.test(cheia.texto));

sec("§5 A PROVA: os casos reais");
const casos = [];
for (const s of ["s8", "s9", "s10", "navegador", "s13"]) {
  const A = JSON.parse(fs.readFileSync(new URL(`./sessao-${s}.json`, import.meta.url), "utf8"));
  for (let i = 0; i < A.turnos.length; i++) {
    const ent = A.turnos[i].entrada || {};
    const frase = typeof ent.frase === "string" && ent.frase.trim() ? ent.frase : ent.toque && typeof ent.toque.conteudo === "string" ? ent.toque.conteudo : "";
    if (!frase.trim()) continue;
    const m = await oPedidoNoServidor({ estado: estadoNoTurno(A, i), frase }, { agora: () => 0 });
    casos.push({ de: `${s}#${i}`, frase, nota: m.pedido.messages[m.pedido.messages.length - 1].content.split("\n═══")[0], estado: m.estadoDoFim });
  }
}
const nSessoes = casos.length;
const D = lerODourado();
const mods = await osModulos(D.imports), pad = osPadroes(D, mods);
const fotosBatem = [];
for (const k of casosDoPedido()) {
  const f = correrAPeca(oPedidoDoTurno, k, D, pad);
  const estado = { ...k.estado, ...f.valores, personagem: f.valores.personagem || k.render.personagem || k.estado.personagem, mundo: k.render.mundo || k.estado.mundo };
  casos.push({ de: `bloco#${k.i}`, frase: k.entrada.conteudo, nota: (f.out && f.out.nota) || "", estado });
  const ficha = aFichaDeAtor({ nota: casos[casos.length - 1].nota, frase: k.entrada.conteudo, estado });
  /* §6: a foto do pedido de hoje, tirada DEPOIS de a ficha correr sobre o mesmo estado */
  fotosBatem.push(ficha && mesmaFoto(fotoGuardada(fotoDoPedido(f), k.i), D.fotos[k.i]));
}
t(`os casos: ${nSessoes} frases das sessões pelo caminho do servidor + ${casos.length - nSessoes} do bloco`, nSessoes >= 140 && casos.length - nSessoes === N_DA_PAUTA);
const res = casos.map((k) => ({ k, r: aFichaDeAtor({ nota: k.nota, frase: k.frase, estado: k.estado }) }));
const viol = res.flatMap(({ k, r }) => verificarAFicha(r.texto).map((v) => `${k.de} ${v.id} «${v.trecho}»`));
t(`o verificador: 0 rótulos, ordens, razões ou números de jogo em ${res.length} fichas${viol.length ? " — " + viol.slice(0, 5).join("; ") : ""}`, viol.length === 0);
const semTrad = res.flatMap(({ k, r }) => r.rastro.filter((x) => x.cai === "semTraducao").map((x) => `${k.de} ${x.rotulo}: ${x.linha.slice(0, 60)}`));
t(`nenhuma linha da pauta fica sem tradução${semTrad.length ? " — " + semTrad.slice(0, 4).join("; ") : ""}`, semTrad.length === 0);
t("toda linha que cai tem um motivo da lista fechada", res.every(({ r }) => r.rastro.every((x) => x.vai || x.cai in MOTIVOS_DO_CORTE)));
let marcas = 0; const faltam = [];
for (const { k, r } of res) for (const x of r.rastro) {
  if (!x.vai) continue;
  for (const m of [...r.falam.filter((n) => x.linha.includes(n)), ...[...x.linha.matchAll(/◉\s*(\d+)/g)].map((q) => q[1])]) { marcas++; if (!r.texto.includes(m)) faltam.push(`${k.de} ${x.rotulo} «${m}»`); }
}
t(`A COBERTURA: os nomes de quem fala e os preços que cada linha da pauta trazia estão na ficha (${marcas} marcas${faltam.length ? "; faltam " + faltam.slice(0, 4).join(", ") : ""})`, marcas > 1000 && faltam.length === 0);
const tam = res.map(({ r }) => r.texto.length);
const media = Math.round(tam.reduce((a, b) => a + b, 0) / tam.length), pior = Math.max(...tam);
/* medido em 03/11: média 1 349, pior 1 989 — a catraca fica um pouco acima.
   Depois da luta inteira e do longe sem repetição (03/11, ainda): média
   1 305 → 1 300, pior 1 996 → 1 990; nas 14 fichas com luta 1 429 → 1 468
   (+95 no máximo), nas 61 com o longe repetido 1 348 → 1 306. A catraca
   não se mexeu */
t(`o tamanho: média ${media} (até 1 500), pior ${pior} (até o teto de ${FICHA_DE_ATOR.teto})`, media <= 1500 && pior <= FICHA_DE_ATOR.teto);
const comTrocas = res.map(({ r }) => r.texto.length + r.trocas.reduce((a, x) => a + x.jogador.length + x.mestre.length, 0));
t(`com as duas trocas o pior caso fica longe dos ~6 mil do pedido do ator (pior ${Math.max(...comTrocas)})`, Math.max(...comTrocas) <= 4500);
const semVoz = [];
for (const { k, r } of res) for (const p of r.pessoas.slice(0, FICHA_DE_ATOR.pessoasMax)) if (p.tique && !r.texto.includes(p.tique)) semVoz.push(`${k.de} ${p.nome}`);
t(`a voz do núcleo chega a toda pessoa que tem bloco (${res.reduce((a, { r }) => a + r.pessoas.filter((p) => p.tique).length, 0)} vozes${semVoz.length ? "; caem: " + semVoz.slice(0, 4).join(", ") : ""})`, semVoz.length === 0);
const tiqueAlheio = [];
for (const { k, r } of res) for (const f of COMO_FALA) if (r.texto.includes(f.o) && !r.pessoas.some((p) => p.tique && p.tique.includes(f.o))) tiqueAlheio.push(`${k.de} ${f.id}`);
t("e nenhum tique aparece em quem não o tem", tiqueAlheio.length === 0);
const s13 = res.find(({ k }) => k.de === "s13#0");
t("o Dunstan da 13.ª (T22) fala como marinheiro, e o querer não lhe tirou a voz", s13 && s13.r.texto.includes("fala como marinheiro em terra firme") && /Dunstan Machado Torto[\s\S]*?Quer: /.test(s13.r.texto));
/* 03/11, depois do teste às cegas: a luta que a frase traz chega toda ao
   ACONTECEU (cada nome à volta de cada seta), e ninguém fica longe duas
   vezes com dois nomes */
const perdidosDaLuta = [];
for (const { k, r } of res) for (const m of String(k.frase || "").matchAll(/([^:;.]+?)(?: \([^)]*\))?→([^:]+):/g)) for (const n of [m[1].replace(/^.* usou [^:]*$/, "").trim(), m[2].trim()]) if (n && !r.partes.ACONTECEU.includes(n)) perdidosDaLuta.push(`${k.de} «${n}»`);
t(`a luta da frase chega toda ao ACONTECEU nos casos reais${perdidosDaLuta.length ? " — faltam " + perdidosDaLuta.slice(0, 4).join(", ") : ""}`, perdidosDaLuta.length === 0 && res.filter(({ k }) => /→/.test(k.frase)).length >= 8);
const r58 = res.find(({ k }) => k.de === "s10#58");
t("s10#58, o turno gravado: a luta é fato, e o Godfrey está longe uma vez só, pelo nome mais longo", r58 && r58.r.partes.ACONTECEU.includes("Saoirse ataca Capanga da faca, e falha.") && (r58.r.partes["AS FRONTEIRAS"].match(/Godfrey/g) || []).length === 1 && r58.r.partes["AS FRONTEIRAS"].includes("Godfrey da Foz está longe"));
const longeDobrado = res.filter(({ r }) => { const nomes = (r.partes["AS FRONTEIRAS"] || "").split("\n").map((l) => (l.match(/^(.+?) (?:está longe, em|não está aqui)/) || [])[1]).filter(Boolean); return nomes.some((a) => nomes.some((b) => b !== a && b.startsWith(a + " "))); }).map(({ k }) => k.de);
t(`ninguém está longe por dois nomes em nenhuma das ${res.length} fichas${longeDobrado.length ? " — " + longeDobrado.slice(0, 4).join(", ") : ""}`, longeDobrado.length === 0);
t("só falam os da ficha: cada nome das fronteiras tem o seu bloco ou a sua linha", res.every(({ r }) => r.falam.every((n) => r.texto.split("\n").some((l) => l.startsWith(n + " — ") || (l.startsWith("Também aqui:") && l.includes(n))))));
/* 03/11, antes do teste às cegas: A ÚLTIMA PALAVRA não pede forma em
   nenhum dos casos reais — 0 falas a meio, 0 dilemas, 0 «pergunta direta»
   (eram 44, 29 e 142); a pergunta só aparece com o «?» do que o sistema
   decidiu que alguém diz */
const formaNoFim = res.flatMap(({ k, r }) => osTiquesDoOficio(r.partes["A ÚLTIMA PALAVRA"]).filter((x) => ["falaAMeio", "perguntaDireta", "dilema"].includes(x.id)).map((x) => `${k.de} ${x.id}`));
t(`a última palavra não pede forma em nenhuma das ${res.length} fichas${formaNoFim.length ? " — " + formaNoFim.slice(0, 4).join("; ") : ""}`, formaNoFim.length === 0);
t("a pergunta, quando há, é a que o sistema pôs na boca de alguém", res.every(({ r }) => !/pergunt/i.test(r.partes["A ÚLTIMA PALAVRA"]) || /\?/.test(r.partes["O QUE SE DIZ"])));
t("toda última palavra é de alguém que está, ou da cena", res.every(({ r }) => !r.partes["A ÚLTIMA PALAVRA"] || /^É da cena: /.test(r.partes["A ÚLTIMA PALAVRA"]) || r.falam.some((n) => r.partes["A ÚLTIMA PALAVRA"].startsWith(`É de ${n}`))));
t("a mesma corrida dá as mesmas fichas (determinismo sobre o corpus)", res.slice(0, 60).every(({ k, r }) => aFichaDeAtor({ nota: k.nota, frase: k.frase, estado: k.estado }).texto === r.texto));

sec("§6 o modo `mestre` não muda um byte");
t(`as ${fotosBatem.length} fotos do pedido de hoje batem com o dourado, com a ficha a correr no mesmo processo`, fotosBatem.length === N_DA_PAUTA && fotosBatem.every(Boolean));
const pecas = ["pauta-do-turno.js", "pedido-do-turno.js", "preludio-do-turno.js"].map((f) => fs.readFileSync(new URL(`../src/motor/${f}`, import.meta.url), "utf8"));
t("nenhuma peça do pedido de hoje lê a ficha (ela não tem consumidor até a etapa 2)", pecas.every((s) => !s.includes("ficha-de-ator")) && !fs.readFileSync(new URL("../src/turno-no-servidor.js", import.meta.url), "utf8").includes("ficha-de-ator"));

sec("§7 a 14.ª sessão (03/11): os três consertos que o Narrador ator pedia para passar a padrão");
/* mente/sessao-14.md, a tabela de defeitos e «O ator: passa a padrão?».
   Cada caso é o turno da sessão refeito com as peças que o produzem (os
   envelopes do App, o coração do save, a linha da pauta), e o banco da
   sessão (mente/sessao-14-dados/pedidos-ator-s14.json: a ficha e a resposta
   de cada um dos 29 turnos) é a medida de antes. */
const BRAM = { personagem: { nome: "Bram Pedra-Alta", grupo: [{ nome: "Leonor", vinculo: 30, classe: "Engenheiro" }], habilidades: [{ nome: "Cura Leve" }, { nome: "Luz Sagrada" }] } };
const POCA = "ONDE      Na Poça da Foz, dentro de Monte da Forca\nEM CENA   Inez do Prado Baixo (atendente) · Leonor (com você)";
const ac = (f) => f.partes.ACONTECEU;

/* conserto 1 — a frase não é o resultado */
const sopa = aFichaDeAtor({ frase: "Pago a sopa, como depressa e vou com a Leonor até ao templo procurar a Inez.", nota: POCA, estado: BRAM });
/* MOVIDA (03/11, a 15.ª sessão, caso 3a e defeito 2): pedia a linha
   «Bram ainda não pagou.». A frase também diz «vou com a Leonor até ao
   templo», e o sistema não moveu o Bram — ir é ato por fazer (defeito 2); e
   na 15.ª a companheira pagou a sopa que o herói não pagou, por isso o pagar
   diz-se de toda a gente («ninguém pagou ainda»). A intenção da asserção
   fica: a frase entra como o que Bram quer, e a ficha diz que não se pagou */
t("T5 «Pago a sopa» sem cobrança: a frase entra como o que Bram QUER, e a ficha diz que ninguém pagou ainda, e que Bram ainda não saiu dali", ac(sopa).startsWith("Bram Pedra-Alta quer: «Pago a sopa") && ac(sopa).includes(tpl(A_INTENCAO_DITA.porFazer, { L: [tpl(A_INTENCAO_DITA.ninguem, { X: "pagou" }), tpl(A_INTENCAO_DITA.dele, { H: "Bram Pedra-Alta", L: "saiu daqui" })].join(A_INTENCAO_DITA.e) })));
const notaDoSono = oEnvelopeDoJogador("oQueEuEscrevi", { acao: "Pago um quarto comum para esta noite, subo e durmo até de manhã. Amanhã apanho a Inez no turno dela." });
const sono = aFichaDeAtor({ frase: oEnvelopeDoAcampamento("levantarDescansado", { antes: "Dormiu-se sem conversa à volta do fogo.", tipo: "longo", dur: "uma noite inteira", recibo: "PV e PM já foram restaurados.", cauda: [oEnvelopeDoTempo("climaDaNoite", { rotulo: "nublado", nota: "céu baixo" })] }), nota: `${POCA}\n${notaDoSono}`, estado: BRAM });
t("T9 «pago um quarto… durmo» (o sono escrito): o ACONTECEU deixa de vir vazio — a frase, o descanso feito, a noite e o tempo", ac(sono).includes("Bram Pedra-Alta quer: «Pago um quarto comum") && ac(sono).includes("Bram Pedra-Alta descansou uma noite inteira") && ac(sono).includes("Dormiu-se sem conversa") && sono.partes.CENA.includes("agora está nublado"));
/* MOVIDA (03/11, a 15.ª sessão, caso 3a): pedia «ainda não pagou.»; o
   pagar diz-se agora de toda a gente («ninguém pagou ainda»). A intenção
   fica: o descanso que o sistema fez resolve o seu ato, e o pagar não */
t("…e o que o sistema fez resolve o seu ato: «ninguém pagou ainda», e não «ainda não descansou»", ac(sono).includes("ninguém pagou ainda.") && !ac(sono).includes("descansou."));
t("…e nenhuma linha do sono fica sem tradução", sono.rastro.every((x) => x.cai !== "semTraducao"));
const cura = aFichaDeAtor({ frase: "Ajoelho-me junto da Leonor, ponho as mãos sobre as costelas dela e rezo a Cura Leve.", nota: POCA, estado: BRAM });
t("T25 «rezo a Cura Leve» em texto livre: ainda não usou Cura Leve (a habilidade lida do herói)", ac(cura).includes("Só a intenção, por agora: Bram Pedra-Alta ainda não usou Cura Leve."));
const curaPeloBotao = aFichaDeAtor({ frase: oEnvelopeDosPoderes("habilidadesDeclaradas", { lista: `"Cura Leve" (3 PM — cura)`, mana: 5, acao: "Ponho as mãos nas costelas da Leonor", depois: "", extraTempo: "" }), nota: POCA, estado: BRAM });
t("T26 a mesma cura pelo botão (o sistema a fez): é fato, sem «Só a intenção»", ac(curaPeloBotao).includes("usa Cura Leve") && !/Só a intenção/.test(curaPeloBotao.texto));
const balcao = balcaoDeMantimentos({ nome: "Monte da Forca" }, {});
const compra = compraNaFrase("Compro duas rações e pago.", { balcao, bolsa: 50, temKit: false, anterior: "", bancas: [] });
const comprou = aFichaDeAtor({ frase: "Compro duas rações e pago.", nota: `${POCA}\n${envelopeDaCompra(compra)}`, estado: BRAM });
t("a compra que a bolsa da frase fechou (COMPRA): fato, com o preço, e sem «Só a intenção»", ac(comprou).includes("Bram Pedra-Alta comprou 2 Rações de viagem por 8 moedas") && !/Só a intenção/.test(comprou.texto) && verificarAFicha(comprou.texto).length === 0);
const semFundos = compraNaFrase("Compro duas rações e pago.", { balcao, bolsa: 1, temKit: false, anterior: "", bancas: [] });
const naoFechou = aFichaDeAtor({ frase: "Compro duas rações e pago.", nota: `${POCA}\nNÃO PODE  ${vetoDaCompra(semFundos)[0]}`, estado: BRAM });
t("a compra que não fechou (o veto da bolsa): a ficha diz porquê, na terceira pessoa e sem glifo", ac(naoFechou).includes("A compra de 2× Rações de viagem não fechou (custa 8 e Bram Pedra-Alta tem 1)") && verificarAFicha(naoFechou.texto).length === 0 && naoFechou.rastro.every((x) => x.cai !== "semTraducao"));
const deu = aFichaDeAtor({ frase: "Dou duas rações a Inez.", nota: `${POCA}\n${envelopeDaDadiva(dadivaNaFrase("Dou duas rações a Inez.", { pessoas: [{ nome: "Inez do Prado Baixo" }], suprimentos: { racoes: 5 } }))}`, estado: BRAM });
t("a dádiva da frase (DÁDIVA): fato, dito do herói", ac(deu).includes("Bram Pedra-Alta deu a Inez do Prado Baixo 2 rações; saíram da mochila de Bram Pedra-Alta."));
t("a frase que só pergunta o preço não paga nada («Quanto custa? Se eu pagar…»)", !/Só a intenção/.test(aFichaDeAtor({ frase: "Quanto custa o quarto? Se eu pagar agora, fico com o bom?", nota: POCA, estado: BRAM }).texto));
t("a tabela dos atos: ids únicos, cada um com o que ainda não fez e o que o resolve", new Set(O_QUE_A_FRASE_FAZ.map((a) => a.id)).size === O_QUE_A_FRASE_FAZ.length && O_QUE_A_FRASE_FAZ.every((a) => a.feito && a.resolve.length && (a.rx instanceof RegExp || a.id === "poder")));
const resolveVivo = new Set([...TRADUCAO_DOS_ENVELOPES.map((r) => r.resultado), ...Object.values(TRADUCAO_DA_PAUTA).flat().map((r) => r.resultado), "golpe", "poder", "luta", "teste"].filter(Boolean));
t("cada marca que resolve um ato tem quem a ponha (uma regra de envelope, de pauta, a luta ou o dado)", O_QUE_A_FRASE_FAZ.every((a) => a.resolve.every((r) => resolveVivo.has(r))));
t("a intenção dita passa no verificador", verificarAFicha(tpl(A_INTENCAO_DITA.quer, { H: "Bram", F: "Pago a sopa." }) + "\n" + tpl(A_INTENCAO_DITA.porFazer, { H: "Bram", L: "pagou" })).length === 0);

/* conserto 2 — a voz que pede número só diz os da ficha; nenhuma frase pronta */
const LEONOR = { ...BRAM, nucleoCache: { nucleo: { pessoas: [{ nome: "Leonor", papel: "companheiro", ficha: { fala: COMO_FALA.find((f) => f.id === "f_numeros"), quer: { o: "ser chamada mestra por quem lho negou" } } }] } } };
LEONOR.personagem = { ...BRAM.personagem, grupo: [{ nome: "Leonor", vinculo: 30, classe: "Engenheiro", conceito: "mestra de ofício, comerciante de ferragens" }] };
const falaDe = (f, n) => (f.texto.match(new RegExp(`^${n} — [^\\n]*\\n  Fala: ([^\\n]*)`, "m")) || [])[1] || "";
const semNum = aFichaDeAtor({ frase: "Olho a estrada.", nota: "ONDE      na estrada de Serra dos Frades", estado: LEONOR });
const comNum = aFichaDeAtor({ frase: "Pergunto quanto custa a sopa.", nota: "ONDE      Na Poça da Foz\nPERGUNTOU o preço daqui: refeição quente 3 estalos\nO RUMO    responda primeiro ao que perguntei", estado: LEONOR });
t("T0–T29: sem número na ficha, a Leonor não «diz os números exatos» nem tem «um preço por trás» — outra marca dela", !/números exatos|preço por trás/.test(falaDe(semNum, "Leonor")) && falaDe(semNum, "Leonor").includes(A_VOZ_DO_NUMERO.find((v) => v.id === "numeros").semNumero) && falaDe(semNum, "Leonor").includes(A_VOZ_DO_NUMERO.find((v) => v.id === "venda").semNumero));
t("…e com o preço na ficha, o traço volta, preso ao que ela sabe", falaDe(comNum, "Leonor").includes("diz os números exatos do que sabe") && falaDe(comNum, "Leonor").includes("com o preço que sabe por trás") && comNum.texto.includes("3 estalos"));
t("nenhum exemplo de fala na ficha: nem o do tique do núcleo, nem o do registo", !/\("/.test(semNum.texto) && !COMO_FALA.some((f) => f.exemplo && semNum.texto.includes(f.exemplo)));
t("a tabela da voz do número: cada traço com as duas formas, e a de sem-número sem dígito", A_VOZ_DO_NUMERO.every((v) => v.de instanceof RegExp && v.comNumero && v.semNumero && !/\d/.test(v.semNumero) && verificarAFicha(v.semNumero).length === 0));
const exemplosNoCorpus = res.reduce((a, { r }) => a + (r.texto.match(/\("[^"]+"\)/g) || []).length, 0);
const numeroSemNumero = res.filter(({ r }) => r.pessoas.some((p) => /números exatos|preço por trás|conta tudo em dias/.test(str(p.tique) + str(p.registo)) && !/\d/.test(r.texto)));
t(`nos ${res.length} casos: 0 exemplos de fala (eram 764 em 410 fichas), e nenhum traço de número numa ficha sem número`, exemplosNoCorpus === 0 && numeroSemNumero.length === 0);
const BANCO = JSON.parse(fs.readFileSync(new URL("../mente/sessao-14-dados/pedidos-ator-s14.json", import.meta.url), "utf8")).map((x) => { const c = JSON.parse(x.body).messages.map((m) => m.content).join("\n"); let r = ""; try { r = JSON.parse(x.resp).texto || ""; } catch { r = ""; } return { ficha: c.slice(c.lastIndexOf("\nCENA\n") + 1), resp: r }; });
const semAc = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const copiados = BANCO.reduce((a, b) => a + [...b.ficha.matchAll(/\("([^"]+)"\)/g)].filter((m) => semAc(b.resp).includes(semAc(m[1]))).length, 0);
t(`o banco da 14.ª (a medida de antes): ${BANCO.length} turnos, todas as fichas com exemplo de fala, e ${copiados} saíram copiados na resposta`, BANCO.length === 29 && BANCO.every((b) => /\("/.test(b.ficha)) && copiados === 5);

/* os rótulos que o verificador achou nas 29 fichas da sessão (3 de voz e marca, 2 do boato) */
const voz = VOZ_PRESA.modelo.replace("{marcador}", VOZ_PRESA.marcador.mulher).replace("{nome}", "Inez do Prado Baixo").replace("{tique}", "fala de si na terceira pessoa");
const linhaPede = LINHA_DO_CORACAO.pedido.replace("{nome}", "Inez do Prado Baixo").replace("{ele}", "ela").replace("{fala}", "Prometi rezar onde ele caiu. É no caminho.");
const linhaPorque = LINHA_DO_CORACAO.porque.replace("{nome}", "Inez do Prado Baixo").replace("{ele}", "ela").replace("{quer}", "que a aldeia onde nasceu passe o inverno");
const boato = `Forte Abandonado de Raízes, «a guarda proibiu a estrada que leva até lá» — ${BOATO.vereditos.verdade}: é verdade, e o lugar mostra-o. ${BOATO.fecho}`;
const rot = aFichaDeAtor({ frase: "Pergunto à Inez porquê.", nota: `${POCA}\nQUEM CARREGA ${linhaPede} ${voz}\nPERGUNTOU ${linhaPorque}\nO BOATO   ${boato}`, estado: BRAM });
t("T1, T3, T16: a voz colada, a marca «é fato» e o veredito do boato saem — 0 rótulos, e o fato fica", verificarAFicha(rot.texto).length === 0 && rot.texto.includes("Prometi rezar onde ele caiu") && rot.texto.includes("que a aldeia onde nasceu passe o inverno") && rot.texto.includes("a guarda proibiu a estrada") && rot.texto.includes("é verdade, e o lugar mostra-o"));
const rumor = aFichaDeAtor({ frase: "olho em volta", nota: `${POCA}\n[RUMOR] Um boato chegou aos meus ouvidos: "ouvi que o inverno deste ano virá cedo e cruel". Se couber, deixe-o circular na ficção (taverna, estrada, mercado) — e decida se ele é só fumaça ou o rastro de algo real.`, estado: BRAM });
t("T11 o RUMOR: fica o boato entre aspas, e o «decida se é fumaça» (a ordem ao ator) cai", rumor.partes["O QUE SE DIZ"].includes("«ouvi que o inverno deste ano virá cedo e cruel»") && !/decida|deixe-o/.test(rumor.texto));

/* conserto 3 — o que ficou combinado volta à ficha de quem o tem */
const CORACAO = (resposta) => garantirCoracaoDoSave({ arcos: { "Inez do Prado Baixo": { pedido: 1, resposta } } });
const SUBTRAMAS = { lista: [{ nome: "Inez do Prado Baixo", pedido: { fala: "Prometi rezar onde ele caiu. É no caminho.", objeto: "parar para rezar no caminho" } }] };
const T13 = (resposta, extra = "") => aFichaDeAtor({ frase: "Pergunto à Inez se é longe o sítio onde rezar.", nota: POCA + extra, estado: { ...BRAM, coracao: CORACAO(resposta), subtramasCache: SUBTRAMAS } });
const bloco = (f, n) => (f.texto.split("\n").reduce((o, l) => { if (/^\S/.test(l)) o.cur = l.startsWith(n + " — ") ? n : null; if (o.cur) o.out.push(l); return o; }, { cur: null, out: [] })).out.join("\n");
t("T13: o pedido aceite volta à linha da Inez — «Pediu a Bram: …; e Bram aceitou»", bloco(T13("aceitou"), "Inez do Prado Baixo").includes(tpl(O_COMBINADO.aceitou, { H: "Bram Pedra-Alta", F: "Prometi rezar onde ele caiu. É no caminho.", O: "parar para rezar no caminho" })));
t("…e a recusa e o pedido por responder também se dizem", bloco(T13("recusou"), "Inez do Prado Baixo").includes("e Bram Pedra-Alta recusou.") && bloco(T13(""), "Inez do Prado Baixo").includes("ainda não respondeu."));
t("…e quem não tem pedido não ganha linha nenhuma (a Leonor)", !/Pediu a/.test(bloco(T13("aceitou"), "Leonor")));
t("o combinado passa no verificador", verificarAFicha(T13("aceitou").texto).length === 0);
const gesto = "\nA GENTE   Leonor chama a conversa de volta para o que ficou combinado";
const t17 = aFichaDeAtor({ frase: "Sigo pela estrada.", nota: POCA + gesto, estado: BRAM });
t("T17: «chama a conversa para o que ficou combinado» sem combinado nenhum cai (semConteudo), e o ator não tem o que inventar", !/ficou combinado/.test(t17.texto) && t17.rastro.some((x) => x.cai === "semConteudo") && "semConteudo" in MOTIVOS_DO_CORTE);
const comCombinado = T13("aceitou", "\nA GENTE   Inez do Prado Baixo chama a conversa de volta para o que ficou combinado");
t("…e com o combinado aceite, o gesto diz o quê", bloco(comCombinado, "Inez do Prado Baixo").includes("o que ficou combinado: parar para rezar no caminho"));
const aceite = aFichaDeAtor({ frase: oEnvelopeDoAcampamento("respostaAoCoracao", { nome: "Inez do Prado Baixo", resposta: "aceitou", pede: "Prometi rezar onde ele caiu. É no caminho." }), nota: POCA, estado: { ...BRAM, coracao: CORACAO("aceitou"), subtramasCache: SUBTRAMAS } });
t("T4: o «Aceitar» tocado entra no ACONTECEU do turno em que acontece, com o pedido", ac(aceite).includes("Bram Pedra-Alta aceita o que Inez do Prado Baixo lhe pede: «Prometi rezar onde ele caiu. É no caminho.»") && aceite.rastro.every((x) => x.cai !== "semTraducao"));
const porque = aFichaDeAtor({ frase: oEnvelopeDoAcampamento("respostaAoCoracao", { nome: "Inez do Prado Baixo", resposta: "porque" }), nota: POCA, estado: BRAM });
t("T3: o «Perguntar porquê» tocado também", ac(porque).includes("Bram Pedra-Alta pergunta a Inez do Prado Baixo porquê."));
t("a resposta dita passa no verificador, nos três toques", ["aceitou", "recusou", "porque"].every((q) => verificarAFicha(tpl(A_RESPOSTA_DITA[q], { H: "Bram", N: "Inez" }) + tpl(A_RESPOSTA_DITA.pedido, { P: "É no caminho." })).length === 0));
/* a conversa: com quem o herói falou, do que o sistema sabe */
const conv = (frase, nota = POCA) => aFichaDeAtor({ frase, nota, estado: BRAM }).conversa;
t("T1 «pergunto à Inez quanto custa um quarto», com a Inez em cena: falou com a Inez", conv("Vou ao balcão e pergunto à Inez quanto custa um quarto por uma noite.").includes("Inez do Prado Baixo"));
t("T2 «— Quem é ele? E onde caiu?», sem nome, com só a Inez de fora do grupo: falou com a Inez", conv("— Quem é ele? E onde foi que caiu?").includes("Inez do Prado Baixo"));
t("T5 «pergunto se a Inez passou por aqui», sem a Inez em cena: não falou com ela", !conv("Pergunto a um devoto se a Inez passou por aqui hoje.", "ONDE      Em Claustro do Primeiro Prego\nEM CENA   Leonor (com você)").includes("Inez do Prado Baixo"));
t("T4 o toque «Aceitar»: falou com quem pediu", aceite.conversa.includes("Inez do Prado Baixo"));
t("olhar a estrada não é conversa com ninguém", conv("Olho a estrada.").length === 0);
t("a conversa nos casos reais: só gente da ficha", res.every(({ r }) => r.conversa.every((n) => r.pessoas.some((p) => p.nome === n))));

sec("§8 a 15.ª sessão (03/11): o que ainda impedia o ator de ser o padrão");
/* mente/sessao-15.md. A pessoa do passo (o caso 1) tem suíte própria
   (teste-a-pessoa-do-passo.mjs); aqui, o resto, cada um com a peça que o
   produz no jogo. */
const IRENE = { personagem: { nome: "Irene", grupo: [{ nome: "Yvete Perna-Seca", vinculo: 10, classe: "Monge" }] }, nucleoCache: { nucleo: { pessoas: [{ nome: "Yvete Perna-Seca", papel: "companheiro", ficha: { fala: COMO_FALA.find((f) => f.id === "f_pergunta") } }] } } };
const BARRIL = "ONDE      n'O Barril Rachado, dentro de Cimo Negro\nEM CENA   Yvete Perna-Seca (com você)";
/* defeito 2 — o movimento que o sistema não resolveu */
const t8 = aFichaDeAtor({ frase: "Deixo o Barril e vou à sede da Companhia Tortuoso.", nota: BARRIL, estado: IRENE });
t("T8 «Deixo o Barril e vou à sede da Companhia Tortuoso», e o sistema deixou-a no Barril: entra como o que Irene quer, e ainda não saiu dali", ac(t8).startsWith("Irene quer: «Deixo o Barril") && ac(t8).includes(tpl(A_INTENCAO_DITA.porFazer, { L: tpl(A_INTENCAO_DITA.dele, { H: "Irene", L: "saiu daqui" }) })));
const passo = oPassoNaCidade({ cidadeAtual: "Cimo Negro", lugar: { nome: "O Barril Rachado" }, dia: 1 }, { nome: "A Sede da Companhia", onde: "dentro" });
const t8mov = aFichaDeAtor({ frase: "Vou à Sede da Companhia.", nota: `${BARRIL}\n${passo.nota}`, estado: IRENE });
t("…e com o movimento que o sistema registou (oPassoNaCidade), é fato: chegou, sem «Só a intenção»", ac(t8mov).includes("Irene chegou: está agora na Sede da Companhia.") && !/Só a intenção/.test(t8mov.texto));
t("andar dentro da sala não é ir («vou ao balcão», «volto à mesa»), nem o que só se pergunta («se eu for ao templo…?»)", ["Vou ao balcão e peço uma caneca.", "Volto à mesa e sento-me.", "Se eu for ao templo, quem encontro?"].every((f) => !/Só a intenção/.test(aFichaDeAtor({ frase: f, nota: BARRIL, estado: IRENE }).texto)));
const irNoCorpus = res.filter(({ r }) => r.texto.includes("ainda não saiu daqui"));
t(`nos ${res.length} casos: ${irNoCorpus.length} frases de ir que o sistema não resolveu entram como intenção, e nenhuma tinha movimento registado`, irNoCorpus.length >= 20 && irNoCorpus.every(({ k }) => !/\[MOVIMENTO/.test(k.nota)));
/* caso 3a — a companheira pagou o que ninguém pagou */
const t3 = aFichaDeAtor({ frase: "Pago a sopa.", nota: BARRIL, estado: IRENE });
t("T3 «Pago a sopa» sem cobrança: «ninguém pagou ainda» — nem Irene, nem a Yvete", ac(t3).includes(tpl(A_INTENCAO_DITA.porFazer, { L: tpl(A_INTENCAO_DITA.ninguem, { X: "pagou" }) })) && verificarAFicha(t3.texto).length === 0);
t("a tabela: só o pagar se diz de toda a gente, e a linha passa no verificador", O_QUE_A_FRASE_FAZ.filter((a) => a.porOutro).map((a) => a.id).join() === "pagar" && verificarAFicha(tpl(A_INTENCAO_DITA.porFazer, { L: [tpl(A_INTENCAO_DITA.ninguem, { X: "pagou" }), tpl(A_INTENCAO_DITA.dele, { H: "Irene", L: "saiu daqui" })].join(A_INTENCAO_DITA.e) })).length === 0);
/* caso 7 — a voz que empurra a pergunta */
const falaY = falaDe(t3, "Yvete Perna-Seca");
t("T1–T12: a voz da Yvete já não é «responde com outra pergunta» — é o jeito dela dito sem ponto de interrogação", !/pergunt/.test(falaY) && falaY.includes(A_VOZ_QUE_PERGUNTA.find((v) => v.id === "pergunta").o));
const quePergunta = COMO_FALA.filter((f) => A_VOZ_QUE_PERGUNTA.some((v) => v.de.test(f.o)));
t(`a tabela das vozes (COMO_FALA): ${quePergunta.length} de ${COMO_FALA.length} empurram a pergunta (${quePergunta.map((f) => f.id).join(", ")}), e cada uma tem forma sem pergunta`, quePergunta.length === 3 && A_VOZ_QUE_PERGUNTA.every((v) => !/\?|pergunt/.test(v.o) && verificarAFicha(v.o).length === 0));
const vozesQuePerguntam = (txts) => txts.reduce((a, x) => a + x.split("\n").filter((l) => /^\s+Fala: /.test(l) && A_VOZ_QUE_PERGUNTA.some((v) => l.includes(v.de.source.replace(/^\^|\$$/g, "")))).length, 0);
/* medido em 03/11: nos 434, 83 das 940 vozes empurravam a pergunta antes
   deste conserto; o banco da 14.ª (29 fichas, 40 vozes) não tinha nenhuma —
   a voz da Yvete era da 15.ª */
t(`no banco da 14.ª, ${vozesQuePerguntam(BANCO.map((b) => b.ficha))} de ${BANCO.reduce((a, b) => a + b.ficha.split("\n").filter((l) => /^\s+Fala: /.test(l)).length, 0)} vozes empurravam a pergunta; nos ${res.length} casos, agora, ${vozesQuePerguntam(res.map(({ r }) => r.texto))}`, vozesQuePerguntam(res.map(({ r }) => r.texto)) === 0);
/* defeito 5 — a abertura escondia o primeiro passo */
const AB = garantirAbertura({ principalId: "mis_principal", cidade: "Cimo Negro", chegada: "à porta de Cimo Negro, com a poeira da estrada ainda na roupa", razao: "alguém a quem devia a vida pediu-lhe que fosse a Cimo Negro atrás de Isolda", sabe: "Godofredo, taverneiro, é quem, nesta cidade, sabe mais de Isolda; encontra-se n'O Barril Rachado", historia: "Cimo Negro vive do carvão que desce da serra", pista: { nome: "Godofredo", papel: "taverneiro", local: "O Barril Rachado" }, alvo: { feitio: "procurar", quem: "Isolda", onde: "A Casa da Ponte" } });
const t0 = aFichaDeAtor({ frase: pedidoDaAbertura(AB, { habilidades: ["Cura Leve"], moeda: "estalos" }), nota: "ONDE      à porta de Cimo Negro\nEM CENA   Yvete Perna-Seca (com você)", estado: IRENE });
t("T0 a abertura: o que Irene sabe chega à ficha — o Godofredo e o Barril Rachado, o primeiro passo (era tudo «ofício»)", ac(t0).includes("O que Irene sabe: Godofredo, taverneiro, é quem, nesta cidade, sabe mais de Isolda; encontra-se n'O Barril Rachado.") && ac(t0).includes("Irene ainda não está no Barril Rachado, nem diante de Godofredo."));
t("…e onde chegou, a pequena história do lugar e porque veio; nada sem tradução, e passa no verificador", t0.partes.CENA.includes("Irene chegou agora à porta de Cimo Negro") && t0.partes.CENA.includes("vive do carvão") && ac(t0).includes("O que traz Irene aqui:") && t0.rastro.every((x) => x.cai !== "semTraducao") && verificarAFicha(t0.texto).length === 0);
t("a tabela da abertura: ids únicos, cada um com um destino e uma frase que passa no verificador", new Set(A_ABERTURA_DITA.map((x) => x.id)).size === A_ABERTURA_DITA.length && A_ABERTURA_DITA.every((x) => ["cena", "extra", "aconteceu"].includes(x.vai) && verificarAFicha(x.o.replace(/\{[A-Z]\}/g, "Irene")).length === 0));
/* defeito 6 — as ordens de Mestre que ainda passavam */
const forma = estante.find((f) => f.id === "no_meio_do_pequeno");
const t3f = aFichaDeAtor({ frase: "Pago a sopa.", nota: `${BARRIL}\n${envelopeDaCena(forma)}`, estado: IRENE });
t("T3 a forma da cena («Gaste a primeira frase na coisa pequena…») cai como forma: é como narrar, não fato", !/Gaste|interrompe uma coisa/.test(t3f.texto) && t3f.cobertura.caidos.forma === 1 && "forma" in MOTIVOS_DO_CORTE);
const obra = marcaDaEtapa({ fase: "rumor", como: "travada", passo: 0, gente: "os sem-casa", cidade: "Cimo Negro", onde: "A Casa da Ponte", diz: "" }, "");
const t8o = aFichaDeAtor({ frase: "Olho em volta.", nota: `${BARRIL}\nMOMENTO   ${obra}`, estado: IRENE });
t("T8 a obra que corre agora (batidas.js) não «já aconteceu», e o «chegam primeiro» diz a quê", ac(t8o).includes("Está a acontecer agora:") && ac(t8o).includes("se Irene tardar, chegam primeiro ao que Irene procura") && !/Já aconteceu/.test(ac(t8o)) && verificarAFicha(t8o.texto).length === 0);

sec("§9 a 16.ª sessão (03/11): a estrada, o gesto de pagar, a voz que marca, o credor");
/* mente/sessao-16.md. A pessoa do passo, o «revelar» e o sítio do registo
   têm suíte própria (teste-a-pessoa-do-passo.mjs, §5–§6); aqui, o resto. */
const ALARIC = { nome: "Alaric Barba-Ruiva", papel: "companheiro", ficha: { fala: COMO_FALA.find((f) => f.id === "f_terceira"), quer: { ...QUER.find((q) => q.id === "q_divida_fim") }, carrega: { tipo: "divida", id: "d_heroi", o: "o herói deve-lhe, e não deixa que o esqueça" } } };
const BENTO = { personagem: { nome: "Bento", grupo: [{ nome: "Alaric Barba-Ruiva", vinculo: 25, classe: "Ladino", raca: "Humano" }] }, nucleoCache: { nucleo: { pessoas: [ALARIC] } } };
/* defeito 4 — a viagem começada por frase: o sistema abriu a jornada
   (viagem.js, abrirViagem; quatro horas andadas), tirou o herói do lugar,
   e o Loras (registado com o sítio na cidade) vinha pela pauta */
const LORAS = { "Loras Rompe-Escudos": { nome: "Loras Rompe-Escudos", papel: "aprendiz", local: "As Termas da Fivela, Ponto da Fonte", conhecidoEm: 1 } };
const JOR = { ...abrirViagem({ de: "Ponto da Fonte", para: "Rio Profundo", dia: 1 }), andadoMin: 240 };
const NA_ESTRADA = "ONDE      A caminho de Rio Profundo\nEM CENA   Alaric Barba-Ruiva (com você) · Loras Rompe-Escudos (aprendiz)";
const F10 = "Saio de Ponto da Fonte pela estrada, a caminho de Rio Profundo.";
const t10 = aFichaDeAtor({ frase: F10, nota: NA_ESTRADA, estado: { ...BENTO, npcs: LORAS, lugar: null, jornada: JOR } });
t("T10 com a jornada aberta: a frase é fato, e a linha diz de onde e para onde — sem «Só a intenção»", ac(t10).startsWith(`Bento: «${F10}»`) && ac(t10).includes(tpl(A_ESTRADA_DITA.saiu, { H: "Bento", D: "Ponto da Fonte", P: "Rio Profundo" })) && !/Só a intenção|quer: «/.test(t10.texto) && verificarAFicha(t10.texto).length === 0);
t("…e quem ficou na cidade (o Loras) não vem em QUEM ESTÁ na estrada; o companheiro vem", !t10.falam.includes("Loras Rompe-Escudos") && t10.falam.includes("Alaric Barba-Ruiva"));
const t10sem = aFichaDeAtor({ frase: F10, nota: NA_ESTRADA, estado: { ...BENTO, npcs: LORAS } });
t("sem jornada, a mesma frase é intenção — e a maiúscula do começo («Saio») já não a esconde do IR", ac(t10sem).startsWith("Bento quer:") && ac(t10sem).includes("ainda não saiu daqui"));
t("no meio da estrada, «vou à taverna» não é a viagem: fica intenção", /ainda não saiu daqui/.test(aFichaDeAtor({ frase: "Vou à taverna e peço uma caneca.", nota: NA_ESTRADA, estado: { ...BENTO, lugar: null, jornada: JOR } }).texto));
t("a jornada parada ou concluída não é estrada, nem a que um save antigo deixou com o herói num lugar ({ destino })", [{ ...JOR, estado: ESTADOS_DA_VIAGEM.pausada }, { ...JOR, estado: ESTADOS_DA_VIAGEM.concluida }].every((j) => /ainda não saiu daqui/.test(aFichaDeAtor({ frase: F10, nota: NA_ESTRADA, estado: { ...BENTO, lugar: null, jornada: j } }).texto)) && aFichaDeAtor({ frase: "Olho em volta.", nota: "ONDE      n'O Rossio\nEM CENA   Loras Rompe-Escudos (aprendiz)", estado: { ...BENTO, npcs: LORAS, lugar: { nome: "O Rossio" }, jornada: { destino: "Rio Profundo" } } }).falam.includes("Loras Rompe-Escudos"));
t("a tabela da estrada: os estados são os de viagem.js, e as linhas passam no verificador", A_ESTRADA_DITA.emCurso.includes(ESTADOS_DA_VIAGEM.emCurso) && [A_ESTRADA_DITA.saiu, A_ESTRADA_DITA.semDe].every((x) => verificarAFicha(tpl(x, { H: "Bento", D: "Ponto da Fonte", P: "Rio Profundo" })).length === 0));
/* defeito 6 — o gesto de pagar */
const t4 = aFichaDeAtor({ frase: "Ponho duas moedas no balcão pela caneca.", nota: BARRIL, estado: IRENE });
t("T4 «Ponho duas moedas no balcão pela caneca», sem cobrança: «ninguém pagou ainda»", ac(t4).includes(tpl(A_INTENCAO_DITA.porFazer, { L: tpl(A_INTENCAO_DITA.ninguem, { X: "pagou" }) })));
t("…e o gesto com moeda («deixo uma moeda», «pouso três estalos») também; pôr a caneca no balcão não", ["Deixo uma moeda na mesa.", "Pouso três estalos no balcão."].every((f) => /ninguém pagou ainda/.test(aFichaDeAtor({ frase: f, nota: BARRIL, estado: IRENE }).texto)) && !/pagou/.test(aFichaDeAtor({ frase: "Ponho a caneca no balcão.", nota: BARRIL, estado: IRENE }).texto));
/* defeito 7 — a voz que marca toda fala, e o credor */
const t1 = aFichaDeAtor({ frase: "Olho para o Alaric.", nota: "ONDE      n'A Lanterna da Bruma\nEM CENA   Alaric Barba-Ruiva (com você)", estado: BENTO });
const falaA = falaDe(t1, "Alaric Barba-Ruiva");
t("T0–T14: a voz do Alaric já não manda a terceira pessoa a cada fala — aparece às vezes, com a ocasião dita", falaA.includes(A_VOZ_QUE_MARCA.find((v) => v.id === "terceira").o) && !falaA.startsWith("fala de si na terceira pessoa"));
const queMarcam = COMO_FALA.filter((f) => A_VOZ_QUE_MARCA.some((v) => v.de.test(f.o)));
t(`a tabela das vozes (COMO_FALA): ${queMarcam.length} de ${COMO_FALA.length} deixam a mesma marca em toda fala (${queMarcam.map((f) => f.id).join(", ")}), e cada uma tem forma de às vezes`, queMarcam.length === A_VOZ_QUE_MARCA.length && queMarcam.length === 7 && A_VOZ_QUE_MARCA.every((v) => verificarAFicha(v.o).length === 0));
/* medido em 03/11 com as fichas dos 434 de antes deste conserto: 124 das 940
   vozes traziam um traço que marca toda fala (a avó, 105; a comida, 19); o
   banco da 14.ª (40 vozes) não tinha nenhuma */
const marcaToda = (txts) => txts.reduce((a, x) => a + x.split("\n").filter((l) => /^\s+Fala: /.test(l) && l.replace(/^\s+Fala: /, "").replace(/\.$/, "").split(/;\s+/).some((p) => A_VOZ_QUE_MARCA.some((v) => v.de.test(p.trim())))).length, 0);
t(`no banco da 14.ª, ${marcaToda(BANCO.map((b) => b.ficha))} vozes marcavam toda fala; nos ${res.length} casos, agora, ${marcaToda(res.map(({ r }) => r.texto))} (eram 124 de 940)`, marcaToda(res.map(({ r }) => r.texto)) === 0 && marcaToda(BANCO.map((b) => b.ficha)) === 0);
t("o credor quer receber: num save gravado com o texto velho, a ficha lê o «Quer» ao contrário (o herói deve-lhe)", /\n  Quer: ver paga, até à última prestação, a dívida que Bento lhe deve\./.test(bloco(t1, "Alaric Barba-Ruiva")) && !/pagar a última prestação/.test(t1.texto));
const nc = nucleoDaCampanha("A Lanterna do Brejo|Fantasia medieval", null, { grupo: [{ nome: "Alaric Barba-Ruiva", ligacao: "credor" }], elenco: { pessoas: [] } }).pessoas.find((p) => p.papel === "companheiro");
t("…e o núcleo novo já nasce assim, sem guardar a outra forma no save", nc && nc.ficha.quer.id === "q_divida_fim" && nc.ficha.quer.o === QUER.find((q) => q.id === "q_divida_fim").aoContrario && !("aoContrario" in nc.ficha.quer));
/* o teste sem dado, e o que o herói já achou */
const tSD = aFichaDeAtor({ frase: "[SEM DADO — DECISÃO DO SISTEMA] Isto que eu fiz (Vasculhar) deu certo, sem rolagem: é pequeno, não faz barulho.", nota: BARRIL, estado: IRENE });
t("o teste que o sistema concedeu (SEM DADO) chega como fato, e não fica sem tradução", ac(tSD).includes("Irene tentou vasculhar, e conseguiu.") && tSD.rastro.every((x) => x.cai !== "semTraducao"));
const tJS = aFichaDeAtor({ frase: "Olho em volta.", nota: `${BARRIL}\nMOMENTO   JÁ SE SABE (do sistema — o herói achou-o em O Largo do Cardo; se a cena ainda não o mostrou, mostre-o agora): um túnel com pegadas de poucas noites.`, estado: IRENE });
t("o JÁ SE SABE do momento (o que o herói achou no marco) chega como fato, sem a ordem", ac(tJS).includes("Irene já sabe o que achou: um túnel com pegadas de poucas noites.") && !/mostre-o/.test(tJS.texto) && verificarAFicha(tJS.texto).length === 0);

console.log(`\nficha de ator: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
