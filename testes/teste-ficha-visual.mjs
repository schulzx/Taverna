/* A FICHA NO DESENHO DE MESA (v9.159)

   A ficha funcionava e não parecia ficha: era uma lista de blocos com a
   paleta certa. O redesenho segue a linguagem das fichas de mesa
   modernas — retrato em carta com o escudo de nível mordendo a base,
   medalhões hexagonais de atributo, a vida gorda, a régua de XP no
   cabeçalho — sem UMA decisão nova de regra: cada número mostrado já
   era calculado por um módulo que existia.

   O QUE ESTA SUÍTE PROTEGE, em ordem de estrago:

   1. O COLAPSO DOS 2 PIXELS — o contêiner da ficha tem overflow-hidden
      e vive como filho direto de um flex-col rolável. Item de flex com
      overflow ganha min-height ZERO, e ele era o único filho disposto a
      encolher: a ficha inteira virava uma linha de 2px, invisível, com
      build limpo e suítes verdes. `shrink-0` é o que a segura de pé.
   2. UM NÚMERO, UM LUGAR — o XP tinha três casas (rodapé da ficha,
      barra do painel, régua nova). Sobrou a régua. A volta de qualquer
      cópia é a volta das duas verdades.
   3. A FICHA SÓ MOSTRA — o passo e os escudos do corpo entram pelos
      leitores que o combate já usava. Se ela recalculasse, o número da
      tela e o número da luta divergiriam no primeiro ajuste. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const FICHA = readFileSync(S + "painel-ficha.jsx", "utf8");
const APP = readFileSync(S + "App.jsx", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. A FICHA NÃO PODE VOLTAR A TER 2 PIXELS");
{
  /* overflow-hidden num filho de flex-col zera o min-height dele; num
     painel cujo conteúdo passa da tela, o único que aceita encolher
     encolhe até sumir — e some SEM erro nenhum no console */
  t("o contêiner segura o chão", /className="rounded-2xl overflow-hidden shrink-0"/.test(FICHA));
  t("e o porquê está escrito ao lado", /min-height\s+de item de flex/.test(FICHA));
}

sec("2. O CABEÇALHO É UMA CARTA");
{
  t("o retrato tem moldura própria", /className="rounded-xl p-1" style=\{\{ background: T\.panelSoft, border: `1\.5px solid/.test(FICHA));
  /* o nível mora no escudo sob o retrato — e SÓ lá: de volta à linha da
     classe, seria o mesmo número em dois cantos */
  t("o escudo de nível morde a base", /rotate\(45deg\)/.test(FICHA) && /title=\{`Nível \$\{nivel\}`\}/.test(FICHA));
  t("e a linha da classe não repete o nível", !/· nv \{nivel\}/.test(FICHA) && !/nv \{nivel\}<\/span>/.test(FICHA));
  /* a régua de experiência: relativa ao nível, como regras.js grava */
  t("a régua de XP vive no cabeçalho", /Experiência: \$\{p\.xp \|\| 0\} de \$\{teto\} para o nível/.test(FICHA));
  t("com o teto vindo da tabela", /XP_POR_NIVEL\(nivel\)/.test(FICHA) && /XP_POR_NIVEL/.test(FICHA.slice(0, FICHA.indexOf("function"))));
}

sec("3. UM NÚMERO, UM LUGAR");
{
  /* o rodapé perdeu o "XP 1638" e o painel perdeu a BarraMini de XP:
     sobrou a régua do cabeçalho, e só ela */
  t("o rodapé da ficha não repete o XP", !/>XP \{p\.xp/.test(FICHA));
  /* a BarraMini de XP que morava na aba da ficha usava `xpProx`; o nome
     sumir do App é a prova de que ela sumiu junto. As DUAS que ficaram
     são de outras conversas: o XP do companheiro (outra pessoa) e o da
     barra de status (outra tela, visível de espada na mão). */
  t("nem a aba da ficha no App", !/xpProx/.test(APP));
  t("e a ficha diz por quê", /duas verdades/.test(FICHA));
}

sec("4. A FICHA SÓ MOSTRA — os leitores são os do combate");
{
  /* o passo vem de movimento.js, que já pesa armadura, condição e
     exaustão para o tabuleiro */
  t("o passo entra pelo leitor", /import \{ deslocamentoDe \} from "\.\/movimento\.js"/.test(FICHA));
  t("e aparece na fileira", /rotulo="Passo"/.test(FICHA));
  t("parado é vermelho", /cor=\{desloc\.parado \? T\.danger : T\.ink\}/.test(FICHA));
  t("o voo aparece quando existe", /voo \$\{desloc\.voar\} m/.test(FICHA));
  /* os escudos do corpo: as TRÊS portas que o combate usa, e nenhuma
     leitura de raça na mão */
  t("resistência pela porta dos traços", /import \{ efeitoDe, textoDoTraco \} from "\.\/tracos\.js"/.test(FICHA));
  t("imunidade pela porta das dádivas", /import \{ imunidadesDe \} from "\.\/dadivas\.js"/.test(FICHA));
  t("e a dos itens pela porta dos danos", /resistenciasEquipadas/.test(FICHA));
  t("sem ler racas.js na mão", !/racaPorNome|RACAS/.test(FICHA));
  /* quem não tem escudo nenhum não ganha seção vazia */
  t("sem escudo, sem seção", /if \(!resist\.length && !reducoes\.length && !imunes\.length && !ef\.vantagemMental\) return null;/.test(FICHA));
  /* os rótulos vêm das tabelas de dano e condição, não de strings novas */
  t("os rótulos são das tabelas", /rotuloDano\(t\)/.test(FICHA) && /CONDICOES\[c\]/.test(FICHA));
}

sec("5. O MEDALHÃO HEXAGONAL");
{
  t("o hexágono existe", /const HEXAGONO = "polygon\(/.test(FICHA));
  t("a borda ainda é a proficiência", /background: proficiente \? T\.amber : T\.line/.test(FICHA));
  /* clip-path corta os filhos: o botão de gastar ponto DENTRO do
     hexágono seria um botão cortado ao meio */
  const bloco = FICHA.slice(FICHA.indexOf("function BlocoAtributo"), FICHA.indexOf("/* Um vital"));
  const iFimClip = bloco.lastIndexOf("clipPath");
  const iBotao = bloco.indexOf("<button");
  t("o botão mora fora do corte", iBotao > iFimClip);
  t("e o porquê está no comentário", /clip-path corta os\s+filhos/.test(FICHA));
  /* o valor bruto morde a ponta de baixo, fora do hexágono */
  t("o selo do valor fica na ponta", /translateX\(-50%\)/.test(bloco));
}

sec("6. A VIDA É A BARRA QUE SE OLHA PRIMEIRO");
{
  t("a barra aceita ser forte", /function Barra\(\{ atual, max, cor, rotulo, forte = false \}\)/.test(FICHA));
  t("e só a vida é", /rotulo="Vida" forte \/>/.test(FICHA) && !/rotulo="Mana" forte/.test(FICHA));
}

console.log(`\nficha visual v9.159: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
