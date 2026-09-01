/* TRÊS COISAS QUE MENTIAM (v9.128)

   As três vieram de jogar, e as três são da mesma família: um lugar onde o
   sistema dizia uma coisa e fazia outra.

   1. A MAGIA IGNORAVA O ALCANCE. `pool = atingiveis.length ? atingiveis :
      vivos` — quando ninguém estava ao alcance, a habilidade caía de volta em
      TODOS os vivos. O zumbi atrás da bancada morria de Projétil Arcano sem
      que nada pudesse acertá-lo. O caminho da arma, no mesmo arquivo, sempre
      recusou com o motivo: a mesma regra escrita em dois lugares e viva num
      só, que é como esta base já sabe que nasce bug.

   2. O TABULEIRO DEIXAVA MIRAR O QUE NÃO SE MIRA. Com uma habilidade de alvo
      único selecionada, o modo de mirar abria e aceitava marcar quadrados —
      e o disparo só lê a mira quando a habilidade tem forma. Marcar um lugar
      que o sistema ignora é pior do que não poder marcar.

   3. O ACHADO PROMETIA ARMA E DAVA PRATA. "uma arma que alguém escondeu com
      pressa" não casava com nenhum padrão de moeda e virava `dc * 4`. O texto
      do esconderijo é inventário, não metáfora. */

const RAIZ = "../src/";
const { readFileSync } = await import("node:fs");
const semCom = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semCom(readFileSync("../src/App.jsx", "utf8"));
const GRADE = semCom(readFileSync("../src/grade-de-batalha.jsx", "utf8"));
const BASE = await import(RAIZ + "mundo-base.js");
const MIS = await import(RAIZ + "missoes.js");

let bons = 0, maus = 0;
const t = (nome, cond) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

sec("1. A MAGIA OBEDECE AO ALCANCE");
{
  t("o retorno para todos os vivos morreu", !/atingiveis\.length \? atingiveis : vivos/.test(APP));
  t("sem ninguém ao alcance, a habilidade recusa", /if \(!atingiveis\.length\) \{\s*return \{ semAlcance: true/.test(APP));
  t("e a recusa diz a distância de cada um", /a uns \$\{Math\.round\(distanciaM\(meuLugarH, e\)\)\} m/.test(APP));
  t("e diz quando é a parede que corta", /sem linha de visão/.test(APP));
  t("o alvo sai só de quem dá para acertar", /const pool = atingiveis;/.test(APP));
  /* e o PM não é cobrado por um disparo que a regra recusou */
  t("a recusa não gasta PM no caminho selecionado", /if \(desfechoH && desfechoH\.semAlcance\) \{[\s\S]{0,220}?continue;/.test(APP));
  t("e devolve o PM no caminho citado", /if \(desfechoC && desfechoC\.semAlcance\) \{[\s\S]{0,260}?mana: Math\.min/.test(APP));
  /* o caminho da ARMA continua como sempre foi — é ele que serviu de molde */
  t("a arma continua recusando por alcance", /if \(ataque && ataque\.semAlcance\)/.test(APP));
}

sec("2. SÓ A ÁREA SE MIRA");
{
  t("mirar exige forma", /const podeMirar = !!\(alcanceMira && alcanceMira\.area && alcanceMira\.tamanho && onMirar\)/.test(GRADE));
  /* mas o ALCANCE continua à vista: é ele que responde "daqui eu acerto?",
     e tirar a mira sem mostrar o alcance trocaria um engano por um escuro */
  t("o alcance da habilidade aparece mesmo sem mira", /!mirando && alcanceMira && alcanceMira\.quadrados/.test(GRADE));
  t("com contorno próprio, sem disputar com o véu do passo", /<Contorno linhas=\{contorno\(alcanceMira\.quadrados\)\} cor=\{T\.violet\}/.test(GRADE));
  t("e a tarja diz o alcance em metros", /alcanceMira\.nome\} alcança \{metrosTxt\(alcanceMira\.alcanceM\)\} m/.test(GRADE));
}

sec("3. O QUE O ESCONDERIJO PROMETE, A BOLSA ENTREGA");
{
  const arma = BASE.recompensaDoAchado({ o: "uma arma que alguém escondeu com pressa", dc: 15 });
  t("o achado de arma marca arma", arma.arma === true);
  t("e o troco encolhe, porque o prêmio é a arma", arma.moedas < 15 * 4);
  const moeda = BASE.recompensaDoAchado({ o: "moedas antigas de um reino que não existe mais", dc: 15 });
  t("moeda continua sendo moeda", moeda.arma === false && moeda.moedas === 15 * 12);
  const frasco = BASE.recompensaDoAchado({ o: "frascos que ainda estão bons", dc: 12 });
  t("frasco continua virando consumível", frasco.consumiveis === 1);
  t("o App põe a arma na bolsa", /if \(rec\.arma\) \{[\s\S]{0,300}?gerarLoot\("comum", \{ tipo: "arma"/.test(APP));
  t("e o envelope conta ao Mestre que a arma foi entregue", /rec\.arma \? "a arma em si/.test(readFileSync("../src/mundo-base.js", "utf8")));
  /* e a linha que prometia uma mecânica inexistente saiu da tabela */
  const CRU = readFileSync("../src/mundo-base.js", "utf8");
  t("o mapa que não marcava nada saiu", !/um mapa marcando outro esconderijo"/.test(semCom(CRU)));
}

sec("4. CHEGAR NÃO É CUMPRIR");
{
  /* `ir_a` é a única etapa que se cumpre sozinha — basta andar até lá. Todo
     tipo desconhecido caía nela, então o Mestre escrevia `resgatar` e o
     sistema lia `chegar`: a missão de resgate fechava com o herói parado no
     lugar e ninguém resgatado. */
  /* v9.132: `resgatar` deixou de ser um remendo para `falar_com` e ganhou
     etapa propria — encontrar alguem nao e tirar de la. `escoltar` continua
     em `falar_com`: e promessa de DURACAO, e o sistema ainda nao sabe medir
     "chegou inteiro". */
  t("resgatar não vira chegar, e agora tem etapa propria", MIS.tipoDaEtapa({ tipo: "resgatar", alvo: "Ione" }) === "resgatar");
  t("libertar também", MIS.tipoDaEtapa({ tipo: "libertar", alvo: "Ione" }) === "resgatar");
  t("escoltar ao menos exige encontrar", MIS.tipoDaEtapa({ tipo: "escoltar", alvo: "Ione" }) === "falar_com");
  t("caçar vira derrotar", MIS.tipoDaEtapa({ tipo: "cacar", alvo: "lobo" }) === "derrotar");
  t("recuperar vira achar", MIS.tipoDaEtapa({ tipo: "recuperar", alvo: "o anel" }) === "achar");
  t("os tipos que já existem passam intactos", ["ir_a", "derrotar", "achar", "falar_com", "levar_a", "aguentar"].every((x) => MIS.tipoDaEtapa({ tipo: x }) === x));
  t("e o que não casa com nada continua sendo chegar", MIS.tipoDaEtapa({ tipo: "xablau" }) === "ir_a");
  /* a prova que importa: uma etapa de resgate NÃO se cumpre por presença */
  const q = MIS.garantirMissoes([{ titulo: "Tirar Ione de lá", etapas: [{ tipo: "resgatar", alvo: "Ione" }] }])[0];
  t("a missão guarda a etapa como resgatar", q.etapas[0].tipo === "resgatar");
  const chegou = MIS.conferir([q], { cidadeAtual: "Ione", lugarAtual: "Ione", npcs: {}, derrotados: [], inventario: [] });
  const depois = (chegou.lista || chegou)[0] || q;
  t("e chegar ao lugar não a conclui", depois.status !== "concluida");
}

console.log(`\nalcance e achado v9.128: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
