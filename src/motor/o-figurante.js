/* ============================================================
   O FIGURANTE QUE FALA (o Narrador ator, decisão 6 · 03/11/2026) — src/motor/o-figurante.js

   A 14.ª sessão mediu o mundo sem nome (mente/sessao-14.md, defeito 9 e
   §7): numa capital de 35 800 almas, a ficha dizia «Falam só: Leonor», e
   cinco perguntas ao mundo em 29 turnos ficaram sem ninguém que as ouvisse
   — os devotos do claustro não respondem, os mascates não erguem os olhos,
   a rua está trancada. O ator enche o silêncio com ausências inventadas
   («ninguém expõe cabo pesado…», com o Mercado a vender relíquias). A 15.ª
   mediu o outro lado (mente/sessao-15.md, defeito 3): sem ninguém em cena,
   o ator põe um VULTO — «o homem na penumbra… sem largar o cabo do
   cutelo» — e no T8 dá-lhe o nome do homem que o herói procurava.

   A pessoa aprovou a saída em 03/11 («Aprovo as duas sugestões»,
   mente/plano-narrador-ator.md, decisão 6): por cena, o SISTEMA elege um
   figurante, com uma voz da tabela de vozes, sem Sabe e sem Quer, que
   responde ao herói, nem que seja para não saber, e não deixa rasto.

   DE ONDE ELE SAI: DO SÍTIO, NÃO DO «À MÃO». O plano dizia «do À mão», e a
   ordem deixou escolher o que der verdade. O «À mão» são dois nomes por dia
   e por cidade (nomes.js, nomesAMao); dar um deles ao figurante faria a
   mesma Teresa ser a devota do claustro e a mascate do mercado no mesmo dia,
   e um nome que o registo não guarda é a promessa que o dia seguinte não
   cumpre (o vulto da 15.ª, que ganhou o nome do Godofredo). O sítio, esse,
   o sistema sabe: a base do mundo diz o tipo de cada casa da cidade
   (mundo-base.js, locaisDaCidade — o Claustro do Primeiro Prego é um
   templo, a Poça da Foz uma casa de banhos), e cada tipo tem a sua gente
   sem nome (FIGURANTE_DO_SITIO): o devoto no templo, o mascate na feira, o
   guarda à porta do quartel. Onde ninguém está — a ruína, a mina, o forte
   abandonado, a estrada, a luta —, não há figurante. Os nomes do «À mão»
   ficam onde estavam, para quem o ator ainda tiver de nomear.

   QUEM É: sem nome (o limite di-lo, e inclui o dele), com o género, o papel
   e a voz pela semente do mundo, do dia, da cidade e do sítio — o mesmo de
   um turno para o outro enquanto o herói fica no mesmo sítio, e outro
   quando muda de sítio ou de dia. A voz é uma das de COMO_FALA (nucleo.js),
   menos as que o obrigariam a dizer um nome, a cobrar ou a inventar número
   (O_FIGURANTE.vozFora); a ficha passa-a pelas mesmas formas que dá às
   outras vozes (a do número, a da pergunta, a da marca).

   QUANDO NÃO HÁ: com gente com nome bastante em cena (O_FIGURANTE.basta,
   contada fora do grupo, das feras e de quem está no chão), já há quem
   responda, e o figurante seria ruído.

   NÃO DEIXA RASTO: a ficha devolve-o à parte (`ficha.figurante`), fora de
   `pessoas`, de `falam` e de `conversa` — por isso o registo da cena
   (registo-da-cena.js) e o elenco nunca o veem. É do sistema e da cena,
   nunca da prosa.

     oFigurante(estado, { comNome })
       estado:  o do instante (lugar, cidadeAtual, dia, mapa, baseMundo,
                mundo, nomeCampanha, combate, masmorra, jornada, acampado)
       comNome: quantos com nome estão em cena (fora do grupo)
     → null | { papel, genero, agora, tique, registo, tipo }
       registo: o id do registo de fala (REGISTOS_DE_FALA, ficha-de-ator.js)

   Sem Math.random: a sorte é a do mundo (geografia.js, rngDe). Puro, sem
   React. Provado em `testes/teste-o-figurante.mjs`.
   ============================================================ */
import { oQueExisteAqui } from "../mundo-base.js";
import { MOLDE_PADRAO, moldePorId } from "../moldes.js";
import { cenarioAtivo } from "../cenario.js";
import { tiposPedidos } from "../lugar.js";
import { rngDe } from "../geografia.js";
import { COMO_FALA } from "../nucleo.js";

const ehObj = (x) => x != null && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const semArtigo = (x) => sem(x).replace(/^(o|a|os|as)\s+/, "");
const limpo = (x) => str(x).replace(/\s+/g, " ").trim();

/* A REGRA E AS PALAVRAS. `basta`: com tanta gente com nome em cena (fora
   do grupo), não há figurante. `semNome`, `responde`, `limite` e `falam`
   são o que a ficha escreve, na língua do ator ({H} o herói, {D}
   dele/dela, {F} o papel). `vozFora`: as vozes de COMO_FALA que o
   figurante não pode ter, e porquê. */
export const O_FIGURANTE = Object.freeze({
  basta: 1,
  semNome: "gente do lugar, sem nome",
  responde: "Responde quando {H} fala ao lugar, nem que seja para dizer, à maneira {D}, que não sabe.",
  limite: "Não promete, não cobra, não conta segredos nem diz nomes, nem o seu.",
  falam: "{F} sem nome",
  pronomes: Object.freeze({ ele: Object.freeze({ D: "dele" }), ela: Object.freeze({ D: "dela" }) }),
  vozFora: Object.freeze({
    f_terceira: "fala de si pelo nome, e ele não tem nenhum",
    f_alcunha: "põe nome em quem lhe fala",
    f_santos: "inventa nomes de santos",
    f_preco: "pergunta o preço de tudo: é cobrar",
    f_numeros: "pede números que um estranho não tem para dar",
    f_dias: "conta em dias o que um estranho não sabe",
  }),
});

/* A GENTE SEM NOME DE CADA SÍTIO, pelo tipo do lugar (os tipos da base,
   mundo-base.js LOCAIS, e os do cinturão de fora, lugar.js PALAVRAS_DO_TIPO;
   `rua` é a cidade sem sítio). `ele`/`ela`: o papel, com o artigo; `agora`:
   o que está a fazer quando o herói chega; `registo`: o jeito de falar do
   ofício (REGISTOS_DE_FALA), ou nada. Um tipo que não está aqui não tem
   figurante — a ruína, a mina, o forte, a torre. */
export const FIGURANTE_DO_SITIO = Object.freeze({
  taverna: Object.freeze({ ele: "um moço de turno ao balcão", ela: "uma moça de turno ao balcão", agora: "limpa canecas e vai servindo as mesas", registo: "venda" }),
  mercado: Object.freeze({ ele: "um mascate", ela: "uma mascate", agora: "apregoa o que tem numa banca pequena", registo: "venda" }),
  templo: Object.freeze({ ele: "um devoto", ela: "uma devota", agora: "reza de joelhos, num banco do fundo", registo: "pulpito" }),
  capela: Object.freeze({ ele: "um devoto", ela: "uma devota", agora: "acende uma vela no altar", registo: "pulpito" }),
  forja: Object.freeze({ ele: "um freguês", ela: "uma freguesa", agora: "espera ao pé da bigorna que lhe acabem a encomenda", registo: "campo" }),
  quartel: Object.freeze({ ele: "um guarda à porta", ela: "uma guarda à porta", agora: "está de vigia à porta", registo: "ordem" }),
  posto: Object.freeze({ ele: "um guarda à porta", ela: "uma guarda à porta", agora: "está de vigia à porta", registo: "ordem" }),
  cadeia: Object.freeze({ ele: "um guarda de ronda", ela: "uma guarda de ronda", agora: "faz a ronda das celas", registo: "ordem" }),
  biblioteca: Object.freeze({ ele: "um copista", ela: "uma copista", agora: "copia um livro numa mesa ao canto", registo: "livro" }),
  docas: Object.freeze({ ele: "um estivador", ela: "uma peixeira", agora: "carrega caixas do cais para um carro", registo: "mar" }),
  embarcadouro: Object.freeze({ ele: "um barqueiro", ela: "uma barqueira", agora: "amarra o barco ao poste", registo: "mar" }),
  arena: Object.freeze({ ele: "um espectador da bancada", ela: "uma espectadora da bancada", agora: "espera a próxima luta, de pé na bancada", registo: "rua" }),
  "cemitério": Object.freeze({ ele: "um enlutado", ela: "uma enlutada", agora: "está de pé junto de uma campa recente", registo: "campo" }),
  "cemitério de fora": Object.freeze({ ele: "um enlutado", ela: "uma enlutada", agora: "está de pé junto de uma campa recente", registo: "campo" }),
  guilda: Object.freeze({ ele: "um contratado", ela: "uma contratada", agora: "espera à mesa que lhe deem trabalho", registo: "rua" }),
  "casa de banhos": Object.freeze({ ele: "um banhista", ela: "uma banhista", agora: "descansa na água morna, de olhos meio fechados", registo: null }),
  fazenda: Object.freeze({ ele: "um lavrador", ela: "uma lavradora", agora: "trabalha a terra perto do caminho", registo: "campo" }),
  moinho: Object.freeze({ ele: "um moleiro de jorna", ela: "uma moleira de jorna", agora: "carrega sacos de farinha", registo: "campo" }),
  pomar: Object.freeze({ ele: "um apanhador", ela: "uma apanhadora", agora: "apanha fruta para um cesto", registo: "campo" }),
  ponte: Object.freeze({ ele: "um carroceiro", ela: "uma carroceira", agora: "espera a vez de passar a ponte", registo: "campo" }),
  rua: Object.freeze({ ele: "um passante", ela: "uma passante", agora: "passa com pressa, de cesto ao braço", registo: "campo" }),
});

/* o mundo da campanha: a mesma semente da pauta e da pessoa do passo */
function oMundo(e) {
  const r = ehObj(e.render) ? e.render : {};
  const mundo = ehObj(e.mundo) ? e.mundo : ehObj(r.mundo) ? r.mundo : {};
  const nome = limpo(e.nomeCampanha) || limpo(r.nomeCampanha) || "aventura";
  let genero = limpo(mundo.genero), molde = null, padrao = "";
  try { padrao = cenarioAtivo().generos.padrao; } catch { padrao = ""; }
  try { molde = moldePorId(mundo.molde || MOLDE_PADRAO); } catch { molde = null; }
  return { semente: `${nome}|${genero}`, genero: genero || padrao, molde, lex: mundo.lexico || null };
}

/* O TIPO DO SÍTIO: a cidade sem sítio é a rua; o sítio que é uma casa da
   cidade tem o tipo que a base lhe deu; o resto lê-se pelo nome (o cômodo
   de um prédio só pelo nome dele: o quarto da estalagem não é o salão) */
function oTipoDoSitio(e, W) {
  const cidade = limpo(e.cidadeAtual);
  const L = ehObj(e.lugar) ? limpo(e.lugar.nome) : "";
  if (!L) return cidade ? "rua" : "";
  if (cidade && semArtigo(L) === semArtigo(cidade)) return "rua";
  if (!limpo(e.lugar.dentroDe) && cidade) {
    let locais = [];
    try { const q = oQueExisteAqui(W.semente, e.mapa, cidade, e.baseMundo, W.genero, W.molde, W.lex); locais = arr(q && q.locais); } catch { locais = []; }
    const l = locais.find((x) => ehObj(x) && semArtigo(x.nome) === semArtigo(L));
    if (l) return str(l.tipo);
  }
  let t = [];
  try { t = tiposPedidos(L); } catch { t = []; }
  return t.find((x) => FIGURANTE_DO_SITIO[x]) || t[0] || "";
}

export function oFigurante(estado, opcoes) {
  const e = ehObj(estado) ? estado : {};
  const o = ehObj(opcoes) ? opcoes : {};
  if (Number(o.comNome) >= O_FIGURANTE.basta) return null;
  /* a luta, a masmorra, a estrada e o acampamento não têm gente do lugar */
  if (e.combate || ehObj(e.masmorra) || e.acampado) return null;
  if (ehObj(e.jornada) && !(ehObj(e.lugar) && limpo(e.lugar.nome))) return null;
  const W = oMundo(e);
  const tipo = oTipoDoSitio(e, W);
  const S = FIGURANTE_DO_SITIO[tipo];
  if (!S) return null;
  const sitio = ehObj(e.lugar) && limpo(e.lugar.nome) ? semArtigo(e.lugar.nome) : "rua";
  const rnd = rngDe(`${W.semente}|figurante|${Number(e.dia) || 0}|${sem(e.cidadeAtual)}|${sitio}`);
  const genero = rnd() < 0.5 ? "ele" : "ela";
  const vozes = COMO_FALA.filter((f) => ehObj(f) && f.o && !O_FIGURANTE.vozFora[f.id]);
  const voz = vozes.length ? vozes[Math.floor(rnd() * vozes.length)] : null;
  return { papel: S[genero], genero, agora: S.agora, tique: voz ? voz.o : "", registo: S.registo || null, tipo };
}
