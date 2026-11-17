/* ============================================================
   O CARTÃO DA SESSÃO (V10, 16/11) — src/cartao-da-sessao.js
   A composição que formas.md F6 §3 escreve campo a campo: a variação por
   tabela, os números da noite, a melhor frase (a do jogador, no maior
   dado), o campo que falta, o segredo do vilão, o piso de letra e o
   determinismo (mesmo resumo ⇒ mesmo cartão).
   ============================================================ */
import {
  CARTAO_DA_SESSAO, NUMEROS_DE_RESERVA, VARIACOES_DO_CARTAO, TIRA_DA_QUEDA, oCartaoDaSessao, osNumerosDaNoite, vilaoDoCartao,
  sementeDoCartao, duracaoDoCartao, pluralDaCriatura, nomeDoArquivoDoCartao, quebrarEmLinhas,
} from "../src/cartao-da-sessao.js";
import { abrirSessao, anotarAJogada, anotarLance, anotarLuta, oResumoDaSessao } from "../src/registro-da-sessao.js";
import { lancamentoDoTeste } from "../src/motor/a-bandeja.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

const heroi = { nome: "Saoirse Pé-Leve", raca: "Humano", classe: "Ladino", genero: "mulher", nivel: 3, moedas: 10, xp: 0 };
const estado0 = { personagem: heroi, missoes: [{ id: 1, titulo: "A coleira", status: "ativa" }] };
function sessao(passos) {
  let r = abrirSessao(null, estado0);
  for (const p of passos) r = p(r);
  return r;
}
const turno = (frase, min) => (r) => anotarAJogada(r, { frase, agora: 1e12 + min * 60000, lugar: "Colina do Enforcado", cena: "colina" });
const dado = (valor, dc, rotulo, frase) => (r) => anotarLance(r, lancamentoDoTeste({ valor, mod: 3, dc, rotulo }), { frase });

sec("a tabela");
t("1080 × 1350, piso de letra 34", CARTAO_DA_SESSAO.largura === 1080 && CARTAO_DA_SESSAO.altura === 1350 && CARTAO_DA_SESSAO.pisoDaLetra === 34);
{
  const tamanhos = [];
  const anda = (o) => { for (const [k, v] of Object.entries(o)) { if (typeof v === "number" && /^(tamanho|rotulo|origem|linha)$/.test(k)) tamanhos.push(v); else if (v && typeof v === "object") anda(v); } };
  anda(CARTAO_DA_SESSAO);
  t("nenhuma letra da tabela abaixo do piso", tamanhos.length >= 8 && tamanhos.every((n) => n >= CARTAO_DA_SESSAO.pisoDaLetra), tamanhos.join(","));
  t("toda tinta é uma cor (cor é número, logo é tabela)", Object.values(CARTAO_DA_SESSAO.tinta).flatMap((v) => (typeof v === "object" ? Object.values(v) : [v])).every((c) => /^#[0-9A-F]{6}$/i.test(c)));
}
t("as variações fecham com a comum (que vale sempre)", VARIACOES_DO_CARTAO[VARIACOES_DO_CARTAO.length - 1].vale({}) === true);

sec("a variação: vinte, vitória, queda, comum");
const vinte = sessao([turno("Desço devagar, sem tocha.", 0), dado(20, 15, "Furtividade", "Desço devagar, sem tocha."), dado(9, 12, "Percepção", "Olho em volta."), turno("Olho em volta.", 102)]);
const cVinte = oCartaoDaSessao(oResumoDaSessao(vinte.atual, estado0), { semente: "mundo|1" });
t("o 20 que passou: «A NOITE DO VINTE», com o d20 grande", cVinte.variacao === "vinte" && cVinte.titulo === "A NOITE DO VINTE" && !!cVinte.vinte && cVinte.numeros.length === 0);
t("a melhor frase é a do jogador no turno do maior dado", cVinte.frase === "Desço devagar, sem tocha." && cVinte.origem === "Furtividade · o dado deu 20");
t("o pé: sessão, duração e semente em grupos de quatro", /^sessão 1 · 1 h 42 · semente [0-9A-F]{4}·[0-9A-F]{4}$/.test(cVinte.pe), cVinte.pe);

const vitoria = sessao([turno("Entro na cripta.", 0), dado(14, 12, "Atletismo", "Empurro a laje."), (r) => anotarLuta(r, { caidos: ["Rato gigante", "Rato gigante 2", "Rato gigante 3"], desfecho: "vitoria" }), turno("Saio.", 50)]);
const estadoV = { ...estado0, personagem: { ...heroi, moedas: 40 }, missoes: [{ id: 1, titulo: "A coleira", status: "concluida" }] };
const cVit = oCartaoDaSessao(oResumoDaSessao(vitoria.atual, estadoV), { semente: "mundo|1" });
t("busca fechada ou luta vencida: «UMA NOITE DE VITÓRIA»", cVit.variacao === "vitoria" && cVit.titulo === "UMA NOITE DE VITÓRIA");
t("os números: caídos pelo tipo (no plural), a busca, as moedas com sinal", cVit.numeros.map((n) => `${n.mostra} ${n.rotulo}`).join("|") === "3 ratos gigantes|1 busca fechada|+30 moedas no bolso", cVit.numeros.map((n) => `${n.mostra} ${n.rotulo}`).join("|"));

const queda = sessao([turno("Corro para a porta.", 0), dado(1, 14, "Acrobacia", "Corro para a porta.")]);
const cQueda = oCartaoDaSessao(oResumoDaSessao(queda.atual, { ...estado0, cativeiro: { dias: 2 } }), { semente: "mundo|1" });
t("a queda manda sobre tudo: «UMA NOITE EM FERROS», à noite, com a tira", cQueda.variacao === "ferros" && cQueda.noite && cQueda.tira === TIRA_DA_QUEDA.levada.mulher);
t("…no gênero do herói («LEVADO VIVO» para ele)", oCartaoDaSessao(oResumoDaSessao(queda.atual, { ...estado0, personagem: { ...heroi, genero: "homem" }, cativeiro: { dias: 2 } }), {}).tira === "LEVADO VIVO");
t("…e conta os dias em ferros", cQueda.numeros.some((n) => n.peca === "cadeado" && n.n === 2));
t("o 1 natural entra (d20 rachado)", cQueda.numeros[0].peca === "um" && cQueda.numeros[0].rotulo === "um natural");

const comum = sessao([turno("Peço uma cerveja.", 0), turno("Pergunto pelo ferreiro.", 20)]);
const cComum = oCartaoDaSessao(oResumoDaSessao(comum.atual, estado0), {});
t("sem nada disso: «UMA NOITE À MESA»", cComum.variacao === "comum" && cComum.titulo === "UMA NOITE À MESA");

sec("o campo que falta: nunca um buraco, nunca texto inventado");
t("menos de duas linhas: entra «N turnos jogados»", cComum.numeros.length === 1 && cComum.numeros[0].rotulo === "turnos jogados" && cComum.numeros[0].n === 2);
{
  const magra = sessao([turno("Olho a porta.", 0), dado(12, 10, "Percepção", "Olho a porta."), turno("Entro.", 4)]);
  const cM = oCartaoDaSessao(oResumoDaSessao(magra.atual, { ...estado0, personagem: { ...heroi, xp: 17 } }), {});
  t("a noite magra completa até " + NUMEROS_DE_RESERVA.ate + " linhas com o que é verdade (dados, XP, turnos) — sem buraco", cM.numeros.map((n) => n.rotulo).join("|") === "dados rolados|de experiência|turnos jogados" || cM.numeros.map((n) => n.rotulo).join("|") === "dado rolado|de experiência|turnos jogados", cM.numeros.map((n) => n.rotulo).join("|"));
}
t("sem dado: a última frase escrita, e a origem diz que foi a última jogada", cComum.frase === "Pergunto pelo ferreiro." && cComum.origem === "a última jogada da noite");
t("sem semente: o pé fica com sessão e duração", cComum.pe === "sessão 1 · 20 min");
const vazio = oCartaoDaSessao(null, null);
t("nada de nada: o cartão ainda se compõe (a comum, a frase da casa)", vazio.variacao === "comum" && vazio.frase.length > 0 && vazio.pe === "sessão 1");
t("sem cena: vazio (o painel pinta o feltro com o halo)", vazio.cena === "");

sec("o vilão sem o segredo");
t("sem vilão eleito, a carta não aparece", vilaoDoCartao(null) === null && cVinte.vilao === null);
t("na camada do rumor: «SEM ROSTO»", vilaoDoCartao({ nome: "Vaela", camada: "rumor" }).nome === "SEM ROSTO");
t("na marca e na mão ainda «SEM ROSTO»", vilaoDoCartao({ nome: "Vaela", camada: "marca" }).nome === "SEM ROSTO" && vilaoDoCartao({ nome: "Vaela", camada: "mao" }).nome === "SEM ROSTO");
t("do rosto em diante, o nome", vilaoDoCartao({ nome: "Vaela", camada: "rosto" }).nome === "VAELA");
t("camada desconhecida não revela", vilaoDoCartao({ nome: "Vaela", camada: "?" }).revelado === false);
t("o nome nunca aparece em campo nenhum antes do rosto", !JSON.stringify(oCartaoDaSessao(oResumoDaSessao(vinte.atual, estado0), { vilao: { nome: "Vaela", camada: "mao" } })).includes("Vaela"));

sec("determinismo e utilidades");
const r1 = oResumoDaSessao(vitoria.atual, estadoV);
t("mesmo resumo ⇒ mesmo cartão", JSON.stringify(oCartaoDaSessao(r1, { semente: "x" })) === JSON.stringify(oCartaoDaSessao(JSON.parse(JSON.stringify(r1)), { semente: "x" })));
t("a semente é a mesma em qualquer máquina", sementeDoCartao("A Estrada do Sal|Fantasia") === "FB40·46C6");
t("a duração: minutos e horas", duracaoDoCartao(42) === "42 min" && duracaoDoCartao(102) === "1 h 42" && duracaoDoCartao(0) === "");
t("o plural da criatura para no conector", pluralDaCriatura("Lobo das cavernas", 2) === "lobos das cavernas" && pluralDaCriatura("Rato gigante", 1) === "rato gigante");
t("o nome do arquivo: sem data, sem conta, sem acento", nomeDoArquivoDoCartao({ n: 4 }, { nome: "Saoirse Pé-Leve" }) === "taverna-sessao-4-saoirse.png");
const linhas = quebrarEmLinhas("uma frase bem longa que não cabe em duas linhas de jeito nenhum mesmo", 20, 2, (s) => s.length);
t("a frase corta em duas linhas, com «…»", linhas.length === 2 && linhas[1].endsWith("…") && linhas.every((l) => l.length <= 20));
t("frase curta fica inteira", quebrarEmLinhas("curta", 20, 2, (s) => s.length).join() === "curta");
t("os números nunca passam de quatro", osNumerosDaNoite({ dados: { vintes: 1, uns: 1 }, caidos: [{ tipo: "x", n: 1 }], buscasFechadas: 1, moedas: 3, diasEmFerros: 1, turnos: 9 }).length === 4);

console.log(`\ncartão da sessão: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
