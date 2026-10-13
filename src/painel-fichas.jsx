/* ============================================================
   AS FICHAS E O CARTÃO (Fase F2 · F2b · F2c) — src/painel-fichas.jsx

   O que o Mestre mostrou, o jogador aponta. A forma é de `mente/formas.md`
   § Fichas e do Figma (`ffWFqD7TueSb88Mkeg9bhW`, página `10 · Fichas`,
   `208:21`; a biblioteca `210:2`). Este arquivo SÓ MONTA A TELA: não decide o
   que está em cena, não escreve no campo, não debita nada, não fala com o
   Narrador, não guarda nada. Quem decide é o motor (`em-cena.js`, e o
   `fichaParaTela` pedido ao `backend`); quem liga é o `App.jsx` (o `oficial`,
   em `O pé da página`, ANTES da `Soleira`, dentro de `calou(...)`).

   ------------------------------------------------------------
   O CONTRATO, prop a prop (para o `backend` e o `oficial` casarem)
   ------------------------------------------------------------
   <FileiraAVista
     itens    = [{ id, tipo, nome, linha, quem, hostil, retrato, frase,
                   sabe[], lembra[], pista, verbos[] }]
                · NA ORDEM DA PROSA (lê-se o rato e acha-se o rato no mesmo
                  sítio da fila); até FICHAS.max (4) — o resto não se desenha.
                · `id`: a chave (o da lista do motor). Sem id ou sem nome, a
                  coisa não vira ficha.
                · `tipo`: "pessoa" | "criatura" | "coisa" | "lugar".
                · `hostil` (criatura): true → a marca leva o anel `danger` e a
                  presa, e a linha vai em `danger` (palavra + forma + cor).
                · `nome`: o que o herói lhe chama («A encapuzada»).
                · `linha`: a segunda linha da ficha — o papel da pessoa; e
                  dos outros «3 · hostis», «◉ 29», «a 2 h, norte». O ◉ vira
                  a moeda da casa.
                · `quem` (opcional): a linha da cabeça do cartão, quando diz
                  mais que a da ficha («mestre de recados · do seu passado»,
                  «na banca do Teodoro · ◉ 29»). Sem ela, vai a `linha`.
                · `retrato` (opcional): a forma de `fichaParaTela`
                  (`fichas.js`) — `{ semente, inimigo, marca }` —, ou a
                  semente (texto), ou o ente (`{ nome, semente, … }`). Com
                  `marca` (ou sem semente), vai a marca: o bicho a pata, a
                  coisa a bolsa, o lugar o alfinete. Gente tem SEMPRE rosto
                  (sem semente, a do nome). `inimigo` (a pessoa armada) veste
                  o anel `danger` e a presa, como o bicho hostil.
                · `frase`: a frase do toque — esta peça não a escreve: quem a
                  põe no campo é o App, em `onToque`.
                · `sabe[]` · `lembra[]`: frases já na voz do mundo, no «você».
                · `pista`: a frase de que HÁ um segredo, nunca o segredo; null.
                · `verbos`: [{ verbo, frase, preco, tom: "gesto"|"semVolta",
                  impedido: string|null }] — `impedido` é a RAZÃO (quanto
                  falta), e vai depois do preço: «◉ 29 · faltam ◉ 6 — a bolsa
                  tem ◉ 23». O atalho é a POSIÇÃO (1–3); o impedido cala o seu.
     escrita  = id | null   · a ficha cuja frase está no campo (contorno rosa
                              + filete + ⌄). O segundo toque nela abre.
     aberta   = id | null   · a ficha cujo cartão está aberto (⌃).
     onToque(ficha)         · 1.º toque (Repouso → Escrita): o App escreve a
                              frase (ou só o nome, se o campo tem texto do
                              jogador) e passa `escrita` a este id. Se outro
                              cartão estava aberto, `onFechar` vem antes.
     onAbrir(ficha)         · 2.º toque, na ficha `escrita`: `aberta` = id.
     onFechar()             · 3.º toque, ×, Esc, toque fora, arrastar a folha:
                              `aberta` = null (a ficha continua `escrita`).
     onVerbo(ficha, verbo)  · um verbo do cartão (nunca o impedido): o App
                              troca a frase pela do verbo, FECHA o cartão
                              (`aberta` = null) e deixa a ficha `escrita`.
                              Nada no cartão age: quem manda é o dado.
     baixa    = altura < FICHAS.baixaAltura   · o cartão toma a página em
                              duas colunas. Sem ela: a Mesa (≥ 768 de largo,
                              `useMesa`) é o popover de 376; o telefone a folha.
     ofertas  = [<Oferta …/>] | null   · § Fichas 1: «Baixa com oferta: fichas
                              e soleira numa LINHA SÓ, rola de lado com O
                              esbatimento». Com ofertas, a fileira desenha-as
                              DEPOIS das fichas (`FICHAS.ordemNaLinha`), na
                              mesma fila que rola, numa região «O que o mundo
                              oferece agora» (a mesma etiqueta da `Soleira`). Sem teto nem
                              `A dobra`: o teto da soleira poupa ALTURA, e
                              numa linha que rola de lado a altura não cresce.
                              Quem liga: na Baixa, com fichas E ofertas, o App
                              passa aqui as `<Oferta>` (as mesmas, com as
                              mesmas props) e NÃO desenha a `<Soleira>`.
   />

   <VereditoDaFicha veredito="as ataduras · ◉ 29 · a bolsa fica com ◉ 64" />
     · a linha por cima do campo (V6), a fonte «a ficha ligada»: QUEM a frase
       aponta e o preço. É a `LinhaDoVeredito` da casa (uma ação, uma forma),
       com a moeda; `veredito` vazio = 0 px. Também aceita `{ quem, preco }`.

   A PÁGINA, para o cartão saber até onde cresce: o App marca o cartão da
   página com `data-tv-pagina` (um atributo, sem estilo). Na Mesa o popover
   cresce até ao topo dela; na Baixa o cartão toma-a inteira (a ficha fica
   por baixo, o campo à vista). Sem a marca, o limite é o ecrã.

   O QUE NÃO SOUBE E DECIDI, o mais simples, anotado:
   · `quem` e `hostil` não estão na lista do pedido (§7), e o Figma pede-os
     (a cabeça diz mais que a ficha; a criatura hostil é variante própria):
     entram como campos opcionais, com recuo para `linha` e `false`;
   · o disco do bicho sem pintura é `retrato/fundo` no Figma, que não existe
     em `T`: vai o `panel` (ver FICHAS em `estilo.js`) — pergunta ao `desenho`;
   · o anel do retrato é o do papel Neutro de § Retratos (`inkDim`), e
     `danger` no bicho hostil; a peça `Retrato` nova ainda não existe em
     código, vai a de hoje (anel de 2 nos dois tamanhos);
   · arrastar a folha fecha a partir de FICHAS.cartao.folha.arrasto (48, um
     alvo) — o número não estava escrito;
   · na Mesa e na Baixa o cartão vive DENTRO da fileira (posição absoluta,
     medida): a ordem do Tab fica a da tela (a ficha, depois o cartão). A
     folha do telefone é mais larga que a página, e o cartão da página corta
     (`overflow-hidden`, App.jsx): ela vai num portal ao `body`, fixa, com
     o fundo no pé da página medido — o campo e o veredito ficam à vista.

   Nenhum componente nasce dentro do render (o foco). O movimento é da folha
   (`.tv-ficha-*`, `.tv-cartao-entra`, `MOVIMENTO_CSS`), com saída no
   reduced-motion. Nada aqui diz «ficha», id, lista ou segredo na tela.
   ============================================================ */
import React from "react";
import { createPortal } from "react-dom";
import { T, ALVOS } from "./constantes.js";
import { TIPOS, FICHAS } from "./estilo.js";
import { Retrato, VerboComPreco, LinhaDoVeredito, TextoComMoeda, useMesa } from "./ui.jsx";
import { sementeDe } from "./semente.js";
import { retratoDe } from "./retratos.js";

/* AS PALAVRAS DA TELA — o que é da tela e não vem do motor (§8: nunca
   id, lista, «em cena», «hostil» como campo, «segredo», «desconhecido»). */
const PALAVRAS = {
  aVista: "À vista",
  /* a etiqueta da `Soleira` (ui.jsx), para a linha só da Baixa dizer o mesmo */
  oferta: "O que o mundo oferece agora",
  sabe: "O que você sabe",
  lembra: "Você lembra",
  fechar: "Fechar",
};

/* O DESENHO DAS MARCAS — a geometria dos nós `210:49` (`Ficha/Marca`) e
   `211:82` (`Cartão/Linha`), copiada do SVG exportado, na grelha de 16 (o 28
   do cartão é a mesma grelha escalada: o traço escala junto, como no nó). A
   cor não mora aqui: vem de T e FICHAS na hora de pintar. */
const DESENHO = {
  bolsa: ["M5.6 2.6H10.4L9.2 4.9C11.7 5.9 13.3 8.2 13.3 10.7C13.3 12.7 11.6 13.5 8 13.5C4.4 13.5 2.7 12.7 2.7 10.7C2.7 8.2 4.3 5.9 6.8 4.9L5.6 2.6Z", "M6.4 4.9H9.6"],
  lugar: ["M8 14.6C8 14.6 12.6 10.3 12.6 6.5C12.6 5.28 12.1154 4.10998 11.2527 3.24731C10.39 2.38464 9.22 1.9 8 1.9C6.78 1.9 5.60998 2.38464 4.74731 3.24731C3.88464 4.10998 3.4 5.28 3.4 6.5C3.4 10.3 8 14.6 8 14.6Z", "M8 8.2C8.93888 8.2 9.7 7.43888 9.7 6.5C9.7 5.56112 8.93888 4.8 8 4.8C7.06112 4.8 6.3 5.56112 6.3 6.5C6.3 7.43888 7.06112 8.2 8 8.2Z"],
  traco: 1.5,
  pata: [
    "M8 13.5C9.87777 13.5 11.4 12.2016 11.4 10.6C11.4 8.99837 9.87777 7.7 8 7.7C6.12223 7.7 4.6 8.99837 4.6 10.6C4.6 12.2016 6.12223 13.5 8 13.5Z",
    "M3.3 8.8C4.0732 8.8 4.7 7.99411 4.7 7C4.7 6.00589 4.0732 5.2 3.3 5.2C2.5268 5.2 1.9 6.00589 1.9 7C1.9 7.99411 2.5268 8.8 3.3 8.8Z",
    "M6 5.9C6.7732 5.9 7.4 5.04934 7.4 4C7.4 2.95066 6.7732 2.1 6 2.1C5.2268 2.1 4.6 2.95066 4.6 4C4.6 5.04934 5.2268 5.9 6 5.9Z",
    "M10 5.9C10.7732 5.9 11.4 5.04934 11.4 4C11.4 2.95066 10.7732 2.1 10 2.1C9.2268 2.1 8.6 2.95066 8.6 4C8.6 5.04934 9.2268 5.9 10 5.9Z",
    "M12.7 8.8C13.4732 8.8 14.1 7.99411 14.1 7C14.1 6.00589 13.4732 5.2 12.7 5.2C11.9268 5.2 11.3 6.00589 11.3 7C11.3 7.99411 11.9268 8.8 12.7 8.8Z",
  ],
  /* a presa do hostil, no pé do disco (a do `Retrato` Inimigo): o nó a 32 e
     o nó a 64, cada um com o seu contorno em `bg` */
  presa: {
    32: { d: "M15.4795 33.3457L12.4482 28.7783L11.8037 27.8076H20.1963L19.5518 28.7783L16.5205 33.3457L16 34.1299L15.4795 33.3457Z", fio: 1.25, alto: 35.2606 },
    64: { d: "M31.167 65.5527L26.8369 59.0283L25.8057 57.4746H38.1943L37.1631 59.0283L32.833 65.5527L32 66.8086L31.167 65.5527Z", fio: 2, alto: 68.617 },
  },
  /* o ⌄ da ficha armada (o ⌃ é o mesmo, virado) e o × do cartão */
  mais: "M4 6.5L8 10.5L12 6.5",
  fechar: "M4 4L12 12M12 4L4 12",
  /* a meia-lua do que há e não se vê bem (o Segredo) */
  meiaLua: { aro: "M6 10.6C8.54051 10.6 10.6 8.54051 10.6 6C10.6 3.45949 8.54051 1.4 6 1.4C3.45949 1.4 1.4 3.45949 1.4 6C1.4 8.54051 3.45949 10.6 6 10.6Z", metade: "M6 1.4C7.22 1.4 8.39002 1.88464 9.25269 2.74731C10.1154 3.60998 10.6 4.78 10.6 6C10.6 7.22 10.1154 8.39002 9.25269 9.25269C8.39002 10.1154 7.22 10.6 6 10.6V1.4Z", fio: 1.3 },
};

const arr = (x) => (Array.isArray(x) ? x.filter((s) => s != null && String(s).trim()) : []);
const hostilDe = (f) => !!(f && f.tipo === "criatura" && f.hostil);
/* o primeiro nome e o resto: o primeiro nunca se corta, o sobrenome cede */
const partesDoNome = (nome) => {
  const s = String(nome || "").trim();
  const i = s.indexOf(" ");
  return i < 0 ? [s, ""] : [s.slice(0, i), s.slice(i + 1)];
};
/* o que o leitor de ecrã ouve: o ◉ diz «moedas», o «·» é pausa */
const falado = (s) => String(s || "").replace(/\u25C9[ \u00A0]?(\S+)/g, "$1 moedas").replace(/\s*·\s*/g, ", ");
/* o rosto: a semente (texto), o ente, ou { semente, ente }; gente sem retrato
   tem rosto pelo nome */
function rostoDe(f) {
  const r = f.retrato;
  const doNome = f.tipo === "pessoa" ? { semente: f.nome, ente: null } : null;
  if (r == null || r === false) return doNome;
  if (typeof r === "string") return r ? { semente: r, ente: null } : doNome;
  if (typeof r === "object") {
    /* o motor pediu a marca (a coisa, o lugar, o bicho sem pintura) */
    if (r.marca && f.tipo !== "pessoa") return null;
    const ente = r.ente && r.ente.nome ? r.ente : r.nome ? r : null;
    const semente = r.semente || (ente ? sementeDe(ente) : null);
    return semente ? { semente, ente } : doNome;
  }
  return doNome;
}
/* Retratos §12, item 6 · a fera que tem pintura: o motor manda a marca (a
   pata) a toda criatura, porque não sabe de arquivos; a tela pergunta à
   tabela dos retratos pelo nome. Com pintura, o `Retrato` no recorte de
   cartão (cabeça e pescoço — a 32 o recorte do olhar cortava o focinho);
   sem ela, a pata, que é o recurso de quem não tem. */
function feraPintada(f) {
  if (!f || f.tipo !== "criatura") return null;
  try {
    const ente = { nome: String(f.nome || "") };
    return retratoDe(ente, null) ? ente : null;
  } catch (e) { return null; }
}
/* quem vem para cima de você: o bicho hostil, ou quem o motor diz inimigo
   (a pessoa armada) — o anel `danger` e a presa */
const inimigoDe = (f) => hostilDe(f) || !!(f && f.retrato && typeof f.retrato === "object" && f.retrato.inimigo);
/* a cor da segunda linha (§3): a pessoa em prosa `inkMeio`; os outros em
   mono — o hostil `danger`, o preço `amberSoft`, o resto `inkMeio` */
const corDaLinha = (f) => (hostilDe(f) ? FICHAS.hostil : f.tipo === "coisa" ? FICHAS.preco : T.inkMeio);

/* o alvo de uma tecla é de escrever (o campo do turno)? então a tecla é dele */
const deEscrever = (el) => !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName || ""));
const reduzMovimento = () => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };

/* ============================================================
   AS PEÇAS (biblioteca `210:2`) — todas fora do render
   ============================================================ */

/* a presa no pé do disco: aria-hidden, transborda para baixo como no nó */
function Presa({ lado }) {
  const P = DESENHO.presa[lado] || DESENHO.presa[32];
  return (
    <svg width={lado} height={P.alto} viewBox={`0 0 ${lado} ${P.alto}`} aria-hidden="true" focusable="false"
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <path d={P.d} fill={FICHAS.hostil} stroke={T.bg} strokeWidth={P.fio} />
    </svg>
  );
}

/* um glifo de traço da grelha 16 (a bolsa, o alfinete) */
function GlifoDaMarca({ forma, tamanho }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      {DESENHO[forma].map((d, i) => (
        <path key={i} d={d} stroke={T.inkMeio} strokeWidth={DESENHO.traco} strokeLinejoin="round" strokeLinecap="round" />
      ))}
    </svg>
  );
}

/* `Ficha/Marca` (`210:49`) e o retrato: a marca da ficha (32) e da cabeça do
   cartão (64). Gente e bicho pintado: o `Retrato`. A coisa e o lugar: o
   ladrilho `panel` com fio `line`. O bicho sem pintura: a pata num disco,
   hostil = anel `danger` + presa. Sempre aria-hidden: o nome diz. */
export function MarcaDaFicha({ ficha, lado = FICHAS.marca }) {
  const L = FICHAS.ladrilho;
  const grande = lado > FICHAS.marca ? 64 : 32;
  const hostil = inimigoDe(ficha);
  const rosto = rostoDe(ficha);
  const caixa = { position: "relative", width: lado, height: lado, flexShrink: 0 };
  const fera = feraPintada(ficha);
  if (fera) {
    return (
      <span aria-hidden="true" style={caixa}>
        <Retrato semente={fera.nome} ente={fera} semCarta tamanho={lado} recorte="cartao" anel={hostil ? FICHAS.hostil : T.inkDim} />
        {hostil ? <Presa lado={grande} /> : null}
      </span>
    );
  }
  if (rosto && (ficha.tipo === "pessoa" || ficha.tipo === "criatura")) {
    return (
      <span aria-hidden="true" style={caixa}>
        <Retrato semente={rosto.semente} ente={rosto.ente} semCarta tamanho={lado} anel={hostil ? FICHAS.hostil : T.inkDim} />
        {hostil ? <Presa lado={grande} /> : null}
      </span>
    );
  }
  if (ficha.tipo === "criatura") {
    return (
      <span aria-hidden="true" className="flex items-center justify-center" style={{ ...caixa, borderRadius: "50%", background: FICHAS.marcaFundo, border: `${L.anel[grande]}px solid ${hostil ? FICHAS.hostil : T.inkDim}` }}>
        <svg width={L.glifo[grande]} height={L.glifo[grande]} viewBox="0 0 16 16" aria-hidden="true" focusable="false" style={{ display: "block" }}>
          {DESENHO.pata.map((d, i) => <path key={i} d={d} fill={T.inkMeio} />)}
        </svg>
        {hostil ? <span style={{ position: "absolute", left: -L.anel[grande], top: -L.anel[grande] }}><Presa lado={grande} /></span> : null}
      </span>
    );
  }
  return (
    <span aria-hidden="true" className="flex items-center justify-center" style={{ ...caixa, borderRadius: L.raio[grande], background: FICHAS.marcaFundo, border: `1px solid ${T.line}` }}>
      <GlifoDaMarca forma={ficha.tipo === "lugar" ? "lugar" : "bolsa"} tamanho={L.glifo[grande]} />
    </span>
  );
}

/* o ⌄ (Escrita: toque de novo abre) e o ⌃ (Aberta: toque de novo fecha) */
function Mais({ aberta }) {
  return (
    <svg width={FICHAS.ficha.mais} height={FICHAS.ficha.mais} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"
      style={{ display: "block", flexShrink: 0, transform: aberta ? "rotate(180deg)" : undefined }}>
      <path d={DESENHO.mais} stroke={T.inkMeio} strokeWidth={DESENHO.traco} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* `Ficha` (`210:244`): É BOTÃO. Repouso: o erguido com o fio de controlo.
   Escrita / Aberta: a gramática de `A escolha` com a cor da mão — contorno
   rosa + o filete de 3 em baixo — e o ⌄ / ⌃. Foco: o anel da casa. Alto 48,
   largo ≤ 240: o sobrenome cede, o primeiro nome nunca. */
export const Ficha = React.forwardRef(function Ficha({ ficha, estado = "repouso", onToque, tabIndex, ordem = 0, aoTeclar, idDoCartao }, ref) {
  const F = FICHAS.ficha;
  const marcada = estado === "escrita" || estado === "aberta";
  const [primeiro, resto] = partesDoNome(ficha.nome);
  const pessoa = ficha.tipo === "pessoa";
  const rotulo = [ficha.nome, falado(ficha.linha)].filter(Boolean).join(", ");
  return (
    <button ref={ref} type="button" tabIndex={tabIndex} onClick={onToque} onKeyDown={aoTeclar}
      aria-label={rotulo} aria-haspopup="dialog" aria-expanded={estado === "aberta"}
      aria-controls={estado === "aberta" ? idDoCartao : undefined}
      className="tv-anel-foco tv-ficha-entra relative flex items-center text-left shrink-0"
      style={{
        "--tv-ordem": ordem,
        height: FICHAS.altura, maxWidth: FICHAS.larguraMax, padding: `0 ${marcada ? F.direitaArmada : F.direita}px 0 ${F.esquerda}px`, gap: F.entre,
        borderRadius: FICHAS.raio, border: `1px solid ${marcada ? FICHAS.escrita : FICHAS.fio}`,
        background: FICHAS.fundo, overflow: "hidden", cursor: "pointer",
        WebkitTouchCallout: "none",
      }}>
      <MarcaDaFicha ficha={ficha} />
      <span className="flex flex-col min-w-0" style={{ lineHeight: "normal" }}>
        <span className="tv-body flex min-w-0" style={{ fontSize: FICHAS.letra.nome, lineHeight: `${FICHAS.letra.nomeAltura}px`, fontWeight: 500, color: T.ink }}>
          <span className="shrink-0 whitespace-nowrap">{primeiro}</span>
          {resto ? <span className="truncate min-w-0">{" " + resto}</span> : null}
        </span>
        {ficha.linha ? (
          <span className={`${pessoa ? "tv-body" : "tv-mono"} truncate`}
            style={{ fontSize: pessoa ? TIPOS.rotulo : TIPOS.maquina, lineHeight: `${FICHAS.letra.linhaAltura}px`, color: corDaLinha(ficha) }}>
            <TextoComMoeda texto={ficha.linha} />
          </span>
        ) : null}
      </span>
      {marcada ? <Mais aberta={estado === "aberta"} /> : null}
      {marcada ? <span aria-hidden="true" className="absolute" style={{ left: -1, right: -1, bottom: -1, height: F.filete, background: FICHAS.escrita }} /> : null}
    </button>
  );
});

/* `Cartão/Rótulo` (`211:66`): mono 12 `inkDim`, maiúsculas por ESTILO — o
   texto guarda-se em caixa normal, para o leitor de ecrã não soletrar */
function Rotulo({ children }) {
  return (
    <p className="tv-mono uppercase" style={{ fontSize: TIPOS.maquina, lineHeight: `${FICHAS.letra.rotuloAltura}px`, letterSpacing: `${FICHAS.letra.rastreioDoRotulo}em`, color: T.inkDim, margin: 0 }}>
      {children}
    </p>
  );
}

/* `Cartão/Linha` (`211:82`): Sabe (o ponto), Lembra (o anel oco), Segredo
   (a meia-lua, o itálico `inkMeio` e o fio tracejado à esquerda — está lá e
   não se vê bem). Spectral 15/22. */
function Linha({ tom = "sabe", texto }) {
  const L = FICHAS.cartao.linha;
  const segredo = tom === "segredo";
  const meio = L.marca / 2;
  return (
    <li className="flex items-start" style={{
      gap: L.entre, listStyle: "none",
      borderLeft: segredo ? `${L.fioDoSegredo}px dashed ${T.lineStrong}` : undefined,
      paddingLeft: segredo ? L.recuoDoSegredo : undefined,
    }}>
      <span aria-hidden="true" className="flex items-center justify-center shrink-0" style={{ width: L.marca, height: FICHAS.letra.linhaDoCartao }}>
        {segredo ? (
          <svg width={L.meiaLua} height={L.meiaLua} viewBox="0 0 12 12" fill="none" focusable="false" style={{ display: "block" }}>
            <path d={DESENHO.meiaLua.aro} stroke={T.inkMeio} strokeWidth={DESENHO.meiaLua.fio} />
            <path d={DESENHO.meiaLua.metade} fill={T.inkMeio} />
          </svg>
        ) : (
          <svg width={L.marca} height={FICHAS.letra.linhaDoCartao} viewBox={`0 0 ${L.marca} ${FICHAS.letra.linhaDoCartao}`} fill="none" focusable="false" style={{ display: "block" }}>
            {tom === "lembra"
              ? <circle cx={meio} cy={FICHAS.letra.linhaDoCartao / 2} r={L.anel} stroke={T.inkDim} strokeWidth={L.fioDoAnel} />
              : <circle cx={meio} cy={FICHAS.letra.linhaDoCartao / 2} r={L.ponto} fill={T.inkDim} />}
          </svg>
        )}
      </span>
      <span className="tv-body flex-1 min-w-0" style={{ fontSize: TIPOS.corpo, lineHeight: `${FICHAS.letra.linhaDoCartao}px`, color: segredo ? T.inkMeio : T.ink, fontStyle: segredo ? "italic" : undefined, overflowWrap: "anywhere" }}>
        <TextoComMoeda texto={texto} />
      </span>
    </li>
  );
}

/* o bloco do que se sabe: um rótulo e as suas linhas */
function Bloco({ rotulo, children }) {
  return (
    <div className="flex flex-col" style={{ gap: FICHAS.cartao.entreLinhas }}>
      <Rotulo>{rotulo}</Rotulo>
      <ul className="flex flex-col" style={{ gap: FICHAS.cartao.entreLinhas, margin: 0, padding: 0 }}>{children}</ul>
    </div>
  );
}

/* a região que rola por dentro (o que se sabe; a fileira no telefone): põe o
   esbatimento só quando há mesmo mais para ver */
function useHaMais(el, eixo, dep) {
  const [ha, setHa] = React.useState(false);
  React.useLayoutEffect(() => {
    if (!el) return undefined;
    const medir = () => {
      try {
        const mais = eixo === "x"
          ? el.scrollLeft + el.clientWidth < el.scrollWidth - 1
          : el.scrollTop + el.clientHeight < el.scrollHeight - 1;
        setHa(mais);
      } catch (e) { /* fica o de antes */ }
    };
    medir();
    el.addEventListener("scroll", medir, { passive: true });
    let obs = null;
    try { obs = typeof ResizeObserver !== "undefined" ? new ResizeObserver(medir) : null; if (obs) obs.observe(el); } catch (e) { obs = null; }
    return () => { el.removeEventListener("scroll", medir); if (obs) obs.disconnect(); };
  }, [el, eixo, dep]);
  return ha;
}

/* `Cartão/Cabeça` (`211:83`): a marca a 64, o nome em Cormorant 22/26, quem é
   em Spectral 13 (`danger` no bicho hostil), e o × de 48 */
function Cabeca({ ficha, idDoNome, aoFechar }) {
  const C = FICHAS.cartao.cabeca;
  const quem = ficha.quem || ficha.linha;
  return (
    <div className="flex items-center shrink-0" style={{ gap: C.entre }}>
      <MarcaDaFicha ficha={ficha} lado={FICHAS.cartao.marca} />
      <div className="flex flex-col flex-1 min-w-0" style={{ gap: C.palavras }}>
        <h2 id={idDoNome} className="tv-display" style={{ fontSize: FICHAS.letra.nomeDoCartao, lineHeight: `${FICHAS.letra.nomeDoCartaoAltura}px`, fontWeight: 500, color: T.ink, margin: 0, overflowWrap: "anywhere" }}>
          {ficha.nome}
        </h2>
        {quem ? (
          <p className="tv-body" style={{ fontSize: TIPOS.rotulo, lineHeight: `${FICHAS.letra.quemAltura}px`, color: hostilDe(ficha) ? FICHAS.hostil : T.inkMeio, margin: 0 }}>
            <TextoComMoeda texto={quem} />
          </p>
        ) : null}
      </div>
      <button type="button" onClick={aoFechar} aria-label={PALAVRAS.fechar}
        className="tv-anel-foco flex items-center justify-center shrink-0"
        style={{ width: C.fechar, height: C.fechar, borderRadius: C.raioDoFechar, background: "transparent", border: "none", cursor: "pointer" }}>
        <svg width={C.glifo} height={C.glifo} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false" style={{ display: "block" }}>
          <path d={DESENHO.fechar} stroke={T.inkDim} strokeWidth={DESENHO.traco} strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/* o que se sabe: O que você sabe (+ a pista) · Você lembra. Rola por dentro,
   com o esbatimento em baixo quando continua. */
function OQueSeSabe({ ficha }) {
  const [el, setEl] = React.useState(null);
  const sabe = arr(ficha.sabe), lembra = arr(ficha.lembra);
  const pista = ficha.pista ? String(ficha.pista) : "";
  const haMais = useHaMais(el, "y", ficha.id);
  if (!sabe.length && !pista && !lembra.length) return null;
  return (
    <div ref={setEl} className={`flex flex-col min-h-0 overflow-y-auto ${haMais ? "tv-esbate-baixo" : ""}`}
      style={{ gap: FICHAS.cartao.entreBlocos, flex: "1 1 auto" }}>
      {sabe.length || pista ? (
        <Bloco rotulo={PALAVRAS.sabe}>
          {sabe.map((s, i) => <Linha key={"s" + i} tom="sabe" texto={s} />)}
          {pista ? <Linha tom="segredo" texto={pista} /> : null}
        </Bloco>
      ) : null}
      {lembra.length ? (
        <Bloco rotulo={PALAVRAS.lembra}>
          {lembra.map((s, i) => <Linha key={"l" + i} tom="lembra" texto={s} />)}
        </Bloco>
      ) : null}
    </div>
  );
}

/* os verbos: o atalho é a POSIÇÃO (1–3), e o impedido cala o seu */
function Verbos({ ficha, aoVerbo, style }) {
  const verbos = (Array.isArray(ficha.verbos) ? ficha.verbos : []).filter((v) => v && v.verbo);
  if (!verbos.length) return null;
  return (
    <div className="flex flex-col shrink-0" style={{ gap: FICHAS.cartao.entreVerbos, ...style }}>
      {verbos.map((v, i) => (
        <VerboComPreco key={v.verbo + i} verbo={v.verbo} preco={v.preco} impedido={v.impedido || null}
          papel={v.tom === "semVolta" ? "semVolta" : "gesto"} atalho={i < 3 ? i + 1 : undefined}
          aoTocar={() => aoVerbo(v)} className="w-full" />
      ))}
    </div>
  );
}

/* a pega da folha: decorativa; arrastar para baixo um alvo também fecha */
function Pega({ aoFechar }) {
  const P = FICHAS.cartao.folha.pega;
  const inicio = React.useRef(null);
  const descer = (e) => { inicio.current = e.clientY; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (erro) { /* sem captura, segue */ } };
  const mover = (e) => {
    if (inicio.current == null) return;
    if (e.clientY - inicio.current >= FICHAS.cartao.folha.arrasto) { inicio.current = null; try { aoFechar(); } catch (erro) { /* nunca pode custar o turno */ } }
  };
  const largar = () => { inicio.current = null; };
  return (
    <div aria-hidden="true" onPointerDown={descer} onPointerMove={mover} onPointerUp={largar} onPointerCancel={largar}
      className="flex items-center justify-center shrink-0"
      style={{ height: P.cima + P.faixa, margin: `-${FICHAS.cartao.enchimento}px -${FICHAS.cartao.enchimento}px 0`, paddingTop: P.cima + (P.faixa - P.altura) / 2, alignItems: "flex-start", touchAction: "none", cursor: "grab" }}>
      <span style={{ display: "block", width: P.largura, height: P.altura, borderRadius: P.altura, background: T.lineStrong }} />
    </div>
  );
}

/* `O cartão` (§5) — não é componente do Figma: é a composição das peças, em
   três formatos. É `role="dialog"` NÃO-modal (o campo continua vivo), com o
   nome no `aria-labelledby`. NADA NO CARTÃO AGE: o verbo escreve a frase dele
   no campo (pelo App) e fecha. */
export function CartaoDaFicha({ ficha, formato = "mesa", style, onFechar, onVerbo, id }) {
  const nome = React.useId().replace(/:/g, "") + "-nome";
  const caixa = React.useRef(null);
  /* AO ABRIR, o foco entra no cartão (APG, Dialog não-modal) */
  React.useEffect(() => {
    try { if (caixa.current) caixa.current.focus({ preventScroll: true }); } catch (e) { /* segue */ }
  }, [ficha && ficha.id]);
  const C = FICHAS.cartao;
  const fechar = () => { try { if (onFechar) onFechar(); } catch (e) { /* nunca pode custar o turno */ } };
  const verbo = (v) => { try { if (onVerbo) onVerbo(ficha, v); } catch (e) { /* idem */ } };
  const baixa = formato === "baixa", telefone = formato === "telefone";
  const moldura = {
    position: "absolute", zIndex: 30, display: "flex", flexDirection: baixa ? "row" : "column",
    gap: baixa ? C.entreColunas : C.entre, padding: C.enchimento,
    background: C.fundo, borderStyle: "solid", borderColor: FICHAS.fio, borderWidth: telefone ? "1px 1px 0 1px" : 1, boxShadow: FICHAS.sombra,
    borderRadius: telefone ? `${C.folha.raio}px ${C.folha.raio}px 0 0` : C.raio,
    overflow: "hidden", ...style,
  };
  return (
    <div ref={caixa} id={id} role="dialog" aria-labelledby={nome} tabIndex={-1} className="tv-cartao-entra" style={moldura}>
      {baixa ? (
        <>
          <div className="flex flex-col flex-1 min-w-0 min-h-0" style={{ gap: C.entre }}>
            <Cabeca ficha={ficha} idDoNome={nome} aoFechar={fechar} />
            <div aria-hidden="true" className="shrink-0" style={{ height: 1, background: T.line }} />
            <OQueSeSabe ficha={ficha} />
          </div>
          <div className="flex flex-col justify-end min-h-0 shrink-0" style={{ width: C.colunaVerbos, maxWidth: "48%" }}>
            <Verbos ficha={ficha} aoVerbo={verbo} />
          </div>
        </>
      ) : (
        <>
          {telefone ? <Pega aoFechar={fechar} /> : null}
          <Cabeca ficha={ficha} idDoNome={nome} aoFechar={fechar} />
          <div aria-hidden="true" className="shrink-0" style={{ height: 1, background: T.line }} />
          <OQueSeSabe ficha={ficha} />
          <Verbos ficha={ficha} aoVerbo={verbo} />
        </>
      )}
    </div>
  );
}

/* ============================================================
   ONDE O CARTÃO POUSA — medido, nos três formatos (§5)
   ============================================================ */
function posicaoDoCartao(formato, raiz, ficha) {
  const R = raiz.getBoundingClientRect();
  const pagina = raiz.closest ? raiz.closest("[data-tv-pagina]") : null;
  const P = pagina ? pagina.getBoundingClientRect() : null;
  const vh = window.innerHeight, vw = document.documentElement.clientWidth || window.innerWidth;
  const C = FICHAS.cartao;
  if (formato === "baixa") {
    if (P) return { left: P.left - R.left, top: P.top - R.top, width: P.width, height: P.height };
    return { left: 0, right: 0, bottom: 0, maxHeight: Math.max(ALVOS.piso, R.bottom - FICHAS.vao) };
  }
  if (formato === "telefone") {
    const fundo = R.bottom + FICHAS.pe.baixo;
    return { position: "fixed", left: 0, width: vw, bottom: vh - fundo, maxHeight: Math.max(ALVOS.piso, Math.min(C.folhaMax * vh, fundo - (P ? P.top : 0))) };
  }
  /* a Mesa: 376, por cima da ficha (8 acima), alinhado à esquerda dela e
     preso à borda da fileira (que é a borda da página por dentro) */
  const largura = Math.min(C.largura, R.width);
  const F = ficha ? ficha.getBoundingClientRect() : R;
  const left = Math.max(0, Math.min(F.left - R.left, R.width - largura));
  const teto = (P ? P.top : 0) + FICHAS.vao;
  return { left, width: largura, bottom: R.height + FICHAS.vao, maxHeight: Math.max(ALVOS.piso, R.top - FICHAS.vao - teto) };
}

function usePosicao(raiz, ficha, formato, aberta) {
  const [pos, setPos] = React.useState(null);
  React.useLayoutEffect(() => {
    if (!aberta || !raiz) { setPos(null); return undefined; }
    const calcular = () => { try { setPos(posicaoDoCartao(formato, raiz, ficha)); } catch (e) { /* fica a de antes */ } };
    /* a janela que muda de tamanho mede no quadro SEGUINTE: no próprio
       evento o leiaute ainda é o de antes (medido: a folha pousava 37 px à
       esquerda depois de passar da Mesa ao telefone) */
    let quadro = 0;
    const medir = () => { cancelAnimationFrame(quadro); quadro = requestAnimationFrame(calcular); };
    calcular();
    let obs = null;
    try { obs = typeof ResizeObserver !== "undefined" ? new ResizeObserver(medir) : null; if (obs) obs.observe(raiz); } catch (e) { obs = null; }
    window.addEventListener("resize", medir);
    window.addEventListener("scroll", medir, true);
    return () => { cancelAnimationFrame(quadro); if (obs) obs.disconnect(); window.removeEventListener("resize", medir); window.removeEventListener("scroll", medir, true); };
  }, [raiz, ficha, formato, aberta]);
  return pos;
}

/* ============================================================
   A FILEIRA — `role="group"` «À vista», roving tabindex, os toques
   ============================================================ */
export function FileiraAVista({ itens = [], escrita = null, aberta = null, onToque, onAbrir, onFechar, onVerbo, baixa = false, ofertas = null }) {
  /* `= []` não cobre null (a lei da casa) */
  const lista = (Array.isArray(itens) ? itens : []).filter((f) => f && f.id != null && f.nome).slice(0, FICHAS.max);
  const chave = lista.map((f) => String(f.id)).join("|");
  const mesa = useMesa();
  const formato = baixa ? "baixa" : mesa ? "mesa" : "telefone";

  /* A TROCA NO LUGAR: a fileira que sai apaga em 120 e só então a seguinte
     entra (160, em escalonado). Com reduced-motion, troca seca. */
  const anterior = React.useRef({ chave, lista });
  const relogio = React.useRef(null);
  const [velha, setVelha] = React.useState(null);
  React.useLayoutEffect(() => {
    const ant = anterior.current;
    anterior.current = { chave, lista };
    if (ant.chave === chave || !ant.lista.length || reduzMovimento()) return;
    setVelha(ant);
    clearTimeout(relogio.current);
    relogio.current = setTimeout(() => setVelha(null), FICHAS.movimento.sai);
  });
  React.useEffect(() => () => clearTimeout(relogio.current), []);

  const [raiz, setRaiz] = React.useState(null);
  const [fila, setFila] = React.useState(null);
  const refs = React.useRef({});
  const idDoCartao = "tv-cartao-" + React.useId().replace(/:/g, "");
  const haMais = useHaMais(fila, "x", chave);

  /* o roving tabindex: uma paragem só na fileira — a escrita, ou a primeira */
  const [paragem, setParagem] = React.useState(null);
  const idParado = lista.some((f) => f.id === paragem) ? paragem : lista.some((f) => f.id === escrita) ? escrita : lista.length ? lista[0].id : null;

  const fichaAberta = lista.find((f) => f.id === aberta) || null;
  const pos = usePosicao(raiz, fichaAberta ? refs.current[fichaAberta.id] : null, formato, !!fichaAberta);

  const focar = (id) => { try { const el = refs.current[id]; if (el) el.focus({ preventScroll: true }); } catch (e) { /* sem foco, segue */ } };
  const chamar = (f, ...a) => { try { if (f) f(...a); } catch (e) { /* nunca pode custar o turno */ } };

  /* os toques: 1.º escreve, 2.º (na escrita) abre, 3.º (na aberta) fecha */
  const tocar = (f) => {
    setParagem(f.id);
    if (f.id === aberta) return chamar(onFechar);
    if (f.id === escrita) return chamar(onAbrir, f);
    if (aberta != null) chamar(onFechar);
    return chamar(onToque, f);
  };
  const teclar = (i) => (e) => {
    const vai = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: lista.length - 1 }[e.key];
    if (vai == null) return;
    e.preventDefault();
    const j = Math.max(0, Math.min(lista.length - 1, vai));
    setParagem(lista[j].id);
    focar(lista[j].id);
  };

  /* AS TECLAS DO CARTÃO e O TOQUE FORA — só com o cartão aberto. Esc fecha e
     devolve o foco à ficha (se o foco estava na fileira ou no cartão); 1–3
     escrevem o verbo da posição, nunca quando a tecla é do campo. */
  const atual = React.useRef(null);
  atual.current = { fichaAberta, onFechar, onVerbo, raiz, idDoCartao };
  React.useEffect(() => {
    if (!fichaAberta || typeof window === "undefined") return undefined;
    const aoTeclar = (e) => {
      try {
        const a = atual.current;
        if (!a.fichaAberta || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === "Escape") {
          e.preventDefault();
          const cartao = document.getElementById(a.idDoCartao);
          const dentro = (a.raiz && a.raiz.contains(document.activeElement)) || (cartao && cartao.contains(document.activeElement));
          chamar(a.onFechar);
          if (dentro) focar(a.fichaAberta.id);
          return;
        }
        if (deEscrever(e.target) || !/^[1-3]$/.test(e.key)) return;
        const verbos = (Array.isArray(a.fichaAberta.verbos) ? a.fichaAberta.verbos : []).filter((v) => v && v.verbo);
        const v = verbos[Number(e.key) - 1];
        if (!v || v.impedido) return;
        e.preventDefault();
        focar(a.fichaAberta.id);
        chamar(a.onVerbo, a.fichaAberta, v);
      } catch (erro) { /* nunca pode custar o turno */ }
    };
    const aoTocarFora = (e) => {
      try {
        const a = atual.current;
        const cartao = document.getElementById(a.idDoCartao);
        if (a.fichaAberta && a.raiz && !a.raiz.contains(e.target) && !(cartao && cartao.contains(e.target))) chamar(a.onFechar);
      } catch (erro) { /* idem */ }
    };
    window.addEventListener("keydown", aoTeclar);
    document.addEventListener("pointerdown", aoTocarFora, true);
    return () => { window.removeEventListener("keydown", aoTeclar); document.removeEventListener("pointerdown", aoTocarFora, true); };
  }, [fichaAberta && fichaAberta.id]);

  const mostra = velha ? velha.lista : lista;
  if (!mostra.length) return null;
  const estadoDe = (f) => (f.id === aberta ? "aberta" : f.id === escrita ? "escrita" : "repouso");
  /* o anel de foco (4 px por fora) não pode ser cortado pela fila que rola:
     a fila ganha 4 de enchimento e devolve-os em margem */
  const folgaDoAnel = 4;
  const fichas = mostra.map((f, i) => (
    <Ficha key={f.id} ref={(el) => { refs.current[f.id] = el; }} ficha={f} ordem={i}
      estado={velha ? "repouso" : estadoDe(f)} idDoCartao={idDoCartao}
      tabIndex={!velha && f.id === idParado ? 0 : -1}
      onToque={velha ? undefined : () => tocar(f)} aoTeclar={velha ? undefined : teclar(i)} />
  ));
  /* a linha só da Baixa com oferta (§1): a fila que rola leva as duas
     regiões, NA ORDEM DA TABELA (`FICHAS.ordemNaLinha`: as fichas
     primeiro, desde a 10.ª sessão — o porquê, com o número, mora lá); sem
     ofertas, a fila É o grupo, como antes */
  const daOferta = (Array.isArray(ofertas) ? ofertas : []).filter(Boolean);
  const linhaSo = daOferta.length > 0;
  const regiaoDaOferta = linhaSo ? (
    <div key="oferta" role="region" aria-label={PALAVRAS.oferta} className="flex shrink-0 items-stretch" style={{ gap: FICHAS.vao }}>
      {daOferta.map((o, i) => <div key={(o && o.key) || "oferta-" + i} className="shrink-0 flex items-center">{o}</div>)}
    </div>
  ) : null;
  const grupoAVista = linhaSo ? <div key="fichas" role="group" aria-label={PALAVRAS.aVista} className="flex shrink-0" style={{ gap: FICHAS.vao }}>{fichas}</div> : null;
  const regioes = { fichas: grupoAVista, oferta: regiaoDaOferta };
  return (
    <div ref={setRaiz} className="relative w-full">
      <div ref={setFila} role={linhaSo ? undefined : "group"} aria-label={linhaSo ? undefined : PALAVRAS.aVista}
        key={velha ? "sai:" + velha.chave : chave}
        className={`flex overflow-x-auto ${velha ? "tv-ficha-sai" : ""} ${haMais ? "tv-esbate-fim" : ""}`}
        style={{ gap: FICHAS.vao, padding: folgaDoAnel, margin: -folgaDoAnel, scrollbarWidth: "none" }}>
        {linhaSo ? FICHAS.ordemNaLinha.map((qual) => regioes[qual]) : fichas}
      </div>
      {fichaAberta && pos && !velha ? (() => {
        const cartao = (
          <CartaoDaFicha id={idDoCartao} ficha={fichaAberta} formato={formato} style={pos}
            onFechar={() => { chamar(onFechar); focar(fichaAberta.id); }}
            onVerbo={(f, v) => { focar(f.id); chamar(onVerbo, f, v); }} />
        );
        return formato === "telefone" && typeof document !== "undefined" ? createPortal(cartao, document.body) : cartao;
      })() : null}
    </div>
  );
}

/* ============================================================
   O NOME NO CURSOR — a menção que se encadeia (§2, «insere só o nome»)

   O defeito (vivo, v9.442): tocar fichas seguidas com texto do jogador no
   campo colava os nomes por espaço — «Procuro Freya Ondine Isen o
   Silencioso», três pessoas lidas como um nome só, pelo jogador e pelo
   Narrador. DECIDIDO (`aprendiz`, 12/10), o mais simples que lê como
   português: o nome que entra LOGO A SEGUIR a outro nome tocado nesta mesma
   vez junta-se por « e », e o « e » de antes vira «, » —
   «Procuro Freya e Ondine» → «Procuro Freya, Ondine e Isen o Silencioso».
   Nome que entra noutro sítio (depois de um verbo, no meio da frase) entra
   como sempre, por espaço. Não se recusa o segundo nome: o toque nunca
   falha, e a lista é o que o jogador quis apontar.

   Pura e sem nada de fora (a suíte tira-a deste arquivo e corre-a em Node):
     atual   — o texto do campo · pos — o cursor (null = o fim)
     nome    — o nome a pôr, já na forma do meio da frase (com artigo)
     postos  — os nomes JÁ postos por toque nesta vez (a frase do 1.º toque
               conta: o nome da ficha dela), na mesma forma
   Devolve { texto, cursor } — o cursor logo depois do nome posto.
   QUEM LIGA (`oficial`, App.jsx `tocarFicha`): troca a linha que monta
   `texto` por esta função, e guarda `nomes` no registo do toque (como já
   guarda `ids`).
   ============================================================ */
export function juntarNomeNoCampo(atual, pos, nome, postos) {
  const txt = String(atual == null ? "" : atual);
  const n = String(nome == null ? "" : nome).trim();
  const p = typeof pos === "number" && pos >= 0 ? Math.min(pos, txt.length) : txt.length;
  if (!n) return { texto: txt, cursor: p };
  const antes = txt.slice(0, p), depois = txt.slice(p);
  const ja = (Array.isArray(postos) ? postos : []).map((x) => String(x == null ? "" : x).trim()).filter(Boolean);
  const seco = antes.replace(/\s+$/, "");
  const acabaEm = (fim) => seco === fim || seco.endsWith(" " + fim);
  const anterior = ja.filter(acabaEm).sort((a, b) => b.length - a.length)[0];
  let cabeca;
  if (anterior) {
    const resto = seco.slice(0, seco.length - anterior.length);
    /* «… Freya e » + «Ondine»: o « e » que ligava dois nomes postos vira «, » */
    const doE = ja.filter((x) => resto.endsWith(" " + x + " e ") || resto === x + " e ").sort((a, b) => b.length - a.length)[0];
    const base = doE ? resto.slice(0, resto.length - 3) + ", " : resto;
    cabeca = base + anterior + " e " + n;
  } else {
    cabeca = antes + (antes && !/\s$/.test(antes) ? " " : "") + n;
  }
  const texto = cabeca + (depois && !/^\s/.test(depois) ? " " : "") + depois;
  return { texto, cursor: cabeca.length };
}

/* ============================================================
   A LINHA DO VEREDITO da ficha ligada (V6): QUEM a frase aponta e o preço,
   por cima do campo. É a `LinhaDoVeredito` da casa, armada (âmbar que se
   lê), com a moeda. Sem veredito, 0 px.
   ============================================================ */
export function VereditoDaFicha({ veredito }) {
  const texto = veredito && typeof veredito === "object"
    ? [veredito.quem, veredito.preco].filter(Boolean).join(" · ")
    : String(veredito || "").trim();
  if (!texto) return null;
  return <LinhaDoVeredito armado texto={<TextoComMoeda texto={texto} />} />;
}
