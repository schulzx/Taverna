/* ============================================================
   OS ÓRGÃOS DO COMBATE, PUROS (T1-A, 5.ª fatia, 28/10/2026) — testes/teste-motor-combate.mjs

   Cada órgão do bloco do combate que sai do App para
   `src/motor/combate-do-turno.js` é provado aqui byte a byte contra o
   código de ANTES: `combate-dourado.json` é o que o App de 7338870 fez
   sobre os casos de `combate-casos.mjs` (gerado por
   `gerar-combate-dourado.mjs`, que lê o App do git e corre o órgão à
   letra). A peça nova corre sobre os mesmos casos, com a mesma sorte, e a
   foto tem de ser a mesma.

   E a prova tem de morder: cada órgão também é corrido com uma troca de
   propósito (outra sorte, outra ficha), e aí a foto TEM de divergir — uma
   comparação que nunca falha não prova nada.

   E a fiação: o App guarda o nome do órgão como invólucro da peça.
   ============================================================ */
import fs from "node:fs";
import { casosDoCombate, sorteDoCaso, N_CASOS } from "./combate-casos.mjs";
import { despertarUnica, aFamaDoFeito, concluirAMasmorra, aMorteDoAlvo, surgirANemesis } from "../src/motor/combate-do-turno.js";
import { mundoDaLei, localDoCaso, fotoCompacta } from "./combate-casos.mjs";
import { abrirOCombate, economiaNova, somarAoContador, osVinculos, notarOFecho, limparAsConjuracoes, oRitoDoDeicidio } from "../src/motor/combate-do-turno.js";
import { AGORA_DA_PROVA } from "./combate-casos.mjs";
import { montarGrade, posicionar } from "../src/grid.js";
import { rng, hashSemente } from "../src/semente.js";
import { notaComOTurno } from "../src/motor/aplicar.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const D = JSON.parse(fs.readFileSync(new URL("./combate-dourado.json", import.meta.url), "utf8"));
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const C = semComentarios(APP);
const copia = (x) => JSON.parse(JSON.stringify(x));
const casos = casosDoCombate();
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

t(`o dourado é do commit de antes (7338870), ${N_CASOS} casos`, D.commit === "7338870" && D.casos === N_CASOS && casos.length === N_CASOS);

sec("1 · o poder único (talvezDespertarUnica → despertarUnica)");
{
  const fotos = D.orgaos.talvezDespertarUnica;
  const foto = (k, sorte) => {
    const r = despertarUnica(copia(k.pers), copia(k.inimigosFinais), { sorteDoTurno: sorte || sorteDoCaso(k) });
    return { pers: r.pers, msgs: r.msgs, nota: notaComOTurno(k.notaAntes, r.paraOCronista) };
  };
  const batem = casos.filter((k, i) => igual(foto(k), fotos[i])).length;
  t(`${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS);
  const despertou = fotos.filter((f) => f.msgs.length).length, semChance = casos.filter((k) => !(k.inimigosFinais || []).some((e) => e.ameaca === "elite" || e.ameaca === "lendario")).length;
  console.log(`      despertou ${despertou} · sem elite nem lendário ${semChance}`);
  t("percorre os dois ramos (despertou e não)", despertou > 20 && despertou < N_CASOS - 20);
  /* morde: com a sorte de outro caso, a foto muda onde havia chance */
  const outra = casos.filter((k, i) => !igual(foto(k, sorteDoCaso(casos[(i + 1) % N_CASOS])), fotos[i])).length;
  t(`morde: com a sorte de outro caso, ${outra} fotos divergem`, outra > 10);
  t("sem a sorte do turno, não desperta (nenhum dado fora da semente)", casos.every((k) => despertarUnica(k.pers, k.inimigosFinais, {}).pers === k.pers) && despertarUnica(null, [], { sorteDoTurno: sorteDoCaso(casos[0]) }).pers === null);
  t("não muta a ficha que entra", (() => { const k = casos.find((x, i) => fotos[i].msgs.length); const p = copia(k.pers); despertarUnica(p, k.inimigosFinais, { sorteDoTurno: sorteDoCaso(k) }); return igual(p, k.pers); })());
  t("no App, o órgão é o invólucro da peça", /const talvezDespertarUnica = \(p2, inimigosFinais, msgs\) => \{\s*const r = despertarUnica\(p2, inimigosFinais, \{ sorteDoTurno \}\);\s*msgs\.push\(\.\.\.r\.msgs\);\s*notaRef\.current = notaComOTurno\(notaRef\.current, r\.paraOCronista\);\s*return r\.pers;/.test(C));
}

sec("2 · a fama que cresce (checarFama → aFamaDoFeito)");
{
  const fotos = D.orgaos.checarFama;
  /* o invólucro do App, à letra: a tela, a nota e a última checagem */
  const foto = (k, fama, antes) => {
    const r = aFamaDoFeito(fama, antes);
    return { ret: r.fama, tela: r.msgs.map((texto) => ({ autor: "sistema", texto })), nota: notaComOTurno(k.notaAntes, r.paraOCronista), ultima: r.fama };
  };
  const batem = casos.filter((k, i) => igual(foto(k, k.fama, k.famaAntes), fotos[i])).length;
  t(`${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS);
  const subiu = fotos.filter((f) => f.tela.length).length;
  console.log(`      o patamar subiu em ${subiu} · ficou em ${N_CASOS - subiu}`);
  t("percorre os dois ramos (subiu e não)", subiu > 20 && subiu < N_CASOS - 20);
  /* morde: a última checagem trocada pela de agora apaga toda subida */
  const morde = casos.filter((k, i) => !igual(foto(k, k.fama, k.fama), fotos[i])).length;
  t(`morde: com a última checagem igual à de agora, ${morde} fotos divergem (as que subiam)`, morde === subiu && morde > 0);
  t("no App, o órgão é o invólucro da peça", /const checarFama = \(\) => \{\s*const r = aFamaDoFeito\(famaAtual\(\), famaPatamarRef\.current\);\s*if \(r\.msgs\.length\) pushMsgs\(r\.msgs\.map\(\(texto\) => \(\{ autor: "sistema", texto \}\)\)\);\s*notaRef\.current = notaComOTurno\(notaRef\.current, r\.paraOCronista\);\s*famaPatamarRef\.current = r\.fama;\s*return r\.fama;/.test(C));
}

sec("3 · o chefe caiu (concluirMasmorraDoChefe → concluirAMasmorra)");
{
  const fotos = D.orgaos.concluirMasmorraDoChefe;
  /* o invólucro do App, à letra: as linhas, os efeitos na ordem, a sala e a sessão */
  const foto = (k, sorte, masmorra = k.masmorra) => {
    const st = { masmorra: copia(masmorra), base: copia(k.base), salaEmCurso: "sala em curso", contadores: [], sessao: [], calados: [] };
    const msgs = [];
    const r = concluirAMasmorra(copia({ ...k.pers, equipamento: k.equipamento, suprimentos: k.suprimentos, essencia: k.essencia }), { masmorra: st.masmorra, mapa: copia(k.mapa), base: st.base }, { lexico: k.lexico, sorteDoTurno: sorte || sorteDoCaso(k) });
    if (r.concluiu) {
      msgs.push(...r.msgs);
      for (const ef of r.efeitos) {
        if (ef.tipo === "masmorra") st.masmorra = ef.masmorra;
        else if (ef.tipo === "contador") st.contadores.push([ef.nome]);
        else if (ef.tipo === "base") st.base = ef.base;
        else if (ef.tipo === "calou") st.calados.push(ef.onde);
      }
      st.salaEmCurso = null; st.sessao.push("chefe");
    }
    return { ret: { pers: r.pers, concluiu: r.concluiu }, msgs, masmorra: st.masmorra, base: st.base, salaEmCurso: st.salaEmCurso, contadores: st.contadores, sessao: st.sessao, calados: st.calados };
  };
  const batem = casos.filter((k, i) => igual(foto(k), fotos[i])).length;
  t(`${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS);
  const concluiu = fotos.filter((f) => f.ret.concluiu).length, naBase = fotos.filter((f) => f.ret.concluiu && f.base && (f.base.concluidas || []).length).length;
  const comTochas = fotos.filter((f) => f.msgs.some((m) => /tocha\(s\) voltam/.test(m))).length;
  console.log(`      concluiu ${concluiu} · a base guardou ${naBase} · tochas de volta ${comTochas}`);
  t("percorre os ramos (concluiu e não; com e sem região; com e sem tochas)", concluiu > 50 && concluiu < N_CASOS - 50 && naBase > 20 && naBase < concluiu && comTochas > 10 && comTochas < concluiu);
  /* morde: com a sorte de outro caso, o item do chefe muda */
  const outra = casos.filter((k, i) => !igual(foto(k, sorteDoCaso(casos[(i + 1) % N_CASOS])), fotos[i])).length;
  t(`morde: com a sorte de outro caso, ${outra} fotos divergem`, outra > 50);
  /* (só a ficha e as linhas: a masmorra trocada à entrada já difere por construção) */
  const sala = casos.filter((k, i) => { if (!k.masmorra || !Array.isArray(k.masmorra.salas)) return false; const f = foto(k, null, { ...k.masmorra, atual: 1 }); return !igual([f.ret, f.msgs], [fotos[i].ret, fotos[i].msgs]); }).length;
  t(`morde: na sala de entrada em vez da do chefe, ${sala} fotos divergem (as que concluíam)`, sala === concluiu);
  t("no App, o órgão é o invólucro da peça", /const concluirMasmorraDoChefe = \(p2, msgs\) => \{\s*const r = concluirAMasmorra\(p2, \{ masmorra: masmorraRef\.current, mapa: mapaRef\.current, base: baseMundoRef\.current \}, \{ lexico: \(mundoAtual\(\) \|\| \{\}\)\.lexico, sorteDoTurno \}\);/.test(C) && /salaEmCursoRef\.current = null;\s*talvezFecharSessao\("chefe"\);\s*return \{ pers: r\.pers, concluiu: true \};/.test(C));
}

sec("4 · a morte de um alvo (registrarMorteDeAlvo → aMorteDoAlvo)");
{
  const fotos = D.orgaos.registrarMorteDeAlvo;
  /* o invólucro do App, à letra: a lei, o registo, e a nêmesis pela porta dela */
  const foto = (k, alvo = k.alvoM, aproximado = k.aproximadoM) => {
    const st = { lei: copia(k.leiM), npcs: copia(k.npcsM), encerradas: [], calados: [] };
    const r = aMorteDoAlvo({ npcs: st.npcs, nemesis: copia(k.nemesisM), lei: st.lei, dia: mundoDaLei(k).dia, ctxDaLei: () => mundoDaLei(k) }, alvo, k.causaM, { aproximado });
    for (const ef of r.efeitos) {
      if (ef.tipo === "lei") st.lei = ef.lei;
      else if (ef.tipo === "calou") st.calados.push(ef.onde);
      else if (ef.tipo === "npcs") st.npcs = ef.npcs;
    }
    if (r.ehNemesis) st.encerradas.push(k.causaM);
    return { ret: r.morreu, lei: st.lei, npcs: st.npcs, encerradas: st.encerradas, calados: st.calados };
  };
  const batem = casos.filter((k, i) => igual(foto(k), fotos[i])).length;
  t(`${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS);
  const morreu = fotos.filter((f) => f.ret).length, nemesis = fotos.filter((f) => f.encerradas.length).length;
  const agravou = fotos.filter((f, i) => JSON.stringify(f.lei).includes('"matar"') && !JSON.stringify(casos[i].leiM).includes('"matar"')).length;
  console.log(`      morreu ${morreu} · a nêmesis encerrada ${nemesis} · o crime agravado para matar ${agravou}`);
  t("percorre os ramos (morreu e não; a nêmesis; o crime que vira matar)", morreu > 50 && morreu < N_CASOS - 50 && nemesis > 10 && agravou > 5);
  /* morde: o nome parecido só vale quando o texto veio do jogador */
  const semAprox = casos.filter((k, i) => k.aproximadoM && !igual(foto(k, k.alvoM, false), fotos[i])).length;
  t(`morde: sem o nome parecido, ${semAprox} fotos divergem`, semAprox > 5);
  const outroAlvo = casos.filter((k, i) => !igual(foto(k, "Ninguém Daqui"), fotos[i])).length;
  t(`morde: com outro alvo, ${outroAlvo} fotos divergem (as que matavam alguém ou agravavam)`, outroAlvo >= morreu);
  t("o nome vazio não mata nem agrava", aMorteDoAlvo({ npcs: { Corvo: {} } }, "   ", "").efeitos.length === 0 && aMorteDoAlvo(null, null).morreu === false);
  t("no App, o órgão é o invólucro da peça", /const registrarMorteDeAlvo = \(nome, causa, \{ aproximado = false \} = \{\}\) => \{\s*const r = aMorteDoAlvo\(\{/.test(C) && /if \(r\.ehNemesis\) encerrarNemesis\(causa\);\s*return r\.morreu;/.test(C));
}

sec("5 · a nêmesis que surge (tentarSurgirNemesis → surgirANemesis)");
{
  const fotos = D.orgaos.tentarSurgirNemesis;
  /* o invólucro do App, à letra: o calou do fio, a nêmesis, a nota, as conquistas */
  const foto = (k, sorte, nemesis = k.nemesisM) => {
    const calados = [];
    let conquistas = 0, nem = copia(nemesis), nota = k.notaAntes;
    const r = surgirANemesis({
      nemesis: nem, fama: k.fama, contadores: copia(k.contN), mapa: copia(k.mapaN), moedas: k.pers.moedas || 0, dia: 1 + (k.i % 9), espinha: copia(k.espinhaN),
      derrotados: () => { if (k.derrotadosN === "estoura") throw new Error("mundoDasMissoes estourou"); return k.derrotadosN; },
      genero: k.semente.split("|")[1], lexico: null,
    }, { sorteDoTurno: sorte || sorteDoCaso(k) });
    for (const ef of r.efeitos) if (ef.tipo === "calou") calados.push(ef.onde);
    if (r.nemesis) { nem = r.nemesis; nota = notaComOTurno(nota, r.paraOCronista); conquistas++; }
    return { ret: null, nemesis: nem, nota, calados, conquistas };
  };
  const batem = casos.filter((k, i) => igual(foto(k), fotos[i])).length;
  t(`${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS);
  const surgiu = fotos.filter((f) => f.conquistas).length, doFio = fotos.filter((f) => f.conquistas && /Morvane|Fome/.test((f.nemesis || {}).nome || "")).length, calou = fotos.filter((f) => f.calados.length).length;
  console.log(`      surgiu ${surgiu} · com o nome do fio ${doFio} · o fio calou ${calou}`);
  t("percorre os ramos (surgiu e não; do fio e não; a rede do fio)", surgiu > 20 && doFio > 5 && doFio < surgiu && calou > 0);
  const outra = casos.filter((k, i) => !igual(foto(k, sorteDoCaso(casos[(i + 1) % N_CASOS])), fotos[i])).length;
  t(`morde: com a sorte de outro caso, ${outra} fotos divergem`, outra > 20);
  const viva = casos.filter((k, i) => !igual(foto(k, null, { nome: "Alguém", status: "ativa" }).conquistas, fotos[i].conquistas)).length;
  t(`morde: com uma nêmesis viva, ninguém surge (${viva} fotos divergem, as que surgiam)`, viva === surgiu);
  t("no App, o órgão é o invólucro da peça", /const tentarSurgirNemesis = \(\) => \{\s*const r = surgirANemesis\(\{/.test(C) && /if \(!r\.nemesis\) return;\s*nemesisRef\.current = r\.nemesis; setNemesis\(r\.nemesis\);\s*notaRef\.current = notaComOTurno\(notaRef\.current, r\.paraOCronista\);\s*checarConquistas\(\);/.test(C));
}

sec("6 · a porta única de abrir combate (abrirCombate → abrirOCombate)");
{
  const fotos = D.orgaos.abrirCombate;
  /* o invólucro do App, à letra: a marca do território, a planta (com a
     rede do lugar dentro), os quatro refs que a luta nova zera, o dia de
     lutas, o combate e o códex publicados, e a presença um tique depois */
  const foto = (k, { sorte, turno = k.turnoA, panteao = k.panteaoA } = {}) => {
    const publicados = [], codex = [], agendas = [], presencas = [], calados = [];
    const pA = k.plantaA, local = localDoCaso(k), cidades = [{ nome: "Vila do Sul", bioma: pA.bioma }];
    const calou = (onde) => calados.push(onde);
    const st = { territorio: "território de antes", combate: copia(k.combateNoRefA), ocioso: 3, reacao: true, expiracoes: 2, diaLuta: copia(k.diaLutaA), descobertas: copia(k.descobertasA) };
    const planta = () => {
      let ondeG = {};
      try { ondeG = { emViagem: !!pA.emViagem, cidade: pA.cidade || "", lugar: copia(pA.lugar) || null }; } catch (e) { calou("o lugar da planta", e); ondeG = {}; }
      return { emMasmorra: !!pA.emMasmorra, ...ondeG, local: local(), bioma: (cidades.find((c) => c.nome === pA.cidade) || {}).bioma || "" };
    };
    let ret = null, erro = null;
    try {
      st.territorio = null;
      const r = abrirOCombate({
        inimigosCrus: copia(k.inimigosA), jaNoRef: k.jaNoRefA, combateNoRef: st.combate, pers: copia(k.persA), situacao: k.situacaoA === undefined ? "cena" : k.situacaoA,
        panteao: copia(panteao), planta, sementeDaAbertura: `${k.semente}|abertura|${turno}`, diaLuta: st.diaLuta, descobertas: st.descobertas,
      }, { sorteDoTurno: sorte || sorteDoCaso(k), calou });
      if (r.abriu) {
        st.combate = r.combateNoRef; st.ocioso = 0; st.reacao = false; st.expiracoes = 0; st.diaLuta = r.diaLuta;
        publicados.push(st.combate);
        if (r.descobertas !== st.descobertas) { st.descobertas = r.descobertas; codex.push(st.descobertas); }
        agendas.push(0);
        presencas.push({ c: st.combate, p: { nome: "a ficha viva" }, o: { contraMim: false } });
      }
      ret = r.saida;
    } catch (e) { erro = String(e && e.message); }
    return fotoCompacta({ ret, erro, territorio: st.territorio, combate: st.combate, ocioso: st.ocioso, reacao: st.reacao, expiracoes: st.expiracoes,
      diaLuta: st.diaLuta, descobertas: st.descobertas, publicados, codex, agendas, presencas, calados });
  };
  const batem = casos.filter((k, i) => igual(foto(k), fotos[i])).length;
  t(`${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS);
  const abriu = fotos.filter((f) => f.nota && f.nota.includes("[INICIATIVA ROLADA")).length, vazias = fotos.filter((f) => f.nota === "").length;
  const gd = fotos.filter((f) => (f.msgs || []).some((m) => m.startsWith("✦"))).length, grandes = fotos.filter((f) => (f.msgs || []).some((m) => m.startsWith("📏"))).length;
  const calou = fotos.filter((f) => f.calados.length).length, estourou = fotos.filter((f) => f.erro).length;
  console.log(`      abriu ${abriu} · ninguém para lutar ${vazias} · o grau divino ${gd} · os grandes ${grandes} · a rede da planta calou ${calou} · estourou ${estourou}`);
  t("percorre os ramos (abriu e não; o deus; os grandes; a rede; o erro que sobe)", abriu > 150 && vazias > 20 && gd > 5 && grandes > 20 && calou > 5 && estourou > 0);
  /* morde: com a sorte de outro caso, a ordem da iniciativa muda */
  const outra = casos.filter((k, i) => !igual(foto(k, { sorte: sorteDoCaso(casos[(i + 1) % N_CASOS]) }), fotos[i])).length;
  t(`morde: com a sorte de outro caso, ${outra} fotos divergem`, outra > 100);
  /* morde: noutro turno, a semente da abertura põe as casas noutro sítio */
  const turno = casos.filter((k, i) => !igual(foto(k, { turno: k.turnoA + 100 }), fotos[i])).length;
  t(`morde: noutro turno, ${turno} fotos divergem`, turno > 100);
  /* morde: sem o panteão, o deus que estava nele deixa de ser de outra grandeza */
  const semPanteao = casos.filter((k, i) => k.panteaoA.length && !igual(foto(k, { panteao: [] }), fotos[i])).length;
  t(`morde: sem o panteão, ${semPanteao} fotos divergem`, semPanteao > 5);
  /* (movido de check-passo-na-rodada §1, 6.ª fatia: o literal `const novo =
     { ...comb, ... economia: economiaNova(pers) }` saiu do App com o
     equipamento; a intenção — a luta NASCE com economia, e não a herda da
     luta anterior — passa a ser jogada na peça) */
  {
    let nasceu = 0, rancosa = 0, todas = true;
    for (const k of casos) {
      if (k.plantaA.estoura === "sempre") continue;
      const r = abrirOCombate({ inimigosCrus: k.inimigosA, jaNoRef: k.jaNoRefA, combateNoRef: k.combateNoRefA, pers: k.persA, situacao: k.situacaoA, panteao: [], planta: { local: "a praça" }, sementeDaAbertura: k.semente, diaLuta: null, descobertas: [] }, { sorteDoTurno: sorteDoCaso(k) });
      if (!r.abriu) continue;
      nasceu++;
      if (k.jaNoRefA) rancosa++;
      if (!(igual(r.combateNoRef.economia, economiaNova(r.saida.pers)) && r.combateNoRef.rodada === 1)) todas = false;
    }
    t(`a luta nasce com a economia da rodada 1 (${nasceu} aberturas, ${rancosa} retomadas com a economia rançosa)`, todas && nasceu > 150 && rancosa > 10);
  }
  /* (movido de teste-abertura-no-app §1, 6.ª fatia: a assinatura de
     `montarGrid` e o literal de `posicionar` saíram do App; a intenção — a
     situação chega a `posicionar`, e a casa sai da semente do mundo e do
     turno — passa a ser jogada: a peça abre onde a conta à mão abre) */
  {
    let iguais = 0, n = 0;
    for (const sit of ["declarada", "emboscada", "cena", "torta", null]) {
      for (let turno = 0; turno < 12; turno++) {
        const pers = { nome: "Vera", nivel: 3, atributos: { destreza: 1 } };
        const sem = `Vera|Fantasia|abertura|${turno}`;
        const r = abrirOCombate({ inimigosCrus: [{ nome: "Lobo" }, { nome: "Lobo" }], pers, situacao: sit, planta: { local: "estrada" }, sementeDaAbertura: sem }, { sorteDoTurno: sorteDoCaso(casos[turno]) });
        const g = montarGrade({ local: "estrada" });
        const p = posicionar(g, { heroi: { nome: "Vera", tamanho: "medio" }, grupo: [], inimigos: r.saida.combate.inimigos.map((e) => ({ ...e, x: undefined, y: undefined })), situacao: typeof sit === "string" && sit ? sit : "cena", sorte: rng(hashSemente(sem)) });
        n++;
        if (igual(r.saida.combate.heroi, p.heroi)) iguais++;
      }
    }
    t(`a situação e a semente da abertura chegam a posicionar (${iguais}/${n} heróis na casa da conta à mão)`, iguais === n);
  }
  t("não muta o que entra (a ficha, a luta no ref, o códex, o dia)", (() => {
    const k = casos.find((x) => x.jaNoRefA && x.combateNoRefA && x.combateNoRefA.inimigos.length && x.descobertasA.length && x.diaLutaA && !x.plantaA.estoura);
    const ent = { pers: copia(k.persA), combateNoRef: copia(k.combateNoRefA), descobertas: copia(k.descobertasA), diaLuta: copia(k.diaLutaA) };
    const antes = copia(ent);
    const r = abrirOCombate({ ...ent, jaNoRef: true, planta: { local: "a praça" }, sementeDaAbertura: k.semente }, { sorteDoTurno: sorteDoCaso(k) });
    return r.abriu && igual(ent, antes);
  })());
  t("sem ninguém para lutar, devolve a ficha como veio e nada se escreve", (() => {
    const p = { nome: "Vera" };
    const r = abrirOCombate({ inimigosCrus: [], pers: p }, {});
    return !r.abriu && r.saida.pers === p && r.saida.nota === "" && r.saida.msgs.length === 0 && !("combate" in r.saida) && abrirOCombate(null, null).abriu === false;
  })());
  t("no App, o órgão é o invólucro da peça", /const abrirCombate = \(inimigosCrus, \{ pers: persEntra = null, jaNoRef = false, situacao = "cena" \} = \{\}\) => \{\s*territorioEmLutaRef\.current = null;\s*const r = abrirOCombate\(\{/.test(C)
    && /\}, \{ sorteDoTurno, calou \}\);\s*if \(!r\.abriu\) return r\.saida;\s*combateRef\.current = r\.combateNoRef;\s*combateOciosoRef\.current = 0;\s*reacaoUsadaRef\.current = false;\s*expiracoesSeguidasRef\.current = 0;\s*diaLutaRef\.current = r\.diaLuta;\s*setCombate\(combateRef\.current\);/.test(C)
    && /setTimeout\(\(\) => presencaNaLuta\(combateRef\.current, personagemRef\.current, \{ contraMim: false \}\), 0\);\s*return r\.saida;/.test(C));
  t("e a semente da abertura é a do mundo e do turno, com a planta do App", /sementeDaAbertura: `\$\{sementeMundo\(\)\}\|abertura\|\$\{turnoDeRegistroRef\.current\}`/.test(C) && /planta: plantaDaLuta,/.test(C) && /const plantaDaLuta = \(\) => \{/.test(C));
  t("o equipamento, o tabuleiro e a economia não moram mais no App", !/const (equiparCombate|montarGrid|economiaNova|temAcaoBonus) =/.test(C));
}

sec("7 · o contador das façanhas (bumpCont → somarAoContador)");
{
  const fotos = D.orgaos.bumpCont;
  const foto = (k, campo = k.campoB, n = k.nB) => ({ cont: n === undefined ? somarAoContador(copia(k.contN), campo) : somarAoContador(copia(k.contN), campo, n) });
  const batem = casos.filter((k, i) => igual(foto(k), fotos[i])).length;
  t(`${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS);
  const outro = casos.filter((k, i) => !igual(foto(k, "outroCampo"), fotos[i])).length;
  t(`morde: noutro campo, ${outro} fotos divergem`, outro === N_CASOS);
  const nada = casos.filter((k, i) => k.nB !== 0 && !igual(foto(k, k.campoB, 0), fotos[i])).length;
  t(`morde: somando zero, ${nada} fotos divergem (as que somavam)`, nada === casos.filter((k) => k.nB !== 0).length);
  t("não muta os contadores", (() => { const c = { a: 1 }; const n = somarAoContador(c, "a", 2); return c.a === 1 && n.a === 3 && n !== c; })());
  t("no App, o órgão é o invólucro da peça", /const bumpCont = \(campo, n = 1\) => \{ contRef\.current = somarAoContador\(contRef\.current, campo, n\); \};/.test(C));
}

sec("8 · o vínculo (aplicarVinculo → osVinculos)");
{
  const fotos = D.orgaos.aplicarVinculo;
  /* o invólucro do App, à letra: a linha no turno ou na tela, e a nota de cada marco */
  const foto = (k, pontos = k.pontosV, quem = k.quemV) => {
    const tela = [];
    const msgs = k.noTurnoV ? [] : null;
    let nota = k.notaAntes;
    const r = osVinculos(copia(k.grupoV), quem, pontos);
    for (const m of r.marcos) {
      if (msgs) msgs.push(m.linha); else tela.push([{ autor: "sistema", texto: m.linha }]);
      nota = notaComOTurno(nota, [m.nota]);
    }
    return { ret: r.grupo, msgs, tela, nota };
  };
  const batem = casos.filter((k, i) => igual(foto(k), fotos[i])).length;
  t(`${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS);
  const marcos = fotos.filter((f) => (f.msgs && f.msgs.length) || f.tela.length).length;
  console.log(`      um marco cruzado em ${marcos}`);
  t("percorre os ramos (marco e não; no turno e na tela)", marcos > 30 && marcos < N_CASOS - 30 && fotos.some((f) => f.tela.length) && fotos.some((f) => f.msgs && f.msgs.length));
  const outro = casos.filter((k, i) => !igual(foto(k, k.pontosV + 7), fotos[i])).length;
  t(`morde: com outros pontos, ${outro} fotos divergem`, outro > 50);
  t("no App, o órgão é o invólucro da peça", /const aplicarVinculo = \(grupo, nomeOuTodos, pontos, msgs\) => \{\s*const r = osVinculos\(grupo, nomeOuTodos, pontos\);\s*for \(const m of r\.marcos\) \{\s*if \(msgs\) msgs\.push\(m\.linha\); else pushMsgs\(\[\{ autor: "sistema", texto: m\.linha \}\]\);\s*notaRef\.current = notaComOTurno\(notaRef\.current, \[m\.nota\]\);\s*\}\s*return r\.grupo;/.test(C));
}

sec("9 · o fecho notado (notarFechoDaLuta → notarOFecho)");
{
  const fotos = D.orgaos.notarFechoDaLuta;
  const idsDoChao = (c) => (((c && c.itens) || []).map((it) => it && it.id).filter(Boolean));
  /* o invólucro do App, à letra */
  const foto = (k, args = k.argsF) => {
    const calados = [];
    const st = { luta: copia(k.lutaDoReciboF), fecho: copia(k.fechoDaLutaF), retrato: "retrato de antes" };
    try {
      const r = notarOFecho({ lutaDoRecibo: st.luta, fechoDaLuta: st.fecho, retratoDoFim: st.retrato, fichaViva: copia(k.fichaVivaF), idsNoChao: idsDoChao(copia(k.chaoF)), inicio: k.mensagensF + ((k.seguraF || []).length) }, args === undefined ? undefined : copia(args));
      st.luta = r.lutaDoRecibo; st.fecho = r.fechoDaLuta; st.retrato = r.retratoDoFim;
    } catch (e) { calados.push("notar o fecho da luta"); }
    return { luta: st.luta, fecho: st.fecho, retrato: st.retrato, calados };
  };
  const batem = casos.filter((k, i) => igual(foto(k), fotos[i])).length;
  t(`${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS);
  const criou = fotos.filter((f, i) => !casos[i].lutaDoReciboF && !casos[i].fechoDaLutaF).length, noFecho = fotos.filter((f, i) => !casos[i].lutaDoReciboF && casos[i].fechoDaLutaF).length;
  console.log(`      a luta nasceu no fecho ${criou} · o fecho por fechar ${noFecho}`);
  t("percorre os ramos (a luta aberta, o fecho, a luta que nasce)", criou > 20 && noFecho > 20);
  const outro = casos.filter((k, i) => !igual(foto(k, { desfecho: "derrota", caidos: ["Outro"] }), fotos[i])).length;
  t(`morde: com outro desfecho e outros caídos, ${outro} fotos divergem`, outro > 200);
  t("no App, o órgão é o invólucro da peça", /const notarFechoDaLuta = \(\{ combate: c = null, desfecho = null, caidos = null, linha = null \} = \{\}\) => \{\s*try \{\s*const r = notarOFecho\(\{/.test(C) && /lutaDoReciboRef\.current = r\.lutaDoRecibo; fechoDaLutaRef\.current = r\.fechoDaLuta; retratoDoFimRef\.current = r\.retratoDoFim;\s*\} catch \(e\) \{ calou\("notar o fecho da luta", e\); \}/.test(C));
}

sec("10 · o que a luta leva quando acaba (limparConjuracoesDaLuta → limparAsConjuracoes)");
{
  const fotos = D.orgaos.limparConjuracoesDaLuta;
  /* o invólucro do App, à letra: a ficha dada ou a do ref, a tela, a nota, a ficha */
  const foto = (k, pers = k.persL) => {
    const tela = [], publicados = [], calados = [];
    let ficha = k.persLNoRef ? copia(pers) : { nome: "a ficha do ref", grupo: [] }, nota = k.notaAntes, ret = null, erro = null;
    try {
      const p0 = (k.persLNoRef ? null : copia(pers)) || ficha;
      if (!p0) ret = p0;
      else {
        const r = limparAsConjuracoes(p0, { calou: (onde) => calados.push(onde) });
        for (const linhas of r.telas) tela.push(linhas.map((texto) => ({ autor: "sistema", texto })));
        nota = notaComOTurno(nota, r.paraOCronista);
        if (r.mudou) { ficha = r.pers; publicados.push(r.pers); }
        ret = r.pers;
      }
    } catch (e) { erro = String(e && e.message); }
    return { ret: ret === undefined ? null : ret, erro, tela, nota, ficha, publicados, calados };
  };
  /* UMA DIFERENÇA DECLARADA, e é a única: quando o grupo não é uma lista
     (o grupo torto), `dispensarTodas` estoura no fim. O App de antes já
     tinha posto na tela a forma e a guarda que desfez, e depois o erro
     subia; a peça é tudo ou nada — o erro sobe igual, e nada ficou escrito
     pela metade. Nos outros casos, byte a byte.
     Até 28/10 estouravam 21: os 12 do grupo torto e 9 com um membro NULO
     no grupo e uma invocação. Esses 9 eram defeito do `dispensarTodas`
     (o segundo filtro lia `null.invocada`), consertado na trilha B da
     Fase T; o dourado foi refeito com o conserto, e os 9 passaram a ser
     fotos que dispensam a invocação e guardam o nulo onde estava. */
  const comErro = casos.filter((k, i) => fotos[i].erro);
  const batem = casos.filter((k, i) => !fotos[i].erro && igual(foto(k), fotos[i])).length;
  t(`${batem}/${N_CASOS - comErro.length} iguais ao App de antes (os que não estouram)`, batem === N_CASOS - comErro.length);
  const tudoOuNada = comErro.filter((k) => { const f = foto(k), i = k.i; return f.erro === fotos[i].erro && !f.tela.length && f.nota === k.notaAntes && !f.publicados.length; }).length;
  t(`e os ${comErro.length} que estouram estouram com o mesmo erro, sem nada escrito pela metade (${fotos.filter((f) => f.erro && f.tela.length).length} deles o App de antes deixava na tela)`, tudoOuNada === comErro.length && comErro.length > 0);
  const forma = fotos.filter((f) => f.tela.some((l) => /se desfaz — você volta/.test(l[0].texto))).length, inv = fotos.filter((f) => /INVOCAÇÕES ENCERRADAS/.test(f.nota || "")).length;
  const grupo = fotos.filter((f) => f.tela.some((l) => l.some((x) => /^🛡 Brás ·/.test(x.texto)))).length, nada = fotos.filter((f) => !f.erro && !f.publicados.length).length, erro = fotos.filter((f) => f.erro).length;
  console.log(`      a forma ${forma} · as invocações ${inv} · a guarda do grupo ${grupo} · nada a levar ${nada} · o grupo torto estoura ${erro}`);
  t("percorre os ramos (a forma, a guarda, a do grupo, a pressa, as invocações, nada, o erro)", forma > 20 && inv > 20 && grupo > 20 && nada > 10 && erro > 0);
  const semNada = casos.filter((k, i) => !igual(foto(k, { nome: "Vera", grupo: [] }), fotos[i])).length;
  t(`morde: com uma ficha sem nada a levar, ${semNada} fotos divergem`, semNada > 150);
  t("não muta a ficha que entra", (() => { const k = casos.find((x, i) => fotos[i].publicados.length && !x.persLNoRef); const p = copia(k.persL); limparAsConjuracoes(p, {}); return igual(p, k.persL); })());
  t("no App, o órgão é o invólucro da peça", /const limparConjuracoesDaLuta = \(persBase\) => \{\s*const p0 = persBase \|\| personagemRef\.current \|\| personagem;\s*if \(!p0\) return p0;\s*const r = limparAsConjuracoes\(p0, \{ calou \}\);\s*for \(const linhas of r\.telas\) pushMsgs\(linhas\.map\(\(texto\) => \(\{ autor: "sistema", texto \}\)\)\);\s*notaRef\.current = notaComOTurno\(notaRef\.current, r\.paraOCronista\);\s*if \(r\.mudou\) \{ personagemRef\.current = r\.pers; setPersonagem\(r\.pers\); \}\s*return r\.pers;/.test(C));
}

sec("11 · o rito do deicídio (abrirRitoAscensao → oRitoDoDeicidio)");
{
  const fotos = D.orgaos.abrirRitoAscensao;
  const agora = Date.now;
  Date.now = () => AGORA_DA_PROVA;
  /* o invólucro do App, à letra */
  const foto = (k, alvo = k.alvoR) => {
    const tela = [], publicadas = [], salvos = [];
    let dv = copia(k.divindadeR), nota = k.notaAntes;
    const nv = k.nivelR || (({ nome: "Vera", nivel: k.nivelFichaR }) || {}).nivel || 1;
    const r = oRitoDoDeicidio(dv, copia(alvo), nv);
    if (r.aberto) { dv = r.divindade; publicadas.push(r.divindade); }
    for (const linhas of r.telas) tela.push(linhas.map((texto) => ({ autor: "sistema", texto })));
    if (r.aberto) { nota = notaComOTurno(nota, r.paraOCronista); salvos.push({ divindade: r.divindade }); }
    return { ret: null, divindade: dv, publicadas, tela, nota, salvos };
  };
  const batem = casos.filter((k, i) => igual(foto(k), fotos[i])).length;
  t(`${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS);
  const aberto = fotos.filter((f) => f.salvos.length).length;
  console.log(`      o rito abriu em ${aberto} · fechou (com o porquê) em ${N_CASOS - aberto}`);
  t("percorre os ramos (abre e não)", aberto > 20 && aberto < N_CASOS - 20);
  const fraco = casos.filter((k, i) => !igual(foto(k, { ...k.alvoR, gd: 0 }), fotos[i])).length;
  t(`morde: com um deus de grau zero, ${fraco} fotos divergem (as que abriam, e o porquê das outras)`, fraco >= aberto && fraco > 20);
  Date.now = agora;
  t("no App, o órgão é o invólucro da peça", /const abrirRitoAscensao = \(alvo, nivelHeroi\) => \{\s*const nv = nivelHeroi \|\| \(personagemRef\.current \|\| personagem \|\| \{\}\)\.nivel \|\| 1;\s*const r = oRitoDoDeicidio\(divindadeRef\.current, alvo, nv\);\s*if \(r\.aberto\) \{ divindadeRef\.current = r\.divindade; setDivindade\(r\.divindade\); \}\s*for \(const linhas of r\.telas\) pushMsgs\(linhas\.map\(\(texto\) => \(\{ autor: "sistema", texto \}\)\)\);\s*if \(!r\.aberto\) return;\s*notaRef\.current = notaComOTurno\(notaRef\.current, r\.paraOCronista\);\s*salvar\(\{ divindade: r\.divindade \}\);/.test(C));
}

console.log(`\nmotor · os órgãos do combate: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
