/* ============================================================
   O RELATO — Taverna (A1 · B1, 10/10/2026)

   O registo da página: o que o jogador disse, o que o Mestre contou, e as
   corridas de linhas do sistema entre um e outro. Morou no `App.jsx` até
   A1, e saiu dele inteiro, sem mudar um pixel — é uma mudança de casa, não
   de forma.

   POR QUE SAIU: a auditoria de A1 (`mente/a1-jogo.md`) mexe no relato
   em quase todas as peças — a dobra da luta, o recibo do turno, as portas.
   Dentro do arquivo de vinte e seis mil linhas, cada uma dessas mudanças
   pedia o bastão. Aqui, o relato passa a ser da mesa.

   O QUE O APP PASSA, e só isto (o resto é deste módulo):
     mensagens   a lista do registo, como está no save
     carregando  o turno partiu e a resposta não voltou (o filete âmbar)
     voz         { i, status } do botão de ouvir, ou null
     abertura    o índice da resposta que abre com cerimónia, ou null
     aoAbrir     (porta) => abre a aba/sub-aba que a linha com seta anuncia
     aoOuvir     (i, texto) => lê em voz alta a resposta i

   OS CAMPOS DA MENSAGEM que este módulo conhece: `autor`, `texto`, e os
   três de A1, todos novos e ignorados pela versão antiga:
     naLuta     a mensagem entrou com a luta aberta (`pushMsgs`, B1)
     recibo     na mensagem do Mestre: a fila de `reciboDoTurno` (B2)
     fimDaLuta  na última mensagem da luta: `{ caidos, rodadas, recibo,
                desfecho }` — é ela que fecha a dobra "A luta" (B2)

   A1 · QUEM MORA ONDE NÃO SE DECIDE AQUI: `arrumarORelato` (glifos.js),
   pura e provada em Node, lê `moradaDaLinha` e devolve os itens da
   página; este módulo só os desenha. `recibo` e `cala` não se desenham
   (ficam no save); `dia` vira a dobra "O dia"; a luta que fechou vira UMA
   dobra, "A luta", onde ela fechou. A PROSA DO MESTRE NUNCA ENTRA NUMA
   DOBRA (`formas.md` §A1, divergência 4).
   ============================================================ */

import React, { useState } from "react";
import { T, TIPOS, ALVOS, ESBATIMENTO, LADRILHO, PAGINA, RECIBO } from "./estilo.js";
import { Voz, DivisoriaRunica, Prosa, BotaoDeOuvir, Glifo, LadrilhoDoAssunto, Recibo, Dobra, useMesa } from "./ui.jsx";
import { assuntoDaLinha, arrumarORelato, cabecalhoDaLuta, linhasDaLuta } from "./glifos.js";
import { SUBS_GESTAO } from "./abas.js";
/* As frases dos verbos da fileira (golpe.js, pela tela da batalha): é por
   elas que o eco do verbo se reconhece e cala dentro da dobra da luta. Lidas
   da tabela, nunca escritas aqui — no dia em que um verbo mudar de frase, o
   eco dele continua a calar. */
import { fileiraDeVerbos } from "./tela-de-batalha.js";
const FRASES_DOS_VERBOS = (() => { try { return fileiraDeVerbos().map((v) => v.frase).filter(Boolean); } catch (e) { return []; } })();

/* ---------------- O SINAL DE SETA FICA RESERVADO AO QUE SE TOCA (R3) ----------------
   O defeito mais curto do estudo de R1, e o mais difícil de defender: o
   Mestre fecha o turno escrevendo uma linha de sistema com o sinal de
   seta — o glifo universal de "vá aqui" — e o que chega ao DOM é
   `{tag:"SPAN", clicavel:false, cursor:"auto"}`. Nove afordâncias no
   primeiro ecrã, zero tocáveis. O jogo desenha a porta e não põe a
   maçaneta, e o que está do outro lado existe, funciona e é bom.

   A LEI NOVA, escrita pelo `desenho` em R1 e aplicada aqui: o sinal de
   seta fica reservado ao que se toca. Onde ele não puder abrir nada, ELE
   SAI — não fica um glifo a mentir. As duas metades vivem juntas de
   propósito: quem um dia acrescentar uma linha nova com seta ou lhe dá
   destino, ou vê a seta desaparecer sozinha na tela.

   O ROTULO SAI DA MESMA TABELA QUE ESCREVEU A LINHA. `falaDaNovidade`
   monta o texto a partir de `SUBS_GESTAO`; ler o rótulo de volta da
   MESMA lista é o que impede as duas pontas de divergirem. Uma lista de
   nomes escrita à mão aqui envelheceria no dia em que uma aba mudasse de
   nome — e envelheceria calada, porque a linha continuaria a aparecer,
   só que morta outra vez.

   (O Códex é o único que não está em `SUBS_GESTAO`: ele é aba de cima,
   mora em `ABAS_COM_PORTA`, e lá o rótulo não é campo da tabela. É a
   única cópia, e está aqui declarada em vez de escondida.) */
const SETA_DA_PORTA = "\u25B8 ";
/* (A1 \u00B7 B3: o Di\u00E1rio \u00E9 a segunda aba de cima com porta \u2014 a do aceite,
   "\u25B8 Di\u00E1rio \u2014 {t\u00EDtulo} \u00B7 pr\u00F3ximo: {passo}", que `portaDoAceite` escreve no
   App. Sem esta entrada a seta mentia: a linha nascia e n\u00E3o abria nada. O id
   \u00E9 o de `ABAS` no App, o mesmo que `abrirPortaDoSistema` passa a `setAba`.) */
const PORTAS_DO_SISTEMA = [
  ...SUBS_GESTAO.map((sub) => ({ rotulo: sub.rotulo, aba: "gestao", sub: sub.id })),
  { rotulo: "C\u00F3dex", aba: "codex", sub: null },
  { rotulo: "Di\u00E1rio", aba: "diario", sub: null },
];
function portaDaLinhaDeSistema(texto) {
  const linha = String(texto == null ? "" : texto);
  if (!linha.startsWith(SETA_DA_PORTA)) return null;
  const nome = linha.slice(SETA_DA_PORTA.length).split("\u2014")[0].trim();
  if (!nome) return null;
  return PORTAS_DO_SISTEMA.find((p) => p.rotulo.toLowerCase() === nome.toLowerCase()) || null;
}
function semSetaQueMente(texto) {
  const linha = String(texto == null ? "" : texto);
  return linha.startsWith(SETA_DA_PORTA) ? linha.slice(SETA_DA_PORTA.length) : linha;
}

/* ---------------- UMA CORRIDA DE LINHAS DO SISTEMA (v9.32) ----------------
   O que não se dobra fica em cima, como sempre foi. O que é contabilidade
   pura desce para uma linha só de saldo, que abre com um toque. A dobra
   nasce FECHADA de propósito: quem quer conferir a conta clica; quem quer
   ler a cena não precisa fazer nada. */
function BlocoSistema({ visiveis = [], dobradas = [], saldo = "", aoAbrir }) {
  const [aberto, setAberto] = useState(false);
  /* ---------------- A FORMA SEGUE O CONTEÚDO (v9.149) ----------------
     A pílula centralizada foi feita para o aviso de uma linha ("⛔ item
     equipado"), e serve muito bem para isso. O recap da retomada é uma
     LISTA — lugar, o que pesou, o que ficou devendo — e dentro da pílula
     ele virava um parágrafo corrido e centralizado: as quebras de linha
     sumiam e seis fatos viravam um muro.

     A regra não é "recap tem forma própria", é mais simples e vale para
     o que vier depois: texto com quebra de linha é bloco, texto sem
     quebra é pílula. Quem escreve a mensagem decide a forma sem precisar
     saber que esta função existe. */
  /* V3b (25/09) · A PÍLULA CENTRADA SAIU; cada fala é uma LINHA com o
     `LadrilhoDoAssunto` (36, glifo 16 — a linha do registo da v3, `47:2`) e a
     frase alinhada à coluna. O emoji do motor vira o assunto por
     `assuntoDaLinha` (`glifos.js`); o motor não se toca. `⛔` vira o tom
     Impedido (ladrilho oco, frase a cinza), não um glifo. Sem assunto, um
     vazio de 36: as frases ficam na mesma coluna. A porta é a linha feita
     botão: a seta no ladrilho (o assunto dela é IR), fio `lineStrong` e a
     largura do texto (`v3-jogo.md` §9.2-1: sem fio, lia-se frase realçada).
     O alvo continua o de R3: quem abre uma porta cumpre `ALVOS.piso`, e o
     ladrilho nunca é o alvo — é a linha inteira. */
  const linha = (txt, i) => {
    const bruto = String(txt);
    const porta = aoAbrir ? portaDaLinhaDeSistema(bruto) : null;
    const { glifo, tom, resto } = assuntoDaLinha(semSetaQueMente(bruto));
    const impedido = tom === "impedido", bloco = resto.includes("\n");
    const miolo = (
      <>
        {porta ? <LadrilhoDoAssunto tom="porta" /> : glifo || impedido ? <LadrilhoDoAssunto glifo={glifo} tom={tom} /> : <span aria-hidden="true" className="shrink-0" style={{ width: LADRILHO.lado }} />}
        <span className={(bloco ? "whitespace-pre-line " : "") + (porta ? "min-w-0" : "flex-1 min-w-0")} style={{ color: porta ? T.amberSoft : impedido ? T.inkDim : T.inkMeio }}>{resto}</span>
        {/* a seta da porta mora no ladrilho, à esquerda: a coluna dos assuntos fica inteira */}
      </>
    );
    return porta ? (
      <button key={i} type="button" onClick={() => aoAbrir(porta)} className="tv-fade tv-anel-foco tv-mono w-fit max-w-full text-left flex items-center"
        style={{ fontSize: TIPOS.maquina, minHeight: ALVOS.piso, gap: LADRILHO.espaco, cursor: "pointer", border: "1px solid " + T.lineStrong, borderRadius: LADRILHO.raio, padding: "0 12px 0 5px", marginLeft: -6 }}>{miolo}</button>
    ) : (
      <div key={i} className={"tv-fade tv-mono flex " + (bloco ? "items-start" : "items-center")}
        style={{ fontSize: TIPOS.maquina, gap: LADRILHO.espaco, minHeight: LADRILHO.lado }}>{miolo}</div>
    );
  };
  const doSaldo = assuntoDaLinha(saldo);
  return (
    <div className="tv-coluna space-y-2">
      {visiveis.map(linha)}
      {dobradas.length > 0 && (
        <div className="tv-fade flex flex-col gap-1.5">
          <button onClick={() => setAberto((v) => !v)}
            title={aberto ? "Esconder as rolagens e os golpes" : "Ver rolagem por rolagem, golpe por golpe"}
            className="tv-anel-foco tv-mono w-full text-left flex items-center rounded-xl"
            style={{ fontSize: TIPOS.maquina, minHeight: ALVOS.piso, gap: LADRILHO.espaco, color: T.inkMeio }}>
            <LadrilhoDoAssunto glifo={doSaldo.glifo || "dado"} />
            <span style={{ color: T.amberSoft }}>{doSaldo.resto}</span>
            <span style={{ opacity: 0.7 }}>{aberto ? "▴ esconder" : `▾ ${dobradas.length} linhas`}</span>
          </button>
          {aberto && (
            <div className="w-full space-y-1" style={{ paddingLeft: LADRILHO.lado + LADRILHO.espaco }}>
              {dobradas.map((t, i) => { const d = assuntoDaLinha(t); return (
                <div key={i} className="tv-mono flex items-center gap-2" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}>
                  {d.glifo ? <Glifo nome={d.glifo} tamanho={14} /> : null}<span>{d.resto}</span>
                </div>
              ); })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- A1 · A DOBRA "O DIA" (#39) ----------------
   O dia que vira traz o reino, a festa, o boato e as rendas — vários,
   um atrás do outro. O Matt abre o dia com uma frase e guarda o resto
   para quem perguntar: a PRIMEIRA notícia fica à vista, e as outras moram
   numa `A dobra` (a de R15, sem eixo novo: `mais 2 notícias`), que fecha
   no mesmo alvo, o último da lista. */
function DobraDoDia({ linhas = [], aoAbrir }) {
  const [aberta, setAberta] = useState(false);
  if (!linhas.length) return null;
  const vistas = aberta ? linhas : linhas.slice(0, 1);
  return (
    <div className="flex flex-col gap-2">
      <BlocoSistema visiveis={vistas} aoAbrir={aoAbrir} />
      {linhas.length > 1 && (
        <div className="tv-coluna">
          <Dobra quantos={linhas.length - 1} singular="notícia" plural="notícias"
            estado={aberta ? "aberta" : "dobrada"} aoAlternar={() => setAberta((v) => !v)} />
        </div>
      )}
    </div>
  );
}

/* ---------------- A1 · A3 · A DOBRA "A LUTA" (`formas.md` §A1 2) ----------------
   A luta inteira numa dobra só, fechada, onde ela FECHOU. O cabeçalho diz
   quem caiu e as rodadas (no telefone, só quem caiu) e leva o recibo da
   luta — a ficha da abertura contra a do fecho, nunca a soma das frases.
   Aberta, a gramática do rastro da batalha (peça 104): uma linha por golpe,
   glifo do assunto a `inkDim` e a conta em mono `TIPOS.maquina` a
   `inkMeio`; `rodada n` é um rótulo de máquina; a fala livre do jogador
   fica na voz dele (Spectral itálico). O relato não herda a mono 10 do
   rastro — a letra volta ao piso. Nenhuma porta nasce lá dentro. */
const ENTRE_GLIFO_E_LINHA = 8;
function LinhaDaLuta({ linha }) {
  const altura = { lineHeight: `${RECIBO.entrelinha}px` };
  if (linha.rotulo) {
    return <div className="tv-mono" style={{ ...altura, fontSize: TIPOS.maquina, color: T.inkDim, letterSpacing: 1, textTransform: "uppercase" }}>{linha.rotulo}</div>;
  }
  if (linha.voz === "jogador") {
    return <div className="tv-body" style={{ ...altura, fontSize: TIPOS.rotulo, fontStyle: "italic", color: T.inkMeio }}>{linha.texto}</div>;
  }
  return (
    <div className="tv-mono flex items-start" style={{ ...altura, gap: ENTRE_GLIFO_E_LINHA, fontSize: TIPOS.maquina, color: T.inkMeio }}>
      <span aria-hidden="true" className="inline-flex items-center shrink-0" style={{ height: RECIBO.entrelinha, width: TIPOS.piso, color: T.inkDim }}>
        {linha.glifo ? <Glifo nome={linha.glifo} tamanho={TIPOS.piso} /> : null}
      </span>
      <span className="min-w-0">{linha.texto}</span>
    </div>
  );
}
function DobraDaLuta({ linhas = [], fimDaLuta = null }) {
  const [aberta, setAberta] = useState(false);
  const mesa = useMesa();
  const f = fimDaLuta || {};
  return (
    <div className="tv-fade tv-coluna">
      <Dobra conteudo="luta" cabecalho={cabecalhoDaLuta(f, { telefone: !mesa })} recibo={Array.isArray(f.recibo) ? f.recibo : null}
        telefone={!mesa} estado={aberta ? "aberta" : "dobrada"} aoAlternar={() => setAberta((v) => !v)}>
        {linhasDaLuta(linhas).map((l, k) => <LinhaDaLuta key={k} linha={l} />)}
      </Dobra>
    </div>
  );
}

/* ---------------- A1 · A2 · O RECIBO DEBAIXO DA PROSA (`formas.md` §A1 1) ----------------
   Dentro do bloco da resposta, a `PAGINA.entreParagrafos` do último
   parágrafo, alinhado à esquerda DA PROSA (o recibo pertence à resposta,
   não ao recuo das linhas da mesa). Chega com a prosa — se o turno o
   calcula depois, aparece no fim do bloco SEM movimento e só cresce para
   baixo. Vazio: 0 px, nem a margem. */
function ReciboDaResposta({ chips }) {
  const mesa = useMesa();
  const lista = Array.isArray(chips) ? chips : [];
  if (!lista.length) return null;
  return (
    <div style={{ marginTop: PAGINA.entreParagrafos }}>
      <Recibo chips={lista} telefone={!mesa} />
    </div>
  );
}

/* ---------------- O RELATO ----------------
   Os componentes moram no módulo, nunca dentro de um render: um componente
   declarado no corpo de outro remonta a cada letra e mata o foco. O `Relato`
   devolve um fragmento — os mesmos filhos que o laço devolvia dentro da área
   que rola —, e por isso o DOM é o de antes, nó por nó. */
export function Relato({ mensagens, carregando = false, voz = null, abertura = null, aoAbrir, aoOuvir }) {
  /* `= []` no destructuring não cobre `null`: trata-se aqui. */
  const lista = Array.isArray(mensagens) ? mensagens : [];
  return (
    <>
      {arrumarORelato(lista, { frasesDosVerbos: FRASES_DOS_VERBOS }).map((item, k) => {
        /* v9.32: as linhas do sistema chegam AGRUPADAS. Uma rodada de
           combate empurrava vinte balões iguais entre a ação do
           jogador e a narração — e a narração, que é o que ele quer
           ler, sumia no meio. Agora o que muda uma decisão continua na
           tela e a contabilidade vira uma linha de saldo, com o
           detalhe a um toque.
           A1: e antes disso cada linha passa pela sua morada — o que o
           recibo diz e o que a tela já disse não chegam aqui; o dia e a
           luta chegam como as suas dobras. */
        if (item.tipo === "bloco") return <BlocoSistema key={`b${item.inicio}`} {...item} aoAbrir={aoAbrir} />;
        if (item.tipo === "dia") return <DobraDoDia key={`d${item.inicio}`} linhas={item.linhas} aoAbrir={aoAbrir} />;
        if (item.tipo === "luta") return <DobraDaLuta key={`l${item.inicio}`} linhas={item.linhas} fimDaLuta={item.fimDaLuta} />;
        const i = item.i, m = item.m;
        if (m.autor === "jogador") {
          /* R3: a fala do jogador FICA na página — um livro também
             regista o que você disse —, mas em itálico, recuada, em
             `inkMeio` e com filete próprio. Nunca tem a cor nem o peso
             da prosa do Mestre. Sai o balão alinhado à direita, que era
             a gramática do Messenger num RPG de texto.

             E o FILETE ÂMBAR enquanto se espera: o `jogo` mediu que,
             durante os 14,3 s com a tela apagada, a frase que o jogador
             acabou de escrever é o ÚNICO sinal de que o turno foi
             enviado. Uma espera muda de catorze segundos é o jogador a
             perguntar se clicou. A saída é o acontecimento, não o
             relógio: chegando a resposta, o filete assenta sozinho.

             O que FALTA, e fica dito em vez de improvisado: `formas.md`
             pede que este filete RESPIRE (pulso lento de 1,6 s, no
             filete e nunca no texto) e que `A voz` tenha um eixo
             `Resposta`. R2 não fabricou nem um nem outro — a peça só
             tem `quem` e `voz`. Pedido ao `desenho`, não inventado
             aqui. */
          const esperaResposta = carregando && i === lista.length - 1;
          return (
            <div key={i} className="tv-fade tv-coluna">
              <Voz quem="voce" voz="muda" />
              <div className="tv-body whitespace-pre-wrap mt-1 pl-4 pr-3 py-2 rounded-r-lg"
                style={{ fontSize: TIPOS.corpo, fontStyle: "italic", color: T.inkMeio, background: T.paginaAlta, borderLeft: `2px solid ${esperaResposta ? T.amber : T.line}` }}>{m.texto}</div>
            </div>
          );
        }
        /* A RESPOSTA DO MESTRE (R2 → V5).

           COMEÇA POR UMA RUNA, e não por `O MESTRE`: a runa ornamental
           do meio da prosa da pessoa (`129:20`) passa a ter um sentido
           só — *começa uma resposta* —, uma por resposta e nunca dentro
           dela (o `jogo`, V5 §4). O BOTÃO DE OUVIR NÃO SAI: fica na ponta
           direita da runa, com o alvo de 48 de R2, e o estado dele
           (preparando, lendo) passa a ser o glifo e o nome do botão.

           A PROSA É PARÁGRAFOS a 16 (`Prosa`, ui.jsx), como o nó, e não
           um bloco com linhas vazias de 27,6. A medida continua a de R2:
           `.tv-coluna` (65ch, centrada, peso 300) — é o único desvio
           grande da composição da pessoa, que corre a prosa a 1 086 px
           (~137 caracteres por linha; a WCAG 1.4.8 pede ≤ 80).

           A ABERTURA DE CERIMÔNIA (a primeira frase na letra de
           `ABERTURA`) só no turno que `abertura` marcou: a chegada a
           um lugar novo e a primeira resposta da sessão. */
        return (
          <div key={i} data-msg={i} className="tv-fade tv-coluna" style={{ scrollMarginTop: ESBATIMENTO.altura }}>
            <DivisoriaRunica respiro={0} ponta={<BotaoDeOuvir estado={voz && voz.i === i ? (voz.status === "gerando" ? "preparando" : "lendo") : "muda"} aoOuvir={() => aoOuvir && aoOuvir(i, m.texto)} />} />
            <Prosa texto={m.texto} abertura={abertura === i ? "cerimonia" : "nenhuma"} />
            {/* A1 · A2: `m.recibo` — o que a ficha mudou neste turno
                (`reciboDoTurno`, que o App calcula no fim do turno, B2) —
                desenha-se por baixo da prosa. */}
            <ReciboDaResposta chips={m.recibo} />
          </div>
        );
      })}
    </>
  );
}
