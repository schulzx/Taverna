/* ============================================================
   O PRELÚDIO DO TURNO, NO MOTOR (Fase 4, trilha B, 29/10/2026) — testes/teste-motor-preludio-do-turno.mjs

   O trecho de `enviar` que vem ANTES do pedido ao Narrador — da frase que é
   pedido meu às bocas: o chão, a oficina, a chegada, a cidade, a escuta, o
   compasso, a forma da cena, a frente, a virada, a trama, o ato, o
   Intérprete, os propósitos, as cinco mãos e as falas — ganhou peça em
   src/motor/preludio-do-turno.js: `oPreludioDoTurno(estado, entrada,
   portas)`. É o que produz as onze entradas de `ENTRADA_DO_PEDIDO`, e com
   ela o pedido inteiro monta-se em Node a partir de { estado, frase }.

   Aqui a peça é provada contra o recorte à letra do App
   (`preludio-dourado.json`, de `gerar-preludio-dourado.mjs`) sobre os 275
   casos do pedido e os montados de `preludio-bloco.mjs` (os que andam o
   mundo: a oficina, o compasso, a forma, a frente, a virada, a caçada, a
   trama): o que o pedido lê dela, os refs do fim e a ordem das portas
   (com a foto dos refs no instante de cada `pushMsgs` e de cada `salvar`).
   E a CADEIA: esta peça e a do pedido encadeadas contra os dois recortes
   nos mesmos refs — o pedido à rede byte a byte. A prova tem de morder, e
   o escopo do recorte acusa todo nome sem dublê. A suíte não lê o texto
   de src/motor/ (a catraca teste-assercoes-de-texto): a peça prova-se
   jogando.
   ============================================================ */
import { semCena, soACena } from "./s4c-normal.mjs";
import { lerODourado, lerOPedido, correrOsCasos, casosDoPreludio, fotoGuardada, mesmaFoto, correrAsCadeias, cadeiaGuardada, mesmaCadeia, N_CASOS, N_PRELUDIO, osModulos, osPadroes } from "./preludio-bloco.mjs";
import { oPreludioDoTurno, REFS_DO_PRELUDIO, RENDER_DO_PRELUDIO, SAIDA_DO_PRELUDIO, PORTAS_DO_PRELUDIO } from "../src/motor/preludio-do-turno.js";
import { oPedidoDoTurno, ENTRADA_DO_PEDIDO } from "../src/motor/pedido-do-turno.js";
import { BOCAS_POR_TURNO } from "../src/falas.js";
import { rng, hashSemente, semearACasa } from "../src/semente.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const D = lerODourado();
const DP = lerOPedido();
const CASOS = casosDoPreludio();
const conta = (fotos, casos = CASOS) => fotos.reduce((a, f, j) => a + (mesmaFoto(fotoGuardada(f, casos[j].i), D.fotos[casos[j].i]) ? 1 : 0), 0);
const diferem = (fotos, casos) => casos.length - conta(fotos, casos);

sec("1. O dourado: o recorte à letra, e o recorte de novo dá as mesmas fotos");
const R = await correrOsCasos(D, { lado: "recorte" });
t(`o dourado tem as ${N_PRELUDIO} fotos (${N_CASOS} do pedido e ${N_PRELUDIO - N_CASOS} montados), de um commit`, D.fotos.length === N_PRELUDIO && N_PRELUDIO > N_CASOS && /^[0-9a-f]{7,}$/.test(D.commit), D.commit);
t("o recorte corre de novo e dá as mesmas fotos (o dourado não é de outra árvore)", conta(R) === N_PRELUDIO, `${conta(R)}/${N_PRELUDIO}`);
t("o escopo do recorte não achou nome sem dublê (faltas: 0)", R.every((f) => f.faltas.length === 0), R.flatMap((f) => f.faltas).slice(0, 5).join());
t("o trecho lê só a frase de `enviar`, e entrega ao pedido as oito que escreve", JSON.stringify(D.entrada) === JSON.stringify(["conteudo"]) && D.saida.length === 8 && D.saida.every((n) => ENTRADA_DO_PEDIDO.includes(n)), D.saida.join());

sec("2. O que os casos percorrem (medido; o mínimo é a régua)");
{
  const n = (campo) => R.filter((f) => f.out && f.out[campo] && (typeof f.out[campo] !== "object" || Object.keys(f.out[campo]).length)).length;
  const MINIMOS = { oficina: 6, doCompasso: 1, formaDaCena: 8, daFrente: 4, daVirada: 12, daTrama: 3, pedidoEsc: 250 };
  for (const [campo, min] of Object.entries(MINIMOS)) t(`${campo} sai em ≥${min} casos (${n(campo)})`, n(campo) >= min);
  t("só os 275 do pedido não andam o mundo: nenhum deles dá oficina, compasso, frente, virada ou trama", R.slice(0, N_CASOS).every((f) => !f.out || !(f.out.oficina || f.out.doCompasso || f.out.daFrente || f.out.daVirada || f.out.daTrama)));
  const portas = R.flatMap((f) => f.portas.map((p) => p[0]));
  for (const p of ["calou", "pushMsgs", "salvar", "setMissoes", "setRaid", "setCombate", "setPersonagem"]) t(`a porta ${p} é vista`, portas.includes(p));
  t(`o que o App adia (o setTimeout da luta que se abre) é visto em ${R.filter((f) => f.nAdiados).length} casos`, R.filter((f) => f.nAdiados).length >= 5);
  t(`com BOCAS_POR_TURNO a ${BOCAS_POR_TURNO}, a rede das bocas não é chamada em caso nenhum`, BOCAS_POR_TURNO === 0 && !portas.includes("chamarModelo"));
  /* os dois sítios do setHistoria que d2d1dcd tirou do App: sem casos que
     lá cheguem, a peça com ou sem o conserto dava as mesmas fotos (medido:
     0 de 327 mudaram ao regenerar o dourado contra o App consertado) */
  const doMontado = (o) => CASOS.map((k, i) => [k, R[i]]).filter(([k]) => k.montado === o);
  const casados = doMontado("o arco casa com o vilão").filter(([k, f]) => !f.erro && f.valores.historia && f.valores.historia.etapa > k.estado.historia.etapa);
  t(`o dia do vilão casa o arco (a etapa anda atrás dele) em ${casados.length} casos, sem estourar`, casados.length >= 4);
  const fechados = doMontado("o fim do capítulo").filter(([, f]) => !f.erro && f.portas.some((p) => p[0] === "setOfertaCapitulo") && ((f.valores.historia || {}).capitulos || []).length === 1);
  t(`a queda confirmada com o arco no fim fecha o capítulo (o registo e a porta) em ${fechados.length} casos, sem estourar`, fechados.length >= 4);
}

sec(`3. A peça contra o recorte: ${N_PRELUDIO}/${N_PRELUDIO}`);
const P = await correrOsCasos(D, { lado: "peca", peca: oPreludioDoTurno });
/* MOVIDA (16/11, S4c — o Narrador obedece à cena), E O MOTIVO: o Intérprete
   do prelúdio (pessoasDaCena) lê agora a conta única de quem está aqui
   (quem-esta-aqui.js#quemAgeAqui): fora dos muros a cidade fica lá, num sítio
   age quem o posto põe nele. O gesto que ele marca (elencoMem), o que entrega
   ao pedido (interprete) e a foto dos refs que o pushMsgs leva mudam DE
   PROPÓSITO onde quem age mudou (testes/s4c-normal.mjs). A régua: onde a cena
   não mudou, a foto do dourado; e nenhuma diferença sem a cena por causa. */
const cenaMudouP = (i) => JSON.stringify(soACena({ r: P[i].refs })) !== JSON.stringify(soACena({ r: R[i].refs })) || JSON.stringify(soACena({ r: P[i].out })) !== JSON.stringify(soACena({ r: R[i].out }));
const restoP = (f) => JSON.stringify(semCena({ o: f.out, r: f.refs, p: f.portas, e: f.erro }));
const daCenaP = P.map((f, i) => i).filter((i) => !mesmaFoto(fotoGuardada(P[i], CASOS[i].i), D.fotos[CASOS[i].i]) && cenaMudouP(i));
const orfaosP = P.map((f, i) => i).filter((i) => !cenaMudouP(i) && restoP(P[i]) !== restoP(R[i]));
console.log(`      à letra: ${conta(P)}; a cena mudou em ${daCenaP.length}; diferença sem a cena por causa: ${orfaosP.length}`);
t(`peça = recorte onde a cena não mudou (${conta(P)} + ${daCenaP.length} da cena = ${N_PRELUDIO}) — a entrada do pedido, os refs do fim, as portas e os refs que cada uma viu`, conta(P) + daCenaP.length === N_PRELUDIO);
t("S4c: nenhuma diferença fora da cena sem a cena ter mudado", orfaosP.length === 0, orfaosP.slice(0, 5).join(","));
t("os que estouram estouram igual (e entregam ao App o que já tinham escrito)", P.every((f, i) => (f.erro === null) === (D.fotos[i].erro === null) && (!f.erro || f.aplicados.length > 0)));
const asOnze = (xs) => JSON.stringify([...xs].sort());
t("a entrada do pedido tem as chaves de ENTRADA_DO_PEDIDO, nem uma a mais", P.filter((f) => f.ret).every((f) => asOnze(Object.keys(f.ret.entradaDoPedido)) === asOnze(ENTRADA_DO_PEDIDO)) && asOnze(SAIDA_DO_PRELUDIO) === asOnze(ENTRADA_DO_PEDIDO));

sec("4. A cadeia: o prelúdio e o pedido, encadeados, dão o pedido à rede dos dois recortes");
{
  const C = await correrAsCadeias([D, DP], { lado: "peca", pecas: [oPreludioDoTurno, oPedidoDoTurno] });
  /* MOVIDA (16/11, S4 — a cena verdadeira), E O MOTIVO: o pedido da cadeia
     monta a pauta, e a pauta lê agora quem-esta-aqui.js (fora dos muros a
     cidade fica lá; no sítio, quem a ficha põe noutro posto está lá). Nos
     casos com a jornada aberta ou um sítio, a linha EM CENA e os refs que a
     lista alimenta mudam DE PROPÓSITO: compara-se com a cadeia dos recortes
     corrida agora, o pedido à rede sem a linha EM CENA, as portas e o erro
     (os refs e a saída vão por impressão digital e levam a lista dentro).
     Nos outros, o dourado byte a byte, como sempre (a régua de
     teste-motor-pedido-do-turno §2). */
  const DE_S4 = (i) => !!(CASOS[i] && CASOS[i].estado && (CASOS[i].estado.jornada || CASOS[i].estado.lugar));
  const semS4 = (v) => typeof v === "string" ? v.split("\n").filter((l) => !/^EM CENA\s/.test(l)).join("\n") : Array.isArray(v) ? v.map(semS4) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, semS4(x)])) : v;
  const idxS4 = CASOS.map((k, i) => i).filter(DE_S4);
  const RS4 = await correrAsCadeias([D, DP], { lado: "recorte", casos: idxS4.map((i) => CASOS[i]) });
  const recS4 = new Map(idxS4.map((i, j) => [i, RS4[j]]));
  const iguaisS4 = (f, r) => JSON.stringify(semS4(f.redeInteira)) === JSON.stringify(semS4(r.redeInteira)) && f.portas === r.portas && f.erro === r.erro;
  /* S4c: a cadeia leva o Intérprete do prelúdio e a pauta do pedido — onde a
     cena de um dos dois mudou (§3 e teste-motor-pedido-do-turno §2), a cadeia
     muda com ela: o recorte corre de novo nesses casos, e a diferença tem de
     ter a cena por causa (o Intérprete, as secções da cena na mensagem, ou o
     system cujo módulo da gente segue quem age aqui) */
  const igualDeSempre = (i) => (DE_S4(i) ? iguaisS4(C[i], recS4.get(i)) : mesmaCadeia(cadeiaGuardada(C[i]), D.cadeias[i]));
  const falham = C.map((f, i) => i).filter((i) => !igualDeSempre(i));
  const RF = await correrAsCadeias([D, DP], { lado: "recorte", casos: falham.map((i) => CASOS[i]) });
  const msgs = (f) => (f && Array.isArray(f.redeInteira) && Array.isArray(f.redeInteira[1]) ? f.redeInteira[1].map((m) => String(m && m.content)).join("\n") : "");
  const sys = (f) => (f && Array.isArray(f.redeInteira) ? JSON.stringify(f.redeInteira[0]) : "");
  const daCenaC = [], orfaosC = [];
  falham.forEach((i, j) => {
    const r = RF[j];
    const cena = cenaMudouP(i) || JSON.stringify(soACena({ t: msgs(C[i]) })) !== JSON.stringify(soACena({ t: msgs(r) })) || sys(C[i]) !== sys(r);
    if (cena) daCenaC.push(i); else orfaosC.push(i);
  });
  const iguais = N_PRELUDIO - falham.length + daCenaC.length;
  console.log(`      a cadeia: ${N_PRELUDIO - falham.length} à régua de sempre, ${daCenaC.length} pela cena, ${orfaosC.length} sem causa`);
  t(`peças encadeadas = recortes encadeados em ${iguais}/${N_PRELUDIO} — o pedido à rede byte a byte, a saída, os refs do fim e as portas (onde a cena não mudou)`, iguais === N_PRELUDIO, orfaosC.slice(0, 5).join(","));
  const comRede = C.filter((f) => f.redeInteira);
  t("o pedido chega à rede em quase todos (os que estouram são o lixo, a ficha torta e o mapa sem cidades)", comRede.length >= N_PRELUDIO - 20 && D.cadeias.filter((f) => f.rede).length === comRede.length, `${comRede.length}/${N_PRELUDIO}`);
  t("o dourado da cadeia é do mesmo pedido que o pedido-dourado.json prova", D.commitDoPedido === DP.commit, `${D.commitDoPedido} / ${DP.commit}`);
  const mont = CASOS.map((k, i) => [k, C[i]]).filter(([k, f]) => k.montado && f.redeInteira);
  const envia = (campo, cab) => mont.filter(([k, f]) => String(f.redeInteira[1][f.redeInteira[1].length - 1].content).includes(cab)).length;
  t("o que o prelúdio escreve chega ao Narrador: a oficina, a frente, a virada (nos montados)", envia("oficina", "[TRABALHO DE BASTIDOR") >= 3 && envia("daFrente", "[A FRENTE") + envia("daFrente", "FRENTE") >= 1 && envia("daVirada", "[A MISSÃO VIRA") >= 3,
    `${envia("oficina", "[TRABALHO DE BASTIDOR")} ${envia("daFrente", "FRENTE")} ${envia("daVirada", "[A MISSÃO VIRA")}`);
  /* a mesma semente nas duas peças dá o mesmo pedido, e outra semente pode dar outro */
  const k = CASOS[N_CASOS + 20];
  const umaVolta = async (s) => (await correrAsCadeias([D, DP], { lado: "peca", pecas: [(e, x, p) => oPreludioDoTurno(e, { ...x, sorte: rng(hashSemente(s)) }, p), oPedidoDoTurno], casos: [k] }))[0];
  const a = await umaVolta("cadeia-1"), b = await umaVolta("cadeia-1");
  t("a mesma semente dá o mesmo pedido, byte a byte", a.rede && a.rede === b.rede && a.refs === b.refs);
}

sec("5. A prova morde: o recorte mordido muda fotos");
const MORDIDAS_DO_RECORTE = [
  ["o envelope do sistema conta como pedido meu", 'ultimoPedidoRef.current = String(conteudo || "").trimStart().startsWith("[") ? "" : String(conteudo || "");', 'ultimoPedidoRef.current = String(conteudo || "");'],
  ["o chão que não se varre", "varrerChao();   //", "void 0;   //"],
  ["a oficina que não se esvazia", "if (oficina) oficinaRef.current = criarOficina();", "if (false) oficinaRef.current = criarOficina();"],
  ["a escuta sem o pedido", "pedidoEsc = doPedido.pedido;", "pedidoEsc = null;"],
  ["o compasso que não segura na escuta", "{ segurar: segurarEsc }", "{ segurar: false }"],
  ["a forma que não cede ao compasso", 'const formaDaCena = doCompasso || segurarEsc ? "" :', 'const formaDaCena = false ? "" :'],
  ["a frente parada", 'startsWith("[RAID") ? "" : rodarAFrente();', 'startsWith("[RAID") ? "" : "";'],
  ["a trama no turno da virada", 'const daTrama = daVirada ? "" :', 'const daTrama = false ? "" :'],
  ["a virada que não abre a luta", 'const ab = abrirCombate(inimigos, { pers: personagemRef.current, situacao: "emboscada" });', 'const ab = { msgs: [], pers: null, nota: "" };'],
  ["o ato sem a frase", "atoDoTurnoRef.current = atoDoTexto(conteudo);", 'atoDoTurnoRef.current = atoDoTexto("");'],
  ["a ação inteira", "ultimaAcaoRef.current = String(conteudo || \"\").slice(0, 200);", "ultimaAcaoRef.current = String(conteudo || \"\").slice(0, 20);"],
  ["as marcas que não marcam", "for (const m of interpreteRef.current.marcas)", "for (const m of [])"],
  ["os propósitos sem a frase", "propositosDoTurnoRef.current = dispararPropositos(conteudo);", 'propositosDoTurnoRef.current = dispararPropositos("");'],
  ["o encalhe parado", "    mexerNoEncalhe();\n", "    void 0;\n"],
  ["a postura parada", "    mexerNaPostura();\n", "    void 0;\n"],
  ["a reviravolta parada", "    mexerNaReviravolta();\n", "    void 0;\n"],
  ["as bocas pagas", "const escolhidos = bocasDoTurno(mov, { conteudo });", "const escolhidos = bocasDoTurno(mov, { conteudo, bocas: 2 });"],
  /* o nome sem dono de volta (o defeito de antes de d2d1dcd): o escopo acusa-o, e o turno que lá chega estoura */
  ["o setHistoria de volta no arco casado", "historiaRef.current = casou.historia;", "historiaRef.current = casou.historia; setHistoria(casou.historia);"],
  ["o setHistoria de volta no fim do capítulo", "historiaRef.current = fc.historia;", "historiaRef.current = fc.historia; setHistoria(fc.historia);"],
];
const MORDEU_R = {};
for (const [nome, de, para] of MORDIDAS_DO_RECORTE) {
  const fotos = await correrOsCasos(D, { lado: "recorte", trocas: [[de, para]] });
  const d = diferem(fotos, CASOS);
  MORDEU_R[nome] = d;
  t(`mordida: ${nome} — muda ${d} fotos`, d > 0);
}

sec("6. A prova vê o que a peça promete (chamada e escopo, sem ler o texto dela)");
{
  /* MOVIDA (16/11, S4c), E O MOTIVO: a variante compara-se com a peça de
     hoje, não com o dourado — o dourado é o recorte de antes do S4c, e a peça
     já difere dele onde a cena mudou (§3); a pergunta aqui é só se a variante
     muda a foto da peça */
  const fotoDaPeca = new Map(CASOS.map((k, i) => [k, JSON.stringify(fotoGuardada(P[i], k.i))]));
  const com = async (opcoes, casos = CASOS) => (await correrOsCasos(D, { lado: "peca", peca: oPreludioDoTurno, casos, opcoes })).reduce((a, f, j) => a + (JSON.stringify(fotoGuardada(f, casos[j].i)) === fotoDaPeca.get(casos[j]) ? 0 : 1), 0);
  const semAplicar = await com({ semAplicar: true });
  t(`o App sem \`aplicar\` não vê o que o prelúdio escreveu — muda ${semAplicar} fotos`, semAplicar > 0);
  /* o servidor não tem a lista do App: a peça junta as mensagens ela mesma, e a foto é a mesma */
  const semLista = await com({ pushSemLista: true });
  t(`o pushMsgs que não devolve a lista (o servidor): a peça junta as mensagens ela mesma — ${semLista} fotos mudam`, semLista === 0);
  const outroInterprete = await com({ portasExtra: { interprete: () => ({ movimentos: [], marcas: [{ nome: "Ninguém", id: "x", gesto: "olhou" }] }) } });
  t(`a porta do Intérprete manda: outro Intérprete, muda ${outroInterprete} fotos`, outroInterprete > 0);
  /* o que o App adia: com a porta, a peça entrega-o e não o corre; correndo-o depois, a foto é a mesma */
  const comAdiados = CASOS.filter((k, i) => R[i].nAdiados > 0);
  const guardados = [];
  const semCorrer = await com({ portasExtra: { adiar: (g) => guardados.push(g) } }, comAdiados);
  /* nestes casos o adiado (a presença na luta recém-aberta) não muda a foto do fim: por isso a hora em que o App o corre (com a rede no ar) não pesa no pedido */
  t(`a porta adiar recebe o que o App adia (${guardados.length} em ${comAdiados.length} casos), e sem o correr a foto é a mesma (${semCorrer} mudam)`, comAdiados.length >= 5 && guardados.length === comAdiados.length && semCorrer === 0);
  const [f] = await correrOsCasos(D, { lado: "recorte", trocas: [["const doCompasso = talvezAndarOCompasso(conteudo, { segurar: segurarEsc });", "const doCompasso = talvezAndarOCompassoDeOutroNome(conteudo, { segurar: segurarEsc });"]], casos: [CASOS[1]] });
  t("o recorte com um nome sem dublê acusa-o em `faltas`", f.faltas.includes("talvezAndarOCompassoDeOutroNome"), f.faltas.join());
}

sec("7. O estado não se muta, e a mesma entrada dá a mesma saída");
{
  const gelar = (x) => { if (x && typeof x === "object" && !Object.isFrozen(x)) { Object.freeze(x); for (const v of Object.values(x)) gelar(v); } return x; };
  let iguaisG = 0, erroG = "";
  const amostra = CASOS.filter((x) => x.i % 7 === 0 || x.i >= N_CASOS);
  for (const k of amostra) {
    const e = JSON.parse(JSON.stringify({ ...k.estado, render: k.render }));
    const antes = JSON.stringify(e);
    const ent = { frase: k.frase, persAtual: k.entrada.persAtual, histBase: k.entrada.histBase };
    try {
      const a = await oPreludioDoTurno(gelar(e), gelar({ ...JSON.parse(JSON.stringify(ent)), sorte: rng(hashSemente("gelo-" + k.i)) }), {});
      const b = await oPreludioDoTurno(JSON.parse(antes), { ...JSON.parse(JSON.stringify(ent)), sorte: rng(hashSemente("gelo-" + k.i)) }, {});
      if (JSON.stringify(a) === JSON.stringify(b) && JSON.stringify(e) === antes) iguaisG++;
      else erroG = erroG || `${k.i}: difere`;
    } catch (x) { if (D.fotos[k.i].erro) iguaisG++; else erroG = erroG || `${k.i}: ${x.message}`; }
  }
  t(`sobre o estado congelado até ao fundo, a mesma saída e o estado intacto (${iguaisG}/${amostra.length})`, iguaisG === amostra.length && !erroG, erroG);
}

sec("8. O lixo: estoura onde o App estoura, e nunca antes de entregar o que escreveu");
{
  for (const [nome, e, ent, p] of [["estado nulo", null, null, null], ["estado vazio", {}, {}, {}], ["entrada sem frase", { mapa: { cidades: [] } }, {}, undefined]]) {
    let erro = "", r = null;
    semearACasa("lixo");
    try { r = await oPreludioDoTurno(e, ent, p); } catch (x) { erro = x.message; }
    t(`${nome}: a entrada do pedido sai, com as onze chaves`, !erro && r && JSON.stringify(Object.keys(r.entradaDoPedido).sort()) === JSON.stringify([...ENTRADA_DO_PEDIDO].sort()), erro);
  }
  const i = D.fotos.findIndex((f) => f.erro);
  let entregues = null, erro = "";
  const k = CASOS[i];
  try { await oPreludioDoTurno({ ...JSON.parse(JSON.stringify(k.estado)), render: k.render }, { frase: k.frase }, { aplicar: (x) => { entregues = Object.keys(x); } }); } catch (x) { erro = x.message; }
  t(`o caso que estoura (${i}, ${k.montado || "gravado"}) estoura como no App, e o que já escreveu chegou ao App`, erro === D.fotos[i].erro && Array.isArray(entregues) && entregues.length > 0, `${erro} / ${entregues}`);
}

sec("9. As tabelas são as do App");
{
  const mods = await osModulos(D.imports), padroes = osPadroes(D, mods);
  const tortos = Object.entries(REFS_DO_PRELUDIO).filter(([c, r]) => !(D.refs[r.ref] && D.refs[r.ref].campo === c && D.refs[r.ref].salvo === r.salvo && D.refs[r.ref].escreve === r.escreve && JSON.stringify(r.padrao()) === JSON.stringify(padroes[r.ref]())));
  t(`cada um dos ${Object.keys(REFS_DO_PRELUDIO).length} refs da peça é um ref do recorte, com o mesmo campo, salvo, escrita e valor de partida`, tortos.length === 0 && Object.keys(REFS_DO_PRELUDIO).length === Object.keys(D.refs).length, tortos.map(([c]) => c).join());
  t("o render da peça é o do recorte", JSON.stringify([...RENDER_DO_PRELUDIO].sort()) === JSON.stringify([...D.render].sort()));
  t("as portas da peça são as do recorte: cada setter, a tela, o disco e a rede", D.setters.every((s) => PORTAS_DO_PRELUDIO.includes(s)) && ["aplicar", "calou", "pushMsgs", "salvar", "chamarModelo", "interprete", "adiar", "agora"].every((p) => PORTAS_DO_PRELUDIO.includes(p)));
}

console.log(`\n${ok} ok, ${mal} mal`);
console.log(`(as mordidas do recorte: ${Object.entries(MORDEU_R).map(([k, v]) => `${k} ${v}`).join(" · ")})`);
process.exit(mal ? 1 : 0);
