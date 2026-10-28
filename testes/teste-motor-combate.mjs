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
import { despertarUnica, aFamaDoFeito } from "../src/motor/combate-do-turno.js";
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

console.log(`\nmotor · os órgãos do combate: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
