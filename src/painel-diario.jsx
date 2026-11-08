/* ============================================================
   PAINEL DIÁRIO — o portal de missões (AR2, 06/11/2026) — Taverna
   Extraído do App.jsx na modularização (v8.8); refeito em AR2 pela forma
   de formas.md §AR 2 (Figma 273:296 · 274:440 · 274:649).

   A pessoa, em 05/11: «parecer mais com um portal de quests, ser mais
   claro, dizendo qual é a quest, qual é o próximo passo, quais etapas dela
   foram concluídas e quais quests foram concluídas».

   À esquerda o índice (em curso, ofertas, a estante), com o próximo passo
   em cada linha; ao meio a missão escolhida: o próximo passo em caixa
   própria, as etapas numa linha do tempo, o que se ganha; à direita, a
   1905, o mundo que não espera. No telefone, três abas.

   A LEI DE v9.27 CONTINUA, agora com forma: o que vem depois do passo de
   agora existe e conta-se, mas não se diz o quê (a silhueta «?»). Uma
   lista aberta faria da aventura um checklist. E o que o herói ainda não
   sabe (a reviravolta de uma secundária) nunca aparece.

   O leiaute escolhe-se pela largura DO PAINEL (não da janela): hoje ele
   vive na gaveta de 320 e lá é o do telefone; numa tela inteira abre as
   três colunas sem mudar uma linha.

   O que o painel aceita e o jogo ainda não lhe dá (props opcionais; sem
   elas a tela cala, nunca inventa):
     relogios          — a lista do jogo; o prazo lê `missao:<id>` (o que resta)
     aoVerNoMapa(m, e) — «Ver no mapa» centrado no lugar do passo
     distanciaDoPasso(m, e) → { tipo, rotulo, nome, zonas, noId } | null —
                       a distância até ao lugar (missoes.js, distanciaDoPasso)
     aoFechar          — quando o Diário é tela inteira: o cabeçalho e o Esc
     leiaute           — "mesa" | "meia" | "telefone", para quem já sabe a largura
     a etapa com `feitoEm` (o dia) — «cumprida no dia N»; sem ele, «cumprida»

   BQ (08/11/2026, formas.md §BQ 3–5; Figma 319:1233 · 320:1641 · 320:1425 ·
   320:1838) · AS QUESTS DA BIBLIOTECA E AS DUAS HISTÓRIAS. Props novas, e
   opcionais (sem elas o Diário é o de AR2, byte a byte):
     questsDaBiblioteca — [{ missao, estado }]: a projeção (`missaoDaQuest`)
                       e a vista (`estadoDaQuest`) de cada quest. A do tipo 1
                       é a estrada (couro e âmbar); a do tipo 2 é quem anda
                       contigo (papel e lacre), sempre à vista à direita.
     rostoDe(gente)    → o retrato (um nó) de { id, nome, papel } — a gente
                       da história, quem anda contigo; sem ele, o aro vazio
     vilaoNoDiario     — o cartaz da sombra (`oVilaoNoDiario`): só até à
                       camada alcançada, e a peça confere outra vez
     rostoDoVilao, rostoDoTenente — os retratos do cartaz (nós)
   Da vista da quest o Diário lê: etapaTexto, falta (o «o que falta», ≤ 2
   de um «ou»), feitas[i].como (como se fez), escolhas, gente (só quem o
   herói conheceu), reviravolta { dia, texto, vistaEm } (sem vistaEm, por
   ler: no topo; lida, um marco na linha do tempo), comQuem (quem anda
   contigo), e no fim desfecho, luto, comoFicou e fecho.texto (o epitáfio).
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { TIPOS, ALVOS, alfa, MOLDURA_POR_DEGRAU, COR_DA_RARIDADE, ENCAIXE, ICONES_DA_ETAPA, DIARIO_DE_MISSOES, RELOGIO_DO_PRAZO, CABECALHO_DA_TELA, DIARIO_DA_QUEST, CARTAZ_DA_SOMBRA } from "./estilo.js";
import { Glifo, VerboComPreco } from "./ui.jsx";
import { GlifoAR, CabecalhoDaTela, AbaDaTela, EtapaDaMissao, RelogioDoPrazo, LombadaDaEstante, MissaoNoIndice, LinhaDoQueFalta, CaminhosDaEtapa, RostoDaHistoria } from "./painel-ar-pecas.jsx";
import { COMBINADORES } from "./condicoes-da-quest.js";
import { CAMPOS_DA_CAMADA } from "./plano-do-vilao.js";
import { FASES as CAMADAS_DO_VILAO } from "./vilao.js";
import { DesenhoDoObjeto } from "./painel-mesa-do-mestre.jsx";
import { ESTRUTURAS, estruturaPorId } from "./historia.js";
import { garantirMissoes, etapaAtual, progresso as progressoMissao, textoDaEtapa, tipoDef as tipoMissao, temPrazo, rumoDaEtapa } from "./missoes.js";
import { dificuldadeDaMissao } from "./dificuldade.js";
import { lerSecundaria } from "./secundaria-planeada.js";
/* MM13: o próximo passo em voz de mundo ("Procurar Nostoc no mercado"),
   só para a missão que a abertura pôs na mesa — as outras continuam com
   o rumo da etapa, que já é delas. */
import { proximoPasso } from "./abertura.js";

const D = DIARIO_DE_MISSOES;
const OURO = MOLDURA_POR_DEGRAU.ouro;
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

/* ---------------- O QUE SE LÊ DE UMA MISSÃO ----------------
   Tudo sai do jogo; nada aqui decide. */
function prazoDe(m, relogios) {
  if (!temPrazo(m)) return null;
  const r = (Array.isArray(relogios) ? relogios : []).find((x) => x && x.fonte === `missao:${m.id}`);
  if (!r || !(Number(r.segmentos) > 0)) return null;
  const segmentos = Math.round(Number(r.segmentos));
  const cheios = Math.max(0, Math.min(segmentos, Math.round(Number(r.cheios) || 0)));
  return { segmentos, cheios, restam: segmentos - cheios };
}
function secundariaDe(m) { try { return lerSecundaria(m); } catch { return null; } }
function rumoDe(m, e, pistaMundo) {
  if (!e) return "";
  if (pistaMundo) return pistaMundo;
  try { return rumoDaEtapa(e) || textoDaEtapa(e); } catch { return ""; }
}
function textoDe(e) { try { return textoDaEtapa(e); } catch { return String((e && e.alvo) || ""); } }
function glifoDoTipo(m) {
  if (m.status === "oferecida") return D.glifoDoTipo.oferta;
  return D.glifoDoTipo[m.tipo] || D.glifoDoTipo.favor;
}
/* O gancho de uma secundária termina com o custo de falhar («Se as noites
   passarem…», «Se tardar…»): a voz de quem pede vai no bilhete, o custo
   por baixo, na cor do perigo. */
function partirOGancho(g) {
  const s = String(g || "").trim();
  const i = s.lastIndexOf(" Se ");
  return i > 0 ? { voz: s.slice(0, i).trim(), custo: s.slice(i + 1).trim() } : { voz: s, custo: "" };
}
/* O fecho de uma secundária, dito como o que se ganha. */
const FECHO_DO_LACO = { amizade: "passa a confiar em ti", divida: "fica a dever-te um favor", aprendizado: "ensina-te o que nunca ensinou" };
function fraseDoFecho(f) {
  if (!f) return "";
  if (f.tipo === "laco") return `e ${f.quem} ${FECHO_DO_LACO[f.laco] || "não esquece o que fizeste"}`;
  if (f.tipo === "lugar") return `e ${String(f.nome || "").replace(/^(O|A|Os|As) /, (x) => x.toLowerCase())} fica no teu mapa`;
  if (f.tipo === "porta") return `e a estrada para ${f.cidade} abre-se`;
  return "";
}
const NOME_DA_RARIDADE = { comum: "comum", incomum: "incomum", raro: "raro", epico: "épico", lendario: "lendário", unico: "único" };

/* ---------------- BQ · O QUE SE LÊ DE UMA QUEST ----------------
   A vista (`estadoDaQuest`) é a verdade; aqui só se arruma para a tela. */
const Q = DIARIO_DA_QUEST;
const arr = (x) => (Array.isArray(x) ? x : []);
const encher = (modelo, mapa) => String(modelo || "").replace(/\{(\w+)\}/g, (_, k) => (mapa[k] != null ? String(mapa[k]) : ""));
/* «o que falta» em linhas: de um «ou», até dois caminhos — primeiro os que são
   cartas de uma escolha (já estão na mesa), depois os outros pela ordem da
   ficha — e o resto calado em «ou outro caminho» (lei de v9.27: uma lista
   inteira faria da história um checklist) */
export function linhasDaFalta(falta) {
  const junta = COMBINADORES.todos.junta;
  const out = [];
  for (const f of arr(falta)) {
    if (!f || typeof f !== "object" || f.invalida) continue;
    if (f.predicado === "algum") {
      const ramos = arr(f.opcoes).map((r) => {
        const itens = arr(r).filter((x) => x && typeof x === "object");
        return { texto: itens.map((x) => String(x.texto || "").trim()).filter(Boolean).join(junta), carta: itens.some((x) => x.predicado === "escolheu") };
      }).filter((r) => r.texto);
      const ordenados = [...ramos.filter((r) => r.carta), ...ramos.filter((r) => !r.carta)];
      for (const r of ordenados.slice(0, Q.falta.doOu)) out.push({ estado: "falta", texto: r.texto });
      if (ordenados.length > Q.falta.doOu) out.push({ estado: "outro", texto: "" });
      continue;
    }
    const texto = String(f.texto || "").trim();
    if (!texto) continue;
    out.push({ estado: "falta", texto, tem: Number.isInteger(f.tem) ? f.tem : null, precisa: Number.isInteger(f.precisa) ? f.precisa : null });
  }
  return out;
}
/* a etapa de agora fecha por mais de um caminho? (um «ou» no que falta, ou
   uma escolha aberta) — o Diário di-lo, nunca quais */
const temRamos = (q) => !!q && (arr(q.falta).some((f) => f && (f.predicado === "algum" || f.predicado === "pelo_menos")) || arr(q.escolhas).length > 0);
/* a reviravolta por ler: sem `vistaEm` no registo, fica no topo */
const reviravoltaDe = (q) => (q && q.reviravolta && String(q.reviravolta.texto || "").trim() ? q.reviravolta : null);
const porLer = (q) => { const r = reviravoltaDe(q); return !!r && !(r.vistaEm != null || r.lida); };
const idDaEtapa = (e) => { const c = String((e && e.chave) || ""); const i = c.lastIndexOf(":"); return i < 0 ? "" : c.slice(i + 1); };
const comQuemDe = (q) => { const c = q && q.comQuem; if (!c) return null; if (typeof c === "string") return c.trim() ? { nome: c.trim() } : null; return c.nome ? c : null; };
const rostoSeguro = (rostoDe, ref) => { if (!rostoDe || !ref) return null; try { return rostoDe(ref) || null; } catch { return null; } };

/* ---------------- AS PEQUENAS ---------------- */
function Rotulo({ children, cor = T.inkDim, extra = null }) {
  return (
    <div className="tv-mono uppercase tracking-widest flex items-baseline gap-2 mb-2" style={{ fontSize: TIPOS.maquina, color: cor }}>
      <span>{children}</span>
      {extra ? <span className="tv-body normal-case tracking-normal" style={{ color: T.inkDim }}>{extra}</span> : null}
    </div>
  );
}
function Chip({ children, cor = T.amberSoft, borda = alfa(T.amber, 0.6) }) {
  return <span className="tv-mono inline-flex items-center gap-1 px-2 py-0.5 rounded" style={{ fontSize: TIPOS.maquina, color: cor, border: `1px solid ${borda}` }}>{children}</span>;
}

/* ---------------- O PRÓXIMO PASSO ----------------
   O medalhão do tipo da etapa, a frase do rumo, o lugar com o pino e,
   quando o jogo o der, «Ver no mapa» com o preço (o sítio e a distância). */
function ProximoPasso({ m, e, frase, telefone, aoVerNoMapa, distanciaDoPasso, falta = null }) {
  /* BQ: debaixo da frase da etapa, «o que falta», uma linha por coisa */
  const linhas = linhasDaFalta(falta);
  const P = D.proximoPasso;
  const lado = telefone ? P.medalhao.telefone : P.medalhao.mesa;
  const onde = String((e && e.onde) || "").trim();
  /* a distância é do jogo (o mapa vivo); sem ela, a linha diz só o lugar */
  let dist = null;
  if (distanciaDoPasso) { try { const d = distanciaDoPasso(m, e); dist = d && typeof d === "object" && d.rotulo ? d : null; } catch { dist = null; } }
  const longe = !dist ? "" : dist.tipo === "aqui" ? "estás aqui" : dist.tipo === "zonas" ? `${dist.rotulo} daqui` : dist.rotulo;
  const sitio = (dist && dist.nome) || (onde ? onde.split(",")[0].trim() : String((e && e.alvo) || ""));
  const precoDoMapa = [sitio, !dist ? "" : dist.tipo === "zonas" && Number.isFinite(dist.zonas) ? plural(dist.zonas, "zona", "zonas") : dist.rotulo].filter(Boolean).join(" · ");
  /* «Ver no mapa» só quando o mapa sabe onde é o sítio */
  const podeVer = !!aoVerNoMapa && (!distanciaDoPasso || !!(dist && dist.noId));
  return (
    <section aria-label="O próximo passo" className={`flex ${telefone ? "flex-col" : "items-center"} gap-4 p-4`} style={{
      background: T.couro, border: `${P.borda}px solid ${T.amber}`, borderRadius: P.raio,
      boxShadow: `0 0 ${P.halo.raio}px ${alfa(T.amber, P.halo.alfa)}`,
    }}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <span aria-hidden="true" className="flex items-center justify-center shrink-0" style={{ width: lado, height: lado, borderRadius: lado, border: `${P.borda}px solid ${T.amber}`, background: T.couroBaixo }}>
          <GlifoAR familia="etapa" nome={ICONES_DA_ETAPA[e.tipo] ? e.tipo : "ir_a"} tamanho={telefone ? P.glifo.telefone : P.glifo.mesa} cor={T.amberSoft} />
        </span>
        <div className="flex flex-col min-w-0 gap-0.5">
          <span className="tv-mono uppercase tracking-widest" style={{ fontSize: TIPOS.maquina, color: T.amberSoft }}>O próximo passo</span>
          <span className="tv-body" style={{ fontSize: telefone ? P.frase.telefone : P.frase.mesa, color: T.ink, fontWeight: 600 }}>{frase}</span>
          {onde ? (
            <span className="tv-body flex items-start gap-1.5" style={{ fontSize: TIPOS.rotulo, color: T.mundoSoft }}>
              <GlifoAR nome="pino" tamanho={TIPOS.rotulo} />
              <span>{onde}{longe ? ` — ${longe}` : ""}</span>
            </span>
          ) : null}
          {linhas.length ? (
            <ul className="m-0 p-0 flex flex-col mt-1" aria-label="O que falta" style={{ gap: 2 }}>
              {linhas.map((l, i) => <LinhaDoQueFalta key={i} estado={l.estado} texto={l.texto} tem={l.tem} precisa={l.precisa} />)}
            </ul>
          ) : null}
        </div>
      </div>
      {podeVer ? (
        <VerboComPreco papel="armado" verbo="Ver no mapa" preco={precoDoMapa} className={telefone ? "w-full" : "shrink-0"}
          aoTocar={() => { try { aoVerNoMapa(m, e); } catch { /* o mapa nunca derruba o diário */ } }} />
      ) : null}
    </section>
  );
}

/* ---------------- AS ETAPAS ----------------
   Feitas com ✓; a atual acesa; as que faltam como silhueta, contadas sem
   dizer o quê. No telefone só as duas que importam: a última feita e a
   primeira por saber, com «e mais N». */
function LinhaDoTempo({ m, frase, compacto, comAtual = false, q = null }) {
  const etapas = Array.isArray(m.etapas) ? m.etapas : [];
  const atual = etapaAtual(m);
  const iAtual = atual ? etapas.indexOf(atual) : -1;
  /* BQ: como se fez cada etapa da quest (a primeira frase da solução) */
  const comoDe = (e) => { if (!q) return ""; const f = arr(q.feitas).find((x) => x && x.id === idDaEtapa(e)); return f ? String(f.como || "").trim() : ""; };
  const linhas = etapas.map((e, i) => {
    if (e.feito) {
      const dia = Number(e.feitoEm);
      /* a etapa da quest diz-se pela frase de mundo que a projeção já traz */
      return { i, estado: "feita", tipo: e.tipo, texto: q ? String(e.alvo || "") : textoDe(e), nota: Number.isFinite(dia) && dia > 0 ? `cumprida no dia ${dia}` : "cumprida", como: comoDe(e) };
    }
    if (i === iAtual) {
      const onde = String(e.onde || "").trim();
      return { i, estado: "atual", tipo: e.tipo, texto: frase, nota: onde ? `${onde} — é o passo de agora` : "é o passo de agora", ramos: temRamos(q) };
    }
    return { i, estado: "silhueta", tipo: e.tipo, texto: "Ainda não se sabe", nota: i === iAtual + 1 ? "abre-se quando a de cima se cumprir" : "" };
  });
  /* BQ: a reviravolta já lida é um marco próprio, no sítio em que aconteceu
     (depois da última etapa cumprida até ao dia dela); por ler, mora no topo */
  const rv = reviravoltaDe(q);
  if (rv && !porLer(q)) {
    const diaRv = Number(rv.dia);
    let k = linhas.findIndex((l) => !(l.estado === "feita" && (!Number.isFinite(diaRv) || !Number.isFinite(Number(etapas[l.i].feitoEm)) || Number(etapas[l.i].feitoEm) <= diaRv)));
    if (k < 0) k = linhas.length;
    linhas.splice(k, 0, { i: "virou", estado: "virou", tipo: "", texto: String(rv.texto), nota: Number.isFinite(diaRv) && diaRv > 0 ? `dia ${diaRv} · ${Q.reviravolta.noIndice}` : Q.reviravolta.noIndice });
  }
  let mostrar = linhas;
  if (compacto) {
    const feitas = linhas.filter((l) => l.estado === "feita");
    const porSaber = linhas.filter((l) => l.estado === "silhueta");
    mostrar = [];
    if (feitas.length) {
      const u = feitas[feitas.length - 1];
      mostrar.push({ ...u, nota: feitas.length > 1 ? `e mais ${feitas.length - 1} ${feitas.length - 1 === 1 ? "cumprida" : "cumpridas"} antes` : u.nota });
    }
    const virou = linhas.find((l) => l.estado === "virou");
    if (virou) mostrar.push(virou);
    /* a oferta não tem a caixa do próximo passo: o passo vai na linha */
    const at = linhas.find((l) => l.estado === "atual");
    if (comAtual && at) mostrar.push(at);
    if (porSaber.length) {
      const p = porSaber[0];
      mostrar.push({ ...p, nota: porSaber.length > 1 ? `e mais ${porSaber.length - 1} por saber` : p.nota });
    }
  }
  if (!mostrar.length) return null;
  return (
    <ol className="m-0 p-0">
      {mostrar.map((l, k) => (
        <React.Fragment key={l.i}>
          <EtapaDaMissao estado={l.estado} tipo={l.tipo} texto={l.texto} nota={l.nota} ultima={k === mostrar.length - 1 && !l.como && !l.ramos} />
          {l.como ? <li style={{ listStyle: "none", marginTop: -8, marginBottom: 10 }}><CaminhosDaEtapa estado="tomado" texto={l.como} /></li> : null}
          {l.ramos ? <li style={{ listStyle: "none", marginTop: -8, marginBottom: 10 }}><CaminhosDaEtapa estado="abertos" /></li> : null}
        </React.Fragment>
      ))}
    </ol>
  );
}

/* ---------------- O QUE SE GANHA ---------------- */
function OQueSeGanha({ m, sec }) {
  const r = m.recompensa || null;
  const fecho = sec ? fraseDoFecho(sec.fecho) : "";
  if (!r && !fecho) return null;
  const rar = r && r.item ? COR_DA_RARIDADE[r.item] : null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="tv-mono uppercase tracking-widest mr-1" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}>O que se ganha</span>
      {r && r.moedas ? <Chip><Glifo nome="moeda" tamanho={TIPOS.maquina} /> {r.moedas}{r.combinada ? " · o combinado" : ""}</Chip> : null}
      {r && r.xp ? <Chip>{r.xp} XP</Chip> : null}
      {r && r.fama ? <Chip>Fama +{r.fama}</Chip> : null}
      {rar ? (
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="tv-body inline-flex items-center justify-center rounded" style={{ width: TIPOS.display, height: TIPOS.display, background: rar.fundo, border: `${rar.fio}px solid ${rar.cor}`, color: T.inkDim, fontSize: TIPOS.rotulo }}>?</span>
          <span className="tv-body" style={{ fontSize: TIPOS.rotulo, color: T.inkMeio }}>e um item {NOME_DA_RARIDADE[r.item] || ""}</span>
        </span>
      ) : null}
      {fecho ? (
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="tv-body" style={{ color: OURO.meio, fontSize: TIPOS.corpo }}>{D.glifoDoTipo.favor}</span>
          <span className="tv-body" style={{ fontSize: TIPOS.corpo, color: T.ink }}>{fecho}</span>
        </span>
      ) : null}
    </div>
  );
}

/* ---------------- O BILHETE ----------------
   O gancho de uma secundária na voz de quem pediu, em papel da mesa, com o
   custo de falhar por baixo. A reviravolta não entra: é o que o herói ainda
   não sabe. */
function Bilhete({ m, sec }) {
  const B = D.bilhete;
  const { voz, custo } = partirOGancho(sec.gancho);
  return (
    <figure className="m-0" style={{
      maxWidth: B.largura, padding: `${B.enchimento[0]}px ${B.enchimento[1]}px`, borderRadius: B.raio,
      background: T.pergaminho, border: `1px solid ${T.pergaminhoBorda}`, transform: `rotate(-${B.giro}deg)`,
      boxShadow: `0 ${ENCAIXE.sombraDoEscolhido.y}px ${ENCAIXE.sombraDoEscolhido.raio}px ${alfa(ENCAIXE.sombra, ENCAIXE.sombraDoEscolhido.alfa)}`,
    }}>
      <blockquote className="tv-body italic m-0" style={{ fontSize: TIPOS.corpo, color: T.tintaDoPergaminho }}>«{voz}»</blockquote>
      {m.dador ? <figcaption className="tv-body mt-2" style={{ fontSize: TIPOS.piso, color: T.tintaDoPergaminhoDim }}>— {m.dador}</figcaption> : null}
      {custo ? <div className="tv-body mt-2" style={{ fontSize: TIPOS.rotulo, color: T.perigoNoPergaminho }}>{custo}</div> : null}
    </figure>
  );
}

/* ---------------- A MISSÃO À FRENTE ---------------- */
function MissaoAFrente({ m, todas, abertura, pers, relogios, telefone, compacto, aoResponder, aoEncerrarLegado, aoVerNoMapa, distanciaDoPasso, q: qDado = null, estadoDe = null, rostoDe = null, semGente = false }) {
  /* BQ: a quest da biblioteca (q = a vista dela) — a estrada ou quem anda contigo */
  const q = qDado || (estadoDe ? estadoDe(m.id) : null);
  const coracao = !!q && q.tipo === 2;
  const t = tipoMissao(m.tipo);
  const sec = secundariaDe(m);
  const oferta = m.status === "oferecida";
  let dif = null; try { dif = dificuldadeDaMissao(m, pers); } catch { dif = null; }
  const p = progressoMissao(m);
  const atual = etapaAtual(m);
  let pistaMundo = "";
  if (m.tipo === "principal" && !q) { try { pistaMundo = proximoPasso({ abertura, missoes: todas }); } catch { pistaMundo = ""; } }
  const frase = q ? String(q.etapaTexto || (atual && atual.alvo) || "") : rumoDe(m, atual, pistaMundo);
  const prazo = prazoDe(m, relogios);
  const lado = !telefone && !compacto;
  const rv = porLer(q) ? reviravoltaDe(q) : null;
  return (
    <article className="flex flex-col gap-5" aria-label={m.titulo}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {q ? (
            <Chip cor={coracao ? T.rosa : T.amberSoft} borda={coracao ? alfa(T.rosa, 0.7) : alfa(T.amber, 0.6)}>
              {coracao ? Q.indice.glifoDoCoracao : glifoDoTipo(m)} {coracao ? Q.indice.coracao : Q.indice.estrada}
            </Chip>
          ) : (
          <Chip cor={oferta ? T.violetSoft : sec ? T.mundoSoft : T.amberSoft} borda={oferta ? T.violet : sec ? alfa(T.mundoSoft, 0.6) : alfa(T.amber, 0.6)}>
            {glifoDoTipo(m)} {(oferta ? "Oferta" : sec ? "Secundária" : t.rotulo).toUpperCase()}
          </Chip>
          )}
          {sec && m.dador ? <Chip cor={T.inkMeio} borda={T.lineStrong}>pedida por {m.dador}</Chip> : null}
          {dif ? <Chip cor={T[dif.patamar.cor] || T.inkDim} borda={T.lineStrong}>{dif.patamar.icone} {dif.patamar.rotulo.toUpperCase()}</Chip> : null}
          {compacto && p.total > 1 ? <span className="tv-body" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>{p.feitas} de {p.total} etapas</span> : null}
        </div>
        {prazo ? (
          <div className="flex items-center gap-2">
            <RelogioDoPrazo segmentos={prazo.segmentos} cheios={prazo.cheios} lado={RELOGIO_DO_PRAZO.lado} />
            <div className="flex flex-col">
              <span className="tv-body" style={{ fontSize: TIPOS.corpo, color: prazo.restam <= RELOGIO_DO_PRAZO.apertaCom ? T.danger : T.ink, fontWeight: 600 }}>faltam {plural(prazo.restam, "noite", "noites")}</span>
              <span className="tv-body" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>de {prazo.segmentos} · cheio, a missão falha</span>
            </div>
          </div>
        ) : temPrazo(m) ? (
          <span className="tv-body flex items-center gap-1.5" style={{ fontSize: TIPOS.piso, color: T.danger }}>
            <Glifo nome="ampulheta" tamanho={TIPOS.maquina} /> {oferta ? "prazo" : "contra o tempo"}: {plural(m.prazo, "noite", "noites")}
          </span>
        ) : null}
      </header>

      <div>
        <h3 className="tv-titulo uppercase m-0" style={{ fontSize: telefone ? D.titulo.telefone : D.titulo.mesa, color: T.ink }}>{m.titulo}</h3>
        {m.dador && !sec ? <div className="tv-body mt-1" style={{ fontSize: TIPOS.rotulo, color: T.inkDim }}>de {m.dador}</div> : null}
        {m.descricao && !sec && !compacto ? <p className="tv-body mt-2 mb-0" style={{ fontSize: TIPOS.corpo, color: T.inkMeio }}>{m.descricao}</p> : null}
      </div>

      {rv ? <BilheteDaReviravolta rv={rv} /> : null}
      {q && !semGente ? <GenteDaHistoria gente={q.gente} rostoDe={rostoDe} /> : null}

      {(sec || (atual && !oferta)) ? (
        <div className={sec && lado ? "grid gap-5 items-start" : "flex flex-col gap-5"} style={sec && lado ? { gridTemplateColumns: `minmax(0, ${D.bilhete.largura}px) minmax(0, 1fr)` } : undefined}>
          {sec ? <Bilhete m={m} sec={sec} /> : null}
          {atual && !oferta && coracao ? <QuestDoCoracao missao={m} estado={q} telefone={telefone || compacto} rosto={rostoSeguro(rostoDe, comQuemDe(q))} /> : null}
          {atual && !oferta && !coracao ? <ProximoPasso m={m} e={atual} frase={frase} telefone={telefone || compacto} aoVerNoMapa={aoVerNoMapa} distanciaDoPasso={distanciaDoPasso} falta={q ? q.falta : null} /> : null}
        </div>
      ) : null}

      {oferta && aoResponder ? (
        <div className="flex flex-wrap gap-2">
          <VerboComPreco papel="armado" verbo="Aceitar" preco={m.dador ? `o trabalho de ${m.dador}` : "o trabalho"} aoTocar={() => aoResponder(m.id, true)} />
          <VerboComPreco papel="recuo" verbo="Recusar" preco="não volta a ser oferecido" aoTocar={() => aoResponder(m.id, false)} />
        </div>
      ) : null}

      {(m.etapas || []).length > 0 ? (
        <div>
          {!compacto ? <Rotulo extra={`${p.feitas} de ${p.total}${p.total - p.feitas > 1 ? " · as que faltam abrem-se pelo caminho" : ""}`}>{sec ? "Os atos" : "As etapas"}</Rotulo> : null}
          <LinhaDoTempo m={m} frase={frase} compacto={compacto} comAtual={oferta} q={q} />
        </div>
      ) : null}

      {m.legado && m.status === "ativa" && aoEncerrarLegado ? (
        <div>
          <div className="tv-body mb-2" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>Encerrável por você.</div>
          <div className="flex flex-wrap gap-2">
            <VerboComPreco papel="gesto" verbo="Já terminei" preco="vai para a estante, cumprida" aoTocar={() => aoEncerrarLegado(m.id, "concluida")} />
            <VerboComPreco papel="semVolta" verbo="Ficou pelo caminho" preco="vai para a estante, falhada" aoTocar={() => aoEncerrarLegado(m.id, "falhada")} />
          </div>
        </div>
      ) : null}

      <OQueSeGanha m={m} sec={sec} />
    </article>
  );
}

/* ---------------- BQ · A REVIRAVOLTA POR LER (320:1641) ----------------
   O bilhete de papel no topo da história, até o jogador abrir o Diário uma
   vez; depois desce para a linha do tempo (o marco `virou`). */
function BilheteDaReviravolta({ rv }) {
  const R = Q.reviravolta;
  const B = R.bilhete;
  const dia = Number(rv.dia);
  return (
    <aside aria-label={R.rotulo} data-reviravolta="por-ler" style={{
      padding: `${B.enchimento[0]}px ${B.enchimento[1]}px`, borderRadius: B.raio, background: B.chao, border: `1px solid ${B.aro}`,
    }}>
      <div className="tv-mono uppercase flex items-center gap-1.5" style={{ fontSize: TIPOS.maquina, color: B.rotulo, fontWeight: 700, letterSpacing: "0.1em" }}>
        <Glifo nome="reviravolta" tamanho={TIPOS.maquina + 2} cor={B.rotulo} />
        <span>{R.rotulo}{Number.isFinite(dia) && dia > 0 ? ` · dia ${dia}` : ""}</span>
      </div>
      <p className="tv-body italic m-0 mt-1" style={{ fontSize: TIPOS.rotulo, color: B.texto }}>{rv.texto}</p>
    </aside>
  );
}

/* ---------------- BQ · A GENTE DESTA HISTÓRIA ----------------
   Só quem o herói já conheceu (o motor filtra); quem traiu leva a racha. */
function GenteDaHistoria({ gente, rostoDe }) {
  const lista = arr(gente).filter((g) => g && String(g.nome || "").trim());
  if (!lista.length) return null;
  return (
    <section aria-label={Q.gente.rotulo}>
      <Rotulo>{Q.gente.rotulo}</Rotulo>
      <ul className="m-0 p-0 flex flex-wrap" style={{ gap: 12 }}>
        {lista.map((g, i) => <RostoDaHistoria key={g.id || g.papel || i} nome={g.nome} papel={g.rotulo || ""} traiu={!!g.traiu} rosto={rostoSeguro(rostoDe, g)} />)}
      </ul>
    </section>
  );
}

/* ---------------- BQ · A HISTÓRIA DO CORAÇÃO (315:92) ----------------
   Papel e não couro, a fita de lacre, o rosto de quem anda contigo, o
   rosário das etapas (a feita cheia, a de agora em anel, as que não se sabem
   tracejadas) e UM passo, com uma linha do que falta. Nunca relógio, nem
   âmbar, nem «Ver no mapa»: anda pelo que se faz com quem está ao lado.
   Antes de a primeira etapa acender não existe (0 px). */
export function QuestDoCoracao({ missao, estado, telefone = false, rosto = null, aoTocar = null }) {
  if (!missao || !estado || estado.visivel === false) return null;
  const C = Q.coracao;
  const etapas = arr(missao.etapas);
  const atual = etapaAtual(missao);
  const iAtual = atual ? etapas.indexOf(atual) : -1;
  const quem = comQuemDe(estado);
  const passo = String(estado.etapaTexto || (atual && atual.alvo) || "").trim();
  const falta = linhasDaFalta(estado.falta).find((l) => l.estado === "falta") || null;
  const lado = telefone ? C.rosto.telefone : C.rosto.mesa;
  const feitas = etapas.filter((e) => e.feito).length;
  const corpo = (
    <>
      <span aria-hidden="true" className="absolute inset-y-0 left-0" style={{ width: C.fita.largura, background: C.fita.cor }} />
      <div className="flex items-start" style={{ gap: 10 }}>
        {quem ? (
          <span aria-hidden="true" className="shrink-0 overflow-hidden flex items-center justify-center" style={{ width: lado, height: lado, borderRadius: lado, border: `2px solid ${C.rosto.aro}`, background: T.couroBaixo }}>{rosto}</span>
        ) : null}
        <div className="flex flex-col min-w-0" style={{ gap: 2 }}>
          {quem ? <span className="tv-mono uppercase" style={{ fontSize: TIPOS.maquina, color: C.marca, fontWeight: 700, letterSpacing: "0.1em" }}>{encher(C.com, { quem: quem.nome })}</span> : null}
          <span className="tv-display" style={{ fontSize: telefone ? C.titulo.telefone : C.titulo.mesa, color: T.tintaDoPergaminho, fontWeight: 600, lineHeight: 1.15 }}>{missao.titulo}</span>
        </div>
      </div>
      {etapas.length ? (
        <div role="img" aria-label={`${feitas} de ${etapas.length} passos desta história`} className="flex items-center" style={{ gap: C.rosario.entre, marginTop: 8 }}>
          {etapas.map((e, i) => {
            const feita = !!e.feito;
            const agora = i === iAtual;
            return <span key={i} style={{ width: C.rosario.conta, height: C.rosario.conta, borderRadius: C.rosario.conta, boxSizing: "border-box",
              background: feita ? C.marca : "transparent", border: `${agora ? 2 : 1}px ${feita || agora ? "solid" : "dashed"} ${feita || agora ? C.marca : T.tintaDoPergaminhoDim}` }} />;
          })}
        </div>
      ) : null}
      {passo ? (
        <div className="flex items-center" style={{ gap: 8, marginTop: 8 }}>
          <Glifo nome="coracao" tamanho={telefone ? C.passo.telefone : C.passo.mesa} cor={C.marca} />
          <span className="tv-body" style={{ fontSize: telefone ? C.passo.telefone : C.passo.mesa, color: T.tintaDoPergaminho, fontWeight: 600 }}>{passo}</span>
        </div>
      ) : null}
      {falta ? <ul className="m-0 p-0" style={{ marginTop: 4 }}><LinhaDoQueFalta estado="falta" texto={falta.texto} tem={falta.tem} precisa={falta.precisa} papel="pergaminho" /></ul> : null}
    </>
  );
  const caixa = { position: "relative", overflow: "hidden", padding: `12px 14px 12px ${C.fita.largura + 14}px`, borderRadius: C.raio, background: C.chao, border: `1px solid ${T.pergaminhoBorda}` };
  return aoTocar ? (
    <button type="button" onClick={aoTocar} aria-label={[missao.titulo, quem ? encher(C.com, { quem: quem.nome }) : "", passo].filter(Boolean).join(" · ")}
      data-coracao="" className="tv-anel-foco w-full text-left block" style={caixa}>{corpo}</button>
  ) : (
    <section aria-label={missao.titulo} data-coracao="" style={caixa}>{corpo}</section>
  );
}

/* ---------------- BQ · O CARTAZ DA SOMBRA (315:189) ----------------
   O vilão no Diário: um cartaz que se preenche sozinho. «Alguém», uma
   silhueta e uma linha; cada facto que sobe a camada acrescenta uma linha;
   o nome e o rosto só no rosto; o plano só na guerra. O motor já manda só o
   que a camada deixa (`oVilaoNoDiario`); esta peça confere outra vez, pela
   mesma régua (CAMPOS_DA_CAMADA), e cala o que vier de uma camada de cima.
   Sem camada, o cartaz não existe (0 px). */
const ORDEM_DA_CAMADA = Object.fromEntries(CAMADAS_DO_VILAO.map((f) => [f.id, f.ordem]));
const PLANO_DO_CARTAZ = { feito: "feito", travado: "travado", agora: "agora", por_vir: "porVir", porVir: "porVir" };
const PALAVRA_DO_PASSO = { feito: "feito", travado: "travado por ti", agora: "o de agora", porVir: "por vir" };
function Silhueta({ lado }) {
  return (
    <svg width={lado} height={lado} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="9" r="4.5" fill={T.inkDim} />
      <path d="M3.5 24c0-5.2 3.8-8.5 8.5-8.5s8.5 3.3 8.5 8.5z" fill={T.inkDim} />
    </svg>
  );
}
export function CartazDaSombra({ vilao, retrato = null, rostoDoTenente = null, telefone = false }) {
  const [tudo, setTudo] = React.useState(false);
  if (!vilao || typeof vilao !== "object" || ORDEM_DA_CAMADA[vilao.camada] == null) return null;
  const C = CARTAZ_DA_SOMBRA;
  const ordem = ORDEM_DA_CAMADA[vilao.camada];
  const pode = (campo) => ORDEM_DA_CAMADA[CAMPOS_DA_CAMADA[campo]] != null && ORDEM_DA_CAMADA[CAMPOS_DA_CAMADA[campo]] <= ordem;
  const comRosto = pode("nome");
  const comMao = pode("tenente");
  const comMarca = pode("assinatura");
  const nome = comRosto && String(vilao.nome || "").trim() ? String(vilao.nome).trim() : C.semNome;
  const quemE = comRosto ? String(vilao.quemE || "").trim() : (String(vilao.quemE || "").trim() || (comMao ? C.comMao : C.semRosto));
  const linhas = arr(vilao.linhas).filter((l) => l && String(l.texto || "").trim());
  const vistas = tudo ? linhas : linhas.slice(0, C.linhas);
  const plano = pode("plano") && Array.isArray(vilao.plano) && vilao.plano.length ? vilao.plano.map((s) => PLANO_DO_CARTAZ[s] || "porVir") : null;
  const R = C.retrato;
  return (
    <section aria-label={C.rotulo} data-camada={vilao.camada} style={{
      width: telefone ? "100%" : undefined, maxWidth: C.largura, padding: C.enchimento, borderRadius: C.raio, background: T.couro,
      border: `1.5px solid ${comRosto ? C.aro.comRosto : C.aro.semRosto}`, display: "flex", flexDirection: "column", gap: C.vao,
    }}>
      <span className="tv-mono uppercase" style={{ fontSize: TIPOS.maquina, color: T.inkDim, letterSpacing: "0.1em" }}>{C.rotulo}</span>
      <div className="flex items-center" style={{ gap: 14 }}>
        <span className="relative shrink-0" style={{ width: R.largura, height: R.alto }}>
          <span aria-hidden="true" className="absolute inset-0 overflow-hidden flex items-end justify-center" style={{
            borderRadius: `${R.arco}px ${R.arco}px 4px 4px`, background: T.couroBaixo, border: `1.5px solid ${comRosto ? C.aro.comRosto : C.aro.semRosto}`,
          }}>
            {comRosto && retrato ? retrato : <Silhueta lado={R.largura - 8} />}
          </span>
          {comMarca && !comRosto ? <span aria-hidden="true" data-assinatura="" className="absolute" style={{ left: -4, bottom: 6, width: 16, height: 16, borderRadius: 16, background: T.perigoFundo, border: `1.5px solid ${T.danger}` }} /> : null}
          {comMao && !comRosto && rostoDoTenente ? (
            <span aria-hidden="true" data-tenente="" className="absolute overflow-hidden flex items-center justify-center" style={{ right: -6, bottom: 4, width: 24, height: 24, borderRadius: 24, background: T.couroBaixo, border: `1.5px solid ${C.aro.semRosto}` }}>{rostoDoTenente}</span>
          ) : null}
        </span>
        <div className="flex flex-col min-w-0" style={{ gap: 2 }}>
          <span className="tv-titulo" data-nome="" style={{ fontSize: TIPOS.titulo, color: comRosto ? MOLDURA_POR_DEGRAU.ouro.claro : T.ink }}>{nome}</span>
          {quemE ? <span className="tv-body italic" style={{ fontSize: TIPOS.rotulo, color: T.inkDim }}>{quemE}</span> : null}
        </div>
      </div>
      {vistas.length ? (
        <ul className="m-0 p-0 flex flex-col" aria-label="O que se sabe" style={{ gap: 6 }}>
          {vistas.map((l, i) => {
            const S = l.nova ? C.nova : C.velha;
            return (
              <li key={i} className="flex items-baseline tv-body" style={{ gap: 10, listStyle: "none", fontSize: TIPOS.rotulo, color: S.letra }} data-nova={l.nova ? "sim" : undefined}>
                <span aria-hidden="true" className="shrink-0" style={{ width: 12, height: 1.5, background: S.traco, alignSelf: "center" }} />
                <span>{l.texto}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
      {linhas.length > C.linhas ? (
        <button type="button" onClick={() => setTudo((v) => !v)} aria-expanded={tudo ? "true" : "false"} className="tv-anel-foco tv-body self-start underline"
          style={{ background: "transparent", border: "none", padding: 0, minHeight: 32, color: T.inkDim, fontSize: TIPOS.piso }}>
          {tudo ? "menos" : encher(C.mais, { n: linhas.length - C.linhas })}
        </button>
      ) : null}
      {plano ? (
        <div role="img" aria-label={`O plano dele: ${plano.map((s) => PALAVRA_DO_PASSO[s]).join(", ")}`} className="flex" style={{ gap: 4 }}>
          {plano.map((s, i) => <span key={i} className="flex-1" data-passo={s} style={{ height: C.plano.alto, borderRadius: C.plano.raio, background: C.plano[s] }} />)}
        </div>
      ) : null}
    </section>
  );
}

/* ---------------- O ÍNDICE ---------------- */
function linhaDoIndice(m, relogios, todas, abertura, q = null) {
  /* BQ: a quest diz o passo dela; com a história virada e por ler, di-lo primeiro */
  if (q) {
    const passo = String(q.etapaTexto || ((etapaAtual(m) || {}).alvo) || "").trim();
    if (porLer(q)) return <><Glifo nome="reviravolta" tamanho={TIPOS.piso} cor={T.rosa} /> {[Q.reviravolta.noIndice, passo].filter(Boolean).join(" · ")}</>;
    return passo ? `→ ${passo}` : null;
  }
  if (m.status === "oferecida") {
    const r = m.recompensa || {};
    return <>Oferta{m.dador ? ` · de ${m.dador}` : ""}{r.moedas ? <> · <Glifo nome="moeda" tamanho={TIPOS.piso} /> {r.moedas}</> : null}</>;
  }
  const e = etapaAtual(m);
  if (!e) return null;
  let pista = "";
  if (m.tipo === "principal") { try { pista = proximoPasso({ abertura, missoes: todas }); } catch { pista = ""; } }
  const prazo = prazoDe(m, relogios);
  const resto = prazo && prazo.restam <= RELOGIO_DO_PRAZO.apertaCom ? ` · restam ${plural(prazo.restam, "noite", "noites")}` : "";
  return `→ ${rumoDe(m, e, pista)}${resto}`;
}
function ItemDoIndice({ m, escolhida, aoEscolher, relogios, todas, abertura, q = null }) {
  const prazo = prazoDe(m, relogios);
  return (
    <li style={{ listStyle: "none" }}>
      <MissaoNoIndice estado={m.status === "oferecida" ? (escolhida ? "escolhida" : "oferta") : escolhida ? "escolhida" : "repouso"}
        glifo={q && q.tipo === 2 ? Q.indice.glifoDoCoracao : glifoDoTipo(m)} titulo={m.titulo} passo={linhaDoIndice(m, relogios, todas, abertura, q)}
        prazo={prazo} aoTocar={() => aoEscolher(m.id)} />
    </li>
  );
}
function Estante({ lista, estadoDe = () => null }) {
  if (!lista.length) return <div className="tv-body italic" style={{ fontSize: TIPOS.rotulo, color: T.inkDim }}>Nenhuma missão encerrada ainda.</div>;
  return (
    <ul className="m-0 p-0 flex flex-col gap-2">
      {lista.map((m) => {
        /* BQ: a história do coração fecha num desfecho (ou no luto); a estante
           guarda-a sem a ordenar, e aberta mostra o desfecho como epitáfio */
        const q = estadoDe(m.id);
        if (q && q.tipo === 2 && (q.estado === "terminada" || q.desfecho)) {
          const quem = comQuemDe(q);
          const dia = Number(q.fecho && q.fecho.dia);
          const linha = [Number.isFinite(dia) && dia > 0 ? `dia ${dia}` : "", quem ? `com ${quem.nome}` : ""].filter(Boolean).join(" · ");
          return <LombadaDaEstante key={m.id} estado={q.luto ? "luto" : "desfecho"} titulo={m.titulo} linha={linha}
            direita={String(q.comoFicou || "").trim() || null} epitafio={String((q.fecho && q.fecho.texto) || "").trim()} />;
        }
        const falhada = m.status === "falhada";
        const r = m.recompensa || {};
        const pago = !falhada && (r.moedas || r.xp)
          ? <>{r.moedas ? <><Glifo nome="moeda" tamanho={TIPOS.maquina} /> {r.moedas}</> : null}{r.moedas && r.xp ? " · " : ""}{r.xp ? `${r.xp} XP` : ""}</>
          : falhada ? "falhou" : null;
        const dia = Number(m.encerradaEm);
        const linha = [Number.isFinite(dia) && dia > 0 ? `dia ${dia}` : "", m.dador ? `pedida por ${m.dador}` : ""].filter(Boolean).join(" · ");
        return <LombadaDaEstante key={m.id} estado={falhada ? "falhada" : "concluida"} titulo={m.titulo} linha={linha} direita={pago} />;
      })}
    </ul>
  );
}

/* ---------------- O MUNDO NÃO ESPERA ---------------- */
function MundoNaoEspera({ eventos, diaAtual }) {
  const g = eventos && eventos.global;
  const locais = (eventos && Array.isArray(eventos.locais)) ? eventos.locais : [];
  if (!g && !locais.length) return null;
  return (
    <section aria-label="O mundo não espera">
      <Rotulo cor={T.danger}>O mundo não espera</Rotulo>
      {g ? (
        <div className="rounded-xl px-3 py-3 mb-3" style={{ background: T.perigoFundo, border: `1px solid ${T.danger}` }}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="tv-body" style={{ fontSize: TIPOS.corpo, color: T.ink, fontWeight: 600 }}>{g.nome}</span>
            {Array.isArray(g.etapas) ? <span className="tv-mono shrink-0" style={{ fontSize: TIPOS.maquina, color: T.danger }}>etapa {g.etapa + 1} de {g.etapas.length}</span> : null}
          </div>
          {g.semente ? <div className="tv-body mt-1" style={{ fontSize: TIPOS.rotulo, color: T.inkMeio }}>{g.semente}</div> : null}
          {Array.isArray(g.etapas) && g.etapas[g.etapa] ? <div className="tv-body mt-1" style={{ fontSize: TIPOS.rotulo, color: T.ink }}>Agora: {g.etapas[g.etapa]}</div> : null}
        </div>
      ) : null}
      {locais.length ? (
        <>
          <div className="tv-body mb-2" style={{ fontSize: TIPOS.rotulo, color: T.inkDim }}>Fios que se resolvem sem ti</div>
          <ul className="m-0 p-0 flex flex-col gap-2">
            {locais.map((l) => (
              <li key={l.id} title={l.gancho || undefined} className="flex items-baseline justify-between gap-3 rounded-xl px-3 py-3"
                style={{ listStyle: "none", background: T.panel, border: `1px solid ${T.lineStrong}` }}>
                <span className="tv-body" style={{ fontSize: TIPOS.corpo, color: T.ink }}>{l.texto}</span>
                <span className="tv-mono shrink-0" style={{ fontSize: TIPOS.maquina, color: diaAtual >= l.expiraEm ? T.danger : T.inkDim }}>até dia {l.expiraEm}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

/* ---------------- O PAINEL ---------------- */
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

export function PainelDiario({ historia, quests, trocarArco, eventos, diaAtual, missoes = [], aoResponderMissao, aoEncerrarLegado, pers = null, abertura = null, relogios = [], aoFechar = null, aoVerNoMapa = null, distanciaDoPasso = null, leiaute: leiautePedido = null,
  questsDaBiblioteca = [], rostoDe = null, vilaoNoDiario = null, rostoDoVilao = null, rostoDoTenente = null }) {
  const raiz = React.useRef(null);
  const largura = useLarguraDe(raiz);
  const leiaute = leiautePedido || (largura >= D.corte.mesa ? "mesa" : largura >= D.corte.meia ? "meia" : "telefone");
  const telefone = leiaute === "telefone";
  const [escolhidaId, setEscolhidaId] = React.useState(null);
  const [aba, setAba] = React.useState("curso");
  const [verMundo, setVerMundo] = React.useState(false);

  /* BQ: as quests da biblioteca entram já projetadas (missaoDaQuest) — não
     passam pelo conferente das missões, que não as guarda; a vista de cada
     uma (estadoDaQuest) fica à mão pelo id */
  const qs = arr(questsDaBiblioteca).filter((x) => x && x.missao && x.missao.id && x.estado && typeof x.estado === "object");
  const estadoPorId = Object.fromEntries(qs.map((x) => [x.missao.id, x.estado]));
  const estadoDe = (id) => estadoPorId[id] || null;
  const base = garantirMissoes(missoes);
  const todas = [...base, ...qs.map((x) => x.missao).filter((m) => !base.some((b) => b.id === m.id))];
  const doCoracao = (m) => { const q = estadoDe(m.id); return !!q && q.tipo === 2; };
  const coracaoM = todas.filter((m) => m.status === "ativa" && doCoracao(m) && estadoDe(m.id).visivel !== false);
  const comQuests = qs.length > 0;
  const ativasM = todas.filter((m) => m.status === "ativa" && !doCoracao(m));
  /* "o que o mundo impôs" primeiro: a principal e as do Mestre à frente, as
     que o herói aceitou depois — a ordem diz o que foi escolha e o que foi
     consequência, sem precisar de o escrever. */
  const emCurso = [...ativasM.filter((m) => tipoMissao(m.tipo).forcada), ...ativasM.filter((m) => !tipoMissao(m.tipo).forcada)];
  const ofertasM = todas.filter((m) => m.status === "oferecida");
  /* a estante tem TODAS as encerradas, a mais recente em cima */
  const estanteM = todas.filter((m) => m.status === "concluida" || m.status === "falhada").slice().reverse();
  const escolhida = todas.find((m) => m.id === escolhidaId && (m.status === "ativa" || m.status === "oferecida")) || emCurso[0] || ofertasM[0] || coracaoM[0] || null;

  const nEvento = eventos && eventos.global ? 1 : 0;
  const nFios = eventos && Array.isArray(eventos.locais) ? eventos.locais.length : 0;
  const subtitulo = [plural(emCurso.length + coracaoM.length, "missão em curso", "missões em curso"), ofertasM.length ? plural(ofertasM.length, "oferta", "ofertas") : "", estanteM.length ? `${estanteM.length} na estante` : ""].filter(Boolean).join(" · ");
  const vazio = !emCurso.length && !ofertasM.length && !coracaoM.length;
  const comum = { todas, abertura, pers, relogios, aoResponder: aoResponderMissao, aoEncerrarLegado, aoVerNoMapa, distanciaDoPasso, estadoDe, rostoDe };
  const escolher = (id) => { setEscolhidaId(id); setVerMundo(false); };

  const nadaEmCurso = <div className="tv-body italic" style={{ fontSize: TIPOS.rotulo, color: T.inkDim }}>Nenhuma missão em curso — elas surgem conforme a história se abre, e você decide quais aceitar.</div>;
  const mundoDobrado = (nEvento || nFios) ? (
    <button type="button" onClick={() => setVerMundo((v) => !v)} aria-expanded={verMundo ? "true" : "false"}
      className="tv-anel-foco tv-body w-full flex items-center justify-between gap-2 rounded-xl px-3 text-left"
      style={{ minHeight: ALVOS.piso, background: T.panel, border: `1px solid ${T.danger}`, color: T.ink, fontSize: TIPOS.rotulo }}>
      <span>O mundo não espera · {[nEvento ? plural(nEvento, "evento", "eventos") : "", nFios ? plural(nFios, "fio", "fios") : ""].filter(Boolean).join(", ")}</span>
      <GlifoAR nome="seta" tamanho={TIPOS.corpo} cor={T.danger} />
    </button>
  ) : null;

  const indice = (
    <nav aria-label="As missões" className="flex flex-col gap-4">
      <div>
        <Rotulo>{comQuests ? Q.indice.estrada : "Em curso"}</Rotulo>
        {emCurso.length ? <ul className="m-0 p-0 flex flex-col gap-2">{emCurso.map((m) => <ItemDoIndice key={m.id} m={m} q={estadoDe(m.id)} escolhida={escolhida && escolhida.id === m.id} aoEscolher={escolher} relogios={relogios} todas={todas} abertura={abertura} />)}</ul> : nadaEmCurso}
      </div>
      {coracaoM.length ? (
        <div>
          <Rotulo>{Q.indice.coracao}</Rotulo>
          <ul className="m-0 p-0 flex flex-col gap-2">{coracaoM.map((m) => <ItemDoIndice key={m.id} m={m} q={estadoDe(m.id)} escolhida={escolhida && escolhida.id === m.id} aoEscolher={escolher} relogios={relogios} todas={todas} abertura={abertura} />)}</ul>
        </div>
      ) : null}
      {ofertasM.length ? (
        <div>
          <Rotulo cor={T.violetSoft}>Ofereceram-te</Rotulo>
          <ul className="m-0 p-0 flex flex-col gap-2">{ofertasM.map((m) => <ItemDoIndice key={m.id} m={m} q={estadoDe(m.id)} escolhida={escolhida && escolhida.id === m.id} aoEscolher={escolher} relogios={relogios} todas={todas} abertura={abertura} />)}</ul>
        </div>
      ) : null}
      <div>
        <Rotulo extra={[estanteM.filter((m) => m.status === "concluida").length ? plural(estanteM.filter((m) => m.status === "concluida").length, "cumprida", "cumpridas") : "", estanteM.filter((m) => m.status === "falhada").length ? plural(estanteM.filter((m) => m.status === "falhada").length, "falhada", "falhadas") : ""].filter(Boolean).join(" · ")}>A estante</Rotulo>
        <Estante lista={estanteM} estadoDe={estadoDe} />
      </div>
    </nav>
  );

  /* BQ: a história do coração (sempre à vista: à direita na mesa, por baixo
     da estrada no telefone) e o cartaz da sombra */
  const blocoDoCoracao = coracaoM.length ? (
    <section aria-label="Quem anda contigo">
      <Rotulo>{Q.indice.coracao}</Rotulo>
      <div className="flex flex-col gap-3">
        {coracaoM.map((m) => <QuestDoCoracao key={m.id} missao={m} estado={estadoDe(m.id)} telefone={telefone}
          rosto={rostoSeguro(rostoDe, comQuemDe(estadoDe(m.id)))} aoTocar={() => escolher(m.id)} />)}
      </div>
    </section>
  ) : null;
  const cartaz = vilaoNoDiario ? <CartazDaSombra vilao={vilaoNoDiario} retrato={rostoDoVilao} rostoDoTenente={rostoDoTenente} telefone={telefone} /> : null;

  let corpo;
  if (telefone) {
    const outras = emCurso.filter((m) => !escolhida || m.id !== escolhida.id);
    const ids = { curso: "diario-aba-curso", ofertas: "diario-aba-ofertas", estante: "diario-aba-estante" };
    corpo = (
      <div className="flex flex-col">
        <div role="tablist" aria-label="O diário" className="flex mb-4" style={{ borderBottom: `1px solid ${T.line}` }}>
          <AbaDaTela rotulo={`${D.telefone.abas[0]} · ${emCurso.length + coracaoM.length}`} ativa={aba === "curso"} aoTocar={() => setAba("curso")} controla={ids.curso} />
          <AbaDaTela rotulo={`${D.telefone.abas[1]} · ${ofertasM.length}`} ativa={aba === "ofertas"} novidade={ofertasM.length > 0 && aba !== "ofertas"} aoTocar={() => setAba("ofertas")} controla={ids.ofertas} />
          <AbaDaTela rotulo={`${D.telefone.abas[2]} · ${estanteM.length}`} ativa={aba === "estante"} aoTocar={() => setAba("estante")} controla={ids.estante} />
        </div>
        {aba === "curso" ? (
          <div id={ids.curso} role="tabpanel" className="flex flex-col gap-4">
            {escolhida && escolhida.status === "ativa" ? (
              <div className="rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.amber}` }}>
                <MissaoAFrente m={escolhida} telefone compacto semGente {...comum} />
              </div>
            ) : nadaEmCurso}
            {escolhida && doCoracao(escolhida) ? null : blocoDoCoracao}
            {cartaz}
            {escolhida && estadoDe(escolhida.id) ? <GenteDaHistoria gente={estadoDe(escolhida.id).gente} rostoDe={rostoDe} /> : null}
            {outras.length ? (
              <div>
                <Rotulo>{escolhida && escolhida.tipo === "principal" ? "Secundárias" : "As outras"}</Rotulo>
                <ul className="m-0 p-0 flex flex-col gap-2">{outras.map((m) => <ItemDoIndice key={m.id} m={m} q={estadoDe(m.id)} escolhida={false} aoEscolher={escolher} relogios={relogios} todas={todas} abertura={abertura} />)}</ul>
              </div>
            ) : null}
            {mundoDobrado}
            {verMundo ? <MundoNaoEspera eventos={eventos} diaAtual={diaAtual} /> : null}
            <ArcoDaCampanha historia={historia} trocarArco={trocarArco} />
          </div>
        ) : aba === "ofertas" ? (
          <div id={ids.ofertas} role="tabpanel" className="flex flex-col gap-4">
            {ofertasM.length ? ofertasM.map((m) => (
              <div key={m.id} className="rounded-2xl p-4" style={{ background: T.panel, border: `1px dashed ${T.violet}` }}>
                <MissaoAFrente m={m} telefone compacto {...comum} />
              </div>
            )) : <div className="tv-body italic" style={{ fontSize: TIPOS.rotulo, color: T.inkDim }}>Ninguém te ofereceu nada por agora.</div>}
          </div>
        ) : (
          <div id={ids.estante} role="tabpanel"><Estante lista={estanteM} estadoDe={estadoDe} /></div>
        )}
      </div>
    );
  } else {
    const M = leiaute === "mesa" ? D.mesa : D.meia;
    corpo = (
      <div className="grid items-start" style={{ gridTemplateColumns: M.colunas.join(" "), gap: M.folga }}>
        <div className="flex flex-col gap-4">
          {indice}
          {leiaute === "meia" ? blocoDoCoracao : null}
          {leiaute === "meia" ? cartaz : null}
          {leiaute === "meia" ? mundoDobrado : null}
          <ArcoDaCampanha historia={historia} trocarArco={trocarArco} />
        </div>
        <div className="rounded-2xl p-6" style={{ background: T.panel, border: `1px solid ${alfa(OURO.meio, 0.6)}` }}>
          {leiaute === "meia" && verMundo ? <MundoNaoEspera eventos={eventos} diaAtual={diaAtual} />
            : escolhida ? <MissaoAFrente m={escolhida} telefone={false} compacto={false} {...comum} />
            : vazio ? nadaEmCurso : null}
        </div>
        {leiaute === "mesa" ? (
          <div className="flex flex-col gap-4">
            {blocoDoCoracao}
            {cartaz}
            <MundoNaoEspera eventos={eventos} diaAtual={diaAtual} />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={raiz} className="flex flex-col" data-leiaute={leiaute}>
      {aoFechar ? (
        <div className="mb-4 sticky top-0 z-10">
          <CabecalhoDaTela titulo="Diário" subtitulo={subtitulo} telefone={telefone}
            objeto={<DesenhoDoObjeto chave="diario" lado={telefone ? CABECALHO_DA_TELA.telefone.objeto : CABECALHO_DA_TELA.mesa.objeto} />} aoFechar={aoFechar} />
        </div>
      ) : null}
      {/* AR8 · D3: com o cabeçalho da tela inteira, a folga é do corpo e não da
          janela: o Fechar fica no canto, no sítio do das outras telas */}
      {aoFechar ? <div style={{ padding: `0 ${D.mesa.folga}px` }}>{corpo}</div> : corpo}
    </div>
  );
}

/* ---------------- O ARCO DA CAMPANHA ----------------
   Fica no fim do arquivo de propósito: do arco o jogador vê só o tipo de
   história (v9.28 — ver em que momento dele se está entregava o que vem a
   seguir). A suíte do capítulo lê tudo o que vem depois do nome desta
   secção e confere que nada ali percorre as etapas de um arco. */
function ArcoDaCampanha({ historia, trocarArco }) {
  const [trocando, setTrocando] = React.useState(false);
  const est = estruturaPorId((historia || {}).estrutura);
  if (!est) return null;
  return (
    <section aria-label="Arco da campanha" className="flex flex-col gap-2">
      <div className="tv-body flex flex-wrap items-baseline gap-x-2" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>
        <span title={est.desc}>A campanha: <span style={{ color: T.inkMeio }}>{est.nome}</span></span>
        {trocarArco ? (
          <button type="button" onClick={() => setTrocando((v) => !v)} aria-expanded={trocando ? "true" : "false"}
            className="tv-anel-foco tv-body underline" style={{ background: "transparent", border: "none", padding: 0, color: T.inkDim, fontSize: TIPOS.piso }}>
            trocar o arco
          </button>
        ) : null}
      </div>
      {trocando ? (
        <div className="flex flex-col gap-2">
          <div className="tv-body" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>Mudar a perspectiva da campanha — o mundo e a história vividos permanecem; só o rumo dramático muda.</div>
          {ESTRUTURAS.filter((e) => e.id !== (historia || {}).estrutura).map((e) => (
            <button key={e.id} type="button" onClick={() => { trocarArco(e.id); setTrocando(false); }} className="tv-anel-foco w-full text-left rounded-lg p-3" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
              <div className="tv-display" style={{ fontSize: TIPOS.prosa, color: T.amberSoft }}>{e.nome}</div>
              <div className="tv-body mt-0.5" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>{e.desc}</div>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

/* PainelMapa extraído para ./painel-mapa.jsx (v8.8) */
