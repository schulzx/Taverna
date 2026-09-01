/* teste-lugar.mjs (v9.93) — o Mestre passa a saber ONDE.

   "A questão da localização e geografia o mestre tem que saber: ele sabe
   onde o player está e onde os personagens estão."

   O buraco era concreto e mensurável: um assunto de CERCO germinava numa
   aldeia de cinquenta almas que não tem porta para fechar, e um
   REENCONTRO podia ser escolhido com a única pessoa conhecida da campanha
   sentada na minha frente. Nos dois casos o Mestre pedia ao narrador uma
   cena que o mundo não comporta — e a IA não tem como recusar, então ela
   inventa o portão. */
import fs from "node:fs";
import { ASSUNTOS, assuntoPorId, escolherAssunto, garantirCompasso, avancarCompasso } from "../src/compasso.js";
import { garantirSituacao } from "../src/biblioteca.js";
import { VOZES, VOZ_PADRAO } from "../src/vozes.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);
const app = fs.readFileSync("../src/App.jsx", "utf8");

const abre = (id, sit) => {
  const a = assuntoPorId(id);
  return !!a && (!a.quando || a.quando(garantirSituacao(sit)));
};

sec("1. A RÉGUA DO PORTE");
{
  const aldeia = { emCidade: true, momento: 0.6, porte: "aldeia", pessoaNaCena: true };
  const cidade = { ...aldeia, porte: "cidade" };
  const capital = { ...aldeia, porte: "capital" };

  /* um cerco precisa de portão, uma revolta precisa de multidão */
  t("cerco não germina numa aldeia", !abre("cerco", aldeia));
  t("mas germina numa cidade", abre("cerco", cidade));
  t("revolta não germina numa aldeia", !abre("revolta", aldeia));
  t("escassez não germina numa aldeia", !abre("escassez", aldeia));
  t("festa não germina numa aldeia", !abre("festa", aldeia));

  /* lei nova e sucessão pedem mais: tem de haver quem assine */
  t("lei nova não germina numa vila", !abre("lei_nova", { ...aldeia, porte: "vila" }));
  t("mas germina numa cidade", abre("lei_nova", cidade));
  t("sucessão pede cidade também", !abre("sucessao", { ...aldeia, porte: "vila" }) && abre("sucessao", capital));

  /* PORTE DESCONHECIDO NÃO PASSA: num save antigo ou numa cena fora de
     cidade, afirmar que há portão é justamente o que se quer evitar. O
     lado seguro de uma lacuna é o silêncio, nunca a permissão. */
  t("porte vazio não abre nada da escada", !abre("cerco", { ...aldeia, porte: "" }));
  t("nem porte inventado", !abre("cerco", { ...aldeia, porte: "metrópole-do-céu" }));
  /* e a ruína, que não tem ninguém, também não */
  t("ruína não tem revolta", !abre("revolta", { ...aldeia, porte: "ruina" }));

  /* mas os assuntos que não dependem de tamanho continuam abrindo numa
     aldeia — senão a régua teria esvaziado o lugar pequeno */
  const naAldeia = ASSUNTOS.filter((a) => !a.quando || a.quando(garantirSituacao(aldeia)));
  t(`a aldeia continua tendo repertório (${naAldeia.length} assuntos)`, naAldeia.length >= 12);
  t("e a onda germina lá", !!escolherAssunto(aldeia, { sorte: () => 0.5 }));
}

sec("2. ONDE ESTÃO AS PESSOAS");
{
  const base = { emCidade: true, momento: 0.6, porte: "cidade", pessoaNaCena: true, temGenteConhecida: true };
  /* REENCONTRO exige alguém conhecido que NÃO esteja aqui. Sem isto ele
     podia ser escolhido com a única pessoa conhecida na minha frente, e a
     IA teria de inventar de onde ela reapareceu. */
  t("sem ninguém longe, não há reencontro", !abre("reencontro", { ...base, genteLonge: 0 }));
  t("com alguém longe, há", abre("reencontro", { ...base, genteLonge: 2 }));
  /* e DESPEDIDA é o contrário: só se despede quem está aqui */
  t("sem ninguém por perto, não há despedida", !abre("despedida", { ...base, gentePorPerto: 0, temGrupo: false }));
  t("com gente por perto, há", abre("despedida", { ...base, gentePorPerto: 1 }));
  t("ou com grupo", abre("despedida", { ...base, gentePorPerto: 0, temGrupo: true }));
  /* as duas contagens não são o inverso uma da outra: dá para ter gente
     aqui E gente longe ao mesmo tempo, e é o caso comum */
  t("as duas contagens convivem",
    abre("reencontro", { ...base, gentePorPerto: 3, genteLonge: 2 }) && abre("despedida", { ...base, gentePorPerto: 3, genteLonge: 2 }));
}

sec("3. TEM PARA ONDE IR");
{
  const base = { emCidade: true, momento: 0.4, porte: "vila" };
  t("sem vizinha conhecida, não há caminho a descobrir", !abre("descoberta_de_mapa", { ...base, diasAteVizinha: 0 }));
  t("com vizinha, há", abre("descoberta_de_mapa", { ...base, diasAteVizinha: 3 }));
}

sec("4. O APP ENTREGA O LUGAR");
{
  t("há um montador do lugar", /const lugarDaMesa = \(\) => \{/.test(app));
  t("e ele entra por spread na situação", /\.\.\.lugarDaMesa\(\),/.test(app));
  const g = app.split("const lugarDaMesa")[1].split("\n  };")[0];
  t("o porte vem da cidade atual", /porte: \(aqui && aqui\.porte\)/.test(g));
  t("a gente vem do elenco da cena", /elencoDaCena\(npcsRef\.current/.test(g));
  t("aqui e longe são contados separados", /gentePorPerto: \(el\.aqui \|\| \[\]\)\.length/.test(g) && /genteLonge: \(el\.longe \|\| \[\]\)\.length/.test(g));
  /* SÓ O QUE O JOGADOR JÁ DESCOBRIU conta como saída: um caminho que ele
     não conhece não é uma saída, é névoa */
  t("só rotas para cidades descobertas contam", /conhecidas\.has\(r\.para\)/.test(g) && /c\.descoberta/.test(g));
  t("protegido por try", /try \{/.test(g) && /catch \{ return \{\}; \}/.test(g));
}

sec("5. A ONDA CEDE AO VILÃO");
{
  /* O passo dele e o clímax do compasso podiam cair no mesmo turno, e nada
     os coordenava. É o MESMO defeito que `segurar` já resolvia para
     combate, masmorra e viagem — só que ninguém tinha ligado o vilão. */
  const g = app.split("const talvezAndarOCompasso")[1].split("\n  };")[0];
  t("a onda repara no envelope do vilão", /— MOVIMENTO DO SISTEMA\]/.test(g));
  t("na revelação", /MOMENTO ÚNICO DA CAMPANHA/.test(g));
  t("e na queda", /\[A QUEDA —/.test(g));
  /* e ela ESPERA sem perder o turno: a onda é cíclica e pode adiar, o
     passo do vilão acontece uma vez a cada seis dias de campanha */
  t("e devolve o turno em vez de perdê-lo", /turnos: Math\.max\(0, \(compassoRef\.current\.turnos \|\| 0\) - 1\)/.test(g));

  /* o comportamento em si, sem o App: `segurar` continua sendo a via */
  let c = garantirCompasso(null);
  const antes = { ...c };
  c = avancarCompasso(c, { emCidade: true }, { segurar: true }).compasso;
  t("segurando, nada anda", c.turnos === antes.turnos && c.movimento === antes.movimento);
}

sec("6. A VOZ PODE SER TROCADA NO CAPÍTULO");
{
  /* Ela era escolhida na criação e ficava para sempre. O capítulo novo é o
     único ponto da campanha em que trocar a boca não soa como o narrador
     tendo uma crise no meio de uma frase. */
  t("há um trocador de voz", /const trocarVoz = \(id\) => \{/.test(app));
  const g = app.split("const trocarVoz")[1].split("\n  };")[0];
  t("ele troca UM campo do mundo", /voz: id \}/.test(g));
  t("e salva", /salvar\(\{ mundo: m \}\)/.test(g));
  /* não há estado novo: o prompt inteiro se remonta na próxima chamada,
     porque `vozPrompt` lê de `mundo` */
  t("sem estado novo", !/vozRef/.test(app));

  t("o painel do capítulo oferece as vozes", /E a voz, se quiser outra/.test(app));
  t("e marca a que está em uso", /\(\(mundoAtual\(\) \|\| \{\}\)\.voz \|\| VOZ_PADRAO\) === v\.id/.test(app));
  /* e SÓ ali: oferecer a troca no meio de um capítulo seria deixar o
     jogador mudar a boca do narrador entre duas frases da mesma cena */
  t("e só ali", (app.match(/trocarVoz\(v\.id\)/g) || []).length === 1);
  t("as oito continuam disponíveis", VOZES.length === 8 && !!VOZ_PADRAO);
}

console.log(`\nlugar v9.93: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
