/* OS NOMES DE UM MUNDO NOVO (nexo, 11/10)

   Lidos como roteiro, os chefes de 12 campanhas novas de Uma Vida tinham 14
   epítetos repetidos no mesmo mundo; na 4.ª sessão havia dois chefes "A Boca
   do Mundo", e um Dragão Ancião num mundo cujo Léxico dizia que os dragões
   NÃO EXISTEM (contradição 6 de mente/mm11-sessao-4.md). Com um Léxico que
   proíbe dragões e quimeras, as 12 campanhas davam 18 chefes proibidos.

   A regra nova (`NOMES_DO_MUNDO`, mundo-base.js) vale só para o mundo que
   nasce com ela — `gerarRegiao` grava `regiao.nomes` —, porque a espinha de
   um save de antes já guarda os nomes dos chefes de hoje, e mudá-los
   deixaria o confronto final a apontar para um chefe que deixou de existir.

   O que esta suíte prova, em 200 mundos novos:
     1. o campo nasce no mundo novo, e só nele;
     2. nenhum epíteto e nenhum primeiro nome se repetem entre os chefes;
     3. nenhum chefe é de uma espécie que o Léxico diz que não existe;
     4. o mundo de antes (sem o campo) e o continente veem os chefes de
        sempre — e a ordem do sorteio de sempre não muda.

   FALHA em HEAD (v9.374): NOMES_DO_MUNDO e especieProibida não existem. */

import * as MB from "../src/mundo-base.js";
import * as R from "../src/regiao.js";
import * as G from "../src/geografia.js";
import * as LX from "../src/lexico.js";
import { createHash } from "node:crypto";
import { ESTRUTURAS } from "../src/historia.js";
import { sementeDe, generoDe } from "./medir-regiao.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const J = (v) => JSON.stringify(v);
const N = 200;
const V = MB.NOMES_DO_MUNDO || { versao: NaN };
const proibida = MB.especieProibida || (() => false);
const LEX = LX.garantirLexico({ naoExiste: ["dragões", "quimeras", "a pólvora"] });
const tituloDe = (c) => norm(c.nome.includes(", ") ? c.nome.split(", ").slice(1).join(", ") : c.nome.slice(c.especie.length));
const mundo = (i) => R.gerarRegiao({ semente: sementeDe(i), molde: "sobremundo", genero: generoDe(i), estrutura: ESTRUTURAS[i % ESTRUTURAS.length].id });
const semCampo = (m) => { const { nomes, ...r } = m.regiao; return { ...m, regiao: r }; };

sec("1. o campo nasce no mundo novo");
{
  t("NOMES_DO_MUNDO existe, com versão, tentativas e raiz", Number.isFinite(V.versao) && V.versao >= 1 && V.tentativas >= 1 && V.raiz >= 3);
  const m = mundo(0);
  t("gerarRegiao grava regiao.nomes", !!m && m.regiao.nomes === V.versao);
  const mc = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente: "x", molde: "sobremundo", genero: "Fantasia medieval", estrutura: "jornada", modo: "historia" }));
  t("e a campanha nova de Uma Vida leva-o", !!mc.regiao && mc.regiao.nomes === V.versao);
  t("o continente não o tem", !("regiao" in G.gerarGeografia("x", "sobremundo")));
}

sec("2. nenhum epíteto nem primeiro nome repetido");
{
  let titRep = 0, nomeRep = 0, mundos = 0, antes = 0;
  for (let i = 0; i < N; i++) {
    const m = mundo(i);
    if (!m) continue;
    mundos++;
    const cs = MB.chefesDoMundo(sementeDe(i), m, generoDe(i), null);
    const tits = cs.map(tituloDe);
    if (new Set(tits).size !== tits.length) titRep++;
    const nomes = cs.filter((c) => c.nome.includes(", ")).map((c) => norm(c.nomeCurto));
    if (new Set(nomes).size !== nomes.length) nomeRep++;
    const velhos = MB.chefesDoMundo(sementeDe(i), semCampo(m), generoDe(i), null).map(tituloDe);
    if (new Set(velhos).size !== velhos.length) antes++;
  }
  t(`a régua tem com que medir: sem a regra, ${antes} de ${mundos} mundos repetiam um epíteto`, antes > 0);
  t(`com ela, nenhum (${titRep}/${mundos})`, mundos === N && titRep === 0);
  t(`nem um primeiro nome de chefe (${nomeRep}/${mundos})`, nomeRep === 0);
}

sec("3. nenhum chefe que o Léxico diz que não existe");
{
  t("Dragão Ancião e Dragão Jovem são proibidos por \"dragões\"", proibida("Dragão Ancião", LEX) && proibida("Dragão Jovem", LEX));
  t("Quimera é proibida por \"quimeras\"", proibida("Quimera", LEX));
  t("Lich, Troll e Gigante não são", !proibida("Lich", LEX) && !proibida("Troll", LEX) && !proibida("Gigante", LEX));
  t("sem Léxico, ou com lixo, nada é proibido", !proibida("Dragão Ancião", null) && !proibida("Dragão Ancião", {}) && !proibida("", LEX));
  let proibidos = 0, antes = 0;
  for (let i = 0; i < N; i++) {
    const m = mundo(i);
    if (!m) continue;
    proibidos += MB.chefesDoMundo(sementeDe(i), m, generoDe(i), LEX).filter((c) => proibida(c.especie, LEX)).length;
    antes += MB.chefesDoMundo(sementeDe(i), semCampo(m), generoDe(i), LEX).filter((c) => proibida(c.especie, LEX)).length;
  }
  t(`sem a regra, ${antes} chefes proibidos em ${N} mundos`, antes > 0);
  t(`com ela, ${proibidos}`, proibidos === 0);
}

sec("4. o mundo de antes vê os chefes de sempre");
{
  /* o save de antes: a região SEM o campo. Hash gravado em HEAD v9.374 (git
     archive), 60 mundos, com e sem Léxico, de tudo o que um chefe é — menos
     o covil e a região do PRINCIPAL, que o fio da espinha muda de propósito
     em toda região (o covil passa a ser o lugar do clímax; teste-fio-da-espinha) */
  const HEAD_SEM_CAMPO = "a8b9915c8bc26c5f";
  const h = createHash("sha256");
  let ordem = 0, n = 0;
  for (let i = 0; i < 60; i++) {
    const m = mundo(i);
    if (!m) continue;
    n++;
    const velho = semCampo(m);
    for (const lex of [null, LEX]) h.update(J(MB.chefesDoMundo(sementeDe(i), velho, generoDe(i), lex).map(({ covil, regiao, ...c }) => (c.linha === "principal" ? c : { ...c, covil, regiao }))));
    /* a ordem do sorteio de sempre: quantos chefes, e a linha, o motivo e o
       jeito de cada um, saem do mesmo gerador nos dois mundos */
    const novo = MB.chefesDoMundo(sementeDe(i), m, generoDe(i), null), antigo = MB.chefesDoMundo(sementeDe(i), velho, generoDe(i), null);
    if (novo.length === antigo.length && novo.every((c, k) => c.personalidade === antigo[k].personalidade && c.motivo === antigo[k].motivo && c.linha === antigo[k].linha)) ordem++;
  }
  const agora = h.digest("hex").slice(0, 16);
  t(`a região sem o campo dá os chefes de HEAD, byte a byte (${agora})`, agora === HEAD_SEM_CAMPO);
  t(`e o sorteio de sempre não muda de ordem no mundo novo — quantos, a linha, o motivo e o jeito de cada um (${ordem}/${n})`, n > 0 && ordem === n);
  /* o continente: o mesmo laço, gravado em HEAD v9.374 — nem o covil muda */
  const hc = createHash("sha256");
  for (let i = 0; i < 60; i++) { const m = G.gerarGeografia(sementeDe(i), "sobremundo"); for (const lex of [null, LEX]) hc.update(J(MB.chefesDoMundo(sementeDe(i), m, generoDe(i), lex))); }
  const cont = hc.digest("hex").slice(0, 16);
  t(`no continente, os chefes de HEAD, byte a byte (${cont})`, cont === "7bb90543c4013f98");
}

console.log(`\nnomes do mundo: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
