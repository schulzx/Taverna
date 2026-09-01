/* teste-capitulo.mjs (v9.84) — o arco casa com o vilão, e o fim dele
   fecha o capítulo.

   "Case esse sistema com o sistema de arcos, e não deixe nada visível,
   não queremos nenhum spoiler. A única coisa visível é o tipo de história
   que o player escolheu. O sistema de vilão deve ser tão bem elaborado
   que o fim do arco dele será o fim do capítulo."

   Duas metades: o CASAMENTO (a fase do vilão é o momento do arco) e o
   SILÊNCIO (nome de etapa não aparece em lugar nenhum — nem na tela, nem
   no prompt, nem no console de autor). */
import {
  ESTRUTURAS, estruturaPorId, garantirHistoria, resumoHistoria, podeVirar, virarEtapa,
  tetoSemVilao, etapaDoVilao, casarComVilao, capituloFechado, fecharCapitulo, abrirCapitulo,
  linhaDoCapitulo, envelopeDoCapitulo, temAntagonista,
} from "../src/historia.js";
import { FASES, gerarVilao, avancarPlano, DIAS_POR_PASSO, TOTAL_DE_PASSOS, faseDe } from "../src/vilao.js";
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

sec("1. O CASAMENTO — a fase do vilão é o momento do arco");
{
  for (const est of ESTRUTURAS) {
    const mapa = FASES.map((f) => etapaDoVilao(est, f.ordem));
    t(`${est.nome}: começa no primeiro momento`, mapa[0] === 0);
    t(`${est.nome}: a queda do vilão é o último`, mapa[5] === est.etapas.length - 1);
    t(`${est.nome}: nunca anda para trás`, mapa.every((v, i) => i === 0 || v >= mapa[i - 1]));
  }

  const h = garantirHistoria({ estrutura: "jornada" });
  t("a fase 0 não move nada", casarComVilao(h, 0).virou === false);
  const c3 = casarComVilao(h, 3);
  t("a revelação leva o arco adiante", c3.virou === true && c3.historia.etapa === 3);
  t("e a virada tem causa registrada", c3.porVilao === true);
  /* NUNCA PARA TRÁS: se os marcos já tinham levado a história adiante, ela
     fica onde está — o vilão empurra, não puxa. */
  t("um arco à frente não recua", casarComVilao({ estrutura: "jornada", etapa: 5 }, 2).virou === false);
}

sec("2. SEM VILÃO, A HISTÓRIA NÃO PASSA DA METADE");
{
  /* Era um termômetro de atividade: um jogador que fizesse vinte favores
     pequenos chegava ao momento mais escuro sem nunca ter tido contra
     quem. A regra 2 já protegia o último momento; agora vale para a
     segunda metade inteira. */
  for (const est of ESTRUTURAS) {
    const teto = tetoSemVilao(est);
    t(`${est.nome}: o teto sem antagonista é ${teto}`, teto >= 1 && teto < est.etapas.length - 1);
    const preso = podeVirar({ estrutura: est.id, etapa: teto, marcos: 999 }, {});
    t(`${est.nome}: no teto, a contagem não passa`, preso.pode === false);
    t(`${est.nome}: e o motivo é a falta de antagonista`, /não tem contra quem acontecer/.test(preso.motivo));
    t(`${est.nome}: com vilão, passa`, podeVirar({ estrutura: est.id, etapa: teto, marcos: 999 }, { nemesis: "Sarna" }).pode === true);
  }
  /* mas o começo continua andando por marcos: o piso de 1 existe porque o
     começo de uma campanha É feito de andar, e o vilão só nasce com fama */
  t("o primeiro momento sempre vira por marcos",
    ESTRUTURAS.every((e) => podeVirar({ estrutura: e.id, etapa: 0, marcos: 999 }, {}).pode === true));
}

sec("3. NADA VISÍVEL — nem na tela, nem no prompt, nem no console");
{
  const txt = resumoHistoria({ estrutura: "jornada", etapa: 3 }, { nemesis: "Sarna" });
  /* uma IA que sabe que está no "Abismo" escreve como quem sabe: anuncia o
     tom, antecipa a queda, escolhe as palavras do rótulo. O vazamento não
     é dizer o nome — é escrever a etiqueta em vez da cena. */
  t("o nome da etapa não vai ao Mestre", !/O Abismo/.test(txt));
  t("mas a direção vai inteira", /momento mais escuro/.test(txt));
  t("e o tipo de história vai, que é o que ele precisa", /Jornada do Herói/.test(txt));
  t("continua proibido contar ao jogador", /NUNCA diga ao jogador em que momento/.test(txt));
  t("e continua proibido avançar o arco", /você NÃO avança o arco/.test(txt));

  /* A TELA DE CRIAÇÃO listava o arco inteiro — "O CHAMADO → A TRAVESSIA →
     PROVAÇÕES → O ABISMO → …" — antes de o jogador escrever o nome do
     personagem. Ele já sabia que ia haver um abismo, e mais ou menos
     quando. */
  const app = fs.readFileSync("../src/App.jsx", "utf8");
  t("a tela de criação não lista mais as etapas", !/e\.etapas\.map\(\(x\) => x\.nome\)/.test(app));
  t("nem o console de autor nomeia a etapa", !/est\.etapas\[h\.etapa\]\.nome/.test(app));
  /* E A DESCRIÇÃO DA ESTRUTURA também enumerava as batidas: "o chamado, as
     provações, o abismo e o retorno transformado" é a mesma lista, em
     prosa, na primeira tela do jogo. O que o jogador escolhe é o TIPO de
     história — o que ela promete de experiência, não a ordem dos beats. */
  const nomesDeEtapa = ESTRUTURAS.flatMap((e) => e.etapas.map((x) => x.nome.toLowerCase().replace(/^(o|a|as|os) /, "")));
  for (const e of ESTRUTURAS) {
    const d = e.desc.toLowerCase();
    t(`${e.nome}: a descrição não enumera as batidas`, !nomesDeEtapa.some((n) => d.includes(n)));
  }
  /* e o último momento não pode PEDIR um novo arco: o envelope do capítulo
     proíbe perguntar, e duas ordens opostas no mesmo prompt é a forma exata
     do bug que esta casa mais repete */
  for (const e of ESTRUTURAS) {
    const u = e.etapas[e.etapas.length - 1].instrucao;
    /* o `(?<!não )` importa: "não ofereça um novo caso" contém "ofereça um
       novo caso", e um teste que ignora isso reprova justamente a linha que
       conserta o problema — foi o que aconteceu na primeira rodada */
    t(`${e.nome}: o fim não pede um novo arco`, !/(?<!não )(pergunte se o jogador|convite a um novo|ofere[cç]a um novo)/.test(u));
  }

  const diario = fs.readFileSync("../src/painel-diario.jsx", "utf8");
  t("o diário mostra só o tipo de história", /\{est\.nome\}/.test(diario) && !/etapas\.map/.test(diario.split("Arco da campanha")[1] || ""));
}

sec("4. O FIM DO ARCO DELE É O FIM DO CAPÍTULO");
{
  const h = garantirHistoria({ estrutura: "jornada" });
  /* as duas coisas têm de se encontrar: o vilão caiu E o arco chegou ao
     último momento. Uma sem a outra não fecha nada. */
  t("vilão caído no meio não fecha", capituloFechado(h, true) === false);
  const noFim = casarComVilao(h, 5).historia;
  t("arco no fim sem o vilão caído não fecha", capituloFechado(noFim, false) === false);
  t("os dois juntos fecham", capituloFechado(noFim, true) === true);

  const fc = fecharCapitulo(noFim, { vilao: { nome: "Sarna", titulo: "O Arquiteto" }, dia: 80, causa: "espada no peito" });
  t("o capítulo entra na lista", fc.historia.capitulos.length === 1);
  t("com o nome do vilão", fc.registro.vilao === "Sarna");
  t("e o dia em que fechou", fc.registro.fechadoEm === 80);
  t("a linha do jogador é uma só, sem etapa nenhuma", linhaDoCapitulo(fc.registro) === "📖 Fim do capítulo 1.");

  const env = envelopeDoCapitulo(fc.registro);
  /* EPÍLOGO, não resumo — e a porta do próximo capítulo fica fechada até o
     jogador querer abri-la */
  t("o envelope pede epílogo", /narre um EPÍLOGO, não um resumo/.test(env));
  t("proíbe anunciar o próximo vilão", /NÃO anuncie um novo vilão/.test(env));
  t("proíbe dizer a palavra capítulo", /NÃO diga a palavra "capítulo"/.test(env));
  t("e proíbe perguntar o que fazer agora", /NÃO pergunte o que ele quer fazer agora/.test(env));
}

sec("5. A PORTA DO PRÓXIMO CAPÍTULO");
{
  const h = garantirHistoria({ estrutura: "jornada" });
  t("toda campanha começa no capítulo 1", h.capitulo === 1);
  const fc = fecharCapitulo(casarComVilao(h, 5).historia, { vilao: { nome: "Sarna" }, dia: 80 });
  const novo = abrirCapitulo(fc.historia);
  t("o próximo é o dois", novo.capitulo === 2);
  t("e volta ao primeiro momento", novo.etapa === 0);
  t("sem marcos herdados", novo.marcos === 0 && novo.feitos.length === 0);
  /* O MUNDO FICA: o que reinicia é a espinha dramática. O capítulo
     anterior continua registrado, e é dele que a crônica vai falar. */
  t("o capítulo anterior fica na memória", novo.capitulos.length === 1 && novo.capitulos[0].vilao === "Sarna");
  t("dá para trocar a estrutura no capítulo novo", abrirCapitulo(fc.historia, { estrutura: "misterio" }).estrutura === "misterio");
  t("e manter a mesma se não pedir", novo.estrutura === "jornada");
  t("save sem capítulo vira capítulo 1", garantirHistoria({ estrutura: "jornada", etapa: 2 }).capitulo === 1);
}

sec("6. a campanha inteira, do rumor ao epílogo");
{
  let v = gerarVilao({ nome: "Sarna", cont: {}, dia: 0, sorte: () => 0.5 });
  let h = garantirHistoria({ estrutura: "jornada" });
  const viradas = [];
  for (let i = 1; i < TOTAL_DE_PASSOS; i++) {
    const r = avancarPlano(v, { dia: i * DIAS_POR_PASSO, alvo: null });
    v = r.vilao;
    const c = casarComVilao(h, r.fase.ordem);
    if (c.virou) { h = c.historia; viradas.push(`${r.fase.id}→${c.para.nome}`); }
  }
  t("o arco percorreu a estrutura inteira", h.etapa === estruturaPorId("jornada").etapas.length - 1);
  t("e virou uma vez por fase do vilão", viradas.length === 5);
  t("quando o vilão cai, o capítulo fecha", capituloFechado(h, true) === true);
  console.log("      " + viradas.join(" · "));
}

console.log(`\ncapítulo v9.84: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
