/* A HISTÓRIA NÃO SE OFERECE (Fase MM, MM18 · as missões que se acumulam)

   A pessoa (11/10): "algumas quests principais estão aparecendo pra serem
   aceitas, e ficam acumulando na tela inicial até que sejam aceitas". A
   decisão dela: a principal é induzida pelo mundo, por bem ou por mal —
   nunca um papel para aceitar.

   A causa, na 4.ª sessão: o mural prefere quem o herói já conhece, e quem
   ele conhece no começo é a gente da história. O alvo da principal ("O
   rasto de Noé Laminado") pregou "A caçada de Noé Laminado"; o preso do
   julgamento pregou um cartaz; e o de Caetano ficou 26 turnos no rodapé
   com "Aceitar".

   Esta suíte prova: quem é da história não sai do estoque do mural — pelo
   nome (quando o App passar a lista) e já hoje pelo título do diário que o
   App manda em `evitar`; o trabalho que o Mestre inventa para a gente da
   história não vira cartaz; o cartaz pregado vence; e o mural de quem não
   é da história fica igual ao de sempre. */
import {
  genteDaHistoria, ehDaHistoria, LETRAS_DE_NOME, ofertasDaqui, cartazDaProposta, cartazVencido, CARTAZ_ESPERA,
} from "../src/ofertas.js";
import { gerarGeografia } from "../src/geografia.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

/* um mundo com mural cheio */
let W = null, OFS = [];
for (let i = 0; i < 40 && OFS.length < 4; i++) {
  const semente = `Sonda MM18 mural|${i}`;
  const mapa = gerarGeografia(semente, "sobremundo");
  const cidade = mapa.cidades[0].nome;
  const ofs = ofertasDaqui({ semente, mapa, cidade, base: null, genero: "Fantasia medieval", nivel: 2, quantas: 8 });
  if (ofs.length >= 4) { W = { semente, mapa, cidade }; OFS = ofs; }
}
const daqui = (extra = {}) => ofertasDaqui({ semente: W.semente, mapa: W.mapa, cidade: W.cidade, base: null, genero: "Fantasia medieval", nivel: 2, quantas: 8, ...extra });

sec("1. quem é da história");
{
  const abertura = { pista: { nome: "Inocência Bordão" }, alvo: { quem: "Noé Laminado" } };
  const missoes = [
    { titulo: "O rasto de Noé Laminado", tipo: "principal", status: "ativa", etapas: [{ tipo: "falar_com", alvo: "Inocência Bordão" }, { tipo: "falar_com", alvo: "Noé Laminado" }] },
    { titulo: "A caçada", tipo: "trama", status: "ativa", dador: "Teodoro", etapas: [{ tipo: "derrotar", alvo: "Serpente do Erval" }] },
    { titulo: "Um bico", tipo: "contrato", status: "ativa", dador: "Praxedes", etapas: [{ tipo: "falar_com", alvo: "Clóvis" }] },
  ];
  const espinha = { atos: [{ marcos: [{ quem: "Clóvis Sombra", feito: false }, { quem: "Gertrudes", feito: true }] }] };
  const g = genteDaHistoria({ abertura, missoes, espinha });
  t("a pista e o alvo da abertura", g.includes("Inocência Bordão") && g.includes("Noé Laminado"));
  t("o dador e o alvo de uma trama", g.includes("Teodoro") && g.includes("Serpente do Erval"));
  t("quem um marco por fazer nomeia", g.includes("Clóvis Sombra") && !g.includes("Gertrudes"));
  t("o contrato do mural não é história", !g.includes("Praxedes") && !g.includes("Clóvis"));
  t("lixo devolve vazio", genteDaHistoria(null).length === 0 && genteDaHistoria({ abertura: { legado: true } }).length === 0);
  t("pelo primeiro nome também", ehDaHistoria("Noé", { historia: ["Noé Laminado"] }));
  t("pelo título do diário", ehDaHistoria("Noé Laminado", { titulos: ["O rasto de Noé Laminado"] }));
  t("palavra inteira: \"Ana\" não sai por \"Mariana\"", !ehDaHistoria("Ana", { titulos: ["O rasto de Mariana"] }) && LETRAS_DE_NOME === 4);
  t("e quem não está em lado nenhum não é", !ehDaHistoria("Bento", { historia: ["Noé Laminado"], titulos: ["O rasto de Noé Laminado"] }));
}

sec("2. o mural não oferece trabalho da gente da história (falhava antes: J15, J9)");
{
  t(`o mundo da prova tem mural cheio (${OFS.length})`, !!W && OFS.length >= 4);
  const x = OFS[0].dador;
  const comTitulo = daqui({ evitar: [`O rasto de ${x}`] });
  t(`o alvo da principal ("O rasto de ${x}") já não prega — só com o que o App manda hoje`, !comTitulo.some((o) => o.dador === x), comTitulo.map((o) => o.dador).join(", "));
  const y = OFS[1].dador;
  const comLista = daqui({ historia: [y] });
  t("pela lista da história (a fiação nova)", !comLista.some((o) => o.dador === y));
  const igual = daqui();
  t("sem história, o mural é o de sempre, byte a byte", JSON.stringify(igual) === JSON.stringify(OFS));
  t("os outros continuam lá", comTitulo.length >= OFS.length - 1 && comTitulo.every((o) => o.dador !== x));
}

sec("3. o trabalho que o Mestre inventa para a história não vira cartaz");
{
  const prop = { titulo: "Encontrar o boticário", dador: "Praxedes", etapas: [{ tipo: "falar_com", alvo: "Noé Laminado" }], paga: 20 };
  t("sem a lista, vira cartaz (como antes)", !!cartazDaProposta(prop, { cidade: "Rio Cinzento" }));
  t("procurar alguém da história não é trabalho de mural", cartazDaProposta(prop, { cidade: "Rio Cinzento", historia: ["Noé Laminado"] }) === null);
  t("nem o pedido de alguém da história", cartazDaProposta({ ...prop, dador: "Noé Laminado", etapas: [{ tipo: "ir_a", alvo: "Campo Seco" }] }, { historia: ["Noé Laminado"] }) === null);
  t("lixo continua lixo", cartazDaProposta(null, null) === null && cartazDaProposta({ titulo: "x" }, null) === null);
}

sec("4. o cartaz pregado vence");
{
  t(`vence ao fim de ${CARTAZ_ESPERA.dias} dias`, cartazVencido({ pregadoEm: 4 }, 4 + CARTAZ_ESPERA.dias) && !cartazVencido({ pregadoEm: 4 }, 4 + CARTAZ_ESPERA.dias - 1));
  t("sem data (save de antes) não vence", !cartazVencido({ titulo: "x" }, 99));
  t("lixo não vence", !cartazVencido(null, 5) && !cartazVencido({ pregadoEm: 2 }, null));
  t("a regra mora na tabela", CARTAZ_ESPERA.dias > 0);
}

console.log(`\nmm18-missoes: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
