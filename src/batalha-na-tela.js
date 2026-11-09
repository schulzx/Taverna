/* ============================================================
   A BATALHA NA TELA (CB, 09/11/2026) — a conta da forma, provada em Node

   formas.md §CB (o lote 1 da Fase CB): a previsão do golpe pousa debaixo do
   alvo, a intenção do inimigo no canto da ficha dele, o golpe sente-se em
   380 ms, o fecho pergunta uma vez por luta, o encontro da estrada é um
   cartão em três tempos, e a mesa a 1905 tem três colunas.

   Aqui mora o que a tela DECIDE sobre aquilo que o motor já decidiu: que
   estado da pílula mostrar, que número escrever e com que tamanho, quanto
   tempo o golpe leva, que colunas cabem, onde a câmara do telefone pousa.
   Nenhuma regra de jogo nasce aqui — a chance, o dano, o abate, a intenção,
   o evento do golpe e as escolhas do encontro chegam prontos do motor
   (previsao.js, intencao.js, combate.js, encontro-na-estrada.js) — e nenhuma
   cor: a peça escolhe a tinta pelo nome que esta conta devolve.

   É a mesma divisão de espolio-na-tela.js: o módulo puro decide e é provado
   em Node; o JSX (grade-de-batalha, painel-batalha, painel-encontro, ui)
   só desenha. Quando um dado falta, a conta devolve null e a peça cala-se.
   ============================================================ */
import { PREVISAO_DO_GOLPE, INTENCAO_NA_MESA, GOLPE_SENTIDO, BATALHA_EM_TRES, MESA_DE_BATALHA } from "./estilo.js";
import { periciaPorId } from "./pericias.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const fin = (x) => x !== null && x !== "" && typeof x !== "boolean" && Number.isFinite(Number(x));
const pct = (p) => (fin(p) ? Math.round(Number(p) * 100) : null);
/* o travessão do intervalo: «6–13», e «7» quando o dano não varia */
const intervalo = (min, max) => (fin(min) && fin(max) ? (Number(min) === Number(max) ? String(min) : `${min}–${max}`) : null);
/* «9,5»: a vírgula da casa, e nunca mais do que uma casa decimal */
const decimal = (n) => (fin(n) ? String(Math.round(Number(n) * 10) / 10).replace(".", ",") : null);
const metros = (m) => (fin(m) ? `${decimal(m)} m` : null);

/* ============================================================
   1. A PREVISÃO DO GOLPE (§CB 3) — a pílula debaixo do alvo
   `prev`: o que previsaoDoHeroi devolve (chance, dano, abateNoTurno,
   cobertura, semCobertura, golpesLivres), mais o que a fiação sabe e o
   motor não diz: `semVista` (o alvo fora da linha de vista). `o.caminho`:
   o caminho no chão quando o clique anda antes de golpear ({ metros }).
   ============================================================ */
export function pilulaDaPrevisao(prev, o) {
  const p = obj(prev);
  if (!p) return null;
  const c = obj(o) || {};
  const caminho = obj(c.caminho) || obj(p.caminho);
  const semVista = p.semVista === true || c.semVista === true;
  if (semVista) return { estado: "sem-vista", chance: null, dano: null, abate: null, aroLetal: false, rotulo: `${p.alvo ? `${p.alvo}: ` : ""}sem linha de vista` };
  const abate = fin(p.abateNoTurno) ? Number(p.abateNoTurno) : fin(p.abate) ? Number(p.abate) : null;
  const P = PREVISAO_DO_GOLPE;
  const abateCerto = abate != null && abate >= P.abateCerto;
  const abatePossivel = abate != null && abate >= P.abatePossivel && !abateCerto;
  const livres = obj(p.golpesLivres) && Array.isArray(p.golpesLivres.quem) ? p.golpesLivres.quem : [];
  const golpeLivre = !!caminho && livres.length > 0;
  const coberto = fin(p.cobertura) && Number(p.cobertura) > 0 ? Number(p.cobertura) : 0;
  const chance = pct(p.chance);
  const dano = obj(p.dano) ? intervalo(p.dano.min, p.dano.max) : null;
  /* o estado da forma: o que o caminho provoca manda (é o que muda o clique),
     depois o abate, depois a cobertura; o alcance é o repouso */
  const estado = golpeLivre ? "golpe-livre" : caminho ? "anda-e-ataca" : abateCerto ? "abate-certo" : abatePossivel ? "abate-possivel" : coberto ? "coberto" : "alcance";
  const partes = [
    chance != null ? `${chance}% de acertar` : null,
    dano ? `${dano.replace("–", " a ")} de dano` : null,
    abateCerto ? "abate certo" : abatePossivel ? `${pct(abate)}% de o abater` : null,
    coberto ? `ele tem cobertura (−${coberto})` : null,
    golpeLivre ? "sair provoca um golpe livre" : caminho && fin(caminho.metros) ? `anda ${metros(caminho.metros)}` : null,
  ].filter(Boolean);
  return {
    estado, chance, dano,
    abate: abatePossivel ? pct(abate) : null,
    abateCerto, coberto,
    anda: caminho && fin(caminho.metros) ? metros(caminho.metros) : null,
    golpeLivre,
    aroLetal: abateCerto || golpeLivre,
    rotulo: `${p.alvo ? `${p.alvo}: ` : ""}${partes.join(", ")}`,
  };
}

/* ============================================================
   2. O TEU GOLPE, POR EXTENSO (§CB 3) — a coluna Tu e a folha do telefone
   As 20 faces do d20 com as que acertam acesas: quem joga RPG de mesa pensa
   em «preciso de 6», não em «78%». As faces vêm do motor (`faces`, a lista
   de facesQueAcertam, e `criticoEm`); sem elas a fileira cala-se.
   ============================================================ */
export function golpePorExtenso(prev) {
  const p = obj(prev);
  if (!p || p.semVista === true) return null;
  const lista = Array.isArray(p.faces) ? p.faces.map(Number).filter((n) => n >= 1 && n <= 20) : null;
  const criticoEm = fin(p.criticoEm) ? Math.max(2, Math.min(20, Number(p.criticoEm))) : 20;
  const acertam = lista ? new Set(lista) : null;
  const faces = acertam ? Array.from({ length: 20 }, (_, i) => ({ n: i + 1, acerta: acertam.has(i + 1), critico: i + 1 >= criticoEm && acertam.has(i + 1) })) : null;
  const naoCriticas = lista ? lista.filter((n) => n < criticoEm) : [];
  const menor = naoCriticas.length ? Math.min(...naoCriticas) : null;
  const legenda = !faces ? null
    : !lista.length ? "nenhuma face do dado acerta"
      : `${menor != null ? `acertas com ${menor} ou mais no dado` : "só o crítico acerta"} · ${criticoEm >= 20 ? "o 20 é crítico" : `${criticoEm}–20 é crítico`}`;
  const livres = obj(p.golpesLivres) && Array.isArray(p.golpesLivres.quem) ? p.golpesLivres.quem : [];
  return {
    alvo: p.alvo || null,
    vida: fin(p.vidaDoAlvo) ? Number(p.vidaDoAlvo) : null,
    chance: pct(p.chance),
    bonus: fin(p.bonus) ? Number(p.bonus) : null,
    defesa: fin(p.defesa) ? Number(p.defesa) : null,
    faces, legenda, criticoEm,
    dano: obj(p.dano) ? { texto: intervalo(p.dano.min, p.dano.max), medio: decimal(p.dano.medio) } : null,
    abate: pct(fin(p.abateNoTurno) ? p.abateNoTurno : p.abate),
    critico: fin(p.chanceCritico) && Number(p.chanceCritico) > 0 ? { chance: pct(p.chanceCritico), dano: obj(p.danoCritico) ? intervalo(p.danoCritico.min, p.danoCritico.max) : null } : null,
    semCobertura: obj(p.semCobertura) ? pct(p.semCobertura.chance) : null,
    golpesLivres: livres.map((q) => ({ nome: String(q.nome || ""), dano: obj(q.dano) ? intervalo(q.dano.min, q.dano.max) : null })),
  };
}

/* ============================================================
   3. A INTENÇÃO DO INIMIGO (§CB 4) — a pílula no canto da ficha
   `vista`: intencoesDaRodada(...).lista[i].vista — { tipo, alvo, golpes,
   dano: {min, max}, abate, area }. `o.distanciaM`: a distância dele ao
   herói, para o «vem · 9 m». A mente `brilhante` esconde o ALVO (vista.alvo
   null), nunca o tipo: a pílula diz «→ ?».
   ============================================================ */
export function pilulaDaIntencao(vista, o) {
  const v = obj(vista);
  if (!v || !INTENCAO_NA_MESA.glifo[v.tipo]) return null;
  const c = obj(o) || {};
  const dano = obj(v.dano) ? intervalo(v.dano.min, v.dano.max) : null;
  const abate = fin(v.abate) ? Number(v.abate) : null;
  const letal = (v.tipo === "atacar" || v.tipo === "sopro") && abate != null && abate >= INTENCAO_NA_MESA.abateQueSeAnuncia;
  const area = Array.isArray(v.area) ? v.area.length : 0;
  const texto = v.tipo === "atacar" ? (dano || "")
    : v.tipo === "sopro" ? [dano, area ? `${area} casas` : null].filter(Boolean).join(" · ")
      : v.tipo === "aproximar" ? `vem${fin(c.distanciaM) ? ` · ${metros(c.distanciaM)}` : ""}`
        : "foge";
  const rotulo = v.tipo === "atacar" ? `vai atacar ${v.alvo || "alguém"}${dano ? `, ${dano.replace("–", " a ")} de dano` : ""}${letal ? `, ${pct(abate)}% de o derrubar` : ""}`
    : v.tipo === "sopro" ? `vai soprar${area ? ` sobre ${area} casas` : ""}${dano ? `, ${dano.replace("–", " a ")} de dano` : ""}${letal ? `, ${pct(abate)}% de derrubar ${v.alvo || "alguém"}` : ""}`
      : v.tipo === "aproximar" ? `vai aproximar-se${fin(c.distanciaM) ? `, está a ${metros(c.distanciaM)}` : ""}`
        : "vai fugir";
  return {
    tipo: v.tipo, glifo: INTENCAO_NA_MESA.glifo[v.tipo], texto,
    alvo: v.tipo === "atacar" ? (v.alvo || null) : null,
    alvoEscondido: v.tipo === "atacar" && !v.alvo,
    letal, abate: letal ? pct(abate) : null, area, rotulo,
  };
}

/* ============================================================
   4. O GOLPE SENTIDO (§CB 5) — a variante, o número, o tempo
   `evento`: eventoDoGolpe(r, ctx) (combate.js, EVENTO_DO_GOLPE v1).
   `o.heroi`: o nome do herói (o golpe «em ti» pinta o número de perigo e,
   com peso ≥ 0,25, acende a moldura). A entrada nunca espera: o estado já
   está aplicado quando a animação começa, e a animação é só leitura.
   ============================================================ */
const ERROS = { erro: "errou", imune: "imune", impedido: "impedido" };
export function somaDoGolpe(variante) {
  const v = GOLPE_SENTIDO[variante];
  if (!obj(v)) return null;
  return (Number(v.pausa) || 0) + (Number(v.tremor && v.tremor.ms) || 0) + (Number(v.assenta) || 0);
}
export function variacaoDoGolpe(evento, o) {
  const e = obj(evento);
  if (!e || e.tipo !== "golpe") return null;
  const c = obj(o) || {};
  const falhou = Object.prototype.hasOwnProperty.call(ERROS, e.desfecho);
  const variante = falhou ? "erro" : e.abate === true ? "abate" : e.critico === true || e.desfecho === "critico" ? "critico" : "acerto";
  const emTi = !!c.heroi && e.alvo === c.heroi;
  const N = GOLPE_SENTIDO.numero;
  const critico = !falhou && (e.critico === true || e.desfecho === "critico");
  const tom = falhou ? "erro" : emTi ? "emTi" : critico ? "critico" : "dano";
  const tamanho = falhou ? N.erro : critico ? N.critico : emTi ? N.emTi : N.dano;
  const sufixo = variante === "acerto" ? "" : `-${variante}`;
  return {
    variante, tom, tamanho, emTi, critico,
    texto: falhou ? ERROS[e.desfecho] : `-${Math.max(0, Number(e.dano) || 0)}`,
    etiqueta: critico ? "CRÍTICO" : null,
    borda: emTi && !falhou && fin(e.peso) && Number(e.peso) >= GOLPE_SENTIDO.emTi.peso,
    mesa: critico && variante === "critico",
    classes: {
      pausa: falhou ? null : `tv-golpe-pausa${sufixo}`,
      tremor: falhou ? "tv-golpe-desvia" : `tv-golpe-tremor${sufixo}`,
      salto: `tv-golpe-salto${sufixo}`,
      afunda: variante === "abate" ? "tv-golpe-afunda" : null,
    },
    soma: somaDoGolpe(variante),
    /* quanto o número fica na mesa: o golpe, a leitura e o esvanecer */
    dura: (somaDoGolpe(variante) || 0) + GOLPE_SENTIDO.leitura + GOLPE_SENTIDO.esvai,
    rotulo: falhou ? `${e.quem || "o golpe"} ${ERROS[e.desfecho]}${e.alvo ? ` contra ${e.alvo}` : ""}`
      : `${e.alvo || "o alvo"} leva ${Math.max(0, Number(e.dano) || 0)}${critico ? ", crítico" : ""}${e.abate === true ? ", e cai" : ""}`,
  };
}

/* ============================================================
   5. A MESA A 1905: AS TRÊS COLUNAS (§CB 2)
   O tabuleiro ao centro com a altura toda; as colunas Tu e Eles com 470,
   e cedem até 320 para o campo ficar quadrado. Abaixo de 1280 «Eles» vira
   gaveta; abaixo de 768 é o telefone (§CB 9). Devolve o arranjo, a largura
   de cada coluna, a casa e se o tabuleiro cabe inteiro (sem rolar).

   §CB 16.2 · A CONTA QUE FECHA. A altura da JANELA do campo (o que rola) é
   a tela menos o topo e a mesa (os três patamares de B1b), a fila (90), a
   margem de baixo, o vão até à barra, a barra (duas linhas, com o verbo à
   altura do PONTEIRO: `j.grosso` é o toque) e o Pé do campo com o fio e o
   aro. A casa é a menor entre a altura e a largura do centro, sem a calha.
   O centro quer o campo quadrado e, no mínimo, 660 (o pip no verbo cabe);
   as colunas cedem até 320 e, se nem assim, o centro leva o resto. No
   telefone a casa é o que cabe na janela de 9 × 11, entre 32 e 40.
   ============================================================ */
export function geometriaDaMesa(janela) {
  const j = obj(janela) || {};
  const B = BATALHA_EM_TRES, M = MESA_DE_BATALHA;
  const largura = Number(j.largura) || 0, altura = Number(j.altura) || 0;
  const colunas = Number(j.colunas) || B.casasDeReferencia, linhas = Number(j.linhas) || B.casasDeReferencia;
  const aros = B.aro * 2;
  if (largura < B.telefoneAbaixoDe) {
    const T = B.telefone;
    /* a janela de largo: a margem dos dois lados e o aro do campo (361 a 375) */
    const util = largura - T.margem * 2 - aros;
    const cab = T.cabecalho.topo + T.fila + T.cabecalho.entre + T.fala + T.cabecalho.baixo;
    const barra = aros + T.respiro * 2 + T.verbo * 3 + T.entre * 2;
    const alturaUtil = Math.max(0, altura - cab - (aros + B.aro + T.pe) - T.entre - T.tira - T.entre - barra - T.margem);
    const casa = casaDoTelefone(util, alturaUtil);
    const vC = Math.min(colunas, Math.floor(util / casa)), vL = Math.min(linhas, Math.floor(alturaUtil / casa));
    return { arranjo: "telefone", coluna: 0, casa, campo: { largura: util, altura: alturaUtil }, casasAVista: vC * vL, cabe: vC * vL >= colunas * linhas, comPip: false };
  }
  const tres = largura >= B.duasColunasAbaixoDe;
  const nCol = tres ? 2 : 1;
  /* os três patamares de B1b (a altura da janela, não da tela) */
  const [topo, mesa] = altura >= M.patamares.curto ? [B.margem, M.mesaTopo]
    : altura >= M.patamares.baixo ? [M.chipLadoX, M.chipLadoY]
      : [M.aperto.cenaTopo, M.aperto.cenaBaixo];
  const verbo = j.grosso ? B.verbo.grosso : B.verbo.fino;
  const barra = aros + B.barraRespiro * 2 + verbo * 2 + B.entreFileiras;
  const pe = B.pe + B.aro + aros;
  /* a janela do campo: 713 a 1905 × 1000 (rato), 501 a 768 */
  const altJanela = altura - topo - B.fila - mesa - B.margemDeBaixo - B.entreCampoEBarra - barra - pe;
  const estreito = largura < B.estreitoAbaixoDe;
  const margem = estreito ? B.margemEstreita : B.margem;
  const entre = estreito ? B.margemEstreita : B.entre;
  /* o campo quadrado que a altura pede (a calha da régua nas duas direções) */
  const casaPelaAltura = Math.floor((altJanela - B.calha) / linhas);
  const larguraIdeal = Math.max(B.casaMinima, Math.min(B.casaMaxima, casaPelaAltura)) * colunas + B.calha + aros;
  const sobra = largura - margem * 2 - entre * nCol;
  const centroQuer = Math.max(larguraIdeal, B.centroComPip);
  /* com duas colunas, Tu fica no mínimo (320) e o centro leva o resto */
  const coluna = !tres ? B.colunaMinima : Math.max(B.colunaMinima, Math.min(B.coluna, Math.floor((sobra - centroQuer) / nCol)));
  const centro = sobra - coluna * nCol;
  const larJanela = centro - aros;
  const casa = Math.max(B.casaMinima, Math.min(B.casaMaxima, Math.floor(Math.min((larJanela - B.calha) / colunas, (altJanela - B.calha) / linhas))));
  const cabe = casa * colunas + B.calha <= larJanela && casa * linhas + B.calha <= altJanela;
  return { arranjo: tres ? "tres" : "duas", coluna, casa, centro, campo: { largura: larJanela, altura: altJanela }, casasAVista: cabe ? colunas * linhas : null, cabe, comPip: centro >= B.centroComPip };
}
/* a casa do telefone: o que cabe na janela de 9 × 11 (o alvo), entre o piso
   (32) e o teto (40). A geometria e a câmara contam com a mesma. */
function casaDoTelefone(util, alturaUtil) {
  const T = BATALHA_EM_TRES.telefone;
  return Math.max(T.casaMinima, Math.min(T.casa, Math.floor(util / T.janela[0]), Math.floor(alturaUtil / T.janela[1])));
}

/* ============================================================
   6. A CÂMARA DO TELEFONE (§CB 9) — enquadra quem importa
   O retângulo que contém o herói, o alvo da previsão e todo o inimigo cuja
   intenção o tem por alvo (ou cuja área o apanha), com uma casa de folga.
   Cabe em 9×11: centra-o. Não cabe: a casa desce até 32 (11×13). Nem
   assim: ficam o herói e o alvo, e os outros ganham o marcador fora de
   vista na borda, com a distância. `importa`: [{ nome, x, y, lado }].
   §CB 16.2: a casa de partida é a que cabe na janela (9 × 11 é o alvo,
   entre 32 e 40), e a largura e a altura úteis chegam inteiras — no
   telefone já não há calha a descontar (a régua mora por cima das casas).
   ============================================================ */
export function camaraDoTelefone(cena) {
  const c = obj(cena) || {};
  const T = BATALHA_EM_TRES.telefone;
  const colunas = Math.max(1, Number(c.colunas) || 14), linhas = Math.max(1, Number(c.linhas) || 14);
  const util = Number(c.larguraUtil) > 0 ? Number(c.larguraUtil) : T.janela[0] * T.casa;
  const alturaUtil = Number(c.alturaUtil) > 0 ? Number(c.alturaUtil) : T.janela[1] * T.casa;
  const heroi = obj(c.heroi), alvo = obj(c.alvo);
  const outros = (Array.isArray(c.importa) ? c.importa : []).filter((x) => obj(x) && fin(x.x) && fin(x.y));
  const caixa = (lista) => {
    const qs = lista.filter((x) => obj(x) && fin(x.x) && fin(x.y));
    if (!qs.length) return null;
    const f = T.folgaDaCamara;
    const x0 = Math.min(...qs.map((q) => q.x)) - f, y0 = Math.min(...qs.map((q) => q.y)) - f;
    const x1 = Math.max(...qs.map((q) => q.x + (Number(q.lado) || 1) - 1)) + f, y1 = Math.max(...qs.map((q) => q.y + (Number(q.lado) || 1) - 1)) + f;
    return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  };
  const janelaDe = (casa) => [Math.min(colunas, Math.floor(util / casa)), Math.min(linhas, Math.floor(alturaUtil / casa))];
  const pousar = (cx, casa) => {
    const [jc, jl] = janelaDe(casa);
    const meioX = cx ? (cx.x0 + cx.x1 + 1) / 2 : colunas / 2, meioY = cx ? (cx.y0 + cx.y1 + 1) / 2 : linhas / 2;
    const x0 = Math.max(0, Math.min(colunas - jc, Math.round(meioX - jc / 2)));
    const y0 = Math.max(0, Math.min(linhas - jl, Math.round(meioY - jl / 2)));
    return { casa, janela: [jc, jl], x0, y0 };
  };
  const todos = caixa([heroi, alvo, ...outros]);
  const cabeEm = (cx, casa) => { const [jc, jl] = janelaDe(casa); return !cx || (cx.w <= jc && cx.h <= jl); };
  let pouso = null, fora = [];
  const casaQueCabe = casaDoTelefone(util, alturaUtil);
  if (cabeEm(todos, casaQueCabe)) pouso = pousar(todos, casaQueCabe);
  else if (cabeEm(todos, T.casaMinima)) pouso = pousar(todos, T.casaMinima);
  else {
    pouso = pousar(caixa([heroi, alvo]) || todos, T.casaMinima);
    fora = outros;
  }
  /* quem ficou fora da janela, com a borda por onde sai e a distância */
  const dentro = (q) => q.x >= pouso.x0 && q.y >= pouso.y0 && q.x < pouso.x0 + pouso.janela[0] && q.y < pouso.y0 + pouso.janela[1];
  const marcadores = (fora.length ? fora : outros).filter((q) => !dentro(q)).map((q) => {
    const borda = q.x < pouso.x0 ? "esquerda" : q.x >= pouso.x0 + pouso.janela[0] ? "direita" : q.y < pouso.y0 ? "cima" : "baixo";
    const casas = heroi ? Math.max(Math.abs(q.x - heroi.x), Math.abs(q.y - heroi.y)) : null;
    return { nome: String(q.nome || ""), x: q.x, y: q.y, borda, distanciaM: casas == null ? null : casas * 1.5 };
  });
  return { ...pouso, casasAVista: pouso.janela[0] * pouso.janela[1], marcadores };
}

/* ============================================================
   7. A ECONOMIA (§CB 8) — ● ação, ▲ bónus, ◆ reação
   A forma diz o recurso e a cor é uma só. Livre: cheio. Em jogo (o verbo
   sob o rato vai gastá-lo): tracejado. Gasto: só o aro. `economia`:
   combate.economia ({ acao, extra }); `recursos`: combate.recursos
   ({ reacao }); `o.emJogo`: o recurso do verbo apontado; `o.acaoBonus`:
   o herói tem ação bônus (quem não a tem não vê o pip dela).
   ============================================================ */
export function pipsDaEconomia(economia, recursos, o) {
  const e = obj(economia) || { acao: 1, extra: null };
  const r = obj(recursos);
  const c = obj(o) || {};
  const estado = (id, livre) => (!livre ? "gasto" : c.emJogo === id ? "emJogo" : "livre");
  const pips = [{ recurso: "acao", estado: estado("acao", (Number(e.acao) || 0) > 0), rotulo: "ação" }];
  if (e.extra != null && ((Number(e.extra) || 0) > 0 || c.acaoBonus)) pips.push({ recurso: "bonus", estado: estado("bonus", (Number(e.extra) || 0) > 0), rotulo: "bónus" });
  if (r && Object.prototype.hasOwnProperty.call(r, "reacao")) pips.push({ recurso: "reacao", estado: estado("reacao", r.reacao !== false), rotulo: "reação" });
  return pips;
}

/* ============================================================
   8. A FILA DA VEZ (§CB 8) — os rostos numa linha do tempo
   `selos`: faixaDaVez(combate, herói) (tela-de-batalha.js). Os caídos
   voltam à fila a 30 % (a faixa tira-os; a fila mostra quem caiu), quem já
   agiu fica a 45 % quando o motor o disser (`agiu`), e no fim a marca da
   rodada seguinte com quem abre a próxima.
   ============================================================ */
export function filaDaVez(selos, combate) {
  const lista = Array.isArray(selos) ? selos.filter(obj) : [];
  const cb = obj(combate) || {};
  const inimigos = Array.isArray(cb.inimigos) ? cb.inimigos : [];
  const caidos = inimigos.filter((x) => obj(x) && x.nome && (x.derrotado || Number(x.vida || 0) <= 0) && !lista.some((s) => s.nome === x.nome));
  const rostos = [
    ...lista.map((s) => ({ nome: s.nome, lado: s.lado, heroi: !!s.heroi, estado: s.agora ? "vez" : s.agiu ? "agiu" : "espera" })),
    ...caidos.map((x) => ({ nome: x.nome, lado: "inimigo", heroi: false, estado: "caido" })),
  ];
  const proximo = lista.length ? lista[0] : null;
  return { rostos, rodadaSeguinte: (Number(cb.rodada) || 1) + 1, proximo: proximo ? { nome: proximo.nome, lado: proximo.lado, heroi: !!proximo.heroi } : null };
}

/* ============================================================
   9. O FECHO (§CB 6) — o chip da queda do meio
   A queda do meio não pára a mesa: a escolha lembrada aplica-se, e o chip
   na casa diz o que foi feito e oferece o outro lado com um toque.
   `escolha`: "nao_letal" | "letal" (ESCOLHAS_DO_GOLPE_FINAL).
   ============================================================ */
export function chipDaQueda(nome, escolha) {
  const quem = String(nome || "").trim();
  if (!quem) return null;
  const poupado = escolha !== "letal";
  return { texto: `${quem} cai · ${poupado ? "poupado" : "morto"}`, outro: poupado ? "matar" : "poupar", outraEscolha: poupado ? "letal" : "nao_letal" };
}

/* ============================================================
   10. O ENCONTRO NA ESTRADA (§CB 7) — a linha da escolha, a faixa, o chip
   `v`: um veredito de escolhasDoEncontro (encontro-na-estrada.js);
   `estado`: o estado do encontro; `o.escolhida`: o id tocado.
   ============================================================ */
export function linhaDaEscolha(veredito, estado, o) {
  const v = obj(veredito);
  if (!v || !v.id) return null;
  const e = obj(estado) || {};
  const c = obj(o) || {};
  const semDado = !v.pericia;
  const fugaSegura = v.id === "fugir" && semDado && v.disponivel !== false;
  const lenda = v.id === "lutar" && !!v.aviso;
  const impedida = v.disponivel === false;
  const est = impedida ? "impedida" : fugaSegura ? "fuga-segura" : lenda ? "lutar-lenda" : c.escolhida === v.id ? "escolhida" : "repouso";
  const pericia = v.pericia ? ((periciaPorId(v.pericia) || {}).nome || v.pericia) : null;
  const custo = obj(v.custo) || {};
  const chance = impedida ? "—" : fugaSegura ? "CERTO" : v.id === "lutar" ? null : `${Number(v.chance) || 0}%`;
  const falha = impedida ? (v.porqueNao || "")
    : fugaSegura ? (e.quemViu === "heroi" ? "ainda não te viu: recuar é seguro" : "recuar é seguro")
      : lenda ? "Isto não é um encontro. É uma lenda."
        : obj(v.seFalhar) && v.seFalhar.frase ? `se falhar: ${v.seFalhar.frase}` : null;
  return {
    id: v.id, estado: est, rotulo: v.rotulo || v.id,
    pericia, cd: fin(v.cd) ? Number(v.cd) : null, semDado,
    horas: fin(custo.horas) && Number(custo.horas) > 0 ? Number(custo.horas) : null,
    moedas: fin(custo.moedas) && Number(custo.moedas) > 0 ? Number(custo.moedas) : null,
    falha, chance,
    dado: !semDado && !impedida && fin(v.bonus) ? `d20 ${Number(v.bonus) >= 0 ? "+" : "−"}${Math.abs(Number(v.bonus))}` : null,
    tocavel: !impedida,
  };
}
/* a ameaça como faixa, nunca como número (o sistema não fala de si) */
export function faixaDaAmeaca(estado) {
  const e = obj(estado);
  if (!e) return null;
  if (e.lendario) return { tipo: "lenda", texto: "Uma lenda · foge disto" };
  if (e.aEvitar) return { tipo: "a-evitar", texto: "Ameaça a evitar · não é para ti" };
  const n = Math.max(1, Number(e.quantos) || 1);
  return { tipo: "a-vista", texto: n > 1 ? `À vista · são ${n}` : "À vista · está só" };
}
export function chipDoAvistamento(estado) {
  const e = obj(estado);
  if (!e || !e.quemViu) return null;
  return e.quemViu === "heroi" ? { visto: false, texto: "ainda não te viu" } : { visto: true, texto: "já te viu" };
}
/* o botão de confirmar diz a escolha e o preço: «Esconder-se · 45% · 1 h» */
export function botaoDoEncontro(linha) {
  const l = obj(linha);
  if (!l || !l.tocavel) return null;
  return [l.rotulo, l.chance && l.chance !== "CERTO" ? l.chance : l.chance === "CERTO" ? "certo" : null, l.horas ? `${decimal(l.horas)} h` : null, l.moedas ? `${l.moedas} moedas` : null].filter(Boolean).join(" · ");
}

/* ============================================================
   11. O AVISO DA ÁREA (§CB 2) — quando o herói está dentro de um sopro
   A coluna Tu (e, no telefone, a pílula no pé do campo) diz quanto e como
   escapar: o dano da intenção e as casas até ao primeiro chão fora da
   área (a distância de casa, a mesma do passo). `intencoes`: a lista de
   intencoesDaRodada; `heroi`: { x, y }; `colunas`/`linhas`: o tabuleiro.
   ============================================================ */
const POR_EXTENSO = ["", "uma casa", "duas casas", "três casas", "quatro casas", "cinco casas", "seis casas"];
export function avisoDaArea(heroi, intencoes, tabuleiro) {
  const h = obj(heroi);
  if (!h || !fin(h.x) || !fin(h.y)) return null;
  const tb = obj(tabuleiro) || {};
  const colunas = Number(tb.colunas) || 14, linhas = Number(tb.linhas) || 14;
  for (const it of Array.isArray(intencoes) ? intencoes : []) {
    const v = obj(it) && obj(it.vista);
    if (!v || v.tipo !== "sopro" || !Array.isArray(v.area)) continue;
    const area = new Set(v.area.filter(obj).map((q) => `${q.x},${q.y}`));
    if (!area.has(`${h.x},${h.y}`)) continue;
    let passos = null;
    for (let r = 1; r <= 6 && passos == null; r++) {
      for (let dx = -r; dx <= r && passos == null; dx++) for (let dy = -r; dy <= r; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = h.x + dx, y = h.y + dy;
        if (x < 0 || y < 0 || x >= colunas || y >= linhas) continue;
        if (!area.has(`${x},${y}`)) { passos = r; break; }
      }
    }
    const dano = obj(v.dano) ? intervalo(v.dano.min, v.dano.max) : null;
    const quem = it.inimigo ? ` do ${it.inimigo}` : "";
    return {
      inimigo: it.inimigo || null, passos,
      texto: `Estás na área do sopro${quem}${dano ? ` (${dano})` : ""}.${passos ? ` Sai ${POR_EXTENSO[passos] || `${passos} casas`} para escapar.` : ""}`,
    };
  }
  return null;
}
