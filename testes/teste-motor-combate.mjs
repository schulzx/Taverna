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
import { mundoDaLei } from "./combate-casos.mjs";
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

console.log(`\nmotor · os órgãos do combate: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
