/* ============================================================
   R3 — O GESTO DO CAMPO, E A SETA QUE ABRE

   POR QUE ESTA SUÍTE EXISTE, e por que ela lê o `App.jsx` como texto.

   R3 trocou o campo do turno de `<input>` por `<textarea>`. Num campo de
   uma linha, `Enter` só podia fazer uma coisa: mandar. Numa `<textarea>`,
   quebrar a linha passa a ser o comportamento NATIVO do navegador — e
   mandar o turno passa a ser uma coisa que alguém tem de escrever. O
   gesto mais repetido do jogo deixou de ser de graça.

   É exatamente o defeito que passa no `npm run build`, passa em todas as
   suítes de regra, e só o uso pega: o jogador escreve, aperta Enter, e o
   campo dá uma linha em branco em vez de um turno.

   ---------------- POR QUE NÃO UM MÓDULO EM `src/` ----------------

   A regra é três linhas de decisão sobre um evento de teclado — não é
   regra de jogo, não sai de tabela, e não tem nada que fazer em `src/`,
   que é o motor. Mas uma expressão enterrada num JSX de vinte e dois mil
   linhas também não se prova.

   A saída é esta: `gestoDoCampo` existe no `App.jsx` COM NOME e no
   escopo do módulo, e esta suíte EXTRAI a função do arquivo e corre os
   casos contra ela. Não contra uma cópia — contra o código que vai para
   produção. Se alguém a renomear, mover para dentro do componente, ou
   apagar, a extração falha e esta suíte fica vermelha antes de o defeito
   chegar a um jogador.
   ============================================================ */
import { readFileSync } from "node:fs";
import { SUBS_GESTAO, falaDaNovidade } from "../src/abas.js";
import { ALVOS, TIPOS, CAMPO_DO_TURNO } from "../src/estilo.js";

const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

let bons = 0, maus = 0;
const t = (o, cond, extra = "") => {
  if (cond) { bons++; console.log("  ok  " + o); }
  else { maus++; console.log("  XX  " + o + (extra ? "\n      → " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

/* ---------------- a extração, que é ela própria uma asserção ---------------- */
const extrair = (nome) => {
  const i = APP.indexOf(`function ${nome}(`);
  if (i < 0) return null;
  /* conta chaves a partir da primeira `{` da declaração: estas funções são
     pequenas e não têm chave dentro de string nenhuma — se um dia tiverem,
     a extração devolve algo que não roda e a suíte cai, que é o que se quer */
  const a = APP.indexOf("{", i);
  let n = 0, fim = -1;
  for (let k = a; k < APP.length; k++) {
    if (APP[k] === "{") n++;
    else if (APP[k] === "}") { n--; if (n === 0) { fim = k; break; } }
  }
  return fim < 0 ? null : APP.slice(i, fim + 1);
};

sec("1. O GESTO DO CAMPO — Enter manda, Shift+Enter quebra");
const fonteDoGesto = extrair("gestoDoCampo");
t("`gestoDoCampo` existe no escopo do módulo do App.jsx", !!fonteDoGesto,
  "ela foi renomeada, apagada, ou empurrada para dentro do componente. Sem ela no escopo do módulo o gesto volta a ser inprovável — e foi por ser inprovável que ele nunca teve suíte");

if (fonteDoGesto) {
  const gestoDoCampo = new Function(`${fonteDoGesto}; return gestoDoCampo;`)();

  t("Enter sozinho MANDA o turno", gestoDoCampo({ key: "Enter" }) === "mandar");
  t("Shift+Enter QUEBRA a linha", gestoDoCampo({ key: "Enter", shiftKey: true }) === "quebrar");
  /* as outras três modificadoras seguem o Shift: quem segura Ctrl/Alt/Cmd e
     aperta Enter não está a pedir um turno, e mandar por engano custa a vez */
  t("Ctrl+Enter não manda", gestoDoCampo({ key: "Enter", ctrlKey: true }) === "quebrar");
  t("Alt+Enter não manda", gestoDoCampo({ key: "Enter", altKey: true }) === "quebrar");
  t("Cmd+Enter não manda", gestoDoCampo({ key: "Enter", metaKey: true }) === "quebrar");
  t("qualquer outra tecla não faz nada", gestoDoCampo({ key: "a" }) === "nada");
  t("evento nulo não derruba", gestoDoCampo(null) === "nada" && gestoDoCampo(undefined) === "nada");

  /* O CASO QUE QUASE SE ESQUECE, e num jogo escrito em português não é
     caso de canto: com o teclado a compor um acento (`^` de "você", `~`
     de "não"), o Enter que fecha a composição não é um pedido de turno. */
  t("o Enter que fecha um acento não manda o turno",
    gestoDoCampo({ key: "Enter", isComposing: true }) === "nada");
  t("e o 229 dos navegadores que não dizem `isComposing` também não",
    gestoDoCampo({ key: "Enter", keyCode: 229 }) === "nada");
}

sec("2. E o campo do turno usa ESTA função, e não uma cópia");
t("o campo é `<textarea>`", /<textarea value=\{entrada\}/.test(APP),
  "voltou a ser `<input>`: a prosa perdeu a multi-linha que D4 desenhou");
t("e o `onKeyDown` chama `gestoDoCampo`",
  /onKeyDown=\{\(e\) => \{ if \(gestoDoCampo\(e\) === "mandar"\)/.test(APP),
  "o campo voltou a decidir o gesto dentro do JSX — e o que está dentro do JSX não se prova");
/* MOVIDA (24/09, R17 · a emenda do campo). Media que o gesto chamava
   `agir(entrada)` directamente. Passou a chamar `partirOTurno(entrada)`, que
   faz UMA coisa antes e depois chama o mesmo `agir`: devolve o campo ao
   repouso. O motivo é de composição e está escrito no `App.jsx` — o instante
   em que o turno parte é o instante em que a resposta do Mestre vem a
   caminho, e é quando a página mais serve. Sem esse passo, o foco que sobra
   do toque no verbo reabria o campo no pior momento possível.
   O QUE ESTA ASSERÇÃO PROTEGE NÃO MUDOU: que o `Enter` de mandar não escreve
   uma linha em branco antes de partir. Só mudou o nome de quem parte. */
t("mandar impede o `Enter` nativo de escrever a linha em branco",
  /gestoDoCampo\(e\) === "mandar"\) \{ e\.preventDefault\(\); partirOTurno\(entrada\); \}/.test(APP));
t("e quem parte devolve o campo ao repouso ANTES de mandar — e o `agir` fica de fora do try",
  /const partirOTurno = \(texto\) => \{[\s\S]{0,600}?calou\([^)]*\); \}\n    agir\(texto\);/.test(APP)
  || (/const partirOTurno/.test(APP) && /\} catch \(e\) \{ calou\("devolver o campo ao repouso quando o turno parte", e\); \}\s*\n\s*agir\(texto\);/.test(APP)),
  "devolver o campo ao repouso é cosmética; mandar o turno não é — nunca pode custar o turno");
t("e `Agir →` continua a existir como botão", /Agir →<\/Botao>/.test(APP));

sec("3. O SINAL DE SETA FICA RESERVADO AO QUE SE TOCA");
const fonteDaPorta = extrair("portaDaLinhaDeSistema");
const fonteDaSeta = APP.match(/const SETA_DA_PORTA = "[^"]+";/);
const fonteDasPortas = APP.match(/const PORTAS_DO_SISTEMA = \[[\s\S]*?\n\];/);
t("`portaDaLinhaDeSistema` existe no escopo do módulo", !!fonteDaPorta);
t("e a tabela das portas sai de `SUBS_GESTAO`", !!fonteDasPortas && /SUBS_GESTAO\.map/.test(fonteDasPortas[0]),
  "alguém escreveu a lista de rótulos à mão. Ela envelhece calada: a linha continua a aparecer, só que morta outra vez");

if (fonteDaPorta && fonteDaSeta && fonteDasPortas) {
  const porta = new Function("SUBS_GESTAO",
    `${fonteDaSeta[0]}\n${fonteDasPortas[0]}\n${fonteDaPorta}\nreturn portaDaLinhaDeSistema;`)(SUBS_GESTAO);

  /* A PROVA QUE VALE: as frases não são inventadas aqui — são as que
     `falaDaNovidade` de facto escreve. Um teste com a frase copiada à mão
     continuaria verde no dia em que o módulo mudasse o formato dela. */
  for (const id of ["mural", "mercado", "pessoas", "talentos", "correio", "guilda", "dominios", "diplomacia"]) {
    const linha = falaDaNovidade(id);
    const p = porta(linha);
    t(`"${linha.slice(0, 34)}…" abre a sub-aba ${id}`,
      !!p && p.aba === "gestao" && p.sub === id);
  }
  t("a linha do Códex abre a aba de cima", (() => { const p = porta(falaDaNovidade("codex")); return !!p && p.aba === "codex" && p.sub === null; })());

  /* A OUTRA METADE DA LEI: onde a seta não abre nada, ela sai. */
  t("uma linha com seta e um nome que não é porta não abre nada",
    porta("▸ Firmamento — há o que ver ali.") === null);
  t("uma linha sem seta nunca abre nada", porta("Mural — há um mural.") === null);
  t("e lixo não derruba", porta(null) === null && porta("") === null && porta("▸ ") === null);

  const semSeta = new Function(`${fonteDaSeta[0]}\n${extrair("semSetaQueMente")}\nreturn semSetaQueMente;`)();
  t("a seta que não abre é REMOVIDA do texto",
    semSeta("▸ Firmamento — há o que ver ali.") === "Firmamento — há o que ver ali.");
  t("e o texto sem seta passa intacto", semSeta("a chuva começou.") === "a chuva começou.");
}

sec("4. O piso do alvo entra na tela principal, e sai de tabela");
/* MOVIDA (24/09, R17 §19) — a lei da casa manda escrever o motivo ao
   mover uma asserção. Esta media `minHeight: ALVOS.piso }} />` em linha,
   no `<textarea>` do campo do turno. Esse `minHeight` SAIU do JSX: estilo
   em linha ganha sempre da folha, e por isso é a FOLHA — não mais o
   componente — quem decide a altura do campo por coluna
   (`estilo.js`, `.tv-campo-do-turno`); o `<textarea>` hoje só carrega a
   classe. O que esta asserção protegia (o campo não inventa altura, ela
   sai de tabela) continua protegido — só mudou de casa, e a prova muda
   junto: lê `estilo.js` como texto, do mesmo jeito que esta suíte já lê
   `APP`.
   NÃO afirmo 90/138 nus: o piso da coluna estreita está em discussão com
   o `jogo` agora mesmo (a página caiu 81px em TODO turno para servir só
   o turno em que se escreve — pode virar tecto sem ser piso). A prova
   fica na ESTRUTURA — a folha lê as tabelas certas, dentro e fora da
   media query certa, e o tecto é maior que o piso —, para sobreviver a
   essa decisão seja ela qual for. */
{
  const ESTILO = readFileSync(new URL("../src/estilo.js", import.meta.url), "utf8");
  const iRegra = ESTILO.indexOf(".tv-campo-do-turno {");
  const iMedia = ESTILO.indexOf("@media ${CAMPO_DO_TURNO.colunaEstreita}");
  const foraDaMediaQuery = iRegra >= 0 && iMedia > iRegra ? ESTILO.slice(iRegra, iMedia) : "";
  const dentroDaMediaQuery = iMedia >= 0 ? ESTILO.slice(iMedia, iMedia + 900) : "";
  t("fora da media query, `.tv-campo-do-turno` lê `ALVOS.piso` — o piso de sempre, na mesa",
    /min-height: \$\{ALVOS\.piso\}px/.test(foraDaMediaQuery));
  /* MOVIDAS (24/09, R17 · a emenda do campo), e a nota de cima já as tinha
     previsto: *"o piso da coluna estreita está em discussão com o `jogo`
     agora mesmo — pode virar tecto sem ser piso"*. Virou.

     O QUE MUDOU: a coluna estreita deixou de ter um PISO de 90 px em todos
     os turnos e passou a ter DOIS MOMENTOS. Em repouso o campo é uma linha
     a `ALVOS.piso` — nenhum número novo —, e ao ganhar foco salta direito ao
     tecto. A régua é do `jogo`, contra ele próprio: *o campo e a prosa nunca
     disputam a mesma atenção; quando ele escreve, não lê; quando lê, o campo
     está vazio.* Medido: os 90 px permanentes levavam a página de 306 para
     224,7; com a altura condicional ela fica em 322,7.

     A PROVA CONTINUA NA ESTRUTURA e não nos números, pela mesma razão de
     antes: que a folha lê as tabelas certas do lado certo da media query, e
     que a altura não voltou a viver em linha no JSX. */
  t("na coluna estreita o REPOUSO lê `ALVOS.piso` — o momento de convidar não inventa altura nova",
    /height: \$\{ALVOS\.piso\}px/.test(dentroDaMediaQuery));
  t("e o ABERTO lê `CAMPO_DO_TURNO.tecto` — o momento de escrever é o único que custa página",
    /\.tv-campo-aberto \{ height: \$\{CAMPO_DO_TURNO\.tecto\}px; \}/.test(dentroDaMediaQuery));
  t("a segunda linha dos verbos é escondida pela FOLHA, nunca por um ramo de JSX",
    /\.tv-turno-repouso \.tv-turno-verbos \{ display: none; \}/.test(dentroDaMediaQuery),
    "esconder em JS apagaria os dois verbos também na coluna larga, onde eles servem sempre");
  t("e o campo do turno, na tela, carrega essa classe — nenhuma altura voltou a viver em linha",
    /tv-campo-do-turno/.test(APP) && !/minHeight: ALVOS\.piso \}\} \/>/.test(APP));
}
/* V3b (25/09) · a porta deixou de ser uma pílula (fundo `paginaAlta`) e passou a
   ser a linha do ladrilho feita botão; a asserção guarda o mesmo — o alvo é a
   linha inteira, a `ALVOS.piso`. */
t("a linha do sistema que abre uma porta lê `ALVOS.piso`",
  /minHeight: ALVOS\.piso, gap: LADRILHO\.espaco, cursor: "pointer"/.test(APP));
/* a conta é a mesma que `estilo.js` guarda, e é por isso que ela é tabela:
   um 48 escrito à mão aqui não teria como ser conferido de volta */
t("e o piso continua a ser 48 e ≥ 44 (WCAG 2.5.5)", ALVOS.piso === 48 && ALVOS.piso >= 44);
const semTabela = (APP.match(/minHeight: 4[0-9],/g) || []);
t("nenhuma altura de controlo voltou a ser literal na tela principal", semTabela.length === 0,
  `achei ${semTabela.length}: ${semTabela.join(" ")} — use ALVOS.piso`);

sec("5. A página, a coluna e as peças de R2 estão montadas");
/* V1b (25/09) · a asserção deixou de pedir `paginaFio`: o token aposentou-se
   quando o contorno decorativo (`line`) se separou do de controlo
   (`lineStrong`). O que ela guarda é o que importava — a narração mora na
   SUA superfície, `T.pagina`, e não na mesa. */
/* V5a (25/09) · o fio do cartão passou de `border` a `outline` por dentro
   (`outlineOffset: -1`), como o `strokeAlign: INSIDE` do Figma — é o que põe
   o cabeçalho da página a 24 px da borda e não a 25. A asserção aceita os
   dois nomes do fio e guarda o mesmo: a narração mora na SUA superfície. */
t("a narração usa a superfície dela", /background: T\.pagina, (?:border|outline): `1px solid \$\{T\.line\}`/.test(APP),
  "a narração voltou à mesa fria: o painel e o balão voltam a medir 1,039:1 um contra o outro");
/* R21: a fala do Mestre ganhou `data-msg` (o endereço para onde a espreita
   do alforje salta) e `scrollMarginTop: ESBATIMENTO.altura` (para o salto não a
   deixar debaixo do esbatido de cima). O que a régua prende é a COLUNA —
   `tv-coluna` na fala do Mestre —, e ela tolera atributos depois da classe. */
t("a prosa do Mestre tem medida de coluna", /className="tv-fade tv-coluna"[^>\n]*>\s*\n\s*<Voz quem="mestre"/.test(APP));
/* mede o CÓDIGO e não a prosa: o comentário que explica por que as
   percentagens saíram cita-as, e um regex cego sobre o arquivo inteiro
   acusaria o próprio motivo de ser o defeito */
const classes = (APP.match(/className="[^"]*"/g) || []).join(" ");
t("e não voltaram as percentagens que partiam os dois aparelhos",
  !/max-w-\[95%\]/.test(classes) && !/max-w-\[85%\]/.test(classes)
  && !/md:max-w-\[82%\]/.test(classes) && !/md:max-w-\[70%\]/.test(classes));
t("a prosa nasce em `TIPOS.prosa`", /fontSize: TIPOS\.prosa, color: T\.ink/.test(APP) && TIPOS.prosa === 17);
t("`A voz` entrou nos DOIS sítios onde o cabeçalho estava à mão",
  (APP.match(/<Voz quem=/g) || []).length >= 3,
  "são três usos: o timbre da página, a prosa do Mestre e a fala do jogador");
t("e o botão de ouvir deixou de medir 22", !/width: 22, height: 22, fontSize: 12/.test(APP));
t("`A soleira` está montada com `A oferta` dentro", /<Soleira ofertas=\{vivas\.map\(\(o\) => \(/.test(APP) && /<Oferta key=\{o\.id\}/.test(APP));
t("a montagem da lista tem nome e está em `try/catch`",
  /const ofertasDaSoleira = \(\) => \{\s*\n\s*try \{/.test(APP) && /calou\("montar a soleira", e\); return \[\];/.test(APP),
  "a soleira lê sete estados diferentes; um deles em forma inesperada não pode derrubar a cena");
t("e `bloqueado` NÃO a desliga — só impede a oferta que precisa do narrador",
  /estado=\{o\.precisaDoNarrador && bloqueado \? "impedida" : "repouso"\}/.test(APP),
  "se a soleira sumir durante os 14,3 s, o ganho principal da etapa some com ela");
/* R15: a expressão ganhou uma cláusula e a asserção acompanha-a. O que ela
   guardava — a marca decai por TURNO e não por relógio — não mudou; o que
   entrou foi uma segunda lei, do `jogo`: a fila B (o que COBRA) nunca
   CHEGA, porque ela ESTÁ. Uma marca de "novo neste turno" que dura enquanto
   o estado durar deixa de significar novo e passa a significar ruído. */
t("a chegada decai por TURNO, e não por relógio",
  /chegada=\{o\.fila === "B" \|\| \(jaTinha && jaTinha\.has\(o\.id\)\) \? "assentada" : "agora"\}/.test(APP)
  && /\}, \[carregando\]\); \/\/ eslint-disable-line/.test(APP),
  "uma marca que morre por tempo morre enquanto o jogador está a pensar");
t("e a fila B nunca chega — ela está",
  /o\.fila === "B" \|\| /.test(APP),
  "a fila A chega; a fila B está. Uma marca de novidade que dura cinco turnos é ruído");

sec("6. O atalho de rolamento não pode voltar a tapar a chamada do turno");
t("ele vive dentro do invólucro da página, e não do `main`",
  /<div className="relative flex-1 min-h-0 flex flex-col">/.test(APP),
  "sem o invólucro ele volta a ancorar no fundo do `main`, que é onde o convés está");
t("e mede o piso do alvo, e não 46", /width: ALVOS\.piso, height: ALVOS\.piso, background: T\.paginaAlta/.test(APP));

/* ============================================================
   7. A RÉGUA DA SOLEIRA SEPARA ESTADOS, E NÃO OBJETOS (R5b)

   Estas asserções são NOVAS, não movidas: em R3 a soleira tinha cinco
   entradas e nenhuma suíte media QUAIS. O `jogo` corrigiu a própria lei
   de R1 — *a soleira é o que se perde se não se agir agora, e mobília
   não se perde* — e cinco viraram três. Sem catraca, a tábua da cidade e
   o mercado voltam para cá no primeiro ciclo em que alguém achar que a
   soleira está vazia demais, e voltam com um argumento bom (o mural
   nunca fica vazio, logo há sempre o que mostrar) — que é exactamente o
   argumento errado: uma soleira sempre cheia da mesma coisa é mobília.
   ============================================================ */
sec("7. A soleira leva OFERECIDOS A VOCÊ, e nunca a tábua nem o mercado (R5b)");
/* recorta a montagem da lista, para não medir a prosa dos comentários do
   arquivo inteiro — que fala de mercado e de tábua de propósito, ao
   explicar por que saíram */
const iSol = APP.indexOf("const ofertasDaSoleira = () => {");
const rSoleira = iSol < 0 ? "" : APP.slice(iSol, APP.indexOf('calou("montar a soleira"', iSol));
t("a montagem da soleira foi encontrada", rSoleira.length > 500);
t("o cartaz entra SÓ se `oferecido` — a tábua da cidade não entra",
  /\(mural \|\| \[\]\)\.filter\(\(c\) => c && c\.oferecido && /.test(rSoleira)
  && !/!c\.oferecido/.test(rSoleira),
  "`!c.oferecido` é a pilha *Cartazes disponíveis*: acervo do lugar, e lugar chega pela porta");
t("e não há teto de contratos do mundo, porque não há contratos do mundo aqui",
  !/TETO_DE_CONTRATOS_DO_MUNDO/.test(APP));
t("o mercado não é oferta — é um lugar, e lugares abrem pela aba",
  !/id: "mercado\|aqui"/.test(APP) && !/verbo: "Negociar aqui"/.test(APP),
  "que há comércio numa cidade o jogador adivinha, e o mercado não se perde por não se agir agora");
/* ASSERÇÃO MOVIDA EM 24/09 (R17), E O MOTIVO É QUE ELA FICOU FRACA DEMAIS.

   Ela exigia `jaNoDiario`/`semNome` dentro da soleira — um teste de TÍTULO
   EXACTO. A pessoa jogou no telefone e achou o buraco: *"existe o botão de
   aceitar quest sendo que a quest já foi aceita, então ele diz que ela já
   está no diário e o botão continua lá"*. E a causa era esta linha a
   proteger a conta errada — `aceitarProposta` recusa por CINCO motivos
   (o tecto de `MAX_ATIVAS`, o duplicado semântico de `pareceMesmaMissao`,
   o mesmo dador com o mesmo alvo, a etapa inconferível), e o título exacto
   só apanha um deles. Títulos diferentes para o mesmo serviço passavam o
   filtro e eram recusados no aceite: **o botão não podia dar certo, nunca.**

   A intenção SOBREVIVE e ficou mais larga: continua a ser *o que já foi
   aceite sai da soleira*, agora pelo ensaio seco que a tábua e o aceite
   leem — uma conta só, e é literalmente a mesma função. Por isso a
   asserção passa a EXIGIR `podeAceitarCartaz` e a PROIBIR o regresso do
   teste de título, que é o que a tornava uma catraca a proteger o defeito. */
t("o que já foi aceite sai da soleira, pelo MESMO ensaio seco que o aceite aplica",
  /podeAceitarCartaz\(c\)/.test(rSoleira)
  && !/jaNoDiario/.test(rSoleira) && !/semNome\(q\.titulo\)/.test(rSoleira),
  "cliquei no cartaz já aceite e o jogo respondeu `já está no diário`: um botão morto na fila ensina a não olhar para a soleira — e o teste de título exacto deixava passar o caso em que os nomes divergem");
/* AS QUE SOBRAM, na ordem da perecibilidade — a ordem é a prioridade, e
   medi-la pela posição no texto é medir a ordem da lista.

   R13 MUDOU OS DOIS EXTREMOS DESTA FILA, E OS DOIS COM NÚMERO À FRENTE.

   SAIU `Esperar`, e com ele a dívida que R4b tinha assumido. Ele estava
   aqui EMPRESTADO e com o motivo escrito: pela régua desta região não é
   oferta — o jogador podia ter pensado em esperar sozinho —, e só entrou
   porque R4b lhe tirou a aba `Tempo` e não lhe deu casa. Medido em R6: em
   **9 dos 20 turnos** a soleira SÓ tinha `Esperar`, ou seja 149 px de
   moldura em quase metade dos turnos para não oferecer nada. Ele mudou-se
   para o toque no relógio (`OPainelDoTempo`), ao lado do acampamento, e a
   trava que `formas.md` §R1b tinha deixado aberta fecha-se do lado certo:
   *não se escondeu o controlo, deu-se-lhe casa*.

   ENTROU `Montar acampamento`, e é a única entrada que não obedece à régua
   da perecibilidade — obedece a uma mais forte, e por isso é a PRIMEIRA.
   Medido em T12 de R6: o `😵 Exausto` apareceu na barra de estado e a cura
   não foi oferecida em lado nenhum; o jogador teve de se lembrar sozinho do
   emoji no canto do cabeçalho. Não há nada mais perecível do que um corpo
   que precisa de descanso, e ele só entra QUANDO HÁ O QUE CURAR — fora
   disso não é oferta nenhuma, é um verbo à mão, e vive no relógio. */
{
  const i0 = rSoleira.indexOf('id: "tempo|acampar"');
  const i1 = rSoleira.indexOf('id: `missao|');
  const i2 = rSoleira.indexOf('id: `convite|');
  const i3 = rSoleira.indexOf('id: "chao|aqui"');
  const i4 = rSoleira.indexOf('id: `cartaz|');
  t("as quatro entradas da régua existem, e o corpo à frente delas", [i0, i1, i2, i3, i4].every((i) => i > 0));
  /* ============================================================
     R15 REESCREVE ESTA ASSERÇÃO, E O MÉTODO DELA — NÃO SÓ OS VALORES.

     Ela media a ordem da lista pela POSIÇÃO NO TEXTO, e isso era verdade
     enquanto havia uma fila só. Agora há duas (`lista` = o que FECHA,
     `filaB` = o que COBRA) e a ordem final é COMPOSTA no `return`:

         [A0, B0, ...resto de A]

     Logo a posição no texto já não é a ordem da lista para a fila B — o
     acampamento e a estrada são escritos no topo da função e entregues no
     SEGUNDO lugar. Deixar a asserção medir texto seria deixá-la medir uma
     coisa que deixou de ser a coisa. Passa a medir as duas separadamente,
     mais a linha que as compõe.

     E DENTRO DA FILA A A ORDEM MUDOU NUM PONTO: o chão passou para DEPOIS
     do cartaz, por `formas.md` §R15. A razão antiga — *o chão perece com o
     passo, a tábua continua pregada amanhã* — não foi apagada: está inteira
     no comentário do código, dita como o que é, uma leitura que perdeu e
     que um censo futuro pode reabrir. As duas são perecibilidade e
     discordam só sobre qual perece mais depressa, e isso mede-se jogando.
     ============================================================ */
  const iViagem = rSoleira.indexOf('id: "viagem|seguir"');
  const iPeticao = rSoleira.indexOf('id: `peticao|');
  t("a fila A está na ordem da perecibilidade: petição · resposta · cena · papel · chão",
    iPeticao > 0 && iPeticao < i1 && i1 < i2 && i2 < i4 && i4 < i3,
    "a régua da fila A é quanto tempo a oferta sobrevive, do mais curto ao mais longo — e a petição expira sozinha, sem ninguém agir");
  t("a fila B tem os dois estados que cobram, e a estrada à frente do corpo",
    iViagem > 0 && iViagem < i0,
    "com jornada aberta E o corpo a pedir, a estrada ganha: dois botões para `o teu estado cobra` seria a doença, não a cura");
  t("e os dois da fila B entram por `filaB`, não pela fila A",
    /filaB\.push\(\{\s*\n\s*id: "viagem\|seguir"/.test(rSoleira)
    && /filaB\.push\(\{\s*\n\s*id: "tempo\|acampar"/.test(rSoleira));
  t("a composição dá o primeiro lugar à fila A e o segundo à B",
    /return lista\.length \? \[lista\[0\], \.\.\.B, \.\.\.lista\.slice\(1\)\] : B;/.test(rSoleira + APP),
    "no telefone (teto 1) vê-se A0; na mesa (teto 2) A0 e B0 — a fila B só ocupa lugar quando não tira nada a ninguém");
  t("e a fila B é capada a UMA",
    /const B = filaB\.slice\(0, 1\);/.test(APP));
  t("o chão passou para depois do cartaz, e a razão antiga não se perdeu no diff",
    i4 < i3 && /PERECE COM O PASSO/.test(rSoleira) && /perdeu, nao morreu/i.test(rSoleira),
    "`formas.md` manda, mas uma razão que desaparece no diff deixa de poder ser reaberta — e esta pode ser reaberta por um censo futuro");
  t("`Esperar` deixou a soleira e o empréstimo de R4b está pago",
    i0 > 0 && rSoleira.indexOf('id: "tempo|esperar"') < 0 && /E `ESPERAR` SAIU DAQUI EM R13/.test(APP),
    "pela régua ele nunca foi oferta; agora tem casa própria no toque do relógio, e o porquê está dito onde se lê");
  t("e o acampamento só sobe quando há o que curar",
    /if \(curadas\.length \|\| vidaBaixa \|\| exausto\)/.test(rSoleira),
    "uma oferta que aparece em todo turno é mobília — foi o que condenou a tábua da cidade em R5b");
  /* R13-B: A CONTA MUDOU DE SÍTIO, E A LEI FICOU MAIS FORTE. A asserção
     pedia a conta inteira — rações, água, a noite de cada prazo — dentro da
     OFERTA. Medido ao vivo no telefone: `A oferta` põe preço e retorno na
     MESMA linha de ~300 px, a conta inteira pedia 429, e o veredito era
     cortado ao meio. Um veredito cortado é pior do que um resumido.

     Onde ela vive agora é onde o clique é de facto IRREVERSÍVEL: o
     `🌙 Descanso longo`, empilhado e com folga. Montar acampamento não é
     irreversível — a terceira porta da v9.99 deixa sair sem dormir —, e o
     que a oferta promete é o TEMPO, que é o que o relógio ao lado dela
     garante. O prazo tem ainda uma segunda voz a 48 px: o selo da cinta.

     A régua passa a medir as DUAS pontas, que é mais do que media antes:
     a manchete na oferta, a conta inteira no botão que a cobra — e as duas
     saindo das mesmas funções que a vão aplicar, porque duas contas para o
     mesmo preço seriam duas verdades. */
  t("a oferta escreve a manchete, pela função que a vai cobrar",
    /limparPorDescanso\(personagem\.condicoes \|\| \[\], "longo"\)/.test(rSoleira)
    && /preco: "uma noite"/.test(rSoleira)
    && /retorno: oQueCura \?/.test(rSoleira),
    "o veredito antes do clique, com os dois lados — e o que ela promete é o TEMPO, que é o que o relógio ao lado garante");
  {
    const iSaidas = APP.indexOf("R13 · §4.2 — O ACAMPAMENTO ESCREVE O QUE COBRA");
    const rSaidas = iSaidas < 0 ? "" : APP.slice(iSaidas, iSaidas + 4200);
    t("e a conta INTEIRA está no toque que a cobra — o descanso longo",
      rSaidas.length > 500
      && /consumoDiario\(bocas\)/.test(rSaidas)
      && /\+1 noite em /.test(rSaidas)
      && /limparPorDescanso\(personagem\.condicoes \|\| \[\], "longo"\)/.test(rSaidas)
      && /podeDescansoLongo\(personagem, dia\)/.test(rSaidas),
      "medido em R6: `Descanso longo` dizia 'tudo, uma vez por dia' e cobrou a noite de um prazo, a comida e a água — três preços irreversíveis, nenhum na cara do botão");
    t("e as três saídas dizem, cada uma, o que custam e o que devolvem",
      (rSaidas.match(/saida\("/g) || []).length === 3 && /custa \{custa\}/.test(rSaidas) && /devolve \{devolve\}/.test(rSaidas),
      "sair sem descansar também é uma saída, e também tem preço — 20 minutos");
  }
}

sec("R17 · CAMPO_DO_TURNO — o campo deixou de ser um alvo mínimo");
/* `CAMPO_DO_TURNO` (`estilo.js`) tinha um leitor só: a própria folha
   (`RAMPA_...` gerado a partir dela). A lei é ≥2, e a catraca é
   `teste-ligacao` — este bloco é o segundo leitor, e prova algo, não só
   conta. Não afirmo 90 e 138 nus: o próprio `estilo.js` já diz, no
   comentário acima da tabela, que os dois NÃO SE REPRODUZEM pela fórmula
   do §19 enquanto `MEDIDAS` não nascer (`TIPOS.corpo` hoje é 15, a conta
   pede 16) — uma asserção que congelasse o valor prenderia essa dívida
   em vez de deixá-la se pagar sozinha no dia em que `MEDIDAS` existir.
   O que vale a pena afirmar são as DUAS RELAÇÕES que a etapa comprou: */
/* MOVIDAS (24/09, R17 · a emenda do campo). Estas duas afirmavam
   `CAMPO_DO_TURNO.piso`, que DEIXOU DE EXISTIR — e deixou de existir pela
   melhor das razões: o repouso não é número novo, é `ALVOS.piso`, e um
   número que já tem casa não ganha uma segunda. A relação que a etapa
   comprou mudou de forma com ele:
     ANTES  o campo é sempre maior que um alvo mínimo (piso 90 > 48)
     AGORA  o campo tem dois momentos, e só o de escrever é maior
   A segunda é mais forte que a primeira, porque é ela que impede o regresso
   do custo permanente: se algum dia o repouso subir acima de `ALVOS.piso`, a
   página volta a pagar em todos os turnos o que serve num só. */
t("o momento de escrever é maior que o de convidar — e só ele custa página",
  CAMPO_DO_TURNO.tecto > ALVOS.piso,
  `tecto=${CAMPO_DO_TURNO.tecto} · ALVOS.piso=${ALVOS.piso}`);
t("e o repouso NÃO tem número próprio — quem lhe dá altura é `ALVOS.piso`",
  CAMPO_DO_TURNO.piso === undefined,
  "um piso próprio aqui seria o custo permanente a voltar: 81 px em todo turno para servir o único turno em que a página já não está a ser lida");
/* e o movimento tem saída, que é lei desta casa para tudo o que se mexe */
t("o salto até ao tecto respeita `prefers-reduced-motion`",
  /@media \(prefers-reduced-motion: reduce\) \{\s*\n\s*\.tv-campo-do-turno \{ transition: none; \}/
    .test(readFileSync(new URL("../src/estilo.js", import.meta.url), "utf8")),
  "e o bloco tem de vir DEPOIS da transição: uma media query não soma especificidade, só envolve");

/* ---------------- `Agir →` não existe enquanto não há o que agir ---------------- */
/* A lei desta etapa, aplicada à tela onde se passam 90 % do jogo: um alvo de
   ~90 px que, com o campo vazio, NÃO PODE DAR CERTO é o mesmo defeito que o
   botão do cartaz do mural, uma faixa mais abaixo. *O melhor botão
   desactivado é o que não está lá.*
   E `bloqueado` é outra coisa e continua a valer: com texto no campo e o
   Mestre a escrever o botão FICA, cinzento — ali a recusa é uma ESPERA, e
   uma espera mostra-se; o vazio é uma AUSÊNCIA, e uma ausência não se
   desenha. */
t("`Agir →` nasce na primeira letra — com o campo vazio ele não está lá",
  /\{entrada\.trim\(\) \? \(/.test(APP) && !/desativado=\{bloqueado \|\| !entrada\.trim\(\)\}/.test(APP));
t("e `bloqueado` continua a apagá-lo, porque esperar não é o mesmo que não ter o que mandar",
  /<Botao primario corpo desativado=\{bloqueado\} onClick=\{\(\) => partirOTurno\(entrada\)\}>Agir →<\/Botao>/.test(APP));
t("e o campo só encolhe VAZIO E SEM FOCO, e `bloqueado` força o repouso",
  /const campoAberto = !bloqueado && \(campoFocado \|\| !!entrada\.trim\(\)\);/.test(APP),
  "encolher com texto lá dentro esconderia ao jogador o que ele escreveu — o defeito dos 31 % outra vez, de propósito");

console.log(`\ncampo do turno R3: ${bons} passaram, ${maus} falharam`);
if (maus) process.exit(1);
