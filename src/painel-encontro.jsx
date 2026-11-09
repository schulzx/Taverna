/* ============================================================
   O ENCONTRO NA ESTRADA, NA TELA (CB4, 09/11/2026) — src/painel-encontro.jsx

   A pessoa: «apertei em viajar para o lugar e instantaneamente abriu uma
   batalha contra um dragão ancião… não teve narração sobre o encontro, não
   teve nada». formas.md §CB 7 (Figma 347:502, 347:554, 347:700, 347:841):
   o encontro é um cartão, em três tempos, que são as três `fase` do estado
   de encontro-na-estrada.js:

   1. `sinal` — na folha, a prosa do Mestre e O SINAL num caixilho
      tracejado (o glifo do tipo e a frase em itálico). O pedido de
      Percepção é o de sempre (a soleira do momento, `oCartaoDoPedido`):
      não nasce peça aqui.
   2. `escolha` — o CARTÃO DO ENCONTRO: «NA ESTRADA · UM ENCONTRO», o
      retrato (84 no telefone; a carta 300 × 380 na mesa, o retrato que a
      pessoa elogiou), o nome, o chip «ainda não te viu», a FAIXA DA AMEAÇA
      e as seis LINHAS DA ESCOLHA, cada uma com o preço antes do toque. O
      botão de confirmar diz a escolha e o preço. A fuga perante a lenda vê-
      se sempre: a linha nunca sai, nunca se esbate, e é a única em musgo.
   3. `resolvido` — o dado do teste pousa na bandeja de sempre; com
      `desfecho.luta`, vem a ENTRADA NA MESA (1,2 s, pulável com um toque ou
      Esc; com movimento reduzido, corte seco, e o som fica).

   O que cada linha diz é decidido em batalha-na-tela.js (provado em Node);
   aqui só se desenha, com CARTAO_DO_ENCONTRO e as tintas de T. Toda a
   componente é de módulo (a que nasce no render mata o foco do campo).
   ============================================================ */
import React from "react";
import { T, TIPOS, ALVOS, CARTAO_DO_ENCONTRO as C, PREVISAO_DO_GOLPE, alfa } from "./estilo.js";
import { Glifo, Retrato } from "./ui.jsx";
import { Rosto } from "./rosto.jsx";
import { sementeDe } from "./semente.js";
import { linhaDaEscolha, faixaDaAmeaca, chipDoAvistamento, botaoDoEncontro } from "./batalha-na-tela.js";
import { tocarEntrada } from "./som-da-mesa.js";

const semMovimento = () => {
  try { return !!(typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch { return false; }
};
/* os seis sinais, pelo glifo (o tipo vem de SINAIS_DO_BESTIARIO) */
const GLIFO_DO_SINAL = { rasto: "rasto", som: "som", cheiro: "cheiro", vulto: "vulto", silencio: "silencio", sombra: "sombra" };
/* as seis escolhas, pelo glifo (Figma 343:208): contornar, o vulto de quem se
   esconde, a palavra, os passos da emboscada, o recuo, as espadas */
const GLIFO_DA_ESCOLHA = { evitar: "contornar", esconder: "vulto", negociar: "palavra", emboscar: "passo", fugir: "recuo", lutar: "espadas" };
/* SOBRE O PERGAMINHO o glifo veste a cor da letra ao lado (currentColor): as
   tintas do pergaminho são da folha, não das superfícies escuras que a régua
   dos glifos mede (check-formas D5h.4) */
const LEGENDA = { fontSize: TIPOS.piso, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 };

/* ---------------- 1 · O SINAL NA FOLHA ----------------
   O caixilho tracejado, o glifo do tipo em `brasaNoPergaminho` e a frase do
   sinal em itálico — o facto que o Mestre veste; nunca o nome da criatura. */
export function SinalNaFolha({ sinal }) {
  if (!sinal || !sinal.frase) return null;
  const L = C.linha;
  return (
    <div role="note" aria-label={`Um sinal na estrada: ${sinal.frase}`} className="flex items-center"
      style={{ gap: L.enchimento.x, padding: `${L.enchimento.y}px ${L.enchimento.x}px`, borderRadius: L.raio,
        border: `${L.aroImpedida}px dashed ${T.pergaminhoBorda}`, background: alfa(T.pergaminho, 0.35) }}>
      <span style={{ color: T.brasaNoPergaminho, display: "inline-flex" }}><Glifo nome={GLIFO_DO_SINAL[sinal.tipo] || "sombra"} tamanho={L.glifo} /></span>
      <span className="tv-body" style={{ fontStyle: "italic", fontSize: TIPOS.corpo, color: T.tintaDoPergaminho }}>{sinal.frase}</span>
    </div>
  );
}

/* ---------------- 2 · A FAIXA DA AMEAÇA (Figma 343:228) ----------------
   A ameaça como faixa e nunca como número: a lenda e o «a evitar» em
   `perigoFundo` com a caveira; o «à vista» em `panelSoft`, com o olho. */
export function FaixaDaAmeaca({ estado }) {
  const f = faixaDaAmeaca(estado);
  if (!f) return null;
  const perigo = f.tipo !== "a-vista";
  return (
    <div className="tv-mono flex items-center" style={{ gap: 8, padding: `${C.faixa.enchimento[1]}px ${C.faixa.enchimento[0]}px`, borderRadius: C.faixa.raio,
      background: perigo ? T.perigoFundo : T.panelSoft, color: T.ink, fontSize: TIPOS.piso, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>
      <Glifo nome={perigo ? "perigo" : "olho"} tamanho={16} cor={perigo ? T.danger : T.inkMeio} />
      {f.texto}
    </div>
  );
}

/* ---------------- 3 · A LINHA DA ESCOLHA (Figma 343:208) ----------------
   A carta da encruzilhada deitada: o mesmo papel, o mesmo aro da escolhida,
   o mesmo «a impedida não se esbate». Diz, antes do toque: o glifo, o
   verbo, a perícia e a CD, o custo, o que custa falhar e a chance grande. */
const ARO_DA_LINHA = {
  repouso: () => ({ border: `1px solid ${T.pergaminhoBorda}` }),
  escolhida: () => ({ border: `${C.linha.aroEscolhida}px solid ${T.amber}` }),
  impedida: () => ({ border: `${C.linha.aroImpedida}px dashed ${T.tintaDoPergaminhoDim}` }),
  "fuga-segura": () => ({ border: `${C.linha.aroFuga}px solid ${T.musgoNoPergaminho}` }),
  "lutar-lenda": () => ({ border: `${C.linha.aroFuga}px solid ${T.danger}` }),
};
export function LinhaDaEscolha({ linha, escolhida = false, aoTocar }) {
  if (!linha) return null;
  const L = C.linha;
  const estado = escolhida && linha.estado === "repouso" ? "escolhida" : linha.estado;
  const lenda = estado === "lutar-lenda";
  const corDaChance = estado === "fuga-segura" ? T.musgoNoPergaminho : T.tintaDoPergaminho;
  const meta = [linha.pericia ? `${linha.pericia}${linha.cd != null ? ` · CD ${linha.cd}` : ""}` : linha.semDado && linha.id !== "lutar" ? "sem dado" : null].filter(Boolean).join("");
  return (
    <div role="radio" aria-checked={escolhida} aria-disabled={!linha.tocavel || undefined} tabIndex={linha.tocavel ? 0 : -1}
      aria-label={[linha.rotulo, linha.chance && linha.chance !== "—" ? linha.chance.toLowerCase() : null, meta, linha.horas ? `${linha.horas} h` : null, linha.moedas ? `${linha.moedas} moedas` : null, linha.falha].filter(Boolean).join(", ")}
      onClick={linha.tocavel && aoTocar ? () => aoTocar(linha.id) : undefined}
      onKeyDown={linha.tocavel && aoTocar ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); aoTocar(linha.id); } } : undefined}
      className="tv-anel-foco flex flex-col overflow-hidden"
      style={{ borderRadius: L.raio, background: T.pergaminho, cursor: linha.tocavel ? "pointer" : "default", minHeight: ALVOS.piso, ...ARO_DA_LINHA[estado]() }}>
      <div className="flex items-center" style={{ gap: L.enchimento.x, padding: `${L.enchimento.y}px ${L.enchimento.x}px`, color: T.tintaDoPergaminho }}>
        <Glifo nome={GLIFO_DA_ESCOLHA[linha.id] || "espadas"} tamanho={L.glifo} />
        <span className="flex flex-col flex-1 min-w-0" style={{ gap: 2 }}>
          <span className="tv-display" style={{ fontSize: L.verbo, fontWeight: 600, color: T.tintaDoPergaminho, lineHeight: 1.15 }}>{linha.rotulo}</span>
          {(meta || linha.horas || linha.moedas) && (
            <span className="tv-mono flex items-center flex-wrap" style={{ gap: 8, fontSize: TIPOS.piso, color: T.tintaDoPergaminhoMeio }}>
              {meta && <span>{meta}</span>}
              {linha.horas && <span className="inline-flex items-center" style={{ gap: 3 }}><Glifo nome="relogio" tamanho={12} />{String(linha.horas).replace(".", ",")} h</span>}
              {linha.moedas && <span className="inline-flex items-center" style={{ gap: 3 }}><Glifo nome="moeda" tamanho={12} />{linha.moedas}</span>}
            </span>
          )}
          {linha.falha && !lenda && (
            <span className="tv-body" style={{ fontStyle: "italic", fontSize: TIPOS.rotulo, color: estado === "fuga-segura" ? T.musgoNoPergaminho : estado === "impedida" ? T.tintaDoPergaminhoDim : T.perigoNoPergaminho }}>{linha.falha}</span>
          )}
        </span>
        {linha.chance && (
          <span className="flex flex-col items-end shrink-0">
            <span className="tv-display" style={{ fontSize: L.chance, fontWeight: 700, color: corDaChance, lineHeight: 1 }}>{linha.chance}</span>
            {linha.dado && <span className="tv-mono" style={{ fontSize: PREVISAO_DO_GOLPE.letra.legenda, color: T.tintaDoPergaminhoDim }}>{linha.dado}</span>}
          </span>
        )}
      </div>
      {lenda && (
        <div className="tv-body flex items-center" style={{ gap: 8, padding: `${L.enchimento.y - 4}px ${L.enchimento.x}px`, background: T.perigoFundo, color: T.ink, fontStyle: "italic", fontSize: TIPOS.rotulo }}>
          <Glifo nome="perigo" tamanho={14} cor={T.danger} />{linha.falha}
        </div>
      )}
    </div>
  );
}

/* ---------------- 4 · O CARTÃO DO ENCONTRO ----------------
   `estado`: o do encontro (fase `escolha`); `escolhas`: escolhasDoEncontro;
   `pergunta`/`diz`: a frase do Mestre (o título e a linha por baixo);
   `escolhida`/`aoEscolher`: o id tocado (estado de tela de quem monta);
   `aoConfirmar(id)`: o botão que diz a escolha e o preço. No telefone o
   rolo rola e o rodapé fica; na mesa o cartão mede 1000 e nada rola. */
export function CartaoDoEncontro({ estado, escolhas = [], pergunta = "", diz = "", escolhida = null, aoEscolher, aoConfirmar, telefone = false }) {
  if (!estado || estado.fase !== "escolha") return null;
  const linhas = (Array.isArray(escolhas) ? escolhas : []).map((v) => linhaDaEscolha(v, estado, { escolhida })).filter(Boolean);
  const aEscolhida = linhas.find((l) => l.id === escolhida && l.tocavel) || null;
  const botao = botaoDoEncontro(aEscolhida);
  const chip = chipDoAvistamento(estado);
  const ente = (Array.isArray(estado.inimigos) && estado.inimigos[0]) || { nome: estado.criatura };
  const nome = estado.quantos > 1 ? `${estado.quantos}× ${estado.criatura}` : estado.criatura;
  const cabeca = (
    <span className="tv-mono flex items-center" style={{ ...LEGENDA, gap: 6, color: T.amberSoft }}>
      <Glifo nome="sombra" tamanho={16} cor={T.amberSoft} />Na estrada · um encontro
    </span>
  );
  const chipDeVista = chip && (
    <span className="tv-mono inline-flex items-center self-start" style={{ gap: 6, padding: "3px 10px", borderRadius: 999, fontSize: TIPOS.piso,
      color: chip.visto ? T.danger : T.ok, background: chip.visto ? T.perigoFundo : T.okFundo }}>
      <Glifo nome="olho" tamanho={12} cor={chip.visto ? T.danger : T.ok} />{chip.texto}
    </span>
  );
  const retratoGrande = (
    <svg width={C.cartao.carta[0]} height={C.cartao.carta[1]} viewBox="0 0 64 64" preserveAspectRatio="xMidYMid slice" role="img" aria-label={estado.criatura}
      style={{ borderRadius: C.linha.raio + 2, border: `2px solid ${T.danger}`, background: T.bg, display: "block", maxWidth: "100%" }}>
      <Rosto semente={sementeDe(ente)} ente={ente} lado={C.cartao.carta[1]} estado="normal" />
    </svg>
  );
  const lista = (
    <div role="radiogroup" aria-label="O que fazes" className="flex flex-col" style={{ gap: 8 }}>
      {linhas.map((l) => <LinhaDaEscolha key={l.id} linha={l} escolhida={escolhida === l.id} aoTocar={aoEscolher} />)}
    </div>
  );
  const confirmar = (
    <div className="flex flex-col" style={{ gap: 6 }}>
      <button onClick={aEscolhida && aoConfirmar ? () => aoConfirmar(aEscolhida.id) : undefined} aria-disabled={!aEscolhida || undefined}
        className="tv-anel-foco tv-mono flex items-center justify-center"
        style={{ minHeight: ALVOS.piso, borderRadius: C.linha.raio, background: aEscolhida ? T.amber : T.panelSoft, color: aEscolhida ? T.onAccent : T.inkDim, fontWeight: 700, fontSize: TIPOS.rotulo, gap: 6, border: `1px solid ${aEscolhida ? T.amber : T.line}` }}>
        {aEscolhida && <Glifo nome={GLIFO_DA_ESCOLHA[aEscolhida.id] || "espadas"} tamanho={16} cor={T.onAccent} />}
        {botao || "Escolhe o que fazes"}
      </button>
      <span className="tv-body text-center" style={{ fontSize: TIPOS.rotulo, color: T.inkDim, fontStyle: "italic" }}>ou escreve o que fazes — o campo continua aberto</span>
    </div>
  );
  const titulo = (
    <span className="flex flex-col" style={{ gap: 4 }}>
      <span className="tv-display" style={{ fontSize: TIPOS.display, color: T.ink, lineHeight: 1.15 }}>{pergunta || "O que fazes?"}</span>
      {diz && <span className="tv-body" style={{ fontSize: TIPOS.rotulo + 1, color: T.inkMeio, fontStyle: "italic" }}>{diz}</span>}
    </span>
  );
  if (telefone) {
    return (
      <section role="dialog" aria-label={`Na estrada: ${nome}`} className="flex flex-col min-h-0"
        style={{ width: "100%", maxWidth: C.folha.largura, maxHeight: "100%", borderRadius: `${C.folha.raio}px ${C.folha.raio}px 0 0`, background: T.panel, border: `1px solid ${T.line}` }}>
        <div className="flex flex-col min-h-0 overflow-y-auto tv-scroll" style={{ gap: 12, padding: 16 }}>
          {cabeca}
          <div className="flex items-center" style={{ gap: 12 }}>
            <Retrato semente={sementeDe(ente)} ente={ente} inimigo tamanho={C.rosto} anel={T.danger} />
            <span className="flex flex-col min-w-0" style={{ gap: 6 }}>
              <span className="tv-display" style={{ fontSize: TIPOS.titulo + 4, color: T.ink, lineHeight: 1.1 }}>{nome}</span>
              {chipDeVista}
            </span>
          </div>
          <FaixaDaAmeaca estado={estado} />
          {titulo}
          {lista}
        </div>
        <div style={{ padding: 16, borderTop: `1px solid ${T.line}` }}>{confirmar}</div>
      </section>
    );
  }
  return (
    <section role="dialog" aria-label={`Na estrada: ${nome}`} className="flex"
      style={{ width: C.cartao.largura, maxWidth: "100%", gap: C.cartao.entre, padding: C.cartao.enchimento, borderRadius: C.folha.raio, background: T.panel, border: `1px solid ${T.lineStrong}` }}>
      <div className="flex flex-col shrink-0" style={{ gap: 12, width: C.cartao.carta[0] }}>
        {cabeca}
        {retratoGrande}
        <span className="tv-display" style={{ fontSize: TIPOS.display, color: T.ink, lineHeight: 1.1 }}>{nome}</span>
        {chipDeVista}
        <FaixaDaAmeaca estado={estado} />
      </div>
      <div className="flex flex-col flex-1 min-w-0" style={{ gap: 12 }}>
        {titulo}
        {lista}
        {confirmar}
      </div>
    </section>
  );
}

/* ---------------- 5 · A ENTRADA NA MESA (Figma 347:841) ----------------
   1 200 ms, pulável com um toque ou Esc: o véu fecha (0–300), o retrato
   cresce do cartão para o centro e soa a entrada (300–800), a mesa aparece
   por baixo (800–1 200). `aoFim` chama-se uma vez — no fim, no salto, ou
   logo, com movimento reduzido (corte seco, e o som fica: reduzir movimento
   não é pedir silêncio). Um som que estoura cala-se; a mesa abre na mesma. */
export function EntradaNaMesa({ ente, aoFim, children = null }) {
  const feito = React.useRef(false);
  const fim = React.useCallback(() => {
    if (feito.current) return;
    feito.current = true;
    try { if (aoFim) aoFim(); } catch (e) { console.warn("EntradaNaMesa: abrir a mesa falhou", e); }
  }, [aoFim]);
  React.useEffect(() => {
    const E = C.entrada;
    if (semMovimento()) {
      try { tocarEntrada(); } catch { /* um som que estoura cala-se */ }
      fim();
      return undefined;
    }
    const som = setTimeout(() => { try { tocarEntrada(); } catch { /* cala-se */ } }, E.cresce[0]);
    const acaba = setTimeout(fim, E.total);
    const tecla = (e) => { if (e.key === "Escape") fim(); };
    window.addEventListener("keydown", tecla);
    return () => { clearTimeout(som); clearTimeout(acaba); window.removeEventListener("keydown", tecla); };
  }, [fim]);
  const e = ente || {};
  return (
    <div role="button" tabIndex={0} aria-label="A luta começa — toque para saltar" onClick={fim}
      onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); fim(); } }}
      className="tv-anel-foco fixed inset-0 z-50 flex items-center justify-center" style={{ cursor: "pointer" }}>
      <div aria-hidden="true" className="tv-entrada-veu absolute inset-0" style={{ background: alfa(T.bg, C.entrada.veuAlfa) }} />
      {children && <div className="tv-entrada-mesa absolute inset-0">{children}</div>}
      <div aria-hidden="true" className="tv-entrada-cresce relative" style={{ transformOrigin: "center" }}>
        <Retrato semente={sementeDe(e)} ente={e} inimigo semCarta tamanho={C.rosto * 2} anel={T.danger} />
      </div>
      <span className="tv-mono absolute" style={{ bottom: 24, left: 0, right: 0, textAlign: "center", fontSize: TIPOS.piso, color: T.inkDim }}>toque para saltar</span>
    </div>
  );
}

