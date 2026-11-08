/* teste-nomes-unicos.mjs (C1, 07/11) — um nome, uma habilidade.

   Nasceu de onze habilidades de subclasse que tinham o nome de uma da
   classe-mãe (o Arqueiro inteiro, três do Arcanista, uma do Assassino, do
   Paladino, do Punho de Ferro e do Andarilho). A árvore e a ficha procuram
   POR NOME: aprender uma marcava a outra "já dominada", as duas acendiam no
   céu, e `fichaDaHabilidade` devolvia sempre a da classe — o nó da subclasse
   era um nó que ninguém podia comprar.

   A decisão foi que são DUAS. A da subclasse ganhou nome e efeito próprios;
   o nome antigo ficou na classe, que é o que o save já lia. Esta suíte prova
   as três metades disso e guarda a catraca que impede a décima segunda.   */
import { CLASSES, fichaDaHabilidade, classeDaHabilidade, podePegarHabilidade, arvoreDaClasse, arvoreDaSubclasse, custoJaGasto, custoEmPontos } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";
import { MAGIAS, ehArea } from "../src/grimorio.js";
import { REACOES, reacoesDe, escolherReacao } from "../src/reacoes.js";
import { controleDe, aplicarControle } from "../src/controle.js";
import { ehReescrever, reescreverInstante, limiarDe, pressaDe, apressar, ignoraDoGolpe, linhaDoIgnorar } from "../src/habilidades.js";
import { poderDe, temPassivoDeClasse } from "../src/poder-de-classe.js";
import { aflicaoDe } from "../src/aflicoes.js";
import { passoDeHabilidade } from "../src/movimento.js";
import { dobraMovimento } from "../src/dadivas.js";
import { criarCondicao } from "../src/condicoes.js";

let ok = 0, mal = 0;
const t = (nome, cond, info = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (info ? " — " + info : "")); } };
const sec = (s) => console.log("\n" + s);
const N = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* A DECISÃO, escrita como dado: [classe, nome que ficou na classe, subclasse,
   nome novo da subclasse]. É a única lista de nomes à mão nesta suíte, e é
   ela que as secções 2 a 5 leem — se alguém renomear de novo, cai aqui. */
const ONZE = [
  ["Mago", "Contramágica", "Arcanista", "Contratempo"],
  ["Mago", "Prisão Arcana", "Arcanista", "Âmbar do Tempo"],
  ["Mago", "Reescrever o Instante", "Arcanista", "Ferida que Não Houve"],
  ["Ladino", "Execução", "Assassino", "Golpe de Misericórdia"],
  ["Clérigo", "Julgamento", "Paladino", "Luz do Juízo"],
  ["Caçador", "Tiro Duplo", "Arqueiro", "Flechas Gêmeas"],
  ["Caçador", "Flecha Perfurante", "Arqueiro", "Ponta de Agulha"],
  ["Caçador", "Chuva de Flechas", "Arqueiro", "Saraivada"],
  ["Caçador", "Tiro do Fim", "Arqueiro", "Tiro de Mil Passos"],
  ["Monge", "Rajada de Golpes", "Punho de Ferro", "Punhos em Cascata"],
  ["Monge", "Passo do Vento", "Andarilho", "Pés Ligeiros"],
];
const daSub = (sub, nome) => (SUBCLASSES[sub] || []).find((h) => h.nome === nome) || null;
const daClasse = (cls, nome) => ((CLASSES.find((c) => c.nome === cls) || {}).habilidades || []).find((h) => h.nome === nome) || null;

/* ============================================================
   1. A CATRACA — nenhum nome se repete em CLASSES inteiro
   ============================================================ */
sec("1. a catraca: nenhum nome de habilidade se repete entre classe, subclasses e especializações");
{
  const onde = new Map();
  const pos = (nome, fonte) => { const k = N(nome); if (!onde.has(k)) onde.set(k, []); onde.get(k).push(`${fonte} · ${nome}`); };
  const subsVistas = new Set(), espsVistas = new Set();
  for (const c of CLASSES) {
    for (const h of c.habilidades || []) pos(h.nome, `classe ${c.nome}`);
    for (const s of c.subclasses || []) {
      subsVistas.add(s.nome);
      for (const h of SUBCLASSES[s.nome] || []) pos(h.nome, `sub ${s.nome}`);
      for (const e of s.especializacoes || []) {
        espsVistas.add(e);
        for (const h of ESPECIALIZACOES[e] || []) pos(h.nome, `esp ${e}`);
      }
    }
  }
  const total = [...onde.values()].reduce((s, v) => s + v.length, 0);
  console.log(`  ··  ${total} habilidades varridas em ${CLASSES.length} classes, ${subsVistas.size} subclasses e ${espsVistas.size} especializações`);
  /* o piso impede a varredura vazia de passar verde: só as subclasses dão
     4 × 36 e as especializações 3 × 72 */
  t("a varredura é grande de verdade (piso 450)", total >= 450, String(total));
  t("nenhuma subclasse do catálogo fica fora de CLASSES (fugiria da catraca)",
    Object.keys(SUBCLASSES).every((s) => subsVistas.has(s)), Object.keys(SUBCLASSES).filter((s) => !subsVistas.has(s)).join(", "));
  t("nenhuma especialização do catálogo fica fora de CLASSES",
    Object.keys(ESPECIALIZACOES).every((e) => espsVistas.has(e)), Object.keys(ESPECIALIZACOES).filter((e) => !espsVistas.has(e)).join(", "));
  const repetidos = [...onde.values()].filter((v) => v.length > 1);
  t("NENHUM nome se repete (sem distinguir maiúscula nem acento)", repetidos.length === 0,
    repetidos.map((v) => v.join(" | ")).slice(0, 6).join(" ;; "));
}

/* ============================================================
   2. OS ONZE — o nome antigo ficou na classe, o novo é da subclasse
   ============================================================ */
sec("2. os onze: o nome antigo é só da classe, o novo é só da subclasse");
{
  for (const [cls, velho, sub, novo] of ONZE) {
    t(`${velho} continua na ${cls}`, !!daClasse(cls, velho));
    t(`…e saiu de ${sub}`, !daSub(sub, velho));
    t(`${novo} é de ${sub}`, !!daSub(sub, novo));
  }
  /* o nome novo não pode colidir com outra coisa que se procura por nome:
     a magia do grimório (fichaDaHabilidade e classeDaHabilidade olham para
     lá) e a reação (reacoesDe concede pelo nome na ficha) */
  const magias = new Set(MAGIAS.map((m) => N(m.nome)));
  const novos = ONZE.map((x) => x[3]);
  t("nenhum nome novo é nome de magia do grimório", novos.every((n) => !magias.has(N(n))), novos.filter((n) => magias.has(N(n))).join(", "));
  t("nenhum nome novo é reação alheia (só o Contratempo é reação, e é a sua)",
    REACOES.filter((r) => novos.some((n) => N(n) === N(r.nome))).map((r) => r.id).join(",") === "contratempo");
}

/* ============================================================
   3. O SAVE NÃO MUDA DE SENTIDO
   ============================================================ */
sec("3. um herói com o nome antigo continua com a versão da classe");
{
  for (const [cls, velho, sub] of ONZE) {
    const f = fichaDaHabilidade(velho);
    t(`"${velho}" resolve para a ${cls}`, !!f && !f.subclasse && f === daClasse(cls, velho));
    t(`…e sobe degrau de ${cls}`, classeDaHabilidade(velho) === cls);
    /* a ficha guarda nome (às vezes string crua, às vezes o objeto copiado) */
    for (const forma of [velho, { nome: velho }]) {
      const pers = { classe: cls, nivel: 12, habilidades: [forma], subclasses: { [cls]: sub } };
      const nClasse = arvoreDaClasse(pers, cls).find((h) => h.nome === velho);
      t(`${typeof forma === "string" ? "texto cru" : "objeto"}: o nó da classe acende`, !!nClasse && nClasse.dominada);
      t(`${typeof forma === "string" ? "texto cru" : "objeto"}: nenhum nó de ${sub} acende por ele`, arvoreDaSubclasse(pers, cls).every((h) => !h.dominada));
    }
  }
  /* o que já foi pago não muda: o custo gasto lê a ficha da classe, como lia */
  const arq = { classe: "Caçador", nivel: 12, habilidades: ["Tiro Duplo", "Flecha Perfurante", "Chuva de Flechas", "Tiro do Fim"], subclasses: { "Caçador": "Arqueiro" } };
  const pagoNaClasse = ["Tiro Duplo", "Flecha Perfurante", "Chuva de Flechas", "Tiro do Fim"].reduce((s, n) => s + custoEmPontos(daClasse("Caçador", n)), 0);
  t(`o Arqueiro que comprou os quatro antigos gastou o preço da classe (${pagoNaClasse}), e continua a ter gasto isso`, custoJaGasto(arq) === pagoNaClasse, String(custoJaGasto(arq)));
}

/* ============================================================
   4. A DA SUBCLASSE É COMPRÁVEL À PARTE
   ============================================================ */
sec("4. a da subclasse é comprável à parte — o «já dominada» acabou");
{
  for (const [cls, velho, sub, novo] of ONZE) {
    const tronco = ((CLASSES.find((c) => c.nome === cls) || {}).habilidades || []).map((h) => h.nome);
    /* a classe inteira (logo o nome antigo também), a subclasse escolhida,
       pontos de sobra e nível de sobra: só o nome podia recusar */
    const pers = { classe: cls, nivel: 20, pontosHab: 50, habilidades: tronco.map((nome) => ({ nome })), subclasses: { [cls]: sub } };
    const f = fichaDaHabilidade(novo);
    t(`"${novo}" resolve para ${sub}`, !!f && f.subclasse === sub);
    const chk = podePegarHabilidade(pers, cls, f || { nome: novo, nivel: 99 });
    t(`quem tem "${velho}" pode comprar "${novo}"`, chk.pode, chk.motivo);
    t(`…e "${velho}" continua "já dominada"`, podePegarHabilidade(pers, cls, daClasse(cls, velho)).motivo === "já dominada");
    const no = arvoreDaSubclasse(pers, cls).find((h) => h.nome === novo);
    t(`…e o nó de "${novo}" está por acender`, !!no && !no.dominada && no.pode);
  }
}

/* ============================================================
   5. A MECÂNICA DOS NOMES NOVOS DISPARA
   Uma habilidade renomeada sem a entrada da mecânica é uma habilidade que
   não faz nada — e a maior parte dos motores desta casa casa pelo começo
   do nome. Cada uma aqui é provada no motor que a resolve.
   ============================================================ */
sec("5. a mecânica dos nomes novos dispara");
const h = (sub, nome) => daSub(sub, nome) || { nome };
{
  /* CONTRATEMPO — reação; mais barata e mais cedo que a Contramágica */
  const ct = REACOES.find((r) => r.id === "contratempo");
  const cm = REACOES.find((r) => r.id === "contramagia");
  t("Contratempo é reação concedida pelo nome na ficha", reacoesDe({ classe: "Mago", habilidades: ["Contratempo"] }).some((r) => r.id === "contratempo"));
  t("…só morde magia, e corta tudo", ct.soMagia && ct.corta === 1);
  t("…mais barata que a Contramágica, e com piso menor", ct.pm < cm.pm && ct.minDano < cm.minDano, `${ct.pm}/${cm.pm} PM`);
  const mago = (habs, mana) => ({ classe: "Mago", vidaMax: 40, mana, habilidades: habs });
  t("com 2 PM e um feitiço chegando, o Contratempo corta", (escolherReacao({ pers: mago(["Contratempo"], 2), gatilho: "sofre_dano", dano: 20, tipoDano: "arcano" }) || {}).id === "contratempo");
  t("com 2 PM, a Contramágica não chegaria (pede 3)", (escolherReacao({ pers: mago(["Contramágica"], 2), gatilho: "sofre_dano", dano: 20, tipoDano: "arcano" }) || {}).id !== "contramagia");
  t("quem tem as duas usa a melhor (a ordem é a regra)", (escolherReacao({ pers: mago(["Contramágica", "Contratempo"], 10), gatilho: "sofre_dano", dano: 20, tipoDano: "arcano" }) || {}).id === "contratempo");
  t("contra uma machadada, não", (escolherReacao({ pers: mago(["Contratempo"], 10), gatilho: "sofre_dano", dano: 20, tipoDano: "fisico" }) || {}).id !== "contratempo");

  /* ÂMBAR DO TEMPO — controle que para (a da classe só prende ao acaso) */
  const am = controleDe(h("Arcanista", "Âmbar do Tempo"));
  t("Âmbar do Tempo é controle de parar", !!am && am.id === "ambar_do_tempo" && am.modo === "parar" && am.cond === "paralisado");
  const campo = [{ nome: "Ogro", vida: 30, vidaMax: 30 }, { nome: "Lobo", vida: 10, vidaMax: 10 }];
  const r = aplicarControle(campo, am, { rodada: 1, alvoNome: "Lobo", nomeHab: "Âmbar do Tempo" });
  const lobo = r.inimigos.find((e) => e.nome === "Lobo");
  t("…o alvo citado fica paralisado pelos dois turnos da descrição", r.ok && lobo.condicoes.some((c) => c.id === "paralisado") && am.turnos === 2);
  t("…e o outro fica intacto", !(r.inimigos.find((e) => e.nome === "Ogro").condicoes || []).length);
  t("…e não mexe na lista que recebeu", !campo[1].condicoes);
  t("a Prisão Arcana do Mago NÃO virou controle (continua a da classe)", !controleDe(daClasse("Mago", "Prisão Arcana")));

  /* FERIDA QUE NÃO HOUVE — desfaz o dano da rodada, com o nome dela.
     Ela ia levar junto o veneno (porta `Purificar`), e check-cura-nao-limpa
     travou: habilidades.js só devolve PV. A prova abaixo trava as DUAS
     coisas — devolve o dano e NÃO toca em condição —, para o reforço, se
     vier, vir pela porta declarada e não por aqui. */
  const fq = h("Arcanista", "Ferida que Não Houve");
  t("Ferida que Não Houve é das que desfazem", ehReescrever(fq));
  const envenenado = { nome: "Ilse", vida: 10, vidaMax: 40, condicoes: [criarCondicao("envenenado", { turnos: 3 })] };
  const sub = reescreverInstante(envenenado, 15, fq);
  t("…devolve o dano da rodada", sub.ok && sub.pers.vida === 25);
  t("…e não toca em condição (a cura não limpa: lei da casa)", sub.pers.condicoes === envenenado.condicoes);
  t("…e a linha diz o nome dela, não o da do Mago", /Ferida que Não Houve/.test(sub.linha) && !/Reescrever/.test(sub.linha));
  t("…sem mexer na ficha recebida", envenenado.condicoes.length === 1 && envenenado.vida === 10);
  const cls = reescreverInstante(envenenado, 15, daClasse("Mago", "Reescrever o Instante"));
  t("a do Mago devolve o mesmo dano, com o nome dela", cls.pers.vida === 25 && /Reescrever o Instante/.test(cls.linha));
  const semHab = reescreverInstante(envenenado, 15);
  t("sem dizer qual (o App de antes), é a do Mago", /Reescrever o Instante/.test(semHab.linha));
  t("lixo: null e {} caem na do Mago", /Reescrever o Instante/.test(reescreverInstante(envenenado, 15, null).linha) && /Reescrever o Instante/.test(reescreverInstante(envenenado, 15, {}).linha));
  t("lixo: sem dano, recusa com o nome certo", /Ferida que Não Houve/.test(reescreverInstante(envenenado, 0, fq).linha));
  t("lixo: ehReescrever(null) é falso", !ehReescrever(null) && !ehReescrever({}));

  /* GOLPE DE MISERICÓRDIA — o limiar que dobra (o da classe abate) */
  const gm = limiarDe(h("Assassino", "Golpe de Misericórdia"));
  t("Golpe de Misericórdia dobra abaixo da metade", !!gm && gm.modo === "dobra" && gm.fracao === 0.5);
  t("…e a Execução do Ladino continua a abater", limiarDe(daClasse("Ladino", "Execução")).modo === "abate");

  /* LUZ DO JUÍZO — dano em área que cega (a da classe marca um) */
  const lj = h("Paladino", "Luz do Juízo");
  t("Luz do Juízo é golpe (a régua do golpe acha 'dano')", /\bdano\b/i.test(lj.descricao || ""));
  t("…em área", ehArea(lj));
  t("…que cega", (aflicaoDe(`${lj.nome} ${lj.descricao}`) || {}).id === "cegueira");
  t("…e o Julgamento do Clérigo continua a marcar", (aflicaoDe(`Julgamento ${daClasse("Clérigo", "Julgamento").descricao}`) || {}).id === "marca");

  /* FLECHAS GÊMEAS — a pressa, por dois turnos (a do tronco dá um) */
  const fg = pressaDe(h("Arqueiro", "Flechas Gêmeas"));
  const td = pressaDe(daClasse("Caçador", "Tiro Duplo"));
  t("Flechas Gêmeas é pressa", !!fg && fg.id === "flechas_gemeas" && fg.acoes === 2);
  t("…de dois turnos, e o Tiro Duplo de um", fg.turnos === 2 && td.turnos === 1);
  const ap = apressar({ nome: "R" }, h("Arqueiro", "Flechas Gêmeas"), 3);
  t("…e o herói age duas vezes até a rodada 5", ap.ok && ap.pers.pressa.acoes === 2 && ap.pers.pressa.ate === 5);
  t("…sem o falso positivo da corda (nenhuma aflição)", !aflicaoDe(`Flechas Gêmeas ${h("Arqueiro", "Flechas Gêmeas").descricao}`));

  /* PONTA DE AGULHA — fura a armadura */
  const pa = ignoraDoGolpe(h("Arqueiro", "Ponta de Agulha"));
  t("Ponta de Agulha ignora a armadura", !!pa && pa.id === "ponta_agulha" && pa.armadura === true);
  t("…e a linha leva o nome dela", /Ponta de Agulha/.test(linhaDoIgnorar(pa, h("Arqueiro", "Ponta de Agulha"))));
  t("…é um alvo só (a do tronco, em linha, continua em linha)", !ehArea(h("Arqueiro", "Ponta de Agulha")) && ehArea(daClasse("Caçador", "Flecha Perfurante")));

  /* SARAIVADA — dano em todos */
  const sv = h("Arqueiro", "Saraivada");
  t("Saraivada é golpe em área", /\bdano\b/i.test(sv.descricao || "") && ehArea(sv));

  /* TIRO DE MIL PASSOS — a distância e a cobertura deixam de contar */
  const mp = ignoraDoGolpe(h("Arqueiro", "Tiro de Mil Passos"));
  t("Tiro de Mil Passos ignora cobertura, com o alcance longo da casa", !!mp && mp.id === "mil_passos" && mp.cobertura && mp.alcanceM >= 90);
  t("…e é golpe (o Tiro do Fim do tronco nem chega à régua: AGUARDAM)", /\bdano\b/i.test(h("Arqueiro", "Tiro de Mil Passos").descricao || ""));

  /* PUNHOS EM CASCATA — a sequência num alvo */
  const pc = h("Punho de Ferro", "Punhos em Cascata");
  t("Punhos em Cascata é golpe (a régua acha 'golpe') e num alvo só", /golpe/i.test(pc.descricao || "") && !ehArea(pc));

  /* PÉS LIGEIROS — o passivo de movimento, mais a pressa ao usar */
  const pl = h("Andarilho", "Pés Ligeiros");
  t("Pés Ligeiros é passivo de movimento", (poderDe(pl) || {}).id === "pes_ligeiros");
  t("…lido pela ficha em texto cru", temPassivoDeClasse({ habilidades: ["Pés Ligeiros"] }, "movimento"));
  t("…e o movimento dobra de verdade", dobraMovimento({ habilidades: ["Pés Ligeiros"] }));
  t("…ao usar, deixa apressado", (aflicaoDe(`${pl.nome} ${pl.descricao}`) || {}).id === "pressa");
  const ps = passoDeHabilidade(pl);
  t("…e no grid dobra o passo e ignora terreno difícil", !!ps && ps.dobra && ps.ignoraDificil);
  t("o Passo do Vento do Monge continua com a linha dele", (poderDe(daClasse("Monge", "Passo do Vento")) || {}).id === "passo_do_vento");
}

console.log(`\nnomes únicos (C1): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
