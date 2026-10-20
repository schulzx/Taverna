/* teste-narrador-so-narra.mjs — o Narrador só narra, E1: o sistema entrega
   (12/10)

   A medição (`mente/narrador-so-narra.md`) contou 31 invenções com número,
   nome ou consequência na 6.ª e na 7.ª sessões, e 24 nasciam do lado do
   sistema: não tinha o dado, tinha-o errado, ou tinha-o e não o mandava.
   Esta etapa é o motor a passar a entregá-lo, sem tocar no prompt fixo:

     1. os preços comuns em tabela, e o preço perguntado na pauta;
     2. "maçã" não é "maça" também no preço perguntado (a tabela do acento
        saiu do círculo bolsa-da-frase ↔ mercado);
     3. a distância dentro dos muros com número;
     4. NOMES À MÃO, e o registo que os reconhece (e o morto que é morto);
     5. o ocupante da sala de trás de cada passagem;
     6. a figura que o arco põe em cena, com nome, e o duelo com ela;
     7. uma medida só: a procura e o Geógrafo dizem o mesmo número;
     8. o nome próprio de outro sítio não vira o tipo daqui (os dois postos);
     9. a pauta: as secções novas, o que cede, e o teto (nenhum veto sai);
    10. a régua: `ab-invencoes.mjs` conta ≥ 27 das 31 com o dado.

   Cada secção falha na árvore de v9.419 e passa nesta. A §14 (E2, 12/10)
   são os dois defeitos que a prova viva da E1 viu — "paes" sem til e NOMES
   À MÃO sem lugar nos turnos de batida —, e falha na árvore de v9.421. */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const S = "../src/";
const tenta = (f, d) => { try { return f(); } catch (e) { return d === undefined ? `estourou: ${e.message}` : d; } };
const congelar = (o) => { if (o && typeof o === "object") { Object.freeze(o); for (const v of Object.values(o)) congelar(v); } return o; };

const E = await import(S + "economia.js");
const M = await import(S + "mercado.js");
const B = await import(S + "bolsa-da-frase.js");
const CP = await import(S + "cidade-por-dentro.js");
const N = await import(S + "nomes.js");
const MS = await import(S + "masmorras.js");
const ST = await import(S + "subtramas.js");
const NU = await import(S + "nucleo.js");
const P = await import(S + "procura.js");
const GE = await import(S + "geografo.js");
const L = await import(S + "lugar.js");
const A = await import(S + "agressao.js");
const PA = await import(S + "pauta.js");
const R = await import(S + "regiao.js");
const CO = await import(S + "coordenadas.js");
const { ESTRUTURAS } = await import(S + "historia.js");
const { gerarGeografia, rngDe } = await import(S + "geografia.js");
const { MOLDES, moldePorId } = await import(S + "moldes.js");
const { locaisDaCidade } = await import(S + "mundo-base.js");
const { estenderEspinha } = await import(S + "saga.js");
const { guildasDoMundo } = await import(S + "guildas.js");
const { elencoDoMundo } = await import(S + "elenco.js");

const G = "Fantasia medieval";

/* ============================================================ */
sec("1. os preços comuns: tabela, faixa do prompt, porte");
{
  t("PRECOS_COMUNS é tabela com id, nome, base e rx", E.PRECOS_COMUNS.length >= 8 && E.PRECOS_COMUNS.every((p) => p.id && p.nome && Number.isFinite(p.base) && p.rx instanceof RegExp));
  /* a faixa é a do ECONOMIA_PROMPT, lida de volta no texto, e a base fica nela */
  const comFaixa = E.PRECOS_COMUNS.filter((p) => p.faixa);
  const noTexto = (p) => { const [a, b] = p.faixa; return E.ECONOMIA_PROMPT.includes(a === b ? `◉ ${a}` : `◉ ${a}–${b}`); };
  t(`toda faixa está no ECONOMIA_PROMPT (${comFaixa.filter(noTexto).length}/${comFaixa.length})`, comFaixa.every(noTexto), J(comFaixa.filter((p) => !noTexto(p)).map((p) => p.id)));
  t("toda base mora dentro da sua faixa", comFaixa.every((p) => p.base >= p.faixa[0] && p.base <= p.faixa[1]));
  t("PRECOS_DA_RUA são três da tabela (caneca, refeição, comida de rua)", J(E.PRECOS_DA_RUA) === J(["caneca", "refeicao", "rua"]));
  t("precoComum: a base com fator 1", E.precoComum("refeicao", 1) === 2 && E.precoComum("caneca") === 1);
  t("precoComum: o porto (1,25) e a capital (1,5) cobram mais", E.precoComum("vinho", 1.5) === 12 && E.precoComum("guia", 1.25) === 6);
  t("precoComum: o fator fica entre metade e o dobro (FATOR_DO_PRECO)", E.precoComum("vinho", 9) === 8 * E.FATOR_DO_PRECO.teto && E.precoComum("vinho", 0.01) === 8 * E.FATOR_DO_PRECO.piso);
  t("precoComum: nada custa menos de ◉ 1", E.precoComum("caneca", 0.5) === E.FATOR_DO_PRECO.minimo);
  t("precoComum: lixo não estoura", E.precoComum("nada") === null && E.precoComum(null) === null && E.precoComum("caneca", "x") === 1 && E.precoComum("caneca", null) === 1);
}

/* ============================================================ */
sec("2. o preço perguntado chega à pauta — as frases das sessões");
{
  const F = 1;
  const linha = (f, o) => M.precoComumParaPauta(f, o).pergunta[0] || "";
  t("6.ª M3 «quanto uma refeição quente?» → refeição quente ◉ 2", linha("E já que estou sentada: quanto custa um quarto por uma noite, e quanto uma refeição quente? Pago a refeição já.", { fator: F }) === "o preço daqui: refeição quente ◉ 2");
  t("6.ª M12 «Compro uma maçã» → fruta ◉ 1 (a compra declarada também leva o preço)", linha("Compro uma maçã de uma vendedora ambulante e como sentada na fonte.", { fator: F }) === "o preço daqui: fruta ◉ 1");
  t("7.ª M8 «duas canecas… Quanto é?» → a conta das duas", linha("Peço a Frida duas canecas de cerveja, uma para mim e uma para Jaco. Quanto é?", { fator: F }) === "o preço daqui: 2× caneca de cerveja ◉ 1 cada, dá ◉ 2");
  t("7.ª M13 «Quanto você quer por saber onde ele está?» → a informação", linha("Quanto você quer por saber onde ele está?", { fator: F }) === "o preço daqui: uma informação, de quem a vende ◉ 3");
  t("o porte move o número (o fator do pouso)", linha("Quanto custa uma caneca de cerveja?", { fator: 2 }) === "o preço daqui: caneca de cerveja ◉ 2");
  t("o `em` aponta o assunto na frase", M.precoComumParaPauta("Bebo. Quanto custa a sopa?", {}).em[0] === "bebo. quanto custa a ".length);
  t("sem pergunta nem compra, nada (beber não pergunta)", linha("Bebo a cerveja e olho a praça.") === "");
  t("pergunta sem coisa da tabela, nada (o quarto é da ficha da cidade)", linha("Quanto custa um quarto por uma noite?") === "");
  t("até COMUNS_POR_RESPOSTA coisas, pela ordem da frase", (linha("Quanto é uma caneca, uma sopa, um pão e um vinho?").match(/◉/g) || []).length === M.COMUNS_POR_RESPOSTA);
  t("o envelope do sistema: vale o «Eu disse»", linha('[AÇÃO] Eu disse: "Quanto custa a sopa?" e o resto') === "o preço daqui: refeição quente ◉ 2");
  t("lixo não estoura", J(M.precoComumParaPauta(null)) === J({ pergunta: [], em: [] }) && J(M.precoComumParaPauta({}, null)) === J({ pergunta: [], em: [] }) && J(M.precoComumParaPauta(7, { fator: "x" })) === J({ pergunta: [], em: [] }));
  t("determinístico", J(M.precoComumParaPauta("Quanto custa a sopa?", { fator: 1.25 })) === J(M.precoComumParaPauta("Quanto custa a sopa?", { fator: 1.25 })));
  t("a rua daqui: três preços, pelo fator", M.precosDaRua(1) === "na rua: caneca ◉ 1 · prato quente ◉ 2 · pão, fruta ou peixe seco ◉ 1" && M.precosDaRua(2).includes("prato quente ◉ 4"));
  t("a rua com lixo é a de fator 1", M.precosDaRua("x") === M.precosDaRua(1) && M.precosDaRua(null) === M.precosDaRua(1));
}

/* ============================================================ */
sec("3. a maçã não é a maça — também no preço perguntado (6.ª, M13)");
{
  const M13 = "Pergunto à vendedora de maçãs se vende outra, e fico conversando com ela sobre o preço das frutas este ano. Não quero saber de cambistas nem de Fogão nenhum agora.";
  const banca = [{ nome: "Banca das Fichas", estoque: [{ nome: "Lavada Alabarda de muro", tipo: "arma", preco: 88 }, { nome: "Maça de guarnição", tipo: "arma", preco: 40 }] }];
  const r = M.mercadoParaPauta(banca, M13);
  t("M13: o mercado já não responde «não há macas à venda»", !(r.pergunta[0] || "").includes("maca"), J(r));
  t("M13: e o preço das frutas chega (fruta ◉ 1)", (M.precoComumParaPauta(M13).pergunta[0] || "") === "o preço daqui: fruta ◉ 1");
  t("a maça de guerra continua a ser das bancas", (M.mercadoParaPauta(banca, "Quanto custa a maça de guarnição?").pergunta[0] || "").includes("Maça de guarnição ◉ 40"));
  t("a tabela mora em economia.js e o balcão lê-a de lá (a compra da maçã continua nula)", E.O_ACENTO_SEPARA.length >= 1 && B.compraNaFrase("Compro uma maçã.", { balcao: M.balcaoDeMantimentos({ nome: "X", porte: "vila" }), bolsa: 9 }) === null);
  t("semConfusao: troca a maçã, deixa a maça, e o lixo vira texto", E.semConfusao("Maçãs e maça") === "fruta e maça" && E.semConfusao(null) === "");
}

/* ============================================================ */
sec("4. dentro dos muros, com número (7.ª, M2)");
const MAPA = gerarGeografia("NSN|cidade", MOLDES[0]);
const CIDADE = MAPA.cidades[0];
{
  const locais = locaisDaCidade("NSN|cidade", CIDADE, G, MOLDES[0], null);
  const alvo = locais[2].nome;
  const frase = `Como se chega ao ${alvo.replace(/^(o|a|os|as)\s+/i, "")} daqui, e quanto tempo leva a pé?`;
  const l = CP.fichaParaPauta(CIDADE, { semente: "NSN|cidade", genero: G, mapa: MAPA, frase }).pergunta.find((x) => x.startsWith("distância:")) || "";
  const km = CO.kmEntre(CO.coordDe(CIDADE), L.pontoDoLugar(alvo, CIDADE, "dentro"));
  const min = Math.max(CP.DENTRO_DOS_MUROS.minimoMinutos, Math.round((km / CO.KMH_A_PE) * 60));
  t("M2: a linha diz metros e minutos a pé (era «minutos a pé», sem número)", /dentro dos muros: \d+ m .* daqui, \d+ min a pé$/.test(l), l);
  t("o número é o do ponto do local (o mesmo do ⌖ do ONDE) e da marcha a pé de sempre", l.includes(CO.formatarDistancia(km)) && l.includes(`${min} min a pé`), `${l} · ${km}`);
  const aqui = L.pontoDoLugar(alvo, CIDADE, "dentro");
  const l2 = CP.fichaParaPauta(CIDADE, { semente: "NSN|cidade", genero: G, mapa: MAPA, frase, aqui }).pergunta.find((x) => x.startsWith("distância:")) || "";
  t("com o herói no próprio local (`aqui`), é aqui mesmo", /é aqui mesmo/.test(l2), l2);
  const outro = locais[3].nome;
  const l3 = CP.fichaParaPauta(CIDADE, { semente: "NSN|cidade", genero: G, mapa: MAPA, frase: `A que distância fica ${outro}?`, aqui }).pergunta.find((x) => x.startsWith("distância:")) || "";
  const km3 = CO.kmEntre(aqui, L.pontoDoLugar(outro, CIDADE, "dentro"));
  t("de um local a outro, a conta parte de `aqui`", l3.includes(CO.formatarDistancia(km3)), `${l3} · ${km3}`);
  t("`aqui` lixo cai no centro", J(CP.fichaParaPauta(CIDADE, { semente: "NSN|cidade", genero: G, mapa: MAPA, frase, aqui: "x" }).pergunta) === J(CP.fichaParaPauta(CIDADE, { semente: "NSN|cidade", genero: G, mapa: MAPA, frase }).pergunta));
}

/* ============================================================ */
sec("5. NOMES À MÃO, e o registo que os reconhece (7.ª: Ambrósio, Pregado, Dário)");
{
  const base = { semente: "s7", dia: 1, cidade: "Sul Molhado", genero: G };
  const a = N.nomesAMao(base);
  t("dois nomes, um de cada (NOMES_A_MAO.quantos)", a.length === 2 && a[0].genero === "ele" && a[1].genero === "ela", J(a));
  t("determinístico pelo dia e pela cidade", J(a) === J(N.nomesAMao(base)) && J(a) !== J(N.nomesAMao({ ...base, dia: 2 })));
  t("o sexo do nome é o do banco", N.sexoDoNome(a[0].nome) !== "fem" && N.sexoDoNome(a[1].nome) !== "masc");
  const usados = [a[0].nome, { nome: a[1].nome.split(" ")[0] + " Outro" }];
  const b = N.nomesAMao({ ...base, usados });
  const primeiro = (n) => n.split(" ")[0];
  t("quem já está no registo (texto ou objeto) sai da lista, pelo primeiro nome", b.length === 2 && !b.some((x) => [primeiro(a[0].nome), primeiro(a[1].nome)].includes(primeiro(x.nome))), J(b));
  t("os dois nomes nunca repetem o primeiro nome", primeiro(a[0].nome) !== primeiro(a[1].nome));
  const lex = { nomes: { masc: ["Ambrósio", "Brás", "Caetano", "Duarte", "Elói", "Fausto"], fem: ["Hilda", "Inês", "Joana", "Lia", "Marta", "Nísia"], sobrenome: ["Sal", "Breu", "Remo", "Cinza"] } };
  const c = N.nomesAMao({ ...base, lex });
  t("o léxico do mundo manda no nome (como em nomePessoa)", lex.nomes.masc.includes(primeiro(c[0].nome)) && lex.nomes.fem.includes(primeiro(c[1].nome)), J(c));
  const linha = N.linhaDosNomesAMao(a);
  /* E2 (12/10), MOVIDA: "para quem ainda não tem nome:" virou "a quem não tem
     nome:" — 9 caracteres que fazem a linha caber nos turnos de batida (§14). */
  t("a linha da pauta: curta, os dois nomes com o género", linha === `a quem não tem nome: ${a[0].nome} (ele) · ${a[1].nome} (ela)` && linha.length < 100, linha);
  t("lixo não estoura", J(N.nomesAMao(null)).startsWith("[") && N.linhaDosNomesAMao(null) === "" && N.linhaDosNomesAMao([null, {}]) === "" && J(N.nomesAMao({ usados: "x" })).length > 2);
  /* o registo reconhece */
  const d = primeiro(a[0].nome);
  const usadoMorto = N.nomesAMaoNaProsa(`"O homem se chamava ${d}," diz ela. "Era remador do Píer."`, a);
  t("7.ª M24: «o homem se chamava Dário» — usado, e MORTO (não se regista vivo)", usadoMorto.length === 1 && usadoMorto[0].nome === a[0].nome && usadoMorto[0].morto === true, J(usadoMorto));
  const vivo = N.nomesAMaoNaProsa(`${primeiro(a[1].nome)} serve a caneca e sorri. Lá fora alguém morreu ontem.`, a);
  t("o vivo é vivo, e a morte noutra oração não lhe pega", vivo.length === 1 && vivo[0].morto === false, J(vivo));
  t("pedaço de palavra não é o nome", N.nomesAMaoNaProsa(`${d}zinho passa`, a).length === 0);
  t("sem prosa ou sem oferecidos, nada", N.nomesAMaoNaProsa("", a).length === 0 && N.nomesAMaoNaProsa("texto", null).length === 0);
  t("a frase da morte é tabela (NOMES_A_MAO.morto)", N.NOMES_A_MAO.morto.test("enterrado ontem") && !N.NOMES_A_MAO.morto.test("bebe e ri"));
}

/* ============================================================ */
sec("6. quem espera à frente, na planta (6.ª: o rato e o lagarto)");
const PLANTA = congelar({
  nome: "Alicerces de Raízes", atual: 0, tochas: 0, chave: false,
  salas: [
    { id: 0, tipo: "entrada", camada: 0, saidas: [1, 2, 3, 5], visitada: true, resolvida: true },
    { id: 1, tipo: "combate", camada: 1, saidas: [4], visitada: false, resolvida: false, pista: "ouve-se respiração pesada lá dentro", inimigos: [{ nome: "voraz de boca larga" }] },
    { id: 2, tipo: "armadilha", camada: 1, saidas: [4], visitada: false, resolvida: false, pista: "o chão à frente tem marcas estranhas" },
    { id: 3, tipo: "chave", camada: 1, saidas: [4], visitada: false, resolvida: false, pista: "cheiro de metal e cera antiga", inimigos: [{ nome: "voraz de couraça" }, { nome: "voraz de couraça" }] },
    { id: 5, tipo: "combate", camada: 1, saidas: [4], visitada: false, resolvida: false, pista: "algo se move", inimigos: [{ nome: "rato de calabouço" }] },
    { id: 4, tipo: "chefe", camada: 2, saidas: [], visitada: false, resolvida: false, pista: "silêncio", inimigos: [{ nome: "Bicho do Fundo" }] },
  ],
});
{
  const ls = MS.masmorraParaPauta(PLANTA);
  const af = ls[ls.length - 1];
  t("a última linha diz quem espera atrás das passagens não vistas, com a pista", af === "à frente, só à vista de quem entra: voraz de boca larga, pela «ouve-se respiração pesada»; voraz de couraça ×2, pela «cheiro de metal»", af);
  t("no máximo MASMORRA_NA_PAUTA.maxAFrente (a terceira fica de fora)", !af.includes("rato") && MS.MASMORRA_NA_PAUTA.maxAFrente === 2);
  t("o chefe não entra (o portão do fundo tem linha própria)", !af.includes("Bicho do Fundo"));
  t("a linha do fundo continua inteira, antes desta", ls.some((x) => x.startsWith("o portão do fundo: a 2 passagens daqui")));
  t("na luta, só a linha da sala (nada de à frente)", MS.masmorraParaPauta(PLANTA, { luta: true }).length === 1);
  const vista = { ...PLANTA, salas: PLANTA.salas.map((s) => (s.id === 1 ? { ...s, visitada: true } : s)) };
  t("a sala já vista sai (a pista dela já diz o que ficou)", !(MS.masmorraParaPauta(vista).find((x) => x.startsWith("à frente")) || "").includes("boca larga"));
  const vazia = { ...PLANTA, salas: PLANTA.salas.map((s) => (s.tipo === "chefe" ? s : { ...s, inimigos: undefined })) };
  t("sem ninguém à frente, sem linha", !MS.masmorraParaPauta(vazia).some((x) => x.startsWith("à frente")));
  t("a planta recebida não muda (congelada) e o resultado é o mesmo duas vezes", J(MS.masmorraParaPauta(PLANTA)) === J(ls));
}

/* ============================================================ */
sec("7. a figura do arco tem nome (7.ª, M52: o velho camarada que virou Marlo)");
let CAM = null;
for (let i = 0; i < 120 && !CAM; i++) {
  const Mo = MOLDES[i % MOLDES.length];
  const semente = `Camarada|${i}`;
  const mapa = gerarGeografia(semente, Mo);
  const espinha = estenderEspinha({ semente, mapa, genero: G, molde: Mo, estrutura: "jornada", cidadeInicial: mapa.cidades[0].nome, antecedente: "artista", dia: 1 });
  const guildas = guildasDoMundo(semente, mapa, G, null);
  const elenco = elencoDoMundo(semente, mapa, { genero: G, molde: Mo, espinha, guildas });
  const nucleo = NU.nucleoDaCampanha(semente, mapa, { genero: G, molde: Mo, espinha, guildas, antecedente: "artista", grupo: [], elenco });
  const subs = ST.subtramasDoNucleo(nucleo, { semente, espinha, elenco, genero: G });
  const inst = subs.find((s) => s.arco === "a_guerra");
  if (inst) CAM = { semente, espinha, elenco, nucleo, subs, inst };
}
t("há um mundo com o arco do camarada (a_guerra)", !!CAM);
if (CAM) {
  const { inst } = CAM;
  t("FIGURA_DO_ARCO diz o papel e o sexo", ST.FIGURA_DO_ARCO.a_guerra.papel === "velho camarada" && ST.FIGURA_DO_ARCO.a_guerra.sexo === "masc");
  t("a figura tem nome, papel e de quem é", inst.figura && inst.figura.nome && inst.figura.papel === `velho camarada de ${inst.nome}` && inst.figura.de === inst.nome && inst.figura.genero === "ele", J(inst.figura));
  t("a crise abre pelo NOME (a linha pode cortar no fim, nunca no nome)", inst.crise.o.startsWith(`${inst.figura.nome}, velho camarada de ${inst.nome}`), inst.crise.o);
  t("o preço do lado diz quem desafia", inst.escolha.lados.find((l) => l.id === "defender").preco.startsWith(inst.figura.nome));
  const ocupados = [...CAM.nucleo.pessoas.map((p) => p.nome), ...(CAM.elenco.pessoas || []).map((p) => p.nome)].map((n) => String(n).split(" ")[0].toLowerCase());
  t("o primeiro nome não é de ninguém do núcleo nem do elenco", !ocupados.includes(inst.figura.nome.split(" ")[0].toLowerCase()));
  const outra = ST.subtramasDoNucleo(CAM.nucleo, { semente: CAM.semente, espinha: CAM.espinha, elenco: CAM.elenco, genero: G }).find((s) => s.arco === "a_guerra");
  t("o mesmo camarada em toda a campanha (determinístico)", outra && outra.figura.nome === inst.figura.nome);
  const posta = congelar({ v: 1, arcos: { [inst.nome]: { pedido: 1, crise: 3, posta: 4 } } });
  const ctx = { semente: CAM.semente, espinha: CAM.espinha, elenco: CAM.elenco, subtramas: CAM.subs, dia: 4, ato: 0 };
  const sem = ST.escolherLado(posta, CAM.nucleo, inst.nome, "defender", ctx);
  t("o duelo do cartão é com ELE, sem registo nem prosa", sem.luta && sem.luta.nome === inst.figura.nome && sem.luta.deOnde === "figura" && sem.luta.duelo === true, J(sem.luta));
  const comReg = ST.escolherLado(posta, CAM.nucleo, inst.nome, "defender", { ...ctx, presentes: [{ nome: inst.figura.nome, papel: inst.figura.papel }] });
  t("registado (como o App o fará), o registo dá o mesmo nome", comReg.luta && comReg.luta.nome === inst.figura.nome && comReg.luta.deOnde === "registo", J(comReg.luta));
  t("SEM_NOME.figura é o recurso sem banco", ST.SEM_NOME.figura === "alguém");
}
{
  const outros = ST.ARCOS.filter((a) => !ST.FIGURA_DO_ARCO[a.id]).map((a) => J(a));
  t("só os arcos da tabela usam {figura}", outros.every((x) => !x.includes("{figura}")) && Object.keys(ST.FIGURA_DO_ARCO).every((id) => J(ST.ARCOS.find((a) => a.id === id)).includes("{figura}")));
}

/* ============================================================ */
sec("8. uma medida só: a procura diz o que o Geógrafo diz (6.ª, M19/M30)");
{
  const molde = moldePorId("sobremundo");
  let provados = 0, iguais = 0, ex = "";
  for (let i = 0; i < 12; i++) {
    const mapa = R.mapaDaCampanhaNova(R.gerarRegiao({ semente: `Medida|${i}`, molde, genero: G, estrutura: ESTRUTURAS[i % ESTRUTURAS.length].id }));
    const base = mapa.cidades[0], outra = mapa.cidades[1];
    const lugar = mapa.regiao && (mapa.regiao.lugares || [])[0];
    if (!base || !outra || !lugar) continue;
    const coord = { x: lugar.x, y: lugar.y };
    const sitio = { nome: lugar.nome, distancia: "arredores", coord };
    const npcs = congelar({ Elmo: { nome: "Elmo", local: outra.nome, status: "vivo" } });
    const r = P.procurarPessoa("Elmo", { npcs, cidadeAtual: base.nome, mapa, coord, lugar: sitio });
    const g = GE.quemNaoChega([{ nome: "Elmo", onde: outra.nome, dias: 1 }], { mapa, coord, cidadeAtual: base.nome, lugar: sitio })[0] || "";
    if (!r || r.desfecho !== "noutro_lugar") continue;
    provados++;
    const env = P.envelopeDaProcura(r);
    if (r.tempo && g.includes(`${r.rumo}, ${r.distancia}`) && g.includes(`a ${r.tempo} daqui`) && env.includes(`a ${r.distancia} ${r.rumo}, ${r.tempo} daqui`)) iguais++;
    else ex = `${env.slice(0, 160)} || ${g.slice(0, 140)}`;
  }
  t(`a procura e o «não entra nesta cena» dão a mesma distância, rumo e hora (${iguais}/${provados})`, provados >= 6 && iguais === provados, ex);
  /* sem ponto do herói: a distância é a da cidade, pela régua do mapa (não a conta própria de antes) */
  const mapa = gerarGeografia("Medida|cont", MOLDES[0]);
  const [a, b] = mapa.cidades;
  const r = P.procurarPessoa("Elmo", { npcs: { Elmo: { nome: "Elmo", local: b.nome } }, cidadeAtual: a.nome, mapa });
  t("sem o ponto do herói, a distância sai de kmEntre entre as cidades", r && r.distancia === CO.formatarDistancia(CO.kmEntre(CO.coordDe(a), CO.coordDe(b))), J(r));
  t("o rumo já traz a preposição: nunca «para ao sul»", !/para (ao|a) /.test(P.envelopeDaProcura(r)) && !/para (ao|a) /.test(P.linhaDaProcura(r)));
  t("procurarPessoa com ctx null não estoura", tenta(() => P.procurarPessoa("Elmo", null), "x") === null || typeof tenta(() => P.procurarPessoa("Elmo", null)) === "object");
}

/* ============================================================ */
sec("9. o nome próprio de outro sítio não vira o tipo daqui (6.ª, M30: os dois postos)");
{
  const daqui = [{ nome: "o posto da estrada", tipo: "posto", onde: "arredores" }, { nome: "a capela da encruzilhada", tipo: "capela", onde: "arredores" }, { nome: "O Javali Cambaleante", tipo: "taverna", onde: "dentro" }];
  const M30 = "Caminhamos a noite inteira, sem parar. Quando chegamos a Serra do Bode, vou direto ao Posto da Baixa e pergunto pelo Elmo: sei que ele guarda a última ponta do texto que eu li.";
  t("M30: «vou direto ao Posto da Baixa» não move para «o posto da estrada»", L.lugarPedido(M30, daqui) === null);
  t("«vou ao posto» continua a achar o posto daqui (o tipo)", (L.lugarPedido("Vou ao posto ver se há notícias.", daqui) || {}).nome === "o posto da estrada");
  t("o nome inteiro daqui continua a ganhar, com maiúsculas", (L.lugarPedido("Vou à Capela da Encruzilhada.", daqui) || {}).nome === "a capela da encruzilhada");
  t("o nome próprio daqui, sem artigo, continua a casar", (L.lugarPedido("Vou ao Javali Cambaleante.", daqui) || {}).nome === "O Javali Cambaleante");
  t("e o pedaço solto do nome daqui também", (L.lugarPedido("vou ao javali", daqui) || {}).nome === "O Javali Cambaleante");
  t("as ligas do nome próprio são tabela", L.NOME_PROPRIO_DO_SITIO.ligas.includes("da"));
  t("lixo não estoura", L.lugarPedido(null, daqui) === null && L.lugarPedido("vou ao Posto da Baixa", null) === null);
}

/* ============================================================ */
sec("10. a luta que só a prosa começaria: o veto já cobre os dois turnos medidos");
{
  const M43 = "Ignoro a jarra. Sigo direto em direção ao ronco, descendo para a camada seguinte, e quando vir o que respira, não recuo: grito para chamá-lo e Vando e eu o enfrentamos.";
  const M47 = "Respondo a Nira que sim, é ele, e que não o escute. Avanço pelo túnel com Vando e enfrento o que vier ao nosso encontro, sem recuar um passo.";
  /* o M43 ("quando vir o que respira, não recuo… o enfrentamos") é um plano
     condicional e a peneira tira-o, de propósito; ali o rato foi a planta
     calada — o conserto é o ocupante da sala (secção 6), não o veto */
  t("6.ª M43 é plano («quando vir…»): sem veto, e a planta passa a dizer quem lá está", A.vetoDaLutaSemPainel(M43, {}).length === 0);
  t("6.ª M47 («A luta começa») leva o veto", A.vetoDaLutaSemPainel(M47, {}).length === 1);
}

/* ============================================================ */
sec("11. a pauta: as secções novas, o que cede, e o teto");
{
  const nomes = PA.secaoPorId("nomes"), preco = PA.secaoPorId("preco");
  /* E2 (12/10), MOVIDA: a linha passou de 2,488 para 2,477 — À FRENTE da ficha
     (2,485) e da marca do fio (2,48), logo depois da batida (2,475): nos turnos
     de batida ela nunca cabia (a prova viva da E1; §14 prova-o com as pautas
     reais da 6.ª e da 7.ª). Continua depois de todo veto e do coração. */
  t("NOMES À MÃO: depois de todo veto, do coração e da batida; antes da ficha e da decoração", nomes && nomes.prio < PA.secaoPorId("quemE").prio && nomes.prio > PA.secaoPorId("coracao").prio && nomes.prio > PA.secaoPorId("momento").frente[0] && nomes.prio < PA.secaoPorId("economia").prio && nomes.prio < 2.49 && nomes.prio > PA.secaoPorId("naoPode").prio + 0.4);
  t("O PREÇO da rua: decoração com número (depois da gente, antes do daqui)", preco && preco.prio > PA.secaoPorId("gente").prio && preco.prio < PA.secaoPorId("daqui").prio);
  t("na luta cedem o preço e os nomes", PA.SECOES_QUE_CEDEM.luta.includes("preco") && PA.SECOES_QUE_CEDEM.luta.includes("nomes"));
  t("na masmorra e fora dos muros cede o preço; os nomes ficam", ["masmorra", "arredores"].every((k) => PA.SECOES_QUE_CEDEM[k].includes("preco") && !PA.SECOES_QUE_CEDEM[k].includes("nomes")));
  t("numa pergunta que o sistema responde cedem a rua e os nomes (a resposta passa à frente)", PA.SECOES_QUE_CEDEM.pergunta.includes("preco") && PA.SECOES_QUE_CEDEM.pergunta.includes("nomes"));
  t("a pergunta que o sistema NÃO responde (PERGUNTOU vazia) deixa os nomes («quem era o velho?»)", (PA.cederNaCena({ nomes: ["para quem ainda não tem nome: X (ele)"] }, {}).nomes || []).length === 1);
  t("o teto não subiu", PA.TETO_DA_PAUTA === 1400);

  /* O TETO, MEDIDO: 600 pautas semeadas de cidade e de masmorra, cheias de
     propósito (a "cidade cheia" de ~1323 do teste-subtramas, e mais), com e
     sem as linhas novas. Nenhum veto, desfecho ou 1.ª linha do ONDE que chega
     sem elas pode faltar com elas — e o teto nunca passa. */
  const rnd = rngDe("NSN|teto");
  const pick = (xs) => xs[Math.floor(rnd() * xs.length)];
  const veto = (i) => `veto ${i}: ${"o lugar não comporta isto nem aquilo, ".repeat(1 + Math.floor(rnd() * 3))}`.trim();
  const ns = N.linhaDosNomesAMao(N.nomesAMao({ semente: "NSN", dia: 1, cidade: CIDADE.nome, genero: G }));
  const rua = M.precosDaRua(1.5);
  const perguntado = M.precoComumParaPauta("Peço duas canecas de cerveja e uma sopa. Quanto é?", { fator: 1.5 }).pergunta[0];
  const aFrente = MS.masmorraParaPauta(PLANTA);
  let nSemPerg = 0, tiraVeto = 0, tiraFerro = 0, passou = 0, nomesEntra = 0, ruaEntra = 0, pergEntra = 0, nPerg = 0, nRua = 0, piorNovo = 0;
  for (let k = 0; k < 600; k++) {
    const masm = k % 3 === 0;
    const perg = !masm && rnd() < 0.5;
    const base = {
      onde: [`em ${CIDADE.nome}, dentro de um lugar com nome comprido`, "⌖ K11 50,0 · 50,0 (172 m do centro)", "comporta: correr, cercar, atirar de longe, ver quem se aproxima; usar a plateia"],
      naoPode: Array.from({ length: 1 + Math.floor(rnd() * 4) }, (_, i) => veto(i)),
      rumo: "responda primeiro ao que perguntei, com o que está nesta pauta; o que ninguém aqui sabe, quem responde diz que não sabe",
      fecho: "termine em alguém em cena faz-me uma pergunta direta, que pede resposta minha",
      momento: rnd() < 0.7 ? ["ESPINHA — batida 1 de 4: alguém sabe uma coisa sobre quem ensinou ao herói aquela canção; A PERGUNTA: de que lado está?"] : [],
      coracao: rnd() < 0.4 ? [`${"Uma pessoa do núcleo pede ao herói uma coisa que custa. ".repeat(3)}`.slice(0, 220)] : [],
      quem: ["Frida da Vela (taverneira), Jaco Faro (anda comigo)"],
      gente: rnd() < 0.6 ? ["Jaco Faro espera eu decidir antes de fazer o que já ia fazer"] : [],
      economia: masm ? [] : ["Esta cidade vive do que os outros trazem. Cheira a cera, tinta e perfume caro. Aqui sobra relíquia e papel."],
      desfecho: rnd() < 0.2 ? ["o goblin caiu agora, e o jogador escreveu: «abro-lhe a guarda com o escudo e enterro a lâmina»"] : [],
      vetoDoDesfecho: [],
      masmorra: masm ? aFrente.slice(0, -1) : [],
      pergunta: perg ? [pick(["pouso: quarto comum ◉ 6 a noite (◉ 36 a semana), bom ◉ 15, estábulo ◉ 2 por animal; 2 camas por quarto", "distância: a Biblioteca Calada, dentro dos muros: 130 m a nordeste daqui, 2 min a pé"])] : [],
    };
    const cena = { masmorra: masm };
    const com = {
      ...base,
      nomes: [ns],
      preco: [rua],
      pergunta: perg ? [...base.pergunta, perguntado] : base.pergunta,
      masmorra: masm ? aFrente : [],
    };
    const tx0 = PA.textoDaPauta(PA.cederNaCena(base, cena));
    const tx1 = PA.textoDaPauta(PA.cederNaCena(com, cena));
    if (tx1.length <= PA.TETO_DA_PAUTA) passou++;
    for (const v of [...base.naoPode, ...base.desfecho]) if (tx0.includes(v) && !tx1.includes(v)) tiraVeto++;
    if (!tx1.includes(base.onde[0])) tiraFerro++;
    if (!perg && tx1.includes(ns)) nomesEntra++;
    if (!perg) nSemPerg++;
    if (!masm && !perg) { nRua++; if (tx1.includes(rua)) ruaEntra++; }
    if (perg) { nPerg++; if (tx1.includes(perguntado)) pergEntra++; }
    piorNovo = Math.max(piorNovo, tx1.length - tx0.length);
  }
  console.log(`      (600 pautas: NOMES À MÃO entra em ${nomesEntra}/${nSemPerg} cenas sem PERGUNTOU; a rua em ${ruaEntra}/${nRua} turnos sem pergunta; o preço perguntado em ${pergEntra}/${nPerg}; o pior acréscimo ao texto: ${piorNovo} caracteres)`);
  console.log(`      (o custo das linhas, com etiqueta: nomes ${ns.length + 14}, rua ${rua.length + 14}, preço perguntado ${perguntado.length + 14}, à frente ${aFrente[aFrente.length - 1].length + 14})`);
  t("o teto nunca passa (600/600)", passou === 600);
  t("nenhum veto nem desfecho que chegava deixa de chegar", tiraVeto === 0, String(tiraVeto));
  t("a 1.ª linha do ONDE nunca cai", tiraFerro === 0);

  /* E O PIOR CASO REAL: as 66 pautas ENVIADAS da 5.ª sessão (registo-s5-pauta.json,
     linha a linha), com as linhas novas por cima — NOMES À MÃO fora da luta, a
     rua na cidade fora da masmorra e da pergunta. */
  const REG = JSON.parse(readFileSync(new URL("./registo-s5-pauta.json", import.meta.url), "utf8"));
  let rTira = 0, rTeto = 0, rNomes = 0, rCand = 0, rRua = 0, rRuaCand = 0, rPior = 0, rMaior = 0;
  for (const tu of REG.turnos) {
    const base = {};
    for (const [id, ix] of Object.entries(tu.secoes)) base[id] = ix.map((i) => REG.linhas[i]);
    const cena = { luta: tu.luta, masmorra: tu.masmorra };
    const com = { ...base, ...(tu.luta ? {} : { nomes: [ns] }), ...(!tu.luta && !tu.masmorra ? { preco: [rua] } : {}) };
    const tx0 = PA.textoDaPauta(PA.cederNaCena(base, cena)), tx1 = PA.textoDaPauta(PA.cederNaCena(com, cena));
    if (tx1.length > PA.TETO_DA_PAUTA) rTeto++;
    for (const v of [...(base.naoPode || []), ...(base.desfecho || []), ...(base.vetoDoDesfecho || []), ...(base.pergunta || []), ...(base.fala || []), ...(base.rumo || []), (base.onde || [])[0]].filter(Boolean)) if (tx0.includes(v) && !tx1.includes(v)) rTira++;
    const semPerg = !(base.pergunta && base.pergunta.length);
    if (!tu.luta && semPerg) { rCand++; if (tx1.includes(ns)) rNomes++; }
    if (!tu.luta && !tu.masmorra && semPerg) { rRuaCand++; if (tx1.includes(rua)) rRua++; }
    rPior = Math.max(rPior, tx1.length - tx0.length);
    rMaior = Math.max(rMaior, tx1.length);
  }
  console.log(`      (a 5.ª sessão, ${REG.turnos.length} pautas reais: NOMES À MÃO entra em ${rNomes}/${rCand} fora da luta e sem PERGUNTOU; a rua em ${rRua}/${rRuaCand}; o acréscimo maior: ${rPior}; a pauta maior: ${rMaior}/${PA.TETO_DA_PAUTA})`);
  t("na sessão real, o teto nunca passa", rTeto === 0);
  t("na sessão real, nenhum veto, desfecho, fala, resposta, rumo ou lugar que chegava deixa de chegar", rTira === 0, String(rTira));
  t("na sessão real, NOMES À MÃO chega em 90% ou mais das cenas onde pode (fora da luta, sem PERGUNTOU)", rNomes >= rCand * 0.9, `${rNomes}/${rCand}`);
}

/* ============================================================ */
sec("12. a régua: as 31 invenções, contra o motor de hoje (ab-invencoes.mjs)");
{
  const aqui = dirname(fileURLToPath(import.meta.url));
  let res = null;
  try { res = JSON.parse(execFileSync(process.execPath, ["ab-invencoes.mjs", "--json"], { cwd: aqui, encoding: "utf8" })); } catch (e) { try { res = JSON.parse(String(e.stdout || "")); } catch { res = null; } }
  t("a régua corre e lê as 31", res && res.total === 31, J(res));
  t(`com o dado em frase fechada: ${res ? res.agora : "?"} de 31 (antes 7; alvo ≥ ${res ? res.alvo : 27})`, res && res.agora >= 27 && res.antes === 7, res ? J(res.semDado) : "");
  t("as 7 que o Narrador ignorou continuam com o dado", res && res.porOrigem.ignorou.tem === 7);
  t("as 6 em que o sistema errou passam a estar certas", res && res.porOrigem.errou.tem === 6);
}

sec("13. a fiação no App.jsx (o frontend, 12/10) — o que o motor entrega chega à mesa");
{
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const corpo = (ancora) => { const i = app.indexOf(ancora); return i < 0 ? "" : app.slice(i, i + 16000); };
  const fichas = corpo("const fichasDaMesa = (frase = \"\", presentes = null) => {");
  const pauta = corpo("const pautaDoTurno = (acaoDoTurno = \"\") => {");
  t("o App importa as peças do motor (mercado, nomes, cidade-por-dentro)",
    /import \{[^}]*\bprecoComumParaPauta\b[^}]*\bprecosDaRua\b[^}]*\} from "\.\/mercado\.js"/.test(app)
    && /import \{[^}]*\bnomesAMao\b[^}]*\blinhaDosNomesAMao\b[^}]*\bnomesAMaoNaProsa\b[^}]*\} from "\.\/nomes\.js"/.test(app)
    && /import \{[^}]*\bfichaDaCidade\b[^}]*\} from "\.\/cidade-por-dentro\.js"/.test(app));
  t("o porte da terra sai da ficha da cidade (pouso.fator), num calou que devolve 1",
    /const fatorDoPouso = \(\) => \{[^]*?f\.pouso\.fator[^]*?calou\("fatorDoPouso", e\); return 1;/.test(app));
  t("o preço comum é a 5.ª ficha da mesa, num calou, fora da luta e numa cidade",
    /* 9.ª sessão (v9.433, a fiação): a linha ganhou a moeda do mundo
       (moedaDoMundo), para o preço comum dizer a unidade — o Mestre vendia em
       "marcos". O resto (fora da luta, numa cidade, o porte da terra) é igual. */
    fichas.includes("pc = (!combateRef.current && cidadeAtualRef.current) ? precoComumParaPauta(frase, { fator: fatorDoPouso(), moeda: moedaDoMundo() }) : null;")
    && fichas.includes('calou("precoComumParaPauta", e)')
    && pauta.includes("juntarRespostas([fc, gp, mc, hz, pc])"));
  t("o oráculo cala também pelo preço comum (pela ficha do mercado)",
    app.includes("fichas: () => fichasDoOraculo(acao)") && /const fichasDoOraculo[^]*?mercado: \{ pergunta: \[\.\.\.\(mc\.pergunta \|\| \[\]\), \.\.\.pc\.pergunta\]/.test(app));
  /* 19/10 (a 12.ª sessão): a âncora ganhou a moeda do Léxico — a rua dizia
     só o ◉, e a abertura chamou "cobres" a um mundo que paga em lascas
     (teste-sessao-12.mjs prova a linha). A condição da rua é a mesma. */
  t("a rua entra na secção O PREÇO só com rua (cidade, sem jornada, masmorra nem luta)",
    pauta.includes('if (cidadeAtualRef.current && !jornadaRef.current && !masmorraRef.current && !combateRef.current) p = porNaPauta(p, "preco", precosDaRua(fatorDoPouso(), { moeda: moedaDoMundo() }));'));
  t("os nomes à mão vão à secção NOMES À MÃO, com o registo, o elenco e o grupo como usados",
    pauta.includes("...Object.values(npcsRef.current || {}), ...nomesDoElenco(), ...(p0.grupo || [])")
    && pauta.includes('p = porNaPauta(p, "nomes", linha); nomesPendentesRef.current = { nomes, linha };'));
  /* a prova viva (12/10) mostrou o Narrador a usar no turno 8 o nome oferecido
     no 7, com a linha do 8 cortada pelo teto: os oferecidos ficam até a linha
     voltar, e o usado sai da lista seguinte por estar no registo */
  t("os nomes só contam como oferecidos se a linha chegou ao texto (o molde do QUEM É), e ficam até ela voltar",
    app.includes("if (np && np.linha && pauta.includes(np.linha)) nomesOferecidosRef.current = np.nomes;") && !app.includes("nomesOferecidosRef.current = [];"));
  t("ao fim do turno, o nome usado na prosa entra no registo — e morto, se a oração o pôs morto",
    app.includes("const usados = nomesAMaoNaProsa(resp.narrativa, nomesOferecidosRef.current || []);")
    && app.includes("...(u.morto ? { status: \"morto\" } : {})") && app.includes('calou("os nomes à mão na prosa", e)'));
  t("os refs dos nomes vivem no turno, não no save",
    !/nomesOferecidos\s*:/.test(app) && !/nomesPendentes\s*:/.test(app));
  t("a ficha da cidade mede do ponto do herói (aqui: meuPonto())",
    fichas.includes("aqui: meuPonto(),"));
  t("a procura recebe os três do Geógrafo (coord, lugar, jornada)",
    app.includes("coord: meuPonto(), lugar: lugarRef.current, jornada: jornadaRef.current,"));
  t("a figura do arco entra no registo só quando a linha que a nomeia coube no texto",
    /const confirmarCoracao = \(pauta\) => \{[^]*?if \(r\.linha && !String\(pauta \|\| ""\)\.includes\(r\.linha\)\) return;[^]*?i\.figura && i\.figura\.nome[^]*?r\.linha\.includes\(inst\.figura\.nome\)[^]*?calou\("a figura do arco no registo", e\)/.test(app));
}

/* ============================================================ */
sec("14. os dois defeitos que a prova viva da E1 viu (frontend, v9.421) — consertados no motor (E2, 12/10)");
{
  /* (a) "Dois paes? Quatro coroas." — a linha do preço perguntado dizia a
     palavra da frase SEM acento ("2× paes ◉ 2"), e o Narrador copiou-a. A
     linha diz agora a palavra com a grafia da tabela (`GRAFIA_DA_RUA`,
     economia.js), escreva o jogador com ou sem til. */
  const doisPaes = M.precoComumParaPauta("compro dois pães", { fator: 1 }).pergunta[0] || "";
  t("«compro dois pães» → a linha diz «pães», nunca «paes»", /2× pães ◉/.test(doisPaes) && !/\bpaes\b/.test(doisPaes), doisPaes);
  const semTil = M.precoComumParaPauta("compro dois paes", { fator: 1 }).pergunta[0] || "";
  t("escrito sem til, a linha leva o til da tabela", /2× pães ◉/.test(semTil), semTil);
  const umPao = M.precoComumParaPauta("quanto custa um pão?", { fator: 1 }).pergunta[0] || "";
  t("«um pão» → «pão»", /pão ◉/.test(umPao) && !/\bpao\b/.test(umPao), umPao);
  const figo = M.precoComumParaPauta("quanto custa um figo?", { fator: 1 }).pergunta[0] || "";
  t("a palavra que não leva acento segue tal qual (figo)", /\bfigo ◉/.test(figo), figo);
  const rua = E.PRECOS_COMUNS.find((p) => p.id === "rua");
  t("toda grafia da tabela é de uma palavra que a linha da rua conhece", Object.keys(E.GRAFIA_DA_RUA).length > 0 && Object.keys(E.GRAFIA_DA_RUA).every((k) => rua.rx.test(k)) && Object.isFrozen(E.GRAFIA_DA_RUA));
  t("a linha da rua não usa a palavra sem acento", !/\bpao\b|\bpaes\b/.test(M.precosDaRua(1)), M.precosDaRua(1));

  /* (b) NOMES À MÃO perdia o teto nos turnos de batida: com 2,488 a linha
     cortava DEPOIS da batida (2,475), da 2.ª linha do momento (2,48) e da
     ficha (2,485); nos turnos 2–6 da prova viva nunca coube, e o Narrador
     inventou Jaina, Dren e Jorik exatamente aí. Corta agora logo depois da
     batida (que move a história e não cede) e à frente do que a decora (a
     marca do fio, a ficha, a cauda do ONDE, a economia); a linha encurtou
     ("a quem não tem nome:" no lugar de "para quem ainda não tem nome:").
     E os vetos andam de 0,05 em 0,05: com 0,1 o 6.º veto cortava com 2,5 —
     atrás dos nomes — e "Tamsin está em Serra do Bode… não entra nesta
     cena" caía em 4 pautas reais da 6.ª sessão. */
  const nomes = PA.secaoPorId("nomes"), mom = PA.secaoPorId("momento"), qe = PA.secaoPorId("quemE");
  t("NOMES À MÃO corta depois da batida, à frente da marca do fio e da ficha", nomes.prio > mom.frente[0] && nomes.prio < mom.frente[1] && nomes.prio < qe.prio, String(nomes.prio));
  t("os nove primeiros vetos cortam à frente da planta da masmorra (nenhum perde para os nomes nem para a decoração)", [0, 1, 2, 3, 4, 5, 6, 7, 8].every((i) => PA.prioDaLinha(PA.secaoPorId("naoPode"), i) < PA.secaoPorId("masmorra").prio));
  const ln = N.linhaDosNomesAMao([{ nome: "Aldric", genero: "ele" }, { nome: "Alba da Pedra", genero: "ela" }]);
  t("a linha encurtou e ainda diz para quê", ln === "a quem não tem nome: Aldric (ele) · Alba da Pedra (ela)", ln);

  /* a prova com pautas reais de turno de batida: as 138 ENVIADAS da 6.ª e
     da 7.ª sessões (registo-s6-s7-pauta.json), 65 delas com a batida da
     espinha fora da luta. Antes deste conserto a linha entrava em 25 das 65. */
  const REG = JSON.parse(readFileSync(new URL("./registo-s6-s7-pauta.json", import.meta.url), "utf8"));
  let cand = 0, entra = 0, bat = 0, batEntra = 0, tira = 0, teto = 0; const tirou = [];
  for (const tu of REG.turnos) {
    const base = {};
    for (const [id, ix] of Object.entries(tu.secoes)) base[id] = ix.map((i) => REG.linhas[i]);
    const cena = { luta: tu.luta, masmorra: tu.masmorra };
    const com = tu.luta ? base : { ...base, nomes: [ln] };
    const tx0 = PA.textoDaPauta(PA.cederNaCena(base, cena)), tx1 = PA.textoDaPauta(PA.cederNaCena(com, cena));
    if (tx1.length > PA.TETO_DA_PAUTA) teto++;
    const guardadas = [...(base.naoPode || []), ...(base.desfecho || []), ...(base.vetoDoDesfecho || []), ...(base.pergunta || []), ...(base.fala || []), ...(base.rumo || []), ...(base.fecho || []), ...(base.coracao || []), ...(base.volta || []), ...(base.masmorra || []), (base.momento || [])[0], (base.onde || [])[0]].filter(Boolean);
    for (const v of guardadas) if (tx0.includes(v) && !tx1.includes(v)) { tira++; tirou.push(v.slice(0, 60)); }
    if (tu.luta || (base.pergunta || []).length) continue;
    cand++; if (tx1.includes(ln)) entra++;
    if ((base.momento || []).length) { bat++; if (tx1.includes(ln)) batEntra++; }
  }
  console.log("      (6.ª e 7.ª, " + REG.turnos.length + " pautas reais: NOMES À MÃO entra em " + batEntra + "/" + bat + " turnos de batida e em " + entra + "/" + cand + " fora da luta e sem PERGUNTOU; antes: 25/65 e 55/124)");
  t("o teto nunca passa nas 138", teto === 0);
  t("nenhum veto, desfecho, resposta, fala, rumo, fecho, coração, o que volta, planta, batida ou lugar que chegava deixa de chegar", tira === 0, J(tirou));
  t("nos turnos de batida a linha passa a caber em 70% ou mais (antes 25/65)", batEntra >= bat * 0.7, batEntra + "/" + bat);
}

console.log(`\nnarrador só narra (E1): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
