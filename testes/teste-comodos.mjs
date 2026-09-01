/* teste-comodos.mjs (v9.58) — o lugar dentro do lugar, e o nome dele.
   Duas perguntas do jogador viraram este arquivo: "quartos numa taverna
   funcionam?" e "por que os nomes se repetem?".                        */
import { comodosDoLocal, camaDoLocal, resumoComodosPrompt, COMODOS_PROMPT } from "../src/comodos.js";
import { nomeDeLocal, nomeDeTaverna, tamanhoDoBanco, tiposComNome, generosDaToponimia } from "../src/toponimia.js";
import { locaisDaCidade, mencionadosNaCena, garantirBase } from "../src/mundo-base.js";
import { gerarGeografia } from "../src/geografia.js";
import { lugarPedido, definirLugar, garantirLugar, comDe, linhaDeLugar, resumoLugarPrompt, distanciaPorTexto } from "../src/lugar.js";
import { MOLDES } from "../src/moldes.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const SEM = "taverna|comodos";
const mapa = gerarGeografia(SEM, null);
const cidade = mapa.cidades.find((c) => (c.porte || c.tipo) === "capital") || mapa.cidades[0];
const locais = locaisDaCidade(SEM, cidade, "Fantasia medieval", null);
const taverna = locais.find((l) => l.tipo === "taverna");

sec("1. o prédio tem planta, e ela é fixa");
{
  const a = comodosDoLocal(SEM, taverna, "Fantasia medieval", null);
  const b = comodosDoLocal(SEM, taverna, "Fantasia medieval", null);
  t("a taverna tem cômodos", a.length >= 2);
  t("a mesma semente dá a mesma planta", JSON.stringify(a) === JSON.stringify(b));
  t("o salão está sempre lá — taverna sem salão não é taverna", a.some((c) => /salão/i.test(c.nome)));
  t("cada cômodo diz de que prédio é", a.every((c) => c.de === taverna.nome));
  t("e tem id próprio, para o livro-razão não confundir dois quartos", new Set(a.map((c) => c.id)).size === a.length);
  t("cada um traz uma linha do que há lá", a.every((c) => c.nota && c.nota.length > 5));
  const outra = locais.find((l) => l.tipo !== "taverna");
  t("prédio diferente, planta diferente", !outra || JSON.stringify(comodosDoLocal(SEM, outra, "Fantasia medieval", null)) !== JSON.stringify(a));
  t("local sem tipo não quebra", comodosDoLocal(SEM, null).length === 0 && comodosDoLocal(SEM, { nome: "x" }).length === 0);
  t("tipo que não tem planta devolve vazio", comodosDoLocal(SEM, { id: "q", nome: "q", tipo: "aeroporto" }).length === 0);
}

sec("2. nem todo cômodo é público");
{
  let restritos = 0, total = 0;
  for (const c of mapa.cidades) {
    for (const l of locaisDaCidade(SEM, c, "Fantasia medieval", null)) {
      for (const q of comodosDoLocal(SEM, l, "Fantasia medieval", null)) { total++; if (q.restrito) restritos++; }
    }
  }
  console.log(`      ${total} cômodos no mundo · ${restritos} restritos`);
  t("existem cômodos restritos", restritos > 0);
  t("e existem cômodos livres — não é tudo trancado", restritos < total);
  t("o aviso de invasão vai no prompt", /RESTRITO — entrar aqui é invadir/.test(resumoComodosPrompt([{ nome: "a adega", nota: "barris", restrito: true }], "X")));
  t("cômodo livre não recebe o aviso", !/RESTRITO/.test(resumoComodosPrompt([{ nome: "o salão", nota: "mesas" }], "X")));
}

sec("3. dormir tem onde acontecer");
{
  let comCama = 0, tavernas = 0;
  for (const c of mapa.cidades) {
    const tv = locaisDaCidade(SEM, c, "Fantasia medieval", null).find((l) => l.tipo === "taverna");
    if (!tv) continue;
    tavernas++;
    if (camaDoLocal(SEM, tv, "Fantasia medieval", null)) comCama++;
  }
  console.log(`      ${comCama} de ${tavernas} tavernas alugam cama`);
  t("boa parte das tavernas hospeda", comCama >= Math.floor(tavernas / 2));
  t("a forja não hospeda ninguém", !camaDoLocal(SEM, { tipo: "forja", id: "f", nome: "f", porte: "capital" }, "Fantasia medieval", null));
}

sec("4. o sistema sabe ANDAR até um cômodo");
{
  const comodos = comodosDoLocal(SEM, taverna, "Fantasia medieval", null).map((q) => ({ ...q, onde: "comodo", dentroDe: taverna.nome }));
  console.log("      " + comodos.map((c) => c.nome).join(" · "));
  const salao = comodos.find((q) => /salão/i.test(q.nome));
  const quarto = comodos.find((q) => /quarto/i.test(q.nome));
  t("\"desço para o salão\" acha o salão", (lugarPedido("desço para o salão", comodos) || {}).nome === salao.nome);
  if (quarto) t("\"subo para o quarto\" acha o quarto", (lugarPedido("subo para o quarto", comodos) || {}).nome === quarto.nome);
  else t("(esta taverna não tem quarto — e a lista não inventa um)", true);
  t("falar de um cômodo não é ir até ele", lugarPedido("pergunto ao taverneiro sobre o salão", comodos) === null);
  t("frase sem verbo de ir não move", lugarPedido("o salão está cheio", comodos) === null);
  t("a lista de fora do prédio não tem cômodo nenhum", lugarPedido("vou até o salão", locais.map((l) => ({ ...l, onde: "dentro" }))) === null);
}

sec("5. o lugar guarda de que prédio é");
{
  const l = definirLugar("o quarto de cima", { cidade: "Vau", dia: 3, distancia: "dentro", dentroDe: "O Javali Cambaleante" });
  t("dentroDe é guardado", l.dentroDe === "O Javali Cambaleante");
  t("a distância é de dentro", l.distancia === "dentro");
  t("a linha do rodapé diz o prédio", /dentro do Javali Cambaleante/.test(linhaDeLugar(l)));
  t("e diz que sair custa minutos", /MINUTOS/.test(linhaDeLugar(l)));
  t("o resumo também", /cômodo do Javali Cambaleante/.test(resumoLugarPrompt(l, "Vau")));
  t("lugar sem prédio não inventa um", !garantirLugar({ nome: "a fazenda de Jessa" }).dentroDe);
  t("save antigo (sem o campo) não quebra", garantirLugar({ nome: "x", distancia: "arredores" }).dentroDe === "");
  t("\"o quarto\" já era lido como interior antes deste arquivo", distanciaPorTexto("o quarto de cima") === "dentro");
}

sec("6. a contração de 'de' não escreve 'de O Javali'");
{
  t("O vira do", comDe("O Javali Cambaleante") === "do Javali Cambaleante");
  t("A vira da", comDe("A Coroa Rachada") === "da Coroa Rachada");
  t("As vira das", comDe("As Três Velas") === "das Três Velas");
  t("Os vira dos", comDe("Os Ossos") === "dos Ossos");
  t("sem artigo continua 'de'", comDe("Bigorna Torta") === "de Bigorna Torta");
  t("vazio não quebra", comDe(null) === "de ");
}

sec("7. o nome vem da combinação — o banco é grande");
{
  for (const tipo of tiposComNome()) t(`${tipo}: mais de mil nomes possíveis`, tamanhoDoBanco(tipo, "Fantasia medieval") >= 1000);
  t("a taverna passa de nove mil", tamanhoDoBanco("taverna", "Fantasia medieval") >= 9000);
  t("tipo desconhecido não inventa nome", nomeDeLocal("aeroporto", "Fantasia medieval") === "");
  t("todo gênero tem banco", generosDaToponimia().every((g) => tamanhoDoBanco("taverna", g) >= 3000));
}

sec("8. e ele não repete dentro do mesmo mundo (a medida, não a impressão)");
{
  let mundosComRepeticao = 0, totalMundos = 0, totalLocais = 0;
  for (let s = 0; s < 300; s++) {
    const sem = `rep|${s}|${(s * 7919).toString(36)}`;
    const geo = gerarGeografia(sem, null);
    const vistos = new Set(); let repetiu = false;
    for (const c of geo.cidades) {
      for (const l of locaisDaCidade(sem, c, "Fantasia medieval", null)) {
        totalLocais++;
        const k = `${l.tipo}::${l.nome}`;
        if (vistos.has(k)) repetiu = true;
        vistos.add(k);
      }
    }
    totalMundos++; if (repetiu) mundosComRepeticao++;
  }
  const pct = (mundosComRepeticao / totalMundos) * 100;
  console.log(`      ${totalLocais} locais em ${totalMundos} mundos · ${pct.toFixed(1)}% dos mundos com um nome repetido`);
  /* antes disto era ~100%: cinco nomes de mercado para catorze cidades.
     O alvo não é zero — é raro o bastante para não denunciar o gerador. */
  t("menos de um mundo em seis repete algum nome", pct < 17);
}

sec("9. gênero e concordância — o gerador não escreve 'O Coroa Rachada'");
{
  /* Só o padrão ADJETIVO é verificável de fora, e é o único que precisa
     concordar: "A Bigorna Torto" é erro, "A Praça do Corvo" não é — ali o
     -o é do complemento, que não concorda com nada. O teste isola o padrão
     pela forma: artigo + substantivo + adjetivo, sem preposição no meio. */
  let erros = 0, amostras = 0, verificados = 0;
  const maus = [];
  const rnd = mulberry(4242);
  const SEM_PREPOSICAO = /\b(d[eoa]s?|&|sem|a|em|do|da)\b/i;
  for (const g of generosDaToponimia()) {
    for (const tipo of tiposComNome()) {
      for (let i = 0; i < 200; i++) {
        const n = nomeDeLocal(tipo, g, rnd);
        amostras++;
        if (!n) { erros++; continue; }
        const [artigo, ...resto] = n.split(/\s+/);
        if (resto.length !== 2) continue;                 // não é o padrão do adjetivo
        if (SEM_PREPOSICAO.test(resto.join(" "))) continue;
        verificados++;
        const fem = /^As?$/.test(artigo);
        const plur = /s$/i.test(artigo);
        const adjetivo = resto[1];
        /* só o -o é decidível de fora: um adjetivo em -a pode ser invariável
           ("o espectro fantasma", "o cabo pirata") e flagrá-lo seria acusar
           o português, não o gerador. */
        if (fem && /[^aeiou]os?$/i.test(adjetivo)) { erros++; maus.push(n); }
        if (plur && !/s$/i.test(adjetivo)) { erros++; maus.push(n); }
      }
    }
  }
  console.log(`      ${amostras} nomes gerados · ${verificados} no padrão do adjetivo · ${erros} sem concordância`);
  if (maus.length) console.log("      " + [...new Set(maus)].slice(0, 6).join(" | "));
  t("nenhum adjetivo sai com o gênero ou o número trocado", erros === 0);
  t("e o padrão foi de fato exercitado", verificados > 1500);
}

sec("10. o nome com artigo continua sendo reconhecido em cena");
{
  /* o bug que a toponímia revelou: em português ninguém escreve "a porta
     de A Taça Negra" — escreve "da Taça Negra", e a fronteira de palavra
     rejeitava o 'd' da contração. O local citado nunca virava cânone. */
  const base = garantirBase(null);
  const local = locais[0];
  const semArtigo = local.nome.replace(/^(o|a|os|as)\s+/i, "");
  const nar = `Você empurra a porta d${/^a\s/i.test(local.nome) ? "a" : "o"} ${semArtigo}. Lá dentro, silêncio.`;
  const m = mencionadosNaCena(SEM, mapa, cidade.nome, base, "Fantasia medieval", nar);
  console.log(`      "${nar.slice(0, 70)}…"`);
  t("o local contraído é reconhecido", m.locais.some((l) => l.nome === local.nome));
  const solto = mencionadosNaCena(SEM, mapa, cidade.nome, base, "Fantasia medieval", `Vocês chegam a ${local.nome}, enfim.`);
  t("e o nome inteiro também", solto.locais.some((l) => l.nome === local.nome));
  t("pedaço de outra palavra continua não contando", !mencionadosNaCena(SEM, mapa, cidade.nome, base, "Fantasia medieval", `O ${semArtigo}dor passou correndo.`).locais.length);
}

sec("11. contra os mundos de verdade");
{
  let quebrou = 0, comodos = 0;
  for (const m of MOLDES) {
    const geo = gerarGeografia(`comodos|${m.id}`, m);
    for (const c of geo.cidades.slice(0, 6)) {
      for (const l of locaisDaCidade(`comodos|${m.id}`, c, "Fantasia medieval", m)) {
        try {
          const qs = comodosDoLocal(`comodos|${m.id}`, l, "Fantasia medieval", m);
          comodos += qs.length;
          if (qs.some((q) => !q.nome || !q.id || !q.icone)) quebrou++;
        } catch { quebrou++; }
      }
    }
  }
  console.log(`      ${comodos} cômodos gerados em ${MOLDES.length} moldes`);
  t("nenhum molde quebra a planta do prédio", quebrou === 0);
}

sec("12. a regra que o Mestre recebe");
{
  t("diz que a lista é completa e fixa", /ela é completa e é fixa/.test(COMODOS_PROMPT));
  t("diz que quem move é o sistema", /o SISTEMA registra o movimento/.test(COMODOS_PROMPT));
  t("e que descer uma escada não custa horas", /nunca horas nem dias/.test(COMODOS_PROMPT));
  t("o resumo vazio não vira bloco", resumoComodosPrompt([], "X") === "" && resumoComodosPrompt(null) === "");
}

function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

console.log(`\ncômodos + toponímia v9.58: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
