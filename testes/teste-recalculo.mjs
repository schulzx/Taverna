/* O RECÁLCULO QUE NÃO SE MEXE (Z1) — a prova ANTES da fiação.

   POR QUE ESTA SUÍTE EXISTE, e ela vale mais do que a remoção que a
   motivou. A recalibração por IA morre porque pedir o nível e os
   atributos do jogador a um modelo é pedir um número diferente a cada
   chamada. Mas a lei desta fase não é «tirar a IA»: é a frase da pessoa,
   em 15/09 —

     «desde que não mude os dados do player sem que ele saiba e
      principalmente sem que seja necessário — cada vez que o player abrir
      o game o sistema recalcula e ele fica com status diferente em cada
      gameplay, seria inaceitável.»

   Trocar um oráculo instável por um recálculo determinístico que MEXE na
   ficha a cada abertura não conserta nada: só troca o ruído de origem. Por
   isso a prova vem antes do fio. Z2 só pode ligar ao jogo uma peça que
   alguém já provou que fica quieta.

   AS TRÊS PROPRIEDADES QUE SÃO LEI (vermelhas):
     §3  IDEMPOTENTE — recalcular n vezes = recalcular uma, n = 1..10.
     §4  MUDO QUANDO NÃO É PRECISO — save certo sai byte a byte igual, e
         pela IDENTIDADE do objeto (nem clone houve); nada fora de
         `CAMPOS_DO_RECALCULO` é tocado.
     §5  AS DERIVAÇÕES BATEM COM AS TABELAS — lidas de volta de
         `regras.js`, `regras-jogo.js`, `classes.js` e `antecedentes.js`.
         Nenhum `6` nem `+4` escrito à mão nesta suíte: a asserção compara
         o módulo com a TABELA, e é isso que a faz sobreviver ao dia em
         que a tabela mudar.

   E O QUE NÃO É LEI (§8, impresso e não travado): quantas fichas de HOJE
   o recálculo mudaria, e quanto. Se ele discordar de uma ficha que já
   está no jogo, isso é ACHADO — a suíte relata, não legisla. Quem decide
   se a ficha ou a fórmula está errada é a pessoa, não o teste. */

const RAIZ = "../src/";

/* O módulo em prova. Se ele ainda não existir, esta suíte cai aqui e diz
   exatamente porquê — nunca inventa um duplo. Uma prova escrita contra um
   falso módulo prova o falso módulo. */
let REC = null, faltou = null;
try { REC = await import(RAIZ + "recalculo.js"); }
catch (e) { faltou = e && e.message ? e.message : String(e); }

if (!REC) {
  console.log("\nXX  `src/recalculo.js` ainda não existe — a suíte de Z1 não tem o que provar.");
  console.log("    " + faltou);
  console.log("\nrecálculo (Z1): 0 passaram, 1 falharam");
  process.exit(1);
}

const { CAMPOS_DO_RECALCULO, corpoDaFicha, diferencasDaFicha, recalcularFicha } = REC;

/* AS TABELAS, importadas para serem LIDAS DE VOLTA — nunca copiadas. */
const { bonusProficiencia, XP_ACUMULADO } = await import(RAIZ + "regras.js");
const { PV_POR_NIVEL, PM_POR_NIVEL, aplicarNivel } = await import(RAIZ + "regras-jogo.js");
const { CLASSES, classePorNome } = await import(RAIZ + "classes.js");
const { ANTECEDENTES } = await import(RAIZ + "antecedentes.js");
const { PRONTOS, montarPronto } = await import(RAIZ + "prontos.js");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
/* O PENDENTE — imprime, não conta, não derruba. É o molde de
   `teste-regua.mjs` e de `teste-guardado.mjs`: a medida fica visível em
   todo `npm test` sem ter força de lei. Aqui ele carrega §8 inteira. */
const pendente = (nome, valor) => console.log("  ··  " + nome + " — " + valor + "  (medido, não travado)");
const comecou = Date.now();

/* Igualdade profunda insensível à ordem das chaves. `JSON.stringify` puro
   também é usado (§4 exige a comparação byte a byte do save), mas para a
   idempotência a ordem das chaves é ruído: um `{...pers}` pode reordenar
   sem mudar um único valor, e uma catraca que morde reordenação morde a
   linguagem, não a regra. */
function iguais(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== "object" || typeof b !== "object") return Number.isNaN(a) && Number.isNaN(b);
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && iguais(a[k], b[k]));
}

const mediana = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const amostra = (lista, n = 3) => lista.slice(0, n).join(" | ") + (lista.length > n ? ` … (+${lista.length - n})` : "");

/* ============================================================
   A FÓRMULA, REMONTADA A PARTIR DAS TABELAS

   Esta é a única reimplementação da suíte, e é deliberada: é a fórmula de
   `src/prontos.js:171-173`, a que o `backend` está a substituir por uma
   chamada a `corpoDaFicha`. Provar `corpoDaFicha` contra ela é provar que
   a EXTRAÇÃO foi de graça — e ela é remontada de `vidaBase`/`manaBase`
   (classes.js), `pv`/`pm` (antecedentes.js) e `PV_POR_NIVEL`/
   `PM_POR_NIVEL` (regras-jogo.js), nunca de números escritos aqui. No dia
   em que uma dessas tabelas mudar, as duas pontas mudam juntas e a
   asserção continua a dizer a verdade.

   AS DUAS GRAFIAS DO ANTECEDENTE: `prontos.js` resolve pelo ID
   (`p.antecedente`), mas a ficha que fica no save guarda o NOME
   (`antecedente: antObj.nome`). As duas têm de chegar ao mesmo corpo,
   senão o recálculo tira 2 PV de todo soldado no dia em que correr — que
   é exatamente «mudar os dados do player sem que ele saiba». Por isso o
   resolvedor daqui aceita as duas, e a §6 pergunta ao módulo se ele
   também aceita.
   ============================================================ */
const antPorRef = (ref) => (ref == null ? null
  : ANTECEDENTES.find((a) => a.id === ref) || ANTECEDENTES.find((a) => a.nome === ref) || null);

function corpoDaTabela({ classe, antecedente, atributos, nivel } = {}) {
  const c = classePorNome(classe);
  const a = antPorRef(antecedente);
  const at = atributos || {};
  const cresce = Math.max(0, (Number(nivel) || 1) - 1);
  return {
    vidaMax: (c ? c.vidaBase : 10) + (Number(at.vigor) || 0) * 2 + ((a && a.pv) || 0) + cresce * PV_POR_NIVEL,
    manaMax: (c ? c.manaBase : 8) + (Number(at.intelecto) || 0) * 2 + ((a && a.pm) || 0) + cresce * PM_POR_NIVEL,
  };
}

/* ============================================================
   O CORPUS — largo de propósito, não um caso simpático

   12 classes (todas as de `classes.js`) × os 7 degraus onde
   `bonusProficiencia` vira ou está prestes a virar (1, 2, 5, 9, 13, 17,
   20) × 2 configurações de atributos × 3 antecedentes (um que dá PV, um
   que dá PM, um que não dá nada — escolhidos LENDO a tabela) × {ficha
   certa, ficha torta}.

   Os degraus não são decorativos: 5, 9, 13 e 17 são exatamente onde
   `bonusProficiencia` muda de patamar, e 1/2/20 são as bordas. Uma suíte
   de idempotência cega aos degraus provaria o platô e não a escada.
   ============================================================ */
const NIVEIS = [1, 2, 5, 9, 13, 17, 20];
const ATRIBUTOS_A = { forca: 1, destreza: 1, vigor: 1, intelecto: 1, presenca: 1, percepcao: 1 };
const ATRIBUTOS_B = { forca: 3, destreza: 2, vigor: 4, intelecto: 5, presenca: 2, percepcao: 2 };
const ANT_PV = ANTECEDENTES.find((a) => a.pv);
const ANT_PM = ANTECEDENTES.find((a) => a.pm);
const ANT_NADA = ANTECEDENTES.find((a) => !a.pv && !a.pm);

/* A ficha guarda o NOME do antecedente — é o que `montarPronto` escreve e
   o que existe em todo save de hoje. O corpus é escrito assim de
   propósito: um corpus com ids provaria um mundo que não existe. */
function fichaCerta(classe, nivel, atributos, ant) {
  const corpo = corpoDaTabela({ classe, antecedente: ant.nome, atributos, nivel });
  return {
    nome: `${classe} ${nivel}`, classe, antecedente: ant.nome,
    atributos: { ...atributos },
    nivel, xp: 0, nivelPendentes: 0, dadivas: [], dadivasPendentes: 0,
    vidaMax: corpo.vidaMax, vida: corpo.vidaMax,
    manaMax: corpo.manaMax, mana: corpo.manaMax,
    proficiencia: bonusProficiencia(nivel),
    /* o lastro que §4 confere campo a campo: nada disto pode mexer-se */
    inventario: ["Corda de 15 m", "Poção de Cura Pequena"],
    condicoes: [], grupo: [], efeitos: [], equipados: {},
    semente: `corpus|${classe}|${nivel}|${ant.id}`,
    moedas: 37, pericias: { atletismo: 1 },
  };
}

/* A FICHA TORTA — e ela é torta nos quatro campos, não num só. O
   `vidaMax` a mais, o `manaMax` a menos, a proficiência de outro degrau e
   o `nivelPendentes` sujo: é o formato de um save que passou por uma
   recalibração por IA e ficou com os números de outra pessoa. */
function tortaDe(f) {
  return { ...f, vidaMax: f.vidaMax + 37, manaMax: Math.max(0, f.manaMax - 5), proficiencia: 99 };
}

const CORPUS = [];
for (const c of CLASSES) {
  for (const nivel of NIVEIS) {
    for (const at of [ATRIBUTOS_A, ATRIBUTOS_B]) {
      for (const ant of [ANT_PV, ANT_PM, ANT_NADA]) {
        const certa = fichaCerta(c.nome, nivel, at, ant);
        CORPUS.push({ rotulo: `${c.nome} n${nivel} ${ant.id} certa`, ficha: certa, torta: false });
        CORPUS.push({ rotulo: `${c.nome} n${nivel} ${ant.id} TORTA`, ficha: tortaDe(certa), torta: true });
      }
    }
  }
}

/* ============================================================
   01 · A TABELA DE CAMPOS
   ============================================================ */
sec("01. `CAMPOS_DO_RECALCULO` — a tabela nomeada, e o contrato inteiro do que pode mexer-se");
{
  const ESPERADA = ["nivel", "vidaMax", "manaMax", "proficiencia"];
  t("é um array", Array.isArray(CAMPOS_DO_RECALCULO));
  t("são os quatro campos acordados, NA ORDEM", Array.isArray(CAMPOS_DO_RECALCULO) && CAMPOS_DO_RECALCULO.join(",") === ESPERADA.join(","),
    `tem: ${Array.isArray(CAMPOS_DO_RECALCULO) ? CAMPOS_DO_RECALCULO.join(",") : String(CAMPOS_DO_RECALCULO)}`);
  t("sem repetidos", new Set(CAMPOS_DO_RECALCULO).size === CAMPOS_DO_RECALCULO.length);
  t("as quatro funções do contrato existem e são funções",
    typeof corpoDaFicha === "function" && typeof diferencasDaFicha === "function" && typeof recalcularFicha === "function");
  console.log(`  ··  corpus: ${CORPUS.length} fichas (${CLASSES.length} classes × ${NIVEIS.length} níveis × 2 atributos × 3 antecedentes × {certa, torta})`);
  console.log(`  ··  antecedentes lidos da tabela: PV=${ANT_PV.id} (+${ANT_PV.pv}) · PM=${ANT_PM.id} (+${ANT_PM.pm}) · nenhum=${ANT_NADA.id}`);
}

/* ============================================================
   02 · A FORMA DA RESPOSTA
   ============================================================ */
sec("02. A FORMA — `recalcularFicha` e `diferencasDaFicha` contam a MESMA história");
{
  const maus1 = [], maus2 = [], maus3 = [];
  for (const { rotulo, ficha, torta } of CORPUS) {
    const r = recalcularFicha(ficha);
    if (!r || typeof r !== "object" || !r.ficha || typeof r.mudou !== "boolean" || !Array.isArray(r.diferencas)) { maus1.push(rotulo); continue; }
    /* `mudou` não é um terceiro dado: é a leitura de `diferencas`. Duas
       fontes de verdade para a mesma pergunta divergem no dia em que
       alguém tocar numa e esquecer a outra. */
    if (r.mudou !== (r.diferencas.length > 0)) maus2.push(rotulo);
    if (!iguais(r.diferencas, diferencasDaFicha(ficha))) maus3.push(rotulo);
    /* e a torta tem de ter diferença: se não tivesse, o corpus torto seria
       decoração e §3/§4 estariam a provar o caso fácil duas vezes */
    if (torta && r.diferencas.length === 0) maus1.push(rotulo + " (torta sem diferença)");
  }
  t("toda ficha devolve `{ ficha, mudou, diferencas }` bem formado", maus1.length === 0, amostra(maus1));
  t("`mudou === (diferencas.length > 0)`, sempre", maus2.length === 0, amostra(maus2));
  t("`recalcularFicha(...).diferencas` é o mesmo que `diferencasDaFicha(...)`", maus3.length === 0, amostra(maus3));

  const forma = [];
  for (const { rotulo, ficha } of CORPUS) {
    for (const d of diferencasDaFicha(ficha)) {
      if (!d || typeof d !== "object" || !("campo" in d) || !("de" in d) || !("para" in d)) { forma.push(rotulo); break; }
      if (!CAMPOS_DO_RECALCULO.includes(d.campo)) { forma.push(`${rotulo}: campo fora da tabela (${d.campo})`); break; }
      if (iguais(d.de, d.para)) { forma.push(`${rotulo}: ${d.campo} «discorda» de si mesmo`); break; }
    }
  }
  t("toda diferença é `{ campo, de, para }`, com `campo` na tabela e `de !== para`", forma.length === 0, amostra(forma));
}

/* ============================================================
   03 · IDEMPOTENTE — «abrir o jogo dez vezes não move um ponto»
   ============================================================ */
sec("03. IDEMPOTENTE — abrir o jogo dez vezes não move um ponto (n = 1..10, corpus inteiro)");
{
  /* «ABRIR O JOGO DEZ VEZES NÃO MOVE UM PONTO» é literalmente a asserção
     abaixo, e é a metade da frase da pessoa que dá para provar em Node: a
     décima abertura devolve a mesma ficha que a primeira, e a partir da
     segunda o sistema já nem sequer diz que mudou alguma coisa.

     A asserção é DUPLA de propósito, porque uma só não chega:
       (a) `mudou === false` na SEGUNDA passagem — o recálculo reconhece
           o próprio trabalho e cala-se;
       (b) igualdade profunda entre a 2.ª e a 10.ª — porque um módulo que
           oscilasse entre dois estados diria `mudou: true` para sempre e
           (a) apanhava-o, mas um que derivasse lentamente (arredondar um
           `.5` para lados diferentes, somar em vez de atribuir) podia
           dizer `mudou: false` e mexer-se na mesma. Só (b) apanha esse. */
  const semCalar = [], derivou = [], nEsimo = [];
  for (const { rotulo, ficha } of CORPUS) {
    const passos = [];
    let atual = ficha;
    for (let n = 1; n <= 10; n++) { const r = recalcularFicha(atual); passos.push(r); atual = r.ficha; }
    if (passos[1].mudou !== false) semCalar.push(`${rotulo}: 2.ª passagem ainda diz mudou (${JSON.stringify(passos[1].diferencas)})`);
    if (!iguais(passos[1].ficha, passos[9].ficha)) derivou.push(rotulo);
    /* recalcular n vezes === recalcular uma: a 1.ª passagem já é o ponto
       fixo, e nenhuma das nove seguintes o afasta */
    for (let n = 2; n <= 10; n++) if (!iguais(passos[n - 1].ficha, passos[0].ficha)) { nEsimo.push(`${rotulo} (n=${n})`); break; }
  }
  t(`na 2.ª passagem o recálculo cala-se em todas as ${CORPUS.length} fichas`, semCalar.length === 0, amostra(semCalar));
  t("a 2.ª e a 10.ª passagem são profundamente iguais — nada deriva devagar", derivou.length === 0, amostra(derivou));
  t("recalcular n vezes (n = 1..10) = recalcular uma, ficha a ficha", nEsimo.length === 0, amostra(nEsimo));

  /* E A MESMA ENTRADA DÁ A MESMA SAÍDA EM CHAMADAS SEPARADAS: a
     idempotência de cima seria satisfeita por um módulo que guardasse
     estado entre chamadas (memória, cache, contador). Aqui o corpus inteiro
     corre uma segunda vez, do zero, e tem de dar exatamente o mesmo. */
  const instavel = [];
  for (const { rotulo, ficha } of CORPUS) {
    const a = recalcularFicha(ficha), b = recalcularFicha(ficha);
    if (!iguais(a.ficha, b.ficha) || a.mudou !== b.mudou) instavel.push(rotulo);
  }
  t("duas chamadas independentes sobre a MESMA ficha dão o mesmo — não há estado escondido entre chamadas", instavel.length === 0, amostra(instavel));
}

/* ============================================================
   04 · MUDO QUANDO NÃO É PRECISO
   ============================================================ */
sec("04. MUDO QUANDO NÃO É PRECISO — o save certo sai byte a byte igual, e pela IDENTIDADE");
{
  /* A METADE MAIS IMPORTANTE DA FRASE DA PESSOA: «principalmente sem que
     seja necessário». Um recálculo que devolve um CLONE com os mesmos
     números já é uma mudança do ponto de vista de tudo o que está por
     cima — o React remonta, o autosave grava um save novo, a comparação
     por referência de qualquer memo falha. Por isso a asserção é a
     IDENTIDADE (`r.ficha === pers`), e não só a igualdade: só a identidade
     prova que nem sequer houve clone.

     A ficha usada aqui é a que o PRÓPRIO MÓDULO declara certa (o resultado
     de uma passagem), e não uma que a suíte afirme estar certa — assim a
     asserção não implica petição de princípio sobre a fórmula. Se a
     fórmula discordar das fichas de hoje, isso é §8, não isto. */
  const semIdentidade = [], semBytes = [], falouMudou = [];
  for (const { rotulo, ficha } of CORPUS) {
    const certa = recalcularFicha(ficha).ficha;
    const antes = JSON.stringify(certa);
    const r = recalcularFicha(certa);
    if (r.ficha !== certa) semIdentidade.push(rotulo);
    if (JSON.stringify(r.ficha) !== antes) semBytes.push(rotulo);
    if (r.mudou !== false || r.diferencas.length !== 0) falouMudou.push(rotulo);
  }
  t("o save já certo volta pela IDENTIDADE — `r.ficha === pers`, nem clone houve", semIdentidade.length === 0, amostra(semIdentidade));
  t("e byte a byte igual — `JSON.stringify` idêntico", semBytes.length === 0, amostra(semBytes));
  t("e `mudou === false`, com `diferencas` vazio", falouMudou.length === 0, amostra(falouMudou));

  /* NADA FORA DE `CAMPOS_DO_RECALCULO` É TOCADO, e a prova é sobre uma
     ficha TORTA: numa ficha certa o módulo não mexe em nada e a asserção
     seria verde por vazio. É quando ele TEM de mexer que se vê se ele sabe
     onde parar. Inventário, condições, grupo, dádivas, semente, moedas,
     perícias, vida e mana atuais — nenhum deles é do recálculo. */
  const vazou = [], perdeu = [], mexeu = [];
  for (const { rotulo, ficha, torta } of CORPUS) {
    if (!torta) continue;
    const r = recalcularFicha(ficha);
    const chavesAntes = Object.keys(ficha).sort().join(",");
    const chavesDepois = Object.keys(r.ficha).sort().join(",");
    if (chavesAntes !== chavesDepois) perdeu.push(`${rotulo}: ${chavesAntes} → ${chavesDepois}`);
    for (const k of Object.keys(ficha)) {
      if (CAMPOS_DO_RECALCULO.includes(k)) continue;
      if (!iguais(ficha[k], r.ficha[k])) { mexeu.push(`${rotulo}: ${k}`); break; }
    }
    /* e a entrada sai como entrou: estado é substituído, nunca mutado */
    if (JSON.stringify(ficha) === JSON.stringify(r.ficha) && r.mudou) vazou.push(rotulo);
  }
  const tortas = CORPUS.filter((x) => x.torta).length;
  t(`numa ficha TORTA nenhum campo fora da tabela se mexe (${tortas} fichas, com inventário, condições, grupo, dádivas, semente)`,
    mexeu.length === 0, amostra(mexeu));
  t("e nenhuma chave nasce nem morre no caminho", perdeu.length === 0, amostra(perdeu));
  t("`mudou: true` implica que a ficha devolvida é REALMENTE diferente", vazou.length === 0, amostra(vazou));

  /* IMUTABILIDADE (a lei da casa): a ficha que entra não é mutada. */
  const mutou = [];
  for (const { rotulo, ficha } of CORPUS) {
    const antes = JSON.stringify(ficha);
    recalcularFicha(ficha);
    diferencasDaFicha(ficha);
    if (JSON.stringify(ficha) !== antes) mutou.push(rotulo);
  }
  t("a ficha de entrada sai como entrou — estado é substituído, nunca mutado", mutou.length === 0, amostra(mutou));

  /* E AS TABELAS TAMBÉM NÃO SE MEXEM. */
  const antesTabelas = JSON.stringify([CAMPOS_DO_RECALCULO, XP_ACUMULADO, ANTECEDENTES.map((a) => [a.id, a.pv || 0, a.pm || 0]), CLASSES.map((c) => [c.nome, c.vidaBase, c.manaBase])]);
  for (const { ficha } of CORPUS.slice(0, 50)) recalcularFicha(ficha);
  t("as tabelas saem como entraram", JSON.stringify([CAMPOS_DO_RECALCULO, XP_ACUMULADO, ANTECEDENTES.map((a) => [a.id, a.pv || 0, a.pm || 0]), CLASSES.map((c) => [c.nome, c.vidaBase, c.manaBase])]) === antesTabelas);
}

/* ============================================================
   05 · AS DERIVAÇÕES BATEM COM AS TABELAS
   ============================================================ */
sec("05. AS DERIVAÇÕES BATEM COM AS TABELAS — lidas de volta, e nenhum número escrito à mão");
{
  /* PROIBIDO ESCREVER `6` OU `+4` NA ASSERÇÃO. Toda expectativa abaixo sai
     de `bonusProficiencia`, `PV_POR_NIVEL`, `PM_POR_NIVEL`, `vidaBase`/
     `manaBase` e `pv`/`pm` — as funções e os campos das próprias tabelas.
     É o que faz esta seção sobreviver ao dia em que a casa decidir que um
     nível vale 7 PV: a tabela muda, o módulo muda, e a asserção continua
     a dizer a verdade sem ninguém lhe tocar. Uma asserção com o número
     copiado ficaria vermelha por uma mudança legítima — e seria afrouxada
     por cansaço, que é como uma lei se apaga em silêncio. */
  const prof = [], corpo = [], corpoVsTabela = [];
  for (const { rotulo, ficha } of CORPUS) {
    const f = recalcularFicha(ficha).ficha;
    if (f.proficiencia !== bonusProficiencia(f.nivel)) prof.push(`${rotulo}: ${f.proficiencia} vs tabela ${bonusProficiencia(f.nivel)} (nível ${f.nivel})`);
    const c = corpoDaFicha({ classe: f.classe, antecedente: f.antecedente, atributos: f.atributos, nivel: f.nivel });
    if (!c || f.vidaMax !== c.vidaMax || f.manaMax !== c.manaMax) corpo.push(`${rotulo}: ficha ${f.vidaMax}/${f.manaMax} vs corpoDaFicha ${c && c.vidaMax}/${c && c.manaMax}`);
    const esperado = corpoDaTabela({ classe: f.classe, antecedente: f.antecedente, atributos: f.atributos, nivel: f.nivel });
    if (!c || c.vidaMax !== esperado.vidaMax || c.manaMax !== esperado.manaMax) {
      corpoVsTabela.push(`${rotulo}: corpoDaFicha ${c && c.vidaMax}/${c && c.manaMax} vs tabela ${esperado.vidaMax}/${esperado.manaMax}`);
    }
  }
  t("a proficiência da ficha é EXATAMENTE `bonusProficiencia(nivel)`, nos 7 degraus e nas 12 classes", prof.length === 0, amostra(prof));
  t("`vidaMax`/`manaMax` da ficha são EXATAMENTE o que `corpoDaFicha` devolve — um só dono da fórmula", corpo.length === 0, amostra(corpo));
  t("e `corpoDaFicha` bate com a fórmula remontada das tabelas (vidaBase/manaBase + atributo×2 + pv/pm + degraus × PV_POR_NIVEL/PM_POR_NIVEL)",
    corpoVsTabela.length === 0, amostra(corpoVsTabela));

  /* A ESCADA DA PROFICIÊNCIA É A DA TABELA, DEGRAU A DEGRAU — e a asserção
     percorre 1..20 lendo `bonusProficiencia` dos dois lados. Não é
     redundante com a de cima: aquela mede as fichas do corpus (7 níveis),
     esta mede a escada inteira e apanha um nível intermédio esquecido. */
  const escada = [];
  for (let n = 1; n <= XP_ACUMULADO.length; n++) {
    const f = recalcularFicha(fichaCerta(CLASSES[0].nome, n, ATRIBUTOS_B, ANT_PV)).ficha;
    if (f.proficiencia !== bonusProficiencia(n) || f.nivel !== n) escada.push(`n${n}: prof ${f.proficiencia}, nível ${f.nivel}`);
  }
  t(`a escada de proficiência bate nos ${XP_ACUMULADO.length} níveis da curva de XP`, escada.length === 0, amostra(escada));
  /* e a escada não é plana — senão a asserção acima seria verde por vazio */
  t("e a escada TEM degraus (senão a asserção acima não provava nada)",
    new Set(Array.from({ length: XP_ACUMULADO.length }, (_, i) => bonusProficiencia(i + 1))).size > 1);

  /* O NÍVEL É SANEADO, NÃO DERIVADO DO XP — e o teto sai da própria curva.

     MOTIVO DA ASSERÇÃO REESCRITA (Z1, esta suíte, primeira corrida contra
     o módulo). Estava escrito aqui «o nível bate com `aplicarNivel`», mais
     «com o XP do degrau na bolsa o nível SOBE um». As duas presumiam uma
     derivação que o contrato de Z1 nunca declarou, e a segunda ficou
     vermelha contra o módulo. Não foi afrouxada para caber no código: foi
     trocada porque estava a legislar ao contrário da lei da fase, e a §5b
     abaixo prova, com número, que o desenho que ela pedia é que estava
     errado. O que sobra é a lei verdadeira: o nível é SANEADO — inteiro,
     dentro dos degraus que a curva de XP tem — e serve de entrada aos
     outros três campos.

     E o teto lê-se de `XP_ACUMULADO.length`, não de um 20 escrito: no dia
     em que a curva crescer, o teto cresce junto. */
  const nivelDaTabela = (n) => {
    const v = Math.floor(Number(n));
    return Number.isFinite(v) ? Math.max(1, Math.min(XP_ACUMULADO.length, v)) : 1;
  };
  const nivel = [];
  for (const { rotulo, ficha } of CORPUS) {
    const f = recalcularFicha(ficha).ficha;
    if (f.nivel !== nivelDaTabela(ficha.nivel)) nivel.push(`${rotulo}: ${f.nivel} vs saneado ${nivelDaTabela(ficha.nivel)}`);
  }
  t(`o nível sai saneado: inteiro, entre 1 e os ${XP_ACUMULADO.length} degraus da curva de XP`, nivel.length === 0, amostra(nivel));
  const bordas = [[-4, 1], [0, 1], [1, 1], [3.9, 3], [XP_ACUMULADO.length, XP_ACUMULADO.length], [XP_ACUMULADO.length + 79, XP_ACUMULADO.length]];
  const foraDaBorda = bordas.filter(([entra, sai]) => recalcularFicha({ ...fichaCerta(CLASSES[0].nome, 3, ATRIBUTOS_A, ANT_PV), nivel: entra }).ficha.nivel !== sai);
  /* `3.9 → 3` e não `4`: arredondar para cima dava meio degrau de graça, e
     degrau de graça é dado de jogador mudado sem necessidade. */
  t("as bordas do nível: negativo e 0 sobem ao mínimo, o fracionário desce, o excesso pára no teto",
    foraDaBorda.length === 0, foraDaBorda.map(([e, s]) => `${e} devia dar ${s}`).join(" | "));
}

sec("05b. O XP NÃO MOVE O NÍVEL — o desenho errado, escrito aqui como erro, com o número dele");
{
  /* O DESENHO ERRADO, PELO NOME E PELO NÚMERO — o molde de
     `teste-trava-da-reacao.mjs` §03: uma catraca que só sabe dizer «o
     certo está certo» não protege de nada.

     «O recálculo devia subir o nível pelo XP, chamando `aplicarNivel`» é a
     coisa óbvia a fazer, e é a que esta suíte pediu na sua primeira
     escrita. Ela é ERRADA, e por uma razão que só aparece quando se
     escreve: `aplicarNivel` sobe o nível GASTANDO o XP (`regras-jogo.js`
     :52 — `xp -= custo`), mas `xp` NÃO está em `CAMPOS_DO_RECALCULO`. O
     recálculo escreveria o nível novo e deixaria a bolsa intacta — e na
     abertura seguinte o mesmo XP pagaria os mesmos degraus outra vez.

     O NÚMERO, medido aqui em baixo e não copiado: um guerreiro de nível 1
     com 100 000 XP na bolsa abre o jogo e é nível 12; fecha e abre, 16;
     outra vez, 18; outra, 20. É, palavra por palavra, o «status diferente
     em cada gameplay» que a pessoa proibiu — e nenhuma das asserções de
     §3 o apanharia, porque §3 corre `recalcularFicha` sobre a ficha que
     ele próprio devolveu, e a subida está do lado de fora. */
  const semXP = { classe: CLASSES[0].nome, nivel: 1, xp: 100000, nivelPendentes: 0, dadivas: [], dadivasPendentes: 0, atributos: ATRIBUTOS_B, antecedente: ANT_PV.nome, vidaMax: null, manaMax: null };
  const escada = [];
  let torto = semXP;
  for (let i = 0; i < 4; i++) { torto = { ...torto, nivel: aplicarNivel(torto).nivel }; escada.push(torto.nivel); }
  t("o desenho errado existe e MOVE MESMO a ficha a cada abertura — 1 → " + escada.join(" → "),
    escada.join(",") === "12,16,18,20", `medi ${escada.join(",")}`);
  const bom = [];
  let certo = semXP;
  for (let i = 0; i < 4; i++) { certo = recalcularFicha(certo).ficha; bom.push(certo.nivel); }
  t("e o módulo NÃO o faz: quatro aberturas com 100 000 XP na bolsa e o nível não move um ponto — 1 → " + bom.join(" → "),
    bom.every((n) => n === 1), `medi ${bom.join(",")}`);
  /* E A RAZÃO DE ISTO NÃO SER UMA REGRESSÃO: quem sobe de nível é
     `aplicarNivel`, no momento do ganho de XP, e é ele o dono único da
     conta. Um `xp` que já pagou um degrau é sempre RESTO — uma ficha bem
     formada tem `xp < custo(nivel)`, e para ela as duas estradas dão o
     mesmo. A prova é sobre o corpus inteiro, que é assim. */
  const discorda = [];
  for (const { rotulo, ficha } of CORPUS) {
    const pelaTabela = aplicarNivel({ ...ficha, nivelPendentes: 0, dadivas: [], dadivasPendentes: 0 }).nivel;
    if (recalcularFicha(ficha).ficha.nivel !== pelaTabela) discorda.push(`${rotulo}: ${recalcularFicha(ficha).ficha.nivel} vs aplicarNivel ${pelaTabela}`);
  }
  t("numa ficha BEM FORMADA (o `xp` é resto) o saneamento e `aplicarNivel` chegam ao mesmo nível — não há regressão", discorda.length === 0, amostra(discorda));
}

/* ============================================================
   06 · A EXTRAÇÃO DE `prontos.js` FOI DE GRAÇA
   ============================================================ */
sec("06. A EXTRAÇÃO — `corpoDaFicha` é o dono ÚNICO da fórmula, e o roster dos oito não se mexe");
{
  /* `src/prontos.js` escrevia a fórmula de PV/PM inline (as linhas 171-173
     de antes de Z1). O `backend` trocou-as por uma chamada a
     `corpoDaFicha`, e a lei da casa diz que um número só tem um dono. A
     prova de que a troca foi de graça é esta seção: os oito prontos que o
     jogo monta HOJE têm de continuar com o mesmo PV e o mesmo PM.

     E é aqui que as DUAS GRAFIAS do antecedente mordem: `montarPronto`
     resolve pelo ID, mas grava o NOME na ficha. Se `corpoDaFicha` só
     souber ler uma das duas, os prontos de antecedente com bônus perdem 2
     PV (ou 2 PM) no primeiro recálculo — e isso é «mudar os dados do
     player sem que ele saiba», que é a lei desta fase.

     CUIDADO COM O VERDE FÁCIL: desde que o `backend` fez a troca,
     `montarPronto` CHAMA `corpoDaFicha`, e comparar os dois seria comparar
     uma função consigo mesma — verde, e cego. Por isso a asserção mede os
     oito prontos contra a FÓRMULA REMONTADA DAS TABELAS (`corpoDaTabela`,
     lá em cima), que é a única cópia da fórmula anterior que sobrou no
     projeto. É ela que fica vermelha se a extração tiver mudado um número
     do roster pelo caminho. */
  const fora = [], foraTab = [];
  for (const p of PRONTOS) {
    const f = montarPronto(p.id);
    const chave = { classe: f.classe, antecedente: f.antecedente, atributos: f.atributos, nivel: f.nivel };
    const c = corpoDaFicha(chave);
    const tab = corpoDaTabela(chave);
    if (!c || c.vidaMax !== f.vidaMax || c.manaMax !== f.manaMax) fora.push(`${p.id}: pronto ${f.vidaMax}/${f.manaMax} vs corpoDaFicha ${c && c.vidaMax}/${c && c.manaMax}`);
    if (f.vidaMax !== tab.vidaMax || f.manaMax !== tab.manaMax) foraTab.push(`${p.id}: pronto ${f.vidaMax}/${f.manaMax} vs fórmula das tabelas ${tab.vidaMax}/${tab.manaMax}`);
  }
  t(`os ${PRONTOS.length} prontos têm o PV e o PM que a FÓRMULA DAS TABELAS dá — a extração não mexeu no roster`, foraTab.length === 0, amostra(foraTab, 8));
  t(`e \`montarPronto\` e \`corpoDaFicha\` continuam a dizer o mesmo (hoje por construção: \`prontos.js\` já chama o módulo)`, fora.length === 0, amostra(fora, 8));

  /* AS DUAS GRAFIAS, perguntadas diretamente ao módulo. */
  const porId = corpoDaFicha({ classe: CLASSES[0].nome, antecedente: ANT_PV.id, atributos: ATRIBUTOS_B, nivel: 3 });
  const porNome = corpoDaFicha({ classe: CLASSES[0].nome, antecedente: ANT_PV.nome, atributos: ATRIBUTOS_B, nivel: 3 });
  t("`corpoDaFicha` aceita o ID e o NOME do antecedente e chega ao mesmo corpo (o save guarda o nome; `prontos.js` passa o id)",
    !!porId && !!porNome && porId.vidaMax === porNome.vidaMax && porId.manaMax === porNome.manaMax,
    `id ${porId && porId.vidaMax}/${porId && porId.manaMax} · nome ${porNome && porNome.vidaMax}/${porNome && porNome.manaMax}`);
  /* e o bônus do antecedente CHEGA MESMO ao corpo — senão a asserção
     acima seria verde com os dois lados a ignorar a tabela */
  const semAnt = corpoDaFicha({ classe: CLASSES[0].nome, antecedente: ANT_NADA.nome, atributos: ATRIBUTOS_B, nivel: 3 });
  t(`o \`pv\` do antecedente entra no corpo (a diferença é a da tabela: ${ANT_PV.pv})`,
    !!semAnt && porNome.vidaMax - semAnt.vidaMax === (ANT_PV.pv || 0), `medi ${porNome && semAnt && (porNome.vidaMax - semAnt.vidaMax)}`);
  const porNomePM = corpoDaFicha({ classe: CLASSES[0].nome, antecedente: ANT_PM.nome, atributos: ATRIBUTOS_B, nivel: 3 });
  t(`e o \`pm\` também (${ANT_PM.pm})`, !!porNomePM && porNomePM.manaMax - semAnt.manaMax === (ANT_PM.pm || 0),
    `medi ${porNomePM && semAnt && (porNomePM.manaMax - semAnt.manaMax)}`);

  /* O DEGRAU VALE O QUE A TABELA DIZ — e a prova é a diferença entre dois
     níveis consecutivos, não um número. */
  const n5 = corpoDaFicha({ classe: CLASSES[0].nome, antecedente: ANT_PV.id, atributos: ATRIBUTOS_B, nivel: 5 });
  const n6 = corpoDaFicha({ classe: CLASSES[0].nome, antecedente: ANT_PV.id, atributos: ATRIBUTOS_B, nivel: 6 });
  t("um degrau de nível vale `PV_POR_NIVEL` de vida e `PM_POR_NIVEL` de mana, lidos da tabela",
    n6.vidaMax - n5.vidaMax === PV_POR_NIVEL && n6.manaMax - n5.manaMax === PM_POR_NIVEL,
    `medi +${n6.vidaMax - n5.vidaMax}/+${n6.manaMax - n5.manaMax}`);
  /* e a identidade da classe sobrevive: o tanque chega mais alto que o mago */
  const maisVida = CLASSES.reduce((a, b) => (b.vidaBase > a.vidaBase ? b : a));
  const menosVida = CLASSES.reduce((a, b) => (b.vidaBase < a.vidaBase ? b : a));
  const cA = corpoDaFicha({ classe: maisVida.nome, antecedente: ANT_NADA.id, atributos: ATRIBUTOS_A, nivel: 10 });
  const cB = corpoDaFicha({ classe: menosVida.nome, antecedente: ANT_NADA.id, atributos: ATRIBUTOS_A, nivel: 10 });
  t(`a identidade da classe sobrevive ao recálculo (${maisVida.nome} ${maisVida.vidaBase} > ${menosVida.nome} ${menosVida.vidaBase})`,
    cA.vidaMax - cB.vidaMax === maisVida.vidaBase - menosVida.vidaBase, `medi ${cA.vidaMax - cB.vidaMax}`);

  /* O DEFAULT «SEM TABELA» NÃO PODE MORDER UMA CLASSE DE VERDADE. O módulo
     escreve `(cObj && cObj.vidaBase) || 10` — um `||`, não um `??`. Uma
     classe que nascesse com `vidaBase: 0` (ou sem o campo) cairia no
     default de 10 em silêncio, e o recálculo dava-lhe 10 PV que a criação
     não deu. Hoje nenhuma das 12 tem, e a asserção existe para que o dia
     em que alguém acrescentar uma classe frágil seja um dia VERMELHO e não
     um dia de +10 PV de graça. */
  const falsas = CLASSES.filter((c) => !c.vidaBase || !c.manaBase).map((c) => `${c.nome}: ${c.vidaBase}/${c.manaBase}`);
  t(`as ${CLASSES.length} classes têm \`vidaBase\` e \`manaBase\` verdadeiros — o default de 10/8 nunca morde uma classe real`,
    falsas.length === 0, amostra(falsas));
  /* e o default existe mesmo, para a ficha sem classe reconhecida */
  const semClasse = corpoDaFicha({ classe: "Malabarista", antecedente: ANT_NADA.id, atributos: {}, nivel: 1 });
  t("uma classe que não está na tabela cai num corpo mínimo, sem estourar", semClasse.vidaMax > 0 && semClasse.manaMax > 0,
    `${semClasse.vidaMax}/${semClasse.manaMax}`);
}

/* ============================================================
   07 · O LIXO E O DETERMINISMO
   ============================================================ */
sec("07. O LIXO — `= {}` no destructuring NÃO cobre `null`, e esta casa já pagou por isso");
{
  /* A LEI, do `CLAUDE.md`: `= {}` no destructuring não cobre `null`. Um
     save antigo, um campo que o Mestre apagou, uma ficha a meio de uma
     migração — todos chegam aqui com `null` no lugar de um objeto. Um
     recálculo que estoura no arranque do jogo é pior do que um recálculo
     errado: o errado aparece na ficha, e o que estoura apaga a cena. */
  const seguro = (rotulo, fn) => { try { fn(); return null; } catch (e) { return `${rotulo}: ${e && e.message}`; } };
  const LIXO = [
    ["pers null", null],
    ["pers undefined", undefined],
    ["pers {}", {}],
    ["sem classe", { nivel: 3, atributos: ATRIBUTOS_A }],
    ["classe null", { classe: null, nivel: 3, atributos: ATRIBUTOS_A }],
    ["classe que não existe", { classe: "Malabarista", nivel: 3, atributos: ATRIBUTOS_A }],
    ["sem atributos", { classe: CLASSES[0].nome, nivel: 3 }],
    ["atributos null", { classe: CLASSES[0].nome, nivel: 3, atributos: null }],
    ["atributos {}", { classe: CLASSES[0].nome, nivel: 3, atributos: {} }],
    ["antecedente null", { classe: CLASSES[0].nome, nivel: 3, atributos: ATRIBUTOS_A, antecedente: null }],
    ["antecedente que não existe", { classe: CLASSES[0].nome, nivel: 3, atributos: ATRIBUTOS_A, antecedente: "Astronauta" }],
    ["nivel 0", { classe: CLASSES[0].nome, nivel: 0, atributos: ATRIBUTOS_A }],
    ["nivel null", { classe: CLASSES[0].nome, nivel: null, atributos: ATRIBUTOS_A }],
    ["nivel negativo", { classe: CLASSES[0].nome, nivel: -4, atributos: ATRIBUTOS_A }],
    ["nivel acima de 20", { classe: CLASSES[0].nome, nivel: 99, atributos: ATRIBUTOS_A }],
    ["nivel que não é número", { classe: CLASSES[0].nome, nivel: "três", atributos: ATRIBUTOS_A }],
    ["xp negativo", { classe: CLASSES[0].nome, nivel: 3, xp: -5000, atributos: ATRIBUTOS_A }],
    ["xp null", { classe: CLASSES[0].nome, nivel: 3, xp: null, atributos: ATRIBUTOS_A }],
    ["vidaMax null", { classe: CLASSES[0].nome, nivel: 3, atributos: ATRIBUTOS_A, vidaMax: null, manaMax: null }],
    ["atributos com lixo dentro", { classe: CLASSES[0].nome, nivel: 3, atributos: { vigor: null, intelecto: "muito" } }],
  ];
  const estourou = [];
  for (const [rotulo, pers] of LIXO) {
    const e1 = seguro(`recalcularFicha ${rotulo}`, () => recalcularFicha(pers));
    const e2 = seguro(`diferencasDaFicha ${rotulo}`, () => diferencasDaFicha(pers));
    if (e1) estourou.push(e1);
    if (e2) estourou.push(e2);
  }
  t(`nenhuma das ${LIXO.length} entradas de lixo estoura, nas duas portas`, estourou.length === 0, amostra(estourou, 4));

  const formaLixo = [];
  for (const [rotulo, pers] of LIXO) {
    let r = null;
    try { r = recalcularFicha(pers); } catch { continue; }
    if (!r || typeof r !== "object" || typeof r.mudou !== "boolean" || !Array.isArray(r.diferencas)) formaLixo.push(rotulo);
  }
  t("e a resposta continua bem formada mesmo com lixo à entrada", formaLixo.length === 0, amostra(formaLixo));

  t("`corpoDaFicha(null)` e `corpoDaFicha()` não estouram e devolvem números",
    !seguro("corpoDaFicha", () => { const a = corpoDaFicha(null), b = corpoDaFicha(); return a && b; })
    && Number.isFinite((corpoDaFicha(null) || {}).vidaMax) && Number.isFinite((corpoDaFicha() || {}).manaMax));

  /* O QUE O RECÁLCULO ESCREVE NUNCA É NaN, `Infinity` NEM NEGATIVO — um
     `NaN` que chega ao `vidaMax` não estoura: instala-se, e o jogador
     descobre na barra de vida três combates depois.

     MOTIVO DA ASSERÇÃO REESCRITA (Z1, primeira corrida contra o módulo).
     Estava escrita sobre TODOS os campos governados da ficha de saída, e
     ficou vermelha em `nivel: null` e `vidaMax: null` — que saem null
     porque o módulo os deixou EXATAMENTE como estavam. Ela estava a exigir
     que o recálculo escrevesse por cima de um campo ausente, que é o
     oposto da lei desta fase (§7b prova que a ausência tem de passar
     intacta). Passou a medir só o que o recálculo REALMENTE escreveu — os
     campos que ele próprio declarou em `diferencas` —, que é onde um `NaN`
     poderia nascer. Não foi afrouxada: continua a apanhar qualquer número
     sujo que o módulo produza, e deixou de acusar o que ele não produziu. */
  const feios = [];
  for (const [rotulo, pers] of LIXO) {
    let r = null;
    try { r = recalcularFicha(pers); } catch { continue; }
    if (!r || !r.ficha) continue;
    for (const d of r.diferencas) {
      const v = r.ficha[d.campo];
      if (!Number.isFinite(v) || v < 0) { feios.push(`${rotulo}: ${d.campo} = ${v}`); break; }
    }
  }
  t("nenhum campo que o recálculo ESCREVE sai `NaN`, `Infinity` ou negativo a partir de lixo", feios.length === 0, amostra(feios, 4));
  /* e o corpo derivado de lixo também não é sujo, mesmo quando ninguém o
     escreve na ficha: `corpoDaFicha` é chamado de fora do recálculo */
  const corpoSujo = LIXO.filter(([, pers]) => {
    const c = corpoDaFicha({ classe: (pers || {}).classe, antecedente: (pers || {}).antecedente, atributos: (pers || {}).atributos, nivel: (pers || {}).nivel });
    return !c || !Number.isFinite(c.vidaMax) || !Number.isFinite(c.manaMax) || c.vidaMax < 0 || c.manaMax < 0;
  });
  t("`corpoDaFicha` devolve números limpos para todas as entradas de lixo", corpoSujo.length === 0, amostra(corpoSujo.map(([r]) => r), 4));
}

sec("07b. A AUSÊNCIA NÃO DISCORDA — o campo que a ficha nunca teve não é um campo errado");
{
  /* É A OUTRA METADE DE «sem que seja necessário», e é a que decide o
     destino de TODO save que existe hoje. Nenhuma ficha do Taverna guarda
     `proficiencia`: ela é derivada na hora de ler, por `bonusProficiencia`.
     Se a ausência contasse como divergência, o primeiro recálculo escrevia
     um campo novo em todas as fichas do jogo — e todo save do mundo ficava
     «mudado» de uma vez, por nada. `mudou: true` na abertura de um save
     que não tinha problema nenhum é exatamente o que a pessoa proibiu.

     A linha que separa CONSERTAR de ESCREVER POR CIMA: quem guarda o campo
     e o guarda errado é corrigido; quem nunca o teve fica como está. */
  const nua = { classe: CLASSES[0].nome, nivel: 4, atributos: ATRIBUTOS_B, antecedente: ANT_PV.nome, inventario: [], semente: "nua" };
  const r = recalcularFicha(nua);
  t("uma ficha SEM `vidaMax`, `manaMax` e `proficiencia` não muda — `mudou: false`", r.mudou === false, JSON.stringify(r.diferencas));
  t("e volta pela identidade, sem um campo novo escrito", r.ficha === nua && !("proficiencia" in r.ficha) && !("vidaMax" in r.ficha));
  const comNull = { ...nua, vidaMax: null, manaMax: null, proficiencia: null };
  const rn = recalcularFicha(comNull);
  t("`null` explícito também é ausência, e também passa intacto (`= {}` não cobre `null`)",
    rn.mudou === false && rn.ficha === comNull, JSON.stringify(rn.diferencas));
  /* E O CONTRÁRIO É VERDADE — senão isto seria uma porta para nunca
     consertar nada: quem GUARDA o campo e o guarda errado é corrigido. */
  const guardaErrado = { ...nua, vidaMax: 1, manaMax: 1, proficiencia: 1 };
  const rg = recalcularFicha(guardaErrado);
  t("mas quem guarda o campo e o guarda ERRADO é corrigido — a ausência não é uma porta para não consertar",
    rg.mudou === true && rg.diferencas.length === 3 && rg.ficha.proficiencia === bonusProficiencia(4));
  /* o ZERO não é ausência: `0 == null` é falso, e um `vidaMax: 0` é uma
     ficha partida que tem de ser consertada, não um campo que não existe */
  t("`0` não é ausência — `vidaMax: 0` é ficha partida e é consertada",
    recalcularFicha({ ...nua, vidaMax: 0 }).diferencas.some((d) => d.campo === "vidaMax" && d.de === 0));
}

sec("07c. DETERMINISMO — nenhum dado é rolado no caminho do recálculo");
{
  /* «Mesma semente = mesmo resultado» é o único árbitro que um sistema sem
     servidor tem. Para o recálculo a exigência é mais dura ainda: ele não
     pode rolar NADA. Um `Math.random` no meio da derivação dava um status
     diferente a cada abertura — que é, palavra por palavra, o que a pessoa
     disse ser inaceitável.

     A prova é o cinto de `teste-trava-da-reacao.mjs` §14: troca-se o
     rolador global por uma função que ESTOURA, e repõe-se no `finally`
     mesmo que a chamada morra — sem o `finally`, uma exceção deixava o
     projeto inteiro com um `Math.random` partido a partir daqui. */
  const original = Math.random;
  let estourou = null, correu = 0;
  try {
    Math.random = () => { throw new Error("o recálculo rolou um dado"); };
    for (const { ficha } of CORPUS) { recalcularFicha(ficha); diferencasDaFicha(ficha); correu++; }
    corpoDaFicha({ classe: CLASSES[0].nome, antecedente: ANT_PV.id, atributos: ATRIBUTOS_B, nivel: 7 });
  } catch (e) { estourou = e && e.message; } finally { Math.random = original; }
  t(`o corpus inteiro (${CORPUS.length} fichas) corre com \`Math.random\` a estourar — nenhum dado é rolado`, !estourou, `${estourou} (parou na ficha ${correu})`);
  t("e o rolador global foi reposto", Math.random === original && typeof Math.random() === "number");

  /* E A PROVA PELO RESULTADO, por cima da estrutural: a mesma ficha dá o
     mesmo JSON em máquinas diferentes porque não há nada de ambiente no
     caminho — nem relógio, nem locale, nem ordem de iteração de Set. */
  const umaFicha = fichaCerta(CLASSES[3].nome, 9, ATRIBUTOS_B, ANT_PM);
  const torta = tortaDe(umaFicha);
  const a = JSON.stringify(recalcularFicha(torta).ficha);
  const b = JSON.stringify(recalcularFicha({ ...torta }).ficha);
  t("a mesma ficha (e uma cópia dela) dão o mesmo JSON", a === b);
}

/* ============================================================
   08 · A MEDIÇÃO — achado, não veredito
   ============================================================ */
sec("08. QUANTAS FICHAS DIVERGEM, E QUANTO — impresso, nunca vermelho");
{
  /* ISTO NÃO É LEI, E É DE PROPÓSITO. Se o recálculo discordar de uma
     ficha que o jogo monta hoje, a suíte não decide quem está errado — a
     fórmula ou a ficha. Ela põe o número à frente de quem decide. Uma
     suíte que legislasse aqui obrigaria o `backend` a escrever a fórmula
     que faz o teste passar, em vez da fórmula certa; e no dia em que a
     pessoa quisesse mudar o PV por nível, o teste seria o obstáculo em vez
     do instrumento. */
  const quadro = (nome, fichas) => {
    const dif = fichas.map((f) => ({ f, d: diferencasDaFicha(f) })).filter((x) => x.d.length > 0);
    const porCampo = {};
    const dPV = [], dPM = [];
    for (const { d } of dif) {
      for (const c of d) {
        porCampo[c.campo] = (porCampo[c.campo] || 0) + 1;
        const delta = (Number(c.para) || 0) - (Number(c.de) || 0);
        if (c.campo === "vidaMax") dPV.push(delta);
        if (c.campo === "manaMax") dPM.push(delta);
      }
    }
    pendente(`${nome}: fichas que o recálculo mudaria`, `${dif.length} de ${fichas.length}`);
    pendente(`${nome}: campos tocados`, Object.keys(porCampo).length ? Object.entries(porCampo).map(([k, v]) => `${k}×${v}`).join(" · ") : "nenhum");
    const faixa = (xs, r) => (xs.length ? `mín ${Math.min(...xs)} · máx ${Math.max(...xs)} · mediana ${mediana(xs)} (${xs.length} fichas)` : `nenhuma ficha muda de ${r}`);
    pendente(`${nome}: magnitude em PV`, faixa(dPV, "PV"));
    pendente(`${nome}: magnitude em PM`, faixa(dPM, "PM"));
    return dif;
  };

  /* (I) OS OITO PRONTOS — as fichas que o jogo monta hoje, sem uma linha
     de intermediário: é o que o jogador do Duelo e da Noite recebe. */
  const fichasProntas = PRONTOS.map((p) => montarPronto(p.id));
  const difProntos = quadro("os 8 prontos", fichasProntas);
  for (const { f, d } of difProntos) {
    console.log(`  ··    ${String(f.pronto).padEnd(12)} ${d.map((c) => `${c.campo}: ${c.de} → ${c.para}`).join(" · ")}`);
  }
  /* QUAIS DOS QUATRO CAMPOS AS FICHAS DE HOJE SEQUER CARREGAM. É a medida
     que explica o «0 de 8» acima e é a mais importante desta seção: um
     campo que a ficha não guarda não pode divergir, e um campo que ela
     guarda é onde o recálculo tem alguma coisa a dizer. */
  for (const campo of CAMPOS_DO_RECALCULO) {
    const quantos = fichasProntas.filter((f) => f[campo] != null).length;
    pendente(`os 8 prontos: guardam \`${campo}\``, `${quantos} de ${fichasProntas.length}`);
  }

  /* (II) O CORPUS — e só a metade CERTA, porque a metade torta foi
     construída torta de propósito e contá-la seria medir a suíte, não o
     jogo. As fichas certas foram montadas com a fórmula das tabelas: o
     que divergir aqui é desacordo entre o módulo e a tabela. */
  quadro("o corpus (fichas certas)", CORPUS.filter((x) => !x.torta).map((x) => x.ficha));

  /* (III) E O RECÁLCULO DAS TORTAS CHEGA MESMO AO SÍTIO — é a única linha
     desta seção que é asserção, e ela não legisla sobre as fichas de hoje:
     diz só que uma ficha que o módulo declarou errada fica certa à
     primeira passagem. Sem ela, «0 fichas divergem» seria indistinguível
     de «o módulo não olha para nada». */
  const tortas = CORPUS.filter((x) => x.torta);
  const naoConsertou = tortas.filter((x) => diferencasDaFicha(recalcularFicha(x.ficha).ficha).length > 0);
  t(`as ${tortas.length} fichas TORTAS ficam certas à primeira passagem`, naoConsertou.length === 0, amostra(naoConsertou.map((x) => x.rotulo)));
  t("e todas elas eram mesmo tortas antes (a medição não está a olhar para o vazio)",
    tortas.every((x) => diferencasDaFicha(x.ficha).length > 0));
}

console.log(`\nrecálculo (Z1): ${bons} passaram, ${maus} falharam · ${((Date.now() - comecou) / 1000).toFixed(1)} s`);
process.exit(maus ? 1 : 0);
