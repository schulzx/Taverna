/* teste-nome-com-epiteto.mjs — o nome curto e o nome com epíteto são a
   mesma pessoa, quando é uma só

   A prova viva de v9.424: no Sino dos Andarilhos o Cronista registou
   "Ivarr" ao lado de "Ivarr o Exilado" (este vindo dos NOMES À MÃO) — duas
   fichas para o mesmo taverneiro. `nomeComDono` (npcs.js) só comparava o
   primeiro nome com quem tem investimento (a história); um figurante
   registado com epíteto não era dono de ninguém, e o nome curto nascia
   outra vez.

   A regra: o primeiro nome solto casa com o registado "primeiro nome +
   epíteto" (e vice-versa) quando ele é o ÚNICO portador daquele primeiro
   nome — no registo, em quem importa, nos conhecidos, no grupo — e nada os
   separa (sexo, ofício de outra família, lugar, paradeiro). O epíteto é o
   que a tabela `EPITETO` diz: um artigo ou partícula logo depois do
   primeiro nome ("o Exilado", "da Pedra"), a vírgula ("Ivarr, o
   Ferreiro"), ou um composto com hífen ("Barba-Ruiva"). Um sobrenome solto
   ("Mendes") não é epíteto. Dois "Ivarr" diferentes não se fundem — é a
   lição de MM15 ("dois Túlios são duas pessoas", teste-mm15-nomes). */
import * as N from "../src/npcs.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const tenta = (f, d) => { try { return f(); } catch (e) { return d; } };

const SINO = ["Baixo do Vigia", "O Sino dos Andarilhos"];
const ivarrExilado = () => N.criarNPC("Ivarr o Exilado", { papel: "taverneiro", relacao: "neutro", genero: "homem", local: "O Sino dos Andarilhos", conhecidoEm: 1 });
const ivarrCurto = () => N.criarNPC("Ivarr", { papel: "taverneiro", relacao: "neutro", genero: "homem", local: "O Sino dos Andarilhos", conhecidoEm: 1 });
const albaPedra = () => N.criarNPC("Alba da Pedra", { papel: "ferreira", relacao: "neutro", genero: "mulher", local: "Baixo do Vigia", conhecidoEm: 1 });
const albaCurta = () => N.criarNPC("Alba", { papel: "ferreira", relacao: "neutro", genero: "mulher", local: "Baixo do Vigia", conhecidoEm: 1 });

/* ============================================================ */
sec("1. a tabela");
{
  const E = N.EPITETO;
  t("EPITETO existe e é tabela", !!E && typeof E === "object");
  t("abre com artigo e partícula (o, a, da, do, de)", ["o", "a", "da", "do", "de", "das", "dos"].every((p) => tenta(() => E.abre.includes(p), false)));
  t("a vírgula e o hífen são marcas da tabela", tenta(() => E.virgula === "," && E.hifen === "-", false));
  t("toda palavra da tabela está sem acento e em minúsculas", tenta(() => E.abre.every((p) => p === p.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")), false));
}

/* ============================================================ */
sec("2. o defeito da prova viva — Ivarr e Ivarr o Exilado");
{
  const reg = { "Ivarr o Exilado": ivarrExilado() };
  const r = N.nomeComDono("Ivarr", reg, { aqui: SINO, papel: "taverneiro", genero: "homem" });
  t("'Ivarr' com 'Ivarr o Exilado' registado: é ele", r.decisao === "mesma" && r.chave === "Ivarr o Exilado" && r.nome === "Ivarr o Exilado", J(r));
  const so = N.nomeComDono("Ivarr", reg, {});
  t("sem contexto nenhum, também é ele (um só Ivarr no registo)", so.decisao === "mesma" && so.chave === "Ivarr o Exilado", J(so));
  const inv = N.nomeComDono("Ivarr o Exilado", { Ivarr: ivarrCurto() }, { aqui: SINO });
  t("e ao contrário: 'Ivarr o Exilado' com 'Ivarr' registado é ele", inv.decisao === "mesma" && inv.chave === "Ivarr", J(inv));
  t("o registo recebido não foi mexido", (() => { const a = J(reg); N.nomeComDono("Ivarr", reg, {}); return J(reg) === a; })());
}

/* ============================================================ */
sec("3. Alba e Alba da Pedra");
{
  const r = N.nomeComDono("Alba", { "Alba da Pedra": albaPedra() }, { aqui: ["Baixo do Vigia"] });
  t("'Alba' com 'Alba da Pedra' registada: é ela", r.decisao === "mesma" && r.chave === "Alba da Pedra", J(r));
  const inv = N.nomeComDono("Alba da Pedra", { Alba: albaCurta() }, { aqui: ["Baixo do Vigia"], genero: "mulher" });
  t("e ao contrário: 'Alba da Pedra' com 'Alba' registada é ela", inv.decisao === "mesma" && inv.chave === "Alba", J(inv));
}

/* ============================================================ */
sec("4. as outras marcas do epíteto");
{
  const reg = { Ivarr: ivarrCurto() };
  t("'Ivarr, o Ferreiro' (a vírgula) é o Ivarr", N.nomeComDono("Ivarr, o Ferreiro", reg, {}).chave === "Ivarr");
  t("'Ivarr Barba-Ruiva' (o hífen) é o Ivarr", N.nomeComDono("Ivarr Barba-Ruiva", reg, {}).chave === "Ivarr");
  t("'Ivarr' com 'Ivarr Barba-Ruiva' registado é ele", N.nomeComDono("Ivarr", { "Ivarr Barba-Ruiva": N.criarNPC("Ivarr Barba-Ruiva", {}) }, {}).chave === "Ivarr Barba-Ruiva");
  t("'Mestre Ivarr o Exilado' (o tratamento à frente) é o Ivarr", N.nomeComDono("Mestre Ivarr o Exilado", reg, {}).chave === "Ivarr");
  /* um sobrenome solto não é epíteto: é outra família, e o mundo repete nomes */
  const mendes = N.nomeComDono("Ivarr Mendes", reg, {});
  t("'Ivarr Mendes' (sobrenome sem marca) nasce próprio", mendes.decisao === "nova" && mendes.chave === "", J(mendes));
  t("dois epítetos diferentes não se fundem ('Ivarr da Pedra' com 'Ivarr o Exilado')", N.nomeComDono("Ivarr da Pedra", { "Ivarr o Exilado": ivarrExilado() }, {}).decisao === "nova");
}

/* ============================================================ */
sec("5. dois Ivarr não se fundem");
{
  const dois = { "Ivarr o Exilado": ivarrExilado(), "Ivarr da Pedra": N.criarNPC("Ivarr da Pedra", { papel: "pastor", local: "Vau Fundo" }) };
  const r = N.nomeComDono("Ivarr", dois, { aqui: ["Alto Seco"] });
  t("dois Ivarr registados e longe dos dois: o curto não se liga a nenhum", r.decisao !== "mesma", J(r));
  const conh = N.nomeComDono("Ivarr", { "Ivarr o Exilado": ivarrExilado() }, { conhecidos: [{ nome: "Ivarr da Pedra", notas: "o pastor de Vau Fundo" }], aqui: ["Alto Seco"] });
  t("um registado e outro conhecido (o mural): também não", conh.chave !== "Ivarr o Exilado" || conh.decisao !== "mesma", J(conh));
  const inv = N.nomeComDono("Ivarr o Exilado", { Ivarr: ivarrCurto() }, { conhecidos: [{ nome: "Ivarr da Pedra" }] });
  t("'Ivarr o Exilado' com 'Ivarr' registado e 'Ivarr da Pedra' conhecido: nasce próprio", inv.decisao === "nova", J(inv));
  const grupo = N.nomeComDono("Ivarr o Exilado", { Ivarr: ivarrCurto() }, { grupo: [{ nome: "Ivarr Sousa", classe: "guerreiro" }] });
  t("um Ivarr no grupo também conta como outro portador", grupo.chave !== "Ivarr", J(grupo));
}

/* ============================================================ */
sec("6. o que separa continua a separar");
{
  const reg = { "Alba da Pedra": albaPedra() };
  t("sexo: um homem chamado Alba é outro", N.nomeComDono("Alba", reg, { genero: "homem" }).decisao === "nova");
  t("ofício: 'Ivarr' ferreiro não é o taverneiro", N.nomeComDono("Ivarr", { "Ivarr o Exilado": ivarrExilado() }, { papel: "ferreiro" }).decisao === "nova");
  t("lugar: 'Ivarr' noutra cidade não é o do Sino", N.nomeComDono("Ivarr", { "Ivarr o Exilado": ivarrExilado() }, { aqui: ["Serra do Bode", "A Bica"] }).decisao === "nova");
  /* MM15: dois Túlios são duas pessoas — o músico em casa e o que sumiu */
  const musico = N.criarNPC("Túlio", { papel: "músico de canto", relacao: "neutro", genero: "homem", local: "O Último Gomo", notas: "de folga hoje: em casa", conhecidoEm: 0 });
  const tr = N.nomeComDono("Túlio da Runa", { "Túlio": musico }, { aqui: ["Runa do Poço", "O Tesouro sem Fio"], local: "a caminho de Gomo do Ermo", papel: "desaparecido", notas: "sumiu no caminho de Gomo do Ermo" });
  t("MM15: 'Túlio da Runa', o sumido, não se funde no músico registado", tr.decisao === "nova" && tr.chave === "", J(tr));
}

/* ============================================================ */
sec("7. o lixo e a semente");
{
  t("registo nulo não quebra", tenta(() => N.nomeComDono("Ivarr", null, null).decisao, "x") === "nova");
  t("registo com lixo não quebra", tenta(() => N.nomeComDono("Ivarr", { "Ivarr o Exilado": null, "Ivarr da Pedra": "texto" }, {}).decisao, "x") !== "x");
  t("nome lixo não quebra", [null, undefined, 3, {}, "", "  "].every((x) => tenta(() => N.nomeComDono(x, { Ivarr: ivarrCurto() }, {}).decisao, "x") === "nova"));
  t("o mesmo pedido dá o mesmo veredito", J(N.nomeComDono("Ivarr", { "Ivarr o Exilado": ivarrExilado() }, { aqui: SINO })) === J(N.nomeComDono("Ivarr", { "Ivarr o Exilado": ivarrExilado() }, { aqui: SINO })));
}

console.log(`\n${ok} ok, ${mal} falhas`);
process.exit(mal ? 1 : 0);
