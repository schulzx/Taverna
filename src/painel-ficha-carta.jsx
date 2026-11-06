/* ============================================================
   O HERÓI — A FICHA COMO CARTA (AAA · 05/11/2026) — formas.md §AAA §2
   Figma: Ficha · carta · 375 (255:113) e O herói · 1280 (257:1110).

   A carta é a ficha: o retrato na janela em arco, o nível e a CA nos
   cantos, a gema no fecho, o selo na base, as marcas no aro. O nome em
   Cinzel; a classe e a subclasse em amberSoft; a marca da subclasse; os
   atributos em discos com ícone (o aro no metal do degrau — a ficha sobe
   de degrau com o herói); PV e PM em barras, o XP numa linha âmbar; e
   «N pontos por gastar» em moldura âmbar quando os há — a porta da
   subida para quem a adiou: tocar num disco põe um ponto, pelo preço que
   o disco diz por baixo.

   375: duas abas, Ficha e Equipamento (não cabem as duas). 1280: uma tela
   só, em três colunas — a carta, a ficha, o equipamento —, e ver a ficha e
   trocar uma peça custa zero trocas de aba.

   Aqui só se pinta: a conta dos pontos é de atributos.js; a CA de
   combate.js; a moldura de moldura.js. Tudo chega por props.
   ============================================================ */
import React from "react";
import { T, XP_POR_NIVEL } from "./constantes.js";
import { FICHA_CARTA, VB_DA_MOLDURA, TIPOS, ALVOS, TAMANHOS_DA_MOLDURA } from "./estilo.js";
import { Botao, Glifo, PilulaDeEscolha, useMesa } from "./ui.jsx";
import { CabecalhoDaTela } from "./painel-ar-pecas.jsx";
import { Disco } from "./painel-moldura.jsx";
import { PainelEquipamento, RostoNaMoldura, caDoHeroi } from "./painel-equipamento.jsx";
import { molduraDe } from "./moldura.js";
import { marcaDe } from "./marca-da-subclasse.js";
import { PERICIAS } from "./pericias.js";
import { pontosAtributoDisponiveis } from "./atributos.js";
import { discosDaFicha } from "./subida-de-nivel.js";

/* a barra de PV, PM ou XP */
function Barra({ rotulo, atual, max, cor }) {
  const pct = Math.max(0, Math.min(100, ((Number(atual) || 0) / (Number(max) || 1)) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between tv-mono" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}>
        <span>{rotulo}</span><span>{atual ?? 0} / {max ?? 0}</span>
      </div>
      <div className="rounded-full overflow-hidden" style={{ height: FICHA_CARTA.barra, background: T.panel, marginTop: FICHA_CARTA.barra / 2 }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cor }} />
      </div>
    </div>
  );
}

/* QUEM É: o nome, a classe e a subclasse, o nível e a raça */
function QuemE({ p, tamanho, centro = false }) {
  let sub = null;
  try { const m = marcaDe(p); sub = m ? m.subclasse : null; } catch (e) { sub = null; }
  return (
    <div className={centro ? "text-center" : ""}>
      <div className="tv-titulo leading-tight" style={{ color: T.ink, fontSize: tamanho }}>{p.nome}</div>
      <div className="tv-display" style={{ color: T.amberSoft, fontSize: TIPOS.corpo }}>{[p.classe, sub].filter(Boolean).join(" · ")}</div>
      <div className="tv-mono" style={{ color: T.inkDim, fontSize: TIPOS.maquina }}>Nível {p.nivel || 1}{p.raca ? ` · ${p.raca}` : ""}</div>
    </div>
  );
}

/* A CARTA com o nome na placa (a mesa, §2): o texto pousa no rect da placa
   da carta (FICHA_CARTA.placa, em unidades da carta) */
function CartaComPlaca({ p, largura, lex }) {
  const vb = VB_DA_MOLDURA.carta, k = largura / TAMANHOS_DA_MOLDURA.carta.largura, pl = FICHA_CARTA.placa;
  return (
    <div className="relative shrink-0" style={{ width: vb[2] * k, height: vb[3] * k }}>
      <RostoNaMoldura personagem={p} tamanho="carta" aro={largura} lex={lex} />
      <div className="absolute flex items-center justify-center" style={{ left: (pl.x - vb[0]) * k, top: (pl.y - vb[1]) * k, width: pl.largura * k, height: pl.altura * k }}>
        <QuemE p={p} tamanho={FICHA_CARTA.nome.mesa} centro />
      </div>
    </div>
  );
}

/* o título de uma secção da ficha: a letra da secção «Atributos» */
function TituloDaSeccao({ children, cor = T.inkDim }) {
  return <h3 className="tv-titulo uppercase" style={{ margin: 0, color: cor, fontSize: FICHA_CARTA.texto.nota, letterSpacing: "0.12em" }}>{children}</h3>;
}
const seguro_ = (fz) => () => { try { if (fz) fz(); } catch (e) { /* o App avisa */ } };

/* AR8 (06/11) · OS MANTIMENTOS (D1 da prova jogada). Moravam só na ficha
   antiga, e ao desligá-la o jogador comprava rações e não as via. Voltam
   aqui, ao pé de «O que se leva»: as rações, a água e as tochas como
   peças, quantos dias duram para quantas bocas, a exaustão, e os três
   verbos do caminho que viviam no mesmo cartão (forragear, o ritmo de
   marcha, forçar a marcha). A conta é de ermos.js; chega pronta, em `m`. */
function Mantimentos({ m }) {
  if (!m) return null;
  const dias = Number(m.dias) || 0, bocas = Number(m.bocas) || 1;
  const pouco = dias <= 1;
  const ex = m.exaustao || { nivel: 0 };
  const peca = (glifo, rotulo, valor, apagada = false) => (
    <div className="flex flex-col items-center flex-1 rounded-xl" style={{ minWidth: ALVOS.piso, padding: FICHA_CARTA.folga / 2, background: T.panel, border: `1px solid ${T.line}`, opacity: apagada ? 0.6 : 1 }}>
      {glifo ? <Glifo nome={glifo} tamanho={TIPOS.titulo} /> : null}
      <span className="tv-mono" style={{ fontSize: FICHA_CARTA.texto.item, color: T.ink }}>{valor}</span>
      <span className="tv-body" style={{ fontSize: TIPOS.maquina, color: T.inkDim }}>{rotulo}</span>
    </div>
  );
  return (
    <section aria-label="Mantimentos" className="flex flex-col" style={{ gap: FICHA_CARTA.folga * 0.75 }}>
      <div className="flex items-baseline justify-between" style={{ gap: FICHA_CARTA.folga / 2 }}>
        <TituloDaSeccao cor={pouco ? T.danger : T.inkDim}>Mantimentos</TituloDaSeccao>
        <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: pouco ? T.danger : T.inkDim }}>
          {dias} {dias === 1 ? "dia" : "dias"} para {bocas} {bocas === 1 ? "boca" : "bocas"}
        </span>
      </div>
      <div className="flex flex-wrap" style={{ gap: FICHA_CARTA.folga / 2 }}>
        {peca(null, "rações", m.racoes ?? 0)}
        {peca(null, "água", m.agua ?? 0)}
        {peca("tocha", "tochas", m.tochas ?? 0)}
        {peca("bolsa", m.kit ? "kit de viagem" : "sem kit", m.kit ? "✓" : "—", !m.kit)}
      </div>
      {ex.nivel > 0 ? (
        <p className="tv-body" style={{ margin: 0, fontSize: TIPOS.rotulo, color: T.danger }}><Glifo nome="aviso" tamanho={TIPOS.rotulo} /> Exaustão {ex.nivel}/{m.exaustaoMax ?? ex.nivel} — {ex.efeito}</p>
      ) : null}
      <div className="flex flex-wrap" style={{ gap: FICHA_CARTA.folga / 2 }}>
        {m.aoForragear ? <Botao pequeno desativado={!!m.bloqueado} onClick={seguro_(m.aoForragear)}>Forragear · meio dia, Percepção</Botao> : null}
        {m.aoForcarMarcha ? (
          <Botao pequeno desativado={!!m.bloqueado} onClick={seguro_(m.aoForcarMarcha)}>
            {m.marchaArmada ? "Marcha forçada armada · parte na próxima viagem" : "Forçar a marcha na próxima viagem · +3h, Vigor por hora"}
          </Botao>
        ) : null}
      </div>
      {Array.isArray(m.ritmos) && m.ritmos.length && m.aoRitmo ? (
        <div className="flex flex-col" style={{ gap: FICHA_CARTA.folga / 2 }}>
          <TituloDaSeccao>Ritmo de marcha</TituloDaSeccao>
          <div role="group" aria-label="Ritmo de marcha" className="flex flex-wrap" style={{ gap: FICHA_CARTA.folga / 2 }}>
            {m.ritmos.map((r) => (
              <PilulaDeEscolha key={r.id} rotulo={`${r.icone || ""} ${r.nome}`.trim()} razao={r.desc} escolhida={(m.ritmo || "normal") === r.id} aoClicar={seguro_(() => m.aoRitmo(r.id))} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

/* AR8 · AS DUAS ESCOLHAS DE COMBATE (D1): «Quando um golpe chega» e «Ao
   derrubar um inimigo». A mesma peça (PilulaDeEscolha) e as mesmas filas
   da ficha antiga; `itens` [{ id, titulo, fila:[{ id, rotulo }], escolhida,
   aoEscolher(id) }]. */
function EscolhasDeCombate({ itens }) {
  if (!Array.isArray(itens) || !itens.length) return null;
  return (
    <section aria-label="Em combate" className="flex flex-col" style={{ gap: FICHA_CARTA.folga * 0.75 }}>
      {itens.map((g) => (
        <div key={g.id} className="flex flex-col" style={{ gap: FICHA_CARTA.folga / 2 }}>
          <TituloDaSeccao>{g.titulo}</TituloDaSeccao>
          <div role="group" aria-label={g.titulo} className="flex flex-wrap" style={{ gap: FICHA_CARTA.folga / 2 }}>
            {(g.fila || []).map((p) => (
              <PilulaDeEscolha key={p.id} rotulo={p.rotulo} escolhida={g.escolhida === p.id} aoClicar={seguro_(() => g.aoEscolher && g.aoEscolher(p.id))} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

/* AR8 · AS DÁDIVAS (D1): a lista de dadivas.js, com o modo de usar de cada
   uma, e no nível 20 quantas há e quanto falta para a próxima.
   `d` = { linhas:[{ id, nome, desc, extra, ativa, unica }], progresso:{ xp, por } | null } */
function Dadivas({ d }) {
  if (!d) return null;
  const linhas = Array.isArray(d.linhas) ? d.linhas : [];
  if (!linhas.length && !d.progresso) return null;
  return (
    <section aria-label="Dádivas" className="flex flex-col rounded-xl" style={{ gap: FICHA_CARTA.folga / 2, padding: FICHA_CARTA.folga * 0.75, border: `1px solid ${T.amber}` }}>
      <div className="flex items-baseline justify-between" style={{ gap: FICHA_CARTA.folga / 2 }}>
        <TituloDaSeccao cor={T.amberSoft}>Dádivas épicas</TituloDaSeccao>
        {d.progresso ? <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: T.amberSoft }}>{linhas.length} {linhas.length === 1 ? "dádiva" : "dádivas"} · {d.progresso.xp}/{d.progresso.por}</span> : null}
      </div>
      {linhas.map((l) => (
        <p key={l.id} className="tv-body" style={{ margin: 0, fontSize: TIPOS.rotulo, color: T.ink }}>
          <Glifo nome={l.unica ? "coroa" : "estrela"} tamanho={TIPOS.rotulo} /> {l.nome}
          <span style={{ color: T.inkDim }}> — {l.desc}</span>
          {l.extra ? <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: l.ativa ? T.amberSoft : T.inkDim }}> {l.extra}</span> : null}
        </p>
      ))}
    </section>
  );
}

/* AR8 · OS TALENTOS DO COMPANHEIRO (D5): «Ver a ficha · atributos e
   talentos» abria a bolsa. A ficha dele mostra agora o que ele sabe fazer,
   com o custo e o que cada coisa faz. */
function TalentosDoCompanheiro({ lista }) {
  if (!Array.isArray(lista)) return null;
  const habs = lista.filter(Boolean).map((h) => (typeof h === "string" ? { nome: h } : h)).filter((h) => h && h.nome);
  return (
    <section aria-label="Talentos" className="flex flex-col" style={{ gap: FICHA_CARTA.folga / 2 }}>
      <TituloDaSeccao>Talentos</TituloDaSeccao>
      {!habs.length ? <p className="tv-body italic" style={{ margin: 0, fontSize: TIPOS.rotulo, color: T.inkDim }}>Nada de especial, por enquanto.</p> : habs.map((h) => (
        <div key={h.nome} className="rounded-xl" style={{ padding: FICHA_CARTA.folga / 2, background: T.panel, border: `1px solid ${T.line}` }}>
          <div className="flex items-baseline justify-between" style={{ gap: FICHA_CARTA.folga / 2 }}>
            <span className="tv-body" style={{ fontSize: TIPOS.corpo, color: T.ink }}>{h.nome}</span>
            {h.custo != null ? <span className="tv-mono" style={{ fontSize: TIPOS.maquina, color: T.violetSoft }}>{h.custo} PM</span> : null}
          </div>
          {h.descricao ? <p className="tv-body" style={{ margin: 0, fontSize: TIPOS.rotulo, color: T.inkDim }}>{h.descricao}</p> : null}
        </div>
      ))}
    </section>
  );
}

/* A MARCA DA SUBCLASSE: a perícia que ela treina e o que diz */
function LinhaDaMarca({ p }) {
  let m = null;
  try { m = marcaDe(p); } catch (e) { m = null; }
  if (!m) return null;
  const per = (PERICIAS.find((x) => x.id === m.pericia) || {}).nome || m.pericia;
  return <p className="tv-body italic" style={{ color: T.inkDim, fontSize: TIPOS.rotulo }}>Marca {m.subclasse}: {m.diz} — treina {per}.</p>;
}

/* OS ATRIBUTOS: seis discos em 3 × 2 e, se há pontos, a moldura âmbar */
function Atributos({ p, aoSubirAtributo }) {
  let degrau = "ferro";
  try { degrau = molduraDe(p).degrau; } catch (e) { degrau = "ferro"; }
  const discos = discosDaFicha(p);
  let pontos = 0;
  try { pontos = pontosAtributoDisponiveis(p); } catch (e) { pontos = 0; }
  return (
    <section aria-label="Atributos" className="flex flex-col" style={{ gap: FICHA_CARTA.folga }}>
      <TituloDaSeccao>Atributos</TituloDaSeccao>
      <div className="grid justify-items-center" style={{ gridTemplateColumns: `repeat(${FICHA_CARTA.colunas}, 1fr)`, rowGap: FICHA_CARTA.folga }}>
        {discos.map((d) => (
          <Disco key={d.id} atributo={d.id} valor={d.texto} rotulo={d.nome} linha={d.linha} estado={d.estado} degrau={degrau}
            aoTocar={d.aceita && aoSubirAtributo ? () => { try { aoSubirAtributo(d.id); } catch (e) { /* o App avisa */ } } : null} />
        ))}
      </div>
      {pontos > 0 ? (
        <div className="rounded-xl" style={{ border: `1px solid ${T.amber}`, padding: FICHA_CARTA.folga * 0.75 }}>
          <div className="tv-body" style={{ color: T.amberSoft, fontSize: TIPOS.corpo }}>{pontos} {pontos === 1 ? "ponto de atributo" : "pontos de atributo"} por gastar</div>
          <div className="tv-body" style={{ color: T.inkDim, fontSize: TIPOS.rotulo }}>Toque num disco para pôr um ponto</div>
        </div>
      ) : null}
    </section>
  );
}

function Vitais({ p, comXP = true }) {
  const nivel = p.nivel || 1;
  let xpMax = 0;
  try { xpMax = XP_POR_NIVEL(nivel); } catch (e) { xpMax = 0; }
  return (
    <div className="flex flex-col" style={{ gap: FICHA_CARTA.folga * 0.75 }}>
      <Barra rotulo="PV" atual={p.vida} max={p.vidaMax} cor={T.danger} />
      {(Number(p.manaMax) || 0) > 0 || comXP ? <Barra rotulo="PM" atual={p.mana} max={p.manaMax} cor={T.violet} /> : null}
      {comXP ? <Barra rotulo="XP" atual={p.xp || 0} max={xpMax} cor={T.amber} /> : null}
    </div>
  );
}

/* AR1 · AS PORTAS DA CASA. Uma fila de abas sublinhadas, a mesma forma das
   abas Ficha/Equipamento do telefone: `itens` [{ id, rotulo }], `ativo`
   (o id aceso, ou nada), `aoTocar(id)`. Serve duas filas: QUEM (o herói e
   cada companheiro — a bolsa de cada um) e AS OUTRAS SALAS da Gestão
   (Grupo, Talentos, Mercado…), que deixaram de ter tela à parte para o
   herói e abrem daqui. Quebra em linhas: a mesa e o telefone cabem. */
function Fila({ rotulo, itens, ativo = null, aoTocar, papel = "tablist" }) {
  if (!Array.isArray(itens) || itens.length < 1) return null;
  return (
    <div role={papel} aria-label={rotulo} className="flex flex-wrap">
      {itens.map((it) => {
        const aceso = ativo != null && it.id === ativo;
        return (
          <button key={it.id} type="button" role={papel === "tablist" ? "tab" : undefined} aria-selected={papel === "tablist" ? aceso : undefined}
            onClick={() => { try { if (aoTocar) aoTocar(it.id); } catch (e) { /* o App avisa */ } }}
            className="tv-display tv-anel-foco" style={{ minHeight: ALVOS.piso, paddingLeft: FICHA_CARTA.folga / 2, paddingRight: FICHA_CARTA.folga / 2, fontSize: TIPOS.rotulo, color: aceso ? T.amber : T.inkDim, borderBottom: `2px solid ${aceso ? T.amber : T.line}` }}>
            {it.rotulo}
          </button>
        );
      })}
    </div>
  );
}

/* O PAINEL. Props, por extenso:
   · personagem — a ficha (atributos, pontosAtr, vida/vidaMax, mana/manaMax,
     xp, nivel, classe, raca, equipados, inventario, feitos);
   · emCombate, aoEquipar(item, slot), aoDesequipar(slot) — passam ao
     PainelEquipamento;
   · aoSubirAtributo(attrId) — um ponto num atributo (o subirAtributo do App);
   · aoFechar — a seta do telefone e o «Fechar» da mesa;
   · lex, limite (a mochila), aba ("ficha" | "equipamento", no telefone).
   AR1 (06/11) · UMA CASA SÓ. A carta do herói e a Bolsa abrem esta tela, e
   o que antes morava noutras gavetas entra por props (todas opcionais — sem
   elas, a carta é a de sempre):
   · companheiro — a carta é de um companheiro: sem XP, e os discos só se
     ele os tem (o boneco e a mochila são os DELE, pelos aoEquipar do App);
   · pessoas [{ id, rotulo }], quem, aoTrocarQuem(id) — de quem é a bolsa;
   · portas [{ id, rotulo }], aoAbrirPorta(id) — as outras salas da Gestão;
   · detalhes — o que a ficha antiga mostrava e a carta não (aba Ficha);
   · bolsa — os itens com as suas ações e a bancada (aba Equipamento).
   AR8 (06/11) · o que a ficha antiga levou consigo ao ser desligada volta
   por props (D1): mantimentos (aba Equipamento, ao pé da bolsa), escolhas
   (as duas de combate) e dadivas (aba Ficha); talentos, a lista do que um
   companheiro sabe fazer (D5). O cabeçalho é o CabecalhoDaTela de todas as
   telas inteiras (D3), fixo no topo (D4); a tela abre no topo. */
export function PainelFichaCarta({ personagem, emCombate = false, aoEquipar, aoDesequipar, aoSubirAtributo = null, aoFechar = null, lex = null, limite = null, aba = "ficha", companheiro = false, pessoas = null, quem = null, aoTrocarQuem = null, portas = null, aoAbrirPorta = null, detalhes = null, bolsa = null, mantimentos = null, escolhas = null, dadivas = null, talentos = null }) {
  const p = personagem || {};
  const mesa = useMesa();
  const [qual, setQual] = React.useState(aba === "equipamento" ? "equipamento" : "ficha");
  const ca = caDoHeroi(p);
  const comDiscos = !companheiro || !!p.atributos;
  const equipamento = <PainelEquipamento personagem={p} emCombate={emCombate} aoEquipar={aoEquipar} aoDesequipar={aoDesequipar} limite={limite} lex={lex} />;
  /* AR8 · D4: a Bolsa já não rola a tela até à mochila (o Fechar ficava a
     −290 px). A tela abre no topo; na mesa, pela Bolsa, o que se leva vem
     logo abaixo da carta, e pela Ficha vem primeiro o que é da ficha. */
  const daFicha = (
    <>
      <EscolhasDeCombate itens={escolhas} />
      <Dadivas d={dadivas} />
      {companheiro ? <TalentosDoCompanheiro lista={talentos} /> : null}
      {detalhes}
    </>
  );
  const filas = (
    <>
      {Array.isArray(pessoas) && pessoas.length > 1 ? <Fila rotulo="De quem é a bolsa" itens={pessoas} ativo={quem} aoTocar={aoTrocarQuem} /> : null}
      {Array.isArray(portas) && portas.length ? <Fila rotulo="As outras salas" papel="navigation" itens={portas} aoTocar={aoAbrirPorta} /> : null}
    </>
  );
  const nome = p.nome || "o companheiro";
  const titulo = companheiro ? (qual === "equipamento" ? "A bolsa de " : "A ficha de ") + nome : qual === "equipamento" ? "A bolsa" : "O herói";
  /* D3 · o Fechar de todas as telas inteiras: o CabecalhoDaTela (e o Esc
     dele), fixo no topo da rolagem (D4) */
  const cabeca = (
    <CabecalhoDaTela titulo={titulo} subtitulo={companheiro ? "" : (p.nome || "")} telefone={!mesa} aoFechar={aoFechar} />
  );

  if (mesa) {
    const M = FICHA_CARTA.mesa;
    return (
      <section aria-label={titulo} className="flex flex-col">
        {cabeca}
        <div className="mx-auto max-w-6xl w-full flex flex-col" style={{ gap: FICHA_CARTA.folga, padding: M.folga }}>
        {filas}
        <div className="grid items-start" style={{ gridTemplateColumns: M.colunas.join(" "), gap: M.folga }}>
          <div className="flex flex-col items-center" style={{ gap: FICHA_CARTA.folga }}>
            <CartaComPlaca p={p} largura={FICHA_CARTA.carta.mesa} lex={lex} />
            <LinhaDaMarca p={p} />
          </div>
          <div className="flex flex-col" style={{ gap: FICHA_CARTA.folga * 1.5 }}>
            <Vitais p={p} comXP={!companheiro} />
            {comDiscos ? <Atributos p={p} aoSubirAtributo={aoSubirAtributo} /> : null}
            {ca != null ? <p className="tv-mono" style={{ color: T.ink, fontSize: TIPOS.maquina }}>CA {ca}</p> : null}
          </div>
          <div style={{ borderLeft: `1px solid ${T.line}`, paddingLeft: M.folga / 2 }}>{equipamento}</div>
        </div>
        {qual === "equipamento" ? null : daFicha}
        {bolsa || mantimentos ? (
          <div className="flex flex-col" style={{ gap: FICHA_CARTA.folga, borderTop: `1px solid ${T.line}`, paddingTop: FICHA_CARTA.folga }}>
            <Mantimentos m={mantimentos} />
            {bolsa}
          </div>
        ) : null}
        {qual === "equipamento" ? daFicha : null}
        </div>
      </section>
    );
  }

  const aba_ = (id, nome) => (
    <button type="button" role="tab" aria-selected={qual === id} onClick={() => setQual(id)}
      className="flex-1 tv-display" style={{ minHeight: ALVOS.piso, fontSize: TIPOS.corpo, color: qual === id ? T.amber : T.inkDim, borderBottom: `2px solid ${qual === id ? T.amber : T.line}` }}>
      {nome}
    </button>
  );
  return (
    <section aria-label={titulo} className="flex flex-col">
      {cabeca}
      <div className="flex flex-col" style={{ gap: FICHA_CARTA.folga, padding: FICHA_CARTA.folga }}>
      {filas}
      <div role="tablist" className="flex">{aba_("ficha", "Ficha")}{aba_("equipamento", "Equipamento")}</div>
      {qual === "equipamento" ? (
        <>
          {equipamento}
          <Mantimentos m={mantimentos} />
          {bolsa}
        </>
      ) : (
        <>
          <div className="flex items-start" style={{ gap: FICHA_CARTA.folga * 0.75 }}>
            <RostoNaMoldura personagem={p} tamanho="carta" aro={FICHA_CARTA.carta.telefone} lex={lex} />
            <div className="flex-1 min-w-0 flex flex-col" style={{ gap: FICHA_CARTA.folga * 0.75 }}>
              <QuemE p={p} tamanho={FICHA_CARTA.nome.telefone} />
              <Vitais p={p} comXP={!companheiro} />
            </div>
          </div>
          <LinhaDaMarca p={p} />
          {comDiscos ? <Atributos p={p} aoSubirAtributo={aoSubirAtributo} /> : null}
          {daFicha}
        </>
      )}
      </div>
    </section>
  );
}
