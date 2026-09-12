/* O LIVRO DE PROMESSAS (v9.199) — primeiro órgão do diretor de histórias

   O Livro é conta pura, e é exatamente o tipo de conta que erra em
   silêncio: uma catraca frouxa não quebra nada — só deixa a reviravolta
   sair do nada, ou o fio solto sumir sem o jogador ver. Por isso esta
   suíte prova as DUAS direções da catraca contra casos concretos, e não
   só que as funções devolvem alguma coisa. */

const RAIZ = "../src/";
const P = await import(RAIZ + "promessas.js");
const { readFileSync } = await import("node:fs");
const semComentarios = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(readFileSync("../src/App.jsx", "utf8"));

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. as 39 formas, completas e sãs");
{
  t("são 39 formas", P.FORMAS_DE_SEMENTE.length === 39, String(P.FORMAS_DE_SEMENTE.length));
  const cont = {};
  for (const f of P.FORMAS_DE_SEMENTE) cont[f.categoria] = (cont[f.categoria] || 0) + 1;
  t("a divisão do documento: 10/8/7/5/5/4",
    cont.objeto === 10 && cont.fala === 8 && cont.cenario === 7 && cont.ausencia === 5 && cont.comportamento === 5 && cont.documento === 4,
    JSON.stringify(cont));
  t("toda categoria da lista existe", P.CATEGORIAS.every((c) => cont[c] > 0));
  t("nenhuma categoria fora da lista", Object.keys(cont).every((c) => P.CATEGORIAS.includes(c)));
  t("ids únicos", new Set(P.FORMAS_DE_SEMENTE.map((f) => f.id)).size === 39);
  t("toda forma tem material e leitura", P.FORMAS_DE_SEMENTE.every((f) => f.comoAparece && f.pagaComo));
  t("formaPorId acha e erra direito", P.formaPorId("brasao_limado") && !P.formaPorId("nao_existe"));
  t("formasPorCategoria filtra", P.formasPorCategoria("documento").length === 4);
}

sec("2. os pesos: a mesma escada dos dois lados");
{
  t("três pesos", Object.keys(P.PESOS).length === 3);
  t("regas para madurar: leve 1, médio 2, pesado 3",
    P.regasParaMadurar("leve") === 1 && P.regasParaMadurar("medio") === 2 && P.regasParaMadurar("pesado") === 3);
  t("maduras para colher segue os mesmos números",
    P.madurasParaColher("leve") === 1 && P.madurasParaColher("pesado") === 3);
  t("peso inválido cai em médio", P.regasParaMadurar("gigante") === 2 && P.madurasParaColher("") === 2);
  t("pesoValido separa o joio", P.pesoValido("leve") && !P.pesoValido("colossal"));
  t("estadoValido conhece os cinco", P.ESTADOS.length === 5 && P.estadoValido("murcha") && !P.estadoValido("viva"));
}

sec("3. garantirLivro: a forma nasce inteira do nada e do lixo");
{
  const vazio = P.garantirLivro(null);
  t("null vira livro vazio", Array.isArray(vazio.sementes) && vazio.sementes.length === 0 && vazio.proxId >= 1);
  t("undefined também", P.garantirLivro(undefined).sementes.length === 0);
  /* semente de forma que não existe mais é ruído — cai fora */
  const sujo = P.garantirLivro({ sementes: [{ forma: "forma_fantasma", id: 5 }, { forma: "brasao_limado", id: 3 }] });
  t("semente de forma inexistente é descartada", sujo.sementes.length === 1 && sujo.sementes[0].forma === "brasao_limado");
  /* proxId nunca recua abaixo do maior id vivo */
  t("proxId anda à frente do maior id", sujo.proxId > 3);
  const rega = P.garantirLivro({ sementes: [{ forma: "brasao_limado", id: 1, regas: [{ dia: 2 }] }] });
  t("regas malformadas são saneadas", rega.sementes[0].regas[0].dia === 2 && rega.sementes[0].regas[0].cena === "");
}

sec("4. o ciclo: semear → regar → madura, sem muta­ção no lugar");
{
  let L = P.garantirLivro(null);
  const r1 = P.semear(L, { forma: "moeda_estrangeira", dona: "compasso", ato: 1, peso: "pesado", dia: 3 });
  t("semear devolve livro novo e a semente", r1.livro.sementes.length === 1 && r1.semente.id >= 1);
  t("não mutou o livro que entrou (imutável)", L.sementes.length === 0);
  t("nasce semeada", r1.semente.estado === "semeada");
  t("o material cai para o texto da forma quando não dado", r1.semente.material === P.formaPorId("moeda_estrangeira").comoAparece);
  t("semear forma inexistente não cria nada", P.semear(L, { forma: "xyz" }).semente === null);

  L = r1.livro;
  const id = r1.semente.id;
  L = P.regar(L, id, { dia: 4, cena: "no covil" }).livro;
  t("uma rega num pesado ainda não amadurece", P.sementePorId(L, id).estado === "regada");
  L = P.regar(L, id, { dia: 5 }).livro;
  t("duas regas, ainda regada (pesado pede três)", P.sementePorId(L, id).estado === "regada");
  L = P.regar(L, id, { dia: 6 }).livro;
  t("três regas amadurecem o pesado", P.estaMadura(P.sementePorId(L, id)));
  const semMudar = P.regar(L, 999, {});
  t("regar id inexistente não muda nada", semMudar.mudou === false);
}

sec("5. catraca ①: colher exige maturidade");
{
  let L = P.garantirLivro(null);
  /* um leve amadurece com uma rega */
  const s = P.semear(L, { forma: "aviso_do_bebado", peso: "leve", dona: "vilao" });
  L = s.livro; L = P.regar(L, s.semente.id, { dia: 1 }).livro;
  t("um leve maduro já pode colher leve", P.podeColher(L, { peso: "leve" }));
  t("mas não basta para um pesado", !P.podeColher(L, { peso: "pesado" }));

  /* pagar só de madura */
  const pagaCedo = P.pagar(P.garantirLivro(null), 1, { dia: 1 });
  t("não se paga o que não existe", pagaCedo.pagou === false);
  const sememadura = P.semear(P.garantirLivro(null), { forma: "chave_sem_porta", peso: "leve" });
  t("não se paga semente ainda não madura", P.pagar(sememadura.livro, sememadura.semente.id, {}).pagou === false);

  /* filtro por dona e alvo */
  let M = P.garantirLivro(null);
  for (let i = 0; i < 3; i++) { const x = P.semear(M, { forma: "elogio_que_vigia", peso: "leve", dona: "vilao", alvo: "Sarna" }); M = P.regar(x.livro, x.semente.id, { dia: i }).livro; }
  t("três maduras do vilão colhem uma reviravolta pesada", P.podeColher(M, { peso: "pesado", dona: "vilao" }));
  t("mas não se o alvo é outro", !P.podeColher(M, { peso: "pesado", dona: "vilao", alvo: "Outro" }));
  t("sementesMaduras conta certo", P.sementesMaduras(M, { dona: "vilao" }).length === 3);
}

sec("6. pagar liga os pontos, e o diário recebe a leitura");
{
  let L = P.garantirLivro(null);
  const s = P.semear(L, { forma: "retrato_medalhao", peso: "leve", ato: 2 });
  L = P.regar(s.livro, s.semente.id, { dia: 1 }).livro;
  const pg = P.pagar(L, s.semente.id, { dia: 9, colheita: "era a irmã do vilão" });
  t("pagou uma madura", pg.pagou === true);
  const paga = P.sementePorId(pg.livro, s.semente.id);
  t("estado vira paga", paga.estado === "paga");
  t("guarda o dia e a colheita", paga.pagaEm === 9 && paga.colheita === "era a irmã do vilão");
  /* colheita vazia cai para a leitura da forma */
  let L2 = P.garantirLivro(null);
  const s2 = P.semear(L2, { forma: "nome_na_lamina", peso: "leve" });
  L2 = P.regar(s2.livro, s2.semente.id, {}).livro;
  const pg2 = P.pagar(L2, s2.semente.id, { dia: 1 });
  t("colheita vazia usa a leitura da forma", P.sementePorId(pg2.livro, s2.semente.id).colheita === P.formaPorId("nome_na_lamina").pagaComo);
}

sec("7. catraca ②: fechar o ato não esquece nada");
{
  let L = P.garantirLivro(null);
  /* ato 1: uma paga, uma no meio do caminho, uma nem regada */
  const a = P.semear(L, { forma: "cova_sem_nome", peso: "leve", ato: 1 }); L = a.livro;
  L = P.regar(L, a.semente.id, { dia: 1 }).livro;
  L = P.pagar(L, a.semente.id, { dia: 2 }).livro;
  const b = P.semear(L, { forma: "fumaca_na_ruina", peso: "medio", ato: 1 }); L = b.livro;
  L = P.regar(L, b.semente.id, { dia: 1 }).livro;
  const c = P.semear(L, { forma: "sino_fora_de_hora", peso: "leve", ato: 1 }); L = c.livro;
  /* uma semente de outro ato não pode ser varrida junto */
  const d = P.semear(L, { forma: "posto_sem_guarda", peso: "leve", ato: 2 }); L = d.livro;
  /* e uma da campanha inteira (ato 0) nunca murcha por fechar ato */
  const e = P.semear(L, { forma: "chave_sem_porta", peso: "leve", ato: 0 }); L = e.livro;

  const fecho = P.fecharAto(L, 1, { dia: 10 });
  t("murchou exatamente as duas não-pagas do ato 1", fecho.murchou.length === 2);
  L = fecho.livro;
  t("a paga continua paga", P.sementePorId(L, a.semente.id).estado === "paga");
  t("a regada murchou", P.sementePorId(L, b.semente.id).estado === "murcha");
  t("a semeada murchou", P.sementePorId(L, c.semente.id).estado === "murcha");
  t("o ato 2 ficou intacto", P.sementePorId(L, d.semente.id).estado === "semeada");
  t("a semente de campanha (ato 0) nunca é varrida", P.sementePorId(L, e.semente.id).estado === "semeada");

  const fios = P.fiosSoltos(L);
  t("os dois fios soltos aparecem para o diário", fios.length === 2);
  t("o fio solto carrega o material, não a conclusão", fios.every((x) => x.texto && x.era));
  /* fechar de novo o mesmo ato não re-murcha nem quebra */
  t("fechar ato já fechado é inócuo", P.fecharAto(L, 1, {}).murchou.length === 0);
}

sec("8. o envelope planta sem entregar o segredo");
{
  let L = P.garantirLivro(null);
  const s = P.semear(L, { forma: "preco_estranho", peso: "medio", material: "compram todo o salitre da região" });
  L = s.livro;
  const env = P.envelopeDoLivro(L);
  t("o envelope traz o material", env.includes("salitre"));
  t("o envelope NUNCA traz a conclusão (pagaComo)", !env.includes(P.formaPorId("preco_estranho").pagaComo));
  t("o envelope avisa o Narrador que nem ele sabe", /nem você sabe|não deve notar/i.test(env));
  /* semente paga não volta ao envelope */
  let L2 = P.regar(L, s.semente.id, { dia: 1 }).livro;
  L2 = P.regar(L2, s.semente.id, { dia: 2 }).livro;
  L2 = P.pagar(L2, s.semente.id, { dia: 3 }).livro;
  t("semente paga sai do envelope", P.envelopeDoLivro(L2) === "");
  t("livro vazio dá envelope vazio", P.envelopeDoLivro(P.garantirLivro(null)) === "");
  /* o teto respeita o orçamento da pauta */
  let M = P.garantirLivro(null);
  for (let i = 0; i < 5; i++) M = P.semear(M, { forma: "janela_as_pressas", peso: "leve" }).livro;
  t("o envelope corta pelo teto", P.envelopeDoLivro(M, { teto: 2 }).split("\n").length <= 3);
}

sec("9. o resumo é forma, não conteúdo");
{
  let L = P.garantirLivro(null);
  const s = P.semear(L, { forma: "duas_cronicas", peso: "leve", material: "as duas crônicas do cerco discordam" });
  L = P.regar(s.livro, s.semente.id, { dia: 1 }).livro;
  const r = P.resumoDoLivro(L);
  t("conta os estados", r.total === 1 && r.maduras === 1);
  t("o resumo não vaza material", !JSON.stringify(r).includes("cerco"));
  t("sementesPorDona e sementesDoAto respondem", P.sementesPorDona(L, "sistema").length === 1 && P.sementesDoAto(L, 0).length === 1);
}

sec("10. o Livro está ligado ao jogo");
{
  t("o App importa o Livro", /from "\.\/promessas\.js"/.test(APP));
  t("há um ref do Livro no App", /promessasRef/.test(APP));
  t("o Livro entra no save", /promessas:\s*promessasRef\.current/.test(APP));
  t("o Livro é lido do save", /garantirLivro\(sv\.promessas\)/.test(APP));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
