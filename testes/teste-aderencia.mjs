/* teste-aderencia.mjs (v9.88) — o `quando` deixa de ser a palavra final.

   O `quando` é binário: abre ou não abre. Isso bastava enquanto o acervo
   era pequeno, porque quase tudo que abria servia. Com cento e noventa e
   uma formas abertas ao mesmo tempo, `dentes_em_outro` pesava o mesmo no
   começo da campanha e no clímax, e `colhe` competia de igual com
   `planta` num mundo onde ainda não havia nada plantado.

   Cada afinidade é provada DUAS vezes: que ela move o número (a conta) e
   que ela move o SORTEIO (a estatística). A primeira sozinha não vale
   nada — uma tabela pode estar certa e não estar ligada em lugar nenhum,
   que é a classe de bug que esta casa mais repete. */
import {
  JOGADAS, GESTOS, AFINIDADES, PISO_AFINIDADE, TETO_AFINIDADE,
  afinidadePorId, aderenciaDe, garantirSituacao, garantirEstante,
  consultarBiblioteca, jogadaPorId,
} from "../src/biblioteca.js";
import { pilarRepetido, garantirMesa, anotarTurno, PILARES } from "../src/mestria.js";
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const VIVA = {
  temGenteConhecida: true, temPassado: true, temFalaAnterior: true,
  temObjetos: true, temLugarVisitado: true,
};
/* quantas vezes um gesto sai em N consultas independentes — a memória de
   estante fica DE FORA de propósito: aqui se mede o sorteio, e a memória
   é justamente o que mascararia a diferença que a afinidade faz */
const frequencia = (sit, gesto, n = 3000) => {
  let c = 0;
  for (let i = 0; i < n; i++) {
    const j = consultarBiblioteca({ ...VIVA, ...sit }, { sorte: () => (i * 0.00037 + i * i * 0.00011) % 1 });
    if (j && j.gesto === gesto) c++;
  }
  return c;
};

sec("1. A TABELA — nove regras gerais, e nenhuma solta no meio do código");
{
  t(`há afinidades de verdade (${AFINIDADES.length})`, AFINIDADES.length >= 8);
  t("cada uma tem id, o que diz, a conta e o porquê",
    AFINIDADES.every((a) => a.id && a.diz && typeof a.vale === "function" && a.porque));
  const ids = AFINIDADES.map((a) => a.id);
  t("nenhum id repetido", new Set(ids).size === ids.length);
  t("afinidadePorId acha e não inventa", !!afinidadePorId(ids[0]) && afinidadePorId("nao_existe") === null);

  /* O HOLOFOTE SAIU DO MEIO DO SORTEIO. Ele era um caso especial escrito
     à mão dentro de `consultarBiblioteca`; virou a primeira linha da
     tabela para que todo o peso da decisão more num lugar só — que é o
     que impede a próxima regra de nascer solta como esta estava. */
  const src = fs.readFileSync("../src/biblioteca.js", "utf8");
  const sorteio = src.split("export function consultarBiblioteca")[1];
  t("o holofote não é mais caso especial no sorteio", !/j\.serve === alvo \? 2 : 1/.test(sorteio));
  t("e o sorteio chama a aderência", /aderenciaDe\(j, s, alvo\)/.test(sorteio));
  t("o holofote é a primeira linha da tabela", AFINIDADES[0].id === "holofote");
}

sec("2. AS DUAS PONTAS — afinidade não é veto");
{
  const qualquer = jogadaPorId("comida");
  t("sem nada a favor nem contra, o multiplicador é 1", aderenciaDe(qualquer, {}) === 1);

  /* NENHUMA ZERA. Uma forma que o `quando` abriu continua possível mesmo
     quando não é a mais indicada — é dessa cauda que vem a cena que
     ninguém esperava, e uma régua fina demais a mataria. */
  let menor = Infinity, maior = 0;
  const cenas = [
    {}, { momento: 1 }, { momento: 0 }, { temperatura: "fria" }, { temperatura: "quente" },
    { emMasmorra: true }, { emCidade: true, pessoaNaCena: true }, { pvBaixo: true },
    { ordemDaFase: 3 }, { pilarRecente: "social" },
  ];
  for (const j of JOGADAS) for (const c of cenas) {
    const v = aderenciaDe(j, c, "social");
    if (v < menor) menor = v;
    if (v > maior) maior = v;
  }
  t(`nenhuma forma é zerada (mínimo ${menor})`, menor >= PISO_AFINIDADE && menor > 0);
  t(`e nenhuma engole o sorteio (máximo ${maior})`, maior <= TETO_AFINIDADE);

  /* uma linha quebrada não pode derrubar o turno nem virar veto por acidente */
  t("linha que lança vale 1", aderenciaDe({ gesto: null, serve: null }, null) > 0);
  t("valor absurdo é aparado", Number.isFinite(aderenciaDe(qualquer, { momento: 0.5 })));
}

sec("3. O ARCO — plantar é cedo, colher é tarde");
{
  const planta = jogadaPorId("detalhe_solto"), colhe = jogadaPorId("retorno_torto");
  t("plantar vale mais no começo", aderenciaDe(planta, { momento: 0.1 }) > aderenciaDe(planta, { momento: 0.9 }));
  t("colher vale mais no fim", aderenciaDe(colhe, { momento: 0.9 }) > aderenciaDe(colhe, { momento: 0.1 }));
  /* e no sorteio, que é onde importa */
  const cedo = { emCidade: true, momento: 0.15, pessoaNaCena: true };
  const tarde = { emCidade: true, momento: 0.9, pessoaNaCena: true };
  const pCedo = frequencia(cedo, "planta"), pTarde = frequencia(tarde, "planta");
  t(`no sorteio, planta cai do começo ao fim (${pCedo} → ${pTarde})`, pCedo > pTarde * 1.5);
  const cCedo = frequencia(cedo, "colhe"), cTarde = frequencia(tarde, "colhe");
  t(`e colhe sobe (${cCedo} → ${cTarde})`, cTarde > cCedo * 1.5);
  /* mas nem uma nem outra some: o que se planta no fim é raro, não proibido */
  t("plantar tarde continua possível", pTarde > 0);
}

sec("4. A MESA FRIA QUER ACONTECIMENTO — e é contra a intuição");
{
  /* Mesa fria são cinco turnos sem dado, sem perigo e sem nada ganho.
     Mais uma cena calma sobre uma cena morta é a morte confirmada, não o
     socorro — e era exatamente isso que a régua faria sem esta linha,
     porque `calmaria_com_dente` e companhia só abrem em mesa fria ou
     morna e teriam a fria só para elas. */
  const respira = jogadaPorId("comida"), chega = jogadaPorId("mensageiro");
  t("respirar vale menos na mesa fria", aderenciaDe(respira, { temperatura: "fria" }) < 1);
  t("e chegar alguém vale mais", aderenciaDe(chega, { temperatura: "fria", emCidade: true }) > 1);
  const fria = { emCidade: true, temperatura: "fria", momento: 0.4, pessoaNaCena: true };
  const morna = { emCidade: true, temperatura: "morna", momento: 0.4, pessoaNaCena: true };
  const rFria = frequencia(fria, "respira"), rMorna = frequencia(morna, "respira");
  t(`no sorteio, o respiro cai na mesa fria (${rMorna} → ${rFria})`, rFria < rMorna);

  /* e a mesa quente é o contrário: é onde o novato cansa a mesa */
  const quente = { emCidade: true, temperatura: "quente", momento: 0.4, pessoaNaCena: true };
  t("respirar vale mais na mesa quente", aderenciaDe(respira, { temperatura: "quente" }) > 1);
  t(`e sobe no sorteio (${rMorna} → ${frequencia(quente, "respira")})`, frequencia(quente, "respira") > rMorna);
}

sec("5. O QUE O JOGADOR ACABOU DE FAZER");
{
  /* A memória cobria o que o SISTEMA mandou e era cega para o outro lado
     da mesa: o gesto nunca se repetia e a cena se repetia mesmo assim,
     porque metade dela vinha dele. */
  let mesa = garantirMesa(null);
  t("mesa vazia não acusa repetição", pilarRepetido(mesa) === null);
  mesa = anotarTurno(mesa, { pilar: "social" });
  t("um turno só não basta", pilarRepetido(mesa) === null);
  mesa = anotarTurno(mesa, { pilar: "social" });
  t("dois de dois acusa", (pilarRepetido(mesa) || {}).id === "social");
  mesa = anotarTurno(mesa, { pilar: "exploracao" });
  t("dois em três continua acusando", (pilarRepetido(mesa) || {}).id === "social");
  mesa = anotarTurno(anotarTurno(mesa, { pilar: "exploracao" }), { pilar: "combate" });
  t("e a janela anda", (pilarRepetido(mesa) || {}).id === "exploracao");
  t("três pilares diferentes não acusam ninguém",
    pilarRepetido(anotarTurno(anotarTurno(anotarTurno(garantirMesa(null), { pilar: "social" }), { pilar: "combate" }), { pilar: "exploracao" })) === null);

  const fala = jogadaPorId("nao_responde");
  t("o pilar repetido derruba o multiplicador", aderenciaDe(fala, { pilarRecente: "social", pessoaNaCena: true }) < aderenciaDe(fala, { pessoaNaCena: true }));
  const base = { emCidade: true, momento: 0.4, pessoaNaCena: true };
  const semRep = frequencia(base, "fala");
  const comRep = frequencia({ ...base, pilarRecente: "social" }, "fala");
  t(`no sorteio, a conversa cede espaço (${semRep} → ${comRep})`, comRep < semRep);
  t("mas não desaparece", comRep > 0);

  /* e o holofote continua puxando para o outro lado, que é o ponto: um
     pede o que falta, o outro desconta o que sobra */
  t("faminto e repetido são forças opostas",
    aderenciaDe(fala, { pilarFaminto: "social", pessoaNaCena: true }) > aderenciaDe(fala, { pilarRecente: "social", pessoaNaCena: true }));
}

sec("6. ONDE EU ESTOU, E O CORPO");
{
  const lugar = jogadaPorId("luz"), conversa = jogadaPorId("fala_curta"), corpo = jogadaPorId("cansaco");
  t("o espaço rende na masmorra", aderenciaDe(lugar, { emMasmorra: true }) > aderenciaDe(lugar, { emCidade: true }));
  t("a fala rende com gente na cena", aderenciaDe(conversa, { pessoaNaCena: true }) > aderenciaDe(conversa, {}));
  /* uma forma de fala numa cena sem ninguém é um pedido para a IA
     inventar quem fala — o veto não pega isso porque a forma É válida,
     só não é a indicada */
  t("e cai quando não há ninguém", aderenciaDe(conversa, {}) < 1);
  t("o corpo entra quando dói", aderenciaDe(corpo, { pvBaixo: true }) > aderenciaDe(corpo, {}));
  t("e vale pouco num herói inteiro", aderenciaDe(corpo, {}) < 1);

  const vilao = jogadaPorId("cortesia");
  t("o antagonista rende no meio do plano",
    aderenciaDe(vilao, { ordemDaFase: 3 }) > aderenciaDe(vilao, { ordemDaFase: 5 }));
}

sec("7. E A ADERÊNCIA SOBE NA RESPOSTA");
{
  const j = consultarBiblioteca({ ...VIVA, emCidade: true, momento: 0.5 }, { sorte: () => 0.5 });
  t("a consulta devolve a aderência", Number.isFinite(j.aderencia) && j.aderencia > 0);
  /* sem ela, "por que saiu esta?" só se responde relendo nove funções à mão */
  t("e ela bate com a conta", j.aderencia === Math.round(aderenciaDe(jogadaPorId(j.id), { ...VIVA, emCidade: true, momento: 0.5 }, null) * 100) / 100);

  const app = fs.readFileSync("../src/App.jsx", "utf8");
  const chamada = app.split("const situacaoDaMesa")[1].split("\n  };")[0];
  t("o App entrega pilarRecente", /pilarRecente: \(pilarRepetido\(mesaRef\.current\)/.test(chamada));
  t("e pilarRepetido está importado", /pilarFaminto, pilarRepetido,/.test(app));
  /* `temFalaAnterior` contava NARRAÇÕES: doze parágrafos de travessia e
     descrição não deixam uma frase para ecoar */
  t("temFalaAnterior conta narração com fala dentro", /autor === "mestre" && \/\[/.test(chamada));
}

sec("8. A VARIEDADE SOBREVIVE À RÉGUA");
{
  /* o risco de toda régua fina: ela converge. Se a aderência estreitasse
     o sorteio a meia dúzia de formas, o Bibliotecário teria trocado
     repetição de gesto por repetição de forma. */
  let est = garantirEstante(null);
  const vistos = new Set(), gestos = new Set();
  for (let i = 0; i < 60; i++) {
    const j = consultarBiblioteca({ ...VIVA, emCidade: true, momento: 0.5, pessoaNaCena: true, ordemDaFase: 3, vilaoConhecido: true },
      { sorte: () => (i * 0.0173 + i * i * 0.0009) % 1 });
    if (j) { vistos.add(j.id); gestos.add(j.gesto); }
  }
  t(`sessenta consultas ainda dão muitas formas (${vistos.size})`, vistos.size >= 25);
  t(`e muitos gestos (${gestos.size} de ${GESTOS.length})`, gestos.size >= 10);
}

console.log(`\naderência v9.88: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
