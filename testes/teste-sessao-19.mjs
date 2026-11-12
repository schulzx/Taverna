/* A 19.ª SESSÃO DE PROVA, AS CORREÇÕES DO MOTOR (12/11/2026) — mente/sessao-19.md §3–§5

   A sessão contou 5 verdades, 1 oráculo, 4 respostas plausíveis ou
   inventadas e 1 verdade sobre a coisa errada — e o padrão: há verdade onde
   há tabela ou fio, e invenção onde há sucesso sem facto ou pergunta aberta.
   Cada secção é um defeito, e cada caso é uma frase da sessão (ou o
   mecanismo dela), que falhava na HEAD de antes e passa agora:

   §1 todo sucesso tem dono (defeito 1): o teste de ação leva o EFEITO, o de
      saber o FACTO, e todo envelope do sim leva o veto (não revela o
      segredo, não cria objeto, não cobra custo) — por perícia;
   §2 a busca acha onde a quest aponta (defeito 2): o passo «Saber onde X
      guarda Y» planta Y no lugar, a busca lá entrega-o, e o RUMO aponta
      para o mesmo sítio;
   §3 a escuta ouve o verbo certo (defeito 3), frase a frase;
   §4 saberes responde sobre o que se perguntou (defeito 4);
   §5 EM2: o turno sem a frase do jogador também leva a linha de tamanho;
   §6 EM3: o que está perto e no mapa é saber comum;
   §7 EM4: a falha por pouco em toda linha de saber, e a falha que não é
      «nada». */
import { DESAFIOS, lerAcao, desfechoDaMargem, MARGEM_DA_FALHA, custoPorAlvo } from "../src/desafios.js";
import { envelopeDoTeste, VETO_DO_SUCESSO, FALHA_SEM_NADA } from "../src/testes.js";
import { oFactoDoSucesso, EFEITO_DO_SUCESSO, FACTO_DO_SUCESSO } from "../src/facto-do-sucesso.js";
import { oPassoDaQuest, achadoDoPasso, PISTA_DO_PASSO } from "../src/a-quest-manda.js";
import { abrirQuest, PAPEIS_DA_QUEST, questPorId } from "../src/biblioteca-de-quests.js";
import { garantirFactos } from "../src/livro-de-factos.js";
import { cenaDoDegrau, ESCADA_DA_ESCUTA, ETIQUETA_DO_PEDIDO } from "../src/escuta.js";
import { lugarPedido } from "../src/lugar.js";
import { resolverLugar, ALVO_NA_CENA } from "../src/resolver.js";
import { detectarEntradaEmMasmorra } from "../src/rastro.js";
import { aEsperaDaFrase } from "../src/motor/a-espera-da-frase.js";
import { gerarGeografia } from "../src/geografia.js";
import { oQueExisteAqui, garantirBase } from "../src/mundo-base.js";
import { tipoDoTurno, oTamanhoDaResposta, comOTamanho, linhaSemEtiqueta, SINAIS_DO_ENVELOPE, TAMANHO_DA_RESPOSTA } from "../src/tamanho-da-resposta.js";
import { saberDoHeroi, saberComumDe, SABER_COMUM, porQueNaoChama } from "../src/motor/o-mestre-chama.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
/* a heroína da sessão é Ladina: leva gazuas (sem elas a tranca é «impossível», não um teste) */
const CTX = { personagem: { nivel: 3, atributos: {}, pericias: {}, inventario: [{ nome: "Gazuas de osso" }] }, lugar: "Cadeia do Pelourinho", tentativas: {} };
const ler = (f, ctx = CTX) => lerAcao(f, ctx);
const BASE_ENV = { valor: 15, mod: 3, total: 18, dc: 13, resultado: "sucesso", critico: false, desastre: false };

sec("§1 todo sucesso tem dono (defeito 1) — por perícia");
{
  /* o catálogo inteiro: todo teste que não é conversa tem um dono do
     sucesso — uma família de facto (o mundo) ou um efeito (o gesto) */
  const semDono = DESAFIOS.filter((d) => !d.social && !d.gesto)
    .filter((d) => !FACTO_DO_SUCESSO.familias[d.id] && !EFEITO_DO_SUCESSO.efeitos[d.id]).map((d) => d.id);
  t(`todo desafio do catálogo que não é conversa tem dono do sucesso${semDono.length ? " — sem dono: " + semDono.join(", ") : ""}`, semDono.length === 0);
  const fora = Object.keys(EFEITO_DO_SUCESSO.efeitos).filter((id) => !DESAFIOS.some((d) => d.id === id));
  t("todo efeito é de um desafio do catálogo", fora.length === 0, fora.join(", "));
  t("os efeitos cabem no teto do facto e não falam do sistema", Object.values(EFEITO_DO_SUCESSO.efeitos).every((e) => e.length <= FACTO_DO_SUCESSO.teto && !/sistema|or[aá]culo|\bteste\b|\bdado\b/i.test(e)));

  /* as frases dos seis sucessos vazios da sessão, perícia a perícia */
  const SEIS = [
    ["Intuição (T4)", "estudo a cara dela: está mentindo?", "intuicao"],
    ["Medicina (T7)", "mastigo tanchagem e faço uma pasta para estancar o sangue das mãos esfoladas", "medicina"],
    ["Prestidigitação (T16)", "surrupio o molho de chaves de cima do cepo e escondo na manga", "prestidigitacao"],
    ["Prestidigitação/tranca (T18)", "abro o cadeado do baú com a gazua de osso", null],
    ["Furtividade (T30)", "me esgueiro pela sombra do muro sem ser vista", "furtividade"],
    ["Furtividade/seguir (T5)", "vou atrás do Anselmo de longe, colada às paredes, sem que ele perceba", "furtividade"],
  ];
  for (const [nome, frase, per] of SEIS) {
    const v = ler(frase);
    const f = v && v.tipo === "teste" ? oFactoDoSucesso(v, {}) : null;
    t(`${nome}: a frase rola${per ? " " + per : ""} e o sucesso tem o efeito do sistema`, !!v && v.tipo === "teste" && (!per || v.pericia === per) && !!f && f.fonte === "efeito", `${v && v.id} ${J(f)}`);
    const env = envelopeDoTeste({ ...BASE_ENV, tipo: (v && v.atributo) || "destreza", pericia: v && v.pericia, motivo: v && v.rotulo, facto: f });
    t(`${nome}: o envelope leva o efeito, sem «revele UMA coisa», com o veto inteiro`, !!f && env.includes(f.texto) && !/Revele UMA coisa/.test(env) && env.includes(VETO_DO_SUCESSO.segredo) && env.includes(VETO_DO_SUCESSO.objeto) && env.includes(VETO_DO_SUCESSO.custo), env.slice(-400));
  }
  const vT = ler("estudo a cara dela: está mentindo?");
  const fT = oFactoDoSucesso({ ...vT, quem: "Margarida" }, {});
  t("o efeito diz o nome de quem se lê, e não o que ela esconde", /Margarida/.test(fT.texto) && /guardado/.test(fT.texto), fT.texto);

  /* o texto genérico nunca vai sozinho: sem facto, leva o veto */
  const semFacto = envelopeDoTeste({ ...BASE_ENV, tipo: "percepcao", pericia: "percepcao", motivo: "x" });
  t("sem facto nenhum, o genérico vai com o veto (nunca sozinho)", /Revele UMA coisa/.test(semFacto) && semFacto.includes(VETO_DO_SUCESSO.objeto) && semFacto.includes(VETO_DO_SUCESSO.custo));
  const gesto = envelopeDoTeste({ ...BASE_ENV, tipo: "destreza", gesto: true, motivo: "saltar" });
  t("o gesto improvisado também leva o veto", gesto.includes(VETO_DO_SUCESSO.objeto) && gesto.includes(VETO_DO_SUCESSO.custo));
  const fio = envelopeDoTeste({ ...BASE_ENV, tipo: "destreza", pericia: "prestidigitacao", total: 14, valor: 11, facto: { fonte: "efeito", texto: "a mão leve passa" }, meio: { porPouco: true, faixa: "mas", margem: 1, diz: "a coisa vem tilintando" } });
  t("no sim por um fio: o preço do sistema fica, e o veto não proíbe o custo", fio.includes("a coisa vem tilintando") && fio.includes(VETO_DO_SUCESSO.objeto) && !fio.includes(VETO_DO_SUCESSO.custo));
  const doPasso = envelopeDoTeste({ ...BASE_ENV, tipo: "percepcao", pericia: "percepcao", facto: { fonte: "passo", texto: "o livro está aqui" } });
  t("quando o facto É o segredo do passo, o veto não o proíbe", doPasso.includes("o livro está aqui") && !doPasso.includes(VETO_DO_SUCESSO.segredo) && doPasso.includes(VETO_DO_SUCESSO.objeto));
  const falha = envelopeDoTeste({ ...BASE_ENV, tipo: "percepcao", pericia: "percepcao", total: 5, valor: 2, resultado: "falha", facto: fT });
  t("na falha, nem o efeito nem o veto do sim", !falha.includes(fT.texto) && !falha.includes(VETO_DO_SUCESSO.abre));
}

sec("§2 a busca acha onde a quest aponta (defeito 2)");
{
  const F = questPorId("o_livro_dos_nomes");
  t("a quest da sessão existe no catálogo", !!F);
  const C = "Ribeira das Areias";
  const e0 = { npcs: {}, cidadeAtual: C, lugar: { nome: "Largo dos Tropeiros", cidade: C }, personagem: { nome: "Pipa", grupo: [], inventario: [] }, dia: 1, npcTurno: 0, factos: garantirFactos(null), baseMundo: null };
  const papeis = {};
  for (const [k, d] of Object.entries(F.papeis)) {
    const tipo = (PAPEIS_DA_QUEST[d.de] || {}).tipo;
    papeis[k] = tipo === "lugar" ? { nome: "A Biblioteca do Sino", cidade: C } : tipo === "item" ? { nome: d.nome || `a coisa ${k}` } : { nome: `Pessoa ${k}` };
  }
  const R = abrirQuest(F, { estado: e0, papeis });
  const R2 = { ...R, feitas: { escrivao: { dia: 1 } }, acesas: { ...R.acesas, casa: 1 } };
  const passo = oPassoDaQuest(F, R2, { estado: e0 });
  t("o passo «Saber onde … guarda o livro» manda descobrir um lugar", !!passo && passo.etapa === "casa" && passo.descobrir.length === 1, J(passo && passo.descobrir));
  const casa = passo.descobrir[0];
  t("e o livro está plantado nesse lugar (o item que a quest lá faz nascer)", casa.guarda === "o livro dos nomes", J(casa));
  const a = achadoDoPasso([passo], { lugar: casa.nome, cidade: C });
  t("a busca no lugar acha O LIVRO, pelo nome, e não uma pista vaga", !!a && /livro dos nomes/i.test(a.o) && a.aponta && a.aponta.tipo === "item", a && a.o);
  t("a frase cabe no teto e é texto de mundo", a.o.length <= PISTA_DO_PASSO.teto && !/\{|undefined|sistema/.test(a.o));
  t("noutro sítio, a busca não acha o livro", achadoDoPasso([passo], { lugar: "Cadeia do Pelourinho", cidade: C }) === null);
  /* o facto do sucesso da busca no lugar é o do passo — o mesmo achado */
  const v = ler("Reviro as estantes atrás de um livro escondido");
  const f = oFactoDoSucesso(v, { passos: [passo], onde: { lugar: casa.nome, cidade: C } });
  t("o sucesso da busca lá dá o livro (fonte passo), e o envelope não o veta", !!f && f.fonte === "passo" && /livro dos nomes/i.test(f.texto), J(f));
  /* O RUMO aponta para o mesmo sítio */
  const sinal = ESCADA_DA_ESCUTA.find((d) => d.id === "sinal");
  const longe = cenaDoDegrau(sinal, { aqui: "na Cadeia do Pelourinho", passos: [passo], semente: 3 });
  t("o RUMO (o sinal do encalhe) aponta para o lugar do passo, e não para outro", longe.includes("Biblioteca do Sino") && !/Cadeia do Pelourinho: o que l/.test(longe), longe);
  const la = cenaDoDegrau(sinal, { aqui: `n${casa.nome.slice(1)}`, passos: [passo], semente: 3 });
  t("lá dentro, o sinal diz que é ali mesmo", /aqui mesmo/.test(la), la);
  t("sem passos, a régua de antes (o sinal sem fio não inventa lugar)", cenaDoDegrau(sinal, { aqui: "na praça", semente: 3 }) === "");
  t("o facto da busca sem segredo já não diz «não há esconderijo»", !/não há esconderijo/.test(FACTO_DO_SUCESSO.frases.lugar.busca));
}

sec("§3 a escuta ouve o verbo certo (defeito 3)");
{
  const lug = [{ nome: "a guarita", tipo: "comodo", onde: "comodo", dentroDe: "Cadeia do Pelourinho" }, { nome: "as celas", tipo: "comodo", onde: "comodo", dentroDe: "Cadeia do Pelourinho" },
    { nome: "Cadeia do Pelourinho", tipo: "cadeia", onde: "dentro" }, { nome: "Terreiro Rouco", tipo: "mercado", onde: "dentro" }];
  const ida = (f) => lugarPedido(f, lug);
  t("«Seguimos para a Cadeia do Pelourinho» é ir à Cadeia (o plural do verbo)", (ida("Seguimos para a Cadeia do Pelourinho.") || {}).nome === "Cadeia do Pelourinho");
  t("e «vamos para o Terreiro Rouco» continua a ser", (ida("vamos para o Terreiro Rouco") || {}).nome === "Terreiro Rouco");
  t("«examino a guarita com cuidado: … procuro folhas» não é ir à guarita", ida("examino a guarita com cuidado: a mesa, as gavetas, procuro folhas arrancadas de livro") === null);
  t("…e é exame: Investigação", (ler("examino a guarita com cuidado: a mesa, as gavetas, o chão atrás do cepo, procurando folhas arrancadas de livro") || {}).id === "investigar");
  t("mas «examino a guarita. Depois vou até as celas» vai às celas", (ida("examino a guarita com cuidado. Depois vou até as celas") || {}).nome === "as celas");
  const mapa = { cidades: [{ nome: "Ribeira das Areias" }, { nome: "Bela do Rio" }] };
  const r = resolverLugar("Vou até a banca de couros e pergunto: Quem levou o livro?", mapa, { excluir: "Ribeira das Areias" });
  t("«Vou até a banca de couros» não é estrada (naoParte: sem DESTINO NÃO RECONHECIDO)", r && r.naoParte === true, J(r && r.tipo));
  t("e «vou para Bela do Rio» continua a ser", resolverLugar("vou para Bela do Rio", mapa, { excluir: "Ribeira das Areias" }).tipo === "achei");
  t("a banca é uma coisa da cena (a tabela)", ALVO_NA_CENA.coisas.includes("banca"));
  const mm = { id: "m1", nome: "Forte Abandonado de Gelo Fundo", tipo: "forte", cidadeProxima: "Ribeira das Areias", regiao: "R" };
  const boca = { cidadeAtual: "", masmorras: [mm], lugar: { nome: mm.nome, distancia: "arredores" }, emCombate: false };
  t("«Não entro de sola. Me agacho… vigiando a entrada» não abre o forte", detectarEntradaEmMasmorra("Não entro de sola. Me agacho atrás das pedras e fico vigiando a entrada", boca) === null);
  t("«Não entro de sola no forte, mas fico vigiando» também não", detectarEntradaEmMasmorra("Não entro de sola no forte, mas fico vigiando.", boca) === null);
  t("e «Entro no forte com a adaga na mão» abre", !!detectarEntradaEmMasmorra("Entro no forte com a adaga na mão", boca));
  t("«desço até a porta das celas… apalpo a fechadura atrás de alguma armadilha… e desarmo» rola a procura da armadilha", (ler("desço até a porta das celas. Antes de mexer, apalpo a fechadura atrás de alguma armadilha, agulha ou arame, e desarmo o que achar") || {}).tipo === "teste");
  t("«Enquanto espero, estudo a cara dela» não é esperar", aEsperaDaFrase("Vai ter que o quê? Enquanto espero, estudo a cara dela", { minuto: 600 }) === null);
  t("…e é ler a Margarida (Intuição)", (ler("Vai ter que o quê? Enquanto espero, estudo a cara dela") || {}).pericia === "intuicao");
  t("mas «espero até as onze» continua a ser esperar", !!aEsperaDaFrase("espero até as onze", { minuto: 600 }));
  const gestos = [
    ["passo rente ao Anselmo e tento aliviar a bolsa dele sem ele sentir", "bater_carteira"],
    ["Passo a mão espalmada por cima do alçapão. Sinto alguma magia aqui, algum resíduo de feitiço?", "arcano"],
    ["fico uma hora vigiando a boca do forte na garoa gelada, aguentando o frio sem bater os dentes", "aguentar"],
  ];
  for (const [f, id] of gestos) { const v = ler(f); t(`«${f.slice(0, 48)}…» → ${id}`, !!v && v.id === id, v && v.id); }
}

sec("§4 saberes responde sobre o que se perguntou (defeito 4)");
{
  const G = "Fantasia medieval";
  let caso = null;
  for (let i = 0; i < 60 && !caso; i++) {
    const sem = `S19|${i}`;
    const mapa = gerarGeografia(sem, G);
    for (const c of mapa.cidades) {
      const q = oQueExisteAqui(sem, mapa, c.nome, garantirBase(null), G);
      /* o mapa de prova nasce sem névoa levantada: a outra cidade é marcada como conhecida, como o App a marca ao ouvir falar dela */
      const outra = mapa.cidades.find((x) => x.nome !== c.nome && x.nome.split(" ").length >= 2);
      if (outra) outra.descoberta = true;
      if (q && q.masmorras.length && q.gente.length && outra && q.masmorras[0].nome.split(" ").length >= 2) { caso = { sem, mapa, c, q, outra }; break; }
    }
  }
  t("há um mundo de prova com masmorra perto, gente e outra cidade", !!caso);
  const { sem, mapa, c, q, outra } = caso;
  const local = q.locais[0];
  const ctx = { semente: sem, mapa, cidade: c.nome, base: garantirBase(null), genero: G, onde: { lugar: local.nome, cidade: c.nome, foraDosMuros: false } };
  const pergunta = (sobre) => oFactoDoSucesso(ler(`O que eu sei do ${sobre}?`), ctx);
  const mm = q.masmorras[0];
  const fM = pergunta(mm.nome);
  t("«o que sei d<a masmorra de perto>?» → um facto sobre a masmorra, não sobre a cidade", !!fM && fM.de.masmorra === mm.nome && fM.texto.startsWith(mm.nome), J(fM));
  const fC = oFactoDoSucesso(ler(`O que eu sei de ${outra.nome}?`), ctx);
  t("«o que sei de <outra cidade>?» → a outra cidade", !!fC && fC.de.cidade === outra.nome, J(fC));
  const p = q.gente.find((x) => !q.locais.some((l) => x.nome.includes(l.nome)));
  const fP = oFactoDoSucesso(ler(`O que eu sei sobre ${p.nome}?`), ctx);
  t("«o que sei sobre <pessoa daqui>?» → onde ela trabalha", !!fP && fP.de.pessoa === p.nome, J(fP));
  const fX = oFactoDoSucesso(ler("O que eu sei do Forte Abandonado de Gelo Fundo?"), ctx);
  t("um nome que o registo daqui não conhece não vira facto da cidade", !fX || !fX.de.cidade || fX.de.cidade !== c.nome, J(fX));
  const fAqui = oFactoDoSucesso(ler("O que eu sei desta cidade?"), { ...ctx, onde: { lugar: "", cidade: c.nome } });
  t("e «o que sei desta cidade?» continua a ser a cidade, dita sem «capital de»", !!fAqui && fAqui.de.cidade === c.nome && !/: \S+ de /.test(fAqui.texto.split(",")[0]), J(fAqui));
  const fB = oFactoDoSucesso(ler("O que eu sei sobre bichos assim?"), ctx);
  t("os bichos sem nome → os da região, não a cidade", !!fB && /anda por estas terras/.test(fB.texto), J(fB));
}

sec("§5 EM2 — a linha de tamanho também no turno do envelope");
{
  const env = "[TESTE PEDIDO POR MIM — ROLADO PELO SISTEMA] Pedi um teste de Furtividade.";
  t("o envelope do teste é do tipo teste (sem o App dizer)", tipoDoTurno({ frase: env }) === "teste");
  t("a chegada pelo envelope", tipoDoTurno({ frase: "[CHEGADA — DECIDIDA PELO SISTEMA] Cheguei." }) === "chegada");
  t("a luta pelo envelope", tipoDoTurno({ frase: "[COMBATE — RESOLVIDO] golpe." }) === "luta");
  t("a frase do jogador continua a mandar (o envelope não é lido nela)", tipoDoTurno({ frase: "Você conhecia o Tobias Fiapo?" }) === "pergunta");
  const tam = oTamanhoDaResposta({ frase: env });
  const ped = { system: "S", messages: [{ role: "user", content: "a" }, { role: "assistant", content: "b" }, { role: "user", content: `${env}\nRODAPÉ` }] };
  const n = comOTamanho(ped, tam);
  t("o pedido sem etiqueta leva a linha do tipo, no fim da última mensagem", n.messages[2].content.endsWith(`[${tam.linha}]`) && n.messages[2].content.startsWith(env), n.messages[2].content.slice(-120));
  t("as mensagens de antes não mudam (o prefixo do cache)", n.messages[0] === ped.messages[0] && n.messages[1] === ped.messages[1]);
  t("e o recebido não foi mutado", ped.messages[2].content === `${env}\nRODAPÉ`);
  const maior = Math.max(...Object.keys(TAMANHO_DA_RESPOSTA).map((k) => linhaSemEtiqueta(k).length));
  t(`a linha sem etiqueta nunca é maior do que a etiqueta que o turno não leva (${maior} ≤ ${ETIQUETA_DO_PEDIDO.length})`, maior <= ETIQUETA_DO_PEDIDO.length);
  t("os sinais do envelope são tipos da tabela", Object.keys(SINAIS_DO_ENVELOPE).every((k) => TAMANHO_DA_RESPOSTA[k]));
}

sec("§6 EM3 — o que está perto e no mapa é saber comum");
{
  const mapa = { cidades: [{ nome: "Ribeira das Areias" }, { nome: "Bela do Rio" }], rotas: [{ de: "Ribeira das Areias", para: "Bela do Rio", dias: 1 }],
    regiao: { nome: "R", lugares: [{ id: "l1", nome: "Forte Abandonado de Gelo Fundo", tipo: "forte", cidadeProxima: "Ribeira das Areias", nivel: 2 }] } };
  const saber = saberDoHeroi({ cidade: "Ribeira das Areias", lugar: { nome: "Taverna do Sino Rachado", cidade: "Ribeira das Areias" }, mapa });
  t("o saber do herói tem o forte (perto, no mapa) e a cidade da estrada direta", (saber.conhecidos || []).includes("Forte Abandonado de Gelo Fundo") && saber.conhecidos.includes("Bela do Rio"), J(saber.conhecidos));
  const v = ler("O que eu sei do Forte Abandonado de Gelo Fundo?");
  const sc = saberComumDe(v, { saber });
  t("«o que eu sei do Forte…?» é saber comum, sem dado", !!sc && sc.fonte === "perto" && porQueNaoChama(v, { saber }) === "saberComum", J(sc));
  t("o segredo do forte continua a rolar", saberComumDe(ler("O que eu sei do segredo do Forte Abandonado de Gelo Fundo?"), { saber }) === null);
  t("sem mapa, a fonte cala-se (o comportamento de antes)", saberDoHeroi({ cidade: "Ribeira das Areias" }).conhecidos === null);
  t("a fonte está na tabela", SABER_COMUM.fontes.some((f) => f.id === "perto" && f.campo === "conhecidos"));
  const em = saberDoHeroi({ cidade: "Ribeira das Areias", jornada: { de: "Ribeira das Areias", para: "Bela do Rio" }, mapa });
  t("na estrada não há «perto» de cidade nenhuma", em.conhecidos === null);
}

sec("§7 EM4 — a falha por pouco em toda linha de saber, e a falha que não é «nada»");
{
  const porLinha = [];
  for (const alvo of MARGEM_DA_FALHA.saber) {
    const d = DESAFIOS.find((x) => x.alvo === alvo) || { id: alvo, alvo };
    const c = custoPorAlvo(alvo);
    const v = { tipo: "teste", id: d.id, alvoDoCusto: alvo, chave: `${d.id}|x`, fechaDepois: false };
    const margem = c && c.porPouco ? -3 : -1;
    const des = desfechoDaMargem(v, { total: 10 + margem, dc: 10, comMeiaVerdade: true });
    const env = des ? envelopeDoTeste({ tipo: "percepcao", pericia: d.pericia || null, valor: 8, mod: 2 + margem, total: 10 + margem, dc: 10, resultado: "falha", meio: des }) : "";
    porLinha.push({ alvo, ok: !!des && des.meiaVerdade === true && /MEIA-VERDADE/.test(env) });
  }
  const falham = porLinha.filter((x) => !x.ok).map((x) => x.alvo);
  t(`toda linha de saber dá meia-verdade na margem dela (${porLinha.length} linhas)${falham.length ? " — falham: " + falham.join(", ") : ""}`, falham.length === 0);
  const seg = ler("vou atrás do Anselmo de longe, colada às paredes, sem que ele perceba");
  const fio = desfechoDaMargem(seg, { total: 14, dc: 15 });
  t("seguir sem ser notado, falhando por 1 (T5), é o «por um fio»: segue, e paga com ser notado", !!fio && fio.porPouco === true && /olha para tr/.test(fio.diz), J(fio));
  const falha = envelopeDoTeste({ tipo: "percepcao", pericia: "percepcao", valor: 2, mod: 0, total: 2, dc: 15, resultado: "falha" });
  t("a falha seca não manda narrar o «silêncio» nem «só a ausência»", !/silêncio dele|só a ausência de resultado/.test(falha) && falha.includes(FALHA_SEM_NADA.consequencia));
}

console.log(`\n${bons} ok · ${maus} XX`);
process.exit(maus ? 1 : 0);
