/* COORDENADAS (v9.118) — o mundo passa a ter endereço.

   O que esta suíte defende, em uma frase: existe UMA posição, e todo
   módulo que fala de espaço fala dela. As três provas que mais importam
   são as que medem contradição entre dois módulos, não correção dentro
   de um — porque o defeito que motivou tudo isto (o moinho desenhado a
   200 km de uma caminhada de 35 minutos) passava por qualquer prova que
   olhasse um arquivo de cada vez. */

const S = "../src/";
const C = await import(S + "coordenadas.js");
const { arredoresDaCidade, ondeFicaOArredor, tempoDeIda, resumoArredoresPrompt } = await import(S + "arredores.js");
const { pontoDoLugar, definirLugar, garantirLugar, MINUTOS_DA_DISTANCIA } = await import(S + "lugar.js");
const G = await import(S + "geografo.js");
const { KM_POR_UNIDADE } = await import(S + "geografia.js");
const { garantirPauta, porNaPauta, textoDaPauta } = await import(S + "pauta.js");

let ok = 0, mau = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mau++; console.log("  XX  " + nome + (extra ? ` — ${extra}` : "")); }
};
const sec = (s) => console.log(`\n${s}`);
const perto = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

sec("1. a catraca: sem x e y não há coordenada, e nunca há palpite");
{
  t("lixo não vira posição", C.garantirCoord(null) === null && C.garantirCoord("x") === null && C.garantirCoord({}) === null);
  t("x sem y também não", C.garantirCoord({ x: 10 }) === null);
  /* a tentação seria devolver 50,50. Um NPC de paradeiro desconhecido no
     meio do mapa fica a uma distância EXATA de tudo, e ninguém percebe. */
  t("e o centro do mapa nunca é a resposta padrão", C.garantirCoord({ nome: "sei lá" }) === null);
  const c = C.garantirCoord({ x: -30, y: 400, z: "2", mx: "150", my: null });
  t("fora do pergaminho, prende na borda", c.x === 0 && c.y === 100);
  t("z e metros normalizam", c.z === 2 && c.mx === 150 && c.my === 0);
  t("coordDe lê qualquer coisa com x,y", C.coordDe({ nome: "Pedravale", x: 20, y: 30 }).x === 20);
  t("e devolve null para o que não tem", C.coordDe({ nome: "fantasma" }) === null);
}

sec("2. distância: uma unidade do pergaminho são 25 km");
{
  const a = { x: 10, y: 10 }, b = { x: 14, y: 10 };
  t("quatro unidades são cem quilômetros", perto(C.kmEntre(a, b), 4 * KM_POR_UNIDADE, 1e-9));
  t("o mesmo ponto dá zero", C.kmEntre(a, a) === 0);
  t("sem posição, sem distância", C.kmEntre(a, null) === null);
  /* AS DUAS ESCALAS. Doze metros valem 0,00048 unidade: num float que
     carrega o continente eles somem na terceira casa. Separados, a mesa
     do canto continua existindo. */
  const salao = { x: 20, y: 30, mx: 0, my: 0 };
  const quarto = { x: 20, y: 30, mx: 40, my: 30 };
  t("metros dentro do assentamento contam de verdade", perto(C.kmEntre(salao, quarto), 0.05, 1e-9));
  t("e continuam pequenos ao lado de uma estrada", C.kmEntre(salao, quarto) < C.kmEntre(salao, { x: 21, y: 30 }));
}

sec("3. rumo: o norte é para cima, como na rosa dos ventos do pergaminho");
{
  const o = { x: 50, y: 50 };
  /* no SVG o y cresce para BAIXO. Se este bloco discordar do desenho, o
     jogador vê a contradição antes de ver qualquer outra coisa. */
  t("para cima é norte", C.rumoEntre(o, { x: 50, y: 40 }).id === "norte");
  t("para baixo é sul", C.rumoEntre(o, { x: 50, y: 60 }).id === "sul");
  t("para a direita é leste", C.rumoEntre(o, { x: 60, y: 50 }).id === "leste");
  t("para a esquerda é oeste", C.rumoEntre(o, { x: 40, y: 50 }).id === "oeste");
  t("cima e direita é nordeste", C.rumoEntre(o, { x: 60, y: 40 }).id === "nordeste");
  t("baixo e esquerda é sudoeste", C.rumoEntre(o, { x: 40, y: 60 }).id === "sudoeste");
  t("o mesmo ponto não tem rumo", C.rumoEntre(o, o) === null);
  t("são oito rumos e todos têm rótulo", C.RUMOS.length === 8 && C.RUMOS.every((r) => r.id && r.curto && /^a[o]? /.test(r.rotulo)));
  t("graus: norte é zero, leste é noventa", C.grausEntre(o, { x: 50, y: 40 }) === 0 && C.grausEntre(o, { x: 60, y: 50 }) === 90);
  /* ida e volta são opostos: sem isso, "ele veio do norte" e "fica ao sul"
     seriam duas afirmações que não se conferem */
  for (const p of [{ x: 61, y: 43 }, { x: 12, y: 88 }, { x: 50, y: 9 }]) {
    const i = C.grausEntre(o, p), v = C.grausEntre(p, o);
    t(`ida e volta se opõem em ${p.x},${p.y}`, perto(Math.abs(i - v), 180, 1e-9));
  }
}

sec("4. deslocar: pôr um ponto a tantos quilômetros daqui, naquele lado");
{
  const o = { x: 50, y: 50 };
  const n = C.deslocar(o, 0, KM_POR_UNIDADE);
  t("25 km ao norte tiram uma unidade do y", perto(n.x, 50, 1e-9) && perto(n.y, 49, 1e-9));
  const l = C.deslocar(o, 90, KM_POR_UNIDADE * 2);
  t("50 km a leste somam duas ao x", perto(l.x, 52, 1e-9) && perto(l.y, 50, 1e-9));
  t("e o rumo do resultado é o rumo pedido", C.rumoEntre(o, l).id === "leste");
  t("sem origem não há deslocamento", C.deslocar(null, 0, 10) === null);
}

sec("5. a grade que se lê — a mesma malha das células do ermo");
{
  t("o canto de cima à esquerda é A1", C.gradeDe({ x: 0, y: 0 }) === "A1");
  t("o de baixo à direita é T20", C.gradeDe({ x: 100, y: 100 }) === "T20");
  t("a letra anda com o x", C.gradeDe({ x: 26, y: 3 }) === "F1");
  t("e o número com o y", C.gradeDe({ x: 3, y: 26 }) === "A6");
  t("sem posição, sem casa", C.gradeDe(null) === "");
  t("as vinte letras cobrem a grade", C.LETRAS_DA_GRADE.length === 20);
  const e = C.enderecoDe({ x: 34.21, y: 61.74 });
  t("o endereço traz a casa e o par", /^G13 34,2 · 61,7$/.test(e), e);
  const dentro = C.enderecoDe({ x: 34.2, y: 61.7, mx: 30, my: 40 });
  t("e diz os metros quando se está dentro de um lugar", /50 m do centro/.test(dentro), dentro);
}

sec("6. o pé e o relógio: uma régua só para caminhada");
{
  t("uma hora a pé são quatro quilômetros", C.kmAPe(60) === 4);
  t("e quatro quilômetros são uma hora", C.minutosAPe(4) === 60);
  t("ida e volta da conta batem", C.minutosAPe(C.kmAPe(45)) === 45);
  t("negativo não anda para trás", C.kmAPe(-30) === 0);
  t("em unidades do pergaminho, 45 min são 0,12", perto(C.unidadesAPe(45), 3 / KM_POR_UNIDADE, 1e-9));
  t("meia hora sai em minutos", C.aPeEmTexto(30) === "30 min a pé");
  t("e uma hora e meia sai com vírgula, como todo número desta casa", C.aPeEmTexto(90) === "1,5 h a pé");
  t("abaixo de um quilômetro a conta é em metros", C.formatarDistancia(0.42) === "420 m");
  t("perto, com uma casa", C.formatarDistancia(3.24) === "3,2 km");
  t("longe, redondo", C.formatarDistancia(147.6) === "148 km");
}

sec("7. o que está perto: ordenado, com rumo e com teto");
{
  const eu = { x: 50, y: 50 };
  const pontos = [
    { nome: "o moinho", coord: { x: 50.1, y: 50 } },
    { nome: "Rio do Sul", coord: { x: 56, y: 50 } },
    { nome: "a capela", coord: { x: 50, y: 49.95 } },
    { nome: "Aldoria", coord: { x: 90, y: 90 } },
    { nome: "sem lugar" },
  ];
  const r = C.maisPertoDe(eu, pontos, { quantos: 3 });
  t("vem do mais perto para o mais longe", r.map((x) => x.nome).join("|") === "a capela|o moinho|Rio do Sul", r.map((x) => x.nome).join("|"));
  t("o teto de quantos é obedecido", r.length === 3);
  t("quem não tem posição não entra", !r.some((x) => x.nome === "sem lugar"));
  t("cada um traz o rumo", r.every((x) => x.rumo && x.rumo.id));
  t("e a capela fica ao norte", r[0].rumo.id === "norte");
  const raio = C.maisPertoDe(eu, pontos, { raioKm: 10, quantos: 9 });
  t("o raio corta o que está longe", raio.every((x) => x.km <= 10) && !raio.some((x) => x.nome === "Aldoria"));
  t("e o próprio lugar pode ser excluído pelo nome", !C.maisPertoDe(eu, pontos, { exceto: "o moinho" }).some((x) => x.nome === "o moinho"));
  const linha = C.linhaDePonto(r[2]);
  t("a linha traz nome, rumo e distância", /Rio do Sul \(a leste, 150 km\)/.test(linha), linha);
  /* a pé só quando alguém iria a pé: "37 h a pé" é uma conta certa que
     informa menos do que "150 km" */
  t("e o tempo de caminhada só até onde se caminha", !/a pé/.test(linha) && /a pé/.test(C.linhaDePonto(r[0])));
}

sec("8. A MENTIRA DOS ARREDORES ESTÁ MORTA");
{
  /* Era o defeito que motivou tudo: `dist = 6 + rnd() * 5` unidades, ou
     seja de 150 a 275 km, para um moinho que o mesmo registro dizia ficar
     a 35 minutos a pé. Duas verdades sobre a mesma coisa, e a desenhada
     era a errada. Esta prova mede o mapa CONTRA o texto. */
  const cidades = [
    { nome: "Pedravale", x: 40, y: 40, porte: "cidade", bioma: "planicie" },
    { nome: "Forte do Vigia", x: 70, y: 22, porte: "fortaleza", bioma: "montanha" },
    { nome: "Vau Salgado", x: 15, y: 63, porte: "capital", bioma: "costa" },
    { nome: "Ermo Alto", x: 88, y: 80, porte: "aldeia", bioma: "colina" },
  ];
  let piorErro = 0, quantos = 0, maisLonge = 0;
  for (const cid of cidades) {
    for (const a of arredoresDaCidade("prova|coord", cid)) {
      quantos++;
      const o = ondeFicaOArredor(cid, a);
      const kmDoRelogio = C.kmAPe(a.minutos);
      /* a linha reta é MENOR que o caminho — nenhuma estrada é reta —, e a
         folga sorteada vive entre 70% e 95% */
      const razao = o.km / kmDoRelogio;
      piorErro = Math.max(piorErro, Math.abs(razao - 0.825));
      maisLonge = Math.max(maisLonge, o.km);
    }
  }
  t(`todo arredor foi conferido (${quantos})`, quantos >= 10);
  t("a linha reta cabe na faixa da caminhada, em todos", piorErro <= 0.13, `pior desvio ${piorErro.toFixed(3)}`);
  t("e nenhum passa de dez quilômetros — cinturão, não viagem", maisLonge < 10, `${maisLonge.toFixed(1)} km`);
  const cid = cidades[0];
  const um = arredoresDaCidade("prova|coord", cid)[0];
  const o = ondeFicaOArredor(cid, um);
  t("o rumo desenhado é o rumo escrito", C.rumoEntre(C.coordDe(cid), um).id === o.rumo.id);
  t("e o envelope do Mestre traz esse rumo", resumoArredoresPrompt("prova|coord", cid).includes(o.rumo.rotulo));
  /* determinismo: o moinho não muda de lado da cidade entre um turno e outro */
  const b1 = arredoresDaCidade("prova|coord", cid).map((a) => `${a.nome}@${a.x.toFixed(4)},${a.y.toFixed(4)}`).join("|");
  const b2 = arredoresDaCidade("prova|coord", cid).map((a) => `${a.nome}@${a.x.toFixed(4)},${a.y.toFixed(4)}`).join("|");
  t("mesma semente, mesmo cinturão, para sempre", b1 === b2);
  t("e o tempo de ida continua saindo em português", /min a pé|h a pé/.test(tempoDeIda(um)));
}

sec("9. o lugar passa a ter ponto");
{
  const cid = { nome: "Pedravale", x: 40, y: 40 };
  const p1 = pontoDoLugar("a fazenda de Jessa", cid, "arredores");
  const p2 = pontoDoLugar("a fazenda de Jessa", cid, "arredores");
  t("o ponto sai do nome e não muda", p1.x === p2.x && p1.y === p2.y);
  t("e dois lugares diferentes caem em lados diferentes",
    C.rumoEntre(C.coordDe(cid), p1).id !== C.rumoEntre(C.coordDe(cid), pontoDoLugar("o moinho quebrado", cid, "arredores")).id);
  t("um arredor fica a uma caminhada", C.kmEntre(cid, p1) < C.kmAPe(MINUTOS_DA_DISTANCIA.arredores) * 1.4);
  /* A ESCALA MUDA COM A DISTÂNCIA, e tem de mudar: o pergaminho de cem por
     cem não enxerga um corredor, e fingir que enxerga é perder o corredor. */
  const quarto = pontoDoLugar("o quarto de cima", cid, "dentro");
  t("um cômodo mora em METROS, não em unidades", quarto.x === 40 && quarto.y === 40 && (quarto.mx !== 0 || quarto.my !== 0));
  t("e ele fica a menos de trezentos metros do centro", C.kmEntre(cid, quarto) < 0.3);
  t("sem âncora, não há ponto inventado", pontoDoLugar("a fazenda", null, "arredores") === null);

  const l = definirLugar("a fazenda de Jessa", { cidade: "Pedravale", dia: 3, ancora: cid });
  t("definirLugar entrega o lugar já com posição", l.coord && l.coord.x === p1.x);
  const dado = definirLugar("o moinho de cima", { cidade: "Pedravale", ancora: cid, coord: { x: 41.1, y: 39.4 } });
  t("e a coordenada pronta ganha da âncora", dado.coord.x === 41.1);
  /* a catraca: save antigo não tem coord, e null é honesto */
  t("save antigo continua abrindo, sem posição", garantirLugar({ nome: "a torre caída", cidade: "X" }).coord === null);
  t("e a posição salva volta normalizada", garantirLugar({ nome: "x", coord: { x: 5, y: 5 } }).coord.mx === 0);
}

sec("10. o Geógrafo rastreia — e o que ele diz é o que a tela desenha");
{
  const mapa = { cidades: [
    { nome: "Pedravale", x: 20, y: 30, porte: "cidade", bioma: "planicie", descoberta: true },
    { nome: "Rio do Sul", x: 60, y: 70, porte: "cidade", bioma: "planicie", descoberta: true },
    { nome: "Escondida", x: 22, y: 31, descoberta: false },
  ] };
  const base = { mapa, semente: "prova|rastreio" };

  const naCidade = G.rastrearOTurno({ ...base, cidadeAtual: "Pedravale" });
  t("na cidade, há endereço", /^[A-T]\d+ /.test(naCidade.endereco), naCidade.endereco);
  t("e o herói não aparece como vizinho de si mesmo", !naCidade.perto.some((p) => p.nome === "Pedravale"));
  /* achado na tela, e o nome sozinho não pegava: com um lugar de save
     antigo (sem coordenada) o ponto cai no da cidade, o nome não bate com
     o do lugar e a linha saía com "Baixo do Eco (0 m, 1 min a pé)" logo
     abaixo de "você está em Baixo do Eco". A distância vê o que o nome não vê. */
  const comLugarVelho = G.rastrearOTurno({ ...base, cidadeAtual: "Pedravale", lugar: { nome: "Praça de Escambo" } });
  t("e nem com um lugar de save antigo, sem posição", !comLugarVelho.perto.some((p) => p.km < 0.4));
  t("o cinturão desta cidade entra na lista", naCidade.perto.some((p) => p.tipo === "arredor"));
  t("e a cidade que ele não conhece, não", !naCidade.perto.some((p) => p.nome === "Escondida"));
  /* DUAS LINHAS, E DE PROPÓSITO. O endereço custa 17 caracteres e vai no
     ONDE, que nunca é cortado. A vizinhança custa dez vezes isso e vai
     para a seção DAQUI, de prioridade baixa: numa cena cheia a Pauta
     prefere a segunda pessoa presente, e prefere certo. */
  t("a linha do ONDE é só o endereço, e é curta", /^⌖ [A-T]\d+ /.test(G.linhaDoRastreio(naCidade)) && G.linhaDoRastreio(naCidade).length < 40, G.linhaDoRastreio(naCidade));
  t("e a vizinhança sai por outra porta", /\(ao? \w+, /.test(G.linhaDosVizinhos(naCidade)), G.linhaDosVizinhos(naCidade));

  /* NA ESTRADA: a fração é a da jornada, e o marcador anda com ela */
  const emViagem = (andadoMin) => G.rastrearOTurno({ ...base, cidadeAtual: "Pedravale", jornada: { de: "Pedravale", para: "Rio do Sul", totalMin: 1000, andadoMin } });
  const r0 = emViagem(0), r5 = emViagem(500), r9 = emViagem(900);
  t("recém-partido, quase nada foi feito", r0.marcha.feitos < 1);
  t("na metade, feitos e faltam são iguais", perto(r5.marcha.feitos, r5.marcha.faltam, 1e-6));
  t("e o ponto ANDA entre um avanço e outro", r9.marcha.feitos > r5.marcha.feitos && r9.marcha.faltam < r5.marcha.faltam);
  t("a casa da grade muda no caminho", r0.endereco.split(" ")[0] !== r9.endereco.split(" ")[0], `${r0.endereco} → ${r9.endereco}`);
  t("o rumo da marcha é o da origem para o destino", r5.marcha.rumo.id === "sudeste", r5.marcha.rumo.id);
  /* achado na tela: na estrada a lista trazia "o poço fundo (a nordeste,
     671 km)" — o cinturão da cidade de onde se saiu, que a jornada mantém
     em cidadeAtual. Um moinho a seiscentos quilômetros não é vizinho. */
  t("na estrada, o cinturão da origem sai da lista", !r5.perto.some((p) => p.tipo === "arredor"), r5.perto.map((p) => p.nome).join("|"));
  t("e a origem continua lá, com a distância crescendo",
    r5.perto.some((p) => p.nome === "Pedravale") && r9.perto.find((p) => p.nome === "Pedravale").km > r5.perto.find((p) => p.nome === "Pedravale").km);
  /* na estrada o endereço leva o RUMO junto, e SÓ o rumo: quanto já se
     andou e quanto falta já está no envelope da viagem, em horas e em
     avanços. Repetir em quilômetros seria a terceira versão do número. */
  t("na estrada, o endereço leva o rumo da marcha", /^⌖ .+ · marcha a sudeste$/.test(G.linhaDoRastreio(r5)), G.linhaDoRastreio(r5));
  t("e nada de quilômetro repetido do envelope da viagem", !/km/.test(G.linhaDoRastreio(r5)));

  /* FORA DOS MUROS: o herói na fazenda não é o herói na praça */
  const fazenda = pontoDoLugar("a fazenda velha", { nome: "Pedravale", x: 20, y: 30 }, "arredores");
  const noLugar = G.rastrearOTurno({ ...base, cidadeAtual: "Pedravale", lugar: { nome: "a fazenda velha", coord: fazenda } });
  t("o ponto é o do lugar, não o da cidade", noLugar.coord.x === fazenda.x);
  t("e a cidade vira um vizinho, com distância", noLugar.perto.some((p) => p.nome === "Pedravale" && p.km > 0));

  t("sem mapa, sem rastreio — e sem chute", G.rastrearOTurno({ cidadeAtual: "Pedravale" }) === null);
  t("linha vazia para rastreio vazio", G.linhaDoRastreio(null) === "");
}

sec("10b. o elenco também tem ponto — e ele é DERIVADO");
{
  const mapa = { cidades: [
    { nome: "Pedravale", x: 20, y: 30, porte: "cidade", bioma: "planicie", descoberta: true },
    { nome: "Rio do Sul", x: 60, y: 70, porte: "cidade", bioma: "planicie", descoberta: true },
  ] };
  const base = { mapa, semente: "prova|elenco", cidadeAtual: "Pedravale" };
  const arr = arredoresDaCidade(base.semente, mapa.cidades[0]);

  /* 1) QUEM ANDA COMIGO ESTÁ ONDE EU ESTOU. Nenhum texto ganha disso. */
  const kael = { nome: "Kael", local: "Rio do Sul" };
  const comGrupo = G.posicaoDePessoa(kael, { ...base, grupo: [{ nome: "Kael" }] });
  t("quem viaja comigo está onde eu estou", comGrupo.comigo && comGrupo.coord.x === 20 && comGrupo.coord.y === 30);
  t("mesmo que o registro diga outra cidade", G.posicaoDePessoa(kael, base).coord.x === 60);

  /* 2) o local que nomeia um arredor devolve o ponto DELE — o mesmo que o
     sistema gerou e o mapa desenha, não um parecido */
  const naFazenda = G.posicaoDePessoa({ nome: "Jessa", local: arr[0].nome }, base);
  t("o local que é um arredor devolve o ponto do arredor", naFazenda.coord.x === arr[0].x && naFazenda.coord.y === arr[0].y);
  t("e não vem marcado como palpite", naFazenda.suposto === false);

  /* 3) cidade nomeada: ponto da cidade, com METROS tirados do nome */
  const longe = G.posicaoDePessoa({ nome: "Vera", local: "uma casa em Rio do Sul" }, base);
  t("cidade nomeada no texto livre é encontrada", longe.coord.x === 60 && longe.coord.y === 70);
  t("e o deslocamento é em metros, não em unidades", longe.coord.mx !== 0 || longe.coord.my !== 0);
  /* dois moradores da mesma cidade não moram no mesmo tijolo — e cada um
     mora sempre no mesmo, senão o mapa treme entre um turno e outro */
  const otavio = G.posicaoDePessoa({ nome: "Otávio", local: "atrás do balcão" }, base);
  const sid = G.posicaoDePessoa({ nome: "Sid", local: "na forja" }, base);
  t("dois locais diferentes dão pontos diferentes", otavio.coord.mx !== sid.coord.mx || otavio.coord.my !== sid.coord.my);
  t("e o mesmo local dá sempre o mesmo ponto", G.posicaoDePessoa({ nome: "Otávio", local: "atrás do balcão" }, base).coord.mx === otavio.coord.mx);

  /* 4) texto que não nomeia lugar nenhum: a pessoa está onde o herói está —
     a MESMA suposição do elenco da cena desde a v9.99 — e vai marcada */
  t("sem cidade no texto, supõe-se aqui", otavio.coord.x === 20 && otavio.suposto === true);
  /* 5) e o que não dá para saber devolve null */
  t("sem cidade nenhuma no mundo, sem ponto", G.posicaoDePessoa(otavio, { mapa: { cidades: [] } }) === null);
  t("quem morreu não tem paradeiro", G.posicaoDePessoa({ nome: "X", local: "Rio do Sul", status: "morto" }, base) === null);
  t("lixo não vira pessoa", G.posicaoDePessoa(null, base) === null && G.posicaoDePessoa({}, base) === null);

  const elenco = G.ondeEstaOElenco({
    Otavio: { nome: "Otávio", papel: "taverneiro", local: "atrás do balcão" },
    Vera: { nome: "Vera", papel: "recrutadora", local: "uma casa em Rio do Sul" },
    Jessa: { nome: "Jessa", papel: "lavradora", local: arr[0].nome },
    Morto: { nome: "Bram", local: "Pedravale", status: "morto" },
  }, base);
  t("o elenco vem do mais perto para o mais longe", elenco.map((e) => e.nome).join("|") === "Otávio|Jessa|Vera", elenco.map((e) => e.nome).join("|"));
  t("cada um traz rumo e distância", elenco.every((e) => e.km != null) && elenco[2].rumo.id === "sudeste");
  t("e quem morreu não entra na lista", !elenco.some((e) => e.nome === "Bram"));
  t("o papel viaja junto, para a tela não ficar só com nomes", elenco[0].papel === "taverneiro");
  /* ACHADO NA TELA: o Mestre registra o personagem do jogador no elenco de
     vez em quando, e o registro aceita. A lista mostrava "Íris Vantel · a
     110 m" logo abaixo do ⌖ que diz onde Íris está — a mesma pessoa em dois
     lugares, e o jogador lendo os dois. */
  const comHeroi = { ...base, heroi: "Íris Vantel" };
  const lista = G.ondeEstaOElenco({
    Iris: { nome: "Íris Vantel", papel: "caçadora", local: "Pedravale" },
    Otavio: { nome: "Otávio", papel: "taverneiro", local: "atrás do balcão" },
  }, comHeroi);
  t("o herói não é um do elenco, mesmo quando o registro o guarda", lista.length === 1 && lista[0].nome === "Otávio");
  t("e sem saber quem é o herói, a lista não some", G.ondeEstaOElenco({ Iris: { nome: "Íris Vantel", local: "Pedravale" } }, base).length === 1);
}

sec("11. quem está longe passa a ter lado e distância");
{
  const mapa = { cidades: [
    { nome: "Pedravale", x: 20, y: 30 },
    { nome: "Rio do Sul", x: 60, y: 70 },
  ] };
  const linhas = G.quemNaoChega(
    [{ nome: "Vera", onde: "Rio do Sul", dias: 3 }],
    { mapa, coord: C.coordDe(mapa.cidades[0]) });
  t("o veto continua, com as horas de estrada", /72h de estrada narradas/.test(linhas[0]), linhas[0]);
  t("e agora com o rumo e o quanto", /a sudeste, \d+ km/.test(linhas[0]), linhas[0]);
  /* sem mapa, o veto não some — só perde o detalhe. Uma lacuna nunca vira
     permissão, que é a regra desta casa desde a v9.85. */
  const semMapa = G.quemNaoChega([{ nome: "Vera", onde: "Rio do Sul", dias: 3 }]);
  t("sem mapa, o veto continua de pé", /não entra nesta cena/.test(semMapa[0]));
}

sec("12. a Pauta recebe a coordenada junto do nome do lugar");
{
  const mapa = { cidades: [{ nome: "Pedravale", x: 20, y: 30, porte: "cidade", bioma: "planicie", descoberta: true }] };
  const p = G.paraPauta({
    cidadeAtual: "Pedravale", mapa, semente: "prova|pauta",
    espaco: { tipo: "cidade", dentro: true, tipoDoLocal: "taverna", publico: true, gentePorPerto: 5 },
    longe: [],
  });
  t("a linha do lugar continua primeiro", /Pedravale/.test(p.onde[0]));
  /* O endereço mora no ONDE porque é a mesma frase — onde estou — dita com
     a precisão que faltava. Separá-los convidaria os dois a discordar. */
  t("e o endereço vem logo em seguida, na MESMA seção", p.onde.some((l) => l.startsWith("⌖ ")));
  t("a vizinhança vai para a seção própria", p.daqui.length === 1 && /\(ao? \w+, /.test(p.daqui[0]));
  t("o que o lugar impede continua no NÃO PODE", p.naoPode.some((l) => /não comporta/.test(l)));

  /* ---------------- O ORÇAMENTO É QUEM DECIDE ----------------
     Esta é a prova que justifica a seção separada. Com a vizinhança
     pendurada no ONDE (prioridade 1), a sonda mostrou o preço numa cena
     cheia: saíam a segunda pessoa presente, a FORMA da cena, a linha do
     Intérprete e a do Vilão — quatro coisas que fazem a cena — para
     caberem três moinhos aonde ninguém ia. */
  let cheia = garantirPauta(null);
  cheia = porNaPauta(cheia, "onde", p.onde);
  cheia = porNaPauta(cheia, "daqui", p.daqui);
  cheia = porNaPauta(cheia, "naoPode", p.naoPode);
  cheia = porNaPauta(cheia, "quem", ["Otávio (taverneiro) atrás do balcão", "Vera da Serpente, encostada na porta"]);
  cheia = porNaPauta(cheia, "momento", ["a onda pede o clímax: alguém cobra o que foi prometido"]);
  cheia = porNaPauta(cheia, "forma", ["cena curta, de negociação, com plateia"]);
  cheia = porNaPauta(cheia, "gente", ["Otávio limpa o mesmo copo pela terceira vez", "Vera conta as saídas com os olhos"]);
  cheia = porNaPauta(cheia, "vilao", ["ele concluiu que você está sozinha", "mandou dois homens para a rua de trás"]);

  t("com folga, a vizinhança cabe e entra", /DAQUI/.test(textoDaPauta(cheia, { turno: 7 })));
  /* A prova é do ORDENAMENTO, e por isso aperta o teto em vez de inflar a
     cena: quem decide o que cai é a prioridade, e é ela que se mede. Com o
     orçamento mordendo, o endereço e os vetos ficam, a vizinhança sai, e a
     gente presente sai depois dela. */
  const apertada = textoDaPauta(cheia, { teto: 700, turno: 7 });
  t("apertado, o endereço nunca é cortado", /⌖ /.test(apertada), apertada);
  t("e a gente presente ganha da vizinhança", /Otávio \(taverneiro\)/.test(apertada) && !/DAQUI/.test(apertada));
  t("o veto também ganha dela", /não comporta/.test(apertada));
}

console.log(`\ncoordenadas v9.118: ${ok} passaram, ${mau} falharam`);
process.exit(mau ? 1 : 0);
