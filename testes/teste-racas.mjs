/* ETAPA 7 — as raças pelo léxico, e a regra das DUAS COLUNAS.

   O que este teste existe para impedir é exatamente o risco que o
   jogador levantou sobre equipamento: um apelido que vira afordância
   falsa. Aqui ele não vira, porque a coluna mecânica não se mexe — e é
   isso que se mede abaixo, campo por campo. */
import { RACAS_DO_SISTEMA, garantirLexico, chamadoDaRaca, racasRenomeadas, pedidoDoLexico } from "../src/lexico.js";
import { RACAS, ORIGENS, racaPorNome, racasDoGenero } from "../src/classes.js";
import { origemDe, efeitoDe } from "../src/tracos.js";
import { velocidadeDaRaca, deslocamentoDe } from "../src/movimento.js";

let ok = 0, bad = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; } else { bad++; console.log("  FALHOU: " + nome + (extra ? " — " + extra : "")); } };

console.log("== A LISTA FECHADA BATE COM O CATÁLOGO ==");
const doCodigo = [...RACAS, ...ORIGENS].map((r) => r.nome);
t("nenhuma raça do código ficou de fora", doCodigo.every((n) => RACAS_DO_SISTEMA.includes(n)),
  doCodigo.filter((n) => !RACAS_DO_SISTEMA.includes(n)).join(", "));
t("nenhum nome da lista é inventado", RACAS_DO_SISTEMA.every((n) => doCodigo.includes(n)),
  RACAS_DO_SISTEMA.filter((n) => !doCodigo.includes(n)).join(", "));
t("os dois gêneros de mundo cabem na lista",
  [...racasDoGenero("Fantasia medieval"), ...racasDoGenero("Cyberpunk")].every((r) => RACAS_DO_SISTEMA.includes(r.nome)));

console.log("\n== A GARANTIA ==");
t("sem léxico, o campo existe e é lista", Array.isArray(garantirLexico(null).racas));
t("sem léxico, o chamado é o nome de sempre", chamadoDaRaca(null, "Anão") === "Anão");
t("nome desconhecido não quebra", chamadoDaRaca(null, "Coisa") === "Coisa");
t("nome vazio devolve string", chamadoDaRaca(null, undefined) === "");

/* o banco COMPLETO, com as sujeiras que o Mestre costuma mandar
   misturadas: caixa diferente, teto estourado, duplicata, nome de fora e
   entrada torta. A limpeza tem de sobreviver a tudo isso e ainda assim
   entregar as dezesseis. */
const bancoCheio = RACAS_DO_SISTEMA.map((r, i) => ({
  raca: i === 1 ? r.toLowerCase() : r,                   /* caixa diferente entra */
  chamado: i === 2 ? "x".repeat(300) : "Nome-" + r,      /* e o teto corta */
}));
const lex = garantirLexico({
  racas: [
    ...bancoCheio,
    { raca: RACAS_DO_SISTEMA[0], chamado: "Repetido" },   /* duplicata sai */
    { raca: "Meio-dragão", chamado: "Não existe" },       /* fora da lista, sai */
    { chamado: "sem raca" },
    null,
  ],
});
t("o apelido chega", chamadoDaRaca(lex, RACAS_DO_SISTEMA[0]) === "Nome-" + RACAS_DO_SISTEMA[0]);
t("a caixa não importa", chamadoDaRaca(lex, RACAS_DO_SISTEMA[1]) === "Nome-" + RACAS_DO_SISTEMA[1]);
t("o teto corta", chamadoDaRaca(lex, RACAS_DO_SISTEMA[2]).length <= 40);
t("a duplicata some", racasRenomeadas(lex).filter((r) => r.raca === RACAS_DO_SISTEMA[0]).length === 1);
t("a primeira ocorrência é a que vale", chamadoDaRaca(lex, RACAS_DO_SISTEMA[0]) === "Nome-" + RACAS_DO_SISTEMA[0]);
t("nome de fora não entra", !racasRenomeadas(lex).some((r) => r.chamado === "Não existe"));
t("entrada torta não quebra", racasRenomeadas(lex).every((r) => r.raca && r.chamado));
t("e as dezesseis entram", racasRenomeadas(lex).length === RACAS_DO_SISTEMA.length);

console.log("\n== TUDO OU NADA ==");
/* achado jogando: a ficha oferecia "normal · Elfo · Anão · fendido ·
   Draconato · tocado" na mesma lista. Metade renomeada lê pior que
   nenhuma renomeada, porque a metade que sobrou denuncia a outra. */
const faltando = garantirLexico({ racas: bancoCheio.slice(0, RACAS_DO_SISTEMA.length - 1) });
t("faltando UMA raça, o banco inteiro cai", racasRenomeadas(faltando).length === 0,
  "metade renomeada é o pior dos dois mundos");
t("e aí toda raça volta ao nome de sempre", chamadoDaRaca(faltando, "Humano") === "Humano");
t("uma sem chamado também derruba",
  racasRenomeadas(garantirLexico({ racas: bancoCheio.map((x, i) => (i === 3 ? { ...x, chamado: "" } : x)) })).length === 0);
t("o pedido manda renomear todas", /RENOMEIE TODAS, sem exceção/.test(pedidoDoLexico({ genero: "Universo próprio", descricao: "x" })));

console.log("\n== A COLUNA MECÂNICA NÃO SE MEXE ==");
/* o coração da etapa: renomeada ou não, a raça continua a mesma coisa
   para todo mundo que lê para DECIDIR. */
for (const n of RACAS_DO_SISTEMA) {
  const r = racaPorNome(n);
  t(`${n} existe no catálogo`, !!r);
  if (!r) continue;
  const pers = { raca: n };
  const antes = { bonus: JSON.stringify(r.bonus), traco: r.traco, origem: origemDe(pers), vel: velocidadeDaRaca(n) };
  /* renomeia e mede de novo */
  /* o banco é sempre completo; o que se mede é UMA raça dentro dele */
  const l2 = garantirLexico({ racas: RACAS_DO_SISTEMA.map((x) => ({ raca: x, chamado: "Apelido " + x })) });
  t(`${n} muda de nome na tela`, chamadoDaRaca(l2, n) === "Apelido " + n);
  const r2 = racaPorNome(n);
  t(`${n} mantém o bônus`, JSON.stringify(r2.bonus) === antes.bonus);
  t(`${n} mantém o traço`, r2.traco === antes.traco);
  t(`${n} mantém a origem em tracos.js`, origemDe(pers) === antes.origem);
  t(`${n} mantém a velocidade`, velocidadeDaRaca(n) === antes.vel);
}

console.log("\n== O ANÃO, QUE É O CASO PERIGOSO ==");
/* movimento.js lê a raça por REGEX de nome para a marcha do anão. Se
   algum dia alguém trocar o que se GUARDA em vez do que se MOSTRA, é
   aqui que quebra primeiro — e em silêncio, que é o pior jeito. */
const lexAnao = garantirLexico({ racas: RACAS_DO_SISTEMA.map((x) => ({ raca: x, chamado: x === "Anão" ? "Filho da Pedra" : "Nome-" + x })) });
const couraça = { nome: "Couraça de placas", tipo: "armadura" };
const comArmadura = (raca) => deslocamentoDe({ raca, atributos: { forca: 0 }, equipados: { armadura: couraça } }).andar;
const semArmadura = (raca) => deslocamentoDe({ raca, atributos: { forca: 0 } }).andar;

/* a isenção existe e vale 3 m — se ela deixar de existir, os dois testes
   abaixo perdem o sentido, e este aqui avisa antes */
t("a armadura pesada custa 3 m a quem não é anão", semArmadura("Humano") - comArmadura("Humano") === 3,
  `${semArmadura("Humano")} → ${comArmadura("Humano")}`);
t("o anão passa direto pela armadura pesada", comArmadura("Anão") === semArmadura("Anão"));

/* e o coração: renomeado na tela, ele continua anão para a regra */
t("o anão renomeado ainda é anão no chão", comArmadura("Anão") === semArmadura("Anão") && chamadoDaRaca(lexAnao, "Anão") === "Filho da Pedra");
t("guardar o APELIDO em vez do nome tiraria a isenção", semArmadura("Filho da Pedra") - comArmadura("Filho da Pedra") === 3,
  "é exatamente o bug que a coluna canônica impede");
t("a ficha guarda o canônico", racaPorNome("Anão") !== null && racaPorNome("Filho da Pedra") === null);

console.log("\n== O PEDIDO AO MESTRE ==");
const pedido = pedidoDoLexico({ genero: "Fantasia medieval", descricao: "caçadores modernos e portais" });
t("o pedido lista as raças", RACAS_DO_SISTEMA.every((n) => pedido.includes(n)));
t("o pedido tem o campo", pedido.includes('"racas"'));
t("o pedido diz que a lista é fechada", /AS RAÇAS TAMBÉM TÊM LISTA FECHADA/.test(pedido));
t("o pedido separa povos de racas", /"povos" é quem habita o mundo/.test(pedido));
/* prender o NÚMERO da regra foi o erro: a etapa 9 pôs o equipamento no
   meio e tudo andou um. O que o pedido promete é a ORDEM de leitura. */
const ordem = ["AS RAÇAS TAMBÉM TÊM LISTA FECHADA", "O EQUIPAMENTO É TUDO OU NADA", "PREENCHA TODOS OS DEGRAUS", "Português do Brasil"].map((x) => pedido.indexOf(x));
t("as regras aparecem na ordem certa", ordem.every((x, k) => x > 0 && (k === 0 || x > ordem[k - 1])), ordem.join(","));
/* a numeração é conferida como SEQUÊNCIA, e não por número fixo: cada
   regra nova entra no meio e todas as de baixo andam uma casa. */
const numeros = (pedido.match(/^\d+\. /gm) || []).map((x) => parseInt(x, 10));
t("as regras são numeradas sem buraco nem repetição",
  numeros.length >= 6 && numeros.every((x, i) => i === 0 || x === numeros[i - 1] + 1), numeros.join(","));

console.log("\n== O EFEITO CONTINUA SAINDO DO NOME DE BAIXO ==");
const humano = { raca: "Humano", nivel: 1 };
t("o efeito do humano existe", !!efeitoDe(humano));
t("o efeito não conhece apelido", JSON.stringify(efeitoDe({ raca: "Desperto" })) !== JSON.stringify(efeitoDe(humano)));

console.log(`\n${ok} passaram · ${bad} falharam`);
process.exit(bad ? 1 : 0);
