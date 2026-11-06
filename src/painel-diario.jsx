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
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { TIPOS, ALVOS, alfa, MOLDURA_POR_DEGRAU, COR_DA_RARIDADE, ENCAIXE, ICONES_DA_ETAPA, DIARIO_DE_MISSOES, RELOGIO_DO_PRAZO, CABECALHO_DA_TELA } from "./estilo.js";
import { Glifo, VerboComPreco } from "./ui.jsx";
import { GlifoAR, CabecalhoDaTela, AbaDaTela, EtapaDaMissao, RelogioDoPrazo, LombadaDaEstante, MissaoNoIndice } from "./painel-ar-pecas.jsx";
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
function ProximoPasso({ m, e, frase, telefone, aoVerNoMapa, distanciaDoPasso }) {
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
function LinhaDoTempo({ m, frase, compacto, comAtual = false }) {
  const etapas = Array.isArray(m.etapas) ? m.etapas : [];
  const atual = etapaAtual(m);
  const iAtual = atual ? etapas.indexOf(atual) : -1;
  const linhas = etapas.map((e, i) => {
    if (e.feito) {
      const dia = Number(e.feitoEm);
      return { i, estado: "feita", tipo: e.tipo, texto: textoDe(e), nota: Number.isFinite(dia) && dia > 0 ? `cumprida no dia ${dia}` : "cumprida" };
    }
    if (i === iAtual) {
      const onde = String(e.onde || "").trim();
      return { i, estado: "atual", tipo: e.tipo, texto: frase, nota: onde ? `${onde} — é o passo de agora` : "é o passo de agora" };
    }
    return { i, estado: "silhueta", tipo: e.tipo, texto: "Ainda não se sabe", nota: i === iAtual + 1 ? "abre-se quando a de cima se cumprir" : "" };
  });
  let mostrar = linhas;
  if (compacto) {
    const feitas = linhas.filter((l) => l.estado === "feita");
    const porSaber = linhas.filter((l) => l.estado === "silhueta");
    mostrar = [];
    if (feitas.length) {
      const u = feitas[feitas.length - 1];
      mostrar.push({ ...u, nota: feitas.length > 1 ? `e mais ${feitas.length - 1} ${feitas.length - 1 === 1 ? "cumprida" : "cumpridas"} antes` : u.nota });
    }
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
      {mostrar.map((l, k) => <EtapaDaMissao key={l.i} estado={l.estado} tipo={l.tipo} texto={l.texto} nota={l.nota} ultima={k === mostrar.length - 1} />)}
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
function MissaoAFrente({ m, todas, abertura, pers, relogios, telefone, compacto, aoResponder, aoEncerrarLegado, aoVerNoMapa, distanciaDoPasso }) {
  const t = tipoMissao(m.tipo);
  const sec = secundariaDe(m);
  const oferta = m.status === "oferecida";
  let dif = null; try { dif = dificuldadeDaMissao(m, pers); } catch { dif = null; }
  const p = progressoMissao(m);
  const atual = etapaAtual(m);
  let pistaMundo = "";
  if (m.tipo === "principal") { try { pistaMundo = proximoPasso({ abertura, missoes: todas }); } catch { pistaMundo = ""; } }
  const frase = rumoDe(m, atual, pistaMundo);
  const prazo = prazoDe(m, relogios);
  const lado = !telefone && !compacto;
  return (
    <article className="flex flex-col gap-5" aria-label={m.titulo}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Chip cor={oferta ? T.violetSoft : sec ? T.mundoSoft : T.amberSoft} borda={oferta ? T.violet : sec ? alfa(T.mundoSoft, 0.6) : alfa(T.amber, 0.6)}>
            {glifoDoTipo(m)} {(oferta ? "Oferta" : sec ? "Secundária" : t.rotulo).toUpperCase()}
          </Chip>
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

      {(sec || (atual && !oferta)) ? (
        <div className={sec && lado ? "grid gap-5 items-start" : "flex flex-col gap-5"} style={sec && lado ? { gridTemplateColumns: `minmax(0, ${D.bilhete.largura}px) minmax(0, 1fr)` } : undefined}>
          {sec ? <Bilhete m={m} sec={sec} /> : null}
          {atual && !oferta ? <ProximoPasso m={m} e={atual} frase={frase} telefone={telefone || compacto} aoVerNoMapa={aoVerNoMapa} distanciaDoPasso={distanciaDoPasso} /> : null}
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
          <LinhaDoTempo m={m} frase={frase} compacto={compacto} comAtual={oferta} />
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

/* ---------------- O ÍNDICE ---------------- */
function linhaDoIndice(m, relogios, todas, abertura) {
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
function ItemDoIndice({ m, escolhida, aoEscolher, relogios, todas, abertura }) {
  const prazo = prazoDe(m, relogios);
  return (
    <li style={{ listStyle: "none" }}>
      <MissaoNoIndice estado={m.status === "oferecida" ? (escolhida ? "escolhida" : "oferta") : escolhida ? "escolhida" : "repouso"}
        glifo={glifoDoTipo(m)} titulo={m.titulo} passo={linhaDoIndice(m, relogios, todas, abertura)}
        prazo={prazo} aoTocar={() => aoEscolher(m.id)} />
    </li>
  );
}
function Estante({ lista }) {
  if (!lista.length) return <div className="tv-body italic" style={{ fontSize: TIPOS.rotulo, color: T.inkDim }}>Nenhuma missão encerrada ainda.</div>;
  return (
    <ul className="m-0 p-0 flex flex-col gap-2">
      {lista.map((m) => {
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

export function PainelDiario({ historia, quests, trocarArco, eventos, diaAtual, missoes = [], aoResponderMissao, aoEncerrarLegado, pers = null, abertura = null, relogios = [], aoFechar = null, aoVerNoMapa = null, distanciaDoPasso = null, leiaute: leiautePedido = null }) {
  const raiz = React.useRef(null);
  const largura = useLarguraDe(raiz);
  const leiaute = leiautePedido || (largura >= D.corte.mesa ? "mesa" : largura >= D.corte.meia ? "meia" : "telefone");
  const telefone = leiaute === "telefone";
  const [escolhidaId, setEscolhidaId] = React.useState(null);
  const [aba, setAba] = React.useState("curso");
  const [verMundo, setVerMundo] = React.useState(false);

  const todas = garantirMissoes(missoes);
  const ativasM = todas.filter((m) => m.status === "ativa");
  /* "o que o mundo impôs" primeiro: a principal e as do Mestre à frente, as
     que o herói aceitou depois — a ordem diz o que foi escolha e o que foi
     consequência, sem precisar de o escrever. */
  const emCurso = [...ativasM.filter((m) => tipoMissao(m.tipo).forcada), ...ativasM.filter((m) => !tipoMissao(m.tipo).forcada)];
  const ofertasM = todas.filter((m) => m.status === "oferecida");
  /* a estante tem TODAS as encerradas, a mais recente em cima */
  const estanteM = todas.filter((m) => m.status === "concluida" || m.status === "falhada").slice().reverse();
  const escolhida = todas.find((m) => m.id === escolhidaId && (m.status === "ativa" || m.status === "oferecida")) || emCurso[0] || ofertasM[0] || null;

  const nEvento = eventos && eventos.global ? 1 : 0;
  const nFios = eventos && Array.isArray(eventos.locais) ? eventos.locais.length : 0;
  const subtitulo = [plural(emCurso.length, "missão em curso", "missões em curso"), ofertasM.length ? plural(ofertasM.length, "oferta", "ofertas") : "", estanteM.length ? `${estanteM.length} na estante` : ""].filter(Boolean).join(" · ");
  const vazio = !emCurso.length && !ofertasM.length;
  const comum = { todas, abertura, pers, relogios, aoResponder: aoResponderMissao, aoEncerrarLegado, aoVerNoMapa, distanciaDoPasso };
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
        <Rotulo>Em curso</Rotulo>
        {emCurso.length ? <ul className="m-0 p-0 flex flex-col gap-2">{emCurso.map((m) => <ItemDoIndice key={m.id} m={m} escolhida={escolhida && escolhida.id === m.id} aoEscolher={escolher} relogios={relogios} todas={todas} abertura={abertura} />)}</ul> : nadaEmCurso}
      </div>
      {ofertasM.length ? (
        <div>
          <Rotulo cor={T.violetSoft}>Ofereceram-te</Rotulo>
          <ul className="m-0 p-0 flex flex-col gap-2">{ofertasM.map((m) => <ItemDoIndice key={m.id} m={m} escolhida={escolhida && escolhida.id === m.id} aoEscolher={escolher} relogios={relogios} todas={todas} abertura={abertura} />)}</ul>
        </div>
      ) : null}
      <div>
        <Rotulo extra={[estanteM.filter((m) => m.status === "concluida").length ? plural(estanteM.filter((m) => m.status === "concluida").length, "cumprida", "cumpridas") : "", estanteM.filter((m) => m.status === "falhada").length ? plural(estanteM.filter((m) => m.status === "falhada").length, "falhada", "falhadas") : ""].filter(Boolean).join(" · ")}>A estante</Rotulo>
        <Estante lista={estanteM} />
      </div>
    </nav>
  );

  let corpo;
  if (telefone) {
    const outras = emCurso.filter((m) => !escolhida || m.id !== escolhida.id);
    const ids = { curso: "diario-aba-curso", ofertas: "diario-aba-ofertas", estante: "diario-aba-estante" };
    corpo = (
      <div className="flex flex-col">
        <div role="tablist" aria-label="O diário" className="flex mb-4" style={{ borderBottom: `1px solid ${T.line}` }}>
          <AbaDaTela rotulo={`${D.telefone.abas[0]} · ${emCurso.length}`} ativa={aba === "curso"} aoTocar={() => setAba("curso")} controla={ids.curso} />
          <AbaDaTela rotulo={`${D.telefone.abas[1]} · ${ofertasM.length}`} ativa={aba === "ofertas"} novidade={ofertasM.length > 0 && aba !== "ofertas"} aoTocar={() => setAba("ofertas")} controla={ids.ofertas} />
          <AbaDaTela rotulo={`${D.telefone.abas[2]} · ${estanteM.length}`} ativa={aba === "estante"} aoTocar={() => setAba("estante")} controla={ids.estante} />
        </div>
        {aba === "curso" ? (
          <div id={ids.curso} role="tabpanel" className="flex flex-col gap-4">
            {escolhida && escolhida.status === "ativa" ? (
              <div className="rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.amber}` }}>
                <MissaoAFrente m={escolhida} telefone compacto {...comum} />
              </div>
            ) : nadaEmCurso}
            {outras.length ? (
              <div>
                <Rotulo>{escolhida && escolhida.tipo === "principal" ? "Secundárias" : "As outras"}</Rotulo>
                <ul className="m-0 p-0 flex flex-col gap-2">{outras.map((m) => <ItemDoIndice key={m.id} m={m} escolhida={false} aoEscolher={escolher} relogios={relogios} todas={todas} abertura={abertura} />)}</ul>
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
          <div id={ids.estante} role="tabpanel"><Estante lista={estanteM} /></div>
        )}
      </div>
    );
  } else {
    const M = leiaute === "mesa" ? D.mesa : D.meia;
    corpo = (
      <div className="grid items-start" style={{ gridTemplateColumns: M.colunas.join(" "), gap: M.folga }}>
        <div className="flex flex-col gap-4">
          {indice}
          {leiaute === "meia" ? mundoDobrado : null}
          <ArcoDaCampanha historia={historia} trocarArco={trocarArco} />
        </div>
        <div className="rounded-2xl p-6" style={{ background: T.panel, border: `1px solid ${alfa(OURO.meio, 0.6)}` }}>
          {leiaute === "meia" && verMundo ? <MundoNaoEspera eventos={eventos} diaAtual={diaAtual} />
            : escolhida ? <MissaoAFrente m={escolhida} telefone={false} compacto={false} {...comum} />
            : vazio ? nadaEmCurso : null}
        </div>
        {leiaute === "mesa" ? <MundoNaoEspera eventos={eventos} diaAtual={diaAtual} /> : null}
      </div>
    );
  }

  return (
    <div ref={raiz} className="flex flex-col" data-leiaute={leiaute}>
      {aoFechar ? (
        <div className="mb-4">
          <CabecalhoDaTela titulo="Diário" subtitulo={subtitulo} telefone={telefone}
            objeto={<DesenhoDoObjeto chave="diario" lado={telefone ? CABECALHO_DA_TELA.telefone.objeto : CABECALHO_DA_TELA.mesa.objeto} />} aoFechar={aoFechar} />
        </div>
      ) : null}
      {corpo}
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
