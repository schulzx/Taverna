/* teste-paredes.mjs (Fase MM) — nenhuma luta pode não acabar

   A prova de `passoAteAlcancar` (grid.js): o inimigo, o grupo e o herói da
   sonda andam pelo CAMINHO até onde alcançam, e não em linha reta até o
   primeiro topo falso. As perguntas de mesa:
     "o bandido do lado de lá do balcão dá a volta?"            → §1
     "o ogro colado ao muro me bate através dele?"               → §2
     "em campo aberto, mudou alguma coisa?"                      → §3
     "o arqueiro que não me vê vai procurar de onde ver?"       → §4
     "o bicho grande passa onde cabe, e não onde não cabe?"      → §5
     "e com lixo, ocupação, a mesma semente?"                    → §6
     "a sonda anda pelo mesmo caminho?"                          → §7
   e a medida — zero travas, empate só o de desenho, balanço dentro de 10%
   por planta — fixada como catraca (§8) e medida ao vivo (§9).

   Nenhum `Math.random`: o passo é determinístico, a regressão em campo
   aberto usa um gerador semeado próprio, e a luta roda sob a sorte travada
   da régua. */
import { readFileSync } from "node:fs";
import {
  montarGrade, garantirGrade, moverInimigos, passoAteAlcancar, distanciaM, linhaDeVisao, caminhar,
  ocupacaoDe, quadradosDe, alcanceNatural, ladoDe, ehParede, PLANTAS, DESLOCAMENTO_PADRAO, METROS_POR_QUADRADO, m2q,
} from "../src/grid.js";
import { deslocamentoDeCriatura } from "../src/movimento.js";
import { mantemDistancia, POSTURA_DO_ATIRADOR } from "../src/atirador.js";
import { carregar } from "./sonda-dos-atiradores.mjs";
import {
  sondarParedes, RETRATO_DAS_PAREDES, LIMITE_DAS_PAREDES, EMPATES_DE_DESENHO, JOGADORES_DAS_PAREDES,
  LUTAS_DAS_PAREDES, AMOSTRA_DAS_PAREDES,
} from "./sonda-das-paredes.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra !== "" ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

const soldado = (x, y, extra = {}) => ({ nome: "Soldado", ameaca: "comum", vida: 20, x, y, ...extra });
const ogro = (x, y) => ({ nome: "Ogro", ameaca: "comum", vida: 40, x, y });
const heroi = (x, y) => ({ nome: "Vera", x, y });
/* uma grade feita à mão: `paredes` em "x,y" */
const grade = (largura, altura, paredes) => ({ cenario: "estrada", largura, altura, paredes, estorvos: [] });
const linhaDeParede = (x, y0, y1) => Array.from({ length: y1 - y0 + 1 }, (_, i) => `${x},${y0 + i}`);
/* anda rodada a rodada até alcançar (ou o teto de rodadas) */
function andarAte(g, ent, alvo, todos = [alvo], teto = 12) {
  let e = ent;
  for (let r = 1; r <= teto; r++) {
    if (distanciaM(e, alvo) <= alcanceNatural(e) && linhaDeVisao(g, e, alvo)) return { e, rodadas: r - 1 };
    e = moverInimigos(g, [e], alvo, todos).inimigos[0];
  }
  return { e, rodadas: Infinity };
}

/* ============================================================
   A BUSCA ANTIGA — copiada de grid.js (HEAD d32bc54) para servir de régua
   à regressão em campo aberto (§3). Não é código do jogo: é a lembrança
   exata do que o jogo fazia, para o teste poder dizer "igual".
   ============================================================ */
function passoGulosoAntigo(g, e, alvo, todos, vivos) {
  const gg = garantirGrade(g);
  const dist = distanciaM(e, alvo);
  if (dist <= alcanceNatural(e)) return e;
  const ocupados = ocupacaoDe([...(todos || []), ...vivos], e);
  const passoDele = deslocamentoDeCriatura(e);
  const metrosDele = passoDele.metros || DESLOCAMENTO_PADRAO;
  let melhor = null, melhorD = dist;
  const teto = m2q(metrosDele);
  for (let x = Math.max(0, e.x - teto); x <= Math.min(gg.largura - 1, e.x + teto); x++) {
    for (let y = Math.max(0, e.y - teto); y <= Math.min(gg.altura - 1, e.y + teto); y++) {
      if (x === e.x && y === e.y) continue;
      const d = distanciaM({ ...e, x, y }, alvo);
      if (d >= melhorD) continue;
      const r = caminhar(g, e, { x, y }, { ocupados, deslocamentoM: metrosDele, ignoraDificil: !!passoDele.voando });
      if (!r.ok) continue;
      melhor = { x, y, metros: Math.round(dist - d) }; melhorD = d;
    }
  }
  return melhor ? { ...e, x: melhor.x, y: melhor.y, metros: melhor.metros } : e;
}

/* ============================================================ */
sec("0. as tabelas");
{
  t("o limite de travas é zero", LIMITE_DAS_PAREDES.travas === 0);
  t("o balanço por planta aceita 10%, não mais", LIMITE_DAS_PAREDES.balanco === 0.1);
  t("o empate de desenho é só de quem NÃO anda", EMPATES_DE_DESENHO.jogadores.every((j) => j === "espera" || j === "abrigo")
    && !EMPATES_DE_DESENHO.jogadores.includes("caminho") && !EMPATES_DE_DESENHO.jogadores.includes("companheiro"));
  t("...e só diante de quem alcança de mais longe (atirador, conjurador, grande)",
    EMPATES_DE_DESENHO.lutas.every((l) => ["atirador", "conjurador", "grande"].includes(l)) && !EMPATES_DE_DESENHO.lutas.includes("lutador"));
  t("os quatro jogadores e as cinco lutas", JOGADORES_DAS_PAREDES.length === 4 && Object.keys(LUTAS_DAS_PAREDES).length === 5);
  t("as lutas cobrem os quatro jeitos de andar", ["Soldado", "Atirador", "Mago", "Ogro"].every((n) => Object.values(LUTAS_DAS_PAREDES).some((l) => l.inimigos.includes(n))));
  t("o Ogro da sonda é grande (lado 2, alcance 3 m)", ladoDe({ nome: "Ogro" }) === 2 && alcanceNatural({ nome: "Ogro" }) === 3);
}

/* ============================================================ */
sec("1. o balcão da taverna — quem está do lado de lá dá a volta");
{
  const g = montarGrade({ local: "taverna" });
  t("a taverna tem o balcão em y=1, de x=2 a x=8", [2, 5, 8].every((x) => ehParede(g, x, 1)) && !ehParede(g, 1, 1) && !ehParede(g, 9, 1));
  /* o caso que travava: herói colado ao MEIO do balcão por baixo, bandido
     colado por cima, a 3 m em linha reta. A volta mais curta tem sete
     casas, e nenhuma casa do passo de seis fica a menos de 3 m do lado de
     lá — a volta começa por se afastar. (Varrida a planta inteira com a
     busca antiga, são seis pares assim na taverna e quatro no beco da
     cidade; este é o do meio.) */
  const h = heroi(5, 2), s = soldado(5, 0);
  const antigo = passoGulosoAntigo(g, s, h, [h], [s]);
  t("a busca antiga ficava parada (o topo falso)", antigo.x === 5 && antigo.y === 0);
  const r = moverInimigos(g, [s], h, [h]);
  const s1 = r.inimigos[0];
  t("agora ele sai do lugar", s1.x !== 5 || s1.y !== 0, `${s1.x},${s1.y}`);
  t("...e o movimento sai na linha de passo", r.movimentos.length === 1 && r.movimentos[0].nome === "Soldado");
  t("...com metros de verdade, não \"avança 0 m\"", r.movimentos[0].metros > 0, r.movimentos[0].metros);
  const fim = andarAte(g, s, h);
  t("chega ao herói em duas rodadas, contornando o balcão", fim.rodadas <= 2, fim.rodadas);
  t("e de onde chega, bate (distância e linha de visão)", distanciaM(fim.e, h) <= alcanceNatural(fim.e) && linhaDeVisao(g, fim.e, h));
  /* o grupo anda pela mesma função: o companheiro do lado errado do balcão
     também dá a volta até o inimigo (App, a vez do mundo) */
  const comp = { nome: "Bram", vida: 30, x: 5, y: 2 };
  const inimigo = soldado(5, 0);
  const c = andarAte(g, comp, inimigo, [inimigo]);
  t("o companheiro dá a volta ao balcão até o inimigo", c.rodadas <= 2, c.rodadas);
}

/* ============================================================ */
sec("2. alcançar é distância E linha de visão");
{
  /* uma parede de x=0..9 em y=5; o ogro (lado 2) em cima dela, o herói por
     baixo a 3 m — pela conta antiga ele "já alcançava" e ficava. */
  const paredes = Array.from({ length: 10 }, (_, x) => `${x},5`);
  const g = grade(14, 12, paredes);
  const o = ogro(2, 3), h = heroi(3, 6);
  t("o ogro está a 3 m (o alcance dele) do herói", distanciaM(o, h) === 3 && alcanceNatural(o) === 3);
  t("...mas a parede corta a linha de visão", !linhaDeVisao(g, o, h));
  t("a busca antiga o deixava parado ali", (() => { const a = passoGulosoAntigo(g, o, h, [h], [o]); return a.x === o.x && a.y === o.y; })());
  const r = moverInimigos(g, [o], h, [h]).inimigos[0];
  t("agora ele anda", r.x !== o.x || r.y !== o.y, `${r.x},${r.y}`);
  const fim = andarAte(g, o, h);
  t("e chega onde bate de verdade", Number.isFinite(fim.rodadas) && linhaDeVisao(g, fim.e, h) && distanciaM(fim.e, h) <= 3, fim.rodadas);
  /* quem alcança E vê continua parado: a regra de sempre */
  const colado = soldado(3, 7);
  t("quem já alcança e vê não se mexe", moverInimigos(g, [colado], h, [h]).movimentos.length === 0);
}

/* ============================================================ */
sec("3. campo aberto: casa a casa o mesmo passo de antes");
{
  /* as plantas sem parede da casa, lidas de PLANTAS — planta nova sem
     parede entra aqui sozinha */
  const abertas = Object.keys(PLANTAS).filter((id) => !(PLANTAS[id].muros || []).length);
  t("há plantas sem parede para medir (estrada, floresta, deserto)", ["estrada", "floresta", "deserto"].every((id) => abertas.includes(id)));
  let semente = 20260929;
  const rnd = () => { semente = (semente * 1103515245 + 12345) % 2147483648; return semente / 2147483648; };
  const ri = (n) => Math.floor(rnd() * n);
  /* nomes que andam de jeitos diferentes: o de sempre, o grande, o que
     arrasta, o veloz, o que voa (ignora o terreno difícil) */
  const NOMES = ["Soldado", "Bandido", "Ogro", "Troll", "Zumbi", "Lobo", "Dragão", "Goblin"];
  let mesas = 0, iguais = 0, primeiraDiferente = "";
  for (const id of abertas) {
    const g = montarGrade({ local: id });
    for (let k = 0; k < 700; k++) {
      const h = heroi(ri(g.largura), ri(g.altura));
      const inim = Array.from({ length: 1 + ri(4) }, (_, i) => ({ nome: `${NOMES[ri(NOMES.length)]} ${i}`, ameaca: "comum", vida: 10, x: ri(g.largura - 1), y: ri(g.altura - 1) }));
      const aliados = Array.from({ length: ri(3) }, (_, i) => ({ nome: `Aliado ${i}`, vida: 5, x: ri(g.largura), y: ri(g.altura) }));
      const todos = [h, ...aliados];
      const r = moverInimigos(g, inim, h, todos);
      /* A OCUPAÇÃO QUE ANDA (etapa do empilhamento, depois de v9.315): a
         busca antiga recebia os companheiros de bando nas casas de ANTES do
         turno, e três soldados iam para a mesma casa. Isso foi consertado de
         propósito, e não é o que esta secção mede — ela mede a ESCOLHA da
         casa. Por isso a régua antiga recebe agora a mesma ocupação que o
         motor vê: quem já andou, na casa nova (`atuais`). A escolha
         continua a ser casa a casa a da busca antiga. */
      const atuais = inim.slice();
      for (let i = 0; i < inim.length; i++) {
        if (mantemDistancia(inim[i])) { atuais[i] = r.inimigos[i]; continue; }
        mesas++;
        const a = passoGulosoAntigo(g, inim[i], h, todos, atuais);
        const n = r.inimigos[i];
        atuais[i] = n;
        const mv = r.movimentos.find((m) => m.nome === inim[i].nome);
        const igual = a.x === n.x && a.y === n.y && (a.metros == null ? !mv : (mv && mv.metros === a.metros));
        if (igual) iguais++;
        else if (!primeiraDiferente) primeiraDiferente = `${id}: ${inim[i].nome} (${inim[i].x},${inim[i].y}) → antigo (${a.x},${a.y}) novo (${n.x},${n.y})`;
      }
    }
  }
  t(`${mesas} passos em campo aberto, todos iguais aos da busca antiga`, mesas > 3000 && iguais === mesas, primeiraDiferente || `${iguais}/${mesas}`);
  /* o atirador: o degrau "não vê" é o único que mudou no posto, e sem
     parede ele não existe — toda casa de toda planta aberta vê o herói
     de qualquer outra dentro do alcance de 36 m */
  const maiorDiagonal = Math.max(...abertas.map((id) => distanciaM({ x: 0, y: 0 }, { x: PLANTAS[id].largura - 1, y: PLANTAS[id].altura - 1 })));
  t(`nenhuma planta aberta passa do alcance do arco (${maiorDiagonal} m < ${POSTURA_DO_ATIRADOR.alcanceM} m)`, maiorDiagonal < POSTURA_DO_ATIRADOR.alcanceM);
}

/* ============================================================ */
sec("4. o arqueiro que não vê vai procurar de onde ver");
{
  /* uma parede comprida em x=10, de y=0 a y=10; a passagem é embaixo (y=11).
     O arqueiro em (9,0), o herói em (11,0): a um passo em linha reta, e
     sem se verem. Nenhuma casa do lado de lá vê o herói. */
  const g = grade(20, 12, linhaDeParede(10, 0, 10));
  const h = heroi(11, 0);
  const arq = { nome: "Atirador", ameaca: "comum", vida: 20, x: 7, y: 0 };
  t("o arqueiro mantém distância (é atirador)", mantemDistancia(arq));
  t("de onde está, não vê o herói", !linhaDeVisao(g, arq, h));
  let a = arq, viu = Infinity;
  for (let r = 1; r <= 10; r++) {
    a = moverInimigos(g, [a], h, [h]).inimigos[0];
    if (linhaDeVisao(g, a, h) && distanciaM(a, h) <= POSTURA_DO_ATIRADOR.alcanceM) { viu = r; break; }
  }
  t("contorna a parede e vê o herói em poucas rodadas", viu <= 4, viu);
  t("e não acabou colado nele", distanciaM(a, h) > METROS_POR_QUADRADO);
}

/* ============================================================ */
sec("5. o bicho grande passa onde cabe");
{
  /* uma parede em y=6 com UM vão: largo de 2 (x=6,7) — o ogro cabe */
  const larga = grade(14, 12, Array.from({ length: 14 }, (_, x) => `${x},6`).filter((k) => !["6,6", "7,6"].includes(k)));
  const h = heroi(2, 10), o = ogro(2, 1);
  const fim = andarAte(larga, o, h, [h], 15);
  t("pelo vão de 2 casas o ogro passa e chega", Number.isFinite(fim.rodadas), fim.rodadas);
  /* o mesmo com o vão de 1 casa: o soldado passa, o ogro não */
  const estreita = grade(14, 12, Array.from({ length: 14 }, (_, x) => `${x},6`).filter((k) => k !== "7,6"));
  const s = andarAte(estreita, soldado(2, 1), h, [h], 15);
  t("pelo vão de 1 casa o soldado passa", Number.isFinite(s.rodadas), s.rodadas);
  const o2 = andarAte(estreita, o, h, [h], 15);
  t("...e o ogro não — é o empate de desenho, não trava de busca", !Number.isFinite(o2.rodadas));
  t("sem caminho, ele não estoura: cai na reta de antes", o2.e.y <= 4 && o2.e.x >= 0);
}

/* ============================================================ */
sec("6. lixo, ocupação, imutabilidade, determinismo");
{
  const g = montarGrade({ local: "taverna" });
  const h = heroi(5, 2);
  t("sem grade: null", passoAteAlcancar(null, soldado(6, 0), h) === null);
  t("grade {}: null", passoAteAlcancar({}, soldado(6, 0), h) === null);
  t("sem entidade: null", passoAteAlcancar(g, null, h) === null);
  t("sem alvo: null", passoAteAlcancar(g, soldado(6, 0), null) === null);
  t("alvo sem posição: null", passoAteAlcancar(g, soldado(6, 0), { nome: "x" }) === null);
  t("quem já alcança e vê: null (fica)", passoAteAlcancar(g, soldado(5, 3), h) === null);
  const p = passoAteAlcancar(g, soldado(5, 0), h);
  t("a casa devolvida é livre (não é parede)", p && !ehParede(g, p.x, p.y));
  t("custa o que o passo paga (≤ 9 m)", p && p.custoM > 0 && p.custoM <= DESLOCAMENTO_PADRAO);
  /* a ocupação: com o caminho da esquerda tapado por aliados, não termina em cima de ninguém */
  const tampa = [{ nome: "A", vida: 5, x: 1, y: 1 }, { nome: "B", vida: 5, x: 1, y: 2 }, { nome: "C", vida: 5, x: 0, y: 1 }];
  const s = soldado(4, 0);
  const r = moverInimigos(g, [s], h, [h, ...tampa]).inimigos[0];
  t("não termina numa casa ocupada", ![h, ...tampa].some((x) => x.x === r.x && x.y === r.y));
  /* imutabilidade */
  const lista = [soldado(6, 0)];
  const antes = JSON.stringify(lista);
  moverInimigos(g, lista, h, [h]);
  t("não muta a lista de inimigos", JSON.stringify(lista) === antes);
  /* determinismo */
  const um = JSON.stringify(moverInimigos(g, [soldado(6, 0), soldado(8, 0)], h, [h]));
  const dois = JSON.stringify(moverInimigos(g, [soldado(6, 0), soldado(8, 0)], h, [h]));
  t("a mesma mesa dá o mesmo passo", um === dois);
  t("com alcance explícito, respeita-o (o anel de 6 m)", (() => {
    const q = passoAteAlcancar(montarGrade({ local: "estrada" }), soldado(0, 0), heroi(15, 0), { alcanceM: 6 });
    return q && q.x > 0;
  })());
}

/* ============================================================ */
sec("7. a sonda anda pelo caminho de produção");
{
  const txt = readFileSync("./sonda-dos-atiradores.mjs", "utf8").replace(/\r\n/g, "\n");
  t("o herói da sonda de MM7 lê `passoAteAlcancar` de grid.js", /G\.passoAteAlcancar\(grade, lugar, alvo/.test(txt));
  t("...com o desempate do jogador", /desempate: "passo"/.test(txt));
  t("e não tem mais busca própria (o mapa de passos saiu dela)", !/const passos = new Map\(\)/.test(txt));
  t("o golpe do herói da sonda pede linha de visão, como `alcanca`", /G\.alcanceNatural\(lugar\) && G\.linhaDeVisao\(grade, lugar, e\)/.test(txt));
}

/* ============================================================ */
sec("7b. ninguém acaba na casa de outro (a etapa do empilhamento)");
{
  /* o caso que a etapa das paredes achou: três soldados na estrada, lado a
     lado, iam os três para (4,6) */
  const g = montarGrade({ local: "estrada" });
  const h = heroi(9, 11);
  const tres = [soldado(8, 0, { nome: "A" }), soldado(9, 0, { nome: "B" }), soldado(10, 0, { nome: "C" })];
  const r = moverInimigos(g, tres, h, [h]).inimigos;
  const casas = r.map((e) => e.x + "," + e.y);
  t(`três soldados, três casas (${casas.join(" · ")})`, new Set(casas).size === 3);
  t("o primeiro da lista escolhe primeiro: a casa dele é a de sempre", r[0].x === 4 && r[0].y === 6);
  t("a ordem é a da lista, e a mesma lista dá o mesmo passo", JSON.stringify(moverInimigos(g, tres, h, [h])) === JSON.stringify(moverInimigos(g, tres, h, [h])));
  /* o grande ocupa `ladoDe`² casas: ninguém entra em nenhuma delas */
  const og = { ...ogro(8, 0), nome: "Ogro" };
  const bando = [og, soldado(9, 2, { nome: "D" }), soldado(7, 2, { nome: "E" }), soldado(10, 1, { nome: "F" })];
  const rb = moverInimigos(g, bando, h, [h]).inimigos;
  const donas = new Map();
  let choque = "";
  for (const e of [h, ...rb]) for (const q of quadradosDe(e)) {
    const k = q.x + "," + q.y;
    if (donas.has(k) && !choque) choque = `${donas.get(k)} e ${e.nome} em ${k}`;
    donas.set(k, e.nome);
  }
  t("com o ogro no bando (lado 2), nenhuma casa tem dois corpos", !choque, choque);
  t("o ogro ocupa quatro casas", quadradosDe(rb[0]).length === 4);
  /* o herói: ninguém termina em cima dele, nem o grupo que anda pela mesma
     função para o inimigo */
  const perto = heroi(5, 5);
  const cerco = Array.from({ length: 8 }, (_, i) => soldado(1 + i, 0, { nome: `S${i}` }));
  const rc = moverInimigos(g, cerco, perto, [perto]).inimigos;
  t("oito soldados à volta do herói: nenhum na casa dele", rc.every((e) => e.x !== perto.x || e.y !== perto.y));
  t("...e nenhum na casa de outro", new Set(rc.map((e) => e.x + "," + e.y)).size === rc.length);
  const alvoDoGrupo = soldado(9, 0, { nome: "Alvo" });
  const grupo = [{ nome: "Bram", vida: 30, x: 8, y: 11 }, { nome: "Iria", vida: 30, x: 10, y: 11 }, { nome: "Tomás", vida: 30, x: 9, y: 10 }];
  const rg = moverInimigos(g, grupo, alvoDoGrupo, [h, alvoDoGrupo]).inimigos;
  t("o grupo também não se empilha", new Set(rg.map((e) => e.x + "," + e.y)).size === 3);
  t("e ninguém do grupo pisa o herói nem o alvo", rg.every((e) => !(e.x === h.x && e.y === h.y) && !(e.x === alvoDoGrupo.x && e.y === alvoDoGrupo.y)));
  /* quem já caiu não ocupa: o derrotado não é obstáculo */
  const caido = { ...soldado(4, 6, { nome: "Caído" }), vida: 0, derrotado: true };
  const rcai = moverInimigos(g, [caido, soldado(8, 0, { nome: "G" })], h, [h]).inimigos;
  t("quem caiu fica onde está e não tira a casa a ninguém", rcai[0] === caido && rcai[1].x === 4 && rcai[1].y === 6);
}

/* ============================================================ */
sec("8. a catraca: o retrato de antes e de depois");
{
  const R = RETRATO_DAS_PAREDES;
  const celulas = (m) => Object.entries(m).flatMap(([p, ls]) => Object.entries(ls).flatMap(([l, js]) => Object.entries(js).map(([j, v]) => ({ p, l, j, empates: v[0], travas: v[1] }))));
  const antes = celulas(R.antes), depois = celulas(R.depois);
  t("antes havia travas (a taverna, 30 de 30; o gelo, 30 de 30)", R.antes.taverna.lutador.companheiro[1] === 30 && R.antes.gelo.grande.abrigo[1] === 30);
  t("...e empates sem trava do lado de quem anda (o conjurador na taverna, 13)", R.antes.taverna.conjurador.companheiro[0] === 13);
  t(`depois: ${depois.reduce((s, c) => s + c.travas, 0)} travas em ${Object.keys(PLANTAS).length} plantas`, depois.every((c) => c.travas <= LIMITE_DAS_PAREDES.travas));
  const foraDoDesenho = depois.filter((c) => !(EMPATES_DE_DESENHO.jogadores.includes(c.j) && EMPATES_DE_DESENHO.lutas.includes(c.l)));
  t("depois: nenhum empate fora do de desenho", foraDoDesenho.length === 0, foraDoDesenho.map((c) => `${c.p}.${c.l}.${c.j}`).join(", "));
  t("o conserto não criou empate onde não havia", depois.every((c) => antes.some((a) => a.p === c.p && a.l === c.l && a.j === c.j && a.empates >= c.empates)));
  const B = R.balanco;
  t("o balanço é de 140 lutas", B.n === 140);
  for (const p of Object.keys(PLANTAS)) {
    const a = B.antes[p], d = B.depois[p];
    const varia = d.dano / a.dano - 1;
    t(`${p}: o dano no herói varia ${(varia * 100).toFixed(1)}% (limite ${LIMITE_DAS_PAREDES.balanco * 100}%), vitória ${(a.vitoria * 100).toFixed(1)} → ${(d.vitoria * 100).toFixed(1)}`,
      Math.abs(varia) <= LIMITE_DAS_PAREDES.balanco && d.vitoria >= a.vitoria - 0.01);
  }
  const abertas = Object.keys(PLANTAS).filter((id) => !(PLANTAS[id].muros || []).length);
  t("nas plantas sem parede o caminho não mudou o balanço (regressão zero, medida)", abertas.every((p) => B.antes[p].dano === B.depois[p].dano && B.antes[p].vitoria === B.depois[p].vitoria));

  /* A ETAPA DO EMPILHAMENTO, sobre o mesmo retrato. A asserção de cima
     continua a falar do caminho (antes → depois). O empilhamento mexe
     também em campo aberto, de propósito — é lá que os três soldados da
     estrada iam para a mesma casa —, e por isso `semPilha` responde só ao
     limite de sempre: 10% por planta, contra o antes de tudo. */
  const SO = R.sobreposicoes;
  t(`antes do conserto, ${SO.antes} de ${SO.rodadasAntes} rodadas acabavam com dois corpos numa casa`, SO.antes > 1000);
  t("depois, nenhuma", SO.depois === LIMITE_DAS_PAREDES.sobreposicoes && LIMITE_DAS_PAREDES.sobreposicoes === 0);
  const semPilha = celulas(R.semPilha);
  t("sem a pilha: nenhuma trava", semPilha.every((c) => c.travas === 0));
  const foraSP = semPilha.filter((c) => !(EMPATES_DE_DESENHO.jogadores.includes(c.j) && EMPATES_DE_DESENHO.lutas.includes(c.l)));
  t("sem a pilha: nenhum empate fora do de desenho", foraSP.length === 0, foraSP.map((c) => `${c.p}.${c.l}.${c.j}`).join(", "));
  /* os empates de desenho podem subir: o ogro contra quem espera empatava 3
     e empata 5 em quatro células, porque o soldado que vinha colado a ele na
     MESMA casa agora ocupa outra e chega depois. Célula nova com empate é
     que não pode nascer. */
  t("sem a pilha: nenhuma célula nova com empate", semPilha.every((c) => depois.some((d) => d.p === c.p && d.l === c.l && d.j === c.j)));
  for (const p of Object.keys(PLANTAS)) {
    const a = B.antes[p], d = B.semPilha[p];
    const varia = d.dano / a.dano - 1;
    t(`${p} sem a pilha: dano ${(varia * 100).toFixed(1)}% do antes (limite ${LIMITE_DAS_PAREDES.balanco * 100}%)`,
      Math.abs(varia) <= LIMITE_DAS_PAREDES.balanco && d.vitoria >= a.vitoria - 0.01);
  }
  /* A ETAPA DA MIRA (depois de v9.316): o mesmo limite, contra o mesmo
     antes de tudo, para o jogo com a mira pela cabeça como está ligado
     hoje (sem `feridoPor` no App) */
  for (const p of Object.keys(PLANTAS)) {
    const a = B.antes[p], d = B.mira[p];
    const varia = d.dano / a.dano - 1;
    t(`${p} com a mira: dano ${(varia * 100).toFixed(1)}% do antes (limite ${LIMITE_DAS_PAREDES.balanco * 100}%)`,
      Math.abs(varia) <= LIMITE_DAS_PAREDES.balanco && d.vitoria >= a.vitoria - 0.01);
  }
}

/* ============================================================ */
sec("9. ao vivo: todas as plantas, todas as lutas, os quatro jogadores");
{
  /* oito lutas por célula (as oito primeiras sementes do retrato) para
     caber no `npm test`: 10 plantas × 5 lutas × 4 jogadores × 8. A catraca
     é a mesma do retrato — trava nenhuma, empate só o de desenho. */
  const M = await carregar();
  const n = 8;
  console.log(`      (medindo ${Object.keys(PLANTAS).length * Object.keys(LUTAS_DAS_PAREDES).length * JOGADORES_DAS_PAREDES.length * n} lutas — pode levar alguns segundos)`);
  const m = sondarParedes(M, { n });
  let travas = 0, sobreposicoes = 0; const fora = [];
  for (const [p, ls] of Object.entries(m)) for (const [l, js] of Object.entries(ls)) for (const [j, c] of Object.entries(js)) {
    travas += c.travas;
    sobreposicoes += c.sobreposicoes;
    if (c.empates && !(EMPATES_DE_DESENHO.jogadores.includes(j) && EMPATES_DE_DESENHO.lutas.includes(l))) fora.push(`${p}.${l}.${j}:${c.empates}`);
  }
  t("nenhuma trava", travas === 0, travas);
  t("nenhuma rodada termina com dois corpos na mesma casa", sobreposicoes === LIMITE_DAS_PAREDES.sobreposicoes, sobreposicoes);
  t("nenhum empate fora do de desenho", fora.length === 0, fora.join(", "));
  t("o jogador que anda ganha em toda planta", Object.values(m).every((ls) => Object.values(ls).every((js) => js.caminho.vitoria >= 0.5)));
  t("a amostra do retrato é a da sonda", RETRATO_DAS_PAREDES.n === AMOSTRA_DAS_PAREDES.n);
  const um = JSON.stringify(sondarParedes(M, { n: 2, plantas: ["taverna"], lutas: ["lutador"] }));
  const dois = JSON.stringify(sondarParedes(M, { n: 2, plantas: ["taverna"], lutas: ["lutador"] }));
  t("determinismo: a mesma semente dá a mesma medida", um === dois);
}

console.log(`\nparedes (o caminho de verdade): ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
