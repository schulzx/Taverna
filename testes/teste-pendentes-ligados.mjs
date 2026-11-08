/* ============================================================
   OS PENDENTES LIGADOS (v9.449, `oficial`) — testes/teste-pendentes-ligados.mjs

   As entregas v9.445–v9.448 deixaram quatro fios por ligar no App e no
   mapa vivo; esta suíte prende cada um no sítio, para nenhum voltar a
   ficar solto calado:
     1. o paradeiro do Cronista (e): `fichaDoCronista` recebe a cidade onde o
        herói está (vazia na estrada e numa masmorra aberta) e o mapa;
     2. na janela baixa, fichas e ofertas numa linha só: a fileira recebe as
        `<Oferta>` e a `<Soleira>` não se desenha (contrato de painel-fichas);
     3. os nomes tocados em seguida juntam-se por «e» (`juntarNomeNoCampo`), e
        o toque guarda `nomes` como guarda `ids`;
     4. o mapa vivo diz «o gelo sobe um degrau» (o motivo do motor) e, na
        estrada, «chega às 13:12» (`chegadaDaViagem`, em `calou`).
   ============================================================ */
import { readFileSync } from "node:fs";

/* As quebras de linha normalizam-se: um checkout com CRLF (o git archive no
   Windows) não pode ficar vermelho por uma régua que mede o fim de linha. */
const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const PAINEL = readFileSync(new URL("../src/painel-mapa-vivo.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const FICHAS = readFileSync(new URL("../src/painel-fichas.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const CODIGO_APP = semComentarios(APP);
const CODIGO_PAINEL = semComentarios(PAINEL);

sec("1 · o paradeiro do Cronista");
{
  /* 28/10 (T1-A, 9.ª fatia), MUDADA E O MOTIVO: o paradeiro do Cronista (a secção da gente) saiu do
     cronistaDoTurno do App para src/motor/cronista-do-turno.js
     (oAceitoDoCronista), e o motor não se lê pelo texto (a catraca de
     teste-assercoes-de-texto): a mesma intenção prova-se jogando a peça
     (jogarOAceito, cronista-bloco.mjs). */
  const { jogarOAceito } = await import("./cronista-bloco.mjs");
  const { fichaDoCronista } = await import("../src/npcs.js");
  const MAPA_P = { cidades: [{ nome: "Vau" }, { nome: "Porto" }] };
  const paradeiro = (estado, pessoa) => ((jogarOAceito({ pessoas: [pessoa || { nome: "Wystan", local: "cidade" }] }, { estado: { npcs: {}, mapa: MAPA_P, dia: 1, ...estado } }).estado.npcs || {}).Wystan || {}).local;
  t("fichaDoCronista recebe o contexto (cidade e mapa)", paradeiro({ cidadeAtual: "Vau" }) === fichaDoCronista({ nome: "Wystan", local: "cidade" }, null, { cidade: "Vau", mapa: MAPA_P }).local && paradeiro({ cidadeAtual: "Vau" }) !== "cidade");
  t("a cidade vai vazia na estrada e numa masmorra aberta", paradeiro({ cidadeAtual: "Vau", jornada: { destino: "Porto" } }) === "cidade" && paradeiro({ cidadeAtual: "Vau", masmorra: { nome: "a cripta" } }) === "cidade" && paradeiro({ cidadeAtual: "Vau", masmorra: { nome: "a cripta", encerrada: true } }) !== "cidade");
  /* o gênero estoura na primeira leitura: a ficha entra como veio (o paradeiro sem carimbo), e o erro vai ao calou */
  let vez = 0;
  const torta = { nome: "Wystan", local: "cidade", get genero() { if (vez++ === 0) throw new Error("torto"); return ""; } };
  const rTorto = jogarOAceito({ pessoas: [torta] }, { estado: { npcs: {}, mapa: MAPA_P, cidadeAtual: "Vau", dia: 1 }, portas: { contextoDoNome: () => ({}) } });
  t("dentro do calou: o Cronista que estoura deixa a pessoa como veio", rTorto.efeitos.some((e) => e.tipo === "calou" && e.onde === "o gênero do Cronista") && ((rTorto.estado.npcs || {}).Wystan || {}).local === "cidade");
}

sec("2 · a janela baixa: fichas e ofertas numa linha");
{
  t("o painel aceita `ofertas` (o contrato existe)", /export function FileiraAVista\(\{[^}]*ofertas = null[^}]*\}\)/.test(FICHAS));
  /* MOVIDAS em 08/11 (TL 9, o oficial): a linha só da janela baixa deixou de
     existir, porque as fichas e as ofertas deixaram de partilhar o pé — as
     fichas foram para o EmCena da barra, as ofertas para a Soleira do momento,
     por cima do campo. A intenção das cinco fica, dita na forma nova: as duas
     nunca disputam a mesma linha; a primeira oferta é o momento e as outras são
     as mesmas <Oferta> (com as mesmas props) atrás do «+N»; e se as fichas
     estouram, o que o mundo oferece não some (cada uma cala-se no seu limite). */
  const MOMENTO = (CODIGO_APP.match(/const momentoPorCimaDoCampo = \(\) => \{[\s\S]*?calou\("o momento por cima do campo", e\); return null; \}\s*\};/) || [""])[0];
  t("as fichas moram na barra, as ofertas por cima do campo (nunca na mesma linha)", /emCena=\{fogueiraNaPagina \? null : \(\s*<LimiteDasFichas key=\{"em-cena\|"/.test(CODIGO_APP) && /const vivas = ofertasDaSoleira\(\) \|\| \[\];/.test(MOMENTO) && !/<FileiraAVista /.test(CODIGO_APP));
  t("a primeira oferta é o momento, com o verbo, o preço e o prazo", /const o = vivas\[0\];/.test(MOMENTO) && /momentos\.proposta = \{\s*verbo: o\.verbo,/.test(MOMENTO) && /preco: \[o\.preco, prazo\]\.filter\(Boolean\)\.join\(" · "\),/.test(MOMENTO));
  t("e as outras abrem-se atrás do «+N», as mesmas <Oferta> com as mesmas props", /secundario: vivas\.length > 1 \? \{ quantos: vivas\.length - 1,/.test(MOMENTO) && /<Soleira ofertas=\{vivas\.slice\(1\)\.map\(\(x\) => \(\s*<Oferta key=\{x\.id\} verbo=\{x\.verbo\} preco=\{x\.preco\} retorno=\{x\.retorno\}/.test(MOMENTO));
  t("as ofertas lêem-se uma vez por render (uma lista, um lugar)", (CODIGO_APP.match(/ofertasDaSoleira\(\) \|\| \[\]/g) || []).length === 1);
  t("se as fichas estouram, a soleira fica (cada uma no seu limite)", /<LimiteDasFichas key="soleira-do-momento"><SoleiraDoMomento momentos=\{momentos\} \/><\/LimiteDasFichas>/.test(MOMENTO) && /this\.state\.erro \? \(this\.props\.reserva \|\| null\)/.test(CODIGO_APP));
}

sec("3 · os nomes tocados em seguida");
{
  const toque = (CODIGO_APP.match(/const tocarFicha = \(ficha\) => \{[\s\S]*?calou\("o toque na ficha", e\); \}\s*\};/) || [""])[0];
  t("tocarFicha existe e está inteiro em calou", !!toque);
  t("o texto sai de juntarNomeNoCampo(atual, pos, nome, postos)", /juntarNomeNoCampo\(atual, pos, nome, postos\)/.test(toque) && /import \{[^}]*\bjuntarNomeNoCampo\b[^}]*\} from "\.\/painel-fichas\.jsx"/.test(APP));
  t("os postos são os nomes do toque de antes", /const postos = tq && Array\.isArray\(tq\.nomes\) \? tq\.nomes : \[\];/.test(toque));
  t("o registo do toque guarda nomes, como guarda ids", /armarToque\(\{[^}]*\bids\b, nomes, texto[^}]*\}\)/.test(toque) && /nomes: \[nomeNoMeioDaFrase\(ficha\.nome\)\]/.test(toque));
  t("a frase do jogador com nomes não se troca pela da ficha seguinte", /const intacta = igual && !tq\.mencao;/.test(toque) && /mencao: true/.test(toque));
  t("o verbo do cartão e a página do Códice também registam o nome", (CODIGO_APP.match(/armarToque\(\{ id: ficha\.id, ids: \[ficha\.id\], nomes: \[nomeNoMeioDaFrase\(ficha\.nome\)\], texto, ficha, verbo \}\)/g) || []).length === 2);

  /* a sequência viva, com a função do painel: «Aceno para » + Freya + Ondine + Isen */
  const fonteJ = (FICHAS.match(/export function juntarNomeNoCampo[\s\S]*?\n\}\n/) || [""])[0];
  const juntar = new Function(fonteJ.replace("export ", "") + "\nreturn juntarNomeNoCampo;")();
  let nomes = [];
  let r = juntar("Aceno para ", null, "Freya", nomes); nomes = [...nomes, "Freya"];
  r = juntar(r.texto, r.cursor, "Ondine", nomes); nomes = [...nomes, "Ondine"];
  t("dois toques seguidos: «Aceno para Freya e Ondine»", r.texto === "Aceno para Freya e Ondine", r.texto);
  r = juntar(r.texto, r.cursor, "Isen o Silencioso", nomes);
  t("três: «Aceno para Freya, Ondine e Isen o Silencioso»", r.texto === "Aceno para Freya, Ondine e Isen o Silencioso", r.texto);
}

sec("4 · o mapa vivo com os dados novos");
{
  const fonteM = (PAINEL.match(/const CHAO_COM_ARTIGO = [\s\S]*?\nfunction motivoEmTexto\(m\) \{[\s\S]*?\n\}/) || [""])[0];
  const motivoEmTexto = new Function(fonteM + "\nreturn motivoEmTexto;")();
  t("«o gelo sobe um degrau» quando subiu", motivoEmTexto({ ponta: "medio", chao: "gelo", subiu: true }) === "o gelo sobe um degrau");
  t("o plural concorda: «as colinas sobem um degrau»", motivoEmTexto({ chao: "colina", subiu: true }) === "as colinas sobem um degrau");
  t("sem subir, ou sem motivo, cala-se", motivoEmTexto({ chao: "gelo", subiu: false }) === "" && motivoEmTexto(null) === "" && motivoEmTexto({ chao: "estrada", subiu: true }) === "");
  t("o cartão lê o motivo do motor, não refaz a régua", /motivoEmTexto\(\(v && v\.motivoDoPerigo\) \|\| \(aresta1 && aresta1\.perigoMotivo\) \|\| null\)/.test(CODIGO_PAINEL) && !/kmDiaDoChaoDuro|TERRENO_VIAGEM/.test(CODIGO_PAINEL));

  const fonteC = (PAINEL.match(/function chegadaEmTexto\(c, rel\) \{[\s\S]*?\n\}/) || [""])[0];
  const chegadaEmTexto = new Function(fonteC + "\nreturn chegadaEmTexto;")();
  t("«chega às 13:12» no mesmo dia", chegadaEmTexto({ dia: 3, hora: "13:12", noite: false }, { dia: 3 }) === "chega às 13:12");
  t("«chega às 02:10 do dia 4, de noite» quando vira", chegadaEmTexto({ dia: 4, hora: "02:10", noite: true }, { dia: 3 }) === "chega às 02:10 do dia 4, de noite");
  t("null = sem hora (a viagem parada não promete)", chegadaEmTexto(null, { dia: 3 }) === "");
  t("a faixa, a coluna e o verbo impedido dizem a chegada", /horasDoAlvo\(dados, alvo, v, chegada\)/.test(CODIGO_PAINEL) && /ondeEmTexto\(dados, chegada\)/.test(CODIGO_PAINEL) && /preco: \[h\.jornada && h\.jornada\.horasQueFaltam != null[\s\S]*?quando \? `você \$\{quando\}` : ""\]/.test(CODIGO_PAINEL));

  const memo = (CODIGO_APP.match(/const chegadaDaViagemViva = useMemo\(\(\) => \{[\s\S]*?\}, \[[^\]]*\]\);/) || [""])[0];
  t("no App, chegadaDaViagem(dados, { jornada, ritmo }) em calou", /chegadaDaViagem\(dadosMapaVivo, \{ jornada: jornadaRef\.current, ritmo: \(fichaViva\(\) \|\| \{\}\)\.ritmoViagem \}\)/.test(memo) && /calou\("a hora de chegada da viagem", e\); return null;/.test(memo));
  t("e passa-a à faixa e à tela grande", /<FaixaDoRumo [^>]*chegada=\{chegadaDaViagemViva\}/.test(CODIGO_APP) && /<TelaDoMapa [^>]*chegada=\{chegadaDaViagemViva\}/.test(CODIGO_APP));
}

console.log(`\n${bons} ok, ${maus} falha(s)`);
if (maus) process.exit(1);
