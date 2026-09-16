/* ============================================================
   O PV TEMPORÁRIO (Fase V · V1) — o poço que apanha por você

   A regra saiu inteira da boca da pessoa (14/09), e este módulo não a
   reinterpreta, só a executa:

     *"Da mesma forma da mesa: absorve o dano antes do PV real, não cura
     e não acumula; se você tem +4 e usa +10, deve escolher qual vai
     ser, ou o sistema escolhe automaticamente o maior."*

   Três promessas e nenhuma a mais. NÃO CURA: `vida` e `vidaMax` saem
   daqui intocados em todos os caminhos — um poço cheio sobre um corpo
   moído continua um corpo moído, e é isso que o separa de uma poção.
   NÃO ACUMULA: dois poços nunca somam. FICA O MAIOR, e a escolha existe
   — quem tem 4 e recebe 10 pode ficar com o 4, se tiver motivo; sem
   ninguém escolher, fica o 10.

   ---------------- POR QUE UM CAMPO, E NÃO UMA SEXTA LINHA ----------------

   A tentação era pôr isto na família `absorve` (`ABSORCAO_DO_BUFF`,
   efeitos.js) — já existe, já tem número, já tem porta. Não dá, e o
   motivo está escrito no comentário de `absorverDano` com todas as
   letras: o abrigo gasta-se INTEIRO na primeira coisa que encontra,
   porque guardar o resto "transformaria um escudo numa poupança".

   O temporário É uma poupança, por desenho. Ele gasta-se PARCIALMENTE:
   uma batida de 3 num poço de 9 deixa 6 de pé para a batida seguinte.
   Pô-lo na família `absorve` seria ou quebrar a promessa do escudo
   ("absorve o PRÓXIMO dano") ou dar ao poço a regra do escudo — e as
   duas são a mesma doença desta casa, que é uma regra com dois
   comportamentos e nenhum nome. Duas regras diferentes, dois sítios.

   ---------------- A ORDEM DO DANO, E POR QUE ESTA ----------------

     abrigo (família `absorve`) → TEMPORÁRIO → PV real → a queda

   POR QUE O ABRIGO VEM PRIMEIRO. Não é gosto, é regressão. O abrigo
   gasta-se inteiro assim que TOCA num golpe; pôr o temporário à frente
   mudaria QUANDO ele se gasta — uma batida inteiramente comida pelo
   poço deixaria o escudo de pé para a batida seguinte, e isso é um jogo
   diferente do de hoje, com o abrigo a render mais do que rendia. Com o
   abrigo primeiro, esta fase é PURAMENTE ADITIVA: ficha sem temporário
   devolve byte a byte o que devolvia antes, incluindo `absorvido: 0` e
   `linha: ""`.

   E é a ordem da mesa, que é o argumento que não depende do nosso
   código: redução e absorção incidem sobre o GOLPE — são coisas que
   acontecem ao ataque a caminho —, e o PV temporário é a última coisa
   entre o golpe já resolvido e a carne. Ele não reduz nada: ele apanha
   no lugar do corpo.

   E A QUEDA NÃO PRECISOU DE REGRA NENHUMA (Q1, `queda.js`). Como
   `absorverDano` é a ÚNICA porta por onde o dano passa antes de virar
   PV, e `quedaAoChegarAZero` só é perguntada quando o PV REAL chega a
   zero, um herói nunca cai com escudo de pé nem com poço por gastar —
   a ordem sai por COMPOSIÇÃO, não por uma regra nova a lembrar-se dela.
   Q1 fica exatamente como estava: V1 não lhe toca numa linha.

   ---------------- OS NÚMEROS, MEDIDOS ----------------

   `teto: 9`. O teto do abrigo é 12 e foi medido assim (`ABSORCAO_DO_BUFF`,
   efeitos.js): é o maior número que ainda fica ABAIXO de um golpe
   mediano (13), para que nem a absorção mais cara do acervo apague uma
   batida inteira. O temporário atravessa batidas, logo vale MAIS por
   ponto que um abrigo de uma vez só — o teto dele não pode ser maior
   que 12, e a medida tem de ser a de cima um degrau acima: a unidade do
   abrigo é o GOLPE, a do poço é a RODADA.

   MEDIDO, e não estimado — a medição inteira (N, cenários, intervalos)
   está escrita no diário desta versão; aqui fica só o que justifica o
   número. No cenário `justo`, um combate leva **6,30 ± 0,25 rodadas** e
   o grupo inteiro (herói + três) apanha **243,91 ± 6,82** nele — cerca
   de 38,7 por rodada, repartidos por quatro corpos, ou **9,69 por corpo
   por rodada**. No `duro`: 5,09 rodadas, 223,92 de dano, **11,00** por
   corpo por rodada. Manda o MENOR dos dois, porque é na luta mais
   branda que uma rodada de graça é mais barata de comprar. **9 é o
   maior inteiro que ainda fica abaixo de 9,69** — o poço mais caro que
   este sistema pode dar nunca compra uma rodada inteira de impunidade,
   que é exatamente a lei que o teto 12 escreveu para o golpe.

   `turnosPadrao: 7`. O prazo tem de cobrir a luta: um poço que expira no
   meio dela é o mesmo que não existir, e teria o efeito perverso de
   premiar quem o bebe tarde. O combate mede 6,30 ± 0,25 rodadas no
   `justo` (o mais longo dos três cenários; o `duro` dá 5,09 e o `brando`
   2,95), e 7 é o primeiro inteiro acima da margem de cima.

   COM A RESSALVA QUE Q1 IMPRIMIU, e ela vale aqui inteira: **a medição
   correu com `grade: null`** — sem tabuleiro, todo golpe alcança toda
   gente e ninguém gasta rodada a andar. É LIMITE OTIMISTA, não o jogo.
   Com grade a luta é MAIS longa (X1 mediu 2 a 3 rodadas só de
   caminhada), logo 7 é piso da duração real e não o retrato dela.

   `turnosMax: 10`. É o teto que esta casa já dá a prazo que vem de fora
   (`LIMITES_DO_EFEITO.turnosMax`, efeitos.js:61), e não há motivo para o
   poço ter um segundo teto de prazo com outro número. Está ESPELHADO e
   não importado, pelo mesmo desenho de `GOLPE_NO_CAIDO.falhasAteMorrer`
   (queda.js), que espelha o 3 de `combate.js`: a suíte cobra que os dois
   concordem, e em troca este módulo não importa nada.

   `minimo: 2`. O piso é o de `ABSORCAO_DO_BUFF.minimo`, e pelo mesmo
   motivo: a proteção mais barata do acervo (Escudo Arcano, 2 PM) compra
   4, e uma oferta de 1 está abaixo de qualquer coisa que o sistema saiba
   vender. Um campo que nasce na ficha para parar um ponto é o mecanismo
   a aparecer sem comprar nada.

   ---------------- A SETA APONTA NUM SENTIDO SÓ ----------------

   Este módulo NÃO IMPORTA NADA de `src/` — é tabela pura, o mesmo molde
   de `queda.js`. Quem o importa é `efeitos.js` (por `gastarTemporario`,
   dentro de `absorverDano`), e a seta ao contrário fecharia um círculo
   `efeitos ↔ temporario` que deixaria a ordem de avaliação decidir se
   `PV_TEMPORARIO` nasce antes ou depois de `ABSORCAO_DO_BUFF`. Por isso
   o 12 do abrigo aparece aqui só no comentário acima, nunca no código.

   ---------------- NOTAS PARA V2 (a fiação, que não é minha) -------------

   O bastão do `App.jsx` está com a outra mente; fica escrito o que a
   fiação vai precisar, para não se descobrir de novo:

   · `tickTemporario` NÃO É CHAMADO POR NINGUÉM AINDA. O relógio da
     rodada é de V2 — ele anda ao lado de `tickEfeitos` (regras-jogo.js:369)
     e no mesmo sítio, e enquanto não andar o poço dura para sempre. É a
     dívida declarada desta etapa, no mesmo molde das notas de Q2.
   · `ganharTemporario` também não tem quem o chame: a fonte (poção,
     milagre, habilidade) é V2. O módulo nasce com a regra pronta e a
     torneira fechada, de propósito.
   · `vereditoDoTemporario` É A TELA DE V2. `haEscolha: true` é o sinal de
     que o jogador tem uma decisão de verdade (4 contra 10) e de que ela
     deve aparecer ANTES do clique — "o veredito antes do clique". Sem
     ninguém escolher, o padrão é `escolhaPadrao` e fica o maior.
   · O QUE `arena.js:249` AINDA NÃO FAZ, e é o furo a fechar em V2: ela
     escreve de volta só `outro.efeitos = ab.pers.efeitos` quando
     `ab.absorvido > 0`. O poço vive em `pers.temporario`, que essa linha
     não copia — num duelo, o temporário seria gasto e esquecido a cada
     golpe (o bug exato que o comentário de `arena.js:246` já descreve
     para o abrigo). Hoje não morde ninguém, porque nada põe temporário
     num duelista; no dia em que puser, é essa linha que mente. O
     `App.jsx` (`passarPeloAbrigo`, :6624) já devolve `ab.pers` inteiro e
     não tem o problema.
   · E a linha da arena tem o par disso: com `ab.absorvido > 0` vindo só
     do poço, `ab.linha` é `""` e ela empurraria `"Nome — "` para o log.
     `linhaDoTemporario` existe para V2 ter o que pôr ali.
   ============================================================ */

/* ---------------- A TABELA ----------------

   `escolhaPadrao` é coluna e não literal porque é uma DECISÃO de regra
   ("o sistema escolhe automaticamente o maior"), e decisão de regra
   nesta casa mora onde a suíte a possa ler de volta. Hoje só tem um
   valor de pé; `"menor"` e `"pergunta"` são o que caberia aqui se a
   mesa mudar de ideia, e é bom que mudar de ideia seja editar uma
   linha em vez de caçar um `Math.max` no meio de uma função. */
export const PV_TEMPORARIO = {
  minimo: 2,        /* abaixo disto a oferta não compra nada — o piso de `ABSORCAO_DO_BUFF` */
  teto: 9,          /* medido: abaixo de uma rodada de dano num corpo (9,69 no `justo`) */
  turnosPadrao: 7,  /* medido: acima do combate mais longo (6,30 ± 0,25 rodadas) */
  turnosMax: 10,    /* espelho de `LIMITES_DO_EFEITO.turnosMax` (efeitos.js:61) */
  escolhaPadrao: "maior",
};

/* O NOME QUE APARECE QUANDO A FONTE NÃO SE NOMEIA. Voz de mundo, nunca
   o nome do mecanismo: o jogador vê algo a cobrir-lhe a pele, e nunca a
   palavra "temporário". É a lei "o sistema não fala de si mesmo". */
const SEM_NOME = "O que cobria a pele";

/* ---------------- LER A FICHA ----------------

   Um número, e nada mais. `0` é a resposta para `null`, `{}`, um campo
   torto e um `pv` que veio como texto — e a exigência de ser um NÚMERO
   de verdade é a mesma severidade de `ehImportante` (queda.js): o campo
   nasce aqui, escrito por `ganharTemporario` como inteiro; o que chega
   noutra forma veio de um save torto ou de uma ficha injetada à mão, e
   de fora da tabela ninguém declara regra.

   E ELA NÃO APARA NO TETO, de propósito: o aparo tem UM dono, e ele é a
   ENTRADA (`ofertaEmNumero`). Dois sítios a aparar o mesmo número é a
   forma exata de eles divergirem daqui a três versões — e o dia em que
   divergissem, a leitura mentiria sobre o que está escrito na ficha, que
   é a única coisa que esta função promete. O que o SISTEMA escreve nunca
   passa do teto; um `pv: 999` injetado à mão é lido como está. */
export function temporarioDe(pers) {
  const p = pers && typeof pers === "object" ? pers : null;
  const campo = p && p.temporario && typeof p.temporario === "object" ? p.temporario : null;
  if (!campo || typeof campo.pv !== "number" || !Number.isFinite(campo.pv)) return 0;
  return Math.max(0, Math.round(campo.pv));
}

/* Quantos turnos restam, pela mesma régua severa de cima. `0` quer dizer
   "prazo que ninguém escreveu", e quem chega assim expira no primeiro
   tique — ver `tickTemporario`. Privada: quem pergunta de fora pergunta
   por `vereditoDoTemporario`, que é a porta. */
function prazoDe(pers) {
  const p = pers && typeof pers === "object" ? pers : null;
  const campo = p && p.temporario && typeof p.temporario === "object" ? p.temporario : null;
  if (!campo || typeof campo.turnos !== "number" || !Number.isFinite(campo.turnos)) return 0;
  return Math.max(0, Math.round(campo.turnos));
}

/* O nome da fonte, já limpo. `""` quando não há — e `""` é tratado por
   quem escreve a frase, não aqui, porque a frase é que sabe se quer
   maiúscula. */
function fonteDe(oferta) {
  const f = oferta && typeof oferta === "object" ? oferta.fonte : null;
  return typeof f === "string" && f.trim() ? f.trim() : "";
}

/* A OFERTA, NORMALIZADA. Aceita o número cru e o objeto `{ pv, turnos,
   fonte }`, porque as duas formas vão chegar: a poção traz um número, a
   habilidade traz o envelope inteiro. Devolve `0` para tudo o que não
   compra nada — `null`, `{}`, `NaN`, `"12"`, negativo, e o que estiver
   abaixo do `minimo`. O corte no `teto` é feito aqui e não no chamador,
   pelo motivo de sempre: dois sítios a aparar o mesmo número é a forma
   exata de eles divergirem daqui a três versões. */
function ofertaEmNumero(oferta) {
  const cru = oferta && typeof oferta === "object" ? oferta.pv : oferta;
  if (typeof cru !== "number" || !Number.isFinite(cru)) return 0;
  const n = Math.round(cru);
  if (n < PV_TEMPORARIO.minimo) return 0;
  return Math.min(PV_TEMPORARIO.teto, n);
}

/* ---------------- O ÚNICO DONO DE "FICA O MAIOR" ----------------

   "Tenho 4 e me oferecem 10 — com o que fico?" A resposta é uma só no
   projeto, e é esta. Se aparecer um segundo `Math.max` a decidir isto
   noutro sítio, a doença desta casa voltou: duas regras com o mesmo
   nome em dois lugares, a divergir em silêncio.

   Devolve SEMPRE o mesmo formato, mesmo para lixo — `{ atual, oferta,
   ficaCom, haEscolha, motivo }` —, e é o molde de `quedaAoChegarAZero`
   pelo mesmo argumento escrito lá: devolver `null` no caso torto
   obrigaria cada chamador a ter o seu plano B, e plano B espalhado é
   como a regra vira três regras.

   `oferta` sai JÁ APARADA e validada: é o número que de facto compete,
   para que `ficaCom === Math.max(atual, oferta)` seja verdade sempre e
   ninguém tenha de refazer a conta para saber o que aconteceu.

   `haEscolha` é o que V2 põe na tela. Ele é `true` só quando há mesmo
   uma decisão: um poço de pé, uma oferta válida, e os dois números
   DIFERENTES. Oferta igual ao que já está não é escolha nenhuma — é a
   mesma coisa duas vezes, e pôr isso na frente do jogador seria o
   sistema a pedir-lhe que escolhesse entre A e A.

   `motivo` é DIAGNÓSTICO, nunca frase de tela: é o que o log escreve
   para quem for depurar, e o jogador nunca o lê. */
export function vereditoDoTemporario(pers, oferta) {
  const atual = temporarioDe(pers);
  const n = ofertaEmNumero(oferta);
  const cru = oferta && typeof oferta === "object" ? oferta.pv : oferta;
  const eraNumero = typeof cru === "number" && Number.isFinite(cru);

  let motivo;
  if (!eraNumero) motivo = "oferta que não é número — nada muda";
  else if (Math.round(cru) < PV_TEMPORARIO.minimo) motivo = `oferta abaixo do mínimo (${PV_TEMPORARIO.minimo}) — nada muda`;
  else if (Math.round(cru) > PV_TEMPORARIO.teto) motivo = `oferta aparada ao teto (${PV_TEMPORARIO.teto})`;
  else motivo = "oferta válida";

  const ficaCom = Math.max(atual, n);
  if (n > 0) {
    if (atual === 0) motivo += " — não havia nada de pé";
    else if (n > atual) motivo += ` — a oferta é maior (${n} contra ${atual})`;
    else if (n < atual) motivo += ` — o que já está é maior (${atual} contra ${n})`;
    else motivo += " — empate: o mesmo número, nada muda";
  }

  return {
    atual,
    oferta: n,
    ficaCom,
    /* o padrão, sem ninguém escolher, é `escolhaPadrao` — e ele é o maior */
    haEscolha: atual > 0 && n > 0 && atual !== n,
    motivo,
  };
}

/* ---------------- RECEBER ----------------

   A porta por onde um poço nasce ou é substituído. Chama
   `vereditoDoTemporario` por dentro em vez de repetir a comparação:
   um dono só para a regra, e este é o chamador dele.

   NÃO CURA, e esta é a linha que a suíte mais vai bater: `vida` e
   `vidaMax` saem daqui intocados em TODOS os caminhos, porque o único
   sítio em que este módulo escreve na ficha é a chave `temporario`. Um
   herói com 3 de 40 PV e um poço de 9 continua a três pontos da queda —
   ele só tem nove pontos de alguém a apanhar por ele primeiro.

   O EMPATE DEVOLVE O MESMO OBJETO. `r.pers === pers`, de propósito e
   não por acaso: nada mudou, e devolver uma cópia nova faria toda a
   fiação de cima (os `useMemo`, os `===` do React, o autosave) piscar
   por uma mudança que não existe. É a mesma razão pela qual a recusa
   por oferta menor também devolve o que entrou, byte a byte. */
export function ganharTemporario(pers, oferta) {
  const p = pers && typeof pers === "object" ? pers : null;
  const v = vereditoDoTemporario(p, oferta);

  /* FICHA QUE NÃO É FICHA SAI COMO `null`, e não como o lixo que entrou.
     Devolver `undefined` aqui seria a única chave do formato que o chamador
     teria de testar com `typeof`, e um `pers` ausente no meio de uma fila de
     `r = ganhar(...); r = gastar(r.pers, ...)` é o erro silencioso clássico.
     `null` diz "não há ficha" numa palavra que toda esta casa já entende. */
  if (!p) {
    return { pers: null, antes: 0, depois: 0, aceito: false, motivo: "ficha inválida — nada a escrever", linha: "" };
  }
  /* recusa limpa: lixo, oferta pequena de mais, oferta menor, e o empate.
     Nos quatro casos a ficha que sai é a MESMA que entrou. */
  if (v.oferta <= 0 || v.oferta <= v.atual) {
    return { pers: p, antes: v.atual, depois: v.atual, aceito: false, motivo: v.motivo, linha: "" };
  }

  const cru = oferta && typeof oferta === "object" ? oferta.turnos : null;
  const turnos = typeof cru === "number" && Number.isFinite(cru) && Math.round(cru) >= 1
    ? Math.min(PV_TEMPORARIO.turnosMax, Math.round(cru))
    : PV_TEMPORARIO.turnosPadrao;
  const fonte = fonteDe(oferta);
  const quem = fonte || "Algo";

  return {
    /* estado NOVO — imutabilidade; e só a chave `temporario` é tocada */
    pers: { ...p, temporario: { pv: v.ficaCom, turnos, fonte } },
    antes: v.atual,
    depois: v.ficaCom,
    aceito: true,
    motivo: v.motivo,
    /* a voz é de mundo e não nomeia mecanismo nenhum; o número entra
       porque o jogador pagou por ele e precisa de ver o que comprou */
    linha: v.atual > 0
      ? `🛡 ${quem} toma o lugar do que já cobria a pele: ${v.ficaCom} do que vier param antes de doer.`
      : `🛡 ${quem} assenta-se sobre a pele: ${v.ficaCom} do que vier param antes de doer.`,
  };
}

/* ---------------- GASTAR ----------------

   O molde é o de `absorverDano` (efeitos.js), `amortecerDano`
   (tracos.js) e `repartirDano` (invocacoes.js) — `(pers, dano)` entra,
   `{ pers, dano, absorvido, linha }` sai —, e é de propósito: quem rola
   o golpe não muta ninguém, devolve `{ dano }` e quem aplica é o sítio.
   Uma quarta irmã custa zero de conceito novo e entra na fila que o App
   já tem montada.

   E AQUI É QUE ELE SE SEPARA DO ABRIGO: gasta-se PARCIALMENTE. Uma
   batida de 3 num poço de 9 deixa 6 de pé. Quando o poço zera, o campo
   SAI DA FICHA em vez de ficar `{ pv: 0 }` pendurado — um campo vazio a
   pender é um poço morto que ainda parece vivo em todo sítio que
   pergunte `pers.temporario` em vez de perguntar o número, e é assim que
   nasce o bug que só aparece três versões depois. */
export function gastarTemporario(pers, dano) {
  /* a MESMA linha das três irmãs, palavra por palavra — e é de propósito: o
     poço não é uma segunda régua do dano. Ele não apara o golpe, não o
     arredonda a seu gosto e não decide quanto ele vale; só para o que tem.
     Por isso um golpe torto e infinito PASSA: o que ele leva daqui é o poço
     inteiro (`Math.min` trata disso), e o resto segue para quem o aplicar. */
  const d = Math.max(0, Math.round(Number(dano) || 0));
  if (!d || !pers) return { pers, dano: d, absorvido: 0, linha: "" };
  const poco = temporarioDe(pers);
  if (!poco) return { pers, dano: d, absorvido: 0, linha: "" };

  const absorvido = Math.min(poco, d);
  const resto = d - absorvido;
  const sobra = poco - absorvido;
  const quem = fonteDe(pers.temporario) || SEM_NOME;

  const novo = { ...pers };
  if (sobra > 0) novo.temporario = { ...pers.temporario, pv: sobra };
  else delete novo.temporario;

  return {
    pers: novo,
    dano: resto,
    absorvido,
    linha: sobra > 0
      ? `🛡 ${quem} recebe a batida no lugar do corpo: ${absorvido} param ali.`
      : resto > 0
        ? `🛡 ${quem} recebe a última batida e se desfaz: ${absorvido} param ali, ${resto} chegam.`
        : `🛡 ${quem} recebe a última batida e se desfaz: nada chega.`,
  };
}

/* ---------------- O PRAZO ----------------

   O molde é o de `tickEfeitos` (regras-jogo.js:369): −1 por resposta,
   quem chega a zero sai e deixa uma mensagem. Devolve a FICHA e não o
   campo, porque o campo é um só e quem chama quer a ficha de volta.

   NINGUÉM O CHAMA AINDA — é V2 quem o liga ao relógio da rodada, ao
   lado de `tickEfeitos` e no mesmo sítio. Está escrito também no topo,
   como dívida declarada.

   PRAZO QUE NINGUÉM ESCREVEU EXPIRA JÁ. Uma ficha com `{ pv: 9 }` e sem
   `turnos` não veio de `ganharTemporario` (que escreve sempre os dois):
   veio de um save torto ou de uma injeção à mão. O padrão seguro é o de
   `queda.js` — entre "some cedo de mais" e "nunca some", escolhe-se o
   primeiro, porque o poço que não expira é o bug que trava a mesa, e o
   que expira cedo é só um poço a explicar. */
export function tickTemporario(pers) {
  const p = pers && typeof pers === "object" ? pers : null;
  /* ficha que não é ficha sai como `null`, pelo motivo escrito em
     `ganharTemporario`; ficha de verdade sem poço sai como ENTROU, pelo
     motivo escrito no empate — nada mudou, e uma cópia nova faria a fiação
     de cima piscar por uma mudança que não existe */
  if (!p) return { pers: null, msgs: [] };
  if (!temporarioDe(p)) return { pers: p, msgs: [] };

  const quem = fonteDe(p.temporario) || SEM_NOME;
  const t = prazoDe(p) - 1;
  const novo = { ...p };
  if (t <= 0) {
    delete novo.temporario;
    return { pers: novo, msgs: [`✧ ${quem} se desfaz.`] };
  }
  novo.temporario = { ...p.temporario, turnos: t };
  return { pers: novo, msgs: [] };
}
