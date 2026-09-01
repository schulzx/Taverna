import {
  METROS_POR_QUADRADO, m2q, q2m, TAMANHOS, tamanhoDe, ladoDe, alcanceNatural,
  cenarioDe, montarGrade, garantirGrade, dentro, ehParede, regiaoDe, nomeDoLugar,
  terrenoDificil, temCobertura, bonusDefesaEm, BONUS_COBERTURA,
  quadradosDe, distanciaQuadrados, distanciaM, centroDe, linhaDeVisao,
  alcanca, caminhar, ocupacaoDe, posicionar, adjacentes, moverInimigos,
  quadradosDaArea, pegosPelaArea, mapaEmTexto, resumoGridPrompt,
  detectarAlcanceImpossivel, notaAlcanceImpossivel, METROS_PARA_MORDER, DESLOCAMENTO_PADRAO,
  ESPECIES, QUALIFICADORES, ESCADA, degrauDeTamanho,
} from "../src/grid.js";
import {
  deslocamentoDe, passoEfetivo, velocidadeDaRaca, deslocamentoDeCriatura,
  resumoDeslocamento, DESLOCAMENTO_BASE, DESLOCAMENTO_PEQUENO,
} from "../src/movimento.js";
import { geometriaDe } from "../src/grimorio.js";

let ok = 0, mau = 0;
const t = (n, c) => { if (c) { ok++; console.log("  ok  " + n); } else { mau++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

const campo = montarGrade({ local: "campo aberto", bioma: "planicie" }); // estrada 18x12
const G = garantirGrade(campo);

sec("1. a escala");
t("1,5 m por quadrado", METROS_POR_QUADRADO === 1.5);
t("6 m viram 4 quadrados", m2q(6) === 4);
t("4 quadrados viram 6 m", q2m(4) === 6);
t("0 continua 0", m2q(0) === 0 && q2m(0) === 0);

sec("2. tamanho das criaturas");
t("goblin é pequeno, 1 quadrado", ladoDe({ nome: "Goblin" }) === 1);
t("humano é médio, 1 quadrado", ladoDe({ nome: "Bandido" }) === 1);
t("ogro é grande, 2x2", ladoDe({ nome: "Ogro" }) === 2);
t("gigante é enorme, 3x3", ladoDe({ nome: "Gigante" }) === 3);
t("dragão ancião é imenso, 4x4", ladoDe({ nome: "Dragão Ancião" }) === 4);
t("o campo explícito manda", ladoDe({ nome: "Goblin", tamanho: "imenso" }) === 4);
t("lendário sem nome conhecido ainda é enorme", ladoDe({ nome: "Coisa Sem Nome", ameaca: "lendario" }) === 3);
t("o ogro alcança 3 m parado", alcanceNatural({ nome: "Ogro" }) === 3);
t("o goblin alcança 1,5 m", alcanceNatural({ nome: "Goblin" }) === 1.5);
t("uma criatura grande ocupa 4 quadrados", quadradosDe({ nome: "Ogro", x: 2, y: 2 }).length === 4);
t("uma enorme ocupa 9", quadradosDe({ nome: "Gigante", x: 0, y: 0 }).length === 9);
t("uma imensa ocupa 16", quadradosDe({ nome: "Dragão Ancião", x: 0, y: 0 }).length === 16);

sec("3. distância de mesa (diagonal vale 1)");
{
  const a = { nome: "Vera", x: 0, y: 0 };
  const b = { nome: "Goblin", x: 1, y: 0 };
  const c = { nome: "Goblin", x: 1, y: 1 };
  const d = { nome: "Goblin", x: 4, y: 0 };
  t("adjacente ortogonal = 1 quadrado", distanciaQuadrados(a, b) === 1);
  t("adjacente na diagonal também = 1", distanciaQuadrados(a, c) === 1);
  t("1 quadrado são 1,5 m", distanciaM(a, b) === 1.5);
  t("4 quadrados são 6 m", distanciaM(a, d) === 6);
  const ogro = { nome: "Ogro", x: 0, y: 0 };          // 2x2 → (0,0)-(1,1)
  const alvo = { nome: "Bandido", x: 3, y: 0 };
  t("a caixa do grandão conta: ogro em (0,0) até (3,0) = 2 quadrados", distanciaQuadrados(ogro, alvo) === 2);
  t("e por isso o ogro de alcance 3 m encosta nele", distanciaM(ogro, alvo) === 3);
}

sec("4. regiões: o grid é a matemática, a região é a língua");
{
  t("a estrada tem três regiões", G.regioes.length === 3);
  t("o topo é a vala", nomeDoLugar(campo, 5, 0) === "na vala");
  t("o meio é a estrada", nomeDoLugar(campo, 5, 5) === "na estrada");
  t("o fundo é a encosta", nomeDoLugar(campo, 5, 10) === "na encosta");
  t("a vala dá cobertura", temCobertura(campo, 5, 0));
  t("a encosta é terreno difícil", terrenoDificil(campo, 5, 10));
  t("a estrada aberta não dá cobertura", !temCobertura(campo, 9, 5));
  t("a cobertura vale +2 de defesa", bonusDefesaEm(campo, { nome: "x", x: 5, y: 0 }) === BONUS_COBERTURA);
  t("sem cobertura, zero", bonusDefesaEm(campo, { nome: "x", x: 9, y: 5 }) === 0);
  t("nenhum texto de região traz número", G.regioes.every((r) => !/\d/.test(r.nome)));
}

sec("5. sem grade, tudo se comporta como antes");
t("garantirGrade(null) é null", garantirGrade(null) === null);
t("alcança sempre, sem penalidade", alcanca(null, { x: 0, y: 0 }, { x: 99, y: 99 }).ok === true);
t("sem penalidade nenhuma", alcanca(null, { x: 0, y: 0 }, { x: 99, y: 99 }).penalidade === 0);
t("caminhar recusa com motivo", caminhar(null, { x: 0, y: 0 }, { x: 1, y: 1 }).ok === false);
t("mapa em texto vazio", mapaEmTexto(null, {}) === "");
t("o cão de guarda não morde", detectarAlcanceImpossivel("te agarra", { grade: null }).length === 0);

sec("6. alcance, parede e linha de visão");
{
  const masm = montarGrade({ emMasmorra: true });   // 7x18, paredes laterais no meio
  const heroi = { nome: "Vera", x: 3, y: 16 };
  const perto = { nome: "Goblin", x: 3, y: 15 };
  const longe = { nome: "Goblin", x: 3, y: 1 };
  t("golpe de perto alcança o vizinho", alcanca(masm, heroi, perto).ok);
  t("e não alcança quem está a 22 m", !alcanca(masm, heroi, longe).ok);
  t("o motivo diz a distância e o lugar", /longe demais/.test(alcanca(masm, heroi, longe).motivo));
  const arco = alcanca(masm, heroi, longe, { alcanceM: 45 });
  t("com arco de 45 m, alcança", arco.ok);
  t("e paga penalidade por distância", arco.penalidade > 0);
  t("a penalidade cresce em faixas de 9 m", alcanca(masm, heroi, { nome: "z", x: 3, y: 13 }, { alcanceM: 45 }).penalidade === 0);
  /* parede: o corredor tem muro em (0..1, 7..10) */
  t("há parede no muro lateral", ehParede(masm, 0, 8));
  t("não há parede no meio do corredor", !ehParede(masm, 3, 8));
  /* coluna 0 atravessa o muro lateral (0,7)-(1,10); a coluna 3 é o corredor */
  t("a visão pela coluna do muro é bloqueada", !linhaDeVisao(masm, { nome: "a", x: 0, y: 4 }, { nome: "b", x: 0, y: 13 }));
  t("a visão pelo corredor é livre", linhaDeVisao(masm, { nome: "a", x: 3, y: 4 }, { nome: "b", x: 3, y: 13 }));
  t("e o alcance recusa quem está atrás de parede", !alcanca(masm, { nome: "a", x: 0, y: 4 }, { nome: "b", x: 0, y: 13 }, { alcanceM: 45 }).ok);
  t("com o motivo certo", /parede/.test(alcanca(masm, { nome: "a", x: 0, y: 4 }, { nome: "b", x: 0, y: 13 }, { alcanceM: 45 }).motivo || ""));
}

sec("7. caminhar: orçamento em metros e terreno difícil");
{
  const heroi = { nome: "Vera", x: 9, y: 5 };   // na estrada
  const r1 = caminhar(campo, heroi, { x: 9, y: 2 }, { deslocamentoM: 9 });
  t("3 quadrados cabem em 9 m", r1.ok);
  t("e custam 4,5 m", r1.custoM === 4.5);
  t("o caminho tem os passos", r1.caminho.length === 3);
  /* 4 quadrados no plano custam 6 m; os mesmos 4 terminando na encosta
     (difícil) custam 7,5 — o último passo vale por dois */
  const plano = caminhar(campo, heroi, { x: 5, y: 5 }, { deslocamentoM: 9 });
  const r2 = caminhar(campo, heroi, { x: 9, y: 9 }, { deslocamentoM: 9 });
  t("4 quadrados no plano custam 6 m", plano.ok && plano.custoM === 6);
  t("terminar na encosta (difícil) custa dobrado no último passo", r2.ok && r2.custoM === 7.5);
  t("e a encosta inteira não cabe em 9 m", !caminhar(campo, heroi, { x: 9, y: 11 }, { deslocamentoM: 9 }).ok);
  const r3 = caminhar(campo, heroi, { x: 17, y: 11 }, { deslocamentoM: 9 });
  t("longe demais para um deslocamento só", !r3.ok);
  t("e o motivo cita o lugar, não coordenada", /encosta/.test(r3.motivo) && !/\d,\d/.test(r3.motivo));
  t("ficar parado é recusado", !caminhar(campo, heroi, { x: 9, y: 5 }).ok);
  t("fora do campo é recusado", !caminhar(campo, heroi, { x: 99, y: 99 }).ok);
  const ocupados = ocupacaoDe([{ nome: "Ogro", x: 8, y: 4, vida: 10 }]);
  t("quadrado ocupado bloqueia", !caminhar(campo, heroi, { x: 8, y: 4 }, { ocupados }).ok);
  t("o grandão ocupa os quatro quadrados", ocupados.has("8,4") && ocupados.has("9,4") && ocupados.has("8,5") && ocupados.has("9,5"));
  const gigante = { nome: "Gigante", x: 2, y: 2 };
  const ocup2 = ocupacaoDe([{ nome: "Bandido", x: 6, y: 4, vida: 5 }]);
  const r4 = caminhar(campo, gigante, { x: 5, y: 3 }, { ocupados: ocup2, deslocamentoM: 9 });
  t("o enorme não cabe onde o 3x3 encosta em alguém", !r4.ok && /demais para caber|ocupado|longe/.test(r4.motivo));
}

sec("8. áreas com forma de verdade — o fim do remendo de zonas");
{
  const o = { nome: "Vera", x: 9, y: 8 };
  const alvo = { nome: "Ogro", x: 9, y: 4 };
  const esfera = quadradosDaArea({ forma: "esfera", raio: 6, focos: 1 }, { grade: campo, origem: o, alvo });
  const raioQ = m2q(6);
  t("esfera de 6 m tem raio de 4 quadrados", raioQ === 4);
  t("a esfera cobre um disco em volta do alvo", esfera.length > 20 && esfera.length < 90);
  t("o quadrado do alvo está dentro", esfera.some((q) => q.x === 9 && q.y === 4));
  t("um ponto a 10 quadrados está fora", !esfera.some((q) => q.x === 9 && q.y === 8 + 6));

  const pequena = quadradosDaArea({ forma: "esfera", raio: 1.5, focos: 1 }, { grade: campo, origem: o, alvo });
  t("uma esfera de 1,5 m pega muito menos que uma de 6", pequena.length < esfera.length);

  const cone = quadradosDaArea({ forma: "cone", raio: 9, focos: 1 }, { grade: campo, origem: o, alvo });
  t("o cone sai de VOCÊ, não do alvo", cone.every((q) => Math.hypot(q.x - 9, q.y - 8) <= m2q(9) + 1));
  t("o cone aponta para o alvo (para cima)", cone.filter((q) => q.y < 8).length > cone.filter((q) => q.y > 8).length);

  const linha = quadradosDaArea({ forma: "linha", raio: 9, focos: 1 }, { grade: campo, origem: o, alvo });
  t("a linha é fina", linha.length <= m2q(9) + 1);
  t("e vai na direção do alvo", linha.every((q) => q.y <= 8));

  const pessoal = quadradosDaArea({ forma: "pessoal", raio: 0 }, { grade: campo, origem: o, alvo });
  t("pessoal é só você", pessoal.length === 1 && pessoal[0].x === 9 && pessoal[0].y === 8);
  const soAlvo = quadradosDaArea({ forma: "alvo", raio: 0 }, { grade: campo, origem: o, alvo });
  t("alvo único pega só os quadrados dele", soAlvo.length === quadradosDe(alvo).length);

  /* o teste que motivou o grid: bola de fogo e chuva de meteoros deixam de
     ser a mesma coisa */
  const bola = quadradosDaArea(geometriaDe({ nome: "Bola de Fogo" }), { grade: campo, origem: o, alvo });
  const chuva = quadradosDaArea(geometriaDe({ nome: "Chuva de Meteoros" }), { grade: campo, origem: o, alvo });
  t("Bola de Fogo não cobre o campo inteiro", bola.length < campo.largura * campo.altura);
  t("Chuva de Meteoros cobre muito mais que a Bola de Fogo", chuva.length > bola.length);
}

sec("9. quem a área pega — e o fogo amigo");
{
  const o = { nome: "Vera", x: 9, y: 8 };
  const alvo = { nome: "Ogro", x: 9, y: 4, vida: 50 };
  const outro = { nome: "Goblin", x: 10, y: 5, vida: 8 };
  const distante = { nome: "Arqueiro", x: 2, y: 1, vida: 8 };
  const aliadoPerto = { nome: "Brisa", x: 9, y: 6, vida: 40 };
  const aliadoLonge = { nome: "Tor", x: 16, y: 10, vida: 40 };
  const area = quadradosDaArea({ forma: "esfera", raio: 4.5, focos: 1 }, { grade: campo, origem: o, alvo });
  const inim = pegosPelaArea(area, [alvo, outro, distante]);
  const alia = pegosPelaArea(area, [aliadoPerto, aliadoLonge]);
  t("pega o alvo", inim.some((e) => e.nome === "Ogro"));
  t("pega o vizinho do alvo", inim.some((e) => e.nome === "Goblin"));
  t("não pega quem está do outro lado", !inim.some((e) => e.nome === "Arqueiro"));
  t("PEGA o aliado que estava perto demais", alia.some((e) => e.nome === "Brisa"));
  t("não pega o aliado longe", !alia.some((e) => e.nome === "Tor"));
  t("quem já caiu não entra na conta", pegosPelaArea(area, [{ nome: "Morto", x: 9, y: 4, vida: 0, derrotado: true }]).length === 0);
  t("basta um quadrado do grandão na área", pegosPelaArea(area, [{ nome: "Gigante", x: 9, y: 1, vida: 90 }]).length === 1);
}

sec("10. posicionar e adjacência");
{
  const p = posicionar(campo, {
    heroi: { nome: "Vera" },
    grupo: [{ nome: "Brisa", vida: 40 }, { nome: "Tor", vida: 40 }],
    inimigos: [{ nome: "Ogro", vida: 50 }, { nome: "Goblin", vida: 8, agil: true }],
  });
  t("o herói ganhou posição", p.heroi.x != null && p.heroi.y != null);
  t("o grupo ganhou posição", p.grupo.every((g) => g.x != null));
  t("os inimigos ganharam posição", p.inimigos.every((e) => e.x != null));
  t("o herói começa longe dos inimigos", p.inimigos.every((e) => distanciaM(e, p.heroi) > 6));
  t("o ágil começa mais perto que o lento", distanciaM(p.inimigos[1], p.heroi) < distanciaM(p.inimigos[0], p.heroi));
  const todos = [p.heroi, ...p.grupo, ...p.inimigos];
  const chaves = new Set();
  let colidiu = false;
  for (const e of todos) for (const q of quadradosDe(e)) { const k = `${q.x},${q.y}`; if (chaves.has(k)) colidiu = true; chaves.add(k); }
  t("ninguém nasce em cima de ninguém", !colidiu);

  const heroi = { nome: "Vera", x: 5, y: 5 };
  const colado = { nome: "Goblin", x: 5, y: 6, vida: 8 };
  const ogroLonge = { nome: "Ogro", x: 5, y: 7, vida: 50 };
  const fora = { nome: "Arqueiro", x: 5, y: 11, vida: 8 };
  const adj = adjacentes(heroi, [colado, ogroLonge, fora]);
  t("o vizinho está colado", adj.some((e) => e.nome === "Goblin"));
  t("o ogro alcança de 3 m e também prende", adj.some((e) => e.nome === "Ogro"));
  t("o arqueiro distante não prende", !adj.some((e) => e.nome === "Arqueiro"));
}

sec("11. a IA de posição anda na direção certa");
{
  const heroi = { nome: "Vera", x: 9, y: 10 };
  const inim = [{ nome: "Ogro", x: 9, y: 1, vida: 50 }, { nome: "Arqueiro", x: 2, y: 2, vida: 8, distancia: true }];
  const r = moverInimigos(campo, inim, heroi, [heroi]);
  const ogroDepois = r.inimigos.find((e) => e.nome === "Ogro");
  t("o ogro se aproximou", distanciaM(ogroDepois, heroi) < distanciaM(inim[0], heroi));
  t("e o movimento foi registrado com nome de lugar", r.movimentos.some((m) => m.nome === "Ogro" && !/\d,\d/.test(m.para)));
  /* ele se aproxima, mas nunca mais que o deslocamento de um turno */
  const antes = distanciaM(inim[0], heroi), depois = distanciaM(ogroDepois, heroi);
  t("o ogro não cobriu mais chão do que um turno permite", antes - depois <= DESLOCAMENTO_PADRAO + 0.01);
  const arq = r.inimigos.find((e) => e.nome === "Arqueiro");
  t("o atirador que já alcança não fecha distância", arq.x === 2 && arq.y === 2);
  const colado = moverInimigos(campo, [{ nome: "Goblin", x: 9, y: 9, vida: 8 }], heroi, [heroi]);
  t("quem já alcança fica parado", colado.movimentos.length === 0);
}

sec("12. o cão de guarda continua GROSSO");
{
  const heroi = { nome: "Vera", x: 9, y: 10 };
  const longe = { nome: "Troll", x: 9, y: 1, vida: 80 };        // 13,5 m
  const quase = { nome: "Ogro", x: 9, y: 8, vida: 50 };          // 3 m
  const ctx = { grade: campo, heroi, inimigos: [longe, quase] };
  const m1 = detectarAlcanceImpossivel("O Troll te agarra pelo pescoço e ergue você do chão.", ctx);
  t("morde quem está a 13 m e 'te agarra'", m1.length === 1 && m1[0].nome === "Troll");
  const m2 = detectarAlcanceImpossivel("O Ogro te agarra pelo pescoço.", ctx);
  t("NÃO morde quem está a 3 m", m2.length === 0);
  const m3 = detectarAlcanceImpossivel("O Troll ruge de longe e ainda não te alcança.", ctx);
  t("NÃO morde a negação bem escrita", m3.length === 0);
  const m4 = detectarAlcanceImpossivel("O Troll avança pesado pelo salão.", ctx);
  t("NÃO morde quem só avança", m4.length === 0);
  t("a régua é 6 m", METROS_PARA_MORDER === 6);
  const nota = notaAlcanceImpossivel(m1, campo, heroi);
  t("a nota cita o lugar, não coordenada", /vala|estrada|encosta/.test(nota) && !/\d+,\d+/.test(nota));
}

sec("13. os textos não vazam número nem jargão");
{
  const heroi = { nome: "Vera", x: 9, y: 5 };
  const oc = { heroi, grupo: [{ nome: "Brisa", x: 8, y: 5, vida: 40 }], inimigos: [{ nome: "Ogro", x: 9, y: 1, vida: 50 }] };
  const mapa = mapaEmTexto(campo, oc);
  t("o mapa lista por região", /na estrada|na vala|na encosta/.test(mapa));
  t("o mapa não traz coordenada", !/\d+,\d+/.test(mapa));
  t("o grandão vem marcado como grande", /grande/i.test(mapa));
  const prompt = resumoGridPrompt(campo, oc);
  t("o prompt proíbe a palavra quadrado", /nunca a palavra quadrado/.test(prompt));
  t("o prompt proíbe a palavra grid", /nunca a palavra grid/.test(prompt));
  t("o prompt manda usar nome de lugar", /NOMES dos lugares/.test(prompt));
}

sec("14. deslocamento por raça — os números do 5e");
{
  t("humano anda 9 m (30 ft)", velocidadeDaRaca("Humano").andar === 9);
  t("elfo anda 9 m", velocidadeDaRaca("Elfo").andar === 9);
  t("anão anda 7,5 m (25 ft)", velocidadeDaRaca("Anão").andar === 7.5);
  t("halfling anda 7,5 m", velocidadeDaRaca("Halfling").andar === 7.5);
  t("gnomo anda 7,5 m", velocidadeDaRaca("Gnomo").andar === 7.5);
  t("goliath anda 9 m", velocidadeDaRaca("Goliath").andar === 9);
  t("cromado anda 10,5 m", velocidadeDaRaca("Cromado").andar === 10.5);
  t("raça desconhecida cai no padrão", velocidadeDaRaca("Xisto") .andar === DESLOCAMENTO_BASE);
  t("acento não atrapalha", velocidadeDaRaca("anao").andar === DESLOCAMENTO_PEQUENO);
  t("o padrão do grid bate com o do 5e", DESLOCAMENTO_PADRAO === 9);
}

sec("15. o que muda o passo");
{
  const anao = { nome: "Tor", raca: "Anão", atributos: { forca: 4 }, efeitos: [], condicoes: [] };
  t("anão base 7,5", deslocamentoDe(anao).andar === 7.5);
  t("Passos Longos dobra", deslocamentoDe(anao, { dobrar: true }).andar === 15);

  const voando = { nome: "Vera", raca: "Humano", efeitos: [{ nome: "Voo", descricao: "você plana" }], condicoes: [] };
  const d = deslocamentoDe(voando);
  t("a magia Voo dá 18 m (60 ft)", d.voar === 18);
  const pe = passoEfetivo(voando);
  t("quem voa usa a velocidade de voo", pe.metros === 18 && pe.voando);
  t("e ignora terreno difícil", pe.ignoraDificil);

  const lento = { nome: "X", raca: "Humano", efeitos: [{ nome: "Lentidão", descricao: "" }], condicoes: [] };
  t("Lentidão tira 3 m", deslocamentoDe(lento).andar === 6);

  const preso = { nome: "X", raca: "Humano", efeitos: [], condicoes: [{ id: "paralisado", nome: "Paralisado" }] };
  const dp = deslocamentoDe(preso);
  t("paralisado não anda", dp.andar === 0 && dp.parado);
  t("e o passo efetivo sabe disso", passoEfetivo(preso).parado);

  const cansado = { nome: "X", raca: "Humano", efeitos: [], condicoes: [], exaustao: 2 };
  t("exaustão 2 corta pela metade", deslocamentoDe(cansado).andar === 4.5);
  const pouco = { nome: "X", raca: "Humano", efeitos: [], condicoes: [], exaustao: 1 };
  t("exaustão 1 ainda não corta", deslocamentoDe(pouco).andar === 9);

  const pesado = { nome: "X", raca: "Humano", atributos: { forca: 1 }, efeitos: [], condicoes: [], equipados: { armadura: { nome: "Armadura de Placas" } } };
  t("armadura pesada sem força tira 3 m", deslocamentoDe(pesado).andar === 6);
  const anaoPesado = { ...pesado, raca: "Anão" };
  t("o anão não perde passo por armadura pesada", deslocamentoDe(anaoPesado).andar === 7.5);

  t("o resumo é legível", /m a p[ée]/.test(resumoDeslocamento(anao)));
  t("e cita o voo quando há", /voando/.test(resumoDeslocamento(voando)));
}

sec("16. criaturas do bestiário");
{
  t("dragão voa 18 m", deslocamentoDeCriatura({ nome: "Dragão Jovem" }).voar === 18);
  t("e usa o voo como passo", deslocamentoDeCriatura({ nome: "Dragão Jovem" }).metros === 18);
  t("zumbi arrasta 6 m", deslocamentoDeCriatura({ nome: "Zumbi" }).metros === 6);
  t("lobo corre 12 m", deslocamentoDeCriatura({ nome: "Lobo Atroz", agil: true }).metros === 12);
  t("o comum anda 9 m", deslocamentoDeCriatura({ nome: "Bandido" }).metros === 9);
}


sec("O TAMANHO SAI DO NOME (v9.74) — a espécie manda, o adjetivo empurra");
{
  /* O achado: "gigante" morava na lista dos Enormes porque o bestiário tem
     uma criatura chamada Gigante. Só que quase nunca é a espécie — é
     adjetivo. Um Rato Gigante ocupava NOVE quadrados e alcançava três
     metros parado; e "aranha gigante"/"javali gigante" estavam escritos na
     lista dos Grandes sem nunca serem alcançados, porque o "gigante" da
     lista de cima comia os dois antes. Duas linhas de tabela que existiam
     e não faziam nada. */
  const tam = (n) => tamanhoDe({ nome: n }).id;
  t("o rato gigante é um cão grande, não um ogro", tam("Rato Gigante") === "medio");
  t("e ocupa UM quadrado", ladoDe({ nome: "Rato Gigante" }) === 1);
  t("a aranha gigante também", tam("Aranha Gigante") === "medio");
  t("mas a colossal sobe dois degraus", tam("Aranha Colossal") === "grande");
  t("javali é médio, e gigante o faz grande", tam("Javali") === "medio" && tam("Javali Gigante") === "grande");

  /* as duas pontas da mesma espécie deixam de ter o mesmo tamanho */
  t("dragão é enorme", tam("Dragão") === "enorme");
  t("o jovem é grande", tam("Dragão Jovem") === "grande");
  t("o ancião é imenso", tam("Dragão Ancião") === "imenso");
  t("elemental menor encolhe", tam("Elemental Menor") === "medio");
  t("elemental maior cresce", tam("Elemental Maior") === "enorme");
  t("lobo atroz é grande, lobo é médio", tam("Lobo Atroz") === "grande" && tam("Lobo") === "medio");

  /* A TRAVA: o Gigante do bestiário não pode qualificar a si mesmo e virar
     imenso — o qualificador tem de vir DEPOIS da espécie no texto. */
  t("o Gigante do bestiário continua enorme", tam("Gigante") === "enorme");
  t("e o campo explícito manda em tudo", tamanhoDe({ nome: "Rato Gigante", tamanho: "imenso" }).id === "imenso");
  t("nome que a tabela não conhece é médio", tam("Coisa Sem Nome") === "medio");
  t("mas um lendário sem nome ainda é grande coisa", tamanhoDe({ nome: "Xyz", ameaca: "lendario" }).id === "enorme");
  t("a escada tem seis degraus", ESCADA.length === 6);
  t("subir além do topo para no topo", degrauDeTamanho("imenso", 3).id === "imenso");
  t("descer além do fundo para no fundo", degrauDeTamanho("miudo", -3).id === "miudo");
  t("toda espécie aponta para um degrau da escada", ESPECIES.every((e) => ESCADA.includes(e.tamanho)));
  t("todo qualificador empurra alguma coisa", QUALIFICADORES.every((q) => q.quanto !== 0));
}

console.log(`\n${ok} ok, ${mau} falhas`);
process.exit(mau ? 1 : 0);
