/* O CUSTO DO TURNO (v9.146)

   "Custo de token é produto" era a única regra da arquitetura sem número
   atrás. O provedor devolve a contagem de tokens em toda resposta, e o
   jogo jogava fora — então em nenhum momento da história do projeto
   alguém soube quanto uma partida custava de verdade.

   A conta que mais interessa não é o total: é o CACHE. Um token de
   entrada relido custa cerca de um décimo de um novo, e o prompt de
   sistema — a maior parte da entrada de todo turno — é literalmente o
   mesmo texto em todos os turnos de uma partida. Se ele não está caindo
   no preço de cache, alguma coisa reescreve o começo do prompt a cada
   jogada, e a campanha custa umas quatro vezes o que deveria custar.
   Nenhum outro número do jogo denuncia isso. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const C = await import(S + "custo.js");
const APP = readFileSync("../src/App.jsx", "utf8");
const API = readFileSync("../api/narrador.js", "utf8");
const GOD = readFileSync("../src/godmode.js", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. CADA PROVEDOR CONTA COM NOME PRÓPRIO, E SÓ UM LUGAR SABE DISSO");
{
  const ds = C.lerUso({ usage: { prompt_tokens: 14000, completion_tokens: 700, prompt_cache_hit_tokens: 13000 } });
  t("lê o DeepSeek", ds && ds.entrada === 14000 && ds.saida === 700 && ds.cache === 13000);
  const gm = C.lerUso({ usageMetadata: { promptTokenCount: 9000, candidatesTokenCount: 400, cachedContentTokenCount: 0 } });
  t("lê o Gemini", gm && gm.entrada === 9000 && gm.saida === 400);
  t("e não inventa quando não veio nada", C.lerUso({}) === null && C.lerUso(null) === null);
  /* dois lugares traduzindo o mesmo campo é como este projeto fabrica bug */
  t("a tradução mora num arquivo só", !/prompt_tokens|promptTokenCount/.test(APP));
  t("e a API a importa de lá", /import \{ lerUso \} from "\.\.\/src\/custo\.js"/.test(API));
}

sec("2. O CACHE É A CONTA");
{
  const comCache = C.custoDaChamada({ modelo: "deepseek-v4-pro", entrada: 14000, saida: 700, cache: 13000 });
  const semCache = C.custoDaChamada({ modelo: "deepseek-v4-pro", entrada: 14000, saida: 700, cache: 0 });
  t("o mesmo turno custa muito menos com cache", comCache < semCache);
  t("e a diferença é grande — mais de 3x", semCache > comCache * 3);
  /* o cache faz PARTE da entrada; somar os dois cobraria o mesmo token
     duas vezes, e o erro passaria despercebido para sempre porque só
     deixaria a conta um pouco maior */
  const p = C.precoDe("deepseek-v4-pro");
  const naMao = (1000 * p.entrada + 13000 * p.cache + 700 * p.saida) / 1e6;
  t("os tokens do cache não são cobrados duas vezes", Math.abs(comCache - naMao) < 1e-9);
  /* um modelo fora da tabela não pode custar zero: zero é uma afirmação,
     e seria falsa */
  t("modelo desconhecido não custa zero", C.custoDaChamada({ modelo: "modelo-que-nao-existe", entrada: 1000, saida: 100 }) > 0);
  t("e erra para o lado caro", C.precoDe("nao-existe").saida >= Math.max(...Object.values(C.PRECOS).map((x) => x.saida)));
}

sec("3. O ACUMULADO SOMA O QUE DEVE E IGNORA O QUE NÃO DEVE");
{
  let a = C.CUSTO_ZERO();
  a = C.somarChamada(a, { modelo: "deepseek-v4-pro", entrada: 10000, saida: 500, cache: 9000, tarefa: "narrador" });
  a = C.somarChamada(a, { modelo: "deepseek-v4-flash", entrada: 2000, saida: 200, cache: 0, tarefa: "leve" });
  t("contou as duas", a.chamadas === 2);
  t("somou a entrada", a.entrada === 12000);
  t("e a saída", a.saida === 700);
  t("separou por tarefa", Object.keys(a.porTarefa).sort().join(",") === "leve,narrador");
  t("e por modelo", Object.keys(a.porModelo).length === 2);
  t("o narrador custa mais que o leve", a.porTarefa.narrador > a.porTarefa.leve);
  /* uma resposta em que o provedor não contou nada não pode virar uma
     chamada de custo zero: ela estragaria a MÉDIA por turno, que é o
     número que se olha para decidir cortar prompt */
  const b = C.somarChamada(a, { modelo: "x", entrada: 0, saida: 0 });
  t("resposta sem contagem não vira chamada de custo zero", b.chamadas === 2);
  t("e lixo não derruba o acumulado", C.somarChamada(a, null).chamadas === 2);
}

sec("4. O AVISO QUE JUSTIFICA O MÓDULO");
{
  let semCache = C.CUSTO_ZERO();
  for (let i = 0; i < 10; i++) semCache = C.somarChamada(semCache, { modelo: "deepseek-v4-pro", entrada: 14000, saida: 700, cache: 0 });
  const linhas = C.linhasDoCusto(semCache, { dia: 5 }).join(" ");
  t("avisa quando nada vem do cache", /nenhum token veio do cache/.test(linhas));
  let comCache = C.CUSTO_ZERO();
  for (let i = 0; i < 10; i++) comCache = C.somarChamada(comCache, { modelo: "deepseek-v4-pro", entrada: 14000, saida: 700, cache: 13000 });
  t("e cala a boca quando vem", !/nenhum token veio do cache/.test(C.linhasDoCusto(comCache).join(" ")));
  t("campanha vazia não mente", /nenhuma chamada medida/.test(C.linhasDoCusto(C.CUSTO_ZERO())[0]));
  t("e diz o custo por dia de jogo", /por dia de jogo/.test(linhas));
}

sec("5. O NÚMERO CHEGA, ATRAVESSA A RECARGA, E TEM UMA PORTA");
{
  t("a API devolve o uso ao jogo", /uso: out\.uso \? \{ \.\.\.out\.uso, tarefa/.test(API));
  t("os dois provedores o colhem", (API.match(/const uso = lerUso\(data\)/g) || []).length === 2);
  t("o App acumula a cada resposta", /custoRef\.atual = somarChamada\(custoRef\.atual/.test(APP));
  t("guarda no save", /custo: custoRef\.atual,/.test(APP));
  /* sem isto o contador mediria a ABA aberta, e não a campanha — que é
     outra pergunta e não serve para nada */
  t("e restaura ao carregar", /custoRef\.atual = sv\.custo &&/.test(APP));
  t("há um comando para perguntar", /cmd: "custo"/.test(GOD));
  t("e ele responde", /case "custo": godLinha/.test(APP));
  /* A LEI DA CASA: o sistema não fala de si mesmo. O preço da API não é
     gameplay, então ele não tem painel — a mesma decisão que manteve o
     provedor fora da tela na v9.115. */
  t("mas não vira painel", !/Depuraç|PainelCusto|rotulo: "Custo"/.test(APP));
}

console.log(`\ncusto v9.146: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
