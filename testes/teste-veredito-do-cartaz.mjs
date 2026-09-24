/* ============================================================
   A PROVA DE `vereditoDoCartaz` (R17)

   O que esta suíte prova, acima de tudo: que NENHUMA das cinco recusas
   é decidida aqui — todas vêm de `aceitarProposta` (`missoes.js:490`),
   a mesma função que `App.jsx` já usa para aceitar de verdade. Este
   ficheiro só confere que a LEGENDA de cada "não" está certa.
   ============================================================ */
import { criarMissao, MAX_ATIVAS } from "../src/missoes.js";
import { vereditoDoCartaz } from "../src/veredito-do-cartaz.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[1. A QUEIXA, EM FORMA DE TESTE — dois títulos, o mesmo serviço]");
/* O caso real que `missoes.js:503` documenta (v9.43): Osric ofereceu a
   mesma caçada duas vezes com nomes diferentes — uma pelo gerador
   estrutural, outra pela proposta do Mestre. O filtro por TÍTULO EXATO
   que hoje decide o que aparece no mural (`App.jsx:21905`) deixaria
   este cartaz passar, porque os dois títulos não têm uma letra em
   comum. É exatamente essa divergência — quem desenha vs quem executa —
   que `vereditoDoCartaz` fecha: uma conta só, e é a de `aceitarProposta`. */
const diario1 = [criarMissao({
  titulo: "A caçada de Osric Ventoforte", tipo: "favor", status: "ativa", dador: "Osric Ventoforte",
  descricao: "Um pedido antigo do fazendeiro sobre a fera que ronda a granja.",
  etapas: [{ tipo: "derrotar", alvo: "o atirador do mercado", quantos: 1 }],
})];
const cartazOsric = {
  titulo: "Caçar o atirador do Mercado da Aurora", tipo: "favor", dador: "Osric Ventoforte",
  descricao: "Ele quer o homem que anda a assustar os fregueses com a besta.",
  prazo: 0, etapas: [{ tipo: "derrotar", alvo: "o atirador do mercado", quantos: 1 }],
};
const passariaNoFiltroDeTitulo = !diario1.some((q) => q.titulo.trim().toLowerCase() === cartazOsric.titulo.trim().toLowerCase());
ok(passariaNoFiltroDeTitulo, "os dois títulos não batem — o filtro de hoje (App.jsx:21905) deixaria isto passar");
const vOsric = vereditoDoCartaz(cartazOsric, diario1);
ok(vOsric.pode === false, "mas o aceite recusa: é o mesmo serviço, dito com outras palavras — a queixa da pessoa, provada");
ok(vOsric.chave === "mesma-pessoa", `a legenda é "mesma-pessoa" (recebi "${vOsric.chave}")`);
ok(vOsric.contra === "A caçada de Osric Ventoforte", `"contra" nomeia a missão que colidiu, não o cartaz (recebi "${vOsric.contra}")`);
ok(vOsric.saida === null, "essa recusa é FACTO — mesmo dador, mesmo alvo — e não tem porta");
ok(vOsric.texto === "Osric Ventoforte já lhe pediu isto.", `o texto usa o dador, não o título (recebi "${vOsric.texto}")`);

console.log("\n[2. O TETO — MAX_ATIVAS nunca escrito à mão]");
const oitoAtivas = Array.from({ length: MAX_ATIVAS }, (_, i) => criarMissao({
  titulo: `Missão ${i}`, tipo: "favor", status: "ativa", dador: `Fulano ${i}`,
  etapas: [{ tipo: "ir_a", alvo: `Lugar ${i}` }],
}));
const cartazNove = { titulo: "Mais um serviço qualquer", tipo: "favor", dador: "Novo Dador", prazo: 0, etapas: [{ tipo: "achar", alvo: "um item raro" }] };
const vTeto = vereditoDoCartaz(cartazNove, oitoAtivas);
ok(vTeto.pode === false, "com o teto cheio, ninguém aceita mais nenhum");
ok(vTeto.chave === "tecto", `a legenda é "tecto" (recebi "${vTeto.chave}")`);
ok(vTeto.texto === `A sua palavra já está dada ${MAX_ATIVAS} vezes.`, `o número vem da tabela (MAX_ATIVAS=${MAX_ATIVAS}), nunca escrito à mão (recebi "${vTeto.texto}")`);
ok(!!vTeto.saida && vTeto.saida.vai === "diario", "o tecto tem saída: largar um contrato no Diário resolve");
ok(vTeto.contra === "", "o tecto não colide com UMA missão específica — não há \"contra\"");

console.log("\n[3. mesmo-papel × parece — o mesmo \"não\" da peneira, duas legendas diferentes]");
/* mesmo-papel: o título é o MESMO, só varia caixa/acento — é FACTO, e
   uma Consequência que dissesse "já está no diário" aqui não mentiria. */
const diarioIone = [criarMissao({
  titulo: "Resgatar Ione da masmorra", tipo: "favor", status: "ativa", dador: "Um estranho",
  etapas: [{ tipo: "resgatar", alvo: "Ione" }],
})];
const cartazIone = { titulo: "resgatar ione da masmorra", tipo: "favor", dador: "Outra pessoa", prazo: 0, etapas: [{ tipo: "resgatar", alvo: "Ione" }] };
const vPapel = vereditoDoCartaz(cartazIone, diarioIone);
ok(vPapel.pode === false, "título igual (a acento e caixa) é o mesmo papel");
ok(vPapel.chave === "mesmo-papel", `a legenda é "mesmo-papel" (recebi "${vPapel.chave}")`);
ok(vPapel.saida === null, "um FACTO não tem porta — não há o que decidir");
/* MOVIDA (emenda do `regente` depois de o `oficial` ligar a peça): esta
   asserção afirmava o nome DENTRO de `texto` ("Já pegou este serviço:
   «Resgatar Ione da masmorra»."). Isso obrigava quem consome a escolher
   entre usar `texto` inteiro (e perder a cor de `T.inkMeio` que
   `A Consequência` dá a `colidiu`) ou parti-lo à mão. Agora `texto` para
   exatamente onde o nome entraria, sem «» e sem pontuação à direita —
   é a peça, não esta função, quem cerca `contra` e o tinge. */
ok(vPapel.texto === "Já pegou este serviço:", `o texto pára antes do nome — quem cerca com «» é "A Consequência" (recebi "${vPapel.texto}")`);
ok(vPapel.contra === "Resgatar Ione da masmorra", `"contra" carrega o nome, nu (sem «»/pontuação) (recebi "${vPapel.contra}")`);

/* parece: o achado do `jogo` no save real — dois títulos e dois dadores
   diferentes, mas a peneira semântica (`pareceMesmaMissao`) acha o
   mesmo molde de prosa. R17: "um veredito errado que mostra o seu
   trabalho é um relatório de defeito; um que o esconde é mentira." Por
   isso `Saída=Tem` aqui — o jogador é quem decide, olhando os dois. */
const diarioLia = [criarMissao({
  titulo: "Tirar Lia da Silva de lá", tipo: "favor", status: "ativa", dador: "Barro de Pedra",
  descricao: "Ela foi levada de casa durante a noite e precisa ser tirada de lá antes que seja tarde demais",
  etapas: [{ tipo: "resgatar", alvo: "Lia da Silva" }],
})];
const cartazAlba = {
  titulo: "Tirar Alba de lá", tipo: "favor", dador: "Olga da Meia-Lua",
  descricao: "Ela foi levada de casa durante a noite e precisa ser tirada de lá antes que seja tarde demais",
  prazo: 0, etapas: [{ tipo: "resgatar", alvo: "Alba" }],
};
const vParece = vereditoDoCartaz(cartazAlba, diarioLia);
ok(vParece.pode === false, "a peneira semântica também recusa este — vocabulário parecido, dadores diferentes");
ok(vParece.chave === "parece", `a legenda é "parece" — é JUÍZO, não FACTO (recebi "${vParece.chave}")`);
ok(!!vParece.saida && vParece.saida.vai === "diario", "um JUÍZO tem porta: o jogador vai ao Diário decidir com os próprios olhos");
console.log("\n[4. O TEXTO NÃO MENTE — \"contra\" é a missão que colidiu, nunca o cartaz]");
ok(vParece.contra === "Tirar Lia da Silva de lá", `"contra" é o título que já está no diário (recebi "${vParece.contra}")`);
ok(vParece.contra !== cartazAlba.titulo, "e nunca o título do PRÓPRIO cartaz — isso seria a Consequência a mentir sobre o que colidiu");
/* MOVIDA — mesmo motivo do bloco 3: `texto` deixou de embutir `«${contra}»`
   (era `"Parece o mesmo serviço que «Tirar Lia da Silva de lá»."`). O nome
   continua provado — agora via `contra`, separado — e quem cerca com «»
   e tinge é `A Consequência`, não esta função. */
ok(vParece.texto === "Parece o mesmo serviço que", `o texto pára antes do nome (recebi "${vParece.texto}")`);

console.log("\n[5. JÁ FEITO — nenhuma etapa que o sistema saiba conferir]");
const cartazFeito = { titulo: "Achar a chave perdida", tipo: "favor", dador: "Zeca", prazo: 0, etapas: [{ tipo: "achar", alvo: "chave perdida" }] };
const mundoJaFeito = { npcs: { Zeca: { nome: "Zeca", conhecidoEm: 2 } }, inventario: [{ nome: "chave perdida" }], equipamento: [] };
const vFeito = vereditoDoCartaz(cartazFeito, [], { mundo: mundoJaFeito });
ok(vFeito.pode === false, "o mundo já satisfaz a única etapa — nada resta para conferir");
ok(vFeito.chave === "ja-feito", `a legenda é "ja-feito" (recebi "${vFeito.chave}")`);
ok(vFeito.saida === null, "ninguém retirou o papel, mas também não há o que fazer a respeito — sem porta");
ok(vFeito.texto === "Isto já está feito — ninguém retirou o papel.", `o texto é o da tabela (recebi "${vFeito.texto}")`);

console.log("\n[6. O CASO QUE PODE — um cartaz limpo]");
const cartazLimpo = { titulo: "Buscar ervas na floresta", tipo: "favor", dador: "Vovó Elga", prazo: 0, etapas: [{ tipo: "achar", alvo: "ervas" }] };
const vLimpo = vereditoDoCartaz(cartazLimpo, []);
ok(vLimpo.pode === true, "sem colisão nenhuma, o cartaz pode ser aceite");
ok(vLimpo.chave === "", `chave vazia quando pode (recebi "${vLimpo.chave}")`);
ok(vLimpo.texto === "", `texto vazio quando pode (recebi "${vLimpo.texto}")`);
ok(vLimpo.contra === "", "contra vazio quando pode");
ok(vLimpo.saida === null, "saida nula quando pode");

console.log("\n[7. DEFENSIVO — sem cartaz não estoura]");
ok(vereditoDoCartaz(null, []).pode === false, "cartaz nulo devolve recusa sã, nunca uma exceção");

console.log("\n[8. DEFENSIVO — um motivo que a tabela não nomeia não fala a língua do sistema]");
/* Emenda do `regente`: um cartaz sem título faz `aceitarProposta` devolver
   "sem título" — motivo que não é nenhuma das cinco chaves (um cartaz do
   mural nunca deveria chegar sem título, mas "nunca deveria" não é
   "nunca pode"). Antes desta emenda `texto` era `${r.motivo}.` e a tela
   diria "sem título." ao jogador — o mecanismo a falar de si mesmo. Agora
   é uma frase da casa, sem nomear o motivo cru (que vai só para
   `console.warn`, para quem depura). */
const cartazSemTitulo = { titulo: "", tipo: "favor", dador: "Zeca", prazo: 0, etapas: [{ tipo: "achar", alvo: "x" }] };
const vSemTitulo = vereditoDoCartaz(cartazSemTitulo, []);
ok(vSemTitulo.pode === false, "sem título, não há o que aceitar");
ok(vSemTitulo.chave === "", `chave vazia — nenhuma das cinco legendas descreve isto (recebi "${vSemTitulo.chave}")`);
ok(vSemTitulo.texto === "Isto não pode ser aceite agora.", `o texto é da CASA, nunca o motivo cru do mecanismo (recebi "${vSemTitulo.texto}")`);
ok(!vSemTitulo.texto.toLowerCase().includes("título"), "e não nomeia o que faltou — \"o sistema não fala de si mesmo\"");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
