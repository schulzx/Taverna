const S = "../src/";
const { garantirPauta, porNaPauta, textoDaPauta, tamanhoCruDaPauta, TETO_DA_PAUTA } = await import(S + "pauta.js");
const G = await import(S + "geografo.js");

const mapa = { cidades: [
  { nome: "Baixo do Eco", x: 87, y: 57, porte: "capital", bioma: "montanha", descoberta: true, regiao: "Margens Escarlates" },
  { nome: "Pedra do Vazio", x: 52, y: 74, porte: "fortaleza", bioma: "colina", descoberta: true },
  { nome: "Forte do Vigia", x: 70, y: 22, porte: "fortaleza", bioma: "montanha", descoberta: true },
] };

const g = G.paraPauta({
  cidadeAtual: "Baixo do Eco", mapa, semente: "O Décimo Portão|Universo próprio",
  espaco: { tipo: "cidade", dentro: true, tipoDoLocal: "taverna", publico: true, gentePorPerto: 6, cabem: 12, saidas: 2, porte: "capital", luz: "penumbra" },
  clima: "chuva fina",
  longe: [{ nome: "Vera da Serpente", onde: "Pedra do Vazio", dias: 3 }, { nome: "Sid do Norte", onde: "Forte do Vigia", dias: 5 }],
});

let p = garantirPauta(null);
p = porNaPauta(p, "onde", process.env.SEM_ALVO ? g.onde.filter((l)=>!l.startsWith("⌖")) : g.onde);
p = porNaPauta(p, "daqui", g.daqui);
p = porNaPauta(p, "naoPode", g.naoPode);
p = porNaPauta(p, "quem", ["Otávio (taverneiro) atrás do balcão", "Vera da Serpente, encostada na porta"]);
p = porNaPauta(p, "momento", ["a onda pede o clímax: alguém cobra o que foi prometido"]);
p = porNaPauta(p, "forma", ["cena curta, de negociação, com plateia"]);
p = porNaPauta(p, "gente", ["Otávio limpa o mesmo copo pela terceira vez", "Vera conta as saídas com os olhos", "o garoto do canto finge não escutar"]);
p = porNaPauta(p, "aliado", ["Kael diz que isto cheira a armadilha e que ele fica de olho na porta"]);
p = porNaPauta(p, "vilao", ["ele concluiu que você está sozinha", "mandou dois homens para a rua de trás"]);
p = porNaPauta(p, "mundo", ["a dívida com a Associação venceu ontem e alguém veio cobrar"]);
p = porNaPauta(p, "antes", ["aqui, há dois dias, você recusou o contrato na frente de todos"]);
p = porNaPauta(p, "acabou", ["a rolagem de Presença falhou por 2"]);

const cru = tamanhoCruDaPauta(p);
const txt = textoDaPauta(p, { turno: 41 });
console.log(`cru ${cru} · teto ${TETO_DA_PAUTA} · saiu ${txt.length}`);
const linhaAlvo = g.onde.find((l) => l.startsWith("⌖ ")) || "";
console.log(`a linha do alvo custa ${linhaAlvo.length}`);
console.log(`o alvo entrou? ${txt.includes("⌖") ? "sim" : "NAO"}`);
for (const v of g.naoPode) console.log(`  veto (${v.length}) entrou? ${txt.includes(v.slice(0, 40)) ? "sim" : "NAO"}  ${v.slice(0, 70)}`);
console.log("\n" + txt);
