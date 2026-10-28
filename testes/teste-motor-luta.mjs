/* ============================================================
   A LUTA DO TURNO, NO MOTOR (T1-A, 6.ª fatia, 28/10/2026) — testes/teste-motor-luta.mjs

   O bloco do combate do `aplicarResposta` saiu do App para
   `aLutaDaResposta` (src/motor/luta-do-turno.js). Aqui ele é provado
   INTEIRO, byte a byte, contra o de antes: `combate-dourado.json`
   (`blocoDoCombate`) é o que o App de 7338870 fez — o bloco e os quinze
   órgãos que ele chama, recortados à letra — sobre os 275 casos de
   `combate-bloco.mjs`; e esta suíte recorta do App de HOJE a fiação que
   ficou (as portas da luta, a chamada ao motor, os invólucros) e corre-a,
   com as peças puras, sobre os mesmos casos e os mesmos dublês.

   E a prova tem de morder: com a sorte de outro caso, e com um `ler` que
   devolve sempre o retrato do começo (a ordem das leituras é o contrato),
   as fotos TÊM de divergir.
   ============================================================ */
import fs from "node:fs";
import { N_CASOS } from "./combate-casos.mjs";
import { recorteDeHoje, blocoComoFuncao, correrOBloco, fotoDoBloco, casosDoBloco, TROCAS_DECLARADAS } from "./combate-bloco.mjs";
import { sorteDoCaso } from "./combate-casos.mjs";
import { aLutaDaResposta, retratoComOsFinais } from "../src/motor/luta-do-turno.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const D = JSON.parse(fs.readFileSync(new URL("./combate-dourado.json", import.meta.url), "utf8"));
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const fotos = D.orgaos.blocoDoCombate;
const casos = casosDoBloco(N_CASOS);
const recorte = recorteDeHoje(APP);
const hoje = blocoComoFuncao(recorte);

sec("1 · o bloco inteiro, byte a byte contra o de antes");
t(`o dourado do bloco é do commit de antes (7338870), ${N_CASOS} casos`, D.commit === "7338870" && Array.isArray(fotos) && fotos.length === N_CASOS);
/* o dourado é o App de antes COM as trocas declaradas em combate-bloco.mjs (hoje uma: o painel que se dissolve, §2b) */
t(`com ${TROCAS_DECLARADAS.length} troca declarada, e cada uma com o porquê escrito`, TROCAS_DECLARADAS.length === 1 && TROCAS_DECLARADAS.every(([de, para]) => de && para && de !== para));
const novas = casos.map((k) => fotoDoBloco(correrOBloco(hoje, k, { novo: true })));
const batem = novas.filter((f, i) => igual(f, fotos[i])).length;
const primeira = novas.findIndex((f, i) => !igual(f, fotos[i]));
t(`${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS, primeira >= 0 ? `o caso ${primeira} diverge: ${JSON.stringify(novas[primeira]).slice(0, 300)} | antes ${JSON.stringify(fotos[primeira]).slice(0, 300)}` : "");
{
  const conta = (f) => fotos.filter(f).length;
  const vitoria = conta((x) => (x.nota || "").includes("[VITÓRIA")), abriu = conta((x) => (x.nota || "").includes("INICIATIVA ROLADA"));
  const dissolve = conta((x) => x.msgs.some((m) => m.includes("se dissolve"))), presenca = conta((x) => x.msgs.some((m) => m.includes("outra grandeza")));
  const chefe = conta((x) => (x.nota || "").includes("MASMORRA FOI CONCLUÍDA")), queda = conta((x) => (x.nota || "").includes("[A QUEDA]")), escapa = conta((x) => (x.nota || "").includes("[ELE ESCAPA]"));
  const rito = conta((x) => (x.nota || "").includes("RITO DE ASCENSÃO")), chao = conta((x) => x.msgs.some((m) => m.includes("No chão"))), nivel = conta((x) => x.msgs.some((m) => m.includes("NÍVEL")));
  console.log(`      vitória ${vitoria} · a luta abre ${abriu} · o painel se dissolve ${dissolve} · o grau divino ${presenca} · o chefe ${chefe} · a nêmesis cai ${queda} e escapa ${escapa} · o rito ${rito} · o chão ${chao} · o nível ${nivel}`);
  t("percorre os ramos do bloco", vitoria > 50 && abriu > 30 && dissolve > 5 && presenca > 5 && chefe > 5 && queda > 3 && escapa > 2 && rito > 0 && chao > 30 && nivel > 5);
  t("e nenhum caso estoura (nem antes, nem hoje)", fotos.every((f) => !f.erro) && novas.every((f) => !f.erro));
}
t("o dourado do bloco é determinista (duas corridas de hoje, as mesmas fotos)", (() => {
  const de = casos.slice(0, 40).map((k) => fotoDoBloco(correrOBloco(hoje, k, { novo: true })));
  return de.every((f, i) => igual(f, novas[i]));
})());

sec("2 · a prova morde");
{
  const outra = casos.filter((k, i) => !igual(fotoDoBloco(correrOBloco(hoje, k, { novo: true, sorte: sorteDoCaso(casos[(i + 1) % N_CASOS]) })), fotos[i])).length;
  t(`com a sorte de outro caso, ${outra} fotos divergem`, outra > 60);
  /* A ORDEM DAS LEITURAS É O CONTRATO: um \`ler\` que devolve sempre o
     retrato do começo vê o combate de antes do processarCombate, o ócio de
     antes da porta de abrir, a masmorra de antes, quem caiu de antes */
  const velho = blocoComoFuncao({ ...recorte, bloco: recorte.bloco.replace("portasDaLuta())", "lerVelho(portasDaLuta()))") });
  const lerVelho = (p) => { const r0 = p.ler(); return { ...p, ler: () => r0 }; };
  const stale = casos.filter((k, i) => !igual(fotoDoBloco(correrOBloco(velho, k, { novo: true, extras: { lerVelho } })), fotos[i])).length;
  t(`com as leituras presas ao começo, ${stale} fotos divergem`, stale > 60);
}

sec("2b · o painel que se dissolve leva as conjurações da ficha DO TURNO (defeito achado na 6.ª fatia)");
{
  /* O painel que fecha sozinho (dois turnos sem golpe) desfazia a forma, a
     guarda, a pressa e as invocações da ficha do REF — que dentro do
     aplicarResposta é a de antes do turno — e o turno seguia com a sua, que
     o save grava: a tela dizia "a forma se desfaz" e a ficha ficava urso.
     A ficha que volta do turno não pode guardar nada do que a luta leva. */
  const dissolvem = casos.filter((k, i) => fotos[i].msgs.some((m) => m.includes("se dissolve")));
  const comForma = dissolvem.filter((k) => k.persB.forma);
  const fichas = comForma.map((k) => correrOBloco(hoje, k, { novo: true }).ret.pers);
  console.log(`      o painel dissolve em ${dissolvem.length}, com a forma na ficha do turno em ${comForma.length}`);
  t("a ficha do turno que sai do painel dissolvido já não tem a forma", comForma.length > 0 && fichas.every((p) => p && !p.forma), JSON.stringify(fichas.map((p) => p && p.forma && p.forma.nome)));
  const comInvocada = dissolvem.filter((k) => (k.persB.grupo || []).some((g) => g.invocada));
  t("nem as invocações", comInvocada.every((k) => !(correrOBloco(hoje, k, { novo: true }).ret.pers.grupo || []).some((g) => g && g.invocada)));
}

sec("3 · as peças do bloco");
t("o retrato com os finais leva a vida e a queda da lista final, pelo nome", (() => {
  const antes = { inimigos: [{ nome: "Lobo", vida: 9 }, { nome: "Goblin", vida: 5 }], rodada: 3 };
  const r = retratoComOsFinais(antes, [{ nome: "lobo", vida: 0 }, null]);
  return r.inimigos[0].vida === 0 && r.inimigos[0].derrotado === true && r.inimigos[1] === antes.inimigos[1] && antes.inimigos[0].vida === 9
    && retratoComOsFinais(antes, []) === antes && retratoComOsFinais(null, [{ nome: "x" }]) === null;
})());
t("a resposta volta como cópia: a do Narrador não é escrita", (() => {
  const mud = { combate_iniciar: [{ nome: "Lobo", ameaca: "comum" }] };
  const antes = JSON.stringify(mud);
  const st = { combate: null, descobertas: [], ocioso: 0, ataqueResolvido: false, derrotadosDaSessao: [], masmorra: null, salaEmCurso: null, mapa: { cidades: [] }, semente: "s|Fantasia medieval", genero: "Fantasia medieval", molde: null, lexico: null, divindade: null };
  const r = aLutaDaResposta({ pers: { nome: "Vera", nivel: 2 }, mudancas: mud }, {
    ler: () => st, aplicar: (efs) => { for (const e of efs) if (e.tipo === "combate") st.combate = e.combate; else if (e.tipo === "descobertas") st.descobertas = e.descobertas; else if (e.tipo === "ocioso") st.ocioso = e.ocioso; },
    abrirCombate: () => ({ pers: { nome: "Vera", nivel: 2 }, msgs: [], nota: "" }), sorteDoTurno: () => () => 0.5,
  });
  return JSON.stringify(mud) === antes && r.mudancas !== mud && r.mudancas.__nivelJogador === 2 && r.msgs.some((m) => /Lobo entra no combate/.test(m)) && st.descobertas.includes("Lobo");
})());

sec("4 · a fiação no App");
const C = APP.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
t("o aplicarResposta chama o motor, em calou", /if \(resp\.mudancas\) \{\s*try \{\s*const daLuta = aLutaDaResposta\(\{ pers, mudancas: resp\.mudancas \}, portasDaLuta\(\)\);\s*pers = daLuta\.pers;\s*resp = \{ \.\.\.resp, mudancas: daLuta\.mudancas \};\s*msgs\.push\(\.\.\.daLuta\.msgs\);\s*\} catch \(e\) \{ calou\("a luta do turno", e\); \}/.test(C));
t("e o bloco não mora mais lá (nem o processarCombate da resposta, nem a nota da vitória)", !/processarCombate\(combateRef\.current, resp\.mudancas/.test(C) && !APP.includes("[VITÓRIA — espólios já aplicados pelo sistema") && !/function retratoComOsFinais/.test(C));
t("as portas da luta são os invólucros de sempre (uma porta por órgão)", /sorteDoTurno, abrirCombate, limparConjuracoesDaLuta, notarFechoDaLuta, registrarMorteDeAlvo, bumpCont, avancarOsMinutos,\s*checarFama, tentarSurgirNemesis, aplicarVinculo, porNoChaoAqui, talvezDespertarUnica, concluirMasmorraDoChefe,\s*resolverSalaAposCombate, abrirRitoAscensao,/.test(C));
{
  const i0 = APP.indexOf("  const aplicarResposta = useCallback(");
  const i1 = APP.indexOf("\n  }, [pushMsgs]);", i0);
  const linhas = APP.slice(i0, i1).split("\n").length;
  console.log(`      o aplicarResposta tem hoje ${linhas} linhas`);
  /* a 5.ª fatia deixou-o com 491; o bloco do combate eram 224 */
  t("o aplicarResposta desceu de verdade (menos de 300 linhas)", linhas < 300, String(linhas));
}

console.log(`\nmotor · a luta do turno: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
