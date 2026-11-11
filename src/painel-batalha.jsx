/* ============================================================
   A TELA DA BATALHA (E3 → B1) — o quadro da pessoa, construído

   B1 (05/10): a tela passa a ser a que a pessoa desenhou em
   `ffWFqD7TueSb88Mkeg9bhW`, quadro `151:1662` · "Taverna · Batalha na
   areia solta" (1600 × 1001). A régua é a da v3: IGUAL AO FIGMA, COM
   DADOS REAIS DO JOGO — cada coisa do quadro tem a sua fonte escrita em
   `mente/formas.md` (B1), e nada aqui inventa número, regra ou imagem.
   Três faixas: a cena e o turno em cima; à esquerda o campo de batalha e
   a sua próxima ação; à direita o turno atual, quem está nesta batalha e
   o foco da escolha.

   A CONDIÇÃO DE ENTRADA, e é ela que faz esta casa existir (E3): até ali
   o tabuleiro era FILHO DO ROLADOR DO LOG. `PainelCombate` era montado
   dentro do `<div ref={areaRef}>` do `App.jsx`, depois de todas as
   mensagens — logo abria, por construção, 429 px abaixo da borda, com
   `scrollTop = 0` de 1129 possíveis. *"Os 429 px não são altura, são
   arquitetura. Nenhum ajuste de altura resolve; só a inversão resolve."*
   A inversão continua: quando há luta, a tela da luta É a tela — irmã do
   log, nunca filha dele.

   A GEOMETRIA SAI DE TABELA: `MESA_DE_BATALHA` (`estilo.js`) tem as
   medidas do quadro B1 (32 + campo + 24 + 328 + 32 = 1600); o que E1
   decidiu e B1 não mudou — o piso do veredito, a altura do verbo, a
   narração, a reserva da reação, a folga da câmara, a tira do telefone —
   continua a sair de `TELA_DE_BATALHA`.

   E A CASA NÃO SE NEGOCIA: quadrada, e nunca abaixo de 48 px
   (`ALVOS.piso`), o menor que passa em WCAG 2.5.5, HIG e Material ao
   mesmo tempo. B1 fá-la ENCHER a largura da janela (no quadro as células
   medem 62 × 51 — esticadas; aqui o lado é a largura útil ÷ colunas, e a
   distância do jogo é por casa: uma casa retangular mentiria a distância).
   Quem cede é a janela, que rola na vertical: *quem encolhe é o campo
   visível, nunca o alvo*.

   A LEI DA CASA, APLICADA À LETRA: nada nesta tela diz que ela é uma
   tela. Sem selo "em combate", sem botão "sair do combate". *O jogador
   sabe que está numa luta porque a luta é o que está na tela.* A legenda
   `TAVERNA / MESA DE BATALHA` é do quadro da pessoa e diz o LUGAR da
   mesa, não o mecanismo.

   AS REGRAS QUE ESTE ARQUIVO CUMPRE E QUE NÃO SE VEEM:
   · toda componente é declarada NO MÓDULO, nunca dentro de um render —
     componente nascido dentro do render nasce outra a cada quadro e mata
     o foco do campo de texto (uma letra e o cursor some);
   · a decisão mora em `tela-de-batalha.js`, que roda em Node e tem
     suíte: aqui só se pinta o que lá foi decidido;
   · nenhum número de regra e nenhuma cor literal: os primeiros saem de
     `MESA_DE_BATALHA`/`TELA_DE_BATALHA`/`ALVOS`, as segundas de `T`.
   ============================================================ */

import React from "react";
import { T, ALVOS, TELA_DE_BATALHA as G } from "./estilo.js";
import { TIPOS, FIM_DA_LUTA } from "./estilo.js";
import { MESA_DE_BATALHA as M, VEU, alfa } from "./estilo.js";
import { GridDeBatalha } from "./grade-de-batalha.jsx";
import { Retrato, Glifo, Recibo, Dobra, Economia, PipDoRecurso, PilulaDaIntencao, FacesDoD20 } from "./ui.jsx";
/* CB (09/11, formas.md §CB): as três colunas, a fila da vez, a economia, o
   teu golpe por extenso, a intenção por inimigo, a folha da previsão no
   telefone e a câmara que enquadra quem importa. As decisões moram em
   batalha-na-tela.js; as medidas, nas tabelas de CB. */
import { BATALHA_EM_TRES as B3, FILA_DA_VEZ, PREVISAO_DO_GOLPE, INTENCAO_NA_MESA, FECHO_DA_QUEDA } from "./estilo.js";
import { filaDaVez, golpePorExtenso, geometriaDaMesa, camaraDoTelefone, avisoDaArea, pilulaDaPrevisao, variacaoDoGolpe } from "./batalha-na-tela.js";
/* CB 17 (lote 2): a fila pela ordem em que o motor joga e a economia da vez
   (vez-na-mesa.js), e o turno deles contado (formas.md §CB 17.2): os tempos
   e o controlo moram em TURNO_DELES. */
import { TURNO_DELES } from "./estilo.js";
/* CB 18 (lote 3, formas.md §CB 18): o empurrão por extenso, a folha do
   empurrão no telefone, o «do alto +2» e a linha da reação no Pé */
import { ALTURA_NA_MESA, EMPURRAO_NA_MESA, REACAO_NA_MESA } from "./estilo.js";
import { RotuloDoEmpurrao, AltoNaPrevisao } from "./ui.jsx";
import { rotulosDoEmpurrao, altoDaPrevisao, letreiroDaReacao, tempoDaReacao, chaveDaReacao } from "./batalha-na-tela.js";
import { filaDaRodada, economiaDaVez } from "./vez-na-mesa.js";
import { sementeDe, estadoDe } from "./semente.js";
import { metrosTxt, podeDarUmPasso, garantirGrade, nomeDoLugar } from "./grid.js";
import { mecanicaDe } from "./condicoes.js";
import { selosDaMecanica } from "./selo-de-estado.js";
import { tituloDe } from "./divindades.js";
import {
  faixaDaVez, rotuloDaVez, fileiraDeVerbos, vereditoDaTela,
  ultimasLinhasDoMestre, NARRACAO, PEDIDO_DO_VERBO, impedimentosDaFileira,
  linhaFugaArmada, empurraoDaFrase,
} from "./tela-de-batalha.js";

/* ---------------- ONDE A MÃO TAPA O TABULEIRO ----------------
   O telefone é CRITÉRIO DE ENTRADA e não apêndice — a pessoa citou a
   plataforma como régua. O quadro B1 é só monitor; o telefone segue o
   padrão que a casa já tem (E1/E4, R21).

   O corte é 768, que é o `md:` do Tailwind: um segundo número aqui faria
   a tela mudar de arranjo num sítio e de medida noutro. */
const CORTE_DO_TELEFONE = "(max-width: 767px)";
/* O MONITOR APERTADO (B1). O quadro mede 1600 × 1001; a régua de E1 é o
   monitor de 1280 × 860, e é lá que a mesa do quadro aperta. Medido a
   1280 × 800 com as medidas do quadro: a fileira quebra em duas linhas e a
   janela do campo fica com 164 px — três casas. Dois cortes, e o que muda
   em cada um sai da MESMA tabela (nenhum número novo):
   · ESTREITO (< 1440): a margem da página e o respiro dos verbos descem
     ao do telefone e ao do chip — a fileira volta a caber numa linha;
   · CURTO (< 1000 de altura desde B1b; era 900): o cabeçalho da cena e o
     compositor encolhem ao piso do alvo — a janela ganha as casas que o
     ar lhe tirava;
   · BAIXO (< 860, B1b): o título, os chips, a pílula e o turno atual
     compactam, para o tabuleiro caber INTEIRO (ver `M.patamares`). */
/* B1b (06/10): o CURTO subiu de 900 para a altura do próprio quadro
   (1000) e nasceu o BAIXO (860) — os dois números e o motivo moram em
   `MESA_DE_BATALHA.patamares`. */
/* §CB 16: o corte do estreito mora na tabela (a geometria em Node conta com
   ele para dar as colunas certas a 1366) */
const CORTE_ESTREITO = `(max-width: ${B3.estreitoAbaixoDe - 1}px)`;
/* §CB 16.1 nº 5: O ALVO MEDE-SE PELO PONTEIRO, NÃO PELA LARGURA. Com toque
   (`pointer: coarse`, Media Queries Level 4 do W3C) os verbos, as gavetas,
   os recuos, o `como?` e o Agir ficam a 48 (`ALVOS.piso`); com rato, a 40
   (WCAG 2.2, 2.5.8 AA: 24 × 24). Um iPad a 1024 é toque e fica a 48. */
const CORTE_GROSSO = "(pointer: coarse)";
const CORTE_CURTO = `(max-height: ${M.patamares.curto - 1}px)`;
const CORTE_BAIXO = `(max-height: ${M.patamares.baixo - 1}px)`;
/* MM11 · 10.ª sessão (13/10): o TERCEIRO patamar, a janela baixa (800×451).
   Ali a mesa ainda cabia por obrigação, e quem cedia era o campo — por
   último, como B1b manda —, até a 72 px: o cabeçalho dele e meia fila de
   casas. Mover pede uma casa tocada, e não havia casa onde tocar. Abaixo
   deste corte o campo deixa de ceder: tem altura própria (ver `M.janelaBaixa`)
   e é a PÁGINA da luta que rola. */
const CORTE_JANELA_BAIXA = `(max-height: ${M.patamares.janelaBaixa - 1}px)`;
function usarMidia(consulta) {
  /* CB 9: o primeiro quadro já pergunta à janela — o telefone nasce telefone,
     sem um quadro de monitor antes (e a câmara enquadra no arranjo certo) */
  const [casa, setCasa] = React.useState(() => { try { return !!(typeof window !== "undefined" && window.matchMedia && window.matchMedia(consulta).matches); } catch { return false; } });
  React.useEffect(() => {
    try {
      const mq = window.matchMedia(consulta);
      const ouve = () => setCasa(!!mq.matches);
      ouve();
      if (mq.addEventListener) { mq.addEventListener("change", ouve); return () => mq.removeEventListener("change", ouve); }
      return undefined;
    } catch { return undefined; }
  }, [consulta]);
  return casa;
}
function usarTelefone() { return usarMidia(CORTE_DO_TELEFONE); }

/* O movimento reduzido: quem o pede não vê a janela deslizar até a zona —
   ela pousa lá de uma vez. try/catch é a lei: um `matchMedia` que estoure
   não pode custar o turno. */
const movimentoParado = () => {
  try { return !!(typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  catch { return false; }
};

/* ---------------- O GESTO QUE O MOTOR NÃO SABE (B1 → A1) ----------------
   O quadro desenha `Esquivar` entre os verbos, e `VERBOS_DE_COMBATE`
   (`golpe.js`) diz dele `motor: null` — a frase não casa verbo de ataque
   nem desafio e vira ficção. Em B1 ele ficou DESLIGADO no lugar do quadro,
   e ao toque a linha dizia que a esquiva ainda não contava.

   A1 (o `jogo`, `mente/a1-jogo.md` peça 97): *um botão que só existe para
   dizer que não funciona é o sistema confessando um buraco* — e ninguém
   pode depender dele, porque ele não faz nada. O gesto sem motor SAI DA
   FILEIRA até ter regra. A REGRA CONTINUA A LER A TABELA DO MOTOR, nunca um
   nome: é `!v.motor` que o tira, logo o verbo VOLTA sozinho no dia em que
   `golpe.js` lhe der motor (o pedido aberto de B1). `esperar` também não
   tem motor, mas é recuo — passar a vez —, e esse fica. */
const temMotorOuNaoEGesto = (v) => !(v.papel === "gesto" && !v.motor);

/* ---------------- A1 · O FIM DA LUTA (`formas.md` §A1 3) ----------------
   O MOMENTO DO GANHO, na própria mesa de batalha. No ANTES (nota 7) "ganhar
   não tem momento": a primeira vitória da campanha passou como linha mono
   no meio de seis. Toma a secção *Sua próxima ação* — saem a fileira, o
   `como?` e a linha do veredito — em três faixas: o desfecho e o recibo da
   luta (a MESMA peça do relato, em tamanho de momento); o chão, só na
   vitória; e o `Respirar fundo →`, presente e tocável desde o primeiro
   quadro — nunca anima, nunca fica desabilitado, nada o cobre.

   As palavras dos desfechos são do `jogo` (é dele o que se comunica); a
   forma é do `desenho`. Na fuga e na queda o recibo diz só a perda; a luta
   encerrada diz o que houver (vazio: 0 px).

   O FOCO vai ao TÍTULO (`tabIndex -1`, `role="status"`) e NÃO ao `Respirar
   fundo`: um Enter que ainda viesse a caminho do `como?` sairia da batalha
   sem o jogador ver o que ganhou. Depois, o `Tab` passa pelos `Recolher` e
   chega ao `Respirar fundo`; ao recolher, o foco segue para o próximo
   `Recolher` ou para o `Respirar fundo`, nunca para o vazio. */
const DESFECHOS = {
  vitoria:   { titulo: "Vitória",        recibo: "tudo",  chao: true },
  fuga:      { titulo: "Você escapou",   recibo: "perda", chao: false },
  queda:     { titulo: "Você tombou",    recibo: "perda", chao: false },
  encerrada: { titulo: "A luta acabou",  recibo: "tudo",  chao: false },
  /* MM (a luta tem saída, 11/10): o meu lado inteiro caiu e acordou — quem
     ficou de pé fez o que quis com os caídos, e a frase de baixo diz o quê.
     "Derrota" e não "Vocês caíram": o par de "Vitória", e serve a quem caiu
     sozinho (a segunda prova viva lia "Vocês" sobre uma heroína só). */
  derrota:   { titulo: "Derrota",        recibo: "perda", chao: false },
};
const ENTRE_DESFECHO_E_RECIBO = { mesa: 24, telefone: 12 };

function CoisaNoChao({ coisa, recolhida, aoRecolher, telefone }) {
  return (
    <div className="flex items-center min-w-0" style={{ minHeight: ALVOS.piso, gap: telefone ? M.entreVerbos : M.chipLadoX }}>
      <span className="tv-mono shrink-0" style={{ ...LEGENDA, fontSize: TIPOS.maquina, color: T.inkDim }}>no chão</span>
      <span className="tv-body flex-1 min-w-0 truncate" style={{ fontSize: TIPOS.corpo, color: recolhida ? T.inkDim : T.ink }}>{coisa.nome}</span>
      {recolhida ? (
        <span className="tv-mono shrink-0" style={{ fontSize: TIPOS.rotulo, color: T.inkDim }}>na bolsa</span>
      ) : (
        <button type="button" data-recolher="" onClick={aoRecolher}
          className="tv-anel-foco tv-mono shrink-0"
          style={{ minHeight: ALVOS.piso, padding: "0 16px", borderRadius: M.raioControle, background: T.panelSoft, border: `1px solid ${T.lineStrong}`, fontSize: TIPOS.rotulo, color: T.ink, cursor: "pointer" }}>
          Recolher
        </button>
      )}
    </div>
  );
}

/* `linha` (MM, a luta tem saída): o que quem ficou de pé fez com os caídos —
   "o Dragão Jovem, ferido, foge e deixa vocês no chão". É gameplay, não o
   nome da regra; vazia, 0 px. */
function FimDaLuta({ desfecho = "encerrada", recibo = [], chao = [], linha = "", aoRecolher, aoSair, telefone = false }) {
  const d = DESFECHOS[desfecho] || DESFECHOS.encerrada;
  const tituloRef = React.useRef(null);
  const faixaRef = React.useRef(null);
  const sairRef = React.useRef(null);
  const [recolhidas, setRecolhidas] = React.useState([]);
  const [chaoAberto, setChaoAberto] = React.useState(false);
  React.useEffect(() => { try { if (tituloRef.current) tituloRef.current.focus(); } catch (e) { /* sem foco, a tela continua */ } }, []);
  const chips = (Array.isArray(recibo) ? recibo : []).filter((c) => c && (d.recibo === "tudo" || Number(c.delta) < 0));
  /* o que foi recolhido continua na lista (a dizer "na bolsa") mesmo que o
     App o tire do chão: a linha não some debaixo do dedo */
  const coisas = (() => {
    const vindas = (Array.isArray(chao) ? chao : []).filter((c) => c && c.id != null);
    const ids = new Set(vindas.map((c) => String(c.id)));
    return [...vindas, ...recolhidas.filter((c) => !ids.has(String(c.id)))];
  })();
  const recolhida = (c) => !!c.recolhido || recolhidas.some((r) => String(r.id) === String(c.id));
  const recolher = (c, k) => {
    try {
      setRecolhidas((rs) => (rs.some((r) => String(r.id) === String(c.id)) ? rs : [...rs, { id: c.id, nome: c.nome }]));
      if (aoRecolher) aoRecolher(c.id);
    } catch (e) { console.warn("FimDaLuta: recolher falhou", e); }
    /* depois de o React pintar a linha "na bolsa" (um tique do relógio, não um quadro contado) */
    setTimeout(() => {
      try {
        const botoes = faixaRef.current ? [...faixaRef.current.querySelectorAll("[data-recolher]")] : [];
        const proximo = botoes[k];
        const alvo = proximo || sairRef.current; if (alvo) alvo.focus();
      } catch (e) { /* o foco é cortesia; nunca custa a saída */ }
    }, 0);
  };
  const teto = telefone ? FIM_DA_LUTA.tetoDoChaoNoTelefone : FIM_DA_LUTA.tetoDoChao;
  const vistas = chaoAberto ? coisas : coisas.slice(0, teto);
  const vencedor = desfecho === "vitoria";
  return (
    <>
      <div className="flex items-center min-w-0" style={{ gap: telefone ? ENTRE_DESFECHO_E_RECIBO.telefone : ENTRE_DESFECHO_E_RECIBO.mesa }}>
        <h3 ref={tituloRef} tabIndex={-1} role="status" className="tv-display tv-fim-entra shrink-0"
          style={{ fontSize: telefone ? TIPOS.titulo : TIPOS.display, color: vencedor ? T.amberSoft : T.ink, fontWeight: 600, lineHeight: 1.2, margin: 0 }}>
          {d.titulo}
        </h3>
        {chips.length > 0 && <div className="flex-1 min-w-0"><Recibo chips={chips} telefone={telefone} momento /></div>}
      </div>
      {typeof linha === "string" && linha.trim() && (
        <p data-fim-linha="" className="tv-body min-w-0" style={{ fontSize: TIPOS.corpo, color: T.ink, lineHeight: 1.45, margin: 0 }}>{linha}</p>
      )}
      {d.chao && coisas.length > 0 && (
        <div ref={faixaRef} className="flex flex-col min-w-0" style={{ gap: telefone ? M.entreVerbos : M.chipLadoX }}>
          {vistas.map((c, k) => (
            <CoisaNoChao key={String(c.id)} coisa={c} recolhida={recolhida(c)} telefone={telefone}
              aoRecolher={() => recolher(c, vistas.slice(0, k).filter((x) => !recolhida(x)).length)} />
          ))}
          {coisas.length > teto && (
            <Dobra quantos={coisas.length - teto} singular="coisa" plural="coisas"
              estado={chaoAberto ? "aberta" : "dobrada"} aoAlternar={() => setChaoAberto((v) => !v)} />
          )}
        </div>
      )}
      <button ref={sairRef} onClick={aoSair} className="tv-anel-foco tv-display text-lg w-full"
        style={{ minHeight: ALVOS.piso, borderRadius: M.raioControle, background: T.amber, color: T.onAccent, fontWeight: 600 }}>
        Respirar fundo →
      </button>
    </>
  );
}

/* "na areia solta" → "Na areia solta": o título da cena é o lugar do
   herói, com a mesma preposição que o Mestre usa. */
const comMaiuscula = (s) => { const t = String(s || ""); return t ? t[0].toUpperCase() + t.slice(1) : ""; };

/* A legenda de máquina do quadro: mono, maiúscula por CSS (o leitor de
   tela não soletra), tracking 1. */
const LEGENDA = { fontSize: M.letra.legenda, letterSpacing: M.rastreio, textTransform: "uppercase", lineHeight: 1.2 };

/* ---------------- O ROSTO NA LUTA ----------------
   Todo retrato desta tela passa por aqui — o chip, o turno atual, os
   cartões de quem está nesta batalha, a tira do telefone. Dois caminhos
   e só dois: o inimigo abre a carta de inimigo; o resto abre a sua.
   `semCarta` é para o retrato que já mora dentro de outro botão (a tira
   do telefone): botão dentro de botão passa no teste e falha no dedo. */
function RostoNaLuta({ ente, inimigo = false, tamanho, anel, semCarta = false }) {
  const e = ente || {};
  if (inimigo) {
    return <Retrato semente={sementeDe(e)} ente={e} inimigo tamanho={tamanho} anel={anel} estado={estadoDe(e.vida, e.vidaMax, true)} />;
  }
  return <Retrato semente={sementeDe(e)} ente={e} semCarta={semCarta} tamanho={tamanho} anel={anel} estado={estadoDe(e.vida, e.vidaMax)} />;
}

/* O fio com a runa ✧ — o ornamento do quadro, desenhado (D5h: nenhuma
   família da casa tem o carácter). */
function FioComRuna({ dosDoisLados = false }) {
  const fio = <span className="flex-1" style={{ height: 1, minWidth: 1, background: T.line }} />;
  return (
    <span className="flex items-center w-full" aria-hidden="true" style={{ gap: M.chipEntre }}>
      {fio}
      <Glifo nome="estrela" tamanho={M.glifoDaRuna} cor={T.amberSoft} />
      {dosDoisLados && fio}
    </span>
  );
}

/* ============================================================
   A ORDEM DA VEZ — os PARTICIPANTES do quadro

   Era uma faixa de selos; B1 dá-lhe ROSTO. As três alternativas caíram
   com motivo (E1): COLUNA LATERAL rouba largura; POR CIMA DAS CASAS não,
   porque *o tabuleiro é a única superfície que nunca pode carregar
   moldura*; DENTRO DE UM PAINEL QUE SE ABRE não, porque "de quem é a
   vez?" pergunta-se várias vezes por turno. Fica no cabeçalho da cena,
   à vista, como no quadro.

   O rótulo NÃO é `ORDEM DE INICIATIVA`: a resposta mora na pílula
   `AGORA: <nome>` — a lei de que o sistema não fala de si mesmo, aplicada
   a um rótulo. A ordem sai de `faixaDaVez` (iniciativa rolada, ou o herói
   seguido de quem está de pé); a cor diz o lado: âmbar a vez, `danger` o
   inimigo, `ok` o aliado. E A PALAVRA VEM JUNTA, nunca só a cor.
   ============================================================ */
/* CB 8 · A FILA DA VEZ (Figma `342:246`, `Rosto da fila`). Era a faixa de
   chips com a pílula `AGORA: <nome>` ao lado; agora é uma linha do tempo de
   ROSTOS: a vez a 56 com o aro âmbar 3, os outros a 40 (aro `lineStrong` no
   grupo, `danger` nos inimigos, com o glifo da intenção num disco de 18);
   quem já agiu a 45 %, quem caiu a 30 % com a caveira; o nome em mono 12.
   Entre rodadas, um fio âmbar e «R3», e quem abre a seguinte. Passar o rato
   num rosto acende a ficha no tabuleiro (`aoRealcar`). No telefone: 44 e 34,
   sem nomes. A pílula da vez aposenta-se: o rosto grande e «A TUA VEZ» na
   coluna diziam o mesmo duas vezes (§CB 2). O nome acessível da fila é a
   resposta à pergunta «de quem é a vez?», e sai do módulo (`rotuloDaVez`).
   Com «Eles» em gaveta (duas colunas), o rosto do inimigo abre-a. */
/* CB 17 (lote 2): a fila segue A ORDEM EM QUE O MOTOR JOGA (`filaDaRodada`,
   vez-na-mesa.js — o herói, os inimigos pela lista da luta, o grupo), e a
   iniciativa rolada aparece como número ao lado do nome. No turno deles a
   vez de quem age leva o aro `danger` (o âmbar é a vez do herói), e quem já
   agiu fica a 45 % (§CB 17.2). */
function FilaDaVez({ fila, rotulo, entes, intencaoDe, noTelefone, realce, aoRealcar, aoAbrirEles = null, vezDeles = false }) {
  if (!fila || !fila.rostos.length) return null;
  const F = FILA_DA_VEZ;
  const um = (r, i, proximo = false) => {
    const inimigo = r.lado === "inimigo";
    const vez = r.estado === "vez" && !proximo;
    const tam = noTelefone ? (vez ? F.telefone.vez : F.telefone.espera) : (vez ? F.vez : F.espera);
    const anel = vez ? (vezDeles ? T.danger : T.amber) : inimigo ? T.danger : T.lineStrong;
    const op = r.estado === "caido" ? F.caido : r.estado === "agiu" || proximo ? F.agiu : 1;
    const vista = inimigo && intencaoDe ? intencaoDe.get(r.nome) : null;
    const glifo = vista && INTENCAO_NA_MESA.glifo[vista.tipo];
    const rosto = (
      <span className="relative inline-flex" style={{ filter: r.estado === "caido" ? "grayscale(1)" : "none" }}>
        <RostoNaLuta ente={entes(r)} inimigo={inimigo} tamanho={tam} anel={anel} semCarta={!!(inimigo && aoAbrirEles)} />
        {glifo && r.estado !== "caido" && (
          <span aria-hidden="true" className="absolute inline-flex items-center justify-center"
            style={{ right: -4, bottom: -4, width: INTENCAO_NA_MESA.discoNaFila, height: INTENCAO_NA_MESA.discoNaFila, borderRadius: INTENCAO_NA_MESA.discoNaFila, background: T.pagina, border: `1px solid ${INTENCAO_NA_MESA.cor[vista.tipo]}` }}>
            <Glifo nome={glifo} tamanho={12} cor={INTENCAO_NA_MESA.cor[vista.tipo]} />
          </span>
        )}
        {r.estado === "caido" && (
          <span aria-hidden="true" className="absolute inset-0 inline-flex items-center justify-center"><Glifo nome={INTENCAO_NA_MESA.caveira} tamanho={16} cor={T.ink} /></span>
        )}
      </span>
    );
    return (
      <span key={`${r.nome}-${i}${proximo ? "-p" : ""}`} className="flex flex-col items-center shrink-0" style={{ gap: 4, opacity: op }}
        onMouseEnter={() => aoRealcar && aoRealcar(r.nome)} onMouseLeave={() => aoRealcar && aoRealcar(null)}>
        {inimigo && aoAbrirEles ? (
          <button onClick={aoAbrirEles} aria-label={`${r.nome} — ver o que eles vão fazer`} className="tv-anel-foco rounded-full">{rosto}</button>
        ) : rosto}
        {!noTelefone && (
          <span className="tv-mono truncate" style={{ fontSize: TIPOS.piso, color: vez ? (vezDeles ? T.danger : T.amberSoft) : realce === r.nome ? T.ink : T.inkMeio, fontWeight: vez ? 700 : 400, maxWidth: F.vez + 24 }}
            title={r.iniciativa != null ? `${r.nome} · iniciativa ${r.iniciativa}` : undefined}>
            {r.nome}{r.iniciativa != null && !proximo && <span style={{ color: T.inkDim, fontWeight: 400 }}> {r.iniciativa}</span>}
          </span>
        )}
      </span>
    );
  };
  return (
    <div role="group" aria-label={rotulo || undefined} className={`flex items-center overflow-x-auto tv-scroll ${noTelefone ? "min-w-0" : "shrink-0"}`}
      style={{ gap: F.entre * 2, padding: noTelefone ? 0 : `${F.entre}px ${F.entre * 2}px`, borderRadius: M.raio, background: noTelefone ? "transparent" : T.panel, border: noTelefone ? "none" : `1px solid ${T.line}` }}>
      {fila.rostos.map((r, i) => um(r, i))}
      {fila.proximo && !noTelefone && (
        <>
          <span aria-hidden="true" className="flex flex-col items-center shrink-0" style={{ gap: 4 }}>
            <span style={{ width: F.marcaDaRodada.fio[0], height: noTelefone ? F.telefone.espera : F.marcaDaRodada.fio[1], background: alfa(T.amber, F.marcaDaRodada.alfa) }} />
            <span className="tv-mono" style={{ fontSize: TIPOS.piso, fontWeight: 700, color: T.amberSoft }}>R{fila.rodadaSeguinte}</span>
          </span>
          {um({ ...fila.proximo, estado: "espera" }, 0, true)}
        </>
      )}
    </div>
  );
}

/* ============================================================
   A LINHA DO VEREDITO — sempre presente, nunca vazia, nunca balão

   Sobre o tabuleiro a Consequência é sempre LINHA: *quatro segundos de
   balão tapam exactamente as casas para onde o jogador ia andar.* No
   quadro B1 ela é a cabeça do painel `SUA PRÓXIMA AÇÃO`, à direita, com
   a mira — ENTRE O CAMPO E OS VERBOS, que é onde a mão NÃO está quando o
   polegar os prime (Apple HIG, `Adjusting for the finger`), e a ordem do
   DOM continua a ser a de E1: campo → veredito → verbos.

   É AQUI QUE A REAÇÃO DE K3 NASCE, e cresce PARA CIMA, ancorada em
   baixo: o topo do campo nunca se mexe e a câmara nunca se mexe.
   *Empurrar move as casas que o jogador estava a ler no exacto segundo
   em que ele tem de decidir depressa.* O terço de baixo da janela do
   campo é território emprestado, e nada desta tela depende de estar
   visível ali. */
/* §CB 16.1 nº 1 · O PÉ DO CAMPO. A linha do veredito desceu para dentro da
   moldura do campo, por baixo de um fio `line`: 32 de alto no monitor, 44
   no telefone, e NUNCA cresce — a frase vai em mono 12 com entrelinha 16,
   até duas linhas, e o `title` leva-a inteira. Continua ENTRE O CAMPO E OS
   VERBOS (a 8 px do verbo armado, e o bico dele aponta para ela), com o
   mesmo `aria-live`. Sai só o rótulo «Sua próxima ação»: a posição e o bico
   já o dizem. À direita, o nó onde o tabuleiro escreve os chips do campo e
   o ⤢ (`aoPortal`). A reação (K3) continua ancorada por cima desta linha e
   cresce para cima, sobre o terço de baixo do campo. `tom`: a cor da frase
   quando ela não é a do armado nem a do repouso (o resumo da área). */
/* §CB 17.2: no turno deles o Pé leva a frase do passo, com o glifo do tipo
   da intenção no lugar da mira (`glifo`, `corDoGlifo`), e os dois controlos
   (`controlo`) à direita, antes do ⤢; no telefone o ⤢ cala-se nesse tempo
   (`calaOPortal`), para a frase ter largura. A altura não muda. */
function PeDoCampo({ texto, armado, tom = null, reacao, noTelefone, aoPortal, glifo = "mira", corDoGlifo = T.danger, controlo = null, calaOPortal = false }) {
  const alto = (noTelefone ? B3.telefone.pe : B3.pe) + B3.aro;
  const V = B3.vereditoNoPe;
  return (
    <div className="shrink-0 flex items-center min-w-0"
      style={{ position: "relative", height: alto, minHeight: alto, gap: M.entreVerbos, paddingLeft: M.chipLadoX, borderTop: `${B3.aro}px solid ${T.line}` }}>
      {reacao && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "100%", zIndex: 40 }}>{reacao}</div>
      )}
      <Glifo nome={glifo} tamanho={M.glifoDoSelo + 4} cor={corDoGlifo} />
      <span className="tv-mono min-w-0" aria-live="polite" title={texto || undefined}
        style={{ flex: "1 1 0", fontSize: TIPOS.piso, lineHeight: `${V.entrelinha}px`, maxHeight: V.entrelinha * V.linhas,
          color: tom || (armado ? T.amberSoft : T.inkDim),
          display: "-webkit-box", WebkitLineClamp: V.linhas, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {texto}
      </span>
      {controlo}
      <div ref={aoPortal} className="flex items-center min-w-0 overflow-hidden" style={{ flex: "0 1 auto", height: "100%", display: calaOPortal ? "none" : undefined }} />
    </div>
  );
}

/* ============================================================
   CB 17.2 · O CONTROLO DO TURNO DELES (Figma 364:1449) — «2×» e «Saltar ›»
   No Pé do campo, à direita, antes do ⤢, só enquanto o turno deles se
   conta: 32 no monitor, 44 no telefone (a altura do Pé). «2×» é um
   interruptor (`aria-pressed`; ligado: chão âmbar a 18 % e letra
   `amberSoft`); «Saltar ›» leva a mesa ao fim já. A preferência do 2× é de
   quem monta (TURNO_DELES.preferencia, no localStorage, nunca no save).
   ============================================================ */
function ControloDoTurnoDeles({ acelerado = false, aoAcelerar, aoSaltar, noTelefone = false }) {
  const alto = noTelefone ? B3.telefone.pe : B3.pe;
  const base = { height: alto, minHeight: alto, borderRadius: alto / 2, fontSize: TIPOS.piso, fontWeight: 700, background: T.panelSoft, border: `1px solid ${T.lineStrong}` };
  const chama = (f) => () => { try { if (f) f(); } catch (e) { console.warn("TelaDeBatalha: o controlo do turno deles falhou", e); } };
  return (
    <span className="flex items-center shrink-0" style={{ gap: M.entreVerbos }}>
      <button type="button" onClick={chama(aoAcelerar)} aria-pressed={!!acelerado} aria-label="dobro da velocidade"
        className="tv-anel-foco tv-mono flex items-center justify-center shrink-0"
        style={{ ...base, width: alto, minWidth: alto, color: acelerado ? T.amberSoft : T.inkMeio,
          background: acelerado ? alfa(T.amber, TURNO_DELES.controlo.ligado) : T.panelSoft, border: `1px solid ${acelerado ? T.amber : T.lineStrong}` }}>
        2×
      </button>
      <button type="button" onClick={chama(aoSaltar)} aria-label="Saltar o turno deles"
        className="tv-anel-foco tv-mono flex items-center justify-center shrink-0"
        style={{ ...base, padding: `0 ${M.chipLadoX + 2}px`, color: T.ink }}>
        Saltar ›
      </button>
    </span>
  );
}

/* ============================================================
   CB 17.2 · A FRASE DO PASSO (tabela de tela): diz o que o mundo fez, nunca
   o nome do mecanismo. A chave é a `intencao` do passo (passosDoTurno); a
   parte do golpe é «acerta, 5.» ou «erra.»
   ============================================================ */
const FRASE_DO_PASSO = {
  cumprida: ({ anda, golpe }) => (anda ? `vem ${anda} m e ${golpe}.` : `${golpe}.`),
  reescolhe: ({ caiu, alvo, golpe }) => `${caiu || "o alvo"} caiu; vira-se para ${alvo} e ${golpe}.`,
  reescolheAoAlcance: ({ caiu, alvo, golpe, eraEu }) => `já não ${eraEu ? "te alcança" : `alcança ${caiu || "o alvo"}`}; vira-se para ${alvo} e ${golpe}.`,
  provocacao: ({ golpe }) => (golpe ? `provocado, vem a ti e ${golpe}.` : "provocado, vem a ti."),
  golpeiaSeAlcanca: ({ anda, golpe }) => (golpe ? `vem ${anda} m e ${golpe}.` : `vem ${anda} m.`),
  perdido: () => "o sopro queima o chão vazio.",
  aproximar: ({ anda }) => (anda ? `vem ${anda} m.` : "aproxima-se."),
  fugir: () => "foge.",
  caiu: () => "cai antes de agir.",
  curar: ({ alvo, valor }) => `cura ${alvo}${valor ? `, ${valor}` : ""}.`,
  proteger: () => "põe-se em guarda.",
};
/* o golpe de um passo em palavras: «acerta, 5» · «erra»; vários alvos, cada
   um com o seu nome */
const golpeEmPalavras = (gs) => {
  const um = (g) => { const v = variacaoDoGolpe(g && g.evento); return !v || v.variante === "erro" ? "erra" : `acerta, ${Math.max(0, Number(g.evento.dano) || 0)}`; };
  const alvos = [...new Set(gs.map((g) => g.alvo))];
  return alvos.length > 1 ? gs.map((g) => `${g.alvo} ${um(g)}`).join(" · ") : gs.map(um).join(" e ");
};
function fraseDoPasso(passo, o) {
  if (!passo || typeof passo !== "object" || !passo.quem) return "";
  const c = o && typeof o === "object" ? o : {};
  const F = FRASE_DO_PASSO;
  const gs = Array.isArray(passo.golpes) ? passo.golpes.filter((g) => g && g.alvo) : [];
  const anda = Array.isArray(passo.caminho) && passo.caminho.length > 1 && passo.metros ? metrosTxt(passo.metros) : "";
  const golpe = gs.length ? golpeEmPalavras(gs) : "";
  const alvo = gs.length ? gs[0].alvo : "";
  const anunciado = c.anunciado || "";
  const ctx = { anda, golpe, alvo, caiu: anunciado, eraEu: !!c.heroi && anunciado === c.heroi, valor: passo.cura ? passo.cura.valor : 0 };
  let diz;
  if (passo.caiu) diz = F.caiu(ctx);
  else if (passo.lado === "aliado" && passo.tipo === "curar") diz = F.curar({ ...ctx, alvo: passo.cura ? passo.cura.alvo : alvo });
  else if (passo.lado === "aliado" && passo.tipo === "proteger") diz = F.proteger(ctx);
  else if (passo.tipo === "fugir") diz = F.fugir(ctx);
  else if (passo.intencao && F[passo.intencao] && (gs.length || passo.intencao === "perdido" || passo.intencao === "golpeiaSeAlcanca" || passo.intencao === "provocacao")) diz = F[passo.intencao](ctx);
  else if (gs.length) diz = F.cumprida(ctx);
  else diz = F.aproximar(ctx);
  const quemAlvo = alvo && passo.tipo !== "fugir" && passo.tipo !== "sopro" ? `${passo.quem} → ${alvo}` : passo.quem;
  return { quem: passo.quem, alvo: passo.tipo !== "fugir" && passo.tipo !== "sopro" ? alvo : "", diz, linha: `${quemAlvo}: ${diz}` };
}

/* §CB 16.3: o resumo da área deixou de ser uma tarja no pé — é O TEXTO DO
   VEREDITO enquanto se mira, porque é o que vai acontecer. A previsão é a de
   sempre (`previsaoDeArea`, a fiação), e as palavras são as da tarja. */
function resumoDaArea(pv) {
  if (!pv || typeof pv !== "object" || !pv.nome) return "";
  const nIni = Array.isArray(pv.inimigos) ? pv.inimigos.length : 0;
  const aliados = Array.isArray(pv.aliados) ? pv.aliados : [];
  return `${pv.nome} (${pv.forma}${pv.raio ? ` de ${pv.raio} m` : ""}): ${nIni} inimigo${nIni === 1 ? "" : "s"}`
    + (aliados.length ? ` · PEGA ${aliados.join(", ")}` : " · nenhum aliado na área");
}

/* ============================================================
   OS VERBOS — posições fixas, sempre os mesmos

   *Uma fileira que muda é uma fileira que se lê todo turno; uma que nunca
   muda aprende-se em duas lutas e usa-se sem olhar.* A LISTA NÃO NASCE
   AQUI: sai de `VERBOS_DE_COMBATE` (`golpe.js`) por `fileiraDeVerbos()`,
   que é a tabela onde X1 escreveu verbo a verbo qual deles chega a motor.

   `Atacar` é o primeiro entre iguais, e paga-se em LARGURA (no quadro,
   402 de 1144) e no glifo das espadas, não em preenchimento cheio — W1
   apanhou a armadilha com uma foto: em repouso o `Papel=Chamada` já é
   âmbar cheio, e ficava indistinguível do ARMADO, que é o estado que
   importa. **O âmbar cheio pertence ao que vai acontecer, não ao que é
   popular.**

   E o rótulo do armado é `onAccent`, e só `onAccent`: `ink` sobre `amber`
   dá 1,701:1 e reprova. É a armadilha escrita porque vai acontecer —
   quem clonar o botão de repouso e trocar só o fundo cai nela.

   `Habilidades (✦)` e a bolsa são GAVETAS, não verbos: são listas que
   variam por classe, nível e PM, e *lista nunca entra em fileira fixa*.
   `esperar` e `Fugir` ficam do outro lado de um fio, em Papel=Recuo.
   ============================================================ */
/* CB 2: o preço do verbo passa a ser O RECURSO QUE GASTA — o pip da Economia,
   a 75 % —, e no Atacar a chance («Atacar · 78%»). Uma ação, uma forma: é o
   mesmo botão, com o preço ao lado do rótulo. Que recurso cada verbo gasta é
   regra, e chega por `recurso` (a tabela do motor, pela fiação); sem ela o
   pip cala-se. Passar o rato no verbo põe o recurso dele «em jogo» na coluna. */
/* §CB 16 · `alto`: a altura do alvo, pelo ponteiro (40 rato, 48 toque; 48
   no telefone). `grelha`: o telefone, onde o verbo enche a sua casa da
   grelha de 4 e o Atacar leva a chance POR BAIXO do rótulo. O pip do
   recurso só chega com `recurso` (o centro ≥ 660, §CB 16.1 nº 4); quem
   gasta passo («movimento») leva o glifo dos passos como preço. As
   espadas do Atacar saíram: o pip e o «· 78%» já o distinguem. */
function Verbo({ v, armado, impedido, aoTocar, recurso = null, chance = null, aoApontar = null, alto = B3.verbo.fino, grelha = false }) {
  const recuo = v.papel === "recuo";
  const P = B3.verboComPip;
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
      onMouseEnter={aoApontar ? () => aoApontar(v.id) : undefined} onMouseLeave={aoApontar ? () => aoApontar(null) : undefined}
      /* `aria-disabled` E NAO `disabled`: um botao desativado sai da ordem
         de tabulacao, e quem navega por teclado ou ouve a tela deixa de
         saber que o verbo principal existe. Impedido ele continua a ser —
         o clique nao passa —, mas deixa de ser invisivel. */
      aria-disabled={impedido || undefined}
      aria-pressed={armado}
      /* O ANEL DE FOCO É DA FOLHA, e por isso a sombra inline não entra
         aqui em circunstância nenhuma: estilo inline vence SEMPRE a folha,
         e o anel também é `box-shadow` — foi assim que a pílula da ficha
         apagou o seu anel em todos os estados sem ninguém notar (K4). */
      className="tv-anel-foco tv-mono flex items-center justify-center"
      style={{
        /* o alvo sai da tabela, nunca de aritmética de padding */
        minHeight: alto, height: alto,
        padding: `0 ${P.lado}px`, gap: P.entre, borderRadius: M.raioControle,
        fontSize: M.letra.verbo, fontWeight: armado ? 600 : 500, whiteSpace: "nowrap",
        /* `Atacar` é o primeiro entre iguais, e paga-se na LARGURA — nunca
           no preenchimento, que pertence ao armado. Na grelha do telefone
           cada verbo enche a sua casa, e os quatro são iguais. */
        flex: grelha ? undefined : v.primeiro ? "1 1 0" : recuo ? "0 0 auto" : "0 1 auto",
        minWidth: grelha ? 0 : v.primeiro ? 120 : 0,
        background: armado ? T.amber : T.panelSoft,
        /* §CB 16.4: Esperar `inkMeio` (8,32), o recuo impedido `inkDim` (5,45) —
           a grelha do telefone não tem fio, e o papel diz-se pela letra */
        color: armado ? T.onAccent : impedido ? T.inkDim : recuo ? T.inkMeio : T.ink,
        /* o armado HERDA o contorno do repouso do mesmo `Papel`: o traço é
           o que segura a largura, e tirá-lo encolheria o botão ao armar-se */
        border: `1px solid ${armado ? T.amber : T.line}`,
        opacity: impedido ? 0.45 : 1,
        position: "relative",
      }}>
      {recurso === "movimento"
        ? <Glifo nome="passo" tamanho={P.passos} cor={armado ? T.onAccent : T.amberSoft} />
        : recurso && <PipDoRecurso recurso={recurso} estado={impedido ? "gasto" : "livre"} tamanho={P.pip} />}
      {grelha && chance != null ? (
        <span className="flex flex-col items-center" style={{ lineHeight: `${B3.vereditoNoPe.entrelinha}px` }}>
          <span>{v.rotulo}</span>
          <span aria-hidden="true" style={{ fontWeight: 700 }}>{chance}%</span>
        </span>
      ) : (
        <>
          {v.rotulo}
          {chance != null && <span aria-hidden="true" style={{ fontWeight: 700, whiteSpace: "nowrap" }}>· {chance}%</span>}
        </>
      )}
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

/* CB 2: na mesa a três colunas os recuos (Esperar · Fugir) descem para a
   linha do `como?`, ao lado do Agir — a barra de ação fica com duas linhas
   (§CB 2: «por baixo, o como? com Esperar · Fugir · Agir»), e a altura volta
   ao tabuleiro. (Desde §CB 16 é o arranjo de todo monitor; no telefone os
   recuos fecham a segunda linha da grelha.) */
/* §CB 16.1 nº 4 · A FILEIRA SÓ TEM GESTOS, E NUNCA QUEBRA. As duas gavetas
   (✦ e a bolsa) e os recuos descem para a linha do `como?`: são listas e
   saídas, não gestos (a lei da fileira já o dizia), e é isso que deixa os
   seis gestos caberem numa linha a 1024. Uma fileira que quebra deixa de
   ter a altura da conta e come o tabuleiro. No telefone (`grelha`) é a
   grelha de 4 colunas: os gestos, e os recuos no fim da segunda linha. */
function FileiraDeVerbos({ verbos, armado, impedidos, aoTocar, recursos = null, chanceDoAtaque = null, aoApontar = null, alto = B3.verbo.fino, grelha = false }) {
  const gestos = verbos.filter((v) => v.papel !== "recuo");
  /* MAIS DE UM RECUO PODE VIVER AQUI: `esperar` e `fugir` são os dois
     "sair do turno sem golpe" — era `.find` quando só `esperar` existia,
     e um `.find` teria engolido um dos dois em silêncio no dia em que o
     segundo chegasse. */
  const recuos = grelha ? verbos.filter((v) => v.papel === "recuo") : [];
  const TT = B3.telefone;
  return (
    <div className={`shrink-0 min-w-0 ${grelha ? "grid" : "flex items-stretch overflow-hidden"}`}
      style={grelha ? { gridTemplateColumns: `repeat(${TT.colunasDosVerbos}, minmax(0, 1fr))`, gap: TT.entre } : { height: alto, gap: M.entreVerbos }}>
      {[...gestos, ...recuos].map((v) => (
        <Verbo key={v.id} v={v} armado={armado === v.id} impedido={!!impedidos[v.id]} aoTocar={() => aoTocar(v)} alto={alto} grelha={grelha}
          recurso={recursos && v.papel !== "recuo" ? recursos[v.id] || null : null} chance={v.id === "atacar" ? chanceDoAtaque : null} aoApontar={v.papel !== "recuo" ? aoApontar : null} />
      ))}
    </div>
  );
}

/* AS DUAS GAVETAS — abrem lista, logo não são verbos. Moram na linha do
   `como?` (§CB 16.1 nº 4), quadradas, à altura do ponteiro. */
function Gaveta({ aberta, aoAbrir, glifo, rotulo, rotuloAcessivel = "", conta = 0, alto }) {
  return (
    <button onClick={aoAbrir} aria-pressed={aberta} title={rotulo} aria-label={rotuloAcessivel || rotulo}
      className="tv-anel-foco tv-mono inline-flex items-center justify-center shrink-0"
      style={{ height: alto, minHeight: alto, minWidth: alto, padding: conta > 0 ? `0 ${M.entreVerbos}px` : 0, gap: 4, borderRadius: M.raioControle,
        background: aberta ? T.violet : T.panelSoft, color: aberta ? T.onSecond : T.violetSoft,
        border: `1px solid ${aberta ? T.violet : T.line}`, fontSize: M.letra.chip }}>
      <Glifo nome={glifo} tamanho={M.glifo} />{conta > 0 ? conta : null}
    </button>
  );
}

/* ============================================================
   A NARRAÇÃO — encolhida ao mínimo honesto, e nunca ausente

   A leitura literal de *"uma tela só com o grid"* mata a narração. A
   decisão do `desenho`, registada como decisão e não como pedido: **a
   narração fica.** No quadro B1 ela é a frase da cena, por baixo do
   título, na segunda voz (`inkMeio`).
   ============================================================ */
/* B1b: no monitor a frase tem DUAS linhas e reticências — o teto em
   altura que já existia (`G.narracao`) cortava a seco no meio de uma
   linha. O corte de verdade continua a ser o do módulo, PELO COMEÇO
   (`ultimasLinhasDoMestre`: o fim é o que o jogador precisa); o clamp é só
   o cinto, para o dia em que a coluna for mais estreita do que a conta de
   caracteres supõe. A fala inteira fica no `title` e no relato. O clamp
   vai em estilo inline, nunca na classe da CDN (R2: a classe mediu
   `display: flow-root` ao vivo). */
/* CB 2: na mesa a três colunas a fala é UMA linha, centrada, em Spectral
   itálico 16 `inkMeio` — o campo é que leva a altura toda. A fala inteira
   continua no `title` e no relato; o corte de verdade continua a ser o do
   módulo, pelo começo. */
/* §CB 16.1 nº 3: no monitor a fala SOBE AO BLOCO DIREITO DA LINHA DA FILA,
   em Spectral itálico 16 `inkMeio`, entrelinha 24, até três
   linhas (72 ≤ os 90 da fila), reticências no fim e a frase inteira no
   `title`. Devolve a sua linha ao tabuleiro, e dá MAIS lugar à prosa. No
   telefone continua na linha dela (22). (O clamp de duas linhas de B1b,
   centrado por baixo da fila, aposentou-se com ela.) */
function AUltimaFala({ texto, inteiro = "", carregando, noTelefone }) {
  /* o telefone: uma linha de 22, cortada com reticências */
  if (noTelefone) {
    const alto = B3.telefone.fala;
    return (
      <p className="tv-body truncate shrink-0" title={inteiro || undefined}
        style={{ fontSize: M.letra.cena, color: T.inkMeio, lineHeight: `${alto}px`, height: alto, margin: 0, fontStyle: "italic" }}>
        {carregando && !texto ? "" : texto}
      </p>
    );
  }
  /* o monitor: o bloco direito da linha da fila, até três linhas */
  const F = B3.falaNaFila;
  return (
    <p className="tv-body" title={inteiro || undefined}
      style={{ fontSize: F.letra, lineHeight: `${F.entrelinha}px`, maxHeight: F.entrelinha * F.linhas, color: T.inkMeio, margin: 0, fontStyle: "italic",
        display: "-webkit-box", WebkitLineClamp: F.linhas, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
      {carregando && !texto ? "" : texto}
    </p>
  );
}

/* ---------------- O SELO DO MODIFICADOR (E4) ----------------
   O texto e o tom saem de `selo-de-estado.js`; aqui só se escolhe a tinta,
   que é a única coisa que um módulo puro não pode escolher.

   E A PALAVRA VEM SEMPRE JUNTA, nunca só a cor: é `DANO` contra `DANO
   SOFRIDO` que separa os dois vermelhos (WCAG 1.4.1, *Use of Color*). */
function SeloDoModificador({ selo }) {
  const cor = selo.tom === "bom" ? T.ok : selo.tom === "perigo" ? T.danger : T.inkDim;
  return (
    <span className="tv-mono px-1.5 py-0.5 rounded shrink-0"
      style={{ fontSize: M.letra.legenda, border: `1px solid ${cor}`, color: cor, fontWeight: 600 }}>{selo.texto}</span>
  );
}

/* Um recurso do quadro: o nome à esquerda, o valor à direita, a barra
   de 6 px por baixo. */
function Recurso({ rotulo, atual, max, cor }) {
  const a = Math.max(0, Number(atual) || 0), m = Math.max(0, Number(max) || 0);
  const pct = m > 0 ? Math.max(0, Math.min(100, (a / m) * 100)) : 0;
  return (
    <div className="flex flex-col w-full" style={{ gap: 8 }}>
      <div className="flex items-start justify-between">
        <span className="tv-mono" style={{ ...LEGENDA, color: T.inkDim }}>{rotulo}</span>
        <span className="tv-mono" style={{ fontSize: M.letra.valor, color: T.ink, fontWeight: 700 }}>{a}/{m}</span>
      </div>
      <div className="w-full overflow-hidden" style={{ height: M.barra, borderRadius: M.barra / 2, background: T.line }}>
        <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: cor, borderRadius: M.barra / 2 }} />
      </div>
    </div>
  );
}

/* ============================================================
   O TURNO ATUAL — a ficha do herói, como o quadro a desenha

   Informação, e não porta: durante a luta ela NÃO abre a ficha. Um
   controle que, tocado no meio de uma luta, ou não faz nada ou termina a
   luta, não pode estar na tela da luta. O retrato abre a CARTA (a pessoa),
   como todo retrato da casa.

   O que fica é o que não tem outra casa: o nome, PV, PM, a economia da
   rodada e os modificadores do motor (E4 §6).
   ============================================================ */
/* CB 2 · A COLUNA TU, de cima a baixo: o rosto 74 em aro âmbar 3, «A TUA
   VEZ», o nome em Cormorant 32 e a classe · PV e PM · a ECONOMIA (§CB 8:
   ● ação, ▲ bónus, ◆ reação, e o movimento). `compacto` é o patamar baixo:
   os respiros descem aos de `M.aperto`; nenhum campo sai. */
/* §CB 17.2: no turno deles «A tua vez» passa a «A vez deles · <nome>» (`danger`,
   `vezDeles` é o nome de quem age); no fim volta, com um pulso (tv-pulse, uma vez:
   `pulso` é a chave que o reacende). `vez`: economiaDaVez (vez-na-mesa.js). */
function TurnoAtual({ personagem, economia, recursos = null, acaoBonus, selos = [], compacto = false, emJogo = null, passoM = null, passoTotal = null, vezDeles = "", pulso = 0, vez = null }) {
  const grave = personagem.vidaMax > 0 && personagem.vida / personagem.vidaMax <= 1 / 3;
  const m = compacto ? M.aperto : M;
  const linhaDaClasse = [personagem.classe, personagem.nivel ? `nv ${personagem.nivel}` : ""].filter(Boolean).join(" · ");
  return (
    <div key={pulso ? `pulso${pulso}` : undefined} className={`tv-mesa-vez flex flex-col shrink-0 w-full${pulso ? " tv-pulse" : ""}`}
      style={{ animationIterationCount: pulso ? 1 : undefined, padding: m.turnoRespiro, gap: m.turnoEntre, borderRadius: M.raio, background: T.panel, border: `1px solid ${grave ? T.danger : alfa(T.amber, M.alfa.fio)}` }}>
      <div className="flex items-center" style={{ gap: M.cartao + 4 }}>
        <RostoNaLuta ente={personagem} tamanho={compacto ? M.aperto.retratoDoHeroi : FILA_DA_VEZ.vez + 18} anel={grave ? T.danger : T.amber} />
        <span className="flex flex-col min-w-0" style={{ gap: 2 }}>
          <span className="tv-mono" style={{ ...LEGENDA, color: vezDeles ? T.danger : T.amber, fontWeight: 700 }}>{vezDeles ? `A vez deles · ${vezDeles}` : "A tua vez"}</span>
          <span className="tv-display truncate" style={{ fontSize: compacto ? M.aperto.nomeDoHeroi : M.letra.nomeDoHeroi, color: T.ink, fontWeight: 600, lineHeight: 1.1 }}>{personagem.nome}</span>
          {linhaDaClasse && <span className="tv-mono truncate" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>{linhaDaClasse}</span>}
        </span>
      </div>
      <Recurso rotulo="PV" atual={personagem.vida} max={personagem.vidaMax} cor={grave ? T.danger : T.amber} />
      {personagem.manaMax > 0 && <Recurso rotulo="PM" atual={personagem.mana} max={personagem.manaMax} cor={T.violetSoft} />}
      <div style={{ padding: M.cartao, borderRadius: M.raioControle, background: T.panelSoft, border: `1px solid ${T.line}` }}>
        <Economia economia={economia} recursos={recursos} emJogo={emJogo} acaoBonus={acaoBonus} passoM={passoM} passoTotal={passoTotal} vez={vez} />
      </div>
      {/* OS MODIFICADORES DO MOTOR (E4). `mecanicaDe` devolve sete campos
          que mexem num número; a tela da batalha esconde o HUD inteiro, e
          `Enfraquecido` (−2) e `Marcado` (+2) não tinham canal aqui. */}
      {selos.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {selos.map((x) => <SeloDoModificador key={x.id} selo={x} />)}
        </div>
      )}
    </div>
  );
}

/* CB 3 · O TEU GOLPE (coluna Tu; `pagina`, aro âmbar a 50 %): a previsão por
   extenso quando há alvo sob o rato. ACERTO com o d20 e a defesa, AS 20
   FACES com as que acertam acesas (quem joga RPG de mesa pensa em «preciso
   de 6», não em «78 %»), DANO com a média, ABATE e CRÍTICO. O que falta,
   cala-se. */
/* §CB 16.3: com a coluna Tu estreita (< 450) as 20 faces vão em DUAS FILAS
   DE 10, e a conta de cada linha (ACERTO, DANO…) desce para debaixo do
   número — numa linha só, a 320, as faces partiam-se em 15 + 5 e a conta
   espremia-se ao lado do número. */
/* §CB 17.1: `saiu` é a face do último d20 do teu lance — marca-se durante a
   leitura (enquanto o dado rola, as faces acendem-se sem marca) */
function OTeuGolpe({ previsao, estreito = false, saiu = null }) {
  const g = golpePorExtenso(previsao);
  if (!g) return null;
  const P = PREVISAO_DO_GOLPE;
  const larguraDeDezFaces = P.faces.lado[0] * B3.colunaEstreita.facesPorFila + P.faces.entre * (B3.colunaEstreita.facesPorFila - 1);
  const linha = (rotulo, grande, cor, diz, chave) => (
    <div key={chave} className="flex items-baseline" style={{ gap: M.cartao }}>
      <span className="tv-mono shrink-0" style={{ ...LEGENDA, color: T.inkDim, width: 64 }}>{rotulo}</span>
      <span className={estreito ? "flex flex-col min-w-0" : "contents"}>
        <span className="tv-mono shrink-0" style={{ fontSize: P.letra.chance, fontWeight: 700, color: cor }}>{grande}</span>
        {diz && <span className="tv-body min-w-0" style={{ fontSize: TIPOS.rotulo, color: T.inkMeio }}>{diz}</span>}
      </span>
    </div>
  );
  return (
    <section aria-label={`O teu golpe${g.alvo ? ` contra ${g.alvo}` : ""}`} className="flex flex-col shrink-0 w-full"
      style={{ padding: M.cartao + 4, gap: M.cartao, borderRadius: M.raio, background: T.pagina, border: `1px solid ${alfa(T.amber, 0.5)}` }}>
      <span className="tv-mono flex items-center" style={{ ...LEGENDA, color: T.amberSoft, gap: 6, fontWeight: 700 }}>
        <Glifo nome="espadas" tamanho={16} cor={T.amber} />O teu golpe{g.alvo ? ` → ${g.alvo}` : ""}{g.vida != null ? ` · ${g.vida} PV` : ""}
      </span>
      {g.chance != null && linha("Acerto", `${g.chance}%`, T.amberSoft, g.bonus != null && g.defesa != null ? `d20 ${g.bonus >= 0 ? "+" : "−"}${Math.abs(g.bonus)} contra a defesa ${g.defesa}` : null, "acerto")}
      {g.faces && (estreito
        ? <div style={{ maxWidth: larguraDeDezFaces }}><FacesDoD20 faces={g.faces} saiu={saiu} rotulo={g.legenda} /></div>
        : <FacesDoD20 faces={g.faces} saiu={saiu} rotulo={g.legenda} />)}
      {g.legenda && <span className="tv-mono" style={{ fontSize: P.letra.legenda, color: T.inkDim }}>{g.legenda}</span>}
      {g.semCobertura != null && <span className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.mundo }}>sem cobertura: {g.semCobertura}%</span>}
      {/* CB 18.4 b: «do alto +2» · «de baixo −2» */}
      <LinhaDoAlto alto={g.alto} />
      {g.dano && linha("Dano", g.dano.texto, T.ink, g.dano.medio ? `média ${g.dano.medio}` : null, "dano")}
      {g.abate != null && linha("Abate", `${g.abate}%`, T.danger, g.vida != null ? `cai se o dano chegar a ${g.vida}` : null, "abate")}
      {g.critico && linha("Crítico", `${g.critico.chance}%`, T.amber, g.critico.dano ? `o dobro dos dados: ${g.critico.dano}` : null, "critico")}
      {g.golpesLivres.map((q) => (
        <span key={q.nome} className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.danger }}>{q.nome} tem um golpe livre{q.dano ? ` (${q.dano})` : ""}</span>
      ))}
    </section>
  );
}

/* ============================================================
   CB 18 · O EMPURRÃO POR EXTENSO E A FOLHA DO EMPURRÃO (formas.md §CB 18.4;
   Figma G1 374:2105, G2 374:2610). O veredito antes do clique: a casa
   final, a queda, a superfície e a colisão, cada uma com o seu dano. A
   conta (os rótulos, na ordem da peça) é rotulosDoEmpurrao, provada em
   Node; aqui só se desenha.
   ============================================================ */
/* a 1905, na coluna Tu: «Empurrar → Goblin», a chance, a linha do alto e as
   consequências por extenso, com o mesmo glifo dos rótulos do tabuleiro */
function OEmpurraoPorExtenso({ empurrao, alvo }) {
  const prev = empurrao && typeof empurrao === "object" ? empurrao.previsao : null;
  const v = (() => { try { return rotulosDoEmpurrao(prev, { vida: alvo ? alvo.vida : null }); } catch { return null; } })();
  if (!v) return null;
  const P = PREVISAO_DO_GOLPE;
  const alto = altoDaPrevisao(prev && prev.alto);
  return (
    <section aria-label={v.rotulo} className="flex flex-col shrink-0 w-full"
      style={{ padding: M.cartao + 4, gap: M.cartao, borderRadius: M.raio, background: T.pagina, border: `1px solid ${alfa(v.derruba ? T.danger : T.amber, 0.5)}` }}>
      <span className="tv-mono flex items-center" style={{ ...LEGENDA, color: T.amberSoft, gap: 6, fontWeight: 700 }}>
        Empurrar{alvo ? ` → ${alvo.nome}` : ""}{alvo && alvo.vida != null ? ` · ${Math.max(0, alvo.vida)} PV` : ""}
      </span>
      {v.chance != null && (
        <div className="flex items-baseline" style={{ gap: M.cartao }}>
          <span className="tv-mono shrink-0" style={{ ...LEGENDA, color: T.inkDim, width: 64 }}>Chance</span>
          <span className="tv-mono shrink-0" style={{ fontSize: P.letra.chance, fontWeight: 700, color: T.amberSoft }}>{v.chance}%</span>
        </div>
      )}
      {alto && <LinhaDoAlto alto={alto} />}
      <div className="flex flex-col items-start" style={{ gap: EMPURRAO_NA_MESA.rotulo.entre }}>
        {v.rotulos.map((r) => <RotuloDoEmpurrao key={r.tipo} rotulo={r} />)}
      </div>
    </section>
  );
}
/* «do alto +2» · «de baixo −2», ao lado de «sem cobertura» (§CB 18.4 b) */
function LinhaDoAlto({ alto }) {
  if (!alto) return null;
  return (
    <span className="tv-body flex items-center" style={{ fontSize: TIPOS.rotulo, gap: 6, color: alto.baixo ? ALTURA_NA_MESA.previsao.baixo : ALTURA_NA_MESA.previsao.alto }}>
      {alto.baixo ? "de baixo" : "do alto"} <AltoNaPrevisao alto={alto} />
    </span>
  );
}
/* no telefone, o primeiro toque num inimigo com Empurrar armado abre a
   folha (G2): o rosto e o PV do alvo, CHANCE, QUEDA e a consequência do chão
   («E ARDE») em Cormorant 30, a linha do alto, os rótulos e «Empurrar · 64%»
   com «Cancelar». O segundo toque no alvo também confirma. */
function FolhaDoEmpurrao({ empurrao, alvo, aoConfirmar, aoCancelar }) {
  const prev = empurrao && typeof empurrao === "object" ? empurrao.previsao : null;
  const v = (() => { try { return rotulosDoEmpurrao(prev, { vida: alvo ? alvo.vida : null }); } catch { return null; } })();
  if (!v || !alvo) return null;
  const P = PREVISAO_DO_GOLPE;
  const alto = altoDaPrevisao(prev && prev.alto);
  const num = (rotulo, valor, cor) => (
    <span className="flex flex-col">
      <span className="tv-display" style={{ fontSize: P.folha.numero, fontWeight: 700, color: cor, lineHeight: 1.1 }}>{valor}</span>
      <span className="tv-mono" style={{ ...LEGENDA, color: T.inkDim }}>{rotulo}</span>
    </span>
  );
  const sup = v.rotulos.find((r) => r.tipo === "superficie");
  const gesto = `Empurrar${v.chance != null ? ` · ${v.chance}%` : ""}`;
  /* o botão do gesto é o âmbar cheio do que vai acontecer, com o rótulo em onAccent (o da previsão) */
  const doGesto = { minHeight: ALVOS.piso, borderRadius: M.raioControle, background: T.amber, color: T.onAccent, fontWeight: 700, fontSize: M.letra.verbo, gap: 6 };
  return (
    <div role="dialog" aria-label={`Empurrar ${alvo.nome}`} className="fixed flex flex-col"
      style={{ left: 0, right: 0, bottom: 0, zIndex: 30, gap: M.cartao + 4, padding: `${M.cartao}px ${M.chipLadoX + 4}px ${M.chipLadoX + 4}px`, borderRadius: `${P.folha.raio}px ${P.folha.raio}px 0 0`, background: T.pagina, border: `1px solid ${v.derruba ? T.danger : T.amber}` }}>
      <span aria-hidden="true" className="self-center" style={{ width: P.folha.pega[0], height: P.folha.pega[1], borderRadius: P.folha.pega[1], background: T.lineStrong }} />
      <div className="flex items-center" style={{ gap: M.cartao }}>
        <RostoNaLuta inimigo ente={alvo} tamanho={M.retratoDosOutros} anel={T.danger} />
        <span className="flex flex-col min-w-0">
          <span className="tv-display truncate" style={{ fontSize: M.letra.nomeDoInimigo + 4, color: T.ink, fontWeight: 600 }}>{alvo.nome}</span>
          <span className="tv-mono" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>{Math.max(0, alvo.vida || 0)} PV</span>
        </span>
      </div>
      <div className="flex items-end" style={{ gap: M.entreColunas }}>
        {v.chance != null && num("Chance", `${v.chance}%`, T.amberSoft)}
        {v.queda > 0 && num("Queda", v.danoDaQueda ? `−${v.danoDaQueda}` : `${v.queda}`, T.danger)}
        {sup && v.danoDaSuperficie > 0 && num(sup.curto, `−${v.danoDaSuperficie}`, T.danger)}
        {v.danoDaColisao > 0 && num("Colide", `−${v.danoDaColisao}`, T.danger)}
      </div>
      {alto && <LinhaDoAlto alto={alto} />}
      <div className="flex flex-wrap" style={{ gap: EMPURRAO_NA_MESA.rotulo.entre }}>
        {v.rotulos.map((r) => <RotuloDoEmpurrao key={r.tipo} rotulo={r} />)}
      </div>
      <div className="flex" style={{ gap: M.cartao }}>
        <button onClick={aoConfirmar} className="tv-anel-foco tv-mono flex-1 flex items-center justify-center" style={doGesto}>
          {gesto}
        </button>
        <button onClick={aoCancelar} className="tv-anel-foco tv-mono flex items-center justify-center"
          style={{ minHeight: ALVOS.piso, padding: `0 ${M.chipLadoX + 4}px`, borderRadius: M.raioControle, background: T.panelSoft, color: T.ink, border: `1px solid ${T.line}`, fontSize: M.letra.verbo }}>
          Cancelar
        </button>
      </div>
      <span className="tv-mono text-center" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>tocar de novo em {alvo.nome} também confirma</span>
    </div>
  );
}

/* CB 3 · O AVISO DA ÁREA: quando o herói está dentro da área de um sopro,
   a coluna diz quanto e como escapar (`perigoFundo`, a chama) */
function AvisoDaArea({ aviso, pilula = false }) {
  if (!aviso) return null;
  return (
    <div role="status" className="flex items-start shrink-0 w-full" style={{ gap: pilula ? M.entreVerbos : M.cartao, padding: pilula ? `${M.chipLadoY / 2}px ${M.chipLadoX}px` : M.cartao + 4, borderRadius: pilula ? M.raioRedondo : M.raio, background: T.perigoFundo, border: `1px solid ${alfa(T.danger, 0.5)}` }}>
      <Glifo nome="chama" tamanho={pilula ? 16 : 20} cor={T.danger} />
      <span className="tv-body" style={{ fontSize: pilula ? TIPOS.rotulo : TIPOS.rotulo + 1, color: T.ink, lineHeight: pilula ? 1.3 : 1.45 }}>{aviso.texto}</span>
    </div>
  );
}

/* ---------------- A TIRA DO HERÓI — o telefone, numa linha ----------------
   E4: o quadro do telefone de E1 (40:447) sempre teve o herói resolvido
   numa tira de 44 px, e a decisão não foi "esconder numa gaveta", foi
   ESVAZIAR — três de sete campos já estavam no ecrã. Fica o que não tem
   outra casa: o rosto, PV, PM, a economia da rodada, os modificadores e
   o adversário mais perto com a vida em NÚMERO e a distância.

   B1/R21: E AO TOQUE ELA ABRE o TURNO ATUAL e NESTA BATALHA por cima do
   campo — *acervo à vista vai a um toque, nunca sai.* Por isso é um
   botão, e o retrato dentro dela não abre carta (botão dentro de botão).
   Ela ROLA na horizontal em vez de quebrar: uma tira que quebra deixa de
   ter 44 px e volta a comer o campo. */
function TiraDoHeroi({ personagem, economia, recursos = null, acaoBonus, selos = [], adversario = null, aberta, aoAbrir, passoM = null, passoTotal = null, vez = null }) {
  const grave = personagem.vidaMax > 0 && personagem.vida / personagem.vidaMax <= 1 / 3;
  return (
    <button onClick={aoAbrir} aria-expanded={aberta} aria-label={`${personagem.nome || "você"} — ver o turno e quem está nesta batalha`}
      className="tv-anel-foco flex items-center gap-2 shrink-0 overflow-x-auto tv-scroll px-2 w-full text-left"
      style={{ height: G.tiraDoHeroi, minHeight: G.tiraDoHeroi, borderRadius: M.raioControle, background: T.panel, border: `1px solid ${grave ? T.danger : alfa(T.amber, M.alfa.fio)}` }}>
      <RostoNaLuta ente={personagem} tamanho={M.retratoDoChip} anel={grave ? T.danger : T.amber} semCarta />
      <span className="tv-mono shrink-0" style={{ fontSize: M.letra.chip, color: grave ? T.danger : T.amberSoft, fontWeight: 700 }}>
        PV {Math.max(0, personagem.vida || 0)}/{personagem.vidaMax || 0}
      </span>
      {personagem.manaMax > 0 && (
        <span className="tv-mono shrink-0" style={{ fontSize: M.letra.chip, color: T.violetSoft }}>
          PM {Math.max(0, personagem.mana || 0)}/{personagem.manaMax}
        </span>
      )}
      {/* CB 9: a tira diz PV, os três pips e o movimento */}
      <Economia economia={economia} recursos={recursos} acaoBonus={acaoBonus} passoM={passoM} passoTotal={passoTotal} vez={vez} compacta />
      {selos.map((x) => <SeloDoModificador key={x.id} selo={x} />)}
      {adversario && (
        /* a vida dele em NÚMERO: à volta da ficha ela é um arco e lê-se
           como fracção, nunca como quanto falta */
        <span className="tv-mono shrink-0 pl-2" style={{ fontSize: M.letra.chip, color: T.danger, borderLeft: `1px solid ${T.line}` }}>
          {adversario.nome} {Math.max(0, adversario.vida || 0)}/{adversario.vidaMax || 0}{adversario.distanciaM != null ? ` · ${metrosTxt(adversario.distanciaM)} m` : ""}
        </span>
      )}
    </button>
  );
}

/* ---------------- A RODADA N (era «o que os dados disseram») ----------------
   CB 2: o que aconteceu na rodada anterior, uma linha por ação — quem → quem
   em mono 12 bold `inkMeio`, o desfecho em Spectral 14, `ink` o teu e
   `danger` o que te feriu. É o rastro dos dados crescido em registo: o turno
   deles deixa de ser uma rajada sem rasto. `registo`: [{ quem, alvo, diz,
   teu, feriu }] (a fiação lê-o do balanço das intenções e dos golpes);
   sem ele, as linhas do rastro de sempre. Rola dentro da coluna. */
/* §CB 17.2: no turno deles as linhas são as dos passos já mostrados — a do
   passo corrente é a `nova` (barra de 2 px âmbar, `ink`), as outras `lidas`
   (`inkMeio`); a que te feriu leva a barra e a letra `danger` (Figma 364:1462) */
function ORastroDosDados({ linhas, registo = null, rodada = null }) {
  const reg = Array.isArray(registo) ? registo.filter((x) => x && x.quem) : [];
  if (!reg.length && !linhas.length) return null;
  return (
    <div className="shrink-0" style={{ padding: M.cartao, borderRadius: M.raioControle, background: T.panel, border: `1px solid ${T.line}` }}>
      {rodada != null && rodada > 0 && <div className="tv-mono" style={{ ...LEGENDA, color: T.inkDim, marginBottom: 6 }}>A rodada {rodada}</div>}
      {reg.length > 0 ? reg.map((l, i) => (
        <div key={l.chave != null ? l.chave : i} className={`flex items-baseline flex-wrap${l.nova ? " tv-fade" : ""}`}
          style={{ gap: 6, marginBottom: 6, animationDuration: l.nova ? `${TURNO_DELES.linhaNova}ms` : undefined,
            ...(l.nova || (l.turno && l.feriu) ? { paddingLeft: M.cartao - 2, borderLeft: `2px solid ${l.feriu ? T.danger : T.amber}` } : {}) }}>
          <span className="tv-mono" style={{ fontSize: TIPOS.piso, fontWeight: 700, color: l.turno && !l.nova ? T.inkMeio : l.nova ? T.ink : T.inkMeio }}>{l.quem}{l.alvo ? ` → ${l.alvo}` : ""}</span>
          <span className="tv-body" style={{ fontSize: TIPOS.corpo - 1, color: l.feriu ? T.danger : l.nova || l.teu ? T.ink : T.inkMeio }}>{l.diz}</span>
        </div>
      )) : linhas.map((l, i) => (
        <div key={i} className="tv-mono flex items-start gap-1" style={{ fontSize: M.letra.legenda, color: T.inkDim, opacity: 0.5 + (0.5 * (i + 1)) / linhas.length }}><Glifo nome="dado" tamanho={14} /> <span>{l}</span></div>
      ))}
    </div>
  );
}

/* ============================================================
   NESTA BATALHA — quem está de pé

   Os dois lados no mesmo painel, porque a pergunta é uma só: quem aguenta
   e quem cai. O aliado com o rosto e a vida em número; o inimigo com a
   borda de perigo, a distância (do veredito, que já a mediu) e a barra.
   Os caídos ficam, esmaecidos — a luta que se lê de relance inclui quem
   já caiu.
   ============================================================ */
/* B1b: o painel CEDE em altura (`flex: 0 1 auto`) e a lista rola DENTRO
   dele — o rótulo fica, e todos os participantes continuam lá, a uma
   rolagem. Antes ele era `shrink-0` e saía cortado pelo pé da coluna,
   com o cartão do inimigo fora da tela (a foto da pessoa, 1907 × 845).
   `cede` é só do monitor: no telefone o painel abre por cima do campo, e
   ali quem rola é a folha inteira, como antes. */
/* CB 2 · ELES: «NESTA RODADA, ELES VÃO» e um cartão por inimigo — o rosto 38
   com aro `danger`, o nome em Cormorant 20, a distância, a barra do PV e A
   PÍLULA DA INTENÇÃO à direita; o alvo da previsão ganha aro âmbar 2. Quem
   anda contigo fica por baixo («Contigo»): a vida dele não pode sair da
   tela da luta. */
/* §CB 16.3: com «Eles» estreita (< 400: a coluna a 321, a gaveta, o
   telefone) a pílula da intenção desce para a SEGUNDA LINHA do cartão, por
   baixo da barra do PV — à direita ela espremia o nome e a barra. */
/* §CB 17.2: no turno deles o cartão de quem age leva aro `danger` 2 e quem já
   agiu fica a 45 % (`age`, `agiram`) */
function QuemEstaDePe({ grupo, inimigos, veredito, children, compacto = false, cede = false, intencaoDe = null, alvo = "", realce = null, aoRealcar = null, estreito = false, age = "", agiram = null }) {
  const jaAgiu = new Set(Array.isArray(agiram) ? agiram : []);
  const m = compacto ? M.aperto : M;
  return (
    <div className="flex flex-col w-full min-h-0 overflow-hidden"
      style={{ flex: cede ? "0 1 auto" : "0 0 auto", padding: m.outrosRespiro, gap: m.outrosEntre, borderRadius: M.raio, background: T.panel, border: `1px solid ${T.line}` }}>
      <span className="tv-mono shrink-0" style={{ ...LEGENDA, color: T.inkDim }}>{intencaoDe && intencaoDe.size ? "Nesta rodada, eles vão" : "Nesta batalha"}</span>
      <div className="flex flex-col min-h-0 overflow-y-auto tv-scroll" style={{ gap: m.outrosEntre }}>
      {inimigos.map((e, i) => {
        const vz = ((veredito && veredito.alvos) || []).find((x) => x.nome === e.nome);
        const vista = intencaoDe ? intencaoDe.get(e.nome) : null;
        const eOAlvo = !!alvo && alvo === e.nome && !e.derrotado;
        return (
          <div key={`i${i}`} className="flex flex-col"
            onMouseEnter={aoRealcar ? () => aoRealcar(e.nome) : undefined} onMouseLeave={aoRealcar ? () => aoRealcar(null) : undefined}
            style={{ gap: M.cartao, padding: M.cartao, borderRadius: M.raioControle, background: T.pagina,
              border: `${eOAlvo || age === e.nome ? 2 : 1}px solid ${age === e.nome ? T.danger : eOAlvo || realce === e.nome ? T.amber : e.derrotado ? T.line : T.danger}`,
              opacity: e.derrotado ? 0.5 : jaAgiu.has(e.nome) ? TURNO_DELES.agiu : 1 }}>
            <div className="flex items-center" style={{ gap: M.chipEntre }}>
              <span style={{ filter: e.derrotado ? "grayscale(1)" : "none" }}>
                <RostoNaLuta inimigo ente={e} tamanho={M.retratoDosOutros} anel={e.derrotado ? T.line : T.danger} />
              </span>
              <span className="flex flex-col flex-1 min-w-0" style={{ gap: 4 }}>
                <span className="flex items-baseline gap-1.5 min-w-0">
                  <span className="tv-display truncate" style={{ fontSize: M.letra.nomeDoInimigo, color: e.derrotado ? T.inkDim : T.ink, fontWeight: 600, lineHeight: 1.1, textDecoration: e.derrotado ? "line-through" : "none" }}>{e.nome}</span>
                  {(e.gd || 0) > 0 && <span className="tv-mono" title={tituloDe(e.gd)} style={{ fontSize: M.letra.legenda, color: T.amber }}>GD {e.gd}</span>}
                  {vz && !e.derrotado && (
                    <span className="tv-mono shrink-0" style={{ fontSize: M.letra.valorDoOutro, color: vz.ok ? T.amberSoft : T.inkDim }}>
                      {metrosTxt(vz.distanciaM)} m
                    </span>
                  )}
                </span>
                {!e.derrotado && <Recurso rotulo="PV" atual={e.vida} max={e.vidaMax} cor={T.danger} />}
                {estreito && vista && !e.derrotado && <span className="self-start"><PilulaDaIntencao vista={vista} distanciaM={vz ? vz.distanciaM : null} /></span>}
              </span>
              {!estreito && vista && !e.derrotado && <PilulaDaIntencao vista={vista} distanciaM={vz ? vz.distanciaM : null} />}
            </div>
          </div>
        );
      })}
      {grupo.length > 0 && <span className="tv-mono shrink-0" style={{ ...LEGENDA, color: T.inkDim, marginTop: 4 }}>Contigo</span>}
      {grupo.map((g, gi) => {
        const pv = Math.max(0, g.vida || 0), pvMax = Math.max(1, g.vidaMax || 1);
        const caido = pv <= 0;
        const critico = !caido && pv / pvMax <= 1 / 3;
        return (
          <div key={`${g.nome}-${gi}`} className="flex items-center"
            style={{ gap: M.chipEntre, padding: M.cartao, borderRadius: M.raioControle, background: T.panelSoft, border: `1px solid ${critico ? T.danger : T.line}`, opacity: caido ? 0.5 : 1 }}>
            <span style={{ filter: caido ? "grayscale(1)" : "none" }}>
              <RostoNaLuta ente={g} tamanho={M.retratoDosOutros} anel={caido ? T.line : T.ok} />
            </span>
            <span className="flex flex-col min-w-0 flex-1" style={{ gap: 5 }}>
              <span className="tv-display truncate" style={{ fontSize: M.letra.nomeDoAliado, color: caido ? T.inkDim : T.ink, fontWeight: 600, lineHeight: 1.1 }}>{g.nome}</span>
              <span className="tv-mono" style={{ fontSize: M.letra.valorDoOutro, color: caido ? T.inkDim : critico ? T.danger : T.ok }}>{pv}/{pvMax}</span>
            </span>
          </div>
        );
      })}
      {children}
      </div>
    </div>
  );
}

/* ---------------- OS ALVOS DECLARADOS ----------------
   Vem inteiro da tela antiga, e continua a DECLARAR alvo: não dispara
   nada. Mora dentro de NESTA BATALHA (B1), ao lado de quem ele nomeia. O
   que é alvo tem o custo escrito dentro, e as duas recusas ficam
   separadas na própria pílula — porque andar resolve uma e não a outra. */
function AlvosDeclarados({ inimigos, nGolpes, alvosGolpe, aoDeclarar, aoLimpar, acaoTexto, veredito }) {
  const vivos = inimigos.filter((e) => !e.derrotado && Number(e.vida || 0) > 0);
  if (vivos.length <= 1) return null;
  return (
    <div className="rounded-xl p-2.5 shrink-0" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="tv-mono uppercase tracking-widest" style={{ fontSize: M.letra.legenda, color: T.amberSoft }}>
          {nGolpes > 1 ? `Declare seus ${nGolpes} golpes` : "Escolha o alvo"}{acaoTexto ? ` · ${acaoTexto}` : ""}{veredito ? ` · seu alcance ${metrosTxt(veredito.alcanceM)} m` : ""}
        </span>
        {alvosGolpe.length > 0 && (
          <button onClick={aoLimpar} className="tv-mono px-1.5 py-0.5 rounded" style={{ fontSize: M.letra.legenda, border: `1px solid ${T.line}`, color: T.inkDim }}>limpar</button>
        )}
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: nGolpes }).map((_, gi) => (
          <div key={gi} className="flex items-center gap-1.5 flex-wrap">
            <span className="tv-mono shrink-0 w-12" style={{ fontSize: M.letra.legenda, color: T.inkDim }}>{nGolpes > 1 ? `golpe ${gi + 1}` : "alvo"}</span>
            {vivos.map((e) => {
              const escolhido = alvosGolpe[gi] === e.nome;
              const vz = ((veredito && veredito.alvos) || []).find((x) => x.nome === e.nome);
              const fora = !!vz && !vz.ok;
              return (
                <button key={e.nome} onClick={() => aoDeclarar(gi, escolhido ? null : e.nome)}
                  className="tv-mono px-2 py-1 rounded-lg"
                  style={{ fontSize: M.letra.legenda, background: escolhido ? T.danger : "transparent", color: escolhido ? T.ink : fora ? T.inkDim : T.ink, border: `1px ${fora ? "dashed" : "solid"} ${escolhido ? T.danger : T.line}` }}>
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

/* ---------------- A BOLSA — e usar não gasta o turno ----------------
   B1: abre por cima da fileira, dentro de `SUA PRÓXIMA AÇÃO`. */
function BolsaDeCombate({ pocoes, bolsa, aoUsar }) {
  if (!pocoes.length && !bolsa.length) return null;
  return (
    <div className="rounded-xl p-2 shrink-0" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
      <div className="tv-mono uppercase tracking-widest mb-1.5" style={{ fontSize: M.letra.legenda, color: T.violetSoft }}>à mão · não gasta o turno</div>
      <div className="flex flex-wrap gap-1">
        {(bolsa.length ? bolsa : pocoes).map((it) => (
          <button key={it.nome} onClick={() => aoUsar && aoUsar(it.nome)}
            className="tv-anel-foco flex items-center gap-2 text-left rounded-lg px-2 py-1.5"
            style={{ background: T.panel, border: `1px solid ${T.line}`, minHeight: ALVOS.piso }}>
            <span className="tv-mono text-sm shrink-0">{it.icone}</span>
            <span className="min-w-0">
              <span className="tv-mono block truncate" style={{ fontSize: M.letra.chip, color: T.ink }}>{it.nome}{it.qtd > 1 ? ` ×${it.qtd}` : ""}</span>
              <span className="tv-mono block truncate" style={{ fontSize: M.letra.legenda, color: T.inkDim }}>{it.detalhe}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- CB 9 · A FOLHA DA PREVISÃO (telefone, Figma `346:521`) ----------------
   Sobe do fundo por cima dos verbos (`pagina`, aro âmbar, raio 16 em cima,
   a pega 36 × 4), com o rosto e o PV do alvo, TRÊS NÚMEROS GRANDES (ACERTO,
   DANO, ABATE), a faixa do golpe livre quando o caminho o provoca, e o botão
   que diz o gesto e a chance. O dedo nunca tapa o número. O segundo toque no
   alvo também confirma (quem decide é a tela, em `tocarInimigo`). */
function FolhaDaPrevisao({ previsao, alvo, anda = false, aoConfirmar, aoCancelar }) {
  const v = pilulaDaPrevisao(previsao, { caminho: anda ? { metros: null } : null });
  const g = golpePorExtenso(previsao);
  if (!v || !alvo) return null;
  const P = PREVISAO_DO_GOLPE;
  const num = (rotulo, valor, cor) => (
    <span className="flex flex-col">
      <span className="tv-display" style={{ fontSize: P.folha.numero, fontWeight: 700, color: cor, lineHeight: 1.1 }}>{valor}</span>
      <span className="tv-mono" style={{ ...LEGENDA, color: T.inkDim }}>{rotulo}</span>
    </span>
  );
  const gesto = `${anda ? "Andar e atacar" : "Atacar"}${v.chance != null ? ` · ${v.chance}%` : ""}`;
  /* o botão do gesto é o âmbar cheio do que vai acontecer, com o rótulo em onAccent */
  const doGesto = { minHeight: ALVOS.piso, borderRadius: M.raioControle, background: T.amber, color: T.onAccent, fontWeight: 700, fontSize: M.letra.verbo, gap: 6 };
  return (
    /* sobe do fundo POR CIMA dos verbos: fixa no pé, e o campo fica com a
       altura dele (medido a 375 × 812: dentro do fluxo, a folha empurrava o
       campo até zero) */
    <div role="dialog" aria-label={`O teu golpe contra ${alvo.nome}`} className="fixed flex flex-col"
      style={{ left: 0, right: 0, bottom: 0, zIndex: 30, gap: M.cartao + 4, padding: `${M.cartao}px ${M.chipLadoX + 4}px ${M.chipLadoX + 4}px`, borderRadius: `${P.folha.raio}px ${P.folha.raio}px 0 0`, background: T.pagina, border: `1px solid ${T.amber}` }}>
      <span aria-hidden="true" className="self-center" style={{ width: P.folha.pega[0], height: P.folha.pega[1], borderRadius: P.folha.pega[1], background: T.lineStrong }} />
      <div className="flex items-center" style={{ gap: M.cartao }}>
        <RostoNaLuta inimigo ente={alvo} tamanho={M.retratoDosOutros} anel={T.danger} />
        <span className="flex flex-col min-w-0">
          <span className="tv-display truncate" style={{ fontSize: M.letra.nomeDoInimigo + 4, color: T.ink, fontWeight: 600 }}>{alvo.nome}</span>
          <span className="tv-mono" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>{Math.max(0, alvo.vida || 0)} PV</span>
        </span>
      </div>
      {v.estado === "sem-vista" ? (
        <span className="tv-body" style={{ fontStyle: "italic", color: T.inkDim }}>sem linha de vista</span>
      ) : (
        <div className="flex items-end" style={{ gap: M.entreColunas }}>
          {v.chance != null && num("Acerto", `${v.chance}%`, T.amberSoft)}
          {v.dano && num("Dano", v.dano, T.ink)}
          {g && g.abate != null && num("Abate", `${g.abate}%`, T.danger)}
        </div>
      )}
      {g && g.golpesLivres.length > 0 && (
        <div className="flex items-start" style={{ gap: M.cartao, padding: M.cartao, borderRadius: M.raioControle, background: T.perigoFundo }}>
          <Glifo nome="espadas" tamanho={16} cor={T.danger} />
          <span className="tv-body" style={{ fontSize: TIPOS.rotulo + 1, color: T.ink }}>{g.golpesLivres.map((q) => `${q.nome} tem um golpe livre${q.dano ? ` (${q.dano})` : ""}`).join("; ")}.</span>
        </div>
      )}
      <div className="flex" style={{ gap: M.cartao }}>
        <button onClick={aoConfirmar} className="tv-anel-foco tv-mono flex-1 flex items-center justify-center" style={doGesto}>
          {anda && <Glifo nome="passo" tamanho={16} cor={T.onAccent} />}{gesto}
        </button>
        <button onClick={aoCancelar} className="tv-anel-foco tv-mono flex items-center justify-center"
          style={{ minHeight: ALVOS.piso, padding: `0 ${M.chipLadoX + 4}px`, borderRadius: M.raioControle, background: T.panelSoft, color: T.ink, border: `1px solid ${T.line}`, fontSize: M.letra.verbo }}>
          Cancelar
        </button>
      </div>
      <span className="tv-mono text-center" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>tocar de novo em {alvo.nome} também confirma</span>
    </div>
  );
}

/* CB 9 · O MARCADOR FORA DE VISTA: quem importa e a câmara não apanhou fica
   na borda da janela (o rosto 18 e a distância, «9 m ›», aro `danger`), e
   tocá-lo leva a câmara até ele. */
const POSICAO_DA_BORDA = {
  direita: { right: 4, top: "50%", transform: "translateY(-50%)" },
  esquerda: { left: 4, top: "50%", transform: "translateY(-50%)" },
  cima: { top: 4, left: "50%", transform: "translateX(-50%)" },
  baixo: { bottom: 4, left: "50%", transform: "translateX(-50%)" },
};
function MarcadorForaDeVista({ marcador, ente, aoIr }) {
  const seta = { direita: "›", esquerda: "‹", cima: "˄", baixo: "˅" }[marcador.borda] || "›";
  return (
    <button onClick={aoIr} aria-label={`${marcador.nome}, fora de vista${marcador.distanciaM != null ? `, a ${metrosTxt(marcador.distanciaM)} m` : ""} — levar a câmara até ele`}
      className="tv-anel-foco tv-mono absolute inline-flex items-center"
      style={{ ...POSICAO_DA_BORDA[marcador.borda], zIndex: 6, minHeight: ALVOS.piso, gap: 4, padding: `0 ${M.chipLadoX}px`, borderRadius: INTENCAO_NA_MESA.raio * 2,
        background: T.pagina, border: `${INTENCAO_NA_MESA.aro}px solid ${T.danger}`, color: T.danger, fontSize: TIPOS.piso, fontWeight: 700 }}>
      <RostoNaLuta inimigo ente={ente} tamanho={INTENCAO_NA_MESA.rosto} anel={T.danger} semCarta />
      {marcador.distanciaM != null ? `${metrosTxt(marcador.distanciaM)} m` : ""} {seta}
    </button>
  );
}

/* ---------------- O FOCO DA ESCOLHA ----------------
   O fecho da coluna do quadro: os fios com a runa, e a frase que devolve
   a vez a quem joga. Texto fixo da tela — é a mesa a falar, não o sistema. */
const ENTRELINHA_DO_FOCO = 1.2;
const ENTRELINHA_DO_DIZ = 1.5;
/* B1b: a altura que o foco pede, somada da MESMA tabela que o desenha —
   relação, não número novo. É com ela que a coluna decide se ele cabe. */
const ALTURA_DO_FOCO = Math.ceil(M.escolhasRespiro * 2 + M.glifoDaRuna + M.chipEntre * 2
  + M.letra.foco * ENTRELINHA_DO_FOCO + M.letra.focoDiz * ENTRELINHA_DO_DIZ);
function FocoDaEscolha() {
  return (
    <div className="flex flex-col shrink-0 w-full" style={{ padding: M.escolhasRespiro, gap: M.chipEntre }}>
      <FioComRuna dosDoisLados />
      <p className="tv-display text-center" style={{ fontSize: M.letra.foco, color: T.ink, margin: 0, lineHeight: ENTRELINHA_DO_FOCO }}>O próximo movimento é seu.</p>
      <p className="tv-body text-center" style={{ fontSize: M.letra.focoDiz, color: T.inkDim, margin: 0, lineHeight: ENTRELINHA_DO_DIZ }}>Escolha sua ação e descreva como.</p>
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
  const estreito = usarMidia(CORTE_ESTREITO);
  const curto = usarMidia(CORTE_CURTO) && !noTelefone;
  const baixo = usarMidia(CORTE_BAIXO) && !noTelefone;
  const janelaBaixa = usarMidia(CORTE_JANELA_BAIXA) && !noTelefone;
  const grosso = usarMidia(CORTE_GROSSO);
  const [armado, setArmado] = React.useState("");
  const [bolsaAberta, setBolsaAberta] = React.useState(false);
  /* o turno atual e NESTA BATALHA abertos por cima do campo — só no
     telefone, e estado de tela */
  const [fichaAberta, setFichaAberta] = React.useState(false);
  /* quantas casas o passo acende — `null` é "ainda não medido", e nesse
     estado nada se impede: um verbo impedido por falta de medida é a
     tela a mentir ao contrário */
  const [casasDoPasso, setCasasDoPasso] = React.useState(null);
  /* a razão do verbo que recusou armar, a caminho da linha do veredito.
     É estado de TELA e não de jogo: ela responde ao último toque, e o
     último toque não se guarda em save nenhum. */
  const [recusado, setRecusado] = React.useState("");
  /* CB · estado de TELA, nunca de jogo: quem está sob o rato na fila (acende
     a ficha), o verbo apontado (põe o recurso dele em jogo), e a gaveta Eles
     aberta quando a mesa só tem duas colunas */
  const [realce, setRealce] = React.useState(null);
  const [verboSobre, setVerboSobre] = React.useState(null);
  const [elesAberto, setElesAberto] = React.useState(false);

  /* ============================================================
     CB 17.2 · O TURNO DELES, CONTADO EM PASSOS
     `p.turnoDeles`: { passos (passosDoTurno), indice (o passo corrente; no
     fim, passos.length), acelerado (o 2×), aoSaltar, aoAcelerar }. O estado
     já está aplicado quando o primeiro passo começa: contar é só leitura.
     O relógio que anda o `indice` é de quem monta (duracaoDosPassos, com
     TURNO_DELES); aqui só se pinta, e QUALQUER ENTRADA SALTA: Saltar ›,
     Esc, Espaço, escrever no `como?`, um verbo (salta e arma), e um toque
     no tabuleiro, que só salta (é consumido: o clique num inimigo anda e
     ataca, e é irreversível). Nunca prende mais de 4 s.
     ============================================================ */
  const td = p.turnoDeles && typeof p.turnoDeles === "object" && Array.isArray(p.turnoDeles.passos) ? p.turnoDeles : null;
  const indiceDoTurno = td ? Math.max(0, Number(td.indice) || 0) : 0;
  const passoDeles = td && indiceDoTurno < td.passos.length ? td.passos[indiceDoTurno] : null;
  const contando = !!passoDeles && !p.fim;
  const saltarTurno = React.useCallback(() => {
    try { if (td && td.aoSaltar) td.aoSaltar(); } catch (e) { console.warn("TelaDeBatalha: saltar o turno deles falhou", e); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [td && td.aoSaltar]);
  React.useEffect(() => {
    if (!contando) return undefined;
    const ouve = (e) => {
      const escrevendo = e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName || "");
      if (e.key === "Escape" || e.key === " " || e.key === "Spacebar") {
        if (e.key !== "Escape" && !escrevendo) e.preventDefault();
        saltarTurno();
      } else if (escrevendo) saltarTurno();
    };
    window.addEventListener("keydown", ouve);
    return () => window.removeEventListener("keydown", ouve);
  }, [contando, saltarTurno]);
  /* o toque no tabuleiro, durante o turno deles, só salta: o pointerdown é
     consumido, e o clique que vem atrás dele também */
  const engolirCliqueRef = React.useRef(false);
  /* no fim do turno deles «A tua vez» volta com um pulso (uma vez) */
  const [pulsoDaVez, setPulsoDaVez] = React.useState(0);
  const contavaRef = React.useRef(false);
  React.useEffect(() => {
    if (contavaRef.current && !contando) setPulsoDaVez((n) => n + 1);
    contavaRef.current = contando;
  }, [contando]);
  /* o lance do herói na mesa (a grade di-lo): «O teu golpe» marca a face */
  const [lanceNaMesa, setLanceNaMesa] = React.useState(null);
  /* CB 18.5 · A LINHA DA REAÇÃO (Letreiro · repetida): só a linha, no Pé do
     campo, a leitura e o esvanecer de REACAO_NA_MESA. A primeira de cada
     tipo pousa no tabuleiro (a grade); a chave é a mesma dos dois lados. */
  const reacoesVistasRef = React.useRef(new Set());
  const [linhaDaReacao, setLinhaDaReacao] = React.useState("");
  React.useEffect(() => {
    if (!Array.isArray(p.reacoes) || !p.reacoes.length) return undefined;
    let nova = null;
    try {
      p.reacoes.forEach((ev, i) => {
        if (!ev || typeof ev !== "object") return;
        const chave = chaveDaReacao(ev, i);
        if (reacoesVistasRef.current.has(chave)) return;
        reacoesVistasRef.current.add(chave);
        if (!tempoDaReacao(ev, { deles: contando }).primeira) nova = ev;
      });
      const l = nova ? letreiroDaReacao(nova) : null;
      if (!l) return undefined;
      setLinhaDaReacao(`${l.titulo}${l.linha ? ` · ${l.linha}` : ""}`);
    } catch (e) { console.warn("TelaDeBatalha: a linha da reação não se leu", e); return undefined; }
    const tid = setTimeout(() => setLinhaDaReacao(""), REACAO_NA_MESA.leitura + REACAO_NA_MESA.esvai);
    return () => clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.reacoes]);
  /* CB 2 · A MESA INTEIRA, MEDIDA: a largura e a altura da tela da luta
     decidem o arranjo (três colunas, duas, ou o telefone) e a largura das
     colunas, que cedem até 320 para o campo ficar quadrado
     (`geometriaDaMesa`, provada em Node a 1905, 1366 e 1024). */
  const raizRef = React.useRef(null);
  const [mesaMedida, setMesaMedida] = React.useState({ largura: 0, altura: 0 });
  React.useEffect(() => {
    const el = raizRef.current;
    if (!el) return undefined;
    try {
      const mede = () => setMesaMedida({ largura: el.clientWidth || 0, altura: el.clientHeight || 0 });
      mede();
      if (typeof ResizeObserver === "undefined") return undefined;
      const ro = new ResizeObserver(() => mede());
      ro.observe(el);
      return () => ro.disconnect();
    } catch (e) { console.warn("TelaDeBatalha: medir a mesa falhou", e); return undefined; }
  }, []);

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
     ACABOU DE ACONTECER. Um Enter ali mandaria fugir de uma luta que já
     não existe. Os três fins chegam todos pelo MESMO sinal — `p.fim` vira
     `true` — e por isso ficam resolvidos no mesmo ponto, uma vez só. */
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

  /* NA JANELA BAIXA, ARMAR TRAZ O CAMPO À VISTA. A página da luta rola ali,
     e a fileira dos verbos mora por baixo do campo: quem toca Mover está a
     olhar para os verbos, com o campo meio fora do ecrã por cima. O verbo
     armado pede uma casa — então a casa vem até ao dedo (`nearest`: se o
     campo já está inteiro à vista, nada se move). Só a janela baixa: nas
     outras o campo já está sempre à vista. */
  const campoRef = React.useRef(null);
  React.useEffect(() => {
    if (!armado || !janelaBaixa) return;
    try { if (campoRef.current && campoRef.current.scrollIntoView) campoRef.current.scrollIntoView({ block: "nearest" }); }
    catch (e) { console.warn("TelaDeBatalha: trazer o campo à vista falhou", e); }
  }, [armado, janelaBaixa]);

  /* a ficha aberta por cima do campo fecha por toque no fundo, pelo botão
     e por `Esc` — as três portas de saída de um véu (R21) */
  React.useEffect(() => {
    if (!fichaAberta) return undefined;
    const ouve = (e) => { if (e.key === "Escape") setFichaAberta(false); };
    window.addEventListener("keydown", ouve);
    return () => window.removeEventListener("keydown", ouve);
  }, [fichaAberta]);
  React.useEffect(() => { if (!noTelefone) setFichaAberta(false); }, [noTelefone]);

  /* ============================================================
     A CASA ENCHE A JANELA (B1) — medida, nunca suposta

     A largura útil da janela sai de um `ResizeObserver`, e o tabuleiro
     faz a conta do lado (largura ÷ colunas, nunca abaixo do piso). O lado
     que ele escolheu volta por `aoMedirOLado`, e é com ele que a câmara
     enquadra: uma câmara que contasse 48 numa casa de 62 poria o herói
     uma fila e meia fora do sítio. Guardado num ref, porque mudar o lado
     não é razão para a câmara se mexer (regra 2, abaixo). */
  /* B1b: E A ALTURA TAMBÉM. O tabuleiro passa a caber INTEIRO na caixa
     (lado = o menor entre largura ÷ colunas e altura ÷ linhas), e por isso
     a janela mede as duas. A altura dela não depende do tabuleiro — é o
     que sobra na coluna (`flex: 1`, `min-height: 0`) —, logo medir e
     redesenhar não se perseguem. */
  const janelaRef = React.useRef(null);
  const [larguraDaJanela, setLarguraDaJanela] = React.useState(0);
  const [alturaDaJanela, setAlturaDaJanela] = React.useState(0);
  const ladoRef = React.useRef(ALVOS.piso);
  /* QUANDO O LADO MUDA, A CÂMARA VOLTA A PERGUNTAR — e só pergunta: a
     regra 2 continua a mandar (só se move se for obrigada). Medido no
     telefone: o enquadramento corria com o lado ainda do monitor (64) numa
     casa que já era de 48, e o herói abria cortado na borda esquerda. */
  const enquadrarRef = React.useRef(null);
  const aoMedirOLado = React.useCallback((lado) => {
    if (!(lado > 0) || lado === ladoRef.current) return;
    ladoRef.current = lado;
    /* sem batida de espera: quem chama é o efeito do tabuleiro, DEPOIS do
       commit — o campo já tem o tamanho novo, e um terceiro pedido de
       quadro aqui seria contar tiques (D5e) */
    try { if (enquadrarRef.current) enquadrarRef.current(); } catch { /* nunca custa o turno */ }
  }, []);
  React.useEffect(() => {
    const el = janelaRef.current;
    if (!el) return undefined;
    try {
      const mede = () => { setLarguraDaJanela(el.clientWidth || 0); setAlturaDaJanela(el.clientHeight || 0); };
      mede();
      if (typeof ResizeObserver === "undefined") return undefined;
      const ro = new ResizeObserver(() => mede());
      ro.observe(el);
      return () => ro.disconnect();
    } catch (e) { console.warn("TelaDeBatalha: medir a janela do campo falhou", e); return undefined; }
  }, [noTelefone]);
  /* B1b · O QUE SOBRA NA COLUNA DA DIREITA. O turno atual e NESTA BATALHA
     vêm primeiro; o "foco da escolha" e o rastro dos dados moram no que
     sobrar por baixo deles, e é o foco o PRIMEIRO a ceder: só aparece se
     couber inteiro (meia frase cortada é pior do que nenhuma). A caixa da
     sobra tem base zero, logo a altura dela não depende do que está dentro
     — medir e mostrar não se perseguem. */
  const [sobraEl, setSobraEl] = React.useState(null);
  const [alturaDaSobra, setAlturaDaSobra] = React.useState(0);
  React.useEffect(() => {
    if (!sobraEl) return undefined;
    try {
      const mede = () => setAlturaDaSobra(sobraEl.clientHeight || 0);
      mede();
      if (typeof ResizeObserver === "undefined") return undefined;
      const ro = new ResizeObserver(() => mede());
      ro.observe(sobraEl);
      return () => ro.disconnect();
    } catch (e) { console.warn("TelaDeBatalha: medir a sobra da coluna falhou", e); return undefined; }
  }, [sobraEl]);
  /* o pé da arena: o tabuleiro escreve lá a área de movimento, o custo no
     terreno e as suas tarjas (passo, golpe livre, mira, ampliar), fora da
     janela que rola — no quadro, a legenda do alcance */
  const [peDaArena, setPeDaArena] = React.useState(null);

  /* ============================================================
     O ENQUADRAMENTO — as três regras de E1, e a primeira é lei

     1. QUANDO A LUTA ABRE, A CASA DO HERÓI ESTÁ NO CENTRO DA ÁREA LIVRE.
        A área livre, e não o centro geométrico: o terço de baixo da
        janela é território emprestado à reação, e é também a faixa que o
        próprio polegar tapa. *Um tabuleiro que rola e abre no lugar
        errado é pior do que um que não rola.*

     2. A CÂMARA SÓ SE MOVE QUANDO É OBRIGADA — reenquadra quando quem age
        chegaria a menos de UMA casa da borda, nunca a cada passo. *Uma
        câmara que corrige todo passo faz o campo parecer escorregar
        debaixo do jogador.*

     3. NA VEZ DE UM INIMIGO A CÂMARA NÃO VAI ATRÁS. Aqui isso sai de
        graça, e é por construção: este efeito só escuta a casa do HERÓI.

     Os dois números saem da tabela: a reserva (um terço) diz onde é a
     área livre, e a folga (uma casa) diz quando a câmara é obrigada. */
  const heroi = combate.heroi || null;
  const casaDoHeroi = heroi && heroi.x != null ? `${heroi.x},${heroi.y}` : "";
  React.useEffect(() => {
    if (!casaDoHeroi) { enquadrarRef.current = null; return undefined; }
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
      const lado = ladoRef.current || ALVOS.piso;
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
    enquadrarRef.current = enquadrar;
    return () => { vivo = false; cancelAnimationFrame(id); };
  }, [casaDoHeroi, noTelefone]);

  /* ============================================================
     CB · O QUE A MESA SABE DO TURNO — a intenção de cada inimigo, o alvo da
     previsão, o gesto no inimigo, e a câmara do telefone
     ============================================================ */
  const intencoes = Array.isArray(p.intencoes) ? p.intencoes : [];
  const intencaoDe = new Map(intencoes.filter((i) => i && i.inimigo && i.vista).map((i) => [i.inimigo, i.vista]));
  const prevGolpe = p.previsaoDoGolpe && typeof p.previsaoDoGolpe === "object" ? p.previsaoDoGolpe : null;
  const alvoDaPrevisao = prevGolpe && prevGolpe.alvo ? String(prevGolpe.alvo) : "";
  const enteDoAlvo = alvoDaPrevisao ? inimigos.find((e) => e.nome === alvoDaPrevisao) || null : null;
  const geo = (() => { try { return geometriaDaMesa({ largura: mesaMedida.largura, altura: mesaMedida.altura, grosso }); } catch { return { arranjo: "tres", coluna: B3.coluna }; } })();
  /* §CB 16: a altura dos alvos da barra sai do PONTEIRO (40 rato, 48 toque;
     48 no telefone), e o pip no verbo só com o centro ≥ 660 */
  const altoDoVerbo = noTelefone ? B3.telefone.verbo : grosso ? B3.verbo.grosso : B3.verbo.fino;
  const comPip = !noTelefone && !!geo.comPip;
  const arranjo = noTelefone ? "telefone" : mesaMedida.largura > 0 && geo.arranjo !== "telefone" ? geo.arranjo : "tres";
  React.useEffect(() => { if (arranjo !== "duas") setElesAberto(false); }, [arranjo]);
  /* AS COLUNAS MEXEM NA JANELA DO CAMPO, E A JANELA VOLTA A SER MEDIDA. Medido
     a 1905 × 1000 na página de prova: a primeira medida da janela é do quadro
     em que as colunas ainda não tinham a largura da conta (1236 × 518), e o
     observador não voltou a falar quando elas a ganharam — a casa ficava em
     35 numa janela que dava 42. Quando a geometria muda, mede-se outra vez. */
  React.useEffect(() => {
    try {
      const el = janelaRef.current;
      if (!el) return;
      setLarguraDaJanela(el.clientWidth || 0); setAlturaDaJanela(el.clientHeight || 0);
    } catch (e) { console.warn("TelaDeBatalha: medir a janela de novo falhou", e); }
  }, [geo.coluna, arranjo, mesaMedida.largura, mesaMedida.altura]);
  /* O GESTO NO INIMIGO (§CB 3). Rato: passar prevê, clicar ANDA E ATACA (um
     clique, onde antes eram dois). Telefone: o primeiro toque prevê, o
     segundo confirma — nenhum toque numa casa é irreversível, e é isso que
     deixa a casa descer a 40 (§CB 9). Quem decide qual é qual é a tela; o
     App recebe só «prevê» e «anda e ataca». */
  const preverGolpe = (nome) => { try { if (p.aoPreverGolpe) p.aoPreverGolpe(nome); } catch (e) { console.warn("TelaDeBatalha: prever falhou", e); } };
  const andarEAtacar = (nome) => { try { if (p.aoAndarEAtacar) p.aoAndarEAtacar(nome); } catch (e) { console.warn("TelaDeBatalha: andar e atacar falhou", e); } };
  /* CB 18.4 a · COM EMPURRAR ARMADO, o mesmo gesto prevê e confirma o
     empurrão: o rato prevê, o clique empurra; no telefone o primeiro toque
     prevê (a folha do empurrão) e o segundo confirma. Só quando o App dá as
     duas portas (aoPreverEmpurrao, aoEmpurrar); sem elas, o gesto de hoje. */
  const empurrando = armado === "empurrar" && !!p.aoPreverEmpurrao && !!p.aoEmpurrar;
  const empAgora = p.empurrao && typeof p.empurrao === "object" && p.empurrao.previsao ? p.empurrao : null;
  const alvoDoEmpurrao = empAgora && empAgora.alvo ? String(empAgora.alvo) : "";
  const enteDoEmpurrao = alvoDoEmpurrao ? inimigos.find((e) => e.nome === alvoDoEmpurrao) || null : null;
  const preverEmpurrao = (nome) => { try { if (p.aoPreverEmpurrao) p.aoPreverEmpurrao(nome); } catch (e) { console.warn("TelaDeBatalha: prever o empurrão falhou", e); } };
  /* SESSÃO 18 · defeito 3 (a): o App DEVOLVE a recusa (grande demais, longe,
     sem a ação) em vez de a deixar só no registo, que a tela da luta não
     mostra — e o verbo fica armado, com o porquê na linha do veredito. O
     que está na caixa vai como o «como» do empurrão. */
  const empurrar = (nome) => {
    try {
      setRecusado("");
      const recusa = p.aoEmpurrar ? p.aoEmpurrar(nome, p.entrada || "") : "";
      if (typeof recusa === "string" && recusa) { setRecusado(recusa); return; }
      setArmado("");
    } catch (e) { console.warn("TelaDeBatalha: empurrar falhou", e); }
  };
  /* a recusa que o motor já deu na previsão (o rato por cima, ou o 1.º toque) */
  const recusaDoEmpurrao = empurrando && p.empurrao && typeof p.empurrao === "object" && p.empurrao.recusa ? String(p.empurrao.recusa) : "";
  React.useEffect(() => { if (!empurrando && alvoDoEmpurrao) preverEmpurrao(null); }, [empurrando]); // eslint-disable-line react-hooks/exhaustive-deps
  const apontarInimigo = noTelefone ? null : (nome) => (empurrando ? preverEmpurrao(nome) : preverGolpe(nome));
  const tocarInimigo = (nome) => {
    if (!nome) return;
    if (empurrando) {
      if (recusaDoEmpurrao && p.empurrao.alvo === nome) { setRecusado(recusaDoEmpurrao); return; }
      if (noTelefone && alvoDoEmpurrao !== nome) { preverEmpurrao(nome); return; }
      empurrar(nome); return;
    }
    setArmado(""); setRecusado("");
    if (noTelefone && alvoDaPrevisao !== nome) { preverGolpe(nome); return; }
    andarEAtacar(nome);
  };
  /* A CÂMARA DO TELEFONE (§CB 9): enquadra o herói, o alvo da previsão e quem
     o tem por alvo (ou o apanha numa área); a casa desce de 40 a 32 se for
     preciso, e quem não cabe ganha o marcador na borda */
  const nomeDoHeroi = personagem.nome || "";
  const camara = (() => {
    if (!noTelefone) return null;
    try {
      const g = garantirGrade(combate.grade);
      const quemImporta = inimigos.filter((e) => {
        if (e.derrotado || e.x == null) return false;
        const v = intencaoDe.get(e.nome);
        if (!v) return false;
        if (v.tipo === "atacar" && v.alvo === nomeDoHeroi) return true;
        return v.tipo === "sopro" && Array.isArray(v.area) && heroi && v.area.some((q) => q.x === heroi.x && q.y === heroi.y);
      }).map((e) => ({ nome: e.nome, x: e.x, y: e.y, lado: 1 }));
      /* §CB 17.2: no turno deles a câmara SEGUE QUEM AGE — o retângulo passa
         a conter quem age, o destino e o alvo; a origem pode ficar fora */
      if (contando) {
        const ondeAge = passoDeles.para || passoDeles.de;
        const alvoDoPasso = Array.isArray(passoDeles.golpes) && passoDeles.golpes[0] ? passoDeles.golpes[0] : null;
        const deles = [
          ondeAge && ondeAge.x != null ? { nome: passoDeles.quem, x: ondeAge.x, y: ondeAge.y, lado: 1 } : null,
          alvoDoPasso && alvoDoPasso.alvoOnde && alvoDoPasso.alvoOnde.x != null ? { nome: alvoDoPasso.alvo, x: alvoDoPasso.alvoOnde.x, y: alvoDoPasso.alvoOnde.y, lado: 1 } : null,
        ].filter(Boolean);
        /* quem age faz de centro (o lugar do herói na conta) e o alvo dele de alvo */
        return camaraDoTelefone({ colunas: g ? g.largura : 14, linhas: g ? g.altura : 14, heroi: deles[0] || (heroi && heroi.x != null ? heroi : null),
          alvo: deles[1] || null, importa: [],
          larguraUtil: larguraDaJanela > 0 ? larguraDaJanela : 0, alturaUtil: alturaDaJanela > 0 ? alturaDaJanela : 0 });
      }
      return camaraDoTelefone({ colunas: g ? g.largura : 14, linhas: g ? g.altura : 14, heroi: heroi && heroi.x != null ? heroi : null,
        alvo: enteDoAlvo && enteDoAlvo.x != null ? enteDoAlvo : null, importa: quemImporta,
        /* §CB 16.2: sem o −22 — no telefone a régua mora por cima das casas,
           e a câmara mede a janela inteira */
        larguraUtil: larguraDaJanela > 0 ? larguraDaJanela : 0, alturaUtil: alturaDaJanela > 0 ? alturaDaJanela : 0 });
    } catch { return null; }
  })();
  const casaDoTelefone = camara ? camara.casa : B3.telefone.casa;
  const chaveDaCamara = camara ? `${camara.x0},${camara.y0},${camara.casa}` : "";
  React.useEffect(() => {
    if (!noTelefone || !camara) return undefined;
    /* sem quadros contados (D5e): o efeito corre depois do commit, e a janela
       sem altura ainda não é janela — a próxima medida volta a perguntar */
    try {
      const el = janelaRef.current;
      if (!el || !el.clientHeight) return undefined;
      const lado = ladoRef.current || camara.casa;
      el.scrollTo({ left: camara.x0 * lado, top: camara.y0 * lado, behavior: movimentoParado() ? "auto" : "smooth" });
    } catch { /* a câmara que estoura não pode custar o turno */ }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveDaCamara, noTelefone]);
  const irAoMarcador = (m) => {
    try {
      const el = janelaRef.current;
      if (!el) return;
      const lado = ladoRef.current || casaDoTelefone;
      el.scrollTo({ left: Math.max(0, (m.x + 0.5) * lado - el.clientWidth / 2), top: Math.max(0, (m.y + 0.5) * lado - el.clientHeight / 2), behavior: movimentoParado() ? "auto" : "smooth" });
    } catch (e) { console.warn("TelaDeBatalha: ir ao marcador falhou", e); }
  };
  /* o aviso da área (§CB 2): quanto e como escapar do sopro anunciado */
  const aviso = (() => { try { const g = garantirGrade(combate.grade); return avisoDaArea(heroi, intencoes, { colunas: g ? g.largura : 14, linhas: g ? g.altura : 14 }); } catch { return null; } })();
  /* a fila da vez (§CB 8) */
  const recursosDosVerbos = p.recursosDosVerbos && typeof p.recursosDosVerbos === "object" ? p.recursosDosVerbos : null;
  const chanceDoAtaque = (() => { try { const v = pilulaDaPrevisao(prevGolpe); return v && v.chance != null ? v.chance : null; } catch { return null; } })();

  /* A1: o gesto sem motor sai da fileira (lido da tabela, nunca pelo nome) */
  const verbos = fileiraDeVerbos().filter(temMotorOuNaoEGesto);
  const selos = faixaDaVez(combate, personagem.nome);
  /* CB 17 (lote 2): a fila pela ordem em que o motor joga (`filaDaRodada`),
     com quem age no turno deles e quem já agiu; sem ela (um herói sem
     nome), a fila dos selos de sempre */
  const agiramNoTurno = td ? td.passos.slice(0, Math.min(indiceDoTurno, td.passos.length)).map((x) => String(x.quem)) : [];
  const fila = (() => {
    try {
      const f = filaDaRodada(combate, { ...personagem, grupo }, { vez: contando ? passoDeles.quem : personagem.nome, agiram: td ? [personagem.nome, ...agiramNoTurno] : [] });
      if (f) {
        const abre = f.rostos.find((r) => r.nome === f.seguinte.abre) || null;
        return { rostos: f.rostos, rodadaSeguinte: f.seguinte.rodada, proximo: abre ? { nome: abre.nome, lado: abre.lado, heroi: abre.heroi } : null };
      }
      return filaDaVez(selos, combate);
    } catch { return null; }
  })();
  const rotuloDaFila = contando ? `agora: ${passoDeles.quem}` : rotuloDaVez(selos);
  /* a economia da vez, numa conta só (o passo é o que o App mediu) */
  const vezDoHeroi = (() => {
    try {
      const v = economiaDaVez(combate, personagem, { passoTotalM: p.passoTotal });
      if (!v) return null;
      return p.passoM != null && p.passoTotal != null ? { ...v, movimento: { ...v.movimento, restaM: p.passoM, totalM: p.passoTotal } } : v;
    } catch { return null; }
  })();
  const dePe = inimigos.filter((e) => !e.derrotado).length;

  /* AS ZONAS DA PLANTA — o vocabulário do Mestre, no topo do campo. A do
     herói acende; tocar uma leva a janela até a primeira linha dela, e é
     estado de tela: nada no jogo se move. */
  const { zonas, zonaDoHeroi } = (() => {
    try {
      const g = garantirGrade(combate.grade);
      const lugar = g && heroi && heroi.x != null ? nomeDoLugar(combate.grade, heroi.x, heroi.y) : "";
      return { zonas: g ? g.regioes : [], zonaDoHeroi: lugar };
    } catch { return { zonas: [], zonaDoHeroi: "" }; }
  })();

  /* quem é cada chip da ordem da vez — a ficha inteira, para o rosto vestir
     o traje da classe e o estado da vida */
  const enteDoSelo = (s) => {
    if (s.heroi) return { ...personagem, ...(heroi || {}), nome: personagem.nome || s.nome, vida: personagem.vida, vidaMax: personagem.vidaMax };
    if (s.lado === "inimigo") return inimigos.find((e) => e.nome === s.nome) || { nome: s.nome };
    return grupo.find((g) => g.nome === s.nome) || (combate.aliados || []).find((a) => a && a.nome === s.nome) || { nome: s.nome };
  };

  /* OS MODIFICADORES QUE O MOTOR CALCULA E A TELA ESCONDIA (E4). */
  const modificadores = (() => {
    try { return selosDaMecanica(mecanicaDe(personagem.condicoes || [])); }
    catch { return []; }
  })();

  /* O ADVERSÁRIO DA TIRA DO TELEFONE: o mais perto que ainda está de pé,
     que é aquele sobre quem a linha do veredito está a falar. Um só — uma
     linha de 44 px com quatro nomes é a planilha outra vez. A distância
     sai do veredito, que já a mediu. */
  const adversario = (() => {
    try {
      const vivos = inimigos.filter((e) => !e.derrotado && Number(e.vida || 0) > 0);
      if (!vivos.length) return null;
      const alvos = (vd && vd.alvos) || [];
      const dist = (e) => (alvos.find((x) => x.nome === e.nome) || {}).distanciaM;
      const perto = [...vivos].sort((a, b) => {
        const da = dist(a), db = dist(b);
        return (da == null ? Infinity : da) - (db == null ? Infinity : db);
      })[0];
      return perto ? { ...perto, distanciaM: dist(perto) } : null;
    } catch { return null; }
  })();

  /* QUEM ESTÁ IMPEDIDO, E POR QUÊ — e a razão vem em vez do booleano,
     porque a tela tem de poder DIZÊ-LA sem a inventar. O `Atacar` é
     impedido quando ninguém está ao alcance (a metade que evita o "longe
     demais" dez vezes seguidas na abertura de toda luta); o `Mover`
     quando o conjunto que ele armaria é vazio. */
  const impedidosDaRegra = impedimentosDaFileira({
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
  /* B1 desligava aqui o gesto sem motor; desde A1 ele nem entra na fileira
     (ver `temMotorOuNaoEGesto`, acima) — as razões que ficam são as da regra. */
  const impedidos = { ...impedidosDaRegra };

  /* FUGIR NÃO PASSA PELA LINHA GENÉRICA DO ARMADO. Os outros verbos que
     armam fazem uma PERGUNTA ("toque a casa", "diga em quem"), e a saída
     universal é "toque outra vez para desistir". Fugir não pergunta nada
     — mostra o PREÇO de sair (`linhaDaFuga`, já medido pelo App com
     `fuga.js`), e tocar de novo não desiste, EXECUTA. */
  const linha = armado === "fugir"
    ? linhaFugaArmada(p.linhaDaFuga)
    : vereditoDaTela({
    armado,
    recusaDoVerbo: recusado || recusaDoEmpurrao,
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
       a tela mostra o cartão de saída. */
    fugiu: !!p.fugiu,
  });

  /* §CB 16.1 nº 3: no monitor a fala mora no bloco direito da fila, e o
     corte pelo COMEÇO conta com a largura medida desse bloco — o fim é o
     que o jogador precisa, e as reticências do clamp quase nunca entram */
  const [falaEl, setFalaEl] = React.useState(null);
  const [larguraDaFala, setLarguraDaFala] = React.useState(0);
  React.useEffect(() => {
    if (!falaEl) return undefined;
    try {
      const mede = () => setLarguraDaFala(falaEl.clientWidth || 0);
      mede();
      if (typeof ResizeObserver === "undefined") return undefined;
      const ro = new ResizeObserver(() => mede());
      ro.observe(falaEl);
      return () => ro.disconnect();
    } catch (e) { console.warn("TelaDeBatalha: medir o bloco da fala falhou", e); return undefined; }
  }, [falaEl]);
  const FNF = B3.falaNaFila;
  const fala = ultimasLinhasDoMestre(p.mensagens, {
    linhas: noTelefone ? NARRACAO.linhasNoTelefone : FNF.linhas,
    chars: noTelefone ? NARRACAO.charsPorLinhaNoTelefone
      : larguraDaFala > 0 ? Math.floor(larguraDaFala / (FNF.letra * FNF.emPorLetra)) : NARRACAO.charsPorLinha,
  });
  /* a fala sem corte nenhum, para o `title` (B1b) — o mesmo módulo, sem teto */
  const falaInteira = ultimasLinhasDoMestre(p.mensagens, { linhas: 1, chars: Infinity });


  const tocarVerbo = (v) => {
    /* §CB 17.2: no turno deles um verbo SALTA E ARMA (armar é reversível) */
    if (contando) saltarTurno();
    /* O VERBO QUE NÃO PODE ARMAR RECUSA, E A LINHA DIZ PORQUÊ. Antes ele
       aceitava o toque, ficava `aria-pressed=true` e a linha mandava
       "toque a casa onde quer parar" sem casa nenhuma para tocar. */
    const razao = impedidos[v.id];
    if (razao) { setArmado(""); setRecusado(razao); return; }
    setRecusado("");
    if (v.id === "atacar") { setArmado(""); if (p.aoAtacar) p.aoAtacar(); return; }
    /* SESSÃO 18 · defeito 3 (b, c): Empurrar com motor NÃO escreve a frase na
       caixa. A frase ia pelo «Agir →» ao texto livre — com alvo declarado o
       detector de ataque fazia dela um golpe, sem alvo o Narrador inventava o
       empurrão — e o complemento do jogador misturava-se com ela. O gesto é
       tocar no inimigo; a caixa fica para o «como», e é dele. */
    const semFrase = v.id === "empurrar" && !!p.aoEmpurrar && !!p.aoPreverEmpurrao;
    if (armado === v.id) {
      if (v.id === "fugir") { setArmado(""); if (p.aoFugir) p.aoFugir(); return; }
      setArmado(""); if (p.aoEscrever && !semFrase) p.aoEscrever("");
      return;
    }
    setArmado(v.id);
    if (semFrase) return;
    /* o verbo que arma põe a sua frase na linha do texto livre: o jogador
       acrescenta o COMO e manda pela mesma porta de sempre. A frase sai da
       tabela de `golpe.js`, nunca de uma string montada aqui. */
    if (v.frase && p.aoEscrever) p.aoEscrever(v.frase.endsWith(" ") ? v.frase : `${v.frase} `);
    if (v.id === "esperar" && p.aoAgir) { setArmado(""); p.aoAgir(v.frase); }
  };

  /* andar desarma, e é a terceira saída */
  const mover = (destino) => { setArmado(""); setRecusado(""); if (p.aoMover) p.aoMover(destino); };

  /* SESSÃO 18 · defeito 3 (b, c): A CAIXA NÃO É PORTA DO EMPURRÃO PARA O
     TEXTO LIVRE. Com Empurrar armado — ou com a frase dele na caixa (o
     rascunho guardado devolve-a) —, o «Agir →» e o Enter levam o empurrão ao
     motor (aoEmpurrar), no inimigo citado, no que está sob o rato, no alvo
     declarado ou no único de pé; sem em quem, o verbo arma e espera o toque. */
  const empDaCaixa = (() => {
    try {
      if (!p.aoEmpurrar || !p.aoPreverEmpurrao || p.fim) return null;
      const vivos = inimigos.filter((e) => e && !e.derrotado && Number(e.vida || 0) > 0).map((e) => e.nome);
      const sob = p.empurrao && typeof p.empurrao === "object" && p.empurrao.alvo ? String(p.empurrao.alvo) : "";
      return empurraoDaFrase(p.entrada || "", { nomes: vivos, preferidos: [sob, (p.alvosGolpe || []).find(Boolean) || ""], exigeFrase: !empurrando });
    } catch (e) { console.warn("TelaDeBatalha: o empurrão da caixa falhou", e); return null; }
  })();
  const agirPelaCaixa = () => {
    if (empDaCaixa) {
      if (empDaCaixa.alvo) empurrar(empDaCaixa.alvo);
      else { setRecusado(""); setArmado("empurrar"); }
      return;
    }
    setArmado(""); if (p.aoAgir) p.aoAgir(p.entrada);
  };
  const caixaVazia = !String(p.entrada || "").trim() && !(empDaCaixa && empDaCaixa.alvo);

  /* A DECISÃO QUE ESPERA (MM16 nº 5): enquanto o cartão do golpe final está
     aberto, o turno está PARADO nele — nenhum verbo arma, a vez não anda, a
     linha do veredito não tem o que prever (cada botão do cartão diz a sua
     consequência, e é ele o veredito deste clique). Por isso os controles do
     turno saem e devolvem a altura ao cartão; o tabuleiro fica, e cede o
     que sobrar. No telefone sai também a tira do herói (os PV não entram na
     escolha entre poupar e matar): medido a 374 × 310, só assim o campo do
     "como", o contador e os dois botões cabem sem rolar. Tudo volta no
     clique que fecha o cartão. */
  const esperando = !!p.decisao && !p.fim;
  /* A1 · o fim da luta toma a secção da ação quando o App passa o espólio */
  const fimComEspolio = !!p.fim && !!p.espolio && typeof p.espolio === "object";
  /* a segurança: se mesmo assim faltar ecrã, o campo onde se escreve vem à
     vista — DEPOIS de a tela saber se é telefone. O primeiro quadro ainda é
     o do monitor, e rolar ali deixava o cartão preso numa altura que some
     um quadro depois. Por isso o efeito depende de `noTelefone`, e não de
     quadros contados. Se couber, nada se move. */
  const decisaoRef = React.useRef(null);
  React.useEffect(() => {
    if (!esperando) return;
    try {
      /* do zero a cada medida: a rolagem do quadro de antes não vale para este */
      if (decisaoRef.current) decisaoRef.current.scrollTop = 0;
      const el = decisaoRef.current && decisaoRef.current.querySelector("textarea");
      if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
    } catch (e) { console.warn("TelaDeBatalha: rolar até o campo da decisão falhou", e); }
  }, [esperando, noTelefone]);

  /* §CB 16.3 · O TEXTO DO PÉ DO CAMPO, por esta prioridade: o armado, a
     recusa e o preço da fuga (o que o próximo toque faz) > o resumo da área
     enquanto se mira (é o que vai acontecer; a cor diz se pega um aliado) >
     no telefone, o aviso da área (a pílula que vivia por baixo da tira) > a
     linha do golpe. Com o cartão do golpe final aberto ou o fim da luta na
     secção, o pé cala-se: o veredito daquele clique é o cartão. */
  const resumo = (() => { try { return resumoDaArea(p.previsao); } catch { return ""; } })();
  const vereditoForte = !!armado || !!recusado || !!recusaDoEmpurrao || !!p.precoDaFuga || !!p.fugiu;
  const pegaAliado = !!(p.previsao && Array.isArray(p.previsao.aliados) && p.previsao.aliados.length);
  const textoDoPe = esperando || fimComEspolio ? ""
    : resumo && !vereditoForte ? resumo
      : noTelefone && aviso && aviso.texto && !vereditoForte ? aviso.texto
        : linha;
  const tomDoPe0 = resumo && !vereditoForte && !esperando && !fimComEspolio ? (pegaAliado ? T.danger : T.amberSoft) : null;
  /* §CB 17.2: durante o turno deles o Pé é a frase do passo (no telefone, o
   único sítio onde ela se lê durante o turno), com o glifo do tipo da
   intenção no lugar da mira */
  const fraseDeles = contando ? (() => { try { const it = intencaoDe.get(passoDeles.quem); return fraseDoPasso(passoDeles, { anunciado: it && it.alvo, heroi: nomeDoHeroi }); } catch { return null; } })() : null;
  /* CB 18.5: a reação que não é a primeira do seu tipo (e toda a do turno
     deles) não pousa no tabuleiro: é uma linha no Pé, o tempo da leitura */
  const textoDoPeAgora = linhaDaReacao && !vereditoForte ? linhaDaReacao : fraseDeles ? fraseDeles.linha : textoDoPe;
  const tomDoPe = fraseDeles ? (passoDeles.emTi ? T.danger : T.ink) : tomDoPe0;
  const glifoDoPe = contando ? (INTENCAO_NA_MESA.glifo[passoDeles.tipo] || (passoDeles.lado === "aliado" ? "espadas" : "mira")) : "mira";
  const corDoGlifoDoPe = contando && passoDeles.lado === "aliado" ? T.ok : T.danger;
  /* as linhas do registo durante o turno: os passos até ao corrente */
  const registoDoTurno = td ? td.passos.slice(0, Math.min(indiceDoTurno + 1, td.passos.length)).map((x, i) => {
    let f = null; try { const it = intencaoDe.get(x.quem); f = fraseDoPasso(x, { anunciado: it && it.alvo, heroi: nomeDoHeroi }); } catch { f = null; }
    const feriu = !!x.emTi && (x.golpes || []).some((gp) => gp && gp.alvo === nomeDoHeroi && gp.evento && Number(gp.evento.dano) > 0);
    return f ? { chave: `${i}:${x.quem}`, quem: f.quem, alvo: f.alvo, diz: f.diz, feriu, turno: true, nova: contando && i === indiceDoTurno } : null;
  }).filter(Boolean) : null;

  const titulo = comMaiuscula(zonaDoHeroi);
  /* §CB 16.2: 6 no telefone (a janela fica com 361 de largo), 16 no
     estreito, e 24 (§CB 2, a conta das três colunas) no largo — era o 32 do
     quadro B1, que a geometria nunca contou */
  const margem = noTelefone ? B3.telefone.margem : estreito ? B3.margemEstreita : B3.margem;

  /* ============================================================
     A CENA E O TURNO — o cabeçalho do quadro
     ============================================================ */
  /* B1b · O CABEÇALHO APERTA. No monitor os participantes sobem à linha
     do título (entre ele e a pílula), e a frase fica em duas linhas com
     reticências. No patamar baixo os respiros descem aos de `M.aperto`, o
     título ao do telefone, e a pílula e os chips encolhem. No telefone,
     nada muda: a faixa continua a ser a sua linha. */
  const faixa = (<>{!esperando && <FilaDaVez fila={fila} rotulo={rotuloDaFila} entes={enteDoSelo} intencaoDe={intencaoDe} noTelefone={noTelefone} vezDeles={contando}
    realce={realce} aoRealcar={setRealce} aoAbrirEles={arranjo === "duas" ? () => setElesAberto((v) => !v) : null} />}</>);
  /* CB 2: margem 24 · a fila · a fala numa linha, sem respiro por baixo (a
     mesa já tem o seu topo) */
  /* §CB 16.2: os três patamares de B1b são os que `geometriaDaMesa` conta
     (24 + 8, 12 + 8, 8 + 4); no telefone, 4 + fila 48 + 2 + fala 22 + 4 */
  const TC = B3.telefone.cabecalho;
  const respiroDaCena = noTelefone ? { topo: TC.topo, baixo: TC.baixo, entre: TC.entre }
    : baixo ? { topo: M.aperto.cenaTopo, baixo: M.aperto.cenaBaixo, entre: 0 }
      : curto ? { topo: M.chipLadoX, baixo: M.chipLadoY, entre: 0 }
        : { topo: B3.margem, baixo: 0, entre: 0 };
  /* CB 2 · O CABEÇALHO DA MESA: o lugar e a rodada à esquerda, A FILA DA VEZ
     ao centro, e por baixo a fala do Mestre numa linha. No telefone, a fila
     e «A TUA VEZ · <nome>» no canto (a pílula da vez aposentou-se). */
  const cena = (
    <header className="flex flex-col shrink-0 min-w-0"
      style={{ padding: `${respiroDaCena.topo}px ${margem}px ${respiroDaCena.baixo}px`, gap: respiroDaCena.entre }}>
      <div className="flex items-center justify-between min-w-0 shrink-0" style={{ gap: noTelefone ? M.chipLadoX : M.entreColunas, height: noTelefone ? B3.telefone.fila : B3.fila }}>
        {!noTelefone && (
          <div className="flex flex-col min-w-0" style={{ gap: 4, flex: "1 1 0" }}>
            {/* A1 (peça 93): a legenda de máquina por cima do título, com o
                conteúdo de mundo — o lugar e a rodada. */}
            <span className="tv-mono" style={{ ...LEGENDA, color: T.amber }}>{[p.lugar, `rodada ${combate.rodada || 1}`].filter(Boolean).join(" · ")}</span>
            {titulo && (
              <h2 className="tv-display truncate" style={{ fontSize: baixo ? M.letra.tituloNoTelefone : M.letra.titulo, color: T.ink, fontWeight: 600, lineHeight: 1.1, margin: 0 }}>{titulo}</h2>
            )}
          </div>
        )}
        {faixa}
        {noTelefone ? (
          <span className="flex flex-col items-end shrink-0" style={{ gap: 2 }}>
            <span key={pulsoDaVez ? `pulso${pulsoDaVez}` : undefined} className={`tv-mono${pulsoDaVez && !contando ? " tv-pulse" : ""}`}
              style={{ ...LEGENDA, color: contando ? T.danger : T.amber, fontWeight: 700, animationIterationCount: 1 }}>{contando ? "A vez deles" : "A tua vez"}</span>
            <span className="tv-display truncate" style={{ fontSize: M.letra.nomeDoAliado, color: T.ink, maxWidth: 120 }}>{contando ? passoDeles.quem : personagem.nome}</span>
          </span>
        ) : (
          /* §CB 16.1 nº 3: o bloco direito, que estava vazio, leva a fala */
          <div ref={setFalaEl} className="min-w-0" style={{ flex: "1 1 0" }}>
            <AUltimaFala texto={fala} inteiro={falaInteira} carregando={p.carregando} />
          </div>
        )}
      </div>
      {noTelefone && <AUltimaFala texto={fala} inteiro={falaInteira} carregando={p.carregando} noTelefone />}
    </header>
  );

  /* ============================================================
     O CAMPO DE BATALHA — a arena do quadro
     ============================================================ */
  const alturaDoCabecalhoDoCampo = baixo ? M.aperto.arenaCabecalho : M.arenaCabecalho;
  /* na janela baixa a JANELA do campo tem altura PRÓPRIA — fixa,
     `M.janelaBaixa.casas` casas no piso do monitor —, e a secção mede o que
     leva dentro (o cabeçalho, a janela, o pé com a legenda). Nada disto
     depende do tabuleiro: medir e redesenhar continuam a não se perseguir.
     (Fixar a secção inteira não chegava: o pé cresce com a legenda do
     passo, e medido a 800 × 451 comia 49 px à janela — 5,5 casas em vez
     de 7.) */
  const alturaDaJanelaNaBaixa = M.casaMinimaNoMonitor * M.janelaBaixa.casas;
  const campo = (
    <section ref={campoRef} className="tv-mesa-arena flex flex-col min-h-0 min-w-0 w-full overflow-hidden"
      style={{ flex: janelaBaixa ? "0 0 auto" : "1 1 auto", order: 1, borderRadius: M.raio, background: T.pagina, border: `1px solid ${T.line}`, position: "relative" }}>
      {/* CB 2: o cabeçalho do campo saiu — o nome de cada zona está escrito no
          chão, e o da zona do herói é o título da mesa; a altura voltou ao
          tabuleiro, que agora cabe inteiro. */}
      {/* A JANELA SOBRE O CAMPO: o tabuleiro cabe inteiro nela (B1b) e,
          só quando nem com a casa no piso cabe, é ela que rola. O rolamento
          é desta caixa, e nunca do log — é a inversão.

          E O TOQUE NO CAMPO DESARMA: é a terceira saída de W1, a única
          que existe no telefone, onde não há `Esc`. Vive aqui e não na
          casa porque a casa fora do alcance não tem ouvinte nenhum. */}
      <div ref={janelaRef} className={`flex-1 min-h-0 min-w-0 overflow-auto tv-scroll${noTelefone ? " tv-sem-barra" : ""}`}
        style={janelaBaixa ? { flex: "0 0 auto", height: alturaDaJanelaNaBaixa } : { minHeight: ALVOS.piso * M.janelaMinima }}
        onPointerDown={(e) => {
          /* o toque no campo desarma, MENOS o do Empurrar sobre um inimigo: o
             pointerdown corre antes do clique e desarmava-o, e o clique ia atacar */
          const sobreInimigo = !!(e && e.target && e.target.closest && e.target.closest("[data-inimigo]"));
          if (empurrando && sobreInimigo) return;
          setArmado("");
        }}
        onPointerDownCapture={(e) => { if (!contando) { engolirCliqueRef.current = false; return; } e.stopPropagation(); engolirCliqueRef.current = true; saltarTurno(); }}
        onClickCapture={(e) => { if (engolirCliqueRef.current) { engolirCliqueRef.current = false; e.stopPropagation(); e.preventDefault(); } }}>
        {/* CB 9: quem importa e ficou fora da câmara, na borda da janela */}
        {camara && camara.marcadores.map((m) => (
          <MarcadorForaDeVista key={m.nome} marcador={m} ente={inimigos.find((e) => e.nome === m.nome) || { nome: m.nome }} aoIr={() => irAoMarcador(m)} />
        ))}
        <GridDeBatalha combate={combate} grupo={grupo} heroiFicha={personagem}
          previsao={p.previsao} passoM={p.passoM} passoTotal={p.passoTotal}
          /* o 1,5 escrito à mão saiu: o menor passo que este tabuleiro
             sabe mostrar mora em `PASSO_NA_RODADA.minimo`, e quem o lê
             é `podeDarUmPasso` */
          ignoraDificil={p.ignoraDificil} podeMover={podeDarUmPasso(p.passoM, p.passoTotal) && !p.fim} onMover={mover}
          mira={p.mira} onMirar={p.aoMirar} alcanceMira={p.alcanceMira}
          aoMedirOPasso={setCasasDoPasso}
          /* o piso continua a ser imposto; a largura medida deixa a casa
             crescer até encher a janela (B1). B1b: no monitor o piso é o
             da casa de rato (32, WCAG 2.5.8 AA — o motivo mora em
             `M.casaMinimaNoMonitor`), a ALTURA entra na conta para o
             tabuleiro caber inteiro, e há teto; no telefone fica tudo como
             estava (48, só a largura, sem teto). */
          /* CB 9: no telefone a casa desce de 48 a 40 (e a 32, se a câmara
             precisar) — nenhum toque numa casa é irreversível: o primeiro
             toque prevê e o segundo confirma. 35 → 99 casas à vista. */
          ladoFixo={noTelefone ? casaDoTelefone : M.casaMinimaNoMonitor} larguraDaJanela={larguraDaJanela}
          alturaDaJanela={noTelefone ? 0 : alturaDaJanela} tetoDoLado={noTelefone ? 0 : M.casaMaximaNoMonitor}
          aoMedirOLado={aoMedirOLado}
          pe={peDaArena} peCompacto={noTelefone} legendaCede={!!p.reacao}
          previsaoDoGolpe={prevGolpe} intencoes={intencoes} caminho={p.caminho || null} golpes={p.golpes || null}
          aoApontarInimigo={apontarInimigo} aoTocarInimigo={tocarInimigo} realce={realce} reguaPresa={noTelefone} heroiNome={nomeDoHeroi}
          quedas={p.quedas || null} aoMudarQueda={p.aoMudarQueda} veuDoUltimo={p.decisao && p.ultimoGolpe ? p.ultimoGolpe : null}
          /* CB 17: o d20 do herói no alvo, e o passo corrente do turno deles */
          lance={p.lance || null} aoLance={setLanceNaMesa} acelerado={!!(td && td.acelerado)}
          passo={contando ? { ...passoDeles, i: indiceDoTurno, porVir: td.passos.slice(indiceDoTurno + 1).map((x) => ({ quem: x.quem, de: x.de })) } : null}
          agiram={td ? agiramNoTurno : null} vista={camara}
          /* CB 18: o degrau, o chão, os objetos, o empurrão e as reações */
          alturas={p.alturas || null} superficies={p.superficies || null} objetos={p.objetos || null} empurrao={empAgora} reacoes={p.reacoes || null} />
      </div>
      {/* §CB 16.1 nº 1: o pé da arena e a linha do veredito são uma faixa só,
          de altura fixa — o Pé do campo; o tabuleiro escreve os chips e o ⤢
          na ponta direita dele (`setPeDaArena`) */}
      <PeDoCampo texto={textoDoPeAgora} armado={!!armado && !contando} tom={tomDoPe} reacao={esperando ? null : p.reacao} noTelefone={noTelefone} aoPortal={setPeDaArena}
        glifo={glifoDoPe} corDoGlifo={corDoGlifoDoPe} calaOPortal={contando && noTelefone}
        controlo={contando ? <ControloDoTurnoDeles acelerado={!!td.acelerado} aoAcelerar={td.aoAcelerar} aoSaltar={saltarTurno} noTelefone={noTelefone} /> : null} />
    </section>
  );

  /* ============================================================
     A SUA PRÓXIMA AÇÃO — o veredito, os verbos e o `como?`
     ============================================================ */
  /* A1 · O FIM DA LUTA toma a secção inteira — a MESMA caixa (fundo, raio,
     enchimento e respiro de *Sua próxima ação*), com as três faixas dele no
     lugar do veredito, dos verbos e do `como?`. É uma secção à parte, e não
     um ramo dentro da de baixo, para a da luta continuar a ler-se como
     sempre se leu. Sem `espolio` (um App que ainda não o escreve), a secção
     de baixo e o `Respirar fundo →` de hoje. */
  /* CB 2: na mesa a três colunas a barra de ação aperta (o respiro e o vão do
     chip) — a altura que sobra é do tabuleiro */
  /* §CB 16.2: a barra mede aro + respiro 8 + verbo + 8 + verbo + respiro 8
     + aro em todos os patamares do monitor (106 com rato, 122 com toque); no
     telefone, a grelha de três linhas de 48 com respiro e vão de 6 (170) */
  const respiroDaAcao = { order: 3, gap: noTelefone ? B3.telefone.entre : B3.entreFileiras, padding: noTelefone ? B3.telefone.respiro : B3.barraRespiro, borderRadius: M.raio, background: T.panel, border: `${B3.aro}px solid ${T.line}` };
  const recuosDaBarra = verbos.filter((v) => v.papel === "recuo");
  const acaoDoFim = fimComEspolio ? (
    <section className="flex flex-col shrink-0 min-w-0 w-full" style={respiroDaAcao}>
      <FimDaLuta desfecho={p.espolio.desfecho} recibo={p.espolio.recibo} chao={p.espolio.noChao} linha={p.espolio.linha || ""}
        aoRecolher={p.aoRecolher} aoSair={p.aoSair} telefone={noTelefone} />
    </section>
  ) : null;
  const acao = (
    <section className="flex flex-col shrink-0 min-w-0 w-full" style={respiroDaAcao}>
      {/* CB 6 · O ÚLTIMO GOLPE É TEU: o véu cobre o campo (menos a casa dele),
          e o cartão do golpe final de sempre fica por baixo desta linha */}
      {esperando && p.ultimoGolpe && (
        <p className="tv-display text-center" style={{ fontSize: M.letra.foco + 6, color: T.ink, margin: 0, lineHeight: 1.2 }}>O último golpe é teu.</p>
      )}
      {/* CB 9 · a folha da previsão sobe por cima dos verbos, no telefone */}
      {/* CB 18.4 a · a folha do empurrão (G2): com Empurrar armado e um alvo previsto */}
      {noTelefone && !esperando && !p.fim && empurrando && enteDoEmpurrao && (
        <FolhaDoEmpurrao empurrao={empAgora} alvo={enteDoEmpurrao} aoConfirmar={() => empurrar(alvoDoEmpurrao)} aoCancelar={() => preverEmpurrao(null)} />
      )}
      {noTelefone && !esperando && !p.fim && enteDoAlvo && !(empurrando && enteDoEmpurrao) && (
        <FolhaDaPrevisao previsao={prevGolpe} alvo={enteDoAlvo} anda={!!(p.caminho && Array.isArray(p.caminho.pontos) && p.caminho.pontos.length > 1)}
          aoConfirmar={() => andarEAtacar(alvoDaPrevisao)} aoCancelar={() => preverGolpe(null)} />
      )}
      {/* a bolsa e a gaveta abrem POR CIMA da fileira (B1) */}
      {!p.decisao && bolsaAberta && <BolsaDeCombate pocoes={p.pocoes || []} bolsa={p.bolsa || []} aoUsar={p.aoUsarConsumivel} />}
      {!p.decisao && p.gaveta}
      {p.fim ? (
        /* A SAÍDA É CONFIRMADA, E SÓ NO FIM. Durante a luta não há porta
           nenhuma — o motivo é medido: o `⛺` encerrou uma luta por engano
           numa partida de verdade. Uma porta a menos durante, uma porta a
           mais depois. */
        <button onClick={p.aoSair} className="tv-anel-foco tv-display text-lg w-full"
          style={{ minHeight: ALVOS.piso, borderRadius: M.raioControle, background: T.amber, color: T.onAccent, fontWeight: 600 }}>
          Respirar fundo →
        </button>
      ) : p.decisao ? (
        /* A DECISÃO SEM RELÓGIO ENTRA NO FLUXO (MM16 nº 5). O cartão do
           golpe final ia no slot da reação, ancorado em cima da linha do
           veredito; num ecrã de 310 px o topo dele ficava em y −85 e o foco
           não rolava até lá — o "como" escrevia-se às cegas e não chegava.
           A reação (K3) sobrepõe porque tem relógio e o jogador lê o campo
           enquanto decide; o golpe final não tem relógio, e quem decide é
           ele. Toma o lugar dos verbos (parados enquanto ele espera) e do
           texto livre (o cartão tem o campo dele — dois `como?` no mesmo
           ecrã seriam a mesma ação com duas caras), e o tabuleiro cede a
           altura. Se ainda assim faltar ecrã, rola DENTRO dele. */
        <div ref={decisaoRef} className="shrink min-h-0 overflow-y-auto tv-scroll" style={{ flex: "0 1 auto" }}>
          {p.decisao}
        </div>
      ) : p.dado ? (
        /* §CB 17.1: o teste pendente que o Mestre pede no meio da luta («Rolar
           d20») toma o lugar da fileira enquanto espera, como a decisão — a
           barra nunca muda de altura. O d20 do golpe já não vem aqui: rola no
           alvo (a grade). */
        <div className="shrink-0 min-w-0 flex items-center" style={{ minHeight: altoDoVerbo }}>{p.dado}</div>
      ) : (
        <FileiraDeVerbos verbos={verbos} armado={armado} impedidos={impedidos}
          aoTocar={tocarVerbo} alto={altoDoVerbo} grelha={noTelefone}
          recursos={comPip ? recursosDosVerbos : null} chanceDoAtaque={chanceDoAtaque} aoApontar={noTelefone ? null : setVerboSobre} />
      )}
      {/* O TEXTO LIVRE muda de papel: deixa de ser a sintaxe obrigatória e
          vira o tempero. O convite é `como? (opcional)`, e ele NUNCA é
          `disabled` enquanto há um verbo armado — escrever e mirar são
          compatíveis, e é esse o ponto inteiro. No quadro B1 é o
          "Compositor de ação": a caixa com a pena e o `Agir →` com o d20. */}
      {/* §CB 16.1 nº 4 · A LINHA 2 DA BARRA: o `como?` (enche) · ✦ · a bolsa
          · o fio · Esperar · Fugir · Agir, todos à altura do ponteiro. No
          telefone: o `como?`, ✦ 48, a bolsa 48 e o Agir (os recuos moram na
          grelha, por cima). Ninguém quebra: o `como?` é quem cede. */}
      {!p.decisao && <div className="flex items-center shrink-0 min-w-0"
        style={{ gap: noTelefone ? B3.telefone.entre : M.entreVerbos, height: altoDoVerbo }}>
        <label className="flex items-center flex-1 min-w-0"
          style={{ height: altoDoVerbo, minHeight: altoDoVerbo, gap: M.chipLadoX, padding: `0 ${noTelefone ? M.chipLadoX : M.compositorLado}px`, borderRadius: M.raioRedondo, background: T.pagina, border: `1px solid ${armado ? T.amber : T.line}` }}>
          <Glifo nome="pena" tamanho={M.glifo} cor={T.violetSoft} />
          <input value={p.entrada || ""} onChange={(e) => p.aoEscrever && p.aoEscrever(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && p.aoAgir && !caixaVazia) agirPelaCaixa(); }}
            placeholder={armado ? PEDIDO_DO_VERBO[armado] || "como? (opcional)" : "como? (opcional)"}
            disabled={!armado && !!p.bloqueado}
            className="tv-anel-foco flex-1 bg-transparent tv-body min-w-0" style={{ fontSize: M.letra.cena, color: T.ink, minHeight: altoDoVerbo - M.entreVerbos }} />
        </label>
        {!p.fim && (
          <>
            <Gaveta aberta={!!p.gavetaAberta} aoAbrir={p.aoAbrirGaveta} glifo="faisca" rotulo="Habilidades" alto={altoDoVerbo} />
            <Gaveta aberta={bolsaAberta} aoAbrir={() => setBolsaAberta((v) => !v)} glifo="bolsa" rotulo="Bolsa"
              rotuloAcessivel={(p.bolsa || []).length > 0 ? `Bolsa, ${(p.bolsa || []).length}` : "Bolsa"} conta={(p.bolsa || []).length} alto={altoDoVerbo} />
          </>
        )}
        {/* o fio, e depois os recuos — a posição do Recuo em toda a casa */}
        {!noTelefone && !p.fim && recuosDaBarra.length > 0 && (
          <>
            <span aria-hidden="true" className="shrink-0" style={{ width: B3.aro, height: M.separador, background: T.line }} />
            {recuosDaBarra.map((v) => (
              <Verbo key={v.id} v={v} armado={armado === v.id} impedido={!!impedidos[v.id]} aoTocar={() => tocarVerbo(v)} alto={altoDoVerbo} />
            ))}
          </>
        )}
        <button onClick={agirPelaCaixa}
          disabled={!!p.bloqueado || caixaVazia}
          className="tv-anel-foco tv-mono flex items-center justify-center shrink-0"
          style={{
            height: altoDoVerbo, minHeight: altoDoVerbo, width: noTelefone ? "auto" : M.agir,
            gap: M.chipLadoX, padding: `0 ${M.chipLadoX + 6}px`, borderRadius: M.raioRedondo,
            background: alfa(T.amber, M.alfa.brilho), border: `1px solid ${alfa(T.amber, M.alfa.fio)}`,
            color: T.amberSoft, fontSize: M.letra.agir, fontWeight: 700,
            opacity: (p.bloqueado || caixaVazia) ? 0.4 : 1,
          }}>
          <Glifo nome="dado" tamanho={M.glifoDoDado} cor={T.amber} />
          <span>{noTelefone ? "Agir" : "Agir →"}</span>
        </button>
      </div>}
    </section>
  );

  /* ============================================================
     A COLUNA DA DIREITA — o turno atual, nesta batalha, o foco
     ============================================================ */
  /* §CB 16.1 nº 4: «em jogo» com o rato por cima OU COM O VERBO ARMADO — o
     toque não tem rato, e abaixo de 660 o preço só se lê aqui */
  const emJogo = recursosDosVerbos ? recursosDosVerbos[verboSobre || armado] || null : null;
  const elesEstreita = noTelefone || arranjo === "duas" || (geo.coluna || 0) < B3.colunaEstreita.intencao;
  const tu = (
    <TurnoAtual personagem={personagem} economia={combate.economia} recursos={combate.recursos || null} acaoBonus={p.acaoBonus} selos={modificadores} compacto={baixo}
      emJogo={emJogo} passoM={p.passoM} passoTotal={p.passoTotal} vez={vezDoHeroi} vezDeles={contando ? passoDeles.quem : ""} pulso={contando ? 0 : pulsoDaVez} />
  );
  const eles = (
    <QuemEstaDePe grupo={grupo} inimigos={inimigos} veredito={vd} compacto={baixo} cede={!noTelefone}
      intencaoDe={intencaoDe} alvo={alvoDaPrevisao} realce={realce} aoRealcar={setRealce} estreito={elesEstreita}
      age={contando ? passoDeles.quem : ""} agiram={td ? agiramNoTurno : null}>
      {/* OS ALVOS DECLARADOS ficam aqui, ao lado de quem eles nomeiam:
          são CONTROLES, e um controle que desaparece é função que a tela
          não tem. Só nascem quando há o que declarar (mais de um
          inimigo). */}
      <AlvosDeclarados inimigos={inimigos} nGolpes={p.nGolpes || 1} alvosGolpe={p.alvosGolpe || []}
        aoDeclarar={p.aoDeclararAlvo} aoLimpar={p.aoLimparAlvos} acaoTexto={p.acaoTexto} veredito={vd} />
    </QuemEstaDePe>
  );
  const rastro = <ORastroDosDados linhas={Array.isArray(combate.log) ? combate.log : []} registo={registoDoTurno && registoDoTurno.length ? registoDoTurno : p.registo || null} rodada={Math.max(0, (combate.rodada || 1) - 1)} />;
  const consulta = (<>{tu}{eles}</>);

  /* NO TELEFONE A COLUNA VIRA A TIRA, e a tira abre a ficha por cima do
     campo (R21: *acervo à vista vai a um toque, nunca sai*). */
  const passoDaTira = { passoM: p.passoM, passoTotal: p.passoTotal };
  const lateral = noTelefone ? (
    <aside className="shrink-0 min-w-0 w-full" style={{ order: 2 }}>
      <TiraDoHeroi personagem={personagem} economia={combate.economia} recursos={combate.recursos || null} acaoBonus={p.acaoBonus} {...passoDaTira} vez={vezDoHeroi}
        selos={modificadores} adversario={adversario} aberta={fichaAberta} aoAbrir={() => setFichaAberta((v) => !v)} />
      {/* §CB 16.3: o aviso da área já não é pílula por baixo da tira — é o
          texto do Pé do campo, quando nada está armado */}
      {fichaAberta && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end"
          style={{ padding: margem, paddingBottom: G.tiraDoHeroi + margem * 2, background: alfa(T.bg, VEU.leve) }}
          onClick={(e) => { if (e.target === e.currentTarget) setFichaAberta(false); }}>
          <div className="flex flex-col overflow-y-auto tv-scroll" style={{ gap: M.entrePaineis, maxHeight: "100%" }}>
            <button onClick={() => setFichaAberta(false)} aria-label="Fechar"
              className="tv-anel-foco tv-mono self-end flex items-center justify-center"
              style={{ ...LEGENDA, minHeight: ALVOS.piso, minWidth: ALVOS.piso, padding: `0 ${M.chipLadoX}px`, borderRadius: M.raioControle, background: T.panel, border: `1px solid ${T.line}`, color: T.inkDim }}>
              fechar
            </button>
            {consulta}
            {rastro}
          </div>
        </div>
      )}
    </aside>
  ) : (
    /* CB 2 · A COLUNA TU (470, cede até 320): o turno, O TEU GOLPE quando há
       alvo sob o rato, o aviso da área; o foco da escolha vive na SOBRA e só
       se mostra inteiro. Na janela baixa a coluna não dá altura à página
       (`contain: size`): quem a dá é o campo e a ação. */
    <aside className="flex flex-col min-h-0 min-w-0 shrink-0 overflow-y-auto tv-scroll"
      style={{ width: geo.coluna || M.lateral, order: 0, gap: baixo ? M.aperto.entrePaineis : M.entrePaineis, contain: janelaBaixa ? "size" : undefined }}>
      {tu}
      {/* §CB 17.1: com o dado no alvo, as faces acendem-se enquanto ele rola e a
          que saiu marca-se na leitura; sem previsão, as faces do próprio lance */}
      {/* CB 18.4 a: com Empurrar armado, o empurrão por extenso */}
      {empurrando && empAgora && <OEmpurraoPorExtenso empurrao={empAgora} alvo={enteDoEmpurrao} />}
      <OTeuGolpe previsao={prevGolpe ? { ...prevGolpe, vidaDoAlvo: enteDoAlvo ? enteDoAlvo.vida : prevGolpe.vidaDoAlvo }
        : lanceNaMesa && Array.isArray(lanceNaMesa.acertam) ? { alvo: lanceNaMesa.alvo, faces: lanceNaMesa.acertam, criticoEm: lanceNaMesa.criticoEm || 20 } : null}
        saiu={lanceNaMesa && !lanceNaMesa.rolando ? lanceNaMesa.saiu : null} estreito={(geo.coluna || M.lateral) < B3.colunaEstreita.faces} />
      <AvisoDaArea aviso={aviso} />
      <div ref={setSobraEl} className="flex flex-col min-h-0 overflow-hidden" style={{ flex: "1 1 0", gap: baixo ? M.aperto.entrePaineis : M.entrePaineis }}>
        {!p.fim && !prevGolpe && alturaDaSobra >= ALTURA_DO_FOCO && <FocoDaEscolha />}
      </div>
    </aside>
  );
  /* CB 2 · A COLUNA ELES (≥ 1280): «nesta rodada, eles vão» e a rodada de
     antes, que rola por dentro. Entre 768 e 1279 é uma GAVETA aberta pelo
     rosto do inimigo na fila (o alforje de R21). */
  const colunaEles = (
    <aside aria-label="Eles" className="flex flex-col min-h-0 min-w-0 shrink-0 overflow-y-auto tv-scroll"
      style={{ width: geo.coluna || M.lateral, order: 2, gap: baixo ? M.aperto.entrePaineis : M.entrePaineis, contain: janelaBaixa ? "size" : undefined }}>
      {eles}
      <div className="min-h-0 overflow-y-auto tv-scroll" style={{ flex: "0 1 auto" }}>{rastro}</div>
    </aside>
  );
  const gavetaEles = arranjo === "duas" && elesAberto ? (
    <div className="fixed inset-0 z-40 flex justify-end" style={{ background: alfa(T.bg, VEU.leve) }}
      onClick={(e) => { if (e.target === e.currentTarget) setElesAberto(false); }}
      onKeyDown={(e) => { if (e.key === "Escape") setElesAberto(false); }}>
      <div className="flex flex-col min-h-0 overflow-y-auto tv-scroll" style={{ width: B3.colunaMinima + B3.margem * 2, gap: M.entrePaineis, padding: margem, background: T.panel, borderLeft: `1px solid ${T.line}` }}>
        <button onClick={() => setElesAberto(false)} aria-label="Fechar"
          className="tv-anel-foco tv-mono self-end flex items-center justify-center"
          style={{ ...LEGENDA, minHeight: ALVOS.piso, minWidth: ALVOS.piso, padding: `0 ${M.chipLadoX}px`, borderRadius: M.raioControle, background: T.panelSoft, border: `1px solid ${T.line}`, color: T.inkDim }}>
          fechar
        </button>
        {eles}
        {rastro}
      </div>
    </div>
  ) : null;

  return (
    <div ref={raizRef} className={`flex-1 min-h-0 min-w-0 flex flex-col ${janelaBaixa ? "overflow-y-auto tv-scroll" : "overflow-hidden"}`} style={{ background: T.bg }}>
      {cena}
      {/* AS TRÊS COLUNAS no monitor (§CB 2): Tu, o campo com a ação, Eles. Em
          duas colunas, Eles é a gaveta. No telefone, uma — o campo, a tira, a
          ação, nesta ordem (`order`), com a coluna do centro desfeita
          (`display: contents`) para a tira morar entre as duas metades dela.
          A ordem do DOM continua a ser a do turno: campo → veredito → verbos. */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col md:flex-row"
        style={{ flex: janelaBaixa ? "1 0 auto" : undefined, gap: noTelefone ? B3.telefone.entre : estreito ? B3.margemEstreita : B3.entre, padding: noTelefone ? `0 ${margem}px ${margem}px` : curto ? `0 ${margem}px ${M.margemNoTelefone}px` : `${M.mesaTopo}px ${margem}px ${B3.margemDeBaixo}px` }}>
        {/* §CB 16.2: entre o campo e a barra, 8 em todos os patamares */}
        <div className="flex-1 min-h-0 min-w-0 flex-col" style={{ display: noTelefone ? "contents" : "flex", order: 1, gap: B3.entreCampoEBarra }}>
          {campo}
          {acaoDoFim || acao}
        </div>
        {/* Tu vem depois no DOM (a tabulação passa pelo campo e pelos verbos
            primeiro) e fica à esquerda na tela, pela propriedade order */}
        {!(esperando && noTelefone) && lateral}
        {arranjo === "tres" && colunaEles}
      </div>
      {gavetaEles}
    </div>
  );
}
