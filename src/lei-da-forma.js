/* ============================================================
   A LEI DA FORMA (v9.165) — o porteiro do molde

   O relato que trouxe isto: "se eu crio um mundo de torre que diz que
   é de 100 andares, e pra passar daquele andar você tem que matar o
   boss dele, o mestre tem que saber a regra e saber qual é o boss que
   eu tenho que matar — e quando eu matar, ele cria a situação pra eu
   subir".

   A Torre existia desde a v9.40 com essa promessa escrita no molde:
   `gatilho: "só se sobe pelo portal, e o portal só abre de baixo para
   cima"`. Só que a frase morava no PROMPT e em lugar nenhum do código
   — era a mesma classe de defeito que custou a missão dos três lobos:
   regra escrita sem código atrás. O Narrador recebia a regra, o
   jogador dizia "subo ao andar 40", e nada no sistema tinha como
   discordar. A promessa do molde era propaganda.

   Aqui cada molde declara a sua LEI, e a lei tem três partes, todas
   executadas por código:

     A TRAVA    o que impede uma partida, conferido ANTES de o
                Narrador narrar qualquer coisa. Na Torre, o portal só
                leva ao andar seguinte, e só depois que o guardião do
                andar atual cair. No Arquipélago, a maré fecha certas
                rotas por dias. No Braço Estelar, só se salta pelo que
                tem rota registrada.

     A CHAVE    o fato que abre a trava, detectado pelo sistema. A
                morte do guardião vira a chave da Torre no instante em
                que o registro de mortes a vê — não quando o Narrador
                se lembra dela.

     A CENA     quando a chave vira, o SISTEMA cria a situação da
                passagem — envelope pronto, com a carne do léxico por
                cima ("um portal se abre", "uma chave se forma", "o
                selo reconhece"). Nunca um pedido ao Narrador para que
                ele "faça acontecer": foi exatamente esse pedido que
                produziu as pegadas eternas dos lobos.

   E AS TERRAS ABERTAS? A lei delas é NÃO TER TRAVA — a estrada franca
   é a identidade do molde, não um esquecimento. Ela está declarada
   como `lei: null` de propósito, e este arquivo devolve "passa" para
   ela sem olhar mais nada.

   A REGRA DO PORTÃO VALE AQUI DOBRADO: na dúvida, a trava NÃO morde.
   Um destino que o mapa não conhece, um molde sem lei, um save de
   antes desta versão — tudo isso passa. Falso positivo aqui é um
   jogador preso numa cidade por um bug, que é pior do que qualquer
   incoerência que a trava evitaria.
   ============================================================ */

import { rngDe } from "./geografia.js";
import { moldePorId } from "./moldes.js";
import { criaturasDoGenero } from "./bestiario.js";
import { nomePessoa } from "./nomes.js";
import { criaturasDaAmeaca, comoFunciona } from "./lexico.js";

/* comparação de nomes sem acento nem caixa — a mesma régua de sempre */
const semA = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];

/* ---------------- O ESTADO ----------------
   O que a lei precisa lembrar entre sessões: quais andares já tiveram
   o guardião vencido. É a única lei com memória — a maré é função do
   dia e a rota de salto é função do mapa, e função pura não se grava. */
export function garantirForma(f) {
  const o = f && typeof f === "object" ? f : {};
  const vencidos = {};
  if (o.vencidos && typeof o.vencidos === "object") {
    for (const [k, v] of Object.entries(o.vencidos)) if (v) vencidos[semA(k)] = true;
  }
  return { v: 1, vencidos };
}

export function leiDe(molde) {
  const m = moldePorId(molde && molde.id ? molde.id : molde);
  return m.lei || null;
}

/* ---------------- A TORRE: OS ANDARES ---------------- */
const andares = (mapa) => ((mapa && mapa.cidades) || []).filter((c) => Number.isFinite(Number(c.z))).sort((a, b) => (a.z || 0) - (b.z || 0));
export function andarPorNome(mapa, nome) {
  const alvo = semA(nome);
  return andares(mapa).find((c) => semA(c.nome) === alvo) || null;
}
export function proximoAndar(mapa, nome) {
  const atual = andarPorNome(mapa, nome);
  if (!atual) return null;
  return andares(mapa).find((c) => (c.z || 0) > (atual.z || 0)) || null;
}

/* ---------------- O GUARDIÃO DO ANDAR ----------------
   Determinístico como tudo o que é mundo: a mesma semente e o mesmo
   andar dão sempre o mesmo guardião, sem gravar nada. Nasce da mesma
   cozinha dos chefes do mundo — banco de criaturas do gênero, nome do
   léxico quando o mundo tem língua própria — para que a ficha dele em
   combate saia do SISTEMA como a de qualquer chefe. */
const TITULOS_DE_GUARDIAO = [
  "o Guardião do Degrau", "a Chave Viva", "o Sino do Andar", "o Peso da Porta",
  "o Que Não Deixa", "a Última Parede", "o Cobrador da Subida", "o Fecho",
  "a Sentinela Cega", "o Dono do Vão", "a Dobradiça", "o Juramento de Pedra",
];
export function guardiaoDoAndar(semente, mapa, genero, nomeAndar, lex = null) {
  const cid = andarPorNome(mapa, nomeAndar);
  if (!cid) return null;
  const todos = andares(mapa);
  const total = Math.max(1, todos.length);
  const z = Number(cid.z) || 1;
  const rnd = rngDe(`${semente}|guardiao|${cid.nome}`);
  /* a força acompanha a altura: a fração da Torre decide o degrau de
     ameaça e o nível, do porteiro do sopé ao dono da coroa */
  const f = z / total;
  const ameaca = f < 0.2 ? "comum" : f < 0.45 ? "competente" : f < 0.8 ? "elite" : "lendario";
  const nivel = Math.max(2, Math.min(20, Math.round(2 + f * 18)));
  const titulo = pick(rnd, TITULOS_DE_GUARDIAO);
  const humanoide = rnd() < 0.4;
  const ehTopo = todos.length && semA(todos[todos.length - 1].nome) === semA(cid.nome);
  let especie = "";
  {
    /* o léxico nomeia o bicho quando o mundo tem bestiário próprio;
       o banco do gênero responde quando não tem — o mesmo || de sempre */
    const doLex = criaturasDaAmeaca(lex, ameaca);
    if (doLex) especie = doLex[Math.floor(rnd() * doLex.length)];
    else {
      const banco = criaturasDoGenero(genero).filter((c) => c.nivelRef >= Math.max(1, nivel - 6) && c.nivelRef <= nivel + 4);
      const tudo = banco.length ? banco : criaturasDoGenero(genero);
      especie = tudo.length ? pick(rnd, tudo).nome : "guardião";
    }
  }
  const nomeProprio = humanoide ? nomePessoa(genero, undefined, rnd, lex) : "";
  return {
    id: `guardiao|${cid.nome}`,
    nome: humanoide ? `${nomeProprio}, ${titulo}` : `${especie}, ${titulo}`,
    nomeCurto: humanoide ? String(nomeProprio).split(" ")[0] : especie,
    especie: especie || "guardião",
    andar: cid.nome, z,
    nivel, ameaca,
    gd: ehTopo ? 3 : 0,
  };
}

/* A ficha pelo nome, para a reconciliação do combate — o mesmo contrato
   de `chefePorNome`: quando o Mestre abre a luta contra o guardião, o
   nível e o GD saem daqui, não do que ele lembrou de escrever. */
export function guardiaoPorNome(semente, mapa, genero, nome, lex = null, molde = null) {
  const lei = leiDe(molde);
  if (!lei || lei.id !== "guardiao") return null;
  const alvo = semA(nome);
  if (!alvo) return null;
  for (const c of andares(mapa)) {
    const g = guardiaoDoAndar(semente, mapa, genero, c.nome, lex);
    if (g && (alvo.includes(semA(g.nomeCurto)) || semA(g.nome) === alvo)) return g;
  }
  return null;
}

/* ---------------- A MARÉ ----------------
   Função pura do dia: nada a gravar, nada a dessincronizar. Cada rota
   sorteia (pela semente) se é uma rota de maré e em que fase do ciclo
   ela abre — cerca de um terço fecha e abre com os dias, e o resto é
   mar franco. O número é jogável de propósito: esperar um a três dias
   se resolve dormindo, e dormir num porto é cena, não castigo. */
const chaveDaRota = (de, para) => [semA(de), semA(para)].sort().join("|");
export function mareDaRota(semente, lei, de, para, dia) {
  const periodo = Math.max(2, (lei && lei.periodo) || 6);
  const janela = Math.max(1, Math.min(periodo - 1, (lei && lei.janela) || 3));
  const rnd = rngDe(`${semente}|mare|${chaveDaRota(de, para)}`);
  if (rnd() >= 0.35) return { presa: false, aberta: true, abreEm: 0 };
  const fase = Math.floor(rnd() * periodo);
  const f = ((Number(dia) || 0) + fase) % periodo;
  const aberta = f < janela;
  return { presa: true, aberta, abreEm: aberta ? 0 : periodo - f };
}

/* ---------------- OS VIZINHOS DE SALTO ---------------- */
const vizinhosDe = (mapa, nome) => {
  const alvo = semA(nome);
  const out = [];
  for (const r of (mapa && mapa.rotas) || []) {
    if (semA(r.de) === alvo) out.push(r.para);
    else if (semA(r.para) === alvo) out.push(r.de);
  }
  return out;
};

/* ---------------- A TRAVA ----------------
   A pergunta única que o App faz antes de toda partida: esta viagem
   pode começar? `null` é "pode" — e é a resposta para tudo o que a lei
   não entende, porque o porteiro morde só o que conhece. */
export function travaDaPartida(ctx) {
  /* lê do objeto em vez de desestruturar: `= {}` não cobre null, e o
     porteiro é chamado com o que houver — a armadilha da v9.149, de novo */
  const o = ctx && typeof ctx === "object" ? ctx : {};
  const { molde, semente, mapa, forma, lex = null, genero = "", de, para, dia = 0 } = o;
  const lei = leiDe(molde);
  if (!lei || !de || !para || semA(de) === semA(para)) return null;

  if (lei.id === "guardiao") {
    const cDe = andarPorNome(mapa, de), cPara = andarPorNome(mapa, para);
    if (!cDe || !cPara) return null;
    /* descer é sempre livre: a promessa da Torre é para cima */
    if ((cPara.z || 0) <= (cDe.z || 0)) return null;
    const prox = proximoAndar(mapa, de);
    if (prox && semA(cPara.nome) !== semA(prox.nome)) {
      return {
        lei: "guardiao",
        motivo: `não há caminho direto até ${cPara.nome} — o portal deste andar leva ao seguinte, e só`,
        dica: `para cima, o próximo é ${prox.nome}`,
      };
    }
    const f = garantirForma(forma);
    if (f.vencidos[semA(cDe.nome)]) return null;
    const g = guardiaoDoAndar(semente, mapa, genero, cDe.nome, lex);
    if (!g) return null;
    return {
      lei: "guardiao",
      motivo: `o portal deste andar segue cego — ${g.nome} ainda respira`,
      dica: "a passagem só abre quando o guardião do andar cair",
      guardiao: g,
    };
  }

  if (lei.id === "mare") {
    const rota = ((mapa && mapa.rotas) || []).find((r) =>
      (semA(r.de) === semA(de) && semA(r.para) === semA(para)) ||
      (semA(r.de) === semA(para) && semA(r.para) === semA(de)));
    /* sem rota registrada é mar aberto, e mar aberto não tem maré de
       tabela: a travessia longa já cobra o preço dela em dias */
    if (!rota) return null;
    const m = mareDaRota(semente, lei, rota.de, rota.para, dia);
    if (m.aberta) return null;
    return {
      lei: "mare",
      motivo: `a maré fechou a rota para ${para} — nenhum casco cruza essa barra hoje`,
      dica: `ela abre em ${m.abreEm} ${m.abreEm === 1 ? "dia" : "dias"}`,
      abreEm: m.abreEm,
    };
  }

  if (lei.id === "rota") {
    const alvo = semA(para);
    const conhece = ((mapa && mapa.cidades) || []).some((c) => semA(c.nome) === alvo);
    if (!conhece) return null;
    const viz = vizinhosDe(mapa, de);
    if (viz.some((v) => semA(v) === alvo)) return null;
    return {
      lei: "rota",
      motivo: `não há rota de salto registrada entre ${de} e ${para} — o motor não salta para onde não há rota`,
      dica: viz.length ? `daqui se salta para: ${viz.slice(0, 4).join(", ")}` : "",
    };
  }

  return null;
}

/* ---------------- A CHAVE ----------------
   Chamada pelo registro de mortes: se quem caiu é o guardião do andar
   em que o herói está, a forma marca o andar vencido e devolve o
   evento — e é o evento que vira cena, nunca o contrário. A régua de
   casamento de nome é a MESMA de `chefePorNome`, porque as duas
   folgas têm de errar juntas: uma régua mais dura aqui deixaria o
   registro dizer "morto" e o portal dizer "vivo" sobre o mesmo corpo. */
export function chaveDaMorte(ctx, nomeMorto) {
  const o = ctx && typeof ctx === "object" ? ctx : {};   /* null-seguro, como acima */
  const { molde, semente, mapa, forma, lex = null, genero = "", cidadeAtual } = o;
  const lei = leiDe(molde);
  if (!lei || lei.id !== "guardiao" || !cidadeAtual) return null;
  const alvo = semA(nomeMorto);
  if (!alvo) return null;
  const f = garantirForma(forma);
  if (f.vencidos[semA(cidadeAtual)]) return null;
  const g = guardiaoDoAndar(semente, mapa, genero, cidadeAtual, lex);
  if (!g) return null;
  if (!(alvo.includes(semA(g.nomeCurto)) || semA(g.nome) === alvo)) return null;
  const forma2 = { ...f, vencidos: { ...f.vencidos, [semA(cidadeAtual)]: true } };
  return { forma: forma2, guardiao: g, de: cidadeAtual, para: (proximoAndar(mapa, cidadeAtual) || {}).nome || "" };
}

/* ---------------- A CENA ----------------
   O envelope que o Mestre recebe quando a chave vira. A mecânica é
   sempre a mesma — guardião caiu, passagem aberta —; a CARNE vem do
   léxico quando o mundo respondeu "como se passa" na criação, e do
   molde quando não respondeu. Cada caso é um caso na ficção; no osso,
   nenhum. */
export function envelopeDaPassagem(lex, molde, abriu) {
  if (!abriu) return "";
  const m = moldePorId(molde && molde.id ? molde.id : molde);
  const carne = comoFunciona(lex, "passagem")
    || (m.gatilho && m.gatilho.regra ? `Aqui, ${m.gatilho.regra}.` : "A passagem se abre diante de todos.");
  if (!abriu.para) {
    return `[A COROA — decidido pelo SISTEMA] ${abriu.guardiao.nome} caiu, e acima de ${abriu.de} não existe mais nada: este era o último degrau. Narre o silêncio de um mundo que acabou de ficar sem teto — o peso disso é o clímax de uma campanha, não uma nota de rodapé.`;
  }
  return `[A PASSAGEM ABRE — decidido pelo SISTEMA] ${abriu.guardiao.nome} caiu, e a lei deste mundo cumpre a promessa: o caminho de ${abriu.de} para ${abriu.para} está aberto. ${carne} Narre o momento em que a passagem se revela — é a primeira vez que ela se abre, e todo mundo no andar sente. NÃO mova o herói: atravessar é escolha dele, e a partida quem registra é o sistema.`;
}

/* A recusa, para o Narrador encenar a tentativa sem deixá-la acontecer. */
export function envelopeDaTrava(trava, de, para) {
  if (!trava) return "";
  return `[PARTIDA NEGADA — pelo SISTEMA] Tentei partir de ${de || "aqui"} para ${para}, mas ${trava.motivo}.${trava.dica ? ` ${trava.dica[0].toUpperCase()}${trava.dica.slice(1)}.` : ""} Narre a tentativa e o que a impede — a viagem NÃO começa, não me ponha na estrada e não abra a passagem você mesmo: quando ela abrir, o sistema avisa.`;
}

/* A linha da tela. Curta, no mundo, sem falar de sistema. */
export function falaDaTrava(trava) {
  if (!trava) return "";
  return `⚿ ${trava.motivo[0].toUpperCase()}${trava.motivo.slice(1)}${trava.dica ? ` — ${trava.dica}` : ""}.`;
}

/* ---------------- O QUE SOBE À PAUTA ----------------
   A lei do lugar onde a cena está, para o Narrador saber dela ANTES de
   o jogador esbarrar na trava. Na Torre, quem guarda este andar; no
   porto, o estado da maré das rotas presas. O Braço Estelar não põe
   linha: a vizinhança de salto já sai na seção DAQUI do Geógrafo, e
   duas versões da mesma verdade é como nasce a divergência. */
export function leiParaPauta(ctx) {
  const o = ctx && typeof ctx === "object" ? ctx : {};   /* null-seguro, como acima */
  const { molde, semente, mapa, forma, lex = null, genero = "", cidadeAtual, dia = 0 } = o;
  const out = { onde: [], naoPode: [] };
  const lei = leiDe(molde);
  if (!lei || !cidadeAtual) return out;

  if (lei.id === "guardiao") {
    const f = garantirForma(forma);
    const prox = proximoAndar(mapa, cidadeAtual);
    if (f.vencidos[semA(cidadeAtual)]) {
      if (prox) out.onde.push(`a passagem deste andar está ABERTA: o caminho para ${prox.nome} espera quem quiser subir`);
    } else {
      const g = guardiaoDoAndar(semente, mapa, genero, cidadeAtual, lex);
      if (g) {
        out.onde.push(`quem guarda este andar: ${g.nome} (${g.especie}, nível ${g.nivel}) — enquanto respirar, não se sobe`);
        out.naoPode.push(`subir de andar: a passagem está fechada até ${g.nomeCurto} cair, e quem a abre é o sistema`);
      }
    }
  }

  if (lei.id === "mare") {
    const presas = [];
    for (const r of ((mapa && mapa.rotas) || [])) {
      const aqui = semA(r.de) === semA(cidadeAtual) ? r.para : semA(r.para) === semA(cidadeAtual) ? r.de : "";
      if (!aqui) continue;
      const m = mareDaRota(semente, lei, r.de, r.para, dia);
      if (!m.presa) continue;
      presas.push(m.aberta ? `${aqui} (maré ABERTA hoje)` : `${aqui} (maré fechada — abre em ${m.abreEm}d)`);
    }
    if (presas.length) out.onde.push(`rotas de maré deste porto: ${presas.slice(0, 3).join(" · ")}`);
  }

  return out;
}

/* O bloco fixo do prompt: a existência da lei, uma vez, para sempre.
   Os detalhes de cada cena viajam pela Pauta e pelos envelopes. */
export const LEI_DA_FORMA_PROMPT = `A LEI DA FORMA (v9.165):
- Alguns mundos TRAVAM a passagem: o portal que só abre quando o guardião do andar cai, a maré que fecha rotas por dias, o salto que exige rota registrada. Quem confere e quem abre é o SISTEMA.
- Nunca abra você mesmo uma passagem travada, por mais que a cena peça — nem portal, nem maré, nem rota. Quando a chave virar, o sistema manda o envelope da abertura, e aí a cena é sua.
- Se a Pauta nomear quem guarda o andar, esse guardião EXISTE, com nível do sistema: apresente-o quando a história pedir, e deixe claro o tamanho dele antes do confronto, não depois.`;
