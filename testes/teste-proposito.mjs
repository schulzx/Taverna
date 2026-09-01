/* O PROPÓSITO ACONTECE (v9.137)

   A v9.136 deu a cada pessoa um plano secreto com condição de maturação, e
   o ator passou a saber que "a hora chegou" — mas NADA no mundo mudava. Um
   propósito que amadurece sem consequência é a mesma etiqueta de antes,
   agora com data: o jogador lê a promessa e nunca vê o pagamento.

   Esta suíte defende que quem faz acontecer seja o MESTRE, e que ele nunca
   prometa o que não pode entregar. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const semCom = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semCom(readFileSync("../src/App.jsx", "utf8"));
const I = await import(S + "indole.js");
const B = await import(S + "mundo-base.js");
const { SECOES } = await import(S + "pauta.js");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

/* acha alguém, no mundo determinístico, cujo propósito seja o pedido */
const comProposito = (qual) => {
  for (let i = 0; i < 4000; i++) {
    const p = { nome: `Pessoa ${i}`, relevancia: "arco" };
    const ind = I.indoleDe("semente-de-prova", p);
    if (ind.proposito === qual) return { p, ind };
  }
  return null;
};

sec("1. TODO PROPÓSITO SABE VIRAR ATO");
{
  t("nenhum propósito ficou sem efeito", I.PROPOSITOS.every((x) => x.efeito && x.efeito.tipo));
  const tipos = new Set(I.PROPOSITOS.map((x) => x.efeito.tipo));
  /* cada tipo tem de ter braço no App — efeito sem quem o aplique é
     promessa que o jogador lê e nunca vê. Medido DENTRO de `aplicarProposito`:
     `ef.tipo` tambem e o vocabulario dos consumiveis, que nada tem com isto. */
  const CORPO = APP.slice(APP.indexOf("const aplicarProposito"), APP.indexOf("const colherAsFalas"));
  t("a função existe", CORPO.length > 200);
  for (const tp of tipos) t(`o App sabe aplicar "${tp}"`, CORPO.includes(`ef.tipo === "${tp}"`));
  t("e não aplica nada fora da lista", (CORPO.match(/ef\.tipo === "/g) || []).length === tipos.size);
  t("e o que não conhece devolve falso", /return false;\s*\};/.test(CORPO));
}

sec("2. NADA ACONTECE NO DIA ZERO");
{
  const achado = comProposito("trair");
  t("existe alguém com o propósito de trair", !!achado);
  const { p, ind } = achado;
  t("no primeiro encontro, nada dispara", I.dispararProposito(ind, p, { dias: 0, forcaDoLaco: 0 }) === null);
  const d = I.dispararProposito(ind, p, { dias: 9, forcaDoLaco: 3 });
  t("com convívio, dispara", !!d && d.proposito === "trair");
  t("e traz o nome de quem", d.nome === p.nome);
  t("e um efeito que o sistema entende", !!d.efeito && !!d.efeito.tipo);
  t("um cumprido não dispara de novo", I.dispararProposito(I.cumprir(ind), p, { dias: 9, forcaDoLaco: 3 }) === null);
  t("sem nome, não dispara", I.dispararProposito(ind, {}, { dias: 9, forcaDoLaco: 3 }) === null);

  /* A CATRACA DOS DIAS. A sonda pegou 24 pessoas em mil revelando plano no
     dia em que o herói as conheceu: o `proteger` guardava o piso de dias em
     UM SÓ dos dois ramos do `||`. Toda regra que mora num só de dois
     caminhos vira bug — o piso passou a morar num caminho só. */
  const FONTE = readFileSync("../src/indole.js", "utf8");
  t("o piso de dias existe num lugar só", /if \(c\.dias < DIAS_ATE_QUALQUER_PLANO\) return null;/.test(FONTE));
  t("e não é export: regra que só a prova usa é regra sem dono", !/export const DIAS_ATE_QUALQUER_PLANO/.test(FONTE));
  let cedo = 0, tarde = 0;
  const tudo = { dias: 0, forcaDoLaco: 5, meDeve: true, euDevo: true, sabeDeMim: true, euSeiDela: false, euGanhei: true };
  for (let i = 0; i < 1500; i++) {
    const q = { nome: `Alguém ${i}`, relevancia: "arco" };
    const ii = I.indoleDe("catraca", q);
    if (I.dispararProposito(ii, q, tudo)) cedo++;
    if (I.dispararProposito(ii, q, { ...tudo, dias: 30 })) tarde++;
  }
  t("mil e quinhentas pessoas, nenhuma revela plano no dia zero", cedo === 0);
  t("e com tempo, os planos continuam acontecendo", tarde > 300);
  /* o ramo que estava torto, medido sozinho */
  const prot = I.PROPOSITOS.find((x) => x.id === "proteger");
  t("o laço forte sozinho já não basta", prot.madura({ dias: 0, forcaDoLaco: 5, euDevo: false }) === false);
  t("mas com convívio, basta", prot.madura({ dias: 4, forcaDoLaco: 5, euDevo: false }) === true);
}

sec("3. O ENVELOPE É FATO, NÃO SUGESTÃO");
{
  const { p, ind } = comProposito("trair");
  const d = I.dispararProposito(ind, p, { dias: 9, forcaDoLaco: 3 });
  t("diz que quem resolveu foi o sistema", /RESOLVIDO PELO SISTEMA/.test(d.envelope));
  t("manda narrar, não decidir", /narre o momento/.test(d.envelope));
  t("proíbe desfazer depois", /sem desfazê-lo depois/.test(d.envelope) && /Não invente outro desfecho/.test(d.envelope));
  t("e proíbe anunciar que era plano", /sem anunciar que era um plano/.test(d.envelope));
  t("a linha do diário não revela o mecanismo", !/propósito|efeito|maduro/i.test(d.linha));
  /* a função titulo() é do módulo; o que sai é texto */
  t("o efeito que sai não carrega função", !d.efeito || typeof d.efeito.titulo !== "function");
}

sec("4. O QUE ACONTECEU TEM ONDE FICAR");
{
  const b = B.garantirBase(null);
  t("a base guarda os propósitos", b.propositos && typeof b.propositos === "object");
  t("nada cumprido no começo", B.propositoCumprido(b, "Fina") === false);
  const b2 = B.cumprirProposito(b, "Fina", "trair");
  t("cumprir marca", B.propositoCumprido(b2, "Fina") === true);
  t("e não toca em quem não foi", B.propositoCumprido(b2, "Torvald") === false);
  t("a base velha não muda", B.propositoCumprido(b, "Fina") === false);
  /* a chave é a mesma da situação: acento e caixa não criam duas pessoas */
  t("o acento não cria outra pessoa", B.propositoCumprido(B.cumprirProposito(b, "Fína"), "fina") === true);
  t("sem nome, não marca nada", B.cumprirProposito(b, "").propositos.hasOwnProperty("") === false);
}

sec("5. O MESTRE NÃO PROMETE O QUE NÃO PODE ENTREGAR");
{
  t("bolsa quase vazia não é roubada", /if \(inv\.length < 2\) return false;/.test(APP));
  t("missão sem destino não nasce", /if \(!destino\) return false;/.test(APP));
  /* e o que não aconteceu NÃO é marcado como cumprido */
  t("só marca cumprido o que de fato aplicou", /if \(!aplicarProposito\(d\)\) continue;[\s\S]{0,120}?cumprirProposito/.test(APP));
  t("um por turno", /feitos\.push\(d\);\s*break;/.test(APP));
  /* chegar não é cumprir: falar_com a pessoa presente cumpriria no ato */
  t("a missão exige viagem, não conversa", /etapas: \[\{ tipo: "ir_a", alvo: destino \}\]/.test(APP) && !/tipo: "falar_com", alvo: d\.nome/.test(APP));
  t("e o destino nunca é a cidade onde já estou", /c\.nome !== cidadeAtualRef\.current/.test(APP));
}

sec("6. LIGADO AO TURNO, E ANTES DA BOCA");
{
  t("dispara no turno", /propositosDoTurnoRef\.current = dispararPropositos\(conteudo\);/.test(APP));
  /* antes das falas: a fala tem de sair de dentro do fato */
  t("antes das bocas", /dispararPropositos\(conteudo\);\s*falasDoTurnoRef\.current = await colherAsFalas/.test(APP));
  t("não dispara em envelope do sistema", /const dispararPropositos = \(conteudo\) => \{\s*try \{\s*if \(String\(conteudo \|\| ""\)\.trimStart\(\)\.startsWith\("\["\)\) return \[\];/.test(APP));
  t("falhar não custa o turno", /const dispararPropositos = \(conteudo\) => \{\s*try \{/.test(APP) && /\} catch \{ return \[\]; \}\s*\};\s*\n\s*const aplicarProposito/.test(APP));
  t("o que aconteceu é salvo", /if \(feitos\.length\) salvar\(\{ baseMundo: baseMundoRef\.current \}\);/.test(APP));
}

sec("7. A SEÇÃO 'ACABOU' GANHOU DONO");
{
  const s = SECOES.find((x) => x.id === "acabou");
  t("a seção existe", !!s);
  t("e agora tem produtor", /porNaPauta\(p, "acabou", \(propositosDoTurnoRef\.current \|\| \[\]\)/.test(APP));
  /* estava declarada e vazia desde sempre — seção sem produtor é orçamento
     reservado para ninguém */
  t("é seção alta, o fato vem antes do enfeite", s.prio <= 3);
}

sec("8. A ÍNDOLE VEM MESMO DE QUEM O NARRADOR TROUXE");
{
  /* a gente da base nasce com índole; o NPC que a IA criou, não — e sem
     isto ele nunca teria propósito nenhum */
  t("o App deriva quando falta", /if \(pessoa && pessoa\.indole\) return pessoa\.indole;\s*return indoleDe\(sementeMundo\(\), pessoa \|\| \{\}\);/.test(APP));
  const p = { nome: "Fina Da Rede" };
  t("e derivar dá a MESMA índole que a base daria", JSON.stringify(I.indoleDe("s", p)) === JSON.stringify(I.indoleDe("s", { nome: "Fina Da Rede", id: "outro-id" })));
}

console.log(`\nproposito v9.137: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
