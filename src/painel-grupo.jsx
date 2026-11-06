/* ============================================================
   O GRUPO (AR5 · 06/11/2026) — as cartas dos companheiros
   formas.md §AR 4, §AR 5, §AR 6, §AR 7 · Figma «AR · 05/11»: 281:1947
   (1905), 281:2439 (1280), 281:2922 (375); a carta 272:392, a porta 281:1859.

   A pessoa: «principalmente as abas grupo e talentos… precisam ser
   chamativas e com elementos de jogos». Antes era um cartão de lista por
   companheiro; agora cada um é uma CARTA grande:

   · a `Moldura` em carta, do lado do companheiro (o fio azul), com o nome
     na placa (na mesa) ou ao lado (no telefone);
   · PV e PM em barras, e O VÍNCULO com os quatro marcos de MARCOS_VINCULO à
     vista como losangos (ouro os alcançados) e a linha do próximo;
   · «Sabe fazer»: as habilidades dele com o mesmo `NoDeTalento` da árvore
     (uma ação, uma forma), e o toque num nó diz o que ele faz e o que custa;
   · as duas portas: «Abrir a bolsa de X» (a carta dele, no boneco) e «Ver a
     ficha» (a mesma carta, na ficha);
   · e as ações de sempre, que não se perdem: trilhar (ou definir) o
     caminho, e tirar do grupo — esta com o veredito antes do clique.

   Saiu do App.jsx (cada tela que sai compra independência), e levou consigo
   o `SeletorCaminho`, que o App ainda usa para o herói. Nenhuma regra mora
   aqui: o vínculo é o de vinculos.js, o custo do caminho é o que o App
   cobra, e cada ação é a do App, por prop.
   ============================================================ */
import React from "react";
import { T, MAX_COMPANHEIROS } from "./constantes.js";
import {
  TIPOS, ALVOS, alfa, MOLDURA_POR_DEGRAU, ENCAIXE, ICONES_DO_TALENTO, NO_DE_TALENTO,
  CABECALHO_DA_TELA, CARTA_DO_COMPANHEIRO, FICHA_CARTA, VB_DA_MOLDURA, TAMANHOS_DA_MOLDURA,
} from "./estilo.js";
import { Retrato } from "./ui.jsx";
import { CabecalhoDaTela, NoDeTalento } from "./painel-ar-pecas.jsx";
import { Moldura } from "./painel-moldura.jsx";
import { caDoHeroi } from "./painel-equipamento.jsx";
import { molduraDe } from "./moldura.js";
import { sementeDe, estadoDe } from "./semente.js";
import { VINCULO_INICIAL, VINCULO_MAX, MARCOS_VINCULO, marcoDe, proximoMarco } from "./vinculos.js";
import { magiaPorNome } from "./grimorio.js";
import { CLASSES, PROFISSOES, racasDoGenero, classePorNome } from "./classes.js";
import { racaNaFicha, profissaoNaFicha, generoProprio } from "./lexico.js";
import { cenarioAtivo } from "./cenario.js";

const C = CARTA_DO_COMPANHEIRO;
const OURO = MOLDURA_POR_DEGRAU.ouro;
/* o corte entre a mesa e o telefone sai da própria carta: cabe uma carta da
   mesa com as margens do cabeçalho, ou é o telefone */
const CORTE_DA_MESA = C.largura.mesa + 2 * CABECALHO_DA_TELA.mesa.lado;

const nomeDe = (h) => (typeof h === "string" ? h : (h && h.nome) || "");
const glifoDe = (h) => (h && typeof h === "object" && ICONES_DO_TALENTO[h.tipo] ? h.tipo : "utilidade");
const ramoDe = (h) => { try { return magiaPorNome(nomeDe(h)) ? "magia" : "classe"; } catch (e) { return "classe"; } };
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

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

/* A CARTA NA MOLDURA do lado do companheiro; na mesa, o nome na placa */
function CartaDoRosto({ c, largura, comPlaca }) {
  let m = null;
  try { m = molduraDe(c, "companheiro"); } catch (e) { m = null; }
  const rosto = (lado) => <Retrato semente={sementeDe(c)} ente={c} tamanho={lado} anel={null} estado={estadoDe(c.vida, c.vidaMax)} semCarta />;
  if (!m) return rosto(largura);
  const vb = VB_DA_MOLDURA.carta, k = largura / TAMANHOS_DA_MOLDURA.carta.largura, pl = FICHA_CARTA.placa;
  return (
    <div className="relative shrink-0" style={{ width: vb[2] * k, height: vb[3] * k }}>
      <Moldura tamanho="carta" aro={largura} degrau={m.degrau} lado="companheiro" gema={m.gema} selo={m.selo} nivel={c.nivel || 1} ca={caDoHeroi(c)}>{rosto}</Moldura>
      {comPlaca ? (
        <div className="absolute flex items-center justify-center" style={{ left: (pl.x - vb[0]) * k, top: (pl.y - vb[1]) * k, width: pl.largura * k, height: pl.altura * k }}>
          <span aria-hidden="true" className="tv-titulo truncate" style={{ fontSize: C.nomeNaPlaca.mesa, color: OURO.claro, maxWidth: "100%", padding: `0 ${C.enchimento.telefone / 2}px` }}>{c.nome}</span>
        </div>
      ) : null}
    </div>
  );
}

/* UMA BARRA: o rótulo, a pista e o número, numa linha só */
function BarraDaCarta({ rotulo, atual, max, cor }) {
  const pct = Math.max(0, Math.min(100, ((Number(atual) || 0) / (Number(max) || 1)) * 100));
  return (
    <div className="flex items-center tv-mono" style={{ gap: C.barra, fontSize: TIPOS.maquina, color: T.inkDim }}>
      <span style={{ minWidth: C.barra * 3 }}>{rotulo}</span>
      <span className="flex-1 rounded-full overflow-hidden" style={{ height: C.barra, background: T.bg, border: `1px solid ${T.lineStrong}` }}>
        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: cor }} />
      </span>
      <span style={{ color: T.ink }}>{atual ?? 0}/{max ?? 0}</span>
    </div>
  );
}

/* O VÍNCULO: a pista em violeta e os quatro marcos como losangos — a forma
   diz alcançado (cheio, ouro) ou por alcançar (vazio, com aro); a cor é a
   segunda leitura. O marco que se alcança com a tela aberta acende (§AR 7). */
export function PistaDoVinculo({ vinculo }) {
  const v = Math.max(0, Math.min(VINCULO_MAX, Number(vinculo) || 0));
  const m = marcoDe(v), prox = proximoMarco(v);
  const alcancados = MARCOS_VINCULO.filter((x) => v >= x.valor).length;
  const antes = React.useRef(alcancados);
  const acendeu = alcancados > antes.current ? alcancados - 1 : -1;
  React.useEffect(() => { antes.current = alcancados; }, [alcancados]);
  const L = C.marco.lado;
  return (
    <div className="flex flex-col" style={{ gap: C.barra / 2 }}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.inkMeio }}>Vínculo · {m ? m.nome : "conhecido"}</span>
        <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}>{prox ? `${v} → ${prox.nome} aos ${prox.valor}` : `${v} · o máximo`}</span>
      </div>
      <div className="relative" role="img" aria-label={`Vínculo ${v} de ${VINCULO_MAX}; ${plural(alcancados, "marco alcançado", "marcos alcançados")} de ${MARCOS_VINCULO.length}`}
        style={{ height: L + 2, marginRight: L / 2 }}>
        <span className="absolute left-0 right-0 rounded-full" style={{ top: (L + 2 - C.barra / 2) / 2, height: C.barra / 2, background: T.lineStrong }} />
        <span className="absolute left-0 rounded-full" style={{ top: (L + 2 - C.barra / 2) / 2, height: C.barra / 2, width: `${(v / VINCULO_MAX) * 100}%`, background: T.violet }} />
        {MARCOS_VINCULO.map((x, i) => {
          const ok = v >= x.valor;
          return (
            <span key={x.valor} data-marco={x.nome} data-alcancado={ok ? "sim" : "nao"} className={i === acendeu ? "tv-marco-acende absolute" : "absolute"}
              style={{
                left: `calc(${(x.valor / VINCULO_MAX) * 100}% - ${L / 2}px)`, top: 1, width: L, height: L, transform: "rotate(45deg) scale(0.8)",
                background: ok ? C.marco.alcancado : C.marco.porAlcancar, border: `1.5px solid ${ok ? OURO.claro : T.lineStrong}`,
              }} />
          );
        })}
      </div>
    </div>
  );
}

/* SABE FAZER: as habilidades dele com o nó da árvore; o toque diz o quê */
function SabeFazer({ c, telefone }) {
  const habs = (c.habilidades || []).filter((h) => nomeDe(h));
  const [todas, setTodas] = React.useState(false);
  const [sel, setSel] = React.useState(null);
  if (!habs.length) return null;
  const vistas = todas ? habs : habs.slice(0, C.sabeFazer);
  const h = sel != null ? habs.find((x) => nomeDe(x) === sel) : null;
  const largura = telefone ? NO_DE_TALENTO.largura.telefone : NO_DE_TALENTO.largura.mesa;
  return (
    <div className="flex flex-col" style={{ gap: C.barra }}>
      <span className="tv-mono uppercase" style={{ fontSize: TIPOS.maquina, letterSpacing: "0.12em", color: T.inkDim }}>Sabe fazer</span>
      <div className="flex flex-wrap" style={{ gap: C.barra, justifyContent: telefone ? "space-around" : "flex-start" }}>
        {vistas.map((x) => (
          <NoDeTalento key={nomeDe(x)} ramo={ramoDe(x)} estado="aprendido" nome={nomeDe(x)} glifo={glifoDe(x)} largura={largura}
            escolhido={sel === nomeDe(x)} rotuloDoEstado="sabe fazer" aoTocar={() => setSel(sel === nomeDe(x) ? null : nomeDe(x))} />
        ))}
      </div>
      {h ? (
        <p className="tv-body" style={{ margin: 0, fontSize: TIPOS.rotulo, color: T.inkMeio }}>
          <span style={{ color: T.ink }}>{nomeDe(h)}</span>
          {typeof h === "object" && h.custo != null ? <span className="tv-mono" style={{ color: T.violetSoft }}> · {h.custo} PM</span> : null}
          {typeof h === "object" && h.descricao ? <> — {h.descricao}</> : null}
        </p>
      ) : null}
      {habs.length > C.sabeFazer ? (
        <button type="button" onClick={() => setTodas((v) => !v)} className="tv-anel-foco tv-mono self-start"
          style={{ minHeight: ALVOS.piso, fontSize: TIPOS.maquina, background: "transparent", border: "none", padding: 0, color: T.violetSoft }}>
          {todas ? "Só as primeiras" : `Todas as ${habs.length}`}
        </button>
      ) : null}
    </div>
  );
}

/* A PORTA: o verbo numa linha, o que se vai encontrar na segunda */
function Porta({ rotulo, nota, aoTocar }) {
  return (
    <button type="button" onClick={aoTocar} className="tv-anel-foco flex flex-col items-start text-left flex-1"
      style={{ minHeight: ALVOS.piso, minWidth: 0, padding: `${C.barra}px ${C.enchimento.telefone}px`, background: T.bg, border: `1px solid ${T.lineStrong}`, borderRadius: ENCAIXE.raio }}>
      <span className="tv-body truncate" style={{ fontSize: TIPOS.corpo, color: T.ink, maxWidth: "100%" }}>{rotulo}</span>
      {nota ? <span className="tv-mono truncate" style={{ fontSize: TIPOS.maquina, color: T.inkDim, maxWidth: "100%" }}>{nota}</span> : null}
    </button>
  );
}

/* O VERBO QUIETO (o recuo da casa): as ações de sempre, sem roubar a carta */
function VerboQuieto({ children, aoTocar, perigo = false }) {
  return (
    <button type="button" onClick={aoTocar} className="tv-anel-foco tv-mono"
      style={{ minHeight: ALVOS.piso, padding: `0 ${C.enchimento.telefone}px`, fontSize: TIPOS.maquina, borderRadius: ENCAIXE.raio,
        background: "transparent", border: `1px solid ${perigo ? T.danger : T.line}`, color: perigo ? T.danger : T.inkDim }}>
      {children}
    </button>
  );
}

/* A CARTA DO COMPANHEIRO */
export function CartaDoCompanheiro({ c, telefone = false, aoAbrirBolsa = null, aoVerFicha = null, aoTrocarCaminho = null, aoRemover = null, caminhoAberto = false, caminho = null, confirmarInicial = false }) {
  /* `confirmarInicial` abre a carta com o veredito de tirar à vista: a porta da suíte */
  const [confirmar, setConfirmar] = React.useState(!!confirmarInicial);
  const pad = telefone ? C.enchimento.telefone : C.enchimento.mesa;
  const classe = [c.classe, c.subclasse].filter(Boolean).join(" · ");
  const naBolsa = (c.inventario || []).length;
  const barras = (
    <div className="flex flex-col" style={{ gap: C.barra / 2 }}>
      <BarraDaCarta rotulo="PV" atual={c.vida} max={c.vidaMax} cor={T.danger} />
      {(Number(c.manaMax) || 0) > 0 ? <BarraDaCarta rotulo="PM" atual={c.mana} max={c.manaMax} cor={T.violet} /> : null}
    </div>
  );
  return (
    <article data-membro={c.nome} tabIndex={-1} aria-label={c.nome} className="tv-anel-foco flex flex-col"
      style={{ width: telefone ? "100%" : C.largura.mesa, maxWidth: "100%", padding: pad, gap: pad * 0.75, background: T.panel,
        border: `1px solid ${alfa(OURO.meio, CABECALHO_DA_TELA.fio.alfa)}`, borderRadius: C.raio }}>
      {telefone ? (
        <div className="flex" style={{ gap: pad }}>
          <CartaDoRosto c={c} largura={TAMANHOS_DA_MOLDURA.carta.largura * C.retrato.telefone} comPlaca={false} />
          <div className="flex flex-col flex-1 min-w-0" style={{ gap: C.barra / 2 }}>
            <h3 className="tv-titulo truncate" style={{ margin: 0, fontSize: C.nome.telefone, color: OURO.claro }}>{c.nome}</h3>
            {classe ? <span className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.mundoSoft }}>{classe}</span> : null}
            {barras}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center" style={{ gap: C.barra }}>
            <CartaDoRosto c={c} largura={TAMANHOS_DA_MOLDURA.carta.largura * C.retrato.mesa} comPlaca />
            <h3 className="sr-only">{c.nome}</h3>
            {classe ? <span className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.mundoSoft }}>{classe}</span> : null}
          </div>
          {barras}
        </>
      )}
      {!c.invocada ? <PistaDoVinculo vinculo={c.vinculo ?? VINCULO_INICIAL} /> : null}
      <SabeFazer c={c} telefone={telefone} />
      {c.descricao ? <p className="tv-body italic" style={{ margin: 0, fontSize: TIPOS.rotulo, color: T.inkDim }}>{c.descricao}</p> : null}
      <div className={telefone ? "flex flex-col" : "flex"} style={{ gap: C.barra }}>
        {aoAbrirBolsa ? <Porta rotulo={`Abrir a bolsa de ${c.nome}`} nota={naBolsa ? plural(naBolsa, "coisa", "coisas") : "bolsos vazios"} aoTocar={() => aoAbrirBolsa(c.nome)} /> : null}
        {aoVerFicha ? <Porta rotulo="Ver a ficha" nota="atributos e talentos" aoTocar={() => aoVerFicha(c.nome)} /> : null}
      </div>
      <div className="flex flex-wrap" style={{ gap: C.barra }}>
        {aoTrocarCaminho ? <VerboQuieto aoTocar={() => aoTrocarCaminho(c.nome)}>{c.classe ? "Trilhar novo caminho" : "Definir caminho"}</VerboQuieto> : null}
        {aoRemover && !confirmar ? <VerboQuieto aoTocar={() => setConfirmar(true)}>Tirar do grupo</VerboQuieto> : null}
      </div>
      {aoRemover && confirmar ? (
        <div role="group" aria-label={`Tirar ${c.nome} do grupo`} className="flex flex-col" style={{ gap: C.barra, padding: C.barra * 1.5, background: T.bg, border: `1px solid ${T.danger}`, borderRadius: ENCAIXE.raio }}>
          <span className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.ink }}>{c.nome} deixa o grupo, e leva o que tem na bolsa.</span>
          <div className="flex flex-wrap" style={{ gap: C.barra }}>
            <VerboQuieto perigo aoTocar={() => { setConfirmar(false); aoRemover(c.nome); }}>Tirar {c.nome}</VerboQuieto>
            <VerboQuieto aoTocar={() => setConfirmar(false)}>Fica</VerboQuieto>
          </div>
        </div>
      ) : null}
      {caminhoAberto ? caminho : null}
    </article>
  );
}

/* O LUGAR LIVRE: a carta tracejada que diz onde se encontra gente */
function LugarLivre({ telefone }) {
  return (
    <div className="flex flex-col items-center justify-center text-center"
      style={{ width: telefone ? "100%" : C.largura.mesa * 0.75, maxWidth: "100%", minHeight: telefone ? ALVOS.piso * 2 : undefined, alignSelf: "stretch",
        padding: telefone ? C.enchimento.telefone : C.enchimento.mesa, gap: C.barra, border: `1px dashed ${T.lineStrong}`, borderRadius: C.raio }}>
      <span className="tv-titulo" style={{ fontSize: TIPOS.rotulo, color: OURO.claro }}>Um lugar à fogueira</span>
      <span className="tv-body" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>Quem se junta ao grupo encontra-se pelo caminho: nas tavernas, nas missões, às vezes depois de uma luta.</span>
    </div>
  );
}

/* O PAINEL. `focarEm` é o nome do companheiro que se pediu (o toque na
   mesa); `leiaute` força a mesa ou o telefone (a suíte). */
export function PainelGrupo({ personagem, mundo = null, acampado = false, trocarCaminho = null, removerDoGrupo = null, aoAbrirBolsa = null, aoVerFicha = null, aoFechar = null, focarEm = null, leiaute: leiautePedido = null }) {
  const pers = personagem || {};
  const grupo = (pers.grupo || []).filter((g) => g && g.nome);
  const raiz = React.useRef(null);
  const largura = useLarguraDe(raiz);
  const leiaute = leiautePedido || (largura >= CORTE_DA_MESA ? "mesa" : "telefone");
  const telefone = leiaute === "telefone";
  const [caminhoDe, setCaminhoDe] = React.useState(null);
  React.useEffect(() => {
    if (!focarEm || !raiz.current) return;
    try {
      const el = raiz.current.querySelector(`[data-membro="${String(focarEm).replace(/"/g, "")}"]`);
      if (el) { el.scrollIntoView({ block: "nearest" }); el.focus({ preventScroll: true }); }
    } catch { /* o foco nunca derruba a tela */ }
  }, [focarEm]);
  const n = grupo.filter((g) => !g.invocada).length;
  const livres = Math.max(0, MAX_COMPANHEIROS - n);
  const subtitulo = [plural(n, "companheiro", "companheiros"), livres ? plural(livres, "lugar livre", "lugares livres") : "o grupo está cheio", telefone ? null : "o vínculo sobe com o que fazem juntos"].filter(Boolean).join(" · ");
  const lado = telefone ? CABECALHO_DA_TELA.telefone.lado : CABECALHO_DA_TELA.mesa.lado;
  return (
    <div ref={raiz} className="flex flex-col" data-leiaute={leiaute} style={{ background: T.bg, minWidth: 0 }}>
      <CabecalhoDaTela titulo="O grupo" subtitulo={subtitulo} telefone={telefone} aoFechar={aoFechar} />
      <div className={telefone ? "flex flex-col" : "flex flex-wrap justify-center items-start"}
        style={{ padding: telefone ? lado : `${lado}px ${CABECALHO_DA_TELA.mesa.folga}px`, gap: telefone ? C.enchimento.telefone : C.enchimento.mesa }}>
        {!grupo.length ? (
          <p className="tv-body italic" style={{ margin: 0, fontSize: TIPOS.corpo, color: T.inkDim, width: "100%", textAlign: telefone ? "left" : "center" }}>Viajas sozinho — por enquanto.</p>
        ) : null}
        {grupo.map((c) => (
          <CartaDoCompanheiro key={c.nome} c={c} telefone={telefone}
            aoAbrirBolsa={aoAbrirBolsa} aoVerFicha={aoVerFicha} aoRemover={removerDoGrupo}
            aoTrocarCaminho={trocarCaminho ? (nome) => setCaminhoDe(caminhoDe === nome ? null : nome) : null}
            caminhoAberto={caminhoDe === c.nome}
            caminho={trocarCaminho ? <SeletorCaminho mundo={mundo} alvo={c.nome} atual={c} acampado={acampado} trocarCaminho={trocarCaminho} fechar={() => setCaminhoDe(null)} /> : null} />
        ))}
        {livres > 0 ? <LugarLivre telefone={telefone} /> : null}
      </div>
    </div>
  );
}

/* O SELETOR DO CAMINHO (saiu do App.jsx com o Grupo; o App usa-o ainda para
   o herói). O custo dito aqui é o que o App cobra em `trocarCaminho`. */
export function SeletorCaminho({ mundo, alvo, atual, acampado, trocarCaminho, fechar }) {
  mundo = mundo || { genero: cenarioAtivo().generos.padrao };
  const racasDisp = racasDoGenero(mundo.genero);
  const ehFuturista = ["Ficção científica", "Cyberpunk", "Pós-apocalíptico"].includes(mundo.genero);
  const [raca, setRaca] = React.useState(atual.raca || racasDisp[0].nome);
  const [classe, setClasse] = React.useState(atual.classe || CLASSES[0].nome);
  const [subclasse, setSubclasse] = React.useState(atual.subclasse || CLASSES[0].subclasses[0].nome);
  const [profissao, setProfissao] = React.useState(atual.profissao || PROFISSOES[0].nome);
  const cObj = classePorNome(classe);
  const jaTinha = !!atual.classe;
  const custo = jaTinha ? 80 : 20;
  const campo = { background: T.panelSoft, border: `1px solid ${T.line}`, color: T.ink };
  return (
    <div className="rounded-xl p-3 mt-2" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
      <div className="tv-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: T.amberSoft }}>{jaTinha ? "Trilhar novo caminho" : "Definir caminho"} · {custo} moedas</div>
      {!acampado ? (
        <div className="tv-body text-xs" style={{ color: T.danger }}>Você precisa estar acampado. Feche a ficha, monte acampamento e volte aqui.</div>
      ) : (
        <div className="space-y-2">
          <div>
            <div className="tv-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: T.inkDim }}>{ehFuturista ? "Origem" : "Raça"}</div>
            <select value={raca} onChange={(e) => setRaca(e.target.value)} className="w-full rounded-lg p-2 tv-body text-xs outline-none" style={campo}>
              {racasDisp.map((r) => <option key={r.nome} value={r.nome}>{racaNaFicha(mundo.lexico, r.nome, generoProprio(mundo))}</option>)}
            </select>
          </div>
          <div>
            <div className="tv-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: T.inkDim }}>Classe</div>
            <select value={classe} onChange={(e) => { setClasse(e.target.value); setSubclasse(classePorNome(e.target.value).subclasses[0].nome); }} className="w-full rounded-lg p-2 tv-body text-xs outline-none" style={campo}>
              {CLASSES.map((c) => <option key={c.nome} value={c.nome}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <div className="tv-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: T.inkDim }}>Caminho</div>
            <select value={subclasse} onChange={(e) => setSubclasse(e.target.value)} className="w-full rounded-lg p-2 tv-body text-xs outline-none" style={campo}>
              {(cObj?.subclasses || []).map((sc) => <option key={sc.nome} value={sc.nome}>{sc.nome}</option>)}
            </select>
          </div>
          <div>
            <div className="tv-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: T.inkDim }}>Profissão</div>
            <select value={profissao} onChange={(e) => setProfissao(e.target.value)} className="w-full rounded-lg p-2 tv-body text-xs outline-none" style={campo}>
              {PROFISSOES.map((pr) => <option key={pr.nome} value={pr.nome}>{profissaoNaFicha(mundo.lexico, pr.nome, generoProprio(mundo))}</option>)}
            </select>
          </div>
          <button onClick={() => { trocarCaminho(alvo, { raca, classe, subclasse, profissao }); fechar(); }}
            className="w-full rounded-lg py-2 tv-mono text-xs" style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>
            Confirmar · {custo} moedas
          </button>
        </div>
      )}
    </div>
  );
}
