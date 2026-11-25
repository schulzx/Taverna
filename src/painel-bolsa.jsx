/* ============================================================
   A BOLSA — o herói e a carga, numa bolsa de couro aberta (V7 · 18/11)

   formas.md §«A Mesa do Mestre · F5» §1.6, §4 «A bolsa» e as pranchas
   F5-6 (1440) e F5-12 (375). Abre como todo objeto da mesa (ObjetoAberto).
   Três colunas no couro: a carta do herói com PV/PM/XP; o corpo (sete casas
   em volta da silhueta), os atributos como peças e os talentos; a mochila,
   a ficha do item escolhido e os mantimentos. No telefone, uma coluna, e a
   ficha do item logo abaixo da mochila.

   O que se faz é o de sempre, pelas mesmas funções do App: usar, o verbo do
   item, equipar (o mesmo equipar da gaveta do encaixe, com a mesma
   comparação), tirar, desmontar, dar a um companheiro, largar. Nenhuma
   regra nasce aqui: a família e a ordem saem de objetos-abertos.js; o que
   muda no corpo, de comparar-item.js. Uma ação principal por vez em âmbar.
   ============================================================ */
import React from "react";
import { T, XP_POR_NIVEL } from "./constantes.js";
import { ENCAIXE, SOMBRA_DA_MESA, PECAS_DA_MESA, VB_DA_MOLDURA, TAMANHOS_DA_MOLDURA, FICHA_CARTA, alfa } from "./estilo.js";
import { ObjetoAberto, CasaDeItem, GlifoDeItem, PecaDeRecurso, letraDaMesa, useJanela } from "./pecas-da-mesa.jsx";
import { CASA, CORPO_DA_BOLSA, ORDEM_DO_CORPO, OBJETO_ABERTO, NOME_DA_FAMILIA, NOME_DA_RARIDADE, casasDaMochila, ordemDaMochila, verbosDaLinha, familiaDoItem, raridadeDe } from "./objetos-abertos.js";
import { RostoNaMoldura, caDoHeroi } from "./painel-equipamento.jsx";
import { compararItem, encaixeDoItem, rotuloDoEquipar, fraseDaTroca, fraseDaPenalidade } from "./comparar-item.js";
import { discosDaFicha } from "./subida-de-nivel.js";
import { contasAcesas } from "./mesa-do-mestre.js";

const arr = (x) => (Array.isArray(x) ? x : []);
/* o glifo de cada encaixe vazio (a casa tracejada mostra o que mora ali) */
const CONTAS = PECAS_DA_MESA.carta.contas;
const GLIFO_DO_LUGAR = { elmo: "elmo", amuleto: "amuleto", armadura: "armadura_leve", botas: "botas", arma: "lamina", escudo: "escudo", anel: "anel" };

/* a carta do herói com o nome na placa (a mesma conta da carta da ficha:
   a placa mora em FICHA_CARTA.placa, no desenho da moldura) */
function CartaDoHeroi({ p, largura, lex }) {
  const vb = VB_DA_MOLDURA.carta, k = largura / TAMANHOS_DA_MOLDURA.carta.largura, pl = FICHA_CARTA.placa;
  return (
    <div className="relative shrink-0" style={{ width: vb[2] * k, height: vb[3] * k }}>
      <RostoNaMoldura personagem={p} tamanho="carta" aro={largura} lex={lex} />
      <div className="absolute flex items-center justify-center text-center" style={{ left: (pl.x - vb[0]) * k, top: (pl.y - vb[1]) * k, width: pl.largura * k, height: pl.altura * k, padding: "0 6px" }}>
        <span style={{ color: T.ink, ...letraDaMesa("nome") }}>{largura >= 200 ? (p.nome || "") : String(p.nome || "").split(" ")[0]}</span>
      </div>
    </div>
  );
}

function Rotulo({ children, cor = T.inkMeio }) {
  return <div style={{ color: cor, margin: "0 0 10px", ...letraDaMesa("rotulo") }}>{children}</div>;
}

/* PV, PM: as contas acesas (a mesma conta da carta de pé); XP: o trilho */
function Contas({ rotulo, atual, max, cor, vazia }) {
  const c = { acesas: contasAcesas(atual, max), total: CONTAS };
  return (
    <div className="flex items-center" style={{ gap: 10 }} aria-label={`${rotulo} ${atual || 0} de ${max || 0}`} role="img">
      <span style={{ width: 28, color: T.inkMeio, ...letraDaMesa("rotulo") }}>{rotulo}</span>
      <span className="flex" style={{ gap: 4 }}>
        {Array.from({ length: c.total }, (_, i) => <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < c.acesas ? cor : vazia }} />)}
      </span>
      <span style={{ marginLeft: "auto", color: T.ink, ...letraDaMesa("nome") }}>{atual || 0} / {max || 0}</span>
    </div>
  );
}
function Trilho({ atual, max }) {
  const f = max > 0 ? Math.max(0, Math.min(1, atual / max)) : 0;
  return (
    <div className="flex items-center" style={{ gap: 10 }} role="img" aria-label={`Experiência ${atual} de ${max}`}>
      <span style={{ width: 28, color: T.inkMeio, ...letraDaMesa("rotulo") }}>XP</span>
      <span style={{ flex: 1, height: 6, borderRadius: 3, background: T.couroBaixo, border: `1px solid ${alfa(T.latao, 0.5)}` }}>
        <span style={{ display: "block", width: `${f * 100}%`, height: "100%", borderRadius: 3, background: T.lataoLume }} />
      </span>
      <span style={{ color: T.ink, ...letraDaMesa("nome") }}>{atual} / {max}</span>
    </div>
  );
}

/* a ficha do que se escolheu: nome, família e raridade, o efeito, o verbo
   principal em âmbar, os outros, e «Largar» com o preço dito */
function FichaDoItem({ escolha, personagem, aoEquipar, aoDesequipar, telefone, toque = 0 }) {
  /* conserto V7/V8 (19/11): em 1280 × 800 o cartão saía cortado embaixo da
     coluna. A coluna rola por dentro, e o cartão escolhido vem à vista. */
  const aoAparecer = React.useCallback((el) => { try { if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" }); } catch (e) { /* sem rolagem, segue */ } }, [toque]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!escolha) return null;
  const { nome, item, linha, slot, noCorpo } = escolha;
  const fam = familiaDoItem(item || nome);
  const rar = item && typeof item === "object" ? NOME_DA_RARIDADE[raridadeDe(item)] : "";
  const slotDoItem = noCorpo ? slot : item && typeof item === "object" ? encaixeDoItem(item) : null;
  let cmp = null;
  try { cmp = slotDoItem && item ? compararItem(personagem, item, slotDoItem) : null; } catch (e) { cmp = null; }
  const v = verbosDaLinha(linha);
  const largar = v.outros.find((a) => a.id === "soltar") || null;
  const outros = v.outros.filter((a) => a !== largar);
  const fazer = (fz) => () => { try { fz(); } catch (e) { /* o App avisa; nunca custa o turno */ } };
  let principal = null;
  if (noCorpo) {
    const pode = !cmp || cmp.troca.ok;
    principal = { rotulo: ENCAIXE.tirar[slot] || "Tirar", pode, razao: pode ? fraseDaTroca(slot) : `agora não: ${cmp.troca.motivo}`, fazer: () => aoDesequipar && aoDesequipar(slot) };
  } else if (slotDoItem && cmp) {
    /* conserto V7/V8 (19/11): o preço de usar o que não se sabe vai no botão,
       antes do clique — «com desvantagem», e a razão na lista acima */
    const pesa = arr(cmp.penalidades).length > 0;
    principal = { rotulo: rotuloDoEquipar(cmp.linhas), pode: !!cmp.troca.ok, razao: cmp.troca.ok ? (pesa ? `▼ com desvantagem · ${fraseDaTroca(slotDoItem)}` : fraseDaTroca(slotDoItem)) : `agora não: ${cmp.troca.motivo}`, fazer: () => aoEquipar && aoEquipar(item, slotDoItem) };
  } else if (v.principal) {
    principal = { rotulo: v.principal.rotulo, pode: true, razao: v.principal.dica || "", fazer: v.principal.fazer };
  }
  const descricao = (linha && (linha.descricao || linha.nota)) || (item && typeof item === "object" ? item.descricao : "") || "";
  const penalidades = !noCorpo && cmp ? arr(cmp.penalidades) : [];
  return (
    <section ref={aoAparecer} aria-label={`O que é ${nome}`} style={{ background: T.ossoLume, borderRadius: 6, padding: telefone ? 16 : 18, boxShadow: SOMBRA_DA_MESA.erguido }}>
      <div className="flex items-start" style={{ gap: 12 }}>
        <GlifoDeItem familia={fam} tamanho={28} />
        <div className="flex flex-col min-w-0">
          <span style={{ color: T.tintaDoPergaminho, ...letraDaMesa("nome") }}>{nome}{linha && linha.qtd > 1 ? ` · ${linha.qtd}` : ""}</span>
          <span style={{ color: T.tintaDoPergaminhoDim, ...letraDaMesa("notaDoMestre") }}>{[NOME_DA_FAMILIA[fam], rar, noCorpo ? "no corpo" : ""].filter(Boolean).join(" · ")}</span>
        </div>
      </div>
      {descricao ? <p style={{ margin: "10px 0 0", color: T.tintaDoPergaminho, ...letraDaMesa("servico"), fontWeight: 400 }}>{descricao}</p> : null}
      {cmp && arr(cmp.linhas).length ? (
        <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none" }}>
          {cmp.linhas.map((l) => (
            <li key={l.id} style={{ color: l.sinal === "ok" ? T.musgoNoPergaminho : l.sinal === "danger" ? T.perigoNoPergaminho : T.tintaDoPergaminho, ...letraDaMesa("servico") }}>
              {l.sinal === "ok" ? "▲" : l.sinal === "danger" ? "▼" : "="} {l.rotulo}: {l.antes} → {l.depois}
            </li>
          ))}
        </ul>
      ) : null}
      {penalidades.map((pen) => (
        <p key={pen.texto} style={{ margin: "8px 0 0", color: T.perigoNoPergaminho, ...letraDaMesa("servico"), fontWeight: 400 }}><span aria-hidden="true">▼ </span>{fraseDaPenalidade(pen)}</p>
      ))}
      {cmp && cmp.dorme ? <p style={{ margin: "8px 0 0", color: T.tintaDoPergaminhoDim, ...letraDaMesa("notaDoMestre") }}>Pede sintonia: até lá serve de peça, e o poder dorme.</p> : null}
      <div className="flex flex-wrap items-center" style={{ gap: 12, marginTop: 14 }}>
        {principal ? (
          <button type="button" onClick={principal.pode ? fazer(principal.fazer) : undefined} aria-disabled={principal.pode ? "false" : "true"}
            className="tv-anel-foco flex flex-col items-start"
            style={{ minHeight: 52, padding: "8px 18px", borderRadius: 4, cursor: principal.pode ? "pointer" : "default",
              background: principal.pode ? T.amber : "transparent", border: `1px solid ${principal.pode ? T.brasaNoPergaminho : T.tintaDoPergaminho}`, color: principal.pode ? T.onAccent : T.tintaDoPergaminho }}>
            <span style={letraDaMesa("rotulo")}>{principal.rotulo}</span>
            {principal.razao ? <span style={{ ...letraDaMesa("notaDoMestre"), color: principal.pode ? T.onAccent : T.perigoNoPergaminho }}>{principal.razao}</span> : null}
          </button>
        ) : null}
        {outros.map((a) => (
          <button key={a.id} type="button" onClick={fazer(a.fazer)} className="tv-anel-foco flex flex-col items-start"
            style={{ minHeight: 44, padding: "6px 12px", borderRadius: 4, background: "transparent", border: `1px solid ${T.tintaDoPergaminho}`, color: T.tintaDoPergaminho, cursor: "pointer" }}>
            <span style={letraDaMesa("servico")}>{a.rotulo}</span>
            {a.dica ? <span style={{ ...letraDaMesa("notaDoMestre"), color: T.tintaDoPergaminhoDim }}>{a.dica}</span> : null}
          </button>
        ))}
        {linha && linha.dar && arr(linha.dar.destinos).map((d) => (
          <button key={d} type="button" onClick={fazer(() => linha.dar.fazer(d))} className="tv-anel-foco"
            style={{ minHeight: 44, padding: "6px 12px", borderRadius: 4, background: "transparent", border: `1px solid ${T.tintaDoPergaminho}`, color: T.tintaDoPergaminho, cursor: "pointer", ...letraDaMesa("servico") }}>
            Dar a {d}
          </button>
        ))}
        {largar ? (
          <span className="flex items-center" style={{ gap: 8 }}>
            <button type="button" onClick={fazer(largar.fazer)} className="tv-anel-foco"
              style={{ minHeight: 44, padding: "0 6px", background: "transparent", border: 0, textDecoration: "underline", color: T.tintaDoPergaminho, cursor: "pointer", ...letraDaMesa("servico") }}>Largar</button>
            <span style={{ color: T.tintaDoPergaminhoDim, ...letraDaMesa("notaDoMestre") }}>não tem volta</span>
          </span>
        ) : null}
      </div>
    </section>
  );
}

/* Props: personagem (a carta: equipados, atributos, vida, mana, xp,
   habilidades) · linhas (o que se leva, com as ações do App: { chave, nome,
   qtd, nota, descricao, item?, peca?, acoes, dar }) · aoEquipar(item, slot) ·
   aoDesequipar(slot) · aoSubirAtributo(id) · mantimentos (o objeto da
   carta: racoes, agua, tochas, bocas, dias, exaustao, aoForragear, bloqueado)
   · moedas · dividas ([{ texto, vencida }], dividas-na-mesa.js) · pessoas/quem/aoTrocarQuem (de quem é a bolsa) · oficina (a
   bancada e a forja, um elemento) · lex · aoPousar. */
export function PainelBolsa({ personagem, linhas = [], aoEquipar = null, aoDesequipar = null, aoSubirAtributo = null, mantimentos = null, moedas = 0, dividas = null,
  pessoas = null, quem = "eu", aoTrocarQuem = null, oficina = null, lex = null, aoPousar = null }) {
  const p = personagem || {};
  const j = useJanela();
  const telefone = j.l < OBJETO_ABERTO.corteDoTelefone;
  const [sel, setSelCru] = React.useState(null); /* { tipo: "linha", chave } | { tipo: "corpo", slot } */
  /* cada toque numa peça conta (mesmo a mesma peça outra vez): é ele que traz o cartão à vista */
  const [toque, setToque] = React.useState(0);
  const setSel = (x) => { setSelCru(x); setToque((n) => n + 1); };
  const [verOficina, setVerOficina] = React.useState(false);
  const eq = p.equipados || {};
  const ordem = ordemDaMochila(linhas);
  const mochila = casasDaMochila(ordem);
  let escolha = null;
  if (sel && sel.tipo === "linha") {
    const l = ordem.find((x) => x.chave === sel.chave);
    if (l) escolha = { nome: l.nome, item: l.item || l.nome, linha: l };
  } else if (sel && sel.tipo === "corpo" && eq[sel.slot]) {
    escolha = { nome: eq[sel.slot].nome, item: eq[sel.slot], slot: sel.slot, noCorpo: true, linha: null };
  }
  const ca = (() => { try { return caDoHeroi(p); } catch (e) { return null; } })();
  let discos = [];
  try { discos = discosDaFicha(p); } catch (e) { discos = []; }
  let xpMax = 0;
  try { xpMax = XP_POR_NIVEL(p.nivel || 1); } catch (e) { xpMax = 0; }
  const talentos = arr(p.habilidades).filter(Boolean).map((h) => (typeof h === "string" ? { nome: h, custo: 0 } : h));
  const lado = telefone ? CASA.telefone : CASA.mochila;

  const casaDoCorpo = (slot) => {
    const item = eq[slot] || null;
    return (
      <div key={slot} className="flex flex-col items-center" style={{ gap: 6 }}>
        <CasaDeItem item={item} lado={lado} glifoVazio={GLIFO_DO_LUGAR[slot]} escolhida={!!sel && sel.tipo === "corpo" && sel.slot === slot}
          rotulo={`${ENCAIXE.nomes[slot]}: ${item ? item.nome : "vazio"}`} aoTocar={() => setSel({ tipo: "corpo", slot })} />
        {!telefone ? <span style={{ color: T.inkMeio, ...letraDaMesa("rotulo") }}>{ENCAIXE.nomes[slot]}</span> : null}
      </div>
    );
  };
  const vazioDoCorpo = sel && sel.tipo === "corpo" && !eq[sel.slot]
    ? <p style={{ margin: 0, color: T.inkMeio, ...letraDaMesa("notaDoMestre") }}>Nada no lugar de {String(ENCAIXE.nomes[sel.slot] || "").toLowerCase()}. Toque numa peça da mochila para ver se serve.</p> : null;

  const heroi = (
    <div className="flex flex-col" style={{ gap: 12 }}>
      <div className={telefone ? "flex items-start" : "flex flex-col items-center"} style={{ gap: 14 }}>
        <CartaDoHeroi p={p} largura={telefone ? 120 : 240} lex={lex} />
        <div className="flex flex-col min-w-0" style={{ gap: 4, alignItems: telefone ? "flex-start" : "center", textAlign: telefone ? "left" : "center" }}>
          <span style={{ color: T.ink, ...letraDaMesa("nome") }}>{p.nome || "Você"}</span>
          <span style={{ color: T.inkMeio, ...letraDaMesa("servico"), fontWeight: 400 }}>{[p.classe, p.subclasse, p.raca, `nível ${p.nivel || 1}`].filter(Boolean).join(" · ")}</span>
          {ca != null ? <span style={{ color: T.ink, ...letraDaMesa("nome") }}>CA {ca}</span> : null}
        </div>
      </div>
      <Contas rotulo="PV" atual={p.vida} max={p.vidaMax} cor={T.lacreLume} vazia={T.lacreSombra} />
      {(Number(p.manaMax) || 0) > 0 ? <Contas rotulo="PM" atual={p.mana} max={p.manaMax} cor={T.violet} vazia={T.violetaSombra} /> : null}
      {xpMax > 0 ? <Trilho atual={p.xp || 0} max={xpMax} /> : null}
      {Array.isArray(pessoas) && pessoas.length > 1 && aoTrocarQuem ? (
        <div role="group" aria-label="De quem é a bolsa" className="flex flex-wrap" style={{ gap: 8, marginTop: 4 }}>
          {pessoas.map((x) => (
            <button key={x.id} type="button" onClick={() => { try { aoTrocarQuem(x.id); } catch (e) { /* segue */ } }} aria-pressed={x.id === quem ? "true" : "false"}
              className="tv-anel-foco" style={{ minHeight: 44, padding: "0 12px", borderRadius: 22, cursor: "pointer", background: x.id === quem ? T.osso : "transparent", color: x.id === quem ? T.tintaDoPergaminho : T.ink, border: `1px solid ${x.id === quem ? T.osso : alfa(T.latao, 0.7)}`, ...letraDaMesa("servico") }}>
              {x.rotulo}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );

  const corpo = (
    <section aria-label="No corpo" className="flex flex-col">
      <Rotulo>No corpo{ca != null ? ` · CA ${ca}` : ""}</Rotulo>
      {telefone ? (
        <div className="flex" style={{ gap: 4 }}>{ORDEM_DO_CORPO.map(casaDoCorpo)}</div>
      ) : (
        <div className="grid items-start" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div className="flex flex-col items-center" style={{ gap: 14, paddingTop: 36 }}>{CORPO_DA_BOLSA.esquerda.map(casaDoCorpo)}</div>
          <div className="flex flex-col items-center" style={{ gap: 14 }}>
            {CORPO_DA_BOLSA.centro.map(casaDoCorpo)}
            <svg aria-hidden="true" width="72" height="170" viewBox="0 0 72 170"><circle cx="36" cy="24" r="20" fill={T.couroAlto} /><path d="M4 170c0-70 12-110 32-110s32 40 32 110z" fill={T.couroAlto} /></svg>
          </div>
          <div className="flex flex-col items-center" style={{ gap: 14, paddingTop: 36 }}>{CORPO_DA_BOLSA.direita.map(casaDoCorpo)}</div>
        </div>
      )}
      {telefone ? null : vazioDoCorpo}
    </section>
  );

  const atributos = discos.length ? (
    <section aria-label="Atributos">
      <Rotulo>Atributos</Rotulo>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "10px 12px" }}>
        {discos.map((d) => {
          const sobe = d.aceita && aoSubirAtributo;
          const peca = (
            <span className="inline-flex items-center justify-center" style={{ width: 44, height: 44, flex: "none", borderRadius: "50%", background: T.osso, boxShadow: SOMBRA_DA_MESA.peca, color: T.tintaDoPergaminho, ...letraDaMesa("contagem"), textTransform: "none" }}>{d.texto}</span>
          );
          return sobe ? (
            <button key={d.id} type="button" onClick={() => { try { aoSubirAtributo(d.id); } catch (e) { /* o App avisa */ } }} className="tv-anel-foco flex items-center text-left"
              style={{ gap: 8, background: "transparent", border: 0, padding: 0, cursor: "pointer" }} aria-label={`Subir ${d.nome}${d.linha ? `, ${d.linha}` : ""}`}>
              {peca}<span className="flex flex-col"><span style={{ color: T.ink, ...letraDaMesa("servico") }}>{d.nome}</span><span style={{ color: T.amberSoft, ...letraDaMesa("notaDoMestre") }}>subir{d.linha ? ` · ${d.linha}` : ""}</span></span>
            </button>
          ) : (
            <div key={d.id} className="flex items-center" style={{ gap: 8 }}>
              {peca}<span className="flex flex-col"><span style={{ color: T.ink, ...letraDaMesa("servico") }}>{d.nome}</span>{d.linha ? <span style={{ color: T.inkMeio, ...letraDaMesa("notaDoMestre") }}>{d.linha}</span> : null}</span>
            </div>
          );
        })}
      </div>
    </section>
  ) : null;

  const listaDeTalentos = talentos.length ? (
    <section aria-label="Talentos e habilidades">
      <Rotulo>Talentos e habilidades</Rotulo>
      <div className="flex flex-col" style={{ gap: 6 }}>
        {talentos.map((h, i) => (
          <div key={(h.nome || "") + i} className="flex items-center" title={h.descricao || undefined}
            style={{ minHeight: 44, gap: 10, padding: "0 12px", borderRadius: 4, background: T.couroAlto }}>
            <span style={{ flex: 1, color: T.ink, ...letraDaMesa("servico") }}>{h.nome}</span>
            {h.custo ? <span style={{ color: T.inkMeio, ...letraDaMesa("notaDoMestre") }}>{h.custo} PM</span> : null}
          </div>
        ))}
      </div>
    </section>
  ) : null;

  const m = mantimentos;
  const carga = (
    <div className="flex flex-col" style={{ gap: 18 }}>
      <section aria-label="Na mochila">
        <Rotulo>Na mochila · {mochila.rotulo}</Rotulo>
        {mochila.usadas ? null : <p style={{ margin: "0 0 10px", color: T.inkMeio, ...letraDaMesa("notaDoMestre") }}>A mochila está vazia. Explore, negocie ou saqueie.</p>}
        <div className="grid" style={{ gridTemplateColumns: `repeat(auto-fill, ${lado}px)`, gap: telefone ? 6 : 8 }}>
          {mochila.casas.map((l, i) => l ? (
            <CasaDeItem key={l.chave} item={l.item || l.nome} familia={familiaDoItem(l.item || l.nome)} lado={lado} qtd={l.qtd || 0}
              escolhida={!!sel && sel.tipo === "linha" && sel.chave === l.chave} rotulo={`${l.nome}${l.qtd > 1 ? `, ${l.qtd}` : ""}`}
              aoTocar={() => setSel({ tipo: "linha", chave: l.chave })} />
          ) : <CasaDeItem key={"vazia" + i} lado={lado} />)}
        </div>
      </section>
      {telefone && vazioDoCorpo ? vazioDoCorpo : null}
      {escolha ? <FichaDoItem escolha={escolha} personagem={p} aoEquipar={aoEquipar} aoDesequipar={aoDesequipar} telefone={telefone} toque={toque} />
        : !telefone ? <p style={{ margin: 0, color: T.inkMeio, ...letraDaMesa("notaDoMestre") }}>Toque numa peça para ver o que ela é e o que faz.</p> : null}
      {m ? (
        <section aria-label="Mantimentos">
          <Rotulo cor={(Number(m.dias) || 0) <= 1 ? T.danger : T.inkMeio}>Mantimentos · {m.dias || 0} {m.dias === 1 ? "dia" : "dias"} para {m.bocas || 1} {m.bocas === 1 ? "boca" : "bocas"}</Rotulo>
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            <PecaDeRecurso tipo="racoes" quantidade={m.racoes || 0} />
            <PecaDeRecurso tipo="agua" quantidade={m.agua || 0} />
            <PecaDeRecurso tipo="tochas" quantidade={m.tochas || 0} />
            <PecaDeRecurso tipo="moedas" quantidade={moedas || 0} />
          </div>
          {m.exaustao && m.exaustao.nivel > 0 ? <p style={{ margin: "6px 0 0", color: T.danger, ...letraDaMesa("notaDoMestre") }}>Exaustão {m.exaustao.nivel}: {m.exaustao.efeito}</p> : null}
          {/* 25/11 (etapa 9, dívidas na mesa): o que você deve e o que lhe devem, em texto simples, na forma da linha de cima */}
          {arr(dividas).map((d, i) => d && d.texto ? <p key={"divida" + i} style={{ margin: "6px 0 0", color: d.vencida ? T.danger : T.inkMeio, ...letraDaMesa("notaDoMestre") }}>{d.texto}</p> : null)}
          {m.aoForragear ? (
            <button type="button" onClick={m.bloqueado ? undefined : () => { try { m.aoForragear(); } catch (e) { /* segue */ } }} aria-disabled={m.bloqueado ? "true" : "false"}
              className="tv-anel-foco" style={{ marginTop: 8, minHeight: 44, padding: "0 14px", borderRadius: 4, background: "transparent", border: `1px solid ${alfa(T.latao, 0.8)}`, color: m.bloqueado ? T.inkDim : T.ink, cursor: m.bloqueado ? "default" : "pointer", ...letraDaMesa("servico") }}>
              Forragear · meio dia, Percepção
            </button>
          ) : null}
        </section>
      ) : null}
      {oficina ? (
        <section aria-label="A bancada e a forja">
          <button type="button" onClick={() => setVerOficina((v) => !v)} aria-expanded={verOficina ? "true" : "false"} className="tv-anel-foco w-full text-left"
            style={{ minHeight: 44, padding: "0 12px", borderRadius: 4, background: "transparent", border: `1px dashed ${alfa(T.latao, 0.7)}`, color: T.ink, cursor: "pointer", ...letraDaMesa("rotulo") }}>
            {verOficina ? "Fechar a bancada e a forja" : "A bancada e a forja"}
          </button>
          {verOficina ? <div className="flex flex-col" style={{ gap: 10, marginTop: 10 }}>{oficina}</div> : null}
        </section>
      ) : null}
    </div>
  );

  return (
    <ObjetoAberto objeto="bolsa" titulo="A bolsa" aoPousar={aoPousar}>
      {telefone ? (
        <div className="flex flex-col relative" style={{ gap: 20, padding: "22px 12px 26px" }}>
          {heroi}{corpo}{carga}{atributos}{listaDeTalentos}
        </div>
      ) : (
        /* conserto V7/V8 (19/11): cada coluna rola por dentro, na altura do
           objeto — em 800 de altura nada fica cortado embaixo da moldura */
        <div className="flex-1 min-h-0 relative" style={{ padding: `${OBJETO_ABERTO.conteudo}px 0 ${OBJETO_ABERTO.conteudo}px ${OBJETO_ABERTO.conteudo}px` }}>
          <div className="grid h-full" style={{ gridTemplateColumns: "minmax(0, 260px) minmax(0, 340px) minmax(0, 1fr)", gridTemplateRows: "minmax(0, 1fr)", gap: 36 }}>
            <div className="min-h-0 overflow-y-auto tv-scroll" style={{ overflowX: "hidden", paddingBottom: 8 }}>{heroi}</div>
            <div className="min-h-0 overflow-y-auto tv-scroll flex flex-col" style={{ overflowX: "hidden", gap: 22, paddingBottom: 8 }}>{corpo}{atributos}{listaDeTalentos}</div>
            <div className="min-h-0 overflow-y-auto tv-scroll" style={{ overflowX: "hidden", paddingRight: OBJETO_ABERTO.conteudo, paddingBottom: 8 }}>{carga}</div>
          </div>
        </div>
      )}
    </ObjetoAberto>
  );
}
