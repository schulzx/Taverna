/* O TURNO GUARDADO (Fase X, etapa X3) — a prova

   A FRASE QUE ESTA SUÍTE EXISTE PARA PROVAR:

       o guardado é o que ACONTECEU — não uma promessa de repetir.

   Por que isso é lei e não conforto. O turno de combate acontece em duas
   batidas separadas: primeiro o motor resolve (rola o dado, aplica o
   dano, cobra a ação) e só DEPOIS o App manda o envelope
   `[COMBATE — RESOLVIDO PELO SISTEMA]` para o Narrador contar. Se a
   segunda batida cai e o jogador declara de novo, o motor ROLA OUTRA
   VEZ — e uma queda de rede vira segunda chance de um resultado ruim.
   Numa casa cuja primeira lei é determinismo por semente, isso é um
   exploit que se disfarça de azar: parece falta de sorte, não parece
   exploit. Por isso não basta provar que o módulo GUARDA; é preciso
   provar que NÃO SE RE-ROLA, e mostrar o que a re-rolagem daria.

   Os oito blocos, e o que cada um defende:

   1. A QUEDA DO NARRADOR É ENCENÁVEL. Os erros são os REAIS deste
      projeto, medidos em `api/narrador.js` e `api/_portao.js`, montados
      exatamente como `chamarModelo` (src/App.jsx:256) os monta. Zero
      rede, zero chave, zero `fetch` — e nenhum cai em `desconhecido`
      por acidente.
   2. O GUARDADO É O QUE ACONTECEU. O turno inteiro encenado com um
      motor de mentira que CONTA AS ROLAGENS: o contador fica em 1
      depois de três retries, e a marca do que se narra é a mesma do que
      o motor produziu — byte a byte.
   3. A CONTRAPROVA. Re-rolar NÃO daria o mesmo. É o bloco que
      transforma o resto em lei.
   4. NADA FICA PELA METADE. O registro atravessa o save (JSON ida e
      volta) sem perder marca, envelope nem trava.
   5. A TRAVA MORDE SÓ O NECESSÁRIO. Turno que rolou trava; turno que
      não rolou, não — ali não há resultado a perder.
   6. A CONTA DAS TENTATIVAS. Mesmo envelope continua a conta; outro
      envelope recomeça.
   7. O MÓDULO NUNCA ESTOURA E NUNCA MUTA. Ele roda no caminho de uma
      falha: um órgão que quebra durante a falha apaga o turno que ele
      existe para salvar.
   8. A VOZ É DE MUNDO. Toda linha `casa` sobe para a tela — nenhuma
      pode dizer o nome do mecanismo, e nenhuma pode estar vazia. É a lei
      "o sistema não fala de si mesmo" virando asserção. */

const { readFileSync } = await import("node:fs");
const { dirname } = await import("node:path");
const { fileURLToPath } = await import("node:url");
/* o `chdir` é o mesmo de `rodar-tudo.mjs`, e pelo mesmo motivo: os
   `readFileSync` daqui resolvem pelo diretório de TRABALHO, não pelo do
   módulo. Com ele, `node testes/teste-guardado.mjs` da raiz e
   `node teste-guardado.mjs` de dentro de testes/ dizem a mesma coisa —
   e no `npm test` a linha é um no-op, porque o corredor já chegou aqui. */
process.chdir(dirname(fileURLToPath(import.meta.url)));

const GU = await import("../src/guardado.js");
const {
  MOTIVOS_DO_SILENCIO, SELOS_DO_RESOLVIDO, IMPRESSAO_FNV, SEM_GUARDADO,
  lerOSilencio, ehTurnoResolvido, marcaDoTurno,
  guardarTurno, maisUmaTentativa, oQueNarrar, travaODeclarar,
} = GU;
const APP = readFileSync("../src/App.jsx", "utf8");
const FONTE = readFileSync("../src/guardado.js", "utf8");

let bons = 0, maus = 0;
const t = (nome, cond) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome); } };
const pendente = (nome, valor) => console.log("  ··  " + nome + " — " + valor + "  (medido, não travado)");
const sec = (s) => console.log("\n" + s);

/* ============================================================
   O NARRADOR DE MENTIRA

   Não é um `fetch` com mock: é a LINHA QUE LANÇA, reproduzida. O que
   chega ao `catch` de `enviar` é sempre uma string, e ela nasce em
   src/App.jsx:256:

       throw new Error((data.erro || `HTTP ${response.status}`)
                       + (pistas ? ` (${pistas})` : ""));

   onde `pistas` é `[data.motivo, data.origem]` — os dois campos que o
   portão manda no corpo. Encenar a queda é, portanto, montar essa mesma
   string e lançá-la. Nenhuma chamada sai da máquina, nenhuma chave é
   lida, e a suíte roda offline em qualquer lugar.
   ============================================================ */
const erroDoNarrador = ({ erro, status, motivo, origem }) => {
  const pistas = [motivo, origem].filter(Boolean).join(" · ");
  return new Error((erro || `HTTP ${status}`) + (pistas ? ` (${pistas})` : ""));
};
/* o Narrador que sempre cai, e conta quantas vezes foi chamado: é o que
   prova que "tentar de novo" custa chamada de rede e NÃO custa rolagem */
const narradorQueCai = (queda) => {
  const n = { chamadas: 0 };
  n.contar = async () => { n.chamadas += 1; throw erroDoNarrador(queda); };
  return n;
};

/* ============================================================
   O MOTOR DE MENTIRA — determinístico, e com contador de rolagens

   LCG de 32 bits (Numerical Recipes: 1664525 / 1013904223), pelo mesmo
   motivo que o módulo usa `Math.imul`: a mesma semente tem de dar a
   mesma sequência em qualquer máquina. `Math.random` aqui tornaria a
   própria prova do determinismo indeterminada.

   `rolagens` é o coração desta suíte. Ele é incrementado DENTRO do
   `d20`, e é a única testemunha que não pode ser enganada: se o turno
   re-rolar por qualquer caminho, o número sobe.
   ============================================================ */
function motorDeMentira(semente) {
  let s = (semente >>> 0) || 1;
  const m = { rolagens: 0 };
  m.d20 = () => {
    m.rolagens += 1;
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return ((s >>> 16) % 20) + 1;
  };
  return m;
}

/* A PRIMEIRA BATIDA DO TURNO, encenada: o motor resolve ANTES de o
   Narrador entrar na história. O envelope que sai daqui é o mesmo molde
   do App (src/App.jsx:11938) — cabeçalho `[COMBATE — RESOLVIDO PELO
   SISTEMA]` e corpo que manda NARRAR, não recalcular.

   O envelope diz a vida do inimigo DEPOIS e a ação que sobrou. Não é
   enfeite: são os dois campos que o estado muda ao ser aplicado, e é por
   eles que o bloco 3 mostra que re-rolar produz outro texto mesmo quando
   o dado cai igual. */
function resolverGolpe(motor, estado) {
  const d = motor.d20();
  const acertou = d + 4 >= estado.inimigo.ca;
  const dano = acertou ? d : 0;
  const vida = Math.max(0, estado.inimigo.vida - dano);
  const depois = { inimigo: { ...estado.inimigo, vida }, acao: estado.acao - 1 };
  const conteudo =
    `[COMBATE — RESOLVIDO PELO SISTEMA] Ataco ${estado.inimigo.nome}: rolei ${d} (+4) contra defesa ` +
    `${estado.inimigo.ca} — ${acertou ? `acerto, ${dano} de dano` : "errei por pouco"}. ` +
    `${estado.inimigo.nome} fica com ${vida} PV e me resta ${depois.acao} ação. ` +
    `O dano já foi aplicado. NÃO recalcule nem mude números — NARRE em 2-4 frases.`;
  return { d, dano, acertou, depois, conteudo };
}

const SEMENTE = 20250915;
/* o inimigo tem PV para SOBREVIVER ao primeiro golpe. Não é detalhe de
   cenário: é o que faz a contraprova do bloco 3 ser legível — com um
   inimigo que morre na primeira pancada, os dois "depois" empatam em 0
   PV e a diferença que importa fica escondida atrás da economia de ação. */
const MESA = Object.freeze({ inimigo: Object.freeze({ nome: "Bandido do Vau", vida: 30, ca: 13 }), acao: 1 });
/* `quando` entra SEMPRE por argumento: um `Date.now()` numa asserção
   tornaria esta suíte irrepetível amanhã */
const QUANDO = 1757894400000;

sec("1. A QUEDA DO NARRADOR, ENCENADA — os erros reais, sem rede e sem chave");
{
  /* cada caso é uma queda MEDIDA no servidor deste projeto. `onde` diz
     de qual arquivo a string saiu — se um dia o servidor mudar a frase,
     é por essa coluna que se acha o que re-medir. */
  const QUEDAS = [
    { classe: "sem_dinheiro", onde: "narrador.js:238 (502 por fora, 402 por dentro)", status: 502,
      erro: 'Todos os provedores falharam — deepseek (deepseek-chat: 402: {"error":{"message":"Insufficient Balance","type":"unknown_error"}})' },
    { classe: "sem_dinheiro", onde: "chamarModelo sem corpo", status: 402 },
    { classe: "sem_dinheiro", onde: "narrador.js:215 — fila vazia", status: 500,
      erro: "Nenhuma chave configurada (DEEPSEEK_API_KEY / GEMINI_API_KEY)" },
    { classe: "recusado", onde: "_portao.js:164 — origem", status: 403,
      erro: "Este endereço só responde ao jogo.", motivo: "origem não autorizada", origem: "https://copia.exemplo" },
    { classe: "recusado", onde: "_portao.js:164 — sem origem", status: 403,
      erro: "Este endereço só responde ao jogo.", motivo: "sem origem", origem: "(nenhuma)" },
    { classe: "recusado", onde: "_portao.js:173 — teto diário", status: 429,
      erro: "Limite diário alcançado (500 chamadas). Ele volta a zero à meia-noite — e se você chegou aqui jogando de verdade, me avise: o teto sobe." },
    { classe: "recusado", onde: "chave inválida do provedor", status: 401, erro: "Invalid API key" },
    { classe: "recusado", onde: "modelo que não existe", status: 404 },
    { classe: "sem_rede", onde: "Chrome", erro: "Failed to fetch" },
    { classe: "sem_rede", onde: "Firefox", erro: "NetworkError when attempting to fetch resource." },
    { classe: "sem_rede", onde: "Safari", erro: "Load failed" },
    { classe: "tempo_esgotado", onde: "AbortController", erro: "The operation was aborted." },
    { classe: "tempo_esgotado", onde: "AbortSignal.timeout", erro: "signal is aborted without reason" },
    { classe: "tempo_esgotado", onde: "Request Timeout", status: 408 },
    { classe: "provedor_caiu", onde: "500 cru", status: 500 },
    { classe: "provedor_caiu", onde: "502 do roteador", status: 502 },
    { classe: "provedor_caiu", onde: "narrador.js:238 — fila inteira caiu", status: 502,
      erro: "Todos os provedores falharam — deepseek (deepseek-chat: 429 (retentando…)) · gemini (gemini-2.5-flash: 503)" },
    { classe: "provedor_caiu", onde: "narrador.js:119 — DeepSeek mudo", status: 502,
      erro: "Todos os provedores falharam — deepseek (resposta vazia)" },
    { classe: "provedor_caiu", onde: "narrador.js:191 — Gemini mudo", status: 502,
      erro: "Todos os provedores falharam — gemini (sem texto (SAFETY))" },
    { classe: "demanda", onde: "429 limpo do provedor", status: 429 },
    { classe: "demanda", onde: "429 nomeado", status: 429, erro: "rate limit exceeded" },
  ];

  const erradas = [];
  const caiuNoDesconhecido = [];
  for (const q of QUEDAS) {
    /* a queda é LANÇADA e PEGA, como o `enviar` a pega: é o caminho
       inteiro do erro, não uma string passada à mão */
    let motivo = "";
    try { throw erroDoNarrador(q); } catch (e) { motivo = (e && e.message) ? String(e.message) : ""; }
    const s = lerOSilencio(motivo);
    if (s.id !== q.classe) erradas.push(`${q.onde}: esperava ${q.classe}, veio ${s.id}`);
    if (s.id === "desconhecido") caiuNoDesconhecido.push(q.onde);
    /* o técnico volta ÍNTEGRO — é ele que desce ao console, e quem apaga
       o motivo fica cego */
    if (s.tecnico !== motivo) erradas.push(`${q.onde}: o técnico foi editado`);
  }
  t(`as ${QUEDAS.length} quedas reais caem na classe certa${erradas.length ? " — " + erradas.join("; ") : ""}`, erradas.length === 0);
  t(`e NENHUMA cai em \`desconhecido\` por acidente${caiuNoDesconhecido.length ? " — " + caiuNoDesconhecido.join("; ") : ""}`, caiuNoDesconhecido.length === 0);

  /* as sete classes da tabela, e todas exercitadas aqui: uma classe sem
     caso medido é uma linha que ninguém prova */
  const ids = MOTIVOS_DO_SILENCIO.map((m) => m.id);
  t("a tabela tem as sete classes, nesta ordem (a ordem É a precedência)",
    ids.join(",") === "sem_dinheiro,recusado,sem_rede,tempo_esgotado,provedor_caiu,demanda,desconhecido");
  const exercitadas = new Set(QUEDAS.map((q) => q.classe));
  t("seis das sete têm caso medido aqui (a sétima é o resto, provado logo abaixo)",
    ids.filter((i) => i !== "desconhecido").every((i) => exercitadas.has(i)));

  /* AS DUAS PRECEDÊNCIAS QUE A TABELA DECLARA — as duas medidas, as duas
     com consequência de jogo se invertidas */
  const teto = lerOSilencio("Limite diário alcançado (500 chamadas). Ele volta a zero à meia-noite.");
  t("o teto diário é RECUSA, e não provedor caído — apesar do 500 dentro do texto",
    teto.id === "recusado" && teto.podeTentar === false);
  const credito = lerOSilencio('Todos os provedores falharam — deepseek (deepseek-chat: 402: {"error":{"message":"Insufficient Balance"}})');
  t("o 402 por dentro manda no 502 por fora: a causa real é o crédito",
    credito.id === "sem_dinheiro" && credito.podeTentar === false);

  /* o RESTO existe, e é honesto: silêncio sem frase é pior que frase genérica */
  for (const lixo of ["HTTP 418", "aconteceu algo muito estranho", "", null, undefined, 42, {}, []]) {
    const s = lerOSilencio(lixo);
    t(`\`${String(lixo)}\` cai em desconhecido, com frase e com botão`,
      s.id === "desconhecido" && !!s.casa && s.podeTentar === true);
  }

  /* o que NÃO se pode fazer é classificar por nome de classe: o `try` do
     `enviar` abraça o turno inteiro, então um TypeError de código do jogo
     também cai ali. Mentir "sem rede" sobre um bug é pior que "desconhecido". */
  const bugDoJogo = lerOSilencio("Cannot read properties of null (reading 'vida')");
  t("um TypeError de código do jogo NÃO vira \"sem rede\"", bugDoJogo.id === "desconhecido");

  /* o `podeTentar` não é enfeite: é o botão que resolve contra o botão
     que ensina a bater na porta trancada */
  t("as duas classes sem conserto não oferecem tentar de novo",
    MOTIVOS_DO_SILENCIO.filter((m) => m.podeTentar === false).map((m) => m.id).join(",") === "sem_dinheiro,recusado");

  /* e a encenação é encenação mesmo: nenhuma chamada saiu da máquina */
  const narrador = narradorQueCai({ status: 502, erro: "Todos os provedores falharam — deepseek (deepseek-chat: 500)" });
  let pegou = "";
  try { await narrador.contar(); } catch (e) { pegou = e.message; }
  t("o Narrador de mentira cai como o de verdade, e conta a chamada",
    narrador.chamadas === 1 && lerOSilencio(pegou).id === "provedor_caiu");
  t("e esta suíte não conhece `fetch` nem chave nenhuma",
    !/\bfetch\s*\(/.test(readFileSync("teste-guardado.mjs", "utf8"))
    && !/API_KEY\s*[:=]/.test(readFileSync("teste-guardado.mjs", "utf8")));
  /* procuro CHAMADA, não palavra: "failed to fetch" é uma `marca` da
     tabela — texto que o navegador escreve, e que o módulo precisa
     conhecer para classificar. Procurar `\bfetch\b` reprovaria o módulo
     por ele saber o nome do erro que existe para reconhecer. */
  const CRU = FONTE.replace(/\/\*[\s\S]*?\*\//g, "");
  t("o módulo não fala com a rede, não tem relógio e não sorteia",
    !/\bfetch\s*\(|localStorage\s*\.|Math\.random\s*\(|Date\.now\s*\(/.test(CRU));
  t("e não conhece React nem o App", !/from "react|from ".*App/.test(CRU));
}

sec("2. O GUARDADO É O QUE ACONTECEU — a prova central");
{
  /* A CENA INTEIRA, na ordem em que ela acontece de verdade:
     declarar → o motor rola UMA vez → o Narrador cai → guardarTurno →
     oQueNarrar → o Narrador conta. */
  const motor = motorDeMentira(SEMENTE);
  const golpe = resolverGolpe(motor, MESA);
  t("o motor rolou UMA vez para resolver o turno", motor.rolagens === 1);
  t("e o turno mudou o mundo: o inimigo está ferido e a ação foi cobrada",
    golpe.acertou === true && golpe.depois.inimigo.vida < MESA.inimigo.vida && golpe.depois.acao === MESA.acao - 1);
  console.log(`      o dado de hoje (semente ${SEMENTE}): ${golpe.d} · dano ${golpe.dano} · o Bandido fica com ${golpe.depois.inimigo.vida} PV`);

  /* A MARCA DO QUE O MOTOR PRODUZIU, tirada ANTES de qualquer queda. É
     contra ela que tudo o que vem depois é medido. */
  const marcaDoMotor = marcaDoTurno(golpe.conteudo);
  t("a marca do envelope tem a forma da impressão: 8 hex e o comprimento",
    /^[0-9a-f]{8}-\d+$/.test(marcaDoMotor) && marcaDoMotor.endsWith("-" + golpe.conteudo.length));

  /* O NARRADOR CAI. O envelope já existe; o que faltou foi contar. */
  const narrador = narradorQueCai({ status: 502, erro: "Todos os provedores falharam — deepseek (deepseek-chat: 503)" });
  let motivo = "";
  try { await narrador.contar(); } catch (e) { motivo = e.message; }

  let guardado = guardarTurno({ conteudo: golpe.conteudo, histBase: [{ role: "user", content: "antes" }], persAtual: { nome: "Bram", vida: 17 }, motivo, quando: QUANDO });
  t("o turno ficou guardado, e não `SEM_GUARDADO`", guardado !== SEM_GUARDADO && !!guardado);
  t("com a marca do que o motor produziu", guardado.marca === marcaDoMotor);
  t("e com a voz de mundo da queda já lida", guardado.silencio.id === "provedor_caiu" && !!guardado.silencio.casa);
  t("o registro sabe que o motor rolou", guardado.rolou === true);
  t("e guarda o que o App precisa para retomar: histórico, ficha e o instante",
    Array.isArray(guardado.histBase) && guardado.persAtual.nome === "Bram" && guardado.quando === QUANDO);

  /* A TRAVA ESTÁ DE PÉ ENQUANTO O TURNO ESPERA */
  t("enquanto o turno espera, a trava do declarar está levantada", travaODeclarar(guardado) === true);

  /* A SEGUNDA DECLARAÇÃO, encenada como o App a trata: a porta pergunta
     à trava ANTES de chamar o motor. É este `if` que impede a segunda
     chance — e o contador é a testemunha de que ele funcionou. */
  const declararDeNovo = () => {
    if (travaODeclarar(guardado)) return "a mesa espera";
    return resolverGolpe(motor, MESA);
  };
  const resposta = declararDeNovo();
  t("uma segunda declaração não chega ao motor", resposta === "a mesa espera");
  t("e o contador de rolagens CONTINUA EM 1", motor.rolagens === 1);

  /* TRÊS RETRIES SEGUIDOS. Cada um custa uma chamada de rede e ZERO
     rolagem — que é a promessa inteira desta etapa. */
  const marcas = [];
  for (let i = 0; i < 3; i++) {
    const preso = oQueNarrar(guardado);
    marcas.push(marcaDoTurno(preso));
    /* o App faz exatamente isto no `retentar`: manda o preso e soma a conta */
    guardado = maisUmaTentativa(guardado);
    try { await narrador.contar(); } catch { /* cai de novo, de propósito */ }
    /* e entre um retry e outro o jogador insiste no botão de declarar */
    declararDeNovo();
  }
  t("três retries: o contador de rolagens continua em 1", motor.rolagens === 1);
  t("e os três custaram chamada de rede, não rolagem", narrador.chamadas === 4);
  t("as três marcas narradas são a MESMA do que o motor produziu",
    marcas.length === 3 && marcas.every((m) => m === marcaDoMotor));

  /* BYTE A BYTE, e não "equivalente": é o texto exato que volta */
  const narradoAfinal = oQueNarrar(guardado);
  t("o que se narra depois é o envelope do motor, byte a byte", narradoAfinal === golpe.conteudo);
  t("e a marca fecha o círculo", marcaDoTurno(narradoAfinal) === marcaDoMotor);

  /* O MESTRE FALA: o guardado morre, e a porta reabre */
  const depoisDoSucesso = SEM_GUARDADO;
  t("quando o Mestre enfim fala, o guardado morre", depoisDoSucesso === null);
  t("e a trava cai junto — um guardado que sobrevive ao sucesso trancaria o jogo para sempre",
    travaODeclarar(depoisDoSucesso) === false);
}

sec("3. A CONTRAPROVA — re-rolar NÃO daria o mesmo, logo não é repetir");
{
  /* ESTE É O BLOCO QUE TRANSFORMA O RESTO EM LEI, e a conclusão fica
     escrita com todas as letras porque a intenção tem de sobreviver à
     mudança:

       "tentar de novo re-rolando" NÃO é repetir o turno. É SORTEAR
       OUTRA VEZ — e portanto é segunda chance.

     Provado por dois caminhos, porque a re-rolagem pode acontecer de
     duas formas e as duas dão resultado diferente do primeiro:

     (a) O MOTOR CONTINUA DE ONDE PAROU, que é o que acontece no jogo de
         verdade: o fluxo de aleatoriedade já andou, e o próximo d20 é
         outro número.
     (b) O MOTOR RECOMEÇA NA MESMA SEMENTE, que é o caso mais generoso
         possível para a ideia de "re-rolar repete" — o dado cai IGUAL.
         E mesmo assim o resultado difere, porque a rolagem é aplicada
         sobre o estado DEPOIS do golpe: o inimigo já está ferido e a
         ação já foi cobrada. Repetir a sorte não repete o turno, porque
         o turno não é só o dado: é o dado CONTRA um mundo que mudou. */

  const motor = motorDeMentira(SEMENTE);
  const primeiro = resolverGolpe(motor, MESA);
  const marca1 = marcaDoTurno(primeiro.conteudo);

  /* (a) o motor continua — a rolagem seguinte é outra */
  const segundoNoMesmoFluxo = resolverGolpe(motor, primeiro.depois);
  t("(a) o motor continuando rola de novo — o contador vai a 2", motor.rolagens === 2);
  t("(a) e o dado cai diferente do primeiro", segundoNoMesmoFluxo.d !== primeiro.d);
  t("(a) logo o envelope é OUTRO, e a marca não bate",
    marcaDoTurno(segundoNoMesmoFluxo.conteudo) !== marca1);

  /* (b) o motor recomeça na mesma semente, sobre o estado já mudado */
  const motorRecomecado = motorDeMentira(SEMENTE);
  const segundoReSemeado = resolverGolpe(motorRecomecado, primeiro.depois);
  t("(b) re-semeado, o DADO cai igual — a semente é honesta", segundoReSemeado.d === primeiro.d);
  t("(b) mas o RESULTADO difere: o inimigo já estava ferido e a ação já fora cobrada",
    segundoReSemeado.depois.inimigo.vida !== primeiro.depois.inimigo.vida
    && segundoReSemeado.depois.acao !== primeiro.depois.acao);
  t("(b) e o envelope é outro texto, com outra marca",
    segundoReSemeado.conteudo !== primeiro.conteudo
    && marcaDoTurno(segundoReSemeado.conteudo) !== marca1);
  console.log(`      primeiro: d${primeiro.d}, inimigo com ${primeiro.depois.inimigo.vida} PV`
    + ` · (a) d${segundoNoMesmoFluxo.d} · (b) d${segundoReSemeado.d}, inimigo com ${segundoReSemeado.depois.inimigo.vida} PV`);

  /* E O CAMINHO CERTO, ao lado dos dois errados, para a diferença ficar
     visível numa linha só: `oQueNarrar` não rola nada e devolve o mesmo. */
  const motorIntacto = motorDeMentira(SEMENTE);
  const golpe = resolverGolpe(motorIntacto, MESA);
  const g = guardarTurno({ conteudo: golpe.conteudo, motivo: "Failed to fetch", quando: QUANDO });
  const dez = [];
  for (let i = 0; i < 10; i++) dez.push(marcaDoTurno(oQueNarrar(g)));
  t("dez pedidos de narração: uma rolagem só, e dez vezes a mesma marca",
    motorIntacto.rolagens === 1 && dez.every((m) => m === marcaDoTurno(golpe.conteudo)));
  t("e `oQueNarrar` devolve texto, nunca recomputa: não conhece o motor",
    oQueNarrar(g) === golpe.conteudo && !/motor|rolar|d20/i.test(String(oQueNarrar)));
}

sec("4. NADA FICA PELA METADE — o registro atravessa o save");
{
  const motor = motorDeMentira(SEMENTE);
  const golpe = resolverGolpe(motor, MESA);
  const g = guardarTurno({
    conteudo: golpe.conteudo,
    histBase: [{ autor: "jogador", texto: "Ataco Bandido do Vau" }],
    persAtual: { nome: "Bram", vida: 17, moedas: 12 },
    motivo: "Failed to fetch", quando: QUANDO,
  });

  /* é exatamente o que o `salvar` do App faz com a ref: JSON ida e volta */
  const doSave = JSON.parse(JSON.stringify(g));
  t("a marca sobrevive ao save", doSave.marca === g.marca && doSave.marca === marcaDoTurno(golpe.conteudo));
  t("o envelope sobrevive byte a byte", doSave.conteudo === golpe.conteudo && oQueNarrar(doSave) === golpe.conteudo);
  t("a trava sobrevive — um save recarregado não destrava o turno", travaODeclarar(doSave) === true);
  t("a voz de mundo sobrevive, e o técnico junto",
    doSave.silencio.casa === g.silencio.casa && doSave.silencio.tecnico === "Failed to fetch");
  t("e a conta continua contando do outro lado do save", maisUmaTentativa(doSave).tentativas === 1);
  t("o histórico e a ficha voltam inteiros",
    doSave.histBase.length === 1 && doSave.persAtual.moedas === 12 && doSave.quando === QUANDO);

  /* SAVE ANTIGO — escrito antes de este campo existir. Nem estouro, nem
     migração: o vazio já tem um nome só, e é `null`. */
  const saveAntigo = JSON.parse(JSON.stringify({ personagem: { nome: "Bram" } }));
  const lido = saveAntigo.guardado && typeof saveAntigo.guardado === "object" ? saveAntigo.guardado : SEM_GUARDADO;
  t("save sem o campo dá SEM_GUARDADO, sem estouro e sem migração", lido === SEM_GUARDADO && SEM_GUARDADO === null);
  t("e nada trava, nada narra, nada conta",
    travaODeclarar(lido) === false && oQueNarrar(lido) === "" && maisUmaTentativa(lido) === SEM_GUARDADO);

  /* o registro de um save é objeto CRU: nada congelado, e ainda assim é
     o mesmo turno. Por isso a identidade é a `marca`, e não o objeto. */
  t("o registro do save não é o mesmo objeto, mas é o mesmo turno",
    doSave !== g && doSave.marca === g.marca && !Object.isFrozen(doSave));
}

sec("5. A TRAVA MORDE SÓ O NECESSÁRIO — envelopes reais do App.jsx");
{
  /* OS ENVELOPES SÃO LIDOS DO App.jsx, nunca copiados: uma cópia
     envelheceria sozinha no dia em que o App mudasse o selo. */
  const ROLOU = "[COMBATE — RESOLVIDO PELO SISTEMA]";
  const NAO_ROLOU = "[ABERTURA DE CAPÍTULO]";
  t(`o App ainda manda \`${ROLOU}\``, APP.includes(ROLOU));
  t(`e ainda manda \`${NAO_ROLOU}\``, APP.includes(NAO_ROLOU));

  const linhaCombate = APP.slice(APP.indexOf(ROLOU), APP.indexOf(ROLOU) + 240);
  const gRolou = guardarTurno({ conteudo: linhaCombate, motivo: "HTTP 500", quando: QUANDO });
  const gConversa = guardarTurno({ conteudo: NAO_ROLOU + " Abra o capítulo conforme o envelope acima.", motivo: "HTTP 500", quando: QUANDO });

  t("turno que ROLOU trava a declaração", gRolou.rolou === true && travaODeclarar(gRolou) === true);
  t("turno que NÃO rolou não trava — ali não há resultado a perder",
    gConversa.rolou === false && travaODeclarar(gConversa) === false);
  t("e os dois continuam guardados: a trava é estreita, não é o guardado",
    gConversa !== SEM_GUARDADO && oQueNarrar(gConversa).startsWith(NAO_ROLOU));

  /* SÓ O PRIMEIRO PAR DE COLCHETES CONTA. O corpo do envelope de combate
     diz "O dano já foi aplicado" no meio da prosa — se a varredura
     olhasse o texto inteiro, uma conversa que citasse a frase travaria
     o jogo sem ter nada a perder. */
  t("o corpo do envelope real diz \"já foi aplicado\" — e é prosa para a IA",
    /dano já foi aplicado/i.test(linhaCombate));
  const conversaQueCita = "Pergunto ao ferreiro se o dano já foi aplicado à lâmina.";
  t("frase de jogador que CITA a fórmula não vira turno resolvido", ehTurnoResolvido(conversaQueCita) === false);
  t("e frase crua de jogador nunca começa por colchete, logo nunca trava",
    ehTurnoResolvido("ataco o bandido") === false && travaODeclarar(guardarTurno({ conteudo: "ataco o bandido", quando: 0 })) === false);

  /* TODO SELO MEDIDO CASA O SEU PRÓPRIO PADRÃO — `medidos` é dado, e não
     comentário, justamente para que a suíte possa lê-lo de volta */
  const mentem = [];
  let quantos = 0;
  for (const s of SELOS_DO_RESOLVIDO) {
    if (!s.porque) mentem.push(s.id + " sem motivo escrito");
    for (const m of s.medidos) {
      quantos++;
      if (!ehTurnoResolvido(m)) mentem.push(`${s.id}: "${m}" não casa o próprio padrão`);
      if (!s.padrao.test(m)) mentem.push(`${s.id}: "${m}" não casa \`padrao\` direto`);
    }
  }
  t(`os ${quantos} selos medidos casam os três padrões${mentem.length ? " — " + mentem.join("; ") : ""}`, mentem.length === 0);
  t("são três famílias de selo, cada uma com o porquê escrito",
    SELOS_DO_RESOLVIDO.length === 3
    && SELOS_DO_RESOLVIDO.map((s) => s.id).join(",") === "resolvido,ja_feito,rolado_pelo_sistema");

  /* O QUE FICOU DE FORA, e é DELIBERADO: travar aqui seria punir sem ter
     o que perder. Cada um destes existe no App e NÃO pode travar. */
  const FORA = [
    "[LUGAR — RECUSADO PELO SISTEMA]",
    "[ITEM GERADO PELO SISTEMA]",
    "[QUEST GERADA PELO SISTEMA]",
    "[VIAGEM — REGISTRO DO SISTEMA]",
    "[PARTIDA — REGISTRADA PELO SISTEMA]",
    "[DESPERTAR DIVINO — MARCO REGISTRADO PELO SISTEMA]",
  ];
  const travaram = FORA.filter((e) => ehTurnoResolvido(e));
  t(`as ${FORA.length} exclusões deliberadas seguem sem travar${travaram.length ? " — " + travaram.join("; ") : ""}`, travaram.length === 0);

  /* o `padrao` sem a marca `g`: RegExp com `g` guarda `lastIndex` e mente
     na segunda chamada com a mesma instância. É bug que só aparece no
     segundo turno — por isso ele tem asserção própria. */
  const duasVezes = SELOS_DO_RESOLVIDO.every((s) => s.padrao.test("RESOLVIDO PELO SISTEMA") === s.padrao.test("RESOLVIDO PELO SISTEMA"));
  t("nenhum `padrao` carrega a marca `g` (a segunda chamada não pode mentir)",
    duasVezes && SELOS_DO_RESOLVIDO.every((s) => !s.padrao.flags.includes("g")));

  /* o ramo do save antigo: `rolou` ausente relê o selo do envelope, em
     vez de destravar por omissão — que seria destravar exatamente no
     caso que a trava existe para cobrir */
  t("save antigo sem `rolou` relê o selo em vez de destravar",
    travaODeclarar({ conteudo: ROLOU + " qualquer coisa" }) === true
    && travaODeclarar({ conteudo: NAO_ROLOU + " qualquer coisa" }) === false);
}

sec("6. A CONTA DAS TENTATIVAS — insistir na mesma porta conta como insistência");
{
  const motor = motorDeMentira(SEMENTE);
  const golpe = resolverGolpe(motor, MESA);
  const outro = resolverGolpe(motor, golpe.depois);

  /* O MESMO ENVELOPE CAINDO TRÊS VEZES: 1 → 2 → 3.
     Sem isto o campo volta a 0 a cada queda e o console diz "tentativa
     1" para sempre — e é justamente o número que separa "o provedor
     tossiu uma vez" de "o Mestre está fora do ar há dez minutos". */
  let g = guardarTurno({ conteudo: golpe.conteudo, motivo: "HTTP 500", quando: QUANDO });
  t("a primeira queda começa em 0 — ninguém pediu de novo ainda", g.tentativas === 0);
  const conta = [];
  for (let i = 0; i < 3; i++) {
    g = maisUmaTentativa(g);                       /* o jogador pede de novo */
    conta.push(g.tentativas);
    /* e o Mestre cala outra vez, no MESMO envelope */
    g = guardarTurno({ conteudo: golpe.conteudo, motivo: "HTTP 500", quando: QUANDO, anterior: g });
  }
  t(`a conta anda 1 → 2 → 3 (veio ${conta.join(" → ")})`, conta.join(",") === "1,2,3");
  t("e a conta atravessa a queda: o registro novo herda o número", g.tentativas === 3);

  /* ENVELOPE DIFERENTE RECOMEÇA: é outro turno, é outra insistência */
  const doOutroTurno = guardarTurno({ conteudo: outro.conteudo, motivo: "HTTP 500", quando: QUANDO, anterior: g });
  t("outro envelope recomeça em 0", doOutroTurno.marca !== g.marca && doOutroTurno.tentativas === 0);

  /* `anterior` NULO OU TORTO recomeça: é a resposta honesta para "não sei
     de onde isto vem" */
  const tortos = [null, undefined, "3", 7, {}, { tentativas: 9 }, { marca: "nao-bate", tentativas: 9 }, [], { marca: g.marca, tentativas: "muitas" }, { marca: g.marca, tentativas: -4 }];
  const herdaram = [];
  for (const a of tortos) {
    const r = guardarTurno({ conteudo: golpe.conteudo, motivo: "HTTP 500", quando: QUANDO, anterior: a });
    if (r.tentativas !== 0) herdaram.push(`${JSON.stringify(a)} → ${r.tentativas}`);
  }
  t(`\`anterior\` torto recomeça em 0${herdaram.length ? " — " + herdaram.join("; ") : ""}`, herdaram.length === 0);

  /* o save corrompido não vira "tentativa 3.5" no console */
  const quebrado = guardarTurno({ conteudo: golpe.conteudo, motivo: "HTTP 500", quando: QUANDO, anterior: { marca: marcaDoTurno(golpe.conteudo), tentativas: 2.5 } });
  t("um 2.5 vindo do JSON é aparado para 2 — número quebrado numa contagem é ruído", quebrado.tentativas === 2);

  /* e a conta some quando a rede some: `maisUmaTentativa` sobre nada é nada */
  t("sem registro não há tentativa", maisUmaTentativa(SEM_GUARDADO) === SEM_GUARDADO && maisUmaTentativa("oi") === SEM_GUARDADO);

  /* O ORDINAL DA QUEDA que o App imprime é `tentativas + 1` — quem soma é
     o pedido do jogador, não o silêncio do Mestre. Somar nos dois lados
     contaria o mesmo retry duas vezes e o console pularia de 1 para 3. */
  const recemCaido = guardarTurno({ conteudo: golpe.conteudo, motivo: "HTTP 500", quando: QUANDO });
  t("a queda que acabou de acontecer é a tentativa 1 (= tentativas + 1)", (Number(recemCaido.tentativas) || 0) + 1 === 1);
}

sec("7. O MÓDULO NUNCA ESTOURA, NUNCA MUTA E NUNCA SORTEIA");
{
  /* `= {}` no destructuring NÃO cobre `null` — por isso cada um entra */
  const LIXO = [null, undefined, 0, 42, "", "texto", true, [], {}, { conteudo: null }, { conteudo: 12 }, NaN];
  let estourou = null;
  try {
    for (const x of LIXO) {
      lerOSilencio(x); ehTurnoResolvido(x); marcaDoTurno(x);
      guardarTurno(x); maisUmaTentativa(x); oQueNarrar(x); travaODeclarar(x);
    }
    guardarTurno({ conteudo: "[COMBATE — RESOLVIDO PELO SISTEMA] x", histBase: null, persAtual: null, motivo: null, quando: null, anterior: null });
  } catch (e) { estourou = String(e && e.message); }
  t(`nenhuma entrada torta estoura em lugar nenhum${estourou ? " — " + estourou : ""}`, !estourou);

  /* e a resposta é HONESTA, não só silenciosa */
  t("sem envelope não há turno guardado — registro oco trancaria a porta e perderia a chave",
    guardarTurno({ conteudo: "" }) === SEM_GUARDADO && guardarTurno(null) === SEM_GUARDADO && guardarTurno({}) === SEM_GUARDADO);
  t("sem guardado, nada a narrar", oQueNarrar(null) === "" && oQueNarrar({}) === "");
  t("`quando` torto vira 0 em vez de inventar um relógio",
    guardarTurno({ conteudo: "[COMBATE — RESOLVIDO] x", quando: NaN }).quando === 0
    && guardarTurno({ conteudo: "[COMBATE — RESOLVIDO] x", quando: Infinity }).quando === 0);

  /* CONGELADO: mutar à mão falha alto em vez de corromper em silêncio */
  const g = guardarTurno({ conteudo: "[COMBATE — RESOLVIDO PELO SISTEMA] x", motivo: "HTTP 500", quando: QUANDO });
  t("o registro vem congelado", Object.isFrozen(g) && Object.isFrozen(g.silencio));
  try { g.tentativas = 99; } catch { /* em módulo ES, o modo estrito lança — e lançar é o ponto */ }
  try { g.conteudo = "outra coisa"; } catch { /* idem */ }
  t("`guardado.tentativas++` à mão NÃO altera o registro", g.tentativas === 0);
  t("nem o envelope", g.conteudo === "[COMBATE — RESOLVIDO PELO SISTEMA] x");
  t("`maisUmaTentativa` devolve estrutura NOVA, e a velha fica intacta",
    maisUmaTentativa(g) !== g && maisUmaTentativa(g).tentativas === 1 && g.tentativas === 0);

  /* o congelamento é RASO de propósito: `histBase` e `persAtual` são do
     App, e este módulo não manda no que é dos outros */
  const hist = [{ autor: "jogador", texto: "oi" }];
  const comHist = guardarTurno({ conteudo: "[COMBATE — RESOLVIDO] x", histBase: hist, quando: 0 });
  hist.push({ autor: "jogador", texto: "depois" });
  t("a lista entra por cópia rasa: mexer na de fora não mexe na guardada", comHist.histBase.length === 1);
  t("e as mensagens continuam sendo do App, não congeladas aqui", !Object.isFrozen(comHist.histBase[0]));

  /* ZERO ALEATORIEDADE: a mesma entrada, duas vezes, o mesmo resultado */
  const a1 = guardarTurno({ conteudo: "[COMBATE — RESOLVIDO PELO SISTEMA] igual", motivo: "HTTP 429", quando: QUANDO });
  const a2 = guardarTurno({ conteudo: "[COMBATE — RESOLVIDO PELO SISTEMA] igual", motivo: "HTTP 429", quando: QUANDO });
  t("duas chamadas iguais dão o mesmo registro, campo por campo", JSON.stringify(a1) === JSON.stringify(a2));
  t("e é estrutura nova a cada chamada", a1 !== a2);
  t("a marca é determinística, e o acento pesa nela",
    marcaDoTurno("á") === marcaDoTurno("á") && marcaDoTurno("á") !== marcaDoTurno("a"));
  t("marca de texto vazio ainda tem a forma completa (8 dígitos, nunca encolhe)",
    /^[0-9a-f]{8}-0$/.test(marcaDoTurno("")) && marcaDoTurno("") === marcaDoTurno(null));

  /* os números da impressão são os da especificação FNV-1a, e estão na
     TABELA — a primeira lei não abre exceção para número de algoritmo */
  t("a impressão é o FNV-1a canônico de 32 bits",
    IMPRESSAO_FNV.base === 2166136261 && IMPRESSAO_FNV.primo === 16777619 && IMPRESSAO_FNV.digitos === 8);
  t("e a marca é reproduzida pela tabela, não por números soltos no código", (() => {
    const txt = "[COMBATE — RESOLVIDO PELO SISTEMA] conferência";
    let h = IMPRESSAO_FNV.base >>> 0;
    for (let i = 0; i < txt.length; i++) {
      const c = txt.charCodeAt(i);
      h = Math.imul(h ^ (c & 0xff), IMPRESSAO_FNV.primo) >>> 0;
      h = Math.imul(h ^ ((c >>> 8) & 0xff), IMPRESSAO_FNV.primo) >>> 0;
    }
    return marcaDoTurno(txt) === h.toString(16).padStart(IMPRESSAO_FNV.digitos, "0") + "-" + txt.length;
  })());
  /* textos diferentes, marcas diferentes: é disso que a prova depende */
  const amostras = ["a", "b", "ab", "ba", "[COMBATE — RESOLVIDO] 1", "[COMBATE — RESOLVIDO] 2", ""];
  t("marcas distintas para textos distintos", new Set(amostras.map(marcaDoTurno)).size === amostras.length);
}

sec("8. A VOZ É DE MUNDO — o sistema não fala de si mesmo");
{
  /* Toda linha `casa` SOBE PARA A TELA: é a única coisa que o jogador lê
     quando o Mestre cala. Então nenhuma pode dizer o nome do mecanismo —
     e nenhuma pode estar vazia, porque silêncio sem frase é pior que
     frase genérica. */
  const PROIBIDAS = [
    "erro", "servidor", "api", "provedor", "rede", "http", "429", "402", "500", "502",
    "token", "timeout", "narrador", "guardado", "sistema", "chave", "json", "fetch",
    "request", "status", "codigo", "conexao", "internet", "servico", "modelo",
    "credito", "limite", "cota", "tentativa", "retry", "cache", "app", "bug", "falha",
  ];
  const semAcento = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const sujas = [], vazias = [];
  for (const m of MOTIVOS_DO_SILENCIO) {
    if (!m.casa || !String(m.casa).trim()) { vazias.push(m.id); continue; }
    const n = semAcento(m.casa);
    for (const p of PROIBIDAS) if (new RegExp("\\b" + p + "\\b").test(n)) sujas.push(`${m.id}: "${p}"`);
  }
  t(`nenhuma das ${MOTIVOS_DO_SILENCIO.length} frases diz o nome do mecanismo${sujas.length ? " — " + sujas.join("; ") : ""}`, sujas.length === 0);
  t(`e nenhuma está vazia${vazias.length ? " — " + vazias.join("; ") : ""}`, vazias.length === 0);

  /* e são frases de MUNDO mesmo: falam do Mestre, da mesa, da porta, da
     estrada — não de uma máquina que tossiu */
  t("todas falam da cena, e nenhuma é um rótulo de estado",
    MOTIVOS_DO_SILENCIO.every((m) => m.casa.length > 20 && /[.!?…]$/.test(m.casa.trim())));
  t("as sete frases são distintas — classe sem frase própria é classe que não diz nada",
    new Set(MOTIVOS_DO_SILENCIO.map((m) => m.casa)).size === MOTIVOS_DO_SILENCIO.length);

  /* `casa` é DADO, não tela: sem cor, sem markup, sem instrução de botão.
     Quem decide como mostrar é o App. */
  t("`casa` é texto puro: sem markup, sem emoji de estado, sem \"clique\"",
    MOTIVOS_DO_SILENCIO.every((m) => !/[<>{}]|https?:|clique|bot[ãa]o|tente novamente/i.test(m.casa)));

  /* e a linha que a tela lê de verdade vem daqui: o App imprime
     `falha.casa`, e o padrão de vazio é a frase do desconhecido */
  t("o App imprime a voz de mundo, com a frase do desconhecido como fundo",
    /falha\.casa \|\| lerOSilencio\(null\)\.casa/.test(APP));
  t("e a frase de fundo existe mesmo", !!lerOSilencio(null).casa && lerOSilencio(null).id === "desconhecido");

  /* o TÉCNICO, ao contrário, é intocado — e é o outro lado da mesma lei:
     o jogador não lê a máquina, mas quem investiga precisa dela inteira */
  const cru = 'Todos os provedores falharam — deepseek (deepseek-chat: 402: {"error":{"message":"Insufficient Balance"}}) · gemini (gemini-2.5-flash: 503)';
  t("o técnico volta inteiro, sem cortar, sem aparar, sem mascarar", lerOSilencio(cru).tecnico === cru);
  t("e a classificação não o edita nem de leve", lerOSilencio(cru).tecnico.length === cru.length);

  pendente("frases de mundo medidas", MOTIVOS_DO_SILENCIO.map((m) => m.id).join(", "));
}

console.log(`\nguardado (X3): ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
