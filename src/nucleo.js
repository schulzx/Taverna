/* ============================================================
   O NÚCLEO (Fase MM-C, etapa C1) — as quatro a seis pessoas que importam

   A 6.ª sessão de prova subiu onde havia GENTE COM VOZ (~3,8) e caiu onde
   havia sistema sem gente (~2,6). O elenco (MM8b) já dava vinte e quatro
   pessoas que o mundo conhece de fora — nome, ofício, cidade, índole, os
   laços entre elas. Faltava o que o Matt tem de quatro ou cinco delas e o
   nosso Mestre não tinha de ninguém: O QUE QUEREM PARA SI, o que temem por
   dentro, o que escondem, o que carregam, a linha que não cruzam e COMO
   FALAM. É isto o núcleo: a gente que o sistema conhece por dentro, e cuja
   história pessoal se toca com a do herói e com a das outras.

   A especificação é do `jogo`, `mente/coracao-c1-c2.md` §1 (as tabelas
   estão transcritas aqui tal como lá; é delas que o jogo vive).

   NINGUÉM É GENTE NOVA. O núcleo escolhe-se do que já existe, pela ordem
   de `PAPEIS_DO_NUCLEO`:
     1. o COMPANHEIRO — o primeiro do grupo (o de antes, `companheiro-
        inicial.js`, ou o primeiro convidado);
     2. o VILÃO — o antagonista do fio (`espinha.fio`, saga.js);
     3. o ELO — o antecedente do herói com rosto: uma pessoa do elenco da
        cidade do ato 0 que carrega o gémeo do objeto do herói e esconde a
        verdade da reviravolta (`REVIRAVOLTA_DO_ATO0`, batidas.js);
     4. a VOZ — a pessoa da primeira batida `procurar` do ato 0;
     5. a BALANÇA — a gente do relógio do fio (quem está a ser comprado);
     6. a PORTA — alguém de quem o herói pode gostar, se o quiser.
   Um papel por pessoa; quem já tem papel não leva outro.

   AS QUATRO REGRAS QUE IMPEDEM O GENÉRICO (§1.2):
     1. nenhum campo repete categoria — o `quer` e o `teme` com categorias
        todas diferentes; o `esconde` e o `carrega` (quatro gravidades e
        três tipos para até seis pessoas) com ids todos diferentes e as
        categorias espalhadas o mais que dá;
     2. a índole filtra: cada entrada traz `briga` (traços com que não
        casa), o mesmo mecanismo de `TRACOS.briga` — e o vilão escapa ao
        filtro só na LINHA, que é o que o torna lembrado;
     3. cada pessoa aponta para outra do núcleo pela TEIA (o vilão
        também);
     4. o elo carrega sempre um pedaço do que está em jogo para o herói.

   ---------------- O QUE ESTE MÓDULO NÃO FAZ ----------------
   · Não guarda a ficha: deriva-se da semente, da espinha, do elenco e do
     grupo, como o elenco. O que se guarda é só o ARCO de cada pessoa (o
     campo `coracao` do save, §2.7) — que batidas aconteceram e que lado se
     escolheu —, e esse campo é NOVO e ignorado pela versão antiga.
   · Não escreve no registo, não cria gente, não muda número de combate.
   · Não decide romance: a porta só existe.
   · Não faz as batidas (pedido, crise, escolha): isso é a C2. Daqui ela
     lê o núcleo, as pistas do elo e a regra das revelações.

   O QUE CHEGA AO NARRADOR, daqui: a linha QUEM É (secção `quemE` da
   pauta, ≤ 130 caracteres), só de quem está em cena, em frase fechada, e
   nunca o segredo — nem o nome de nada disto.
   ============================================================ */

import { rngDe } from "./geografia.js";
import { elencoDoMundo } from "./elenco.js";
import { indoleDe } from "./indole.js";
import { antecedenteDe, EM_JOGO, REVIRAVOLTA_DO_ATO0, RELOGIO_DO_FIO } from "./batidas.js";
import { FIO } from "./saga.js";
import { ANTECEDENTES } from "./antecedentes.js";
import { LIGACOES_AO_PASSADO } from "./companheiro-inicial.js";
import { sexoDoNome } from "./nomes.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const arr = (x) => (Array.isArray(x) ? x : []);
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const primeiro = (s) => norm(s).split(/[\s,]+/)[0] || "";
const encher = (tpl, v) => String(tpl || "").replace(/\{(\w+)\}/g, (m, k) => (v[k] == null || v[k] === "" ? m : String(v[k])));

/* ============================================================
   AS TABELAS
   ============================================================ */

/* §1.1 — quem entra, e por que ordem. `fonte` diz de onde a pessoa sai. */
export const PAPEIS_DO_NUCLEO = [
  { ordem: 1, id: "companheiro", fonte: "o primeiro do grupo (o companheiro de antes, ou o primeiro convidado)", obrigatorio: false, porque: "é o único sempre em cena — o que mais pesa na média das personagens" },
  { ordem: 2, id: "vilao", fonte: "o antagonista do fio da espinha", obrigatorio: true, porque: "o vilão é uma pessoa, e a ficha dá-lhe o que mostrar em cada tamanho" },
  { ordem: 3, id: "elo", fonte: "elenco (doArco, recorrente), da cidade do ato 0, vivo, sem nome de marco", obrigatorio: true, porque: "é o antecedente com rosto, e guarda a reviravolta do ato 0" },
  { ordem: 4, id: "voz", fonte: "a pessoa da primeira batida procurar do ato 0", obrigatorio: true, porque: "é quem o jogador conhece primeiro por causa da história" },
  { ordem: 5, id: "balanca", fonte: "a gente do relógio do fio no ato 0 ou 1", obrigatorio: false, porque: "quem está a ser comprado pela sombra, e pode cair para um lado ou para o outro" },
  { ordem: 6, id: "porta", fonte: "elenco da cidade do ato 0 ou 1, de propósito ou traço que se abre", obrigatorio: false, porque: "o romance possível, que só abre se o jogador o abrir" },
];

/* quantas pessoas, no mínimo e no máximo */
export const NUCLEO = { min: 4, max: 6 };

/* ---------------- §1.3.1 QUER — 20 entradas, 5 categorias ---------------- */
export const QUER = [
  { id: "q_nome_limpo", cat: "reparar", o: "limpar o nome que a cidade lhe sujou", briga: [] },
  { id: "q_devolver", cat: "reparar", o: "devolver uma coisa que tirou a quem já não a pode receber", briga: ["cruel"] },
  { id: "q_pazes_irmao", cat: "reparar", o: "fazer as pazes com um irmão antes que um dos dois morra", briga: ["rancoroso"] },
  { id: "q_reconstruir", cat: "reparar", o: "reerguer o que ardeu — a oficina, a casa, o nome do pai", briga: [] },
  { id: "q_teto", cat: "ganhar", o: "ter um teto seu, com uma porta que tranque por dentro", briga: [] },
  { id: "q_cadeira", cat: "ganhar", o: "sentar-se na cadeira de quem o humilhou", briga: ["humilde"] },
  { id: "q_mestria", cat: "ganhar", o: "ser chamado mestre por quem lho negou", briga: [] },
  { id: "q_partir", cat: "ganhar", o: "juntar o bastante para partir e nunca mais voltar", briga: ["fiel"] },
  { id: "q_crianca", cat: "proteger", o: "ver uma criança crescer longe disto", briga: ["cruel"] },
  { id: "q_aldeia", cat: "proteger", o: "que a aldeia onde nasceu passe o inverno", briga: [] },
  { id: "q_segredo_outro", cat: "proteger", o: "guardar o segredo de {outro} até ao fim", briga: ["tagarela"] },
  { id: "q_amor_vivo", cat: "proteger", o: "manter vivo quem ama, custe o que custar", briga: ["frio"] },
  { id: "q_divida_fim", cat: "libertar", o: "pagar a última prestação de uma dívida que herdou", briga: [] },
  { id: "q_juramento", cat: "libertar", o: "ver-se livre de um juramento que fez novo demais", briga: [] },
  { id: "q_comprar", cat: "libertar", o: "comprar a liberdade de alguém", briga: ["ganancioso"] },
  { id: "q_esquecer", cat: "libertar", o: "esquecer uma noite — e não consegue", briga: [] },
  { id: "q_quem_matou", cat: "saber", o: "saber quem matou alguém que amava", briga: [] },
  { id: "q_origem", cat: "saber", o: "saber se o nome que usa é o seu", briga: [] },
  { id: "q_quem_partiu", cat: "saber", o: "achar alguém que partiu sem dizer para onde", briga: [] },
  { id: "q_razao_guerra", cat: "saber", o: "saber se a guerra em que lutou tinha razão", briga: [] },
];

/* Uma fonte só: quando a índole já diz o desejo, a ficha lê-o. Os
   propósitos SOBRE O HERÓI (trair, apaixonar, seguir…) não estão aqui:
   são o que a pessoa quer DO herói, e convivem com o `quer` — é a tensão
   que dá drama. */
export const QUER_DO_PROPOSITO = {
  recuperar_nome: "q_nome_limpo",
  redimir: "q_devolver",
  provar_ao_pai: "q_mestria",
  esconder_filho: "q_crianca",
  comprar_liberdade: "q_comprar",
  encontrar_quem_partiu: "q_quem_partiu",
  guardar_tumulo: "q_quem_matou",
  nao_ser_esquecido: "q_reconstruir",
};

/* ---------------- §1.3.2 TEME — o medo de dentro ----------------
   O do corpo já é `MEDOS` (indole.js). Este traz o SINAL (o que o
   Narrador mostra em vez de dizer) e o que o ACORDA (a condição que a C2
   liga a sinais que já existem). */
export const TEME = [
  { id: "t_deixado", cat: "perder", o: "ser deixado para trás outra vez", sinal: "pergunta duas vezes por onde o grupo vai", acorda: "o herói fala em partir, separar, ir só", briga: [] },
  { id: "t_ver_morrer", cat: "perder", o: "ver morrer quem protege", sinal: "põe-se entre o ferido e a porta", acorda: "aliado a um quarto dos PV, ou a zero", briga: [] },
  { id: "t_esquecer_rosto", cat: "perder", o: "esquecer a cara de quem perdeu", sinal: "pede que lhe descrevam pessoas que não conhece", acorda: "um retrato, um rosto, um nome do passado", briga: [] },
  { id: "t_descoberto", cat: "ser visto", o: "que se saiba o que fez", sinal: "muda de assunto quando se fala de antes", acorda: "Intuição bem-sucedida sobre ela", briga: [] },
  { id: "t_olhar_heroi", cat: "ser visto", o: "que o herói o veja como ele se vê", sinal: "conta as suas proezas antes que lhe perguntem", acorda: "o herói elogia outro", briga: [] },
  { id: "t_cobarde", cat: "ser visto", o: "ser chamado cobarde em voz alta", sinal: "aceita desafios que devia recusar", acorda: "ameaça, desafio, insulto em público", briga: [] },
  { id: "t_pai", cat: "tornar-se", o: "tornar-se o pai", sinal: "interrompe-se a meio de uma frase dura", acorda: "ordem dada a gritar; castigo", briga: [] },
  { id: "t_voltar_matar", cat: "tornar-se", o: "voltar a matar", sinal: "demora a desembainhar, e depois não para", acorda: "combate começa", briga: [] },
  { id: "t_gostar_poder", cat: "tornar-se", o: "gostar de mandar", sinal: "recusa a cadeira da cabeceira", acorda: "oferta de comando, título, ouro grande", briga: [] },
  { id: "t_nada_feito", cat: "o que vem", o: "morrer sem nada que se lembre", sinal: "escreve o nome em sítios", acorda: "perigo de morte; a palavra lembrar", briga: [] },
  { id: "t_guerra_volta", cat: "o que vem", o: "que a guerra volte", sinal: "conta soldados quando entra numa praça", acorda: "gente armada em número", briga: [] },
  { id: "t_divida_filhos", cat: "o que vem", o: "que a dívida passe aos filhos", sinal: "conta moedas duas vezes", acorda: "preço, cobrança, credor", briga: [] },
  { id: "t_velho_so", cat: "sozinho", o: "envelhecer sozinho", sinal: "fica para o fim da refeição", acorda: "o herói vai dormir; despedida", briga: [] },
  { id: "t_ninguem_vem", cat: "sozinho", o: "que ninguém venha quando chamar", sinal: "responde a qualquer chamado, mesmo de estranhos", acorda: "um grito; um pedido de ajuda", briga: [] },
  { id: "t_deuses_nao", cat: "fé", o: "que os deuses não existam", sinal: "reza mais alto quando corre mal", acorda: "templo; morte; milagre que falha", briga: [] },
  { id: "t_deuses_viram", cat: "fé", o: "que existam, e o tenham visto", sinal: "não entra em templos", acorda: "templo; sacerdote; juramento", briga: [] },
  { id: "t_saber_verdade", cat: "verdade", o: "descobrir que tudo o que fez foi para nada", sinal: "evita perguntas sobre o porquê", acorda: "revelação, segredo achado", briga: [] },
  { id: "t_ser_usado", cat: "verdade", o: "ser só uma peça no jogo de alguém", sinal: "desconfia de favores", acorda: "presente, favor, oferta sem razão", briga: [] },
];

/* ---------------- §1.3.3 ESCONDE — 20 segredos, 4 gravidades ----------------
   Cada um com DUAS pistas (as formas de `FORMAS_DE_SEMENTE`, promessas.js),
   o que muda quando se revela, e `sombra`: se pode ligar ao antagonista —
   os únicos que podem ser reviravolta. `semente` é a forma do Livro de
   Promessas que a pista já tem, quando tem. */
export const ESCONDE = [
  { id: "e_fugiu", grav: "vergonha", o: "fugiu de uma luta e deixou morrer quem ficou", pistas: [{ forma: "fala", o: "\"eu nunca corro\" — sem ninguém perguntar", semente: "negacao_nao_pedida" }, { forma: "objeto", o: "uma medalha com o nome de outro" }], revela: "pede ao herói uma luta de que não deve fugir", sombra: false },
  { id: "e_nao_le", grav: "vergonha", o: "não sabe ler, e finge há vinte anos", pistas: [{ forma: "comportamento", o: "pede que lhe leiam, \"que a vista já não ajuda\"" }, { forma: "objeto", o: "segura uma carta ao contrário" }], revela: "a carta que levava há anos diz outra coisa", sombra: false },
  { id: "e_titulo", grav: "vergonha", o: "o título que usa foi comprado", pistas: [{ forma: "fala", o: "erra o nome do avô que diz ter tido" }, { forma: "documento", o: "o selo novo num pergaminho velho" }], revela: "perde a porta que o título abria — ou o herói a guarda", sombra: false },
  { id: "e_ama_proibido", grav: "vergonha", o: "ama alguém da casa inimiga", pistas: [{ forma: "ausencia", o: "some todo o fim de tarde" }, { forma: "objeto", o: "uma fita da cor da outra casa" }], revela: "", arco: "a_amor_proibido", sombra: false },
  { id: "e_jogo", grav: "vergonha", o: "perdeu ao jogo o dote da irmã", pistas: [{ forma: "fala", o: "sabe o preço de cada mesa de dados da cidade" }, { forma: "cenario", o: "um credor que o cumprimenta demais" }], revela: "", arco: "a_divida_volta", sombra: false },
  { id: "e_matou", grav: "crime", o: "matou um homem, e outro foi enforcado por isso", pistas: [{ forma: "comportamento", o: "não passa pela forca da praça" }, { forma: "documento", o: "o nome do enforcado no registo, sublinhado" }], revela: "a família do enforcado ainda vive em {cidade}", sombra: false },
  { id: "e_templo", grav: "crime", o: "roubou do templo o cálice que agora o sustenta", pistas: [{ forma: "comportamento", o: "não reza onde há altar" }, { forma: "objeto", o: "prata de templo vendida ao peso" }], revela: "um sacerdote reconhece a prata", sombra: false },
  { id: "e_selos", grav: "crime", o: "falsifica selos — e um deles abriu uma porta que não devia", pistas: [{ forma: "fala", o: "sabe de que cera é cada selo da cidade" }, { forma: "objeto", o: "um carimbo de cobre no fundo da bolsa" }], revela: "a porta que abriu era de {sombra}", sombra: true },
  { id: "e_carga", grav: "crime", o: "a carga que guarda não é o que diz", pistas: [{ forma: "cenario", o: "os cães não passam pelo armazém dele" }, { forma: "objeto", o: "um saco rasgado com pó que não é sal" }], revela: "quem compra a carga é gente de {sombra}", sombra: true },
  { id: "e_desertor", grav: "crime", o: "é desertor, e o regimento ainda o procura", pistas: [{ forma: "fala", o: "sabe toques de corneta de cor" }, { forma: "objeto", o: "o distintivo com o número raspado" }], revela: "o regimento chega a {cidade}", sombra: false },
  { id: "e_paga_sombra", grav: "lealdade", o: "recebe dinheiro de {sombra} desde antes de conhecer o herói", pistas: [{ forma: "fala", o: "sabe o que o herói fez ontem, longe" }, { forma: "objeto", o: "moeda estrangeira, nova, no bolso", semente: "moeda_estrangeira" }], revela: "", arco: "a_revelacao", sombra: true },
  { id: "e_vendeu_nome", grav: "lealdade", o: "deu o nome do herói a quem o procurava", pistas: [{ forma: "fala", o: "\"soube que te saíste bem na estrada\"", semente: "elogio_que_vigia" }, { forma: "documento", o: "o nome do herói escrito na letra dele" }], revela: "", arco: "a_revelacao", sombra: true },
  { id: "e_irmao_lado", grav: "lealdade", o: "tem um irmão a servir {sombra}, e manda-lhe notícias", pistas: [{ forma: "ausencia", o: "falta a um encontro sem razão" }, { forma: "objeto", o: "uma carta por mandar, sem nome" }], revela: "", arco: "a_irmao_do_outro_lado", sombra: true },
  { id: "e_vigiar", grav: "lealdade", o: "foi mandado vigiar o herói — e já não sabe por quem o faz", pistas: [{ forma: "comportamento", o: "está sempre onde o herói vai, um dia antes" }, { forma: "documento", o: "uma lista dos sítios do herói" }], revela: "perdão possível", arco: "a_revelacao", sombra: true },
  { id: "e_sabe_onde", grav: "lealdade", o: "sabe onde {sombra} se esconde, e cala-o por medo", pistas: [{ forma: "fala", o: "corrige o herói sobre um caminho que nunca andou" }, { forma: "cenario", o: "evita um bairro inteiro" }], revela: "dá o caminho — a que preço", sombra: true },
  { id: "e_nome_morto", grav: "identidade", o: "o nome que usa é de um morto", pistas: [{ forma: "fala", o: "não responde à primeira quando o chamam" }, { forma: "documento", o: "a campa com o nome dele, numa aldeia" }], revela: "", arco: "a_nome_falso", sombra: false },
  { id: "e_sangue", grav: "identidade", o: "é do sangue de quem o herói procura", pistas: [{ forma: "fala", o: "diz uma alcunha de família que não devia saber" }, { forma: "objeto", o: "um objeto gémeo de um do herói" }], revela: "a reviravolta do órfão", sombra: true },
  { id: "e_dado_morto", grav: "identidade", o: "foi dado como morto, e há quem o chore em {cidade}", pistas: [{ forma: "ausencia", o: "não vai a {cidade}, mesmo quando é o caminho" }, { forma: "cenario", o: "uma cova recente sem nome", semente: "cova_sem_nome" }], revela: "quem o chora ainda espera", sombra: false },
  { id: "e_outra_fe", grav: "identidade", o: "serve um deus que aqui se queima", pistas: [{ forma: "fala", o: "reza com um nome trocado" }, { forma: "objeto", o: "um símbolo cosido por dentro da manga" }], revela: "o templo da cidade procura-o", sombra: false },
  { id: "e_marcado", grav: "identidade", o: "foi dos de {sombra}, e traz a marca: {assinatura}", pistas: [{ forma: "comportamento", o: "nunca arregaça a manga" }, { forma: "objeto", o: "{assinatura} gravada por baixo de um cinto" }], revela: "", arco: "a_revelacao", sombra: true },
];

/* QUEM PODE TER O QUÊ, no esconde (§1.3.3). Decisão desta etapa (a
   leitura mais simples, registada no diário): SÓ O ELO e a MÁSCARA DO
   ALIADO levam segredo com `sombra: true` — são as duas únicas revelações
   da campanha, e assim "nunca duas no mesmo ato" é uma regra de duas
   pessoas, não de seis. A voz e a porta levam vergonha ou identidade. */
export const ESCONDE_POR_PAPEL = {
  voz: ["vergonha", "identidade"],
  porta: ["vergonha", "identidade"],
};
/* o segredo do companheiro quando a reviravolta eleita é a máscara do
   aliado (`aliado_agente`, reviravoltas.js) e o alvo é ele */
export const ESCONDE_DA_MASCARA = "e_paga_sombra";

/* ---------------- §1.3.4 CARREGA — uma coisa, de um tipo ----------------
   O objeto vê-se na primeira cena; a dívida e a culpa saem-lhe da boca. */
export const CARREGA = {
  objeto: [
    { id: "c_carta", o: "uma carta lacrada que nunca entregou" },
    { id: "c_anel", o: "um anel de noivado de alguém que morreu" },
    { id: "c_chave", o: "a chave de uma casa que já não existe" },
    { id: "c_lamina_partida", o: "a lâmina partida do pai, sem cabo" },
    { id: "c_dente", o: "um dente de leite numa bolsinha de couro" },
    { id: "c_livro_riscado", o: "um livro com o nome riscado na guarda" },
    { id: "c_mapa_canto", o: "um mapa a que falta um canto, rasgado à mão" },
    { id: "c_moeda_furada", o: "uma moeda furada, ao pescoço" },
    { id: "c_lenco", o: "o lenço de quem partiu, que já não cheira a nada" },
    { id: "c_veneno", o: "um frasco de veneno que nunca usou" },
    { id: "c_sino", o: "um sino de cabra da aldeia que ardeu" },
    { id: "c_distintivo", o: "o distintivo de um regimento que já não existe" },
    { id: "c_retrato", o: "um retrato a carvão de uma criança" },
    { id: "c_corda_nos", o: "uma corda com treze nós — um por cada dia que lhe resta para pagar" },
    { id: "c_pedra", o: "uma pedra da soleira da casa da mãe" },
    { id: "c_tabua", o: "uma tábua de oração com o nome de outra pessoa" },
  ],
  divida: [
    { id: "d_vida", o: "deve a vida a {outro}, e {outro} nunca lha cobrou" },
    { id: "d_agiota", o: "deve três anos de ganho a um agiota de {cidade}" },
    { id: "d_guilda", o: "deve um favor à guilda, e o favor ainda não tem nome" },
    { id: "d_moribundo", o: "prometeu a um moribundo levar uma coisa a alguém" },
    { id: "d_casamento", o: "deu a palavra de casar, e partiu antes" },
    { id: "d_corpo", o: "deve um corpo a uma família: não trouxe o morto para casa" },
    { id: "d_voto", o: "deve um ano de serviço a um templo" },
    { id: "d_resposta", o: "deve uma resposta a uma carta com dez anos" },
    { id: "d_cancao", o: "deve uma canção a um morto, e ainda não a acabou" },
    /* só o companheiro credor (ao contrário: é o herói que lhe deve) ou a voz */
    { id: "d_heroi", o: "deve ao herói, e detesta dever", aoContrario: "o herói deve-lhe, e não deixa que o esqueça", cabe: ["companheiro", "voz"] },
  ],
  culpa: [
    { id: "u_tarde", o: "chegou tarde ao incêndio" },
    { id: "u_irmao_lugar", o: "mandou o irmão no seu lugar" },
    { id: "u_calou", o: "calou quando devia ter falado, e alguém pagou" },
    { id: "u_ordem", o: "deu a ordem que matou os que confiavam nele" },
    { id: "u_riso", o: "riu-se num funeral, e toda a aldeia viu" },
    { id: "u_acusou", o: "acusou a pessoa errada" },
    { id: "u_mae", o: "partiu sem se despedir da mãe, que morreu nessa semana" },
    { id: "u_curou", o: "curou o homem errado, e esse homem matou depois" },
    { id: "u_deixou", o: "deixou alguém para trás numa estrada de neve" },
    { id: "u_vendeu", o: "vendeu o que não era seu, e o dono ainda o procura" },
  ],
};

/* ---------------- §1.3.5 LINHA — o que não faz, e o verbo que proíbe ----------------
   O verbo é do vocabulário da índole (`nunca`/`puxa` de TRACOS): é o que
   torna a linha conferível na C3. A do vilão sai daqui SEM o filtro
   `briga`: um vilão que poupa crianças é lembrado. (O "um cruel não ganha
   l_crianca" da regra 2 do §1.2 está no `briga` dela.) */
export const LINHA = [
  { id: "l_crianca", o: "não levanta a mão a uma criança, nem por ordem", nunca: "ameaca", contexto: "criança em cena", briga: ["cruel"] },
  { id: "l_ferido", o: "não deixa um ferido para trás", nunca: "recua", contexto: "aliado a 0 PV", briga: ["medroso"] },
  { id: "l_palavra", o: "não quebra a palavra dada, nem ao inimigo", nunca: "entrega", contexto: "promessa no prometido", briga: ["traidor"] },
  { id: "l_templo", o: "não derrama sangue em chão sagrado", nunca: "ameaca", contexto: "templo, capela", briga: [] },
  { id: "l_mentir", o: "não mente ao herói — cala, mas não mente", nunca: "mentir", contexto: "Intuição", briga: [] },
  { id: "l_amigo", o: "não vende um amigo, nem por ouro nem por medo", nunca: "entrega", contexto: "", briga: ["traidor", "ganancioso"] },
  { id: "l_ajoelhar", o: "não se ajoelha diante de quem tem coroa", nunca: "recua", contexto: "autoridade", briga: ["humilde"] },
  { id: "l_veneno", o: "não usa veneno: quem mata, olha nos olhos", nunca: "", contexto: "veneno à mão", briga: [] },
  { id: "l_fogo", o: "não põe fogo a casa com gente dentro", nunca: "", contexto: "incêndio, tocha", briga: ["cruel"] },
  { id: "l_cobrar_filhos", o: "não cobra a dívida de um morto aos filhos", nunca: "cobra", contexto: "dívida, herança", briga: ["ganancioso"] },
  { id: "l_voltar", o: "não volta à cidade onde nasceu", nunca: "", contexto: "o caminho passa lá", briga: [] },
  { id: "l_pobre", o: "não tira a quem tem menos do que ele", nunca: "", contexto: "furto, saque", briga: ["ganancioso"] },
  { id: "l_rendido", o: "não mata quem se rendeu", nunca: "ameaca", contexto: "inimigo rendido", briga: ["cruel"] },
  { id: "l_mae", o: "não jura pelo nome da mãe em vão", nunca: "", contexto: "juramento", briga: [] },
  { id: "l_ordem_cega", o: "não cumpre uma ordem que não entende — já cumpriu uma", nunca: "", contexto: "ordem sem razão", briga: [] },
];

/* ---------------- §1.3.6 COMO FALA — tiques de VOZ, nunca de corpo ----------------
   A 6.ª mediu o gesto a virar muleta ("fica calado, à espera" em 21 de 67
   respostas). A frase não serve a toda a gente — é de alguém. O exemplo
   (≤ 50 caracteres) vai só nas primeiras cenas da pessoa. */
export const COMO_FALA = [
  { id: "f_dias", o: "conta tudo em dias", exemplo: "\"Três dias. É o que ela tem.\"", briga: [] },
  { id: "f_pergunta", o: "responde com outra pergunta", exemplo: "\"E tu, vieste porquê?\"", briga: [] },
  { id: "f_oficio", o: "chama cada um pelo ofício, nunca pelo nome", exemplo: "\"Ó boticária, passa-me isso.\"", briga: [] },
  { id: "f_avo", o: "cita a avó, e cita mal", exemplo: "\"A minha avó dizia: quem cala, come.\"", briga: ["calado"] },
  { id: "f_terceira", o: "fala de si na terceira pessoa", exemplo: "\"O Vando não gosta disto.\"", briga: [] },
  { id: "f_acaba", o: "acaba as frases dos outros", exemplo: "\"…e não voltou. Pois.\"", briga: ["calado"] },
  { id: "f_jura_pequeno", o: "jura por coisas pequenas", exemplo: "\"Pela minha bota esquerda.\"", briga: [] },
  { id: "f_numeros", o: "diz os números exatos", exemplo: "\"Trinta e sete passos até à porta.\"", briga: ["sonhador"] },
  { id: "f_comida", o: "põe comida em toda a metáfora", exemplo: "\"Esse plano ainda está cru.\"", briga: [] },
  { id: "f_nao_e", o: "acaba tudo a pedir razão", exemplo: "\"…não é? Diz que é.\"", briga: [] },
  { id: "f_desculpa", o: "pede desculpa antes de discordar", exemplo: "\"Perdoa. Mas não.\"", briga: ["orgulhoso"] },
  { id: "f_mar", o: "fala como marinheiro em terra firme", exemplo: "\"Amarra isso, que vem vento.\"", briga: [] },
  { id: "f_proverbio", o: "inventa provérbios", exemplo: "\"Lobo que uiva não janta.\"", briga: [] },
  { id: "f_gramatica", o: "corrige a gramática dos outros, até em perigo", exemplo: "\"Fugimos, não fugemos. Corre.\"", briga: [] },
  { id: "f_sem_eu", o: "nunca diz \"eu\"", exemplo: "\"Cá se viu. Cá se cala.\"", briga: ["tagarela"] },
  { id: "f_crianca", o: "trata toda a gente por \"criança\", até velhos", exemplo: "\"Senta-te, criança. Tens sessenta anos.\"", briga: [] },
  { id: "f_alcunha", o: "dá alcunha a cada um na primeira frase", exemplo: "\"Olá, Botas.\"", briga: [] },
  { id: "f_santos", o: "reza a meio da frase a um santo de cada coisa", exemplo: "\"…São Bento das portas, que não range…\"", briga: [] },
  { id: "f_passado", o: "fala de si no passado, como quem já morreu", exemplo: "\"Eu era bom nisto.\"", briga: ["brincalhao"] },
  { id: "f_ri", o: "ri-se antes das más notícias", exemplo: "\"Ha. Morreu.\"", briga: ["compassivo"] },
  { id: "f_preco", o: "pergunta o preço de tudo, até do silêncio", exemplo: "\"Quanto custa isso que não disseste?\"", briga: ["generoso"] },
  { id: "f_curto", o: "três palavras, nunca quatro", exemplo: "\"Não. Amanhã. Sozinho.\"", briga: ["tagarela"] },
];

/* os tiques que viram muleta — vão para o varredor e para o `naoPode`
   da pessoa, nunca para a tabela (o que tem "cheiro" também cai) */
export const TIQUES_PROIBIDOS = ["fica calado à espera", "sem tirar os olhos", "cruza os braços", "tamborila os dedos", "grunhe", "cheiro"];

/* ---------------- §1.4 A TEIA — cada pessoa aponta para outra ----------------
   `laco` é o tipo do registo (`TIPOS_DE_LACO`) quando o fio tem um; `sabe`
   diz quem sabe ("dois", "a" ou "b"). `forcada` só nasce por regra, nunca
   por sorteio. `concorda` (C2, 11/10): de quem é o género que a frase
   flexiona — a C1 dava "Corwin foi noivo(a) de Perrin" ao Narrador. */
export const TEIA_DO_NUCLEO = [
  { id: "t_vida", o: "{a} deve a vida a {b}", laco: "divida", sabe: "dois" },
  { id: "t_noivos", o: "{a} foi noivo(a) de {b}, e ninguém sabe porque acabou", laco: "amor", rompido: true, sabe: "dois", concorda: "a" },
  { id: "t_denunciou", o: "{a} denunciou {b} uma vez, e {b} não sabe", laco: "rivalidade", sabe: "a" },
  { id: "t_ensinou", o: "{a} ensinou {b} a lutar", laco: "aprendizado", sabe: "dois" },
  { id: "t_sangue_calado", o: "{a} e {b} são do mesmo sangue e não o dizem", laco: "familia", sabe: "dois" },
  { id: "t_carta_fechada", o: "{a} guarda uma carta de {b} que nunca abriu", laco: "", sabe: "a" },
  { id: "t_salvou_cobra", o: "{a} salvou {b}, e cobra-o em silêncio", laco: "divida", sabe: "dois" },
  { id: "t_matou_dele", o: "{a} matou alguém de {b}", laco: "rivalidade", sabe: "a" },
  { id: "t_fugiram", o: "{a} e {b} fugiram juntos de um sítio, e contam histórias diferentes", laco: "amizade", sabe: "dois" },
  { id: "t_morto_vivo", o: "{a} julga {b} morto(a)", laco: "amizade", sabe: "b", forcada: true, concorda: "b" },
];

/* ---------------- §1.5 O ELO — o antecedente com rosto ----------------
   `quer` aponta a entrada de QUER cuja categoria ele ocupa (a frase é a da
   tabela do elo, simpática de propósito: o jogador tem de gostar dele
   antes de saber). `gemeo`: o objeto dele é gémeo do item que o
   antecedente dá ao herói (antecedentes.js) — o jogador vê na mão de outro
   a coisa que traz na mochila. `ligacao`: a ligação do companheiro de
   antes que diria a MESMA pessoa (companheiro-inicial.js); quando as duas
   casam, o elo é outra pessoa, e o companheiro julgava-o morto.

   NOTA DO FERREIRO: a tabela do `jogo` dava ao elo "o martelo do pai do
   herói", e o antecedente já põe esse martelo na mochila do herói ("cabeça
   lascada"). Duas pessoas não carregam o mesmo martelo; pela regra do
   gémeo (§1.5), o do elo é o PAR dele. */
export const ELO_DO_ANTECEDENTE = {
  orfao: { quem: "alguém com o nome parecido com o da família", carrega: "uma faca gémea da faca herdada do herói, a mesma marca no cabo", quer: "q_comprar", querDiz: "comprar a sua liberdade a {sombra}", esconde: "é do sangue do herói, e serve {sombra}", gemeo: true, ligacao: "" },
  soldado: { quem: "o terceiro da companhia — outro camarada daquela guerra", carrega: "o distintivo do mesmo regimento", quer: "q_divida_fim", querDiz: "pagar a dívida de jogo que o pôs nas mãos de {sombra}", esconde: "recruta para {sombra}; deu o nome do herói", gemeo: true, ligacao: "armas" },
  nobre_caido: { quem: "o homem de negócios que comprou a dívida da casa", carrega: "o livro de dívidas da família, com a letra do pai do herói", quer: "q_cadeira", querDiz: "sentar-se na cadeira da família", esconde: "cobra em nome de {sombra}", gemeo: false, ligacao: "" },
  erudito: { quem: "o copista que copiou o texto proibido", carrega: "a página que falta, cosida no forro do casaco", quer: "q_esquecer", querDiz: "esquecer o que leu", esconde: "o texto foi escrito para {sombra}; ele sabe porque o copiou", gemeo: true, ligacao: "" },
  ladrao: { quem: "o mestre de recados da guilda", carrega: "uma gazua gémea da gazua de osso do herói", quer: "q_divida_fim", querDiz: "pagar a última prestação à guilda", esconde: "a guilda já vendeu o herói a {sombra}, e é ele quem leva os recados", gemeo: true, ligacao: "" },
  acolito: { quem: "a irmã de votos que ficou", carrega: "o cordão da ordem com os nós dos votos", quer: "q_juramento", querDiz: "ver-se livre do juramento", esconde: "a ordem serve {sombra} e quer o herói de volta", gemeo: true, ligacao: "" },
  pragado: { quem: "o físico que passou pela aldeia na febre", carrega: "um frasco de pó cinzento", quer: "q_aldeia", querDiz: "que a aldeia passe o inverno — por remorso", esconde: "a febre foi a primeira obra de {sombra}, e ele levou-a", gemeo: false, ligacao: "" },
  artista: { quem: "quem ensinou a canção ao herói", carrega: "o caderno com a pauta, e o último verso", quer: "q_mestria", querDiz: "ser chamado mestre", esconde: "servia {sombra}; o último verso é um mapa", gemeo: true, ligacao: "oficio" },
  cacador: { quem: "o antigo parceiro de caça", carrega: "a ordem de caça com o nome do herói, dobrada no cinto", quer: "q_partir", querDiz: "juntar para partir", esconde: "o alvo antigo trabalha para {sombra}, e foi ele quem pôs a recompensa a correr", gemeo: false, ligacao: "armas" },
  ferreiro: { quem: "o aprendiz que ficou na forja quando a tomaram", carrega: "o outro martelo do pai do herói, o par do de cabeça lascada", quer: "q_reconstruir", querDiz: "reerguer a forja", esconde: "a forja foi tomada por ordem de {sombra}, e ele forja para ele agora", gemeo: true, ligacao: "" },
  ex_cultista: { quem: "o irmão de culto que ajudou o herói a sair", carrega: "a máscara do rito, partida ao meio", quer: "q_segredo_outro", querDiz: "guardar o segredo do herói", esconde: "os irmãos querem o herói de volta, e ele é o anzol", gemeo: true, ligacao: "" },
  naufrago: { quem: "o outro sobrevivente do naufrágio", carrega: "a outra metade da bússola, empenada para o mesmo lado", quer: "q_razao_guerra", querDiz: "saber se a culpa do naufrágio foi dele", esconde: "o naufrágio foi obra de {sombra}; ele abriu o porão", gemeo: true, ligacao: "" },
  sem: { quem: "quem pôs o herói no caminho", carrega: "a carta que trouxe o herói, em duplicado", quer: "q_juramento", querDiz: "ser livre de quem o mandou", teme: "t_ser_usado", esconde: "serve {sombra}, e trouxe o herói de propósito", gemeo: false, ligacao: "" },
};

/* §2.5 — as duas pistas do elo: a A ouve-se (fala ou comportamento), a B
   vê-se (objeto), com a assinatura do antagonista sempre que pode — a
   mesma marca que o relógio deixa nas portas. A C2 semeia-as no Livro de
   Promessas; aqui vivem com a ficha, porque são dela. */
export const PISTAS_DO_ELO = {
  orfao: ["usa sem querer a alcunha de infância que só a família do herói dizia", "a faca dele tem a mesma marca no cabo que a faca herdada do herói"],
  soldado: ["trata o herói pelo posto antigo, que ninguém desta terra conhece", "por baixo do esmalte do distintivo, {assinatura} riscada"],
  nobre_caido: ["sabe o nome do criado da casa da família, morto há dez anos", "um recibo com o selo da família do herói e {assinatura} ao lado"],
  erudito: ["cita de cor uma linha do texto proibido — e corrige-se", "{assinatura} no canto das cartas que ele guarda"],
  ladrao: ["faz o sinal de mão da guilda que só os de dentro conhecem", "uma moeda da guilda marcada com {assinatura}"],
  acolito: ["reza a hora da ordem, baixinho, no minuto certo", "o cordão dos votos tem um nó a mais, de outra cor"],
  pragado: ["fala da febre como quem a viu começar: \"começou pelo poço, não foi?\"", "um frasco de pó cinzento com {assinatura} na rolha"],
  artista: ["trauteia a canção do herói com um verso que o herói nunca ouviu", "o caderno da pauta, com {assinatura} no lugar da assinatura"],
  cacador: ["sabe quanto vale a cabeça do herói, ao cobre", "a ordem de caça no cinto, com {assinatura} no lacre"],
  ferreiro: ["chama ao martelo do pai o nome que o pai lhe dava", "as lâminas novas que leva têm a marca da forja da família"],
  ex_cultista: ["despede-se com a saudação dos irmãos — e corrige-se", "a máscara partida, com {assinatura} pintada por dentro"],
  naufrago: ["sabe o nome do navio, que o herói nunca disse", "a outra metade da bússola, empenada para o mesmo lado"],
  sem: ["sabe de onde o herói vem, sem que ninguém lho tenha dito", "a carta que trouxe o herói, a mesma letra, em duplicado"],
};

/* §1.5 — o companheiro por ligação: INCLINA a ficha para o que a ligação
   já diz, sem a fixar (as listas são tentadas primeiro; se a índole ou a
   unicidade as recusam, a tabela inteira fica). */
export const COMPANHEIRO_POR_LIGACAO = {
  armas: { esconde: ["e_fugiu", "e_desertor"], carrega: ["c_distintivo", "u_ordem"] },
  sangue: { teme: ["t_pai"], esconde: ["e_nome_morto", "e_dado_morto"] },
  estrada: { carrega: ["c_corda_nos", "d_vida"], quer: ["q_teto"] },
  oficio: { teme: ["t_olhar_heroi"], quer: ["q_mestria"] },
  credor: { carrega: ["d_heroi"], quer: ["q_divida_fim"] },
};

/* ---------------- §1.6 A FERIDA DO VILÃO ----------------
   O segredo do antagonista — nunca de lealdade, porque ele É a sombra.
   `so` diz a condição em que a ferida pode nascer, e `teia` o fio que ela
   obriga (com quem). */
export const FERIDA_DO_VILAO = [
  { id: "w_por_morto", o: "fez tudo isto por alguém que já morreu, e não sabe parar" },
  { id: "w_heroi_antes", o: "foi um herói, como este, e a cidade não lho agradeceu" },
  { id: "w_exercito_salvos", o: "o exército dele é feito de gente que ele salvou" },
  { id: "w_a_morrer", o: "está a morrer, e quer acabar antes" },
  { id: "w_traido", o: "foi traído pela cidade que agora quer tomar" },
  { id: "w_mesmo_mestre", o: "aprendeu com a mesma pessoa que ensinou o herói", so: "companheiroOficio", teia: { id: "t_ensinou", com: "companheiro", vilaoE: "b" } },
  { id: "w_quer_travado", o: "quer que alguém o trave, e ninguém foi capaz" },
  { id: "w_filha", o: "tem uma filha que não sabe quem ele é", so: "porta", teia: { id: "t_sangue_calado", com: "porta", vilaoE: "a" } },
];

/* §1.6 — o que do vilão chega, em cada tamanho da sombra (FIO.sombra) */
export const VILAO_POR_TAMANHO = {
  inicio: ["fala"],
  meio: ["fala", "linha"],
  fim: ["quer", "linha", "esconde"],
};

/* ---------------- AS REVELAÇÕES ----------------
   Decisão da etapa (a pessoa, pela mão do orquestrador): a traição do
   companheiro nunca cai no mesmo ato que a revelação do elo. O elo revela
   no ato 0 (a reviravolta do primeiro ato); a máscara, nunca antes do
   ato 1. E nunca duas revelações no mesmo ato — a C2 pergunta aqui
   (`revelacaoPermitida`) antes de deixar uma cair. */
export const ATO_DA_REVELACAO = { elo: 0, mascara: 1 };

/* ---------------- A LINHA QUEM É (§3.1–3.2) ---------------- */
export const QUEM_E = {
  max: 130,
  /* de quantos em quantos turnos a ficha da mesma pessoa pode voltar */
  intervalo: 6,
  /* em quantas cenas da pessoa vai o exemplo da fala (depois, só o tique) */
  cenasComExemplo: 2,
  /* as palavras de bastidor que nunca chegam ao Narrador (§3.1, regra 5) */
  proibidas: ["subtrama", "arco", "pedido", "crise", "escolha", "pista", "núcleo", "nucleo"],
};

/* ---------------- O GÉNERO DE QUEM FALA (C2, 11/10) ----------------
   A C1 escreveu as tabelas no masculino e deixou passar duas frases ao
   Narrador que não concordavam com quem as vivia: a teia dava "Corwin foi
   noivo(a) de Perrin", e a fogueira dava "Perrine (… dito por ele …)". O
   Narrador segue o pronome que lê — a 4.ª sessão já pagou um "ele" para a
   mulher do alaúde (`OFICIO_NO_GENERO`, abertura.js).

   A pessoa tem `genero_pessoa` na base ("mulher" | "homem"); o vilão do
   fio não tem, e diz-se pelo primeiro nome, quando é dos bancos de nomes
   (`sexoDoNome`, nomes.js). O artigo do título NÃO serve: "Yorick
   Ventoforte, a Mão Fria" é ele, e o "a" é da mão. Sem nenhum dos dois (o
   Golem, o Lich), vale o masculino genérico da língua.

   A flexão é POR FRASE INTEIRA, só no texto da própria pessoa: `feminino`
   troca as frases das tabelas que falam dela no masculino; `masculino`, a
   única que o `jogo` escreveu no feminino ("a irmã de votos"). O "(a)" de
   uma palavra ("noivo(a)", "morto(a)") resolve-se pelo género; e os buracos
   {ele}, {dele}, {o} enchem-se com o pronome. Frase inteira e não palavra
   solta porque "o" e "ele" também são o herói e a sombra ("e ela forja
   para ele agora"). A suíte varre 120 mundos: nenhuma linha produzida com
   "(a)", nem com a frase do outro género. */
export const GENERO_NA_FICHA = {
  pronomes: {
    homem: { ele: "ele", Ele: "Ele", dele: "dele", o: "o", sozinho: "sozinho" },
    mulher: { ele: "ela", Ele: "Ela", dele: "dela", o: "a", sozinho: "sozinha" },
  },
  feminino: [
    /* QUER */
    ["de quem o humilhou", "de quem a humilhou"],
    ["ser chamado mestre", "ser chamada mestra"],
    /* TEME */
    ["ser deixado para trás", "ser deixada para trás"],
    ["que o herói o veja como ele se vê", "que o herói a veja como ela se vê"],
    ["ser chamado cobarde", "ser chamada cobarde"],
    ["tornar-se o pai", "tornar-se igual ao pai"],
    ["envelhecer sozinho", "envelhecer sozinha"],
    ["e o tenham visto", "e a tenham visto"],
    /* ESCONDE, as pistas e o que revela */
    ["é desertor, e o regimento ainda o procura", "é desertora, e o regimento ainda a procura"],
    ["foi mandado vigiar", "foi mandada vigiar"],
    ["foi dado como morto, e há quem o chore", "foi dada como morta, e há quem a chore"],
    ["quando o chamam", "quando a chamam"],
    ["a campa com o nome dele", "a campa com o nome dela"],
    ["um credor que o cumprimenta", "um credor que a cumprimenta"],
    ["escrito na letra dele", "escrito na letra dela"],
    ["procura-o", "procura-a"],
    ["quem o chora ainda espera", "quem a chora ainda espera"],
    /* CARREGA */
    ["os que confiavam nele", "os que confiavam nela"],
    ["e o dono ainda o procura", "e o dono ainda a procura"],
    /* LINHA */
    ["menos do que ele", "menos do que ela"],
    /* O ELO: quem era ao herói, o que esconde, as pistas */
    ["o terceiro da companhia — outro camarada", "a terceira da companhia — outra camarada"],
    ["o homem de negócios", "a mulher de negócios"],
    ["o copista que", "a copista que"],
    ["o mestre de recados", "a mestra de recados"],
    ["o físico que", "a física que"],
    ["o antigo parceiro de caça", "a antiga parceira de caça"],
    ["o aprendiz que", "a aprendiz que"],
    ["o irmão de culto", "a irmã de culto"],
    ["o outro sobrevivente", "a outra sobrevivente"],
    ["ele sabe porque o copiou", "ela sabe porque o copiou"],
    ["é ele quem leva", "é ela quem leva"],
    ["e ele forja para ele", "e ela forja para ele"],
    ["e ele é o anzol", "e ela é o anzol"],
    ["; ele abriu o porão", "; ela abriu o porão"],
    ["e ele levou-a", "e ela levou-a"],
    ["a culpa do naufrágio foi dele", "a culpa do naufrágio foi dela"],
    ["a faca dele", "a faca dela"],
    ["as cartas que ele guarda", "as cartas que ela guarda"],
    /* a reviravolta do soldado (batidas.js), dita pela boca do elo */
    ["o antigo companheiro de armas metido nisto", "a antiga companheira de armas metida nisto"],
    ["foi ele quem deu o nome", "foi ela quem deu o nome"],
    ["e o rasto dele aponta", "e o rasto dela aponta"],
    /* A FERIDA DO VILÃO */
    ["foi um herói, como este", "foi uma heroína, como este herói"],
    ["o exército dele é feito de gente que ele salvou", "o exército dela é feito de gente que ela salvou"],
    ["foi traído pela cidade", "foi traída pela cidade"],
    ["quer que alguém o trave", "quer que alguém a trave"],
    ["não sabe quem ele é", "não sabe quem ela é"],
  ],
  masculino: [
    ["a irmã de votos que ficou", "o irmão de votos que ficou"],
  ],
};

/* o género de uma pessoa do núcleo: o da base, ou o do primeiro nome */
export function generoDaPessoa(pessoa) {
  const p = obj(pessoa);
  const g = norm(p.genero || p.genero_pessoa);
  if (g === "mulher" || g === "homem") return g;
  const s = sexoDoNome(p.nome);
  return s === "fem" ? "mulher" : s === "masc" ? "homem" : "";
}

/* a frase no género de quem a vive (sem género: o masculino genérico) */
export function noGenero(texto, genero) {
  const g = genero === "mulher" ? "mulher" : "homem";
  const pares = g === "mulher" ? GENERO_NA_FICHA.feminino : GENERO_NA_FICHA.masculino;
  let x = String(texto == null ? "" : texto);
  for (const [de, por] of pares) if (x.includes(de)) x = x.split(de).join(por);
  x = g === "mulher" ? x.replace(/(\p{L}+)o\(a\)/gu, "$1a").replace(/\(a\)/g, "a") : x.replace(/\(a\)/g, "");
  const pr = GENERO_NA_FICHA.pronomes[g];
  return x.replace(/\{(ele|Ele|dele|o|sozinho)\}/g, (m, k) => pr[k]);
}

/* ============================================================
   A ESCOLHA DO NÚCLEO
   ============================================================ */

export const mesmoNome = (a, b) => {
  const x = norm(a), y = norm(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const px = primeiro(a), py = primeiro(b);
  /* "Vando" em cena é o "Vando Ferreira" do núcleo; "Lady Vex" não é a "Lady Morr" */
  return !!px && px === py && (!x.includes(" ") || !y.includes(" ")) && px.length >= 3;
};

/* a ligação do companheiro, lida da ficha do grupo (o `conceito` é o
   `curto` da ligação, `companheiro-inicial.js`) — uma fonte só, nenhum
   campo novo */
function ligacaoDoCompanheiro(membro) {
  const m = obj(membro);
  if (m.ligacao && LIGACOES_AO_PASSADO.some((l) => l.id === m.ligacao)) return m.ligacao;
  const c = norm(m.conceito);
  if (!c) return "";
  const l = LIGACOES_AO_PASSADO.find((x) => Object.values(x.curto).some((v) => norm(v) === c));
  return l ? l.id : "";
}

const tamanhoDoAto = (ato, ultimo) => (ato <= 0 ? "inicio" : ato >= ultimo ? "fim" : "meio");

/* O NOME DA SOMBRA no tamanho do ato — o mesmo que o fio usa como peça
   seguinte (`FIO.curta`). */
function sombraNoTamanho(fio, tamanho) {
  const f = obj(fio);
  if (!f.antagonista) return FIO.semMotivo.inicio;
  return encher(FIO.curta[tamanho] || FIO.curta.inicio, { nome: f.antagonista, titulo: f.titulo || f.antagonista });
}

/* quem pode ocupar cada papel — devolve { nome, cidade, fonte, ... } ou null */
function pessoaDe(p, fonte) {
  const o = obj(p);
  return { nome: String(o.nome || ""), cidade: String(o.cidade || ""), fonte: fonte || String(o.fonte || ""), genero: String(o.genero_pessoa || o.genero || "") };
}

/* `ctx`: { genero, molde, lex, espinha, guildas, base, estado, npcs,
     grupo (o `personagem.grupo`), antecedente (id ou nome; sem ele, o da
     espinha), reviravolta ({ forma, alvo } — a menor eleita, quando há),
     elenco (opcional: o já derivado, para não derivar duas vezes) }.
   Devolve { pessoas: [...], teia: [...], antecedente, coisa } —
   determinístico pela semente. Lixo devolve núcleo vazio. */
export function nucleoDaCampanha(semente, mapa, ctx) {
  const o = obj(ctx);
  const s = String(semente == null ? "" : semente);
  const vazio = { pessoas: [], teia: [], antecedente: "", coisa: "" };
  const espinha = obj(o.espinha);
  const atos = arr(espinha.atos);
  const fio = obj(espinha.fio);
  let el = obj(o.elenco);
  if (!Array.isArray(el.pessoas)) {
    try { el = elencoDoMundo(s, mapa, { genero: o.genero, molde: o.molde, lex: o.lex, espinha: o.espinha, guildas: o.guildas, base: o.base, estado: o.estado, npcs: o.npcs }); } catch { el = { pessoas: [] }; }
  }
  const elenco = arr(el.pessoas).filter((p) => p && p.nome);
  const ant = antecedenteDe(o.antecedente != null && o.antecedente !== "" ? o.antecedente : fio.antecedente) || "";
  const chaveAnt = ant || "sem";

  const rnd = (papel, campo) => rngDe(`${s}|nucleo|${papel}|${campo}`);
  const escolhe = (r, lista) => (lista.length ? lista[Math.floor(r() * lista.length)] : null);
  const pessoas = [];
  const tem = (nome) => pessoas.some((p) => mesmoNome(p.nome, nome));
  const marcos = atos.flatMap((a) => arr(a && a.marcos));
  const nomesDeMarco = marcos.flatMap((m) => [m && m.quem, m && m.alvo]).filter(Boolean);
  const ehDeMarco = (nome) => nomesDeMarco.some((x) => mesmoNome(x, nome));
  const doElenco = (nome) => elenco.find((p) => mesmoNome(p.nome, nome)) || null;
  const cidadesDoAto = (k) => arr(obj(atos[k]).marcos).map((m) => m && m.cidade).filter(Boolean).map(norm);

  /* 1. O COMPANHEIRO — o primeiro do grupo (as invocações não são gente) */
  const membro = arr(o.grupo).find((g) => g && g.nome && !g.invocada) || null;
  let ligacao = "";
  if (membro) {
    ligacao = ligacaoDoCompanheiro(membro);
    const daqui = doElenco(membro.nome);
    pessoas.push({ ...pessoaDe(daqui || membro, "grupo"), nome: String(membro.nome), papel: "companheiro", ligacao });
  }

  /* 2. O VILÃO — o antagonista do fio; espinha antiga, o alvo do confronto */
  const conf = marcos.filter((m) => m && m.feitio === "confronto" && m.alvo).pop();
  const nomeVilao = String(fio.antagonista || (conf && conf.alvo) || "");
  /* o vilão tem nome inteiro ("Kolvar Punho-de-Pedra, o Que Não Dorme") e
     nome curto (o de antes da vírgula), e a base pode ter gente com o curto:
     é a mesma pessoa, ou um xará que confundiria o Narrador — nenhum dos dois
     entra no núcleo noutro papel */
  const curtoDoVilao = nomeVilao.split(",")[0].trim();
  const ehVilao = (n) => !!nomeVilao && (mesmoNome(n, nomeVilao) || mesmoNome(n, curtoDoVilao));
  if (nomeVilao && !tem(nomeVilao)) pessoas.push({ nome: nomeVilao, cidade: "", fonte: "fio", genero: generoDaPessoa({ nome: nomeVilao }), papel: "vilao", motivo: String(fio.motivo || "") });

  /* 3. O ELO — do elenco que vive no mundo, da cidade do ato 0, vivo, sem
     nome de marco; quem já tem papel não serve (o companheiro nunca é o
     elo: quando a ligação dele diria a mesma pessoa, o elo é OUTRA, e o
     companheiro julgava-o morto) */
  const livreDoMundo = (p) => p && !p.morto && ["doArco", "recorrente"].includes(p.fonte) && !ehDeMarco(p.nome) && !tem(p.nome) && !ehVilao(p.nome);
  const c0 = cidadesDoAto(0);
  const candElo = elenco.filter(livreDoMundo);
  const daCidade0 = candElo.filter((p) => c0.includes(norm(p.cidade)));
  const eloRow = ELO_DO_ANTECEDENTE[chaveAnt] || ELO_DO_ANTECEDENTE.sem;
  /* o desejo do elo é fixo (a tabela dele): entre os candidatos, primeiro
     quem não tem traço que brigue com ele — a regra 2 vale para o elo */
  const brigaDoElo = (QUER.find((q) => q.id === eloRow.quer) || {}).briga || [];
  const semBrigaDoElo = (l) => l.filter((p) => !indoleDe(s, { nome: p.nome }).tracos.some((x) => brigaDoElo.includes(x)));
  const poolElo = [semBrigaDoElo(daCidade0), daCidade0, semBrigaDoElo(candElo), candElo].find((l) => l.length) || [];
  const elo = escolhe(rnd("elo", "quem"), poolElo);
  const julgadoMorto = !!(elo && membro && eloRow.ligacao && eloRow.ligacao === ligacao);
  if (elo) pessoas.push({ ...pessoaDe(elo), papel: "elo", eraDoHeroi: noGenero(eloRow.quem, generoDaPessoa(pessoaDe(elo))), ...(julgadoMorto ? { julgadoMorto: true } : {}) });

  /* 4. A VOZ — a pessoa da primeira batida `procurar` do ato 0 (sem batida
     marcada, do primeiro `procurar`); no ato 1 se o 0 não tiver. Um papel
     por pessoa: se a primeira já tem papel (o vilão que a espinha manda
     procurar com o nome curto, por exemplo), a voz é a seguinte. */
  const procuras = [0, 1].flatMap((k) => {
    const ms = arr(obj(atos[k]).marcos).filter((m) => m && m.feitio === "procurar" && m.quem);
    return [...ms.filter((x) => x.batida), ...ms.filter((x) => !x.batida)];
  });
  const mVoz = procuras.find((m) => !tem(m.quem) && !ehVilao(m.quem));
  if (mVoz) {
    const e = doElenco(mVoz.quem);
    pessoas.push({ ...pessoaDe(e || { nome: mVoz.quem, cidade: mVoz.cidade }, "espinha"), nome: String(mVoz.quem), papel: "voz" });
  }

  /* 5. A BALANÇA — a gente do relógio do fio no ato 0 ou 1 */
  for (const k of [0, 1]) {
    const r = arr(obj(atos[k]).marcos).map((m) => m && m.relogio).find((x) => x && x.gente);
    if (r && !tem(r.gente) && !ehVilao(r.gente)) {
      const e = doElenco(r.gente);
      pessoas.push({ ...pessoaDe(e || { nome: r.gente, cidade: r.cidade }, "relogio"), nome: String(r.gente), papel: "balanca" });
      break;
    }
  }

  /* 6. A PORTA — elenco das cidades do ato 0 ou 1, com propósito ou traço
     que se abre; se o núcleo ainda não tem o mínimo, a porta alarga-se a
     quem vive no mundo (das mesmas cidades, depois de qualquer uma) */
  if (pessoas.length < NUCLEO.max) {
    const c01 = [...c0, ...cidadesDoAto(1)];
    const abre = (p) => {
      const i = indoleDe(s, { nome: p.nome });
      return ["apaixonar", "adotar", "seguir"].includes(i.proposito) || i.tracos.some((t) => ["galanteador", "compassivo"].includes(t));
    };
    const perto = candElo.filter((p) => !tem(p.nome) && c01.includes(norm(p.cidade)));
    let pool = perto.filter(abre);
    if (!pool.length && pessoas.length < NUCLEO.min) pool = perto.length ? perto : candElo.filter((p) => !tem(p.nome));
    const porta = escolhe(rnd("porta", "quem"), pool);
    if (porta) pessoas.push({ ...pessoaDe(porta), papel: "porta" });
  }

  if (!pessoas.length) return vazio;
  const ordemDe = (papel) => (PAPEIS_DO_NUCLEO.find((x) => x.id === papel) || { ordem: 9 }).ordem;
  pessoas.sort((a, b) => ordemDe(a.papel) - ordemDe(b.papel));
  const quem = (papel) => pessoas.find((p) => p.papel === papel) || null;

  /* ---------------- A TEIA ---------------- */
  const teia = [];
  const fioCom = (a, b) => teia.some((t) => (t.a === a && t.b === b) || (t.a === b && t.b === a));
  const generoDeNome = (n) => generoDaPessoa(pessoas.find((p) => p.nome === n));
  const porFio = (id, a, b) => {
    const row = TEIA_DO_NUCLEO.find((t) => t.id === id);
    if (!row || !a || !b || a === b || fioCom(a, b)) return;
    const o = noGenero(encher(row.o, { a, b }), generoDeNome(row.concorda === "b" ? b : a));
    teia.push({ id, a, b, o, laco: row.laco, sabe: row.sabe, ...(row.rompido ? { rompido: true } : {}) });
  };
  if (julgadoMorto) porFio("t_morto_vivo", membro.nome, elo.nome);

  /* a ferida do vilão escolhe-se antes da teia: duas delas obrigam um fio */
  const vilao = quem("vilao");
  let ferida = null;
  if (vilao) {
    const pode = FERIDA_DO_VILAO.filter((w) => !w.so || (w.so === "companheiroOficio" ? ligacao === "oficio" : !!quem(w.so)));
    ferida = escolhe(rnd("vilao", "esconde"), pode);
    if (ferida && ferida.teia) {
      const outro = quem(ferida.teia.com);
      if (outro) ferida.teia.vilaoE === "a" ? porFio(ferida.teia.id, vilao.nome, outro.nome) : porFio(ferida.teia.id, outro.nome, vilao.nome);
    }
  }
  /* toda a pessoa com ≥ 1 fio para outra do núcleo, o vilão também; os
     fios do sorteio não repetem id enquanto houver outro */
  const usadosT = new Set(teia.map((t) => t.id));
  for (const p of pessoas) {
    if (teia.some((t) => t.a === p.nome || t.b === p.nome) || pessoas.length < 2) continue;
    const r = rnd(p.papel, "teia");
    const semFio = pessoas.filter((q) => q !== p && !teia.some((t) => t.a === q.nome || t.b === q.nome));
    const outros = pessoas.filter((q) => q !== p);
    const outro = escolhe(r, semFio.length ? semFio : outros);
    const livres = TEIA_DO_NUCLEO.filter((t) => !t.forcada && !usadosT.has(t.id));
    const row = escolhe(r, livres.length ? livres : TEIA_DO_NUCLEO.filter((t) => !t.forcada));
    if (!outro || !row) continue;
    usadosT.add(row.id);
    r() < 0.5 ? porFio(row.id, p.nome, outro.nome) : porFio(row.id, outro.nome, p.nome);
  }
  const parceiro = (nome) => { const t = teia.find((x) => x.a === nome || x.b === nome); return t ? (t.a === nome ? t.b : t.a) : ""; };

  /* ---------------- AS FICHAS ----------------
   Os campos FIXOS primeiro (o do elo vem da tabela dele; o do vilão é o
   motivo e a ferida), para os sorteados os contornarem; depois cada um,
   pela ordem dos papéis. */
  const usados = { quer: new Set(), teme: new Set(), esconde: new Set(), carrega: new Set(), linha: new Set(), fala: new Set() };
  /* quantas vezes cada categoria já saiu, por campo: o sorteio prefere a
     menos usada (estrita no quer e no teme: só a que ainda não saiu) */
  const cats = { quer: new Map(), teme: new Map(), esconde: new Map(), carrega: new Map() };
  const conta = (campo, cat) => (cats[campo] ? cats[campo].get(cat) || 0 : 0);
  const marca = (campo, cat) => { if (cats[campo]) cats[campo].set(cat, conta(campo, cat) + 1); };
  const tracosDe = (p) => (p.papel === "vilao" && !p.nome ? [] : indoleDe(s, { nome: p.nome }).tracos);
  const casa = (row, p, semBriga = false) => semBriga || !arr(row.briga).some((t) => tracosDe(p).includes(t));
  const cabe = (row, p) => (Array.isArray(row.cabe) ? row.cabe.includes(p.papel) : true);

  /* escolhe de uma tabela: inclinação primeiro, categoria livre primeiro
     (estrita no quer e no teme), id nunca repetido */
  const sortear = (campo, p, lista, { estrita = false, semBriga = false, inclina = [], chave = "cat" } = {}) => {
    const cat = (x) => x[chave];
    const r = rnd(p.papel, campo);
    const ok = lista.filter((x) => !usados[campo].has(x.id) && cabe(x, p) && casa(x, p, semBriga));
    const menor = ok.length ? Math.min(...ok.map((x) => conta(campo, cat(x)))) : 0;
    const base = estrita ? ok.filter((x) => conta(campo, cat(x)) === 0) : ok.filter((x) => conta(campo, cat(x)) === menor);
    const incl = base.filter((x) => inclina.includes(x.id));
    const row = escolhe(r, incl.length ? incl : base);
    if (row) { usados[campo].add(row.id); marca(campo, cat(row)); }
    return row;
  };
  const elop = quem("elo");
  if (elop) {
    const q = QUER.find((x) => x.id === eloRow.quer);
    if (q) { usados.quer.add(q.id); marca("quer", q.cat); }
    marca("esconde", "lealdade");
    marca("carrega", "objeto");
    if (eloRow.teme) { const t = TEME.find((x) => x.id === eloRow.teme); if (t) { usados.teme.add(t.id); marca("teme", t.cat); } }
  }
  const mascara = !!(membro && obj(o.reviravolta).forma === "aliado_agente" && mesmoNome(obj(o.reviravolta).alvo, membro.nome));
  const cidadeDe = (p) => p.cidade || (arr(obj(atos[0]).marcos).map((m) => m && m.cidade).find(Boolean) || "");
  const assinatura = String(fio.assinatura || RELOGIO_DO_FIO.assinaturas[0]);
  const coisas = EM_JOGO.coisas[chaveAnt] || EM_JOGO.coisas.sem;
  const coisa = escolhe(rnd("elo", "coisa"), coisas) || "";
  const itemDoHeroi = (ANTECEDENTES.find((a) => a.id === ant) || {}).item || "";

  for (const p of pessoas) {
    /* quando o outro é o vilão, o nome dele não se escreve: fica a sombra,
       que se enche na hora no tamanho do ato — no ato 0 ninguém lhe sabe o
       nome, nem o Narrador */
    const par = parceiro(p.nome);
    const v = { outro: vilao && par === vilao.nome ? "{sombra}" : par, cidade: cidadeDe(p), assinatura };
    /* {sombra} fica: enche-se na hora, no tamanho do ato. Tudo no género
       de quem o vive (`noGenero`, C2). */
    const gen = generoDaPessoa(p);
    const ng = (x) => noGenero(x, gen);
    const fil = (x) => (x ? {
      ...x, o: ng(encher(x.o, v)),
      ...(typeof x.revela === "string" ? { revela: ng(encher(x.revela, v)) } : {}),
      ...(Array.isArray(x.pistas) ? { pistas: x.pistas.map((pi) => ({ ...pi, o: ng(encher(pi.o, v)) })) } : {}),
    } : null);
    const incl = p.papel === "companheiro" ? obj(COMPANHEIRO_POR_LIGACAO[ligacao]) : {};
    const ficha = { quer: null, teme: null, esconde: null, carrega: null, linha: null, fala: null };

    if (p.papel === "vilao") {
      /* o motivo do chefe já diz "quer…" às vezes: o campo guarda só o desejo */
      const motivo = String(p.motivo || "").replace(/^quer\s+/i, "").trim();
      ficha.quer = motivo ? { id: "v_motivo", cat: "sombra", o: motivo } : null;
      ficha.esconde = ferida ? { id: ferida.id, grav: "ferida", o: ng(ferida.o), sombra: false } : null;
      ficha.linha = fil(sortear("linha", p, LINHA, { semBriga: true }));
      ficha.fala = fil(sortear("fala", p, COMO_FALA));
    } else if (p.papel === "elo") {
      const q = QUER.find((x) => x.id === eloRow.quer);
      ficha.quer = { id: eloRow.quer, cat: q ? q.cat : "", o: ng(encher(eloRow.querDiz, v)) };
      ficha.teme = eloRow.teme ? fil(TEME.find((x) => x.id === eloRow.teme)) : fil(sortear("teme", p, TEME, { estrita: true }));
      const pistas = (PISTAS_DO_ELO[chaveAnt] || PISTAS_DO_ELO.sem).map((t, i) => ({ forma: i === 0 ? "fala" : "objeto", o: ng(encher(t, v)) }));
      const daEspinha = antecedenteDe(fio.antecedente) === ant ? arr(obj(atos[0]).marcos).map((m) => m && m.reviravolta).find((x) => typeof x === "string" && x) : "";
      const rev = daEspinha || encher(REVIRAVOLTA_DO_ATO0[chaveAnt] || REVIRAVOLTA_DO_ATO0.sem, { cidade: cidadeDe(p) });
      ficha.esconde = { id: `elo_${chaveAnt}`, grav: "lealdade", o: ng(encher(eloRow.esconde, v)), pistas, revela: ng(rev), sombra: true };
      ficha.carrega = { tipo: "objeto", id: `elo_${chaveAnt}`, o: ng(eloRow.carrega), ...(eloRow.gemeo && itemDoHeroi ? { gemeo: itemDoHeroi } : {}), pedacoDe: coisa };
      ficha.linha = fil(sortear("linha", p, LINHA));
      ficha.fala = fil(sortear("fala", p, COMO_FALA));
    } else {
      /* o quer: o propósito manda, quando o diz e a categoria está livre */
      const prop = indoleDe(s, { nome: p.nome }).proposito;
      const doProp = QUER.find((x) => x.id === QUER_DO_PROPOSITO[prop]);
      const inclQuer = [...(doProp ? [doProp.id] : []), ...arr(incl.quer)];
      ficha.quer = fil(sortear("quer", p, QUER, { estrita: true, inclina: inclQuer }));
      ficha.teme = fil(sortear("teme", p, TEME, { estrita: true, inclina: arr(incl.teme) }));
      /* o esconde: a máscara, quando é ele; senão nunca com sombra */
      if (p.papel === "companheiro" && mascara) {
        const e = ESCONDE.find((x) => x.id === ESCONDE_DA_MASCARA);
        usados.esconde.add(e.id); marca("esconde", e.grav);
        ficha.esconde = fil(e);
      } else {
        const grav = ESCONDE_POR_PAPEL[p.papel];
        const lista = ESCONDE.filter((x) => !x.sombra && (!grav || grav.includes(x.grav)));
        ficha.esconde = fil(sortear("esconde", p, lista, { inclina: arr(incl.esconde), chave: "grav" }));
      }
      /* o carrega: um tipo livre primeiro, depois a coisa */
      const todos = Object.entries(CARREGA).flatMap(([tipo, l]) => l.map((x) => ({ ...x, tipo })));
      const c = sortear("carrega", p, todos, { inclina: arr(incl.carrega), chave: "tipo" });
      if (c) {
        const credor = p.papel === "companheiro" && ligacao === "credor" && c.aoContrario;
        ficha.carrega = { tipo: c.tipo, id: c.id, o: ng(encher(credor ? c.aoContrario : c.o, v)) };
      }
      ficha.linha = fil(sortear("linha", p, LINHA));
      ficha.fala = fil(sortear("fala", p, COMO_FALA));
    }
    p.ficha = ficha;
    p.revelaNoAto = p.papel === "elo" ? ATO_DA_REVELACAO.elo : p.papel === "companheiro" && mascara ? ATO_DA_REVELACAO.mascara : null;
  }

  return { pessoas, teia, antecedente: ant, coisa };
}

/* ============================================================
   AS REVELAÇÕES — o que a C2 pergunta antes de deixar uma cair
   `reveladas`: [{ nome, ato }] — as que já caíram. Devolve se a revelação
   de `nome` pode cair no `ato`: só quem tem segredo de sombra, nunca antes
   do seu ato, e nunca no ato de outra.
   ============================================================ */
export function revelacaoPermitida(nucleo, nome, ato, reveladas) {
  const p = arr(obj(nucleo).pessoas).find((x) => x && mesmoNome(x.nome, nome));
  const a = Math.floor(Number(ato));
  if (!p || p.revelaNoAto == null || !Number.isFinite(a) || a < p.revelaNoAto) return false;
  const ja = arr(reveladas).map(obj);
  if (ja.some((r) => mesmoNome(r.nome, p.nome))) return false;
  return !ja.some((r) => Math.floor(Number(r.ato)) === a);
}

/* ============================================================
   A LINHA QUEM É — a ficha, sem batida, de quem está em cena
   `cena`: { emCena: [nomes], ato, ultimoAto, turno,
     ultimas: { [nome]: turno em que a ficha dela foi },
     cenas: { [nome]: quantas vezes já foi } } (os dois mapas são do App,
     num ref: o ritmo não vai ao save).
   Devolve { quemE: [linha], quem: nome } — no máximo uma linha por turno,
   a da primeira pessoa (pela ordem dos papéis) que está em cena e não foi
   nos últimos `QUEM_E.intervalo` turnos. Nunca o segredo, a não ser o do
   vilão no tamanho do fim (§1.6).
   ============================================================ */
const cortarFrase = (partes, max) => {
  const out = [];
  for (const x of partes) {
    if (!x) continue;
    const tenta = [...out, x].join("; ") + "."; /* o ponto final conta sempre, mesmo quando as aspas o dispensam */
    if (tenta.length <= max) out.push(x);
  }
  return out;
};
export function linhaQuemE(pessoa, { tamanho = "inicio", fio = null, cenas = 0 } = {}) {
  const p = obj(pessoa);
  const f = obj(p.ficha);
  if (!p.nome) return "";
  const sombra = sombraNoTamanho(fio, tamanho);
  const ench = (x) => encher(x, { sombra });
  const nome = p.papel === "vilao" ? String(p.nome).split(",")[0].trim() : String(p.nome);
  const comExemplo = (Number(cenas) || 0) < QUEM_E.cenasComExemplo;
  const fala = f.fala ? `${f.fala.o}${comExemplo && f.fala.exemplo ? `: ${f.fala.exemplo}` : ""}` : "";
  const falaCurta = f.fala ? f.fala.o : "";
  let partes;
  if (p.papel === "vilao") {
    const vai = VILAO_POR_TAMANHO[tamanho] || VILAO_POR_TAMANHO.inicio;
    partes = vai.map((c) => (c === "fala" ? fala : c === "quer" ? (f.quer ? `quer ${f.quer.o}` : "") : c === "linha" ? (f.linha ? f.linha.o : "") : c === "esconde" ? (f.esconde ? f.esconde.o : "") : ""));
  } else {
    const traz = f.carrega && f.carrega.tipo === "objeto" && !(Number(cenas) > 0) ? `traz ${f.carrega.o}` : "";
    partes = [f.quer ? `quer ${ench(f.quer.o)}` : "", fala, traz, f.teme ? `teme ${f.teme.o}` : ""];
  }
  const cab = `${nome}: `;
  let dentro = cortarFrase(partes, QUEM_E.max - cab.length);
  /* se a fala com exemplo não coube, vai o tique sem ele */
  if (fala && falaCurta !== fala && !dentro.includes(fala)) dentro = cortarFrase(partes.map((x) => (x === fala ? falaCurta : x)), QUEM_E.max - cab.length);
  if (!dentro.length) return "";
  const corpo = `${cab}${dentro.join("; ")}`;
  /* a frase fecha uma vez: o exemplo já traz o ponto dentro das aspas */
  return /[.!?…]"$/.test(corpo) ? corpo : `${corpo}.`;
}

export function quemEParaPauta(nucleo, cena) {
  const out = { quemE: [], quem: "" };
  const n = obj(nucleo);
  const c = obj(cena);
  const emCena = arr(c.emCena).map(String).filter(Boolean);
  if (!emCena.length) return out;
  const turno = Math.floor(Number(c.turno)) || 0;
  const ato = Math.max(0, Math.floor(Number(c.ato)) || 0);
  const ultimo = Math.max(ato, Math.floor(Number(c.ultimoAto)) || 0);
  const ultimas = obj(c.ultimas), cenas = obj(c.cenas);
  const valor = (mapa, nome) => { const k = Object.keys(mapa).find((x) => mesmoNome(x, nome)); return k == null ? null : Number(mapa[k]); };
  /* C2: quem já leva a linha QUEM CARREGA neste turno não leva também a
     ficha — "a batida e a ficha da mesma pessoa no mesmo turno é
     redundante: a batida já traz o tique" (§3.2). O App passa o `quem` de
     `avancarCoracao` em `cena.jaCarrega`. */
  const jaCarrega = String(c.jaCarrega || "");
  for (const p of arr(n.pessoas)) {
    if (!p || !p.nome || !emCena.some((x) => mesmoNome(x, p.nome))) continue;
    if (jaCarrega && mesmoNome(jaCarrega, p.nome)) continue;
    const u = valor(ultimas, p.nome);
    if (u != null && Number.isFinite(u) && turno - u < QUEM_E.intervalo) continue;
    const linha = linhaQuemE(p, { tamanho: tamanhoDoAto(ato, ultimo), fio: c.fio, cenas: valor(cenas, p.nome) || 0 });
    if (!linha) continue;
    out.quemE.push(linha);
    out.quem = p.nome;
    break;
  }
  return out;
}

/* ============================================================
   A FICHA NA PRÓPRIA VOZ — o que a fogueira (§6) vai pedir

   A pessoa aprovou a fogueira (11/10): no descanso longo o jogador escolhe
   com quem se senta, e — sem batida madura dessa pessoa — ela conta UM
   campo da ficha na voz dela ("Sabes porque é que a corda tem treze
   nós?"). A fogueira (a escolha, a tela, o descanso) NÃO é desta etapa;
   isto é só a peça do motor que ela vai chamar, pronta e provada.

   A ordem é a da noite: primeiro o que ela traz (a coisa, a dívida, a
   culpa que só se diz de noite), depois o que quer para si, depois a linha
   que não cruza, e por fim o que a tira do sono. NUNCA o que esconde —
   isso é da crise (C2) — e nunca o vilão, que não se senta ao fogo.
   ============================================================ */
export const FOGUEIRA_CONTA = {
  ordem: ["carrega", "quer", "linha", "teme"],
  /* `{campo}` é o campo; a frase é fechada e manda (é fato, entra nesta
     resposta). C2: {ele} e {o} são o pronome de quem fala (`noGenero`) — a
     C1 dizia "dito por ele" da Perrine. */
  modelos: {
    objeto: "conta, sem que lho peçam, de onde lhe veio o que traz: {campo}",
    divida: "conta a dívida que carrega: {campo}",
    culpa: "diz, porque é noite e há fogo, o que de dia não diz: {campo}",
    quer: "diz o que quer para si, fora do herói: {campo}",
    linha: "conta a noite em que aprendeu que {campo}",
    teme: "confessa o que {o} tira do sono: {campo}",
  },
  cabeca: "{nome} (é fato: entra nesta resposta, dito por {ele}, à volta do fogo): ",
  max: 220,
};

/* `pessoa`: uma do núcleo. `contados`: os campos que ela já contou noutras
   noites (quem chama guarda-os). Devolve { campo, linha } com o próximo
   campo por contar — ou null (o vilão, ninguém, ou já contou tudo). */
export function fichaNaVoz(pessoa, { contados = [], tamanho = "inicio", fio = null } = {}) {
  const p = obj(pessoa);
  const f = obj(p.ficha);
  if (!p.nome || p.papel === "vilao") return null;
  const ja = new Set(arr(contados).map(String));
  const sombra = sombraNoTamanho(fio, tamanho);
  for (const campo of FOGUEIRA_CONTA.ordem) {
    const x = f[campo];
    if (ja.has(campo) || !x || !x.o) continue;
    const modelo = FOGUEIRA_CONTA.modelos[campo === "carrega" ? x.tipo : campo];
    if (!modelo) continue;
    const gen = generoDaPessoa(p);
    const cab = noGenero(encher(FOGUEIRA_CONTA.cabeca, { nome: p.nome }), gen);
    let linha = `${cab}${noGenero(encher(modelo, { campo: encher(x.o, { sombra }) }), gen)}.`;
    const tique = f.fala && f.fala.o ? ` Fala assim: ${f.fala.o}.` : "";
    if ((linha + tique).length <= FOGUEIRA_CONTA.max) linha += tique;
    if (linha.length > FOGUEIRA_CONTA.max) continue;
    return { campo, linha };
  }
  return null;
}

/* ============================================================
   O CAMPO DE SAVE (§2.7) — `coracao`
   Novo, no topo, ignorado pela versão antiga (o load antigo lê o save
   chave a chave e nunca olha para esta; o salvar antigo monta o objeto de
   novo a partir dos refs, e a chave some no primeiro autosave — perde-se
   o arco começado, e o núcleo continua derivável). Nenhum campo existente
   muda. A C1 só o garante; quem o escreve é a C2.
   C2 (11/10): além do §2.7, cada arco pode guardar `posta` (o dia em que
   os dois lados foram postos ao herói — é dele que conta o prazo da
   omissão), `ato` (o ato em que a crise caiu: é a revelação, e
   `revelacaoPermitida` precisa dele), `porque` (o herói perguntou
   porquê), e para a fogueira `contados` (os campos que a pessoa já contou)
   e `noites` (quantas noites o herói se sentou ao lado dela). Tudo
   opcional e ainda `v: 1`: a versão antiga não lê o que não conhece.
   ============================================================ */
export const CORACAO_DO_SAVE = { v: 1, arcosMax: 12, pistasMax: 2, escolhaMax: 40, respostas: ["aceitou", "recusou"], contadosMax: 4, noitesMax: 999 };

const PROIBIDAS = new Set(["__proto__", "constructor", "prototype"]);
const diaOuNulo = (v) => { if (v == null || v === "") return null; const n = Math.floor(Number(v)); return Number.isFinite(n) && n >= 0 ? n : null; };

export function garantirCoracaoDoSave(x) {
  const o = obj(x);
  const arcos = {};
  for (const [k, v] of Object.entries(obj(o.arcos))) {
    const nome = String(k == null ? "" : k).trim().slice(0, 60);
    if (!nome || PROIBIDAS.has(nome)) continue;
    const a = obj(v);
    arcos[nome] = {
      pedido: diaOuNulo(a.pedido),
      resposta: CORACAO_DO_SAVE.respostas.includes(a.resposta) ? a.resposta : "",
      crise: diaOuNulo(a.crise),
      escolha: typeof a.escolha === "string" ? a.escolha.slice(0, CORACAO_DO_SAVE.escolhaMax) : "",
      pistas: arr(a.pistas).map(diaOuNulo).filter((d) => d != null).slice(0, CORACAO_DO_SAVE.pistasMax),
      posta: diaOuNulo(a.posta),
      ato: diaOuNulo(a.ato),
      porque: a.porque === true,
      contados: [...new Set(arr(a.contados).filter((c) => FOGUEIRA_CONTA.ordem.includes(c)))].slice(0, CORACAO_DO_SAVE.contadosMax),
      noites: Math.min(CORACAO_DO_SAVE.noitesMax, diaOuNulo(a.noites) || 0),
    };
    if (Object.keys(arcos).length >= CORACAO_DO_SAVE.arcosMax) break;
  }
  return { v: CORACAO_DO_SAVE.v, arcos };
}
