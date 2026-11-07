/* ============================================================
   OS TALENTOS (AR4 · 06/11/2026) — a árvore, o grimório e a cerimónia
   formas.md §AR 3, §AR 6, §AR 7 · Figma «AR · 05/11»: 276:685 (1905),
   278:1047 (1280, o veredito em popover), 278:1537 (375, a gaveta),
   280:1556 (o grimório), 280:1858 (a cerimónia de aprender).

   A pessoa: «principalmente as abas grupo e talentos (essa principalmente,
   já que é uma das almas do jogo…) precisam ser chamativas e com elementos
   de jogos». Antes era uma lista de cartões por degrau; agora é uma árvore:

   · as COLUNAS são os degraus (1–10, 12, 14) e a régua de cima diz onde o
     herói está; as BANDAS são a classe, a subclasse e as duas
     especializações, estas à vista antes de se escolher;
   · a FORMA do nó diz o ramo, a INSÍGNIA diz o estado (✓, o custo em
     pontos, o cadeado); as ligações só acendem entre dois aprendidos;
   · o VEREDITO ANTES DO CLIQUE (a lei): painel fixo na mesa, popover ao lado
     do nó a 1280, gaveta de baixo no telefone — o custo, «3 → 1 pontos», e
     o que não se desfaz («só sai se recomeçares do zero (◉ 200)»);
   · a CERIMÓNIA DE APRENDER, curta, que nunca espera: o toque seguinte vale
     desde o primeiro milissegundo (com prefers-reduced-motion, esvanece).

   E O CÉU (AR 11, 07/11, aprovado pela pessoa): «Ver o céu» é a segunda
   vista da aba Árvore — a mesma árvore desenhada como uma constelação
   (painel-ceu.jsx). Cada estrela é um nó desta árvore (noDaEstrela), e
   tocar nela abre o MESMO veredito, pelo mesmo caminho do nó.

   O leiaute escolhe-se pela largura DO PAINEL (como o Diário): na gaveta de
   320 é o do telefone. Nenhuma regra mora aqui: o estado de cada nó é o de
   classes.js (`arvoreDaClasse`, `podePegarHabilidade`…) e o do grimório é o
   de `grimorioDaClasse` (magias.js). As props são as de sempre.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import {
  TIPOS, alfa, MOLDURA_POR_DEGRAU, GEMA_DA_SUBCLASSE, ENCAIXE, ICONES_DO_TALENTO,
  NO_DE_TALENTO, ARVORE_DE_TALENTOS, CABECALHO_DA_TELA, FIGURAS_DA_CONSTELACAO,
} from "./estilo.js";
import { VerboComPreco, Glifo } from "./ui.jsx";
import { CabecalhoDaTela, AbaDaTela, GlifoAR, NoDeTalento, Ligacao, SeloDePontos, LinhaDaComparacao } from "./painel-ar-pecas.jsx";
import { Gema } from "./painel-moldura.jsx";
import { CeuDoHeroi, ceuDaClasse, medidasDoCeu } from "./painel-ceu.jsx";
import { RostoNaMoldura } from "./painel-equipamento.jsx";
import {
  CLASSES, classePorNome, arvoreDaClasse, arvoreDaSubclasse, arvoreDaEspecializacao, ranksDoPersonagem,
  pontosDisponiveis, pontosTotais, custoRespec, custoEmPontos, podePegarHabilidade, subclasseEscolhida,
  podeEscolherSubclasse, habilidadesDaSubclasse, especializacaoEscolhida, podeEscolherEspecializacao,
  especializacoesDaSubclasse, habilidadesDaEspecializacao, RANK_PARA_SUBCLASSE, RANK_PARA_ESPECIALIZACAO, pontosNoNivel,
} from "./classes.js";
import { DEGRAUS_SUBCLASSE } from "./subclasses.js";
import { MARCA_DA_SUBCLASSE } from "./marca-da-subclasse.js";
import { grimorioDaClasse, ESTADOS_DO_GRIMORIO } from "./magias.js";
import { tabelaDeAtributos, pontosAtributoDisponiveis, pontosAtributoTotais, tetoAtributo, conselhoDeBuild } from "./atributos.js";

const A = ARVORE_DE_TALENTOS;
const N = NO_DE_TALENTO;
const OURO = MOLDURA_POR_DEGRAU.ouro;
const PRATA = MOLDURA_POR_DEGRAU.prata;
const COLS = A.colunas;
/* a largura de cada leiaute sai das próprias medidas da árvore: a mesa
   cabe a coluna da esquerda, as doze colunas e o veredito; a meia, as doze */
const CORTE = {
  mesa: A.mesa.esquerda + A.mesa.rotulos + COLS.length * A.mesa.passo + A.mesa.veredito,
  meia: A.meia.rotulos + COLS.length * A.meia.passo,
};
/* o desenho do telefone é a 375; a gaveta de 320 encolhe-o na mesma proporção */
const LARGURA_DO_TELEFONE = 375;

const nomeDe = (h) => (typeof h === "string" ? h : h && h.nome);
const pontosDito = (n) => `${n} ponto${n === 1 ? "" : "s"}`;
/* o preço em moedas: no verbo, o ◉ (VerboComPreco desenha-o como a moeda); na prosa, o Glifo */
const faltam = (n) => `faltam ◉ ${n}`;
const Moedas = ({ n }) => <><Glifo nome="moeda" tamanho={TIPOS.piso} rotulo="moedas" />{" " + n}</>;
const soSaiSe = (n) => <>Só sai se recomeçares do zero (<Moedas n={n} />).</>;
const estadoDaHab = (h) => (h.dominada ? "aprendido" : h.pode ? "disponivel" : "bloqueado");
const glifoDoTipo = (tipo) => (ICONES_DO_TALENTO[tipo] ? tipo : "utilidade");
/* a magia de ataque desenha-se com a centelha; as outras pelo tipo */
const glifoDaMagia = (tipo) => (tipo === "ataque" || !ICONES_DO_TALENTO[tipo] ? "magia" : tipo);
const ESTADO_DA_MAGIA = { [ESTADOS_DO_GRIMORIO[0]]: "aprendido", [ESTADOS_DO_GRIMORIO[1]]: "disponivel", [ESTADOS_DO_GRIMORIO[2]]: "bloqueado" };
const ROTULO_DO_ESTADO = { aprendido: "aprendido", disponivel: "por aprender", bloqueado: "fechado" };

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

/* ---------------- O MODELO DA ÁRVORE ----------------
   Lê as regras e devolve os nós (com a banda, a linha e o degrau) e as
   bandas; a geometria vem depois, por leiaute. Não decide nada: o estado de
   cada nó é o que classes.js diz. */
function modeloDaArvore(pers, classe) {
  const nos = [];
  const bandas = [];
  const tem = (nome) => ((pers && pers.habilidades) || []).some((x) => nomeDe(x) === nome);
  const marcar = (h) => {
    let chk = { pode: false, motivo: "" };
    try { chk = podePegarHabilidade(pers, classe, h); } catch { /* sem regra, fechado */ }
    return { ...h, custoPontos: custoEmPontos(h), dominada: tem(h.nome), pode: chk.pode, motivo: chk.motivo };
  };
  /* a classe: duas linhas (há degraus com duas habilidades), três se preciso */
  const daClasse = arvoreDaClasse(pers, classe);
  const porDegrau = {};
  for (const h of daClasse) {
    const d = h.nivel || 1;
    porDegrau[d] = (porDegrau[d] || 0) + 1;
    nos.push({ banda: "classe", linha: porDegrau[d] - 1, degrau: d, ramo: "classe", h });
  }
  const linhasDaClasse = Math.max(1, ...Object.values(porDegrau));
  bandas.push({ id: "classe", tipo: "classe", nome: classe, linhas: linhasDaClasse, nota: `a classe · ${daClasse.length} habilidades` });

  const c = classePorNome(classe);
  const sub = subclasseEscolhida(pers, classe);
  if (sub) {
    for (const h of arvoreDaSubclasse(pers, classe)) nos.push({ banda: "subclasse", linha: 0, degrau: h.nivel || 1, ramo: "subclasse", h, gema: GEMA_DA_SUBCLASSE[sub] || null });
    bandas.push({ id: "subclasse", tipo: "subclasse", nome: sub, linhas: 1, nota: `a subclasse · nos degraus ${DEGRAUS_SUBCLASSE.slice(0, -1).join(", ")} e ${DEGRAUS_SUBCLASSE[DEGRAUS_SUBCLASSE.length - 1]}` });
    /* as duas especializações, à vista antes de se escolher: o porquê de
       cada nó fechado é o de podePegarHabilidade */
    const escolhida = especializacaoEscolhida(pers, classe);
    for (const e of especializacoesDaSubclasse(sub)) {
      const lista = e === escolhida ? arvoreDaEspecializacao(pers, classe) : habilidadesDaEspecializacao(e).map(marcar);
      const id = "esp:" + e;
      for (const h of lista) nos.push({ banda: id, linha: 0, degrau: h.nivel || RANK_PARA_ESPECIALIZACAO, ramo: "especializacao", h });
      bandas.push({ id, tipo: "especializacao", nome: e, linhas: 1, escolhida: e === escolhida, fechada: !!escolhida && e !== escolhida,
        nota: e === escolhida ? "a tua especialização" : escolhida ? `seguiste ${escolhida}` : `especialização · escolhe uma aos ${RANK_PARA_ESPECIALIZACAO}` });
    }
  } else if (c && (c.subclasses || []).length) {
    /* ainda sem subclasse: os caminhos são nós de escolha, lado a lado */
    const chk = podeEscolherSubclasse(pers, classe);
    c.subclasses.forEach((s, i) => nos.push({ banda: "subclasse", linha: 0, degrau: COLS[COLS.indexOf(A.nascente.subclasse) + i] || A.nascente.subclasse, ramo: "subclasse", escolha: "sub", nome: s.nome, pode: chk.pode, motivo: chk.motivo, gema: GEMA_DA_SUBCLASSE[s.nome] || null }));
    bandas.push({ id: "subclasse", tipo: "subclasse", nome: "Subclasse", linhas: 1, nota: chk.pode ? "escolhe um caminho" : `escolhe um caminho aos ${RANK_PARA_SUBCLASSE}` });
  }
  return { nos, bandas, linhasDaClasse, sub };
}

const estadoDoNo = (n) => (n.escolha ? (n.pode ? "disponivel" : "bloqueado") : estadoDaHab(n.h));
const nomeDoNo = (n) => (n.escolha ? n.nome : n.h.nome);
const chaveDoNo = (n) => `${n.banda}:${nomeDoNo(n)}`;
/* o que fica escolhido quando se toca num nó (na árvore ou no céu) */
const selDoNo = (n, onde = null) => (n.escolha ? { chave: chaveDoNo(n), tipo: "sub", nome: n.nome, onde } : { chave: chaveDoNo(n), tipo: "hab", n, onde });

/* ---------------- O CÉU (AR 11) ----------------
   A estrela é um nó desta árvore: o mesmo nome no mesmo ramo. O braço de uma
   subclasse ainda por escolher não tem nós de habilidade na árvore — lá, o nó
   é a ESCOLHA dessa subclasse, e é esse o veredito que a estrela abre. */
function noDaEstrela(modelo, e) {
  if (!e) return null;
  if (e.ramo === "classe") return modelo.nos.find((n) => n.banda === "classe" && !n.escolha && n.h.nome === e.nome) || null;
  if (e.ramo === "subclasse") {
    if (modelo.sub === e.sub) return modelo.nos.find((n) => n.banda === "subclasse" && !n.escolha && n.h.nome === e.nome) || null;
    return modelo.nos.find((n) => n.escolha === "sub" && n.nome === e.sub) || null;
  }
  return modelo.nos.find((n) => n.banda === "esp:" + e.esp && !n.escolha && n.h.nome === e.nome) || null;
}
/* O estado e o nome acessível de uma estrela, lidos do nó (as regras).
   OS NOMES REPETIDOS: seis classes repetem nomes entre a classe e um braço
   (o Arqueiro, o Arcanista, o Assassino, o Paladino, o Punho de Ferro, o
   Andarilho), e `dominada` compara por nome. O céu decide pelo RAMO e pelo
   nome onde a ficha o permite: a estrela de um braço ou ramo que o herói não
   seguiu nunca acende (o modelo nem tem nós de habilidade para um braço por
   escolher, e a especialização tem de ser a dele). Onde a ficha NÃO o
   permite — a classe e o braço escolhido com o mesmo nome — acendem as duas,
   como na árvore: a habilidade guardada é só o nome, sem o ramo. */
function estadoDaEstrela(modelo, classe, e, espEscolhida) {
  const n = noDaEstrela(modelo, e);
  if (!n) return { estado: "porAcender", rotulo: e.nome };
  if (n.escolha) return { estado: "porAcender", rotulo: `${e.nome} — ${e.sub}. Abre ao seguir ${e.sub}.` };
  const h = n.h;
  const doRamo = e.ramo !== "especializacao" || e.esp === espEscolhida;
  if (h.dominada && doRamo) return { estado: "acesa", rotulo: `${h.nome} — aprendida.` };
  const dono = e.ramo === "classe" ? classe : e.ramo === "subclasse" ? `${classe} · ${e.sub}` : `${classe} · ${e.esp}`;
  if (h.pode) return { estado: "disponivel", rotulo: `${h.nome} — ${dono}, degrau ${h.nivel || 1}, ${h.tipo}. Por acender: custa ${pontosDito(h.custoPontos)}.` };
  return { estado: "porAcender", rotulo: `${h.nome} — ${dono}, degrau ${h.nivel || 1}. ${h.motivo || "ainda não"}.` };
}
/* a vista da aba Árvore vive na sessão (não no save): abre na árvore até o
   jogador escolher o céu, e daí em diante abre no céu */
let vistaDaSessao = null;

/* ---------------- A GEOMETRIA, POR LEIAUTE ---------------- */
function geometria(modelo, leiaute, largura) {
  const pos = {};
  const rotulos = [];
  let alto = 0, largo = 0;
  if (leiaute !== "telefone") {
    const M = A[leiaute] || A.mesa;
    const xDe = (d) => { const i = COLS.indexOf(d); return M.rotulos + (i < 0 ? COLS.length - 1 : i) * M.passo + M.passo / 2; };
    const [c0, c1] = M.linhas.classe;
    const passoLinha = c1 - c0;
    const extra = Math.max(0, modelo.linhasDaClasse - M.linhas.classe.length) * passoLinha;
    const yDaBanda = {};
    let iEsp = 0;
    for (const b of modelo.bandas) {
      if (b.tipo === "classe") yDaBanda[b.id] = Array.from({ length: b.linhas }, (_, i) => c0 + i * passoLinha);
      else if (b.tipo === "subclasse") yDaBanda[b.id] = [M.linhas.subclasse + extra];
      else { const e = M.linhas.especializacao; yDaBanda[b.id] = [(e[iEsp] != null ? e[iEsp] : e[e.length - 1] + (iEsp - e.length + 1) * (e[1] - e[0])) + extra]; iEsp++; }
      rotulos.push({ id: b.id, x: 0, y: yDaBanda[b.id][0] - N.lado / 2, b });
    }
    for (const n of modelo.nos) pos[chaveDoNo(n)] = { x: xDe(n.degrau), y: yDaBanda[n.banda][n.linha] };
    const ys = Object.values(pos).map((p) => p.y);
    alto = (ys.length ? Math.max(...ys) : c0) + N.lado / 2 + N.folga + 2 * N.rotulo * 1.2 + N.folga;
    largo = M.rotulos + COLS.length * M.passo;
    return { pos, rotulos, alto, largo, xDe, regua: true, M };
  }
  /* o telefone: a árvore em pé — os degraus são linhas, a classe e a
     subclasse são colunas; as especializações (e os caminhos por escolher)
     são bandas deitadas por baixo */
  const f = Math.min(1, (largura || LARGURA_DO_TELEFONE) / LARGURA_DO_TELEFONE);
  const P = A.telefone;
  const [k0, k1] = P.colunas.classe;
  const xCl = (i) => (k0 + i * (k1 - k0)) * f;
  const degraus = COLS.filter((d) => modelo.nos.some((n) => (n.banda === "classe" || (n.banda === "subclasse" && !n.escolha)) && n.degrau === d));
  const topo = N.lado / 2 + N.folga;
  const yDe = (d) => topo + Math.max(0, degraus.indexOf(d)) * P.passoVertical;
  for (const n of modelo.nos) {
    if (n.banda === "classe") pos[chaveDoNo(n)] = { x: xCl(n.linha), y: yDe(n.degrau) };
    else if (n.banda === "subclasse" && !n.escolha) pos[chaveDoNo(n)] = { x: P.colunas.subclasse * f, y: yDe(n.degrau) };
  }
  let y = topo + Math.max(0, degraus.length - 1) * P.passoVertical + P.passoVertical / 2;
  for (const b of modelo.bandas) {
    const deitada = b.tipo === "especializacao" || (b.tipo === "subclasse" && modelo.nos.some((n) => n.banda === b.id && n.escolha));
    if (!deitada) continue;
    rotulos.push({ id: b.id, x: 0, y, b });
    y += P.passoVertical / 2;
    modelo.nos.filter((n) => n.banda === b.id).forEach((n, i) => { pos[chaveDoNo(n)] = { x: xCl(i), y: y + N.lado / 2 }; });
    y += P.passoVertical;
  }
  alto = y;
  largo = largura || LARGURA_DO_TELEFONE;
  return { pos, rotulos, alto, largo, degraus, yDe, regua: false, f };
}

/* as ligações: vizinhos da mesma linha (pelo degrau); o fio que desce do
   degrau da subclasse e o tronco da especialização */
function ligacoesDe(modelo, g, leiaute) {
  const fios = [];
  const linhas = {};
  for (const n of modelo.nos) {
    if (n.escolha) continue;
    const k = `${n.banda}#${n.linha}`;
    (linhas[k] = linhas[k] || []).push(n);
  }
  const meio = N.lado / 2;
  for (const lista of Object.values(linhas)) {
    lista.sort((a, b) => a.degrau - b.degrau);
    for (let i = 1; i < lista.length; i++) {
      const a = lista[i - 1], b = lista[i];
      const pa = g.pos[chaveDoNo(a)], pb = g.pos[chaveDoNo(b)];
      if (!pa || !pb) continue;
      const deitada = Math.abs(pa.y - pb.y) < 1;
      fios.push({
        id: `${chaveDoNo(a)}>${chaveDoNo(b)}`, a, b,
        x1: deitada ? pa.x + meio : pa.x, y1: deitada ? pa.y : pa.y + meio + N.folga + N.rotulo * 2.4,
        x2: deitada ? pb.x - meio : pb.x, y2: deitada ? pb.y : pb.y - meio,
      });
    }
  }
  if (leiaute === "telefone") return fios;
  /* o fio da subclasse desce do degrau onde ela nasce */
  const naClasse = modelo.nos.find((n) => n.banda === "classe" && n.linha === 0 && n.degrau === A.nascente.subclasse);
  const daSub = modelo.nos.filter((n) => n.banda === "subclasse" && !n.escolha).sort((a, b) => a.degrau - b.degrau);
  if (naClasse && daSub[0]) {
    const pa = g.pos[chaveDoNo(naClasse)], pb = g.pos[chaveDoNo(daSub[0])];
    if (pa && pb) fios.push({ id: "nasce:sub", a: naClasse, b: daSub[0], x1: pa.x, y1: pa.y + meio + N.folga + N.rotulo * 2.4, x2: pa.x, y2: pb.y - meio, desvio: pb.x !== pa.x ? { x: pb.x, y: pb.y } : null });
  }
  /* o tronco da especialização: entre o degrau 9 e o 10, desce do último
     nó da subclasse a cada banda */
  const ultimaSub = daSub[daSub.length - 1];
  const i10 = COLS.indexOf(A.nascente.especializacao);
  const xTronco = g.xDe ? (g.xDe(COLS[i10 - 1]) + g.xDe(COLS[i10])) / 2 : 0;
  if (ultimaSub) {
    const ps = g.pos[chaveDoNo(ultimaSub)];
    for (const b of modelo.bandas.filter((x) => x.tipo === "especializacao")) {
      const primeiro = modelo.nos.filter((n) => n.banda === b.id).sort((x, y) => x.degrau - y.degrau)[0];
      const pp = primeiro && g.pos[chaveDoNo(primeiro)];
      if (!ps || !pp) continue;
      fios.push({ id: `tronco:${b.id}`, a: ultimaSub, b: primeiro, x1: xTronco, y1: ps.y, x2: xTronco, y2: pp.y, cotovelo: { x: pp.x - meio, y: pp.y }, raiz: { x: ps.x + meio, y: ps.y } });
    }
  }
  return fios;
}

/* ---------------- O VEREDITO ----------------
   O nó grande, o nome, «Mago · degrau 6 · defesa», o efeito, o que muda
   (Linha da comparação) e o verbo com o preço — armado, impedido com a
   razão, ou sem volta. Por baixo, o que não se desfaz. */
function Veredito({ v, telefone = false }) {
  if (!v) {
    return (
      <p className="tv-body" style={{ fontSize: TIPOS.corpo, color: T.inkDim, margin: 0 }}>
        Toca num talento para ver o que custa e o que muda.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {v.no ? <NoDeTalento {...v.no} escolhido estatico nome="" largura={N.lado} /> : null}
        <div className="flex flex-col min-w-0">
          <span className="tv-titulo" style={{ fontSize: TIPOS.titulo, color: OURO.claro, lineHeight: 1.2 }}>{v.titulo}</span>
          {v.linha ? <span className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.inkDim }}>{v.linha}</span> : null}
        </div>
      </div>
      {v.efeito ? <p className="tv-body" style={{ fontSize: telefone ? TIPOS.corpo : TIPOS.prosa, color: T.ink, margin: 0, lineHeight: 1.4 }}>{v.efeito}</p> : null}
      {v.citacao ? <p className="tv-body italic" style={{ fontSize: TIPOS.rotulo, color: T.inkMeio, margin: 0 }}>«{v.citacao}»</p> : null}
      {v.comparacao && v.comparacao.length ? (
        <div className="flex flex-col gap-2" style={{ padding: ENCAIXE.raio, border: `1px solid ${T.lineStrong}`, borderRadius: ENCAIXE.raio }}>
          {v.comparacao.map((l) => <LinhaDaComparacao key={l.rotulo} {...l} />)}
        </div>
      ) : null}
      {v.lista ? <p className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.inkMeio, margin: 0 }}>{v.lista}</p> : null}
      {v.verbo ? <div data-verbo="sim" className="flex flex-col gap-2">{v.verbo}</div> : null}
      {v.pe ? <p className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.inkDim, margin: 0 }}>{v.pe}</p> : null}
    </div>
  );
}

/* a moldura do veredito: painel fixo (mesa), popover ao lado do nó (meia),
   gaveta de baixo (telefone). Esc fecha o popover e a gaveta; o foco vai ao
   verbo quando abrem. */
function CaixaDoVeredito({ modo, v, onde = null, larguraDaArvore = 0, aoFechar }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (modo === "mesa" || !v) return undefined;
    try { const b = ref.current && ref.current.querySelector("[data-verbo] button"); if (b) b.focus(modo === "telefone" ? undefined : { preventScroll: true }); /* na gaveta, o verbo vem à vista */ } catch { /* sem foco, segue */ }
    const tecla = (ev) => { if (ev.key === "Escape") { try { aoFechar(); } catch { /* fechar nunca derruba */ } } };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [modo, v && v.titulo]);
  const fechar = (
    <button type="button" onClick={aoFechar} aria-label="Fechar" className="tv-anel-foco flex items-center justify-center shrink-0"
      style={{ minWidth: CABECALHO_DA_TELA.fechar, minHeight: CABECALHO_DA_TELA.fechar, background: "transparent", border: "none", color: T.inkDim }}>
      <GlifoAR nome="fechar" tamanho={TIPOS.corpo} />
    </button>
  );
  const chao = { background: T.panelSoft, border: `1px solid ${OURO.meio}`, borderRadius: ENCAIXE.raio };
  if (modo === "mesa") {
    return (
      <aside aria-label="O veredito" className="flex flex-col p-5 tv-scroll overflow-y-auto" style={{ ...chao, boxShadow: `0 0 ${A.regua.aqui * 2}px ${alfa(T.amber, N.estados.disponivel.halo.alfa / 2)}` }}>
        <Veredito v={v} />
      </aside>
    );
  }
  if (!v) return null;
  if (modo === "meia") {
    const W = A.meia.popover;
    const meio = N.largura.meia / 2;
    const p = onde || { x: larguraDaArvore - W / 2, y: N.lado };
    const cabeDireita = p.x + meio + W < larguraDaArvore;
    const left = Math.max(0, cabeDireita ? p.x + meio : p.x - meio - W);
    return (
      <div ref={ref} role="dialog" aria-label={v.titulo} className="tv-gaveta-abre tv-gaveta-reduzida absolute z-10 p-4 flex flex-col"
        style={{ ...chao, left, top: Math.max(0, p.y - N.lado), width: W, boxShadow: `0 ${ENCAIXE.sombraDoEscolhido.y}px ${ENCAIXE.sombraDoEscolhido.raio}px ${alfa(ENCAIXE.sombra, ENCAIXE.sombraDoEscolhido.alfa)}` }}>
        <div className="flex justify-end" style={{ marginBottom: -CABECALHO_DA_TELA.fechar / 2 }}>{fechar}</div>
        <Veredito v={v} />
      </div>
    );
  }
  return (
    <div ref={ref} role="dialog" aria-label={v.titulo} className="tv-gaveta-sobe tv-gaveta-reduzida sticky bottom-0 z-10 p-4 flex flex-col"
      style={{ ...chao, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, boxShadow: `0 -${ENCAIXE.sombraDoEscolhido.y}px ${ENCAIXE.sombraDoEscolhido.raio}px ${alfa(ENCAIXE.sombra, ENCAIXE.sombraDoEscolhido.alfa)}` }}>
      <div className="flex items-center justify-between">
        <span aria-hidden="true" className="mx-auto rounded-full" style={{ width: CABECALHO_DA_TELA.fechar, height: N.folga / 2 + 1, background: T.lineStrong }} />
        {fechar}
      </div>
      <Veredito v={v} telefone />
    </div>
  );
}

/* ---------------- A ÁRVORE DESENHADA ---------------- */
function Arvore({ modelo, leiaute, largura, ranks, classe, escolhido, aprendeu, aoTocarNo, aoTocarBanda, popover }) {
  const g = geometria(modelo, leiaute, largura);
  const fios = ligacoesDe(modelo, g, leiaute);
  /* no telefone encolhido (a gaveta de 320) o nome não pode passar da coluna vizinha */
  const passoDoTelefone = (A.telefone.colunas.classe[1] - A.telefone.colunas.classe[0]) * (g.f || 1) - N.folga;
  const larguraDoNo = leiaute === "telefone" ? Math.min(N.largura.telefone, Math.max(N.lado, passoDoTelefone)) : N.largura[leiaute] || N.largura.mesa;
  const rank = ranks[classe] || 0;
  const meio = N.lado / 2;
  const daCerimonia = (n) => !!(aprendeu && !n.escolha && n.h.dominada && aprendeu.nome === n.h.nome);
  const R = A.regua;
  const topo = g.regua ? R.numero * 3 : 0;
  return (
    <div className="relative" style={{ width: g.largo, minWidth: g.largo, height: g.alto + topo }}>
      {/* a régua: os degraus, o fio andado e o «tu estás aqui» */}
      {g.regua ? (
        <svg aria-hidden="true" className="absolute left-0 top-0" width={g.largo} height={topo} overflow="visible">
          <line x1={g.xDe(COLS[0])} x2={g.xDe(COLS[COLS.length - 1])} y1={topo - R.aqui} y2={topo - R.aqui} stroke={T.lineStrong} strokeWidth={R.fio} />
          {rank > 0 ? <line x1={g.xDe(COLS[0])} x2={g.xDe(COLS.filter((d) => d <= rank).pop() || COLS[0])} y1={topo - R.aqui} y2={topo - R.aqui} stroke={OURO.meio} strokeWidth={R.andado} /> : null}
          {rank > 0 ? <circle cx={g.xDe(COLS.filter((d) => d <= rank).pop() || COLS[0])} cy={topo - R.aqui} r={R.aqui / 2} fill={OURO.claro} /> : null}
          {COLS.map((d) => (
            <text key={d} x={g.xDe(d)} y={topo - R.aqui - R.numero} textAnchor="middle" className="tv-body"
              style={{ fontSize: R.numero, fontWeight: 600 }} fill={d <= rank ? T.amberSoft : T.inkDim}>{d}</text>
          ))}
        </svg>
      ) : null}
      <div className="absolute left-0" style={{ top: topo, width: g.largo, height: g.alto }}>
        {/* no telefone: os degraus à esquerda, e o fio andado */}
        {!g.regua && g.degraus ? (
          <svg aria-hidden="true" className="absolute left-0 top-0" width={g.largo} height={g.alto} overflow="visible">
            {g.degraus.length ? <line x1={R.numero * 3} x2={R.numero * 3} y1={g.yDe(g.degraus[0])} y2={g.yDe(g.degraus[g.degraus.length - 1])} stroke={T.lineStrong} strokeWidth={R.fio} /> : null}
            {rank > 0 && g.degraus.length ? <line x1={R.numero * 3} x2={R.numero * 3} y1={g.yDe(g.degraus[0])} y2={g.yDe(g.degraus.filter((d) => d <= rank).pop() || g.degraus[0])} stroke={OURO.meio} strokeWidth={R.andado} /> : null}
            {g.degraus.map((d) => (
              <text key={d} x={R.numero * 1.5} y={g.yDe(d)} textAnchor="middle" dominantBaseline="central" className="tv-body"
                style={{ fontSize: R.numero, fontWeight: 600 }} fill={d <= rank ? T.amberSoft : T.inkDim}>{d}</text>
            ))}
          </svg>
        ) : null}
        {/* as bandas: o nome e a nota; a especialização por escolher é tocável */}
        {g.rotulos.map(({ id, x, y, b }) => {
          const tocavel = b.tipo === "especializacao" && !b.escolhida && !b.fechada;
          const corpo = (
            <>
              <span className="tv-titulo uppercase" style={{ fontSize: A.regua.numero, letterSpacing: "0.08em", color: b.fechada ? T.inkDim : b.tipo === "especializacao" ? PRATA.claro : OURO.claro }}>{b.nome}</span>
              <span className="tv-body" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>{b.nota}</span>
            </>
          );
          const estilo = { left: x, top: y, width: g.regua ? g.M.rotulos - N.folga * 2 : g.largo, gap: 2 };
          return tocavel ? (
            <button key={id} type="button" onClick={() => aoTocarBanda(b)} aria-pressed={escolhido === `banda:${b.id}` ? "true" : "false"}
              className="tv-anel-foco absolute flex flex-col text-left" style={{ ...estilo, background: "transparent", border: "none", padding: 0, cursor: "pointer" }}>{corpo}</button>
          ) : <div key={id} className="absolute flex flex-col" style={estilo}>{corpo}</div>;
        })}
        {/* as ligações, por baixo dos nós */}
        <svg aria-hidden="true" className="absolute left-0 top-0 pointer-events-none" width={g.largo} height={g.alto} overflow="visible">
          {fios.map((l) => {
            const acesa = !!(l.a.h && l.b.h && l.a.h.dominada && l.b.h.dominada);
            const desenha = acesa && !!aprendeu && (aprendeu.nome === nomeDoNo(l.a) || aprendeu.nome === nomeDoNo(l.b));
            return (
              <g key={l.id}>
                {l.raiz ? <Ligacao x1={l.raiz.x} y1={l.raiz.y} x2={l.x1} y2={l.y1} acesa={acesa} /> : null}
                <Ligacao x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} acesa={acesa} desenha={desenha && !l.cotovelo} />
                {l.cotovelo ? <Ligacao x1={l.x2} y1={l.y2} x2={l.cotovelo.x} y2={l.cotovelo.y} acesa={acesa} desenha={desenha} /> : null}
                {l.desvio ? <Ligacao x1={l.x2} y1={l.y2 + meio} x2={l.desvio.x - meio} y2={l.desvio.y} acesa={acesa} /> : null}
              </g>
            );
          })}
        </svg>
        {/* os nós */}
        {modelo.nos.map((n) => {
          const p = g.pos[chaveDoNo(n)];
          if (!p) return null;
          const estado = estadoDoNo(n);
          const chave = chaveDoNo(n);
          return (
            <div key={chave} className="absolute" style={{ left: p.x - larguraDoNo / 2, top: p.y - meio }}>
              <NoDeTalento ramo={n.ramo} estado={estado} escolhido={escolhido === chave} nome={nomeDoNo(n)}
                custo={n.escolha ? 0 : n.h.custoPontos} glifo={n.escolha ? "passiva" : glifoDoTipo(n.h.tipo)} gema={n.gema || null}
                largura={larguraDoNo} cerimonia={daCerimonia(n)} rotuloDoEstado={ROTULO_DO_ESTADO[estado]}
                aoTocar={() => aoTocarNo(n, p)} />
            </div>
          );
        })}
        {popover}
      </div>
    </div>
  );
}

/* a frase da cerimónia: sobe, fica, sai — e a peça escuta o fim dela */
function FraseDaCerimonia({ nome, texto = null, aoAcabar }) {
  return (
    <div role="status" className="tv-aprender-frase tv-body italic text-center pointer-events-none"
      onAnimationEnd={aoAcabar} style={{ fontSize: TIPOS.corpo, color: OURO.claro }}>
      {texto || `Aprendeste ${nome}.`}
    </div>
  );
}

/* ---------------- O GRIMÓRIO ----------------
   Uma linha por círculo, as magias em círculo (a forma da magia), ✦ = na
   cabeça hoje. A diferença entre aprender e preparar diz-se no veredito. */
function Grimorio({ grim, pers, escolhido, aprendeu, aoTocar }) {
  const nivel = (pers && pers.nivel) || 1;
  return (
    <div className="flex flex-col gap-5 p-4" style={{ background: T.panel, border: `1px solid ${alfa(T.violet, 0.6)}`, borderRadius: ENCAIXE.raio }}>
      {grim.naCabeca ? (
        <p className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.inkMeio, margin: 0 }}>
          <b style={{ color: T.ink }}>Na cabeça hoje: {grim.naCabeca.preparadas} de {grim.naCabeca.limite}</b>
          <span style={{ color: T.inkDim }}> · <Glifo nome="faisca" tamanho={TIPOS.piso} rotulo="preparada" /> = preparada · troca-se ao acampar</span>
        </p>
      ) : null}
      {grim.circulos.map((c) => {
        const aberto = nivel >= c.nivel;
        return (
          <div key={c.circulo} className="flex flex-wrap items-start gap-x-2 gap-y-3">
            <div className="flex flex-col shrink-0" style={{ width: A.meia.rotulos - N.folga * 2, gap: 2 }}>
              <span className="tv-titulo uppercase" style={{ fontSize: A.regua.numero, letterSpacing: "0.08em", color: aberto ? T.violetSoft : T.inkDim }}>Círculo {c.circulo}</span>
              <span className="tv-body" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>
                {aberto ? `nível ${c.nivel} · ${pontosDito(c.custoPontos)} cada` : `abre no nível ${c.nivel}`}
              </span>
            </div>
            {c.magias.map((m) => {
              const estado = ESTADO_DA_MAGIA[m.estado] || "bloqueado";
              return (
                <NoDeTalento key={m.nome} ramo="magia" estado={estado} escolhido={escolhido === `magia:${m.nome}`} nome={m.nome}
                  custo={m.custoPontos} glifo={glifoDaMagia(m.tipo)} preparada={!!m.preparada}
                  largura={N.largura.meia} cerimonia={!!(aprendeu && aprendeu.nome === m.nome && estado === "aprendido")}
                  rotuloDoEstado={ROTULO_DO_ESTADO[estado]} aoTocar={() => aoTocar(m, c)} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* a escolha pelo nome (a porta da suíte e de quem já sabe o que quer ver) */
function selDoNome(pers, classe, aba, nome) {
  if (!nome) return null;
  if (nome === "respec") return { chave: "respec", tipo: "respec" };
  try {
    /* a chave de uma estrela do céu: o veredito do nó dela */
    if (/^(classe|sub|esp):/.test(nome)) {
      const mod = modeloDaArvore(pers, classe);
      const e = ceuDaClasse(classe, { sub: subclasseEscolhida(pers, classe), esp: especializacaoEscolhida(pers, classe) }).estrelas.find((x) => x.chave === nome);
      const n = noDaEstrela(mod, e);
      return n ? { ...selDoNo(n), estrela: e.chave } : null;
    }
    if (aba === "grimorio") {
      const g = grimorioDaClasse(pers, classe);
      for (const c of (g && g.circulos) || []) { const m = c.magias.find((x) => x.nome === nome); if (m) return { chave: `magia:${m.nome}`, tipo: "magia", m, c }; }
      return null;
    }
    const mod = modeloDaArvore(pers, classe);
    const n = mod.nos.find((x) => nomeDoNo(x) === nome);
    if (n) return n.escolha ? { chave: chaveDoNo(n), tipo: "sub", nome } : { chave: chaveDoNo(n), tipo: "hab", n };
    const b = mod.bandas.find((x) => x.tipo === "especializacao" && x.nome === nome);
    return b ? { chave: `banda:${b.id}`, tipo: "esp", nome } : null;
  } catch { return null; }
}

/* ---------------- O PAINEL ---------------- */
export function PainelTalentos({ personagem, onAprender, onRespec, onEscolherSubclasse, onEscolherEspecializacao, onSubirAtributo, onRespecAtributos, grupo = [], aoFechar = null, leiaute: leiautePedido = null, abaInicial = "arvore", inicial = null, vistaInicial = null }) {
  const pers = personagem || {};
  const raiz = React.useRef(null);
  const largura = useLarguraDe(raiz);
  const leiaute = leiautePedido || (largura >= CORTE.mesa ? "mesa" : largura >= CORTE.meia ? "meia" : "telefone");
  const telefone = leiaute === "telefone";

  const [abaClasse, setAbaClasse] = React.useState(pers.classe || (CLASSES[0] && CLASSES[0].nome));
  const [aba, setAba] = React.useState(abaInicial);
  /* `inicial` (o nome de um nó, ou "respec") abre o painel com o veredito à vista — é a porta da suíte */
  const [sel, setSel] = React.useState(() => selDoNome(pers, pers.classe || (CLASSES[0] && CLASSES[0].nome), abaInicial, inicial));
  const [aprendeu, setAprendeu] = React.useState(null); /* { nome } — a cerimónia */
  const [abrindo, setAbrindo] = React.useState(false);
  const [confirmarAtr, setConfirmarAtr] = React.useState(false);
  /* o céu (AR 11): a vista, a estrela com o foco do teclado, os braços que saem */
  const [vista, setVista] = React.useState(() => vistaInicial || vistaDaSessao || "arvore");
  const [focoDoCeu, setFocoDoCeu] = React.useState(null);
  const [saindo, setSaindo] = React.useState(null);

  const ranks = ranksDoPersonagem(pers);
  const abertas = Object.keys(ranks);
  const pontos = pontosDisponiveis(pers);
  const pontosAtr = pontosAtributoDisponiveis(pers);
  const custo = custoRespec(pers.nivel || 1);
  const moedas = pers.moedas || 0;
  const rank = ranks[abaClasse] || 0;
  const nova = !abertas.includes(abaClasse);
  let grim = null;
  try { grim = grimorioDaClasse(pers, abaClasse); } catch { grim = null; }
  let modelo = { nos: [], bandas: [], linhasDaClasse: 1, sub: null };
  try { modelo = modeloDaArvore(pers, abaClasse); } catch { /* sem árvore, a tela fica de pé */ }
  const subDoHeroi = subclasseEscolhida(pers, abaClasse);
  const gemaDoHeroi = subDoHeroi ? GEMA_DA_SUBCLASSE[subDoHeroi] || null : null;

  const fechar = () => setSel(null);
  const trocarAba = (id) => { setAba(id); setSel(null); };
  const trocarClasse = (n) => { setAbaClasse(n); setSel(null); setAbrindo(false); setFocoDoCeu(null); setSaindo(null); };
  const trocarVista = (x) => { vistaDaSessao = x; setVista(x); };
  const aprender = (nome) => {
    try { if (onAprender) onAprender(abaClasse, nome); } catch { /* nunca custa o turno */ }
    setAprendeu({ nome });
    if (leiaute !== "mesa") setSel(null);
  };
  const escolherSub = (nome) => { try { if (onEscolherSubclasse) onEscolherSubclasse(abaClasse, nome); } catch { /* idem */ } setSel(null); if (vista === "ceu") setSaindo({ sub: nome }); };
  const escolherEsp = (nome) => { try { if (onEscolherEspecializacao) onEscolherEspecializacao(abaClasse, nome); } catch { /* idem */ } setSel(null); };
  const recomecar = () => { try { if (onRespec) onRespec(); } catch { /* idem */ } setSel(null); setAprendeu(null); };

  const pe = <>Fica tua. {soSaiSe(custo)}</>;
  const linhaPontos = (gasta) => ({ rotulo: "Pontos por gastar", antes: pontos, depois: Math.max(0, pontos - gasta), sinal: "igual" });

  /* o veredito do que está escolhido — tudo o que diz vem das regras */
  const vereditoDe = () => {
    if (!sel) return null;
    if (sel.tipo === "hab") {
      /* o nó relê-se do modelo de agora: depois de aprender, o veredito diz «já é tua» */
      const n = modelo.nos.find((x) => chaveDoNo(x) === sel.chave) || sel.n;
      const h = n.h;
      const estado = estadoDaHab(h);
      const no = { ramo: n.ramo, estado, custo: h.custoPontos, glifo: glifoDoTipo(h.tipo), gema: n.gema || null };
      const dono = n.ramo === "classe" ? abaClasse : n.banda === "subclasse" ? `${abaClasse} · ${modelo.sub}` : `${abaClasse} · ${n.banda.slice(4)}`;
      const base = { no, titulo: h.nome, linha: `${dono} · degrau ${h.nivel || 1} · ${h.tipo}`, efeito: h.descricao };
      if (h.dominada) return { ...base, pe: "Já é tua." };
      const comparacao = [linhaPontos(h.custoPontos), { rotulo: `Habilidades de ${abaClasse}`, antes: rank, depois: rank + 1, sinal: "melhora" }];
      if (nova) comparacao.push({ rotulo: "Classes abertas", antes: abertas.length, depois: abertas.length + 1, sinal: "melhora" });
      if (h.custo != null) comparacao.push({ rotulo: "Custa a usar", depois: `${h.custo} PM`, sinal: "igual" });
      const verbo = h.pode
        ? <VerboComPreco papel="armado" verbo={`Aprender ${h.nome}`} preco={`${pontosDito(h.custoPontos)} · ficas com ${pontos - h.custoPontos}`} aoTocar={() => aprender(h.nome)} />
        : <VerboComPreco verbo={`Aprender ${h.nome}`} preco={pontosDito(h.custoPontos)} impedido={h.motivo || "ainda não"} />;
      return { ...base, comparacao, verbo, pe: h.pode ? pe : null };
    }
    if (sel.tipo === "magia") {
      const c = ((grim && grim.circulos) || []).find((x) => x.circulo === sel.c.circulo) || sel.c;
      const m = c.magias.find((x) => x.nome === sel.m.nome) || sel.m;
      const estado = ESTADO_DA_MAGIA[m.estado] || "bloqueado";
      const no = { ramo: "magia", estado, custo: m.custoPontos, glifo: glifoDaMagia(m.tipo) };
      const base = { no, titulo: m.nome, linha: [`Círculo ${m.circulo}`, m.forma, m.tipo].filter(Boolean).join(" · "), efeito: m.efeito };
      const preparar = grim && grim.naCabeca ? "Aprender não é preparar: para a lançar amanhã, põe-na na cabeça ao acampar." : null;
      if (estado === "aprendido") return { ...base, pe: m.preparada ? "Na cabeça hoje." : preparar || "Já é tua." };
      const sabidas = c.magias.filter((x) => ESTADO_DA_MAGIA[x.estado] === "aprendido").length;
      const comparacao = [linhaPontos(m.custoPontos), { rotulo: "Custa a usar", depois: `${m.custoPM} PM`, sinal: "igual" }, { rotulo: `Magias do ${m.circulo}.º círculo`, antes: sabidas, depois: sabidas + 1, sinal: "melhora" }];
      const verbo = estado === "disponivel"
        ? <VerboComPreco papel="armado" verbo={`Aprender ${m.nome}`} preco={`${pontosDito(m.custoPontos)} · ficas com ${pontos - m.custoPontos}`} aoTocar={() => aprender(m.nome)} />
        : <VerboComPreco verbo={`Aprender ${m.nome}`} preco={pontosDito(m.custoPontos)} impedido={m.motivo || "ainda não"} />;
      return { ...base, comparacao, verbo, pe: estado === "disponivel" ? preparar || pe : null };
    }
    if (sel.tipo === "sub") {
      const c = classePorNome(abaClasse) || { subclasses: [] };
      const ficha = c.subclasses.find((s) => s.nome === sel.nome) || {};
      const habs = habilidadesDaSubclasse(sel.nome);
      const outras = c.subclasses.map((s) => s.nome).filter((x) => x !== sel.nome);
      const chk = podeEscolherSubclasse(pers, abaClasse);
      const gema = GEMA_DA_SUBCLASSE[sel.nome] || null;
      const marca = MARCA_DA_SUBCLASSE[sel.nome];
      return {
        no: { ramo: "subclasse", estado: chk.pode ? "disponivel" : "bloqueado", custo: 0, glifo: "passiva", gema },
        titulo: sel.nome, linha: `subclasse de ${abaClasse}${gema ? ` · a ${gema.pedra}` : ""}`, efeito: ficha.desc, citacao: marca ? marca.diz : null,
        comparacao: [{ rotulo: "Habilidades novas", antes: 0, depois: habs.length, sinal: "melhora" }, { rotulo: "Ficam fechadas", depois: outras.join(" e ") || "nenhuma", sinal: "piora" }],
        lista: habs.map((h) => `${h.nome} (${h.nivel})`).join(" · "),
        verbo: chk.pode
          ? <VerboComPreco papel="armado" verbo={`Seguir ${sel.nome}`} preco="para sempre · não gasta pontos" aoTocar={() => escolherSub(sel.nome)} />
          : <VerboComPreco verbo={`Seguir ${sel.nome}`} preco="para sempre" impedido={chk.motivo} />,
        pe: soSaiSe(custo),
      };
    }
    if (sel.tipo === "esp") {
      const habs = habilidadesDaEspecializacao(sel.nome);
      const outras = especializacoesDaSubclasse(modelo.sub).filter((x) => x !== sel.nome);
      const chk = podeEscolherEspecializacao(pers, abaClasse);
      return {
        no: { ramo: "especializacao", estado: chk.pode ? "disponivel" : "bloqueado", custo: 0, glifo: "passiva" },
        titulo: sel.nome, linha: `especialização de ${modelo.sub}`, efeito: "O que fizeste tantas vezes que virou o teu nome.",
        comparacao: [{ rotulo: "Habilidades novas", antes: 0, depois: habs.length, sinal: "melhora" }, { rotulo: "Fica fechada", depois: outras.join(" e ") || "nenhuma", sinal: "piora" }],
        lista: habs.map((h) => `${h.nome} (${h.nivel})`).join(" · "),
        verbo: chk.pode
          ? <VerboComPreco papel="armado" verbo={`Seguir ${sel.nome}`} preco="para sempre · não gasta pontos" aoTocar={() => escolherEsp(sel.nome)} />
          : <VerboComPreco verbo={`Seguir ${sel.nome}`} preco="para sempre" impedido={chk.motivo} />,
        pe: soSaiSe(custo),
      };
    }
    if (sel.tipo === "respec") {
      const sabidas = Object.values(ranks).reduce((a, b) => a + b, 0);
      return {
        titulo: "Recomeçar do zero",
        efeito: "Devolve todos os pontos e apaga as habilidades de classe. As únicas e as dádivas ficam.",
        comparacao: [
          { rotulo: "Pontos por gastar", antes: pontos, depois: pontosTotais(pers.nivel || 1), sinal: "melhora" },
          { rotulo: "Habilidades de classe", antes: sabidas, depois: 0, sinal: "piora" },
          { rotulo: "Moedas", antes: moedas, depois: Math.max(0, moedas - custo), sinal: "piora" },
        ],
        verbo: <VerboComPreco papel="semVolta" verbo="Recomeçar do zero" preco={`◉ ${custo} · desfaz todas as escolhas`}
          impedido={moedas >= custo ? null : faltam(custo - moedas)} aoTocar={recomecar} />,
      };
    }
    return null;
  };
  let v = null;
  try { v = vereditoDe(); } catch { v = null; }

  const tocarNo = (n, p) => {
    setAprendeu((a) => (a ? null : a));
    const chave = chaveDoNo(n);
    if (sel && sel.chave === chave && leiaute !== "mesa") { setSel(null); return; }
    setSel(selDoNo(n, p));
  };
  /* tocar numa estrela é tocar no nó dela: o mesmo veredito */
  const tocarEstrela = (e, p) => {
    const n = noDaEstrela(modelo, e);
    if (!n) return;
    setAprendeu((a) => (a ? null : a));
    if (sel && sel.estrela === e.chave && leiaute !== "mesa") { setSel(null); return; }
    setSel({ ...selDoNo(n, p), estrela: e.chave });
  };
  const tocarBanda = (b) => setSel({ chave: `banda:${b.id}`, tipo: "esp", nome: b.nome });
  const tocarMagia = (m, c) => { setAprendeu((a) => (a ? null : a)); setSel({ chave: `magia:${m.nome}`, tipo: "magia", m, c }); };

  /* ---- o cabeçalho, as abas e o selo ---- */
  const nivel = pers.nivel || 1;
  const subtitulo = [pers.nome, [pers.classe, subclasseEscolhida(pers, pers.classe)].filter(Boolean).join(" "), `nível ${nivel}`].filter(Boolean).join(" · ");
  const abas = [
    ["arvore", "Árvore", false],
    ...(grim ? [["grimorio", "Grimório", false]] : []),
    ["atributos", `Atributos${pontosAtr > 0 ? ` · +${pontosAtr}` : ""}`, pontosAtr > 0],
    ["grupo", "Do grupo", false],
  ];
  const cabeca = (
    <>
      <CabecalhoDaTela titulo="Talentos" subtitulo={subtitulo} telefone={telefone} aoFechar={aoFechar}
        objeto={<RostoNaMoldura personagem={pers} aro={telefone ? CABECALHO_DA_TELA.telefone.objeto : CABECALHO_DA_TELA.mesa.objeto} />} />
      <div className="flex items-center gap-3" style={{ padding: `0 ${telefone ? CABECALHO_DA_TELA.telefone.lado : CABECALHO_DA_TELA.mesa.lado}px`, borderBottom: `1px solid ${alfa(OURO.meio, CABECALHO_DA_TELA.fio.alfa)}` }}>
        <div role="tablist" aria-label="Talentos" className="flex flex-1 min-w-0">
          {abas.map(([id, rot, novidade]) => <AbaDaTela key={id} rotulo={rot} ativa={aba === id} novidade={novidade} aoTocar={() => trocarAba(id)} controla={`talentos-${id}`} />)}
        </div>
        {!telefone ? <SeloDePontos pontos={aba === "atributos" ? pontosAtr : pontos} rotulo={aba === "atributos" ? "pontos de atributo por gastar" : "pontos de talento por gastar"} conta={!!aprendeu} /> : null}
      </div>
    </>
  );
  const moldura = (corpo) => (
    <div ref={raiz} className="flex flex-col" data-leiaute={leiaute} style={{ background: T.bg, minWidth: 0 }}>
      {cabeca}
      <div id={`talentos-${aba}`} role="tabpanel" className="flex flex-col gap-4" style={{ padding: telefone ? CABECALHO_DA_TELA.telefone.lado : leiaute === "mesa" ? `${CABECALHO_DA_TELA.mesa.lado}px ${CABECALHO_DA_TELA.mesa.folga}px` : CABECALHO_DA_TELA.mesa.lado }}>
        {corpo}
      </div>
    </div>
  );

  /* ---- ATRIBUTOS ---- */
  if (aba === "atributos") {
    let linhas = [];
    try { linhas = tabelaDeAtributos(pers); } catch { linhas = []; }
    const conselho = (() => { try { return conselhoDeBuild(pers); } catch { return null; } })();
    return moldura(
      <>
        {telefone ? <SeloDePontos pontos={pontosAtr} rotulo="pontos de atributo por gastar" /> : null}
        <p className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.inkMeio, margin: 0 }}>
          Subir custa mais conforme o degrau: até +3 custa 1, +4 e +5 custam 2, +6 e +7 custam 3, +8 custa 4. O teto no nível {nivel} é <b style={{ color: T.amberSoft }}>+{tetoAtributo(nivel)}</b>. Levar os seis ao máximo nunca cabe: escolher é a graça.
        </p>
        {conselho ? <p className="tv-body italic" style={{ fontSize: TIPOS.rotulo, color: T.violetSoft, margin: 0 }}>{conselho}</p> : null}
        <div className="grid gap-3" style={{ gridTemplateColumns: telefone ? "1fr" : "repeat(2, minmax(0, 1fr))" }}>
          {linhas.map((l) => (
            <div key={l.id} className="flex flex-col gap-2 p-3" style={{ background: T.panel, border: `1px solid ${l.chave ? T.amber : T.lineStrong}`, borderRadius: ENCAIXE.raio }}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="tv-titulo" style={{ fontSize: TIPOS.corpo, color: T.ink }}>{l.nome}</span>
                <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: l.valor >= l.teto ? T.ok : T.amberSoft }}>+{l.valor} / {l.teto}</span>
              </div>
              <span className="tv-body" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>{l.desc}{l.chave ? ` — rege as habilidades de ${l.classesQueUsam.join(" e ")}.` : ""}</span>
              {l.pode
                ? <VerboComPreco papel="armado" verbo={`${l.nome} +${l.valor} → +${l.valor + 1}`} preco={pontosDito(l.custoProximo)} aoTocar={() => { try { if (onSubirAtributo) onSubirAtributo(l.id); } catch { /* nunca custa o turno */ } }} />
                : <VerboComPreco verbo={`${l.nome} +${l.valor + 1}`} preco={pontosDito(l.custoProximo || 1)} impedido={l.motivo} />}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2" style={{ maxWidth: A.mesa.veredito }}>
          {!confirmarAtr
            ? <VerboComPreco papel="semVolta" verbo="Redistribuir atributos" preco={`◉ ${custo} · volta à ficha de criação, devolve ${pontosAtributoTotais(nivel)} pontos`} impedido={moedas >= custo ? null : faltam(custo - moedas)} aoTocar={() => setConfirmarAtr(true)} />
            : (
              <>
                <VerboComPreco papel="semVolta" verbo="Confirmar a redistribuição" preco={`◉ ${custo} · volta à ficha de criação`} aoTocar={() => { setConfirmarAtr(false); try { if (onRespecAtributos) onRespecAtributos(); } catch { /* idem */ } }} />
                <VerboComPreco papel="recuo" verbo="Cancelar" aoTocar={() => setConfirmarAtr(false)} />
              </>
            )}
        </div>
      </>,
    );
  }

  /* ---- DO GRUPO (a carta do companheiro é AR5) ---- */
  if (aba === "grupo") {
    return moldura(
      !grupo.length ? (
        <p className="tv-body italic" style={{ fontSize: TIPOS.corpo, color: T.inkDim, margin: 0 }}>Viajas sozinho. Companheiros trazem as próprias habilidades — e lutam por conta própria.</p>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: telefone ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {grupo.map((c) => (
            <div key={c.nome} className="flex flex-col gap-2 p-3" style={{ background: T.panel, border: `1px solid ${T.lineStrong}`, borderRadius: ENCAIXE.raio }}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="tv-titulo" style={{ fontSize: TIPOS.corpo, color: T.ink }}>{c.nome}</span>
                <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: T.mundoSoft }}>{c.classe || "aventureiro"} · nv {c.nivel || 1}</span>
              </div>
              <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}>{c.vida}/{c.vidaMax} PV{c.manaMax ? ` · ${c.mana != null ? c.mana : c.manaMax}/${c.manaMax} PM` : ""}</span>
              {(c.habilidades || []).map((h, i) => (
                <div key={i} className="flex flex-col">
                  <span className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.ink }}>{nomeDe(h)}{typeof h === "object" && h.custo != null ? <span className="tv-mono" style={{ color: T.violetSoft }}> · {h.custo} PM</span> : null}</span>
                  {typeof h === "object" && h.descricao ? <span className="tv-body" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>{h.descricao}</span> : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      ),
    );
  }

  /* ---- a coluna da esquerda (mesa) / a faixa (meia, telefone) ---- */
  const outras = CLASSES.map((c) => c.nome).filter((n) => !abertas.includes(n));
  const espDoHeroi = especializacaoEscolhida(pers, abaClasse);
  const espOpcoes = subDoHeroi ? especializacoesDaSubclasse(subDoHeroi) : [];
  const cartaoDaClasse = (cl) => {
    const ativa = cl === abaClasse;
    const sub = subclasseEscolhida(pers, cl);
    const gema = sub ? GEMA_DA_SUBCLASSE[sub] || null : null;
    return (
      <button key={cl} type="button" onClick={() => trocarClasse(cl)} aria-pressed={ativa ? "true" : "false"}
        className="tv-anel-foco flex flex-col gap-2 p-3 text-left w-full"
        style={{ background: ativa ? T.couro : T.panel, border: `${ativa ? 2 : 1}px solid ${ativa ? OURO.meio : T.lineStrong}`, borderRadius: ENCAIXE.raio, cursor: "pointer" }}>
        <span className="flex flex-col">
          <span className="tv-titulo uppercase" style={{ fontSize: TIPOS.corpo, letterSpacing: "0.08em", color: ativa ? OURO.claro : T.ink }}>{cl}</span>
          <span className="tv-body" style={{ fontSize: TIPOS.piso, color: T.amberSoft }}>{pontosDito(ranks[cl] || 0).replace("ponto", "degrau")} · nível {nivel}</span>
        </span>
        {ativa && sub ? (
          <span className="flex items-center gap-2">
            <Gema gema={gema} degrau="ouro" tamanho={TIPOS.titulo} />
            <span className="flex flex-col">
              <span className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.ink }}>{sub}</span>
              <span className="tv-body" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>{gema ? `a ${gema.pedra} · ` : ""}aberta aos {RANK_PARA_SUBCLASSE}</span>
            </span>
          </span>
        ) : null}
        {ativa && sub && espOpcoes.length ? (
          <span className="flex items-center gap-2">
            <svg aria-hidden="true" width={TIPOS.titulo} height={TIPOS.titulo} viewBox="0 0 64 64"><path d={N.formas.subclasse.d} fill="none" stroke={PRATA.meio} strokeWidth="5" strokeDasharray={espDoHeroi ? undefined : "8 6"} /></svg>
            <span className="tv-body" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>{espDoHeroi ? `Especialização: ${espDoHeroi}` : `Especialização aos ${RANK_PARA_ESPECIALIZACAO}: ${espOpcoes.join(" ou ")}`}</span>
          </span>
        ) : null}
      </button>
    );
  };
  const abrirOutra = (
    <div className="flex flex-col gap-2">
      <VerboComPreco verbo="Abrir outra classe" preco="multiclasse · 1 ponto o degrau 1" aoTocar={() => setAbrindo((x) => !x)} />
      {abrindo || nova ? (
        <div className="flex flex-wrap gap-2">
          {outras.map((n) => (
            <button key={n} type="button" onClick={() => trocarClasse(n)} aria-pressed={n === abaClasse ? "true" : "false"} className="tv-anel-foco tv-body px-3"
              style={{ minHeight: CABECALHO_DA_TELA.fechar, fontSize: TIPOS.rotulo, borderRadius: ENCAIXE.raio, background: n === abaClasse ? T.couro : "transparent", border: `1px ${n === abaClasse ? "solid" : "dashed"} ${n === abaClasse ? OURO.meio : T.lineStrong}`, color: n === abaClasse ? OURO.claro : T.inkMeio }}>
              {n}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
  const recomecarVerbo = <VerboComPreco papel="semVolta" verbo="Recomeçar do zero" preco={`◉ ${custo} · desfaz todas as escolhas`} aoTocar={() => setSel({ chave: "respec", tipo: "respec" })} />;
  const rotuloMono = (t) => <span className="tv-mono uppercase" style={{ fontSize: TIPOS.maquina, letterSpacing: "0.12em", color: T.inkDim }}>{t}</span>;

  /* ---- O GRIMÓRIO ---- */
  if (aba === "grimorio" && grim) {
    const corpoGrim = <Grimorio grim={grim} pers={pers} escolhido={sel && sel.chave} aprendeu={aprendeu} aoTocar={tocarMagia} />;
    const frase = aprendeu && grim.circulos.some((c) => c.magias.some((m) => m.nome === aprendeu.nome && ESTADO_DA_MAGIA[m.estado] === "aprendido"))
      ? <FraseDaCerimonia nome={aprendeu.nome} aoAcabar={() => setAprendeu(null)} /> : null;
    if (telefone) return moldura(<>{frase}{corpoGrim}<CaixaDoVeredito modo="telefone" v={v} aoFechar={fechar} /></>);
    return moldura(
      <div className="grid gap-6 items-start" style={{ gridTemplateColumns: `minmax(0, 1fr) ${leiaute === "mesa" ? A.mesa.veredito : A.meia.popover}px` }}>
        <div className="flex flex-col gap-3">{frase}{corpoGrim}</div>
        <div className="sticky top-0"><CaixaDoVeredito modo="mesa" v={v} aoFechar={fechar} /></div>
      </div>,
    );
  }

  /* ---- A ÁRVORE ---- */
  const aprendeuAqui = aprendeu && modelo.nos.some((n) => !n.escolha && n.h.nome === aprendeu.nome && n.h.dominada);
  const frase = aprendeuAqui && vista !== "ceu" ? <FraseDaCerimonia nome={aprendeu.nome} aoAcabar={() => setAprendeu(null)} /> : null;
  const larguraDaArvore = leiaute === "telefone" ? Math.max(0, largura - 2 * CABECALHO_DA_TELA.telefone.lado) : 0;
  const popover = leiaute === "meia" && v && sel && sel.onde ? <CaixaDoVeredito modo="meia" v={v} onde={sel && sel.onde} larguraDaArvore={A.meia.rotulos + COLS.length * A.meia.passo} aoFechar={fechar} /> : null;
  const arvore = (
    <Arvore modelo={modelo} leiaute={leiaute} largura={larguraDaArvore} ranks={ranks} classe={abaClasse}
      escolhido={sel && sel.chave} aprendeu={aprendeu} aoTocarNo={tocarNo} aoTocarBanda={tocarBanda} popover={popover} />
  );
  const legenda = (
    <p className="tv-body" style={{ fontSize: TIPOS.piso, color: T.inkDim, margin: 0 }}>
      ✓ aprendido · o número = pontos para aprender · cadeado = ainda não (o porquê no veredito)
    </p>
  );
  const temCeu = !!FIGURAS_DA_CONSTELACAO[abaClasse];
  const verboDaVista = !temCeu ? null : vista === "ceu"
    ? <VerboComPreco verbo="Ver a árvore" preco={telefone ? null : "a mesma árvore, deitada"} aoTocar={() => trocarVista("arvore")} />
    : <VerboComPreco verbo="Ver o céu" preco={telefone ? null : "a mesma árvore, no céu"} aoTocar={() => trocarVista("ceu")} />;
  const quadroDaArvore = (
    <div className="flex flex-col gap-3 p-3 relative" style={{ background: T.panel, border: `1px solid ${alfa(OURO.meio, 0.6)}`, borderRadius: ENCAIXE.raio }}>
      {frase ? <div className="absolute left-0 right-0 z-20" style={{ top: N.folga }}>{frase}</div> : null}
      {verboDaVista ? <div className="flex justify-end">{verboDaVista}</div> : null}
      {nova ? <p className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.inkMeio, margin: 0 }}>{(classePorNome(abaClasse) || {}).desc} Um ponto num talento do degrau 1 abre {abaClasse} ao lado de {pers.classe}.</p> : null}
      <div className={leiaute === "mesa" ? "tv-scroll overflow-x-auto" : ""}>{arvore}</div>
      {legenda}
    </div>
  );

  /* ---- O CÉU (AR 11): a mesma árvore, no céu ---- */
  let quadro = quadroDaArvore;
  if (vista === "ceu" && temCeu) {
    const espDaFrente = especializacaoEscolhida(pers, abaClasse);
    const modelos = { [abaClasse]: modelo };
    const modeloDe = (cl) => {
      if (!modelos[cl]) { try { modelos[cl] = modeloDaArvore(pers, cl); } catch { modelos[cl] = { nos: [], bandas: [], sub: null }; } }
      return modelos[cl];
    };
    const estadoNoCeu = (cl, e) => estadoDaEstrela(modeloDe(cl), cl, e, especializacaoEscolhida(pers, cl));
    /* as outras classes do herói, por degraus (desempate pelo nome) */
    const atras = abertas.filter((cl) => cl !== abaClasse && FIGURAS_DA_CONSTELACAO[cl])
      .sort((a, b) => (ranks[b] || 0) - (ranks[a] || 0) || a.localeCompare(b))
      .map((cl) => ({ classe: cl, sub: subclasseEscolhida(pers, cl), esp: especializacaoEscolhida(pers, cl) }));
    const figura = FIGURAS_DA_CONSTELACAO[abaClasse].figura;
    const daClasseToda = modelo.nos.filter((n) => n.banda === "classe" && !n.escolha);
    const fechou = !!aprendeuAqui && daClasseToda.some((n) => n.h.nome === aprendeu.nome) && daClasseToda.every((n) => n.h.dominada);
    const textoDaFrase = fechou
      ? `${figura.charAt(0).toUpperCase()}${figura.slice(1)} está ${figura.startsWith("a ") ? "completa" : "completo"}`
      : aprendeuAqui ? `${aprendeu.nome} é tua` : null;
    /* sem pontos: o próximo nível que dá pontos (pontosNoNivel) */
    let proximo = nivel + 1;
    while (pontosNoNivel(proximo) <= 0 && proximo < nivel + COLS[COLS.length - 1] * 2) proximo++;
    const aviso = pontos > 0 ? null : `Sem pontos por gastar — o próximo chega no nível ${proximo}`;
    const popoverDoCeu = leiaute === "meia" && v && sel && sel.onde && sel.estrela
      ? <CaixaDoVeredito modo="meia" v={v} onde={sel.onde} larguraDaArvore={medidasDoCeu(leiaute, larguraDaArvore, atras.length).largo} aoFechar={fechar} /> : null;
    quadro = (
      <div className="flex flex-col gap-3 relative">
        {textoDaFrase ? <div className="absolute left-0 right-0 z-20" style={{ top: N.folga }}><FraseDaCerimonia texto={textoDaFrase} aoAcabar={() => setAprendeu(null)} /></div> : null}
        {nova ? <p className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.inkMeio, margin: 0 }}>{(classePorNome(abaClasse) || {}).desc} Um ponto num talento do degrau 1 abre {abaClasse} ao lado de {pers.classe}.</p> : null}
        <div className={telefone ? "" : "tv-scroll overflow-x-auto"}>
          <CeuDoHeroi classe={abaClasse} sub={subDoHeroi} esp={espDaFrente} estadoDaEstrela={estadoNoCeu} atras={atras}
            leiaute={leiaute} largura={larguraDaArvore} escolhida={sel && sel.estrela} foco={focoDoCeu} aoFocar={setFocoDoCeu}
            aoTocarEstrela={tocarEstrela} aoTrazer={trocarClasse} aprendeu={aprendeuAqui ? aprendeu.nome : null} fechou={fechou}
            saindo={saindo} aoAcabarSaida={() => setSaindo(null)} verbo={verboDaVista} aviso={aviso} popover={popoverDoCeu} />
        </div>
      </div>
    );
  }

  if (leiaute === "mesa") {
    return moldura(
      <div className="grid gap-5 items-start" style={{ gridTemplateColumns: `${A.mesa.esquerda}px minmax(0, 1fr) ${A.mesa.veredito}px` }}>
        <div className="flex flex-col gap-3">
          {rotuloMono("A tua classe")}
          {abertas.map(cartaoDaClasse)}
          {abrirOutra}
          <div className="mt-6 flex flex-col gap-2">{rotuloMono("Recomeçar")}{recomecarVerbo}</div>
        </div>
        {quadro}
        <div className="sticky top-0"><CaixaDoVeredito modo="mesa" v={v} aoFechar={fechar} /></div>
      </div>,
    );
  }
  /* a faixa: a classe, a gema e (no telefone) os pontos */
  const faixa = (
    <div className="flex items-center gap-3 flex-wrap">
      {abertas.map((cl) => (
        <button key={cl} type="button" onClick={() => trocarClasse(cl)} aria-pressed={cl === abaClasse ? "true" : "false"} className="tv-anel-foco flex items-center gap-2 px-2"
          style={{ minHeight: CABECALHO_DA_TELA.fechar, background: "transparent", border: "none", borderBottom: `2px solid ${cl === abaClasse ? OURO.meio : "transparent"}` }}>
          <span className="tv-titulo uppercase" style={{ fontSize: A.regua.numero, letterSpacing: "0.08em", color: cl === abaClasse ? OURO.claro : T.inkMeio }}>{cl} · {ranks[cl] || 0}</span>
          {cl === abaClasse && gemaDoHeroi ? <><Gema gema={gemaDoHeroi} degrau="ouro" tamanho={TIPOS.corpo} /><span className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.ink }}>{subDoHeroi}</span></> : null}
        </button>
      ))}
      <span className="flex-1" />
      {telefone ? <span className="tv-body" style={{ fontSize: TIPOS.rotulo, fontWeight: 600, color: pontos > 0 ? T.amber : T.inkDim }}>{pontosDito(pontos)}</span> : null}
    </div>
  );
  return moldura(
    <>
      {faixa}
      {quadro}
      <div className="grid gap-3" style={{ gridTemplateColumns: telefone ? "1fr" : "repeat(2, minmax(0, 1fr))" }}>
        {abrirOutra}
        {recomecarVerbo}
      </div>
      {telefone || (sel && !sel.onde) ? <CaixaDoVeredito modo="telefone" v={v} aoFechar={fechar} /> : null}
    </>,
  );
}
