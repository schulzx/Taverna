/* ============================================================
   A BOCA DA MASMORRA (MM16 nº 2) — a masmorra do mundo como destino

   Na terceira sessão de prova (`mente/mm11-sessao-3.md`, J8 a M12) a
   heroína escreveu "Saio da Viela da Fome e vou à Nave de Ferro, pela
   estrada do poente". O sistema não sabia que a Nave de Ferro era um
   LUGAR a que se vai: conhecia-a como masmorra (abre-se ao entrar) e
   como linha no prompt (nível, salas, rumor), nunca como destino. Por
   isso leu só a direção ("pela estrada") e abriu uma viagem para lugar
   nenhum — `jornada.para: ""`, três dias de piso, o relógio a saltar
   treze horas e o Mestre a seguir a espinha para São do Meio. E quando
   ela escreveu "entro na Nave de Ferro", a porta abriu de onde ela
   estava, e o veredito ("DIFÍCIL… é onde se morre") chegou DEPOIS da
   porta — o contrário da lei da casa: o preço antes do clique.

   Este arquivo dá à masmorra do mundo as três coisas que lhe faltavam
   para ser destino:

     1) A ESTRADA ATÉ ELA. A masmorra nasce com `x,y` no pergaminho desde
        a v9.9, e a distância sai daí — a mesma conta (`kmEntre`) que o
        Geógrafo já diz ao Mestre quando se pergunta "a quantos km fica a
        Nave?" (`cidade-por-dentro.js`). Uma verdade só. Os dias saem da
        tabela de marcha do mapa (`TERRENO_VIAGEM`, pelo bioma da região
        da masmorra — não há estrada até um covil) e da MESMA fórmula de
        `gerarRotas`. Perto o bastante para ir a pé, é caminhada em
        minutos; longe, é jornada com os dias da tabela.
     2) A BOCA. Chegar põe o herói DIANTE da entrada, do lado de fora —
        um `lugar` com o nome da masmorra e o ponto dela. Nunca dentro.
        A porta só abre quando ele a cruza (`portaDaMasmorra`, rastro.js).
     3) O VEREDITO À PORTA. A mesma conta e a mesma linha de sempre
        (`dificuldade.js`), só que ANTES: na partida e à boca.

   O que este arquivo NÃO faz: ler a frase (isso é do `rastro.js`) nem
   agir (isso é do App). Ele sabe onde a boca fica, quanto custa lá chegar
   e o que se lê antes de entrar.
   ============================================================ */

import { kmEntre, rumoEntre, coordDe, garantirCoord, minutosAPe, aPeEmTexto, formatarDistancia, KM_ATE_ONDE_SE_VAI_A_PE } from "./coordenadas.js";
import { TERRENO_VIAGEM } from "./geografia.js";
import { abrirViagem, progressoDaViagem, minutosDaRota, HORAS_MARCHA_POR_DIA, MINUTOS_ESTRADA_POR_TURNO } from "./viagem.js";
import { dificuldadeDaMasmorra, envelopeDaDificuldade, avaliar, estadoNaPorta } from "./dificuldade.js";
import { bichosDaFicha, FICHA_NA_PLANTA } from "./masmorras.js";
import { criaturasDoGenero } from "./bestiario.js";
import { definirLugar, comDe, mesmoSitioPeloNome } from "./lugar.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const semArtigo = (s) => norm(s).replace(/^(o|a|os|as)\s+/, "").trim();
const decimal = (n) => String(n).replace(".", ",");

/* ---------------- A TABELA DA IDA ----------------
   `kmAPeAte` — até aqui a boca é uma caminhada (minutos, como um arredor);
     acima, é estrada (dias). É a régua da casa para "ninguém vai andando
     além disto" (`coordenadas.js`), e não um número novo.
   `minutosAPeMinimos` — a boca mais perto do mundo ainda é uma saída dos
     muros e um caminho até à pedra; zero minutos seria teleporte.
   `terrenoPadrao` — o bioma que não tem linha na tabela de marcha (os
     andares da Torre, as ilhas, as estrelas) anda como campo aberto.
   `diasMinimos` — o mesmo piso de `gerarRotas` (geografia.js): meio dia.
   `distanciaDaBoca` — como a boca se registra entre os lugares (lugar.js):
     longe da cidade, a meio dia ou mais; nunca "dentro". */
export const IDA_A_MASMORRA = {
  kmAPeAte: KM_ATE_ONDE_SE_VAI_A_PE,
  minutosAPeMinimos: 10,
  terrenoPadrao: "planicie",
  diasMinimos: 0.5,
  distanciaDaBoca: "perto",
};

/* ---------------- A IDA NA REGIÃO (MM17 C1, 06/10) ----------------
   Achado da etapa A: até 15 km a ida era a 4 km/h em QUALQUER chão, e a
   tabela de marcha (`TERRENO_VIAGEM`) diz 12 km por dia na montanha — a mina
   da montanha ficava "a 3 h" quando a marcha dizia um dia. E a estrada usava
   o chão do DESTINO para a viagem toda: entre dois lugares da região, direto,
   havia idas de três dias e meio.

   Num mapa de região (`mapa.regiao` com `versao` ≥ `versaoMinima`) a ida
   anda pelo chão que pisa: a velocidade de cada chão é a marcha do dia dele
   repartida pelas horas de marcha (`kmDia ÷ HORAS_MARCHA_POR_DIA`), e a ida
   cruza dois chãos — `metadeNoChaoDeOrigem` dos km no de onde se sai, o
   resto no de onde se chega. É a pé enquanto cabe num turno de estrada
   (`MINUTOS_ESTRADA_POR_TURNO`); acima disso é estrada, em meios-dias, como
   sempre. A ficha de cada lugar (`gerarRegiao`) mede com ESTA conta, e por
   isso a hora da ficha é a hora da viagem.

   O CONTINENTE NÃO SENTE ISTO: sem `regiao` nas opções (todo save que já
   existe, e a região v1 de quem a criou antes desta versão, cuja ficha foi
   medida pela régua antiga) a conta é a de antes, letra a letra. */
export const IDA_NA_REGIAO = {
  versaoMinima: 2,
  metadeNoChaoDeOrigem: 0.5,
  horasAPeAte: MINUTOS_ESTRADA_POR_TURNO / 60,
};

/* a região mede pelo chão? (o campo e a versão; lixo é não) */
function idaPeloChao(regiao) {
  return !!(regiao && typeof regiao === "object" && Number(regiao.versao) >= IDA_NA_REGIAO.versaoMinima);
}

const chaoDe = (bioma) => (TERRENO_VIAGEM[bioma] && TERRENO_VIAGEM[bioma].kmDia > 0 ? bioma : IDA_A_MASMORRA.terrenoPadrao);
const kmPorHora = (chao) => TERRENO_VIAGEM[chao].kmDia / HORAS_MARCHA_POR_DIA;

/* As horas de marcha de `km` de um chão a outro, pela régua da região. Sai
   daqui para `gerarRegiao` pôr o lugar pelas horas e a boca medir a ida com
   a MESMA conta — uma verdade só. */
export function horasPeloChao(km, chaoDeOrigem, chaoDeDestino) {
  const k = Math.max(0, Number(km) || 0);
  const d = chaoDe(chaoDeDestino);
  const o = chaoDeOrigem ? chaoDe(chaoDeOrigem) : d;
  const m = IDA_NA_REGIAO.metadeNoChaoDeOrigem;
  return (k * m) / kmPorHora(o) + (k * (1 - m)) / kmPorHora(d);
}

/* ---------------- QUAIS O HERÓI CONHECE ----------------
   As masmorras que a cidade aponta: a que tem a cidade por "cidade
   próxima" e as da mesma região. É a régua de `oQueExisteAqui`
   (mundo-base.js) — exatamente as que o Mestre recebe no prompt, com
   nível, salas e rumor. Uma masmorra de outra região, de que o herói
   nunca ouviu falar, não vira destino por acaso de nome.

   MM17 C1: NA REGIÃO, TODAS. A região inteira fica a um dia de marcha da
   base (`ALCANCE_DA_REGIAO`, regiao.js), e a história manda o herói aos
   lugares dela; a base (e todo povoado, que está a menos de um dia dela)
   conhece todos. `opcoes.regiao` é o `mapa.regiao`: sem ele, a régua de
   sempre. É a mesma de `oQueExisteAqui` — o que se pode pedir para ir é o
   que o Mestre recebe. */
export function masmorrasConhecidas(masmorras, cidade, opcoes) {
  const c = cidade && typeof cidade === "object" ? cidade : null;
  if (!c || !c.nome) return [];
  const r = opcoes && typeof opcoes === "object" ? opcoes.regiao : null;
  const naRegiao = !!(r && typeof r === "object");
  return (Array.isArray(masmorras) ? masmorras : [])
    .filter((m) => m && m.nome && (naRegiao || m.cidadeProxima === c.nome || (!!c.regiao && m.regiao === c.regiao)));
}

/* A masmorra cuja boca é o lugar onde o herói está, ou null. O lugar da
   boca tem o nome da masmorra (é assim que `chegadaABoca` o registra), e
   o artigo não conta: "Nave de Ferro" e "A Nave de Ferro" são a mesma. */
/* 4.ª sessão de prova (nº 1): A BOCA POR OUTRO NOME. Um save que já tem o
   lugar rebatizado pelo Cronista ("forte da Muralha Quebrada", à boca da
   "Muralha Quebrada de Silêncio") não o perde: fora dos muros, o lugar cujo
   nome partilha o NÚCLEO com o de UMA só masmorra (`mesmoSitioPeloNome`,
   lugar.js) é a boca dela. Duas candidatas, nenhuma — na dúvida, não é. E
   dentro dos muros nunca: um cômodo da cidade não é a boca de nada. */
const exataDaBoca = (lugar, lista) => {
  const k = semArtigo(lugar.nome);
  return k ? lista.find((m) => m && m.nome && semArtigo(m.nome) === k) || null : null;
};
export function masmorraDaBoca(lugar, masmorras) {
  if (!lugar || typeof lugar !== "object" || !lugar.nome) return null;
  const lista = Array.isArray(masmorras) ? masmorras : [];
  const exata = exataDaBoca(lugar, lista);
  if (exata || lugar.distancia === "dentro" || lugar.dentroDe) return exata;
  const pelo = lista.filter((m) => m && m.nome && mesmoSitioPeloNome(String(lugar.nome), String(m.nome)));
  return pelo.length === 1 ? pelo[0] : null;
}

/* ---------------- AO ENTRAR, O LUGAR É A BOCA (MM16 nº 4) ----------------
   Na sessão de prova a tela disse "Você está na Nave de Ferro" e, oito
   linhas abaixo, "Você está no posto da estrada": abrir a masmorra não
   tocava no lugar vigente, e o lugar que ficava era o de antes da porta —
   o posto, a fogueira, a estrada. Era esse que o ONDE da pauta dizia lá
   dentro ("no posto da estrada · (aqui isto é um forte)"), e era contra
   esse que o sistema julgava cada lugar que a IA devolvia.

   Entrar põe o lugar vigente na BOCA da masmorra — o mesmo lugar que
   `chegadaABoca` regista quando se chega a pé ou pela estrada: o nome dela,
   o ponto dela, a distância da boca. Lá dentro quem diz a sala é a planta
   (`masmorraParaPauta`, masmorras.js); e ao sair o herói está onde de facto
   está — diante da porta por onde saiu, não no posto de onde veio.

   Quem já está à boca dela não muda (é o mesmo lugar, e o `desde` fica).
   Devolve o lugar a registar, ou `null` quando não há masmorra com nome. */
export function lugarAoEntrarNaMasmorra(masmorra, opcoes) {
  const { cidade = "", dia = 0, lugar = null } = opcoes && typeof opcoes === "object" ? opcoes : {};
  if (!masmorra || typeof masmorra !== "object" || !masmorra.nome) return null;
  /* só a boca de NOME (a exata) fica: a boca por outro nome tinha o ponto da
     cidade (4.ª sessão), e entrar regista a verdadeira, com o ponto dela */
  if (lugar && typeof lugar === "object" && lugar.nome && exataDaBoca(lugar, [masmorra])) return lugar;
  return definirLugar(String(masmorra.nome), { cidade, dia, distancia: IDA_A_MASMORRA.distanciaDaBoca, coord: coordDe(masmorra.coord || masmorra) });
}

/* ---------------- A ESTRADA ATÉ A BOCA ----------------
   `origem` é o ponto do herói (a cidade, o arredor onde está, o meio da
   estrada). Sem ponto de partida ou sem o ponto da masmorra não há conta,
   e não há palpite: `null` — o portão da casa, "na dúvida, não move". */
export function rotaAteAMasmorra(masmorra, origem, opcoes) {
  const de = (opcoes && typeof opcoes === "object" && opcoes.de) || "";   // `= {}` não cobre null
  const pelaRegiao = idaPeloChao(opcoes && typeof opcoes === "object" ? opcoes.regiao : null);
  if (!masmorra || typeof masmorra !== "object" || !masmorra.nome) return null;
  const q = coordDe(masmorra);
  const p = garantirCoord(origem);
  if (!q || !p) return null;
  const km = kmEntre(p, q);
  if (km == null) return null;
  const bioma = String(masmorra.bioma || "");
  const terreno = TERRENO_VIAGEM[bioma] && TERRENO_VIAGEM[bioma].kmDia > 0 ? bioma : IDA_A_MASMORRA.terrenoPadrao;
  const rumo = rumoEntre(p, q);
  const base = { de: String(de || ""), para: String(masmorra.nome), terreno, rumo };
  if (pelaRegiao) {
    /* MM17 C1: o chão que se pisa (ver IDA_NA_REGIAO, acima) */
    const horas = horasPeloChao(km, origem && typeof origem === "object" ? origem.bioma : "", terreno);
    if (horas <= IDA_NA_REGIAO.horasAPeAte) {
      return { ...base, modo: "a_pe", km: Math.round(km * 10) / 10, dias: 0, minutos: Math.max(IDA_A_MASMORRA.minutosAPeMinimos, Math.round(horas * 60)) };
    }
    const diasR = Math.max(IDA_A_MASMORRA.diasMinimos, Math.round((horas / HORAS_MARCHA_POR_DIA) * 2) / 2);
    return { ...base, modo: "estrada", km: Math.round(km), dias: diasR, minutos: minutosDaRota(diasR) };
  }
  if (km <= IDA_A_MASMORRA.kmAPeAte) {
    return { ...base, modo: "a_pe", km: Math.round(km * 10) / 10, dias: 0, minutos: Math.max(IDA_A_MASMORRA.minutosAPeMinimos, minutosAPe(km)) };
  }
  /* a fórmula de `gerarRotas`, letra a letra: km ÷ marcha do dia, em meios-dias */
  const dias = Math.max(IDA_A_MASMORRA.diasMinimos, Math.round((km / TERRENO_VIAGEM[terreno].kmDia) * 2) / 2);
  return { ...base, modo: "estrada", km: Math.round(km), dias, minutos: minutosDaRota(dias) };
}

/* A linha da partida, quando há estrada. A caminhada não tem linha
   própria: chega no mesmo turno, e quem fala é a chegada. */
export function linhaDaIda(rota) {
  if (!rota || rota.modo !== "estrada") return "";
  const t = TERRENO_VIAGEM[rota.terreno];
  return `🧭 ${rota.para} fica ${rota.rumo ? `${rota.rumo.rotulo}, ` : ""}a ${formatarDistancia(rota.km)} — ${decimal(rota.dias)} ${rota.dias === 1 ? "dia" : "dias"} de marcha${t ? ` por ${t.rotulo}` : ""}.`;
}

/* ---------------- À PORTA E NO FUNDO (S7b, 17/11/2026) ----------------
   Na sessão de 15/11 um lugar marcado «DIFÍCIL… é onde se morre» deu uma
   primeira luta de 2 rodadas com 0 de dano, e a pauta do mesmo lugar dizia
   «perigo médio — Zumbi (nv 2), Bandido (nv 2)». O veredito media a
   masmorra inteira (o nível dela, o chefe incluído) e o jogador lia-o como
   a primeira sala. Agora a MESMA conta (`avaliar`, dificuldade.js) dá duas
   medidas: NO FUNDO — a de sempre, o lugar inteiro — e À PORTA — o
   primeiro encontro provável, pelo nível de quem lá anda:
     · a planta sorteia quantos bichos tem a primeira sala de luta (1 ou 2,
       mais 1 a partir de `nivelDeTres` — masmorras.js#rolarGrupo) e conta-se
       o mais forte;
     · com a ficha do lugar (`quem`, regiao.js) os bichos saem da roda, os
       não chefes antes do chefe (masmorras.js#plantaDaFicha); sem ficha,
       do bestiário do género até `nivel + folga`, por igual.
   A conta é a distribuição EXATA do nível dessa sala (sem sorteio), e a
   porta anuncia a FAIXA: o patamar mais provável e, se ele não cobre
   `cobertura` da probabilidade, o vizinho mais provável até cobrir — o
   primeiro encontro cai nela (a catraca mede-o em 1000 plantas).
   `semNivel`: o bicho da ficha sem nível pesa pelo degrau da ameaça. */
export const PERIGO_A_PORTA = Object.freeze({
  folga: 2,
  nivelDeTres: 8,
  pDoSegundo: 0.5,
  cobertura: 0.8,
  semNivel: Object.freeze({ fraco: 1, comum: 2, competente: 4, elite: 8, lendario: 12 }),
  porta: "À porta",
  fundo: "No fundo",
  ate: ", até ",
});
const FAIXAS_DA_PORTA = ["facil", "medio", "dificil", "impossivel"];

/* a ficha do lugar no mapa da região (a mesma leitura de regiao.js#quemDoLugar:
   o id, ou o nome sem artigo) — aqui, e não importada, porque regiao.js
   importa este módulo */
function quemDaFichaNoMapa(mapa, m) {
  const r = mapa && typeof mapa === "object" && mapa.regiao && typeof mapa.regiao === "object" ? mapa.regiao : null;
  if (!r || !Array.isArray(r.lugares) || !m) return null;
  const sa = (x) => String(x == null ? "" : x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim().replace(/^(o|a|os|as)s+/, "");
  const l = (m.id != null && r.lugares.find((x) => x && x.id === m.id)) || r.lugares.find((x) => x && typeof x.nome === "string" && sa(x.nome) === sa(m.nome));
  return l && l.ficha && Array.isArray(l.ficha.quem) ? l.ficha.quem : null;
}

/* A distribuição do nível do primeiro encontro. mm: { nivel }; opcoes:
   { quem (a ficha do lugar), genero }. → [{ nivel, p }] (p soma 1) | [] */
export function osNiveisDaPorta(mm, opcoes) {
  const m = mm && typeof mm === "object" ? mm : null;
  const nivel = m ? Number(m.nivel) : NaN;
  if (!Number.isFinite(nivel) || nivel <= 0) return [];
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const T = PERIGO_A_PORTA;
  const tres = nivel >= T.nivelDeTres ? 1 : 0;
  const quantos = [{ q: 1 + tres, p: 1 - T.pDoSegundo }, { q: 2 + tres, p: T.pDoSegundo }];
  const soma = new Map();
  const por = (n, p) => soma.set(n, (soma.get(n) || 0) + p);
  const bichos = bichosDaFicha(o.quem != null ? o.quem : m.quem != null ? m.quem : quemDaFichaNoMapa(o.mapa, m));
  if (bichos.length) {
    const degrau = (a) => FICHA_NA_PLANTA.ameacas.indexOf(a);
    const chefe = bichos.reduce((x, b) => (degrau(b.ameaca) > degrau(x.ameaca) || (degrau(b.ameaca) === degrau(x.ameaca) && (b.nivel || 0) > (x.nivel || 0)) ? b : x));
    const roda = [...bichos.filter((b) => b !== chefe), chefe];
    const nv = (b) => (b.nivel != null ? b.nivel : (T.semNivel[b.ameaca] || nivel));
    for (const { q, p } of quantos) por(Math.max(...Array.from({ length: q }, (_, k) => nv(roda[k % roda.length]))), p);
  } else {
    let pool = [];
    try { pool = criaturasDoGenero(o.genero || undefined).map((c) => Number(c.nivelRef) || 1).filter((n) => n <= nivel + T.folga); } catch { pool = []; }
    if (!pool.length) return [{ nivel, p: 1 }];
    const niveis = [...new Set(pool)].sort((a, b) => a - b);
    const F = (x) => pool.filter((n) => n <= x).length / pool.length;
    for (const { q, p } of quantos) {
      let antes = 0;
      for (const n of niveis) { const ate = F(n) ** q; por(n, p * (ate - antes)); antes = ate; }
    }
  }
  return [...soma.entries()].map(([n, p]) => ({ nivel: n, p })).sort((a, b) => a.nivel - b.nivel);
}

/* A porta: a faixa anunciada. → null | { patamar, de, ate, cobre, razao,
   porque, nivel } — `de`/`ate` são ids de patamar (iguais quando um só
   cobre), `porque` diz a faixa em palavras. */
function aPortaDe(masmorra, pers, opcoes) {
  const dist = osNiveisDaPorta(masmorra, opcoes);
  if (!dist.length) return null;
  const est = estadoNaPorta(pers, masmorra);
  const lidos = dist.map((d) => ({ ...d, a: avaliar({ nivel: d.nivel, tamanho: 0, rotulo: masmorra.nome }, pers, est) }));
  const pDe = Object.fromEntries(FAIXAS_DA_PORTA.map((f) => [f, 0]));
  for (const x of lidos) pDe[x.a.patamar.id] = (pDe[x.a.patamar.id] || 0) + x.p;
  let lo = FAIXAS_DA_PORTA.reduce((m, f, i) => (pDe[f] > pDe[FAIXAS_DA_PORTA[m]] ? i : m), 0), hi = lo;
  const moda = FAIXAS_DA_PORTA[lo];
  let cobre = pDe[moda];
  while (cobre < PERIGO_A_PORTA.cobertura - 1e-9 && (lo > 0 || hi < FAIXAS_DA_PORTA.length - 1)) {
    const baixo = lo > 0 ? pDe[FAIXAS_DA_PORTA[lo - 1]] : -1, alto = hi < FAIXAS_DA_PORTA.length - 1 ? pDe[FAIXAS_DA_PORTA[hi + 1]] : -1;
    if (alto > baixo) { hi++; cobre += alto; } else { lo--; cobre += baixo; }
  }
  /* as pontas são patamares com probabilidade (a faixa pode ter passado por um vazio) */
  while (lo < hi && !(pDe[FAIXAS_DA_PORTA[lo]] > 0)) lo++;
  while (hi > lo && !(pDe[FAIXAS_DA_PORTA[hi]] > 0)) hi--;
  const de = FAIXAS_DA_PORTA[lo], ate = FAIXAS_DA_PORTA[hi];
  /* as palavras: o nível mais provável de cada ponta da faixa */
  const naPonta = (f) => lidos.filter((x) => x.a.patamar.id === f).reduce((m, x) => (!m || x.p > m.p ? x : m), null);
  const principal = naPonta(moda);
  const pLo = naPonta(de), pHi = naPonta(ate);
  const porque = de === ate ? principal.a.porque : `${pLo.a.porque}${PERIGO_A_PORTA.ate}${pHi.a.porque}`;
  return { patamar: principal.a.patamar, de, ate, cobre: Math.round(cobre * 1000) / 1000, razao: principal.a.razao, porque, nivel: principal.nivel };
}
/* ---------------- O VEREDITO À PORTA ----------------
   A conta de sempre (`dificuldadeDaMasmorra`) e a linha de sempre — a que o
   App punha na tela DEPOIS de a porta abrir. Só muda QUANDO se lê. Serve à
   masmorra do mundo (salas é um número) e à gerada (salas é a planta).
   S7b: `dif` é o FUNDO (o lugar inteiro, como sempre: o patamar do selo e
   o que o Narrador governa); `porta` é o primeiro encontro (acima), e a
   linha diz as duas em palavras. opcoes: { quem, genero }. */
export function vereditoDaMasmorra(masmorra, pers, opcoes) {
  if (!masmorra || typeof masmorra !== "object" || !masmorra.nome) return null;
  /* sem herói não há veredito: a conta de um grupo vazio é um número sobre
     ninguém, e um veredito sobre ninguém é mentira com cara de regra */
  if (!pers || typeof pers !== "object") return null;
  const dif = dificuldadeDaMasmorra(masmorra, pers);
  if (!dif) return null;
  const p = dif.patamar;
  let porta = null;
  try { porta = aPortaDe(masmorra, pers, opcoes); } catch { porta = null; }
  /* S6 (15/11): a linha diz o perigo em palavras (dif.porque); a conta com
     os números vai em `conta`, para o detalhe ao toque. S7b: com a porta, a
     linha diz À porta e No fundo */
  const porque = String(dif.porque || "");
  const frase = (x) => `${x.charAt(0).toUpperCase()}${x.slice(1)}`;
  const T = PERIGO_A_PORTA;
  const duas = porta ? ` ${T.porta}: ${porta.porque}. ${T.fundo}: ${porque}.` : (porque ? ` ${frase(porque)}.` : "");
  return { dif, porta, fundo: dif, conta: dif.conta || "", linha: `${p.icone} ${masmorra.nome} — ${p.rotulo.toUpperCase()}: ${p.nota}.${duas}` };
}
/* ---------------- A JORNADA ATÉ A BOCA ----------------
   Uma jornada como as outras (`abrirViagem`), com a rota calculada aqui em
   vez de lida de `mapa.rotas` — não há rota no mapa até um covil. E com um
   campo NOVO, `alvo`, que diz que o fim da estrada é uma boca e não uma
   cidade. Campo novo e opcional: a versão antiga o ignora (o save abre). */
export function jornadaAteAMasmorra(ida, opcoes) {
  const { de = "", dia = 0 } = opcoes && typeof opcoes === "object" ? opcoes : {};
  if (!ida || typeof ida !== "object") return null;
  const r = ida.rota, m = ida.masmorra;
  if (!r || r.modo !== "estrada" || !m || !m.nome) return null;
  const q = coordDe(m);
  if (!q) return null;
  const j = abrirViagem({ de: de || r.de, para: m.nome, dia, rota: { km: r.km, dias: r.dias, terreno: r.terreno } });
  const o = garantirCoord(ida.origem);
  /* MM17 nº 3 (v9.364): o caminho com escalas que a conta única escolheu
     (`rotaDoCaminho`, marcha.js) — campo NOVO, só quando existe; a versão
     antiga ignora-o e a ida direta não o leva */
  const per = Array.isArray(r.percurso) && r.percurso.length >= 2 ? { percurso: r.percurso.map((p) => ({ ...p })) } : {};
  return {
    ...j,
    ...per,
    alvo: {
      tipo: "masmorra", nome: String(m.nome),
      coord: { x: q.x, y: q.y },
      origem: o ? { x: o.x, y: o.y } : null,
      nivel: Number(m.nivel) || 0,
      salas: Array.isArray(m.salas) ? m.salas.length : Number(m.salas) || 0,
    },
  };
}

/* ---------------- A CHEGADA À BOCA ----------------
   O fim da estrada (ou da caminhada) quando o destino é uma masmorra. O
   herói fica DIANTE dela: o lugar é a boca, a cidade de referência não
   muda, e o Narrador recebe a ordem de parar à porta. `alvo` é o `alvo`
   da jornada ou a própria masmorra do mundo (a caminhada não tem jornada).
   Devolve o lugar, as linhas da tela (a chegada e o veredito) e a nota. */
export function chegadaABoca(alvo, opcoes) {
  const { cidade = "", dia = 0, pers = null, jornada = null, minutos = 0, mapa = null } = opcoes && typeof opcoes === "object" ? opcoes : {};
  if (!alvo || typeof alvo !== "object" || !alvo.nome) return null;
  const nome = String(alvo.nome);
  const coord = coordDe(alvo.coord || alvo);
  const lugar = definirLugar(nome, { cidade, dia, distancia: IDA_A_MASMORRA.distanciaDaBoca, coord });
  const p = jornada ? progressoDaViagem(jornada) : null;
  let chegou;
  if (p) {
    const dias = Math.max(0.5, Math.round((p.horasTotais / HORAS_MARCHA_POR_DIA) * 10) / 10);
    chegou = `🧭 Fim da estrada: depois de ${decimal(dias)} ${dias === 1 ? "dia" : "dias"} de marcha${p.kmTotais ? ` e ${p.kmTotais} km` : ""}, você está diante ${comDe(nome)}.`;
  } else {
    const min = Number(minutos) || 0;
    chegou = `📍 Você está diante ${comDe(nome)}${min ? ` — ${aPeEmTexto(min)}${cidade ? ` desde ${cidade}` : ""}` : ""}.`;
  }
  const v = vereditoDaMasmorra(alvo, pers, { mapa }); /* S7b: a ficha do lugar, para a porta */
  const linhas = [chegou, v ? v.linha : ""].filter(Boolean);
  const nota = `[CHEGADA À BOCA — REGISTRADA PELO SISTEMA] ${p ? "A estrada acabou:" : "Cheguei:"} eu ESTOU DIANTE DA ENTRADA ${comDe(nome)}, do lado de FORA. Narre a chegada — a fachada, o que se vê da boca, o rasto de quem entrou antes — e pare aqui. NÃO me ponha lá dentro nem descreva o que há depois da porta: entrar é escolha minha, e quem abre a masmorra é o sistema, quando eu a cruzar. E não me faça seguir viagem: a estrada acabou.${v ? ` ${envelopeDaDificuldade(v.dif, `a masmorra "${nome}"`)}` : ""}`;
  return { lugar, linhas, nota };
}
