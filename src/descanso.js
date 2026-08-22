/* ============================================================
   DESCANSO E ATRITO (v9.17) — a pergunta "seguimos ou acampamos?"

   O jogo já tinha descanso: curto devolvia metade do PV e do PM,
   longo devolvia tudo. Só que isso é um BOTÃO DE CURA, não um
   descanso — de graça, ilimitado, sem escolha nenhuma dentro. E
   sem escolha ali dentro, o resto do jogo perde a espinha: se dá
   para acampar depois de cada luta e voltar inteiro, nenhuma luta
   custa nada, nenhum recurso é escasso e a masmorra vira um
   corredor de salas independentes.

   O que faltava é o ATRITO — o motor econômico de qualquer mesa.
   Três peças, e elas só funcionam juntas:

   1) DADOS DE VIDA. O descanso curto não te dá PV: te dá o direito
      de GASTAR dados de vida, um por nível, que só voltam pela
      metade no descanso longo. Curar passa a consumir um recurso
      finito, e "quanto eu gasto agora?" vira a decisão que o
      acampamento não tinha.

   2) UM LONGO POR DIA. Sem teto, acampar duas vezes seguidas é
      sempre a jogada certa e o relógio do mundo deixa de importar.
      Com teto, o segundo acampamento do dia rende só o benefício
      curto — e o jogador tem que decidir se queima o dia.

   3) O PM É DO LONGO. O curto devolve um quarto da mana; o resto
      espera a noite. É o que faz o conjurador administrar o dia em
      vez de despejar tudo na primeira luta.

   Uma escolha de calibragem que vale explicar: o curto NÃO ficou
   inútil sem dados de vida. Ele ainda tira condições leves e
   devolve aquele quarto de mana. Um descanso que não faz nada
   nenhum jogador usa, e aí o atrito não ensina nada — só irrita.
   ============================================================ */

/* ---------------- O DADO DE VIDA ----------------
   Vem da classe, e a escala é a mesma do PV base que ela já
   tinha: quem aguenta mais na tabela cura mais no acampamento.
   Derivar de `vidaBase` em vez de manter uma segunda tabela evita
   as duas ficarem contando histórias diferentes. */
export function dadoDeVida(vidaBase) {
  const v = Number(vidaBase) || 10;
  if (v >= 14) return 12;
  if (v >= 12) return 10;
  if (v >= 10) return 8;
  return 6;
}

export function garantirDadosVida(pers) {
  const nivel = Math.max(1, (pers && pers.nivel) || 1);
  const d = (pers && pers.dadosVida) || {};
  const gastos = Math.max(0, Math.min(nivel, Math.floor(Number(d.gastos) || 0)));
  return { total: nivel, gastos };
}

export function dadosDisponiveis(pers) {
  const d = garantirDadosVida(pers);
  return d.total - d.gastos;
}

/* Um dado por vez, e o resultado aparece. Gastar três de uma vez
   seria mais rápido e diria menos: a graça é ver o d8 dar 2 e ter
   que decidir se queima outro. */
export function gastarDadoDeVida(pers, { lados = 8, modVigor = 0, sorte = Math.random } = {}) {
  if (dadosDisponiveis(pers) <= 0) return { ok: false, motivo: "não há mais dados de vida — só o descanso longo devolve" };
  if ((pers.vida || 0) >= (pers.vidaMax || 0)) return { ok: false, motivo: "você já está com o PV cheio" };
  const rolado = 1 + Math.floor(sorte() * lados);
  /* piso 1: um dado de vida gasto nunca cura zero, mesmo com Vigor negativo.
     Queimar um recurso finito e não receber nada não é atrito, é castigo. */
  const cura = Math.max(1, rolado + modVigor);
  const d = garantirDadosVida(pers);
  const vida = Math.min(pers.vidaMax || 0, (pers.vida || 0) + cura);
  return {
    ok: true, rolado, cura: vida - (pers.vida || 0), lados,
    pers: { ...pers, vida, dadosVida: { total: d.total, gastos: d.gastos + 1 } },
    texto: `🩹 Dado de vida: d${lados} → ${rolado}${modVigor ? ` ${modVigor >= 0 ? "+" : "−"} ${Math.abs(modVigor)}` : ""} = ${cura} PV · ${vida}/${pers.vidaMax} · restam ${d.total - d.gastos - 1} dado(s)`,
  };
}

/* ---------------- UM LONGO POR DIA ----------------
   `ultimoLongo` guarda o dia em que o herói ACORDOU da última noite
   inteira, não aquele em que deitou. A distinção não é preciosismo:
   a noite longa avança o calendário, então marcar o dia de ontem
   faria a comparação passar sempre e a regra nunca morderia. */
export function podeDescansoLongo(pers, dia) {
  const ultimo = (pers && pers.ultimoLongo) != null ? pers.ultimoLongo : null;
  if (ultimo == null || ultimo !== dia) return { pode: true };
  return {
    pode: false,
    motivo: "você já dormiu uma noite inteira hoje — um corpo não se recupera duas vezes no mesmo dia",
  };
}

/* ---------------- OS DOIS DESCANSOS ----------------
   Devolvem { pers, msgs } e nada mais: quem mexe em condição, em
   suprimento e no relógio é o App, que já fazia isso. */
export const FRACAO_MANA_CURTO = 0.25;
export const FRACAO_GRUPO_CURTO = 0.25;

export function aplicarCurto(pers) {
  const msgs = [];
  const manaGanha = Math.ceil((pers.manaMax || 0) * FRACAO_MANA_CURTO);
  const mana = Math.min(pers.manaMax || 0, (pers.mana || 0) + manaGanha);
  /* o grupo não tem dados de vida de propósito: administrar a ficha dos
     companheiros seria contabilidade, não decisão. Eles curam uma fração
     fixa e pronto — o recurso escasso é o do jogador. */
  const grupo = (pers.grupo || []).map((g) => ({
    ...g,
    vida: Math.min(g.vidaMax || 0, (g.vida || 0) + Math.ceil((g.vidaMax || 10) * FRACAO_GRUPO_CURTO)),
  }));
  msgs.push(`🔥 Descanso curto — ${mana - (pers.mana || 0) > 0 ? `+${mana - (pers.mana || 0)} PM` : "sem mana a recuperar"}. PV só com dados de vida: você tem ${dadosDisponiveis(pers)}.`);
  return { pers: { ...pers, mana, grupo }, msgs };
}

/* ---------------- A CONTA DA NOITE (v9.100) ----------------
   Quantos dados a noite inteira devolve, e se o abrigo mudou alguma
   coisa. Está aqui fora, e exportada, porque três lugares precisam da
   MESMA resposta: o descanso que aplica, a linha que anuncia e o painel
   do acampamento que promete antes de o jogador clicar.

   Foi por isso que ela virou função. O painel começou repetindo a
   fórmula com outras palavras — "a noite devolve um dado a mais" — e uma
   fórmula repetida é uma fórmula que vai divergir. Pior: ela já mentia
   na primeira noite, porque no nível 1 há um dado só e o piso engole os
   dois lados da régua. Um número que mente uma vez deixa de ser lido
   para sempre.

   `valeu` é o ajuste que SOBROU depois do piso e do teto: zero quando o
   abrigo não mudou o resultado, mesmo tendo mudado a conta. É o único
   número que se pode mostrar ao jogador sem prometer o que não vem. */
export function dadosQueVoltam(pers, abrigo = null) {
  const d = garantirDadosVida(pers);
  const ajuste = (abrigo && Number(abrigo.dados)) || 0;
  const base = Math.max(1, Math.floor(d.total / 2));
  const devolve = Math.max(1, base + ajuste);
  const gastos = Math.max(0, d.gastos - devolve);
  const semAbrigo = Math.max(0, d.gastos - base);
  return { total: d.total, devolve, gastos, valeu: gastos === semAbrigo ? 0 : ajuste };
}

/* `abrigo` é o degrau do sítio do acampamento — `{ dados: -1|0|+1,
   rotulo }`, montado por `acampamento.js`. `null` é o comportamento de
   antes da v9.100, e é o padrão de propósito: quem chama sem saber do
   sítio (save antigo, teste, outro caminho) recebe exatamente a regra
   antiga. */
export function aplicarLongo(pers, dia, abrigo = null) {
  const msgs = [];
  const d = garantirDadosVida(pers);
  /* metade dos dados de volta, no mínimo um: é a regra que faz uma noite
     não apagar um dia inteiro de desgaste. Duas noites seguidas até
     recuperam tudo — mas custam dois dias do relógio do mundo.

     v9.100: e o ABRIGO move essa metade um dado para cada lado. */
  const conta = dadosQueVoltam(pers, abrigo);
  const gastos = conta.gastos;
  const grupo = (pers.grupo || []).map((g) => ({ ...g, vida: g.vidaMax }));
  msgs.push(`🌙 Descanso longo — PV e PM cheios para você e o grupo.`);
  if (d.gastos > 0) msgs.push(`🩹 Dados de vida: +${d.gastos - gastos} de volta (${d.total - gastos}/${d.total}).`);
  /* O ABRIGO SÓ FALA QUANDO MUDOU ALGUMA COISA, e a comparação é com o
     RESULTADO, não com a fórmula. No nível 1 há um dado só e o piso
     segura os dois lados; com quase tudo inteiro, o dado a mais não tem
     onde entrar. Anunciar nos dois casos seria o sistema prometendo o que
     a sua própria régua acabou de engolir — e um número que mente uma vez
     deixa de ser lido para sempre. */
  if (abrigo && abrigo.rotulo && conta.valeu !== 0) {
    msgs.push(`${conta.valeu > 0 ? "🛏" : "🥶"} ${abrigo.rotulo}: um dado de vida a ${conta.valeu > 0 ? "mais" : "menos"} de volta.`);
  }
  return {
    pers: { ...pers, vida: pers.vidaMax, mana: pers.manaMax, grupo, dadosVida: { total: d.total, gastos }, ultimoLongo: dia },
    msgs,
  };
}

/* ---------------- O QUE O MESTRE RECEBE ----------------
   Só o que muda a narração: quanto fôlego ainda existe. É o que
   permite a ele descrever um grupo esgotado como esgotado, em vez
   de tratar todo acampamento como se fosse o primeiro. */
export function resumoDescansoPrompt(pers, dia) {
  const d = garantirDadosVida(pers);
  const livres = d.total - d.gastos;
  const dormiu = podeDescansoLongo(pers, dia).pode === false;
  const partes = [`dados de vida ${livres}/${d.total}`];
  if (dormiu) partes.push("já dormiu a noite inteira hoje");
  if (livres === 0) partes.push("sem nenhum fôlego de reserva");
  return `FÔLEGO (do sistema): ${partes.join(" · ")}. ${livres === 0 ? "Descreva o cansaço acumulado: o grupo está no limite e mais um acampamento curto não resolve." : livres <= Math.ceil(d.total / 3) ? "O grupo está gasto — deixe isso aparecer no corpo e no humor." : "O grupo ainda tem lenha para queimar."} Nunca invente cura, nunca conceda descanso por conta própria e nunca diga números de sistema.`;
}

export const DESCANSO_PROMPT = `DESCANSO (v9.17 — economia, não botão):
- O descanso CURTO não cura sozinho: o herói gasta DADOS DE VIDA, que são finitos e só voltam pela metade numa noite inteira. Se ele acabou de acampar e continua machucado, é porque escolheu poupar dados — não narre isso como fraqueza nem como erro.
- O descanso LONGO acontece UMA vez por dia. Um segundo acampamento no mesmo dia rende só o benefício curto.
- Você NUNCA concede cura, descanso, "uma noite bem dormida" ou recuperação de recurso por narração. Quem restaura é o sistema, sempre por envelope. Narre o cansaço e o alívio; nunca os números.`;
