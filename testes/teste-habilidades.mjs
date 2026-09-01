/* teste-habilidades.mjs (v9.47) — as quatro que pediam mecânica própria,
   mais a Contramágica, que virou reação.                                 */
import {
  metamagiaDe, armarMetamagia, consumirMetamagia, alcanceComMetamagia, ehGemea,
  FORMAS, formaDe, assumirForma, desfazerForma, expirarForma, estaEmForma,
  danoDaForma, magiaTravadaPelaForma, reerguerDe, reerguer,
  ehReescrever, reescreverInstante,
} from "../src/habilidades.js";
import { REACOES, escolherReacao, resolverReacao, reacoesDe } from "../src/reacoes.js";
import { CLASSES } from "../src/classes.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

/* pega a habilidade REAL do catálogo — o teste tem de falhar se alguém
   reescrever a descrição sem reescrever a regra */
const doCatalogo = (nome) => {
  for (const c of CLASSES) { const h = (c.habilidades || []).find((x) => x.nome === nome); if (h) return h; }
  return null;
};
const heroi = (extra = {}) => ({ nome: "Orin", classe: "Mago", nivel: 8, vida: 40, vidaMax: 40, mana: 20, manaMax: 20, grupo: [], habilidades: [], ...extra });

sec("1. metamagia — a promessa sobre a próxima magia");
{
  const alc = doCatalogo("Metamagia: Alcance");
  const gem = doCatalogo("Metamagia: Gêmea");
  t("as duas existem no catálogo", !!alc && !!gem);
  t("Alcance é reconhecida", (metamagiaDe(alc) || {}).tipo === "alcance");
  t("Gêmea é reconhecida", (metamagiaDe(gem) || {}).tipo === "gemea");
  t("Bola de Fogo não é metamagia", !metamagiaDe({ nome: "Bola de Fogo", descricao: "Explosão de chamas." }));

  let p = armarMetamagia(heroi(), metamagiaDe(alc));
  t("fica armada na ficha", p.metamagia.tipo === "alcance");
  const c1 = consumirMetamagia(p);
  t("consome uma vez", c1.meta.tipo === "alcance");
  t("e some da ficha", !c1.pers.metamagia);
  t("a segunda magia não recebe nada", consumirMetamagia(c1.pers).meta === null);

  t("Alcance dobra o alcance", alcanceComMetamagia(18, { tipo: "alcance" }) === 36);
  t("sem metamagia, alcance intacto", alcanceComMetamagia(18, null) === 18);
  t("Gêmea NÃO mexe no alcance", alcanceComMetamagia(18, { tipo: "gemea" }) === 18);
  t("ehGemea distingue as duas", ehGemea({ tipo: "gemea" }) && !ehGemea({ tipo: "alcance" }));
}

sec("2. as formas — o corpo trocado");
{
  const fa = doCatalogo("Forma Animal");
  const fan = doCatalogo("Forma Ancestral");
  t("as duas existem no catálogo", !!fa && !!fan);
  t("Forma Animal é reconhecida", (formaDe(fa) || {}).id === "animal");
  t("Forma Ancestral é reconhecida", (formaDe(fan) || {}).id === "ancestral");
  t("todo molde tem prazo e fôlego", FORMAS.every((f) => f.turnos > 0 && f.pvBonus > 0));

  const base = heroi({ vida: 30, vidaMax: 40 });
  const r = assumirForma(base, fa, 1);
  t("assume a forma", r.ok && estaEmForma(r.pers));
  t("o teto de PV sobe", r.pers.vidaMax > 40);
  t("e o PV atual sobe junto (é um corpo novo)", r.pers.vida > 30);
  t("ganha golpe de bicho", danoDaForma(r.pers) > 0);
  t("e perde a conjuração", magiaTravadaPelaForma(r.pers));
  t("o prazo é 5 rodadas", r.pers.forma.ate === 6);
  t("não dá para virar bicho duas vezes", !assumirForma(r.pers, fa, 2).ok);

  t("na rodada 5 ainda é bicho", estaEmForma(expirarForma(r.pers, 5).pers));
  const fim = expirarForma(r.pers, 6);
  t("na rodada 6 volta ao corpo", !estaEmForma(fim.pers));
  t("o teto de PV desce de volta", fim.pers.vidaMax === 40);
  t("e o PV não fica acima do teto", fim.pers.vida <= fim.pers.vidaMax);
  t("o jogador lê a reversão", /se desfaz/.test(fim.linha));

  /* a ancestral é maior e NÃO tira a magia — é a forma do conjurador */
  const ra = assumirForma(heroi(), fan, 1);
  t("a ancestral dá mais fôlego que a animal", ra.pers.vidaMax > r.pers.vidaMax);
  t("e não trava a magia", !magiaTravadaPelaForma(ra.pers));

  t("quem não está em forma nenhuma não ganha dano", danoDaForma(heroi()) === 0);
  t("desfazer sem forma não quebra", desfazerForma(heroi()).linha === "");
  t("Golpe Poderoso não é forma", !formaDe({ nome: "Golpe Poderoso", descricao: "Dano dobrado." }));
}

sec("3. reerguer o caído");
{
  const rm = doCatalogo("Ressurreição Menor");
  const ue = doCatalogo("Última Estrofe");
  t("as duas existem no catálogo", !!rm && !!ue);
  t("Ressurreição Menor é reconhecida", !!reerguerDe(rm));
  t("Última Estrofe é reconhecida", !!reerguerDe(ue));
  t("Última Estrofe pega todos", reerguerDe(ue).todos === true);
  t("Ressurreição Menor pega um", reerguerDe(rm).todos === false);

  const caidos = heroi({ grupo: [
    { nome: "Ilse", vida: 0, vidaMax: 20 },
    { nome: "Bram", vida: 0, vidaMax: 30 },
    { nome: "Petra", vida: 12, vidaMax: 20 },
  ] });
  const um = reerguer(caidos, rm);
  t("ergue um só", um.pers.grupo.filter((g) => g.vida > 0).length === 2);
  t("com uma fração do PV", um.pers.grupo[0].vida === 5);
  t("e não é mais moribundo", um.pers.grupo[0].morrendo === false);
  const todos = reerguer(caidos, ue);
  t("Última Estrofe ergue os dois", todos.pers.grupo.every((g) => g.vida > 0));
  t("quem estava de pé não é mexido", todos.pers.grupo[2].vida === 12);
  t("sem ninguém caído, recusa com motivo", !reerguer(heroi({ grupo: [{ nome: "Ilse", vida: 10, vidaMax: 20 }] }), rm).ok);
  t("habilidade que não reergue devolve null", reerguer(caidos, { nome: "Bola de Fogo", descricao: "chamas" }) === null);
}

sec("4. reescrever o instante");
{
  const h = doCatalogo("Reescrever o Instante");
  t("existe no catálogo", !!h);
  t("é reconhecida", ehReescrever(h));
  t("outra utilidade não é", !ehReescrever({ nome: "Ler Auras", descricao: "Revela intenções." }));

  const ferido = heroi({ vida: 12, vidaMax: 40 });
  const r = reescreverInstante(ferido, 15);
  t("devolve o dano da última rodada", r.ok && r.pers.vida === 27);
  t("sem dano na última rodada, recusa", !reescreverInstante(ferido, 0).ok);
  t("não passa do teto", reescreverInstante(heroi({ vida: 38, vidaMax: 40 }), 15).pers.vida === 40);
  const caido = heroi({ vida: 0, vidaMax: 40, morrendo: true, morte: { sucessos: 1, falhas: 2 } });
  const volta = reescreverInstante(caido, 20);
  t("tira o herói do chão", volta.pers.vida === 20 && volta.pers.morrendo === false);
  t("e zera os testes de morte", volta.pers.morte.falhas === 0);
  t("o Mestre é avisado de que só o corpo esqueceu", /inimigos N[ÃA]O esquecem/.test(volta.nota));
}

sec("5. contramágica virou reação");
{
  const cm = REACOES.find((r) => r.id === "contramagia");
  t("existe no catálogo de reações", !!cm);
  t("cancela o golpe inteiro", cm.corta === 1);
  t("e custa PM", cm.pm > 0);

  const mago = heroi({ classe: "Mago", habilidades: [{ nome: "Contramágica", descricao: "Cancela a magia de um inimigo." }] });
  t("quem tem a habilidade tem a reação", reacoesDe(mago).some((r) => r.id === "contramagia"));
  const contraMagia = escolherReacao({ pers: mago, gatilho: "sofre_dano", dano: 14, tipoDano: "fogo" });
  t("morde um golpe mágico", contraMagia && contraMagia.id === "contramagia");
  const contraAco = escolherReacao({ pers: mago, gatilho: "sofre_dano", dano: 14, tipoDano: "fisico" });
  t("NÃO morde uma machadada", !contraAco || contraAco.id !== "contramagia");
  t("nem sem PM", !(escolherReacao({ pers: { ...mago, mana: 0 }, gatilho: "sofre_dano", dano: 14, tipoDano: "fogo" }) || {}).id?.includes("contramagia"));
  const res = resolverReacao(cm, { pers: mago, dano: 14, atacante: "Nigromante" });
  t("resolvida, o dano vira zero", res.danoFinal === 0);
  t("e o jogador vê o corte", /Contramágica/.test(res.texto));

  const guerreiro = heroi({ classe: "Guerreiro", habilidades: [] });
  t("guerreiro sem a habilidade não contramagia", !reacoesDe(guerreiro).some((r) => r.id === "contramagia"));
}

console.log(`\nhabilidades v9.47: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
