/* AS ABAS QUE AINDA NÃO IMPORTAM (v9.148)

   Um herói de nível 1, no primeiro dia, abria a Gestão e via dez
   sub-abas. Sete delas não tinham nada dentro, e duas descreviam um jogo
   que ele alcançaria vinte horas depois.

   O problema não era espaço, era PROMESSA: uma aba visível diz "há algo
   aqui", e sete abas vazias ensinam o jogador a não confiar na barra.
   Depois disso, a que enche não é notada.

   O QUE ESTA SUÍTE PROTEGE é a regra que sustenta o resto:

     PORTA QUE ABRE NÃO FECHA.

   A tentação permanente é mostrar cada aba enquanto ela tem conteúdo —
   Mercado só na cidade, Mural só onde há mural. Seria mais "limpo" e
   seria pior: uma barra que muda de tamanho a cada cena não pode ser
   aprendida. O jogador procura a Guilda onde ela estava, não acha, e o
   que ele conclui não é "saí da cidade" — é "o jogo comeu a minha
   guilda". Se alguém um dia trocar o gatilho por um estado, é aqui que
   isso trava. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const A = await import(S + "abas.js");
const APP = readFileSync("../src/App.jsx", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

/* o herói do primeiro dia: nada aconteceu ainda */
const ZERO = {
  nivel: 1, pontos: 0, conhecidos: 0, temBanca: false, naCasa: false, casasConhecidas: 0,
  dominios: 0, podeTomar: false, potencias: 0, cartas: 0, temMural: false, conquistas: 0, descobertas: 0,
  casaAqui: false, temFaccao: false,
};

sec("1. O PRIMEIRO DIA MOSTRA O PERSONAGEM, E MAIS NADA");
{
  const abertas = A.subsAbertas([], ZERO).map((s) => s.id);
  t("só Ficha e Grupo", abertas.join(",") === "ficha,grupo");
  t("Domínios não aparece", !abertas.includes("dominios"));
  t("Diplomacia não aparece", !abertas.includes("diplomacia"));
  t("Correio não aparece", !abertas.includes("correio"));
  t("Guilda não aparece", !abertas.includes("guilda"));
  t("o Códex também não", !A.estaAberta("codex", [], ZERO));
  /* esconder Ficha ou Grupo seria esconder o personagem */
  t("Ficha é `sempre`", A.estaAberta("ficha", [], ZERO));
  t("Grupo é `sempre`", A.estaAberta("grupo", [], ZERO));
}

sec("2. CADA PORTA TEM UM GATILHO, E ELE É O CERTO");
{
  const so = (campo, valor) => A.subsAbertas([], { ...ZERO, [campo]: valor }).map((s) => s.id);
  /* MEDIR O QUE O JOGADOR ENCONTROU, E NÃO O QUE O MUNDO TEM. Quatro casas
     existirem não é o mesmo que haver uma porta na cidade onde estou. */
  t("quatro casas no mundo NÃO abrem Guilda", !so("casasConhecidas", 4).includes("guilda"));
  t("ser membro abre", so("naCasa", true).includes("guilda"));
  t("conhecer alguém abre Pessoas", so("conhecidos", 1).includes("pessoas"));
  t("ter ponto para gastar abre Talentos", so("pontos", 1).includes("talentos"));
  t("e o nível 2 também", so("nivel", 2).includes("talentos"));
  t("uma banca abre Mercado", so("temBanca", true).includes("mercado"));
  t("uma casa com sede aqui abre Guilda", so("casaAqui", true).includes("guilda"));
  t("ter domínio abre Domínios", so("dominios", 1).includes("dominios"));
  t("poder tomar um também", so("podeTomar", true).includes("dominios"));
  t("uma carta abre Correio", so("cartas", 1).includes("correio"));
  t("um mural abre Mural", so("temMural", true).includes("mural"));
  /* COM UMA POTÊNCIA SÓ NÃO HÁ POLÍTICA: HÁ UM VIZINHO. */
  t("uma potência NÃO abre Diplomacia", !so("potencias", 1).includes("diplomacia"));
  /* A PROVA NO JOGO PEGOU ISTO: o mundo nasce com as potências prontas, então
     contar só quantas existem abria a aba no primeiro segundo do primeiro dia.
     Precisa das duas coisas: haver com quem falar, E eu ser parte de algo. */
  t("duas potências sozinhas NÃO bastam", !A.subsAbertas([], { ...ZERO, potencias: 5 }).map((s) => s.id).includes("diplomacia"));
  t("nem pertencer a algo sozinho", !so("temFaccao", true).includes("diplomacia"));
  t("as duas juntas abrem", A.subsAbertas([], { ...ZERO, potencias: 2, temFaccao: true }).map((s) => s.id).includes("diplomacia"));
  t("uma conquista abre o Códex", A.estaAberta("codex", [], { ...ZERO, conquistas: 1 }));
  t("uma descoberta também", A.estaAberta("codex", [], { ...ZERO, descobertas: 1 }));
}

sec("3. PORTA QUE ABRE NÃO FECHA — a regra inteira");
{
  /* entra na cidade: o Mercado abre */
  const naCidade = A.abrir([], { ...ZERO, temBanca: true });
  t("a banca abriu o Mercado", naCidade.includes("mercado"));
  /* sai da cidade: a banca some, a ABA não */
  const noErmo = A.abrir(naCidade, ZERO);
  t("longe da cidade, a aba continua", noErmo.includes("mercado"));
  t("e nada foi removido", noErmo.length >= naCidade.length);
  /* a leitura concorda com o registro */
  t("`estaAberta` respeita o que já abriu", A.estaAberta("mercado", noErmo, ZERO));
  /* e não existe caminho que remova: a função é uma união, e só */
  const tudo = A.abrir(A.TODAS_AS_PORTAS, ZERO);
  t("nem partindo de tudo aberto", tudo.length === A.TODAS_AS_PORTAS.length);
  /* a mesma entrada duas vezes não duplica */
  t("abrir duas vezes não duplica", A.abrir(naCidade, { ...ZERO, temBanca: true }).length === naCidade.length);
}

sec("4. A ABA APARECE DIZENDO POR QUÊ");
{
  const antes = A.abrir([], ZERO);
  const depois = A.abrir(antes, { ...ZERO, cartas: 1, potencias: 2, temFaccao: true });
  const novas = A.novidades(antes, depois);
  t("o gatilho devolve o que mudou", novas.sort().join(",") === "correio,diplomacia");
  t("e nada quando nada muda", A.novidades(depois, depois).length === 0);
  /* uma aba que aparece calada é uma aba que ninguém nota: o jogador está
     olhando a narrativa, não a barra */
  for (const id of [...A.TODAS_AS_PORTAS]) {
    const f = A.falaDaNovidade(id);
    t(`"${id}" tem uma frase própria`, f.length > 12 && !/há o que ver ali/.test(f));
  }
}

sec("5. TODA PORTA SE EXPLICA — e é isto que impede a próxima de nascer torta");
{
  const semPorque = [...A.SUBS_GESTAO, ...A.ABAS_COM_PORTA].filter((a) => !a.sempre && !a.porque);
  t(`toda porta tem um porquê escrito (${semPorque.map((x) => x.id).join(", ") || "—"})`, semPorque.length === 0);
  const semQuando = [...A.SUBS_GESTAO, ...A.ABAS_COM_PORTA].filter((a) => !a.sempre && typeof a.quando !== "function");
  t("e uma condição de verdade", semQuando.length === 0);
  /* uma condição que estoura não pode derrubar a barra inteira */
  t("condição que estoura não quebra", A.subsAbertas([], null).length >= 2);
  t("nem `abrir` com lixo", Array.isArray(A.abrir(null, null)));
  t("nem `estaAberta` com lixo", A.estaAberta("mercado", null, null) === false);
  /* aba sem porta é aba aberta: quem não está no catálogo não é escondido
     por engano */
  t("id desconhecido conta como aberto", A.estaAberta("bolsa", [], ZERO) === true);
}

sec("6. A ORDEM DENTRO DO SALVAR — o defeito que a prova no jogo pegou");
{
  /* O gatilho rodava DEPOIS de o objeto `dados` ser montado — e `dados`
     carrega `abasAbertas: abasAbertasRef.current`. A aba abria, era
     anunciada na tela, e o save gravado naquele MESMO instante ainda dizia
     `[]`: na recarga ela voltava fechada e era anunciada de novo.

     Tela certa e save errado é o defeito mais difícil de notar, porque
     tudo o que se vê está correto. A ordem é o conserto inteiro, e ela
     não aparece em nenhuma asserção de comportamento — só nesta. */
  const iSalvar = APP.indexOf("const salvar = useCallback");
  const iConfere = APP.indexOf("conferirAbas();", iSalvar);
  const iDados = APP.indexOf("const dados = {", iSalvar);
  t("o gatilho roda dentro do salvar", iConfere > iSalvar);
  t("e ANTES de o save ser montado", iConfere < iDados);
  /* e ao carregar ele sincroniza CALADO: `estaAberta` mostra a aba assim
     que a condição vale, então ao abrir uma campanha algumas já estão na
     tela — anunciá-las seria dar notícia do que o jogador vê há dez
     minutos. */
  t("ao carregar, sincroniza calado", /conferirAbas\(\{ calado: true \}\)/.test(APP));
  t("e o gatilho sabe se calar", /const conferirAbas = \(\{ calado = false \} = \{\}\) =>/.test(APP));
  /* a frase segue o gatilho: enquanto a condição da Guilda era "existem
     casas no mundo", a frase dizia isso — e mentiu no instante em que o
     gatilho virou "há uma sede aqui" */
  t("a frase da Guilda fala da sede daqui", /sede aqui/.test(A.falaDaNovidade("guilda")));
  t("e não do mundo", !/neste mundo/.test(A.falaDaNovidade("guilda")));
}

sec("7. A COSTURA NO APP");
{
  t("o catálogo saiu do App", !/const SUBS_GESTAO = \[\{ id: "ficha"/.test(APP));
  t("e a barra usa o filtro", /subsAbertas\(abasAbertas, estadoDasAbas\)/.test(APP));
  /* PainelLateral é função à parte: nada de dentro de Taverna existe no
     escopo dela — já derrubou o painel duas vezes nesta base */
  t("`abasAbertas` entra por prop", /function PainelLateral\(\{ abasAbertas = \[\], estadoDasAbas = \{\}/.test(APP));
  t("e o estado raso também, já calculado", /estadoDasAbas=\{estadoDasAbas\(\)\}/.test(APP));
  /* o gatilho mora no único ponto por onde todo caminho que muda o jogo
     passa — a mesma razão pela qual a publicação do estado da sala mora lá */
  t("o gatilho é conferido no salvar", /try \{ conferirAbas\(\); \} catch/.test(APP));
  t("o que abriu atravessa a recarga", /abasAbertas: abasAbertasRef\.current,/.test(APP));
  /* SAVE ANTIGO ABRE TUDO: quem já jogava tinha as dez na tela, e
     escondê-las agora seria tirar o que ele já usava */
  t("save antigo abre tudo", /TODAS_AS_PORTAS\.slice\(\)/.test(APP));
  /* uma sub-aba selecionada apontando para porta fechada abriria um
     conteúdo sem aba na barra, e isso lê como quebrado */
  t("a selecionada cai para a Ficha se fechou", /abertasAqui\.some\(\(s\) => s\.id === subEscolhida\) \? subEscolhida : "ficha"/.test(APP));
  t("o Códex de cima tem porta", /a\.id !== "codex" \|\| codexAberto/.test(APP));
}

console.log(`\nabas v9.148: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
