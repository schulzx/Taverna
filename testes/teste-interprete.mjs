/* teste-interprete.mjs (v9.106) — o que a gente FAZ.
   A maior ausência da revisão: NADA no sistema decidia isso. `npcs` é
   registro, `social` é a conta da persuasão, e o único `comportamento`
   do código inteiro é de bicho. */
import fs from "node:fs";
import {
  GESTOS, ATOS, MOVIMENTOS, LINHAS, NAO_REPETIR, NAO_REPETIR_GESTO, QUANTAS_PESSOAS,
  gestoPorId, atoPorId, movimentoPorId, linhaPorId, atoDoTexto,
  garantirPessoa, gestosProibidos, garantirElenco, marcarMovimento,
  consultarInterprete, paraPauta, INTERPRETE_PROMPT,
} from "../src/interprete.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const sec = (t) => console.log(`\n[${t}]`);
const app = fs.readFileSync("../src/App.jsx", "utf8");
const fixa = (v) => () => v;

sec("1) O ACERVO SE FECHA");
{
  console.log(`  ${MOVIMENTOS.length} movimentos · ${GESTOS.length} gestos · ${LINHAS.length} linhas que não se cruzam · ${ATOS.length} atos`);
  ok(MOVIMENTOS.length >= 80, "o acervo tem tamanho");
  ok(MOVIMENTOS.every((m) => m.id && m.gesto && m.faz && typeof m.quando === "function"), "todo movimento tem id, gesto, ato e condição");
  const ids = MOVIMENTOS.map((m) => m.id);
  ok(new Set(ids).size === ids.length, "sem ids repetidos");
  const gs = new Set(GESTOS.map((g) => g.id));
  ok(MOVIMENTOS.every((m) => gs.has(m.gesto)), "todo gesto usado existe no catálogo de gestos");
  /* cada gesto precisa de MOVIMENTO: um gesto sem movimento é um veto que
     não protege nada, porque nunca haveria o que vetar */
  const vazios = [...gs].filter((g) => !MOVIMENTOS.some((m) => m.gesto === g));
  ok(vazios.length === 0, `todo gesto tem movimentos${vazios.length ? ": VAZIOS " + vazios.join(", ") : ""}`);
  ok(GESTOS.every((g) => g.o) && ATOS.every((a) => a.o), "gestos e atos dizem o que são");
  ok(!!gestoPorId("esquiva") && !gestoPorId("x") && !!atoPorId("menti") && !atoPorId("x") && !!movimentoPorId("muda_de_assunto") && !!linhaPorId("covarde"), "as buscas por id acham e não inventam");

  /* A CATRACA: todo campo lido por um `quando` existe na situação */
  const campos = Object.keys(garantirPessoa(null));
  const lidos = new Set();
  for (const m of MOVIMENTOS) for (const x of String(m.quando).matchAll(/p\.([a-zA-Z]+)/g)) lidos.add(x[1]);
  for (const l of LINHAS) for (const x of String(l.quando).matchAll(/p\.([a-zA-Z]+)/g)) lidos.add(x[1]);
  const orfaos = [...lidos].filter((c) => !campos.includes(c));
  ok(orfaos.length === 0, `todo campo lido existe na situação${orfaos.length ? ": ÓRFÃOS " + orfaos.join(", ") : ` (${lidos.size} de ${campos.length})`}`);
  const mortos = campos.filter((c) => !lidos.has(c) && c !== "nome");
  ok(mortos.length === 0, `e todo campo entregue tem quem o leia${mortos.length ? ": MORTOS " + mortos.join(", ") : ""}`);
  /* todo ATO que um movimento espera tem de existir na lista fechada */
  const atosLidos = [...String(MOVIMENTOS.map((m) => m.quando).join()).matchAll(/ato === "([^"]+)"/g)].map((x) => x[1]);
  const foraDaLista = atosLidos.filter((a) => !ATOS.some((x) => x.id === a));
  ok(foraDaLista.length === 0, `os atos esperados existem${foraDaLista.length ? ": FORA " + foraDaLista.join(", ") : ` (${new Set(atosLidos).size} usados)`}`);
}

sec("2) O SISTEMA NUNCA ESCREVE FALA");
{
  /* a regra que protege o Narrador, e ela precisa de teste porque é fácil
     de quebrar sem perceber */
  const comFala = MOVIMENTOS.filter((m) => /["“”]|\bdiz:|\bfala:/.test(m.faz));
  ok(comFala.length === 0, `nenhum movimento escreve fala${comFala.length ? ": " + comFala.map((m) => m.id).join(", ") : ""}`);
  ok(MOVIMENTOS.every((m) => m.faz.length <= 110), "e todos são curtos — é uma linha de Pauta, não um parágrafo");
  ok(MOVIMENTOS.every((m) => /^[a-zà-ú]/.test(m.faz)), "e continuam a frase 'Fulano …', em minúscula");
  ok(/O QUE ELA DIZ É SEU/.test(INTERPRETE_PROMPT), "e o bloco do prompt devolve a fala ao Narrador");
}

sec("3) AS LINHAS QUE NÃO SE CRUZAM");
{
  const covarde = { nome: "Tibo", temperamento: "covarde", ato: "ameacei" };
  ok(gestosProibidos(covarde).includes("ameaca"), "o covarde nunca ameaça");
  ok(gestosProibidos(covarde).includes("protege"), "e nunca põe o corpo na frente");
  const leal = { nome: "Ubba", temperamento: "leal" };
  ok(gestosProibidos(leal).includes("entrega"), "o leal não entrega quem confiou nele");
  ok(gestosProibidos({ nome: "x", relacao: "inimigo" }).includes("protege"), "o inimigo não protege — é o que a palavra quer dizer");
  ok(gestosProibidos({ nome: "x", relacao: "conjuge" }).includes("ameaca"), "com quem se dorme não se ameaça");
  ok(gestosProibidos({ nome: "x" }).length === 0, "quem não tem linha não tem proibição");
  ok(LINHAS.every((l) => l.porque), "cada linha diz por que existe");

  /* E ELA MORDE NA CONSULTA — mil sorteios, nenhum gesto proibido */
  let quebras = 0;
  for (let i = 0; i < 1000; i++) {
    const m = consultarInterprete({ ...covarde, quantosEscutam: 3, emPerigo: true, forcaDoLaco: 3, teme: "o irmão" }, { sorte: Math.random });
    if (m && ["ameaca", "protege"].includes(m.gesto)) quebras++;
  }
  ok(quebras === 0, `mil sorteios com um covarde em perigo, ${quebras} gestos proibidos — é o que impede o covarde de virar heroico porque a cena pediu`);
}

sec("4) O ATO DO HERÓI");
{
  ok(atoDoTexto("minto para Marta sobre de onde vim") === "menti", "mentir é menti");
  ok(atoDoTexto("ameaço o guarda") === "ameacei", "ameaçar é ameacei");
  ok(atoDoTexto("ataco o lobo") === "feri", "atacar é feri");
  ok(atoDoTexto("pago as três moedas") === "paguei", "pagar é paguei");
  ok(atoDoTexto("pergunto quem manda aqui") === "pedi", "perguntar é pedi");
  ok(atoDoTexto("ajudo o velho a levantar") === "ajudei", "ajudar é ajudei");
  ok(atoDoTexto("olho em volta") === "nada", "e olhar em volta não mexe com ninguém");
  ok(atoDoTexto("") === "nada" && atoDoTexto(null) === "nada", "vazio não quebra");
  /* a lista é fechada: um ato inventado não passa pela garantia */
  ok(garantirPessoa({ ato: "inventado" }).ato === "nada", "ato que não existe na lista vira 'nada'");
}

sec("5) A SITUAÇÃO NORMALIZA");
{
  const p = garantirPessoa(null);
  ok(p.relacao === "desconhecido" && p.ato === "nada" && p.forcaDoLaco === 0, "os padrões seguros");
  ok(garantirPessoa("lixo").nome === "" && garantirPessoa({ forcaDoLaco: 99 }).forcaDoLaco === 3, "lixo e número fora da régua não quebram");
  ok(garantirPessoa({ inventado: 1 }).inventado === undefined, "campo que o esquema não conhece não entra");
  ok(garantirPessoa({ papel: "FERREIRO" }).papel === "ferreiro", "o papel é comparado em minúscula, como os `quando` esperam");
}

sec("6) A CONSULTA");
{
  /* uma pessoa em situação neutra SEMPRE tem o que fazer: sem a rede, o
     Intérprete calaria justamente na cena mais comum do jogo */
  let mudos = 0;
  for (let i = 0; i < 300; i++) {
    const m = consultarInterprete({ nome: "Zé", papel: "ferreiro", ato: "nada" }, { sorte: Math.random });
    if (!m) mudos++;
  }
  ok(mudos === 0, `trezentas cenas neutras, ${mudos} pessoas sem movimento — a rede segura`);

  /* o segredo tocado muda o que ela faz */
  const comSegredo = { nome: "Marta", papel: "ferreira", temperamento: "desconfiada", tocaramNoSegredo: true, quantosEscutam: 3, ato: "acusei" };
  const vistos = new Set();
  for (let i = 0; i < 200; i++) { const m = consultarInterprete(comSegredo, { sorte: Math.random }); if (m) vistos.add(m.id); }
  console.log("  Marta, com o segredo tocado: " + [...vistos].slice(0, 6).join(" · "));
  ok(vistos.has("muda_de_assunto") || vistos.has("muda_de_lugar"), "quem tem o segredo tocado muda de assunto ou de lugar");
  ok(vistos.size >= 4, `e há variedade (${vistos.size} movimentos diferentes) — a mesma pessoa não faz sempre o mesmo`);

  /* UM MOVIMENTO QUEBRADO NÃO PASSA */
  const bomba = { id: "bomba", gesto: "cala", peso: 99, quando: () => { throw new Error("x"); }, faz: "nunca deveria aparecer" };
  MOVIMENTOS.push(bomba);
  let apareceu = false;
  for (let i = 0; i < 200; i++) { const m = consultarInterprete({ nome: "x" }, { sorte: Math.random }); if (m && m.id === "bomba") apareceu = true; }
  MOVIMENTOS.pop();
  ok(!apareceu, "movimento que estoura é CORTADO, não passado — uma lacuna nunca vira permissão");
}

sec("7) A MEMÓRIA É POR PESSOA");
{
  let e = garantirElenco(null);
  e = marcarMovimento(e, "Marta", "muda_de_assunto", "esquiva");
  ok(e.Marta.feitos.includes("muda_de_assunto"), "o que Marta fez fica com Marta");
  ok(!e.Ubba, "e não vaza para Ubba");
  /* o que ela acabou de fazer não volta */
  const p = { nome: "Marta", tocaramNoSegredo: true, quantosEscutam: 3 };
  let repetiu = false;
  for (let i = 0; i < 200; i++) { const m = consultarInterprete(p, { sorte: Math.random, elenco: e }); if (m && m.id === "muda_de_assunto") repetiu = true; }
  ok(!repetiu, "e o movimento recém-feito não volta para ela");
  /* mas volta para outra pessoa */
  let outraFez = false;
  for (let i = 0; i < 300; i++) { const m = consultarInterprete({ ...p, nome: "Ubba" }, { sorte: Math.random, elenco: e }); if (m && m.id === "muda_de_assunto") outraFez = true; }
  ok(outraFez, "Ubba pode fazer o que Marta acabou de fazer — a memória é dela, não da cena");
  /* e a memória tem teto */
  let g = garantirElenco(null);
  for (let i = 0; i < 20; i++) g = marcarMovimento(g, "Marta", "m" + i, "esquiva");
  ok(g.Marta.feitos.length === NAO_REPETIR && g.Marta.gestos.length === NAO_REPETIR_GESTO, "a memória tem teto e esquece o mais antigo");
  ok(garantirElenco("lixo") && Object.keys(garantirElenco("lixo")).length === 0, "lixo não quebra");
}

sec("8) A LINHA DA PAUTA");
{
  const gente = [
    { nome: "Marta", papel: "ferreira", temperamento: "desconfiada", forcaDoLaco: 0, rompido: true, ato: "menti", quantosEscutam: 3 },
    { nome: "Ubba", papel: "batedor", temperamento: "leal", forcaDoLaco: 3, ato: "menti", quantosEscutam: 3 },
    { nome: "Lucan", papel: "escriba", temperamento: "reservado", forcaDoLaco: 1, ato: "menti", quantosEscutam: 3 },
    { nome: "Vaska", papel: "guarda", temperamento: "severa", forcaDoLaco: 0, ato: "menti", quantosEscutam: 3 },
    { nome: "Iris", papel: "curandeira", forcaDoLaco: 0, ato: "menti", quantosEscutam: 3 },
  ];
  const r = paraPauta(gente, { sorte: Math.random });
  console.log("  " + r.linhas.join("\n  "));
  ok(r.linhas.length <= QUANTAS_PESSOAS, `no máximo ${QUANTAS_PESSOAS} pessoas — senão a cena vira assembleia`);
  ok(r.linhas.length === r.marcas.length, "e cada linha tem a sua marca de memória");
  ok(r.linhas[0].startsWith("Ubba"), "quem tem laço mais forte fala primeiro — é de quem o jogador espera reação");
  ok(r.linhas.every((l) => /^[A-ZÀ-Ú]\S* [a-zà-ú]/.test(l)), "e cada linha é 'Nome faz alguma coisa'");
  ok(paraPauta([]).linhas.length === 0 && paraPauta(null).linhas.length === 0, "sem ninguém, nenhuma linha");
  ok(paraPauta([{ papel: "x" }]).linhas.length === 0, "e gente sem nome não entra");
  /* o custo na Pauta */
  const custo = r.linhas.join("").length;
  console.log(`  custo: ${custo} caracteres`);
  ok(custo <= 330, `três pessoas cabem em ${custo} caracteres`);
}

sec("9) LIGADO NO TURNO");
{
  ok(/interpreteParaPauta\(pessoasDaCena\(\)/.test(app), "o Intérprete é consultado no ponto único do turno");
  ok(/porNaPauta\(p, "gente", r\.linhas\)/.test(app), "e escreve na seção A GENTE da Pauta");
  ok(/elencoMemRef = useRef\(\{\}\)/.test(app), "a memória por pessoa vive num ref");
  ok(/elencoMem: elencoMemRef\.current/.test(app), "é salva");
  ok(/garantirElenco\(sv\.elencoMem\)/.test(app), "e recarregada");
  ok(/atoDoTurnoRef\.current = atoDoTexto\(conteudo\)/.test(app), "o ato do herói é lido antes da Pauta — é o que a maioria dos movimentos consulta");
  ok(/marcarMovimento\(elencoMemRef\.current/.test(app), "e o que cada um fez fica marcado");
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\ntudo verde");
process.exit(falhas ? 1 : 0);
