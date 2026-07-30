/* Taverna v6.7 — CALENDÁRIO E RELÓGIO (código, zero tokens).
   O tempo corre sozinho: cada turno do jogador são ~45 min, viagens horas,
   masmorras meia hora por sala; combate e acampamento têm tempo próprio.
   Dias viram sozinhos → reino, festivais, estações e sono acompanham. */

export const MESES = [
  "Brumal", "Florinal", "Alveral", "Soltício", "Ardentia", "Colheral",
  "Outunhal", "Nevoeiral", "Cinzal", "Gelum", "Friosal", "Noital",
];
export const DIAS_MES = 30, MESES_ANO = 12, DIAS_ANO = 360;

export const ESTACOES = [
  { id: "primavera", nome: "Primavera", icone: "🌱", fatorRenda: 1.10, nota: "chuvas mansas, campos verdes — a renda do reino cresce 10%" },
  { id: "verao", nome: "Verão", icone: "☀", fatorRenda: 1.00, nota: "dias longos e quentes" },
  { id: "outono", nome: "Outono", icone: "🍂", fatorRenda: 1.00, nota: "colheitas e nevoeiros" },
  { id: "inverno", nome: "Inverno", icone: "❄", fatorRenda: 0.85, nota: "frio e escassez — a renda do reino cai 15%" },
];

export const diaDoAno = (dia) => ((dia - 1) % DIAS_ANO) + 1;
export const estacaoDe = (dia) => ESTACOES[Math.floor((diaDoAno(dia) - 1) / 90) % 4];
export const mesDe = (dia) => MESES[Math.floor((diaDoAno(dia) - 1) / DIAS_MES) % MESES_ANO];
export const diaDoMes = (dia) => ((diaDoAno(dia) - 1) % DIAS_MES) + 1;
export const dataTxt = (dia) => `${diaDoMes(dia)} de ${mesDe(dia)}`;
export const horaTxt = (minuto) => `${String(Math.floor(minuto / 60)).padStart(2, "0")}:${String(minuto % 60).padStart(2, "0")}`;
export const ehNoite = (minuto) => minuto >= 21 * 60 || minuto < 6 * 60;

/* Clima por estação: multiplicadores de peso sobre a tabela base. */
export const BIAS_CLIMA = {
  primavera: { chuva: 1.6, neblina: 1.3, ensolarado: 1.1, frio: 0.4, calor: 0.3 },
  verao: { ensolarado: 1.5, calor: 4, tempestade: 1.4, frio: 0.1, neblina: 0.6 },
  outono: { neblina: 1.8, chuva: 1.3, vento: 1.4, calor: 0.4, frio: 1.2 },
  inverno: { frio: 6, neblina: 1.4, ensolarado: 0.5, calor: 0, chuva: 0.8, tempestade: 0.5 },
};

/* Festivais fixos do ano — quando o dia chega, o mundo celebra (felicidade sobe). */
export const FESTIVAIS = [
  { diaDoAno: 35, nome: "Festa da Semeadura", icone: "🌾", fel: +6, descricao: "o povo benze os campos e divide o primeiro pão do ano" },
  { diaDoAno: 91, nome: "Noite das Fogueiras", icone: "🔥", fel: +8, descricao: "fogueiras gigantes em cada praça, histórias e salto de chamas para sorte" },
  { diaDoAno: 120, nome: "Torneio do Sol Alto", icone: "🏆", fel: +6, descricao: "justas, arco e apostas — campeões locais viram heróis por um dia" },
  { diaDoAno: 186, nome: "Feira da Colheita", icone: "🥕", fel: +6, descricao: "o mercado transborda; comilança, dança e excessos bem perdoados" },
  { diaDoAno: 244, nome: "Dia dos Antepassados", icone: "🕯", fel: +4, descricao: "velas nas janelas e nomes dos mortos ditos em voz alta para não se perderem" },
  { diaDoAno: 305, nome: "Vigília do Inverno", icone: "❄", fel: +6, descricao: "a noite mais longa: vizinhos dividem lenha, sopa e histórias até o sol nascer" },
];
export const festivalDe = (dia) => FESTIVAIS.find((f) => f.diaDoAno === diaDoAno(dia)) || null;

/* SONHOS DO ACAMPAMENTO (25% por noite): presságios, memórias, pesadelos.
   Alguns deixam condição no dia seguinte — o Mestre só tece o sonho na ficção. */
export const SONHOS = [
  { texto: "Sonhei com um lugar que nunca visitei — mas no sonho eu conhecia cada porta.", efeito: null },
  { texto: "Sonhei com alguém do meu passado, me chamando por um nome que quase esqueci.", efeito: null },
  { texto: "Pesadelo: caía sem fim, e algo embaixo esperava de boca aberta.", efeito: "perturbado" },
  { texto: "Sonhei que voava sobre os meus próprios passos, vendo o caminho todo de cima.", efeito: "inspirado" },
  { texto: "Uma voz sem dono repetiu três palavras que não entendi. Acordei com elas na boca.", efeito: null },
  { texto: "Sonhei com uma porta trancada e uma chave na minha mão. Ao acordar, minha mão estava fechada.", efeito: null },
  { texto: "Revivi a última batalha — mas, no sonho, eu via tudo de fora, como um corvo no galho.", efeito: null },
  { texto: "Sonhei com água escura subindo devagar até cobrir tudo que amo.", efeito: "perturbado" },
  { texto: "Alguém sentado na minha fogueira me contou um segredo. Acordei antes da parte importante.", efeito: null },
  { texto: "Sonhei que era velho, olhando para trás com orgulho. Acordei leve.", efeito: "inspirado" },
  { texto: "No sonho, todos os meus companheiros usavam coroas. Não sei se era promessa ou aviso.", efeito: null },
  { texto: "Sonhei com um inimigo que ainda não tenho — um rosto que nunca vi, mas que me conhecia.", efeito: "perturbado" },
];
export const rolarSonho = () => SONHOS[Math.floor(Math.random() * SONHOS.length)];

/* Sono: limites de vigília (em horas) antes dos avisos e da penalidade. */
export const HORAS_AVISO_SONO = 16, HORAS_EXAUSTO = 20;
export const MINUTOS_POR_TURNO = 45, MINUTOS_VIAGEM = 180, MINUTOS_SALA_MASMORRA = 30, MINUTOS_POS_COMBATE = 30;
export const AMANHECER = 7 * 60; // descanso longo te acorda às 7h
