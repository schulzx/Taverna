/* A XILOGRAVURA (v9.158)

   O rosto antigo era um desenho animado — elipses chapadas e olhos de
   brinquedo — dentro de uma moldura de tarô séria. O novo é gravura:
   traço de tinta, hachura, e QUATRO eixos em vez de um. A semente dá o
   que faz cada pessoa uma pessoa; o sexo dá a geometria; a classe dá o
   traje; a subclasse dá uma cor de acento.

   O QUE ESTA SUÍTE PROTEGE, em ordem de estrago:

   1. DETERMINISMO — a mesma pessoa dá sempre a mesma cara. O dia em que
      um retrato muda entre duas aberturas do jogo, o jogador não reporta
      defeito: ele desconfia do save inteiro.
   2. A APRESENTAÇÃO É ESCOLHA DE MESA — estrita cumpre a ficha sempre;
      livre cruza uma minoria semeada; e quem ESCOLHEU a própria cara
      (`fixo`) nunca entra no sorteio, nem no mundo livre.
   3. TODA CLASSE TEM TRAJE — um mago sem chapéu num elenco em que todos
      os outros vestem a classe não parece escolha: parece bug. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const SEM = await import(S + "semente.js");
const { CLASSES } = await import(S + "classes.js");
const ROSTO = readFileSync(S + "rosto.jsx", "utf8");
const UI = readFileSync(S + "ui.jsx", "utf8");
const APP = readFileSync(S + "App.jsx", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. A MESMA PESSOA DÁ SEMPRE A MESMA CARA");
{
  const a = SEM.feicoes("Ume|caçadora|123", { genero: "mulher" });
  const b = SEM.feicoes("Ume|caçadora|123", { genero: "mulher" });
  t("as feições são determinísticas", JSON.stringify(a) === JSON.stringify(b));
  /* e sementes diferentes variam — um gerador que dá a mesma cara para
     todo mundo é determinístico e inútil */
  const caras = new Set();
  for (let i = 0; i < 40; i++) {
    const f = SEM.feicoes("p" + i, { genero: "homem" });
    caras.add(`${f.cabelo}|${f.barba}|${f.franja}|${f.queixo.toFixed(2)}`);
  }
  t(`40 homens dão ${caras.size} combinações`, caras.size >= 25);
  t("lixo não quebra", !!SEM.feicoes(null) && !!SEM.feicoes(undefined, null));
}

sec("2. NO MUNDO ESTRITO, A FICHA MANDA SEMPRE");
{
  let certas = 0;
  for (let i = 0; i < 200; i++) {
    if (SEM.feicoes("m" + i, { genero: "mulher", apresentacao: "estrita" }).fem) certas++;
    if (!SEM.feicoes("h" + i, { genero: "homem", apresentacao: "estrita" }).fem) certas++;
  }
  t("400 fichas, 400 retratos que obedecem", certas === 400);
  /* sem ficha (bicho, gente sem sexo anotado), a semente decide — e o
     resultado é misto, não um mundo de um sexo só */
  let fems = 0;
  for (let i = 0; i < 100; i++) if (SEM.feicoes("x" + i).fem) fems++;
  t(`sem ficha, a semente decide (${fems}/100 fem)`, fems > 25 && fems < 75);
}

sec("3. NO MUNDO LIVRE, UMA MINORIA SEMEADA");
{
  let cruzaram = 0;
  for (let i = 0; i < 700; i++) {
    const estrita = SEM.feicoes("p" + i, { genero: "mulher", apresentacao: "estrita" }).fem;
    const livre = SEM.feicoes("p" + i, { genero: "mulher", apresentacao: "livre" }).fem;
    if (estrita !== livre) cruzaram++;
  }
  /* cerca de um em sete: minoria de verdade, não metade nem enfeite */
  t(`de 700, ${cruzaram} apresentam-se diferente (~1/7)`, cruzaram > 60 && cruzaram < 140);
  /* E A REGRA QUE MAIS IMPORTA: quem escolheu a própria cara não entra no
     sorteio. O herói marcou "mulher" no formulário; o gerador desfazer
     isso seria decidir o que não é dele. */
  let fixos = 0;
  for (let i = 0; i < 700; i++) {
    if (SEM.feicoes("p" + i, { genero: "mulher", apresentacao: "livre", fixo: true }).fem) fixos++;
  }
  t("com `fixo`, as 700 obedecem a ficha", fixos === 700);
  /* a criação grava a marca do escolhido, e o rosto a lê */
  t("a criação grava genero e feicoesFixas", /genero: sexo, feicoesFixas: true,/.test(APP));
  t("e o rosto respeita a marca", /fixo: fixo \|\| e\.feicoesFixas === true,/.test(ROSTO));
  /* barba é traço da apresentação masculina; o sorteio nunca põe uma na
     apresentação feminina */
  let barbas = 0;
  for (let i = 0; i < 300; i++) if (SEM.feicoes("f" + i, { genero: "mulher" }).barba) barbas++;
  t("nenhuma barba na apresentação feminina", barbas === 0);
}

sec("4. TODA CLASSE VESTE O PRÓPRIO TRAJE");
{
  /* o TRAJES é chaveado pelo NOME da classe — o mesmo nome do catálogo.
     Classe nova sem traje entra aqui no dia em que nascer. */
  const bloco = ROSTO.slice(ROSTO.indexOf("const TRAJES = {"), ROSTO.indexOf("/* ---------------- o rosto inteiro"));
  for (const c of CLASSES) {
    t(`${c.nome} tem traje`, new RegExp(`(^|\\s|")${c.nome}"?: \\(g, ac\\)`, "m").test(bloco));
  }
  /* o acento da subclasse: uma cor, sempre a mesma, sem tabela a manter */
  t("a cor da subclasse é estável", SEM.acentoDe("Círculo da Lua") === SEM.acentoDe("Círculo da Lua"));
  t("e é uma cor de verdade", /^#[0-9A-F]{6}$/i.test(SEM.acentoDe("qualquer coisa")));
  t("sem subclasse, o violeta da casa", SEM.acentoDe("") === "#8B7BD8" && SEM.acentoDe(null) === "#8B7BD8");
  t("subclasses diferentes podem divergir", SEM.acentoDe("Evocador") !== SEM.acentoDe("Punho Aberto") || SEM.acentoDe("Campeão") !== SEM.acentoDe("Evocador"));
  /* a subclasse do herói mora em dois lugares conforme a idade da ficha */
  t("o rosto aceita as duas grafias da subclasse", /\(e\.subclasses \|\| \{\}\)\[e\.classe\] \|\| e\.subclasse/.test(ROSTO));
}

sec("5. O QUADRO E O ESTADO NÃO MUDARAM");
{
  /* o contrato que os dois leitores assinaram na v9.126 */
  t("o quadro segue 64×64 com o rosto em (32,30)", /sempre 64×64 com o rosto em \(32,30\)/.test(ROSTO));
  t("os quatro estados continuam", ["grave", "ferido", "furioso"].every((e) => ROSTO.includes(`estado === "${e}"`)));
  t("estadoDe não mudou de régua", SEM.estadoDe(10, 10) === "normal" && SEM.estadoDe(5, 10) === "ferido" && SEM.estadoDe(2, 10) === "grave" && SEM.estadoDe(5, 10, true) === "furioso");
  /* a tinta é UMA: gravura com três tons de linha vira desenho digital */
  t("a tinta é uma só", (ROSTO.match(/const TINTA = /g) || []).length === 1);
}

sec("6. A APRESENTAÇÃO ENTRA POR CONTEXTO, E O MUNDO A ESCOLHE");
{
  /* passada de mão em mão por sete painéis, a escolha deixaria de valer
     num dos caminhos — alguém desenha o oitavo retrato e esquece */
  t("o contexto existe", /export const AjusteDoRetrato = React\.createContext/.test(ROSTO));
  t("o rosto o lê", /React\.useContext\(AjusteDoRetrato\)/.test(ROSTO));
  t("o App o provê uma vez", (APP.match(/<AjusteDoRetrato\.Provider/g) || []).length === 1);
  t("com a escolha do mundo", /apresentacao: \(mundo \|\| \{\}\)\.apresentacao \|\| "estrita"/.test(APP));
  /* a tela do mundo oferece as DUAS, sem opinar — é escolha de mesa */
  t("a tela do mundo pergunta", /id: "estrita", nome: "🏰 Clássica"/.test(APP) && /id: "livre", nome: "🌈 Plural"/.test(APP));
  t("e a escolha viaja com o mundo", /estrutura, molde, voz, apresentacao, limites: limites\.trim\(\) \}/.test(APP));
  /* o padrão é o clássico: o plural é opt-in de quem senta à mesa */
  t("o padrão é a estrita", /useState\("estrita"\)/.test(APP));
}

sec("7. O FORMULÁRIO DO HERÓI PERGUNTA O SEXO");
{
  t("a pergunta existe", /Seu herói é/.test(APP));
  t("com as duas respostas", /\["homem", "♂ Homem"\], \["mulher", "♀ Mulher"\]/.test(APP));
  /* sem resposta não há retrato certo — o botão espera */
  t("e o começo espera por ela", /desativado=\{!nome\.trim\(\) \|\| !conceito\.trim\(\) \|\| !sexo \|\| restantes !== 0\}/.test(APP));
  /* o dado de nome respeita a escolha: sortear "Aldric" para quem marcou
     mulher seria o botão desmentindo o formulário */
  t("o dado de nome respeita o sexo", /sexo === "mulher" \? "fem" : sexo === "homem" \? "masc" : undefined/.test(APP));
}

sec("8. QUEM DESENHA ENTREGA A PESSOA");
{
  /* sem `ente`, a classe nunca chega ao traje — e o retrato mente por
     omissão sobre a única coisa que o jogador escolheu */
  t("a bolinha entrega", /<Rosto semente=\{semente\} estado=\{estado\} ente=\{ente\} \/>/.test(UI));
  t("a carta entrega", /<Rosto semente=\{semente\} estado=\{estado\} ente=\{ente\} \/>/.test(readFileSync(S + "carta-taro.jsx", "utf8")));
  /* o do cabeçalho veste o traje SEM virar segundo botão */
  t("o cabeçalho veste sem carta", /ente=\{personagem\} semCarta/.test(APP));
}

console.log(`\nrosto v9.158: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
