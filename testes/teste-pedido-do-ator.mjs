/* O PEDIDO DO ATOR (03/11, o Narrador ator, etapa 2) — src/motor/pedido-do-ator.js

   A pessoa decidiu em 03/11 (mente/plano-narrador-ator.md) que o Narrador é
   só a boca: o sistema decide, a ficha entrega, o ator diz. A etapa 2 é o
   pedido que vai à rede no modo `ator` — o ofício (como dizer), as duas
   últimas trocas e a ficha —, a leitura da resposta (só prosa), e a ligação
   no servidor atrás da chave. Nenhuma IA é chamada: as respostas são falsas.

   O que esta suíte prova:
   §1 as tabelas: o pedido à rede tem a forma do do Mestre (PEDIDO_AO_NARRADOR),
      em texto, sem cache, dentro da rede do Narrador; o ofício cabe no teto,
      diz o tamanho da narrativa de hoje e explica cada parte da ficha;
   §2 A CATRACA DOS TIQUES: o ofício não tem nenhum gatilho do diagnóstico da
      voz, e cada gatilho morde a frase que o diagnóstico apontou como causa
      (e morde o system do Mestre de hoje — a régua vê o que diz ver);
   §3 o pedido: o lixo não estoura, o estado não muda, o determinismo; «Há
      pouco» leva só as trocas respondidas (a frase do turno, que no App já
      está no relato, fica de fora);
   §4 a leitura: prosa, cerco de código, JSON velho (só a narrativa), eco
      dos cabeçalhos, vazio;
   §5 o caminho inteiro sobre uma porta falsa: a segunda escrita, a resposta
      sem prosa que não dá turno, a fala do herói podada, e `mudancas: null`;
   §6 A PROVA sobre os 434 casos (147 das sessões pelo servidor + 287 do
      bloco): o pedido monta-se, cabe, e o prefixo é o mesmo em todos (o
      cacheável); com as duas trocas das sessões, também cabe;
   §7 o servidor no `ator`, com IA falsa, sobre as frases das sessões: o
      turno fecha, a tela recebe a prosa, a rede recebe o pedido do ator, o
      Cronista cala, e uma resposta cheia de campos deixa o estado IGUAL ao
      da mesma prosa sem campos (no `mestre`, a mesma resposta muda o estado
      — a prova morde);
   §8 o `mestre` não muda: o pedido do servidor sem modo e com «mestre» é o
      mesmo, em JSON, com a ficha do cache, e sem ficha de ator;
   §9 as duas pontas do 1db51a8: o peso da linha pelo sistema
      (`oPesoPeloSistema`) e a recência do elenco pela ficha
      (`osVistosDaNarrativa` com quem o sistema pôs a falar).

   Nenhuma asserção lê o texto de src/motor/ nem do App (a catraca de
   teste-assercoes-de-texto): a fiação do App prova-se pelo build e pela
   prova viva (o diário de 03/11 diz como). */
import fs from "node:fs";
import {
  PEDIDO_AO_ATOR, OFICIO_DO_ATOR, oOficioDoAtor, GATILHOS_DE_TIQUE, osTiquesDoOficio,
  oPedidoDoAtor, aProsaDoAtor, aRespostaDoAtor,
} from "../src/motor/pedido-do-ator.js";
import { FICHA_DE_ATOR, verificarAFicha } from "../src/motor/ficha-de-ator.js";
import { PEDIDO_AO_NARRADOR, oPedidoDoTurno } from "../src/motor/pedido-do-turno.js";
import { oPesoPeloSistema, portaAberta } from "../src/motor/portas-do-narrador.js";
import { osVistosDaNarrativa } from "../src/motor/entrega-do-turno.js";
import { diasVistosDe } from "../src/elenco.js";
import { envelopeDoTeste } from "../src/testes.js";
import { TAMANHO_DA_NARRATIVA } from "../src/escuta.js";
import { MOTIVO_SEM_NARRATIVA } from "../src/guardado.js";
import { oTamanhoDaResposta, comOTamanho } from "../src/tamanho-da-resposta.js";
import { REDE_DE_SAIDA } from "../api/_provedor.js";
import { oPedidoNoServidor, oTurnoNoServidor } from "../src/turno-no-servidor.js";
import { estadoNoTurno } from "../src/sessao.js";
import { lerODourado, casosDoPedido, correrAPeca, osModulos, osPadroes } from "./pedido-bloco.mjs";
import { N_DA_PAUTA } from "./pauta-bloco.mjs";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const congelar = (x) => { if (x && typeof x === "object") { Object.freeze(x); for (const v of Object.values(x)) congelar(v); } return x; };
const media = (a) => Math.round(a.reduce((s, x) => s + x, 0) / Math.max(1, a.length));
const tamanho = (p) => p.system.length + p.messages.reduce((s, m) => s + String(m.content).length, 0);

sec("§1 as tabelas");
t("o pedido à rede tem as chaves do pedido do Mestre (o App e o servidor chamam igual)", JSON.stringify(Object.keys(PEDIDO_AO_ATOR).sort()) === JSON.stringify(Object.keys(PEDIDO_AO_NARRADOR).sort()));
t("a resposta é texto, não JSON", PEDIDO_AO_ATOR.formato === "texto" && PEDIDO_AO_NARRADOR.formato === "json");
t("a tarefa é a do Narrador (o mesmo modelo responde aos dois modos até o teste às cegas)", PEDIDO_AO_ATOR.tarefa === PEDIDO_AO_NARRADOR.tarefa);
t("sem a ficha do cache (o ofício fica abaixo do mínimo do cache explícito)", PEDIDO_AO_ATOR.comCache === false);
t("o teto de saída cabe na rede do Narrador de turno (api/_provedor.js)", PEDIDO_AO_ATOR.maxTokens > 0 && PEDIDO_AO_ATOR.maxTokens <= REDE_DE_SAIDA.narrador);
const OF = oOficioDoAtor();
t(`o ofício cabe no teto da meta (${OF.length} de ${OFICIO_DO_ATOR.teto} caracteres)`, OF.length <= OFICIO_DO_ATOR.teto && OFICIO_DO_ATOR.teto <= 4000);
t("o ofício diz o tamanho da narrativa de hoje (TAMANHO_DA_NARRATIVA), sem marcador por trocar", OF.includes(`de ${TAMANHO_DA_NARRATIVA.min} a ${TAMANHO_DA_NARRATIVA.max} palavras`) && !/\{(min|max)\}/.test(OF));
t("o ofício explica cada parte da ficha, pelo nome", FICHA_DE_ATOR.partes.every((p) => OF.includes(`- ${p}:`)));
t("e o «Livre:» da conversa sem consequência", /«Livre:» quer dizer/.test(OF) && /não promete, não cobra, não revela, não oferece/.test(OF));
t("o ofício proíbe criar gente com nome, lugar, item ou moeda", /Não existe mais ninguém com nome, nem outro lugar, item ou moeda/.test(OF));
t("e pede só prosa, sem JSON", /Só a cena, em prosa/.test(OF) && /sem JSON/.test(OF));
t("os gatilhos têm ids únicos, expressão e a origem no diagnóstico", new Set(GATILHOS_DE_TIQUE.map((g) => g.id)).size === GATILHOS_DE_TIQUE.length && GATILHOS_DE_TIQUE.every((g) => g.rx instanceof RegExp && /§/.test(g.de)));

sec("§2 a catraca dos tiques");
const noOficio = osTiquesDoOficio(OF);
t(`o ofício não tem nenhum gatilho de tique do diagnóstico${noOficio.length ? " — " + noOficio.map((x) => `${x.id} «${x.trecho}»`).join("; ") : ""}`, noOficio.length === 0);
/* as frases que o diagnóstico (mente/narrador-ator-voz.md §1–2) apontou
   como causa: cada gatilho tem de morder a sua — uma régua que não morde
   não prova nada */
const CAUSAS = [
  ["falaAMeio", "alguém em cena deixa uma fala a meio, e acaba nela"],
  ["falaAMeio", "deixe os personagens se interromperem"],
  ["perguntaDireta", "alguém em cena faz-me uma pergunta direta, e acaba nela"],
  ["perguntaDireta", "Termine SEMPRE devolvendo a palavra ao jogador"],
  ["dilema", "a ficção põe-me nas mãos duas coisas que não cabem juntas, e as duas custam"],
  ["naoSei", "o que ninguém aqui sabe, quem responde diz que não sabe"],
  ["naoSei", "quem fala na cena não sabe, desconversa ou diz sem número"],
  ["apresentacao", "que diz ao herói o próprio nome logo que lhe fala"],
  ["vocativo", "é a comum dos andejos, mulher"],
  ["verboDeDizer", "— resmunga Corrado, limpando o suor"],
  ["verboDeDizer", "Corrado pigarreia grosso e dá meio passo para trás"],
  ["gesto", "sem cuspe, braços cruzados, olhar fixo"],
  ["gesto", "calados que dizem tudo com um olhar"],
  ["gesto", "A cena, o gesto, o cheiro, o silêncio antes da resposta"],
  ["imagem", "O silêncio desce pesado sobre a carcaça"],
  ["vozDoMundo", "palavrão à vontade, gíria e a contração da fala viva ('tá', 'cê', 'pra')"],
  ["vozDoMundo", "Ninguém fala BONITO"],
  ["razaoDoMestre", "o lugar não comporta: cercar, correr"],
  ["razaoDoMestre", "uma coisa só aponta para: Procurar Corrado"],
];
for (const [id, frase] of CAUSAS) t(`${id} morde «${frase}»`, osTiquesDoOficio(frase).some((x) => x.id === id));
t("todo gatilho da tabela tem ao menos uma causa que o morde aqui", GATILHOS_DE_TIQUE.every((g) => CAUSAS.some(([id]) => id === g.id)));

sec("§3 o pedido");
for (const [nome, e] of [["null", null], ["undefined", undefined], ["{}", {}], ["tipos errados", { nota: 5, frase: {}, estado: [], rolagem: 9 }], ["estado com nulos", { nota: "ONDE      em Monte Rasa", estado: { personagem: null, npcs: null, nucleoCache: { nucleo: null }, mensagens: null } }]]) {
  let r = null, erro = null;
  try { r = oPedidoDoAtor(e); } catch (x) { erro = x; }
  t(`${nome}: não estoura, e o pedido sai com a forma da rede`, !erro && r && r.pedido.system === OF && r.pedido.messages.length === 1 && r.pedido.messages[0].role === "user" && r.pedido.formato === "texto" && r.ficha && typeof r.ficha.texto === "string");
}
const MSGS = [
  { autor: "jogador", texto: "entro na liça" }, { autor: "mestre", texto: "A areia está molhada." },
  { autor: "sistema", texto: "🎲 Atletismo: 14" },
  { autor: "jogador", texto: "procuro o Corrado" }, { autor: "mestre", texto: "O homem do balcão aponta a porta dos fundos." },
  { autor: "jogador", texto: "pergunto ao Corrado quanto custa a vaga" },
];
const ENT = congelar({ nota: "ONDE      em Largo da Liça", frase: "pergunto ao Corrado quanto custa a vaga", estado: { personagem: { nome: "Iara", grupo: [] }, npcs: {}, mensagens: MSGS, minuto: 600 } });
const p1 = oPedidoDoAtor(ENT), p2 = oPedidoDoAtor(ENT);
t("a mesma entrada dá o mesmo pedido (e o estado congelado não estoura)", JSON.stringify(p1.pedido) === JSON.stringify(p2.pedido));
const C1 = p1.pedido.messages[0].content;
t("«Há pouco» vem antes da ficha, e a ficha é a da etapa 1 tal qual", C1.startsWith(OFICIO_DO_ATOR.haPouco + "\n") && C1.endsWith(p1.ficha.texto));
t("as duas trocas respondidas entram, na ordem, com a frase e a cena", C1.includes("Frase: «entro na liça»\nCena: A areia está molhada.\nFrase: «procuro o Corrado»\nCena: O homem do balcão aponta a porta dos fundos."));
t("a frase do turno, sem resposta ainda (no App já está no relato), não gasta uma troca", p1.ficha.trocas.length === 2 && !/Frase: «pergunto ao Corrado/.test(C1));
t("a linha do sistema no relato não é troca", !C1.includes("Atletismo"));
const semTrocas = oPedidoDoAtor({ ...ENT, estado: { ...ENT.estado, mensagens: [] } });
t("sem trocas, a mensagem é só a ficha", semTrocas.pedido.messages[0].content === semTrocas.ficha.texto);
t("o verificador da ficha continua limpo no pedido", verificarAFicha(p1.ficha.texto).length === 0);

sec("§4 a leitura da resposta");
t("prosa passa tal qual (aparada)", aProsaDoAtor("  A chuva cai.\n\nO homem diz o preço.  ") === "A chuva cai.\n\nO homem diz o preço.");
t("o cerco de código sai", aProsaDoAtor("```\nA chuva cai.\n```") === "A chuva cai." && aProsaDoAtor("```text\nA chuva cai.\n```") === "A chuva cai.");
t("JSON velho por engano: fica só a narrativa", aProsaDoAtor('{"narrativa":"O portão range.","mudancas":{"moedas":500}}') === "O portão range.");
t("JSON velho dentro do cerco, idem", aProsaDoAtor('```json\n{"narrativa":"O portão range.","sugestoes":["x"]}\n```') === "O portão range.");
t("JSON sem narrativa é resposta vazia (não a frase de recurso do Mestre)", aProsaDoAtor('{"mudancas":{"moedas":500}}') === "");
t("o eco dos cabeçalhos da ficha sai", aProsaDoAtor("CENA\nA chuva cai.\nO QUE SE DIZ\nO homem diz o preço.") === "A chuva cai.\nO homem diz o preço.");
t("CRLF vira LF", aProsaDoAtor("A chuva cai.\r\nO homem diz.") === "A chuva cai.\nO homem diz.");
t("nada dá nada", aProsaDoAtor(null) === "" && aProsaDoAtor("") === "" && aProsaDoAtor("   ") === "" && aProsaDoAtor(5) === "5");

sec("§5 o caminho inteiro, sobre uma porta falsa");
{
  const corpos = [];
  const r = await aRespostaDoAtor(p1.pedido, async (c) => { corpos.push(c); return "O homem do balcão diz o preço da vaga."; }, { frase: ENT.frase });
  t("uma chamada, com o pedido do ator (texto, sem cache)", corpos.length === 1 && corpos[0].system === OF && corpos[0].formato === "texto" && !("cache" in corpos[0]) && corpos[0].maxTokens === PEDIDO_AO_ATOR.maxTokens && corpos[0].tarefa === "narrador");
  t("a resposta é a prosa, e `mudancas` é null", r.resposta.narrativa === "O homem do balcão diz o preço da vaga." && r.resposta.mudancas === null && r.chamadas === 1);
}
{
  const corpos = [];
  const r = await aRespostaDoAtor(p1.pedido, async (c) => { corpos.push(c); return corpos.length === 1 ? { texto: "" } : { texto: "A porta abre." }; }, { frase: ENT.frase });
  t("a primeira vazia: a segunda escrita leva o reforço por último, e vale", corpos.length === 2 && corpos[1].messages[corpos[1].messages.length - 1].content === OFICIO_DO_ATOR.reforco && r.resposta.narrativa === "A porta abre." && r.chamadas === 2);
}
{
  let erro = null;
  try { await aRespostaDoAtor(p1.pedido, async () => ({ texto: "   " }), {}); } catch (e) { erro = e; }
  t("sem prosa nem na segunda: o turno não acontece (MOTIVO_SEM_NARRATIVA, como o Mestre)", erro && erro.message === MOTIVO_SEM_NARRATIVA);
  let erro2 = null;
  try { await aRespostaDoAtor(p1.pedido, async () => { throw new Error("rede caiu"); }, {}); } catch (e) { erro2 = e; }
  t("a porta que lança, lança (quem chama marca a falha)", erro2 && erro2.message === "rede caiu");
}
{
  const r = await aRespostaDoAtor(p1.pedido, async () => '{"narrativa":"O ouro brilha na mesa.","mudancas":{"moedas":500,"adicionar_itens":[{"nome":"Coroa"}]}}', {});
  t("JSON com campos: só a prosa, e nada a declarar", r.resposta.narrativa === "O ouro brilha na mesa." && r.resposta.mudancas === null && Object.keys(r.resposta).join() === "narrativa,mudancas");
}
{
  /* longa o bastante para a guarda cortar (FALA_DO_HEROI: o mínimo de palavras e a fração máxima cortada) */
  const fala = "Corrado olha a vaga vazia entre os mourões, conta os dedos de uma mão e depois os da outra, e a chuva escorre pela aba do chapéu até ao chão batido da liça.\n— Me dá a chave — você diz.\nEle entrega a chave de ferro, fria de ferrugem, e volta a contar as vagas com os olhos postos na areia molhada.";
  const r = await aRespostaDoAtor(p1.pedido, async () => fala, { frase: "abro a porta" });
  t("a fala que o herói não escreveu sai (a guarda vale nos dois modos)", !r.resposta.narrativa.includes("Me dá a chave") && r.resposta.narrativa.includes("Ele entrega a chave"));
  const r2 = await aRespostaDoAtor(p1.pedido, async () => fala, { frase: "digo: me dá a chave" });
  t("e fica quando o herói a disse", r2.resposta.narrativa.includes("Me dá a chave"));
}

sec("§6 A PROVA: os 434 casos");
const SESSOES = {};
const casos = [];
for (const s of ["s8", "s9", "s10", "navegador", "s13"]) {
  const A = JSON.parse(fs.readFileSync(new URL(`./sessao-${s}.json`, import.meta.url), "utf8"));
  SESSOES[s] = A;
  for (let i = 0; i < A.turnos.length; i++) {
    const ent = A.turnos[i].entrada || {};
    const frase = typeof ent.frase === "string" && ent.frase.trim() ? ent.frase : ent.toque && typeof ent.toque.conteudo === "string" ? ent.toque.conteudo : "";
    if (!frase.trim()) continue;
    const m = await oPedidoNoServidor({ estado: estadoNoTurno(A, i), frase }, { agora: () => 0 });
    /* as duas trocas de antes, do próprio arquivo da sessão, e a frase do
       turno por último sem resposta — o relato como o App o tem no envio */
    const ant = [i - 2, i - 1].filter((j) => j >= 0).map((j) => A.turnos[j]).filter((x) => x && x.entrada && x.narrador);
    const mensagens = [...ant.flatMap((x) => [{ autor: "jogador", texto: String(x.entrada.frase || (x.entrada.toque && x.entrada.toque.conteudo) || "") }, { autor: "mestre", texto: String(x.narrador.narrativa || "") }]), { autor: "jogador", texto: frase }];
    casos.push({ de: `${s}#${i}`, s, i, frase, nota: m.pedido.messages[m.pedido.messages.length - 1].content.split("\n═══")[0], estado: m.estadoDoFim, mestre: tamanho(m.pedido), mensagens });
  }
}
const nSessoes = casos.length;
{
  const D = lerODourado();
  const mods = await osModulos(D.imports), pad = osPadroes(D, mods);
  for (const k of casosDoPedido()) {
    const f = correrAPeca(oPedidoDoTurno, k, D, pad);
    const estado = { ...k.estado, ...f.valores, personagem: f.valores.personagem || k.render.personagem || k.estado.personagem, mundo: k.render.mundo || k.estado.mundo };
    casos.push({ de: `bloco#${k.i}`, frase: k.entrada.conteudo, nota: (f.out && f.out.nota) || "", estado, mestre: null });
  }
}
t(`os casos: ${nSessoes} frases das sessões pelo caminho do servidor + ${casos.length - nSessoes} do bloco`, nSessoes >= 140 && casos.length - nSessoes === N_DA_PAUTA);
const res = [];
let estourou = [];
for (const k of casos) { try { res.push({ k, r: oPedidoDoAtor({ nota: k.nota, frase: k.frase, estado: k.estado }) }); } catch (e) { estourou.push(`${k.de}: ${e.message}`); } }
t(`o pedido do ator monta-se nos ${casos.length}${estourou.length ? " — " + estourou.slice(0, 3).join("; ") : ""}`, estourou.length === 0 && res.length === casos.length);
const tams = res.map(({ r }) => tamanho(r.pedido));
const sist = new Set(res.map(({ r }) => r.pedido.system));
console.log(`  ..  o pedido do ator: média ${media(tams)}, pior ${Math.max(...tams)} caracteres; o ofício ${OF.length} (${Math.round((OF.length / media(tams)) * 100)}% da média)`);
t("o prefixo (o ofício) é o mesmo nos 434 — é ele o cacheável", sist.size === 1);
const doMestre = casos.filter((k) => k.mestre).map((k) => k.mestre);
console.log(`  ..  o pedido do Mestre nos ${doMestre.length} das sessões: média ${media(doMestre)}, pior ${Math.max(...doMestre)}`);
t(`sem trocas, o pior caso cabe no ~6 mil do plano (pior ${Math.max(...tams)})`, Math.max(...tams) <= 6000);
t("nenhum pedido do ator passa de um décimo do do Mestre no mesmo turno", res.slice(0, nSessoes).every(({ k, r }) => tamanho(r.pedido) * 10 <= k.mestre));
t("nenhum pedido leva rótulo do sistema na ficha (o verificador da etapa 1)", res.every(({ r }) => verificarAFicha(r.ficha.texto).length === 0));
const comTrocas = casos.slice(0, nSessoes).map((k) => oPedidoDoAtor({ nota: k.nota, frase: k.frase, estado: { ...k.estado, mensagens: k.mensagens } }));
const tamsT = comTrocas.map((r) => tamanho(r.pedido));
const nDuas = comTrocas.filter((r) => r.ficha.trocas.length === 2).length;
console.log(`  ..  com as duas trocas das sessões (${nDuas} de ${comTrocas.length} com duas): média ${media(tamsT)}, pior ${Math.max(...tamsT)}`);
t("com as trocas, a frase do turno nunca é uma delas", comTrocas.every((r, j) => r.ficha.trocas.every((x) => x.mestre)) && nDuas >= comTrocas.length - 10);
t(`com as duas trocas, o pior caso fica abaixo de 9 mil (o plano: ~6 mil típico; pior ${Math.max(...tamsT)})`, Math.max(...tamsT) <= 9000);

sec("§7 o servidor no `ator`, com IA falsa");
const PROSA = "A chuva bate no telhado. O homem do balcão limpa as mãos na saia de couro e olha a porta, não para você. Lá fora um cão late duas vezes e cala. O cheiro de cebola frita sobe da cozinha.";
const TENTACAO = JSON.stringify({ narrativa: PROSA, mudancas: { moedas: 500, adicionar_itens: [{ nome: "Coroa de Ferro", tipo: "tesouro" }], npcs: { "Velho Bartolo": { papel: "ferreiro" } }, cidade_atual: "Cidade Inventada", feito: "lendario", sinais: ["loot: lâmina lendária", "viagem: Cidade Inventada"] } });
const portaFalsa = (texto, corpos) => async (c) => { corpos.push(c); return { texto, uso: { entrada: 1000, saida: 200 } }; };
let fecham = 0, telaCerta = 0, redeCerta = 0, calado = 0, iguais = 0, mordeMestre = 0, mestreJson = 0, n7 = 0;
const difs = [];
for (const k of casos.slice(0, nSessoes)) {
  const A = SESSOES[k.s];
  const corpo = { estado: estadoNoTurno(A, k.i), frase: k.frase };
  const cA = [], cB = [], cC = [];
  let a, b, c;
  try {
    a = await oTurnoNoServidor(corpo, { agora: () => 0, chamar: portaFalsa(TENTACAO, cA), modoDoNarrador: "ator" });
    b = await oTurnoNoServidor(corpo, { agora: () => 0, chamar: portaFalsa(PROSA, cB), modoDoNarrador: "ator" });
  } catch (e) { difs.push(`${k.de}: estourou ${e.message}`); continue; }
  n7++;
  if (a && a.estadoDoFim) fecham++;
  if (a.tela.narrativa === PROSA && a.narrativa === PROSA) telaCerta++;
  /* EM2 (11/11): o ofício que vai à rede leva as palavras do tipo do turno
     (comOTamanho troca «de 80 a 140 palavras» pelo número do tipo); a régua
     compara com o ofício passado pela mesma peça, e não com o literal */
  const ofNaRede = comOTamanho({ system: OF }, oTamanhoDaResposta({ frase: k.frase })).system;
  if (cA.length === 1 && cA[0].formato === "texto" && cA[0].system === ofNaRede && !("cache" in cA[0])) redeCerta++;
  if (!a.cronista.chamado && a.ia.chamadas === 1) calado++;
  if (JSON.stringify(a.estadoDoFim) === JSON.stringify(b.estadoDoFim) && JSON.stringify(a.eco) === JSON.stringify(b.eco)) iguais++; else if (difs.length < 5) difs.push(`${k.de}: ${Object.keys(a.estadoDoFim).filter((x) => JSON.stringify(a.estadoDoFim[x]) !== JSON.stringify(b.estadoDoFim[x])).join(",")}`);
  /* a mordida: o `mestre` com a mesma tentação, num de cada cinco */
  if (n7 % 5 === 1) {
    c = await oTurnoNoServidor(corpo, { agora: () => 0, chamar: portaFalsa(TENTACAO, cC), cronista: () => null });
    if (cC[0] && cC[0].formato === "json") mestreJson++;
    if (JSON.stringify(c.estadoDoFim) !== JSON.stringify(b.estadoDoFim)) mordeMestre++;
  }
}
const nMorde = Math.ceil(n7 / 5);
t(`o turno fecha nos ${nSessoes} (${fecham})${difs.length && fecham < nSessoes ? " — " + difs.slice(0, 3).join("; ") : ""}`, fecham === nSessoes);
t(`a tela recebe a prosa (${telaCerta}/${n7})`, telaCerta === n7);
t(`a rede recebe o pedido do ator: texto, o ofício, sem cache (${redeCerta}/${n7})`, redeCerta === n7);
t(`uma chamada só, e o Cronista cala (${calado}/${n7})`, calado === n7);
t(`NADA ENTRA PELO ATOR: a resposta cheia de campos deixa o estado e o eco iguais aos da mesma prosa sem campos (${iguais}/${n7})${iguais < n7 ? " — " + difs.slice(0, 3).join("; ") : ""}`, iguais === n7);
t(`e a prova morde: no \`mestre\` a mesma resposta vai em JSON e muda o estado (${mordeMestre}/${nMorde})`, mestreJson === nMorde && mordeMestre === nMorde);

sec("§8 o `mestre` não muda");
{
  let iguaisM = 0, semFicha = 0, json = 0, n8 = 0;
  for (const k of casos.slice(0, nSessoes).filter((_, j) => j % 7 === 0)) {
    n8++;
    const corpo = { estado: estadoNoTurno(SESSOES[k.s], k.i), frase: k.frase };
    const a = await oPedidoNoServidor(corpo, { agora: () => 0 });
    const b = await oPedidoNoServidor(corpo, { agora: () => 0, modoDoNarrador: "mestre" });
    if (JSON.stringify(a) === JSON.stringify(b)) iguaisM++;
    if (!("ficha" in a)) semFicha++;
    if (a.pedido.formato === "json" && a.pedido.comCache === true && a.pedido.system.length > 20000) json++;
  }
  t(`o pedido sem modo e com «mestre» é o mesmo, byte a byte (${iguaisM}/${n8})`, iguaisM === n8);
  t(`sem ficha de ator, e o pedido é o do Mestre: JSON, com cache, o system grande (${json}/${n8})`, semFicha === n8 && json === n8);
  const umAtor = await oPedidoNoServidor({ estado: estadoNoTurno(SESSOES.s9, 3), frase: "olho em volta" }, { agora: () => 0, modoDoNarrador: "ator" });
  t("no `ator`, o pedido do servidor é o do ator, e a ficha vai junto", umAtor.pedido.system === OF && umAtor.pedido.formato === "texto" && umAtor.ficha && typeof umAtor.ficha.texto === "string");
  const nome = await oPedidoNoServidor({ estado: estadoNoTurno(SESSOES.s9, 3), frase: "olho em volta" }, { agora: () => 0, modoDoNarrador: "inventado" });
  t("um modo que a tabela não tem é o padrão (o Mestre)", nome.pedido.formato === "json" && !("ficha" in nome));
}

sec("§9 as duas pontas: o peso da linha e a recência do elenco");
{
  const luta = (xs) => ({ inimigos: xs });
  const z = (nome, vida, extra = {}) => ({ nome, vida, ...extra });
  t("sem teste e sem luta: nada pesa", JSON.stringify(oPesoPeloSistema({})) === JSON.stringify({ houveDado: false, alguemCaiu: false, caidos: [] }));
  t("o teste do turno é o dado", oPesoPeloSistema({ teste: { pericia: "Atletismo", sucesso: false } }).houveDado === true);
  t("a rolagem da resposta também", oPesoPeloSistema({ rolagem: { valor: 12 } }).houveDado === true);
  const r1 = oPesoPeloSistema({ lutaAntes: luta([z("Zumbi", 6), z("Rato", 0)]), lutaDepois: luta([z("Zumbi", 0), z("Rato", 0)]) });
  t("quem caiu NESTE turno pesa; quem já estava caído, não", r1.alguemCaiu && r1.caidos.join() === "Zumbi");
  t("quem fugiu não morreu", !oPesoPeloSistema({ lutaAntes: luta([z("Zumbi", 6)]), lutaDepois: luta([z("Zumbi", 0, { fugiu: true })]) }).alguemCaiu);
  t("a luta que acabou: os caídos do fecho contam", oPesoPeloSistema({ lutaAntes: luta([z("Lobo", 4)]), lutaDepois: null, caidosDoFecho: ["Lobo"] }).caidos.join() === "Lobo");
  t("o golpe resolvido antes do Narrador conta pela foto do início", oPesoPeloSistema({ lutaAntes: luta([z("Lobo", 4)]), lutaDepois: luta([z("Lobo", 0, { derrotado: true })]) }).alguemCaiu);
  t("lixo não estoura", (() => { try { return oPesoPeloSistema(null).alguemCaiu === false && oPesoPeloSistema({ lutaAntes: 5, lutaDepois: "x", caidosDoFecho: [null, 3] }).alguemCaiu === false; } catch { return false; } })());
  t("a porta do peso: aberta no `mestre`, fechada no `ator`", portaAberta("pesoDaLinha", "mestre") && !portaAberta("pesoDaLinha", "ator"));

  const npcs = { Corrado: { papel: "empresário" }, "Dunstan Machado Torto": { papel: "marinheiro" }, Beraldo: { papel: "caixeiro" } };
  const ler = { elenco: null, npcs, dia: 4 };
  const vistos = (e) => JSON.stringify(e);
  const prosa = "Corrado conta as moedas, e Beraldo espera à porta.";
  const vM = osVistosDaNarrativa(ler, prosa, "mestre", ["Dunstan Machado Torto"]);
  const vM0 = osVistosDaNarrativa(ler, prosa, "mestre");
  t("no `mestre`, a recência é a da prosa, e os nomes do sistema não mudam nada", vistos(vM.elenco) === vistos(vM0.elenco) && vistos(vM.elenco).includes("Corrado") && !vistos(vM.elenco).includes("Dunstan"));
  const vA = osVistosDaNarrativa(ler, prosa, "ator", ["Dunstan Machado Torto"]);
  t("no `ator`, é de quem a ficha pôs a falar — e a prosa não conta", vistos(vA.elenco).includes("Dunstan") && !vistos(vA.elenco).includes("Corrado") && !vistos(vA.elenco).includes("Beraldo"));
  const vA0 = osVistosDaNarrativa(ler, prosa, "ator");
  const vVazio = osVistosDaNarrativa(ler, "", "mestre");
  t("no `ator` sem ninguém dito, fica como um turno sem narração", vistos(vA0.elenco) === vistos(vVazio.elenco));
  /* 03/11: os nomes juntos («A · B») herdavam o defeito da prosa — «Godfrey
     da Foz» dava recência também ao «Godfrey» do registo. O mais longo ganha. */
  const godos = { ...npcs, Godfrey: { papel: "carcereiro" }, "Godfrey da Foz": { papel: "taverneiro" } };
  const vG = osVistosDaNarrativa({ elenco: null, npcs: godos, dia: 4 }, prosa, "ator", ["Dunstan Machado Torto", "Godfrey da Foz"]);
  t("no `ator`, «Godfrey da Foz» na lista não conta o «Godfrey»", diasVistosDe(vG.elenco, "Godfrey da Foz") === 1 && diasVistosDe(vG.elenco, "Godfrey") === 0 && diasVistosDe(vG.elenco, "Dunstan Machado Torto") === 1);
  const vG2 = osVistosDaNarrativa({ elenco: null, npcs: godos, dia: 4 }, prosa, "ator", ["Godfrey", "Godfrey da Foz"]);
  t("e os dois na lista contam os dois", diasVistosDe(vG2.elenco, "Godfrey da Foz") === 1 && diasVistosDe(vG2.elenco, "Godfrey") === 1);
  const quem = oPedidoDoAtor({ nota: "", frase: "olho", estado: { personagem: { nome: "Iara", grupo: [{ nome: "Dunstan Machado Torto", vinculo: 30 }] }, npcs } }).ficha.falam;
  t("a ficha dá o `falam` que o App passa ao elenco", Array.isArray(quem));
}

sec("§10 o dado que já rolou, pelo servidor");
{
  /* 03/11: no App o dado rola na tela e só depois o envelope do teste vai a
     `enviar` como a frase do turno — é a que o servidor recebe no corpo. A
     pauta montada sobre ela traz A APOSTA, e a ficha lê o dado da frase:
     o mesmo caminho nos dois lados, sem campo novo no corpo. */
  const A = SESSOES.s8;
  const env = envelopeDoTeste({ tipo: "forca", pericia: "atletismo", nivelTreino: "treinada", motivo: "saltar a fenda", valor: 5, mod: 3, total: 8, dc: 12, resultado: "falha" });
  const mA = await oPedidoNoServidor({ estado: estadoNoTurno(A, 10), frase: env }, { agora: () => 0, modoDoNarrador: "ator" });
  const mM = await oPedidoNoServidor({ estado: estadoNoTurno(A, 10), frase: env }, { agora: () => 0 });
  t("a pauta desse turno traz A APOSTA (o pedido do Mestre a tem)", /A APOSTA/.test(mM.pedido.messages[mM.pedido.messages.length - 1].content));
  t("e a ficha do ator diz o resultado em palavras, com só o ramo que o dado deu", /tentou saltar a fenda, e não conseguiu\./.test(mA.ficha.partes.ACONTECEU) && /O dado decidiu: pendurado na borda/.test(mA.ficha.partes.ACONTECEU) && !/Em jogo, numa tentativa/.test(mA.ficha.texto));
  t("sem d20, dificuldade nem a ordem do envelope", !/d20|dificuldade|REGRA|Revele/.test(mA.ficha.texto) && verificarAFicha(mA.ficha.texto).length === 0);
}

console.log(`\n${bons} ok, ${maus} falharam`);
if (maus) process.exit(1);
