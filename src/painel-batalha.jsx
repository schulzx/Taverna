/* ============================================================
   A TELA DA BATALHA (E3) — o que E1 desenhou, construído

   A CONDIÇÃO DE ENTRADA, e é ela que faz esta casa existir: até aqui o
   tabuleiro era FILHO DO ROLADOR DO LOG. `PainelCombate` era montado
   dentro do `<div ref={areaRef}>` do `App.jsx`, depois de todas as
   mensagens — logo abria, por construção, 429 px abaixo da borda, com
   `scrollTop = 0` de 1129 possíveis. E1 mediu-o e escreveu a frase que
   define esta etapa: *"os 429 px não são altura, são arquitetura.
   Nenhum ajuste de altura resolve; só a inversão resolve."*

   A inversão é esta: quando há luta, a tela da luta É a tela — irmã do
   log, nunca filha dele. O `App.jsx` deixa de montar o tabuleiro dentro
   da prosa e passa a montar esta componente no lugar do convés inteiro.

   A GEOMETRIA É DE E1, E SAI DE TABELA. `TELA_DE_BATALHA` (`estilo.js`)
   tem os números com a conta escrita: duas colunas — respiro 16, campo
   888, goteira 16, lateral 344, respiro 16 —, que somam os 1280 exactos
   do monitor que a pessoa citou como régua. Nove das dez plantas de
   `grid.js` cabem inteiras nessa coluna, contra uma de dez na pilha de
   largura inteira: *não é preferência, é uma ordem de grandeza.*

   E A CASA NÃO SE NEGOCIA: 48 px (`ALVOS.piso`), o menor que passa em
   WCAG 2.5.5, HIG e Material ao mesmo tempo. O tabuleiro passa a ser uma
   JANELA SOBRE UM CAMPO — *quem encolhe é o campo visível, nunca o
   alvo*. É a inversão exacta do que estava aqui, onde a casa caía a
   23,8 px para o campo inteiro caber.

   A LEI DA CASA, APLICADA À LETRA: nada nesta tela diz que ela é uma
   tela. Sem título "modo batalha", sem selo "em combate", sem botão
   "sair do combate". *O jogador sabe que está numa luta porque a luta é
   o que está na tela.*

   AS REGRAS QUE ESTE ARQUIVO CUMPRE E QUE NÃO SE VEEM:
   · toda componente é declarada NO MÓDULO, nunca dentro de um render —
     componente nascido dentro do render nasce outra a cada quadro e mata
     o foco do campo de texto (uma letra e o cursor some);
   · a decisão mora em `tela-de-batalha.js`, que roda em Node e tem
     suíte: aqui só se pinta o que lá foi decidido;
   · nenhum número de regra e nenhuma cor literal: os primeiros saem de
     `TELA_DE_BATALHA`/`ALVOS`, as segundas de `T`.
   ============================================================ */

import React from "react";
import { T, ALVOS, TELA_DE_BATALHA as G } from "./estilo.js";
import { GridDeBatalha } from "./grade-de-batalha.jsx";
import { Retrato, BarraMini, PontoAtivo, Glifo } from "./ui.jsx";
import { sementeDe, estadoDe } from "./semente.js";
import { metrosTxt, podeDarUmPasso } from "./grid.js";
import { mecanicaDe } from "./condicoes.js";
import { selosDaMecanica } from "./selo-de-estado.js";
import { tituloDe } from "./divindades.js";
import {
  faixaDaVez, rotuloDaVez, fileiraDeVerbos, vereditoDaTela,
  ultimasLinhasDoMestre, NARRACAO, PEDIDO_DO_VERBO, impedimentosDaFileira,
  linhaFugaArmada,
} from "./tela-de-batalha.js";

/* ---------------- ONDE A MÃO TAPA O TABULEIRO ----------------
   O telefone é CRITÉRIO DE ENTRADA e não apêndice — a pessoa citou a
   plataforma como régua. Três medidas da tabela mudam com ele: a faixa
   da vez (56 → 48), a narração (duas linhas → uma) e o quanto a tira de
   consulta pode comer do campo.

   O corte é 768, que é o `md:` do Tailwind: um segundo número aqui faria
   a tela mudar de arranjo num sítio e de medida noutro, e o jogador veria
   a faixa encolher sem a coluna se mexer. */
const CORTE_DO_TELEFONE = "(max-width: 767px)";
function usarTelefone() {
  const [ehTelefone, setEhTelefone] = React.useState(false);
  React.useEffect(() => {
    try {
      const mq = window.matchMedia(CORTE_DO_TELEFONE);
      const ouve = () => setEhTelefone(!!mq.matches);
      ouve();
      if (mq.addEventListener) { mq.addEventListener("change", ouve); return () => mq.removeEventListener("change", ouve); }
      return undefined;
    } catch { return undefined; }
  }, []);
  return ehTelefone;
}

/* ============================================================
   A ORDEM DA VEZ — faixa horizontal no topo da área do campo

   As três alternativas caíram com motivo (E1): COLUNA LATERAL rouba
   largura, e a largura é o eixo escasso; POR CIMA DAS CASAS não, porque
   *o tabuleiro é a única superfície que nunca pode carregar moldura —
   ali o pixel é informação de jogo*; DENTRO DE UM PAINEL QUE SE ABRE
   não, porque "de quem é a vez?" pergunta-se várias vezes por turno, e
   *uma resposta atrás de um gesto é uma resposta que se deixa de
   procurar*.

   O rótulo NÃO é `ORDEM DE INICIATIVA`: é `agora: Halvard`. Se o
   trabalho da faixa é responder àquela pergunta, ela diz a resposta — e
   é a lei de que o sistema não fala de si mesmo, aplicada a um rótulo.
   ============================================================ */
function FaixaDaVez({ selos, rotulo, noTelefone }) {
  if (!selos.length) return null;
  const alto = noTelefone ? G.vezNoTelefone : G.vez;
  return (
    <div className="flex items-center gap-2 shrink-0 overflow-x-auto tv-scroll"
      style={{ height: alto, minHeight: alto }}>
      <span className="tv-mono text-[10px] shrink-0 pr-1" style={{ color: T.amberSoft, fontWeight: 600 }}>{rotulo}</span>
      {selos.map((s, i) => {
        const cor = s.agora ? T.amber : s.lado === "inimigo" ? T.danger : T.inkDim;
        return (
          <span key={`${s.nome}-${i}`}
            className="tv-mono text-[10px] flex items-center gap-1.5 shrink-0 rounded-lg px-2"
            style={{
              height: alto - 8,
              border: `${s.agora ? 1.5 : 1}px solid ${cor}`,
              background: s.agora ? T.panel : "transparent",
              color: s.agora ? T.amberSoft : T.ink,
              /* o selo do herói nunca sai da ponta esquerda: a única coisa
                 que ninguém pode ter de procurar rolando é a sua própria vez */
              position: s.heroi ? "sticky" : "static", left: 0, zIndex: s.heroi ? 2 : 1,
            }}>
            {/* círculo é aliado, losango é inimigo — o mesmo vocabulário de
                forma da marca de borda, e é o que diz QUEM sem gastar palavra */}
            <span aria-hidden="true" style={{
              width: 8, height: 8, background: cor,
              borderRadius: s.lado === "inimigo" ? 2 : 99,
              transform: s.lado === "inimigo" ? "rotate(45deg)" : "none",
            }} />
            <span className="truncate" style={{ maxWidth: 120 }}>{s.nome}</span>
            {s.agora && <PontoAtivo tamanho={7} cor={T.amber} />}
          </span>
        );
      })}
    </div>
  );
}

/* ============================================================
   A LINHA DO VEREDITO — sempre presente, nunca vazia, nunca balão

   Sobre o tabuleiro a Consequência é sempre LINHA: *quatro segundos de
   balão tapam exactamente as casas para onde o jogador ia andar.*

   E ela vive ENTRE O CAMPO E OS VERBOS, que é onde a mão NÃO está quando
   o polegar os prime (Apple HIG, `Adjusting for the finger`). É também a
   ordem de tabulação de E1 — campo → veredito → verbos — e, sendo ordem
   do DOM, É a ordem visual.

   É AQUI QUE A REAÇÃO DE K3 NASCE, e cresce PARA CIMA, ancorada em
   baixo: o topo do campo nunca se mexe e a câmara nunca se mexe.
   *Empurrar move as casas que o jogador estava a ler no exacto segundo
   em que ele tem de decidir depressa.* O terço de baixo da janela do
   campo é território emprestado, e nada desta tela depende de estar
   visível ali. */
function LinhaDoVeredito({ texto, armado, reacao }) {
  return (
    <div className="shrink-0" style={{ position: "relative" }}>
      {reacao && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "100%", zIndex: 40 }}>{reacao}</div>
      )}
      <div className="tv-mono text-[11px] flex items-center"
        aria-live="polite"
        style={{ minHeight: G.veredito, color: armado ? T.amberSoft : T.inkDim }}>
        {texto}
      </div>
    </div>
  );
}

/* ============================================================
   OS VERBOS — posições fixas, sempre os mesmos

   *Uma fileira que muda é uma fileira que se lê todo turno; uma que nunca
   muda aprende-se em duas lutas e usa-se sem olhar.* A LISTA NÃO NASCE
   AQUI: sai de `VERBOS_DE_COMBATE` (`golpe.js`) por `fileiraDeVerbos()`,
   que é a tabela onde X1 escreveu verbo a verbo qual deles chega a motor.

   `Atacar` é o primeiro entre iguais, e paga-se em LARGURA e TINTA, não
   em preenchimento cheio — W1 apanhou a armadilha com uma foto: em
   repouso o `Papel=Chamada` já é âmbar cheio, e ficava indistinguível do
   ARMADO, que é o estado que importa. **O âmbar cheio pertence ao que vai
   acontecer, não ao que é popular.**

   E o rótulo do armado é `onAccent`, e só `onAccent`: `ink` sobre `amber`
   dá 1,701:1 e reprova. É a armadilha escrita porque vai acontecer —
   quem clonar o botão de repouso e trocar só o fundo cai nela.

   `Habilidades (✦)` e a bolsa (`◆`) são GAVETAS, não verbos: são listas
   que variam por classe, nível e PM, e *lista nunca entra em fileira
   fixa* — no dia em que o mago aprende a sétima magia, a fileira deixa de
   ser fixa. `esperar` fica do outro lado de uma goteira, em Papel=Recuo.
   ============================================================ */
function Verbo({ v, armado, impedido, aoTocar }) {
  const recuo = v.papel === "recuo";
  return (
    <button
      /* O BOTÃO NÃO DECIDE, E ISTO CUSTOU UMA LUTA PARA SE VER. Ele
         fazia `if (!impedido) aoTocar()` — e com isso ENGOLIA o toque
         no verbo impedido: a regra que recusa e escreve a razão nunca
         chegava a correr, e a linha do veredito continuava a falar de
         outra coisa. A suíte provava a regra (ela está certa) e a tela
         nunca a chamava.

         Agora o toque passa SEMPRE, e quem decide é `tocarVerbo`, que
         é onde a tabela das recusas mora. O verbo continua impedido —
         nada acontece a não ser a razão aparecer —, e é essa a
         diferença entre um controle mudo e um que diz por que não.
         *Silêncio lê-se como «nada a dizer», nunca como «não dá».* */
      onClick={() => aoTocar()}
      /* `aria-disabled` E NAO `disabled`: um botao desativado sai da ordem
         de tabulacao, e quem navega por teclado ou ouve a tela deixa de
         saber que o verbo principal existe. Impedido ele continua a ser —
         o clique nao passa —, mas deixa de ser invisivel. */
      aria-disabled={impedido || undefined}
      aria-pressed={armado}
      /* O ANEL DE FOCO É DA FOLHA, e por isso `boxShadow` inline não entra
         aqui em circunstância nenhuma: estilo inline vence SEMPRE a folha,
         e o anel também é `box-shadow` — foi assim que a pílula da ficha
         apagou o seu anel em todos os estados sem ninguém notar (K4). */
      className="tv-anel-foco tv-mono text-[11px] rounded-lg px-3 flex items-center justify-center"
      style={{
        /* o alvo sai da tabela, nunca de aritmética de padding */
        minHeight: G.verbos, height: G.verbos,
        /* `Atacar` é o primeiro entre iguais, e paga-se na LARGURA — nunca
           no preenchimento, que pertence ao armado */
        flex: v.primeiro ? "1 1 0" : recuo ? "0 0 auto" : "0 1 auto",
        minWidth: v.primeiro ? 120 : 0,
        background: armado ? T.amber : T.panel,
        color: armado ? T.onAccent : recuo ? T.inkDim : T.ink,
        /* o armado HERDA o contorno do repouso do mesmo `Papel`: o traço é
           o que segura a largura, e tirá-lo encolheria o botão ao armar-se */
        border: `1px solid ${armado ? T.amber : recuo ? T.line : T.lineStrong}`,
        fontWeight: armado ? 600 : 400,
        opacity: impedido ? 0.45 : 1,
        position: "relative",
      }}>
      {v.rotulo}
      {/* o bico: um triângulo encostado à aresta de cima, a apontar para a
          linha do veredito. Não diz só "estou armado": diz "aquela linha é
          minha", que é o que faltava numa tela onde uma linha serve a
          fileira toda. */}
      {armado && (
        <span aria-hidden="true" style={{
          position: "absolute", top: -6, left: "50%", marginLeft: -6,
          width: 0, height: 0,
          borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
          borderBottom: `6px solid ${T.amber}`,
        }} />
      )}
    </button>
  );
}

function FileiraDeVerbos({ verbos, armado, impedidos, aoTocar, gavetaAberta, aoAbrirGaveta, bolsaAberta, aoAbrirBolsa, nBolsa }) {
  const gestos = verbos.filter((v) => v.papel !== "recuo");
  /* MAIS DE UM RECUO PODE VIVER AQUI: `esperar` e `fugir` são os dois
     "sair do turno sem golpe" — era `.find` quando só `esperar` existia,
     e um `.find` teria engolido um dos dois em silêncio no dia em que o
     segundo chegasse. */
  const recuos = verbos.filter((v) => v.papel === "recuo");
  return (
    <div className="shrink-0 flex items-stretch gap-2 flex-wrap" style={{ minHeight: G.verbos }}>
      {gestos.map((v) => (
        <Verbo key={v.id} v={v} armado={armado === v.id} impedido={!!impedidos[v.id]} aoTocar={() => aoTocar(v)} />
      ))}
      {/* AS DUAS GAVETAS — abrem lista, logo não são verbos */}
      <button onClick={aoAbrirGaveta} aria-pressed={gavetaAberta} title="Habilidades" aria-label="Habilidades"
        className="tv-anel-foco tv-mono text-[11px] rounded-lg px-3 inline-flex items-center justify-center" style={{
          minHeight: G.verbos, height: G.verbos, minWidth: ALVOS.piso,
          background: gavetaAberta ? T.violet : T.panel,
          color: gavetaAberta ? T.onSecond : T.violetSoft,
          border: `1px solid ${T.violet}`,
        }}><Glifo nome="faisca" tamanho={20} /></button>
      <button onClick={aoAbrirBolsa} aria-pressed={bolsaAberta} title="Bolsa" aria-label={nBolsa > 0 ? `Bolsa, ${nBolsa}` : "Bolsa"}
        className="tv-anel-foco tv-mono text-[11px] rounded-lg px-3 inline-flex items-center justify-center gap-1" style={{
          minHeight: G.verbos, height: G.verbos, minWidth: ALVOS.piso,
          background: bolsaAberta ? T.violet : T.panel,
          color: bolsaAberta ? T.onSecond : T.violetSoft,
          border: `1px solid ${T.violet}`,
        }}><Glifo nome="bolsa" tamanho={20} />{nBolsa > 0 ? nBolsa : null}</button>
      {/* a goteira, e depois os recuos — a posição do Recuo em toda a casa */}
      {recuos.length > 0 && (
        <span className="flex items-stretch gap-2" style={{ paddingLeft: G.goteira }}>
          {recuos.map((v) => (
            <Verbo key={v.id} v={v} armado={armado === v.id} impedido={!!impedidos[v.id]} aoTocar={() => aoTocar(v)} />
          ))}
        </span>
      )}
    </div>
  );
}

/* ============================================================
   A NARRAÇÃO — encolhida ao mínimo honesto, e nunca ausente

   A leitura literal de *"uma tela só com o grid"* mata a narração. A
   decisão do `desenho`, registada como decisão e não como pedido: **a
   narração fica.** A prosa é a protagonista — é a primeira frase do
   `CLAUDE.md` traduzida em interface.
   ============================================================ */
function AUltimaFala({ texto, carregando, noTelefone }) {
  return (
    <div className="shrink-0 overflow-hidden" style={{ maxHeight: noTelefone ? G.narracaoNoTelefone : G.narracao, paddingBottom: 4 }}>
      <p className="tv-body text-[15px]" style={{ color: T.ink, lineHeight: 1.625, margin: 0 }}>
        {carregando && !texto ? "" : texto}
      </p>
    </div>
  );
}

/* ---------------- O SELO DO MODIFICADOR (E4) ----------------
   O texto e o tom saem de `selo-de-estado.js`; aqui só se escolhe a tinta,
   que é a única coisa que um módulo puro não pode escolher.

   E A PALAVRA VEM SEMPRE JUNTA, nunca só a cor: é `DANO` contra `DANO
   SOFRIDO` que separa os dois vermelhos (WCAG 1.4.1, *Use of Color*).
   Um selo que dependesse da cor para dizer de que lado a conta pende
   seria ilegível exactamente para quem a cor não separa. */
function SeloDoModificador({ selo }) {
  const cor = selo.tom === "bom" ? T.ok : selo.tom === "perigo" ? T.danger : T.inkDim;
  return (
    <span className="tv-mono text-[10px] px-1.5 py-0.5 rounded shrink-0"
      style={{ border: `1px solid ${cor}`, color: cor, fontWeight: 600 }}>{selo.texto}</span>
  );
}

/* ---------------- A TIRA DO HERÓI — a ficha curta ----------------
   Informação, e não porta: durante a luta ela NÃO abre a ficha. Um
   controle que, tocado no meio de uma luta, ou não faz nada ou termina a
   luta, não pode estar na tela da luta — e abrir a bolsa inteira para
   arrumar é o exemplo do meio do critério.

   ============================================================
   E4 · NO TELEFONE ELA É UMA LINHA, E ISSO É REPOSIÇÃO, NÃO INVENÇÃO

   O quadro do telefone de E1 (40:447, no Figma desde 15/09) sempre teve
   o herói resolvido numa tira de 44 px. A construção de E3 empilhou duas
   `A ficha curta` — que é peça de MESA, 288×150 — e ficou com 144,
   deixando 296 px de campo: 30 casas inteiras de 196, 15 % do tabuleiro.

   E a decisão não é "esconder numa gaveta", é ESVAZIAR — porque o `jogo`
   contou a carga item a item e TRÊS DE SETE campos já estavam no ecrã no
   mesmo instante: o meu nome (na minha ficha do campo, rotulada
   "você"), o nome dele (na ficha dele) e a distância (na linha do
   veredito, que a escreve com o "faltam"). *Uma tira 43 % duplicada não
   se esconde numa gaveta: esvazia-se.*

   O que fica é o que não tem outra casa: PV, PM, a economia da rodada,
   os modificadores do motor (E4 §6) e a vida do adversário em NÚMERO —
   porque à volta da ficha, a 48 px, ela é um arco e lê-se como fracção,
   nunca como quanto falta.

   Medido: campo 296 → 436 px = 9,08 filas; casas inteiras 30 → 48, de
   15 % para 24 % do tabuleiro. E o tecto fica escrito, porque buraco
   calado é mentira: 24 % ainda não é um tabuleiro, e os outros 76 %
   pedem a escala da casa, que está com a pessoa e não se toca. */
function TiraDoHeroi({ personagem, economia, acaoBonus, selos = [], adversario = null, umaLinha = false }) {
  const grave = personagem.vidaMax > 0 && personagem.vida / personagem.vidaMax <= 1 / 3;
  const eco = economia || { acao: 1, extra: 1 };
  /* o que sobra da rodada. Uma pílula acesa sem número faria a segunda
     ação existir só para quem leu o código; e quem não tem ação bônus não
     vê a pílula dela — mostrar um recurso permanentemente riscado ensina a
     regra errada. */
  const chip = (ativo, glifo, rotulo) => (
    <span key={glifo + rotulo} className="tv-mono text-[9px] px-1.5 py-0.5 rounded inline-flex items-center gap-1"
      style={{ border: `1px solid ${ativo ? T.amber : T.line}`, color: ativo ? T.amberSoft : T.inkDim, opacity: ativo ? 1 : 0.45, textDecoration: ativo ? "none" : "line-through" }}><Glifo nome={glifo} tamanho={12} />{rotulo}</span>
  );
  /* A LINHA DO TELEFONE. O nome NÃO entra: ele está na ficha do campo,
     rotulada "você", no mesmo instante. E ela ROLA na horizontal em vez
     de quebrar — uma tira que quebra deixa de ter 44 px e volta a comer
     o campo, que é o defeito inteiro que ela veio pagar. */
  if (umaLinha) {
    return (
      <div className="flex items-center gap-2 shrink-0 overflow-x-auto tv-scroll px-1"
        style={{ height: G.tiraDoHeroi, minHeight: G.tiraDoHeroi }}>
        <span className="tv-mono text-[11px] shrink-0" style={{ color: grave ? T.danger : T.amberSoft, fontWeight: 700 }}>
          PV {Math.max(0, personagem.vida || 0)}/{personagem.vidaMax || 0}
        </span>
        {personagem.manaMax > 0 && (
          <span className="tv-mono text-[11px] shrink-0" style={{ color: T.violetSoft }}>
            PM {Math.max(0, personagem.mana || 0)}/{personagem.manaMax}
          </span>
        )}
        {chip(eco.acao > 0, "espadas", eco.acao > 1 ? `×${eco.acao}` : "")}
        {eco.extra != null && (eco.extra > 0 || acaoBonus) && chip(eco.extra > 0, "faisca", "")}
        {selos.map((x) => <SeloDoModificador key={x.id} selo={x} />)}
        {adversario && (
          /* a vida dele em NÚMERO: à volta da ficha, a 48 px, ela é um
             arco e lê-se como fracção, nunca como quanto falta */
          <span className="tv-mono text-[11px] shrink-0 pl-2" style={{ color: T.danger, borderLeft: `1px solid ${T.line}` }}>
            {adversario.nome} {Math.max(0, adversario.vida || 0)}/{adversario.vidaMax || 0}
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-xl px-2.5 py-2 shrink-0"
      style={{ background: T.panel, border: `1px solid ${grave ? T.danger : T.line}` }}>
      <Retrato semente={sementeDe(personagem)} ente={personagem} semCarta tamanho={40}
        anel={grave ? T.danger : T.amber} estado={estadoDe(personagem.vida, personagem.vidaMax)} />
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="tv-display text-base truncate flex-1 min-w-0" style={{ color: T.ink }}>{personagem.nome}</span>
          {chip(eco.acao > 0, "espadas", eco.acao > 1 ? `ação ×${eco.acao}` : "ação")}
          {eco.extra != null && (eco.extra > 0 || acaoBonus) && chip(eco.extra > 0, "faisca", "extra")}
        </div>
        <BarraMini rotulo="PV" atual={personagem.vida} max={personagem.vidaMax} cor={grave ? T.danger : T.amber} corBaixa={T.danger} />
        {personagem.manaMax > 0 && <BarraMini rotulo="PM" atual={personagem.mana} max={personagem.manaMax} cor={T.violetSoft} />}
        {/* OS MODIFICADORES DO MOTOR (E4). `mecanicaDe` devolve sete
            campos que mexem num número e a tela desenhava quatro — e os
            quatro estavam FORA da luta, porque a tela da batalha esconde
            o HUD inteiro. `Enfraquecido` bate −2 e `Marcado` apanha +2, e
            nenhum dos dois tinha canal nenhum aqui dentro. */}
        {selos.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {selos.map((x) => <SeloDoModificador key={x.id} selo={x} />)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- O QUE OS DADOS DISSERAM ----------------
   Contabilidade, e por isso fica na consulta e não na linha do turno. */
function ORastroDosDados({ linhas }) {
  if (!linhas.length) return null;
  return (
    <div className="rounded-xl p-2 shrink-0" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
      {linhas.map((l, i) => (
        <div key={i} className="tv-mono text-[10px]" style={{ color: T.inkDim, opacity: 0.5 + (0.5 * (i + 1)) / linhas.length }}><Glifo nome="dado" tamanho={14} /> {l}</div>
      ))}
    </div>
  );
}

/* ---------------- QUEM ESTÁ DE PÉ ----------------
   Os dois lados na mesma tira, porque a pergunta é uma só: quem aguenta
   e quem cai. Fichas completas e bolsa inteira ficam de fora. */
function QuemEstaDePe({ grupo, inimigos, veredito }) {
  return (
    <div className="rounded-xl p-2 shrink-0" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
      <div className="flex flex-col gap-1.5">
        {grupo.map((g, gi) => {
          const pv = Math.max(0, g.vida || 0), pvMax = Math.max(1, g.vidaMax || 1);
          const caido = pv <= 0;
          const critico = !caido && pv / pvMax <= 1 / 3;
          return (
            <div key={`${g.nome}-${gi}`} className="flex items-center gap-2 rounded-lg px-2 py-1"
              style={{ background: T.panel, border: `1px solid ${critico ? T.danger : T.line}`, opacity: caido ? 0.5 : 1 }}>
              <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 99, background: caido ? T.inkDim : T.ok }} />
              <span className="tv-body text-[12px] truncate flex-1 min-w-0" style={{ color: caido ? T.inkDim : T.ink }}>{g.nome}</span>
              <span className="tv-mono text-[10px]" style={{ color: caido ? T.inkDim : critico ? T.danger : T.ok }}>{pv}/{pvMax}</span>
            </div>
          );
        })}
        {inimigos.map((e, i) => {
          const vz = ((veredito && veredito.alvos) || []).find((x) => x.nome === e.nome);
          return (
            <div key={`i${i}`} className="flex items-center gap-2 rounded-lg px-2 py-1"
              style={{ background: T.panel, border: `1px solid ${e.derrotado ? T.line : T.danger}`, opacity: e.derrotado ? 0.5 : 1 }}>
              <div style={{ filter: e.derrotado ? "grayscale(1)" : "none" }}>
                <Retrato semente={sementeDe(e)} ente={e} inimigo tamanho={28}
                  anel={e.derrotado ? T.line : T.danger} estado={estadoDe(e.vida, e.vidaMax, true)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="tv-body text-[12px] truncate" style={{ color: e.derrotado ? T.inkDim : T.ink, textDecoration: e.derrotado ? "line-through" : "none" }}>{e.nome}</span>
                  {(e.gd || 0) > 0 && <span className="tv-mono text-[9px]" title={tituloDe(e.gd)} style={{ color: T.amber }}>GD {e.gd}</span>}
                </div>
                {!e.derrotado && <BarraMini rotulo="PV" atual={e.vida} max={e.vidaMax} cor={T.danger} corBaixa={T.danger} />}
              </div>
              {vz && !e.derrotado && (
                <span className="tv-mono text-[10px] shrink-0" style={{ color: vz.ok ? T.amberSoft : T.inkDim }}>
                  {metrosTxt(vz.distanciaM)} m
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- OS ALVOS DECLARADOS ----------------
   Vem inteiro da tela antiga, e continua a DECLARAR alvo: não dispara
   nada, e não passou a disparar. O que é alvo tem o custo escrito dentro,
   e as duas recusas ficam separadas na própria pílula — porque andar
   resolve uma e não resolve a outra. */
function AlvosDeclarados({ inimigos, nGolpes, alvosGolpe, aoDeclarar, aoLimpar, acaoTexto, veredito }) {
  const vivos = inimigos.filter((e) => !e.derrotado && Number(e.vida || 0) > 0);
  if (vivos.length <= 1) return null;
  return (
    <div className="rounded-xl p-2.5 shrink-0" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.amberSoft }}>
          {nGolpes > 1 ? `Declare seus ${nGolpes} golpes` : "Escolha o alvo"}{acaoTexto ? ` · ${acaoTexto}` : ""}{veredito ? ` · seu alcance ${metrosTxt(veredito.alcanceM)} m` : ""}
        </span>
        {alvosGolpe.length > 0 && (
          <button onClick={aoLimpar} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>limpar</button>
        )}
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: nGolpes }).map((_, gi) => (
          <div key={gi} className="flex items-center gap-1.5 flex-wrap">
            <span className="tv-mono text-[9px] shrink-0 w-12" style={{ color: T.inkDim }}>{nGolpes > 1 ? `golpe ${gi + 1}` : "alvo"}</span>
            {vivos.map((e) => {
              const escolhido = alvosGolpe[gi] === e.nome;
              const vz = ((veredito && veredito.alvos) || []).find((x) => x.nome === e.nome);
              const fora = !!vz && !vz.ok;
              return (
                <button key={e.nome} onClick={() => aoDeclarar(gi, escolhido ? null : e.nome)}
                  className="tv-mono text-[9px] px-2 py-1 rounded-lg"
                  style={{ background: escolhido ? T.danger : "transparent", color: escolhido ? T.ink : fora ? T.inkDim : T.ink, border: `1px ${fora ? "dashed" : "solid"} ${escolhido ? T.danger : T.line}` }}>
                  {e.nome}{vz ? ` · ${metrosTxt(vz.distanciaM)} m` : ""}{fora ? (vz.razao === "parede" ? " · parede" : " · longe") : ""}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- A BOLSA — e usar não gasta o turno ---------------- */
function BolsaDeCombate({ pocoes, bolsa, aoUsar }) {
  if (!pocoes.length && !bolsa.length) return null;
  return (
    <div className="rounded-xl p-2 shrink-0" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
      <div className="tv-mono text-[9px] uppercase tracking-widest mb-1.5" style={{ color: T.violetSoft }}>à mão · não gasta o turno</div>
      <div className="flex flex-col gap-1">
        {(bolsa.length ? bolsa : pocoes).map((it) => (
          <button key={it.nome} onClick={() => aoUsar && aoUsar(it.nome)}
            className="flex items-center gap-2 text-left rounded-lg px-2 py-1.5"
            style={{ background: T.panel, border: `1px solid ${T.line}` }}>
            <span className="tv-mono text-sm shrink-0">{it.icone}</span>
            <span className="flex-1 min-w-0">
              <span className="tv-mono text-[11px] block truncate" style={{ color: T.ink }}>{it.nome}{it.qtd > 1 ? ` ×${it.qtd}` : ""}</span>
              <span className="tv-mono text-[9px] block truncate" style={{ color: T.inkDim }}>{it.detalhe}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   A TELA
   ============================================================ */
export function TelaDeBatalha(props) {
  const p = props == null ? {} : props;
  const combate = p.combate || {};
  const personagem = p.personagem || {};
  const grupo = Array.isArray(p.grupo) ? p.grupo : [];
  const inimigos = Array.isArray(combate.inimigos) ? combate.inimigos : [];
  const vd = p.veredito || null;

  /* O VERBO ARMADO. Mora aqui e não no `App.jsx` de propósito: armar
     NUNCA GASTA — `vereditoDoGolpe` é pergunta e não acto —, logo é
     estado de tela e não de jogo, e um estado de tela que sobe ao App é
     um estado que o autosave um dia grava. */
  const noTelefone = usarTelefone();
  const [armado, setArmado] = React.useState("");
  const [bolsaAberta, setBolsaAberta] = React.useState(false);
  /* quantas casas o passo acende — `null` é "ainda não medido", e nesse
     estado nada se impede: um verbo impedido por falta de medida é a
     tela a mentir ao contrário */
  const [casasDoPasso, setCasasDoPasso] = React.useState(null);
  /* a razão do verbo que recusou armar, a caminho da linha do veredito.
     É estado de TELA e não de jogo: ela responde ao último toque, e o
     último toque não se guarda em save nenhum. */
  const [recusado, setRecusado] = React.useState("");

  /* `Esc` desarma: é uma das TRÊS saídas de W1. As outras duas são tocar
     o verbo outra vez e tocar o campo — esta última é a única que existe
     no telefone, onde não há teclado, e vive no `onPointerDown` da janela
     do campo. E andar desarma como CONSEQUÊNCIA, não como efeito
     colateral: andar muda o alcance, logo a mira anterior deixou de
     valer de qualquer maneira. */
  /* A RAZÃO MORRE COM A RODADA. "o seu passo acabou nesta rodada" é
     verdade sobre UMA rodada; deixá-la na linha depois da virada seria a
     linha do veredito a falar do passado, que é exactamente o que ela
     não é. */
  React.useEffect(() => { setRecusado(""); }, [combate.rodada]);

  /* O FIM ESVAZIA O CAMPO — JOGADO NO R21: fugir, todos caírem ou o
     Mestre encerrar a luta são a mesma transição por fora, e um verbo
     pode ter deixado a FRASE ARMADA no campo (`Fugir` preenche "Viro as
     costas e fujo da luta, correndo o quanto posso" assim que se toca
     nele uma vez). Essa frase não é mais o PRÓXIMO turno — é o turno que
     ACABOU DE ACONTECER. Medido: ela sobrevivia no campo, aberto a
     138 px com `Agir →`, e a página caía 146 px no telefone; um Enter
     ali mandaria fugir de uma luta que já não existe. Os três fins
     (fuga, `fecharSeTodosCairam`, o Mestre a declarar) chegam todos pelo
     MESMO sinal — `p.fim` vira `true` — e por isso ficam resolvidos no
     mesmo ponto, uma vez só. */
  React.useEffect(() => {
    if (!p.fim) return;
    setArmado(""); setRecusado("");
    if (p.aoEscrever) p.aoEscrever("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.fim]);

  React.useEffect(() => {
    if (!armado) return undefined;
    const ouve = (e) => { if (e.key === "Escape") setArmado(""); };
    window.addEventListener("keydown", ouve);
    return () => window.removeEventListener("keydown", ouve);
  }, [armado]);

  /* ============================================================
     O ENQUADRAMENTO — as três regras de E1, e a primeira é lei

     1. QUANDO A LUTA ABRE, A CASA DO HERÓI ESTÁ NO CENTRO DA ÁREA LIVRE.
        A área livre, e não o centro geométrico: o terço de baixo da
        janela é território emprestado à reação, e é também a faixa que o
        próprio polegar tapa. *Um tabuleiro que rola e abre no lugar
        errado é pior do que um que não rola* — e era exatamente o que
        acontecia: `scrollTop = 0`, o herói em F16 a 874 px, abaixo da
        janela E do ecrã, sem nada a dizer que ele existia.

     2. A CÂMARA SÓ SE MOVE QUANDO É OBRIGADA — reenquadra quando quem age
        chegaria a menos de UMA casa da borda, nunca a cada passo. *Uma
        câmara que corrige todo passo faz o campo parecer escorregar
        debaixo do jogador.*

     3. NA VEZ DE UM INIMIGO A CÂMARA NÃO VAI ATRÁS. Aqui isso sai de
        graça, e é por construção: este efeito só escuta a casa do HERÓI.
        O que falta da regra 3 é a outra metade — a marca na borda com o
        nome e a distância —, e essa fica para E4.

     Os dois números saem da tabela: a reserva (um terço) diz onde é a
     área livre, e a folga (uma casa) diz quando a câmara é obrigada. */
  const janelaRef = React.useRef(null);
  const heroi = combate.heroi || null;
  const casaDoHeroi = heroi && heroi.x != null ? `${heroi.x},${heroi.y}` : "";
  React.useEffect(() => {
    if (!casaDoHeroi) return undefined;
    /* DUAS BATIDAS DE ATRASO, E ELAS SÃO O CONSERTO. Medido: na primeira
       passagem a janela já existe mas o campo ainda não tem tamanho, e um
       `scrollTo` sobre conteúdo de altura zero não faz nada — em silêncio.
       Foi assim que o enquadramento nasceu escrito e morto: suíte verde,
       varredor verde, e o herói a 603 px numa janela de 592. */
    let vivo = true;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => { if (vivo) enquadrar(); }));
    const enquadrar = () => {
    const el = janelaRef.current;
    if (!el || !el.clientHeight) return;
    try {
      const lado = ALVOS.piso;
      const [hx, hy] = casaDoHeroi.split(",").map(Number);
      /* o centro da área livre: a reserva é emprestada, logo o que sobra
         é (1 − reserva), e o herói fica no meio disso */
      const meio = (1 - G.reservaDaReacao) / 2;
      const alvoX = Math.max(0, (hx + 0.5) * lado - el.clientWidth * 0.5);
      const alvoY = Math.max(0, (hy + 0.5) * lado - el.clientHeight * meio);
      /* REGRA 2: obrigada, ou não mexe. Obrigada = o herói está a menos de
         uma casa de qualquer borda da janela — inclusive fora dela, que é
         o caso da abertura. */
      const px = (hx + 0.5) * lado - el.scrollLeft;
      const py = (hy + 0.5) * lado - el.scrollTop;
      const folga = G.folgaDaBorda * lado;
      const apertado = px < folga || py < folga
        || px > el.clientWidth - folga || py > el.clientHeight - folga;
      if (!apertado) return;
      el.scrollTo({ left: alvoX, top: alvoY, behavior: "auto" });
    } catch { /* um enquadramento que estoura não pode custar o turno */ }
    };
    return () => { vivo = false; cancelAnimationFrame(id); };
  }, [casaDoHeroi, noTelefone]);

  const verbos = fileiraDeVerbos();
  const selos = faixaDaVez(combate, personagem.nome);
  const dePe = inimigos.filter((e) => !e.derrotado).length;

  /* OS MODIFICADORES QUE O MOTOR CALCULA E A TELA ESCONDIA (E4).
     `mecanicaDe` devolve sete campos que mexem num número; a fila de
     pílulas do HUD desenhava quatro, e os quatro estavam FORA da luta,
     porque a tela da batalha esconde o HUD inteiro. `Enfraquecido` bate
     −2 (e H4 acabou de pagar para esse número contar certo) e `Marcado`
     apanha +2 — e o único canal dele era o `title=` da condição, que é
     balão de rato e no telefone não existe. */
  const modificadores = (() => {
    try { return selosDaMecanica(mecanicaDe(personagem.condicoes || [])); }
    catch { return []; }
  })();

  /* O ADVERSÁRIO DA TIRA DO TELEFONE: o mais perto que ainda está de pé,
     que é aquele sobre quem a linha do veredito está a falar. Um só —
     uma linha de 44 px com quatro nomes é a planilha outra vez, e quem
     precisa da lista inteira tem as fichas no campo e os alvos
     declarados. A distância sai do veredito, que já a mediu. */
  const adversario = (() => {
    try {
      const vivos = inimigos.filter((e) => !e.derrotado && Number(e.vida || 0) > 0);
      if (!vivos.length) return null;
      const alvos = (vd && vd.alvos) || [];
      const perto = [...vivos].sort((a, b) => {
        const da = (alvos.find((x) => x.nome === a.nome) || {}).distanciaM;
        const db = (alvos.find((x) => x.nome === b.nome) || {}).distanciaM;
        return (da == null ? Infinity : da) - (db == null ? Infinity : db);
      })[0];
      return perto || null;
    } catch { return null; }
  })();

  /* QUEM ESTÁ IMPEDIDO, E POR QUÊ — e a razão vem em vez do booleano,
     porque a tela tem de poder DIZÊ-LA sem a inventar. O `Atacar` é
     impedido quando ninguém está ao alcance (a metade que evita o "longe
     demais" dez vezes seguidas na abertura de toda luta); o `Mover`
     quando o conjunto que ele armaria é vazio — o defeito que o `jogo`
     apanhou a jogar, e que passa a ser COMUM no dia em que o passo
     debita, porque toda rodada acaba com ele a zero. */
  const impedidos = impedimentosDaFileira({
    algumAoAlcance: vd ? !!vd.algumAoAlcance : true,
    bloqueado: !!p.bloqueado,
    podeAndar: podeDarUmPasso(p.passoM, p.passoTotal),
    casasDoPasso,
    fim: !!p.fim,
    razaoDaFuga: p.podeFugir ? "" : (p.linhaDaFuga || ""),
    /* ACHADO EM 24/09: um save a 0 PV e "morrendo" deixava `Atacar` de pé,
       escolhendo alvo e acertando golpe — o sistema diz ao Narrador que o
       herói "não vê, não ouve e não age" (App.jsx, `resolverQueda`) e a
       fileira dizia o contrário. `esperar` continua fora desta conta —
       é ele que faz a rodada do mundo (e o teste de morte) rodar de novo. */
    inconsciente: (personagem.vida || 0) <= 0 || !!personagem.morrendo,
  });

  /* FUGIR NÃO PASSA PELA LINHA GENÉRICA DO ARMADO. Os outros verbos que
     armam fazem uma PERGUNTA ("toque a casa", "diga em quem"), e a saída
     universal é "toque outra vez para desistir". Fugir não pergunta nada
     — mostra o PREÇO de sair (`linhaDaFuga`, já medido pelo App com
     `fuga.js`), e tocar de novo não desiste, EXECUTA. Misturar as duas
     seria ou esconder o preço atrás de uma pergunta que não existe, ou
     dizer "para desistir" no botão que vai fazer o oposto. */
  const linha = armado === "fugir"
    ? linhaFugaArmada(p.linhaDaFuga)
    : vereditoDaTela({
    armado,
    recusaDoVerbo: recusado,
    /* O PREÇO DA FRASE DE FUGA (R21) já vem pronto do App — `p.precoDaFuga`
       só existe enquanto o campo casa `ehFuga` e a luta está aberta. Ganha
       da linha e da recusa do golpe porque, se o Enter vai fugir, mostrar
       o preço de atacar prometeria um turno que não vai acontecer. */
    precoDaFuga: p.precoDaFuga || "",
    linha: !armado && vd && vd.algumAoAlcance ? p.linhaDoGolpe : "",
    recusa: !armado && vd && !vd.algumAoAlcance ? p.recusaDoGolpe : "",
    rodada: combate.rodada || 1,
    dePe,
    /* O FIM PELA FUGA (R21): `p.fugiu` só chega `true` no instante em que
       a tela mostra o cartão de saída — a mesma luta que `fimDaLuta`
       segura no App para o jogador ler o último golpe. */
    fugiu: !!p.fugiu,
  });

  const fala = ultimasLinhasDoMestre(p.mensagens, {
    linhas: noTelefone ? NARRACAO.linhasNoTelefone : NARRACAO.linhas,
    chars: noTelefone ? NARRACAO.charsPorLinhaNoTelefone : NARRACAO.charsPorLinha,
  });

  const tocarVerbo = (v) => {
    /* O VERBO QUE NÃO PODE ARMAR RECUSA, E A LINHA DIZ PORQUÊ. Antes ele
       aceitava o toque, ficava `aria-pressed=true` e a linha mandava
       "toque a casa onde quer parar" sem casa nenhuma para tocar — a
       linha que E3 elogiou como o melhor da tela era, neste estado, a
       que mentia. */
    const razao = impedidos[v.id];
    if (razao) { setArmado(""); setRecusado(razao); return; }
    setRecusado("");
    if (v.id === "atacar") { setArmado(""); if (p.aoAtacar) p.aoAtacar(); return; }
    if (armado === v.id) {
      if (v.id === "fugir") { setArmado(""); if (p.aoFugir) p.aoFugir(); return; }
      setArmado(""); if (p.aoEscrever) p.aoEscrever("");
      return;
    }
    setArmado(v.id);
    /* o verbo que arma põe a sua frase na linha do texto livre: o jogador
       acrescenta o COMO e manda pela mesma porta de sempre. A frase sai da
       tabela de `golpe.js`, nunca de uma string montada aqui. */
    if (v.frase && p.aoEscrever) p.aoEscrever(v.frase.endsWith(" ") ? v.frase : `${v.frase} `);
    if (v.id === "esperar" && p.aoAgir) { setArmado(""); p.aoAgir(v.frase); }
  };

  /* andar desarma, e é a terceira saída */
  const mover = (destino) => { setArmado(""); setRecusado(""); if (p.aoMover) p.aoMover(destino); };

  const campo = (
    <section className="flex flex-col min-h-0 min-w-0 w-full"
      style={{ flex: `1 1 ${G.campo}px`, maxWidth: G.campo, gap: 4 }}>
      <FaixaDaVez selos={selos} rotulo={rotuloDaVez(selos)} noTelefone={noTelefone} />
      {/* A JANELA SOBRE O CAMPO: a casa mede 48 e quem cede é a janela.
          O rolamento é desta caixa, e nunca do log — é a inversão.

          E O TOQUE NO CAMPO DESARMA: é a terceira saída de W1, a única
          que existe no telefone, onde não há `Esc`. Vive aqui e não na
          casa porque a casa fora do alcance não tem ouvinte nenhum —
          transformar as 84 casas em botões de cancelar seria dar
          significado a 84 alvos para uma ação que já tem dois. */}
      <div ref={janelaRef} className="flex-1 min-h-0 min-w-0 overflow-auto tv-scroll"
        onPointerDown={() => setArmado("")}>
        <GridDeBatalha combate={combate} grupo={grupo} heroiFicha={personagem}
          previsao={p.previsao} passoM={p.passoM} passoTotal={p.passoTotal}
          /* o 1,5 escrito à mão saiu: o menor passo que este tabuleiro
             sabe mostrar mora em `PASSO_NA_RODADA.minimo`, e quem o lê
             é `podeDarUmPasso` */
          ignoraDificil={p.ignoraDificil} podeMover={podeDarUmPasso(p.passoM, p.passoTotal) && !p.fim} onMover={mover}
          mira={p.mira} onMirar={p.aoMirar} alcanceMira={p.alcanceMira}
          aoMedirOPasso={setCasasDoPasso}
          ladoFixo={ALVOS.piso} />
      </div>
      <LinhaDoVeredito texto={linha} armado={!!armado} reacao={p.reacao} />
      {p.fim ? (
        /* A SAÍDA É CONFIRMADA, E SÓ NO FIM. Durante a luta não há porta
           nenhuma — o motivo é medido: o `⛺` encerrou uma luta por engano
           numa partida de verdade. Uma porta a menos durante, uma porta a
           mais depois. */
        <button onClick={p.aoSair} className="tv-anel-foco tv-display text-lg rounded-lg w-full"
          style={{ minHeight: ALVOS.piso, background: T.amber, color: T.onAccent, fontWeight: 600 }}>
          Respirar fundo →
        </button>
      ) : (
        <FileiraDeVerbos verbos={verbos} armado={armado} impedidos={impedidos}
          aoTocar={tocarVerbo}
          gavetaAberta={!!p.gavetaAberta} aoAbrirGaveta={p.aoAbrirGaveta}
          bolsaAberta={bolsaAberta} aoAbrirBolsa={() => setBolsaAberta((v) => !v)}
          nBolsa={(p.bolsa || []).length} />
      )}
      {p.gaveta}
      {/* O TEXTO LIVRE muda de papel: deixa de ser a sintaxe obrigatória e
          vira o tempero. O convite é `como? (opcional)`, e ele NUNCA é
          `disabled` enquanto há um verbo armado — escrever e mirar são
          compatíveis, e é esse o ponto inteiro. */}
      <div className="flex items-center gap-2 rounded-lg px-2 shrink-0"
        style={{ minHeight: G.textoLivre, background: T.bg, border: `1.5px solid ${armado ? T.amber : T.line}` }}>
        <input value={p.entrada || ""} onChange={(e) => p.aoEscrever && p.aoEscrever(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && p.aoAgir) { setArmado(""); p.aoAgir(p.entrada); } }}
          placeholder={armado ? PEDIDO_DO_VERBO[armado] || "como? (opcional)" : "como? (opcional)"}
          disabled={!armado && !!p.bloqueado}
          className="tv-anel-foco flex-1 bg-transparent tv-body text-[15px] px-2 min-w-0" style={{ color: T.ink }} />
        <button onClick={() => { setArmado(""); if (p.aoAgir) p.aoAgir(p.entrada); }}
          disabled={!!p.bloqueado || !String(p.entrada || "").trim()}
          className="tv-anel-foco tv-mono text-[11px] rounded-lg px-3"
          style={{ minHeight: G.veredito + 8, background: T.amber, color: T.onAccent, opacity: (p.bloqueado || !String(p.entrada || "").trim()) ? 0.4 : 1 }}>
          Agir →
        </button>
      </div>
      {p.dado}
    </section>
  );

  const lateral = (
    <aside className="flex flex-col gap-2 min-h-0 min-w-0 shrink-0 overflow-y-auto tv-scroll"
      style={{ flex: "0 0 auto", width: "100%", maxWidth: noTelefone ? "100%" : G.lateral,
        /* E4 · O TECTO DO TELEFONE DEIXA DE SER O ARCO E PASSA A SER A
           TIRA. Era `arcoDoPolegar` (144) — o número certo para «o que uma
           tira de tela pode ocupar sem comer a decisão», e errado para
           esta tira, que passou a ser UMA LINHA. Com 44 px o campo sobe de
           296 para 436, que são 9,08 filas contra 6,17: de 30 casas
           inteiras para 48, de 15 % do tabuleiro para 24 %.

           A NOTA DE E3 ABAIXO FICA, e o que ela previa aconteceu — só que
           pela outra porta: «ou a consulta vira gaveta no telefone, ou as
           doze filas eram de um orçamento sem tira de consulta nenhuma».
           Não virou gaveta: esvaziou-se. Uma gaveta teria guardado o que
           já estava no ecrã.

           E O TECTO FICA ESCRITO: 24 % ainda não é um tabuleiro. Os
           outros 76 % pedem a escala da casa, que está com a pessoa.

           (o texto de E3, como ele estava:)
           NO TELEFONE A CONSULTA CABE NUM ARCO DE POLEGAR, e rola dentro de
           si — o campo é que não pode encolher. O número é o do arco (144)
           porque é a única medida da tabela que já significa "o que uma
           tira de tela pode ocupar sem comer a decisão"; qualquer outro
           seria um número novo sem conta por trás.

           E FICA ESCRITO O QUE ELE CUSTA, porque buraco calado é mentira:
           mesmo assim o campo mostra SEIS filas no telefone, e não as doze
           que E2 mediu. As doze nunca foram alcançáveis com a mobília que
           E1 especifica — 812 menos a narração (28), a faixa da vez (48), a
           linha do veredito (24), três fileiras de verbos (144), o texto
           livre (44), os respiros e a régua do campo deixam ~370 px, que
           são 7 filas, e a tira de consulta come a sétima. É a etapa E4 que
           herda isto: ou a consulta vira gaveta no telefone, ou as doze
           filas eram de um orçamento sem tira de consulta nenhuma. */
        maxHeight: noTelefone ? G.tiraDoHeroi : "100%" }}>
      <TiraDoHeroi personagem={personagem} economia={combate.economia} acaoBonus={p.acaoBonus}
        selos={modificadores} adversario={noTelefone ? adversario : null} umaLinha={noTelefone} />
      {/* OS ALVOS DECLARADOS E A BOLSA FICAM NOS DOIS TAMANHOS: são
          CONTROLES, e um controle que desaparece no telefone é função
          que o telefone não tem. Os dois já só nascem quando há o que
          declarar (mais de um inimigo) e quando a bolsa está aberta. */}
      <AlvosDeclarados inimigos={inimigos} nGolpes={p.nGolpes || 1} alvosGolpe={p.alvosGolpe || []}
        aoDeclarar={p.aoDeclararAlvo} aoLimpar={p.aoLimparAlvos} acaoTexto={p.acaoTexto} veredito={vd} />
      {/* E ESTAS DUAS SÃO CONSULTA, e é delas que o telefone se desfaz:
          `QuemEstaDePe` repete o nome e a vida que já estão nas fichas do
          campo e, agora, na tira; o rastro dos dados é contabilidade. No
          monitor não custam nada — há 344 px de coluna à espera. No
          telefone custavam 144 px de campo, que são 18 casas. */}
      {!noTelefone && <QuemEstaDePe grupo={grupo} inimigos={inimigos} veredito={vd} />}
      {bolsaAberta && <BolsaDeCombate pocoes={p.pocoes || []} bolsa={p.bolsa || []} aoUsar={p.aoUsarConsumivel} />}
      {!noTelefone && <ORastroDosDados linhas={Array.isArray(combate.log) ? combate.log : []} />}
    </aside>
  );

  return (
    <div className="flex-1 min-h-0 min-w-0 flex flex-col" style={{ background: T.bg, padding: G.respiro, gap: 4 }}>
      <AUltimaFala texto={fala} carregando={p.carregando} noTelefone={noTelefone} />
      {/* DUAS COLUNAS no monitor. No telefone, uma — e a lateral fica ACIMA
          do campo (`flex-col-reverse`), porque os controles vivem no arco do
          polegar e o campo por cima deles; a lateral continua vizinha do
          campo nos dois arranjos, que é a regra da recomposição. */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col-reverse md:flex-row md:justify-center"
        style={{ gap: G.goteira }}>
        {campo}
        {lateral}
      </div>
    </div>
  );
}
