/* teste-vilao.mjs (v9.83) — a nêmesis deixa de ser um medidor de ódio.

   "O sistema nêmesis não será um gerador de inimigos, ele será o vilão.
   Ele não aparecerá mais na ficha do jogador — o jogador não precisa
   saber quem é seu nêmesis, porque quando o vilão aparecer, ele saberá,
   e não esquecerá."

   A asserção mais importante desta suíte é a da SEÇÃO 4: o nome não
   aparece antes da hora. É o único momento de uma campanha que não dá
   para refazer, e o sistema antigo o entregava na primeira página — uma
   linha na ficha, "🎭 nêmesis: Sarna · ódio 42", desde o primeiro dia. */
import {
  FASES, faseDe, proximaFase, ARQUETIPOS, arquetipoPorId, escolherArquetipo,
  PASSOS_DO_PLANO, TOTAL_DE_PASSOS, FASE_DO_PASSO, DIAS_POR_PASSO, diasDoPasso,
  gerarVilao, garantirVilao, podeAvancar, avancarPlano, escolherAlvo,
  linhaDoAvanco, envelopeDoAvanco, resumoVilaoPrompt,
  podeCair, envelopeDaQueda, envelopeDaQuedaCedoDemais, linhaDaQueda, ehCoerente,
} from "../src/vilao.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const CTX = { pessoas: ["Iris", "Doran"], lugares: ["Ponte do Sul"], promessas: ["A cabeça do lobo"] };
/* leva o vilão até um passo, respeitando a cadência de dias */
const ate = (passo, ctx = CTX) => {
  let v = gerarVilao({ nome: "Sarna", cont: {}, dia: 0, sorte: () => 0.5 });
  let dia = 0, ultimo = null;
  while (v.passo < passo) {
    dia += DIAS_POR_PASSO;
    const r = avancarPlano(v, { dia, alvo: escolherAlvo("gente", ctx, () => 0) });
    v = r.vilao; ultimo = r;
  }
  return { v, dia, ultimo };
};

sec("1. AS FASES — você sente antes de ver");
{
  t("são cinco degraus e mais a queda", FASES.length === 6);
  t("a ordem é crescente", FASES.every((f, i) => f.ordem === i));
  /* o que muda entre as fases NÃO é o quanto o vilão bate: é o quanto o
     jogador SABE. É essa escada que o medidor de ódio não tinha. */
  t("as três primeiras não podem dizer o nome", FASES.slice(0, 3).every((f) => f.podeDizerNome === false));
  t("e nelas ele não aparece", FASES.slice(0, 3).every((f) => f.podeAparecer === false));
  t("a revelação é uma só", FASES.filter((f) => f.revelacao).length === 1);
  t("e ela é o 'rosto'", FASES.find((f) => f.revelacao).id === "rosto");
  t("o final é um só", FASES.filter((f) => f.final).length === 1);
  for (const f of FASES) t(`a fase "${f.id}" diz por que existe`, f.porque.length > 40);
  t("proximaFase anda", proximaFase("rumor").id === "marca");
  t("e para no fim", proximaFase("queda").id === "queda");
}

sec("2. OS ARQUÉTIPOS — o vilão nasce de como VOCÊ jogou");
{
  t("há arquétipos", ARQUETIPOS.length >= 6);
  t("todos têm crença dizível", ARQUETIPOS.every((a) => a.crenca.length > 40));
  t("todos querem alguma coisa", ARQUETIPOS.every((a) => a.quer.length > 20));
  t("e todos têm método", ARQUETIPOS.every((a) => a.metodo.length > 20));
  t("cada um tem assinatura", ARQUETIPOS.every((a) => a.assinaturas.length >= 3));

  /* REGRA 5, O ESPELHO: o vilão de cada campanha é o retrato do jogador
     com um passo a mais. Quem resolveu tudo no aço atrai o Espelho; quem
     tomou cidades atrai o Herdeiro. */
  t("quem só lutou atrai o Espelho", escolherArquetipo({ inimigosDerrotados: 30 }, {}, () => 0.01).id === "espelho");
  t("quem tomou terras atrai o Herdeiro", escolherArquetipo({}, { dominios: 2 }, () => 0.5).id === "herdeiro");
  /* e sem registro nenhum sempre há um: o Arquiteto nasce de qualquer um */
  t("um herói sem história ainda tem vilão", !!escolherArquetipo({}, {}, () => 0.5));
  t("e é o Arquiteto", escolherArquetipo({}, {}, () => 0.5).id === "arquiteto");
}

sec("3. O PLANO — ele quer alguma coisa, e está ganhando");
{
  const v = gerarVilao({ nome: "Sarna", cont: {}, dia: 0, sorte: () => 0.5 });
  t("nasce no passo zero", v.passo === 0);
  t("e na fase do rumor", v.fase === "rumor");
  t("com um projeto", v.quer.length > 20);
  t("e uma assinatura", v.assinatura.length > 10);

  /* ANDA DEVAGAR DE PROPÓSITO: um vilão que se move todo dia é barulho,
     e barulho não assusta. */
  t("não anda no dia seguinte", podeAvancar(v, { dia: 1 }) === false);
  /* v9.107: a cadencia passou a depender do CORPO da ameaca -- um bando
     anda mais rapido, um conselho precisa concordar antes. 
     continua sendo o da pessoa, e  e quem sabe o resto. */
  t("anda depois da cadência do CORPO dela", podeAvancar(v, { dia: diasDoPasso(v) }) === true);
  t("e o corpo muda a cadência", diasDoPasso({ corpo: "bando" }) < DIAS_POR_PASSO && diasDoPasso({ corpo: "conselho" }) > DIAS_POR_PASSO);

  const r = avancarPlano(v, { dia: 6, alvo: { campo: "pessoas", nome: "Iris" } });
  t("o passo anda", r.vilao.passo === 1);
  t("e o passo tira alguma coisa", r.passo.custa.length > 0);
  t("a marca fica registrada", r.vilao.marcas.length === 1 && r.vilao.marcas[0].nome === "Iris");

  /* o plano chega ao fim mesmo se o herói nunca interferir */
  const fim = ate(TOTAL_DE_PASSOS - 1);
  t("o plano chega ao fim sozinho", fim.v.passo === TOTAL_DE_PASSOS - 1);
  t("e o fim é a queda", fim.v.fase === "queda");
  t("não anda além do fim", podeAvancar(fim.v, { dia: 999 }) === false);
  t("todo passo tem custo declarado", PASSOS_DO_PLANO.every((p) => p.custa && p.diz));
  t("o mapa de fases cobre os passos", FASE_DO_PASSO.length === TOTAL_DE_PASSOS);
}

sec("4. O NOME NÃO APARECE ANTES DA HORA — a asserção que importa");
{
  /* o único momento de uma campanha que não dá para refazer */
  for (let passo = 0; passo < TOTAL_DE_PASSOS; passo++) {
    const { v } = ate(passo);
    const f = faseDe(v.fase);
    const resumo = resumoVilaoPrompt(v);
    if (f.ordem < 3) {
      t(`passo ${passo} (${f.id}): o jogador não sabe`, v.conhecido === false);
      t(`passo ${passo}: o prompt NÃO diz o nome`, !resumo.includes(v.nome));
      t(`passo ${passo}: e proíbe nomear`, /NUNCA nomeie/.test(resumo));
    } else {
      t(`passo ${passo} (${f.id}): agora ele sabe`, v.conhecido === true);
      t(`passo ${passo}: o prompt já pode dizer o nome`, resumo.includes(v.nome));
    }
    t(`passo ${passo}: o estado é coerente`, ehCoerente(v) === true);
  }

  /* e o sistema só fala em voz de sistema DUAS vezes: na revelação e na
     queda. Nas outras fases ele cala e deixa a cena falar. */
  let falas = 0;
  let v = gerarVilao({ nome: "Sarna", cont: {}, dia: 0, sorte: () => 0.5 });
  for (let i = 1; i < TOTAL_DE_PASSOS; i++) {
    const r = avancarPlano(v, { dia: i * DIAS_POR_PASSO, alvo: null });
    v = r.vilao;
    if (linhaDoAvanco(r)) falas += 1;
  }
  t("o sistema fala no máximo duas vezes na campanha inteira", falas <= 2);
}

sec("5. O QUE ELE TOCA — ameaçar 'o reino' é meteorologia");
{
  t("escolhe entre o que existe", escolherAlvo("gente", CTX, () => 0).nome === "Iris");
  t("um lugar quando o custo é lugar", escolherAlvo("lugar", CTX, () => 0).campo === "lugares");
  t("uma promessa quando é voz", escolherAlvo("voz", CTX, () => 0).campo === "promessas");
  /* NUNCA INVENTA: sem nada registrado, o sistema não cria um alvo — pela
     mesma razão de sempre nesta casa */
  t("sem nada registrado, não inventa alvo", escolherAlvo("gente", {}, () => 0) === null);
  t("e cai no que houver", escolherAlvo("gente", { lugares: ["Aldoria"] }, () => 0).campo === "lugares");
}

sec("6. os envelopes — e o que a IA não pode fazer em cada fase");
{
  const passos = [0, 2, 4, 5, 7, 8];
  for (const passo of passos) {
    const { ultimo } = ate(Math.max(1, passo));
    const env = envelopeDoAvanco(ultimo);
    t(`passo ${ultimo.vilao.passo} (${ultimo.fase.id}): tem envelope`, env.length > 100);
    if (ultimo.fase.ordem < 3) {
      t(`  e proíbe nomear`, /NÃO nomeie ninguém|NÃO diga o nome/.test(env));
      t(`  e proíbe a palavra "vilão"`, /"vilão"/.test(env) || /NÃO diga o nome/.test(env));
    }
  }

  /* A REVELAÇÃO não é uma luta: quem luta com o vilão na estreia não tem
     clímax depois. */
  const { ultimo: rev } = ate(5);
  const envRev = envelopeDoAvanco(rev);
  t("a revelação diz que NÃO é luta", /NÃO É UMA LUTA/.test(envRev));
  t("proíbe abrir combate", /NÃO abra combate/.test(envRev));
  t("proíbe matá-lo ali", /NÃO o mate/.test(envRev));
  t("e pede a melhor fala da campanha", /melhor fala da campanha/.test(envRev));
  t("a linha da revelação avisa o jogador", /Você sabe quem é/.test(linhaDoAvanco(rev)));
}

sec("7. ELE NÃO CAI ANTES DA HORA");
{
  const cedo = ate(3).v;
  t("na fase errada, não pode cair", podeCair(cedo) === false);
  const env = envelopeDaQuedaCedoDemais(cedo);
  /* e a recusa não é "nada aconteceu": ele ESCAPA custando alguma coisa —
     é o que transforma cada encontro num degrau em vez de um empate */
  t("a recusa manda ele escapar CUSTANDO", /ESCAPA, e escapa custando/.test(env));
  t("proíbe dizer que morreu", /NÃO diga que ele morreu/.test(env));
  t("proíbe o sucessor", /NÃO o substitua por um sucessor/.test(env));
  t("e proíbe fingir que a cena não aconteceu", /NÃO finja que a cena não aconteceu/.test(env));

  const tarde = ate(TOTAL_DE_PASSOS - 1).v;
  t("na fase final, pode cair", podeCair(tarde) === true);
  const envQ = envelopeDaQueda(tarde, "espada no peito");
  t("a queda é irreversível", /CANON E IRREVERSÍVEL/.test(envQ));
  t("proíbe sucessor e plano maior", /NÃO invente um sucessor/.test(envQ) && /NÃO diga que "havia um plano maior"/.test(envQ));
  /* e a morte dele MUDA O MUNDO: o rastro fica */
  t("e manda narrar o que ele deixou", /o que ele DEIXOU/.test(envQ));
  t("a linha do jogador diz que o rastro continua", /continua onde parou/.test(linhaDaQueda(tarde)));
}

sec("8. o save antigo não se perde");
{
  /* MIGRAÇÃO: uma nêmesis do sistema velho tem `odio` e não tem `fase`.
     Ela vira um vilão na fase correspondente ao ódio que já tinha —
     ninguém perde a perseguição que estava correndo. */
  const velha = { nome: "Sarna", titulo: "a Lâmina Silenciosa", motivo: "você matou alguém que ela amava", odio: 60, status: "ativa" };
  const v = garantirVilao(velha);
  t("vira vilão", !!v.fase && !!v.arquetipo);
  t("o nome sobrevive", v.nome === "Sarna");
  t("e a fase corresponde ao ódio que ela tinha", faseDe(v.fase).ordem >= 2);
  t("o estado migrado é coerente", ehCoerente(v) === true);
  t("um vilão novo não é remexido", garantirVilao(gerarVilao({ nome: "X", dia: 0 })).fase === "rumor");
  t("nulo continua nulo", garantirVilao(null) === null);
  t("e sem nome também", garantirVilao({ odio: 10 }) === null);
}

console.log(`\nvilão v9.83: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
