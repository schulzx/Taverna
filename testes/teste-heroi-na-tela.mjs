/* O BLOCO DO HERÓI (v9.160)

   PV e PM eram duas barrinhas anônimas ao lado da data, como se a vida
   do herói e o relógio fossem informação do mesmo peso. Agora moram
   coladas no retrato — que já reage sozinho, porque a xilogravura muda
   a cara com o estado — e o bloco inteiro SENTE: clarão quando a vida
   cai, pulso vermelho na agonia.

   O QUE ESTA SUÍTE PROTEGE:

   1. O CLARÃO ESCUTA A MUDANÇA, não um evento. A vida cai por dez
      caminhos — golpe, veneno, marcha forçada, maldição — e um efeito
      sobre `personagem.vida` pega todos de uma vez. No dia em que
      alguém trocar isso por "avisar no golpe", os outros nove caminhos
      param de acender o bloco, um por um, sem ninguém notar.
   2. UM RETRATO DO HERÓI POR TELA. O bloco assumiu o atalho da ficha e
      o retrato do cabeçalho saiu — dois retratos da mesma pessoa na
      mesma tela eram duas verdades visuais. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const APP = readFileSync(S + "App.jsx", "utf8");
const CSS = readFileSync(S + "constantes.js", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. O CLARÃO ESCUTA A MUDANÇA DA VIDA");
{
  t("a última vida vista fica num ref", /const vidaVistaRef = useRef\(null\);/.test(APP));
  t("e o efeito compara com a de agora", /if \(antes != null && v != null && v < antes\)/.test(APP));
  t("o clarão morre sozinho", /setTimeout\(\(\) => setFeridaRecente\(false\), 750\)/.test(APP));
  t("e o timeout morre com o efeito", /return \(\) => clearTimeout\(tid\);/.test(APP));
  t("escutando a vida, não um evento", /\}, \[personagem && personagem\.vida\]\);/.test(APP));
}

sec("2. O BLOCO SENTE — as três caras dele");
{
  /* normal, clarão de dano, pulso de agonia — e o clarão ganha do pulso,
     porque o golpe é agora e a agonia continua lá depois */
  t("o clarão ganha da agonia", /feridaRecente \? "tv-dano" : grave \? "tv-agonia" : ""/.test(APP));
  t("a borda acompanha", /border: `1px solid \$\{feridaRecente \|\| grave \? T\.danger : T\.line\}`/.test(APP));
  t("agonia é um terço da vida", /personagem\.vida \/ personagem\.vidaMax <= 1 \/ 3/.test(APP));
  /* as animações moram no CSS da casa, e o clarão não repete */
  t("o clarão existe e não se repete", /\.tv-dano \{ animation: tvDano \.7s ease both; \}/.test(CSS));
  t("a agonia pulsa sem parar", /\.tv-agonia \{ animation: tvAgonia 1\.6s ease infinite; \}/.test(CSS));
  /* o retrato muda de cara junto: o estado entra pelo mesmo estadoDe */
  const bloco = APP.slice(APP.indexOf("O BLOCO DO HERÓI"), APP.indexOf("O BLOCO DO HERÓI") + 3200);
  t("o retrato reage pelo estado", /estado=\{estadoDe\(personagem\.vida, personagem\.vidaMax\)\}/.test(bloco));
  t("o anel avermelha na agonia", /anel=\{grave \? T\.danger : T\.amber\}/.test(bloco));
  t("a barra de vida também", /background: grave \? T\.danger : T\.amber/.test(bloco));
  t("e o nível mora no losango", /rotate\(45deg\)/.test(bloco));
}

sec("3. UM RETRATO DO HERÓI POR TELA");
{
  /* o bloco é o atalho da ficha; o retrato do cabeçalho saiu */
  const cabecalho = APP.slice(APP.indexOf("<header"), APP.indexOf("</header>"));
  t("o cabeçalho não tem mais retrato", !/<Retrato/.test(cabecalho));
  t("e diz para onde ele foi", /o retrato saiu do cabeçalho \(v9\.160\)/.test(APP));
  t("o bloco abre a ficha", /<button onClick=\{\(\) => setAba\("gestao"\)\} title="Abrir ficha"/.test(APP));
  /* dentro de botão, o retrato não pode abrir carta — mesmo contrato do
     antigo atalho */
  t("sem carta dentro do botão", /ente=\{personagem\} semCarta tamanho=\{34\}/.test(APP));
  /* as barrinhas anônimas de PV/PM DO HERÓI saíram — o bloco é a única
     casa delas. As BarraMini que ficaram são de outras pessoas: o
     companheiro no cartão dele e o inimigo no combate. */
  t("a BarraMini de PV do herói saiu", !/<BarraMini rotulo="PV" atual=\{personagem\.vida\}/.test(APP));
  t("a de PM também", !/<BarraMini rotulo="PM" atual=\{personagem\.mana\}/.test(APP));
  t("e o NV solto virou o losango", !/>NV \{personagem\.nivel\}</.test(APP));
}

console.log(`\nherói na tela v9.160: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
