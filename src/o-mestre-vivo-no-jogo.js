/* o-mestre-vivo-no-jogo.js (a fiação do Mestre novo · 19/11/2026) — a ponte
   pura entre os refs do App e `a-cena-do-jogo.js`.

   O desenho é mente/lancamento/o-mestre-vivo.md §15.4 e §16. O App só
   executa: lê os refs, chama estas funções dentro de `calou(...)` e põe na
   tela o que elas dizem. Tudo o que DECIDE mora aqui, provado em Node por
   `testes/teste-mestre-vivo-fiacao.mjs`:

   - A CHAVE (`MESTRE_VIVO`, `lerAChaveDoMestreVivo`): desligada por omissão,
     guardada na configuração local (fora do save), como a das peças. O
     jogador real só cai no Mestre novo se a ligar à mão.
   - O RETRATO (`retratoDosRefs`): os valores crus dos refs → o retrato no
     formato de `FORMA_DO_RETRATO`. Só copia e normaliza; nunca inventa um
     campo. Sem saber onde o herói está, `null` — e o turno é o de hoje.
   - O QUE O MOMENTO FAZ (`oQueOMomentoFaz`): a resposta de
     `chamadoDoMomento` → uma de quatro portas do App («hoje», «destino»,
     «acontece», «rola»).
   - A PAUTA (`pautaDoMomento`): o que o Narrador recebe pelo canal de UM
     turno (`{ acabou, naoPode }`, motor/pauta-do-turno.js) — nunca bloco
     estático: o teto do prompt é sagrado.
   - O ESPONTÂNEO (`podeOMundoProvocar`, `rolagemDoEspontaneo`): quando o
     mundo pode pedir um dado entre dois turnos, e a rolagem que ele abre.

   Puro: sem React, sem relógio, sem sorte. Lixo devolve null (ou o lado
   seguro) e nunca lança. */
import { FORMA_DO_RETRATO, ONDE_DO_RETRATO, O_DADO_DO_MUNDO } from "./a-cena-do-jogo.js";
import { RESPOSTAS_DA_PERGUNTA, lerCena, estadoPorId, alguemPodeNotar } from "./cena-do-momento.js";
import { familiaDaAcao } from "./motor/a-regua-do-momento.js";
import { lancamento } from "./motor/a-bandeja.js";
import { dificuldadeSocial } from "./social.js";

const obj = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const txt = (x) => (typeof x === "string" ? x.trim() : "");
const num = (x) => (typeof x === "number" && Number.isFinite(x) ? x : null);

/* ---------------- A CHAVE ----------------
   `chave`: a configuração local (localStorage), fora do save;
   `parametros`: os nomes aceitos na URL (`?mestre=1` liga e grava, `=0`
   apaga) — o segundo é o nome que o roteiro de §15.4 escreveu;
   `liga`: o valor que liga. Nada disto aparece em tela nenhuma. */
export const MESTRE_VIVO = Object.freeze({
  chave: "taverna_cfg_mestre_vivo",
  parametros: Object.freeze(["mestre", "mestrevivo"]),
  liga: "1",
  porque: "o Mestre que lê o momento está em prova: o jogador real só cai nele se o ligar à mão",
});

/* lerAChaveDoMestreVivo(storage, busca) → true | false. `storage`: o
   localStorage ({ getItem, setItem, removeItem }); `busca`: o
   location.search. Nunca lança; sem storage, desligado. */
export function lerAChaveDoMestreVivo(storage, busca) {
  try {
    const b = String(busca || "");
    for (const p of MESTRE_VIVO.parametros) {
      const m = b.match(new RegExp(`[?&]${p}=([01])(?:&|$)`));
      if (!m || !storage) continue;
      if (m[1] === MESTRE_VIVO.liga) storage.setItem(MESTRE_VIVO.chave, MESTRE_VIVO.liga);
      else if (typeof storage.removeItem === "function") storage.removeItem(MESTRE_VIVO.chave);
      break;
    }
    return !!storage && storage.getItem(MESTRE_VIVO.chave) === MESTRE_VIVO.liga;
  } catch {
    return false;
  }
}

/* ---------------- O RETRATO ----------------
   `v`: os valores crus que o App leu dos refs (cada um já dentro do seu
   `calou`):
     lugar, cidade, jornada (o objeto da jornada, ou null), minuto, clima,
     presentes   — quemAgeAqui(quemAgora()): [{ nome, papel, deOnde }],
     npcs        — npcsRef.current (o registo, por nome),
     rotinas     — { [nome]: fichaDaPessoa(...).rotina.agora },
     grupo, inimigos, encontro, masmorra, achado (bool), segredos,
     favorAqui (bool), relogios, condicoes (do herói), passos, onde, quest;
     21/11 (o-mestre-vivo.md §21): inventario (os nomes do que é do herói:
     o inventário e o equipado), chao (chaoRef) e tentativas (o livro);
     21/11 (§23): semente, dia e saqueados (a base do mundo) — o árbitro do
     que há escondido nas coisas ao toque.
   Devolve o retrato com as chaves de FORMA_DO_RETRATO (nenhuma outra), ou
   null quando nada diz onde o herói está (ONDE_DO_RETRATO). */
const DE_ONDE_DO_POSTO = "sitio";
function pessoasDoRetrato(v) {
  const npcs = obj(v.npcs) ? v.npcs : {};
  const rotinas = obj(v.rotinas) ? v.rotinas : {};
  const out = [];
  for (const p of arr(v.presentes)) {
    const nome = obj(p) ? txt(p.nome) : txt(p);
    if (!nome || out.some((x) => x.nome === nome)) continue;
    const n = obj(npcs[nome]) ? npcs[nome] : {};
    const pessoa = { nome, papel: txt(n.papel) || (obj(p) ? txt(p.papel || p.rotulo) : "") };
    if (txt(n.relacao)) pessoa.relacao = txt(n.relacao);
    if (txt(n.status)) pessoa.status = txt(n.status);
    if (Array.isArray(n.condicoes)) pessoa.condicoes = n.condicoes;
    if (txt(rotinas[nome])) pessoa.agora = txt(rotinas[nome]);
    pessoa.doPosto = obj(p) && p.deOnde === DE_ONDE_DO_POSTO;
    out.push(pessoa);
  }
  return out;
}
export function retratoDosRefs(v) {
  try {
    if (!obj(v)) return null;
    const lugar = obj(v.lugar) && txt(v.lugar.nome) ? v.lugar : null;
    const r = {
      lugar,
      cidade: txt(v.cidade),
      jornada: !!v.jornada,
      minuto: num(v.minuto),
      clima: obj(v.clima) || txt(v.clima) ? v.clima : null,
      pessoas: pessoasDoRetrato(v),
      grupo: arr(v.grupo).filter(obj),
      inimigos: arr(v.inimigos).filter(obj),
      encontro: obj(v.encontro) ? v.encontro : null,
      masmorra: obj(v.masmorra) ? v.masmorra : null,
      achado: v.achado === true,
      segredos: arr(v.segredos).filter(obj),
      favorAqui: v.favorAqui === true,
      relogios: arr(v.relogios).filter(obj),
      heroi: { condicoes: arr(v.condicoes), inventario: arr(v.inventario) },
      chao: obj(v.chao) ? v.chao : null,
      tentativas: obj(v.tentativas) ? v.tentativas : {},
      passos: arr(v.passos).filter(obj),
      onde: obj(v.onde) ? v.onde : null,
      quest: obj(v.quest) ? v.quest : {},
      /* 21/11 (o-mestre-vivo.md §23): o árbitro das coisas ao toque */
      semente: txt(String(v.semente == null ? "" : v.semente)),
      dia: num(v.dia),
      saqueados: arr(v.saqueados).filter((x) => typeof x === "string"),
    };
    /* só as chaves da forma: o retrato não ganha campo que a cena não lê */
    for (const k of Object.keys(r)) if (!(k in FORMA_DO_RETRATO)) delete r[k];
    if (!ONDE_DO_RETRATO.some((k) => r[k] != null && r[k] !== false && r[k] !== "")) return null;
    return r;
  } catch {
    return null;
  }
}

/* ---------------- O QUE O MOMENTO FAZ ----------------
   A resposta de `chamadoDoMomento` → a porta do App:
     "hoje"     — sem resposta, ou sem cena: o caminho de hoje, sem mudar nada;
     "destino"  — a sorte decide: o d6 cai à vista, o Narrador recebe o `diz`;
     "acontece" — não rola: narra-se acontecendo;
     "rola"     — rola (com o chamado, ou sem linha quando não havia preço). */
export const PORTAS_DO_MOMENTO = Object.freeze(["hoje", "destino", "acontece", "rola"]);
export function oQueOMomentoFaz(m) {
  if (!obj(m) || !m.cena) return "hoje";
  if (m.porque === "erro") return "hoje";
  if (obj(m.destino)) return "destino";
  return m.rola ? "rola" : "acontece";
}

/* O veredito que não rola vira o «livre» do catálogo, com o porquê da régua
   — o envelope de «acontece» que o catálogo já tem (envelopeDeVeredicto). O
   porquê é bastidor: vai ao Narrador, nunca à tela. */
/* 19/11 (o-mestre-vivo.md §18): o porquê que vai ao Narrador é FATO DE
   CENA, nunca a regra. Até aqui ia o `diz` da linha da régua («ninguém tem
   motivo para negar: a conversa resolve», «o bónus torna o resultado
   certo»), e o Narrador o repetia em voz alta («o sucesso te garante o
   favor sem risco», sessão mv-2, T16). `naCena`: por linha da régua (ou veto
   do Mestre de hoje) que não rola, o que é verdade na cena, na voz do
   jogador (o envelope é na primeira pessoa). Sem linha aqui, o padrão. A
   suíte confere que nenhuma frase fala de dado, teste, sucesso, sorte, risco
   ou regra, e que toda linha da régua que não rola tem a sua. */
export const O_QUE_ACONTECE = Object.freeze({
  porquePadrao: "não há nada em jogo aqui",
  naCena: Object.freeze({
    naoETeste: "não há nada em jogo aqui",
    saberComum: "eu já sei isto",
    trivial: "não há nada que se oponha",
    automatico: "eu faço isto sem esforço",
    mundoDisseNao: "isso não existe aqui",
    jaResolvido: "isto já ficou acertado antes",
    jaTestado: "o que aconteceu da outra vez continua valendo",
    impossivel: "não cede, e não vai ceder",
    alavanca: "o que eu trago (a senha, a chave, o papel certo) abre o caminho",
    aVista: "está à vista, bem diante dos olhos",
    semResposta: "quem ouviria não pode responder",
    pergunta: "quem sabe responde; quem esconde, desconversa",
    medoCede: "quem me ouve já está com medo, e cede",
    dispostoCede: "quem me ouve está do meu lado, e aceita",
    falaSemOposicao: "quem me ouve não perde nada com isso, e aceita",
    ouvirQuemFala: "a pessoa fala comigo, e eu ouço o que ela diz",
    somClaro: "dá para ouvir tudo daqui",
    silencio: "não há nada para ouvir além do silêncio do lugar",
    buscaVazia: "não há nada escondido aqui: só o que está à vista",
    ninguemVe: "não há ninguém por perto para notar",
    travessiaCalma: "o caminho é firme e não há pressa",
    semTranca: "não há tranca: abre",
    socorroCalmo: "não há pressa nem perigo, e o cuidado é feito com calma",
    entreOsSeus: "é entre os meus, sem ninguém de fora para conquistar",
    bichoManso: "o bicho é manso e chega sem medo",
    maoLeveSemOlhos: "não há ninguém que possa notar a minha mão",
    ceuAVista: "o céu está aberto e diz a hora e o rumo",
    jaSabeOAssunto: "eu já conheço o assunto",
    doProprioHeroi: "é meu: eu conheço cada canto",
    coisaComum: "é coisa de toda feira: qualquer um conhece",
    heroiJaSabe: "eu já sei isto",
    semResistencia: "não há o que resista: basta um empurrão",
  }),
  /* o que nenhuma frase do porquê pode dizer: é a regra falando */
  proibidas: /\b(dado|dados|rol\w+|teste|testes|sucesso|sorte|risco|regra|mestre|b[oô]nus|per[ií]cia)\b/i,
});
export function vereditoDoQueAcontece(v, m) {
  if (!obj(v)) return null;
  const id = obj(m) ? txt(m.porque).replace(/^encadeada:/, "") : "";
  const porque = O_QUE_ACONTECE.naCena[id] || O_QUE_ACONTECE.porquePadrao;
  return Object.freeze({ ...v, tipo: "livre", porque });
}

/* ---------------- A PAUTA DO MOMENTO ----------------
   O que o Narrador recebe pelo canal de UM turno (`acabou` → ACABOU DE,
   `naoPode` → NÃO PODE). As palavras da resposta são as de
   RESPOSTAS_DA_PERGUNTA (cena-do-momento.js); aqui só a moldura da linha.
   «franca» não ganha linha: responder o que sabe é o normal. O nome do
   estado nunca vai — só o efeito. */
export const PAUTA_DO_MESTRE_VIVO = Object.freeze({
  resposta: Object.freeze({
    acabou: "Quem eu interroguei {diz}.",
    naoPode: Object.freeze({
      evasiva: "entregar a verdade que essa pessoa guarda só porque eu perguntei",
      recusa: "fazer essa pessoa colaborar de boa vontade",
      silencio: "fazer quem não pode responder falar",
    }),
  }),
  /* 19/11 (§18): sem palavra de mecânica — o Narrador repete o que lê */
  destino: "Como a coisa ficou: {diz}. Conte isso sem número.",
  encadeada: "Da minha frase, só um ato estava em jogo; os outros acontecem como eu disse.",
  /* o veto de todo turno que acontece sem dado (a porta «acontece»): o
     Narrador não explica a regra na boca de ninguém */
  semMecanica: "explicar por que deu certo ou por que não havia o que temer: ninguém na cena fala em sucesso, teste, dado, sorte, folga ou risco",
  /* 21/11 (o-mestre-vivo.md §20): A NARRAÇÃO QUE DESMENTE O VEREDITO. A quarta
     sessão viu a fala cair em quem estava mais perto (Perrin respondendo pelo
     velho, Isolde pelo vendedor de água), a Intimidação que passou virar
     «não levo ameaça a sério», e a gazua que a ficha nega girar na prosa. O
     sistema sabia os três — a quem a frase falava, que o resultado manda, o
     que o herói não tem —, e não os dizia ao Narrador. Agora vão pelo canal de
     um turno: `alvo` (acabou) e `outraBoca`/`contraOResultado` (não pode),
     em toda conversa com alvo; `semOQueNaoTem`, quando a ficha nega o meio.
     `alvoSemNome`: o alvo que a frase disse pelo papel («velho»). */
  alvo: "Eu falei com {alvo}, e é essa pessoa quem reage ao que eu disse.",
  alvoSemNome: "quem eu chamei de «{alvo}»",
  outraBoca: "pôr a reação na boca de outra pessoa que não {alvo}",
  contraOResultado: "fazer essa pessoa reagir ao contrário do que ficou decidido (quem se dobrou não desdenha da ameaça, quem não acreditou não obedece)",
  semOQueNaoTem: "fazer acontecer o que a minha ficha não permite ({porque}), nem pôr na minha mão o que falta",
});
export function pautaDoMomento(m) {
  try {
    if (!obj(m)) return null;
    const P = PAUTA_DO_MESTRE_VIVO;
    const acabou = [], naoPode = [];
    if (obj(m.destino) && txt(m.destino.diz)) acabou.push(P.destino.replace("{diz}", txt(m.destino.diz)));
    if (!m.rola && txt(m.resposta) && m.resposta !== "franca") {
      const r = RESPOSTAS_DA_PERGUNTA.find((x) => x.id === m.resposta);
      if (r) acabou.push(P.resposta.acabou.replace("{diz}", r.diz));
      if (P.resposta.naoPode[m.resposta]) naoPode.push(P.resposta.naoPode[m.resposta]);
    }
    if (m.rola && /^encadeada:/.test(String(m.porque || ""))) acabou.push(P.encadeada);
    /* 21/11 (§20): a conversa tem dono, e o resultado manda na reação dele */
    const alvo = txt(m.alvo);
    if (alvo) {
      const dito = /^[A-ZÀ-Ý]/.test(alvo) ? alvo : P.alvoSemNome.replace("{alvo}", alvo);
      acabou.push(P.alvo.replace("{alvo}", dito));
      naoPode.push(P.outraBoca.replace("{alvo}", dito));
      if (m.rola) naoPode.push(P.contraOResultado);
    }
    /* 21/11 (§20): o meio que a ficha nega não aparece na prosa */
    const v = obj(m.veredito) ? m.veredito : null;
    if (v && v.tipo === "impossivel" && txt(v.porque)) naoPode.push(P.semOQueNaoTem.replace("{porque}", txt(v.porque)));
    if (!m.rola && m.cena && !obj(m.destino)) naoPode.push(P.semMecanica);
    return acabou.length || naoPode.length ? Object.freeze({ acabou, naoPode }) : null;
  } catch {
    return null;
  }
}

/* ---------------- O DADO DO DESTINO NA MESA ----------------
   O d6 cai na bandeja com a cor da sorte; o envelope diz ao Narrador só o
   resultado em palavras (o `diz`), como um envelope de sistema. */
export const O_DESTINO_NA_MESA = Object.freeze({
  rotulo: "A sorte",
  papel: "sorte",
  envelope: "[SEM TESTE — DECISÃO DO SISTEMA] Eu perguntei pelo que a sorte fez. O sistema rolou o dado da sorte, sem perícia: {diz}. Narre isso em uma ou duas frases, sem dizer número nem dado, e devolva a palavra para mim.",
});
export function lanceDoDestino(m) {
  try {
    const d = obj(m) && obj(m.destino) ? m.destino : null;
    if (!d || !num(d.dado)) return null;
    return lancamento({ rotulo: O_DESTINO_NA_MESA.rotulo, dados: [{ faces: num(d.faces) || 6, valor: d.dado }], papel: O_DESTINO_NA_MESA.papel });
  } catch {
    return null;
  }
}
export function envelopeDoDestino(m) {
  const d = obj(m) && obj(m.destino) ? m.destino : null;
  return d && txt(d.diz) ? O_DESTINO_NA_MESA.envelope.replace("{diz}", txt(d.diz)) : "";
}

/* ---------------- O ESPONTÂNEO ----------------
   O mundo só provoca entre dois turnos, com a mesa livre: há um retrato de
   antes (ao carregar um save ele é null, e o primeiro turno não provoca),
   não há luta, nem rolagem, nem chamado, nem escolha à espera, nem o
   Narrador a falar, e o encontro da estrada não tem o pedido dele em aberto
   (ele já pede a Percepção do sinal). */
export function podeOMundoProvocar(s) {
  if (!obj(s)) return false;
  return !!s.antes && !s.emCombate && !s.rolagem && !s.chamado && !s.escolha && !s.carregando
    && !(obj(s.encontro) && s.encontro.pedido);
}
/* o motivo que a linha do chamado diz («para perceber o que se aproxima») */
export const MOTIVO_DO_ESPONTANEO = Object.freeze({
  percepcao: "perceber o que se aproxima",
  furtividade: "passar sem ser visto",
  saberes: "lembrar do que sabe disso",
});
/* rolagemDoEspontaneo(prov, pericia) → os campos da rolagem que o App abre
   (setRolagem), ou null. `prov`: chamadoQueOMundoProvoca(...); `pericia`:
   periciaPorId(prov.pericia). A dificuldade é a do chamado (o degrau
   «comum»); o preço dito é o risco de O_DADO_DO_MUNDO. Sem `chave` no
   desafio: o livro de tentativas não ganha um teste que o jogador não fez.
   19/11 (§17): o desafio leva a marca do mundo (`doMundo`) e o que o mundo
   mostra (`mostra`, O_QUE_O_MUNDO_MOSTRA) — é por eles que o resultado pousa
   no envelope do espontâneo, e nunca no da busca. Sem o que mostrar, null. */
export function rolagemDoEspontaneo(prov, pericia) {
  try {
    if (!obj(prov) || !obj(prov.chamado) || !obj(pericia) || !obj(prov.mostra) || !txt(prov.mostra.oQue)) return null;
    const dc = num(Number(prov.chamado.dc));
    if (dc == null) return null;
    const motivo = MOTIVO_DO_ESPONTANEO[prov.pericia] || txt(prov.porque);
    const risco = O_DADO_DO_MUNDO.risco[prov.pericia] || "";
    return Object.freeze({
      rotulo: txt(pericia.nome), pericia: txt(pericia.id), tipo: txt(pericia.atributo),
      motivo, origem: "pedido", dificuldade: dc,
      desafio: Object.freeze({
        id: O_DADO_DO_MUNDO.chave, rotulo: motivo, pericia: txt(pericia.id), atributo: txt(pericia.atributo),
        escolha: Object.freeze({ risco, podeDesistir: false }),
        doMundo: true, estado: txt(prov.estado), mostra: prov.mostra,
      }),
    });
  } catch {
    return null;
  }
}

/* ---------------- O CONSERTO DEPOIS DA PRIMEIRA SESSÃO (19/11/2026) ----------------
   mente/lancamento/o-mestre-vivo.md §17. */

/* 1. O ESPONTÂNEO POUSA NO SEU ENVELOPE. O resultado do dado que o mundo
   provocou: o herói PERCEBE (ou não) o que o mundo fez, e não age — nem
   revista, nem mexe, nem anda. O texto do que se percebe vem do estado
   (O_QUE_O_MUNDO_MOSTRA, a-cena-do-jogo.js); o veto vai em `naoPode`, pelo
   canal de UM turno, com quem o sistema sabe que não está aqui (a poda do
   ausente, motor/poda-do-ausente.js: a mesma linha que ela escreve). Perceber
   não paga: nada entra na bolsa por este dado. */
export const O_ESPONTANEO_NA_MESA = Object.freeze({
  envelope: "[O MUNDO SE MEXEU — DECIDIDO PELO SISTEMA] Eu não fiz nada: o mundo é que se mexeu, e o sistema rolou {pericia} por mim, sem que eu pedisse. {resultado} Narre só o que eu percebo (ou deixo de perceber), em uma ou duas frases, e devolva a palavra para mim.",
  passou: "Passei.",
  falhou: "Falhei.",
  naoPode: Object.freeze([
    "dizer que eu revistei, mexi, toquei, peguei, abri ou fiz qualquer coisa que eu não escrevi",
    "me dar achado, moeda ou item por este dado: perceber não paga",
  ]),
  ausentes: 3,
});
export function ehDoMundo(des) {
  return obj(des) && des.doMundo === true && des.id === O_DADO_DO_MUNDO.chave && obj(des.mostra) && !!txt(des.mostra.oQue);
}
const encher = (molde, m) => String(molde || "").replace(/\{oQue\}/g, txt(m.oQue)).replace(/\{efeito\}/g, txt(m.efeito));
const maiuscula = (x) => (x ? x.charAt(0).toUpperCase() + x.slice(1) : x);
export function envelopeDoEspontaneo(des, passou) {
  try {
    if (!ehDoMundo(des)) return "";
    const m = des.mostra;
    const P = O_ESPONTANEO_NA_MESA;
    const oQueVe = maiuscula(encher(passou ? m.passou : m.falhou, m));
    const resultado = `${passou ? P.passou : P.falhou} ${oQueVe}`;
    return P.envelope.replace("{pericia}", txt(des.rotulo) ? `um teste para ${txt(des.rotulo)}` : "um teste").replace("{resultado}", resultado);
  } catch {
    return "";
  }
}
/* a pauta do turno do espontâneo: os vetos, e os ausentes (`ausentes`: o
   que osAusentes devolve — [{ nome, onde, morto }]) pela linha da poda */
export function pautaDoEspontaneo(des, ausentes, linhaDoAusente) {
  try {
    if (!ehDoMundo(des)) return null;
    const naoPode = [...O_ESPONTANEO_NA_MESA.naoPode];
    if (typeof linhaDoAusente === "function") {
      for (const a of arr(ausentes).filter(obj).slice(0, O_ESPONTANEO_NA_MESA.ausentes)) {
        const l = txt(linhaDoAusente(txt(a.nome), txt(a.onde), !!a.morto));
        if (l && txt(a.nome)) naoPode.push(l);
      }
    }
    return Object.freeze({ acabou: [], naoPode });
  } catch {
    return null;
  }
}

/* 1b. O MESTRE VIVO CALA A OFERTA DA CHEGADA. Os dois «espontâneos» da
   sessão (a chegada ao posto da estrada e à Sala das Cartas) não eram do
   Mestre vivo: eram o «Olhar à volta» do Mestre de hoje (motor/o-mestre-pede.js),
   uma BUSCA posta na boca do herói — e o envelope da busca narrou-o a revirar
   a mesa e o baú de quem ele queria por cliente. Com a chave ligada, o dado
   que vem sem ação é o do mundo (o espontâneo, acima), e a oferta da chegada
   cala. A de ler a pessoa fica: é o jogador que aceita ler alguém. */
export const PEDIDOS_QUE_O_MESTRE_VIVO_CALA = Object.freeze({
  chegada: "a chegada não é um gesto do herói: o dado sem ação é o que o mundo provoca (chamadoQueOMundoProvoca)",
});
export function oMestreVivoCalaOPedido(id) {
  return typeof id === "string" && Object.prototype.hasOwnProperty.call(PEDIDOS_QUE_O_MESTRE_VIVO_CALA, id);
}

/* 2. FALHA NUNCA PAGA. O «sim, pago» da margem (desafios.js#desfechoDaMargem:
   falhar por um ou dois é conseguir pagando) pôs 168 moedas na bolsa de um
   herói cujo dado dizia «✕ falhou». No Mestre vivo, onde o sucesso é achar,
   ouvir ou perceber, a falha é falha: o desafio que o momento julgou
   (`doMomento`) não ganha o meio. A força e o corpo continuam com o «sim,
   pago» (a porta cede errada, o muro sobe machucado): ali o preço é pele,
   e não um achado de graça. */
export const SEM_FIO_NO_MOMENTO = Object.freeze(["busca", "investigacao", "escuta", "rastro", "improviso_percepcao", "improviso_intelecto"]);
export function semFioNoMomento(des) {
  return obj(des) && des.doMomento === true && SEM_FIO_NO_MOMENTO.includes(txt(des.alvoDoCusto));
}
/* o veredito que vai ao dado, marcado pelo momento: `doMomento` e a
   vantagem que a cena dá (a régua: quem vai ser roubado dorme) */
/* 19/11 (o-mestre-vivo.md §19): A FALHA COBRA O QUE A CENA SABE. «Me escondo
   atrás da lona» falhou (sessão mv-3, T25), e a narração disse que ninguém
   olhou: o envelope da falha dizia só «o corpo aparece onde não devia», e o
   Narrador escolheu quem via — ninguém. Mas a régua só rolou PORQUE alguém
   podia notar, e sabe quem. Na falha seca de esgueirar e de mão leve, o preço
   é o fato «quem está ali me vê» (`secaDoMomento`, lido por
   desafios.js#desfechoDaMargem), com o nome de quem a cena tem; sem nome, as
   testemunhas da rua, ou alguém por perto. Na primeira pessoa, como o
   envelope; sem palavra de regra. */
export const O_PRECO_NA_CENA = Object.freeze({
  esgueirar: "{quem} me vê onde eu não devia estar, e não tira mais os olhos de mim",
  furtar: "{quem} vê a minha mão onde ela não devia estar",
  naRua: "alguém na rua",
  alguem: "alguém por perto",
});
function quemVeNaCena(cena, quem) {
  const c = lerCena(cena);
  if (!c) return "";
  const acordado = (p) => !p.estados.includes("do_grupo") && !p.estados.some((id) => (estadoPorId(id) || {}).inerte);
  const q = txt(quem).toLowerCase();
  const alvo = (q && c.pessoas.find((p) => acordado(p) && (txt(p.nome).toLowerCase() === q || txt(p.papel).toLowerCase() === q))) || c.pessoas.find(acordado);
  if (alvo) return txt(alvo.nome) || (txt(alvo.papel) ? `o ${txt(alvo.papel)}` : O_PRECO_NA_CENA.alguem);
  if (alguemPodeNotar(c)) return c.cena.estados.includes("com_testemunhas") ? O_PRECO_NA_CENA.naRua : O_PRECO_NA_CENA.alguem;
  return "";
}
export function marcarDoMomento(v, m) {
  if (!obj(v)) return v;
  const vantagem = obj(m) ? txt(m.vantagem) : "";
  let seca = "";
  try {
    const molde = O_PRECO_NA_CENA[familiaDaAcao(v)];
    const quem = molde && obj(m) ? quemVeNaCena(m.cena, txt(v.pessoa && v.pessoa.nome) || txt(v.quem)) : "";
    if (molde && quem) seca = maiuscula(molde.replace("{quem}", quem));
  } catch { seca = ""; }
  return Object.freeze({ ...v, doMomento: true, ...(vantagem ? { vantagemDoMomento: vantagem } : {}), ...(seca ? { secaDoMomento: seca } : {}) });
}

/* 4. O QUE ACONTECE SEM DADO APLICA O QUE ACONTECEU. Sem dado é sucesso sem
   risco — e o efeito do sucesso quem aplica é o sistema, como aplicaria ao
   dado que passou: a conversa com quem está disposto ganha o envelope social
   do sim (o que o sim compra, e o que não compra) e o livro de tentativas
   fecha-a como conseguida; o curativo calmo fecha como feito. O que não tem
   efeito de sistema (a busca sem nada escondido, o passo sem ninguém que
   note) narra-se acontecendo, e para a cobrança continua sem ganho: não
   havia nada a ganhar ali. `efeito`: "social" | "socorro" | "nenhum". */
export const O_QUE_ACONTECE_SEM_DADO = Object.freeze({
  social: Object.freeze(["dispostoCede", "medoCede", "falaSemOposicao", "alavanca"]),
  socorro: Object.freeze(["socorroCalmo"]),
  /* 21/11 (a sexta sessão, T8 e T28): o sim que não fecha no livro. O sim de
     quem «não perde nada com isso» é um não que só tem ausência (é por isso
     que mora em CALA_POR_AUSENCIA, a-regua-do-momento.js): vale para ESTE
     pedido, que não custa nada. Fechado no livro como «conseguido», ele
     calava o pedido seguinte à mesma pessoa no mesmo degrau, que já custa —
     o peixe seco dado de graça fazia o regateio do preço ouvir «isso você já
     conseguiu aqui». Quem está do meu lado, com medo, ou comprado pela
     alavanca continua assim, e o sim dele fecha. */
  naoFecha: Object.freeze(["falaSemOposicao"]),
});
/* `o.frase` / `o.pers`: a frase do jogador e a ficha. A conta do sim social
   refaz-se pela FRASE do jogador (social.js#dificuldadeSocial): a fala que só
   a escuta ouviu chega com o veredito da frase-modelo do catálogo («tento
   convencer o guarda…»), e o sim compraria o que ela pede, não o que o
   jogador pediu (visto no jogo, 19/11: «quebrar uma regra pequena» por uma
   chave de fenda emprestada). `quem`: a pessoa que a frase nomeia. */
/* 19/11 (§18): O SIM SEM DADO TEM O SEU ENVELOPE. O sim chegava ao Narrador
   pelo envelope do teste social (social.js#envelopeSocial: «O QUE O SUCESSO
   COMPROU… o teste já foi»), e não houve teste: o Narrador escreveu «O
   sucesso te garante o favor sem risco» dentro da fala (sessão mv-2, T16 —
   o «sem risco» era o «um favor de quem não arrisca nada» do degrau). Aqui
   o sim é fato de cena: o que a pessoa faz e o que não faz, sem a palavra
   sucesso nem teste. «e CONSEGUI» fica, porque é por ele que a ficha do ator
   e a janela leem o desfecho (ficha-de-ator.js, janela.js). */
export const O_SIM_SEM_DADO = Object.freeze({
  envelope: "[SOCIAL — RESOLVIDO PELO SISTEMA]{disse} Falei com {quem} e CONSEGUI: a pessoa aceita.{pago}\nO QUE ELA FAZ POR MIM, exatamente: {cede}.\nO QUE ELA NÃO FAZ: {nunca}.\nREGRA DESTE ENVELOPE (obrigatória): mostre a pessoa aceitando, na voz e no jeito dela, e entregue o que está na primeira linha, inteiro. Não entregue nada da segunda. E não explique por que deu certo: ninguém na cena fala em sucesso, teste, sorte ou risco.",
  pago: " Já paguei {moedas} moedas por isto, e elas já saíram da minha bolsa.",
  quemPadrao: "essa pessoa",
});
export function envelopeDoSimSemDado(conta, o) {
  try {
    if (!obj(conta) || !txt(conta.cede)) return "";
    const op = obj(o) ? o : {};
    const S = O_SIM_SEM_DADO;
    const disse = txt(op.oQueEuDisse) ? ` Eu disse: "${txt(op.oQueEuDisse)}".` : "";
    const moedas = num(conta.custoEmMoedas);
    return S.envelope
      .replace("{disse}", disse)
      .replace("{quem}", txt(op.quem) || S.quemPadrao)
      .replace("{pago}", moedas && moedas > 0 ? S.pago.replace("{moedas}", String(moedas)) : "")
      /* o degrau diz primeiro o que ele É («um favor de quem não arrisca nada
         com ele: …») e depois o que compra; ao Narrador vai só o que compra */
      .replace("{cede}", txt(conta.cede).includes(":") ? txt(conta.cede).split(":").slice(1).join(":").trim() : txt(conta.cede))
      .replace("{nunca}", txt(conta.nunca) || "nada além disso");
  } catch {
    return "";
  }
}
export function oQueAconteceSemDado(v, m, o) {
  const porque = obj(m) ? txt(m.porque) : "";
  const vale = obj(v) && v.tipo === "teste";
  if (vale && obj(v.social) && Number.isFinite(Number(v.dc)) && O_QUE_ACONTECE_SEM_DADO.social.includes(porque)) {
    const op = obj(o) ? o : {};
    const pessoa = obj(v.pessoa) ? v.pessoa : null;
    let conta = v.social;
    try { if (txt(op.frase)) conta = dificuldadeSocial({ texto: txt(op.frase), pessoa, pers: obj(op.pers) ? op.pers : null, pericia: txt(v.pericia) }) || v.social; } catch { conta = v.social; }
    /* 21/11 (§20): sem a pessoa do elenco, quem a régua achou na frase */
    const quem = (pessoa && txt(pessoa.nome)) || txt(v.quem) || txt(m.alvo) || "";
    /* `envelope`: o sim como fato de cena (O_SIM_SEM_DADO) — o App o prefere
       ao envelope do teste social */
    return Object.freeze({ efeito: "social", desfecho: "sucesso", fecha: !O_QUE_ACONTECE_SEM_DADO.naoFecha.includes(porque), conta, quem, envelope: envelopeDoSimSemDado(conta, { quem, oQueEuDisse: txt(op.frase) }) });
  }
  if (vale && O_QUE_ACONTECE_SEM_DADO.socorro.includes(porque)) return Object.freeze({ efeito: "socorro", desfecho: "sucesso", fecha: true });
  return Object.freeze({ efeito: "nenhum", desfecho: "falha", fecha: false });
}

/* ---------------- A FALA DA MESA ----------------
   21/11 (o-mestre-vivo.md §20): o que a tela diz quando o Mestre vivo está
   ligado, no lugar das linhas do Mestre de hoje que explicam o mecanismo. A
   quarta sessão listou como texto de regra: «⚖ Faltaram 2, e ainda assim:»,
   «⚖ Por um fio:», «⛔ Assim não dá: … Outro jeito: à força, no ombro», «↺ Você
   já tentou … Insistir igual não muda nada — …», «✓ Isso você já conseguiu
   aqui — sem dado», «🗣 Não contou: …» e o fragmento «🔊 no braço faz
   barulho.». O sistema não fala de si: fica o que aconteceu, na voz de um
   mestre de mesa, e o «sem dado» some (a narração conta). Com a chave
   desligada nada disto é lido — o Mestre de hoje segue com as falas dele.
   Uma função por linha de tela; "" quer dizer «nada na tela». */
export const A_FALA_DA_MESA = Object.freeze({
  jaTentou: "↺ Desse jeito você já tentou aqui, e não deu. Com ajuda, outra ferramenta ou bem mais tempo, talvez.",
  jaRevistou: "↺ Isso você já revirou assim. Com ajuda, outra ferramenta ou bem mais tempo, talvez apareça o que escapou.",
  vasculhado: "🔍 Aqui já foi revirado até o fundo: não sobrou nada.",
  impossivel: "⛔ {porque}{talvez}.",
  talvez: " — talvez {como}",
  custo: "{glifo} {diz}.",
  glifoDoCusto: Object.freeze({ porPouco: "⚖", falha: "↯" }),
  barulho: "🔊 Isso fez barulho.",
  blefe: "🗣 {porque}.",
  /* o que nenhuma destas falas pode dizer: é a regra falando */
  proibidas: /\b(dado|teste|sucesso|sorte|regra|mestre|b[oô]nus|per[ií]cia|faltaram|por um fio|insistir|outro jeito|n[aã]o contou|sem dado)\b/i,
});
/* o veredito do catálogo que não rola → a linha da tela, ou null para a do
   Mestre de hoje (o que não é destes tipos fica como está) */
export function falaDoVeredictoNaMesa(v) {
  try {
    if (!obj(v)) return null;
    const F = A_FALA_DA_MESA;
    if (v.tipo === "vasculhado") return F.vasculhado;
    if (v.tipo === "jaTentou") return v.apósSucesso ? F.jaRevistou : F.jaTentou;
    if (v.tipo === "livre") return "";
    if (v.tipo === "impossivel" && txt(v.porque)) {
      const como = arr(v.comoSeria).map(txt).filter(Boolean);
      return F.impossivel.replace("{porque}", maiuscula(txt(v.porque))).replace("{talvez}", como.length ? F.talvez.replace("{como}", como.join(" ou ")) : "");
    }
    return null;
  } catch {
    return null;
  }
}
/* o desfecho da margem (desafios.js#desfechoDaMargem) → só o que aconteceu */
export function falaDoCustoNaMesa(des) {
  try {
    if (!obj(des) || !txt(des.diz)) return null;
    const F = A_FALA_DA_MESA;
    const glifo = des.porPouco || des.meiaVerdade ? F.glifoDoCusto.porPouco : F.glifoDoCusto.falha;
    return F.custo.replace("{glifo}", glifo).replace("{diz}", maiuscula(txt(des.diz).replace(/[.\s]+$/, "")));
  } catch {
    return null;
  }
}
export function falaDoBarulhoNaMesa() {
  return A_FALA_DA_MESA.barulho;
}
/* os blefes que a conta social não aceitou (social.js#falaDosBlefes) → o fato */
export function falaDosBlefesNaMesa(conta) {
  try {
    const bs = obj(conta) ? arr(conta.blefes).filter(obj) : [];
    if (!bs.length) return null;
    const porque = bs.map((b) => txt(b.porque)).filter(Boolean);
    if (!porque.length) return null;
    return A_FALA_DA_MESA.blefe.replace("{porque}", maiuscula(porque.join("; ")));
  } catch {
    return null;
  }
}
