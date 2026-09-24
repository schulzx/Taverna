/* O NOME DA CAMPANHA (R15) — o defeito que APAGA TRABALHO DE JOGADOR

   "A Prova do Depois" abriu um dia chamada "Aventura". Ela não foi renomeada
   por engano: foi **gravada sem nome e batizada na leitura**. Um save
   reescrito não se desfaz com um revert, e é por isso que esta suíte existe
   antes de qualquer outra coisa desta fase.

   O DEFEITO TINHA DOIS LADOS E UMA FORMA EXATA.

   NA ESCRITA: `salvar` grava quatro campos do ESTADO e não do ref —
   `nomeCampanha`, `mundo`, `personagem`, `historico`. Três deles têm uma rede
   que os mantém quentes: os chamadores passam-nos em `extra` no instante em
   que mudam. Contados no `App.jsx`: `salvar({ personagem` cinquenta vezes,
   `mundo` uma, `historico` uma — e `nomeCampanha` **zero**. Ele tem o mesmo
   guarda que os outros (`if (nomeCampanha) ref.current = ...`) e **nenhuma
   rede**. Não é uma corrida rara que se fecha desarmando um caminho: é o
   estado normal do campo, e qualquer caminho futuro cairia no mesmo buraco.

   NA LEITURA: quatro sítios independentes escreviam `sv.nomeCampanha ||
   "Aventura"`. Um save mudo não dava erro — dava outra campanha.

   E A CORREÇÃO ÓBVIA ERA UMA CORRUPÇÃO NOVA: `nomeCampanhaRef.current ||
   nomeCampanha` parece o conserto e não é. `largarASala()` não limpa o ref
   (só `esquecerOMundo()` limpa), logo em `irNovo` o ref ainda carrega o nome
   da campanha ANTERIOR — e o save nasceria com o nome errado, que é pior do
   que sem nome. **Guarda, não substituição**, e o dente abaixo prende isso.

   O QUE FALHAVA ANTES DESTE COMMIT, e é o que dá valor à suíte: os dentes
   marcados [ANTES:X] estavam vermelhos no código de ontem. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const A = await import(S + "arquivo.js");
const APP = readFileSync("../src/App.jsx", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

const COM_NOME = {
  nomeCampanha: "A Prova do Depois",
  personagem: { nome: "Halda", nivel: 6, classe: "Guardiã" },
  mundo: { genero: "Fantasia medieval" }, dia: 14,
};
/* O SAVE DOENTE, tal como ele chega do disco: tudo intacto menos o nome.
   É esta a forma exata da corrupção — o autossave gravou o estado frio, e
   nenhum outro campo se perdeu junto. */
const MUDO = { ...COM_NOME, nomeCampanha: "" };

sec("o nome gravado manda, sempre");
t("devolve o nome que está no save", A.nomeDaCampanha(COM_NOME) === "A Prova do Depois");
t("apara o espaço em volta", A.nomeDaCampanha({ nomeCampanha: "  Halda e o Mar  " }) === "Halda e o Mar");
t("um nome só de espaços não é nome", A.nomeDaCampanha({ nomeCampanha: "   ", personagem: { nome: "Halda" } }) === "A saga de Halda");

sec("faltando o nome, ele sai do que o PRÓPRIO save carrega");
t("[ANTES:X] o save mudo recupera-se pelo herói, não vira 'Aventura'", A.nomeDaCampanha(MUDO) === "A saga de Halda");
t("dois saves mudos de heróis diferentes continuam distinguíveis",
  A.nomeDaCampanha(MUDO) !== A.nomeDaCampanha({ personagem: { nome: "Brann" } }));
t("sem nome e sem herói resta a palavra genérica, e aí ela é honesta",
  A.nomeDaCampanha({}) === A.NOME_GENERICO);
t("nunca lança, seja o que for que lhe deem",
  A.nomeDaCampanha(null) === A.NOME_GENERICO && A.nomeDaCampanha("lixo") === A.NOME_GENERICO
  && A.nomeDaCampanha({ personagem: "lixo" }) === A.NOME_GENERICO);

sec("o save mudo sabe dizer que estava mudo");
t("salvoSemNome vê a corrupção", A.salvoSemNome(MUDO) === true);
t("e não acusa um save são", A.salvoSemNome(COM_NOME) === false);
t("um save inteiro não é confundido com um mudo",
  A.salvoSemNome(null) === true && A.salvoSemNome({ nomeCampanha: "x" }) === false);

sec("o resumo deixa de inventar — é ele que a tela de importar mostra");
t("[ANTES:X] o resumo de um save mudo não diz 'Aventura'",
  A.resumoDoSave(MUDO).campanha !== "Aventura");
t("o resumo de um save mudo diz de quem ele é", A.resumoDoSave(MUDO).campanha === "A saga de Halda");
t("o resumo de um save são não muda", A.resumoDoSave(COM_NOME).campanha === "A Prova do Depois");
t("e o nome do arquivo no disco herda a recuperação",
  A.nomeDoArquivo(MUDO).includes("a-saga-de-halda"));

sec("A ESCRITA — o save nunca mais nasce com o estado frio");
t("[ANTES:X] `salvar` não grava mais o nomeCampanha cru",
  !APP.includes("nomeCampanha, mundo, personagem, mensagens: mensagensRef.current"));
t("grava o valor guardado", APP.includes("nomeCampanha: nomeVivo, mundo, personagem"));
/* O DENTE QUE PRENDE A ARMADILHA, e é o mais importante desta suíte: o
   conserto que parece óbvio corrompe de outra maneira. Se alguém um dia
   "simplificar" isto para o ref, esta linha fica vermelha e diz por quê. */
t("[a armadilha] a guarda NÃO é o ref — ele carrega o nome da campanha anterior em `irNovo`",
  /const nomeVivo = nomeCampanha \|\| \(\(saveRef\.current \|\| \{\}\)\.nomeCampanha\) \|\| "";/.test(APP)
  && !/nomeVivo *=[^\n]*nomeCampanhaRef/.test(APP));
t("e a razão da armadilha continua verdadeira: largarASala não limpa o ref",
  /const largarASala = \(\) => \{[\s\S]{0,400}?\n  \};/.test(APP)
  && !/const largarASala = \(\) => \{[\s\S]{0,400}?nomeCampanhaRef/.test(APP));

sec("A LEITURA — o load parou de inventar, nos quatro sítios");
t("[ANTES:X] nenhum sítio do App escreve `|| \"Aventura\"`",
  !/nomeCampanha \|\| "Aventura"/.test(APP));
t("o estado vem da função", APP.includes("setNomeCampanha(nomeDaCampanha(sv))"));
t("o system prompt da retomada vem da função",
  APP.includes("montarSystemPrompt(nomeDaCampanha(sv),"));
t("o recap vem da função", APP.includes("nomeCampanha: nomeDaCampanha(sv), desdeODia:"));
t("o envelope da retomada vem da função",
  APP.includes('[RETOMADA] Voltei a "${nomeDaCampanha(sv)}".'));

sec("o conserto não é silencioso — um conserto mudo é a mesma falha com melhores modos");
t("o load avisa quando recuperou o nome", APP.includes("salvoSemNome(sv)"));
t("e o aviso nunca pode custar a abertura da campanha",
  /salvoSemNome\(sv\)[\s\S]{0,400}?catch \(e\) \{ calou\("avisar o save sem nome", e\); \}/.test(APP));

sec("O ESBATIMENTO (R15) — e o que o protege é o enchimento que já lá estava");
t("[ANTES:X] a região da prosa esbate o topo",
  /className="tv-scroll tv-esbate-topo flex-1[^"]*"/.test(APP));
/* `py-6` são os 24px que fazem o esbatimento cobrir SÓ enchimento em
   scrollTop 0 — é o que o torna grátis. Tirá-lo é o defeito, não uma
   limpeza, e por isso ele é lei e não estilo. */
t("e o py-6 fica, que é o que faz a peça custar zero px",
  /className="tv-scroll tv-esbate-topo[^"]*py-6[^"]*"/.test(APP));
t("não se criou camada nenhuma por cima da prosa (uma máscara não intercepta clique)",
  !/tv-esbate-topo[^\n]*position: *["']?fixed/.test(APP));

console.log(`\n${maus === 0 ? "TUDO VERDE" : "VERMELHO"} — ${bons} passaram, ${maus} falharam`);
if (maus) process.exit(1);
