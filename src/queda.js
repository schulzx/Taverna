/* ============================================================
   A QUEDA (Fase Q · Q1) — quem cai, e quem só morre

   O PRINCÍPIO, e ele é o módulo inteiro:

     CHEGAR A 0 PV NÃO É UM DESFECHO. É UMA PERGUNTA, e ela tem
     exatamente TRÊS donos — o herói, o companheiro e o inimigo —,
     cada um com a sua resposta escrita numa tabela.

   Hoje o jogo tem um dono só. `testeDeMorte`/`aplicarTesteMorte`
   (`combate.js:337-355`) implementam a queda inteira do 5e — três
   sucessos estabiliza, três falhas mata, 20 natural reergue — e valem
   **só para o herói**. O companheiro a 0 PV some da lista de quem age
   (`turnoDosCompanheiros`, `combate.js:372`, filtra `vida > 0 &&
   !morrendo`) e o inimigo a 0 PV simplesmente deixa de existir. Ou
   seja: a regra mais dramática do sistema está escrita, provada, e
   acontece com uma pessoa em cinco.

   A decisão da pessoa (14/09) é a que esta fase executa: *"o sistema de
   quedas deve valer também para todos os personagens do grupo e
   inclusive inimigos — inimigos importantes podem fazer testes de
   resistência contra morte enquanto os normais morrem direto."*

   ---------------- O QUE ESTE MÓDULO NÃO FAZ ----------------

   Q1 NÃO LIGA NADA, e é de propósito — o mesmo molde de `degraus.js`
   em N2. `testeDeMorte` e `aplicarTesteMorte` ficam **exatamente** como
   estão: Q1 não os reescreve, dá-lhes os outros dois donos por tabela.
   Ninguém chama `quedaAoChegarAZero` ainda; quem passa a decidir por
   ela é Q2 (o companheiro) e Q3 (a escolha letal/não letal).

   E ele NÃO ROLA DADO. A decisão ("cai ou morre?") e a sorte ("resiste
   ou enfraquece?") são duas perguntas e ficam em dois sítios: a sorte
   continua inteira em `testeDeMorte`. É isso que torna Q1 provável sem
   semente — o módulo é uma função de tabela, e a mesma ficha dá sempre
   o mesmo veredito, em qualquer máquina.

   ---------------- O LIMITE CONHECIDO, MEDIDO ----------------

   Um limite escrito é dívida; um limite calado é mentira. Este está
   medido, e é dívida declarada de Q2:

     O GOLPE NO CORPO CAÍDO AINDA SE PERDE, E ELE NÃO É POUCO:
     **20,02% (`justo`) e 22,68% (`duro`)** do dano que os inimigos
     rolam cai em quem já está no chão — 61,20 ± 1,65 e 67,18 ± 1,83 PV
     por combate, em mil sementes. O simulador de balanceamento (que mora
     em `testes/` e que este módulo não nomeia de propósito — instrumento
     de medida não entra em `src/`, nem pelo nome) já conta esses golpes
     e chama-lhes "o desperdício em corpo caído".

     E O NÚMERO DE Q1 NÃO É O DE N1 — a etapa que o mediu escreveu
     13,40%/18,03%, e esta escreve 20,02%/22,68%. Não se afrouxou nada:
     N1 mediu antes do conserto da ordem da rodada e com parte da conta
     vinda de uma reconstrução de scratchpad que o diário já marcava como
     reconstrução. O número desta etapa sai do instrumento declarado, com
     o Adversário ligado (desligado, os mesmos contadores dão 3,78% e
     6,59% — o que prova que quem concentra fogo é quem gera a sobra).
     E ele é LIMITE OTIMISTA: aquele simulador corre sem tabuleiro, logo
     todo golpe alcança toda gente.

   E a causa está localizada, para Q2 não ter de a procurar: a lista de
   alvos é uma FOTO tirada uma vez por turno (`combate.js:245-249`). O
   filtro de cada golpe (`combate.js:267`) re-lê o objeto FOTOGRAFADO —
   e como esta casa substitui estado em vez de o mutar, o objeto da foto
   nunca fica sabendo que o dono caiu.

   E O HERÓI NÃO ESCAPA — esta linha dizia que sim, por acidente de
   referência, e a medição desmentiu-a antes de a tinta secar: são 2,03
   (`justo`) e 1,86 (`duro`) golpes por combate em herói JÁ no chão. O
   filtro tira quem estava caído no INÍCIO do passo; quem cai DURANTE o
   passo apanha, e o herói cai durante o passo como toda gente. Fica
   escrito porque muda o alcance de Q2: o conserto da foto é dos três
   lados, não só do companheiro.

   Com Q1 isso deixa de ser acidente e passa a ter uma regra escrita —
   `GOLPE_NO_CAIDO` —, mas a regra só MORDE quando Q2 consertar a foto.
   Até lá a tabela existe e ninguém a lê na mesa: é tabela pronta, não
   comportamento mudado.

   ---------------- A SETA APONTA NUM SENTIDO SÓ ----------------

   `bestiario.js` importa daqui (`ehImportante`); este módulo **não**
   importa `bestiario.js`, pelo mesmo motivo escrito no cabeçalho de
   `degraus.js`: um círculo entre os dois deixaria a ordem de avaliação
   decidir se `CRIATURAS_FANTASIA` nasce antes ou depois de
   `DONOS_DA_QUEDA`, e isso é uma bomba silenciosa. Este módulo não
   importa nada de `src/` — ele é tabela pura.

   ---------------- NOTAS PARA Q2 (a fiação, que não é minha) ----------------

   O bastão do `App.jsx` está com a outra mente; fica aqui escrito o que
   a fiação vai precisar, para não se descobrir de novo:

   · O ÚNICO SÍTIO a perguntar "cai ou morre?" é `quedaAoChegarAZero`.
     Se aparecer um segundo `vida <= 0 ? ... : ...` no App, a doença
     desta casa voltou (duas classificações em dois lugares).
   · O LADO chega por `alvo.lado` ou pelo `alvo.ref` que a mesa já usa
     ("jogador" · "grupo" · "inimigo", `combate.js:246-260`) — os dois
     caminhos entram por `APELIDOS_DO_LADO`, e nenhum código novo
     precisa traduzir nada à mão.
   · `aplicarTesteMorte` ainda traz o 3 cravado (`combate.js:352-353`).
     Ele está espelhado aqui em `GOLPE_NO_CAIDO.falhasAteMorrer` para
     que o golpe no caído possa ser lido pela mesma régua; quem troca o
     literal pela leitura é Q2, e a suíte cobra que os dois concordem.
   · O corpo do inimigo comum não guarda estado nenhum: ele não testa,
     logo bater nele é zero (`GOLPE_NO_CAIDO.emQuemNaoTesta`). Não
     invente um contador de falhas para quem já morreu.
   ============================================================ */

/* ---------------- OS TRÊS DONOS DA QUEDA ----------------

   Uma entrada por lado do combate. A coluna que decide é `testa`, e
   ela tem três valores fechados:

     `sempre`        — chega a 0 PV, cai e rola teste de morte.
     `se_importante` — só quem foi DECLARADO importante no bestiário.
     `nunca`         — morre direto (nenhum lado usa hoje; a coluna
                       existe para que "morrer direto" seja uma
                       declaração possível e não um esquecimento).

   Por que o companheiro testa SEMPRE, e não "se for nomeado": ele já é
   gente com ficha, nome e classe — a pessoa escolheu-o. Um companheiro
   que morre sem cena é a mesma perda que um herói que morre sem cena.

   Por que o inimigo comum NÃO testa: porque a alternativa é pior do que
   parece. Um bando de seis goblins com três rolagens de morte cada é
   dezoito rolagens por luta a decidir nada — e, o que é pior, é a cena
   final de um chefe acontecendo seis vezes por escaramuça. O que dá
   peso ao teste de morte é ele ser raro.

   `porque` é DIAGNÓSTICO — motivo de log, nunca frase de tela. O
   sistema não fala de si mesmo: o jogador sente a diferença porque o
   Lich cai de joelhos e o goblin não, nunca porque leu o nome da
   coluna. */
export const DONOS_DA_QUEDA = {
  heroi: {
    id: "heroi",
    testa: "sempre",
    porque: "o herói é a campanha inteira; a morte dele é uma cena, nunca um número",
  },
  companheiro: {
    id: "companheiro",
    testa: "sempre",
    porque: "tem ficha, nome e classe — cair sem chance é perder gente em silêncio",
  },
  inimigo: {
    id: "inimigo",
    testa: "se_importante",
    porque: "o que é raro é que pesa: só quem foi declarado no bestiário ganha a cena",
  },
};

/* O LADO QUANDO NINGUÉM DECLAROU. Não é um lado da tabela de propósito:
   quem chega aqui sem lado não é herói, nem companheiro, nem inimigo —
   é entrada torta, e entrada torta não ganha imortalidade por acidente.
   Ela cai no padrão seguro, logo abaixo. */
export const LADO_DESCONHECIDO = "desconhecido";

/* O PADRÃO SEGURO É MORRER DIRETO. Escolhido assim porque os dois erros
   não custam o mesmo: um lado novo que morresse direto por engano é uma
   morte a explicar; um lado novo que testasse por engano é um combate
   que não termina — e o inimigo que não morre é o bug que trava a mesa,
   não o que a irrita. */
export const DESFECHO_PADRAO = "morre";

/* OS APELIDOS QUE A MESA JÁ USA. `turnoDosInimigos` monta os alvos com
   `ref: "jogador" | "grupo" | "inimigo"` (`combate.js:246-260`), e o
   App fala a mesma língua. Traduzir isso à mão em cada chamada seria
   plantar a terceira classificação; a tradução mora aqui, uma vez. */
export const APELIDOS_DO_LADO = {
  heroi: "heroi",
  jogador: "heroi",
  pers: "heroi",
  companheiro: "companheiro",
  grupo: "companheiro",
  aliado: "companheiro",
  inimigo: "inimigo",
  adversario: "inimigo",
};

/* AS PERGUNTAS DA COLUNA `testa`, uma por valor fechado. Não são
   exportadas: quem pergunta de fora tem exatamente uma porta, que é
   `quedaAoChegarAZero`. */
const PERGUNTAS = {
  sempre: () => true,
  nunca: () => false,
  se_importante: (alvo) => ehImportante(alvo),
};

/* ---------------- O CAMPO DECLARADO ----------------

   `ehImportante` lê UM campo e mais nada. Nunca adivinha por nome, nem
   por regex, nem deriva de `ameaca` — e as três proibições têm a mesma
   razão: qualquer uma delas faria o nome que o Narrador inventa na hora
   ganhar mecânica. Foi exatamente assim que `calar_a_magia` deu a mente
   mais afiada da mesa a toda criatura inventada (veja `degraus.js`), e
   aqui o preço seria maior: um inimigo que não morre.

   `ameaca` seria a derivação tentadora e é a pior de todas — ela é
   perigo, não papel. O Golem de Pedra é `elite` e é um obstáculo; a
   Sentinela Blindada é `elite` e é uma parede. Nenhum dos dois merece
   a cena que o Lich merece, e os três seriam iguais por `ameaca`.

   A ÚNICA VERDADE ACEITE É O BOOLEANO `true`. `"true"`, `"sim"`, `1` e
   `[]` são falsos, e isso não é rigor decorativo: o campo nasce no
   bestiário, onde é escrito à mão como booleano; tudo o que chega
   noutra forma veio de fora da tabela — de um save torto ou de um
   envelope da IA — e do lado de fora da tabela ninguém declara regra.
   O padrão seguro (não é importante) é o mesmo da linha acima. */
export function ehImportante(criatura) {
  const c = criatura && typeof criatura === "object" ? criatura : null;
  return !!c && c.importante === true;
}

/* ---------------- A ÚNICA PORTA ----------------

   "Este combatente, a 0 PV, cai ou morre?" — e não há segunda resposta
   no projeto.

   Devolve sempre o mesmo formato, mesmo para lixo: `{ desfecho, testa,
   lado, motivo }`. Devolver `null` no caso torto obrigaria todo chamador
   a ter o seu próprio plano B, e plano B espalhado é como a regra vira
   três regras. `= {}` no destructuring NÃO cobre `null` — lei da casa —,
   por isso o teste do objeto é explícito e o `null` entra pela mesma
   porta que `{}`. */
export function quedaAoChegarAZero(alvo) {
  const a = alvo && typeof alvo === "object" ? alvo : null;
  const cru = a ? String(a.lado ?? a.ref ?? "").trim().toLowerCase() : "";
  const lado = APELIDOS_DO_LADO[cru] || LADO_DESCONHECIDO;
  const dono = DONOS_DA_QUEDA[lado] || null;
  if (!dono) {
    return { desfecho: DESFECHO_PADRAO, testa: false, lado: LADO_DESCONHECIDO, motivo: "lado não declarado — padrão seguro" };
  }
  const pergunta = PERGUNTAS[dono.testa] || PERGUNTAS.nunca;
  const testa = !!pergunta(a);
  if (!testa) {
    return {
      desfecho: DESFECHO_PADRAO, testa: false, lado,
      motivo: dono.testa === "se_importante" ? "não foi declarado importante" : dono.porque,
    };
  }
  return { desfecho: "cai", testa: true, lado, motivo: dono.porque };
}

/* ---------------- O GOLPE EM QUEM JÁ ESTÁ NO CHÃO ----------------

   O molde é o do 5e, e ele é o certo pela razão de desenho: bater em
   quem caiu não é dano, é PRESSA. Não tira PV (não há PV), tira as
   chances de o corpo se levantar — e um crítico, que é a mesma pressa
   com o dobro de força, tira duas.

   Isto fecha o buraco medido: hoje o golpe no caído evapora
   (20,02%-22,68% do dano inimigo), e evaporar é a pior das saídas,
   porque premia o azar de quem já perdeu alguém. Com a regra, o mesmo
   golpe passa a custar — e o grupo ganha uma decisão nova e dura:
   levantar quem caiu vale um turno de alguém.

   `emQuemNaoTesta` É A OUTRA METADE, e está escrita na tabela de
   propósito em vez de ficar no ar: quem não testa já morreu. O inimigo
   comum a 0 PV é um corpo, e um corpo não tem contador de falhas para
   gastar. Bater nele custa o turno de quem bate e não faz nada — que é
   a regra, não um esquecimento.

   `falhasAteMorrer` ESPELHA `aplicarTesteMorte` (`combate.js:352-353`),
   onde o 3 ainda é literal. Não é uma segunda fonte da regra: é a
   mesma, escrita onde se pode ler — sem ela, "um golpe custa 1 falha"
   é um número sem escala. Q2 troca o literal pela leitura; até lá a
   suíte cobra que os dois concordem. */
export const GOLPE_NO_CAIDO = {
  falhas: 1,          /* um golpe em quem caiu = uma falha de teste de morte */
  falhasNoCritico: 2, /* o crítico é a mesma pressa com o dobro de força */
  emQuemNaoTesta: 0,  /* o corpo do inimigo comum: bater não faz nada */
  falhasAteMorrer: 3, /* espelho de `aplicarTesteMorte` — dois críticos e meio */
};

/* Quanto custa ESTE golpe em quem já está no chão.

   `testa` existe no argumento porque a pergunta "quem apanha ainda tem
   contador?" já foi respondida por `quedaAoChegarAZero` — quem chama
   passa o que recebeu de lá, em vez de a perguntar outra vez e correr o
   risco de responder diferente. O padrão é `true`: quem chega aqui sem
   dizer está a bater em alguém que caiu de verdade. */
/* v9.268 (Q1, conserto da suíte): o `= {}` estava aqui e NÃO cobre `null` —
   é lei escrita da casa, e este módulo a cita duas vezes acima antes de a
   quebrar na última função. `falhasDoGolpeNoCaido(null)` lançava
   `Cannot read properties of null`, e quem chama isto chama do meio de uma
   rodada: um órgão que estoura no turno é exatamente o que a casa proíbe.
   O recuo é o mesmo das duas irmãs deste arquivo (`ehImportante` e
   `quedaAoChegarAZero`): testar o objeto explicitamente, e só então
   desestruturar. O padrão seguro não muda — sem dizer nada, quem chega aqui
   está a bater em alguém que caiu de verdade. */
export function falhasDoGolpeNoCaido(golpe) {
  const { critico = false, testa = true } = golpe && typeof golpe === "object" ? golpe : {};
  if (!testa) return GOLPE_NO_CAIDO.emQuemNaoTesta;
  return critico === true ? GOLPE_NO_CAIDO.falhasNoCritico : GOLPE_NO_CAIDO.falhas;
}
