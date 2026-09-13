/* O DUELO (v9.219) — jogador contra jogador, o determinismo por juiz

   As leis desta suíte: o código de ficha faz ida e volta e o selo pega
   adulteração FALANDO; duas máquinas com a mesma dupla e semente chegam
   ao MESMO selo de resultado (é isso que dispensa juiz de servidor);
   justo é só entre prontos, o resto é amistoso declarado com os dois
   lados à vista; e o duelo NUNCA escreve em save (lei vi). */

const RAIZ = "../src/";
const D = await import(RAIZ + "duelo.js");
const P = await import(RAIZ + "prontos.js");
const { readFileSync } = await import("node:fs");
const semComentarios = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(readFileSync("../src/App.jsx", "utf8"));

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. o código de ficha e o selo");
{
  const f = P.montarPronto("chama");
  const cod = D.codigoDaFicha(f);
  t("a ficha vira código e volta inteira", (() => { const r = D.fichaDoCodigo(cod); return r.ok && r.ficha.nome === f.nome && r.ficha.vidaMax === f.vidaMax; })());
  t("adulterar o corpo quebra o selo, falando", (() => { const r = D.fichaDoCodigo(cod.slice(0, -6) + "XXXXXX"); return !r.ok && /selo/.test(r.motivo); })());
  t("prefixo estranho falha falando", !D.fichaDoCodigo("ZZZ9|abc|def").ok);
  t("lixo falha falando, nunca em silêncio", ["", null, "TVD1|só duas"].every((x) => D.fichaDoCodigo(x).ok === false && D.fichaDoCodigo(x).motivo));
  t("ficha sem corpo não vira código", D.codigoDaFicha(null) === null && D.codigoDaFicha({ nome: "x" }) === null);
}

sec("2. o determinismo dispensa juiz");
{
  const a = D.duelar(P.montarPronto("voz"), P.montarPronto("punho"), { semente: "juiz" });
  const b = D.duelar(P.montarPronto("voz"), P.montarPronto("punho"), { semente: "juiz" });
  t("duas execuções, o MESMO selo", D.versoesBatem(a.selo, b.selo));
  const c = D.duelar(P.montarPronto("voz"), P.montarPronto("punho"), { semente: "outra" });
  t("semente diferente, selo diferente (o selo diz algo)", a.selo !== c.selo);
  t("selo vazio nunca bate", !D.versoesBatem("", "") && !D.versoesBatem(null, null));
}

sec("3. a série narrada seca");
{
  const r = D.duelar(P.montarPronto("muralha"), P.montarPronto("sombra"), { semente: "seca" });
  t("o placar fala pela boca do vencedor (2×algo)", /^2×[01]$/.test(r.placar));
  t("o vencedor tem nome de gente", [P.montarPronto("muralha").nome, P.montarPronto("sombra").nome].includes(r.vencedorNome));
  t("cada queda tem terreno nomeado, rodadas e linhas", r.quedas.every((q) => q.nomeDoTerreno && q.rodadas >= 1 && q.linhas.length >= 2));
  t("a crônica fecha em uma linha", /venceu/.test(r.cronica) && /queda/.test(r.cronica));
}

sec("4. justo é do roster; o resto é amistoso declarado");
{
  const a = P.montarPronto("voto"), b = P.montarPronto("flecha");
  t("dois do roster = justo", D.tipoDoDuelo(a, b) === "justo");
  const campanha = { ...a }; delete campanha.pronto;
  t("ficha de campanha = amistoso", D.tipoDoDuelo(campanha, b) === "amistoso" && D.tipoDoDuelo(a, campanha) === "amistoso");
  const aviso = D.resumoParaAviso(a);
  t("o aviso mostra o que o aceite precisa ver", aviso.nivel === P.NIVEL_DO_PRONTO && aviso.vida > 0 && aviso.defesa >= 10 && aviso.arma && aviso.doRoster === true);
}

sec("5. a casa serve rival — e nunca o espelho");
{
  t("o rival da casa nunca é o próprio duelista", ["muralha", "voz", "voto"].every((id) => D.rivalDaCasa(id, "s").id !== id));
  t("determinístico por semente", D.rivalDaCasa("voz", "s1").id === D.rivalDaCasa("voz", "s1").id);
  t("vem com ficha montada e pronto", (() => { const r = D.rivalDaCasa("chama", "z"); return r.ficha.nome && r.pronto.linha; })());
}

sec("6. o duelo não deixa cicatriz (lei vi)");
{
  const src = readFileSync("../src/duelo.js", "utf8");
  t("duelo.js não toca localStorage nem save", !/localStorage|chaveDoSave|salvar\(/.test(src));
  const f = P.montarPronto("remendo");
  const antes = JSON.stringify(f);
  D.duelar(f, P.montarPronto("punho"), { semente: "cicatriz" });
  t("a ficha sai como entrou", JSON.stringify(f) === antes);
}

sec("6b. D3 — as duas portas");
{
  /* o justo é BLINDADO: a marca do roster sozinha não basta — um pronto
     convertido para campanha cresce, e nível 7 com marca não é aferido */
  const a = P.montarPronto("voto"), b = P.montarPronto("flecha");
  const crescido = { ...a, nivel: 7 };
  t("pronto crescido em campanha NÃO é duelo justo", D.tipoDoDuelo(crescido, b) === "amistoso");
  /* a porta da campanha lê o save e devolve CÓPIA */
  const svFalso = JSON.stringify({ personagem: { nome: "Bruna", classe: "Ladino", vidaMax: 30, vida: 12, nivel: 5, atributos: { destreza: 2 } } });
  const h = D.heroiDoSave(svFalso);
  t("o herói sai do save inteiro", h && h.nome === "Bruna" && h.nivel === 5);
  t("é cópia: mexer nele não toca o original", (() => { const o = { personagem: { nome: "X", classe: "Mago", vidaMax: 10 } }; const c = D.heroiDoSave(o); c.nome = "Y"; return o.personagem.nome === "X"; })());
  t("save sem herói devolve null, falando com silêncio", D.heroiDoSave("{}") === null && D.heroiDoSave("lixo{") === null && D.heroiDoSave(null) === null);
}

sec("6c. D4 — as cartas do canal");
{
  const S = await import(RAIZ + "sala.js");
  t("sala.js e duelo.js falam a mesma língua", S.RECADOS.duelo === D.TIPO_DA_CARTA);
  t("a carta do carteiro passa no recadoValido da sala", S.recadoValido({ tipo: "duelo", de: "d1" }));
  const f = P.montarPronto("voz");
  const carta = D.cartaDaFicha({ de: "d1", ficha: f });
  t("a carta da ficha leva o código inteiro", carta && carta.sub === "ficha" && D.fichaDoCodigo(carta.codigo).ok);
  t("a carta do selo é pequena de propósito", (() => { const c = D.cartaDoSelo({ de: "d1", selo: "abcd1234" }); return c && JSON.stringify(c).length < 100; })());
  t("lerCarta aceita as duas e rejeita o resto", D.lerCarta(carta).de === "d1" && D.lerCarta({ tipo: "duelo", de: "x" }) === null && D.lerCarta({ tipo: "acao", de: "x" }) === null);
  t("carta sem remetente não nasce", D.cartaDaFicha({ ficha: f }) === null && D.cartaDoSelo({ de: "d1" }) === null);
  /* o lado A decide-se sem conversa: menor id — e as duas máquinas
     chegam à mesma ordem sozinhas */
  t("souLadoA é antissimétrico e determinístico", D.souLadoA("a1", "b2") === true && D.souLadoA("b2", "a1") === false);
  t("a semente da sala normaliza o código", D.sementeDaSala(" arena7 ") === D.sementeDaSala("ARENA7"));
}

sec("7. ligado ao jogo (D2 + D3 + D4)");
{
  t("o App importa o duelo", /from "\.\/duelo\.js"/.test(APP));
  t("o menu tem a porta Duelo", /irDuelo/.test(APP) && /Duelo<\/span>/.test(APP));
  t("a tela existe e mostra o aviso do amistoso", /function TelaDuelo/.test(APP) && /ninguém confere o peso das luvas/.test(APP));
  t("o código do meu lado se copia para mandar", /codigoDaFicha\(minha\)/.test(APP));
  t("o selo aparece na tela (o juiz é visível)", /selo da luta/.test(APP));
  t("o duelo justo é anunciado quando é justo", /DUELO JUSTO/.test(APP));
  /* D3: a porta da campanha é LEITURA do território da historia */
  t("a porta da campanha existe e lê o território certo", /heroiDoSave\(localStorage\.getItem\(espacoDoSave\("historia"\)\)\)/.test(APP));
  t("sem campanha, a porta diz por quê", /Nenhuma campanha nesta mesa/.test(APP));
  t("com campanha, a porta chama o herói pelo nome", /Meu herói da campanha — /.test(APP));
  /* D4: o duelo pelos trilhos, na tela */
  t("a terceira porta do outro lado é a sala ao vivo", /Pela sala, ao vivo/.test(APP));
  t("o canal do duelo é próprio e se fecha sozinho", /canalDueloRef/.test(APP) && /canalDueloRef\.current\.fechar\(\)/.test(APP));
  t("o lado A é o menor id — sem conversa", /souLadoA\(meuIdCanalRef\.current/.test(APP));
  t("a semente é o código da sala (determinismo de ponta a ponta)", /sementeDaSala\(codigoSala\)/.test(APP));
  t("os selos se conferem na tela, e a divergência encerra falando", /as duas máquinas contam a mesma luta/.test(APP) && /as versões da luta não batem/.test(APP));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
