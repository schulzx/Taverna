/* ============================================================
   O LANCE DO DADO (V3 · 16/11/2026) — testes/teste-lance-do-dado.mjs

   A máquina de estados do lance (lance-do-dado.js), o determinismo do
   teatro (mesmo resultado e mesmo lance ⇒ mesmas faces e mesmo giro), os
   tempos do F2 (LANCE: voo 1 300, face aos 1 440, veredito ≤ 2 140), a soma
   que conta, o veredito como posição, o chamado das outras origens
   (chamadoDaRolagem), o som do lance, a peça renderizada e a fiação no App.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildSync } from "esbuild";
import { LANCE, CERIMONIA_DO_DADO, TAMANHO_DO_DADO } from "../src/estilo.js";
import { ESTADOS_DO_LANCE, proximoEstado, vereditoDoLance, facesDoRolar, giroDoRolar, tempoDoLance, passosDaSoma, quadrosDoVoo, fraseDoVeredito, PALAVRAS_DO_LANCE } from "../src/lance-do-dado.js";
import { chamadoDaRolagem } from "../src/motor/o-mestre-chama.js";
import { tocarDoLance, SOM_DA_MESA } from "../src/som-da-mesa.js";
import { lancamentoDoTeste } from "../src/motor/a-bandeja.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (n) => console.log("\n" + n);
const J = JSON.stringify;

sec("1. a máquina de estados (formas.md §F2 §3)");
{
  t("nove estados, na ordem do lance", J(ESTADOS_DO_LANCE) === J(["repouso", "chamado", "saindo", "rolando", "pousado", "somando", "veredito", "esperando", "voltando"]));
  let e = "repouso";
  const caminho = [["chamar", "chamado"], ["rolar", "saindo"], ["avancar", "rolando"], ["avancar", "pousado"], ["avancar", "somando"], ["avancar", "veredito"], ["avancar", "esperando"], ["narrou", "voltando"], ["fim", "repouso"]];
  const feito = caminho.every(([ev, para]) => (e = proximoEstado(e, ev)) === para);
  t("o caminho inteiro: repouso → chamado → … → esperando → voltando → repouso", feito, e);
  t("«Mudar de ideia» volta do chamado ao repouso, sem dado", proximoEstado("chamado", "mudar") === "repouso");
  t("pular corta saindo…somando direto ao veredito", ["saindo", "rolando", "pousado", "somando"].every((x) => proximoEstado(x, "pular") === "veredito"));
  t("pular não mexe no chamado nem na espera", proximoEstado("chamado", "pular") === "chamado" && proximoEstado("esperando", "pular") === "esperando");
  t("com reduced-motion, do chamado direto ao veredito", proximoEstado("chamado", "rolar", { reduzido: true }) === "veredito");
  t("o toque na espera devolve o dado à bandeja", proximoEstado("esperando", "tocar") === "voltando");
  t("evento que não cabe não muda nada (nunca lança)", proximoEstado("rolando", "mudar") === "rolando" && proximoEstado("lixo", "chamar") === "chamado");
}

sec("2. o veredito é o do sistema, e é posição");
{
  const ok14 = lancamentoDoTeste({ valor: 13, mod: 1, dc: 13, rotulo: "Percepção" });
  const v = vereditoDoLance(ok14);
  t("13 + 1 = 14 contra 13: passou, por 1, acima da linha", v.total === 14 && v.alvo === 13 && v.veredito === "passou" && v.margem === 1 && v.acima === true, J(v));
  const f = vereditoDoLance(lancamentoDoTeste({ valor: 6, mod: 2, dc: 15 }));
  t("6 + 2 = 8 contra 15: falhou, faltaram 7, abaixo", f.veredito === "falhou" && f.margem === 7 && f.acima === false);
  const vinte = vereditoDoLance(lancamentoDoTeste({ valor: 20, mod: 0, dc: 25 }));
  t("o 20 natural é «vinte» (a cerimónia), pelo desfecho do motor", vinte.veredito === "vinte" && vinte.natural === 20 && vinte.acima);
  const um = vereditoDoLance(lancamentoDoTeste({ valor: 1, mod: 9, dc: 5 }));
  t("o 1 natural é «um»", um.veredito === "um" && um.natural === 1 && !um.acima);
  t("o leitor de ecrã ouve uma frase: «Percepção: 14 contra 13, passou»", fraseDoVeredito(ok14, "Percepção") === "Percepção: 14 contra 13, passou", fraseDoVeredito(ok14, "Percepção"));
  t("as palavras: PASSOU / FALHOU / precisa de / faltaram", PALAVRAS_DO_LANCE.passou === "PASSOU" && PALAVRAS_DO_LANCE.falhou === "FALHOU" && PALAVRAS_DO_LANCE.faltaram(3) === "faltaram 3" && PALAVRAS_DO_LANCE.faltaram(1) === "faltou 1");
}

sec("3. o determinismo do teatro (zero Math.random)");
{
  const a = facesDoRolar({ valor: 14, faces: 20, n: 7 }), b = facesDoRolar({ valor: 14, faces: 20, n: 7 });
  t("mesmo resultado e mesmo lance ⇒ a MESMA sequência de faces", J(a) === J(b));
  t("lance diferente ⇒ sequência diferente", J(a) !== J(facesDoRolar({ valor: 14, faces: 20, n: 8 })));
  t("a última face é o resultado, no fim do rolar", a[a.length - 1].face === 14 && a[a.length - 1].em === LANCE.rolar.dura);
  t("a penúltima nunca é já o resultado, e nenhuma face repete a anterior", a[a.length - 2].face !== 14 && a.every((q, i) => i === 0 || q.face !== a[i - 1].face));
  t("todas as faces cabem no dado", a.every((q) => q.face >= 1 && q.face <= 20) && facesDoRolar({ valor: 3, faces: 6, n: 1 }).every((q) => q.face >= 1 && q.face <= 6));
  const gaps = a.slice(1, 5).map((q, i) => q.em - a[i].em);
  t("a troca abranda: 60 → 90 → 140 → 220 ms", J(gaps) === J(LANCE.rolar.trocas), J(gaps));
  t("o giro sai do resultado (igual duas vezes) e fica em 540 ± 90", giroDoRolar({ valor: 14, n: 7 }) === giroDoRolar({ valor: 14, n: 7 }) && Math.abs(Math.abs(giroDoRolar({ valor: 14, n: 7 })) - 540) <= 90);
  const src = fs.readFileSync(path.join(SRC, "lance-do-dado.js"), "utf8") + fs.readFileSync(path.join(SRC, "painel-lance.jsx"), "utf8");
  t("o módulo e a peça não chamam Math.random nem Date.now", !/Math\.random|Date\.now/.test(src.replace(/\/\*[\s\S]*?\*\//g, "")));
}

sec("4. os tempos do F2 (LANCE)");
{
  const T0 = tempoDoLance({ mod: 1 });
  t("voo (sair + rolar) = 1 300 ms", T0.pousado === 1300 && LANCE.sair.dura + LANCE.rolar.dura === 1300);
  t("a face lê-se aos 1 440 ms", T0.face === 1440);
  t("o rolar dobrou: 1 040 ms (era 520)", LANCE.rolar.dura === 1040);
  const pior = tempoDoLance({ mod: 9 });
  t("o veredito acaba, no pior caso, aos 2 140 ms", pior.fim === 2140, String(pior.fim));
  t("com a narração já chegada, a soma colapsa para 200", tempoDoLance({ mod: 5, narrou: true }).veredito - tempoDoLance({ mod: 5, narrou: true }).somando === LANCE.soma.colapsada);
  t("o terceiro quique nunca passa o voo de 1 600", tempoDoLance({ teto: true }).pousado <= LANCE.vooTeto);
  t("reduced-motion: tudo em 120 ms", tempoDoLance({ reduzido: true }).fim === 120 && LANCE.semMovimento === 120);
  t("o dado do lance a 160, no telefone a 128", LANCE.lado.mesa === TAMANHO_DO_DADO.lance && LANCE.lado.telefone === 128);
  t("um clarão só por 20 (WCAG 2.3.1: menos de três por segundo)", CERIMONIA_DO_DADO.vinte.onda.raios.length === 2 && CERIMONIA_DO_DADO.vinte.onda.dura >= 334);
}

sec("5. a soma em letra que conta, e o voo");
{
  t("«13 → 14» com +1", J(passosDaSoma(13, 1)) === J([13, 14]));
  t("sem bónus, só a face", J(passosDaSoma(9, 0)) === J([9]));
  t("bónus negativo desce", J(passosDaSoma(9, -2)) === J([9, 8, 7]));
  t("um bónus grande conta até ao teto e acaba no total", (() => { const p = passosDaSoma(10, 12); return p[p.length - 1] === 22 && p.length - 1 <= Math.floor((LANCE.soma.teto - LANCE.soma.bonus) / LANCE.soma.passo); })());
  const q = quadrosDoVoo({ dx: 400, dy: -300, giro: 540 });
  t("o voo começa na bandeja (dx, dy) a 76/160 e acaba no centro, parado", /translate\(400px, -300px\)/.test(q[0].transform) && /scale\(0\.475, 0\.475\)/.test(q[0].transform) && q[q.length - 1].transform === "translate(0px, 0px) rotate(0deg) scale(1, 1)");
  t("dois quiques (28 e 10 px) com o achatar do contato", q.some((x) => /translate\(0px, -28px\)/.test(x.transform)) && q.some((x) => /translate\(0px, -10px\)/.test(x.transform)) && q.some((x) => /scale\(1, 0\.94\)/.test(x.transform)));
  t("só transform anima (nada de top/left)", q.every((x) => Object.keys(x).every((k) => k === "offset" || k === "transform")));
}

sec("6. uma forma só: o chamado das outras origens");
{
  const social = chamadoDaRolagem({ rotulo: "Persuasão", motivo: "Convencer a guarda a abrir o portão", dificuldade: 14 }, { risco: "a guarda chama o capitão" });
  t("o teste social vira chamado: a perícia, o número, o preço em palavras", social && social.periciaNome === "Persuasão" && social.dc === 14 && social.aviso === "Se falhar, a guarda chama o capitão.");
  t("o porquê vai em palavras, nunca «(+2)»", /para convencer a guarda/.test(social.linha) && !/\(\+\d\)/.test(social.linha), social.linha);
  const enigma = chamadoDaRolagem({ rotulo: "agulha", atributo: "Intelecto", motivo: "abrir a tranca", dificuldade: 17, origem: "enigma" });
  t("o enigma também, com a origem dita", enigma && enigma.origem === "enigma" && enigma.dc === 17 && enigma.periciaNome === "agulha");
  t("sem CD, ou o trivial, não há chamado (o Véu segue)", chamadoDaRolagem({ rotulo: "x" }) === null && chamadoDaRolagem({ rotulo: "x", dificuldade: 10, auto: true }) === null && chamadoDaRolagem(null) === null);
}

sec("7. o som do lance (sintetizado, sem arquivo)");
{
  t("osso tem três variações; o 1 tem o estalo e o grave que desce", SOM_DA_MESA.lance.osso.length === 3 && SOM_DA_MESA.lance.um.some((v) => v.ate && v.ate < v.freq && v.freq < 200));
  t("em Node não há contexto: cala, e nunca lança", tocarDoLance("osso", 4) === false && tocarDoLance("vinte") === false && tocarDoLance("um") === false && tocarDoLance("lixo") === false);
}

sec("8. a peça renderizada e a fiação");
const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LanceDoDado } from "./painel-lance.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, LanceDoDado };
`;
const saida = path.join(AQUI, `.tmp-lance-${process.pid}.mjs`);
buildSync({
  stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-lance.jsx" },
  bundle: true, format: "esm", platform: "node", outfile: saida, jsx: "automatic", logLevel: "silent", external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime"],
  loader: { ".js": "jsx" }, define: { "process.env.NODE_ENV": '"production"' },
});
const R = await import(pathToFileURL(saida).href);
fs.rmSync(saida, { force: true });
{
  const erro = console.error; console.error = () => {};
  const l = lancamentoDoTeste({ valor: 13, mod: 1, dc: 13, rotulo: "Percepção" });
  const s = R.html(R.React.createElement(R.LanceDoDado, { lance: { ...l, n: 3 }, rotulo: "Percepção" }));
  const tel = R.html(R.React.createElement(R.LanceDoDado, { lance: { ...l, n: 3 }, rotulo: "Percepção", telefone: true }));
  console.error = erro;
  t("o lance nasce a sair, com o d20 de osso a 160, aro vivo", /data-lance="saindo"/.test(s) && /data-dado="20"/.test(s) && /width="160"/.test(s) && /data-estado="vivo"/.test(s));
  t("no telefone, a 128", /width="128"/.test(tel));
  const APP = fs.readFileSync(path.join(SRC, "App.jsx"), "utf8");
  t("o App monta o LanceDoDado do lance no ar uma vez, em LimiteErro", (APP.match(/<LanceDoDado key=\{lanceNoAr\.chave\}/g) || []).length === 1 && /<LimiteErro>\s*<LanceDoDado key=\{lanceNoAr\.chave\}/.test(APP));
  t("a narração é pedida no toque: o efeito do lance chama pousouOChamado", /setLanceNoAr\(\{ chave: "chamado:"[\s\S]{0,200}pousouOChamado\(\);/.test(APP));
  t("o Véu já não é modal: nem o hexágono por clip-path, nem «Continuar →»", !/function OverlayDado[\s\S]*?clipPath: "polygon\(50% 0%/.test(APP.slice(APP.indexOf("function OverlayDado"), APP.indexOf("/* ---------------- Modal de nível"))) && !/Continuar →/.test(APP.slice(APP.indexOf("function OverlayDado"), APP.indexOf("/* ---------------- Modal de nível"))));
  t("a busca da masmorra rola pelo mesmo lance", /setLanceNoAr\(\{ chave: "busca:"/.test(APP));
  t("o teste pendente (social, enigma) passa pelo mesmo chamado na soleira", /chamado: chamadoDaRolagemAgora/.test(APP) && /linhaDoCampo = rolagem && !carregando && !chamadoVivo && !chamadoDaRolagemAgora && !dadoRolando/.test(APP));
  /* V4b (16/11): eram duas colunas (a zona direita e a tira do telefone); a gaveta da
     bandeja do telefone é a terceira, e a tira ficou só de rede. As três escondem o lance que voa. */
  t("a Bandeja esconde o lance que voa (a zona direita, a gaveta do telefone e a tira de rede)", (APP.match(/<Bandeja naColuna emVoo=\{!!lanceNoAr\}/g) || []).length === 3);
  t("o lance do chamado não rola duas vezes (a soleira só mostra o chamado sem lance)", /if \(ch && !ch\.lance\) \{\s*const mc = momentoDoChamado/.test(APP));
}

console.log(`\no lance do dado: ${ok} ok · ${mal} falhas`);
process.exit(mal ? 1 : 0);
