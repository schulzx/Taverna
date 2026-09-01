/* AS PROFISSÕES E OS AFIXOS PELO LÉXICO (v9.114).

   Os dois últimos vazamentos que a partida mostrou. Num mundo de drones
   e créditos, a ficha oferecia "Ferreiro · Alquimista · Herborista" e a
   banca vendia "Anã Lanterna de fenda" e "Orc Canivete de fenda" — o
   nome da BASE já vinha do mundo desde a v9.111, o resto do nome não.

   Os dois pedem desenhos diferentes, e é isso que este teste guarda:

   · PROFISSÃO é duas colunas, como a raça. `profissaoDe` casa por nome e
     o efeito sai dali; o nome é identificador e não muda.

   · AFIXO é por DEGRAU, como a criatura é por ameaça. O prefixo carrega
     a raridade em que pode aparecer — "Rústico" no 0, "Lendário" no 4 —,
     e trocar a palavra sem levar o degrau junto faria a régua da v9.80
     voltar a mentir. */
import {
  PROFISSOES_DO_SISTEMA, DEGRAUS_DE_AFIXO, garantirLexico, pedidoDoLexico,
  chamadoDaProfissao, profissoesRenomeadas, afixosDoGrau, sufixosDo,
  temAfixosProprios, feminizar,
} from "../src/lexico.js";
import { PROFISSOES } from "../src/classes.js";
import { profissaoDe, efeitoDe } from "../src/profissoes.js";
import { gerarLoot, PREFIXOS } from "../src/loot.js";
import { pesoDoPrefixo } from "../src/afixos.js";

let ok = 0, bad = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; } else { bad++; console.log("  FALHOU: " + nome + (extra ? " — " + extra : "")); } };

console.log("== A LISTA DE PROFISSÕES BATE COM O CATÁLOGO ==");
const doCodigo = PROFISSOES.map((p) => p.nome);
t("nenhuma profissão do código fica de fora", doCodigo.every((n) => PROFISSOES_DO_SISTEMA.includes(n)),
  doCodigo.filter((n) => !PROFISSOES_DO_SISTEMA.includes(n)).join(", "));
t("nenhuma da lista é inventada", PROFISSOES_DO_SISTEMA.every((n) => doCodigo.includes(n)),
  PROFISSOES_DO_SISTEMA.filter((n) => !doCodigo.includes(n)).join(", "));

const banco = PROFISSOES_DO_SISTEMA.map((p, i) => ({ profissao: i === 1 ? p.toLowerCase() : p, chamado: "ofício-" + p }));
const lex = garantirLexico({ profissoes: banco });

console.log("\n== DUAS COLUNAS: O NOME É IDENTIFICADOR ==");
t("o apelido chega", chamadoDaProfissao(lex, "Ferreiro") === "ofício-Ferreiro");
t("a caixa não importa", chamadoDaProfissao(lex, PROFISSOES_DO_SISTEMA[1]) === "ofício-" + PROFISSOES_DO_SISTEMA[1]);
t("sem léxico, o nome de sempre", chamadoDaProfissao(null, "Ferreiro") === "Ferreiro");
t("nome desconhecido não quebra", chamadoDaProfissao(lex, "Astronauta") === "Astronauta");
t("as doze entram", profissoesRenomeadas(lex).length === 12);
for (const n of PROFISSOES_DO_SISTEMA) {
  const pers = { profissao: n };
  t(`${n}: a busca mecânica continua achando`, !!profissaoDe(pers));
  t(`${n}: o efeito não muda`, JSON.stringify(efeitoDe(pers)) === JSON.stringify(efeitoDe({ profissao: n })));
  /* o benefício é lido do catálogo, que é de onde o App o lê */
  t(`${n}: e o benefício continua escrito`, (PROFISSOES.find((x) => x.nome === n) || {}).beneficio.length > 0);
}
t("guardar o APELIDO em vez do nome perderia o efeito",
  Object.keys(efeitoDe({ profissao: "ofício-Ferreiro" })).length === 0,
  "é o que a coluna canônica impede");

console.log("\n== TUDO OU NADA ==");
t("faltando uma, o banco cai", profissoesRenomeadas(garantirLexico({ profissoes: banco.slice(0, 11) })).length === 0);
t("e aí toda profissão volta ao nome de sempre", chamadoDaProfissao(garantirLexico({ profissoes: banco.slice(0, 11) }), "Ferreiro") === "Ferreiro");
t("uma sem chamado também derruba",
  profissoesRenomeadas(garantirLexico({ profissoes: banco.map((x, i) => (i === 5 ? { ...x, chamado: "" } : x)) })).length === 0);

console.log("\n== OS AFIXOS SÃO POR DEGRAU ==");
const A = {
  grau0: ["usado", "remendado", "sujo"], grau1: ["reforçado", "calibrado", "homologado"],
  grau2: ["blindado", "selado", "irradiado"], grau3: ["experimental", "proscrito", "lacrado"],
  grau4: ["irreproduzível", "primordial", "inominado"],
  sufixos: ["do Setor 9", "da Travessia", "do Vazamento", "de Membrana", "da Superintendência", "do Último Turno"],
};
const lexA = garantirLexico({ afixos: A });
t("cinco degraus", DEGRAUS_DE_AFIXO.length === 5);
t("cada degrau diz o que significa", DEGRAUS_DE_AFIXO.every((d) => d.o && d.o.length > 20 && Number.isInteger(d.n)));
t("o banco completo vale", temAfixosProprios(lexA));
for (const d of DEGRAUS_DE_AFIXO) t(`o grau ${d.n} devolve pares`, afixosDoGrau(lexA, d.n).every((p) => Array.isArray(p) && p.length === 2 && p[0]));
t("os sufixos chegam", sufixosDo(lexA).length === 6);

console.log("\n== A GARANTIA É IDEMPOTENTE ==");
/* este é o único campo do léxico que entra numa forma e sai noutra, e
   `garantirLexico` roda muitas vezes sobre o mesmo léxico — uma em
   `lerLexico` e outra em cada leitor. Sem idempotência, o banco do mundo
   era zerado logo depois de ser aceito. */
let l2 = garantirLexico({ afixos: A });
for (let i = 0; i < 5; i++) l2 = garantirLexico(l2);
t("cinco passadas e o banco continua de pé", temAfixosProprios(l2));
t("e os degraus continuam completos", DEGRAUS_DE_AFIXO.every((d) => afixosDoGrau(l2, d.n).length >= 3));
t("faltando um degrau, o banco cai", !temAfixosProprios(garantirLexico({ afixos: { ...A, grau3: ["um"] } })));
t("poucos sufixos também derrubam", !temAfixosProprios(garantirLexico({ afixos: { ...A, sufixos: ["do Setor 9"] } })));

console.log("\n== O FEMININO SAI POR REGRA ==");
t("adjetivo em -o faz -a", feminizar("blindado") === "blindada");
t("adjetivo em -ão faz -ã", feminizar("Anão") === "Anã");
t("o resto é invariável", feminizar("militar") === "militar" && feminizar("feroz") === "feroz" && feminizar("cinza") === "cinza");
t("LOCUÇÃO não flexiona", feminizar("de patrulha") === "de patrulha" && feminizar("do Primeiro Portão") === "do Primeiro Portão",
  "a regra ão→ã é de adjetivo e transformava 'do Primeiro Portão' em 'do Primeiro Portã'");
t("vazio não quebra", feminizar(null) === "" && feminizar("") === "");

console.log("\n== O DEGRAU CONTINUA VALENDO NO ITEM ==");
/* o motivo de tudo isto: `pesoDoPrefixo` consulta uma tabela POR PALAVRA,
   e a palavra que o mundo inventou não está nela. Se o código perguntasse
   o peso, tudo cairia no padrão 1 e a régua da v9.80 morreria. */
t("a tabela não conhece a palavra do mundo", pesoDoPrefixo("irreproduzível") === 1,
  "por isso o código escolhe pelo DEGRAU, e não pergunta o peso");
const doGrau4 = new Set(A.grau4);
const doGrau0 = new Set(A.grau0);
let comumComGrau4 = 0, achouAlgum = 0;
for (let i = 0; i < 400; i++) {
  const x = gerarLoot("comum", { nivel: 3, lex: garantirLexico({ afixos: A }) });
  const prim = String(x.nome).split(" ")[0].toLowerCase();
  if ([...doGrau4].some((w) => prim === w.toLowerCase())) comumComGrau4++;
  if ([...doGrau0].some((w) => prim === w.toLowerCase())) achouAlgum++;
}
t("nenhum item comum ganha palavra do grau 4", comumComGrau4 === 0,
  `${comumComGrau4} de 400 — é a régua da v9.80: nome que promete tem de ser pago pela raridade`);
t("mas o grau 0 aparece nos comuns", achouAlgum > 0, `${achouAlgum} de 400`);

console.log("\n== E O NOME SAI LIMPO ==");
const lexTudo = garantirLexico({ afixos: A });
let baixa = 0, plurLoc = 0;
for (let i = 0; i < 400; i++) {
  const x = gerarLoot(["comum", "incomum", "raro", "epico", "lendario"][i % 5], { nivel: 9, lex: lexTudo });
  if (x.nome[0] === x.nome[0].toLowerCase() && x.nome[0] !== x.nome[0].toUpperCase()) baixa++;
  if (/^(de|com|do|da) \w+s\b/i.test(x.nome)) plurLoc++;
}
t("nenhum nome nasce em caixa baixa", baixa === 0, `${baixa} de 400`);
t("e nenhuma locução é pluralizada", plurLoc === 0, `${plurLoc} de 400 — saía "de patrulhas Botas de Pelagem"`);
t("sem léxico, o catálogo de sempre continua", PREFIXOS.length > 20 && /^[A-ZÁÉÍÓÚÂÊÔÃÕ]/.test(gerarLoot("lendario", { nivel: 9 }).nome));

console.log("\n== O PEDIDO AO MESTRE ==");
const pedido = pedidoDoLexico({ genero: "Universo próprio", descricao: "caçadores e fendas" });
t("pede as profissões", pedido.includes('"profissoes"'));
t("e lista as doze", PROFISSOES_DO_SISTEMA.every((n) => pedido.includes(n)));
t("pede os afixos", pedido.includes('"afixos"'));
t("e os cinco degraus", DEGRAUS_DE_AFIXO.every((d) => pedido.includes(`"grau${d.n}"`)));
t("e diz o que cada degrau significa", DEGRAUS_DE_AFIXO.every((d) => pedido.includes(d.o)));
t("manda uma palavra só", /UMA PALAVRA SÓ/.test(pedido));
t("avisa que o degrau é mecânica", /Uma palavra grandiosa no grau 0/.test(pedido));
t("separa oficios de profissoes", /Não confunda com "oficios"/.test(pedido));
/* a ORDEM das regras, e não o número: a numeração anda a cada regra nova */
const ordem = ["AS RAÇAS TAMBÉM TÊM LISTA FECHADA", "O EQUIPAMENTO É TUDO OU NADA",
  "AS DOZE PROFISSÕES DA FICHA", "OS AFIXOS TÊM DEGRAU", "PREENCHA TODOS OS DEGRAUS DE AMEAÇA",
  "Português do Brasil"].map((x) => pedido.indexOf(x));
t("as regras aparecem na ordem certa", ordem.every((x, i) => x > 0 && (i === 0 || x > ordem[i - 1])), ordem.join(","));
console.log(`      pedido: ${pedido.length} caracteres`);


/* A ASSINATURA, que me custou um diagnóstico errado. Ela recebe UM
   objeto {genero, descricao}; chamada com duas strings, a primeira vai
   como `mundo`, `m.genero` e `m.descricao` ficam vazios e o pedido sai
   pedindo fantasia medieval sem descrição — sem erro nenhum na tela. */
t("pedidoDoLexico lê o gênero do objeto", pedidoDoLexico({ genero: "Cyberpunk", descricao: "neon" }).includes("Cyberpunk"));
t("e a descrição também", pedidoDoLexico({ genero: "Cyberpunk", descricao: "chuva de neon" }).includes("chuva de neon"));
t("chamada com duas strings NÃO leva a descrição", !pedidoDoLexico("Cyberpunk", "chuva de neon").includes("chuva de neon"),
  "é o erro que me fez ler duas respostas certas como regressão");

console.log(`\n${ok} passaram · ${bad} falharam`);
process.exit(bad ? 1 : 0);
