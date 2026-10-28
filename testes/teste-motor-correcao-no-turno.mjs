/* teste-motor-correcao-no-turno.mjs (Fase T, trilha A · 28/10/2026) — o Juiz que corrige, na ordem do turno

   A trilha B deixou o Juiz a CORRIGIR em src/motor/correcao-do-juiz.js, e
   a suíte dela (teste-correcao-do-juiz.mjs) prova cada peça e a medida. A
   fiação no App (trilha A) liga-as em três sítios do turno:

     1. onde o App julga a resposta: o veredito fica num ref (com a entrada
        que o julgou) e anda o livro de vetos — `andarOsVetos(livro,
        vetosDoVeredito(veredito, { turno, cidade }), { turno, cidade })`,
        com o turno do Juiz (o registo + 1) e a cidade da FOTO;
     2. ao montar a pauta do turno seguinte: `porNaPauta(p, "vetoDoJuiz",
        ...vetosParaAPauta(livro, { turno, cidade, frase }))`, antes do
        `cederNaCena` e do `textoDaPauta`;
     3. no Cronista do MESMO turno, entre `julgarOCronista` e
        `oAceitoDoCronista`: `canoneSemInvencao(aceito, veredito, { entrada,
        estado })`.

   Esta suíte JOGA essa ordem com as peças de verdade (a entrada do Juiz
   refeita pela semente, o juízo do Cronista, a pauta com o teto e o ceder,
   o aceito aplicado pelo arnês do Cronista) e prova o que muda para quem
   joga: o número inventado não volta como verdade na resposta seguinte, e
   o nome inventado não entra nas "verdades imutáveis". Nenhuma asserção lê
   o texto de src/motor/ (a catraca de teste-assercoes-de-texto). E morde:
   cada erro de fiação possível (o turno sem o +1, a cidade de depois da
   viagem, o veredito da véspera, a correção esquecida) muda o resultado. */
import { entradaDoJuiz, julgarOTurno } from "../src/motor/juiz-do-turno.js";
import { vetosDoVeredito, andarOsVetos, vetosParaAPauta, canoneSemInvencao } from "../src/motor/correcao-do-juiz.js";
import { julgarOCronista } from "../src/motor/cronista.js";
import { porNaPauta, cederNaCena, textoDaPauta } from "../src/pauta.js";
import { jogarOAceito } from "./cronista-bloco.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { const v = typeof cond === "function" ? (() => { try { return !!cond(); } catch { return false; } })() : !!cond; if (v) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const Js = JSON.stringify;

/* a foto que o App tira ANTES de aplicar a resposta (fotoDoJuiz) */
const FOTO = {
  personagem: { nome: "Vera", moedas: 37, grupo: [{ nome: "Sari" }] },
  npcs: { Tomas: { nome: "Tomas" } },
  mapa: { cidades: [{ nome: "Buraco Norte", regiao: "Chãs Quebradas", continente: "Terras do Eco" }, { nome: "Vau Fincado" }], regioes: [{ nome: "Chãs Quebradas" }] },
  cidadeAtual: "Buraco Norte", lugar: { nome: "a praça" },
  bancas: [{ nome: "Banca do Boticário", estoque: [{ nome: "Elixir de Destreza", preco: 140, id: "elixir" }] }],
  narracoes: [],
  mundo: { semente: "prova|Fantasia medieval", genero: "Fantasia medieval" },
};
const PROSA = "O boticário ergue o frasco. — Vinte e cinco marcos o Elixir de Destreza. Atrás dele, uma velha a quem chamam Fiandeira tece junto à Ponte das Cinzas.";
const LIMPA = "O boticário ergue o frasco e diz o preço da mesa. Lá fora, a praça esvazia-se devagar.";

/* O TURNO, como o App o corre: `R` é o turnoDeRegistroRef antes de
   anotarOTurno (que o anda no fim do turno). O Juiz e a pauta contam R + 1. */
function julgar(livro, prosa, R, foto = FOTO, frase = "Quanto custa o elixir?") {
  const entrada = entradaDoJuiz(foto, { frase, pauta: "", moeda: "marcos" });
  const { veredito } = julgarOTurno(prosa, entrada, { turno: R + 1 });
  const turnoJ = R + 1, cidadeJ = foto.cidadeAtual || "";
  return { juiz: { turno: turnoJ, veredito, entrada }, livro: andarOsVetos(livro, vetosDoVeredito(veredito, { turno: turnoJ, cidade: cidadeJ }), { turno: turnoJ, cidade: cidadeJ }) };
}
function pautaDoTurno(livro, R, { cidade = "Buraco Norte", frase = "Olho em volta.", luta = false, base = {} } = {}) {
  let p = { ...base };
  p = porNaPauta(p, "vetoDoJuiz", ...vetosParaAPauta(livro, { turno: R + 1, cidade: cidade || "", frase }));
  p = cederNaCena(p, { luta, masmorra: false, arredores: !cidade });
  return textoDaPauta(p, { turno: R + 1 });
}
const temVeto = (txt) => /140/.test(txt) && /Elixir de Destreza/.test(txt);

sec("1. A INVENÇÃO DESTE TURNO VIRA VETO NA PAUTA DO SEGUINTE");
{
  const { livro } = julgar([], PROSA, 4);
  t("a contradição da banca (25 contra ◉ 140) entra no livro, com o turno do Juiz e a cidade da foto", livro.length === 1 && livro[0].turno === 5 && livro[0].cidade === "Buraco Norte" && /140/.test(livro[0].linha), Js(livro));
  const seguinte = pautaDoTurno(livro, 5);
  t("o turno seguinte (o registo já andou): a pauta leva a linha, com o número da mesa", temVeto(seguinte), seguinte);
  t("e leva-a no bloco do NÃO PODE (o rótulo da secção vetoDoJuiz)", /NÃO PODE/.test(seguinte) && seguinte.indexOf("NÃO PODE") < seguinte.indexOf("140"), seguinte);
  t("no mesmo turno da invenção a pauta não a tem (ela já foi enviada)", !temVeto(pautaDoTurno(livro, 4)));
  t("MORDE: a pauta contada sem o +1 do textoDaPauta perde o veto", (() => { const p = porNaPauta({}, "vetoDoJuiz", ...vetosParaAPauta(livro, { turno: 5, cidade: "Buraco Norte", frase: "" })); return !temVeto(textoDaPauta(p, { turno: 5 })); })());
  t("uma resposta limpa não deixa veto nenhum", julgar([], LIMPA, 4).livro.length === 0);
}

sec("2. QUANDO O VETO VOLTA, E QUANDO CALA");
{
  const { livro } = julgar([], PROSA, 4);
  const L6 = julgar(livro, LIMPA, 5).livro;
  t("dois turnos depois, com a frase noutra coisa: cala", !temVeto(pautaDoTurno(L6, 6, { frase: "Vou à taberna." })));
  t("dois turnos depois, com a frase a tocar o elixir: volta", temVeto(pautaDoTurno(L6, 6, { frase: "E o elixir de destreza, quanto é mesmo?" })));
  const L8 = julgar(julgar(L6, LIMPA, 6).livro, LIMPA, 7).livro;
  t("passada a vida do veto (três turnos), nem a frase o traz", !temVeto(pautaDoTurno(L8, 8, { frase: "o elixir de destreza" })));
  t("na luta cede inteiro", !temVeto(pautaDoTurno(livro, 5, { luta: true })));
  t("noutra cidade não vale (o preço é da banca de Buraco Norte)", !temVeto(pautaDoTurno(livro, 5, { cidade: "Vau Fincado" })));
  const viajou = julgar(livro, LIMPA, 5, { ...FOTO, cidadeAtual: "Vau Fincado", bancas: [] }).livro;
  t("e o turno julgado noutra cidade apaga o livro", viajou.length === 0, Js(viajou));
  t("MORDE: a cidade é a da foto, não a de depois — a resposta que inventa o preço em Buraco Norte e leva o herói a Vau Fincado, marcada com a cidade de depois, punha o preço de lá na pauta de cá", (() => {
    const { juiz } = julgar([], PROSA, 4);
    const errado = andarOsVetos([], vetosDoVeredito(juiz.veredito, { turno: 5, cidade: "Vau Fincado" }), { turno: 5, cidade: "Vau Fincado" });
    return temVeto(pautaDoTurno(errado, 5, { cidade: "Vau Fincado" })) && !temVeto(pautaDoTurno(julgar([], PROSA, 4).livro, 5, { cidade: "Vau Fincado" }));
  })());
}

sec("3. O CÂNONE DO MESMO TURNO NÃO CONSAGRA A INVENÇÃO");
{
  const { juiz } = julgar([], PROSA, 4);
  const proposta = { canone: { Fiandeira: { tipo: "pessoa", descricao: "velha que tece junto à ponte" }, "Ponte das Cinzas": { tipo: "lugar", descricao: "a ponte" } }, pessoas: [{ nome: "Fiandeira", papel: "tecelã" }] };
  const juizo = julgarOCronista({ ...FOTO, canone: {} }, proposta, { narrativa: PROSA, pedido: "", envelopes: [], aceitariam: [] });
  const ac = (juizo && juizo.aceito) || {};
  t("o juízo do Cronista aceita os dois nomes no cânone (é o que entrava antes)", ac.canone && "Fiandeira" in ac.canone && "Ponte das Cinzas" in ac.canone, Js(ac));
  const cj = canoneSemInvencao(ac, juiz.veredito, { entrada: juiz.entrada, estado: { ...FOTO, canone: {} } });
  const jogo = jogarOAceito(cj.aceito, { estado: { npcs: {}, canone: {} } });
  t("aplicado o aceito corrigido, nenhum dos dois chega ao cânone", !("Fiandeira" in jogo.estado.canone) && !("Ponte das Cinzas" in jogo.estado.canone), Js(jogo.estado.canone));
  t("e a gente que a cena pôs a agir fica no registo", "Fiandeira" in jogo.estado.npcs, Js(Object.keys(jogo.estado.npcs)));
  const antes = jogarOAceito(ac, { estado: { npcs: {}, canone: {} } });
  t("MORDE: sem a correção, os dois entram como verdade imutável", "Fiandeira" in antes.estado.canone && "Ponte das Cinzas" in antes.estado.canone, Js(antes.estado.canone));
  const vespera = julgar([], LIMPA, 3).juiz;
  t("MORDE: o veredito de OUTRO turno (a resposta limpa da véspera) não tira nada — tem de ser o do mesmo", canoneSemInvencao(ac, vespera.veredito, { entrada: vespera.entrada, estado: FOTO }).tirados.length === 0);
  t("o nome que o estado já conhece nunca sai (a Fiandeira já no registo)", !canoneSemInvencao(ac, juiz.veredito, { entrada: juiz.entrada, estado: { ...FOTO, npcs: { ...FOTO.npcs, Fiandeira: {} } } }).tirados.some((x) => x.nome === "Fiandeira"));
  const cego = entradaDoJuiz({ ...FOTO, mundo: {} }, { frase: "", pauta: "", moeda: "marcos" });
  t("o Juiz cego (sem a semente) não mexe no cânone", canoneSemInvencao(ac, julgarOTurno(PROSA, cego, { turno: 5 }).veredito, { entrada: cego, estado: FOTO }).tirados.length === 0);
  t("sem veredito (o turno que o Juiz não julgou), o aceito passa o mesmo", canoneSemInvencao(ac, null, { entrada: juiz.entrada, estado: FOTO }).aceito === ac);
}

sec("4. DETERMINISMO E LIXO");
{
  t("a mesma resposta, o mesmo livro e a mesma pauta", Js(julgar([], PROSA, 4).livro) === Js(julgar([], PROSA, 4).livro) && pautaDoTurno(julgar([], PROSA, 4).livro, 5) === pautaDoTurno(julgar([], PROSA, 4).livro, 5));
  t("o livro torto (o ref nulo de um carregar) não derruba a pauta", (() => { pautaDoTurno(null, 5); pautaDoTurno([null, 3, {}], 5); andarOsVetos(null, vetosDoVeredito(null, {}), {}); return true; })());
}

console.log(`\n${ok} ok, ${mal} mal`);
if (mal) process.exit(1);
