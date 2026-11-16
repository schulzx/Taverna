/* ============================================================
   A MESA DO MESTRE — a conta das peças (V1 · F1 · 15/11/2026)

   «Se não poderia estar em cima de uma mesa, não aparece na tela.»
   (mente/lancamento/arquitetura.md §1.1). As peças moram em
   pecas-da-mesa.jsx e só desenham; o que cada uma MOSTRA é decidido aqui,
   em funções puras provadas em Node (testes/teste-mesa-do-mestre.mjs):

   · quantos discos numa pilha de recurso, e em quantas pilhas;
   · a altura da vela pela hora, e a palavra da hora;
   · o modo da luz (dia · noite · masmorra) e o raio do halo pelas tochas;
   · o tamanho de cada estilo de letra com o multiplicador do escudo, com o
     piso aplicado DEPOIS dele;
   · o estado da carta de pé e as contas de PV/PM;
   · de quem é a tecla Esc (o escudo do Mestre não a rouba de ninguém).

   Os números saem de estilo.js (LUZ_DA_MESA, PECAS_DA_MESA,
   ESCALA_DA_MESA, PISOS_DA_MESA, TAMANHO_DO_TEXTO). Nada aqui lança: o
   pior caso devolve a peça vazia, nunca derruba a cena.
   ============================================================ */
import { LUZ_DA_MESA, TETO_DO_VEU, PECAS_DA_MESA, ESCALA_DA_MESA, PISOS_DA_MESA, TAMANHO_DO_TEXTO, COMPOSICAO_DA_MESA } from "./estilo.js";
import { luzDaHora } from "./hora-e-prazo.js";

const num = (v, padrao = 0) => (Number.isFinite(Number(v)) ? Number(v) : padrao);

/* ---------------- A PEÇA DE RECURSO ----------------
   1 disco = 1 unidade (moedas: 1 disco = 10). Passou de `porPilha` discos,
   nasce a pilha seguinte, até `tetoDePilhas` — o número escrito por baixo
   continua a dizer a verdade inteira. Um resto qualquer (5 moedas) ainda
   é um disco: a pilha só fica vazia quando não há nada. */
export function pilhasDoRecurso(tipo, quantidade) {
  const R = PECAS_DA_MESA.recurso;
  const q = Math.max(0, Math.floor(num(quantidade)));
  const porDisco = R.unidadePorDisco[tipo] || 1;
  const discosVerdade = Math.ceil(q / porDisco);
  const teto = R.porPilha * R.tetoDePilhas;
  const discos = Math.min(discosVerdade, teto);
  const pilhas = [];
  for (let resto = discos; resto > 0; resto -= R.porPilha) pilhas.push(Math.min(R.porPilha, resto));
  return { quantidade: q, discos, pilhas, porDisco, transbordou: discosVerdade > teto };
}

/* ---------------- A VELA-RELÓGIO ----------------
   A altura é a hora: base + curso × (1 − horasDesdeAs6 / 24). Às 6 a vela
   é nova; às 5:59 da manhã seguinte está no toco. As marcas são as
   vigílias que faltam. */
export function horasDesdeAs6(hora) {
  const h = num(hora, 6);
  return (((h - 6) % 24) + 24) % 24;
}
export function alturaDaVela(hora) {
  const V = PECAS_DA_MESA.vela;
  return V.base + V.curso * (1 - horasDesdeAs6(hora) / 24);
}
export function vigiliasQueFaltam(hora) {
  const V = PECAS_DA_MESA.vela;
  return Math.max(0, V.vigilias - Math.floor(horasDesdeAs6(hora) / (24 / V.vigilias)));
}
/* a palavra que vai por baixo da vela; fronteiras escritas para poderem
   ser recusadas numa linha */
export const PALAVRA_DA_HORA = [
  { palavra: "Dia", de: 5, ate: 17 },
  { palavra: "Tarde", de: 17, ate: 20 },
  { palavra: "Noite", de: 20, ate: 5 },
];
export function rotuloDaVela(hora) {
  const h = num(hora, 6);
  const total = ((Math.round(h * 60) % 1440) + 1440) % 1440;
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  const f = PALAVRA_DA_HORA.find((x) => (x.de < x.ate ? hh >= x.de && hh < x.ate : hh >= x.de || hh < x.ate)) || PALAVRA_DA_HORA[0];
  return `${f.palavra} · ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/* ---------------- A LUZ ----------------
   Masmorra ganha de tudo (lá dentro não há sol); fora dela, a luz da hora
   decide entre dia e noite. A madrugada é noite para a mesa. */
export const LUZES_DE_NOITE = ["noite", "madrugada"];
export function modoDaLuz({ hora = 12, emMasmorra = false } = {}) {
  if (emMasmorra) return "masmorra";
  return LUZES_DE_NOITE.includes(luzDaHora(hora)) ? "noite" : "dia";
}
export function raioDoHalo(modo, tochas = 0) {
  const L = LUZ_DA_MESA[modo] || LUZ_DA_MESA.dia;
  if (typeof L.haloRaio === "number") return L.haloRaio;
  const r = L.haloRaio;
  return Math.min(r.teto, r.base + r.porTocha * Math.max(0, Math.floor(num(tochas))));
}
export function luzDaMesa(estado) {
  const e = estado || {};
  const modo = modoDaLuz(e);
  const L = LUZ_DA_MESA[modo];
  return { modo, feltro: L.feltro, feltroFundo: L.feltroFundo, haloAlfa: L.haloAlfa, haloRaio: raioDoHalo(modo, e.tochas), veuDaPagina: Math.min(TETO_DO_VEU, L.veuDaPagina), penumbra: L.penumbra };
}

/* ---------------- A LETRA ----------------
   O multiplicador vale sobre a escala inteira, e o piso vale DEPOIS dele:
   a 0,9 o rótulo fica em 12, não em 10,8. Nome tem piso 13; tudo o mais 12. */
export function multiplicadorValido(m) {
  const v = num(m, TAMANHO_DO_TEXTO.padrao);
  return TAMANHO_DO_TEXTO.opcoes.includes(v) ? v : TAMANHO_DO_TEXTO.padrao;
}
/* a config guarda texto; o que não for uma das quatro opções volta ao padrão */
export function tamanhoDoTextoGuardado(bruto) {
  if (bruto === null || bruto === undefined || bruto === "") return TAMANHO_DO_TEXTO.padrao;
  return multiplicadorValido(Number(bruto));
}
export function tamanhoNaEscala(estilo, mult = 1, telefone = false) {
  const E = ESCALA_DA_MESA[estilo];
  if (!E) return PISOS_DA_MESA.rotulo;
  const base = telefone && E.telefone ? E.telefone.corpo : E.corpo;
  const piso = E.piso === "nome" ? PISOS_DA_MESA.nome : PISOS_DA_MESA.rotulo;
  return Math.max(piso, Math.round(base * multiplicadorValido(mult) * 10) / 10);
}

/* ---------------- A CARTA DE PÉ ----------------
   Dez contas de PV (redondas) e dez de PM (losangos). Uma conta acesa por
   décimo, arredondando para cima — com 1 PV ainda há uma conta, e só o
   zero apaga todas. Caído vence ferido; a vez vence o repouso. */
export function contasAcesas(atual, max) {
  const C = PECAS_DA_MESA.carta.contas;
  const a = num(atual), m = num(max);
  if (a <= 0 || m <= 0) return 0;
  return Math.min(C, Math.ceil((a / m) * C));
}
export function estadoDaCarta({ vida = 0, vidaMax = 0, vez = false } = {}) {
  const v = num(vida), m = num(vidaMax);
  if (m > 0 && v <= 0) return "caido";
  if (vez) return "vez";
  if (m > 0 && v / m <= PECAS_DA_MESA.carta.feridoAbaixoDe) return "ferido";
  return "repouso";
}

/* ---------------- O LACRE ----------------
   O borrão de cera: as pontas da tabela (fixas, mesma cera em toda
   máquina) em volta de um centro. Devolve o atributo `d` de um path. */
export function contornoDoLacre(lado) {
  const P = PECAS_DA_MESA.lacre.pontas;
  const r = num(lado) / 2;
  const pts = P.map((f, i) => {
    const ang = (i / P.length) * Math.PI * 2 - Math.PI / 2;
    return [r + Math.cos(ang) * r * f, r + Math.sin(ang) * r * f];
  });
  const f2 = (n) => Math.round(n * 10) / 10;
  /* curva suave pelos pontos médios: a cera não tem quinas */
  const meio = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const ini = meio(pts[pts.length - 1], pts[0]);
  let d = `M${f2(ini[0])} ${f2(ini[1])}`;
  for (let i = 0; i < pts.length; i++) {
    const m = meio(pts[i], pts[(i + 1) % pts.length]);
    d += ` Q${f2(pts[i][0])} ${f2(pts[i][1])} ${f2(m[0])} ${f2(m[1])}`;
  }
  return d + "Z";
}

/* ---------------- A MESA CHEIA (V4) ----------------
   Qual composição vale numa janela: a primeira faixa de COMPOSICAO_DA_MESA
   cuja largura mínima a janela alcança. Largura inválida é telefone (o
   pior caso é a página inteira, nunca uma mesa que estoura). */
export function composicaoDaJanela(largura) {
  const L = num(largura, 0);
  const F = COMPOSICAO_DA_MESA.faixas;
  return F.find((f) => L >= f.aPartirDe) || F[F.length - 1];
}
/* a mesa das três zonas (larga e media) contra a do telefone */
export function temTresZonas(nome) {
  return nome === "larga" || nome === "media";
}
/* A ESTAMPA: aberta só no turno de chegada e só onde a faixa a abre; fora
   disso, recolhida (ou estreita, no telefone). */
export function estadoDaEstampa(nome, chegou) {
  const f = COMPOSICAO_DA_MESA.faixas.find((x) => x.nome === nome) || COMPOSICAO_DA_MESA.faixas[COMPOSICAO_DA_MESA.faixas.length - 1];
  if (f.estampa === "aberta") return chegou ? "aberta" : "recolhida";
  return f.estampa;
}
/* a cena pintada do lugar: as trinta de public/cenas, uma por bioma (e a
   masmorra). Bioma sem pintura dá "" — a estampa fica só com o título. */
export const CENAS_DA_ESTAMPA = ["abissal", "biblioteca", "bruma", "cinturao", "colina", "costa", "deserto", "enseada", "estacao", "floresta", "forno", "gasoso", "gelo", "ilha_seca", "ilha_selva", "jardim", "mar_aberto", "masmorra", "montanha", "morto", "nebulosa", "oficina", "orbital", "pantano", "planicie", "recife", "rochoso", "salao", "santuario", "vazio"];
export function cenaDaEstampa({ bioma = "", emMasmorra = false } = {}) {
  if (emMasmorra) return "masmorra";
  const b = String(bioma || "").trim().toLowerCase();
  return CENAS_DA_ESTAMPA.includes(b) ? b : "";
}
/* AS CAIXAS DA COMPOSIÇÃO — onde cada zona pousa numa janela das três
   zonas, em px (x, y, w, h). É a planta que a tela segue e a régua da
   cobertura: o feltro morto é o que nenhuma caixa cobre. */
export function caixasDaComposicao(largura, altura, { companheiros = 1, pistas = 2 } = {}) {
  const f = composicaoDaJanela(largura);
  const W = num(largura), H = num(altura);
  if (!temTresZonas(f.nome)) return { nome: f.nome, caixas: [{ zona: "pagina", x: 0, y: 0, w: W, h: H }] };
  const P = PECAS_DA_MESA, C = COMPOSICAO_DA_MESA;
  const pagina = Math.max(f.paginaMin, Math.min(f.pagina, W - 2 * f.lado - f.esquerda - f.direita - 2 * f.vao));
  const vao = Math.max(f.vao, (W - 2 * f.lado - f.esquerda - f.direita - pagina) / 2);
  const xEsq = f.lado, xPag = xEsq + f.esquerda + vao, xDir = xPag + pagina + vao;
  const caixas = [{ zona: "pagina", x: xPag, y: f.cima, w: pagina, h: H - 2 * f.cima }];
  /* a esquerda: o grupo (cartas lado a lado), quem está em cena, a nota da quest, as pistas */
  let y = 36 + 24;
  const nCartas = 1 + Math.min(1, Math.max(0, companheiros));
  caixas.push({ zona: "grupo", x: xEsq, y, w: nCartas * P.carta.alvo.largura + (nCartas - 1) * f.cartasEntre, h: P.carta.alvo.alto });
  y += P.carta.alvo.alto + C.esquerda.entreZonas + 24;
  caixas.push({ zona: "emCena", x: xEsq, y, w: Math.min(f.esquerda, 2 * 92), h: 96 });
  y += 96 + C.esquerda.entreZonas;
  caixas.push({ zona: "quest", x: xEsq, y, w: Math.min(f.esquerda, C.esquerda.quest.largura), h: 150 });
  y += 150 + C.esquerda.entreZonas + 24;
  if (f.pistas && pistas > 0) {
    const n = Math.min(pistas, C.esquerda.pista.quantas);
    caixas.push({ zona: "pistas", x: xEsq, y, w: n * C.esquerda.pista.largura + (n - 1) * 12, h: C.esquerda.pista.alto });
  }
  /* a direita: a bandeja com a vela, as peças, os objetos 2 × 2, o escudo */
  let yd = 36;
  caixas.push({ zona: "bandeja", x: xDir, y: yd, w: f.direita, h: Math.max(C.direita.bandeja.alto + 40, P.vela.caixa.alto) });
  yd += Math.max(C.direita.bandeja.alto + 40, P.vela.caixa.alto) + C.direita.entreZonas + 24;
  caixas.push({ zona: "pecas", x: xDir, y: yd, w: 4 * P.recurso.alvo.largura, h: P.recurso.alvo.alto });
  yd += P.recurso.alvo.alto + C.direita.entreZonas;
  const O = C.direita.objetos;
  caixas.push({ zona: "objetos", x: xDir, y: yd, w: O.colunas * P.objeto.alvo.largura + (O.colunas - 1) * O.entreColunas, h: 2 * P.objeto.alvo.alto + O.entreLinhas });
  caixas.push({ zona: "escudo", x: W - 28 - P.canto.alvo.largura, y: H - 24 - P.canto.alvo.alto, w: P.canto.alvo.largura, h: P.canto.alvo.alto });
  return { nome: f.nome, pagina, vao, caixas };
}
/* A COBERTURA — a fração da janela que alguma caixa cobre (a união, não a
   soma: caixas que se cruzam não contam duas vezes). Amostra numa grelha
   de `passo` px; determinística, sem depender de máquina. */
export function coberturaDaMesa(caixas, largura, altura, passo = 4) {
  const W = num(largura), H = num(altura), s = Math.max(1, num(passo, 4));
  if (W <= 0 || H <= 0) return 0;
  const cx = Array.isArray(caixas) ? caixas.filter((c) => c && c.w > 0 && c.h > 0) : [];
  let cheios = 0, total = 0;
  for (let y = s / 2; y < H; y += s) {
    for (let x = s / 2; x < W; x += s) {
      total++;
      if (cx.some((c) => x >= c.x && x < c.x + c.w && y >= c.y && y < c.y + c.h)) cheios++;
    }
  }
  return total ? cheios / total : 0;
}

/* ---------------- DE QUEM É O ESC ----------------
   O escudo do Mestre abre por Esc — mas Esc já tem donos: o campo de
   escrita (desfazer a frase), toda janela aberta por cima da mesa (o
   alforje, a carta do herói, o diário, a gaveta, a cerimônia), o mapa, e a
   luta (desarmar o verbo, fechar a ficha). A ordem é esta tabela, de cima
   para baixo; o primeiro dono presente leva a tecla. O escudo aberto é o
   primeiro: Esc fecha-o antes de qualquer outra coisa. Só quando ninguém
   a quer, Esc abre o escudo. A luta inteira é dona (e não só «a luta com
   seleção»): a seleção mora dentro de painel-batalha.jsx e o App não a vê;
   na luta o escudo abre pelo ⚙. */
export const DONOS_DO_ESC = ["escudo", "escrita", "janela", "mapa", "luta", "cerimonia"];
export function quemTemOEsc(estado) {
  const e = estado || {};
  if (e.fora) return "ninguem";   /* fora da tela de jogo o escudo não existe */
  for (const dono of DONOS_DO_ESC) if (e[dono]) return dono;
  return "abrir";
}
