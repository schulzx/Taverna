/* ============================================================
   O FECHO DA RESPOSTA, NO MOTOR (T1-A, 7.ª fatia, 28/10/2026) — testes/teste-motor-fecho.mjs

   O perigo e a quase-morte do `aplicarResposta` saíram do App para
   `oPerigoDaResposta` e `aQuaseMorte` (src/motor/fecho-da-resposta.js).
   Aqui são provados byte a byte contra os de antes: `fecho-dourado.json` é
   o que o App de 3ec3364 fez — os dois blocos recortados à letra — sobre os
   275 casos de `fecho-bloco.mjs`; e esta suíte recorta do App de HOJE a
   fiação que ficou (as portas do fecho, as duas chamadas) e corre-a, com as
   peças puras, sobre os mesmos casos e os mesmos dublês.

   E a prova tem de morder: com a sorte de outro caso, sem o fôlego da
   fuga, com a ficha do envio igual à de agora, e com os efeitos aplicados
   só no fim (a ordem das linhas é o contrato), as fotos TÊM de divergir.
   ============================================================ */
import fs from "node:fs";
import { N_CASOS, sorteDoCaso } from "./combate-casos.mjs";
import { recorteDeHoje, blocoComoFuncao, correrOBloco, fotoDoFecho, casosDoFecho, TROCAS_DECLARADAS } from "./fecho-bloco.mjs";
import { oPerigoDaResposta, aQuaseMorte } from "../src/motor/fecho-da-resposta.js";
import { osVinculos } from "../src/motor/combate-do-turno.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const D = JSON.parse(fs.readFileSync(new URL("./fecho-dourado.json", import.meta.url), "utf8"));
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const casos = casosDoFecho(N_CASOS);
const recorte = recorteDeHoje(APP);
const hoje = { perigo: blocoComoFuncao(recorte.orgaos, recorte.perigo), quaseMorte: blocoComoFuncao(recorte.orgaos, recorte.quaseMorte) };
const fotosDeHoje = (bloco, op = {}) => casos.map((k, i) => fotoDoFecho(correrOBloco(op.fn || hoje[bloco], k, { novo: true, ...(op.porCaso ? op.porCaso(k, i) : {}) })));
const divergem = (bloco, novas) => novas.filter((f, i) => !igual(f, D.blocos[bloco][i])).length;

sec("1 · os dois blocos, byte a byte contra os de antes");
t(`o dourado é do commit de antes (3ec3364), ${N_CASOS} casos em cada bloco`, D.commit === "3ec3364" && ["perigo", "quaseMorte"].every((b) => (D.blocos[b] || []).length === N_CASOS));
/* o dourado é o App de antes COM as trocas declaradas em fecho-bloco.mjs (hoje uma: a emboscada vai à tela, §2b) */
/* (movido, T1-A 7.ª fatia, defeito: a segunda troca, o buraco no grupo, na quase-morte) */
t("com 2 trocas declaradas, uma no perigo e uma na quase-morte, e com o porquê escrito", TROCAS_DECLARADAS.perigo.length === 1 && TROCAS_DECLARADAS.quaseMorte.length === 1 && [...TROCAS_DECLARADAS.perigo, ...TROCAS_DECLARADAS.quaseMorte].every(([de, para]) => de && para && de !== para));
for (const bloco of ["perigo", "quaseMorte"]) {
  const fotos = D.blocos[bloco];
  const novas = fotosDeHoje(bloco);
  const batem = novas.filter((f, i) => igual(f, fotos[i])).length;
  const primeira = novas.findIndex((f, i) => !igual(f, fotos[i]));
  t(`${bloco}: ${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS, primeira >= 0 ? `o caso ${primeira} diverge: ${JSON.stringify(novas[primeira]).slice(0, 400)} | antes ${JSON.stringify(fotos[primeira]).slice(0, 400)}` : "");
  t(`${bloco}: determinista (duas corridas de hoje, as mesmas fotos)`, igual(fotosDeHoje(bloco).slice(0, 60), novas.slice(0, 60)));
}
{
  const P = D.blocos.perigo, Q = D.blocos.quaseMorte;
  const conta = (fs0, f) => fs0.filter(f).length;
  const emb = conta(P, (x) => (x.nota || "").includes("[A PORTA ABRIU]"));
  const salva = conta(P, (x) => (x.nota || "").includes("[SALVAGUARDA]"));
  const desp = conta(P, (x) => /\[INVESTIDA (RECUSADA|SEM FICHA)/.test(x.nota || ""));
  const fala = conta(P, (x) => x.tela.some((l) => l.some((m) => m.startsWith("⚔ Iniciativa:"))));
  const cic = conta(Q, (x) => (x.nota || "").includes("[CICATRIZ"));
  const marco = conta(Q, (x) => x.tela.some((l) => l.some((m) => /vínculo com/.test(m))));
  const erros = conta(Q, (x) => x.erro);
  console.log(`      perigo: a porta abre ${emb} · a salvaguarda ${salva} · o desproporcional e o sem criatura ${desp} · a iniciativa na tela ${fala}`);
  console.log(`      quase-morte: a cicatriz ${cic} · o marco de vínculo ${marco} · o grupo torto estoura ${erros}`);
  /* (movido, T1-A 7.ª fatia, defeito: o grupo com buraco já não estoura — o dourado da quase-morte leva a troca declarada, e os casos dele passam a ser os que correm até às conquistas) */
  t("percorre os ramos dos dois blocos", emb > 20 && salva > 30 && desp > 10 && fala > 20 && cic > 15 && marco > 10);
  t("e nenhum caso da quase-morte estoura (o buraco no grupo salta-se)", erros === 0, String(erros));
  t("o perigo nunca estoura para fora (calava, e cala)", P.every((x) => !x.erro));
}

sec("2 · a prova morde");
{
  const outra = (bloco) => divergem(bloco, fotosDeHoje(bloco, { porCaso: (k, i) => ({ sorte: sorteDoCaso(casos[(i + 1) % N_CASOS]) }) }));
  const q = outra("quaseMorte");
  t(`com a sorte de outro caso, ${q} fotos da quase-morte divergem`, q > 15);
  /* as peças de hoje com uma leitura trocada no recorte: o fôlego esquecido, a luta aberta esquecida */
  const trocado = (bloco, de, para) => blocoComoFuncao(recorte.orgaos, recorte[bloco].replace(de, para));
  const semFolego = divergem("perigo", fotosDeHoje("perigo", { fn: trocado("perigo", "folego: folegoRef.current", "folego: null") }));
  t(`sem o fôlego da fuga, ${semFolego} fotos do perigo divergem`, semFolego > 5);
  const semLuta = divergem("perigo", fotosDeHoje("perigo", { fn: trocado("perigo", "combate: combateRef.current", "combate: null") }));
  t(`sem a luta já aberta, ${semLuta} fotos do perigo divergem`, semLuta > 20);
  const envio = divergem("quaseMorte", fotosDeHoje("quaseMorte", { porCaso: () => ({ envioIgual: true }) }));
  t(`com a ficha do envio igual à de agora, ${envio} fotos da quase-morte divergem`, envio > 60);
  /* A ORDEM DAS LINHAS É O CONTRATO: os efeitos aplicados só no fim põem
     a cicatriz depois das linhas do marco e das conquistas */
  const noFim = (p) => { const fila = []; return { ...p, aplicar: (efs) => fila.push(...efs), fila }; };
  const comNoFim = (bloco) => {
    const corpo = recorte[bloco].replace("portasDoFecho())", "(__p = noFim(portasDoFecho())))");
    const fn = blocoComoFuncao(recorte.orgaos, ["let __p = null;", corpo, "if (__p) __p.fila.splice(0).forEach(aplicarEfeitoDoFecho);"].join("\n"));
    return divergem(bloco, fotosDeHoje(bloco, { fn, porCaso: () => ({ extras: { noFim } }) }));
  };
  const qTarde = comNoFim("quaseMorte");
  t(`com os efeitos só no fim, ${qTarde} fotos da quase-morte divergem`, qTarde > 5);
  /* (no perigo, os efeitos nascem todos depois da última porta: lá a ordem não tem como morder) */
}

sec("2b · a emboscada chega à tela (defeito achado na 7.ª fatia)");
{
  /* Desde a v9.74 a fala da emboscada ("três bandidos saltam…") e as linhas
     da porta de abrir (a iniciativa) eram empurradas para a lista do turno
     DEPOIS de a entrega já a ter posto na tela: a lista morria com o
     aplicarResposta, e o jogador via o painel da luta abrir sem uma palavra
     do sistema. As linhas que o perigo escreve têm de chegar à tela. */
  const abriram = casos.filter((k, i) => (D.blocos.perigo[i].nota || "").includes("[A PORTA ABRIU]"));
  const viram = abriram.filter((k) => {
    const f = correrOBloco(hoje.perigo, k, { novo: true });
    const tela = f.log.tela.flat().map((m) => m.texto);
    return tela.some((l) => l.startsWith("⚔ Iniciativa:")) && tela.length >= 2;
  });
  console.log(`      a porta abriu em ${abriram.length}; a iniciativa e a fala chegaram à tela em ${viram.length}`);
  t("em cada emboscada aberta, a fala e a iniciativa estão na tela", abriram.length > 20 && viram.length === abriram.length);
  t("e a lista do turno, que já foi entregue, não as guarda", abriram.every((k) => igual(correrOBloco(hoje.perigo, k, { novo: true }).msgs, k.msgsAntes)));
}

sec("3 · as peças, jogadas");
{
  const efs = [];
  const r = oPerigoDaResposta({ pers: { nome: "Vera", nivel: 10 }, perigo: "Três bandidos saltam do mato.", combate: null, folego: null, lugares: ["a praça"] }, {
    aplicar: (x) => efs.push(...x), abrirCombate: (ins, o) => ({ pers: { ...o.pers, abriu: ins.length }, msgs: ["⚔ ini"], nota: "[INI]" }), dispararPerigo: () => { throw new Error("não devia"); },
  });
  t("a investida abre a luta pela porta, com as linhas do turno, a nota e a textura", r.pers.abriu >= 1 && r.msgs.length === 2 && r.msgs[1] === "⚔ ini" && efs.some((e) => e.tipo === "nota" && e.linhas[0].startsWith("[INI]\n")) && efs.some((e) => e.tipo === "textura" && e.textura.luta === true) && !r.erro);
  const r2 = oPerigoDaResposta({ pers: { nome: "Vera", nivel: 10 }, perigo: "Três bandidos saltam do mato.", combate: null, folego: null, lugares: [] }, {
    aplicar: () => {}, abrirCombate: () => { throw new Error("estourou"); }, dispararPerigo: () => {},
  });
  t("o erro da porta volta em `erro`, sem subir", r2.erro && r2.erro.message === "estourou" && r2.msgs.length === 0);
  const r3 = oPerigoDaResposta({ pers: { nivel: 3 }, perigo: "Três bandidos saltam do mato.", combate: { inimigos: [] } }, { aplicar: () => {}, dispararPerigo: (x) => efs.push({ disparou: x }) });
  t("com a luta aberta, a investida vai à salvaguarda", efs.some((e) => e.disparou === "Três bandidos saltam do mato.") && r3.msgs.length === 0);
}
{
  const ordem = [];
  const ctx = {
    aplicar: (x) => ordem.push(...x.map((e) => "efeito:" + e.tipo)), sorteDoTurno: () => () => 0.1,
    bumpCont: (c, n) => ordem.push(`cont:${c}:${n}`), aplicarVinculo: (g, quem, p) => { ordem.push(`vinculo:${quem}:${p}`); return g; },
    checarConquistas: () => ordem.push("conquistas"),
  };
  const antes = { vida: 5, grupo: [{ nome: "Brás", vida: 4 }] };
  const agora = { vida: 0, vidaMax: 20, grupo: [{ nome: "Brás", vida: 0 }, { nome: "Ilka", vida: 3 }] };
  const congelado = JSON.stringify(agora);
  const r = aQuaseMorte({ persDoEnvio: antes, pers: agora, dia: 7 }, ctx);
  t("a quase-morte na ordem de sempre: quem chegou, a queda, o vínculo, a cicatriz, quem caiu, a ficha, as conquistas", igual(ordem, ["cont:recrutados:1", "cont:quaseMorte:1", "vinculo:todos:4", "efeito:tela", "efeito:nota", "vinculo:Brás:-6", "efeito:ficha", "conquistas"]), JSON.stringify(ordem));
  t("a cicatriz entra na ficha com o dia, sem tocar na de entrada", r.pers.cicatrizes.length === 1 && r.pers.cicatrizes[0].dia === 7 && JSON.stringify(agora) === congelado);
  /* (movido, T1-A 7.ª fatia, defeito: "o grupo torto volta em `erro`" provava que o buraco no grupo não subia; o aviso da trilha B mostrou que ele nem devia estourar — um buraco no grupo, no envio ou agora, não é um companheiro, e o laço de quem caiu salta-o. O erro de um estouro de verdade continua a voltar em `erro`: a régua do perigo, acima.) */
  const ordem2 = [];
  const ctx2 = { ...ctx, aplicarVinculo: (g, quem, p) => { ordem2.push(`vinculo:${quem}:${p}`); return g; }, checarConquistas: () => ordem2.push("conquistas") };
  const buraco = aQuaseMorte({ persDoEnvio: { vida: 1, grupo: [null, { nome: "Brás", vida: 4 }] }, pers: { vida: 1, grupo: [{ nome: "Brás", vida: 0 }, null] }, dia: 1 }, ctx2);
  t("um buraco no grupo não estoura: quem caiu ainda pesa, e as conquistas correm", !buraco.erro && ordem2.includes("vinculo:Brás:-6") && ordem2[ordem2.length - 1] === "conquistas", JSON.stringify([buraco.erro && buraco.erro.message, ordem2]));
  /* e a porta de verdade: o vínculo de UM companheiro num grupo com buraco (o App chama osVinculos pela porta aplicarVinculo) */
  t("o vínculo de um só, num grupo com buraco, deixa o buraco e não estoura", (() => { try { const r = osVinculos([null, { nome: "Brás", vinculo: 10, marcos: [] }], "Brás", -6); return r.grupo[0] === null && r.grupo[1].vinculo === 4; } catch { return false; } })());
}

sec("4 · a fiação no App");
const C = APP.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
t("o aplicarResposta chama as duas peças, a quase-morte em calou", /const doPerigo = oPerigoDaResposta\(\{ pers, perigo: resp\.perigo, combate: combateRef\.current, folego: folegoRef\.current, lugares: ondeEstou\(\) \}, portasDoFecho\(\)\);/.test(C)
  && /const daQuaseMorte = aQuaseMorte\(\{ persDoEnvio, pers, dia: diaRef\.current \}, portasDoFecho\(\)\);[\s\S]{0,200}\} catch \(e\) \{ calou\("a quase-morte do turno", e\); \}/.test(C));
t("e os blocos não moram mais lá", !/montarEmboscada\(resp\.perigo/.test(C) && !APP.includes("[CICATRIZ — CANON PERMANENTE]") && !/sorteDoTurno\("cicatriz"\)/.test(C));

console.log(`\nmotor · o fecho da resposta: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
