/* teste-sessao-9-bolsa.mjs — o golpe e o dinheiro da 9.ª sessão de prova (12/10)

   `mente/mm11-sessao-9.md` ("O dinheiro", "Os defeitos" 1–3, "Os 3
   consertos"), cada conserto preso ao que a sessão deu de verdade — a
   prosa do Mestre (M32, M44), as frases do jogador (M17, M33, M43, M44) e o
   estoque do ambulante que o save tinha. Falha na árvore de antes (v9.432)
   e passa na de depois:

     1. o rato: "ataco o rato gigante da frente" depois de "dois ratos
        gigantes farejam" saiu SEM ALVO — a cabeça comparava "rato" com
        "ratos" letra a letra, e o "'Rato de esgoto…'" da fala da Sari fazia
        de todo "rato" um nome (agressao.js);
     2. a frase que paga: "conto sessenta … e pago" e "pago as cinco moedas
        que ele pediu" davam 0; a palavra que não é a moeda do mundo
        continua a não pagar (cobranca.js);
     3. a compra à banca de graça: a narração da compra creditava as
        Ataduras como achado, e a frase que compra da banca não fechava
        nada (cobranca.js, bolsa-da-frase.js);
     4. o preço da banca que o sistema tinha e não mandava, e a unidade
        ("marcos") que o Mestre inventou (mercado.js, economia.js). */
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const S = "../src/";
const J = JSON.stringify;

const A = await import(S + "agressao.js");
const C = await import(S + "cobranca.js");
const B = await import(S + "bolsa-da-frase.js");
const M = await import(S + "mercado.js");
const E = await import(S + "economia.js");
/* o que esta etapa trouxe, lido com rede: na árvore de antes falta, e a
   suíte tem de FALHAR asserção a asserção — não estourar na primeira */
const compraNaBanca = B.compraNaBanca || (() => null);
const nomeDaMoeda = C.nomeDaMoeda || (() => "");
const nomeiaACoisa = E.nomeiaACoisa || (() => false);

/* ---------------- o que a sessão deu ---------------- */
/* M32, a prosa do Mestre (o registo, resposta 32) */
const M32 = "Você e Sari seguem pela estrada do leste, com o céu nublado esmagando a luz cinzenta sobre a floresta. O caminho é de terra batida, com raízes retorcidas e o marrom das folhas caídas. À frente, dois ratos gigantes farejam entre os tocos, o pelo sujo de lama e fumaça. Eles erguem as cabeças ao mesmo tempo, olham para vocês, e desviam para a margem do caminho, rosnando baixo. Sari segura o cajado com as duas mãos. 'Rato de esgoto não foge por educação', diz ela, baixo. 'Ou tem dono, ou tá atrás de comida. E a comida aqui é nós.' Um dos ratos range os dentes.";
const M33 = "Ataco o rato gigante da frente com a minha faca.";
const GENTE = ["Sari", "Tomas", "Brina Pedra", "Dara", "Halden Caldeira"].map((nome) => ({ nome }));
/* M17 e M44, a frase do jogador e a prosa que veio */
const M17 = "Conto sessenta escamas na mão de Brina e pago.";
const M17_PROSA = "Você conta sessenta moedas, uma a uma, e as deixa na palma estendida de Brina Pedra. 'Então vá, criança. Vá atrás daquilo que já não te pertence.'";
const M44 = "Compro as ataduras de linho e pago as cinco moedas que ele pediu.";
const M44_PROSA = "Você pega as ataduras de linho e entrega as cinco moedas. O mercador as confere na palma, uma a uma, e as guarda sem comentar o preço.";
const M43 = "Pergunto quanto custa o anel com nome gravado por dentro, e também as ataduras de linho. Quero ver o nome dentro do anel.";
const M42 = "Paro diante do mercador ambulante e olho os frascos. Quanto custa um frasco de cura? Compro um.";
/* o ambulante do save (o painel de Mercado), com os preços do estoque */
const AMBULANTE = { id: "ambulante|7|412", nome: "Feira de Pedrabaixa (ambulante)", tipo: "ambulante", estoque: [
  { nome: "Frasco com terra vermelha", tipo: "curiosidade", preco: 31 },
  { nome: "Anel com nome gravado por dentro", tipo: "curiosidade", preco: 100 },
  { nome: "Elixir de Destreza", tipo: "consumivel", preco: 140 },
  { nome: "Ataduras de Linho", tipo: "consumivel", preco: 29 },
] };
const debito = (pedido, moeda = "", prosa = "x", envelopes = "") => C.oQueFaltaDebitar(prosa, {}, { pedido, moeda, bolsa: 104, envelopes }).moedas;

/* ============================================================ */
sec("1. o rato e os ratos (M32–M33)");
{
  const r = A.criaturaMostrada(M33, [M32], [], GENTE);
  t("M33: o rato gigante da frente é um dos ratos que o Mestre mostrou", !!r && r.criatura === true, J(r));
  t("…e o nome é de UM, no singular", !!r && r.nome === "Rato", J(r));
  const k = A.criaturaMostrada(M33, [M32], [{ nome: "Rato Gigante", ameaca: "comum" }], GENTE);
  t("com a criatura da estrada conhecida, o nome e a ameaça são os dela", !!k && k.nome === "Rato Gigante" && k.ameaca === "comum", J(k));
  const a = A.lerAgressao(M33, { presentes: GENTE, grupo: [{ nome: "Sari" }], mostrado: [M32], conhecidas: [{ nome: "Rato Gigante", ameaca: "comum" }] });
  t("M33 abre a luta (já não é «sem alvo no registro»)", !!a && a.tipo === "agressao" && a.nome === "Rato Gigante", J(a));
  t("«um dos ratos» abre UM, com o nome do bestiário", (A.criaturaMostrada("Ataco um dos ratos com a faca.", [M32], [{ nome: "Rato Gigante", ameaca: "comum" }], GENTE) || {}).nome === "Rato Gigante");
  t("o plural do jogador contra o singular da prosa também casa", (A.criaturaMostrada("ataco os ratos", ["Um rato gigante fareja entre os tocos."]) || {}).nome === "Rato");
  t("o plural do jogador vira o singular com acento da tabela", (A.criaturaMostrada("ataco um dos cães", ["Dois cães rosnam."]) || {}).nome === "Cão");
  t("o género casa: a loba da frase é o lobo da prosa", (A.criaturaMostrada("ataco a loba", ["O lobo cinzento rosna."]) || {}).criatura === true);
  t("a tabela: o plural e o macho, com o porquê", !!A.NUMERO_DO_BICHO && A.NUMERO_DO_BICHO.singular.ratos === "rato" && A.NUMERO_DO_BICHO.macho.loba === "lobo" && !!A.NUMERO_DO_BICHO.porque);
  t("todo plural da tabela é cabeça de bicho", !!A.NUMERO_DO_BICHO && Object.keys(A.NUMERO_DO_BICHO.singular).every((p) => A.CRIATURA_NA_PROSA.cabecas.includes(p)));
  /* a régua da 8.ª continua: o nome de gente não vira bicho pela raiz */
  t("«Ursa» de nome continua gente (a raiz não a faz ursa)", A.criaturaMostrada("ataco a ursa", ["Ursa, ao seu lado, mantém o pão apertado contra o peito."]) === null);
  t("e a ursa com artigo continua bicho", (A.criaturaMostrada("ataco a ursa", ["Uma ursa enorme sai da toca e ruge."]) || {}).criatura === true);
  t("lixo devolve null", A.criaturaMostrada(null, null) === null && A.criaturaMostrada("ataco o rato", [null, {}]) === null);
}

/* ============================================================ */
sec("2. a frase que paga, nas formas naturais (M17, M44)");
{
  t("M44: «pago as cinco moedas que ele pediu» debita 5", debito("Pago as cinco moedas que ele pediu.") === 5);
  t("M44 inteira: «compro … e pago as cinco moedas que ele pediu» debita 5", debito(M44) === 5);
  t("«conto sessenta moedas na mão de Brina e pago» debita 60", debito("Conto sessenta moedas na mão de Brina e pago.") === 60);
  t("«separo dez moedas e as entrego ao guarda» debita 10", debito("Separo dez moedas e as entrego ao guarda.") === 10);
  t("M17 tal como foi: «escamas» não é a moeda deste mundo — a frase não paga", debito(M17) === 0);
  t("…num mundo de escamas paga 60", debito(M17, "Escamas") === 60);
  t("…e a moeda comum paga em qualquer mundo («cobres»)", debito("Conto oito cobres e pago.") === 8);
  t("M17: a prosa do Mestre («você conta sessenta moedas … e as deixa na palma») debita 60", C.oQueFaltaDebitar(M17_PROSA, {}, { bolsa: 104 }).moedas === 60);
  t("contar sem dar não paga («conta as doze moedas do morto»)", C.lerGastos("Você conta doze moedas no bolso do morto.").moedas === 0);
  t("o mesmo dinheiro não conta duas vezes («conto cinco moedas e pago cinco moedas»)", debito("Conto cinco moedas e pago cinco moedas.") === 5);
  t("a relativa com negação não paga («pago as cinco que ele não pediu»: a trava fica)", debito("Pago as cinco moedas que ele não pediu.") === 0);
  t("a pergunta e a oferta continuam a não pagar", debito("Pago as cinco moedas que ele pediu?") === 0 && debito("Ofereço cinco moedas.") === 0);
  t("as tabelas: preparar-e-pagar e a relativa do preço", !!C.PREPARAR_E_PAGAR && C.PREPARAR_E_PAGAR.preparar.includes("conto") && C.PREPARAR_E_PAGAR.pagar.includes("pago") && !!C.RELATIVA_DO_PRECO && C.RELATIVA_DO_PRECO.verbos.includes("pediu"));
  t("as frases que já pagavam continuam (5 de 7 da sessão)", debito("Pago as duas moedas e pego o pão.") === 2 && debito("Pago duas moedas pelo peixe seco.") === 2 && debito("Pago a taxa das duas moedas.") === 2 && debito("Deixo duas moedas sobre a cama dela.") === 2);
}

/* ============================================================ */
sec("3. a compra à banca não sai de graça (M44)");
{
  const cred = C.oQueFaltaCreditar(M44_PROSA, {}, { moeda: "moedas" });
  t("M44: a prosa da compra já não credita as Ataduras de graça", !cred.consumiveis.some((c) => c.id === "ataduras"), J(cred.consumiveis.map((c) => c.nome)));
  t("o achado continua a creditar o item («você encontra ataduras de linho na mochila do morto»)", C.oQueFaltaCreditar("Você encontra ataduras de linho na mochila do morto.", {}, {}).consumiveis.some((c) => c.id === "ataduras"));
  t("a tabela da compra que não é achado", C.COMPRA_NAO_E_ACHADO instanceof RegExp && C.COMPRA_NAO_E_ACHADO.test("voce compra a pocao"));

  const c = compraNaBanca(M44, { bancas: [AMBULANTE], bolsa: 93 });
  t("M44: a frase compra as Ataduras DA BANCA, pelo preço do estoque (◉ 29)", !!c && c.itens.length === 1 && c.itens[0].nome === "Ataduras de Linho" && c.total === 29 && c.itens[0].mercadorId === AMBULANTE.id, J(c));
  t("…e cinco não paga vinte e nove: não fecha, o vendedor diz o preço e espera", !!c && !c.fecha && c.porque === "pouco" && c.declarado === 5);
  t("…a linha do jogador diz o preço da banca", B.falaDaCompra(c) === "◉ Ataduras de Linho custa ◉ 29 na banca — ◉ 5 não paga.", B.falaDaCompra(c));
  const veto = B.vetoDaCompra(c);
  t("…o veto do turno diz que a compra não fechou", veto.length === 1 && veto[0].includes("a compra não fechou"), J(veto));
  t("…e o «pago as cinco» dessa frase não sai da bolsa", debito(M44, "moedas", M44_PROSA, `NÃO PODE  ${veto[0]}`) === 0);
  t("a tabela da compra recusada", Array.isArray(C.COMPRA_RECUSADA_PELO_SISTEMA) && C.COMPRA_RECUSADA_PELO_SISTEMA.some((rx) => rx.test(veto[0] || "")));

  const k = compraNaBanca("Compro as ataduras de linho.", { bancas: [AMBULANTE], bolsa: 93 });
  t("«compro as ataduras» fecha: ◉ 29, restam ◉ 64", !!k && k.fecha && k.total === 29 && B.falaDaCompra(k) === "🛒 Ataduras de Linho — ◉ 29 (restam ◉ 64).", B.falaDaCompra(k));
  t("«pago vinte e nove moedas» é 29, não 20", (compraNaBanca("Compro as ataduras de linho e pago vinte e nove moedas.", { bancas: [AMBULANTE], bolsa: 93 }) || {}).fecha === true);
  const env = B.envelopeDaCompra(k);
  t("o envelope da compra é o da banca, com a marca que a cobrança conhece", env.includes("ao preço da banca") && C.JA_PAGO_PELO_SISTEMA[0].test(env), env);
  t("a narração da entrega não dá outro item, nem cobra outra vez", C.oQueFaltaCreditar("Você recebe as ataduras de linho das mãos do mercador.", {}, { envelopes: env }).temAlgo === false && debito(M44, "", M44_PROSA, env) === 0);
  t("a bolsa que não chega não fecha", (compraNaBanca("Compro o elixir.", { bancas: [AMBULANTE], bolsa: 93 }) || {}).porque === "sem_fundos");
  t("perguntar o preço não compra («quanto custa o elixir? compro.»)", compraNaBanca("Quanto custa o elixir? Compro.", { bancas: [AMBULANTE], bolsa: 999 }) === null);
  t("a hipótese não compra", compraNaBanca("Se ele baixar, compro as ataduras.", { bancas: [AMBULANTE], bolsa: 999 }) === null);
  t("sem bancas, ou com lixo, null", compraNaBanca(M44, null) === null && compraNaBanca(null, { bancas: [AMBULANTE] }) === null && compraNaBanca(M44, { bancas: [null, {}] }) === null);
  t("o balcão, com as bancas na mão, deixa a banca fechar (sem o veto «vende-se nas bancas»)", B.compraNaFrase("Compro o elixir de destreza.", { balcao: [], bolsa: 999, bancas: [AMBULANTE] }) === null && (B.compraNaFrase("Compro uma adaga.", { balcao: [], bolsa: 99 }) || {}).porque === "so_banca");
  t("o balcão com opções nulas não estoura (`= {}` não cobre `null`)", () => B.compraNaFrase("Compro duas tochas.", null) === null);
  t("as palavras de cada lado são tabela", !!B.PALAVRAS_DA_COMPRA && !!B.PALAVRAS_DA_COMPRA.banca.onde && !!B.PALAVRAS_DA_COMPRA.balcao.onde);
}

/* ============================================================ */
sec("4. o preço da banca chega à pauta, na moeda do mundo (M42–M43)");
{
  const r43 = M.mercadoParaPauta([AMBULANTE], M43, { moeda: "moedas" });
  const l43 = r43.pergunta[0] || "";
  t("M43: o anel e as ataduras sobem com o preço do estoque", l43.includes("Anel com nome gravado por dentro ◉ 100 moedas") && l43.includes("Ataduras de Linho ◉ 29 moedas"), l43);
  t("M44: quem compra também ouve o preço", (M.mercadoParaPauta([AMBULANTE], M44, { moeda: "moedas" }).pergunta[0] || "").includes("Ataduras de Linho ◉ 29 moedas"));
  t("o elixir apontado leva o preço (◉ 140), e as opções nulas não estouram", () => (M.mercadoParaPauta([AMBULANTE], "Aponto para o elixir na carroça.", null).pergunta[0] || "").includes("Elixir de Destreza ◉ 140"));
  t("M42: o frasco perguntado leva o que a carroça tem", (M.mercadoParaPauta([AMBULANTE], M42, { moeda: "moedas" }).pergunta[0] || "").includes("Frasco com terra vermelha ◉ 31 moedas"));
  t("«pago a lâmina e pergunto a quantos passos fica o poço» continua sem preço", M.mercadoParaPauta([{ nome: "Armazém", estoque: [{ nome: "Lâmina de Névoa", tipo: "arma", preco: 22 }] }], "Pago a lâmina da feira e pergunto: a quantos passos fica o poço?").pergunta.length === 0);
  t("a moeda do mundo dá a unidade, no número certo", nomeDaMoeda(29, "moedas") === "moedas" && nomeDaMoeda(1, "moedas") === "moeda" && nomeDaMoeda(3, "Escamas de Cobre") === "escamas" && nomeDaMoeda(1, null) === "");
  t("o preço comum também a leva («refeição quente ◉ 2 escamas»)", (M.precoComumParaPauta("Quanto custa uma refeição quente?", { fator: 1, moeda: "Escamas" }).pergunta[0] || "").includes("◉ 2 escamas"));
  t("sem a palavra, a linha é a de antes (só o ◉)", (M.precoComumParaPauta("Quanto custa uma refeição quente?", { fator: 1 }).pergunta[0] || "").endsWith("◉ 2"));
  t("o balcão também: «dá ◉ N moedas»", /dá ◉ \d+ moedas$/.test(B.balcaoParaPauta("Quanto custam duas tochas?", { balcao: M.balcaoDeMantimentos({ nome: "X", porte: "vila" }), moeda: "moedas" }).pergunta[0] || ""));
  t("a coisa nomeia-se pela cabeça do nome, no singular e no plural", nomeiaACoisa("compro a atadura", "Ataduras de Linho") && nomeiaACoisa("as ataduras", "Ataduras de Linho") && !nomeiaACoisa("quero ver o nome", "Anel com nome gravado por dentro"));
  t("a tabela do nome da coisa", !!E.NOME_DA_COISA && E.NOME_DA_COISA.conectores.includes("com") && J(E.cabecaDaCoisa ? E.cabecaDaCoisa("Anel com nome gravado por dentro") : null) === J(["anel"]));
  t("o gesto que aponta ou compra é tabela", M.APONTA_OU_COMPRA instanceof RegExp && M.APONTA_OU_COMPRA.test("aponto para o elixir") && !M.APONTA_OU_COMPRA.test("pago a lamina"));
  t("o mercado com lixo e opções nulas não estoura", () => { M.mercadoParaPauta(null, null, null); M.mercadoParaPauta([null, {}], "compro o anel", null); return true; });
  t("determinístico", J(M.mercadoParaPauta([AMBULANTE], M43, { moeda: "moedas" })) === J(M.mercadoParaPauta([AMBULANTE], M43, { moeda: "moedas" })));
}

/* a fiação (frontend, v9.435): sem ela a frase do M44 tira as moedas pela
   narração e as Ataduras não chegam — o motor só vale com o App a chamá-lo */
{
  sec("[a fiação no App]");
  const fs = await import("node:fs");
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const corpoDe = (de, ate) => { const i = app.indexOf(de); return i < 0 ? "" : app.slice(i, app.indexOf(ate, i + de.length)); };
  const bolsa = corpoDe("const registarABolsaDaFrase = (acao) => {", "const comprarSuprimento = ");
  t("fiação · o App importa compraNaBanca", /import \{[^}]*\bcompraNaBanca\b[^}]*\} from "\.\/bolsa-da-frase\.js"/.test(app));
  t("fiação · a frase compra à banca pelas bancas da cena, num calou próprio",
    /* MOVIDA na F2b (12/10, oficial): as bancas da cena passam por
       bancasDoToque antes da compra — com uma coisa tocada, só a entrada do
       estoque que a ficha mostrou fecha; sem toque, voltam como vieram. A
       intenção fica: a frase compra pelas bancas da cena, num calou próprio. */
    bolsa.includes("const c = compraNaBanca(txt, { bancas: bancasDaCompra, bolsa: p.moedas || 0 });") && bolsa.includes("const bancas = bancasDaCena();")
    && bolsa.includes("bancasDaCompra = bancasDoToque(alvoDaCompra, ae.lista, bancas);")
    && bolsa.includes('calou("a compra à banca da frase"'));
  t("fiação · fecha → moedas, mochila/corpo, comprados, pressões e o envelope; não fecha → o veto; e o recibo nos dois",
    bolsa.includes("moedas: (p.moedas || 0) - c.total") && bolsa.includes("VAI_AO_CORPO.includes(it.tipo)")
    && bolsa.includes("comprados: { ...(merc.comprados || {}), [x.mercadorId]:") && bolsa.includes("apertarProcura(merc.pressoes")
    && bolsa.includes("nota(envelopeDaCompra(c));") && bolsa.includes("} else vetar(vetoDaCompra(c));")
    && bolsa.includes('pushMsgs([{ autor: "sistema", texto: falaDaCompra(c) }]);'));
  t("fiação · o balcão sabe das bancas (não veta «isso vende-se nas bancas» o que a banca vende)",
    bolsa.includes("bancas: bancasDaCena() });"));
  const cena = corpoDe("const bancasDaCena = () => {", "};");
  t("fiação · as bancas da cena: nenhuma na masmorra aberta, só a carroça na estrada",
    cena.includes("masmorraRef.current && !masmorraRef.current.encerrada") && cena.includes('m.tipo === "ambulante"'));
  t("fiação · a criatura à vista vai a lerAgressao em `conhecidas`, só no mesmo trecho",
    /lerAgressao\(acao, \{[^}]*\bconhecidas \}\)/.test(app) && app.includes("criaturaAVistaRef.current = (inv && (!inv.investe || fugiuDela) && jv)"));
  t("fiação · a moeda do mundo vai ao balcão e ao preço comum",
    app.includes("temKit: garantirSuprimentos(p0.suprimentos).kit, moeda: moedaDoMundo() });") && app.includes("precoComumParaPauta(frase, { fator: fatorDoPouso(), moeda: moedaDoMundo() })"));
  t("fiação · o veto viaja na pauta (naoPode) e a pauta vai aos envelopes que a cobrança lê",
    app.includes('p = porNaPauta(p, "naoPode", naoPodeDoTurnoRef.current || []);') && app.includes("const nota = [pauta, ...doTurno]")
    && app.includes('envelopes: conteudo + "\\n" + nota'));
}

console.log(`\nsessão 9 (o golpe e o dinheiro): ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
