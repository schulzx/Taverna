/* teste-cena-do-lugar.mjs — a frente da CENA da 10.ª sessão de prova (13/10)

   "Falo com Nyla Punho-de-Pedra", tocado na ficha dela, e o Mestre pôs um
   "estalajadeiro" no lugar (M18): a mesma pauta dizia em LONGE que a Nyla
   estava em Monte Rasa, a um dia, e a ficha nascera da prosa. Em 9 das 78
   pautas a linha EM CENA trazia alguém que a própria pauta punha em LONGE.
   Esta suíte prova os três consertos com o que a sessão deu de verdade
   (`registo-s10-cena.json`: as 78 pautas e as 78 respostas):

     1. o EM CENA nasce do lugar (em-cena.js, EM_CENA_DO_LUGAR): a sessão
        refeita pauta a pauta — 0 de 78 com gente de LONGE, na linha e nas
        fichas; as duas Nylas; a memória que não muda de sítio; o nome que
        só é dito (o gancho, a fala de outro, o complemento) contra o nome
        que age; o arquivista e o tiefling que ficaram sem ficha;
     2. procurar fora de cena chega à pessoa (procura.js, turno.js,
        nucleo.js): "procuro meu antigo companheiro de armas" (M22), "a
        terceira da minha companhia… onde posso encontrá-la" (M64) e o
        "Procuro Nyla Punho-de-Pedra" do Códice (M26) abrem a porta da
        procura; os papéis da companhia procurados entre os tomos (M38) não
        são a Helga; quem ouve a pergunta perde para quem é procurado;
     3. o registo de gente (npcs.js, POSTO_E_OFICIO): "Sargenta Barbaforte"
        é a heroína, e "Taverneiro da Fivela & o Trigo" é o Perrin.

   Falha na árvore de antes (v9.454): a sessão refeita dá 15 pautas com gente
   de LONGE, as procuras de M22 e M26 não abrem porta, M38 acha a Helga, e os
   dois nomes entram no registo. */
import fs from "node:fs";
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const S = "../src/";
const J = JSON.stringify;

const EC = await import(S + "em-cena.js");
const FI = await import(S + "fichas.js");
const P = await import(S + "procura.js");
const TU = await import(S + "turno.js");
const NP = await import(S + "npcs.js");
const NU = await import(S + "nucleo.js");
const R = JSON.parse(fs.readFileSync("./registo-s10-cena.json", "utf8"));
const sem = (x) => String(x == null ? "" : x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const nucleo = R.nucleo;
/* o nucleoEmCena do App, como está: o núcleo citado nas duas últimas falas,
   pelo nome inteiro ou pelo primeiro — é a fonte que trazia a segunda Nyla */
const nucleoEmCena = (falas, grupo) => {
  const fala = " " + sem(falas.join(" ")).replace(/[^a-z0-9]+/g, " ") + " ";
  return nucleo.pessoas.filter((p) => {
    const inteiro = sem(String(p.nome).split(",")[0]).replace(/[^a-z0-9]+/g, " ").trim();
    const prim = inteiro.split(" ")[0] || "";
    return fala.includes(" " + inteiro + " ") || (prim.length >= 3 && fala.includes(" " + prim + " ")) || grupo.includes(sem(p.nome));
  }).map((p) => p.nome);
};
const fichaDe = (nome) => Object.values(R.npcs).find((n) => sem(n.nome) === sem(nome)) || { nome };
const ctxDa = (i, antes, depois) => {
  const p = R.pautas[i], m = i + 1;
  const grupo = p.presentes.filter((x) => /viaja/.test(x.motivo)).map((x) => ({ nome: x.nome }));
  const presentes = p.presentes.filter((x) => !/viaja/.test(x.motivo)).map((x) => ({ ...fichaDe(x.nome), nome: x.nome }));
  /* antes da resposta: as duas falas de antes; depois: a lista das fichas */
  const mostrado = depois ? R.respostas.slice(Math.max(0, m - 2), m) : R.respostas.slice(Math.max(0, m - 3), m - 1);
  return { semente: "s10", turno: depois ? m + 0.5 : m, cidade: p.cidade, presentes, longe: p.longe, grupo, comigo: [], emCena: nucleoEmCena(mostrado, grupo.map((g) => sem(g.nome))), nucleo, mostrado, frase: p.frase, lugar: { nome: p.onde }, antes };
};

/* ============================================================ */
sec("1. O EM CENA NASCE DO LUGAR — a sessão inteira, pauta a pauta");
{
  t("a tabela do lugar existe e diz quem leva o primeiro nome (o grupo, o registo, o núcleo)", () => EC.EM_CENA_DO_LUGAR.ordemDoNome.comigo < EC.EM_CENA_DO_LUGAR.ordemDoNome.registo && EC.EM_CENA_DO_LUGAR.ordemDoNome.registo < EC.EM_CENA_DO_LUGAR.ordemDoNome.nucleo && !!EC.EM_CENA_DO_LUGAR.porque);
  /* a medida da sessão, nas linhas que foram de verdade ao Narrador */
  let reais = 0;
  for (const p of R.pautas) {
    const gente = p.emCena.split(";")[0].split(" · ").map((s) => s.replace(/\s*\(.*$/, "").trim()).filter(Boolean);
    if (gente.some((g) => p.longe.some((l) => sem(l) === sem(g) || (sem(l).split(" ")[0] === sem(g).split(" ")[0] && sem(g).split(" ")[0].length >= 4)))) reais++;
  }
  t("a medida de partida: 9 das 78 pautas enviadas listavam em EM CENA alguém de LONGE", R.pautas.length === 78 && reais === 9, `${reais}/${R.pautas.length}`);
  let antes = null, naLinha = 0, nasFichas = 0;
  const exemplos = [];
  R.pautas.forEach((p, i) => {
    const lista = EC.montarEmCena(ctxDa(i, antes, false));
    const lista2 = EC.montarEmCena(ctxDa(i, lista, true));
    antes = lista;
    const L = new Set(p.longe.map(sem));
    const linha = lista.filter((x) => x.tipo === "pessoa" && x.aqui).sort((a, b) => (a.comigo ? 1 : 0) - (b.comigo ? 1 : 0)).slice(0, EC.EM_CENA_NA_PAUTA.pessoa).map((x) => x.nome);
    const fichas = FI.fichasDaCena(lista2, { mostrado: ctxDa(i, null, true).mostrado }).map((f) => f.nome);
    const todos = lista.filter((x) => x.tipo === "pessoa").map((x) => x.nome);
    if (linha.some((g) => L.has(sem(g)))) { naLinha++; exemplos.push(`M${i + 1} linha ${linha.join("·")}`); }
    if (fichas.some((g) => L.has(sem(g)))) { nasFichas++; exemplos.push(`M${i + 1} fichas ${fichas.join("·")}`); }
    if (todos.some((g) => L.has(sem(g)))) exemplos.push(`M${i + 1} lista ${todos.join("·")}`);
  });
  t("refeita com o motor de hoje: 0 de 78 pautas com gente de LONGE na linha EM CENA (a árvore de antes: 15)", naLinha === 0, exemplos.slice(0, 4).join(" | "));
  t("…e 0 de 78 respostas com a ficha de alguém que o sistema sabe longe (a árvore de antes: 14)", nasFichas === 0, exemplos.slice(0, 4).join(" | "));
  t("…e ninguém de LONGE fica sequer na lista (a frase não o pode apontar)", exemplos.length === 0, exemplos.slice(0, 4).join(" | "));
}

sec("2. OS CASOS DA SESSÃO, UM A UM");
{
  const nyla = "Nyla Punho-de-Pedra", pele = "Nyla Pé-Leve";
  /* M19: a Nyla está em Monte Rasa (LONGE), e o Mestre acabara de dizer que ela não estava */
  const m19 = EC.montarEmCena(ctxDa(18, null, false));
  t("M19: a Nyla de LONGE não está na lista, nem a outra Nyla do núcleo", !m19.some((x) => x.nome === nyla || x.nome === pele), J(m19.filter((x) => x.tipo === "pessoa").map((x) => x.nome)));
  t("M19: «Falo com Nyla Punho-de-Pedra» não aponta ninguém da lista (a ficha não mente)", EC.quemNaFrase("Falo com Nyla Punho-de-Pedra", m19).every((x) => x.tipo !== "pessoa" || x.nome === "Saoirse"), J(EC.quemNaFrase("Falo com Nyla Punho-de-Pedra", m19)));
  const fNyla = FI.quemNoEnvio({ texto: "Falo com Nyla Punho-de-Pedra" }, m19, null);
  t("…e o envio também não (quemNoEnvio)", !fNyla.some((x) => x.nome === nyla), J(fNyla));
  /* as duas Nylas em Monte Rasa: o registo leva o primeiro nome */
  const duas = EC.montarEmCena({ semente: "s10", cidade: "Monte Rasa", presentes: [{ nome: nyla, papel: "guardiã de O Rossio Torto" }], grupo: [{ nome: "Saoirse" }], nucleo, emCena: [nyla, pele], mostrado: ["Nyla ergue os olhos da banca e espera que você fale."], lugar: { nome: "A Alfândega do Norte" } });
  const aVista = duas.filter((x) => x.tipo === "pessoa" && x.aqui).map((x) => x.nome);
  t("«Nyla ergue os olhos»: a Nyla do registo está à vista, a Pé-Leve do núcleo não (o primeiro nome é de quem o sistema sabe)", aVista.includes(nyla) && !aVista.includes(pele), J(aVista));
  t("…e o nome inteiro dito leva sempre", EC.montarEmCena({ semente: "s10", cidade: "Monte Rasa", presentes: [{ nome: nyla }], nucleo, emCena: [pele], mostrado: ["Nyla Pé-Leve encosta-se à porta e sorri."], lugar: { nome: "Monte Rasa" } }).some((x) => x.nome === pele && x.aqui));
  /* M49: o Perrin fala da Helga, que está em Monte Rasa */
  const m49 = EC.montarEmCena({ semente: "s10", cidade: "Nova Profundo", presentes: [{ nome: "Perrin", papel: "taverneiro" }], longe: ["Helga", "Godfrey da Foz", nyla], grupo: [{ nome: "Saoirse" }], nucleo, emCena: ["Helga", "Perrin", nyla, pele], mostrado: ["Perrin baixa a voz. — A Helga sabe mais do que diz, sargenta. E a Nyla também."], lugar: { nome: "Fivela & o Trigo" } });
  t("M49: a Helga de LONGE, citada pelo Perrin, não entra (nem as Nylas); o Perrin, que fala, está à vista", !m49.some((x) => ["Helga", nyla, pele].includes(x.nome)) && m49.some((x) => x.nome === "Perrin" && x.aqui), J(m49.filter((x) => x.tipo === "pessoa").map((x) => [x.nome, x.aqui])));
  t("o grupo nunca está longe (a Saoirse com o nome numa linha LONGE velha continua comigo)", EC.montarEmCena({ semente: "s", grupo: [{ nome: "Saoirse" }], longe: ["Saoirse"] }).some((x) => x.nome === "Saoirse" && x.comigo));

  /* a memória não muda de sítio */
  const rossio = EC.montarEmCena({ semente: "s10", turno: 20, cidade: "Nova Profundo", mostrado: ["Uma mulher de manto separa moedas num pano."], lugar: { nome: "O Rossio Torto" } });
  const mulher = rossio.find((x) => x.deOnde === "prosa");
  t("o que a prosa mostrou guarda o sítio onde foi visto", !!mulher && typeof mulher.onde === "string" && mulher.onde.includes("nova profundo"), J(mulher));
  const volta = EC.montarEmCena({ semente: "s10", turno: 21, cidade: "Monte Rasa", mostrado: ["A estrada acaba no portão."], lugar: { nome: "Campos do Corvo" }, antes: rossio });
  t("M23: a mulher da banca do Rossio não volta com o herói a Monte Rasa", !volta.some((x) => x.nome === mulher.nome), J(volta.map((x) => x.nome)));
  const fica = EC.montarEmCena({ semente: "s10", turno: 21, cidade: "Nova Profundo", mostrado: ["A chuva engrossa."], lugar: { nome: "O Rossio Torto" }, antes: rossio });
  t("…e no mesmo sítio a memória continua a trazê-la (a regra de 6 turnos de antes)", fica.some((x) => x.nome === mulher.nome), J(fica.map((x) => x.nome)));
  t("…e a memória de quem foi para LONGE não o ressuscita", !EC.montarEmCena({ semente: "s10", turno: 21, cidade: "Nova Profundo", lugar: { nome: "O Rossio Torto" }, longe: [mulher.nome], antes: rossio }).some((x) => x.nome === mulher.nome));

  /* menção não é presença */
  const godfrey = [{ nome: "Godfrey da Foz", papel: "taverneiro da Cabra Trêmula" }];
  const so = (falas) => EC.montarEmCena({ semente: "s10", cidade: "Monte Rasa", presentes: godfrey, mostrado: falas, lugar: { nome: "Campos do Corvo" } }).find((x) => x.nome === "Godfrey da Foz") || {};
  t("M3: o gancho («A única pista com cara e nome: Godfrey da Foz, taverneiro da Cabra Trêmula») não o põe à frente", so([R.respostas[0]]).aqui === false, J(so([R.respostas[0]])));
  t("M3: a fala do guarda («— Mas o Godfrey serve mais rápido…») também não", so([R.respostas[1]]).aqui === false);
  t("«guardado por Godfrey» (complemento) também não", so(["O mapa diz que o portão é guardado por Godfrey da Foz e ninguém passa."]).aqui === false);
  t("«Godfrey ergue a caneca» põe", so(["Godfrey ergue a caneca e olha para você."]).aqui === true);
  t("«Godfrey da Foz cruza os braços» (sujeito, verbo fora da lista) põe", so(["Godfrey da Foz cruza os braços atrás do balcão."]).aqui === true);
  t("…e continua na lista mesmo sem estar à vista (a frase pode procurá-lo)", so([R.respostas[0]]).nome === "Godfrey da Foz");

  /* o arquivista e o ferreiro tiefling (M37, M66) */
  const arq = EC.apresentadosNaProsa([R.respostas[36]], []);
  t("M37: «Um arquivista de óculos tortos» ganha a ficha", arq.some((x) => x.cabeca === "arquivista"), J(arq));
  const tief = EC.apresentadosNaProsa([R.respostas[65]], []);
  t("M66: «Um tiefling de avental riscado» ganha a ficha", tief.some((x) => x.cabeca === "tiefling"), J(tief));

  /* lixo, determinismo e imutabilidade */
  t("lixo no `longe` não estoura", () => [null, {}, [null, 3, {}], "x"].every((l) => Array.isArray(EC.montarEmCena({ semente: "s", longe: l, grupo: [{ nome: "Saoirse" }] }))));
  const c0 = ctxDa(48, null, false);
  const copia = J(c0);
  const a1 = J(EC.montarEmCena(c0)), a2 = J(EC.montarEmCena(c0));
  t("determinismo: a mesma pauta dá a mesma lista", a1 === a2);
  t("imutabilidade: o contexto recebido sai intacto", J(c0) === copia);
}

/* ============================================================ */
sec("3. PROCURAR FORA DE CENA CHEGA À PESSOA");
{
  const nomes = Object.values(R.npcs).map((n) => n.nome);
  const M22 = "Respondo que vim por uma carta sem assinatura e que procuro meu antigo companheiro de armas, um soldado que serviu comigo na guerra. Pergunto a Torvald se alguém assim vive por aqui.";
  const M26 = "Procuro Nyla Punho-de-Pedra";
  const M38 = "Digo ao arquivista que serví na guerra e que tenho direito aos papéis da minha companhia. Enquanto ele hesita, examino as estantes e os registros, procurando com cuidado qualquer papel escondido ou fora do lugar.";
  const M64 = "Respondo que quero cobrar o que a companhia perdeu. Pergunto se ela viu por aqui a terceira da minha companhia, a camarada que servia comigo na guerra, e onde posso encontrá-la.";
  const M7 = "Pergunto a Godfrey onde fica Nova Profundo, quanto tempo leva até lá a pé e quem é essa Nyla Punho-de-Pedra.";
  t("o elo do soldado diz-se com as palavras do antecedente («antigo companheiro», «serviu comigo»)", NU.PROCURA_DO_ELO.soldado.some((a) => a.join(" ") === "antig companheir") && NU.PROCURA_DO_ELO.soldado.some((a) => a.join(" ") === "serv comigo"));
  t("M22: «procuro meu antigo companheiro de armas…» é a Helga (o elo)", (P.papelProcurado(M22, nucleo) || {}).nome === "Helga", J(P.papelProcurado(M22, nucleo)));
  t("M64: «a terceira da minha companhia… onde posso encontrá-la» é a Helga", (P.papelProcurado(M64, nucleo) || {}).nome === "Helga");
  t("M38: os papéis da companhia procurados entre as estantes NÃO são a Helga", P.papelProcurado(M38, nucleo) === null, J(P.papelProcurado(M38, nucleo)));
  t("«procuro o que a minha companhia guardou na guerra» procura uma coisa", P.papelProcurado("Procuro o que a minha companhia guardou na guerra.", nucleo) === null);
  t("a frase que nomeia a companheira fala dela, não do elo", P.papelProcurado("Procuro com a Saoirse, a minha antiga companheira de armas, um sítio para dormir.", nucleo) === null);
  t("a tabela da frase e a da coisa existem", P.PROCURA_PELO_PAPEL_NA_FRASE.corte instanceof RegExp && P.PROCURA_PELO_PAPEL_NA_FRASE.coisa instanceof RegExp);

  t("quem ouve a pergunta perde para quem se procura («pergunto ao Godfrey onde encontro a Nyla»)", P.nomeProcurado("Pergunto ao Godfrey da Foz onde encontro a Nyla Punho-de-Pedra", nomes) === "Nyla Punho-de-Pedra", P.nomeProcurado("Pergunto ao Godfrey da Foz onde encontro a Nyla Punho-de-Pedra", nomes));
  t("…mas sozinho continua a ser ele («Pergunto à Rosalina: …», MM14 J7)", P.nomeProcurado("Pergunto à Rosalina: há quanto tempo a senhora tem o Sino Calado?", ["Rosalina", "Floripes do Sino"]) === "Rosalina");
  t("o placar tem a chave de quem ouve, antes do verbo", P.PLACAR_DA_PROCURA[0] === "naoOuve" && P.PLACAR_DA_PROCURA.indexOf("naoOuve") < P.PLACAR_DA_PROCURA.indexOf("aposVerbo"));

  const sinal = (f) => P.procuraDeGente(f, { nucleo, nomes });
  t("M26: «Procuro Nyla Punho-de-Pedra» (o verbo do Códice) é procura de gente", sinal(M26) === true);
  t("M22 e M64 também", sinal(M22) === true && sinal(M64) === true);
  t("M7: «Pergunto a Godfrey… quem é essa Nyla» é conversa, não procura", sinal(M7) === false);
  t("M38: vasculhar as estantes não é procura de gente", sinal(M38) === false);
  t("«procuro por sinais de passagem» não nomeia ninguém", sinal("Procuro por sinais de passagem na lama.") === false);
  t("lixo não estoura e não procura", [null, "", 3, {}].every((x) => P.procuraDeGente(x, null) === false));
  t("o verbo que busca é tabela", P.PROCURA_DE_GENTE.busca instanceof RegExp);

  t("a porta: com o sinal, o turno passa pela porta da procura (a do desafio, antes do catálogo)", TU.decidirTurno({ texto: M26, ehProcuraDeGente: true }).id === "desafio");
  t("…sem ele, é cena como era", TU.decidirTurno({ texto: M26 }).id === "cena");
  t("…e o sinal é um dos sinais garantidos", TU.garantirSinais({ ehProcuraDeGente: 1 }).ehProcuraDeGente === true && TU.garantirSinais(null).ehProcuraDeGente === false);

  /* a resposta inteira, para M64: a Helga está em Monte Rasa (LONGE), e diz-se */
  const r64 = P.procurarPessoa("Helga", { porPapel: P.papelProcurado(M64, nucleo), npcs: R.npcs, grupo: [{ nome: "Saoirse" }], cidadeAtual: "Nova clara", presentes: [] });
  t("M64: a procura responde onde ela está (Monte Rasa), pelo papel — e não um avistamento inventado", r64 && r64.desfecho === "noutro_lugar" && /Monte Rasa/.test(r64.onde) && !!r64.porPapel, J(r64));
}

/* ============================================================ */
sec("4. O REGISTO DE GENTE");
{
  const heroi = R.heroi;
  t("a heroína da sessão é a Hilda Barbaforte", heroi === "Hilda Barbaforte");
  t("«Sargenta Barbaforte» é a heroína pelo posto antigo, e não entra no registo", NP.nomeComDono("Sargenta Barbaforte", {}, { heroi }).decisao === "recusada" && NP.nomeComDono("Sargenta Barbaforte", {}, { heroi }).motivo === "heroi");
  t("…nem «Sargenta Hilda»", NP.nomeComDono("Sargenta Hilda", {}, { heroi }).motivo === "heroi");
  t("…mas um capitão com outro nome é gente («Capitão Rennick»)", NP.nomeComDono("Capitão Rennick", {}, { heroi }).decisao === "nova");
  t("…e sem herói no contexto nada muda", NP.nomeComDono("Sargenta Barbaforte", {}, {}).decisao === "nova");
  t("os postos são tabela", NP.POSTO_E_OFICIO.titulos.includes("sargenta") && NP.POSTO_E_OFICIO.minimoDaCasa === 3);

  const perrin = { Perrin: { nome: "Perrin", papel: "taverneiro(a)", local: "Nova Profundo", relacao: "desconhecido" } };
  const tav = NP.nomeComDono("Taverneiro da Fivela & o Trigo", perrin, { heroi, papel: "taverneiro", local: "Fivela & o Trigo, Nova Profundo", aqui: ["Nova Profundo", "Fivela & o Trigo"] });
  t("«Taverneiro da Fivela & o Trigo» é o Perrin (uma ficha, uma pessoa)", tav.decisao === "mesma" && tav.chave === "Perrin", J(tav));
  t("…e sem taverneiro registado fica sem ficha até ter nome", NP.nomeComDono("Taverneiro da Fivela & o Trigo", {}, { heroi, papel: "taverneiro", aqui: ["Nova Profundo"] }).decisao === "recusada");
  t("o ofício com a casa é descrição; o nome com sobrenome de família não", NP.ehOficioDaCasa("Taverneiro da Fivela & o Trigo") && !NP.ehOficioDaCasa("Orin Punho-de-Pedra") && !NP.ehOficioDaCasa("Nyla Punho-de-Pedra") && !NP.ehOficioDaCasa(null) && !NP.ehOficioDaCasa("Ferreiro"));
  t("o nome que já está no registo assim continua a ser ele (o save antigo não perde a ficha)", NP.nomeComDono("Taverneiro da Fivela & o Trigo", { "Taverneiro da Fivela & o Trigo": { nome: "Taverneiro da Fivela & o Trigo", papel: "taverneiro" } }, { heroi }).decisao === "mesma");
}

console.log(`\ncena do lugar (10.ª sessão): ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
