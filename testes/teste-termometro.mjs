/* O TERMÔMETRO (v9.202) — ler o jogador, não só a posição

   O coração do AI Director desta casa. Ele muda o FÔLEGO da onda — nunca
   a ordem — conforme o jogador afoga ou passeia. A lei mais importante,
   e a que esta suíte guarda com mais zelo: ele lê FATOS, jamais vicia
   dados; a ordem dos movimentos do compasso é intocável. */

const RAIZ = "../src/";
const M = await import(RAIZ + "termometro.js");
const C = await import(RAIZ + "compasso.js");
const { readFileSync } = await import("node:fs");
const semComentarios = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(readFileSync("../src/App.jsx", "utf8"));

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. os 36 sinais, em oito eixos");
{
  t("são 36 sinais", M.SINAIS.length === 36, String(M.SINAIS.length));
  t("ids únicos", new Set(M.SINAIS.map((x) => x.id)).size === 36);
  t("oito eixos", M.EIXOS.length === 8);
  const cont = {};
  for (const x of M.SINAIS) cont[x.eixo] = (cont[x.eixo] || 0) + 1;
  t("a divisão do documento: fortuna 6, corpo 5, bolso 4, laço 6, rumo 5, mundo 5, glória 3, mesa 2",
    cont.fortuna === 6 && cont.corpo === 5 && cont.bolso === 4 && cont.laco === 6 && cont.rumo === 5 && cont.mundo === 5 && cont.gloria === 3 && cont.mesa === 2,
    JSON.stringify(cont));
  t("todo sinal tem quando(), polo e peso", M.SINAIS.every((x) => typeof x.quando === "function" && [-1, 0, 1].includes(x.polo) && x.peso >= 0));
  t("rumo e mesa não pesam no fôlego (polo 0) — servem ao Encalhe", M.sinaisDoEixo("rumo").concat(M.sinaisDoEixo("mesa")).every((x) => x.polo === 0));
  t("sinalPorId e sinaisDoEixo respondem", M.sinalPorId("pv_baixo") && M.sinaisDoEixo("corpo").length === 5);
}

sec("2. as cinco leituras, e o fôlego de cada");
{
  t("cinco leituras", M.LEITURAS.length === 5);
  t("as cinco certas", ["afogando", "sangrando", "firme", "folgado", "passeando"].every((id) => M.leituraPorId(id)));
  t("as faixas cobrem a reta sem buraco",
    M.LEITURAS.every((l, i) => i === 0 || l.de === M.LEITURAS[i - 1].ate));
  t("Afogando alonga o respiro", M.folegoDaLeitura("afogando").respiro >= 2);
  t("Passeando encurta a subida", M.folegoDaLeitura("passeando").subida < 0);
  t("Firme não mexe em nada", Object.values(M.folegoDaLeitura("firme")).every((v) => v === 0));
  t("o clímax NUNCA é encurtado (ele espera, não some)", M.LEITURAS.every((l) => (l.folego.climax || 0) >= 0));
}

sec("3. a leitura soma os fatos e cai na faixa certa");
{
  t("mesa vazia é Firme", M.lerTermometro({}).leitura === "firme");
  /* afogando: derrotas seguidas + PV no vermelho + companheiro morto */
  const afoga = M.lerTermometro({ derrotasSeguidas: 3, fracaoPV: 0.2, companheiroMortoRecente: true });
  t("maré contra + corpo no limite + luto = Afogando", afoga.leitura === "afogando", "escore " + afoga.escore);
  /* passeando: vitórias limpas + tesouro + fama subiu + título */
  const passeia = M.lerTermometro({ vitoriasSeguidas: 4, tesouroRecente: true, famaSubiuPatamar: true, tituloNovo: true, primeiraConquista: true });
  t("vencendo com sobra + glória = Passeando", passeia.leitura === "passeando", "escore " + passeia.escore);
  /* a leitura devolve a conta e a lista do que pesou */
  t("devolve escore e os sinais ativos", afoga.escore < 0 && afoga.ativos.length >= 3);
  t("resumoDoTermometro condensa para o autor", (() => { const r = M.resumoDoTermometro({ derrotasSeguidas: 3, fracaoPV: 0.2 }); return r.leitura && Number.isFinite(r.escore) && r.sinais >= 1; })());
  /* rumo sozinho NÃO tira do Firme — polo 0 */
  const soRumo = M.lerTermometro({ diasSemPrincipal: 9, missoesAbertas: 20, diasNaMesmaCidade: 9 });
  t("rumo sozinho não mexe no fôlego (fica Firme)", soRumo.leitura === "firme");
}

sec("4. A LEI: lê fatos, e a ORDEM da onda é intocável");
{
  /* o fôlego só mexe em QUANTOS turnos — nunca na sequência dos movimentos.
     Rodo uma onda inteira com o fôlego de Afogando e confiro que a ordem
     respiro→semente→subida→vespera→climax→preço se mantém. */
  const folego = M.folegoDaLeitura("afogando");
  let c = C.garantirCompasso(null);
  const ordem = [];
  const sorte = () => 0.5;
  const sit = { emCidade: true };
  for (let i = 0; i < 60; i++) {
    const r = C.avancarCompasso(c, sit, { sorte, folego, elenco: { aqui: ["Alguém"] } });
    c = r.compasso;
    if (r.virou && r.movimento) ordem.push(c.movimento);
  }
  const seq = [...new Set(ordem)];
  t("a onda anda com o fôlego sem travar", ordem.length > 0);
  /* a ordem canônica aparece como ciclo, não embaralhada */
  const MOV = C.MOVIMENTOS.map((m) => m.id);
  t("os movimentos são os canônicos, na ordem canônica", ordem.every((m, i) => i === 0 || proximoValido(MOV, ordem[i - 1], m)));
  function proximoValido(mov, de, para) {
    const i = mov.indexOf(de); return para === mov[(i + 1) % mov.length];
  }
  /* e o fôlego REALMENTE alonga: o respiro de Afogando dura mais que o de Firme */
  const durRespiro = (fol) => { let cc = C.garantirCompasso({ movimento: "preco", turnos: 99, alvo: 1 }); const r = C.avancarCompasso(cc, sit, { sorte: () => 0, folego: fol, elenco: { aqui: ["X"] } }); return r.compasso.alvo; };
  t("o respiro de Afogando dura mais que o de Firme", durRespiro(M.folegoDaLeitura("afogando")) > durRespiro(M.folegoDaLeitura("firme")));
}

sec("5. ligado ao jogo");
{
  t("o App importa o Termômetro", /import \{ lerTermometro, folegoDaLeitura \}/.test(APP));
  t("há um snapshot montado dos refs", /snapshotDoTermometro/.test(APP));
  t("o fôlego entra no avancarCompasso", /folego: folegoDaLeitura\(leitura\.leitura\)/.test(APP));
  t("o snapshot lê o corpo e o relógio", /fracaoPV/.test(APP) && /relogioMaisAlto/.test(APP));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
