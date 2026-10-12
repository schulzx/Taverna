/* teste-sessao-8.mjs — os consertos de motor da 8.ª sessão de prova (12/10)

   `mente/mm11-sessao-8.md` ("A revelação: por que não caiu", "O alvo
   errado", "As muletas"), cada conserto preso ao que a sessão deu de
   verdade — as pautas que foram ao Narrador, as frases do jogador, as falas
   do Mestre —, recortado do registo das 71 chamadas em
   `registo-s8-pauta.json`. Falha na árvore de antes (v9.425) e passa na de
   depois:

     1. a revelação do elo não cede à pergunta: o confronto É uma pergunta,
        e a pauta cortava a verdade que o motor decidia (M59–M61);
     2. o golpe na companheira (M39–M42): o nome dela era um bicho, a
        descrição pela arma não resolvia, e o pedido de desculpa reabria a
        luta; quem anda comigo só é alvo pelo nome, e com o cartão antes;
     3. as muletas: o fecho `silencio` mandava, à letra, o primeiro tique
        proibido do núcleo;
     4. o `{"total":8}` na fala (M47) e o "rito não abre: você ainda não
        despertou" (M68) — o sistema a falar de si. */
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const S = "../src/";
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const P = await import(S + "pauta.js");
const ST = await import(S + "subtramas.js");
const A = await import(S + "agressao.js");
const CR = await import(S + "crime.js");
const FE = await import(S + "fecho.js");
const NU = await import(S + "nucleo.js");
const J = await import(S + "json.js");
const AS = await import(S + "ascensao.js");
const { rngDe } = await import(S + "geografia.js");
const R8 = JSON.parse(fs.readFileSync("./registo-s8-pauta.json", "utf8"));
/* o que esta etapa trouxe, lido com rede: na árvore de antes falta, e a
   suíte tem de FALHAR asserção a asserção — não estourar na primeira */
const FICA = P.FICA_NA_PERGUNTA || { marcas: {} };
const armadoDescrito = A.armadoDescrito || (() => null);
const VETO_DO_GESTO = FE.VETO_DO_GESTO || "\u0000";

/* ============================================================ */
sec("1. a revelação não cede à pergunta (M59–M61)");
{
  const rev = R8.revelacao;
  const turnoDe = (tx) => Number((tx.match(/PAUTA DO TURNO (\d+)/) || [])[1]) || 0;
  for (const c of R8.confrontos) {
    const sx = c.pauta.secoes;
    const turno = turnoDe(c.pauta.texto);
    t(`M${c.m}: a pauta do registo reconstrói-se byte a byte (${c.pauta.texto.length})`, P.textoDaPauta(sx, { turno }) === c.pauta.texto);
    /* o motor decidiu a revelação (porConfronto) e o App pô-la em "coracao";
       o rodapé diz EM VIAGEM, e o App cede como fora dos muros */
    const tx = P.textoDaPauta(P.cederNaCena(P.porNaPauta(sx, "coracao", rev), { arredores: true }), { turno });
    t(`M${c.m}: a revelação entra (${tx.length} de ${P.TETO_DA_PAUTA})`, tx.includes(rev) && tx.length <= P.TETO_DA_PAUTA);
    const ficam = [...(sx.naoPode || []), ...(sx.pergunta || []), ...(sx.rumo || []), ...(sx.fecho || []), ...(sx.volta || []), sx.onde[0], sx.onde[1]];
    t(`M${c.m}: nenhum veto, nem o PERGUNTOU, nem o rumo, o fecho ou o lugar sai`, ficam.every((l) => tx.includes(l)), ficam.filter((l) => !tx.includes(l)).join(" | "));
  }
  const m59 = R8.confrontos[0];
  t("M59 é uma pergunta que a ficha respondeu (é por isso que cedia)", (m59.pauta.secoes.pergunta || []).length === 1 && /\?/.test(m59.frase));
  t("a marca é a da frase fechada do coração, e a revelação a traz", FICA.marcas.coracao && R8.revelacao.includes(FICA.marcas.coracao) && ST.LINHA_DO_CORACAO.revelacao.includes(FICA.marcas.coracao));
  t("toda linha do coração que ordena fato leva a marca; a escolha não", Object.entries(ST.LINHA_DO_CORACAO).filter(([, v]) => typeof v === "string").every(([k, v]) => k.startsWith("escolha") ? !v.includes(FICA.marcas.coracao || "\u0000") : v.includes("(é fato") === v.includes(FICA.marcas.coracao || "\u0000")));
  t("o coração continua na lista do que cede à pergunta (o que fica é linha a linha)", P.SECOES_QUE_CEDEM.pergunta.includes("coracao"));
  t("na luta, a tabela não tira o coração (é o motor que só deixa a batalha)", !P.SECOES_QUE_CEDEM.luta.includes("coracao"));
  /* as 500 pautas de pergunta semeadas: a resposta passa à frente sempre */
  const x = (n, c = "a") => (c + " ").repeat(Math.ceil(n / 2)).slice(0, n).trim();
  const r = rngDe("pergunta|coracao|500");
  const txt = (a, b, c) => x(a + Math.floor(r() * (b - a + 1)), c);
  let perdeu = 0, veto = 0, resto = 0, entrou = 0, teto = 0;
  for (let i = 0; i < 500; i++) {
    let p = P.porNaPauta({}, "onde", txt(60, 110, "lugar"), txt(15, 30, "end"), "comporta: " + txt(110, 210, "comp"));
    p = P.porNaPauta(p, "economia", txt(180, 280, "eco"));
    p = P.porNaPauta(p, "naoPode", ...Array.from({ length: 1 + Math.floor(r() * 4) }, () => txt(60, 200, "veto")));
    p = P.porNaPauta(p, "pergunta", txt(80, 260, "resp"));
    for (const [id, pr, a, b] of [["rumo", 0.9, 100, 180], ["fecho", 0.9, 100, 140], ["momento", 0.6, 120, 220], ["quem", 0.5, 30, 90], ["gente", 0.5, 60, 140], ["nomes", 0.5, 60, 90]]) if (r() < pr) p = P.porNaPauta(p, id, txt(a, b, id));
    const sem = P.textoDaPauta(P.cederNaCena(p, {}), { turno: 57 });
    const fato = "X (é fato: entra nesta resposta, dito por ela, inteiro): " + txt(140, 160, "cor");
    const com = P.textoDaPauta(P.cederNaCena(P.porNaPauta(p, "coracao", fato), {}), { turno: 57 });
    if (sem.includes(p.pergunta[0]) && !com.includes(p.pergunta[0])) perdeu++;
    for (const l of p.naoPode) if (sem.includes(l) && !com.includes(l)) veto++;
    for (const l of [...(p.rumo || []), ...(p.fecho || []), p.onde[0], p.onde[1]]) if (sem.includes(l) && !com.includes(l)) resto++;
    if (com.includes(fato)) entrou++;
    if (com.length > P.TETO_DA_PAUTA) teto++;
  }
  t("500 pautas de pergunta: o fato do coração nunca tira a resposta", perdeu === 0, `${perdeu}`);
  t("…nem veto, nem rumo, fecho ou lugar, e o teto nunca passa", veto === 0 && resto === 0 && teto === 0, `${veto}/${resto}/${teto}`);
  t(`…e o fato entra em ${entrou} de 500 (a C2 deixava-o em 0)`, entrou >= 350);
  /* lixo e imutabilidade */
  const viva = { pergunta: ["a resposta"], coracao: [R8.revelacao, "Vando (a decisão é do herói: não a feche): x, ou y."], onde: ["em X", "⌖ 1", "comporta: tudo"] };
  const copia = JSON.stringify(viva);
  const out = P.cederNaCena(viva, null);
  t("a escolha cede e a revelação fica, numa pauta pequena", out.coracao && out.coracao.length === 1 && out.coracao[0] === R8.revelacao);
  t("não muta a pauta recebida", JSON.stringify(viva) === copia);
  t("null e {} não estouram", (() => { P.cederNaCena(null, null); P.cederNaCena({}, {}); P.cederNaCena({ coracao: [R8.revelacao] }, { luta: true }); return true; })());
  t("o teto não subiu", P.TETO_DA_PAUTA === 1400);
}

/* ============================================================ */
sec("2. o golpe na companheira (M39–M42)");
{
  const { mostrado, m39, m41, mostradoM41 } = R8.alvo;
  const o = { presentes: [], grupo: [{ nome: "Freya" }], recentes: mostrado, mostrado };
  const a39 = A.lerAgressao(m39, o) || {};
  t("M39: o alvo NÃO é Ursa (era: a criatura «Ursa», sem cartão)", a39.nome && !/ursa/i.test(a39.nome) && !a39.criatura, JSON.stringify(a39));
  t("M39: «a que leva a corrente» é quem o Mestre pôs armado — a sombra da corrente", a39.tipo === "agressao" && a39.nome === "Sombra da corrente" && a39.armadoNaProsa === true, JSON.stringify(a39));
  t("…e a descrição diz de onde vem o peso", a39.porqueDoPeso === (A.ARMADO_DESCRITO || {}).porque);
  t("o nome de gente não vira bicho: «Ursa» na prosa do Mestre não é uma ursa", A.criaturaMostrada("ataco a ursa", mostrado) === null);
  t("…mas a ursa da prosa, com artigo, continua bicho", (A.criaturaMostrada("ataco a ursa", ["Uma ursa enorme sai da toca e ruge."]) || {}).criatura === true);
  t("…e «Lobos uivam» com «o lobo maior» depois também", (A.criaturaMostrada("ataco o lobo", ["Lobos uivam ao longe. O lobo maior avança."]) || {}).criatura === true);
  t("…e quem está na cena com nome de bicho é gente, salvo o bicho com artigo", A.criaturaMostrada("ataco o lobo", ["Lobo ri de você."], [], [{ nome: "Lobo Ferreira" }]) === null && !!A.criaturaMostrada("ataco o lobo", ["Lobo ri. O lobo cinzento rosna."], [], [{ nome: "Lobo Ferreira" }]));
  t("NOME_NAO_E_BICHO é tabela (os determinantes)", Array.isArray((A.NOME_NAO_E_BICHO || {}).determinantes) && A.NOME_NAO_E_BICHO.determinantes.includes("a"));
  t("«o do archote» também se descreve pela arma", (armadoDescrito("Ataco o do archote antes que fuja.", mostrado) || {}).nome === "Sombra do archote");
  t("«ataco-o com a espada» não é descrição: o «o» é pronome", A.lerAgressao("Ataco-o com a espada.", { presentes: [{ nome: "Doran", relacao: "inimigo" }], mostrado: ["Doran saca a espada."], recentes: ["Doran saca a espada."] }).nome === "Doran");
  t("sem a arma na prosa do Mestre, a descrição não inventa ninguém", armadoDescrito("Ataco a que leva a lança.", mostrado) === null);
  /* M41: o recuo */
  t("M41: «foi um engano… peço desculpa» não é ataque (era: reabria a luta contra Ursa)", A.lerAgressao(m41, { ...o, recentes: mostradoM41, mostrado: mostradoM41 }) === null && !A.ehDeclaracaoDeAtaque(m41));
  t("…o recuo é tabela", A.NAO_E_AGRESSAO.some((n) => n.id === "recuo"));
  t("…e só a oração do recuo cai: «Foi engano. Agora ataco o guarda.» é ataque", A.ehDeclaracaoDeAtaque("Foi engano. Agora ataco o guarda."));
  /* quem anda comigo */
  const oc = { ...o, comigo: ["Ursa o Andarilho"] };
  const nomeado = A.lerAgressao("Ataco Ursa com a adaga.", oc) || {};
  t("pelo NOME, quem anda comigo é alvo — marcado para o cartão", nomeado.tipo === "agressao" && nomeado.nome === "Ursa o Andarilho" && nomeado.comigo === true, JSON.stringify(nomeado));
  const card = CR.veredictoDoCrime(nomeado, { npcs: {}, presentes: [], grupo: [{ nome: "Freya" }] }, {});
  t("…e o cartão vem antes, mesmo fora da cidade (o modelo do cartão de Falk)", /anda com você/.test(card) && card.startsWith("Ursa o Andarilho"), card);
  t("…a frase do cartão é tabela", typeof CR.VEREDITO_DE_QUEM_ANDA_COMIGO === "string" && CR.VEREDITO_DE_QUEM_ANDA_COMIGO.includes("{nome}"));
  const porPronome = A.lerAgressao("Avanço para socá-la.", { ...oc, presentes: [{ nome: "Ursa o Andarilho", relacao: "neutro" }], mostrado: [], recentes: ["Ursa o Andarilho ri de você."] }) || {};
  t("por pronome, quem anda comigo é recusado como o grupo (nunca resolvido por descrição)", porPronome.tipo === "companheiro", JSON.stringify(porPronome));
  t("M39 com Ursa a andar comigo: o alvo continua a ser a sombra da corrente", (A.lerAgressao(m39, oc) || {}).nome === "Sombra da corrente");
  t("o inimigo de sempre não ganha cartão de companheiro", !CR.veredictoDoCrime({ tipo: "agressao", nome: "Rufino" }, { npcs: { Rufino: { relacao: "inimigo" } } }, {}));
}

/* ============================================================ */
sec("3. as muletas: o fecho mandava o tique proibido");
{
  const MUL = /esperando|à espera|aguardando|calad[oa]|cruz(a|ou|ando|am) (os )?braços|braços cruzados|sem tirar os olhos|sem desviar o olhar/i;
  const conta = (pref) => { const xs = R8.fechos.filter((x) => pref(x.fecho)); return [xs.filter((x) => MUL.test(x.narrativa)).length, xs.length]; };
  const [sM, sN] = conta((f) => f.startsWith("alguém fica calado"));
  const [pM, pN] = conta((f) => f.startsWith("alguém em cena faz-me"));
  const [oM, oN] = conta((f) => f && !f.startsWith("alguém"));
  console.log(`      a 8.ª sessão: silêncio ${sM}/${sN} com muleta · pergunta ${pM}/${pN} · os outros três ${oM}/${oN}`);
  t("medido: o fecho `silencio` (\"fica calado à espera\") deu muleta em 14 de 17", sM === 14 && sN === 17);
  t("medido: o `pergunta`, em 10 de 15; os fechos sem gente, em 14 de 38", pM === 10 && pN === 15 && oM === 14 && oN === 38);
  const ESQ = /não sei|não sabe|ninguém sabe|não posso dizer|não vou dizer|dá de ombros|desconvers|não é da sua conta|quem quer saber|depende|não sai barato/i;
  const esq = R8.fechos.filter((x) => ESQ.test(x.narrativa));
  t(`medido: a regra "quem fala não sabe, desconversa" não é a causa (${esq.length} respostas esquivas, ${esq.filter((x) => MUL.test(x.narrativa)).length} com muleta)`, esq.length === 6);
  t("nenhum fecho manda um tique proibido do núcleo (era: o silêncio dizia «fica calado à espera»)", FE.FECHOS.every((f) => !NU.TIQUES_PROIBIDOS.some((p) => norm(f.diz).includes(norm(p)))));
  const gente = FE.FECHOS.filter((f) => f.gente);
  const linhas = gente.map((f) => FE.escolherFecho({ pedido: { doJogador: true, pergunta: true }, gente: true, ultimo: f.id === "pergunta" ? "silencio" : "pergunta", sorte: () => 0 }));
  t("os dois fechos de gente levam o veto do gesto", linhas.length === 2 && linhas.every((x) => x.linha.includes(VETO_DO_GESTO)), linhas.map((x) => x.linha).join(" | "));
  t("o veto do gesto cobre os tiques de corpo do núcleo (braços, olhar, espera) e o ar", ["braços", "olhar", "espera", "pressagiar"].every((w) => VETO_DO_GESTO.includes(w)) && ["cruza os braços", "sem tirar os olhos", "fica calado à espera"].every((p) => NU.TIQUES_PROIBIDOS.includes(p)));
  t("a linha cabe (≤ 150; era 121 e 131)", linhas.every((x) => x.linha.length <= 150), linhas.map((x) => x.linha.length).join(","));
  t("os fechos sem gente mantêm o veto do ambiente", FE.escolherFecho({ pedido: { doJogador: true }, gente: false, sorte: () => 0 }).linha.includes(FE.VETO_DO_FECHO));
}

/* ============================================================ */
sec("4. o sistema não fala de si: o JSON na fala (M47) e o rito (M68)");
{
  const m47 = R8.m47;
  t("M47 trazia o canal dentro da fala", m47.includes('{"total":8}'));
  const s = J.sanearResposta({ narrativa: m47 }).narrativa;
  t("sanearResposta tira o objeto e deixa a fala", !s.includes("{") && !s.includes("total") && s.includes("são oito escamas. E água quente é mais duas."), s.slice(0, 200));
  t("pelo caminho do App (extrairJSON da resposta crua) também", !J.extrairJSON(JSON.stringify({ narrativa: m47 })).narrativa.includes('"total"'));
  t("chavetas que não são JSON ficam", J.sanearResposta({ narrativa: "Ela escreve {o nome dele} no livro." }).narrativa.includes("{o nome dele}"));
  t("a regra é tabela (JSON_NA_PROSA)", J.JSON_NA_PROSA instanceof RegExp && '{"a": 1, "b": "x"}'.replace(J.JSON_NA_PROSA, "") === "");
  /* o rito */
  const naoDespertou = { despertar: false, panteao: [] };
  const despertou = { despertar: true, panteao: [] };
  t("M68: um lobo com gd 0 (a ficha da base do mundo) não é deus (era: abria o «rito não abre»)", AS.identificarDivindadeAbatida([{ nome: "Lobo", gd: 0, derrotado: true }], despertou) === null);
  t("quem não despertou não ouve falar de rito, nem com um deus abatido", AS.identificarDivindadeAbatida([{ nome: "Avatar de Kaelis", gd: 3, derrotado: true }], naoDespertou) === null && AS.identificarDivindadeAbatida([{ nome: "Lobo", derrotado: true }], null) === null);
  t("quem despertou continua a ter o rito de um deus de verdade", (AS.identificarDivindadeAbatida([{ nome: "Kaelis", gd: 3, derrotado: true }], despertou) || {}).gd === 3);
}

console.log(`\nsessão 8: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
