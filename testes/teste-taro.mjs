/* A CARTA DE TARÔ (v9.126)

   O rosto já existia desde a v8.8 e é bom: `tracos()` deriva pele, cabelo,
   olhos, penteado, barba e cicatriz de uma semente fixada na criação, para
   um elenco que não tem fim. O que a v9.126 acrescenta é o lugar onde esse
   rosto é GRANDE — e duas coisas na carta são DECISÃO, não pintura.

   Esta suíte prova as duas, e prova sobretudo que elas continuam sendo uma
   leitura do que o sistema já sabe, e não um sorteio na hora: um naipe que
   mudasse a cada abertura faria a carta mentir sobre a pessoa. */

const RAIZ = "../src/";
const { readFileSync } = await import("node:fs");
const TARO = await import(RAIZ + "taro.js");
const SEM = await import(RAIZ + "semente.js");
const CRU = (p) => readFileSync("../src/" + p, "utf8");
const semComentarios = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const CARTA = semComentarios(CRU("carta-taro.jsx"));
const UI = semComentarios(CRU("ui.jsx"));
const APP = semComentarios(CRU("App.jsx"));

let bons = 0, maus = 0;
const t = (nome, cond) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

sec("1. o número é o nível, em romano");
{
  const casos = [[1, "I"], [3, "III"], [4, "IV"], [5, "V"], [9, "IX"], [12, "XII"], [14, "XIV"], [19, "XIX"], [20, "XX"], [40, "XL"], [99, "XCIX"]];
  t("converte a escada inteira", casos.every(([n, r]) => TARO.romano(n) === r));
  /* nível 0 não existe no jogo, mas uma carta sem número não pode virar
     "undefined" gravado na moldura */
  t("sem nível, um travessão e não um buraco", TARO.romano(0) === "—" && TARO.romano(null) === "—" && TARO.romano("bobagem") === "—");
  t("não estoura com número quebrado", TARO.romano(7.8) === "VII");
}

sec("2. o naipe é o atributo mais alto");
{
  const com = (at) => TARO.naipeDe({ nome: "Fulano", atributos: at });
  t("força manda quando é a maior", com({ forca: 4, destreza: 1, vigor: 2 }).id === "forca");
  t("percepção também", com({ forca: 1, destreza: 2, percepcao: 5 }).id === "percepcao");
  t("e o nome do naipe vem junto", com({ presenca: 4 }).nome === "o cálice");
  /* O EMPATE tem de ser resolvido por uma ordem que o jogador JÁ CONHEÇA,
     senão dois personagens iguais recebem naipes diferentes por acaso de
     iteração. A ordem é a da ficha. */
  const empate = com({ forca: 4, vigor: 4 });
  t("no empate ganha o primeiro da ordem da ficha", empate.id === "forca");
  t("e isso é estável", [0, 1, 2, 3].every(() => com({ forca: 4, vigor: 4 }).id === "forca"));
  t("a carta sabe se o naipe saiu da ficha", com({ forca: 3 }).daFicha === true);
}

sec("3. QUEM NÃO TEM ATRIBUTO NENHUM AINDA TEM CARTA");
{
  /* A REDE: nenhum agente nasce mudo. Um figurante, um bicho, um nome solto
     no elenco — todos têm carta, e a carta tem naipe. */
  const fig = TARO.naipeDe({ nome: "Zulmira" });
  t("o figurante recebe naipe", !!fig.id && !!fig.nome);
  t("e a carta não mente dizendo que veio da ficha", fig.daFicha === false);
  t("nem o ente vazio quebra", !!TARO.naipeDe(null).id && !!TARO.naipeDe({}).id);
  /* e o sorteio é PRESO À SEMENTE: a carta de Zulmira é sempre a mesma
     carta. Um naipe que mudasse a cada abertura seria um enfeite piscando. */
  const dez = Array.from({ length: 10 }, () => TARO.naipeDe({ nome: "Zulmira" }).id);
  t("o mesmo nome dá sempre o mesmo naipe", new Set(dez).size === 1);
  t("nomes diferentes não caem todos no mesmo", new Set(["Ana", "Beto", "Caio", "Dita", "Elo", "Fim", "Gil", "Hugo"].map((n) => TARO.naipeDe({ nome: n }).id)).size > 1);
  /* a semente explícita ganha do nome, como em todo o resto da casa */
  t("a semente manda no nome", TARO.naipeDe({ nome: "Ana", semente: "Beto" }).id === TARO.naipeDe({ nome: "Beto" }).id);
}

sec("4. O ROSTO É UM SÓ — a bolinha e a carta desenham a mesma pessoa");
{
  /* Se cada moldura desenhasse o seu rosto, divergiriam no primeiro ajuste,
     e a mesma pessoa teria duas caras dependendo de onde se olha. */
  t("existe uma peça de rosto só", /export function Rosto\(/.test(CRU("rosto.jsx")));
  /* v9.158: o rosto passou a receber a PESSOA além da semente — a classe
     veste o traje e o sexo dá a geometria. O que a lei protege é o mesmo
     de sempre: os dois desenham com a MESMA chamada, byte a byte. */
  t("a bolinha a usa", /<Rosto semente=\{semente\} estado=\{estado\} ente=\{ente\} \/>/.test(UI));
  t("a carta usa a mesma", /<Rosto semente=\{semente\} estado=\{estado\} ente=\{ente\} \/>/.test(CARTA));
  t("e ninguém mais redesenha traço de rosto", !/formatoRosto|penteado/.test(CARTA) && !/formatoRosto|penteado/.test(UI));
  /* a conta saiu do .jsx para poder ser provada — foi o que permitiu esta
     suíte existir */
  t("os traços vêm de um módulo de conta", typeof SEM.tracos === "function" && !/export function tracos/.test(CRU("rosto.jsx")));
  t("e o mesmo nome dá sempre o mesmo rosto", JSON.stringify(SEM.tracos("Íris")) === JSON.stringify(SEM.tracos("Íris")));
  t("nomes diferentes dão rostos diferentes", JSON.stringify(SEM.tracos("Íris")) !== JSON.stringify(SEM.tracos("Kael")));
}

sec("5. A REGRA NÃO MORA NO DESENHO");
{
  t("o número é pedido, não calculado no SVG", /romano\(nivel\)/.test(CARTA) && !/function romano/.test(CARTA));
  t("o naipe é pedido, não escolhido no SVG", /naipeDe\(ente\)/.test(CARTA) && !/function naipeDe/.test(CARTA));
  t("o SVG só guarda o traço de cada emblema", /const EMBLEMAS = \{/.test(CARTA));
  /* achado relendo: a primeira versão da carta reescreveu à mão os limiares
     do ferimento (0,25 / 0,55 / 0,33 / 0,66) que `estadoDe` já define. Dois
     lugares decidindo quando alguém está grave é o começo de uma carta que
     mostra sangue enquanto a bolinha do grupo mostra a pessoa inteira. */
  t("o ferimento é pedido a estadoDe", /estadoDe\(pv, pvMax, inimigo\)/.test(CARTA));
  /* o limiar reescrito seria uma COMPARAÇÃO; `opacity="0.25"` é cor. Medir
     o número solto acusava a moldura de decidir ferimento. */
  t("e não há limiar reescrito no desenho", !/<=\s*0\.(25|55|33|66)/.test(CARTA));
  t("estadoDe continua sendo a régua de todos",
    SEM.estadoDe(5, 30) === "grave" && SEM.estadoDe(15, 30) === "ferido" && SEM.estadoDe(28, 30) === "normal"
    && SEM.estadoDe(6, 30, true) === "grave" && SEM.estadoDe(15, 30, true) === "furioso");
  t("e há um emblema para cada atributo", ["forca", "destreza", "vigor", "intelecto", "presenca", "percepcao"].every((id) => new RegExp(`\\n  ${id}: \\(c\\)`).test(CARTA)));
}

sec("6. TODO RETRATO ABRE A CARTA, E NENHUM PAINEL PRECISOU SABER DISSO");
{
  /* A alternativa era o App guardar "que carta está aberta" e enfiar um
     callback em cada painel que desenha gente. Prop atravessando componente
     que não usa é exatamente como uma regra deixa de valer num dos caminhos
     — alguém acrescenta o oitavo retrato e esquece de passar. */
  t("o retrato guarda a própria carta", /const \[aberta, setAberta\] = React\.useState\(false\)/.test(UI));
  /* v9.158: `semCarta` entrou para o retrato que já mora dentro de outro
     botão — ele veste o traje sem virar segundo botão */
  t("e só vira botão quando recebe a pessoa", /const abre = ente && !semCarta \? \(\) => setAberta\(true\) : null;/.test(UI));
  t("sem pessoa, continua uma bolinha muda", /role=\{abre \? "button" : undefined\}/.test(UI));
  t("dá para abrir pelo teclado", /e\.key === "Enter" \|\| e\.key === " "/.test(UI));
  /* os lugares que passaram a entregar a pessoa */
  /* o espaço antes de `ente=` não é preciosismo: sem ele o `semente=` de
     todo retrato conta como se fosse a pessoa, e a prova jura que estão
     todos ligados quando nenhum está */
  const entes = (APP.match(/<Retrato [^>]*\sente=\{/g) || []).length;
  t(`o App entrega a pessoa em ${entes} retratos`, entes === 6);
  t("a ficha também", /<Retrato semente=\{sementeDe\(p\)\} ente=\{p\}/.test(semComentarios(CRU("painel-ficha.jsx"))));
  t("o inimigo abre carta de inimigo", (APP.match(/ente=\{e\} inimigo/g) || []).length === 2);
  /* e o retrato do cabeçalho NÃO: ele já é o botão que abre a ficha, e
     botão dentro de botão passa no teste e falha no dedo */
  /* v9.158: o atalho aponta para a GESTÃO (a ficha é sub-aba dela desde a
     fusão das abas — `setAba("ficha")` abria painel de título errado e
     corpo vazio), e o retrato veste o traje sem virar segundo botão */
  t("o do cabeçalho continua sendo só o atalho da ficha", /<button onClick=\{\(\) => setAba\("gestao"\)\}[\s\S]{0,460}<Retrato semente=\{sementeDe\(personagem\)\} ente=\{personagem\} semCarta/.test(APP));
}

console.log(`\ntarô v9.126: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
