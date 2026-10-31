/* teste-balcao-so-na-rua.mjs (31/10/2026, resto da 13.ª sessão) — a tocha não tem preço dentro da Cripta

   O DEFEITO (irmão do T23 da 13.ª, achado no fecho do motor, 69573b7): o
   preço do BALCÃO de mantimentos (`balcaoParaPauta`, src/bolsa-da-frase.js)
   tinha na pauta do turno (src/motor/pauta-do-turno.js) o mesmo portão velho
   que o preço comum tinha antes do conserto — «fora da luta e com cidade».
   A cidade fica marcada na estrada e dentro da masmorra; logo, dentro da
   Cripta do Corvo, «quanto custa uma tocha?» recebia «no balcão de
   mantimentos: tocha ◉ N cada» — o balcão da rua lá de cima, que ali não
   existe. O Narrador recebia do sistema um preço que não era verdade ali.

   Não há frase gravada que o mostre (nenhum turno do corpus pergunta o preço
   de um mantimento dentro da masmorra): o caso é montado. A suíte corre a
   PEÇA da pauta (`aPautaDoTurno`) sobre um caso do corpus que já está DENTRO
   da Cripta do Corvo (com cidade marcada, fora da luta e da estrada), com a
   frase trocada pela da tocha. Põe-no na rua (a masmorra tirada: o preço do
   balcão vem), dentro da Cripta (cala), na estrada (cala) e na luta (cala,
   como sempre calou). O portão é o do preço comum e o da mesa que fecha o
   buraco: cidade, fora da estrada, da masmorra e da luta.
   FALHA ANTES: dentro da Cripta e na estrada, a pergunta da pauta levava
   «no balcão de mantimentos: tocha ◉ … cada». */
import { lerODourado, casosDaPauta, correrAPeca, osModulos, osPadroes } from "./pauta-bloco.mjs";
import { aPautaDoTurno } from "../src/motor/pauta-do-turno.js";
import { textoDaPauta } from "../src/pauta.js";
import { balcaoParaPauta } from "../src/bolsa-da-frase.js";
import { balcaoDeMantimentos } from "../src/mercado.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const FRASE = "quanto custa uma tocha?";
const BALCAO = "no balcão de mantimentos:";
const D = lerODourado();
const padroes = osPadroes(D, await osModulos(D.imports));

sec("1. a frase pergunta o preço de um mantimento — é o balcão que responde, onde há balcão");
{
  const r = balcaoParaPauta(FRASE, { balcao: balcaoDeMantimentos({ nome: "X", porte: "vila" }), moeda: "moedas" });
  t("a tocha é do balcão de mantimentos", r.pergunta.length === 1 && r.pergunta[0].startsWith(BALCAO) && /tocha/i.test(r.pergunta[0]), JSON.stringify(r.pergunta));
}

sec("2. a peça da pauta: na rua sim; dentro da Cripta, na estrada e na luta, não");
{
  const k0 = casosDaPauta().find((x) => x.estado && x.estado.cidadeAtual && x.estado.personagem
    && x.estado.masmorra && x.estado.masmorra.nome === "a Cripta do Corvo" && !x.estado.combate && !x.estado.jornada);
  t(`há no corpus um caso dentro da Cripta do Corvo, com cidade marcada (o caso ${k0 && k0.i}, em ${k0 && k0.estado.cidadeAtual})`, !!k0);
  const correr = (estado) => {
    const a = correrAPeca(aPautaDoTurno, { ...k0, frase: FRASE, estado: { ...k0.estado, ultimaAcao: FRASE, ...estado } }, D, padroes);
    const p = a.p || {};
    return { erro: a.erro, pergunta: Array.isArray(p.pergunta) ? p.pergunta : [], texto: a.erro ? "" : textoDaPauta(p) };
  };
  const temBalcao = (r) => r.pergunta.some((l) => String(l).startsWith(BALCAO)) || r.texto.includes(BALCAO);
  const rua = correr({ masmorra: null, lugar: null });
  t(`na rua de ${k0.estado.cidadeAtual}: a pauta diz o preço da tocha no balcão`, !rua.erro && temBalcao(rua), rua.erro || JSON.stringify(rua.pergunta));
  const dentro = correr({});
  t("dentro da Cripta do Corvo: o preço do balcão cala", !dentro.erro && !temBalcao(dentro), dentro.erro || JSON.stringify(dentro.pergunta));
  t("e a pauta lá dentro continua a ser pauta (não é ela que se cala)", !dentro.erro && dentro.texto.length > 0);
  const estrada = correr({ masmorra: null, jornada: { de: k0.estado.cidadeAtual, para: "Outro Lugar", dias: 2, diaAtual: 1 } });
  t("na estrada: o preço do balcão cala (a rua ficou para trás)", !estrada.erro && !temBalcao(estrada), estrada.erro || JSON.stringify(estrada.pergunta));
  const luta = correr({ masmorra: null, combate: { ativo: true, rodada: 1, inimigos: [] } });
  t("na luta: o preço do balcão cala, como sempre calou", !luta.erro && !temBalcao(luta), luta.erro || JSON.stringify(luta.pergunta));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
