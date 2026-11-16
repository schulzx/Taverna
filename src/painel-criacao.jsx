/* ============================================================
   A CRIAÇÃO EM CARTAS (V5 · F3 §2–§4 de mente/formas.md, 16/11/2026)

   O sorteio (a ficha pronta, com «trocar» em cada bloco e «Começar»), o
   herói em cartas (raça e classe com as pinturas reais), do que é feita
   (os atributos como peças, o antecedente, o conceito opcional), o mundo
   em quatro cartas (a da voz vira e mostra a frase) e a passagem (a mesa
   sendo posta enquanto o Mestre escreve a primeira cena).

   Do link à primeira narração: «Sentar à mesa» → «Começar». Nenhuma frase
   obrigatória. Toda decisão é da conta pura (criacao-da-mesa.js); esta
   folha só mostra e devolve o toque. Componentes definidos FORA do render
   (um componente nascido dentro do render mata o foco do campo do nome).
   ============================================================ */
import React from "react";
import { T, CARTA_DE_RETRATO, CARTA_DO_HEROI, CARTA_DO_MUNDO, PECA_DE_ATRIBUTO, POR_A_MESA, SOMBRA_DA_MESA, GLIFO_DA_VOZ, GLIFO_DO_MOLDE, GLIFO_DO_ARCO, alfa } from "./estilo.js";
import { ATRIBUTOS, ATRIBUTO_MAX_CRIACAO } from "./constantes.js";
import { CLASSES } from "./classes.js";
import { VOZES } from "./vozes.js";
import { moldesDisponiveis } from "./moldes.js";
import { ANTECEDENTES } from "./antecedentes.js";
import { letraDaMesa } from "./mesa-do-mestre.js";
import { retratoDe } from "./retratos.js";
import { MesaDaNoite, MarcaDaCasa, BotaoDaMesa, Vinculo, CartaDoHeroi, GlifoDaMesa, GlifoDoGenero, PecaDeRecurso, VelaDaChegada, useTelefone } from "./painel-chegada.jsx";
import {
  sortearMesa, trocarNoHeroi, trocarNoMundo, outroNome, vizinho, noSexo, racasDaCriacao, generosDaCriacao, espinhasDaCriacao, generoPorId,
  ajustarPonto, razaoDoPonto, porOsQueFaltam, pontosRestantes, atributosComRaca, antecedenteDaMesa, razaoDeNaoComecar, POR_PONTO, conceitoDoSistema, textoNoSexo,
} from "./criacao-da-mesa.js";

const ROTULO = { ...letraDaMesa("rotulo"), textTransform: "uppercase", letterSpacing: ".1em" };
const PAPEL = { background: T.pergaminho, color: T.tintaDoPergaminho, borderRadius: 4, boxShadow: SOMBRA_DA_MESA.pousado };
const FIO = { height: 1, background: alfa(T.tintaDoPergaminho, 0.25), margin: "12px 0" };

/* A CARTA DE RETRATO (F3 §3): leque (o nome na carta) ou tira (o nome por baixo) */
function CartaDeRetrato({ raca, classe, sexo, semente, tamanho = "leque", escolhida = false, nome, onClick, largura = null }) {
  const C = CARTA_DE_RETRATO[tamanho] || CARTA_DE_RETRATO.leque;
  const w = largura || C.largura;
  const h = Math.round(w * (C.altura / C.largura));
  let arquivo = null;
  try { const r = retratoDe({ raca, classe, genero: sexo, feicoesFixas: true, semente }, { fixo: true }); arquivo = r && r.arquivo; } catch { arquivo = null; }
  const nomeNaCarta = tamanho === "leque" && w >= CARTA_DE_RETRATO.leque.largura;
  return (
    <button type="button" role="radio" aria-checked={escolhida} aria-label={nome} onClick={onClick} className="tv-mesa-foco"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: 0, padding: 0, cursor: "pointer", transform: escolhida ? `translateY(-${CARTA_DE_RETRATO.sobe}px)` : "none", transition: "transform .15s" }}>
      <span style={{ position: "relative", display: "block", width: w, height: h, borderRadius: C.raio, overflow: "hidden", border: `${C.aro}px solid ${escolhida ? T.osso : T.latao}`, background: T.couroBaixo, boxShadow: escolhida ? SOMBRA_DA_MESA.erguido : SOMBRA_DA_MESA.peca }}>
        {arquivo ? <img src={arquivo} alt="" loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /> : null}
        {nomeNaCarta ? (
          <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: escolhida ? 28 : C.pe, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: escolhida ? 5 : 8,
            background: escolhida ? T.osso : `linear-gradient(to bottom, ${alfa(T.couroBaixo, 0)}, ${alfa(T.couroBaixo, 0.96)})`,
            fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: C.nome, color: escolhida ? T.tintaDoPergaminho : T.ink, textTransform: "uppercase", letterSpacing: ".04em" }}>{nome}</span>
        ) : null}
        {escolhida ? <span aria-hidden="true" style={{ position: "absolute", right: 4, top: 4, width: tamanho === "tira" ? CARTA_DE_RETRATO.marcaTira : CARTA_DE_RETRATO.marca, height: tamanho === "tira" ? CARTA_DE_RETRATO.marcaTira : CARTA_DE_RETRATO.marca, borderRadius: "50%", background: T.ossoLume, border: `1.5px solid ${T.tintaDoPergaminho}`, color: T.tintaDoPergaminho, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>✓</span> : null}
      </span>
      {!nomeNaCarta ? (
        <span style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: C.nome, minHeight: CARTA_DE_RETRATO.tira.plaqueta, padding: "0 6px", borderRadius: 3, background: escolhida ? T.osso : "transparent", color: escolhida ? T.tintaDoPergaminho : T.ink, fontWeight: escolhida ? 600 : 400 }}>{nome}</span>
      ) : null}
    </button>
  );
}

/* um bloco da ficha com o «trocar» encostado à direita */
function BlocoDaFicha({ rotulo, aoTrocar, rotuloDoTrocar = "trocar", children }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <span style={{ ...ROTULO, color: T.tintaDoPergaminhoDim }}>{rotulo}</span>
        {aoTrocar ? <Vinculo sobrePapel onClick={aoTrocar}>{rotuloDoTrocar}</Vinculo> : null}
      </div>
      {children}
    </div>
  );
}

function DiscoDeAtributo({ valor, nome, lado = 44 }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6, width: 76 }}>
      <span style={{ width: lado, height: lado, borderRadius: "50%", background: T.osso, boxShadow: `0 ${PECA_DE_ATRIBUTO.lado}px 0 ${T.ossoSombra}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: lado >= 60 ? 22 : 16, color: T.tintaDoPergaminho }}>{valor >= 0 ? `+${valor}` : valor}</span>
      {nome ? <span style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: 13, color: "inherit" }}>{nome}</span> : null}
    </span>
  );
}

/* 4 · O SORTEIO — a ficha pronta */
function Sorteio({ mesa, telefone, ir, aoComecar, aoSortearDeNovo, aoOutroNome }) {
  const h = mesa.heroi;
  const ant = antecedenteDaMesa(h.antecedenteId);
  const finais = atributosComRaca(h.pontos, h.raca);
  const voz = VOZES.find((v) => v.id === mesa.mundo.voz) || VOZES[0];
  const molde = moldesDisponiveis().find((m) => m.id === mesa.mundo.molde);
  const arco = espinhasDaCriacao().find((e) => e.id === mesa.mundo.estrutura);
  const razao = razaoDeNaoComecar(mesa);
  return (
    <div style={{ padding: telefone ? "20px 8px 32px" : "28px 56px 24px", display: "flex", flexDirection: "column", gap: telefone ? 16 : 8 }}>
      <MarcaDaCasa deitada escala={telefone ? 0.8 : 1} />
      <div style={{ display: "flex", flexDirection: telefone ? "column" : "row", gap: telefone ? 20 : 70, alignItems: telefone ? "center" : "flex-start", justifyContent: "center" }}>
        <div style={{ marginTop: telefone ? 0 : 90 }}><CartaDoHeroi heroi={{ ...h, semente: mesa.semente }} escala={telefone ? CARTA_DO_HEROI.escala.telefone : CARTA_DO_HEROI.escala.sorteio} falar /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: telefone ? "100%" : 620, maxWidth: "100%" }}>
          <div style={{ ...PAPEL, padding: telefone ? "20px 18px" : "28px 48px" }}>
            <BlocoDaFicha rotulo="O Mestre sorteou para você" aoTrocar={aoOutroNome} rotuloDoTrocar="sortear outro nome">
              <h1 style={{ ...letraDaMesa("titulo"), margin: "2px 0 0", color: T.tintaDoPergaminho }}>{h.nome}</h1>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ ...letraDaMesa("proposta") }}>{`${noSexo(h.raca, h.sexo)} · ${noSexo(h.classe, h.sexo)} · ${h.sexo}`}</span>
                <Vinculo sobrePapel onClick={() => ir("heroi")}>trocar</Vinculo>
              </div>
            </BlocoDaFicha>
            <div style={FIO} />
            <BlocoDaFicha rotulo="De onde vem" aoTrocar={() => ir("atributos")}>
              <div style={{ ...letraDaMesa("proposta"), marginTop: 4 }}>{noSexo(ant.nome, h.sexo)}</div>
              <p style={{ ...letraDaMesa("falaDoJogador"), margin: "4px 0 0" }}>«{textoNoSexo(ant.gancho, h.sexo)}»</p>
            </BlocoDaFicha>
            {!telefone ? (
              <>
                <div style={FIO} />
                <BlocoDaFicha rotulo="Do que é feita" aoTrocar={() => ir("atributos")}>
                  <div style={{ display: "flex", gap: 12, marginTop: 4 }}>{ATRIBUTOS.map((a) => <DiscoDeAtributo key={a.id} valor={finais[a.id]} nome={a.nome} />)}</div>
                </BlocoDaFicha>
              </>
            ) : null}
            <div style={FIO} />
            <BlocoDaFicha rotulo="O mundo" aoTrocar={() => ir("mundo")}>
              <div style={{ ...letraDaMesa("proposta"), marginTop: 4 }}>{[generoPorId(mesa.mundo.generoId).label, molde && molde.nome, arco && arco.nome].filter(Boolean).join(" · ")}</div>
              <p style={{ ...letraDaMesa("notaDoMestre"), color: T.tintaDoPergaminhoDim, margin: "6px 0 0" }}>{`O Mestre fala em tom ${voz.nome}: «${String(voz.exemplo || "").slice(0, 90)}…»`}</p>
            </BlocoDaFicha>
            <div style={FIO} />
            <p style={{ ...letraDaMesa("notaDoMestre"), color: T.tintaDoPergaminhoDim, margin: 0 }}>Tudo aqui pode mudar antes de começar. Depois, é a história que muda.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
            <BotaoDaMesa principal largura={telefone ? "100%" : 280} impedido={!!razao} razao={razao || ""} onClick={aoComecar}>Começar</BotaoDaMesa>
            <button type="button" onClick={aoSortearDeNovo} className="tv-mesa-foco" style={{ minHeight: 44, background: "none", border: 0, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, color: T.ink, fontFamily: "'Spectral', Georgia, serif", fontWeight: 500, fontSize: 16, textDecoration: "underline", textUnderlineOffset: 3 }}>
              <GlifoDaMesa nome="dado" tamanho={20} cor={T.ink} />Sortear tudo de novo
            </button>
          </div>
          <p style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio, margin: 0 }}>O Mestre escreve a primeira cena em alguns segundos.</p>
        </div>
        {!telefone ? <div style={{ marginTop: 100, width: 123 }} aria-hidden="true"><VelaDaChegada /></div> : null}
      </div>
    </div>
  );
}

/* o pé das telas de escolha: o vínculo de volta e o «Pronto» */
function PeDaEscolha({ telefone, secundario, aoSecundario, aoPronto, razao = null }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "flex-end", alignItems: "flex-start", position: telefone ? "sticky" : "static", bottom: 0, padding: telefone ? "14px 8px" : "24px 0 0", background: telefone ? T.couroBaixo : "transparent", borderTop: telefone ? `1px solid ${T.latao}` : 0 }}>
      {secundario && !telefone ? <BotaoDaMesa largura={204} onClick={aoSecundario}>{secundario}</BotaoDaMesa> : null}
      <BotaoDaMesa principal largura={telefone ? "100%" : 280} impedido={!!razao} razao={razao || ""} onClick={aoPronto}>Pronto</BotaoDaMesa>
    </div>
  );
}

/* 5a · O HERÓI EM CARTAS: raça, classe, nome e sexo */
function HeroiEmCartas({ mesa, telefone, mudar, aoOutroNome, ir }) {
  const h = mesa.heroi;
  const racas = racasDaCriacao(mesa.mundo.generoId);
  const cObj = CLASSES.find((c) => c.nome === h.classe) || CLASSES[0];
  const chave = (ATRIBUTOS.find((a) => a.id === cObj.atributoChave) || {}).nome || cObj.atributoChave;
  const tira = telefone ? CARTA_DE_RETRATO.tira.largura : CARTA_DE_RETRATO.tira.largura;
  return (
    <div style={{ padding: telefone ? "16px 8px 0" : "28px 56px", display: "flex", flexDirection: telefone ? "column" : "row", gap: telefone ? 20 : 56 }}>
      <div style={{ width: telefone ? "100%" : 320, display: "flex", flexDirection: "column", gap: 18, flexShrink: 0 }}>
        <div><Vinculo seta onClick={() => ir("sorteio")}>Voltar à ficha</Vinculo></div>
        <div style={{ alignSelf: "center" }}><CartaDoHeroi heroi={{ ...h, semente: mesa.semente }} escala={telefone ? CARTA_DO_HEROI.escala.telefone : CARTA_DO_HEROI.escala.criacao} falar /></div>
        <label style={{ ...ROTULO, color: T.inkMeio, marginTop: 12 }} htmlFor="tv-nome-do-heroi">O nome</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input id="tv-nome-do-heroi" value={h.nome} maxLength={40} onChange={(e) => mudar("nome", e.target.value)} className="tv-mesa-foco"
            style={{ flex: 1, minWidth: 0, height: 48, padding: "0 14px", borderRadius: 2, border: 0, background: T.ossoLume, color: T.tintaDoPergaminho, fontFamily: "'Spectral', Georgia, serif", fontWeight: 500, fontSize: 16 }} />
          <button type="button" aria-label="Sortear outro nome" onClick={aoOutroNome} className="tv-mesa-foco" style={{ width: 44, height: 44, borderRadius: "50%", border: `1.5px solid ${T.latao}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <GlifoDaMesa nome="dado" tamanho={20} cor={T.ink} />
          </button>
        </div>
        <span style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio }}>{`O dado sorteia um nome de ${h.sexo === "mulher" ? "mulher" : "homem"} deste mundo.`}</span>
        <div role="radiogroup" aria-label="Quem é" style={{ display: "flex", gap: 10 }}>
          {[["mulher", "Mulher"], ["homem", "Homem"]].map(([id, rot]) => (
            <button key={id} type="button" role="radio" aria-checked={h.sexo === id} onClick={() => mudar("sexo", id)} className="tv-mesa-foco"
              style={{ flex: 1, height: 44, borderRadius: 4, cursor: "pointer", background: h.sexo === id ? T.osso : "transparent", color: h.sexo === id ? T.tintaDoPergaminho : T.ink, border: h.sexo === id ? 0 : `1.5px solid ${T.latao}`, fontFamily: "'Spectral', Georgia, serif", fontWeight: h.sexo === id ? 700 : 500, fontSize: 16 }}>{rot}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}><span style={{ ...ROTULO, color: T.inkMeio }}>A raça</span><span style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio }}>{`${racas.length} povos — a carta grande muda de rosto a cada toque`}</span></div>
        <div role="radiogroup" aria-label="A raça" style={{ display: "flex", gap: 5, overflowX: "auto", paddingTop: 8, paddingBottom: 4 }}>
          {racas.map((r) => <CartaDeRetrato key={r.nome} tamanho="tira" largura={tira} raca={r.nome} classe={h.classe} sexo={h.sexo} semente={mesa.semente} nome={noSexo(r.nome, h.sexo)} escolhida={h.raca === r.nome} onClick={() => mudar("raca", r.nome)} />)}
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "baseline", marginTop: 8 }}><span style={{ ...ROTULO, color: T.inkMeio }}>A classe</span><span style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio }}>doze ofícios</span></div>
        <div role="radiogroup" aria-label="A classe" style={{ display: "grid", gridTemplateColumns: telefone ? `repeat(${CARTA_DE_RETRATO.telefone.colunas}, 1fr)` : `repeat(6, ${CARTA_DE_RETRATO.leque.largura}px)`, gap: telefone ? 12 : 17, paddingTop: 8, justifyItems: "center" }}>
          {CLASSES.map((c) => <CartaDeRetrato key={c.nome} tamanho={telefone ? "tira" : "leque"} largura={telefone ? CARTA_DE_RETRATO.telefone.largura : null} raca={h.raca} classe={c.nome} sexo={h.sexo} semente={mesa.semente} nome={noSexo(c.nome, h.sexo)} escolhida={h.classe === c.nome} onClick={() => mudar("classe", c.nome)} />)}
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ ...letraDaMesa("lugar"), color: T.ink, textTransform: "uppercase" }}>{noSexo(cObj.nome, h.sexo)}</div>
          <div style={{ ...letraDaMesa("proposta"), color: T.ink, marginTop: 4 }}>{cObj.desc}</div>
          <div style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio, marginTop: 4 }}>{`O que mais pesa ${h.sexo === "mulher" ? "nela" : "nele"}: ${chave}.`}</div>
          {cObj.subclasses.length > 1 ? (
            <div role="radiogroup" aria-label="O caminho" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12, alignItems: "center" }}>
              <span style={{ ...ROTULO, color: T.inkMeio, marginRight: 4 }}>O caminho</span>
              {cObj.subclasses.map((s) => (
                <button key={s.nome} type="button" role="radio" aria-checked={h.subclasse === s.nome} onClick={() => mudar("subclasse", s.nome)} className="tv-mesa-foco"
                  style={{ height: 44, padding: "0 14px", borderRadius: 4, cursor: "pointer", background: h.subclasse === s.nome ? T.osso : "transparent", color: h.subclasse === s.nome ? T.tintaDoPergaminho : T.ink, border: h.subclasse === s.nome ? 0 : `1.5px solid ${T.latao}`, fontFamily: "'Spectral', Georgia, serif", fontWeight: h.subclasse === s.nome ? 700 : 500, fontSize: 15 }}>{s.nome}</button>
              ))}
            </div>
          ) : null}
        </div>
        <PeDaEscolha telefone={telefone} secundario="Do que é feita" aoSecundario={() => ir("atributos")} aoPronto={() => ir("sorteio")} />
      </div>
    </div>
  );
}

/* A PEÇA DE ATRIBUTO (F3 §3): − · disco de osso · +, o que o ponto muda em palavras */
function PecaDeAtributo({ atributo, valor, pontos, aoMudar, deitada }) {
  const P = PECA_DE_ATRIBUTO;
  const rMenos = razaoDoPonto(pontos, atributo.id, -1);
  const rMais = razaoDoPonto(pontos, atributo.id, 1);
  const botao = (d, razao, simbolo) => (
    <button type="button" onClick={() => aoMudar(atributo.id, d)} aria-disabled={razao ? true : undefined} className="tv-mesa-foco tv-mesa-aperta"
      aria-label={`${d > 0 ? "mais" : "menos"} ${atributo.nome}, fica ${valor + (razao ? 0 : d) >= 0 ? "+" : ""}${valor + (razao ? 0 : d)}`}
      style={{ width: P.botao, height: P.botao, borderRadius: "50%", cursor: razao ? "not-allowed" : "pointer", background: "transparent", color: razao ? T.inkMeio : T.ink, border: razao ? `1.5px dashed ${T.inkMeio}` : `1.5px solid ${T.latao}`, fontSize: 22, lineHeight: 1, fontFamily: "Georgia, serif" }}>{simbolo}</button>
  );
  const dica = rMais && rMenos ? rMais : rMais && (pontos[atributo.id] || 0) >= ATRIBUTO_MAX_CRIACAO ? rMais : null;
  return (
    <div style={{ width: deitada ? "100%" : P.largura, minHeight: deitada ? P.deitada.altura : P.altura, borderRadius: 10, background: T.couro, border: `1px solid ${alfa(T.latao, 0.6)}`, padding: deitada ? "10px 12px" : "14px 16px", boxSizing: "border-box", display: "flex", flexDirection: deitada ? "row" : "column", alignItems: "center", gap: deitada ? 12 : 8 }}>
      {deitada ? <DiscoDeAtributo valor={valor} lado={P.deitada.disco} /> : <span style={{ ...letraDaMesa("lugar"), color: T.ink }}>{atributo.nome}</span>}
      {deitada ? (
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ ...letraDaMesa("nome"), color: T.ink, display: "block" }}>{atributo.nome}</span>
          <span style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio }}>{dica || POR_PONTO[atributo.id]}</span>
        </span>
      ) : (
        <span style={{ display: "flex", alignItems: "center", gap: P.entre }}>{botao(-1, rMenos, "−")}<DiscoDeAtributo valor={valor} lado={P.disco} />{botao(1, rMais, "+")}</span>
      )}
      {deitada ? <span style={{ display: "flex", gap: P.deitada.entre }}>{botao(-1, rMenos, "−")}{botao(1, rMais, "+")}</span> : (
        <span style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio, textAlign: "center" }}>{dica ? dica : `O próximo ponto: ${POR_PONTO[atributo.id]}`}</span>
      )}
    </div>
  );
}

/* 5b · DO QUE É FEITA: os atributos, o antecedente, o conceito */
function Atributos({ mesa, telefone, mudar, mudarPontos, ir, aoConceitoDoMestre }) {
  const h = mesa.heroi;
  const finais = atributosComRaca(h.pontos, h.raca);
  const naMao = pontosRestantes(h.pontos);
  const ant = antecedenteDaMesa(h.antecedenteId);
  const ia = ANTECEDENTES.findIndex((a) => a.id === ant.id);
  const razao = razaoDeNaoComecar(mesa);
  const seta = (d, rot) => (
    <button type="button" aria-label={rot} onClick={() => mudar("antecedenteId", vizinho(ANTECEDENTES.map((a) => a.id), ant.id, d))} className="tv-mesa-foco"
      style={{ width: 44, height: 44, borderRadius: "50%", border: `1.5px solid ${T.tintaDoPergaminhoDim}`, background: "transparent", color: T.tintaDoPergaminho, cursor: "pointer", fontSize: 18 }}>{d < 0 ? "‹" : "›"}</button>
  );
  return (
    <div style={{ padding: telefone ? "16px 8px 0" : "28px 56px", display: "flex", flexDirection: telefone ? "column" : "row", gap: telefone ? 18 : 56 }}>
      <div style={{ width: telefone ? "100%" : 320, display: "flex", flexDirection: "column", gap: 18, flexShrink: 0 }}>
        <div><Vinculo seta onClick={() => ir("sorteio")}>Voltar à ficha</Vinculo></div>
        {!telefone ? <div style={{ alignSelf: "center" }}><CartaDoHeroi heroi={{ ...h, semente: mesa.semente }} escala={0.72} /></div> : null}
        <div style={{ ...PAPEL, padding: "18px 20px" }}>
          <div style={{ ...ROTULO, color: T.tintaDoPergaminhoDim }}>{`De onde vem · ${ia + 1} de ${ANTECEDENTES.length}`}</div>
          <div style={{ ...letraDaMesa("proposta"), fontSize: 18, marginTop: 6 }}>{noSexo(ant.nome, h.sexo)}</div>
          <p style={{ ...letraDaMesa("notaDoMestre"), margin: "6px 0" }}>{textoNoSexo(ant.gancho, h.sexo)}</p>
          {ant.item ? <p style={{ ...letraDaMesa("notaDoMestre"), color: T.tintaDoPergaminhoDim, margin: 0 }}>{`Leva: ${String(ant.item).replace(/\s*\(.*\)$/, "").toLowerCase()}.`}</p> : null}
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>{seta(-1, "Antecedente anterior")}{seta(1, "Próximo antecedente")}</div>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
          <div>
            <h2 style={{ ...letraDaMesa("tituloObjeto"), color: T.ink, margin: 0, textTransform: "uppercase" }}>Do que é feita</h2>
            <p style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio, margin: "4px 0 0" }}>Seis pontos para pôr; nenhum atributo passa de +3 na criação. O bônus da raça já está somado.</p>
          </div>
          <div aria-live="polite" style={{ display: "flex", alignItems: "center", gap: 10, minWidth: telefone ? "100%" : PECA_DE_ATRIBUTO.bandeja.largura, height: PECA_DE_ATRIBUTO.bandeja.altura, padding: "0 14px", boxSizing: "border-box", borderRadius: PECA_DE_ATRIBUTO.bandeja.raio, background: T.couro, border: `1px solid ${T.latao}` }}>
            <span style={{ ...ROTULO, color: T.inkMeio }}>Na mão</span>
            {Array.from({ length: Math.max(0, naMao) }, (_, i) => <span key={i} aria-hidden="true" style={{ width: PECA_DE_ATRIBUTO.ficha, height: PECA_DE_ATRIBUTO.ficha, borderRadius: "50%", background: T.latao, border: `1.5px solid ${T.lataoLume}`, boxShadow: `0 3px 0 ${T.lataoSombra}` }} />)}
            <span style={{ ...letraDaMesa("contagem"), color: T.ink, marginLeft: "auto" }}>{naMao}</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: telefone ? "1fr" : `repeat(3, ${PECA_DE_ATRIBUTO.largura}px)`, gap: telefone ? 8 : 30 }}>
          {ATRIBUTOS.map((a) => <PecaDeAtributo key={a.id} atributo={a} valor={finais[a.id]} pontos={h.pontos} aoMudar={mudarPontos} deitada={telefone} />)}
        </div>
        <label htmlFor="tv-conceito" style={{ ...ROTULO, color: T.inkMeio, marginTop: 8 }}>O conceito (se quiser)</label>
        <div style={{ ...PAPEL, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center", background: T.ossoLume }}>
          <input id="tv-conceito" value={h.conceito} maxLength={120} onChange={(e) => mudar("conceito", e.target.value)} className="tv-mesa-foco"
            style={{ flex: 1, minWidth: 0, height: 44, border: 0, background: "transparent", color: T.tintaDoPergaminho, fontFamily: "'Spectral', Georgia, serif", fontStyle: "italic", fontSize: 17 }} />
          <Vinculo sobrePapel onClick={aoConceitoDoMestre}>o Mestre escreve outro</Vinculo>
        </div>
        <span style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio }}>Escreva por cima, ou deixe o que o Mestre escreveu.</span>
        {naMao > 0 ? <div><Vinculo onClick={() => mudarPontos(null, 0)}>O Mestre põe os que faltam</Vinculo></div> : null}
        <PeDaEscolha telefone={telefone} secundario="Raça e classe" aoSecundario={() => ir("heroi")} aoPronto={() => ir("sorteio")} razao={razao} />
      </div>
    </div>
  );
}

/* A CARTA DO MUNDO (F3 §3): frente (glifo, nome, dica) ou virada (a frase da voz) */
function CartaDoMundo({ rotulo, glifo, genero = false, nome, dica, conta, virada = false, frase = "", deitada = false, aoAnterior, aoProxima, aoTocar }) {
  const C = CARTA_DO_MUNDO;
  if (deitada) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: C.deitada.altura, boxSizing: "border-box", padding: "10px 12px", borderRadius: C.deitada.raio, background: virada ? T.pergaminho : T.ossoLume, border: `${C.deitada.aro}px solid ${T.latao}`, color: T.tintaDoPergaminho }}>
          <button type="button" onClick={aoTocar || aoProxima} className="tv-mesa-foco" style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, background: "none", border: 0, padding: 0, textAlign: "left", color: "inherit", cursor: "pointer" }}>
            <span aria-hidden="true">{genero ? <GlifoDoGenero nome={glifo} tamanho={C.deitada.glifo} cor={T.tintaDoPergaminho} /> : <GlifoDaMesa nome={glifo} tamanho={C.deitada.glifo} cor={T.tintaDoPergaminho} />}</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ ...ROTULO, color: T.tintaDoPergaminhoDim, display: "block" }}>{`${rotulo} · ${conta}`}</span>
              <span style={{ fontFamily: "'Spectral', Georgia, serif", fontWeight: 500, fontSize: 18, display: "block" }}>{nome}</span>
            </span>
          </button>
          <span style={{ display: "flex", gap: 4 }}>
            <button type="button" aria-label={`${rotulo}: anterior`} onClick={aoAnterior} className="tv-mesa-foco" style={{ width: 44, height: 44, borderRadius: "50%", border: `1.5px solid ${T.latao}`, background: "transparent", color: T.tintaDoPergaminho, cursor: "pointer" }}>‹</button>
            <button type="button" aria-label={`${rotulo}: próxima`} onClick={aoProxima} className="tv-mesa-foco" style={{ width: 44, height: 44, borderRadius: "50%", border: `1.5px solid ${T.latao}`, background: "transparent", color: T.tintaDoPergaminho, cursor: "pointer" }}>›</button>
          </span>
        </div>
        {virada ? <p style={{ ...letraDaMesa("falaDoJogador"), color: T.ink, margin: "0 6px" }}>«{frase}»</p> : null}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <button type="button" onClick={aoTocar || aoProxima} className="tv-mesa-foco" aria-label={`${rotulo}: ${nome}`}
        style={{ width: C.largura, height: C.altura, borderRadius: C.raio, border: `${C.aro}px solid ${T.latao}`, background: virada ? T.pergaminho : T.ossoLume, color: T.tintaDoPergaminho, boxShadow: virada ? SOMBRA_DA_MESA.erguido : SOMBRA_DA_MESA.pousado,
          transform: virada ? `translateY(-10px) rotate(${C.rodadaVirada}deg)` : "none", cursor: "pointer", padding: "30px 26px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
        {virada ? (
          <>
            <span style={{ ...ROTULO, color: T.brasaNoPergaminho }}>Assim fala o Mestre</span>
            <span style={{ fontFamily: "'Spectral', Georgia, serif", fontStyle: "italic", fontSize: 17, lineHeight: "26px", flex: 1, overflow: "hidden" }}>«{frase}»</span>
            <span style={{ ...letraDaMesa("nome"), color: T.tintaDoPergaminho, display: "flex", alignItems: "center", gap: 8 }}><GlifoDaMesa nome="pena" tamanho={18} cor={T.tintaDoPergaminho} />{nome}</span>
          </>
        ) : (
          <>
            <span style={{ ...ROTULO, color: T.tintaDoPergaminhoDim }}>{rotulo}</span>
            <span aria-hidden="true" style={{ marginTop: 8 }}>{genero ? <GlifoDoGenero nome={glifo} tamanho={C.glifo} cor={T.tintaDoPergaminho} /> : <GlifoDaMesa nome={glifo} tamanho={C.glifo} cor={T.tintaDoPergaminho} />}</span>
            <span style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: C.nome, lineHeight: 1.2 }}>{nome}</span>
            <span style={{ width: 56, height: 1, background: T.latao }} />
            <span style={{ fontFamily: "'Spectral', Georgia, serif", fontStyle: "italic", fontSize: C.dica, color: T.tintaDoPergaminhoDim, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{dica}</span>
          </>
        )}
      </button>
      <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button type="button" aria-label={`${rotulo}: anterior`} onClick={aoAnterior} className="tv-mesa-foco" style={{ width: 44, height: 44, borderRadius: "50%", border: `1.5px solid ${T.latao}`, background: "transparent", color: T.ink, cursor: "pointer", fontSize: 18 }}>‹</button>
        <span style={{ ...ROTULO, color: T.inkMeio }}>{conta}</span>
        <button type="button" aria-label={`${rotulo}: próxima`} onClick={aoProxima} className="tv-mesa-foco" style={{ width: 44, height: 44, borderRadius: "50%", border: `1.5px solid ${T.latao}`, background: "transparent", color: T.ink, cursor: "pointer", fontSize: 18 }}>›</button>
      </span>
    </div>
  );
}

/* 6a · O MUNDO EM QUATRO CARTAS (e 6b · as oito vozes) */
function MundoEmCartas({ mesa, telefone, mudarMundo, ir, vozes, setVozes, aoSortearMundo }) {
  const m = mesa.mundo;
  const generos = generosDaCriacao().filter((g) => g.id !== "livre");
  const moldes = moldesDisponiveis();
  const arcos = espinhasDaCriacao();
  const g = generoPorId(m.generoId), mo = moldes.find((x) => x.id === m.molde) || moldes[0], ar = arcos.find((x) => x.id === m.estrutura) || arcos[0], vz = VOZES.find((x) => x.id === m.voz) || VOZES[0];
  const conta = (arr, x) => `${arr.indexOf(x) + 1} de ${arr.length}`;
  const roda = (campo, arr, atual, d) => mudarMundo(campo, vizinho(arr.map((x) => x.id), atual, d));
  if (vozes) {
    return (
      <div style={{ padding: telefone ? "16px 8px 24px" : "28px 64px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div><Vinculo seta onClick={() => setVozes(false)}>Voltar ao mundo</Vinculo></div>
        <h2 style={{ ...letraDaMesa("titulo"), color: T.ink, margin: 0 }}>A voz do Mestre</h2>
        <div role="radiogroup" aria-label="A voz do Mestre" style={{ display: "grid", gridTemplateColumns: telefone ? "1fr" : `repeat(${CARTA_DO_MUNDO.voz.colunas}, 1fr)`, gap: 16 }}>
          {VOZES.map((v) => (
            <button key={v.id} type="button" role="radio" aria-checked={m.voz === v.id} onClick={() => { mudarMundo("voz", v.id); setVozes(false); }} className="tv-mesa-foco"
              style={{ textAlign: "left", minHeight: telefone ? 0 : CARTA_DO_MUNDO.voz.altura, padding: "18px 20px", borderRadius: 10, cursor: "pointer", background: T.pergaminho, color: T.tintaDoPergaminho, border: `${m.voz === v.id ? 4 : 2}px solid ${m.voz === v.id ? T.osso : T.latao}`, transform: m.voz === v.id ? "translateY(-6px)" : "none", boxShadow: SOMBRA_DA_MESA.pousado, display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10, ...letraDaMesa("lugar") }}><GlifoDaMesa nome={GLIFO_DA_VOZ[v.id] || "pena"} tamanho={28} cor={T.tintaDoPergaminho} />{v.nome}</span>
              <span style={{ fontFamily: "'Spectral', Georgia, serif", fontStyle: "italic", fontSize: 17, lineHeight: "26px" }}>«{v.exemplo}»</span>
              <span style={{ height: 1, background: alfa(T.tintaDoPergaminho, 0.25) }} />
              <span style={{ ...letraDaMesa("notaDoMestre"), color: T.tintaDoPergaminhoDim }}>{v.resumo}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: telefone ? "16px 8px 0" : "28px 112px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div><Vinculo seta onClick={() => ir("sorteio")}>Voltar à ficha</Vinculo></div>
      <div>
        <h2 style={{ ...letraDaMesa("titulo"), color: T.ink, margin: 0 }}>O mundo</h2>
        <p style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio, margin: "6px 0 0" }}>Toque numa carta para ver a seguinte; a do Mestre abre as oito vozes.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: telefone ? "1fr" : `repeat(4, ${CARTA_DO_MUNDO.largura}px)`, gap: telefone ? 10 : 32, marginTop: telefone ? 0 : 20 }}>
        <CartaDoMundo deitada={telefone} rotulo="O cenário" glifo={g.glifo} genero nome={g.label} dica={g.dica} conta={conta(generos, g)} aoAnterior={() => roda("generoId", generos, g.id, -1)} aoProxima={() => roda("generoId", generos, g.id, 1)} />
        <CartaDoMundo deitada={telefone} rotulo="A forma" glifo={GLIFO_DO_MOLDE[mo.id] || "mapa"} nome={mo.nome} dica={mo.desc} conta={conta(moldes, mo)} aoAnterior={() => roda("molde", moldes, mo.id, -1)} aoProxima={() => roda("molde", moldes, mo.id, 1)} />
        <CartaDoMundo deitada={telefone} rotulo="O arco" glifo={GLIFO_DO_ARCO[ar.id] || "encruzilhada"} nome={ar.nome} dica={ar.desc} conta={conta(arcos, ar)} aoAnterior={() => roda("estrutura", arcos, ar.id, -1)} aoProxima={() => roda("estrutura", arcos, ar.id, 1)} />
        <CartaDoMundo deitada={telefone} rotulo="A voz do Mestre" virada frase={vz.exemplo} nome={vz.nome} glifo={GLIFO_DA_VOZ[vz.id] || "pena"} conta={conta(VOZES, vz)} aoTocar={() => setVozes(true)} aoAnterior={() => roda("voz", VOZES, vz.id, -1)} aoProxima={() => roda("voz", VOZES, vz.id, 1)} />
      </div>
      <p style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio, margin: "8px 0 0" }}>O Mestre fala assim a campanha inteira; o que acontece na história não muda com a voz.</p>
      <PeDaEscolha telefone={telefone} secundario="Sortear o mundo" aoSecundario={aoSortearMundo} aoPronto={() => ir("sorteio")} />
    </div>
  );
}

/* A CRIAÇÃO: o estado da mesa e a tela da vez. `semente` vem de quem
   chama; «Sortear tudo de novo» pede a seguinte a `aoNovaSemente`. */
export function Criacao({ semente, aoComecar, aoNovaSemente }) {
  const telefone = useTelefone();
  const [mesa, setMesa] = React.useState(() => sortearMesa(semente));
  const [tela, setTela] = React.useState("sorteio");
  const [vozes, setVozes] = React.useState(false);
  React.useEffect(() => { setMesa(sortearMesa(semente)); }, [semente]);
  React.useEffect(() => {
    const esc = (e) => { if (e.key === "Escape" && tela !== "sorteio") { setVozes(false); setTela("sorteio"); } };
    try { window.addEventListener("keydown", esc); } catch { /* sem janela */ }
    return () => { try { window.removeEventListener("keydown", esc); } catch { /* idem */ } };
  }, [tela]);
  React.useEffect(() => { try { window.scrollTo(0, 0); } catch { /* idem */ } }, [tela, vozes]);
  const ir = (t) => { setVozes(false); setTela(t); };
  const mudar = (campo, valor) => setMesa((m) => trocarNoHeroi(m, campo, valor));
  const mudarMundo = (campo, valor) => setMesa((m) => trocarNoMundo(m, campo, valor));
  const mudarPontos = (id, d) => setMesa((m) => ({ ...m, heroi: { ...m.heroi, pontos: id == null ? porOsQueFaltam(m.heroi.pontos, m.heroi.classe) : ajustarPonto(m.heroi.pontos, id, d) } }));
  const aoOutroNome = () => setMesa((m) => outroNome(m));
  const aoSortearMundo = () => setMesa((m) => {
    const outra = sortearMesa(`${m.semente}|mundo|${m.mundo.molde}|${m.mundo.voz}`);
    return trocarNoMundo(trocarNoMundo(trocarNoMundo({ ...m, mundo: { ...m.mundo, molde: outra.mundo.molde, estrutura: outra.mundo.estrutura, voz: outra.mundo.voz } }, "generoId", m.mundo.generoId), "molde", outra.mundo.molde), "voz", outra.mundo.voz);
  });
  const comecar = () => { if (!razaoDeNaoComecar(mesa)) aoComecar(mesa); };
  return (
    <MesaDaNoite telefone={telefone} halo={tela === "heroi" || tela === "atributos" ? { x: "200px", y: "320px" } : null}>
      {tela === "sorteio" ? <Sorteio mesa={mesa} telefone={telefone} ir={ir} aoComecar={comecar} aoSortearDeNovo={aoNovaSemente} aoOutroNome={aoOutroNome} /> : null}
      {tela === "heroi" ? <HeroiEmCartas mesa={mesa} telefone={telefone} mudar={mudar} aoOutroNome={aoOutroNome} ir={ir} /> : null}
      {tela === "atributos" ? <Atributos mesa={mesa} telefone={telefone} mudar={mudar} mudarPontos={mudarPontos} ir={ir} aoConceitoDoMestre={() => setMesa((m) => ({ ...m, heroi: { ...m.heroi, conceito: conceitoDoSistema(m.heroi), conceitoEscrito: false } }))} /> : null}
      {tela === "mundo" ? <MundoEmCartas mesa={mesa} telefone={telefone} mudarMundo={mudarMundo} ir={ir} vozes={vozes} setVozes={setVozes} aoSortearMundo={aoSortearMundo} /> : null}
    </MesaDaNoite>
  );
}

/* 7 · A PASSAGEM — a mesa sendo posta (POR_A_MESA), nunca uma barra; e
   8a · o erro de rede, na mesma página. `nota`: a linha verdadeira (lugar,
   hora e o que se carrega, lida do estado). Tocar não muda nada: é teatro
   sobre um estado já decidido. */
export function MesaSendoPosta({ heroi, nota = "", erro = false, aoTentar, aoVoltar }) {
  const telefone = useTelefone();
  const P = POR_A_MESA;
  const atraso = (ms) => ({ animationDelay: `${ms}ms` });
  const nomeCurto = String((heroi && heroi.nome) || "").split(" ")[0];
  return (
    <MesaDaNoite telefone={telefone} halo={{ x: "50%", y: "30%" }}>
      <div role="status" aria-live="polite" data-passagem={erro ? "erro" : "posta"} style={{ display: "flex", flexDirection: telefone ? "column" : "row", gap: telefone ? 16 : 48, padding: telefone ? "20px 8px" : "40px 48px", alignItems: telefone ? "center" : "flex-start", justifyContent: "center" }}>
        {heroi ? <div className="tv-pousa" style={atraso(P.carta.em)}><CartaDoHeroi heroi={heroi} escala={telefone ? 0.4 : 0.42} rodada={false} /></div> : null}
        <div className="tv-desce" style={{ ...PAPEL, ...atraso(P.pagina.em), width: telefone ? "100%" : 680, maxWidth: "100%", minHeight: telefone ? 360 : 560, boxSizing: "border-box", padding: telefone ? "28px 22px" : "48px" }}>
          {erro ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, ...letraDaMesa("lugar"), color: T.perigoNoPergaminho, textTransform: "uppercase" }}><GlifoDaMesa nome="aviso" tamanho={22} cor={T.perigoNoPergaminho} />O Mestre não respondeu</div>
              <p style={{ ...letraDaMesa("prosa"), margin: "18px 0 24px" }}>{`A ligação caiu antes de a primeira cena chegar. A mesa está posta e ${nomeCurto || "o herói"} está guardad${heroi && heroi.genero === "mulher" ? "a" : "o"}: nada se perdeu.`}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
                <BotaoDaMesa principal largura={telefone ? "100%" : 260} onClick={aoTentar}>Tentar de novo</BotaoDaMesa>
                {aoVoltar ? <Vinculo sobrePapel onClick={aoVoltar}>Voltar à ficha</Vinculo> : null}
              </div>
              <p style={{ ...letraDaMesa("notaDoMestre"), color: T.tintaDoPergaminhoDim, marginTop: 20 }}>Se voltar a falhar, veja a sua internet. Esta mesa fica guardada neste navegador.</p>
            </>
          ) : (
            <>
              {nota ? <p className="tv-pousa" style={{ ...letraDaMesa("notaDoMestre"), ...atraso(P.nota.em), color: T.tintaDoPergaminhoDim, margin: 0 }}>{nota}</p> : null}
              <div className="tv-pousa" style={{ ...atraso(P.nota.em), marginTop: 20 }}>
                <span className="tv-pena" style={{ display: "inline-block" }}><GlifoDaMesa nome="pena" tamanho={28} cor={T.tintaDoPergaminho} /></span>
                <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>O Mestre escreve a primeira cena.</span>
              </div>
            </>
          )}
        </div>
        {!telefone ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
            <div className="tv-pousa" style={{ ...atraso(P.vela.em), width: 123 }} aria-hidden="true"><VelaDaChegada /></div>
            {["racoes", "agua", "tochas", "moedas"].map((tipo, i) => (
              <div key={tipo} className="tv-pousa" style={atraso(P.pilhas[i])}><PecaDeRecurso tipo={tipo} quantidade={(heroi && heroi.carga && heroi.carga[tipo]) || 0} /></div>
            ))}
          </div>
        ) : null}
      </div>
    </MesaDaNoite>
  );
}
