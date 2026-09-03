/* A GRADE DESENHADA (v9.125)

   Esta suíte defende uma fronteira e não um desenho. O que a v9.125 fez foi
   trocar a PINTURA do campo de batalha: a malha de <button> virou SVG. A
   regra não mudou uma linha, e é isso que precisa continuar verdade — no
   dia em que alguém ajeitar uma cor e resolver calcular o alcance "só ali,
   rapidinho", o tabuleiro passa a ter uma segunda opinião sobre quem chega
   onde, e duas opiniões sobre a mesma coisa é como nasce o bug que ninguém
   acha.

   Então: quem sabe de distância, caminho, alcance, cobertura e tamanho é o
   `grid.js`. O painel pergunta e desenha. As provas abaixo medem CÓDIGO —
   nunca os comentários que o explicam. */

const RAIZ = "../src/";
const { readFileSync } = await import("node:fs");
const G = readFileSync(RAIZ + "grade-de-batalha.jsx", "utf8");
const APP = readFileSync(RAIZ + "App.jsx", "utf8");
const GRID = await import("../src/grid.js");

/* O CÓDIGO SEM OS COMENTÁRIOS. Esta base já se queimou uma vez com provas
   que casavam com a PROSA que explicava a remoção de alguma coisa — o
   comentário "🧍🛡👹 saíram do tabuleiro" fazia a prova jurar que eles
   continuavam no desenho. O que se mede aqui é o que roda. */
const CODIGO = G.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");

let bons = 0, maus = 0;
const t = (nome, cond) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

sec("1. a grade saiu do App e virou módulo");
{
  t("o App não define mais o componente", !/function GridDeBatalha\(/.test(APP));
  t("ele importa do módulo novo", /import \{ GridDeBatalha \} from "\.\/grade-de-batalha\.jsx"/.test(APP));
  t("e continua entregando o mesmo onMover", /onMover=\{moverPara\}/.test(APP));
  /* o que o painel de combate passa para cá tem de continuar existindo do
     outro lado, senão a troca de arquivo vira troca de contrato */
  for (const p of ["combate", "grupo", "previsao", "passoM", "passoTotal", "ignoraDificil", "podeMover", "onMover", "mira", "onMirar", "alcanceMira"]) {
    t(`a prop \`${p}\` continua na assinatura`, new RegExp(`[{,]\\s*${p}\\b`).test(G.slice(G.indexOf("export function GridDeBatalha"), G.indexOf("export function GridDeBatalha") + 400)));
  }
}

sec("2. NENHUMA REGRA REESCRITA NO DESENHO");
{
  /* a lista do que o painel PERGUNTA em vez de decidir */
  for (const f of ["alcancaveisDe", "caminhar", "ocupacaoDe", "quadradosDe", "ladoDe", "tamanhoDe", "ehParede", "ehEstorvo", "terrenoDificil", "temCobertura", "nomeDoLugar", "distanciaM", "metrosTxt"]) {
    t(`pergunta ao grid: ${f}`, new RegExp(`\\b${f}\\b`).test(G) && typeof GRID[f] === "function");
  }
  /* e o que ele NÃO pode ter: conta de distância, de metro por quadrado ou
     de alcance feita à mão dentro do desenho */
  t("não guarda uma segunda medida do quadrado", !/=\s*1\.5\b/.test(CODIGO));
  t("não tem busca de caminho própria", !/(BFS|filaDeBusca|veioDe)/.test(CODIGO));
  t("cobertura vem de temCobertura", /temCobertura\(grade, x, y\)/.test(CODIGO) && !/\.cobertura\b/.test(CODIGO));
}

sec("3. O VÉU — o que não se alcança escurece, em vez de o alcance acender");
{
  /* A primeira versão pintava de dourado o alcançável. Como o alcance quase
     sempre é a maior parte do campo, o tabuleiro inteiro virava uma mancha
     e o chão sumia. O véu diz a mesma coisa pelo avesso. */
  t("o alcance sai do grid, não de uma conta local", /alcancaveisDe\(grade, heroi, \{ ocupados, deslocamentoM: passoM/.test(G));
  t("mirando, quem manda é o alcance da habilidade", /new Set\(mirando \? noAlcance : podeIr\)/.test(G));
  t("o véu é o complemento do alcance", /if \(!alcanceCheio\.has\(K\(x, y\)\)\) veu\.push/.test(G));
  t("e não sobrou pintura de fundo no alcançável", !/rgba\(232,163,61,0\.09\)/.test(G));
}

sec("4. SEM BURACOS — ficha dentro do passo não usa caixinha nem sombra");
{
  /* Um quadrado ocupado não é alcançável: não dá para parar em cima de
     ninguém. Sem tapar esses furos, cada inimigo dentro do seu passo ganhava
     um tracejado em volta e uma mancha escura embaixo — a tela dizia
     "selecionado" onde a regra dizia apenas "ocupado". */
  t("existe o tapa-buraco", /function semBuracos\(conjunto, largura, altura\)/.test(G));
  t("ele escoa a partir da borda do campo", /for \(let x = 0; x < largura; x\+\+\) \{ poe\(x, 0\); poe\(x, altura - 1\); \}/.test(G));
  t("o véu usa o conjunto tapado", /const alcanceCheio = alcance\.size \? semBuracos\(/.test(G));
  t("e o contorno também", /contorno\(alcanceCheio\)/.test(G));
  t("o quadrado de quem olha nunca é velado", /quadradosDe\(heroi\)\.forEach\(\(q\) => alcance\.add\(/.test(G));
}

sec("5. O PASSO ANDA — e anda pelo caminho que o sistema cobrou");
{
  /* `caminhar` sempre devolveu o caminho e nada olhava para ele: o x,y do
     herói trocava e a ficha aparecia do outro lado do salão. */
  t("o caminho é refeito entre o antes e o agora", /const de = \{ \.\.\.heroi, x: antes\.x, y: antes\.y \}/.test(G));
  t("com o `caminhar` do grid, não com uma reta", /caminhar\(grade, de, alvo, \{ ocupados: ocup/.test(G));
  t("a ficha percorre a rota quadrado a quadrado", /setAndando\(\{ rota, i, ms \}\)/.test(G));
  t("e o desenho segue a rota, não a posição final", /x=\{andando \? andando\.rota\[andando\.i\]\.x : heroi\.x\}/.test(G));
  t("o deslizamento é do CSS, que é o único que transiciona", /transition: `transform \$\{ms\}ms linear`/.test(G));
  /* a rota da previsão é a MESMA função, com o orçamento do turno: senão o
     pontilhado promete um caminho que o clique não cumpre */
  t("a rota prevista usa o passo que sobrou", /caminhar\(grade, heroi, sobre, \{ ocupados, deslocamentoM: passoM, ignoraDificil \}\)/.test(G));
}

sec("6. A LEGENDA DESCREVE O QUE ESTÁ DESENHADO");
{
  /* Uma legenda que fala do desenho anterior é pior do que nenhuma: ela
     ensina o jogador a procurar o que não está lá. */
  const semEmoji = !/🧍|🛡|👹/.test(CODIGO);
  t("os emojis saíram do tabuleiro", semEmoji);
  /* v9.161: a inicial deu lugar ao ROSTO — a xilogravura fez a cara dizer
     mais que a letra, e a legenda acompanhou de novo */
  t("e saíram da legenda junto", semEmoji && /o rosto de cada um/.test(CODIGO));
  t("a ficha desenha o rosto da casa", /<Rosto semente=\{sementeDe\(ent\)\} estado=\{estadoDe\(pv, pvMax, tipo === "inimigo"\)\} ente=\{ent\} \/>/.test(G));
  t("o herói entra com a ficha completa por baixo", /<Ficha ent=\{\{ \.\.\.\(heroiFicha \|\| \{\}\), \.\.\.heroi \}\} rotulo="você"/.test(G));
  t("o balão de cada quadrado continua dizendo o lugar", /nomeDoLugar\(grade, x, y\)/.test(G));
}

sec("7. O COMPACTO CONTINUA SENDO UM RELANCE");
{
  /* A v9.34 já tinha diagnosticado o defeito oposto: tabuleiro sempre grande
     empurra a narração para fora da tela. O teto é a altura. */
  /* v9.161: o teto subiu de 320 para 380 px — o combate era o painel mais
     espremido da mesa — mas continua sendo um TETO: a lei protegida aqui é
     que o compacto não empurra a narração para fora da tela */
  t("o lado do quadrado tem teto pela altura do campo", /Math\.min\(40, 380 \/ g\.altura\)/.test(G));
  t("a tela cheia cabe na janela, não numa conta de pixel", /min\(94vw, \$\{Math\.round\(\(68 \* g\.largura\) \/ g\.altura\)\}vh\)/.test(G));
  t("e o botão de ampliar continua existindo", /⤢ ampliar/.test(G));
}

console.log(`\ngrade v9.125: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
