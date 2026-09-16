/* ============================================================
   O SELO DE ESTADO — a gramática do número que pode ser negativo (E4)

   POR QUE ESTE ARQUIVO EXISTE, e o número é do `jogo`: `mecanicaDe`
   (`condicoes.js`) devolve SETE campos que mexem num número, e a fila de
   pílulas do HUD desenhava QUATRO — e os quatro estavam fora da luta,
   porque a tela da batalha esconde o HUD inteiro.

   As duas condições que isso silenciava:

     · `Enfraquecido` (💧, `danoReduzido: 2`) — a pílula 🎲 aparecia
       porque ele também dá desvantagem; **o −2 no dano que ele causa não
       aparecia em lado nenhum.** E H4 (v9.276) acabara de pagar para que
       esse número contasse certo: `combate.js` lia `danoReduzido` do lado
       errado e *amaldiçoar deixava o inimigo mais duro*.
     · `Marcado` (🔻, `danoRecebidoExtra: 2`, e mais nada) — nenhuma
       pílula existia para ele. O único canal era o `title=` da condição,
       que é BALÃO DE RATO: **no telefone, um jogador com `Marcado`
       carrega uma condição cujo conteúdo mecânico inteiro é ilegível.**

   *Um número que o motor calcula e a tela esconde é a lei desta casa a
   valer só de um lado.*

   ---- A LEI, e ela é a razão de isto ser tabela e não `if` ----

   > **O SINAL diz a aritmética. O TOM diz a favor de quem a conta pende.
   > Os dois PODEM discordar — e escolher o tom pelo sinal é o defeito.**

   | tom | escreve | lê-se |
   |---|---|---|
   | bom | `+2 DANO` | um mais a seu favor |
   | bom | `−2 DANO SOFRIDO` | um **menos** a seu favor |
   | **perigo** | **`−2 DANO`** | enfraquecido — um menos contra si |
   | **perigo** | **`+2 DANO SOFRIDO`** | marcado — um mais contra si |

   As duas de baixo são as que a casa não sabia dizer. A casa só tinha
   gramática para bónus: *o `+` era verde e o `−` era vermelho*, e isso
   funcionou enquanto os dois únicos números visíveis calhavam de ter o
   sinal do lado do tom.

   E A PALAVRA FAZ O TRABALHO QUE A COR NÃO PODE FAZER SOZINHA (WCAG
   1.4.1, *Use of Color*): é `DANO` contra `DANO SOFRIDO` que separa os
   dois vermelhos para quem não distingue os dois verdes.

   ---- ONDE ELE NÃO MORA, e as duas razões são medidas ----

   NÃO na linha do veredito: ela responde *«o que acontece se eu agir
   AGORA»* e tem tecto de 54 caracteres que quatro frases fabricadas já
   apertam. Um modificador PERMANENTE não é um acontecimento.

   NÃO no selo da identidade: E3 mediu que ele não muda uma vez em quatro
   rodadas. *Número que muda não mora em região que não muda.*

   Mora na TIRA DO HERÓI, que é a única região da tela da luta que já
   responde «como é que eu estou» — e é a região que a decisão do
   telefone (`TELA_DE_BATALHA.tiraDoHeroi`) acabou de comprar de volta.
   ============================================================ */

/* O MENOS É `U+2212`, NUNCA O HÍFEN ASCII (45). Medido em JetBrains
   Mono: `+2` e `−2` medem ambos 11 px a 9 px de corpo, logo uma coluna
   de selos não treme. O que difere é o GLIFO — o hífen é curto e alto, o
   menos tem a largura e a altura da barra do `+`: `-3` ao lado de `+3`
   tem o traço a outra altura; `−3` ao lado de `+3` não tem. */
export const MENOS = "−";

/* o sinal escrito à mão uma vez só, para que nenhum chamador o componha
   com o hífen do teclado por distração */
export function comSinal(n) {
  const v = Math.round(Number(n) || 0);
  return v < 0 ? `${MENOS}${Math.abs(v)}` : `+${v}`;
}

/* ============================================================
   OS SETE CAMPOS DE `mecanicaDe`, E A CATRACA É A IGUALDADE

   *O conjunto de campos desenhados = o conjunto que `mecanicaDe`
   devolve, menos `motivos`.* Hoje eram 4 de 7. A tabela existe para que
   a suíte possa ler os dois lados e comparar: um campo novo no motor que
   não ganhe linha aqui fica vermelho no dia em que nascer, e não no dia
   em que um jogador perguntar por que a conta não fecha.

   `motivos` sai porque não é número: é a lista de frases que explica os
   outros, e ela já tem casa — o nome acessível do selo de rolagem.

   CADA LINHA DIZ TRÊS COISAS e nenhuma delas é cor:
   · `escreve(n)` — o texto, já com o sinal certo;
   · `tom` — a favor de quem a conta pende, INDEPENDENTE do sinal;
   · `so` — quando o selo existe; um campo a zero não escreve nada,
     porque um modificador permanentemente riscado ensina a regra errada
     (é a mesma razão da pílula da ação bónus que não aparece a quem não
     a tem).
   ============================================================ */
export const CAMPOS_DA_MECANICA = [
  {
    campo: "vantagem", tom: "bom", liquido: true,
    escreve: () => "🎲 vantagem",
    porque: "o dado sobe — e é líquido: vantagem e desvantagem juntas cancelam-se (5e)",
  },
  {
    campo: "desvantagem", tom: "perigo", liquido: true,
    escreve: () => "🎲 desvantagem",
    porque: "o dado desce — o outro lado do mesmo líquido",
  },
  {
    campo: "perdeAcao", tom: "perigo", booleano: true,
    escreve: () => "⛔ sem ação",
    porque: "não há número: ou age ou não age",
  },
  {
    campo: "danoTurno", tom: "perigo",
    escreve: (n) => `${MENOS}${Math.abs(n)} PV/turno`,
    porque: "o corpo paga sozinho, todo turno, enquanto durar",
  },
  {
    campo: "danoExtra", tom: "bom",
    escreve: (n) => `${comSinal(n)} DANO`,
    porque: "bate mais — o único dos quatro números que a casa já sabia dizer",
  },
  {
    campo: "danoReduzido", tom: "perigo",
    escreve: (n) => `${MENOS}${Math.abs(n)} DANO`,
    porque: "ENFRAQUECIDO: bate menos. Sinal negativo E tom de perigo — os dois concordam, e é por acaso",
  },
  {
    campo: "danoRecebidoExtra", tom: "perigo",
    escreve: (n) => `+${Math.abs(n)} DANO SOFRIDO`,
    porque: "MARCADO: apanha mais. Sinal POSITIVO e tom de PERIGO — a que prova que o tom não se escolhe pelo sinal",
  },
  {
    campo: "defesa", tom: null,
    escreve: (n) => `${comSinal(n)} DEFESA`,
    porque: "o tom sai do sinal aqui, e só aqui, porque defesa a mais é sempre a seu favor e defesa a menos é sempre contra",
  },
];

/* Os selos que uma mecânica escreve, na ordem da tabela. Devolve texto e
   tom — nunca cor: a cor é da tela, e um módulo que escolhesse a tinta
   seria a segunda paleta. */
export function selosDaMecanica(mec) {
  const m = mec == null ? {} : mec;
  const saida = [];
  /* o líquido primeiro, e é a regra de `estadoDeRolagem`: vantagem e
     desvantagem juntas cancelam-se, e o jogador vê o resultado, não a
     contabilidade das duas */
  const van = !!m.vantagem, des = !!m.desvantagem;
  for (const c of CAMPOS_DA_MECANICA) {
    if (c.liquido) {
      if (van && des) continue;             /* cancelaram-se: nenhum dos dois escreve */
      if (c.campo === "vantagem" && !van) continue;
      if (c.campo === "desvantagem" && !des) continue;
      saida.push({ id: c.campo, texto: c.escreve(), tom: c.tom });
      continue;
    }
    if (c.booleano) {
      if (!m[c.campo]) continue;
      saida.push({ id: c.campo, texto: c.escreve(), tom: c.tom });
      continue;
    }
    const n = Math.round(Number(m[c.campo]) || 0);
    if (!n) continue;
    saida.push({ id: c.campo, texto: c.escreve(n), tom: c.tom || (n > 0 ? "bom" : "perigo") });
  }
  return saida;
}
