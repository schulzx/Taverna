/* teste-memoria-do-inventado.mjs (NE8, 13/11/2026) — a memória não guarda o inventado

   A Fase NE (mente/plano-nada-entra.md): fechar as portas tira o objeto
   inventado do estado, não da conversa. Na 19.ª sessão (mente/sessao-19.md
   §5, T16→T17) um teste de Prestidigitação passou, o sistema não deu item
   nenhum, a prosa deu «a chave mestra de ferro forjado», e no turno
   seguinte o Narrador abriu as celas com ela.

   A peça (src/motor/memoria-do-inventado.js) lê a narração do turno contra
   o que o sistema conhece e deixa no livro de vetos do Juiz uma linha para
   o turno seguinte. A régua desta suíte:
     1. a tabela: o objeto portátil, o cenário que nunca é item, a linha;
     2. os casos da 19.ª — os trechos gravados nas notas da sessão
        (scratchpad s19/notas.md e sessao-19.md §5), postos nas frases em que
        o Narrador os disse; a narração inteira não foi guardada — o que a
        guarda apanha e o que deixa passar de propósito;
     3. o portão morde só o necessário: cenário, fala, negação, a mão de
        outro, o herói que dá, o que o herói já tem, o que o jogador nomeou;
     4. o veto chega à pauta pelo canal do Juiz (secção vetoDoJuiz, NÃO PODE),
        no turno seguinte e quando a frase toca a coisa, e morre no prazo ou
        quando o sistema passa a conhecer o objeto;
     5. a medida nas sessões gravadas (8, 9, 10, 13 e a do navegador): uma
        mordida em 198 narrações, e ela tem razão;
     6. determinismo, imutabilidade, lixo. */
import { readFileSync, readdirSync } from "node:fs";
import { oInventadoDaProsa, lembrarOInventado, MEMORIA_DO_INVENTADO } from "../src/motor/memoria-do-inventado.js";
import { oQueOSistemaConhece, casaONome } from "../src/motor/cronista.js";
import { vetosParaAPauta, andarOsVetos, CORRECAO_DO_JUIZ } from "../src/motor/correcao-do-juiz.js";
import { porNaPauta, textoDaPauta, TETO_DA_PAUTA, SECOES } from "../src/pauta.js";
import { estadoNoTurno } from "../src/sessao.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const T = MEMORIA_DO_INVENTADO;
const nomes = (xs) => xs.map((x) => x.nome);
const sem = (s) => String(s).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

/* a 19.ª: Pipa Rabo-de-Junco (Halfling Ladina, Herborista), com Brunilda do
   Moinho; a quest do livro de registos da comarca, o sujeito de luvas
   cinzentas; Ribeira das Areias */
const S19 = () => ({
  personagem: { nome: "Pipa Rabo-de-Junco", inventario: ["Ferramentas de ladrão", { nome: "Adaga" }, "Ervas de cura", { nome: "Espada curta" }], grupo: [{ nome: "Brunilda do Moinho", inventario: [] }] },
  missoes: [{ id: "m1", status: "ativa", dador: "Margarida", etapas: [{ tipo: "achar", alvo: "Anselmo", item: "o livro de registos da comarca" }] }],
  espinha: { quests: { r: [{ papeis: { culpado: { nome: "o sujeito das luvas cinzentas", tipo: "pessoa" } } }] } },
  npcs: { Margarida: { nome: "Margarida" }, Anselmo: { nome: "Anselmo" }, Isolda: { nome: "Isolda do Moinho" } },
  cidadeAtual: "Ribeira das Areias", mapa: { cidades: [{ nome: "Ribeira das Areias" }] },
  lugar: { nome: "Cadeia do Pelourinho" },
});

sec("1. a tabela");
{
  t("congelada, com o porquê, a espécie, o prazo e o teto da linha", Object.isFrozen(T) && Object.isFrozen(T.objetos) && T.porque.length > 40 && T.especie === "objeto-inventado" && T.vida > CORRECAO_DO_JUIZ.vida && T.letras <= CORRECAO_DO_JUIZ.letras && T.porTurno <= CORRECAO_DO_JUIZ.guardados);
  t("o cenário fixo nunca é item: mesa, porta, lareira, cepo, baú… nenhum está nos objetos", T.cenario.every((c) => !(c in T.objetos)) && ["mesa", "porta", "lareira", "cepo", "bau"].every((c) => T.cenario.includes(c)));
  t("o que o sistema conta por número também não (moedas, tochas, rações, flechas)", ["moeda", "tocha", "racao", "flecha"].every((c) => T.cenario.includes(c) && !(c in T.objetos)));
  t("toda família só junta objetos da tabela", T.familias.every((f) => f.every((c) => c in T.objetos || c === "ferramenta")));
  t("a linha: infinitivo, o nome entre aspas, e o artigo do objeto", T.linha({ artigo: "a", nome: "chave mestra" }) === "pôr em jogo «a chave mestra»: não existe, o herói não a tem" && T.linha({ artigo: "as", nome: "luvas", plural: true }) === "pôr em jogo «as luvas»: não existem, o herói não as tem");
  t("o veto vai pela secção do Juiz (rótulo NÃO PODE), que já existe", SECOES.some((s) => s.id === "vetoDoJuiz" && s.rotulo === "NÃO PODE"));
}

sec("2. os casos da 19.ª — o que a guarda apanha");
{
  const E = S19();
  /* T16 · i=30: «surrupio o molho de chaves de cima do cepo e escondo na manga» → Prestidigitação 18 contra 15, SUCESSO; o sistema não dá item; a prosa dá «a chave mestra de ferro forjado» */
  const frase16 = "surrupio o molho de chaves de cima do cepo e escondo na manga";
  const t16 = "Num gesto só, você surrupia o molho de chaves de cima do cepo e o esconde na manga. Entre elas, seus dedos encontram a chave mestra de ferro forjado, mais pesada que as outras.";
  const a16 = oInventadoDaProsa(t16, E, { frase: frase16 });
  t("T16: «a chave mestra de ferro forjado» — o sistema não a deu, e a guarda apanha-a pelo nome curto", J(nomes(a16)) === J(["chave mestra"]) && a16[0].artigo === "a" && a16[0].como === "pega", J(a16));
  t("T16: o molho de chaves, que o JOGADOR nomeou, não é invenção do Narrador (é da escuta)", !nomes(a16).some((n) => /molho/.test(n)));
  t("…e sem a frase do jogador o molho também morde (a folga é só para o que ele disse)", J(nomes(oInventadoDaProsa(t16, E, {}))) === J(["molho de chaves", "chave mestra"]));
  /* as formas em que a prosa costuma dar o objeto */
  t("a posse direta: «Você pega a chave mestra… e a guarda no bolso»", J(nomes(oInventadoDaProsa("Você pega a chave mestra de ferro forjado e a guarda no bolso.", E))) === J(["chave mestra"]));
  t("o objeto na manga dele: «A chave mestra pesa agora na sua manga»", oInventadoDaProsa("A chave mestra de ferro forjado pesa agora na sua manga.", E)[0]?.como === "guarda");
  t("o objeto dado: «Margarida lhe entrega um anel»", oInventadoDaProsa("Margarida lhe entrega um anel de prata.", E)[0]?.como === "recebe");
  t("o dar com o clítico depois: «a carcereira estende-lhe um bilhete»", J(nomes(oInventadoDaProsa("A carcereira estende-lhe um bilhete dobrado.", E))) === J(["bilhete dobrado"]));
  t("o sujeito calado: «Você se aproxima do cepo. Pega o bilhete e o lê»", J(nomes(oInventadoDaProsa("Você se aproxima do cepo. Pega o bilhete dobrado e o lê.", E))) === J(["bilhete dobrado"]));
  t("o «tu» dispensa o sujeito: «Guardas o frasco no alforje»", J(nomes(oInventadoDaProsa("Guardas o frasco no alforje.", E))) === J(["frasco"]));
  /* T34 · i=73: a pista inventada num 20 natural de Medicina: «uma cunha de madeira… bota fina de montaria» */
  const t34 = "Ao estancar a ferida, você encontra uma cunha de madeira enfiada no batente, e a marca de uma bota fina de montaria no barro.";
  t("T34: «uma cunha de madeira» — pista que o sistema não plantou — é apanhada", J(nomes(oInventadoDaProsa(t34, E))) === J(["cunha"]));
}

sec("2b. os casos da 19.ª — o que passa DE PROPÓSITO");
{
  const E = S19();
  /* T18 · i=33: o baú de ferro revela «o canto carcomido de um fólio com o selo de cera que Margarida usava» e «o par de luvas cinzentas» */
  const t18 = "O cadeado cede com um estalo seco. Dentro do baú, sob uma laje solta, aparece o canto carcomido de um fólio com o selo de cera que Margarida usava, e o par de luvas cinzentas.";
  t("T18: o fólio passa — é o livro da quest com outro nome (a família do livro), e onde ele está é da busca (S19, defeito 2), não da memória", !nomes(oInventadoDaProsa(t18, E)).length);
  t("T18: as luvas cinzentas passam — o enredo conhece-as (o sujeito das luvas cinzentas)", !nomes(oInventadoDaProsa("Você pega o par de luvas cinzentas.", E)).length);
  t("…mas o mesmo fólio, num mundo sem a quest do livro, morde", J(nomes(oInventadoDaProsa("Você pega o fólio e o guarda na manga.", { ...E, missoes: [] }))) === J(["fólio"]));
  /* T34: a bota é a MARCA de uma bota — parte de outra coisa, não o objeto */
  t("T34: «a marca de uma bota» não é a bota (o objeto regido por preposição é lugar/parte, não coisa)", !nomes(oInventadoDaProsa("Você encontra a marca de uma bota no barro.", E)).length);
  /* a gazua de osso (T18, a frase do jogador) é das Ferramentas de ladrão */
  t("T18: a «gazua de osso» é das Ferramentas de ladrão que a Pipa já tem (a família)", !oInventadoDaProsa("Você tira a gazua de osso do bolso e pega a gazua com firmeza.", E).length);
  /* a folga paga: com uma Chave na bolsa, a chave mestra passa */
  t("o preço da folga, escrito: com uma «Chave» na bolsa, «a chave mestra» passa (a cabeça conhecida basta)", !oInventadoDaProsa("Você pega a chave mestra.", { ...E, personagem: { ...E.personagem, inventario: [{ nome: "Chave" }] } }).length);
}

sec("3. o portão morde só o necessário");
{
  const E = S19();
  const nada = (s, e = E, o = {}) => oInventadoDaProsa(s, e, o).length === 0;
  t("cenário fixo não é item: a mesa, a porta, a lareira, o cepo", nada("Você se apoia na mesa, pega a lamparina da lareira e abre a porta do cepo."));
  t("menção não é presença: o objeto numa fala («— Traga-me a chave mestra — diz a carcereira»)", nada("— Traga-me a chave mestra — diz a carcereira. — E não se demore."));
  t("…nem entre aspas", nada("Você ouve alguém gritar «pega o anel!» lá fora."));
  t("negado: «você procura, mas não encontra chave nenhuma»", nada("Você procura, mas não encontra chave nenhuma."));
  t("na mão de outro: «Você chama o guarda, que segura a chave da cela»", nada("Você chama o guarda, que segura a chave da cela."));
  t("…«Você observa enquanto Margarida pega o anel»", nada("Você observa enquanto Margarida pega o anel."));
  t("…«Sari, atrás de você, recolhe o cajado» (a 9.ª, T18 — «você» regido por preposição não é sujeito)", nada("Sari, atrás de você, recolhe o cajado com um movimento curto."));
  t("o herói que dá não recebe: «Você lhe entrega o anel»", nada("Você lhe entrega o anel de prata."));
  t("o que ele já tem, com outro adjetivo: «a adaga curta» de quem tem uma Adaga", nada("Você pega a adaga curta e avança."));
  t("…ou com outro nome da mesma coisa: o punhal de quem tem uma Adaga", nada("Você empunha o punhal."));
  t("as moedas e a tocha (o sistema conta-as por número)", nada("Você embolsa as moedas e pega a tocha da parede."));
  t("o «dá» que é preposição: «a chave da porta» não é «dar a chave»", nada("Margarida fala da chave da porta."));
  t("a chave da masmorra, quando a masmorra diz que o herói a achou", nada("Você guarda a chave no cinto e sobe.", { ...E, masmorra: { nome: "Forte", chave: true } }) && !nada("Você guarda a chave no bolso e sobe.", { ...E, masmorra: { nome: "Forte", chave: false } }));
  t("o saque do turno, que quem chama passa", nada("Você guarda o amuleto de osso.", E, { saque: ["Amuleto de osso"] }) && !nada("Você guarda o amuleto de osso.", E));
  t("a carta da abertura (a razão que o herói traz é do sistema: abertura.js)", nada("A carta está no seu bolso, dobrada.", { ...E, abertura: { razao: "uma carta sem assinatura chamou-o a Ribeira das Areias" } }) && !nada("A carta está no seu bolso, dobrada.", E));
  t("o livro de factos: o que alguém deu ao herói (recebeu) passa", nada("Você guarda o anel de prata.", { ...E, factos: { pessoas: { p1: { nome: "Pipa Rabo-de-Junco", recebeu: [{ nome: "Anel de prata" }] } } } }));
  t("a régua do conhecido é a do cânone (oQueOSistemaConhece + casaONome)", oQueOSistemaConhece(E).objeto.includes("adaga") && casaONome("o livro de registos da comarca", oQueOSistemaConhece(E).objeto, false));
}

sec("4. o veto chega à pauta, e morre na hora");
{
  const E = S19();
  const frase16 = "surrupio o molho de chaves de cima do cepo e escondo na manga";
  const t16 = "Num gesto só, você surrupia o molho de chaves e o esconde na manga. Entre elas, seus dedos encontram a chave mestra de ferro forjado.";
  const velho = { especie: "preco-contra-a-mesa", alvo: "preco:pao", linha: "dar a «pão» outro preço que não ◉ 2 (o 5 não vale)", toques: ["pao"], turno: 15, ate: 18, cidade: "Ribeira das Areias" };
  const vivos = Object.freeze([Object.freeze(velho)]);
  const L = lembrarOInventado(vivos, t16, E, { turno: 16, cidade: "Ribeira das Areias", frase: frase16 });
  const v = L.find((x) => x.especie === T.especie);
  t("o livro guarda o veto do Juiz que já lá estava e soma o da chave mestra", L.length === 2 && L[0].alvo === "preco:pao" && !!v);
  t("o veto tem a forma de um veto do Juiz (especie, alvo, linha, toques, turno, ate, cidade)", v && J(Object.keys(v).sort()) === J(["alvo", "ate", "cidade", "especie", "linha", "toques", "turno"]) && v.turno === 16 && v.ate === 16 + T.vida && v.cidade === "");
  t("a linha é a da tabela: «pôr em jogo «a chave mestra»: não existe, o herói não a tem»", v && v.linha === "pôr em jogo «a chave mestra»: não existe, o herói não a tem");
  /* T17 · i=31: «desço até a porta das celas. apalpo a fechadura atrás de alguma armadilha… e desarmo» — não fala da chave, e o Narrador abriu com ela */
  const p17 = vetosParaAPauta(L, { turno: 17, cidade: "Ribeira das Areias", frase: "desço até a porta das celas, apalpo a fechadura atrás de alguma armadilha e desarmo o que achar" });
  t("T17: no turno logo a seguir o veto entra, mesmo sem a frase falar da chave", p17.includes(v.linha));
  const p = porNaPauta({}, "vetoDoJuiz", ...p17);
  const txt = textoDaPauta(p, { turno: 17 });
  t("…e na pauta sai sob NÃO PODE, dentro do teto", txt.includes("NÃO PODE") && txt.includes("«a chave mestra»") && txt.length <= TETO_DA_PAUTA);
  t("dois turnos depois só volta se a frase tocar a coisa («abro o baú com a chave»)", !vetosParaAPauta(L, { turno: 19, cidade: "Ribeira das Areias", frase: "olho em volta" }).includes(v.linha) && vetosParaAPauta(L, { turno: 19, cidade: "Ribeira das Areias", frase: "abro o baú com a chave" }).includes(v.linha));
  t("…e noutra cidade também (o objeto não é de uma cidade)", vetosParaAPauta(L, { turno: 20, cidade: "Gelo Fundo", frase: "uso a chave mestra" }).includes(v.linha));
  t("passado o prazo, sai do livro", !lembrarOInventado(L, "", E, { turno: 16 + T.vida + 1, cidade: "Ribeira das Areias" }).some((x) => x.especie === T.especie));
  const E2 = { ...E, personagem: { ...E.personagem, inventario: [...E.personagem.inventario, { nome: "Chave mestra" }] } };
  t("quando o sistema passa a conhecer o objeto (a busca achou-o), o veto sai já", !lembrarOInventado(L, "Você olha em volta.", E2, { turno: 17, cidade: "Ribeira das Areias" }).some((x) => x.especie === T.especie));
  t("no máximo `porTurno` vetos novos por narração", lembrarOInventado([], "Você pega o anel, o colar, o broche e o frasco.", E, { turno: 3 }).filter((x) => x.especie === T.especie).length === T.porTurno);
  t("os vetos do Juiz andam como andavam (o livro é o mesmo andarOsVetos)", J(lembrarOInventado(vivos, "Você olha em volta.", E, { turno: 16, cidade: "Ribeira das Areias" })) === J(andarOsVetos(vivos, [], { turno: 16, cidade: "Ribeira das Areias" })));
}

sec("5. a medida nas sessões gravadas");
{
  const D = new URL(".", import.meta.url);
  let turnos = 0;
  const mordidas = [];
  for (const f of readdirSync(D).filter((x) => /^sessao-.*\.json$/.test(x)).sort()) {
    let A; try { A = JSON.parse(readFileSync(new URL(f, D), "utf8")); } catch { continue; }
    if (!Array.isArray(A.turnos)) continue;
    A.turnos.forEach((L, i) => {
      const nar = L && L.narrador && L.narrador.narrativa;
      if (typeof nar !== "string" || !nar.trim()) return;
      let e; try { e = estadoNoTurno(A, i + 1); } catch { e = {}; }
      turnos++;
      for (const o of oInventadoDaProsa(nar, e, { frase: (L.entrada && L.entrada.frase) || "" })) mordidas.push({ f, i: i + 1, o });
    });
  }
  /* a única: a abertura da 10.ª põe «a carta» no bolso do herói, e o save
     dessa sessão não tem `abertura` (é de antes da MM13); hoje a razão da
     abertura traz a carta e ela passaria (secção 3). É mordida certa pelo
     estado que o jogo tinha. */
  t(`${turnos} narrações gravadas, uma mordida só — a carta da abertura da 10.ª, que aquele save não tinha`, turnos >= 190 && mordidas.length === 1 && mordidas[0].f === "sessao-s10.json" && mordidas[0].i === 1 && sem(mordidas[0].o.nome) === "carta", J(mordidas.map((m) => `${m.f}#${m.i} ${m.o.nome}`)));
}

sec("6. determinismo, imutabilidade, lixo");
{
  const E = S19();
  const t16 = "Seus dedos encontram a chave mestra de ferro forjado.";
  t("a mesma prosa e o mesmo estado dão o mesmo veredito", J(oInventadoDaProsa(t16, E)) === J(oInventadoDaProsa(t16, S19())));
  const congelado = JSON.parse(J(E));
  const vivos = [{ especie: T.especie, alvo: "objeto:anel", linha: "x", toques: ["anel"], turno: 1, ate: 9, cidade: "" }];
  const vJ = J(vivos);
  lembrarOInventado(vivos, t16, E, { turno: 2 });
  t("não muta o estado nem o livro recebidos", J(E) === J(congelado) && J(vivos) === vJ);
  let estourou = "";
  try {
    for (const n of [null, undefined, 3, "", "   ", {}, []]) for (const e of [null, undefined, 3, "x", [], {}, { personagem: null, masmorra: null, abertura: 7 }]) {
      oInventadoDaProsa(n, e, null); lembrarOInventado(null, n, e, null); lembrarOInventado([null, 3, "x", { especie: T.especie }], n, e, { turno: "x" });
    }
  } catch (x) { estourou = String(x && x.message); }
  t("nenhum lixo estoura (a prosa, o estado, o livro, o contexto)", !estourou, estourou);
  t("prosa vazia não morde nada; estado vazio ainda julga (o jogo novo)", oInventadoDaProsa("", E).length === 0 && J(nomes(oInventadoDaProsa("Você pega o anel.", null))) === J(["anel"]));
}

console.log(`\na memória do inventado (NE8): ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
