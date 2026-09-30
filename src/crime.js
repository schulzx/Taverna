/* ============================================================
   O CRIME (Fase MM, etapa MM10) — a violência que a cidade vê

   O defeito que a sonda da mesa deixou à vista: "ataco o taverneiro" abre
   uma luta (`agressao.js`) e mais nada. Ninguém chama a guarda, ninguém
   põe preço na cabeça de quem atacou, a porta da estalagem não fecha, e
   quem estava na taverna não conta a ninguém. Numa mesa do Matt, o golpe
   no taverneiro é a sessão seguinte inteira.

   ---------------- O QUE JÁ EXISTIA, E FICA ONDE ESTÁ ----------------

   · `agressao.js` LÊ a agressão (quem, com que peso) e abre a luta. Este
     módulo NÃO repeneira a frase: parte do que `lerAgressao` devolveu.
   · O COBRADOR (v9.112) já cobra a MEMÓRIA do golpe dias depois — "a lei
     lembra", "quem viu conta", "o parente aparece" —, pelo registo do
     turno. Aqui mora o que acontece NA HORA e o estado de procurado; a
     conta que chega depois continua a ser dele.
   · A FICHA DA CIDADE (MM12) já diz quem guarda a lei (`instituicoes.lei`)
     e quem vigia a rua de dia e de noite (`vigilancia`). É ela que decide
     quem vem atrás do herói e se houve olhos na rua.
   · O ELENCO (MM8) e as CASAS: quem o herói feriu pode ser gente da
     história, com família e com quem gosta dele.

   ---------------- A REGRA ----------------

   É CRIME a violência contra quem NÃO é inimigo: nem inimigo no registo,
   nem hostil agora (quem acabou de atacar o herói — legítima defesa), nem
   companheiro (esse já é recusado pela agressão). Três gravidades, por
   tabela: FERIR (o golpe), MATAR (quando a vítima cai), ROUBAR.

   · Contra um FIGURANTE, a CIDADE reage: a lei procura o herói, há
     recompensa pela cabeça dele, as portas fecham (preço mais alto,
     serviços recusados) e quem viu conta.
   · Contra alguém do ELENCO, é HISTÓRIA: a casa dele (a família e o nome
     que ela tem na cidade) e quem tem laço com ele reagem — um passo fora
     de cena (MM8f) de quem gosta da vítima.

   Sem olhos não há crime conhecido: sem testemunha nomeada e com a rua
   sem vigia (a brecha da noite, a aldeia sem guarda), a cidade não fica
   a saber. O cobrador ainda pode cobrar a conta um dia.

   ---------------- O ESTADO ----------------

   Um campo NOVO no topo do save, `lei` = { versao, porCidade: { cidade:
   { desde, ate, recompensa, gravidade, vitima, ronda } } }. Não mora no
   campo `elenco` porque não é do elenco: é a situação do herói perante
   uma cidade, e dura o que a tabela diz. A versão antiga ignora-o.
   ============================================================ */

import { rngDe } from "./geografia.js";
import { fichaDaCidade } from "./cidade-por-dentro.js";
import { garantirLaco } from "./npcs.js";
import { elencoDoMundo, lacosDe, garantirElencoDoSave } from "./elenco.js";

const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const lista = (x) => (Array.isArray(x) ? x : []);
const nomeDe = (x) => String((x && typeof x === "object" ? x.nome : x) || "").trim();
const PROIBIDAS = new Set(["__proto__", "constructor", "prototype"]);

/* ---------------- AS TABELAS ---------------- */

/* A GRAVIDADE: quanto vale a cabeça (antes da escala da cidade), quantos
   dias dura o procurado, quanto sobem os preços e o que se recusa */
export const GRAVIDADES = {
  roubar: { ordem: 1, recompensa: 30, dias: 7, preco: 1.15, recusam: [], o: "roubou", eu: "roubei" },
  ferir: { ordem: 2, recompensa: 60, dias: 12, preco: 1.3, recusam: ["pouso"], o: "atacou", eu: "ataquei" },
  matar: { ordem: 3, recompensa: 200, dias: 30, preco: 1.6, recusam: ["pouso", "templo"], o: "matou", eu: "matei" },
};

/* a cabeça vale mais numa cidade grande: é a mesma escala da ficha (MM12) */
export const RECOMPENSA_POR_ESCALA = { 1: 0.5, 2: 0.75, 3: 1, 4: 1.25, 5: 1.5 };

/* HOUVE OLHOS NA RUA? Sem testemunha nomeada, quem vê é a vigilância da
   cidade — de dia e de noite, pela mesma escala. A aldeia não tem guarda,
   mas todos se conhecem: de dia, alguém viu. */
export const OLHOS_NA_RUA = {
  1: { dia: true, noite: false },
  2: { dia: true, noite: false },
  3: { dia: true, noite: true },
  4: { dia: true, noite: false },
  5: { dia: true, noite: true },
};

/* A GUARDA QUE VEM: a chance, por dia de procurado, de a lei encontrar o
   herói na cidade, e quem vem. A luta é a de sempre (`abrirCombate`), com
   nome e ameaça — o bestiário faz o resto. */
export const GUARDA_QUE_VEM = {
  1: { chance: 0, quem: [] },
  2: { chance: 0.25, quem: [{ nome: "Miliciano", ameaca: "fraco" }, { nome: "Miliciano", ameaca: "fraco" }] },
  3: { chance: 0.5, quem: [{ nome: "Sentinela", ameaca: "comum" }, { nome: "Sentinela", ameaca: "comum" }, { nome: "Sargento", ameaca: "competente" }] },
  4: { chance: 0.35, quem: [{ nome: "Guarda", ameaca: "comum" }, { nome: "Guarda", ameaca: "comum" }] },
  5: { chance: 0.35, quem: [{ nome: "Guarda", ameaca: "comum" }, { nome: "Guarda", ameaca: "comum" }, { nome: "Sargento da Guarda", ameaca: "competente" }] },
};

/* quantas testemunhas se dizem, no máximo */
export const TESTEMUNHAS_DITAS = 3;

/* ---------------- É CRIME? ----------------
   `agressao` é o que `lerAgressao` devolveu. `ctx`: { npcs, presentes,
   grupo, hostis, elenco, noite, cidade (objeto do mapa) }.
   `hostis` são os nomes de quem atacou o herói agora (a luta que acabou de
   acontecer, o golpe que ele recebeu): contra eles é legítima defesa. */
export function lerCrime(agressao, ctx, gravidade = "ferir") {
  const a = obj(agressao);
  const o = obj(ctx);
  if (a.tipo !== "agressao" || !nomeDe(a)) return null;
  const nome = nomeDe(a);
  const g = GRAVIDADES[gravidade] ? gravidade : "ferir";
  const registo = obj(o.npcs);
  const chave = Object.keys(registo).find((k) => norm(k) === norm(nome));
  const ficha = chave ? obj(registo[chave]) : {};
  /* o inimigo declarado não é vítima de crime */
  if (/^(inimig|hostil)/.test(norm(ficha.relacao))) return null;
  /* legítima defesa: quem atacou o herói agora */
  if (lista(o.hostis).some((h) => norm(nomeDe(h)) === norm(nome))) return null;
  /* o companheiro já é recusado pela agressão; por segurança, aqui também */
  if (lista(o.grupo).some((x) => norm(nomeDe(x)) === norm(nome))) return null;
  const testemunhas = lista(o.presentes).map(nomeDe)
    .filter((n) => n && norm(n) !== norm(nome) && !lista(o.grupo).some((x) => norm(nomeDe(x)) === norm(n)))
    .filter((n, i, arr) => arr.findIndex((x) => norm(x) === norm(n)) === i)
    .slice(0, TESTEMUNHAS_DITAS);
  const doElenco = lista(o.elenco).some((x) => norm(nomeDe(x)) === norm(nome));
  return {
    vitima: nome,
    papel: String(a.papel || ficha.papel || ""),
    gravidade: g,
    testemunhas,
    doElenco,
    comLacoComigo: !!garantirLaco(ficha.laco),
    porque: `${nome} não era inimigo, não me atacou primeiro e não anda comigo`,
  };
}

/* QUEM VEM ATRÁS: o começo da linha da lei da ficha ("a guarda da cidade,
   com quartel próprio" → "a guarda da cidade"); na aldeia sem lei de
   ofício, quem vem são os vizinhos que a ficha nomeia depois dos dois-pontos. */
function quemPersegue(lei, guarda) {
  const l = String(lei || "").trim();
  if (!l) return guarda || "a guarda";
  if (/^ningu[eé]m/i.test(l)) { const depois = l.split(":")[1]; return depois ? depois.trim() : "os vizinhos"; }
  return l.split(/[,(:—;]/)[0].trim() || guarda || "a guarda";
}
const maiuscula = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/* ---------------- O QUE ACONTECE ----------------
   `mundo`: { semente, mapa, cidade (objeto), genero, lex, molde, noite,
   elencoCtx (o contexto de elencoDoMundo, com o estado), dia }.
   Devolve o que a cidade faz e o que o elenco faz, e as linhas. */
export function consequenciaDoCrime(crime, mundo) {
  const c = obj(crime);
  const w = obj(mundo);
  if (!c.vitima) return null;
  const cidade = obj(w.cidade);
  let ficha;
  try { ficha = fichaDaCidade(cidade, { semente: w.semente, mapa: w.mapa, lex: w.lex, genero: w.genero, molde: w.molde }); } catch { ficha = null; }
  const escala = ficha ? ficha.escala : 2;
  const militar = !!(ficha && ficha.militar);
  const olhos = OLHOS_NA_RUA[militar ? 3 : escala] || OLHOS_NA_RUA[2];
  const conhecido = c.testemunhas.length > 0 || (w.noite ? olhos.noite : olhos.dia);
  const gv = GRAVIDADES[c.gravidade] || GRAVIDADES.ferir;
  const recompensa = Math.round(gv.recompensa * (RECOMPENSA_POR_ESCALA[escala] || 1));
  const lei = ficha ? String(ficha.instituicoes.lei || "") : "";
  const guarda = ficha ? ficha.palavras.guarda : "a guarda";
  const quem = quemPersegue(lei, guarda);
  const nomeCidade = String(cidade.nome || "");
  const out = {
    conhecido,
    cidade: conhecido ? { nome: nomeCidade, lei, guarda, quem, recompensa, dias: gv.dias, preco: gv.preco, recusam: [...gv.recusam] } : null,
    historia: null,
    linhas: { acabou: [], naoPode: [] },
  };
  if (conhecido) {
    const viram = c.testemunhas.length ? `${c.testemunhas.join(", ")} ${c.testemunhas.length > 1 ? "viram" : "viu"}` : "a rua viu";
    out.linhas.acabou.push(`${viram}: eu ${gv.eu} ${c.vitima}${c.papel ? ` (${c.papel})` : ""}. Em ${nomeCidade || "esta cidade"} a notícia corre, ${quem} vem atrás de mim, e há ${recompensa} moedas pela minha cabeça`);
    out.linhas.naoPode.push(`em ${nomeCidade || "esta cidade"}, ninguém me recebe como um forasteiro qualquer${gv.recusam.includes("pouso") ? " nem me dá pouso" : ""}; quem me reconhece chama ${guarda}`);
  }
  /* A HISTÓRIA: a vítima é do elenco? a casa e quem gosta dela reagem */
  if (c.doElenco && w.semente != null) {
    let el = { pessoas: [], lacos: [], casas: [] };
    try { el = elencoDoMundo(w.semente, w.mapa, obj(w.elencoCtx)); } catch { /* sem elenco, sem história */ }
    const casa = el.casas.find((k) => k.membros.some((m) => norm(m) === norm(c.vitima))) || null;
    const quemGosta = lacosDe(el, c.vitima).filter((l) => ["amizade", "amor", "familia", "aprendizado"].includes(l.tipo)).map((l) => l.com);
    out.historia = { casa: casa ? { nome: casa.nome, reputacao: casa.reputacao } : null, quemGosta };
    if (casa) out.linhas.acabou.push(`a ${casa.nome} sabe o que eu fiz a ${c.vitima}, e não esquece`);
  }
  return out;
}

/* ---------------- O ESTADO: PROCURADO ---------------- */
export const LEI_VERSAO = 1;
const diaValido = (v) => { if (v === null || v === undefined || v === "" || typeof v === "boolean") return null; const n = Math.floor(Number(v)); return Number.isFinite(n) && n >= 0 ? n : null; };

export function garantirLei(x) {
  const o = obj(x);
  const porCidade = {};
  for (const [k, v] of Object.entries(obj(o.porCidade))) {
    const nome = String(k).trim().slice(0, 60);
    const e = obj(v);
    const desde = diaValido(e.desde), ate = diaValido(e.ate);
    if (!nome || PROIBIDAS.has(nome) || desde == null || ate == null || ate < desde) continue;
    porCidade[nome] = {
      desde, ate,
      recompensa: Math.max(0, Math.round(Number(e.recompensa) || 0)),
      gravidade: GRAVIDADES[e.gravidade] ? e.gravidade : "ferir",
      vitima: String(e.vitima || "").slice(0, 60),
      ronda: diaValido(e.ronda),
    };
  }
  return { versao: LEI_VERSAO, porCidade };
}

/* O crime conhecido põe o herói procurado na cidade. Um segundo crime na
   mesma cidade soma a recompensa e estica o prazo; a gravidade é a maior. */
export function registrarCrime(lei, consequencia, crime, dia) {
  const l = garantirLei(lei);
  const cons = obj(consequencia), c = obj(crime);
  const d = diaValido(dia);
  if (!cons.conhecido || !cons.cidade || !cons.cidade.nome || d == null) return l;
  const nome = cons.cidade.nome;
  const antes = l.porCidade[nome] && l.porCidade[nome].ate >= d ? l.porCidade[nome] : null;
  const gAntes = antes ? GRAVIDADES[antes.gravidade].ordem : 0;
  const gAgora = (GRAVIDADES[c.gravidade] || GRAVIDADES.ferir).ordem;
  return garantirLei({
    ...l,
    porCidade: {
      ...l.porCidade,
      [nome]: {
        desde: antes ? antes.desde : d,
        ate: Math.max(antes ? antes.ate : 0, d + cons.cidade.dias),
        /* a mesma vítima (o golpe que virou morte) não paga duas vezes: vale
           a maior; outra vítima soma */
        recompensa: antes && norm(antes.vitima) === norm(c.vitima) ? Math.max(antes.recompensa, cons.cidade.recompensa) : (antes ? antes.recompensa : 0) + cons.cidade.recompensa,
        gravidade: gAgora >= gAntes ? c.gravidade : antes.gravidade,
        vitima: c.vitima || (antes && antes.vitima) || "",
        ronda: antes ? antes.ronda : null,
      },
    },
  });
}

/* O GOLPE QUE VIROU MORTE: quando a vítima de um crime conhecido cai na
   luta que ele abriu, o crime passa a ser matar — a rua já sabe. */
export function agravarParaMorte(lei, vitima, mundo) {
  const w = obj(mundo);
  const e = procuradoEm(lei, w.cidade, w.dia);
  if (!e || !vitima || norm(e.vitima) !== norm(vitima) || e.gravidade === "matar") return garantirLei(lei);
  const crime = { vitima: e.vitima, gravidade: "matar", testemunhas: [], doElenco: false };
  const cons = consequenciaDoCrime(crime, { ...w, noite: false });
  if (!cons || !cons.cidade) return garantirLei(lei);
  return registrarCrime(lei, { ...cons, conhecido: true }, crime, w.dia);
}

/* procurado aqui, hoje? (expirado é como se não fosse) */
export function procuradoEm(lei, cidade, dia) {
  const l = garantirLei(lei);
  const d = diaValido(dia);
  const k = Object.keys(l.porCidade).find((x) => norm(x) === norm(nomeDe(cidade)));
  if (!k || d == null) return null;
  const e = l.porCidade[k];
  return d >= e.desde && d <= e.ate ? { cidade: k, ...e } : null;
}

/* o preço das coisas para quem é procurado aqui (1 quando não é) */
export function fatorDePreco(lei, cidade, dia) {
  const e = procuradoEm(lei, cidade, dia);
  return e ? (GRAVIDADES[e.gravidade] || GRAVIDADES.ferir).preco : 1;
}
/* e se este serviço se recusa (pouso, templo) */
export function servicoRecusado(lei, cidade, dia, servico) {
  const e = procuradoEm(lei, cidade, dia);
  return !!(e && (GRAVIDADES[e.gravidade] || GRAVIDADES.ferir).recusam.includes(servico));
}

/* A PAUTA: enquanto o herói é procurado na cidade onde está, o veto */
export function procuradoParaPauta(lei, cena) {
  const c = obj(cena);
  const e = procuradoEm(lei, c.cidade, c.dia);
  if (!e) return { naoPode: [] };
  const g = GRAVIDADES[e.gravidade] || GRAVIDADES.ferir;
  return { naoPode: [`sou procurado em ${e.cidade} (${g.eu} ${e.vitima || "alguém"}): há ${e.recompensa} moedas pela minha cabeça, ninguém me trata como forasteiro qualquer${g.recusam.includes("pouso") ? " nem me dá pouso" : ""}`] };
}

/* A GUARDA QUE VEM: uma vez por dia, pela semente, na cidade onde o herói
   é procurado. Devolve a lista para `abrirCombate` e o estado com a ronda
   marcada — ou null. */
export function guardaQueVem(lei, mundo) {
  const w = obj(mundo);
  const l = garantirLei(lei);
  const e = procuradoEm(l, w.cidade, w.dia);
  if (!e || e.ronda === diaValido(w.dia)) return null;
  let ficha;
  try { ficha = fichaDaCidade(obj(w.cidade), { semente: w.semente, mapa: w.mapa, lex: w.lex, genero: w.genero, molde: w.molde }); } catch { ficha = null; }
  const escala = ficha ? (ficha.militar ? 3 : ficha.escala) : 2;
  const t = GUARDA_QUE_VEM[escala] || GUARDA_QUE_VEM[2];
  const marcada = garantirLei({ ...l, porCidade: { ...l.porCidade, [e.cidade]: { ...l.porCidade[e.cidade], ronda: diaValido(w.dia) } } });
  const r = rngDe(`${w.semente}|guarda|${e.cidade}|${w.dia}`);
  if (!t.quem.length || r() >= t.chance) return { lei: marcada, inimigos: [] };
  return { lei: marcada, inimigos: t.quem.map((x) => ({ ...x })), quem: ficha ? ficha.palavras.guarda : "a guarda" };
}

/* O ENVELOPE DA GUARDA: a luta já foi aberta pelo App (`abrirCombate` com a
   lista de `guardaQueVem`), e o Narrador só narra a chegada. Render-se ou
   pagar a multa não existe ainda: é a etapa seguinte, e está escrita. */
export function envelopeDaGuarda(vinda, cidade) {
  const v = obj(vinda);
  if (!Array.isArray(v.inimigos) || !v.inimigos.length) return "";
  const nome = nomeDe(cidade) || "esta cidade";
  return `[A LEI CHEGOU — RESOLVIDO PELO SISTEMA] ${maiuscula(v.quem || "a guarda")} me encontrou em ${nome}: sou procurado aqui, e vieram me buscar. O painel de combate JÁ ESTÁ ABERTO com ${v.inimigos.length} deles. NÃO envie "combate_iniciar". Narre a chegada em uma ou duas frases — quem os chamou, o que gritam — e me passe a vez.`;
}

/* ---------------- O VEREDITO ANTES DO CLIQUE ----------------
   O preço, dito antes: "isto é um crime em X; a guarda…". Para um cartão
   de confirmação — vazio quando não é crime. */
export function veredictoDoCrime(agressao, ctx, mundo) {
  const crime = lerCrime(agressao, ctx);
  if (!crime) return "";
  const cons = consequenciaDoCrime(crime, mundo);
  if (!cons) return "";
  const nomeCidade = String(obj(obj(mundo).cidade).nome || "esta cidade");
  if (!cons.conhecido) return `${crime.vitima} não é inimigo: atacar é um crime em ${nomeCidade}. Agora ninguém está vendo — mas o que se faz, um dia se cobra.`;
  return `${crime.vitima} não é inimigo: atacar é um crime em ${nomeCidade}. ${maiuscula(cons.cidade.quem)} vai atrás de você, há ${cons.cidade.recompensa} moedas pela sua cabeça por ${cons.cidade.dias} dias${cons.cidade.recusam.length ? `, e ninguém lhe dá ${cons.cidade.recusam.join(" nem ")}` : ""}${crime.testemunhas.length ? `. ${crime.testemunhas.join(", ")} ${crime.testemunhas.length > 1 ? "estão" : "está"} vendo` : ""}${cons.historia && cons.historia.casa ? `. E a ${cons.historia.casa.nome} não vai esquecer` : ""}.`;
}

/* ---------------- O ELENCO REAGE (MM8f) ----------------
   Quem gosta da vítima dá um passo fora de cena: um feito no campo
   `elenco`, que a pauta mostra quando toca a cena. */
export function reacaoDoElenco(estadoElenco, crime, consequencia, dia) {
  const e = garantirElencoDoSave(estadoElenco);
  const c = obj(crime), cons = obj(consequencia);
  const d = diaValido(dia);
  const quem = obj(cons.historia).quemGosta;
  if (!c.vitima || d == null || !Array.isArray(quem) || !quem.length) return e;
  const g = GRAVIDADES[c.gravidade] || GRAVIDADES.ferir;
  const feitos = quem.slice(0, 1).map((q) => ({ dia: d, quem: q, com: c.vitima, passo: "vinganca", cidade: String(obj(cons.cidade).nome || ""), o: `${q} soube quem ${g.o} ${c.vitima}, e jurou que isso não fica assim` }));
  return garantirElencoDoSave({ ...e, feitos: [...e.feitos, ...feitos] });
}
