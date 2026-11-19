/* ============================================================
   A BANCA — o mercado como um pano estendido sobre a mesa (V7 · 18/11)

   formas.md §«A Mesa do Mestre · F5» §1.4, §4 «A banca» e as pranchas
   F5-7 (1440) e F5-13 (375). Abre como todo objeto da mesa (ObjetoAberto),
   em linho com bainha e duas barras tecidas. Três colunas: o mercador como
   carta (a gaveta, pechinchar, as outras bancas); o pano com as peças e o
   que você vende aqui; o veredito antes do clique. No telefone, uma coluna,
   e o veredito sobe de baixo.

   O preço diz-se com glifo + palavra + cor, nunca cor só (WCAG 2.2, 1.4.1):
   «✓ você paga», «✕ faltam 7». O botão que não pode é contorno, com a razão
   escrita dentro. As ações são as de antes, e nenhuma a mais: comprar na
   banca, comprar mantimento (1 e 5), vender, pechinchar — pelas mesmas
   funções do App. O painel NÃO calcula preço: a etiqueta vem do estoque
   (mercado.js, com a pechincha), a oferta de venda de `ofertaPor`, o porquê
   de `linhaDoPreco`, a comparação de comparar-item.js; o veredito, de
   objetos-abertos.js.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { SOMBRA_DA_MESA, alfa } from "./estilo.js";
import { ObjetoAberto, CasaDeItem, letraDaMesa, useJanela } from "./pecas-da-mesa.jsx";
import { CASA, OBJETO_ABERTO, NOME_DA_FAMILIA, NOME_DA_RARIDADE, familiaDoItem, raridadeDe, vereditoDaCompra, vereditoDaVenda, fraseDoEfeito } from "./objetos-abertos.js";
import { compararItem, encaixeDoItem, fraseDaTroca } from "./comparar-item.js";
import { linhaDoPreco } from "./comercio.js";
import { ranksDoPersonagem } from "./classes.js";
import { fichaDoItem, armasRecomendadas, armadurasRecomendadas } from "./itens.js";
import { Retrato } from "./ui.jsx";

const arr = (x) => (Array.isArray(x) ? x : []);
const TINTA = T.tintaDoPergaminho, TINTA_DIM = T.tintaDoPergaminhoDim;
const BALCAO = "balcao";
const nomeDe = (raw) => (typeof raw === "string" ? raw : (raw && raw.nome) || "item");

/* a moeda: um disco de latão, e o número em Cinzel */
function Moeda({ n, grande = false }) {
  const lado = grande ? 16 : 14;
  return (
    <span className="inline-flex items-center" style={{ gap: 6 }} aria-label={`${n} ${n === 1 ? "moeda" : "moedas"}`} role="img">
      <svg aria-hidden="true" width={lado} height={lado} viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill={T.latao} stroke={T.lataoSombra} strokeWidth="1.2" /><circle cx="8" cy="8" r="3.5" fill="none" stroke={T.lataoSombra} strokeWidth="1" /></svg>
      <span style={{ color: TINTA, ...letraDaMesa(grande ? "contagem" : "nome"), textTransform: "none" }}>{n}</span>
    </span>
  );
}
function Rotulo({ children }) {
  return <div style={{ color: TINTA_DIM, margin: "0 0 10px", ...letraDaMesa("rotulo") }}>{children}</div>;
}
function Nota({ children, cor = TINTA_DIM }) {
  return <p style={{ margin: 0, color: cor, ...letraDaMesa("notaDoMestre") }}>{children}</p>;
}

/* TREINO NA VITRINE (o de sempre, de painel-mercado.jsx): marca, não bloqueia */
function treinoDe(pers, it) {
  try {
    if (!["arma", "escudo", "armadura", "elmo", "botas"].includes(it.tipo)) return null;
    const cls = ranksDoPersonagem(pers);
    const lista = it.tipo === "arma" ? Object.keys(cls).flatMap((c) => armasRecomendadas(c)) : Object.keys(cls).flatMap((c) => armadurasRecomendadas(c));
    const f = fichaDoItem(it);
    if (!f || !f.cat) return null;
    return lista.some((x) => x.cat === f.cat);
  } catch (e) { return null; }
}
/* o que a peça muda no corpo: a comparação da ficha */
function oQueMuda(pers, item) {
  const slot = item && item.tipo === "mapa" ? null : encaixeDoItem(item);
  let cmp = null;
  try { cmp = slot ? compararItem(pers, item, slot) : null; } catch (e) { cmp = null; }
  return { slot, cmp, frase: fraseDoEfeito(item, cmp && cmp.linhas, slot) };
}
/* «✓ você paga» / «✕ faltam 7»: glifo, palavra e cor */
function Sinal({ v }) {
  return (
    <span className="inline-flex items-center" style={{ gap: 4, color: v.pode ? T.musgoNoPergaminho : T.perigoNoPergaminho, ...letraDaMesa("servico") }}>
      <span aria-hidden="true">{v.glifo}</span>{v.palavra}
    </span>
  );
}

function PecaDoPano({ item, pers, moedas, escolhida, aoTocar, telefone }) {
  const v = vereditoDaCompra({ preco: item.preco, moedas, nome: item.nome });
  const { frase } = oQueMuda(pers, item);
  return (
    <div className="flex items-start" style={{ gap: 12, minHeight: telefone ? 84 : 140 }}>
      <CasaDeItem item={item} lado={telefone ? CASA.mochila : CASA.banca} escolhida={escolhida} sobre="linho" aoTocar={aoTocar}
        rotulo={`${item.nome}, ${item.preco} moedas, ${v.palavra}`} />
      <div className="flex flex-col min-w-0" style={{ gap: 3 }}>
        <span style={{ color: TINTA, ...letraDaMesa("servico") }}>{item.nome}</span>
        <Moeda n={item.preco} grande={!telefone} />
        <Sinal v={v} />
        <Nota>{frase}</Nota>
      </div>
    </div>
  );
}

/* O VEREDITO DA COMPRA — a peça, o que está no corpo, o que muda, o preço e o botão */
function VereditoDaCompra({ pers, banca, item, moedas, aoComprar }) {
  const v = vereditoDaCompra({ preco: item.preco, moedas, nome: item.nome });
  const { slot, cmp } = oQueMuda(pers, item);
  const treino = treinoDe(pers, item);
  const fam = familiaDoItem(item);
  const porque = linhaDoPreco(item.porques);
  return (
    <div className="flex flex-col" style={{ gap: 14 }}>
      <div className="flex items-start" style={{ gap: 14 }}>
        <CasaDeItem item={item} lado={CASA.mochila} sobre="linho" />
        <div className="flex flex-col min-w-0">
          <span style={{ color: TINTA, ...letraDaMesa("nome") }}>{item.nome}</span>
          <Nota>{[NOME_DA_RARIDADE[raridadeDe(item)], NOME_DA_FAMILIA[fam], banca ? banca.nome : ""].filter(Boolean).join(" · ")}</Nota>
        </div>
      </div>
      {slot ? (
        <div>
          <Rotulo>Agora no corpo</Rotulo>
          <div className="flex items-center" style={{ gap: 10 }}>
            {cmp && cmp.atual ? <CasaDeItem item={cmp.atual} lado={CASA.comparacao} sobre="linho" /> : null}
            <span style={{ color: TINTA, ...letraDaMesa("servico"), fontWeight: 400 }}>{cmp && cmp.atual ? cmp.atual.nome : "nada neste lugar"}</span>
          </div>
        </div>
      ) : null}
      <div>
        <Rotulo>Se você comprar</Rotulo>
        {cmp && arr(cmp.linhas).length ? cmp.linhas.map((l) => (
          <div key={l.id} style={{ color: l.sinal === "ok" ? T.musgoNoPergaminho : l.sinal === "danger" ? T.perigoNoPergaminho : TINTA, ...letraDaMesa("servico"), fontWeight: 400 }}>
            <span aria-hidden="true">{l.sinal === "ok" ? "▲ " : l.sinal === "danger" ? "▼ " : "= "}</span>{l.rotulo}: {l.antes} para {l.depois}{l.sinal === "ok" ? ", melhora" : l.sinal === "danger" ? ", piora" : ""}
          </div>
        )) : <div style={{ color: TINTA, ...letraDaMesa("servico"), fontWeight: 400 }}><span aria-hidden="true">= </span>{fraseDoEfeito(item, null, slot)}</div>}
        {cmp && cmp.dorme ? <Nota>Pede sintonia: o poder dorme até você se sintonizar com ela.</Nota> : null}
        {treino === false ? <Nota cor={T.perigoNoPergaminho}>Sem treino: desvantagem ao usar, e magia travada se for armadura.</Nota> : null}
        {slot ? <Nota>{fraseDaTroca(slot)}</Nota> : null}
      </div>
      <div>
        <Rotulo>O preço</Rotulo>
        <div className="flex flex-wrap items-center" style={{ gap: 10 }}>
          <Moeda n={item.preco} grande />
          <span style={{ color: v.pode ? TINTA : T.perigoNoPergaminho, ...letraDaMesa("servico"), fontWeight: 400 }}>você tem {moedas} · {v.pode ? `fica com ${v.fica}` : `faltam ${v.falta}`}</span>
        </div>
        {porque ? <Nota>{porque}.</Nota> : null}
        {banca && banca.barganha ? <Nota>{banca.barganha.texto}.</Nota> : null}
      </div>
      <BotaoDoVeredito pode={v.pode} rotulo={v.pode ? `${v.botao} · você fica com ${v.fica}` : v.botao} razao={v.pode ? "" : v.razao} aoTocar={aoComprar} />
    </div>
  );
}
/* o botão do veredito: âmbar quando pode (a única ação principal da tela);
   contorno de tinta sem chão quando não pode, com a razão escrita dentro */
function BotaoDoVeredito({ pode, rotulo, razao, aoTocar }) {
  return (
    <button type="button" onClick={pode ? aoTocar : undefined} aria-disabled={pode ? "false" : "true"}
      className="tv-anel-foco w-full flex flex-col items-start text-left"
      style={{ minHeight: 56, padding: "10px 16px", borderRadius: 4, cursor: pode ? "pointer" : "default",
        background: pode ? T.amber : "transparent", border: `1px solid ${pode ? T.brasaNoPergaminho : TINTA}`, color: pode ? T.onAccent : TINTA }}>
      <span style={letraDaMesa("rotulo")}>{rotulo}</span>
      {razao ? <span style={{ ...letraDaMesa("notaDoMestre"), color: T.perigoNoPergaminho }}>{razao}</span> : null}
    </button>
  );
}

function VereditoDaVenda({ v, oferta, vestido, moedas, aoVender }) {
  const of = oferta || { valor: 0, quem: null, motivo: "" };
  const vv = vereditoDaVenda({ valor: of.valor, moedas, quem: of.quem, vestido, motivo: of.motivo });
  const porque = linhaDoPreco(of.porques);
  return (
    <div className="flex flex-col" style={{ gap: 14 }}>
      <Rotulo>Você vende aqui</Rotulo>
      <div className="flex items-start" style={{ gap: 14 }}>
        <CasaDeItem item={v.it} lado={CASA.mochila} sobre="linho" qtd={v.qtd} />
        <div className="flex flex-col min-w-0">
          <span style={{ color: TINTA, ...letraDaMesa("nome") }}>{v.nome}</span>
          <Nota>{[NOME_DA_RARIDADE[raridadeDe(v.it)], NOME_DA_FAMILIA[familiaDoItem(v.it)], v.qtd > 1 ? `você tem ${v.qtd}` : ""].filter(Boolean).join(" · ")}</Nota>
        </div>
      </div>
      {of.quem ? (
        <div className="flex flex-wrap items-center" style={{ gap: 10 }}>
          <span style={{ color: TINTA, ...letraDaMesa("servico"), fontWeight: 400 }}>{of.quem.nome} paga</span>
          <Moeda n={of.valor} grande />
          <span style={{ color: TINTA_DIM, ...letraDaMesa("servico"), fontWeight: 400 }}>você fica com {vv.depois}</span>
        </div>
      ) : null}
      {porque ? <Nota>{porque}.</Nota> : null}
      {of.quem ? <Nota>Quem compra é quem lida com aquilo, e paga do que tem na gaveta.</Nota> : null}
      <BotaoDoVeredito pode={vv.pode} rotulo={vv.pode ? vv.botao : `Vender ${v.nome}`} razao={vv.pode ? "não tem volta" : vv.razao} aoTocar={aoVender} />
    </div>
  );
}

function Balcao({ balcao, moedas, aoComprar }) {
  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      {balcao.map((s) => (
        <div key={s.id} className="flex flex-wrap items-center" style={{ gap: 12, padding: "10px 12px", borderRadius: 4, background: alfa(T.ossoLume, 0.6), border: `1px solid ${T.linhoSombra}` }}>
          <span className="flex flex-col flex-1 min-w-0" style={{ minWidth: 160 }}>
            <span style={{ color: TINTA, ...letraDaMesa("servico") }}>{s.nome}</span>
            {s.desc ? <Nota>{s.desc}</Nota> : null}
          </span>
          <Moeda n={s.preco} />
          {[1, 5].map((q) => {
            if (s.id === "kit" && q > 1) return null;
            const v = vereditoDaCompra({ preco: s.preco * q, moedas });
            return (
              <button key={q} type="button" onClick={v.pode ? () => aoComprar(s.id, q) : undefined} aria-disabled={v.pode ? "false" : "true"}
                className="tv-anel-foco flex flex-col items-start"
                style={{ minHeight: 48, padding: "4px 12px", borderRadius: 4, background: v.pode ? T.ossoLume : "transparent", border: `1px solid ${TINTA}`, color: TINTA, cursor: v.pode ? "pointer" : "default" }}>
                <span style={letraDaMesa("servico")}>{q > 1 ? `Comprar ${q}` : "Comprar"}</span>
                <span style={{ ...letraDaMesa("notaDoMestre"), color: v.pode ? TINTA_DIM : T.perigoNoPergaminho }}>{v.pode ? `${s.preco * q} · fica com ${v.fica}` : v.razao}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* Props (as do PainelMercado de antes, as mesmas funções do App):
   personagem · bancas · cidade · balcao · ofertaPor(it) · onComprar(banca,
   nome) · onVender(nome, origem) · onPechinchar(banca) ·
   onComprarSuprimento(id, q) · aoPousar. */
export function PainelBanca({ personagem, bancas = [], cidade = null, balcao = [], ofertaPor = null, onComprar, onVender, onPechinchar, onComprarSuprimento, aoPousar = null }) {
  const pers = personagem || {};
  const lista = arr(bancas);
  const mant = arr(balcao);
  const moedas = pers.moedas || 0;
  const j = useJanela();
  const telefone = j.l < OBJETO_ABERTO.corteDoTelefone;
  const primeira = (lista[0] && lista[0].id) || (mant.length ? BALCAO : null);
  const [bancaId, setBancaId] = React.useState(primeira);
  const [sel, setSel] = React.useState(null); /* { tipo: "compra", nome } | { tipo: "venda", nome, origem } */
  const [recibo, setRecibo] = React.useState("");
  const ativa = bancaId === BALCAO ? null : lista.find((m) => m.id === bancaId) || lista[0] || null;
  const noBalcao = !ativa && mant.length > 0;

  const vendaveis = [
    ...arr(pers.equipamento).map((it) => ({ it, origem: "equipamento", nome: nomeDe(it) })),
    ...arr(pers.inventario).map((raw) => ({ it: typeof raw === "string" ? { nome: raw } : raw, origem: "inventario", nome: nomeDe(raw) })),
  ];
  const bolsa = Object.values(vendaveis.reduce((acc, v) => {
    const k = `${v.origem}|${v.nome}`;
    if (!acc[k]) acc[k] = { ...v, qtd: 0 };
    acc[k].qtd++; return acc;
  }, {}));
  const vestidos = new Set(Object.values(pers.equipados || {}).filter(Boolean).map((e) => e.nome));
  const ofertaDe = (it) => { try { return ofertaPor ? ofertaPor(it) : null; } catch (e) { return null; } };

  const trocarBanca = (id) => { setBancaId(id); setSel(null); setRecibo(""); };
  const comprar = (item) => {
    try { if (onComprar && ativa) onComprar(ativa.id, item.nome); } catch (e) { /* nunca custa o turno */ }
    setRecibo(`${item.nome}: comprado por ${item.preco} ${item.preco === 1 ? "moeda" : "moedas"}. Foi para a bolsa.`); setSel(null);
  };
  const vender = (v, of) => {
    try { if (onVender) onVender(v.nome, v.origem); } catch (e) { /* idem */ }
    setRecibo(`${v.nome}: vendido por ${of.valor} ${of.valor === 1 ? "moeda" : "moedas"}.`); setSel(null);
  };
  const comprarMantimento = (id, q) => { try { if (onComprarSuprimento) onComprarSuprimento(id, q); } catch (e) { /* idem */ } };
  const pechinchar = () => { try { if (onPechinchar && ativa) onPechinchar(ativa.id); } catch (e) { /* idem */ } };

  const estoque = ativa ? arr(ativa.estoque) : [];
  const itemSel = sel && sel.tipo === "compra" ? estoque.find((x) => x.nome === sel.nome) : null;
  const vendaSel = sel && sel.tipo === "venda" ? bolsa.find((v) => v.nome === sel.nome && v.origem === sel.origem) : null;
  const itemVisto = itemSel || (!telefone && !vendaSel && !recibo ? estoque[0] : null) || null;
  let veredito = null;
  if (vendaSel) {
    const of = ofertaDe(vendaSel.it);
    veredito = <VereditoDaVenda v={vendaSel} oferta={of} vestido={vendaSel.origem === "equipamento" && vestidos.has(vendaSel.nome)} moedas={moedas} aoVender={() => vender(vendaSel, of || { valor: 0 })} />;
  } else if (itemVisto) {
    veredito = <VereditoDaCompra pers={pers} banca={ativa} item={itemVisto} moedas={moedas} aoComprar={() => comprar(itemVisto)} />;
  }
  const nomeCidade = (cidade && cidade.nome) || "";
  const vazio = !lista.length && !mant.length;

  const portas = [
    ...(mant.length ? [{ id: BALCAO, titulo: "Balcão de mantimentos", papel: "mantimentos" }] : []),
    ...lista.map((m) => ({ id: m.id, titulo: m.nome, papel: m.rotulo || "mercador" })),
  ];
  const idAtivo = noBalcao ? BALCAO : ativa ? ativa.id : null;

  const mercador = ativa ? (
    <div className="flex flex-col" style={{ gap: 10 }}>
      <div className={telefone ? "flex items-center" : "flex flex-col"} style={{ gap: 12 }}>
        <Retrato semente={ativa.nome} ente={{ nome: ativa.nome, papel: ativa.rotulo || "mercador" }} semCarta tamanho={telefone ? 64 : 200} recorte="cartao" anel={T.latao} />
        <div className="flex flex-col min-w-0">
          <span style={{ color: TINTA, ...letraDaMesa("nome") }}>{ativa.nome}</span>
          <Nota>{[ativa.rotulo, nomeCidade].filter(Boolean).join(" · ")}</Nota>
        </div>
      </div>
      <Nota>A mercadoria muda a cada semana. Na gaveta hoje:</Nota>
      <Moeda n={ativa.caixa || 0} grande />
      {ativa.barganha ? (
        <Nota cor={ativa.barganha.ok ? T.musgoNoPergaminho : T.perigoNoPergaminho}>{ativa.barganha.ok ? "▼ " : "▲ "}{ativa.barganha.texto}</Nota>
      ) : (
        <button type="button" onClick={pechinchar} className="tv-anel-foco w-full flex flex-col items-start text-left"
          style={{ minHeight: 52, padding: "8px 12px", borderRadius: 4, background: T.ossoLume, border: `1px solid ${TINTA}`, color: TINTA, cursor: "pointer" }}>
          <span style={letraDaMesa("proposta")}>Pechinchar</span>
          <span style={{ ...letraDaMesa("notaDoMestre"), color: TINTA_DIM }}>uma proposta por dia; se ele se ofender, o preço sobe</span>
        </button>
      )}
    </div>
  ) : noBalcao ? (
    <div className="flex flex-col" style={{ gap: 6 }}>
      <span style={{ color: TINTA, ...letraDaMesa("nome") }}>Balcão de mantimentos</span>
      <Nota>{nomeCidade ? `Da cidade de ${nomeCidade}: onde mora gente há ração e água.` : "Onde mora gente há ração e água."}</Nota>
    </div>
  ) : null;

  const outras = portas.length > 1 ? (
    <nav aria-label="As bancas">
      <Rotulo>{telefone ? "As bancas" : "Outras bancas"}</Rotulo>
      <div className={telefone ? "flex tv-scroll" : "flex flex-col"} style={{ gap: 6, overflowX: telefone ? "auto" : undefined }}>
        {portas.filter((p) => telefone || p.id !== idAtivo).map((p) => (
          <button key={p.id} type="button" onClick={() => trocarBanca(p.id)} aria-pressed={p.id === idAtivo ? "true" : "false"}
            className="tv-anel-foco flex items-center text-left shrink-0"
            style={{ minHeight: 44, gap: 10, padding: "4px 10px 4px 4px", borderRadius: 4, cursor: "pointer", background: p.id === idAtivo ? T.ossoLume : "transparent", border: `1px solid ${p.id === idAtivo ? TINTA : "transparent"}` }}>
            <Retrato semente={p.titulo} ente={p.id === BALCAO ? null : { nome: p.titulo, papel: p.papel }} semCarta tamanho={36} anel={T.latao} />
            <span style={{ color: TINTA, ...letraDaMesa("servico"), fontWeight: 400 }}>{p.titulo}</span>
          </button>
        ))}
      </div>
    </nav>
  ) : null;

  const pano = (
    <div className="flex flex-col" style={{ gap: 18 }}>
      <div className="flex flex-wrap items-baseline justify-between" style={{ gap: 12 }}>
        <Rotulo>{ativa ? `Sobre o pano · ${estoque.length} ${estoque.length === 1 ? "peça" : "peças"}` : "No balcão"}</Rotulo>
        <span className="inline-flex items-center" style={{ gap: 8, color: TINTA_DIM, ...letraDaMesa("rotulo") }}>Na sua bolsa <Moeda n={moedas} /></span>
      </div>
      {recibo ? <p role="status" style={{ margin: 0, color: T.musgoNoPergaminho, ...letraDaMesa("servico") }}><span aria-hidden="true">✓ </span>{recibo}</p> : null}
      {ativa ? (
        estoque.length ? (
          <div className="grid" style={{ gridTemplateColumns: telefone ? "1fr" : "1fr 1fr", gap: telefone ? 12 : "20px 24px" }}>
            {estoque.map((it) => (
              <PecaDoPano key={it.nome} item={it} pers={pers} moedas={moedas} telefone={telefone}
                escolhida={!!itemVisto && itemVisto.nome === it.nome && !vendaSel}
                aoTocar={() => { setRecibo(""); setSel({ tipo: "compra", nome: it.nome }); }} />
            ))}
          </div>
        ) : <Nota>Prateleiras vazias. Volte em outra semana.</Nota>
      ) : noBalcao ? <Balcao balcao={mant} moedas={moedas} aoComprar={comprarMantimento} /> : null}
      {!moedas && ativa ? <Nota>Sem moedas hoje. Você ainda pode olhar, pechinchar e vender.</Nota> : null}
      {bolsa.length ? (
        <section aria-label="O que você vende aqui">
          <Rotulo>O que pagam pelo que você leva</Rotulo>
          <div className="flex flex-wrap" style={{ gap: 10 }}>
            {bolsa.map((v) => {
              const of = ofertaDe(v.it);
              const paga = !!(of && of.quem);
              return (
                <span key={`${v.origem}|${v.nome}`} className="inline-flex flex-col items-center" style={{ width: CASA.mochila + 12, gap: 4 }}>
                  <CasaDeItem item={v.it} lado={CASA.mochila} sobre="linho" qtd={v.qtd}
                    escolhida={!!vendaSel && vendaSel.nome === v.nome && vendaSel.origem === v.origem}
                    rotulo={`${v.nome}: ${paga ? `pagam ${of.valor} moedas` : "ninguém compra"}`}
                    aoTocar={() => { setRecibo(""); setSel({ tipo: "venda", nome: v.nome, origem: v.origem }); }} />
                  <span className="text-center" style={{ color: paga ? TINTA : TINTA_DIM, ...letraDaMesa("notaDoMestre") }}>{paga ? `paga ${of.valor}` : "não compra"}</span>
                </span>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );

  const semVeredito = <Nota>Toque numa peça para ver o que muda antes de pagar.</Nota>;
  const folhaDoVeredito = { background: T.ossoLume, borderRadius: 6, padding: 20, boxShadow: SOMBRA_DA_MESA.erguido };

  let miolo;
  if (vazio) {
    miolo = <div style={{ padding: 40 }}><Nota>Nenhuma banca por perto. Mercadores existem nas cidades e, com sorte, numa carroça de estrada.</Nota></div>;
  } else if (telefone) {
    miolo = (
      <div className="flex flex-col relative" style={{ gap: 18, padding: "20px 28px 26px" }}>
        {mercador}{outras}{pano}
      </div>
    );
  } else {
    miolo = (
      <div className="flex-1 min-h-0 overflow-y-auto tv-scroll relative" style={{ padding: `${OBJETO_ABERTO.conteudo}px ${OBJETO_ABERTO.conteudo + 8}px` }}>
        <div className="grid items-start" style={{ gridTemplateColumns: "minmax(0, 210px) minmax(0, 1fr) minmax(0, 330px)", gap: 30 }}>
          <div className="flex flex-col" style={{ gap: 22 }}>{mercador}{outras}</div>
          {pano}
          <aside aria-label="O veredito" style={{ ...folhaDoVeredito, position: "sticky", top: 0 }}>{veredito || semVeredito}</aside>
        </div>
      </div>
    );
  }
  return (
    <ObjetoAberto objeto="banca" titulo="A banca" aoPousar={aoPousar}>
      {miolo}
      {telefone && veredito ? (
        <>
          <div aria-hidden="true" onClick={() => setSel(null)} className="fixed inset-0" style={{ zIndex: 60, background: alfa(T.veuDaNoite, OBJETO_ABERTO.veu) }} />
          <div role="dialog" aria-label="O veredito" className="tv-gaveta-sobe tv-scroll fixed left-0 right-0 bottom-0"
            style={{ zIndex: 61, maxHeight: "78vh", overflowY: "auto", ...folhaDoVeredito, borderRadius: "10px 10px 0 0" }}>
            <div className="flex justify-end" style={{ marginBottom: 4 }}>
              <button type="button" onClick={() => setSel(null)} className="tv-anel-foco" style={{ minHeight: 44, padding: "0 10px", background: "transparent", border: 0, color: TINTA, textDecoration: "underline", cursor: "pointer", ...letraDaMesa("servico") }}>Voltar ao pano</button>
            </div>
            {veredito}
          </div>
        </>
      ) : null}
    </ObjetoAberto>
  );
}
