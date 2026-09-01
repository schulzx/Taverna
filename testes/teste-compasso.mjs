/* teste-compasso.mjs (v9.91) — a fórmula que impede os dois desastres.

   "Assim a história nunca fica chata demais com muito tempo sem ação e
   batalhas, nem caótica demais com batalhas o tempo todo sem tempo pra
   descanso e diálogos."

   As duas metades da promessa são medidas aqui, e medidas do jeito que
   contam: rodando a onda por centenas de turnos e olhando a curva. Uma
   tabela que parece certa e produz uma campanha monótona é uma tabela
   errada, e só a simulação diz qual das duas ela é. */
import {
  MOVIMENTOS, ASSUNTOS, FAMILIAS, NAO_REPETIR_ASSUNTO, NAO_REPETIR_FAMILIA,
  movimentoPorId, movimentoPorOrdem, assuntoPorId, familiaPorId,
  garantirCompasso, avancarCompasso, escolherAssunto, envelopeDoCompasso,
  resumoCompasso, linhaDoCompasso, barraDoCompasso, TOM_DA_TENSAO,
} from "../src/compasso.js";
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const SIT = {
  emCidade: true, pessoaNaCena: true, momento: 0.5, temperatura: "morna",
  nivel: 7, fama: 40, temGrupo: true, temGenteConhecida: true, temPassado: true,
  temLugarVisitado: true, temObjetos: true, temFalaAnterior: true, ordemDaFase: 2,
};

/* roda a onda por N turnos e devolve o histórico */
const rodar = (n, sit = SIT, opts = {}) => {
  let c = garantirCompasso(null);
  const linha = [];
  let i = 0;
  for (let k = 0; k < n; k++) {
    const r = avancarCompasso(c, sit, { sorte: () => ((i++ * 0.0173 + i * i * 0.00041) % 1), ...opts });
    c = r.compasso;
    linha.push({ mov: c.movimento, virou: r.virou, assunto: c.assunto, env: envelopeDoCompasso(r) });
  }
  return { compasso: c, linha };
};

sec("1. A ONDA É FIXA — é ela a fórmula");
{
  t("são seis movimentos", MOVIMENTOS.length === 6);
  t("na ordem certa", MOVIMENTOS.map((m) => m.id).join(">") === "respiro>semente>subida>vespera>climax>preco");
  t("cada um diz o que é e por que existe", MOVIMENTOS.every((m) => m.id && m.nome && m.diz && m.porque));
  t("a ordem declarada bate com a posição", MOVIMENTOS.every((m, i) => m.ordem === i));
  /* a tensão sobe até o clímax e cai depois: é a curva inteira em quatro
     números, e se ela não subir monotonicamente a onda não é uma onda */
  const ate = MOVIMENTOS.slice(0, 5).map((m) => m.tensao);
  t("a tensão sobe até o clímax", ate.every((v, i) => i === 0 || v > ate[i - 1]));
  t("e cai no preço", MOVIMENTOS[5].tensao < MOVIMENTOS[4].tensao);
  /* a VÉSPERA dura exatamente um turno: é a última chance de escolher como
     encarar o que vem, e esticá-la a transformaria em mais uma subida */
  t("a véspera dura um turno só", movimentoPorId("vespera").dura[0] === 1 && movimentoPorId("vespera").dura[1] === 1);
  /* o RESPIRO é mudo: mandar "agora descanse" é o sistema atrapalhando
     exatamente o movimento que existe para ele calar */
  t("o respiro não fala", movimentoPorId("respiro").fala === false);
  t("e os cinco outros falam", MOVIMENTOS.filter((m) => m.fala).length === 5);
  t("movimentoPorOrdem não sai da faixa", movimentoPorOrdem(99).id === "preco" && movimentoPorOrdem(-5).id === "respiro");
}

sec("2. OS ASSUNTOS — o que é sorteado dentro dela");
{
  t(`há assuntos de verdade (${ASSUNTOS.length})`, ASSUNTOS.length >= 30);
  const ids = ASSUNTOS.map((a) => a.id);
  t("nenhum id repetido", new Set(ids).size === ids.length);
  /* dois ids com acento já escaparam nesta casa (`ciume_de_ofício`,
     `caçada`), e um id fora do padrão é armadilha para toda varredura */
  const tortos = ids.filter((x) => !/^[a-z][a-z0-9_]*$/.test(x));
  t(`todo id é ascii minúsculo${tortos.length ? " — " + tortos.join(", ") : ""}`, tortos.length === 0);
  t("todo assunto aponta para uma família que existe", ASSUNTOS.every((a) => familiaPorId(a.familia)));
  /* OS CINCO TEMPOS: sem qualquer um deles a onda tem um buraco, e o
     buraco cai justamente no turno em que o Mestre mais precisa de apoio */
  const completos = ASSUNTOS.filter((a) => a.nome && a.preparo && a.subindo && a.vespera && a.agora && a.depois);
  t(`todos têm os cinco tempos (${completos.length}/${ASSUNTOS.length})`, completos.length === ASSUNTOS.length);
  t("assuntoPorId acha e não inventa", !!assuntoPorId(ids[0]) && assuntoPorId("nao_existe") === null);

  /* o PREPARO é o pedido inteiro: "comece a preparar uma briga" */
  const preparam = ASSUNTOS.filter((a) => /^Comece a preparar/i.test(a.preparo));
  t(`todo preparo começa mandando preparar (${preparam.length})`, preparam.length === ASSUNTOS.length);
  const acontecem = ASSUNTOS.filter((a) => /^Agora ACONTECE/.test(a.agora));
  t(`e todo clímax começa mandando acontecer (${acontecem.length})`, acontecem.length === ASSUNTOS.length);

  /* as seis famílias têm repertório: uma família com dois assuntos vira
     repetição obrigatória assim que a onda a escolhe duas vezes */
  const conta = {};
  for (const a of ASSUNTOS) conta[a.familia] = (conta[a.familia] || 0) + 1;
  t("as seis famílias têm ao menos quatro assuntos", FAMILIAS.every((f) => (conta[f.id] || 0) >= 4));
  const maior = Math.max(...Object.values(conta));
  t(`nenhuma família domina (maior: ${maior} de ${ASSUNTOS.length})`, maior < ASSUNTOS.length * 0.35);

  /* NENHUM assunto manda a IA mexer no que é do sistema */
  const invade = ASSUNTOS.filter((a) => {
    const txt = a.preparo + a.subindo + a.vespera + a.agora + a.depois;
    /* IMPERATIVOS, e com FRONTEIRA de palavra. Sem \b, "role" casa dentro
       de "controle" (em "passa do controle") e "moeda" casa numa frase
       narrativa ("o que virou moeda") — a primeira versao deste teste
       reprovava dois assuntos CORRETOS por isso. E a segunda versao foi
       pior: o \b virou um backspace literal na hora de escrever o arquivo,
       a regex parou de casar qualquer coisa, e a assercao passou por estar
       VAZIA. Uma assercao vazia e pior que uma que falha. */
    /* "cobre" saiu da lista por ser HOMOGRAFO: e imperativo de "cobrar" e
       tambem terceira pessoa de "cobrir" ("a hospitalidade cobre", "a regra
       nao cobre esse caso"). Duas entradas corretas foram reprovadas por
       isso. O risco real — mandar a IA cobrar do jogador — pega-se pelo
       OBJETO, e o envelope do preco ja proibe a coisa por escrito. */
    return /\bcobre (me |de mim|moeda|PV|PM|\d)/i.test(txt)
      || /\b(role|rolem|adicione|remova|aplique)\b/i.test(txt)
      || /\b(d20|PV|PM)\b/.test(txt)
      || /abra (o )?combate/i.test(txt);
  });
  t(`nenhum assunto mexe na ficha${invade.length ? " — " + invade.map((a) => a.id).join(", ") : ""}`, invade.length === 0);
}

sec("3. A ESCOLHA DO ASSUNTO");
{
  const a = escolherAssunto(SIT, { sorte: () => 0.5 });
  t("devolve um assunto", !!a && !!a.id);
  /* cenas em que quase nada cabe ainda devolvem alguma coisa, senão a onda
     nunca germina e a campanha volta a não ter ritmo */
  for (const [rot, sit] of [
    ["cidade, nível 1, sem vilão", { emCidade: true, nivel: 1, ordemDaFase: -1 }],
    ["estrada", { emViagem: true, momento: 0.3 }],
    ["masmorra", { emMasmorra: true, momento: 0.5 }],
    ["campanha recém-nascida", { emCidade: true, momento: 0, temGenteConhecida: false, temPassado: false, temLugarVisitado: false }],
  ]) t(`${rot}: há assunto`, !!escolherAssunto(sit, { sorte: () => 0.5 }));

  /* a trava de memória: um assunto que exige histórico e o encontra vazio
     manda a IA inventar a lembrança — a mesma regra da estante */
  const semGente = { emCidade: true, pessoaNaCena: true, momento: 0.5, temGenteConhecida: false };
  const abertos = ASSUNTOS.filter((x) => (!x.quando || x.quando(semGente)));
  const exigem = abertos.filter((x) => x.precisa === "gente");
  t("há assuntos que exigem gente conhecida", exigem.length > 0);
  let saiuProibido = false;
  for (let i = 0; i < 200; i++) {
    const r = escolherAssunto(semGente, { sorte: () => (i * 0.0173) % 1 });
    if (r && r.precisa === "gente") saiuProibido = true;
  }
  t("e nenhum deles sai sem gente registrada", !saiuProibido);
}

sec("4. NEM MONÓTONA, NEM CAÓTICA — a promessa, medida");
{
  const { linha } = rodar(600);
  const climaxes = linha.filter((x) => x.virou && x.mov === "climax").length;
  const respiros = linha.filter((x) => x.mov === "respiro").length;
  t(`houve clímax de sobra em 600 turnos (${climaxes})`, climaxes >= 40);
  t(`e respiro de sobra (${respiros} turnos)`, respiros >= 100);

  /* A METADE "NEM CAÓTICA": dois clímaxes nunca se encostam. Entre eles há
     sempre, no mínimo, o preço e o respiro — que são os dois movimentos
     que uma campanha apressada corta primeiro. */
  const idx = linha.map((x, i) => (x.virou && x.mov === "climax" ? i : -1)).filter((i) => i >= 0);
  const vaos = idx.slice(1).map((v, i) => v - idx[i]);
  t(`nenhum clímax colado no anterior (menor vão: ${Math.min(...vaos)})`, Math.min(...vaos) >= 6);

  /* A METADE "NEM MONÓTONA": nunca se passa muito tempo sem acontecer
     nada. O maior vão entre clímaxes é o número que mede o tédio. */
  t(`e nenhum vão longo demais (maior: ${Math.max(...vaos)})`, Math.max(...vaos) <= 16);

  /* E TODO CLÍMAX FOI ANUNCIADO. É o pedido inteiro: o sistema avisa cedo,
     o Mestre prepara, e a coisa parece que vinha desde sempre. */
  let semSemente = 0, semVespera = 0;
  for (const i of idx) {
    const tras = linha.slice(Math.max(0, i - 12), i);
    if (!tras.some((x) => x.virou && x.mov === "semente")) semSemente++;
    if (!tras.some((x) => x.virou && x.mov === "vespera")) semVespera++;
  }
  t(`todo clímax teve semente antes (${idx.length - semSemente}/${idx.length})`, semSemente === 0);
  t(`e todo clímax teve véspera antes (${idx.length - semVespera}/${idx.length})`, semVespera === 0);

  /* e o assunto do clímax é o MESMO que foi semeado: se ele trocasse no
     meio, o preparo teria preparado outra coisa */
  let trocou = 0;
  for (const i of idx) {
    const sem = linha.slice(0, i).filter((x) => x.virou && x.mov === "semente").pop();
    if (!sem || sem.assunto !== linha[i].assunto) trocou++;
  }
  t(`o assunto do clímax é o que foi semeado (${idx.length - trocou}/${idx.length})`, trocou === 0);

  /* VARIEDADE: uma onda que sorteia sempre os mesmos três assuntos cumpre
     o ritmo e entedia do mesmo jeito */
  const usados = new Set(linha.filter((x) => x.assunto).map((x) => x.assunto));
  t(`e a variedade é real (${usados.size} assuntos distintos)`, usados.size >= 20);
  /* nem a mesma família duas vezes seguidas: três brigas seguidas com
     nomes diferentes continuam sendo três brigas */
  const fam = linha.filter((x) => x.virou && x.mov === "semente").map((x) => (assuntoPorId(x.assunto) || {}).familia);
  let famColada = 0;
  for (let i = 1; i < fam.length; i++) if (fam[i] && fam[i] === fam[i - 1]) famColada++;
  t(`famílias não se repetem coladas (${famColada} vezes)`, famColada === 0);
}

sec("5. A ONDA ESPERA QUANDO JÁ HÁ CENA GRANDE");
{
  /* um clímax de compasso disparando dentro de um combate que o jogador já
     está travando são duas cenas grandes no mesmo turno, e a segunda apaga
     a primeira */
  let c = garantirCompasso(null);
  const antes = { ...c };
  for (let i = 0; i < 30; i++) c = avancarCompasso(c, SIT, { segurar: true }).compasso;
  t("segurando, a onda não anda", c.movimento === antes.movimento && c.turnos === antes.turnos);
  t("e diz por quê", /já há cena grande em curso/.test(avancarCompasso(c, SIT, { segurar: true }).porque));
  t("solta, ela volta a andar", avancarCompasso(c, SIT, {}).compasso.turnos > 0);
}

sec("6. OS ENVELOPES");
{
  const { linha } = rodar(300);
  const porMov = {};
  for (const x of linha) if (x.env) porMov[x.mov] = (porMov[x.mov] || 0) + 1;
  t("o respiro nunca manda envelope", !porMov.respiro);
  for (const id of ["semente", "subida", "vespera", "climax", "preco"]) {
    t(`o ${id} manda`, (porMov[id] || 0) > 0);
  }
  const env = (id) => (linha.find((x) => x.env && x.mov === id) || {}).env || "";

  t("a semente manda PLANTAR e não acontecer", /isto é PLANTIO/.test(env("semente")) && /NÃO comece a coisa/.test(env("semente")));
  t("e proíbe avisar que vem", /NÃO me avise que ela vem/.test(env("semente")));
  t("a subida usa o que já foi plantado", /sem material novo/.test(env("subida")));
  t("e deixa brecha para eu agir", /Deixe uma brecha para eu agir/.test(env("subida")));

  /* A VÉSPERA é a peça que importa: sem ela o clímax é emboscada do
     sistema, e emboscada do sistema é a diferença entre difícil e injusto */
  t("a véspera proíbe acontecer ainda", /NÃO faça acontecer ainda/.test(env("vespera")));
  t("e me dá um turno para escolher como encarar", /escolher como encará-lo/.test(env("vespera")));

  t("o clímax exige o material da mesa", /aconteça com o que JÁ está na mesa/.test(env("climax")));
  t("e não abre combate por conta própria", /quem abre o combate é o sistema/.test(env("climax")));
  t("o preço proíbe voltar ao normal", /não existe "e tudo voltou ao normal"/.test(env("preco")));
  t("e proíbe mexer na ficha", /NÃO cobre PV, moeda nem item/.test(env("preco")));
  t("e proíbe já abrir a próxima ameaça", /NÃO abra a próxima ameaça/.test(env("preco")));

  t("sem virada, sem envelope", envelopeDoCompasso({ virou: false }) === "");
  t("e o jogador não vê nada", linhaDoCompasso() === "");
}

sec("7. O QUE SOBE AO PROMPT — a tensão, nunca o rótulo");
{
  const r = resumoCompasso({ movimento: "vespera" });
  t("o resumo fala do ritmo", /RITMO DESTA CENA/.test(r));
  /* uma IA que sabe que está na "véspera" escreve véspera; uma que sabe que
     a tensão é alta escreve uma cena tensa, que é o que se queria. É a
     mesma régua do nome da etapa do arco na v9.84. */
  t("mas não diz o nome do movimento", !/véspera|vespera/i.test(r));
  t("nem o nome do assunto", !ASSUNTOS.some((a) => r.includes(a.nome)));
  t("proíbe contar ao jogador", /NUNCA diga ao jogador em que ponto do ritmo/.test(r));
  t("e proíbe antecipar", /NUNCA antecipe o que vem/.test(r));
  t("há um tom por degrau de tensão", TOM_DA_TENSAO.length === 5);
  const tons = new Set(MOVIMENTOS.map((m) => resumoCompasso({ movimento: m.id })));
  t("e movimentos diferentes dão tons diferentes", tons.size >= 4);

  /* a barra do console de autor mostra a FORMA da onda, não o conteúdo */
  const b = barraDoCompasso({ movimento: "climax", turnos: 0, alvo: 2 });
  t("a barra mostra a posição", /◆/.test(b) && /1\/2/.test(b));
  t("e não nomeia nada", !/clímax|climax|semente/i.test(b));
}

sec("8. A LIGAÇÃO NO APP");
{
  const app = fs.readFileSync("../src/App.jsx", "utf8");
  t("o compasso vive num ref", /compassoRef = useRef\(garantirCompasso\(null\)\)/.test(app));
  t("é salvo", /compasso: compassoRef\.current/.test(app));
  t("e recarregado", /compassoRef\.current = garantirCompasso\(sv\.compasso\)/.test(app));
  t("anda no ponto único do turno", /const doCompasso = talvezAndarOCompasso\(conteudo\);/.test(app));
  /* v9.104: a PAUTA passou a abrir a nota — casar com a lista literal
     quebraria a cada sistema que se mudasse para dentro dela. */
  t("e entra na nota", /const nota = \[pauta, [^\]]*doCompasso[^\]]*\]/.test(app));
  t("e a PAUTA vem antes de tudo — o Narrador precisa saber ONDE antes do que fazer lá", /const nota = \[pauta, /.test(app));

  const g = app.split("const talvezAndarOCompasso")[1].split("\n  };")[0];
  /* SEGURA em combate, masmorra e viagem */
  t("segura quando há cena grande", /segurar: !!combateRef\.current \|\| !!masmorraRef\.current \|\| !!jornadaRef\.current/.test(g));
  t("usa a mesma situação do Bibliotecário", /situacaoDaMesa\(\)/.test(g));
  t("e o holofote escolhe a família", /preferir: sit\.pilarFaminto/.test(g));
  t("protegida por try", /try \{/.test(g) && /catch \{ return ""/.test(g));

  /* A FORMA CEDE A VEZ: o envelope do compasso já diz do que a cena trata
     e em que tempo; uma forma por cima seria o sistema dando duas
     instruções de composição para a mesma cena */
  t("a forma da cena cede a vez ao compasso", /const formaDaCena = doCompasso \? "" : talvezDarFormaACena/.test(app));

  t("o ritmo sobe junto do arco", /resumoDoArco = \(\) => \[resumoHistoria\([\s\S]{0,60}?resumoDoRitmo\(\)\]/.test(app));
  /* UMA chamada: a definicao e `const resumoDoRitmo = () =>`, que nao
     casa com `resumoDoRitmo()` — o que se conta aqui e o USO, e ele tem
     de ser unico para nao haver um segundo lugar por onde o ritmo suba */
  t("num lugar só", (app.match(/resumoDoRitmo\(\)/g) || []).length === 1);
}

console.log(`\ncompasso v9.91: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
