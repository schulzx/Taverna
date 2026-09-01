/* teste-harmonia.mjs (v9.89) — o sistema fala com uma voz só.

   Três sistemas nasceram em versões seguidas — o Mestre (v9.71), o vilão
   (v9.83) e o Bibliotecário (v9.85) — e cada um foi provado sozinho.
   Esta suíte prova o ENTRE: onde eles se contradizem, onde um não sabe do
   outro, e onde dois falam ao mesmo tempo.

   É o tipo de defeito que nenhum teste de módulo pega, porque nenhum
   módulo está errado. */
import fs from "node:fs";
import {
  gerarVilao, avancarPlano, escolherAlvo, envelopeDoAvanco, levaForma,
  TOTAL_DE_PASSOS, FASES,
} from "../src/vilao.js";
import { JOGADAS } from "../src/biblioteca.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const prompt = fs.readFileSync("../src/prompt.js", "utf8");
const app = fs.readFileSync("../src/App.jsx", "utf8");

sec("1. UMA ORDEM SÓ SOBRE QUEM INVENTA");
{
  /* O defeito: `prompt.js` mandava, TODO TURNO, "invente tramas, viradas e
     gente nova à vontade", declarava-se "regra-mestra — vem ANTES de
     qualquer cautela" e dizia que "as ÚNICAS proibições deste jogo são
     fatuais". Os envelopes dizem "NÃO abra trama nova". A linha do prompt
     não só contradizia: ela se punha ACIMA, e classificava a proibição do
     envelope como não estando entre as proibições do jogo.

     Quando os dois colidiam, o prompt mandava a IA ficar contra o Mestre —
     e ele fala todo turno, enquanto o envelope fala num a cada três. */
  t("a regra-mestra não se põe mais acima de tudo", !/vem ANTES de qualquer cautela/.test(prompt));
  t("e não manda mais inventar trama à vontade", !/Invente tramas, viradas, detalhes e gente nova à vontade/.test(prompt));
  t("nem diz que só o factual é proibido", !/As ÚNICAS proibições deste jogo são fatuais/.test(prompt));

  /* e a ousadia continua inteira, que é a metade que precisava existir:
     ela nasceu porque o narrador era tímido */
  t("a ousadia total continua", /crie com ousadia total/.test(prompt));
  t("e continua sendo regra-mestra", /LIBERDADE CRIATIVA \(regra-mestra/.test(prompt));

  /* a divisão que turno.js escreveu na v9.61 e que nunca tinha chegado ao
     prompt: o código decide o que é verdade, a IA decide como se parece */
  /* v9.131: a divisão subiu para o CONTRATO, na abertura, e saiu da
     "liberdade criativa" — onde era a terceira cópia da mesma frase. */
  t("a divisão está escrita, e agora na abertura", /o sistema decide o QUE existe e o QUE acontece; você decide COMO aquilo se parece/.test(prompt));
  t("o envelope é fato consumado", /Chegou COM envelope: aquilo já aconteceu/.test(prompt));
  t("com a ousadia redirecionada para dentro dele", /Gaste a ousadia inteira DENTRO do que os envelopes governam/.test(prompt));
  /* e o que sobra continua sendo dela: sem isto a correção viraria uma
     coleira, e a coleira é o defeito que a linha original veio curar */
  t("fora dos envelopes, invenção livre", /Fora do que os envelopes governam, invente à vontade/.test(prompt));
}

sec("2. UM VILÃO SÓ");
{
  /* `prompt.js` ensinava o chefe de fase que vilao.js passou uma versão
     inteira desmontando: "cruel, manipulador, capaz de atrocidades", contra
     "sem ameaça, sem voz alta, sem discurso" e "deixe a razão do outro lado
     ser defensável". Dois professores, e o do prompt fala todo turno. */
  t("o prompt não ensina mais o vilão de desenho", !/O vilão é mau de verdade: cruel, manipulador, capaz de atrocidades/.test(prompt));
  t("e passou a apontar para o que ele faz e crê", /o perigo dele mora no que ele FAZ e no que ele acredita/.test(prompt));
  t("com a regra da voz baixa, que é a do sistema", /não precisa levantar a voz/.test(prompt));
  /* mas nenhum outro personagem foi amansado: a linha existe para impedir
     exatamente isso, e amansar o resto ao consertar o vilão seria trocar
     um defeito por outro */
  t("a sedutora continua ousada", /A sedutora é ousada de verdade/.test(prompt));
  t("e continua proibido amansar", /TERMINANTEMENTE PROIBIDO amansar/.test(prompt));
}

sec("3. AS MARCAS DO VILÃO NÃO REPETEM");
{
  /* Medido antes do conserto: 300 campanhas simuladas com elenco realista,
     300 com marca repetida. O envelope da revelação saía dizendo "o que ele
     já me tirou: Marta, Marta, Marta" — não é uma lista de perdas, é um
     defeito de contagem contado como ficção. */
  const ctx = { pessoas: ["Marta", "Ubba", "Lucan", "Vaska"], lugares: ["Vale Torto", "Pedra Fria"], promessas: ["a dívida do moleiro"] };
  const CUSTO = ["sombra", "voz", "lugar", "esperanca", "gente", "lugar", "voz", "gente", "tudo"];
  let repetiu = 0, semAlvo = 0;
  for (let c = 0; c < 300; c++) {
    let v = gerarVilao({ nome: "Sarna", cont: {}, dia: 0, sorte: Math.random });
    for (let i = 1; i < TOTAL_DE_PASSOS; i++) {
      const alvo = escolherAlvo(CUSTO[i], ctx, Math.random, v.marcas || []);
      if (!alvo) semAlvo++;
      v = avancarPlano(v, { dia: i * 6, alvo }).vilao;
    }
    const nomes = (v.marcas || []).map((m) => m.nome);
    if (new Set(nomes).size < nomes.length) repetiu++;
  }
  t(`300 campanhas, nenhuma marca repetida (${repetiu})`, repetiu === 0);
  /* e a correção não pode ter criado o defeito oposto: um passo que não
     acha alvo some sem deixar rastro, e isso é pior que repetir */
  t(`e nenhum passo no vazio (${semAlvo})`, semAlvo === 0);

  /* a escapatória: elenco de UMA pessoa. Um alvo repetido ainda é melhor
     que passo nenhum, então a lista volta inteira quando todos já saíram. */
  const so = { pessoas: ["Marta"], lugares: [], promessas: [] };
  t("com um nome só, ainda há alvo", !!escolherAlvo("gente", so, () => 0, [{ nome: "Marta" }]));
  t("e sem elenco nenhum, não há", escolherAlvo("gente", {}, () => 0, []) === null);
}

sec("4. A REVELAÇÃO NÃO LEVA FORMA GRAMPEADA");
{
  /* A revelação e a queda já vêm COMPOSTAS: dizem a cena inteira. O
     Bibliotecário grampeava uma forma sorteada em cima, e entre as 140
     possíveis havia oito que mandam o oposto de "dê a ele a melhor fala da
     campanha até aqui". */
  let v = gerarVilao({ nome: "Sarna", cont: {}, dia: 0, sorte: () => 0.5 });
  const passos = [];
  for (let i = 1; i < TOTAL_DE_PASSOS; i++) {
    const r = avancarPlano(v, { dia: i * 6, alvo: { nome: "Marta", campo: "pessoas", comoDoi: "alguém que você conhece" } });
    v = r.vilao; passos.push(r);
  }
  const revelacao = passos.find((r) => r.revelacao);
  const queda = passos.find((r) => r.fase && r.fase.final);
  t("a revelação existe no plano", !!revelacao);
  t("e a queda também", !!queda);
  t("a revelação não leva forma", levaForma(revelacao) === false);
  t("a queda não leva forma", levaForma(queda) === false);
  /* mas nas outras fases ela continua entrando: lá o envelope diz o QUE e
     a forma diz o COMO, que é a divisão inteira */
  const meio = passos.filter((r) => !r.revelacao && !(r.fase && r.fase.final));
  t(`as outras fases continuam levando (${meio.length})`, meio.length > 0 && meio.every((r) => levaForma(r) === true));
  t("e nada quebra sem passo", levaForma(null) === false);

  /* as oito que contradiziam continuam no acervo — o conserto é não
     grampeá-las na cena errada, não removê-las */
  const contra = JOGADAS.filter((j) => /fala POUCO|ninguém responde|INTERROMPIDO|NOTAR QUE FALTA/i.test(j.forma));
  t(`as formas de silêncio seguem no acervo (${contra.length})`, contra.length >= 4);

  t("e o App respeita a trava", /levaForma\(r\) \? formaDoMestre\(\{ fio: "vilao" \}\) : ""/.test(app));
}

sec("5. A MESA SENTE O PASSO DO VILÃO");
{
  /* `processarNemesisDiaria` não tocava na mesa. O passo do vilão — a maior
     pressão que este jogo produz — não esquentava nada, e a temperatura
     podia ler "fria" no turno seguinte e mandar o mundo puxar um fio da
     memória JUNTO, empilhando duas pressões por não saber da primeira. */
  const bloco = app.split("const processarNemesisDiaria")[1].split("\n  };")[0];
  t("o passo marca perigo na textura", /texturaRef\.current = \{ \.\.\.\(texturaRef\.current \|\| \{\}\), perigo: true \}/.test(bloco));
  /* e NÃO marca luta: ele ainda não veio em pessoa, e marcar luta faria o
     mestre parar de conceder dado numa cena que não tem dado nenhum */
  t("mas não marca luta", !/luta: true/.test(bloco));
  t("e o alvo conhece as marcas", /nemesisRef\.current\.marcas \|\| \[\]/.test(bloco));
}

sec("6. E O ORÇAMENTO DO PROMPT AGUENTA");
{
  /* as duas reescritas somaram texto ao bloco fixo, que é o único que se
     paga em todo turno da campanha */
  const linhas = prompt.split("\n");
  const liberdade = linhas.find((l) => l.includes("LIBERDADE CRIATIVA"));
  const amarras = linhas.find((l) => l.includes("PERSONAGENS SEM AMARRAS"));
  t(`a regra-mestra cabe (${liberdade.length} chars)`, liberdade.length < 1100);
  t(`e a de interpretação também (${amarras.length} chars)`, amarras.length < 1100);
}

console.log(`\nharmonia v9.89: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
