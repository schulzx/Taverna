/* ============================================================
   A DIFICULDADE (v9.115) — o que o cartaz não dizia

   "dificuldade em quests e dificuldade em masmorras … ela vem com uma
   dificuldade definida, e compara com o lvl e atributos do player e do
   grupo."

   O jogo sempre soube medir uma LUTA: `orcamento.js` pesa cada criatura
   em unidades de herói, corrige pela economia de ação e devolve uma
   faixa. O que ele nunca soube medir é o que vem ANTES da luta — o
   trabalho pregado no mural, a boca da masmorra. O jogador aceitava um
   contrato sem nenhuma ideia do tamanho dele e descobria o tamanho
   morrendo, que é a forma mais cara de descobrir.

   ---------------- UMA ESCALA, DUAS LEITURAS ----------------

   Este arquivo NÃO cria uma segunda tabela de força. `orcamento.js` já
   declarou o que vale um companheiro (0,6 de um herói) e essa constante
   é importada, não recopiada. Duas tabelas para a mesma pergunta é
   exatamente como nasce o balanceamento fantasma, e este projeto já
   escreveu isso no comentário do orçamento.

   A diferença é o que cada uma responde:

     orcamento.js   ISSO AQUI, AGORA, é justo?     (criaturas na mesa)
     dificuldade.js AQUILO ALI, se eu for, é?      (um nível declarado)

   Antes da luta não há criatura nenhuma para pesar — há um NÍVEL
   declarado pelo conteúdo. Então a conta é de níveis, e a resposta é a
   distância entre dois números.

   ---------------- POR QUE DELTA, E NÃO RAZÃO ----------------

   O orçamento divide (peso ÷ capacidade) porque compara coisas da mesma
   natureza: unidades de herói contra unidades de herói. Aqui os dois
   lados são NÍVEIS, e nível é escala logarítmica disfarçada de linear —
   a distância entre 3 e 6 não é a mesma coisa que entre 13 e 16, mas em
   ambos os casos "três níveis acima" quer dizer a mesma coisa na mesa.
   Subtrair é a operação certa; dividir mentiria nos extremos.

   ---------------- OS QUATRO PATAMARES ----------------

   Eles são RELATIVOS, e é o que o pedido pediu: a mesma masmorra é
   Fácil para quem passou dela e Impossível para quem acabou de chegar.
   Um patamar fixo ("esta masmorra é difícil") seria informação sobre o
   conteúdo; o jogador precisa de informação sobre a DECISÃO dele.

   E o veredito é honesto nos dois extremos. IMPOSSÍVEL não quer dizer
   "muito difícil": quer dizer que não há como, e o sistema diz isso em
   vez de deixar o jogador descobrir. Um jogo que nunca diz não transfere
   ao jogador o trabalho de adivinhar o que o código já sabe.
   ============================================================ */

import { VALOR_COMPANHEIRO } from "./orcamento.js";
import { ATRIBUTOS, tetoAtributo } from "./atributos.js";

/* ---------------- OS PATAMARES ----------------
   `de` é o piso do delta (nível efetivo do grupo − nível do conteúdo).
   Lê-se de cima para baixo: o primeiro cujo piso o delta alcança.

   Os cortes não são simétricos, de propósito. Para CIMA, três níveis já
   bastam para tirar o medo — o herói de 8 num trabalho de 5 não corre
   risco de verdade. Para BAIXO a folga é maior porque é onde mora o
   jogo: um herói de 5 num trabalho de 9 tem chance, e é a melhor cena
   que este sistema produz. Só depois de seis níveis abaixo é que
   "difícil" vira mentira. */
/* `cor` é uma CHAVE do tema, não um valor: a paleta mora em constantes.js
   e um "#D86A5B" escrito aqui seria a segunda cópia dela — a mesma classe
   de defeito que este arquivo evita na tabela de força. As quatro escolhidas
   formam gradiente com o que já existe: verde, âmbar claro, âmbar, vermelho. */
export const PATAMARES = [
  {
    id: "facil", de: 3, icone: "○", rotulo: "Fácil", cor: "ok",
    nota: "você passou desta faixa — vai custar tempo, não sangue",
    aoMestre: "o herói está ACIMA disto: a oposição não o assusta e ele sabe disso. Narre a competência, não o perigo — o risco aqui é o tédio e o descuido, nunca a morte",
  },
  {
    id: "medio", de: -1, icone: "◐", rotulo: "Médio", cor: "amberSoft",
    nota: "é do seu tamanho: dá para ganhar, e vai doer",
    aoMestre: "isto é do TAMANHO do herói: a oposição é páreo. Narre o custo real — recurso gasto, ferimento, escolha difícil — e deixe a vitória parecer conquistada, nunca dada",
  },
  {
    id: "dificil", de: -6, icone: "●", rotulo: "Difícil", cor: "amber",
    nota: "acima de você: sem plano, terreno ou ajuda, é onde se morre",
    aoMestre: "o herói está ABAIXO disto e a diferença aparece: a oposição é melhor, mais numerosa ou mais bem posicionada. Narre isso com honestidade — o golpe que ele não consegue aparar, o que ele não entende. Não amoleça a cena por pena, e não feche a porta: um plano esperto ainda vence",
  },
  {
    id: "impossivel", de: -Infinity, icone: "☠", rotulo: "Impossível", cor: "danger",
    nota: "não é difícil, é impossível — nada do que você tem alcança isto",
    aoMestre: "isto está FORA DO ALCANCE do herói e o mundo sabe: quem entende do assunto tenta demovê-lo, e quem não entende tem medo dele. Não invente uma janela de sorte, não enfraqueça a ameaça e não permita vitória por narrativa — se ele insistir, a cena mostra a distância. A saída daqui é ficar mais forte ou trazer gente, nunca coragem",
  },
];

export function patamarDoDelta(delta) {
  const d = Number.isFinite(delta) ? delta : 0;
  return PATAMARES.find((p) => d >= p.de) || PATAMARES[PATAMARES.length - 1];
}

/* ---------------- O ATRIBUTO QUE DECIDE ----------------
   Não é a SOMA. Neste jogo os pontos por nível são fixos e obrigatórios
   — todo mundo do nível 9 gastou os mesmos pontos —, então a soma quase
   não varia e mediria o nível de novo, com outro nome.

   O que varia é a CONCENTRAÇÃO: um nível 9 com +5 no atributo da estrada
   dele bate muito mais forte que um nível 9 com +3 espalhado por seis.
   Comparar o maior atributo com o esperado no nível é o que separa uma
   build feita de uma build diluída, e é a única leitura de atributo que
   diz alguma coisa que o nível já não disse. */
export function esperadoNoNivel(nivel) {
  const n = Math.max(1, Number(nivel) || 1);
  return Math.min(tetoAtributo(n), 3 + Math.floor(n / 3));
}

export function temperoDosAtributos(pers) {
  const at = (pers && pers.atributos) || {};
  const maior = ATRIBUTOS.reduce((m, a) => Math.max(m, Number(at[a.id]) || 0), 0);
  if (!maior) return 0;
  const d = maior - esperadoNoNivel(pers && pers.nivel);
  return Math.max(-2, Math.min(2, d));
}

/* ---------------- O QUE ESTÁ NO CORPO ----------------
   Equipamento entra pequeno e entra por RARIDADE, não por atributo. Os
   bônus de item já estão dentro das rolagens do combate; contá-los aqui
   outra vez seria pagar duas vezes pela mesma espada. O que este termo
   mede é outra coisa — se o herói chegou vestido ou pelado —, e para
   isso a raridade do que ele carrega basta. */
const PESO_RARIDADE = { comum: 0, incomum: 0.25, raro: 0.5, epico: 0.85, lendario: 1.3 };

export function temperoDoEquipamento(pers) {
  const eq = (pers && pers.equipados) || {};
  const pecas = Object.values(eq).filter(Boolean);
  if (!pecas.length) return -1;   /* sem nada no corpo é uma desvantagem real */
  const soma = pecas.reduce((s, it) => s + (PESO_RARIDADE[String(it.raridade || "comum").toLowerCase()] || 0), 0);
  return Math.max(-1, Math.min(2, Math.round((soma - 0.5) * 10) / 10));
}

/* ---------------- QUANTO O GRUPO SOMA ----------------
   Um companheiro não é meio herói a mais na conta de NÍVEL: dois
   companheiros não valem "+1,2 nível". O ganho de trazer gente satura —
   o quarto companheiro acrescenta muito menos que o primeiro, porque a
   oposição não tem mais alvos para dividir e o espaço acaba.

   Logaritmo é a forma dessa saturação, e o três é o fator que faz um
   companheiro do mesmo nível valer cerca de dois níveis, que é o que a
   mesa mostra. A capacidade em si vem do orçamento — a mesma constante
   que a luta usa, não uma cópia. */
export function capacidadeDaComitiva(pers) {
  const nivel = Math.max(1, Number((pers && pers.nivel)) || 1);
  const grupo = ((pers && pers.grupo) || []).filter((g) => g && (g.vida == null || g.vida > 0));
  let cap = 1;
  for (const g of grupo) {
    /* um companheiro muito abaixo do herói ajuda menos, e um acima não
       ajuda o dobro: o teto existe para o grupo não virar a resposta
       para tudo */
    const rel = Math.max(0.3, Math.min(1.5, (Number(g.nivel) || 1) / nivel));
    cap += VALOR_COMPANHEIRO * rel;
  }
  return Math.round(cap * 100) / 100;
}

export function bonusDaComitiva(pers) {
  const cap = capacidadeDaComitiva(pers);
  if (cap <= 1) return 0;
  return Math.round(Math.log2(cap) * 3 * 10) / 10;
}

/* ---------------- O TETO DO QUE SE PODE COMPENSAR ----------------
   O teste pegou o defeito antes do jogador: um nível 5 com quatro
   companheiros de nível 7 e o corpo coberto de lendário somava +10,4 e
   lia "Médio" numa masmorra de nível 15. A leitura estaria errada por
   uma razão que a soma não vê — quem apanha é o HERÓI. Companheiro forte
   não faz o herói aguentar o golpe do chefe; faz dele um passageiro numa
   luta que ainda o mata.

   Então a compensação tem teto, e o teto é o próprio nível: você pode
   ser carregado até quase o dobro do que é, e não além. É a mesma
   verdade que fez o pedido da raid nascer com nível mínimo — trazer
   gente forte não é substituto para ser forte. */
export function tetoDaCompensacao(nivel) {
  const n = Math.max(1, Number(nivel) || 1);
  return Math.min(8, Math.max(2, Math.round(n * 0.8 * 10) / 10));
}

/* ---------------- O NÍVEL EFETIVO ----------------
   É o número que entra na subtração. Nível é o termo dominante e tem de
   ser: se equipamento e companheiro pudessem compensar sem limite, o
   nível deixaria de significar alguma coisa e a progressão inteira
   viraria enfeite. */
export function nivelEfetivo(pers) {
  const nivel = Math.max(1, Number((pers && pers.nivel)) || 1);
  const atrib = temperoDosAtributos(pers);
  const equip = temperoDoEquipamento(pers);
  const grupo = bonusDaComitiva(pers);
  const teto = tetoDaCompensacao(nivel);
  const cru = atrib + equip + grupo;
  /* o corte é proporcional: se o teto apara, apara os três juntos, para
     não escolher arbitrariamente qual deles perde o valor */
  const extra = Math.min(teto, cru);
  return {
    nivel, atrib, equip, grupo, teto,
    aparado: cru > teto,
    total: Math.round((nivel + extra) * 10) / 10,
  };
}

/* ---------------- A AVALIAÇÃO ----------------
   `nivel` é o do conteúdo. `tamanho` é o desgaste: uma masmorra de sete
   salas cobra do fôlego antes do chefe, e um trabalho de cinco etapas
   cobra dos dias. Entra pequeno — meio nível a cada duas salas, com teto
   — porque desgaste é custo, não força: ele torna a coisa mais cara, não
   mais forte, e confundir os dois faria uma masmorra longa de bichos
   fracos parecer um covil de dragão. */
export function pesoDoTamanho(tamanho) {
  const t = Math.max(0, Number(tamanho) || 0);
  if (t <= 1) return 0;
  return Math.min(2, Math.round((t - 1) * 0.25 * 10) / 10);
}

export function avaliar({ nivel = 1, tamanho = 0, rotulo = "" } = {}, pers) {
  const ef = nivelEfetivo(pers);
  const alvo = Math.max(1, Number(nivel) || 1) + pesoDoTamanho(tamanho);
  const delta = Math.round((ef.total - alvo) * 10) / 10;
  const patamar = patamarDoDelta(delta);
  return {
    patamar, delta, rotulo,
    nivelDoConteudo: Math.round(alvo * 10) / 10,
    efetivo: ef,
    porque: porqueAssim(ef, alvo, delta),
  };
}

/* Uma linha que explica a conta em português, porque um rótulo sem
   motivo é a mesma coisa que um número mágico: o jogador não sabe se
   deve subir de nível, arrumar gente ou trocar de espada. */
export function porqueAssim(ef, alvo, delta) {
  const partes = [`nível ${ef.nivel}`];
  if (ef.grupo > 0) partes.push(`+${ef.grupo} de grupo`);
  if (ef.atrib) partes.push(`${ef.atrib > 0 ? "+" : ""}${ef.atrib} de atributo`);
  if (ef.equip) partes.push(`${ef.equip > 0 ? "+" : ""}${ef.equip} de equipamento`);
  const lado = delta >= 3 ? "bem acima" : delta >= -1 ? "à altura" : delta >= -6 ? "abaixo" : "muito abaixo";
  return `${partes.join(" ")} = ${ef.total} contra ${Math.round(alvo * 10) / 10} — ${lado}`;
}

/* ---------------- OS DOIS CHAMADORES ---------------- */

/* Uma missão sem `nivel` é uma missão de save antigo. Ela não pode
   cair para 1 — um contrato de nível 1 num herói de 12 sairia "Fácil"
   para tudo que existe no diário, e um rótulo que nunca varia é pior
   que rótulo nenhum, porque ensina o jogador a não olhar. Sem o dado,
   NÃO se opina: `null` e a interface não mostra nada. */
export function dificuldadeDaMissao(missao, pers) {
  if (!missao || !Number.isFinite(Number(missao.nivel)) || Number(missao.nivel) <= 0) return null;
  return avaliar({
    nivel: Number(missao.nivel),
    tamanho: (missao.etapas || []).length,
    rotulo: missao.titulo || "",
  }, pers);
}

export function dificuldadeDaMasmorra(mm, pers) {
  if (!mm || !Number.isFinite(Number(mm.nivel)) || Number(mm.nivel) <= 0) return null;
  return avaliar({
    nivel: Number(mm.nivel),
    tamanho: (mm.salas || []).length,
    rotulo: mm.nome || "",
  }, pers);
}

/* ---------------- O QUE VAI PARA A TELA ---------------- */
export function linhaDaDificuldade(d) {
  if (!d) return "";
  return `${d.patamar.icone} ${d.patamar.rotulo}`;
}

/* ---------------- O QUE VAI PARA O NARRADOR ----------------
   Só o `aoMestre`, e nunca o número. O rótulo é do painel; a IA recebe a
   INSTRUÇÃO DE CENA que aquele patamar implica, que é a única coisa que
   ela pode fazer com esta informação. Mandar "delta −7" para um narrador
   é mandar rótulo de sistema para a boca de alguém, e esta casa já pagou
   por isso duas vezes na mesma partida.

   E NÃO HÁ BLOCO FIXO. A primeira versão tinha um parágrafo permanente no
   prompt explicando o sistema de dificuldade, e ele estourou o teto da
   pior cena real em 21 caracteres — o teste pegou antes do jogador. O
   conserto não foi encolher o parágrafo: foi ver que ele era redundante.
   Um envelope que já diz quem decidiu, o que fazer e o que não fazer não
   precisa de alguém apresentando-o antes; e assim a regra custa
   caractere só nos turnos em que existe uma dificuldade para governar,
   que é o que todo o resto do conselho já faz. */
export function envelopeDaDificuldade(d, oQue = "isto") {
  if (!d) return "";
  return `[DIFICULDADE — MEDIDA PELO SISTEMA] O sistema comparou a força real do herói e do grupo com o tamanho de ${oQue}, e o veredito governa o TOM desta cena: ${d.patamar.aoMestre}. Nunca diga esse veredito em voz alta e nunca cite número nenhum: ele aparece no que a oposição parece e no que a gente do lugar acha da ideia.`;
}
