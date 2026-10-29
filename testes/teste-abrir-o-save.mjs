/* teste-abrir-o-save.mjs (Fase 4, trilha B · 29/10/2026) — o save aberto como o load o abre

   A peça (src/abrir-o-save.js) é a regra do `continuar` do App para dez
   campos — a ficha, o nome da campanha e os oito de NULO_QUE_O_LOAD_REFAZ —,
   tirada do App sem lhe mexer. O que se prova:
     1. a régua contra o App: cada regra que a peça segue está no load de HEAD
        (a mesma função, o mesmo número), ou o load já chama a peça;
     2. o que ela faz a cada campo, com o nulo, o antigo e o torto;
     3. o que é só da sentada (o teto do sono, a oferta que vai ao mural);
     4. idempotente (abrir o aberto dá o mesmo), determinista, imutável, e o
        lixo é o save vazio, aberto;
     (5, a ligação ao servidor e às sessões de prova, espera a trilha A:
     ver o fim do arquivo.) */
import fs from "node:fs";

const { abrirOSave, aSementeDoSave, ABRIR_O_SAVE } = await import("../src/abrir-o-save.js");
const { NULO_QUE_O_LOAD_REFAZ } = await import("../src/motor/eco-do-turno.js");
const { estadoNoTurno } = await import("../src/sessao.js");
const { migrarPersonagem } = await import("../src/regras-jogo.js");
const { AMANHECER } = await import("../src/calendario.js");

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = JSON.stringify;

sec("1. A RÉGUA CONTRA O LOAD DO APP");
{
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const ini = app.indexOf("const continuar = (comResumo");
  const corpo = ini >= 0 ? app.slice(ini, app.indexOf("\n  const continuarGolpeDoJogador", ini)) : "";
  t(`o load do App é achado (${corpo.length} letras)`, corpo.length > 10000);
  const jaChama = /abrirOSave\(/.test(corpo);
  /* cada regra da peça, pela âncora no load (a troca no App, quando vier,
     passa a chamar a peça — e então basta que a chame) */
  const ANCORAS = {
    personagem: ["migrarPersonagem(sv.personagem)"],
    nomeCampanha: ["setNomeCampanha(nomeDaCampanha(sv))"],
    mapa: ["garantirGeografia(mapaRef.current, `taverna|${sv.personagem && sv.personagem.nome ? sv.personagem.nome : \"save\"}`)", "gerarGeografia(`taverna|", "if (!sv.nevoaVersao)", "nevoaVersaoRef.current = 1", "pisarNaCidade(mapaRef.current, cidadeAtualRef.current)"],
    guildas: ["sv.guildas.map(garantirGuilda)", "guildasDoMundo(sementeMundo(), mapaRef.current, generoMundo(), (sv.mundo || {}).lexico)"],
    missoes: ["garantirMissoes(sv.missoes)", "dia: 999999", "migrarTarefasAntigas(questsRef.current, missoesRef.current", "cartazDaProposta("],
    historia: ["garantirHistoria(sv.historia && sv.historia.estrutura ? sv.historia : { estrutura: (sv.mundo && sv.mundo.estrutura) || \"jornada\", etapa: 0 })"],
    governos: ["garantirGovernos(sv.governos, mapaRef.current)"],
    reino: ["garantirReino(sv.reino && typeof sv.reino === \"object\" ? sv.reino : {}, mapaRef.current) || {}"],
    devocao: ["garantirDevocao(sv.devocao, mapaRef.current, divindadeRef.current)", "garantirDivindade(sv.divindade)"],
    acordouAbs: ["(diaRef.current - 1) * 1440 + minutoRef.current", "> 48 * 60 ? agoraAbs : bruto", "AMANHECER + 60"],
  };
  t("a peça abre exatamente os dez campos da régua", J([...ABRIR_O_SAVE.campos].sort()) === J(Object.keys(ANCORAS).sort()));
  const faltam = Object.entries(ANCORAS).flatMap(([c, as]) => as.filter((a) => !corpo.includes(a)).map((a) => `${c}: ${a.slice(0, 50)}`));
  t(`cada regra está no load de HEAD (${Object.values(ANCORAS).flat().length} âncoras)${jaChama ? ", ou o load já chama a peça" : ""}`, jaChama || !faltam.length, faltam.join(" | "));
  t("os números da tabela são os do load (48 horas, uma hora depois do amanhecer, o dia do legado)", ABRIR_O_SAVE.horasAcordadoMax === 48 && ABRIR_O_SAVE.minutoDepoisDoAmanhecer === 60 && ABRIR_O_SAVE.diaDoLegado === 999999 && ABRIR_O_SAVE.estruturaPadrao === "jornada");
  t("os oito de NULO_QUE_O_LOAD_REFAZ são campos da peça", Object.keys(NULO_QUE_O_LOAD_REFAZ).every((c) => ABRIR_O_SAVE.campos.includes(c)) && Object.keys(NULO_QUE_O_LOAD_REFAZ).length === 8);
  /* a semente do mundo é a do topo do load (semearACasa) e a da MM14 */
  t("a semente do save é a do semearACasa do load", corpo.includes("semearACasa(`${nomeDaCampanha(sv) || \"aventura\"}|${(sv.mundo && sv.mundo.genero) || \"\"}`)") && aSementeDoSave({ personagem: { nome: "Rufo" }, mundo: { genero: "Steampunk" } }) === "A saga de Rufo|Steampunk");
}

sec("2. CAMPO A CAMPO");
{
  const SV = { personagem: { nome: "Halda", classe: "Guerreiro", nivel: 3, vida: 10, vidaMax: 20 }, mundo: { genero: "Fantasia medieval" }, cidadeAtual: "", dia: 3, minuto: 600 };
  const e = abrirOSave(SV);
  t("a ficha é a de migrarPersonagem", J(e.personagem) === J(migrarPersonagem(SV.personagem)));
  t("o save mudo volta como «A saga de Halda»", e.nomeCampanha === "A saga de Halda");
  t("o nome gravado manda", abrirOSave({ ...SV, nomeCampanha: "O Mar de Halda" }).nomeCampanha === "O Mar de Halda");
  t(`sem cidades, o mundo inteiro é gerado (${e.mapa.cidades.length} cidades, ${e.mapa.regioes.length} regiões), todo revelado (save sem névoa)`, e.mapa.cidades.length >= 5 && e.mapa.cidades.every((c) => c.descoberta === true) && e.nevoaVersao === 1);
  t("a geografia nasce do nome do herói (outro herói, outro mundo)", J(abrirOSave({ ...SV, personagem: { ...SV.personagem, nome: "Brann" } }).mapa.cidades.map((c) => c.nome)) !== J(e.mapa.cidades.map((c) => c.nome)));
  const comMapa = abrirOSave({ ...SV, nevoaVersao: 1, cidadeAtual: "Vau", mapa: { cidades: [{ nome: "Vau", descoberta: true }, { nome: "Foz", descoberta: false }] } });
  t("com cidades, a geografia completa-se (porte, população, bioma) e a névoa fica", comMapa.mapa.cidades.every((c) => c.porte && c.populacao > 0 && c.bioma) && comMapa.mapa.cidades[1].descoberta === false);
  t("e a cidade onde o save parou é pisada", comMapa.mapa.cidades[0].pisada === true && !comMapa.mapa.cidades[1].pisada);
  t(`as guildas nascem do mapa (${e.guildas.length}), e as que o save tem ficam`, e.guildas.length > 0 && J(abrirOSave({ ...SV, guildas: e.guildas }).guildas) === J(e.guildas));
  t("a história parte da estrutura do mundo", abrirOSave({ ...SV, mundo: { ...SV.mundo, estrutura: "misterio" } }).historia.estrutura === "misterio" && e.historia.estrutura === "jornada");
  const legado = abrirOSave({ ...SV, quests: [{ titulo: "Achar o anel", status: "ativa", objetivo: "o anel da avó" }, { titulo: "Velha", status: "concluida" }] });
  const m = legado.missoes.find((x) => x.titulo === "Achar o anel");
  /* as duas migrações do load, em cadeia: a v9.27 faz da quest ativa uma
     missão-legado (o dia inalcançável), e a MM14 troca o legado pela missão
     do sistema e marca a quest como migrada */
  t("sem lista de missões, a quest antiga ativa vira missão do sistema (v9.27 e MM14), e a quest fica migrada", !!m && m.veiculo === "tarefa_antiga" && m.status === "ativa" && legado.quests[0].status === "migrada" && !legado.missoes.some((x) => x.titulo === "Velha"));
  const dominio = { ...SV, mapa: { cidades: [{ nome: "Vau", relacao: "jogador", tipo: "vila" }] } };
  const d = abrirOSave(dominio);
  t("o domínio ganha governo e reino; a fé ganha a cidade", !!d.governos.Vau && !!d.reino.Vau && d.reino.Vau.populacao > 0 && !!d.devocao.cidades.Vau);
  t("o reino que nasce rola na casa do save (determinista)", J(abrirOSave(dominio).reino) === J(d.reino));
  t("os fiéis antigos sem endereço espalham-se pelo mapa", (() => { const x = abrirOSave({ ...dominio, divindade: { fieis: 50 } }).devocao; return Object.values(x.cidades).reduce((s, c) => s + c.fe, 0) + x.andarilhos > 0; })());
  t("sem relógio, acordou agora (dia 1, uma hora depois do amanhecer)", abrirOSave({}).acordouAbs === AMANHECER + 60);
  t("com relógio, acordou quando o save diz", abrirOSave({ ...SV, acordouAbs: 2000 }).acordouAbs === 2000);
}

sec("3. O QUE É DA SENTADA");
{
  const agora = (3 - 1) * 1440 + 600;
  const velho = { personagem: { nome: "Halda" }, dia: 3, minuto: 600, acordouAbs: 0 };
  t("na sentada, acordado há mais de 48 horas é acordou agora (o conserto do acordouAbs = 0)", abrirOSave(velho).acordouAbs === agora);
  t("no servidor (naSentada: false), o cansaço fica", abrirOSave(velho, { naSentada: false }).acordouAbs === 0);
  const oferta = { personagem: { nome: "Halda", nivel: 2 }, cidadeAtual: "Vau", missoes: [{ titulo: "Escoltar o mercador", tipo: "favor", status: "oferecida", dador: "Orlo", etapas: [{ tipo: "ir", alvo: "Foz" }], recompensa: { moedas: 30 } }], mural: [] };
  const naSentada = abrirOSave(oferta), noServidor = abrirOSave(oferta, { naSentada: false });
  t(`na sentada, a oferta parada no diário vai ao mural (${(naSentada.mural || []).length} cartaz)`, (naSentada.mural || []).length === 1 && !naSentada.missoes.some((q) => q.status === "oferecida"));
  t("no servidor, fica onde o Mestre a pôs", noServidor.missoes.some((q) => q.status === "oferecida") && noServidor.mural === oferta.mural);
}

sec("4. IDEMPOTENTE, DETERMINISTA, IMUTÁVEL, E O LIXO");
{
  const SESSOES = ["s8", "s9", "s10", "navegador"].map((s) => [s, JSON.parse(fs.readFileSync(new URL(`./sessao-${s}.json`, import.meta.url), "utf8"))]);
  let casos = 0, idem = 0, det = 0, imut = 0;
  for (const [, A] of SESSOES) for (const n of [0, 1, Math.floor(A.turnos.length / 2), A.turnos.length]) {
    const e = estadoNoTurno(A, n), antes = J(e);
    const a = abrirOSave(e, { naSentada: false });
    casos++;
    if (J(abrirOSave(a, { naSentada: false })) === J(a) && J(abrirOSave(a)) === J(abrirOSave(abrirOSave(a)))) idem++;
    if (J(abrirOSave(e, { naSentada: false })) === J(a)) det++;
    if (J(e) === antes) imut++;
  }
  t(`abrir o aberto dá o mesmo (${idem}/${casos}, nas quatro sessões, com e sem a sentada)`, idem === casos);
  t(`o mesmo save dá o mesmo aberto (${det}/${casos})`, det === casos);
  t(`o save de entrada não muda (${imut}/${casos})`, imut === casos);
  const vazio = abrirOSave({});
  t("o lixo (null, lista, texto) é o save vazio, aberto", [null, undefined, [], "x", 3].every((x) => J(abrirOSave(x)) === J(vazio)));
  t("e a ficha que não é ficha não se migra", abrirOSave({ personagem: null }).personagem === null && abrirOSave({ personagem: "x" }).personagem === "x");
  t("opções lixo valem as de omissão", J(abrirOSave({ dia: 2 }, null)) === J(abrirOSave({ dia: 2 })));
}

/* 5. O SERVIDOR E AS SESSÕES DE PROVA: a ligação (a montagem do servidor abre
   o save por esta peça; as sessões de Node regravam-se abertas) espera a
   trilha A — regrava os casos de que os dourados da pauta, do pedido e do
   prelúdio são fotos. Está no diário de 29/10. */

console.log(`\n${ok} ok, ${mal} mal`);
process.exit(mal ? 1 : 0);
