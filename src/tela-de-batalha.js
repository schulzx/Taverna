/* ============================================================
   A TELA DA BATALHA — o que ela mostra, decidido FORA dela (E3)

   "Conta se prova, tela se olha." Tudo o que nesta tela é DECISÃO — quem
   aparece na faixa da vez e em que ordem, que verbos existem, que frase
   a linha do veredito escreve quando não há nada de urgente a dizer,
   quanta prosa do Mestre cabe nas duas linhas que ficam — mora aqui, em
   Node, provável sem React e sem DOM. O `painel-batalha.jsx` pinta o que
   este módulo decidiu, e o `App.jsx` só liga os fios.

   POR QUE ISTO NÃO PODIA FICAR NO .JSX. Três das quatro regras abaixo já
   existiam no `App.jsx`, escritas dentro do JSX que as desenhava:

     · "quem caiu sai da faixa" era um `.some(...)` no meio de um `.map`;
     · "o primeiro da ordem é quem age" era `i === 0` numa expressão;
     · a lista dos verbos era um array literal de rótulos e emojis.

   Nenhuma delas tinha prova, porque nenhuma delas tinha onde ser
   provada. A regra que vive dentro do desenho é a regra que muda quando
   alguém mexe no desenho.

   E A LISTA DOS VERBOS NÃO NASCE AQUI: ela sai de `VERBOS_DE_COMBATE`
   (`golpe.js`), que é a tabela onde X1 escreveu, verbo a verbo, QUAL
   DELES CHEGA A MOTOR. Uma segunda lista de verbos nesta casa seria a
   mesma doença que E2 gastou uma etapa inteira a impedir com as letras
   da grade — e seria pior, porque esta mentiria sobre o que o botão faz.
   ============================================================ */

import { VERBOS_DE_COMBATE } from "./golpe.js";

/* ---------------- AS SEIS REGIÕES, na ordem de leitura ----------------
   E1: "a ordem de leitura é a ordem do turno" — de quem é a vez → o
   campo → o veredito → o que você faz. As outras duas são CONSULTA, e
   por isso ficam fora dessa linha, nunca no meio dela.

   A ordem desta tabela É a ordem do DOM, e a ordem do DOM é a ordem de
   tabulação (WCAG 2.4.3): reordenar com `tabindex` positivo é o remendo
   que a norma existe para recusar. Escrita como dado para que a catraca
   possa conferir que a tela monta as seis, e nesta ordem. */
export const REGIOES_DA_BATALHA = [
  { id: "vez",       faz: "sabe se pode agir agora",                 naLinhaDoTurno: true },
  { id: "campo",     faz: "olha, escolhe a casa, anda, mira",        naLinhaDoTurno: true },
  { id: "veredito",  faz: "lê o preço do que está prestes a fazer",  naLinhaDoTurno: true },
  { id: "verbos",    faz: "dispara a ação",                          naLinhaDoTurno: true },
  { id: "dePe",      faz: "sabe quem aguenta e quem cai",            naLinhaDoTurno: false },
  { id: "narracao",  faz: "lê a cena",                               naLinhaDoTurno: false },
];

/* ---------------- O QUE SOME DURANTE A LUTA ----------------
   O critério de E1, e ele é duro: *um controle que, tocado no meio de
   uma luta, ou não faz nada ou TERMINA a luta, não pode estar na tela da
   luta.* Não é gosto — o `⛺` encerrou uma luta por engano numa partida
   de verdade, e é esse acidente que esta lista paga.

   Escrita como tabela porque é ela que a catraca lê de volta: uma porta
   nova que nasça no convés e não apareça aqui fica vermelha no dia em
   que nascer, e não no dia em que alguém a tocar no meio de uma briga. */
export const FORA_DA_TELA_DA_LUTA = [
  { id: "abas",      porque: "o trilho inteiro: oito portas para fora da luta" },
  { id: "inventario", porque: "arrumar a bolsa não é um turno — e a bolsa de combate já está na tela" },
  { id: "mapa",      porque: "viaja" },
  { id: "diario",    porque: "não faz nada agora" },
  { id: "codex",     porque: "não faz nada agora" },
  { id: "guilda",    porque: "não faz nada agora" },
  { id: "dominios",  porque: "não faz nada agora" },
  { id: "gestao",    porque: "não faz nada agora" },
  { id: "ascensao",  porque: "não faz nada agora" },
  { id: "examinar",  porque: "catar do chão no meio do golpe" },
  { id: "tempo",     porque: "passa horas" },
  { id: "acampar",   porque: "ENCERRA A LUTA — e já encerrou uma, por engano" },
  { id: "cronica",   porque: "escreve a lenda enquanto ela ainda está a acontecer" },
];

/* ============================================================
   A ORDEM DA VEZ

   Quatro regras de E1, e cada uma tem o seu motivo escrito:

   1. QUEM CAI SAI, e não fica riscado — "uma luta de dez inimigos com
      sete caídos seria uma faixa de cadáveres a empurrar os vivos para
      fora do olhar".
   2. O SELO DO HERÓI FICA FIXADO À ESQUERDA — "a única coisa que
      ninguém pode ter de procurar rolando é a sua própria vez".
   3. CÍRCULO É ALIADO, LOSANGO É INIMIGO — o mesmo vocabulário de forma
      da marca de borda, de propósito: é o que permite dizer QUEM sem
      palavra numa faixa onde oito nomes seriam oito truncagens.
   4. O RÓTULO É `agora: Halvard`, nunca `ORDEM DE INICIATIVA` — se o
      trabalho da faixa é responder àquela pergunta, ela diz a resposta.
      É a lei de que o sistema não fala de si mesmo, aplicada a um rótulo.

   E uma quinta, que é desta casa e não de E1: A FAIXA NUNCA É VAZIA.
   Nem toda luta deste motor tem `ordem` — há combates abertos sem
   iniciativa rolada. Onde não há ordem, a faixa monta-se do herói mais
   quem está de pé, e quem age é o herói, que é o que o motor já faz
   ("agir encerra o turno"). Uma região da lei que desaparece em metade
   das lutas não é uma região: é uma intenção.
   ============================================================ */
export function faixaDaVez(combate, nomeDoHeroi) {
  const c = combate == null ? {} : combate;
  const inimigos = Array.isArray(c.inimigos) ? c.inimigos : [];
  const ordem = Array.isArray(c.ordem) ? c.ordem : [];
  const heroi = String(nomeDoHeroi || "").trim();

  const caido = (e) => !!(e && (e.derrotado || Number(e.vida || 0) <= 0));
  const inimigoCaiu = (nome) => inimigos.some((e) => e && e.nome === nome && caido(e));
  const ehInimigo = (nome) => inimigos.some((e) => e && e.nome === nome);

  /* a fonte da ordem: a iniciativa rolada quando existe; senão o herói
     seguido de quem ainda está de pé */
  const crus = ordem.length
    ? ordem.filter((x) => x && x.nome && !inimigoCaiu(x.nome))
    : [
        ...(heroi ? [{ nome: heroi, iniciativa: null }] : []),
        ...inimigos.filter((e) => e && e.nome && !caido(e)).map((e) => ({ nome: e.nome, iniciativa: null })),
      ];

  /* QUEM AGE AGORA. E aqui esta a verdade deste motor, escrita porque a
     tela mentia sem ela: `combate.ordem` e rolada UMA vez, na abertura,
     e NUNCA roda — nao ha cursor de vez em `combate.js`. A tela antiga
     dizia "quem age e o primeiro da ordem", e por isso anunciava o
     goblin enquanto o jogador jogava, rodada apos rodada.

     O que este motor de facto faz e outra coisa, e e honesta: AGIR
     ENCERRA O TURNO — o heroi age, o mundo inteiro responde dentro da
     mesma batida, e a vez volta a ele. Entao quem age e o heroi, e a
     iniciativa fica onde sempre esteve: a dizer a ORDEM, que e o que
     ela sabe. `combate.vez` fica lido a frente do motor: no dia em que
     nascer um cursor de vez, ele manda, e nada muda de forma aqui. */
  const cursor = c.vez ? String(c.vez) : "";
  const agora = cursor && crus.some((x) => x.nome === cursor) ? cursor
    : heroi && crus.some((x) => x.nome === heroi) ? heroi
    : crus.length ? crus[0].nome : "";
  const selos = crus.map((x) => ({
    nome: String(x.nome),
    iniciativa: Number.isFinite(Number(x.iniciativa)) ? Number(x.iniciativa) : null,
    lado: ehInimigo(x.nome) ? "inimigo" : "aliado",
    forma: ehInimigo(x.nome) ? "losango" : "circulo",
    heroi: !!heroi && x.nome === heroi,
    agora: x.nome === agora,
  }));

  /* o selo do herói à ponta esquerda, e nunca sai de lá */
  const i = selos.findIndex((s) => s.heroi);
  return i > 0 ? [selos[i], ...selos.slice(0, i), ...selos.slice(i + 1)] : selos;
}

/* O rótulo da faixa. Nunca o nome do mecanismo; sempre a resposta. */
export function rotuloDaVez(selos) {
  const lista = Array.isArray(selos) ? selos : [];
  const quem = lista.find((s) => s && s.agora) || lista[0];
  return quem ? `agora: ${quem.nome}` : "";
}

/* ============================================================
   A FILEIRA DOS VERBOS

   A LISTA É DO `jogo` e vive em `golpe.js`. Aqui só se lhe acrescenta o
   que é de TELA: o papel de cada um (quem é a chamada, quem é gesto,
   quem é recuo) e QUANTOS TOQUES ele custa — que é a lei de W1 posta em
   dado:

     > O segundo toque nunca é uma confirmação. É sempre a resposta a uma
     > pergunta que o jogo não pode responder sozinho. São duas, e só
     > duas: EM QUEM? e PARA ONDE?

   `Atacar` resolve num toque quando há alguém ao alcance, porque o preço
   já está na linha antes dele — é a linha permanente que paga o toque
   único. Os outros ARMAM, porque cada um deles tem uma pergunta que a
   tela não pode responder: para onde se anda, em quem se empurra, sobre
   o que se salta.

   E `esperar` fica do outro lado de uma goteira, em `Papel=Recuo`, que é
   a posição do Recuo em toda a casa. A DÍVIDA DELE FICA ESCRITA, porque
   dívida calada é mentira: não há porta de "passar a vez" no motor
   (pedido aberto em `mente/pedidos-ao-sistema.md`), logo ele declara a
   frase pela mesma porta de todas as outras e custa uma chamada ao
   Mestre. O botão não inventa mecânica nenhuma — poupa a digitação, e é
   só isso que ele promete. */
export const VERBO_DE_ESPERA = {
  id: "esperar",
  rotulo: "esperar",
  papel: "recuo",
  primeiro: false,
  toques: 1,
  frase: "Seguro a ação e observo, pronto para responder",
  motor: null,
  porqueSemMotor: "não há porta de passar a vez em turno.js — pedido 5.1 de W1, aberto em mente/pedidos-ao-sistema.md",
};

/* NA TELA DA BATALHA NÃO HÁ `Papel=Chamada` NENHUM — e a razão é a peça,
   não o gosto. `Chamada` já é âmbar cheio EM REPOUSO: no par comparável do
   Figma, o `ATACAR` em repouso e o armado eram a mesma caixa amarela,
   separadas por um triângulo de 6 px. *O âmbar cheio é a voz mais forte
   desta tela, e pertence ao que VAI ACONTECER, não ao que é popular* —
   gasto em repouso, não sobra nada para o momento em que importa.

   A regra que fica, e é do `regente`: **só se pode armar o que tem fundo
   para inverter.** `Atacar` continua a ser o primeiro entre iguais, e
   paga-se na LARGURA (163 px contra 72 · 44 · 44, que fecham os 359 úteis
   do telefone), nunca no preenchimento. */
export function fileiraDeVerbos() {
  const gestos = (VERBOS_DE_COMBATE || []).map((v) => ({
    id: v.id,
    rotulo: v.rotulo,
    papel: "gesto",
    primeiro: v.id === "atacar",
    /* um toque só para quem não tem pergunta por responder */
    toques: v.id === "atacar" ? 1 : 2,
    frase: v.frase || "",
    motor: v.motor || null,
    porqueSemMotor: v.porqueSemMotor || "",
  }));
  return [...gestos, VERBO_DE_ESPERA];
}

/* ============================================================
   A LINHA DO VEREDITO — sempre presente, e NUNCA vazia

   É a regra mais dura desta tela, e a razão é de E2: antes, a casa que
   não dava simplesmente CALAVA, e silêncio lê-se como "não há nada a
   dizer", nunca como "não dá". A mesma doença aplicada à linha seria
   pior: ela é o que paga o toque único.

   A cadeia termina num ramo SEM CONDIÇÃO — é a mesma forma de prova que
   `check-endereco-do-tabuleiro` já exige da casa, e pela mesma razão:
   não há caminho que devolva "".

   A ORDEM DE CORTE, quando o nome é grande, é de W1: primeiro cai a
   SAÍDA, depois o LUGAR — nunca o alvo e nunca o preço. */
export const PEDIDO_DO_VERBO = {
  atacar:   "",   /* não arma: o preço já está na linha, e é ele que paga o toque único */
  mover:    "toque a casa onde quer parar",
  esquivar: "diga como, se quiser",
  empurrar: "diga em quem",
  derrubar: "diga em quem",
  saltar:   "diga sobre o quê",
  esperar:  "",   /* resolve num toque: quem espera não tem alvo */
};
export const SAIDA_DO_ARMADO = "toque o verbo outra vez para desistir";

/* ============================================================
   O VERBO QUE NÃO PODE ARMAR (E4) — e a linha que E3 elogiou era a
   que mentia

   APANHADO A JOGAR: com 0 m de passo, `Mover` aceitava o toque, ficava
   `aria-pressed="true"` e a linha do veredito escrevia *"toque a casa
   onde quer parar · toque o verbo outra vez para desistir"* — **e não
   havia casa nenhuma para tocar** (medido: clicáveis 0).

   > ### Um verbo cujo conjunto armado é VAZIO não arma, e a linha diz porquê.

   E o caso vai passar a ser COMUM, não raro: com o passo a debitar de
   verdade (a chave `economia` que nascia em falta), toda rodada acaba
   com o passo a zero. O que era um canto passa a ser o fim de cada
   turno.

   POR QUE A RAZÃO É TABELA E NÃO STRING NO BOTÃO. É a mesma lei da casa
   de `RECUSAS_DO_PASSO`: a frase que o olho lê e a que o ouvido ouve têm
   de ser a MESMA, e o tecto de 54 caracteres tem de proteger as duas. O
   dia em que uma delas for escrita dentro de um JSX, são duas.

   E O CANAL NÃO É O BALÃO DE RATO. `title=` não existe no telefone, e é
   exactamente lá que a fileira dos verbos vive no arco do polegar. A
   razão vai para a linha do veredito — que é a região que já responde
   "o que acontece se eu agir agora", e cuja resposta aqui é "nada, e
   por isto". */
export const RECUSAS_DO_VERBO = {
  semPasso:   "o seu passo acabou nesta rodada",
  semSaida:   "não há casa livre à sua volta",
  semAlcance: "ninguém ao seu alcance",
  fimDaLuta:  "a luta acabou",
};

/* O TECTO DOS 54 CARACTERES vale para estas também: elas entram na linha
   do veredito, que é a mesma linha e a mesma largura. */
export const TETO_DA_RECUSA = 54;

/* Quem está impedido, e por quê — um mapa de `id do verbo` para a RAZÃO
   (string vazia quer dizer "pode"). Devolver a razão em vez de um
   booleano é o que faz a tela poder dizê-la sem a inventar.

   `casasDoPasso` é o tamanho do conjunto que o campo acenderia: `null`
   quer dizer "ainda não foi medido", e nesse caso NÃO se impede nada —
   *um verbo impedido por falta de medida seria a tela a mentir ao
   contrário*, que é tão mau como a mentira de hoje. */
export function impedimentosDaFileira(estado) {
  const e = estado == null ? {} : estado;
  const casas = e.casasDoPasso == null ? null : Math.max(0, Math.round(Number(e.casasDoPasso) || 0));
  const fim = !!e.fim;
  const razaoDoPasso = fim ? RECUSAS_DO_VERBO.fimDaLuta
    /* as duas metades do vazio, e elas NÃO são a mesma frase: sem passo
       é o tempo que acabou, sem saída é o espaço que fechou. Dizer
       "acabou o passo" a quem está cercado com 9 m na mão seria mandá-lo
       esperar por uma rodada que não resolve nada. */
    : !e.podeAndar ? RECUSAS_DO_VERBO.semPasso
    : casas === 0 ? RECUSAS_DO_VERBO.semSaida
    : "";
  return {
    atacar: fim ? RECUSAS_DO_VERBO.fimDaLuta
      : e.bloqueado ? RECUSAS_DO_VERBO.fimDaLuta
      : e.algumAoAlcance === false ? RECUSAS_DO_VERBO.semAlcance : "",
    mover: razaoDoPasso,
  };
}

export function vereditoDaTela(estado) {
  const e = estado == null ? {} : estado;
  const armado = e.armado ? String(e.armado) : "";
  /* A RECUSA VEM PRIMEIRO, e é o veredito antes do clique aplicado ao
     caso em que o clique não vai acontecer: o jogador acabou de tocar
     um verbo que não arma, e a única coisa que a tela lhe deve é o
     motivo. Um verbo recusado nunca arma, logo os dois nunca disputam —
     a ordem está aqui pela leitura, não pelo empate. */
  if (e.recusaDoVerbo) return String(e.recusaDoVerbo);
  if (armado) {
    const pedido = PEDIDO_DO_VERBO[armado] || "";
    return pedido ? `${pedido} · ${SAIDA_DO_ARMADO}` : SAIDA_DO_ARMADO;
  }
  if (e.linha) return String(e.linha);
  if (e.recusa) return String(e.recusa);
  const rodada = Math.max(1, Math.round(Number(e.rodada) || 1));
  const dePe = Math.max(0, Math.round(Number(e.dePe) || 0));
  return `rodada ${rodada} · ${dePe} de pé contra você`;
}

/* ============================================================
   A NARRAÇÃO ENCOLHIDA AO MÍNIMO HONESTO

   A leitura literal de "uma tela só com o grid" mata a narração. A
   decisão do `desenho`, registada como DECISÃO e não como pedido: a
   prosa é a protagonista, e ela não sai. Fica encolhida — no monitor as
   duas últimas linhas do Mestre, no telefone uma.

   O NÚMERO QUE A SUSTENTA: Spectral 15 px com entrelinha 1,625 dá 24,4
   px de linha; duas linhas mais respiro são os 84 px de
   `TELA_DE_BATALHA.narracao`.

   E O QUE SE CORTA É O COMEÇO, NUNCA O FIM. Um `line-clamp` de CSS
   corta ao contrário — guarda as duas PRIMEIRAS linhas e deita fora a
   prosa mais recente, que é exactamente a que o jogador precisa. Por
   isso o corte é aqui, por FRASE e do fim para o princípio: uma frase
   partida ao meio não é prosa, é um erro de tela.

   O BURACO, declarado com número porque buraco calado é mentira: o teto
   é em CARACTERES e não em píxeis medidos — `charsPorLinha` é a conta de
   Spectral 15 px na coluna de 888, e um nome próprio muito largo pode
   fazer a segunda linha transbordar por pouco. O que isto prende é a
   ORDEM (o fim sobrevive) e a ORDEM DE GRANDEZA, nunca o píxel. */
export const NARRACAO = {
  linhas: 2,
  linhasNoTelefone: 1,
  alturaDaLinha: 24.4,          /* Spectral 15 px × 1,625 */
  charsPorLinha: 118,           /* na coluna de campo de 888 px */
  charsPorLinhaNoTelefone: 48,  /* na tira de 359 px */
};

/* A última fala do Mestre, cortada pelo fim. `sistema` e `jogador` não
   entram: a região chama-se "o que acabou de acontecer" e o que acontece
   é o que o Mestre narrou — a contabilidade tem o log inteiro para ela. */
export function ultimasLinhasDoMestre(mensagens, opcoes) {
  const o = opcoes == null ? {} : opcoes;
  const linhas = Math.max(1, Math.round(Number(o.linhas) || NARRACAO.linhas));
  const chars = Math.max(8, Math.round(Number(o.chars) || NARRACAO.charsPorLinha));
  const lista = Array.isArray(mensagens) ? mensagens : [];

  let bruto = "";
  for (let i = lista.length - 1; i >= 0; i--) {
    const m = lista[i];
    if (!m || m.autor === "jogador" || m.autor === "sistema") continue;
    if (String(m.texto || "").trim()) { bruto = String(m.texto); break; }
  }
  if (!bruto) return "";

  const limpo = bruto.replace(/\s+/g, " ").trim();
  const teto = linhas * chars;
  if (limpo.length <= teto) return limpo;

  /* parte em frases sem olhar para trás: `lookbehind` não é preciso aqui
     e não é preciso em lado nenhum que um laço resolva */
  const frases = [];
  let atual = "";
  for (const ch of limpo) {
    atual += ch;
    if (ch === "." || ch === "!" || ch === "?" || ch === "…") { frases.push(atual.trim()); atual = ""; }
  }
  if (atual.trim()) frases.push(atual.trim());

  let saida = "";
  for (let i = frases.length - 1; i >= 0; i--) {
    const tenta = saida ? `${frases[i]} ${saida}` : frases[i];
    if (tenta.length > teto) break;
    saida = tenta;
  }
  /* uma frase única maior que o teto continua a ter de caber: corta-se
     pela frente, com reticências, e o fim — que é o que importa — fica */
  return saida || `…${limpo.slice(limpo.length - (teto - 1))}`;
}
