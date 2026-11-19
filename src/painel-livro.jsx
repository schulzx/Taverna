/* ============================================================
   O LIVRO — o Diário e o Códex num livro só, com cinco fitas (V7 · 18/11)

   formas.md §«A Mesa do Mestre · F5» §1.2, §4 «O livro» e as pranchas
   F5-1…F5-5 e F5-11. Abre como todo objeto da mesa (ObjetoAberto): a capa
   de couro com fio de latão, duas páginas de pergaminho, a esquerda sempre o
   índice e a direita sempre o escolhido. No telefone, uma página só.

   As fitas: As buscas · Gente · Bestiário · Feitos · A crônica. A fita
   aberta é lacre com o nome escrito; é a única cera da tela que não é selo.

   AS BUSCAS são o miolo do Diário de sempre (painel-diario.jsx), inteiro —
   aceitar e recusar ofertas, o arco, o mundo que não espera, as cartas do
   quadro — pousado no couro de dentro da capa. As outras quatro são do Códex
   e leem as mesmas tabelas que ele lia (conquistas.js, bestiario.js,
   fichas.js, cronica.js), agora na página.

   Nada aqui decide regra: o que entra em cada página, a ordem e a conta
   saem de objetos-abertos.js (provado em testes/teste-objetos-abertos.mjs).
   ============================================================ */
import React from "react";
import { T, alfa, SOMBRA_DA_MESA } from "./estilo.js";
import { ObjetoAberto, Lacre, letraDaMesa, useJanela } from "./pecas-da-mesa.jsx";
import { FITAS_DO_LIVRO, FITA, OBJETO_ABERTO, fitaInicial, genteDoLivro, cartasDoBestiario, feitosDoLivro } from "./objetos-abertos.js";
import { PainelDiario } from "./painel-diario.jsx";
import { CATEGORIAS_CONQUISTA } from "./painel-codex.jsx";
import { conquistaPorId } from "./conquistas.js";
import { criaturasDoGenero } from "./bestiario.js";
import { cenarioAtivo } from "./cenario.js";
import { gerarCronica } from "./cronica.js";
import { retratoDe } from "./retratos.js";
import { Retrato } from "./ui.jsx";

const arr = (x) => (Array.isArray(x) ? x : []);
const PALAVRA_DA_AMEACA = { fraco: "ameaça fraca", comum: "ameaça comum", competente: "ameaça competente", elite: "elite", lendario: "lendária" };
const TINTA = T.tintaDoPergaminho, TINTA_DIM = T.tintaDoPergaminhoDim, BRASA = T.brasaNoPergaminho;

/* ---------------- as letras da página ---------------- */
function Rotulo({ children, extra = "" }) {
  return <div style={{ color: TINTA_DIM, margin: "0 0 10px", ...letraDaMesa("rotulo") }}>{children}{extra ? ` · ${extra}` : ""}</div>;
}
function Titulo({ children }) {
  return <h3 style={{ color: TINTA, margin: "0 0 10px", ...letraDaMesa("tituloObjeto") }}>{children}</h3>;
}
function Prosa({ children, italico = false, cor = TINTA }) {
  return <p style={{ color: cor, margin: "0 0 12px", ...letraDaMesa(italico ? "notaDoMestre" : "servico"), fontWeight: 400 }}>{children}</p>;
}
/* uma linha do índice: chão de osso e borda de tinta quando escolhida (nunca cor só) */
function LinhaDoIndice({ escolhida, aoTocar, children, rotulo }) {
  return (
    <button type="button" onClick={aoTocar} aria-pressed={escolhida ? "true" : "false"} aria-label={rotulo}
      className="tv-anel-foco w-full flex items-center text-left"
      style={{ gap: 12, minHeight: 56, padding: "8px 12px", borderRadius: 4, background: escolhida ? T.ossoLume : "transparent", border: `2px solid ${escolhida ? TINTA : "transparent"}`, cursor: "pointer" }}>
      {children}
    </button>
  );
}
/* o botão de papel: contorno de tinta, sem chão (o «pode agora» do livro) */
function BotaoDePapel({ children, nota = "", aoTocar, desligado = false, razao = "" }) {
  return (
    <button type="button" onClick={desligado ? undefined : aoTocar} aria-disabled={desligado ? "true" : "false"}
      className="tv-anel-foco w-full flex flex-col text-left"
      style={{ minHeight: 52, padding: "8px 14px", borderRadius: 4, background: desligado ? "transparent" : T.ossoLume, border: `1px solid ${TINTA}`, cursor: desligado ? "default" : "pointer" }}>
      <span style={{ color: TINTA, ...letraDaMesa("proposta") }}>{children}</span>
      {nota || razao ? <span style={{ color: desligado ? T.perigoNoPergaminho : TINTA_DIM, ...letraDaMesa("notaDoMestre") }}>{desligado ? razao : nota}</span> : null}
    </button>
  );
}

/* ---------------- as fitas ---------------- */
function Fitas({ fitas, aberta, aoAbrir, telefone }) {
  const largura = telefone ? FITA.telefone : FITA.largura;
  return (
    <div role="tablist" aria-label="As fitas do livro" className={telefone ? "flex tv-sem-barra" : "flex"}
      style={telefone ? { gap: 6, overflowX: "auto", paddingTop: FITA.sobe, marginBottom: -FITA.rabo } : { gap: FITA.passo - FITA.largura, paddingLeft: 60, alignItems: "flex-end", height: FITA.aberta + FITA.sobe }}>
      {fitas.map((f) => {
        const viva = f.id === aberta;
        return (
          <button key={f.id} type="button" role="tab" aria-selected={viva ? "true" : "false"} onClick={() => aoAbrir(f.id)}
            className="tv-anel-foco shrink-0 flex items-center justify-center"
            style={{
              width: largura, height: viva ? FITA.aberta : FITA.altura, border: 0, cursor: "pointer",
              transform: viva ? `translateY(-${FITA.sobe}px)` : "none", transition: `transform ${OBJETO_ABERTO.movimento.fita}ms ease`,
              clipPath: `polygon(0 ${FITA.rabo}px, 50% 0, 100% ${FITA.rabo}px, 100% 100%, 0 100%)`,
              background: viva ? T.lacre : T.couroAlto, color: viva ? T.sobreLacre : T.ink, boxShadow: SOMBRA_DA_MESA.peca,
              paddingTop: FITA.rabo, ...letraDaMesa("rotulo", telefone),
            }}>
            {f.rotulo}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- as duas páginas ---------------- */
function Paginas({ esquerda, direita, telefone, chave }) {
  const folha = { background: T.pergaminho, minHeight: 0 };
  if (telefone) {
    return (
      <div style={{ ...folha, padding: "20px 16px 24px" }}>
        {esquerda}
        <div aria-hidden="true" style={{ height: 1, background: alfa(T.tintaDoPergaminhoDim, 0.35), margin: "20px 0" }} />
        {direita}
      </div>
    );
  }
  return (
    <div className="flex-1 min-h-0 flex" style={{ padding: 10, gap: 0 }}>
      <section aria-label="O índice" className="flex-1 min-w-0 overflow-y-auto tv-scroll" style={{ ...folha, padding: `${OBJETO_ABERTO.conteudo}px 36px`, borderRadius: "4px 0 0 4px", boxShadow: `inset -40px 0 40px -40px ${alfa(T.couroBaixo, 0.22)}` }}>{esquerda}</section>
      <section key={chave} aria-label="A página escolhida" className="flex-1 min-w-0 overflow-y-auto tv-scroll" style={{ ...folha, padding: `${OBJETO_ABERTO.conteudo}px 36px`, borderRadius: "0 4px 4px 0", boxShadow: `inset 40px 0 40px -40px ${alfa(T.couroBaixo, 0.22)}` }}>{direita}</section>
    </div>
  );
}

/* ---------------- GENTE ---------------- */
function rostoDaPessoa(g) {
  const r = g.ficha && g.ficha.retrato;
  if (r && typeof r === "object" && r.semente) return { semente: r.semente, ente: r.ente || null };
  return { semente: g.nome, ente: g.npc ? { nome: g.nome, papel: g.npc.papel || "pessoa", genero: g.npc.genero || "" } : null };
}
function PaginaDaGente({ paginas, npcs, aoApontar, telefone }) {
  const [procura, setProcura] = React.useState("");
  const [id, setId] = React.useState(null);
  const gente = genteDoLivro(paginas, npcs, procura);
  const escolhida = gente.find((g) => g.id === id) || (telefone ? null : gente[0]) || null;
  const vazia = !genteDoLivro(paginas, npcs, "").length;
  const esquerda = (
    <>
      <Rotulo extra={vazia ? "" : String(genteDoLivro(paginas, npcs, "").length)}>Gente</Rotulo>
      {vazia ? (
        <Prosa italico cor={TINTA_DIM}>Você ainda não conhece ninguém pelo nome. Pergunte o nome a quem cruzar o seu caminho: quem você conhece ganha uma página aqui.</Prosa>
      ) : (
        <>
          <label className="flex items-center" style={{ gap: 8, minHeight: 44, padding: "0 12px", marginBottom: 12, borderRadius: 4, border: `1px solid ${TINTA_DIM}`, background: T.ossoLume }}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><circle cx="7" cy="7" r="5" fill="none" stroke={TINTA_DIM} strokeWidth="1.6" /><path d="M11 11l3.5 3.5" stroke={TINTA_DIM} strokeWidth="1.6" strokeLinecap="round" /></svg>
            <input value={procura} onChange={(e) => setProcura(e.target.value)} placeholder="Procurar" aria-label="Procurar alguém pelo nome" className="tv-campo-de-papel"
              style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: TINTA, ...letraDaMesa("servico") }} />
          </label>
          <div className="flex flex-col" style={{ gap: 4 }}>
            {gente.map((g) => {
              const rosto = rostoDaPessoa(g);
              return (
                <LinhaDoIndice key={g.id} escolhida={!!escolhida && escolhida.id === g.id} aoTocar={() => setId(g.id)} rotulo={g.nome}>
                  {/* V8 (miúdo do V7): o retrato não encolhe na linha estreita — era um oval fino */}
                  <span aria-hidden="true" style={{ flex: "none", width: telefone ? 48 : 56, height: telefone ? 48 : 56, borderRadius: "50%", overflow: "hidden" }}>
                    <Retrato semente={rosto.semente} ente={rosto.ente} semCarta tamanho={telefone ? 48 : 56} anel={T.latao} />
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span style={{ color: TINTA, ...letraDaMesa("nome") }}>{g.nome}</span>
                    {g.papel ? <span style={{ color: TINTA_DIM, ...letraDaMesa("servico"), fontWeight: 400 }}>{g.papel}</span> : null}
                    {g.lembra ? <span className="truncate" style={{ color: TINTA_DIM, ...letraDaMesa("notaDoMestre") }}>{g.lembra}</span> : null}
                  </span>
                </LinhaDoIndice>
              );
            })}
            {!gente.length ? <Prosa italico cor={TINTA_DIM}>Ninguém com esse nome nas páginas.</Prosa> : null}
          </div>
        </>
      )}
    </>
  );
  let direita = null;
  if (escolhida) {
    const f = escolhida.ficha;
    const rosto = rostoDaPessoa(escolhida);
    const verbos = f ? arr(f.verbos).filter((v) => v && v.verbo) : [];
    direita = (
      <>
        <div className="flex items-start" style={{ gap: 20, marginBottom: 16 }}>
          <span aria-hidden="true" style={{ flex: "none", width: telefone ? 96 : 150, height: telefone ? 96 : 150, borderRadius: "50%", overflow: "hidden" }}>
            <Retrato semente={rosto.semente} ente={rosto.ente} semCarta tamanho={telefone ? 96 : 150} recorte="cartao" anel={T.latao} />
          </span>
          <div className="flex flex-col min-w-0">
            <Titulo>{escolhida.nome}</Titulo>
            {escolhida.papel ? <Prosa>{escolhida.papel}</Prosa> : null}
            {f && f.linha ? <Prosa italico cor={TINTA_DIM}>{f.linha}</Prosa> : null}
          </div>
        </div>
        {f && arr(f.sabe).length ? <><Rotulo>O que você sabe</Rotulo>{arr(f.sabe).map((s, i) => <Prosa key={"s" + i}>{s}</Prosa>)}</> : null}
        {f && f.pista ? <Prosa italico cor={BRASA}>{f.pista}</Prosa> : null}
        {f && arr(f.lembra).length ? <><Rotulo>Onde vocês se cruzaram</Rotulo>{arr(f.lembra).map((s, i) => <Prosa key={"l" + i} italico>{s}</Prosa>)}</> : null}
        {!f && escolhida.npc && escolhida.npc.notas ? <><Rotulo>O que você sabe</Rotulo><Prosa>{escolhida.npc.notas}</Prosa></> : null}
        {verbos.length ? (
          <div className="flex flex-col" style={{ gap: 8, marginTop: 8 }}>
            {verbos.map((v, i) => (
              <BotaoDePapel key={v.verbo + i} nota={v.preco || ""} desligado={!!v.impedido} razao={v.impedido || ""}
                aoTocar={() => { try { if (aoApontar) aoApontar(f, v); } catch (e) { /* nunca custa o turno */ } }}>{v.verbo}</BotaoDePapel>
            ))}
          </div>
        ) : null}
      </>
    );
  } else if (!vazia) {
    direita = <Prosa italico cor={TINTA_DIM}>Toque num nome para abrir a página dele.</Prosa>;
  }
  return <Paginas esquerda={esquerda} direita={direita} telefone={telefone} chave={escolhida ? escolhida.id : "nada"} />;
}

/* ---------------- BESTIÁRIO ---------------- */
function CartaDaFera({ carta, lado, escolhida, aoTocar }) {
  const alto = Math.round(lado * 1.35);
  let pintada = false;
  try { pintada = carta.vista && !carta.unica && !!retratoDe({ nome: carta.nome }, null); } catch (e) { pintada = false; }
  return (
    <button type="button" onClick={aoTocar} aria-pressed={escolhida ? "true" : "false"} aria-label={carta.vista ? carta.nome : "Fera ainda não vista"}
      className="tv-anel-foco flex flex-col items-center justify-center"
      style={{ width: lado, height: alto, padding: 6, gap: 6, borderRadius: 6, cursor: "pointer", boxShadow: SOMBRA_DA_MESA.peca,
        background: carta.vista ? T.ossoLume : T.couro, border: `2px solid ${escolhida ? TINTA : T.latao}`, transform: escolhida ? "translateY(-2px)" : "none" }}>
      {carta.vista ? (
        <>
          {pintada ? <Retrato semente={carta.nome} ente={{ nome: carta.nome }} semCarta tamanho={lado - 22} recorte="cartao" anel={T.latao} />
            : <span aria-hidden="true" style={{ color: TINTA_DIM, ...letraDaMesa("contagem") }}>{carta.nome.slice(0, 1)}</span>}
          <span className="text-center" style={{ color: TINTA, ...letraDaMesa("rotulo"), lineHeight: 1.15 }}>{carta.nome}</span>
        </>
      ) : (
        <svg aria-hidden="true" width={lado * 0.4} height={lado * 0.4} viewBox="0 0 24 24"><path d="M12 2l10 10-10 10L2 12z" fill="none" stroke={T.latao} strokeWidth="1.5" /></svg>
      )}
    </button>
  );
}
function PaginaDoBestiario({ mundo, descobertas, telefone }) {
  const [nome, setNome] = React.useState(null);
  let criaturas = [];
  try { criaturas = criaturasDoGenero((mundo || {}).genero || cenarioAtivo().generos.padrao); } catch (e) { criaturas = []; }
  const b = cartasDoBestiario(criaturas, descobertas);
  const escolhida = b.cartas.find((c) => c.nome === nome) || (telefone ? null : b.cartas.find((c) => c.vista)) || null;
  const lado = telefone ? 96 : 104;
  const esquerda = (
    <>
      <Rotulo extra={`${b.vistas} de ${b.total}`}>Bestiário</Rotulo>
      {!b.vistas ? <Prosa italico cor={TINTA_DIM}>Nenhuma fera vista. A primeira que você enfrentar ou observar vira a primeira carta.</Prosa> : null}
      <div className="grid" style={{ gridTemplateColumns: `repeat(auto-fill, ${lado}px)`, gap: telefone ? 10 : 20, justifyContent: "start" }}>
        {b.cartas.map((c) => <CartaDaFera key={c.nome} carta={c} lado={lado} escolhida={!!escolhida && escolhida.nome === c.nome} aoTocar={() => setNome(c.nome)} />)}
      </div>
    </>
  );
  let direita = null;
  if (escolhida && escolhida.vista) {
    const c = escolhida.criatura;
    let pintada = false;
    try { pintada = !escolhida.unica && !!retratoDe({ nome: escolhida.nome }, null); } catch (e) { pintada = false; }
    direita = (
      <>
        {pintada ? <div style={{ marginBottom: 16 }}><Retrato semente={escolhida.nome} ente={{ nome: escolhida.nome }} semCarta tamanho={telefone ? 120 : 190} recorte="cartao" anel={T.latao} /></div> : null}
        <Titulo>{escolhida.nome}</Titulo>
        <Prosa italico cor={TINTA_DIM}>{escolhida.unica ? "única desta história" : PALAVRA_DA_AMEACA[c && c.ameaca] || ""}</Prosa>
        {c && c.desc ? <><Rotulo>O que você já sabe</Rotulo><Prosa>{c.desc}</Prosa></> : null}
      </>
    );
  } else if (escolhida) {
    direita = <><Titulo>Ainda não vista</Titulo><Prosa italico cor={TINTA_DIM}>Esta carta continua de costas até você cruzar com a fera.</Prosa></>;
  }
  return <Paginas esquerda={esquerda} direita={direita} telefone={telefone} chave={escolhida ? escolhida.nome : "nada"} />;
}

/* ---------------- FEITOS ---------------- */
function LugarDoLacre({ lugar, escolhido, aoTocar, lado = 56 }) {
  return (
    <button type="button" onClick={aoTocar} aria-pressed={escolhido ? "true" : "false"} aria-label={lugar.lacrado ? `${lugar.nome}, lacrado` : lugar.oculto ? "Feito por descobrir" : `${lugar.nome}, por lacrar`}
      className="tv-anel-foco inline-flex items-center justify-center"
      style={{ width: lado, height: lado, borderRadius: "50%", padding: 0, cursor: "pointer", background: "transparent",
        border: lugar.lacrado ? 0 : `1.5px dashed ${TINTA_DIM}`, outline: escolhido ? `2px solid ${TINTA}` : "none", outlineOffset: 3 }}>
      {lugar.lacrado ? <Lacre tamanho="M" tipo="conquista" rotulo={lugar.nome} />
        : lugar.oculto ? <span aria-hidden="true" style={{ color: TINTA_DIM, ...letraDaMesa("contagem") }}>?</span> : null}
    </button>
  );
}
function PaginaDosFeitos({ conquistas, tituloAtivo, escolherTitulo, telefone }) {
  const desb = (conquistas && conquistas.desbloqueadas) || {};
  const familias = feitosDoLivro(CATEGORIAS_CONQUISTA, desb, conquistaPorId);
  const [id, setId] = React.useState(null);
  const todos = familias.flatMap((f) => f.lugares.map((l) => ({ ...l, familia: f })));
  const escolhido = todos.find((l) => l.id === id) || (telefone ? null : todos.find((l) => l.lacrado) || todos[0]) || null;
  const lacrados = todos.filter((l) => l.lacrado).length;
  const esquerda = (
    <>
      <Rotulo extra={`${lacrados} de ${todos.length}`}>Feitos</Rotulo>
      <Prosa italico cor={TINTA_DIM}>{tituloAtivo ? `Título em uso: ${tituloAtivo}` : "Nenhum título em uso. Cada feito lacrado dá um."}</Prosa>
      {familias.map((f) => (
        <div key={f.id} style={{ marginBottom: 18 }}>
          <Rotulo extra={f.conta}>{f.rotulo}</Rotulo>
          <div className="flex flex-wrap" style={{ gap: 14 }}>
            {f.lugares.map((l) => <LugarDoLacre key={l.id} lugar={l} escolhido={!!escolhido && escolhido.id === l.id} aoTocar={() => setId(l.id)} />)}
          </div>
        </div>
      ))}
    </>
  );
  let direita = null;
  if (escolhido) {
    const emUso = escolhido.lacrado && escolhido.titulo && tituloAtivo === escolhido.titulo;
    const prox = escolhido.familia.proximo;
    direita = (
      <>
        <div style={{ marginBottom: 16 }}>
          {escolhido.lacrado ? <Lacre tamanho="G" tipo="conquista" rotulo={escolhido.nome} />
            : <span aria-hidden="true" className="inline-flex items-center justify-center" style={{ width: 96, height: 96, borderRadius: "50%", border: `2px dashed ${TINTA_DIM}`, color: TINTA_DIM, ...letraDaMesa("titulo") }}>{escolhido.oculto ? "?" : ""}</span>}
        </div>
        <Titulo>{escolhido.oculto ? "Por descobrir" : escolhido.nome}</Titulo>
        <Prosa italico cor={TINTA_DIM}>{escolhido.lacrado ? "Lacrado." : escolhido.oculto ? "Este feito só mostra o nome depois de lacrado." : escolhido.dica}</Prosa>
        {escolhido.lacrado && escolhido.titulo ? (
          <>
            <Rotulo>O título</Rotulo>
            <BotaoDePapel nota={emUso ? "Toque para deixar de usar." : "Os outros passam a chamar você assim."}
              aoTocar={() => { try { if (escolherTitulo) escolherTitulo(escolhido.id); } catch (e) { /* nunca custa o turno */ } }}>
              {emUso ? `Em uso: ${escolhido.titulo}` : `Usar o título ${escolhido.titulo}`}
            </BotaoDePapel>
          </>
        ) : null}
        {prox && prox.id !== escolhido.id ? (
          <div style={{ marginTop: 18 }}>
            <Rotulo extra={escolhido.familia.conta}>O próximo desta família</Rotulo>
            <Prosa>{prox.oculto ? "Um feito que ninguém conta antes da hora." : `${prox.nome}: ${prox.dica}`}</Prosa>
          </div>
        ) : null}
      </>
    );
  }
  return <Paginas esquerda={esquerda} direita={direita} telefone={telefone} chave={escolhido ? escolhido.id : "nada"} />;
}

/* ---------------- A CRÔNICA ---------------- */
function linhasDaCronica(md) {
  return String(md || "").split("\n").map((l) => l.replace(/\*\*|__/g, "").replace(/^[-*] /, "· ")).filter((l, i, a) => l.trim() || (i > 0 && a[i - 1].trim()));
}
function PaginaDaCronica({ dados, onExportarCronica, onExportarSave, aoGerarCronica, telefone }) {
  let md = "";
  try { md = gerarCronica(dados || {}); } catch (e) { md = ""; }
  const esquerda = (
    <>
      <Rotulo>A crônica</Rotulo>
      <Prosa>A sua saga inteira, contada a partir do que aconteceu: herói, feitos, cicatrizes, companheiros, domínios, pessoas. Nada é inventado.</Prosa>
      <div className="flex flex-col" style={{ gap: 10, marginTop: 8 }}>
        {aoGerarCronica ? (
          <BotaoDePapel nota="Leva cerca de um minuto, e você pode fechar o livro enquanto isso."
            aoTocar={() => { try { aoGerarCronica(); } catch (e) { /* nunca custa o turno */ } }}>Escrever a crônica por extenso</BotaoDePapel>
        ) : null}
        {onExportarCronica ? (
          <BotaoDePapel nota="O texto desta página, num arquivo para ler." aoTocar={() => { try { onExportarCronica(md); } catch (e) { /* idem */ } }}>Baixar a crônica</BotaoDePapel>
        ) : null}
        {onExportarSave ? (
          <BotaoDePapel nota="A crônica é para ler; para voltar em outro navegador, o que serve é a campanha guardada."
            aoTocar={() => { try { onExportarSave(); } catch (e) { /* idem */ } }}>Guardar a campanha em arquivo</BotaoDePapel>
        ) : null}
      </div>
    </>
  );
  const linhas = linhasDaCronica(md);
  const direita = linhas.length ? (
    <div>
      {linhas.map((l, i) => {
        const titulo = /^#+\s/.test(l);
        const t = l.replace(/^#+\s*/, "");
        return titulo
          ? <div key={i} style={{ color: TINTA, margin: "14px 0 8px", ...letraDaMesa(i === 0 ? "tituloObjeto" : "rotulo") }}>{t}</div>
          : <p key={i} style={{ color: TINTA, margin: "0 0 6px", ...letraDaMesa("prosa", telefone) }}>{t || " "}</p>;
      })}
    </div>
  ) : <Prosa italico cor={TINTA_DIM}>A crônica começa quando a história começa.</Prosa>;
  return <Paginas esquerda={esquerda} direita={direita} telefone={telefone} chave="cronica" />;
}

/* ---------------- O LIVRO ---------------- */
/* Props:
   · fita — a fita em que abre ("buscas" pelo Diário, "gente" pelo Códex);
   · aoTrocarFita(id) — o App troca a porta (as buscas leem o Diário, as
     outras o Códex); sem ele, a fita troca só aqui;
   · comCodex — as quatro fitas do Códex só aparecem com a porta dele aberta;
   · diario — as props do PainelDiario, tal qual (sem aoFechar: quem fecha é
     o livro);
   · paginas, npcs, aoApontar (Gente) · mundo, descobertas (Bestiário) ·
     conquistas, tituloAtivo, escolherTitulo (Feitos) · dadosDaCronica,
     onExportarCronica, onExportarSave, aoGerarCronica (A crônica);
   · aoPousar — fecha o livro. */
export function PainelLivro({ fita = "buscas", aoTrocarFita = null, comCodex = true, diario = {}, paginas = [], npcs = {}, aoApontar = null, mundo = null, descobertas = [],
  conquistas = null, tituloAtivo = null, escolherTitulo = null, dadosDaCronica = null, onExportarCronica = null, onExportarSave = null, aoGerarCronica = null, aoPousar = null }) {
  const j = useJanela();
  const telefone = j.l < OBJETO_ABERTO.corteDoTelefone;
  const fitas = comCodex ? FITAS_DO_LIVRO : FITAS_DO_LIVRO.filter((f) => f.id === "buscas");
  /* a fita pedida vale só ao abrir: trocar de fita troca a porta no App (e
     com ela o `fita` que chega), e o livro não pode voltar à fita da porta */
  const [aqui, setAqui] = React.useState(() => fitaInicial(fita));
  const aberta = fitas.some((f) => f.id === aqui) ? aqui : fitas[0].id;
  const abrir = (id) => {
    setAqui(id);
    try { if (aoTrocarFita) aoTrocarFita(id); } catch (e) { /* a fita troca aqui mesmo assim */ }
  };
  let corpo = null;
  if (aberta === "buscas") {
    corpo = (
      <div className={telefone ? "" : "flex-1 min-h-0 overflow-y-auto tv-scroll"} style={{ background: T.pagina, margin: telefone ? 0 : 10, borderRadius: 4, padding: telefone ? "16px 12px" : "28px 32px" }}>
        <PainelDiario {...(diario || {})} leiaute={telefone ? null : "meia"} />
      </div>
    );
  } else if (aberta === "gente") corpo = <PaginaDaGente paginas={paginas} npcs={npcs} aoApontar={aoApontar} telefone={telefone} />;
  else if (aberta === "bestiario") corpo = <PaginaDoBestiario mundo={mundo} descobertas={descobertas} telefone={telefone} />;
  else if (aberta === "feitos") corpo = <PaginaDosFeitos conquistas={conquistas} tituloAtivo={tituloAtivo} escolherTitulo={escolherTitulo} telefone={telefone} />;
  else corpo = <PaginaDaCronica dados={dadosDaCronica} onExportarCronica={onExportarCronica} onExportarSave={onExportarSave} aoGerarCronica={aoGerarCronica} telefone={telefone} />;
  return (
    <ObjetoAberto objeto="livro" titulo="O livro" aoPousar={aoPousar} acima={<Fitas fitas={fitas} aberta={aberta} aoAbrir={abrir} telefone={telefone} />}>
      <div role="tabpanel" aria-label={(fitas.find((f) => f.id === aberta) || {}).rotulo} className={telefone ? "" : "flex-1 min-h-0 flex flex-col"}>{corpo}</div>
    </ObjetoAberto>
  );
}
