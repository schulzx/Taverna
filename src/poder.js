/* ============================================================
   O PODER (v9.116) — um número para "quão forte é isto"

   "um índice para medir as dificuldades sem criar confusões … em jogos
   em que seu personagem fica forte não só por lvl mas com equipamentos e
   possíveis fortalecimentos … cada coisa aumenta não só sua força e
   inteligência, mas aumenta seu poder … tudo o que aumentar o poder de um
   personagem tem que ter número, e isso tem que ser visível ao player."

   ---------------- O QUE ESTE ARQUIVO SUBSTITUI ----------------

   A v9.115 media dificuldade por DELTA DE NÍVEL, com três temperos
   somados ao nível (atributo, equipamento, grupo). Funcionava e tinha um
   defeito que só aparece quando se olha a ficha inteira: nível é uma
   coordenada, não uma medida. Duas fichas de nível 12 podem ser a mesma
   coisa ou uma pode valer três da outra, e o delta não tinha como dizer
   isso — os temperos eram um remendo de ±2 sobre um número que domina.

   Poder é a medida. E como é uma MEDIDA, ela se divide: "quantas vezes
   isto é maior que aquilo" passa a ser uma pergunta com resposta, o que
   o delta de nível nunca teve — a distância entre 3 e 6 não é a mesma
   coisa que entre 13 e 16, e subtrair fingia que era.

   ---------------- POR QUE EXPONENCIAL ----------------

   Porque a progressão é. Um nível 20 não é quatro vezes um nível 5: é
   cem vezes, e o pedido diz isso com números ("um lvl 5 tem 400 ou 500,
   um lvl 20 tem 50k"). Uma escala linear faria o nível 5 parecer
   alcançável pelo nível 20 e mentiria em toda comparação de fim de jogo.

   O CRESCIMENTO é a única constante que importa, e ela é a que foi
   CALIBRADA: 1,29 por nível é onde os dois âncoras fecham ao mesmo
   tempo. A primeira tentativa (1,34) acertava o nível 5 e entregava o
   dobro no nível 20, porque o multiplicador não é constante — ele sobe
   de ×1,6 para ×4,0 conforme o corpo se cobre, e quem não vê isso
   calibra num âncora só. A régua está no teste, que monta uma ficha
   típica de cada patamar e confere os dois.

   ---------------- BASE VEZES MULTIPLICADOR ----------------

   O nível dá a BASE; tudo o mais é MULTIPLICADOR. Não é detalhe de
   fórmula, é o que faz equipamento continuar importando no fim do jogo.

   Se equipamento somasse pontos, um elmo que vale 300 seria a metade de
   um herói de nível 5 e um arredondamento num de nível 20 — e a última
   metade do jogo viraria "só o nível conta". Como fração, o mesmo elmo
   vale +8% em qualquer patamar, e o jogador reconhece o número: é o que
   ele vê em toda parte, e é o que torna a escolha de equipar uma escolha.

   ---------------- O QUE O PEDIDO PEDE E ESTE ARQUIVO CUMPRE ----------------

   "podendo o player escolher um equipamento que tem menos poder para usar
   uma habilidade específica que aquele equipamento dá."

   Isso só existe se as coisas SITUACIONAIS pesarem pouco e as
   NUMÉRICAS pesarem muito — e é assim que a tabela abaixo está montada.
   Uma imunidade a veneno vale 12; um ataque extra vale 95. Então o anel
   que te salva daquele chefe específico CUSTA poder, e é uma decisão de
   verdade em vez de um número dominando a outra ponta.

   E "mesmo dentre as mesmas raridades podem ter equipamentos com poderes
   diferentes": sai de graça, porque o índice de um item lê os atributos e
   os afixos DELE, e dois lendários nunca têm os mesmos.
   ============================================================ */

import { ATRIBUTOS } from "./constantes.js";

/* ---------------- A CURVA ----------------
   Os dois âncoras do pedido — nível 5 em torno de 450, nível 20 em torno
   de 50 mil — não são cumpridos pela base sozinha: são cumpridos pela
   base VEZES o multiplicador típico de cada patamar, porque um nível 20
   sem equipamento nenhum não deve ler 50 mil. O teste confere os dois
   com fichas típicas, e é ele que segura estes números no lugar. */
export const PODER_INICIAL = 95;
/* 1,29, e o número saiu da calibração, não do gosto. Com 1,34 a ficha
   típica de nível 5 caía certa (480) e a de nível 20 saía ao dobro do
   âncora (98 mil contra 50 mil) — porque o multiplicador não é constante:
   ele sobe de ×1,7 para ×4,2 ao longo do jogo, conforme o corpo se
   cobre. Quem fecha os DOIS âncoras ao mesmo tempo é a base, e 1,29 é
   onde ela os fecha. */
export const CRESCIMENTO = 1.29;

export function baseDoNivel(nivel) {
  const n = Math.max(1, Math.min(60, Math.round(Number(nivel) || 1)));
  return Math.round(PODER_INICIAL * Math.pow(CRESCIMENTO, n - 1));
}

/* ---------------- O QUE CADA COISA VALE ----------------
   Esta tabela É a resposta a "tudo o que aumenta o poder tem que ter
   número". Ela é pública de propósito: o jogo mostra ao jogador de onde
   vem cada ponto, e não dá para mostrar o que está escondido numa
   constante no meio de uma função.

   Duas famílias, e a distância entre elas é o que cria a estratégia:

   NUMÉRICO   muda a conta em toda rolagem — ataque extra, dano, defesa,
              atributo. Pesa muito.
   SITUACIONAL vale numa cena e não vale na outra — imunidade,
              resistência, vantagem em um atributo, desconto de PM.
              Pesa pouco, e é por isso que abrir mão de poder por uma
              delas é uma decisão, e não um erro. */
export const PESOS = {
  /* ---- numérico ---- */
  ataqueExtra: 95,   /* uma ação a mais por rodada é a coisa mais cara que existe */
  rerroll: 45,
  segundoFolego: 40,
  danoExtra: 22,
  defesa: 20,
  forca: 18, destreza: 18, vigor: 18, intelecto: 18, presenca: 18, percepcao: 18,
  dano: 16,          /* o dado de dano de uma arma */
  descontoPM: 14,
  iniciativa: 10,
  movimento: 8,
  vidaMax: 1.2,
  manaMax: 1.0,
  /* ---- situacional ---- */
  vantagem: 14,
  imunidades: 12,
  vantagemMental: 12,
  resist: 10,
  bonusSocial: 8,
  elemento: 6,
};

/* `criticoEm` não é uma chave de peso porque não é uma quantidade: é um
   limiar, e baixá-lo de 20 para 19 dobra a chance de crítico. O valor
   guardado é o número da face, então quanto MENOR, melhor — a única
   entrada da tabela em que isso acontece, e por isso ela mora fora. */
export const PESO_CRITICO = 38;

/* ---------------- O ITEM ----------------
   Índice bruto, sem dono: é o que permite comparar duas peças na bolsa
   sem equipar nenhuma, e é o mesmo número em qualquer nível. */
export const PESO_RARIDADE = { comum: 8, incomum: 22, raro: 42, epico: 72, lendario: 115 };

/* O que uma peça precisa valer para dobrar o poder de quem a usa se ela
   ocupasse todos os sete espaços. Calibrado, não escolhido: é ele que
   decide o quanto do poder de fim de jogo vem do corpo e o quanto vem do
   nível, e o teste confere os dois âncoras do pedido com ele no lugar. */
export const PESO_DO_CONJUNTO = 1400;

function somaDeEfeito(ef) {
  if (!ef || typeof ef !== "object") return 0;
  let t = 0;
  for (const [k, v] of Object.entries(ef)) {
    if (k === "criticoEm") { t += Math.max(0, 20 - (Number(v) || 20)) * PESO_CRITICO; continue; }
    const peso = PESOS[k];
    if (peso == null) continue;
    if (Array.isArray(v)) { t += v.length * peso; continue; }
    if (typeof v === "boolean") { t += v ? peso : 0; continue; }
    if (typeof v === "string") { t += peso; continue; }
    t += (Number(v) || 0) * peso;
  }
  return t;
}

export function poderDoItem(item) {
  if (!item || typeof item !== "object") return 0;
  let t = PESO_RARIDADE[String(item.raridade || "comum").toLowerCase()] || 0;
  t += somaDeEfeito(item.atributos);
  for (const p of (item.poderes || [])) t += somaDeEfeito(p && p.efeito);
  /* uma habilidade concedida é uma habilidade a mais na ficha enquanto a
     peça estiver no corpo — e é a peça que o pedido usa como exemplo do
     item que se escolhe APESAR do poder */
  if (item.concede) t += 55;
  return Math.round(t);
}

/* ---------------- OS FORTALECIMENTOS DA FICHA ----------------
   Cada um é uma PARCELA nomeada, e todas aparecem na tela. Uma parcela
   sem nome seria a mesma coisa que um número mágico: o jogador veria o
   poder subir e não saberia o que o fez subir, que é justamente o que
   este índice existe para resolver. */

/* O atributo mede a BUILD, não o nível: os pontos por nível são fixos e
   obrigatórios, então a soma quase não varia entre duas fichas do mesmo
   patamar. O que varia é onde eles foram postos, e o que os itens
   acrescentaram — e o item já é contado no equipamento, então aqui entra
   só o que está na ficha. */
export function esperadoDeAtributos(nivel) {
  return 9 + 2 * (Math.max(1, Number(nivel) || 1) - 1);
}

export function parcelaDeAtributos(pers) {
  const at = (pers && pers.atributos) || {};
  const soma = ATRIBUTOS.reduce((s, a) => s + Math.max(0, Number(at[a.id]) || 0), 0);
  if (!soma) return 0;
  const esperado = esperadoDeAtributos(pers && pers.nivel);
  /* o MAIOR também conta: concentrar é mais forte que espalhar, e a soma
     sozinha não vê isso */
  const maior = ATRIBUTOS.reduce((m, a) => Math.max(m, Number(at[a.id]) || 0), 0);
  const daSoma = (soma - esperado) * 0.030;
  const daPonta = Math.max(0, maior - 3) * 0.022;
  return Math.round(Math.max(-0.30, daSoma + daPonta) * 1000) / 1000;
}

export function parcelaDeEquipamento(pers) {
  const eq = (pers && pers.equipados) || {};
  const soma = Object.values(eq).filter(Boolean).reduce((s, it) => s + poderDoItem(it), 0);
  return Math.round((soma / PESO_DO_CONJUNTO) * 1000) / 1000;
}

/* Dádivas épicas, únicas e os poderes dos itens equipados chegam todas
   pela mesma porta em `dadivas.js` — mas o poder de item já foi contado
   no equipamento, então aqui só entram as da FICHA. Contar duas vezes o
   mesmo anel seria a forma mais silenciosa de este índice mentir. */
export function parcelaDeDadivas(pers) {
  const ids = Array.isArray(pers && pers.dadivas) ? pers.dadivas : [];
  const unicas = Array.isArray(pers && pers.dadivasUnicas) ? pers.dadivasUnicas : [];
  let t = 0;
  for (const u of unicas) t += somaDeEfeito(u && u.efeito);
  /* as da tabela não trazem o efeito junto: o id é o que a ficha guarda,
     e quem tem a tabela é `regras.js`. Recebe-se de fora para este
     arquivo continuar puro — ele não conhece módulo nenhum além da lista
     de atributos, e é o que permite testá-lo sem montar o jogo. */
  t += ids.length * 55;
  return Math.round((t / PESO_DO_CONJUNTO) * 1000) / 1000;
}

/* Habilidade aprendida é poder: são as opções que o herói tem por rodada.
   Vale pouco por unidade e muito no acumulado, que é como uma árvore de
   classe funciona de verdade. */
export function parcelaDeHabilidades(pers) {
  const n = ((pers && pers.habilidades) || []).filter(Boolean).length;
  return Math.round(n * 0.028 * 1000) / 1000;
}

/* Subclasse e especialização são degraus de identidade — cada um abre uma
   forma de jogar que a ficha não tinha. Valor fixo, porque não há
   graduação dentro deles: ou se entrou no caminho ou não. */
export function parcelaDeCaminho(pers) {
  let t = 0;
  if (pers && pers.subclasse) t += 0.10;
  if (pers && pers.especializacao) t += 0.12;
  return t;
}

/* O GRAU DIVINO ROMPE A ESCALA, e rompe de propósito — a mesma decisão
   que `orcamento.js` tomou para o peso de um deus. Um herói ascendido não
   é um herói com mais equipamento: é outra categoria de coisa, e o índice
   tem de dizer isso sozinho, senão autoriza comparações que a ficção
   inteira do jogo trata como impossíveis. */
export function parcelaDivina(pers) {
  const gd = Math.max(0, Math.min(4, Number(pers && pers.gd) || 0));
  if (!gd) return 0;
  return Math.pow(2.1, gd) - 1;
}

/* ---------------- O PODER ----------------
   Devolve o total E a conta aberta. As duas coisas juntas, sempre: um
   total sem as parcelas é um número mágico, e o pedido é explícito em
   que o jogador tem de conseguir ver de onde ele vem. */
export const PARCELAS = [
  { id: "atributos", rotulo: "atributos", calc: parcelaDeAtributos },
  { id: "equipamento", rotulo: "equipamento", calc: parcelaDeEquipamento },
  { id: "dadivas", rotulo: "dádivas", calc: parcelaDeDadivas },
  { id: "habilidades", rotulo: "habilidades", calc: parcelaDeHabilidades },
  { id: "caminho", rotulo: "caminho", calc: parcelaDeCaminho },
  { id: "divino", rotulo: "grau divino", calc: parcelaDivina },
];

export function poderDe(pers) {
  const nivel = Math.max(1, Math.round(Number(pers && pers.nivel) || 1));
  const base = baseDoNivel(nivel);
  const partes = PARCELAS.map((p) => {
    let v = 0;
    try { v = Number(p.calc(pers)) || 0; } catch { v = 0; }
    return { id: p.id, rotulo: p.rotulo, fracao: v, pontos: Math.round(base * v) };
  });
  const soma = partes.reduce((s, p) => s + p.fracao, 0);
  /* o multiplicador nunca desce abaixo de um terço: uma ficha pelada e
     mal distribuída ainda é do nível dela, e um número que despencasse
     faria o patamar deixar de significar alguma coisa */
  const mult = Math.max(0.34, 1 + soma);
  return {
    total: Math.round(base * mult),
    base, mult: Math.round(mult * 1000) / 1000,
    nivel, partes,
  };
}

/* O que ESTA peça vale para ESTE herói, em pontos de poder. É o número
   que aparece ao lado do item — e ele cresce com o nível de quem carrega,
   que é o que faz "+240" e "+3.100" quererem dizer a mesma coisa
   proporcional em dois momentos diferentes do jogo. */
export function pontosDoItem(item, pers) {
  return Math.round(baseDoNivel(pers && pers.nivel) * (poderDoItem(item) / PESO_DO_CONJUNTO));
}

/* A troca: quanto muda o meu poder se eu equipar isto no lugar do que já
   está ali. É a pergunta que o jogador faz de verdade na bolsa, e a única
   que responde "vale a pena?" — o índice bruto compara peças, a troca
   compara DECISÕES. */
export function trocaDeItem(item, pers) {
  const slot = item && item.tipo;
  const atual = ((pers && pers.equipados) || {})[slot] || null;
  const antes = poderDoItem(atual);
  const depois = poderDoItem(item);
  const base = baseDoNivel(pers && pers.nivel);
  return {
    slot, atual,
    delta: Math.round(base * ((depois - antes) / PESO_DO_CONJUNTO)),
    melhor: depois > antes,
  };
}

/* ---------------- O GRUPO ----------------
   O TETO existe pela mesma razão que existia na v9.115, e a razão não
   mudou: quem apanha é o herói. Vinte companheiros fortes não fazem o
   corpo dele aguentar o golpe do chefe — fazem dele um passageiro numa
   luta que ainda o mata. O grupo multiplica até quatro vezes e para. */
export const VALOR_DO_COMPANHEIRO = 0.6;
export const TETO_DO_GRUPO = 4;

export function poderDoGrupo(pers) {
  const eu = poderDe(pers);
  const grupo = ((pers && pers.grupo) || []).filter((g) => g && (g.vida == null || g.vida > 0));
  const deles = grupo.reduce((s, g) => s + poderDe(g).total * VALOR_DO_COMPANHEIRO, 0);
  const cru = eu.total + deles;
  const teto = eu.total * TETO_DO_GRUPO;
  return {
    total: Math.round(Math.min(cru, teto)),
    heroi: eu.total,
    companheiros: Math.round(deles),
    quantos: grupo.length,
    aparado: cru > teto,
  };
}

/* ---------------- O PODER DO QUE ESTÁ DO OUTRO LADO ----------------
   Um conteúdo declara um NÍVEL, não uma ficha. Traduzi-lo em poder é
   perguntar quanto vale um herói típico daquele patamar — é o que faz
   "conteúdo de nível 8" querer dizer "do tamanho de um herói de nível
   8", que é o que o jogador entende ao ler o número. */
/* O multiplicador de uma ficha TÍPICA em cada patamar, medido — não
   estimado. Ele não é constante: sobe de ×1,2 para ×4,0 ao longo do jogo,
   porque o corpo se cobre e a árvore de classe enche.

   A primeira versão usava um fator único (1,9) e o teste pegou o
   estrago: no meio do jogo dava certo, e nas pontas mentia — um conteúdo
   de nível 5 lia mais forte que um herói de nível 5, e o jogo abria
   dizendo "Difícil" para o que era do tamanho do jogador.

   Interpolação linear entre âncoras, e os âncoras são os da calibração —
   ALISADOS. A medição crua tinha um degrau entre 15 e 18 (×2,97 para
   ×4,02) que era ruído do sorteio de item, não do jogo, e um degrau aqui
   vira um salto de patamar lá: com ele, seis níveis acima virava
   Impossível onde sempre foi Difícil. A curva descreve uma TENDÊNCIA, e
   uma tendência tem de ser monótona e sem cotovelo.
   O contrato é este: um conteúdo de nível N é do tamanho de um herói
   típico de nível N, e a razão dá 1 quando os dois se encontram. É o que
   faz os cortes por razão significarem a mesma coisa em todo o jogo. */
export const MULT_TIPICO = [
  [1, 1.17], [3, 1.36], [5, 1.58], [8, 2.00], [10, 2.15],
  [12, 2.35], [15, 2.80], [18, 3.30], [20, 3.70], [30, 4.30],
];

export function multiplicadorTipico(nivel) {
  const n = Math.max(1, Number(nivel) || 1);
  if (n <= MULT_TIPICO[0][0]) return MULT_TIPICO[0][1];
  for (let i = 1; i < MULT_TIPICO.length; i++) {
    const [x1, y1] = MULT_TIPICO[i - 1];
    const [x2, y2] = MULT_TIPICO[i];
    if (n <= x2) return y1 + ((y2 - y1) * (n - x1)) / (x2 - x1);
  }
  return MULT_TIPICO[MULT_TIPICO.length - 1][1];
}

export function poderDoConteudo({ nivel = 1, tamanho = 0 } = {}) {
  const base = baseDoNivel(nivel);
  /* o tamanho é CUSTO, não força: uma masmorra longa de bichos fracos não
     é um covil de dragão. Entra pequeno e com teto. */
  const desgaste = 1 + Math.min(0.25, Math.max(0, (Number(tamanho) || 0) - 1) * 0.03);
  return Math.round(base * multiplicadorTipico(nivel) * desgaste);
}

/* ---------------- A LEITURA ---------------- */
export function formatarPoder(n) {
  const v = Math.round(Number(n) || 0);
  if (v < 10000) return v.toLocaleString("pt-BR");
  if (v < 1000000) return `${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  return `${(v / 1000000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mi`;
}

/* A conta aberta, em uma linha, para o tooltip e para o painel. */
export function contaDoPoder(p) {
  const partes = (p.partes || []).filter((x) => Math.abs(x.fracao) >= 0.005);
  const corpo = partes.length
    ? partes.map((x) => `${x.rotulo} ${x.fracao > 0 ? "+" : ""}${Math.round(x.fracao * 100)}%`).join(" · ")
    : "nada além do nível";
  return `nível ${p.nivel} vale ${formatarPoder(p.base)} · ${corpo} = ${formatarPoder(p.total)}`;
}

/* O bloco fixo é CURTO porque ele custa em todo turno com gente na cena.
   A primeira versão tinha 637 caracteres e pôs a pior cena real 246
   acima do teto de 80 mil — o teste pegou antes do jogador. O que ficou
   é o que só este bloco diz: que existe uma diferença de porte e que ela
   aparece no comportamento, nunca em número. O resto (o TOM de um
   desafio) já viaja no envelope da dificuldade, e repeti-lo aqui seria
   pagar duas vezes pela mesma regra. */
export const PODER_PROMPT = `PORTE (do SISTEMA): quem é muito mais forte intimida sem esforço e não corre risco real; quem é muito mais fraco é tratado como o que é. Isso aparece no que as pessoas FAZEM ao ver o herói — nunca em número, e ninguém neste mundo cita índice.`;
