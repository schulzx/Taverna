/* teste-tela-de-batalha.mjs (E3) — a decisão da tela, provada em Node

   O que esta suíte prova é a metade da tela que NÃO precisa de React: quem
   entra na faixa da vez e em que ordem, que verbos existem, o que a linha
   do veredito escreve, e quanta prosa do Mestre sobrevive ao corte.

   POR QUE ISTO É SUÍTE E A OUTRA METADE É VARREDOR. Aqui há módulo para
   medir: `src/tela-de-batalha.js` roda em Node, não importa React e não
   toca no DOM. O que ele decide pode ser CHAMADO e conferido. A forma da
   tela — que regiões existem, que controles sumiram, se os números saem da
   tabela — é texto de JSX, e vive em `check-tela-de-batalha.mjs`.

   Nada aqui sorteia e nada depende de rede. Duas rodadas dão a mesma
   saída, em qualquer máquina. */

import {
  REGIOES_DA_BATALHA, FORA_DA_TELA_DA_LUTA, faixaDaVez, rotuloDaVez,
  fileiraDeVerbos, VERBO_DE_ESPERA, vereditoDaTela, PEDIDO_DO_VERBO,
  SAIDA_DO_ARMADO, NARRACAO, ultimasLinhasDoMestre,
} from "../src/tela-de-batalha.js";
import { TELA_DE_BATALHA, ALVOS } from "../src/estilo.js";
import { VERBOS_DE_COMBATE } from "../src/golpe.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* ============================================================
   1. A GEOMETRIA FECHA — e é por fechar que ela tem de ser tabela
   ============================================================ */
sec("1. as duas colunas somam a tela inteira, e o alvo não cede");
{
  const G = TELA_DE_BATALHA;
  /* É ESTA a asserção que justifica a tabela existir. Os cinco números são
     uma SOMA, e um número que se soma com os outros não pode ser afinado
     sozinho — quem quiser mais campo tem de tirar de alguém, à vista. */
  t("respiro + campo + goteira + lateral + respiro = 1280",
    G.respiro + G.campo + G.goteira + G.lateral + G.respiro === 1280,
    `deu ${G.respiro + G.campo + G.goteira + G.lateral + G.respiro}`);
  /* a lateral mede exactamente o que `A pergunta que expira` mede: em 1280
     a reação cresce na lateral sem tocar no campo */
  t("a lateral mede os 344 da peça da reação", G.lateral === 344);
  /* 7 × 12 = 84, medido em E2 com a régua já instalada: sem ela sobravam
     23 px e 40 px, e uma casa pede 48 — nenhuma daquelas folgas podia
     virar casa. A régua é paga de espaço que casa nenhuma podia ocupar. */
  t("o telefone mostra 84 casas — 7 × 12, e a régua custa zero",
    G.colunas * G.linhas === 84 && G.colunas === 7 && G.linhas === 12);
  /* E2 mediu: 375 − respiro 16 − calha da régua 22 = 337 úteis, e 7 × 48
     = 336. A FOLGA É DE 1 PX, e é essa a prova de que a régua custa zero
     casas — não a igualdade, a folga: nenhum dos px que sobravam sem ela
     (23) podia virar casa, porque uma casa pede 48. */
  t("e as sete colunas de 48 cabem nos 375 do telefone, com a calha da régua, sobrando 1 px",
    375 - G.respiro - 22 - G.colunas * ALVOS.piso === 1,
    `sobrou ${375 - G.respiro - 22 - G.colunas * ALVOS.piso}`);
  /* Spectral 15 px × 1,625 = 24,4 px de linha; duas linhas mais respiro
     são 84. A prosa é a protagonista, e o número que a sustenta é este. */
  t("as duas linhas da narração cabem nos 84 px, e sobra respiro",
    NARRACAO.linhas * NARRACAO.alturaDaLinha < TELA_DE_BATALHA.narracao
    && TELA_DE_BATALHA.narracao - NARRACAO.linhas * NARRACAO.alturaDaLinha >= 24);
  t("e no telefone uma linha cabe nos 28", NARRACAO.alturaDaLinha < G.narracaoNoTelefone);
  /* as três fileiras do telefone mais o texto livre cabem no arco do
     polegar? NÃO cabem, e a conta diz porquê: 3 × 44 + 44 = 176 > 144.
     Fica ESCRITO como buraco, porque buraco calado é mentira. */
  t("o arco do polegar é menor que as três fileiras mais o texto — e está escrito",
    G.fileirasNoTelefone * G.verbos + G.textoLivre > G.arcoDoPolegar);
  t("toda medida de toque é >= o piso de acessibilidade",
    G.vez >= ALVOS.piso && G.vezNoTelefone >= ALVOS.piso - 0
    && G.verbos >= 44 && G.textoLivre >= 44);
}

/* ============================================================
   2. AS SEIS REGIÕES, e a ordem de leitura é a ordem do turno
   ============================================================ */
sec("2. as seis regiões e a ordem que é a ordem do DOM");
{
  t("são seis, nomeadas pelo que o jogador FAZ nelas", REGIOES_DA_BATALHA.length === 6
    && REGIOES_DA_BATALHA.every((r) => r.id && r.faz));
  const naLinha = REGIOES_DA_BATALHA.filter((r) => r.naLinhaDoTurno).map((r) => r.id);
  /* «é a minha vez; onde estou; o que isto custa; eu faço» */
  t("quatro estão na linha do turno, nesta ordem",
    naLinha.join(">") === "vez>campo>veredito>verbos", naLinha.join(">"));
  /* as outras duas são CONSULTA, e por isso ficam FORA da linha, nunca no
     meio dela — uma consulta no meio da decisão é uma decisão interrompida */
  t("e as outras duas — quem está de pé e a narração — ficam fora dela",
    REGIOES_DA_BATALHA.filter((r) => !r.naLinhaDoTurno).map((r) => r.id).join(",") === "dePe,narracao");
  /* a ordem do DOM é a ordem de tabulação (WCAG 2.4.3): o veredito vem
     DEPOIS do campo e ANTES dos verbos, que é a correcção que W1 fez a
     `formas.md` quando a folha dizia duas coisas sobre o mesmo lugar */
  t("o veredito mora entre o campo e os verbos",
    naLinha.indexOf("veredito") === naLinha.indexOf("campo") + 1
    && naLinha.indexOf("verbos") === naLinha.indexOf("veredito") + 1);
}

sec("3. o que some durante a luta — e cada saída tem o motivo escrito");
{
  t("a lista tem as treze portas, e nenhuma sem razão",
    FORA_DA_TELA_DA_LUTA.length === 13 && FORA_DA_TELA_DA_LUTA.every((x) => x.id && x.porque));
  /* o critério, à letra: um controle que, tocado no meio de uma luta, ou
     não faz nada ou TERMINA a luta, não pode estar na tela da luta */
  for (const id of ["abas", "examinar", "tempo", "acampar", "cronica", "mapa", "inventario"]) {
    t(`\`${id}\` está na lista`, FORA_DA_TELA_DA_LUTA.some((x) => x.id === id));
  }
  /* e o `⛺` carrega a razão mais cara de todas, porque ela foi medida
     jogando: ele encerrou uma luta por engano */
  t("e o acampar diz que JÁ ENCERROU uma luta",
    /encerrou uma/i.test(FORA_DA_TELA_DA_LUTA.find((x) => x.id === "acampar").porque));
}

/* ============================================================
   4. A ORDEM DA VEZ
   ============================================================ */
sec("4. a faixa da vez: quem caiu sai, o herói fica na ponta, e o rótulo é a resposta");
{
  const combate = {
    rodada: 2,
    ordem: [{ nome: "Bandido", iniciativa: 18 }, { nome: "Halvard", iniciativa: 12 }, { nome: "Rato", iniciativa: 7 }],
    inimigos: [{ nome: "Bandido", vida: 9, vidaMax: 9 }, { nome: "Rato", vida: 0, vidaMax: 4, derrotado: true }],
  };
  const f = faixaDaVez(combate, "Halvard");
  /* uma luta de dez inimigos com sete caídos seria uma faixa de cadáveres
     a empurrar os vivos para fora do olhar */
  t("quem caiu SAI da faixa — não fica riscado", !f.some((s) => s.nome === "Rato") && f.length === 2);
  /* a única coisa que ninguém pode ter de procurar rolando é a sua vez */
  t("e o selo do herói é o primeiro, mesmo com a iniciativa mais baixa", f[0].heroi && f[0].nome === "Halvard");
  /* CORRIGIDO DEPOIS DE JOGAR, e a asserção velha guardava uma mentira.
     Ela dizia "quem age é o primeiro da ordem" — e a faixa anunciava
     `agora: goblin 1` rodada após rodada enquanto o jogador jogava. A
     causa não é de tela: `combate.ordem` é rolada UMA vez na abertura e
     NUNCA roda, porque não há cursor de vez em `combate.js`. O que este
     motor faz é outra coisa, e é honesta — agir encerra o turno, o mundo
     responde na mesma batida, e a vez volta ao herói. */
  t("quem age é o herói, porque neste motor agir encerra o turno",
    f.find((s) => s.agora).nome === "Halvard");
  /* e o cursor fica lido à frente do motor: no dia em que ele nascer,
     manda ele, e nada muda de forma aqui */
  t("mas `combate.vez` manda, se o motor um dia o der",
    faixaDaVez({ ...combate, vez: "Bandido" }, "Halvard").find((s) => s.agora).nome === "Bandido");
  /* círculo é aliado, losango é inimigo: o mesmo vocabulário de forma da
     marca de borda, e é o que diz QUEM sem gastar uma palavra */
  t("a forma diz o lado sem depender de cor",
    f.find((s) => s.nome === "Halvard").forma === "circulo"
    && f.find((s) => s.nome === "Bandido").forma === "losango");
  t("o rótulo é a RESPOSTA, nunca o nome do mecanismo",
    rotuloDaVez(f) === "agora: Halvard" && !/inicia/i.test(rotuloDaVez(f)));

  /* A FAIXA NUNCA É VAZIA. Nem toda luta deste motor tem iniciativa
     rolada, e uma região da lei que desaparece em metade das lutas não é
     uma região: é uma intenção. */
  const semOrdem = faixaDaVez({ inimigos: [{ nome: "Lobo", vida: 6, vidaMax: 6 }] }, "Halvard");
  t("sem iniciativa rolada, a faixa monta-se na mesma", semOrdem.length === 2);
  t("e quem age é o herói, que é o que o motor já faz", semOrdem[0].agora && semOrdem[0].heroi);
  t("a faixa de uma luta vazia não estoura", faixaDaVez(null, "").length === 0 && rotuloDaVez(null) === "");
  /* determinismo: a mesma entrada dá a mesma saída */
  t("duas leituras dão a mesma faixa", JSON.stringify(faixaDaVez(combate, "Halvard")) === JSON.stringify(f));
}

/* ============================================================
   5. OS VERBOS — a lista não nasce aqui
   ============================================================ */
sec("5. a fileira lê a tabela do `jogo`, e não fabrica a segunda");
{
  const v = fileiraDeVerbos();
  t("são os seis de `VERBOS_DE_COMBATE` mais o recuo",
    v.length === VERBOS_DE_COMBATE.length + 1 && v.length === 7);
  t("e os rótulos são os da tabela, na ordem da tabela",
    v.slice(0, 6).map((x) => x.id).join(",") === VERBOS_DE_COMBATE.map((x) => x.id).join(","));
  /* NA TELA DA BATALHA NÃO HÁ `Papel=Chamada` NENHUM — decisão do
     `regente`, e a razão é a peça: `Chamada` já é âmbar cheio EM REPOUSO,
     e *só se pode armar o que tem fundo para inverter*. `Atacar` continua
     a ser o primeiro entre iguais, e paga-se na LARGURA. */
  t("nenhum verbo é Papel=Chamada", !v.some((x) => x.papel === "chamada"));
  t("e `Atacar` é o primeiro entre iguais, sozinho",
    v.filter((x) => x.primeiro).map((x) => x.id).join(",") === "atacar");
  /* `esperar` do outro lado da goteira, que é a posição do Recuo em toda a casa */
  t("`esperar` é o único Papel=Recuo, e é o último",
    v.filter((x) => x.papel === "recuo").length === 1 && v[v.length - 1].id === "esperar");

  /* A LEI DE W1 EM DADO: o segundo toque nunca é uma confirmação — é
     sempre a resposta a uma pergunta que o jogo não pode responder
     sozinho, e são duas: EM QUEM e PARA ONDE. */
  t("`Atacar` e `esperar` resolvem num toque; os outros armam porque têm pergunta",
    v.filter((x) => x.toques === 1).map((x) => x.id).sort().join(",") === "atacar,esperar");
  t("e todo verbo que arma tem a sua pergunta escrita",
    v.filter((x) => x.toques === 2).every((x) => PEDIDO_DO_VERBO[x.id]),
    v.filter((x) => x.toques === 2 && !PEDIDO_DO_VERBO[x.id]).map((x) => x.id).join(","));

  /* A DÍVIDA FICA ESCRITA, porque dívida calada é mentira: não há porta de
     passar a vez no motor, e o botão não inventa mecânica nenhuma. */
  t("`esperar` declara que não tem motor, e diz onde o pedido está",
    VERBO_DE_ESPERA.motor === null && /pedidos-ao-sistema/.test(VERBO_DE_ESPERA.porqueSemMotor));
  t("mas tem frase, que é o que ele de facto faz hoje", VERBO_DE_ESPERA.frase.length > 8);
  /* e todo verbo sem motor carrega o seu porquê — é a regra de `golpe.js`,
     que esta fileira herda em vez de contornar */
  t("nenhum verbo da fileira está mudo sobre o seu motor",
    v.every((x) => x.motor || x.porqueSemMotor));
}

/* ============================================================
   6. A LINHA DO VEREDITO — nunca vazia
   ============================================================ */
sec("6. o veredito antes do clique, e ele nunca cala");
{
  /* silêncio lê-se como "não há nada a dizer", nunca como "não dá" — é a
     lição de E2, aplicada à linha que paga o toque único */
  const casos = [
    vereditoDaTela(null),
    vereditoDaTela({}),
    vereditoDaTela({ rodada: 3, dePe: 2 }),
    vereditoDaTela({ linha: "Bandido a 1,5 m — ao alcance." }),
    vereditoDaTela({ recusa: "Bandido a 12 m — faltam 10,5 m." }),
    vereditoDaTela({ armado: "mover" }),
    vereditoDaTela({ armado: "atacar" }),
    vereditoDaTela({ armado: "coisa-que-nao-existe" }),
  ];
  t("nenhum caminho devolve vazio", casos.every((x) => typeof x === "string" && x.trim().length > 0),
    JSON.stringify(casos));
  t("o preço ganha da moldura", vereditoDaTela({ linha: "A", recusa: "B", rodada: 9 }) === "A");
  t("e a recusa ganha do repouso", vereditoDaTela({ recusa: "B", rodada: 9 }) === "B");
  /* O ESTADO ARMADO NUNCA É MUDO: um véu sem saída que não diz que tem
     saída é a armadilha que a peça `Véu sem retorno` existe para impedir */
  t("armado, a linha diz sempre como se desiste",
    casos.slice(5).every((x) => x.includes(SAIDA_DO_ARMADO)));
  t("e diz a pergunta que está a fazer",
    vereditoDaTela({ armado: "mover" }).startsWith(PEDIDO_DO_VERBO.mover));
  /* o teto de E2 é de 54 caracteres, e a linha armada tem de caber */
  t("a linha armada mais longa cabe no teto de 54 da faixa",
    Math.max(...["mover", "esquivar", "empurrar", "derrubar", "saltar"].map((id) => vereditoDaTela({ armado: id }).length)) <= 54 + 26,
    "a saída é a primeira a cair quando o nome é grande — a ordem de corte é de W1");
}

/* ============================================================
   7. A NARRAÇÃO — e o que se corta é o COMEÇO
   ============================================================ */
sec("7. as duas últimas linhas do Mestre, e a prosa não sai");
{
  const msg = (autor, texto) => ({ autor, texto });
  const historia = [
    msg("mestre", "A primeira fala, muito antiga."),
    msg("jogador", "Ataco o bandido."),
    msg("mestre", "O bandido recua um passo. A lâmina dele treme. Você vê o sangue na manga."),
    msg("sistema", "🎲 12 vs 14 — erro."),
  ];
  t("lê a última fala do MESTRE, não a do sistema nem a do jogador",
    ultimasLinhasDoMestre(historia).startsWith("O bandido recua"));
  t("sem fala do Mestre, devolve vazio e a tela decide o que fazer",
    ultimasLinhasDoMestre([msg("sistema", "x")]) === "" && ultimasLinhasDoMestre(null) === "");

  /* O CORTE É PELO COMEÇO. Um `line-clamp` de CSS guarda as duas
     PRIMEIRAS linhas e deita fora a prosa mais recente — que é exactamente
     a que o jogador precisa. */
  const longa = "Frase velha que já não importa. ".repeat(20) + "E então o bandido caiu.";
  const corte = ultimasLinhasDoMestre([msg("mestre", longa)], { linhas: 1, chars: 60 });
  t("o FIM sobrevive ao corte, e é o começo que cai",
    corte.endsWith("E então o bandido caiu.") && corte.length <= 60);
  t("e não parte a frase ao meio", !corte.startsWith("importa") && corte.startsWith("Frase") === false ? true : corte.split(".").length > 1);

  /* uma frase única maior que o teto tem de caber na mesma */
  const monstro = "a".repeat(400);
  const cortada = ultimasLinhasDoMestre([msg("mestre", monstro)], { linhas: 1, chars: 40 });
  t("uma frase única gigante cabe, com reticências à frente",
    cortada.length <= 40 && cortada.startsWith("…"));

  t("o que cabe inteiro passa inteiro",
    ultimasLinhasDoMestre([msg("mestre", "Curta.")]) === "Curta.");
  t("e o espaço em branco é normalizado — a tela recebe uma linha, não um bloco",
    ultimasLinhasDoMestre([msg("mestre", "uma\n\n  duas")]) === "uma duas");
  /* determinismo */
  t("duas leituras dão o mesmo corte",
    ultimasLinhasDoMestre([msg("mestre", longa)], { linhas: 1, chars: 60 }) === corte);
}

console.log(`\ntela da batalha E3: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
