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
import { abrirViagem, progressoDaViagem, minutosDaRota, HORAS_MARCHA_POR_DIA } from "./viagem.js";
import { dificuldadeDaMasmorra, envelopeDaDificuldade } from "./dificuldade.js";
import { definirLugar, comDe } from "./lugar.js";

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

/* ---------------- QUAIS O HERÓI CONHECE ----------------
   As masmorras que a cidade aponta: a que tem a cidade por "cidade
   próxima" e as da mesma região. É a régua de `oQueExisteAqui`
   (mundo-base.js) — exatamente as que o Mestre recebe no prompt, com
   nível, salas e rumor. Uma masmorra de outra região, de que o herói
   nunca ouviu falar, não vira destino por acaso de nome. */
export function masmorrasConhecidas(masmorras, cidade) {
  const c = cidade && typeof cidade === "object" ? cidade : null;
  if (!c || !c.nome) return [];
  return (Array.isArray(masmorras) ? masmorras : [])
    .filter((m) => m && m.nome && (m.cidadeProxima === c.nome || (!!c.regiao && m.regiao === c.regiao)));
}

/* A masmorra cuja boca é o lugar onde o herói está, ou null. O lugar da
   boca tem o nome da masmorra (é assim que `chegadaABoca` o registra), e
   o artigo não conta: "Nave de Ferro" e "A Nave de Ferro" são a mesma. */
export function masmorraDaBoca(lugar, masmorras) {
  if (!lugar || typeof lugar !== "object" || !lugar.nome) return null;
  const k = semArtigo(lugar.nome);
  if (!k) return null;
  return (Array.isArray(masmorras) ? masmorras : []).find((m) => m && m.nome && semArtigo(m.nome) === k) || null;
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
  if (masmorraDaBoca(lugar, [masmorra])) return lugar;
  return definirLugar(String(masmorra.nome), { cidade, dia, distancia: IDA_A_MASMORRA.distanciaDaBoca, coord: coordDe(masmorra.coord || masmorra) });
}

/* ---------------- A ESTRADA ATÉ A BOCA ----------------
   `origem` é o ponto do herói (a cidade, o arredor onde está, o meio da
   estrada). Sem ponto de partida ou sem o ponto da masmorra não há conta,
   e não há palpite: `null` — o portão da casa, "na dúvida, não move". */
export function rotaAteAMasmorra(masmorra, origem, opcoes) {
  const de = (opcoes && typeof opcoes === "object" && opcoes.de) || "";   // `= {}` não cobre null
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

/* ---------------- O VEREDITO À PORTA ----------------
   A conta de sempre (`dificuldadeDaMasmorra`) e a linha de sempre — a que o
   App punha na tela DEPOIS de a porta abrir. Só muda QUANDO se lê. Serve à
   masmorra do mundo (salas é um número) e à gerada (salas é a planta). */
export function vereditoDaMasmorra(masmorra, pers) {
  if (!masmorra || typeof masmorra !== "object" || !masmorra.nome) return null;
  /* sem herói não há veredito: a conta de um grupo vazio é um número sobre
     ninguém, e um veredito sobre ninguém é mentira com cara de regra */
  if (!pers || typeof pers !== "object") return null;
  const dif = dificuldadeDaMasmorra(masmorra, pers);
  if (!dif) return null;
  const p = dif.patamar;
  return { dif, linha: `${p.icone} ${masmorra.nome} — ${p.rotulo.toUpperCase()}: ${p.nota}. (${dif.porque})` };
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
  return {
    ...j,
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
  const { cidade = "", dia = 0, pers = null, jornada = null, minutos = 0 } = opcoes && typeof opcoes === "object" ? opcoes : {};
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
  const v = vereditoDaMasmorra(alvo, pers);
  const linhas = [chegou, v ? v.linha : ""].filter(Boolean);
  const nota = `[CHEGADA À BOCA — REGISTRADA PELO SISTEMA] ${p ? "A estrada acabou:" : "Cheguei:"} eu ESTOU DIANTE DA ENTRADA ${comDe(nome)}, do lado de FORA. Narre a chegada — a fachada, o que se vê da boca, o rasto de quem entrou antes — e pare aqui. NÃO me ponha lá dentro nem descreva o que há depois da porta: entrar é escolha minha, e quem abre a masmorra é o sistema, quando eu a cruzar. E não me faça seguir viagem: a estrada acabou.${v ? ` ${envelopeDaDificuldade(v.dif, `a masmorra "${nome}"`)}` : ""}`;
  return { lugar, linhas, nota };
}
