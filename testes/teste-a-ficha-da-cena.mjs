/* ============================================================
   A FICHA DA CENA (o Mestre que conhece a cena, etapa 2 · 21/11/2026)
   mente/lancamento/o-mestre-vivo.md §22 — src/a-ficha-da-cena.js,
   bolsa-da-frase.js#compraSemQuemVenda, memoria-do-inventado.js (semFolga)
   e a fiação no App.

   As situações são as das sessões jogadas 3 e 4 com o Mestre vivo, ditas
   por nós (nenhuma frase de mesa real): o vendedor que ninguém registrou, a
   corda regateada e não cobrada, a arca que virou porta, o cantil que virou
   corda, quem a frase chama e está noutro lugar, a procura de quem ninguém
   procurou, a gazua que a ficha nega e a prosa põe na mão.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import {
  A_FICHA_DA_CENA, aCoisaDaFrase, fichaDaCenaNaPauta, QUEM_NAO_ESTA, quemNaoEstaNaCena, pautaDeQuemNaoEsta, falaDeQuemNaoEsta,
  O_REGATEIO_NA_BANCA, oRegateioNaBanca, balcaoComPechincha, A_PROCURA_NA_COISA, procuraNaCoisaDeAlguem,
  emOLugar, CONTRACAO_DO_EM,
} from "../src/a-ficha-da-cena.js";
import { compraSemQuemVenda, falaDaCompraSemQuemVenda, vetoDaCompraSemQuemVenda, COMPRA_SEM_QUEM_VENDA, FALA_DA_COMPRA_SEM_QUEM_VENDA, compraNaFrase, compraNaBanca } from "../src/bolsa-da-frase.js";
import { retratoDosRefs } from "../src/o-mestre-vivo-no-jogo.js";
import { chamadoDoMomento } from "../src/a-cena-do-jogo.js";
import { balcaoDeMantimentos } from "../src/mercado.js";
import { PRECOS_COMUNS } from "../src/economia.js";
import { PECHINCHA_GANHO, PECHINCHA_PERDA } from "../src/comercio.js";
import { lembrarOInventado, MEMORIA_DO_INVENTADO } from "../src/motor/memoria-do-inventado.js";
import { textoDaPauta, TETO_DA_PAUTA, porNaPauta } from "../src/pauta.js";

let falhas = 0;
const t = (nome, cond, extra) => { if (cond) console.log("  ok:", nome); else { falhas++; console.log("  FALHA:", nome, extra != null ? `→ ${extra}` : ""); } };
const sec = (s) => console.log(`\n[${s}]`);
const PROIBIDAS = /\b(dado|dados|rol\w+|teste|testes|sucesso|sorte|risco|regra|sistema|mestre|b[oô]nus|per[ií]cia|tu|teu|tua|contigo)\b/i;

/* a cena: o mercado, a vendedora da corda, o companheiro, uma banca */
const crus = {
  lugar: { nome: "Mercado das Redes" }, cidade: "Vila", jornada: null, minuto: 14 * 60, clima: "limpo",
  presentes: [{ nome: "Brisa", papel: "vendedora", deOnde: "sitio" }], npcs: { Brisa: { nome: "Brisa", papel: "vendedora", relacao: "desconhecido" } },
  rotinas: {}, grupo: [{ nome: "Tomé", vida: 9, vidaMax: 9 }], inimigos: [], encontro: null, masmorra: null,
  achado: false, segredos: [], favorAqui: false, relogios: [], condicoes: [], passos: [], onde: null, quest: {},
};
const leitura = {
  semente: "prova", lugar: "Mercado das Redes", personagem: { nome: "Herói", atributos: {}, pericias: [] },
  pessoaDe: (x) => (/brisa|vendedora/i.test(x) ? { nome: "Brisa", papel: "vendedora", relacao: "desconhecido" } : null),
  fama: 0, tentativas: {}, achadoDe: () => null, ehPessoaConhecida: (x) => /brisa/i.test(x), segredos: () => [], objetoEmCena: () => false,
};
const retrato = retratoDosRefs(crus);
const BANCAS = [{ id: "geral|1", nome: "Feira do Cais", estoque: [{ nome: "Espada Curta", preco: 40, tipo: "arma" }, { nome: "Lanterna de Latão", preco: 12, tipo: "curiosidade" }] }];
const BALCAO = balcaoDeMantimentos({ nome: "Vila", porte: "vila" }, { dia: 3 });
const KIT = BALCAO.find((b) => b.id === "kit");

sec("1. a tabela e a voz");
{
  t("as frases da ficha não falam de dado, regra, sistema nem em PT-PT",
    [A_FICHA_DA_CENA.quem, A_FICHA_DA_CENA.ninguem, A_FICHA_DA_CENA.mao, A_FICHA_DA_CENA.coisa, ...Object.values(QUEM_NAO_ESTA), O_REGATEIO_NA_BANCA.mudou, O_REGATEIO_NA_BANCA.igual, O_REGATEIO_NA_BANCA.naoPode,
      FALA_DA_COMPRA_SEM_QUEM_VENDA.tela, FALA_DA_COMPRA_SEM_QUEM_VENDA.veto].every((s) => !PROIBIDAS.test(s)));
  t("as famílias da coisa são as que caem sobre UMA coisa", ["forcar", "travessia", "furtar"].every((f) => A_FICHA_DA_CENA.familiasDaCoisa.includes(f)));
  t("a lista tem teto", A_FICHA_DA_CENA.naLista >= 3 && A_FICHA_DA_CENA.naLista <= 6);
}

sec("2. a ficha na pauta: quem está, nada muda de mão, a coisa");
{
  t("lixo e sem cena: null", fichaDaCenaNaPauta(null) === null && fichaDaCenaNaPauta({ momento: { cena: null } }) === null);
  const m = chamadoDoMomento("Arrombo o cadeado da arca, sem ferramentas", leitura, retrato, { bonus: 2 });
  const pa = fichaDaCenaNaPauta({ frase: "Arrombo o cadeado da arca, sem ferramentas", momento: m, bancas: BANCAS });
  t("o veto de quem está leva os nomes da cena e quem atende a banca", !!pa && pa.naoPode[0].includes("Brisa (vendedora)") && pa.naoPode[0].includes("Tomé (comigo)") && pa.naoPode[0].includes("quem atende Feira do Cais"), pa && pa.naoPode[0]);
  t("e o veto de que nada muda de mão nem se diz preço", !!pa && pa.naoPode.includes(A_FICHA_DA_CENA.mao));
  /* 21/11 (§24): a coisa saiu de ACABOU DE para o NÃO PODE — medida contra as
     158 pautas gravadas fora da luta, em ACABOU DE (prio 3) o teto a cortava
     em 69; no NÃO PODE chega em 153. A intenção é a mesma: a arca não vira porta. */
  t("a arca não vira porta: a coisa em que mexo vai no NÃO PODE", !!pa && pa.naoPode.some((l) => l.includes("«cadeado da arca»")), pa && pa.naoPode.join(" | "));
  const mc = chamadoDoMomento("Afano um cantil da banca de água", leitura, retrato, { bonus: 2 });
  const pc = fichaDaCenaNaPauta({ frase: "Afano um cantil da banca de água", momento: mc, bancas: BANCAS });
  /* 21/11 (§24): idem — a coisa vai no NÃO PODE */
  t("o cantil não vira corda: a coisa do furto, com o acento de quem escreveu", !!pc && pc.naoPode.some((l) => l.includes("«cantil da banca de água»")), pc && pc.naoPode.join(" | "));
  const mf = chamadoDoMomento("Pergunto à Brisa onde fica o templo", leitura, retrato, { bonus: 2 });
  const pf = fichaDaCenaNaPauta({ frase: "Pergunto à Brisa onde fica o templo", momento: mf, bancas: [] });
  t("a conversa não ganha linha de coisa (só as famílias de uma coisa)", !!pf && pf.acabou.length === 0 && pf.naoPode.length === 2);
  const vazio = chamadoDoMomento("Olho em volta", leitura, retratoDosRefs({ ...crus, presentes: [], npcs: {}, grupo: [] }), {});
  const pv = fichaDaCenaNaPauta({ frase: "Olho em volta", momento: vazio, bancas: [] });
  t("sem ninguém em cena, o veto diz que não há ninguém", !!pv && pv.naoPode[0] === A_FICHA_DA_CENA.ninguem, pv && pv.naoPode[0]);
  const muitos = { cena: { pessoas: Array.from({ length: 9 }, (_, i) => ({ nome: `Pessoa${i}`, papel: "x", estados: [] })), criaturas: [], coisas: [], cena: { estados: [] } }, veredito: null };
  const pm = fichaDaCenaNaPauta({ frase: "", momento: muitos, bancas: BANCAS });
  t("a lista corta no teto, com reticências", !!pm && pm.naoPode[0].endsWith("…") && (pm.naoPode[0].match(/Pessoa/g) || []).length === A_FICHA_DA_CENA.naLista);
  const antes = JSON.stringify(m);
  fichaDaCenaNaPauta({ frase: "x", momento: m, bancas: BANCAS });
  t("não mexe no momento", JSON.stringify(m) === antes);
}

sec("3. a coisa da frase");
{
  t("a coisa da cena que a frase nomeia ganha do recorte", aCoisaDaFrase("Empurro a porta", { pessoas: [], criaturas: [], coisas: [{ nome: "porta", estados: [] }], cena: { estados: [] } }) === "porta");
  t("«o lugar» nunca é a coisa nomeada", aCoisaDaFrase("Escalo o muro do lugar", { pessoas: [], criaturas: [], coisas: [{ nome: "o lugar", estados: [] }], cena: { estados: [] } }) === "muro do lugar");
  t("sem frase, nada", aCoisaDaFrase("", null) === "" && aCoisaDaFrase(null, null) === "");
}

sec("4. quem não está");
{
  const cena = chamadoDoMomento("Olho em volta", leitura, retrato, {}).cena;
  const aus = [{ nome: "Doran Pé-de-Ferro", onde: "a Forja Velha", morto: false }, { nome: "Malva", onde: "", morto: true }];
  const d = quemNaoEstaNaCena("Pergunto ao Doran se a ponte caiu", cena, { ausentes: aus });
  t("quem o sistema sabe noutro lugar: o nome e onde", !!d && d.nome === "Doran Pé-de-Ferro" && d.onde === "a Forja Velha", JSON.stringify(d));
  /* MOVIDA em 21/11 (o-mestre-vivo.md §23), e o motivo: a asserção guardava
     «está em a Forja Velha», o defeito que a etapa 3 consertou — o «em» contrai
     com o artigo do lugar (emOLugar). A intenção é a mesma: a linha diz onde. */
  t("a linha na tela diz onde", falaDeQuemNaoEsta(d) === "🧭 Doran Pé-de-Ferro não está aqui — está na Forja Velha.", falaDeQuemNaoEsta(d));
  const pd = pautaDeQuemNaoEsta(d);
  t("a pauta: ACABOU DE diz que não está, e que nem ele nem outro responde no lugar (uma linha só)", pd.acabou[0].includes("não está aqui (está na Forja Velha)") /* MOVIDA em 21/11 (§23): a contração, como acima */ && pd.acabou[0].includes("nem Doran Pé-de-Ferro nem outra pessoa responde") && pd.naoPode.length === 0);
  /* 21/11 (§23): a preposição contrai com o artigo do lugar, qualquer caixa */
  t("emOLugar: a/o/os/as contraem, sem artigo fica «em»", emOLugar("a Forja Velha") === "na Forja Velha" && emOLugar("O Malho") === "no Malho"
    && emOLugar("os Arcos") === "nos Arcos" && emOLugar("As Termas") === "nas Termas" && emOLugar("Vau") === "em Vau" && emOLugar("") === "" && emOLugar(null) === "");
  t("emOLugar: «a» só é artigo quando é palavra («Alto Negro» não contrai)", emOLugar("Alto Negro") === "em Alto Negro" && emOLugar("Ostra Azul") === "em Ostra Azul");
  t("a tabela da contração cobre os quatro artigos", Object.keys(CONTRACAO_DO_EM).join(",") === "o,a,os,as");
  t("sem onde, sem «está»", falaDeQuemNaoEsta({ nome: "Rui", onde: "" }) === "🧭 Rui não está aqui.");
  const mo = quemNaoEstaNaCena("Digo a Malva que voltei", cena, { ausentes: aus });
  t("o morto: morreu, sem onde", !!mo && mo.morto && falaDeQuemNaoEsta(mo).includes("morreu"));
  t("quem está na cena nunca é ausente", quemNaoEstaNaCena("Pergunto à Brisa o preço", cena, { ausentes: aus, conhecidos: ["Brisa"] }) === null);
  t("o registrado fora da cena: não está, sem onde", (quemNaoEstaNaCena("Pergunto a Ilsa pelo barco", cena, { conhecidos: ["Ilsa Remo"] }) || {}).nome === "Ilsa Remo");
  t("o desconhecido não é afirmado ausente (o portão morde só o necessário)", quemNaoEstaNaCena("Peço a Valena que me guie", cena, { ausentes: aus, conhecidos: [] }) === null);
  t("o protegido (o deus a quem se pede) passa", quemNaoEstaNaCena("Peço a Doran que me proteja", cena, { ausentes: aus, protegidos: ["Doran"] }) === null);
  t("menção não é presença: o nome que é assunto, e não ouvinte, não conta", quemNaoEstaNaCena("Digo à Brisa que o Doran me mandou", cena, { ausentes: aus }) === null);
  const pa = fichaDaCenaNaPauta({ frase: "Pergunto ao Doran", momento: chamadoDoMomento("Pergunto ao Doran", leitura, retrato, {}), bancas: [], ausente: d });
  t("e vai junto da ficha na pauta", !!pa && pa.acabou.some((l) => l.includes("Doran Pé-de-Ferro")) && pa.acabou.some((l) => l.includes("nem Doran Pé-de-Ferro nem outra pessoa")));
}

sec("5. a compra sem quem venda");
{
  const comuns = PRECOS_COMUNS.map((x) => x.rx);
  t("o cantil do vendedor que ninguém registrou, sem balcão: ninguém vende", JSON.stringify(compraSemQuemVenda("Compro um cantil do vendedor de água.", { comuns })) === JSON.stringify({ coisa: "cantil" }));
  t("com o balcão que tem água, a compra é do balcão (null aqui)", compraSemQuemVenda("Compro um cantil.", { balcao: BALCAO, comuns }) === null && !!compraNaFrase("Compro um cantil.", { balcao: BALCAO, bolsa: 50 }));
  t("a coisa da banca daqui: a compra é da banca", compraSemQuemVenda("Compro a lanterna de latão", { bancas: BANCAS, comuns }) === null && !!compraNaBanca("Compro a lanterna de latão", { bancas: BANCAS, bolsa: 50 }));
  t("a mercadoria das bancas, com bancas: «compra-se nas bancas» (null aqui)", compraSemQuemVenda("Compro um escudo", { bancas: BANCAS, comuns }) === null);
  t("a mesma mercadoria sem banca nenhuma (a estrada): ninguém vende", (compraSemQuemVenda("Compro um escudo", { comuns }) || {}).coisa === "escudo");
  t("o que se come e bebe na rua é do pagamento da frase", compraSemQuemVenda("Compro uma cerveja", { comuns }) === null);
  t("a pergunta e a hipótese não compram", compraSemQuemVenda("Quanto custa o cantil?", { comuns }) === null && compraSemQuemVenda("Se eu comprar um barco, ele vem?", { comuns }) === null);
  t("«pago» é do pagamento da frase, não daqui", compraSemQuemVenda("Pago a sopa", { comuns }) === null);
  t("sem coisa dita, nada", compraSemQuemVenda("Compro isso", { comuns }) === null && compraSemQuemVenda("", { comuns }) === null);
  const c = compraSemQuemVenda("Quero comprar um barco", { comuns });
  t("a tela e o veto", falaDaCompraSemQuemVenda(c) === "🛒 Aqui ninguém vende barco." && vetoDaCompraSemQuemVenda(c)[0].includes("fingir que alguém me vende ou entrega barco"));
  t("o verbo do «pago» ficou de fora da tabela", !COMPRA_SEM_QUEM_VENDA.verbo.test("pago o barco"));
}

sec("6. o regateio na banca");
{
  const base = { bancas: BANCAS, balcao: BALCAO, pechinchas: {}, dia: 3, bonus: 2, dc: 12 };
  const ok = oRegateioNaBanca("Regateio a corda com a Brisa: faz por 15?", { ...base, d20: 11 });
  t("a corda é o kit do balcão; 11+2 contra 12 = «aceitou baixar», com o ganho da tabela", !!ok && ok.id === O_REGATEIO_NA_BANCA.idDoBalcao && ok.registro.ajuste === 1 - PECHINCHA_GANHO && ok.registro.ok === true, JSON.stringify(ok && ok.registro));
  t("o preço novo é o do kit × ajuste, e a tela e a pauta dizem os dois números", ok.antes === KIT.preco && ok.preco === Math.max(1, Math.round(KIT.preco * (1 - PECHINCHA_GANHO))) && ok.tela.includes(`◉ ${ok.antes} → ◉ ${ok.preco}`) && ok.pauta.acabou[0].includes(`◉ ${ok.preco}`) && ok.pauta.naoPode[0].includes(`◉ ${ok.preco}`));
  const ofende = oRegateioNaBanca("Regateio a corda", { ...base, d20: 1 });
  t("o 1 natural ofende: o preço sobe pela perda da tabela", !!ofende && ofende.registro.ajuste === 1 + PECHINCHA_PERDA && ofende.preco > ofende.antes);
  const igual = oRegateioNaBanca("Regateio a corda", { ...base, d20: 8 });
  t("8+2 contra 12: não se mexeu — o mesmo preço, e a frase diz que continua", !!igual && igual.preco === igual.antes && igual.pauta.acabou[0].includes("continua"));
  const banca = oRegateioNaBanca("Pechincho a espada curta", { ...base, d20: 20, precoDepois: (b, it, aj) => (b ? Math.round(it.preco * aj) - 1 : null) });
  t("a coisa da banca: a banca dela, e o número exato vem da conta do App (precoDepois)", !!banca && banca.id === "geral|1" && banca.preco === Math.round(40 * (1 - PECHINCHA_GANHO * 1.5)) - 1);
  /* 21/11 (§23): O REGATEIO SEM DADO — o degrau fixo da pechincha */
  const semDado = oRegateioNaBanca("Regateio a corda", { ...base, d20: null, dc: null, semDado: true });
  t("sem dado (o favor, o companheiro): o degrau fixo «aceitou baixar», o ganho da tabela", !!semDado && semDado.registro.ajuste === 1 - PECHINCHA_GANHO && semDado.registro.ok === true
    && semDado.registro.texto === O_REGATEIO_NA_BANCA.semDado.texto && semDado.preco === Math.max(1, Math.round(KIT.preco * (1 - PECHINCHA_GANHO))), JSON.stringify(semDado && semDado.registro));
  t("sem dado e sem a marca, nada (o d20 continua obrigatório no regateio que rolou)", oRegateioNaBanca("Regateio a corda", { ...base, d20: null }) === null);
  t("sem dado também é um por banca por dia", oRegateioNaBanca("Regateio a corda", { ...base, semDado: true, pechinchas: { balcao: { dia: 3, ajuste: 0.88 } } }) === null);
  t("sem dado só onde a frase é de preço", oRegateioNaBanca("Peço a corda emprestada", { ...base, semDado: true }) === null);
  t("uma por banca por dia, como no botão", oRegateioNaBanca("Regateio a corda", { ...base, d20: 15, pechinchas: { balcao: { dia: 3, ajuste: 0.88 } } }) === null
    && !!oRegateioNaBanca("Regateio a corda", { ...base, d20: 15, pechinchas: { balcao: { dia: 2, ajuste: 0.88 } } }));
  t("sem coisa na frase, a da frase anterior (o preço perguntado antes)", (oRegateioNaBanca("Faz mais barato?", { ...base, d20: 15, anterior: "Quanto custa a corda?" }) || {}).id === "balcao");
  t("sem coisa nenhuma, nada (não há preço que dizer)", oRegateioNaBanca("Faz mais barato?", { ...base, d20: 15 }) === null);
  t("a frase que não é de preço não é regateio", oRegateioNaBanca("Convenço a Brisa a me contar do porto", { ...base, d20: 15 }) === null);
  t("lixo: null", oRegateioNaBanca(null, base) === null && oRegateioNaBanca("Regateio a corda", { ...base, d20: 0 }) === null && oRegateioNaBanca("Regateio a corda", null) === null);
  t("o mesmo dado dá o mesmo preço (determinismo)", JSON.stringify(oRegateioNaBanca("Regateio a corda", { ...base, d20: 13 })) === JSON.stringify(oRegateioNaBanca("Regateio a corda", { ...base, d20: 13 })));
  const bp = balcaoComPechincha(BALCAO, ok.registro, 3);
  t("o balcão com a pechincha de hoje cobra o preço que a pauta disse", bp.find((x) => x.id === "kit").preco === ok.preco && bp !== BALCAO);
  t("sem registro, ou de outro dia, o MESMO balcão (a mesma lista)", balcaoComPechincha(BALCAO, null, 3) === BALCAO && balcaoComPechincha(BALCAO, ok.registro, 4) === BALCAO);
  t("e não muda o balcão recebido", BALCAO.find((x) => x.id === "kit").preco === KIT.preco);
}

sec("7. a procura na coisa de alguém");
{
  t("«nos cestos da banca de Brisa» é procurar nos cestos", procuraNaCoisaDeAlguem("Procuro nos cestos da banca de Brisa", "Brisa") === true);
  t("«a bolsa do Doran» também", procuraNaCoisaDeAlguem("Procuro a bolsa do Doran", "Doran") === true);
  t("«sinais de», «notícias de», «o paradeiro de» continuam a procurar gente",
    ["Procuro sinais de Brisa", "Busco notícias de Brisa", "Pergunto pelo paradeiro de Brisa"].every((f) => procuraNaCoisaDeAlguem(f, "Brisa") === false) && A_PROCURA_NA_COISA.deProcura.includes("paradeiro"));
  t("«procuro Brisa» é procura", procuraNaCoisaDeAlguem("Procuro Brisa", "Brisa") === false && procuraNaCoisaDeAlguem("", "Brisa") === false);
}

sec("8. a memória do inventado: o que o sistema acabou de negar não tem folga");
{
  const E = { personagem: { nome: "Herói", inventario: [], equipamento: [], grupo: [{ nome: "Tomé", inventario: ["Gazua"] }] } };
  const prosa = "Você pega a gazua de Tomé e a gira entre os dedos.";
  const sem = lembrarOInventado([], prosa, E, { turno: 5, cidade: "Vila", frase: "Arrombo com a gazua de Tomé" });
  t("sem a lista (a chave desligada): a régua de sempre — a gazua do grupo e da frase não morde", !sem.some((x) => x.especie === MEMORIA_DO_INVENTADO.especie));
  const com = lembrarOInventado([], prosa, E, { turno: 5, cidade: "Vila", frase: "Arrombo com a gazua de Tomé", semFolga: ["gazua"] });
  t("com a lista: a gazua que a ficha negou neste turno vira veto", com.some((x) => x.especie === MEMORIA_DO_INVENTADO.especie && /gazua/.test(x.linha)), JSON.stringify(com.map((x) => x.linha)));
  t("lista vazia é o mesmo que nenhuma", JSON.stringify(lembrarOInventado([], prosa, E, { turno: 5, cidade: "Vila", frase: "Arrombo com a gazua de Tomé", semFolga: [] })) === JSON.stringify(sem));
}

sec("9. o custo na pauta (o teto do prompt não cresce)");
{
  /* o pior caso: cinco nomes compridos, a coisa comprida, o ausente com onde, o regateio */
  const longos = { cena: { pessoas: Array.from({ length: 6 }, (_, i) => ({ nome: `Aldebrando Vasconcelos ${i}`, papel: "mercador de tecidos finos", estados: [] })), criaturas: [], coisas: [], cena: { estados: [] } },
    veredito: { tipo: "teste", id: "tranca", chave: "x" } };
  const pior = fichaDaCenaNaPauta({ frase: "Arrombo o cadeado de ferro da arca grande de carvalho escuro, sem ferramentas", momento: longos,
    ausente: { nome: "Doran Pé-de-Ferro Vasconcelos", onde: "a Forja Velha do Bairro do Porto", morto: false } });
  const reg = oRegateioNaBanca("Regateio o kit de viagem", { bancas: [], balcao: BALCAO, pechinchas: {}, dia: 3, d20: 20, bonus: 5, dc: 12 });
  const linhas = [...pior.acabou, ...pior.naoPode, ...reg.pauta.acabou, ...reg.pauta.naoPode];
  const custo = linhas.reduce((a, l) => a + l.length + 14, 0);
  const soFicha = [...pior.acabou, ...pior.naoPode].reduce((a, l) => a + l.length + 14, 0);
  console.log(`  (pior caso: ficha ${soFicha} caracteres; com o regateio ${custo}; linha de quem está ${pior.naoPode[0].length})`);
  t("o pior caso da ficha cabe numa fração do teto da pauta (≤ 40%)", soFicha <= TETO_DA_PAUTA * 0.4, soFicha);
  t("o comum (uma pessoa, uma banca, sem coisa): ≤ 300", (() => { const m = chamadoDoMomento("Olho em volta", leitura, retrato, {}); const p = fichaDaCenaNaPauta({ frase: "Olho em volta", momento: m, bancas: BANCAS }); return [...p.acabou, ...p.naoPode].reduce((a, l) => a + l.length + 14, 0) <= 300; })());
  /* numa pauta já cheia, o texto nunca passa do teto: o corte é o de sempre */
  let p = {};
  p = porNaPauta(p, "onde", "no Mercado das Redes, na Vila — " + "x".repeat(200));
  p = porNaPauta(p, "naoPode", ...pior.naoPode);
  p = porNaPauta(p, "acabou", ...pior.acabou);
  p = porNaPauta(p, "economia", "y".repeat(400));
  p = porNaPauta(p, "daqui", "z".repeat(300));
  const tx = textoDaPauta(p, { turno: 99999 });
  t("com a ficha, o texto da pauta continua ≤ TETO_DA_PAUTA", tx.length <= TETO_DA_PAUTA, tx.length);
  t("e os vetos da ficha chegam ao texto (o que cede é a decoração)", pior.naoPode.every((l) => tx.includes(l)) && !tx.includes("z".repeat(300)));
}

sec("10. a fiação no App (atrás da chave)");
{
  const app = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "src", "App.jsx"), "utf8");
  t("a ficha do turno só corre com o Mestre vivo, em calou", /try \{ fichaDaCenaNoTurno\(acao, momentoDoTurnoRef\.current\); \} catch \(e\) \{ calou\(/.test(app)
    && app.indexOf("fichaDaCenaNoTurno(acao, momentoDoTurnoRef.current)") > app.indexOf("if (mestreVivoLigado()) {\n      try {\n        momentoDoTurnoRef.current = null;"));
  t("a compra sem quem venda só com o Mestre vivo", /if \(!houveCompra && mestreVivoLigado\(\)\) \{/.test(app));
  t("o regateio só com o Mestre vivo, em calou", /if \(des && mestreVivoLigado\(\) && !combateRef\.current\) \{ try \{ aplicarORegateio\(r, valor, mod, dc\); \} catch/.test(app));
  t("a procura na coisa de alguém só com o Mestre vivo", /if \(!pp && mestreVivoLigado\(\)\) \{ try \{ if \(procuraNaCoisaDeAlguem\(acao, nome\)\) return false;/.test(app));
  t("a lista sem folga só vai à memória quando tem algo (e só o Mestre vivo a enche)", /\.\.\.\(\(semFolgaDoTurnoRef\.current \|\| \[\]\)\.length \? \{ semFolga: semFolgaDoTurnoRef\.current \} : \{\}\)/.test(app)
    && (app.match(/semFolgaDoTurnoRef\.current = \[\.\.\./g) || []).length === 3);
  t("o preço da banca é UMA conta (a de antes, num lugar só)", /const precoNaBancaAgora = \(precoCru, aj\) => Math\.max\(1, Math\.round\(precoDeCompraPara\(personagem, precoCru\) \* aj \* fatorDePreco\(leiRef\.current, cidadeMercado, diaRef\.current\)\)\);/.test(app)
    && /preco: precoNaBancaAgora\(it\.preco, aj\)/.test(app));
  t("o balcão e a compra do painel leem a mesma pechincha", /balcaoComPechincha\(balcaoDeMantimentos\(cid,/.test(app) && /balcaoComPechincha\(\[s0\], pechinchaDoBalcao\(\), diaRef\.current\)/.test(app));
  t("o registro do regateio é o do botão (mercado.pechinchas)", /pechinchas: \{ \.\.\.\(\(mercadoRef\.current \|\| \{\}\)\.pechinchas \|\| \{\}\), \[reg\.id\]: reg\.registro \}/.test(app));
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
