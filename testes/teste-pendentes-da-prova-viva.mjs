/* teste-pendentes-da-prova-viva.mjs — os defeitos que as provas vivas da
   v9.442 e da v9.443 deixaram ao motor (12/10)

   Cada um falha na árvore de antes (v9.445) e passa aqui:

     a. a companheira do início lembrava «Conheceram-se no dia 0» — o dia 0
        não existe para o jogador; agora diz há quantos anos (fichas.js);
     b. na abertura só a Freya virou ficha: o guarda que pede o nome, a
        mulher das enguias e o mercador de mulas ficavam de fora, porque só a
        gente ARMADA nascia da prosa (em-cena.js, `apresentadosNaProsa`);
     c. o cartão do mapa prometia «chega às 12:05» e o relógio ficava em
        12:00 — o veredito somava os minutos do turno que o turno de viagem
        não paga (partida.js; a prova da ordem no App está em
        teste-veredito-da-partida);
     d. `linhaDaViagem` dizia «Vila clara → Vila clara» na volta (viagem.js);
     e. o Cronista registava gente com local "cidade", e quem não tem cidade
        estava presente em qualquer cidade (npcs.js, `fichaDoCronista`);
     f. o que o mapa vivo pede ao motor: o chão de cada nó (P1), a hora de
        chegada da viagem em curso, e o motivo do perigo da estrada como dado
        (mapa-vivo.js, partida.js). */
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = JSON.stringify;

const FI = await import("../src/fichas.js");
const EC = await import("../src/em-cena.js");
const PA = await import("../src/partida.js");
const VI = await import("../src/viagem.js");
const NP = await import("../src/npcs.js");
const CE = await import("../src/cena.js");
const MV = await import("../src/mapa-vivo.js");
const R = await import("../src/regiao.js");
const { DIAS_ANO } = await import("../src/calendario.js");
const { moldePorId } = await import("../src/moldes.js");
const { ESTRUTURAS } = await import("../src/historia.js");
const { sementeDe, generoDe } = await import("./medir-regiao.mjs");

sec("a. O DIA 0 NÃO EXISTE PARA O JOGADOR");
{
  const freya = { id: "p|freya", tipo: "pessoa", nome: "Freya", genero: "ela" };
  const ficha = (registo, dia) => FI.fichaParaTela(freya, { npcs: { Freya: { nome: "Freya", ...registo } }, dia }) || {};
  const tres = ficha({ conhecidoEm: 0, laco: { tipo: "amizade", forca: 2, desde: 1 - 3 * DIAS_ANO } }, 1);
  t("a companheira de três anos: «Conhecem-se há 3 anos», e nenhum «dia 0»", (tres.lembra || []).includes("Conhecem-se há 3 anos") && !(tres.lembra || []).some((l) => /dia 0\b/.test(l)), J(tres.lembra));
  const um = ficha({ conhecidoEm: 0, laco: { tipo: "amizade", forca: 1, desde: 1 - DIAS_ANO } }, 1);
  t("um ano: o singular", (um.lembra || []).includes("Conhecem-se há um ano"), J(um.lembra));
  const semLaco = ficha({ conhecidoEm: 0 }, 5);
  t("dia 0 sem laço: «de antes da estrada» (garantirLaco poria desde 0 e daria um ano que ninguém viveu)", (semLaco.lembra || []).includes("Conhecem-se de antes da estrada"), J(semLaco.lembra));
  const curto = ficha({ conhecidoEm: 0, laco: { tipo: "amizade", forca: 1, desde: -20 } }, 1);
  t("menos de meio ano não se conta em anos", (curto.lembra || []).includes("Conhecem-se de antes da estrada"), J(curto.lembra));
  const tres3 = ficha({ conhecidoEm: 3 }, 9);
  t("quem se conheceu no dia 3 continua «Conheceram-se no dia 3»", (tres3.lembra || []).includes("Conheceram-se no dia 3"));
  t("as frases saem da tabela", FI.LEMBRA_NA_TELA.conheceramHa === "Conhecem-se há {anos} anos" && !!FI.LEMBRA_NA_TELA.conheceramAntes && !!FI.LEMBRA_NA_TELA.conheceramHaUm);
}

sec("b. QUEM O MESTRE APRESENTOU SEM ARMA");
{
  const abertura = "A chuva fina cai sobre o portão de Porto Valente. Um guarda de elmo amassado barra a passagem e pede o seu nome. Ao lado, uma mulher das enguias grita os preços, e um mercador de mulas discute com o cocheiro. Freya, uma mulher de olhos cinzentos, espera ao seu lado.";
  const ap = EC.apresentadosNaProsa(abertura, ["Freya"]);
  t("a abertura da prova: o guarda, a mulher das enguias e o mercador de mulas", J(ap.map((x) => x.nome)) === J(["Guarda de elmo", "Mulher das enguias", "Mercador de mulas"]), J(ap.map((x) => x.nome)));
  t("…e o aposto «Freya, uma mulher de olhos cinzentos» não faz nascer ninguém", !ap.some((x) => /olhos/.test(x.nome)));
  t("a mulher é «ela»; o guarda não se adivinha", (ap[1] || {}).genero === "ela" && (ap[0] || {}).genero === "");
  const lista = EC.montarEmCena({ semente: "prova", mostrado: [abertura], grupo: ["Freya"] });
  const gente = lista.filter((x) => x.tipo === "pessoa");
  t("a lista da cena tem a Freya e os três, todos à vista", gente.length === 4 && gente.every((x) => x.aqui) && ["Guarda de elmo", "Mulher das enguias", "Mercador de mulas"].every((n) => gente.some((x) => x.nome === n && x.deOnde === "prosa")), J(gente.map((x) => x.nome)));
  t("…e a frase os acha: «falo com o guarda» aponta o guarda", (() => { const q = EC.quemNaFrase("falo com o guarda", lista); const alvo = (Array.isArray(q) ? q[0] : q) || {}; return (alvo.nome || (alvo.item || {}).nome || "") === "Guarda de elmo"; })(), J(EC.quemNaFrase("falo com o guarda", lista)));
  const fichas = FI.fichasDaCena(lista, { grupo: [{ nome: "Freya" }] });
  /* MUDADA EM 29/10, E O MOTIVO (a 13.ª sessão): esta linha pedia que a gente
     que a prosa apresentou virasse ficha na fileira. Na 13.ª a mesma porta pôs
     na faixa seis fantasmas (o cão de uma aposta, «o bicho de ponta a ponta»,
     o caçador que era o Dunstan, o homem que a frase chamou Balduíno…): das 29
     coisas que os leitores da prosa acharam nas 23 respostas, só 4 eram gente
     à vista. A faixa passou a mostrar só o que o sistema sabe
     (fichas.js, FORA_DA_FAIXA). A intenção que fica: o guarda, a mulher e o
     mercador continuam na LISTA e a frase acha-os (as duas linhas acima);
     a fileira mostra a Freya, que o sistema conhece. */
  t("…e a fileira mostra quem o sistema conhece (a Freya), não os três da prosa", Array.isArray(fichas) && fichas.some((f) => f.nome === "Freya") && !fichas.some((f) => /Guarda|Mulher|Mercador/.test(f.nome)), J((fichas || []).map((f) => f.nome)));
  const nada = EC.apresentadosNaProsa("Ele fala como um mercador. Nenhum guarda aparece. Um velho barco range no cais. Um estranho silêncio cai. É um tipo de lugar.", []);
  t("comparação, negação e a cabeça-adjectivo não fazem nascer ninguém", nada.length === 0, J(nada));
  const dois = EC.apresentadosNaProsa("Dois guardas observam do muro.", []);
  t("«dois guardas»: uma ficha, dois", dois.length === 1 && dois[0].quantos === 2 && dois[0].cabeca === "guarda", J(dois));
  const muitos = EC.apresentadosNaProsa("Um guarda, uma peixeira, um padre, um mendigo e uma criada passam.", []);
  t("teto por turno (APRESENTADO_NA_PROSA.teto)", muitos.length === EC.APRESENTADO_NA_PROSA.teto, J(muitos));
  const armado = EC.montarEmCena({ semente: "p", mostrado: ["Um guarda com uma lança bloqueia a ponte."] }).filter((x) => x.tipo === "pessoa");
  t("o guarda armado não ganha um gémeo desarmado", armado.length === 1, J(armado.map((x) => x.nome)));
  const registado = EC.montarEmCena({ semente: "p", mostrado: ["Tomé Cardo cruza os braços. Um guarda chega por trás."], presentes: [{ nome: "Tomé Cardo", papel: "guarda" }] }).filter((x) => x.tipo === "pessoa");
  t("com um guarda registado à vista, «um guarda» cala-se (na dúvida, é ele)", !registado.some((x) => x.deOnde === "prosa"), J(registado.map((x) => x.nome)));
  t("lixo: null, [], número → []", [null, [], 3, [null, 4], ""].every((x) => J(EC.apresentadosNaProsa(x, null)) === "[]"));
  t("determinístico", J(EC.apresentadosNaProsa(abertura, ["Freya"])) === J(ap));
}

sec("c. A HORA DO CARTÃO É A DO RELÓGIO");
{
  t("o turno de viagem não soma minutos do turno (VEREDITO_DA_PARTIDA.minutosDoTurno = 0)", PA.VEREDITO_DA_PARTIDA.minutosDoTurno === 0);
}

sec("d. A VOLTA NÃO É «VILA CLARA → VILA CLARA»");
{
  const ida = VI.abrirViagem({ de: "Vila clara", para: "Vila clara", rota: { dias: 1 } });
  const l = VI.linhaDaViagem(ida);
  t("de = para: «de volta a Vila clara»", l.startsWith("🧭 de volta a Vila clara ·") && !/Vila clara → Vila clara/.test(l), l);
  t("…e o Mestre também não lê «de Vila clara para Vila clara»", !/de Vila clara para Vila clara/.test(VI.resumoViagemPrompt(ida)) && /de volta a Vila clara/.test(VI.resumoViagemPrompt(ida)));
  const comPercurso = { ...ida, percurso: [{ nome: "Cripta Funda" }, { nome: "Vila clara" }] };
  t("com percurso, a origem é a primeira escala: «Cripta Funda → Vila clara»", VI.linhaDaViagem(comPercurso).startsWith("🧭 Cripta Funda → Vila clara") && VI.origemDaViagem(comPercurso) === "Cripta Funda");
  const normal = VI.abrirViagem({ de: "Porto", para: "Vau", rota: { dias: 1 } });
  t("a ida normal não muda: «Porto → Vau»", VI.linhaDaViagem(normal).startsWith("🧭 Porto → Vau ·") && VI.origemDaViagem(normal) === "Porto");
  t("pausada e chegando usam a mesma origem", /de volta a Vila clara · PAUSADA/.test(VI.linhaDaViagem(VI.pausarViagem(ida, "chuva"))));
  t("a tabela das formas", VI.ROTULO_DA_ROTA.volta === "de volta a {para}" && VI.origemDaViagem(null) === "");
}

sec("e. O PARADEIRO QUE NÃO É CIDADE");
{
  const mapa = { cidades: [{ nome: "Rio do Rio" }, { nome: "Vau Seco" }] };
  const em = { cidade: "Vau Seco", mapa };
  t("«cidade» vira o nome da cidade onde o herói está", NP.fichaDoCronista({ nome: "Kira", local: "cidade" }, null, em).local === "Vau Seco");
  t("o sítio ganha a cidade ao lado", NP.fichaDoCronista({ nome: "Tomas", local: "a taverna do Pato" }, null, em).local === "a taverna do Pato, Vau Seco");
  t("sem local, o da cidade", NP.fichaDoCronista({ nome: "Ilar" }, null, em).local === "Vau Seco");
  t("local que já nomeia uma cidade não se toca", NP.fichaDoCronista({ nome: "Dara", local: "Rio do Rio" }, null, em).local === "Rio do Rio");
  t("quem a ficha põe longe não se carimba (partiu, a caminho)", NP.fichaDoCronista({ nome: "Ilar", local: "partiu para as montanhas" }, null, em).local === "partiu para as montanhas");
  t("a ficha velha com «cidade» repara-se quando o Cronista a volta a ver", NP.fichaDoCronista({ nome: "Dara" }, { nome: "Dara", local: "cidade" }, em).local === "Vau Seco");
  t("na estrada (cidade \"\") ou sem ctx: como antes", NP.fichaDoCronista({ nome: "Dara", local: "cidade" }, null, { cidade: "", mapa }).local === "cidade" && NP.fichaDoCronista({ nome: "Dara", local: "cidade" }).local === "cidade");
  t("o gênero continua a funcionar com o ctx", NP.fichaDoCronista({ nome: "Kira", genero: "ela", local: "cidade" }, null, em).genero === "mulher");
  const kira = NP.criarNPC("Kira", NP.fichaDoCronista({ local: "cidade" }, null, em));
  const reg = { Kira: kira, Velha: NP.criarNPC("Velha", { local: "cidade" }) };
  t("a Kira registada em Vau Seco não está em Rio do Rio (e está em Vau Seco)", !CE.elencoDaCena(reg, "Rio do Rio", mapa).aqui.some((n) => n.nome === "Kira") && CE.elencoDaCena(reg, "Vau Seco", mapa).aqui.some((n) => n.nome === "Kira"));
  t("…ao contrário da ficha de antes, presente em toda cidade (o defeito, medido)", CE.elencoDaCena(reg, "Rio do Rio", mapa).aqui.some((n) => n.nome === "Velha" && n.motivo === "paradeiro não registrado"));
  t("imutável: a pessoa que entra não muda", (() => { const p = { nome: "K", local: "cidade" }; NP.fichaDoCronista(p, null, em); return p.local === "cidade"; })());
  t("a tabela e a conta", NP.LOCAL_SEM_CIDADE.genericos.includes("cidade") && NP.localComCidade("", "Vau", null) === "Vau" && NP.localComCidade("x", "", null) === "x");
}

sec("f. O QUE O MAPA VIVO PEDE AO MOTOR");
{
  const molde = moldePorId("sobremundo");
  let comBioma = 0, nosVistos = 0, arestasVistas = 0, motivoCerto = 0, motivoNulo = 0, comChaoDuro = 0, veredictos = 0, motivoDoVeredito = 0;
  for (let i = 0; i < 20; i++) {
    const semente = sementeDe(i);
    const mapa = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde, genero: generoDe(i), estrutura: ESTRUTURAS[i % ESTRUTURAS.length].id, modo: "historia" }));
    const base = mapa.cidades[0];
    const todos = [...mapa.cidades.map((c) => c.nome), ...mapa.regiao.lugares.map((l) => l.nome)];
    const e = { cidadeAtual: base.nome, dia: 4, minuto: 540, semente, conhecidos: todos, mapa };
    const d = MV.dadosDoMapaVivo(mapa, e);
    if (!d) continue;
    for (const n of d.nos) {
      nosVistos++;
      const src = n.tipo === "lugar" ? mapa.regiao.lugares.find((l) => String(l.id) === n.id) : mapa.cidades.find((c) => `cidade|${c.nome}` === n.id);
      if (src && (n.bioma === (src.bioma ? String(src.bioma) : null))) comBioma++;
    }
    for (const a of d.arestas) {
      arestasVistas++;
      if (a.perigo == null) { if (a.perigoMotivo === null) motivoNulo++; continue; }
      const pm = a.perigoMotivo;
      const de = d.nos.find((x) => x.id === a.de), para = d.nos.find((x) => x.id === a.para);
      const ponta = (x) => (x.tipo === "lugar" ? x.perigo : MV.PERIGO_NA_ESTRADA.povoado);
      const refeito = MV.perigoDaEstradaComMotivo(ponta(de), ponta(para), a.tipoDeChao);
      if (pm && refeito && refeito.perigo === a.perigo && pm.ponta === refeito.ponta && pm.subiu === refeito.subiu && pm.chao === String(a.tipoDeChao || "")) motivoCerto++;
      if (pm && pm.subiu) comChaoDuro++;
    }
    for (const n of d.nos.filter((x) => !x.aqui).slice(0, 4)) {
      const v = PA.vereditoDaPartida(d, n.id, { ...e, ritmo: "normal" });
      if (!v) continue;
      veredictos++;
      if (v.perigoDaEstrada == null ? v.motivoDoPerigo === null : v.motivoDoPerigo && typeof v.motivoDoPerigo.subiu === "boolean" && MV.perigoDaEstradaComMotivo(v.motivoDoPerigo.ponta, v.motivoDoPerigo.ponta, v.motivoDoPerigo.chao).perigo === v.perigoDaEstrada) motivoDoVeredito++;
    }
  }
  t(`P1: todo nó traz o chão que o motor sabe (${comBioma}/${nosVistos})`, nosVistos > 50 && comBioma === nosVistos);
  t(`toda aresta com perigo traz o motivo, e ele refaz a cor (${motivoCerto} + ${motivoNulo} calados de ${arestasVistas})`, arestasVistas > 30 && motivoCerto + motivoNulo === arestasVistas);
  t(`…e há arestas em que o chão duro subiu o degrau (${comChaoDuro})`, comChaoDuro > 0);
  t(`o veredito diz o motivo da pior perna, e ele refaz o perigo (${motivoDoVeredito}/${veredictos})`, veredictos > 20 && motivoDoVeredito === veredictos);
  t("a régua: ponta calada → null; chão duro sobe; teto no topo", MV.perigoDaEstradaComMotivo(null, "baixo", "") === null && MV.perigoDaEstradaComMotivo("baixo", "baixo", "gelo").subiu === true && MV.perigoDaEstradaComMotivo("baixo", "baixo", "planicie").subiu === false);

  /* a chegada da viagem em curso: o laço de `viajar`, de onde a jornada vai */
  let j = VI.abrirViagem({ de: "Porto", para: "Vau", rota: { dias: 2 } });
  j = VI.andar(j, VI.minutosPorAvanco(j));
  const dados = { relogio: { dia: 4, minuto: 540 } };
  const c = PA.chegadaDaViagem(dados, { jornada: j, ritmo: "normal" });
  let s = 0, k = j;
  while (k.estado !== VI.ESTADOS.concluida) { s += Math.round(VI.relogioDoAvanco(k) * 1); k = VI.andar(k, VI.minutosPorAvanco(k)); }
  const fim = 540 + s;
  t("a hora de chegada da viagem em curso = o relógio + o que falta, pelo laço de viajar", c && c.minutosDeRelogio === s && c.dia === 4 + Math.floor(fim / 1440) && c.minuto === fim % 1440 && typeof c.hora === "string", J(c));
  const lento = PA.chegadaDaViagem(dados, { jornada: j, ritmo: "lento" });
  t("o ritmo lento chega mais tarde", lento && lento.minutosDeRelogio > c.minutosDeRelogio);
  t("pausada, concluída, sem relógio, sem jornada → null", PA.chegadaDaViagem(dados, { jornada: VI.pausarViagem(j, "chuva") }) === null && PA.chegadaDaViagem(dados, { jornada: k }) === null && PA.chegadaDaViagem({}, { jornada: j }) === null && PA.chegadaDaViagem(dados, {}) === null && PA.chegadaDaViagem(null, null) === null);
  t("determinístico e imutável", J(PA.chegadaDaViagem(dados, { jornada: j, ritmo: "normal" })) === J(c) && j.estado === VI.ESTADOS.emCurso);
}

console.log(`\npendentes da prova viva: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
