/* teste-objetos-abertos.mjs (V7 · 18/11/2026) — o livro, a bolsa e a banca

   formas.md §«A Mesa do Mestre · F5». O módulo puro src/objetos-abertos.js
   decide o que entra em cada página, a ordem, a cara de cada item e o
   veredito antes do clique na compra e na venda. Esta suíte prova a conta;
   a fiação (os três painéis e o App) prova-se pelo texto, ao fim. */
import fs from "node:fs";
import {
  OBJETO_ABERTO, OBJETOS_NA_MESA, objetoDaPorta, corpoDoObjeto, FITAS_DO_LIVRO, FITA, fitaInicial,
  RARIDADE_DA_CASA, CASA, NOME_DA_RARIDADE, raridadeDe, molduraDaCasa,
  GLIFOS_DE_ITEM, NOME_DA_FAMILIA, PISTAS_DA_FAMILIA, familiaDoItem,
  MOCHILA, CORPO_DA_BOLSA, ORDEM_DO_CORPO, casasDaMochila, ordemDaMochila, verbosDaLinha,
  vereditoDaCompra, vereditoDaVenda, fraseDoEfeito,
  genteDoLivro, cartasDoBestiario, feitosDoLivro,
} from "../src/objetos-abertos.js";
import { ARMAS, ARMADURAS } from "../src/itens.js";
import { CONQUISTAS, conquistaPorId } from "../src/conquistas.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

sec("1. o objeto aberto — um corpo só para os quatro");
{
  t("a 1440 × 900 o corpo é 1144 × 756, centrado (148 de cada lado)", (() => { const c = corpoDoObjeto(1440, 900); return c.modo === "mesa" && c.largura === 1144 && c.altura === 756 && c.x === 148 && c.y === 72; })());
  t("a 1280 × 720 o corpo é 1040 × 620 (a regra do pequeno)", (() => { const c = corpoDoObjeto(1280, 720); return c.modo === "mesa" && c.largura === 1040 && c.altura === 620 && c.x === 120; })());
  t("abaixo do corte do telefone, tela inteira", corpoDoObjeto(375, 812).modo === "telefone" && corpoDoObjeto(OBJETO_ABERTO.corteDoTelefone - 1, 900).modo === "telefone");
  t("o corpo nunca passa da janela (1024 × 700)", (() => { const c = corpoDoObjeto(1024, 700); return c.largura <= 1024 && c.altura <= 700 && c.x >= 0 && c.y >= 0; })());
  t("o véu é 0,58 e o disco de fechar tem 44 (o alvo mínimo)", OBJETO_ABERTO.veu === 0.58 && OBJETO_ABERTO.fechar.lado >= 44);
}

sec("2. que objeto cada porta abre (e a tabela que desliga)");
{
  t("Diário → livro; Códex → livro", objetoDaPorta({ aba: "diario" }) === "livro" && objetoDaPorta({ aba: "codex" }) === "livro");
  t("a bolsa do herói → bolsa; a de um companheiro → nada (fica na carta)", objetoDaPorta({ aba: "inv", quem: "eu" }) === "bolsa" && objetoDaPorta({ aba: "inv", quem: "Hilda" }) === null);
  t("o mercado → banca; outra sala da Gestão → nada", objetoDaPorta({ aba: "gestao", sub: "mercado" }) === "banca" && objetoDaPorta({ aba: "gestao", sub: "ficha" }) === null);
  t("o mapa não é deste pacote", objetoDaPorta({ aba: "mapa" }) === null);
  t("desligar na tabela devolve a forma de antes", objetoDaPorta({ aba: "diario" }, { ...OBJETOS_NA_MESA, livro: false }) === null && objetoDaPorta({ aba: "inv" }, { livro: true, bolsa: false, banca: true }) === null);
  t("hoje os três estão ligados", OBJETOS_NA_MESA.livro && OBJETOS_NA_MESA.bolsa && OBJETOS_NA_MESA.banca);
}

sec("3. o livro — cinco fitas");
{
  t("as fitas, na ordem da prancha", FITAS_DO_LIVRO.map((f) => f.rotulo).join("|") === "As buscas|Gente|Bestiário|Feitos|A crônica");
  t("a fita aberta é maior e sobe (150 × 64, 12 px)", FITA.aberta > FITA.altura && FITA.sobe === 12 && FITA.largura === 150);
  t("a fita do telefone tem o alvo mínimo (≥ 44 de largura)", FITA.telefone >= 44 && FITA.altura >= 44);
  t("fitaInicial: a pedida, ou a primeira", fitaInicial("feitos") === "feitos" && fitaInicial("lixo") === "buscas" && fitaInicial(undefined) === "buscas");
}

sec("4. a casa de item — a raridade é moldura, e o nome vem escrito");
{
  t("seis raridades caem em quatro molduras", molduraDaCasa({ raridade: "comum" }) === "comum" && molduraDaCasa({ raridade: "incomum" }) === "incomum" && molduraDaCasa({ raridade: "raro" }) === "rara" && molduraDaCasa({ raridade: "epico" }) === "rara" && molduraDaCasa({ raridade: "lendario" }) === "lendaria" && molduraDaCasa({ raridade: "unico" }) === "lendaria");
  t("acento e caixa do save não mudam nada («Épico»)", raridadeDe({ raridade: "Épico" }) === "epico" && molduraDaCasa({ raridade: "LENDÁRIO" }) === "lendaria");
  t("o que não se reconhece é comum (e a string sem raridade também)", raridadeDe({ raridade: "brilhante" }) === "comum" && raridadeDe("Tocha") === "comum" && raridadeDe(null) === "comum");
  t("só a lendária leva lacre; a rara já leva cantos", RARIDADE_DA_CASA.lendaria.lacre && !RARIDADE_DA_CASA.rara.lacre && RARIDADE_DA_CASA.rara.cantos && !RARIDADE_DA_CASA.incomum.cantos);
  t("toda raridade tem nome escrito em PT-BR", ["comum", "incomum", "raro", "epico", "lendario", "unico"].every((r) => typeof NOME_DA_RARIDADE[r] === "string" && NOME_DA_RARIDADE[r].length > 2));
  t("as casas têm o alvo mínimo (a menor, a do corpo no telefone, 44)", Math.min(CASA.mochila, CASA.banca, CASA.comparacao, CASA.telefone) >= 44);
}

sec("5. a família do item — todo item tem cara");
{
  const FAMS = Object.keys(GLIFOS_DE_ITEM);
  t("42 glifos (41 famílias + desconhecido)", FAMS.length === 42 && FAMS.includes("desconhecido"));
  t("todo glifo é um caminho SVG que começa por M", FAMS.every((k) => /^M[\d.]/.test(GLIFOS_DE_ITEM[k])));
  t("toda família tem nome para a ficha", FAMS.every((k) => typeof NOME_DA_FAMILIA[k] === "string" && NOME_DA_FAMILIA[k]));
  t("toda pista aponta para uma família que tem glifo", PISTAS_DA_FAMILIA.every(([f]) => FAMS.includes(f)));
  t("equipamento pela ficha: escudo, as quatro armaduras, os acessórios",
    familiaDoItem({ nome: "Broquel", tipo: "escudo" }) === "escudo" &&
    familiaDoItem({ nome: "Cota de Malha", tipo: "armadura" }) !== "desconhecido" &&
    familiaDoItem({ nome: "Capuz de Couro", tipo: "elmo" }) === "elmo" &&
    familiaDoItem({ nome: "Botas de Viagem", tipo: "botas" }) === "botas" &&
    familiaDoItem({ nome: "Anel de Prata", tipo: "anel" }) === "anel" && familiaDoItem({ nome: "Talismã", tipo: "amuleto" }) === "amuleto");
  t("armas: arco, besta, machado, maça, haste, lâmina",
    familiaDoItem({ nome: "Arco Longo", tipo: "arma" }) === "arco" && familiaDoItem({ nome: "Besta Leve", tipo: "arma" }) === "besta" &&
    familiaDoItem({ nome: "Machado de Batalha", tipo: "arma" }) === "machado" && familiaDoItem({ nome: "Martelo de Guerra", tipo: "arma" }) === "maca" &&
    familiaDoItem({ nome: "Lança", tipo: "arma" }) === "haste" && familiaDoItem({ nome: "Espada Longa", tipo: "arma" }) === "lamina");
  t("«Besta Leve» é besta e não armadura (o tipo gravado manda)", familiaDoItem({ nome: "Besta Leve", tipo: "arma" }) === "besta");
  t("itens úteis pelo nome", familiaDoItem("Poção de Cura") === "pocao" && familiaDoItem("Óleo inflamável") === "frasco" && familiaDoItem("Tocha") === "tocha" &&
    familiaDoItem("Corda de cânhamo") === "corda" && familiaDoItem("Chave enferrujada") === "chave" && familiaDoItem("Ração de viagem") === "comida" &&
    familiaDoItem("Cantil") === "agua" && familiaDoItem("Alaúde") === "instrumento" && familiaDoItem("Dente de lobo") === "trofeu" && familiaDoItem("Rubi") === "gema");
  t("o mapa é mapa, pelo tipo e pelo nome", familiaDoItem({ nome: "Mapa de Margens Altas", tipo: "mapa" }) === "mapa" && familiaDoItem("Mapa velho") === "mapa");
  t("a classe decide quando o nome não casa", familiaDoItem({ nome: "Pó de osso", classe: "insumo" }) === "componente" && familiaDoItem({ nome: "Fardo de lã", classe: "mercadoria" }) === "reliquia" && familiaDoItem({ nome: "Promessa", classe: "semente" }) === "carta_lacrada");
  t("nada casou → desconhecido (e nulo também)", familiaDoItem("Xyzzy") === "desconhecido" && familiaDoItem(null) === "desconhecido" && familiaDoItem("") === "desconhecido");
  /* A COBERTURA DO ACERVO (§2: «a prova é a suíte contar quantos itens caem em
     desconhecido»): toda arma e toda armadura do catálogo, gravadas com o seu
     tipo, têm família — nenhuma cai no losango. */
  const semCara = [...ARMAS.map((a) => ({ nome: a.nome, tipo: "arma" })), ...ARMADURAS.map((a) => ({ nome: a.nome, tipo: "armadura" }))].filter((it) => familiaDoItem(it) === "desconhecido").map((it) => it.nome);
  t(`o acervo de armas e armaduras tem cara (${ARMAS.length + ARMADURAS.length} itens, ${semCara.length} sem)`, semCara.length === 0);
  if (semCara.length) console.log("     sem cara: " + semCara.join(", "));
  t("é determinístico: o mesmo item, a mesma cara", familiaDoItem({ nome: "Adaga", tipo: "arma" }) === familiaDoItem({ nome: "Adaga", tipo: "arma" }));
}

sec("6. a bolsa — o corpo e a mochila");
{
  t("sete casas no corpo, cada uma uma vez", ORDEM_DO_CORPO.length === 7 && new Set(ORDEM_DO_CORPO).size === 7);
  t("o elmo ao centro; arma, escudo e anel à direita", CORPO_DA_BOLSA.centro[0] === "elmo" && CORPO_DA_BOLSA.direita.join() === "arma,escudo,anel");
  const m = casasDaMochila(["a", "b", "c"]);
  t("a mochila fecha a fila e nunca mostra menos que o mínimo", m.casas.length === MOCHILA.minimo && m.casas.filter(Boolean).length === 3);
  t("sempre ao menos uma casa vazia", casasDaMochila(Array.from({ length: 10 }, (_, i) => i + 1)).casas.length === 15);
  t("a mochila não diz teto nenhum (o jogo não tem)", !/ de \d/.test(m.rotulo) && m.rotulo === "3 coisas" && casasDaMochila(["x"]).rotulo === "1 coisa");
  t("mochila vazia: só casas vazias", casasDaMochila([]).usadas === 0 && casasDaMochila(null).casas.every((c) => c === null));
  const linhas = [
    { chave: "a", nome: "Pedra", acoes: [{ id: "soltar", rotulo: "Soltar" }] },
    { chave: "b", nome: "Espada", peca: true, acoes: [{ id: "soltar", rotulo: "Soltar" }] },
    { chave: "c", nome: "Poção", acoes: [{ id: "usar", rotulo: "Usar", primario: true }, { id: "soltar", rotulo: "Soltar" }] },
  ];
  t("a ordem: o que se usa, depois as peças, depois o resto", ordemDaMochila(linhas).map((l) => l.chave).join("") === "cba");
  t("a ordem é estável e não muta a entrada", ordemDaMochila(linhas).length === 3 && linhas[0].chave === "a");
  const v = verbosDaLinha(linhas[2]);
  t("o verbo principal é o primário; os outros ficam de fora dele", v.principal && v.principal.id === "usar" && v.outros.length === 1 && v.outros[0].id === "soltar");
  t("sem primário, nenhum principal", verbosDaLinha(linhas[0]).principal === null && verbosDaLinha(null).outros.length === 0);
}

sec("7. a banca — o veredito antes do clique (glifo + palavra, nunca cor só)");
{
  const pode = vereditoDaCompra({ preco: 2, moedas: 15, nome: "Tocha" });
  t("pode: ✓ «você paga», fica com o resto", pode.pode && pode.glifo === "✓" && pode.palavra === "você paga" && pode.fica === 13 && pode.botao === "Comprar Tocha");
  const nao = vereditoDaCompra({ preco: 22, moedas: 15, nome: "Loriga" });
  t("não pode: ✕ «faltam 7», e a razão escrita no botão", !nao.pode && nao.glifo === "✕" && nao.palavra === "faltam 7" && nao.razao === "faltam 7 moedas" && nao.falta === 7);
  t("falta uma: «moeda» no singular", vereditoDaCompra({ preco: 5, moedas: 4 }).razao === "faltam 1 moeda");
  t("preço igual às moedas: pode, e fica com zero", vereditoDaCompra({ preco: 9, moedas: 9 }).pode && vereditoDaCompra({ preco: 9, moedas: 9 }).fica === 0);
  t("entrada torta não quebra (NaN, negativo)", vereditoDaCompra({ preco: "x", moedas: -3 }).pode === true && vereditoDaCompra().pode === true);
  const venda = vereditoDaVenda({ valor: 9, moedas: 15, quem: { nome: "Brenna" } });
  t("venda: recebe 9, fica com 24, e diz que não tem volta", venda.pode && venda.depois === 24 && venda.botao === "Vender · recebe 9" && /não tem volta/.test(venda.razao));
  t("vestido não se vende (tira-se primeiro)", !vereditoDaVenda({ valor: 9, quem: { nome: "B" }, vestido: true }).pode);
  t("sem comprador: o motivo do motor, ou a frase de recuo", vereditoDaVenda({ valor: 0, motivo: "aqui ninguém lida com relíquias" }).razao === "aqui ninguém lida com relíquias" && !vereditoDaVenda({}).pode);
  t("o efeito: CA sobe/cai de N para M", fraseDoEfeito({ nome: "x" }, [{ curto: "CA", sinal: "danger", antes: 12, depois: 11 }], "armadura") === "CA cai de 12 para 11" && fraseDoEfeito({ nome: "x" }, [{ curto: "CA", sinal: "ok", antes: 12, depois: 14 }], "armadura") === "CA sobe de 12 para 14");
  t("sem encaixe vai para a mochila; o mapa abre a região; sem linhas, nada muda", fraseDoEfeito({ nome: "Tocha" }, null, null) === "vai para a mochila" && fraseDoEfeito({ tipo: "mapa" }, null, null) === "abre a região na carta" && fraseDoEfeito({ nome: "x" }, [], "arma") === "nada muda no corpo");
}

sec("8. as páginas do Códex no livro");
{
  const paginas = [{ id: "p1", tipo: "pessoa", nome: "Cedric", papel: "ferreiro", lembra: ["Visto em Velha Valente no dia 2."] }, { id: "l1", tipo: "lugar", nome: "O Pregão" }];
  const npcs = { Cedric: { nome: "Cedric", ultimaVez: 3 }, Brenna: { nome: "Brenna", papel: "mercadora", ultimaVez: 5 }, Oren: { nome: "Oren", ultimaVez: 1 } };
  const g = genteDoLivro(paginas, npcs);
  t("gente: só pessoas; quem tem página primeiro, sem repetir", g.map((x) => x.nome).join() === "Cedric,Brenna,Oren" && g[0].ficha && !g[1].ficha);
  t("gente: o registro vem pelo mais recente", genteDoLivro([], npcs).map((x) => x.nome).join() === "Brenna,Cedric,Oren");
  t("gente: procurar filtra pelo nome ou ofício, sem acento", genteDoLivro(paginas, npcs, "merca").map((x) => x.nome).join() === "Brenna" && genteDoLivro(paginas, npcs, "cédric").length === 1);
  t("gente vazia: lista vazia (o estado vazio da prancha)", genteDoLivro(null, null).length === 0);
  const b = cartasDoBestiario([{ nome: "Rato Gigante" }, { nome: "Lobo" }, { nome: "Ogro" }], ["Rato Gigante abatido", "O Devorador de Sinos"]);
  t("bestiário: vista se alguma descoberta cita o nome", b.cartas.find((c) => c.nome === "Rato Gigante").vista && !b.cartas.find((c) => c.nome === "Lobo").vista);
  t("bestiário: a única desta história entra vista, e conta", b.cartas.some((c) => c.unica && c.vista) && b.vistas === 2 && b.total === 4);
  t("bestiário: as vistas à frente, as de costas no fim", b.cartas.map((c) => c.vista).join() === "true,true,false,false" && b.cartas[0].nome === "Rato Gigante");
  t("bestiário vazio: 0 de N", cartasDoBestiario([{ nome: "Lobo" }], []).vistas === 0);
  const cats = [{ id: "lamina", rotulo: "Lâmina", ids: [CONQUISTAS[0].id, CONQUISTAS[1].id] }, { id: "lenda", rotulo: "Lenda", ids: [CONQUISTAS[2].id, "nao_existe"] }];
  const f = feitosDoLivro(cats, { [CONQUISTAS[0].id]: true }, conquistaPorId);
  t("feitos: lacrado e por lacrar, com a conta", f[0].lugares[0].lacrado && !f[0].lugares[1].lacrado && f[0].conta === "1 de 2");
  t("feitos: o próximo da família é o primeiro por lacrar", f[0].proximo && f[0].proximo.id === CONQUISTAS[1].id);
  t("feitos: a Lenda só mostra o nome depois de lacrada", f[1].lugares[0].oculto && f[1].lugares[0].nome === "?");
  t("feitos: id que não existe não vira lugar", f[1].lugares.length === 1);
  t("feitos: o título só aparece lacrado", f[0].lugares[0].titulo === (CONQUISTAS[0].titulo || "") && f[0].lugares[1].titulo === "");
}

sec("9. a fiação — os painéis leem a tabela, e o App liga em calou");
{
  const ler = (f) => fs.readFileSync(new URL("../src/" + f, import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const APP = ler("App.jsx"), LIVRO = ler("painel-livro.jsx"), BOLSA = ler("painel-bolsa.jsx"), BANCA = ler("painel-banca.jsx"), PECAS = ler("pecas-da-mesa.jsx");
  t("os três abrem pelo mesmo ObjetoAberto", [LIVRO, BOLSA, BANCA].every((s) => s.includes("<ObjetoAberto objeto=")));
  t("o App importa os três painéis e a porta", APP.includes('import { PainelLivro } from "./painel-livro.jsx";') && APP.includes('import { PainelBolsa } from "./painel-bolsa.jsx";') && APP.includes('import { PainelBanca } from "./painel-banca.jsx";') && APP.includes('import { objetoDaPorta } from "./objetos-abertos.js";'));
  t("a porta decide-se em calou", APP.includes('try { objetoV7 = objetoDaPorta({ aba, sub: subGestao, quem: invDe }); } catch (e) { calou("V7 · que objeto abre", e); objetoV7 = null; }'));
  t("o alforje não abre por baixo de um objeto", APP.includes("<Alforje aberto={!!abaPedida && !objetoV7}"));
  t("cada objeto calado pelo seu limite", ["livro-v7", "bolsa-v7", "banca-v7"].every((k) => APP.includes(`<LimiteDasFichas key="${k}">`)));
  t("as formas de antes ficam inteiras, e só abrem com o objeto desligado", APP.includes('if (objetoV7 || !(aba === "diario" && heroiNaMesa)) return null;') && APP.includes('if (objetoV7 || !(aba === "gestao" && subGestao === "mercado" && heroiNaMesa)) return null;'));
  t("a banca chama as mesmas funções que pagam e cobram", /<PainelBanca [^>]*onComprar=\{onComprar\} onVender=\{onVender\} onPechinchar=\{onPechinchar\} onComprarSuprimento=\{onComprarSuprimento\}/.test(APP));
  t("o veredito da banca e da bolsa sai do módulo puro", BANCA.includes("vereditoDaCompra(") && BANCA.includes("vereditoDaVenda(") && BOLSA.includes("casasDaMochila(") && BOLSA.includes("ordemDaMochila("));
  t("nenhum painel calcula preço (só lê item.preco e ofertaPor)", !/preco\s*\*\s*(0\.|1\.)|Math\.round\([^)]*preco/.test(BANCA));
  t("a casa de item e o glifo moram nas peças da mesa", /export function CasaDeItem\(/.test(PECAS) && /export function GlifoDeItem\(/.test(PECAS));
  t("nenhum componente nasce dentro do App (a lei do foco)", !/function (PainelLivro|PainelBolsa|PainelBanca|ObjetoAberto)\b/.test(APP));
  t("o livro lê as famílias de conquista do Códex (uma tabela só)", LIVRO.includes('import { CATEGORIAS_CONQUISTA } from "./painel-codex.jsx";'));
}

console.log(`\n${ok} ok · ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
