/* ============================================================
   O MERCADO (AR6, 06/11/2026) — formas.md §AR 1, §AR 4, §AR 5, §AR 7;
   Figma «AR · 05/11»: 282:3205 (1905), 282:3534 (1280), 282:3839 (375),
   a Peça da banca 271:134 e a Linha da comparação 271:96.

   Saiu do App.jsx (a sub-aba `mercado` da Gestão, ~180 linhas dentro do
   PainelLateral). É uma banca e um veredito:

     à esquerda  as bancas como cartões (1905) ou abas (1280, 375); o
                 balcão de mantimentos é a primeira;
     ao meio     cada peça no Encaixe da sua raridade, o preço, e a
                 diferença contra o que o herói tem vestido no mesmo encaixe;
                 por baixo, a bolsa do herói com o que lhe pagam por cada coisa;
     à direita   o veredito antes do clique: a comparação inteira, as moedas
                 antes → depois, o preço dito com o porquê, e o verbo.
                 No telefone, a gaveta de baixo.

   As ações são as de antes, e nenhuma a mais: comprar na banca, comprar
   mantimento (1 e 5), vender, pechinchar. O painel NÃO calcula preço: a
   etiqueta vem do estoque (mercado.js, já com a pechincha e o desconto da
   profissão, no App), a oferta de venda vem de `ofertaPor` (o mesmo lugar
   que paga), e o porquê de `linhaDoPreco`. A comparação é a da ficha
   (comparar-item.js). Toda a medida e toda a cor saem de estilo.js.
   ============================================================ */
import React from "react";
import { createPortal } from "react-dom";
import { T, TIPOS, ALVOS, MERCADO, COR_DA_RARIDADE, ICONES_DE_ITEM, ENCAIXE, MOLDURA_POR_DEGRAU, CABECALHO_DA_TELA, VEU } from "./estilo.js";
import { DesenhoDoObjeto } from "./painel-mesa-do-mestre.jsx";
import { VerboComPreco, TextoComMoeda } from "./ui.jsx";
import { CabecalhoDaTela, AbaDaTela, GlifoAR, LinhaDaComparacao } from "./painel-ar-pecas.jsx";
import { Encaixe } from "./painel-moldura.jsx";
import { compararItem, raridadeDoItem, iconeDoItem, encaixeDoItem, fraseDaTroca } from "./comparar-item.js";
import { linhaDoPreco, generoPorId } from "./comercio.js";
import { ranksDoPersonagem } from "./classes.js";
import { fichaDoItem, armasRecomendadas, armadurasRecomendadas } from "./itens.js";

const M = MERCADO;
const OURO = MOLDURA_POR_DEGRAU.ouro;
const BALCAO = "balcao";
/* a largura de cada leiaute sai das medidas da própria tela (§AR 6) */
const CORTE = {
  mesa: M.mesa.esquerda + M.mesa.veredito + M.mesa.colunas * M.mesa.peca,
  meia: M.meia.veredito + M.meia.colunas * M.meia.peca,
};
const SINAL = { ok: "melhora", danger: "piora" };
const MARCA = { melhora: "▲", piora: "▼", igual: "=" };
const comSinal = (n) => (n > 0 ? "+" : n < 0 ? "−" : "±") + Math.abs(n);
const nomeDe = (raw) => (typeof raw === "string" ? raw : (raw && raw.nome) || "item");
/* a moeda: toda frase com ela passa por TextoComMoeda (o verbo, a linha da
   comparação, o recibo), que a desenha com o Glifo */
const MOEDA = "\u25C9";
const mo = (n) => `${MOEDA} ${n}`;
const maiuscula = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

function useLarguraDe(ref) {
  const [w, setW] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const medir = () => { try { setW(el.getBoundingClientRect().width || 0); } catch { /* sem medida, o telefone */ } };
    medir();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

/* ---------------- O QUE A PEÇA MUDA NO HERÓI ----------------
   A comparação é a da ficha: o mesmo `compararItem` que a gaveta do encaixe
   usa. Sem encaixe, a peça vai para a mochila; o mapa abre a região. */
function diferencaDe(pers, item) {
  if (item && item.tipo === "mapa") return { slot: null, cmp: null, curta: [{ sinal: "igual", texto: "abre a região no mapa" }] };
  const slot = encaixeDoItem(item);
  if (!slot) return { slot: null, cmp: null, curta: [{ sinal: "igual", texto: "vai para a mochila" }] };
  let cmp = null;
  try { cmp = compararItem(pers, item, slot); } catch { cmp = null; }
  const linhas = (cmp && cmp.linhas) || [];
  const curta = linhas.length
    ? linhas.slice(0, 2).map((l) => ({ sinal: SINAL[l.sinal] || "igual", texto: l.id === "dano" ? `dano ${l.antes} → ${l.depois}` : `${l.curto} ${comSinal(l.delta)}` }))
    : [{ sinal: "igual", texto: cmp && cmp.dorme ? "dorme sem sintonia" : "nada muda" }];
  return { slot, cmp, curta };
}

/* TREINO NA VITRINE (v9.14, vindo do App): marca, não bloqueia */
function treinoDe(pers, it) {
  try {
    if (!["arma", "escudo", "armadura", "elmo", "botas"].includes(it.tipo)) return null;
    const cls = ranksDoPersonagem(pers);
    const lista = it.tipo === "arma"
      ? Object.keys(cls).flatMap((c) => armasRecomendadas(c))
      : Object.keys(cls).flatMap((c) => armadurasRecomendadas(c));
    const f = fichaDoItem(it);
    if (!f || !f.cat) return null;
    return lista.some((x) => x.cat === f.cat);
  } catch { return null; }
}

function rotuloDoTipo(it) {
  if (!it || typeof it !== "object") return "";
  if (it.detalhe) return it.detalhe;
  let f = null;
  try { f = fichaDoItem(it); } catch { f = null; }
  return (f && f.rotulo) || ENCAIXE.nomes[it.tipo] || it.tipo || "";
}

/* A GAVETA DO TELEFONE mora no corpo da página: dentro da gaveta lateral (que
   desliza com transform), um «fixed» prende-se a ela e cai abaixo do ecrã.
   Sem documento (a suíte em Node), desenha-se no lugar. */
const noCorpo = (el) => (typeof document !== "undefined" && document.body ? createPortal(el, document.body) : el);

const Moedas = ({ n }) => <TextoComMoeda texto={`${mo(n)}`} />;

/* ---------------- A PEÇA DA BANCA (271:134) ---------------- */
function PecaDaBanca({ item, pers, moedas, escolhida, aoTocar }) {
  const r = raridadeDoItem(item);
  const cor = (COR_DA_RARIDADE[r] || COR_DA_RARIDADE.comum).cor;
  const cara = moedas < item.preco;
  const { curta } = diferencaDe(pers, item);
  const treino = treinoDe(pers, item);
  return (
    <button type="button" onClick={aoTocar} aria-pressed={escolhida}
      aria-label={`${item.nome}, ${item.preco} moedas${cara ? `, faltam ${item.preco - moedas}` : ""}`}
      className="tv-peca-banca tv-anel-foco flex flex-col items-center text-center"
      style={{
        gap: M.peca.folga, padding: M.enchimento, borderRadius: M.peca.raio, minHeight: ALVOS.piso,
        background: escolhida ? T.panelSoft : T.panel,
        border: `1px ${cara ? "dashed" : "solid"} ${escolhida ? T.amber : T.lineStrong}`,
      }}>
      <Encaixe raridade={r} icone={iconeDoItem(item, ICONES_DE_ITEM)} escolhido={escolhida} lado={M.peca.encaixe} />
      <span className="tv-body" style={{ fontSize: TIPOS.rotulo, color: cor, lineHeight: 1.2 }}>{item.nome}</span>
      <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: cara ? T.danger : T.amberSoft }}>
        <Moedas n={item.preco} />{cara ? <> · faltam <Moedas n={item.preco - moedas} /></> : null}
      </span>
      <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: T.inkMeio }}>
        {curta.map((c, i) => <span key={i}>{i ? " · " : ""}<span style={{ color: c.sinal === "melhora" ? T.ok : c.sinal === "piora" ? T.danger : T.inkDim }}>{MARCA[c.sinal]}</span> {c.texto}</span>)}
      </span>
      {treino === false ? <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: T.danger }}>sem treino</span> : null}
    </button>
  );
}

/* ---------------- A PEÇA DA BOLSA: o que te pagam por ela ---------------- */
function PecaDaBolsa({ v, oferta, escolhida, aoTocar }) {
  const r = raridadeDoItem(v.it);
  const paga = !!(oferta && oferta.quem);
  return (
    <span className="inline-flex flex-col items-center" style={{ width: M.bolsa.largura, gap: M.peca.folga }}>
      <Encaixe raridade={r} icone={iconeDoItem(v.it, ICONES_DE_ITEM)} escolhido={escolhida} lado={M.bolsa.encaixe}
        canto={v.qtd > 1 ? v.qtd : null} aoTocar={aoTocar}
        ariaLabel={`${v.nome}: ${paga ? `pagam ${oferta.valor} moedas` : "ninguém compra"}`} />
      <span className="tv-mono text-center" style={{ fontSize: TIPOS.maquina, color: paga ? T.amberSoft : T.inkDim, lineHeight: 1.2 }}>
        {paga ? <>paga <Moedas n={oferta.valor} /></> : "não compra"}
      </span>
    </span>
  );
}

/* ---------------- O CARTÃO DA BANCA (a coluna da esquerda, 1905) ---------------- */
function CartaoDaBanca({ titulo, linha, glifo, ativa, aoTocar }) {
  return (
    <button type="button" onClick={aoTocar} aria-pressed={ativa}
      className="tv-peca-banca tv-anel-foco flex items-center text-left w-full"
      style={{ gap: M.peca.folga * 2, padding: M.enchimento, borderRadius: M.peca.raio, minHeight: ALVOS.piso, background: ativa ? T.panelSoft : T.panel, border: `1px solid ${ativa ? T.amber : T.lineStrong}` }}>
      {glifo}
      <span className="flex flex-col min-w-0">
        <span className="tv-titulo" style={{ fontSize: TIPOS.corpo, color: T.ink }}>{titulo}</span>
        {linha ? <span className="tv-body" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}><TextoComMoeda texto={linha} /></span> : null}
      </span>
    </button>
  );
}

/* ---------------- O VEREDITO ---------------- */
function Rotulo({ children }) {
  return <div className="tv-mono uppercase tracking-widest" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}>{children}</div>;
}

function VereditoDaCompra({ pers, banca, item, moedas, aoComprar }) {
  const r = raridadeDoItem(item);
  const cor = (COR_DA_RARIDADE[r] || COR_DA_RARIDADE.comum).cor;
  const { slot, cmp } = diferencaDe(pers, item);
  const treino = treinoDe(pers, item);
  const pode = moedas >= item.preco;
  const porque = linhaDoPreco(item.porques);
  const destino = item.tipo === "mapa" ? "abre a região no mapa" : slot ? "vai para a bolsa" : "vai para a mochila";
  return (
    <div className="flex flex-col" style={{ gap: M.vao }}>
      <div className="flex items-center" style={{ gap: M.vao }}>
        <Encaixe raridade={r} icone={iconeDoItem(item, ICONES_DE_ITEM)} lado={M.encaixeGrande} />
        <div className="flex flex-col min-w-0">
          <h3 className="tv-titulo" style={{ fontSize: TIPOS.titulo, color: cor, margin: 0 }}>{item.nome}</h3>
          <span className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.inkMeio }}>{[maiuscula(item.raridade || r), rotuloDoTipo(item), banca ? banca.nome : ""].filter(Boolean).join(" · ")}</span>
        </div>
      </div>
      {slot ? (
        <div className="flex items-center rounded-lg" style={{ gap: M.peca.folga * 2, padding: M.peca.folga * 2, border: `1px solid ${T.lineStrong}`, background: T.panel }}>
          {cmp && cmp.atual
            ? <Encaixe raridade={raridadeDoItem(cmp.atual)} icone={iconeDoItem(cmp.atual, ICONES_DE_ITEM)} lado={M.bolsa.encaixe} />
            : <Encaixe glifo={iconeDoItem(item, ICONES_DE_ITEM)} lado={M.bolsa.encaixe} />}
          <span className="flex flex-col min-w-0">
            <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}>{ENCAIXE.nomes[slot] || slot} · agora</span>
            <span className="tv-body" style={{ fontSize: TIPOS.corpo, color: T.ink }}>{cmp && cmp.atual ? cmp.atual.nome : "nada"}</span>
          </span>
        </div>
      ) : null}
      <div className="flex flex-col" style={{ gap: M.peca.folga }}>
        {((cmp && cmp.linhas) || []).map((l) => <LinhaDaComparacao key={l.id} rotulo={l.rotulo} antes={l.antes} depois={l.depois} sinal={SINAL[l.sinal] || "igual"} />)}
        <LinhaDaComparacao rotulo="Moedas" antes={`${mo(moedas)}`} depois={pode ? `${mo(moedas - item.preco)}` : `faltam ${mo(item.preco - moedas)}`} sinal={pode ? "igual" : "piora"} />
      </div>
      {cmp && cmp.dorme ? <p className="tv-body" style={{ margin: 0, fontSize: TIPOS.rotulo, color: T.inkMeio }}>Pede sintonia: o poder dorme até te sintonizares com ela.</p> : null}
      {treino === false ? <p className="tv-body" style={{ margin: 0, fontSize: TIPOS.rotulo, color: T.danger }}>Sem treino: desvantagem ao usar, e magia travada se for armadura.</p> : null}
      <p className="tv-body" style={{ margin: 0, fontSize: TIPOS.rotulo, color: T.inkDim }}>
        O preço: <Moedas n={item.preco} />{porque ? ` — ${porque}` : ""}.{banca && banca.barganha ? ` ${maiuscula(banca.barganha.texto)}.` : ""}{slot ? ` ${fraseDaTroca(slot)}` : ""}
      </p>
      {pode
        ? <VerboComPreco papel="armado" verbo={`Comprar ${item.nome}`} preco={`${mo(item.preco)} · ${destino} · ficas com ${mo(moedas - item.preco)}`} aoTocar={aoComprar} />
        : <VerboComPreco verbo={`Comprar ${item.nome}`} preco={`${mo(item.preco)}`} impedido={`faltam ${mo(item.preco - moedas)}`} />}
    </div>
  );
}

function VereditoDaVenda({ v, oferta, vestido, moedas, aoVender }) {
  const r = raridadeDoItem(v.it);
  const cor = (COR_DA_RARIDADE[r] || COR_DA_RARIDADE.comum).cor;
  const of = oferta || { valor: 0, quem: null, motivo: "", porques: [] };
  const porque = linhaDoPreco(of.porques);
  return (
    <div className="flex flex-col" style={{ gap: M.vao }}>
      <div className="flex items-center" style={{ gap: M.vao }}>
        <Encaixe raridade={r} icone={iconeDoItem(v.it, ICONES_DE_ITEM)} lado={M.encaixeGrande} canto={v.qtd > 1 ? v.qtd : null} />
        <div className="flex flex-col min-w-0">
          <h3 className="tv-titulo" style={{ fontSize: TIPOS.titulo, color: cor, margin: 0 }}>{v.nome}</h3>
          <span className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.inkMeio }}>{[v.it && v.it.raridade ? maiuscula(v.it.raridade) : "", rotuloDoTipo(v.it), v.qtd > 1 ? `tens ${v.qtd}` : ""].filter(Boolean).join(" · ") || "da tua bolsa"}</span>
        </div>
      </div>
      {of.quem ? <LinhaDaComparacao rotulo="Moedas" antes={`${mo(moedas)}`} depois={`${mo(moedas + of.valor)}`} sinal="melhora" /> : null}
      <p className="tv-body" style={{ margin: 0, fontSize: TIPOS.rotulo, color: T.inkDim }}>
        {of.quem ? <>{of.quem.nome} compra: <Moedas n={of.valor} />{porque ? ` — ${porque}` : ""}. Quem compra é quem lida com aquilo, e paga do que tem na gaveta.</> : `${maiuscula(of.motivo || "ninguém aqui lida com isso")}.`}
      </p>
      {vestido
        ? <VerboComPreco verbo={`Vender ${v.nome}`} preco={of.quem ? `${mo(of.valor)}` : ""} impedido="está vestido: tira-o primeiro na ficha" />
        : of.quem
          ? <VerboComPreco papel="semVolta" verbo={`Vender ${v.nome}`} preco={`${of.quem.nome} paga ${mo(of.valor)} · não volta`} aoTocar={aoVender} />
          : <VerboComPreco verbo={`Vender ${v.nome}`} preco="" impedido="ninguém aqui compra" />}
    </div>
  );
}

/* ---------------- O BALCÃO DE MANTIMENTOS (v9.150) ----------------
   Da cidade, não de um mercador: onde mora gente há ração e água. */
function Balcao({ balcao, moedas, aoComprar }) {
  return (
    <div className="flex flex-col" style={{ gap: M.peca.folga * 2 }}>
      {balcao.map((s) => (
        <div key={s.id} className="flex flex-wrap items-center rounded-lg" style={{ gap: M.peca.folga * 2, padding: M.peca.folga * 2, background: T.panel, border: `1px solid ${T.lineStrong}` }}>
          <span aria-hidden="true" style={{ fontSize: TIPOS.titulo }}>{s.icone}</span>
          <span className="flex flex-col flex-1 min-w-0" style={{ minWidth: M.telefone.peca }}>
            <span className="tv-body" style={{ fontSize: TIPOS.corpo, color: T.ink }}>{s.nome}</span>
            <span className="tv-body" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}>{s.desc}</span>
          </span>
          {[1, 5].map((q) => (s.id === "kit" && q > 1) ? null : (
            moedas >= s.preco * q
              ? <VerboComPreco key={q} verbo={q > 1 ? `Comprar ${q}` : "Comprar"} preco={`${mo(s.preco * q)} · ficas com ${mo(moedas - s.preco * q)}`} aoTocar={() => aoComprar(s.id, q)} />
              : <VerboComPreco key={q} verbo={q > 1 ? `Comprar ${q}` : "Comprar"} preco={`${mo(s.preco * q)}`} impedido={`faltam ${mo(s.preco * q - moedas)}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------------- O PAINEL ---------------- */
export function PainelMercado({ personagem, bancas = [], cidade = null, balcao = [], comercio = null, ofertaPor = null, onComprar, onVender, onPechinchar, onComprarSuprimento, aoFechar = null, leiaute: leiautePedido = null, inicial = null }) {
  const pers = personagem || {};
  const lista = Array.isArray(bancas) ? bancas : [];
  const mant = Array.isArray(balcao) ? balcao : [];
  const moedas = pers.moedas || 0;
  const raiz = React.useRef(null);
  const largura = useLarguraDe(raiz);
  const leiaute = leiautePedido || (largura >= CORTE.mesa ? "mesa" : largura >= CORTE.meia ? "meia" : "telefone");
  const L = leiaute === "mesa" ? M.mesa : leiaute === "meia" ? M.meia : M.telefone;
  const telefone = leiaute === "telefone";

  const primeira = (lista[0] && lista[0].id) || (mant.length ? BALCAO : null);
  const [bancaId, setBancaId] = React.useState(() => (inicial && inicial.banca) || primeira);
  /* sel: { tipo: "compra", nome } | { tipo: "venda", nome, origem } */
  const [sel, setSel] = React.useState(() => (inicial && inicial.item ? { tipo: "compra", nome: inicial.item } : inicial && inicial.venda ? { tipo: "venda", nome: inicial.venda, origem: inicial.origem || "inventario" } : null));
  const [recibo, setRecibo] = React.useState("");

  const ativa = bancaId === BALCAO ? null : (lista.find((m) => m.id === bancaId) || (bancaId === BALCAO ? null : lista[0]) || null);
  const noBalcao = !ativa && mant.length > 0;

  /* a bolsa do herói, agrupada (a mesma conta da tela de antes) */
  const vendaveis = [
    ...(pers.equipamento || []).map((it) => ({ it, origem: "equipamento", nome: nomeDe(it) })),
    ...(pers.inventario || []).map((raw) => ({ it: typeof raw === "string" ? { nome: raw } : raw, origem: "inventario", nome: nomeDe(raw) })),
  ];
  const bolsa = Object.values(vendaveis.reduce((acc, v) => {
    const k = `${v.origem}|${v.nome}`;
    if (!acc[k]) acc[k] = { ...v, qtd: 0 };
    acc[k].qtd++; return acc;
  }, {})).slice(0, M.bolsaAVista);
  const vestidos = new Set(Object.values(pers.equipados || {}).filter(Boolean).map((e) => e.nome));
  const ofertaDe = (it) => { try { return ofertaPor ? ofertaPor(it) : null; } catch { return null; } };

  const trocarBanca = (id) => { setBancaId(id); setSel(null); };
  const comprar = (item) => {
    try { if (onComprar && ativa) onComprar(ativa.id, item.nome); } catch { /* nunca custa o turno */ }
    setRecibo(`${item.nome}: comprado por ${mo(item.preco)}.`); setSel(null);
  };
  const vender = (v, of) => {
    try { if (onVender) onVender(v.nome, v.origem); } catch { /* idem */ }
    setRecibo(`${v.nome}: vendido por ${mo(of.valor)}.`); setSel(null);
  };
  const comprarMantimento = (id, q) => { try { if (onComprarSuprimento) onComprarSuprimento(id, q); } catch { /* idem */ } };
  const pechinchar = () => { try { if (onPechinchar && ativa) onPechinchar(ativa.id); } catch { /* idem */ } };

  /* o veredito do que está escolhido (na mesa, a primeira peça já vem escolhida) */
  const itemSel = sel && sel.tipo === "compra" && ativa ? ativa.estoque.find((x) => x.nome === sel.nome) : null;
  const vendaSel = sel && sel.tipo === "venda" ? bolsa.find((v) => v.nome === sel.nome && v.origem === sel.origem) : null;
  const itemVisto = itemSel || (!telefone && !vendaSel && ativa && !recibo ? ativa.estoque[0] : null);
  let veredito = null;
  if (vendaSel) {
    const of = ofertaDe(vendaSel.it);
    veredito = <VereditoDaVenda v={vendaSel} oferta={of} vestido={vendaSel.origem === "equipamento" && vestidos.has(vendaSel.nome)} moedas={moedas} aoVender={() => vender(vendaSel, of || { valor: 0 })} />;
  } else if (itemVisto) {
    veredito = <VereditoDaCompra pers={pers} banca={ativa} item={itemVisto} moedas={moedas} aoComprar={() => comprar(itemVisto)} />;
  }

  const nomeCidade = (cidade && cidade.nome) || "";
  const vazio = !lista.length && !mant.length;
  const linhaDoBalcao = mant.slice(0, 3).map((s) => `${(s.nome || "").toLowerCase()} ${mo(s.preco)}`).join(" · ");
  const subtitulo = vazio ? "nenhuma banca por perto" : [nomeCidade, `${lista.length} banca${lista.length === 1 ? "" : "s"}`, "o preço diz porquê"].filter(Boolean).join(" · ");

  const chipDaBolsa = (
    <div className="inline-flex items-center rounded-lg tv-mono" style={{ gap: M.peca.folga, padding: `${M.peca.folga}px ${M.peca.folga * 2}px`, border: `1px solid ${T.amber}`, background: T.panelSoft, color: T.amber, fontSize: TIPOS.titulo }}>
      <Moedas n={moedas} /> <span style={{ fontSize: TIPOS.maquina, color: T.inkMeio }}>na bolsa</span>
    </div>
  );

  const vocacao = comercio ? (
    <div className="rounded-lg tv-body" style={{ padding: M.peca.folga * 2, background: T.panel, border: `1px solid ${T.line}`, fontSize: TIPOS.maquina, color: T.inkMeio }}>
      {nomeCidade || "Aqui"} é <span style={{ color: T.amberSoft }}>{comercio.nome}</span> — {comercio.o}. Sobra {(comercio.produz || []).map((g) => (generoPorId(g) || {}).nome).join(" e ")}
      {(comercio.falta || []).length ? `; falta ${comercio.falta.map((g) => (generoPorId(g) || {}).nome).join(" e ")}` : ", e por aqui quase tudo passa"}.
    </div>
  ) : null;

  /* as bancas: cartões na mesa, abas fora dela; o balcão é a primeira */
  const portas = [
    ...(mant.length ? [{ id: BALCAO, titulo: "Balcão de mantimentos", linha: linhaDoBalcao, glifo: <GlifoAR nome="bolsa" tamanho={TIPOS.titulo} cor={T.amberSoft} /> }] : []),
    ...lista.map((m) => ({ id: m.id, titulo: m.nome, linha: `${m.rotulo || ""}${m.desc ? ` · ${m.desc}` : ""}`, glifo: <span aria-hidden="true" style={{ fontSize: TIPOS.titulo }}>{m.icone}</span> })),
  ];
  const idAtivo = noBalcao ? BALCAO : ativa ? ativa.id : null;

  const cabecaDaBanca = ativa ? (
    <div className="flex flex-wrap items-start justify-between" style={{ gap: M.peca.folga * 2 }}>
      <div className="flex flex-col min-w-0">
        <h3 className="tv-titulo" style={{ fontSize: TIPOS.titulo, color: OURO.claro, margin: 0 }}>{ativa.nome}</h3>
        <span className="tv-body" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}>{[ativa.rotulo, `${ativa.estoque.length} peça${ativa.estoque.length === 1 ? "" : "s"} hoje`, "a mercadoria renova-se a cada semana"].filter(Boolean).join(" · ")}</span>
        <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}>a gaveta dele hoje: <Moedas n={ativa.caixa || 0} /></span>
      </div>
      {ativa.barganha
        ? <span className="tv-mono rounded-lg" style={{ padding: `${M.peca.folga}px ${M.peca.folga * 2}px`, border: `1px solid ${ativa.barganha.ok ? T.ok : T.danger}`, color: ativa.barganha.ok ? T.ok : T.danger, fontSize: TIPOS.maquina }}>{ativa.barganha.ok ? "▼" : "▲"} {ativa.barganha.texto}</span>
        : <VerboComPreco verbo="Pechinchar" preco="uma proposta por dia · se ele se ofender, o preço sobe" aoTocar={pechinchar} />}
    </div>
  ) : null;

  const grade = ativa ? (
    ativa.estoque.length ? (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${L.colunas}, minmax(0, 1fr))`, gap: M.peca.folga * 2 }}>
        {ativa.estoque.map((it) => (
          <PecaDaBanca key={it.nome} item={it} pers={pers} moedas={moedas}
            escolhida={!!itemVisto && itemVisto.nome === it.nome && !vendaSel}
            aoTocar={() => { setRecibo(""); setSel({ tipo: "compra", nome: it.nome }); }} />
        ))}
      </div>
    ) : <p className="tv-body italic" style={{ margin: 0, fontSize: TIPOS.rotulo, color: T.inkDim }}>Prateleiras vazias. Volte noutra semana.</p>
  ) : noBalcao ? (
    <>
      <div className="flex flex-col">
        <h3 className="tv-titulo" style={{ fontSize: TIPOS.titulo, color: OURO.claro, margin: 0 }}>Balcão de mantimentos</h3>
        {mant[0] && (mant[0].porques || []).length ? <span className="tv-body" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}>{mant[0].porques.join("; ")}</span> : null}
      </div>
      <Balcao balcao={mant} moedas={moedas} aoComprar={comprarMantimento} />
    </>
  ) : null;

  const secaoDaBolsa = bolsa.length ? (
    <div className="flex flex-col" style={{ gap: M.peca.folga * 2 }}>
      <Rotulo>A tua bolsa · o que te pagam aqui · {vendaveis.length}</Rotulo>
      <div className="flex flex-wrap" style={{ gap: M.peca.folga * 2 }}>
        {bolsa.map((v) => (
          <PecaDaBolsa key={`${v.origem}|${v.nome}`} v={v} oferta={ofertaDe(v.it)}
            escolhida={!!vendaSel && vendaSel.nome === v.nome && vendaSel.origem === v.origem}
            aoTocar={() => { setRecibo(""); setSel({ tipo: "venda", nome: v.nome, origem: v.origem }); }} />
        ))}
      </div>
    </div>
  ) : null;

  const cartao = { background: T.couro, border: `1px solid ${T.lineStrong}`, borderRadius: M.raio, padding: M.enchimento };
  const reciboEl = recibo ? <p role="status" className="tv-body" style={{ margin: 0, fontSize: TIPOS.rotulo, color: T.ok }}>✓ <TextoComMoeda texto={recibo} /></p> : null;
  const semVeredito = <p className="tv-body italic" style={{ margin: 0, fontSize: TIPOS.rotulo, color: T.inkDim }}>Toca numa peça para ver o que muda antes de pagar.</p>;

  return (
    <div ref={raiz} className="flex flex-col w-full" style={{ minHeight: telefone ? undefined : "100%" }}>
      <CabecalhoDaTela titulo="O Mercado" subtitulo={subtitulo} telefone={telefone} aoFechar={aoFechar}
        objeto={<DesenhoDoObjeto chave="bolsa" lado={telefone ? CABECALHO_DA_TELA.telefone.objeto : CABECALHO_DA_TELA.mesa.objeto} />} />
      {vazio ? (
        <p className="tv-body italic text-center" style={{ margin: 0, padding: M.vao * 2, fontSize: TIPOS.corpo, color: T.inkDim }}>Nenhuma banca por perto. Mercadores existem nas cidades — e, com sorte, numa carroça de estrada.</p>
      ) : (
        <div style={{ display: "grid", gap: M.vao, padding: M.vao, alignItems: "start",
          gridTemplateColumns: leiaute === "mesa" ? `${M.mesa.esquerda}px minmax(0, 1fr) ${M.mesa.veredito}px` : leiaute === "meia" ? `minmax(0, 1fr) ${M.meia.veredito}px` : "minmax(0, 1fr)" }}>
          {leiaute === "mesa" ? (
            <aside className="flex flex-col" style={{ gap: M.peca.folga * 2 }}>
              {chipDaBolsa}
              <Rotulo>As bancas{nomeCidade ? ` de ${nomeCidade}` : ""}</Rotulo>
              {portas.map((p) => <CartaoDaBanca key={p.id} titulo={p.titulo} linha={p.linha} glifo={p.glifo} ativa={p.id === idAtivo} aoTocar={() => trocarBanca(p.id)} />)}
              {vocacao}
            </aside>
          ) : null}
          <section className="flex flex-col min-w-0" style={{ ...cartao, gap: M.vao }}>
            {leiaute !== "mesa" ? (
              <>
                <div className="flex items-center justify-between flex-wrap" style={{ gap: M.peca.folga * 2 }}>{chipDaBolsa}</div>
                <div role="tablist" aria-label="As bancas" className="tv-scroll" style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "max-content", gap: M.vao, overflowX: "auto", borderBottom: `1px solid ${T.line}` }}>
                  {portas.map((p) => <AbaDaTela key={p.id} rotulo={p.titulo} ativa={p.id === idAtivo} aoTocar={() => trocarBanca(p.id)} />)}
                </div>
              </>
            ) : null}
            {cabecaDaBanca}
            {grade}
            {reciboEl}
            {secaoDaBolsa}
            {leiaute !== "mesa" ? vocacao : null}
          </section>
          {!telefone ? (
            <aside aria-label="O veredito" className="flex flex-col" style={{ ...cartao, gap: M.vao, background: T.panelSoft, border: `1px solid ${T.amber}`, position: "sticky", top: M.vao }}>
              {veredito || semVeredito}
            </aside>
          ) : null}
        </div>
      )}
      {telefone && veredito ? noCorpo(
        <>
          <div aria-hidden="true" onClick={() => setSel(null)} className="fixed inset-0" style={{ background: T.bg, opacity: VEU.leve, zIndex: 60 }} />
          <div role="dialog" aria-label="O veredito" className="tv-gaveta-sobe tv-scroll fixed left-0 right-0 bottom-0"
            style={{ zIndex: 61, maxHeight: `${M.gaveta.alto * 100}vh`, overflowY: "auto", background: T.panelSoft, borderTop: `1px solid ${T.amber}`, borderRadius: `${M.gaveta.raio}px ${M.gaveta.raio}px 0 0`, padding: M.gaveta.enchimento }}>
            <div className="flex justify-center" style={{ marginBottom: M.gaveta.folga }}>
              <button type="button" onClick={() => setSel(null)} aria-label="Fechar o veredito" className="tv-anel-foco flex items-center justify-center" style={{ minWidth: ALVOS.piso, minHeight: ALVOS.piso / 2, background: "transparent", border: "none" }}>
                <span style={{ width: M.gaveta.alca.largura, height: M.gaveta.alca.altura, borderRadius: M.gaveta.alca.altura, background: T.lineStrong, display: "block" }} />
              </button>
            </div>
            {veredito}
          </div>
        </>
      ) : null}
    </div>
  );
}
