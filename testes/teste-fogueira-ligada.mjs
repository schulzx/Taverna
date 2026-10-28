/* A FOGUEIRA LIGADA (F2, Fase MM-C · C6) — a fiação no App, lida de volta

   O painel (`painel-fogueira.jsx`) e o motor (`subtramas.js`) têm as suítes
   deles. Esta prova o que só o App decide e que um descuido quebraria
   calado: o «Descanso longo» passa pela fogueira, toda mão da noite corre
   em `calou` (nunca pode custar o turno), a página dá lugar à roda e volta,
   a manhã abre com o ladrilho, a tela não diz o nome de nenhum mecanismo,
   e o defeito antigo da petição (o Mestre calava com a resposta na mão)
   não volta. Tela se olha; o que se lê aqui é o texto do App.
*/
import { readFileSync } from "node:fs";

const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const { fraseDaManha, quemAoFogo } = await import("../src/subtramas.js");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
/* o corpo de uma const-função do App, da declaração até à próxima const do mesmo recuo */
const corpo = (nome) => {
  const i = APP.indexOf("  const " + nome + " = ");
  if (i < 0) return "";
  const j = APP.indexOf("\n  const ", i + 10);
  return APP.slice(i, j < 0 ? undefined : j);
};

sec("o defeito antigo: a petição do correio responde com a ficha");
{
  const pet = corpo("responderPeticao");
  t("responderPeticao existe", pet.length > 0);
  t("o enviar da petição leva fichaViva() (sem ficha, aplicarResposta lia persAtual cru e o Mestre calava)",
    /* o texto do envelope saiu para src/motor/envelopes-do-turno.js (T2-A, o correio): o que esta
       asserção guarda é a ficha passada ao enviar, e ela segue na chamada do App */
    /enviar\(oEnvelopeDoCorreio\("peticao", [^\n]*\), fichaViva\(\) \|\| personagem\);/.test(pet));
  const i = APP.indexOf("const aplicarResposta = useCallback");
  const j = APP.indexOf("const mundoDasMissoes", i);
  const ap = APP.slice(i, j);
  t("aplicarResposta delimitado", i > 0 && j > i);
  t("aplicarResposta nunca lê persAtual.grupo / persAtual.vida sem rede", !/persAtual\.(grupo|vida)\b/.test(ap));
  t("a ficha do envio nasce da que nunca é nula", /const persDoEnvio = pers;/.test(ap));
}

sec("o «Descanso longo» passa pela fogueira");
{
  t("o painel e os cinco do motor entram no App",
    /import \{ PainelFogueira \} from "\.\/painel-fogueira\.jsx";/.test(APP)
    && ["quemAoFogo", "sentarAoFogo", "aguentaANoite", "portaAberta as portaDoCoracaoAberta", "fraseDaManha"].every((n) => APP.includes(n)));
  t("o botão chama descansoLongo (não aplica logo)", /saida\("longo", descansoLongo, "Descanso longo"/.test(APP));
  t("o veredito e o recibo saem da mesma conta (contasDoLongo)", /contasDoLongo\(\)/.test(corpo("descansoLongo")) && /= contasDoLongo\(\);/.test(APP));
  t("a linha devolve ganha a conversa só quando alguém tem o que dizer",
    /conversa \? " · uma conversa à fogueira" : ""/.test(corpo("contasDoLongo")) && /x\.voz != null/.test(corpo("contasDoLongo")));
  t("a roda só abre com alguém que tenha voz; senão o descanso corre",
    /rf\.lista\.some\(\(x\) => x && x\.voz != null\)/.test(corpo("descansoLongo")) && /fecharANoite\(manha, ""\)/.test(corpo("descansoLongo")));
  t("sem descanso longo possível (já dormiu hoje), não há roda", /podeDescansoLongo\(pers, diaRef\.current\)\.pode/.test(corpo("rodaDaFogueira")));
  t("sairDoAcampamento fecha a noite e aceita a frase que a abre",
    /const sairDoAcampamento = \(tipo, extra\) =>/.test(APP) && /extra && extra\.antes/.test(corpo("sairDoAcampamento")));
}

sec("nunca pode custar o turno");
{
  for (const n of ["rodaDaFogueira", "descansoLongo", "sentarAoFogoUI", "dormirAoFogo", "escolherAoFogo", "ficarAoFogo", "fecharANoite"]) {
    t(n + " corre em calou", /calou\(/.test(corpo(n)), corpo(n) ? "" : "não achei");
  }
  const lim = APP.indexOf("class LimiteDaFogueira");
  t("o limite da fogueira mora fora do componente (nunca dentro do render)", lim > 0 && lim < APP.indexOf("export default function Taverna()"));
  t("o limite cala-se (null) em vez de tapar a tela", /class LimiteDaFogueira[\s\S]{0,600}this\.state\.erro \? null : this\.props\.children/.test(APP));
  t("o que o motor devolveu ao sentar só se grava quando a noite fecha",
    !/coracaoRef\.current = /.test(corpo("sentarAoFogoUI")) && /coracaoRef\.current = garantirCoracaoDoSave\(f\.sentado\.coracao\)/.test(corpo("dormirAoFogo")));
  t("a fala vai ao Narrador pela pauta (coracaoFalaRef), nunca bloco estático", /coracaoFalaRef\.current = \{ secao: "coracao", linha: r\.linha/.test(corpo("sentarAoFogoUI")));
  t("ficar só com a porta aberta; um lado só depois da fala", /!f\.porta/.test(corpo("ficarAoFogo")) && /!falouAoFogo\(f\)/.test(corpo("escolherAoFogo")));
}

sec("a página: a roda no lugar do relato, a manhã acima da prosa");
{
  t("o cabeçalho diz «A noite · …» com a roda aberta (por cima do lugar da cena, que continua a alimentar a etiqueta)",
    /clima \}\)\} \{\.\.\.\(fogueiraNaPagina \? \{ lugar: "A noite · " \+ \(\(sitio && sitio\.nome\) \|\| lugarDaCena\(\)\) \} : \{\}\)\} \/>/.test(APP));
  t("a página volta ao topo quando a roda abre (a abertura e o fogo primeiro)", /areaRef\.current\.scrollTop = 0/.test(corpo("descansoLongo")));
  t("a roda toma o lugar do relato", /\{fogueiraNaPagina \? \([\s\S]{0,400}<PainelFogueira \{\.\.\.propsDaFogueira\(\)\} \/>/.test(APP));
  t("o acampamento sai da página enquanto a roda está aberta", /\{acampado && !fogueiraNaPagina && \(/.test(APP));
  t("o relato parte-se no início da manhã e os índices andam com o corte",
    /mensagens\.slice\(0, k\)/.test(APP) && /<PainelFogueira manha=\{mf\} \/>/.test(APP) && /ouvirMestre\(i \+ k, texto\)/.test(APP) && /i: voz\.i - k/.test(APP));
}

sec("o laço que afrouxa (backend, v9.415) chega ao coração");
{
  const ef = corpo("aplicarEfeitosDoCoracao");
  t("o delta -1 do coração afrouxa o laço (nunca rompe, nunca some calado)",
    /else if \(e\.delta === -1\) novo = afrouxarLaco\(npc\);/.test(ef) && /import \{[^}]*\bafrouxarLaco\b[^}]*\} from "\.\/npcs\.js";/.test(APP));
  const { afrouxarLaco } = await import("../src/npcs.js");
  const npc = { nome: "Ayo", laco: { tipo: "amizade", forca: 3, desde: 1 } };
  const depois = afrouxarLaco(npc);
  t("e o que o App chama devolve outro objeto quando afrouxa (o App só grava o que mudou)", depois !== npc && depois.laco && depois.laco.forca < 3);
}

sec("o sistema não fala de si mesmo (formas.md § Fogueira §6)");
{
  const tela = [/const ABERTURA_DA_FOGUEIRA = "([^"]*)"/.exec(APP), /" · uma conversa à fogueira"/.exec(APP), /"A noite · "/.exec(APP)].map((m) => (m ? m[1] || m[0] : ""));
  t("as três falas de tela do App existem", tela.every(Boolean));
  const proibidas = /\b(batida|ficha|n[uú]cleo|papel|subtrama|romance|afinidade|pedido)\b/i;
  t("nenhuma diz nome de mecanismo", tela.every((x) => !proibidas.test(x)), tela.find((x) => proibidas.test(x)));
}

sec("o motor que o App lê responde como a fiação espera");
{
  t("fraseDaManha vazio é a linha de E", typeof fraseDaManha({ tipo: "vazio" }) === "string" && fraseDaManha({ tipo: "vazio" }).length > 10);
  t("fraseDaManha de um lado leva o preço", fraseDaManha({ tipo: "lado", nome: "Ayo", preco: "a carta fica selada" }).includes("a carta fica selada"));
  t("quemAoFogo sem núcleo devolve uma lista vazia (a roda não abre)", Array.isArray(quemAoFogo(null, { presentes: ["x"] })) && quemAoFogo(null, { presentes: ["x"] }).length === 0);
}

console.log(`\n${bons} ok, ${maus} falha(s)`);
if (maus) process.exit(1);
