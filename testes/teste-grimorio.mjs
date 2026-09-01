import {
  MAGIAS, FORMAS, formaDef, magiaPorNome, ehMagiaDoGrimorio, magiasDisponiveis, classesDaMagia,
  nivelDoCirculo, custoDoCirculo, zonasCobertas, geometriaDe, ehArea, zonasAtingidas, alvosDaArea,
  fichaDaMagiaTexto, resumoGrimorioPrompt, METROS_POR_ZONA, resolverPortal, envelopeDoPortal,
  PERGUNTAS_AOS_MORTOS, abrirInterrogatorio, perguntarAoMorto, envelopeDoMorto, textoDeIdentificacao, localizarNoMapa, resolvidaPeloSistema,
} from "../src/grimorio.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[1. O CATÁLOGO]");
console.log(`  ${MAGIAS.length} magias, círculos ${Math.min(...MAGIAS.map((m) => m.circulo))}–${Math.max(...MAGIAS.map((m) => m.circulo))}`);
ok(MAGIAS.length >= 80, "o repertório clássico está lá");
ok(new Set(MAGIAS.map((m) => m.nome)).size === MAGIAS.length, "nenhum nome repetido — nome é a chave de tudo aqui");
ok(MAGIAS.every((m) => m.classes.length && FORMAS[m.forma]), "toda magia tem dono e forma válida");
ok(MAGIAS.every((m) => m.custo > 0 && m.nivel >= 1), "e custo e nível vindos da tabela do círculo, nunca soltos");
for (let c = 1; c <= 9; c++) ok(MAGIAS.some((m) => m.circulo === c), `círculo ${c} povoado`);
ok(magiaPorNome("bola de fogo") && magiaPorNome("BOLA DE FOGO"), "busca por nome ignora caixa e acento");
ok(!ehMagiaDoGrimorio("Golpe Poderoso"), "habilidade de classe não é magia do grimório");

console.log("\n[2. O CÍRCULO MANDA NO PREÇO]");
ok(nivelDoCirculo(1) === 1 && nivelDoCirculo(5) === 9 && nivelDoCirculo(9) === 17, "a progressão de nível é a da mesa");
ok(custoDoCirculo(9) > custoDoCirculo(5) && custoDoCirculo(5) > custoDoCirculo(1), "e o custo sobe junto");
ok(magiaPorNome("Chuva de Meteoros").nivel === 17, "Chuva de Meteoros só no nível 17 — não é magia de aventureiro novo");
ok(magiaPorNome("Chuva de Meteoros").custo === custoDoCirculo(9), "e custa o preço do 9º círculo");

console.log("\n[3. QUEM PODE APRENDER]");
const mago5 = magiasDisponiveis("Mago", 5, []);
ok(mago5.length && mago5.every((m) => m.classes.includes("Mago") && m.nivel <= 5), "mago de nível 5 vê só o que é dele e cabe no nível");
ok(!magiasDisponiveis("Mago", 5).some((m) => m.nome === "Chuva de Meteoros"), "e não vê o 9º círculo");
ok(magiasDisponiveis("Guerreiro", 20).length === 0, "guerreiro não abre grimório");
ok(!magiasDisponiveis("Mago", 20, [{ nome: "Bola de Fogo" }]).some((m) => m.nome === "Bola de Fogo"), "o que já está na ficha some da lista");
ok(classesDaMagia("Curar Ferimentos").includes("Clérigo"), "cura é de clérigo");

console.log("\n[4. A RÉGUA METRO→ZONA]");
ok(zonasCobertas(3) === 1 && zonasCobertas(METROS_POR_ZONA / 2) === 1, "efeito pequeno fica na zona onde caiu");
ok(zonasCobertas(6) === 1 && zonasCobertas(18) === 2, "6 m é local; 18 m alcança a zona vizinha");
ok(zonasCobertas(300) === 99 && zonasCobertas(1600) === 99, "centenas de metros são o campo inteiro");
ok(zonasCobertas(30) === 2 || zonasCobertas(30) === 3, "30 m fica na faixa do meio, como deve");

console.log("\n[5. A GEOMETRIA]");
const bf = geometriaDe({ nome: "Bola de Fogo" });
ok(bf.forma === "esfera" && bf.raio === 6 && bf.doCatalogo, "magia catalogada devolve a forma declarada");
ok(geometriaDe({ nome: "Relâmpago" }).forma === "linha", "Relâmpago é linha");
ok(geometriaDe({ nome: "Cone de Frio" }).forma === "cone", "Cone de Frio é cone");
ok(geometriaDe({ nome: "Mísseis Mágicos" }).forma === "alvo", "e míssil mágico continua sendo alvo único");
/* as 148 antigas: a forma sai do texto, como o elemento já saía */
ok(geometriaDe({ nome: "Sopro Ancestral", descricao: "causa dano em área em linha" }).forma === "linha", "habilidade antiga com 'linha' na descrição vira linha");
ok(geometriaDe({ nome: "Golpe Giratório", descricao: "Atinge todos os inimigos ao redor." }).forma === "esfera", "'todos ao redor' vira área — sem etiquetar 148 habilidades à mão");
ok(geometriaDe({ nome: "Golpe Poderoso", descricao: "Um golpe carregado que causa dano extra." }).forma === "alvo", "e o que não fala de área continua alvo único");
ok(ehArea({ nome: "Bola de Fogo" }) && !ehArea({ nome: "Golpe Poderoso" }), "ehArea separa os dois mundos");

console.log("\n[6. AS ZONAS ATINGIDAS]");
const z = (hab, o) => zonasAtingidas(geometriaDe(hab), o);
ok(JSON.stringify(z({ nome: "Mísseis Mágicos" }, { zonaHeroi: 0, zonaAlvo: 2 })) === "[2]", "alvo único: só a zona do alvo");
ok(JSON.stringify(z({ nome: "Bola de Fogo" }, { zonaHeroi: 0, zonaAlvo: 1 })) === "[1]", "esfera de 6 m cai na zona do alvo e fica nela");
const terremoto = z({ nome: "Terremoto" }, { zonaHeroi: 0, zonaAlvo: 1 });
ok(terremoto.length === 3, "Terremoto (30 m) engole o campo inteiro");
const meteoros = z({ nome: "Chuva de Meteoros" }, { zonaHeroi: 0, zonaAlvo: 2 });
ok(meteoros.length === 3, "Chuva de Meteoros também — 1,6 km de alcance não deixa canto de fora");
const cone = z({ nome: "Cone de Frio" }, { zonaHeroi: 0, zonaAlvo: 2 });
ok(cone[0] === 0 && cone.length > 1, "o cone SAI DE VOCÊ na direção do alvo, não cai no alvo");
const linha = z({ nome: "Relâmpago" }, { zonaHeroi: 2, zonaAlvo: 0 });
ok(linha[0] === 2 && linha.includes(1), "e a linha atravessa para trás quando o alvo está atrás");
ok(z({ nome: "Escudo Arcano" }, { zonaHeroi: 1, zonaAlvo: 2 })[0] === 1, "magia pessoal fica em você, não vai ao alvo");

console.log("\n[7. QUEM APANHA — inclusive os seus]");
const inim = [
  { nome: "Bandido 1", vida: 20, vidaMax: 20, zona: 1 },
  { nome: "Bandido 2", vida: 20, vidaMax: 20, zona: 1 },
  { nome: "Arqueiro", vida: 10, vidaMax: 10, zona: 2 },
  { nome: "Morto", vida: 0, vidaMax: 10, derrotado: true, zona: 1 },
];
const grupo = [{ nome: "Brisa", vida: 30, vidaMax: 30, zona: 1 }, { nome: "Kael", vida: 30, vidaMax: 30, zona: 0 }];
const rBF = alvosDaArea({ hab: { nome: "Bola de Fogo" }, zonaHeroi: 0, zonaAlvo: 1, inimigos: inim, aliados: grupo });
console.log(`  Bola de Fogo na zona 1: ${rBF.inimigos.map((e) => e.nome).join(", ")} + aliados ${rBF.aliados.map((a) => a.nome).join(", ") || "nenhum"}`);
ok(rBF.inimigos.length === 2, "pega os dois inimigos da zona");
ok(!rBF.inimigos.some((e) => e.nome === "Morto"), "e não 'acerta' quem já caiu");
ok(!rBF.inimigos.some((e) => e.nome === "Arqueiro"), "quem está fora da esfera escapa");
ok(rBF.aliados.length === 1 && rBF.aliados[0].nome === "Brisa",
   "A DECISÃO QUE FALTAVA: o companheiro que estava lá apanha junto");
ok(!rBF.aliados.some((a) => a.nome === "Kael"), "e o que estava noutra zona, não");
const rAlvo = alvosDaArea({ hab: { nome: "Mísseis Mágicos" }, zonaHeroi: 0, zonaAlvo: 1, inimigos: inim, aliados: grupo });
ok(rAlvo.inimigos.length === 1 && rAlvo.aliados.length === 0, "alvo único nunca pega aliado — não existe fogo amigo de dardo mirado");
const rTerra = alvosDaArea({ hab: { nome: "Terremoto" }, zonaHeroi: 0, zonaAlvo: 2, inimigos: inim, aliados: grupo });
ok(rTerra.inimigos.length === 3 && rTerra.aliados.length === 2, "Terremoto pega todo mundo vivo, dos dois lados");
const rAura = alvosDaArea({ hab: { nome: "Bênção" }, zonaHeroi: 0, zonaAlvo: 2, inimigos: inim, aliados: grupo });
ok(rAura.aliados.length === 0, "o que é feito para aliados não os lista como vítimas");

console.log("\n[8. O QUE O MESTRE LÊ]");
const ft = fichaDaMagiaTexto(magiaPorNome("Chuva de Meteoros"));
console.log("  " + ft.slice(0, 130));
ok(/1\.6 km|1,6 km/.test(ft), "distância grande sai em km, não em 1600 m");
ok(/esfera 12 m/.test(ft), "e a forma vem com o tamanho");
ok(resumoGrimorioPrompt({ habilidades: [] }) === "", "sem magia catalogada, nada vai ao prompt");
const rp = resumoGrimorioPrompt({ habilidades: [{ nome: "Bola de Fogo" }, { nome: "Voo" }] });
ok(/Bola de Fogo/.test(rp) && /Voo/.test(rp), "com magias, elas vão com ficha completa");
ok(/inclusive os meus companheiros/.test(rp), "e o Mestre é avisado de que a lista de atingidos já vem pronta");
ok(/não acrescente atingido/.test(rp), "com a proibição de mexer nela");

console.log("\n[9. AS FUNÇÕES QUE O CÓDIGO ENTENDE]");
const comFuncao = MAGIAS.filter((m) => m.funcao);
console.log("  " + [...new Set(comFuncao.map((m) => m.funcao))].join(", "));
ok(MAGIAS.some((m) => m.funcao === "portal"), "existe magia de portal — é ela que pula a viagem");
ok(magiaPorNome("Teleporte").funcao === "portal" && magiaPorNome("Teleporte").nivel >= 13,
   "e o Teleporte é de nível alto: pular a estrada é prêmio de quem ficou forte");
ok(magiaPorNome("Falar com os Mortos").funcao === "consulta_mortos", "falar com os mortos é função, não adjetivo");
ok(/CINCO perguntas/.test(magiaPorNome("Falar com os Mortos").descricao), "com a regra da mesa escrita na ficha");
ok(MAGIAS.filter((m) => m.ritual).length >= 5, "e há rituais de sobra para o mago paciente");

console.log("\n[10. O PORTAL — pular a estrada é prêmio, não atalho]");
const cidades = [
  { nome: "Aldoria", relacao: "jogador", faccao: "Guilda do Corvo", descoberta: true },
  { nome: "Rio do Sul", relacao: "neutra", descoberta: true },
  { nome: "Porto Rasa", relacao: "neutra", descoberta: true },
  { nome: "Cidade Oculta", relacao: "neutra", descoberta: false },
];
const circ = magiaPorNome("Círculo de Teleporte");
const tele = magiaPorNome("Teleporte");
const verd = magiaPorNome("Portal Verdadeiro");
const base = { cidades, cidadeAtual: "Rio do Sul", faccaoJogador: "Guilda do Corvo" };
ok(!resolverPortal({ magia: magiaPorNome("Bola de Fogo"), destino: "Aldoria", ...base }).ok, "magia que não é portal não abre passagem");
ok(!resolverPortal({ magia: tele, destino: "Cidade Oculta", ...base }).ok,
   "não se teleporta para o que a névoa ainda esconde — senão o mapa entregava o mundo de graça");
ok(!resolverPortal({ magia: tele, destino: "Rio do Sul", ...base }).ok, "nem para onde você já está");
ok(!resolverPortal({ magia: tele, destino: "", ...base }).ok, "sem destino, não há passagem");
ok(resolverPortal({ magia: circ, destino: "Aldoria", ...base }).ok, "o círculo de 5º liga terra da SUA facção");
const negado = resolverPortal({ magia: circ, destino: "Porto Rasa", ...base });
ok(!negado.ok && /não é sua/.test(negado.motivo), "e recusa terra que não é sua — quem não governa nada não tem para onde ir");
ok(resolverPortal({ magia: tele, destino: "Porto Rasa", ...base, rnd: () => 0.9 }).ok, "o Teleporte de 7º vai a qualquer lugar conhecido");
const errou = resolverPortal({ magia: tele, destino: "Porto Rasa", ...base, rnd: () => 0.01 });
ok(errou.ok && errou.percalco && errou.destino !== "Porto Rasa", "e às vezes erra o alvo, como na mesa — mas chega em algum lugar");
ok(errou.horas > 0, "o erro custa tempo");
let semFalha = true;
for (let i = 0; i < 50; i++) if (resolverPortal({ magia: verd, destino: "Porto Rasa", ...base, rnd: () => 0.001 }).percalco) semFalha = false;
ok(semFalha, "Portal Verdadeiro nunca erra — é para isso que ele custa dois círculos a mais");
const envP = envelopeDoPortal(tele, "Rio do Sul", "Porto Rasa", null);
ok(/a viagem NÃO aconteceu/.test(envP), "o envelope diz que a estrada foi pulada");
ok(/estou em Porto Rasa agora/.test(envP), "e onde o herói está agora");
ok(/sem desfazer o resultado/.test(envelopeDoPortal(tele, "a", "b", "a passagem torceu")), "o percalço é narrado, não desfeito");

console.log("\n[11. AS FUNÇÕES QUE O SISTEMA EXECUTA]");
ok(resolvidaPeloSistema(magiaPorNome("Identificar")), "identificar é do código");
ok(!resolvidaPeloSistema(magiaPorNome("Desejo")), "desejo continua sendo ficção — o código não confere 'a realidade obedece'");

console.log("\n  · falar com os mortos");
let ses = abrirInterrogatorio("Yorick", 12);
ok(ses.restam === PERGUNTAS_AOS_MORTOS && PERGUNTAS_AOS_MORTOS === 5, "abre com cinco perguntas");
const p1m = perguntarAoMorto(ses, "quem te matou?");
ok(p1m.ok && p1m.restam === 4, "cada pergunta desconta uma");
ok(!perguntarAoMorto(ses, "ok").ok, "pergunta vazia não conta como pergunta");
let s2 = ses;
for (let i = 0; i < 5; i++) s2 = perguntarAoMorto(s2, `pergunta numero ${i}`).sessao;
const esgotado = perguntarAoMorto(s2, "mais uma, vai");
ok(!esgotado.ok && /cinco perguntas/.test(esgotado.motivo),
   "na sexta o cadáver cala — sem contador, 'cinco perguntas' virava conversa livre");
const envM = envelopeDoMorto(p1m.sessao, "quem te matou?");
ok(/SÓ o que sabia EM VIDA/.test(envM), "e a regra da mesa vai junto: ele não sabe o que houve depois de morrer");
ok(/não é obrigado a ser prestativo/.test(envM), "nem é obrigado a colaborar");
ok(/Restam 4 pergunta/.test(envM), "o Mestre sabe quantas faltam, mas quem conta é o sistema");

console.log("\n  · identificar");
const txtId = textoDeIdentificacao({ nome: "Lâmina Ígnea", raridade: "raro", tipo: "arma", atributos: { forca: 2 }, poder: "queima quem toca" });
console.log("  " + txtId);
ok(/Lâmina Ígnea/.test(txtId) && /forca \+2/.test(txtId) && /queima/.test(txtId), "a ficha do objeto sai inteira — ela já estava no save, só não aparecia");
ok(textoDeIdentificacao(null) === null, "sem item, nada");

console.log("\n  · localizar objeto");
const mapaLoc = { cidades: [ { nome: "Pedravale", x: 20, y: 30, descoberta: true }, { nome: "Rio do Sul", x: 60, y: 70, descoberta: true } ] };
const loc = localizarNoMapa("Rio do Sul", { cidades: mapaLoc.cidades, cidadeAtual: "Pedravale", alcanceM: 300 });
console.log(`  ${loc.alvo}: ${loc.direcao}, ~${loc.km} km · dentro do alcance: ${loc.dentroDoAlcance}`);
ok(loc.achou && loc.km > 0 && loc.direcao, "direção e distância saem do mapa, não do palpite");
ok(!loc.dentroDoAlcance, "e o alcance da magia é lei — o que está longe demais fica fora");
ok(!localizarNoMapa("Nárnia", { cidades: mapaLoc.cidades, cidadeAtual: "Pedravale" }).achou, "não localiza o que não existe no mundo");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
