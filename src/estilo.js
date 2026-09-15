/* ============================================================
   ESTILO — a folha da casa (v9.244)

   O CSS do jogo morava dentro de `constantes.js`: 156 linhas de fonte,
   animação e superfície embaixo do arquivo que guarda XP por nível,
   pontos de atributo e teto de companheiro. Duas mesas diferentes no
   mesmo balcão — quem vinha ajustar uma regra de jogo tropeçava na
   cortiça, e quem vinha ajustar a cortiça tropeçava na regra.

   E havia um motivo mecânico além do arrumado: a catraca de cor que vem
   na D5 varre `src/` atrás de cor literal solta. Enquanto a folha mora
   junto das constantes, a varredura não consegue olhar a folha sem
   olhar a si mesma — a tabela de cor e o texto varrido são o mesmo
   arquivo. Casa própria resolve as duas coisas de uma vez.

   ESTE ARQUIVO NÃO IMPORTA NADA, de propósito. `constantes.js` importa
   `regras.js`; se o estilo continuasse pendurado nele, a mesa de design
   arrastaria a mesa de regra para dentro de qualquer coisa que só
   quisesse uma cor. A folha é folha: entra em tudo e não depende de
   nada.

   A folha continua sendo UM `<style>` em JSX dentro do `#root` — e isso
   é regra, não acaso. O Tailwind entra por CDN no `<head>` (veja o
   `index.html`); é só por vir DEPOIS dele que a nossa folha ganha os
   empates de especificidade (há um empate real: `.tv-margem-abas`
   contra `mx-4`). Nada de `.css` importado pelo Vite, nada de injetar no
   `<head>` por `useEffect`.
   ============================================================ */

/* A PALETA SEMÂNTICA: o que a cor SIGNIFICA (o fundo, a linha, o
   acento, o perigo). É o que o resto do projeto importa — quinze
   arquivos pedem `T`, e nenhum deles precisa saber de que tom de roxo
   `panel` é feito hoje.

   `lineStrong`: as quatro superfícies da casa cabem dentro de 1,3:1 umas
   das outras (`line`/`panel` = 1,295:1, `panelSoft`/`panel` = 1,073:1) —
   para a WCAG 1.4.11 são uma superfície só, e por isso um controlo desta
   casa ou se enche de `amber` (8,45:1) e grita, ou desaparece. `lineStrong`
   é o degrau que faltava: `panel` 3,512:1 · `bg` 3,741:1 · `panelSoft`
   3,272:1 — os três acima do piso de 3:1 para não-texto. E não é "o degrau
   mais baixo que passa" (`#6B6387` passa a 3,040) — é o mais baixo que
   passa com folga: 9,1% acima do piso contra 1,3%. Escopo é só borda de
   controlo (`STROKE_COLOR`): sobre `ink` dá 4,09:1, que reprova texto — não
   é cor de letra. */
export const T = {
  bg: "#0E0C15", panel: "#171322", panelSoft: "#1E1930", line: "#2E2745",
  lineStrong: "#70688C",
  ink: "#EAE4D6", inkDim: "#9B93AC",
  amber: "#E8A33D", amberSoft: "#F5C878", onAccent: "#1A1408",
  violet: "#8B7BD8", violetSoft: "#B0A5EC", onSecond: "#14101F",
  danger: "#D86A5B", ok: "#7BC98F",
};

/* O PRETO E O BRANCO DE SEMPRE. Sombra e brilho não são cor do tema:
   são profundidade. O alfa vai como STRING, escrito exatamente como
   estava no CSS — `sombra(".55")` devolve o mesmo `rgba(0,0,0,.55)`
   byte a byte, e um `0.55` numérico devolveria `rgba(0,0,0,0.55)`, que
   é a mesma cor com outro texto. Num arquivo cujo contrato é "zero
   diferença na tela", o texto também conta.

   Privados de propósito: quem precisa de sombra precisa da folha, não
   da fórmula. */
const sombra = (a) => `rgba(0,0,0,${a})`;
const brilho = (a) => `rgba(255,255,255,${a})`;

/* ============================================================
   A PALETA FÍSICA: de que o OBJETO é feito.

   `T` diz o que a cor significa; `MATERIAIS` diz de que material a
   coisa é. A tábua de cortiça não é "o fundo do painel" nem "a linha":
   é madeira escura, e vai continuar sendo madeira escura no dia em que
   o tema inteiro mudar de tom. Misturar as duas famílias é como o mural
   nasceu — treze cores literais soltas no meio de um gradiente.

   O CONTRATO: toda entrada aqui é um valor de cor CSS COMPLETO, pronto
   para interpolar direto na folha. Nenhuma conta de alfa mora aqui —
   quem precisa de transparência sobre uma cor do tema espera o helper
   `alfa(cor, a)`, que é de outro ciclo.
   ============================================================ */
export const MATERIAIS = {
  /* a tábua de cortiça: o corpo escuro, a moldura de madeira e o filete
     de latão que corre por dentro dela */
  corticaFundo:        "#1A1424",
  corticaMoldura:      "#3B2A1B",
  corticaFilete:       "rgba(150,112,66,.4)",
  /* o papel do cartaz: três paradas de um gradiente diagonal, do topo
     iluminado ao pé na sombra */
  cartazTopo:          "#241D33",
  cartazMeio:          "#1C1729",
  cartazPe:            "#191426",
  /* a cabeça de latão do percevejo: o ponto de luz, o corpo e a base */
  percevejoBrilho:     "#FFE2AC",
  percevejoCorpo:      "#D98F22",
  percevejoBase:       "#6E4207",
  /* e a cabeça roxa, que é como o cartaz diz de relance que foi
     OFERECIDO a você e não está ali para qualquer um */
  percevejoRoxoBrilho: "#E4DEFF",
  percevejoRoxoCorpo:  "#8A78D8",
  percevejoRoxoBase:   "#3B3072",
  /* a vinheta: o quase-preto azulado que escurece o canto da tela */
  vinhetaCanto:        "rgba(4,3,8,.45)",
};

/* ============================================================
   AS FONTES — e o `@import` que tem de vir primeiro.

   O `@import` é a PRIMEIRÍSSIMA coisa da string, e por isso `FONT_CSS`
   é a primeira parcela de `FOLHA`. Um `@import` que não está no topo da
   folha concatenada é descartado pelo navegador EM SILÊNCIO: nenhum
   erro, nenhum aviso, e as três fontes do jogo simplesmente não chegam.
   ============================================================ */
export const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Spectral:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@400;600&display=swap');
.tv-display { font-family: 'Cormorant Garamond', Georgia, serif; }
.tv-body { font-family: 'Spectral', Georgia, serif; }
.tv-mono { font-family: 'JetBrains Mono', monospace; }
`;

/* ============================================================
   O MOVIMENTO — tudo que anda na tela.

   As cores daqui são rgba() que já são cor de `T` com alfa (o âmbar do
   brilho, o vermelho do dano). NÃO SAEM NESTA ETAPA: elas esperam o
   helper `alfa(cor, a)`, que é de outro ciclo. Trocá-las à mão agora
   seria inventar a fórmula duas vezes.

   E três classes aqui NÃO declaram `animation` — `.tv-vira-palco`,
   `.tv-vira-face` e `.tv-vira-verso`. Elas ficam mesmo assim: sem o
   `perspective` do palco e o `backface-visibility` das faces, a carta
   gira e não se vê NADA. Quem vier "limpar" a caixa por elas não
   declararem animação apaga a virada inteira.
   ============================================================ */
export const MOVIMENTO_CSS = `
/* A ORDEM É A REGRA (1/2): .tv-fade tem de vir ANTES de .tv-reliquia.
   As duas têm a mesma especificidade e as duas declaram animation, e o
   App usa as duas no MESMO elemento (a carta de espolio raro). Quem vem
   depois ganha — hoje ganha a reliquia, e e por isso que a carta rara
   PULSA em vez de so aparecer. Inverter estas duas caixas troca o
   efeito sem trocar uma linha de JSX. */
.tv-fade { animation: tvFade .5s ease both; }
@keyframes tvFade { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: none;} }
@keyframes tvGlow { 0%,100%{box-shadow:0 0 24px rgba(232,163,61,.25);} 50%{box-shadow:0 0 48px rgba(232,163,61,.55);} }
@keyframes tvShake { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-8deg)} 40%{transform:rotate(7deg)} 60%{transform:rotate(-5deg)} 80%{transform:rotate(4deg)} }
.tv-dice { animation: tvShake .35s linear infinite, tvGlow 1s ease infinite; }
.tv-pulse { animation: tvGlow 1.6s ease infinite; }
@keyframes tvSlide { from { transform: translateX(24px); opacity: 0;} to { transform: none; opacity: 1;} }
.tv-slide { animation: tvSlide .25s ease both; }

/* ---------------- O CORPO SENTE (v9.160) ----------------
   O clarao de dano e o pulso de agonia do bloco do heroi. Um golpe que
   so muda um numero e um golpe que o jogador nao sente: o clarao dura
   menos de um segundo e morre sozinho; a agonia (um terco da vida)
   pulsa ate alguem fazer alguma coisa a respeito. */
@keyframes tvDano { 0% { box-shadow: 0 0 0 rgba(216,106,91,0); } 20% { box-shadow: 0 0 22px rgba(216,106,91,.85); } 100% { box-shadow: 0 0 0 rgba(216,106,91,0); } }
.tv-dano { animation: tvDano .7s ease both; }
@keyframes tvAgonia { 0%, 100% { box-shadow: 0 0 6px rgba(216,106,91,.25); } 50% { box-shadow: 0 0 16px rgba(216,106,91,.6); } }
.tv-agonia { animation: tvAgonia 1.6s ease infinite; }

/* ---------------- O PALCO DO COMBATE (v9.161) ----------------
   O numero de dano sobe do quadrado de quem apanhou e some (as unidades
   sao as do SVG do tabuleiro: 1 = um quadrado de 1,5 m). A faixa do
   chefe abre, respira e fecha sozinha — 3,2 s, o tempo de ler uma
   frase curta duas vezes. */
@keyframes tvFlutua { 0% { opacity: 0; transform: translateY(0.3px); } 15% { opacity: 1; } 70% { opacity: 1; } 100% { opacity: 0; transform: translateY(-0.9px); } }
.tv-flutua { animation: tvFlutua 1.35s ease-out both; }
@keyframes tvFaixa { 0% { opacity: 0; transform: scaleY(0.3); } 10% { opacity: 1; transform: none; } 85% { opacity: 1; } 100% { opacity: 0; } }
.tv-faixa { animation: tvFaixa 3.2s ease both; }

/* ---------------- A VIRADA DA CARTA (v9.163) ----------------
   A subida de nivel abre com a carta de COSTAS e a revela. O palco da
   perspectiva fica no pai; a carta gira uma vez, com um respiro antes
   (o jogador precisa VER o verso para a virada valer alguma coisa).
   As duas faces escondem o proprio dorso; o verso ja nasce virado. */
.tv-vira-palco { perspective: 1200px; }
.tv-vira { position: relative; transform-style: preserve-3d; animation: tvVira 1.1s cubic-bezier(.2,.7,.3,1) .45s both; }
@keyframes tvVira { from { transform: rotateY(180deg); } to { transform: rotateY(0deg); } }
.tv-vira-face { backface-visibility: hidden; }
.tv-vira-verso { position: absolute; inset: 0; transform: rotateY(180deg); backface-visibility: hidden; }
/* o brilho do espolio raro: pulsa devagar, na cor que a raridade mandar
   (a cor entra por box-shadow inline; aqui mora so o ritmo) */
@keyframes tvReliquia { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.25); } }
.tv-reliquia { animation: tvReliquia 2.4s ease infinite; }
/* o sigilo da recalibragem (v9.182): dois anéis em sentidos opostos, e um
   ponto que pisca no passo em curso. Devagar de propósito — a espera é de
   verdade (o arquivista relê a campanha inteira), e um giro rápido faria
   parecer travado. */
@keyframes tvGira { to { transform: rotate(360deg); } }
@keyframes tvGiraAoContrario { to { transform: rotate(-360deg); } }
@keyframes tvPisca { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
.tv-anel-fora { animation: tvGiraAoContrario 24s linear infinite; }
.tv-anel-dentro { animation: tvGira 3.2s linear infinite; }
.tv-pisca { animation: tvPisca 1.2s ease infinite; }
/* A ORDEM É A REGRA (2/2): este @media tem de vir DEPOIS das tres
   classes acima. Uma media query nao soma especificidade nenhuma — ela
   so envolve. Quem decide o empate e a ordem, e so por estar embaixo
   este bloco consegue desligar a animacao de quem pediu menos
   movimento. Subir esta caixa nao da erro: da um acessivel que nao
   funciona, calado. */
@media (prefers-reduced-motion: reduce) {
  .tv-anel-fora, .tv-anel-dentro, .tv-pisca { animation: none; }
}
`;

/* ============================================================
   AS SUPERFÍCIES — o que fica parado: o trilho, a tábua e o papel.

   Aqui as cores PRÓPRIAS do objeto saem da string e entram por
   `MATERIAIS`, e todo preto e branco por `sombra()` / `brilho()`. Cada
   troca rende exatamente o mesmo texto que estava escrito antes.

   O que continua literal são as cores que JÁ SÃO de `T` com alfa (os
   pontinhos de âmbar, violeta e tinta da cortiça; a borda do cartaz).
   Elas esperam o helper `alfa(cor, a)` de outro ciclo — trocar agora
   por uma conta escrita à mão seria pagar o preço duas vezes.
   ============================================================ */
export const SUPERFICIES_CSS = `
.tv-scroll::-webkit-scrollbar { width: 8px; }
.tv-scroll::-webkit-scrollbar-thumb { background: ${T.line}; border-radius: 4px; }

/* ---------------- O ESPAÇO DO TRILHO (v9.156) ----------------
   O trilho de abas é lateral no monitor e barra inferior no telefone, e
   cada forma cobra o seu espaço num lado diferente. Isto estava escrito
   catorze vezes como um padding-right de 68px em linha — o que num
   telefone reservava dezoito por cento da largura para uma barra que
   nem está ali.

   (Sem crase neste comentário de propósito: ele mora DENTRO da template
   literal do CSS, e uma crase aqui fecha a literal e derruba o build —
   foi exatamente o que aconteceu na primeira tentativa.)

   tv-espaco-abas é a reserva: nada embaixo, no telefone; 68px à direita
   a partir do monitor. Uma decisão num lugar só, e a próxima tela nasce
   certa sem ninguém lembrar dela.

   ---------------- E O PADDING-RIGHT FOI EMBORA (v9.197) ----------------
   A reserva da direita morreu na v9.170, quando o trilho saiu de fixed e
   virou coluna em fluxo: de la para ca o valor era 0 nos dois lados da
   media query. Mas a DECLARACAO ficou — e uma declaracao de padding-right
   ganha de px-4 na cascata, entao todo elemento que usava as duas classes
   juntas (eram dez) tinha 16px a esquerda e ZERO a direita.

   Foi a queixa de quem jogou no telefone: o meio da tela parecia pregado na
   borda direita. Nao era o rolamento — era esta linha, apagando metade do
   respiro de cada bloco. Reserva que nao reserva nada nao fica "por via das
   duvidas": ela sai, porque continua mandando na cascata mesmo valendo 0.

   (De novo sem crase: o aviso acima nesta mesma caixa e literal, e eu
   tropecei nele ao escrever este paragrafo.)

   O que sobra é o que ainda é verdade: no telefone a barra de abas é fixa
   embaixo e come 64px, então quem encosta nela reserva esse espaço. UMA
   VEZ — e não em dez elementos aninhados, que era o buraco vertical.

   E A ORDEM É A REGRA: a media query vem DEPOIS das duas classes. Ela
   nao soma especificidade — so a posicao decide qual valor vale no
   monitor. */
.tv-espaco-abas { padding-bottom: 4.75rem; }
.tv-margem-abas { margin-right: 0; }
@media (min-width: 768px) {
  .tv-espaco-abas { padding-bottom: 0; }
  .tv-margem-abas { margin-right: 0; }
}

/* ---------------- A CORTIÇA E O PAPEL (v9.127) ----------------
   O mural era uma lista de retângulos iguais dentro de um painel igual a
   todos os outros. Ele é a única tela do jogo que representa um OBJETO do
   mundo — uma tábua com papéis pregados — e não custa nada dizer isso.

   Tudo aqui é gradiente e sombra: nem um arquivo de imagem entra no
   repositório, e a cortiça continua sendo cortiça no telefone e no monitor.
   E nada de cortiça bege com papel creme: o jogo é âmbar sobre violeta
   escuro, e uma tábua clara no meio disso não seria charme, seria mancha. */
.tv-cortica {
  background-color: ${MATERIAIS.corticaFundo};
  background-image:
    radial-gradient(rgba(232,163,61,.13) 1.1px, transparent 1.6px),
    radial-gradient(rgba(139,123,216,.11) 1px, transparent 1.5px),
    radial-gradient(rgba(234,228,214,.07) 1.2px, transparent 1.7px),
    radial-gradient(ellipse at 22% 18%, rgba(232,163,61,.05), transparent 55%),
    radial-gradient(ellipse at 78% 72%, rgba(139,123,216,.05), transparent 55%);
  background-size: 17px 17px, 29px 25px, 11px 21px, 100% 100%, 100% 100%;
  background-position: 0 0, 7px 11px, 3px 5px, 0 0, 0 0;
  box-shadow: inset 0 0 46px ${sombra(".55")}, inset 0 1px 0 ${brilho(".04")};
  border: 7px solid ${MATERIAIS.corticaMoldura};
  border-radius: 14px;
  outline: 1px solid ${MATERIAIS.corticaFilete};
  outline-offset: -8px;
}
.tv-cartaz {
  background-image: linear-gradient(155deg, ${MATERIAIS.cartazTopo} 0%, ${MATERIAIS.cartazMeio} 62%, ${MATERIAIS.cartazPe} 100%);
  border: 1px solid rgba(232,163,61,.16);
  box-shadow: 0 7px 16px ${sombra(".5")}, inset 0 1px 0 ${brilho(".04")};
  transition: transform .18s ease, box-shadow .18s ease;
}
/* o giro fica no embrulho e o levantar no papel: assim o passar do dedo
   endireita o cartaz sem brigar com o ângulo que ele tem parado */
.tv-pregado:hover .tv-cartaz { transform: translateY(-3px); box-shadow: 0 13px 26px ${sombra(".62")}; }
/* o percevejo atravessa o papel, e não paira acima dele: em cima da borda
   ele vira uma continha solta no ar. Fica DENTRO do cartaz, com a sombra
   curta que uma cabeça de alfinete faz no papel. */
.tv-percevejo {
  position: absolute; top: 6px; left: 50%; margin-left: -6px;
  width: 12px; height: 12px; border-radius: 50%;
  background: radial-gradient(circle at 34% 28%, ${MATERIAIS.percevejoBrilho}, ${MATERIAIS.percevejoCorpo} 58%, ${MATERIAIS.percevejoBase});
  box-shadow: 0 1px 2px ${sombra(".75")}, 0 0 0 1px ${sombra(".45")}, 0 3px 5px ${sombra(".35")};
}
.tv-percevejo.tv-roxo { background: radial-gradient(circle at 34% 28%, ${MATERIAIS.percevejoRoxoBrilho}, ${MATERIAIS.percevejoRoxoCorpo} 58%, ${MATERIAIS.percevejoRoxoBase}); }

/* A VINHETA: o canto da tela escurece de leve, e o meio — onde a narração
   acontece — parece iluminado. É a coisa mais barata que existe para dar
   profundidade, e some sozinha em quem tiver o brilho baixo. */
.tv-vinheta {
  position: fixed; inset: 0; pointer-events: none; z-index: 1;
  background: radial-gradient(120% 85% at 50% 42%, transparent 52%, ${MATERIAIS.vinhetaCanto} 100%);
}
`;

/* A FOLHA INTEIRA, na ordem em que o navegador tem de recebê-la.

   A ORDEM DA FOLHA É REGRA DE CASCATA, E REGRA NÃO MORA NO `App.jsx`.
   Quem monta a tela pede `FOLHA` e pronto; quem decide o que vem antes
   de quê é este arquivo, que é o único que sabe por quê.

   `FONT_CSS` primeiro porque o `@import` tem de ser a primeira coisa da
   folha — fora do topo ele é descartado em silêncio, e o jogo inteiro
   cai para a fonte de fallback sem um aviso. */
export const FOLHA = FONT_CSS + MOVIMENTO_CSS + SUPERFICIES_CSS;
