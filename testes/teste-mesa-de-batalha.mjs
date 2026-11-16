/* ============================================================
   A MESA DE BATALHA DO F4 (V6, 16/11/2026) — `src/mesa-de-batalha.js` e a
   fiação dela (`mente/formas.md`, «## A Mesa do Mestre · F4»).

   1. o tapete antes da narração: «Lutar» abre a mesa no mesmo toque, e a
      fala da entrada não segura a vez (a fila do envio e o efeito);
   2. a conta das intenções fundidas por alvo («3× 2–10 → Saoirse»);
   3. o chão das dez plantas (os ladrilhos de MATERIAIS_DO_CHAO);
   4. o custo escrito na ação, e a barra que não mente;
   5. os nomes inteiros na fila.
   ============================================================ */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FILA_DO_ENVIO, esperarAVez, QUANTOS_POR_EXTENSO, especieDe, intencoesPorAlvo,
  MATERIAIS_DO_CHAO, LADO_DO_LADRILHO, CHAO_DA_PLANTA, VEU_DO_LADRILHO, ladrilhoDoChao, enderecoDoLadrilho, chaoDasRegioes,
  CUSTO_ESCRITO, CUSTO_DO_RECUO, custoEscrito,
} from "../src/mesa-de-batalha.js";
import { PLANTAS } from "../src/grid.js";
import { impedimentosDaFileira, RECUSAS_DO_VERBO } from "../src/tela-de-batalha.js";
import { FILA_DA_VEZ, ETIQUETA_DA_INTENCAO } from "../src/estilo.js";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ler = (a) => readFileSync(join(RAIZ, a), "utf8");
const APP = ler("src/App.jsx");
const GRADE = ler("src/grade-de-batalha.jsx");
const PAINEL = ler("src/painel-batalha.jsx");
const MODULO = ler("src/mesa-de-batalha.js");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; } else { mal++; console.log(`  ✗ ${nome}${extra ? " — " + extra : ""}`); } };
const sec = (n) => console.log(`\n${n}`);
/* o corpo de uma função do App, da âncora até o fim da primeira linha que fecha no recuo dela */
const corpo = (ancora) => { const i = APP.indexOf(ancora); if (i < 0) return ""; const f = APP.indexOf("\n  };\n", i); return APP.slice(i, f < 0 ? i + 4000 : f); };

sec("1. o tapete antes da narração");
{
  const s = corpo("const seguirOEncontro = (e, p0) => {");
  t("com luta, a porta chama a fala da entrada (narrarAEntrada), não a do encontro", s.includes("if (e.desfecho.luta) { pousarOEncontro(e); narrarAEntrada(e); return; }"));
  const n = corpo("const narrarAEntrada = (e) => {");
  t("a fala da entrada leva a pauta do encontro (o canal por turno, nunca bloco estático)", n.includes("porNaPautaDoTurno(pautaDoEncontro(e));"));
  t("e vai pela chamada própria do encontro (QUEM_RESPONDE.encontro)", n.includes('quemResponde("encontro").chamadas') && n.includes("enviar("));
  t("sem ficha do envio: a resposta lê a ficha de ENTÃO (a luta pode tê-la mexido)", /enviar\("\[NA ESTRADA[^"]*\]", null\)/.test(n));
  t("e sem desfeito: se a fala cair, a luta posta não volta atrás", n.includes("semDesfeitoRef.current = true;"));
  t("a fala da entrada marca-se no ar e desmarca-se no fim, caia ou não", n.includes("setFalaDaEntrada(true);") && n.includes(".finally(") && n.includes("setFalaDaEntrada(false)"));
  t("tudo em calou: uma fala que estoura nunca custa o turno", n.includes('calou("a fala da entrada"') && n.includes('calou("a narração da entrada"'));
  t("o efeito da entrada já não espera o Mestre calar — só outra fala no ar",
    APP.includes('if (fase !== "jogo" || (carregando && !falaDaEntrada) || combate || entradaNaMesa) return;')
    && !APP.includes('if (fase !== "jogo" || carregando || combate || entradaNaMesa) return;'));
  t("e reage à fala da entrada (está nas dependências)", APP.includes("}, [encontroPendente, carregando, falaDaEntrada, combate, entradaNaMesa, fase]);"));
  t("a vez não é segurada pela fala da entrada (a tela recebe bloqueado sem ela)", APP.includes("bloqueado={bloqueado && !(falaDaEntrada && !rolagem)}"));
  const iE = APP.indexOf("const enviar = useCallback(async (conteudo, persAtual, histBase) => {");
  const topo = APP.slice(iE, iE + 400);
  t("enviar espera a vez de quem está no ar, e só depois a toma", topo.includes("if (envioNoArRef.current) return depoisDaVez(conteudo, persAtual, histBase);") && topo.indexOf("tomarAVez()") > topo.indexOf("depoisDaVez(") && topo.indexOf("tomarAVez()") < topo.indexOf("setCarregando(true)"));
  const fimE = APP.indexOf("}, [historico, mensagens, aplicarResposta, salvar, nomeCampanha, mundo]);", iE);
  const fecho = APP.slice(fimE - 300, fimE + 120);
  t("e solta-a no finally, depois de baixar o carregando", fecho.includes("setCarregando(false);") && fecho.indexOf("soltarAVez()") > fecho.indexOf("setCarregando(false);"));
  t("quem espera chama o enviar mais novo (o ref), nunca um fecho velho", fecho.includes("enviarRef.current = enviar;") && corpo("const depoisDaVez = async").includes("enviarRef.current(conteudo, persAtual, histBase)"));
  t("a fala da entrada sem foto do envio: o desfeito não tem para onde voltar", APP.includes("if (semDesfeitoRef.current) { semDesfeitoRef.current = false; fotoEnvio = null; fotoInicio = null; }"));
  t("o teto da espera é tabela", FILA_DO_ENVIO.tetoDaEsperaMs > 0);
}

sec("1b. a fila do envio, jogada");
{
  t("sem ninguém no ar: livre", (await esperarAVez(null)) === "livre");
  let solta; const noAr = new Promise((r) => { solta = r; });
  const espera = esperarAVez(noAr, { teto: 1000 });
  solta();
  t("com alguém no ar: a vez chega quando ele solta", (await espera) === "vez");
  t("quem estava à frente e caiu não passa o erro a quem espera", (await esperarAVez(Promise.reject(new Error("caiu")), { teto: 1000 })) === "vez");
  t("e quem nunca solta não prende a fila para lá do teto", (await esperarAVez(new Promise(() => {}), { teto: 5 })) === "teto");
}

sec("2. as intenções fundidas por alvo");
{
  const rato = (n, alvo = "Saoirse", min = 2, max = 10) => ({ inimigo: n, vista: { tipo: "atacar", alvo, dano: { min, max }, abate: 0.1 } });
  const { porAlvo, outras } = intencoesPorAlvo([rato("Rato Gigante"), rato("Rato Gigante 2"), rato("Rato Gigante 3")]);
  t("três ratos no mesmo alvo: UMA entrada", porAlvo.length === 1 && outras.length === 0);
  const g = porAlvo[0];
  t("a etiqueta do campo: «3× 2–10»", g.etiqueta === "3× 2–10", g.etiqueta);
  t("a linha da nota: «3× Rato Gigante · 2–10 cada → Saoirse»", g.linha === "3× Rato Gigante · 2–10 cada → Saoirse", g.linha);
  t("e a soma, conta do que está na tela: «se os três acertarem, de 6 a 30»", g.soma === "se os três acertarem, de 6 a 30", g.soma);
  t("os atacantes ficam todos, na ordem", g.atacantes.join("|") === "Rato Gigante|Rato Gigante 2|Rato Gigante 3");
  const um = intencoesPorAlvo([rato("Lobo", "Saoirse", 3, 7)]).porAlvo[0];
  t("um só: sem «1×», sem «cada», sem soma", um.etiqueta === "3–7" && um.linha === "Lobo · 3–7 → Saoirse" && um.soma === "");
  const dois = intencoesPorAlvo([rato("Lobo", "Saoirse", 3, 7), rato("Rato Gigante", "Saoirse", 2, 10), rato("Rato Gigante 2", "Bram")]).porAlvo;
  t("dois alvos: duas entradas, na ordem do primeiro atacante", dois.length === 2 && dois[0].alvo === "Saoirse" && dois[1].alvo === "Bram");
  t("faixas diferentes: a de fora a fora, sem «cada», e as espécies juntas", dois[0].etiqueta === "2× 2–10" && dois[0].dano === "de 2 a 10" && dois[0].quem === "2× Lobo e Rato Gigante", dois[0].linha);
  const mistas = intencoesPorAlvo([rato("Rato Gigante"), { inimigo: "Dragão", vista: { tipo: "sopro", alvo: "Saoirse", dano: { min: 8, max: 24 }, area: [{ x: 1, y: 1 }] } }, { inimigo: "Goblin", vista: { tipo: "fugir" } }, { inimigo: "Arqueiro", vista: { tipo: "atacar", alvo: null, dano: { min: 1, max: 6 } } }]);
  t("sopro, fuga e o alvo escondido ficam de fora, um por inimigo", mistas.porAlvo.length === 1 && mistas.outras.map((i) => i.inimigo).join("|") === "Dragão|Goblin|Arqueiro");
  t("quem já agiu nesta rodada sai da conta", intencoesPorAlvo([rato("Rato Gigante"), rato("Rato Gigante 2")], { cumpridos: ["Rato Gigante"] }).porAlvo[0].quantos === 1);
  t("lixo não estoura", intencoesPorAlvo(null).porAlvo.length === 0 && intencoesPorAlvo([null, {}, { inimigo: "x" }]).porAlvo.length === 0);
  t("a espécie tira a numeração de quem conta", especieDe("Rato Gigante 12") === "Rato Gigante" && especieDe("Bandido B") === "Bandido" && especieDe("Lobo") === "Lobo");
  t("os números por extenso até dez", QUANTOS_POR_EXTENSO[3] === "três" && QUANTOS_POR_EXTENSO.length === 11);
  t("a grade funde por alvo (uma etiqueta junto do alvo) e o resto fica na pílula", GRADE.includes("intencoesPorAlvo(") && GRADE.includes("fusaoDasIntencoes.porAlvo.map(") && GRADE.includes("fusaoDasIntencoes.outras.map("));
  t("a etiqueta é tabela, na letra da página (não mono)", ETIQUETA_DA_INTENCAO.letra === 14 && ETIQUETA_DA_INTENCAO.raio === 3 && GRADE.includes('className="tv-body inline-flex items-center"'));
}

sec("3. o chão das dez plantas");
{
  const plantas = Object.keys(PLANTAS).filter((k) => PLANTAS[k] && Array.isArray(PLANTAS[k].regioes));
  t("as dez plantas de grid.js têm chão na tabela", plantas.length === 10 && plantas.every((k) => Array.isArray(CHAO_DA_PLANTA[k])), plantas.filter((k) => !CHAO_DA_PLANTA[k]).join(","));
  t("cada região de cada planta tem material", plantas.every((k) => CHAO_DA_PLANTA[k].length >= PLANTAS[k].regioes.length));
  const usados = new Set(Object.values(CHAO_DA_PLANTA).flat());
  t("todo material usado existe em MATERIAIS_DO_CHAO", [...usados].every((m) => MATERIAIS_DO_CHAO[m]), [...usados].filter((m) => !MATERIAIS_DO_CHAO[m]).join(","));
  t("os catorze materiais do F4", Object.keys(MATERIAIS_DO_CHAO).length === 14);
  t("cada material tem base e marcas", Object.values(MATERIAIS_DO_CHAO).every((m) => /^#[0-9A-F]{6}$/i.test(m.base) && Array.isArray(m.marcas) && m.marcas.length > 0));
  const relva = ladrilhoDoChao("relva");
  t("o ladrilho é um SVG de 96 × 96 com a base pintada", LADO_DO_LADRILHO === 96 && relva.startsWith("<svg") && relva.includes('width="96"') && relva.includes(MATERIAIS_DO_CHAO.relva.base));
  t("determinismo: o mesmo material dá o mesmo ladrilho", ladrilhoDoChao("cascalho") === ladrilhoDoChao("cascalho") && ladrilhoDoChao("relva") !== ladrilhoDoChao("terra"));
  t("nenhum Math.random no módulo (a semente é o nome)", !/Math\.random/.test(MODULO));
  t("material desconhecido: nada", ladrilhoDoChao("lava") === "" && enderecoDoLadrilho("lava") === "");
  t("o endereço é um data-URI de SVG", enderecoDoLadrilho("lajes").startsWith("data:image/svg+xml"));
  t("as regiões da estrada: relva, terra, cascalho", chaoDasRegioes("estrada", 3).join("|") === "relva|terra|cascalho");
  t("região a mais repete o último; planta desconhecida não pinta", chaoDasRegioes("navio", 4).length === 4 && chaoDasRegioes("lua", 3) === null);
  t("o véu do ladrilho é tabela e mais leve que o da pintura", VEU_DO_LADRILHO > 0 && VEU_DO_LADRILHO < 0.73);
  t("a grade pinta o chão por região quando a planta não tem pintura (o deserto mantém a dele)", GRADE.includes("const chaoPintado = chao ? null :") && GRADE.includes("chaoDasRegioes(g.cenario, g.regioes.length)") && GRADE.includes("fill={`url(#tv-mat-${chaoPintado[i]})`}"));
}

sec("4. o custo escrito, e a barra que não mente");
{
  t("ação, passo com os metros, e os dois recuos", custoEscrito("atacar", "acao") === "ação" && custoEscrito("mover", "movimento", { passoM: 9 }) === "passo · até 9 m" && custoEscrito("mover", "movimento", { passoM: 7.5 }) === "passo · até 7,5 m" && custoEscrito("esperar", null) === CUSTO_DO_RECUO.esperar && custoEscrito("fugir") === "sai da luta");
  t("sem recurso conhecido, nada escrito", custoEscrito("atacar", null) === "" && CUSTO_ESCRITO.bonus === "ação bônus");
  t("a carta de ação mostra o custo e não usa mono", PAINEL.includes("custoEscrito(v.id, (custos || recursos || {})[v.id] || null, { passoM })") && PAINEL.includes("custos={recursosDosVerbos} />") && PAINEL.includes('className="tv-anel-foco tv-display flex items-center justify-center"'));
  t("com o Mestre a narrar, o Atacar diz isso — não «a luta acabou»", impedimentosDaFileira({ bloqueado: true, algumAoAlcance: true, podeAndar: true }).atacar === RECUSAS_DO_VERBO.mestreFala && RECUSAS_DO_VERBO.mestreFala !== RECUSAS_DO_VERBO.fimDaLuta);
  t("e «a luta acabou» só quando acabou", impedimentosDaFileira({ fim: true }).atacar === RECUSAS_DO_VERBO.fimDaLuta);
}

sec("5. os nomes inteiros na fila");
{
  const fila = PAINEL.slice(PAINEL.indexOf("function FilaDaVez("), PAINEL.indexOf("function FilaDaVez(") + 4000);
  t("o nome na fila já não se corta (sem truncate, sem largura máxima)", !/tv-mono truncate/.test(fila) && !/maxWidth: F\.vez \+ 24/.test(fila));
  t("e vai na letra da mesa, pela tabela", FILA_DA_VEZ.nome && FILA_DA_VEZ.nome.letra === 13 && fila.includes("fontSize: F.nome.letra") && fila.includes('whiteSpace: "nowrap"'));
  t("cabe na altura da fila (56 + 4 + entrelinha + 2 × 6 ≤ 90)", FILA_DA_VEZ.vez + 4 + FILA_DA_VEZ.nome.entrelinha + FILA_DA_VEZ.entre * 2 <= 90);
}

console.log(`\na mesa de batalha do F4: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
