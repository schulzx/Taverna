/* O FIO DA ESPINHA (nexo, 11/10) — cada peça sabe por que está ali

   A pessoa, a 11/10: *"temos que ver também se essa espinha que criamos tem
   nexo, pois as vezes as coisas sem sentido podem estar vindo dela … o
   mestre precisa ser vivo, ele age e reage"* — e *"ele deve saber tudo mas
   só narrar o momento"*.

   Lida como um editor lê um roteiro, a espinha de 12 campanhas novas de
   Uma Vida era uma lista de chamada: 280 marcos, nenhum com porquê; 64
   lugares que "escondem" alguma coisa que o sistema não sabia; o
   antagonista do fim ausente de todos os envelopes antes do último ato em
   9 das 12; o covil dele numa cidade e o confronto no clímax, no mesmo
   prompt, em 12 das 12; e o chefe sem nome próprio a casar pela ESPÉCIE —
   o fim da campanha fechava ao matar qualquer bicho da mesma espécie.

   O que esta suíte prova:
     1. a tabela FIO (saga.js) cobre todos os feitios e consequências;
     2. todo marco, quando é o de agora, diz ao Narrador o que dá (a pessoa
        sabe o caminho para a peça seguinte, o lugar guarda o que aponta
        para ela) — em 60 campanhas de região e 60 de continente;
     3. a sombra cresce com a história: motivo sem nome no primeiro ato,
        o título no meio, o nome no fim;
     4. o lugar guarda uma coisa concreta, da tabela, sempre a mesma;
     5. o fio grava-se na criação, sobrevive ao save e ao lixo, e a espinha
        antiga (sem ele) ainda tem fio, tirado do próprio confronto;
     6. o chefe sem nome próprio casa pelo nome inteiro: matar um bicho da
        mesma espécie não fecha o confronto;
     7. o principal espera no clímax — a ficha dos chefes e a espinha dizem
        o mesmo sítio;
     8. determinismo, imutabilidade e o tamanho do envelope.

   FALHA em HEAD (v9.374): FIO não existe e o envelope não tem fio. */

import * as SG from "../src/saga.js";
import * as R from "../src/regiao.js";
import * as MB from "../src/mundo-base.js";
import * as G from "../src/geografia.js";
import * as MI from "../src/missoes.js";
import { ESTRUTURAS, estruturaPorId } from "../src/historia.js";
import { moldePorId } from "../src/moldes.js";
import { sementeDe, generoDe } from "./medir-regiao.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d) => { try { return f(); } catch { return d; } };
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^(o|a|os|as) /, "").trim();
const J = (v) => JSON.stringify(v);

const FIO = SG.FIO || null;
const N = 60;
/* o maior envelope medido a 11/10 tem ~800 caracteres (o fio soma ~300 ao
   de sempre); o teto deixa folga para nomes longos e não deixa o fio
   crescer sem se ver — o teto de prompt é sagrado (teste-prompt.mjs) */
const TETO_DO_ENVELOPE = 1000;

/* uma campanha: o mapa da criação, a espinha estendida, amarrada na região */
function campanha(i, { regiao = true } = {}) {
  const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id, molde = moldePorId("sobremundo");
  const mapa = regiao ? R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde, genero, estrutura, modo: "historia" })) : G.gerarGeografia(semente, molde);
  let esp = SG.estenderEspinha({ semente, mapa, genero, molde, estrutura, cidadeInicial: mapa.cidades[0].nome });
  if (mapa.regiao) esp = R.espinhaNaRegiao(mapa, esp, { semente, genero, molde });
  return { semente, genero, estrutura, mapa, esp, est: estruturaPorId(estrutura) };
}
/* o envelope do j-ésimo marco quando ele é o de agora (tudo antes, feito) */
function envelopes(esp, est) {
  const todos = esp.atos.flatMap((a, k) => a.marcos.map((m) => ({ m, k })));
  return todos.map(({ m, k }, j) => {
    const e2 = { ...esp, atos: esp.atos.map((a) => ({ ...a, marcos: a.marcos.map((x) => ({ ...x, feito: todos.findIndex((y) => y.m === x) < j })) })) };
    /* MOVIDA NA MM19 (11/10), com o motivo: na 5.ª sessão o envelope da
       espinha — a batida, o fio inteiro e a regra numa linha só, 650–910
       caracteres — não coube na pauta em nenhum dos 66 pedidos
       (teste-batida-na-cena). O envelope passou a ser SÓ a batida, e o fio com
       a regra mudou-se para a última linha de `momentoDoFio`, que o App põe
       na mesma secção MOMENTO logo a seguir. O que esta suíte prova do fio
       continua de pé, agora sobre o que o Narrador lê nessa secção: o
       envelope e as linhas do momento, juntos (`env`). O tamanho que conta é
       o do envelope sozinho (`bat`): é ele a linha que tem de caber. */
    const bat = SG.envelopeDaEspinha(e2, k, est) || "";
    return { m, k, prox: todos[j + 1] ? todos[j + 1].m : null, bat, env: [bat, ...SG.momentoDoFio(e2, k, {})].filter(Boolean).join(" ") };
  });
}

sec("1. a tabela");
{
  t("FIO existe e é exportada", !!FIO && typeof FIO === "object");
  const consequencias = [...new Set(Object.values(SG.FEITIOS).map((f) => f.consequencia))];
  t("toda consequência de feitio (fora o desfecho e o fundo) tem o que dá", !!FIO && consequencias.filter((c) => c !== "desfecho").every((c) => typeof FIO.da[c] === "string"));
  t("o fundo da masmorra e o desfecho têm frase própria", !!FIO && typeof FIO.da.fundo === "string" && typeof FIO.da.desfecho === "string");
  t("todo feitio tem como se diz quando é a peça seguinte", !!FIO && Object.keys(SG.FEITIOS).every((f) => typeof FIO.leva[f] === "string"));
  t("os objetos que um lugar guarda são vários e concretos", !!FIO && Array.isArray(FIO.objetos) && FIO.objetos.length >= 4 && FIO.objetos.every((o) => o.length > 8));
  t("a sombra tem três tamanhos, com e sem motivo", !!FIO && ["inicio", "meio", "fim"].every((k) => FIO.sombra[k] && FIO.semMotivo[k] && FIO.curta[k]));
  t("o nome só aparece no fim; o primeiro ato não tem nome nem título", !!FIO && !/\{nome\}|\{titulo\}/.test(FIO.sombra.inicio) && /\{nome\}/.test(FIO.sombra.fim) && /\{titulo\}/.test(FIO.sombra.meio));
}

sec("2. todo marco, quando é o de agora, diz o que dá");
for (const regiao of [true, false]) {
  let marcos = 0, comFio = 0, ligados = 0, maior = 0;
  const falhas = [];
  for (let i = 0; i < N; i++) {
    const c = campanha(i, { regiao });
    for (const x of envelopes(c.esp, c.est)) {
      marcos++;
      maior = Math.max(maior, x.bat.length);
      if (/O FIO \(do sistema/.test(x.env)) comFio++;
      const chaves = x.prox ? [x.prox.quem, x.prox.onde, x.prox.alvo].filter(Boolean) : [];
      if (!x.prox || chaves.some((k) => norm(x.env).includes(norm(k)))) ligados++;
      else if (falhas.length < 2) falhas.push(`${x.m.titulo} → ${x.prox.titulo}`);
    }
  }
  const rot = regiao ? "região" : "continente";
  t(`${rot}: todo marco leva o fio (${comFio}/${marcos})`, marcos > 0 && comFio === marcos);
  t(`${rot}: e o fio aponta para a peça seguinte (${ligados}/${marcos})`, marcos > 0 && ligados === marcos, falhas.join("; "));
  t(`${rot}: o envelope cabe (o maior tem ${maior} caracteres, teto ${TETO_DO_ENVELOPE})`, maior > 0 && maior <= TETO_DO_ENVELOPE);
}

sec("3. a sombra cresce com a história");
{
  let ini = 0, iniSemNome = 0, meio = 0, meioTitulo = 0, fim = 0, fimNome = 0, vistos = 0;
  for (let i = 0; i < N; i++) {
    const c = campanha(i);
    const f = c.esp.fio;
    if (!f) continue;
    vistos++;
    const ultimo = c.esp.atos.length - 1;
    for (const x of envelopes(c.esp, c.est)) {
      const e = norm(x.env);
      if (x.k === 0) { ini++; if (e.includes(norm(f.motivo)) && !e.includes(norm(f.antagonista)) && !e.includes(norm(f.titulo))) iniSemNome++; }
      else if (x.k < ultimo) { meio++; if (e.includes(norm(f.titulo))) meioTitulo++; }
      else { fim++; if (e.includes(norm(f.antagonista))) fimNome++; }
    }
  }
  t(`toda campanha nova grava o fio (${vistos}/${N})`, vistos === N);
  t(`no primeiro ato, o motivo e nenhum nome (${iniSemNome}/${ini})`, ini > 0 && iniSemNome === ini);
  t(`no meio, o título que o mundo lhe dá (${meioTitulo}/${meio})`, meio > 0 && meioTitulo === meio);
  t(`no fim, o nome (${fimNome}/${fim})`, fim > 0 && fimNome === fim);
}

sec("4. o lugar guarda uma coisa concreta, sempre a mesma");
{
  let desc = 0, comObjeto = 0, iguais = 0;
  for (let i = 0; i < 20; i++) {
    const c = campanha(i);
    const a = envelopes(c.esp, c.est), b = envelopes(campanha(i).esp, c.est);
    a.forEach((x, j) => {
      if (x.m.feitio !== "descobrir") return;
      desc++;
      /* MOVIDA A 11/10 (a campanha que prende, batidas.js), com o motivo: a
         espinha nova guarda o SEGREDO de cada "descobrir" — uma coisa do
         Escondido da cidade e o que ela prova — e o envelope diz essa coisa
         em vez de um objeto de FIO.objetos, que não dizia nada; a espinha
         antiga (sem segredo) continua a dizer o objeto. A intenção fica: o
         lugar guarda uma coisa concreta, e sempre a mesma. No fecho do
         primeiro ato o que o lugar entrega é a REVIRAVOLTA, e é ela que se diz. */
      const coisa = x.m.segredo ? x.m.segredo.coisa : null;
      if (x.m.reviravolta ? x.env.includes("REVIRAVOLTA") : coisa ? x.env.includes(coisa) : FIO && FIO.objetos.some((o) => x.env.includes(o))) comObjeto++;
      if (x.env === b[j].env) iguais++;
    });
  }
  t(`todo "o que X esconde" diz o que X guarda (${comObjeto}/${desc})`, desc > 0 && comObjeto === desc);
  t(`e a mesma semente guarda a mesma coisa (${iguais}/${desc})`, desc > 0 && iguais === desc);
}

sec("5. o fio no save, no lixo e na espinha antiga");
{
  const c = campanha(1);
  const f = c.esp.fio || {};
  t("o fio diz quem, o título, a espécie e o motivo do chefe principal", !!f.antagonista && !!f.titulo && !!f.motivo && !!f.especie);
  const p = MB.chefesDoMundo(c.semente, c.mapa, c.genero, null).find((x) => x.linha === "principal");
  t("e é o chefe que o mundo já criou, com o motivo dele", !!p && f.antagonista === p.nome && f.motivo === p.motivo);
  const volta = SG.garantirEspinha(JSON.parse(J(c.esp)));
  t("sobrevive ao save (JSON e garantirEspinha)", J(volta.fio) === J(c.esp.fio));
  t("garantirEspinha(null) não inventa fio", !("fio" in SG.garantirEspinha(null)));
  t("fio de lixo não passa", !("fio" in SG.garantirEspinha({ atos: [], fio: { antagonista: "" } })) && !("fio" in SG.garantirEspinha({ atos: [], fio: "x" })));
  t("os campos do fio são aparados", SG.garantirEspinha({ atos: [], fio: { antagonista: "x".repeat(300), motivo: "y".repeat(300) } }).fio.motivo.length <= 80);
  const { fio, ...antiga } = c.esp;
  const env = envelopes(antiga, c.est);
  t("a espinha antiga (sem fio) continua a ter fio, tirado do confronto", env.every((x) => /O FIO/.test(x.env)));
  const ultimo = antiga.atos.length - 1;
  t("e a sombra dela diz o nome no fim, sem inventar motivo", env.filter((x) => x.k === ultimo).every((x) => x.env.includes(f.antagonista)) && env.every((x) => !x.env.includes(f.motivo)));
  t("espinha vazia: sem envelope, sem erro", tenta(() => SG.envelopeDaEspinha(null, 0, c.est), "x") === "" && tenta(() => SG.envelopeDaEspinha({ atos: [{ marcos: [] }] }, 0, null), "x") === "");
}

sec("6. o chefe sem nome próprio casa pelo nome inteiro");
{
  let achou = null;
  for (let i = 0; i < 200 && !achou; i++) {
    const c = campanha(i);
    const p = MB.chefesDoMundo(c.semente, c.mapa, c.genero, null).find((x) => x.linha === "principal");
    if (p && p.nomeCurto === p.especie) achou = { c, p };
  }
  t("há um mundo com o principal sem nome próprio", !!achou);
  if (achou) {
    const { c, p } = achou;
    const fecho = c.esp.atos.flatMap((a) => a.marcos).find((m) => m.feitio === "confronto");
    t("a condição do confronto é o nome inteiro", !!fecho && fecho.condicao.alvo === p.nome);
    const ver = (cond, m) => MI.etapaDef(cond.tipo).ver(cond, m);
    const bicho = tenta(() => SG.conferirEspinha(c.esp, { derrotados: [p.especie] }, ver).cumpridos, []);
    const ele = tenta(() => SG.conferirEspinha(c.esp, { derrotados: [p.nome] }, ver).cumpridos, []);
    t(`matar "${p.especie}" (um bicho qualquer) não fecha o confronto`, !bicho.some((m) => m.feitio === "confronto"));
    t(`matar "${p.nome}" fecha`, ele.some((m) => m.feitio === "confronto"));
  }
}

sec("7. o principal espera no clímax");
{
  let iguais = 0, prompt = 0;
  for (let i = 0; i < N; i++) {
    const c = campanha(i);
    const p = MB.chefesDoMundo(c.semente, c.mapa, c.genero, null).find((x) => x.linha === "principal");
    const fecho = c.esp.atos.flatMap((a) => a.marcos).filter((m) => m.feitio === "confronto").pop();
    if (p && fecho && p.covil === fecho.onde) iguais++;
    if (p && MB.resumoChefesPrompt(c.semente, c.mapa, null, c.genero).includes(`covil perto de ${fecho && fecho.onde}`)) prompt++;
  }
  t(`a ficha do chefe e a espinha dizem o mesmo sítio (${iguais}/${N})`, iguais === N);
  t(`e é esse o sítio que o prompt dos chefes dá (${prompt}/${N})`, prompt === N);
  const cont = campanha(2, { regiao: false });
  const pc = MB.chefesDoMundo(cont.semente, cont.mapa, cont.genero, null).find((x) => x.linha === "principal");
  t("no continente o covil continua uma cidade", !!pc && cont.mapa.cidades.some((x) => x.nome === pc.covil));
}

sec("8. determinismo e imutabilidade");
{
  const a = campanha(5), b = campanha(5);
  t("a mesma semente dá o mesmo fio", J(a.esp.fio) === J(b.esp.fio) && J(envelopes(a.esp, a.est).map((x) => x.env)) === J(envelopes(b.esp, b.est).map((x) => x.env)));
  const antes = J(a.esp);
  SG.envelopeDaEspinha(a.esp, 0, a.est);
  t("o envelope não muta a espinha", J(a.esp) === antes);
}

console.log(`\nfio da espinha: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
