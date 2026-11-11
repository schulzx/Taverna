/* A FIAÇÃO DE MC4–MC6 E MC9–MC10 (Fase MC, 11/11/2026) — no App.jsx e na pauta

   O motor estava provado em Node (a97c623: facto-do-sucesso.js,
   a-quest-manda.js, o veredito da oferta; 71af756: cativeiro.js,
   socorro.js). O que faltava era o App perguntar-lhes. Esta suíte lê o App
   por âncora e prende cada ponto da fiação, e prova em Node a parte da
   pauta (motor/pauta-do-turno.js), que é pura — chamando-a, nunca lendo o
   texto dela (teste-assercoes-de-texto):

     MC5  a busca pergunta primeiro o passo da quest (achadoDoPasso); o
          segredo do passo não paga moedas nem saqueia a base; o sistema
          escreve «descobriu» (oLivroDoAchado); o oráculo pergunta o passo
          antes do mundo (oPassoNoOraculo antes de perguntarPeloSistema).
     MC4  o envelope do teste leva o facto, nos dois caminhos (o dado e o
          sucesso sem dado); a busca vazia só sai sem facto.
     MC6  a oferta do Mestre passa haOQueAchar e a semente; o «Rolar» da
          oferta leva a chave dela (oVereditoDaOferta) — e só a frase dela.
     MC9  o cativeiro abre na luta sem saída (lugar, dia), vai ao save e
          volta do load por garantirCativeiro, vai ao catálogo (ctxDesafio),
          sai pelo dado (aplicarSaida), e enquanto dura «sair» some e as três
          portas recusam; a pauta põe a linha e os vetos.
     MC10 o estancar com caído é o socorro dele (oSocorro), o dado aplica
          (aplicarSocorro), as horas passam no relógio (passarHorasNoGrupo),
          a pauta põe a linha e os vetos.
   Tudo em calou: com erro, o turno segue como hoje. */
import fs from "node:fs";
import { aPautaDoTurno } from "../src/motor/pauta-do-turno.js";
import { garantirCativeiro } from "../src/cativeiro.js";
import { CAMPOS } from "../src/estado.js";

/* SEM COMENTÁRIO: as réguas procuram chamadas, e os comentários do App
   dizem os mesmos nomes */
const semComentarios = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(fs.readFileSync("../src/App.jsx", "utf8"));

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* o corpo de uma const-função do componente: da âncora até à próxima
   declaração no mesmo recuo (dois espaços) */
const corpo = (nome) => {
  const i = APP.indexOf(`\n  const ${nome} = `);
  if (i < 0) return "";
  const resto = APP.slice(i + 1);
  const m = /\n  (?:const |useEffect\(|let |function )/.exec(resto.slice(10));
  return m ? resto.slice(0, m.index + 10) : resto;
};
const antes = (txt, a, b) => { const i = txt.indexOf(a), j = txt.indexOf(b); return i >= 0 && j >= 0 && i < j; };
/* o pedaço entre duas âncoras */
const entre = (txt, a, b) => { const i = txt.indexOf(a); if (i < 0) return ""; const j = txt.indexOf(b, i + a.length); return j < 0 ? "" : txt.slice(i, j); };

sec("0. Os imports");
t("o App importa o facto do sucesso", /import \{ oFactoDoSucesso \} from "\.\/facto-do-sucesso\.js"/.test(APP));
t("o App importa a quest que manda (os passos, o achado, o oráculo, o livro)", /import \{ osPassosDasQuests, achadoDoPasso, oPassoNoOraculo, oLivroDoAchado \} from "\.\/a-quest-manda\.js"/.test(APP));
t("o App importa o veredito da oferta", /oVereditoDaOferta \} from "\.\/motor\/o-mestre-pede\.js"/.test(APP));
t("o App importa o cativeiro (garantir, a saída)", /import \{ garantirCativeiro, aplicarSaida \} from "\.\/cativeiro\.js"/.test(APP));
t("o App importa o socorro (há chamado, o dado, as horas)", /import \{ oSocorro, aplicarSocorro, passarHorasNoGrupo \} from "\.\/socorro\.js"/.test(APP));

sec("1. MC5 · a busca acha o segredo do passo");
const ctx = corpo("ctxDesafio");
const achadoDe = entre(ctx, "achadoDe:", "segredos:");
t("o achadoDe pergunta primeiro achadoDoPasso, e só depois achavelAqui", antes(achadoDe, "achadoDoPasso(passosDasQuestsAgora(), ondeDoPasso())", "achavelAqui("));
t("na luta não há achado (a guarda de sempre fica à frente)", antes(achadoDe, "if (combateRef.current) return null", "achadoDoPasso("));
t("os passos vêm do mesmo estado que a pauta lê, e o erro devolve []", /osPassosDasQuests\(\{[\s\S]*espinha: espinhaRef\.current[\s\S]*\}, \{ mundo: mundoDaBase\(\) \}\)[\s\S]*calou\("MC5 · os passos das quests", e\); return \[\];/.test(corpo("passosDasQuestsAgora")));
const conc = corpo("concluirRolagem");
t("o achado do passo não chama recompensaDoAchado nem registrarSaque", antes(conc, 'r.achado.especie === "passo"', "recompensaDoAchado(r.achado)") && /if \(passou && r\.achado && r\.achado\.especie === "passo"\) \{\s*\} else if \(passou && r\.achado\) \{/.test(conc));
t("oLivroDoAchado escreve «descobriu», dentro do calou", /try \{\s*if \(achado && achado\.especie === "passo"\)\s*factosRef\.current = oLivroDoAchado\(factosRef\.current, achado,[\s\S]*calou\("MC5 · o livro do achado do passo", e\)/.test(corpo("escreverODescobriu")));
t("o livro é escrito no sucesso com dado e no sucesso sem dado", conc.includes("escreverODescobriu(") && APP.includes("escreverODescobriu(factoAuto && factoAuto.achado)"));
const oraculo = corpo("perguntarOportunidade");
t("perguntarOportunidade pergunta oPassoNoOraculo antes de perguntarPeloSistema", antes(oraculo, "oPassoNoOraculo(v.oportunidade.pergunta", "perguntarPeloSistema(v.oportunidade.pergunta"));
t("a resposta do passo vence (doPasso || o mundo), e o passo no oráculo está no calou", /const q = doPasso \|\| perguntarPeloSistema\(/.test(oraculo) && oraculo.includes('calou("MC5 · o passo no oráculo", e); doPasso = null;'));
t("a resposta do passo regista-se por cima de um NÃO de antes", /if \(q && \(!q\.reusado \|\| q\.doPasso\)\) fatosRef\.current = registrarFato\(/.test(oraculo));

sec("2. MC4 · o facto do sucesso no envelope");
t("concluirRolagem calcula o facto só no sucesso", /const facto = passou && des \? factoDoSucessoAgora\(des, r\.frase \|\| r\.motivo \|\| ""\) : null;/.test(conc));
t("a busca vazia só sai sem facto (`!facto`)", /\(passou && des && des\.fechaDepois && !r\.achado && !facto\)\s*\? envelopeDeBuscaVazia/.test(conc));
t("o envelope do teste recebe o facto", /envelopeDoTeste\(\{[\s\S]*?facto,\s*\}\)/.test(conc));
t("o sucesso sem dado também passa o facto", /envelopeDoTeste\(\{[^}]*automatico: true, nivelTreino, facto: factoAuto,\s*\}\)/.test(APP));
t("o facto chama oFactoDoSucesso com o onde do passo e os passos, dentro do calou", /oFactoDoSucesso\(des, \{[\s\S]*onde: ondeDoPasso\(\), passos: passosDasQuestsAgora\(\), livro: factosRef\.current,[\s\S]*calou\("MC4 · o facto do sucesso", e\); return null;/.test(corpo("factoDoSucessoAgora")));

sec("3. MC6 · o Mestre pede onde há o que achar");
t("oQueOMestrePede recebe haOQueAchar e a semente", /oQueOMestrePede\(\{[^}]*haOQueAchar, semente: sementeMundo\(\) \}\)/.test(APP));
t("haOQueAchar pergunta o passo, a vista e a cabeça; o erro dá null (a régua de antes)", /haOQueAchar = !!\(achadoDoPasso\(passosDasQuestsAgora\(\), ondeDoPasso\(\)\) \|\| aqui\("percepcao"\) \|\| aqui\("intelecto"\)\);[\s\S]{0,80}calou\("MC6 · há o que achar", e\); haOQueAchar = null;/.test(APP));
const ver = corpo("veredictoDaAcao");
t("o veredito passa por oVereditoDaOferta quando a frase é a da oferta (e só ela)", /if \(marca && String\(marca\)\.trim\(\) === String\(acao \|\| ""\)\.trim\(\)\) v = oVereditoDaOferta\(v\);/.test(ver));
t("o toque no chamado do pedido marca a oferta e limpa depois", /ofertaEmCursoRef\.current = ch\.frase;[\s\S]{0,140}partirOTurno\(ch\.frase\)[\s\S]{0,140}ofertaEmCursoRef\.current = null;/.test(corpo("lancarOChamado")));
t("o cartão do pedido marca a oferta e limpa no finally", /if \(p\.pedido\) \{\s*ofertaEmCursoRef\.current = p\.frase;\s*try \{ lado\(p\.frase\); partirOTurno\(p\.frase\); \} finally \{ ofertaEmCursoRef\.current = null; \}/.test(corpo("confirmarAProposta")));
/* a catraca da MC3 (teste-chamado-fiacao.mjs:89) lê este nome — fica */
t("o cartão do pedido continua a ler `v` (a catraca da MC3)", APP.includes("const c = oCartaoDoPedido(p, v, "));

sec("4. MC9 · o preso é um estado");
t("aplicarSemSaida recebe o lugar e o dia", /aplicarSemSaida\(\{[\s\S]{0,200}lugar: \(lugarRef\.current && lugarRef\.current\.nome\) \|\| cidadeAtualRef\.current \|\| "", dia: diaRef\.current,/.test(APP));
t("o cativeiro abre por garantirCativeiro, só com o herói vivo, no calou", /if \(r\.cativeiro && !pers\.morto\) definirCativeiro\(garantirCativeiro\(r\.cativeiro\)\);[^\n]*calou\("MC9 · o cativeiro abre", e\)/.test(APP));
t("o save leva `cativeiro` logo depois de fimSemSaida", APP.includes("fimSemSaida: fimSemSaidaRef.current, cativeiro: cativeiroRef.current, "));
t("o load passa por garantirCativeiro (save antigo = null), no calou", APP.includes('try { definirCativeiro(garantirCativeiro(sv.cativeiro)); } catch (e) { calou("o cativeiro no load", e); definirCativeiro(null); }'));
t("o estado do save conhece o campo (CAMPOS), aditivo", CAMPOS.some((c) => c.campo === "cativeiro"));
t("jogo novo, capítulo novo e herdeiro começam livres", (APP.match(/definirCativeiro\(null\); \} catch \(e\) \{ calou\("MC9 · (jogo novo|capítulo novo|o herdeiro)/g) || []).length === 3);
t("o catálogo recebe o cativeiro (ctxDesafio)", /cativeiro: cativeiroRef\.current,/.test(ctx));
const saida = corpo("aSaidaDoTeste");
t("a saída só para escapar e arrebentar, por aplicarSaida", /v\.id !== "escapar" && v\.id !== "arrebentar"/.test(saida) && /aplicarSaida\(c, v\.id, \{ sucesso: !!sucesso \}\)/.test(saida));
t("as horas da saída vão ao relógio, e o null solta", /definirCativeiro\(s\.cativeiro\)/.test(saida) && /s\.horas > 0[^\n]*avancarMinutos\(s\.horas \* 60\)/.test(saida));
t("a saída é aplicada no dado e no sucesso sem dado, e vai ao envelope", /aSaidaDoTeste\(des, passou\); if \(lc\) env = /.test(conc) && /aSaidaDoTeste\(v, auto === "sucesso"\); if \(lc\) envAuto = /.test(APP));
t("«sair» da masmorra não existe enquanto preso", /\{!preso && <button onClick=\{sairDaMasmorra\}/.test(APP));
t("sairDaMasmorra, viajar e o mapa recusam enquanto preso", corpo("sairDaMasmorra").includes("if (recusaDoPreso()) return;") && corpo("viajar").includes("if (recusaDoPreso()) return;") && corpo("irAoLugarPeloMapa").includes("if (recusaDoPreso()) return;"));
/* jogado no dev-server (11/11): o «Partir» do mapa vai por viajarPeloMapa, que
   manda o envelope da partida ANTES de viajar — o Narrador contava a estrada
   que o sistema depois recusava. A recusa tem de vir antes do envelope. */
t("o «Partir» do mapa recusa antes do envelope da partida", antes(corpo("viajarPeloMapa"), "if (recusaDoPreso()) return;", 'oEnvelopeDaViagem("partidaMapa"'));
t("a pauta recebe o cativeiro no estado (como o livro de factos)", APP.includes("const comOCativeiro = (e) => ({ ...e, cativeiro: cativeiroRef.current });") && APP.includes("const estadoDoPedido = () => comOCativeiro({ ...oEstadoDoPedido("));

sec("5. MC10 · o socorro a quem caiu");
t("o estancar com caído é o socorro dele (quem e socorro no veredito)", /if \(v\.id === "estancar"\) \{\s*const so = oSocorro\(v,[^\n]*\);\s*if \(so\) v = \{ \.\.\.v, quem: so\.alvo, socorro: so \};/.test(ver));
const soc = corpo("oSocorroDoTeste");
t("o dado aplica aplicarSocorro com sorte semeada, e grava o grupo", /aplicarSocorro\(g, \{ quem: v\.socorro\.alvo, sucesso: !!sucesso, sorte: rng\(hashSemente\(sementeMundo\(\) \+ "\|socorro\|"/.test(soc) && /mudarFicha\(\(p\) => \(\{ \.\.\.p, grupo: r\.grupo \}\)\)/.test(soc));
t("o socorro é aplicado no dado e no sucesso sem dado, e vai ao envelope", /oSocorroDoTeste\(des, passou\); if \(ls\) env = /.test(conc) && /oSocorroDoTeste\(v, auto === "sucesso"\); if \(ls\) envAuto = /.test(APP));
const rel = corpo("avancarOsMinutos");
t("as horas passam no relógio para o caído estancado (só se houver)", /gAntes\.some\(\(m\) => m && m\.estavel\)/.test(rel) && /passarHorasNoGrupo\(gAntes, Number\(n\) \/ 60\)/.test(rel) && rel.includes('calou("MC10 · as horas do caído", e)'));
t("quem acorda acorda na régua do herói (SAIDA_DA_LUTA.pvAoAcordar)", /SAIDA_DA_LUTA\.pvAoAcordar/.test(rel));

sec("5b. MC8 · o veredito antes de partir, na proposta da frase");
{
  const lf = corpo("leituraDaFrase");
  t("a proposta da masmorra leva o veredito, o alvo (a ida ou a boca), a ficha e o «à boca»", /const boca = !m \? masmorraDaBoca\(ctx\.lugar, ctx\.masmorras\) : null;/.test(lf) && /const alvo = \(m && m\.masmorra\) \|\| boca \|\| null;/.test(lf) && /veredito: m \? m\.veredito : null, alvo, pers: ctx\.pers, aBoca: !!boca \}/.test(lf));
  t("e continua dentro do calou da proposta", antes(lf, "const boca = !m ? masmorraDaBoca(", 'calou("a proposta: a masmorra", e)'));
}

sec("6. A pauta, em Node: o canal por turno, e nada sem o estado");
{
  const heroi = { nome: "Ana", classe: "Guerreiro", nivel: 1, vida: 10, vidaMax: 10, grupo: [] };
  const base = { personagem: heroi, cidadeAtual: "", dia: 3, minuto: 600 };
  const portas = { calou: () => {}, pushMsgs: () => {}, setPersonagem: () => {}, aplicar: () => {} };
  const pautaDe = (e) => { try { return JSON.stringify(aPautaDoTurno(e, { frase: "olho à volta" }, portas).pauta || {}); } catch (er) { return "ERRO " + er.message; } };
  const livre = pautaDe(base);
  const cativo = garantirCativeiro({ captor: "Bruna dos Corvos", degrau: "esperto", amarras: "cordas", onde: "a cave" });
  const preso = pautaDe({ ...base, cativeiro: cativo });
  t("sem cativeiro e sem caído, nem PRESO nem sangue na pauta", !/PRESO|sangue/.test(livre), livre.slice(0, 200));
  t("preso, a pauta leva a linha PRESO e o captor", /PRESO/.test(preso) && /Bruna dos Corvos/.test(preso), preso.slice(0, 300));
  t("preso, a pauta leva o veto de soltar sem dado", /sem um dado meu que o decida/.test(preso));
  const caido = pautaDe({ ...base, personagem: { ...heroi, grupo: [{ nome: "Elowen", vida: 0, vidaMax: 8 }] } });
  t("com Elowen no chão, a pauta diz que o sangue não para, e o veto", /Elowen/.test(caido) && /sangue/.test(caido) && /Medicina/.test(caido), caido.slice(0, 300));
}

console.log(`\nmc-fiacao: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
