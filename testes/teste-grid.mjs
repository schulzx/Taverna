import {
  PLANTAS, custosDe, alcancaveisDe,
  METROS_POR_QUADRADO, m2q, q2m, TAMANHOS, tamanhoDe, ladoDe, alcanceNatural,
  cenarioDe, montarGrade, garantirGrade, dentro, ehParede, regiaoDe, nomeDoLugar,
  terrenoDificil, temCobertura, bonusDefesaEm, BONUS_COBERTURA,
  quadradosDe, distanciaQuadrados, distanciaM, centroDe, linhaDeVisao,
  alcanca, caminhar, ocupacaoDe, posicionar, adjacentes, moverInimigos,
  quadradosDaArea, pegosPelaArea, mapaEmTexto, resumoGridPrompt,
  detectarAlcanceImpossivel, notaAlcanceImpossivel, METROS_PARA_MORDER, DESLOCAMENTO_PADRAO,
  ESPECIES, QUALIFICADORES, ESCADA, degrauDeTamanho,
  PASSO_NA_RODADA, passoQueResta, podeDarUmPasso, passoAposAndar,
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

sec("O ORÇAMENTO DO PASSO NA RODADA — o passo tem preço (v9.279)");
{
  /* A QUEIXA, palavra por palavra: `F16 → F12 → F8 → F4 → E2` = 21 m numa
     só rodada, com a marca parada em "9 de 9 m" o tempo todo. Aqui ela é
     refeita com a conta que faltava, e a rodada fecha onde tem de fechar. */
  const TOTAL = 9;

  t("a tabela diz onde o que resta mora", PASSO_NA_RODADA.campo === "movM");
  t("e qual é o menor passo que existe", PASSO_NA_RODADA.minimo === METROS_POR_QUADRADO);
  t("o mínimo é uma casa do tabuleiro", PASSO_NA_RODADA.minimo === q2m(1));

  /* "NINGUÉM ANDOU AINDA" NÃO É ZERO — é a rodada inteira. Foi
     exactamente esta leitura que faltou: a primeira rodada não tinha onde
     guardar o gasto, e ausência virou "de graça" em vez de "inteira". */
  t("sem nada guardado, vale o passo inteiro", passoQueResta(null, TOTAL) === 9);
  t("undefined também é a rodada inteira", passoQueResta(undefined, TOTAL) === 9);
  t("mas zero guardado é zero, e não o passo inteiro", passoQueResta(0, TOTAL) === 0);
  t("lixo guardado não vale como saldo", passoQueResta("nada", TOTAL) === 9 && passoQueResta(NaN, TOTAL) === 9);

  /* a caminhada da queixa, casa a casa, com o custo que `caminhar` cobraria:
     quatro passos de 1,5 m entre F16 e F4 e o quinto até E2 */
  let resta = null;
  const andou = [];
  for (const custo of [6, 6, 6, 3]) {
    andou.push(podeDarUmPasso(resta, TOTAL));
    resta = passoAposAndar(resta, TOTAL, custo);
  }
  t("o primeiro passo é permitido", andou[0] === true);
  t("o segundo ainda cabe", andou[1] === true && resta !== 9);
  t("o quarto já não cabia", andou[3] === false);
  t("e o saldo nunca desce abaixo de zero", resta === 0);
  /* O NÚMERO DA QUEIXA: 21 m eram possíveis, 9 é o que a rodada paga. */
  t("21 m numa rodada deixam de ser possíveis", passoAposAndar(null, TOTAL, 21) === 0);
  t("com o passo acabado, não se dá mais um", podeDarUmPasso(0, TOTAL) === false);
  t("com uma casa de sobra, ainda se dá", podeDarUmPasso(1.5, TOTAL) === true);
  t("com menos de uma casa, não", podeDarUmPasso(1.4, TOTAL) === false);

  /* A PEÇA QUE FALTAVA É DEVOLVER SEMPRE UM NÚMERO. A fiação escrevia
     `sobrou ? guarda : deixa passar`, e sem saldo anterior o desconto
     evaporava — era este o buraco, e é aqui que ele fecha. */
  t("andar sem saldo anterior ainda desconta", passoAposAndar(null, TOTAL, 6) === 3);
  t("e devolve número, nunca vazio", typeof passoAposAndar(null, TOTAL, 6) === "number");
  t("custo maior que o saldo não vira dívida", passoAposAndar(3, TOTAL, 7.5) === 0);
  t("custo de lixo não gasta nada", passoAposAndar(6, TOTAL, null) === 6 && passoAposAndar(6, TOTAL, "x") === 6);

  /* o meio quadrado aparece o tempo todo (1,5 m por casa): a conta do
     jogador tem de fechar com o número que ele lê na tela */
  t("meia casa não some na conta", passoAposAndar(null, TOTAL, 1.5) === 7.5);
  t("o passo élfico de 10,5 também fecha", passoAposAndar(null, 10.5, 7.5) === 3);

  /* um passo que ENCOLHE no meio da rodada (exaustão, lentidão) não pode
     ser burlado por um saldo antigo maior do que o novo total */
  t("saldo antigo não passa o total de hoje", passoQueResta(9, 4.5) === 4.5);
  t("nem o do anão de 7,5", passoQueResta(9, DESLOCAMENTO_PEQUENO) === 7.5);
  t("total de lixo não abre crédito", passoQueResta(null, null) === 0 && passoQueResta(9, "x") === 0);
}


/* ============================================================
   E4 · O CUSTO DE CADA QUADRADO — e a prova de que o refactor não
   mudou uma casa

   `custosDe` nasceu porque `alcancaveisDe` SEMPRE teve o custo de cada
   casa na mão e o deitava fora na última linha (`new Set(custo.keys())`).
   A tela de E4 escreve esse preço DENTRO da casa, e o número do `jogo`
   diz por quê: em SEIS das dez plantas o custo real diverge 100 % do que
   o olho conta — o herói abre dentro da lama, o passo cai de ~83 casas
   para 27 no primeiro fotograma, e o único sinal era o véu ser menor.

   ISTO AQUI NÃO MEDE A TELA. Mede a única coisa que um refactor pode
   prometer e não provar: **que o conjunto devolvido é byte a byte o de
   antes.** Por isso a busca ANTIGA está escrita aqui, íntegra, e é ela
   o árbitro — uma cópia no teste é a forma honesta de guardar o
   comportamento anterior de uma função que já não existe.

   Corre nas DEZ plantas, na casa de abertura de cada uma, com o passo
   cheio e com o passo gasto. Nada sorteia: duas rodadas dão a mesma
   saída em qualquer máquina. */
sec("E4. custosDe — o mesmo conjunto de sempre, agora com o preço");
{
  /* A BUSCA ANTIGA, copiada de `alcancaveisDe` como ela era antes de E4.
     Não importa nada de `grid.js` a não ser o que era importado lá. */
  const K = (x, y) => `${x},${y}`;
  const livre = (g, x, y, lado, ocupados) => {
    for (let dx = 0; dx < lado; dx++) for (let dy = 0; dy < lado; dy++) {
      const cx = x + dx, cy = y + dy;
      if (cx < 0 || cy < 0 || cx >= g.largura || cy >= g.altura) return false;
      if (g.paredes.has(K(cx, cy))) return false;
      if (ocupados && ocupados.has(K(cx, cy))) return false;
    }
    return true;
  };
  const antiga = (grade, ent, { ocupados = new Set(), deslocamentoM = 9, ignoraDificil = false } = {}) => {
    const g = garantirGrade(grade);
    if (!g || !ent || ent.x == null) return new Set();
    const lado = ladoDe(ent);
    const tetoQ = Math.max(1, m2q(deslocamentoM));
    const custo = new Map([[K(ent.x, ent.y), 0]]);
    let fila = [{ x: ent.x, y: ent.y }];
    while (fila.length) {
      const prox = [];
      for (const at of fila) {
        const cAt = custo.get(K(at.x, at.y));
        for (let ax = -1; ax <= 1; ax++) for (let ay = -1; ay <= 1; ay++) {
          if (!ax && !ay) continue;
          const nx = at.x + ax, ny = at.y + ay, k = K(nx, ny);
          if (custo.has(k)) continue;
          if (!livre(g, nx, ny, lado, ocupados)) continue;
          const c = cAt + ((!ignoraDificil && terrenoDificil(grade, nx, ny)) ? 2 : 1);
          if (c > tetoQ) continue;
          custo.set(k, c);
          prox.push({ x: nx, y: ny });
        }
      }
      fila = prox;
    }
    custo.delete(K(ent.x, ent.y));
    return new Set(custo.keys());
  };

  /* a grade de uma planta pelo nome, com os muros compostos — e sem
     passar por `cenarioDe`, que decide o cenario pelo contexto da cena
     e nao serve para varrer as dez. A composicao e a mesma de
     `montarGrade`, uma linha, e mora aqui porque e do teste. */
  const daPlanta = (nome) => {
    const pl = PLANTAS[nome];
    const paredes = [];
    for (const [x0, y0, x1, y1] of pl.muros || []) {
      for (let x = x0; x <= (x1 ?? x0); x++) for (let y = y0; y <= (y1 ?? y0); y++) paredes.push(K(x, y));
    }
    return { cenario: nome, largura: pl.largura, altura: pl.altura, paredes, estorvos: (pl.estorvos || []).map(([x, y]) => K(x, y)) };
  };

  const nomes = Object.keys(PLANTAS);
  t("as dez plantas continuam dez", nomes.length === 10);

  let divergiram = [], vazias = [], somaDeCasas = 0;
  for (const nome of nomes) {
    const real = daPlanta(nome);
    const heroi = { nome: "Vera", x: Math.floor(real.largura / 2), y: real.altura - 1 };
    for (const passo of [9, 4.5, 1.5]) {
      for (const semDificil of [false, true]) {
        const opc = { deslocamentoM: passo, ignoraDificil: semDificil };
        const nova = alcancaveisDe(real, heroi, opc);
        const velha = antiga(real, heroi, opc);
        const custos = custosDe(real, heroi, opc);
        somaDeCasas += nova.size;
        if (nova.size !== velha.size || [...velha].some((k) => !nova.has(k))) {
          divergiram.push(`${nome}/${passo}${semDificil ? "/voa" : ""}`);
        }
        /* o mapa e o conjunto são a MESMA coisa vista de dois lados */
        if (custos.size !== nova.size || [...nova].some((k) => !custos.has(k))) {
          divergiram.push(`${nome}/${passo} mapa≠conjunto`);
        }
        if (!nova.size) vazias.push(`${nome}/${passo}`);
      }
    }
  }
  t("`alcancaveisDe` devolve o MESMO conjunto da busca de antes, nas dez plantas",
    divergiram.length === 0, divergiram.join(" · "));
  t("e o mapa de custos tem exactamente as mesmas chaves que o conjunto",
    divergiram.length === 0);
  /* catraca verde por vazio é pior que catraca nenhuma: se todas as
     buscas devolvessem zero casas, a igualdade acima seria trivial */
  /* O PISO DESCEU DE 2000 PARA 1500, E O MOTIVO FICA ESCRITO: 2000 era
     um palpite meu antes de correr; a medida são 1739 casas somadas nas
     60 buscas. Um piso acima do medido não protege de nada — falha
     sempre — e um piso colado ao medido quebra no dia em que alguém
     acrescentar uma planta. 1500 é o medido com folga para baixo, que é
     o único lado de onde o perigo vem: o que esta linha existe para
     apanhar é a igualdade TRIVIAL, o dia em que as buscas devolverem
     zero casas e as duas asserções acima passarem por vazio. */
  t(`e a comparação mediu casas de verdade (${somaDeCasas} somadas nas 60 buscas)`,
    somaDeCasas > 1500);

  /* O PREÇO É O QUE O MOTOR COBRA, e não o que o olho conta: 1 quadrado
     por casa, 2 em terreno difícil. Numa planta de chão liso o custo de
     uma casa É o anel de Chebyshev em que ela está — e é isso que faz o
     número parecer decoração nas quatro plantas lisas e ser o ÚNICO
     canal nas seis que cobram. */
  const liso = daPlanta("cidade");   /* 14×14, zero difíceis */
  const h = { nome: "Vera", x: 7, y: 13 };
  const cLiso = custosDe(liso, h, { deslocamentoM: 9 });
  t("em chão liso, a casa ao lado custa 1,5 m", cLiso.get("6,13") === 1.5 && cLiso.get("8,13") === 1.5);
  t("e a diagonal custa o mesmo que a recta — é distância de mesa", cLiso.get("6,12") === 1.5);
  t("o segundo anel custa 3 m", cLiso.get("7,11") === 3);
  t("a casa de quem anda não tem preço: ela não é destino", !cLiso.has("7,13"));

  /* e numa planta que COBRA, a mesma casa custa o dobro */
  const lama = daPlanta("gelo");     /* a última fila é `dificil` */
  const hG = { nome: "Vera", x: 8, y: 15 };
  const cLama = custosDe(lama, hG, { deslocamentoM: 9 });
  t("no chão que cobra, a casa ao lado custa 3 m e não 1,5",
    cLama.get("7,15") === 3, `deu ${cLama.get("7,15")}`);
  t("e quem ignora o terreno difícil paga 1,5 pela mesma casa",
    custosDe(lama, hG, { deslocamentoM: 9, ignoraDificil: true }).get("7,15") === 1.5);
  /* O ERRO DE QUEM CONTA QUADRADOS É SEMPRE UM ANEL — 1,5 m, que é
     exactamente a diferença entre «ao alcance» e «faltam 1,5 m». É por
     isso que o número tem de estar escrito, e não deduzido. */
  t("o passo dentro da lama alcança MENOS casas que em chão liso, com o mesmo passo",
    cLama.size < cLiso.size, `${cLama.size} contra ${cLiso.size}`);
}
console.log(`\n${ok} ok, ${mau} falhas`);
process.exit(mau ? 1 : 0);
