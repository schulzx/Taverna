import {
  ehSempreVisivel, contarBloco, linhaDeSaldo, dividirBloco, agruparMensagens, MINIMO_PARA_DOBRAR,
} from "../src/resumo.js";

let ok = 0, mau = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mau++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

/* Linhas copiadas do formato REAL que o App escreve — é isso que este
   arquivo precisa reconhecer, não um formato inventado para o teste. */
const RODADA = [
  "🎲 Vera → Minotauro 1: d20 14+9=23 vs 16 · acerta, 22 de dano",
  "⚔ Vera → Minotauro 1: 22 de dano · Minotauro 1 58/80",
  "🎲 Vera → Minotauro 2: d20 3+9=12 vs 16 · erra",
  "⚔ Vera → Minotauro 2: errou",
  "👣 Minotauro 3: no fundo da sala → no vão da porta",
  "🛡 Minotauro 1 · Chifrada → Vera: 14 de dano",
  "🛡 Minotauro 3 · Coice → Brisa: errou",
  "✦ Brisa · Flecha Certeira → Minotauro 2: 18 de dano",
  "🩶 Tor · Bênção Menor → Brisa: +9 PV (32/60)",
];

sec("1. o que nunca se dobra");
t("fogo amigo fica", ehSempreVisivel("💢 FOGO AMIGO — Brisa apanha 39 de dano (metade)"));
t("dádiva fica", ehSempreVisivel("🌠 DÁDIVA ÉPICA: Dádiva do Destino — ..."));
t("recusa fica", ehSempreVisivel("⛔ Fúria do Domínio custa 20 PF — você tem 12."));
t("presença divina fica", ehSempreVisivel("🌑 A presença de Ashar pesa como chumbo"));
t("modo criativo fica", ehSempreVisivel("⚡ Combate aberto: Minotauro 1, Minotauro 2"));
t("o golpe que MATA fica, mesmo sendo ⚔", ehSempreVisivel("⚔ Vera → Ogro: 31 de dano · Ogro 0/28 ☠"));
t("um golpe comum não é sempre-visível", !ehSempreVisivel("⚔ Vera → Ogro: 12 de dano · Ogro 16/28"));
t("uma rolagem não é sempre-visível", !ehSempreVisivel("🎲 Vera → Ogro: d20 11+5=16 vs 14 · acerta"));
t("linha vazia não quebra", !ehSempreVisivel("") && !ehSempreVisivel(null));

sec("2. a conta da rodada");
{
  const c = contarBloco(RODADA);
  t("soma o dano causado (22 + 18)", c.dado === 40);
  t("soma o dano sofrido (14)", c.sofrido === 14);
  t("soma a cura (+9)", c.curado === 9);
  t("conta as rolagens", c.rolagens === 2);
  t("conta os erros", c.erros === 2);
  t("conta os golpes", c.golpes === 5);
  t("ninguém caiu", c.caidos === 0);
}
{
  const c = contarBloco(["⚔ Vera → Ogro: 31 de dano · Ogro 0/28 ☠", "⚔ Vera → Lobo: 9 de dano · Lobo 0/9 ☠"]);
  t("conta quem caiu", c.caidos === 2);
}

sec("3. a linha de saldo");
{
  const s = linhaDeSaldo(contarBloco(RODADA));
  t("diz quanto saiu", /40 de dano causado/.test(s));
  t("diz quanto entrou", /14 sofrido/.test(s));
  t("diz a cura", /\+9 PV/.test(s));
  t("não inventa zeros", !/\b0\b/.test(s));
  t("um turno sem cura não fala em cura", !/PV/.test(linhaDeSaldo(contarBloco(["⚔ a → b: 5 de dano", "⚔ a → c: 5 de dano", "🎲 x", "🎲 y"]))));
  t("bloco sem números devolve vazio", linhaDeSaldo(contarBloco(["🗺 Terreno: a | b | c"])) === "");
}

sec("4. a divisão");
{
  const d = dividirBloco(RODADA);
  t("tudo isso é dobrável", d.dobradas.length === RODADA.length);
  t("nada sobra visível", d.visiveis.length === 0);
  t("tem saldo", d.saldo.startsWith("⚔"));
}
{
  const misto = [...RODADA, "💢 FOGO AMIGO — Brisa apanha 19 de dano (metade)", "⚔ Vera → Minotauro 2: 20 de dano · Minotauro 2 0/80 ☠"];
  const d = dividirBloco(misto);
  t("o fogo amigo continua na tela", d.visiveis.some((x) => x.startsWith("💢")));
  t("a morte continua na tela", d.visiveis.some((x) => x.includes("☠")));
  t("só duas linhas ficaram visíveis", d.visiveis.length === 2);
  t("o resto dobrou", d.dobradas.length === RODADA.length);
}
{
  /* pouca coisa não vale a dobra */
  const poucas = ["🎲 a", "⚔ b"];
  const d = dividirBloco(poucas);
  t("abaixo do mínimo, nada dobra", d.dobradas.length === 0 && d.visiveis.length === 2);
  t("e não há saldo para mostrar", d.saldo === "");
  t("o mínimo é 4", MINIMO_PARA_DOBRAR === 4);
}
{
  const soImportantes = ["🌠 DÁDIVA ÉPICA: x", "⛔ y", "✧ z", "💢 w", "★ v"];
  const d = dividirBloco(soImportantes);
  t("bloco só de importantes não dobra nada", d.dobradas.length === 0);
  t("e mantém todas na ordem", d.visiveis.join("|") === soImportantes.join("|"));
}

sec("5. agrupar a conversa inteira");
{
  const msgs = [
    { autor: "jogador", texto: "ataco o minotauro" },
    ...RODADA.map((texto) => ({ autor: "sistema", texto })),
    { autor: "mestre", texto: "O chifre passa a um palmo do seu rosto." },
    { autor: "sistema", texto: "🌠 DÁDIVA ÉPICA: Dádiva do Destino" },
    { autor: "jogador", texto: "recuo" },
  ];
  const g = agruparMensagens(msgs);
  t("quatro itens: jogador, bloco, mestre, bloco, jogador", g.length === 5);
  t("o primeiro é a fala do jogador", g[0].tipo === "msg" && g[0].m.autor === "jogador");
  t("o segundo é o bloco da rodada", g[1].tipo === "bloco" && g[1].dobradas.length === RODADA.length);
  t("o terceiro é a narração", g[2].tipo === "msg" && g[2].m.autor === "mestre");
  t("o quarto é um bloco de uma linha só, sem dobra", g[3].tipo === "bloco" && g[3].dobradas.length === 0 && g[3].visiveis.length === 1);
  t("o índice original da mensagem é preservado", g[2].i === 10);
  t("nenhuma mensagem se perdeu", g.reduce((s, x) => s + (x.tipo === "bloco" ? x.textos.length : 1), 0) === msgs.length);
}
{
  t("lista vazia devolve vazio", agruparMensagens([]).length === 0);
  t("null não derruba", agruparMensagens(null).length === 0);
  const g = agruparMensagens([{ autor: "sistema", texto: undefined }]);
  t("texto ausente vira string", g[0].tipo === "bloco" && g[0].visiveis[0] === "");
}

sec("6. a ordem dentro do bloco é preservada");
{
  const d = dividirBloco(RODADA);
  t("as dobradas mantêm a ordem original", d.dobradas.join("|") === RODADA.join("|"));
}

console.log(`\n${ok} ok, ${mau} falhas`);
process.exit(mau ? 1 : 0);
