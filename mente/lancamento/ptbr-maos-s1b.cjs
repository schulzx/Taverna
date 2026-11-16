// S1b: as marcas que a ferramenta não alcança (início de frase, mesóclise, léxico), à mão.
// Guardado para a etapa da voz do motor: rode DEPOIS de ptbr-reescrita.mjs --modo tudo, com
// SO=arq1.js,arq2.js para escolher os arquivos. Os pares das telas já entraram em 5aefa27
// (esses dão «aparece 0», e está certo). Ver o bloco S1b no topo de mente/diario.md.
const fs = require("fs");
const R = "C:/Users/clara/Desktop/Taverna/src/";
const P = {
  "fichas.js": [["Afasto-me {dos}", "Me afasto {dos}"], ["mede-se com você", "se mede com você"], ["vende-se em {banca}", "se vende em {banca}"],
    ["Conheceram-se no dia", "Se conheceram no dia"], ["Conhecem-se", "Se conhecem", 3], ["Viram-se pela", "Se viram pela"]],
  "nucleo.js": [["está a ser comprado", "está sendo comprado"], ["põe-se entre o ferido", "se põe entre o ferido"],
    ["interrompe-se a meio de uma frase dura", "se interrompe no meio de uma frase dura"], ["riu-se num funeral", "riu num funeral"],
    ["ri-se antes das más", "ri antes das más"], ["despede-se com a saudação", "se despede com a saudação"]],
  "decretos.js": [["Paga-se pel", "Recompensa pel", 5]],
  "cidade-por-dentro.js": [["abrem-se as portas e começa", "as portas se abrem e começa"], ["fecham-se as oficinas;", "as oficinas fecham;"],
    ["fecham-se as portas;", "as portas se fecham;"], ["— entende-se ", "— se entende "]],
  "classes.js": [["Move-se sem ser detectado.", "Anda sem ser detectado."], ["Move-se o dobro e ignora", "Anda o dobro e ignora"],
    ["Transforma-se em um animal", "Vira um animal"], ["Funde-se à invocação", "Se funde à invocação"]],
  "regras.js": [["Move-se o dobro e ignora terreno difícil — nada mais te atrasa.", "Anda o dobro e ignora terreno difícil — nada mais o atrasa."]],
  "subclasses.js": [["Move-se como um raio", "Se move como um raio"]],
  "marca-da-subclasse.js": [["move-se como o relâmpago", "se move como o relâmpago"], ["quem está a ver", "quem está vendo"]],
  "batidas.js": [["e está a ver?", "e está vendo?"], ["fê-lo por ordem", "o fez por ordem"], ["pô-lo no caminho", "o pôs no caminho"]],
  "boatos.js": [["enganou-se sobre", "se enganou sobre"], ["`contou-o ${contou}`", "`quem contou: ${contou}`"], ["` (contou-o ${contou})`", "` (quem contou: ${contou})`"]],
  "condicoes-da-quest.js": [["\"ter {0} a dever-te um favor\"", "\"deixar {0} em dívida com você\""], ["\"nunca ficar com {0} a dever-te nada\"", "\"nunca ficar em dívida com {0}\""],
    ["\"estado.factos — o livro de fatos (livro-de-factos.js)\"", "\"estado.factos — o livro de fatos\""]],
  "sessao.js": [["o livro de fatos (livro-de-factos.js, BQ1–BQ2, 08/11)", "o livro de fatos (BQ1–BQ2, 08/11)"]],
  "encontro-na-estrada.js": [["escondi-me até", "me escondi até"], ["cheguei-me sem ser visto", "cheguei perto sem ser visto"]],
  "escondido.js": [["continua a ver-me", "continua me vendo"], ["Escondi-me", "Me escondi"]],
  "facto-do-sucesso.js": [["deve-te um favor", "lhe deve um favor"], ["solto-me do que me prendia", "me solto do que me prendia"]],
  "masmorras.js": [["ouve-se respiração", "se ouve respiração"], ["escuta-se água corrente", "se escuta água corrente"]],
  "motor/o-mestre-chama.js": [["narra-se acontecendo", "se narra acontecendo", 2]],
  "saida-da-luta.js": [["foi-se embora e", "foi embora e", 2]],
  "agressao.js": [["ninguém registou", "ninguém registrou"]],
  "batalha-na-tela.js": [["rotulo: \"bónus\"", "rotulo: \"bônus\""]],
  "cativeiro.js": [["tiraram-me o que tinha", "me tiraram o que tinha"]],
  "companheiro-inicial.js": [["ensinou-lhe quase tudo", "lhe ensinou quase tudo"]],
  "condicoes.js": [["— estanca-se com", "— se estanca com"]],
  "fios-da-estrada.js": [["e di-lo.", "e o diz."]],
  "gente-por-dentro.js": [["ganhou-o por ser", "o ganhou por ser"]],
  "geografia.js": [["o sistema a regista pela sua cena", "o sistema a registra pela sua cena"]],
  "geradores.js": [["Abriu-se uma", "Surgiu uma"]],
  "guildas.js": [["\"Conta-se pelas garras\"", "\"Se conta pelas garras\""]],
  "historia.js": [["Passaram-se ${n}", "Se passaram ${n}"]],
  "lugar.js": [["Quem regista onde o herói", "Quem registra onde o herói"]],
  "motor/correcao-do-juiz.js": [["compara-se com o relógio", "se compara com o relógio"]],
  "motor/cronista-do-turno.js": [["\\\"paga-se 15 moedas\\\"", "\\\"paga 15 moedas\\\""]],
  "motor/cronista.js": [["registar gente nova", "registrar gente nova"]],
  "motor/ficha-de-ator.js": [["Sabe-se aqui:", "Aqui se sabe:"]],
  "npcs.js": [["medimo-nos, e", "nos medimos, e"]],
  "orcamento.js": [["resolve-se sem sustos", "se resolve sem sustos"]],
  "painel-batalha.jsx": [["põe-se em guarda.", "se põe em guarda."]],
  "painel-talentos.jsx": [["troca-se ao acampar", "troca ao acampar"]],
  "poder-de-classe.js": [["concede-a por", "a concede por"]],
  "posturas.js": [["rendem-se mais cedo", "se rendem mais cedo"]],
  "procura.js": [["chama-se {nome}", "se chama {nome}"]],
  "prompt.js": [["\"lembra-se de quando nós…\"", "\"se lembra de quando nós…\""]],
  "quadro-da-quest.js": [["e a pauta di-lo ao Narrador", "e a pauta o diz ao Narrador"]],
  "saga.js": [["guarda-se aqui {coisa}", "aqui se guarda {coisa}"]],
  "sem-espada.js": [["rendeu-se e está vivo", "se rendeu e está vivo"]],
  "janela.js": [["[o sistema registou: ", "[o sistema registrou: "]],
  "estilo.js": [["ganhas: \"Ganhas\"", "ganhas: \"Você ganha\""], ["Fá-lo à sua maneira: escreve o que você faz.", "Faça do seu jeito: escreva o que você faz."],
    ["exalta-se no confronto", "se exalta no confronto", 2], ["\"Ganhaste\"", "\"Você ganhou\""], ["custa-te {n} moedas", "custa {n} moedas"],
    ["Perdeu-se: {forma}.", "Se perdeu: {forma}."], ["Perdeu-se o rasto: {sobre}.", "O rastro se perdeu: {sobre}."]],
};
let erros = 0;
const SO = process.env.SO ? new Set(process.env.SO.split(",")) : null;
const pode = (a) => !SO || SO.has(a);
for (const [arq, pares] of Object.entries(P)) {
  if (!pode(arq)) continue;
  let s = fs.readFileSync(R + arq, "utf8");
  for (const [de, para, n = 1] of pares) {
    const k = s.split(de).length - 1;
    if (k !== n) { console.log("XX " + arq + ": «" + de + "» aparece " + k + " (esperado " + n + ")"); erros++; continue; }
    s = s.split(de).join(para);
  }
  fs.writeFileSync(R + arq, s);
}
console.log(erros ? erros + " erro(s)" : "ok");
if (pode("lexico-do-mundo.js")) {
  const f = R + "lexico-do-mundo.js";
  let s = fs.readFileSync(f, "utf8");
  const um = (de, para) => { const k = s.split(de).length - 1; if (k !== 1) { console.log("XX lexico: " + de + " " + k); return; } s = s.replace(de, para); };
  um("\"Fala-se com vós aos de cima e você aos iguais; xingar", "\"Os de cima são tratados por «vós», e os iguais, por «tu»; xingar");
  um("Sem-Registo", "Sem-Registro");
  for (const [v, w] of [["Viaja-se", "Se viaja"], ["Compra-se", "Se compra"], ["Fala-se", "Se fala"], ["Anda-se", "Se anda"], ["Troca-se", "Se troca"]])
    s = s.split("\"" + v + " ").join("\"" + w + " ");
  fs.writeFileSync(f, s);
  console.log("lexico ok");
}
{
  const Q = {
    "painel-batalha.jsx": [["\"A sua vez", "\"Sua vez", 2], ["`O seu golpe", "`Seu golpe", 2], [">O seu golpe{", ">Seu golpe{", 1]],
    "estilo.js": [["\"A sua escolha", "\"Sua escolha", 1]],
    "painel-guilda.jsx": [[">A sua própria casa", ">Sua própria casa", 1]],
    "painel-mercado.jsx": [[">A sua bolsa · o que te pagam aqui", ">Sua bolsa · o que pagam aqui", 1]],
    "painel-talentos.jsx": [["\"A sua classe", "\"Sua classe", 1]],
    "veredito-do-cartaz.js": [["`A sua palavra já está dada", "`Sua palavra já está dada", 1]],
    "falas.js": [["`A SUA INTENÇÃO SECRETA:", "`SUA INTENÇÃO SECRETA:", 1]],
    "vozes.js": [["`A SUA VOZ — ", "`SUA VOZ — ", 1]],
  };
  for (const [arq, pares] of Object.entries(Q)) {
    if (!pode(arq)) continue;
    let s = fs.readFileSync(R + arq, "utf8");
    for (const [de, para, n] of pares) {
      const k = s.split(de).length - 1;
      if (k !== n) { console.log("XX " + arq + ": " + de + " " + k); continue; }
      s = s.split(de).join(para);
    }
    fs.writeFileSync(R + arq, s);
  }
  console.log("posse ok");
}
