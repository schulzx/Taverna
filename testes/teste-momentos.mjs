/* OS MOMENTOS QUE VALEM CENA (v9.163)

   O jogo tinha três acontecimentos raros que passavam como linha de
   sistema no rodapé: subir de nível abria uma nota fiscal ("Nível 7,
   dois números, um botão"), o item lendário chegava como "◆ Achado: …"
   entre outras dez linhas, e trocar de cidade era "🧭 Chegada: …". O
   tombamento, quarto momento do plano, já valia cena desde a v9.42 (os
   dados que decidiram + as duas saídas com preço) e não foi tocado.

   O QUE ESTA SUÍTE PROTEGE é a fronteira de sempre: os momentos
   ANUNCIAM o que o sistema fez — a carta que vira mostra o nível que a
   tabela já deu; a revelação mostra o item que gerarLoot já criou; a
   faixa mostra a cidade que cidade_atual já registrou. Nenhum deles
   decide nada, e cada um tem o peso certo: modal para o que o jogador
   precisa confirmar, faixa que se apaga para o que é passagem. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const APP = readFileSync(S + "App.jsx", "utf8");
const CARTA = readFileSync(S + "carta-taro.jsx", "utf8");
const CSS = readFileSync(S + "constantes.js", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. A VIRADA DA CARTA — o nível abre com a carta de costas");
{
  t("o verso existe", /export function CartaVerso\(\)/.test(CARTA));
  /* verso ÚNICO, sem semente e sem texto: verso que muda por pessoa
     entrega a carta antes da virada */
  const verso = CARTA.slice(CARTA.indexOf("export function CartaVerso"));
  t("e é um só para o baralho inteiro", !/semente|ente/.test(verso.slice(0, verso.indexOf("return"))));
  t("sem texto nenhum", !/<text/.test(verso));
  t("o modal põe a carta no palco da virada", /<div className="tv-vira-palco/.test(APP) && /<div className="tv-vira">/.test(APP));
  t("a frente é a carta do herói com o nível NOVO", /<CartaDeTaro ente=\{\{ \.\.\.personagem, nivel \}\} lex=\{lex\} \/>/.test(APP));
  t("e o dorso é o verso", /<div className="tv-vira-verso"><CartaVerso \/><\/div>/.test(APP));
  /* a animação respira antes de virar: o jogador precisa VER o verso */
  t("a virada espera o olhar", /\.tv-vira \{ [^}]*\.45s both/.test(CSS));
  t("as faces escondem o dorso", /\.tv-vira-face \{ backface-visibility: hidden/.test(CSS));
  t("e o verso nasce virado", /\.tv-vira-verso \{ [^}]*rotateY\(180deg\)/.test(CSS));
}

sec("2. O ESPÓLIO REVELADO — raro para cima, e só");
{
  /* revelar item comum ensinaria a fechar o modal sem ler — e aí o
     lendário passaria batido também */
  t("a revelação existe", /function RevelacaoDoEspolio\(\{ item, fechar \}\)/.test(APP));
  t("só raro para cima a abre", /if \(\["raro", "epico", "lendario", "unico"\]\.includes\(it\.raridade\)\) setEspolioRevelado\(it\)/.test(APP));
  t("a cor é a da raridade, da tabela de sempre", /const cor = RARIDADE_COR\[item\.raridade\]/.test(APP));
  /* v9.179 (`momento-loot-epico-v2`): a lista de poderes saiu de dentro do
     JSX para uma variável, porque a grade do desenho precisa CONTAR quantas
     cartas há para decidir uma ou duas colunas. A lei é a mesma: todo poder
     aparece com o `diz` dele. */
  t("os poderes entram com o `diz` deles", /const poderes = item\.poderes \|\| \[\];/.test(APP) && /poderes\.map/.test(APP) && /\{p\.diz\}/.test(APP));
  /* E A CONCESSÃO PASSOU A APARECER. `afixos.js` a chama de "o que faz o
     lendário ser lendário" — ela põe uma habilidade do catálogo na mão do
     herói, de graça — e a revelação não a mostrava: o jogador via os números
     e não via a única coisa que muda o que ele PODE FAZER. */
  t("e a concessão finalmente aparece", /\{item\.concede && \(/.test(APP) && /\{item\.concede\}<\/div>/.test(APP));
  t("dizendo que ela sai sem PM", /você usa sem gastar PM/.test(APP));
  /* o brilho de trás segue a raridade: violeta fixo mentiria no lendário */
  t("o brilho de trás é da cor da raridade", /radial-gradient\(circle, \$\{cor\}/.test(APP));
  t("e diz onde o item já está", /Já está na sua mochila/.test(APP));
  /* a revelação NÃO entrega nada: o item entrou na mochila ANTES dela —
     fechar o modal sem ler não pode custar o item */
  const iGuarda = APP.indexOf("setPersonagem((p) => ({ ...p, equipamento: [...(p.equipamento || []), it] }));");
  const iRevela = APP.indexOf("setEspolioRevelado(it)");
  t("o item entra na mochila antes da revelação", iGuarda > 0 && iGuarda < iRevela);
  t("o brilho pulsa pelo CSS da casa", /\.tv-reliquia \{ animation: tvReliquia/.test(CSS));
}

sec("3. A CHEGADA — faixa que se apaga sozinha");
{
  t("a faixa existe", /function FaixaDeChegada\(\{ chegada, limpar \}\)/.test(APP));
  /* chegada é cena de passagem, não modal: bloquear o jogador a cada
     viagem seria cobrar pedágio pelo cenário */
  t("não come toque nenhum", /className="tv-faixa fixed inset-x-0 top-16 z-40 flex justify-center pointer-events-none/.test(APP));
  t("e se apaga sozinha", /const tid = setTimeout\(limpar, 3600\);/.test(APP));
  t("com o timeout morrendo com o efeito", /return \(\) => clearTimeout\(tid\);/.test(APP));
  /* o tom do bioma vem da tabela do palco — a mesma do cabeçalho de cena */
  t("o tom é o do palco", /const tom = \(TONS\[chegada\.bioma\] \|\| TOM_PADRAO\)/.test(APP));
  t("importado da tabela única", /import \{ cabecalhoDaCena, TONS, TOM_PADRAO \} from "\.\/palco\.js"/.test(APP));
  /* só TROCAR de cidade chega — reafirmar a cidade em que já estou, não */
  const bloco = APP.slice(APP.indexOf("A FAIXA DE CHEGADA (v9.163)"), APP.indexOf("A FAIXA DE CHEGADA (v9.163)") + 600);
  t("só a troca de cidade dispara", /if \(trocouCidade\) \{/.test(bloco));
  t("com os dados da cidade do mapa", /cidadeDoMapa\(md\.cidade_atual\)/.test(bloco));
}

sec("4. OS MOMENTOS SÓ EXISTEM EM JOGO");
{
  t("a revelação só na fase de jogo", /\{fase === "jogo" && espolioRevelado && <RevelacaoDoEspolio/.test(APP));
  t("a faixa também", /\{fase === "jogo" && <FaixaDeChegada/.test(APP));
  /* e os fixtures de bancada não podem vazar para o commit */
  t("o espólio nasce vazio", /const \[espolioRevelado, setEspolioRevelado\] = useState\(null\);/.test(APP));
  t("a chegada também", /const \[chegada, setChegada\] = useState\(null\);/.test(APP));
}

sec("5. O LUGAR NOVO — a cerimônia da primeira pisada (v9.181)");
{
  /* A faixa é para CHEGAR; a cerimônia é para chegar PELA PRIMEIRA VEZ. A
     distinção não foi inventada para caber o desenho: `geografia.js` guarda
     `pisada` em cada cidade desde a v9.51, para separar "ouvi falar" de "pus
     o pé". Chegar a uma cidade conhecida continua sendo a faixa que se apaga
     sozinha, e a lei da v9.163 vale inteira. */
  t("a cerimônia existe", /function CerimoniaDoLugarNovo\(\{ lugar, fechar \}\)/.test(APP));
  t("e a faixa continua existindo ao lado dela", /function FaixaDeChegada\(\{ chegada, limpar \}\)/.test(APP));
  /* A PERGUNTA É FEITA ANTES DE PISAR: depois de `pisarNaCidade` ninguém
     consegue mais saber se era a primeira vez. */
  t("a primeira pisada é medida antes de pisar",
    APP.indexOf("const primeiraPisada =") < APP.indexOf("mapaRef.current = pisarNaCidade(mapaRef.current, md.cidade_atual)")
    && /const primeiraPisada = !\(\(cidadeDoMapa\(md\.cidade_atual\) \|\| \{\}\)\.pisada\);/.test(APP));
  t("primeira vez abre a cerimônia", /if \(primeiraPisada\) setLugarNovo\(/.test(APP));
  t("e o retorno continua na faixa", /else setChegada\(\{ cidade: md\.cidade_atual/.test(APP));
  /* e as duas só existem em jogo, como todo momento desta casa */
  t("a cerimônia só na fase de jogo", /fase === "jogo" && lugarNovo && <CerimoniaDoLugarNovo/.test(APP));
  t("e nasce vazia", /const \[lugarNovo, setLugarNovo\] = useState\(null\);/.test(APP));

  /* O QUE O DESENHO PEDIA E NÃO ENTROU: "PERIGO: ALTO" e "RECURSOS:
     MODERADO". Uma cidade não tem nível de perigo nem de recursos nesta
     casa — quem tem dificuldade é o encontro, e quem tem vocação é o
     mercado. */
  t("não inventou perigo de cidade", !/PERIGO/.test(APP.slice(APP.indexOf("function CerimoniaDoLugarNovo"), APP.indexOf("function FaixaDeChegada"))));
  const bloco = APP.slice(APP.indexOf("function CerimoniaDoLugarNovo"), APP.indexOf("function FaixaDeChegada"));
  t("nem recursos", !/RECURSOS|Recursos/.test(bloco));
  /* as pílulas mostram o que a cidade DE FATO guarda */
  t("mostra quantos moram nela", /rot: "Habitantes"/.test(bloco));
  t("de que terreno ela é", /rot: "Terreno", diz: tom\.diz/.test(bloco));
  t("e de quem ela é", /rot: c\.faccao \? "Sob" : "Relação"/.test(bloco));
  /* e cada pílula some quando o dado não existe — nada sabido é nada
     mostrado, a lei do palco */
  t("cada pílula some sem o dado", /\]\.filter\(Boolean\);/.test(bloco));
  t("a caixa de notas só abre com texto dentro", /\{c\.notas && \(/.test(bloco));
  t("e o subtítulo também", /\{subtitulo && </.test(bloco));
  /* o tom do bioma é o mesmo do cabeçalho e da faixa: uma tabela só */
  t("o tom vem da tabela do palco", /const tom = TONS\[c\.bioma\] \|\| TOM_PADRAO;/.test(bloco));
  t("e o porte vem da geografia", /PORTES\[c\.porte \|\| c\.tipo\]/.test(bloco));
}

sec("6. A RECALIBRAGEM — a espera ganhou forma (v9.182)");
{
  /* Recalibrar é a operação mais estranha da casa: o arquivista relê o livro
     inteiro e propõe os números justos de hoje. Leva dezenas de segundos, e
     até aqui a espera era uma caixa de 320px com uma frase em itálico — o
     jogador não sabia se faltava um passo ou dois, nem se algo travou. */
  t("a cerimônia existe", /function CerimoniaDaRecalibragem\(\{ passos, atual, lendo \}\)/.test(APP));
  const bloco = APP.slice(APP.indexOf("function CerimoniaDaRecalibragem"), APP.indexOf("function CerimoniaDoLugarNovo"));

  /* OS PASSOS SÃO UMA TABELA. Estavam escritos à mão no título de cada caixa
     ("passo 1 de 2", "passo 2 de 2"), em dois lugares que ninguém obrigava a
     concordar. */
  t("os passos do save são uma tabela", /const PASSOS_DO_SAVE = \[/.test(APP));
  t("e os da ascensão também", /const PASSOS_DA_ASCENSAO = \[/.test(APP));
  t("o título da caixa conta pela tabela", /passo 1 de \{PASSOS_DO_SAVE\.length\}/.test(APP));
  t("e o do segundo passo também", /passo \{PASSOS_DO_SAVE\.length\} de \{PASSOS_DO_SAVE\.length\}/.test(APP));
  /* sem os comentários: a régua que diz "este número não está escrito à mão"
     acusaria o próprio comentário que conta a história do defeito. E aqui a
     limpeza é local porque outras seções desta suíte procuram justamente por
     comentários (a faixa de chegada é achada pelo cabeçalho dela). */
  const semComentarios = APP.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  t("não sobrou 'de 2' escrito à mão", !/passo \d+ de \d+/.test(semComentarios));

  /* A PORCENTAGEM SAI DA CONTA DE PASSOS. Uma barra que anda sozinha durante
     uma espera de duração desconhecida seria a mentira mais fácil da tela. */
  t("a porcentagem vem dos passos", /const pct = Math\.round\(\(feito \/ total\) \* 100\);/.test(bloco));
  t("e a barra usa essa mesma conta", /width: `\$\{pct\}%`/.test(bloco));
  t("a barra só aparece quando há mais de um passo", /\{total > 1 && \(/.test(bloco));

  /* OS TRÊS ESTADOS DE UM PASSO: lido, lendo, à espera. */
  t("o passo já lido diz lido", /Lido<\/span>/.test(bloco));
  t("o passo em curso pisca", /className="tv-pisca rounded-full"/.test(bloco));
  t("e o que vem depois diz que espera", /À espera<\/span>/.test(bloco));
  t("o pisca respeita quem pediu menos movimento", /prefers-reduced-motion: reduce/.test(CSS));
  t("e os anéis também", /\.tv-anel-fora, \.tv-anel-dentro, \.tv-pisca \{ animation: none; \}/.test(CSS));

  /* NADA É APLICADO NA CERIMÔNIA: ela é só a espera, e o rodapé diz isso —
     uma tela que enche a barra até o fim ensina que algo já aconteceu. */
  t("o rodapé diz que nada mudou ainda", /nada foi mudado ainda/.test(bloco));
  t("e aponta a decisão que vem depois", /“manter como está” ao lado de “aplicar”/.test(bloco));

  /* AS TRÊS ESPERAS PASSAM PELA MESMA CERIMÔNIA */
  t("a lenda espera nela", /\{recal === "pedindo" && \(\s*<CerimoniaDaRecalibragem passos=\{PASSOS_DO_SAVE\} atual=\{0\}/.test(APP));
  t("o mundo também, no passo seguinte", /\{recalM === "pedindo" && \(\s*<CerimoniaDaRecalibragem passos=\{PASSOS_DO_SAVE\} atual=\{1\}/.test(APP));
  t("e a ascensão, com o passo dela", /\{recalAsc === "pedindo" && \(\s*<CerimoniaDaRecalibragem passos=\{PASSOS_DA_ASCENSAO\} atual=\{0\}/.test(APP));
  /* e a caixa da decisão só abre quando há proposta */
  t("a caixa da lenda só abre com proposta", /\{recal && recal !== "pedindo" && \(/.test(APP));
  t("a do mundo também", /\{recalM && recalM !== "pedindo" && \(/.test(APP));
  t("e a da ascensão", /\{recalAsc && recalAsc !== "pedindo" && \(/.test(APP));

  /* o sigilo reusa o glifo que a casa já tem, e o arco é desenhado porque é
     arco de círculo — traço, raio e cor cabem em três atributos */
  t("o núcleo usa o glifo da casa", /<IconeFaiscas tamanho=\{26\} cor=\{T\.violetSoft\} \/>/.test(bloco));
  t("e o arco é um arco, com a cor do token", /stroke=\{T\.amber\} strokeWidth="2" strokeLinecap="round" strokeDasharray/.test(bloco));
}

console.log(`\nmomentos v9.163: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
