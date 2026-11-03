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
  TRADUCAO_DA_PAUTA, TRADUCAO_DOS_ENVELOPES,
} from "../src/motor/ficha-de-ator.js";
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
t("a fera não fala, e não tem exemplo de fala", REGISTOS_DE_FALA[0].id === "fera" && REGISTOS_DE_FALA[0].exemplos.length === 0);
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
t("a voz do Dunstan sai do núcleo inteira — o tique e o exemplo", L.includes("fala como marinheiro em terra firme") && L.includes("Amarre isso, que vem vento."));
t("o Corrado, que não tem tique, fala pelo registo do ofício e trata a forasteira como forasteira", /Corrado — [^\n]*\n  Fala: frase de negociante/.test(L) && /Corrado[\s\S]*?como a forasteiro/.test(L) && !/Corrado — [^\n]*\n  Fala: [^\n]*(jura|marinheiro)/.test(L));
t("o vínculo de 30 dá ao Dunstan o trato de confiança", /Dunstan[\s\S]*?pelo nome, com confiança/.test(L));
t("o que o Corrado faz (A GENTE) é o seu «Agora», dito do herói", /Agora: deixa claro que sabe de uma coisa, e que a coisa tem preço\./.test(L));
t("o longe vira fronteira, com os dias por extenso e sem as 48h", /Anselmo está longe, em Vau Seco, a dois dias daqui\./.test(L) && !/48h/.test(L));
t("a última palavra é de quem responde, sem o veto do gesto", /É de Corrado: uma fala que fica a meio/.test(L) && !/cuspe|braços cruzados/.test(L));
t("os nomes à mão vão às fronteiras, e só a gente da ficha fala", /À mão, para quem ainda não tem nome: Bruna, Telmo\./.test(L) && r1.falam.join("|") === "Dunstan Machado Torto|Corrado");
t("a hora é dita em palavras, e o tempo junta-se ao lugar", L.includes("De manhã.") && L.includes("Em Largo da Liça, dentro de Porto das Pedras, com chuva fina."));
t("o que o lugar comporta cai como regra, e a moldura como moldura", r1.cobertura.caidos.regra === 1 && r1.cobertura.caidos.moldura === 1 && r1.rastro.every((x) => x.vai || x.cai in MOTIVOS_DO_CORTE));
t("sem conteúdo decidido, o que se diz é livre", /O QUE SE DIZ\nLivre:/.test(L));
t("as duas últimas trocas vêm tal qual, para a continuidade", r1.trocas.length === 1 && r1.trocas[0].jogador === "entro na liça" && r1.trocas[0].mestre === "A areia está molhada.");

const comPedido = aFichaDeAtor({ ...CASO, nota: CASO.nota + "\nQUEM CARREGA Corrado (quem pôs o herói no caminho; é fato: vem ter com o herói e entra nesta resposta, dito por ele): PEDE ao herói: \"Meio dia de desvio até uma campa.\"" });
t("o pedido do QUEM CARREGA vai inteiro ao que o Corrado diz, e a última palavra passa a ser dele", /O QUE SE DIZ\nCorrado: pede: "Meio dia de desvio até uma campa\."/.test(comPedido.texto) && /É de Corrado/.test(comPedido.texto) && verificarAFicha(comPedido.texto).length === 0);
const APOSTA = "A APOSTA  Se passa: saltar a fenda com corrida — dê o resultado limpo, sem custo escondido.\n          Se falha: pendurado na borda: segunda decisão, agora pior. A moeda é posição — a cena anda.";
const ap = (rolagem) => aFichaDeAtor({ nota: APOSTA, frase: "salto", rolagem }).texto;
t("o dado que falhou deixa só o ramo da falha", /O dado decidiu: pendurado na borda: segunda decisão, agora pior\./.test(ap("falha")) && !/saltar a fenda/.test(ap("falha")));
t("sem dado, a aposta fica como o que está em jogo, os dois ramos", /Em jogo, numa tentativa: se passa, saltar a fenda com corrida; se falha, pendurado na borda/.test(ap()) && verificarAFicha(ap()).length === 0);
const golpe = aFichaDeAtor({ frase: "Seguro a ação e observo Turno dos inimigos (resolvido pelo sistema, dano já aplicado — narre só as decisões): Falk (Golpe pesado)→Freya: 8 de dano = golpe devastador (57% da vida dele), de pé com 6/14 [narre como: brutal — quase o derruba de uma vez].", estado: { personagem: { nome: "Marga", grupo: [{ nome: "Freya" }] } } });
t("o golpe resolvido na frase vira fato, com o corpo em palavras e sem o número", /Falk acerta Freya \(golpe pesado\): golpe devastador — brutal — quase o derruba de uma vez; Freya fica mal, a sangrar\./.test(golpe.texto) && !/6\/14|57%|narre/.test(golpe.texto));
t("e a frase do herói fica só com o que ele disse", golpe.texto.includes("Marga: «Seguro a ação e observo»"));
const ausente = aFichaDeAtor({ frase: "Pergunto a Helga quem eram eles.", estado: { npcs: { Helga: { nome: "Helga", local: "Monte Rasa" } } } });
t("quem a frase chama e não está aqui é fronteira, com onde vive", /Helga não está aqui: vive em Monte Rasa, fora desta cena\./.test(ausente.texto) && !ausente.falam.includes("Helga"));
t("«Godfrey» e «Godfrey da Foz» são duas pessoas (o primeiro nome não basta)", aFichaDeAtor({ nota: "EM CENA   Godfrey (carcereiro) · Godfrey da Foz (taverneiro)" }).falam.length === 2);

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
/* medido em 03/11: média 1 349, pior 1 989 — a catraca fica um pouco acima */
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
t("só falam os da ficha: cada nome das fronteiras tem o seu bloco ou a sua linha", res.every(({ r }) => r.falam.every((n) => r.texto.split("\n").some((l) => l.startsWith(n + " — ") || (l.startsWith("Também aqui:") && l.includes(n))))));
t("a mesma corrida dá as mesmas fichas (determinismo sobre o corpus)", res.slice(0, 60).every(({ k, r }) => aFichaDeAtor({ nota: k.nota, frase: k.frase, estado: k.estado }).texto === r.texto));

sec("§6 o modo `mestre` não muda um byte");
t(`as ${fotosBatem.length} fotos do pedido de hoje batem com o dourado, com a ficha a correr no mesmo processo`, fotosBatem.length === N_DA_PAUTA && fotosBatem.every(Boolean));
const pecas = ["pauta-do-turno.js", "pedido-do-turno.js", "preludio-do-turno.js"].map((f) => fs.readFileSync(new URL(`../src/motor/${f}`, import.meta.url), "utf8"));
t("nenhuma peça do pedido de hoje lê a ficha (ela não tem consumidor até a etapa 2)", pecas.every((s) => !s.includes("ficha-de-ator")) && !fs.readFileSync(new URL("../src/turno-no-servidor.js", import.meta.url), "utf8").includes("ficha-de-ator"));

console.log(`\nficha de ator: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
