/* ============================================================
   AR 11 · A CONSTELAÇÃO DO HERÓI (07/11/2026) — a segunda vista da aba
   Árvore dos Talentos. formas.md §AR 11 · Figma «AR · 05/11»: 298:4457
   (1905), 299:4688 (375), 300:4812 (as doze figuras), 302:4813 (acender).

   A pessoa aprovou a §AR 9 com as cores CONSTELACAO: a árvore de talentos
   desenhada como um céu — cada classe uma figura (o escudo, o cajado, a
   adaga…), cada habilidade uma estrela, e o caminho que o herói andou aceso.

   A ÁRVORE NÃO SAI: o céu é uma segunda vista dos MESMOS dados. Esta peça só
   desenha. O estado de cada estrela (acesa, disponível, por acender) e o
   nome acessível dela chegam prontos de painel-talentos.jsx, que os lê das
   regras (classes.js) pelo mesmo nó que a árvore usa; tocar numa estrela
   devolve-a ao painel, que abre o MESMO veredito da árvore.

   A geometria é FIGURAS_DA_CONSTELACAO e LUGAR_DAS_FIGURAS (estilo.js),
   copiadas tal qual de mente/figma/constelacao-geometria.mjs. Nenhuma medida
   nem cor nasce aqui.

   SEM HOOKS, de propósito: o foco do teclado (o roving tabindex) e a
   escolha moram no painel. É o que deixa a suíte chamar a peça como função
   e carregar no botão de uma estrela de verdade.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { TIPOS, CONSTELACAO, FIGURAS_DA_CONSTELACAO, LUGAR_DAS_FIGURAS, GEMA_DA_SUBCLASSE, CABECALHO_DA_TELA } from "./estilo.js";
import { hashSemente, rng } from "./semente.js";

const C = CONSTELACAO;
/* a largura média de uma letra, em ems — só para os nomes não se pisarem
   (uma estimativa de medida, não uma regra: o nome que não cabe cala) */
const LETRA = { corpo: 0.52, caixaAlta: 0.8 };

/* As estrelas e as ligações À VISTA, com a chave do nó real
   ("classe:<nome>", "sub:<Subclasse>:<nome>", "esp:<Especialização>:<nome>").
   Sem subclasse: a figura e os três braços. Com subclasse: o braço dela e os
   dois ramos. Com especialização: só o ramo escolhido. As ligações de
   nascença (null à esquerda nos dados) partem da raiz da figura, no braço, e
   da última estrela do braço, no ramo. */
export function ceuDaClasse(classe, { sub = null, esp = null } = {}) {
  const f = FIGURAS_DA_CONSTELACAO[classe];
  if (!f) return { estrelas: [], ligacoes: [] };
  const estrelas = [], ligacoes = [];
  const kc = (n) => "classe:" + n;
  const ks = (s, n) => "sub:" + s + ":" + n;
  const ke = (e, n) => "esp:" + e + ":" + n;
  for (const [n, p] of Object.entries(f.estrelas)) estrelas.push({ chave: kc(n), nome: n, ramo: "classe", p, raiz: n === f.raiz });
  for (const [a, b] of f.ligacoes) ligacoes.push({ de: kc(a), para: kc(b), ramo: "classe" });
  const subs = sub ? [sub] : Object.keys(f.bracos);
  for (const s of subs) {
    const b = f.bracos[s];
    if (!b) continue;
    const nomes = Object.keys(b.estrelas);
    nomes.forEach((n, i) => estrelas.push({ chave: ks(s, n), nome: n, ramo: "subclasse", sub: s, p: b.estrelas[n], ponta: i === nomes.length - 1 }));
    for (const [a, c] of b.ligacoes) ligacoes.push({ de: a === null ? kc(f.raiz) : ks(s, a), para: ks(s, c), ramo: "subclasse", sub: s, nascenca: a === null });
    if (!sub) continue;
    const esps = esp ? [esp] : Object.keys(b.ramos);
    for (const e of esps) {
      const r = b.ramos[e];
      if (!r) continue;
      const nr = Object.keys(r.estrelas);
      nr.forEach((n, i) => estrelas.push({ chave: ke(e, n), nome: n, ramo: "especializacao", sub: s, esp: e, p: r.estrelas[n], ponta: i === nr.length - 1 }));
      for (const [a, c] of r.ligacoes) ligacoes.push({ de: a === null ? ks(s, nomes[nomes.length - 1]) : ke(e, a), para: ke(e, c), ramo: "especializacao", sub: s, esp: e, nascenca: a === null });
    }
  }
  return { estrelas, ligacoes };
}

/* o metal de um ramo: a luz na estrela, o fio na ligação (a gema é a da subclasse) */
function metalDe(ramo, sub) {
  if (ramo === "subclasse") {
    const g = GEMA_DA_SUBCLASSE[sub];
    return g ? { luz: g.luz, fio: g.corpo } : C.metal.classe;
  }
  return C.metal[ramo] || C.metal.classe;
}

/* a ligação acende entre duas acesas; a de nascença acende com a ESCOLHA do
   ramo (formas.md §AR 11: «é a escolha que a acende, não a estrela de cima») */
function ligacaoAcesa(l, acesa, sub, esp) {
  if (l.nascenca) return l.ramo === "subclasse" ? sub === l.sub : esp === l.esp;
  return acesa(l.de) && acesa(l.para);
}

/* a vizinha mais perto numa direção, num cone de ±60° */
const DIRECOES = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
function vizinhaNaDirecao(estrelas, de, tecla) {
  const dir = DIRECOES[tecla];
  if (!dir || !de) return null;
  let melhor = null, dist = Infinity;
  for (const e of estrelas) {
    if (e.chave === de.chave) continue;
    const vx = e.p[0] - de.p[0], vy = e.p[1] - de.p[1];
    const d = Math.hypot(vx, vy);
    if (!d || (vx * dir[0] + vy * dir[1]) / d < Math.cos(Math.PI / 3)) continue;
    if (d < dist) { dist = d; melhor = e; }
  }
  return melhor;
}

/* Os nomes ao lado das estrelas, por prioridade: a escolhida, as disponíveis,
   as pontas (o nome do braço ou do ramo), as acesas. Cada nome tenta o lado
   de fora da figura, depois o outro lado, depois por baixo, depois por cima;
   o primeiro sítio que não cobre estrela nem outro nome ganha. Se nenhum
   couber, cala — o nome está no veredito e no aria-label. */
function rotulosDoCeu(estrelas, estadoDe, { X, Y, escolhida, telefone, area, bloqueios = [] }) {
  const tam = C.rotulo.tamanho;
  const afast = C.rotulo.afastamento;
  const caixas = [];
  const raioDeEstrela = C.escolhida.anel[telefone ? "telefone" : "mesa"];
  for (const e of estrelas) caixas.push({ x: X(e.p) - raioDeEstrela / 2, y: Y(e.p) - raioDeEstrela / 2, w: raioDeEstrela, h: raioDeEstrela });
  const cruza = (a) => caixas.some((b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h);
  /* o nome cabe no céu (abaixo da barra de cima) e nunca entra numa figura de trás */
  for (const b of bloqueios) caixas.push(b);
  const dentro = (a) => a.x >= area.x && a.y >= area.y && a.x + a.w <= area.x + area.w && a.y + a.h <= area.y + area.h;
  const pedidos = [];
  const quer = (e, texto, tipo, cor) => pedidos.push({ e, texto, tipo, cor });
  const esc = estrelas.find((e) => e.chave === escolhida);
  if (esc) quer(esc, esc.nome, "nome", C.rotulo.escolhida);
  if (!telefone) for (const e of estrelas) if (e !== esc && estadoDe(e).estado === "disponivel") quer(e, e.nome, "nome", C.rotulo.disponivel);
  for (const e of estrelas) {
    if (!e.ponta) continue;
    if (e.ramo === "subclasse") quer(e, e.sub, "ponta", metalDe("subclasse", e.sub).luz);
    else quer(e, e.esp, "ponta", C.rotulo.ponta.especializacao);
  }
  if (!telefone) for (const e of estrelas) if (e !== esc && estadoDe(e).estado === "acesa") quer(e, e.nome, "nome", C.rotulo.acesa);
  const saida = [];
  for (const r of pedidos) {
    const caixaAlta = r.tipo === "ponta";
    const w = r.texto.length * tam * (caixaAlta ? LETRA.caixaAlta : LETRA.corpo);
    const h = tam * 1.2;
    const cx = X(r.e.p), cy = Y(r.e.p);
    const direita = r.e.p[0] >= 0.5;
    const lados = [
      direita ? { x: cx + afast, y: cy - h / 2, ancora: "start" } : { x: cx - afast - w, y: cy - h / 2, ancora: "end" },
      direita ? { x: cx - afast - w, y: cy - h / 2, ancora: "end" } : { x: cx + afast, y: cy - h / 2, ancora: "start" },
      { x: cx - w / 2, y: cy + afast, ancora: "middle" },
      { x: cx - w / 2, y: cy - afast - h, ancora: "middle" },
    ];
    const ganhou = lados.find((l) => { const a = { x: l.x, y: l.y, w, h }; return dentro(a) && !cruza(a); });
    if (!ganhou) continue;
    caixas.push({ x: ganhou.x, y: ganhou.y, w, h });
    const tx = ganhou.ancora === "start" ? ganhou.x : ganhou.ancora === "end" ? ganhou.x + w : ganhou.x + w / 2;
    saida.push({ chave: r.tipo + ":" + r.e.chave, x: tx, y: ganhou.y + h / 2, ancora: ganhou.ancora, texto: r.texto, cor: r.cor, caixaAlta });
  }
  return saida;
}

/* as estrelas de fundo: decoração, pela semente da classe (a mesma em qualquer máquina) */
function fundoDoCeu(classe, largura, alto, telefone) {
  const sorte = rng(hashSemente("ceu|" + classe));
  const quantas = C.fundo.quantas[telefone ? "telefone" : "mesa"];
  const [r0, r1] = C.fundo.raio, [a0, a1] = C.fundo.alfa;
  return Array.from({ length: quantas }, (_, i) => ({ i, x: sorte() * largura, y: sorte() * alto, r: r0 + sorte() * (r1 - r0), a: a0 + sorte() * (a1 - a0) }));
}

/* uma figura desenhada (as ligações e as estrelas), num quadrado em (x0, y0) de lado `lado` */
function desenhoDaFigura({ classe, sub, esp, estadoDe, x0, y0, lado, telefone, aprendeu = null, fechou = false, prefixo = "", so = null }) {
  const todo = ceuDaClasse(classe, { sub, esp });
  const P = Object.fromEntries(todo.estrelas.map((e) => [e.chave, e]));
  const estrelas = so ? todo.estrelas.filter(so) : todo.estrelas;
  const ligacoes = so ? todo.ligacoes.filter((l) => P[l.para] && so(P[l.para])) : todo.ligacoes;
  const X = (p) => x0 + p[0] * lado, Y = (p) => y0 + p[1] * lado;
  const m = telefone ? "telefone" : "mesa";
  const acesa = (k) => !!P[k] && estadoDe(P[k]).estado === "acesa";
  const nova = (k) => !!aprendeu && !!P[k] && P[k].nome === aprendeu && acesa(k);
  const fios = ligacoes.map((l) => {
    const a = P[l.de], b = P[l.para];
    if (!a || !b) return null;
    const ligada = ligacaoAcesa(l, acesa, sub, esp);
    if (!ligada) {
      return <line key={prefixo + l.de + ">" + l.para} x1={X(a.p)} y1={Y(a.p)} x2={X(b.p)} y2={Y(b.p)} stroke={C.ligacao.apagada.cor} strokeWidth={C.ligacao.apagada.espessura} strokeDasharray={C.ligacao.apagada.tracejado.join(" ")} />;
    }
    /* desenha-se da vizinha acesa para a nova */
    const desenha = nova(l.para) || nova(l.de);
    const [o, d] = nova(l.de) && !nova(l.para) ? [b, a] : [a, b];
    return (
      <path key={prefixo + l.de + ">" + l.para} d={`M${X(o.p)} ${Y(o.p)} L${X(d.p)} ${Y(d.p)}`} pathLength="1" fill="none"
        className={desenha ? "tv-ceu-fio tv-ceu-reduzida" : undefined} data-ligacao="acesa"
        stroke={metalDe(l.ramo, l.sub).fio} strokeWidth={C.ligacao.acesa.espessura[m]} strokeLinecap="round" />
    );
  });
  const brilho = fechou && aprendeu && estrelas.some((e) => e.ramo === "classe" && e.nome === aprendeu)
    ? ligacoes.filter((l) => l.ramo === "classe" && ligacaoAcesa(l, acesa, sub, esp)).map((l) => (
      <path key={prefixo + "brilho:" + l.de + ">" + l.para} d={`M${X(P[l.de].p)} ${Y(P[l.de].p)} L${X(P[l.para].p)} ${Y(P[l.para].p)}`} pathLength="1" fill="none"
        className="tv-ceu-brilho" stroke={C.metal.classe.luz} strokeWidth={C.ligacao.acesa.espessura[m] + 1} strokeLinecap="round" />
    )) : null;
  const pontos = estrelas.map((e) => {
    const { estado } = estadoDe(e);
    const cx = X(e.p), cy = Y(e.p);
    const luz = metalDe(e.ramo, e.sub).luz;
    if (estado === "acesa") {
      const n = nova(e.chave);
      return (
        <g key={prefixo + e.chave} data-estrela={estado} className={n ? "tv-ceu-reduzida" : undefined}>
          <circle cx={cx} cy={cy} r={C.acesa.halo.raio[m]} fill={luz} fillOpacity={C.acesa.halo.alfa} className={n ? "tv-ceu-halo" : undefined} />
          <circle cx={cx} cy={cy} r={C.acesa.raio[m]} fill={luz} className={n ? "tv-ceu-acende" : undefined} />
        </g>
      );
    }
    if (estado === "disponivel") {
      return (
        <g key={prefixo + e.chave} data-estrela={estado}>
          <circle cx={cx} cy={cy} r={C.disponivel.anel[m]} fill="none" stroke={C.disponivel.cor} strokeWidth={C.disponivel.espessura} />
          <circle cx={cx} cy={cy} r={C.porAcender.raio[m]} fill={C.porAcender.cor} />
        </g>
      );
    }
    return <circle key={prefixo + e.chave} data-estrela="porAcender" cx={cx} cy={cy} r={C.porAcender.raio[m]} fill={C.porAcender.cor} />;
  });
  return { estrelas, fios, brilho, pontos, X, Y };
}

/* a moldura do céu, por leiaute: o quadrado, a barra de cima e onde moram as figuras de trás */
export function medidasDoCeu(leiaute, largura, quantasAtras) {
  const telefone = leiaute === "telefone";
  const m = telefone ? "telefone" : "mesa";
  /* na mesa o quadrado mora a 24 da borda (a margem da tela); no telefone,
     ao centro da área (343 a 375; a gaveta de 320 encolhe-o) */
  const lado = telefone && largura > 0 ? Math.min(C.lado.telefone, largura) : C.lado[m];
  const x0 = telefone ? Math.max(0, ((largura > 0 ? largura : lado) - lado) / 2) : CABECALHO_DA_TELA.mesa.lado;
  const y0 = C.topo[m];
  const lugares = quantasAtras >= 2 ? LUGAR_DAS_FIGURAS[m].tres : quantasAtras === 1 ? LUGAR_DAS_FIGURAS[m].duas : [LUGAR_DAS_FIGURAS[m].duas[0]];
  const atras = lugares.slice(1).map((l) => ({ x: x0 + l.x * lado, y: y0 + l.y * lado, lado: l.escala * lado }));
  const largo = Math.max(x0 + lado + x0, ...atras.map((a) => a.x + a.lado + x0));
  const alto = Math.max(y0 + lado, ...atras.map((a) => a.y + a.lado)) + C.topo[m] / 2;
  return { telefone, m, x0, y0, lado, atras, largo, alto };
}

/* ---------------- O CÉU ----------------
   `estadoDaEstrela(classe, estrela)` → { estado: "acesa" | "disponivel" |
   "porAcender", rotulo } vem do painel (as regras). `atras` são as outras
   classes do herói (a figura de trás é UM botão: tocar traz para a frente). */
export function CeuDoHeroi({
  classe, sub = null, esp = null, estadoDaEstrela, atras = [], leiaute = "mesa", largura = 0,
  escolhida = null, foco = null, aoFocar = null, aoTocarEstrela = null, aoTrazer = null,
  aprendeu = null, fechou = false, saindo = null, aoAcabarSaida = null, verbo = null, aviso = null, popover = null,
}) {
  const f = FIGURAS_DA_CONSTELACAO[classe];
  if (!f) return null;
  const estadoDe = (e) => {
    try { return (estadoDaEstrela && estadoDaEstrela(classe, e)) || { estado: "porAcender", rotulo: e.nome }; } catch { return { estado: "porAcender", rotulo: e.nome }; }
  };
  const M = medidasDoCeu(leiaute, largura, atras.length);
  const { telefone, m, x0, y0, lado } = M;
  const fig = desenhoDaFigura({ classe, sub, esp, estadoDe, x0, y0, lado, telefone, aprendeu, fechou });
  const { estrelas, X, Y } = fig;
  const acesas = estrelas.filter((e) => estadoDe(e).estado === "acesa").length;
  /* os braços que saem quando a subclasse acabou de ser escolhida (320 ms) */
  const saida = saindo && sub && saindo.sub === sub
    ? desenhoDaFigura({ classe, sub: null, esp: null, estadoDe: () => ({ estado: "porAcender" }), x0, y0, lado, telefone, prefixo: "sai:",
      so: (e) => e.ramo === "subclasse" && e.sub !== sub }) : null;

  /* a paragem do teclado: a que tem o foco, a escolhida, a primeira disponível, a raiz */
  const existe = (k) => estrelas.some((e) => e.chave === k);
  const paragem = (foco && existe(foco) && foco) || (escolhida && existe(escolhida) && escolhida)
    || (estrelas.find((e) => estadoDe(e).estado === "disponivel") || {}).chave
    || (estrelas.find((e) => e.raiz) || estrelas[0] || {}).chave;
  /* o alvo: min(44, distância à vizinha mais perto) */
  const alvoDe = (e) => {
    let d = Infinity;
    for (const o of estrelas) if (o !== e) d = Math.min(d, Math.hypot(X(o.p) - X(e.p), Y(o.p) - Y(e.p)));
    return Math.min(C.alvo.maximo, d);
  };
  const tocar = (e, ev) => {
    try { if (telefone && ev && ev.currentTarget && ev.currentTarget.scrollIntoView) ev.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" }); } catch { /* sem rolo, segue */ }
    try { if (aoFocar) aoFocar(e.chave); if (aoTocarEstrela) aoTocarEstrela(e, { x: X(e.p), y: Y(e.p) }); } catch { /* tocar nunca derruba o céu */ }
  };
  const tecla = (ev) => {
    try {
      const atual = estrelas.find((e) => e.chave === (ev.target && ev.target.getAttribute && ev.target.getAttribute("data-chave"))) || estrelas.find((e) => e.chave === paragem);
      const prox = ev.key === "Home" ? estrelas.find((e) => e.raiz) : vizinhaNaDirecao(estrelas, atual, ev.key);
      if (!prox) return;
      ev.preventDefault();
      if (aoFocar) aoFocar(prox.chave);
      const b = [...ev.currentTarget.querySelectorAll("button[data-chave]")].find((x) => x.getAttribute("data-chave") === prox.chave);
      if (b) b.focus();
    } catch { /* o teclado nunca derruba o céu */ }
  };
  const botaoDaEstrela = (e) => {
    const a = alvoDe(e);
    const { rotulo } = estadoDe(e);
    return (
      <button key={"alvo:" + e.chave} type="button" data-chave={e.chave} aria-label={rotulo || e.nome} aria-pressed={escolhida === e.chave ? "true" : "false"}
        tabIndex={e.chave === paragem ? 0 : -1} onClick={(ev) => tocar(e, ev)} className="tv-anel-foco absolute"
        style={{ left: X(e.p) - a / 2, top: Y(e.p) - a / 2, width: a, height: a, borderRadius: "50%", background: "transparent", border: "none", padding: 0, cursor: "pointer" }} />
    );
  };
  const rotulos = rotulosDoCeu(estrelas, estadoDe, { X, Y, escolhida, telefone,
    area: { x: 0, y: y0, w: M.largo, h: M.alto - y0 - C.rotulo.afastamento * 2 },
    bloqueios: M.atras.slice(0, atras.length).map((a) => ({ x: a.x, y: a.y, w: a.lado, h: a.lado })) });
  const esc = estrelas.find((e) => e.chave === escolhida);
  const anel = esc ? <circle cx={X(esc.p)} cy={Y(esc.p)} r={C.escolhida.anel[m]} fill="none" stroke={C.escolhida.cor} strokeWidth={C.escolhida.espessura} /> : null;

  /* as figuras de trás: o desenho pequeno e a moldura tracejada — um botão só */
  const figurasDeTras = atras.slice(0, M.atras.length).map((a, i) => {
    const caixa = M.atras[i];
    const fa = FIGURAS_DA_CONSTELACAO[a.classe];
    if (!fa) return null;
    const estadoDeTras = (e) => { try { return (estadoDaEstrela && estadoDaEstrela(a.classe, e)) || { estado: "porAcender" }; } catch { return { estado: "porAcender" }; } };
    const d = desenhoDaFigura({ classe: a.classe, sub: a.sub || null, esp: a.esp || null, estadoDe: estadoDeTras, x0: 0, y0: 0, lado: caixa.lado, telefone, prefixo: a.classe + ":" });
    const acesasAtras = d.estrelas.filter((e) => estadoDeTras(e).estado === "acesa").length;
    const nome = "Trazer o " + a.classe + " para a frente — " + acesasAtras + " de " + d.estrelas.length + " acesas";
    return (
      <button key={"atras:" + a.classe} type="button" aria-label={nome} onClick={() => { try { if (aoTrazer) aoTrazer(a.classe); } catch { /* idem */ } }}
        className="tv-anel-foco absolute text-left"
        style={{ left: caixa.x, top: caixa.y, width: caixa.lado, height: caixa.lado, padding: 0, background: "transparent", cursor: "pointer",
          border: `1px dashed ${C.figuraDeTras.moldura}`, borderRadius: C.figuraDeTras.raio }}>
        <svg aria-hidden="true" width={caixa.lado} height={caixa.lado} className="absolute left-0 top-0" overflow="visible">
          {d.fios}{d.pontos}
        </svg>
        <span aria-hidden="true" className="absolute flex items-baseline justify-between gap-2" style={{ left: C.figuraDeTras.raio, right: C.figuraDeTras.raio, top: C.figuraDeTras.raio / 2 }}>
          <span className="tv-titulo uppercase truncate" style={{ fontSize: C.rotulo.ponta.tamanho, color: T.ink, letterSpacing: "0.08em" }}>{"O " + a.classe + " · " + fa.figura + " · " + acesasAtras + " de " + d.estrelas.length}</span>
          {!telefone ? <span className="tv-body shrink-0" style={{ fontSize: TIPOS.piso, color: T.inkMeio }}>Trazer para a frente ›</span> : null}
        </span>
      </button>
    );
  });

  const fundo = fundoDoCeu(classe, M.largo, M.alto, telefone);
  const subtitulo = [f.figura, telefone ? `${acesas} de ${estrelas.length} acesas` : `${acesas} de ${estrelas.length} estrelas acesas`, !telefone ? sub : null, !telefone ? esp : null].filter(Boolean).join(" · ");
  return (
    <div className="relative" data-vista="ceu" style={{ width: "100%", minWidth: M.largo, height: M.alto, background: C.ceu, borderRadius: C.figuraDeTras.raio / 2, overflow: "hidden" }}>
      <svg aria-hidden="true" className="absolute left-0 top-0 pointer-events-none" width={M.largo} height={M.alto}>
        {fundo.map((s) => <circle key={s.i} cx={s.x} cy={s.y} r={s.r} fill={C.estrela} fillOpacity={s.a} />)}
      </svg>
      {/* a barra de cima: o título, a linha e o verbo */}
      <div className="absolute flex items-start justify-between gap-3" style={{ left: x0, right: x0, top: telefone ? x0 / 2 : x0 / 2 + 4, minHeight: y0 - x0 }}>
        <div className="flex flex-col min-w-0">
          <span className="tv-titulo uppercase" style={{ fontSize: telefone ? TIPOS.corpo : TIPOS.titulo, color: C.metal.classe.luz, letterSpacing: "0.08em", lineHeight: 1.2 }}>O céu do {classe}</span>
          <span className="tv-body" style={{ fontSize: telefone ? TIPOS.piso : TIPOS.rotulo, color: T.inkDim }}>{subtitulo}</span>
          {aviso ? <span className="tv-body" style={{ fontSize: telefone ? TIPOS.piso : TIPOS.rotulo, color: T.inkDim }}>{aviso}</span> : null}
        </div>
        {verbo ? <div className="shrink-0">{verbo}</div> : null}
      </div>
      {/* as ligações e as estrelas, e os nomes; nada disto é alvo */}
      <svg aria-hidden="true" className="absolute left-0 top-0 pointer-events-none" width={M.largo} height={M.alto} overflow="visible">
        {saida ? (
          <g className="tv-ceu-sai tv-ceu-sai-reduzida" onAnimationEnd={() => { try { if (aoAcabarSaida) aoAcabarSaida(); } catch { /* idem */ } }}>
            {saida.fios}{saida.pontos}
          </g>
        ) : null}
        {fig.fios}
        {fig.brilho}
        {fig.pontos}
        {anel}
        {rotulos.map((r) => (
          <text key={r.chave} x={r.x} y={r.y} textAnchor={r.ancora} dominantBaseline="central" fill={r.cor}
            className={r.caixaAlta ? "tv-titulo uppercase" : "tv-body"} style={{ fontSize: r.caixaAlta ? C.rotulo.ponta.tamanho : C.rotulo.tamanho, letterSpacing: r.caixaAlta ? "0.08em" : undefined }}>
            {r.caixaAlta ? r.texto.toUpperCase() : r.texto}
          </text>
        ))}
      </svg>
      {/* as estrelas tocáveis: UMA paragem de Tab, as setas andam pelo céu */}
      <div role="group" aria-label={`O céu do ${classe}: ${acesas} de ${estrelas.length} estrelas acesas`} onKeyDown={tecla}
        className="absolute left-0 top-0" style={{ width: M.largo, height: M.alto }}>
        {estrelas.map(botaoDaEstrela)}
      </div>
      {figurasDeTras}
      {!telefone ? (
        <p className="tv-body italic absolute" style={{ left: x0, bottom: C.figuraDeTras.raio / 2, margin: 0, fontSize: TIPOS.piso, color: T.inkDim }}>
          Toca numa estrela para ver o preço — o mesmo veredito da árvore. As tracejadas são a figura por desenhar.
        </p>
      ) : null}
      {popover}
    </div>
  );
}
