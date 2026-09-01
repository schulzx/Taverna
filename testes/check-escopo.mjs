/* O VARREDOR DE ESCOPO — o erro que me pegou duas vezes

   `App.jsx` tem os componentes de painel declarados ANTES do componente
   `Taverna`, no topo do arquivo. Eles são funções separadas: nada do que
   mora dentro de `Taverna` está no escopo deles.

   Duas vezes eu chamei um ajudante de `Taverna` de dentro de um painel:

     v9.136  `sementeMundo()` dentro de PainelPessoas
     v9.144  `potenciasAqui()` dentro de PainelLateral

   As duas vezes o build passou limpo — não é erro de sintaxe, é um nome que
   só não existe naquele ponto. As duas vezes a suíte passou verde, porque
   suíte de módulo não monta React. E as duas vezes quem pegou foi abrir a
   aba no navegador e ver o painel inteiro cair na rede do LimiteErro.

   Este varredor pega antes: extrai os ajudantes declarados dentro de
   `Taverna` e procura por chamadas deles na região dos componentes. */

import { readFileSync } from "node:fs";

const S = readFileSync("../src/App.jsx", "utf8");
const semCom = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

const iTaverna = S.indexOf("function Taverna(");
if (iTaverna < 0) { console.log("não achei o componente Taverna"); process.exit(1); }

/* a região dos componentes: do primeiro `function ` até `function Taverna(` */
const iPrimeiro = S.indexOf("\nfunction ");
const REGIAO = semCom(S.slice(iPrimeiro, iTaverna));
const CORPO = semCom(S.slice(iTaverna));

/* ajudantes declarados DENTRO de Taverna, com dois espaços de indentação —
   que é como todo `const x = ...` do corpo do componente é escrito */
const ajudantes = new Set();
for (const m of CORPO.matchAll(/\n  const ([A-Za-z_$][\w$]*) = (?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/g)) ajudantes.add(m[1]);
for (const m of CORPO.matchAll(/\n  const ([A-Za-z_$][\w$]*) = useCallback\(/g)) ajudantes.add(m[1]);

/* nomes que os painéis recebem por PROP não contam: `potencias`, `mapa`,
   `personagem`… Um nome só é suspeito se for CHAMADO como função e não
   estiver na lista de parâmetros do componente onde aparece. */
const componentes = [...REGIAO.matchAll(/function (Painel[\w$]*|[A-Z][\w$]*)\s*\(\{([\s\S]*?)\}\)\s*\{/g)]
  .map((m) => ({ nome: m[1], props: new Set([...m[2].matchAll(/([A-Za-z_$][\w$]*)\s*(?:=|,|$)/g)].map((x) => x[1])), desde: m.index }));

let achados = 0;
console.log("[escopo] ajudante de Taverna chamado dentro de um componente de painel");
for (let i = 0; i < componentes.length; i++) {
  const c = componentes[i];
  const fim = i + 1 < componentes.length ? componentes[i + 1].desde : REGIAO.length;
  const trecho = REGIAO.slice(c.desde, fim);
  for (const nome of ajudantes) {
    if (c.props.has(nome)) continue;
    /* declarado localmente dentro do próprio componente? então é dele */
    if (new RegExp(`(const|let|function)\\s+${nome}\\b`).test(trecho)) continue;
    /* O PONTO DO SPREAD NÃO É O PONTO DO ACESSO. A primeira versão desta
       linha excluía qualquer ponto antes do nome, para não casar
       `obj.metodo()` — e com isso deixou passar `...potenciasAqui()`, que
       era exatamente o caso real que eu queria pegar. Varredor que não pega
       é pior do que varredor nenhum: dá a sensação de estar coberto.

       Agora: nem letra antes, nem um ponto que NÃO seja parte de `...`. */
    if (new RegExp(`(?<![\\w$])(?<!(?<!\\.)\\.)${nome}\\s*\\(`).test(trecho)) {
      console.log(`  ${c.nome}: chama "${nome}()", que só existe dentro de Taverna`);
      achados++;
    }
  }
}

console.log(achados ? `\n${achados} chamada(s) fora de escopo` : "\nnenhum ajudante de Taverna chamado fora dele");
process.exit(achados ? 1 : 0);
