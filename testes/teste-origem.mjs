/* teste-origem.mjs (v9.44) — o que era só texto agora é número.

   Duas famílias, o mesmo defeito: raças e profissões anunciavam vantagem
   mecânica na tela de criação e nenhuma linha de código as lia. Este arquivo
   cobra as duas, e cobra também a regra que as une: a frase que o jogador lê
   tem de descrever o que o código faz.                                    */
import { RACAS, ORIGENS, PROFISSOES } from "../src/classes.js";
import {
  origemDe, efeitoDe, textoDoTraco, vantagemDeTraco, vantagemMentalDeTraco,
  imuneDeTraco, resisteDeTraco, reducaoDeTraco, iniciativaDeTraco,
  ignoraDificilPorTraco, oficioDeTraco, domDe, comDom,
  refazerDeTracoDisponivel, gastarRefazerDeTraco, sorteDisponivel, gastarSorte,
  pedraDisponivel, gastarPedra, firmeDisponivel, gastarFirme,
  repousarTracos, abrirCombateTracos, amortecerDano, resumoTracosPrompt,
} from "../src/tracos.js";
import {
  profissaoDe, bonusDeBancada, componentesExtras, bonusDeNavegacao,
  despojosExtras, bonusDeTeste, curaExtraDoHeroi, curaExtraDoGrupo,
  precoDeVenda, precoDeCompraPara, moedasDeEspolio, resumoProfissaoPrompt,
} from "../src/profissoes.js";
import { aplicarDescanso } from "../src/regras-jogo.js";
import { passoEfetivo } from "../src/movimento.js";
import { montarGrade, caminhar, alcancaveisDe } from "../src/grid.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const heroi = (extra = {}) => ({ nome: "Teste", raca: "Humano", classe: "Guerreiro", nivel: 3, vida: 20, vidaMax: 30, mana: 5, manaMax: 10, grupo: [], habilidades: [], condicoes: [], efeitos: [], ...extra });

/* ============ 1. NINGUÉM FICA SÓ NO PAPEL ============ */
sec("1. toda origem e toda profissão têm efeito");
for (const r of [...RACAS, ...ORIGENS]) {
  t(`${r.nome} tem traço e efeito`, !!r.traco && !!r.efeito && Object.keys(r.efeito).length > 0);
}
for (const p of PROFISSOES) {
  t(`${p.nome} tem benefício e efeito`, !!p.beneficio && !!p.efeito && Object.keys(p.efeito).length > 0);
}

/* ============ 2. OS PASSIVOS ============ */
sec("2. vantagem por atributo");
t("Elfo tem vantagem em percepção", vantagemDeTraco(heroi({ raca: "Elfo" }), "percepcao"));
t("e não em força", !vantagemDeTraco(heroi({ raca: "Elfo" }), "forca"));
t("Meio-elfo tem vantagem em presença", vantagemDeTraco(heroi({ raca: "Meio-elfo" }), "presenca"));
t("Vagante também vê o que vem (percepção)", vantagemDeTraco(heroi({ raca: "Vagante" }), "percepcao"));
t("Humano não tem vantagem de atributo", !vantagemDeTraco(heroi(), "percepcao"));
t("raça desconhecida não quebra nem concede", !vantagemDeTraco(heroi({ raca: "Draco-halfling" }), "percepcao"));

sec("3. mente, imunidade e resistência");
t("Gnomo resiste ao mental", vantagemMentalDeTraco(heroi({ raca: "Gnomo" })));
t("Sintético também", vantagemMentalDeTraco(heroi({ raca: "Sintético" })));
t("Guerreiro humano não", !vantagemMentalDeTraco(heroi()));
t("Sintético é imune a medo", imuneDeTraco(heroi({ raca: "Sintético" }), "amedrontado"));
t("e a encantamento", imuneDeTraco(heroi({ raca: "Sintético" }), "enfeiticado"));
t("mas não a veneno", !imuneDeTraco(heroi({ raca: "Sintético" }), "envenenado"));
t("Tiefling resiste a fogo", resisteDeTraco(heroi({ raca: "Tiefling" }), "fogo"));
t("Mutante resiste a veneno", resisteDeTraco(heroi({ raca: "Mutante" }), "veneno"));
t("Anão reduz 1 de veneno", reducaoDeTraco(heroi({ raca: "Anão" }), "veneno") === 1);
t("Anão reduz 1 de fogo", reducaoDeTraco(heroi({ raca: "Anão" }), "fogo") === 1);
t("Anão não reduz físico", reducaoDeTraco(heroi({ raca: "Anão" }), "fisico") === 0);
t("acento não atrapalha (Anao)", reducaoDeTraco(heroi({ raca: "Anao" }), "fogo") === 1);

sec("4. os números soltos");
t("Cromado ganha +5 de iniciativa", iniciativaDeTraco(heroi({ raca: "Cromado" })) === 5);
t("Terrano não ganha iniciativa", iniciativaDeTraco(heroi({ raca: "Terrano" })) === 0);
t("Colono Orbital ignora terreno difícil", ignoraDificilPorTraco(heroi({ raca: "Colono Orbital" })));
t("Cromado não", !ignoraDificilPorTraco(heroi({ raca: "Cromado" })));
t("Terrano melhora a bancada em 2", oficioDeTraco(heroi({ raca: "Terrano" })) === 2);

/* ============ 3. O DOM ============ */
sec("5. a habilidade que a origem entrega");
{
  const drac = comDom(heroi({ raca: "Draconato" }));
  t("Draconato nasce com o Sopro Ancestral", (drac.habilidades || []).some((h) => h.nome === "Sopro Ancestral"));
  t("e o sopro custa PM de verdade", (drac.habilidades || []).find((h) => h.nome === "Sopro Ancestral").custo === 3);
  t("aplicar duas vezes não duplica", comDom(drac).habilidades.length === drac.habilidades.length);
  const tief = comDom(heroi({ raca: "Tiefling" }));
  t("Tiefling nasce com a Chama Menor", (tief.habilidades || []).some((h) => h.nome === "Chama Menor"));
  t("Humano não ganha dom nenhum", comDom(heroi()).habilidades.length === 0);
  t("domDe devolve null para quem não tem", domDe(heroi()) === null);
  /* quem já aprendeu por outro caminho não ganha uma cópia */
  const jaTinha = comDom(heroi({ raca: "Draconato", habilidades: [{ nome: "Sopro Ancestral", custo: 9 }] }));
  t("não sobrescreve o que já está na ficha", jaTinha.habilidades.length === 1 && jaTinha.habilidades[0].custo === 9);
}

/* ============ 4. O QUE SE GASTA ============ */
sec("6. recursos: gastam, e voltam onde devem");
{
  let h = heroi({ raca: "Humano" });
  t("Humano começa com uma segunda chance", refazerDeTracoDisponivel(h) === 1);
  h = gastarRefazerDeTraco(h);
  t("gastou, acabou", refazerDeTracoDisponivel(h) === 0);
  t("o descanso curto devolve", refazerDeTracoDisponivel(repousarTracos(h, { longo: false })) === 1);

  let g = heroi({ raca: "Goliath" });
  t("Goliath tem a pele", pedraDisponivel(g));
  g = gastarPedra(g);
  t("gastou nesta luta", !pedraDisponivel(g));
  t("luta nova devolve", pedraDisponivel(abrirCombateTracos(g)));
  t("descanso também devolve", pedraDisponivel(repousarTracos(g, { longo: false })));

  let s = heroi({ raca: "Halfling" });
  t("Halfling tem a sorte", sorteDisponivel(s));
  s = gastarSorte(s);
  t("uma vez só", !sorteDisponivel(s));
  t("e volta na luta seguinte", sorteDisponivel(abrirCombateTracos(s)));

  let m = heroi({ raca: "Meio-orc" });
  t("Meio-orc aguenta no dia 3", firmeDisponivel(m, 3));
  m = gastarFirme(m, 3);
  t("não aguenta duas vezes no mesmo dia", !firmeDisponivel(m, 3));
  t("o descanso CURTO não devolve", !firmeDisponivel(repousarTracos(m, { longo: false }), 3));
  t("o descanso LONGO devolve", firmeDisponivel(repousarTracos(m, { longo: true }), 3));
  t("quem não é Meio-orc nunca tem", !firmeDisponivel(heroi(), 3));
}

/* ============ 5. O GOLPE QUE CHEGA ============ */
sec("7. amortecer: a ordem importa");
{
  const anao = heroi({ raca: "Anão" });
  t("Anão leva 9 de um golpe de fogo de 10", amortecerDano(anao, 10, "fogo").dano === 9);
  t("e 10 de um golpe físico de 10", amortecerDano(anao, 10, "fisico").dano === 10);
  t("dano 0 continua 0", amortecerDano(anao, 0, "fogo").dano === 0);

  const tief = heroi({ raca: "Tiefling" });
  const rT = amortecerDano(tief, 11, "fogo");
  t("Tiefling leva metade do fogo (11 → 5)", rT.dano === 5);
  t("e a linha explica ao jogador", rT.linhas.some((l) => /Resist/i.test(l)));
  t("gelo passa inteiro no Tiefling", amortecerDano(tief, 11, "gelo").dano === 11);

  const gol = heroi({ raca: "Goliath" });
  const r1 = amortecerDano(gol, 20, "fisico");
  t("Goliath corta o golpe pela metade (20 → 10)", r1.dano === 10);
  t("e o gasto fica na ficha que volta", !pedraDisponivel(r1.pers));
  const r2 = amortecerDano(r1.pers, 20, "fisico");
  t("o segundo golpe da mesma luta vem inteiro", r2.dano === 20);
  t("golpe pequeno não gasta a pele", pedraDisponivel(amortecerDano(gol, 3, "fisico").pers));

  t("quem não tem traço nenhum leva tudo", amortecerDano(heroi(), 13, "fogo").dano === 13);
  t("ficha nula não derruba a conta", amortecerDano(null, 5, "fogo").dano === 5);
}

/* ============ 6. O TERRENO DIFÍCIL ============ */
sec("8. ignorar terreno difícil chega ao tabuleiro");
{
  const p = passoEfetivo(heroi(), {});
  t("sem nada, o passo cobra o terreno", p.ignoraDificil === false);
  t("com a opção ligada, não cobra", passoEfetivo(heroi(), { ignoraDificil: true }).ignoraDificil === true);

  /* uma grade com uma faixa de terreno difícil entre o herói e o destino */
  const grade = montarGrade({ planta: "campo", largura: 12, altura: 12 });
  const de = { nome: "eu", x: 1, y: 1 };
  const destino = { x: 7, y: 1 };
  const semIgnorar = caminhar(grade, de, destino, { deslocamentoM: 9 });
  const comIgnorar = caminhar(grade, de, destino, { deslocamentoM: 9, ignoraDificil: true });
  t("caminhar aceita a opção sem quebrar", typeof comIgnorar === "object");
  t("ignorar nunca deixa o caminho MAIS caro", !semIgnorar.ok || !comIgnorar.ok || comIgnorar.custoM <= semIgnorar.custoM);
  const a1 = alcancaveisDe(grade, de, { deslocamentoM: 9 });
  const a2 = alcancaveisDe(grade, de, { deslocamentoM: 9, ignoraDificil: true });
  t("e alcança pelo menos tanto chão quanto antes", a2.size >= a1.size);
}

/* ============ 7. AS PROFISSÕES ============ */
sec("9. a bancada, o ermo e o balcão");
{
  const alq = heroi({ profissao: "Alquimista" });
  t("Alquimista facilita a alquimia em 3", bonusDeBancada(alq, "alquimia") === 3);
  t("e não facilita os utilitários", bonusDeBancada(alq, "utilitario") === 0);
  t("Ferreiro facilita os utilitários em 3", bonusDeBancada(heroi({ profissao: "Ferreiro" }), "utilitario") === 3);
  t("sem profissão, nada muda", bonusDeBancada(heroi(), "alquimia") === 0);
  t("profissão inventada não concede", bonusDeBancada(heroi({ profissao: "Domador de Nuvens" }), "alquimia") === 0);

  t("Herborista colhe 2 a mais", componentesExtras(heroi({ profissao: "Herborista" })) === 2);
  t("Minerador colhe 1 a mais", componentesExtras(heroi({ profissao: "Minerador" })) === 1);
  t("Cartógrafo soma 5 na navegação", bonusDeNavegacao(heroi({ profissao: "Cartógrafo" })) === 5);
  t("Curtidor tira 1 despojo a mais", despojosExtras(heroi({ profissao: "Curtidor" })) === 1);
  t("Escriba soma 2 em Intelecto", bonusDeTeste(heroi({ profissao: "Escriba" }), "intelecto") === 2);
  t("e nada em Presença", bonusDeTeste(heroi({ profissao: "Escriba" }), "presenca") === 0);
  t("Minerador soma 2 em Percepção", bonusDeTeste(heroi({ profissao: "Minerador" }), "percepcao") === 2);

  t("Joalheiro vende 100 por 125", precoDeVenda(heroi({ profissao: "Joalheiro" }), 100) === 125);
  t("Mercador vende 100 por 115", precoDeVenda(heroi({ profissao: "Mercador" }), 100) === 115);
  t("Mercador compra 100 por 80", precoDeCompraPara(heroi({ profissao: "Mercador" }), 100) === 80);
  t("quem não é mercador paga cheio", precoDeCompraPara(heroi(), 100) === 100);
  t("nenhum preço vira zero", precoDeCompraPara(heroi({ profissao: "Mercador" }), 1) >= 1);
  t("venda sem profissão não muda", precoDeVenda(heroi(), 37) === 37);
  t("Caçador de Recompensas leva +30% de espólio", moedasDeEspolio(heroi({ profissao: "Caçador de Recompensas" }), 100) === 130);
  t("espólio sem profissão não muda", moedasDeEspolio(heroi(), 21) === 21);
}

sec("10. o acampamento");
{
  const msgs = [];
  const med = heroi({ profissao: "Médico de Campo", vida: 10, vidaMax: 40, grupo: [{ nome: "Ilse", vida: 5, vidaMax: 20 }] });
  const antes = med.vida;
  const dep = aplicarDescanso(med, "curto", msgs, 4);
  t("Médico de Campo cura mais que o descanso normal", dep.vida > antes);
  t("e o jogador lê por quê", msgs.some((m) => /Médico de Campo/.test(m)));

  const msgs2 = [];
  const coz = heroi({ profissao: "Cozinheiro", vida: 30, vidaMax: 30, grupo: [{ nome: "Ilse", vida: 5, vidaMax: 20 }] });
  aplicarDescanso(coz, "longo", msgs2, 4);
  t("Cozinheiro alimenta o grupo no longo", msgs2.some((m) => /Cozinheiro/.test(m)));
  const msgs3 = [];
  aplicarDescanso(coz, "curto", msgs3, 4);
  /* o descanso curto já cura o grupo por conta própria; o que a profissão NÃO
     pode fazer é render uma refeição numa parada de uma hora — e é a linha
     do sistema, não o PV final, que distingue as duas coisas */
  t("mas não numa parada de uma hora", !msgs3.some((m) => /Cozinheiro/.test(m)));

  /* e o descanso devolve os traços gastos — a ponte entre os dois módulos */
  const msgs4 = [];
  const halfGasto = gastarSorte(heroi({ raca: "Halfling" }));
  t("descanso devolve a sorte do Halfling", sorteDisponivel(aplicarDescanso(halfGasto, "curto", msgs4, 4)));
}

sec("11. o que o Mestre lê");
{
  const el = heroi({ raca: "Elfo" });
  t("o resumo nomeia o traço", /Sentidos élficos/.test(resumoTracosPrompt(el)));
  t("e a raça", /Elfo/.test(resumoTracosPrompt(el)));
  t("quem não tem raça não gera linha", resumoTracosPrompt(heroi({ raca: "" })) === "");
  const gasto = gastarSorte(heroi({ raca: "Halfling" }));
  t("o Mestre sabe o que já foi gasto", /sorte pequena já foi gasta/.test(resumoTracosPrompt(gasto)));
  const jo = heroi({ profissao: "Joalheiro" });
  t("a profissão avisa que o sistema já aplicou", /o sistema já aplica/.test(resumoProfissaoPrompt(jo)));
  t("e não pede desconto ao Mestre", /nunca para conceder desconto/.test(resumoProfissaoPrompt(jo)));
  t("sem profissão não gera linha", resumoProfissaoPrompt(heroi()) === "");
  t("origemDe e profissaoDe concordam com as tabelas", origemDe(el).nome === "Elfo" && profissaoDe(jo).nome === "Joalheiro");
  t("textoDoTraco devolve a frase da tela", textoDoTraco(el) === origemDe(el).traco);
  t("efeitoDe de quem não tem é objeto vazio", Object.keys(efeitoDe(heroi({ raca: "" }))).length === 0);
}

console.log(`\norigem v9.44: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
