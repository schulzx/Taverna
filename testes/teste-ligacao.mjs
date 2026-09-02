/* teste-ligacao.mjs (v9.85) — o mestre está ligado a tudo?

   "Temos que ter certeza que todos os sistemas estão ligados ao mestre,
   pois para ele tocar o mundo ele tem que ter controle sobre o mundo."

   Ter certeza uma vez não serve: o que esta casa precisa é de uma
   CATRACA. A varredura vira asserção, com a lista do que já se sabe
   morto congelada aqui dentro — e qualquer regra NOVA que nasça sem
   leitor quebra a suíte no dia em que for escrita, em vez de esperar
   alguém topar com ela jogando.

   É a resposta mecânica para a classe de bug que esta casa mais repete.
   O `m.ativa` viveu da v9.61 à v9.71; o `npcs[cidade].gente` viveu duas
   versões; "Comando: Atacar" era comprável e inerte desde que a árvore
   de invocação existe. Nenhum deles quebrava nada — só não acontecia. */
import fs from "node:fs";
import path from "node:path";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const DIR = "../src";
const SP = ".";
const arqs = fs.readdirSync(DIR).filter((f) => /\.(js|jsx)$/.test(f));
const fonte = Object.fromEntries(arqs.map((f) => [f, fs.readFileSync(path.join(DIR, f), "utf8")]));
const provas = fs.readdirSync(SP).filter((f) => /^teste-.+[.]mjs$/.test(f) && f !== "teste-ligacao.mjs");
const txtProvas = provas.map((f) => fs.readFileSync(path.join(SP, f), "utf8")).join("\n");

/* ============================================================
   O QUE JÁ SE SABE MORTO, e por quê.

   Toda entrada precisa de uma razão. Uma lista de perdão sem motivo
   escrito vira o lugar onde os bugs vão morar — bastaria acrescentar um
   nome para calar a catraca, e aí ela não protege mais nada.
   ============================================================ */
const PERDOADAS = {
  /* As duas SUPERSEDIDAS que moravam aqui — o gerador de nemese antigo em
     fama.js e a duplicata da mingua da fe em divindades.js — foram
     REMOVIDAS na v9.86, com uma lapide no lugar explicando para onde a
     regra mudou. Perdao nao serve para codigo morto que da para apagar:
     serve para o que precisa continuar existindo sem leitor. */
  /* ATALHOS por id que nunca precisaram existir: quem lê essas tabelas
     lê a tabela inteira. Baratos e inofensivos. */
  "mestria.js": ["pilarPorId"],
  "reacoes.js": ["reacaoPorId"],
  "relogios.js": ["relogioPorId"],
  "social.js": ["alavancaPorId"],
  "emboscada.js": ["faixaPorId"],
  "classes.js": ["classeDaSubclasse"],
  "moldes.js": ["rotuloDoBioma"],
  "profissoes.js": ["beneficioDe"],
  "testes.js": ["atributoDoTeste"],
  "pocoes.js": ["ehConsumivel"],
  /* TEXTO E CONSTANTES que a interface acabou não usando */
  "chao.js": ["quantosPerto", "linhaDoAchado"],
  /* v9.125: ehEstorvo saiu da lista — a grade em SVG desenha o estorvo
     como vulto no chao, e para isso precisa perguntar onde ele esta. */
  "grid.js": ["ondeEstaEmPalavras"],
  "nomes.js": ["sortearVarios", "generosDisponiveis"],
  "godmode.js": ["GODMODE_AVISO"],
  "itens.js": ["PROPS"],
  "movimento.js": ["DESLOCAMENTO_LIGEIRO"],
  /* v9.154: `xpParaNivel` saiu da lista — o Juiz lê a curva para saber o
     VÃO de cada nível, e todo XP do jogo passou a ser uma fração dele.
     A função esperou muitas versões por um leitor; perdão que sobra é
     dívida escondida, e este varredor existe para não deixar sobrar. */
};

sec("1. NENHUM MÓDULO MUDO");
{
  const FOLHAS = /^(main\.jsx|painel-.*\.jsx|planta-cidade\.jsx|ui\.jsx)$/;
  const mudos = [];
  for (const f of arqs) {
    if (FOLHAS.test(f)) continue;
    const base = f.replace(/\.jsx?$/, "");
    const quem = arqs.filter((g) => g !== f && (fonte[g].includes(`from "./${f}"`) || fonte[g].includes(`from "./${base}"`)));
    if (!quem.length) mudos.push(f);
  }
  t(`todo módulo de src/ está ligado a alguém${mudos.length ? " — mudos: " + mudos.join(", ") : ""}`, mudos.length === 0);
}

sec("2. A CATRACA — nenhuma regra NOVA sem leitor");
{
  const RX = /^export (?:async )?(?:function|const|class) ([A-Za-z_][A-Za-z0-9_]*)/gm;
  const achadas = {};
  let tot = 0;
  for (const f of arqs) {
    for (const m of fonte[f].matchAll(RX)) {
      const nome = m[1];
      tot++;
      const rx = new RegExp("\\b" + nome + "\\b", "g");
      let c = 0;
      for (const g of arqs) c += (fonte[g].match(rx) || []).length;
      c += (txtProvas.match(rx) || []).length;
      if (c <= 1) (achadas[f] = achadas[f] || []).push(nome);
    }
  }
  const novas = [];
  for (const f of Object.keys(achadas)) {
    for (const nome of achadas[f]) if (!(PERDOADAS[f] || []).includes(nome)) novas.push(`${f}:${nome}`);
  }
  t(`${tot} regras varridas, nenhuma nova sem leitor${novas.length ? " — " + novas.join(", ") : ""}`, novas.length === 0);

  /* E A CATRACA ANDA NOS DOIS SENTIDOS: uma regra que foi LIGADA tem de
     sair da lista de perdão, senão a lista cresce e vira decoração. */
  const ressuscitadas = [];
  for (const f of Object.keys(PERDOADAS)) {
    for (const nome of PERDOADAS[f]) if (!(achadas[f] || []).includes(nome)) ressuscitadas.push(`${f}:${nome}`);
  }
  t(`nenhum perdão sobrando${ressuscitadas.length ? " — já tem leitor: " + ressuscitadas.join(", ") : ""}`, ressuscitadas.length === 0);
}

sec("3. AS DUAS QUE ESTA VARREDURA ACHOU");
{
  /* "Comando: Atacar" custa um ponto no rank 2 e promete "sua invocação
     ataca com fúria redobrada". O leitor dela existia em invocacoes.js,
     ao lado de três irmãos ligados, e ninguém o chamava. É a pior
     versão do bug: o jogador PAGA por ela. */
  const app = fonte["App.jsx"];
  t("a árvore ainda oferece Comando: Atacar", /HAB\("Comando: Atacar"/.test(fonte["classes.js"]));
  t("e agora ela é lida", /temComandoAtacar\(persAtual\)/.test(app));
  t("dando vantagem às invocações", /comFuria = temComandoAtacar\(persAtual\) \? invocacoesDe/.test(app));
  t("sem virar uma segunda Voz de Comando", !/comFuria[\s\S]{0,400}?turnoDosCompanheiros\([\s\S]{0,200}?turnoDosCompanheiros\(/.test(app));
  const comb = fonte["combate.js"];
  t("o motor distingue quem tem fúria", /const furioso = \(nome\) => provocado \|\| \(comFuria \|\| \[\]\)\.includes\(nome\)/.test(comb));
  t("e ninguém ficou com o `provocado` cru", !/vantagem: provocado/.test(comb));

  /* TIPOS_DE_ALVO era uma tabela escrita e nunca lida — e com ela o
     `comoDoi`, que diz QUE ESPÉCIE DE FERIDA o alvo é. O envelope do
     vilão mandava um nome cru: "ele pôs a mão em Marta" e "ele pôs a mão
     em Vale Torto" chegavam à IA com o mesmo peso. */
  const vil = fonte["vilao.js"];
  t("escolherAlvo lê a tabela", /const t = tipoDoAlvo\(custa\)/.test(vil));
  t("e não repete a ordem à mão", !/custa === "gente" \? \["pessoas"/.test(vil));
  t("o alvo volta com o tipo de ferida", /comoDoi: t2 \? t2\.comoDoi : ""/.test(vil));
  t("e o envelope o usa", /r\.alvo\.comoDoi \? r\.alvo\.comoDoi \+ ": " : ""/.test(vil));
}

sec("4. E O COMPORTAMENTO NÃO MUDOU");
{
  const { escolherAlvo, TIPOS_DE_ALVO, tipoDoAlvo } = await import("../src/vilao.js");
  const ctx = { pessoas: ["Marta"], lugares: ["Vale Torto"], promessas: ["a dívida do moleiro"] };
  t("gente escolhe gente", escolherAlvo("gente", ctx, () => 0).campo === "pessoas");
  t("lugar escolhe lugar", escolherAlvo("lugar", ctx, () => 0).campo === "lugares");
  t("voz escolhe promessa", escolherAlvo("voz", ctx, () => 0).campo === "promessas");
  /* a ordem de recuo é a mesma de antes, e é por isso que cada linha da
     tabela carrega a SUA ordem em vez de o código derivá-la: "gente" caía
     em promessas antes de lugares, e derivar teria trocado isso em
     silêncio */
  t("gente sem gente cai em promessa", escolherAlvo("gente", { lugares: ["X"], promessas: ["Y"] }, () => 0).campo === "promessas");
  t("e o tipo de ferida vem junto", escolherAlvo("gente", ctx, () => 0).comoDoi === "alguém que você conhece");
  t("sem nada, sem alvo", escolherAlvo("gente", {}, () => 0) === null);
  t("tipoDoAlvo acha e não inventa", !!tipoDoAlvo("voz") && tipoDoAlvo("nada") === null);
  t("toda linha da tabela diz como dói", TIPOS_DE_ALVO.every((x) => x.comoDoi && x.ordem.length === 3));
}

console.log(`\nligação v9.85: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
