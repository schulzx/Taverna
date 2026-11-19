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
import { RESPOSTAS_DA_PERGUNTA } from "./cena-do-momento.js";
import { lancamento } from "./motor/a-bandeja.js";

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
     favorAqui (bool), relogios, condicoes (do herói), passos, onde, quest.
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
      heroi: { condicoes: arr(v.condicoes) },
      passos: arr(v.passos).filter(obj),
      onde: obj(v.onde) ? v.onde : null,
      quest: obj(v.quest) ? v.quest : {},
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
export const O_QUE_ACONTECE = Object.freeze({
  porquePadrao: "não há nada em jogo aqui",
});
export function vereditoDoQueAcontece(v, m) {
  if (!obj(v)) return null;
  const porque = (obj(m) && txt(m.diz)) || O_QUE_ACONTECE.porquePadrao;
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
  destino: "A sorte decidiu, sem perícia: {diz}. Conte isso, sem número.",
  encadeada: "Da minha frase, só um ato pediu dado; os outros acontecem, sem dado.",
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
   desafio: o livro de tentativas não ganha um teste que o jogador não fez. */
export function rolagemDoEspontaneo(prov, pericia) {
  try {
    if (!obj(prov) || !obj(prov.chamado) || !obj(pericia)) return null;
    const dc = num(Number(prov.chamado.dc));
    if (dc == null) return null;
    const motivo = MOTIVO_DO_ESPONTANEO[prov.pericia] || txt(prov.porque);
    const risco = O_DADO_DO_MUNDO.risco[prov.pericia] || "";
    return Object.freeze({
      rotulo: txt(pericia.nome), pericia: txt(pericia.id), tipo: txt(pericia.atributo),
      motivo, origem: "pedido", dificuldade: dc,
      desafio: Object.freeze({ id: O_DADO_DO_MUNDO.chave, rotulo: motivo, pericia: txt(pericia.id), atributo: txt(pericia.atributo), escolha: Object.freeze({ risco, podeDesistir: false }) }),
    });
  } catch {
    return null;
  }
}
