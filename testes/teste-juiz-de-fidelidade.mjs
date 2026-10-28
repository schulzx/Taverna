/* teste-juiz-de-fidelidade.mjs (T3-B, 1.ª fatia, 28/10/2026) — o Juiz apanha o que as sessões apanharam à mão?

   O Juiz de fidelidade (src/juiz-de-fidelidade.js) é a régua das doze
   sessões de prova virada conta: a prosa do Narrador contra o que o
   sistema sabia naquele turno. Esta suíte corre-o sobre o corpus rotulado
   (testes/juiz-rotulado.json) — as 197 narrações reais das sessões 8 a 10,
   com o estado de cada turno montado do que está no disco, e os excertos
   que os relatórios da 6.ª, 7.ª e 11.ª citam — e mede duas coisas:

     · quantas das invenções ROTULADAS ele apanha (a meta do plano: ≥ 90%);
     · quantas das respostas LIMPAS ele acusa (a meta: ≤ 5%).

   Um rótulo é apanhado quando o Juiz devolve, numa das classes que o
   rótulo aceita, um achado cujo trecho contém o trecho rotulado. Uma
   resposta limpa é acusada quando o Juiz devolve qualquer achado.

   Os rótulos não se afrouxam para passar: os que ficam de fora das duas
   contas (os marginais, o contestado, os de classe que o Juiz não mede)
   estão no JSON com o motivo, e esta suíte os conta e os imprime.

   uso: node teste-juiz-de-fidelidade.mjs [--ver]   (--ver lista o que falhou) */
import { julgarAProsa, oQueAPautaSabe, TAXONOMIA_DO_JUIZ, TOLERANCIAS_DO_JUIZ, LEXICO_DO_JUIZ } from "../src/juiz-de-fidelidade.js";
/* o corpus (os casos e o que o sistema sabia em cada um) mora em
   corpus-do-juiz.mjs desde 28/10: a suíte da correção mede sobre ele também */
import { sem, J, RC, H9, casos, CLASSES, apanhou } from "./corpus-do-juiz.mjs";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);
const VER = process.argv.includes("--ver");

sec("1. A TAXONOMIA E AS FOLGAS SÃO TABELA");
{
  const medidas = Object.entries(TAXONOMIA_DO_JUIZ).filter(([, v]) => v.mede).map(([k]) => k);
  t("a taxonomia mede as cinco classes do veredito, e a pauta", CLASSES.every((c) => medidas.includes(c)) && medidas.includes("pautaCumprida"));
  t("e escreve o que não mede (consequência, armado, luta, item, hora do dia)", ["consequencia", "armado", "lutaSemLuta", "itemOuEstado", "horaDoDia"].every((c) => TAXONOMIA_DO_JUIZ[c] && TAXONOMIA_DO_JUIZ[c].mede === false && TAXONOMIA_DO_JUIZ[c].porque));
  t("cada classe que fica fora do alcance no corpus é uma das que a taxonomia diz não medir", J.foraDoAlcance.every((x) => TAXONOMIA_DO_JUIZ[x.classe] && TAXONOMIA_DO_JUIZ[x.classe].mede === false));
  t("a folga do preço é a da tabela (20% ou 1 moeda, até 12×)", TOLERANCIAS_DO_JUIZ.preco.relativa === 0.2 && TOLERANCIAS_DO_JUIZ.preco.absoluta === 1 && TOLERANCIAS_DO_JUIZ.preco.multiploAte === 12);
  t("o léxico conhece as moedas que o contador antigo perdia (escamas, marcos, fichas, pratas)", ["escamas", "marcos", "fichas", "pratas"].every((m) => LEXICO_DO_JUIZ.moedas.includes(m)));
  t("e o número por extenso (vinte e cinco, cem)", LEXICO_DO_JUIZ.numeros.vinte === 20 && LEXICO_DO_JUIZ.numeros.cem === 100);
  const v = julgarAProsa("\"Vinte e cinco marcos o elixir.\"", { mercado: [{ nome: "Elixir de Destreza", preco: 140 }] });
  t("'vinte e cinco marcos' contra o elixir ◉ 140 é preço inventado, com o motivo", v.precosInventados.length === 1 && v.precosInventados[0].valor === 25 && /140/.test(v.precosInventados[0].motivo));
  const d = julgarAProsa("— Nova Profundo fica a um dia de marcha.", { distancias: [{ para: "Nova Profundo", horas: 4 }] });
  t("'um dia de marcha' contra 4 h é distância fora (o dia de estrada de viagem.js)", d.distanciasFora.length === 1 && d.distanciasFora[0].horas === 8);
  const d2 = julgarAProsa("— Nova Profundo fica a umas quatro horas de marcha.", { distancias: [{ para: "Nova Profundo", horas: 4.2 }] });
  t("e 'quatro horas' contra 4,2 h passa (a folga da distância)", d2.distanciasFora.length === 0);
}

sec("2. MENÇÃO NÃO É PRESENÇA");
{
  const v = julgarAProsa("A capanga baixa o arco. — Ele se chama Dolmen. Vi a tua camarada perto do cais, falava com um homem do templo, o Varek.", {});
  t("quem se apresenta numa fala está em cena (Dolmen)", v.pessoasNovas.some((a) => a.nome === "Dolmen"));
  t("quem é dito de passagem numa fala não está (Varek vai para nomesNovos)", v.nomesNovos.some((a) => a.nome === "Varek") && !v.pessoasNovas.some((a) => a.nome === "Varek"));
  const w = julgarAProsa("Atrás dela, Rurik se aproxima mancando.", { gente: ["Nyla"] });
  t("quem a narração põe a agir está em cena (Rurik)", w.pessoasNovas.some((a) => a.nome === "Rurik"));
  const x = julgarAProsa("— Fechado. Saiu há pouco. Mercadores gritam preços.", {});
  t("a palavra que só tem maiúscula por abrir a frase não é nome", x.pessoasNovas.length === 0 && x.nomesNovos.length === 0);
  const y = julgarAProsa("Atrás dela, Rurik se aproxima mancando.", { gente: ["Rurik"] });
  t("e quem o registo já tem não é novo", y.pessoasNovas.length === 0);
  /* o achado da 5.ª fatia da T1-A (diário de 28/10): no navegador, "Rurik
     Martelo-Torto enxuga uma caneca" saiu como lugar novo. Dois defeitos,
     cada um com o seu caso: o sítio que vem ANTES DA VÍRGULA ("Na taverna,
     Rurik…") batizava o nome que vem depois dela; e, ao abrir a frase, o
     "Rurik" era tirado como se fosse verbo ("Levar Dolmen"), sobrando só o
     epíteto — o que faz de um Rurik conhecido um "Martelo-Torto" novo */
  t("a pontuação que separa e o epíteto de hífen são do léxico (a tabela)", LEXICO_DO_JUIZ.separaDoSitio.test(",") && !LEXICO_DO_JUIZ.separaDoSitio.test(" ") && LEXICO_DO_JUIZ.epiteto.test("Martelo-Torto") && !LEXICO_DO_JUIZ.epiteto.test("Dolmen"));
  const r1 = julgarAProsa("Na taverna, Rurik Martelo-Torto enxuga uma caneca.", {});
  t("o sítio antes da vírgula não batiza o nome (Rurik Martelo-Torto é pessoa, não lugar)", r1.pessoasNovas.some((a) => a.nome === "Rurik Martelo-Torto") && r1.lugaresNovos.length === 0);
  const r2 = julgarAProsa("A taverna está cheia. Rurik Martelo-Torto enxuga uma caneca.", {});
  t("o nome com epíteto de hífen, ao abrir a frase, fica inteiro", r2.pessoasNovas.length === 1 && r2.pessoasNovas[0].nome === "Rurik Martelo-Torto");
  const r3 = julgarAProsa("A taverna está cheia. Rurik Martelo-Torto enxuga uma caneca.", { gente: ["Rurik"] });
  t("e o Rurik que o registo tem não vira um Martelo-Torto novo", r3.pessoasNovas.length === 0 && r3.lugaresNovos.length === 0);
  const r4 = julgarAProsa("Seguem pela estrada até a Taverna Caneca Torta. Na taverna Caneca Torta, o fogo crepita.", {});
  t("e o sítio colado ao nome ainda o batiza (a taverna Caneca Torta é lugar)", r4.lugaresNovos.some((a) => /Caneca Torta/.test(a.nome)) && r4.pessoasNovas.length === 0);
  const z = julgarAProsa("\"Pago as sete?\" Ela recolhe as sete fichas.", { frase: "Pago as sete fichas.", moeda: "fichas" });
  t("o valor que o jogador disse é eco, não invenção", z.precosInventados.length === 0);
}

sec("3. A PAUTA, LIDA DE VOLTA");
{
  const h = RC.historico[0];
  const s = oQueAPautaSabe(h);
  t("a pauta gravada do turno 58 dá a gente do EM CENA (os capangas, Sethric, Ylva)", ["Capanga de faca", "Sethric", "Ylva"].every((n) => s.gente.includes(n)));
  t("o lugar do ONDE (Nova clara)", s.lugares.includes("Nova clara"));
  t("a distância do NÃO PODE (Monte Rasa, 25 km, 4 h)", s.distancias.some((d) => d.para === "Monte Rasa" && d.km === 25 && d.horas === 4));
  t("e o tempo do DESFECHO (acorda em 3 horas)", s.tempos.some((x) => x.horas === 3));
  const m = oQueAPautaSabe("PERGUNTOU o preço daqui: caneca de cerveja ◉ 2\n          à venda em Ponte Brumoso: Arco de vime ◉ 20 (O Martelo Velho)");
  t("e o mercado (◉ 2 da caneca, ◉ 20 do arco)", m.mercado.some((x) => /caneca/.test(x.nome) && x.preco === 2) && m.mercado.some((x) => /Arco de vime/.test(x.nome) && x.preco === 20));
  t("o PERGUNTOU, linha a linha, é fato que tem de entrar", m.fatos.length === 2 && m.fatos.every((f) => /◉/.test(f)));
  const b = julgarAProsa("Tomas coça a barba. 'Brina Pedra? Essa aí trata todo mundo por criança.'", { fatos: [H9.m12.linha] });
  t("o pedido da Brina que não entrou (60 moedas, treze dias) falta", b.pautaCumprida && b.pautaCumprida.faltaram.length === 1 && /60/.test(b.pautaCumprida.faltaram[0].falta));
  const b2 = julgarAProsa("'Faltam-me sessenta moedas, criança. Treze dias.' diz Brina Pedra.", { fatos: [H9.m12.linha] });
  t("e entra quando a prosa o diz por extenso", b2.pautaCumprida && b2.pautaCumprida.cumpridos === 1);
}

sec("4. DETERMINISMO E LIXO");
{
  const c = casos.find((x) => x.id === "s10#63");
  const a = JSON.stringify(julgarAProsa(c.prosa, c.estado)), b = JSON.stringify(julgarAProsa(c.prosa, JSON.parse(JSON.stringify(c.estado))));
  t("a mesma entrada dá o mesmo veredito", a === b);
  const congelado = Object.freeze({ ...c.estado, mercado: Object.freeze([...c.estado.mercado]) });
  let mexeu = false;
  try { julgarAProsa(c.prosa, congelado); } catch { mexeu = true; }
  t("e não mexe no estado recebido (corre sobre um estado congelado)", !mexeu);
  const vazio = (v) => v && CLASSES.every((cl) => Array.isArray(v[cl]) && v[cl].length === 0) && v.limpa === true && v.achados === 0;
  t("null de prosa e de estado: veredito vazio", vazio(julgarAProsa(null, null)));
  t("prosa vazia: veredito vazio", vazio(julgarAProsa("", {})) && vazio(julgarAProsa("   \n ", { mercado: null })));
  t("estado vazio: o que é dinheiro sem mesa é inventado (o sistema não sabia)", julgarAProsa("\"Dez moedas.\"", {}).precosInventados.length === 1);
  t("campos estranhos não derrubam (mercado como objeto, distâncias com lixo)", (() => { try { julgarAProsa("Fica a duas horas daqui. Custa três moedas.", { mercado: { a: 1 }, distancias: [null, 3, { para: null }], tempos: "x", gente: [null, 7], pauta: 42 }); return true; } catch { return false; } })());
  t("a pauta nula ou vazia não sabe nada", oQueAPautaSabe(null).mercado.length === 0 && oQueAPautaSabe("").fatos.length === 0);
}

sec("5. A META: o corpus rotulado das sessões 6–11");
{
  const porClasse = {}, fpClasse = {};
  const faltas = [], acusadas = [], maisNos = [];
  let rot = 0, pegou = 0, limpas = 0, sujas = 0, extras = 0;
  for (const c of casos) {
    const v = julgarAProsa(c.prosa, c.estado);
    for (const r of c.rotulos) {
      rot++;
      const p = porClasse[r.classe] || (porClasse[r.classe] = { de: 0, pegou: 0 });
      p.de++;
      if (apanhou(v, r)) { pegou++; p.pegou++; } else faltas.push(`${c.id} [${r.classe}] «${r.trecho}»`);
    }
    if (c.rotulos.length) {
      const nao = CLASSES.flatMap((cl) => v[cl].filter((a) => !c.rotulos.some((r) => (r.aceita || [r.classe]).includes(cl) && (sem(a.trecho).includes(sem(r.trecho)) || (a.nome && sem(r.trecho).includes(sem(a.nome)))))).map((a) => `${cl}: ${a.nome || a.valor}`));
      extras += nao.length;
      if (VER && nao.length) maisNos.push(`${c.id} ${nao.join(" · ")}`);
    }
    if (c.limpo) {
      limpas++;
      if (!v.limpa) {
        sujas++;
        const quais = [...CLASSES.filter((cl) => v[cl].length), ...(v.pautaCumprida && v.pautaCumprida.faltaram.length ? ["pautaCumprida"] : [])];
        for (const q of quais) fpClasse[q] = (fpClasse[q] || 0) + 1;
        acusadas.push(`${c.id} ${quais.map((q) => q + ": " + (q === "pautaCumprida" ? v.pautaCumprida.faltaram.map((x) => x.falta).join(", ") : v[q].map((a) => a.nome || a.valor + (a.unidade ? " " + a.unidade : "")).join(", "))).join(" · ")}`);
      }
    }
  }
  const taxa = pegou / rot, fp = sujas / limpas;
  console.log(`\n     apanhados: ${pegou} de ${rot} rotulados (${(taxa * 100).toFixed(1)}%)`);
  for (const [cl, p] of Object.entries(porClasse)) console.log(`       ${cl.padEnd(18)} ${p.pegou} de ${p.de}`);
  console.log(`     acusadas: ${sujas} de ${limpas} respostas limpas (${(fp * 100).toFixed(1)}%)`);
  for (const [cl, n] of Object.entries(fpClasse)) console.log(`       ${cl.padEnd(18)} ${n}`);
  console.log(`     achados a mais nas respostas rotuladas: ${extras}`);
  console.log(`     fora das contas: ${J.marginais.length} marginais, ${J.contestados.length} contestado, ${J.foraDoAlcance.length} de classe que o Juiz não mede`);
  if (VER) { console.log("\n     NÃO APANHADOS:\n       " + faltas.join("\n       ")); console.log("\n     ACUSADAS:\n       " + acusadas.join("\n       ")); console.log("\n     A MAIS NAS ROTULADAS:\n       " + maisNos.join("\n       ")); }
  t(`o corpus tem rótulos de seis sessões e respostas limpas que bastem (${rot} rotulados, ${limpas} limpas)`, rot >= 50 && limpas >= 150 && new Set(casos.filter((c) => c.rotulos.length).map((c) => c.id.replace(/[#-].*$/, ""))).size >= 6);
  t(`o Juiz apanha ≥ 90% das invenções rotuladas (${(taxa * 100).toFixed(1)}%)`, taxa >= 0.9);
  t(`e acusa ≤ 5% das respostas limpas (${(fp * 100).toFixed(1)}%)`, fp <= 0.05);

  /* a prova de que o Juiz COMPARA e não adivinha: as mesmas respostas
     limpas, julgadas só com a frase e as respostas de antes (sem o que o
     sistema sabia), têm de ser acusadas muito mais. Se o número não
     mexesse, o Juiz estaria a ler a prosa, não o estado. */
  const cego = casos.filter((c) => c.limpo).filter((c) => !julgarAProsa(c.prosa, { frase: c.estado.frase, antes: c.estado.antes, moeda: c.estado.moeda }).limpa).length;
  console.log(`     as mesmas limpas, sem o estado do sistema: ${cego} de ${limpas} acusadas`);
  t(`sem o estado do sistema, o Juiz acusa ao menos cinco vezes mais (${cego} contra ${sujas})`, cego >= 5 * Math.max(1, sujas));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
