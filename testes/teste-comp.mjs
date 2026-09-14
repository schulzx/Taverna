import { classeDeCompanheiro, garantirFichaCompanheiro, decidirAcaoCompanheiro, resumoGrupoPrompt, ehGuarda } from "../src/companheiros.js";
import { turnoDosCompanheiros } from "../src/combate.js";
import { itemConsumivel } from "../src/pocoes.js";
import { guardaDe } from "../src/habilidades.js";
import { efeitoDeBuff } from "../src/efeitos.js";
import { rng, hashSemente } from "../src/semente.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[que classe é cada companheiro]");
for (const [comp, esperado] of [
  [{ nome: "Elira", conceito: "curandeira do templo" }, "Clérigo"],
  [{ nome: "Doran", conceito: "mercenário veterano" }, "Guerreiro"],
  [{ nome: "Nyx", conceito: "gatuna das ruas" }, "Ladino"],
  [{ nome: "Sable", conceito: "erudito arcano" }, "Mago"],
  [{ nome: "Rook", conceito: "arqueiro das matas" }, "Caçador"],
  [{ nome: "Lyra", conceito: "menestrel" }, "Bardo"],
]) ok(classeDeCompanheiro(comp) === esperado, `${comp.nome} (${comp.conceito}) → ${classeDeCompanheiro(comp)}`);

console.log("\n[ficha completa]");
const elira = garantirFichaCompanheiro({ nome: "Elira", conceito: "curandeira do templo", nivel: 6, vida: 40, vidaMax: 40 });
console.log(`  ${elira.nome}: ${elira.classe} nv${elira.nivel}, ${elira.mana}/${elira.manaMax} PM`);
console.log(`    habilidades: ${elira.habilidades.map(h => h.nome + "(" + h.custo + "PM)").join(", ")}`);
ok(elira.classe === "Clérigo" && elira.habilidades.length > 0, "curandeira ganhou classe e habilidades do catálogo");
ok(elira.habilidades.some(h => /cura|restaur|circulo|círculo/i.test(h.nome + " " + (h.descricao||""))), "e tem pelo menos uma cura de verdade");

console.log("\n[decisões em combate]");
const inimigos = [{ nome: "Goblin", vida: 20, vidaMax: 20, ameaca: "fraco", nivel: 2, condicoes: [] }];
const heroiFerido = { nome: "Vera", vida: 12, vidaMax: 90, condicoes: [] };
const d1 = decidirAcaoCompanheiro(elira, { aliados: [], inimigos, jogador: heroiFerido, rodada: 3 });
ok(d1.tipo === "cura" && d1.alvo === "Vera", `herói a 12/90 → ${d1.tipo} em ${d1.alvo} (${d1.habilidade && d1.habilidade.nome})`);

const heroiInteiro = { nome: "Vera", vida: 90, vidaMax: 90, condicoes: [] };
const d2 = decidirAcaoCompanheiro(elira, { aliados: [], inimigos, jogador: heroiInteiro, rodada: 1 });
ok(["buff", "habilidade", "ataque"].includes(d2.tipo), `todos inteiros, rodada 1 → ${d2.tipo}${d2.habilidade ? " (" + d2.habilidade.nome + ")" : ""}`);

const semMana = garantirFichaCompanheiro({ nome: "Doran", conceito: "mercenário", nivel: 5, vida: 40, vidaMax: 40, mana: 0 });
const d3 = decidirAcaoCompanheiro(semMana, { aliados: [], inimigos, jogador: heroiInteiro, rodada: 5 });
ok(d3.tipo === "ataque", `sem PM → ${d3.tipo} (cai na arma)`);

const comPocao = garantirFichaCompanheiro({ nome: "Nyx", conceito: "gatuna", nivel: 4, vida: 8, vidaMax: 40, mana: 0, inventario: [itemConsumivel("cura_m")] });
const d4 = decidirAcaoCompanheiro(comPocao, { aliados: [], inimigos, jogador: heroiInteiro, rodada: 4 });
ok(d4.tipo === "pocao" && d4.alvo === "Nyx", `companheiro a 8/40 com poção na bolsa → ${d4.tipo} em ${d4.alvo}`);

console.log("\n[turno completo do grupo]");
const grupo = [elira, garantirFichaCompanheiro({ nome: "Doran", conceito: "mercenário veterano", nivel: 6, vida: 45, vidaMax: 45 })];
const acoes = turnoDosCompanheiros({ grupo, inimigos, jogadorCaido: true, jogadorNome: "Vera", jogador: { nome: "Vera", vida: 0, vidaMax: 90, morrendo: true, condicoes: [] }, rodada: 2 });
acoes.forEach(a => console.log(`  ${a.companheiro}: ${a.tipo}${a.habilidade ? " " + a.habilidade.nome : ""}${a.alvo ? " → " + a.alvo : ""}${a.alvoNome ? " → " + a.alvoNome : ""}${a.valor ? " (+" + a.valor + " PV)" : ""}`));
ok(acoes.some(a => a.tipo === "cura" && a.valor > 0), "com o herói caído, alguém cura DE VERDADE (com valor)");

console.log("\n[o que o Mestre lê]\n  " + resumoGrupoPrompt(grupo));

/* ---------------- O PM DO COMPANHEIRO NA TELA (v9.184) ----------------
   `painel-grupo-v2` desenha duas barras por membro, e foi ao trazer isso que
   apareceu o buraco: `companheiros.js` dá manaMax a todo companheiro desde
   sempre, o resumo que o Mestre lê já dizia "12/16 PM", e as habilidades
   deles cobram PM — mas o cartão do painel passava só vida. Quem comandava o
   grupo não tinha como saber se o curandeiro ainda podia curar. */
console.log("\n[o PM do companheiro chega ao painel]");
{
  const { readFileSync } = await import("node:fs");
  const APP = readFileSync("../src/App.jsx", "utf8");
  const c = garantirFichaCompanheiro({ nome: "Prova", classe: "Clérigo", nivel: 3 });
  ok(c.manaMax > 0, "o companheiro nasce com mana máxima");
  ok(c.mana != null, "e com mana de agora");
  /* o cartão só desenha a barra de mana quando manaMax chega — e chegava
     `undefined` para todo companheiro */
  ok(/\{manaMax != null && <BarraMini rotulo="PM"/.test(APP), "o cartão desenha PM quando recebe manaMax");
  ok(/nivel=\{m\.nivel\} vida=\{m\.vida\} vidaMax=\{m\.vidaMax\} mana=\{m\.mana\} manaMax=\{m\.manaMax\}/.test(APP),
    "e o painel do grupo passa os dois");
  /* o cabeçalho de `painel-grupo-v2`: o ponto vivo, e a contagem que o
     desenho não faz */
  ok(/O grupo de aventura · \{1 \+ \(personagem\.grupo \|\| \[\]\)\.filter\(\(g\) => !g\.invocada\)\.length\} de \{1 \+ MAX_COMPANHEIROS\}/.test(APP),
    "o cabeçalho conta quantos cabem ainda");
}
/* ---------------- A GUARDA DO COMPANHEIRO NA MESA (v9.232 · P2) ----------
   `decidirAcaoCompanheiro` já escolhe a guarda (a catraca que prova isso
   para as NOVE entradas da tabela mora em `teste-guardas`, seção 6). O que
   se prova AQUI é o turno completo: que a habilidade escolhida SOBREVIVE à
   travessia por `turnoDosCompanheiros` até a ação que a tela e a arena
   recebem. Era exatamente aí que ela morria — a ação saía `{tipo:"guarda"}`
   pelada, e quem fosse aplicá-la não tinha o que erguer.

   DUAS AÇÕES CHEGAM PELO MESMO NOME, e é a PRESENÇA DO CAMPO que as separa:
     · COM `habilidade` (e `custo`) é a guarda escolhida — há o que erguer;
     · SEM habilidade é a meia-rodada seca de quando não sobrou inimigo de
       pé, que existe desde sempre e não pode ter sido levada junto.
   As duas entram na mesma seção porque a lei é uma só.

   A SORTE É TRAVADA (o molde é `comSorteTravada`, de arena.js): o passo de
   apoio abre com `Math.random() < 0.7`, e asserção que passa 7 vezes em 10
   não é prova. */
console.log("\n[a guarda do companheiro atravessa o turno]");
{
  const comSorteTravada = (valor, fn) => {
    const original = Math.random;
    Math.random = () => valor;
    try { return fn(); } finally { Math.random = original; }
  };
  const SORTE_QUE_ABRE_O_APOIO = 0;   /* < 0.7: o portão do passo 3 passa */
  const heroiDePe = { nome: "Vera", vida: 90, vidaMax: 90, condicoes: [] };
  const goblins = [{ nome: "Goblin", vida: 20, vidaMax: 20, condicoes: [] }];

  /* fichas de VERDADE, pelo mesmo caminho do jogo: o Druida de nível 8 leva
     Casca de Carvalho e o Engenheiro leva Elixir de Combate porque o
     catálogo as dá a eles, não porque o teste as enfiou na mão. */
  for (const [nome, conceito] of [["Vera", "druida das matas"], ["Kork", "engenheiro inventor"]]) {
    const c = garantirFichaCompanheiro({ nome, conceito, nivel: 8, vida: 50, vidaMax: 50 });
    const daTabela = (c.habilidades || []).filter((h) => ehGuarda(h));
    ok(daTabela.length > 0, `${nome} (${c.classe}) nasce com guarda na ficha: ${daTabela.map((h) => h.nome).join(", ") || "NENHUMA"}`);

    const acoes = comSorteTravada(SORTE_QUE_ABRE_O_APOIO, () =>
      turnoDosCompanheiros({ grupo: [c], inimigos: goblins, jogador: heroiDePe, jogadorNome: "Vera", rodada: 1 }));
    const g = acoes.find((a) => a.tipo === "guarda");
    ok(!!g && !!g.habilidade && !!guardaDe(g.habilidade),
      `${nome}: a ação chega com a habilidade da tabela — ${g && g.habilidade ? g.habilidade.nome : "SEM HABILIDADE"}`);
    /* o custo viaja junto porque quem aplica desconta PM por ele; sem o
       campo a guarda sairia de graça */
    ok(!!g && Number(g.custo) === Number(g.habilidade && g.habilidade.custo) && Number(g.custo) > 0,
      `${nome}: e com o custo em PM (${g ? g.custo : "—"})`);
  }

  /* A AÇÃO SECA, inteira como sempre foi: sem inimigo de pé não há plano de
     apoio, e `{tipo:"guarda"}` sem habilidade é a meia-rodada legítima que
     a arena já sabe narrar. Se ela passasse a carregar habilidade, a arena
     ergueria guarda depois da luta acabada. */
  {
    const c = garantirFichaCompanheiro({ nome: "Vera", conceito: "druida das matas", nivel: 8, vida: 50, vidaMax: 50 });
    const secas = comSorteTravada(SORTE_QUE_ABRE_O_APOIO, () =>
      turnoDosCompanheiros({ grupo: [c], inimigos: [], jogador: heroiDePe, jogadorNome: "Vera", rodada: 1 }));
    const s = secas.find((a) => a.tipo === "guarda");
    ok(!!s && s.habilidade === undefined && s.custo === undefined,
      `sem inimigo de pé a guarda continua SECA (sem habilidade e sem custo): ${JSON.stringify(s)}`);
  }
}

/* ---------------- E A FIAÇÃO NO APP (v9.232 · P2) ----------------
   A lição de R4: a âncora mede a DEFINIÇÃO, nunca o sítio de chamada — e um
   ramo do `App.jsx` é invisível ao `teste-ligacao`, que só conta leitores de
   export. Estas três regexes são o que impede o ramo de sumir num refator
   sem ninguém ficar vermelho: sem elas, `App.jsx` volta a receber
   `ac.tipo === "guarda"` e a não ter o que fazer com ele — o turno do
   companheiro queimando em silêncio, que é a doença que P2 veio fechar. */
console.log("\n[a guarda do grupo está ligada no App]");
{
  const { readFileSync } = await import("node:fs");
  const APP = readFileSync("../src/App.jsx", "utf8");
  ok(/ac\.tipo === "guarda"/.test(APP) && /erguerGuarda\(comp, ac\.habilidade/.test(APP),
    "o turno do grupo tem ramo de guarda, e quem ergue é erguerGuarda");
  /* o prazo: sem ele Casca de Carvalho seria +4 de defesa PERMANENTE no
     companheiro, porque `defesaDe` já soma `defesaDeGuarda` na ficha dele */
  ok(/expirarGuardas\(g, proxima\)/.test(APP), "e o prazo das guardas do grupo corre no mesmo relógio do herói");
  /* e a porta: guarda de combate não atravessa o fim da luta */
  ok(/baixarGuardas\(g\)/.test(APP), "e no fim da luta a guarda do grupo baixa junto com a do herói");
}

/* ============================================================
   O BÔNUS DO COMPANHEIRO PESA NO GOLPE (v9.247 · B2)

   POR QUE AQUI. O órgão que mudou é `turnoDosCompanheiros` — esta suíte é a
   dele, é a única que já o exercitava como TURNO COMPLETO (a seção da guarda,
   logo acima, prova que a decisão sobrevive à travessia), e a lei nova é da
   mesma família: o que o piloto decide tem de chegar inteiro à mesa. A metade
   que acontece DEPOIS da ação — a arena não somar o bônus uma segunda vez —
   fica em `teste-arena`, seção 12, porque lá é que mora a porta que soma.

   O QUE B2 FECHOU. Até a v9.245 este turno não continha a palavra `efeitos`:
   o companheiro firmava um buff com `bonus: N`, a metade DEFENSIVA valia
   (`absorverDano` a lê) e a OFENSIVA não valia em canto nenhum da mesa da
   campanha. Medido nesta mesma sonda contra a árvore em `eadef55` (HEAD antes
   de B2): com o efeito de +3 firmado, o dano médio por golpe era 11,566 — o
   MESMO de sem efeito nenhum, delta 0,000. Turno pago, metade comprada.

   A CONVENÇÃO QUE SE PROVA AQUI é a do herói: o bônus entra em `danoBase`,
   ANTES do dado, e portanto DOBRA no crítico. É essa a diferença que estas
   asserções mordem, e ela é pequena de propósito — a distância entre o certo
   e o quase-certo é de 0,16 de dano médio, e um teste que só olhasse "o dano
   subiu" passaria nos dois. Por isso a prova é dupla:

     (a) A LEI EXATA, golpe a golpe. Como o bônus é lido ANTES de `d(4)`,
         nenhum dado a mais é consumido: com a mesma semente, a série de d20 e
         a série de resultados são IDÊNTICAS com e sem efeito. Então cada
         golpe pode ser conferido isolado — crítico soma 2×bônus, acerto soma
         1×bônus, erro e desastre somam zero — e 20 mil golpes conferem sem
         uma única exceção. Esta é a asserção que morde mais fino: mover o
         bônus para depois do dado deixa os críticos errados e nada mais.

     (b) O RETRATO MEDIDO, que é o que se enxerga na mesa. Médias desta sonda:
         11,566 sem efeito · 14,582 com o mesmo efeito de +3 · delta 3,015.
         O delta tem explicação fechada e ela vem da amostra, não de um número
         escrito à mão: 1054 críticos e 17993 acertos em 20 mil golpes dão
         (1054×2 + 17993)×3/20000 = 3,015 se o bônus dobra, e 2,857 se não
         dobra. O medido é 3,015 — e a asserção exige que ele esteja mais
         perto do primeiro que do segundo, que é a forma honesta de cobrar
         "a convenção do herói foi respeitada" sem cravar um dígito de RNG.

   A FORÇA DO BÔNUS SAI DA TABELA, e por isso nasce de `efeitoDeBuff`
   (efeitos.js) — `BUFF_DA_HABILIDADE` decide quanto um buff de 6 PM vale, e
   este teste não tem opinião sobre isso. As duas variantes (o abrigo e o
   mágico) são o MESMO efeito com um campo trocado, de propósito: é a única
   forma de provar que quem veta é o rótulo, e não o número.
   ============================================================ */
console.log("\n[o bônus do companheiro pesa no golpe (B2)]");
{
  const NIVEL = 5, N = 20000;
  const SEMENTE = "b2|o peso do companheiro";
  const comSemente = (semente, fn) => {
    const original = Math.random;
    Math.random = rng(hashSemente(semente));
    try { return fn(); } finally { Math.random = original; }
  };

  /* Guerreiro sem arma: `danoBase` é 4 + nível + d(4), tudo inteiro, sem
     multiplicador de perfil (golpe de arma é FÍSICO e `multiplicadorDano`
     devolve 1 para físico) e sem resistência — o bônus é a ÚNICA diferença
     entre as duas séries. */
  const doran = (efeitos) => ({
    nome: "Doran", classe: "Guerreiro", nivel: NIVEL,
    vida: 100, vidaMax: 100, mana: 0, manaMax: 0,
    habilidades: [], condicoes: [], efeitos: efeitos || [], equipados: {},
  });
  /* o saco de pancada: defesa 5 contra +7 de ataque, para que só o 1 natural
     erre — assim a amostra tem a forma limpa (5% desastre · 5% crítico · 90%
     acerto) de que a conta do delta precisa */
  const poste = () => [{ nome: "Poste", vida: 1e6, vidaMax: 1e6, ameaca: "comum", nivel: 1, defesa: 5, condicoes: [] }];
  const vera = () => ({ nome: "Vera", vida: 90, vidaMax: 90, condicoes: [] });

  const serie = (efeitos) => comSemente(SEMENTE, () => {
    const danos = [], res = [], d20 = [], bonus = [];
    const inim = poste();
    for (let i = 0; i < N; i++) {
      for (const a of turnoDosCompanheiros({ grupo: [doran(efeitos)], inimigos: inim, jogador: vera(), jogadorNome: "Vera", rodada: 3 })) {
        if (!a.r) continue;
        danos.push(a.r.dano); res.push(a.r.resultado); d20.push(a.r.d20); bonus.push(a.bonus);
      }
    }
    return { danos, res, d20, bonus };
  });
  const media = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;

  /* O EFEITO VEM DA PORTA DA CASA: força e prazo saem de `BUFF_DA_HABILIDADE`
     por `efeitoDeBuff`, e o escopo sai da natureza da classe de quem firma. */
  const HINO = { nome: "Hino do Fosso", descricao: "o canto sobe pelas costas de quem luta", custo: 6 };
  const EFEITO = efeitoDeBuff(HINO, doran([]), undefined).efeito;
  const B = EFEITO.bonus;
  const ABRIGO = { ...EFEITO, aplica: "protecao" };   /* só o rótulo muda */
  const MAGICO = { ...EFEITO, escopo: "magico" };     /* só o escopo muda */

  ok(B > 0 && EFEITO.aplica === "dano" && EFEITO.escopo === "fisico",
    `o buff de 6 PM nasce da tabela: +${B} de dano físico`);

  const SEM = serie([]);
  const COM = serie([EFEITO]);
  const PRO = serie([ABRIGO]);

  const crits = SEM.res.filter((r) => r === "critico").length;
  const acertos = SEM.res.filter((r) => r === "acerta").length;
  console.log(`  amostra: ${SEM.danos.length} golpes · ${crits} críticos · ${acertos} acertos`);
  console.log(`  médias: sem efeito ${media(SEM.danos).toFixed(3)} · com +${B} ${media(COM.danos).toFixed(3)} · abrigo ${media(PRO.danos).toFixed(3)}`);

  /* ---- a sorte semeada não se moveu ----
     O RETRATO CONGELADO, medido na árvore em `eadef55` (antes de B2) e
     reproduzido idêntico depois dela: mesma semente, companheiro SEM efeito
     nenhum, mesma soma e mesmos doze primeiros golpes. É a prova de que o
     bônus é lido ANTES de `d(4)` e não consome um dado a mais — se alguém o
     mover para depois do dado, a série inteira anda e estes dois números
     mudam no mesmo instante. */
  const SOMA_EM_eadef55 = 231327;
  const PRIMEIROS_EM_eadef55 = "20,10,0,12,10,12,12,10,12,0,12,13";
  ok(SEM.danos.reduce((s, x) => s + x, 0) === SOMA_EM_eadef55,
    `sem efeito, a mesma semente dá a mesma soma de antes de B2 (${SEM.danos.reduce((s, x) => s + x, 0)} vs ${SOMA_EM_eadef55})`);
  ok(SEM.danos.slice(0, 12).join(",") === PRIMEIROS_EM_eadef55,
    `e os doze primeiros golpes, na ordem (${SEM.danos.slice(0, 12).join(",")})`);
  ok(SEM.d20.join() === COM.d20.join() && SEM.d20.join() === PRO.d20.join(),
    "e o efeito não consome dado nenhum: a série de d20 é idêntica nas três");

  /* ---- (a) a lei exata, golpe a golpe ---- */
  let fugiram = 0, exemplo = "";
  for (let i = 0; i < SEM.danos.length; i++) {
    const esperado = SEM.res[i] === "critico" ? SEM.danos[i] + 2 * B
      : SEM.res[i] === "acerta" ? SEM.danos[i] + B
      : SEM.danos[i];
    if (COM.danos[i] !== esperado) { fugiram++; if (!exemplo) exemplo = `golpe ${i} (${SEM.res[i]}): ${SEM.danos[i]} → ${COM.danos[i]}, esperado ${esperado}`; }
  }
  /* o piso de críticos existe para a asserção acima não passar VAZIA: sem
     crítico na amostra, "dobra no crítico" não é medido por ninguém */
  ok(crits >= 500, `a amostra tem crítico de sobra para a lei do dobro morder (${crits})`);
  ok(fugiram === 0, `todo golpe soma o bônus antes do dado — crítico 2×${B}, acerto ${B}, erro 0 (${fugiram} fora da lei${exemplo ? "; " + exemplo : ""})`);

  /* ---- (b) o retrato medido, e a conta que separa dobrar de não dobrar ---- */
  const delta = media(COM.danos) - media(SEM.danos);
  const seDobra = (crits * 2 + acertos) * B / SEM.danos.length;
  const seNaoDobra = (crits + acertos) * B / SEM.danos.length;
  console.log(`  delta medido ${delta.toFixed(3)} · previsto dobrando ${seDobra.toFixed(3)} · previsto sem dobrar ${seNaoDobra.toFixed(3)}`);
  ok(Math.abs(delta - seDobra) < Math.abs(delta - seNaoDobra) && Math.abs(delta - seDobra) < 0.01,
    `o bônus DOBRA no crítico: delta ${delta.toFixed(3)} cola em ${seDobra.toFixed(3)} e não em ${seNaoDobra.toFixed(3)}`);
  ok(COM.bonus.every((b) => b === B) && SEM.bonus.every((b) => b === 0),
    "e o número viaja na ação, para quem narra não ter de recalculá-lo");

  /* ---- o abrigo não vira espada ----
     Mesmo efeito, mesma força, só o rótulo `aplica` trocado. Quem veta é
     `efeitoNoGolpe` (combos.js); sem dente ali, o escudo passaria a somar no
     golpe e a série do abrigo seria a série de COM. */
  ok(PRO.danos.join() === SEM.danos.join(),
    `o mesmo +${B} com aplica:"protecao" não move um ponto de dano (média ${media(PRO.danos).toFixed(3)})`);
  ok(PRO.bonus.every((b) => b === 0) && PRO.danos.join() !== COM.danos.join(),
    "e a ação sai sem bônus — o abrigo não é lido como espada");

  /* ---- o escopo é respeitado: o buff físico não levanta feitiço ----
     Um Mago com efeito MÁGICO: a habilidade dele é arcana e recebe o bônus, o
     golpe de arma não — `bonusDeArma` é físico por definição e pula o escopo
     mágico. Com o efeito FÍSICO a divergência se inverte. A sorte é travada
     num valor fixo porque o que se mede aqui é o CAMPO `bonus`, não o dano:
     `Math.random` em 0 escolhe a ofensiva no passo 4 e torna o turno inteiro
     previsível. */
  const comSorteTravada = (valor, fn) => {
    const original = Math.random;
    Math.random = () => valor;
    try { return fn(); } finally { Math.random = original; }
  };
  const DARDO = { nome: "Dardo do Fosso", descricao: "uma agulha de luz fria", custo: 4, tipo: "ataque" };
  const mago = (efeitos, mana) => ({
    nome: "Sable", classe: "Mago", nivel: NIVEL,
    vida: 100, vidaMax: 100, mana, manaMax: 10,
    habilidades: [DARDO], condicoes: [], efeitos, equipados: {},
  });
  const agir = (efeitos, mana) => comSorteTravada(0, () =>
    turnoDosCompanheiros({ grupo: [mago(efeitos, mana)], inimigos: poste(), jogador: vera(), jogadorNome: "Vera", rodada: 3 })[0]);

  for (const [rotulo, ef, noFeitico, naArma] of [
    ["mágico", MAGICO, B, 0],
    ["físico", EFEITO, 0, B],
  ]) {
    const porFeitico = agir([ef], 10);
    const porArma = agir([ef], 0);
    ok(porFeitico.tipo === "habilidade" && porArma.tipo === "ataque",
      `o Mago com efeito ${rotulo} dá os dois golpes (${porFeitico.tipo} e ${porArma.tipo})`);
    ok(porFeitico.bonus === noFeitico && porArma.bonus === naArma,
      `e o efeito ${rotulo} vale ${noFeitico} no feitiço e ${naArma} na arma (medido ${porFeitico.bonus} e ${porArma.bonus})`);
    ok((noFeitico > 0) === (porFeitico.fontes || []).includes(EFEITO.nome)
      && (naArma > 0) === (porArma.fontes || []).includes(EFEITO.nome),
      `e as fontes contam a mesma história do número (${rotulo})`);
  }
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
