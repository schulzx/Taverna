/* A SALA DE DOIS (v9.120)

   O que esta suíte defende é a fronteira entre as três peças, porque é
   dela que depende a mesa poder mudar de meio de transporte sem mudar de
   regra: `sala.js` sabe o que é um turno a duas mãos e não sabe o que é
   rede; `transporte.js` sabe levar objetos e não sabe o que é um turno; e
   o App costura os dois no estado que já existia.

   A prova mais importante daqui é a da ORDEM. Uma mesa em que o turno sai
   na primeira ação é dois jogos de um jogador se revezando — o que faz
   dela uma mesa é o segundo poder responder ao primeiro dentro do MESMO
   turno. */

const S = "../src/";
const A = await import(S + "sala.js");
const T = await import(S + "transporte.js");
const { readFileSync } = await import("node:fs");
const APP = readFileSync("../src/App.jsx", "utf8");

let ok = 0, mau = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mau++; console.log("  XX  " + nome + (extra ? ` — ${extra}` : "")); }
};
const sec = (s) => console.log(`\n${s}`);

sec("1. o código: dito em voz alta, e nunca corrigido em silêncio");
{
  const vistos = new Set();
  for (let i = 0; i < 500; i++) vistos.add(A.novoCodigo());
  t("todo código gerado é válido", [...vistos].every(A.codigoValido));
  t("e eles não se repetem à toa", vistos.size > 480, `${vistos.size}/500`);
  /* o alfabeto não tem O, 0, 1, I, 5 nem S: um código que se confunde ao
     ser lido em voz alta é um código que não serve para o que ele é */
  t("sem as letras que se confundem falando", !/[O01I5S]/.test(A.ALFABETO_DO_CODIGO));
  t("aceita minúsculo, espaço e hífen", A.normalizarCodigo(" a-w n g n8 ") === "AWNGN8");
  /* E NÃO CORRIGE LETRA. A primeira versão trocava O por Q "para ajudar":
     uma troca silenciosa transforma um erro de digitação num código VÁLIDO
     e errado, e o jogador entra numa sala que não é a do amigo. */
  t("o que não é do alfabeto some, não vira outra letra", A.normalizarCodigo("QOQOQO") === "QQQ");
  t("e um código incompleto é recusado", !A.codigoValido(A.normalizarCodigo("QOQOQO")));
  t("lixo não vira código", !A.codigoValido("") && !A.codigoValido(null) && !A.codigoValido("ABC"));
}

sec("2. as cadeiras");
{
  const s0 = A.criarSala({ anfitriao: "p1", nome: "Ana" });
  t("quem cria a sala já senta nela", A.assentoDe(s0, "p1") === 0 && s0.anfitriao === "p1");
  t("e a sala nasce com o número de lugares fixo", s0.lugares.length === A.LUGARES);
  const r1 = A.sentarNaSala(s0, { id: "p2", nome: "Bia" });
  t("o segundo senta na cadeira seguinte", r1.ok && r1.assento === 1);
  const r2 = A.sentarNaSala(r1.sala, { id: "p3", nome: "Caio" });
  t("o terceiro não entra", !r2.ok && /cheia/.test(r2.motivo));
  /* IDEMPOTENTE PELO ID: recarregar a página não custa a cadeira de
     ninguém, e é o que faz um F5 no meio do jogo não quebrar a mesa. */
  const r3 = A.sentarNaSala(r1.sala, { id: "p2", nome: "Bia" });
  t("reentrar não abre cadeira nova", r3.ok && r3.assento === 1 && A.ocupados(r3.sala).length === 2);
  t("quem sai libera o lugar", A.ocupados(A.sairDaSala(r1.sala, "p2")).length === 1);
  t("e o lugar dele continua sendo o 2", A.sairDaSala(r1.sala, "p2").lugares[0].id === "p1");
  t("sem identificação, ninguém senta", !A.sentarNaSala(s0, { id: "" }).ok);
}

sec("3. as fichas, e quando a aventura pode começar");
{
  let s = A.sentarNaSala(A.criarSala({ anfitriao: "p1" }), { id: "p2" }).sala;
  t("com a sala cheia e sem ficha, ninguém começa", !A.todosProntos(s));
  s = A.sentarFicha(s, "p1", { nome: "Íris Vantel", nivel: 1 });
  t("uma ficha só não basta", !A.todosProntos(s));
  t("e o nome da cadeira passa a ser o do personagem", s.lugares[0].nome === "Íris Vantel");
  s = A.sentarFicha(s, "p2", { nome: "Kael", nivel: 1 });
  t("com as duas, a aventura pode começar", A.todosProntos(s));
  /* uma sala pela metade nunca começa: os dois precisam estar juntos, que é
     o que permite o save ficar nos dois aparelhos sem banco de dados */
  t("uma cadeira vazia impede o começo", !A.todosProntos(A.sairDaSala(s, "p2")));
  t("ficha de quem não está na sala é ignorada", A.sentarFicha(s, "p9", { nome: "X" }).lugares.every((l) => l.nome !== "X"));
}

sec("4. A ORDEM — o que faz disto uma mesa e não um revezamento");
{
  let s = A.sentarNaSala(A.criarSala({ anfitriao: "p1" }), { id: "p2" }).sala;
  s = A.sentarFicha(s, "p1", { nome: "Íris" });
  s = A.sentarFicha(s, "p2", { nome: "Kael" });
  t("no começo, o turno não sai", !A.turnoCompleto(s));
  s = A.porAcao(s, "p1", "subo a escada com a lanterna");
  t("com uma ação, o turno ainda não sai", !A.turnoCompleto(s));
  /* v9.124: quem diz DE QUEM se espera é a faixa da vez, linha por linha,
     com o texto de quem já escreveu. `quemFalta` saiu da fonte por isso. */
  t("e a ação de quem escreveu fica guardada", A.acaoDe(s, "p1") === "subo a escada com a lanterna");
  s = A.porAcao(s, "p2", "seguro a porta enquanto ela sobe");
  t("com as duas, o turno sai", A.turnoCompleto(s));
  const txt = A.textoDoTurno(s);
  /* o rótulo com o nome é o que permite ao Narrador saber de quem é cada
     corpo: sem ele, duas frases em primeira pessoa viram uma pessoa só com
     duas vontades */
  t("o pedido marca as duas cadeiras", /\[JOGADOR 1 — Íris\]/.test(txt) && /\[JOGADOR 2 — Kael\]/.test(txt), txt);
  t("na ordem das cadeiras, sempre", txt.indexOf("JOGADOR 1") < txt.indexOf("JOGADOR 2"));
  t("e as duas ações inteiras vão junto", /subo a escada/.test(txt) && /seguro a porta/.test(txt));
  const limpa = A.limparTurno(s);
  t("depois de sair, o turno se esvazia", !A.turnoCompleto(limpa) && !A.acaoDe(limpa, "p1") && !A.acaoDe(limpa, "p2"));
  t("e o contador anda", limpa.turno.numero === s.turno.numero + 1);
  /* escrever de novo antes de o turno sair TROCA a ação: quem se arrependeu
     não fica preso ao que digitou primeiro */
  const trocou = A.porAcao(A.porAcao(limpa, "p1", "primeiro"), "p1", "pensando melhor, espero");
  t("dá para trocar a própria ação antes de o turno sair", A.acaoDe(trocou, "p1") === "pensando melhor, espero");
  t("ação vazia não conta", A.acaoDe(A.porAcao(limpa, "p1", "   "), "p1") === "");
  t("quem não está na sala não age", A.acaoDe(A.porAcao(limpa, "p9", "eu ataco"), "p9") === "");
}

sec("5. o que o Mestre recebe — e só quando há dois de verdade");
{
  let s = A.criarSala({ anfitriao: "p1" });
  s = A.sentarFicha(s, "p1", { nome: "Íris" });
  t("com um jogador só, o envelope não existe", A.envelopeDaSala(s) === "");
  s = A.sentarNaSala(s, { id: "p2" }).sala;
  s = A.sentarFicha(s, "p2", { nome: "Kael" });
  const env = A.envelopeDaSala(s);
  t("com dois, ele nomeia os dois", /Íris/.test(env) && /Kael/.test(env));
  t("e diz que os dois estão no mesmo grupo", /mesmo grupo/.test(env));
  t("proíbe decidir por um deles", /não decida por nenhum deles/.test(env));
  t("e proíbe fazer um agir sem o jogador dele", /não faça um agir sem que o jogador dele tenha escrito/.test(env));
  t("o bloco fixo é curto — ele sobe em todo turno", A.SALA_PROMPT.length < 320, String(A.SALA_PROMPT.length));
  t("e guarda a regra que precisa ser lembrada sempre", /NUNCA decida por um deles/.test(A.SALA_PROMPT));
}

sec("6. o protocolo, e o transporte que não sabe de nada");
{
  t("todo recado tem tipo e remetente", A.recadoValido({ tipo: A.RECADOS.ola, de: "p2" }));
  t("recado sem remetente não vale", !A.recadoValido({ tipo: A.RECADOS.ola }));
  t("tipo inventado não vale", !A.recadoValido({ tipo: "sei_la", de: "p2" }));
  t("os seis recados estão enumerados", Object.keys(A.RECADOS).length === 6);
  /* fora do navegador o canal EXISTE e é mudo. Devolver null obrigaria todo
     chamador a testar, e um deles ia esquecer — é A REDE dos acervos. */
  const c = T.abrirCanal("PROVA1", { aoReceber: () => {} });
  t("sem navegador, o canal existe e é mudo", c.estado().tipo === "mudo" && c.enviar({}) === false);
  t("e fechar um canal mudo não quebra", (c.fechar(), true));
  t("ids de participante não se repetem", new Set(Array.from({ length: 200 }, () => T.novoIdDeParticipante())).size === 200);
  /* o save inteiro passa dos 80 KB; o teto existe para o mundo não sumir em
     silêncio quando não couber */
  t("o que cabe, cabe", T.cabeNoFio({ a: "x".repeat(1000) }));
  t("o que não cabe é recusado antes de sair", !T.cabeNoFio({ a: "x".repeat(T.TETO_DO_RECADO + 10) }));
  t("carga circular não derruba o teste", !T.cabeNoFio((() => { const o = {}; o.o = o; return o; })()));
}

sec("7. a costura no App");
{
  /* Provas sobre a FONTE: a ligação mora no App e nenhuma delas sobrevive a
     alguém religar o caminho de um jogador só por engano. */
  t("a ação numa sala espera a outra", /NUMA SALA, A AÇÃO ESPERA A OUTRA/.test(APP));
  t("o convidado manda a ação pelo fio", /mandarRecado\(RECADOS\.acao/.test(APP));
  t("o anfitrião junta as duas e dispara", /dispararTurnoDaSala/.test(APP) && /textoDoTurno\(s\)/.test(APP));
  t("e o turno só sai completo", /if \(!turnoCompleto\(s\)\) return false;/.test(APP));
  t("o mundo atravessa a cada save", /publicarEstado\(dados\)/.test(APP));
  t("o convidado veste o save pela porta que já existia", /continuar\(false, \{ silencioso: true \}\)/.test(APP));
  /* e os avisos que são da FICHA não caem na tela de quem não é dono dela */
  t("o despertar do outro não estoura na tela do convidado", /if \(!silencioso\) setTimeout\(\(\) => checarDespertar/.test(APP));
  t("o personagem do outro jogador entra no GRUPO", /deJogador: true, dono: outro\.id/.test(APP));
  t("com ficha de companheiro de verdade", /garantirFichaCompanheiro\(\{[\s\S]{0,80}\.\.\.outro\.ficha/.test(APP));
  t("e o envelope da mesa entra na abertura", /envelopeDaSala\(salaRef\.current\)/.test(APP));
  t("a porta do prompt só abre com duas cadeiras ocupadas", /emSala: ocupadosDaSala\(salaRef\.current\)\.length >= LUGARES/.test(APP));
}

sec("8. a abertura da campanha (v9.120)");
{
  t("a abertura tem quatro partes", /ABERTURA DA CAMPANHA/.test(APP) && /1\) O MUNDO/.test(APP) && /4\) O PRIMEIRO FIO/.test(APP));
  t("e o jogador termina a leitura sabendo o que veio fazer", /sabendo o que vim fazer aqui/.test(APP));
  /* a peça mecânica, e é ela que muda o turno: sem forçar, o compasso nasce
     em respiro e a PRIMEIRA cena é a única sem intenção nenhuma na mão */
  t("a trama é forçada na abertura", /talvezDarUmaTrama\(\{ forcar: true \}\)/.test(APP));
  t("e o respiro só é ignorado quando se força", /if \(!forcar && c\.movimento === "respiro"\) return "";/.test(APP));
  t("o sobrenome existe na criação", /placeholder="Sobrenome \(opcional\)"/.test(APP));
  t("e viaja separado do nome inteiro", /primeiroNome: nome\.trim\(\), sobrenome: sobrenome\.trim\(\)/.test(APP));
}

sec("9. o fio que atravessa a internet (v9.121)");
{
  /* O canal do NAVEGADOR e o canal da REDE ficam abertos juntos, e o mesmo
     recado chega pelos dois. Entregar duas vezes faria o anfitrião contar a
     ação do convidado em dobro — quem desempata é o carimbo, e ele é
     compartilhado pelos dois caminhos. */
  t("o transporte anuncia a rota da sala", T.ROTA_DA_SALA === "/api/sala");
  t("e o intervalo da espia some ao lado da chamada do Mestre", T.INTERVALO_DA_ESPIA <= 3000 && T.INTERVALO_DA_ESPIA >= 1000);
  /* insistir de dois em dois segundos contra um servidor fora do ar não
     conserta nada — a espera cresce até um teto */
  t("e a espera tem teto quando o outro lado não responde", T.ESPERA_MAXIMA > T.INTERVALO_DA_ESPIA && T.ESPERA_MAXIMA <= 60000);
  const c = T.abrirCanal("PROVA9", { aoReceber: () => {} });
  /* fora do navegador os dois canais existem e não fazem nada: um `null`
     obrigaria todo chamador a testar, e um deles ia esquecer */
  t("o estado do canal é uma FUNÇÃO, porque a resposta muda", typeof c.estado === "function");
  t("sem navegador, ele diz que está mudo", c.estado().tipo === "mudo");
  t("e não inventa falha que não houve", c.estado().falha === "");
  c.fechar();
  t("sem `aoReceber`, o canal não quebra", (() => { const x = T.abrirCanal("PROVA9B"); x.fechar(); return true; })());

  /* A ROTA. Provas sobre a fonte: ela roda na Vercel e não neste processo. */
  const ROTA = readFileSync("../api/sala.js", "utf8");
  t("o token fica no ambiente, nunca no navegador", /process\.env\.KV_REST_API_TOKEN/.test(ROTA) && !/gQAAAAAA/.test(ROTA));
  t("e ela aceita os dois pares de nomes que a Vercel usa", /UPSTASH_REDIS_REST_URL/.test(ROTA) && /KV_REST_API_URL/.test(ROTA));
  /* DUAS CHAVES: o mundo passa dos 80 KB e a pergunta "mudou alguma coisa?"
     é feita a cada dois segundos. Se ele andasse na fila, o convidado estaria
     puxando 80 KB para ouvir "não". */
  t("a fila guarda recados pequenos", /sala:\$\{cod\}:fila/.test(ROTA) && /RPUSH/.test(ROTA));
  t("e o mundo mora numa chave que se sobrescreve", /sala:\$\{cod\}:mundo/.test(ROTA) && /"SET", kMundo/.test(ROTA));
  t("a fila não cresce para sempre", /LTRIM/.test(ROTA));
  t("e uma sala esquecida some sozinha", /EXPIRE/.test(ROTA) && /VIDA_DA_SALA/.test(ROTA));
  /* um mundo que não cabe precisa falhar FALANDO: um turno que some em
     silêncio é o pior defeito possível numa mesa de dois */
  t("o mundo grande demais é recusado com o tamanho na mensagem", /o mundo tem \$\{Math\.round/.test(ROTA));
  t("e a falta de credencial diz ONDE está o problema", /faltam KV_REST_API_URL/.test(ROTA));
  /* A prova é sobre o CÓDIGO, não sobre a prosa: a primeira versão procurava
     a palavra "cadeira" e batia no comentário que explica justamente que a
     rota não sabe o que é uma cadeira. O que importa é que ela não importe
     regra nenhuma do jogo — uma segunda cópia da regra aqui seria a segunda
     verdade que o anfitrião único existe para evitar. */
  t("a rota não importa nada do jogo", !/from ["'][^"']*src\//.test(ROTA) && !/require\(/.test(ROTA));
  t("e recusa código de sala malformado", /CODIGO\.test\(cod\)/.test(ROTA));

  /* O MUNDO É PARTIDO E REMONTADO PELO FIO, e é por isso que `sala.js` e o
     App continuam sem saber que ele foi partido. */
  const TR = readFileSync("../src/transporte.js", "utf8");
  t("quem envia parte o save do recado", /const \{ save, \.\.\.leve \} = r \|\| \{\};/.test(TR));
  t("na fila anda só um ponteiro", /__mundo: true/.test(TR));
  t("e quem recebe remonta antes de entregar", /entregar\(\{ \.\.\.r, __mundo: undefined, save: m\.mundo \}\)/.test(TR));
  /* o defeito que a primeira versão tinha: adiantar o índice ao publicar
     pulava o que o outro tinha publicado no meio-tempo — a ação dele */
  t("publicar NÃO adianta o índice de leitura", /NÃO adianta `desde` aqui/.test(TR));
  t("os dois canais compartilham o carimbo", /O DEDUPE É COMPARTILHADO/.test(TR));
}

sec("10. os dois defeitos da primeira sala de verdade (v9.122)");
{
  /* A TELA TRAVOU COM AS DUAS FICHAS PRONTAS.

     O começo estava pendurado num caminho só — o anfitrião apertando
     "Começar aventura" —, e ali ele perguntava se estava todo mundo pronto.
     Quando a segunda ficha chega DEPOIS, pelo fio, ninguém refazia a
     pergunta. É a regra da casa outra vez: toda regra que mora num só de
     dois caminhos vira bug.

     A prova é dos DOIS caminhos, e é de propósito: um só deles verde foi
     exatamente o estado que travou a sala. */
  t("o caminho do botão pergunta se está todo mundo pronto", /if \(todosProntos\(nova\)\) iniciar\(pers\);/.test(APP));
  t("e o caminho do FIO também pergunta", /if \(todosProntos\(nova\) && faseRef\.current !== "jogo"\)/.test(APP));
  t("a ficha que chega pelo fio abre a aventura com a MINHA ficha", /nova\.lugares\.find\(\(l\) => l && l\.id === euRef\.current\) \|\| \{\}\)\.ficha/.test(APP));
  /* e não abre duas vezes: se o jogo já começou, a pergunta não se refaz */
  t("e não reabre uma campanha que já começou", /faseRef\.current !== "jogo"/.test(APP));

  /* O LÉXICO NÃO CHEGAVA NO CONVIDADO.

     A leitura do mundo é assíncrona e demora — é o que a tela de criação diz
     enquanto o jogador monta a ficha. O anfitrião publicava a sala no instante
     em que o mundo era criado, ANTES de o léxico existir, e nada republicava
     depois: o convidado escolhia raça e classe com os nomes genéricos, no
     único momento em que isso se vê. */
  t("o léxico republica a sala quando fica pronto", /E O CONVIDADO PRECISA SABER/.test(APP));
  t("e só o anfitrião publica", /if \(salaRef\.current && souAnfitriaoRef\.current\) \{\s*try \{ publicarSala\(\)/.test(APP));
  /* a outra metade do mesmo defeito: o convidado recusava o mundo novo */
  t("o convidado aceita o mundo NOVO, não só o primeiro", /o mundo do anfitrião ganha SEMPRE/.test(APP) && !/if \(r\.mundo && !mundoRef\.current\)/.test(APP));

  /* E A TELA NÃO PODE MENTIR ENQUANTO ISSO. Com as duas fichas marcadas como
     prontas logo acima, a frase dizia "esperando a do outro jogador". */
  t("a tela sabe quando não falta ninguém", /const todasAsFichas = cheia && lugares\.every\(\(l\) => l && l\.ficha\);/.test(APP));
  t("e para de dizer que espera quem já chegou", /\(lugares\[meuAssento\] \|\| \{\}\)\.ficha && !todasAsFichas/.test(APP));
  t("o convidado também recebe uma frase que corresponde", /o anfitrião está abrindo a aventura/.test(APP));

  /* O LEITOR DO CANAL NÃO PODE ENVELHECER. Ele fica aberto a sessão inteira e
     guardava a função de UM render; enquanto ela só mexia em refs, ninguém
     via. `iniciar` lê estado de verdade — a partir dele, a função velha
     abriria a campanha com o mundo de antes. */
  t("o canal chama um ponteiro, não uma função guardada", /aoReceber: \(r\) => aoReceberRef\.current\(r\)/.test(APP));
  t("e o ponteiro se atualiza a cada render", /useEffect\(\(\) => \{ aoReceberRef\.current = aoReceberRecado; \}\);/.test(APP));
}

sec("11. a sala nova nao herda o mundo da anterior (v9.123)");
{
  /* Achado jogando: abrir a SEGUNDA sala pulava a criação do mundo e caía
     direto na ficha. `mundo` e `nomeCampanha` são estado do componente e
     sobrevivem à volta ao menu — e a tela decidia o próximo passo
     perguntando se eles existiam. Existiam: eram os da sala anterior. A sala
     nova nascia com o mundo E o léxico da antiga, e o convidado receberia
     esse mundo como se fosse o combinado. */
  t("existe um lugar só que esquece o mundo", /const esquecerOMundo = \(\) => \{/.test(APP));
  t("criar sala esquece o mundo anterior", /souAnfitriaoRef\.current = true;\s*esquecerOMundo\(\);/.test(APP));
  t("e entrar numa sala também", /souAnfitriaoRef\.current = false;\s*\/\* e o convidado também esquece/.test(APP));

  /* O DEFEITO DE DESENHO POR TRÁS: um botão só, adivinhando para onde ir a
     partir de um estado que podia mentir. Dois botões, duas ações. */
  t("o botão do mundo vai para o mundo, sem adivinhar", /aoCriarMundo=\{\(\) => setFase\("mundo"\)\}/.test(APP));
  t("e o da ficha vai para a ficha", /aoMontarFicha=\{\(\) => setFase\("personagem"\)\}/.test(APP));
  t("ninguém mais infere o passo pelo estado", !/setFase\(mundo && nomeCampanha \? "personagem" : "mundo"\)/.test(APP));
}

sec("12. o convidado espera a leitura do mundo (v9.123)");
{
  /* A leitura leva quase um minuto, e é ela que dá nome à raça e ao ofício
     deste lugar. O convidado caía na ficha antes dela e escolhia entre
     "Humano, Elfo, Anão" num mundo de caçadores de espíritos. */
  t("a sala publicada conta se o mundo está sendo lido", /lendo: !!lexicoLendoRef\.current/.test(APP));
  t("e o convidado só monta a ficha quando a leitura acaba", /if \(r\.mundo && !r\.lendo && faseRef\.current === "sala"/.test(APP));
  t("a tela da sala mostra a leitura acontecendo", /📖 Lendo o mundo…/.test(APP));
  /* uma espera que não termina seria pior do que o mundo genérico: quando a
     leitura FALHA, o anfitrião também avisa, e o convidado entra assim mesmo */
  t("desistir da leitura também avisa a sala", /desistiParaASala/.test(APP));
  t("e o sucesso avisa", /lexicoParaASala/.test(APP));
}

sec("13. a vez a vista (v9.124)");
{
  /* A ordem fixa existe para o segundo poder responder ao primeiro DENTRO do
     mesmo turno. Só que o que o outro escreveu só aparecia quando os DOIS já
     tinham fechado: a afordância existia no prompt e não existia na tela, e
     sem ela a ordem não servia para nada. */
  t("existe uma faixa do que já foi escrito neste turno", /A VEZ, À VISTA/.test(APP) && /const vezDaSala = \(\) =>|const vezDaSala = \(\(\) =>/.test(APP));
  t("ela mostra o TEXTO de quem escreveu, lido pela porta do módulo", /escreveu: !!acaoDe\(m, l\.id\), texto: acaoDe\(m, l\.id\)/.test(APP));
  t("e diz quem ainda não escreveu", /ainda escrevendo…/.test(APP));
  /* fora de uma sala, e antes da primeira ação, ela não existe: duas linhas
     de "ainda escrevendo…" ocupariam a tela para não informar nada */
  t("não aparece fora de uma sala", /if \(!m \|\| !m\.lugares\) return null;/.test(APP));
  t("nem com uma cadeira só", /if \(ocupadas\.length < 2\) return null;/.test(APP));
  t("nem antes de alguém escrever", /if \(!Object\.keys\(acoes\)\.length\) return null;/.test(APP));
  /* ela é intenção, não fato: o que está escrito ainda pode ser trocado, e
     por isso mora acima da caixa e não no log */
  t("diz que dá para reescrever até o turno sair", /Dá para reescrever a sua até lá/.test(APP));
  /* e o log parou de repetir o que a faixa diz melhor */
  /* a prova mede o CÓDIGO, não a prosa: o comentário que explica a remoção
     cita a frase removida, e a primeira versão desta linha batia nele. */
  t("o log não recebe mais recibo de quem escreveu", !/pushMsgs\(\[\{ autor: "sistema", texto: `✍/.test(APP));

  /* O CONVIDADO NÃO TEM `carregando`: quem chama o Mestre é o anfitrião. */
  t("o convidado sabe que o turno saiu", /o Mestre está tecendo o turno/.test(APP));
  t("e isso acende quando o número do turno anda com as ações vazias", /if \(t\.numero > turnoVistoRef\.current\)/.test(APP));
  t("e apaga quando a narração chega", /setOMestreTecendo\(false\);/.test(APP));
}

console.log(`\nsala v9.120: ${ok} passaram, ${mau} falharam`);
process.exit(mau ? 1 : 0);
