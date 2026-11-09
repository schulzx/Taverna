/* ============================================================
   O EQUIPAMENTO DE BONECOS (AAA · 05/11/2026) — formas.md §AAA §3
   Figma: Equipamento · 375 (255:261), a gaveta do elmo (255:506), e o lado
   direito de O herói · 1280 (257:1110).

   O herói é o centro e as peças vão no sítio delas: à esquerda Elmo,
   Amuleto, Armadura; à direita Arma, Escudo, Anel; Botas por baixo
   (ENCAIXE.boneco). Cada encaixe mostra o ícone do item com a borda da cor
   e da forma da raridade; vazio, o glifo do que lá vai a 35%.

   TOCAR NUM ENCAIXE ABRE A GAVETA — folha de baixo no telefone, popover ao
   lado do encaixe na mesa — só com os itens que cabem ali; o primeiro vem
   escolhido, e por baixo a COMPARAÇÃO ANTES DO CLIQUE (src/comparar-item.js):
   cada número que muda, antes → depois, e o tempo da troca. O botão diz o
   preço («Equipar · CA 15, Percepção −1»); em luta, se não cabe numa
   rodada, cala e diz porquê (podeTrocarAgora).

   Por baixo, a mochila em grelha (5 colunas no telefone, 6 na mesa).

   Aqui só se pinta: a conta é de comparar-item.js, itens.js e combate.js.
   O equipar de verdade é do App (aoEquipar / aoDesequipar).

   TE (09/11/2026, decisão 6 da pessoa): A LENDA. A gaveta mostra as linhas
   que o sistema gravou no item (item.lenda, até cinco) — da peça que já
   está no encaixe, por cima, e da escolhida, por baixo do nome. A peça é a
   mesma do veredito do espólio (LendaDoArtefacto). Sem lenda, nada muda.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { ENCAIXE, GAVETA_DO_ENCAIXE, GLIFO_DO_ENCAIXE, COR_DA_RARIDADE, ICONES_DE_ITEM, VEU, FICHA_CARTA, LENDA_DO_ARTEFACTO } from "./estilo.js";
import { LendaDoArtefacto } from "./painel-espolio.jsx";
import { linhasDaLenda } from "./espolio-na-tela.js";
import { Botao, Retrato, useMesa } from "./ui.jsx";
import { Moldura, Encaixe } from "./painel-moldura.jsx";
import { molduraDe } from "./moldura.js";
import { marcasNoAro } from "./marcas-da-moldura.js";
import { sementeDe, estadoDe } from "./semente.js";
import { defesaDe } from "./combate.js";
import { fichaDoItem } from "./itens.js";
import { itensParaEncaixe, compararItem, rotuloDoEquipar, raridadeDoItem, iconeDoItem, encaixeDoItem, fraseDaTroca } from "./comparar-item.js";

const G_FOLGA = GAVETA_DO_ENCAIXE.folga;
const nomeDe = (it) => (typeof it === "string" ? it : (it && it.nome) || "");
const NOME_DA_RARIDADE = { comum: "Comum", incomum: "Incomum", raro: "Raro", epico: "Épico", lendario: "Lendário", unico: "Único" };

/* a CA do herói, ou null — uma ficha torta não derruba o painel */
export function caDoHeroi(p) {
  try { return defesaDe(p || {}); } catch (e) { return null; }
}

/* O ROSTO NA MOLDURA do herói: carta no telefone, medalhão na mesa (§3 e
   O herói · 1280). Nunca lança: sem moldura, o retrato sozinho. */
export function RostoNaMoldura({ personagem, tamanho = "medalhao", aro = null, lex = null }) {
  const p = personagem || {};
  const rosto = (lado) => <Retrato semente={sementeDe(p)} ente={p} lex={lex} tamanho={lado} anel={null} estado={estadoDe(p.vida, p.vidaMax)} semCarta />;
  let m = null;
  try { m = molduraDe(p, "heroi"); } catch (e) { m = null; }
  if (!m) return rosto(aro || 64);
  let marcas = [];
  try { marcas = marcasNoAro(p.feitos); } catch (e) { marcas = []; }
  return (
    <Moldura tamanho={tamanho} aro={aro} degrau={m.degrau} lado="heroi" gema={m.gema} selo={m.selo} nivel={p.nivel || 1}
      ca={tamanho === "carta" ? caDoHeroi(p) : null} marcas={marcas}>{rosto}</Moldura>
  );
}

/* UMA LINHA DA COMPARAÇÃO: o rótulo, antes → depois, e o sinal */
function LinhaDaComparacao({ l }) {
  const cor = l.sinal === "ok" ? T.ok : l.sinal === "danger" ? T.danger : T.inkDim;
  const delta = typeof l.delta === "number" && l.id !== "dano" ? (l.delta > 0 ? "+" : "−") + Math.abs(l.delta) : "";
  return (
    <div className="flex items-baseline gap-3 tv-body" style={{ fontSize: FICHA_CARTA.texto.linha }}>
      <span className="flex-1" style={{ color: T.inkDim }}>{l.rotulo}</span>
      <span className="tv-mono" style={{ color: T.ink }}>{l.antes} {"→"} {l.depois}</span>
      <span className="tv-mono text-right" style={{ color: cor, minWidth: ENCAIXE.lado / 2 }}>{delta}</span>
    </div>
  );
}

/* A GAVETA (§3, §9; nó 255:506). Definida FORA do painel: componente
   nascido dentro do render perde o foco a cada letra (lei da casa). */
function Gaveta({ slot, personagem, emCombate, mesa, inicial, aoEquipar, aoDesequipar, aoFechar }) {
  const p = personagem || {};
  const atual = (p.equipados || {})[slot] || null;
  const servem = React.useMemo(
    () => itensParaEncaixe(p.inventario, slot).filter((it) => it !== atual && !(atual && nomeDe(it) === nomeDe(atual))),
    [p.inventario, slot, atual],
  );
  const [i, setI] = React.useState(() => Math.max(0, inicial != null ? servem.indexOf(inicial) : 0));
  const escolhido = servem[i] || null;
  let cmp = { linhas: [], troca: { ok: true, motivo: "" } };
  try { cmp = compararItem(p, escolhido, slot, { emCombate }); } catch (e) { /* sem comparação, o botão diz só o verbo */ }
  const primeiro = React.useRef(null);
  React.useEffect(() => { try { if (primeiro.current) primeiro.current.focus(); } catch (e) { /* sem foco, segue */ } }, []);
  React.useEffect(() => {
    const tecla = (e) => { if (e.key === "Escape") aoFechar(); };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aoFechar]);
  const r = escolhido ? raridadeDoItem(escolhido) : null;
  let rotulo = "";
  try { rotulo = escolhido ? (fichaDoItem(escolhido) || {}).rotulo || "" : ""; } catch (e) { rotulo = ""; }
  const G = GAVETA_DO_ENCAIXE;
  let lendaDoAtual = [];
  try { lendaDoAtual = atual ? linhasDaLenda(atual) : []; } catch (e) { lendaDoAtual = []; }
  const conteudo = (
    <>
      {!mesa ? <span aria-hidden="true" className="block mx-auto rounded-full" style={{ width: G.alca.largura, height: G.alca.altura, background: T.lineStrong, marginBottom: G.folga }} /> : null}
      <div className="flex items-baseline justify-between">
        <h3 className="tv-titulo" style={{ color: T.ink, fontSize: FICHA_CARTA.nome.telefone }}>{ENCAIXE.nomes[slot]}</h3>
        <span className="tv-mono" style={{ color: T.inkDim, fontSize: ENCAIXE.rotulo }}>{servem.length} {servem.length === 1 ? "que serve" : "que servem"}</span>
      </div>
      {lendaDoAtual.length ? (
        <div className="flex flex-col gap-2" data-lenda-do-atual="">
          <div className="tv-titulo" style={{ color: COR_DA_RARIDADE[raridadeDoItem(atual)].cor, fontSize: FICHA_CARTA.texto.item }}>
            {nomeDe(atual)}<span className="tv-body" style={{ color: T.inkDim, fontSize: FICHA_CARTA.texto.nota, fontWeight: 400 }}>{" · "}{LENDA_DO_ARTEFACTO.emUso}</span>
          </div>
          <LendaDoArtefacto linhas={lendaDoAtual} />
        </div>
      ) : null}
      {servem.length ? (
        <div className="flex flex-wrap" style={{ gap: ENCAIXE.mochila.folga, padding: ENCAIXE.anel.folga + ENCAIXE.anel.espessura }}>
          {servem.map((it, k) => (
            <span key={k} ref={k === 0 ? primeiro : undefined} tabIndex={-1} className="inline-flex">
              <Encaixe raridade={raridadeDoItem(it)} icone={iconeDoItem(it, ICONES_DE_ITEM)} escolhido={k === i}
                aoTocar={() => setI(k)} ariaLabel={nomeDe(it)} />
            </span>
          ))}
        </div>
      ) : (
        <p className="tv-body" style={{ color: T.inkDim }}>Nada na mochila serve aqui.</p>
      )}
      {escolhido ? (
        <div className="flex flex-col gap-2" style={{ borderTop: `1px solid ${T.line}`, paddingTop: G.folga }}>
          <div className="tv-titulo" style={{ color: COR_DA_RARIDADE[r].cor, fontSize: FICHA_CARTA.texto.item }}>{nomeDe(escolhido)}</div>
          <div className="tv-body" style={{ color: T.inkDim, fontSize: FICHA_CARTA.texto.nota }}>{NOME_DA_RARIDADE[r]}{rotulo ? ` · ${rotulo}` : ""}</div>
          <LendaDoArtefacto item={escolhido} />
          {cmp.linhas.map((l) => <LinhaDaComparacao key={l.id} l={l} />)}
          {cmp.dorme ? <p className="tv-body" style={{ color: T.amberSoft, fontSize: FICHA_CARTA.texto.nota }}>Pede sintonia: até lá serve de peça, e o poder dorme.</p> : null}
          <p className="tv-body italic" style={{ color: cmp.troca.ok ? T.inkDim : T.danger, fontSize: FICHA_CARTA.texto.nota }}>
            {cmp.troca.ok ? fraseDaTroca(slot) : `Agora não: ${cmp.troca.motivo}.`}
          </p>
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        {escolhido ? (
          <Botao corpo primario desativado={!cmp.troca.ok} onClick={() => { if (!cmp.troca.ok) return; try { aoEquipar(escolhido, slot); } catch (e) { /* o App avisa */ } aoFechar(); }}>
            {rotuloDoEquipar(cmp.linhas)}
          </Botao>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          {atual ? (
            <Botao corpo desativado={!cmp.troca.ok} onClick={() => { if (!cmp.troca.ok) return; try { aoDesequipar(slot); } catch (e) { /* o App avisa */ } aoFechar(); }}>
              {ENCAIXE.tirar[slot]}
            </Botao>
          ) : <span />}
          <Botao corpo onClick={aoFechar}>Fechar</Botao>
        </div>
      </div>
    </>
  );
  if (mesa) {
    return (
      <div role="dialog" aria-label={ENCAIXE.nomes[slot]} className="tv-gaveta-abre tv-gaveta-reduzida absolute z-20 flex flex-col gap-3"
        style={{ top: 0, right: ENCAIXE.lado + 2 * ENCAIXE.mochila.folga, /* abre sempre para o lado de dentro da tela: o boneco mora na coluna da direita */ width: G.largura, padding: G.enchimento, borderRadius: G.raio, background: T.panel, border: `1px solid ${T.lineStrong}` }}>
        {conteudo}
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="presentation">
      <div className="absolute inset-0" style={{ background: T.bg, opacity: VEU.leve }} onClick={aoFechar} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={ENCAIXE.nomes[slot]} className="tv-gaveta-sobe tv-gaveta-reduzida relative tv-scroll overflow-y-auto"
        style={{ maxHeight: `${G.alto * 100}vh`, padding: G.enchimento, borderTopLeftRadius: G.raio, borderTopRightRadius: G.raio, background: T.panel, borderTop: `1px solid ${T.lineStrong}` }}>
        {/* a coluna por dentro do rolar: num flex-col que rola, os filhos encolhem */}
        <div className="flex flex-col gap-3">{conteudo}</div>
      </div>
    </div>
  );
}

/* UM ENCAIXE DO BONECO, com o rótulo do sítio por baixo */
function EncaixeDoCorpo({ slot, item, aberto, aoAbrir }) {
  return (
    <Encaixe raridade={item ? raridadeDoItem(item) : null} icone={item ? iconeDoItem(item, ICONES_DE_ITEM) : null}
      glifo={GLIFO_DO_ENCAIXE[slot]} escolhido={aberto} rotulo={ENCAIXE.nomes[slot]}
      ariaLabel={`${ENCAIXE.nomes[slot]}: ${item ? nomeDe(item) : "vazio"}`} aoTocar={aoAbrir} />
  );
}

/* O PAINEL. `personagem` (a ficha: equipados, inventario), `emCombate`,
   `aoEquipar(item, slot)`, `aoDesequipar(slot)`. Opcionais: `limite` (a
   mochila «11 de 20»), `lex` (o léxico do mundo, para o retrato) e
   `semRosto` (a ficha da mesa já mostra a carta). */
export function PainelEquipamento({ personagem, emCombate = false, aoEquipar = () => {}, aoDesequipar = () => {}, limite = null, lex = null, semRosto = false }) {
  const p = personagem || {};
  const mesa = useMesa();
  const [aberta, setAberta] = React.useState(null); /* { slot, inicial } */
  const eq = p.equipados || {};
  const inv = Array.isArray(p.inventario) ? p.inventario : [];
  const fechar = React.useCallback(() => setAberta(null), []);
  const coluna = (lado) => (
    <div className="relative flex flex-col items-center" style={{ gap: ENCAIXE.mochila.folga }}>
      {ENCAIXE.boneco[lado].map((slot) => (
        <EncaixeDoCorpo key={slot} slot={slot} item={eq[slot] || null} aberto={aberta && aberta.slot === slot} aoAbrir={() => setAberta({ slot, inicial: null })} />
      ))}
      {mesa && aberta && ENCAIXE.boneco[lado].includes(aberta.slot) ? (
        <Gaveta key={aberta.slot} slot={aberta.slot} inicial={aberta.inicial} personagem={p} emCombate={emCombate} mesa
          aoEquipar={aoEquipar} aoDesequipar={aoDesequipar} aoFechar={fechar} />
      ) : null}
    </div>
  );
  const colunas = mesa ? ENCAIXE.mochila.mesa : ENCAIXE.mochila.telefone;
  const vagas = limite ? Math.max(0, limite - inv.length) : (colunas - (inv.length % colunas)) % colunas;
  const ca = caDoHeroi(p);
  return (
    <section aria-label="Equipamento" className="flex flex-col" style={{ gap: FICHA_CARTA.folga }}>
      <div className="relative flex items-start justify-center" style={{ gap: G_FOLGA }}>
        {coluna("esquerda")}
        <div className="flex flex-col items-center" style={{ gap: ENCAIXE.mochila.folga }}>
          {!semRosto ? (mesa ? <RostoNaMoldura personagem={p} lex={lex} /> : <RostoNaMoldura personagem={p} tamanho="carta" aro={FICHA_CARTA.carta.telefone} lex={lex} />) : null}
          {ENCAIXE.boneco.baixo.map((slot) => (
            <span key={slot} className="relative">
              <EncaixeDoCorpo slot={slot} item={eq[slot] || null} aberto={aberta && aberta.slot === slot} aoAbrir={() => setAberta({ slot, inicial: null })} />
              {mesa && aberta && aberta.slot === slot ? (
                <Gaveta key={slot} slot={slot} inicial={aberta.inicial} personagem={p} emCombate={emCombate} mesa
                  aoEquipar={aoEquipar} aoDesequipar={aoDesequipar} aoFechar={fechar} />
              ) : null}
            </span>
          ))}
        </div>
        {coluna("direita")}
      </div>
      {ca != null ? <p className="tv-mono text-center" style={{ color: T.ink, fontSize: FICHA_CARTA.texto.nota }}>CA {ca}</p> : null}
      <div className="flex items-baseline justify-between">
        <h3 className="tv-titulo uppercase" style={{ color: T.inkDim, fontSize: FICHA_CARTA.texto.nota, letterSpacing: "0.12em" }}>Mochila</h3>
        <span className="tv-mono" style={{ color: T.inkDim, fontSize: FICHA_CARTA.texto.nota }}>{limite ? `${inv.length} de ${limite}` : inv.length}</span>
      </div>
      <div className="grid justify-center" style={{ gridTemplateColumns: `repeat(${colunas}, ${ENCAIXE.lado}px)`, gap: ENCAIXE.mochila.folga }}>
        {inv.map((it, k) => {
          const slot = encaixeDoItem(it);
          const qtd = it && typeof it === "object" && Number(it.qtd) > 1 ? it.qtd : null;
          return (
            <Encaixe key={k} raridade={raridadeDoItem(it)} icone={iconeDoItem(it, ICONES_DE_ITEM)} canto={qtd} ariaLabel={nomeDe(it)}
              aoTocar={slot ? () => setAberta({ slot, inicial: it }) : null} />
          );
        })}
        {Array.from({ length: vagas }, (_, k) => <Encaixe key={"v" + k} />)}
      </div>
      {!mesa && aberta ? (
        <Gaveta key={aberta.slot} slot={aberta.slot} inicial={aberta.inicial} personagem={p} emCombate={emCombate} mesa={false}
          aoEquipar={aoEquipar} aoDesequipar={aoDesequipar} aoFechar={fechar} />
      ) : null}
    </section>
  );
}
