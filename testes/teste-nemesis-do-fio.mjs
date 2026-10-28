/* A NÊMESIS É QUEM ESTÁ NO FIM (11/10) — um antagonista por campanha

   A auditoria de coerência (v9.376–v9.379) leu 12 campanhas novas como
   roteiro e achou, em todas, DOIS antagonistas: o do fio da espinha (o chefe
   principal do mundo, que espera no confronto final) e a nêmesis que a fama
   fazia nascer com um nome novo (`tentarSurgirNemesis`, App). O Narrador
   recebia os dois no mesmo prompt e nada os ligava.

   O que esta suíte prova:
     1. a nêmesis nasce do fio: o nome pelo qual a espinha casa o chefe, o
        título do fio sem o dizer duas vezes, o motivo do fio — e o plano, o
        corpo e as fases continuam a ser os do vilão;
     2. o save antigo (espinha sem fio), o confronto já cumprido e o
        antagonista já morto ficam com o de hoje;
     3. o rosto espera o último ato: a revelação do nome não chega antes de
        a espinha o dizer;
     4. a queda em combate do chefe do fio é queda, em qualquer fase — e
        fecha, pelo mesmo nome, o confronto da espinha;
     5. o nome não sobe ao prompt antes do rosto (o arco e a mente da
        ameaça), e a fiação no App é defensiva.

   FALHA em HEAD (v9.379): `vilaoDoFio`, `oRostoEspera` e `caiuOFio` não
   existem, e o App sorteia um nome novo. */

import { readFileSync } from "node:fs";
import * as SG from "../src/saga.js";
import { surgirANemesis } from "../src/motor/combate-do-turno.js";
import * as V from "../src/vilao.js";
import * as R from "../src/regiao.js";
import * as G from "../src/geografia.js";
import * as MI from "../src/missoes.js";
import { ESTRUTURAS } from "../src/historia.js";
import { moldePorId } from "../src/moldes.js";
import { sementeDe, generoDe } from "./medir-regiao.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d) => { try { return f(); } catch { return d; } };
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const J = (v) => JSON.stringify(v);

const vilaoDoFio = SG.vilaoDoFio || (() => null);
const oRostoEspera = SG.oRostoEspera || (() => null);
const caiuOFio = SG.caiuOFio || (() => null);

const N = 24;
function campanha(i, { regiao = true } = {}) {
  const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id, molde = moldePorId("sobremundo");
  const mapa = regiao ? R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde, genero, estrutura, modo: "historia" })) : G.gerarGeografia(semente, molde);
  let esp = SG.estenderEspinha({ semente, mapa, genero, molde, estrutura, cidadeInicial: mapa.cidades[0].nome });
  if (mapa.regiao) esp = R.espinhaNaRegiao(mapa, esp, { semente, genero, molde });
  return { esp };
}
/* um sorteio fixo, para o vilão nascer igual em toda máquina */
const sorteDe = (k) => { let x = (k * 9301 + 49297) % 233280; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; };
const nascer = (k) => V.gerarVilao({ nome: "Nome Sorteado", dia: 3, sorte: sorteDe(k) });
const confrontoDe = (esp) => esp.atos.flatMap((a) => a.marcos).filter((m) => m.feitio === "confronto").pop();

sec("1. a nêmesis nasce do fio");
{
  let comFio = 0, doFio = 0, casaConfronto = 0, semDobra = 0, plano = 0, motivo = 0, humanoides = 0, bichos = 0;
  const falhas = [];
  for (let i = 0; i < N; i++) {
    for (const regiao of [true, false]) {
      const { esp } = campanha(i, { regiao });
      if (!esp.fio || !esp.fio.antagonista) continue;
      comFio++;
      const v0 = nascer(i);
      const v = tenta(() => vilaoDoFio(v0, esp), null);
      if (!v || !v.daEspinha || v.nome === "Nome Sorteado") { falhas.push(`${i}: ${v && v.nome}`); continue; }
      doFio++;
      if (esp.fio.antagonista.includes(", ")) humanoides++; else bichos++;
      /* o nome pelo qual a espinha casa: o alvo do confronto está no nome (ou o nome no alvo) */
      const cf = confrontoDe(esp);
      if (cf && (norm(v.nome).includes(norm(cf.alvo)) || norm(cf.alvo).includes(norm(v.nome)))) casaConfronto++;
      else falhas.push(`${i}: "${v.nome}" × confronto "${cf && cf.alvo}"`);
      const dito = `${v.nome}, ${v.titulo}`;
      if (!v.titulo || norm(dito).split(norm(v.titulo)).length - 1 === 1) semDobra++;
      else falhas.push(`${i}: dobra — ${dito}`);
      if (v.arquetipo === v0.arquetipo && v.fase === "rumor" && v.passo === 0 && v.conhecido === false && J(v.corpo) === J(v0.corpo)) plano++;
      if (!esp.fio.motivo || v.motivo === esp.fio.motivo) motivo++;
    }
  }
  t(`as campanhas novas têm fio (${comFio} de ${N * 2})`, comFio >= N);
  t(`a nêmesis vem do fio em todas (${doFio}/${comFio})`, doFio === comFio, falhas.slice(0, 3).join(" · "));
  t(`há chefes com nome próprio e chefes sem (${humanoides} / ${bichos}) — os dois caminhos são medidos`, humanoides > 0 && bichos > 0);
  t(`o nome dela casa o confronto final (${casaConfronto}/${doFio})`, casaConfronto === doFio, falhas.slice(0, 3).join(" · "));
  t(`"nome, título" não diz o epíteto duas vezes (${semDobra}/${doFio})`, semDobra === doFio, falhas.slice(0, 3).join(" · "));
  t(`o plano continua o do vilão: arquétipo, corpo, fase, segredo (${plano}/${doFio})`, plano === doFio);
  t(`o que ela quer é o do fio (${motivo}/${doFio})`, motivo === doFio);
  const { esp } = campanha(1);
  const v0 = nascer(1), antes = J(v0), espAntes = J(esp);
  const a = vilaoDoFio(v0, esp), b = vilaoDoFio(v0, esp);
  t("determinismo: o mesmo vilão e a mesma espinha dão o mesmo resultado", J(a) === J(b));
  t("imutável: nem o vilão nem a espinha mudam", J(v0) === antes && J(esp) === espAntes);
  t("o save guarda a origem (garantirVilao não a apaga)", (V.garantirVilao(a) || {}).daEspinha === true);
}

sec("2. onde fica o de hoje");
{
  const { esp } = campanha(2);
  const v0 = nascer(2);
  const semFio = { ...esp }; delete semFio.fio;
  t("espinha sem fio (save antigo): o vilão como veio", J(vilaoDoFio(v0, semFio)) === J(v0));
  t("espinha nula ou lixo: o vilão como veio", J(vilaoDoFio(v0, null)) === J(v0) && J(vilaoDoFio(v0, "lixo")) === J(v0));
  const feita = { ...esp, atos: esp.atos.map((a) => ({ ...a, marcos: a.marcos.map((m) => (m.feitio === "confronto" ? { ...m, feito: true } : m)) })) };
  t("o confronto final já cumprido: o vilão como veio (é o herdeiro)", J(vilaoDoFio(v0, feita)) === J(v0));
  const doFio = vilaoDoFio(v0, esp);
  t("o antagonista já morto: o vilão como veio", J(vilaoDoFio(v0, esp, { derrotados: [esp.fio.antagonista] })) === J(v0) && !!(doFio && doFio.daEspinha));
  t("vilão nulo: nulo", vilaoDoFio(null, esp) === null);
}

sec("3. o rosto espera o último ato");
{
  const { esp } = campanha(3);
  const ultimo = esp.atos.length - 1;
  let v = vilaoDoFio(nascer(3), esp) || nascer(3); /* em HEAD não há vilaoDoFio: falha sem estourar */
  /* o plano anda até ao passo que revela */
  let r = null;
  for (let k = 0; k < V.TOTAL_DE_PASSOS && !(r && r.revelacao); k++) { r = V.avancarPlano(v, { dia: 10 * (k + 1) }); v = r.vilao; }
  t("o plano chega à revelação (o rosto) pelo próprio relógio", !!(r && r.revelacao));
  t("no primeiro ato, o rosto espera", oRostoEspera(esp, 0, r) === true);
  t("no meio, o rosto espera", ultimo < 2 || oRostoEspera(esp, 1, r) === true);
  t("no último ato, o rosto vem (é lá que a espinha diz o nome)", oRostoEspera(esp, ultimo, r) === false);
  const alheio = { ...r, vilao: { ...r.vilao, daEspinha: undefined } };
  t("a nêmesis que não veio do fio anda como sempre", oRostoEspera(esp, 0, alheio) === false);
  const passo = { ...r, revelacao: false };
  t("o passo que não revela nunca espera", oRostoEspera(esp, 0, passo) === false);
  t("lixo não estoura", oRostoEspera(null, 0, null) === false && oRostoEspera(esp, 0, {}) === false);
  t("o envelope da revelação diz o nome do fio", r && V.envelopeDoAvanco(r).includes(r.vilao.nome));
}

sec("4. a queda em combate é queda");
{
  let caem = 0, fecham = 0, total = 0;
  for (let i = 0; i < N; i++) {
    const { esp } = campanha(i);
    if (!esp.fio) continue;
    const v = vilaoDoFio(nascer(i), esp);
    if (!v || !v.daEspinha) continue;
    total++;
    /* o combate regista o chefe pelo nome inteiro da ficha */
    const derrotados = [esp.fio.antagonista];
    if (caiuOFio(v, derrotados)) caem++;
    const cf = confrontoDe(esp);
    if (cf && MI.etapaDef(cf.condicao.tipo).ver(cf.condicao, { derrotados })) fecham++;
  }
  t(`o chefe do fio caído em combate derruba a nêmesis, em qualquer fase (${caem}/${total})`, total > 0 && caem === total);
  t(`e o mesmo nome fecha o confronto da espinha (${fecham}/${total})`, fecham === total);
  const { esp } = campanha(4);
  const v = vilaoDoFio(nascer(4), esp);
  t("sem a morte em combate, não cai (a narração passa pela porta de sempre)", caiuOFio(v, []) === false && caiuOFio(v, ["Um Lobo Qualquer"]) === false);
  t("a nêmesis que não veio do fio nunca usa esta porta", caiuOFio(nascer(4), ["Nome Sorteado"]) === false);
  t("lixo não estoura", caiuOFio(null, null) === false && caiuOFio(v, "lixo") === false);
}

sec("5. a fiação no App");
{
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const corpoApos = (ancora) => {
    const ini = app.indexOf(ancora);
    if (ini < 0) return "";
    const abre = ini + ancora.length - 1;
    let prof = 0;
    for (let i = abre; i < app.length; i++) {
      if (app[i] === "{") prof++;
      else if (app[i] === "}") { prof--; if (prof === 0) return app.slice(abre, i + 1); }
    }
    return "";
  };
  const surgir = corpoApos("const tentarSurgirNemesis = () => {");
  /* MOVIDAS (T1-A, 5.ª fatia, 28/10): a regra de tentarSurgirNemesis foi para
     src/motor/combate-do-turno.js (surgirANemesis), e o App é invólucro dela.
     A intenção é a mesma — o vilão nasce com o nome do fio, e se o fio
     estourar fica o sorteado, calado em calou —, provada JOGANDO a peça (o
     motor não se lê como texto) e lendo no App só o que ele entrega e aplica. */
  const fio = { fio: { antagonista: "Morvane, a Viúva do Sal" }, atos: [] };
  const baseN = { fama: 40, contadores: {}, mapa: {}, dia: 3, genero: "Fantasia medieval" };
  const doFio = surgirANemesis({ ...baseN, espinha: fio, derrotados: () => [] }, { sorteDoTurno: () => () => 0.1 });
  const estoura = surgirANemesis({ ...baseN, espinha: fio, derrotados: () => { throw new Error("x"); } }, { sorteDoTurno: () => () => 0.1 });
  t("a nêmesis nasce do fio, em try com calou", doFio.nemesis.nome === "Morvane" && /espinha: espinhaRef\.current/.test(surgir) && /if \(ef\.tipo === "calou"\) calou\(ef\.onde, ef\.erro\)/.test(surgir));
  t("e, se o fio estourar, fica a sorteada", estoura.nemesis.nome !== "Morvane" && estoura.efeitos.some((e) => e.tipo === "calou" && e.onde === "vilaoDoFio"));
  const diaria = corpoApos("const processarNemesisDiaria = () => {");
  t("o rosto espera o último ato (oRostoEspera, com calou)", /oRostoEspera\(espinhaRef\.current/.test(diaria) && /calou\("oRostoEspera"/.test(diaria));
  const queda = corpoApos("const encerrarNemesis = (causa) => {");
  t("a queda em combate do chefe do fio passa (caiuOFio, com calou)", /caiuOFio\(n, mundoDasMissoes\(\)\.derrotados\)/.test(queda) && /!podeCair\(n\) && !caiuEmCombate/.test(queda));
  const arco = corpoApos("const motorDoArco = (sobre = {}) => {"); /* (T1-A 3.ª fatia, o oficial, 28/10: a âncora ganhou o parâmetro `sobre` — o motor do turno passa o evento global de agora; o corpo e a intenção não mudaram) */
  t("o arco não leva o nome antes do rosto", /n\.nome && n\.conhecido \? n\.nome : null/.test(arco));
  t("a mente da ameaça na pauta também não", /vilaoParaPauta\(r, \{ nome: \(\(nemesisRef\.current \|\| \{\}\)\.conhecido && /.test(app));
  t("nem o prisioneiro dos capangas (diz \"a mando de alguém\")", /quemMandou: \(c\.doVilao && nemesisRef\.current && nemesisRef\.current\.conhecido && nemesisRef\.current\.nome\)/.test(app));
  t("nem o fio do oráculo", /nemesis: \(nemesisRef\.current && nemesisRef\.current\.conhecido && nemesisRef\.current\.nome\) \|\| null/.test(app));
  /* e nenhuma outra porta leva o nome cru da nêmesis a um campo nemesis/quemMandou */
  t("não sobra porta com o nome cru", !/(?:nemesis|quemMandou): \([^)]*nemesisRef\.current\.nome\)/.test(app.replace(/nemesisRef\.current\.conhecido && nemesisRef\.current\.nome/g, "")));
}

console.log(`\nnêmesis do fio: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
