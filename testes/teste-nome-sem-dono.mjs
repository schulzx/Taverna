/* teste-nome-sem-dono.mjs (trilha A, 29/10/2026) — todo nome que o código lê tem dono

   O ACHADO (trilha B, 78caaa9; e a varredura desta suíte): o componente
   principal do App chamava `setHistoria` em cinco sítios — e `setHistoria`
   não existe nele (é o estado da TelaPersonagem, o texto da origem do
   herói). Cada chamada estourava com ReferenceError, e o que vinha depois
   dela não corria:
     · conferirAsMissoes: o marco cumprido não se gravava (o `salvar` da
       espinha e da história) e a conferência das missões desse turno parava
       ali;
     · abrirProximoCapitulo: o «anos depois» punha o arco novo e parava — o
       calendário, a hora, as missões e os eventos do capítulo velho ficavam;
     · encerrarNemesis: o «Fim do capítulo» não aparecia, o Mestre não
       recebia o pedido do epílogo, e a porta do capítulo seguinte não abria;
     · processarNemesisDiaria: a virada do arco casada com o vilão não
       chegava ao Mestre;
     · mexerNoEpisodio: o mesmo, mas calado por um try (o ref já tinha sido
       escrito).
   E no painel dos domínios, `rev` (a revolta de UMA cidade, declarada num
   bloco irmão mais abaixo) era lido fora do escopo dele: o painel caía no
   LimiteErro sempre que uma cidade tinha a felicidade perto da fúria.

   O build não vê isto (o Vite não resolve nomes) e nenhuma suíte o via: só
   o clique. A catraca é a árvore: cada arquivo de src/ é lido pelo
   @babel/parser e os nomes que ele lê sem declarar têm de ser do ambiente
   (a tabela abaixo). Nome novo do ambiente entra na tabela, com o porquê. */
import fs from "node:fs";
import { createRequire } from "node:module";
const req = createRequire(import.meta.url);
const parser = req("@babel/parser");
const traverse = req("@babel/traverse").default;

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* os nomes que o JavaScript e o navegador (e o Node, para os módulos que
   correm nos dois) dão sem declaração */
const DO_AMBIENTE = new Set([
  "Array", "Boolean", "Date", "Error", "ReferenceError", "Infinity", "JSON", "Map", "Math", "NaN", "Number", "Object",
  "Promise", "Proxy", "RegExp", "Set", "String", "WeakSet", "Uint8Array", "undefined", "globalThis",
  "isFinite", "isNaN", "parseInt", "structuredClone", "console",
  "setTimeout", "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame", "cancelAnimationFrame", "performance",
  "window", "document", "localStorage", "location", "navigator", "fetch", "URL", "Blob", "FileReader", "Audio",
  "ResizeObserver", "TextEncoder", "TextDecoder", "atob", "btoa",
  "Buffer", /* duelo.js e licenca.js, com guarda: só no Node */
]);

const SRC = new URL("../src/", import.meta.url);
const arquivos = [
  ...fs.readdirSync(SRC).filter((f) => /\.jsx?$/.test(f)),
  ...fs.readdirSync(new URL("motor/", SRC)).filter((f) => /\.js$/.test(f)).map((f) => "motor/" + f),
];
const semDono = [];
for (const f of arquivos) {
  const ast = parser.parse(fs.readFileSync(new URL(f, SRC), "utf8"), { sourceType: "module", plugins: ["jsx"] });
  traverse(ast, {
    Program(p) {
      for (const n of Object.keys(p.scope.globals)) if (!DO_AMBIENTE.has(n)) semDono.push(`${f}: ${n}`);
      p.stop();
    },
  });
}

sec("1 · o que src/ lê sem declarar é do ambiente");
t(`${arquivos.length} arquivos, nenhum nome sem dono`, semDono.length === 0, semDono.join(" · "));
t("a varredura vê o App (o maior, e onde o defeito morava)", arquivos.includes("App.jsx"));

sec("2 · a varredura morde");
{
  const ast = parser.parse("function Taverna() { const [a, setA] = useState(0); const f = () => { setHistoria(1); }; return f; }\nfunction Tela() { const [historia, setHistoria] = useState(''); }", { sourceType: "module", plugins: ["jsx"] });
  let g = [];
  traverse(ast, { Program(p) { g = Object.keys(p.scope.globals); p.stop(); } });
  t("o setter de OUTRO componente, chamado aqui, é nome sem dono", g.includes("setHistoria"));
  t("e o hook de import que faltasse também", g.includes("useState"));
}

console.log(`\n${ok} ok, ${mal} falhas`);
if (mal) process.exit(1);
