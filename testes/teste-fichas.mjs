/* teste-fichas.mjs — F2b · F2c · F2d: as fichas, o cartão e a memória com rosto
   (Fase F2, aprovada pela pessoa em 12/10: "Pode construir as duas.")

   A F2a deu ao sistema a lista do que está em cena; esta suíte prova a mão
   do jogador a chegar a ela, com os casos que as sessões deram:

     1. a ficha e o cartão (`fichaParaTela`): as Ataduras de Linho a ◉ 29
        com a bolsa a 93 e a 20 (o preço é o do ESTOQUE, o impedido diz
        quanto falta); os ratos gigantes hostis (a frase do toque, o preço da
        luta contra os três); Oren Trançado com o segredo meio descoberto (a
        pista diz que há, nunca o quê); o guarda cujo golpe é crime (o mesmo
        veredito de crime.js); quem anda com o herói;
     2. as quatro do pé (`fichasDaCena`): a ordem da prosa, o teto;
     3. o id no envio (`quemNoEnvio`, `bancasDoToque`): o toque ganha
        enquanto a frase nomeia; apagado o nome, a leitura livre; a compra
        tocada fecha pela entrada do estoque que a ficha mostrou;
     4. F2d: a memória (`lembrarFicha`, `lembrarCompra`,
        `garantirMemoriaDoSave`), a página do Códice com a forma da ficha, e
        "procuro Oren" fora de cena (`procuraNaMemoria` → procurarPessoa);
     5. o sistema não fala de si: nenhum id, "ficha", "segredo",
        "desconhecido", tu/teu, em texto que vai à tela — em mundos gerados;
     6. determinismo, imutabilidade, lixo, tetos. Falha na árvore de antes
        (v9.438): o módulo não existe. */
import fs from "node:fs";
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const S = "../src/";
const J = JSON.stringify;

/* o que esta etapa trouxe, lido com rede: na árvore de antes falta, e a
   suíte tem de FALHAR asserção a asserção — não estourar na primeira */
let FI = {};
try { FI = await import(S + "fichas.js"); } catch (e) { console.log("  (fichas.js não carrega: " + e.message + ")"); }
const nada = () => null;
const fichaParaTela = FI.fichaParaTela || nada;
const fichasDaCena = FI.fichasDaCena || (() => []);
const quemNoEnvio = FI.quemNoEnvio || (() => []);
const bancasDoToque = FI.bancasDoToque || ((a, l, b) => b);
const garantirMemoriaDoSave = FI.garantirMemoriaDoSave || (() => ({ paginas: {} }));
const lembrarFicha = FI.lembrarFicha || ((m) => m);
const lembrarCompra = FI.lembrarCompra || ((m) => m);
const paginaDoCodice = FI.paginaDoCodice || nada;
const paginasDoCodice = FI.paginasDoCodice || (() => []);
const procuraNaMemoria = FI.procuraNaMemoria || nada;
const { montarEmCena, quemNaFrase } = await import(S + "em-cena.js");
const { veredictoDoCrime } = await import(S + "crime.js");
const { compraNaBanca } = await import(S + "bolsa-da-frase.js");
const { procurarPessoa, linhaDaProcura, envelopeDaProcura } = await import(S + "procura.js");
const NU = await import(S + "nucleo.js");
const { moldePorId } = await import(S + "moldes.js");

/* ---------------- o que as sessões deram ---------------- */
const R9 = JSON.parse(fs.readFileSync("./registo-s9-historia.json", "utf8"));
const R8 = JSON.parse(fs.readFileSync("./registo-s8-pauta.json", "utf8"));
const C9 = R9.campanha;
const semente9 = `${C9.nomeCampanha}|${C9.genero}`;
const nucleo9 = NU.nucleoDaCampanha(semente9, R9.mapa, { genero: C9.genero, molde: moldePorId(C9.molde), lex: C9.lexico, espinha: R9.espinha, guildas: R9.guildas, base: R9.baseMundo, estado: R9.elencoMem, npcs: R9.npcs, grupo: R9.personagem.grupo, antecedente: R9.personagem.antecedente, reviravolta: null });
const OREN = nucleo9.pessoas.find((p) => p.papel === "elo");
/* o ambulante do save da 9.ª (o painel de Mercado), com os preços do estoque */
const AMB = { id: "ambulante|7|412", nome: "Feira de Pedrabaixa (ambulante)", tipo: "ambulante", estoque: [
  { nome: "Frasco com terra vermelha", tipo: "curiosidade", preco: 31 },
  { nome: "Anel com nome gravado por dentro", tipo: "curiosidade", preco: 100 },
  { nome: "Elixir de Destreza", tipo: "consumivel", preco: 140 },
  { nome: "Ataduras de Linho", tipo: "consumivel", preco: 29 },
] };
/* 9.ª, M32: os ratos gigantes do trecho (aqui três, como no quadro C4) */
const M32 = "Você e Sari seguem pela estrada do leste, com o céu nublado esmagando a luz cinzenta sobre a floresta. À frente, três ratos gigantes farejam entre os tocos, o pelo sujo de lama e fumaça. Eles erguem as cabeças ao mesmo tempo, olham para vocês, e desviam para a margem do caminho, rosnando baixo. Sari segura o cajado com as duas mãos. Um dos ratos range os dentes.";
const grupo9 = R9.personagem.grupo;
const lista44 = montarEmCena({ semente: semente9, turno: 42, grupo: grupo9, bancas: [AMB], moeda: "marcos", frase: "Compro as ataduras de linho." });
const ATADURAS = lista44.find((x) => x.nome === "Ataduras de Linho");
const listaRatos = montarEmCena({ semente: semente9, turno: 31, grupo: grupo9, encontro: { criatura: "Rato Gigante", ameaca: "comum", quantos: 3 }, mostrado: [M32] });
const RATOS = listaRatos.find((x) => x.tipo === "criatura");
const pres9 = Object.values(R9.npcs).filter((n) => n.local === "Buraco Norte");
const GUARDA = { nome: "Tomé Cardo", papel: "guarda da porta", relacao: "neutro", genero: "homem", local: "Buraco Norte" };
const listaBN = montarEmCena({ semente: semente9, turno: 45, cidade: "Buraco Norte", presentes: [...pres9, GUARDA], grupo: grupo9, emCena: [OREN.nome, "Tomé Cardo"], nucleo: nucleo9, lugar: { nome: "Buraco Norte" } });
const OREN_I = listaBN.find((x) => x.nome === OREN.nome);
const GUARDA_I = listaBN.find((x) => x.nome === "Tomé Cardo");
/* o arco de Oren: pediu no dia 40, o herói aceitou, a 1.ª pista no dia 42 */
const CORACAO = { v: 1, arcos: { [OREN.nome]: { pedido: 40, resposta: "aceitou", pistas: [42], crise: null } } };
const ctxOren = { nucleo: nucleo9, coracao: CORACAO, dia: 45, vistos: { [OREN.nome]: [41, 43, 45] }, npcs: R9.npcs, grupo: grupo9 };
const npcsBN = { ...R9.npcs, "Tomé Cardo": GUARDA };
const crimeBN = {
  ctx: { npcs: npcsBN, presentes: [...pres9, GUARDA], grupo: grupo9, hostis: [], elenco: [] },
  mundo: { semente: semente9, mapa: R9.mapa, cidade: R9.mapa.cidades.find((c) => c.nome === "Buraco Norte"), genero: C9.genero, noite: false },
};

/* ============================================================ */
sec("1. A FICHA E O CARTÃO (fichaParaTela)");
{
  t("a lista da 9.ª tem as ataduras do estoque, os ratos, Oren e o guarda", !!ATADURAS && !!RATOS && !!OREN_I && !!GUARDA_I);
  const a93 = fichaParaTela(ATADURAS, { bolsa: 93 }) || {};
  const a20 = fichaParaTela(ATADURAS, { bolsa: 20 }) || {};
  const comprar = (f) => (f.verbos || []).find((v) => v.id === "comprar") || {};
  console.log(`      (as ataduras: "${a93.nome}" · "${a93.linha}" · toque "${a93.frase}" · comprar ${comprar(a93).preco} / com 20: ${comprar(a20).impedido})`);
  t("as ataduras: a ficha diz o nome e o preço do ESTOQUE na segunda linha", a93.nome === "Ataduras de Linho" && a93.linha === "◉ 29" && a93.tipo === "coisa" && a93.peca === "Coisa");
  t("…o toque escreve «Compro as ataduras de linho» (o artigo no plural feminino)", a93.frase === "Compro as ataduras de linho");
  t("…o verbo comprar leva o preço do estoque (◉ 29 = AMB) e, com 93 na bolsa, cabe", comprar(a93).preco === `◉ ${AMB.estoque[3].preco}` && comprar(a93).impedido === null && comprar(a93).tom === "gesto");
  t("…com 20 na bolsa não cabe, e o impedido diz quanto falta (◉ 9)", comprar(a20).impedido === "faltam ◉ 9" && comprar(a20).preco === "◉ 29");
  t("…a marca é a bolsa (coisa não tem retrato)", J(a93.retrato) === J({ semente: null, inimigo: false, marca: "bolsa" }));
  t("…o cartão sabe onde se vende, sem o «(ambulante)» do motor", J(a93.sabe) === J(["vende-se em Feira de Pedrabaixa"]));
  t("…pechinchar contrai («pelas ataduras de linho»)", ((a93.verbos || [])[1] || {}).frase === "Peço um preço melhor pelas ataduras de linho");
  t("…sem bolsa conhecida, nada se diz impedido", comprar(fichaParaTela(ATADURAS, {}) || {}).impedido === null);

  const r = fichaParaTela(RATOS, { grupo: grupo9 }) || {};
  console.log(`      (os ratos: "${r.nome}" · "${r.linha}" · toque "${r.frase}" · ${J((r.verbos || []).map((v) => v.verbo + ": " + v.preco))})`);
  t("os ratos: o nome no plural, «3 · hostis», a peça Criatura hostil, a pata com presa", r.nome === "Ratos Gigantes" && r.linha === "3 · hostis" && r.peca === "Criatura hostil" && (r.retrato || {}).marca === "pataHostil");
  t("…o toque escreve «Ataco o rato gigante da frente» (quadro B do Figma)", r.frase === "Ataco o rato gigante da frente");
  t("…o golpe é o primeiro verbo, com a luta inteira no preço: «abre a luta contra os três»", ((r.verbos || [])[0] || {}).id === "atacar" && r.verbos[0].preco === "abre a luta contra os três" && r.verbos[0].tom === "gesto");
  t("…evitar e observar falam do bando («dos ratos gigantes», «os ratos gigantes»)", /dos ratos gigantes$/.test((r.verbos[1] || {}).frase || "") && (r.verbos[2] || {}).frase === "Observo os ratos gigantes");
  t("…o cartão sabe que vêm para cima de você (e não diz «hostil» como campo)", (r.sabe || []).includes("vêm para cima de você") && !(r.sabe || []).some((s) => /hostil/i.test(s)));
  const dois = fichaParaTela({ ...RATOS, quantos: 2 }) || {};
  t("…dois ratos: «contra os dois»; um só: «abre a luta», sem «da frente»", ((dois.verbos || [])[0] || {}).preco === "abre a luta contra os dois" && (fichaParaTela({ ...RATOS, quantos: 1 }) || {}).frase === "Ataco o rato gigante" && (fichaParaTela({ ...RATOS, quantos: 1 }) || {}).linha === "hostil");
  const loba = fichaParaTela({ id: "cx", tipo: "criatura", nome: "Loba Cinzenta", raiz: "lobo", quantos: 2, hostil: true }) || {};
  t("…a loba: o feminino chega ao artigo e ao número («contra as duas», «a loba cinzenta da frente»)", ((loba.verbos || [])[0] || {}).preco === "abre a luta contra as duas" && loba.frase === "Ataco a loba cinzenta da frente" && loba.nome === "Lobas Cinzentas");
  const manso = fichaParaTela({ id: "cy", tipo: "criatura", nome: "Corvo", raiz: "corvo", quantos: 1, hostil: null }) || {};
  t("…o bicho que não vem: «Observo o corvo», observar à frente, a pata sem presa", manso.frase === "Observo o corvo" && ((manso.verbos || [])[0] || {}).id === "observar" && (manso.retrato || {}).marca === "pata" && manso.linha === "sozinho");

  const o = fichaParaTela(OREN_I, ctxOren) || {};
  console.log(`      (Oren: "${o.linha}" · sabe ${J(o.sabe)} · lembra ${J(o.lembra)} · pista "${o.pista}")`);
  t("Oren: pelo nome, sem artigo — «Falo com Oren Trançado»; a segunda linha é o papel", o.frase === `Falo com ${OREN.nome}` && o.linha === "mestre de recados da guilda");
  t("…o retrato sai da semente do registo (ou do nome)", (o.retrato || {}).semente === OREN.nome && (o.retrato || {}).marca === null);
  t("…sabe o passado e a pista que VIU (a 1.ª do núcleo), nunca a 2.ª", (o.sabe || []).some((s) => /do seu passado/.test(s)) && (o.sabe || []).includes("você reparou: " + OREN.ficha.esconde.pistas[0].o) && !(o.sabe || []).some((s) => s.includes(OREN.ficha.esconde.pistas[1].o)));
  t("…a pista diz que HÁ um segredo — «Há alguma coisa que ele não conta.»", o.pista === "Há alguma coisa que ele não conta.");
  const textoDeOren = J(o);
  t("…e o segredo nunca: nem o que esconde, nem o que revela, em campo nenhum", !textoDeOren.includes("vendeu") && !textoDeOren.includes("vendeu o herói") && !textoDeOren.includes(OREN.ficha.esconde.o.slice(0, 20)) && !textoDeOren.includes("sombra"));
  t("…lembra o último encontro antes de hoje (dia 43, não 45) e o pedido aceite", (o.lembra || [])[0] === "Viram-se pela última vez no dia 43" && (o.lembra || []).includes("Ele lhe pediu uma coisa, e você aceitou"));
  t("…sem pista vista, sem pista; com o segredo caído (crise), também sem", (fichaParaTela(OREN_I, { ...ctxOren, coracao: { arcos: { [OREN.nome]: { pistas: [] } } } }) || {}).pista === null && (fichaParaTela(OREN_I, { ...ctxOren, coracao: { arcos: { [OREN.nome]: { pistas: [42], crise: 44 } } } }) || {}).pista === null);
  t("…o pedido por responder e o recusado dizem-se pelo que são", ((fichaParaTela(OREN_I, { ...ctxOren, coracao: { arcos: { [OREN.nome]: { pedido: 40, resposta: "", pistas: [] } } } }) || {}).lembra || []).includes("Ele lhe pediu uma coisa, e você ainda não respondeu") && ((fichaParaTela(OREN_I, { ...ctxOren, coracao: { arcos: { [OREN.nome]: { pedido: 40, resposta: "recusou", pistas: [] } } } }) || {}).lembra || []).includes("Ele lhe pediu uma coisa, e você recusou"));
  const comLaco = fichaParaTela(OREN_I, { ...ctxOren, coracao: null, npcs: { [OREN.nome]: { nome: OREN.nome, conhecidoEm: 3, laco: { tipo: "divida", forca: 1, dia: 9 } } } }) || {};
  t("…a dívida do laço e o dia em que se conheceram vão para LEMBRA", (comLaco.lembra || []).includes("Um de vocês deve ao outro, e os dois sabem") && (comLaco.lembra || []).includes("Conheceram-se no dia 3"));

  const g = fichaParaTela(GUARDA_I, { crime: crimeBN, npcs: npcsBN, grupo: grupo9 }) || {};
  const golpe = (g.verbos || []).find((v) => v.id === "atacar") || {};
  const esperado = veredictoDoCrime({ tipo: "agressao", nome: "Tomé Cardo", papel: "guarda da porta", comigo: false }, crimeBN.ctx, crimeBN.mundo);
  console.log(`      (o guarda: atacar → "${golpe.preco}" · ${golpe.tom} · "${(golpe.veredito || "").slice(0, 90)}…")`);
  t("o guarda: o golpe é crime — «é crime aqui», tom semVolta", golpe.preco === "é crime aqui" && golpe.tom === "semVolta");
  t("…e o veredito é o MESMO de veredictoDoCrime (o do cartão de confirmação)", !!esperado && golpe.veredito === esperado);
  t("…o inimigo declarado não é crime: «abre a luta», gesto, sem veredito", (() => { const v = (fichaParaTela({ ...GUARDA_I, hostil: true }, { crime: crimeBN }).verbos || []).find((x) => x.id === "atacar"); return v.preco === "abre a luta" && v.tom === "gesto" && !v.veredito; })());
  t("…sem o contexto do crime, o preço cala (não mente «abre a luta» sobre quem não é inimigo)", ((fichaParaTela(GUARDA_I, {}).verbos || []).find((x) => x.id === "atacar") || {}).preco === "");

  const lista8 = montarEmCena({ semente: "s8", turno: 39, grupo: [{ nome: "Freya" }], comigo: ["Ursa o Andarilho"], mostrado: R8.alvo.mostrado });
  const ursa = fichaParaTela(lista8.find((x) => x.nome === "Ursa o Andarilho"), { grupo: [{ nome: "Freya" }], crime: { ctx: { npcs: {}, presentes: [], grupo: [{ nome: "Freya" }] }, mundo: {} } }) || {};
  const freya = fichaParaTela(lista8.find((x) => x.nome === "Freya"), { grupo: [{ nome: "Freya" }] }) || {};
  t("8.ª: a companheira de viagem — atacá-la rompe, sem volta, com o veredito de quem anda com você", (() => { const v = (ursa.verbos || []).find((x) => x.id === "atacar") || {}; return v.preco === "rompe com quem anda com você" && v.tom === "semVolta" && (v.veredito || "").startsWith("Ursa o Andarilho anda com você"); })());
  t("…quem anda no grupo não tem o verbo atacar (a agressão recusa-o), tem pedir ajuda", freya.linha === "anda com você" && !(freya.verbos || []).some((v) => v.id === "atacar") && (freya.verbos || []).some((v) => v.frase === "Peço ajuda a Freya"));
  const sombra = fichaParaTela(lista8.find((x) => x.nome === "Sombra da corrente"), {}) || {};
  t("8.ª: quem o Mestre armou sem nome — «você não sabe o nome dela», com artigo na frase", sombra.linha === "você não sabe o nome dela" && sombra.frase === "Falo com a sombra da corrente" && (sombra.retrato || {}).inimigo === true);

  const moinho = fichaParaTela({ id: "lx", tipo: "lugar", nome: "Moinho Velho", aqui: false, deOnde: "perto", distancia: "2 h", rumo: "norte" }) || {};
  t("o lugar: «a 2 h, norte», «Vou até o Moinho Velho», o caminho no preço", moinho.linha === "a 2 h, norte" && moinho.frase === "Vou até o Moinho Velho" && ((moinho.verbos || [])[0] || {}).preco === "a 2 h" && (moinho.retrato || {}).marca === "lugar");
  const cidade = fichaParaTela((listaBN.find((x) => x.tipo === "lugar")), {}) || {};
  t("…onde o herói está: «onde você está», «Olho em volta»; a cidade sem artigo", cidade.linha === "onde você está" && cidade.frase === "Olho em volta" && ((cidade.verbos || [])[1] || {}).frase === "Vasculho Buraco Norte");
  const saida = fichaParaTela({ id: "ls", tipo: "lugar", nome: "a porta do norte", aqui: true, deOnde: "saida" }) || {};
  t("…a saída: «Saio pela porta do norte»", saida.frase === "Saio pela porta do norte" && saida.linha === "uma saída daqui");
  const chao = fichaParaTela({ id: "cc", tipo: "coisa", nome: "Chave de ferro", preco: null, aqui: true, deOnde: "chao", sabe: ["no chão"] }) || {};
  t("…a coisa no chão: «Pego a chave de ferro» (o género da exceção), «no chão»", chao.frase === "Pego a chave de ferro" && chao.linha === "no chão" && (chao.sabe || []).includes("está no chão"));
  t("os atalhos 1–3: nenhum cartão com mais de três verbos", [a93, r, o, g, ursa, freya, moinho, cidade, saida, chao].every((f) => (f.verbos || []).length >= 1 && f.verbos.length <= FI.FICHAS_NA_FILEIRA.verbos) && FI.FICHAS_NA_FILEIRA.verbos === 3);
  t("a frase do toque sai da tabela FRASE_DO_TOQUE (ataduras e ratos)", (FI.FRASE_DO_TOQUE || {}).coisaAVenda === "Compro {o}" && (FI.FRASE_DO_TOQUE || {}).criaturaHostilDaFrente === "Ataco {o} da frente");
  t("os verbos, os preços e as frases do cartão saem das tabelas", (FI.VERBOS_DA_FICHA || {}).pessoa.length === 3 && (FI.PRECO_NA_TELA || {}).crime === "é crime aqui" && (FI.PRECO_NA_TELA || {}).falta === "faltam ◉ {n}" && (FI.PISTA_DO_SEGREDO || {}).ele === o.pista && (FI.LEMBRA_NA_TELA || {}).laco.divida === "Um de vocês deve ao outro, e os dois sabem" && (FI.SABE_NA_TELA || {}).linhaAqui === "onde você está");
  t("o género das palavras e os lugares com artigo são tabela", (FI.GENERO_DA_PALAVRA || {}).fem.includes("chave") && (FI.GENERO_DA_PALAVRA || {}).masc.includes("mapa") && (FI.LUGAR_COM_ARTIGO || []).includes("moinho"));
}

/* ============================================================ */
sec("2. AS QUATRO DO PÉ (fichasDaCena)");
{
  const f = fichasDaCena(listaRatos, { mostrado: [M32], grupo: grupo9 });
  t("a fileira dos ratos: os ratos primeiro, Sari (que anda com você) depois", f.length === 2 && f[0].tipo === "criatura" && f[1].nome === "Sari", J(f.map((x) => x.nome)));
  const prosa = "Oren Trançado ergue os olhos do balcão. Atrás dele, o guarda Tomé Cardo boceja. Um rato gigante rói a porta.";
  const lst = montarEmCena({ semente: semente9, turno: 45, cidade: "Buraco Norte", presentes: [GUARDA], emCena: ["Tomé Cardo", OREN.nome], nucleo: nucleo9, encontro: { criatura: "Rato Gigante", quantos: 1 }, mostrado: [prosa], lugar: { nome: "Buraco Norte" }, bancas: [AMB], moeda: "marcos" });
  const fo = fichasDaCena(lst, { mostrado: [prosa] });
  console.log(`      (a ordem da prosa: ${J(fo.map((x) => x.nome))})`);
  t("a ordem é a da prosa (Oren, o guarda, o rato), e o teto é quatro", fo.length === 4 && fo[0].nome === OREN.nome && fo[1].nome === "Tomé Cardo" && fo[2].tipo === "criatura" && FI.FICHAS_NA_FILEIRA.max === 4, J(fo.map((x) => x.nome)));
  t("…o lugar onde o herói está não toma lugar a quem a prosa mostrou", !fo.some((x) => x.linha === "onde você está"));
  t("só os que estão à vista (aqui) viram ficha", fichasDaCena([{ id: "p1", tipo: "pessoa", nome: "Ausente", aqui: false }], {}).length === 0);
  t("lixo: fichasDaCena(null, null) e listas sujas não estouram", J(fichasDaCena(null, null)) === "[]" && fichasDaCena([null, 3, "x", { id: "z" }], { mostrado: null }).length === 0);
}

/* ============================================================ */
sec("3. O ID NO ENVIO (quemNoEnvio, bancasDoToque)");
{
  const e1 = quemNoEnvio({ id: ATADURAS.id, texto: "Compro as ataduras de linho" }, lista44);
  t("as ataduras tocadas: o id vem à frente, pelo toque, a compra é o que a frase faz", (e1[0] || {}).id === ATADURAS.id && e1[0].pelo === "toque" && e1[0].faz === "compra");
  const b1 = bancasDoToque(e1[0], lista44, [AMB]);
  const c93 = compraNaBanca("Compro as ataduras de linho", { bancas: b1, bolsa: 93 });
  const c20 = compraNaBanca("Compro as ataduras de linho", { bancas: b1, bolsa: 20 });
  t("…a compra tocada fecha pelo ESTOQUE: ◉ 29 com a bolsa a 93", !!c93 && c93.fecha && c93.total === 29 && c93.itens.length === 1 && c93.itens[0].mercadorId === AMB.id);
  t("…e com 20 não fecha (sem fundos) — o mesmo número do cartão", !!c20 && !c20.fecha && c20.porque === "sem_fundos" && c20.total === 29);
  /* duas bancas com o mesmo nome de coisa a preços diferentes: o toque escolhe */
  const OUTRA = { id: "banca|2", nome: "Botica da Ponte", aVista: true, estoque: [{ nome: "Ataduras de Linho", tipo: "consumivel", preco: 35 }] };
  const l2 = montarEmCena({ semente: semente9, turno: 42, bancas: [AMB, OUTRA], moeda: "marcos" });
  const daPonte = l2.find((x) => x.nome === "Ataduras de Linho" && x.banca === "Botica da Ponte");
  const e2 = quemNoEnvio({ id: daPonte.id, texto: "Compro as ataduras de linho" }, l2);
  const c2 = compraNaBanca("Compro as ataduras de linho", { bancas: bancasDoToque(e2[0], l2, [AMB, OUTRA]), bolsa: 93 });
  const sem = compraNaBanca("Compro as ataduras de linho", { bancas: [AMB, OUTRA], bolsa: 93 });
  t("…duas bancas com as ataduras: a tocada (◉ 35) é a que fecha, e só ela", !!c2 && c2.total === 35 && c2.itens.length === 1 && c2.itens[0].mercadorId === "banca|2" && !!sem && sem.itens[0].preco === 29);
  t("…sem toque numa coisa, as bancas voltam como vieram", bancasDoToque({ pelo: "frase", tipo: "coisa", id: daPonte.id }, l2, [AMB, OUTRA]).length === 2 && bancasDoToque(null, null, null).length === 0);

  const e3 = quemNoEnvio({ id: RATOS.id, texto: "Ataco o rato gigante da frente" }, listaRatos);
  t("o rato tocado: pelo toque, o golpe", (e3[0] || {}).id === RATOS.id && e3[0].pelo === "toque" && e3[0].faz === "golpe");
  const e4 = quemNoEnvio({ id: ATADURAS.id, texto: "Compro aquilo" }, lista44);
  t("o jogador apagou o nome: o id não vale, e a frase é lida livre (aqui, nada)", e4.length === 0);
  const e5 = quemNoEnvio({ id: ATADURAS.id, texto: "Compro o elixir de destreza" }, lista44);
  t("…trocou a coisa na frase: vale o que a frase diz, pela leitura livre", (e5[0] || {}).nome === "Elixir de Destreza" && e5[0].pelo === "frase" && !e5.some((x) => x.id === ATADURAS.id));
  const e6 = quemNoEnvio({ ids: [RATOS.id, "pc1as15"], texto: "Ataco o rato e grito para Sari" }, listaRatos);
  t("dois toques numa frase (a menção): os dois ids, o golpe à frente", e6.length === 2 && e6[0].id === RATOS.id && e6[0].faz === "golpe" && e6.every((x) => x.pelo === "toque"), J(e6));
  const livre = quemNaFrase("Ataco o rato gigante da frente", listaRatos);
  t("sem id, é exatamente a leitura de antes (quemNaFrase)", J(quemNoEnvio({ texto: "Ataco o rato gigante da frente" }, listaRatos).map(({ pelo, ...x }) => x)) === J(livre));
  t("lixo: quemNoEnvio(null, null), id que não existe", J(quemNoEnvio(null, null)) === "[]" && quemNoEnvio({ id: "nada", texto: "Compro as ataduras de linho" }, lista44)[0].pelo === "frase");
}

/* ============================================================ */
sec("4. F2d · A MEMÓRIA TEM ROSTO");
{
  const fo = fichaParaTela(OREN_I, ctxOren);
  let mem = lembrarFicha(null, fo, { dia: 45, cidade: "Buraco Norte" });
  const p = mem.paginas[OREN_I.id] || {};
  t("o cartão aberto vira página: o nome, o papel, o que se sabia, onde e quando", p.nome === OREN.nome && p.papel === "mestre de recados da guilda" && p.cidade === "Buraco Norte" && p.primeiro === 45 && p.ultimo === 45 && p.vezes === 1 && p.sabe.length === fo.sabe.length);
  t("…a página não guarda a pista nem o segredo (só o que o herói sabia)", !J(mem).includes("não conta") && !J(mem).includes("vendeu"));
  const mem2 = lembrarFicha(mem, { ...fo, sabe: ["lê mal a letra miúda"] }, { dia: 47, cidade: "Buraco Norte" });
  t("…aberto outra vez: as vezes contam, o último dia anda, o que se sabe junta-se", mem2.paginas[OREN_I.id].vezes === 2 && mem2.paginas[OREN_I.id].ultimo === 47 && mem2.paginas[OREN_I.id].primeiro === 45 && mem2.paginas[OREN_I.id].sabe.includes("lê mal a letra miúda"));
  t("…imutável: a memória recebida não mudou", mem.paginas[OREN_I.id].vezes === 1 && mem.paginas[OREN_I.id].ultimo === 45);

  const pg = paginaDoCodice(mem.paginas[OREN_I.id], { ...ctxOren, dia: 50 }) || {};
  const chaves = (f) => Object.keys(f || {}).sort().join(",");
  t("a página do Códice tem a forma da ficha (as mesmas chaves)", chaves(pg) === chaves(fo), chaves(pg));
  t("…lembra onde e quando foi visto, e o pedido; a pista continua a dizer só que há", (pg.lembra || [])[0] === "Visto pela última vez em Buraco Norte, no dia 45" && (pg.lembra || []).includes("Ele lhe pediu uma coisa, e você aceitou") && pg.pista === fo.pista);
  t("…e dela se aponta: o verbo é «Procuro Oren Trançado»", (pg.verbos || []).length === 1 && pg.verbos[0].frase === `Procuro ${OREN.nome}` && pg.frase === `Procuro ${OREN.nome}`);

  /* "procuro Oren" fora de cena: em Vau de Pedra, o elo não está no registo */
  const semPagina = procuraNaMemoria("Procuro Oren", null);
  const dm = procuraNaMemoria("Procuro Oren", mem) || {};
  t("«procuro Oren» sem página: a memória não sabe ninguém", semPagina === null);
  t("…com a página: a memória diz quem é e onde foi visto", dm.nome === OREN.nome && dm.cidade === "Buraco Norte");
  const ctxP = { npcs: {}, grupo: [], cidadeAtual: "Vau de Pedra", lugarAtual: "", mapa: R9.mapa, presentes: [] };
  const antes = procurarPessoa(OREN.nome, ctxP);
  const r = procurarPessoa(OREN.nome, { ...ctxP, daMemoria: dm });
  console.log(`      (fora de cena: "${linhaDaProcura(r)}")`);
  t("…antes, o mundo dizia «ninguém» (o elo não está no registo)", antes.desfecho === "ninguem");
  t("…com a memória: está em Buraco Norte, com o rumo e a distância do Geógrafo", r.desfecho === "noutro_lugar" && r.onde === "Buraco Norte" && !!r.rumo && !!r.distancia && /Buraco Norte/.test(envelopeDaProcura(r)));
  t("…na própria cidade dele: está aqui", procurarPessoa(OREN.nome, { ...ctxP, cidadeAtual: "Buraco Norte", daMemoria: dm }).desfecho === "aqui");
  t("…o registo continua a ganhar à memória (o local que o mundo sabe)", procurarPessoa(OREN.nome, { ...ctxP, npcs: { [OREN.nome]: { nome: OREN.nome, local: "Rio do Rio" } }, daMemoria: dm }).onde === "Rio do Rio");
  t("…o id tocado no Códice aponta quem não está em cena", (() => { const e = quemNoEnvio({ id: OREN_I.id, texto: "Procuro Oren" }, [], mem); return (e[0] || {}).id === OREN_I.id && e[0].faz === "procura" && e[0].pelo === "toque" && (procuraNaMemoria("Procuro Oren", mem, { id: OREN_I.id }) || {}).nome === OREN.nome; })());

  /* a compra pela ficha fica na página da coisa */
  const fa = fichaParaTela(ATADURAS, { bolsa: 93 });
  let mc = lembrarFicha(null, fa, { dia: 42, cidade: "Pedrabaixa" });
  mc = lembrarCompra(mc, ATADURAS.id, { dia: 42, preco: 29 });
  t("a compra fechada pela ficha fica na página das ataduras, e o cartão lembra-a", J(mc.paginas[ATADURAS.id].compras) === J([{ dia: 42, preco: 29 }]) && (fichaParaTela(ATADURAS, { bolsa: 64, memoria: mc }).lembra || []).includes("Você comprou no dia 42, por ◉ 29"));
  t("…compra sem página, sem dia ou sem preço não escreve nada", J(lembrarCompra(mc, "nada", { dia: 1, preco: 2 })) === J(mc) && J(lembrarCompra(mc, ATADURAS.id, { dia: null, preco: 2 })) === J(mc));

  /* o save: campo novo, a versão antiga não o lê; o load aguenta lixo */
  const vazio = garantirMemoriaDoSave(undefined);
  t("o campo novo nasce vazio, com versão (save antigo sem a chave)", vazio.versao === FI.MEMORIA_DO_SAVE_VERSAO && J(vazio.paginas) === "{}");
  t("…ida e volta pelo JSON do save: idêntico", J(garantirMemoriaDoSave(JSON.parse(J(mem2)))) === J(mem2));
  t("…lixo no load: null, texto, números, __proto__, página sem tipo", J(garantirMemoriaDoSave(null).paginas) === "{}" && J(garantirMemoriaDoSave("x").paginas) === "{}" && J(garantirMemoriaDoSave({ paginas: JSON.parse('{"__proto__":{"tipo":"pessoa","nome":"X"},"a":{"nome":"Sem tipo"},"b":5}') }).paginas) === "{}");
  const T = FI.MEMORIA_DAS_FICHAS || {};
  let cheia = null;
  for (let i = 0; i < T.paginas + 10; i++) cheia = lembrarFicha(cheia, { id: "c" + i, tipo: i % 2 ? "coisa" : "pessoa", nome: "Coisa " + i, sabe: Array.from({ length: 9 }, (_, k) => "sabe " + k) }, { dia: i });
  const ids = Object.keys(cheia.paginas);
  t(`o teto: ${T.paginas} páginas — sai a mais antiga`, ids.length === T.paginas && !ids.includes("c0") && ids.includes("c" + (T.paginas + 9)));
  t(`…cada página com até ${T.sabe} coisas sabidas e ${T.compras} compras`, Object.values(cheia.paginas).every((p) => p.sabe.length <= T.sabe) && (() => { let m = mc; for (let i = 0; i < 9; i++) m = lembrarCompra(m, ATADURAS.id, { dia: 43 + i, preco: 29 }); return m.paginas[ATADURAS.id].compras.length === T.compras && m.paginas[ATADURAS.id].compras[0].dia === 43 + 9 - T.compras; })());
  t("…na mesma idade, a coisa sai antes da gente", (() => { let m = null; for (let i = 0; i < T.paginas; i++) m = lembrarFicha(m, { id: "p" + i, tipo: "pessoa", nome: "P" + i }, { dia: 5 }); m = lembrarFicha(m, { id: "zz", tipo: "coisa", nome: "Pedra" }, { dia: 5 }); return !m.paginas.zz && Object.keys(m.paginas).length === T.paginas; })());
  t("a lista do Códice: a mais recente primeiro, todas na forma da ficha", (() => { const l = paginasDoCodice(lembrarFicha(mem, fa, { dia: 46 }), ctxOren); return l.length === 2 && l[0].id === ATADURAS.id && l[1].id === OREN_I.id && (l[0].verbos || []).length === 0; })());
  t("lixo: lembrarFicha(null, null), paginaDoCodice(null), procuraNaMemoria(null, null)", J(lembrarFicha(null, null).paginas) === "{}" && paginaDoCodice(null) === null && procuraNaMemoria(null, null) === null && J(paginasDoCodice(null, null)) === "[]");
}

/* ============================================================ */
sec("5. O SISTEMA NÃO FALA DE SI (o que vai à tela)");
{
  const { gerarGeografia } = await import(S + "geografia.js");
  const { estenderEspinha } = await import(S + "saga.js");
  const { MOLDES } = await import(S + "moldes.js");
  const { guildasDoMundo } = await import(S + "guildas.js");
  const { elencoDoMundo } = await import(S + "elenco.js");
  const { ANTECEDENTES } = await import(S + "antecedentes.js");
  const PROIBIDO = /\bficha|segredo|desconhecid|\bhostil\s*:|EM CENA|\blista\b|\bid\b|\bnull\b|undefined|\[object|\{[a-z]+\}|\{[^}]*\|/i;
  const TU = /(?<![\p{L}])(tua|teu|tuas|teus|contigo|estás|és|tens|vês|sabes|podes)(?![\p{L}])|-te(?![\p{L}])/iu;
  const G = "Fantasia medieval";
  const ANTS = ["", ...ANTECEDENTES.map((a) => a.id)];
  const ruins = [];
  let fichas = 0;
  const varrer = (f, onde) => {
    if (!f) return;
    fichas++;
    const textos = [f.nome, f.linha, f.frase, f.pista || "", ...f.sabe, ...f.lembra, ...f.verbos.flatMap((v) => [v.verbo, v.frase, v.preco, v.impedido || "", v.veredito || ""])];
    for (const tx of textos) if (PROIBIDO.test(tx) || TU.test(tx) || tx.includes(f.id)) ruins.push(`${onde}: ${tx}`);
  };
  for (let i = 0; i < 24; i++) {
    const M = MOLDES[i % MOLDES.length];
    const semente = `Sonda Fichas|${i}`;
    const mapa = gerarGeografia(semente, M);
    const cidade = mapa.cidades[0].nome;
    const guildas = guildasDoMundo(semente, mapa, G, null);
    const antecedente = ANTS[i % ANTS.length];
    const espinha = estenderEspinha({ semente, mapa, genero: G, molde: M, estrutura: "jornada", cidadeInicial: cidade, antecedente, dia: 1 });
    const elenco = elencoDoMundo(semente, mapa, { genero: G, molde: M, espinha, guildas });
    const nucleo = NU.nucleoDaCampanha(semente, mapa, { genero: G, molde: M, espinha, guildas, antecedente, grupo: [], elenco });
    const gente = (nucleo.pessoas || []).filter((p) => p.papel !== "vilao");
    const coracao = { arcos: Object.fromEntries(gente.map((p, k) => [p.nome, { pedido: 2, resposta: k % 2 ? "aceitou" : "", pistas: [3, 4].slice(0, 1 + (k % 2)) }])) };
    const lista = montarEmCena({ semente, turno: 7, cidade, emCena: gente.map((p) => p.nome), nucleo, encontro: { criatura: "Lobo Cinzento", quantos: 1 + (i % 4) }, bancas: [AMB], moeda: "moedas", lugar: { nome: cidade }, saidas: ["a porta do norte"], perto: [{ nome: "Moinho Velho", distancia: "2 h", rumo: "norte" }], mostrado: ["Um lobo cinzento uiva na colina."] });
    const ctx = { nucleo, coracao, dia: 9, bolsa: 30 + i, vistos: Object.fromEntries(gente.map((p) => [p.nome, [2, 5]])), crime: { ctx: { npcs: {}, presentes: [], grupo: [] }, mundo: { semente, mapa, cidade: mapa.cidades[0] } } };
    let mem = null;
    for (const x of lista) { const f = fichaParaTela(x, ctx); varrer(f, `${i}/${x.nome}`); mem = lembrarFicha(mem, f, { dia: 9, cidade }); }
    for (const pg of paginasDoCodice(mem, ctx)) varrer(pg, `${i}/página ${pg.nome}`);
    /* o segredo nunca: nem o que a pessoa esconde, nem o que revela */
    for (const p of gente) {
      const f = fichaParaTela(lista.find((x) => x.nome === p.nome), ctx);
      const esc = String(((p.ficha || {}).esconde || {}).o || "");
      const rev = String(((p.ficha || {}).esconde || {}).revela || "");
      if (f && esc && J(f).includes(esc)) ruins.push(`${i}: o segredo de ${p.nome} na tela`);
      if (f && rev && rev.length > 8 && J(f).includes(rev)) ruins.push(`${i}: a revelação de ${p.nome} na tela`);
    }
  }
  console.log(`      (${fichas} fichas e páginas varridas em 24 mundos)`);
  t("nenhum id, «ficha», «segredo», «desconhecido», «hostil:», molde por encher, nem tu/teu, no que vai à tela", ruins.length === 0, J(ruins.slice(0, 6)));
  t("…e o segredo de ninguém, nem a revelação, em campo nenhum da ficha", !ruins.some((r) => /segredo de|revelação de/.test(r)));
  t("…a varredura tem o que varrer (gente do núcleo com pista, bichos, coisas, lugares)", fichas >= 24 * 8, String(fichas));
}

/* ============================================================ */
sec("6. DETERMINISMO, IMUTABILIDADE, LIXO");
{
  const congela = (o) => { if (o && typeof o === "object") { Object.freeze(o); Object.values(o).forEach(congela); } return o; };
  const itemC = congela(JSON.parse(J(OREN_I)));
  const ctxC = congela(JSON.parse(J({ ...ctxOren, nucleo: { pessoas: nucleo9.pessoas.map((p) => ({ nome: p.nome, genero: p.genero, ficha: p.ficha })) } })));
  t("item e contexto congelados: a ficha sai, nada é mutado", (() => { const f = fichaParaTela(itemC, ctxC); return !!f && f.pista === "Há alguma coisa que ele não conta."; })());
  t("mesma entrada, mesma ficha (duas vezes, byte a byte)", J(fichaParaTela(OREN_I, ctxOren)) === J(fichaParaTela(OREN_I, ctxOren)) && J(fichasDaCena(listaRatos, { mostrado: [M32] })) === J(fichasDaCena(listaRatos, { mostrado: [M32] })));
  t("lixo: fichaParaTela(null), ({}), sem id, sem nome, tipo estranho → null", [null, undefined, {}, { tipo: "pessoa", nome: "X" }, { id: "a", tipo: "pessoa" }, { id: "a", tipo: "dragao", nome: "X" }].every((x) => fichaParaTela(x, null) === null));
  t("ctx null não estoura (`= {}` não cobre null)", !!fichaParaTela(ATADURAS, null) && !!fichaParaTela(OREN_I, null) && !!fichaParaTela(RATOS, null));
  t("memória congelada: lembrarFicha e lembrarCompra devolvem estado novo", (() => { const m = congela(lembrarFicha(null, fichaParaTela(ATADURAS, {}), { dia: 1 })); const m2 = lembrarCompra(lembrarFicha(m, fichaParaTela(ATADURAS, {}), { dia: 2 }), ATADURAS.id, { dia: 2, preco: 29 }); return m2 !== m && m2.paginas[ATADURAS.id].vezes === 2 && m.paginas[ATADURAS.id].vezes === 1; })());
}

console.log(`\nfichas (F2b · F2c · F2d): ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
