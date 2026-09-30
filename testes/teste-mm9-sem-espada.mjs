/* teste-mm9-sem-espada.mjs (Fase MM · MM9) — a luta sem espada

   A prova de `src/sem-espada.js` e das duas linhas que o catálogo de
   desafios ganhou (envergonhar e a ordem de se render). As perguntas de
   mesa que esta etapa responde:
     "posso mandá-los largar as armas?"            → §3, §5
     "o lobo entende o que eu grito?"              → §1, §4
     "e o cultista, desiste?"                      → §1, §4
     "quanto é difícil convencê-lo agora?"         → §2, §4
     "e o que eu faço com quem se rendeu?"         → §7
   e a medida — as lutas contra quem ouve acabam mais cedo pela conversa? —
   fixada como catraca (§10).

   Nenhum `Math.random` decide uma asserção: o motor não rola nada, e a
   sonda roda sob a sorte travada da régua. */
import {
  TIPOS_DE_PALAVRA, tipoDaPalavra, QUEM_NAO_SE_RENDE, ehFanatico, PALAVRA_POR_DEGRAU, PALAVRA_DAS_CABECAS,
  celulaDaPalavra, INTENCOES_QUE_CEDEM, INTENCAO_DE_QUEM_CEDE, ESCADA_DA_VONTADE, CD_DA_PALAVRA, cdDaPalavra,
  vozDoBando, PALAVRA_NA_LUTA, FAIXAS_DA_PALAVRA, O_QUE_A_PALAVRA_FAZ, vereditoDaPalavra, renderSe, ouvirAPalavra,
  envelopeDaPalavra, vivosNasMaos, oQueOPrisioneiroSabe, envelopeDosPrisioneiros,
} from "../src/sem-espada.js";
import { DEGRAUS, degrauDaCriatura } from "../src/degraus.js";
import { INTENCOES, intencaoPorId } from "../src/adversario.js";
import { lerAcao, dificuldadePorId } from "../src/desafios.js";
import { chanceDeAcerto } from "../src/fuga.js";
import { completarInimigo } from "../src/bestiario.js";
import { aplicarEscolha } from "../src/golpe-final.js";
import {
  sondarSemEspada, RETRATO_SEM_ESPADA, LIMITE_SEM_ESPADA, HEROIS_SEM_ESPADA, LUTAS_SEM_ESPADA, LIMIAR_DE_FALAR, lutaSemEspada,
} from "./sonda-sem-espada.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra !== "" ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

const mk = (nome, extra = {}) => ({ ...completarInimigo({ nome: nome.replace(/ \d+$/, ""), ameaca: "comum", nivel: 5 }, 5), nome, derrotado: false, condicoes: [], ...extra });
const TIPOS = Object.keys(TIPOS_DE_PALAVRA);
/* o que o jogador e o Narrador nunca leem: nome de mecanismo ou número */
const RX_MECANISMO = /\b(cd|degrau|inten[cç][aã]o|teste|tabela|escada|vontade vergada|passos?)\b|\d/i;

/* ============================================================ */
sec("0. as tabelas");
{
  t("três tipos de palavra: Persuasão, Intimidação, Enganação", TIPOS.join(",") === "persuasao,intimidacao,enganacao");
  t("a tabela cobre todo degrau da escada e todo tipo",
    DEGRAUS.every((d) => PALAVRA_POR_DEGRAU[d.id] && TIPOS.every((tp) => PALAVRA_POR_DEGRAU[d.id][tp] && Number.isInteger(PALAVRA_POR_DEGRAU[d.id][tp].passos))));
  const A = PALAVRA_POR_DEGRAU.animal;
  t("o animal não se convence nem se engana", A.persuasao.passos === 0 && A.enganacao.passos === 0);
  t("o animal foge de quem mete medo — e não se rende", A.intimidacao.passos === 1 && A.intimidacao.fim === "fuga");
  const pers = DEGRAUS.map((d) => PALAVRA_POR_DEGRAU[d.id].persuasao).filter((c) => c.passos > 0);
  t("o astuto ouve o argumento sem desconto: a Persuasão mais barata da escada",
    PALAVRA_POR_DEGRAU.astuto.persuasao.passos === 1 && PALAVRA_POR_DEGRAU.astuto.persuasao.cd === Math.min(...pers.map((c) => c.cd)));
  t("o bruto responde à força: a ameaça sem desconto, o argumento mais caro",
    PALAVRA_POR_DEGRAU.bruto.intimidacao.cd === 0 && PALAVRA_POR_DEGRAU.bruto.persuasao.cd > PALAVRA_POR_DEGRAU.astuto.persuasao.cd);
  t("o treinado aguenta a ameaça melhor do que qualquer outro que a ouve",
    PALAVRA_POR_DEGRAU.treinado.intimidacao.cd === Math.max(...DEGRAUS.map((d) => PALAVRA_POR_DEGRAU[d.id].intimidacao).filter((c) => c.passos > 0).map((c) => c.cd)));
  t("o brilhante não se deixa intimidar", PALAVRA_POR_DEGRAU.brilhante.intimidacao.passos === 0);
  t("o morto não ouve nada", TIPOS.every((tp) => PALAVRA_DAS_CABECAS.morto[tp].passos === 0));
  t("o fanático não ouve nada — enquanto a causa está de pé", TIPOS.every((tp) => PALAVRA_DAS_CABECAS.fanatico[tp].passos === 0));
  t("com a causa caída, só o argumento, e caro (+5)",
    PALAVRA_DAS_CABECAS.fanaticoSemCausa.persuasao.passos === 1 && PALAVRA_DAS_CABECAS.fanaticoSemCausa.persuasao.cd === 5
    && PALAVRA_DAS_CABECAS.fanaticoSemCausa.intimidacao.passos === 0 && PALAVRA_DAS_CABECAS.fanaticoSemCausa.enganacao.passos === 0);
  t("a CD sai da escada de dificuldades: incomum, trivial, heroico",
    CD_DA_PALAVRA.base === dificuldadePorId("incomum").dc && CD_DA_PALAVRA.piso === dificuldadePorId("trivial").dc && CD_DA_PALAVRA.teto === dificuldadePorId("heroico").dc);
  t("as intenções de quem cede existem todas", INTENCOES_QUE_CEDEM.every((id) => !!intencaoPorId(id)));
  t("e para onde a palavra empurra quem está firme também",
    Object.values(INTENCAO_DE_QUEM_CEDE).every((id) => INTENCOES_QUE_CEDEM.includes(id)));
  t("dois degraus na escada da vontade", ESCADA_DA_VONTADE.vergado === 1 && ESCADA_DA_VONTADE.vencido === 2);
  t("na luta, a palavra custa a ação (5e)", PALAVRA_NA_LUTA.custo === "acao");
  t("as faixas da chance descem", FAIXAS_DA_PALAVRA.every((f, i, a) => i === 0 || a[i - 1].min > f.min) && FAIXAS_DA_PALAVRA[FAIXAS_DA_PALAVRA.length - 1].min === 0);
  t("nenhuma voz do veredito fala de mecanismo",
    [...FAIXAS_DA_PALAVRA.map((f) => f.diz), O_QUE_A_PALAVRA_FAZ.vergam, O_QUE_A_PALAVRA_FAZ.rendem, O_QUE_A_PALAVRA_FAZ.fogem, ...Object.values(O_QUE_A_PALAVRA_FAZ.surdos)].every((s) => !RX_MECANISMO.test(s)));
}

/* ============================================================ */
sec("1. quem ouve o quê — pelo bestiário que chega à mesa");
{
  const cel = (n, tp, s) => celulaDaPalavra(mk(n), tp, s);
  t("o Soldado é astuto (declarado) e ouve o argumento sem desconto", degrauDaCriatura(mk("Soldado")) === "astuto" && cel("Soldado", "persuasao").passos === 1 && cel("Soldado", "persuasao").cd === 0);
  t("o comum sem declaração é bruto", cel("Adversário", "intimidacao").cabeca === "bruto");
  t("o Lobo não ouve argumento; foge da ameaça", cel("Lobo", "persuasao").passos === 0 && cel("Lobo", "intimidacao").fim === "fuga");
  t("o Esqueleto é morto: nada", TIPOS.every((tp) => cel("Esqueleto", tp).passos === 0 && cel("Esqueleto", tp).cabeca === "morto"));
  t("o Lich, brilhante declarado, é morto antes de ser brilhante", cel("Lich", "persuasao").cabeca === "morto");
  t("o Cultista é fanático (pelo nome — o desc não chega à mesa)", ehFanatico(mk("Cultista")) && TIPOS.every((tp) => cel("Cultista", tp).passos === 0));
  t("com o chefe caído, o Cultista pode ser convencido — só convencido",
    cel("Cultista", "persuasao", { liderCaiu: true }).passos === 1 && cel("Cultista", "intimidacao", { liderCaiu: true }).passos === 0);
  t("e com a coisa que guardava quebrada, também", cel("Cultista", "persuasao", { protegidoQuebrou: true }).passos === 1);
  t("a tabela de quem não se rende lê o desc, para o dia em que chegar", ehFanatico({ nome: "Vulto", desc: "um zelote do deus cego" }));
  t("e o campo explícito manda", ehFanatico({ nome: "Soldado", fanatico: true }) && QUEM_NAO_SE_RENDE.length >= 1);
  t("o Soldado não é fanático", !ehFanatico(mk("Soldado")));
  t("lixo: sem célula, nada", celulaDaPalavra(null, "persuasao").passos === 0 && celulaDaPalavra(mk("Soldado"), "gritar").passos === 0 && celulaDaPalavra(mk("Soldado"), "persuasao", null, null).passos === 1);
}

/* ============================================================ */
sec("2. a CD");
{
  const c0 = { passos: 1, cd: 0 };
  t("inteiro, sozinho, nada visto: a base (15)", cdDaPalavra({ celula: c0 }) === 15);
  t("a célula soma", cdDaPalavra({ celula: { passos: 1, cd: 4 } }) === 19);
  t("abaixo de metade da vida, −2", cdDaPalavra({ celula: c0, vidaFrac: 0.5 }) === 13);
  t("abaixo de um quarto, −4", cdDaPalavra({ celula: c0, vidaFrac: 0.2 }) === 11);
  t("cada companheiro caído, −2", cdDaPalavra({ celula: c0, caidos: 2 }) === 11);
  t("até −6, por mais que caiam", cdDaPalavra({ celula: c0, caidos: 9 }) === 9);
  t("o herói que acabou de impressionar, −2", cdDaPalavra({ celula: c0, impressionou: true }) === 13);
  t("tudo junto não desce do piso", cdDaPalavra({ celula: c0, vidaFrac: 0.1, caidos: 5, impressionou: true }) === 5);
  t("e não sobe do teto", cdDaPalavra({ celula: { passos: 1, cd: 40 } }) === 25);
  t("lixo: a base", cdDaPalavra(null) === 15 && cdDaPalavra({ vidaFrac: "x", caidos: "y" }) === 15);
}

/* ============================================================ */
sec("3. a frase passa pela peneira (lerAcao, na luta)");
{
  const tipoDe = (f) => tipoDaPalavra(lerAcao(f, { emCombate: true }));
  t("\"Intimido o bandido\" — Intimidação", tipoDe("Intimido o bandido") === "intimidacao");
  t("\"Rendam-se e ninguém mais morre!\" — Intimidação", tipoDe("Rendam-se e ninguém mais morre!") === "intimidacao");
  t("\"Rende-te, cão!\" — a ênclise também", tipoDe("Rende-te, cão!") === "intimidacao");
  t("\"Exijo que se rendam\" e \"Larguem as armas\"", tipoDe("Exijo que se rendam!") === "intimidacao" && tipoDe("Larguem as armas agora!") === "intimidacao");
  t("\"Envergonho o capitão diante dos seus homens\" — envergonhar é Intimidação", tipoDe("Envergonho o capitão diante dos seus homens") === "intimidacao");
  t("\"Tento convencer os soldados a baixar as armas\" — Persuasão", tipoDe("Tento convencer os soldados a baixar as armas") === "persuasao");
  t("\"Minto que os reforços estão chegando\" — Enganação", tipoDe("Minto que os reforços estão chegando") === "enganacao");
  t("a pergunta não conta: \"posso intimidar o bandido?\"", tipoDe("posso intimidar o bandido?") === null);
  t("a hipótese não conta: \"e se eu ameaçasse o bandido?\"", tipoDe("E se eu ameaçasse o bandido?") === null);
  t("a negação não conta: \"não ameaço ninguém\"", tipoDe("não ameaço ninguém") === null);
  t("quem se rende é o herói, não uma ordem: \"Me rendo!\"", tipoDe("Me rendo!") === null && tipoDe("Eu me rendo, não me matem") === null);
  t("o que conversa nenhuma compra continua fora: \"convenço-o a se matar\"", lerAcao("Convenço o soldado a se matar por mim", { emCombate: true }).tipo === "foraDaConversa");
  t("tipoDaPalavra só lê teste social", tipoDaPalavra(null) === null && tipoDaPalavra({ tipo: "teste", social: false, pericia: "intimidacao" }) === null
    && tipoDaPalavra({ tipo: "livre", social: true, pericia: "persuasao" }) === null && tipoDaPalavra({ tipo: "teste", social: true, pericia: "atuacao" }) === null);
}

/* ============================================================ */
sec("4. o veredito antes do clique");
{
  const dois = [mk("Soldado 1"), mk("Soldado 2")];
  const v = vereditoDaPalavra({ inimigos: dois, tipo: "persuasao", mod: 5, intencao: "sobrepujar" });
  t("há com quem falar", v.pode === true && v.voz === "Soldado 1");
  t("a CD é a da tabela", v.cd === cdDaPalavra({ celula: celulaDaPalavra(dois[0], "persuasao") }));
  t("a chance é a do d20 desta casa", v.chance === chanceDeAcerto({ bonus: 5, defesa: v.cd }));
  t("firme, passar verga-os", v.faria === "virou" && v.linha.includes(O_QUE_A_PALAVRA_FAZ.vergam));
  t("a linha não fala de mecanismo", !RX_MECANISMO.test(v.linha.replace(/Soldado \d/, "")), v.linha);
  const vv = vereditoDaPalavra({ inimigos: dois, tipo: "persuasao", mod: 5, intencao: "sair_vivo" });
  t("quem já quer sair (a vida vergou-o): passar é a rendição", vv.faria === "rendicao" && vv.linha.includes(O_QUE_A_PALAVRA_FAZ.rendem));
  const ferido = [mk("Soldado 1", { vida: 5 }), mk("Soldado 2", { derrotado: true, vida: 0 })];
  const vf = vereditoDaPalavra({ inimigos: ferido, tipo: "persuasao", mod: 5, intencao: "sobrepujar", impressionou: true });
  t("ferido, com um caído e o herói a impressionar, fica mais fácil", vf.cd < v.cd && vf.chance > v.chance);
  const lobo = vereditoDaPalavra({ inimigos: [mk("Lobo")], tipo: "persuasao", mod: 5 });
  t("ao lobo não se fala: não há dado", lobo.pode === false && lobo.linha === O_QUE_A_PALAVRA_FAZ.surdos.animal);
  const loboI = vereditoDaPalavra({ inimigos: [mk("Lobo")], tipo: "intimidacao", mod: 5, intencao: "fugir_ferido" });
  t("mas a ameaça afugenta-o — e o que faria é fugir", loboI.pode && loboI.faria === "fuga" && loboI.linha.includes(O_QUE_A_PALAVRA_FAZ.fogem));
  t("ao esqueleto, nada", vereditoDaPalavra({ inimigos: [mk("Esqueleto")], tipo: "intimidacao", mod: 5 }).linha === O_QUE_A_PALAVRA_FAZ.surdos.morto);
  t("ao fanático, nada", vereditoDaPalavra({ inimigos: [mk("Cultista")], tipo: "persuasao", mod: 5 }).linha === O_QUE_A_PALAVRA_FAZ.surdos.fanatico);
  t("ao brilhante, a ameaça não serve", vereditoDaPalavra({ inimigos: [mk("Mago", { degrau: "brilhante" })], tipo: "intimidacao", mod: 5 }).linha === O_QUE_A_PALAVRA_FAZ.surdos.firme);
  t("lixo: sem inimigos ou sem tipo, não pode", vereditoDaPalavra(null).pode === false && vereditoDaPalavra({ inimigos: dois, tipo: "x" }).pode === false && vereditoDaPalavra({ inimigos: [], tipo: "persuasao" }).pode === false);
  t("quem fala pelo bando é o mais forte de pé", vozDoBando([mk("Soldado 1"), { ...mk("Capitão"), ameaca: "elite", nivel: 8 }]).nome === "Capitão" && vozDoBando([]) === null && vozDoBando(null) === null);
}

/* ============================================================ */
sec("5. a escada da vontade");
{
  const dois = [mk("Soldado 1"), mk("Soldado 2")];
  const copia = JSON.stringify(dois);
  const r1 = ouvirAPalavra({ inimigos: dois, tipo: "persuasao", passou: true, margem: 2, intencao: "sobrepujar" });
  t("firme e passou: a vontade verga", r1.efeito === "virou" && r1.intencao === "sair_vivo");
  t("ninguém sai da luta ainda", r1.inimigos.every((e) => !e.derrotado));
  t("e o que vieram fazer fica carimbado em quem está de pé", r1.inimigos.every((e) => e.queria === "sobrepujar"));
  t("sem mutar o que recebeu", JSON.stringify(dois) === copia);
  const r2 = ouvirAPalavra({ inimigos: r1.inimigos, tipo: "persuasao", passou: true, margem: 1, intencao: r1.intencao });
  t("vergado e passou: rendem-se", r2.efeito === "rendicao" && r2.rendidos.join(",") === "Soldado 1,Soldado 2" && r2.restam.length === 0);
  t("rendido: fora da luta, marcado, vivo e com a vida que tinha",
    r2.inimigos.every((e) => e.derrotado === true && e.rendido === true && e.vida === 26 && !e.fugiu));
  t("e ainda sabe o que vieram fazer (não 'sair vivo')", r2.inimigos.every((e) => e.queria === "sobrepujar"));
  /* a vida e a palavra somam-se */
  const pelaVida = ouvirAPalavra({ inimigos: dois, tipo: "persuasao", passou: true, margem: 0, intencao: "encurralado" });
  t("quem a vida já vergou rende-se à primeira palavra certa", pelaVida.efeito === "rendicao");
  t("o crítico acaba de uma vez", ouvirAPalavra({ inimigos: dois, tipo: "persuasao", passou: true, critico: true, intencao: "sobrepujar" }).efeito === "rendicao");
  t("a margem larga também", ouvirAPalavra({ inimigos: dois, tipo: "persuasao", passou: true, margem: ESCADA_DA_VONTADE.margemDoPassoDuplo, intencao: "sobrepujar" }).efeito === "rendicao");
  const falhou = ouvirAPalavra({ inimigos: dois, tipo: "persuasao", passou: false, intencao: "sobrepujar" });
  t("falhou: nada, e a mesma lista", falhou.efeito === "nada" && falhou.inimigos.length === 2 && falhou.intencao === null && falhou.inimigos.every((e, i) => e === dois[i]));
  t("a quem não ouve, nada — mesmo passando", ouvirAPalavra({ inimigos: [mk("Esqueleto")], tipo: "intimidacao", passou: true, critico: true }).efeito === "nada");
  /* o bando segue quem manda, mas só quem a palavra PODE mover */
  const misto = [mk("Soldado 1"), mk("Esqueleto 1"), mk("Cultista 1")];
  const rm = ouvirAPalavra({ inimigos: misto, tipo: "persuasao", passou: true, critico: true, intencao: "sobrepujar" });
  t("o bando segue a voz: o soldado rende-se", rm.rendidos.includes("Soldado 1"));
  t("o esqueleto e o cultista ficam de pé", rm.restam.includes("Esqueleto 1") && rm.restam.includes("Cultista 1"));
  /* o bicho foge */
  const lobos = [mk("Lobo 1"), mk("Lobo 2")];
  const l1 = ouvirAPalavra({ inimigos: lobos, tipo: "intimidacao", passou: true, intencao: "comer" });
  t("o lobo firme, assustado, quer correr", l1.efeito === "virou" && l1.intencao === "fugir_ferido");
  const l2 = ouvirAPalavra({ inimigos: l1.inimigos, tipo: "intimidacao", passou: true, intencao: l1.intencao });
  t("e na segunda foge (não se rende)", l2.efeito === "fuga" && l2.fogem.length === 2 && l2.inimigos.every((e) => e.fugiu && e.derrotado && !e.rendido));
  t("determinístico: a mesma entrada, a mesma saída",
    JSON.stringify(ouvirAPalavra({ inimigos: dois, tipo: "enganacao", passou: true, margem: 3, intencao: "brigar" })) === JSON.stringify(ouvirAPalavra({ inimigos: dois, tipo: "enganacao", passou: true, margem: 3, intencao: "brigar" })));
  t("lixo não estoura", ouvirAPalavra(null).efeito === "nada" && ouvirAPalavra({ inimigos: null, tipo: "persuasao", passou: true }).efeito === "nada");
  t("renderSe guarda a intenção de antes e ignora a de quem cede",
    renderSe(mk("X"), { queria: "capturar" }).queria === "capturar" && !("queria" in renderSe(mk("X"), { queria: "sair_vivo" })) && renderSe(null) === null);
}

/* ============================================================ */
sec("6. o que o Narrador ouve");
{
  const dois = [mk("Soldado 1"), mk("Soldado 2")];
  const r1 = ouvirAPalavra({ inimigos: dois, tipo: "persuasao", passou: true, intencao: "sobrepujar" });
  const e1 = envelopeDaPalavra(r1, { heroi: "Vera" });
  t("vergou: um fato, com quem e o que quer agora", e1.acabou.length === 1 && e1.acabou[0].includes("Soldado 1") && e1.acabou[0].includes("sair inteiro daqui") && e1.naoPode.length === 0);
  const r2 = ouvirAPalavra({ inimigos: r1.inimigos, tipo: "persuasao", passou: true, intencao: r1.intencao });
  const e2 = envelopeDaPalavra(r2, { heroi: "Vera" });
  t("rendeu-se: o fato e o veto de o desfazer", e2.acabou[0].includes("rendem-se") && e2.naoPode[0].includes("não os faça voltar a lutar"));
  const lobos = ouvirAPalavra({ inimigos: [mk("Lobo 1")], tipo: "intimidacao", passou: true, critico: true, intencao: "comer" });
  t("fugiu: o fato", envelopeDaPalavra(lobos).acabou[0].includes("foge"));
  t("nada: nada vai à pauta", envelopeDaPalavra({ efeito: "nada" }).acabou.length === 0 && envelopeDaPalavra(null).acabou.length === 0);
  const tudo = [...e1.acabou, ...e2.acabou, ...e2.naoPode];
  t("nenhum nome de mecanismo", tudo.every((s) => !/\b(cd|degrau|inten[cç][aã]o|teste|tabela|escada)\b/i.test(s)), tudo.find((s) => /\b(cd|degrau|inten[cç][aã]o|teste|tabela|escada)\b/i.test(s)));
  t("e cabe na pauta (cada linha < 300)", tudo.every((s) => s.length < 300));
}

/* ============================================================ */
sec("7. os vivos nas mãos do herói — o rendido e o poupado");
{
  const r = ouvirAPalavra({ inimigos: [mk("Soldado 1")], tipo: "persuasao", passou: true, critico: true, intencao: "capturar" });
  const poupado = aplicarEscolha(mk("Bandido"), "nao_letal", { semente: "mm9" });
  const morto = aplicarEscolha(mk("Salteador"), "letal");
  const fugido = { ...mk("Batedor"), derrotado: true, fugiu: true };
  const nasMaos = vivosNasMaos([...r.inimigos, poupado, morto, fugido]);
  t("o rendido e o desacordado estão nas mãos do herói", nasMaos.map((p) => `${p.nome}:${p.estado}`).join(",") === "Soldado 1:rendido,Bandido:desacordado");
  t("o morto e o fugido não", !nasMaos.some((p) => p.nome === "Salteador" || p.nome === "Batedor"));
  const sabe = oQueOPrisioneiroSabe(nasMaos[0]);
  t("o rendido sabe o que vieram fazer, e porquê", sabe.includes(intencaoPorId("capturar").quer.split(",")[0]) && sabe.includes(intencaoPorId("capturar").porque));
  t("se a luta era do vilão, e há nome, sabe quem os mandou", oQueOPrisioneiroSabe(nasMaos[0], { doVilao: true, quemMandou: "a Viúva de Cinza" }).includes("quem os mandou foi a Viúva de Cinza"));
  const semNome = oQueOPrisioneiroSabe(nasMaos[0], { doVilao: true });
  t("sem nome, só que houve mandante — nunca 'e ele sabe quem'", semNome.includes("a mando de alguém") && !/sabe quem/.test(semNome));
  const env = envelopeDosPrisioneiros([...r.inimigos, poupado], { heroi: "Vera", doVilao: true, quemMandou: "a Viúva de Cinza" });
  t("a pauta diz que pode ser interrogado, e o que sabe", env.acabou[0].includes("pode ser interrogado") && env.acabou[0].includes("a Viúva de Cinza"));
  t("o desacordado vem com a hora do despertar", env.acabou[1].includes("desacordado") && env.acabou[1].includes(String(poupado.acordaEmHoras)));
  t("e o veto de inventar o que não sabe", env.naoPode.length === 2 && env.naoPode.every((s) => s.startsWith("Não invente")));
  t("sem ninguém nas mãos, pauta vazia", envelopeDosPrisioneiros([morto, fugido]).acabou.length === 0 && envelopeDosPrisioneiros(null).acabou.length === 0);
  t("o save: dois campos novos e aditivos, só em quem se rendeu",
    Object.keys(r.inimigos[0]).filter((k) => !(k in mk("Soldado 1"))).sort().join(",") === "queria,rendido");
}

/* ============================================================ */
sec("8. a sonda: a luta muda, e não vira atalho nem armadilha");
{
  const t0 = Date.now();
  const R = RETRATO_SEM_ESPADA, L = LIMITE_SEM_ESPADA.variacao;
  t("o jogador da sonda fala a 70%", LIMIAR_DE_FALAR === 0.7);
  for (const perfil of Object.keys(R).filter((k) => k !== "n")) {
    const m = sondarSemEspada({ perfil, n: R.n, cenarios: Object.keys(R[perfil]) });
    for (const c of Object.keys(R[perfil])) {
      const x = m[c], r = R[perfil][c];
      console.log(`      ${perfil.padEnd(11)} ${c.padEnd(10)} espada: dano ${x.espada.dano.toFixed(2)}, rodadas ${x.espada.rodadas.toFixed(2)} · palavra: dano ${x.palavra.dano.toFixed(2)}, rodadas ${x.palavra.rodadas.toFixed(2)}, pela palavra ${(x.palavra.porPalavra * 100).toFixed(1)}%, rendidos ${x.palavra.rendidos.toFixed(2)}`);
      t(`${perfil}/${c}: a medida bate com o retrato (±2%)`,
        Math.abs(x.palavra.dano - r.palavra.dano) <= Math.max(0.02 * r.palavra.dano, 0.01) && Math.abs(x.espada.dano - r.espada.dano) <= Math.max(0.02 * r.espada.dano, 0.01)
        && Math.abs(x.palavra.rodadas - r.palavra.rodadas) <= 0.02 * r.palavra.rodadas);
      t(`${perfil}/${c}: falar não muda o dano no herói em mais de ${L * 100}% (${((x.palavra.dano / x.espada.dano - 1) * 100).toFixed(1)}%)`, Math.abs(x.palavra.dano / x.espada.dano - 1) < L);
      t(`${perfil}/${c}: nem a vitória cai mais de 3 pontos`, x.palavra.vitoria >= x.espada.vitoria - 0.03);
    }
  }
  const o = R.orador.astutos;
  t("contra astutos, quem sabe falar acaba a luta mais cedo (−15% de rodadas)", o.palavra.rodadas < o.espada.rodadas * 0.9);
  t("e quase sempre com gente rendida", o.palavra.porPalavra > 0.9 && o.palavra.rendidos > 1.5);
  const f = R.intimidador.fanaticos;
  t("contra fanáticos, nada muda — nem uma palavra é dita", f.palavra.dano === f.espada.dano && f.palavra.rodadas === f.espada.rodadas && f.palavra.porPalavra === 0);
  const a = R.intimidador.animais;
  t("contra bichos, alguns fogem, nenhum se rende", a.palavra.porPalavra > 0.2 && a.palavra.rendidos === 0);
  t("a espada sozinha nunca rende ninguém", lutaSemEspada("astutos", "mm9|teste|1", "espada").rendidos === 0);
  t("determinístico: a mesma semente, a mesma luta", JSON.stringify(lutaSemEspada("brutos", "mm9|det", "palavra")) === JSON.stringify(lutaSemEspada("brutos", "mm9|det", "palavra")));
  t("os dois jogadores da sonda existem e os quatro cenários também", Object.keys(HEROIS_SEM_ESPADA).length === 2 && Object.keys(LUTAS_SEM_ESPADA).length === 4);
  console.log(`      (${Date.now() - t0} ms)`);
}

/* ============================================================ */
sec("9. o acervo não mudou por baixo");
{
  t("nenhuma intenção nova: a palavra usa as que já existem", INTENCOES.length === 46);
}

/* A FIAÇÃO — a palavra na luta, por texto (fim de linha normalizado): o
   veredito antes do clique, a ação gasta, o bando que verga ou se rende
   depois do dado, os prisioneiros na pauta, e o rendido e o poupado que
   deixam de ser riscados como mortos no registo do mundo. */
{
  const { readFileSync } = await import("node:fs");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const corpo = (ancora, n = 12000) => { const i = app.indexOf(ancora); return i >= 0 ? app.slice(i, i + n) : ""; };
  t("o App importa a palavra", /import \{[^}]*vereditoDaPalavra[^}]*ouvirAPalavra[^}]*\} from "\.\/sem-espada\.js"/.test(app));
  const rolar = corpo("const rolarDesafio = (v, acao) => {");
  t("(b) na luta, a palavra pede o veredito antes de rolar", rolar.includes("tipoDaPalavra(") && rolar.includes("vereditoDaPalavra("));
  t("(b) a palavra carimba o desafio e nunca resolve sem dado", rolar.includes("palavra: { tipo") && rolar.includes("v.palavra ? null : resolucaoAutomatica("));
  t("(a) quem impressionou há pouco baixa a CD", app.includes("impressionouRef.current = ") && rolar.includes("impressionouAgora()"));
  const concluir = corpo("const concluirRolagem = (", 30000);
  t("(c) depois do dado, a palavra dobra o bando", concluir.includes("ouvirAPalavra(") && concluir.includes("envelopeDaPalavra("));
  const fechar = corpo("const fecharSeTodosCairam = (", 8000);
  t("(d) os prisioneiros vão à pauta ao fechar a luta", fechar.includes("envelopeDosPrisioneiros("));
  t("(d) o rendido e o desacordado não são riscados como mortos", /filter\(\(e\) => !e\.rendido && !e\.desacordado\)\.forEach\(\(e\) => registrarMorte\(e\.nome\)\)/.test(app));
  t("(e) o veredito da palavra ao digitar, no slot da fuga", app.includes("precoDaFuga={precoDaFugaNoCampo || precoDaPalavraNoCampo}"));
}

console.log(`\nmm9 sem espada: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
