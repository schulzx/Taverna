import React, { useState, useRef, useEffect, useCallback } from "react";
import { nomeCidade, nomePessoa, nomeTaverna, sortear, elencoDiverso } from "./nomes.js";
import { CLASSES, PROFISSOES, racasDoGenero, classePorNome, racaPorNome, habilidadesDisponiveis, habilidadesIniciais, podePegarHabilidade, ranksDoPersonagem, pontosDisponiveis, custoRespec, classeDaHabilidade, custoJaGasto, custoEmPontos, pontosNoNivel, pontosTotais, podeEscolherSubclasse, subclasseEscolhida, habilidadesDaSubclasse, fichaDaHabilidade } from "./classes.js";
import { criarCidade, criarFaccao, cidadesDominadas, localDeDescanso, resumoMapaParaPrompt, resumoDiplomacia, TRATADOS, RELACOES, gerarEstradas, centrosDeRegiao, blobPath } from "./mapa.js";
import { gerarGeografia, garantirGeografia } from "./geografia.js";
import { resolverAtaque, danoDe, defesaDe, bonusDeAmeaca, resumoDoAtaque, turnoDosInimigos, testeDeMorte, aplicarTesteMorte, turnoDosCompanheiros, pvEsperadoJogador, pvEsperadoInimigo, gerarEspolios, patamarDe, resumoPatamar, d, severidadeDano, linhaParaMestre, perfilCombate, ataquesPorTurno, dadosDeDano, resumoAcaoDeTurno, danoDaClasse, ataquesDoInimigo, rolarIniciativa, resumoIniciativa, novosRecursos, gastarRecurso, acoesBonusDe, testeConcentracao, ECONOMIA_ACAO_PROMPT } from "./combate.js";
import { gerarHabilidadeUnica, chanceUnica } from "./unicas.js";
import { ESTRUTURAS, estruturaPorId, resumoHistoria, resumoQuests } from "./historia.js";
import { criaturasDoGenero, completarInimigo, TABELA_TESTES, avaliarTeste, dificuldadePorPerfil } from "./bestiario.js";
import { criarNPC, mesclarNPC, relacaoNPC, resumoNPCsParaPrompt } from "./npcs.js";
import { dominiosDe, rendaDominios, rendaDiariaTotal, custoUpgradeGuilda, multGuilda, efeitoTratados, NIVEL_GUILD_MAX } from "./gestao.js";
import { rolarClima, rolarEncontro, CLIMAS } from "./encontros.js";
import { CONQUISTAS, CONTADORES_INICIAIS, avaliarConquistas, conquistaPorId } from "./conquistas.js";
import { ANTECEDENTES, antecedentePorId } from "./antecedentes.js";
import { VINCULO_INICIAL, VINCULO_MAX, MARCOS_VINCULO, marcoDe, proximoMarco, ganharVinculo } from "./vinculos.js";
import { RARIDADES, RARIDADE_ROTULO, CUSTO_FORJA, gerarEspolioItem, gerarLoot, essenciaDe, valorDe } from "./loot.js";
import { gerarMasmorra, recompensaChefe, ROTULO_SALA, ICONE_SALA, saidasDe, saidasDeRecuo, entrarNaSala, marcarResolvida, progressoMasmorra, noEscuro, RITMOS, ritmoPorId, percepcaoPassiva, checarPassiva, resultadoBusca, armadilhaDispara, custoBusca } from "./masmorras.js";
import { gerarMural, gerarContrato, ICONE_CONTRATO } from "./contratos.js";
import { TIPOS_DECRETO, tipoDecreto, recompensaJusta, criarDecreto, tentarAceite, resolverDecreto, ROTULO_DESFECHO } from "./decretos.js";
import { garantirReino, fatorMedioReino, fatorFelicidade, processarDiaReino } from "./reino.js";
import { perfilDeCriatura, elementoDaArma, sortearCicatriz, CICATRIZ_MAX, iconeDano } from "./danos.js";
import { MESES, dataTxt, horaTxt, ehNoite, estacaoDe, BIAS_CLIMA, festivalDe, rolarSonho, HORAS_AVISO_SONO, HORAS_EXAUSTO, MINUTOS_POR_TURNO, MINUTOS_VIAGEM, MINUTOS_SALA_MASMORRA, MINUTOS_POS_COMBATE, MINUTOS_RODADA_COMBATE, AMANHECER } from "./calendario.js";
import { calcularFama, patamarFama, gerarNemesis, LIMIARES_NEMESIS, ACOES_NEMESIS, rumorDoDia } from "./fama.js";
import { gerarCronica } from "./cronica.js";
import { ECONOMIA_PROMPT, valorDeItem, PRECO_VENDA, FAIXA_COMPRA } from "./economia.js";
import { rolarAflicao, aflicaoDe } from "./aflicoes.js";
import { comoConsumivel, usarConsumivel, descricaoCurta, itemConsumivel, sortearConsumivel, melhorCuraPara } from "./pocoes.js";
import { mercadoresDaCidade, talvezAmbulante, precoDeCompra, resumoMercadoPrompt } from "./mercado.js";
import { garantirFichaCompanheiro, resumoGrupoPrompt } from "./companheiros.js";
import { PainelTalentos } from "./painel-talentos.jsx";
import { criarCondicao, tickCondicoes, detectarCondicoesNarradas, detectarAliviosNarrados, limparPorDescanso, resumoCondicoesPrompt, estadoDeRolagem, mecanicaDe } from "./condicoes.js";
import { garantirDevocao, processarDiaFe, resumoFePrompt, DEVOCAO_PROMPT, fieisTotais, depositarFieis, perderFieis, espalharFieis, erguerTemplo, podeErguerTemplo, temploDaCidade, temploDe, feDaCidade, estadoFe, alvosFelicidade } from "./devocao.js";
import { NIVEL_DESPERTAR, GRAUS, grauDe, tituloDe, proximoPatamar, bonusDivino, imunePorEscopo, garantirDivindade, gerarDivindade, gerarPanteaoInicial, gerarEventoDivino, resumoAscensao, DIVINDADE_PROMPT, tituloDoHeroi, gdMaximoPorNivel, MAGNITUDE_FE, fieisPorFeito, pfPorDia, pfMaximo, MILAGRES, milagresDisponiveis, milagrePorId, CAMINHOS_ASCENSAO, caminhoPorId, CAMINHOS_PROMPT } from "./divindades.js";
import { ctxMundo, faseDoArco, garantirEventos, processarDescansoLongoEventos } from "./geradores.js";
import { BRAND, SLOGAN, XP_POR_NIVEL, MOEDAS_INICIAIS, PONTOS_TOTAIS, ATRIBUTO_MAX_CRIACAO, ATRIBUTO_MAX, MAX_COMPANHEIROS, T, FONT_CSS, GENEROS, ATRIBUTOS } from "./constantes.js";
import { extrairJSON, parseObjetoTolerante } from "./json.js";
import { fichaTexto, formatarCanone, montarSystemPrompt } from "./prompt.js";
import { Botao, IconeD20, IconeCaneca, BarraMini, Retrato, sementeDe, estadoDe, hashSemente, rng, escolher, tracos } from "./ui.jsx";
import { PainelAscensao } from "./painel-ascensao.jsx";
import { PainelCodex } from "./painel-codex.jsx";
import { PainelDiario } from "./painel-diario.jsx";
import { PainelDiplomacia } from "./painel-diplomacia.jsx";
import { PainelMapa } from "./painel-mapa.jsx";
import { aplicarNivel, evoluirCompanheiro, aplicarDescanso, recargaPadrao, aplicarMudancas, bonusEquip, bonusEfeito, atributoEfetivo, tickEfeitos, processarCombate, migrarPersonagem } from "./regras-jogo.js";
import { SUPRIMENTOS, garantirSuprimentos, consumoDiario, consumirDia, RITMOS_VIAGEM, ritmoViagem, testarNavegacao, forragear, efeitoExaustao, recuperarExaustao, resumoErmos } from "./ermos.js";
import { bonusProficiencia, ehProficiente, MOD_MAX_5E, xpDoProximoNivel, XP_POR_DADIVA, TEMPO, minutosDoContexto, DADIVAS_EPICAS, sortearDadiva, resumoEpico } from "./regras.js";
import { TIPOS_CARTA, CUSTO_CARTA, garantirCorreio, chanceResposta, criarCarta, resolverPeticao, processarDiaCorreio } from "./correio.js";

/* ============================================================
   TAVERNA — versão jogável (Artifact) · Mestre por IA
   Solo · criação de mundo/personagem · d20 manual · habilidades
   níveis/XP · moedas · companheiros vivos · memória · salvamento
   Versão de produção: IA via /api/mestre (chave protegida no servidor).
   ============================================================ */

/* constantes e tema extraídos para ./constantes.js (v8.6) */

/* prompt do Mestre extraído para ./prompt.js (v8.6) */

async function chamarModelo(system, messages, maxTokens = 1000, formato = "texto", tarefa = "mestre") {
  const response = await fetch("/api/mestre", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages, maxTokens, formato, tarefa }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.erro || `HTTP ${response.status}`);
  return data.texto || "";
}

/* decodifica escapes (\n, \", \t...) de um pedaço de string JSON */
/* parsing de resposta extraído para ./json.js (v8.6) */

async function chamarMestre(system, historico) {
  /* histórico já está no formato Messages API: [{role, content}, ...] */
  /* 18 mensagens bastam: o cânone (fatos imutáveis) e o livro (resumo do arco)
     vão no system prompt — o histórico bruto só precisa do contexto imediato.
     Corta ~metade dos tokens de entrada por turno. */
  /* Teto 3600: a resposta JSON carrega narrativa + mudancas + sugestões, e o
     DeepSeek escreve prosa MAIS longa que o Gemini — com 2600 a resposta
     truncava no meio do JSON e a tela mostrava "…". O teto não custa —
     só se paga pelo que é gerado. */
  let texto = await chamarModelo(system, historico.slice(-18), 3600, "json");
  let resp = extrairJSON(texto);
  /* REDE DE SEGURANÇA (v7.0.2): se veio JSON válido mas SEM narrativa (o "…"
     na tela), tenta UMA segunda vez com um empurrão explícito antes de
     desistir. */
  if (!resp.narrativa || resp.narrativa === "…" || resp.narrativa.startsWith("O Mestre hesita")) {
    const reforco = [...historico.slice(-18), { role: "user", content: "[SISTEMA] Sua resposta anterior chegou sem o campo \"narrativa\". Responda de novo, em JSON, com \"narrativa\" SEMPRE preenchida (é o texto que o jogador lê)." }];
    texto = await chamarModelo(system, reforco, 3600, "json");
    const resp2 = extrairJSON(texto);
    if (resp2.narrativa && resp2.narrativa !== "…" && !resp2.narrativa.startsWith("O Mestre hesita")) {
      /* mantém as mudanças da primeira resposta se a segunda não trouxer */
      if (!resp2.mudancas && resp.mudancas) resp2.mudancas = resp.mudancas;
      resp = resp2;
    }
  }
  return resp;
}

/* primitivas de interface extraídas para ./ui.jsx (v8.8) */


/* ---------------- Overlay do dado ---------------- */

function OverlayDado({ rolagem, modificador, aoConcluir }) {
  if (rolagem.auto) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-6" style={{ background: "rgba(8,6,14,0.85)", backdropFilter: "blur(3px)" }}>
        <div className="tv-fade text-center">
          <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.ok }}>✓ Trivial para seu patamar</div>
          <div className="tv-display text-3xl mb-1" style={{ color: T.ink }}>{rolagem.motivo || "Você simplesmente consegue"}</div>
          <div className="tv-body text-sm mb-5" style={{ color: T.inkDim }}>Sem rolagem necessária — sucesso.</div>
          <button onClick={() => aoConcluir(0)} className="rounded-xl px-6 py-2.5 tv-mono text-sm" style={{ background: T.ok, color: "#0d1a0d", fontWeight: 600 }}>Continuar →</button>
        </div>
      </div>
    );
  }
  const [faseD, setFaseD] = useState("rolando");
  const [valor, setValor] = useState(1);
  const [par, setPar] = useState(null); // [a,b] quando há vantagem/desvantagem
  const finalRef = useRef(null);
  const setFinalRef = (v) => { finalRef.current = v; };
  const vant = !!rolagem.vantagem, desv = !!rolagem.desvantagem;
  const modo = vant && !desv ? "vantagem" : desv && !vant ? "desvantagem" : null;
  const lados = 20;
  useEffect(() => {
    const inicio = Date.now();
    const iv = setInterval(() => {
      setValor(1 + Math.floor(Math.random() * lados));
      if (modo) setPar([1 + Math.floor(Math.random() * lados), 1 + Math.floor(Math.random() * lados)]);
      if (Date.now() - inicio > 1200) {
        clearInterval(iv);
        let final;
        if (modo) {
          const a = 1 + Math.floor(Math.random() * lados), b = 1 + Math.floor(Math.random() * lados);
          setPar([a, b]);
          final = modo === "vantagem" ? Math.max(a, b) : Math.min(a, b);
        } else {
          final = 1 + Math.floor(Math.random() * lados);
        }
        setValor(final);
        setFinalRef(final);
        setFaseD("resultado");
      }
    }, 70);
    return () => clearInterval(iv);
  }, []); // eslint-disable-line
  const total = valor + modificador;
  const dc = rolagem.dificuldade ?? null;
  const critico = faseD === "resultado" && valor === 20;
  const desastre = faseD === "resultado" && valor === 1;
  const passou = dc != null && (critico || (!desastre && total >= dc));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(8,6,14,0.88)", backdropFilter: "blur(4px)" }}>
      <div className="tv-fade flex flex-col items-center text-center max-w-sm w-full">
        <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.violetSoft }}>
          Teste de {rolagem.atributo || "sorte"}{dc != null ? ` · dificuldade ${dc}` : ""}
        </div>
        {modo && (
          <div className="tv-mono text-[11px] uppercase tracking-widest mb-1 px-2 py-0.5 rounded-full" style={{ color: modo === "vantagem" ? T.ok : T.danger, border: `1px solid ${modo === "vantagem" ? T.ok : T.danger}` }}>
            {modo === "vantagem" ? "✦ vantagem — pega o maior" : "✧ desvantagem — pega o menor"}
          </div>
        )}
        <div className="tv-display text-2xl mb-8" style={{ color: T.ink }}>{rolagem.motivo}</div>
        {modo ? (
          /* VANTAGEM/DESVANTAGEM: dois dados; o escolhido brilha, o outro esmaece */
          <div className="flex items-center gap-4">
            {[0, 1].map((idx) => {
              const v = par ? par[idx] : valor;
              const escolhido = faseD === "resultado" && par && ((modo === "vantagem" && v === Math.max(par[0], par[1])) || (modo === "desvantagem" && v === Math.min(par[0], par[1])));
              const outroDescartado = faseD === "resultado" && !escolhido;
              return (
                <div key={idx} className={`relative flex items-center justify-center ${faseD === "rolando" ? "tv-dice" : ""}`}
                  style={{
                    width: 104, height: 104,
                    clipPath: "polygon(50% 0%, 100% 27%, 100% 73%, 50% 100%, 0% 73%, 0% 27%)",
                    background: escolhido ? (modo === "vantagem" ? T.ok : T.danger) : T.panelSoft,
                    border: `2px solid ${escolhido ? (modo === "vantagem" ? T.ok : T.danger) : T.line}`,
                    opacity: outroDescartado ? 0.35 : 1, transition: "all .4s",
                  }}>
                  <span className="tv-mono font-semibold" style={{ fontSize: 38, color: escolhido ? T.onAccent : T.ink }}>{v}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`relative flex items-center justify-center ${faseD === "rolando" ? "tv-dice" : ""}`}
            style={{
              width: 148, height: 148,
              clipPath: "polygon(50% 0%, 100% 27%, 100% 73%, 50% 100%, 0% 73%, 0% 27%)",
              background: faseD === "resultado" ? (desastre ? T.danger : critico ? T.amberSoft : passou || dc == null ? T.amber : T.panelSoft) : T.panelSoft,
              border: `2px solid ${T.amber}`, transition: "background .4s",
            }}>
            <span className="tv-mono font-semibold" style={{ fontSize: 52, color: faseD === "resultado" && (passou || critico || dc == null) && !desastre ? T.onAccent : T.ink }}>{valor}</span>
          </div>
        )}
        {faseD === "resultado" && (
          <div className="mt-6 tv-fade">
            <div className="tv-mono text-sm" style={{ color: T.inkDim }}>
              {valor} {modificador !== 0 ? `${modificador > 0 ? "+" : "−"} ${Math.abs(modificador)} = ` : ""}
              <span style={{ color: T.ink, fontWeight: 600 }}>{total}</span>
            </div>
            <div className="tv-display text-3xl mt-1" style={{ color: desastre ? T.danger : critico ? T.amberSoft : passou || dc == null ? T.ok : T.danger }}>
              {critico ? "Crítico!" : desastre ? "Desastre!" : dc == null ? "Rolado" : passou ? "Sucesso" : "Falha"}
            </div>
            <button onClick={() => aoConcluir(finalRef.current)} className="mt-5 rounded-xl px-6 py-2.5 tv-mono text-sm" style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>
              Continuar →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Modal de nível ---------------- */

function ModalCena({ personagem, combate, mundo, nomeCampanha, fechar }) {
  const aliados = [personagem, ...(personagem.grupo || [])];
  const inimigos = (combate?.inimigos || []).filter((e) => !e.derrotado);
  const climaFundo = {
    "Fantasia medieval": "linear-gradient(160deg,#2A2036,#1a1420)",
    "Ficção científica": "linear-gradient(160deg,#16232e,#0e1620)",
    "Cyberpunk": "linear-gradient(160deg,#2a1030,#10121e)",
    "Horror cósmico": "linear-gradient(160deg,#1a1420,#0a0a10)",
    "Pós-apocalíptico": "linear-gradient(160deg,#2b2418,#161208)",
    "Steampunk": "linear-gradient(160deg,#2a2018,#15100a)",
  }[(mundo || {}).genero] || "linear-gradient(160deg,#241C33,#12101a)";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(8,6,14,0.92)", backdropFilter: "blur(4px)" }} onClick={fechar}>
      <div className="tv-fade w-full max-w-lg rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.amber}` }} onClick={(e) => e.stopPropagation()}>
        <div className="p-5" style={{ background: climaFundo }}>
          <div className="tv-mono text-[10px] uppercase tracking-[0.3em] mb-4 text-center" style={{ color: T.amberSoft }}>{nomeCampanha} · cena</div>
          <div className="flex flex-wrap items-end justify-center gap-3 mb-2">
            {aliados.map((a, i) => (
              <div key={i} className="flex flex-col items-center gap-1" style={{ width: 74 }}>
                <Retrato semente={sementeDe(a)} tamanho={i === 0 ? 60 : 50} anel={i === 0 ? T.amber : T.violet} estado={estadoDe(a.vida, a.vidaMax)} />
                <span className="tv-body text-xs text-center leading-tight truncate w-full" style={{ color: T.ink }}>{a.nome}</span>
                {i === 0 && <span className="tv-mono text-[8px] uppercase" style={{ color: T.amberSoft }}>você</span>}
              </div>
            ))}
          </div>
          {inimigos.length > 0 && (
            <>
              <div className="flex items-center gap-2 my-3">
                <div className="h-px flex-1" style={{ background: T.danger, opacity: 0.5 }} />
                <span className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.danger }}>⚔ contra</span>
                <div className="h-px flex-1" style={{ background: T.danger, opacity: 0.5 }} />
              </div>
              <div className="flex flex-wrap items-end justify-center gap-3">
                {inimigos.map((e, i) => (
                  <div key={i} className="flex flex-col items-center gap-1" style={{ width: 74 }}>
                    <Retrato semente={sementeDe(e)} tamanho={54} anel={T.danger} estado={estadoDe(e.vida, e.vidaMax, true)} />
                    <span className="tv-body text-xs text-center leading-tight truncate w-full" style={{ color: T.ink }}>{e.nome}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="p-4 flex items-center justify-between" style={{ background: T.panel, borderTop: `1px solid ${T.line}` }}>
          <span className="tv-body text-xs italic" style={{ color: T.inkDim }}>{(mundo || {}).genero}</span>
          <Botao primario pequeno onClick={fechar}>Fechar</Botao>
        </div>
      </div>
    </div>
  );
}

function ModalNivel({ nivel, personagem, escolher }) {
  const [etapa, setEtapa] = React.useState("atributo");
  const [attrEscolhido, setAttrEscolhido] = React.useState(null);
  const disponiveis = habilidadesDisponiveis(personagem.classe, nivel, personagem.habilidades || []);

  /* passo 2: escolher uma habilidade da árvore da classe */
  if (etapa === "habilidade") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(8,6,14,0.9)", backdropFilter: "blur(4px)" }}>
        <div className="tv-fade w-full max-w-md rounded-2xl p-6 tv-scroll overflow-y-auto" style={{ background: T.panel, border: `1px solid ${T.violet}`, maxHeight: "90vh" }}>
          <div className="text-center mb-4">
            <div className="tv-mono text-xs uppercase tracking-widest mb-1" style={{ color: T.violetSoft }}>✦ Nova habilidade ✦</div>
            <div className="tv-display text-3xl" style={{ color: T.ink }}>{personagem.classe}{personagem.subclasse ? ` · ${personagem.subclasse}` : ""}</div>
            <div className="tv-body text-sm mt-2" style={{ color: T.inkDim }}>Escolha uma habilidade do seu caminho:</div>
          </div>
          {disponiveis.length === 0 ? (
            <div className="text-center">
              <div className="tv-body text-sm mb-4" style={{ color: T.inkDim }}>Você já domina tudo que este nível oferece. Novas habilidades virão em níveis maiores.</div>
              <Botao primario onClick={() => escolher(attrEscolhido, null)}>Continuar →</Botao>
            </div>
          ) : (
            <div className="space-y-2">
              {disponiveis.map((h) => (
                <button key={h.nome} onClick={() => escolher(attrEscolhido, h)} className="w-full rounded-xl p-3 text-left transition-all"
                  style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="tv-display text-lg" style={{ color: T.ink }}>{h.nome}</span>
                    <span className="tv-mono text-[10px] shrink-0" style={{ color: T.violetSoft }}>{h.custo} PM · nv {h.nivel}</span>
                  </div>
                  <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{h.descricao}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(8,6,14,0.9)", backdropFilter: "blur(4px)" }}>
      <div className="tv-fade w-full max-w-md rounded-2xl p-6 tv-scroll overflow-y-auto" style={{ background: T.panel, border: `1px solid ${T.amber}`, maxHeight: "90vh" }}>
        <div className="text-center mb-5">
          <div className="tv-mono text-xs uppercase tracking-widest mb-1" style={{ color: T.amberSoft }}>✦ Nível alcançado ✦</div>
          <div className="tv-display text-5xl" style={{ color: T.ink }}>Nível {nivel}</div>
          <div className="tv-body text-sm mt-2" style={{ color: T.inkDim }}>+3 PV máx · +2 PM máx · vida e mana restauradas · <b style={{ color: T.violetSoft }}>+1 ponto de habilidade</b> (gaste em Gestão › Talentos).<br />Escolha um atributo para fortalecer:</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ATRIBUTOS.map((a) => {
            const atual = personagem.atributos[a.id];
            const noMax = atual >= ATRIBUTO_MAX;
            return (
              <button key={a.id} onClick={() => { if (noMax) return; escolher(a.id, null); }} disabled={noMax}
                className="rounded-xl p-3 text-left transition-all"
                style={{ background: T.panelSoft, border: `1px solid ${noMax ? T.line : T.amber}`, opacity: noMax ? 0.4 : 1, cursor: noMax ? "not-allowed" : "pointer" }}>
                <div className="flex items-baseline justify-between">
                  <span className="tv-display text-lg" style={{ color: T.ink }}>{a.nome}</span>
                  <span className="tv-mono text-xs" style={{ color: T.amber }}>+{atual} → +{Math.min(ATRIBUTO_MAX, atual + 1)}</span>
                </div>
                <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{a.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Painel lateral (Ficha/Grupo/Bolsa) ---------------- */

/* Instrução central do "turno do mundo": CURTO NO TEMPO (o presente, sem pular
   horas), mas PLENO DE VIDA — pessoas agem e conversam, coisas acontecem agora. */
/* MODOS DE CENA — o APP escolhe (rotação), não o Mestre. Isso quebra o vício
   de sempre cair em "alguém irrompe com urgência": a variedade vira mecânica,
   não pedido. Só 1 em 7 modos permite tensão/interrupção. */
/* AÇÕES PRONTAS (estilo BG3): um toque preenche a ação no campo — o jogador
   completa o alvo/detalhe e envia. Zero tokens para "inventar" a ação. */
const ACOES_PRONTAS = [
  { icone: "⚔", rotulo: "Atacar", texto: "Ataco " },
  { icone: "🛡", rotulo: "Esquivar", texto: "Fico em postura defensiva, esquivando e me protegendo neste turno" },
  { icone: "✋", rotulo: "Empurrar", texto: "Empurro com força " },
  { icone: "🦵", rotulo: "Derrubar", texto: "Tento derrubar no chão " },
  { icone: "🏃", rotulo: "Correr", texto: "Corro em disparada para " },
  { icone: "🤸", rotulo: "Saltar", texto: "Salto sobre " },
  { icone: "🫥", rotulo: "Esconder", texto: "Me escondo nas sombras, buscando cobertura" },
  { icone: "🔍", rotulo: "Procurar", texto: "Examino o lugar com atenção, procurando " },
  { icone: "🤝", rotulo: "Ajudar", texto: "Ajudo " },
  { icone: "😤", rotulo: "Intimidar", texto: "Intimido com olhar e presença " },
  { icone: "🗣", rotulo: "Persuadir", texto: "Tento persuadir " },
  { icone: "🎭", rotulo: "Enganar", texto: "Tento enganar " },
];

const MODOS_MUNDO = [
  { id: "vinculo", texto: "VÍNCULO E CONVERSA — alguém próximo puxa papo pessoal: um companheiro revela algo de si, uma lembrança, um medo, uma piada interna, um afeto. Íntimo e humano. SEM ameaça, SEM notícia grave." },
  { id: "entre_npcs", texto: "NPCs ENTRE SI — dois ou mais personagens interagem ENTRE ELES na sua frente, sem depender de você: discutem, fofocam, flertam, negociam, brincam. Você é testemunha, não alvo. SEM crise." },
  { id: "governo", texto: "GOVERNO E ADMINISTRAÇÃO — assunto de gestão chega com calma e rotina: um relatório de colheita, uma disputa entre vassalos, um pedido de obra, um imposto, uma nomeação. Burocracia viva, SEM emergência." },
  { id: "cotidiano", texto: "COTIDIANO E POVO — a vida comum aparece: mercado, oficinas, crianças, festa, música, um artesão orgulhoso do trabalho, o cheiro da cidade. Textura do mundo, SEM conflito." },
  { id: "mundo", texto: "MUNDO E DESCOBERTA — algo do lugar se revela: um costume local, uma construção antiga, o clima mudando a rotina, uma história que contam por ali. Curiosidade, SEM perigo." },
  { id: "consequencia", texto: "CONSEQUÊNCIA LENTA — um efeito DISCRETO de algo que o jogador fez cenas atrás se manifesta sem drama: alguém agradece, um preço mudou, uma reputação circula, um rosto conhecido reaparece em paz." },
  { id: "tensao", texto: "TENSÃO (raro — este é o único modo em que algo pode apertar) — uma complicação surge, mas de forma ORGÂNICA e preparada: uma notícia que confirma algo já semeado, uma desconfiança, uma cobrança. Mesmo aqui: NADA de porta arrombada, mensageiro ofegante ou figura arrastada ao salão." },
];

function instrucaoMundo(modo, banirUrgencia) {
  return `Agora o mundo VIVE este mesmo instante — não avance o tempo (nada de "horas depois"), fique no presente imediato, mas faça a cena PULSAR com vida real.

MODO OBRIGATÓRIO DESTA CENA: ${modo.texto}
Siga o modo acima à risca. Ele foi escolhido pelo sistema justamente para variar o ritmo — ignorá-lo torna a campanha repetitiva.

- Pessoas FALAM e AGEM: dê falas reais aos NPCs (com nome), não só descrição de ambiente.
- Companheiros se manifestam: opinam, provocam, contam algo.
- 2-4 frases densas de vida presente, e devolva a vez a mim.
${banirUrgencia ? `
⛔ PROIBIDO NESTA CENA (você repetiu isso demais nas últimas cenas): alguém irromper/invadir o recinto; mensageiro ou arauto chegando ofegante; porta se abrindo com estrondo; figura arrastada por guardas; grito, súplica ou revelação urgente; qualquer nova ameaça anunciada. A cena precisa ser calma e cotidiana. Se sentir vontade de criar uma emergência, ESCOLHA outra coisa.` : `
⛔ Não use "alguém irrompe com urgência" nem interrupção dramática — esse recurso está desgastado nesta campanha.`}`;
}

/* Trilho enxuto (mobile): 4 abas. Ficha, Grupo, Pessoas, Guilda e Domínios
   vivem como SUB-abas dentro de Gestão. */
const ABAS = [{ id: "gestao", rotulo: "Gestão", icone: "🏛" }, { id: "diario", rotulo: "Diário", icone: "📜" }, { id: "inv", rotulo: "Bolsa", icone: "◆" }, { id: "mapa", rotulo: "Mapa", icone: "🗺" }, { id: "codex", rotulo: "Códex", icone: "📖" }, { id: "ascensao", rotulo: "Ascensão", icone: "🌟", soDesperto: true }];
/* ---------------- CERCA DE ESCOPO (v9.3) ----------------
   Um comando do painel é um comando, não um convite a inventar. "Convido
   Fulano para o meu grupo" virava uma viagem inteira porque o envelope não
   dizia onde ele terminava. Esta linha vai no fim de todo envelope
   administrativo: o Mestre responde AQUILO e nada mais. */
const SO_ISSO = ` ESCOPO DESTE TURNO (obrigatório): responda SOMENTE ao que este envelope pede, na cena e no lugar onde já estou. NÃO inicie viagem, combate, missão ou cena nova; NÃO mude de local; NÃO faça o tempo passar; NÃO invente personagem, item ou recompensa. Termine devolvendo a palavra para mim.`;

const SUBS_GESTAO = [{ id: "ficha", rotulo: "Ficha" }, { id: "grupo", rotulo: "Grupo" }, { id: "pessoas", rotulo: "Pessoas" }, { id: "talentos", rotulo: "Talentos" }, { id: "mercado", rotulo: "Mercado" }, { id: "guilda", rotulo: "Guilda" }, { id: "dominios", rotulo: "Domínios" }, { id: "diplomacia", rotulo: "Diplomacia" }, { id: "correio", rotulo: "Correio" }, { id: "mural", rotulo: "Mural" }];

const RARIDADE_COR = { comum: "#9B93AC", incomum: "#7BC98F", raro: "#6BA9E8", epico: "#B084E8", lendario: "#E8A33D" };
const SLOT_ROTULO = { arma: "Arma", armadura: "Armadura", elmo: "Elmo", botas: "Botas", anel: "Anel", amuleto: "Amuleto", escudo: "Escudo" };
const SLOTS_ORDEM = ["arma", "escudo", "armadura", "elmo", "botas", "anel", "amuleto"];

function TrilhoAbas({ abaAtiva, aoClicar, nGrupo, desperto }) {
  return (
    <nav className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1.5 py-2 pl-1.5" aria-label="Painéis">
      {ABAS.filter((a) => !a.soDesperto || desperto).map((aba) => {
        const ativa = abaAtiva === aba.id;
        return (
          <button key={aba.id} onClick={() => aoClicar(ativa ? null : aba.id)}
            className="flex flex-col items-center justify-center gap-0.5 rounded-l-xl transition-all"
            style={{ width: 52, height: 58, background: ativa ? T.panelSoft : T.panel, border: `1px solid ${ativa ? T.amber : T.line}`, borderRight: "none", color: ativa ? T.amberSoft : T.inkDim }}>
            <span className="text-base leading-none">{aba.icone}</span>
            <span className="tv-mono text-[9px] uppercase tracking-wider">{aba.rotulo}</span>
            {aba.id === "gestao" && nGrupo > 0 && <span className="tv-mono text-[9px] leading-none rounded-full px-1" style={{ background: T.violet, color: T.onSecond }}>{nGrupo}</span>}
          </button>
        );
      })}
    </nav>
  );
}

function CartaoMembro({ nome, subtitulo, nivel, vida, vidaMax, mana, manaMax, descricao, habilidades, ehVoce, semente, xpComp, vinculo }) {
  const [verHabs, setVerHabs] = React.useState(false); // habilidades sob demanda — cartão limpo
  return (
    <div className="rounded-xl p-4" style={{ background: T.panelSoft, border: `1px solid ${ehVoce ? T.amber : T.line}` }}>
      <div className="flex items-start gap-3">
        <Retrato semente={semente || nome} tamanho={48} anel={ehVoce ? T.amber : T.line} estado={estadoDe(vida, vidaMax)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="tv-display text-xl leading-tight truncate" style={{ color: T.ink }}>{nome}</div>
            <div className="flex items-center gap-1.5 shrink-0">
              {nivel != null && <span className="tv-mono text-[10px]" style={{ color: T.amberSoft }}>NV {nivel}</span>}
              {ehVoce && <span className="tv-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: T.amber, color: T.onAccent }}>Você</span>}
            </div>
          </div>
          <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>{subtitulo}</div>
        </div>
      </div>
      <div className="space-y-2 mt-3">
        <BarraMini rotulo="PV" atual={vida} max={vidaMax} cor={T.amber} corBaixa={T.danger} />
        {manaMax != null && <BarraMini rotulo="PM" atual={mana} max={manaMax} cor={T.violet} />}
        {!ehVoce && xpComp != null && <BarraMini rotulo="XP" atual={xpComp} max={XP_POR_NIVEL(nivel || 1)} cor={T.ok} />}
      </div>
      {!ehVoce && vinculo != null && (() => {
        const m = marcoDe(vinculo), prox = proximoMarco(vinculo);
        return (
          <div className="mt-2 rounded-lg px-2.5 py-2" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
            <div className="flex items-center justify-between mb-1">
              <span className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: T.inkDim }}>Vínculo {m ? `${m.icone} ${m.nome}` : "· conhecido"}</span>
              <span className="tv-mono text-[10px]" style={{ color: T.amberSoft }}>{vinculo}/{VINCULO_MAX}{prox ? ` → ${prox.icone} ${prox.nome} em ${prox.valor}` : " · máximo"}</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: T.panelSoft }}>
              <div className="h-full rounded-full" style={{ width: `${vinculo}%`, background: T.violet }} />
            </div>
          </div>
        );
      })()}
      {habilidades && habilidades.length > 0 && (
        <div className="mt-2.5">
          <button onClick={() => setVerHabs((v) => !v)} className="tv-mono text-[9px] px-2 py-1 rounded" style={{ border: `1px dashed ${T.line}`, color: T.violetSoft }}>
            {verHabs ? "▾ ocultar habilidades" : `▸ ver habilidades (${habilidades.length})`}
          </button>
          {verHabs && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {habilidades.map((h, i) => (
                <span key={i} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: T.panel, color: T.violetSoft, border: `1px solid ${T.line}` }} title={h.descricao}>{h.nome}{h.custo != null ? ` · ${h.custo}PM` : ""}</span>
              ))}
            </div>
          )}
        </div>
      )}
      {descricao && <div className="tv-body text-xs mt-3" style={{ color: T.inkDim }}>{descricao}</div>}
    </div>
  );
}

function SeletorCaminho({ mundo, alvo, atual, acampado, trocarCaminho, fechar }) {
  mundo = mundo || { genero: "Fantasia medieval" };
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
        <div className="tv-body text-xs" style={{ color: T.danger }}>⛺ Você precisa estar acampado. Feche a ficha, monte acampamento e volte aqui.</div>
      ) : (
        <div className="space-y-2">
          <div>
            <div className="tv-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: T.inkDim }}>{ehFuturista ? "Origem" : "Raça"}</div>
            <select value={raca} onChange={(e) => setRaca(e.target.value)} className="w-full rounded-lg p-2 tv-body text-xs outline-none" style={campo}>
              {racasDisp.map((r) => <option key={r.nome} value={r.nome}>{r.nome}</option>)}
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
              {PROFISSOES.map((pr) => <option key={pr.nome} value={pr.nome}>{pr.nome}</option>)}
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

/* PainelDiario extraído para ./painel-diario.jsx (v8.8) */
function PainelPessoas({ npcs, grupo, onConvidar, grupoCheio, onDefinirRelacao }) {
  const lista = Object.values(npcs || {}).sort((a, b) => (b.ultimaVez || 0) - (a.ultimaVez || 0));
  const nomesGrupo = new Set((grupo || []).map((g) => (g.nome || "").toLowerCase()));
  /* membros do grupo também têm relação formal: puxa a ficha do registro se existir */
  const fichaDe = (nome) => Object.values(npcs || {}).find((n) => (n.nome || "").toLowerCase() === (nome || "").toLowerCase());
  if (!lista.length && !(grupo || []).length) {
    return <div className="tv-body text-sm italic text-center py-10" style={{ color: T.inkDim }}>Ninguém conhecido ainda. As pessoas marcantes que você encontrar aparecerão aqui — com rosto, relação e tudo que você sabe sobre elas.</div>;
  }
  const cartao = (n, ehGrupo) => {
    const rel = relacaoNPC(ehGrupo ? "companheiro" : n.relacao);
    const morto = (n.status || "").toLowerCase().includes("morto");
    const convidavel = !ehGrupo && !morto && n.relacao !== "inimigo" && onConvidar;
    return (
      <div key={`${ehGrupo ? "g" : "n"}-${n.nome}`} className="rounded-xl p-3 flex items-start gap-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}`, opacity: morto ? 0.55 : 1 }}>
        <Retrato semente={n.semente || n.nome} tamanho={46} anel={rel.cor} estado={morto ? "grave" : "normal"} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="tv-display text-lg leading-tight truncate" style={{ color: T.ink }}>{n.nome}{morto ? " ☠" : ""}</span>
            <span className="tv-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0" style={{ border: `1px solid ${rel.cor}`, color: rel.cor }}>{rel.rotulo}</span>
          </div>
          <div className="tv-body text-xs italic truncate" style={{ color: T.inkDim }}>{[n.papel, n.genero, n.local ? `em ${n.local}` : "", n.conhecidoEm != null ? (n.conhecidoEm > 0 ? `conhecido(a) no dia ${n.conhecidoEm}` : "antes do dia 1") : ""].filter(Boolean).join(" · ") || "—"}</div>
          {n.notas && <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{n.notas}</div>}
          {onDefinirRelacao && !morto && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: T.inkDim }}>relação:</span>
              <select value={(n.relacao || (ehGrupo ? "aliado" : "neutro")).toLowerCase()} onChange={(e) => onDefinirRelacao(n.nome, e.target.value)}
                className="tv-mono text-[10px] rounded px-1.5 py-0.5"
                style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.ink }}>
                {["aliado", "amigo", "romance", "conjuge", "familia", "neutro", "rival", "inimigo"].map((r) => (
                  <option key={r} value={r}>{relacaoNPC(r).rotulo}</option>
                ))}
              </select>
            </div>
          )}
          {convidavel && (
            <button onClick={() => onConvidar(n.nome)} disabled={grupoCheio}
              className="tv-mono text-[10px] mt-1.5 px-2 py-1 rounded"
              style={{ border: `1px solid ${T.violet}`, color: T.violetSoft, opacity: grupoCheio ? 0.4 : 1, cursor: grupoCheio ? "not-allowed" : "pointer" }}>
              {grupoCheio ? "grupo cheio" : "⚑ convidar para o grupo"}
            </button>
          )}
        </div>
      </div>
    );
  };
  return (
    <div className="space-y-2">
      {(grupo || []).map((g) => { const f = fichaDe(g.nome) || {}; return cartao({ nome: g.nome, papel: [g.classe, g.subclasse].filter(Boolean).join(" · ") || g.conceito, notas: g.descricao, semente: g.semente, relacao: f.relacao, conhecidoEm: f.conhecidoEm != null ? f.conhecidoEm : 0 }, true); })}
      {lista.filter((n) => !nomesGrupo.has((n.nome || "").toLowerCase())).map((n) => cartao(n, false))}
    </div>
  );
}

/* Painel do MURAL DE CONTRATOS: serviços gerados por tabela (alvo, destino,
   recompensa — tudo em código). Aceitar vira quest com a recompensa embutida;
   o app paga sozinho quando o Mestre marca "concluida". O mural nunca fica
   vazio: ao aceitar um, outro cartaz é pregado no lugar. */
/* ---------------- ASCENSÃO (v7.4): escala GD, fé e o panteão ----------------
   Só aparece depois do despertar (nível NIVEL_DESPERTAR). Rastreável: o
   jogador VÊ a própria força e a de cada deus — e quando tem vantagem. */
/* PainelAscensao extraído para ./painel-ascensao.jsx (v8.8) */
function PainelMural({ mural, quests, aceitarContrato, abandonarContrato, garantirMural, acampado, decretos, pregarDecreto, cancelarDecreto, moedas, cofre, nivel }) {
  const ativos = (quests || []).filter((q) => q.contrato && q.status === "ativa");
  const [formAberto, setFormAberto] = React.useState(false);
  const [fTipo, setFTipo] = React.useState("cabeca");
  const [fAlvo, setFAlvo] = React.useState("");
  const [fRecompensa, setFRecompensa] = React.useState("");
  const justa = recompensaJusta(fTipo, nivel || 1);
  const totalOuro = (moedas || 0) + (cofre || 0);
  const valorDecreto = Math.max(5, parseInt(fRecompensa || "", 10) || justa);
  const cartazDecreto = (d) => {
    const t = tipoDecreto(d.tipo);
    const cor = d.status === "pregado" ? T.line : d.status === "aceito" ? T.violet : T.amber;
    return (
      <div key={d.id} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${cor}`, opacity: d.status === "resolvido" ? 0.65 : 1 }}>
        <div className="flex items-start justify-between gap-2">
          <span className="tv-display text-base leading-tight" style={{ color: T.ink }}>{t.icone} {d.alvo}</span>
          <span className="tv-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0" style={{ border: `1px solid ${T.amber}`, color: T.amberSoft }}>◉ {d.recompensa}</span>
        </div>
        <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{d.descricao}</div>
        <div className="tv-mono text-[9px] mt-1.5" style={{ color: d.status === "pregado" ? T.inkDim : d.status === "aceito" ? T.violetSoft : T.amberSoft }}>
          {d.status === "pregado" && "📌 pregado — aguardando quem tope o serviço…"}
          {d.status === "aceito" && `🗡 ${d.grupo ? d.grupo.bando : "um bando"} partiu para o serviço (dia ${(d.dias || 0) + 1})`}
          {d.status === "resolvido" && ROTULO_DESFECHO[d.desfecho]}
        </div>
        {d.status === "pregado" && (
          <button onClick={() => cancelarDecreto(d.id)} className="tv-mono text-[9px] mt-1.5 px-1.5 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>✕ retirar cartaz (devolve ◉ {d.recompensa})</button>
        )}
      </div>
    );
  };
  const cartaz = (c) => {
    const icone = ICONE_CONTRATO[c.tipo] || "📜";
    return (
      <div key={c.id} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
        <div className="flex items-start justify-between gap-2">
          <span className="tv-display text-base leading-tight" style={{ color: T.ink }}>{icone} {c.titulo}</span>
          <span className="tv-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0" style={{ border: `1px solid ${T.amber}`, color: T.amberSoft }}>◉ {c.recompensa.moedas} · {c.recompensa.xp} XP</span>
        </div>
        <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{c.descricao}</div>
        <button onClick={() => aceitarContrato(c)}
          className="tv-mono text-[10px] mt-2 px-2 py-1 rounded"
          style={{ border: `1px solid ${T.amber}`, color: T.amberSoft }}>
          ✍ aceitar contrato
        </button>
      </div>
    );
  };
  return (
    <div className="space-y-3">
      <div className="tv-body text-xs italic" style={{ color: T.inkDim }}>
        Cartazes pregados nos portões e tavernas da região. A recompensa é paga automaticamente quando o serviço é concluído de verdade na história. O mural é renovado a cada descanso longo.
      </div>
      {ativos.length > 0 && (
        <div>
          <p className="tv-mono text-[9px] uppercase tracking-[0.2em] mb-1.5" style={{ color: T.amber }}>Contratos em andamento</p>
          <div className="space-y-2">
            {ativos.map((q) => (
              <div key={q.titulo} className="rounded-xl p-3 flex items-start justify-between gap-2" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
                <div className="min-w-0">
                  <div className="tv-display text-base leading-tight" style={{ color: T.ink }}>🗡 {q.titulo}</div>
                  <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{q.descricao}</div>
                  <div className="tv-mono text-[9px] mt-1" style={{ color: T.violetSoft }}>recompensa: ◉ {q.contrato.moedas} · {q.contrato.xp} XP</div>
                </div>
                <button onClick={() => abandonarContrato(q.titulo)} className="tv-mono text-[9px] px-1.5 py-1 rounded shrink-0" style={{ border: `1px solid ${T.line}`, color: T.inkDim }} title="Abandonar">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="tv-mono text-[9px] uppercase tracking-[0.2em] mb-1.5" style={{ color: T.amber }}>Cartazes disponíveis</p>
        {(mural || []).length === 0 ? (
          <div className="text-center py-6">
            <div className="tv-body text-sm italic mb-3" style={{ color: T.inkDim }}>Nenhum cartaz por aqui…</div>
            <button onClick={() => garantirMural(true)} className="tv-mono text-[10px] px-3 py-1.5 rounded" style={{ border: `1px solid ${T.amber}`, color: T.amberSoft }}>📌 procurar cartazes</button>
          </div>
        ) : (
          <div className="space-y-2">{mural.map(cartaz)}</div>
        )}
      </div>
      {acampado && <div className="tv-body text-[11px] italic text-center" style={{ color: T.inkDim }}>Dica: ao sair do acampamento com um descanso longo, cartazes novos aparecem no mural.</div>}

      {/* SEUS DECRETOS: o reverso do mural — você oferece ouro, o mundo trabalha */}
      <div>
        <p className="tv-mono text-[9px] uppercase tracking-[0.2em] mb-1.5" style={{ color: T.violetSoft }}>Seus decretos e recompensas</p>
        <div className="tv-body text-xs italic mb-2" style={{ color: T.inkDim }}>
          Pregue seus próprios cartazes: a recompensa fica retida na hora (bolso + cofre da guilda), aventureiros do mundo podem aceitar — e voltam em alguns dias com o resultado. Fracasso: o ouro volta todo para você.
        </div>
        {(decretos || []).length > 0 && <div className="space-y-2 mb-2">{decretos.map(cartazDecreto)}</div>}
        {!formAberto ? (
          <button onClick={() => { setFormAberto(true); setFRecompensa(String(recompensaJusta(fTipo, nivel || 1))); }} className="tv-mono text-[10px] px-3 py-1.5 rounded w-full" style={{ border: `1px solid ${T.violet}`, color: T.violetSoft }}>📣 pregar um decreto</button>
        ) : (
          <div className="rounded-xl p-3 space-y-2" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
            <div className="flex gap-1.5 flex-wrap">
              {TIPOS_DECRETO.map((t) => (
                <button key={t.id} onClick={() => { setFTipo(t.id); setFRecompensa(String(recompensaJusta(t.id, nivel || 1))); }}
                  className="tv-mono text-[9px] px-2 py-1 rounded"
                  style={{ background: fTipo === t.id ? T.violet : "transparent", color: fTipo === t.id ? T.onAccent : T.inkDim, border: `1px solid ${fTipo === t.id ? T.violet : T.line}` }}>
                  {t.icone} {t.rotulo}
                </button>
              ))}
            </div>
            <input value={fAlvo} onChange={(e) => setFAlvo(e.target.value)} placeholder="Alvo — ex.: o líder de Ferroval, a Cripta dos Sussurros, a caravana de Bruna…"
              className="w-full tv-body text-sm rounded-lg px-3 py-2" style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.ink }} />
            <div className="flex items-center gap-2">
              <span className="tv-mono text-[10px] shrink-0" style={{ color: T.inkDim }}>◉ recompensa:</span>
              <input value={fRecompensa} onChange={(e) => setFRecompensa(e.target.value.replace(/\D/g, ""))} inputMode="numeric"
                className="w-24 tv-mono text-sm rounded-lg px-2 py-1.5 text-center" style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.amberSoft }} />
              <span className="tv-mono text-[9px]" style={{ color: T.inkDim }}>justa ≈ ◉ {justa} · quanto mais generosa, mais chance de aceitarem</span>
            </div>
            <div className="tv-mono text-[9px]" style={{ color: totalOuro >= valorDecreto ? T.inkDim : "#e07070" }}>
              Ouro disponível (bolso + cofre): ◉ {totalOuro}{totalOuro < valorDecreto ? " — insuficiente" : ""}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { pregarDecreto({ tipo: fTipo, alvo: fAlvo, recompensa: valorDecreto }); setFormAberto(false); setFAlvo(""); }}
                disabled={!fAlvo.trim() || totalOuro < valorDecreto}
                className="flex-1 tv-mono text-[10px] px-3 py-2 rounded"
                style={{ background: T.violet, color: T.onAccent, opacity: (!fAlvo.trim() || totalOuro < valorDecreto) ? 0.4 : 1 }}>
                📣 pregar (retém ◉ {valorDecreto})
              </button>
              <button onClick={() => setFormAberto(false)} className="tv-mono text-[10px] px-3 py-2 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Painel de DIPLOMACIA: as potências conhecidas (guildas, reinos, cultos…),
   relação, tratado e ações de política. As propostas vão para a ficção —
   o Mestre decide a resposta delas; o app só registra os tratados firmados. */
/* PainelDiplomacia extraído para ./painel-diplomacia.jsx (v8.8) */
function PainelCorreio({ correio, faccoes, dia, moedas, enviarCarta, responderPeticao }) {
  const [para, setPara] = React.useState("");
  const [tipo, setTipo] = React.useState("cortesia");
  const [oferta, setOferta] = React.useState("");
  const [mensagem, setMensagem] = React.useState("");
  const c = correio || { enviadas: [], recebidas: [], historico: [], tratados: [] };
  const pendentes = c.recebidas.filter((p) => p.status === "pendente");
  const t = TIPOS_CARTA[tipo];
  if (!faccoes.length && !pendentes.length && !c.tratados.length) {
    return <div className="tv-body text-sm italic text-center py-10" style={{ color: T.inkDim }}>Nenhuma facção conhecida para escrever cartas. Quando o mundo crescer (reinos, guildas, cultos), o correio passa a correr por aqui.</div>;
  }
  const STATUS_ROTULO = { a_caminho: "a caminho", aceita: "aceita", recusada: "recusada", guerra: "guerra!", expirada: "expirada" };
  return (
    <div className="space-y-3">
      {/* petições recebidas — exigem decisão */}
      {pendentes.map((p) => (
        <div key={p.id} className="rounded-xl p-3 tv-fade" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
          <div className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: T.amber }}>✉️ petição recebida · dia {p.recebidaEm} · prazo: dia {p.prazo}{dia >= p.prazo ? " (último dia!)" : ""}</div>
          <div className="tv-body text-sm mt-1" style={{ color: T.ink }}>{p.icone} {p.texto}</div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <button onClick={() => responderPeticao(p.id, true)} className="tv-mono text-[10px] px-1.5 py-1.5 rounded font-bold" style={{ background: T.amber, color: T.onAccent }}>aceitar</button>
            <button onClick={() => responderPeticao(p.id, false)} className="tv-mono text-[10px] px-1.5 py-1.5 rounded" style={{ border: `1px solid ${T.danger}`, color: T.danger }}>recusar</button>
          </div>
        </div>
      ))}

      {/* tratados firmados pelo correio */}
      {c.tratados.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
          <div className="tv-mono text-[9px] uppercase tracking-wider mb-1.5" style={{ color: T.inkDim }}>tratados em vigor</div>
          <div className="flex flex-wrap gap-1.5">
            {c.tratados.map((x, i) => (
              <span key={i} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${x.tratado === "guerra" ? T.danger : T.amber}`, color: x.tratado === "guerra" ? T.danger : T.amberSoft }}>
                {x.rotulo} · {x.faccao}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* escrever carta */}
      {faccoes.length > 0 && (
        <div className="rounded-xl p-3 space-y-2" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
          <div className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: T.inkDim }}>escrever carta · ◉ {CUSTO_CARTA} (mensageiro)</div>
          <div className="grid grid-cols-2 gap-1.5">
            <select value={para} onChange={(e) => setPara(e.target.value)} className="tv-mono text-xs rounded px-2 py-1.5" style={{ background: T.panel, color: T.ink, border: `1px solid ${T.line}` }}>
              <option value="">para quem?</option>
              {faccoes.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="tv-mono text-xs rounded px-2 py-1.5" style={{ background: T.panel, color: T.ink, border: `1px solid ${T.line}` }}>
              {Object.entries(TIPOS_CARTA).map(([id, x]) => <option key={id} value={id}>{x.icone} {x.nome}</option>)}
            </select>
          </div>
          <div className="tv-body text-xs italic" style={{ color: T.inkDim }}>{t.desc}</div>
          <input value={oferta} onChange={(e) => setOferta(e.target.value.replace(/[^0-9]/g, ""))} placeholder="oferta em moedas (opcional)"
            className="w-full tv-mono text-xs rounded px-2 py-1.5" style={{ background: T.panel, color: T.ink, border: `1px solid ${T.line}` }} />
          <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={2} placeholder="o que diz a carta… (opcional, o Mestre entrega suas palavras)"
            className="w-full tv-body text-xs rounded px-2 py-1.5" style={{ background: T.panel, color: T.ink, border: `1px solid ${T.line}`, resize: "vertical" }} />
          <button onClick={() => { enviarCarta(para, tipo, Number(oferta) || 0, mensagem); setMensagem(""); setOferta(""); }}
            disabled={!para || moedas < CUSTO_CARTA}
            className="w-full tv-mono text-xs py-2 rounded font-bold"
            style={{ background: T.amber, color: T.onAccent, opacity: (!para || moedas < CUSTO_CARTA) ? 0.4 : 1 }}>
            {t.icone} enviar por mensageiro · ◉ {CUSTO_CARTA}
          </button>
        </div>
      )}

      {/* enviadas aguardando resposta */}
      {c.enviadas.length > 0 && (
        <div className="space-y-1.5">
          {c.enviadas.map((x) => (
            <div key={x.id} className="rounded-xl p-2.5 flex items-center justify-between gap-2" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
              <div className="tv-body text-xs" style={{ color: T.ink }}>{TIPOS_CARTA[x.tipo]?.icone} {TIPOS_CARTA[x.tipo]?.nome} → <b>{x.para}</b>{x.oferta ? ` · ◉ ${x.oferta}` : ""}</div>
              <div className="tv-mono text-[9px] shrink-0" style={{ color: T.inkDim }}>resposta até dia {x.chegaEm}</div>
            </div>
          ))}
        </div>
      )}

      {/* histórico */}
      {c.historico.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
          <div className="tv-mono text-[9px] uppercase tracking-wider mb-1.5" style={{ color: T.inkDim }}>histórico do correio</div>
          {c.historico.slice(0, 8).map((h, i) => (
            <div key={i} className="tv-body text-xs py-0.5" style={{ color: T.inkDim }}>
              {h.de === "jogador"
                ? `${TIPOS_CARTA[h.tipo]?.icone || "✉️"} ${TIPOS_CARTA[h.tipo]?.nome || h.tipo} → ${h.para} — ${STATUS_ROTULO[h.status] || h.status} (dia ${h.respondidaEm || h.enviadaEm})`
                : `${h.icone || "✉️"} ${h.de} — ${STATUS_ROTULO[h.status] || h.status} (dia ${h.respondidaEm || h.recebidaEm})`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- CÓDEX: conquistas/títulos, bestiário e registros ----------------
   Tudo lido dos contadores do app — zero tokens, a IA nem sabe que existe. */
/* PainelCodex extraído para ./painel-codex.jsx (v8.8) */
function PainelLateral({ aba, fechar, personagem, mundo, equipar, desequipar, descartarItem, descartarEquip, trocarCaminho, acampado, removerDoGrupo, mapa, faccaoJogador, cidadeAtual, transferirItem, historia, quests, trocarArco, npcs, guilda, depositarCofre, sacarCofre, melhorarGuilda, convidarNpc, onDiplomacia, onPresente, recalibrarLenda, recalibrarMundo, conquistas, tituloAtivo, escolherTitulo, descobertas, contadores, equiparComp, desequiparComp, desmontarEquip, forjar, mural, aceitarContrato, abandonarContrato, garantirMural, decretos, pregarDecreto, cancelarDecreto, definirRelacao, reino, famaInfo, nemesis, nomeCampanha, dia, onExportarCronica, eventos, correio, enviarCarta, responderPeticao, divindade, onDespertar, onRecalibrarAsc, recalAscState, onMilagreUI, onForragear, devocao, onErguerTemplo, onUsarConsumivel, mercadoAqui, cidadeMercado, onComprar, onVender, onAprenderHab, onRespec, onEscolherSubclasse, bloqueado }) {
  const [invDe, setInvDe] = React.useState("eu");
  const [forjaAberta, setForjaAberta] = React.useState(false); // forja sob demanda — bolsa limpa
  const [forjaSlot, setForjaSlot] = React.useState("arma");
  const [abrirCaminho, setAbrirCaminho] = React.useState(null); // "eu" | nome do companheiro
  const [confirmarRemover, setConfirmarRemover] = React.useState(null);
  const [subGestao, setSubGestao] = React.useState("ficha");    // sub-aba dentro de Gestão
  const [valorCofre, setValorCofre] = React.useState("");       // quanto depositar/sacar da guilda
  const [verHabsFicha, setVerHabsFicha] = React.useState(false); // habilidades da ficha sob demanda
  mundo = mundo || { genero: "Fantasia medieval" };
  if (!aba) return null;
  const xpProx = XP_POR_NIVEL(personagem.nivel);
  const equipados = personagem.equipados || {};
  const equipDisponivel = (personagem.equipamento || []).filter((e) => !Object.values(equipados).some((x) => x?.nome === e.nome));
  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,.45)" }} onClick={fechar} />
      <aside className="tv-slide tv-scroll fixed right-0 inset-y-0 z-40 w-80 max-w-[88vw] overflow-y-auto p-5 flex flex-col gap-5" style={{ background: T.panel, borderLeft: `1px solid ${T.line}` }}>
        <div className="flex items-center justify-between">
          <h2 className="tv-display text-2xl" style={{ color: T.ink }}>{aba === "gestao" ? "Gestão" : aba === "diario" ? "Diário" : aba === "mapa" ? "Mapa" : aba === "codex" ? "Códex" : aba === "ascensao" ? "Ascensão" : "Inventário"}</h2>
          <button onClick={fechar} className="tv-mono text-lg px-2" style={{ color: T.inkDim }}>✕</button>
        </div>

        {aba === "gestao" && (
          <div className="flex flex-wrap gap-1.5 -mt-2">
            {SUBS_GESTAO.map((s) => (
              <button key={s.id} onClick={() => setSubGestao(s.id)}
                className="tv-mono text-[10px] px-2.5 py-1.5 rounded-full"
                style={{ background: subGestao === s.id ? T.amber : T.panelSoft, color: subGestao === s.id ? T.onAccent : T.inkDim, border: `1px solid ${subGestao === s.id ? T.amber : T.line}`, fontWeight: 600 }}>
                {s.rotulo}
              </button>
            ))}
          </div>
        )}

        {aba === "gestao" && subGestao === "ficha" && (
          <>
            <div className="flex items-center gap-3">
              <Retrato semente={sementeDe(personagem)} tamanho={64} anel={T.amber} estado={estadoDe(personagem.vida, personagem.vidaMax)} />
              <div className="min-w-0">
                <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.violetSoft }}>
                  {(() => {
                    const t = tituloDoHeroi(divindade, (famaInfo && famaInfo.pf && famaInfo.pf.rotulo) || "", patamarDe(personagem.nivel).nome);
                    return (<>
                      <span style={{ color: t.divino ? T.violetSoft : T.amberSoft, fontWeight: 700 }}>{t.divino ? `🌟 ${t.titulo}` : t.titulo}</span>
                      {t.divino && <span style={{ color: T.violetSoft }}> · GD {t.gd}</span>}
                      <span style={{ color: T.inkDim }}> · {(mundo || {}).genero} · nv {personagem.nivel} · combate: {patamarDe(personagem.nivel).nome}</span>
                    </>);
                  })()}
                </div>
                <div className="tv-display text-3xl leading-tight" style={{ color: T.ink }}>{personagem.nome}</div>
                <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>{personagem.conceito}</div>
                {tituloAtivo ? <div className="tv-mono text-[11px] mt-0.5" style={{ color: T.amber }}>★ ❝ {tituloAtivo} ❞</div> : null}
                {famaInfo && (
                  <div className="mt-1.5 flex items-center gap-1.5" title={`Fama ${famaInfo.f}/100 — ${famaInfo.pf.nota}`}>
                    <span className="tv-mono text-[9px] uppercase tracking-wider shrink-0" style={{ color: T.amberSoft }}>📣 {famaInfo.pf.rotulo}</span>
                    <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: T.panel }}>
                      <div className="h-full rounded-full" style={{ width: `${famaInfo.f}%`, background: T.amber }} />
                    </div>
                    <span className="tv-mono text-[9px]" style={{ color: T.inkDim }}>{famaInfo.f}</span>
                  </div>
                )}
                {nemesis && nemesis.status !== "derrotada" && (
                  <div className="tv-mono text-[10px] mt-1" style={{ color: T.danger }} title={`${nemesis.nome}, ${nemesis.titulo} — ${nemesis.motivo}. Ódio: ${nemesis.odio}/100`}>
                    🎭 nêmesis: {nemesis.nome} · ódio {nemesis.odio}
                  </div>
                )}
                {(personagem.classe || personagem.raca) && (
                  <div className="tv-mono text-[10px] uppercase tracking-widest mt-1" style={{ color: T.amberSoft }}>
                    {[personagem.raca, personagem.classe, personagem.subclasse].filter(Boolean).join(" · ")}
                    {personagem.profissao ? <span style={{ color: T.inkDim }}> · {personagem.profissao}</span> : null}
                  </div>
                )}
                {personagem.antecedente && (
                  <div className="tv-mono text-[10px] uppercase tracking-widest mt-0.5" style={{ color: T.inkDim }} title={personagem.antecedenteGancho || ""}>
                    🎭 {personagem.antecedente}
                  </div>
                )}
                {(personagem.cicatrizes || []).length > 0 && (
                  <div className="mt-2 rounded-xl p-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                    <div className="tv-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: T.inkDim }}>🩸 Cicatrizes ({personagem.cicatrizes.length})</div>
                    <div className="flex flex-wrap gap-1">
                      {personagem.cicatrizes.map((c, i) => (
                        <span key={i} title={`${c.descricao}${c.dia ? ` — desde o dia ${c.dia}` : ""}${c.vidaMax ? ` · −${-c.vidaMax} PV máx.` : ""}`}
                          className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${T.danger}`, color: T.inkDim }}>
                          {c.nome}{c.vidaMax ? ` −${-c.vidaMax}` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={() => setAbrirCaminho(abrirCaminho === "eu" ? null : "eu")} className="tv-mono text-[10px] mt-1.5 px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.violetSoft }}>
                  {personagem.classe ? "⚔ trilhar novo caminho" : "⚔ escolher caminho"}
                </button>
              </div>
            </div>
            <div className="space-y-2.5">
              <BarraMini rotulo="PV" atual={personagem.vida} max={personagem.vidaMax} cor={T.amber} corBaixa={T.danger} />
              <BarraMini rotulo="PM" atual={personagem.mana} max={personagem.manaMax} cor={T.violet} />
              <BarraMini rotulo="XP" atual={personagem.xp} max={xpProx} cor={T.ok} />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="tv-mono text-[10px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${T.violet}`, color: T.violetSoft }}>
                  proficiência +{bonusProficiencia(personagem.nivel || 1)}
                </span>
                {(personagem.nivel || 1) >= 20 && (
                  <span className="tv-mono text-[10px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${T.amber}`, color: T.amberSoft }}>
                    🌠 {(personagem.dadivas || []).length} dádiva{(personagem.dadivas || []).length === 1 ? "" : "s"} · {personagem.xp}/{XP_POR_DADIVA}
                  </span>
                )}
              </div>
              {(() => {
                const sup = garantirSuprimentos(personagem.suprimentos);
                const bocas = 1 + (personagem.grupo || []).length;
                const c = consumoDiario(bocas);
                const dias = Math.min(Math.floor(sup.racoes / c.racoes), Math.floor(sup.agua / c.agua));
                const ex = efeitoExaustao(personagem.exaustao || 0);
                return (
                  <div className="rounded-lg px-2.5 py-2" style={{ background: T.panelSoft, border: `1px solid ${dias <= 1 ? T.danger : T.line}` }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: dias <= 1 ? T.danger : T.inkDim }}>Suprimentos · {bocas} boca{bocas > 1 ? "s" : ""}</span>
                      <span className="tv-mono text-[9px]" style={{ color: dias <= 1 ? T.danger : T.inkDim }}>{dias} dia{dias === 1 ? "" : "s"}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap tv-mono text-[11px]" style={{ color: T.ink }}>
                      <span>🥖 {sup.racoes}</span><span>💧 {sup.agua}</span><span>🕯 {sup.tochas}</span>
                      <span style={{ color: sup.kit ? T.ok : T.inkDim }}>🎒 {sup.kit ? "kit" : "sem kit"}</span>
                    </div>
                    {ex.nivel > 0 && (
                      <div className="tv-body text-[11px] mt-1.5" style={{ color: T.danger }}>😩 Exaustão {ex.nivel}/6 — {ex.efeito}</div>
                    )}
                    <button onClick={onForragear} disabled={bloqueado} className="w-full tv-mono text-[10px] px-2 py-1.5 rounded mt-1.5" style={{ border: `1px solid ${T.ok}`, color: T.ok, opacity: bloqueado ? 0.45 : 1 }}>
                      🌿 Forragear <span style={{ color: T.inkDim }}>(meio dia · Percepção)</span>
                    </button>
                  </div>
                );
              })()}
              {(personagem.dadivas || []).length > 0 && (
                <div className="rounded-lg px-2.5 py-2" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
                  <div className="tv-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: T.amberSoft }}>Dádivas épicas</div>
                  {(personagem.dadivas || []).map((id) => {
                    const d = DADIVAS_EPICAS.find((x) => x.id === id);
                    return d ? <div key={id} className="tv-body text-xs" style={{ color: T.ink }}>🌠 {d.nome} <span style={{ color: T.inkDim }}>— {d.desc}</span></div> : null;
                  })}
                </div>
              )}
            </div>
            {abrirCaminho === "eu" && <SeletorCaminho mundo={mundo} alvo="eu" atual={personagem} acampado={acampado} trocarCaminho={trocarCaminho} fechar={() => setAbrirCaminho(null)} />}
            {recalibrarLenda && (
              <button onClick={recalibrarLenda} className="w-full tv-mono text-[10px] px-2 py-1.5 rounded-lg"
                style={{ border: `1px dashed ${T.line}`, color: T.inkDim }}
                title="Se sua lenda cresceu mais que seus números (save antigo), o Mestre relê a campanha e propõe nível e atributos coerentes — você confirma antes de aplicar.">
                ⚖ recalibrar lenda (save antigo)
              </button>
            )}
            {recalibrarMundo && (
              <button onClick={recalibrarMundo} className="w-full tv-mono text-[10px] px-2 py-1.5 rounded-lg"
                style={{ border: `1px dashed ${T.line}`, color: T.inkDim }}
                title="O arquivista relê a campanha e propõe o estado dos sistemas que o save antigo não conhecia: companheiros (nível/classe), pessoas, potências e tratados, cidades dominadas e nível da guilda. Você confirma antes de aplicar.">
                ⚖ recalibrar mundo · guilda, pessoas, domínios
              </button>
            )}
            {(personagem.condicoes || []).length > 0 && (
              <div>
                <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Condições</div>
                <div className="space-y-1.5">
                  {personagem.condicoes.map((c, i) => (
                    <div key={i} className="rounded-lg px-3 py-2 flex items-center justify-between" style={{ background: T.panelSoft, border: `1px solid ${c.tipo === "bom" ? T.ok : T.danger}` }}>
                      <span className="tv-body text-sm" style={{ color: T.ink }}>{c.tipo === "bom" ? "✦" : "⚠"} {c.nome} <span className="tv-body text-xs italic" style={{ color: T.inkDim }}>{c.efeito}</span></span>
                      <span className="tv-mono text-[10px]" style={{ color: T.amberSoft }}>{c.turnos != null && !isNaN(Number(c.turnos)) ? `${c.turnos}t` : "∞"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(personagem.efeitos || []).length > 0 && (
              <div>
                <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.violetSoft }}>Efeitos ativos</div>
                <div className="space-y-1.5">
                  {personagem.efeitos.map((e, i) => (
                    <div key={i} className="rounded-lg px-3 py-2 flex items-center justify-between" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
                      <span className="tv-body text-sm" style={{ color: T.ink }}>✧ {e.nome} <span className="tv-mono text-[10px]" style={{ color: T.violetSoft }}>+{e.bonus} {e.aplica}</span></span>
                      <span className="tv-mono text-[10px]" style={{ color: T.amberSoft }}>{e.turnos}t</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Atributos</div>
              <div className="grid grid-cols-2 gap-2">
                {ATRIBUTOS.map((a) => {
                  const base = (personagem.atributos || {})[a.id] || 0;
                  const efetivo = atributoEfetivo(personagem, a.id);
                  const bonus = efetivo - base;
                  return (
                    <div key={a.id} className="rounded-lg px-3 py-2 flex items-center justify-between" style={{ background: T.panelSoft }}>
                      <span className="tv-body text-sm" style={{ color: T.ink }}>{a.nome.slice(0, 3).toUpperCase()}</span>
                      <span className="tv-mono text-sm font-semibold" style={{ color: bonus > 0 ? T.ok : T.amber }}>+{efetivo}{bonus > 0 ? <span className="text-[9px]" style={{ color: T.inkDim }}> ({base}+{bonus})</span> : null}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="tv-mono text-xs uppercase tracking-widest" style={{ color: T.inkDim }}>Habilidades</div>
                {(personagem.habilidades || []).length > 0 && (
                  <button onClick={() => setVerHabsFicha((v) => !v)} className="tv-mono text-[9px] px-2 py-1 rounded" style={{ border: `1px dashed ${T.line}`, color: T.violetSoft }}>
                    {verHabsFicha ? "▾ ocultar" : `▸ ver habilidades (${(personagem.habilidades || []).length})`}
                  </button>
                )}
              </div>
              {(personagem.habilidades || []).length === 0 ? <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Nenhuma ainda.</div> : !verHabsFicha ? null : (
                <ul className="space-y-2">
                  {(personagem.habilidades || []).filter((h) => h).map((h, i) => {
                    const hn = typeof h === "string" ? { nome: h, custo: 0, descricao: "" } : h;
                    return (
                    <li key={i} className="rounded-lg px-3 py-2" style={{ background: T.panelSoft }}>
                      <div className="flex items-baseline justify-between gap-2"><span className="tv-body text-sm" style={{ color: T.ink }}>{hn.nome}</span><span className="tv-mono text-[10px]" style={{ color: T.violetSoft }}>{hn.custo || 0} PM</span></div>
                      {hn.descricao && <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{hn.descricao}</div>}
                    </li>
                  ); })}
                </ul>
              )}
            </div>
            {personagem.historia && (
              <div>
                <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>História</div>
                <div className="tv-body text-sm" style={{ color: T.inkDim }}>{personagem.historia}</div>
              </div>
            )}
          </>
        )}

        {aba === "diario" && <PainelDiario historia={historia} quests={quests} trocarArco={trocarArco} eventos={eventos} diaAtual={dia} />}
        {aba === "ascensao" && <PainelAscensao divindade={divindade} nivel={personagem.nivel || 1} onDespertar={onDespertar} onRecalibrar={onRecalibrarAsc} recalibrando={recalAscState === "pedindo"}  onMilagre={onMilagreUI} mapa={mapa} devocao={devocao} />}
        {aba === "mapa" && <PainelMapa mapa={mapa} faccaoJogador={faccaoJogador} cidadeAtual={cidadeAtual} devocao={devocao} divindade={divindade} />}
        {aba === "codex" && <PainelCodex conquistas={conquistas} tituloAtivo={tituloAtivo} escolherTitulo={escolherTitulo} descobertas={descobertas} contadores={contadores} mundo={mundo} npcs={npcs} mapa={mapa} personagem={personagem} nomeCampanha={nomeCampanha} guilda={guilda} reino={reino} dia={dia} nemesis={nemesis} faccaoJogador={faccaoJogador} onExportarCronica={onExportarCronica} />}
        {aba === "gestao" && subGestao === "mural" && <PainelMural mural={mural} quests={quests} aceitarContrato={aceitarContrato} abandonarContrato={abandonarContrato} garantirMural={garantirMural} acampado={acampado} decretos={decretos} pregarDecreto={pregarDecreto} cancelarDecreto={cancelarDecreto} moedas={personagem.moedas} cofre={guilda && guilda.cofre} nivel={personagem.nivel} />}
        {aba === "gestao" && subGestao === "pessoas" && <PainelPessoas npcs={npcs} grupo={personagem.grupo || []} onConvidar={convidarNpc} grupoCheio={(personagem.grupo || []).length >= MAX_COMPANHEIROS} onDefinirRelacao={definirRelacao} />}

        {aba === "gestao" && subGestao === "diplomacia" && <PainelDiplomacia mapa={mapa} faccaoJogador={faccaoJogador} onDiplomacia={onDiplomacia} onPresente={onPresente} cofre={guilda && guilda.cofre} />}
        {aba === "gestao" && subGestao === "correio" && <PainelCorreio correio={correio} faccoes={((mapa && mapa.faccoes) || []).filter((f) => f && f.nome && !f.doJogador && f.relacao !== "jogador").map((f) => f.nome)} dia={dia} moedas={personagem.moedas || 0} enviarCarta={enviarCarta} responderPeticao={responderPeticao} />}

        {/* MERCADO (v9.2): estoque e preço do sistema; a IA só narra a cena */}
        {aba === "gestao" && subGestao === "talentos" && <PainelTalentos personagem={personagem} grupo={personagem.grupo || []} onAprender={onAprenderHab} onRespec={onRespec} onEscolherSubclasse={onEscolherSubclasse} />}

        {aba === "gestao" && subGestao === "mercado" && (() => {
          const bancas = mercadoAqui || [];
          if (!bancas.length) {
            return <div className="tv-body text-sm italic text-center py-10" style={{ color: T.inkDim }}>Nenhuma banca por perto. Mercadores existem nas cidades — e, com sorte, numa carroça de estrada.</div>;
          }
          return (
            <>
              <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
                <span className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.inkDim }}>Sua bolsa</span>
                <span className="tv-mono text-xl font-semibold" style={{ color: T.amber }}>◉ {personagem.moedas || 0}</span>
              </div>
              {bancas.map((m) => (
                <div key={m.id} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                  <div className="tv-display text-lg" style={{ color: T.ink }}>{m.icone} {m.nome}</div>
                  <div className="tv-body text-xs mb-2 italic" style={{ color: T.inkDim }}>{m.rotulo} — {m.desc}</div>
                  {!m.estoque.length ? (
                    <div className="tv-body text-xs italic" style={{ color: T.inkDim }}>Prateleiras vazias. Volte noutra semana.</div>
                  ) : (
                    <div className="space-y-1.5">
                      {m.estoque.map((it) => {
                        const pode = (personagem.moedas || 0) >= it.preco;
                        return (
                          <div key={it.nome} className="rounded-lg px-2.5 py-2 flex items-center gap-2" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
                            <div className="min-w-0 flex-1">
                              <div className="tv-body text-sm truncate" style={{ color: T.ink }}>{it.nome}</div>
                              <div className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: RARIDADE_COR[it.raridade] || T.inkDim }}>
                                {it.detalhe || (it.tipo === "curiosidade" ? "curiosidade" : `${SLOT_ROTULO[it.tipo] || it.tipo} · ${it.raridade}`)}
                              </div>
                            </div>
                            <button onClick={() => onComprar && onComprar(m.id, it.nome)} disabled={!pode}
                              className="tv-mono text-[10px] px-2.5 py-1.5 rounded-lg shrink-0"
                              style={{ background: pode ? T.amber : T.panelSoft, color: pode ? T.onAccent : T.inkDim, border: `1px solid ${T.amber}`, fontWeight: 600, opacity: pode ? 1 : 0.45 }}>
                              ◉ {it.preco}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              {/* VENDER: o que está na bolsa e na mochila vale metade */}
              {(() => {
                const vendaveis = [
                  ...(personagem.equipamento || []).map((it) => ({ it, origem: "equipamento", nome: it.nome })),
                  ...(personagem.inventario || []).map((raw) => ({ it: typeof raw === "string" ? { nome: raw } : raw, origem: "inventario", nome: typeof raw === "string" ? raw : (raw && raw.nome) || "item" })),
                ];
                if (!vendaveis.length) return null;
                const agrupado = Object.values(vendaveis.reduce((acc, v) => {
                  const k = `${v.origem}|${v.nome}`;
                  if (!acc[k]) acc[k] = { ...v, qtd: 0 };
                  acc[k].qtd++; return acc;
                }, {}));
                return (
                  <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                    <div className="tv-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Vender (metade do valor)</div>
                    <div className="space-y-1.5">
                      {agrupado.slice(0, 30).map((v) => (
                        <div key={`${v.origem}|${v.nome}`} className="rounded-lg px-2.5 py-2 flex items-center gap-2" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
                          <span className="tv-body text-sm flex-1 min-w-0 truncate" style={{ color: T.ink }}>{v.nome}{v.qtd > 1 ? <span className="tv-mono text-[10px]" style={{ color: T.amberSoft }}> ×{v.qtd}</span> : null}</span>
                          <button onClick={() => onVender && onVender(v.nome, v.origem)} className="tv-mono text-[10px] px-2.5 py-1.5 rounded-lg shrink-0" style={{ border: `1px solid ${T.ok}`, color: T.ok }}>
                            vender ◉ {precoDeCompra(v.it, cidadeMercado)}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <div className="tv-body text-xs" style={{ color: T.inkDim }}>
                O estoque é do sistema e gira a cada semana de jogo — a mesma banca, no mesmo dia, tem sempre as mesmas coisas. Preços sobem em capitais e caem em vilas. O Mestre narra a conversa; quem cobra é o sistema.
              </div>
            </>
          );
        })()}

        {aba === "gestao" && subGestao === "guilda" && (() => {
          const temGuilda = !!faccaoJogador;
          const g = guilda || { nivel: 1, cofre: 0 };
          const custo = custoUpgradeGuilda(g.nivel);
          const rendaDia = rendaDiariaTotal(mapa, g.nivel, temGuilda);
          if (!temGuilda) {
            return <div className="tv-body text-sm italic text-center py-10" style={{ color: T.inkDim }}>Você ainda não lidera uma guilda. Funde uma na história — fale com o Mestre, reúna aliados e declare a fundação. Quando ela existir, a gestão aparece aqui.</div>;
          }
          return (
            <>
              <div className="rounded-xl p-4" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
                <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.amberSoft }}>Sua guilda</div>
                <div className="tv-display text-2xl leading-tight" style={{ color: T.ink }}>{faccaoJogador}</div>
                <div className="flex items-center gap-1 mt-1.5">
                  {Array.from({ length: NIVEL_GUILD_MAX }).map((_, i) => (
                    <span key={i} className="inline-block w-3.5 h-3.5 rounded-sm" style={{ background: i < g.nivel ? T.amber : T.panel, border: `1px solid ${T.amber}` }} />
                  ))}
                  <span className="tv-mono text-[10px] ml-1.5" style={{ color: T.inkDim }}>nível {g.nivel}{g.nivel >= NIVEL_GUILD_MAX ? " · máximo" : ""}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl px-3 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                  <div className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>Cofre</div>
                  <div className="tv-mono text-xl font-semibold" style={{ color: T.amberSoft }}>◉ {g.cofre}</div>
                </div>
                <div className="rounded-xl px-3 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                  <div className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>Renda/dia</div>
                  <div className="tv-mono text-xl font-semibold" style={{ color: T.ok }}>+{rendaDia}</div>
                </div>
              </div>
              <div className="tv-body text-xs" style={{ color: T.inkDim }}>
                A renda cai no cofre a cada dia que passa na história (descanso longo ou passar o tempo). Suas moedas pessoais: ◉ {personagem.moedas}.
              </div>
              {/* CAIXA DA GUILDA (v9.2): a quantia é escolhida pelo jogador —
                  depositar uma fortuna de 25 em 25 era um castigo. */}
              {(() => {
                const val = Math.max(0, Math.floor(Number(valorCofre) || 0));
                const podeDep = val > 0 && val <= (personagem.moedas || 0);
                const podeSac = val > 0 && val <= (g.cofre || 0);
                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="number" inputMode="numeric" min="0" value={valorCofre}
                        onChange={(e) => setValorCofre(e.target.value.replace(/[^\d]/g, ""))}
                        placeholder="quanto?"
                        className="tv-mono text-sm px-3 py-2 rounded-lg flex-1 min-w-0"
                        style={{ background: T.bg, border: `1px solid ${T.line}`, color: T.ink }} />
                      <button onClick={() => setValorCofre(String(personagem.moedas || 0))} className="tv-mono text-[10px] px-2 py-2 rounded-lg shrink-0" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>tudo que tenho</button>
                      <button onClick={() => setValorCofre(String(g.cofre || 0))} className="tv-mono text-[10px] px-2 py-2 rounded-lg shrink-0" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>todo o cofre</button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { depositarCofre(val); setValorCofre(""); }} disabled={!podeDep} className="flex-1 tv-mono text-[11px] px-2 py-2 rounded-lg" style={{ border: `1px solid ${T.amber}`, color: T.amberSoft, opacity: podeDep ? 1 : 0.4 }}>↓ depositar{val ? ` ◉ ${val}` : ""}</button>
                      <button onClick={() => { sacarCofre(val); setValorCofre(""); }} disabled={!podeSac} className="flex-1 tv-mono text-[11px] px-2 py-2 rounded-lg" style={{ border: `1px solid ${T.line}`, color: T.ink, opacity: podeSac ? 1 : 0.4 }}>↑ sacar{val ? ` ◉ ${val}` : ""}</button>
                    </div>
                  </div>
                );
              })()}
              {custo != null ? (
                <button onClick={melhorarGuilda} disabled={g.cofre < custo} className="w-full tv-mono text-xs px-3 py-2.5 rounded-lg" style={{ background: g.cofre >= custo ? T.amber : T.panelSoft, color: g.cofre >= custo ? T.onAccent : T.inkDim, border: `1px solid ${T.amber}`, fontWeight: 600, opacity: g.cofre >= custo ? 1 : 0.5 }}>
                  ⚒ melhorar guilda para o nível {g.nivel + 1} · ◉ {custo} do cofre
                </button>
              ) : (
                <div className="tv-body text-xs italic text-center" style={{ color: T.amberSoft }}>Sua guilda é lendária — nível máximo alcançado.</div>
              )}
              <div className="tv-body text-xs" style={{ color: T.inkDim }}>
                Cada nível rende contratos maiores e melhora a administração dos domínios (+25% de renda por nível — nível {NIVEL_GUILD_MAX} dobra tudo).
              </div>
            </>
          );
        })()}

        {aba === "gestao" && subGestao === "dominios" && (() => {
          const { porCidade, total } = rendaDominios(mapa, devocao);
          const g = guilda || { nivel: 1 };
          const temGuilda = !!faccaoJogador;
          const desperto = !!(divindade && divindade.despertar);
          if (!porCidade.length) {
            return <div className="tv-body text-sm italic text-center py-10" style={{ color: T.inkDim }}>Nenhum domínio ainda. Conquiste ou funde cidades na história — cada uma que passar para a sua bandeira aparece aqui, produzindo renda todos os dias.</div>;
          }
          return (
            <>
              <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
                <span className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.inkDim }}>Renda total/dia</span>
                <span className="tv-mono text-xl font-semibold" style={{ color: T.ok }}>+{Math.round(total * (temGuilda ? multGuilda(g.nivel) : 1))}</span>
              </div>
              <div className="space-y-2">
                {porCidade.map((c) => {
                  const v = (reino || {})[c.nome];
                  const fel = v ? v.felicidade : null;
                  const corFel = fel == null ? T.inkDim : fel >= 70 ? T.ok : fel >= 40 ? T.amberSoft : T.danger;
                  /* TEMPLOS (v8.9): a construção que ancora a fé nesta cidade */
                  const cidadeMapa = ((mapa && mapa.cidades) || []).find((x) => x.nome === c.nome);
                  const nivelT = temploDaCidade(devocao, c.nome);
                  const tAtual = temploDe(nivelT);
                  const est = cidadeMapa && desperto ? estadoFe(cidadeMapa, devocao) : null;
                  const chk = desperto ? podeErguerTemplo({ cidade: cidadeMapa, devocao, divindade, cofre: g.cofre || 0 }) : null;
                  const alvo = chk && chk.alvo;
                  return (
                    <div key={c.nome} className="rounded-xl px-3 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="tv-body text-sm truncate" style={{ color: T.ink }}>{tAtual ? `${tAtual.icone} ` : ""}{c.nome} {c.sede && <span className="tv-mono text-[9px]" style={{ color: T.amberSoft }}>· SEDE</span>}</div>
                          <div className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: T.inkDim }}>{c.tipo}{v ? ` · ${v.populacao.toLocaleString("pt-BR")} almas` : ""}</div>
                          {fel != null && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: T.panel }}>
                                <div className="h-full rounded-full" style={{ width: `${fel}%`, background: corFel }} />
                              </div>
                              <span className="tv-mono text-[9px] shrink-0" style={{ color: corFel }}>{fel >= 70 ? "😊" : fel >= 40 ? "😐" : "😠"} {fel}</span>
                            </div>
                          )}
                          {est && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: T.panel }}>
                                <div className="h-full rounded-full" style={{ width: `${Math.round(c.fe)}%`, background: est.cor }} />
                              </div>
                              <span className="tv-mono text-[9px] shrink-0" style={{ color: est.cor }}>{est.icone} {Math.round(c.fe)}%</span>
                            </div>
                          )}
                        </div>
                        <span className="tv-mono text-sm shrink-0" style={{ color: T.ok }}>+{Math.round(c.renda * (temGuilda ? multGuilda(g.nivel) : 1) * (v ? fatorFelicidade(v.felicidade) : 1))}/dia</span>
                      </div>
                      {desperto && (
                        <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${T.line}` }}>
                          {tAtual && <div className="tv-body text-[11px] mb-1" style={{ color: T.violetSoft }}>{tAtual.icone} {tAtual.nome} — +{tAtual.feDia.toFixed(1)}% de fé e +{tAtual.pf} PF por dia, felicidade de equilíbrio +{tAtual.felicidade}.</div>}
                          {alvo ? (
                            <button onClick={() => onErguerTemplo && onErguerTemplo(c.nome)} disabled={!chk.pode}
                              className="w-full tv-mono text-[10px] px-3 py-2 rounded-lg"
                              style={{ background: chk.pode ? T.violet : T.panel, color: chk.pode ? "#14101F" : T.inkDim, border: `1px solid ${chk.pode ? T.violet : T.line}`, fontWeight: 600, opacity: chk.pode ? 1 : 0.55 }}>
                              {alvo.icone} erguer {alvo.nome.toLowerCase()} · ◉ {alvo.custo} do cofre{chk.pode ? "" : ` — ${chk.motivo}`}
                            </button>
                          ) : (
                            <div className="tv-body text-[11px] italic" style={{ color: T.amberSoft }}>Catedral erguida — não há degrau acima deste.</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="tv-body text-xs" style={{ color: T.inkDim }}>
                Domínios rendem por tipo de cidade (vilas 5, cidades 12, capitais 25, fortalezas 15 — a sede rende o dobro).{temGuilda ? ` Sua guilda nível ${g.nivel} multiplica tudo por ${multGuilda(g.nivel).toFixed(2)}.` : " Fundar uma guilda multiplica essas rendas."} Cada domínio tem população e felicidade vivas: povo feliz produz até +50% de renda; povo revoltado, metade. A cada dia passado, o reino vive — colheitas, caravanas, pragas e murmúrios saem por tabela e chegam à ficção. Expanda na ficção: cada cidade conquistada entra aqui automaticamente.
                {desperto ? " Templos ancoram a sua fé na cidade: a devoção cresce todo dia, rende Pontos de Fé, segura a felicidade do povo mais alto e ainda soma até +25% de renda (dízimo e romaria). Sem templo, a fé daquele lugar míngua sozinha." : ""}
              </div>
            </>
          );
        })()}

        {aba === "gestao" && subGestao === "grupo" && (
          <>
            <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.inkDim }}>Grupo · {1 + (personagem.grupo || []).length} de {1 + MAX_COMPANHEIROS}</div>
            <CartaoMembro nome={personagem.nome} subtitulo={personagem.conceito} nivel={personagem.nivel} vida={personagem.vida} vidaMax={personagem.vidaMax} mana={personagem.mana} manaMax={personagem.manaMax} habilidades={personagem.habilidades} semente={sementeDe(personagem)} ehVoce />
            {(personagem.grupo || []).length === 0 ? (
              <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Você viaja sozinho — por enquanto. Aliados podem se juntar a você.</div>
            ) : (personagem.grupo || []).map((m, i) => (
              <div key={i}>
                <CartaoMembro nome={m.nome} subtitulo={[m.conceito, m.classe, m.subclasse].filter(Boolean).join(" · ")} nivel={m.nivel} vida={m.vida} vidaMax={m.vidaMax} descricao={m.descricao} habilidades={m.habilidades} semente={sementeDe(m)} xpComp={m.xp || 0} vinculo={m.vinculo ?? VINCULO_INICIAL} />
                <div className="flex flex-wrap gap-1 mt-1">
                  <button onClick={() => setAbrirCaminho(abrirCaminho === m.nome ? null : m.nome)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.violetSoft }}>
                    {m.classe ? "⚔ trilhar novo caminho" : "⚔ definir caminho"}
                  </button>
                  <button onClick={() => setConfirmarRemover(confirmarRemover === m.nome ? null : m.nome)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>
                    ✕ remover
                  </button>
                </div>
                {confirmarRemover === m.nome && (
                  <div className="rounded-lg p-2 mt-1 flex items-center justify-between gap-2" style={{ background: T.panelSoft, border: `1px solid ${T.danger}` }}>
                    <span className="tv-body text-xs" style={{ color: T.inkDim }}>Remover {m.nome} do grupo?</span>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { removerDoGrupo(m.nome); setConfirmarRemover(null); }} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ background: T.danger, color: "#fff" }}>remover</button>
                      <button onClick={() => setConfirmarRemover(null)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>cancelar</button>
                    </div>
                  </div>
                )}
                {abrirCaminho === m.nome && <SeletorCaminho mundo={mundo} alvo={m.nome} atual={m} acampado={acampado} trocarCaminho={trocarCaminho} fechar={() => setAbrirCaminho(null)} />}
              </div>
            ))}
          </>
        )}

        {aba === "inv" && (
          <>
            {(personagem.grupo || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {[{ id: "eu", rotulo: personagem.nome || "Você" }, ...(personagem.grupo || []).map((g) => ({ id: g.nome, rotulo: g.nome }))].map((op) => (
                  <button key={op.id} onClick={() => setInvDe(op.id)} className="tv-mono text-[10px] px-2.5 py-1.5 rounded-full" style={{ background: invDe === op.id ? T.amber : T.panelSoft, color: invDe === op.id ? T.onAccent : T.inkDim, border: `1px solid ${invDe === op.id ? T.amber : T.line}`, fontWeight: 600 }}>{op.rotulo}</button>
                ))}
              </div>
            )}
            {invDe !== "eu" ? (() => {
              const comp = (personagem.grupo || []).find((g) => g.nome === invDe);
              if (!comp) return <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Personagem não encontrado.</div>;
              const equipadosComp = comp.equipados || {};
              const ehEquipRaw = (raw) => raw && typeof raw === "object" && raw.tipo && raw.raridade;
              const mochilaEquip = [...(comp.equipamento || []), ...(comp.inventario || []).filter(ehEquipRaw)];
              const itensComuns = (comp.inventario || []).filter((raw) => !ehEquipRaw(raw));
              return (
                <>
                  {/* Equipado pelo companheiro */}
                  <div>
                    <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>{comp.nome} · equipado</div>
                    {Object.keys(equipadosComp).length === 0 ? (
                      <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Nada equipado. Dê um equipamento e toque em "equipar" — os bônus já valem no combate.</div>
                    ) : (
                      <div className="space-y-2">
                        {SLOTS_ORDEM.filter((s) => equipadosComp[s]).map((slot) => {
                          const it = equipadosComp[slot];
                          return (
                            <div key={slot} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${RARIDADE_COR[it.raridade] || T.line}` }}>
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="tv-body text-sm truncate" style={{ color: T.ink }}>{it.nome}</div>
                                  <div className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: RARIDADE_COR[it.raridade] || T.inkDim }}>{SLOT_ROTULO[it.tipo] || it.tipo} · {it.raridade}</div>
                                </div>
                                <button onClick={() => desequiparComp(comp.nome, slot)} className="tv-mono text-[10px] px-2 py-1 rounded shrink-0" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>tirar</button>
                              </div>
                              {(it.atributos && Object.keys(it.atributos).length > 0) && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {Object.entries(it.atributos).map(([k, v]) => (
                                    <span key={k} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: T.panel, color: T.ok }}>+{v} {k === "dano" ? "DANO" : k === "defesa" ? "DEF" : (ATRIBUTOS.find((a) => a.id === k)?.nome || k).slice(0, 3).toUpperCase()}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Mochila de equipamentos do companheiro */}
                  <div>
                    <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Equipamentos de {comp.nome}</div>
                    {mochilaEquip.length === 0 ? <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Nenhum equipamento. Use "dar…" na sua mochila para passar um item bom para ele(a).</div> : (
                      <div className="space-y-2">
                        {mochilaEquip.map((it, i) => (
                          <div key={i} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className="tv-body text-sm truncate" style={{ color: T.ink }}>{it.nome}</div>
                                <div className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: RARIDADE_COR[it.raridade] || T.inkDim }}>{SLOT_ROTULO[it.tipo] || it.tipo} · {it.raridade}</div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => desmontarEquip(comp.nome, it.nome)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }} title={`Desmontar → +${essenciaDe(it)} essência`}>⚒</button>
                                <button onClick={() => transferirItem(comp.nome, "eu", "inventario", it.nome)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>← pegar</button>
                                <button onClick={() => equiparComp(comp.nome, it)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>equipar</button>
                              </div>
                            </div>
                            {(it.atributos && Object.keys(it.atributos).length > 0) && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {Object.entries(it.atributos).map(([k, v]) => (
                                  <span key={k} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: T.panel, color: T.ok }}>+{v} {k === "dano" ? "DANO" : k === "defesa" ? "DEF" : (ATRIBUTOS.find((a) => a.id === k)?.nome || k).slice(0, 3).toUpperCase()}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Itens comuns do companheiro */}
                  <div>
                    <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Bolsa de {comp.nome}</div>
                    {itensComuns.length === 0 ? <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Bolsos vazios.</div> : (
                      <ul className="space-y-2">
                        {itensComuns.map((raw, i) => {
                          const nomeIt = typeof raw === "string" ? raw : (raw && raw.nome) || "item";
                          const desc = typeof raw === "object" && raw ? (raw.descricao || "") : "";
                          return (
                            <li key={i} className="rounded-lg px-3 py-2.5" style={{ background: T.panelSoft }}>
                              <div className="tv-body text-sm flex items-center gap-2.5" style={{ color: T.ink }}>
                                <span style={{ color: T.amber }}>◆</span>
                                <span className="flex-1 min-w-0">{nomeIt}</span>
                                <button onClick={() => transferirItem(comp.nome, "eu", "inventario", nomeIt)} className="tv-mono text-[10px] px-2 py-1 rounded shrink-0" style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>← pegar</button>
                              </div>
                              {desc && <div className="tv-body text-xs mt-1 italic" style={{ color: T.inkDim, paddingLeft: "22px" }}>{desc}</div>}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </>
              );
            })() : (
            <>
            <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
              <span className="tv-mono text-xs uppercase tracking-widest" style={{ color: T.inkDim }}>Moedas</span>
              <span className="tv-mono text-xl font-semibold" style={{ color: T.amberSoft }}>◉ {personagem.moedas}</span>
            </div>

            {/* Equipado */}
            <div>
              <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Equipado</div>
              {Object.keys(equipados).length === 0 ? (
                <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Nada equipado. Equipe itens abaixo para ganhar bônus.</div>
              ) : (
                <div className="space-y-2">
                  {SLOTS_ORDEM.filter((s) => equipados[s]).map((slot) => {
                    const it = equipados[slot];
                    return (
                      <div key={slot} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${RARIDADE_COR[it.raridade] || T.line}` }}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="tv-body text-sm truncate" style={{ color: T.ink }}>{it.nome}</div>
                            <div className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: RARIDADE_COR[it.raridade] || T.inkDim }}>{SLOT_ROTULO[it.tipo] || it.tipo} · {it.raridade}</div>
                          </div>
                          <button onClick={() => desequipar(slot)} className="tv-mono text-[10px] px-2 py-1 rounded shrink-0" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>tirar</button>
                        </div>
                        {(it.atributos && Object.keys(it.atributos).length > 0) && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {Object.entries(it.atributos).map(([k, v]) => (
                              <span key={k} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: T.panel, color: T.ok }}>+{v} {(ATRIBUTOS.find((a) => a.id === k)?.nome || k).slice(0, 3).toUpperCase()}</span>
                            ))}
                          </div>
                        )}
                        {it.poder && <div className="tv-body text-xs mt-2" style={{ color: T.violetSoft }}>✦ {it.poder}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Equipamentos disponíveis */}
            {equipDisponivel.length > 0 && (
              <div>
                <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Equipamentos na mochila</div>
                <div className="space-y-2">
                  {equipDisponivel.map((it, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="tv-body text-sm truncate" style={{ color: T.ink }}>{it.nome}</div>
                          <div className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: RARIDADE_COR[it.raridade] || T.inkDim }}>{SLOT_ROTULO[it.tipo] || it.tipo} · {it.raridade}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">{(personagem.grupo || []).length > 0 && (
                          <select value="" onChange={(e) => { if (e.target.value) transferirItem("eu", e.target.value, "equipamento", it.nome); }} className="tv-mono text-[10px] rounded px-1 py-1" style={{ background: T.panel, color: T.violetSoft, border: `1px solid ${T.line}` }}>
                            <option value="">dar…</option>
                            {(personagem.grupo || []).map((g) => <option key={g.nome} value={g.nome}>{g.nome}</option>)}
                          </select>
                        )}<button onClick={() => desmontarEquip("eu", it.nome)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }} title={`Desmontar → +${essenciaDe(it)} ⚗ essência`}>⚒</button><button onClick={() => descartarEquip(it.nome)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }} title="Descartar">✕</button><button onClick={() => equipar(it)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>equipar</button></div>
                      </div>
                      {(it.atributos && Object.keys(it.atributos).length > 0) && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {Object.entries(it.atributos).map(([k, v]) => (
                            <span key={k} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: T.panel, color: T.ok }}>+{v} {(ATRIBUTOS.find((a) => a.id === k)?.nome || k).slice(0, 3).toUpperCase()}</span>
                          ))}
                        </div>
                      )}
                      {it.poder && <div className="tv-body text-xs mt-2" style={{ color: T.violetSoft }}>✦ {it.poder}</div>}
                      {it.descricao && <div className="tv-body text-xs mt-1 italic" style={{ color: T.inkDim }}>{it.descricao}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Forja — fabricação básica por código */}
            <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="tv-mono text-xs uppercase tracking-widest" style={{ color: T.amberSoft }}>⚒ Forja</div>
                <div className="tv-mono text-[11px]" style={{ color: T.violetSoft }}>⚗ {personagem.essencia || 0} essência</div>
              </div>
              {!forjaAberta ? (
                <>
                  <div className="tv-body text-[11px] mb-2" style={{ color: T.inkDim }}>Desmonte equipamentos (botão ⚒) para ganhar essência e forje peças novas — o item sai pela tabela, na hora, sem gastar tokens.</div>
                  <button onClick={() => setForjaAberta(true)} className="w-full tv-mono text-[11px] px-3 py-2 rounded-lg" style={{ border: `1px solid ${T.amber}`, color: T.amberSoft }}>abrir a forja</button>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select value={forjaSlot} onChange={(e) => setForjaSlot(e.target.value)} className="flex-1 tv-mono text-[11px] rounded-lg px-2 py-2 outline-none" style={{ background: T.panel, color: T.ink, border: `1px solid ${T.line}` }}>
                      {SLOTS_ORDEM.map((s) => <option key={s} value={s}>{SLOT_ROTULO[s] || s}</option>)}
                    </select>
                    <button onClick={() => setForjaAberta(false)} className="tv-mono text-[11px] px-2 rounded-lg" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>✕</button>
                  </div>
                  {RARIDADES.map((rar) => {
                    const c = CUSTO_FORJA[rar];
                    const okE = (personagem.essencia || 0) >= c.essencia, okM = (personagem.moedas || 0) >= c.moedas;
                    return (
                      <button key={rar} onClick={() => { forjar(forjaSlot, rar); }} disabled={!okE || !okM}
                        className="w-full rounded-lg px-3 py-2 flex items-center justify-between"
                        style={{ border: `1px solid ${RARIDADE_COR[rar] || T.line}`, color: RARIDADE_COR[rar] || T.ink, opacity: okE && okM ? 1 : 0.45 }}>
                        <span className="tv-mono text-[11px] font-semibold">{RARIDADE_ROTULO[rar]}</span>
                        <span className="tv-mono text-[10px]">⚗ {c.essencia}{c.moedas ? ` · ◉ ${c.moedas}` : ""}</span>
                      </button>
                    );
                  })}
                  <div className="tv-body text-[10px] italic" style={{ color: T.inkDim }}>O item forjado cai na mochila de equipamentos — equipe você ou passe para o grupo.</div>
                </div>
              )}
            </div>

            {/* Bolsa (itens comuns) */}
            <div>
              <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Bolsa</div>
              {personagem.inventario.length === 0 ? <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Bolsos vazios — explore, negocie ou saqueie.</div> : (
                <ul className="space-y-2">
                  {Object.values(personagem.inventario.reduce((acc, raw) => {
                    const nome = typeof raw === "string" ? raw : (raw && raw.nome) || "item";
                    const descricao = typeof raw === "object" && raw ? (raw.descricao || "") : "";
                    if (!acc[nome]) acc[nome] = { nome, descricao, qtd: 0 };
                    if (descricao && !acc[nome].descricao) acc[nome].descricao = descricao;
                    acc[nome].qtd++; return acc;
                  }, {})).map((it, i) => {
                    const cons = comoConsumivel(it.nome);
                    return (
                    <li key={i} className="rounded-lg px-3 py-2.5" style={{ background: T.panelSoft }}>
                      <div className="tv-body text-sm flex items-center gap-2.5" style={{ color: T.ink }}>
                        <span style={{ color: T.amber }}>{cons ? cons.icone : "◆"}</span>
                        <span className="flex-1 min-w-0">{it.nome}{it.qtd > 1 ? <span className="tv-mono text-[10px]" style={{ color: T.amberSoft }}> ×{it.qtd}</span> : null}</span>
                        {cons && onUsarConsumivel && (
                          <button onClick={() => onUsarConsumivel(it.nome)} className="tv-mono text-[10px] px-2 py-1 rounded shrink-0" style={{ background: T.violet, color: "#14101F", fontWeight: 600 }} title={descricaoCurta(cons)}>usar</button>
                        )}
                        {(personagem.grupo || []).length > 0 && (
                          <select value="" onChange={(e) => { if (e.target.value) transferirItem("eu", e.target.value, "inventario", it.nome); }} className="tv-mono text-[10px] rounded px-1 py-1 shrink-0" style={{ background: T.panel, color: T.violetSoft, border: `1px solid ${T.line}` }}>
                            <option value="">dar…</option>
                            {(personagem.grupo || []).map((g) => <option key={g.nome} value={g.nome}>{g.nome}</option>)}
                          </select>
                        )}
                        <button onClick={() => descartarItem(it.nome)} className="tv-mono text-[10px] px-2 py-1 rounded shrink-0" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>soltar</button>
                      </div>
                      {cons && <div className="tv-mono text-[10px] mt-1" style={{ color: T.violetSoft, paddingLeft: "22px" }}>{descricaoCurta(cons)}</div>}
                      {it.descricao && <div className="tv-body text-xs mt-1 italic" style={{ color: T.inkDim, paddingLeft: "22px" }}>{it.descricao}</div>}
                    </li>
                    );
                  })}
                </ul>
              )}
            </div>
            </>
            )}
          </>
        )}
      </aside>
    </>
  );
}

function PainelCombate({ combate, onEncerrarTurno, nGolpes = 1, alvosGolpe = [], onDeclararAlvo, onLimparAlvos, acaoTexto = "", pocoes = [], onUsarConsumivel }) {
  if (!combate || !combate.inimigos || combate.inimigos.length === 0) return null;
  const eco = combate.economia || { acao: 1, extra: 1 };
  const chipMov = (ativo, rotulo) => (
    <span className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${ativo ? T.amber : T.line}`, color: ativo ? T.amberSoft : T.inkDim, opacity: ativo ? 1 : 0.45, textDecoration: ativo ? "none" : "line-through" }}>{rotulo}</span>
  );
  return (
    <div className="tv-fade mx-4 md:mx-8 mt-1 mb-3 rounded-2xl p-3" style={{ background: T.panel, border: `1px solid ${T.danger}`, marginRight: "68px" }}>
      <div className="tv-mono text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5 flex-wrap" style={{ color: T.danger }}>
        <span>⚔ Em combate</span>
        <span style={{ color: T.inkDim }}>· {combate.inimigos.filter((e) => !e.derrotado).length} de pé</span>
        <span className="flex items-center gap-1 ml-auto normal-case tracking-normal">
          {chipMov(eco.acao > 0, "⚔ ação")}
          {chipMov(eco.extra > 0, "✦ extra")}
          {onEncerrarTurno && (
            <button onClick={onEncerrarTurno} title="Passa a vez: os inimigos agem e a nova rodada começa" className="tv-mono text-[9px] px-2 py-0.5 rounded-full" style={{ background: T.panelSoft, border: `1px solid ${T.line}`, color: T.inkDim }}>
              ⏭ encerrar turno
            </button>
          )}
        </span>
      </div>
      {/* POÇÕES À MÃO (v9.2): beber é ação bônus — dá para tomar e atacar
          no mesmo turno, sem abrir a bolsa no meio da luta. */}
      {(pocoes || []).length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          <span className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>à mão</span>
          {pocoes.map((p) => (
            <button key={p.nome} onClick={() => onUsarConsumivel && onUsarConsumivel(p.nome)} title={p.detalhe}
              className="tv-mono text-[10px] px-2 py-1 rounded-full" style={{ background: T.panelSoft, border: `1px solid ${T.violet}`, color: T.violetSoft }}>
              {p.icone} {p.curto}{p.qtd > 1 ? ` ×${p.qtd}` : ""}
            </button>
          ))}
          <span className="tv-mono text-[9px]" style={{ color: T.inkDim }}>· ação bônus</span>
        </div>
      )}
      {Array.isArray(combate.ordem) && combate.ordem.length > 0 && (
        <div className="rounded-xl p-2 mb-2" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
          <div className="tv-mono text-[9px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Ordem de iniciativa</div>
          <div className="flex items-center gap-1 flex-wrap">
            {combate.ordem.map((c, i) => {
              const caiu = (combate.inimigos || []).some((e) => e.nome === c.nome && (e.derrotado || e.vida <= 0));
              const cor = c.lado === "inimigo" ? T.danger : c.lado === "heroi" ? T.amber : T.violetSoft;
              return (
                <span key={c.nome + i} className="tv-mono text-[10px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${cor}`, color: cor, opacity: caiu ? 0.35 : 1, textDecoration: caiu ? "line-through" : "none" }}>
                  {c.iniciativa} {c.nome}
                </span>
              );
            })}
          </div>
        </div>
      )}
      {nGolpes > 1 && combate.inimigos.filter((e) => !e.derrotado).length > 1 && (
        <div className="rounded-xl p-2.5 mb-2" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.amberSoft }}>
              Declare seus {nGolpes} golpes{acaoTexto ? ` · ${acaoTexto}` : ""}
            </span>
            {alvosGolpe.length > 0 && (
              <button onClick={onLimparAlvos} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>limpar</button>
            )}
          </div>
          <div className="space-y-1.5">
            {Array.from({ length: nGolpes }).map((_, gi) => (
              <div key={gi} className="flex items-center gap-1.5 flex-wrap">
                <span className="tv-mono text-[9px] shrink-0 w-12" style={{ color: T.inkDim }}>golpe {gi + 1}</span>
                {combate.inimigos.filter((e) => !e.derrotado).map((e) => {
                  const escolhido = alvosGolpe[gi] === e.nome;
                  return (
                    <button key={e.nome} onClick={() => onDeclararAlvo && onDeclararAlvo(gi, escolhido ? null : e.nome)}
                      className="tv-mono text-[9px] px-2 py-1 rounded-full"
                      style={{ background: escolhido ? T.danger : "transparent", color: escolhido ? "#fff" : T.inkDim, border: `1px solid ${escolhido ? T.danger : T.line}` }}>
                      {e.nome}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="tv-body text-[10px] mt-1.5" style={{ color: T.inkDim }}>Sem escolha, os golpes vão no alvo que você citar na ação. Se o alvo cair no meio da sequência, o golpe seguinte migra sozinho.</div>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-2">
        {combate.inimigos.map((e, i) => (
          <div key={i} className="rounded-xl p-2.5" style={{ background: T.panelSoft, border: `1px solid ${e.derrotado ? T.line : T.danger}`, opacity: e.derrotado ? 0.5 : 1 }}>
            <div className="flex items-center gap-2.5">
              <div style={{ filter: e.derrotado ? "grayscale(1)" : "none" }}><Retrato semente={sementeDe(e)} tamanho={40} anel={e.derrotado ? T.line : T.danger} estado={estadoDe(e.vida, e.vidaMax, true)} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="tv-display text-lg leading-tight truncate" style={{ color: e.derrotado ? T.inkDim : T.ink, textDecoration: e.derrotado ? "line-through" : "none" }}>{e.nome}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(e.nivel != null) && <span className="tv-mono text-[9px] px-1 py-0.5 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>nv {e.nivel}</span>}
                    {(e.gd || 0) > 0 && <span className="tv-mono text-[9px] px-1 py-0.5 rounded" title={`${tituloDe(e.gd)}`} style={{ border: `1px solid ${T.amber}`, color: T.amber }}>GD {e.gd}</span>}
                    {e.derrotado && <span className="tv-mono text-[9px] uppercase" style={{ color: T.inkDim }}>☠</span>}
                  </div>
                </div>
                {!e.derrotado && <div className="mt-1"><BarraMini rotulo="PV" atual={e.vida} max={e.vidaMax} cor={T.danger} corBaixa={T.danger} /></div>}
              </div>
            </div>
            {!e.derrotado && e.ameaca && <div className="tv-body text-xs mt-1.5 italic" style={{ color: T.inkDim }}>{e.ameaca}</div>}
          </div>
        ))}
      </div>
      {(combate.log || []).length > 0 && (
        <div className="mt-2 pt-2 space-y-0.5" style={{ borderTop: `1px solid ${T.line}` }}>
          {combate.log.map((l, i) => (
            <div key={i} className="tv-mono text-[10px]" style={{ color: T.inkDim, opacity: 0.5 + (0.5 * (i + 1)) / combate.log.length }}>🎲 {l}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function PainelHabilidades({ personagem, selecionar, fechar }) {
  const [busca, setBusca] = React.useState("");
  const todas = (personagem.habilidades || []).filter((h) => h && h.nome);
  const normal = (x) => (x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const lista = busca ? todas.filter((h) => normal(h.nome).includes(normal(busca)) || normal(h.descricao).includes(normal(busca))) : todas;
  const muitas = todas.length > 6;
  return (
    <div className="tv-fade mx-4 md:mx-8 mb-2 rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.violet}`, marginRight: "68px" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="tv-mono text-xs uppercase tracking-widest" style={{ color: T.violetSoft }}>Habilidades · {personagem.mana}/{personagem.manaMax} PM · {todas.length}</div>
        <button onClick={fechar} className="tv-mono text-sm px-1.5" style={{ color: T.inkDim }}>✕</button>
      </div>
      {muitas && (
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar habilidade…"
          className="w-full rounded-lg px-3 py-2 mb-3 tv-body text-sm outline-none" style={{ background: T.panelSoft, border: `1px solid ${T.line}`, color: T.ink }} />
      )}
      {todas.length === 0 ? (
        <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Você ainda não despertou nenhuma habilidade. Elas virão com a história.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-2 tv-scroll" style={{ maxHeight: "38vh", overflowY: "auto" }}>
          {lista.map((h, i) => {
            const custo = Math.max(0, Number(h.custo) || 0);
            const semMana = personagem.mana < custo;
            const rec = (personagem.habRecarga || {})[(h.nome || "").toLowerCase()] || 0;
            const travada = semMana || rec > 0;
            return (
              <button key={i} onClick={() => !travada && selecionar(h)} disabled={travada} className="text-left rounded-xl p-3 transition-all"
                style={{ background: T.panelSoft, border: `1px solid ${travada ? T.line : T.violet}`, opacity: travada ? 0.45 : 1, cursor: travada ? "not-allowed" : "pointer" }}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="tv-display text-lg leading-none" style={{ color: T.ink }}>{h.nome}</span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    {rec > 0 && <span className="tv-mono text-[9px] px-1 py-0.5 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>⏳ {rec}t</span>}
                    <span className="tv-mono text-[10px]" style={{ color: semMana ? T.danger : T.violetSoft }}>{custo} PM</span>
                  </span>
                </div>
                <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{h.descricao}</div>
                {(() => { const r = h.recarga != null ? Math.max(0, Number(h.recarga) || 0) : recargaPadrao(custo); return r > 0 && rec === 0 ? <div className="tv-mono text-[9px] mt-1" style={{ color: T.inkDim }}>recarga: {r}t após o uso</div> : null; })()}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- Telas de criação ---------------- */

function TelaMundo({ concluir }) {
  const [nome, setNome] = useState("");
  const [genero, setGenero] = useState(null);
  const [descricao, setDescricao] = useState("");
  const [estrutura, setEstrutura] = useState("jornada");
  const campo = { background: T.panel, border: `1px solid ${T.line}`, color: T.ink };
  return (
    <div className="tv-fade max-w-2xl mx-auto w-full px-6 py-10 overflow-y-auto tv-scroll">
      <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.violetSoft }}>Passo 1 de 2 · O mundo</div>
      <h1 className="tv-display text-4xl md:text-5xl mb-3" style={{ color: T.ink }}>Que realidade vamos criar?</h1>
      <p className="tv-body mb-6" style={{ color: T.inkDim }}>Dê um nome à campanha, escolha um gênero e descreva o que quiser. O Mestre preenche o resto com detalhes vivos.</p>
      <div className="flex gap-2 mb-4">
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da campanha (ex.: A Maré de Ferro)" maxLength={40} className="flex-1 rounded-xl p-4 tv-body text-sm outline-none" style={campo} />
        {genero && <button type="button" onClick={() => setNome(`As Crônicas de ${nomeCidade(genero.label)}`)} className="rounded-xl px-4 shrink-0" style={{ border: `1px solid ${T.line}`, color: T.amberSoft }} title="Sortear um nome">🎲</button>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {GENEROS.map((g) => (
          <button key={g.id} onClick={() => setGenero(g)} className="text-left rounded-xl p-4 transition-all" style={{ background: genero?.id === g.id ? T.panelSoft : T.panel, border: `1px solid ${genero?.id === g.id ? T.amber : T.line}` }}>
            <div className="tv-display text-lg" style={{ color: genero?.id === g.id ? T.amberSoft : T.ink }}>{g.label}</div>
            <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{g.dica}</div>
          </button>
        ))}
      </div>
      <div className="tv-mono text-xs uppercase tracking-widest mb-2 mt-2" style={{ color: T.violetSoft }}>Estrutura da história</div>
      <p className="tv-body text-sm mb-3" style={{ color: T.inkDim }}>O arco que guiará a campanha — o Mestre segue essa espinha dramática, e as missões surgem dentro dela.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {ESTRUTURAS.map((e) => (
          <button key={e.id} onClick={() => setEstrutura(e.id)} className="text-left rounded-xl p-4 transition-all" style={{ background: estrutura === e.id ? T.panelSoft : T.panel, border: `1px solid ${estrutura === e.id ? T.amber : T.line}` }}>
            <div className="tv-display text-lg" style={{ color: estrutura === e.id ? T.amberSoft : T.ink }}>{e.nome}</div>
            <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{e.desc}</div>
            <div className="tv-mono text-[9px] mt-1.5 uppercase tracking-widest" style={{ color: T.violetSoft }}>{e.etapas.map((x) => x.nome).join(" → ")}</div>
          </button>
        ))}
      </div>
      <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} placeholder="Ex.: Um arquipélago flutuante onde a magia vem das marés. Piratas do céu disputam relíquias de um império afundado nas nuvens…" className="w-full rounded-xl p-4 tv-body text-sm outline-none resize-none" style={campo} />
      <div className="mt-6 flex justify-end">
        <Botao primario desativado={!genero || !nome.trim()} onClick={() => concluir({ genero: genero.label, descricao, estrutura }, nome.trim())}>Continuar →</Botao>
      </div>
    </div>
  );
}

function TelaPersonagem({ mundo, concluir }) {
  mundo = mundo || { genero: "Fantasia medieval" };
  const [nome, setNome] = useState("");
  const [conceito, setConceito] = useState("");
  const [historia, setHistoria] = useState("");
  const racasDisp = racasDoGenero(mundo.genero);
  const [raca, setRaca] = useState(racasDisp[0].nome);
  const [classe, setClasse] = useState(CLASSES[0].nome);
  const [subclasse, setSubclasse] = useState(CLASSES[0].subclasses[0].nome);
  const [profissao, setProfissao] = useState(PROFISSOES[0].nome);
  const [antecedenteId, setAntecedenteId] = useState(ANTECEDENTES[0].id);
  const antObj = antecedentePorId(antecedenteId);
  const [atributos, setAtributos] = useState(Object.fromEntries(ATRIBUTOS.map((a) => [a.id, 0])));
  const usados = Object.values(atributos).reduce((s, v) => s + v, 0);
  const restantes = PONTOS_TOTAIS - usados;
  const cObj = classePorNome(classe);
  const rObj = racaPorNome(raca);
  /* atributos finais = distribuídos + bônus racial */
  const attrFinais = Object.fromEntries(ATRIBUTOS.map((a) => [a.id, (atributos[a.id] || 0) + ((rObj?.bonus || {})[a.id] || 0)]));
  const vidaMax = (cObj?.vidaBase || 10) + attrFinais.vigor * 2;
  const manaMax = (cObj?.manaBase || 8) + attrFinais.intelecto * 2;
  const habsIniciais = habilidadesIniciais(classe).map((h) => ({ nome: h.nome, custo: h.custo, descricao: h.descricao }));
  const ajustar = (id, d) => {
    const nv = atributos[id] + d;
    if (nv < 0 || nv > ATRIBUTO_MAX_CRIACAO) return;
    if (d > 0 && restantes <= 0) return;
    setAtributos({ ...atributos, [id]: nv });
  };
  const campo = { background: T.panel, border: `1px solid ${T.line}`, color: T.ink };
  return (
    <div className="tv-fade max-w-2xl mx-auto w-full px-6 py-10 overflow-y-auto tv-scroll">
      <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.violetSoft }}>Passo 2 de 2 · O herói (ou não)</div>
      <h1 className="tv-display text-4xl md:text-5xl mb-3" style={{ color: T.ink }}>Quem entra nesse mundo?</h1>
      <p className="tv-body mb-8" style={{ color: T.inkDim }}>Mundo: <em style={{ color: T.amberSoft }}>{mundo.genero}</em>. Dê nome, conceito e distribua {PONTOS_TOTAIS} pontos.</p>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="flex gap-2">
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do personagem" className="flex-1 rounded-xl p-4 tv-body text-sm outline-none" style={campo} />
          <button type="button" onClick={() => setNome(nomePessoa(mundo.genero))} className="rounded-xl px-4 shrink-0" style={{ border: `1px solid ${T.line}`, color: T.amberSoft }} title="Sortear um nome">🎲</button>
        </div>
        <input value={conceito} onChange={(e) => setConceito(e.target.value)} placeholder="Conceito (ex.: ladra de relíquias arrependida)" className="rounded-xl p-4 tv-body text-sm outline-none" style={campo} />
      </div>
      <textarea value={historia} onChange={(e) => setHistoria(e.target.value)} rows={3} placeholder="História e segredos (opcional) — o Mestre vai usar isso contra e a favor de você…" className="w-full rounded-xl p-4 tv-body text-sm outline-none resize-none mb-6" style={campo} />

      <div className="grid md:grid-cols-2 gap-4 mb-2">
        <div>
          <div className="tv-mono text-xs uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>{["Ficção científica", "Cyberpunk", "Pós-apocalíptico"].includes(mundo.genero) ? "Origem" : "Raça"}</div>
          <select value={raca} onChange={(e) => setRaca(e.target.value)} className="w-full rounded-xl p-3 tv-body text-sm outline-none" style={campo}>
            {racasDisp.map((r) => <option key={r.nome} value={r.nome}>{r.nome}</option>)}
          </select>
          {rObj && <div className="tv-body text-xs mt-1.5" style={{ color: T.inkDim }}>{rObj.desc} <span style={{ color: T.amberSoft }}>{Object.entries(rObj.bonus).map(([k, v]) => `+${v} ${(ATRIBUTOS.find((a) => a.id === k) || {}).nome || k}`).join(", ")}</span></div>}
        </div>
        <div>
          <div className="tv-mono text-xs uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Profissão</div>
          <select value={profissao} onChange={(e) => setProfissao(e.target.value)} className="w-full rounded-xl p-3 tv-body text-sm outline-none" style={campo}>
            {PROFISSOES.map((pr) => <option key={pr.nome} value={pr.nome}>{pr.nome}</option>)}
          </select>
          {(() => { const pr = PROFISSOES.find((x) => x.nome === profissao); return pr ? <div className="tv-body text-xs mt-1.5" style={{ color: T.inkDim }}>{pr.beneficio}</div> : null; })()}
        </div>
      </div>

      <div className="mb-6">
        <div className="tv-mono text-xs uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Antecedente · quem você era antes</div>
        <select value={antecedenteId} onChange={(e) => setAntecedenteId(e.target.value)} className="w-full rounded-xl p-3 tv-body text-sm outline-none" style={campo}>
          {ANTECEDENTES.map((a) => <option key={a.id} value={a.id}>{a.icone} {a.nome}</option>)}
        </select>
        <div className="rounded-xl p-3 mt-1.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
          <div className="tv-body text-xs" style={{ color: T.ink }}>{antObj.desc}</div>
          <div className="tv-body text-[11px] italic mt-1" style={{ color: T.inkDim }}>🎭 Gancho: {antObj.gancho}</div>
          <div className="tv-mono text-[10px] mt-1.5" style={{ color: T.amberSoft }}>
            {[antObj.item ? `◆ ${antObj.item}` : null, antObj.pv ? `+${antObj.pv} PV` : null, antObj.pm ? `+${antObj.pm} PM` : null, antObj.moedas ? `+${antObj.moedas} moedas` : null].filter(Boolean).join("  ·  ") || "—"}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="tv-mono text-xs uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Classe</div>
          <select value={classe} onChange={(e) => { setClasse(e.target.value); setSubclasse(classePorNome(e.target.value).subclasses[0].nome); }} className="w-full rounded-xl p-3 tv-body text-sm outline-none" style={campo}>
            {CLASSES.map((c) => <option key={c.nome} value={c.nome}>{c.nome}</option>)}
          </select>
          {cObj && <div className="tv-body text-xs mt-1.5" style={{ color: T.inkDim }}>{cObj.desc}</div>}
        </div>
        <div>
          <div className="tv-mono text-xs uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Caminho (subclasse)</div>
          <select value={subclasse} onChange={(e) => setSubclasse(e.target.value)} className="w-full rounded-xl p-3 tv-body text-sm outline-none" style={campo}>
            {(cObj?.subclasses || []).map((sc) => <option key={sc.nome} value={sc.nome}>{sc.nome}</option>)}
          </select>
          {(() => { const sc = (cObj?.subclasses || []).find((x) => x.nome === subclasse); return sc ? <div className="tv-body text-xs mt-1.5" style={{ color: T.inkDim }}>{sc.desc} <span style={{ color: T.violetSoft }}>Especializações: {sc.especializacoes.join(" · ")}</span></div> : null; })()}
        </div>
      </div>

      {habsIniciais.length > 0 && (
        <div className="rounded-xl p-3 mb-6" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
          <div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.violetSoft }}>Habilidades iniciais de {classe}</div>
          <div className="tv-body text-xs" style={{ color: T.inkDim }}>{habsIniciais.map((h) => `${h.nome} (${h.custo} PM)`).join(" · ")}</div>
        </div>
      )}
      <div className="flex items-baseline justify-between mb-3">
        <div className="tv-mono text-xs uppercase tracking-widest" style={{ color: T.inkDim }}>Atributos (0 a +{ATRIBUTO_MAX_CRIACAO})</div>
        <div className="tv-mono text-sm" style={{ color: restantes === 0 ? T.ok : T.amber }}>{restantes} ponto{restantes !== 1 ? "s" : ""} restante{restantes !== 1 ? "s" : ""}</div>
      </div>
      <div className="grid md:grid-cols-2 gap-3 mb-6">
        {ATRIBUTOS.map((a) => (
          <div key={a.id} className="rounded-xl p-4 flex items-center justify-between gap-3" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
            <div><div className="tv-display text-lg leading-none" style={{ color: T.ink }}>{a.nome}</div><div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{a.desc}</div></div>
            <div className="flex items-center gap-2">
              <Botao pequeno onClick={() => ajustar(a.id, -1)}>−</Botao>
              <span className="tv-mono w-8 text-center font-semibold" style={{ color: T.amber }}>+{atributos[a.id]}</span>
              <Botao pequeno onClick={() => ajustar(a.id, 1)}>+</Botao>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="tv-mono text-xs" style={{ color: T.inkDim }}>PV: <span style={{ color: T.ink }}>{vidaMax}</span> · PM: <span style={{ color: T.violetSoft }}>{manaMax}</span> · Moedas: <span style={{ color: T.amberSoft }}>{MOEDAS_INICIAIS}</span></div>
        <Botao primario desativado={!nome.trim() || !conceito.trim() || restantes !== 0}
          onClick={() => concluir({
            nome: nome.trim(), conceito: conceito.trim(), historia: historia.trim(),
            raca, classe, subclasse, profissao,
            antecedente: antObj.nome, antecedenteGancho: antObj.gancho,
            semente: `${nome.trim()}|${conceito.trim()}|${Math.floor(Math.random() * 100000)}`,
            atributos: attrFinais, vida: vidaMax + (antObj.pv || 0), vidaMax: vidaMax + (antObj.pv || 0), mana: manaMax + (antObj.pm || 0), manaMax: manaMax + (antObj.pm || 0),
            nivel: 1, xp: 0, moedas: MOEDAS_INICIAIS + (antObj.moedas || 0), nivelPendentes: 0,
            inventario: antObj.item ? [antObj.item] : [], habilidades: habsIniciais, grupo: [],
            efeitos: [], condicoes: [], equipamento: [], equipados: {},
          })}>Começar aventura →</Botao>
      </div>
    </div>
  );
}

function TelaMenu({ irNovo, continuar, temSave }) {
  return (
    <div className="tv-fade flex-1 flex flex-col items-center justify-center px-6 py-10">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4"><IconeCaneca tamanho={52} cor={T.amber} /></div>
        <h1 className="tv-display text-6xl md:text-7xl tracking-wide" style={{ color: T.ink }}>{BRAND}</h1>
        <p className="tv-mono text-xs uppercase tracking-[0.3em] mt-2" style={{ color: T.inkDim }}>{SLOGAN}</p>
        <p className="tv-mono text-[9px] uppercase tracking-[0.2em] mt-3" style={{ color: T.amberSoft }}>v8.9 · economia de ação</p>
      </div>
      <div className="grid gap-4 w-full max-w-sm">
        {temSave && (
          <button onClick={() => continuar(false)} className="text-left rounded-2xl p-5 flex flex-col gap-1" style={{ background: T.panel, border: `1px solid ${T.amber}` }}>
            <div className="tv-display text-2xl" style={{ color: T.amberSoft }}>Continuar aventura</div>
            <div className="tv-body text-sm" style={{ color: T.inkDim }}>{temSave.nomeCampanha} · {temSave.personagem?.nome} · Nível {temSave.personagem?.nivel}</div>
          </button>
        )}
        {temSave && (
          <button onClick={() => continuar(true)} className="text-left rounded-2xl p-4 flex items-center gap-2" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
            <span style={{ color: T.amberSoft }}>📜</span>
            <span className="tv-body text-sm" style={{ color: T.ink }}>Continuar com resumo <span style={{ color: T.inkDim }}>— "Anteriormente, em…"</span></span>
          </button>
        )}
        <button onClick={irNovo} className="text-left rounded-2xl p-5 flex flex-col gap-1" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
          <div className="tv-display text-2xl" style={{ color: T.ink }}>{temSave ? "Nova campanha" : "Começar a jogar"}</div>
          <div className="tv-body text-sm" style={{ color: T.inkDim }}>Você, o Mestre e um mundo inteiro por criar</div>
        </button>
      </div>
      {temSave && <p className="tv-body text-xs mt-6" style={{ color: T.inkDim }}>Começar uma nova campanha substitui a anterior neste dispositivo.</p>}
    </div>
  );
}

/* ---------------- Aplicação de mudanças ---------------- */

/* regras do jogo extraídas para ./regras-jogo.js (v8.7) */

class LimiteErro extends React.Component {
  constructor(props) { super(props); this.state = { erro: null }; }
  static getDerivedStateFromError(erro) { return { erro }; }
  componentDidCatch(erro, info) { console.error("Taverna erro:", erro, info); }
  render() {
    if (this.state.erro) {
      return (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#0E0C15", zIndex: 100 }}>
          <div style={{ maxWidth: 420, textAlign: "center", color: "#E8E2D0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🍺</div>
            <div style={{ fontSize: 20, marginBottom: 8 }}>Algo tropeçou na taverna</div>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 16 }}>Um erro inesperado interrompeu a tela. Sua aventura está salva. Recarregue para voltar de onde parou.</div>
            <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 16, fontFamily: "monospace", wordBreak: "break-word" }}>{String((this.state.erro && this.state.erro.message) || this.state.erro).slice(0, 160)}</div>
            <button onClick={() => location.reload()} style={{ padding: "10px 20px", borderRadius: 10, background: "#C9973F", color: "#1a1206", border: "none", fontWeight: 600, cursor: "pointer" }}>Recarregar</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function gerarBancoNomes(genero) {
  const g = (genero && genero.genero) || genero || "Fantasia medieval";
  const cidades = [], tavernas = [];
  for (let i = 0; i < 8; i++) cidades.push(nomeCidade(g));
  for (let i = 0; i < 4; i++) tavernas.push(nomeTaverna(g));
  const elenco = elencoDiverso(g, 6);
  return { cidades: [...new Set(cidades)], tavernas: [...new Set(tavernas)], elenco };
}

export default function Taverna() {
  const [fase, setFase] = useState("menu"); // menu | mundo | personagem | jogo
  const faseRef = useRef(fase);
  const avisoPodaRef = useRef(false);
  const salvarRef2 = useRef(null);
  const [mundo, setMundo] = useState(null);
  const [nomeCampanha, setNomeCampanha] = useState("");
  const [personagem, setPersonagem] = useState(null);
  /* ESPELHO DA FICHA (v8.9): montarSystemPrompt roda DENTRO do clique que
     carrega o save — antes de o React aplicar setPersonagem. Sem este espelho,
     infoTitulo() lia `personagem` ainda null e "Continuar aventura" falhava
     na primeira tentativa (só abria no segundo clique). */
  const personagemRef = useRef(null);
  useEffect(() => { if (personagem) personagemRef.current = personagem; }, [personagem]);
  const [mensagens, setMensagens] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [rolagem, setRolagem] = useState(null);
  const [combate, setCombate] = useState(null); // null | { inimigos: [{nome, vida, vidaMax, ameaca}] }
  const [carregando, setCarregando] = useState(false);
  const [entrada, setEntrada] = useState("");
  const [aba, setAba] = useState(null);
  const [habAbertas, setHabAbertas] = useState(false);
  const [acoesAbertas, setAcoesAbertas] = useState(false);
  const [habSel, setHabSel] = useState(null);
  const [dadoRolando, setDadoRolando] = useState(false);
  const [falha, setFalha] = useState(null);
  const [statusSave, setStatusSave] = useState(null);
  const [cronica, setCronica] = useState(null);
  const [verCena, setVerCena] = useState(false);
  const [longeDoFim, setLongeDoFim] = useState(false);
  const areaRef = useRef(null);
  const [acampado, setAcampado] = useState(false);
  const acampadoRef = useRef(false);
  /* mantém a ref em dia: o salvamento lê a ref, nunca o estado (que fica
     defasado dentro de callbacks e gravava "acampado" errado no save) */
  const definirAcampado = useCallback((v) => { acampadoRef.current = v; setAcampado(v); }, []);
  const [mostrarRolagens, setMostrarRolagens] = useState(() => {
    try { const v = localStorage.getItem("taverna_cfg_rolagens"); return v === null ? true : v === "1"; } catch { return true; }
  });
  useEffect(() => { mostrarRolagensRef.current = mostrarRolagens; try { localStorage.setItem("taverna_cfg_rolagens", mostrarRolagens ? "1" : "0"); } catch {} }, [mostrarRolagens]);
  const [temSave, setTemSave] = useState(null);

  const systemRef = useRef("");
  const livroRef = useRef("");
  const notaRef = useRef("");
  const turnoContRef = useRef(0);
  const fimRef = useRef(null);
  const saveRef = useRef(null);
  const combateRef = useRef(null);
  combateRef.current = combate;
  const mensagensRef = useRef([]);
  const habUsadaRef = useRef(false);
  const rolagemConsumidaRef = useRef(null);
  const mundoContRef = useRef(0);
  const combateOciosoRef = useRef(0);      // turnos sem troca de golpes
  const ataqueResolvidoRef = useRef(false);
  const danoJaAplicadoRef = useRef(false); // turno em que o sistema já cobrou dano
  const sinalViagemRef = useRef(null);    // Mestre pediu para abrir viagem
  const sinalMasmorraRef = useRef(null);  // Mestre pediu para abrir masmorra
  const salaEmCursoRef = useRef(null);    // sala da masmorra cujo combate está aberto
  const [alvosGolpe, setAlvosGolpe] = useState([]); // alvo escolhido para cada golpe do turno
  const alvosGolpeRef = useRef([]); // marca ataque do jogador neste turno
  const modoMundoRef = useRef(0);           // rotação de tipos de cena
  const urgenciaRef = useRef(0);            // quantas cenas recentes usaram urgência
  const historiaRef = useRef({ estrutura: "jornada", etapa: 0 });
  const questsRef = useRef([]);
  const [quests, setQuests] = useState([]);
  const [aguardandoMundo, setAguardandoMundo] = useState(false);
  const [mostrarHoras, setMostrarHoras] = useState(false);
  const ehAcaoMundoRef = useRef(false); // marca que o próximo enviar é a vez do mundo
  const canoneRef = useRef({});
  const npcsRef = useRef({});                 // registro persistente de pessoas
  const [npcs, setNpcs] = useState({});
  const npcTurnoRef = useRef(0);              // marca "visto por último" de cada NPC
  const bancoNomesRef = useRef(null);
  const mapaRef = useRef({ cidades: [], faccoes: [] });
  const [mapa, setMapa] = useState({ cidades: [], faccoes: [] });
  const faccaoJogadorRef = useRef("");
  const cidadeAtualRef = useRef("");
  /* GESTÃO: guilda (nível/cofre) — domínios se derivam do mapa por código */
  const guildaRef = useRef({ nivel: 1, cofre: 0 });
  const [guilda, setGuilda] = useState({ nivel: 1, cofre: 0 });
  /* ASCENSÃO (v7.4): escala GD/fiéis/PF do jogador + panteão do mundo.
     Travada até o nível NIVEL_DESPERTAR para não quebrar a história. */
  const divindadeRef = useRef(garantirDivindade(null));
  const [divindade, setDivindade] = useState(divindadeRef.current);
  /* DEVOÇÃO (v8.9): a fé deixou de ser um número solto e passou a morar no
     mapa — cada cidade tem devoção, templo e um culto rival para disputar.
     Os "fiéis" da ascensão viraram a SOMA disso (ver sincronizarFieis). */
  const devocaoRef = useRef({ cidades: {}, andarilhos: 0 });
  const [devocao, setDevocao] = useState(devocaoRef.current);
  /* O que o Mestre recebe sobre o cosmos: regras só após o despertar (custo zero antes) */
  const infoDivindade = () => {
    const dv = divindadeRef.current;
    if (!dv || !dv.despertar) return "";
    const fe = resumoFePrompt(mapaRef.current, devocaoRef.current, dv);
    return `${DIVINDADE_PROMPT}\n${CAMINHOS_PROMPT}\n${DEVOCAO_PROMPT}\nEstado atual do jogador: ${resumoAscensao(dv, 0)}${dv.panteao.length ? `\nPanteão conhecido: ${dv.panteao.map((d) => `${d.icone} ${d.nome} ${d.dominio} — GD ${d.gd} (${tituloDe(d.gd)}), culto: ${d.culto}`).join("; ")}.` : ""}${fe ? `\n${fe}` : ""}`;
  };
  /* A ÚNICA FONTE DE VERDADE DOS FIÉIS: quem manda é o mapa. Sempre que a
     devoção muda, o número da ascensão é RECALCULADO — nunca somado à mão. */
  const sincronizarFieis = (dev) => {
    const dv = divindadeRef.current;
    const total = fieisTotais(mapaRef.current, dev || devocaoRef.current);
    if (dv.fieis === total) return dv;
    const novo = { ...dv, fieis: total };
    divindadeRef.current = novo; setDivindade(novo);
    return novo;
  };
  /* Cidades novas entram no registro de devoção sozinhas (zeradas) */
  const casarDevocaoComMapa = () => {
    const d = garantirDevocao(devocaoRef.current, mapaRef.current, divindadeRef.current);
    devocaoRef.current = d; setDevocao(d);
    return d;
  };
  /* CLIMA: rolado por tabela; vai ao Mestre como envelope [CLIMA] */
  const climaRef = useRef(null);
  const [clima, setClima] = useState(null);
  /* CONQUISTAS/CÓDEX: contadores de feitos, conquistas desbloqueadas,
     título equipado e criaturas descobertas — tudo por código */
  const contRef = useRef({ ...CONTADORES_INICIAIS });
  const conqRef = useRef({ desbloqueadas: {}, ordem: [] });
  const [conquistas, setConquistas] = useState({ desbloqueadas: {}, ordem: [] });
  const tituloAtivoRef = useRef("");
  const [tituloAtivo, setTituloAtivo] = useState("");
  const descobRef = useRef([]);
  const [descobertas, setDescobertas] = useState([]);
  /* MASMORRA (v6.3): masmorra ativa gerada por tabela — o app resolve as salas */
  const masmorraRef = useRef(null);
  const [masmorra, setMasmorra] = useState(null);
  /* MURAL DE CONTRATOS (v6.3): 3 trabalhos por tabela, recompensa paga por código */
  const muralRef = useRef([]);
  const [mural, setMural] = useState([]);
  const decretosRef = useRef([]);
  const [decretos, setDecretos] = useState([]);
  const diaRef = useRef(1);
  const [dia, setDia] = useState(1);
  const reinoRef = useRef({});
  const [reino, setReino] = useState({});
  /* TEMPO DA CAMPANHA (v6.5): o app conta os dias — a âncora da memória.
     "Nos conhecemos no dia X" vira fato verificável; antes dele, impossível. */
  const minutoRef = useRef(AMANHECER + 60); // a aventura começa de manhã
  const [minuto, setMinuto] = useState(minutoRef.current);
  const acordouAbsRef = useRef(0); // minuto absoluto em que o herói acordou do último descanso longo
  /* FAMA E NÊMESIS (v6.8): a fama é derivada das façanhas reais; a nêmesis
     nasce por tabela quando o nome cresce — e cresce com cada dia. */
  const nemesisRef = useRef(null);
  const [nemesis, setNemesis] = useState(null);
  /* CORREIO DOS REINOS (v7.0): cartas enviadas/recebidas, tratados firmados —
     todo ato oficial de facção passa por aqui, nunca pela imaginação da IA. */
  const correioRef = useRef({ enviadas: [], recebidas: [], historico: [], tratados: [], seq: 1 });
  const [correio, setCorreio] = useState(correioRef.current);
  /* JORNADA (v7.1): se estou em viagem, NÃO estou em cidade nenhuma — e o
     mestre precisa saber disso em todo turno (fim do "acordar nos aposentos"
     no meio do oceano). Limpa quando o sistema registra chegada (cidade_atual). */
  const jornadaRef = useRef(null); // { de, desde, meio } | null
  const [jornada, setJornada] = useState(null);
  /* GERADORES DE VIDA (v7.2): eventos locais (máx. 3, expiram) e o evento
     global (máx. 1, escala por etapas) — sorteados por código, o mestre só narra. */
  const eventosRef = useRef({ locais: [], global: null, semGlobalDesde: 0, seq: 1 });
  const [eventos, setEventos] = useState(eventosRef.current);
  const localAtualTxt = () => jornadaRef.current
    ? `EM VIAGEM desde ${jornadaRef.current.de || "a última parada"} (desde o dia ${jornadaRef.current.desde || "?"})${jornadaRef.current.meio ? `, viajando de ${jornadaRef.current.meio}` : ""} — não estou em cidade nenhuma`
    : (cidadeAtualRef.current ? `em ${cidadeAtualRef.current}` : "a sós, fora de cidade");
  const famaAtual = () => calcularFama(contRef.current, (personagem && personagem.nivel) || 1, dominiosDe(mapaRef.current).length);
  const famaPatamarRef = useRef(0); // fama da última checagem, para detectar saltos de patamar
  const absMin = () => (diaRef.current - 1) * 1440 + minutoRef.current;
  const tempoInfoPrompt = () => {
    const est = estacaoDe(diaRef.current);
    return `TEMPO DA CAMPANHA: hoje é ${dataTxt(diaRef.current)} — dia ${diaRef.current} da campanha —, ${horaTxt(minutoRef.current)}${ehNoite(minutoRef.current) ? " (NOITE)" : ""}, ${est.nome.toLowerCase()} ${est.icone} (${est.nota}). O app controla o relógio e o calendário: NUNCA estime datas ou horas por conta própria; use estas.`;
  };
  /* RELÓGIO (v6.7): o tempo corre sozinho. Cada chamada avança N minutos;
     dias viram por aqui (com reino, festivais e sono a reboque). Retorna
     texto de envelope para o chamador anexar ao envio do Mestre. */
  const avancarMinutos = (n) => {
    minutoRef.current += n;
    const extras = [];
    while (minutoRef.current >= 1440) {
      minutoRef.current -= 1440;
      const evs = avancarDiasReino(1);
      evs.forEach((ev) => pushMsgs([{ autor: "sistema", texto: `👑 ${ev.evento.titulo} em ${ev.cidade}: ${ev.evento.txt(ev.cidade)}` }]));
      extras.push(envelopeEventosReino(evs));
      const fest = festivalDe(diaRef.current);
      if (fest) {
        const r = Object.fromEntries(Object.entries(reinoRef.current || {}).map(([k, v]) => [k, { ...v, felicidade: Math.min(100, (v.felicidade || 0) + fest.fel) }]));
        reinoRef.current = r; setReino(r);
        pushMsgs([{ autor: "sistema", texto: `${fest.icone} Hoje é ${fest.nome}: ${fest.descricao}.` }]);
        extras.push(`[FESTIVAL — ${fest.nome.toUpperCase()}] Hoje (${dataTxt(diaRef.current)}) é ${fest.nome}: ${fest.descricao}. Nos meus domínios o povo celebra (a felicidade já subiu por código). Traga a festa para a ficção se couber na cena.`);
      }
    }
    setMinuto(minutoRef.current);
    /* Sono: o corpo cobra. 16h acordado = aviso; 20h = exaustão (condição por código). */
    const acordadoH = (absMin() - acordouAbsRef.current) / 60;
    const cansadoJa = (personagem.condicoes || []).some((c) => c.id === "exausto" || (c.nome || "").toLowerCase().includes("cansado"));
    if (acordadoH >= HORAS_EXAUSTO && !cansadoJa) {
      setPersonagem((p) => ({ ...p, condicoes: [...(p.condicoes || []).filter((x) => x.id !== "exausto"), criarCondicao("exausto", { origem: "vigília longa demais" })] }));
      pushMsgs([{ autor: "sistema", texto: `🥱 Exaustão: ${Math.floor(acordadoH)}h acordado. Você está Exausto (desvantagem) até um descanso longo.` }]);
    } else if (acordadoH >= HORAS_AVISO_SONO && (acordadoH - n / 60) < HORAS_AVISO_SONO) {
      pushMsgs([{ autor: "sistema", texto: `🌙 Você está acordado há ${Math.floor(acordadoH)}h. O corpo pede acampamento — além de ${HORAS_EXAUSTO}h vem a exaustão.` }]);
    }
    checarConquistas();
    return extras.filter(Boolean).join("");
  };
  const mostrarRolagensRef = useRef(true);

  /* rola para o fim SÓ quando chega mensagem nova E o jogador já estava no fim.
     Nunca reage a longeDoFim mudar (isso causava o "imã" ao subir lendo). */
  const nMsgRef = useRef(0);
  useEffect(() => {
    const cresceu = mensagens.length > nMsgRef.current;
    nMsgRef.current = mensagens.length;
    /* não rola sozinho se há uma rolagem pendente — o jogador quer ler a
       narrativa do Mestre antes de rolar, sem a tela pular para o rodapé */
    if (cresceu && !longeDoFim && !rolagem) fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensagens]); // eslint-disable-line

  /* carrega o save deste dispositivo na abertura */
  useEffect(() => {
    try {
      const bruto = localStorage.getItem("taverna_save_v1");
      if (bruto) { const sv = JSON.parse(bruto); if (sv && sv.personagem) sv.personagem = migrarPersonagem(sv.personagem); saveRef.current = sv; setTemSave(sv); }
    } catch { /* save corrompido: ignora */ }
  }, []);

  /* ao entrar no jogo, posiciona direto na última mensagem (sem animação) */
  useEffect(() => {
    if (fase !== "jogo") return;
    const t = setTimeout(() => fimRef.current?.scrollIntoView({ behavior: "auto", block: "end" }), 80);
    return () => clearTimeout(t);
  }, [fase]);

  const aoRolar = useCallback((e) => {
    const el = e.currentTarget;
    const distancia = el.scrollHeight - el.scrollTop - el.clientHeight;
    setLongeDoFim(distancia > 240);
  }, []);

  const irParaOFim = useCallback(() => {
    const el = areaRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    else fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setLongeDoFim(false);
  }, []);

  const pushMsgs = useCallback((novas) => {
    mensagensRef.current = [...mensagensRef.current, ...novas];
    setMensagens(mensagensRef.current);
  }, []);

  const salvar = useCallback((extra = {}) => {
    setStatusSave("salvando");
    const dados = {
      nomeCampanha, mundo, personagem, mensagens: mensagensRef.current, historico,
      combate: combateRef.current, livro: livroRef.current, canone: canoneRef.current, npcs: npcsRef.current, acampado: acampadoRef.current,
      mapa: mapaRef.current, faccaoJogador: faccaoJogadorRef.current, cidadeAtual: cidadeAtualRef.current, guilda: guildaRef.current, clima: climaRef.current,
      conquistas: conqRef.current, contadores: contRef.current, tituloAtivo: tituloAtivoRef.current, descobertas: descobRef.current,
      masmorra: masmorraRef.current, mural: muralRef.current, decretos: decretosRef.current, dia: diaRef.current, reino: reinoRef.current, minuto: minutoRef.current, acordouAbs: acordouAbsRef.current, nemesis: nemesisRef.current, famaPatamar: famaPatamarRef.current, correio: correioRef.current, jornada: jornadaRef.current, eventos: eventosRef.current, divindade: divindadeRef.current,
      historia: historiaRef.current, quests: questsRef.current, devocao: devocaoRef.current, mercado: mercadoRef.current,
      rolagem: (extra.rolagem !== undefined ? extra.rolagem : (dadoRolando ? null : rolagem)), salvoEm: Date.now(), ...extra,
    };
    /* GRAVAÇÃO À PROVA DE QUOTA (v7.0.2): o histórico completo do chat é o que
       incha o save (narrativas longas). O MUNDO, a ficha e o cânone NUNCA são
       podados — só o scrollback de mensagens, que tem cópia viva na sessão e
       memória permanente no cânone/livro. Se a quota estourar, poda mais. */
    const historicoEnxuto = (nMsg) => ({
      ...dados,
      mensagens: mensagensRef.current.slice(-nMsg),
      historico: Array.isArray(historico) && historico.length > nMsg * 2 ? historico.slice(-nMsg * 2) : historico,
    });
    const gravar = (d) => { try { localStorage.setItem("taverna_save_v1", JSON.stringify(d)); return true; } catch { return false; } };
    let gravou = gravar(historicoEnxuto(250));
    let podou = false;
    if (!gravou) {
      for (const n of [120, 60, 30]) {
        if (gravar(historicoEnxuto(n))) { gravou = true; podou = true; break; }
      }
    }
    if (gravou) {
      saveRef.current = dados;
      setTemSave(dados);
      setStatusSave("salvo");
      if (podou && !avisoPodaRef.current) {
        avisoPodaRef.current = true;
        pushMsgs([{ autor: "sistema", texto: "💾 O save estava grande demais para o navegador: poddo só o histórico antigo de mensagens (o mundo, a ficha, o cânone e as missões seguem intactos)." }]);
      }
    } else {
      setStatusSave("erro");
    }
  }, [nomeCampanha, mundo, personagem, mensagens, historico, rolagem]);

  /* SEGURO CONTRA CRASH (v7.0.2): se a página vai para segundo plano (ou o
     sistema derruba o Safari por memória), o save acontece ANTES. Assim, mesmo
     num crash, o prejuízo máximo é o turno em andamento — nunca 90% da saga. */
  useEffect(() => { salvarRef2.current = salvar; }, [salvar]);
  useEffect(() => { faseRef.current = fase; }, [fase]);
  useEffect(() => {
    const aoEsconder = () => {
      if (document.visibilityState !== "hidden" && !document.hidden) return;
      if (faseRef.current === "jogo" && salvarRef2.current) salvarRef2.current();
    };
    document.addEventListener("visibilitychange", aoEsconder);
    window.addEventListener("pagehide", aoEsconder);
    return () => {
      document.removeEventListener("visibilitychange", aoEsconder);
      window.removeEventListener("pagehide", aoEsconder);
    };
  }, []);

  /* ---------------- CONDIÇÕES: UM SÓ CAMINHO PARA APLICAR (v9.0) ----------------
     Todo mundo (Mestre, combate, milagre, cão de guarda) passa por aqui, e é
     por isso que ficha, combate, HUD e narração param de discordar. O alvo
     pode ser eu, um companheiro do grupo ou um inimigo em cena. */
  const aplicarCondicaoEm = (pers, alvoNome, cond) => {
    const alvo = String(alvoNome || "você").toLowerCase().trim();
    const marca = cond.tipo === "bom" ? "✦" : "⚠";
    const semRepetir = (lista) => (lista || []).filter((x) => (x.id || "") !== cond.id && (x.nome || "").toLowerCase() !== cond.nome.toLowerCase());
    const ehEu = !alvo || ["você", "voce", "eu", "herói", "heroi"].includes(alvo) || alvo === (pers.nome || "").toLowerCase();
    if (ehEu) {
      return {
        pers: { ...pers, condicoes: [...semRepetir(pers.condicoes), cond] },
        texto: `${marca} ${cond.icone} Você está ${cond.nome}${cond.turnos ? ` (${cond.turnos}t)` : ""} — ${cond.efeito}`,
      };
    }
    const idx = (pers.grupo || []).findIndex((g) => (g.nome || "").toLowerCase() === alvo);
    if (idx >= 0) {
      const grupo = pers.grupo.map((g, i) => (i !== idx ? g : { ...g, condicoes: [...semRepetir(g.condicoes), cond] }));
      return { pers: { ...pers, grupo }, texto: `${marca} ${cond.icone} ${pers.grupo[idx].nome}: ${cond.nome}${cond.turnos ? ` (${cond.turnos}t)` : ""}` };
    }
    const comb = combateRef.current;
    if (comb && (comb.inimigos || []).some((e) => (e.nome || "").toLowerCase() === alvo)) {
      const inimigos = comb.inimigos.map((e) => ((e.nome || "").toLowerCase() !== alvo ? e : { ...e, condicoes: [...semRepetir(e.condicoes), cond] }));
      const nc = { ...comb, inimigos };
      combateRef.current = nc; setCombate(nc);
      return { pers, texto: `${marca} ${cond.icone} ${alvoNome}: ${cond.nome}${cond.turnos ? ` (${cond.turnos}t)` : ""}` };
    }
    /* alvo fora de cena: vira só aviso — nada de condição fantasma na ficha */
    return { pers, texto: `${marca} ${cond.icone} ${alvoNome}: ${cond.nome}` };
  };

  /* ---------------- AFLIÇÕES DO COMBATE (v9.1) ----------------
     Quem aflige quem sai do CATÁLOGO, nunca da narração: o nome do golpe
     (do repertório da criatura), a arma equipada ou a habilidade usada dizem
     o que carregam; o sistema rola o teste do alvo e aplica. Vale para os
     três lados da mesa — herói, companheiros e inimigos. */
  const aplicarCondicoesDosGolpes = (acoes, persBase) => {
    let p = persBase;
    for (const a of (acoes || []).filter((x) => x.r && x.r.dano > 0 && x.alvoRef === "jogador")) {
      const res = rolarAflicao({
        /* só o NOME DO GOLPE decide a aflição — o nome da criatura entraria
           por engano ("Rato Gigante" viraria "fortalecido" por causa de
           "gigante"). O elemento dela já escolheu o golpe lá atrás. */
        fonte: a.golpeNome || a.inimigo,
        nomeFonte: a.golpeNome ? `${a.golpeNome} (${a.inimigo})` : `golpe de ${a.inimigo}`,
        atacante: a.inimigo, alvo: p, alvoNome: "você", critico: a.r.critico,
      });
      if (!res) continue;
      pushMsgs([{ autor: "sistema", texto: res.texto }]);
      notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}${res.nota}`;
      if (res.aplicou) p = { ...p, condicoes: [...(p.condicoes || []).filter((x) => x.id !== res.cond.id), res.cond] };
    }
    return p;
  };

  /* Aflição que o HERÓI (ou um companheiro) impõe a um inimigo. Devolve a
     lista de inimigos já atualizada — a arma e a habilidade são a fonte. */
  const aplicarAflicaoEmInimigo = (lista, alvoNome, { fonte, nomeFonte, atacante, critico }) => {
    const alvo = (lista || []).find((e) => e.nome === alvoNome);
    if (!alvo || alvo.derrotado || alvo.vida <= 0) return { lista, res: null };
    const res = rolarAflicao({ fonte, nomeFonte, atacante, alvo, alvoNome, critico });
    if (!res) return { lista, res: null };
    if (!res.aplicou) return { lista, res };
    return {
      lista: lista.map((e) => (e.nome !== alvoNome ? e : { ...e, condicoes: [...(e.condicoes || []).filter((c) => c.id !== res.cond.id), res.cond] })),
      res,
    };
  };

  /* Habilidade que fortalece em vez de ferir: "Grito de Guerra" inspira o
     grupo, "Postura Defensiva" protege quem usou, "Fúria" enfurece. Também
     sai do catálogo — o Mestre não concede mais buff por conta própria. */
  const aplicarBuffDeHabilidade = (h, pers) => {
    const port = aflicaoDe(`${h.nome || ""} ${h.descricao || ""}`);
    if (!port || port.alvo === "alvo") return { pers, texto: "", nota: "" };
    const res = rolarAflicao({ fonte: port, nomeFonte: h.nome, atacante: pers.nome, sempre: true });
    if (!res || !res.aplicou) return { pers, texto: "", nota: "" };
    let p = { ...pers, condicoes: [...(pers.condicoes || []).filter((c) => c.id !== res.cond.id), res.cond] };
    if (port.alvo === "aliados") {
      p = { ...p, grupo: (p.grupo || []).map((g) => ((g.vida || 0) > 0 ? { ...g, condicoes: [...(g.condicoes || []).filter((c) => c.id !== res.cond.id), res.cond] } : g)) };
    }
    return {
      pers: p,
      texto: `${res.cond.icone} ${h.nome}: ${res.cond.nome}${res.cond.turnos ? ` (${res.cond.turnos}t)` : ""}${port.alvo === "aliados" ? " — em você e no grupo" : ""} · ${res.cond.efeito}`,
      nota: `[EFEITO APLICADO PELO SISTEMA] "${h.nome}" deixou ${port.alvo === "aliados" ? "eu e meu grupo" : "eu"} ${res.cond.nome.toLowerCase()} (${res.cond.efeito}). Já está na ficha — narre a manifestação e não envie condição nenhuma por isso.`,
    };
  };

  /* ---------------- O GRUPO AGINDO SOZINHO (v9.2) ----------------
     Cura, poção e buff de companheiro deixam de ser mensagem bonita e viram
     PV e condição de verdade na ficha. */
  const gastarManaComp = (pers, nome, custo) => {
    if (!custo) return pers;
    return { ...pers, grupo: (pers.grupo || []).map((g) => (g.nome === nome ? { ...g, mana: Math.max(0, (g.mana != null ? g.mana : g.manaMax || 0) - custo) } : g)) };
  };

  const curarAliado = (pers, alvoNome, valor) => {
    if (!alvoNome || alvoNome === pers.nome) {
      const antes = pers.vida || 0;
      const vida = Math.min(pers.vidaMax || antes, antes + valor);
      return { pers: { ...pers, vida, morrendo: vida > 0 ? false : pers.morrendo, morte: vida > 0 ? { sucessos: 0, falhas: 0 } : pers.morte }, curado: vida - antes, texto: `${vida}/${pers.vidaMax}` };
    }
    let curado = 0, texto = "";
    const grupo = (pers.grupo || []).map((g) => {
      if (g.nome !== alvoNome) return g;
      const antes = g.vida || 0;
      const vida = Math.min(g.vidaMax || antes, antes + valor);
      curado = vida - antes; texto = `${vida}/${g.vidaMax}`;
      return { ...g, vida, morrendo: vida > 0 ? false : g.morrendo };
    });
    return { pers: { ...pers, grupo }, curado, texto };
  };

  const pocaoDeCompanheiro = (pers, ac) => {
    const nomeItem = typeof ac.item === "string" ? ac.item : (ac.item && ac.item.nome) || (ac.consumivel && ac.consumivel.nome);
    /* tira o frasco da bolsa de quem usou */
    let p = { ...pers, grupo: (pers.grupo || []).map((g) => {
      if (g.nome !== ac.companheiro) return g;
      const idx = (g.inventario || []).findIndex((raw) => (typeof raw === "string" ? raw : (raw && raw.nome) || "") === nomeItem);
      return idx < 0 ? g : { ...g, inventario: g.inventario.filter((_, i) => i !== idx) };
    }) };
    /* aplica no alvo (herói ou companheiro) */
    if (!ac.alvo || ac.alvo === p.nome) {
      const r = usarConsumivel(p, ac.consumivel ? ac.consumivel.id : nomeItem);
      if (r) p = r.ent;
      return { pers: p, texto: `🧪 ${ac.companheiro} te dá ${nomeItem}: ${r ? r.texto.replace(/^[^:]+: /, "") : "efeito aplicado"}`, paraMestre: `${ac.companheiro} usou ${nomeItem} em mim — o efeito JÁ está aplicado; narre o gesto, não o número` };
    }
    let txt = "";
    p = { ...p, grupo: (p.grupo || []).map((g) => {
      if (g.nome !== ac.alvo) return g;
      const r = usarConsumivel(g, ac.consumivel ? ac.consumivel.id : nomeItem);
      if (!r) return g;
      txt = r.texto;
      return r.ent;
    }) };
    return { pers: p, texto: `🧪 ${ac.companheiro} → ${ac.alvo}: ${txt || nomeItem}`, paraMestre: `${ac.companheiro} deu ${nomeItem} a ${ac.alvo} — efeito já aplicado pelo sistema` };
  };

  const buffDeCompanheiro = (pers, ac) => {
    const port = aflicaoDe(`${ac.habilidade.nome} ${ac.habilidade.descricao || ""}`);
    if (!port || port.alvo === "alvo") {
      return { pers, texto: `✦ ${ac.companheiro} usa ${ac.habilidade.nome}`, paraMestre: `${ac.companheiro} usou ${ac.habilidade.nome} (efeito de apoio, sem números novos)` };
    }
    const res = rolarAflicao({ fonte: port, nomeFonte: ac.habilidade.nome, atacante: ac.companheiro, sempre: true });
    if (!res || !res.aplicou) return { pers, texto: "", paraMestre: `${ac.companheiro} usou ${ac.habilidade.nome}` };
    const semRepetir = (lista) => (lista || []).filter((x) => x.id !== res.cond.id);
    let p = pers;
    if (port.alvo === "aliados") {
      p = { ...p, condicoes: [...semRepetir(p.condicoes), res.cond], grupo: (p.grupo || []).map((g) => ((g.vida || 0) > 0 ? { ...g, condicoes: [...semRepetir(g.condicoes), res.cond] } : g)) };
    } else {
      p = { ...p, grupo: (p.grupo || []).map((g) => (g.nome === ac.companheiro ? { ...g, condicoes: [...semRepetir(g.condicoes), res.cond] } : g)) };
    }
    const onde = port.alvo === "aliados" ? "no grupo inteiro" : `em ${ac.companheiro}`;
    return {
      pers: p,
      texto: `${res.cond.icone} ${ac.companheiro} · ${ac.habilidade.nome}: ${res.cond.nome} ${onde} — ${res.cond.efeito}`,
      paraMestre: `${ac.companheiro} usou ${ac.habilidade.nome} e deixou ${onde} ${res.cond.nome.toLowerCase()} — já aplicado, narre o gesto`,
    };
  };

  /* Companheiro também aflige: a arma dele passa pelo mesmo catálogo. */
  const aflicaoDeCompanheiro = (inimigos, ac, persAtual) => {
    if (!ac || !ac.r || ac.r.dano <= 0) return inimigos;
    const comp = ((persAtual && persAtual.grupo) || []).find((g) => g.nome === ac.companheiro);
    if (!comp) return inimigos;
    const f = fonteDaArma(comp);
    const ap = aplicarAflicaoEmInimigo(inimigos, ac.alvoNome, { fonte: `${f.texto} ${comp.classe || ""} ${comp.conceito || ""}`, nomeFonte: `${f.nome} de ${comp.nome}`, atacante: comp.nome, critico: ac.r.critico });
    if (ap.res) {
      pushMsgs([{ autor: "sistema", texto: ap.res.texto }]);
      notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}${ap.res.nota}`;
    }
    return ap.lista;
  };

  /* A "fonte" do golpe do herói: a arma equipada (nome + elemento). É daqui
     que sai o "adaga envenenada envenena" sem ninguém pedir. */
  const fonteDaArma = (pers) => {
    const arma = (pers.equipados || {}).arma;
    const nome = arma ? arma.nome : "";
    const elem = elementoDaArma(pers);
    const poder = arma && arma.poder ? arma.poder : "";
    return { texto: `${nome} ${poder} ${elem}`.trim(), nome: nome || "seu golpe" };
  };

  const removerCondicaoDe = (pers, alvoNome, id, nomeBruto) => {
    const alvo = String(alvoNome || "você").toLowerCase().trim();
    const casa = (x) => (id && x.id === id) || (x.nome || "").toLowerCase() === String(nomeBruto || "").toLowerCase();
    const ehEu = !alvo || ["você", "voce", "eu", "herói", "heroi"].includes(alvo) || alvo === (pers.nome || "").toLowerCase();
    if (ehEu) {
      const tinha = (pers.condicoes || []).some(casa);
      if (!tinha) return { pers, texto: "" };
      return { pers: { ...pers, condicoes: (pers.condicoes || []).filter((x) => !casa(x)) }, texto: `✓ ${nomeBruto} passou` };
    }
    const idx = (pers.grupo || []).findIndex((g) => (g.nome || "").toLowerCase() === alvo);
    if (idx >= 0) {
      const grupo = pers.grupo.map((g, i) => (i !== idx ? g : { ...g, condicoes: (g.condicoes || []).filter((x) => !casa(x)) }));
      return { pers: { ...pers, grupo }, texto: `✓ ${pers.grupo[idx].nome}: ${nomeBruto} passou` };
    }
    const comb = combateRef.current;
    if (comb && (comb.inimigos || []).some((e) => (e.nome || "").toLowerCase() === alvo)) {
      const nc = { ...comb, inimigos: comb.inimigos.map((e) => ((e.nome || "").toLowerCase() !== alvo ? e : { ...e, condicoes: (e.condicoes || []).filter((x) => !casa(x)) })) };
      combateRef.current = nc; setCombate(nc);
      return { pers, texto: `✓ ${alvoNome}: ${nomeBruto} passou` };
    }
    return { pers, texto: "" };
  };

  const aplicarResposta = useCallback((resp, persAtual) => {
    let pers = persAtual;
    const msgs = [];
    /* trava anti-cobrança-dupla: no turno de [HABILIDADE] o custo já foi
       descontado pelo app; qualquer mana negativa do Mestre é ignorada */
    /* TRAVA ANTI-DANO-DUPLO: se o sistema já cobrou o dano dos inimigos neste
       turno, qualquer "vida"/"grupo_vida" negativo do Mestre é o MESMO golpe
       chegando de novo — ignora (senão o herói morre pagando duas vezes). */
    if (danoJaAplicadoRef.current && resp.mudancas) {
      if (typeof resp.mudancas.vida === "number" && resp.mudancas.vida < 0) resp.mudancas.vida = 0;
      if (Array.isArray(resp.mudancas.grupo_vida)) resp.mudancas.grupo_vida = resp.mudancas.grupo_vida.filter((g) => !(g && Number(g.vida) < 0));
      danoJaAplicadoRef.current = false;
    }
    if (habUsadaRef.current) {
      if (resp.mudancas && typeof resp.mudancas.mana === "number" && resp.mudancas.mana < 0) resp.mudancas.mana = 0;
      habUsadaRef.current = false;
    }
    /* passa 1 turno nos efeitos que já estavam ativos (os novos entram depois, com duração cheia) */
    const { efeitos, msgs: msgsTick } = tickEfeitos(pers);
    pers = { ...pers, efeitos };
    msgs.push(...msgsTick);
    /* TICK DAS CONDIÇÕES (v9.0): decrementa, expira E COBRA o dano por turno.
       Veneno e sangramento existiam só como rótulo; agora doem de verdade —
       o catálogo diz quanto, o sistema aplica e o Mestre recebe para narrar. */
    if ((pers.condicoes || []).length) {
      const t = tickCondicoes(pers.condicoes);
      pers = { ...pers, condicoes: t.condicoes };
      t.expiradas.forEach((c) => msgs.push(`✓ ${c.nome} passou`));
      if (t.dano > 0 && (pers.vida || 0) > 0) {
        const pv = Math.max(0, (pers.vida || 0) - t.dano);
        msgs.push(`${t.fontes.join(" + ")}: −${t.dano} PV (${pv}/${pers.vidaMax})`);
        pers = { ...pers, vida: pv, morrendo: pv <= 0 ? true : pers.morrendo };
        notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[CONDIÇÃO — DANO JÁ APLICADO PELO SISTEMA] ${t.fontes.join(" e ")} me custou ${t.dano} PV neste turno (estou com ${pv}/${pers.vidaMax}). Mostre isso na ficção — o corpo cobrando o preço — mas NÃO envie dano nenhum por isso: já está cobrado.`;
      }
    }
    /* o mesmo vale para quem está do outro lado: veneno num inimigo precisa
       matar o inimigo, não decorar a ficha dele */
    if (combateRef.current && (combateRef.current.inimigos || []).some((e) => (e.condicoes || []).length && !e.derrotado)) {
      const comb = combateRef.current;
      const inimigos = comb.inimigos.map((e) => {
        if (e.derrotado || !(e.condicoes || []).length) return e;
        const t = tickCondicoes(e.condicoes);
        let vida = e.vida;
        if (t.dano > 0) {
          vida = Math.max(0, e.vida - t.dano);
          msgs.push(`${t.fontes.join(" + ")} em ${e.nome}: −${t.dano} PV (${vida}/${e.vidaMax})${vida <= 0 ? " ☠" : ""}`);
        }
        t.expiradas.forEach((c) => msgs.push(`✓ ${e.nome}: ${c.nome} passou`));
        return { ...e, condicoes: t.condicoes, vida, derrotado: e.derrotado || vida <= 0 };
      });
      const nc = { ...comb, inimigos };
      combateRef.current = nc; setCombate(nc);
    }
    /* tick das recargas de habilidade (v7.4.3): 1 turno por resposta */
    if (pers.habRecarga && Object.keys(pers.habRecarga).length) {
      const rec = {};
      Object.entries(pers.habRecarga).forEach(([k, t]) => { const nt = (Number(t) || 0) - 1; if (nt > 0) rec[k] = nt; });
      pers = { ...pers, habRecarga: rec };
    }
    if (resp.mudancas) pers = aplicarMudancas(pers, resp.mudancas, msgs);
    if ((pers.dadivasPendentes || 0) > 0) pers = concederDadivas(pers, msgs);
    /* CONDIÇÕES: adiciona/remove nos alvos (jogador ou NPCs do grupo/combate) */
    if (resp.mudancas) {
      const md = resp.mudancas;
      /* CONDIÇÕES (v9.0): o nome do Mestre é NORMALIZADO para o catálogo —
         "envenenado gravemente" e "intoxicado" viram a mesma coisa, com a
         mesma duração e o mesmo efeito. E agora valem também para
         companheiros e inimigos, não só para o herói. */
      (md.condicoes_adicionar || []).forEach((c) => {
        if (!c || !c.nome) return;
        const cond = criarCondicao(c.nome, { turnos: c.turnos, origem: "narrado pelo Mestre" });
        if (!cond) { msgs.push(`⚠ Condição desconhecida ignorada: "${c.nome}" (use o catálogo do sistema).`); return; }
        const r = aplicarCondicaoEm(pers, c.alvo, cond);
        pers = r.pers;
        if (r.texto) msgs.push(r.texto);
      });
      (md.condicoes_remover || []).forEach((c) => {
        if (!c || !c.nome) return;
        const cond = criarCondicao(c.nome);
        const r = removerCondicaoDe(pers, c.alvo, cond ? cond.id : null, c.nome);
        pers = r.pers;
        if (r.texto) msgs.push(r.texto);
      });
      /* ROLAGENS DE COMBATE (visíveis, se ligado nas config) */
      if (mostrarRolagensRef.current && Array.isArray(md.rolagens_combate)) {
        md.rolagens_combate.forEach((r) => {
          if (!r || !r.quem) return;
          const ic = r.resultado === "crítico" ? "🎯" : r.resultado === "desastre" ? "💥" : r.resultado === "acerta" ? "⚔" : "🛡";
          msgs.push(`${ic} ${r.quem} → ${r.alvo || "alvo"} · ${r.d20 ?? "?"}${r.mod ? `+${r.mod}` : ""}${r.total != null ? `=${r.total}` : ""}${r.dificuldade != null ? ` vs ${r.dificuldade}` : ""} · ${r.resultado || ""}`);
        });
      }
    }
    /* MAPA E FACÇÕES: registra cidades e facções vindas do Mestre */
    if (resp.mudancas) {
      const md = resp.mudancas;
      let mp = { ...mapaRef.current, cidades: [...(mapaRef.current.cidades || [])], faccoes: [...(mapaRef.current.faccoes || [])] };
      let mudouMapa = false;
      (md.mapa_cidades || []).forEach((cd) => {
        if (!cd || !cd.nome) return;
        const i = mp.cidades.findIndex((c) => c.nome.toLowerCase() === cd.nome.toLowerCase());
        if (i === -1) { mp.cidades.push(criarCidade(cd.nome, cd)); msgs.push(`🗺 ${cd.nome} registrada no mapa`); }
        else mp.cidades[i] = { ...mp.cidades[i], ...cd, x: mp.cidades[i].x, y: mp.cidades[i].y };
        mudouMapa = true;
      });
      (md.mapa_faccoes || []).forEach((fc) => {
        if (!fc || !fc.nome) return;
        const i = mp.faccoes.findIndex((f) => f.nome.toLowerCase() === fc.nome.toLowerCase());
        if (i === -1) mp.faccoes.push(criarFaccao(fc.nome, fc));
        else mp.faccoes[i] = { ...mp.faccoes[i], ...fc };
        if (fc.doJogador) faccaoJogadorRef.current = fc.nome;
        mudouMapa = true;
      });
      if (md.cidade_atual) {
        cidadeAtualRef.current = md.cidade_atual;
        /* CHEGADA: registrar uma cidade encerra a jornada — a partir daqui eu
           ESTOU nessa cidade (e o descanso pode ser em estalagem/aposentos). */
        if (jornadaRef.current) {
          jornadaRef.current = null; setJornada(null);
          msgs.push(`🧭 Chegada: agora você está em ${md.cidade_atual}.`);
        }
      }
      if (md.jornada_meio && jornadaRef.current) {
        jornadaRef.current = { ...jornadaRef.current, meio: String(md.jornada_meio).slice(0, 40) };
        setJornada(jornadaRef.current);
      }
      if (md.faccao_jogador) faccaoJogadorRef.current = md.faccao_jogador;
      if (mudouMapa) { mp = garantirGeografia(mp, pers && pers.nome ? `taverna|${pers.nome}` : "taverna"); mapaRef.current = mp; setMapa(mp); casarDevocaoComMapa(); }
    }
    /* MISSÕES E ARCO: registra quests e avanço de ato vindos do Mestre */
    if (resp.mudancas) {
      const md2 = resp.mudancas;
      let recompensaContrato = null; // contratos pagos por código ao concluir
      [].concat(md2.quest_nova || []).forEach((q) => {
        if (!q || !q.titulo) return;
        if (questsRef.current.some((x) => x.titulo.toLowerCase() === q.titulo.toLowerCase())) return;
        questsRef.current = [...questsRef.current, { titulo: q.titulo, descricao: q.descricao || "", objetivo: q.objetivo || "", tipo: q.tipo === "principal" ? "principal" : "secundaria", status: "ativa", nota: "" }];
        msgs.push(`📜 Nova missão${q.tipo === "principal" ? " PRINCIPAL" : ""}: ${q.titulo}`);
      });
      /* EVENTO GLOBAL resolvido na ficção: o mestre encerra o arco maior */
      if (md2.evento_global_encerrar && eventosRef.current.global) {
        const g = eventosRef.current.global;
        eventosRef.current = { ...eventosRef.current, global: null, semGlobalDesde: diaRef.current };
        setEventos(eventosRef.current);
        msgs.push(`🌍 ${g.nome}: desfecho alcançado — a região entra numa nova era.`);
      }
      [].concat(md2.quest_atualizar || []).forEach((q) => {
        if (!q || !q.titulo) return;
        questsRef.current = questsRef.current.map((x) => {
          if (x.titulo.toLowerCase() !== q.titulo.toLowerCase()) return x;
          const nova = { ...x, status: q.status || x.status, nota: q.nota !== undefined ? q.nota : x.nota };
          if (q.status === "concluida" && x.status !== "concluida") {
            msgs.push(`✓ Missão concluída: ${x.titulo}`);
            /* FÉ POR FEITOS (v7.4): missões concluídas espalham o nome do herói */
            if (divindadeRef.current && divindadeRef.current.despertar) {
              msgs.push(...ganharFe(x.tipo === "principal" ? 150 : 40, 2, "seu feito corre de boca em boca"));
            }
            /* CONTRATO: o pagamento sai por CÓDIGO no momento da conclusão */
            if (x.contrato && !recompensaContrato) recompensaContrato = x.contrato;
          }
          else if (q.status === "falhada" && x.status !== "falhada") msgs.push(`✗ Missão falhou: ${x.titulo}`);
          else if (q.nota) msgs.push(`📜 ${x.titulo}: ${q.nota}`);
          return nova;
        });
      });
      if (recompensaContrato) {
        bumpCont("contratosConcluidos");
        const r = recompensaContrato;
        const p2 = aplicarNivel({ ...pers, moedas: (pers.moedas || 0) + r.moedas, xp: (pers.xp || 0) + r.xp });
        msgs.push(`📋 Contrato pago pelo sistema: +${r.moedas} moedas · +${r.xp} XP`);
        pers = p2; setPersonagem(p2);
        notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[CONTRATO PAGO pelo sistema: +${r.moedas} moedas e +${r.xp} XP — NÃO envie moedas nem xp por esse serviço, seria dobrado.]`;
        recompensaContrato = null;
      }
      if (md2.historia_avancar) {
        const h = historiaRef.current;
        const est = estruturaPorId(h.estrutura);
        if ((h.etapa || 0) < est.etapas.length - 1) {
          h.etapa = (h.etapa || 0) + 1;
          msgs.push(`📖 A história avança — ${est.nome}: "${est.etapas[h.etapa].nome}" (${h.etapa + 1}/${est.etapas.length})`);
        }
      }
      setQuests([...questsRef.current]);
    }
    /* SINAIS (v7.6): o Mestre não manda mais números — manda um sinal curto
       ("fe:proeza", "milagre:cura", "dominio:da Forja") e o SISTEMA converte
       usando as tabelas. Mais barato em tokens e impossível de inflacionar. */
    if (resp.mudancas && Array.isArray(resp.mudancas.sinais)) {
      for (const bruto of resp.mudancas.sinais.slice(0, 6)) {
        const txt = String(bruto || "").trim();
        if (!txt) continue;
        const ix = txt.indexOf(":");
        const chave = (ix < 0 ? txt : txt.slice(0, ix)).trim().toLowerCase();
        const arg = ix < 0 ? "" : txt.slice(ix + 1).trim();
        const dvAtual = divindadeRef.current;
        if (chave === "fe" && dvAtual && dvAtual.despertar) {
          const mag = MAGNITUDE_FE[arg.toLowerCase()] ? arg.toLowerCase() : "feito";
          const ganho = fieisPorFeito(mag, famaAtual());
          const dv2 = { ...divindadeRef.current, ultimoFeitoDia: diaRef.current };
          divindadeRef.current = dv2; setDivindade(dv2);
          msgs.push(...ganharFe(ganho, 0, `${MAGNITUDE_FE[mag].rotulo} — ${MAGNITUDE_FE[mag].desc}`));
        } else if (chave === "milagre" && dvAtual && dvAtual.despertar) {
          invocarMilagre(arg.toLowerCase(), "mestre").forEach((m2) => msgs.push(m2.texto));
        } else if (chave === "viagem") {
          if (!combateRef.current && !acampadoRef.current && !masmorraRef.current) {
            sinalViagemRef.current = arg || "";
            msgs.push(`🧭 Viagem iniciada${arg ? ` rumo a ${arg}` : ""} — o sistema assume clima, encontros e tempo.`);
          }
        } else if (chave === "masmorra") {
          if (!combateRef.current && !acampadoRef.current && !masmorraRef.current) {
            sinalMasmorraRef.current = arg || "";
          }
        } else if (chave === "ascender" && dvAtual && dvAtual.despertar) {
          const cam = caminhoPorId(arg.toLowerCase());
          const gdAtual = grauDe(dvAtual);
          const teto = gdMaximoPorNivel(personagem.nivel || 1);
          if (gdAtual >= teto) {
            msgs.push(`⛓ ${cam.nome}: o poder existe, mas seu corpo mortal ainda não o comporta (nível ${personagem.nivel}).`);
          } else {
            const alvo = GRAUS[Math.min(4, gdAtual + 1)];
            const fieisNovos = Math.max(alvo.fieis, Math.round(alvo.fieis * (1 + (cam.ganho?.fieis || 0))));
            /* v8.9: a fé tomada de um deus morto (ou drenada de uma fonte) não
               nasce no vácuo — ela cai sobre o mapa, cidade a cidade. */
            const faltando = Math.max(0, fieisNovos - fieisTotais(mapaRef.current, devocaoRef.current));
            const devNova = espalharFieis(devocaoRef.current, mapaRef.current, faltando, 70);
            devocaoRef.current = devNova; setDevocao(devNova);
            const dv2 = { ...divindadeRef.current, fieis: fieisTotais(mapaRef.current, devNova), ultimoFeitoDia: diaRef.current, caminho: cam.id };
            divindadeRef.current = dv2; setDivindade(dv2);
            msgs.push(`🌟 ASCENSÃO POR ${cam.nome.toUpperCase()} — você alcança GD ${grauDe(dv2)} (${tituloDe(grauDe(dv2))}).`);
            notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[ASCENSÃO — ${cam.nome.toUpperCase()} — APLICADA PELO SISTEMA] O herói subiu para GD ${grauDe(dv2)} (${tituloDe(grauDe(dv2))}) por este caminho. ${cam.id === "deicidio" ? "O culto da divindade morta jura vingança eterna — registre isso no cânone e faça o mundo reagir: outros deuses passam a vigiá-lo." : cam.id === "reliquia" ? "A fonte primordial se apagou — registre no cânone o que restou dela e o preço que o ritual cobrou do herói." : ""} Narre a transformação à altura: virar deus deve doer, custar e mudar o jogo.`;
          }
        } else if (chave === "loot") {
          const rar = ["comum", "incomum", "raro", "epico", "lendario"].includes(arg.toLowerCase()) ? arg.toLowerCase() : "comum";
          const it = gerarLoot(rar, { nivel: personagem.nivel || 1 });
          setPersonagem((p) => ({ ...p, equipamento: [...(p.equipamento || []), it] }));
          msgs.push(`◆ Achado: ${it.nome} (${RARIDADE_ROTULO[it.raridade] || it.raridade})${it.poder ? ` — ${it.poder}` : ""}`);
          notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[ITEM GERADO PELO SISTEMA] ${it.nome}, ${it.raridade}${it.poder ? `, poder: ${it.poder}` : ""}. Já está na mochila do herói — descreva o achado usando ESTE nome e estas propriedades, sem inventar outras.`;
        } else if (chave === "dominio" && dvAtual && dvAtual.despertar && arg && !dvAtual.dominio) {
          const dv2 = { ...divindadeRef.current, dominio: arg.slice(0, 60) };
          divindadeRef.current = dv2; setDivindade(dv2);
          msgs.push(`🌌 Domínio revelado: ${dv2.dominio}`);
        } else if (chave === "patrono" && dvAtual && dvAtual.despertar && arg && !dvAtual.patrono) {
          const dv2 = { ...divindadeRef.current, patrono: arg.slice(0, 60) };
          divindadeRef.current = dv2; setDivindade(dv2);
          msgs.push(`🕯 Patrono declarado: ${dv2.patrono}`);
        }
      }
    }
    /* COMPATIBILIDADE: formato antigo "fe":{fieis,pf} de saves/respostas v7.4-7.5 */
    if (resp.mudancas && resp.mudancas.fe && typeof resp.mudancas.fe === "object" && divindadeRef.current && divindadeRef.current.despertar) {
      const fe = resp.mudancas.fe;
      const fieis = Math.round(Number(fe.fieis) || 0), pf = Math.round(Number(fe.pf) || 0);
      if (fieis || pf) msgs.push(...ganharFe(Math.max(-50, Math.min(1000, fieis)), Math.max(-60, Math.min(60, pf)), "registrado pelo Mestre"));
      const dv = { ...divindadeRef.current };
      let tocou = false;
      if (fe.dominio && !dv.dominio) { dv.dominio = String(fe.dominio).slice(0, 60); tocou = true; msgs.push(`🌌 Domínio revelado: ${dv.dominio}`); }
      if (fe.patrono && !dv.patrono) { dv.patrono = String(fe.patrono).slice(0, 60); tocou = true; }
      if (tocou) { divindadeRef.current = dv; setDivindade(dv); }
    }
    /* CÂNONE: mescla fatos duráveis; campos novos atualizam, nunca apagam a ficha */
    if (resp.mudancas && resp.mudancas.canone && typeof resp.mudancas.canone === "object") {
      const c = { ...canoneRef.current };
      for (const [nome, ficha] of Object.entries(resp.mudancas.canone)) {
        if (!nome || !ficha || typeof ficha !== "object") continue;
        const nova = !c[nome];
        c[nome] = { ...(c[nome] || {}), ...ficha };
        if (nova) msgs.push(`📖 Registrado: ${nome}`);
      }
      canoneRef.current = c;
      /* rede de segurança do MAPA: se o cânone registra um lugar (tipo local/
         cidade/vila/capital), garante que ele exista no mapa mesmo que o Mestre
         não tenha enviado "mapa_cidades". Assim o mapa nunca fica vazio. */
      let mp2 = mapaRef.current, tocouMapa = false;
      for (const [nome, ficha] of Object.entries(c)) {
        const tipo = (ficha.tipo || "").toLowerCase();
        const ehLugar = ["local", "cidade", "vila", "capital", "fortaleza", "vilarejo", "povoado", "reduto", "ruína"].some((t) => tipo.includes(t));
        if (!ehLugar) continue;
        if (!(mp2.cidades || []).some((cc) => cc.nome.toLowerCase() === nome.toLowerCase())) {
          if (!tocouMapa) { mp2 = { ...mp2, cidades: [...(mp2.cidades || [])], faccoes: [...(mp2.faccoes || [])] }; tocouMapa = true; }
          mp2.cidades.push(criarCidade(nome, { tipo: tipo.includes("capital") ? "capital" : tipo.includes("vila") || tipo.includes("povoado") ? "vila" : "cidade", regiao: ficha.local || "", faccao: ficha.faccao || null, notas: ficha.notas || "" }));
          msgs.push(`🗺 ${nome} surgiu no mapa`);
        }
      }
      if (tocouMapa) { mp2 = garantirGeografia(mp2, "taverna|canone"); mapaRef.current = mp2; setMapa(mp2); }
      systemRef.current = montarSystemPrompt(nomeCampanha, mundo, pers, livroRef.current, c, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade(), infoTitulo());
    }
    /* PESSOAS (registro de NPCs): o Mestre envia "npcs"; e como blindagem de
       memória, qualquer PESSOA do cânone sem ficha entra no registro por código. */
    if (resp.mudancas) {
      npcTurnoRef.current += 1;
      let reg = npcsRef.current;
      let tocou = false;
      [].concat(resp.mudancas.npcs || []).forEach((n) => {
        if (!n || !n.nome) return;
        const chave = Object.keys(reg).find((k) => k.toLowerCase() === String(n.nome).toLowerCase());
        const ficha = chave
          ? mesclarNPC(reg[chave], { ...n, ultimaVez: npcTurnoRef.current, conhecidoEm: reg[chave].conhecidoEm != null ? reg[chave].conhecidoEm : diaRef.current })
          : criarNPC(n.nome, { ...n, ultimaVez: npcTurnoRef.current, conhecidoEm: n.conhecidoEm != null ? n.conhecidoEm : diaRef.current });
        if (!tocou) { reg = { ...reg }; tocou = true; }
        reg[chave || n.nome] = ficha;
        if (!chave) msgs.push(`👤 ${n.nome} entrou para o elenco`);
      });
      for (const [nome, f] of Object.entries(canoneRef.current || {})) {
        if (!f || !String(f.tipo || "").toLowerCase().includes("pessoa")) continue;
        if (Object.keys(reg).some((k) => k.toLowerCase() === nome.toLowerCase())) continue;
        if (!tocou) { reg = { ...reg }; tocou = true; }
        reg[nome] = criarNPC(nome, { papel: f.papel || "", genero: f.genero || "", local: f.local || "", status: f.status || "vivo", notas: f.notas || "", ultimaVez: npcTurnoRef.current, conhecidoEm: diaRef.current });
      }
      if (tocou) {
        npcsRef.current = reg; setNpcs(reg);
        systemRef.current = montarSystemPrompt(nomeCampanha, mundo, pers, livroRef.current, canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade(), infoTitulo());
      }
    }
    setPersonagem(pers);
    /* combate: processa de forma síncrona (via ref) para as mensagens saírem na ordem certa */
    if (resp.mudancas) {
      const combateAntes = combateRef.current;
      resp.mudancas.__nivelJogador = pers.nivel || 1;
      const novoCombate = processarCombate(combateRef.current, resp.mudancas, msgs);
      combateRef.current = novoCombate;
      setCombate(novoCombate);
      /* PRESENÇA DIVINA (v7.4 — COM MODERAÇÃO): só dispara quando uma
         divindade de verdade (GD 3+) entra em cena E supera o jogador por
         2+ degraus. Uma vez por combate, resistência por código. Proteções:
         itens consagrados/benção ajudam; companheiros de vínculo 4+ são
         imunes (a convivência com o herói os acostumou ao impossível). */
      if (!combateAntes && combateRef.current && (combateRef.current.inimigos || []).some((e) => (e.gd || 0) >= 3)) {
        const div = (combateRef.current.inimigos || []).filter((e) => (e.gd || 0) >= 3).sort((a, b) => (b.gd || 0) - (a.gd || 0))[0];
        const gdJP = grauDe(divindadeRef.current);
        if ((div.gd || 0) - gdJP >= 2) {
          const cd = 10 + 2 * (div.gd || 0);
          const rolo = () => 1 + Math.floor(Math.random() * 20);
          const protegido = (ent) => [...(ent.equipados ? Object.values(ent.equipados) : []), ...(ent.inventario || [])].some((it) => it && /consagrad|abençoad|abencoad|sagrad|divin/i.test(it.nome || ""));
          /* jogador */
          const bonusJ = Math.max(pers.atributos?.vigor || 0, pers.atributos?.presenca || 0) + (protegido(pers) ? 4 : 0) + (pers.nivel >= 15 ? 2 : 0);
          const rJ = rolo() + bonusJ;
          if (rJ < cd) {
            const cond = criarCondicao(["amedrontado", "cego", "enfeiticado"][Math.floor(Math.random() * 3)], { turnos: 3, origem: `presença de ${div.nome}` });
            const efeito = cond.nome;
            pers = { ...pers, condicoes: [...(pers.condicoes || []).filter((x) => x.id !== cond.id), cond] };
            msgs.push(`🌑 A presença de ${div.nome} (GD ${div.gd}) esmaga o ar: você resiste (${rJ} vs ${cd})… e falha — ${efeito.toLowerCase()} neste combate (desvantagem).`);
            notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[PRESENÇA DIVINA — sistema rolou] Eu falhei na resistência contra a presença de ${div.nome} (GD ${div.gd}): estou ${efeito.toLowerCase()} (desvantagem) neste combate. Narre o peso avassalador da divindade — mas o efeito mecânico já foi aplicado, não aplique outro.`;
          } else {
            msgs.push(`🌑 A presença de ${div.nome} (GD ${div.gd}) pesa como chumbo — você firma os pés e RESISTE (${rJ} vs ${cd}).`);
          }
          /* companheiros: vínculo 4+ imune; itens consagrados dão +4 */
          const novosGrupo = (pers.grupo || []).map((g) => {
            if ((g.vinculo ?? 0) >= 4) return g;
            const rG = rolo() + Math.max(g.atributos?.vigor || 0, 1) + (protegido(g) ? 4 : 0);
            if (rG >= cd) return g;
            msgs.push(`🌑 ${g.nome} não suporta olhar para ${div.nome} — fica amedrontado neste combate.`);
            return { ...g, condicoes: [...(g.condicoes || []).filter((x) => x.id !== "amedrontado"), criarCondicao("amedrontado", { turnos: 3, origem: `presença de ${div.nome}` })] };
          });
          pers = { ...pers, grupo: novosGrupo };
          setPersonagem(pers);
        }
      }
      /* CÓDEX: toda criatura que entra em combate vira registro no bestiário */
      (resp.mudancas.combate_iniciar || []).forEach((ini) => {
        if (ini?.nome && !descobRef.current.some((d) => d.toLowerCase() === ini.nome.toLowerCase())) {
          descobRef.current = [...descobRef.current, ini.nome];
          setDescobertas(descobRef.current);
        }
      });
      /* HUD FANTASMA: se o painel de combate está aberto mas ninguém troca golpes
         (o Mestre seguiu a narrativa sem encerrar), o app fecha sozinho após 2
         turnos parados. Evita o combate "preso" na tela por vários turnos. */
      if (combateRef.current) {
        const houveIniciar = Array.isArray(resp.mudancas.combate_iniciar) && resp.mudancas.combate_iniciar.length > 0;
      /* INICIATIVA (v8.9): combate novo → o sistema rola a ordem do turno. */
      if (houveIniciar && combateRef.current && !combateRef.current.ordem) {
        const participantes = [
          { nome: pers.nome, lado: "heroi", modDestreza: atributoEfetivo(pers, "destreza") },
          ...(pers.grupo || []).map((g) => ({ nome: g.nome, lado: "aliado", modDestreza: 1 })),
          ...(combateRef.current.inimigos || []).map((e) => ({ nome: e.nome, lado: "inimigo", modDestreza: e.agil ? 2 : 0 })),
        ];
        const ordem = rolarIniciativa(participantes);
        combateRef.current = { ...combateRef.current, ordem, rodada: 1, recursos: novosRecursos() };
        setCombate(combateRef.current);
        msgs.push(`🎲 Iniciativa — ${resumoIniciativa(ordem)}`);
        notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INICIATIVA ROLADA PELO SISTEMA] Ordem do combate: ${resumoIniciativa(ordem)}. Respeite essa ordem ao narrar quem age quando.`;
      }
        const houveDano = Array.isArray(resp.mudancas.combate_inimigo_vida) && resp.mudancas.combate_inimigo_vida.length > 0;
        const houveAtaqueMeu = ataqueResolvidoRef.current;
        if (houveIniciar || houveDano || houveAtaqueMeu) combateOciosoRef.current = 0;
        else combateOciosoRef.current += 1;
        if (combateOciosoRef.current >= 2) {
          combateOciosoRef.current = 0;
          combateRef.current = null; setCombate(null);
          msgs.push("⚔ O confronto se dissolve — o painel de combate se fecha.");
        }
      } else combateOciosoRef.current = 0;
      ataqueResolvidoRef.current = false;
      /* vitória detectada por código: pede ao Mestre os espólios se ele ainda
         não os deu neste turno (evita esperar ele "perceber" a morte) */
      if (resp.mudancas.__vitoriaAuto) {
        /* ESPÓLIOS POR CÓDIGO: moedas e XP por tabela; nível sobe sozinho.
           A IA só narra — e cria o item quando o app decide que caiu um. */
        const esp = gerarEspolios(resp.mudancas.__inimigosFinais || []);
        let p2 = { ...pers, moedas: (pers.moedas || 0) + esp.moedas, xp: (pers.xp || 0) + esp.xp };
        let subiu = 0;
        while (p2.xp >= XP_POR_NIVEL(p2.nivel)) { p2.xp -= XP_POR_NIVEL(p2.nivel); p2.nivel += 1; p2.nivelPendentes = (p2.nivelPendentes || 0) + 1; subiu++; }
        p2.grupo = (p2.grupo || []).map((g) => { const ev = evoluirCompanheiro({ ...g, xp: (g.xp || 0) + esp.xp }); const m2 = ev._subiu; delete ev._subiu; if (m2) msgs.push(`✦ ${g.nome} subiu para o nível ${ev.nivel}!`); return ev; });
        msgs.push(`◉ Espólios: +${esp.moedas} moedas · +${esp.xp} XP${subiu ? ` · ✦ NÍVEL ${p2.nivel}!` : ""}`);
        pers = p2;
        setPersonagem(p2);
        /* CÓDEX: contabiliza a vitória — combate vencido + abates por ameaça */
        const fins = resp.mudancas.__inimigosFinais || [];
        /* v9.0: quem caiu no combate e TEM ficha no mundo morre no mundo —
           inclusive a nêmesis. Antes, matá-la em cena não desligava a
           perseguição: ela continuava com ódio crescendo no painel. */
        fins.forEach((e) => { if (e && e.nome) registrarMorteDeAlvo(e.nome, "morto por mim em combate"); });
        bumpCont("combatesVencidos", 1);
        avancarMinutos(MINUTOS_POS_COMBATE); // a luta em si é rápida; o rescaldo leva meia hora
        bumpCont("inimigosDerrotados", fins.length);
        bumpCont("elitesDerrotados", fins.filter((e) => e.ameaca === "elite").length);
        bumpCont("lendariosDerrotados", fins.filter((e) => e.ameaca === "lendario").length);
        checarFama(); tentarSurgirNemesis(); // grandes feitos fazem o nome correr — e atraem ódio
        /* VÍNCULO: sangue derramado junto aproxima (+2 para todo o grupo) */
        p2 = { ...p2, grupo: aplicarVinculo(p2.grupo, "todos", 2, msgs) };
        /* LOOT PROCEDURAL: quando cai item, o CÓDIGO gera pela tabela (a IA só
           descreve o achado — não inventa mais equipamento de vitória) */
        let itemCaido = null;
        if (esp.caiItem) {
          itemCaido = gerarEspolioItem(resp.mudancas.__inimigosFinais || [], p2.nivel || 1);
          p2 = { ...p2, equipamento: [...(p2.equipamento || []), itemCaido] };
          msgs.push(`✦ Espólio raro: ${itemCaido.nome} (${RARIDADE_ROTULO[itemCaido.raridade] || itemCaido.raridade}) — na mochila de equipamentos`);
        }
        /* CONSUMÍVEIS (v9.2): o que realmente enche a bolsa depois de uma luta */
        const consCaidos = [];
        for (let i = 0; i < (esp.consumiveis || 0); i++) {
          const c = sortearConsumivel(p2.nivel || 1);
          if (!c) continue;
          consCaidos.push(c);
          p2 = { ...p2, inventario: [...(p2.inventario || []), itemConsumivel(c.id)] };
        }
        if (consCaidos.length) msgs.push(`${consCaidos[0].icone} Na bolsa: ${consCaidos.map((c) => c.nome).join(", ")}`);
        /* PODER ÚNICO (v7.4.4): vitória sobre elite/lendário pode despertar
           uma habilidade só sua — gerada e limitada pelo sistema */
        p2 = talvezDespertarUnica(p2, resp.mudancas.__inimigosFinais || [], msgs);
        /* MASMORRA: vitória na sala do CHEFE conclui a masmorra por código —
           moedas do fundo + item épico/lendário garantido */
        let chefeCaido = false;
        const salaCorrente = masmorraRef.current ? masmorraRef.current.salas.find((x) => x.id === masmorraRef.current.atual) : null;
        if (salaCorrente && salaCorrente.tipo === "chefe") {
          const mm = masmorraRef.current;
          const sala = salaCorrente;
          const rec = recompensaChefe(p2.nivel || 1);
          p2 = { ...p2, moedas: (p2.moedas || 0) + (sala.moedas || 0), equipamento: [...(p2.equipamento || []), rec.item] };
          msgs.push(`🕳 ${mm.nome} CONCLUÍDA! Tesouro do fundo: +${sala.moedas} moedas · ✦ ${rec.item.nome} (${RARIDADE_ROTULO[rec.item.raridade] || rec.item.raridade})`);
          masmorraRef.current = null; setMasmorra(null);
          bumpCont("masmorrasConcluidas");
          chefeCaido = true;
        } else if (masmorraRef.current && salaEmCursoRef.current !== null) {
          resolverSalaAposCombate();
        }
        pers = p2;
        setPersonagem(p2);
        notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[VITÓRIA — espólios já aplicados pelo sistema: +${esp.moedas} moedas e +${esp.xp} XP para todos] NÃO envie moedas nem xp (seria dobrado). Narre o desfecho da luta em 2-3 frases.${itemCaido ? ` O SISTEMA derrubou um item: "${itemCaido.nome}" (${itemCaido.raridade}${itemCaido.poder ? `, poder: ${itemCaido.poder}` : ""}) — já está na minha mochila, NÃO envie "adicionar_equipamento" nem "adicionar_itens". Apenas descreva o achado com emoção, coerente com os inimigos derrotados.` : " Nenhum equipamento especial desta vez — não envie itens."}${consCaidos.length ? ` O sistema também colocou na minha bolsa: ${consCaidos.map((c) => c.nome).join(", ")} — já estão comigo, não envie itens por isso; mencione de passagem onde estavam (num cinto, numa sacola, no corpo de alguém).` : ""}${chefeCaido ? " A MASMORRA FOI CONCLUÍDA e o tesouro do chefe já foi entregue pelo sistema — narre a saída triunfal e retome o mundo lá fora." : ""}`;
      }
    }
    /* ---- CÃO DE GUARDA DE CONDIÇÕES (v9.0) ----
       O Mestre narrou "o veneno sobe pelo seu braço" e esqueceu de registrar?
       O sistema lê a narração, reconhece a condição no catálogo e APLICA — a
       ficção deixa de ser enfeite e vira mecânica. Só conta quando a frase
       fala do herói e não está negada; e o inverso também vale: se ele narrou
       explicitamente que a condição passou, o sistema tira. */
    try {
      const nar = resp.narrativa || "";
      const achados = detectarCondicoesNarradas(nar, { nomeHeroi: pers.nome, jaAtivas: pers.condicoes || [] });
      achados.slice(0, 3).forEach((a) => {
        const cond = criarCondicao(a.id, { origem: "narrado pelo Mestre" });
        if (!cond) return;
        const r = aplicarCondicaoEm(pers, "você", cond);
        pers = r.pers;
        msgs.push(`${cond.icone} O Mestre narrou — o sistema aplicou: ${cond.nome}${cond.turnos ? ` (${cond.turnos}t)` : ""}. ${cond.efeito}`);
        notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[CONDIÇÃO — APLICADA PELO SISTEMA A PARTIR DA SUA NARRAÇÃO] Você escreveu "${a.trecho}" e não registrou a condição. O sistema aplicou ${cond.nome} em mim (${cond.efeito}). Da próxima vez use "condicoes_adicionar" — e a partir de agora trate isso como fato mecânico, não como imagem.`;
      });
      const alivios = detectarAliviosNarrados(nar, pers.condicoes || []);
      alivios.forEach((inst) => {
        const r = removerCondicaoDe(pers, "você", inst.id, inst.nome);
        pers = r.pers;
        if (r.texto) msgs.push(`${r.texto} (narrado pelo Mestre)`);
      });
    } catch { /* o cão de guarda nunca derruba o turno */ }
    try { conferirNemesisNaNarrativa(resp.narrativa); } catch { /* idem */ }
    /* detector de repetição: mede se o Mestre voltou a usar interrupção urgente */
    {
      const nrt = (resp.narrativa || "").toLowerCase();
      const marcas = /irromp|invade o|invadem o|arromb/.test(nrt)
        || /(porta|portas)[^.]{0,40}(se abre|se abrem|escancar)/.test(nrt)
        || /(mensageiro|arauto|batedor|soldado)[^.]{0,40}(ofegante|corre|irrompe|chega gritando)/.test(nrt)
        || /(arrast|jogam|atiram)[^.]{0,40}(aos seus pés|para dentro)/.test(nrt)
        || /(urgênc|urgente|emergênc|com pressa|sem fôlego)/.test(nrt)
        || /(interromp|é rompid|foi rompid|se lança (pelo|para)|surge de repente|de súbito)/.test(nrt);
      urgenciaRef.current = marcas ? urgenciaRef.current + 1 : 0;
    }
    pushMsgs([{ autor: "mestre", texto: resp.narrativa || "…" }, ...msgs.map((t) => ({ autor: "sistema", texto: t }))]);
    /* decisor de testes por código: se a dificuldade é trivial para o herói
       (modificador torna a falha impossível), nem mostra o dado — sucesso direto */
    let rolagemFinal = resp.rolagem || null;
    if (rolagemFinal && (rolagemFinal.dificuldade != null || rolagemFinal.perfil)) {
      const attrT = ATRIBUTOS.find((x) => x.nome.toLowerCase() === (rolagemFinal.atributo || "").toLowerCase());
      const modT = attrT ? atributoEfetivo(pers, attrT.id) : 0;
      /* DIFICULDADE POR PERFIL (v7.4.2): o Mestre manda o perfil ("digno",
         "dificil", "formidavel") e o CÓDIGO calcula o número a partir do
         modificador do herói — desafio digno rola dado em qualquer nível */
      const dcPerfil = dificuldadePorPerfil(modT, rolagemFinal.perfil);
      if (dcPerfil != null) rolagemFinal = { ...rolagemFinal, dificuldade: dcPerfil };
      /* janela rolável: dificuldade impossível (falha mesmo com 20) é
         recalibrada para o teto formidável — teste impossível o Mestre nega,
         não testa */
      if (rolagemFinal.dificuldade != null && rolagemFinal.dificuldade > modT + 19) rolagemFinal = { ...rolagemFinal, dificuldade: modT + 14 };
      if (avaliarTeste(modT, rolagemFinal.dificuldade) === "auto") rolagemFinal = { ...rolagemFinal, auto: true };
    }
    setRolagem(rolagemFinal);
    /* CÓDEX: novos companheiros, quase-morte e checagem de conquistas do turno */
    {
      const antes = (persAtual.grupo || []).length, agora = (pers.grupo || []).length;
      if (agora > antes) bumpCont("recrutados", agora - antes);
      let tocouVinculo = false;
      /* VÍNCULO: chegar a 0 PV e sobreviver une o grupo (+4); deixar um
         companheiro cair pesa (−6 só para quem caiu) */
      if ((persAtual.vida || 0) > 0 && (pers.vida || 0) <= 0) {
        bumpCont("quaseMorte", 1);
        pers = { ...pers, grupo: aplicarVinculo(pers.grupo, "todos", 4, null) };
        /* CICATRIZ (v6.6): sobreviver por um fio pode deixar marca permanente */
        if (Math.random() < 0.45 && (pers.cicatrizes || []).length < CICATRIZ_MAX) {
          const c = sortearCicatriz(pers.cicatrizes || []);
          if (c) {
            const vidaMax = Math.max(5, (pers.vidaMax || 10) + (c.vidaMax || 0));
            pers = { ...pers, cicatrizes: [...(pers.cicatrizes || []), { ...c, dia: diaRef.current }], vidaMax, vida: Math.min(pers.vida, vidaMax) };
            pushMsgs([{ autor: "sistema", texto: `🩸 Cicatriz permanente: ${c.nome} — ${c.descricao}${c.vidaMax ? ` (−${-c.vidaMax} PV máx.)` : ""}` }]);
            notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[CICATRIZ — CANON PERMANENTE] Quase morri e fiquei com uma marca para sempre: "${c.nome}" (${c.local}), no dia ${diaRef.current} da campanha. ${c.descricao} Isso agora faz parte do meu corpo e da minha história — pode ser lembrado, comentado e ter consequências na ficção, mas NUNCA some sozinho.`;
          }
        }
        tocouVinculo = true;
      }
      (pers.grupo || []).forEach((g) => {
        const antesG = (persAtual.grupo || []).find((a) => a.nome === g.nome);
        if (antesG && (antesG.vida || 0) > 0 && (g.vida || 0) <= 0) {
          pers = { ...pers, grupo: aplicarVinculo(pers.grupo, g.nome, -6, null) };
          tocouVinculo = true;
        }
      });
      if (tocouVinculo) setPersonagem(pers);
      checarConquistas(pers);
    }
    return pers;
  }, [pushMsgs]);

  /* CRONISTA DO TURNO (v7.4.2): fusão do Fiscal de Missões com o Escriba —
     UMA única chamada leve por turno (antes eram duas: metade do custo e da
     latência) julga o turno inteiro de uma vez e devolve um JSON por seções.
     O CÓDIGO aplica cada seção ISOLADAMENTE: se uma vier quebrada, as outras
     ainda valem. Conservador de propósito: seções vazias são comuns. */
  const cronistaDoTurno = async (pers, narrativa) => {
    if (!narrativa || narrativa.length < 60) return;
    const ativas = questsRef.current.filter((q) => q.status === "ativa");
    try {
      const sys = [
        "Você é o CRONISTA de um RPG. Você NÃO narra: lê a narrativa do turno e julga, por seções, o que o SISTEMA deve registrar. Responda APENAS em JSON:",
        "{\"missoes\":{\"concluidas\":[\"titulo exato\"],\"falhadas\":[\"titulo exato\"],\"progresso\":[{\"titulo\":\"...\",\"nota\":\"resumo curto\"}],\"global_encerrado\":false},\"canone\":{\"Nome\":{\"tipo\":\"artefato|pessoa|lugar|promessa|segredo|organizacao\",\"descricao\":\"o que é, 1 frase factual\",\"detalhes\":\"aparência/origem/dono\",\"local\":\"\"}},\"pessoas\":[{\"nome\":\"\",\"papel\":\"\",\"relacao\":\"aliado|amigo|romance|familia|neutro|rival|inimigo\",\"local\":\"\",\"notas\":\"máx. 8 palavras\"}],\"fe\":{\"fieis\":0,\"pf\":0,\"motivo\":\"\",\"acontecimento\":null},\"grupo\":{\"entraram\":[]},\"teste_sugerido\":null,\"combate\":{\"mortes_narradas\":[]}}",
        "SEÇÃO missoes: (1) \"concluida\" SÓ com objetivo CUMPRIDO de fato e sem dúvida neste turno; (2) \"falhada\" só se impossível ou explicitamente perdida; (3) avanço parcial real vira \"progresso\"; (4) copie os títulos EXATAMENTE; (5) \"global_encerrado\": true SÓ se o EVENTO GLOBAL (se listado) foi RESOLVIDO de fato — a ameaça central derrotada/desfeita, não um avanço.",
        "SEÇÃO canone: fatos DURÁVEIS — artefatos e objetos relevantes que o herói ganhou/achou/descobriu (com o que o objeto É de fato; saque comum não entra), lugares importantes, promessas, segredos. NÃO reescreva nem contradiga o CÂNONE ATUAL — só crie novo ou acrescente campo novo.",
        "SEÇÃO pessoas: pessoas COM NOME e papel durável (aliados recorrentes, rivais, contatos) que ainda não estão no ELENCO — figurantes de cena única ficam de fora.",
        "SEÇÃO fe: SÓ se o turno mostrou o nome do herói ganhando DEVOÇÃO real. Para gestos comuns, fieis 10 a 500, pf 1 a 10; na dúvida, 0. Para GRANDES acontecimentos de fé, NÃO chute números: preencha \"acontecimento\":{\"tipo\":\"alianca_reino|libertacao|milagre_publico|santuario|conversao_lider|vitoria_lendaria|pregacao\",\"local\":\"nome da cidade/reino\"} e deixe fieis/pf em 0 — o SISTEMA calcula pela população do local. Um povo/reino inteiro prometendo sua fé ao herói É \"alianca_reino\" (ou \"libertacao\", se o herói o libertou) — NUNCA deixe isso passar sem registrar.",
        "O CAMPO \"local\" É O MAIS IMPORTANTE DA SEÇÃO fe: a devoção mora em cidades reais do mapa, não no ar. Use SEMPRE o nome exato da cidade onde o feito foi testemunhado (vale também no campo \"local\" solto, junto de fieis/pf). Sem local reconhecível, a fé vira \"andarilhos\" — conta muito menos e míngua rápido.",
        "SEÇÃO grupo: \"entraram\" = nomes de pessoas que ACEITARAM de fato acompanhar o herói como companheiros de jornada NESTE turno (o Mestre narrando \"vou com você\" conta). Se o convite foi recusado ou só um encontro casual, [].",
        "SEÇÃO teste_sugerido: se o Mestre CONCEDEU de graça algo grande que deveria ter exigido convencimento — uma criatura anciã entregando seu poder, um rei cedendo o trono, um inimigo virando aliado do nada — preencha {\"atributo\":\"Presença|Intelecto|Força|Destreza|Vigor\",\"perfil\":\"dificil|formidavel\",\"motivo\":\"o que precisava ser provado\"}. Concessões pequenas e naturais da história NÃO entram. Na maioria dos turnos: null.",
        "SEÇÃO combate (só se houver COMBATENTES listados): \"mortes_narradas\" = inimigos que a NARRATIVA declarou mortos/destruídos/desfeitos NESTE turno. Liste só nomes da lista de combatentes; se ninguém morreu na narração, [].",
        "REGRA GERAL: na dúvida, NÃO marque — {\"missoes\":{\"concluidas\":[],\"falhadas\":[],\"progresso\":[],\"global_encerrado\":false},\"canone\":{},\"pessoas\":[],\"fe\":{\"fieis\":0,\"pf\":0}} é resposta válida e frequente.",
      ].join("\n");
      const lista = ativas.map((q) => `- "${q.titulo}" (${q.tipo}) — objetivo: ${q.objetivo || q.descricao || "—"}`).join("\n");
      const evG = eventosRef.current && eventosRef.current.global;
      const combatentes = (combateRef.current && combateRef.current.inimigos || []).filter((e) => !e.derrotado && e.vida > 0);
      const user = `MISSÕES ATIVAS:\n${lista || "(nenhuma)"}\n\nEVENTO GLOBAL ATIVO:\n${evG ? `- "${evG.nome}" — ${(evG.etapas || [])[evG.etapa] || evG.descricao || "—"}` : "(nenhum)"}\n\nCOMBATENTES AINDA DE PÉ (nome — PV):\n${combatentes.map((e) => `- ${e.nome} — ${e.vida} PV`).join("\n") || "(sem combate aberto)"}\n\nCÂNONE ATUAL:\n${formatarCanone(canoneRef.current) || "(vazio)"}\n\nELENCO (pessoas já registradas):\n${Object.keys(npcsRef.current).join(", ") || "(ninguém)"}\n\nNARRATIVA DO TURNO:\n${narrativa}`;
      const txt = await chamarModelo(sys, [{ role: "user", content: user }], 900, "json", "leve");
      const r = parseObjetoTolerante(txt);
      if (!r || typeof r !== "object") return;
      const msgs = [];
      let p = pers;
      /* ---- SEÇÃO missões (isolada) ---- */
      try {
        const rm = r.missoes && typeof r.missoes === "object" ? r.missoes : {};
        const casar = (t) => {
          const alvo = String(t || "").toLowerCase();
          if (!alvo) return null;
          return ativas.find((q) => q.titulo.toLowerCase() === alvo)
            || (alvo.length > 8 ? ativas.find((q) => q.titulo.toLowerCase().includes(alvo) || alvo.includes(q.titulo.toLowerCase())) : null);
        };
        let recompensa = null;
        [].concat(rm.concluidas || []).forEach((t) => {
          const q = casar(t); if (!q) return;
          questsRef.current = questsRef.current.map((x) => x.titulo === q.titulo ? { ...x, status: "concluida" } : x);
          msgs.push(`✓ Missão concluída: ${q.titulo} (reconhecida pelo sistema)`);
          if (divindadeRef.current && divindadeRef.current.despertar) msgs.push(...ganharFe(q.tipo === "principal" ? 150 : 40, 2, "seu feito corre de boca em boca"));
          if (q.contrato && !recompensa) recompensa = q.contrato;
        });
        [].concat(rm.falhadas || []).forEach((t) => {
          const q = casar(t); if (!q) return;
          questsRef.current = questsRef.current.map((x) => x.titulo === q.titulo ? { ...x, status: "falhada" } : x);
          msgs.push(`✗ Missão falhou: ${q.titulo} (reconhecida pelo sistema)`);
        });
        [].concat(rm.progresso || []).forEach((pr) => {
          if (!pr || !pr.titulo || !pr.nota) return;
          const q = casar(pr.titulo); if (!q) return;
          questsRef.current = questsRef.current.map((x) => x.titulo === q.titulo ? { ...x, nota: String(pr.nota).slice(0, 120) } : x);
          msgs.push(`📜 ${q.titulo}: ${pr.nota}`);
        });
        if (rm.global_encerrado === true && eventosRef.current && eventosRef.current.global) {
          const g = eventosRef.current.global;
          eventosRef.current = { ...eventosRef.current, global: null, semGlobalDesde: diaRef.current };
          setEventos(eventosRef.current);
          msgs.push(`🌍 ${g.nome}: desfecho alcançado (reconhecido pelo sistema) — a região entra numa nova era.`);
          if (divindadeRef.current && divindadeRef.current.despertar) msgs.push(...ganharFe(500, 10, "uma era inteira reza seu nome"));
          notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[EVENTO GLOBAL "${g.nome}" ENCERRADO pelo sistema — NÃO o continue nem o encerre de novo: a região vive a nova era. O gerador semeará um arco novo quando chegar a hora.]`;
        }
        if (recompensa) {
          bumpCont("contratosConcluidos");
          p = aplicarNivel({ ...p, moedas: (p.moedas || 0) + recompensa.moedas, xp: (p.xp || 0) + recompensa.xp });
          msgs.push(`📋 Contrato pago pelo sistema: +${recompensa.moedas} moedas · +${recompensa.xp} XP`);
          notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[CONTRATO PAGO pelo sistema: +${recompensa.moedas} moedas e +${recompensa.xp} XP — NÃO envie moedas nem xp por esse serviço, seria dobrado. A missão já consta como concluída no diário, não a conclua de novo.]`;
        }
        if (msgs.length) { setQuests([...questsRef.current]); setPersonagem(p); }
      } catch { /* seção quebrada não derruba as outras */ }
      /* ---- SEÇÃO pessoas (isolada) ---- */
      try {
        if (Array.isArray(r.pessoas) && r.pessoas.length) {
          let reg = npcsRef.current, tocou = false;
          r.pessoas.slice(0, 4).forEach((n) => {
            if (!n || !n.nome) return;
            const chave = Object.keys(reg).find((k) => k.toLowerCase() === String(n.nome).toLowerCase());
            if (!tocou) { reg = { ...reg }; tocou = true; }
            if (chave) reg[chave] = mesclarNPC(reg[chave], n);
            else { reg[String(n.nome).slice(0, 40)] = criarNPC(String(n.nome).slice(0, 40), { ...n, conhecidoEm: diaRef.current }); msgs.push(`✒ Cronista registrou no elenco: ${n.nome}`); }
          });
          if (tocou) { npcsRef.current = reg; setNpcs(reg); sincronizarNemesis(); }
        }
      } catch { /* seção quebrada não derruba as outras */ }
      /* ---- SEÇÃO fé (isolada) ---- */
      try {
        if (r.fe && typeof r.fe === "object" && divindadeRef.current && divindadeRef.current.despertar) {
          const f = Math.max(0, Math.min(500, Math.round(r.fe.fieis || 0)));
          const pf = Math.max(0, Math.min(10, Math.round(r.fe.pf || 0)));
          if (f || pf) msgs.push(...ganharFe(f, pf, String(r.fe.motivo || "sua fama vira prece").slice(0, 80), r.fe.local || ""));
          /* GRANDES ACONTECIMENTOS (v7.5): o Cronista classifica, a TABELA
             DE FÉ calcula sobre a população real do local no mapa — assim
             "o reino inteiro dos anões lhe devota fé" vira números de fato. */
          const ac = r.fe.acontecimento;
          if (ac && typeof ac === "object" && ac.tipo) {
            const calc = fePorAcontecimento(String(ac.tipo), ac.local || "");
            if (calc) {
              msgs.push(...ganharFe(calc.fieis, calc.pf, `${calc.rotulo}${calc.pop ? ` (pop. ${calc.pop.toLocaleString("pt-BR")})` : ""}`, ac.local || ""));
              notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[FÉ — REGISTRO DO SISTEMA] ${calc.rotulo}${ac.local ? ` em ${ac.local}` : ""}: +${calc.fieis} fiéis, +${calc.pf} PF, calculados pela população do local. Isso já está contabilizado — narre a devoção chegando, não a negue.`;
            }
          }
        }
      } catch { /* seção quebrada não derruba as outras */ }
      /* ---- SEÇÃO combate: CÃO DE GUARDA DE COESÃO (v7.4.4) ----
         O Mestre declarou morto quem o SISTEMA mantém de pé? Correção
         pública + nota firme — o PV não muda, a NARRATIVA é que se alinha. */
      try {
        const mortes = (r.combate && Array.isArray(r.combate.mortes_narradas)) ? r.combate.mortes_narradas : [];
        const vivosAgora = (combateRef.current && combateRef.current.inimigos || []).filter((e) => !e.derrotado && e.vida > 0);
        mortes.forEach((nome) => {
          const alvo = vivosAgora.find((e) => (e.nome || "").toLowerCase() === String(nome || "").toLowerCase());
          if (!alvo) return;
          msgs.push(`⚖ Coesão do sistema: ${alvo.nome} NÃO morreu — ainda tem ${alvo.vida} PV. A narração da morte foi exagero; a luta continua.`);
          notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[CORREÇÃO DE COESÃO — REGRA ABSOLUTA] Você narrou a morte de ${alvo.nome}, mas o SISTEMA registra ${alvo.vida} PV: ele está VIVO e em combate. RETOME tratando-o como vivo — sem ressuscitar, sem cinzas, sem "última investida póstuma": ele simplesmente NÃO morreu. Dano e morte são decididos SÓ pelo sistema (envelopes [COMBATE — RESOLVIDO] e o PV do painel); palavras de empolgação do jogador ("estraçalho você!") são figura de linguagem, NUNCA resultado.`;
        });
      } catch { /* seção quebrada não derruba as outras */ }
      /* ---- SEÇÃO cânone (isolada) ---- */
      let tocouCanone = false;
      try {
        if (r.canone && typeof r.canone === "object") {
          const c = { ...canoneRef.current };
          const novos = [];
          for (const [nome, ficha] of Object.entries(r.canone)) {
            if (!nome || !ficha || typeof ficha !== "object") continue;
            const chaveExistente = Object.keys(c).find((k) => k.toLowerCase() === String(nome).toLowerCase());
            if (!chaveExistente) {
              c[String(nome)] = { ...ficha, registradoDia: diaRef.current };
              novos.push(nome);
            } else {
              /* só preenche o que estiver vazio — identidade NUNCA é reescrita */
              const alvo = { ...c[chaveExistente] };
              for (const [k, v] of Object.entries(ficha)) {
                if (v && (alvo[k] === undefined || alvo[k] === "")) alvo[k] = v;
              }
              c[chaveExistente] = alvo;
            }
          }
          if (novos.length) { canoneRef.current = c; tocouCanone = true; msgs.push(...novos.map((n) => `✒ Cronista registrou no cânone: ${n}`)); }
        }
      } catch { /* seção quebrada não derruba as outras */ }
      /* ---- SEÇÃO grupo: RECRUTAMENTO REAL (v7.5) ----
         O Mestre narrava "vou com você" e o convite se perdia no ar — o
         companheiro nunca entrava na ficha. Agora o Cronista aponta quem
         aceitou e o CÓDIGO assina o registro (com os dados do elenco, se houver). */
      try {
        const entraram = (r.grupo && Array.isArray(r.grupo.entraram)) ? r.grupo.entraram : [];
        if (entraram.length) {
          const grupoAtual = [...(p.grupo || [])];
          entraram.forEach((nome0) => {
            const nome = String(nome0 || "").slice(0, 40).trim();
            if (!nome) return;
            if (grupoAtual.some((x) => (x.nome || "").toLowerCase() === nome.toLowerCase())) return;
            if (grupoAtual.length >= MAX_COMPANHEIROS) { msgs.push(`O grupo está cheio — ${nome} não pôde se juntar.`); return; }
            const fichaElenco = Object.values(npcsRef.current).find((n) => (n.nome || "").toLowerCase() === nome.toLowerCase());
            const nivelC = Math.max(1, (p.nivel || 1) - 2);
            const vidaMaxC = 10 + (nivelC - 1) * 3;
            grupoAtual.push({ nome, conceito: (fichaElenco && fichaElenco.papel) || "", nivel: nivelC, vida: vidaMaxC, vidaMax: vidaMaxC, descricao: (fichaElenco && fichaElenco.notas) || "", habilidades: [], semente: `npc|${nome}|${(fichaElenco && fichaElenco.papel) || ""}`, vinculo: VINCULO_INICIAL, marcos: [] });
            msgs.push(`⚑ ${nome} juntou-se ao grupo — ficha registrada pelo sistema.`);
            notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[RECRUTAMENTO — REGISTRO DO SISTEMA] ${nome} agora FAZ PARTE do grupo do herói (nível ${nivelC}, ${vidaMaxC} PV — ficha criada pelo sistema, você não precisa mandar "grupo_adicionar"). Trate-o como companheiro presente nas cenas: opina, ajuda em combate, viaja junto.`;
          });
          if (grupoAtual.length !== (p.grupo || []).length) { p = { ...p, grupo: grupoAtual }; setPersonagem(p); }
        }
      } catch { /* seção quebrada não derruba as outras */ }
      /* ---- SEÇÃO teste_sugerido: CONCESSÃO GRANDE EXIGE PROVA (v7.5) ----
         O caso do lobo ancestral: o Mestre entregou de graça algo que deveria
         ter sido conquistado. O Cronista sinaliza e o CÓDIGO abre um teste
         real (dificuldade por perfil, calculada do modificador do herói) para
         selar a concessão — se passar, o feito é canon; se falhar, o Mestre
         narra a resistência (sem apagar o que já foi dito, o tom muda). */
      try {
        const ts = r.teste_sugerido;
        if (ts && typeof ts === "object" && ts.atributo && !rolagem && !combateRef.current) {
          const attrT = ATRIBUTOS.find((x) => x.nome.toLowerCase() === String(ts.atributo).toLowerCase());
          if (attrT) {
            const modT = atributoEfetivo(p, attrT.id);
            const dc = dificuldadePorPerfil(modT, ts.perfil === "formidavel" ? "formidavel" : "dificil");
            const motivo = String(ts.motivo || "concessão grande demais para ser de graça").slice(0, 120);
            setRolagem({ atributo: attrT.nome, dificuldade: dc, motivo, origem: "cronista" });
            msgs.push(`🎲 O sistema pediu prova — ${attrT.nome} (dificuldade ${dc}): ${motivo}`);
            notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[TESTE EXIGIDO PELO SISTEMA] A concessão que você narrou (${motivo}) é grande demais para ser de graça: o sistema abriu um teste de ${attrT.nome} (dificuldade ${dc}). Se o herói PASSAR, tudo que você narrou é canon e selado; se FALHAR, narre a concessão se complicando (condição, preço, resistência parcial) — sem apagar o que foi dito, mas sem entregar o ouro inteiro de bandeja.`;
          }
        }
      } catch { /* seção quebrada não derruba as outras */ }
      if (!msgs.length) return;
      /* o prompt precisa enxergar TUDO já no PRÓXIMO turno */
      if (tocouCanone || msgs.length) systemRef.current = montarSystemPrompt(nomeCampanha, mundo, p, livroRef.current, canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade(), infoTitulo());
      pushMsgs(msgs.map((t) => ({ autor: "sistema", texto: t })));
      salvar({ personagem: p });
    } catch { /* o cronista NUNCA atrapalha o jogo — falhou, vida segue */ }
  };

  /* GANHO DE FÉ POR CÓDIGO (v7.4): fiéis e PF mudam por aqui — e cada degrau
     de GD conquistado é anunciado e já entra no prompt do próximo turno. */
  /* TABELA DE FÉ (v7.5): a fé deixou de ser chute do Mestre. Cada TIPO de
     acontecimento rende uma FRAÇÃO da população do local como fiéis, mais
     PF fixos — um milagre numa aldeia de 200 almas não pode render o mesmo
     que numa metrópole de 200 mil. O Cronista só CLASSIFICA o acontecimento;
     o CÓDIGO mede a população no mapa e faz a conta. */
  const TABELA_FE = {
    alianca_reino:    { frac: 0.04, pf: 10, rotulo: "aliança com um reino inteiro" },
    libertacao:       { frac: 0.06, pf: 12, rotulo: "libertação de um povo oprimido" },
    milagre_publico:  { frac: 0.02, pf: 6,  rotulo: "milagre testemunhado em público" },
    santuario:        { fixo: 300, frac: 0.01, pf: 4, rotulo: "santuário erguido em seu nome" },
    conversao_lider:  { frac: 0.03, pf: 6,  rotulo: "conversão de um líder local" },
    vitoria_lendaria: { frac: 0.05, pf: 10, rotulo: "vitória sobre ameaça lendária" },
    pregacao:         { frac: 0.005, pf: 2, rotulo: "pregação ou feito menor de fé" },
  };
  /* acha a cidade citada no mapa (exato ou por aproximação) e devolve a população */
  const populacaoDe = (local) => {
    if (!local) return 0;
    const alvo = String(local).toLowerCase().trim();
    const cidades = (mapaRef.current && mapaRef.current.cidades) || [];
    const exata = cidades.find((c) => (c.nome || "").toLowerCase() === alvo);
    const citada = exata || cidades.find((c) => alvo.includes((c.nome || "").toLowerCase()) || (c.nome || "").toLowerCase().includes(alvo));
    return citada ? (citada.populacao || 0) : 0;
  };
  const fePorAcontecimento = (tipo, local) => {
    const t = TABELA_FE[tipo];
    if (!t) return null;
    const pop = populacaoDe(local);
    const fieis = Math.max(10, Math.round((t.fixo || 0) + pop * t.frac));
    return { fieis: Math.min(fieis, 2000000), pf: t.pf, rotulo: t.rotulo, pop };
  };

  /* TÍTULO ÚNICO (v7.6): resolve o nome que a ficha mostra e que o Mestre usa.
     Fé tem precedência (é o que o herói É); sem fé, vale a fama. */
  /* VÍNCULOS (v7.8): o Mestre não sabia se um companheiro te adora ou te
     tolera — então a intimidade das falas era chute. Agora ele sabe. */
  const infoVinculos = () => {
    const g = ((personagem || personagemRef.current || {}).grupo || []).filter((x) => x && x.nome);
    if (!g.length) return "";
    const linhas = g.map((c) => {
      const v = typeof c.vinculo === "number" ? c.vinculo : VINCULO_INICIAL;
      const m = marcoDe(v);
      return `${c.nome}: ${v}/100 (${m ? m.rotulo : "conhecidos"})`;
    });
    return `VÍNCULOS DO GRUPO (trate cada um com a intimidade certa — quem tem vínculo baixo NÃO faz confidências nem se sacrifica; quem tem vínculo alto puxa assunto pessoal, discorda com liberdade e arrisca a pele por mim): ${linhas.join("; ")}.`;
  };

  const infoRegras = () => {
    const p = personagem || personagemRef.current || {};
    const nv = p.nivel || 1;
    const prof = bonusProficiencia(nv);
    const chave = ATRIBUTOS.find((a) => ehProficiente(p.classe, a.id));
    const ep = resumoEpico(p);
    return `REGRAS DE PROGRESSÃO (o sistema calcula — não recalibre): proficiência +${prof} (nível ${nv}), somada automaticamente ao atributo que a classe domina${chave ? ` (${chave.nome})` : ""}. Um herói experiente rola alto no que é a especialidade dele — isso é esperado, não infle dificuldades para compensar. ESCALAS DE TEMPO (5e): uma rodada de combate dura 6 segundos; um turno de exploração de masmorra, 10 minutos; viagens contam em horas. Nunca descreva o tempo de forma incompatível com isso.${ep ? ` ESTADO ÉPICO: ${ep} — no ápice mortal o herói não sobe mais de nível; acumula XP e recebe dádivas épicas concedidas pelo sistema.` : ""}`;
  };

  const infoTitulo = () => {
    /* usa o espelho: no carregamento do save o estado ainda não chegou */
    const p = personagem || personagemRef.current || {};
    const t = tituloDoHeroi(divindadeRef.current, patamarFama(famaAtual()).rotulo, patamarDe(p.nivel || 1).nome);
    const base = t.divino
      ? `${t.titulo} (GD ${t.gd} — título DIVINO, conquistado por fé, não por nível)`
      : `${t.titulo} (mortal — reconhecimento do mundo; NÃO é título divino)`;
    const acao = resumoAcaoDeTurno(p.classe, p.nivel || 1);
    const vinc = infoVinculos();
    const bocas = 1 + (p.grupo || []).length;
    const ermos = resumoErmos(p.suprimentos, p.exaustao, p.ritmoViagem, bocas);
    const bonus = acoesBonusDe(p.classe, p.nivel || 1);
    return `${base}. ${ermos} ${ECONOMIA_ACAO_PROMPT}${bonus.length ? ` AÇÕES BÔNUS DESTA CLASSE: ${bonus.map((b) => `${b.nome} (${b.desc})`).join("; ")}.` : " Esta classe não tem ação bônus própria — usa só a ação principal."} AÇÃO DE TURNO EM COMBATE: ${acao.texto} (${perfilCombate(p.classe).nota}). ${infoRegras()}${vinc ? ` ${vinc}` : ""}`;
  };

  /* FÉ COM ENDEREÇO (v8.9): ganhar fiéis é ganhar DEVOÇÃO em algum lugar.
     O local vem do acontecimento (o Mestre diz onde) ou, na falta dele, de
     onde o herói está. Sem cidade nenhuma, vira andarilho — vale menos e
     míngua mais rápido, que é exatamente o incentivo certo. */
  const ganharFe = (fieis, pf, motivo, local) => {
    const dv = divindadeRef.current;
    if (!dv || !dv.despertar) return [];
    const antes = grauDe(dv);
    let onde = "";
    let virada = null;
    let dev = devocaoRef.current;
    if (fieis > 0) {
      const dep = depositarFieis(dev, mapaRef.current, local || cidadeAtualRef.current, fieis, diaRef.current);
      dev = dep.devocao;
      onde = dep.cidade
        ? ` em ${dep.cidade.nome} (+${dep.pontos}% de devoção${dep.sobra ? `; ${dep.sobra} transbordam para as estradas` : ""})`
        : " pelas estradas (andarilhos)";
      /* virou de patamar? isso é notícia — para o jogador e para o Mestre */
      if (dep.cidade && dep.estadoAntes && dep.estadoDepois && dep.estadoAntes.chave !== dep.estadoDepois.chave) {
        virada = { cidade: dep.cidade.nome, de: dep.estadoAntes, para: dep.estadoDepois };
      }
    } else if (fieis < 0) {
      dev = perderFieis(dev, mapaRef.current, -fieis);
    }
    if (fieis) { devocaoRef.current = dev; setDevocao(dev); }
    const totalFieis = fieisTotais(mapaRef.current, dev);
    const novo = { ...dv, fieis: totalFieis, pf: Math.max(0, dv.pf + (pf || 0)) };
    divindadeRef.current = novo; setDivindade(novo);
    const tetoGd = gdMaximoPorNivel(personagem.nivel || 1);
    const depois = Math.min(grauDe(novo), tetoGd);
    const msgs = [];
    if (fieis) msgs.push(`${dv.iconeFe || "🙏"} ${fieis > 0 ? "+" : ""}${fieis} fiéis${onde} (${novo.fieis} no total)${motivo ? ` — ${motivo}` : ""}`);
    if (virada) {
      msgs.push(`${virada.para.icone} ${virada.cidade} agora é ${virada.para.rotulo.toLowerCase()} — ${virada.para.recepcao}.`);
      notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[FÉ NA GEOGRAFIA — REGISTRO DO SISTEMA] ${virada.cidade} passou de "${virada.de.rotulo}" para "${virada.para.rotulo}" em relação ao herói. Daqui em diante o povo de lá ${virada.para.recepcao} — trate isso como fato ao narrar qualquer cena naquela cidade.`;
    }
    if (fieis > 0 && grauDe(novo) > tetoGd) msgs.push(`⛓ A fé cresce além do que seu corpo suporta — é preciso mais poder (nível) para encarnar o próximo grau.`);
    if (pf) msgs.push(`✨ ${pf > 0 ? "+" : ""}${pf} Pontos de Fé (${novo.pf} PF)`);
    if (depois > antes) {
      msgs.push(`🌟 ASCENSÃO! Seu nome ganha peso no cosmos: agora você é ${tituloDe(depois)} (GD ${depois}).`);
      systemRef.current = montarSystemPrompt(nomeCampanha, mundo, personagem, livroRef.current, canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade(), infoTitulo());
      notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[ASCENSÃO — REGISTRO DO SISTEMA] O jogador subiu para GD ${depois} (${tituloDe(depois)}). Isso é fato: narre os sinais dessa transformação aos poucos, à altura do marco.`;
    }
    return msgs;
  };

  /* MILAGRE (v7.6): gasta PF e o SISTEMA aplica o efeito. Serve tanto ao
     botão do jogador quanto ao sinal "milagre:<id>" vindo do Mestre. */
  const invocarMilagre = (id, origem = "jogador") => {
    const dv = divindadeRef.current;
    const mil = milagrePorId(id);
    if (!dv || !dv.despertar || !mil) return [];
    const gd = grauDe(dv);
    if (mil.gd > gd) return [{ autor: "sistema", texto: `⛔ ${mil.nome} exige GD ${mil.gd} — você é GD ${gd}.` }];
    if ((dv.pf || 0) < mil.pf) return [{ autor: "sistema", texto: `⛔ ${mil.nome} custa ${mil.pf} PF — você tem ${dv.pf}.` }];

    const novo = { ...dv, pf: Math.max(0, dv.pf - mil.pf), ultimoFeitoDia: diaRef.current };
    divindadeRef.current = novo; setDivindade(novo);
    const msgs = [{ autor: "sistema", texto: `${mil.icone} MILAGRE — ${mil.nome} (−${mil.pf} PF · restam ${novo.pf})` }];
    const ef = mil.efeito || {};
    let notaMestre = `[MILAGRE INVOCADO — efeito JÁ APLICADO pelo sistema] "${mil.nome}": ${mil.desc} Custou ${mil.pf} PF${origem === "jogador" ? " (o jogador invocou)" : ""}. Narre a manifestação à altura do domínio${novo.dominio ? ` (${novo.dominio})` : ""} — visceral, pública, inesquecível. NÃO recalcule números.`;

    if (ef.tipo === "cura") {
      setPersonagem((p) => {
        const cura = Math.round((p.vidaMax || 10) * (ef.fracao || 0.5));
        const grupo = (p.grupo || []).map((g) => ({ ...g, vida: Math.min(g.vidaMax || g.vida, (g.vida || 0) + Math.round((g.vidaMax || 10) * (ef.fracao || 0.5))) }));
        msgs.push({ autor: "sistema", texto: `🩶 +${cura} PV a você e ao grupo` });
        return { ...p, vida: Math.min(p.vidaMax, (p.vida || 0) + cura), morrendo: false, morte: { sucessos: 0, falhas: 0 }, grupo };
      });
    } else if (ef.tipo === "efeito") {
      setPersonagem((p) => {
        const efeitos = (p.efeitos || []).filter((e) => e.nome !== ef.nome);
        efeitos.push({ nome: ef.nome, bonus: ef.bonus || 2, turnos: ef.turnos || 5, aplica: "todos", descricao: mil.desc });
        return { ...p, efeitos };
      });
      msgs.push({ autor: "sistema", texto: `✧ ${ef.nome} ativo por ${ef.turnos} turnos` });
    } else if (ef.tipo === "dano_area" && combateRef.current) {
      const c = combateRef.current;
      const alvos = (c.inimigos || []).filter((e) => !e.derrotado && e.vida > 0);
      const novos = (c.inimigos || []).map((e) => {
        if (e.derrotado || e.vida <= 0) return e;
        const dano = Math.max(1, Math.round((e.vidaMax || e.vida) * (ef.fracao || 0.35)));
        const pv = Math.max(0, e.vida - dano);
        msgs.push({ autor: "sistema", texto: `⚡ ${e.nome}: ${dano} de dano · ${pv}/${e.vidaMax || e.vida}${pv <= 0 ? " ☠" : ""}` });
        return { ...e, vida: pv, derrotado: pv <= 0 };
      });
      const nc = { ...c, inimigos: novos };
      combateRef.current = nc; setCombate(nc);
      notaMestre += ` Alvos atingidos: ${alvos.map((a) => a.nome).join(", ")}.`;
    } else if (ef.tipo === "ressurreicao") {
      setPersonagem((p) => {
        const grupo = (p.grupo || []).map((g) => (g.vida <= 0 || g.morrendo) ? { ...g, vida: Math.max(1, Math.round((g.vidaMax || 10) / 2)), morrendo: false } : g);
        return { ...p, grupo, vida: p.vida <= 0 ? Math.max(1, Math.round(p.vidaMax / 2)) : p.vida, morrendo: false, morte: { sucessos: 0, falhas: 0 } };
      });
      msgs.push({ autor: "sistema", texto: "🕯 Os caídos voltam — a morte devolve o que é seu." });
    } else if (ef.tipo === "vinculo") {
      notaMestre += " O NPC presente mais relevante jura lealdade de forma irreversível — trate como fato firmado.";
    }
    if (ef.fe) {
      const g = fieisPorFeito(ef.fe, famaAtual());
      msgs.push(...ganharFe(g, 0, `${mil.nome} — testemunhado por multidões`).map((t) => ({ autor: "sistema", texto: t })));
    }
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}${notaMestre}`;
    return msgs;
  };

  /* DÁDIVA ÉPICA (v8.1): no ápice mortal, cada 30k XP rende uma dádiva.
     O sistema sorteia da tabela; 15% das vezes o Mestre cria uma única. */
  const concederDadivas = (pers, msgs) => {
    let p = pers;
    while ((p.dadivasPendentes || 0) > 0) {
      const r = sortearDadiva(p.dadivas || []);
      p = { ...p, dadivasPendentes: p.dadivasPendentes - 1 };
      if (r.unica) {
        msgs.push("🌠 DÁDIVA ÉPICA ÚNICA — algo que só existe na sua lenda desperta…");
        notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[DÁDIVA ÉPICA ÚNICA — crie AGORA] O herói cruzou mais 30.000 XP no ápice mortal e conquistou uma dádiva épica EXCLUSIVA desta campanha. Invente uma bênção poderosa e memorável, coerente com tudo que ele viveu (feitos, domínio, cicatrizes, inimigos) — dê nome próprio e um efeito claro, e registre-a via "adicionar_habilidades" com custo 0. Narre a manifestação à altura: isto acontece pouquíssimas vezes numa vida.`;
      } else {
        const d = r.dadiva;
        const ef = d.efeito || {};
        p = {
          ...p,
          dadivas: [...(p.dadivas || []), d.id],
          vidaMax: (p.vidaMax || 10) + (ef.vidaMax || 0),
          vida: Math.min((p.vidaMax || 10) + (ef.vidaMax || 0), (p.vida || 0) + (ef.vidaMax || 0)),
          manaMax: (p.manaMax || 8) + (ef.manaMax || 0),
          mana: Math.min((p.manaMax || 8) + (ef.manaMax || 0), (p.mana || 0) + (ef.manaMax || 0)),
        };
        msgs.push(`🌠 DÁDIVA ÉPICA: ${d.nome} — ${d.desc}`);
        notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[DÁDIVA ÉPICA CONCEDIDA PELO SISTEMA] "${d.nome}": ${d.desc} Já aplicada — narre o momento em que esse poder desperta nele, com o peso que merece.`;
      }
    }
    return p;
  };

  /* Botão de milagre: invoca e deixa o Mestre narrar a manifestação. */
  const usarMilagre = (id) => {
    if (bloqueado) return;
    const msgs = invocarMilagre(id, "jogador");
    if (msgs.length) pushMsgs(msgs);
    const mil = milagrePorId(id);
    if (mil && (divindadeRef.current.pf >= 0)) {
      enviar(`[MILAGRE] Invoco ${mil.nome}. O sistema já cobrou os PF e aplicou o efeito — narre a manifestação do meu domínio de forma inesquecível.${SO_ISSO}`, personagem);
    }
  };

  /* DESPERTAR (v7.4): ao cruzar o nível NIVEL_DESPERTAR, o céu se abre —
     o panteão local nasce PRONTO pelo gerador e o jogador começa a jornada. */
  const checarDespertar = (pers, silencioso = false) => {
    const dv = divindadeRef.current;
    if (!dv || dv.despertar || (pers.nivel || 1) < NIVEL_DESPERTAR) return;
    const ctx = ctxMundo({ mundo, mapa: mapaRef.current, dia: diaRef.current });
    const panteao = gerarPanteaoInicial(ctx, diaRef.current);
    /* v8.9: os primeiros fiéis nascem ONDE o herói está — gente que o viu. */
    const dep = depositarFieis(garantirDevocao(devocaoRef.current, mapaRef.current, dv), mapaRef.current, cidadeAtualRef.current, Math.max(0, 50 - fieisTotais(mapaRef.current, devocaoRef.current)), diaRef.current);
    devocaoRef.current = dep.devocao; setDevocao(dep.devocao);
    divindadeRef.current = { ...dv, despertar: true, panteao, fieis: Math.max(50, fieisTotais(mapaRef.current, dep.devocao)), pf: dv.pf };
    setDivindade(divindadeRef.current);
    systemRef.current = montarSystemPrompt(nomeCampanha, mundo, pers, livroRef.current, canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade(), infoTitulo());
    if (silencioso) {
      /* SAVE VETERANO (v7.4.1): nível alto carregado do disco — o sistema
         abre a ascensão SEM cutucar o Mestre (evita dupla narração com o
         "Anteriormente…"); a ficha divina real se alinha no botão Recalibrar. */
      pushMsgs([{ autor: "sistema", texto: "🌟 Ascensão desbloqueada (nível " + (pers.nivel || 1) + "). Se sua lenda já te fez divindade na história, use ⚖ Recalibrar no painel Ascensão — o sistema lê sua jornada e ajusta GD, fiéis e domínio." }]);
      salvar({ personagem: pers });
      return;
    }
    pushMsgs([{ autor: "sistema", texto: "🌟 Você despertou — o cosmos passa a te enxergar. (Novo painel: Ascensão)" }]);
    const pan = panteao.map((d) => `${d.icone} ${d.nome} ${d.dominio} — GD ${d.gd} (${tituloDe(d.gd)}), ${d.temperamento}, culto: ${d.culto}`).join("; ");
    enviar(`[DESPERTAR DIVINO — MARCO REGISTRADO PELO SISTEMA] Ao alcançar o nível ${pers.nivel}, o nome do herói começou a ser sussurrado em orações: a ASCENSÃO começou. FATOS FIXOS sorteados pelo sistema: o jogador tem ${divindadeRef.current.fieis} fiéis iniciais (gente que já reza baixinho o nome dele) e GD 0→trilha aberta; o PANTEÃO local que ele agora consegue PERCEBER: ${pan}. Narre o despertar como um marco íntimo e arrepiado (um sinal, um olhar que se demora, uma prece espontânea de um estranho) — NÃO um show de poder: ele ainda é mortal (GD 0), mas o caminho dos três estágios (Servo Escolhido → Semideus → Nova Divindade) está aberto. As divindades acima já existiam — só agora ele as sente. Apresente UMA delas de leve neste turno.`, pers);
    salvar({ personagem: pers });
  };

  const enviar = useCallback(async (conteudo, persAtual, histBase) => {
    setCarregando(true); setFalha(null); setSugestoes([]);
    const nota = notaRef.current; notaRef.current = "";
    const corpo = nota ? `${nota}\n${conteudo}` : conteudo;
    /* RODAPÉ DO SISTEMA (v7.0.2): lembrete curto colado SÓ na mensagem atual
       (não fica no histórico — custo ~zero) reforçando as regras que o
       DeepSeek mais esquecia: relógio do sistema, proibição de inventar
       memórias, obediência ao cânone e narrativa sempre preenchida. */
    const estR = estacaoDe(diaRef.current);
    const rodape = `[RODAPÉ DO SISTEMA] Agora: ${dataTxt(diaRef.current)} (dia ${diaRef.current}), ${horaTxt(minutoRef.current)}${ehNoite(minutoRef.current) ? " (noite)" : ""}, ${estR.nome.toLowerCase()}. Local: ${localAtualTxt()}. Inviolável: (1) o tempo SÓ muda por envelope do sistema — nunca narre amanhecer, anoitecer ou horas passando por conta própria; (2) NUNCA invente memórias nem passado compartilhado que não esteja no cânone/registro de pessoas; (3) siga o cânone e o registro à risca; (4) o campo "narrativa" vem SEMPRE preenchido; (5) descanso/sono acontecem ONDE EU ESTOU — jamais me teleporte para aposentos ou cidade sem viagem narrada.${divindadeRef.current && divindadeRef.current.despertar ? " " + resumoAscensao(divindadeRef.current, (personagem && personagem.nivel) || 1) : ""}${(() => {
      /* CONDIÇÕES (v9.0) e NÊMESIS: estado vivo, colado em TODO turno. É o que
         impede o Mestre de narrar um herói inteiro enquanto o sistema o mantém
         atordoado — ou uma nêmesis viva depois de o sistema tê-la enterrado. */
      const p = personagem || personagemRef.current || {};
      const cond = resumoCondicoesPrompt(p, p.grupo || []);
      const nem = infoNemesis();
      const merc = resumoMercadoPrompt(mercadoAqui);
      const grp = resumoGrupoPrompt(p.grupo || []);
      return `${cond ? `\n${cond}` : ""}${nem ? `\n${nem}` : ""}${merc ? `\n${merc}` : ""}${grp ? `\n${grp}` : ""}`;
    })()}`;
    const base = histBase ?? historico;
    const novoHist = [...base, { role: "user", content: `${corpo}\n${rodape}` }];
    try {
      const resp = await chamarMestre(systemRef.current, novoHist);
      /* MEMÓRIA ENXUTA: no histórico vai SÓ a narrativa (dentro do molde JSON,
         para o modelo manter o formato). Antes ia o JSON completo com mudancas,
         sugestões e campos de combate — ~3× mais tokens por mensagem antiga,
         sem nenhum ganho de memória (os efeitos já vivem no estado do app). */
      const histFinal = [...base, { role: "user", content: corpo }, { role: "assistant", content: JSON.stringify({ narrativa: resp.narrativa || "" }) }];
      setHistorico(histFinal);
      const pers = aplicarResposta(resp, persAtual);
      /* ALTERNÂNCIA: se esta foi uma AÇÃO DO JOGADOR (não a vez do mundo, não combate,
         não acampamento), a próxima vez é OBRIGATORIAMENTE do mundo. */
      const foiVezDoMundo = ehAcaoMundoRef.current;
      ehAcaoMundoRef.current = false;
      /* após uma AÇÃO do jogador (que não seja já a vez do mundo), a próxima vez
         é do mundo. Responder+mover já conta como vez do mundo, então cai aqui
         como foiVezDoMundo=true e libera a barra normal. */
      if (!foiVezDoMundo && !combateRef.current && !acampadoRef.current && !resp.rolagem) setAguardandoMundo(true);
      else setAguardandoMundo(false);
      /* SINAIS DE SISTEMA (v7.8): o Mestre ativou viagem ou masmorra pela
         narrativa — o app abre o sistema no turno seguinte, sem botão. */
      if (sinalViagemRef.current !== null) {
        const destino = sinalViagemRef.current; sinalViagemRef.current = null;
        setAguardandoMundo(false);
        setTimeout(() => viajar(destino), 400);
      } else if (sinalMasmorraRef.current !== null) {
        const nomeMm = sinalMasmorraRef.current; sinalMasmorraRef.current = null;
        setAguardandoMundo(false);
        setTimeout(() => entrarMasmorra(nomeMm), 400);
      }
      turnoContRef.current += 1;
      if (turnoContRef.current >= 8) {
        turnoContRef.current = 0;
        const narrativas = mensagensRef.current.filter((x) => x.autor === "mestre").map((x) => x.texto);
        gerarLivro(livroRef.current, narrativas).then((l) => {
          if (l) { livroRef.current = l; bancoNomesRef.current = gerarBancoNomes(mundo); systemRef.current = montarSystemPrompt(nomeCampanha, mundo, pers, l, canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade(), infoTitulo()); }
        });
      }
      setTimeout(() => salvar({ personagem: pers, historico: histFinal, rolagem: resp.rolagem || null }), 0);
      /* FISCAL DE MISSÕES + ESCRIBA: correm em paralelo, sem travar o turno */
      cronistaDoTurno(pers, resp.narrativa);
      /* DESPERTAR: checa DEPOIS do turno (o XP do combate pode ter cruzado o nível) */
      setTimeout(() => checarDespertar(pers), 600);
    } catch (e) {
      notaRef.current = nota;
      setFalha({ conteudo, persAtual, histBase: base, motivo: (e && e.message) ? String(e.message) : "erro desconhecido" });
    } finally {
      setCarregando(false);
    }
  }, [historico, mensagens, aplicarResposta, salvar, nomeCampanha, mundo]);

  const retentar = () => { if (!falha) return; const f = falha; setFalha(null); enviar(f.conteudo, f.persAtual, f.histBase); };

  // ── Voz do Mestre (Fish Audio via /api/voz) ──
  const [voz, setVoz] = useState(null); // { i, status: "gerando" | "tocando" }
  const vozAudioRef = useRef(null);
  const vozCacheRef = useRef({}); // índice da mensagem -> objectURL (não cobra de novo)
  /* DESBLOQUEIO iOS/SAFARI (v7.3.1): o Safari só permite som dentro do gesto
     do toque — como o fetch da voz demora, o play() chegava "fora do gesto" e
     era negado ("not allowed by the user agent"). Solução: UM elemento de
     áudio persistente, destravado no instante do toque com um clique mudo de
     50ms; depois só trocamos o src e mandamos tocar — elemento já liberado. */
  const SILENT_WAV = "data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YSADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
  const obterAudioVoz = () => {
    if (!vozAudioRef.current) {
      vozAudioRef.current = new Audio();
      vozAudioRef.current.preload = "auto";
    }
    return vozAudioRef.current;
  };
  const pararVoz = () => {
    if (vozAudioRef.current) { try { vozAudioRef.current.pause(); } catch {} }
    setVoz(null);
  };
  const ouvirMestre = async (i, texto) => {
    if (voz && voz.i === i) { pararVoz(); return; } // tocar de novo = parar
    pararVoz();
    setVoz({ i, status: "gerando" });
    try {
      const audio = obterAudioVoz();
      /* ainda DENTRO do toque: destrava o elemento no Safari */
      try {
        audio.src = SILENT_WAV;
        audio.muted = true;
        const p = audio.play();
        if (p && p.catch) await p.catch(() => {});
        audio.pause();
        audio.muted = false;
        audio.currentTime = 0;
      } catch { /* segue — em desktop já funciona sem o truque */ }
      let url = vozCacheRef.current[i];
      if (!url) {
        const r = await fetch("/api/voz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto }),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.erro || `falha (${r.status})`);
        }
        url = URL.createObjectURL(await r.blob());
        vozCacheRef.current[i] = url;
      }
      audio.onended = () => setVoz(null);
      audio.onerror = () => setVoz(null);
      audio.src = url;
      await audio.play();
      setVoz({ i, status: "tocando" });
    } catch (e) {
      setVoz(null);
      pushMsgs([{ autor: "sistema", texto: `🔇 ${(e && e.message) || "Não consegui dar voz ao Mestre agora."}` }]);
    }
  };
  useEffect(() => () => { if (vozAudioRef.current) { try { vozAudioRef.current.pause(); } catch {} } Object.values(vozCacheRef.current).forEach((u) => { try { URL.revokeObjectURL(u); } catch {} }); }, []);

  const iniciar = (pers) => {
    personagemRef.current = pers;   // o prompt é montado ainda dentro deste clique
    setPersonagem(pers);
    livroRef.current = ""; turnoContRef.current = 0;
    canoneRef.current = {}; npcsRef.current = {}; setNpcs({}); npcTurnoRef.current = 0; definirAcampado(false);
    /* GEOGRAFIA GERADA PELO SISTEMA (v7.5): o continente nasce PRONTO —
       regiões com bioma, cidades com porte e população, rotas com dias de
       viagem. O Mestre narra em cima de fatos fixos, não inventa caminhos. */
    const geo = gerarGeografia(`${nomeCampanha || "aventura"}|${(mundo && mundo.genero) || ""}`);
    mapaRef.current = { cidades: geo.cidades, faccoes: [], continente: geo.continente, regioes: geo.regioes, rotas: geo.rotas }; setMapa(mapaRef.current);
    faccaoJogadorRef.current = ""; cidadeAtualRef.current = "";
    jornadaRef.current = null; setJornada(null);
    eventosRef.current = { locais: [], global: null, semGlobalDesde: 0, seq: 1 }; setEventos(eventosRef.current);
    guildaRef.current = { nivel: 1, cofre: 0 }; setGuilda(guildaRef.current);
    contRef.current = { ...CONTADORES_INICIAIS };
    conqRef.current = { desbloqueadas: {}, ordem: [] }; setConquistas(conqRef.current);
    tituloAtivoRef.current = ""; setTituloAtivo("");
    descobRef.current = []; setDescobertas([]);
    masmorraRef.current = null; setMasmorra(null);
    muralRef.current = gerarMural((mundo && mundo.genero) || "Fantasia medieval", 1, { cidades: [], faccoes: [] }, 3); setMural(muralRef.current);
    decretosRef.current = []; setDecretos(decretosRef.current);
    diaRef.current = 1; setDia(1);
    minutoRef.current = AMANHECER + 60; setMinuto(minutoRef.current);
    acordouAbsRef.current = 0;
    nemesisRef.current = null; setNemesis(null);
    famaPatamarRef.current = 0;
    reinoRef.current = {}; setReino({});
    historiaRef.current = { estrutura: (mundo && mundo.estrutura) || "jornada", etapa: 0 };
    questsRef.current = []; setQuests([]);
    divindadeRef.current = garantirDivindade(null); setDivindade(divindadeRef.current);
    devocaoRef.current = garantirDevocao(null, mapaRef.current, divindadeRef.current); setDevocao(devocaoRef.current);
    mercadoRef.current = { comprados: {}, ambulante: null }; setMercado(mercadoRef.current);
    bancoNomesRef.current = gerarBancoNomes(mundo);
    systemRef.current = montarSystemPrompt(nomeCampanha, mundo, pers, "", {}, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade(), infoTitulo());
    mensagensRef.current = []; setMensagens([]); setHistorico([]); setRolagem(null);
    setCombate(null); combateRef.current = null;
    setFase("jogo");
    enviar(`Comece a aventura: apresente o mundo com riqueza, situe meu personagem numa cena de abertura marcante com pelo menos um NPC interessante, e termine com um gancho que me convide a agir. (Minhas habilidades iniciais já foram concedidas pelo SISTEMA: ${(pers.habilidades || []).map((h) => h.nome).join(", ") || "nenhuma"} — NÃO envie "adicionar_habilidades".)`, pers, []);
  };

  const continuar = (comResumo) => {
    const sv = saveRef.current || temSave;
    if (!sv) { pushMsgs([{ autor: "sistema", texto: "Nenhuma aventura salva encontrada." }]); return; }
    try {
      const pers = migrarPersonagem(sv.personagem);
      personagemRef.current = pers;   // o prompt é montado ainda dentro deste clique
      setMundo(sv.mundo || { genero: "Fantasia medieval" }); setNomeCampanha(sv.nomeCampanha || "Aventura"); setPersonagem(pers);
      mensagensRef.current = Array.isArray(sv.mensagens) ? sv.mensagens : [];
      setMensagens(mensagensRef.current); setHistorico(Array.isArray(sv.historico) ? sv.historico : []);
      setRolagem(sv.rolagem || null);
      setCombate(sv.combate || null); combateRef.current = sv.combate || null;
      livroRef.current = sv.livro || ""; turnoContRef.current = 0;
      canoneRef.current = sv.canone && typeof sv.canone === "object" ? sv.canone : {};
      npcsRef.current = sv.npcs && typeof sv.npcs === "object" ? sv.npcs : {}; setNpcs(npcsRef.current); npcTurnoRef.current = 0;
      definirAcampado(!!sv.acampado);
      if (sv.mapa && sv.mapa.cidades && sv.mapa.cidades.length) {
        mapaRef.current = sv.mapa;
        mapaRef.current = garantirGeografia(mapaRef.current, `taverna|${sv.personagem && sv.personagem.nome ? sv.personagem.nome : "save"}`);
      } else {
        /* save antigo sem mapa: gera o mundo inteiro por código (v7.5) */
        const geo = gerarGeografia(`taverna|${sv.personagem && sv.personagem.nome ? sv.personagem.nome : "save"}`);
        mapaRef.current = { cidades: geo.cidades, faccoes: (sv.mapa && sv.mapa.faccoes) || [], continente: geo.continente, regioes: geo.regioes, rotas: geo.rotas };
      }
      setMapa(mapaRef.current);
      faccaoJogadorRef.current = sv.faccaoJogador || "";
      cidadeAtualRef.current = sv.cidadeAtual || "";
      guildaRef.current = sv.guilda && typeof sv.guilda === "object" ? { nivel: sv.guilda.nivel || 1, cofre: sv.guilda.cofre || 0 } : { nivel: 1, cofre: 0 }; setGuilda(guildaRef.current);
      climaRef.current = sv.clima && sv.clima.id ? sv.clima : null; setClima(climaRef.current);
      /* CÓDEX (v6.0): saves antigos não têm conquistas — começam do zero sem quebrar */
      contRef.current = { ...CONTADORES_INICIAIS, ...(sv.contadores && typeof sv.contadores === "object" ? sv.contadores : {}) };
      conqRef.current = sv.conquistas && sv.conquistas.desbloqueadas ? sv.conquistas : { desbloqueadas: {}, ordem: [] };
      setConquistas(conqRef.current);
      tituloAtivoRef.current = sv.tituloAtivo || ""; setTituloAtivo(tituloAtivoRef.current);
      descobRef.current = Array.isArray(sv.descobertas) ? sv.descobertas : []; setDescobertas(descobRef.current);
      /* MASMORRA/MURAL (v6.3): saves antigos não conhecem — começam zerados */
      /* MIGRAÇÃO v8.3: a masmorra antiga era um corredor {salas:[], idx}; a
         nova é um grafo {salas com id/saidas, atual}. Uma masmorra antiga em
         andamento quebraria a interface nova — encerra e avisa. */
      {
        const mmA = sv.masmorra;
        const ehNova = mmA && Array.isArray(mmA.salas) && mmA.atual !== undefined;
        if (mmA && Array.isArray(mmA.salas) && !ehNova) {
          masmorraRef.current = null; setMasmorra(null);
          setTimeout(() => pushMsgs([{ autor: "sistema", texto: "🕳 A masmorra em andamento era do formato antigo (corredor linear) e foi encerrada. As novas são ramificadas: passagens com pistas, chave escondida e tochas que se gastam." }]), 300);
        } else { masmorraRef.current = ehNova ? mmA : null; setMasmorra(masmorraRef.current); }
      }
      muralRef.current = Array.isArray(sv.mural) ? sv.mural : []; setMural(muralRef.current);
      decretosRef.current = Array.isArray(sv.decretos) ? sv.decretos : []; setDecretos(decretosRef.current);
      diaRef.current = sv.dia || 1; setDia(diaRef.current);
      minutoRef.current = sv.minuto != null ? sv.minuto : AMANHECER + 60; setMinuto(minutoRef.current);
      acordouAbsRef.current = sv.acordouAbs != null ? sv.acordouAbs : ((diaRef.current - 1) * 1440 + minutoRef.current); // saves antigos acordam descansados
      nemesisRef.current = sv.nemesis && typeof sv.nemesis === "object" ? sv.nemesis : null; setNemesis(nemesisRef.current);
      correioRef.current = garantirCorreio(sv.correio); setCorreio(correioRef.current);
      jornadaRef.current = sv.jornada && typeof sv.jornada === "object" ? sv.jornada : null; setJornada(jornadaRef.current);
      eventosRef.current = garantirEventos(sv.eventos); setEventos(eventosRef.current);
      /* MIGRAÇÃO (v7.4): saves antigos ganham a ascensão zerada — nada quebra */
      divindadeRef.current = garantirDivindade(sv.divindade); setDivindade(divindadeRef.current);
      /* MIGRAÇÃO (v8.9): save antigo tem fiéis sem endereço — a fé é
         DISTRIBUÍDA pelo mapa (proporcional à população) em vez de sumir.
         Depois disso, o número da ascensão passa a ser a soma do mapa. */
      devocaoRef.current = garantirDevocao(sv.devocao, mapaRef.current, divindadeRef.current); setDevocao(devocaoRef.current);
      mercadoRef.current = sv.mercado && typeof sv.mercado === "object"
        ? { comprados: sv.mercado.comprados || {}, ambulante: sv.mercado.ambulante || null }
        : { comprados: {}, ambulante: null };
      setMercado(mercadoRef.current);
      if (divindadeRef.current.despertar) {
        divindadeRef.current = { ...divindadeRef.current, fieis: fieisTotais(mapaRef.current, devocaoRef.current) };
        setDivindade(divindadeRef.current);
      }
      famaPatamarRef.current = sv.famaPatamar || 0;
      reinoRef.current = garantirReino(sv.reino && typeof sv.reino === "object" ? sv.reino : {}, mapaRef.current) || {}; setReino(reinoRef.current);
      /* BLINDAGEM v6.5: pessoas de saves antigos sem data de encontro ganham
         "dia 0" (= antes do registro de dias) — nunca um passado inventado. */
      let regTocou = false;
      const regNovo = Object.fromEntries(Object.entries(npcsRef.current).map(([k, n]) => {
        if (n && n.conhecidoEm == null) { regTocou = true; return [k, { ...n, conhecidoEm: 0 }]; }
        return [k, n];
      }));
      if (regTocou) { npcsRef.current = regNovo; setNpcs(regNovo); }
      historiaRef.current = sv.historia && sv.historia.estrutura ? sv.historia : { estrutura: (sv.mundo && sv.mundo.estrutura) || "jornada", etapa: 0 };
      questsRef.current = Array.isArray(sv.quests) ? sv.quests : [];
      setQuests([...questsRef.current]);
      bancoNomesRef.current = gerarBancoNomes(sv.mundo);
      systemRef.current = montarSystemPrompt(sv.nomeCampanha || "Aventura", sv.mundo || { genero: "Fantasia medieval" }, pers, sv.livro || "", canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade(), infoTitulo());
      setFase("jogo");
      /* DESPERTAR NO CARREGAMENTO (v7.4.1): save veterano nível ≥15 nunca
         disparava o despertar (ele só checava DEPOIS de um turno). */
      setTimeout(() => checarDespertar(pers, true), 900);
      if (comResumo && !sv.rolagem) {
        enviar(`[RESUMO DE SESSÃO] Retomando "${sv.nomeCampanha}". Abra com "Anteriormente, em ${sv.nomeCampanha}…" e recapitule os principais acontecimentos em até 120 palavras, tom de série. Depois reapresente a cena atual e me convide a agir. Sem rolagem e sem mudanças nesta resposta.`, pers, sv.historico || []);
      }
    } catch (e) {
      setFase("menu");
      pushMsgs([{ autor: "sistema", texto: "Não foi possível abrir a aventura salva: " + String((e && e.message) || e).slice(0, 120) }]);
    }
  };

  /* Resolve por CÓDIGO um ataque do jogador contra um inimigo do combate ativo.
     Devolve o texto-resultado para o Mestre narrar, ou null se não for ataque. */
  const resolverAtaqueJogador = (acao, pers) => {
    const comb = combateRef.current;
    if (!comb || !(comb.inimigos || []).some((e) => !e.derrotado)) return null;
    const acaoN = acao.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const verboAtaque = /\b(ataco|atacar|golpeio|golpear|acerto|acertar|bato|bater|corto|cortar|perfuro|estoco|disparo|atiro|atirar|flecho|soco|chuto|esfaqueio|abato|invisto|avanco|arremesso)\b/.test(acaoN);
    if (!verboAtaque) return null;
    const vivos = comb.inimigos.filter((e) => !e.derrotado);
    const gdJ = grauDe(divindadeRef.current);
    const bonusAtkBase = Math.max((pers.atributos?.forca || 0), (pers.atributos?.destreza || 0)) + 2 + Math.floor(((pers.nivel || 1) - 1) / 4);
    /* ATAQUES MÚLTIPLOS (D&D): 2 ataques no nível 5, 3 no 11, 4 no 20 */
    const nv = pers.nivel || 1;
    /* 5e: marciais ganham Ataque Extra; conjuradores fazem UMA conjuração com
       mais dados; ladino faz um golpe só, com Ataque Furtivo somando dados. */
    const nAtaques = ataquesPorTurno(pers.classe, nv);
    const normalizar = (x) => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const alvoCitado = vivos.find((e) => acaoN.includes(normalizar(e.nome)));
    /* clone local para mirar corretamente entre golpes */
    const locais = comb.inimigos.map((e) => ({ ...e }));
    const resultados = [];
    for (let i = 0; i < nAtaques; i++) {
      const vivosAgora = locais.filter((e) => !e.derrotado && e.vida > 0);
      if (!vivosAgora.length) break;
      /* DECLARAÇÃO: se você escolheu o alvo deste golpe na interface, ele
         manda; se aquele alvo já caiu, o golpe migra para o próximo vivo. */
      const declarado = (alvosGolpeRef.current || [])[i];
      const alvo = (declarado && vivosAgora.find((e) => e.nome === declarado))
        || (alvoCitado && vivosAgora.find((e) => e.nome === alvoCitado.nome))
        || vivosAgora[0];
      const r = resolverAtaque({
        atacante: pers.nome, alvo, ehAtacanteInimigo: false,
        bonusAtaque: bonusAtk, danoBase: danoDaClasse(pers.classe, nv, Math.round(danoDe(pers, false) / 2)),
        condAtacante: pers.condicoes || [], condAlvo: alvo.condicoes || [],
        tipoDano: elementoDaArma(pers), perfilAlvo: perfilDeCriatura(alvo.nome, alvo.desc),
      });
      if (r.dano > 0) { const l = locais.find((e) => e.nome === alvo.nome); l.vida = Math.max(0, l.vida - r.dano); if (l.vida <= 0) l.derrotado = true; }
      resultados.push({ r, alvo: { ...alvo } });
    }
    return { resultados, nAtaques };
  };

  /* HABILIDADE OFENSIVA RESOLVIDA PELO SISTEMA (v7.4.4): antes, o dano de
     magia/técnica em combate era INVENTADO pelo Mestre — e ele podia matar
     um monstro de 150 PV numa descrição bonita. Agora habilidade ofensiva
     em combate é ataque do sistema: rola acerto, calcula dano, aplica PV. */
  const HAB_OFENSIVA_RX = /dano|ataca|golpe|projetil|projétil|chama|gelo|raio|lamina|lâmina|fogo|destrui|ferir|maldic|explos|impacto|perfur|cort[ae]|drena|execut/i;
  const resolverHabilidadeOfensiva = (h, acao, pers) => {
    const comb = combateRef.current;
    if (!comb || !(comb.inimigos || []).some((e) => !e.derrotado && e.vida > 0)) return null;
    if (h.danoBase == null && !HAB_OFENSIVA_RX.test(`${h.nome || ""} ${h.descricao || ""}`)) return null;
    const vivos = comb.inimigos.filter((e) => !e.derrotado && e.vida > 0);
    const norm = (x) => (x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const acaoN = norm(acao);
    const alvo = vivos.find((e) => acaoN.includes(norm(e.nome))) || vivos[0];
    const atr = Math.max(pers.atributos?.intelecto || 0, pers.atributos?.presenca || 0, pers.atributos?.forca || 0, pers.atributos?.destreza || 0);
    const bonusAtk = atr + 2 + Math.floor(((pers.nivel || 1) - 1) / 4);
    let danoBase = h.danoBase != null ? h.danoBase + d(4) - 1 : (Math.max(0, Number(h.custo) || 0) * 2 + d(6) + atr);
    /* molde EXECUÇÃO (únicas): dano dobrado em alvo com menos de metade dos PV */
    if (h.molde === "execucao" && alvo.vidaMax && alvo.vida < alvo.vidaMax / 2) danoBase *= 2;
    const r = resolverAtaque({
      atacante: pers.nome, alvo, ehAtacanteInimigo: false,
      bonusAtaque: bonusAtk, danoBase,
      condAtacante: pers.condicoes || [], condAlvo: alvo.condicoes || [],
      tipoDano: "magico", perfilAlvo: perfilDeCriatura(alvo.nome, alvo.desc),
    });
    const linhasSis = [];
    const partes = [];
    logDadoCombate(resumoDoAtaque(r));
    if (mostrarRolagensRef.current) linhasSis.push({ autor: "sistema", texto: "🎲 " + resumoDoAtaque(r) });
    let locais = comb.inimigos.map((e) => ({ ...e }));
    if (r.dano > 0) {
      locais = locais.map((e) => {
        if (e.nome !== alvo.nome) return e;
        const pv = Math.max(0, e.vida - r.dano);
        return { ...e, vida: pv, derrotado: pv <= 0, ultimoDano: r.dano };
      });
      partes.push(`${alvo.nome} — ${r.resultado === "critico" ? `CRÍTICO, ${r.dano} de dano` : r.resultado === "acerta" ? `${r.dano} de dano` : "resistiu parcialmente"} (d20=${r.d20}${r.bonus ? `+${r.bonus}` : ""}=${r.total} vs ${r.ca})${(locais.find((e) => e.nome === alvo.nome) || {}).derrotado ? " [CAIU]" : ""}`);
      /* ÁREA (únicas): metade do dano nos demais inimigos */
      if (h.area) {
        const splash = Math.max(1, Math.round(r.dano / 2));
        locais = locais.map((e) => {
          if (e.nome === alvo.nome || e.derrotado || e.vida <= 0) return e;
          const pv = Math.max(0, e.vida - splash);
          if (pv <= 0) partes.push(`${e.nome} — ${splash} de dano pela onda [CAIU]`);
          else partes.push(`${e.nome} — ${splash} de dano pela onda`);
          return { ...e, vida: pv, derrotado: pv <= 0, ultimoDano: splash };
        });
      }
      /* AFLIÇÃO DA HABILIDADE (v9.1): a condição vem do CATÁLOGO — da tag
         explícita da habilidade única ou do que o nome/descrição dela carrega
         ("Toque Gélido" alenta, "Rajada de Fogo" queima). O sistema rola o
         teste do alvo; o Mestre recebe pronto. */
      if (!(locais.find((e) => e.nome === alvo.nome) || {}).derrotado) {
        const port = h.condicao ? aflicaoDe(h.condicao) : aflicaoDe(`${h.nome || ""} ${h.descricao || ""}`);
        if (port && port.alvo === "alvo") {
          const ap = aplicarAflicaoEmInimigo(locais, alvo.nome, { fonte: port, nomeFonte: h.nome, atacante: pers.nome, critico: r.critico });
          if (ap.res) {
            locais = ap.lista;
            partes.push(ap.res.aplicou ? `${alvo.nome} ficou ${ap.res.cond.nome.toLowerCase()}` : `${alvo.nome} resistiu à ${ap.res.cond.nome.toLowerCase()}`);
            linhasSis.push({ autor: "sistema", texto: ap.res.texto });
            notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}${ap.res.nota}`;
          }
        }
      }
      linhasSis.push({ autor: "sistema", texto: `✦ ${pers.nome} · ${h.nome} → ${alvo.nome}: ${r.critico ? "CRÍTICO! " : ""}${r.dano} de dano${h.area ? " (onda atinge os demais)" : ""}` });
      /* molde DRENAGEM (únicas): recupera metade do dano causado */
      if (h.molde === "drenagem") {
        const cura = Math.max(1, Math.round(r.dano / 2));
        setPersonagem((old) => ({ ...old, vida: Math.min(old.vidaMax, (old.vida || 0) + cura) }));
        linhasSis.push({ autor: "sistema", texto: `🩸 ${h.nome} drena a essência: +${cura} PV` });
        partes.push(`drenei ${cura} PV`);
      }
    } else {
      partes.push(`${alvo.nome} — ${r.desastre ? "erro desastroso" : "errou"} (d20=${r.d20}${r.bonus ? `+${r.bonus}` : ""}=${r.total} vs ${r.ca})`);
      linhasSis.push({ autor: "sistema", texto: `✦ ${pers.nome} · ${h.nome} → ${alvo.nome}: ${r.desastre ? "erro desastroso" : "errou"}` });
    }
    combateRef.current = { ...comb, inimigos: locais, economia: comb.economia, log: combateRef.current.log };
    setCombate(combateRef.current);
    if (linhasSis.length) pushMsgs(linhasSis);
    fecharSeTodosCairam();
    return partes.join("; ");
  };

  /* HABILIDADES ÚNICAS (v7.4.4): mesma lógica do loot — a árvore da classe é
     tabela fixa, mas derrubar elite/lendário pode DESPERTAR uma técnica só
     sua, gerada por código. A IA narra a epifania; o sistema cria e limita. */
  const talvezDespertarUnica = (p2, inimigosFinais, msgs) => {
    const ch = chanceUnica(inimigosFinais);
    if (!ch || Math.random() >= ch) return p2;
    const existentes = (p2.habilidades || []).map((x) => x.nome);
    const hu = gerarHabilidadeUnica(p2.nivel || 1, existentes);
    msgs.push(`🌟 PODER ÚNICO DESPERTOU: ${hu.nome} (${hu.custo} PM · recarga ${hu.recarga}t) — ${hu.descricao}`);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[PODER ÚNICO — REGISTRADO PELO SISTEMA] A vitória sobre ${((inimigosFinais || [])[0] || {}).nome || "o inimigo"} despertou em mim uma técnica só minha: "${hu.nome}" (${hu.descricao}). Já está na minha lista de habilidades — NÃO a crie de novo. Narre a epifania como um momento raro e marcante: o poder do derrotado deixou uma marca em mim.`;
    return { ...p2, habilidades: [...(p2.habilidades || []), hu] };
  };

  const agir = (texto) => {
    const acao = texto.trim();
    if (!acao || carregando || rolagem) return;
    /* RELÓGIO: turnos de exploração/cons conversam ~45 min de mundo.
       Combate, masmorra e acampamento têm tempo próprio (contado nesses fluxos). */
    let extraTempo = "";
    if (!combateRef.current && !acampadoRef.current && !masmorraRef.current) extraTempo = avancarMinutos(MINUTOS_POR_TURNO);
    setEntrada(""); setHabAbertas(false);
    if (habSel) {
      const h = habSel; setHabSel(null);
      const custo = Math.max(0, Number(h.custo) || 0);
      if (personagem.mana < custo) { pushMsgs([{ autor: "sistema", texto: `Mana insuficiente para ${h.nome}.` }]); return; }
      /* RECARGA (v7.4.3): habilidade em fôlego não dispara — nem gasta movimento */
      const recSel = (personagem.habRecarga || {})[(h.nome || "").toLowerCase()] || 0;
      if (recSel > 0) { pushMsgs([{ autor: "sistema", texto: `⏳ ${h.nome} está em recarga — pronta em ${recSel} turno${recSel > 1 ? "s" : ""}.` }]); return; }
      /* ECONOMIA (v7.4): em combate, habilidade gasta a ação (ou a extra) */
      if (combateRef.current && combateRef.current.economia) {
        const ecoH = combateRef.current.economia;
        if (ecoH.acao <= 0 && ecoH.extra <= 0) { pushMsgs([{ autor: "sistema", texto: "⏳ Sem movimentos neste turno — toque em Encerrar turno." }]); return; }
        if (ecoH.acao > 0) ecoH.acao -= 1; else ecoH.extra -= 1;
        combateRef.current = { ...combateRef.current, economia: { ...ecoH } }; setCombate(combateRef.current);
      }
      const recH = h.recarga != null ? Math.max(0, Number(h.recarga) || 0) : recargaPadrao(custo);
      let pers = { ...personagem, mana: personagem.mana - custo, habRecarga: recH > 0 ? { ...(personagem.habRecarga || {}), [(h.nome || "").toLowerCase()]: recH } : (personagem.habRecarga || {}) };
      const buffH = aplicarBuffDeHabilidade(h, pers);
      pers = buffH.pers;
      if (buffH.texto) pushMsgs([{ autor: "sistema", texto: buffH.texto }]);
      if (buffH.nota) notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}${buffH.nota}`;
      setPersonagem(pers);
      pushMsgs([{ autor: "jogador", texto: `✦ ${h.nome} — ${acao}` }, { autor: "sistema", texto: `Você gastou ${custo} PM · restam ${pers.mana}/${pers.manaMax}${recH > 0 ? ` · ⏳ recarga ${recH}t` : ""}` }]);
      habUsadaRef.current = true;
      const desfechoH = resolverHabilidadeOfensiva(h, acao, pers);
      enviar(desfechoH
        ? `[HABILIDADE — RESOLVIDA PELO SISTEMA] Usei "${h.nome}" (custo ${custo} PM, já descontado). O SISTEMA já rolou o acerto, calculou e APLICOU o resultado: ${desfechoH}. Sua função é APENAS narrar esse resultado exato — não recalcule, não mude quem acertou, NÃO declare a morte de quem ainda tem PV. Narre a técnica à altura da minha intenção: ${acao}`
        : `[HABILIDADE] Uso "${h.nome}" (custo ${custo} PM, já descontado; tenho ${pers.mana} PM). Efeito: ${h.descricao}. COMO eu a uso: ${acao}. Narre conforme minha intenção — se incerto, peça a rolagem apropriada. LEMBRETE DE COESÃO: minhas palavras são empolgação, não resultado — só o SISTEMA decide dano e morte; se o inimigo ainda tiver PV, ele segue de pé.${extraTempo}`, pers);
      return;
    }
    /* Detecta habilidade citada por texto (ex.: "uso Projétil Arcano") e desconta o PM
       no app, para não depender do Mestre lembrar de cobrar. */
    const normal = (x) => (x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const acaoN = normal(acao);
    /* só considera USO se houver intenção clara (verbo de uso) + o nome da habilidade.
       Assim "pergunto sobre Bola de Fogo" NÃO ativa, mas "uso Bola de Fogo" ativa. */
    const temIntencao = /\b(uso|usar|lanco|lancar|conjuro|conjurar|invoco|invocar|ativo|ativar|executo|executar|realizo|disparo|disparar|aplico|aplicar|canalizo|uso a|uso o)\b/.test(acaoN);
    const habCitada = temIntencao ? (personagem.habilidades || []).find((h) => h && h.nome && acaoN.includes(normal(h.nome))) : null;
    if (habCitada) {
      const custo = Math.max(0, Number(habCitada.custo) || 0);
      if (personagem.mana < custo) { pushMsgs([{ autor: "jogador", texto: acao }, { autor: "sistema", texto: `Mana insuficiente para ${habCitada.nome}.` }]); return; }
      const recCit = (personagem.habRecarga || {})[(habCitada.nome || "").toLowerCase()] || 0;
      if (recCit > 0) { pushMsgs([{ autor: "jogador", texto: acao }, { autor: "sistema", texto: `⏳ ${habCitada.nome} está em recarga — pronta em ${recCit} turno${recCit > 1 ? "s" : ""}.` }]); return; }
      /* ECONOMIA (v7.4): idem — habilidade citada por texto também gasta */
      if (combateRef.current && combateRef.current.economia) {
        const ecoH2 = combateRef.current.economia;
        if (ecoH2.acao <= 0 && ecoH2.extra <= 0) { pushMsgs([{ autor: "jogador", texto: acao }, { autor: "sistema", texto: "⏳ Sem movimentos neste turno — toque em Encerrar turno." }]); return; }
        if (ecoH2.acao > 0) ecoH2.acao -= 1; else ecoH2.extra -= 1;
        combateRef.current = { ...combateRef.current, economia: { ...ecoH2 } }; setCombate(combateRef.current);
      }
      const recC = habCitada.recarga != null ? Math.max(0, Number(habCitada.recarga) || 0) : recargaPadrao(custo);
      let pers = { ...personagem, mana: personagem.mana - custo, habRecarga: recC > 0 ? { ...(personagem.habRecarga || {}), [(habCitada.nome || "").toLowerCase()]: recC } : (personagem.habRecarga || {}) };
      const buffC = aplicarBuffDeHabilidade(habCitada, pers);
      pers = buffC.pers;
      setPersonagem(pers);
      habUsadaRef.current = true;
      pushMsgs([{ autor: "jogador", texto: acao }, { autor: "sistema", texto: `✦ ${habCitada.nome} · gastou ${custo} PM · restam ${pers.mana}/${pers.manaMax}${recC > 0 ? ` · ⏳ recarga ${recC}t` : ""}` }, ...(buffC.texto ? [{ autor: "sistema", texto: buffC.texto }] : [])]);
      if (buffC.nota) notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}${buffC.nota}`;
      const desfechoC = resolverHabilidadeOfensiva(habCitada, acao, pers);
      enviar(desfechoC
        ? `[HABILIDADE — RESOLVIDA PELO SISTEMA] Usei "${habCitada.nome}" (custo ${custo} PM, já descontado). O SISTEMA já rolou o acerto, calculou e APLICOU o resultado: ${desfechoC}. Sua função é APENAS narrar esse resultado exato — não recalcule, NÃO declare a morte de quem ainda tem PV. Minha intenção: ${acao}`
        : `[HABILIDADE] Uso "${habCitada.nome}" (custo ${custo} PM, já descontado; tenho ${pers.mana} PM). ${habCitada.descricao || ""} Ação: ${acao}. LEMBRETE DE COESÃO: minhas palavras são empolgação, não resultado — só o SISTEMA decide dano e morte; se o inimigo ainda tiver PV, ele segue de pé.${extraTempo}`, pers);
      return;
    }
    const ataque = resolverAtaqueJogador(acao, personagem);
    if (ataque) {
      /* ECONOMIA DE TURNO (v7.4): atacar gasta a AÇÃO. Sem ação, sem golpe —
         o turno só vira quando os movimentos acabam ou o jogador encerra. */
      const eco = combateRef.current && combateRef.current.economia;
      if (eco && eco.acao <= 0) {
        pushMsgs([{ autor: "jogador", texto: acao }, { autor: "sistema", texto: "⏳ Você já usou sua ação neste turno — use a ação extra/movimento ou toque em Encerrar turno." }]);
        return;
      }
      if (eco) { eco.acao -= 1; combateRef.current = { ...combateRef.current, economia: { ...eco } }; setCombate(combateRef.current); }
      const { resultados } = ataque;
      ataqueResolvidoRef.current = true;
      /* aplica cada golpe por código (fonte da verdade) e monta as linhas de dano */
      const gdJ = grauDe(divindadeRef.current);
      const linhas = [{ autor: "jogador", texto: acao }];
      const partesMeu = [];
      for (const { r, alvo } of resultados) {
        let pvDepois = alvo.vida;
        if (r.dano > 0) {
          const atualAlvo = (combateRef.current?.inimigos || []).find((e) => e.nome === alvo.nome);
          pvDepois = Math.max(0, (atualAlvo ? atualAlvo.vida : alvo.vida) - r.dano);
          const novo = { ...combateRef.current, inimigos: combateRef.current.inimigos.map((e) => e.nome === alvo.nome ? { ...e, vida: pvDepois, derrotado: pvDepois <= 0, ultimoDano: r.dano } : e) };
          combateRef.current = novo; setCombate(novo);
          /* AFLIÇÃO DA ARMA (v9.1): a adaga envenenada envenena — o sistema lê
             a arma equipada, rola o teste do inimigo e aplica. Sem pedir nada
             ao Mestre e sem depender de o jogador descrever bonito. */
          if (pvDepois > 0) {
            const f = fonteDaArma(personagem);
            const ap = aplicarAflicaoEmInimigo(combateRef.current.inimigos, alvo.nome, { fonte: f.texto, nomeFonte: f.nome, atacante: personagem.nome, critico: r.critico });
            if (ap.res) {
              combateRef.current = { ...combateRef.current, inimigos: ap.lista }; setCombate(combateRef.current);
              linhas.push({ autor: "sistema", texto: ap.res.texto });
              notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}${ap.res.nota}`;
              partesMeu.push(ap.res.aplicou ? `${alvo.nome} ficou ${ap.res.cond.nome.toLowerCase()}` : `${alvo.nome} resistiu à ${ap.res.cond.nome.toLowerCase()}`);
            }
          }
        }
        logDadoCombate(resumoDoAtaque(r));
        if (mostrarRolagensRef.current) linhas.push({ autor: "sistema", texto: "🎲 " + resumoDoAtaque(r) });
        linhas.push({ autor: "sistema", texto: r.escopoImune
          ? `⚔ ${personagem.nome} → ${alvo.nome}: o golpe atravessa sem encontrar carne — ${alvo.nome} é GD ${alvo.gd} (${tituloDe(alvo.gd)}), IMUNE ao seu dano comum`
          : r.dano > 0
          ? `⚔ ${personagem.nome} → ${alvo.nome}: ${r.critico ? "CRÍTICO! " : ""}${r.dano} de dano · ${alvo.nome} ${pvDepois}/${alvo.vidaMax || alvo.vida}${pvDepois <= 0 ? " ☠" : ""}`
          : `⚔ ${personagem.nome} → ${alvo.nome}: ${r.desastre ? "erro desastroso" : "errou"}` });
        partesMeu.push(r.escopoImune
          ? `${alvo.nome} — IMUNE (GD ${alvo.gd} vs meu GD ${gdJ}; dano comum não fere divindades — preciso de artefato lendário, bênção ou enfraquecê-lo)`
          : linhaParaMestre(personagem.nome, alvo.nome, r, alvo.vidaMax || alvo.vida, r.dano > 0 ? pvDepois : undefined));
      }
      pushMsgs(linhas);
      alvosGolpeRef.current = []; setAlvosGolpe([]);
      const desfecho = `${resultados.length} ${resultados.length > 1 ? "ataques" : "ataque"}: ${partesMeu.join("; ")}`;

      /* TURNO DO MUNDO (combate): os inimigos vivos revidam — o app rola e
         calcula tudo; o Mestre só narra as DECISÕES deles.
         ECONOMIA (v7.4): a revide só acontece quando o jogador GASTOU os
         movimentos ou encerrou o turno — antes disso, só os meus golpes. */
      let persAtual = personagem;
      /* meu golpe pode ter encerrado a luta: fecha AGORA, no mesmo turno */
      const fechouNoMeuGolpe = fecharSeTodosCairam();
      const combPos = combateRef.current;
      const ecoAgora = combPos && combPos.economia;
      const esgotouTurno = !combPos || !ecoAgora || (ecoAgora.acao <= 0 && ecoAgora.extra <= 0);
      const inimigosVivos = (fechouNoMeuGolpe || !esgotouTurno) ? [] : (combPos?.inimigos || []).filter((e) => !e.derrotado && e.vida > 0);
      let resumoInimigos = "";
      if (inimigosVivos.length > 0) {
        const acoes = turnoDosInimigos({ inimigos: combPos.inimigos, jogador: personagem, grupo: personagem.grupo || [], gdJogador: grauDe(divindadeRef.current) });
        const linhasSis = [];
        let danoNoJogador = 0;
        let grupoAtual = [...(personagem.grupo || [])];
        const partes = [];
        let persConcQuebrada = null;
        for (const a of acoes) {
          logDadoCombate(resumoDoAtaque(a.r));
          if (mostrarRolagensRef.current) linhasSis.push({ autor: "sistema", texto: "🎲 " + resumoDoAtaque(a.r) });
          linhasSis.push({ autor: "sistema", texto: a.r.dano > 0 ? `🛡 ${a.inimigo}${a.golpeNome ? ` · ${a.golpeNome}` : ""} → ${a.alvoNome}: ${a.r.critico ? "CRÍTICO! " : ""}${a.r.dano} de dano` : `🛡 ${a.inimigo}${a.golpeNome ? ` · ${a.golpeNome}` : ""} → ${a.alvoNome}: errou` });
          if (a.r.dano > 0) {
            if (a.alvoRef === "jogador") danoNoJogador += a.r.dano;
            else grupoAtual = grupoAtual.map((g) => g.nome === a.alvoNome ? { ...g, vida: Math.max(0, (g.vida || 0) - a.r.dano) } : g);
          }
          const alvoMax = a.alvoRef === "jogador" ? (personagem.vidaMax || 1) : ((grupoAtual.find((g) => g.nome === a.alvoNome) || {}).vidaMax || 1);
          const alvoDepois = a.r.dano > 0
            ? (a.alvoRef === "jogador" ? Math.max(0, personagem.vida - danoNoJogador) : Math.max(0, ((grupoAtual.find((g) => g.nome === a.alvoNome) || {}).vida || 0)))
            : undefined;
          partes.push(linhaParaMestre(a.golpeNome ? `${a.inimigo} (${a.golpeNome})` : a.inimigo, a.alvoNome, a.r, alvoMax, alvoDepois));
        }
        if (linhasSis.length) pushMsgs(linhasSis);
        if (danoNoJogador > 0) {
          danoJaAplicadoRef.current = true;
          /* CONCENTRAÇÃO (5e): apanhou, testa para manter a magia de duração */
          const concentrando = (personagem.efeitos || []).find((e) => e.concentracao);
          if (concentrando) {
            const tc = testeConcentracao(danoNoJogador, atributoEfetivo(personagem, "vigor"));
            if (mostrarRolagensRef.current) linhasSis.push({ autor: "sistema", texto: `🎲 ${tc.texto}` });
            if (!tc.manteve) {
              linhasSis.push({ autor: "sistema", texto: `💢 Concentração quebrada — ${concentrando.nome} se desfaz.` });
              persConcQuebrada = concentrando.nome;
            }
          }
        }
        persAtual = { ...personagem, vida: Math.max(0, personagem.vida - danoNoJogador), grupo: grupoAtual };
        if (persConcQuebrada) persAtual = { ...persAtual, efeitos: (persAtual.efeitos || []).filter((e) => e.nome !== persConcQuebrada) };
        persAtual = aplicarCondicoesDosGolpes(acoes, persAtual);

        /* TURNO DOS COMPANHEIROS: atacam inimigos ou socorrem quem caiu */
        const jogadorCaido = persAtual.vida <= 0;
        const acoesComp = turnoDosCompanheiros({ grupo: persAtual.grupo || [], inimigos: combPos.inimigos, jogadorCaido, jogadorNome: persAtual.nome, jogador: persAtual, rodada: (combPos.rodada || 1) });
        const partesComp = [];
        for (const ac of acoesComp) {
          if (ac.tipo === "ataque" && ac.r) {
            logDadoCombate(resumoDoAtaque(ac.r));
            if (mostrarRolagensRef.current) pushMsgs([{ autor: "sistema", texto: "🎲 " + resumoDoAtaque(ac.r) }]);
            let pvAlvo = null;
            if (ac.r.dano > 0) {
              combPos.inimigos = combPos.inimigos.map((e) => { if (e.nome !== ac.alvoNome) return e; pvAlvo = Math.max(0, e.vida - ac.r.dano); return { ...e, vida: pvAlvo, derrotado: pvAlvo <= 0, ultimoDano: ac.r.dano }; });
              combPos.inimigos = aflicaoDeCompanheiro(combPos.inimigos, ac, persAtual);
            }
            pushMsgs([{ autor: "sistema", texto: ac.r.dano > 0 ? `⚔ ${ac.companheiro} → ${ac.alvoNome}: ${ac.r.critico ? "CRÍTICO! " : ""}${ac.r.dano} de dano${pvAlvo !== null && pvAlvo <= 0 ? " ☠" : ""}` : `⚔ ${ac.companheiro} → ${ac.alvoNome}: errou` }]);
            partesComp.push(linhaParaMestre(ac.companheiro, ac.alvoNome, ac.r, (combPos.inimigos.find((e) => e.nome === ac.alvoNome) || {}).vidaMax || 1, ac.r.dano > 0 ? pvAlvo ?? undefined : undefined));
          } else if (ac.tipo === "habilidade" && ac.r) {
            logDadoCombate(resumoDoAtaque(ac.r));
            if (mostrarRolagensRef.current) pushMsgs([{ autor: "sistema", texto: "🎲 " + resumoDoAtaque(ac.r) }]);
            let pvAlvo = null;
            if (ac.r.dano > 0) {
              combPos.inimigos = combPos.inimigos.map((e) => { if (e.nome !== ac.alvoNome) return e; pvAlvo = Math.max(0, e.vida - ac.r.dano); return { ...e, vida: pvAlvo, derrotado: pvAlvo <= 0, ultimoDano: ac.r.dano }; });
              /* a habilidade do companheiro também aflige pelo catálogo */
              const apH = aplicarAflicaoEmInimigo(combPos.inimigos, ac.alvoNome, { fonte: `${ac.habilidade.nome} ${ac.habilidade.descricao || ""}`, nomeFonte: `${ac.habilidade.nome} (${ac.companheiro})`, atacante: ac.companheiro, critico: ac.r.critico });
              combPos.inimigos = apH.lista;
              if (apH.res) { pushMsgs([{ autor: "sistema", texto: apH.res.texto }]); notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}${apH.res.nota}`; }
            }
            persAtual = gastarManaComp(persAtual, ac.companheiro, ac.custo);
            pushMsgs([{ autor: "sistema", texto: `✦ ${ac.companheiro} · ${ac.habilidade.nome} → ${ac.alvoNome}: ${ac.r.dano > 0 ? `${ac.r.critico ? "CRÍTICO! " : ""}${ac.r.dano} de dano${pvAlvo !== null && pvAlvo <= 0 ? " ☠" : ""}` : "errou"}` }]);
            partesComp.push(`${ac.companheiro} usou ${ac.habilidade.nome}: ${linhaParaMestre(ac.companheiro, ac.alvoNome, ac.r, (combPos.inimigos.find((e) => e.nome === ac.alvoNome) || {}).vidaMax || 1, ac.r.dano > 0 ? pvAlvo ?? undefined : undefined)}`);
          } else if (ac.tipo === "cura") {
            const r2 = curarAliado(persAtual, ac.alvo, ac.valor);
            persAtual = gastarManaComp(r2.pers, ac.companheiro, ac.custo);
            pushMsgs([{ autor: "sistema", texto: `🩶 ${ac.companheiro} · ${ac.habilidade.nome} → ${ac.alvo}: +${r2.curado} PV (${r2.texto})` }]);
            partesComp.push(`${ac.companheiro} lançou ${ac.habilidade.nome} em ${ac.alvo} (+${r2.curado} PV, agora ${r2.texto}) — o PV JÁ subiu, narre o gesto`);
          } else if (ac.tipo === "pocao") {
            const r3 = pocaoDeCompanheiro(persAtual, ac);
            persAtual = r3.pers;
            pushMsgs([{ autor: "sistema", texto: r3.texto }]);
            partesComp.push(r3.paraMestre);
          } else if (ac.tipo === "buff") {
            const r4 = buffDeCompanheiro(persAtual, ac);
            persAtual = gastarManaComp(r4.pers, ac.companheiro, ac.custo);
            if (r4.texto) pushMsgs([{ autor: "sistema", texto: r4.texto }]);
            partesComp.push(r4.paraMestre);
          }
        }
        combateRef.current = combPos; setCombate({ ...combPos });
        fecharSeTodosCairam(); // companheiro pode ter dado o golpe final

        /* SISTEMA DE MORTE: se o jogador está a 0 PV, faz um teste de morte */
        if (persAtual.vida <= 0) {
          const estadoMorte = persAtual.morte || { sucessos: 0, falhas: 0 };
          const res = testeDeMorte();
          const ap = aplicarTesteMorte(estadoMorte, res);
          pushMsgs([{ autor: "sistema", texto: `☠ Teste de morte: ${res.texto}` }]);
          if (ap.desfecho === "revive") { persAtual = { ...persAtual, vida: 1, morrendo: false, morte: { sucessos: 0, falhas: 0 } }; pushMsgs([{ autor: "sistema", texto: "✨ Você volta a si com 1 PV!" }]); }
          else if (ap.desfecho === "estavel") { persAtual = { ...persAtual, morrendo: true, morte: { sucessos: 0, falhas: 0 } }; pushMsgs([{ autor: "sistema", texto: "Você estabiliza — inconsciente, mas vivo. Alguém precisa te ajudar." }]); }
          else if (ap.desfecho === "morto") { persAtual = { ...persAtual, morrendo: false, morto: true, morte: ap }; pushMsgs([{ autor: "sistema", texto: "💀 Você tomba… mas enquanto houver esperança, a lenda não termina." }]); }
          else { persAtual = { ...persAtual, morrendo: true, morte: ap }; }
        }

        setPersonagem(persAtual);
        const compTxt = partesComp.length ? ` Meus companheiros agiram: ${partesComp.join("; ")}.` : "";
        const morteTxt = persAtual.vida <= 0 ? ` ATENÇÃO: eu caí a 0 PV e estou ${persAtual.morto ? "à beira da morte" : "inconsciente, lutando pela vida (testes de morte). Um aliado pode me estabilizar ou curar para eu voltar"}.` : "";
        resumoInimigos = ` Turno dos inimigos (resolvido pelo sistema, dano já aplicado — narre só as decisões): ${partes.join("; ")}.${compTxt}${morteTxt}`;
        /* NOVA RODADA: com a revide concluída, meus movimentos renovam */
        if (combateRef.current) {
          combateRef.current = { ...combateRef.current, economia: { acao: 1, extra: 1 } };
          setCombate(combateRef.current);
        }
      }

      if (!esgotouTurno && !fechouNoMeuGolpe) {
        /* MEU TURNO CONTINUA: só narro meus golpes — o mundo ainda NÃO revida */
        enviar(`[COMBATE — MEU GOLPE RESOLVIDO PELO SISTEMA, TURNO AINDA MEU] Minha sequência de ${desfecho}. O dano já foi aplicado — NÃO recalcule. Narre SÓ os meus golpes e as reações instantâneas (1-3 frases: quem cambaleou, quem urrou) e PARE — NÃO faça os inimigos agirem nem contra-atacarem ainda: meu turno continua, ainda tenho ${ecoAgora ? ecoAgora.acao + ecoAgora.extra : 1} movimento(s). Ação declarada: ${acao}`, persAtual);
        return;
      }
      enviar(`[COMBATE — RESOLVIDO PELO SISTEMA] Minha sequência de ${desfecho}. O dano já foi aplicado.${resumoInimigos} NÃO recalcule nem mude números — NARRE de forma vívida (2-4 frases) a sequência dos meus golpes e as decisões e reações dos inimigos: quem recuou, quem avançou, quem mudou de alvo. Ação declarada: ${acao}`, persAtual);
      return;
    }
    pushMsgs([{ autor: "jogador", texto: acao }]);
    enviar(`${acao}${extraTempo}`, personagem);
  };

  /* VEZ DO MUNDO: o mundo vive o instante presente (curto no TEMPO, mas cheio
     de vida — pessoas agem, falam, decidem; coisas acontecem agora). */
  /* Fecha o combate IMEDIATAMENTE se todos os inimigos caíram. Necessário
     porque o dano aplicado por código (meu golpe / turno dos companheiros)
     não passa pelo processarCombate, onde ficava a única verificação. */
  /* LOG DE DADOS (v7.4.2): os d20 internos do combate ficam visíveis num
     mini-log do painel — transparência de mesa, custo zero de token. */
  const logDadoCombate = (txt) => {
    const c = combateRef.current;
    if (!c) return;
    combateRef.current = { ...c, log: [...(c.log || []), txt].slice(-6) };
    setCombate(combateRef.current);
  };

  const fecharSeTodosCairam = () => {
    const c = combateRef.current;
    if (!c || !(c.inimigos || []).length) return false;
    const todosCairam = c.inimigos.every((e) => e.derrotado || (e.vida || 0) <= 0);
    if (!todosCairam) return false;
    combateRef.current = null; setCombate(null); combateOciosoRef.current = 0;
    const derrotados = c.inimigos;
    const esp = gerarEspolios(derrotados);
    const msgsU = [];
    setPersonagem((p) => {
      let p2 = { ...p, moedas: (p.moedas || 0) + esp.moedas, xp: (p.xp || 0) + esp.xp };
      while (p2.xp >= XP_POR_NIVEL(p2.nivel)) { p2.xp -= XP_POR_NIVEL(p2.nivel); p2.nivel += 1; p2.nivelPendentes = (p2.nivelPendentes || 0) + 1; }
      p2.grupo = (p2.grupo || []).map((g) => { const ev = evoluirCompanheiro({ ...g, xp: (g.xp || 0) + esp.xp }); delete ev._subiu; return ev; });
      /* PRESENÇA DIVINA expira com o fim do combate — não vira debuff eterno */
      p2.condicoes = (p2.condicoes || []).filter((c) => !(c.origem || "").startsWith("presença de"));
      p2.grupo = (p2.grupo || []).map((g) => ({ ...g, condicoes: (g.condicoes || []).filter((c) => !(c.origem || "").startsWith("presença de")) }));
      p2 = talvezDespertarUnica(p2, derrotados, msgsU);
      /* consumíveis também caem quando a luta fecha por código */
      const caidos = [];
      for (let i = 0; i < (esp.consumiveis || 0); i++) {
        const cc = sortearConsumivel(p2.nivel || 1);
        if (!cc) continue;
        caidos.push(cc);
        p2 = { ...p2, inventario: [...(p2.inventario || []), itemConsumivel(cc.id)] };
      }
      if (caidos.length) msgsU.push(`${caidos[0].icone} Na bolsa: ${caidos.map((cc) => cc.nome).join(", ")}`);
      return p2;
    });
    pushMsgs([
      { autor: "sistema", texto: "⚔ Todos os inimigos caíram — o combate termina." },
      { autor: "sistema", texto: `◉ Espólios: +${esp.moedas} moedas · +${esp.xp} XP` },
      ...msgsU.map((t) => ({ autor: "sistema", texto: t })),
    ]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[VITÓRIA — sistema já aplicou +${esp.moedas} moedas e +${esp.xp} XP] NÃO envie moedas nem xp. Narre o desfecho em 2-3 frases.${esp.caiItem ? " UM ITEM CAIU: crie um item coerente e envie em \"adicionar_equipamento\" ou \"adicionar_itens\"." : " Sem itens desta vez."}`;
    return true;
  };

  /* ENCERRAR TURNO POR ESCOLHA (v7.4): o jogador pode passar a vez antes de
     gastar os movimentos — os inimigos revidam (sistema rola), companheiros
     agem, e a nova rodada começa com os movimentos renovados. */
  const encerrarTurnoCombate = () => {
    const combPos = combateRef.current;
    if (!combPos || carregando) return;
    pushMsgs([{ autor: "jogador", texto: "🛡 Encerro meu turno em guarda." }]);
    const vivos = (combPos.inimigos || []).filter((e) => !e.derrotado && e.vida > 0);
    if (!vivos.length) { fecharSeTodosCairam(); return; }
    const acoes = turnoDosInimigos({ inimigos: combPos.inimigos, jogador: personagem, grupo: personagem.grupo || [], gdJogador: grauDe(divindadeRef.current) });
    const linhasSis = [];
    let danoNoJogador = 0;
    let grupoAtual = [...(personagem.grupo || [])];
    const partes = [];
    for (const a of acoes) {
      logDadoCombate(resumoDoAtaque(a.r));
      if (mostrarRolagensRef.current) linhasSis.push({ autor: "sistema", texto: "🎲 " + resumoDoAtaque(a.r) });
      linhasSis.push({ autor: "sistema", texto: a.r.dano > 0 ? `🛡 ${a.inimigo}${a.golpeNome ? ` · ${a.golpeNome}` : ""} → ${a.alvoNome}: ${a.r.critico ? "CRÍTICO! " : ""}${a.r.dano} de dano` : `🛡 ${a.inimigo}${a.golpeNome ? ` · ${a.golpeNome}` : ""} → ${a.alvoNome}: errou` });
      if (a.r.dano > 0) {
        if (a.alvoRef === "jogador") danoNoJogador += a.r.dano;
        else grupoAtual = grupoAtual.map((g) => g.nome === a.alvoNome ? { ...g, vida: Math.max(0, (g.vida || 0) - a.r.dano) } : g);
      }
      const res = a.r.resultado === "critico" ? `acertou em cheio (${a.r.dano})` : a.r.resultado === "acerta" ? `acertou (${a.r.dano})` : a.r.resultado === "desastre" ? "falhou feio" : "errou";
      partes.push(`${a.inimigo}${a.golpeNome ? ` (${a.golpeNome})` : ""}→${a.alvoNome}: ${res}`);
    }
    if (linhasSis.length) pushMsgs(linhasSis);
    let persAtual = { ...personagem, vida: Math.max(0, personagem.vida - danoNoJogador), grupo: grupoAtual };
    persAtual = aplicarCondicoesDosGolpes(acoes, persAtual);
    /* companheiros agem como numa rodada normal */
    const jogadorCaido = persAtual.vida <= 0;
    const acoesComp = turnoDosCompanheiros({ grupo: persAtual.grupo || [], inimigos: combPos.inimigos, jogadorCaido, jogadorNome: persAtual.nome, jogador: persAtual, rodada: (combPos.rodada || 1) });
    const partesComp = [];
    for (const ac of acoesComp) {
      if (ac.tipo === "ataque" && ac.r) {
        let pvAlvo = null;
        if (ac.r.dano > 0) {
          combPos.inimigos = combPos.inimigos.map((e) => { if (e.nome !== ac.alvoNome) return e; pvAlvo = Math.max(0, e.vida - ac.r.dano); return { ...e, vida: pvAlvo, derrotado: pvAlvo <= 0, ultimoDano: ac.r.dano }; });
              combPos.inimigos = aflicaoDeCompanheiro(combPos.inimigos, ac, persAtual);
        }
        pushMsgs([{ autor: "sistema", texto: ac.r.dano > 0 ? `⚔ ${ac.companheiro} → ${ac.alvoNome}: ${ac.r.critico ? "CRÍTICO! " : ""}${ac.r.dano} de dano${pvAlvo !== null && pvAlvo <= 0 ? " ☠" : ""}` : `⚔ ${ac.companheiro} → ${ac.alvoNome}: errou` }]);
        partesComp.push(`${ac.companheiro} atacou ${ac.alvoNome} (${ac.r.resultado === "acerta" || ac.r.resultado === "critico" ? ac.r.dano + " dano" : "errou"})`);
      } else if (ac.tipo === "habilidade" && ac.r) {
        let pvAlvo = null;
        if (ac.r.dano > 0) {
          combPos.inimigos = combPos.inimigos.map((e) => { if (e.nome !== ac.alvoNome) return e; pvAlvo = Math.max(0, e.vida - ac.r.dano); return { ...e, vida: pvAlvo, derrotado: pvAlvo <= 0, ultimoDano: ac.r.dano }; });
          const apH = aplicarAflicaoEmInimigo(combPos.inimigos, ac.alvoNome, { fonte: `${ac.habilidade.nome} ${ac.habilidade.descricao || ""}`, nomeFonte: `${ac.habilidade.nome} (${ac.companheiro})`, atacante: ac.companheiro, critico: ac.r.critico });
          combPos.inimigos = apH.lista;
          if (apH.res) { pushMsgs([{ autor: "sistema", texto: apH.res.texto }]); notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}${apH.res.nota}`; }
        }
        persAtual = gastarManaComp(persAtual, ac.companheiro, ac.custo);
        pushMsgs([{ autor: "sistema", texto: `✦ ${ac.companheiro} · ${ac.habilidade.nome} → ${ac.alvoNome}: ${ac.r.dano > 0 ? `${ac.r.dano} de dano${pvAlvo !== null && pvAlvo <= 0 ? " ☠" : ""}` : "errou"}` }]);
        partesComp.push(`${ac.companheiro} usou ${ac.habilidade.nome} em ${ac.alvoNome} (${ac.r.dano > 0 ? ac.r.dano + " dano" : "errou"})`);
      } else if (ac.tipo === "cura") {
        const r2 = curarAliado(persAtual, ac.alvo, ac.valor);
        persAtual = gastarManaComp(r2.pers, ac.companheiro, ac.custo);
        pushMsgs([{ autor: "sistema", texto: `🩶 ${ac.companheiro} · ${ac.habilidade.nome} → ${ac.alvo}: +${r2.curado} PV (${r2.texto})` }]);
        partesComp.push(`${ac.companheiro} curou ${ac.alvo} em ${r2.curado} PV com ${ac.habilidade.nome} — já aplicado`);
      } else if (ac.tipo === "pocao") {
        const r3 = pocaoDeCompanheiro(persAtual, ac);
        persAtual = r3.pers;
        pushMsgs([{ autor: "sistema", texto: r3.texto }]);
        partesComp.push(r3.paraMestre);
      } else if (ac.tipo === "buff") {
        const r4 = buffDeCompanheiro(persAtual, ac);
        persAtual = gastarManaComp(r4.pers, ac.companheiro, ac.custo);
        if (r4.texto) pushMsgs([{ autor: "sistema", texto: r4.texto }]);
        partesComp.push(r4.paraMestre);
      }
    }
    /* nova rodada: movimentos renovados */
    combateRef.current = { ...combPos, economia: { acao: 1, extra: 1 }, rodada: (combPos.rodada || 1) + 1 };
    setCombate(combateRef.current);
    fecharSeTodosCairam();
    setPersonagem(persAtual);
    const compTxt = partesComp.length ? ` Meus companheiros agiram: ${partesComp.join("; ")}.` : "";
    const morteTxt = persAtual.vida <= 0 ? " ATENÇÃO: caí a 0 PV — um aliado precisa me estabilizar ou curar." : "";
    enviar(`[COMBATE — TURNO ENCERRADO PELO JOGADOR, RESOLVIDO PELO SISTEMA] Escolhi encerrar meu turno em guarda. Turno dos inimigos (dano já aplicado — NÃO recalcule): ${partes.join("; ")}.${compTxt}${morteTxt} Narre as decisões e reações deles (2-4 frases) e me devolva a vez — nova rodada, meus movimentos estão renovados.`, persAtual);
  };

  const vezDoMundo = () => {
    if (bloqueado || acampadoRef.current) return;
    ehAcaoMundoRef.current = true;
    setAguardandoMundo(false);
    pushMsgs([{ autor: "sistema", texto: "🌍 O mundo vive…" }]);
    const modo = MODOS_MUNDO[modoMundoRef.current % MODOS_MUNDO.length];
    modoMundoRef.current += 1;
    enviar(`[VEZ DO MUNDO] ${instrucaoMundo(modo, urgenciaRef.current >= 1)}`, personagem);
  };

  /* RESPONDER + VEZ DO MUNDO ao mesmo tempo: sua fala é conduzida E o mundo
     vive o mesmo instante (pessoas agem e falam, coisas acontecem no presente). */
  const responderEMover = (texto) => {
    const fala = (texto || "").trim();
    if (!fala || bloqueado) return;
    setEntrada("");
    ehAcaoMundoRef.current = true;
    pushMsgs([{ autor: "jogador", texto: fala }]);
    const modo = MODOS_MUNDO[modoMundoRef.current % MODOS_MUNDO.length];
    modoMundoRef.current += 1;
    enviar(`[RESPONDO E O MUNDO VIVE] Eu falo: "${fala}". ${instrucaoMundo(modo, urgenciaRef.current >= 1)}`, personagem);
  };

  /* TURNO DO MUNDO SEMI-AUTOMÁTICO (v7.0): depois da sua ação o mundo fica
     "na iminência" por 60s. Se você digitar, o relógio pausa — você sempre
     tem a chance de responder. Se nada acontecer, o mundo vive sozinho.
     Pode ser desligado no botão ao lado. */
  const [autoMundo, setAutoMundo] = useState(true);
  const mundoAutoDesdeRef = useRef(null);
  const [tickMundo, setTickMundo] = useState(0);
  useEffect(() => {
    if (!aguardandoMundo) { mundoAutoDesdeRef.current = null; return; }
    if (!mundoAutoDesdeRef.current) mundoAutoDesdeRef.current = Date.now();
    if (!autoMundo) return;
    const t = setInterval(() => {
      setTickMundo((x) => x + 1);
      if (bloqueado || rolagem || combateRef.current || acampadoRef.current) return;
      if ((entrada || "").trim()) return; // você está digitando — o mundo espera
      if (Date.now() - mundoAutoDesdeRef.current >= 60 * 1000) vezDoMundo();
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aguardandoMundo, autoMundo, entrada]); // bloqueado/rolagem lidos só no callback (declarados adiante no componente)
  const mundoRestante = (aguardandoMundo && autoMundo && mundoAutoDesdeRef.current)
    ? Math.max(0, 60 - Math.floor((Date.now() - mundoAutoDesdeRef.current) / 1000))
    : null;

  /* PASSAR O TEMPO (deliberado): simula N horas; quanto mais horas, mais o mundo muda */
  const passarTempo = (horas) => {
    if (bloqueado || acampadoRef.current) return;
    if (combateRef.current) { combateRef.current = null; setCombate(null); combateOciosoRef.current = 0; }
    setMostrarHoras(false);
    ehAcaoMundoRef.current = true;
    setAguardandoMundo(false);
    const escala = horas <= 3 ? "algumas horas (mudanças pequenas)" : horas <= 8 ? "boa parte do dia (mudanças perceptíveis)" : horas <= 16 ? "quase um dia inteiro (mudanças significativas)" : "um dia completo (o mundo se move bastante)";
    pushMsgs([{ autor: "sistema", texto: `🕐 Você deixa ${horas}h passarem…` }]);
    /* RELÓGIO: "passar o tempo" agora move as horas de verdade — dias viram
       por aqui também (reino, festivais, sono), não só a ficção. */
    const diasPassados = Math.floor(horas / 24);
    if (diasPassados > 0) coletarRenda(diasPassados);
    const reinoMsg = avancarMinutos(horas * 60);
    const climaNovo = talvezMudarClima(horas >= 8 ? 0.65 : 0.35);
    const climaMsg = climaNovo ? `\n[CLIMA] O tempo virou: agora está ${climaNovo.rotulo} — ${climaNovo.nota}. Use isso na cena.` : "";
    enviar(`[PASSAR O TEMPO — ${horas} horas] Simule a passagem de ${horas} horas: ${escala}. Faça o mundo VIVER esse intervalo proporcionalmente — o que os NPCs e facções fizeram, o que avançou, o que mudou no ambiente e nas suas missões, notícias que chegaram. Quanto mais horas, mais coisas acontecem (mas sempre plausível, nunca absurdo tipo impérios caindo em 1 dia). Ao final, reapresente a cena atual e me convide a agir.${climaMsg}${reinoMsg}`, personagem);
  };

  const modPend = rolagem ? (() => { const a = ATRIBUTOS.find((x) => x.nome.toLowerCase() === (rolagem.atributo || "").toLowerCase()); return a && personagem ? atributoEfetivo(personagem, a.id) : 0; })() : 0;

  const concluirRolagem = (valor) => {
    const r = rolagem;
    if (!r || rolagemConsumidaRef.current === r.motivo + r.dificuldade) { setDadoRolando(false); return; }
    rolagemConsumidaRef.current = r.motivo + r.dificuldade;
    if (r.auto) {
      setDadoRolando(false); setRolagem(null);
      pushMsgs([{ autor: "sistema", texto: `✓ ${r.motivo || "Teste"}: trivial para seu patamar — sucesso sem rolagem` }]);
      enviar(`[TESTE — SUCESSO AUTOMÁTICO] "${r.motivo || "ação"}": trivial para meu patamar (dificuldade ${r.dificuldade} vs minha competência). Narre o êxito com naturalidade, sem drama de dado.${SO_ISSO}`, personagem);
      return;
    }
    const mod = modPend;
    const total = valor + mod;
    const dc = r.dificuldade;
    const critico = valor === 20, desastre = valor === 1;
    const resultado = dc == null ? "resultado livre" : critico ? "SUCESSO CRÍTICO" : desastre ? "FALHA CRÍTICA" : total >= dc ? "sucesso" : "falha";
    /* CÓDEX: 20 natural e 1 natural contam para as conquistas */
    if (critico) { bumpCont("criticos"); checarConquistas(); }
    if (desastre) { bumpCont("desastres"); checarConquistas(); }
    setDadoRolando(false); setRolagem(null);
    const buffs = (personagem.efeitos || []).filter((e) => !e.aplica || e.aplica.toLowerCase() === (r.atributo || "").toLowerCase() || e.aplica.toLowerCase() === "testes");
    const notaBuff = buffs.length ? ` (inclui bônus de ${buffs.map((b) => b.nome).join(", ")})` : "";
    pushMsgs([{ autor: "sistema", texto: `🎲 d20 → ${valor}${mod ? ` + ${mod}` : ""} = ${total}${dc != null ? ` vs dif. ${dc}` : ""} · ${resultado}` }]);
    const notaVant = r.vantagem ? " (com vantagem)" : r.desvantagem ? " (com desvantagem)" : "";
    enviar(`[ROLAGEM] Teste de ${r.atributo || "sorte"} (${r.motivo})${notaVant}: rolei ${valor}, modificador +${mod}${notaBuff}, total ${total}${dc != null ? `, dificuldade ${dc}` : ""}. Resultado: ${resultado}. Narre as consequências de forma coerente com o resultado.`, personagem);
  };

  /* SUBIR DE NÍVEL (v9.2): o atributo é escolhido aqui; a HABILIDADE virou
     ponto, gasto na árvore (Gestão › Talentos) quando o jogador quiser — é o
     que torna a multiclasse possível sem decidir tudo num modal apressado. */
  const escolherAtributo = (attrId, hab) => {
    const nv = Math.min(ATRIBUTO_MAX, personagem.atributos[attrId] + 1);
    const nomeAttr = ATRIBUTOS.find((a) => a.id === attrId)?.nome || attrId;
    /* o nível recém-alcançado é o que define quantos pontos ele rende (v9.4) */
    const nivelNovo = (personagem.nivel || 1) - Math.max(0, (personagem.nivelPendentes || 1) - 1);
    const ganho = hab ? 0 : pontosNoNivel(nivelNovo);
    const msgs = [`✦ ${nomeAttr} fortalecido: +${nv}`, `✦ +${ganho} ponto${ganho > 1 ? "s" : ""} de habilidade — gaste na árvore em Gestão › Talentos.`];
    setPersonagem((p) => {
      const habs = [...(p.habilidades || [])];
      if (hab && !habs.some((x) => (x.nome || x) === hab.nome)) habs.push({ nome: hab.nome, custo: hab.custo, descricao: hab.descricao });
      return { ...p, atributos: { ...p.atributos, [attrId]: nv }, habilidades: habs, pontosHab: (p.pontosHab || 0) + ganho, nivelPendentes: Math.max(0, p.nivelPendentes - 1) };
    });
    if (hab) msgs.push(`✦ Nova habilidade: ${hab.nome} (${hab.custo} PM)`);
    notaRef.current = `[FICHA — REGISTRO DO SISTEMA] Subi para o nível ${personagem.nivel} e fortaleci ${nomeAttr} (agora +${nv}). É anotação de ficha: mencione o crescimento de passagem se couber, sem abrir cena de treinamento.`;
    pushMsgs(msgs.map((t) => ({ autor: "sistema", texto: t })));
  };

  /* ---------------- ÁRVORE DE TALENTOS (v9.2) ---------------- */
  const aprenderHabilidade = (classeNome, nomeHab) => {
    /* a ficha vem da classe OU da subclasse — as duas árvores usam a mesma porta */
    const hab = fichaDaHabilidade(nomeHab);
    if (!hab) return;
    const chk = podePegarHabilidade(personagem, classeNome, hab);
    if (!chk.pode) { pushMsgs([{ autor: "sistema", texto: `⛔ ${nomeHab}: ${chk.motivo}.` }]); return; }
    const eraNova = !ranksDoPersonagem(personagem)[classeNome] && classeNome !== personagem.classe;
    const p = {
      ...personagem,
      habilidades: [...(personagem.habilidades || []), { nome: hab.nome, custo: hab.custo, descricao: hab.descricao, tipo: hab.tipo, recarga: recargaPadrao(hab.custo) }],
      pontosHab: Math.max(0, pontosDisponiveis(personagem) - custoEmPontos(hab)),
      classes: { ...(personagem.classes || {}), [classeNome]: ((personagem.classes || {})[classeNome] || 0) + 1 },
    };
    setPersonagem(p);
    pushMsgs([{ autor: "sistema", texto: `✦ Nova habilidade: ${hab.nome} (${hab.custo} PM) — ${classeNome}${hab.subclasse ? ` · ${hab.subclasse}` : ""}${eraNova ? " · segunda classe aberta!" : ""} — ${custoEmPontos(hab)} ponto(s)` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[FICHA — REGISTRO DO SISTEMA] Aprendi a habilidade "${hab.nome}" (${hab.custo} PM: ${hab.descricao})${eraNova ? `, abrindo TAMBÉM o caminho de ${classeNome} — sou ${personagem.classe} e ${classeNome} agora` : ""}. Isso é só uma anotação de ficha: NÃO abra cena, não invente treinamento, mestre nem viagem por causa disso. Se couber naturalmente numa cena futura, deixe transparecer.`;
    salvar({ personagem: p });
    checarConquistas(p);
  };

  /* SUBCLASSE (v9.3): o caminho dentro da classe. Uma só por classe, e para
     sempre — quem quiser trocar paga a redistribuição. */
  const escolherSubclasseUI = (classeNome, subNome) => {
    const chk = podeEscolherSubclasse(personagem, classeNome);
    if (!chk.pode) { pushMsgs([{ autor: "sistema", texto: `⛔ ${chk.motivo}.` }]); return; }
    const p = { ...personagem, subclasses: { ...(personagem.subclasses || {}), [classeNome]: subNome },
      subclasse: classeNome === personagem.classe ? subNome : personagem.subclasse };
    setPersonagem(p);
    pushMsgs([{ autor: "sistema", texto: `✦ Caminho escolhido: ${subNome} (${classeNome}). Quatro habilidades exclusivas abrem nos degraus 3, 5, 7 e 9.` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[MARCO DE CAMINHO — REGISTRO DO SISTEMA] Escolhi a especialização "${subNome}" dentro de ${classeNome}. Isso é um marco da minha formação: mencione de passagem, quando couber, que meu jeito de lutar/agir mudou nessa direção. NÃO abra cena nova por causa disso nem invente mestres, rituais ou viagens — foi uma escolha minha de ficha.`;
    salvar({ personagem: p });
    checarConquistas(p);
  };

  const respecHabilidades = () => {
    const custo = custoRespec(personagem.nivel || 1);
    if ((personagem.moedas || 0) < custo) { pushMsgs([{ autor: "sistema", texto: `⛔ A redistribuição custa ◉ ${custo}.` }]); return; }
    /* só as habilidades DE CATÁLOGO voltam ao bolo: únicas e dádivas ficam */
    const mantidas = (personagem.habilidades || []).filter((h) => !classeDaHabilidade(typeof h === "string" ? h : h.nome));
    const devolvidos = (personagem.habilidades || []).length - mantidas.length;
    /* devolve o CUSTO real do que estava gasto (degrau alto vale mais) */
    const p = {
      ...personagem,
      moedas: (personagem.moedas || 0) - custo,
      habilidades: mantidas,
      classes: { [personagem.classe]: 0 },
      subclasses: {},
      subclasse: "",
      pontosHab: pontosDisponiveis(personagem) + custoJaGasto(personagem),
    };
    setPersonagem(p);
    pushMsgs([{ autor: "sistema", texto: `⟲ Redistribuição feita (−◉ ${custo}): ${devolvidos} ponto(s) de volta. Escolha de novo na árvore.` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Passei por um treinamento longo e REFIZ meu caminho: desaprendi o que sabia de classe e vou reaprender diferente. Narre isso como semanas de treino/estudo ou um ritual, se couber na cena — mas o efeito mecânico já está aplicado.`;
    salvar({ personagem: p });
  };

  const equipar = (item) => {
    setPersonagem((p) => {
      const slot = item.tipo || "arma";
      const equipados = { ...(p.equipados || {}) };
      equipados[slot] = item; // substitui o que estiver no mesmo slot (volta pra mochila automaticamente)
      return { ...p, equipados };
    });
    pushMsgs([{ autor: "sistema", texto: `⚔ Equipou: ${item.nome}` }]);
  };

  const desequipar = (slot) => {
    setPersonagem((p) => {
      const equipados = { ...(p.equipados || {}) };
      delete equipados[slot];
      return { ...p, equipados };
    });
  };

  const descartarItem = (nome) => {
    setPersonagem((p) => {
      const idx = p.inventario.findIndex((x) => (typeof x === "string" ? x : (x && x.nome)) === nome);
      if (idx === -1) return p;
      const inv = [...p.inventario]; inv.splice(idx, 1);
      return { ...p, inventario: inv };
    });
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Descartei o item: ${nome}.`;
    pushMsgs([{ autor: "sistema", texto: `Item descartado: ${nome}` }]);
  };

  const descartarEquip = (nome) => {
    setPersonagem((p) => ({ ...p, equipamento: (p.equipamento || []).filter((e) => e.nome !== nome) }));
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Descartei o equipamento: ${nome}.`;
    pushMsgs([{ autor: "sistema", texto: `Equipamento descartado: ${nome}` }]);
  };

  /* ---------------- EQUIPAMENTO DOS COMPANHEIROS (100% app) ----------------
     O jogador gerencia o que cada companheiro veste — nada de "dar o item e
     ele não equipar". Bônus valem no combate por código (arma = dano, defesa = CA). */
  const equiparComp = (nomeComp, item) => {
    if (!item || !item.nome) return;
    setPersonagem((p) => ({
      ...p,
      grupo: (p.grupo || []).map((g) => {
        if (g.nome !== nomeComp) return g;
        const slot = item.tipo || "arma";
        let inv = (g.inventario || []).filter((x) => (typeof x === "string" ? x : (x && x.nome)) !== item.nome);
        let eqp = (g.equipamento || []).filter((x) => x.nome !== item.nome);
        const equipados = { ...(g.equipados || {}) };
        const antigo = equipados[slot];
        if (antigo) eqp = [...eqp, antigo]; // o que estava no slot volta para a mochila
        equipados[slot] = item;
        return { ...g, inventario: inv, equipamento: eqp, equipados };
      }),
    }));
    pushMsgs([{ autor: "sistema", texto: `⚔ ${nomeComp} equipou: ${item.nome}` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] ${nomeComp} agora usa ${item.nome} (equipado pelo jogador). Reflita isso na ficção.`;
  };

  const desequiparComp = (nomeComp, slot) => {
    setPersonagem((p) => ({
      ...p,
      grupo: (p.grupo || []).map((g) => {
        if (g.nome !== nomeComp) return g;
        const equipados = { ...(g.equipados || {}) };
        const it = equipados[slot];
        if (!it) return g;
        delete equipados[slot];
        return { ...g, equipados, equipamento: [...(g.equipamento || []), it] };
      }),
    }));
  };

  /* ---------------- FORJA (fabricação básica, 100% por código) ----------------
     Desmontar equipamento → essência. Essência + moedas → item procedural novo. */
  const desmontarEquip = (de, nome) => {
    if (de === "eu") {
      const it = (personagem.equipamento || []).find((e) => e.nome === nome);
      if (!it) return;
      const ganho = essenciaDe(it);
      setPersonagem((p) => ({ ...p, equipamento: (p.equipamento || []).filter((e) => e.nome !== nome), essencia: (p.essencia || 0) + ganho }));
      pushMsgs([{ autor: "sistema", texto: `⚒ Desmontado: ${nome} → +${ganho} ⚗ essência` }]);
    } else {
      const g = (personagem.grupo || []).find((x) => x.nome === de);
      const it = g && (g.equipamento || []).find((e) => e.nome === nome);
      if (!it) return;
      const ganho = essenciaDe(it);
      setPersonagem((p) => ({
        ...p, essencia: (p.essencia || 0) + ganho,
        grupo: (p.grupo || []).map((x) => x.nome === de ? { ...x, equipamento: (x.equipamento || []).filter((e) => e.nome !== nome) } : x),
      }));
      pushMsgs([{ autor: "sistema", texto: `⚒ Desmontado (${de}): ${nome} → +${ganho} ⚗ essência` }]);
    }
    bumpCont("desmontados"); checarConquistas();
  };

  const forjar = (slot, raridade) => {
    const custo = CUSTO_FORJA[raridade];
    if (!custo) return;
    if ((personagem.essencia || 0) < custo.essencia) { pushMsgs([{ autor: "sistema", texto: `⚒ Essência insuficiente: forjar ${RARIDADE_ROTULO[raridade]} pede ⚗ ${custo.essencia} (você tem ${personagem.essencia || 0}). Desmonte equipamentos.` }]); return; }
    if ((personagem.moedas || 0) < custo.moedas) { pushMsgs([{ autor: "sistema", texto: `⚒ Moedas insuficientes: forjar ${RARIDADE_ROTULO[raridade]} pede ◉ ${custo.moedas}.` }]); return; }
    const item = gerarLoot(raridade, { tipo: slot, nivel: personagem.nivel || 1 });
    setPersonagem((p) => ({ ...p, essencia: (p.essencia || 0) - custo.essencia, moedas: (p.moedas || 0) - custo.moedas, equipamento: [...(p.equipamento || []), item] }));
    pushMsgs([{ autor: "sistema", texto: `⚒ Forjado: ${item.nome} (${RARIDADE_ROTULO[item.raridade] || item.raridade}) — na mochila de equipamentos` }]);
    bumpCont("forjados"); checarConquistas();
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Forjei um item na forja: ${item.nome} (${item.raridade}${item.poder ? `, ${item.poder}` : ""}).`;
  };

  /* ---------------- MASMORRAS (v6.3 · tabela + código, a IA só narra) ----------------
     Entrar gera a masmorra; cada "avançar" rola a sala: combate (abre o painel
     pela instrução ao Mestre), armadilha/tesouro/santuário (resolvidos por
     código na hora), enigma (cena do Mestre) e o chefe no fundo. */
  const entrarMasmorra = (nomeSugerido = "") => {
    if (acampadoRef.current || masmorraRef.current) return;
    if (combateRef.current) { pushMsgs([{ autor: "sistema", texto: "⚔ Não dá para explorar uma masmorra no meio de um combate." }]); return; }
    const mmBase = gerarMasmorra((mundo && mundo.genero) || "Fantasia medieval", personagem.nivel || 1);
    const mm = nomeSugerido ? { ...mmBase, nome: nomeSugerido.slice(0, 50) } : mmBase;
    masmorraRef.current = mm; setMasmorra(mm);
    pushMsgs([{ autor: "jogador", texto: `🕳 Encontrei uma entrada: ${mm.nome}. Vou explorar.` }]);
    const extraTempo = avancarMinutos(MINUTOS_SALA_MASMORRA);
    enviar(`[MASMORRA — ENTRADA · ${mm.nome}] Descobri a entrada de "${mm.nome}". O SISTEMA gerou a planta: ${mm.salas.length} câmaras em ${Math.max(...mm.salas.map((x) => x.camada))} níveis de profundidade, com passagens que se ramificam, um portão lacrado no fundo e a chave escondida com um guardião. Levo ${mm.tochas} tochas — cada passagem consome uma. Descreva a fachada e a atmosfera do primeiro salão em 2-4 frases, costurando com a cena atual${cidadeAtualRef.current ? ` (perto de ${cidadeAtualRef.current})` : ""}. Mencione que há mais de um caminho adiante. NÃO invente o que há nas salas — o sistema revela cada uma quando eu escolher a passagem.${extraTempo}`, personagem);
  };

  const irParaSala = (id) => {
    const mm = masmorraRef.current;
    if (!mm || bloqueado || acampadoRef.current) return;
    if (combateRef.current) { pushMsgs([{ autor: "sistema", texto: "⚔ Termine o combate antes de seguir." }]); return; }
    const r = entrarNaSala(mm, id);
    if (r.bloqueado) { pushMsgs(r.msgs.map((t) => ({ autor: "sistema", texto: t }))); return; }
    const mm2 = r.mm, sala = r.sala;
    masmorraRef.current = mm2; setMasmorra(mm2);
    if (r.msgs.length) pushMsgs(r.msgs.map((t) => ({ autor: "sistema", texto: t })));
    /* PERCEPÇÃO PASSIVA (5e): o que estiver abaixo do seu limiar você nota
       sozinho, sem rolar. O apressado enxerga menos; o cauteloso, mais. */
    const modPerc = atributoEfetivo(personagem, "percepcao");
    const passiva = percepcaoPassiva(modPerc, mm2.ritmo);
    let avisoSegredo = "";
    const cp = checarPassiva(sala, passiva);
    if (cp.revelou) {
      const salas2 = mm2.salas.map((x) => x.id === id ? { ...x, segredo: cp.segredo } : x);
      masmorraRef.current = { ...mm2, salas: salas2 }; setMasmorra(masmorraRef.current);
      pushMsgs([{ autor: "sistema", texto: cp.texto }]);
      avisoSegredo = ` PERCEPÇÃO PASSIVA (${passiva}) revelou sem rolagem: ${cp.segredo.txt} (${cp.segredo.tipo.replace("_", " ")}). Narre a descoberta como mérito da atenção dele.`;
    } else if (armadilhaDispara(sala)) {
      avisoSegredo = ` ARMADILHA NÃO PERCEBIDA (passiva ${passiva} < ${sala.segredo.cd}): ${sala.segredo.txt} — dispara AGORA. Narre o susto; o sistema aplica o dano.`;
    } else if (cp.quaseTexto) {
      pushMsgs([{ autor: "sistema", texto: `👁 ${cp.quaseTexto}` }]);
      avisoSegredo = ` O herói sente que algo escapa (passiva ${passiva}, perto do limiar) — dê um sinal sutil, sem entregar o que é.`;
    }
    const prog = progressoMasmorra(mm2);
    const escuro = noEscuro(mm2) ? " NO ESCURO (a última tocha se apagou — descreva a cegueira e o perigo)." : "";
    const pos = `${mm.nome} · camada ${sala.camada} · ${prog.visitadas}/${prog.total} salas${escuro}`;
    /* se a sala não abre combate, ela se resolve agora */
    if (sala.tipo !== "combate" && sala.tipo !== "chefe" && sala.tipo !== "chave" && sala.tipo !== "enigma") {
      masmorraRef.current = marcarResolvida(mm2, id); setMasmorra(masmorraRef.current);
    }
    const extraTempo = avancarMinutos(ritmoPorId(mm2.ritmo).minutos);
    if (sala.tipo === "combate" || sala.tipo === "chefe") {
      /* COMBATE ABERTO PELO SISTEMA (v7.0): o app monta os inimigos pelo
         bestiário e abre o HUD na hora — sem depender do Mestre lembrar. */
      const inimigos = (sala.inimigos || []).map((i) => {
        const comp = completarInimigo({ nome: i.nome, ameaca: i.ameaca }, personagem.nivel || 1);
        return { ...comp, derrotado: false, semente: `inimigo|${comp.nome}|${comp.ameaca || ""}` };
      });
      combateRef.current = { inimigos }; setCombate(combateRef.current); combateOciosoRef.current = 0;
      salaEmCursoRef.current = id;
      inimigos.forEach((comp) => {
        if (comp.nome && !descobRef.current.some((d) => d.toLowerCase() === comp.nome.toLowerCase())) {
          descobRef.current = [...descobRef.current, comp.nome];
        }
      });
      setDescobertas(descobRef.current);
      const lista = inimigos.map((i) => `${i.nome} (nv ${i.nivel || 1}, ${i.vida} PV)`).join(", ");
      pushMsgs([{ autor: "sistema", texto: `⚔ ${sala.tipo === "chefe" ? "A sala do chefe!" : "Emboscada na masmorra!"} ${inimigos.map((i) => i.nome).join(", ")} — o combate está aberto.` }]);
      enviar(`[MASMORRA — ${pos} · ${sala.tipo === "chefe" ? "CHEFE" : "COMBATE"} — COMBATE JÁ ABERTO PELO SISTEMA] Avanço para a próxima sala e os inimigos saltam das sombras: ${lista}. O HUD de combate JÁ ESTÁ ABERTO — NÃO envie "combate_iniciar". Descreva a sala e a investida inicial em 1-2 frases e me passe a vez (eu ajo pelos botões de combate).${sala.tipo === "chefe" ? " É o confronto final desta masmorra — narre à altura." : ""}${avisoSegredo}${extraTempo}`, personagem);
    } else if (sala.tipo === "armadilha") {
      /* dano por código: o herói (ou um companheiro, 30%) sofre a armadilha */
      const emComp = (personagem.grupo || []).length > 0 && Math.random() < 0.3;
      if (emComp) {
        const alvo = personagem.grupo[Math.floor(Math.random() * personagem.grupo.length)];
        setPersonagem((p) => ({ ...p, grupo: (p.grupo || []).map((g) => g.nome === alvo.nome ? { ...g, vida: Math.max(0, g.vida - sala.dano) } : g) }));
        pushMsgs([{ autor: "sistema", texto: `🪤 Armadilha: ${sala.nomeArmadilha} — ${alvo.nome} sofre ${sala.dano} de dano` }]);
        enviar(`[MASMORRA — ${pos} · ARMADILHA RESOLVIDA PELO SISTEMA] A sala tinha uma armadilha (${sala.nomeArmadilha}). ${alvo.nome} já sofreu ${sala.dano} de dano (aplicado pelo app — NÃO envie vida). Narre o susto e como o grupo reage.${avisoSegredo}${extraTempo}`, personagem);
      } else {
        const p2 = { ...personagem, vida: Math.max(0, personagem.vida - sala.dano) };
        setPersonagem(p2);
        pushMsgs([{ autor: "sistema", texto: `🪤 Armadilha: ${sala.nomeArmadilha} — você sofre ${sala.dano} de dano` }]);
        enviar(`[MASMORRA — ${pos} · ARMADILHA RESOLVIDA PELO SISTEMA] A sala tinha uma armadilha (${sala.nomeArmadilha}). Eu já sofri ${sala.dano} de dano (aplicado pelo app — NÃO envie vida). Narre o susto e o estado em que fico.${avisoSegredo}${extraTempo}`, p2);
      }
    } else if (sala.tipo === "tesouro") {
      let item = null;
      let p2 = { ...personagem, moedas: (personagem.moedas || 0) + sala.moedas };
      if (sala.caiItem) {
        const rar = Math.random() < 0.5 ? "incomum" : Math.random() < 0.85 ? "raro" : "epico";
        item = gerarLoot(rar, { nivel: personagem.nivel || 1 });
        p2 = { ...p2, equipamento: [...(p2.equipamento || []), item] };
      }
      setPersonagem(p2);
      pushMsgs([{ autor: "sistema", texto: `💰 Sala do tesouro: +${sala.moedas} moedas${item ? ` · ✦ ${item.nome} (${RARIDADE_ROTULO[item.raridade]})` : ""}` }]);
      checarConquistas(p2);
      enviar(`[MASMORRA — ${pos} · TESOURO RESOLVIDO PELO SISTEMA] A sala guardava um tesouro: ◉ ${sala.moedas}${item ? ` e o item "${item.nome}" (${item.raridade}${item.poder ? `, ${item.poder}` : ""})` : ""} — JÁ na minha posse (NÃO envie moedas nem "adicionar_equipamento"). Descreva o achado com emoção.${avisoSegredo}${extraTempo}`, p2);
    } else if (sala.tipo === "santuario") {
      const cura = (mx, v) => Math.min(mx, v + Math.max(1, Math.round(mx * (sala.curaPct || 0.25))));
      const p2 = { ...personagem, vida: cura(personagem.vidaMax, personagem.vida), mana: cura(personagem.manaMax, personagem.mana), grupo: (personagem.grupo || []).map((g) => ({ ...g, vida: cura(g.vidaMax || g.vida, g.vida) })) };
      setPersonagem(p2);
      pushMsgs([{ autor: "sistema", texto: `⛲ Santuário: ${sala.cena} — todos recuperam ~25% de PV e PM` }]);
      enviar(`[MASMORRA — ${pos} · SANTUÁRIO RESOLVIDO PELO SISTEMA] A sala é um refúgio: ${sala.cena}. O grupo inteiro já recuperou parte de PV e PM (aplicado pelo app — NÃO envie cura). Narre o respiro — é um bom momento para uma conversa curta do grupo.${avisoSegredo}${extraTempo}`, p2);
    } else if (sala.tipo === "enigma") {
      enviar(`[MASMORRA — ${pos} · ENIGMA] A sala trava o caminho com: ${sala.cena}. Apresente a cena e o desafio NA FICÇÃO — me deixe tentar resolver com palavras ou ações. Se eu travar, dê pistas; se eu resolver (ou der uma solução esperta), o caminho abre.${avisoSegredo}${extraTempo}`, personagem);
    }
  };

  /* FORRAGEAR (5e): caçar e colher pela trilha. Gasta tempo, mas repõe. */
  const forragearAqui = () => {
    if (bloqueado || combateRef.current) return;
    const bioma = (cidadeAtualRef.current && (mapaRef.current.cidades || []).find((c) => c.nome === cidadeAtualRef.current)?.bioma) || "planicie";
    const r = forragear(bioma, atributoEfetivo(personagem, "percepcao"));
    const extra = avancarMinutos(240);
    if (r.achou) setPersonagem((pp) => ({ ...pp, suprimentos: { ...garantirSuprimentos(pp.suprimentos), racoes: garantirSuprimentos(pp.suprimentos).racoes + r.racoes, agua: garantirSuprimentos(pp.suprimentos).agua + r.agua } }));
    pushMsgs([{ autor: "sistema", texto: `🌿 ${r.texto}` }]);
    enviar(`[ERMOS — FORRAGEAMENTO] Passo metade do dia caçando e colhendo. ${r.achou ? `Consegui ${r.racoes} rações e ${r.agua} de água (o sistema já somou).` : "Não encontrei nada aproveitável."} Narre a busca em 2-3 frases, com o cheiro e o cansaço do trabalho.${extra}${SO_ISSO}`, personagem);
  };

  const mudarRitmo = (id) => {
    const mm = masmorraRef.current;
    if (!mm) return;
    masmorraRef.current = { ...mm, ritmo: id }; setMasmorra(masmorraRef.current);
    const r = ritmoPorId(id);
    pushMsgs([{ autor: "sistema", texto: `${r.icone} Marcha ${r.nome.toLowerCase()} — percepção passiva ${percepcaoPassiva(atributoEfetivo(personagem, "percepcao"), id)}, ${r.minutos} min por sala.` }]);
  };

  /* BUSCA ATIVA (5e): gasta 10 minutos de exploração e permite rolagem de
     Percepção. É a ação que acha o que a passiva não pegou. */
  const buscarNaSala = () => {
    const mm = masmorraRef.current;
    if (!mm || bloqueado || combateRef.current) return;
    const sala = mm.salas.find((x) => x.id === mm.atual);
    if (!sala) return;
    const mod = atributoEfetivo(personagem, "percepcao");
    const rolo = d(20);
    const total = rolo + mod;
    const r = resultadoBusca(sala, total);
    avancarMinutos(custoBusca());
    if (mostrarRolagensRef.current) pushMsgs([{ autor: "sistema", texto: `🎲 Busca: d20=${rolo}+${mod}=${total}` }]);
    pushMsgs([{ autor: "sistema", texto: `🔎 ${r.texto}` }]);
    if (r.achou) {
      const salas2 = mm.salas.map((x) => x.id === sala.id ? { ...x, segredo: r.segredo } : x);
      masmorraRef.current = { ...mm, salas: salas2 }; setMasmorra(masmorraRef.current);
    }
    enviar(`[MASMORRA — BUSCA ATIVA · ${mm.nome}] Vasculho a sala por dez minutos (Percepção ${total}${sala.segredo ? ` vs ${sala.segredo.cd}` : ""}). ${r.achou ? `ENCONTREI: ${r.segredo.txt} (${r.segredo.tipo.replace("_", " ")}). Narre a descoberta e o que ela abre.` : "Nada encontrado — narre a busca frustrada em 1-2 frases, sem inventar achados."} NÃO revele o que não foi achado.${SO_ISSO}`, personagem);
  };

  /* Ao vencer o combate de uma sala, ela se resolve — e se guardava a chave,
     o portão do chefe abre. */
  const resolverSalaAposCombate = () => {
    const mm = masmorraRef.current, id = salaEmCursoRef.current;
    if (!mm || id === null) return;
    const sala = mm.salas.find((x) => x.id === id);
    salaEmCursoRef.current = null;
    if (!sala) return;
    const antes = mm.chave;
    masmorraRef.current = marcarResolvida(mm, id); setMasmorra(masmorraRef.current);
    if (!antes && masmorraRef.current.chave) {
      pushMsgs([{ autor: "sistema", texto: "🗝 Entre os despojos: a CHAVE do portão lacrado. O caminho para o chefe se abre." }]);
      notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[MASMORRA] Achei a chave do portão do chefe entre os restos do guardião. Mencione isso na narração.`;
    }
  };

  const sairDaMasmorra = () => {
    const mm = masmorraRef.current;
    if (!mm) return;
    if (combateRef.current) { pushMsgs([{ autor: "sistema", texto: "⚔ Não dá para fugir da masmorra no meio de um combate." }]); return; }
    masmorraRef.current = null; setMasmorra(null);
    pushMsgs([{ autor: "jogador", texto: `🏃 Fugo de ${mm.nome}, deixando o resto para trás.` }]);
    enviar(`[MASMORRA — FUGA] Eu ESCOLHI fugir de ${mm.nome} antes do fim — abandono conscientemente as salas e tesouros que ainda restavam (o que já conquistei, carrego comigo). Narre a retirada apressada em 2-3 frases e retome a cena do mundo lá fora.`, personagem);
  };

  /* ---------------- MURAL DE CONTRATOS (v6.3 · recompensa paga por código) ---------------- */
  const garantirMural = (forcar = false) => {
    if (!forcar && (muralRef.current || []).length > 0) return;
    muralRef.current = gerarMural((mundo && mundo.genero) || "Fantasia medieval", personagem ? personagem.nivel || 1 : 1, mapaRef.current, 3);
    setMural(muralRef.current);
  };

  const aceitarContrato = (c) => {
    if (!c) return;
    /* sai do mural e entra outro no lugar — o mural nunca fica vazio */
    muralRef.current = (muralRef.current || []).filter((x) => x.id !== c.id);
    muralRef.current = [...muralRef.current, gerarContrato((mundo && mundo.genero) || "Fantasia medieval", personagem.nivel || 1, mapaRef.current)];
    setMural(muralRef.current);
    if (!questsRef.current.some((q) => q.titulo.toLowerCase() === c.titulo.toLowerCase())) {
      questsRef.current = [...questsRef.current, { titulo: c.titulo, descricao: c.descricao, tipo: "secundaria", status: "ativa", nota: "", contrato: c.recompensa }];
      setQuests([...questsRef.current]);
    }
    setAba(null);
    pushMsgs([{ autor: "jogador", texto: `📋 Aceito o contrato: ${c.titulo} (◉ ${c.recompensa.moedas} + ${c.recompensa.xp} XP)` }]);
    enviar(`[CONTRATO ACEITO — ${c.titulo}] Peguei no mural: "${c.descricao}" A recompensa (◉ ${c.recompensa.moedas} e ${c.recompensa.xp} XP) será paga PELO SISTEMA ao concluir — NÃO envie moedas/xp. Costure o serviço na ficção (o objetivo está alcançável a partir da situação atual) e, quando eu CUMPRIR de verdade, marque com "quest_atualizar" {"titulo":"${c.titulo}","status":"concluida"}.${SO_ISSO}`, personagem);
  };

  const abandonarContrato = (titulo) => {
    questsRef.current = questsRef.current.filter((q) => q.titulo !== titulo);
    setQuests([...questsRef.current]);
    pushMsgs([{ autor: "sistema", texto: `📋 Contrato abandonado: ${titulo}` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Abandonei o contrato "${titulo}" — ele não existe mais para mim.`;
  };

  /* DECRETOS E RECOMPENSAS (v6.4): o reverso do mural — VOCÊ prega cartazes
     oferecendo ouro e o mundo responde. O código retém a recompensa, decide
     quem aceita (generosidade × fama), gera o bando de aventureiros e rola o
     desfecho após alguns dias. Sucesso: o ouro retido é pago. Fracasso: volta tudo. */
  const famaJogador = () => Math.min(0.25, ((personagem && personagem.nivel) || 1) * 0.02 + ((guildaRef.current && guildaRef.current.nivel) || 1) * 0.02);

  const pregarDecreto = ({ tipo, alvo, recompensa }) => {
    const d = criarDecreto({ tipo, alvo, recompensa, nivel: personagem.nivel || 1 });
    const total = (personagem.moedas || 0) + ((guildaRef.current && guildaRef.current.cofre) || 0);
    if (total < d.recompensa) { pushMsgs([{ autor: "sistema", texto: `⚠️ Ouro insuficiente: o decreto custa ◉ ${d.recompensa} retidas na hora (bolso + cofre somados: ◉ ${total}).` }]); return; }
    /* retém: tira do bolso primeiro, o resto do cofre da guilda */
    let falta = d.recompensa;
    const doBolso = Math.min(personagem.moedas || 0, falta); falta -= doBolso;
    setPersonagem((p) => ({ ...p, moedas: (p.moedas || 0) - doBolso }));
    if (falta > 0) {
      guildaRef.current = { ...guildaRef.current, cofre: Math.max(0, (guildaRef.current.cofre || 0) - falta) };
      setGuilda(guildaRef.current);
    }
    decretosRef.current = [...decretosRef.current, d];
    setDecretos(decretosRef.current);
    bumpCont("decretosPregados"); checarConquistas();
    pushMsgs([{ autor: "jogador", texto: `📣 Preguei um decreto: ${d.descricao} — Recompensa: ◉ ${d.recompensa}` }]);
    enviar(`[DECRETO PREGADO — ${tipoDecreto(d.tipo).rotulo.toUpperCase()}] Pus cartazes pela região: "${d.descricao}" Recompensa de ◉ ${d.recompensa} JÁ RETIDA pelo sistema (não envie moedas). Reaja na ficção: tavernas comentando, interessados medindo o cartaz, o alvo talvez ficando sabendo… QUEM aceita e o RESULTADO quem decide é o sistema — NÃO invente aventureiros cumprindo isso por conta própria; narre apenas a repercussão.${SO_ISSO}`, personagem);
  };

  const cancelarDecreto = (id) => {
    const d = decretosRef.current.find((x) => x.id === id);
    if (!d || d.status !== "pregado") return;
    decretosRef.current = decretosRef.current.filter((x) => x.id !== id);
    setDecretos(decretosRef.current);
    setPersonagem((p) => ({ ...p, moedas: (p.moedas || 0) + d.recompensa }));
    pushMsgs([{ autor: "sistema", texto: `📣 Decreto retirado: "${d.alvo}" — ◉ ${d.recompensa} devolvidas ao seu bolso.` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Retirei o decreto sobre "${d.alvo}" (ninguém havia aceitado). A recompensa foi devolvida.`;
  };

  /* O mundo responde aos decretos a cada dia passado (descanso longo):
     pregados tentam achar quem aceite; aceitos avançam até o desfecho. */
  const processarDecretos = (pers, msgs) => {
    if (!decretosRef.current.length) return pers;
    let p = pers;
    const atualizados = [];
    for (const d of decretosRef.current) {
      if (d.status === "pregado") {
        const grupo = tentarAceite(d, { genero: (mundo && mundo.genero) || "Fantasia medieval", nivel: p.nivel || 1, fama: famaJogador() });
        if (grupo) {
          const nd = { ...d, status: "aceito", grupo, dias: 0 };
          atualizados.push(nd);
          msgs.push(`📣 Seu decreto sobre "${d.alvo}" foi aceito: a ${grupo.bando} (liderada por ${grupo.lider}, força ${grupo.forca}) partiu para o serviço.`);
          notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[DECRETO ACEITO — ${d.alvo}] A ${grupo.bando} (${grupo.membros.map((m) => m.nome).join(", ")}, força ${grupo.forca}) aceitou meu decreto: "${d.descricao}" Recompensa de ◉ ${d.recompensa} já está retida pelo sistema. Eles partiram; o resultado chegará pelo sistema em alguns dias — até lá, eles estão FORA DE CENA, em missão.`;
          /* o líder vira uma pessoa conhecida */
          if (!npcsRef.current[grupo.lider]) {
            npcsRef.current = { ...npcsRef.current, [grupo.lider]: { nome: grupo.lider, relacao: "aliado", papel: `líder da ${grupo.bando}`, genero: mundo && mundo.genero, notas: `Aceitou seu decreto sobre "${d.alvo}".`, ultimaVez: Date.now(), conhecidoEm: diaRef.current } };
            setNpcs(npcsRef.current);
          }
        } else {
          atualizados.push(d);
        }
      } else if (d.status === "aceito") {
        const dias = (d.dias || 0) + 1;
        if (dias < 2) { atualizados.push({ ...d, dias }); continue; }
        const r = resolverDecreto(d);
        const t = tipoDecreto(d.tipo);
        const grupo = d.grupo;
        if (r.desfecho === "dizimado") {
          p = { ...p, moedas: (p.moedas || 0) + d.recompensa };
          msgs.push(`☠ A ${grupo.bando} não voltou de "${d.alvo}". ◉ ${d.recompensa} devolvidas — ninguém sobrou para cobrá-las.`);
          notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[DECRETO — DESFECHO: DIZIMADO] A ${grupo.bando} inteira morreu tentando cumprir meu decreto sobre "${d.alvo}" (o alvo continua como estava — isso é CANON). A recompensa voltou ao meu bolso. Narre a notícia chegando e o peso disso; o alvo pode ter ficado MAIS forte ou alerta.`;
        } else if (r.desfecho === "fracasso") {
          p = { ...p, moedas: (p.moedas || 0) + d.recompensa };
          msgs.push(`✖ A ${grupo.bando} fracassou em "${d.alvo}" e voltou de rabo entre as pernas. ◉ ${d.recompensa} devolvidas.`);
          notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[DECRETO — DESFECHO: FRACASSO] A ${grupo.bando} não conseguiu cumprir meu decreto sobre "${d.alvo}" e voltou viva, envergonhada (o alvo continua como estava — isso é CANON). A recompensa voltou ao meu bolso. Narre o retorno deles; o alvo provavelmente sabe que foi visado.`;
        } else {
          const baixas = r.desfecho === "sucesso_baixas";
          const mortos = baixas ? grupo.membros.filter(() => Math.random() < 0.4).map((m) => m.nome) : [];
          msgs.push(`${baixas ? "⚑" : "✅"} A ${grupo.bando} cumpriu seu decreto sobre "${d.alvo}"${mortos.length ? ` — mas ${mortos.join(", ")} não voltaram` : ""}! ◉ ${d.recompensa} pagas.`);
          bumpCont("decretosCumpridos");
          /* v9.0: "cumprido" tem consequência no mundo. Um decreto pela CABEÇA
             de alguém que o sistema conhece mata essa pessoa de verdade — no
             registro e, se for a nêmesis, na perseguição inteira. Antes o
             serviço era pago e o alvo continuava vivo caçando o herói. */
          if (d.tipo === "cabeca") registrarMorteDeAlvo(d.alvo, `abatido(a) pela ${grupo.bando}, a mando do seu decreto`, { aproximado: true });
          notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[DECRETO — DESFECHO: CUMPRIDO${baixas ? " COM BAIXAS" : ""}] É CANON: meu decreto sobre "${d.alvo}" foi CUMPRIDO pela ${grupo.bando}${mortos.length ? ` (${mortos.join(", ")} morreram no serviço)` : ""}. "${d.descricao}" — feito. O sistema JÁ PAGOU ◉ ${d.recompensa} a eles (não envie moedas). Narre o retorno${mortos.length ? " ensanguentado" : " triunfal"} deles e as consequências reais do feito no mundo${d.tipo === "cabeca" ? " — mandei matar alguém: se o alvo era ligado a alguma facção, a relação despenca e pode haver represálias" : ""}.`;
        }
        atualizados.push({ ...d, status: "resolvido", desfecho: r.desfecho });
      } else {
        atualizados.push(d);
      }
    }
    /* resolvidos ficam no histórico visual por um tempo, mas saem da lista ativa após o próximo ciclo */
    decretosRef.current = atualizados.filter((d) => !(d.status === "resolvido" && (d.dias || 0) >= 2)).map((d) => d.status === "resolvido" ? { ...d, dias: (d.dias || 0) + 1 } : d);
    setDecretos(decretosRef.current);
    return p;
  };

  /* FAMA (v6.8): derivada das façanhas reais — a IA não infla nem esquece.
     Quando o patamar sobe, o mundo muda o tratamento (envelope no próximo envio). */
  const checarFama = () => {
    const f = famaAtual();
    const antes = patamarFama(famaPatamarRef.current), agora = patamarFama(f);
    if (agora.min > antes.min) {
      pushMsgs([{ autor: "sistema", texto: `📣 Sua fama cresce: agora você é ${agora.rotulo} — ${agora.nota}.` }]);
      notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[FAMA — NOVO PATAMAR, CANON] Minha fama subiu para ${Math.round(f)}: agora sou ${agora.rotulo.toUpperCase()} (${agora.nota}). O mundo passa a me tratar assim — reconhecimento em cidades, olhares, respeito ou medo. NPCs relevantes podem já ter ouvido meu nome.`;
    }
    famaPatamarRef.current = f;
    return f;
  };

  /* NÊMESIS (v6.8): quando o nome cresce demais, alguém jura seu fim. */
  const tentarSurgirNemesis = () => {
    if (nemesisRef.current && nemesisRef.current.status !== "derrotada") return;
    if (famaAtual() < 20) return;
    if (Math.random() > 0.35) return;
    const n = gerarNemesis(() => nomePessoa((mundo && mundo.genero) || "Fantasia medieval"), contRef.current, { dominios: dominiosDe(mapaRef.current).length }, diaRef.current);
    nemesisRef.current = n; setNemesis(n);
    npcsRef.current = { ...npcsRef.current, [n.nome]: criarNPC(n.nome, { papel: n.titulo, relacao: "inimigo", notas: `NÊMESIS do herói: ${n.motivo}. Ódio cresce a cada dia.`, conhecidoEm: diaRef.current, ultimaVez: Date.now() }) };
    setNpcs(npcsRef.current);
    pushMsgs([{ autor: "sistema", texto: `🎭 Alguém jurou seu fim: ${n.nome}, ${n.titulo} — ${n.motivo}.` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[NÊMESIS — SURGIMENTO, CANON] Minha fama atraiu uma inimiga jurada: ${n.nome}, "${n.titulo}" — ${n.motivo}. Ela existe no mundo AGORA (ficha registrada), age nas sombras e o ódio dela cresce a cada dia (o sistema cuida dos números e dos ataques). Semeie a presença dela aos poucos: sinais, olhares, histórias — NÃO a confronte ainda.`;
    checarConquistas();
  };

  /* Alguém morreu por decisão do sistema (decreto cumprido, milagre, ficção
     confirmada): registra no elenco e propaga para quem depende disso. */
  const registrarMorteDeAlvo = (nome, causa, { aproximado = false } = {}) => {
    const alvo = String(nome || "").trim();
    if (!alvo) return false;
    /* Nome exato sempre; parecido SÓ quando o texto veio do jogador (o alvo de
       um decreto é digitado à mão: "a cabeça de Sarna, a Víbora"). Em combate
       exigimos exato — senão "Bandido do Corvo" mataria a NPC "Corvo". */
    const chave = Object.keys(npcsRef.current || {}).find((k) => k.toLowerCase() === alvo.toLowerCase())
      || (aproximado ? Object.keys(npcsRef.current || {}).find((k) => k.length >= 5 && new RegExp(`(^|\\W)${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\W|$)`, "i").test(alvo)) : null);
    if (chave) {
      npcsRef.current = { ...npcsRef.current, [chave]: { ...npcsRef.current[chave], status: "morto", notas: `${npcsRef.current[chave].notas || ""} Morreu no dia ${diaRef.current}${causa ? ` — ${causa}` : ""}.`.trim() } };
      setNpcs(npcsRef.current);
    }
    const n = nemesisRef.current;
    const nomeNem = (n && n.nome ? n.nome : "").toLowerCase();
    const ehNemesis = !!nomeNem && n.status !== "derrotada" && (
      nomeNem === alvo.toLowerCase() ||
      (chave && nomeNem === chave.toLowerCase()) ||
      new RegExp(`(^|\\W)${nomeNem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\W|$)`, "i").test(alvo)
    );
    if (ehNemesis) encerrarNemesis(causa);
    return !!chave || ehNemesis;
  };

  /* ---------------- A MORTE DA NÊMESIS TEM UMA PORTA SÓ (v9.0) ----------------
     Antes, ela só "morria" se o registro de pessoas dissesse morto num dia
     que passasse. Um decreto cumprido pela cabeça dela, ou o próprio Mestre
     narrando a morte, não desligavam nada — e ela continuava caçando um herói
     que já a tinha enterrado. Agora tudo passa por aqui. */
  const encerrarNemesis = (causa) => {
    const n = nemesisRef.current;
    if (!n || n.status === "derrotada") return false;
    nemesisRef.current = { ...n, status: "derrotada", odio: 0, mortaEm: diaRef.current, comoMorreu: causa || "" };
    setNemesis(nemesisRef.current);
    /* o registro de pessoas é a memória do Mestre: ela precisa constar morta lá */
    const chave = Object.keys(npcsRef.current || {}).find((k) => k.toLowerCase() === (n.nome || "").toLowerCase());
    if (chave && String(npcsRef.current[chave].status || "").toLowerCase() !== "morto") {
      npcsRef.current = { ...npcsRef.current, [chave]: { ...npcsRef.current[chave], status: "morto", notas: `${npcsRef.current[chave].notas || ""} Morreu no dia ${diaRef.current}${causa ? ` — ${causa}` : ""}.`.trim() } };
      setNpcs(npcsRef.current);
    }
    bumpCont("nemesisVencidas"); checarConquistas();
    pushMsgs([{ autor: "sistema", texto: `🕊 A perseguição acabou: ${n.nome}, ${n.titulo}, está morta${causa ? ` — ${causa}` : ""}.` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[NÊMESIS — FIM, CANON E IRREVERSÍVEL] ${n.nome}, "${n.titulo}", está MORTA${causa ? ` (${causa})` : ""}. A perseguição contra mim ACABOU: ela não aparece mais, não age, não manda agentes, não tem sucessor nem "plano póstumo" — e o registro de pessoas já a marca como morta. Narre a notícia chegando e o que esse fim significa para mim; daqui em diante ela só existe como memória ou legado.`;
    return true;
  };

  /* O registro de pessoas mudou (cronista, combate, ficção)? Se a ficha dela
     virou "morto", a perseguição termina na hora — não no próximo amanhecer. */
  const sincronizarNemesis = () => {
    const n = nemesisRef.current;
    if (!n || n.status === "derrotada") return;
    const ficha = Object.values(npcsRef.current || {}).find((x) => (x.nome || "").toLowerCase() === (n.nome || "").toLowerCase());
    if (ficha && /(morto|morta|falecid|abatid|执行)/.test(String(ficha.status || "").toLowerCase())) {
      encerrarNemesis("confirmado no registro de pessoas");
    }
  };

  /* Cão de guarda da nêmesis na narração: ela morreu na cena sem ninguém
     registrar? O sistema encerra. Ela apareceu depois de morta? O sistema
     corrige o Mestre — como já faz com mortes de inimigos em combate. */
  const conferirNemesisNaNarrativa = (narrativa) => {
    const n = nemesisRef.current;
    if (!n || !n.nome) return;
    const txt = String(narrativa || "");
    if (!txt) return;
    const semAc = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const t = semAc(txt), alvo = semAc(n.nome);
    if (!t.includes(alvo)) return;
    if (n.status === "derrotada") {
      notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[CORREÇÃO DE COESÃO — NÊMESIS MORTA] Você citou ${n.nome} na cena, mas o SISTEMA a registra MORTA desde o dia ${n.mortaEm || "?"}${n.comoMorreu ? ` (${n.comoMorreu})` : ""}. Ela não pode aparecer, agir, ameaçar nem enviar ninguém. Se a menção era memória, legado ou herança do que ela deixou, tudo bem — deixe isso explícito. Se você a colocou em cena, RETOME: ela não está lá.`;
      return;
    }
    /* morte narrada sem registro: a frase precisa citá-la e matá-la */
    const frases = txt.split(/(?<=[.!?;])\s+|\n+/);
    const morte = /(morre|morreu|morta|morto|cai sem vida|tomba sem vida|expira|último suspiro|ultimo suspiro|degola|decapit|sem vida|corpo (dela|dele) )/i;
    const negado = /\b(não|nao|quase|fingiu|parece|como se)\b/i;
    for (const f of frases) {
      if (!semAc(f).includes(alvo)) continue;
      if (negado.test(f)) continue;
      if (morte.test(f)) { encerrarNemesis("morta na cena narrada pelo Mestre"); return; }
    }
  };

  /* O que o Mestre lê sobre ela em TODO turno — viva ou morta. */
  const infoNemesis = () => {
    const n = nemesisRef.current;
    if (!n || !n.nome) return "";
    if (n.status === "derrotada") {
      return `NÊMESIS ENCERRADA (fato do sistema): ${n.nome}, "${n.titulo}", está MORTA${n.comoMorreu ? ` — ${n.comoMorreu}` : ""}. Não a coloque em cena, não a faça agir nem enviar agentes, e não invente sucessores dela.`;
    }
    const fase = n.odio >= 100 ? "ela quer o confronto final, cara a cara"
      : n.odio >= 80 ? "assassinos pagos por ela estão a caminho"
      : n.odio >= 55 ? "ela sabota meus negócios pelas sombras"
      : n.odio >= 30 ? "ela já age contra mim, sem se mostrar"
      : "ela ainda observa de longe, sem se revelar";
    return `NÊMESIS ATIVA (fato do sistema — o ódio e as ações dela são calculados por código; não improvise ataques nem desfechos): ${n.nome}, "${n.titulo}" — ${n.motivo}. Ódio ${n.odio}/100: ${fase}. NÃO a mate, não a faça desistir e não a traga para um confronto frente a frente sem envelope do sistema. Se ela morrer numa cena, diga isso claramente na narrativa — o sistema encerra a perseguição sozinho.`;
  };

  const processarNemesisDiaria = () => {
    const n = nemesisRef.current;
    if (!n || n.status === "derrotada") return;
    /* a nêmesis morreu na ficção? o registro de pessoas é a fonte da verdade */
    sincronizarNemesis();
    if (nemesisRef.current.status === "derrotada") return;
    const odio = Math.min(100, (n.odio || 0) + 2 + Math.floor(Math.random() * 4));
    let atual = { ...n, odio, status: odio >= 30 ? "ativa" : n.status };
    for (const lim of LIMIARES_NEMESIS) {
      if (odio >= lim && (n.ultimoLimiar || 0) < lim) {
        atual = { ...atual, ultimoLimiar: lim };
        const acao = ACOES_NEMESIS[lim];
        pushMsgs([{ autor: "sistema", texto: `🎭 ${acao.rotulo}: ${acao.txt(atual)}` }]);
        if (acao.tipo === "sabotagem") {
          const perda = Math.round((guildaRef.current.cofre || 0) * 0.1);
          if (perda > 0) {
            guildaRef.current = { ...guildaRef.current, cofre: guildaRef.current.cofre - perda }; setGuilda(guildaRef.current);
            pushMsgs([{ autor: "sistema", texto: `🔥 A sabotagem custou ◉ ${perda} do cofre.` }]);
          }
        }
        const instr = { difamacao: "Espalhe na ficção os efeitos dessa difamação: um olhar torto, um comerciante que hesita, um boato cruel sobre mim circulando.", sabotagem: "Narre as consequências da sabotagem chegando aos meus ouvidos (o prejuízo já foi aplicado pelo sistema).", assassinos: "Prepare o ataque: em breve (nesta sessão ou na próxima cena de estrada), assassinos a serviço dela me emboscam — quando acontecer, abra o combate com 'combate_iniciar' (assassinos de ameaça compatível com meu nível).", confronto: "É o confronto final: ela virá pessoalmente, com um desafio aberto ou uma armadilha mortal. Construa o encontro como clímax e, quando eu vencer (se vencer), registre-a como morta no registro de pessoas." }[acao.tipo];
        notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[NÊMESIS — ${acao.rotulo.toUpperCase()}] ${acao.txt(atual)} ${instr}`;
      }
    }
    nemesisRef.current = atual; setNemesis(atual);
  };

  /* AVANÇO DE DIAS (v6.5): cada dia passado move o calendário e rola a vida
     dos seus domínios (população, felicidade, eventos por tabela). Retorna os
     eventos para o chamador virar envelope pro Mestre narrar. */
  const correioMsgsDiaRef = useRef([]); // envelopes do correio do(s) dia(s) processado(s)
  const avancarDiasReino = (n) => {
    const eventos = [];
    let cofreDeltaTotal = 0;
    let r = reinoRef.current;
    for (let i = 0; i < n; i++) {
      diaRef.current += 1;
      /* TEMPLOS (v8.9): onde há para onde rezar, o povo aguenta mais —
         o equilíbrio da felicidade daquele domínio sobe com o templo. */
      const { reino: nr, evento } = processarDiaReino(r, mapaRef.current, alvosFelicidade(mapaRef.current, devocaoRef.current));
      r = nr;
      if (evento) {
        eventos.push(evento);
        cofreDeltaTotal += evento.cofreDelta || 0;
        bumpCont("eventosReino");
      }
      /* CORREIO (v7.0): respostas chegam, petições surgem/expiram — por dia. */
      const faccNomes = ((mapaRef.current && mapaRef.current.faccoes) || [])
        .filter((f) => f && f.nome && !f.doJogador && f.relacao !== "jogador")
        .map((f) => f.nome);
      const pc = processarDiaCorreio(correioRef.current, {
        dia: diaRef.current,
        fama: famaAtual(),
        ehLider: cidadesDominadas(mapaRef.current).length > 0 || !!(mapaRef.current.faccoes || []).some((f) => f.doJogador),
        faccoes: faccNomes,
      });
      correioRef.current = pc.correio; setCorreio(pc.correio);
      aplicarEfeitosCorreio(pc.efeitos);
      pc.msgs.forEach((m) => {
        pushMsgs([{ autor: "sistema", texto: `✉️ ${m.replace(/^\[CORREIO — [^\]]+\]\s*/, "")}` }]);
        correioMsgsDiaRef.current.push(m);
      });
    }
    /* O DIA DA FÉ (v8.9): a devoção agora vive NO MAPA — templos pregam,
       a presença do herói converte, a fé viaja pelas estradas e míngua onde
       não há nada disso. Os fiéis do painel são a soma de tudo isso; o PF
       vem das preces (proporcional aos fiéis) mais o que os templos rendem.
       A IA não concede PF nem fiéis: ela só gasta em milagres. */
    {
      const dv = divindadeRef.current;
      if (dv && dv.despertar) {
        const fieisAntes = fieisTotais(mapaRef.current, devocaoRef.current);
        let dev = devocaoRef.current;
        let pfTemplos = 0;
        const marcos = [];
        for (let i = 0; i < n; i++) {
          const passo = processarDiaFe({ mapa: mapaRef.current, devocao: dev, divindade: dv, dia: diaRef.current, cidadeAtual: cidadeAtualRef.current });
          dev = passo.devocao; pfTemplos += passo.pf; marcos.push(...passo.marcos);
        }
        devocaoRef.current = dev; setDevocao(dev);
        const fieisDepois = fieisTotais(mapaRef.current, dev);
        const teto = pfMaximo({ ...dv, fieis: fieisDepois });
        const ganho = pfPorDia({ ...dv, fieis: fieisDepois }) * n + pfTemplos;
        const novo = { ...dv, fieis: fieisDepois, pf: Math.min(teto, (dv.pf || 0) + ganho) };
        divindadeRef.current = novo; setDivindade(novo);
        if (novo.pf > (dv.pf || 0)) pushMsgs([{ autor: "sistema", texto: `✨ As preces rendem ${novo.pf - (dv.pf || 0)} PF${pfTemplos ? ` (${pfTemplos} vindos dos templos)` : ""} (${novo.pf}/${teto}).` }]);
        if (fieisDepois < fieisAntes) pushMsgs([{ autor: "sistema", texto: `🕯 A fé míngua onde não há templo nem sinal seu: ${fieisAntes - fieisDepois} deixam de rezar.` }]);
        /* marcos de fé viram notícia para o jogador E envelope para o Mestre */
        marcos.slice(0, 3).forEach((m) => {
          pushMsgs([{ autor: "sistema", texto: m.texto }]);
          notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[FÉ NA GEOGRAFIA — REGISTRO DO SISTEMA] ${m.cidade} passou de "${m.de.rotulo}" para "${m.para.rotulo}" (${m.fe}% de devoção ao herói). Isso é fato: ${m.subiu ? `daqui em diante o povo de ${m.cidade} ${m.para.recepcao} — mostre isso na primeira cena que se passar lá` : `a devoção recuou em ${m.cidade} — sacerdotes rivais ganharam espaço e o povo esfriou`}.`;
        });
      }
    }
    reinoRef.current = r; setReino(r); setDia(diaRef.current);
    if (cofreDeltaTotal !== 0) {
      guildaRef.current = { ...guildaRef.current, cofre: Math.max(0, (guildaRef.current.cofre || 0) + cofreDeltaTotal) };
      setGuilda(guildaRef.current);
    }
    if (eventos.length) checarConquistas();
    /* por dia passado: fama recalculada, nêmesis cresce, rumores viajam */
    for (let i = 0; i < n; i++) {
      checarFama();
      tentarSurgirNemesis();
      processarNemesisDiaria();
      if (Math.random() < 0.25) {
        const boato = rumorDoDia({ ...contRef.current, cicatrizes: (personagem.cicatrizes || []).length, quaseMorte: contRef.current.quaseMorte || 0 }, personagem.nome, patamarFama(famaAtual()), !!(nemesisRef.current && nemesisRef.current.status !== "derrotada"));
        pushMsgs([{ autor: "sistema", texto: `🗞 Corre a boca miúda: ${boato}…` }]);
        notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[RUMOR] Um boato chegou aos meus ouvidos: "${boato}". Se couber, deixe-o circular na ficção (taverna, estrada, mercado) — e decida se ele é só fumaça ou o rastro de algo real.`;
      }
    }
    return eventos;
  };
  const envelopeEventosReino = (evs) => {
    const correioEnv = correioMsgsDiaRef.current.length ? "\n" + correioMsgsDiaRef.current.join("\n") : "";
    correioMsgsDiaRef.current = [];
    const base = !evs.length ? "" : "\n" + evs.map((ev) => `[EVENTO DE REINO — ${ev.evento.titulo.toUpperCase()} em ${ev.cidade}] ${ev.evento.txt(ev.cidade)} Os efeitos JÁ foram aplicados pelo sistema (${[ev.felDelta ? `felicidade ${ev.felDelta > 0 ? "+" : ""}${ev.felDelta}` : "", ev.popDelta ? `população ${ev.popDelta > 0 ? "+" : ""}${ev.popDelta}` : "", ev.cofreDelta ? `cofre ${ev.cofreDelta > 0 ? "+" : ""}${ev.cofreDelta}` : ""].filter(Boolean).join(", ")}) — NÃO os repita como números na ficção; narre como vida do reino${ev.evento.soSeInfeliz ? ". ATENÇÃO: o povo está à beira da revolta — isso é um problema REAL que exige resposta minha ou consequências" : ""}.`).join("\n");
    return base + correioEnv;
  };

  /* CORREIO (v7.0): efeitos concretos aplicados pelo app — felicidade nos
     domínios, moedas no cofre/bolso, tratados gravados no mapa (ficção obedece). */
  const aplicarEfeitosCorreio = (ef) => {
    if (!ef) return;
    if (ef.felicidade) {
      const r = { ...reinoRef.current };
      Object.keys(r).forEach((k) => { r[k] = { ...r[k], felicidade: Math.max(0, Math.min(100, (r[k].felicidade || 55) + ef.felicidade)) }; });
      reinoRef.current = r; setReino(r);
    }
    if (ef.moedas) {
      if (ef.moedas > 0) {
        guildaRef.current = { ...guildaRef.current, cofre: (guildaRef.current.cofre || 0) + ef.moedas };
        setGuilda(guildaRef.current);
      } else {
        let falta = -ef.moedas;
        const doBolso = Math.min(personagem.moedas || 0, falta);
        if (doBolso) setPersonagem((p) => ({ ...p, moedas: p.moedas - doBolso }));
        falta -= doBolso;
        if (falta > 0) {
          guildaRef.current = { ...guildaRef.current, cofre: Math.max(0, (guildaRef.current.cofre || 0) - falta) };
          setGuilda(guildaRef.current);
        }
      }
    }
    const ROTULO_TRATADO = { alianca: "Aliança", guerra: "Guerra", comercio: "Acordo comercial", casamento: "União por casamento", apoio: "Apoio militar" };
    const MAPA_TRATADO = { alianca: "alianca", guerra: "guerra", comercio: "comercio", casamento: "alianca", apoio: "comercio" };
    (ef.tratadosAdd || []).forEach(({ faccao, tratado }) => {
      const rotulo = ROTULO_TRATADO[tratado] || tratado;
      const c = garantirCorreio(correioRef.current);
      if (!c.tratados.some((t) => t.faccao === faccao && t.tratado === tratado)) {
        c.tratados = [...c.tratados, { faccao, tratado, rotulo, dia: diaRef.current }];
        correioRef.current = c; setCorreio(c);
      }
      const m = mapaRef.current;
      if (m && Array.isArray(m.faccoes)) {
        m.faccoes = m.faccoes.map((f) => f.nome === faccao ? { ...f, tratado: MAPA_TRATADO[tratado] || f.tratado || "nenhum" } : f);
        setMapa({ ...m });
      }
    });
    (ef.tratadosRem || []).forEach(({ faccao, tratado }) => {
      const c = garantirCorreio(correioRef.current);
      c.tratados = c.tratados.filter((t) => !(t.faccao === faccao && t.tratado === tratado));
      correioRef.current = c; setCorreio(c);
      const m = mapaRef.current;
      if (m && Array.isArray(m.faccoes) && tratado === "guerra") {
        m.faccoes = m.faccoes.map((f) => f.nome === faccao && f.tratado === "guerra" ? { ...f, tratado: "nenhum" } : f);
        setMapa({ ...m });
      }
    });
  };

  /* Enviar carta: custa ◉ 10 do bolso; a resposta chega em 1–3 dias por tabela. */
  const enviarCarta = (para, tipo, oferta, mensagem) => {
    if (!para || !TIPOS_CARTA[tipo]) return;
    if ((personagem.moedas || 0) < CUSTO_CARTA) { pushMsgs([{ autor: "sistema", texto: `✉️ O mensageiro cobra ◉ ${CUSTO_CARTA} — você não tem no bolso.` }]); return; }
    setPersonagem((p) => ({ ...p, moedas: p.moedas - CUSTO_CARTA }));
    const c = garantirCorreio(correioRef.current);
    const carta = criarCarta({ para, tipo, oferta, mensagem, dia: diaRef.current });
    carta.id = `carta_${c.seq}`; c.seq += 1;
    c.enviadas = [carta, ...c.enviadas];
    correioRef.current = c; setCorreio(c);
    const t = TIPOS_CARTA[tipo];
    pushMsgs([{ autor: "sistema", texto: `✉️ ${t.icone} ${t.nome} enviada a ${para}${oferta ? ` (oferta de ◉ ${oferta})` : ""}. Resposta esperada até o dia ${carta.chegaEm}.` }]);
    enviar(`[CORREIO — CARTA ENVIADA] Enviei a ${para}: ${t.icone} ${t.nome}${oferta ? ` com oferta de ◉ ${oferta}` : ""}${mensagem ? `. Diz a carta: "${mensagem}"` : ""}. Narre a partida do mensageiro e a expectativa — a RESPOSTA virá pelo sistema em 1–3 dias; NÃO antecipe nem decida a reação de ${para} agora.${SO_ISSO}`);
  };

  /* Aceitar/recusar petição recebida — efeitos imediatos, IA só narra. */
  const responderPeticao = (id, aceite) => {
    const c = garantirCorreio(correioRef.current);
    const p = c.recebidas.find((x) => x.id === id && x.status === "pendente");
    if (!p) return;
    const ef = resolverPeticao(p, aceite);
    if (aceite && ef.moedas < 0 && (personagem.moedas || 0) + (guildaRef.current.cofre || 0) < -ef.moedas) {
      pushMsgs([{ autor: "sistema", texto: `✉️ Aceitar custaria ◉ ${-ef.moedas} — você não tem (bolso + cofre).` }]); return;
    }
    c.recebidas = c.recebidas.filter((x) => x.id !== id);
    c.historico = [{ ...p, status: aceite ? "aceita" : "recusada", respondidaEm: diaRef.current }, ...c.historico].slice(0, 12);
    correioRef.current = c; setCorreio(c);
    aplicarEfeitosCorreio(ef);
    pushMsgs([{ autor: "sistema", texto: `✉️ Petição de ${p.de}: ${aceite ? "ACEITA" : "RECUSADA"}${ef.nota ? ` — ${ef.nota}` : ""}.` }]);
    enviar(`[CORREIO — PETIÇÃO ${aceite ? "ACEITA" : "RECUSADA"}] ${p.texto} → EU DECIDI: ${aceite ? "ACEITEI" : "RECUSEI"}.${ef.nota ? ` Consequência (já aplicada pelo sistema): ${ef.nota}.` : ""}${ef.moedas ? ` Moedas: ${ef.moedas > 0 ? "+" : ""}${ef.moedas} (já aplicado).` : ""} Narre a reação de ${p.de} e as ondas que isso faz no mundo.${SO_ISSO}`);
  };

  /* CRÔNICA (v6.9): baixa a saga em Markdown — gerada por código dos registros. */
  const exportarCronica = (md) => {
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cronica-de-${(personagem.nome || "heroi").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-")}-dia-${diaRef.current}.md`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    bumpCont("cronicas"); checarConquistas();
    pushMsgs([{ autor: "sistema", texto: "📜 Crônica exportada — sua saga, em letra de forma." }]);
  };

  /* RELAÇÕES FORMAIS (v6.5): o jogador pode fixar a relação com qualquer
     pessoa conhecida — inclusive CÔNJUGE. Vira canon absoluto via envelope.
     É também o remendo para histórias já vividas (ex.: um casamento que a
     ficção consumou mas o registro não sabia). */
  const definirRelacao = (nome, relacao) => {
    const reg = npcsRef.current;
    /* membro do grupo sem ficha? o app cria na hora — relação formal precisa de registro */
    let n = reg[nome];
    if (!n) {
      const comp = (personagem.grupo || []).find((g) => (g.nome || "").toLowerCase() === nome.toLowerCase());
      if (!comp) return;
      n = criarNPC(comp.nome, { papel: [comp.classe, comp.subclasse].filter(Boolean).join(" · ") || "companheiro", relacao: "aliado", notas: comp.descricao || "", conhecidoEm: 0 });
    }
    if ((n.relacao || "") === relacao) return;
    const rotulo = relacaoNPC(relacao).rotulo;
    npcsRef.current = { ...reg, [nome]: { ...n, nome, relacao, ultimaVez: Date.now() } };
    setNpcs(npcsRef.current);
    pushMsgs([{ autor: "sistema", texto: `🤝 Relação formal registrada: ${nome} agora é ${rotulo}.` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[RELAÇÃO FORMAL — CANON ABSOLUTO] Eu declarei formalmente: minha relação com ${nome} é ${rotulo.toUpperCase()}${relacao === "conjuge" ? " — CÔNJUGE: somos casados, isso é fato consumado e permanente (trate como parte do nosso presente, sem inventar um passado longo que não esteja registrado)" : ""}. Registre no cânone e trate como verdade absoluta daqui em diante.`;
  };

  /* ACAMPAMENTO: pausa o "turno do mundo" — você conversa à vontade, nada avança.
     Ao sair, escolhe descanso curto/longo; o app reseta PV/PM (jogador+grupo) e o
     Mestre narra o que passou, proporcional ao tempo (nunca exagerado). */
  const acampar = () => {
    if (acampadoRef.current || bloqueado) return;
    if (combateRef.current) { combateRef.current = null; setCombate(null); combateOciosoRef.current = 0; }
    setAguardandoMundo(false);
    definirAcampado(true);
    const local = localDeDescanso(mapaRef.current, cidadeAtualRef.current, faccaoJogadorRef.current);
    const rotulo = local.tipo === "sede" ? "🏛 Você recolhe-se à sede da sua guilda"
                 : local.tipo === "casa" ? "🏠 Você recolhe-se a uma casa da sua facção"
                 : local.tipo === "aliada" ? "🤝 Você é acolhido por aliados"
                 : local.tipo === "hostil" ? "⚠ Você se esconde em território hostil"
                 : local.tipo === "estalagem" ? "🛏 Você aluga um quarto na estalagem"
                 : "⛺ Você monta acampamento";
    const emViagem = !!jornadaRef.current;
    pushMsgs([{ autor: "sistema", texto: `${emViagem ? "⛺ Você faz uma parada de descanso em plena viagem" : rotulo}. O tempo pausa — converse com o grupo à vontade. Escolha um descanso para retomar a jornada.` }]);
    enviar(`[ACAMPAMENTO${emViagem ? " EM VIAGEM" : ` em ${local.texto}`}] ${emViagem
      ? `Parei para descansar NO MEIO DA VIAGEM — local atual: ${localAtualTxt()}. O descanso acontece aqui mesmo: no acampamento à beira da estrada, na cabine do navio, no vagão da caravana — conforme o meio em que viajo. É TERMINANTEMENTE PROIBIDO me colocar em estalagem, aposentos ou cidade: eu NÃO cheguei a lugar nenhum ainda.`
      : `Montei acampamento/descanso em: ${local.texto}.`} A partir de agora é uma pausa segura: NÃO faça o mundo avançar, NÃO gere eventos externos nem passagem de tempo. Conduza conversas — companheiros puxam papo, revelam histórias. ${emViagem ? "Reflita o descanso itinerante na cena (fogueira, balanço do mar, turnos de vigia)." : "Se for a sede da guilda ou casa da facção, reflita esse conforto/autoridade na cena."} Descreva brevemente o local e deixe aberto para conversa.`, personagem);
  };

  const sairDoAcampamento = (tipo) => {
    if (!acampadoRef.current) return;
    definirAcampado(false);
    const msgs = [];
    let pers = aplicarDescanso(personagem, tipo, msgs);
    /* VÍNCULO: conversas de fogueira aproximam (+3 para todo o grupo) */
    pers = { ...pers, grupo: aplicarVinculo(pers.grupo, "todos", 3, msgs) };
    setPersonagem(pers);
    pushMsgs(msgs.map((t) => ({ autor: "sistema", texto: t })));
    bumpCont("descansos"); checarConquistas(pers);
    if (tipo === "longo") coletarRenda(1); // uma noite inteira passou: as terras rendem
    if (tipo === "longo") garantirMural(true); // o mural de contratos acorda com trabalho novo
    if (tipo === "longo") { // o mundo responde aos seus decretos: quem aceita, quem volta, quem não volta
      const antes = msgs.length;
      pers = processarDecretos(pers, msgs);
      if (msgs.length > antes) { setPersonagem(pers); pushMsgs(msgs.slice(antes).map((t) => ({ autor: "sistema", texto: t }))); }
    }
    /* GERADORES DE VIDA (v7.2): o descanso longo é quando o mundo sorteia —
       fio local novo, quest da fase do arco, evento global nascendo ou
       escalando. Tudo montado por código; o mestre recebe pronto e só narra. */
    let eventosMsg = "";
    if (tipo === "longo") {
      const ctx = ctxMundo({ mundo, mapa: mapaRef.current, dia: diaRef.current });
      ctx.fase = faseDoArco(historiaRef.current, ESTRUTURAS);
      const secundarias = questsRef.current.filter((q) => q.status === "ativa" && q.tipo !== "principal").length;
      /* ERMOS (v8.5): um dia se passou — o grupo come, bebe e se cansa. */
      {
        const bocas = 1 + (personagem.grupo || []).length;
        const cd = consumirDia(personagem.suprimentos, bocas);
        const comeuEBebeu = cd.faltaComida === 0 && cd.faltaAgua === 0;
        setPersonagem((pp) => ({
          ...pp,
          suprimentos: cd.suprimentos,
          exaustao: comeuEBebeu ? recuperarExaustao(pp.exaustao || 0, true) : Math.min(6, (pp.exaustao || 0) + cd.exaustao),
        }));
        if (cd.msgs.length) pushMsgs(cd.msgs.map((t) => ({ autor: "sistema", texto: t })));
        else if ((personagem.exaustao || 0) > 0) pushMsgs([{ autor: "sistema", texto: "🍲 Comida quente e água limpa — um nível de exaustão vai embora." }]);
      }
      const r = processarDescansoLongoEventos(eventosRef.current, ctx, { dia: diaRef.current, secundariasAtivas: secundarias });
      eventosRef.current = r.eventos; setEventos(r.eventos);
      /* DADOS À VISTA (v8.2): o mundo não "acontece" por mágica — o Mestre
         rola, e o jogador vê o dado e o alvo, como numa mesa de verdade. */
      if (mostrarRolagensRef.current && (r.rolagens || []).length) {
        pushMsgs((r.rolagens || []).map((x) => ({ autor: "sistema", texto: `🎲 ${x.texto}` })));
      }
      const partes = [];
      if (r.globalNovo) {
        partes.push(`[EVENTO GLOBAL — NOVO ARCO MAIOR: ${r.globalNovo.nome.toUpperCase()}] O SISTEMA sorteou um acontecimento que abalará a região: ${r.globalNovo.semente} ETAPA 1/${r.globalNovo.etapas.length} agora: ${r.globalNovo.etapas[0]} Teça isso na ficção aos poucos — é um arco longo de fundo, coerente com o arco atual, NÃO uma quest para resolver hoje.`);
        pushMsgs([{ autor: "sistema", texto: `🌍 Evento global: ${r.globalNovo.nome} — a região começa a mudar.` }]);
      }
      if (r.globalAvancou && r.eventos.global) {
        const g = r.eventos.global;
        partes.push(`[EVENTO GLOBAL — ${g.nome.toUpperCase()} · ETAPA ${g.etapa + 1}/${g.etapas.length}] A situação regional ESCALOU: ${g.etapas[g.etapa]} Mostre a escalada na ficção (notícias, medo, preços, movimentação de facções) sem resolvê-la ainda.`);
        pushMsgs([{ autor: "sistema", texto: `🌍 ${g.nome}: a situação escalou (etapa ${g.etapa + 1}/${g.etapas.length}).` }]);
      }
      if (r.localNovo) {
        partes.push(`[EVENTO LOCAL — FIO DO MUNDO] ${r.localNovo.icone} ${r.localNovo.texto} Gancho: ${r.localNovo.gancho} Apresente naturalmente (um grito, um boato, algo à vista). O jogador pode ignorar — se ignorar até o dia ${r.localNovo.expiraEm}, o fio se resolve sem ele.`);
        pushMsgs([{ autor: "sistema", texto: `${r.localNovo.icone} Fio do mundo à vista — veja o Diário.` }]);
      }
      r.expirados.forEach((l) => partes.push(`[EVENTO LOCAL — EXPIRADO] O fio "${l.texto}" se resolveu SEM a minha intervenção (o mundo seguiu sem mim). Mencione o desfecho como notícia de passagem, se couber.`));
      if (r.questNova) {
        questsRef.current = [...questsRef.current, { titulo: r.questNova.titulo, descricao: r.questNova.descricao, objetivo: r.questNova.objetivo, tipo: "secundaria", status: "ativa", nota: "", sorteada: true }];
        setQuests([...questsRef.current]);
        partes.push(`[QUEST GERADA PELO SISTEMA — fase "${ctx.fase}" do arco] Nova missão secundária JÁ REGISTRADA no diário (NÃO envie "quest_nova" duplicando-a): "${r.questNova.titulo}" — ${r.questNova.descricao} Objetivo: ${r.questNova.objetivo}. Apresente-a na ficção com liberdade total de execução (quem procura, como, com que voz); os FATOS acima são fixos.`);
        pushMsgs([{ autor: "sistema", texto: `📜 Fio de história: ${r.questNova.titulo}` }]);
      }
      /* EVENTOS DIVINOS (v7.4): só DEPOIS do despertar — o mundo vai
         introduzindo os deuses aos poucos. 35% por descanso longo, e às
         vezes uma divindade NOVA se revela (o panteão cresce com moderação). */
      if (divindadeRef.current && divindadeRef.current.despertar && Math.random() < 0.35) {
        const dv = { ...divindadeRef.current };
        /* 25% das vezes é uma divindade nova se revelando (panteão cap: 6) */
        if (dv.panteao.length < 6 && Math.random() < 0.25) {
          const nova = gerarDivindade(ctx, diaRef.current);
          dv.panteao = [...dv.panteao, nova];
          divindadeRef.current = dv; setDivindade(dv);
          partes.push(`[DIVINDADE SE REVELA — FATOS FIXOS DO SISTEMA] Uma entidade antes imperceptível agora se mostra ao herói desperto: ${nova.icone} ${nova.nome} ${nova.dominio} — GD ${nova.gd} (${tituloDe(nova.gd)}), ${nova.temperamento}, culto: ${nova.culto}${nova.lugar ? `, forte em ${nova.lugar}` : ""}. Ela SEMPRE existiu — só agora ele a percebe. Introduza-a na ficção com sutileza (um símbolo num templo, uma prece ouvida, um sinal). NÃO mude os fatos acima.`);
          pushMsgs([{ autor: "sistema", texto: `${nova.icone} Uma divindade se revela: ${nova.nome} ${nova.dominio} (GD ${nova.gd}) — veja Ascensão.` }]);
        } else {
          const evd = gerarEventoDivino(ctx, diaRef.current, dv.panteao);
          if (evd) {
            partes.push(`[EVENTO DIVINO — FATOS FIXOS DO SISTEMA] ${evd.icone} ${evd.texto} Gancho: ${evd.gancho}. Apresente naturalmente; o jogador pode ignorar. NÃO force resolução hoje.`);
            pushMsgs([{ autor: "sistema", texto: `${evd.icone} O céu se mexe — um evento divino em curso.` }]);
          }
        }
      }
      if (partes.length) eventosMsg = "\n" + partes.join("\n");
    }
    let reinoMsg = "";
    if (tipo === "longo") { // um dia virou: o calendário anda e o reino vive
      const evs = avancarDiasReino(1);
      evs.forEach((ev) => pushMsgs([{ autor: "sistema", texto: `👑 ${ev.evento.titulo} em ${ev.cidade}: ${ev.evento.txt(ev.cidade)}` }]));
      reinoMsg = envelopeEventosReino(evs);
      minutoRef.current = AMANHECER; setMinuto(minutoRef.current);
      acordouAbsRef.current = absMin(); // o relógio do sono recomeça no amanhecer
    } else {
      minutoRef.current = (minutoRef.current + 60) % 1440; setMinuto(minutoRef.current); // cochilo de uma hora
    }
    /* SONHOS (v6.7): 25% das noites longas trazem um — presságio, memória ou
       pesadelo. Alguns deixam condição no dia seguinte. O Mestre só tece. */
    let sonhoMsg = "";
    if (tipo === "longo" && Math.random() < 0.25) {
      const sn = rolarSonho();
      if (sn.efeito === "inspirado") pers = { ...pers, condicoes: [...(pers.condicoes || []), { nome: "Inspirado", tipo: "bom", nota: "acordou com o espírito leve — um bom sonho" }] };
      if (sn.efeito === "perturbado") pers = { ...pers, condicoes: [...(pers.condicoes || []), { nome: "Perturbado", tipo: "ruim", nota: "noite mal dormida, sonhos ruins" }] };
      setPersonagem(pers);
      pushMsgs([{ autor: "sistema", texto: `💭 ${sn.texto}` }]);
      sonhoMsg = `\n[SONHO] Esta noite eu sonhei: "${sn.texto}"${sn.efeito ? ` (acordei ${sn.efeito === "inspirado" ? "INSPIRADO" : "PERTURBADO"} — condição já aplicada pelo sistema)` : ""}. Teça o sonho na ficção se quiser — presságio, memória ou puro delírio, você decide o quanto ele significa.`;
    }
    const climaNovo = tipo === "longo" ? talvezMudarClima(0.6) : null;
    const climaMsg = climaNovo ? `\n[CLIMA] O tempo virou durante a noite: agora está ${climaNovo.rotulo} — ${climaNovo.nota}.` : "";
    const dur = tipo === "longo" ? "uma noite inteira" : "cerca de uma hora";
    const localMsg = jornadaRef.current
      ? `\n[ONDE ACORDO] Eu ainda estou EM VIAGEM (${localAtualTxt()}) — acordo no mesmo lugar em que dormi (acampamento na estrada, cabine do navio, etc.). A viagem CONTINUA de onde parou: proibido me colocar em cidade/aposentos; o destino ainda está adiante.`
      : "";
    enviar(`[FIM DO ACAMPAMENTO — DESCANSO ${tipo.toUpperCase()}] Levantamos acampamento após ${dur} de descanso. PV e PM já foram restaurados pelo sistema (${tipo === "longo" ? "totalmente" : "parcialmente"}) para mim e para o grupo. Agora o mundo VOLTA a correr: narre de forma PROPORCIONAL o que se passou nesse tempo curto — pequenas mudanças plausíveis (o clima, um ruído ao longe, um viajante que passou, o avanço natural de algo já em curso). NUNCA exagere o tempo: foi só ${dur}, então nada de meses, quedas de impérios ou grandes saltos. Retome a cena e me convide a agir.${localMsg}${climaMsg}${reinoMsg}${sonhoMsg}${eventosMsg}`, pers);
  };

  /* Escolher/trocar caminho (classe). Regras:
     - só no acampamento (fora de perigo). Se não estiver acampado, avisa.
     - custa moedas (definir/preencher em branco é barato; trocar é mais caro).
     - vale para o jogador (alvo "eu") ou um companheiro (nome). */
  const CUSTO_DEFINIR = 20, CUSTO_TROCAR = 80;
  const trocarCaminho = (alvo, { raca, classe, subclasse, profissao }) => {
    if (!acampadoRef.current) { pushMsgs([{ autor: "sistema", texto: "⛺ Você precisa estar acampado para refletir sobre um novo caminho. Monte acampamento primeiro." }]); return; }
    const ehJogador = alvo === "eu";
    const atual = ehJogador ? personagem : (personagem.grupo || []).find((g) => g.nome === alvo);
    if (!atual) return;
    const jaTinha = !!atual.classe;
    const custo = jaTinha ? CUSTO_TROCAR : CUSTO_DEFINIR;
    if (personagem.moedas < custo) { pushMsgs([{ autor: "sistema", texto: `Moedas insuficientes: definir custa ${CUSTO_DEFINIR}, trocar custa ${CUSTO_TROCAR}.` }]); return; }
    const cObj = classePorNome(classe);
    const habsIniciais = cObj ? cObj.habilidades.filter((h) => h.nivel === 1).map((h) => ({ nome: h.nome, custo: h.custo, descricao: h.descricao })) : [];
    setPersonagem((p) => {
      let np = { ...p, moedas: Math.max(0, p.moedas - custo) };
      if (ehJogador) {
        np = { ...np, raca: raca || p.raca, classe, subclasse, profissao: profissao || p.profissao,
               habilidades: jaTinha ? p.habilidades : habsIniciais };
      } else {
        np = { ...np, grupo: (p.grupo || []).map((g) => g.nome === alvo ? { ...g, raca: raca || g.raca, classe, subclasse, profissao: profissao || g.profissao } : g) };
      }
      return np;
    });
    const quem = ehJogador ? "Você" : alvo;
    pushMsgs([{ autor: "sistema", texto: `✦ ${quem} ${jaTinha ? "trilhou um novo caminho" : "definiu seu caminho"}: ${[raca, classe, subclasse].filter(Boolean).join(" · ")} (−${custo} moedas)` }]);
    notaRef.current = `[INFO] ${quem} agora é ${[raca, classe, subclasse].filter(Boolean).join(", ")}${profissao ? `, profissão ${profissao}` : ""}. Reflita isso na narrativa daqui em diante.`;
  };

  const removerDoGrupo = (nome) => {
    setPersonagem((p) => ({ ...p, grupo: (p.grupo || []).filter((g) => g.nome !== nome) }));
    pushMsgs([{ autor: "sistema", texto: `${nome} deixou o grupo.` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] ${nome} saiu do meu grupo (removido pelo jogador). Reflita isso na narrativa: ${nome} não viaja mais comigo.`;
  };

  /* Troca o arco da campanha em andamento — sem reiniciar o mundo. */
  const trocarArco = (id) => {
    const est = estruturaPorId(id);
    historiaRef.current = { estrutura: id, etapa: 0 };
    pushMsgs([{ autor: "sistema", texto: `📖 Novo arco iniciado: ${est.nome} — "${est.etapas[0].nome}"` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[NOVO ARCO ESCOLHIDO PELO JOGADOR: ${est.nome}] NÃO reinicie o mundo: tudo que foi vivido permanece canônico. Costure a transição a partir da situação ATUAL — a campanha apenas muda de perspectiva dramática. Momento inicial do novo arco: "${est.etapas[0].nome}" — ${est.etapas[0].instrucao} Crie a nova missão principal coerente com este arco e com o que o herói já construiu; conclua ou adapte missões antigas que não façam mais sentido.`;
  };

  /* ---------------- GESTÃO POR CÓDIGO (zero tokens) ----------------
     Rendas caem no COFRE quando o tempo passa na história. O Mestre
     nunca calcula nada disso — só narra e registra conquistas. */
  const coletarRenda = useCallback((dias) => {
    const temGuilda = !!faccaoJogadorRef.current;
    const nDominios = dominiosDe(mapaRef.current).length;
    if ((!temGuilda && !nDominios) || dias <= 0) return 0;
    const porDia = rendaDiariaTotal(mapaRef.current, guildaRef.current.nivel, temGuilda);
    const ganho = Math.round(porDia * dias * fatorMedioReino(reinoRef.current) * estacaoDe(diaRef.current).fatorRenda); // povo feliz produz mais; inverno aperta
    if (ganho <= 0) return 0;
    const g = { ...guildaRef.current, cofre: guildaRef.current.cofre + ganho };
    guildaRef.current = g; setGuilda(g);
    pushMsgs([{ autor: "sistema", texto: `🏛 Suas terras e contratos renderam ◉ ${ganho} (${dias} dia${dias > 1 ? "s" : ""}) — no cofre${temGuilda ? ` de ${faccaoJogadorRef.current}` : ""}.` }]);
    checarConquistas();
    return ganho;
  }, [pushMsgs]);

  const depositarCofre = (valor) => {
    const v = Math.min(valor, personagem.moedas || 0);
    if (v <= 0) return;
    setPersonagem((p) => ({ ...p, moedas: p.moedas - v }));
    const g = { ...guildaRef.current, cofre: guildaRef.current.cofre + v };
    guildaRef.current = g; setGuilda(g);
    pushMsgs([{ autor: "sistema", texto: `🏛 Você depositou ◉ ${v} no cofre da guilda.` }]);
    checarConquistas();
  };

  const sacarCofre = (valor) => {
    const v = Math.min(valor, guildaRef.current.cofre);
    if (v <= 0) return;
    const g = { ...guildaRef.current, cofre: guildaRef.current.cofre - v };
    guildaRef.current = g; setGuilda(g);
    setPersonagem((p) => ({ ...p, moedas: (p.moedas || 0) + v }));
    pushMsgs([{ autor: "sistema", texto: `🏛 Você sacou ◉ ${v} do cofre da guilda.` }]);
    checarConquistas();
  };

  const melhorarGuilda = () => {
    const custo = custoUpgradeGuilda(guildaRef.current.nivel);
    if (custo == null || guildaRef.current.cofre < custo) return;
    const g = { nivel: guildaRef.current.nivel + 1, cofre: guildaRef.current.cofre - custo };
    guildaRef.current = g; setGuilda(g);
    pushMsgs([{ autor: "sistema", texto: `⚒ ${faccaoJogadorRef.current || "Sua guilda"} cresceu para o nível ${g.nivel}! Contratos maiores e domínios mais produtivos.` }]);
    checarConquistas();
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Minha guilda (${faccaoJogadorRef.current}) melhorou para o nível ${g.nivel} — maior, mais rica e mais respeitada. Reflita esse crescimento na ficção.`;
  };

  /* ERGUER TEMPLO (v8.9): a fé vira obra. Sai do cofre da guilda, só em
     domínio seu, e converte parte da cidade na inauguração — daí em diante
     aquele lugar reza sozinho todo dia. É a única construção que o jogador
     controla, e é ela que ancora a devoção na geografia. */
  const erguerTemploUI = (nomeCidade) => {
    const cidade = ((mapaRef.current && mapaRef.current.cidades) || []).find((c) => c.nome === nomeCidade);
    const chk = podeErguerTemplo({ cidade, devocao: devocaoRef.current, divindade: divindadeRef.current, cofre: guildaRef.current.cofre || 0 });
    if (!chk.pode || !chk.alvo) { pushMsgs([{ autor: "sistema", texto: `⛔ Não dá para erguer aqui: ${chk.motivo}.` }]); return; }
    const custo = chk.alvo.custo;
    guildaRef.current = { ...guildaRef.current, cofre: Math.max(0, (guildaRef.current.cofre || 0) - custo) };
    setGuilda(guildaRef.current);
    const { devocao: d, templo, salto } = erguerTemplo(devocaoRef.current, nomeCidade, diaRef.current);
    devocaoRef.current = d; setDevocao(d);
    sincronizarFieis(d);
    const fe = Math.round(feDaCidade(d, nomeCidade));
    pushMsgs([{ autor: "sistema", texto: `${templo.icone} ${templo.nome} erguido em ${nomeCidade} (−◉ ${custo}). A inauguração já converte +${salto}% da cidade — devoção agora em ${fe}%, +${templo.pf} PF por dia.` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[TEMPLO ERGUIDO — REGISTRO DO SISTEMA] Um ${templo.nome.toLowerCase()} em nome do herói foi construído em ${nomeCidade}, pago do cofre (◉ ${custo}). A devoção da cidade subiu para ${fe}%. Narre a obra e o que ela cria: sacerdócio próprio, ofícios diários, gente que passa a rezar o nome dele — e a reação do culto que já estava ali, que não vai gostar. Os números já foram aplicados; não os recalcule.`;
    salvar();
    checarConquistas();
  };

  /* CONVITE AO GRUPO: o jogador convida um NPC conhecido; o Mestre decide
     na ficção se ele aceita (a escolha é do personagem, não do jogador). */
  const convidarNpc = (nome) => {
    if (bloqueado || (personagem.grupo || []).length >= MAX_COMPANHEIROS) return;
    setAba(null);
    pushMsgs([{ autor: "jogador", texto: `Convido ${nome} para se juntar ao meu grupo.` }]);
    enviar(`[CONVITE AO GRUPO — ação de painel] Aqui, na cena atual, eu faço UM convite a ${nome}: juntar-se ao meu grupo. Sua resposta é SÓ a reação e as palavras de ${nome}, em 1ª pessoa, aí mesmo onde estamos. A decisão é dele(a): pode aceitar (registre em "grupo_adicionar" com a ficha completa), recusar com jeito, ou pedir uma condição — mas a condição é uma FALA, não uma missão nem uma viagem. Não narre partida, despedida, preparativos, estrada nem passagem de tempo: ninguém saiu do lugar por causa de um convite.${SO_ISSO}`, personagem);
  };

  /* ---------------- BEBER POÇÃO (v9.2) ----------------
     Ação BÔNUS: gasta o movimento extra do turno, nunca a ação — dá para
     tomar a poção e ainda atacar, como o jogador pediu. Fora de combate é
     livre. O efeito é rolado pelo sistema; o Mestre só narra. */
  const usarConsumivelUI = (nomeItem) => {
    if (bloqueado) return;
    const cons = comoConsumivel(nomeItem);
    if (!cons) return;
    const comb = combateRef.current;
    if (comb && comb.economia) {
      const eco = comb.economia;
      if (eco.extra <= 0 && eco.acao <= 0) { pushMsgs([{ autor: "sistema", texto: "⏳ Sem movimentos neste turno — encerre o turno para beber." }]); return; }
      if (eco.extra > 0) eco.extra -= 1; else eco.acao -= 1;   // prefere a ação bônus
      combateRef.current = { ...comb, economia: { ...eco } }; setCombate(combateRef.current);
    }
    const r = usarConsumivel(personagem, nomeItem);
    if (!r) return;
    let p = r.ent;
    if (r.gastou) {
      /* tira UMA unidade da bolsa (o resto da pilha continua lá) */
      const idx = (p.inventario || []).findIndex((raw) => (typeof raw === "string" ? raw : (raw && raw.nome) || "") === nomeItem);
      if (idx >= 0) p = { ...p, inventario: p.inventario.filter((_, i) => i !== idx) };
    }
    setPersonagem(p);
    pushMsgs([{ autor: "sistema", texto: r.texto }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[CONSUMÍVEL — JÁ APLICADO PELO SISTEMA] Bebi ${cons.nome}. ${r.texto.replace(/^[^ ]+ /, "")}. O número já foi rolado e aplicado: narre o gole e o alívio (ou o gosto), sem recalcular e sem me devolver PV/PM. ${comb ? "Isso foi ação BÔNUS — ainda posso agir neste turno." : ""}`;
    salvar({ personagem: p });
  };

  /* ---------------- MERCADO (v9.2) ----------------
     O estoque não mora no save: é derivado da cidade + semana. O save
     guarda só o que JÁ FOI COMPRADO, para o item não voltar à prateleira,
     e o ambulante da estrada enquanto ele estiver por perto. */
  const mercadoRef = useRef({ comprados: {}, ambulante: null });
  const [mercado, setMercado] = useState(mercadoRef.current);
  const cidadeMercado = ((mapa && mapa.cidades) || []).find((c) => (c.nome || "").toLowerCase() === String(cidadeAtualRef.current || "").toLowerCase()) || null;
  const mercadoAqui = (() => {
    const comprados = (mercado && mercado.comprados) || {};
    const semEstoqueGasto = (m) => ({ ...m, estoque: (m.estoque || []).filter((it) => !(comprados[m.id] || []).includes(it.nome)) });
    const lista = [];
    if (mercado && mercado.ambulante) lista.push(semEstoqueGasto(mercado.ambulante));
    if (cidadeMercado) lista.push(...mercadoresDaCidade(cidadeMercado, diaRef.current, (personagem && personagem.nivel) || 1).map(semEstoqueGasto));
    return lista;
  })();

  const comprarNoMercado = (mercadorId, nomeItem) => {
    const m = mercadoAqui.find((x) => x.id === mercadorId);
    const it = m && m.estoque.find((x) => x.nome === nomeItem);
    if (!it) return;
    if ((personagem.moedas || 0) < it.preco) { pushMsgs([{ autor: "sistema", texto: `◉ Moedas insuficientes para ${it.nome} (◉ ${it.preco}).` }]); return; }
    const ehEquip = ["arma", "escudo", "armadura", "elmo", "botas", "anel", "amuleto"].includes(it.tipo);
    const { preco, detalhe, ...limpo } = it;
    const p = {
      ...personagem,
      moedas: (personagem.moedas || 0) - it.preco,
      equipamento: ehEquip ? [...(personagem.equipamento || []), limpo] : (personagem.equipamento || []),
      inventario: ehEquip ? (personagem.inventario || []) : [...(personagem.inventario || []), limpo],
    };
    setPersonagem(p);
    const comprados = { ...(mercadoRef.current.comprados || {}) };
    comprados[mercadorId] = [...(comprados[mercadorId] || []), it.nome];
    mercadoRef.current = { ...mercadoRef.current, comprados }; setMercado(mercadoRef.current);
    pushMsgs([{ autor: "sistema", texto: `🛒 Comprado: ${it.nome} por ◉ ${it.preco} (restam ◉ ${p.moedas}).` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[COMPRA — JÁ REGISTRADA PELO SISTEMA] Comprei "${it.nome}" de ${m.nome} por ◉ ${it.preco}. O item já está comigo e as moedas já saíram — não envie item nem moeda. Narre a troca e o vendedor, se a cena estiver acontecendo agora.`;
    salvar({ personagem: p });
    checarConquistas(p);
  };

  const venderNoMercado = (nomeItem, origem) => {
    const lista = origem === "equipamento" ? (personagem.equipamento || []) : (personagem.inventario || []);
    const idx = lista.findIndex((raw) => (typeof raw === "string" ? raw : (raw && raw.nome) || "") === nomeItem);
    if (idx < 0) return;
    const item = lista[idx];
    /* o que está VESTIDO não vai para a banca por engano */
    if (origem === "equipamento" && Object.values(personagem.equipados || {}).some((e) => e && e.nome === nomeItem)) {
      pushMsgs([{ autor: "sistema", texto: `⛔ ${nomeItem} está equipado — desequipe antes de vender.` }]); return;
    }
    const valor = precoDeCompra(typeof item === "string" ? { nome: item } : item, cidadeMercado);
    const p = {
      ...personagem,
      moedas: (personagem.moedas || 0) + valor,
      [origem]: lista.filter((_, i) => i !== idx),
    };
    setPersonagem(p);
    pushMsgs([{ autor: "sistema", texto: `🛒 Vendido: ${nomeItem} por ◉ ${valor} (bolsa: ◉ ${p.moedas}).` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[VENDA — JÁ REGISTRADA PELO SISTEMA] Vendi "${nomeItem}" por ◉ ${valor}. O item saiu da minha bolsa e as moedas entraram — não repita os números.`;
    salvar({ personagem: p });
  };

  /* O que dá para beber agora, agrupado por nome (vai para o painel de combate) */
  const pocoesNaBolsa = (() => {
    const mapa = {};
    for (const raw of (personagem && personagem.inventario) || []) {
      const c = comoConsumivel(raw);
      if (!c) continue;
      const nome = typeof raw === "string" ? raw : (raw && raw.nome) || c.nome;
      if (!mapa[nome]) mapa[nome] = { nome, icone: c.icone, curto: c.nome.replace(/^(Poção de |Frasco de |Elixir de )/, ""), qtd: 0, detalhe: `${c.nome} — ${descricaoCurta(c)}` };
      mapa[nome].qtd++;
    }
    return Object.values(mapa).slice(0, 6);
  })();

  /* ---------------- CONQUISTAS E VÍNCULOS (100% por código, zero tokens) ---------------- */
  const bumpCont = (campo, n = 1) => { contRef.current = { ...contRef.current, [campo]: (contRef.current[campo] || 0) + n }; };

  /* VÍNCULO: aplica pontos a um companheiro (ou a todos). Se cruzar um MARCO,
     o app concede +2 PV máx e deixa um bilhete para o Mestre criar o momento. */
  const aplicarVinculo = (grupo, nomeOuTodos, pontos, msgs) => {
    const batidos = [];
    const novo = (grupo || []).map((g) => {
      if (nomeOuTodos !== "todos" && g.nome !== nomeOuTodos) return g;
      const r = ganharVinculo(g, pontos);
      if (r.marcoNovo) batidos.push({ nome: g.nome, marco: r.marcoNovo });
      return r.membro;
    });
    batidos.forEach(({ nome, marco }) => {
      const linha = `${marco.icone} ${marco.nome}: seu vínculo com ${nome} se aprofundou — ${nome} ganha +2 PV máx`;
      if (msgs) msgs.push(linha); else pushMsgs([{ autor: "sistema", texto: linha }]);
      notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[VÍNCULO — MARCO ${marco.nome.toUpperCase()}] ${nome} alcançou o vínculo "${marco.nome}" com o herói. No momento certo (na fogueira, na estrada, após a cena atual), crie um MOMENTO ÍNTIMO: ${nome} compartilha algo pessoal — uma história, um medo, um segredo, um pedido ou um presente simbólico. Se já estivermos conversando com ele(a), pode ser agora.`;
    });
    return novo;
  };

  const checarConquistas = useCallback((pers) => {
    const p = pers || personagem;
    if (!p) return;
    const fs = mapaRef.current.faccoes || [];
    const stats = {
      ...contRef.current,
      nivel: p.nivel || 1,
      moedas: p.moedas || 0,
      companheiros: (p.grupo || []).length,
      npcs: Object.keys(npcsRef.current || {}).length,
      criaturasDescobertas: descobRef.current.length,
      cicatrizes: (p.cicatrizes || []).length,
      diasVividos: diaRef.current,
      fama: famaAtual(),
      temNemesis: !!(nemesisRef.current && nemesisRef.current.status !== "derrotada"),
      dominios: dominiosDe(mapaRef.current).length,
      temGuilda: !!faccaoJogadorRef.current,
      guildaNivel: guildaRef.current.nivel,
      cofre: guildaRef.current.cofre,
      tratados: fs.filter((f) => f.tratado === "comercio" || f.tratado === "alianca").length,
      vassalos: fs.filter((f) => f.tratado === "vassalagem").length,
      guerras: fs.filter((f) => f.tratado === "guerra").length,
      vinculoAmizade: (p.grupo || []).filter((g) => (g.vinculo || 0) >= 50).length,
      vinculoProfundo: (p.grupo || []).filter((g) => (g.vinculo || 0) >= 100).length,
      itemLendario: [...(p.equipamento || []), ...Object.values(p.equipados || {}), ...(p.grupo || []).flatMap((g) => [...(g.equipamento || []), ...Object.values(g.equipados || {})])].some((i) => i && i.raridade === "lendario"),
    };
    const novas = avaliarConquistas(stats, conqRef.current.desbloqueadas);
    if (!novas.length) return;
    const c = { desbloqueadas: { ...conqRef.current.desbloqueadas }, ordem: [...conqRef.current.ordem] };
    const msgs = novas.map((n) => {
      c.desbloqueadas[n.id] = true; c.ordem.push(n.id);
      return { autor: "sistema", texto: `🏆 Conquista desbloqueada: ${n.icone} ${n.nome} — título "${n.titulo}" (equipe no Códex)` };
    });
    conqRef.current = c; setConquistas(c);
    pushMsgs(msgs);
  }, [personagem, pushMsgs]);

  const escolherTitulo = (id) => {
    const cq = conquistaPorId(id);
    if (!cq) return;
    const novo = tituloAtivoRef.current === cq.titulo ? "" : cq.titulo;
    tituloAtivoRef.current = novo; setTituloAtivo(novo);
  };

  /* ---------------- VIAGEM E CLIMA POR TABELA (zero tokens) ----------------
     A estrada rola por código: clima, encontro (perigo do bestiário, viajante,
     achado das tabelas, cena de mundo). O Mestre só recebe o resultado e narra. */
  /* CLIMA SAZONAL (v6.7): a estação do ano pesa a tabela de clima —
     inverno congela, verão torra, outono enevoa. Tudo por código. */
  const rolarClimaEstacao = (atualId) => {
    const bias = BIAS_CLIMA[estacaoDe(diaRef.current).id] || {};
    const pool = CLIMAS.flatMap((c) => {
      const mult = bias[c.id] != null ? bias[c.id] : 1;
      if (mult === 0) return [];
      return Array(Math.max(1, Math.round(c.peso * mult))).fill(c);
    });
    let c = pool[Math.floor(Math.random() * pool.length)];
    if (atualId && c.id === atualId && pool.length > 1) c = pool[Math.floor(Math.random() * pool.length)];
    return c;
  };

  const talvezMudarClima = (chance = 0.4) => {
    if (Math.random() >= chance) return null;
    const c = rolarClimaEstacao(climaRef.current ? climaRef.current.id : null);
    climaRef.current = c; setClima(c);
    return c;
  };

  const viajar = (destino = "") => {
    if (acampadoRef.current) return;
    /* NAVEGAÇÃO (5e): terreno difícil pode fazer o grupo se perder. */
    let notaErmos = "";
    {
      const bioma = (cidadeAtualRef.current && (mapaRef.current.cidades || []).find((c) => c.nome === cidadeAtualRef.current)?.bioma) || "planicie";
      const nav = testarNavegacao(bioma, atributoEfetivo(personagem, "percepcao"), (mapaRef.current.cidades || []).length > 3);
      if (mostrarRolagensRef.current) pushMsgs([{ autor: "sistema", texto: `🧭 ${nav.texto}` }]);
      if (!nav.passou) {
        pushMsgs([{ autor: "sistema", texto: `🧭 Vocês se perdem e queimam ${nav.horasPerdidas}h tentando reencontrar a rota.` }]);
        notaErmos = ` O grupo SE PERDEU no caminho (${nav.horasPerdidas}h desperdiçadas) — narre a confusão de trilhas, o desânimo e como reencontram o rumo.`;
      }
      const ex = efeitoExaustao(personagem.exaustao || 0);
      if (ex.nivel) notaErmos += ` EXAUSTÃO nível ${ex.nivel} (${ex.efeito}) — mostre o desgaste no corpo de todos.`;
    }
    if (combateRef.current) { pushMsgs([{ autor: "sistema", texto: "⚔ Não dá para viajar no meio de um combate." }]); return; }
    const c = rolarClimaEstacao(climaRef.current ? climaRef.current.id : null);
    climaRef.current = c; setClima(c);
    const enc = rolarEncontro((mundo && mundo.genero) || "Fantasia medieval", personagem.nivel || 1, null);
    /* CÓDEX: viagens e perigos da estrada contam para as conquistas */
    bumpCont("viagens");
    if (enc.tipo === "perigo") bumpCont("perigosEstrada");
    checarConquistas();
    pushMsgs([{ autor: "jogador", texto: `🧭 Sigo viagem pela estrada. ${c.icone} ${c.rotulo}` }]);
    /* JORNADA: partir marca que saímos da cidade — até o sistema registrar
       chegada, eu estou NA ESTRADA (ou no mar), não em lugar nenhum. */
    if (!jornadaRef.current) {
      jornadaRef.current = { de: cidadeAtualRef.current || "a última parada", desde: diaRef.current, meio: "" };
      setJornada(jornadaRef.current);
    }
    const extraTempo = avancarMinutos(MINUTOS_VIAGEM); // estrada come horas
    /* MERCADOR AMBULANTE (v9.2): uma carroça na estrada, com estoque de
       verdade. Sai por sorteio do sistema — sem envelope, não há mercador. */
    let notaAmbulante = "";
    {
      const amb = talvezAmbulante(diaRef.current, personagem.nivel || 1);
      if (amb) {
        mercadoRef.current = { ...mercadoRef.current, ambulante: amb }; setMercado(mercadoRef.current);
        pushMsgs([{ autor: "sistema", texto: `🐴 Uma carroça de mercador cruza seu caminho — veja o que ele traz em Gestão › Mercado.` }]);
        notaAmbulante = ` UM MERCADOR AMBULANTE apareceu no trecho (sorteado pelo sistema): uma carroça com ${amb.estoque.slice(0, 4).map((it) => it.nome).join(", ")}. Apresente o vendedor e a carroça na cena — dê nome e jeito a ele —, mas NÃO invente estoque nem preço: o que ele vende está no painel de Mercado do jogador.`;
      } else if (mercadoRef.current.ambulante) {
        /* a carroça do trecho anterior seguiu viagem */
        mercadoRef.current = { ...mercadoRef.current, ambulante: null }; setMercado(mercadoRef.current);
      }
    }
    enviar(`[VIAGEM — tudo rolado pelas tabelas do app; você só NARRA, não invente outro resultado]
LOCAL ATUAL: ${localAtualTxt()}.
CLIMA AGORA: ${c.rotulo} — ${c.nota}.
ENCONTRO DO TRECHO (${enc.tipo}): ${enc.detalhe}
Descreva o trecho sob esse clima e desenvolva o encontro acima, costurando com a cena atual. Lembre-se: estou EM VIAGEM — a cena acontece no caminho${jornadaRef.current.meio ? ` (seguimos de ${jornadaRef.current.meio})` : ""}, não em cidade. Se o meio de viagem mudar, registre "jornada_meio". Se chegarmos de fato a um destino, registre "cidade_atual". ${destino ? `Estou a caminho de ${destino} — aproxime-me desse destino e, se chegarmos, registre "cidade_atual".` : "Se eu estiver a caminho de algum destino, aproxime-me dele."} Termine me convidando a agir.${notaErmos}${notaAmbulante}${extraTempo}`, personagem);
  };

  /* DIPLOMACIA: propostas a potências vão para a ficção; o Mestre decide a
     resposta do líder e só registra o tratado firmado — os efeitos (renda,
     tributo) são calculados pelo app. */
  const diplomacia = (faccao, acao) => {
    if (bloqueado) return;
    const ROT = { comercio: "proponho um acordo comercial", alianca: "proponho uma aliança formal", vassalagem: "exijo que se tornem meus vassalos", guerra: "declaro guerra" };
    if (!ROT[acao]) return;
    setAba(null);
    pushMsgs([{ autor: "jogador", texto: `[Diplomacia] ${ROT[acao]} a ${faccao}.` }]);
    enviar(`[DIPLOMACIA — ${faccao}] Em nome ${faccaoJogadorRef.current ? `de ${faccaoJogadorRef.current} e dos meus domínios` : "do meu próprio nome"}, ${ROT[acao]} a ${faccao}. O líder de ${faccao} responde NA FICÇÃO conforme poder, personalidade, medos e ambições: pode aceitar, exigir condições (tributo, casamento, prova de força), adiar ou recusar — a decisão é dele(a). Se um acordo for firmado ou rompido, registre em "mapa_faccoes": [{"nome":"${faccao}","tratado":"comercio|alianca|vassalagem|guerra|nenhum","relacao":"aliada|neutra|inimiga","notas":"termos do acordo"}]. NÃO invente valores econômicos — os efeitos dos tratados são calculados pelo app.${SO_ISSO}`, personagem);
  };

  /* PRESENTE DIPLOMÁTICO: ◉ 40 do cofre da guilda, enviado na ficção.
     O Mestre decide a reação (pode melhorar relação, abrir porta para
     tratado, ou ofender se mal dado) — a decisão é do líder. */
  const CUSTO_PRESENTE = 40;
  const presentearFaccao = (faccao) => {
    if (bloqueado) return;
    if (!faccaoJogadorRef.current) { pushMsgs([{ autor: "sistema", texto: "🎁 Sem uma guilda, você não tem um cofre nem mensageiros para presentear potências." }]); return; }
    if (guildaRef.current.cofre < CUSTO_PRESENTE) { pushMsgs([{ autor: "sistema", texto: `🎁 Presentear custa ◉ ${CUSTO_PRESENTE} do cofre — e o cofre tem ◉ ${guildaRef.current.cofre}.` }]); return; }
    const g = { ...guildaRef.current, cofre: guildaRef.current.cofre - CUSTO_PRESENTE };
    guildaRef.current = g; setGuilda(g);
    bumpCont("presentes"); checarConquistas();
    setAba(null);
    pushMsgs([{ autor: "sistema", texto: `🎁 ◉ ${CUSTO_PRESENTE} do cofre viram um presente digno para ${faccao}.` }]);
    enviar(`[PRESENTE DIPLOMÁTICO — ${faccao}] Em nome de ${faccaoJogadorRef.current}, envio um presente suntuoso (◉ ${CUSTO_PRESENTE}, já descontados pelo sistema) ao líder de ${faccao}. Ele(a) reage NA FICÇÃO conforme a personalidade e a relação: pode se agradar e aquecer os laços (atualize "mapa_faccoes" com relacao/notas), pode devolver um gesto à altura, pode achar pouco, ou até se ofender se o presente soar como suborno. O efeito na relação é a SUA decisão narrativa; valores de gestão continuam por conta do app.${SO_ISSO}`, personagem);
  };

  /* RECALIBRAR LENDA: saves antigos ficaram para trás da própria história
     (herói lendário com números de iniciante). O Mestre relê o livro e o
     cânone e PROPÕE nível/atributos; o app calcula PV/PM pelas tabelas e
     o jogador confirma. Uma chamada leve, sob demanda. */
  const [recal, setRecal] = useState(null); // null | "pedindo" | { proposta, justificativa }
  const recalibrarLenda = async () => {
    if (bloqueado || recal === "pedindo") return;
    setAba(null);
    setRecal("pedindo");
    try {
      const sys = `Você é o ARQUIVISTA da campanha "${nomeCampanha}". Um save antigo deixou os números do herói para trás da lenda. Leia o LIVRO e o CÂNONE e proponha os números JUSTOS de hoje, baseando-se SÓ no que aconteceu na história (feitos, combates vencidos, anos de estrada). Responda SOMENTE JSON no formato: {"nivel": <inteiro 1-20>, "atributos": {"forca":0-5,"destreza":0-5,"vigor":0-5,"intelecto":0-5,"presenca":0-5,"percepcao":0-5}, "dadivas": <inteiro 0-6, só se nivel 20: quantas dádivas épicas os feitos justificam>, "justificativa": "2-3 frases citando os feitos que sustentam a proposta"}.
REFERÊNCIAS DE ESCALA (novas regras): o nível 20 é o ápice mortal e custa 355.000 XP acumulados — só conceda se a lenda for realmente monumental (impérios, deuses enfrentados, décadas de estrada). Atributos vão de 0 a +5; a PROFICIÊNCIA (+2 a +6 pelo nível) é somada pelo sistema por cima, então não a embuta nos atributos. Se o herói estiver no nível 20 e a história sustentar feitos ainda maiores, proponha dádivas épicas (cada uma equivale a ~30.000 XP além do ápice).`;
      const conteudo = `LIVRO DA CAMPANHA:\n${livroRef.current || "(vazio)"}\n\nCÂNONE:\n${formatarCanone(canoneRef.current)}\n\nHERÓI HOJE: nível ${personagem.nivel}; atributos ${JSON.stringify(personagem.atributos)}; classe ${personagem.classe || "—"}; ${(personagem.dadivas || []).length} dádivas épicas.\nCONTADORES REAIS DO SISTEMA (a verdade dos feitos): ${JSON.stringify(contRef.current)}\nDOMÍNIOS: ${dominiosDe(mapaRef.current).length} · fama ${Math.round(famaAtual())}/100 · dia ${diaRef.current} da campanha.`;
      const r = await chamarModelo(sys, [{ role: "user", content: conteudo }], 800, "json", "leve");
      const j = parseObjetoTolerante(r);
      if (!j || j.nivel == null) throw new Error("o arquivista não respondeu com números");
      const nivel = Math.min(20, Math.max(1, Math.round(j.nivel)));
      const at = { ...personagem.atributos };
      for (const k of Object.keys(at)) if (j.atributos && j.atributos[k] != null) at[k] = Math.min(5, Math.max(0, Math.round(j.atributos[k])));
      const vidaMax = pvEsperadoJogador(nivel, at.vigor);
      const manaMax = 8 + (nivel - 1) * 2 + at.intelecto * 2;
      /* v8.3: a recalibração agora entende as regras novas — dádivas épicas
         no ápice e a proficiência que o sistema soma por cima. */
      const dadivas = nivel >= 20 ? Math.min(6, Math.max(0, Math.round(Number(j.dadivas) || 0))) : 0;
      setRecal({ proposta: { nivel, atributos: at, vidaMax, manaMax, dadivas, prof: bonusProficiencia(nivel) }, justificativa: j.justificativa || "" });
    } catch (e) {
      pushMsgs([{ autor: "sistema", texto: `⚠ Não consegui recalibrar: ${e.message}` }]);
      setRecal(null);
    }
  };
  const aplicarRecalibragem = () => {
    const p = recal && recal.proposta;
    if (!p) return;
    const msgsRec = [];
    setPersonagem((old) => {
      let np = { ...old, nivel: p.nivel, atributos: p.atributos, vidaMax: p.vidaMax, manaMax: p.manaMax, vida: p.vidaMax, mana: p.manaMax, xp: 0 };
      /* dádivas épicas propostas: concedidas pelo sistema, uma a uma */
      const faltam = Math.max(0, (p.dadivas || 0) - (old.dadivas || []).length);
      if (faltam > 0) { np.dadivasPendentes = (np.dadivasPendentes || 0) + faltam; np = concederDadivas(np, msgsRec); }
      return np;
    });
    pushMsgs([
      { autor: "sistema", texto: `⚖ Lenda recalibrada: nível ${p.nivel}, PV ${p.vidaMax}, PM ${p.manaMax}, proficiência +${p.prof}. Seus números agora honram seus feitos.` },
      ...msgsRec.map((t) => ({ autor: "sistema", texto: t })),
    ]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Recalibração de save: meus números oficiais agora são nível ${p.nivel}, PV ${p.vidaMax}, PM ${p.manaMax}, proficiência +${p.prof}${p.dadivas ? `, ${p.dadivas} dádivas épicas` : ""} — coerentes com tudo que já vivi. Trate-os como verdade daqui em diante.`;
    setRecal(null);
    setTimeout(() => checarConquistas(), 0);
  };

  /* RECALIBRAR MUNDO: o irmão do "recalibrar lenda" para os SISTEMAS que o
     save antigo não conhecia — companheiros (nível/classe), pessoas (fichas),
     potências e tratados, cidades dominadas e o nível da guilda. O arquivista
     relê livro e cânone e PROPÕE o estado; o jogador confirma antes de aplicar. */
  const [recalM, setRecalM] = useState(null); // null | "pedindo" | { proposta, justificativa }
  const [recalAsc, setRecalAsc] = useState(null); // null | "pedindo" | { proposta, justificativa }
  const recalibrarMundo = async () => {
    if (bloqueado || recalM === "pedindo") return;
    setAba(null);
    setRecalM("pedindo");
    try {
      const sys = `Você é o ARQUIVISTA da campanha "${nomeCampanha}". O save é antigo: os sistemas de gestão (guilda, domínios, diplomacia, fichas de pessoas) e os números dos companheiros ficaram para trás da história. Leia o LIVRO e o CÂNONE e proponha o estado JUSTO de hoje, baseando-se SÓ no que aconteceu. Responda SOMENTE JSON:
{"justificativa":"2-3 frases",
 "companheiros":[{"nome":"(exatamente como no grupo)","nivel":1-20,"classe":"","subclasse":"","conceito":""}],
 "npcs":[{"nome":"","papel":"","relacao":"aliado|amigo|romance|familia|neutro|rival|inimigo","genero":"","local":"","status":"vivo|morto|desaparecido","notas":""}],
 "faccoes":[{"nome":"","tipo":"guilda|reino|culto|cla|corporacao","lider":"","relacao":"jogador|aliada|neutra|inimiga","tratado":"nenhum|comercio|alianca|vassalagem|guerra","poder":"menor|regional|grande|imperio","notas":"","doJogador":false}],
 "cidades":[{"nome":"","tipo":"vila|cidade|capital|fortaleza","regiao":"","relacao":"jogador|aliada|neutra|hostil","sede":false}],
 "guildaNivel":1-5}
Regras: nível dos companheiros coerente com o tempo de estrada e os feitos (quem acompanha um herói nível ${personagem.nivel} desde o início NÃO está no nível 1); marque doJogador=true SÓ na facção que o herói lidera; cidades com relacao "jogador" são as que ele domina; inclua só pessoas/facções/cidades que EXISTEM na história.
SEJA BREVE para não cortar o JSON: notas com no máximo 8 palavras, sem descrições longas; limites — até 12 npcs, 8 facções, 12 cidades. Se houver mais, escolha os mais importantes.`;
      const conteudo = `LIVRO DA CAMPANHA:\n${livroRef.current || "(vazio)"}\n\nCÂNONE:\n${formatarCanone(canoneRef.current)}\n\nGRUPO HOJE: ${(personagem.grupo || []).map((g) => `${g.nome} (nível ${g.nivel ?? 1})`).join(", ") || "sem companheiros"}\nMAPA HOJE: ${(mapaRef.current.cidades || []).map((c) => c.nome).join(", ") || "vazio"}\nFACÇÕES HOJE: ${(mapaRef.current.faccoes || []).map((f) => f.nome).join(", ") || "nenhuma"}\nPESSOAS HOJE: ${Object.keys(npcsRef.current).join(", ") || "ninguém"}`;
      const r = await chamarModelo(sys, [{ role: "user", content: conteudo }], 3000, "json", "leve");
      const j = parseObjetoTolerante(r);
      if (!j) throw new Error("o arquivista não respondeu com o estado do mundo");
      setRecalM({ proposta: j, justificativa: j.justificativa || "" });
    } catch (e) {
      pushMsgs([{ autor: "sistema", texto: `⚠ Não consegui recalibrar o mundo: ${e.message}` }]);
      setRecalM(null);
    }
  };

  const aplicarRecalMundo = () => {
    const j = recalM && recalM.proposta;
    if (!j) return;
    const msgs = [];
    /* 1) Companheiros: nível, classe e ficha (PV recalculado pela mesma regra do grupo) */
    if (Array.isArray(j.companheiros) && j.companheiros.length) {
      setPersonagem((old) => ({
        ...old,
        grupo: (old.grupo || []).map((g) => {
          const p = j.companheiros.find((x) => (x.nome || "").toLowerCase() === g.nome.toLowerCase());
          if (!p) return g;
          const nivel = Math.min(20, Math.max(1, Math.round(p.nivel || g.nivel || 1)));
          const vidaMax = Math.max(g.vidaMax || 10, 10 + (nivel - 1) * 3);
          msgs.push(`⚑ ${g.nome}: nível ${g.nivel ?? 1} → ${nivel}${p.classe ? `, ${p.classe}${p.subclasse ? ` ${p.subclasse}` : ""}` : ""}`);
          return { ...g, nivel, vidaMax, vida: vidaMax, classe: p.classe || g.classe, subclasse: p.subclasse || g.subclasse, conceito: p.conceito || g.conceito };
        }),
      }));
    }
    /* 2) Pessoas: fichas dos NPCs importantes da história */
    let reg = npcsRef.current, tocouN = false;
    (j.npcs || []).forEach((n) => {
      if (!n || !n.nome) return;
      const chave = Object.keys(reg).find((k) => k.toLowerCase() === n.nome.toLowerCase());
      const ficha = chave ? mesclarNPC(reg[chave], n) : criarNPC(n.nome, n);
      if (!tocouN) { reg = { ...reg }; tocouN = true; }
      reg[chave || n.nome] = ficha;
    });
    if (tocouN) { npcsRef.current = reg; setNpcs(reg); msgs.push(`👥 ${(j.npcs || []).filter((n) => n && n.nome).length} pessoa(s) recalibrada(s) no elenco`); }
    /* 3) Potências e cidades: mesmo merge do mapa usado nas respostas do Mestre */
    let mp = { ...mapaRef.current, cidades: [...(mapaRef.current.cidades || [])], faccoes: [...(mapaRef.current.faccoes || [])] };
    mp = garantirGeografia(mp, "taverna|recal");
    (j.cidades || []).forEach((cd) => {
      if (!cd || !cd.nome) return;
      const i = mp.cidades.findIndex((c) => c.nome.toLowerCase() === cd.nome.toLowerCase());
      if (i === -1) mp.cidades.push(criarCidade(cd.nome, cd));
      else mp.cidades[i] = { ...mp.cidades[i], ...cd, x: mp.cidades[i].x, y: mp.cidades[i].y };
    });
    (j.faccoes || []).forEach((fc) => {
      if (!fc || !fc.nome) return;
      const i = mp.faccoes.findIndex((f) => f.nome.toLowerCase() === fc.nome.toLowerCase());
      if (i === -1) mp.faccoes.push(criarFaccao(fc.nome, fc));
      else mp.faccoes[i] = { ...mp.faccoes[i], ...fc };
      if (fc.doJogador) faccaoJogadorRef.current = fc.nome;
    });
    mapaRef.current = mp; setMapa(mp);
    if ((j.cidades || []).length || (j.faccoes || []).length) msgs.push(`🗺 ${(j.cidades || []).length} cidade(s) e ${(j.faccoes || []).length} potência(s) recalibradas`);
    /* 4) Nível da guilda (cofre preservado) */
    if (j.guildaNivel) {
      const gn = Math.min(NIVEL_GUILD_MAX, Math.max(1, Math.round(j.guildaNivel)));
      if (gn !== guildaRef.current.nivel) { const g = { ...guildaRef.current, nivel: gn }; guildaRef.current = g; setGuilda(g); msgs.push(`🏛 Guilda recalibrada para o nível ${gn}`); }
    }
    /* 5) O prompt precisa enxergar o mundo novo já no próximo turno */
    systemRef.current = montarSystemPrompt(nomeCampanha, mundo, personagem, livroRef.current, canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade(), infoTitulo());
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Recalibração de save: o estado do mundo (guilda, domínios, potências, pessoas, companheiros) foi atualizado para refletir tudo que já aconteceu. Trate os registros atuais como verdade.`;
    pushMsgs(msgs.map((t) => ({ autor: "sistema", texto: t })).concat([{ autor: "sistema", texto: "⚖ Mundo recalibrado. Confira Gestão: Grupo, Pessoas, Guilda, Domínios e Diplomacia agora contam a sua história." }]));
    setRecalM(null);
    setTimeout(() => checarConquistas(), 0);
  };

  /* RECALIBRAR ASCENSÃO (v7.4.1): saves onde a história JÁ fez do herói uma
     divindade chegaram antes do sistema existir. O arquivista relê livro e
     cânone e propõe o estado divino JUSTO — o sistema aplica com tetos. */
  /* v8.3: a recalibração de ascensão passa a conhecer os caminhos (fé,
     deicídio, relíquia) e a régua nova de nível por grau. */
  const recalibrarAscensao = async () => {
    if (bloqueado || recalAsc === "pedindo") return;
    setAba(null);
    setRecalAsc("pedindo");
    try {
      const dv = divindadeRef.current || garantirDivindade(null);
      const sys = `Você é o ARQUIVISTA da campanha "${nomeCampanha}". O sistema de ASCENSÃO (graus divinos GD 0-4) chegou depois: a história pode já ter feito do herói algo divino, ou ele pode ser só um mortal lendário. Leia o LIVRO e o CÂNONE e proponha o estado divino JUSTO, baseando-se SÓ no que aconteceu de fato. Responda SOMENTE JSON:
{"justificativa":"2-3 frases citando os feitos que fundamentam",
 "desperto": true/false,
 "estagio": 0-3,
 "gd": 0-4,
 "fieis": número,
 "pf": número,
 "dominio": "uma palavra (ex.: Tempestade, Forja, Vingança) ou vazio",
 "patrono": "divindade que o patrocina, se houver, ou vazio",
 "caminho": "fe" | "deicidio" | "reliquia" (COMO ele ascendeu — deicidio se matou uma divindade e tomou o domínio, reliquia se drenou uma fonte antiga por ritual, fe se acumulou culto),
 "divindades": [{"nome":"","dominio":"","gd":2-4,"temperamento":"","culto":""}]}
ESCALA DE FATOS (não de vibes): gd 0 = mortal, mesmo lendário; gd 1 = herói cultuado localmente (mil fiéis); gd 2 = semideus, cultos em várias cidades (10 mil); gd 3 = divindade menor, templos, milagres atendidos (100 mil); gd 4 = divindade maior, religião continental (1 milhão). TETO POR NÍVEL (regra dura do sistema — nunca proponha acima disso): o herói é nível ${personagem.nivel}, então o GD máximo possível hoje é ${gdMaximoPorNivel(personagem.nivel || 1)} (nv15-16 → GD 1; nv17-18 → GD 2; nv19 → GD 3; nv20 → GD 4). Só marque desperto=true se o nível é ≥ 15 E há sinais de culto/poder divino na história. fieis e pf coerentes com o gd proposto (mínimos: gd1≥1000, gd2≥10000, gd3≥100000, gd4≥1000000). Se a história NÃO mostra divindade nenhuma no mundo, devolva "divindades": []. Máx. 6 divindades, só as que EXISTEM na história.`;
      const conteudo = `LIVRO DA CAMPANHA:\n${livroRef.current || "(vazio)"}\n\nCÂNONE:\n${formatarCanone(canoneRef.current)}\n\nHERÓI: ${personagem.nome}, nível ${personagem.nivel}, ${patamarDe(personagem.nivel).nome}\nASCENSÃO REGISTRADA HOJE: desperto=${dv.despertar ? "sim" : "não"}, ${dv.fieis} fiéis, ${dv.pf} PF, GD ${grauDe(dv)}, domínio "${dv.dominio || "—"}", patrono "${dv.patrono || "—"}", panteão: ${(dv.panteao || []).map((d) => `${d.nome} (GD ${d.gd})`).join(", ") || "vazio"}`;
      const r = await chamarModelo(sys, [{ role: "user", content: conteudo }], 2500, "json", "leve");
      const j = parseObjetoTolerante(r);
      if (!j) throw new Error("o arquivista não respondeu com o estado da ascensão");
      setRecalAsc({ proposta: j, justificativa: j.justificativa || "" });
    } catch (e) {
      pushMsgs([{ autor: "sistema", texto: `⚠ Não consegui recalibrar a ascensão: ${e.message}` }]);
      setRecalAsc(null);
    }
  };

  const aplicarRecalAscensao = () => {
    const j = recalAsc && recalAsc.proposta;
    if (!j) return;
    const dv = { ...(divindadeRef.current || garantirDivindade(null)) };
    const msgs = [];
    /* TETO DE SEGURANÇA: gd 0-4, fiéis 0-2M, pf 0-500 — o mínimo do degrau é garantido por código */
    let gd = Math.max(0, Math.min(4, Math.round(j.gd || 0)));
    if (!j.desperto) gd = 0;
    /* v8.3: o teto por nível vale também aqui — fé sem poder não faz deus */
    const tetoGd = gdMaximoPorNivel(personagem.nivel || 1);
    if (gd > tetoGd) { msgs.push(`⛓ O arquivista propôs GD ${gd}, mas o nível ${personagem.nivel} comporta no máximo GD ${tetoGd} — ajustado.`); gd = tetoGd; }
    if (["fe", "deicidio", "reliquia"].includes(String(j.caminho || "").toLowerCase())) {
      dv.caminho = String(j.caminho).toLowerCase();
      if (dv.caminho !== "fe") msgs.push(`🌟 Caminho reconhecido: ${caminhoPorId(dv.caminho).nome}.`);
    }
    /* PF e fé passam a render por dia — alinha o marco para não minguar já */
    dv.ultimoFeitoDia = diaRef.current;
    let fieis = Math.max(0, Math.min(2000000, Math.round(j.fieis || 0)));
    if (gd > 0) fieis = Math.max(fieis, GRAUS[gd].fieis);
    const pf = Math.max(0, Math.min(500, Math.round(j.pf || 0)));
    dv.despertar = !!j.desperto && (personagem.nivel || 1) >= NIVEL_DESPERTAR;
    if (!dv.despertar) { setRecalAsc(null); pushMsgs([{ autor: "sistema", texto: "⚖ O arquivista não encontrou sinais de divindade na sua lenda — a ascensão segue o curso normal." }]); return; }
    const antes = grauDe(dv);
    /* v8.9: a fé que o arquivista encontrou na lenda é ANCORADA no mapa —
       espalhada pelas cidades conforme a população, não guardada num número. */
    {
      const falta = Math.max(0, fieis - fieisTotais(mapaRef.current, devocaoRef.current));
      const devNova = espalharFieis(garantirDevocao(devocaoRef.current, mapaRef.current, dv), mapaRef.current, falta, 70);
      devocaoRef.current = devNova; setDevocao(devNova);
      fieis = Math.max(fieis, fieisTotais(mapaRef.current, devNova));
    }
    dv.fieis = fieis; dv.pf = pf;
    if (j.estagio != null) dv.estagio = Math.max(0, Math.min(3, Math.round(j.estagio)));
    if (j.dominio && !dv.dominio) dv.dominio = String(j.dominio).slice(0, 40);
    if (j.patrono && !dv.patrono) dv.patrono = String(j.patrono).slice(0, 60);
    /* Panteão: mescla por nome — os já registrados pelo sistema não são reescritos */
    const pan = [...(dv.panteao || [])];
    (Array.isArray(j.divindades) ? j.divindades : []).slice(0, 6).forEach((d) => {
      if (!d || !d.nome) return;
      const gdD = Math.max(2, Math.min(4, Math.round(d.gd || 2)));
      const i = pan.findIndex((x) => (x.nome || "").toLowerCase() === String(d.nome).toLowerCase());
      const ficha = { nome: String(d.nome).slice(0, 40), dominio: String(d.dominio || "").slice(0, 40), gd: gdD, temperamento: String(d.temperamento || "").slice(0, 60), culto: String(d.culto || "").slice(0, 60), fieis: GRAUS[gdD].fieis, icone: "🌌", reveladaDia: diaRef.current };
      if (i === -1) pan.push(ficha); else pan[i] = { ...pan[i], ...ficha, icone: pan[i].icone };
    });
    dv.panteao = pan.slice(0, 8);
    divindadeRef.current = dv; setDivindade(dv);
    const depois = grauDe(dv);
    msgs.push(`🌟 Ascensão recalibrada: GD ${antes} → GD ${depois} · ${tituloDe(depois)} · ${dv.fieis.toLocaleString("pt-BR")} fiéis · ${dv.pf} PF`);
    if (dv.dominio) msgs.push(`🌌 Domínio: ${dv.dominio}`);
    if (pan.length) msgs.push(`🏛 Panteão: ${pan.map((d) => `${d.nome} (GD ${d.gd})`).join(", ")}`);
    /* O Mestre precisa TRATAR isso como fato já no próximo turno */
    systemRef.current = montarSystemPrompt(nomeCampanha, mundo, personagem, livroRef.current, canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade(), infoTitulo());
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[ASCENSÃO — RECALIBRAÇÃO DO SISTEMA] O estado divino do herói foi alinhado com a história já jogada: GD ${depois} (${tituloDe(depois)}), ${dv.fieis} fiéis, ${dv.pf} PF${dv.dominio ? `, domínio ${dv.dominio}` : ""}${dv.patrono ? `, patrono ${dv.patrono}` : ""}. Trate como verdade estabelecida — a história já o reconhecia assim.`;
    pushMsgs(msgs.map((t) => ({ autor: "sistema", texto: t })));
    setRecalAsc(null);
    salvar({ personagem });
  };

  /* Transfere um item entre você e um companheiro (qualquer direção). */
  const transferirItem = (de, para, origem, nomeIt) => {
    const p = personagem;
    const igual = (x) => ((typeof x === "string" ? x : (x && x.nome) || "").toLowerCase() === nomeIt.toLowerCase());
    let np = { ...p, grupo: [...(p.grupo || [])] };
    let item = null;
    if (de === "eu") {
      const arr = [...(np[origem] || [])];
      const i = arr.findIndex(igual);
      if (i < 0) return;
      item = arr.splice(i, 1)[0];
      np[origem] = arr;
      const gi = np.grupo.findIndex((g) => g.nome === para);
      if (gi < 0) return;
      /* equipamentos vão para a mochila de equipamentos do companheiro (ele pode equipar) */
      const ehEquipDar = item && typeof item === "object" && item.tipo && item.raridade;
      np.grupo[gi] = ehEquipDar
        ? { ...np.grupo[gi], equipamento: [...(np.grupo[gi].equipamento || []), item] }
        : { ...np.grupo[gi], inventario: [...(np.grupo[gi].inventario || []), item] };
    } else {
      const gi = np.grupo.findIndex((g) => g.nome === de);
      if (gi < 0) return;
      /* procura primeiro na bolsa comum, depois na mochila de equipamentos */
      let arr = [...(np.grupo[gi].inventario || [])];
      let i = arr.findIndex(igual);
      let eraEquip = false;
      if (i < 0) {
        arr = [...(np.grupo[gi].equipamento || [])];
        i = arr.findIndex(igual);
        eraEquip = i >= 0;
      }
      if (i < 0) return;
      item = arr.splice(i, 1)[0];
      np.grupo[gi] = eraEquip ? { ...np.grupo[gi], equipamento: arr } : { ...np.grupo[gi], inventario: arr };
      const ehEquip = item && typeof item === "object" && item.tipo && item.raridade;
      if (ehEquip) np.equipamento = [...(np.equipamento || []), item]; else np.inventario = [...(np.inventario || []), item];
    }
    /* VÍNCULO: dar um item a um companheiro é um gesto que conta (+8) */
    if (de === "eu" && para !== "eu") np = { ...np, grupo: aplicarVinculo(np.grupo, para, 8, null) };
    setPersonagem(np);
    const nomeFinal = typeof item === "string" ? item : (item && item.nome) || "item";
    const deTxt = de === "eu" ? "você" : de, paraTxt = para === "eu" ? "você" : para;
    pushMsgs([{ autor: "sistema", texto: `◆ ${nomeFinal}: ${deTxt} → ${paraTxt}` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Transferi "${nomeFinal}" de ${deTxt} para ${paraTxt}.`;
  };

  const gerarCronica = async () => {
    const narrativas = mensagens.filter((m) => m.autor === "mestre").map((m) => m.texto).slice(-14).join("\n\n");
    if (!narrativas) return;
    setCronica("gerando");
    try {
      const r = await chamarModelo(
        `Você é o cronista da Taverna. A partir dos trechos de uma campanha de RPG, escreva uma CRÔNICA épica e concisa (máx 130 palavras) em português, em tom de lenda contada à beira do fogo — heroica, evocativa. Destaque um momento marcante. Responda SOMENTE com JSON: {"titulo":"...","texto":"..."}.`,
        [{ role: "user", content: `Campanha: "${nomeCampanha}".\n\nTrechos:\n${narrativas}` }],
        600,
        "json"
      );
      const limpo = (r || "").replace(/```json/gi, "").replace(/```/g, "").trim();
      const i = limpo.indexOf("{"), f = limpo.lastIndexOf("}");
      const obj = JSON.parse(limpo.slice(i, f + 1));
      setCronica({ titulo: obj.titulo || nomeCampanha, texto: obj.texto || "" });
    } catch {
      setCronica({ titulo: nomeCampanha, texto: "A crônica se perdeu na névoa. Tente novamente." });
    }
  };

  const irMenu = () => { setAba(null); setHabAbertas(false); setHabSel(null); setEntrada(""); setDadoRolando(false); setFase("menu"); };

  const bloqueado = carregando || !!rolagem;

  return (
    <div className="flex flex-col" style={{ background: T.bg, height: "100dvh", maxHeight: "100dvh", overflow: "hidden" }}>
      <style>{FONT_CSS}</style>

      <header className="flex items-center justify-between px-4 md:px-5 py-3 shrink-0 sticky top-0 z-30" style={{ borderBottom: `1px solid ${T.line}`, background: T.panel }}>
        <div className="flex items-center gap-2 min-w-0">
          {fase !== "menu" && (
            <button onClick={irMenu} className="rounded-lg p-1.5 shrink-0" style={{ border: `1px solid ${T.line}` }} title="Início">
              <IconeCaneca tamanho={18} cor={T.amberSoft} />
            </button>
          )}
          <span className="tv-display text-xl tracking-wide ml-1 shrink-0" style={{ color: T.ink }}>{BRAND}</span>
          {fase === "jogo" && nomeCampanha && <span className="tv-mono text-[10px] uppercase tracking-widest truncate hidden sm:inline" style={{ color: T.inkDim }}>· {nomeCampanha}</span>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {fase === "jogo" && personagem && (
            <button onClick={() => setAba("ficha")} className="shrink-0" title="Abrir ficha">
              <Retrato semente={sementeDe(personagem)} tamanho={32} anel={T.amber} estado={estadoDe(personagem.vida, personagem.vidaMax)} />
            </button>
          )}
          {fase === "jogo" && statusSave && <span className="tv-mono text-[10px] uppercase tracking-wider" style={{ color: statusSave === "erro" ? T.danger : T.inkDim }}>{statusSave === "salvando" ? "salvando…" : statusSave === "erro" ? "⚠ FALHA AO SALVAR" : "✓ salvo"}</span>}
          {fase === "jogo" && !acampado && <button onClick={acampar} disabled={bloqueado} className="rounded-lg p-1.5" style={{ border: `1px solid ${T.line}` }} title="Montar acampamento"><span style={{ color: T.amberSoft, fontSize: 15 }}>⛺</span></button>}
          {fase === "jogo" && <button onClick={() => setMostrarRolagens((v) => !v)} className="rounded-lg p-1.5" style={{ border: `1px solid ${mostrarRolagens ? T.amber : T.line}` }} title={mostrarRolagens ? "Rolagens de combate: visíveis" : "Rolagens de combate: ocultas"}><span style={{ color: mostrarRolagens ? T.amberSoft : T.inkDim, fontSize: 13 }}>🎲</span></button>}
          {fase === "jogo" && <button onClick={gerarCronica} className="rounded-lg p-1.5" style={{ border: `1px solid ${T.line}` }} title="Gerar crônica"><span style={{ color: T.amberSoft, fontSize: 15 }}>📜</span></button>}
        </div>
      </header>

      {fase === "menu" && <div className="flex-1 min-h-0 overflow-y-auto tv-scroll flex flex-col"><TelaMenu irNovo={() => setFase("mundo")} continuar={continuar} temSave={temSave} /></div>}
      {fase === "mundo" && <div className="flex-1 min-h-0 overflow-y-auto tv-scroll"><TelaMundo concluir={(m, nome) => { setMundo(m); setNomeCampanha(nome); setFase("personagem"); }} /></div>}
      {fase === "personagem" && <div className="flex-1 min-h-0 overflow-y-auto tv-scroll"><TelaPersonagem mundo={mundo} concluir={iniciar} /></div>}

      {fase === "jogo" && personagem && (
        <div className="flex flex-1 min-h-0 relative">
          <main className="flex-1 flex flex-col min-w-0">
            <div ref={areaRef} onScroll={aoRolar} className="tv-scroll flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4" style={{ paddingRight: "68px" }}>
              {mensagens.map((m, i) => {
                if (m.autor === "sistema") return <div key={i} className="tv-fade flex justify-center"><span className="tv-mono text-xs px-3 py-1.5 rounded-full text-center" style={{ background: T.panelSoft, color: T.violetSoft }}>{m.texto}</span></div>;
                if (m.autor === "jogador") return <div key={i} className="tv-fade flex justify-end"><div className="max-w-[85%] md:max-w-[70%] rounded-2xl rounded-br-sm px-4 py-3 tv-body text-[15px]" style={{ background: T.panelSoft, color: T.ink, border: `1px solid ${T.line}` }}>{m.texto}</div></div>;
                return (
                  <div key={i} className="tv-fade max-w-[95%] md:max-w-[82%]">
                    <div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-1.5" style={{ color: T.amber }}>
                      <IconeD20 tamanho={13} /> Mestre
                      <button
                        onClick={() => ouvirMestre(i, m.texto)}
                        title={voz && voz.i === i ? (voz.status === "gerando" ? "Preparando a voz… (toque para cancelar)" : "Parar a leitura") : "Ouvir o Mestre narrar esta mensagem"}
                        className="ml-1 normal-case tracking-normal rounded-full flex items-center justify-center"
                        style={{
                          width: 22, height: 22, fontSize: 12, lineHeight: 1,
                          color: voz && voz.i === i ? T.onAccent : T.inkDim,
                          background: voz && voz.i === i ? T.amber : "transparent",
                          border: `1px solid ${voz && voz.i === i ? T.amber : T.line}`,
                          opacity: 0.9,
                        }}
                      >
                        {voz && voz.i === i ? (voz.status === "gerando" ? "…" : "⏸") : "🔊"}
                      </button>
                    </div>
                    <div className="tv-body text-[15px] leading-relaxed whitespace-pre-wrap rounded-2xl rounded-tl-sm px-5 py-4" style={{ background: T.panel, color: T.ink, borderLeft: `2px solid ${T.amber}` }}>{m.texto}</div>
                  </div>
                );
              })}
              {carregando && <div className="tv-fade tv-mono text-xs flex items-center gap-2" style={{ color: T.inkDim }}><span className="tv-dice inline-flex"><IconeD20 tamanho={16} cor={T.inkDim} /></span> O Mestre tece o destino…</div>}
              {falha && !carregando && (
                <div className="tv-fade flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-3 rounded-full pl-4 pr-2 py-2" style={{ background: T.panel, border: `1px solid ${T.danger}` }}>
                    <span className="tv-mono text-xs" style={{ color: T.danger }}>O Mestre não respondeu.</span>
                    <Botao primario pequeno onClick={retentar}>Tentar de novo</Botao>
                  </div>
                  {falha.motivo && <span className="tv-mono text-[10px] px-4 text-center" style={{ color: T.inkDim }}>{falha.motivo}</span>}
                </div>
              )}
            {combate && <PainelCombate combate={combate} onEncerrarTurno={encerrarTurnoCombate}
              nGolpes={ataquesPorTurno(personagem.classe, personagem.nivel || 1)}
              alvosGolpe={alvosGolpe}
              acaoTexto={resumoAcaoDeTurno(personagem.classe, personagem.nivel || 1).texto}
              onDeclararAlvo={(i, nome) => { const a = [...alvosGolpeRef.current]; a[i] = nome; alvosGolpeRef.current = a; setAlvosGolpe([...a]); }}
              onLimparAlvos={() => { alvosGolpeRef.current = []; setAlvosGolpe([]); }}
              pocoes={pocoesNaBolsa} onUsarConsumivel={usarConsumivelUI} />}

            {/* v9.4: as sugestões de ação saíram. Numa mesa de verdade o Mestre
                não entrega três opções prontas — ele descreve a cena e espera. */}
            {habAbertas && <PainelHabilidades personagem={personagem} selecionar={(h) => { setHabSel(h); setHabAbertas(false); }} fechar={() => setHabAbertas(false)} />}
            {acoesAbertas && (
              <div className="px-4 md:px-8 pb-2 shrink-0" style={{ paddingRight: "68px" }}>
                <div className="rounded-2xl p-3" style={{ background: T.panel, border: `1px solid ${T.amber}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.amberSoft }}>Ações — toque para preencher e complete o alvo</span>
                    <button onClick={() => setAcoesAbertas(false)} className="tv-mono text-[10px] px-2" style={{ color: T.inkDim }}>✕</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ACOES_PRONTAS.map((a) => (
                      <button key={a.rotulo} onClick={() => { setEntrada(a.texto); setAcoesAbertas(false); }} className="tv-mono text-[11px] px-2.5 py-1.5 rounded-lg" style={{ background: T.panelSoft, color: T.ink, border: `1px solid ${T.line}` }}>
                        {a.icone} {a.rotulo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {habSel && !rolagem && (
              <div className="tv-fade px-4 md:px-8 pb-1.5" style={{ paddingRight: "68px" }}>
                <div className="inline-flex items-center gap-2 rounded-full pl-3.5 pr-1.5 py-1.5" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
                  <span className="tv-mono text-xs" style={{ color: T.violetSoft }}>✦ {habSel.nome} · {habSel.custo} PM</span>
                  <button onClick={() => setHabSel(null)} className="tv-mono text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ background: T.line, color: T.inkDim }}>✕</button>
                </div>
              </div>
            )}

            {masmorra && !acampado && (() => {
              const prog = progressoMasmorra(masmorra);
              const salaAtual = masmorra.salas.find((x) => x.id === masmorra.atual);
              const saidas = saidasDe(masmorra);
              const recuos = saidasDeRecuo(masmorra);
              const escuro = noEscuro(masmorra);
              return (
              <div className="tv-fade mx-4 md:mx-8 mb-2 rounded-2xl p-3.5" style={{ background: T.panel, border: `1px solid ${escuro ? T.danger : T.violet}`, marginRight: "68px" }}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="tv-mono text-[10px] uppercase tracking-widest truncate" style={{ color: T.violetSoft }}>🕳 {masmorra.nome}</div>
                  <div className="tv-mono text-[10px] shrink-0 flex items-center gap-2">
                    <span style={{ color: escuro ? T.danger : T.amberSoft }}>🕯 {masmorra.tochas}</span>
                    {masmorra.chave && <span style={{ color: T.amber }}>🗝</span>}
                    <span style={{ color: T.inkDim }}>{prog.visitadas}/{prog.total}</span>
                  </div>
                </div>
                <div className="tv-body text-[11px] mb-2" style={{ color: escuro ? T.danger : T.inkDim }}>
                  {escuro ? "Sem tochas — vocês avançam às cegas, em desvantagem." : `Você está em: ${ICONE_SALA[salaAtual?.tipo] || ""} ${ROTULO_SALA[salaAtual?.tipo] || "—"}${salaAtual && !salaAtual.resolvida && salaAtual.tipo !== "entrada" ? " (ainda não resolvida)" : ""}`}
                </div>
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  {RITMOS.map((r) => (
                    <button key={r.id} onClick={() => mudarRitmo(r.id)} disabled={bloqueado || !!combate}
                      className="tv-mono text-[10px] px-2 py-1 rounded-full"
                      style={{ background: masmorra.ritmo === r.id ? T.violet : "transparent", color: masmorra.ritmo === r.id ? T.onSecond : T.inkDim, border: `1px solid ${masmorra.ritmo === r.id ? T.violet : T.line}`, opacity: (bloqueado || combate) ? 0.45 : 1 }}
                      title={`${r.desc} · ${r.minutos} min por sala`}>
                      {r.icone} {r.nome}
                    </button>
                  ))}
                  <span className="tv-mono text-[10px] ml-auto" style={{ color: T.amberSoft }}>
                    👁 passiva {percepcaoPassiva(atributoEfetivo(personagem, "percepcao"), masmorra.ritmo)}
                  </span>
                </div>
                <button onClick={buscarNaSala} disabled={bloqueado || !!combate}
                  className="w-full tv-mono text-[11px] px-3 py-2 rounded-lg mb-2"
                  style={{ background: T.panelSoft, color: T.amberSoft, border: `1px solid ${T.amber}`, opacity: (bloqueado || combate) ? 0.45 : 1 }}>
                  🔎 Procurar nesta sala <span style={{ color: T.inkDim }}>(10 min · rolagem de Percepção)</span>
                </button>
                <div className="tv-mono text-[9px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Passagens</div>
                <div className="space-y-1.5">
                  {saidas.length === 0 && <div className="tv-body text-xs italic" style={{ color: T.inkDim }}>Sem saídas adiante — só resta voltar ou sair.</div>}
                  {saidas.map((sd) => (
                    <button key={sd.id} onClick={() => irParaSala(sd.id)} disabled={bloqueado || !!combate || sd.trancada}
                      className="w-full text-left rounded-lg px-3 py-2 flex items-center gap-2.5"
                      style={{ background: sd.trancada ? "transparent" : T.panelSoft, border: `1px solid ${sd.trancada ? T.line : T.violet}`, opacity: (bloqueado || combate) ? 0.45 : sd.trancada ? 0.55 : 1 }}>
                      <span style={{ fontSize: 14 }}>{sd.visitada ? (ICONE_SALA[sd.tipo] || "·") : sd.trancada ? "🔒" : "❔"}</span>
                      <span className="flex-1 min-w-0">
                        <span className="tv-body text-sm block" style={{ color: T.ink }}>
                          {sd.visitada ? (ROTULO_SALA[sd.tipo] || "Passagem") : "Passagem desconhecida"}
                        </span>
                        <span className="tv-body text-[11px] block" style={{ color: T.inkDim }}>
                          {sd.trancada ? "portão lacrado — falta a chave" : sd.pista}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-2.5 flex-wrap">
                  {recuos.map((rc) => (
                    <button key={`v${rc.id}`} onClick={() => irParaSala(rc.id)} disabled={bloqueado || !!combate} className="tv-mono text-[10px] px-2.5 py-1.5 rounded-lg" style={{ border: `1px solid ${T.line}`, color: T.inkDim, opacity: (bloqueado || combate) ? 0.45 : 1 }}>
                      ↩ voltar ({ROTULO_SALA[rc.tipo] || "sala"})
                    </button>
                  ))}
                  <button onClick={sairDaMasmorra} disabled={bloqueado || !!combate} title="Sair leva o que você já conquistou; o resto fica para trás" className="tv-mono text-[10px] px-2.5 py-1.5 rounded-lg ml-auto" style={{ border: `1px solid ${T.danger}`, color: T.danger, opacity: (bloqueado || combate) ? 0.45 : 1 }}>🏃 sair</button>
                </div>
                <div className="tv-body text-[11px] mt-2" style={{ color: T.inkDim }}>Cada passagem gasta uma tocha. Você escolhe o caminho pelas pistas — e o portão do chefe só abre com a chave que alguém guarda lá dentro.</div>
              </div>
              );
            })()}

            {acampado && (
              <div className="tv-fade mx-4 md:mx-8 mb-2 rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.amber}`, marginRight: "68px" }}>
                <div className="tv-mono text-xs uppercase tracking-widest mb-1" style={{ color: T.amberSoft }}>⛺ Acampamento — o tempo está pausado</div>
                <div className="tv-body text-sm mb-3" style={{ color: T.inkDim }}>Converse com o grupo à vontade. Quando quiser retomar a jornada, escolha um descanso:</div>
                <div className="flex flex-wrap gap-2">
                  <Botao pequeno onClick={() => sairDoAcampamento("curto")} desativado={bloqueado}>🔥 Descanso curto <span style={{ opacity: 0.7 }}>· recupera parte</span></Botao>
                  <Botao primario pequeno onClick={() => sairDoAcampamento("longo")} desativado={bloqueado}>🌙 Descanso longo <span style={{ opacity: 0.7 }}>· recupera tudo</span></Botao>
                </div>
              </div>
            )}

            <div className="px-4 md:px-8 flex items-center gap-3 md:gap-4 pb-1.5 flex-wrap" style={{ paddingRight: "68px" }}>
              <BarraMini rotulo="PV" atual={personagem.vida} max={personagem.vidaMax} cor={T.amber} corBaixa={T.danger} />
              <BarraMini rotulo="PM" atual={personagem.mana} max={personagem.manaMax} cor={T.violet} />
              <span className="tv-mono text-[10px] shrink-0" style={{ color: T.amberSoft }}>NV {personagem.nivel}</span>
              <span className="tv-mono text-[10px] shrink-0" title={`${estacaoDe(dia).nome} — ${estacaoDe(dia).nota} · o app controla o relógio`} style={{ color: T.inkDim }}>📅 {dataTxt(dia)} · {horaTxt(minuto)}{ehNoite(minuto) ? " 🌙" : ""} {estacaoDe(dia).icone}</span>
              {clima && <span className="tv-mono text-[10px] shrink-0" title={clima.nota} style={{ color: T.inkDim }}>{clima.icone} {clima.rotulo}</span>}
              <BarraMini rotulo="XP" atual={personagem.xp} max={XP_POR_NIVEL(personagem.nivel)} cor={T.ok} />
            </div>

            {/* ESTADO DO HERÓI (v9.0): condições, buffs e o líquido de
                vantagem/desvantagem logo abaixo das barras — o jogador vê o
                mesmo que o Mestre lê e o mesmo que o dado vai usar. */}
            {((personagem.condicoes || []).length > 0 || (personagem.efeitos || []).length > 0) && (() => {
              const mec = mecanicaDe(personagem.condicoes || []);
              const rol = estadoDeRolagem(personagem.condicoes || []);
              return (
                <div className="px-4 md:px-8 flex items-center gap-1.5 pb-1.5 flex-wrap" style={{ paddingRight: "68px" }}>
                  {(personagem.condicoes || []).map((c, i) => (
                    <span key={`c${i}`} className="tv-mono text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" title={c.efeito || ""}
                      style={{ background: c.tipo === "bom" ? "#1f3320" : "#33201f", border: `1px solid ${c.tipo === "bom" ? T.ok : T.danger}`, color: c.tipo === "bom" ? T.ok : T.danger }}>
                      {c.icone || (c.tipo === "bom" ? "✦" : "☠")} {c.nome}{c.turnos ? <span style={{ opacity: 0.7 }}> {c.turnos}t</span> : null}
                    </span>
                  ))}
                  {(personagem.efeitos || []).map((e, i) => (
                    <span key={`e${i}`} className="tv-mono text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" title={e.descricao || ""}
                      style={{ background: "#241f33", border: `1px solid ${T.violet}`, color: T.violetSoft }}>
                      ✧ {e.nome}{e.bonus ? ` +${e.bonus}` : ""}{e.turnos ? <span style={{ opacity: 0.7 }}> {e.turnos}t</span> : null}
                    </span>
                  ))}
                  {rol.rotulo !== "neutro" && (
                    <span className="tv-mono text-[10px] px-2 py-0.5 rounded-full" title={mec.motivos.join(" · ")}
                      style={{ background: rol.vantagem ? "#1f3320" : "#33201f", border: `1px solid ${rol.vantagem ? T.ok : T.danger}`, color: rol.vantagem ? T.ok : T.danger, fontWeight: 600 }}>
                      {rol.vantagem ? "🎲 vantagem" : "🎲 desvantagem"}
                    </span>
                  )}
                  {mec.perdeAcao && (
                    <span className="tv-mono text-[10px] px-2 py-0.5 rounded-full" title="Você não age neste turno"
                      style={{ background: "#33201f", border: `1px solid ${T.danger}`, color: T.danger, fontWeight: 600 }}>⛔ sem ação</span>
                  )}
                  {mec.danoTurno > 0 && (
                    <span className="tv-mono text-[10px] px-2 py-0.5 rounded-full" title="Dano cobrado a cada turno enquanto durar"
                      style={{ background: "#33201f", border: `1px solid ${T.danger}`, color: T.danger }}>−{mec.danoTurno} PV/turno</span>
                  )}
                  {mec.danoExtra > 0 && (
                    <span className="tv-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#1f3320", border: `1px solid ${T.ok}`, color: T.ok }}>+{mec.danoExtra} dano</span>
                  )}
                </div>
              );
            })()}

            {mostrarHoras && (
              <div className="tv-fade mx-4 md:mx-8 mb-2 rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.amber}`, marginRight: "68px" }}>
                <div className="tv-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: T.amberSoft }}>🕐 Passar o tempo · quanto o mundo se move</div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 4, 6, 8, 12, 24].map((h) => (
                    <button key={h} onClick={() => passarTempo(h)} className="tv-mono text-xs rounded-lg px-3 py-2" style={{ background: T.panelSoft, border: `1px solid ${T.line}`, color: T.ink }}>{h}h</button>
                  ))}
                  <button onClick={() => setMostrarHoras(false)} className="tv-mono text-xs rounded-lg px-3 py-2" style={{ color: T.inkDim }}>cancelar</button>
                </div>
              </div>
            )}

            {aguardandoMundo && !bloqueado && !rolagem ? (
              <div className="px-4 md:px-8 shrink-0" style={{ paddingRight: "68px", paddingBottom: "20px" }}>
                {/* responder move o mundo junto — você fala E o mundo vive o instante */}
                <div className="flex gap-2 rounded-2xl p-2 min-w-0 mb-2" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
                  <input value={entrada} onChange={(e) => setEntrada(e.target.value)} onKeyDown={(e) => e.key === "Enter" && responderEMover(entrada)}
                    placeholder="Responder / falar…"
                    className="flex-1 bg-transparent outline-none tv-body text-[15px] px-3 min-w-0" style={{ color: T.ink }} />
                  <Botao primario pequeno desativado={!entrada.trim()} onClick={() => responderEMover(entrada)}>Responder →</Botao>
                </div>
                <div className="flex items-stretch gap-2">
                  <button onClick={vezDoMundo} className="tv-fade flex-1 rounded-2xl py-3 tv-mono text-sm flex items-center justify-center gap-2" style={{ background: T.amber, color: T.onAccent, fontWeight: 700, letterSpacing: "0.05em" }}>
                    🌍 VEZ DO MUNDO →{autoMundo && mundoRestante != null && <span className="text-[10px] font-normal opacity-80">{entrada.trim() ? "auto pausado (você está digitando)" : `auto em ${mundoRestante}s`}</span>}
                  </button>
                  <button onClick={() => setAutoMundo((v) => !v)} title={autoMundo ? "Turno do mundo automático: LIGADO (60s parado = o mundo vive) — toque para desligar" : "Turno do mundo automático: desligado — toque para ligar"}
                    className="tv-mono text-xs rounded-2xl px-3 shrink-0" style={{ background: T.panel, color: autoMundo ? T.ok : T.inkDim, border: `1px solid ${T.line}`, fontWeight: 600 }}>
                    {autoMundo ? "⏳" : "✋"}
                  </button>
                  <button onClick={() => setMostrarHoras((v) => !v)} title="Passar mais tempo" className="tv-mono text-xs rounded-2xl px-4 shrink-0" style={{ background: T.panel, color: T.amberSoft, border: `1px solid ${T.line}`, fontWeight: 600 }}>
                    🕐<span className="hidden md:inline"> Horas</span>
                  </button>
                </div>
              </div>
            ) : (
            <div className="px-4 md:px-8 shrink-0" style={{ paddingRight: "68px", paddingBottom: rolagem ? "6px" : "20px" }}>
              {/* LINHA 1 — ferramentas: rótulos sempre visíveis, sem roubar espaço da escrita */}
              <div className="flex items-center gap-1.5 mb-2">
                <button onClick={() => { setAcoesAbertas((v) => !v); setHabAbertas(false); }} disabled={bloqueado} className="tv-mono text-[11px] rounded-full px-3 py-1.5"
                  style={{ background: acoesAbertas ? T.amber : "transparent", color: acoesAbertas ? T.onAccent : T.amberSoft, border: `1px solid ${T.amber}`, fontWeight: 600, opacity: bloqueado ? 0.4 : 1 }}>
                  ⚔ Ações
                </button>
                <button onClick={() => { setHabAbertas((v) => !v); setAcoesAbertas(false); }} disabled={bloqueado} className="tv-mono text-[11px] rounded-full px-3 py-1.5"
                  style={{ background: habAbertas ? T.violet : "transparent", color: habAbertas ? T.onSecond : T.violetSoft, border: `1px solid ${T.violet}`, fontWeight: 600, opacity: bloqueado ? 0.4 : 1 }}>
                  ✦ Habilidades
                </button>
                <button onClick={() => setMostrarHoras((v) => !v)} disabled={bloqueado || acampado} title="Passar o tempo" className="tv-mono text-[11px] rounded-full px-3 py-1.5"
                  style={{ background: mostrarHoras ? T.amber : "transparent", color: mostrarHoras ? T.onAccent : T.amberSoft, border: `1px solid ${T.line}`, fontWeight: 600, opacity: (bloqueado || acampado) ? 0.4 : 1 }}>
                  🕐 Tempo
                </button>
                <button onClick={viajar} disabled={bloqueado || acampado} title="Seguir viagem: clima e encontro rolados pelas tabelas" className="tv-mono text-[11px] rounded-full px-3 py-1.5"
                  style={{ background: "transparent", color: T.amberSoft, border: `1px solid ${T.line}`, fontWeight: 600, opacity: (bloqueado || acampado) ? 0.4 : 1 }}>
                  🧭 Viajar
                </button>
                <button onClick={entrarMasmorra} disabled={bloqueado || acampado || !!masmorra} title="Explorar uma masmorra: salas roladas por tabela, tesouro e chefe por código" className="tv-mono text-[11px] rounded-full px-3 py-1.5"
                  style={{ background: "transparent", color: T.violetSoft, border: `1px solid ${T.line}`, fontWeight: 600, opacity: (bloqueado || acampado || masmorra) ? 0.4 : 1 }}>
                  🕳 Masmorra
                </button>
              </div>
              {/* LINHA 2 — escrita: largura inteira, campo alto e confortável */}
              <div className="flex gap-2 rounded-2xl p-2 min-w-0" style={{ background: T.panel, border: `1px solid ${habSel ? T.violet : T.line}` }}>
                <input value={entrada} onChange={(e) => setEntrada(e.target.value)} onKeyDown={(e) => e.key === "Enter" && agir(entrada)}
                  placeholder={rolagem ? "Role o dado abaixo…" : habSel ? `Como você usa ${habSel.nome}?` : "O que você faz? Fale, aja, explore…"}
                  disabled={bloqueado} className="flex-1 bg-transparent outline-none tv-body text-[15px] px-3 py-1.5 min-w-0" style={{ color: T.ink }} />
                <Botao primario pequeno desativado={bloqueado || !entrada.trim()} onClick={() => agir(entrada)}>Agir →</Botao>
              </div>
            </div>
            )}

            {rolagem && !carregando && (
              <div className="tv-fade px-4 md:px-8 pb-5 flex justify-center" style={{ paddingRight: "68px" }}>
                <div className="tv-pulse flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl px-4 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
                  <span className="tv-mono text-xs text-center" style={{ color: T.ink }}>🎲 Teste de {rolagem.atributo || "sorte"}{rolagem.dificuldade != null ? ` · dif. ${rolagem.dificuldade}` : ""} — <em className="tv-body" style={{ color: T.inkDim }}>{rolagem.motivo}</em></span>
                  <Botao primario pequeno desativado={dadoRolando} onClick={() => { if (!dadoRolando) setDadoRolando(true); }}>Rolar d20{modPend !== 0 ? ` (+${modPend})` : ""}</Botao>
                </div>
              </div>
            )}

              <div ref={fimRef} style={{ height: 8 }} />
            </div>

            {/* botão flutuante: volta para a última mensagem / área de ação */}
            {longeDoFim && (
              <button onClick={irParaOFim} className="tv-fade absolute rounded-full flex items-center justify-center"
                style={{ right: "84px", bottom: "28px", width: 46, height: 46, background: T.panel, border: `1px solid ${T.amber}`, color: T.amberSoft, fontSize: 21, zIndex: 25, boxShadow: "0 4px 14px rgba(0,0,0,.45)" }}
                title="Ir para a última mensagem">↓</button>
            )}

          </main>

          <TrilhoAbas abaAtiva={aba} aoClicar={setAba} nGrupo={(personagem.grupo || []).length} desperto={!!(divindade && divindade.despertar) || (personagem.nivel || 1) >= NIVEL_DESPERTAR} />
          <LimiteErro><PainelLateral aba={aba} fechar={() => setAba(null)} personagem={personagem} mundo={mundo} equipar={equipar} desequipar={desequipar} descartarItem={descartarItem} descartarEquip={descartarEquip} trocarCaminho={trocarCaminho} acampado={acampado} removerDoGrupo={removerDoGrupo} mapa={mapa} faccaoJogador={faccaoJogadorRef.current} cidadeAtual={cidadeAtualRef.current} transferirItem={transferirItem} historia={historiaRef.current} quests={quests} trocarArco={trocarArco} npcs={npcs} guilda={guilda} depositarCofre={depositarCofre} sacarCofre={sacarCofre} melhorarGuilda={melhorarGuilda} convidarNpc={convidarNpc} onDiplomacia={diplomacia} onPresente={presentearFaccao} recalibrarLenda={recalibrarLenda} recalibrarMundo={recalibrarMundo} conquistas={conquistas} tituloAtivo={tituloAtivo} escolherTitulo={escolherTitulo} descobertas={descobertas} contadores={contRef.current} equiparComp={equiparComp} desequiparComp={desequiparComp} desmontarEquip={desmontarEquip} forjar={forjar} mural={mural} aceitarContrato={aceitarContrato} abandonarContrato={abandonarContrato} garantirMural={garantirMural} decretos={decretos} pregarDecreto={pregarDecreto} cancelarDecreto={cancelarDecreto} definirRelacao={definirRelacao} reino={reino} famaInfo={{ f: Math.round(famaAtual()), pf: patamarFama(famaAtual()) }} nemesis={nemesis} nomeCampanha={nomeCampanha} dia={dia} onExportarCronica={exportarCronica} eventos={eventos} correio={correio} enviarCarta={enviarCarta} responderPeticao={responderPeticao} divindade={divindade} onDespertar={() => checarDespertar(personagem)} onRecalibrarAsc={recalibrarAscensao} recalAscState={recalAsc} onMilagreUI={usarMilagre} onForragear={forragearAqui} devocao={devocao} onErguerTemplo={erguerTemploUI} onUsarConsumivel={usarConsumivelUI} mercadoAqui={mercadoAqui} cidadeMercado={cidadeMercado} onComprar={comprarNoMercado} onVender={venderNoMercado} onAprenderHab={aprenderHabilidade} onRespec={respecHabilidades} onEscolherSubclasse={escolherSubclasseUI} bloqueado={bloqueado} /></LimiteErro>
        {/* RECALIBRAGEM DE LENDA: proposta do arquivista, decisão do jogador */}
        {recal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.6)" }}>
            <div className="rounded-2xl p-5 w-80 space-y-3" style={{ background: T.panel, border: `1px solid ${T.amber}` }}>
              <h3 className="tv-display text-xl" style={{ color: T.ink }}>⚖ Recalibrar lenda</h3>
              {recal === "pedindo" ? (
                <p className="tv-body text-sm italic" style={{ color: T.inkDim }}>O arquivista relê o livro da campanha e os seus feitos…</p>
              ) : (
                <>
                  <p className="tv-body text-sm" style={{ color: T.inkDim }}>{recal.justificativa}</p>
                  <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                    <div className="tv-mono text-sm" style={{ color: T.amberSoft }}>Nível {personagem.nivel} → <b>{recal.proposta.nivel}</b></div>
                    <div className="tv-mono text-sm" style={{ color: T.amberSoft }}>PV {personagem.vidaMax} → <b>{recal.proposta.vidaMax}</b> · PM {personagem.manaMax} → <b>{recal.proposta.manaMax}</b></div>
                    <div className="tv-mono text-[10px] mt-1" style={{ color: T.inkDim }}>{Object.entries(recal.proposta.atributos).map(([k, v]) => `${k.slice(0, 3).toUpperCase()} ${v}`).join(" · ")}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setRecal(null)} className="flex-1 tv-mono text-xs px-2 py-2 rounded-lg" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>manter como está</button>
                    <button onClick={aplicarRecalibragem} className="flex-1 tv-mono text-xs px-2 py-2 rounded-lg font-semibold" style={{ background: T.amber, color: T.onAccent, border: `1px solid ${T.amber}` }}>aplicar</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {/* RECALIBRAGEM DO MUNDO: estado proposto dos sistemas, decisão do jogador */}
        {recalM && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.6)" }}>
            <div className="rounded-2xl p-5 w-80 space-y-3 tv-scroll overflow-y-auto" style={{ background: T.panel, border: `1px solid ${T.amber}`, maxHeight: "80vh" }}>
              <h3 className="tv-display text-xl" style={{ color: T.ink }}>⚖ Recalibrar mundo</h3>
              {recalM === "pedindo" ? (
                <p className="tv-body text-sm italic" style={{ color: T.inkDim }}>O arquivista relê o livro, o cânone e os registros — companheiros, pessoas, potências, cidades, guilda…</p>
              ) : (
                <>
                  <p className="tv-body text-sm" style={{ color: T.inkDim }}>{recalM.justificativa}</p>
                  <div className="rounded-xl p-3 space-y-1.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                    {(recalM.proposta.companheiros || []).length > 0 && (
                      <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>⚑ Companheiros: {recalM.proposta.companheiros.map((c) => `${c.nome} nv.${c.nivel}${c.classe ? ` (${c.classe})` : ""}`).join(" · ")}</div>
                    )}
                    {(recalM.proposta.npcs || []).length > 0 && <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>👥 Pessoas: {(recalM.proposta.npcs || []).length} ficha(s)</div>}
                    {(recalM.proposta.faccoes || []).length > 0 && <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>⚜ Potências: {(recalM.proposta.faccoes || []).length}</div>}
                    {(recalM.proposta.cidades || []).length > 0 && <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>🗺 Cidades: {(recalM.proposta.cidades || []).length} ({(recalM.proposta.cidades || []).filter((c) => c.relacao === "jogador").length} dominada(s))</div>}
                    {recalM.proposta.guildaNivel != null && <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>🏛 Guilda nível {recalM.proposta.guildaNivel}</div>}
                  </div>
                  <p className="tv-body text-xs" style={{ color: T.inkDim }}>Aplicar mescla nos registros atuais — nada é apagado, só atualizado. O cofre da guilda é preservado.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setRecalM(null)} className="flex-1 tv-mono text-xs px-2 py-2 rounded-lg" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>manter como está</button>
                    <button onClick={aplicarRecalMundo} className="flex-1 tv-mono text-xs px-2 py-2 rounded-lg font-semibold" style={{ background: T.amber, color: T.onAccent, border: `1px solid ${T.amber}` }}>aplicar</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {recalAsc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.6)" }}>
            <div className="rounded-2xl p-5 w-80 space-y-3 tv-scroll overflow-y-auto" style={{ background: T.panel, border: `1px solid ${T.violetSoft}`, maxHeight: "80vh" }}>
              <h3 className="tv-display text-xl" style={{ color: T.ink }}>⚖ Recalibrar ascensão</h3>
              {recalAsc === "pedindo" ? (
                <p className="tv-body text-sm italic" style={{ color: T.inkDim }}>O arquivista relê o livro e o cânone em busca de sinais de culto, milagres e divindades…</p>
              ) : (
                <>
                  <p className="tv-body text-sm" style={{ color: T.inkDim }}>{recalAsc.justificativa}</p>
                  <div className="rounded-xl p-3 space-y-1.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                    <div className="tv-mono text-[11px]" style={{ color: T.violetSoft }}>🌟 {recalAsc.proposta.desperto ? `GD ${Math.max(0, Math.min(4, Math.round(recalAsc.proposta.gd || 0)))} · ${tituloDe(Math.max(0, Math.min(4, Math.round(recalAsc.proposta.gd || 0))))}` : "sem sinais de divindade"}</div>
                    {recalAsc.proposta.desperto && <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>🙏 {Number(recalAsc.proposta.fieis || 0).toLocaleString("pt-BR")} fiéis · ✨ {Number(recalAsc.proposta.pf || 0)} PF</div>}
                    {recalAsc.proposta.dominio && <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>🌌 Domínio: {recalAsc.proposta.dominio}</div>}
                    {recalAsc.proposta.patrono && <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>🙏 Patrono: {recalAsc.proposta.patrono}</div>}
                    {(recalAsc.proposta.divindades || []).length > 0 && <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>🏛 Divindades: {(recalAsc.proposta.divindades || []).map((d) => `${d.nome} (GD ${d.gd})`).join(", ")}</div>}
                  </div>
                  <p className="tv-body text-xs" style={{ color: T.inkDim }}>Aplicar alinha o painel Ascensão à história já jogada — fiéis, PF, domínio e panteão. Registros existentes não são apagados.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setRecalAsc(null)} className="flex-1 tv-mono text-xs px-2 py-2 rounded-lg" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>manter como está</button>
                    <button onClick={aplicarRecalAscensao} className="flex-1 tv-mono text-xs px-2 py-2 rounded-lg font-semibold" style={{ background: T.violetSoft, color: "#1A1206", border: `1px solid ${T.violetSoft}` }}>aplicar</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        </div>
      )}

      {dadoRolando && rolagem && <OverlayDado rolagem={rolagem} modificador={modPend} aoConcluir={concluirRolagem} />}
      {fase === "jogo" && personagem?.nivelPendentes > 0 && !carregando && !dadoRolando && (
        <ModalNivel nivel={personagem.nivel - personagem.nivelPendentes + 1} personagem={personagem} escolher={escolherAtributo} />
      )}

      {verCena && personagem && <ModalCena personagem={personagem} combate={combate} mundo={mundo} nomeCampanha={nomeCampanha} fechar={() => setVerCena(false)} />}

      {cronica && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(8,6,14,0.9)", backdropFilter: "blur(4px)" }} onClick={() => cronica !== "gerando" && setCronica(null)}>
          <div className="tv-fade w-full max-w-md rounded-2xl overflow-hidden" style={{ background: T.panel, border: `1px solid ${T.amber}` }} onClick={(e) => e.stopPropagation()}>
            {cronica === "gerando" ? (
              <div className="p-10 flex flex-col items-center gap-4"><span className="tv-dice inline-flex"><IconeD20 tamanho={30} /></span><span className="tv-mono text-xs" style={{ color: T.inkDim }}>Escrevendo sua lenda…</span></div>
            ) : (
              <>
                <div className="p-6" style={{ background: T.panelSoft, borderBottom: `1px solid ${T.line}` }}>
                  <div className="flex items-center gap-2 mb-3"><IconeCaneca tamanho={20} cor={T.amber} /><span className="tv-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: T.inkDim }}>{BRAND} · crônica</span></div>
                  <div className="tv-display text-3xl leading-tight" style={{ color: T.amberSoft }}>{cronica.titulo}</div>
                </div>
                <div className="p-6"><p className="tv-body text-[15px] leading-relaxed whitespace-pre-wrap" style={{ color: T.ink }}>{cronica.texto}</p><p className="tv-mono text-[10px] uppercase tracking-[0.3em] mt-5 text-center" style={{ color: T.inkDim }}>{SLOGAN}</p></div>
                <div className="p-4 flex justify-end" style={{ borderTop: `1px solid ${T.line}` }}><Botao primario pequeno onClick={() => setCronica(null)}>Fechar</Botao></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
