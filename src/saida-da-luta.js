/* ============================================================
   A SAÍDA DA LUTA (Fase MM · a luta tem saída) — Taverna

   O DEFEITO QUE ESTE MÓDULO FECHA, medido na quinta sessão de prova
   (`mente/mm11-sessao-5.md`, defeito 1): o grupo inteiro caiu, o herói
   estabilizou, e o Dragão Jovem ficou a 1,5 m com 3/29 PV SEM AGIR — porque
   `turnoDosInimigos` só bate em quem tem PV, e quem estava de pé do outro
   lado não tinha ninguém em quem bater. O botão de esperar girou dezoito
   vezes (28% das chamadas do Narrador da sessão) para repetir a mesma
   imagem, e o herdeiro entrou numa luta que continuava aberta.

   A REGRA, numa frase: UMA LUTA EM QUE NINGUÉM PODE AGIR ACABOU. Há três
   portas para ela, e só três:

     · `caidos`  — não há ninguém de pé do meu lado (o herói e o grupo a 0
                   PV, morrendo, estáveis ou mortos). Quem ficou de pé do
                   outro lado DECIDE o que faz com os caídos, por tabela.
     · `sem_heroi` — o herói morreu e o grupo ainda está de pé. Sem quem o
                   jogador comande, o grupo recolhe o corpo e recua.
     · `parada`  — N rodadas seguidas em que nada mudou (ninguém bateu,
                   ninguém andou, nenhum PV mexeu). O "esperar" deixa de
                   poder girar para sempre: quem está do outro lado larga.

   Do lado de lá ninguém de pé é vitória, e ela tem a sua porta própria
   (`fecharSeTodosCairam`, no App) — este módulo devolve `null` aí.

   O QUE O VENCEDOR FAZ é a pergunta que um Mestre de mesa responde quando
   o grupo inteiro cai, e a resposta sai de duas tabelas: a CABEÇA de quem
   ficou de pé (a mente e o degrau, `degraus.js`, os mesmos que escolhem o
   alvo durante a luta) e o ESTADO dele (inteiro ou sangrando). A intenção
   que o Adversário já declarou na luta (`adversario.js`) manda primeiro:
   quem queria "sair inteiro daqui" vai-se embora, quem queria "levar vivo"
   leva prisioneiros.

   Nada aqui é sorteio, menos duas coisas, e as duas vão presas à semente
   que o App passa: as horas até acordar (o 1d4 horas do 5e para quem está
   estável) e o resto dos testes de morte de quem ficou a morrer quando o
   vencedor se foi.

   O SISTEMA NÃO FALA DE SI: `linha` é o que a tela do fim da luta mostra —
   o que o inimigo FEZ, nunca o nome da regra. `envelope` é para o Narrador
   e viaja na mensagem do turno, nunca no prompt fixo.
   ============================================================ */

import { sorteDaCasa } from "./semente.js";
import { degrauDaCriatura } from "./degraus.js";
import { menteDaCriatura } from "./adversario.js";
import { testeDeMorte, aplicarTesteMorte } from "./combate.js";
import { distanciaM } from "./grid.js";

/* ---------------- OS NÚMEROS ----------------
   · rodadasParadas — três vezes o mundo agiu e nada mudou. Duas seria
     pouco para quem espera de tocaia uma rodada a mais; quatro já era o
     botão a girar sem sentido. É a régua da sessão 5: depois da terceira
     imagem igual, a mesa já tinha parado de jogar.
   · limiarFerido — metade da vida, o "sangrando" do 5e: é aí que um
     bicho deixa de pensar em ganhar e passa a pensar em sair.
   · horasAteAcordar — o 5e: quem estabiliza volta com 1 PV em 1d4 horas.
   · pvAoAcordar — o mesmo 1 PV.
   · horasAteOHerdeiro — quem pega o fio não chega no mesmo minuto em que
     o outro caiu: a notícia tem de correr.
   · tetoDeTestes — o laço do resto dos testes de morte acaba sempre (três
     sucessos ou três falhas chegam em cinco dados), mas um laço sem teto é
     uma dívida que um dado viciado cobra. */
export const SAIDA_DA_LUTA = {
  rodadasParadas: 3,
  limiarFerido: 0.5,
  horasAteAcordar: { min: 1, max: 4 },
  pvAoAcordar: 1,
  horasAteOHerdeiro: 12,
  tetoDeTestes: 12,
};

/* ---------------- OS DESFECHOS ----------------
   Cada um diz o que acontece com os caídos e com a bolsa, e traz as duas
   frases: a da tela (curta, o que o inimigo fez) e a do Narrador.

   · `inimigoSai` — quem estava de pé do outro lado sai da luta VIVO
     (`fugiu`: não rende XP nem tem o nome riscado no registro do mundo).
   · `levaMoedas` — a fração da bolsa que o vencedor leva.
   · `presos` — acordam nas mãos de quem venceu.
   · `morrem` — quem estava caído não acorda. */
export const DESFECHOS_SEM_SAIDA = {
  fuga: {
    id: "fuga", inimigoSai: true, levaMoedas: 0, presos: false, morrem: false,
    linha: "{quem}, ferido, foge e deixa vocês no chão.",
    linhaSo: "{quem}, ferido, foge e deixa você no chão.",
    envelope: "{quem}, ferido, não quis ficar: foi-se embora e deixou-nos no chão.",
    envelopeSo: "{quem}, ferido, não quis ficar: foi-se embora e deixou-me no chão.",
  },
  abandono: {
    id: "abandono", inimigoSai: true, levaMoedas: 0, presos: false, morrem: false,
    linha: "{quem} dá as costas e deixa vocês no chão.",
    linhaSo: "{quem} dá as costas e deixa você no chão.",
    envelope: "{quem} deu-nos as costas e foi-se embora: quem já não se mexe não lhe interessa.",
    envelopeSo: "{quem} deu-me as costas e foi-se embora: quem já não se mexe não lhe interessa.",
  },
  saque: {
    id: "saque", inimigoSai: true, levaMoedas: 1, presos: false, morrem: false,
    linha: "{quem} revira o que vocês carregam, leva a bolsa e vai-se embora.",
    linhaSo: "{quem} revira o que você carrega, leva a bolsa e vai-se embora.",
    envelope: "{quem} revirou o que carregávamos, levou a bolsa e foi-se embora.",
    envelopeSo: "{quem} revirou o que eu carregava, levou a bolsa e foi-se embora.",
  },
  prisioneiros: {
    id: "prisioneiros", inimigoSai: true, levaMoedas: 1, presos: true, morrem: false,
    linha: "{quem} amarra quem caiu e leva todos consigo.",
    linhaSo: "{quem} ata-lhe as mãos e leva você consigo.",
    envelope: "{quem} amarrou-nos, levou a bolsa e levou-nos consigo: acordamos presos, nas mãos dele.",
    envelopeSo: "{quem} atou-me as mãos, levou a bolsa e levou-me consigo: acordo preso, nas mãos dele.",
  },
  abate: {
    id: "abate", inimigoSai: true, levaMoedas: 0, presos: false, morrem: true,
    linha: "{quem} não deixa ninguém de pé para contar.",
    linhaSo: "{quem} acaba com você ali mesmo, no chão.",
    envelope: "{quem} não deixou ninguém de pé para contar: acabou com quem estava caído.",
    envelopeSo: "{quem} acabou comigo ali mesmo, no chão onde caí.",
  },
  retirada: {
    id: "retirada", inimigoSai: true, levaMoedas: 0, presos: false, morrem: false,
    linha: "{quem} larga a luta e vai-se embora.",
    envelope: "{quem} largou a luta e foi-se embora: ninguém conseguia chegar a ninguém.",
  },
  recuo: {
    id: "recuo", inimigoSai: true, levaMoedas: 0, presos: false, morrem: false,
    linha: "{grupo} recolhe o corpo e recua; {quem} fica com o lugar.",
    envelope: "{grupo} recolheu o meu corpo e recuou; {quem} ficou com o lugar.",
  },
};

/* ---------------- O QUE O VENCEDOR FAZ ----------------
   A linha é a CABEÇA de quem ficou de pé: a besta e o morto-vivo pela
   mente (não pensam em bolsa nem em prisioneiro), quem pensa pelo degrau.
   Lido contra o `decide` de cada degrau em `degraus.js`:
     · besta — "comer, expulsar do território, fugir ferido";
     · morto — "cumpre o que foi posto para cumprir";
     · bruto — leva o que dá: a bolsa;
     · astuto — "o que o outro carrega", e sai antes de pagar caro;
     · treinado — "capturar";
     · brilhante — prisioneiro vale mais do que corpo, ferido ou não. */
export const O_QUE_O_VENCEDOR_FAZ = {
  besta:     { inteiro: "abate",        ferido: "fuga" },
  morto:     { inteiro: "abate",        ferido: "abate" },
  /* o degrau `animal` declarado no bestiário, para quem a mente não acha besta */
  animal:    { inteiro: "abate",        ferido: "fuga" },
  bruto:     { inteiro: "saque",        ferido: "saque" },
  astuto:    { inteiro: "saque",        ferido: "fuga" },
  treinado:  { inteiro: "prisioneiros", ferido: "saque" },
  brilhante: { inteiro: "prisioneiros", ferido: "prisioneiros" },
};

/* A INTENÇÃO MANDA PRIMEIRO. Só as intenções que dizem o que fazer com
   quem CAIU estão aqui; as outras (cercar, segurar a porta, apagar a luz)
   falam da luta, e com a luta acabada a cabeça decide.

   E `terminar`/`acabar_o_ferido` NÃO estão, de propósito: são tática de
   MEIO de luta (bater primeiro no que já cambaleia) e disparam sozinhas
   sempre que o grupo está por um fio — ou seja, em toda luta perdida. Na
   primeira prova viva elas transformaram dois salteadores numa execução.
   Matar quem já não se mexe é decisão de quem QUER isso: o que come, o
   que não deixa ninguém de pé, o que confere o corpo, o que se vinga. */
export const INTENCAO_QUE_MANDA = {
  comer: "abate", matar_todos: "abate", confirmar: "abate", vinganca: "abate",
  capturar: "prisioneiros", capturar_um: "prisioneiros", arrancar: "prisioneiros", usar_o_refem: "prisioneiros",
  tirar_a_coisa: "saque", humilhar: "saque",
  sair_vivo: "fuga", fugir_ferido: "fuga", debandar: "fuga", perder_o_animo: "fuga", receoso: "fuga",
  territorio: "abandono", deixar_cair: "abandono",
};

const num = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);
const dePe = (ent) => !!ent && !ent.morto && num(ent.vida) > 0;
const inimigoDePe = (e) => !!e && !e.derrotado && num(e.vida) > 0;
const preencher = (molde, campos) => String(molde || "").replace(/\{(\w+)\}/g, (_, k) => (campos[k] != null ? campos[k] : ""));

/* Quem fala pelo outro lado: o maior corpo que ficou de pé. Empate fica
   com o primeiro da lista — a ordem do campo, que é a mesma em qualquer
   máquina. */
export function quemDecide(inimigos) {
  const vivos = (Array.isArray(inimigos) ? inimigos : []).filter(inimigoDePe);
  if (!vivos.length) return null;
  return vivos.reduce((a, b) => (num(b.vidaMax) > num(a.vidaMax) ? b : a));
}

/* A ESCOLHA DO VENCEDOR — pura, sem dado: a mesma ficha dá sempre o mesmo
   desfecho. */
export function escolhaDoVencedor(inimigo, { intencao = "", lex = null } = {}) {
  const daIntencao = INTENCAO_QUE_MANDA[String(intencao || "")];
  if (daIntencao) return daIntencao;
  const e = inimigo && typeof inimigo === "object" ? inimigo : {};
  const ferido = num(e.vidaMax) > 0 && num(e.vida) / num(e.vidaMax) <= SAIDA_DA_LUTA.limiarFerido;
  let mente = "pensa";
  try { mente = menteDaCriatura(String(e.nome || ""), "", lex) || "pensa"; } catch { mente = "pensa"; }
  let chave = mente === "morto" ? "morto" : mente === "besta" ? "besta" : "";
  if (!chave) { try { chave = degrauDaCriatura(e, { lex }); } catch { chave = "bruto"; } }
  const linha = O_QUE_O_VENCEDOR_FAZ[chave] || O_QUE_O_VENCEDOR_FAZ.bruto;
  return ferido ? linha.ferido : linha.inteiro;
}

/* ---------------- A PERGUNTA: A LUTA AINDA TEM SAÍDA? ----------------
   `null` = a luta continua. Senão, `{ motivo, desfecho, quem }`. */
export function decidirSemSaida({ heroi = null, grupo = null, inimigos = null, paradas = 0, intencao = "", lex = null } = {}) {
  const lista = Array.isArray(inimigos) ? inimigos : [];
  const quem = quemDecide(lista);
  if (!quem) return null;
  const meus = [heroi, ...(Array.isArray(grupo) ? grupo : [])].filter(Boolean);
  const nossosDePe = meus.filter(dePe);
  if (!nossosDePe.length) return { motivo: "caidos", desfecho: escolhaDoVencedor(quem, { intencao, lex }), quem: quem.nome };
  if (heroi && heroi.morto) return { motivo: "sem_heroi", desfecho: "recuo", quem: quem.nome };
  if (num(paradas) >= SAIDA_DA_LUTA.rodadasParadas) return { motivo: "parada", desfecho: "retirada", quem: quem.nome };
  return null;
}

/* ---------------- A RODADA PARADA ----------------
   A assinatura é o que se vê da mesa: a vida de cada um, quem caiu, o
   lugar de cada corpo e os testes de morte. Duas rodadas com a mesma
   assinatura e sem nenhum golpe são a mesma rodada. */
export function assinaturaDaLuta({ heroi = null, grupo = null, inimigos = null, lugares = null } = {}) {
  const h = heroi || {};
  const m = h.morte || {};
  const partes = [
    `h:${num(h.vida)}:${h.morto ? 1 : 0}:${num(m.sucessos)}:${num(m.falhas)}:${m.estavel ? 1 : 0}`,
    ...(Array.isArray(grupo) ? grupo : []).map((g) => `g:${(g && g.nome) || ""}:${num(g && g.vida)}`),
    ...(Array.isArray(inimigos) ? inimigos : []).map((e) => `i:${(e && e.nome) || ""}:${num(e && e.vida)}:${e && e.derrotado ? 1 : 0}:${num(e && e.x)},${num(e && e.y)}`),
    ...(Array.isArray(lugares) ? lugares : []).map((l) => `l:${num(l && l.x)},${num(l && l.y)}`),
  ];
  return partes.join("|");
}

export function contarParadas({ antes = "", depois = "", houveAcao = false, paradas = 0 } = {}) {
  if (houveAcao || !antes || antes !== depois) return 0;
  return num(paradas) + 1;
}

/* ---------------- O RESTO DOS TESTES ----------------
   Quem ficou a morrer quando o vencedor se foi rola até ao fim — de uma
   vez, preso à semente. A tabela de sorte continua inteira em
   `testeDeMorte`/`aplicarTesteMorte`; aqui só se repete. */
export function rolarAteODesfecho(morte, rolar) {
  let estado = { sucessos: num(morte && morte.sucessos), falhas: num(morte && morte.falhas) };
  const rolagens = [...((morte && morte.rolagens) || [])];
  for (let i = 0; i < SAIDA_DA_LUTA.tetoDeTestes; i++) {
    const res = testeDeMorte(rolar);
    rolagens.push({ rolo: res.rolo, tipo: res.tipo, texto: res.texto });
    const ap = aplicarTesteMorte(estado, res);
    if (ap.desfecho !== "morrendo") return { desfecho: ap.desfecho, rolagens: rolagens.slice(-8) };
    estado = { sucessos: ap.sucessos, falhas: ap.falhas };
  }
  /* o teto: quem não decidiu em doze dados fica estável — a falha aberta
     é a vida, nunca a morte por excesso de contas */
  return { desfecho: "estavel", rolagens: rolagens.slice(-8) };
}

const horasDe = (rolar) => {
  const { min, max } = SAIDA_DA_LUTA.horasAteAcordar;
  const r = typeof rolar === "function" ? rolar() : sorteDaCasa();
  return min + Math.floor(r * (max - min + 1));
};

/* ---------------- O DESFECHO APLICADO ----------------
   Recebe a decisão e devolve tudo NOVO — o herói, o grupo, os inimigos —,
   mais o que a tela e o Narrador dizem. Não toca relógio nem tela: quem
   avança as horas e fecha a luta é o App. */
export function aplicarSemSaida({ heroi = null, inimigos = null, decisao = null, rolar = null } = {}) {
  const d = decisao && DESFECHOS_SEM_SAIDA[decisao.desfecho];
  if (!d || !heroi) return null;
  const quem = decisao.quem || "Quem ficou de pé";
  const grupoAntes = Array.isArray(heroi.grupo) ? heroi.grupo : [];
  const caidosNossos = decisao.motivo === "caidos";
  let h = { ...heroi };
  let grupo = grupoAntes;
  const mortosDoGrupo = [];
  let moedasLevadas = 0;
  let horas = 0;
  let morreu = !!heroi.morto;
  let resto = null;

  if (caidosNossos && d.morrem) {
    if (!h.morto) { h = { ...h, vida: 0, morrendo: false, morto: true, morte: { ...(h.morte || {}), sucessos: 0, falhas: 3 } }; morreu = true; }
    grupo = grupoAntes.filter((g) => { const cai = g && !dePe(g); if (cai) mortosDoGrupo.push(g.nome); return !cai; });
  } else if (caidosNossos) {
    /* quem estava a morrer: o captor estabiliza o prisioneiro; nos outros
       desfechos, o dado decide sozinho, até ao fim */
    if (!h.morto && num(h.vida) <= 0) {
      const estavel = !!(h.morte && h.morte.estavel);
      if (!estavel && !d.presos) {
        resto = rolarAteODesfecho(h.morte, rolar);
        if (resto.desfecho === "morto") { h = { ...h, morrendo: false, morto: true, morte: { sucessos: 0, falhas: 3, rolagens: resto.rolagens } }; morreu = true; }
      }
    }
    horas = horasDe(rolar);
    if (!h.morto) h = { ...h, vida: Math.max(num(h.vida), SAIDA_DA_LUTA.pvAoAcordar), morrendo: false, morte: { sucessos: 0, falhas: 0, rolagens: [] } };
    grupo = grupoAntes.map((g) => (g && !g.morto && num(g.vida) <= 0 ? { ...g, vida: SAIDA_DA_LUTA.pvAoAcordar } : g));
  }
  if (d.levaMoedas > 0 && caidosNossos) {
    moedasLevadas = Math.floor(num(h.moedas) * d.levaMoedas);
    h = { ...h, moedas: num(h.moedas) - moedasLevadas };
  }
  h = { ...h, grupo };

  const novos = (Array.isArray(inimigos) ? inimigos : []).map((e) => (inimigoDePe(e) && d.inimigoSai ? { ...e, derrotado: true, fugiu: true } : e));
  const nomesGrupo = grupoAntes.filter(dePe).map((g) => g.nome);
  const campos = { quem, grupo: nomesGrupo.length ? nomesGrupo.join(" e ") : "O grupo" };
  /* sozinho, a frase é de um só — "leva-os consigo" a quem caiu só era a
     gramática a mentir (a segunda prova viva) */
  const so = !grupoAntes.some(Boolean);
  const linha = preencher((so && d.linhaSo) || d.linha, campos);
  const partes = [`[A LUTA ACABOU — RESOLVIDA PELO SISTEMA] ${preencher((so && d.envelopeSo) || d.envelope, campos)}`];
  if (resto && resto.desfecho === "morto") partes.push("Ninguém me acudiu, e o corpo não aguentou: morri no chão onde caí.");
  if (moedasLevadas > 0) partes.push(`Levou ${moedasLevadas} moedas — a bolsa está vazia.`);
  /* a prosa da primeira prova pôs os bandidos a "apanhar as bolsas" de um
     abate que não leva nada: o que fica, fica dito */
  else if (caidosNossos) partes.push(`Não levou nada do que ${so ? "eu carregava" : "carregávamos"}: a bolsa ficou.`);
  if (mortosDoGrupo.length) partes.push(`${mortosDoGrupo.join(" e ")} não ${mortosDoGrupo.length > 1 ? "acordam" : "acorda"}: ${mortosDoGrupo.length > 1 ? "morreram" : "morreu"} ali.`);
  if (horas && !h.morto) partes.push(`${horas} ${horas === 1 ? "hora" : "horas"} depois acordo com ${SAIDA_DA_LUTA.pvAoAcordar} PV${grupo.some((g) => g && num(g.vida) === SAIDA_DA_LUTA.pvAoAcordar && grupoAntes.some((a) => a && a.nome === g.nome && num(a.vida) <= 0)) ? ", e quem caiu comigo também" : ""}${d.presos ? `, de mãos atadas, nas mãos de ${quem}` : ", no mesmo lugar"}.`);
  /* o captor NÃO "já não está aqui" — é dele que o preso acorda refém */
  partes.push(`A luta NÃO continua: ${d.presos ? "acordo preso, sem arma na mão, e não há golpe a dar agora" : d.inimigoSai && decisao.desfecho !== "recuo" ? `${quem} já não está aqui` : "ninguém volta a ela"}. Narre ${h.morto ? "o fim, curto e sem consolo" : horas ? "o despertar e o que ficou" : "o silêncio depois e o que ficou"}, e não invente outro golpe.`);
  return {
    desfecho: decisao.desfecho, motivo: decisao.motivo, quem,
    heroi: h, inimigos: novos, horas, moedasLevadas, mortosDoGrupo, morreu,
    linha, envelope: partes.join(" "),
  };
}

/* ---------------- A VISTA DA LUTA, PARA A PAUTA ----------------
   A sessão 5 mostrou três mentiras da prosa contra o dado, e as três
   nascem do mesmo vazio: o Narrador não recebia o ESTADO da mesa no fim
   da rodada, só os golpes no meio dela. "O dragão sumiu" com ele a 1,5 m;
   "Hakon grita do vão da porta" com ele a 0/12; o sopro no lugar da
   cabeçada. Três linhas curtas, e é tudo:

     · `quem`   — quem está de pé e quem está no chão, com a distância;
     · `vetos`  — quem está no chão não age, e quem está de pé não sumiu;
     · `naoPode` — os golpes desta rodada são os que o sistema nomeou.

   Elas entram na pauta, que tem teto próprio (`TETO_DA_PAUTA`): o prompt
   não cresce uma letra — no pior caso, uma linha de menos prioridade
   cede o lugar. */
export const VISTA_DA_LUTA = { tetoDeGolpes: 3 };

export function vistaDaLuta({ heroi = null, inimigos = null, lugar = null, golpes = null } = {}) {
  const h = heroi || {};
  const grupo = Array.isArray(h.grupo) ? h.grupo : [];
  const dePeLista = [];
  const noChao = [];
  const arma = h.equipados && h.equipados.arma && h.equipados.arma.nome;
  if (dePe(h)) dePeLista.push(`eu ${num(h.vida)}/${num(h.vidaMax)}${arma ? ` (com ${arma})` : ""}`);
  else noChao.push(h.morto ? "eu (morto)" : (h.morte && h.morte.estavel) ? "eu (estável, sem sentidos)" : "eu (a morrer, sem sentidos)");
  for (const g of grupo) {
    if (!g || !g.nome) continue;
    if (dePe(g)) dePeLista.push(`${g.nome} ${num(g.vida)}/${num(g.vidaMax)}`);
    else noChao.push(`${g.nome} (0/${num(g.vidaMax)})`);
  }
  const vivos = (Array.isArray(inimigos) ? inimigos : []).filter(inimigoDePe);
  const posto = !!(lugar && lugar.x != null && lugar.y != null);
  const perto = [];
  for (const e of vivos) {
    const m = posto && e.x != null ? Math.round(distanciaM(e, lugar)) : null;
    dePeLista.push(`${e.nome} ${num(e.vida)}/${num(e.vidaMax)}${m != null ? `, a ${m} m de mim` : ""}`);
    if (m != null) perto.push(`${e.nome} a ${m} m`);
  }
  const quem = `na luta agora — de pé: ${dePeLista.join("; ") || "ninguém"}${noChao.length ? ` · no chão: ${noChao.join("; ")}` : ""}`;
  const vetos = [];
  if (noChao.length) vetos.push(`quem está no chão (${noChao.map((x) => x.replace(/ \(.*\)$/, "")).join(", ")}) não fala, não age, não se levanta, e não muda de lugar`);
  if (perto.length) vetos.push(`${perto.join(", ")}: continua aqui — não sumiu, não saiu, não recuou sem o sistema o mover`);
  const naoPode = [];
  const vistos = [];
  for (const g of Array.isArray(golpes) ? golpes : []) {
    if (!g || !g.quem || !g.golpe) continue;
    const t = `${g.quem}: ${g.golpe}`;
    if (!vistos.includes(t)) vistos.push(t);
  }
  if (vistos.length) naoPode.push(`os golpes desta rodada foram ${vistos.slice(0, VISTA_DA_LUTA.tetoDeGolpes).join(", ")} — não narre outro ataque no lugar deles`);
  return { quem, vetos, naoPode };
}

/* ---------------- O QUE O HERDEIRO PRECISA SABER ----------------
   A última luta que acabou por esta porta, guardada no save (campo novo,
   que a versão antiga ignora): é com ela que quem pega o fio chega
   sabendo o que aconteceu. `= {}` não cobre `null` — trata-se aqui. */
export function garantirFimSemSaida(x) {
  if (!x || typeof x !== "object") return null;
  const linha = typeof x.linha === "string" ? x.linha.trim().slice(0, 240) : "";
  if (!linha) return null;
  return { linha, horas: Math.max(0, Math.round(num(x.horas))) };
}
