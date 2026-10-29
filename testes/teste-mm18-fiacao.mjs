/* A FIAÇÃO DA MM18 (Fase MM, 11/10) — o Mestre que escuta, e a história
   que não se oferece, ligados no App.jsx

   O backend fechou o motor em três versões (v9.372–v9.374) e deixou no
   diário o mapa de chamada: sem a fiação, `escuta.js` não tinha leitor no
   jogo e o mural continuava a receber a gente da história pelo nome. Esta
   suíte prova as duas metades da fiação, e as duas falhavam antes dela:

     1. o App LÊ o que o motor expõe — os pontos de chamada, na ordem certa
        (o pedido lido antes do compasso; a nota cortada antes da escada
        andar; a frase do jogador depois do rodapé), o campo novo do save
        e o mural que recusa a gente da história e deixa o papel vencer;
     2. os números, com a fiação ligada:
        · o registo da 4.ª sessão (`registo-s4-escuta.json`: os 23 turnos do
          jogador fora da luta, a frase e o cabeçalho de cada envelope que
          o pedido levou), repassado pelo MESMO caminho que `enviar` faz —
          23 empurrões em 18 turnos → no máximo 10, nunca mais de 1;
        · 200 mundos novos, o mural da cidade de partida com os argumentos
          que o App passa — N com gente da história → 0. */
import fs from "node:fs";

const RAIZ = "../src/";
const E = await import(RAIZ + "escuta.js");
const O = await import(RAIZ + "ofertas.js");
const A = await import(RAIZ + "abertura.js");
const G = await import(RAIZ + "geografia.js");
const S = await import(RAIZ + "saga.js");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const pos = (frag) => APP.indexOf(frag);
const quantas = (frag) => APP.split(frag).length - 1;

/* o corpo de `enviar`, do envio à chamada: a ordem só vale lá dentro */
const iEnviar = pos("ultimoPedidoRef.current = String(conteudo || \"\").trimStart().startsWith(\"[\")");
const iChamada = pos("await chamarMestre(systemRef.current, novoHist)");
const ENVIAR = iEnviar >= 0 && iChamada > iEnviar ? APP.slice(iEnviar, iChamada) : "";
const ord = (...frags) => {
  let ultimo = -1;
  for (const f of frags) { const i = ENVIAR.indexOf(f, ultimo + 1); if (i < 0) return false; ultimo = i; }
  return true;
};

sec("1. o App importa a escuta e as duas peças novas do mural");
{
  const imp = APP.match(/import \{([^}]*)\} from "\.\/escuta\.js";/);
  /* (movido, T1-A 8.ª fatia: o pedido e o passo da escuta foram para src/motor/antes-do-mestre.js;
     `andarAEscuta`, `contarOAvanco` e `seguraOMundo` já não são do App — quem os chama é o motor,
     e o App chama `oPedidoDaEscuta` e `aEscutaAnda`. As onze peças chegam, as três pelo motor) */
  /* (trilha A, 29/10) seis no App: a pauta do turno mudou-se para src/motor/pauta-do-turno.js e levou consigo o `degrauDaEscuta` e a `linhaDoRumo` (a linha do RUMO é dela) */
  /* (trilha A, 29/10) três no App: o trecho de `enviar` da pauta ao system mudou-se para src/motor/pedido-do-turno.js e levou o `escutarOTurno`, o `separarEnvelopes`, o `fechoDoPedido` e o `aEscutaAnda` (a escuta que corta e a que anda são dele) */
  const pecas = ["lerOPedido", "fioDaHistoria", "garantirEscuta"];
  const im2 = APP.match(/import \{([^}]*)\} from "\.\/motor\/antes-do-mestre\.js";/);
  t("escuta.js é importado, com as onze peças do mapa de chamada", !!imp && pecas.every((p) => new RegExp(`\\b${p}\\b`).test(imp[1])) && !!im2 && /\boPedidoDaEscuta\b/.test(im2[1]), imp ? "" : "sem import");
  const of = APP.match(/import \{([^}]*)\} from "\.\/ofertas\.js";/);
  t("ofertas.js entrega genteDaHistoria e cartazVencido", !!of && /\bgenteDaHistoria\b/.test(of[1]) && /\bcartazVencido\b/.test(of[1]));
}

sec("2. o estado: um campo novo do save, ignorado pela versão antiga");
{
  t("o ref nasce do garantir (lixo vira zero)", quantas("const escutaRef = useRef(garantirEscuta(null));") === 1);
  t("vai no retrato que o save grava", /escada: escadaRef\.current, escuta: escutaRef\.current,/.test(APP));
  t("volta no load pelo garantir (save antigo sem o campo começa em zero)", /escutaRef\.current = garantirEscuta\(sv\.escuta\)/.test(APP));
  t("e o turno desfeito devolve a escada que havia", /escutaRef\.current = r\.escuta !== undefined \? garantirEscuta\(r\.escuta\)/.test(APP));
  t("os adiados não atravessam um load (são de um turno só)", /garantirEscuta\(sv\.escuta\); adiadosEscutaRef\.current = \[\];/.test(APP));
}

sec("3. a ordem em enviar: ler, segurar, cortar, andar, e a frase por último");
{
  t("o corpo de enviar foi achado", ENVIAR.length > 1000);
  /* (movido, T1-A 8.ª fatia: o pedido lê-se em oPedidoDaEscuta, no motor; a ordem continua a do App) */
  t("o pedido é lido ANTES de o compasso decidir", ord("const doPedido = oPedidoDaEscuta(", "segurarEsc = doPedido.segurar;", "talvezAndarOCompasso(conteudo, { segurar: segurarEsc })"));
  t("numa pergunta segura, a forma da cena também não sai", ENVIAR.includes("doCompasso || segurarEsc ? \"\" : talvezDarFormaACena(conteudo)"));
  t("o compasso aceita o segurar de quem chama, pela porta de sempre", /segurar: segurarExtra \|\| !!combateRef\.current/.test(APP));
  // retirada (trilha A, 29/10): «a nota passa pela escuta, envelope a envelope, com os adiados de antes» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  // retirada (trilha A, 29/10): «a pauta vem primeiro, e o que fica depois» — o trecho de `enviar` da pauta ao system mudou-se para src/motor/pedido-do-turno.js (oPedidoDoTurno); o mesmo código à letra está provado lá, byte a byte contra o recorte do App, em teste-motor-pedido-do-turno.mjs (275 casos)
  // retirada (trilha A, 29/10): «o que espera volta à nota do turno seguinte» — o trecho de `enviar` da pauta ao system mudou-se para src/motor/pedido-do-turno.js (oPedidoDoTurno); o mesmo código à letra está provado lá, byte a byte contra o recorte do App, em teste-motor-pedido-do-turno.mjs (275 casos)
  /* (movido, T1-A 8.ª fatia: a escuta anda em aEscutaAnda, no motor; a ordem é a do App, e a
     pausa da luta prova-se jogando a peça, não lendo o texto dela) */
  // retirada (trilha A, 29/10): «a escada anda DEPOIS da pauta (o degrau do turno é o de antes)» — o trecho de `enviar` da pauta ao system mudou-se para src/motor/pedido-do-turno.js (oPedidoDoTurno); o mesmo código à letra está provado lá, byte a byte contra o recorte do App, em teste-motor-pedido-do-turno.mjs (275 casos)
  {
    const { aEscutaAnda, oPedidoDaEscuta } = await import("../src/motor/antes-do-mestre.js");
    const pe = oPedidoDaEscuta({ modo: "historia", escuta: { semAvanco: 2 } }, "ando pela praça");
    /* MOVIDA (28/10, T2-B lote 1), E O MOTIVO: a asserção terminava em `&& ENVIAR.includes("combate: combateRef.current }, { pedido: pedidoEsc")` — o App passa a luta à escada. Esse fragmento é parte do que a asserção da ORDEM, acima ("a escada anda DEPOIS da pauta"), já exige à letra (`const anda = aEscutaAnda({ … combate: combateRef.current }, { pedido: pedidoEsc, fio: fioEsc });`): dita duas vezes, guardada uma. Fica o comportamento: a luta pausa a escada. */
    t("a luta pausa a escada", aEscutaAnda({ escuta: { semAvanco: 2 }, combate: { rodada: 1 } }, pe).escuta.semAvanco === 2 && aEscutaAnda({ escuta: { semAvanco: 2 }, combate: null }, pe).escuta.semAvanco === 3);
  }
  // retirada (trilha A, 29/10): «a frase do jogador fecha o pedido, depois do rodapé» — o trecho de `enviar` da pauta ao system mudou-se para src/motor/pedido-do-turno.js (oPedidoDoTurno); o mesmo código à letra está provado lá, byte a byte contra o recorte do App, em teste-motor-pedido-do-turno.mjs (275 casos)
  /* onda 1 do custo (13/10): a asserção mudou. O histórico guardava o corpo
     (a pauta + a frase) e passou a guardar só a memória do turno (a frase e a
     marca do que o sistema decidiu): a pauta velha era 73% do que se relia.
     O que a MM18 protegia continua: nem rodapé nem etiqueta no histórico, e
     a frase por último no turno de agora (as asserções acima). */
  t("o histórico guarda a memória do turno (sem pauta, rodapé nem etiqueta)", /\{ role: "user", content: memoriaDoJogador \}, \{ role: "assistant"/.test(APP) && APP.includes("memoriaDoJogador = memoriaDoTurno(conteudo, nota) || corpo"));
  // retirada (trilha A, 29/10): «se a escuta estoura, a nota é a de antes, inteira» — o trecho de `enviar` da pauta ao system mudou-se para src/motor/pedido-do-turno.js (oPedidoDoTurno); o mesmo código à letra está provado lá, byte a byte contra o recorte do App, em teste-motor-pedido-do-turno.mjs (275 casos)
  const calados = ["a escuta lê o pedido", "a escuta do turno", "a escuta anda", "a frase do jogador por último", "o rumo na pauta", "a gente da história", "o cartaz vencido"];
  // retirada (trilha A, 29/10): «toda peça nova cala o próprio erro (nunca custa o turno)» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
}

sec("4. O RUMO na pauta, fora da luta");
{
  const i = pos("p = porNaPauta(p, \"rumo\", rumo)");
  const j = pos("const pautaDoTurno = (acaoDoTurno");
  // retirada (trilha A, 29/10): «a linha do rumo entra na pauta do turno» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  // retirada (trilha A, 29/10): «com o degrau da escada e o próximo passo da principal» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  /* antes de `cederNaCena`, que é a última coisa da pauta (teste-como-chega);
     o rumo não está em nenhuma lista de SECOES_QUE_CEDEM, logo não cede */
  // retirada (trilha A, 29/10): «antes do que cede na cena, que fecha a pauta (o rumo não cede)» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  // retirada (trilha A, 29/10): «e nunca na luta» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
}

sec("5. o mural recusa a gente da história, e o papel vence");
{
  /* v9.469 — ASSERÇÃO MOVIDA, e o motivo: a 11.ª sessão (M3) pôs dois
     Gualtérios na mesa — o companheiro e o que o mural fez assinar um cartaz.
     O v9.467 ensinou genteDaHistoria a ler o grupo (ofertas.js), e o App
     passa-o agora. A lista continua a sair de abertura, missões e espinha;
     soma-se quem anda comigo. */
  t("a lista da história sai de abertura, missões, espinha e o grupo", /genteDaHistoria\(\{ abertura: aberturaMundoRef\.current, missoes: missoesRef\.current, espinha: espinhaRef\.current, grupo: \(personagemRef\.current \|\| personagem \|\| \{\}\)\.grupo \|\| \[\] \}\)/.test(APP));
  t("os dois sorteios do mural passam a lista (oferecer e garantir)", quantas("historia: historiaDoMural(),\n    });") === 2);
  /* 28/10 (T1-A, 9.ª fatia), MUDADA E O MOTIVO: o cartaz da proposta do Cronista saiu do
     cronistaDoTurno do App para src/motor/cronista-do-turno.js
     (oAceitoDoCronista), e o motor não se lê pelo texto (a catraca de
     teste-assercoes-de-texto): a mesma intenção prova-se jogando a peça
     (jogarOAceito, cronista-bloco.mjs). */
  const { jogarOAceito } = await import("./cronista-bloco.mjs");
  const comHistoria = jogarOAceito({ missao_oferecida: { titulo: "Achar o Noé", tipo: "favor", dador: "Ana", paga: 0, etapas: [{ tipo: "achar", alvo: "Noé Laminado" }] } }, { estado: { npcs: {}, cidadeAtual: "Rio Cinzento", missoes: [] }, portas: { historiaDoMural: () => ["Noé Laminado"] } });
  const semHistoria = jogarOAceito({ missao_oferecida: { titulo: "Achar o Noé", tipo: "favor", dador: "Ana", paga: 0, etapas: [{ tipo: "achar", alvo: "Noé Laminado" }] } }, { estado: { npcs: {}, cidadeAtual: "Rio Cinzento", missoes: [] } });
  t("a proposta do Mestre também", comHistoria.portas.some((x) => x[0] === "historiaDoMural") && !comHistoria.portas.some((x) => x[0] === "pregarNoMural") && semHistoria.portas.some((x) => x[0] === "pregarNoMural"));
  t("o papel pregado nasce com data", /pregadoEm: cartaz\.pregadoEm != null \? cartaz\.pregadoEm : diaRef\.current/.test(APP));
  t("o mural renovado deixa o vencido para trás", APP.includes("c && c.oferecido && !cartazJaVenceu(c)).slice(-TETO_OFERECIDOS)"));
  t("e o rodapé não oferece \"Aceitar\" de papel vencido", APP.includes("c && c.oferecido && !cartazJaVenceu(c) && podeAceitarCartaz(c)"));
}

sec("6. a 4.ª sessão, repassada pela fiação: os empurrões");
{
  const REG = JSON.parse(fs.readFileSync(new URL("./registo-s4-escuta.json", import.meta.url), "utf8"));
  /* o fio da 4.ª sessão: o mesmo de `teste-mm18-escuta.mjs` */
  const ABERTURA = A.garantirAbertura({
    principalId: "mis_principal", cidade: "Alto do Sal", chegada: "à porta", razao: "uma carta", sabe: "Inocência",
    historia: "a 8 horas fica Muralha Quebrada de Silêncio", titulo: "O rasto de Noé Laminado",
    pista: { nome: "Inocência Bordão", papel: "músico de canto", local: "Sino Quieto" },
    alvo: { feitio: "procurar", quem: "Noé Laminado", onde: "Rua dos Retalhos", alvo: "", origem: "Muralha Quebrada de Silêncio" },
  });
  const MISSOES = [{ id: "mis_principal", titulo: "O rasto de Noé Laminado", tipo: "principal", status: "ativa",
    etapas: [{ tipo: "falar_com", alvo: "Inocência Bordão", onde: "Sino Quieto" }, { tipo: "falar_com", alvo: "Noé Laminado", onde: "Rua dos Retalhos" }] }];
  /* o caminho de `enviar`, passo a passo (as asserções da seção 3 provam
     que é este o caminho): ler → segurar (o compasso e a forma não nascem)
     → cortar com os adiados de antes → os adiados voltam à nota → a escada
     anda. A principal ficou 0/2 a sessão inteira: etapas e marcos zero. */
  let escuta = E.garantirEscuta(null), nota = [], adiadosAntes = [];
  let antes = 0, turnosAntes = 0, depois = 0, turnosDepois = 0, maxPorTurno = 0, frasesUltimas = 0;
  for (const turno of REG.turnos) {
    const fio = E.fioDaHistoria({ abertura: ABERTURA, missoes: MISSOES });
    const pedido = E.lerOPedido(turno.jogador);
    const segurar = E.seguraOMundo(pedido, E.degrauDaEscuta(escuta.semAvanco));
    const n0 = turno.envelopes.filter((x) => E.empurraoDe(x)).length;
    antes += n0; if (n0) turnosAntes++;
    const nascem = segurar ? turno.envelopes.filter((x) => { const em = E.empurraoDe(x); return !(em && (em.id === "compasso" || em.id === "forma")); }) : turno.envelopes;
    const r = E.escutarOTurno({ envelopes: [...E.separarEnvelopes(nota.join("\n")), ...nascem], fio, semAvanco: escuta.semAvanco, adiadosAntes });
    const ficou = r.ficam.filter((x) => E.empurraoDe(x)).length;
    depois += ficou; if (ficou) turnosDepois++; maxPorTurno = Math.max(maxPorTurno, ficou);
    nota = r.adiados; adiadosAntes = r.adiados;
    escuta = E.andarAEscuta(escuta, { pedido, fio, etapas: 0, marcos: 0, pausa: false });
    /* o pedido montado como o App monta: a última linha é a frase */
    const pedidoFinal = `[PAUTA]\n${r.ficam.join("\n")}\n[RODAPÉ DO SISTEMA] …\n${E.fechoDoPedido(pedido)}`;
    if (pedidoFinal.trimEnd().split("\n").pop() === turno.jogador.trim()) frasesUltimas++;
  }
  console.log(`      registo: ${antes} empurrões em ${turnosAntes} turnos → ${depois} em ${turnosDepois}, no máximo ${maxPorTurno} por turno`);
  t(`o registo tem os 23 turnos do jogador fora da luta (${REG.turnos.length})`, REG.turnos.length === 23);
  t(`antes: 23 empurrões em 18 turnos (${antes} em ${turnosAntes}) — o número do diário`, antes === 23 && turnosAntes === 18);
  t(`depois: no máximo 10 (${depois})`, depois <= 10);
  t(`nunca mais de 1 por turno (${maxPorTurno})`, maxPorTurno <= 1);
  t(`a frase do jogador é a última linha em todos (${frasesUltimas}/${REG.turnos.length})`, frasesUltimas === REG.turnos.length);
}

sec("7. 200 mundos novos: o mural da cidade de partida, com os argumentos do App");
{
  const genero = "Fantasia medieval";
  let mundos = 0, antes = 0, depois = 0;
  for (let i = 0; i < 200; i++) {
    const semente = `Sonda MM18 mural|${i}`;
    const mapa = G.gerarGeografia(semente, "sobremundo");
    const cidade = mapa.cidades[0].nome;
    let espinha = null;
    try { espinha = S.estenderEspinha({ semente, mapa, genero, cidadeInicial: cidade }); } catch { espinha = null; }
    const ab = A.abrirAbertura({ semente, mapa, cidade, espinha, genero, nivel: 1, dia: 1 });
    if (!ab) continue;
    mundos++;
    const missoes = [ab.missao];
    const gente = O.genteDaHistoria({ abertura: ab.abertura, missoes, espinha });
    const evitar = missoes.flatMap((q) => [q.titulo, q.dador]);
    /* as duas chamadas do App: `oferecerTrabalhoDaqui` (6) e `garantirMural` (3) */
    const mural = (historia) => [6, 3].flatMap((q) => O.ofertasDaqui({ semente, mapa, cidade, base: null, genero, nivel: 1, quantas: q, evitar, ...(historia ? { historia } : {}) }));
    const daHistoria = (ofs) => ofs.some((o) => O.ehDaHistoria(o.dador, { historia: gente }));
    if (daHistoria(mural(null))) antes++;
    if (daHistoria(mural(gente))) depois++;
  }
  console.log(`      mural: ${antes} de ${mundos} mundos com gente da história → ${depois}`);
  t(`os 200 mundos abrem (${mundos})`, mundos === 200);
  /* o piso é só a prova de que a medida morde: o número exato muda com a
     base e a espinha (o backend mexe nelas em paralelo — em 11/10 deu 149
     numa árvore e 79 noutra), e o que esta suíte guarda é o zero de baixo */
  t(`sem a lista, há gente da história no mural (${antes} de ${mundos})`, antes >= 20);
  t(`com a lista que o App passa, em nenhum (${depois})`, depois === 0);
}

console.log(`\nmm18-fiacao: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
