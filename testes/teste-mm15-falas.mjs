/* teste-mm15-falas.mjs (Fase MM · MM15, o defeito nº 1 da segunda sessão) —
   as falas de personagem pagas e deitadas fora

   A segunda sessão de prova (`mente/mm11-sessao-2.md`) gravou 37 chamadas
   para 10 respostas do Mestre — 3,6 por resposta, contra ~2,0 na primeira —
   e quatro delas eram o ATOR ("O herói acabou de dizer: … Responda como
   Otávio do Sal", duas vezes; "Responda como Túlio", duas, e Túlio estava
   em casa). Nenhuma das quatro respostas aparece em pauta nenhuma.

   A CAUSA, que esta suíte prova sem uma chamada paga: o App lia a resposta
   do ator com `extrairJSON`, o parser do Narrador, que só devolve
   narrativa/perigo/rolagem/mudancas/sugestoes. O campo `fala` morria em
   TODA resposta, desde a v9.135 — nenhuma fala chegou nunca ao Narrador.

   O CONSERTO tem duas metades:
     · `falaDaResposta` — a boca ganha o seu próprio leitor (o bug, com
       prova de que falha pelo caminho velho e passa pelo novo);
     · `BOCAS_POR_TURNO` = 0 e `bocasDoTurno` — no único fluxo que as pede
       o Narrador fala logo a seguir e já dá voz à gente; uma chamada paga
       que não chega ao jogador não se faz. Voltar a pedir é mudar um número.

   Secções: 1. a causa · 2. o leitor da boca · 3. a tabela · 4. os casos da
   sessão · 5. o "aqui" não teria salvo Túlio · 6. lixo, null e
   imutabilidade · 7. o número, antes e depois · 8. a fiação no App.jsx.
   Tudo por semente. */
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { extrairJSON } from "../src/json.js";
import {
  falaDaResposta, bocasDoTurno, BOCAS_POR_TURNO, MAX_BOCAS, TETO_DA_FALA,
  garantirFala, dossieDe, pedidoDoAtor, envelopeDasFalas,
} from "../src/falas.js";
import { paraPauta as interpreteParaPauta } from "../src/interprete.js";
import { TETO_DIARIO } from "../api/_portao.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

/* um gerador semeado (mulberry32), para o Intérprete sortear sempre igual */
const semeado = (s) => () => {
  s |= 0; s = (s + 0x6D2B79F5) | 0;
  let r = Math.imul(s ^ (s >>> 15), 1 | s);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
};

/* A gente da sessão, como `pessoasDaCena` a entregaria ao Intérprete. */
const OTAVIO = { nome: "Otávio do Sal", papel: "aprendiz", temperamento: "desconfiado, de poucas palavras", quer: "notícia de Túlio da Runa", relacao: "neutro" };
const TULIO = { nome: "Túlio", papel: "músico", temperamento: "falante", quer: "", relacao: "neutro" };
const NERO = { nome: "Nero do Couro", papel: "ferreiro", temperamento: "rude", quer: "", relacao: "desconhecido" };
const mov = (p, faz = "responde com outra pergunta") => ({ pessoa: p, nome: p.nome, faz, gesto: "esquiva", proibidos: [] });

/* ============================================================ */
sec("1. a causa: o parser do Narrador apaga o campo da boca");
{
  const respostas = [
    '{"fala":"O do balde é Otávio do Sal."}',
    '```json\n{"fala": "Três palavras: não te conheço."}\n```',
    '{"fala":"Aqui não."',
  ];
  for (const r of respostas) {
    const j = extrairJSON(r);
    /* o caminho de 27/08 a 30/09: extrairJSON → j.fala → garantirFala */
    t(`caminho velho perde "${r.slice(0, 28).replace(/\n/g, " ")}…"`, garantirFala(j && j.fala) === "", JSON.stringify(Object.keys(j || {})));
    t(`caminho novo guarda a mesma resposta`, falaDaResposta(r).length > 2);
  }
  /* e é por isso que o envelope da pauta nunca teve conteúdo: o App só o
     enche com o que o leitor devolveu */
  const velho = respostas.map((r) => ({ nome: "Otávio do Sal", fala: garantirFala((extrairJSON(r) || {}).fala) }));
  t("pelo caminho velho, a seção A FALA sai sempre vazia", envelopeDasFalas(velho) === "");
  const novo = respostas.map((r) => ({ nome: "Otávio do Sal", fala: falaDaResposta(r) }));
  t("pelo novo, as palavras chegam ao envelope", envelopeDasFalas(novo).includes('Otávio do Sal disse: "O do balde é Otávio do Sal."'));
}

/* ============================================================ */
sec("2. o leitor da boca");
{
  t("JSON limpo", falaDaResposta('{"fala":"Aqui não."}') === "Aqui não.");
  t("JSON cercado de crases de código", falaDaResposta('```json\n{"fala":"Eu vi."}\n```') === "Eu vi.");
  t("JSON com prosa à volta", falaDaResposta('Claro! {"fala":"Paga adiantado."} Espero ter ajudado.') === "Paga adiantado.");
  t("aspas escapadas voltam a ser aspas", falaDaResposta('{"fala":"Ele disse \\"nunca\\" e foi-se."}') === 'Ele disse "nunca" e foi-se.');
  t("quebra de linha vira espaço", falaDaResposta('{"fala":"Não sei\\nde nada."}') === "Não sei de nada.");
  const cortada = falaDaResposta('{"fala":"O Fundo do Poço? Ninguém desce lá desde');
  t("JSON truncado: a fala resgatada, com o corte à vista", cortada.startsWith("O Fundo do Poço? Ninguém desce lá desde") && cortada.endsWith("…"), cortada);
  t("JSON com vírgula a mais ainda é resgatado", falaDaResposta('{"fala":"Vai-te.",}') === "Vai-te.");
  t("fala longa é cortada no teto", falaDaResposta(JSON.stringify({ fala: "a".repeat(900) })).length <= TETO_DA_FALA);
  t("truncada E longa não passa do teto", falaDaResposta('{"fala":"' + "b".repeat(900)).length <= TETO_DA_FALA);
  t("sem o campo, pessoa calada", falaDaResposta('{"narrativa":"Otávio sorri."}') === "");
  t("prosa solta não vira fala (é o parágrafo que o ator não devia escrever)", falaDaResposta("Otávio olha-te e diz que não sabe.") === "");
  t("campo que não é texto, pessoa calada", falaDaResposta('{"fala":42}') === "" && falaDaResposta('{"fala":null}') === "");
  t("fala vazia, pessoa calada", falaDaResposta('{"fala":"   "}') === "" && falaDaResposta('{"fala":"\\""}') === "");
}

/* ============================================================ */
sec("3. a tabela: quantas bocas se pagam");
{
  t("BOCAS_POR_TURNO é número inteiro", Number.isInteger(BOCAS_POR_TURNO));
  /* o número de hoje, com o motivo no cabeçalho de falas.js: no único
     fluxo que pede bocas, o Narrador fala a seguir e já dá voz à gente */
  t("e hoje é zero", BOCAS_POR_TURNO === 0);
  t("nunca passa do teto de ritmo (MAX_BOCAS)", BOCAS_POR_TURNO <= MAX_BOCAS && MAX_BOCAS === 2);
}

/* ============================================================ */
sec("4. os casos da sessão");
{
  /* T4, na forja: Otávio DE FACTO na cena, a heroína fala com ele, e o
     Narrador responde no mesmo turno — é ele quem dá a voz. */
  const t4 = "Tiro o capuz e sento-me num caixote, sem pressa. \"Por ti. Um velho companheiro de armas mandou-me atrás de ti antes de morrer.\"";
  t("Otávio presente, com o Narrador no turno: nenhuma chamada", bocasDoTurno([mov(OTAVIO)], { conteudo: t4 }).length === 0);
  /* T7, no Tendal: Otávio ficou na forja, Túlio está em casa, Nero no cais
     — os três no "aqui", e dois pagos (Otávio e Túlio) */
  const t7 = "Despeço-me do Otávio com um aceno e desço ao Tendal de Couro. Na primeira banca pergunto: \"Que armas se vendem por aqui, e a quanto?\"";
  const noTendal = [mov(OTAVIO, "responde em três palavras"), mov(TULIO), mov(NERO)];
  t("Túlio ausente (e Otávio, e Nero): nenhuma chamada", bocasDoTurno(noTendal, { conteudo: t7 }).length === 0);
  /* T9, na taverna: "Quem é aquele do balde?" — a fala paga que respondia
     ("O do balde é Otávio do Sal") nunca chegou; a resposta que a jogadora
     leu foi a da PERGUNTOU, pela boca do Narrador */
  const t9 = "Pouso seis moedas no balcão pelo quarto comum e baixo a voz: \"Quem é aquele que passou agora com o balde?\"";
  t("T9, na taverna: nenhuma chamada", bocasDoTurno([mov(OTAVIO), mov(TULIO)], { conteudo: t9 }).length === 0);

  /* o que o App pedia antes (mov.slice(0, MAX_BOCAS)) é o mesmo que a
     função dá com a tabela no teto — a reconstrução do "antes" do §7 */
  const antes = bocasDoTurno(noTendal, { conteudo: t7, bocas: MAX_BOCAS });
  t("no teto, as mesmas duas bocas que a sessão pagou (Otávio e Túlio)", antes.map((m) => m.nome).join("|") === "Otávio do Sal|Túlio");
  const d = dossieDe(antes[0].pessoa, { faz: antes[0].faz, acao: t7, lugar: "O Tendal de Couro" });
  t("e o pedido é o que a sessão gravou", /^O herói acabou de dizer: "Despeço-me do Otávio[\s\S]*"\n\nResponda como Otávio do Sal\.$/.test(pedidoDoAtor(d)));
  t("uma boca, se a tabela disser uma", bocasDoTurno(noTendal, { conteudo: t7, bocas: 1 }).length === 1);
  t("a ordem é a do Intérprete (o laço mais forte primeiro)", bocasDoTurno(noTendal, { conteudo: t7, bocas: 1 })[0].nome === "Otávio do Sal");

  /* o que continua sem boca em qualquer número: o turno do sistema */
  t("envelope do sistema nunca pede boca", bocasDoTurno(noTendal, { conteudo: "[ROLAGEM] 14 contra 12", bocas: MAX_BOCAS }).length === 0);
  t("nem com espaço antes do colchete", bocasDoTurno(noTendal, { conteudo: "   [RAID] a frente avança", bocas: MAX_BOCAS }).length === 0);
  t("nem sem gente na cena", bocasDoTurno([], { conteudo: t7, bocas: MAX_BOCAS }).length === 0);
}

/* ============================================================ */
sec("5. filtrar pelo \"aqui\" não teria salvo Túlio");
{
  /* A segunda via do pedido ("só a quem está de facto na cena") foi medida
     e não serve: as bocas saem de pessoasDaCena(), que É o "aqui" do
     elencoDaCena. Filtrar os movimentos por ele devolve a mesma lista — em
     qualquer sorte. Túlio recebeu fala porque estava no "aqui" (os
     defeitos 4 e 5 da sessão), e é lá que se conserta. */
  let sempreDentro = true, tulioComBoca = 0;
  for (let s = 1; s <= 200; s++) {
    const aqui = [OTAVIO, TULIO, NERO];
    const r = interpreteParaPauta(aqui, { sorte: semeado(s) });
    const nomes = new Set(aqui.map((p) => p.nome));
    if (!r.movimentos.every((m) => nomes.has(m.nome))) sempreDentro = false;
    if (bocasDoTurno(r.movimentos.filter((m) => nomes.has(m.nome)), { conteudo: "olá", bocas: MAX_BOCAS }).some((m) => m.nome === "Túlio")) tulioComBoca++;
  }
  t("todo movimento do Intérprete já está no \"aqui\" (200 sementes)", sempreDentro);
  t(`com o filtro pelo "aqui" e as bocas ligadas, Túlio ainda fala (${tulioComBoca}/200)`, tulioComBoca > 0);
  let desligadas = 0;
  for (let s = 1; s <= 200; s++) {
    const r = interpreteParaPauta([OTAVIO, TULIO, NERO], { sorte: semeado(s) });
    desligadas += bocasDoTurno(r.movimentos, { conteudo: "olá" }).length;
  }
  t("com a tabela de hoje, zero chamadas em 200 sementes", desligadas === 0);
}

/* ============================================================ */
sec("6. lixo, null e imutabilidade");
{
  t("movimentos null", bocasDoTurno(null, { bocas: 2 }).length === 0);
  t("movimentos que não são lista", bocasDoTurno({ nome: "x" }, { bocas: 2 }).length === 0 && bocasDoTurno("Otávio", { bocas: 2 }).length === 0);
  t("opções null (o `= {}` não cobre null)", Array.isArray(bocasDoTurno([mov(OTAVIO)], null)) && bocasDoTurno([mov(OTAVIO)], null).length === 0);
  t("sem opções", bocasDoTurno([mov(OTAVIO)]).length === 0);
  t("conteúdo null com bocas ligadas ainda é frase", bocasDoTurno([mov(OTAVIO)], { conteudo: null, bocas: 1 }).length === 1);
  t("bocas lixo vira zero", bocasDoTurno([mov(OTAVIO)], { bocas: "muitas" }).length === 0 && bocasDoTurno([mov(OTAVIO)], { bocas: NaN }).length === 0);
  t("bocas negativas viram zero", bocasDoTurno([mov(OTAVIO)], { bocas: -3 }).length === 0);
  t("bocas acima do teto param no teto", bocasDoTurno([mov(OTAVIO), mov(TULIO), mov(NERO)], { bocas: 9 }).length === MAX_BOCAS);
  t("bocas fracionárias arredondam para baixo", bocasDoTurno([mov(OTAVIO), mov(TULIO)], { bocas: 1.9 }).length === 1);
  t("entradas lixo na lista caem", bocasDoTurno([null, {}, { nome: "Sem Pessoa" }, mov(TULIO)], { bocas: 2 }).map((m) => m.nome).join() === "Túlio");
  const lista = [mov(OTAVIO), mov(TULIO), mov(NERO)];
  const copia = JSON.stringify(lista);
  const r = bocasDoTurno(lista, { conteudo: "olá", bocas: 2 });
  t("a lista recebida não é mutada", JSON.stringify(lista) === copia && lista.length === 3);
  t("e a devolvida é outra", r !== lista);
  t("determinística: mesma entrada, mesma saída", JSON.stringify(bocasDoTurno(lista, { bocas: 2 })) === JSON.stringify(bocasDoTurno(lista, { bocas: 2 })));
  t("leitor: null, undefined, número, objeto", falaDaResposta(null) === "" && falaDaResposta(undefined) === "" && falaDaResposta(7) === "" && falaDaResposta({}) === "");
}

/* ============================================================ */
sec("7. o número: chamadas pagas por resposta, antes e depois");
{
  /* O ORÇAMENTO DE UM TURNO em que eu escrevo (enviar → chamarMestre →
     passarPeloPortao → cronistaDoTurno), chamada a chamada, com a condição
     de cada uma. Leituras do App.jsx de 30/09 (v9.341). */
  const ORCAMENTO = [
    { quem: "a boca (ator)", antes: [0, MAX_BOCAS], depois: [0, BOCAS_POR_TURNO], quando: "frase do jogador e gente com movimento; antes do Narrador, à espera dela" },
    { quem: "o Narrador", antes: [1, 1], depois: [1, 1], quando: "sempre" },
    { quem: "a rede de segurança", antes: [0, 1], depois: [0, 1], quando: "narrativa veio vazia" },
    { quem: "o portão (conserto)", antes: [0, 1], depois: [0, 1], quando: "a narrativa violou o sistema" },
    { quem: "o Cronista", antes: [1, 1], depois: [1, 1], quando: "narrativa com 60+ caracteres (todas, na prática)" },
  ];
  const soma = (k, i) => ORCAMENTO.reduce((a, x) => a + x[k][i], 0);
  console.log(`      por turno: antes ${soma("antes", 0)}–${soma("antes", 1)}, depois ${soma("depois", 0)}–${soma("depois", 1)}`);
  t("o pior turno perde as duas bocas (6 → 4)", soma("antes", 1) === 6 && soma("depois", 1) === 4);
  t("o turno típico com gente perde as duas (4 → 2)", soma("antes", 0) + MAX_BOCAS === 4 && soma("depois", 0) + BOCAS_POR_TURNO === 2);

  /* A SEGUNDA SESSÃO, reconstruída pelo que o gancho em fetch gravou: 37
     chamadas = 1 Léxico (uma vez por campanha) + 11 ao Narrador + 4 bocas
     + 21 leves; 10 respostas. As quatro bocas saíram em dois turnos com
     Otávio e Túlio no "aqui" (o T7 no Tendal, e o da pergunta do balde). */
  const S2 = { respostas: 10, lexico: 1, narrador: 11, leves: 21 };
  const turnosComBoca = [
    { conteudo: "Despeço-me do Otávio com um aceno e desço ao Tendal de Couro.", mov: [mov(OTAVIO), mov(TULIO), mov(NERO)] },
    { conteudo: "Pouso seis moedas no balcão e baixo a voz: \"Quem é aquele que passou agora com o balde?\"", mov: [mov(OTAVIO), mov(TULIO)] },
  ];
  const bocas = (n) => turnosComBoca.reduce((a, x) => a + bocasDoTurno(x.mov, { conteudo: x.conteudo, bocas: n }).length, 0);
  const bocasAntes = bocas(MAX_BOCAS), bocasDepois = bocas(BOCAS_POR_TURNO);
  t("a reconstrução dá as quatro bocas que a sessão pagou", bocasAntes === 4);
  const antes = (S2.narrador + S2.leves + bocasAntes) / S2.respostas;
  const depois = (S2.narrador + S2.leves + bocasDepois) / S2.respostas;
  const turnosAntes = Math.floor(TETO_DIARIO / antes), turnosDepois = Math.floor(TETO_DIARIO / depois);
  console.log(`      sessão 2: ${antes.toFixed(1)} → ${depois.toFixed(1)} chamadas por resposta; com o teto de ${TETO_DIARIO}: ${turnosAntes} → ${turnosDepois} turnos por dia`);
  t("3,6 chamadas por resposta antes (o número da sessão)", Math.abs(antes - 3.6) < 1e-9);
  t("3,2 depois", Math.abs(depois - 3.2) < 1e-9);
  t(`e o dia de jogo cresce (${turnosAntes} → ${turnosDepois} turnos)`, turnosAntes === 138 && turnosDepois === 156);

  /* A PRIMEIRA SESSÃO, como amostra: 99 chamadas = 50 ao Narrador (a
     primeira é o Léxico) + 49 leves, 49 respostas — um Cronista por
     resposta e nenhuma boca. O conserto não lhe tira nada, e é essa a
     prova de que ele não custa regressão: o jogo que a sessão 1 jogou é
     o jogo que fica. */
  const S1 = { respostas: 49, narrador: 49, leves: 49 };
  t("sessão 1: ~2,0 por resposta, antes e depois", (S1.narrador + S1.leves) / S1.respostas === 2);
}

/* ============================================================ */
sec("8. a fiação no App.jsx (MM15, 2)");
{
  /* por texto, fim de linha normalizado — o mesmo padrão do §6 de
     teste-falas.mjs, para sobreviver a CRLF/LF sem falso negativo */
  const caminho = fileURLToPath(new URL("../src/App.jsx", import.meta.url));
  const APP = fs.readFileSync(caminho, "utf8").replace(/\r\n/g, "\n");

  t("o App importa bocasDoTurno e falaDaResposta de falas.js",
    /import \{[^}]*bocasDoTurno[^}]*falaDaResposta[^}]*\} from "\.\/falas\.js";|import \{[^}]*falaDaResposta[^}]*bocasDoTurno[^}]*\} from "\.\/falas\.js";/.test(APP));
  t("colherAsFalas lê a resposta pelo leitor próprio da boca",
    /const fala = falaDaResposta\(bruto\);/.test(APP));

  /* a prova negativa: dentro de colherAsFalas, nenhum extrairJSON(bruto) —
     isolamos o corpo da função pelo mesmo nome que a fecha (enviar, a
     seguir) para não pegar os outros usos legítimos de extrairJSON no
     resto do arquivo (linhas ~357 e ~364, do Narrador) */
  const ini = APP.indexOf("const colherAsFalas = async (conteudo) => {");
  const fim = APP.indexOf("const enviar = useCallback(async (conteudo, persAtual, histBase) => {", ini);
  t("colherAsFalas e enviar estão os dois no arquivo, na ordem esperada", ini !== -1 && fim !== -1 && fim > ini);
  const corpo = APP.slice(ini, fim);
  t("e dentro dela não sobra extrairJSON(bruto) — é o leitor próprio quem lê", !/extrairJSON\(bruto\)/.test(corpo));

  /* A PROVA SEM CHAMADA PAGA, por composição — tudo em Node, zero fetch:
     1) o texto do App mostra que a ÚNICA chamada paga de colherAsFalas
        (chamarModelo, dentro do Promise.all) só corre uma vez por membro
        de `escolhidos`, e `escolhidos` vem de bocasDoTurno;
     2) a tabela §3/§5 já provou, em 200 sementes com Otávio+Túlio+Nero na
        cena, que bocasDoTurno devolve sempre [] com BOCAS_POR_TURNO=0;
     logo um Array.prototype.map sobre uma lista vazia executa o callback
     zero vezes — não é suposição, é a semântica de `.map`. Nenhuma chamada
     à boca chega a sair em turno nenhum, sem precisar montar o React nem
     tocar em rede. O Narrador (fora de colherAsFalas, em `enviar`) segue
     sendo chamado sempre — comportamento intocado por esta etapa, e já
     coberto pelo §6 de teste-falas.mjs ("o Intérprete é lido UMA vez por
     turno") e pelo ORCAMENTO do §7 acima. */
  t("colherAsFalas chama chamarModelo só dentro do map de `escolhidos`",
    /escolhidos\.map\(async \(m\) => \{[\s\S]*?chamarModelo\(/.test(corpo));
  /* bocasDoTurno é pura e determinística (sem sorte própria — o §3/§5
     acima já variam a semente do Intérprete, que decide QUEM entra em
     `movimentos`; aqui basta uma cena fixa com os três, porque o número
     de bocas não depende de sorte nenhuma, só da tabela) */
  const cenaComGente = [mov(OTAVIO), mov(TULIO), mov(NERO)];
  const escolhidosAgora = bocasDoTurno(cenaComGente, { conteudo: "Puxo conversa com todos." });
  t("com gente na cena, agora: zero bocas escolhidas, logo zero chamadas antes do Narrador",
    escolhidosAgora.length === 0);
}

console.log(`\nmm15 falas: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
