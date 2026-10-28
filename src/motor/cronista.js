/* ============================================================
   O CRONISTA PROPÕE, O MOTOR DECIDE (Fase T1, trilha B · 27/10)

   A auditoria do motor (mente/auditoria-do-motor.md, §2 e §7.3) achou o
   buraco da promessa "a IA só narra": o Cronista — a chamada leve que lê a
   narração depois de cada turno — ainda DECIDIA estado. O `App.jsx`
   (`cronistaDoTurno`) aplicava o JSON dele quase como vinha:

   · o LUGAR onde o herói está (`lugar`), passando só pela régua do lugar;
   · quem ENTROU NO GRUPO (`grupo.entraram`): o nome bastava para a ficha
     do companheiro nascer, sem convite nenhum do jogador;
   · a DEVOÇÃO (`fe.fieis` 10 a 500, `fe.pf` 1 a 10): o número era dele;
   · QUANTO PAGA um trabalho (`missao_oferecida.paga`): "o número EXATO
     que a cena prometeu" — e a cena é a prosa do Narrador, outra IA (o
     relatório do "Narrador só narra" mediu o número inventado 4 vezes);
   · e o que uma personagem DISSE virava fato: na 11.ª sessão (o eco,
     mente/mm11-sessao-11.md) a ameaça de Branca Pau Seco ("devolve na
     saída ou perde as orelhas no pelourinho") entrou no Livro de Promessas
     como promessa do mundo, voltou ao Mestre como verdade e virou a Ronda
     "das orelhas" — 4 dos 7 fios inventados da sessão.

   Daqui em diante o Cronista só PROPÕE. `julgarOCronista` lê a proposta
   contra o estado do jogo e devolve três listas:

   · `aceito`   — o que o sistema assina, na mesma forma da resposta do
     Cronista (o App aplica isto e só isto);
   · `recusado` — o que o sistema não assina, com o porquê (uma chave da
     tabela, para a medida e para a nota de correção);
   · `ditoPor`  — o que entra MARCADO como palavra de alguém, nunca como
     fato do mundo.

   A régua, numa tabela que a suíte lê de volta: O_QUE_O_CRONISTA_PODE.

   POR QUE NÃO `decidirOCronista`: o nome já é de `gatilho-do-cronista.js`
   (decide SE o Cronista lê neste turno), importado pelo App. Dois exports
   com o mesmo nome obrigariam o App a um `as`, e a catraca da ligação
   conta leitores por nome — os dois se confundiriam.

   ---------------- SEPARADO DA TELA ----------------
   Conta se prova: nada aqui toca React, refs ou rede. Quem chama o modelo,
   faz o parse e aplica o `aceito` é o App (e, na Fase T1, o motor do
   turno). Determinista: não há sorte nenhuma nesta decisão.
   ============================================================ */

import { lerLugarDito } from "../lugar.js";
import { precoDaOferta } from "../ofertas.js";
import { MAX_COMPANHEIROS } from "../constantes.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const lista = (x) => (Array.isArray(x) ? x : []);
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const texto = (s, n) => (typeof s === "string" ? s.trim().slice(0, n) : "");

/* ---------------- A TABELA ----------------
   Uma linha por secção da resposta do Cronista. `quem` diz quem decide:
   · "sistema"  — o Cronista aponta, o estado confere, e sem conferência
     não entra;
   · "tabela"   — o Cronista dá o SINAL, o número sai de uma tabela;
   · "porta"    — só entra pela porta que o sistema já abriu;
   · "cronista" — é o papel dele (ler a prosa e registar), e entra;
   · "dito"     — entra, mas marcado como palavra de quem o disse;
   · "depois"   — passa, e um órgão do sistema valida adiante (`onde`).
   `porque` é a razão escrita; as chaves de `recusa` são os motivos que
   saem em `recusado[].porque`. */
export const O_QUE_O_CRONISTA_PODE = Object.freeze({
  lugar: {
    quem: "sistema",
    porque: "onde o herói está tem um dono só: a régua do lugar (lugar.js) e a viagem; o Cronista não muda o herói de cidade",
    aceita: ["novo", "volta"],
    recusa: { outraCidade: "é outra cidade do mapa: mudar de cidade é viagem, e a viagem é do sistema", lixo: "não é um nome de lugar" },
  },
  morte: {
    quem: "sistema",
    porque: "morte só com luta fechada pelo sistema (o combatente derrotado) ou com o envelope que o sistema mandou neste turno",
    envelope: /(RESOLVID[OA]|DECLARAD[OA]) PELO SISTEMA/i,
    recusa: { vivo: "o sistema o mantém de pé", foraDaLuta: "não é combatente desta luta, e fora da luta ninguém morre pela prosa" },
  },
  pagamento: {
    quem: "tabela",
    porque: "quanto um trabalho paga sai da tabela da oferta (ofertas.js#precoDaOferta), nunca do número que a IA escreveu",
    risco: 1,
    /* "paga": 0 é uma classificação, não um preço — o combinado não é
       dinheiro (um favor por informação, uma porta que se abre) */
    zeroEClassificacao: true,
    recusa: { numero: "o número era da IA; vale o da tabela" },
  },
  grupo: {
    quem: "porta",
    porque: "ninguém entra no grupo por a prosa dizer \"vou com você\": entra pelo convite que o sistema aceitaria (vereditoDoConvite)",
    max: MAX_COMPANHEIROS,
    recusa: { semPorta: "o sistema não aceitaria o convite agora", desconhecido: "não está no registo de gente", jaNoGrupo: "já anda com o herói", cheio: "o grupo está cheio", heroi: "é o próprio herói" },
  },
  fe: {
    quem: "tabela",
    porque: "a devoção é calculada pela tabela da fé sobre a população do lugar; o Cronista só classifica o que viu",
    recusa: { semFe: "o herói não despertou a fé", numero: "o número era da IA; vale o da tabela", tipo: "acontecimento fora da tabela" },
  },
  gente: {
    quem: "cronista",
    porque: "registar gente nova com nome é o papel do Cronista — com o gênero (só se a prosa o diz) e o ofício",
    max: 4, letrasNome: 40, letrasPapel: 60,
    /* o gênero vem como o Cronista o diz; o resto é "" — nunca chute */
    generos: { ele: "ele", ela: "ela", homem: "ele", mulher: "ela", masculino: "ele", feminino: "ela" },
    recusa: { semNome: "sem nome", heroi: "é o próprio herói" },
    /* quem diz o próprio nome está ali: "Sou Wystan" é presença, não boato */
    apresenta: /(?:^|[^a-z])(?:sou|me chamo|meu nome e|chamam-me|chamam me)\s+(?:o |a )?$/,
  },
  fatos: {
    quem: "dito",
    porque: "o que só uma personagem disse não é fato do mundo: entra como palavra dela, e o mundo só confirma o que o sistema decidiu (o eco da 11.ª)",
    /* os tipos de promessa (prometido.js) em que `quem` é QUEM DISSE; no
       "objeto", `quem` é quem o carrega, e isso não é fala */
    tiposDitos: ["frase", "ameaca", "volta"],
    marca: (quem) => `dito por ${quem || "alguém em cena"}, não fato`,
    /* a promessa SEM `quem` também é fala quando as palavras dela moram
       nas falas da narração: `fracao` das palavras que contam (`letras`
       ou mais) dentro das falas, e mais dentro do que fora (a corda de
       forca da M44, que ninguém assinou) */
    naFala: { fracao: 0.6, letras: 4 },
    semQuem: "alguém em cena",
  },
  global: {
    quem: "sistema",
    porque: "o evento global só acaba na última etapa que o sistema lhe deu",
    recusa: { semEvento: "não há evento global aberto", cedo: "o evento ainda não chegou à última etapa" },
  },
  canone: { quem: "dito", porque: "fato durável entra (o filtro do segredo é peneirarCanone, adiante); o que só se ouviu numa fala entra marcado", onde: "segredo-guardado.js:peneirarCanone" },
  promessas: { quem: "dito", porque: "a promessa é palavra de quem a fez", onde: "prometido.js:guardarSementes" },
  promessas_pagas: { quem: "depois", porque: "só fecha o que está aberto no Livro", onde: "prometido.js:pagarSementes" },
  falou_com: { quem: "depois", porque: "a conversa é conferida contra as etapas", onde: "missoes.js:conferir" },
  missao_oferecida: { quem: "depois", porque: "o cartaz exige etapa verificável; o preço é o da tabela (pagamento)", onde: "ofertas.js:cartazDaProposta" },
  relogio_novo: { quem: "depois", porque: "propor não é criar: o sistema apara tamanho, gatilho e duplicata", onde: "relogios.js:aceitarProposta" },
  teste_sugerido: { quem: "depois", porque: "a dificuldade é calculada pelo perfil e pelo modificador do herói", onde: "bestiario.js:dificuldadePorPerfil" },
});

/* ---------------- A TABELA DA FÉ ----------------
   A mesma do App (`TABELA_FE`, v7.5), trazida para o motor para a conta
   se provar em Node; mais a linha `gesto`, que substitui os "fieis 10 a
   500" que o Cronista chutava para um gesto comum. Cada linha rende uma
   FRAÇÃO da população do lugar como fiéis, mais PF fixos; `fixo` soma por
   cima. `minimo`/`teto` aparam o resultado (os do App). */
export const TABELA_DA_FE = Object.freeze({
  gesto:            { fixo: 20, frac: 0.001, pf: 1, rotulo: "um gesto que o povo guarda como prece" },
  alianca_reino:    { frac: 0.04, pf: 10, rotulo: "aliança com um reino inteiro" },
  libertacao:       { frac: 0.06, pf: 12, rotulo: "libertação de um povo oprimido" },
  milagre_publico:  { frac: 0.02, pf: 6, rotulo: "milagre testemunhado em público" },
  santuario:        { fixo: 300, frac: 0.01, pf: 4, rotulo: "santuário erguido em seu nome" },
  conversao_lider:  { frac: 0.03, pf: 6, rotulo: "conversão de um líder local" },
  vitoria_lendaria: { frac: 0.05, pf: 10, rotulo: "vitória sobre ameaça lendária" },
  pregacao:         { frac: 0.005, pf: 2, rotulo: "pregação ou feito menor de fé" },
  minimo: 10, teto: 2000000,
});

/* a cidade citada no mapa (exata, ou uma que contém a outra), como no App */
function cidadeDoMapa(mapa, local) {
  const alvo = norm(local);
  if (!alvo) return null;
  const cidades = lista(obj(mapa).cidades).filter((c) => c && typeof c.nome === "string" && c.nome.trim());
  return cidades.find((c) => norm(c.nome) === alvo) || cidades.find((c) => alvo.includes(norm(c.nome)) || norm(c.nome).includes(alvo)) || null;
}

/* A fé de uma linha da tabela no lugar dito. `null` se o tipo não existe. */
export function feDaTabela(tipo, local, mapa) {
  const linha = TABELA_DA_FE[tipo];
  if (!linha || typeof linha !== "object") return null;
  const cid = cidadeDoMapa(mapa, local);
  const pop = cid ? Math.max(0, Number(cid.populacao) || 0) : 0;
  const fieis = Math.min(TABELA_DA_FE.teto, Math.max(TABELA_DA_FE.minimo, Math.round((linha.fixo || 0) + pop * linha.frac)));
  return { tipo, fieis, pf: linha.pf, rotulo: linha.rotulo, pop, local: cid ? cid.nome : "" };
}

/* ---------------- A FALA ----------------
   Os trechos de uma narração que são FALA de alguém: entre aspas (as
   retas, as curvas, as angulares, as simples da 9.ª) e a linha de diálogo
   que abre com travessão. Devolve [início, fim) de cada trecho. */
function trechosDeFala(narrativa) {
  const s = String(narrativa || "");
  const out = [];
  const rxs = [/"[^"\n]*"/g, /“[^”]*”/g, /«[^»]*»/g, /(^|[\s(—:])'[^'\n]{2,}?'(?=[\s.,;:!?)—]|$)/g, /(^|\n)[ \t]*[—–-][^\n]*/g];
  for (const rx of rxs) for (const m of s.matchAll(rx)) out.push([m.index, m.index + m[0].length]);
  return out;
}

/* O nome aparece na narração, e SÓ dentro de falas? É a pessoa (ou a
   coisa) de quem se ouviu falar, e não a que está ali. Nome que não
   aparece nenhuma vez não é "só na fala": o Cronista leu-o de outro sítio
   (a fila, o resumo), e aí não há o que marcar. */
export function soNaFala(nome, narrativa) {
  const s = String(narrativa || "");
  const n = norm(nome);
  if (!s || n.length < 3) return false;
  /* norm() não muda o comprimento de texto já em NFC sem acentos
     compostos; para não depender disso, procura-se no texto normalizado
     letra a letra, guardando o índice original */
  const mapa = [];
  let plano = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    for (const ch of c) { plano += ch; mapa.push(i); }
  }
  const falas = trechosDeFala(s);
  let achou = 0, fora = 0;
  let i = plano.indexOf(n);
  while (i >= 0) {
    const antes = plano[i - 1], depois = plano[i + n.length];
    const borda = (ch) => ch === undefined || !/[a-z0-9]/.test(ch);
    if (borda(antes) && borda(depois)) {
      achou++;
      const o = mapa[i];
      if (!falas.some(([a, b]) => o >= a && o < b)) fora++;
    }
    i = plano.indexOf(n, i + 1);
  }
  return achou > 0 && fora === 0;
}

/* As palavras de `frase` moram nas falas da narração (ver fatos.naFala)? */
export function ditoNaFala(frase, narrativa) {
  const s = String(narrativa || "");
  const R = O_QUE_O_CRONISTA_PODE.fatos.naFala;
  const pal = (x) => new Set(norm(x).replace(/[^a-z0-9 ]/g, " ").split(" ").filter((w) => w.length >= R.letras));
  const W = [...pal(frase)];
  if (!s || W.length < 2) return false;
  const trechos = trechosDeFala(s);
  if (!trechos.length) return false;
  const naFala = pal(trechos.map(([a, b]) => s.slice(a, b)).join(" "));
  let resto = "", i = 0;
  for (const [a, b] of [...trechos].sort((x, y) => x[0] - y[0])) { if (a > i) resto += s.slice(i, a) + " "; i = Math.max(i, b); }
  resto += s.slice(i);
  const fora = pal(resto);
  const dentro = W.filter((w) => naFala.has(w)).length;
  const lado = W.filter((w) => fora.has(w)).length;
  return dentro / W.length >= R.fracao && dentro > lado;
}

/* O nome vem logo depois de "sou", "me chamo"…: a pessoa apresenta-se. */
function seApresenta(nome, narrativa) {
  const s = norm(narrativa), n = norm(nome);
  const rx = O_QUE_O_CRONISTA_PODE.gente.apresenta;
  let i = n.length >= 3 ? s.indexOf(n) : -1;
  while (i >= 0) {
    if (rx.test(s.slice(Math.max(0, i - 20), i))) return true;
    i = s.indexOf(n, i + 1);
  }
  return false;
}

/* ---------------- AS PEÇAS ---------------- */

function julgarLugar(dito, E, c, R) {
  const T = O_QUE_O_CRONISTA_PODE.lugar;
  if (typeof dito !== "string" || !dito.trim()) return null;
  const cru = dito.trim().slice(0, 80);
  const doMarco = lista(obj(E.espinha).atos).flatMap((at) => lista(obj(at).marcos))
    .filter((m) => m && !m.feito && typeof m.onde === "string" && m.onde.trim()).map((m) => m.onde);
  let lido;
  try {
    lido = lerLugarDito(cru, { lugar: E.lugar, cidade: E.cidadeAtual || "", pedido: c.pedido || "", fonte: "cronista", luta: !!E.combate, masmorra: !!(E.masmorra && !E.masmorra.encerrada), doMarco });
  } catch { lido = { acao: "ignora", porque: "lixo" }; }
  if (lido.acao === "novo") {
    /* a viagem fantasma: o nome dito é OUTRA cidade do mapa — "Nova
       Profundo", "a estalagem em Nova Profundo" com o herói em Monte Rasa */
    const aqui = norm(E.cidadeAtual);
    const outra = lista(obj(E.mapa).cidades).find((cid) => {
      const n = norm(cid && cid.nome);
      if (!n || n === aqui) return false;
      const d = norm(cru);
      return d === n || d.endsWith(` em ${n}`) || d.endsWith(` dentro de ${n}`) || d.endsWith(`, ${n}`);
    });
    if (outra) { R.push({ secao: "lugar", o: cru, porque: "outraCidade", acao: "ignora" }); return null; }
  }
  if (T.aceita.includes(lido.acao)) return { dito: (typeof lido.nome === "string" && lido.nome.trim()) || cru, acao: lido.acao, porque: lido.porque };
  R.push({ secao: "lugar", o: cru, porque: lido.porque || lido.acao, acao: lido.acao });
  return null;
}

function julgarMortes(mortes, E, c, R) {
  const T = O_QUE_O_CRONISTA_PODE.morte;
  const inimigos = lista(obj(E.combate).inimigos).filter((e) => e && e.nome);
  const envelopes = lista(c.envelopes).filter((x) => typeof x === "string");
  const doSistema = envelopes.filter((x) => T.envelope.test(x));
  const ok = [];
  for (const nome0 of lista(mortes).slice(0, 8)) {
    const nome = texto(nome0, 60);
    if (!nome) continue;
    const alvo = inimigos.find((e) => norm(e.nome) === norm(nome));
    const fechada = !!alvo && (alvo.derrotado || !(Number(alvo.vida) > 0));
    const peloEnvelope = doSistema.some((x) => norm(x).includes(norm(nome)));
    if (fechada || peloEnvelope) ok.push(alvo ? alvo.nome : nome);
    else R.push({ secao: "morte", o: nome, porque: alvo ? "vivo" : "foraDaLuta", vida: alvo ? Number(alvo.vida) || 0 : null });
  }
  return ok;
}

function julgarMissao(prop, E, R) {
  const p = obj(prop);
  if (!String(p.titulo || "").trim()) return null;
  const T = O_QUE_O_CRONISTA_PODE.pagamento;
  const tipo = p.tipo === "contrato" ? "contrato" : "favor";
  const etapas = lista(p.etapas).filter((e) => e && e.tipo && e.alvo);
  const nivel = Number(p.nivel) > 0 ? Math.round(Number(p.nivel)) : Math.max(1, Number(obj(E.personagem).nivel) || 1);
  const daIA = Number(p.paga);
  const zero = T.zeroEClassificacao && p.paga !== null && p.paga !== "" && Number.isFinite(daIA) && daIA === 0;
  const paga = zero ? 0 : precoDaOferta({ tipo, nivel, etapas: Math.max(1, etapas.length), risco: T.risco });
  if (!zero && p.paga !== null && p.paga !== undefined && p.paga !== "" && Number.isFinite(daIA) && daIA !== paga) {
    R.push({ secao: "pagamento", o: daIA, porque: "numero", vale: paga });
  }
  return { ...p, paga };
}

function julgarFe(fe, E, R) {
  const f = obj(fe);
  const T = O_QUE_O_CRONISTA_PODE.fe;
  const fieisIA = Number(f.fieis) || 0, pfIA = Number(f.pf) || 0;
  const ac = obj(f.acontecimento);
  const temSinal = fieisIA > 0 || pfIA > 0 || !!ac.tipo;
  if (!temSinal) return [];
  if (!obj(E.divindade).despertar) { R.push({ secao: "fe", o: ac.tipo || `${fieisIA}/${pfIA}`, porque: "semFe" }); return []; }
  const out = [];
  if (fieisIA > 0 || pfIA > 0) {
    const g = feDaTabela("gesto", f.local || ac.local || E.cidadeAtual || "", E.mapa);
    R.push({ secao: "fe", o: `${fieisIA} fiéis, ${pfIA} PF`, porque: "numero", vale: `${g.fieis} fiéis, ${g.pf} PF` });
    out.push({ ...g, motivo: texto(f.motivo, 80) || g.rotulo, de: "gesto" });
  }
  if (ac.tipo) {
    const calc = ac.tipo !== "gesto" ? feDaTabela(String(ac.tipo), ac.local || "", E.mapa) : null;
    if (calc) out.push({ ...calc, motivo: calc.rotulo, de: "acontecimento" });
    else R.push({ secao: "fe", o: String(ac.tipo).slice(0, 40), porque: "tipo" });
  }
  return out;
}

function julgarGrupo(entraram, E, c, R) {
  const T = O_QUE_O_CRONISTA_PODE.grupo;
  const heroi = norm(obj(E.personagem).nome);
  const grupo = lista(obj(E.personagem).grupo).filter((g) => g && g.nome);
  const conhecidos = new Set([...Object.keys(obj(E.npcs)), ...Object.values(obj(E.npcs)).map((n) => n && n.nome)].map(norm).filter(Boolean));
  const porta = new Set(lista(c.aceitariam).map(norm).filter(Boolean));
  let vagas = T.max - grupo.filter((g) => !g.invocada).length;
  const ok = [];
  for (const nome0 of lista(entraram).slice(0, 6)) {
    const nome = texto(nome0, 40);
    if (!nome) continue;
    const n = norm(nome);
    let porque = "";
    if (n === heroi) porque = "heroi";
    else if (grupo.some((g) => norm(g.nome) === n) || ok.some((x) => norm(x) === n)) porque = "jaNoGrupo";
    else if (!conhecidos.has(n)) porque = "desconhecido";
    else if (!porta.has(n)) porque = "semPorta";
    else if (vagas <= 0) porque = "cheio";
    if (porque) { R.push({ secao: "grupo", o: nome, porque }); continue; }
    ok.push(nome); vagas--;
  }
  return ok;
}

function julgarGente(pessoas, E, c, R, D) {
  const T = O_QUE_O_CRONISTA_PODE.gente;
  const heroi = norm(obj(E.personagem).nome);
  const falou = new Set(lista(c.falouCom).map(norm));
  const ok = [];
  for (const p0 of lista(pessoas).slice(0, T.max)) {
    const p = obj(p0);
    const nome = texto(p.nome, T.letrasNome);
    if (!nome) { R.push({ secao: "gente", o: "", porque: "semNome" }); continue; }
    if (heroi && norm(nome) === heroi) { R.push({ secao: "gente", o: nome, porque: "heroi" }); continue; }
    const genero = T.generos[norm(p.genero)] || "";
    const papel = texto(p.papel, T.letrasPapel);
    let ficha = { ...p, nome, genero, papel };
    /* quem só é citado numa fala (a Clarissa do Posto Velho, M13 da 11.ª)
       existe pela palavra de alguém: entra no registo, mas não "está aqui" */
    if (!falou.has(norm(nome)) && soNaFala(nome, c.narrativa) && !seApresenta(nome, c.narrativa)) {
      /* o paradeiro que a fala deu fica (é onde se diz que ela anda); o
         que não fica é "está AQUI": a cidade do herói, dita só numa fala,
         virava o "PROCURA Clarissa, ESTÁ AQUI" */
      const aqui = norm(E.cidadeAtual);
      const local = aqui && norm(ficha.local) === aqui ? "" : (ficha.local || "");
      ficha = { ...ficha, local, dito: O_QUE_O_CRONISTA_PODE.fatos.marca("") };
      D.push({ secao: "gente", o: nome, quem: "", marca: ficha.dito });
    }
    ok.push(ficha);
  }
  return ok;
}

function julgarPromessas(promessas, E, c, D) {
  const T = O_QUE_O_CRONISTA_PODE.fatos;
  const heroi = norm(obj(E.personagem).nome);
  return lista(promessas).filter((s) => s && typeof s === "object").map((s) => {
    const quem0 = texto(s.quem, 60);
    const tipo = norm(s.tipo);
    if (!T.tiposDitos.includes(tipo) || (quem0 && norm(quem0) === heroi)) return s;
    /* com `quem`, é dele; sem, só se as palavras moram numa fala */
    if (!quem0 && !ditoNaFala(s.texto, c.narrativa)) return s;
    const quem = quem0 || T.semQuem;
    const marca = T.marca(quem);
    D.push({ secao: "promessas", o: texto(s.texto, 120), quem, marca });
    return { ...s, dito: quem };
  });
}

function julgarCanone(canone, c, D) {
  const out = {};
  for (const [nome, ficha] of Object.entries(obj(canone))) {
    if (!nome || !ficha || typeof ficha !== "object") continue;
    if (soNaFala(nome, c.narrativa)) {
      const marca = O_QUE_O_CRONISTA_PODE.fatos.marca("");
      out[nome] = { ...ficha, dito: marca };
      D.push({ secao: "canone", o: nome, quem: "", marca });
    } else out[nome] = ficha;
  }
  return out;
}

function julgarGlobal(m, E, R) {
  if (!m || obj(m).global_encerrado !== true) return false;
  const g = obj(E.eventos).global;
  if (!g || typeof g !== "object") { R.push({ secao: "global", o: true, porque: "semEvento" }); return false; }
  const etapas = lista(g.etapas);
  const na = Number(g.etapa) || 0;
  if (etapas.length && na < etapas.length - 1) { R.push({ secao: "global", o: g.nome || true, porque: "cedo" }); return false; }
  return true;
}

/* ============================================================
   O JULGAMENTO

   `estado`  — o estado do jogo (src/estado.js; os campos lidos:
               personagem, npcs, mapa, cidadeAtual, lugar, combate,
               masmorra, espinha, divindade, eventos);
   `proposta` — a resposta do Cronista já em objeto (o parse é do App);
   `ctx`     — o que é do turno e não do estado:
               { narrativa, pedido (a frase crua do jogador), envelopes
                 (os textos/títulos que o sistema mandou ao Narrador neste
                 turno), aceitariam (nomes que o convite do sistema
                 aceitaria agora: vereditoDoConvite(n).resposta === "aceita"),
                 falouCom (se o App já tem a lista; senão a da proposta) }.

   Devolve { aceito, recusado, ditoPor }. Nunca muta o recebido; lixo
   (`null`, string, lista) vira proposta vazia, e a proposta vazia é a
   resposta válida e frequente do próprio Cronista.
   ============================================================ */
export function julgarOCronista(estado, proposta, ctx) {
  const E = obj(estado);
  const P = obj(proposta);
  const c0 = obj(ctx);
  const falouCom = lista(P.falou_com).filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim().slice(0, 60)).slice(0, 6);
  const c = { ...c0, falouCom: c0.falouCom || falouCom };
  const recusado = [], ditoPor = [];
  const aceito = {};

  const lugar = julgarLugar(P.lugar, E, c, recusado);
  if (lugar) aceito.lugar = lugar.dito;

  if (P.missoes && typeof P.missoes === "object") aceito.missoes = { global_encerrado: julgarGlobal(P.missoes, E, recusado) };

  if (P.canone && typeof P.canone === "object") aceito.canone = julgarCanone(P.canone, c, ditoPor);

  const pessoas = julgarGente(P.pessoas, E, c, recusado, ditoPor);
  if (pessoas.length) aceito.pessoas = pessoas;

  if (falouCom.length) aceito.falou_com = falouCom;

  const fe = julgarFe(P.fe, E, recusado);
  if (fe.length) aceito.fe = fe;

  const entraram = julgarGrupo(obj(P.grupo).entraram, E, c, recusado);
  if (lista(obj(P.grupo).entraram).length) aceito.grupo = { entraram };

  if (P.combate && typeof P.combate === "object") aceito.combate = { mortes_narradas: julgarMortes(obj(P.combate).mortes_narradas, E, c, recusado) };

  const missao = P.missao_oferecida ? julgarMissao(P.missao_oferecida, E, recusado) : null;
  if (missao) aceito.missao_oferecida = missao;

  if (Array.isArray(P.promessas) && P.promessas.length) aceito.promessas = julgarPromessas(P.promessas, E, c, ditoPor);
  if (Array.isArray(P.promessas_pagas) && P.promessas_pagas.length) aceito.promessas_pagas = [...P.promessas_pagas];
  if (P.relogio_novo && typeof P.relogio_novo === "object") aceito.relogio_novo = { ...P.relogio_novo };
  if (P.teste_sugerido && typeof P.teste_sugerido === "object") aceito.teste_sugerido = { ...P.teste_sugerido };

  return { aceito, recusado, ditoPor };
}
