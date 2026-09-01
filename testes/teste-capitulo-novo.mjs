/* teste-capitulo-novo.mjs (v9.90) — a maçaneta e a herança.

   A porta existia desde a v9.84 e não tinha como ser aberta: `abrirCapitulo`
   estava escrito e ninguém o chamava. E faltava a metade que faz um
   capítulo ser capítulo — um que começa sem antagonista, e depois ganha
   um gerado do zero pela fama, é uma sessão nova que por acaso usa o
   mesmo mapa. */
import fs from "node:fs";
import {
  FORMAS_DE_CAPITULO, formaDeCapitulo, abrirCapitulo, fecharCapitulo,
  garantirHistoria, casarComVilao, diaDoCapitulo, envelopeDoNovoCapitulo,
  linhaDoNovoCapitulo, estruturaPorId,
} from "../src/historia.js";
import {
  HERANCAS, herancaPorId, escolherHeranca, gerarHerdeiro, gerarVilao, linhaDaHeranca,
} from "../src/vilao.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);
const app = fs.readFileSync("../src/App.jsx", "utf8");

const fecharUm = () => {
  const h = casarComVilao(garantirHistoria({ estrutura: "jornada" }), 5).historia;
  return fecharCapitulo(h, { vilao: { nome: "Sarna", titulo: "O Arquiteto" }, dia: 200, causa: "uma espada no peito" });
};

sec("1. AS TRÊS FORMAS");
{
  t("são três", FORMAS_DE_CAPITULO.length === 3);
  t("cada uma diz quem, quando e por quê",
    FORMAS_DE_CAPITULO.every((f) => f.id && f.rotulo && f.quem && f.tempo && f.diz && f.porque));
  t("uma continua com o mesmo herói", FORMAS_DE_CAPITULO.filter((f) => f.quem === "mesmo").length === 1);
  t("e duas trocam de protagonista", FORMAS_DE_CAPITULO.filter((f) => f.quem === "novo").length === 2);
  t("só o prólogo trava o cânone", FORMAS_DE_CAPITULO.filter((f) => f.canoneTravado).length === 1);
  t("e é o que acontece antes", formaDeCapitulo("durante").tempo === "atras");
  t("formaDeCapitulo cai no padrão sem quebrar", formaDeCapitulo("inventada").id === "depois");
}

sec("2. O RELÓGIO ANDA PARA ONDE A FORMA MANDA");
{
  const { registro } = fecharUm();
  const dep = diaDoCapitulo(registro, "depois", { anos: 5 });
  t(`"anos depois" salta para a frente (dia ${registro.fechadoEm} → ${dep})`, dep > registro.fechadoEm);
  t("e o salto é de anos, não de dias", dep - registro.fechadoEm >= 360 * 5);
  t("agora fica onde parou", diaDoCapitulo(registro, "outro", {}) === registro.fechadoEm);
  const antes = diaDoCapitulo(registro, "durante", {});
  t(`o prólogo volta (${registro.fechadoEm} → ${antes})`, antes < registro.fechadoEm);
  /* mas nunca antes do começo: uma história nova que não cruza com a que
     já foi contada não é prólogo, é outra campanha */
  t("e não volta ao dia 1", antes > 1);
  t("nem para número negativo", diaDoCapitulo({ fechadoEm: 2 }, "durante", {}) >= 1);
}

sec("3. O CAPÍTULO ABRE E O MUNDO FICA");
{
  const { historia, registro } = fecharUm();
  const novo = abrirCapitulo(historia, { forma: "depois", dia: registro.fechadoEm, anos: 5 });
  t("o número anda", novo.capitulo === 2);
  t("o arco volta ao primeiro momento", novo.etapa === 0);
  t("sem marcos herdados", novo.marcos === 0 && novo.feitos.length === 0);
  t("o capítulo anterior fica na memória", novo.capitulos.length === 1 && novo.capitulos[0].vilao === "Sarna");
  t("e ele lembra de COMO nasceu", novo.forma === "depois");
  t("o prólogo nasce com o cânone travado", abrirCapitulo(historia, { forma: "durante" }).canoneTravado === true);
  t("e os outros não", novo.canoneTravado === false);
  t("dá para trocar a estrutura", abrirCapitulo(historia, { estrutura: "misterio" }).estrutura === "misterio");
  t("e o dia vem junto", novo.dia > registro.fechadoEm);
}

sec("4. A HERANÇA — o vilão novo nasce da queda do velho");
{
  t(`há heranças de verdade (${HERANCAS.length})`, HERANCAS.length >= 5);
  t("cada uma diz quem é, o que crê e por que existe",
    HERANCAS.every((h) => h.id && h.quem && h.metodo && h.quer && h.porque && typeof h.liga === "function"));
  t("nenhuma é o irmão gêmeo", !HERANCAS.some((h) => /irmã|gêmeo|filho vingador/i.test(h.quem)));
  /* só duas herdam a crença: quando ela sobrevive, o jogador reencontra o
     argumento que já ouviu na boca de outro rosto — e é aí que uma campanha
     começa a parecer uma só história. Todas herdando seria o mesmo vilão. */
  const herdam = HERANCAS.filter((h) => h.herdaCrenca).length;
  t(`poucas herdam a crença (${herdam} de ${HERANCAS.length})`, herdam >= 1 && herdam <= HERANCAS.length / 2);
  t("as que não herdam têm crença própria", HERANCAS.every((h) => h.herdaCrenca || typeof h.crenca === "function"));

  const morto = gerarVilao({ nome: "Sarna", cont: {}, dia: 10, sorte: () => 0.5 });
  const vistos = new Set();
  for (let i = 0; i < 60; i++) {
    const h = gerarHerdeiro(morto, { nome: "Corvo", dia: 400, sorte: () => (i * 0.0173 + 0.01) % 1 });
    vistos.add(h.heranca);
    /* o herdeiro é um vilão COMPLETO: mesmo plano, mesmas fases */
    if (i === 0) {
      t("o herdeiro começa no rumor", h.fase === "rumor" && h.passo === 0);
      t("e desconhecido", h.conhecido === false);
      t("com assinatura própria", !!h.assinatura);
      t("e sem as marcas do morto", (h.marcas || []).length === 0);
      t("mas sabendo de quem veio", h.veioDe === "Sarna" && !!h.liga);
    }
  }
  t(`todas as heranças saem (${vistos.size} de ${HERANCAS.length})`, vistos.size >= HERANCAS.length - 1);

  /* as marcas do morto NÃO passam: são o que o herói perdeu para ELE, e
     herdá-las faria o novo cobrar uma conta que não é dele */
  const comMarcas = { ...morto, marcas: [{ nome: "Marta" }, { nome: "Vale Torto" }] };
  t("as marcas não são herdadas", (gerarHerdeiro(comMarcas, { nome: "X", sorte: () => 0.5 }).marcas || []).length === 0);
  /* sem anterior, é um vilão comum: o primeiro capítulo não herda nada */
  const semPai = gerarHerdeiro(null, { nome: "Primeiro", sorte: () => 0.5 });
  t("sem anterior, nasce um vilão comum", !semPai.heranca && !semPai.veioDe);
  t("e ele continua completo", !!semPai.crenca && !!semPai.quer && semPai.fase === "rumor");

  const h2 = gerarHerdeiro(morto, { nome: "Corvo", sorte: () => 0.5 });
  t("a linha da herança nomeia o morto", linhaDaHeranca(h2).includes("Sarna"));
  t("e manda não explicar a mecânica", /sem explicar a mecânica/.test(linhaDaHeranca(h2)));
  t("sem herança, sem linha", linhaDaHeranca(semPai) === "");
  t("herancaPorId acha e não inventa", !!herancaPorId(HERANCAS[0].id) && herancaPorId("nao_existe") === null);
}

sec("5. OS ENVELOPES DE ABERTURA");
{
  const { registro } = fecharUm();
  const dep = envelopeDoNovoCapitulo(registro, "depois", { anos: 5, cidade: "Pedra Fria" });
  t("o salto abre pelo MUNDO, não por mim", /abra com o MUNDO, não comigo/.test(dep));
  t("e diz quantos anos", /5 anos/.test(dep));
  t("proíbe resumir o capítulo anterior", /NÃO resuma o capítulo anterior/.test(dep));
  t("e proíbe abrir ameaça nova", /NÃO abra ameaça nova/.test(dep));

  const out = envelopeDoNovoCapitulo(registro, "outro", { heroiAnterior: "Vaska", cidade: "Pedra Fria" });
  t("o herói anterior vira lenda", /trate o herói anterior como LENDA/.test(out));
  t("com o nome dele", /Vaska/.test(out));
  t("e eu não sou herdeiro dele", /NÃO me faça herdeiro de nada/.test(out));

  const pro = envelopeDoNovoCapitulo(registro, "durante", { cidade: "Pedra Fria" });
  /* a regra do prólogo: o desfecho é fato, e é isso que torna a forma
     interessante em vez de confusa */
  t("o prólogo diz que o desfecho é fato", /o desfecho é FATO/.test(pro));
  t("nomeia quem cai", /Sarna/.test(pro));
  t("mostra o preço, não o milagre", /mostre o preço, não o milagre/.test(pro));
  t("e proíbe salvar quem já se perdeu", /NÃO me deixe salvar quem já se perdeu/.test(pro));
  /* e o jogador não pode saber que está num prólogo: para ele é o presente */
  t("não diz ao jogador que é prólogo", /NÃO diga que estou num prólogo/.test(pro));

  for (const f of FORMAS_DE_CAPITULO) {
    const e = envelopeDoNovoCapitulo(registro, f.id, { anos: 5 });
    t(`${f.id}: devolve a palavra ao jogador`, /Termine com a palavra comigo/.test(e));
  }
  t("a linha da tela não nomeia etapa nem estrutura",
    linhaDoNovoCapitulo(2, "depois") === "📖 Capítulo 2 — anos depois.");
}

sec("6. A LIGAÇÃO NO APP");
{
  t("a porta aparece quando o capítulo fecha", /setOfertaCapitulo\(fc\.registro\)/.test(app));
  t("o painel só existe se houver oferta", /\{ofertaCapitulo && \(/.test(app));
  t("e mostra as três formas", /FORMAS_DE_CAPITULO\.map\(\(f\) =>/.test(app));
  t("cada botão abre a sua", /abrirProximoCapitulo\(f\.id, f\.anosPadrao\)/.test(app));
  t("a porta some ao ser usada", /setOfertaCapitulo\(null\);/.test(app));

  const exe = app.split("const abrirProximoCapitulo")[1].split("\n  };")[0];
  t("as que trocam de herói vão à criação", /setFase\("personagem"\)/.test(exe));
  t("e guardam a forma no ref", /capituloNovoRef\.current = \{ forma: f\.id/.test(exe));
  t("o mesmo herói gera o herdeiro na hora", /gerarHerdeiro\(nemesisRef\.current/.test(exe));
  t("e a mesa recomeça limpa", /mesaRef\.current = garantirMesa\(null\)/.test(exe) && /estanteRef\.current = garantirEstante\(null\)/.test(exe));

  /* O MUNDO FICA — é a única coisa que separa capítulo de campanha */
  const ini = app.split("const iniciar = (pers)")[1].split("\n  };")[0];
  t("o cânone fica no capítulo", /if \(!cap\) \{ canoneRef\.current = \{\}; npcsRef\.current = \{\}/.test(ini));
  t("o mapa fica", /if \(!cap\) \{\s*\r?\n\s*mapaRef\.current = \{/.test(ini));
  t("as descobertas ficam", /if \(!cap\) \{ descobRef\.current = \[\]/.test(ini));
  t("a base do mundo fica", /if \(!cap\) \{ baseMundoRef\.current = garantirBase\(null\)/.test(ini));
  t("o banco de nomes fica", /if \(!cap\) bancoNomesRef\.current = gerarBancoNomes/.test(ini));
  /* mas os feitos são do HERÓI e somem com ele */
  t("os contadores zeram sempre", /contRef\.current = \{ \.\.\.CONTADORES_INICIAIS \};/.test(ini));
  /* e no prólogo o vilão do capítulo passado continua vivo: é ele que o
     jogador vai cruzar antes de saber o fim */
  t("o prólogo mantém o vilão anterior", /cap\.forma === "durante" \? garantirVilao\(nemesisRef\.current\)/.test(ini));
  t("e as outras geram o herdeiro", /: gerarHerdeiro\(nemesisRef\.current/.test(ini));
  t("a abertura do capítulo tem envelope próprio", /envelopeDoNovoCapitulo\(cap\.reg, cap\.forma/.test(ini));
}

console.log(`\ncapítulo novo v9.90: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
