/* A CAMPANHA EM ARQUIVO (v9.147)

   A única cópia de meses de saga era uma chave de localStorage. O jogo já
   exportava a CRÔNICA — a saga em letra de forma, bonita e ilegível para
   a máquina. Faltava o contrário: o estado, em arquivo, que volta.

   O QUE ESTA SUÍTE PROTEGE não é o formato do arquivo: é o INSTANTE em
   que se importa. Importar apaga meses de campanha e não tem como pedir
   desculpa depois, e há três coisas que precisam continuar verdadeiras
   para sempre:

   1) LER NÃO GRAVA. O jogador vê campanha, herói, nível e dia antes de
      qualquer coisa ser apagada. Ninguém deve descobrir o que importou
      depois de importar.

   2) SÓ DO MENU. Com o jogo montado, o autossave grava por cima da
      importação no turno seguinte e a campanha trazida evapora sem
      nenhuma mensagem de erro — a pior forma de perder um save, porque o
      jogador acha que funcionou.

   3) A CÓPIA ANTES. O save que sai vai para `taverna_save_anterior`, e
      importar errado deixa de ser definitivo. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const A = await import(S + "arquivo.js");
const APP = readFileSync("../src/App.jsx", "utf8");
const CODEX = readFileSync("../src/painel-codex.jsx", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

const SAVE = {
  nomeCampanha: "A Maré de Ferro",
  personagem: { nome: "Brann Vidalonga", nivel: 8, classe: "Druida", vida: 44, vidaMax: 61 },
  mundo: { genero: "Fantasia medieval" },
  dia: 37, mensagens: [{ autor: "mestre", texto: "…" }], salvoEm: 1756000000000,
};

sec("1. O ENVELOPE RESPONDE ANTES DE QUALQUER COISA SER CARREGADA");
{
  const e = A.envelopar(SAVE, { versao: "v9.147", leva: "a campanha em arquivo", agora: 1756000000000 });
  t("diz que é da Taverna", !!e.taverna);
  t("com formato próprio", e.taverna.formato === A.FORMATO);
  t("e a versão do jogo que o gerou", e.taverna.versao === "v9.147");
  /* o resumo é o que a tela mostra ANTES do jogador confirmar: sem ele, a
     única forma de saber o que há no arquivo seria importar e ver */
  t("traz a campanha", e.taverna.resumo.campanha === "A Maré de Ferro");
  t("o herói", e.taverna.resumo.heroi === "Brann Vidalonga");
  t("o nível", e.taverna.resumo.nivel === 8);
  t("e o dia", e.taverna.resumo.dia === 37);
  t("o save vai inteiro, sem poda", e.save === SAVE);
  const l = A.linhaDoResumo(e.taverna.resumo);
  t("e a linha se lê", /A Maré de Ferro/.test(l) && /Brann/.test(l) && /nível 8/.test(l) && /dia 37/.test(l));
}

sec("2. O NOME DO ARQUIVO É A ETIQUETA NA PASTA DE DOWNLOADS");
{
  const n1 = A.nomeDoArquivo(SAVE, Date.parse("2026-09-01T10:00:00Z"));
  t("tem a campanha e o herói", /mare-de-ferro/.test(n1) && /brann/.test(n1));
  t("sem acento nem espaço", !/[^a-z0-9.\-]/.test(n1));
  t("e termina em .json", n1.endsWith(".json"));
  /* SEM A DATA O RECURSO TERIA UMA CÓPIA SÓ: cada exportação
     sobrescreveria a anterior no disco, que é quase o problema que ele
     veio resolver. */
  const n2 = A.nomeDoArquivo({ ...SAVE, dia: 40 }, Date.parse("2026-09-08T10:00:00Z"));
  t("duas exportações não colidem", n1 !== n2);
  t("a data separa as cópias", /2026-09-01/.test(n1) && /2026-09-08/.test(n2));
  /* campanha sem nome não pode gerar arquivo sem nome */
  t("nome vazio não vira arquivo sem nome", A.nomeDoArquivo({ personagem: { nome: "" } }).length > 12);
}

sec("3. ABRIR NUNCA QUEBRA — E É PRECISO, PORQUE O JOGADOR ESCOLHE O ARQUIVO");
{
  t("um .txt qualquer é recusado com jeito", A.abrir("isto não é json").ok === false);
  t("e a recusa explica", /não é um JSON válido/.test(A.abrir("nada").erro));
  t("json que não é save é recusado", A.abrir('{"qualquer":1}').ok === false);
  t("e diz o porquê", /não parece ser um save/.test(A.abrir('{"qualquer":1}').erro));
  t("nulo não derruba", A.abrir("null").ok === false);
  t("vazio não derruba", A.abrir("").ok === false);
  t("array não derruba", A.abrir("[1,2,3]").ok === false);
  /* uma ficha sem NOME não é uma ficha: todo o resto do jogo assume que
     ela tem um, e importar isso quebraria mais tarde e longe daqui */
  t("personagem sem nome é recusado", A.abrir(JSON.stringify({ personagem: { nivel: 3 } })).ok === false);
}

sec("4. O CAMINHO DE SOCORRO: O SAVE CRU TAMBÉM ENTRA");
{
  /* Quem já perdeu um save uma vez aprende a copiar o valor da chave do
     localStorage para um arquivo de texto — e essa pessoa é exatamente
     quem mais precisa que a importação funcione. */
  const r = A.abrir(JSON.stringify(SAVE));
  t("save cru é aceito", r.ok === true);
  t("mas avisa que veio sem envelope", r.avisos.some((x) => /sem envelope/.test(x)));
  t("e o resumo sai igual", r.resumo.heroi === "Brann Vidalonga");
  /* ida e volta pelo envelope não pode perder nada */
  const ida = A.textoDoArquivo(SAVE, { versao: "v9.147" });
  const volta = A.abrir(ida);
  t("ida e volta preserva o save", JSON.stringify(volta.save) === JSON.stringify(SAVE));
  t("o arquivo é legível por gente", /\n  "taverna"/.test(ida));
}

sec("5. O ARQUIVO DE UMA VERSÃO MAIS NOVA AVISA, MAS NÃO É RECUSADO");
{
  const futuro = JSON.stringify({ taverna: { formato: A.FORMATO + 3 }, save: SAVE });
  const r = A.abrir(futuro);
  t("carrega assim mesmo", r.ok === true);
  t("e avisa", r.avisos.some((x) => /versão mais nova/.test(x)));
  /* recusar seria pior: o jogador teria um arquivo que só a versão que
     ele não tem mais consegue abrir */
  const semMundo = A.abrir(JSON.stringify({ personagem: { nome: "X" } }));
  t("save incompleto entra com aviso", semMundo.ok === true && semMundo.avisos.length >= 2);
}

sec("6. O INSTANTE PERIGOSO — dois passos, e o segundo é o único que grava");
{
  const H = APP.slice(APP.indexOf("const importPendenteRef"), APP.indexOf("/* carrega o save deste dispositivo"));
  t("ler existe", /const lerArquivoDeSave = \(texto\) =>/.test(H));
  t("e confirmar é outra função", /const confirmarImportacao = \(\) =>/.test(H));
  /* A LINHA QUE MAIS IMPORTA: ler NÃO pode tocar no localStorage. */
  const ler = H.slice(H.indexOf("const lerArquivoDeSave"), H.indexOf("const confirmarImportacao"));
  t("LER NÃO GRAVA NADA", !/localStorage\.setItem/.test(ler));
  t("e devolve a linha que a tela mostra", /linha: linhaDoResumo\(r\.resumo\)/.test(ler));
  /* e confirmar guarda o anterior ANTES de sobrescrever */
  const conf = H.slice(H.indexOf("const confirmarImportacao"), H.indexOf("const desfazerImportacao"));
  t("confirmar copia o anterior primeiro", conf.indexOf("taverna_save_anterior") < conf.indexOf('setItem("taverna_save_v1"'));
  t("e o save entra migrado", /migrarPersonagem\(sv\.personagem\)/.test(conf));
  t("há como desfazer", /const desfazerImportacao = \(\) =>/.test(H));
  t("e o desfazer restaura de verdade", /setItem\("taverna_save_v1", anterior\)/.test(H));
}

sec("7. A TELA MOSTRA ANTES, E TUDO ENTRA POR PROP");
{
  /* TelaMenu é função à parte: nada de dentro de Taverna existe no
     escopo dela. Já derrubou painel duas vezes nesta base. */
  const ass = APP.slice(APP.indexOf("function TelaMenu({"), APP.indexOf("function TelaMenu({") + 260);
  for (const p of ["aoLerArquivo", "aoConfirmarImportacao", "aoDesfazerImportacao", "aoExportar"]) {
    t(`"${p}" é prop da TelaMenu`, ass.includes(p));
    t(`e chega no render`, new RegExp(`${p}=\\{`).test(APP));
  }
  const TELA = APP.slice(APP.indexOf("function TelaMenu({"), APP.indexOf("/* ---------------- Aplicação de mudanças"));
  /* v9.169: o rótulo encurtou de "Trazer de um arquivo" para "Trazer de
     arquivo" no redesenho — o botão passou a dividir a linha com o de
     guardar, e o artigo não cabia. A porta continua sendo a mesma. */
  t("o botão de trazer existe", /Trazer de arquivo/.test(TELA));
  t("o de guardar também", /Guardar em arquivo/.test(TELA));
  t("só aceita .json", /accept="\.json,application\/json"/.test(TELA));
  /* escolher o MESMO arquivo duas vezes tem que disparar de novo — sem
     isto, corrigir e reimportar o mesmo caminho não faz nada e parece
     que o botão quebrou */
  t("o mesmo arquivo dispara de novo", /ev\.target\.value = ""/.test(TELA));
  t("o que vem no arquivo aparece antes", /\{lido\.linha\}/.test(TELA));
  t("com os avisos", /lido\.avisos/.test(TELA));
  t("e dizendo o que vai ser substituído", /Isto substitui/.test(TELA));
  t("o desfazer está na tela", /desfazer e voltar/.test(TELA));
}

sec("8. A CRÔNICA É PARA LER; O SAVE É PARA VOLTAR");
{
  /* Quem baixa a crônica achando que fez backup descobre tarde demais —
     então as duas ficam juntas e a linha diz qual é qual. */
  t("o códex oferece o save", /onExportarSave/.test(CODEX));
  t("ao lado da crônica", CODEX.indexOf("baixar crônica") < CODEX.indexOf("guardar a campanha em arquivo"));
  t("e explica a diferença", /é para <em>ler<\/em>/.test(CODEX) && /Para <em>voltar<\/em>/.test(CODEX));
  t("a prop atravessa o PainelLateral", /onExportarCronica, onExportarSave, eventos/.test(APP));
  t("e é repassada ao Códex", /onExportarSave=\{onExportarSave\}/.test(APP));
  /* do MENU não sai mensagem: escrever no diário de uma campanha que nem
     foi aberta seria sujar o registro com um gesto que não é do mundo */
  t("a mensagem só sai dentro da partida", /faseRef\.current === "jogo"\) pushMsgs/.test(APP));
}

console.log(`\narquivo v9.147: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
