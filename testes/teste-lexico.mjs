/* teste-lexico.mjs (v9.101) — o sétimo gênero.
   O relato: "se eu criar um mundo sobre Solo Leveling, quase não vão falar
   sobre isso; o nosso mundo gerado é genérico". */
import {
  COISAS, SISTEMAS, SEMPRE, TETO_DO_BLOCO, coisaPorId, sistemaPorId,
  garantirLexico, lexicoVale, lerLexico, pedidoDoLexico, lexicoPrompt,
  envelopeDaAdaptacao, falaDoLexico, lexicoDoTexto,
  oficiosDo, povosDo, criaturasDo, cidadesDo, tavernasDo, comoChamam, comoFunciona,
  nomesDo, partesDeCidade, continenteDo,
  TIPOS_DE_LUGAR, AMEACAS, criaturasDaAmeaca, chamadoDoLugar, nomesDeLugar,
} from "../src/lexico.js";
import { pessoaDiversa, elencoDiverso, nomePessoa } from "../src/nomes.js";
import { gerarGeografia } from "../src/geografia.js";
import { genteDoLocal, chefesDoMundo, locaisDaCidade, criaturasDaRegiao } from "../src/mundo-base.js";
import { criaturasDoGenero } from "../src/bestiario.js";
import { PORTAS_DA_CENA, portasAbertas } from "../src/prompt.js";
import { extrairJSON } from "../src/json.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const sec = (t) => console.log(`\n[${t}]`);

/* o mundo do relato, escrito como o Léxico o devolveria */
const CACADORES = lerLexico({
  chamado: { heroi: "caçador", taverna: "sede da guilda", masmorra: "portal", monstro: "besta", faccao: "guilda", moeda: "créditos", magia: "habilidade", relicario: "item de chefe", autoridade: "a Associação" },
  funciona: {
    heroi: "caçadores são civis que sobreviveram a um portal e despertaram; a Associação os registra e classifica, e ninguém mais consegue ferir uma besta.",
    poder: "o despertar vem de uma vez e não se ensina; o que cresce depois é o corpo aguentando mais do mesmo.",
    fama: "a Associação publica a classificação e a imprensa repete; guilda boa recruta pelo que saiu no boletim.",
    ameaca: "bestas que saem de um portal que ninguém fechou a tempo, e o caçador que resolveu não avisar.",
    masmorra: "portais se abrem sozinhos em lugares públicos e não fecham enquanto o chefe lá dentro respirar; quem entra e não vence não sai.",
    combate: "times entram com contrato assinado e ordem de saque combinada antes.",
    morte: "a Associação recolhe o corpo e paga o seguro; o nome sai no boletim da semana.",
    tesouro: "o que se tira de um chefe é avaliado no balcão da Associação e vendido lá mesmo.",
    viagem: "de carro e de trem, e o trânsito é o que atrasa.",
    cidade: "cidades normais com bairros interditados onde um portal abriu.",
    mercado: "lojas de equipamento de caçada, com fila e cadastro.",
    missao: "pedidos chegam pelo aplicativo da Associação, com faixa e pagamento fixados.",
    acampamento: "descansa-se em quartos de guilda ou no chão de uma sala já limpa.",
    grupo: "times se formam por contrato e se desfazem depois do saque.",
    ermo: "a estrada entre cidades é segura; o perigo é sempre dentro de um portal.",
  },
  povos: ["civil", "caçador desperto", "guia", "sobrevivente"],
  oficios: ["caçador rank E", "avaliador de portal", "curandeiro de guilda", "corretor de essência", "repórter", "funcionário da Associação", "vendedor de equipamento", "motorista de resgate"],
  criaturas: [
    { ameaca: "fraco", nomes: ["besta de nível E", "rastejante de fenda", "vermes de portal"] },
    { ameaca: "comum", nomes: ["goblin de portal", "lacaio de fenda", "sombra menor"] },
    { ameaca: "competente", nomes: ["carrasco de fenda", "aranha de portal", "guardião menor"] },
    { ameaca: "elite", nomes: ["cavaleiro de fenda", "besta rank A", "guardião do portal"] },
    { ameaca: "lendario", nomes: ["monarca de fenda", "chefe de portal rank S", "o que veio do outro lado"] },
  ],
  naoExiste: ["reis", "cavalos como transporte", "espadas como norma", "magia acadêmica"],
  cidades: ["Porto Alto", "Vila Nova do Norte", "Setor Leste", "Cidade Baixa", "Ponte Velha", "Bairro Antigo", "Alto da Serra", "Costa Sul"],
  tavernas: ["Sede Central", "Filial do Porto", "Guilda Aurora"],
  lugares: [
    { tipo: "taverna", chamado: "sede da guilda", nomes: ["Guilda Aurora", "Filial do Porto", "Posto 7"] },
    { tipo: "forja", chamado: "loja de equipamento", nomes: ["Ferro & Cia", "Arsenal Kim", "Bancada Leste"] },
    { tipo: "templo", chamado: "hospital de caçadores", nomes: ["Santa Fenda", "Clínica Baek", "Ala Sul"] },
    { tipo: "guilda", chamado: "sede da Associação", nomes: ["Associação Central", "Delegacia de Portais"] },
    { tipo: "inventado", chamado: "isto não existe", nomes: ["A", "B"] },
  ],
  faccoes: [{ nome: "Associação Nacional", quer: "manter o registro e o monopólio da avaliação" }],
  nomes: {
    masc: ["Jin-woo", "Tae-yang", "Min-jun", "Ha-neul", "Seo-jun", "Do-yun", "Kenji", "Ren", "Haruto", "Lucas", "Diego", "Rafael"],
    fem: ["Hae-in", "Ji-woo", "Soo-ah", "Yeon", "Mi-rae", "Sakura", "Yuna", "Aoi", "Marina", "Bianca", "Camila", "Nina"],
    sobrenome: ["Sung", "Cha", "Baek", "Park", "Kim", "Sato", "Nakamura", "Silva", "Costa", "Almeida", "Tanaka", "Oliveira"],
    cidadeA: ["Porto", "Setor", "Bairro", "Alto", "Cidade", "Vila", "Zona", "Ponte", "Costa", "Novo"],
    cidadeB: ["Alto", "Leste", "Baixa", "do Norte", "Velha", "Central", "Sul", "Industrial", "Antigo", "Nova"],
    continente: "a Península de Hanbeom",
  },
  aLei: "portais se abrem sozinhos e só fecham quando o chefe cai; só quem despertou consegue feri-los.",
  comoSeFala: "linguagem urbana e burocrática; 'rank' e 'fenda' são palavras de todo dia, e ninguém diz 'monstro' em público.",
});

sec("1) O ESQUEMA EXISTE E SE FECHA");
{
  ok(COISAS.length >= 10, `${COISAS.length} coisas com nome próprio`);
  ok(COISAS.every((c) => c.id && c.padrao && c.o), "cada coisa tem id, padrão genérico e a pergunta");
  ok(SISTEMAS.length >= 14, `${SISTEMAS.length} sistemas adaptáveis`);
  ok(SISTEMAS.every((s) => s.id && s.rotulo && s.pergunta), "cada sistema tem id, rótulo e pergunta");
  /* a garantia de leitor, do lado da porta: uma adaptação atrás de uma
     porta que não existe nunca entraria no prompt, e nada avisaria */
  const ids = PORTAS_DA_CENA.map((p) => p.id);
  const orfas = SISTEMAS.filter((s) => s.porta && !ids.includes(s.porta));
  ok(orfas.length === 0, `toda adaptação está atrás de uma porta que existe${orfas.length ? ": ÓRFÃS " + orfas.map((x) => x.porta) : ""}`);
  ok(SEMPRE.length >= 2 && SEMPRE.length <= 5, `${SEMPRE.length} adaptações sempre ligadas (as que são do mundo, não da cena)`);
  ok(coisaPorId("masmorra").padrao === "masmorra" && !coisaPorId("nada"), "a busca por id acha e não inventa");
  ok(!!sistemaPorId("masmorra") && !sistemaPorId("nada"), "idem para os sistemas");
}

sec("2) A GARANTIA NÃO DEIXA PASSAR LIXO");
{
  const vazio = garantirLexico(null);
  ok(vazio.gerado === false, "sem nada, o léxico não se diz gerado");
  ok(Object.keys(vazio.chamado).length === 0 && vazio.povos.length === 0, "e vem inteiramente vazio");
  ok(garantirLexico("string").povos.length === 0, "lixo de tipo errado não quebra");
  ok(garantirLexico({ povos: "não é lista" }).povos.length === 0, "campo do tipo errado vira vazio");
  /* o apelido igual ao padrão não é apelido */
  ok(Object.keys(garantirLexico({ chamado: { masmorra: "masmorra" } }).chamado).length === 0,
    "apelido igual ao genérico é descartado — guardá-lo gastaria prompt para dizer que nada mudou");
  ok(garantirLexico({ chamado: { masmorra: "Masmorra" } }).chamado.masmorra === undefined, "e a comparação não se engana com maiúscula");
  /* os tetos mordem */
  const gordo = garantirLexico({
    povos: Array.from({ length: 40 }, (_, i) => `povo${i}`),
    oficios: Array.from({ length: 40 }, (_, i) => `oficio${i}`),
    aLei: "L".repeat(999),
    funciona: { masmorra: "m".repeat(999) },
    chamado: { masmorra: "x".repeat(999) },
  });
  ok(gordo.povos.length <= 8 && gordo.oficios.length <= 16, "as listas são cortadas no teto");
  ok(gordo.aLei.length <= 170 && gordo.funciona.masmorra.length <= 170, "os textos também");
  ok(gordo.chamado.masmorra.length <= 40, "e os apelidos");
  /* duplicata some, vazio some */
  const dup = garantirLexico({ povos: ["a", "a", " a ", "", null, "b"] });
  ok(dup.povos.join(",") === "a,b", "repetido e vazio saem da lista");
  /* campo desconhecido não passa */
  ok(garantirLexico({ chamado: { inventado: "x" } }).chamado.inventado === undefined, "chave que o esquema não conhece é ignorada");
  ok(garantirLexico({ funciona: { inventado: "x" } }).funciona.inventado === undefined, "idem nas adaptações");
}

sec("3) VAZIO QUER DIZER 'USE O SEU'");
{
  /* é a regra que faz o mundo abrir mesmo quando a chamada falha */
  ok(oficiosDo(null) === null && povosDo(null) === null, "sem léxico, os leitores devolvem null");
  ok(criaturasDo(null) === null && cidadesDo(null) === null && tavernasDo(null) === null, "todos eles");
  ok(oficiosDo({ oficios: ["um", "dois"] }) === null, "léxico magro demais também devolve null — dois ofícios não fazem um mundo");
  ok(oficiosDo(CACADORES).length === 8, "e o léxico cheio devolve a lista");
  ok(comoChamam(null, "masmorra") === "masmorra", "sem léxico, a coisa se chama pelo genérico");
  ok(comoChamam(CACADORES, "masmorra") === "portal", "com léxico, pelo nome do mundo");
  ok(comoChamam(CACADORES, "cidade") === "cidade", "e o que não foi renomeado continua com o nome de sempre");
  ok(comoChamam(CACADORES, "inexistente") === "", "coisa que não existe não inventa nome");
  ok(comoFunciona(null, "masmorra") === "", "sem léxico, nenhuma adaptação");
}

sec("4) O POVOAMENTO MUDA DE MUNDO");
{
  /* o coração do relato: o sistema parava de gerar ferreiro e taverneiro */
  const generico = Array.from({ length: 60 }, () => pessoaDiversa("Fantasia medieval").ocupacao);
  const daqui = Array.from({ length: 60 }, () => pessoaDiversa("Fantasia medieval", Math.random, CACADORES).ocupacao);
  ok(generico.some((o) => /ferreiro|taverneiro|escriba/.test(o)), "sem léxico, sai ferreiro e taverneiro — como sempre saiu");
  ok(daqui.every((o) => CACADORES.oficios.includes(o)), "com léxico, TODO ofício sorteado é deste mundo");
  ok(!daqui.some((o) => /ferreiro|taverneiro|escriba/.test(o)), "e nenhum é do banco medieval");
  const racas = Array.from({ length: 60 }, () => pessoaDiversa("Fantasia medieval", Math.random, CACADORES).raca);
  ok(racas.every((r) => CACADORES.povos.includes(r)), "os povos também");
  ok(!racas.some((r) => /elfo|anão|halfling/.test(r)), "nada de elfo num mundo de caçadores");
  /* e o elenco pronto, que é o que o Mestre usa para povoar */
  const elenco = elencoDiverso("Fantasia medieval", 6, CACADORES);
  ok(elenco.length === 6 && elenco.every((p) => CACADORES.oficios.includes(p.ocupacao)), "o elenco pronto é todo deste mundo");
  /* o equilibrio de genero re-sorteia o NOME logo depois, e esse segundo
     sorteio precisa do lexico tanto quanto o primeiro: sem ele o elenco
     saia "Ursa Pe-Leve, motorista de resgate" */
  ok(elenco.every((p) => new Set([...CACADORES.nomes.masc, ...CACADORES.nomes.fem]).has(p.nome.split(" ")[0])),
    "e com os NOMES deste mundo, inclusive depois do reequilibrio de genero");
  ok(elenco.filter((p) => p.genero_pessoa === "mulher").length === 3, "e o equilíbrio de gênero, que é de outra regra, continua de pé");
  /* a rede: um léxico quebrado não pode esvaziar o povoamento */
  const meio = elencoDiverso("Fantasia medieval", 6, { oficios: ["a"], povos: [] });
  ok(meio.every((p) => p.ocupacao && p.raca), "léxico magro cai no banco genérico em vez de gerar gente sem ofício");
}

sec("4b) OS NOMES PRÓPRIOS SÃO DESTE MUNDO");
{
  /* o buraco mais visível da v9.101: "Alaric Punho-de-Pedra, vendedor de
     equipamento de caçada". Nome próprio é o campo mais SEGURO do léxico
     inteiro — nada no sistema consulta "Aldric" para decidir coisa
     nenhuma — e era o mais gritante dos que faltavam. */
  ok(!!nomesDo(CACADORES) && !!partesDeCidade(CACADORES), "o léxico traz os bancos de nome");
  ok(nomesDo(null) === null && partesDeCidade(null) === null, "sem léxico, os bancos são null e o genérico responde");
  /* TUDO OU NADA: meio banco daqui com meio banco medieval poria "Aldric"
     ao lado de "Min-ji" na mesma taverna, que é pior que os dois puros */
  ok(nomesDo({ nomes: { masc: ["a", "b", "c", "d", "e", "f"], fem: [], sobrenome: ["x"] } }) === null,
    "banco pela metade não vale — metade daqui com metade de lá é pior que qualquer um dos dois");
  ok(partesDeCidade({ nomes: { cidadeA: ["a", "b", "c", "d", "e", "f"], cidadeB: [] } }) === null, "idem nas partes de cidade");

  const cem = Array.from({ length: 100 }, () => nomePessoa("Fantasia medieval", undefined, Math.random, CACADORES));
  const daqui = new Set([...CACADORES.nomes.masc, ...CACADORES.nomes.fem]);
  ok(cem.every((x) => daqui.has(String(x).split(" ")[0])), "cem nomes sorteados, todos do banco deste mundo");
  ok(!cem.some((x) => /Aldric|Brannoc|Aelith|Punho-de-Pedra/.test(x)), "e nenhum do banco medieval");
  ok(cem.some((x) => x.split(" ").length > 1), "o sobrenome deste mundo também entra");
  ok(nomePessoa("Fantasia medieval", "fem", Math.random, CACADORES).length > 0, "e o sexo pedido continua sendo respeitado");

  /* A GENTE DA BASE, que é quem o jogador encontra numa cidade */
  const cidade = { nome: "Porto Alto", porte: "cidade", bioma: "costa" };
  const locais = locaisDaCidade("semente-teste", cidade, "Fantasia medieval", null);
  const gente = locais.flatMap((l) => genteDoLocal("semente-teste", l, "Fantasia medieval", null, CACADORES));
  ok(gente.length > 0, `${gente.length} pessoas geradas na base de uma cidade`);
  ok(gente.every((p) => daqui.has(p.nome.split(" ")[0])), "toda a gente da base tem nome deste mundo");
  ok(gente.every((p) => CACADORES.povos.includes(p.raca)), "e povo deste mundo");
  const semLex = locais.flatMap((l) => genteDoLocal("semente-teste", l, "Fantasia medieval", null));
  ok(semLex.every((p) => p.nome && p.raca), "sem léxico, a base continua nascendo inteira — o caminho de sempre");

  /* OS CHEFES */
  const mapa = gerarGeografia("semente-teste|x", null, CACADORES);
  const chefes = chefesDoMundo("semente-teste", mapa, "Fantasia medieval", CACADORES);
  /* só os HUMANOIDES têm nome de gente; o resto são bichos, e bicho se
     chama pelo que é. A asserção certa é "nenhum humanoide tem nome de
     lá", não "algum tem nome daqui" — pode não haver humanoide nenhum. */
  const comNomeDeGente = chefes.filter((c) => /\s/.test(String(c.nome)) || daqui.has(String(c.nome).split(" ")[0]));
  const forasteiros = comNomeDeGente.filter((c) => /Aldric|Brannoc|Aelith|Bryna|Punho-de-Pedra|Cinza-Antiga/.test(String(c.nome)));
  console.log(`  chefes: ${chefes.map((c) => c.nome).join(" · ")}`);
  ok(forasteiros.length === 0, `nenhum chefe com nome do banco medieval (${chefes.length} chefes)`);

  /* AS CIDADES DO MAPA */
  console.log("  cidades: " + mapa.cidades.slice(0, 6).map((c) => c.nome).join(" · "));
  const partes = new Set([...CACADORES.nomes.cidadeA, ...CACADORES.nomes.cidadeB]);
  ok(mapa.cidades.every((c) => c.nome.split(" ").some((w) => partes.has(w)) || /^\S+ \S+/.test(c.nome)),
    "as cidades do mapa saem das partes deste mundo");
  ok(!mapa.cidades.some((c) => /valente|do Rei|das Águias|do Martelo|Brumoso/.test(c.nome)),
    "e nenhuma sai do banco medieval");
  ok(new Set(mapa.cidades.map((c) => c.nome.toLowerCase())).size === mapa.cidades.length, "sem cidades repetidas");
  ok(mapa.continente === CACADORES.nomes.continente, `a terra maior tem o nome do mundo: ${mapa.continente}`);
  /* e sem léxico o mapa continua nascendo como sempre nasceu */
  const generico = gerarGeografia("semente-teste|x", null, null);
  ok(generico.cidades.length > 5, `sem léxico, o mundo continua inteiro (${generico.cidades.length} cidades)`);
  ok(generico.cidades.some((c) => /valente|do Norte|do Vigia|Rasa|Serena|Seco/.test(c.nome)), "e com os nomes de sempre");
  /* A GARANTIA QUE IMPORTA é o determinismo por semente, e não a
     comparação entre um mundo com léxico e outro sem: os bancos de nome
     têm tamanhos diferentes, o laço de tentativas roda um número
     diferente de vezes e o sorteio anda de outro jeito daí para baixo.
     Dois mundos com a MESMA semente e o MESMO léxico têm de ser
     idênticos — isso sim, e é o que o jogo depende. */
  const gemeo = gerarGeografia("semente-teste|x", null, CACADORES);
  ok(JSON.stringify(gemeo.cidades) === JSON.stringify(mapa.cidades), "mesma semente e mesmo léxico: o mesmo mundo, cidade por cidade");
  ok(JSON.stringify(gerarGeografia("semente-teste|x", null, null).cidades) === JSON.stringify(generico.cidades), "e sem léxico, idem");

  /* O NOME QUE MENTE SOBRE O LUGAR continua sendo recusado, venha de onde vier */
  const norte = mapa.cidades.filter((c) => /do Norte/.test(c.nome));
  ok(norte.every((c) => c.y <= 55), `nenhuma "do Norte" ao sul do mapa (${norte.length} testadas)`);
  const sul = mapa.cidades.filter((c) => /\bSul\b/.test(c.nome));
  ok(sul.every((c) => c.y >= 45), `e nenhuma "Sul" ao norte (${sul.length} testadas)`);
  ok(continenteDo(null) === "" && continenteDo(CACADORES) === "a Península de Hanbeom", "o leitor da terra maior");
}

sec("4c) LUGARES E CRIATURAS: O NOME VEM DA FORMA");
{
  /* a mesma regra escrita para o equipamento, aplicada aqui primeiro: o
     TIPO de um local e a AMEACA de um bicho sao mecanicos e nao mudam. O
     que muda e a palavra. */
  ok(TIPOS_DE_LUGAR.length === 12, `${TIPOS_DE_LUGAR.length} tipos de lugar, e sao os do codigo`);
  ok(AMEACAS.length === 5, "cinco degraus de ameaca");
  /* a lista fechada morde: um tipo inventado nao entra */
  ok(!CACADORES.lugares.some((p) => p.tipo === "inventado"), "tipo que o codigo nao conhece e descartado");
  ok(CACADORES.lugares.length === 4, `${CACADORES.lugares.length} lugares validos dos 5 declarados`);
  ok(CACADORES.criaturas.length === 5, "os cinco degraus de ameaca vieram");
  ok(CACADORES.criaturas.every((c) => AMEACAS.includes(c.ameaca)), "e todos com ameaca valida");
  /* ameaca invalida e descartada */
  ok(garantirLexico({ criaturas: [{ ameaca: "aterrorizante", nomes: ["x", "y"] }] }).criaturas.length === 0,
    "degrau de ameaca que nao existe e descartado");
  ok(garantirLexico({ criaturas: ["so um nome solto"] }).criaturas.length === 0,
    "lista solta de nomes nao nomeia bicho nenhum — ela nao sabe qual deles e o fraco");

  /* OS LEITORES */
  ok(chamadoDoLugar(CACADORES, "taverna") === "sede da guilda", "a taverna se chama sede da guilda");
  ok(chamadoDoLugar(CACADORES, "cadeia") === "", "o que o lexico nao nomeou fica sem chamado");
  ok(chamadoDoLugar(null, "taverna") === "", "sem lexico, nenhum chamado");
  ok(nomesDeLugar(CACADORES, "taverna").length === 3, "e tem banco de nomes proprios");
  ok(nomesDeLugar(CACADORES, "cadeia") === null, "tipo sem banco devolve null — e o generico responde");
  ok(criaturasDaAmeaca(CACADORES, "lendario").length === 3, "o degrau lendario tem banco");
  ok(criaturasDaAmeaca(null, "fraco") === null && criaturasDaAmeaca(CACADORES, "inexistente") === null, "e o resto e null");

  /* A CIDADE NASCE COM OS NOMES DAQUI */
  const cid = { nome: "Porto Alto", porte: "capital", bioma: "costa" };
  const semLex = locaisDaCidade("s1", cid, "Fantasia medieval", null);
  const comLex = locaisDaCidade("s1", cid, "Fantasia medieval", null, CACADORES);
  console.log("  sem lexico: " + semLex.map((l) => `${l.tipo}=${l.nome}`).slice(0, 4).join(" · "));
  console.log("  com lexico: " + comLex.map((l) => `${l.tipo}=${l.nome}`).slice(0, 4).join(" · "));
  ok(semLex.length === comLex.length, "o numero de locais nao muda — so o nome");
  ok(semLex.map((l) => l.tipo).join() === comLex.map((l) => l.tipo).join(),
    "e OS TIPOS sao exatamente os mesmos: e por eles que o mercado e procurado e o comodo e desenhado");
  const tav = comLex.find((l) => l.tipo === "taverna");
  ok(tav && CACADORES.lugares[0].nomes.includes(tav.nome), `a taverna se chama ${tav && tav.nome}`);
  ok(tav && tav.chamado === "sede da guilda", "e carrega o chamado deste mundo");
  const cadeia = comLex.find((l) => l.tipo === "cadeia");
  ok(!cadeia || cadeia.nome, "o tipo que o lexico nao nomeou continua tendo nome — o generico responde");

  /* O BICHO NAO MUDA DE FORCA AO MUDAR DE NOME */
  const reg = { nome: "Costa Sul", bioma: "costa" };
  const bSem = criaturasDaRegiao("s2", reg, "Fantasia medieval");
  const bCom = criaturasDaRegiao("s2", reg, "Fantasia medieval", CACADORES);
  console.log("  bichos sem lexico: " + bSem.map((c) => `${c.nome}(${c.ameaca})`).join(" · "));
  console.log("  bichos com lexico: " + bCom.map((c) => `${c.nome}(${c.ameaca})`).join(" · "));
  ok(bSem.length === bCom.length, "o numero de bichos nao muda");
  ok(bSem.map((c) => c.ameaca).join() === bCom.map((c) => c.ameaca).join(), "e as AMEACAS sao as mesmas, uma a uma");
  ok(bSem.map((c) => c.nivel).join() === bCom.map((c) => c.nivel).join(), "e os niveis tambem — a mecanica nao se mexe");
  /* A ASSERCAO QUE IMPORTA: nenhum nome no balde errado */
  const mal = bCom.filter((c) => { const b = criaturasDaAmeaca(CACADORES, c.ameaca); return b && !b.includes(c.nome); });
  ok(mal.length === 0, `nenhum bicho com nome do degrau errado${mal.length ? ": " + mal.map((c) => c.nome).join() : ""}`);
  /* e em escala: cem regioes, nenhuma promessa falsa */
  let errados = 0, total = 0;
  for (let i = 0; i < 100; i++) {
    for (const c of criaturasDaRegiao("semente-" + i, { nome: "R" + i, bioma: "planicie" }, "Fantasia medieval", CACADORES)) {
      total++;
      const b = criaturasDaAmeaca(CACADORES, c.ameaca);
      if (b && !b.includes(c.nome)) errados++;
    }
  }
  ok(errados === 0, `${total} bichos em cem regioes, ${errados} com nome do degrau errado`);
  /* e o degrau que o lexico NAO cobriu cai no bestiario, sem quebrar */
  const meio = lerLexico({ ...CACADORES, criaturas: [{ ameaca: "fraco", nomes: ["a", "b"] }] });
  const bMeio = criaturasDaRegiao("s3", reg, "Fantasia medieval", meio);
  const doBesta = new Set(criaturasDoGenero("Fantasia medieval").map((c) => c.nome));
  ok(bMeio.every((c) => c.ameaca === "fraco" ? ["a", "b"].includes(c.nome) : doBesta.has(c.nome)),
    "lexico com um degrau so: aquele vem daqui, o resto vem do bestiario");

  /* O PROMPT diz como o lugar se chama */
  const b2 = lexicoPrompt(CACADORES, portasAbertas({ emCidade: true }));
  ok(/E OS LUGARES SE CHAMAM/.test(b2), "o prompt ensina o nome dos lugares");
  ok(/taverna = sede da guilda/.test(b2), "com o tipo do sistema de um lado e a palavra do mundo do outro");
  /* com o léxico MÁXIMO (quinze adaptações no teto), o orçamento corta a
     linha de menor prioridade — e a das criaturas é ela, porque o resumo
     do lugar já lista os bichos com o nome que eles têm aqui. O que se
     afirma é a ORDEM, não a presença de tudo. */
  ok(b2.length <= TETO_DO_BLOCO, `e cabe no orçamento (${b2.length})`);
  const iCham = b2.indexOf("COMO AS COISAS SE CHAMAM"), iLug = b2.indexOf("E OS LUGARES SE CHAMAM");
  ok(iCham >= 0 && iLug > iCham, "o vocabulário vem antes dos lugares, e os dois sobrevivem ao corte");
  /* e num mundo de tamanho normal a linha das criaturas cabe */
  const magro = lerLexico({ ...CACADORES, funciona: { heroi: "civis que despertaram." } });
  ok(/O QUE AMEAÇA AS PESSOAS/.test(lexicoPrompt(magro, portasAbertas({ emCidade: true }))),
    "e num mundo de tamanho normal ela cabe");
}

sec("5) O QUE SOBE AO PROMPT, E SÓ QUANDO A CENA PEDE");
{
  ok(lexicoPrompt(null) === "", "sem léxico, bloco nenhum");
  ok(lexicoPrompt(garantirLexico({ povos: ["a", "b"] })) === "", "léxico não gerado também não sobe");
  const naTaverna = lexicoPrompt(CACADORES, portasAbertas({ emCidade: true, temMercado: true }));
  const noPortal = lexicoPrompt(CACADORES, portasAbertas({ emMasmorra: true, emCombate: true }));
  ok(/portal/.test(naTaverna), "o vocabulário entra sempre");
  ok(/A LEI DESTE MUNDO/.test(naTaverna), "a lei do mundo também");
  ok(!/não fecham enquanto o chefe/.test(naTaverna), "mas COMO funciona um portal não custa prompt numa taverna");
  ok(/não fecham enquanto o chefe/.test(noPortal), "e entra no instante em que se está dentro de um");
  /* v9.113: A PRIORIDADE MUDOU, e esta linha muda com ela.

     O que sobe primeiro agora são os campos CURTOS e de VETO: o
     vocabulário, a lei, o que NÃO EXISTE e o nome dos lugares. Os
     parágrafos de "como funciona" vêm depois e cabem se sobrar.

     A troca foi feita jogando: num mundo cujo léxico diz "não há cavalos
     como meio de transporte", o Narrador pôs uma carroça na rua — porque
     `naoExiste` estava atrás de quinze parágrafos e nunca coube. Um veto
     de 150 caracteres impede erro; um parágrafo sobre como a reputação
     circula só melhora o acerto, e o Mestre infere aquilo sozinho. */
  ok(/NÃO EXISTE NESTE MUNDO/.test(naTaverna) && /NÃO EXISTE NESTE MUNDO/.test(noPortal),
    "o VETO do mundo entra em toda cena — é o que impede a carroça");
  ok(/cavalos como transporte/.test(naTaverna), "e diz o que não existe, com todas as letras");
  ok(/E OS LUGARES SE CHAMAM/.test(naTaverna) && /E OS LUGARES SE CHAMAM/.test(noPortal),
    "e o nome dos lugares também: é a palavra que o Narrador vai escrever");
  ok(/O QUE É UM AVENTUREIRO AQUI/.test(naTaverna),
    "as adaptações do MUNDO entram quando sobra espaço");
  ok(/NÃO EXISTE NESTE MUNDO/.test(naTaverna), "e as ausências, que é o que impede o hábito de gênero de voltar");
  /* O ORÇAMENTO: um mundo riquíssimo não pode comer o prompt */
  for (const cena of [{}, { emCidade: true }, { emCombate: true, emMasmorra: true }, { emViagem: true }]) {
    const b = lexicoPrompt(CACADORES, portasAbertas(cena));
    ok(b.length <= TETO_DO_BLOCO, `o bloco cabe no orçamento (${b.length} ≤ ${TETO_DO_BLOCO})`);
  }
  /* e o corte é por PRIORIDADE: o vocabulário nunca é o que cai */
  const enorme = lerLexico({
    ...CACADORES,
    funciona: Object.fromEntries(SISTEMAS.map((s) => [s.id, "z".repeat(170)])),
  });
  const b = lexicoPrompt(enorme, portasAbertas(null));
  ok(b.length <= TETO_DO_BLOCO, `mesmo com TODAS as portas e todas as adaptações no teto (${b.length})`);
  ok(/COMO AS COISAS SE CHAMAM/.test(b), "e o vocabulário sobrevive ao corte — é o que o Mestre precisa se só puder ler uma linha");
}

sec("6) A ADAPTAÇÃO CHEGA NA HORA EM QUE O SISTEMA ABRE");
{
  /* "o mestre deve saber lidar com elas e enviar para o narrador" */
  const env = envelopeDaAdaptacao(CACADORES, "masmorra");
  ok(/^\[NESTE MUNDO — O LUGAR PERIGOSO\]/.test(env), "o envelope se identifica");
  ok(/não fecham enquanto o chefe/.test(env), "e carrega a forma que a coisa tem aqui");
  ok(/números do sistema continuam valendo/.test(env), "dizendo, na mesma frase, que as regras não mudaram");
  ok(envelopeDaAdaptacao(null, "masmorra") === "", "sem léxico, envelope nenhum");
  ok(envelopeDaAdaptacao(CACADORES, "inexistente") === "", "sistema que não existe, idem");
}

sec("7) O PEDIDO PROÍBE O QUE PRECISA PROIBIR");
{
  const p = pedidoDoLexico({ genero: "Fantasia medieval", descricao: "um mundo de caçadores e portais" });
  ok(p.includes("um mundo de caçadores e portais"), "a descrição do jogador vai literal");
  ok(/PALAVRAS, NUNCA NÚMEROS/.test(p), "proíbe número");
  ok(/Não invente habilidade, magia, poder/.test(p), "e proíbe mecânica nova — o catálogo é que manda");
  ok(/NOMES PRÓPRIOS NOVOS/.test(p) && /Nunca use nomes de personagens, lugares ou organizações da obra citada/.test(p),
    "e manda entregar o mundo que a obra evoca, não a obra");
  ok(/MECANISMO, NÃO ADJETIVO/.test(p), "pede o mecanismo, que é o que rende portal-que-não-fecha");
  ok(COISAS.every((c) => p.includes(`"${c.id}"`)), "todas as coisas estão no esquema pedido");
  ok(SISTEMAS.every((s) => p.includes(`"${s.id}"`)), "e todos os sistemas");
  /* sem descrição não pode virar prompt quebrado */
  ok(pedidoDoLexico({}).length > 500 && /não escreveu nada/.test(pedidoDoLexico({})), "mundo sem descrição ainda gera um pedido válido");
  ok(pedidoDoLexico(null).length > 500, "e nem `null` derruba a criação");
}

sec("8) A LEITURA DA RESPOSTA NUNCA DERRUBA A CRIAÇÃO");
{
  ok(lerLexico(null).gerado === false, "resposta nula: léxico vazio, mundo genérico");
  ok(lerLexico("não é json").gerado === false, "resposta que não é objeto: idem");
  ok(lerLexico({}).gerado === false, "objeto vazio: idem");
  ok(lerLexico({ povos: ["a", "b"] }).gerado === false, "resposta magra demais é recusada — melhor genérico coerente que meio léxico");
  ok(CACADORES.gerado === true, "e a resposta cheia passa");
  ok(lexicoVale(CACADORES) && !lexicoVale({}), "a régua do que vale separa os dois");
  /* a prova de fogo: nada aqui pode lançar */
  for (const lixo of [undefined, 0, "", [], { chamado: 5 }, { funciona: [] }, { povos: [{}, []] }, { lugares: [null] }, { faccoes: ["x"] }]) {
    let quebrou = false;
    try { lexicoPrompt(lerLexico(lixo), null); falaDoLexico(lerLexico(lixo)); } catch { quebrou = true; }
    ok(!quebrou, `lixo não derruba: ${JSON.stringify(lixo)}`);
  }
}

sec("8b) O LEITOR DO TEXTO É DO LÉXICO, NÃO DO MESTRE");
{
  /* A PARTIDA DE TESTE PEGOU ISTO. A primeira versão passava a resposta
     pelo `extrairJSON` do jogo, que é o leitor de JSON da casa e parecia o
     caminho óbvio. Só que ele termina em `sanearResposta`, que devolve
     exatamente os campos da NARRAÇÃO e descarta o resto: o léxico chegava
     inteiro do modelo e era jogado fora em silêncio. A criação não
     quebrava, nada avisava, e o mundo saía genérico exatamente como antes
     — que é o caminho de falha previsto do léxico, e por isso o bug não
     deixava rastro nenhum. */
  const cru = JSON.stringify({ chamado: { masmorra: "portal" }, povos: ["civil"], aLei: "portais se abrem sozinhos." });
  const peloDoMestre = extrairJSON(cru);
  ok(peloDoMestre.chamado === undefined && peloDoMestre.aLei === undefined,
    "o leitor do Mestre DESCARTA o léxico — e é assim que ele tem de ser, para o contrato dele");
  const pelaCasa = lexicoDoTexto(cru);
  ok(pelaCasa && pelaCasa.chamado.masmorra === "portal" && pelaCasa.aLei, "o leitor do léxico traz tudo");

  /* e ele aguenta o que modelo costuma devolver */
  ok(lexicoDoTexto("```json\n" + cru + "\n```").povos[0] === "civil", "cerca de código não atrapalha");
  ok(lexicoDoTexto("Claro! Aqui está:\n" + cru + "\nEspero ter ajudado.").povos[0] === "civil", "conversa em volta do JSON também não");
  ok(lexicoDoTexto('{"povos":["a","b",],}') !== null, "vírgula sobrando — o erro mais comum de modelo — é consertado");
  ok(lexicoDoTexto("") === null && lexicoDoTexto(null) === null, "vazio devolve null");
  ok(lexicoDoTexto("desculpe, não posso") === null, "texto sem JSON nenhum devolve null");
  ok(lexicoDoTexto("{isto não é json de jeito nenhum}") === null, "JSON irrecuperável devolve null");
  /* e o caminho inteiro, do texto do modelo ao lexico valido */
  ok(lerLexico(lexicoDoTexto(JSON.stringify({
    chamado: Object.fromEntries(COISAS.map((c) => [c.id, "x" + c.id])),
    funciona: Object.fromEntries(SISTEMAS.map((x) => [x.id, "assim: " + x.id])),
    povos: ["a", "b", "c"], oficios: ["a", "b", "c", "d"], aLei: "a lei.",
  }))).gerado === true, "e o caminho inteiro, do texto do modelo ao léxico válido");
}

sec("9) A LINHA DA MESA");
{
  ok(falaDoLexico(null) === "", "sem léxico, a mesa não fala do sistema");
  const f = falaDoLexico(CACADORES);
  ok(f.includes(CACADORES.aLei), `a mesa vê a lei deste lugar: "${f}"`);
  /* e sem lei, ela ainda diz alguma coisa do mundo */
  const semLei = lerLexico({ ...CACADORES, aLei: "" });
  ok(/portal/.test(falaDoLexico(semLei)), `sem lei, cai no vocabulário: "${falaDoLexico(semLei)}"`);
  ok(!/[0-9]/.test(f), "e nenhum número: contagem é coisa do sistema, e o sistema não fala de si");
  ok(!/léxico|prompt|sistema|IA|JSON/i.test(f), "e ela fala do MUNDO, não do sistema que o produziu");
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\ntudo verde");
process.exit(falhas ? 1 : 0);
