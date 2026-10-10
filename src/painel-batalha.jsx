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
import { Retrato, Glifo, Recibo, Dobra } from "./ui.jsx";
import { sementeDe, estadoDe } from "./semente.js";
import { metrosTxt, podeDarUmPasso, garantirGrade, nomeDoLugar } from "./grid.js";
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
const CORTE_ESTREITO = "(max-width: 1439px)";
const CORTE_CURTO = `(max-height: ${M.patamares.curto - 1}px)`;
const CORTE_BAIXO = `(max-height: ${M.patamares.baixo - 1}px)`;
function usarMidia(consulta) {
  const [casa, setCasa] = React.useState(false);
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

function FimDaLuta({ desfecho = "encerrada", recibo = [], chao = [], aoRecolher, aoSair, telefone = false }) {
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
/* B1b: no monitor a faixa deixou de ter linha própria — mora na linha do
   título, entre ele e a pílula, e rola na horizontal se não couber (44 px
   de chip mais 16 de respiro voltaram ao tabuleiro). No telefone continua
   a ser a sua linha. `compacto` é o patamar baixo: o chip desce a 38. */
function FaixaDaVez({ selos, entes, noTelefone, compacto = false }) {
  if (!selos.length) return null;
  return (
    <div className={`flex items-center overflow-x-auto tv-scroll ${noTelefone ? "shrink-0" : "flex-1 min-w-0"}`} style={{ gap: M.chipEntre + 2 }}>
      {!noTelefone && <span className="tv-mono shrink-0" style={{ ...LEGENDA, color: T.inkDim }}>Participantes</span>}
      {selos.map((s, i) => {
        const inimigo = s.lado === "inimigo";
        const corDoAnel = s.agora ? T.amber : inimigo ? T.danger : T.ok;
        const borda = s.agora ? T.amber : inimigo ? T.danger : T.line;
        return (
          <span key={`${s.nome}-${i}`} className="flex items-center shrink-0"
            style={{
              gap: M.chipEntre, padding: `${compacto ? M.aperto.chipLadoY : M.chipLadoY}px ${M.chipLadoX}px`, borderRadius: M.raioControle,
              background: s.agora ? T.panelSoft : T.panel, border: `1px solid ${borda}`,
              /* o chip do herói nunca sai da ponta esquerda: a única coisa
                 que ninguém pode ter de procurar rolando é a sua própria vez */
              position: s.heroi ? "sticky" : "static", left: 0, zIndex: s.heroi ? 2 : 1,
            }}>
            <RostoNaLuta ente={entes(s)} inimigo={inimigo} tamanho={M.retratoDoChip} anel={corDoAnel} />
            <span className="tv-mono truncate" style={{ fontSize: M.letra.chip, color: s.agora ? T.amberSoft : T.ink, maxWidth: 160 }}>{s.nome}</span>
            {s.agora && <span aria-hidden="true" style={{ width: M.pontoDaVez, height: M.pontoDaVez, borderRadius: M.pontoDaVez, background: T.amber }} />}
          </span>
        );
      })}
      {!noTelefone && <span className="flex-1 flex items-center" style={{ minWidth: M.glifoDaRuna * 2 }}><FioComRuna /></span>}
    </div>
  );
}

/* A PÍLULA DA VEZ — `AGORA: <nome>`, com as espadas. É a resposta à
   pergunta "de quem é a vez?", e é por isso que a faixa não precisa de
   rótulo nenhum. */
function PilulaDaVez({ rotulo, noTelefone, compacta = false }) {
  if (!rotulo) return null;
  /* B1b: no patamar baixo do monitor a pílula veste a medida do telefone
     (48 → 34 de altura) — é a mesma peça, e a medida já existia */
  const pequena = noTelefone || compacta;
  return (
    <span className="flex items-center shrink-0" style={{
      gap: M.pilulaLadoY, padding: pequena ? `${M.chipLadoY}px ${M.chipLadoX}px` : `${M.pilulaLadoY}px ${M.pilulaLadoX}px`,
      borderRadius: M.raioRedondo, background: alfa(T.amber, M.alfa.brilho), border: `1px solid ${alfa(T.amber, M.alfa.fio)}`,
    }}>
      <Glifo nome="espadas" tamanho={pequena ? M.glifoDoSelo + 4 : M.glifoDaPilula} cor={T.amber} />
      <span className="tv-mono truncate" style={{ ...LEGENDA, color: T.amberSoft, maxWidth: noTelefone ? 140 : 320 }}>{rotulo}</span>
    </span>
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
function LinhaDoVeredito({ texto, armado, reacao, noTelefone }) {
  return (
    <div className="shrink-0" style={{ position: "relative" }}>
      {reacao && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "100%", zIndex: 40 }}>{reacao}</div>
      )}
      <div className="flex items-center justify-between flex-wrap" style={{ minHeight: G.veredito, gap: M.entreVerbos }}>
        {!noTelefone && <span className="tv-mono shrink-0" style={{ ...LEGENDA, color: T.amberSoft }}>Sua próxima ação</span>}
        <span className="tv-mono flex items-center min-w-0" aria-live="polite"
          style={{ gap: M.entreVerbos, fontSize: M.letra.veredito, color: armado ? T.amberSoft : T.inkDim }}>
          <Glifo nome="mira" tamanho={M.glifoDoSelo + 4} cor={T.danger} />
          <span>{texto}</span>
        </span>
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
function Verbo({ v, armado, impedido, aoTocar, estreito = false }) {
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
      /* O ANEL DE FOCO É DA FOLHA, e por isso a sombra inline não entra
         aqui em circunstância nenhuma: estilo inline vence SEMPRE a folha,
         e o anel também é `box-shadow` — foi assim que a pílula da ficha
         apagou o seu anel em todos os estados sem ninguém notar (K4). */
      className="tv-anel-foco tv-mono flex items-center justify-center"
      style={{
        /* o alvo sai da tabela, nunca de aritmética de padding */
        minHeight: G.verbos, height: G.verbos,
        padding: `0 ${estreito ? M.chipLadoX : M.chipLadoX + 4}px`, gap: M.entreVerbos, borderRadius: M.raioControle,
        fontSize: M.letra.verbo, fontWeight: armado ? 600 : 500,
        /* `Atacar` é o primeiro entre iguais, e paga-se na LARGURA — nunca
           no preenchimento, que pertence ao armado */
        flex: v.primeiro ? "1 1 0" : recuo ? "0 0 auto" : "0 1 auto",
        minWidth: v.primeiro ? 120 : 0,
        background: armado ? T.amber : T.panelSoft,
        color: armado ? T.onAccent : recuo || impedido ? T.inkDim : T.ink,
        /* o armado HERDA o contorno do repouso do mesmo `Papel`: o traço é
           o que segura a largura, e tirá-lo encolheria o botão ao armar-se */
        border: `1px solid ${armado ? T.amber : T.line}`,
        opacity: impedido ? 0.45 : 1,
        position: "relative",
      }}>
      {v.primeiro && <Glifo nome="espadas" tamanho={M.glifo} cor={armado ? T.onAccent : T.violetSoft} />}
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

function FileiraDeVerbos({ verbos, armado, impedidos, aoTocar, gavetaAberta, aoAbrirGaveta, bolsaAberta, aoAbrirBolsa, nBolsa, estreito = false }) {
  const gestos = verbos.filter((v) => v.papel !== "recuo");
  /* MAIS DE UM RECUO PODE VIVER AQUI: `esperar` e `fugir` são os dois
     "sair do turno sem golpe" — era `.find` quando só `esperar` existia,
     e um `.find` teria engolido um dos dois em silêncio no dia em que o
     segundo chegasse. */
  const recuos = verbos.filter((v) => v.papel === "recuo");
  const gaveta = (aberta) => ({
    minHeight: G.verbos, height: G.verbos, minWidth: ALVOS.piso, borderRadius: M.raioControle,
    background: aberta ? T.violet : T.panelSoft,
    color: aberta ? T.onSecond : T.violetSoft,
    border: `1px solid ${aberta ? T.violet : T.line}`,
    gap: 4,
  });
  return (
    <div className="shrink-0 flex items-stretch flex-wrap" style={{ minHeight: G.verbos, gap: M.entreVerbos }}>
      {gestos.map((v) => (
        <Verbo key={v.id} v={v} armado={armado === v.id} impedido={!!impedidos[v.id]} aoTocar={() => aoTocar(v)} estreito={estreito} />
      ))}
      {/* AS DUAS GAVETAS — abrem lista, logo não são verbos */}
      <button onClick={aoAbrirGaveta} aria-pressed={gavetaAberta} title="Habilidades" aria-label="Habilidades"
        className="tv-anel-foco tv-mono inline-flex items-center justify-center" style={{ minWidth: ALVOS.piso, ...gaveta(gavetaAberta) }}><Glifo nome="faisca" tamanho={M.glifo} /></button>
      <button onClick={aoAbrirBolsa} aria-pressed={bolsaAberta} title="Bolsa" aria-label={nBolsa > 0 ? `Bolsa, ${nBolsa}` : "Bolsa"}
        className="tv-anel-foco tv-mono inline-flex items-center justify-center" style={{ minWidth: ALVOS.piso, ...gaveta(bolsaAberta), fontSize: M.letra.chip }}><Glifo nome="bolsa" tamanho={M.glifo} />{nBolsa > 0 ? nBolsa : null}</button>
      {/* o fio, e depois os recuos — a posição do Recuo em toda a casa */}
      {recuos.length > 0 && (
        <span className="flex items-center" style={{ gap: M.entreVerbos }}>
          <span aria-hidden="true" style={{ width: 1, height: M.separador, background: T.line }} />
          {recuos.map((v) => (
            <Verbo key={v.id} v={v} armado={armado === v.id} impedido={!!impedidos[v.id]} aoTocar={() => aoTocar(v)} estreito={estreito} />
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
function AUltimaFala({ texto, inteiro = "", carregando, noTelefone }) {
  return (
    <div className="shrink-0 overflow-hidden" style={{ maxHeight: noTelefone ? G.narracaoNoTelefone : G.narracao }}>
      <p className={`tv-body${noTelefone ? " truncate" : ""}`} title={inteiro || undefined}
        style={{
          fontSize: M.letra.cena, color: T.inkMeio, lineHeight: 1.625, margin: 0,
          ...(noTelefone ? {} : { display: "-webkit-box", WebkitLineClamp: NARRACAO.linhas, WebkitBoxOrient: "vertical", overflow: "hidden" }),
        }}>
        {carregando && !texto ? "" : texto}
      </p>
    </div>
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

/* O selo da economia da rodada — `ação` (e `extra`, quando há ação
   bônus). Uma pílula acesa sem número faria a segunda ação existir só
   para quem leu o código; e quem não tem ação bônus não vê a pílula dela
   — mostrar um recurso permanentemente riscado ensina a regra errada. */
function SeloDaRodada({ ativo, glifo, rotulo }) {
  return (
    <span className="tv-mono inline-flex items-center shrink-0"
      style={{
        gap: 6, padding: "4px 8px", borderRadius: M.raioSelo, fontSize: M.letra.legenda,
        border: `1px solid ${ativo ? alfa(T.amber, M.alfa.fio) : T.line}`,
        color: ativo ? T.amberSoft : T.inkDim, opacity: ativo ? 1 : 0.45,
        textDecoration: ativo ? "none" : "line-through",
      }}>
      <Glifo nome={glifo} tamanho={M.glifoDoSelo} cor={ativo ? T.amber : T.inkDim} />{rotulo}
    </span>
  );
}
function SelosDaRodada({ economia, acaoBonus, curto = false }) {
  const eco = economia || { acao: 1, extra: 1 };
  return (
    <>
      <SeloDaRodada ativo={eco.acao > 0} glifo="espadas" rotulo={eco.acao > 1 ? `${curto ? "" : "ação "}×${eco.acao}` : curto ? "" : "ação"} />
      {eco.extra != null && (eco.extra > 0 || acaoBonus) && <SeloDaRodada ativo={eco.extra > 0} glifo="faisca" rotulo={curto ? "" : "extra"} />}
    </>
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
/* B1b: `compacto` é o patamar baixo — a moldura, o retrato, o nome e os
   respiros descem aos de `M.aperto`; nenhum campo sai. */
function TurnoAtual({ personagem, economia, acaoBonus, selos = [], compacto = false }) {
  const grave = personagem.vidaMax > 0 && personagem.vida / personagem.vidaMax <= 1 / 3;
  const m = compacto ? M.aperto : M;
  return (
    <div className="tv-mesa-vez flex flex-col shrink-0 w-full"
      style={{ padding: m.turnoRespiro, gap: m.turnoEntre, borderRadius: M.raio, background: T.panel, border: `1px solid ${grave ? T.danger : alfa(T.amber, M.alfa.fio)}` }}>
      <div className="flex items-center justify-between">
        <span className="tv-mono" style={{ ...LEGENDA, color: T.amber }}>Turno atual</span>
        <span className="flex items-center" style={{ gap: 6 }}><SelosDaRodada economia={economia} acaoBonus={acaoBonus} /></span>
      </div>
      <div className="flex flex-col items-center" style={{ gap: compacto ? M.chipLadoY : M.cartao }}>
        <span className="flex items-center justify-center" style={{ width: m.moldura, height: m.moldura, borderRadius: m.moldura, background: alfa(T.amber, M.alfa.brilho), border: `1px solid ${alfa(T.amber, M.alfa.fio)}` }}>
          <RostoNaLuta ente={personagem} tamanho={m.retratoDoHeroi} anel={grave ? T.danger : T.amber} />
        </span>
        <span className="tv-display text-center w-full truncate" style={{ fontSize: compacto ? M.aperto.nomeDoHeroi : M.letra.nomeDoHeroi, color: T.ink, fontWeight: 600, lineHeight: 1.2 }}>{personagem.nome}</span>
      </div>
      <div style={{ height: 1, background: alfa(T.amber, M.alfa.fio) }} />
      <Recurso rotulo="PV" atual={personagem.vida} max={personagem.vidaMax} cor={grave ? T.danger : T.amber} />
      {personagem.manaMax > 0 && <Recurso rotulo="PM" atual={personagem.mana} max={personagem.manaMax} cor={T.violetSoft} />}
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
function TiraDoHeroi({ personagem, economia, acaoBonus, selos = [], adversario = null, aberta, aoAbrir }) {
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
      <SelosDaRodada economia={economia} acaoBonus={acaoBonus} curto />
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

/* ---------------- O QUE OS DADOS DISSERAM ----------------
   Contabilidade, e por isso fica ao pé da coluna da direita, e rola
   dentro dela (B1: *nada se corta, traduz-se*). */
function ORastroDosDados({ linhas }) {
  if (!linhas.length) return null;
  return (
    <div className="shrink-0" style={{ padding: M.cartao, borderRadius: M.raioControle, background: T.panel, border: `1px solid ${T.line}` }}>
      {linhas.map((l, i) => (
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
function QuemEstaDePe({ grupo, inimigos, veredito, children, compacto = false, cede = false }) {
  const m = compacto ? M.aperto : M;
  return (
    <div className="flex flex-col w-full min-h-0 overflow-hidden"
      style={{ flex: cede ? "0 1 auto" : "0 0 auto", padding: m.outrosRespiro, gap: m.outrosEntre, borderRadius: M.raio, background: T.panel, border: `1px solid ${T.line}` }}>
      <span className="tv-mono shrink-0" style={{ ...LEGENDA, color: T.inkDim }}>Nesta batalha</span>
      <div className="flex flex-col min-h-0 overflow-y-auto tv-scroll" style={{ gap: m.outrosEntre }}>
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
      {inimigos.map((e, i) => {
        const vz = ((veredito && veredito.alvos) || []).find((x) => x.nome === e.nome);
        return (
          <div key={`i${i}`} className="flex flex-col"
            style={{ gap: M.cartao, padding: M.cartao, borderRadius: M.raioControle, background: T.pagina, border: `1px solid ${e.derrotado ? T.line : T.danger}`, opacity: e.derrotado ? 0.5 : 1 }}>
            <div className="flex items-center" style={{ gap: M.chipEntre }}>
              <span style={{ filter: e.derrotado ? "grayscale(1)" : "none" }}>
                <RostoNaLuta inimigo ente={e} tamanho={M.retratoDosOutros} anel={e.derrotado ? T.line : T.danger} />
              </span>
              <span className="flex items-baseline gap-1.5 flex-1 min-w-0">
                <span className="tv-display truncate" style={{ fontSize: M.letra.nomeDoInimigo, color: e.derrotado ? T.inkDim : T.ink, fontWeight: 600, lineHeight: 1.1, textDecoration: e.derrotado ? "line-through" : "none" }}>{e.nome}</span>
                {(e.gd || 0) > 0 && <span className="tv-mono" title={tituloDe(e.gd)} style={{ fontSize: M.letra.legenda, color: T.amber }}>GD {e.gd}</span>}
              </span>
              {vz && !e.derrotado && (
                <span className="tv-mono shrink-0" style={{ fontSize: M.letra.valorDoOutro, color: vz.ok ? T.amberSoft : T.danger }}>
                  {metrosTxt(vz.distanciaM)} m
                </span>
              )}
            </div>
            {!e.derrotado && <Recurso rotulo="PV" atual={e.vida} max={e.vidaMax} cor={T.danger} />}
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

  /* A1: o gesto sem motor sai da fileira (lido da tabela, nunca pelo nome) */
  const verbos = fileiraDeVerbos().filter(temMotorOuNaoEGesto);
  const selos = faixaDaVez(combate, personagem.nome);
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
  const irAZona = (r) => {
    try {
      const el = janelaRef.current;
      if (!el || !r) return;
      /* a linha do campo é medida no DOM — a régua de cima e o lado da
         casa ficam com quem os desenha, e nenhuma conta aqui os repete */
      const linha = el.querySelectorAll('[role="row"]')[r.y0];
      if (!linha || !linha.getBoundingClientRect) return;
      const topo = el.scrollTop + (linha.getBoundingClientRect().top - el.getBoundingClientRect().top);
      el.scrollTo({ top: Math.max(0, topo), behavior: movimentoParado() ? "auto" : "smooth" });
    } catch (e) { console.warn("TelaDeBatalha: ir à zona falhou", e); }
  };

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
       a tela mostra o cartão de saída. */
    fugiu: !!p.fugiu,
  });

  const fala = ultimasLinhasDoMestre(p.mensagens, {
    linhas: noTelefone ? NARRACAO.linhasNoTelefone : NARRACAO.linhas,
    chars: noTelefone ? NARRACAO.charsPorLinhaNoTelefone : NARRACAO.charsPorLinha,
  });
  /* a fala sem corte nenhum, para o `title` (B1b) — o mesmo módulo, sem teto */
  const falaInteira = ultimasLinhasDoMestre(p.mensagens, { linhas: 1, chars: Infinity });

  const tocarVerbo = (v) => {
    /* O VERBO QUE NÃO PODE ARMAR RECUSA, E A LINHA DIZ PORQUÊ. Antes ele
       aceitava o toque, ficava `aria-pressed=true` e a linha mandava
       "toque a casa onde quer parar" sem casa nenhuma para tocar. */
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

  const titulo = comMaiuscula(zonaDoHeroi);
  const margem = noTelefone || estreito ? M.margemNoTelefone : M.margem;

  /* ============================================================
     A CENA E O TURNO — o cabeçalho do quadro
     ============================================================ */
  /* B1b · O CABEÇALHO APERTA. No monitor os participantes sobem à linha
     do título (entre ele e a pílula), e a frase fica em duas linhas com
     reticências. No patamar baixo os respiros descem aos de `M.aperto`, o
     título ao do telefone, e a pílula e os chips encolhem. No telefone,
     nada muda: a faixa continua a ser a sua linha. */
  const faixa = (<>{!esperando && <FaixaDaVez selos={selos} entes={enteDoSelo} noTelefone={noTelefone} compacto={baixo} />}</>);
  const respiroDaCena = noTelefone || curto
    ? (baixo ? { topo: M.aperto.cenaTopo, baixo: M.aperto.cenaBaixo, entre: M.aperto.cenaEntre } : { topo: M.chipLadoX, baixo: M.chipLadoY, entre: M.chipLadoY })
    : { topo: M.cenaTopo, baixo: M.cenaBaixo, entre: M.cenaEntre };
  const cena = (
    <header className="flex flex-col shrink-0 min-w-0"
      style={{ padding: `${respiroDaCena.topo}px ${margem}px ${respiroDaCena.baixo}px`, gap: respiroDaCena.entre }}>
      <div className="flex items-center justify-between min-w-0" style={{ gap: noTelefone ? M.chipLadoX : M.entreColunas }}>
        <div className="flex flex-col min-w-0" style={{ gap: 4, flex: "0 1 auto" }}>
          {/* A1 (peça 93): a FORMA do quadro fica — a legenda de máquina por
              cima do título — e o conteúdo passa a ser de mundo: o lugar (que
              o App passa em `lugar`) e a rodada. O que nomeava o produto e a
              tela ("Taverna / mesa de batalha") sai: a lei 2 da Fase V. */}
          {!noTelefone && <span className="tv-mono" style={{ ...LEGENDA, color: T.amber }}>{[p.lugar, `rodada ${combate.rodada || 1}`].filter(Boolean).join(" · ")}</span>}
          {titulo && (
            <h2 className="tv-display truncate" style={{ fontSize: noTelefone || baixo ? M.letra.tituloNoTelefone : M.letra.titulo, color: T.ink, fontWeight: 600, lineHeight: 1.1, margin: 0 }}>{titulo}</h2>
          )}
        </div>
        {!noTelefone && faixa}
        <PilulaDaVez rotulo={rotuloDaVez(selos)} noTelefone={noTelefone} compacta={baixo} />
      </div>
      <AUltimaFala texto={fala} inteiro={falaInteira} carregando={p.carregando} noTelefone={noTelefone} />
      {noTelefone && faixa}
    </header>
  );

  /* ============================================================
     O CAMPO DE BATALHA — a arena do quadro
     ============================================================ */
  const alturaDoCabecalhoDoCampo = baixo ? M.aperto.arenaCabecalho : M.arenaCabecalho;
  const campo = (
    <section className="tv-mesa-arena flex flex-col min-h-0 min-w-0 w-full overflow-hidden"
      style={{ flex: "1 1 auto", order: 1, borderRadius: M.raio, background: T.pagina, border: `1px solid ${T.line}` }}>
      {!noTelefone && (
        <div className="flex items-center justify-between shrink-0 min-w-0"
          style={{ minHeight: alturaDoCabecalhoDoCampo, padding: `0 ${M.arenaLado}px`, background: T.panel, gap: M.chipLadoX }}>
          <span className="flex items-center shrink-0" style={{ gap: M.entreVerbos }}>
            <Glifo nome="campo" tamanho={M.glifo} cor={T.amber} />
            <span className="tv-mono" style={{ ...LEGENDA, color: T.amberSoft }}>Campo de batalha</span>
          </span>
          {zonas.length > 0 && (
            <span className="flex items-center min-w-0 overflow-x-auto tv-scroll" style={{ gap: M.cenaEntre }}>
              {zonas.map((r, i) => {
                const acesa = r.nome === zonaDoHeroi;
                return (
                  <React.Fragment key={r.nome + i}>
                    {i > 0 && <span aria-hidden="true" className="shrink-0" style={{ width: 1, height: M.glifoDoSelo, background: T.line }} />}
                    <button onClick={() => irAZona(r)} aria-current={acesa ? "location" : undefined}
                      className="tv-anel-foco tv-mono shrink-0"
                      style={{ ...LEGENDA, minHeight: alturaDoCabecalhoDoCampo, color: acesa ? T.amberSoft : T.inkDim }}>
                      {r.nome}
                    </button>
                  </React.Fragment>
                );
              })}
            </span>
          )}
        </div>
      )}
      {/* A JANELA SOBRE O CAMPO: o tabuleiro cabe inteiro nela (B1b) e,
          só quando nem com a casa no piso cabe, é ela que rola. O rolamento
          é desta caixa, e nunca do log — é a inversão.

          E O TOQUE NO CAMPO DESARMA: é a terceira saída de W1, a única
          que existe no telefone, onde não há `Esc`. Vive aqui e não na
          casa porque a casa fora do alcance não tem ouvinte nenhum. */}
      <div ref={janelaRef} className="flex-1 min-h-0 min-w-0 overflow-auto tv-scroll"
        style={{ minHeight: ALVOS.piso * M.janelaMinima }}
        onPointerDown={() => setArmado("")}>
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
          ladoFixo={noTelefone ? ALVOS.piso : M.casaMinimaNoMonitor} larguraDaJanela={larguraDaJanela}
          alturaDaJanela={noTelefone ? 0 : alturaDaJanela} tetoDoLado={noTelefone ? 0 : M.casaMaximaNoMonitor}
          aoMedirOLado={aoMedirOLado}
          pe={peDaArena} peCompacto={noTelefone} legendaCede={!!p.reacao} />
      </div>
      <div ref={setPeDaArena} className="shrink-0 min-w-0"
        style={{ minHeight: M.arenaPe, padding: `0 ${noTelefone ? M.chipLadoX : M.arenaLado}px`, borderTop: `1px solid ${T.line}` }} />
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
  const respiroDaAcao = { order: 3, gap: noTelefone || curto ? M.entreVerbos : M.escolhasEntre, padding: noTelefone ? M.escolhasRespiroNoTelefone : curto ? M.chipLadoX : M.escolhasRespiro, borderRadius: M.raio, background: T.panel, border: `1px solid ${T.line}` };
  const acaoDoFim = fimComEspolio ? (
    <section className="flex flex-col shrink-0 min-w-0 w-full" style={respiroDaAcao}>
      <FimDaLuta desfecho={p.espolio.desfecho} recibo={p.espolio.recibo} chao={p.espolio.noChao}
        aoRecolher={p.aoRecolher} aoSair={p.aoSair} telefone={noTelefone} />
    </section>
  ) : null;
  const acao = (
    <section className="flex flex-col shrink-0 min-w-0 w-full" style={respiroDaAcao}>
      {!esperando && <LinhaDoVeredito texto={linha} armado={!!armado} reacao={p.reacao} noTelefone={noTelefone} />}
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
      ) : (
        <FileiraDeVerbos verbos={verbos} armado={armado} impedidos={impedidos}
          aoTocar={tocarVerbo}
          gavetaAberta={!!p.gavetaAberta} aoAbrirGaveta={p.aoAbrirGaveta}
          bolsaAberta={bolsaAberta} aoAbrirBolsa={() => setBolsaAberta((v) => !v)}
          nBolsa={(p.bolsa || []).length} estreito={estreito || noTelefone} />
      )}
      {/* O TEXTO LIVRE muda de papel: deixa de ser a sintaxe obrigatória e
          vira o tempero. O convite é `como? (opcional)`, e ele NUNCA é
          `disabled` enquanto há um verbo armado — escrever e mirar são
          compatíveis, e é esse o ponto inteiro. No quadro B1 é o
          "Compositor de ação": a caixa com a pena e o `Agir →` com o d20. */}
      {!p.decisao && <div className="flex items-center gap-2 rounded-lg px-2 shrink-0"
        style={{ gap: noTelefone ? M.entreVerbos : M.escolhasEntre, padding: 0 }}>
        <label className="flex items-center flex-1 min-w-0"
          style={{ minHeight: noTelefone || curto ? ALVOS.piso : M.compositor, gap: M.chipLadoX, padding: `0 ${noTelefone ? M.chipLadoX : M.compositorLado}px`, borderRadius: M.raioRedondo, background: T.pagina, border: `1px solid ${armado ? T.amber : T.line}` }}>
          <Glifo nome="pena" tamanho={M.glifo} cor={T.violetSoft} />
          <input value={p.entrada || ""} onChange={(e) => p.aoEscrever && p.aoEscrever(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && p.aoAgir) { setArmado(""); p.aoAgir(p.entrada); } }}
            placeholder={armado ? PEDIDO_DO_VERBO[armado] || "como? (opcional)" : "como? (opcional)"}
            disabled={!armado && !!p.bloqueado}
            className="tv-anel-foco flex-1 bg-transparent tv-body min-w-0" style={{ fontSize: M.letra.cena, color: T.ink, minHeight: ALVOS.piso - 8 }} />
        </label>
        <button onClick={() => { setArmado(""); if (p.aoAgir) p.aoAgir(p.entrada); }}
          disabled={!!p.bloqueado || !String(p.entrada || "").trim()}
          className="tv-anel-foco tv-mono flex items-center justify-center shrink-0"
          style={{
            minHeight: noTelefone || curto ? ALVOS.piso : M.compositor, width: noTelefone ? "auto" : M.agir,
            gap: M.chipLadoX, padding: `0 ${M.chipLadoX + 6}px`, borderRadius: M.raioRedondo,
            background: alfa(T.amber, M.alfa.brilho), border: `1px solid ${alfa(T.amber, M.alfa.fio)}`,
            color: T.amberSoft, fontSize: M.letra.agir, fontWeight: 700,
            opacity: (p.bloqueado || !String(p.entrada || "").trim()) ? 0.4 : 1,
          }}>
          <Glifo nome="dado" tamanho={M.glifoDoDado} cor={T.amber} />
          Agir →
        </button>
      </div>}
      {p.dado}
    </section>
  );

  /* ============================================================
     A COLUNA DA DIREITA — o turno atual, nesta batalha, o foco
     ============================================================ */
  const consulta = (
    <>
      <TurnoAtual personagem={personagem} economia={combate.economia} acaoBonus={p.acaoBonus} selos={modificadores} compacto={baixo} />
      <QuemEstaDePe grupo={grupo} inimigos={inimigos} veredito={vd} compacto={baixo} cede={!noTelefone}>
        {/* OS ALVOS DECLARADOS ficam aqui, ao lado de quem eles nomeiam:
            são CONTROLES, e um controle que desaparece é função que a tela
            não tem. Só nascem quando há o que declarar (mais de um
            inimigo). */}
        <AlvosDeclarados inimigos={inimigos} nGolpes={p.nGolpes || 1} alvosGolpe={p.alvosGolpe || []}
          aoDeclarar={p.aoDeclararAlvo} aoLimpar={p.aoLimparAlvos} acaoTexto={p.acaoTexto} veredito={vd} />
      </QuemEstaDePe>
    </>
  );

  /* NO TELEFONE A COLUNA VIRA A TIRA, e a tira abre a coluna por cima do
     campo (R21: *acervo à vista vai a um toque, nunca sai*). No monitor é
     a coluna do quadro, 328 px, e rola dentro de si. */
  const lateral = noTelefone ? (
    <aside className="shrink-0 min-w-0 w-full" style={{ order: 2 }}>
      <TiraDoHeroi personagem={personagem} economia={combate.economia} acaoBonus={p.acaoBonus}
        selos={modificadores} adversario={adversario} aberta={fichaAberta} aoAbrir={() => setFichaAberta((v) => !v)} />
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
            <ORastroDosDados linhas={Array.isArray(combate.log) ? combate.log : []} />
          </div>
        </div>
      )}
    </aside>
  ) : (
    /* B1b · A COLUNA CABE INTEIRA. O turno atual não cede; NESTA BATALHA
       cede a altura e rola por dentro; o foco e o rastro vivem na SOBRA —
       o foco só se mostra inteiro, e o rastro rola no que restar. A ordem
       de quem cede é esta: o foco, depois o rastro, e só então a lista de
       quem está nesta batalha. A rolagem da própria coluna fica como rede,
       para uma janela mais baixa do que qualquer patamar. */
    <aside className="flex flex-col min-h-0 min-w-0 shrink-0 overflow-y-auto tv-scroll"
      style={{ width: M.lateral, gap: baixo ? M.aperto.entrePaineis : M.entrePaineis }}>
      {consulta}
      <div ref={setSobraEl} className="flex flex-col min-h-0 overflow-hidden" style={{ flex: "1 1 0", gap: baixo ? M.aperto.entrePaineis : M.entrePaineis }}>
        {!p.fim && alturaDaSobra >= ALTURA_DO_FOCO && <FocoDaEscolha />}
        <div className="min-h-0 overflow-y-auto tv-scroll" style={{ flex: "0 1 auto" }}>
          <ORastroDosDados linhas={Array.isArray(combate.log) ? combate.log : []} />
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden" style={{ background: T.bg }}>
      {cena}
      {/* DUAS COLUNAS no monitor: o campo e a ação à esquerda, a consulta à
          direita. No telefone, uma — o campo, a tira, a ação, nesta ordem
          (`order`), com a coluna da esquerda desfeita (`display: contents`)
          para a tira poder morar entre as duas metades dela. A ordem do DOM
          continua a ser a do turno: campo → veredito → verbos. */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col md:flex-row"
        style={{ gap: noTelefone ? M.entreVerbos : estreito ? M.margemNoTelefone : M.entreColunas, padding: noTelefone ? `0 ${margem}px ${margem}px` : curto ? `0 ${margem}px ${M.margemNoTelefone}px` : `${M.mesaTopo}px ${margem}px ${M.mesaBaixo}px` }}>
        <div className="flex-1 min-h-0 min-w-0 flex-col" style={{ display: noTelefone ? "contents" : "flex", gap: curto ? M.chipLadoX : M.entrePaineis }}>
          {campo}
          {acaoDoFim || acao}
        </div>
        {!(esperando && noTelefone) && lateral}
      </div>
    </div>
  );
}
