/* teste-chao.mjs (v9.94) — a corte e o chão.

   Duas ampliações puras, e a segunda tem uma história: `bioma` foi
   REMOVIDO da situação na v9.93 por ter nascido sem leitor, e volta agora
   pela porta certa — com onze regras que o consultam. É a prova de que a
   catraca funciona nos dois sentidos: ela tirou um campo especulativo e
   deixou entrar o mesmo campo quando ele passou a servir. */
import { ASSUNTOS, assuntoPorId, escolherAssunto, FAMILIAS } from "../src/compasso.js";
import { garantirSituacao } from "../src/biblioteca.js";
import { BIOMAS, PORTES } from "../src/geografia.js";
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const abre = (id, sit) => {
  const a = assuntoPorId(id);
  return !!a && (!a.quando || a.quando(garantirSituacao(sit)));
};
const abertos = (sit) => ASSUNTOS.filter((a) => !a.quando || a.quando(garantirSituacao(sit))).map((a) => a.id);

sec("1. O ACERVO CRESCEU E CONTINUA SÃO");
{
  t(`há muitos assuntos (${ASSUNTOS.length})`, ASSUNTOS.length >= 50);
  const ids = ASSUNTOS.map((a) => a.id);
  t("nenhum id repetido", new Set(ids).size === ids.length);
  t("todo id é ascii", ids.every((x) => /^[a-z][a-z0-9_]*$/.test(x)));
  const completos = ASSUNTOS.filter((a) => a.nome && a.preparo && a.subindo && a.vespera && a.agora && a.depois && a.familia && a.peso);
  t(`todos têm os cinco tempos (${completos.length}/${ASSUNTOS.length})`, completos.length === ASSUNTOS.length);
  const conta = {};
  for (const a of ASSUNTOS) conta[a.familia] = (conta[a.familia] || 0) + 1;
  t("as seis famílias continuam povoadas", FAMILIAS.every((f) => (conta[f.id] || 0) >= 5));
  const maior = Math.max(...Object.values(conta));
  t(`e nenhuma domina (maior: ${maior} de ${ASSUNTOS.length})`, maior < ASSUNTOS.length * 0.35);
}

sec("2. A CORTE — o que uma capital tem e um burgo não");
{
  const vila = { emCidade: true, momento: 0.6, pessoaNaCena: true, porte: "vila", gentePorPerto: 2, genteLonge: 2 };
  const cidade = { ...vila, porte: "cidade" };
  const capital = { ...vila, porte: "capital" };
  const metropole = { ...vila, porte: "metropole" };

  for (const id of ["audiencia", "intriga_de_corte", "julgamento", "embaixada"]) {
    t(`${id}: fechado numa cidade comum`, !abre(id, cidade));
    t(`${id}: aberto numa capital`, abre(id, capital));
    t(`${id}: e numa metrópole`, abre(id, metropole));
  }
  /* a guilda é o degrau de baixo: já existe numa cidade, e é o que separa
     "há ofícios organizados" de "há corte" */
  t("a guerra de guildas abre já na cidade", abre("guilda_em_guerra", cidade));
  t("mas não numa vila", !abre("guilda_em_guerra", vila));

  /* e a capital ganhou repertório de verdade em relação à cidade — antes
     desta versão as duas abriam exatamente o mesmo */
  const naCidade = new Set(abertos(cidade));
  const naCapital = abertos(capital).filter((x) => !naCidade.has(x));
  t(`a capital tem assuntos próprios (${naCapital.length})`, naCapital.length >= 4);
}

sec("3. O CHÃO — o bioma volta, e com leitor");
{
  /* `bioma` foi removido na v9.93 por nascer sem leitor. A prova de que
     ele voltou pela porta certa é esta: há regras que o consultam. */
  const leem = ASSUNTOS.filter((a) => a.quando && /bioma|chao\(/.test(String(a.quando)));
  t(`há assuntos que consultam o chão (${leem.length})`, leem.length >= 10);

  const em = (b) => ({ emCidade: true, momento: 0.5, pessoaNaCena: true, porte: "vila", bioma: b });
  t("a sede é do deserto", abre("sede", em("deserto")) && !abre("sede", em("costa")));
  t("a maré é da costa", abre("mare", em("costa")) && !abre("mare", em("deserto")));
  t("a febre é do pântano", abre("febre_do_pantano", em("pantano")) && !abre("febre_do_pantano", em("gelo")));
  t("o frio é do gelo", abre("frio_que_mata", em("gelo")) && !abre("frio_que_mata", em("floresta")));
  t("a mata é da floresta", abre("mata_que_olha", em("floresta")) && !abre("mata_que_olha", em("planicie")));
  /* dois biomas podem partilhar um assunto: o degelo serve ao gelo E à
     montanha, e o passo serve à montanha E às colinas */
  t("o degelo serve gelo e montanha", abre("degelo", em("gelo")) && abre("degelo", em("montanha")));
  t("o passo serve montanha e colina", abre("o_passo", em("montanha")) && abre("o_passo", em("colina")));
  t("o fogo serve floresta e planície", abre("fogo_na_mata", em("floresta")) && abre("fogo_na_mata", em("planicie")));

  /* BIOMA VAZIO NÃO ABRE NADA do chão: num save antigo ou numa cena sem
     lugar, afirmar que há deserto é o mesmo erro do portão inventado */
  const semChao = abertos({ emCidade: true, momento: 0.5, porte: "vila", bioma: "" });
  const doChao = leem.map((a) => a.id);
  t("bioma vazio não abre nenhum do chão", !doChao.some((id) => semChao.includes(id)));
  t("nem bioma inventado", !abertos(em("nuvem")).some((id) => doChao.includes(id)));

  /* todo bioma do gerador tem ao menos um assunto próprio — senão o campo
     voltaria a ser meio morto, que foi o motivo de ele ter saído */
  const semAssunto = BIOMAS.filter((b) => !abertos(em(b)).some((id) => doChao.includes(id)));
  t(`todo bioma tem assunto próprio${semAssunto.length ? " — sem: " + semAssunto.join(", ") : ""}`, semAssunto.length === 0);
}

sec("4. O CHÃO MUDA O REPERTÓRIO DE VERDADE");
{
  /* a prova que importa: rodar o sorteio em dois lugares e ver perfis
     diferentes. Uma tabela pode estar certa e não mudar nada no resultado. */
  const perfil = (bioma, n = 800) => {
    const conta = {};
    for (let i = 0; i < n; i++) {
      const a = escolherAssunto(garantirSituacao({
        emCidade: true, momento: 0.5, pessoaNaCena: true, porte: "vila", bioma,
        temGenteConhecida: true, temPassado: true, gentePorPerto: 2, genteLonge: 2, diasAteVizinha: 2,
      }), { sorte: () => (i * 0.0173 + i * i * 0.00041) % 1 });
      if (a) conta[a.id] = (conta[a.id] || 0) + 1;
    }
    return conta;
  };
  const des = perfil("deserto"), cos = perfil("costa");
  t("o deserto sorteia a sede", (des.sede || 0) > 0);
  t("e a costa não", !(cos.sede || 0));
  t("a costa sorteia a maré", (cos.mare || 0) > 0);
  t("e o deserto não", !(des.mare || 0));
  const soDes = Object.keys(des).filter((k) => !cos[k]);
  const soCos = Object.keys(cos).filter((k) => !des[k]);
  t(`os dois lugares têm assuntos exclusivos (${soDes.length} e ${soCos.length})`, soDes.length >= 2 && soCos.length >= 2);
}

sec("5. A ENTREGA");
{
  const bib = fs.readFileSync("../src/biblioteca.js", "utf8");
  const app = fs.readFileSync("../src/App.jsx", "utf8");
  t("a situação normaliza o bioma", /bioma: t\("bioma"\) \|\| ""/.test(bib));
  /* e a razão de ele ter voltado fica escrita, para ninguém achar que a
     remoção da v9.93 foi um engano */
  t("com a história dele escrita", /removido na\s*\r?\n\s*v9\.93 por ter nascido sem leitor/.test(bib));
  t("o App entrega o bioma da cidade", /bioma: \(aqui && aqui\.bioma\)/.test(app));
  const ass = fs.readFileSync("../src/assuntos.js", "utf8");
  t("há uma régua do chão, num lugar só", (ass.match(/const chao = /g) || []).length === 1);
  t("e ela não passa com bioma vazio", /quais\.includes\(String\(s\.bioma \|\| ""\)\)/.test(ass));
}

console.log(`\nchão v9.94: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
