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
import { ALVOS, TIPOS } from "../src/estilo.js";

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
t("mandar impede o `Enter` nativo de escrever a linha em branco",
  /gestoDoCampo\(e\) === "mandar"\) \{ e\.preventDefault\(\); agir\(entrada\); \}/.test(APP));
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
t("o campo do turno lê `ALVOS.piso`", /minHeight: ALVOS\.piso \}\} \/>/.test(APP));
t("a linha do sistema que abre uma porta lê `ALVOS.piso`",
  /minHeight: ALVOS\.piso, background: T\.paginaAlta, color: T\.amberSoft/.test(APP));
/* a conta é a mesma que `estilo.js` guarda, e é por isso que ela é tabela:
   um 48 escrito à mão aqui não teria como ser conferido de volta */
t("e o piso continua a ser 48 e ≥ 44 (WCAG 2.5.5)", ALVOS.piso === 48 && ALVOS.piso >= 44);
const semTabela = (APP.match(/minHeight: 4[0-9],/g) || []);
t("nenhuma altura de controlo voltou a ser literal na tela principal", semTabela.length === 0,
  `achei ${semTabela.length}: ${semTabela.join(" ")} — use ALVOS.piso`);

sec("5. A página, a coluna e as peças de R2 estão montadas");
t("a narração usa a superfície quente", /background: T\.pagina, border: `1px solid \$\{T\.paginaFio\}`/.test(APP),
  "a narração voltou à mesa fria: o painel e o balão voltam a medir 1,039:1 um contra o outro");
t("a prosa do Mestre tem medida de coluna", /className="tv-fade tv-coluna">\s*\n\s*<Voz quem="mestre"/.test(APP));
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
t("a chegada decai por TURNO, e não por relógio",
  /chegada=\{jaTinha && jaTinha\.has\(o\.id\) \? "assentada" : "agora"\}/.test(APP)
  && /\}, \[carregando\]\); \/\/ eslint-disable-line/.test(APP),
  "uma marca que morre por tempo morre enquanto o jogador está a pensar");

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
t("o que já foi aceite sai da soleira, pelo MESMO teste que `pregarNoMural` usa",
  /const jaNoDiario = new Set\(garantirMissoes\(missoes\)/.test(rSoleira)
  && /\["ativa", "oferecida", "concluida"\]\.includes\(q\.status\)/.test(rSoleira),
  "cliquei no cartaz já aceite e o jogo respondeu `já está no diário`: um botão morto na fila ensina a não olhar para a soleira");
/* as três que SOBRAM, na ordem da perecibilidade — a ordem é a prioridade,
   e medi-la pela posição no texto é medir a ordem da lista */
{
  const i1 = rSoleira.indexOf('id: `missao|');
  const i2 = rSoleira.indexOf('id: `convite|');
  const i3 = rSoleira.indexOf('id: "chao|aqui"');
  const i4 = rSoleira.indexOf('id: `cartaz|');
  const i5 = rSoleira.indexOf('id: "tempo|esperar"');
  t("as cinco entradas que restam existem", [i1, i2, i3, i4, i5].every((i) => i > 0));
  t("e estão na ordem da perecibilidade: resposta · cena · chão · papel · esperar",
    i1 < i2 && i2 < i3 && i3 < i4 && i4 < i5,
    "a régua da lista é quanto tempo a oferta sobrevive, do mais curto ao mais longo");
}
t("`Esperar` fica por último E o empréstimo está escrito no código",
  /ESPERAR, E ESTÁ AQUI EMPRESTADO/.test(APP) && /porta de texto/i.test(APP),
  "pela régua ele não é oferta; fica porque `passarTempo` não tem porta de texto, e isso tem de estar dito onde se lê");

console.log(`\ncampo do turno R3: ${bons} passaram, ${maus} falharam`);
if (maus) process.exit(1);
