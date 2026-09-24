/* A MARCA DA PORTA (R21)

   Um disco de 16px no retrato da cinta que avisa "há algo no acervo que
   você ainda não abriu". `mente/formas.md`, "### R21 · a fabricação" §4
   e "### R21 · o jogo" §§3-4.

   A REGRA QUE ESTA SUÍTE PROTEGE, em duas frases: a marca é para o que
   ENTROU SEM O JOGADOR TER IDO LÁ, e ela é RARA de propósito — não
   acende o que a tela principal já mostra, nem o que a prosa já abriu
   com porta própria. Um "quase tudo acende" é tão inútil quanto "nada
   acende": as duas viram papel de parede. */

const S = "../src/";
const M = await import(S + "marca-da-porta.js");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

/* helpers para montar retratos sem repetir fotoDoAcervo em cada seção */
const foto = (o) => M.fotoDoAcervo(o);
const vazio = () => foto({});

sec("1. fotoDoAcervo — o retrato, e o que `null`/vazio não quebra");
{
  t("sem argumento nenhum não estoura", JSON.stringify(M.fotoDoAcervo()) === JSON.stringify(vazio()));
  /* a lei da casa: `= {}` no destructuring NÃO cobre `null` */
  t("com `null` também não estoura", JSON.stringify(M.fotoDoAcervo(null)) === JSON.stringify(vazio()));
  const f = foto({
    missoes: [{ id: "m1", status: "ativa" }, { id: "m2", status: "concluida" }],
    itens: ["tocha", "tocha", "corda"],
    correio: { recebidas: [{ id: "c1" }, { id: "c2" }] },
    grupo: [{ nome: "Aria" }],
    destinos: [{ nome: "Vale" }, { nome: "Ermo", descoberta: false }],
  });
  t("missões por id+status, não pelas etapas", f.missoes.m1 === "ativa" && f.missoes.m2 === "concluida");
  t("itens por nome+contagem", f.itens.tocha === 2 && f.itens.corda === 1);
  t("correio por id", f.correio.includes("c1") && f.correio.includes("c2"));
  t("grupo por nome", f.grupo.includes("Aria"));
  t("destino velado (descoberta:false) não entra no retrato", f.destinos.includes("Vale") && !f.destinos.includes("Ermo"));
  /* item cru como string OU como objeto — a bolsa do App aceita as duas */
  const f2 = foto({ itens: [{ nome: "lamparina" }, { nome: "lamparina" }] });
  t("item como objeto conta igual a string", f2.itens.lamparina === 2);
  /* lixo em cada campo não derruba o retrato */
  const f3 = foto({ missoes: "lixo", itens: null, correio: 3, grupo: {}, destinos: undefined });
  t("lixo em qualquer campo vira retrato vazio, nunca erro", JSON.stringify(f3) === JSON.stringify(vazio()));
}

sec("2. DIÁRIO — entra, conclui ou falha; etapa cumprida não conta");
{
  const antes = foto({ missoes: [{ id: "m1", status: "ativa" }] });
  const entrou = foto({ missoes: [{ id: "m1", status: "ativa" }, { id: "m2", status: "oferecida" }] });
  const concluiu = foto({ missoes: [{ id: "m1", status: "concluida" }] });
  const falhou = foto({ missoes: [{ id: "m1", status: "falhada" }] });
  const mesmoEstado = foto({ missoes: [{ id: "m1", status: "ativa" }] });
  t("missão nova acende Diário", M.marcasQueAcendem(antes, entrou).includes("diario"));
  t("concluir acende Diário", M.marcasQueAcendem(antes, concluiu).includes("diario"));
  t("falhar acende Diário", M.marcasQueAcendem(antes, falhou).includes("diario"));
  t("mesmo status não acende nada", M.marcasQueAcendem(antes, mesmoEstado).length === 0);
  /* a razão de a foto guardar só id+status: uma etapa interna da missão
     progride sem o status mudar, e "etapa cumprida" não deve acender —
     a linha 🧭 da prosa já diz isso */
  t("nada muda quando só a foto repete (etapa é invisível a este retrato)",
    !M.marcasQueAcendem(antes, foto({ missoes: [{ id: "m1", status: "ativa" }] })).includes("diario"));
}

sec("3. BOLSA — item novo ou quantidade que sobe; moedas não moram aqui");
{
  const antes = foto({ itens: ["tocha"] });
  const chegou = foto({ itens: ["tocha", "corda"] });
  const subiu = foto({ itens: ["tocha", "tocha"] });
  const igual = foto({ itens: ["tocha"] });
  t("item novo acende Bolsa", M.marcasQueAcendem(antes, chegou).includes("inv"));
  t("quantidade subindo acende Bolsa", M.marcasQueAcendem(antes, subiu).includes("inv"));
  t("mesma bolsa não acende", !M.marcasQueAcendem(antes, igual).includes("inv"));
  /* moedas não entram no retrato — não há campo pra elas em fotoDoAcervo,
     e por isso não podem acender a Bolsa nem confundir a régua */
  t("fotoDoAcervo não tem campo de moeda", !("moedas" in vazio()));
}

sec("4. GESTÃO — carta nova no correio, ou o grupo mudando");
{
  const antes = foto({ correio: { recebidas: [{ id: "c1" }] }, grupo: [{ nome: "Aria" }] });
  const cartaNova = foto({ correio: { recebidas: [{ id: "c1" }, { id: "c2" }] }, grupo: [{ nome: "Aria" }] });
  const entrouGente = foto({ correio: { recebidas: [{ id: "c1" }] }, grupo: [{ nome: "Aria" }, { nome: "Bram" }] });
  const saiuGente = foto({ correio: { recebidas: [{ id: "c1" }] }, grupo: [] });
  const nadaMudou = foto({ correio: { recebidas: [{ id: "c1" }] }, grupo: [{ nome: "Aria" }] });
  t("carta nova acende Gestão", M.marcasQueAcendem(antes, cartaNova).includes("gestao"));
  t("alguém entrando no grupo acende Gestão", M.marcasQueAcendem(antes, entrouGente).includes("gestao"));
  t("alguém saindo do grupo também acende", M.marcasQueAcendem(antes, saiuGente).includes("gestao"));
  t("nada mudando não acende", !M.marcasQueAcendem(antes, nadaMudou).includes("gestao"));
}

sec("5. MAPA — destino novo; o lugar atual nunca acende (6 em 21 no censo)");
{
  const antes = foto({ destinos: [{ nome: "Vale" }] });
  const novoDestino = foto({ destinos: [{ nome: "Vale" }, { nome: "Porto" }] });
  const mesmoMapa = foto({ destinos: [{ nome: "Vale" }] });
  t("destino novo acende Mapa", M.marcasQueAcendem(antes, novoDestino).includes("mapa"));
  t("nada novo não acende", !M.marcasQueAcendem(antes, mesmoMapa).length || !M.marcasQueAcendem(antes, mesmoMapa).includes("mapa"));
  /* o LUGAR (onde o herói está agora) não tem campo em fotoDoAcervo — só
     os destinos CONHECIDOS têm, e por isso o lugar não pode acender */
  t("fotoDoAcervo não tem campo de lugar atual", !("lugar" in vazio()));
}

sec("6. ORIGEM=ALFORJE — nada acende, mesmo que tudo mude");
{
  const antes = vazio();
  const tudoMudou = foto({
    missoes: [{ id: "m1", status: "concluida" }],
    itens: ["espada"],
    correio: { recebidas: [{ id: "c1" }] },
    grupo: [{ nome: "Aria" }],
    destinos: [{ nome: "Vale" }],
  });
  t("com origem alforje, nada acende", M.marcasQueAcendem(antes, tudoMudou, { origem: "alforje" }).length === 0);
  t("sem a origem, o mesmo par acenderia tudo", M.marcasQueAcendem(antes, tudoMudou).length === 4);
  t("origem que não é \"alforje\" não corta nada", M.marcasQueAcendem(antes, tudoMudou, { origem: "prosa" }).length === 4);
}

sec("7. abaDaPorta — para onde a porta abre");
{
  t("sem marca nenhuma, abre em `gestao` (a Ficha mora lá)", M.abaDaPorta([]) === "gestao");
  t("lixo vira `gestao` também", M.abaDaPorta(null) === "gestao" && M.abaDaPorta(undefined) === "gestao");
  t("com uma marca, abre nela", M.abaDaPorta(["diario"]) === "diario");
  /* a MAIS RECENTE é a ÚLTIMA da lista — nunca "a última aba visitada",
     que o censo do `jogo` mediu como 0 de 3 acertos */
  t("com várias, abre na mais recente (a última)", M.abaDaPorta(["diario", "inv", "mapa"]) === "mapa");
  t("entradas que não são string são ignoradas", M.abaDaPorta(["diario", 7, null, "mapa"]) === "mapa");
}

sec("8. nomeDaPorta — o nome acessível, e a frase exata de `formas.md`");
{
  t("sem marca, só \"A ficha\"", M.nomeDaPorta([], M.ROTULOS_DA_PORTA) === "A ficha");
  t("sem marca nem rótulos, idem", M.nomeDaPorta(null, null) === "A ficha");
  /* a frase por extenso que `formas.md` §4 escreve: "A ficha" → "A ficha
     — há novo no diário" */
  t("com diário, a frase exata de formas.md",
    M.nomeDaPorta(["diario"], M.ROTULOS_DA_PORTA) === "A ficha — há novo no diário");
  t("com bolsa", M.nomeDaPorta(["inv"], M.ROTULOS_DA_PORTA) === "A ficha — há novo na bolsa");
  t("com gestão", M.nomeDaPorta(["gestao"], M.ROTULOS_DA_PORTA) === "A ficha — há novo na gestão");
  t("com mapa", M.nomeDaPorta(["mapa"], M.ROTULOS_DA_PORTA) === "A ficha — há novo no mapa");
  t("a mais recente é quem nomeia", M.nomeDaPorta(["diario", "mapa"], M.ROTULOS_DA_PORTA) === "A ficha — há novo no mapa");
  t("uma aba sem rótulo conhecido cai para \"A ficha\"", M.nomeDaPorta(["desconhecida"], M.ROTULOS_DA_PORTA) === "A ficha");
}

sec("9. MARCA_ACENDE — a tabela se explica, como `abas.js` já exige da sua");
{
  t("toda linha tem um porquê escrito", MARCA_TEM_PORQUE());
  t("toda linha sabe dizer se mudou", MARCA_TEM_MUDOU());
  t("as quatro abas do censo estão todas na tabela",
    ["diario", "inv", "gestao", "mapa"].every((id) => M.MARCA_ACENDE.some((r) => r.id === id)));
  t("e nenhuma outra — a marca só existe para estas quatro", M.MARCA_ACENDE.length === 4);
  /* uma regra que estoura não pode acender uma marca errada nem derrubar
     o turno — a mesma lei de `abas.js` para `quando` */
  const regraQuebrada = { id: "diario", porque: "x", mudou: () => { throw new Error("boom"); } };
  const semQuebrar = () => M.marcasQueAcendem(vazio(), vazio());
  t("uma regra da tabela real nunca estoura com fotos vazias", (() => { try { semQuebrar(); return true; } catch { return false; } })());
  function MARCA_TEM_PORQUE() { return M.MARCA_ACENDE.every((r) => typeof r.porque === "string" && r.porque.length > 12); }
  function MARCA_TEM_MUDOU() { return M.MARCA_ACENDE.every((r) => typeof r.mudou === "function"); }
  void regraQuebrada; /* documental: mostra a forma de uma regra ruim sem precisar montá-la na tabela real */
}

sec("10. DETERMINISMO — mesma entrada, mesma saída, sempre");
{
  const antes = foto({ missoes: [{ id: "m1", status: "ativa" }] });
  const depois = foto({ missoes: [{ id: "m1", status: "concluida" }] });
  const r1 = M.marcasQueAcendem(antes, depois);
  const r2 = M.marcasQueAcendem(antes, depois);
  t("duas chamadas iguais devolvem a mesma coisa", JSON.stringify(r1) === JSON.stringify(r2));
  /* imutabilidade: comparar duas vezes não pode ter mudado a foto */
  t("comparar não muta os retratos", JSON.stringify(foto({ missoes: [{ id: "m1", status: "ativa" }] })) === JSON.stringify(antes));
}

console.log(`\nmarca-da-porta v1: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
