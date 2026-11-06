/* teste-ar-pecas.mjs (AR, 06/11/2026) — as peças da Fase AR e o Diário como
   portal de missões (formas.md §AR 2, §AR 5, §AR 6).

   Prova quatro coisas:
   1. as tabelas de §AR 6 estão em estilo.js com a forma que a secção dá;
   2. as cores das peças só nomeiam T (nenhum hex solto nas peças nem no
      Diário), e os pares de letra passam o piso medido em §AR 5;
   3. cada glifo novo desenha-se com path;
   4. o Diário, renderizado de verdade: o próximo passo à vista, as etapas
      feitas e por fazer, as desconhecidas sem texto (contam-se e não se
      dizem), a reviravolta nunca à vista, o prazo diz o que RESTA, e a
      estante tem todas as encerradas.

   O JSX não corre em Node: a suíte empacota um ponto de entrada com o
   esbuild (o mesmo que o vite usa) e lê o HTML de renderToStaticMarkup. */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import {
  T, TIPOS, ALVOS, FICHA_CARTA, ICONES_DA_ETAPA, ICONES_DO_TALENTO, ICONES_DA_INTERFACE,
  CABECALHO_DA_TELA, ABA_DA_TELA, DIARIO_DE_MISSOES, ETAPA_DA_MISSAO, RELOGIO_DO_PRAZO, MOLDURA_POR_DEGRAU,
} from "../src/estilo.js";
import { ETAPAS, TIPOS as TIPOS_DE_MISSAO, PRAZOS, criarMissao, rumoDaEtapa, textoDaEtapa } from "../src/missoes.js";
import { razao, rgb } from "./conta-da-luz.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");

/* ============================================================ */
sec("1. as tabelas de §AR 6");
{
  const familias = { ICONES_DA_ETAPA, ICONES_DO_TALENTO, ICONES_DA_INTERFACE };
  const RX_D = /^M[0-9MmLlHhVvCcSsQqTtAaZz .,-]+$/;
  for (const [nome, fam] of Object.entries(familias)) {
    const ruins = Object.entries(fam).filter(([, cs]) => !Array.isArray(cs) || !cs.length || !cs.every((d) => typeof d === "string" && RX_D.test(d)));
    t(`${nome}: cada glifo é uma lista de caminhos de quadro 24`, ruins.length === 0, ruins.map(([k]) => k).join(", "));
  }
  t("os dez glifos de etapa (268:6 … 268:48)", Object.keys(ICONES_DA_ETAPA).length === 10);
  t("os seis de talento e os oito de interface", Object.keys(ICONES_DO_TALENTO).length === 6 && Object.keys(ICONES_DA_INTERFACE).length === 8);
  t("toda etapa do jogo tem o seu glifo", Object.keys(ETAPAS).every((k) => ICONES_DA_ETAPA[k]), Object.keys(ETAPAS).filter((k) => !ICONES_DA_ETAPA[k]).join(", "));
  t("o ataque é o mesmo desenho do derrotar", ICONES_DO_TALENTO.ataque === ICONES_DA_ETAPA.derrotar);
  t("todo tipo de missão tem o glifo do medalhão, e a oferta o seu",
    Object.keys(TIPOS_DE_MISSAO).every((k) => DIARIO_DE_MISSOES.glifoDoTipo[k]) && DIARIO_DE_MISSOES.glifoDoTipo.oferta === "?");
  t("o título da missão tem a medida do nome na ficha-carta", DIARIO_DE_MISSOES.titulo.mesa === FICHA_CARTA.nome.mesa && DIARIO_DE_MISSOES.titulo.telefone === TIPOS.titulo);
  t("as colunas: 380 · 1fr · 420 na mesa, 340 · 1fr a 1280", DIARIO_DE_MISSOES.mesa.colunas.join(" ") === "380px 1fr 420px" && DIARIO_DE_MISSOES.meia.colunas.join(" ") === "340px 1fr");
  t("os cortes do leiaute cabem as colunas", DIARIO_DE_MISSOES.corte.mesa > 380 + 420 + 2 * DIARIO_DE_MISSOES.mesa.folga && DIARIO_DE_MISSOES.corte.meia > 340 + DIARIO_DE_MISSOES.meia.folga && DIARIO_DE_MISSOES.corte.mesa > DIARIO_DE_MISSOES.corte.meia);
  t("a aba tem o piso de toque de alto", ABA_DA_TELA.alto === ALVOS.piso);
  t("o cabeçalho: 72 na mesa, 56 no telefone, título a TIPOS.titulo", CABECALHO_DA_TELA.mesa.alto === 72 && CABECALHO_DA_TELA.telefone.alto === 56 && CABECALHO_DA_TELA.titulo.tamanho === TIPOS.titulo);
  t("as quatro formas da etapa", ["feita", "atual", "silhueta", "falhada"].every((k) => ETAPA_DA_MISSAO[k]) && ETAPA_DA_MISSAO.silhueta.tracejado && ETAPA_DA_MISSAO.atual.glifo === "tipo");
  t("o relógio: 40 e 32, miolo 0,58, aperta com 2", RELOGIO_DO_PRAZO.lado === 40 && RELOGIO_DO_PRAZO.mini === 32 && RELOGIO_DO_PRAZO.miolo === 0.58 && RELOGIO_DO_PRAZO.apertaCom === 2);
  t("o relógio aperta antes do prazo mais curto acabar", RELOGIO_DO_PRAZO.apertaCom < Math.min(...PRAZOS));
}

/* ============================================================ */
sec("2. as cores só nomeiam T, e a letra passa o piso");
{
  const deT = new Set(Object.values(T));
  const cores = [];
  for (const [k, e] of Object.entries(ETAPA_DA_MISSAO)) for (const c of ["chao", "aro", "texto", "nota", "fio", "corDoGlifo"]) if (e[c]) cores.push([`etapa.${k}.${c}`, e[c]]);
  cores.push(["relogio.cheio.calma", RELOGIO_DO_PRAZO.cheio.calma], ["relogio.cheio.aperta", RELOGIO_DO_PRAZO.cheio.aperta], ["relogio.vazio.chao", RELOGIO_DO_PRAZO.vazio.chao], ["relogio.vazio.aro", RELOGIO_DO_PRAZO.vazio.aro]);
  const soltas = cores.filter(([, c]) => !deT.has(c));
  t("toda cor das tabelas da etapa e do relógio é uma cor de T", soltas.length === 0, soltas.map(([n, c]) => `${n}=${c}`).join(", "));
  const RX_HEX = /#[0-9a-fA-F]{3,8}\b|rgba?\(/;
  for (const a of ["painel-ar-pecas.jsx", "painel-diario.jsx"]) {
    const txt = fs.readFileSync(path.join(SRC, a), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const m = txt.match(RX_HEX);
    t(`${a}: nenhuma cor solta (só T e as tabelas)`, !m, m ? `achou ${m[0]}` : "");
  }

  /* os pares de §AR 5 que as peças do Diário usam */
  const ouroClaro = MOLDURA_POR_DEGRAU.ouro.claro;
  const LETRA = [
    ["título da tela ouroClaro / couroBaixo", ouroClaro, T.couroBaixo, 4.5],
    ["subtítulo inkDim / couroBaixo", T.inkDim, T.couroBaixo, 4.5],
    ["título da missão ink / panel", T.ink, T.panel, 4.5],
    ["descrição inkMeio / panel", T.inkMeio, T.panel, 4.5],
    ["nota da etapa inkDim / panel", T.inkDim, T.panel, 4.5],
    ["etapa atual amberSoft / panel", T.amberSoft, T.panel, 4.5],
    ["etapa falhada danger / panel", T.danger, T.panel, 4.5],
    ["passo da oferta violetSoft / panel", T.violetSoft, T.panel, 4.5],
    ["o onde mundoSoft / panel", T.mundoSoft, T.panel, 4.5],
    ["o próximo passo ink / couro", T.ink, T.couro, 4.5],
    ["o onde mundoSoft / couro", T.mundoSoft, T.couro, 4.5],
    ["o rótulo amberSoft / couro", T.amberSoft, T.couro, 4.5],
    ["evento global ink / perigoFundo", T.ink, T.perigoFundo, 4.5],
    ["evento global inkMeio / perigoFundo", T.inkMeio, T.perigoFundo, 4.5],
    ["evento global danger / perigoFundo", T.danger, T.perigoFundo, 4.5],
    ["o bilhete tintaDoPergaminho / pergaminho", T.tintaDoPergaminho, T.pergaminho, 7],
    ["a assinatura tintaDoPergaminhoDim / pergaminho", T.tintaDoPergaminhoDim, T.pergaminho, 4.5],
    ["o custo perigoNoPergaminho / pergaminho", T.perigoNoPergaminho, T.pergaminho, 4.5],
    ["índice escolhido ink / panelSoft", T.ink, T.panelSoft, 4.5],
    ["verbo armado onAccent / amber", T.onAccent, T.amber, 4.5],
    ["número do relógio ink / panel", T.ink, T.panel, 4.5],
  ];
  for (const [n, fg, bg, piso] of LETRA) { const r = razao(rgb(fg), rgb(bg)); t(`${n}: ${r.toFixed(2)} ≥ ${piso}`, r >= piso); }
  const FORMA = [
    ["insígnia ✓ ok / okFundo", T.ok, T.okFundo],
    ["gomo amber / panel", T.amber, T.panel],
    ["gomo danger / panel", T.danger, T.panel],
    ["aro da silhueta lineStrong / panel", T.lineStrong, T.panel],
    ["aro da falhada danger / perigoFundo", T.danger, T.perigoFundo],
  ];
  for (const [n, fg, bg] of FORMA) { const r = razao(rgb(fg), rgb(bg)); t(`(forma) ${n}: ${r.toFixed(2)} ≥ 3`, r >= 3); }
}

/* ============================================================
   3 e 4 · O QUE SE VÊ — empacota-se um ponto de entrada e renderiza-se. */
const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GlifoAR, RelogioDoPrazo, EtapaDaMissao, LombadaDaEstante, MissaoNoIndice, AbaDaTela, CabecalhoDaTela } from "./painel-ar-pecas.jsx";
import { PainelDiario } from "./painel-diario.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, GlifoAR, RelogioDoPrazo, EtapaDaMissao, LombadaDaEstante, MissaoNoIndice, AbaDaTela, CabecalhoDaTela, PainelDiario };
`;
/* a saída mora ao lado da suíte (e apaga-se logo): o react fica de fora do
   pacote e resolve-se pelo node_modules da casa, uma cópia só */
const saida = path.join(AQUI, `.tmp-ar-pecas-${process.pid}.mjs`);
buildSync({
  stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-ar.jsx" },
  bundle: true, format: "esm", platform: "node", outfile: saida, jsx: "transform", logLevel: "silent", external: ["react", "react-dom", "react-dom/server"],
  loader: { ".js": "jsx" }, define: { "process.env.NODE_ENV": '"production"' },
});
const R = await import(pathToFileURL(saida).href);
fs.rmSync(saida, { force: true });
const h = R.React.createElement;
const html = (c, p) => R.html(h(c, p));
const texto = (s) => s.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ");

sec("3. cada glifo desenha-se com path");
{
  const fams = { etapa: ICONES_DA_ETAPA, talento: ICONES_DO_TALENTO, interface: ICONES_DA_INTERFACE };
  const ruins = [];
  for (const [familia, tab] of Object.entries(fams)) {
    for (const [nome, cs] of Object.entries(tab)) {
      const s = html(R.GlifoAR, { familia, nome });
      if ((s.match(/<path /g) || []).length !== cs.length) ruins.push(`${familia}/${nome}`);
    }
  }
  t("os 24 glifos saem com um path por caminho", ruins.length === 0, ruins.join(", "));
  t("glifo sem rótulo é aria-hidden; com rótulo diz-se", /aria-hidden="true"/.test(html(R.GlifoAR, { nome: "pino" })) && /role="img" aria-label="lugar"/.test(html(R.GlifoAR, { nome: "pino", rotulo: "lugar" })));
  t("glifo que não existe não desenha nada", html(R.GlifoAR, { nome: "nao_existe" }) === "");
  const rel = html(R.RelogioDoPrazo, { segmentos: 6, cheios: 2 });
  t("o relógio: um gomo por noite, e o número é o que resta", (rel.match(/<path /g) || []).length === 6 && />4<\/text>/.test(rel) && /faltam 4 noites de 6/.test(rel));
  t("com 2 por restar, aperta (os gomos e o número em danger)", html(R.RelogioDoPrazo, { segmentos: 6, cheios: 4 }).includes(`fill="${T.danger}"`) && !rel.includes(`fill="${T.danger}"`));
  t("a lombada falhada tem o ✗ e diz-se falhada", /aria-label="falhada"/.test(html(R.LombadaDaEstante, { estado: "falhada", titulo: "x" })));
  t("a silhueta não leva o texto de ninguém", !texto(html(R.EtapaDaMissao, { estado: "silhueta", texto: "Ainda não se sabe" })).includes("undefined"));
  t("a aba diz se está escolhida", /aria-selected="true"/.test(html(R.AbaDaTela, { rotulo: "Em curso", ativa: true })));
  t("o cabeçalho com fechar tem o botão Fechar", /aria-label="Fechar"/.test(html(R.CabecalhoDaTela, { titulo: "Diário", aoFechar: () => {} })));
}

sec("4. o Diário: o portal de missões");
{
  const principal = criarMissao({
    id: "m_principal", titulo: "A voz debaixo do moinho", tipo: "principal", status: "ativa", dia: 1,
    descricao: "O moinho parou numa noite sem vento.",
    etapas: [
      { tipo: "ir_a", alvo: "Moinho Velho", feito: true },
      { tipo: "falar_com", alvo: "Petra", onde: "Corda Velha, em Vila Clara" },
      { tipo: "achar", alvo: "SEGREDO_DO_POCO" },
      { tipo: "derrotar", alvo: "SEGREDO_DA_FERA" },
    ],
  });
  const secundaria = criarMissao({
    id: "sq_a_divida_t1", titulo: "A dívida de Bram", tipo: "favor", status: "ativa", dia: 2,
    descricao: "Ilsa Corvo quer que alguém de fora fale com Bram antes que acabe em sangue. Se as noites passarem, Bram some de Vila Clara.",
    dador: "Ilsa Corvo", prazo: 6, veiculo: "secundaria_planeada", intencao: "secundaria",
    virada: { tipo: "revelacao", apos: 0, texto: "REVIRAVOLTA_ESCONDIDA", onde: "REVIRAVOLTA_LUGAR", quem: "REVIRAVOLTA_QUEM" },
    etapas: [{ tipo: "falar_com", alvo: "Ilsa Corvo", feito: true }, { tipo: "falar_com", alvo: "Bram", onde: "O Cais, em Vila Clara" }],
  });
  const encerradas = Array.from({ length: 11 }, (_, i) => criarMissao({
    id: `m_fim_${i}`, titulo: `Encerrada número ${i}`, tipo: "contrato", status: i % 4 === 3 ? "falhada" : "concluida",
    etapas: [{ tipo: "ir_a", alvo: "Alto do Sal", feito: true }],
  }));
  const missoes = [principal, secundaria, ...encerradas];
  t("as missões de prova nasceram", principal && secundaria && encerradas.every(Boolean));
  const relogios = [{ id: "r1", fonte: "missao:sq_a_divida_t1", segmentos: 6, cheios: 2 }];
  const base = { historia: { estrutura: "jornada" }, quests: [], trocarArco: () => {}, eventos: { global: null, locais: [] }, diaAtual: 5, missoes, relogios };

  const mesa = html(R.PainelDiario, { ...base, leiaute: "mesa" });
  const tm = texto(mesa);
  t("o próximo passo à vista, com o rumo da etapa atual", tm.includes("O próximo passo") && tm.includes(rumoDaEtapa(principal.etapas[1])));
  t("o lugar do passo, com o pino", tm.includes("Corda Velha, em Vila Clara"));
  t("a etapa feita, com o ✓ e o que foi", tm.includes(textoDaEtapa(principal.etapas[0])) && tm.includes("cumprida"));
  t("sem o dia em que se cumpriu, a nota cala o dia", !/cumprida no dia/.test(tm));
  t("as duas por fazer contam-se: duas silhuetas", (tm.match(/Ainda não se sabe/g) || []).length === 2);
  t("e não se diz o quê", !tm.includes("SEGREDO_DO_POCO") && !tm.includes("SEGREDO_DA_FERA"));
  t("o índice diz o próximo passo em cada linha", tm.includes(`→ ${rumoDaEtapa(principal.etapas[1])}`) && tm.includes(`→ ${rumoDaEtapa(secundaria.etapas[1])}`));
  t("a estante tem TODAS as encerradas (não as últimas oito)", encerradas.every((m) => tm.includes(m.titulo)));
  t("e as falhadas dizem-se falhadas", (mesa.match(/aria-label="falhada"/g) || []).length === encerradas.filter((m) => m.status === "falhada").length);
  t("sem «Ver no mapa» enquanto o jogo não o dá", !tm.includes("Ver no mapa"));

  /* a secundária escolhida (leiaute meia): o bilhete, o relógio do que resta */
  const sec1 = R.html(h(function Escolher() {
    return h(R.PainelDiario, { ...base, leiaute: "meia", missoes: [secundaria, ...encerradas] });
  }));
  const ts = texto(sec1);
  t("o gancho em bilhete, na voz de quem pediu", ts.includes("«Ilsa Corvo quer que alguém de fora fale com Bram antes que acabe em sangue.»") && ts.includes("— Ilsa Corvo"));
  t("o custo de falhar por baixo do bilhete", ts.includes("Se as noites passarem, Bram some de Vila Clara."));
  t("o prazo diz o que resta, e não só o total", ts.includes("faltam 4 noites") && ts.includes("de 6"));
  t("o fecho entra no que se ganha", ts.includes("e Ilsa Corvo fica a dever-te um favor"));
  t("a reviravolta NUNCA aparece", !/REVIRAVOLTA/.test(sec1));
  t("o nome do mecanismo nunca aparece", !/planead|molde|port[ãa]o|secundaria_/i.test(ts));

  /* o telefone: as três abas, a principal à frente, as duas etapas que importam */
  const tel = html(R.PainelDiario, { ...base, leiaute: "telefone" });
  const tt = texto(tel);
  t("o telefone tem as três abas", /role="tablist"/.test(tel) && tt.includes("Em curso · 2") && tt.includes("Ofertas · 0") && tt.includes(`Estante · ${encerradas.length}`));
  t("a principal à frente, com o próximo passo", tt.includes("O próximo passo") && tt.includes(rumoDaEtapa(principal.etapas[1])));
  t("as etapas que importam: a última feita e a primeira por saber, com «e mais N»", tt.includes("e mais 1 por saber") && (tt.match(/Ainda não se sabe/g) || []).length === 1);
  t("a secundária fica no índice, com o relógio mini", tt.includes(secundaria.titulo) && /faltam 4 noites de 6/.test(tel));

  /* o que o jogo ainda não dá e o painel já sabe ler */
  const comMapa = texto(html(R.PainelDiario, { ...base, leiaute: "mesa", aoVerNoMapa: () => {}, distanciaDoPasso: () => ({ tipo: "zonas", rotulo: "a 1 zona", nome: "Corda Velha", zonas: 1, noId: "n1" }),
    missoes: [{ ...principal, etapas: principal.etapas.map((e, i) => (i === 0 ? { ...e, feitoEm: 3 } : e)) }] }));
  t("com a distância e o mapa: «Ver no mapa» com o sítio e a zona", comMapa.includes("Ver no mapa") && comMapa.includes("a 1 zona daqui"));
  t("com feitoEm: «cumprida no dia N»", comMapa.includes("cumprida no dia 3"));
  t("e o preço do verbo: o sítio e a distância", comMapa.includes("Corda Velha · 1 zona"));
  const semNo = texto(html(R.PainelDiario, { ...base, leiaute: "mesa", aoVerNoMapa: () => {}, distanciaDoPasso: () => ({ tipo: "outra", rotulo: "noutra cidade", nome: "Corda Velha", zonas: null, noId: null }), missoes: [principal] }));
  t("sem o sítio no mapa, «Ver no mapa» cala, e a distância diz-se", !semNo.includes("Ver no mapa") && semNo.includes("noutra cidade"));
}

console.log(`\nar-pecas: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
