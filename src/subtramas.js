/* ============================================================
   AS SUBTRAMAS (Fase MM-C, etapa C2) — o que cada pessoa do núcleo pede,
   o que lhe chega, e o que o herói decide por ela

   A C1 deu ao Mestre quatro a seis pessoas que ele conhece por dentro
   (`nucleo.js`). Conhecer não basta: no Critical Role cada uma delas TEM
   UMA HISTÓRIA QUE ANDA — pede uma coisa, a coisa complica-se, e alguém
   tem de decidir. A 6.ª sessão disse-o pelo avesso: "nove turnos de
   empaque não custaram nada". Uma subtrama ignorada CUSTA, e custa a uma
   pessoa com nome.

   A especificação é do `jogo`, `mente/coracao-c1-c2.md` §2 e §3 (as tabelas
   estão aqui tal como lá; os desvios estão escritos onde acontecem, e no
   diário de 11/10).

   A FORMA (§2.1): três batidas por pessoa, cada uma com um relógio —
     · o PEDIDO: uma coisa concreta e pequena. Ignorado três dias, a crise
       chega na variante PIOR;
     · a CRISE: o que a pessoa escondia, carregava ou temia chega à cena e
       cobra. Longe do herói, resolve-se sem ele, e mal;
     · a ESCOLHA: dois lados, cada um com o preço DITO EM MUNDO e visível
       antes do clique (a lei do veredito). Sem resposta, a omissão — o lado
       que a tabela guarda para quem não escolhe.

   E O ELO tem a sua própria: a reviravolta do ato 0 é o segredo dele, dito
   pela boca dele (§2.5). Duas pistas primeiro (uma que se ouve, uma que se
   vê — a vista com a assinatura do vilão, a mesma marca que o relógio deixa
   nas portas), a revelação nunca antes delas; e quem repara chega antes:
   confrontá-lo com uma pista faz a Intuição apanhá-lo a mentir, com as duas
   faz a verdade sair já.

   O DISPARO É SEMPRE O QUE O JOGO JÁ REGISTA: quem está em cena, o dia, o
   ato da história, o fecho de cada ato (o dia que `conferirEspinha` grava),
   o relógio do antagonista (`relogioDoFio`), a frase do jogador. Nada aqui
   lê o relógio da máquina nem a sorte solta.

   O QUE CHEGA AO NARRADOR: uma linha QUEM CARREGA por turno (secção
   `coracao` da pauta, prio 2,46, ≤ 220), só de quem está em cena, em frase
   fechada ("é fato: entra nesta resposta"), sem nenhuma palavra de
   bastidor — nem o segredo antes da hora. O App só a dá por cumprida se ela
   COUBE na pauta: `avancarCoracao` devolve o coração novo, e o App fica com
   ele só quando `textoDaPauta(...)` inclui a linha (§7: "regar quando a
   linha foi à pauta e cabeu"). Assim a pista que o teto cortou não conta.

   O QUE SE GUARDA: o campo `coracao` do save (§2.7, `garantirCoracaoDoSave`
   em nucleo.js) — novo, ignorado pela versão antiga. Os arcos em si
   derivam-se do núcleo e da semente, como o núcleo.

   A FOGUEIRA (aprovada pela pessoa, 11/10; forma em `mente/formas.md`,
   "Fogueira" §7): as peças do motor que a tela vai chamar estão no fim —
   quem se senta, o gesto, se a noite aguenta, a porta, a manhã.
   ============================================================ */

import { rngDe } from "./geografia.js";
/* T4-B (29/10) · o gênero de recuo — quando quem chama não diz o seu — é o
   padrão do mundo em uso (`generos.padrao`), e não um literal da Taverna */
import { cenarioAtivo } from "./cenario.js";
/* E1 (12/10): a figura que o arco põe em cena nasce com nome */
import { nomePessoa } from "./nomes.js";
import { alvoPrometido } from "./agressao.js";
import { FIO } from "./saga.js";
import { relogioDoFio, RELOGIO_DO_FIO } from "./batidas.js";
import { contrair } from "./lugar.js";
import { mesmoNome, revelacaoPermitida, fichaNaVoz, generoDaPessoa, noGenero, garantirCoracaoDoSave, vozPresa, comGenero, longeDaHistoria } from "./nucleo.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const arr = (x) => (Array.isArray(x) ? x : []);
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const encher = (tpl, v) => String(tpl || "").replace(/\{(\w+)\}/g, (m, k) => (v[k] == null || v[k] === "" ? m : String(v[k])));
const finito = (v) => typeof v === "number" && Number.isFinite(v);
const maiuscula = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/* ============================================================
   AS TABELAS
   ============================================================ */

export const BATIDAS = ["pedido", "crise", "escolha"];

/* §2.1 — os relógios. `esperaDoPedido` é o ESPERA_DO_PEDIDO da
   especificação. `esperaDaEscolha`: os lados postos ao herói esperam dois
   dias, e depois decide a omissão (a especificação não deu o número; dois
   é o que cabe numa noite de fogueira e mais um dia). `turnosEntreBatidas`:
   a mesma pessoa não leva duas linhas seguidas — a pedida e a pista no
   mesmo fôlego seriam um aviso, não uma pista. */
export const RELOGIO_DAS_BATIDAS = {
  esperaDoPedido: 3,
  esperaDaEscolha: 2,
  turnosEntreBatidas: 3,
};

/* §2.1 — GATILHOS_DA_BATIDA: o que cada condição lê, no estado que já existe */
export const GATILHOS_DA_BATIDA = [
  { id: "emCena", le: "a pessoa está em emCena (ou anda no grupo e foi falada neste turno)", usadoPor: "todas as batidas — nenhuma batida acontece longe" },
  { id: "atoMin", le: "o ato actual da espinha ≥ n", usadoPor: "a âncora no ato (2.2)" },
  { id: "diasDesde", le: "dias desde a batida anterior ≥ n", usadoPor: "crise do companheiro, crise da voz" },
  { id: "fechoDoAto", le: "o fecho do ato n cumprido (conferirEspinha grava o dia)", usadoPor: "crise do companheiro; reviravolta" },
  { id: "relogio", le: "a etapa do relógio do ato caiu, travada ou cumprida (relogioDoFio)", usadoPor: "a balança" },
  { id: "pistas", le: "as duas pistas da pessoa foram à cena com ela presente", usadoPor: "a crise do elo (a reviravolta)" },
  { id: "confrontada", le: "o jogador perguntou-lhe sobre a pista (o nome dela + o objecto da pista)", usadoPor: "reviravolta cedo — a agência de quem repara" },
  { id: "aliadoCaido", le: "aliado a 0 PV num combate", usadoPor: "crises de t_ver_morrer, l_ferido" },
];

/* §2.2 — a âncora de cada papel nos atos. Os números são lidos pelo motor
   (`devida`, abaixo); o texto é o da especificação. A porta não tem arco
   na C2: abre-se na C3, e só se o jogador a abrir. */
export const ANCORA_DO_PAPEL = {
  companheiro: { pedido: { atoMin: 0, diaMin: 2, depoisDaPrimeiraBatida: true }, crise: { fechoDoAto: 1, ouRevelacaoDoElo: true }, escolha: { ato: 2, antesDoFecho: true }, tamanho: "longo, a campanha toda" },
  elo: { pedido: { atoMin: 0, naEstreia: true }, crise: { fechoDoAto: 0, pistas: 2, ouConfrontado: true }, escolha: { atoMin: 1, cenaDepois: true }, tamanho: "o ato 0 e o 1" },
  voz: { pedido: { naBatida: true }, crise: { dias: { de: 2, ate: 4 }, ouRelogioDoAto: 0 }, escolha: { atoMax: 1 }, tamanho: "curto — a primeira que fecha" },
  balanca: { pedido: { aoEncontrar: true }, crise: { noPrazoDaEtapa: true }, escolha: { chegouAntes: "o herói", chegouDepois: "ela" }, tamanho: "um ato" },
  porta: { c3: true, tamanho: "aberto" },
  vilao: { pedido: { atoMin: 1, antesDoUltimo: true, pelaMao: true }, crise: { atosAntesDoFim: 1, dias: 2 }, escolha: { noConfronto: true }, tamanho: "a campanha toda" },
};

/* §2.6 — os tons de cada batida (para a C4). `nunca` é a regra dura; a
   suíte confere-a em todos os arcos. */
export const TONS_DA_BATIDA = {
  pedido: { possiveis: ["emoção", "alívio", "suspense", "romance"], nunca: ["batalha"] },
  crise: { possiveis: ["suspense", "provação", "batalha", "emoção"], nunca: ["alívio"] },
  escolha: { possiveis: ["emoção", "provação", "batalha", "romance"], nunca: ["alívio"] },
};

/* Os efeitos que um lado pode ter — SÓ os que já existem (§2.3), cada um
   com o sistema que o aplica. É o vocabulário que o App traduz; a suíte
   não deixa um lado usar outro. */
export const EFEITOS_DO_LADO = {
  relacao: "a relação com uma pessoa ou casa (aliado, rival, inimigo, romance — RELACOES_NPC, npcs.js)",
  laco: "o laço do herói com a pessoa (+1, −1, ao máximo, rompido — npcs.js); `firma` firma um laço do registo",
  convite: "alguém entra no grupo",
  missao: "uma missão nova (tramas.js)",
  sai: "a pessoa deixa a cidade (elenco.saidos); `volta` em atos",
  item: "o herói recebe uma coisa",
  bolsa: "moedas debitadas da bolsa, com o veredito antes",
  dias: "o relógio do fio corre n dias",
  combate: "uma luta começa, pelo motor de combate",
  duelo: "um duelo, pelo motor de combate",
  teste: "um teste de perícia; a falha diz o que custa",
  tique: "a pessoa passa a falar de outra maneira (COMO_FALA)",
  teme: "o medo da pessoa desliga",
  proposito: "o propósito da índole muda (PROPOSITOS, indole.js)",
  cronica: "a crónica guarda o feito com outro nome",
};

/* o preço de um pedido de dinheiro, ao ◉ (a semente escolhe dentro) */
export const PRECO_DO_PEDIDO = { de: 20, ate: 60 };

/* quando o mundo não dá o nome de que a frase precisa */
export const SEM_NOME = {
  destino: "um sítio para lá da serra",
  lugar: "uma casa fora dos muros",
  casa: "casa grande da praça",
  outro: "alguém que lhe é caro",
  alvo: "quem anda com você",
  figura: "alguém",
};

/* ---------------- A FIGURA COM NOME (o Narrador só narra · E1, 12/10) ----------------
   A 7.ª sessão (M52): a linha QUEM CARREGA disse "um velho camarada de
   Tônia Lodoso aparece e acusa-a em voz alta" — uma pessoa que o SISTEMA
   pôs em cena, sem nome e sem registo. O Narrador chamou-o Marlo (a frase
   fechada obedece-se; o buraco preenche-se), e o duelo que o cartão
   prometia ficou sem combatente até à v9.418. Cada arco que traz alguém de
   fora do núcleo diz aqui quem é: `papel` (como a linha o chama) e `sexo`
   (do banco de nomes). O nome sai de `nomePessoa`, semeado pela pessoa do
   núcleo — o mesmo camarada em toda a campanha — e vai na linha
   ({figura}) e em `inst.figura`, para o App o registar quando a batida
   entra na pauta. `tentativas`: quantos sorteios até achar um primeiro
   nome que ninguém do núcleo nem do elenco use. */
export const FIGURA_DO_ARCO = {
  a_guerra: { papel: "velho camarada", sexo: "masc" },
  a_irmao_do_outro_lado: { papel: "irmão", sexo: "masc" },
};
export const FIGURA_TENTATIVAS = 16;

/* §2.3 — OS ARCOS (11). `chave`: os ids da ficha (esconde, carrega, quer,
   teme ou linha) que dão este arco. Os textos têm buracos: {nome},
   {destino}, {preco}, {sombra} (enche-se na hora, no tamanho do ato),
   {assinatura}, {outro} (o fio da teia), {casa}, {lugar}, {alvo}, e os
   pronomes {ele}, {dele}, {o}, {sozinho} de quem o vive (`noGenero`).
   Cada lado: `diz` (o que a pessoa diz como saída, na linha da escolha),
   `verbo` (o rótulo da forma `A escolha`), `preco` (o preço em mundo — o
   veredito antes do clique) e `efeitos` (de EFEITOS_DO_LADO). `omissao`
   é o que acontece a quem não escolhe.

   Desvios, escritos: (1) a_culpa_tarde dava à escolha os tons "alívio ·
   provação", e o §2.6 diz que a escolha NUNCA é alívio (o alívio é o
   depois): ficou provação. (2) O "à casa {casa}" do amor proibido ficou
   "à {casa}" — o elenco já chama às casas "Casa X". (3) A crise "pior" que
   a tabela não deu repete a crise com a perda à vista. (4) O jogo trata
   o jogador por VOCÊ (a tela, e o Narrador desde a v9.346): todo texto
   dirigido ao herói — o preço, a frase da manhã, e a fala de quem pede —
   diz você/seu/lhe, nunca tu/teu/contigo. A personagem guarda o registo no
   tique (COMO_FALA), não no pronome; a catraca está em teste-subtramas. */
export const ARCOS = [
  {
    id: "a_carta", chave: ["c_carta", "d_moribundo"],
    pedido: { tom: ["emoção"], fala: "Leve esta carta a {destino}. Eu não posso entrar lá." },
    crise: { tom: ["suspense"], o: "o destinatário da carta de {nome} morreu — ou é gente de {sombra}; a carta é o que {sombra} procura", pior: "a carta de {nome} foi roubada, e é o que {sombra} procura" },
    escolha: {
      tom: ["provação"], contexto: "a carta de {nome} está nas mãos do herói, e {sombra} quere-a",
      lados: [
        { id: "entregar", diz: "entregá-la como prometido", verbo: "Entregar a carta", preco: "a palavra cumpre-se — e quem a recebe fica sabendo o que você sabe", efeitos: [{ tipo: "missao", o: "levar a carta de {nome} a {destino}" }] },
        { id: "queimar", diz: "abri-la e queimá-la", verbo: "Abrir e queimar", preco: "o que dizia fica com você — e {nome} perde a única coisa que {o} ligava ao morto", efeitos: [{ tipo: "laco", delta: -1 }] },
      ],
      omissao: { id: "abrir_sem_queimar", preco: "a carta abre-se e não arde, e o que dizia corre a cidade", efeitos: [{ tipo: "laco", delta: -1 }] },
    },
  },
  {
    id: "a_divida_volta", chave: ["d_agiota", "d_guilda", "e_jogo", "c_corda_nos"],
    pedido: { tom: ["alívio"], fala: "Faltam-me {preco} moedas. Treze dias." },
    crise: { tom: ["suspense"], o: "o credor de {nome} leva alguém como penhor", pior: "o credor leva {nome} como penhor" },
    escolha: {
      tom: ["batalha", "provação"], contexto: "o credor tem o penhor e quer {preco} moedas",
      lados: [
        { id: "pagar", diz: "pagar as {preco} moedas", verbo: "Pagar ◉ {preco}", preco: "◉ {preco} da sua bolsa — e o credor esquece {nome}", efeitos: [{ tipo: "bolsa", preco: "{preco}" }, { tipo: "laco", delta: 1, firma: "divida" }] },
        { id: "forca", diz: "ir buscar o penhor à força", verbo: "Ir buscá-lo à força", preco: "uma luta com os homens do credor — e um inimigo nesta cidade", efeitos: [{ tipo: "combate", contra: "os homens do credor" }, { tipo: "relacao", com: "o credor", valor: "inimigo" }] },
      ],
      omissao: { id: "penhor_fica", preco: "o penhor fica com o credor", efeitos: [{ tipo: "laco", delta: -1 }] },
    },
  },
  {
    id: "a_nome_falso", chave: ["e_nome_morto", "e_dado_morto", "e_titulo"],
    pedido: { tom: ["suspense"], fala: "Nesta cidade não diga o meu nome. Nenhum dos dois." },
    crise: { tom: ["emoção"], o: "alguém reconhece {nome} e chama-{o} pelo nome verdadeiro, em público", pior: "alguém reconhece {nome}, chama-{o} pelo nome verdadeiro, e a praça inteira ouve" },
    escolha: {
      tom: ["provação"], contexto: "chamaram {nome} pelo nome verdadeiro, e a praça espera a resposta",
      lados: [
        { id: "cobrir", diz: "o herói mentir por {ele}", verbo: "Mentir por {ele}", preco: "um teste de Enganação — se falhar, os dois ficam mal-vistos na cidade", efeitos: [{ tipo: "teste", pericia: "Enganação", falha: "mal-vistos na cidade" }] },
        { id: "responder", diz: "deixá-{o} responder com a verdade", verbo: "Deixá-{o} responder", preco: "a verdade sai — e {nome} fica, mais leve, ou parte", efeitos: [{ tipo: "sai", talvez: true }] },
      ],
      omissao: { id: "responde_so", preco: "{nome} responde {sozinho}, e não perdoa ao herói o silêncio", efeitos: [{ tipo: "laco", delta: -1 }] },
    },
  },
  {
    id: "a_irmao_do_outro_lado", chave: ["e_irmao_lado"],
    pedido: { tom: ["suspense"], fala: "Se vir um homem com {assinatura} no braço, não o mate. Deixe-o para mim." },
    crise: { tom: ["batalha"], o: "{figura}, o irmão de {nome}, está entre os servos de {sombra}, na luta — e rende-se em vez de cair", pior: "{figura}, o irmão de {nome}, está entre os servos de {sombra}, na luta, e não sabe que é ele", efeitos: [{ tipo: "combate", rendido: "o irmão" }] },
    escolha: {
      tom: ["emoção"], contexto: "{figura}, o irmão de {nome}, está rendido aos pés do herói",
      lados: [
        { id: "poupar", diz: "poupá-lo", verbo: "Poupar o irmão", preco: "ele foge e leva notícias a {sombra} — e {nome} fica do seu lado até o fim", efeitos: [{ tipo: "laco", delta: "max" }, { tipo: "dias", n: 1 }] },
        { id: "nao_poupar", diz: "não o poupar", verbo: "Não o poupar", preco: "a luta fica mais fácil — e o laço com {nome} rompe-se e não volta", efeitos: [{ tipo: "laco", delta: "rompe" }] },
      ],
      omissao: { id: "poupa_sem_dizer", preco: "{nome} poupa-o por conta própria, e o herói não o soube", efeitos: [{ tipo: "dias", n: 1 }] },
    },
  },
  {
    id: "a_culpa_tarde", chave: ["u_tarde", "u_deixou", "u_mae", "u_irmao_lugar"],
    pedido: { tom: ["emoção"], fala: "É meio dia de desvio. Há uma campa que não visito há seis anos." },
    crise: { tom: ["provação"], o: "lá, quem {nome} deixou para trás está vivo, e não perdoa", pior: "lá, quem {nome} deixou para trás está vivo, não perdoa, e diz porquê diante de todos" },
    escolha: {
      tom: ["provação"], contexto: "quem {nome} deixou para trás está ali, vivo, e não perdoa",
      lados: [
        { id: "reparar", diz: "ficar para reparar", verbo: "Ficar para reparar", preco: "perdem-se dois dias — e o que a sombra prepara não espera", efeitos: [{ tipo: "dias", n: 2 }] },
        { id: "seguir", diz: "seguir caminho", verbo: "Seguir caminho", preco: "a culpa fica — e {nome} passa a carregar mais uma", efeitos: [] },
      ],
      omissao: { id: "seguiu_calado", preco: "segue-se caminho, e a culpa vai com {nome}", efeitos: [{ tipo: "laco", delta: -1 }] },
    },
  },
  {
    id: "a_juramento", chave: ["d_voto", "q_juramento", "l_palavra"],
    pedido: { tom: ["provação"], fala: "Prometi rezar onde ele caiu. É no caminho." },
    crise: { tom: ["suspense"], o: "cumprir o voto obriga {nome} a cruzar a linha de {outro}", pior: "cumprir o voto obriga {nome} a cruzar a linha de {outro}, e {outro} já o sabe" },
    escolha: {
      tom: ["emoção"], contexto: "o voto de {nome} e {outro} puxam para lados contrários",
      lados: [
        { id: "voto", diz: "cumprir o voto", verbo: "O voto", preco: "o voto cumpre-se — e {outro} afasta-se de {nome}", efeitos: [{ tipo: "laco", com: "{outro}", delta: -1 }] },
        { id: "outro", diz: "ficar ao lado de {outro}", verbo: "Ficar com {outro}", preco: "o voto quebra-se — e {nome} passa a falar menos", efeitos: [{ tipo: "tique", para: "f_curto" }] },
      ],
      omissao: { id: "voto_sem_heroi", preco: "o voto cumpre-se sem o herói", efeitos: [{ tipo: "laco", delta: -1 }] },
    },
  },
  {
    id: "a_amor_proibido", chave: ["e_ama_proibido"],
    pedido: { tom: ["romance"], fala: "Leve isto à {casa}. Não pergunte a quem." },
    crise: { tom: ["suspense"], o: "{nome} e quem ama foram descobertos; a {casa} exige reparação", pior: "{nome} e quem ama foram descobertos diante de todos; a {casa} exige reparação" },
    escolha: {
      tom: ["provação"], contexto: "a {casa} exige reparação pelo amor de {nome}",
      lados: [
        { id: "fugir", diz: "ajudá-los a fugir", verbo: "Ajudá-los a fugir", preco: "a {casa} fica sua inimiga — e os dois partem juntos, até um ato depois", efeitos: [{ tipo: "relacao", com: "{casa}", valor: "inimigo" }, { tipo: "sai", volta: 1 }] },
        { id: "separar", diz: "separá-los", verbo: "Separá-los", preco: "a {casa} fica sua aliada — e {nome} passa a falar menos com você, e mais curto", efeitos: [{ tipo: "relacao", com: "{casa}", valor: "aliado" }, { tipo: "laco", delta: -1 }, { tipo: "tique", para: "f_curto" }] },
      ],
      omissao: { id: "separados_a_forca", preco: "separam-nos à força, sem o herói", efeitos: [{ tipo: "laco", delta: -1 }, { tipo: "tique", para: "f_curto" }] },
    },
  },
  {
    id: "a_guerra", chave: ["e_fugiu", "e_desertor", "u_ordem", "t_guerra_volta"],
    pedido: { tom: ["suspense"], fala: "Se alguém do regimento perguntar, você nunca me viu." },
    crise: { tom: ["provação"], o: "{figura}, velho camarada de {nome}, aparece e acusa-{o} em voz alta", pior: "{figura}, velho camarada de {nome}, aparece com mais dois, e acusa-{o} em voz alta" },
    escolha: {
      tom: ["emoção", "batalha"], contexto: "{figura}, o velho camarada, acusa {nome} diante de todos",
      lados: [
        { id: "defender", diz: "o herói defender a versão {dele}", verbo: "Defender a versão {dele}", preco: "{figura} desafia você para um duelo", efeitos: [{ tipo: "duelo", contra: "o velho camarada" }] },
        { id: "confessar", diz: "deixá-{o} confessar", verbo: "Deixá-{o} confessar", preco: "{figura} vai-se — e {nome} fica, mais leve, sem o medo que {o} roía", efeitos: [{ tipo: "teme", desliga: true }] },
      ],
      omissao: { id: "confessa_so", preco: "{nome} confessa sem o herói ao lado", efeitos: [{ tipo: "laco", delta: -1 }] },
    },
  },
  {
    id: "a_crianca", chave: ["q_crianca", "c_dente", "c_retrato"],
    pedido: { tom: ["emoção"], fala: "Há uma criança em {lugar}. Ninguém pode saber dela." },
    crise: { tom: ["suspense"], o: "alguém procura a criança de {lugar} — servos de {sombra}, ou a família verdadeira", pior: "alguém procura a criança de {lugar}, e já sabe onde ela dorme" },
    escolha: {
      tom: ["provação"], contexto: "procuram a criança que {nome} esconde",
      lados: [
        { id: "levar", diz: "levá-la com o grupo", verbo: "Levá-la com vocês", preco: "um fardo e um laço — as lutas passam a ter quem proteger", efeitos: [{ tipo: "convite", quem: "a criança" }] },
        { id: "entregar", diz: "entregá-la a quem a procura", verbo: "Entregá-la", preco: "paz — e {nome} nunca mais fala disso", efeitos: [] },
      ],
      omissao: { id: "levam_na", preco: "levam-na, e ninguém a viu partir", efeitos: [{ tipo: "laco", delta: -1 }] },
    },
  },
  {
    id: "a_oferta", chave: ["vilao"],
    pedido: { tom: ["suspense"], fala: "Deixe {cidade} e nenhum dos seus sofre — nem {alvo}." },
    crise: { tom: ["provação"], o: "o herói descobre de {sombra} uma coisa que não faz: {linha} — e que a pode usar", pior: "o herói descobre de {sombra} uma coisa que não faz: {linha} — e que a pode usar" },
    escolha: {
      tom: ["batalha", "emoção"], contexto: "{sombra} está diante do herói, e o herói conhece o que {ele} não faz",
      lados: [
        { id: "usar_a_linha", diz: "usar o que {ele} não faz", verbo: "Usar o que {ele} não faz", preco: "ganha-se sem metade do sangue — e a crónica guarda-o com vergonha", efeitos: [{ tipo: "cronica", guarda: "vergonha" }] },
        { id: "de_frente", diz: "enfrentá-{o} de frente", verbo: "De frente", preco: "a luta inteira", efeitos: [{ tipo: "combate", contra: "{sombra}" }] },
      ],
      omissao: { id: "de_frente_sem_mais", preco: "a luta inteira", efeitos: [{ tipo: "combate", contra: "{sombra}" }] },
    },
  },
  {
    id: "a_revelacao", chave: ["elo"],
    pedido: { tom: ["alívio", "emoção"], fala: "" },
    crise: { tom: ["suspense"], o: "", pior: "" },
    escolha: {
      tom: ["emoção", "provação"], contexto: "{nome} disse a verdade, e espera o que o herói faz dela",
      lados: [
        { id: "perdoar", diz: "o herói perdoá-{o}", verbo: "Perdoar", preco: "{nome} fica do seu lado por dentro, a mandar notícias falsas a {sombra} — e pode ser apanhad{o} um ato depois", efeitos: [{ tipo: "proposito", id: "sabotar_de_dentro" }] },
        { id: "expulsar", diz: "entregá-{o} ou mandá-{o} embora", verbo: "Expulsá-{o}", preco: "{nome} volta para {sombra} e leva o que sabe — o que {sombra} prepara chega mais cedo", efeitos: [{ tipo: "sai" }, { tipo: "dias", n: 2 }] },
      ],
      omissao: { id: "foge", preco: "{nome} foge, e leva o que sabe", efeitos: [{ tipo: "sai" }, { tipo: "dias", n: 2 }, { tipo: "laco", delta: -1 }] },
    },
  },
];

/* O pedido do elo sai do `quer` dele — pequeno e simpático de propósito: o
   jogador INVESTE ANTES DE SABER (§2.3, a_revelacao). Um por desejo da
   tabela do elo (ELO_DO_ANTECEDENTE, nucleo.js). */
export const PEDIDO_DO_ELO = {
  q_comprar: "Me ajude a juntar o que falta. Depois disso, sou livre.",
  q_divida_fim: "Me ajude a pagar o homem do porto. Depois disso, estou livre.",
  q_cadeira: "Diga uma palavra por mim a quem manda aqui. Só uma.",
  q_esquecer: "Se eu falar dormindo, me acorde. E não pergunte.",
  q_juramento: "Leve este cordão a um templo longe daqui. Eu não posso.",
  q_aldeia: "Leve estas mantas à aldeia do vale antes da neve.",
  q_mestria: "Veja o que faço uma vez, e me diga se presta.",
  q_partir: "Guarde isto para mim até eu partir. É pouco, mas é tudo.",
  q_reconstruir: "Me ajude a erguer uma parede. Só uma; o resto faço eu.",
  q_segredo_outro: "Se alguém perguntar por você, eu nunca vi você. Faça o mesmo por mim.",
  q_razao_guerra: "Me diga se a culpa foi minha. Ninguém mais me diz.",
  outro: "Me pague um copo e me ouça um pouco. É só isso.",
};

/* quando nenhum id da ficha casa com um arco: o tipo do que a pessoa
   carrega escolhe (a C1 dá a toda a gente um `carrega`). Decisão desta
   etapa — sem ela, um em cada quatro do núcleo ficava sem história. */
export const ARCO_DE_RESERVA = { culpa: "a_culpa_tarde", divida: "a_juramento", objeto: "a_carta" };

/* §3.3 — os modelos da linha (QUEM CARREGA). Frase fechada: sujeito, verbo,
   a ordem de que é fato. Nunca "pode", "se quiser". Nunca as palavras de
   bastidor (`QUEM_E.proibidas`) — por isso a escolha é "a decisão". */
export const LINHA_DO_CORACAO = {
  max: 220,
  pedido: "{nome} (é fato: entra nesta resposta, dito por {ele}): PEDE ao herói: \"{fala}\"",
  pedidoTraz: "{nome} (é fato: entra nesta resposta, dito por {ele}): traz {carrega}, e PEDE ao herói: \"{fala}\"",
  porque: "{nome} (é fato: entra nesta resposta, dito por {ele}): diz porquê — quer {quer}.",
  crise: "{nome} (é fato: entra nesta resposta): {crise}.",
  escolha: "{nome} (a decisão é do herói: não a feche): {contexto}. {nome} diz-lhe as duas saídas: {ladoA}, ou {ladoB}.",
  escolhaCurta: "{nome} (a decisão é do herói: não a feche): diz-lhe as duas saídas — {ladoA}, ou {ladoB}.",
  pistaA: "{nome} (é fato: entra nesta resposta): {pista}. Sem o explicar; se o herói perguntar, {nome} muda de assunto.",
  pistaB: "{nome} (é fato: entra nesta resposta, à vista): {pista}. Mostre-o sem o explicar; se o herói perguntar, {nome} muda de assunto.",
  revelacao: "{nome} (é fato: entra nesta resposta, dito por {ele}, inteiro): {revela}.",
  /* a mesma verdade, pela porta da fogueira (7.ª sessão, a proposta aprovada) */
  revelacaoAoFogo: "{nome} (é fato: entra nesta resposta, dito por {ele}, inteiro, à volta do fogo): {revela}.",
  corpo: "No que {nome} levava (é fato: entra nesta resposta, achado pelo herói): {carrega}, com {assinatura} no forro — {revela}.",
  mente: "{nome} (é fato: entra nesta resposta): mente ao herói sobre isso, e o herói percebe que mente; a verdade não sai.",
  oferta: "Um servo de {sombra} (é fato: entra nesta resposta, à mesa, sem se sentar): diz ao herói \"{fala}\"",
  sobreVilao: "Sobre {sombra} (é fato: entra nesta resposta): {crise}.",
  decidido: "{nome} (é fato: entra nesta resposta): o herói decidiu, e é assim — {preco}.",
  /* o que a linha corta primeiro quando passa do máximo: a voz, depois o
     que traz. A voz já não mora aqui: era " {tique}." — frase solta, lida
     como prosa na prova viva da v9.414 — e passou a `vozPresa` (nucleo.js),
     a mesma forma da QUEM É e da fogueira. */
};

/* ---------------- A PORTA DO ELO (9.ª sessão de prova, 12/10) ----------------
   Oren Trançado, o elo, esteve na lista da gente da cidade em TODAS as
   pautas da 9.ª até à viagem — e em nenhuma fala (0 de 48). Toda batida do
   coração espera que a pessoa esteja em cena (`emCena`: citada nas duas
   últimas falas do Mestre), e o elo só entraria em cena se o Mestre o
   trouxesse por acaso: o arco dele nem chegou a abrir, a pista A veio
   inventada e sem ele, e a revelação — o centro da régua — não pôde ser
   tentada. O ato 1 andava, e o antecedente do herói não tinha rosto.
   O elo não espera o acaso: é ELE quem vem ter com o herói. Com o herói na
   cidade do elo (`ctx.cidade`, que o App passa vazio em viagem e na
   masmorra), a partir do turno `turnoMin` da campanha, e de `volta` em
   `volta` turnos sem linha dele, a batida devida do elo (o pedido, as
   pistas, a revelação — enquanto a verdade não caiu) entra como se ele
   estivesse em cena, e a linha di-lo a chegar (`chega`). Na estreia (o
   pedido), a linha diz também QUEM ELE É para o herói (`quem`, com o
   `eraDoHeroi`) — é a ponte que a lista da cidade não fazia ("acólito" ×
   "mestre de recados"). Fora da luta, como toda batida que não é de luta. */
export const PORTA_DO_ELO = {
  turnoMin: 6,
  volta: 6,
  marca: "(é fato: entra nesta resposta",
  chega: "(é fato: vem ter com o herói e entra nesta resposta",
  quem: "({era}, do passado do herói; é fato: vem ter com o herói e entra nesta resposta",
};

/* as poucas frases de outras tabelas que dizem a palavra de bastidor
   (a reviravolta do caçador diz "a próxima pista") */
export const SEM_BASTIDOR = [["a próxima pista leva a", "o próximo rasto leva a"]];

/* §2.5 — o Livro de Promessas, ligado e não duplicado: as duas pistas
   semeiam-se na estreia do elo e regam-se quando a linha delas coube; a
   revelação colhe. DESVIO: a especificação dava peso "pesado", que no
   Livro pede três regas para amadurecer (`regasParaMadurar`) — e cada
   pista rega UMA vez (a linha vai uma vez). Com "pesado" nenhuma
   amadurecia e o Livro nunca pagava; "leve" amadurece na rega da sua
   linha e paga na revelação. */
export const PISTA_NO_LIVRO = { dona: "coracao", ato: 0, peso: "leve", formas: ["termo_fora_do_lugar", "brasao_limado"] };

/* ============================================================
   OS ARCOS DE UM NÚCLEO — derivados, deterministas
   ============================================================ */

const ORDEM = ["companheiro", "elo", "voz", "balanca", "vilao"];
const arcoPorId = (id) => ARCOS.find((a) => a.id === id) || null;
const GENERICOS = ARCOS.filter((a) => !["a_oferta", "a_revelacao"].includes(a.id)).map((a) => a.id);

/* as cidades, os lugares e os destinos que a espinha já tem */
function lugaresDaEspinha(espinha) {
  return arr(obj(espinha).atos).flatMap((a, k) => arr(obj(a).marcos).map((m) => ({ k, onde: String(obj(m).onde || ""), cidade: String(obj(m).cidade || "") }))).filter((x) => x.onde);
}

/* o tamanho da sombra no ato — o mesmo nome curto que o fio usa */
function sombraDoAto(espinha, ato) {
  const e = obj(espinha);
  const f = obj(e.fio);
  const ultimo = Math.max(0, arr(e.atos).length - 1);
  const a = Math.max(0, Math.floor(Number(ato)) || 0);
  const tam = a <= 0 ? "inicio" : a >= ultimo ? "fim" : "meio";
  if (!f.antagonista) return FIO.semMotivo.inicio;
  return encher(FIO.curta[tam] || FIO.curta.inicio, { nome: f.antagonista, titulo: f.titulo || f.antagonista });
}

/* `ctx`: { semente, espinha, elenco (opcional, para as casas) }.
   Devolve [{ nome, papel, genero, arco, pedido, crise, escolha, vars }] na
   ordem dos papéis — sem a porta (C3). Os textos vêm cheios menos o
   {sombra}, que depende do ato. Lixo devolve []. */
export function subtramasDoNucleo(nucleo, ctx) {
  const n = obj(nucleo);
  const o = obj(ctx);
  const s = String(o.semente == null ? "" : o.semente);
  const pessoas = arr(n.pessoas).filter((p) => p && p.nome);
  if (!pessoas.length) return [];
  const espinha = obj(o.espinha);
  const fio = obj(espinha.fio);
  const lugares = lugaresDaEspinha(espinha);
  const casas = arr(obj(o.elenco).casas).filter((c) => c && c.nome);
  const assinatura = String(fio.assinatura || RELOGIO_DO_FIO.assinaturas[0]);
  const vilao = pessoas.find((p) => p.papel === "vilao") || null;
  const parceiro = (nome) => {
    const t = arr(n.teia).find((x) => x && (x.a === nome || x.b === nome));
    if (!t) return "";
    const outro = t.a === nome ? t.b : t.a;
    return vilao && outro === vilao.nome ? "{sombra}" : outro;
  };
  const usados = new Set();
  const out = [];
  for (const papel of ORDEM) {
    for (const p of pessoas.filter((x) => x.papel === papel)) {
      const f = obj(p.ficha);
      const rnd = rngDe(`${s}|coracao|${p.nome}`);
      /* QUE ARCO: o do papel (elo, vilão), senão o primeiro id da ficha que
         casa com uma chave — o esconde primeiro (a não ser que seja de
         sombra: a máscara é das reviravoltas), depois o que carrega, o que
         quer, o que teme, a linha —, nunca um já dado; senão a reserva */
      let id = papel === "elo" ? "a_revelacao" : papel === "vilao" ? "a_oferta" : "";
      if (!id) {
        const ids = [f.esconde && !f.esconde.sombra ? f.esconde.id : "", obj(f.carrega).id, obj(f.quer).id, obj(f.teme).id, obj(f.linha).id].filter(Boolean);
        for (const x of ids) {
          const a = ARCOS.find((y) => GENERICOS.includes(y.id) && y.chave.includes(x) && !usados.has(y.id));
          if (a) { id = a.id; break; }
        }
        if (!id) { const r = ARCO_DE_RESERVA[obj(f.carrega).tipo]; if (r && !usados.has(r)) id = r; }
        if (!id) { const livres = GENERICOS.filter((x) => !usados.has(x)); id = livres.length ? livres[Math.floor(rnd() * livres.length)] : ""; }
      }
      if (!id) continue;
      usados.add(id);
      const A = arcoPorId(id);
      const genero = generoDaPessoa(p);
      const cidade = p.cidade || (lugares.find((x) => x.k === 0 && x.cidade) || {}).cidade || "";
      const fora = lugares.filter((x) => x.k >= 1 && x.cidade && norm(x.cidade) !== norm(cidade));
      const dest = fora.length ? fora[Math.floor(rnd() * fora.length)] : null;
      const perto = lugares.filter((x) => x.k === 0 && x.onde && norm(x.onde) !== norm(x.cidade));
      const lugar = perto.length ? perto[Math.floor(rnd() * perto.length)].onde : "";
      const casasOk = casas.filter((c) => !arr(c.membros).some((m) => mesmoNome(m, p.nome)));
      const casasPerto = casasOk.filter((c) => norm(c.cidade) === norm(cidade));
      const casa = (casasPerto.length ? casasPerto : casasOk)[0];
      const alvo = pessoas.find((x) => x.papel === "companheiro") || pessoas.find((x) => !["vilao"].includes(x.papel));
      const fig = FIGURA_DO_ARCO[id] ? figuraDo(FIGURA_DO_ARCO[id], p, s, o, pessoas) : null;
      const vars = {
        figura: fig ? fig.nome : SEM_NOME.figura,
        nome: p.papel === "vilao" ? "{sombra}" : p.nome,
        destino: dest ? (dest.cidade && norm(dest.cidade) !== norm(dest.onde) ? `${dest.onde}, em ${dest.cidade}` : dest.onde) : SEM_NOME.destino,
        cidade: cidade || SEM_NOME.lugar,
        lugar: lugar || SEM_NOME.lugar,
        casa: casa ? casa.nome : SEM_NOME.casa,
        outro: parceiro(p.nome) || SEM_NOME.outro,
        alvo: alvo ? alvo.nome : SEM_NOME.alvo,
        preco: PRECO_DO_PEDIDO.de + Math.floor(rnd() * (PRECO_DO_PEDIDO.ate - PRECO_DO_PEDIDO.de + 1)),
        assinatura,
        linha: f.linha ? f.linha.o : "",
      };
      const ench = (t) => noGenero(encher(t, vars), genero);
      const enchEf = (l) => arr(l).map((e) => Object.fromEntries(Object.entries(e).map(([k, v]) => [k, typeof v === "string" ? ench(v) : v])));
      const lado = (l) => ({ id: l.id, diz: ench(l.diz), verbo: ench(l.verbo), preco: ench(l.preco), efeitos: enchEf(l.efeitos) });
      let pedido = { tom: A.pedido.tom, fala: ench(A.pedido.fala) };
      let crise = { tom: A.crise.tom, o: ench(A.crise.o), pior: ench(A.crise.pior), efeitos: enchEf(A.crise.efeitos) };
      if (id === "a_revelacao") {
        pedido = { ...pedido, fala: PEDIDO_DO_ELO[obj(f.quer).id] || PEDIDO_DO_ELO.outro };
        const rev = obj(f.esconde).revela || "";
        crise = { ...crise, o: rev, pior: rev };
      }
      out.push({
        nome: p.nome, papel: p.papel, genero, arco: id,
        pedido, crise,
        escolha: { tom: A.escolha.tom, contexto: ench(A.escolha.contexto), lados: A.escolha.lados.map(lado), omissao: { id: A.escolha.omissao.id, preco: ench(A.escolha.omissao.preco), efeitos: enchEf(A.escolha.omissao.efeitos) } },
        vars,
        ...(fig ? { figura: fig } : {}),
      });
    }
  }
  return out;
}

/* a figura do arco: um nome do banco do mundo, semeado pela pessoa do
   núcleo, que ninguém do núcleo nem do elenco usa (pelo primeiro nome) */
function figuraDo(f, p, semente, o, pessoas) {
  const ocupados = new Set([...pessoas.map((x) => x.nome), ...arr(obj(o.elenco).pessoas).map((x) => x && x.nome)].filter(Boolean).map((n) => norm(n).split(/\s+/)[0]));
  const rnd = rngDe(`${semente}|figura|${p.nome}`);
  let nome = "";
  for (let i = 0; i < FIGURA_TENTATIVAS && !nome; i++) {
    const n = nomePessoa(String(o.genero || cenarioAtivo().generos.padrao), f.sexo, rnd, o.lex || null);
    if (!ocupados.has(norm(n).split(/\s+/)[0])) nome = n;
  }
  if (!nome) return null;
  return { nome, papel: `${f.papel} de ${p.nome}`, genero: f.sexo === "fem" ? "ela" : "ele", de: p.nome };
}

/* ============================================================
   O QUE O JOGO JÁ REGISTA — lido da espinha, nunca guardado aqui
   ============================================================ */

/* o dia em que o fecho do ato k se cumpriu (a batida de fecho, ou o último
   marco), ou null */
function diaDoFecho(espinha, k) {
  const a = arr(obj(espinha).atos)[k];
  const ms = arr(obj(a).marcos).filter(Boolean);
  if (!ms.length) return null;
  const f = ms.find((m) => obj(m.batida).fecho) || ms[ms.length - 1];
  if (!f.feito) return null;
  return finito(f.dia) ? f.dia : 0;
}
const algumMarcoFeito = (espinha) => arr(obj(espinha).atos).some((a) => arr(obj(a).marcos).some((m) => m && m.feito));
const ultimoAto = (espinha) => Math.max(0, arr(obj(espinha).atos).length - 1);
function etapaDe(espinha, nome, dia) {
  let et = [];
  try { et = relogioDoFio(espinha, { dia }); } catch { et = []; }
  return et.find((x) => x && x.gente && mesmoNome(x.gente, nome)) || null;
}

/* ============================================================
   A LINHA — corta pelo fim da oração, nunca a meio de uma palavra
   ============================================================ */
/* e a contração: a sombra do meio é "a Viúva de Ferro", e "servo de a
   Viúva" é o que o molde daria sem ela (`contrair`, lugar.js) */
function semBastidor(t) {
  let x = String(t || "");
  for (const [de, por] of SEM_BASTIDOR) x = x.split(de).join(por);
  return contrair(x);
}
function caber(texto, max = LINHA_DO_CORACAO.max) {
  let t = String(texto || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  /* a última fronteira de oração que cabe com o ponto final */
  const corte = t.slice(0, max - 1);
  const fronteiras = ["; ", " — ", ": ", ", e ", ", "].map((b) => corte.lastIndexOf(b)).filter((i) => i > 40);
  const i = fronteiras.length ? Math.max(...fronteiras) : corte.lastIndexOf(" ");
  t = t.slice(0, i > 0 ? i : max - 1).replace(/[,;:—\s]+$/, "");
  /* aspas abertas fecham-se, para a fala não ficar a meio */
  if ((t.match(/"/g) || []).length % 2) t = t.replace(/\s*"[^"]*$/, "");
  return /[.!?…]"?$/.test(t) ? t : `${t}.`;
}
const fechar = (t) => (/[.!?…]"?$/.test(t) ? t : `${t}.`);

function linhaDe(tipo, inst, extra, ctx, { cortar = true } = {}) {
  const o = obj(ctx);
  const sombra = sombraDoAto(o.espinha, o.ato);
  const v = { ...inst.vars, ...extra, sombra };
  const g = inst.genero;
  const ench = (t) => semBastidor(noGenero(encher(encher(t, v), { sombra }), g));
  /* o género depois do nome quando a linha não o diz (`comGenero`); o
     servo do vilão não é o vilão, e não o leva */
  const x = fechar(ench(LINHA_DO_CORACAO[tipo]));
  const y = tipo === "oferta" ? x : comGenero(x, inst);
  return cortar ? caber(y) : y;
}

/* a linha de quem chega pela porta do elo: a marca "entra nesta resposta"
   passa a "vem ter com o herói" (e, com `era`, diz quem ele é) — só
   se couber; senão fica a de sempre */
function pelaPortaDoElo(linha, era = "") {
  const x = String(linha || "");
  if (!x.includes(PORTA_DO_ELO.marca)) return x;
  const y = x.replace(PORTA_DO_ELO.marca, era ? encher(PORTA_DO_ELO.quem, { era }) : PORTA_DO_ELO.chega);
  return y.length <= LINHA_DO_CORACAO.max ? y : x;
}

/* o pedido: a fala é obrigatória; o tique e o que traz entram se couberem.
   `porta` (9.ª sessão): o elo que vem ter com o herói — quem ele é e a
   fala vêm antes do tique e do que traz */
function linhaDoPedido(inst, pessoa, ctx, { porta = false } = {}) {
  const o = obj(ctx);
  const f = obj(obj(pessoa).ficha);
  const sombra = sombraDoAto(o.espinha, o.ato);
  if (inst.papel === "vilao") return linhaDe("oferta", inst, { fala: inst.pedido.fala }, ctx);
  const g = inst.genero;
  const ench = (t, x) => semBastidor(noGenero(encher(encher(t, { ...inst.vars, ...x }), { sombra }), g));
  const fala = encher(inst.pedido.fala, { sombra });
  const voz = vozPresa(pessoa);
  const tique = voz ? ` ${voz}.` : "";
  const traz = f.carrega && f.carrega.tipo === "objeto" ? f.carrega.o : "";
  const max = LINHA_DO_CORACAO.max;
  const tentativas = [
    traz ? ench(LINHA_DO_CORACAO.pedidoTraz, { fala, carrega: traz }) + tique : "",
    ench(LINHA_DO_CORACAO.pedido, { fala }) + tique,
    traz ? ench(LINHA_DO_CORACAO.pedidoTraz, { fala, carrega: traz }) : "",
    ench(LINHA_DO_CORACAO.pedido, { fala }),
  ].filter(Boolean).map((t) => comGenero(t, inst));
  if (porta) {
    const era = String(obj(pessoa).eraDoHeroi || "");
    const comEra = era ? tentativas.map((t) => pelaPortaDoElo(t, era)).filter((t) => t.includes(era)) : [];
    const chega = tentativas.map((t) => pelaPortaDoElo(t)).filter((t) => t.includes(PORTA_DO_ELO.chega));
    const ok = [...comEra, ...chega].find((t) => t.length <= max);
    if (ok) return ok;
  }
  return tentativas.find((t) => t.length <= max) || caber(tentativas[tentativas.length - 1]);
}

function linhaDaEscolha(inst, ctx) {
  const o = obj(ctx);
  const sombra = sombraDoAto(o.espinha, o.ato);
  const [A, B] = inst.escolha.lados;
  const v = { ...inst.vars, contexto: inst.escolha.contexto, ladoA: A.diz, ladoB: B.diz, sombra };
  const ench = (t) => semBastidor(noGenero(encher(encher(t, v), { sombra }), inst.genero));
  const cheia = comGenero(ench(LINHA_DO_CORACAO.escolha), inst);
  return cheia.length <= LINHA_DO_CORACAO.max ? cheia : caber(comGenero(ench(LINHA_DO_CORACAO.escolhaCurta), inst));
}

/* ============================================================
   QUEM REPARA — a frase do jogador casa o elo e uma pista que já viu
   ============================================================ */
/* MM-C · 7.ª sessão de prova (M55): "entro no galpão… ponho diante DELA o
   verso e a pena queimada. Digo que isso é a marca de quem ela serve, e
   quero o nome" — o elo em cena, as duas pistas vistas e as duas na frase,
   e a revelação não veio: o confronto exigia o primeiro NOME do elo, e o
   jogador disse "dela". Com o elo em cena e um sinal de CADA pista vista na
   frase (`semNome.pistas`), o nome não é preciso — ninguém aponta duas
   provas a quem não está à frente dele. Com uma pista só, o nome continua
   a ser preciso ("de onde vem isso, verso?" não é acusação a ninguém).
   E `furaODia`: a revelação que o JOGADOR ganhou pelo confronto não espera
   por o dia não ter outra crise (a de Tônia caiu no mesmo dia, M52) — a
   regra "uma crise por dia" é do ritmo do sistema, não um veto à verdade
   que o jogador foi buscar. A sessão provou o preço de esperar: o
   Narrador, sem a linha, inventa o álibi e adia. */
export const CONFRONTO = { tamanhoMinimo: 5, vazias: ["sempre", "mesma", "mesmo", "outra", "outro", "nunca", "ninguem", "quando", "baixinho", "dele", "dela", "desta", "deste", "terra", "minuto", "certo"], semNome: { pistas: 2 }, furaODia: true };
function confrontou(frase, inst, pessoa, pistasVistas) {
  const f = norm(frase);
  if (!f || !pistasVistas) return false;
  const nome = norm(inst.nome).split(/\s+/)[0];
  const disse = nome.length >= 3 && f.split(/[^a-z0-9]+/).includes(nome);
  const pistas = arr(obj(obj(obj(pessoa).ficha).esconde).pistas).slice(0, pistasVistas).map((x) => x.o || "");
  const palavras = (t) => norm(t).split(/[^a-z0-9]+/).filter((w) => w.length >= CONFRONTO.tamanhoMinimo && !CONFRONTO.vazias.includes(w));
  const ditas = new Set(palavras(f));
  const citadas = pistas.filter((t) => palavras(t).some((w) => ditas.has(w))).length;
  if (disse) return citadas > 0;
  return pistas.length >= CONFRONTO.semNome.pistas && citadas >= CONFRONTO.semNome.pistas;
}

/* ============================================================
   O QUE ESTÁ MADURO — a batida devida de uma pessoa, ou null
   ============================================================ */
function devida(inst, arco, pessoa, c, ctx, todos) {
  const o = obj(ctx);
  const dia = Math.floor(Number(o.dia)) || 0;
  const ato = Math.max(0, Math.floor(Number(o.ato)) || 0);
  const ult = ultimoAto(o.espinha);
  const A = ANCORA_DO_PAPEL[inst.papel];
  if (!A || A.c3) return null;
  const a = arco;
  const R = RELOGIO_DAS_BATIDAS;
  const temDia = (x) => x != null;
  if (inst.papel === "companheiro") {
    if (!temDia(a.pedido)) return ato >= A.pedido.atoMin && dia >= A.pedido.diaMin && (!A.pedido.depoisDaPrimeiraBatida || algumMarcoFeito(o.espinha)) ? "pedido" : null;
    if (!temDia(a.crise)) {
      const fecho = diaDoFecho(o.espinha, Math.min(A.crise.fechoDoAto, ult));
      const elo = todos.elo;
      const comElo = A.crise.ouRevelacaoDoElo && elo && arr(obj(o.nucleo).teia).some((t) => (t.a === inst.nome && t.b === elo.nome) || (t.b === inst.nome && t.a === elo.nome));
      const eloRevelou = comElo && temDia(obj(c.arcos[elo.nome]).crise) && dia > c.arcos[elo.nome].crise;
      return fecho != null || eloRevelou ? "crise" : null;
    }
    if (!a.escolha && !temDia(a.posta)) return ato >= Math.min(A.escolha.ato, ult) && dia > a.crise ? "escolha" : null;
    return null;
  }
  if (inst.papel === "elo") {
    if (!temDia(a.pedido)) return ato >= A.pedido.atoMin ? "pedido" : null;
    if (a.pistas.length === 0) return dia >= a.pedido ? "pistaA" : null;
    if (a.pistas.length === 1) return dia >= a.pistas[0] ? "pistaB" : null;
    if (!temDia(a.crise)) return a.pistas.length >= A.crise.pistas && diaDoFecho(o.espinha, A.crise.fechoDoAto) != null ? "revelacao" : null;
    if (!a.escolha && !temDia(a.posta)) return ato >= A.escolha.atoMin && dia > a.crise ? "escolha" : null;
    return null;
  }
  if (inst.papel === "voz") {
    if (!temDia(a.pedido)) return "pedido";
    if (!temDia(a.crise)) {
      const et = arr((() => { try { return relogioDoFio(o.espinha, { dia }); } catch { return []; } })()).find((x) => x.ato === A.crise.ouRelogioDoAto);
      return dia - a.pedido >= A.crise.dias.de || (et && et.como) ? "crise" : null;
    }
    if (!a.escolha && !temDia(a.posta)) return ato <= A.escolha.atoMax && dia > a.crise ? "escolha" : null;
    return null;
  }
  if (inst.papel === "balanca") {
    const et = etapaDe(o.espinha, inst.nome, dia);
    if (!temDia(a.pedido)) return !et || et.como !== "cumprida" ? "pedido" : null;
    if (!temDia(a.crise)) return et && (et.como || dia >= et.prazo) ? "crise" : null;
    if (!a.escolha && !temDia(a.posta)) return et && et.como === "travada" && dia > a.crise ? "escolha" : null;
    return null;
  }
  if (inst.papel === "vilao") {
    if (!temDia(a.pedido)) return o.maoDoVilao && ato >= A.pedido.atoMin && (!A.pedido.antesDoUltimo || ato < ult) ? "pedido" : null;
    if (!temDia(a.crise)) return (o.maoDoVilao || o._vilaoEmCena) && ato >= Math.max(1, ult - A.crise.atosAntesDoFim) && dia - a.pedido >= A.crise.dias ? "crise" : null;
    if (!a.escolha && !temDia(a.posta)) return o._vilaoEmCena && ato >= ult ? "escolha" : null;
    return null;
  }
  return null;
}

/* as revelações que já caíram: as do coração (a crise do elo) + as que o
   App diz de fora (a máscara do aliado, `reviravoltas.js`) */
function reveladas(c, insts, ctx) {
  const de = insts.filter((i) => i.arco === "a_revelacao").map((i) => ({ i, a: c.arcos[i.nome] })).filter((x) => x.a && x.a.crise != null).map((x) => ({ nome: x.i.nome, ato: x.a.ato == null ? 0 : x.a.ato }));
  return [...de, ...arr(obj(ctx).reveladas).map(obj).filter((r) => r.nome)];
}

const arcoVazio = () => ({ pedido: null, resposta: "", crise: null, escolha: "", pistas: [], posta: null, ato: null, porque: false, contados: [], noites: 0 });

/* ============================================================
   O TURNO — `avancarCoracao(coracao, nucleo, ctx)`

   `ctx`: { semente, espinha, elenco, dia, ato, turno, emCena: [nomes],
     ultimas: { [nome]: turno da última linha dela } (ref do App),
     luta (verdadeiro numa luta), frase (o que o jogador escreveu),
     mortos: [nomes], maoDoVilao (o bilhete ou os servos do fio estão na
     cena — o App sabe-o pelo momento do fio), reveladas: [{ nome, ato }]
     (as revelações de fora, como a máscara do aliado), subtramas (o cache
     de `subtramasDoNucleo`, opcional), e (13/10) o que diz quem está
     longe: cidade, longe (o `elencoDaCena(...).longe`), presentes (o
     `aqui`), grupo — opcionais }.

   Devolve { coracao, batida, linha, quem, efeitos, longe }:
     · `batida`: { nome, tipo, tom, lados? } — no máximo UMA por turno;
     · `linha`: a linha QUEM CARREGA (≤ 220), ou "";
     · `efeitos`: o que o App aplica (a omissão de quem não escolheu, a
       crise que marca alguém na luta);
     · `longe`: o que se resolveu sem o herói ({ nome, texto }), para o
       ENTRETANTO.
   O App guarda `coracao` só se a linha COUBE na pauta (ou se não havia
   linha — a omissão vale sempre). Nunca muta o que recebe.
   ============================================================ */
export function avancarCoracao(coracao, nucleo, ctx) {
  const o = obj(ctx);
  const C0 = garantirCoracaoDoSave(coracao);
  const out = { coracao: C0, batida: null, linha: "", quem: "", efeitos: [], longe: [] };
  const n = obj(nucleo);
  const pessoas = arr(n.pessoas).filter((p) => p && p.nome);
  if (!pessoas.length) return out;
  const insts = Array.isArray(o.subtramas) ? o.subtramas : subtramasDoNucleo(n, o);
  if (!insts.length) return out;
  const dia = Math.floor(Number(o.dia)) || 0;
  const ato = Math.max(0, Math.floor(Number(o.ato)) || 0);
  const ult = ultimoAto(o.espinha);
  const turno = Math.floor(Number(o.turno)) || 0;
  /* 13/10 (a prova viva da v9.458): a batida é de quem está à frente. Quem a
     história sabe noutra cidade (longeDaHistoria, nucleo.js: o registo, o
     núcleo, a espinha) não "entra nesta resposta" porque a prosa o citou — a
     10.ª sessão trouxe QUEM CARREGA Neirin com ele a oito horas. A porta do
     elo (PORTA_DO_ELO) continua aberta: ela só abre na cidade dele, e a
     linha dela diz que ele VEM ter com o herói. */
  const longe = longeDaHistoria({ longe: o.longe, presentes: o.presentes, nucleo: n, espinha: o.espinha, cidade: o.cidade, grupo: o.grupo });
  const emCena = arr(o.emCena).map(String).filter(Boolean).filter((x) => !longe.some((l) => mesmoNome(l.nome, x)));
  const mortos = arr(o.mortos).map(String);
  const esta = (nome) => emCena.some((x) => mesmoNome(x, nome));
  const morto = (nome) => mortos.some((x) => mesmoNome(x, nome));
  const ultimas = obj(o.ultimas);
  const ultimaDe = (nome) => { const k = Object.keys(ultimas).find((x) => mesmoNome(x, nome)); return k == null ? null : Number(ultimas[k]); };
  const arcos = { ...C0.arcos };
  const arcoDe = (nome) => ({ ...arcoVazio(), ...(arcos[nome] || {}) });
  const pessoaDe = (nome) => pessoas.find((p) => p.nome === nome) || null;
  const todos = { elo: insts.find((i) => i.papel === "elo") || null };
  const R = RELOGIO_DAS_BATIDAS;
  const ctxL = { ...o, nucleo: n };
  const omitir = (inst, a, porque) => {
    const om = inst.escolha.omissao;
    arcos[inst.nome] = { ...a, escolha: om.id, ...(a.crise == null ? { crise: dia, ato } : {}) };
    for (const e of om.efeitos) out.efeitos.push({ ...e, nome: inst.nome, porOmissao: true });
    out.longe.push({ nome: inst.nome, texto: fechar(semBastidor(`${maiuscula(encher(om.preco, { sombra: sombraDoAto(o.espinha, ato) }))}`)), porque });
  };

  /* 1. OS PRAZOS — a omissão de quem não escolheu, a crise que passou longe */
  for (const inst of insts) {
    const a = arcoDe(inst.nome);
    if (a.escolha) continue;
    if (a.posta != null && dia - a.posta >= R.esperaDaEscolha) { omitir(inst, a, "prazo"); continue; }
    if (inst.papel === "voz" && a.pedido != null && a.crise == null && dia - a.pedido > ANCORA_DO_PAPEL.voz.crise.dias.ate && !esta(inst.nome)) { omitir(inst, a, "longe"); continue; }
    if (inst.papel === "voz" && a.crise != null && a.posta == null && ato > ANCORA_DO_PAPEL.voz.escolha.atoMax) { omitir(inst, a, "ato"); continue; }
    if (inst.papel === "balanca" && a.pedido != null) {
      const et = etapaDe(o.espinha, inst.nome, dia);
      if (et && et.como === "cumprida" && a.posta == null) { omitir(inst, a, "ela"); continue; }
    }
    if (inst.papel === "companheiro" && a.crise != null && a.posta == null && (ato > Math.min(ANCORA_DO_PAPEL.companheiro.escolha.ato, ult) || (ato === Math.min(ANCORA_DO_PAPEL.companheiro.escolha.ato, ult) && ANCORA_DO_PAPEL.companheiro.escolha.antesDoFecho && diaDoFecho(o.espinha, ato) != null && ato < ult))) { omitir(inst, a, "ato"); continue; }
    if (inst.papel === "elo" && a.crise != null && a.posta == null && ato > ANCORA_DO_PAPEL.elo.escolha.atoMin) { omitir(inst, a, "ato"); continue; }
  }
  const comPrazos = { v: C0.v, arcos };
  out.coracao = comPrazos;

  /* 2. A BATIDA DO TURNO — uma só, pela ordem dos papéis */
  const jaCrise = Object.values(arcos).some((a) => a && a.crise === dia);
  const rev = reveladas(comPrazos, insts, o);
  const espacado = (nome, diaAntes) => { const u = ultimaDe(nome); return u != null && Number.isFinite(u) ? turno - u >= R.turnosEntreBatidas : dia > (diaAntes == null ? -1 : diaAntes); };
  /* A PORTA DO ELO (PORTA_DO_ELO): o herói na cidade dele, a verdade por
     cair, o turno mínimo e a volta desde a última linha dele */
  const cidadeDoHeroi = norm(o.cidade);
  const naPortaDoElo = (inst, p, a) => {
    if (inst.papel !== "elo" || !cidadeDoHeroi || a.crise != null || o.luta) return false;
    if (norm(obj(p).cidade || inst.vars.cidade) !== cidadeDoHeroi || turno < PORTA_DO_ELO.turnoMin) return false;
    const u = ultimaDe(inst.nome);
    return u == null || !Number.isFinite(u) || turno - u >= PORTA_DO_ELO.volta;
  };
  for (const inst of insts) {
    const p = pessoaDe(inst.nome);
    const a = arcoDe(inst.nome);
    const vilao = inst.papel === "vilao";
    const presente = vilao ? (!!o.maoDoVilao || esta(inst.nome)) : esta(inst.nome);
    const eloMorto = inst.papel === "elo" && morto(inst.nome);
    const pelaPorta = !presente && !eloMorto && naPortaDoElo(inst, p, a);
    if (!presente && !eloMorto && !pelaPorta) continue;
    let tipo = null;
    let porConfronto = false;
    /* quem repara chega antes: o elo confrontado com o que já se viu */
    if (inst.papel === "elo" && !eloMorto && a.crise == null && a.pistas.length && confrontou(o.frase, inst, p, a.pistas.length)) {
      tipo = a.pistas.length >= ANCORA_DO_PAPEL.elo.crise.pistas ? "revelacao" : "mente";
      porConfronto = true;
    }
    if (eloMorto) tipo = a.crise == null && diaDoFecho(o.espinha, ANCORA_DO_PAPEL.elo.crise.fechoDoAto) != null ? "corpo" : null;
    if (!tipo) {
      tipo = devida(inst, a, p, comPrazos, { ...ctxL, _vilaoEmCena: vilao && esta(inst.nome) }, todos);
      if (!tipo) continue;
      /* o espaço entre duas linhas da mesma pessoa: a pista nunca no fôlego
         do pedido, nem a segunda no da primeira */
      const antes = { pistaA: a.pedido, pistaB: a.pistas[0] }[tipo];
      if (antes != null && !espacado(inst.nome, antes)) continue;
    }
    /* nunca duas crises no mesmo dia; nunca duas revelações no mesmo ato */
    const ehCrise = ["crise", "revelacao", "corpo"].includes(tipo);
    if (ehCrise && jaCrise && !(porConfronto && CONFRONTO.furaODia)) continue;
    if (["revelacao", "corpo"].includes(tipo) && !revelacaoPermitida(n, inst.nome, ato, rev)) continue;
    /* na luta, só o que é da luta (o irmão do outro lado está NA luta) */
    const tom = tipo === "pedido" ? inst.pedido.tom : ehCrise ? inst.crise.tom : tipo === "escolha" ? inst.escolha.tom : [];
    if (o.luta && !tom.includes("batalha")) continue;
    const pior = ehCrise && a.pedido != null && !a.resposta && dia - a.pedido >= R.esperaDoPedido;
    let linha = "";
    let novo = a;
    if (tipo === "pedido") { linha = linhaDoPedido(inst, p, o, { porta: pelaPorta }); novo = { ...a, pedido: dia }; }
    else if (tipo === "pistaA" || tipo === "pistaB") {
      const i = tipo === "pistaA" ? 0 : 1;
      const pista = obj(arr(obj(obj(p).ficha.esconde).pistas)[i]).o || "";
      if (!pista) continue;
      linha = linhaDe(tipo, inst, { pista: encher(pista, { sombra: sombraDoAto(o.espinha, ato) }) }, o);
      novo = { ...a, pistas: [...a.pistas, dia] };
    } else if (tipo === "revelacao" || tipo === "corpo") {
      linha = linhaDaRevelacao(tipo, inst, p, o);
      novo = { ...a, crise: dia, ato };
    } else if (tipo === "mente") {
      linha = linhaDe("mente", inst, {}, o);
    } else if (tipo === "crise") {
      const txt = pior ? inst.crise.pior : inst.crise.o;
      linha = vilao ? linhaDe("sobreVilao", inst, { crise: txt }, o) : linhaDe("crise", inst, { crise: txt }, o);
      novo = { ...a, crise: dia, ato };
      for (const e of arr(inst.crise.efeitos)) out.efeitos.push({ ...e, nome: inst.nome });
    } else if (tipo === "escolha") {
      linha = linhaDaEscolha(inst, o);
      novo = { ...a, posta: dia };
    }
    if (!linha) continue;
    if (pelaPorta && tipo !== "pedido") linha = pelaPortaDoElo(linha);
    arcos[inst.nome] = novo;
    out.coracao = { v: C0.v, arcos: { ...arcos } };
    out.linha = linha;
    out.quem = inst.nome;
    out.batida = { nome: inst.nome, tipo, tom: tom.slice(), ...(pior ? { pior: true } : {}), ...(porConfronto ? { porConfronto: true } : {}), ...(pelaPorta ? { pelaPorta: true } : {}), ...(tipo === "escolha" ? { lados: ladosParaTela(inst, o) } : {}), ...(["pistaA", "pistaB"].includes(tipo) ? { pista: tipo === "pistaA" ? 0 : 1 } : {}) };
    break;
  }
  out.coracao = garantirCoracaoDoSave(out.coracao);
  return out;
}

/* a linha da verdade do elo — a mesma pelas duas portas (o confronto, de
   pé, e a fogueira, por convite): `tipo` é "revelacao", "corpo" ou
   "revelacaoAoFogo" (que, se não couber, cai na de pé — a verdade inteira
   vale mais do que dizer onde) */
function linhaDaRevelacao(tipo, inst, pessoa, ctx) {
  const o = obj(ctx);
  const leva = levaDoFecho(o.espinha);
  const revela = encher(inst.crise.o, { sombra: sombraDoAto(o.espinha, 0), leva: leva || "o que vem a seguir", cidade: inst.vars.cidade });
  const extra = { revela, carrega: obj(obj(obj(pessoa).ficha).carrega).o || "" };
  if (tipo === "revelacaoAoFogo") {
    const aoFogo = linhaDe("revelacaoAoFogo", inst, extra, o, { cortar: false });
    if (aoFogo.length <= LINHA_DO_CORACAO.max) return aoFogo;
    return linhaDe("revelacao", inst, extra, o);
  }
  return linhaDe(tipo, inst, extra, o);
}

/* a peça seguinte depois do fecho do ato 0 — o {leva} da reviravolta, como
   o fio o diz (`FIO.leva`) */
function levaDoFecho(espinha) {
  const e = obj(espinha);
  const atos = arr(e.atos);
  const ms0 = arr(obj(atos[0]).marcos).filter(Boolean);
  const f = ms0.find((m) => obj(m.batida).fecho) || ms0[ms0.length - 1];
  if (!f) return "";
  const ordem = atos.flatMap((a) => arr(obj(a).marcos).filter(Boolean));
  const i = ordem.indexOf(f);
  const prox = ordem.slice(i + 1).find((x) => !x.feito) || ordem[i + 1];
  if (!prox) return "";
  const naCidade = prox.cidade && norm(prox.cidade) !== norm(prox.onde) ? `, em ${prox.cidade}` : "";
  return encher(FIO.leva[prox.feitio] || FIO.leva.descer, { ...prox, sombra: sombraDoAto(e, 1), naCidade });
}

/* ============================================================
   O VEREDITO ANTES DO CLIQUE — os lados como dado para a tela
   ============================================================ */
function ladosParaTela(inst, ctx) {
  const sombra = sombraDoAto(obj(ctx).espinha, obj(ctx).ato);
  return inst.escolha.lados.map((l) => ({ id: l.id, verbo: maiuscula(semBastidor(encher(l.verbo, { sombra }))), preco: semBastidor(encher(l.preco, { sombra })) }));
}

/* as decisões que estão postas e por responder — o App mostra-as na forma
   `A escolha`, cada uma com o preço em mundo (§2.4). Nunca "lado A". */
export function escolhasAbertas(coracao, nucleo, ctx) {
  const o = obj(ctx);
  const C = garantirCoracaoDoSave(coracao);
  const insts = Array.isArray(o.subtramas) ? o.subtramas : subtramasDoNucleo(nucleo, o);
  const dia = Math.floor(Number(o.dia)) || 0;
  return insts.filter((i) => { const a = C.arcos[i.nome]; return a && a.posta != null && !a.escolha; }).map((i) => {
    const a = C.arcos[i.nome];
    return { nome: i.nome, contexto: semBastidor(encher(i.escolha.contexto, { sombra: sombraDoAto(o.espinha, o.ato) })), lados: ladosParaTela(i, o), resta: Math.max(0, RELOGIO_DAS_BATIDAS.esperaDaEscolha - (dia - a.posta)) };
  });
}

/* o pedido como opções (aceitar, recusar, perguntar porquê) — ignorar é
   não responder, e o relógio corre */
export const RESPOSTAS_AO_PEDIDO = [
  { id: "aceitou", verbo: "Aceitar", preco: "{nome} conta com você" },
  { id: "recusou", verbo: "Recusar", preco: "{nome} fica {sozinho} com isto" },
  { id: "porque", verbo: "Perguntar porquê", preco: "{nome} lhe diz o que quer, sem custo" },
];
export function opcoesDoPedido(inst) {
  const i = obj(inst);
  if (!i.nome || i.papel === "vilao") return [];
  return RESPOSTAS_AO_PEDIDO.map((r) => ({ id: r.id, verbo: r.verbo, preco: noGenero(encher(r.preco, { nome: i.nome }), i.genero) }));
}

/* o jogador respondeu ao pedido. "porque" não fecha nada: abre o `quer` e
   o tique (a linha vem de volta). Devolve { coracao, linha }. */
export function responderPedido(coracao, nucleo, nome, resposta, ctx) {
  const C = garantirCoracaoDoSave(coracao);
  const out = { coracao: C, linha: "" };
  const o = obj(ctx);
  const insts = Array.isArray(o.subtramas) ? o.subtramas : subtramasDoNucleo(nucleo, o);
  const inst = insts.find((i) => mesmoNome(i.nome, nome));
  if (!inst) return out;
  const a = { ...arcoVazio(), ...(C.arcos[inst.nome] || {}) };
  if (a.pedido == null || a.resposta) return out;
  if (resposta === "porque") {
    const p = arr(obj(nucleo).pessoas).find((x) => x && x.nome === inst.nome);
    const q = obj(obj(obj(p).ficha).quer).o || "";
    out.coracao = garantirCoracaoDoSave({ ...C, arcos: { ...C.arcos, [inst.nome]: { ...a, porque: true } } });
    out.linha = q ? linhaDe("porque", inst, { quer: encher(q, { sombra: sombraDoAto(o.espinha, o.ato) }) }, o) : "";
    return out;
  }
  if (!["aceitou", "recusou"].includes(resposta)) return out;
  out.coracao = garantirCoracaoDoSave({ ...C, arcos: { ...C.arcos, [inst.nome]: { ...a, resposta } } });
  return out;
}

/* O herói escolheu um lado. Só vale com a decisão posta e por responder.
   Devolve { coracao, efeitos, linha } — os efeitos com os buracos cheios;
   o "fica ou parte" do nome falso decide-se pela semente. */
export function escolherLado(coracao, nucleo, nome, ladoId, ctx) {
  const C = garantirCoracaoDoSave(coracao);
  const out = { coracao: C, efeitos: [], linha: "", luta: null };
  const o = obj(ctx);
  const insts = Array.isArray(o.subtramas) ? o.subtramas : subtramasDoNucleo(nucleo, o);
  const inst = insts.find((i) => mesmoNome(i.nome, nome));
  if (!inst) return out;
  const a = C.arcos[inst.nome];
  if (!a || a.posta == null || a.escolha) return out;
  const lado = inst.escolha.lados.find((l) => l.id === ladoId);
  if (!lado) return out;
  const sombra = sombraDoAto(o.espinha, o.ato);
  const r = rngDe(`${String(o.semente == null ? "" : o.semente)}|coracao|${inst.nome}|${lado.id}`);
  out.efeitos = lado.efeitos.map((e) => {
    const x = Object.fromEntries(Object.entries(e).map(([k, v]) => [k, typeof v === "string" ? encher(v, { sombra }) : v]));
    if (x.talvez) { const { talvez, ...resto } = x; return r() < 0.5 ? { ...resto, nome: inst.nome } : { tipo: "nada", nome: inst.nome }; }
    return { ...x, nome: inst.nome };
  }).filter((e) => e.tipo !== "nada");
  out.coracao = garantirCoracaoDoSave({ ...C, arcos: { ...C.arcos, [inst.nome]: { ...a, escolha: lado.id } } });
  out.linha = linhaDe("decidido", inst, { preco: encher(lado.preco, { sombra }) }, o);
  out.efeitos = out.efeitos.map((e) => Object.fromEntries(Object.entries(e).map(([k, v]) => [k, typeof v === "string" ? semBastidor(v) : v])));
  /* 7.ª sessão (M59–M61): o lado que promete uma luta devolve com quem ela é
     — o App abre-a com isto (`abrirCombate([{ nome, ameaca }])`), sem
     depender do registo. `ctx.presentes` (o elenco da cena) e
     `ctx.mostrado` (as últimas falas do Mestre) afinam o nome. */
  const brigas = lado.efeitos.filter((e) => e && ["combate", "duelo"].includes(e.tipo) && e.contra);
  if (brigas.length) {
    const e = brigas[0];
    const contra = semBastidor(encher(e.contra, { sombra }));
    const alvo = alvoPrometido(contra, { presentes: o.presentes, mostrado: o.mostrado, sombra: e.contra === "{sombra}" });
    /* E1: a figura do arco tem nome desde a linha da crise — o cartão já não
       luta contra "Velho camarada" quando o registo e a prosa calam */
    const comFigura = alvo.deOnde === "cartao" && inst.figura && inst.figura.nome ? { ...alvo, nome: inst.figura.nome, deOnde: "figura" } : alvo;
    out.luta = { ...comFigura, duelo: e.tipo === "duelo", contra };
  }
  return out;
}

/* ---------------- UM FAVOR, UMA FORMA (7.ª sessão de prova, M26–M27) ----------------
   Hilda pediu ao herói pela linha do coração ("Leve esta carta a Sal
   Morto") e, no mesmo turno, o Cronista pregou o mesmo favor no mural: a
   soleira ficou com "Aceitar o que Hilda pede" E "Aceitar: A carta para Sal
   Morto · +59 XP". O jogador tocou no primeiro; o envelope do mural ("o
   papel está no mural") ganhou, e o Mestre devolveu o envelope — o aceite
   desmentido. A regra: quem do núcleo já fez o pedido ao herói (o arco tem
   `pedido`) não tem cartaz no mural — o favor é o pedido. Devolve o nome
   da pessoa do núcleo que já pediu (o App não prega o cartaz), ou "". */
export function favorJaPedido(dador, coracao, nucleo) {
  /* "Hilda, a taverneira" / "Hilda (Peixe Cego)" é a Hilda */
  const d = String(dador == null ? "" : dador).split(/[,(—–]/)[0].trim();
  if (!d) return "";
  const p = arr(obj(nucleo).pessoas).find((x) => x && x.nome && x.papel !== "vilao" && mesmoNome(x.nome, d));
  if (!p) return "";
  const C = garantirCoracaoDoSave(coracao);
  const k = Object.keys(C.arcos).find((x) => mesmoNome(x, p.nome));
  return k != null && C.arcos[k].pedido != null ? p.nome : "";
}

/* §2.5 — as duas sementes do elo para o Livro de Promessas (o App semeia-as
   na estreia dele, rega a i-ésima quando a batida `pista` i coube, e paga
   as duas na revelação). O material é a pista, que nunca diz o segredo. */
export function sementesDoElo(nucleo, { dia = 0 } = {}) {
  const elo = arr(obj(nucleo).pessoas).find((p) => p && p.papel === "elo");
  if (!elo) return [];
  return arr(obj(obj(elo.ficha).esconde).pistas).slice(0, 2).map((pi, i) => ({
    forma: PISTA_NO_LIVRO.formas[i], dona: PISTA_NO_LIVRO.dona, ato: PISTA_NO_LIVRO.ato, peso: PISTA_NO_LIVRO.peso,
    alvo: elo.nome, material: String(obj(pi).o || ""), dia: Math.floor(Number(dia)) || 0,
  }));
}

/* ============================================================
   A FOGUEIRA (aprovada pela pessoa, 11/10) — as peças do motor
   `mente/formas.md`, "Fogueira" §7: quem se senta e com que voz, o gesto
   que se vê (nunca a coisa dita), se a noite aguenta sem resposta, a porta,
   a frase da manhã, e o que cada um já contou (no `coracao` do save).
   ============================================================ */

/* o gesto que se vê no lugar — diz que há uma coisa, nunca qual. O objeto
   vê-se (é a sua natureza); o resto é um gesto. Nada dos TIQUES_PROIBIDOS. */
export const GESTOS_DA_FOGUEIRA = {
  querFalar: "quer falar com você",
  objeto: {
    c_carta: "vira e revira uma carta lacrada",
    c_anel: "gira um anel no dedo, sem o pôr",
    c_chave: "aquece na mão uma chave velha",
    c_lamina_partida: "limpa uma lâmina partida, sem cabo",
    c_dente: "aperta no punho uma bolsinha de couro",
    c_livro_riscado: "abre um livro na guarda e fecha-o logo",
    c_mapa_canto: "alisa no joelho um mapa a que falta um canto",
    c_moeda_furada: "rola nos dedos a moeda furada do pescoço",
    c_lenco: "dobra e desdobra um lenço",
    c_veneno: "esconde na manga um frasco pequeno",
    c_sino: "abafa com a mão um sino de cabra",
    c_distintivo: "esfrega com o polegar um distintivo velho",
    c_retrato: "olha um papel dobrado à luz do fogo",
    c_corda_nos: "enrola nos dedos a corda de treze nós",
    c_pedra: "pousa uma pedra lisa junto às brasas",
    c_tabua: "passa o dedo por um nome gravado numa tábua",
    outro: "não larga o que traz consigo",
  },
  divida: ["conta moedas que não chegam", "olha a estrada por onde veio"],
  culpa: ["atiça o fogo sem precisar", "senta-se de costas para a estrada"],
  quer: ["desenha qualquer coisa na terra com um pau", "fala baixo do que fará depois disto"],
  linha: ["afia a faca devagar", "aperta o cinto como quem se prepara"],
  teme: ["atira lenha a cada barulho do mato", "senta-se do lado de onde vem o escuro"],
  calado: ["aquece as mãos ao fogo", "come em silêncio", "ouve o lume estalar"],
};

/* a porta (C3): abre-se pelo jogador — quem se senta duas noites ao lado da
   mesma pessoa está a dizer alguma coisa (§2.2: "quando o herói lhe dá
   atenção duas vezes"). A C3 dirá o resto. */
export const PORTA_DO_CORACAO = { noitesParaAbrir: 2 };

/* as batidas que a fogueira pode trazer: o pedido que ainda não se fez, e a
   decisão que está posta. A crise e as pistas são da cena, não da noite. */
const BATIDAS_DA_NOITE = ["pedido", "escolha"];

/* ---------------- A VERDADE AO LUME (7.ª sessão de prova — a proposta aprovada pela pessoa, 11/10) ----------------
   A sessão provou que, de pé, o Narrador adia a verdade: com as duas pistas
   dadas e o elo a ser confrontado (M45–M55), inventou o álibi ("a pena é
   da minha mãe, o verso é do meu pai") e mandou esperar "a maré baixa". A
   fogueira já é o sítio onde o jogo diz "o que de dia não diz", e as
   frases fechadas dela foram cumpridas 10 de 10. Então a fogueira é a
   SEGUNDA PORTA da revelação: com as duas pistas vistas e a verdade ainda
   por cair (e permitida neste ato, `revelacaoPermitida`), o elo à roda
   tem um gesto que diz que há uma coisa (nunca qual), e sentar-se ao lado
   dele traz a revelação, inteira, na voz dele — por CONVITE, não por
   confronto. As duas portas dão a mesma linha (`linhaDaRevelacao`) e
   gravam o mesmo `crise`/`ato` no arco: a que abrir primeiro fecha a
   outra. Uma só vez.
   `voz` fica "ficha" (a forma que a roda e a manhã já sabem ler: "o que
   {nome} contou ao pé do fogo" é verdade) e `revela: true` diz ao App que
   esta noite é a da verdade (o Livro paga as duas sementes, como no
   confronto). */
export const REVELACAO_AO_FOGO = {
  gesto: "olha o fogo como quem pesa o que vai dizer",
  manha: "revelacao",
  porque: "as revelações que se lembram não são ditas numa discussão, são ditas ao lume",
};

function batidaDaNoite(inst, pessoa, c, ctx, todos) {
  const a = { ...arcoVazio(), ...(c.arcos[inst.nome] || {}) };
  if (a.posta != null && !a.escolha) return "escolha";
  if (inst.papel === "elo") {
    if (a.pedido == null) return "pedido";
    const o = obj(ctx);
    const ato = Math.max(0, Math.floor(Number(o.ato)) || 0);
    const madura = a.crise == null && a.pistas.length >= ANCORA_DO_PAPEL.elo.crise.pistas;
    return madura && revelacaoPermitida(o.nucleo, inst.nome, ato, reveladas(c, arr(todos && todos.insts), o)) ? "revelacao" : null;
  }
  const t = devida(inst, a, pessoa, c, ctx, todos);
  return BATIDAS_DA_NOITE.includes(t) ? t : null;
}

/* (1) quem se senta: `ctx` = { coracao, presentes: [nomes] (o grupo; na
   estalagem, quem está na cidade — o App decide), dia, ato, espinha,
   semente, subtramas }. Devolve [{ pessoa, papel, voz, gesto, batida }] na
   ordem dos papéis, sem o vilão (que não se senta ao fogo):
   voz "pedido" (há uma batida madura — «quer falar com você»), "ficha"
   (conta um campo na voz dela) ou null (calado — e continua clicável). */
export function quemAoFogo(nucleo, ctx) {
  const o = obj(ctx);
  const n = obj(nucleo);
  const presentes = arr(o.presentes).map(String).filter(Boolean);
  const C = garantirCoracaoDoSave(o.coracao);
  const insts = Array.isArray(o.subtramas) ? o.subtramas : subtramasDoNucleo(n, o);
  const todos = { elo: insts.find((i) => i.papel === "elo") || null, insts };
  const ordem = ["companheiro", "elo", "voz", "balanca", "porta"];
  const out = [];
  for (const papel of ordem) {
    for (const p of arr(n.pessoas).filter((x) => x && x.nome && x.papel === papel)) {
      if (!presentes.some((x) => mesmoNome(x, p.nome))) continue;
      const inst = insts.find((i) => i.nome === p.nome);
      const batida = inst ? batidaDaNoite(inst, p, C, { ...o, nucleo: n, emCena: [p.nome] }, todos) : null;
      const contados = obj(C.arcos[p.nome]).contados || [];
      if (batida === "revelacao") {
        out.push({ pessoa: p.nome, papel: p.papel, voz: "ficha", gesto: REVELACAO_AO_FOGO.gesto, batida, revela: true });
        continue;
      }
      const ficha = batida ? null : fichaNaVoz(p, { contados, fio: obj(o.espinha).fio });
      const voz = batida ? "pedido" : ficha ? "ficha" : null;
      out.push({ pessoa: p.nome, papel: p.papel, voz, gesto: gestoAoFogo(p, voz, ficha ? ficha.campo : "", o), batida });
    }
  }
  return out;
}

/* (2) o gesto: «quer falar com você» na batida madura; o objeto à vista ou
   um gesto do campo que vai contar; calado, um gesto qualquer */
export function gestoAoFogo(pessoa, voz, campo, ctx) {
  const p = obj(pessoa);
  const f = obj(p.ficha);
  const r = rngDe(`${String(obj(ctx).semente == null ? "" : obj(ctx).semente)}|fogueira|${p.nome}|${campo || voz || "calado"}`);
  const pick = (l) => (l.length ? l[Math.floor(r() * l.length)] : "");
  if (voz === "pedido") return GESTOS_DA_FOGUEIRA.querFalar;
  if (voz === "ficha" && campo === "carrega") {
    const c = obj(f.carrega);
    if (c.tipo === "objeto") return GESTOS_DA_FOGUEIRA.objeto[c.id] || GESTOS_DA_FOGUEIRA.objeto.outro;
    return pick(GESTOS_DA_FOGUEIRA[c.tipo] || GESTOS_DA_FOGUEIRA.calado);
  }
  if (voz === "ficha" && GESTOS_DA_FOGUEIRA[campo]) return pick(GESTOS_DA_FOGUEIRA[campo]);
  return pick(GESTOS_DA_FOGUEIRA.calado);
}

/* (3) a noite aguenta sem resposta? Acende «Dormir sem responder» só se o
   relógio da batida não acaba antes de amanhã */
export function aguentaANoite(coracao, nome, ctx) {
  const C = garantirCoracaoDoSave(coracao);
  const k = Object.keys(C.arcos).find((x) => mesmoNome(x, nome));
  if (k == null) return true;
  const a = C.arcos[k];
  const amanha = (Math.floor(Number(obj(ctx).dia)) || 0) + 1;
  if (a.posta != null && !a.escolha) return amanha - a.posta < RELOGIO_DAS_BATIDAS.esperaDaEscolha;
  if (a.pedido != null && !a.resposta && a.crise == null) return amanha - a.pedido < RELOGIO_DAS_BATIDAS.esperaDoPedido;
  return true;
}

/* (4) a porta está aberta? Só pelo jogador: as noites ao lado dela */
export function portaAberta(coracao, nucleo) {
  const porta = arr(obj(nucleo).pessoas).find((p) => p && p.papel === "porta");
  if (!porta) return false;
  const a = garantirCoracaoDoSave(coracao).arcos[porta.nome];
  return !!a && a.noites >= PORTA_DO_CORACAO.noitesParaAbrir;
}

/* (6) sentar-se ao lado de alguém: a batida da noite (o pedido, ou a
   decisão posta — com os lados), senão um campo da ficha na voz dela (e
   fica nos `contados`), senão nada; a noite conta sempre. Devolve
   { coracao, voz, linha, lados, campo }. */
export function sentarAoFogo(coracao, nucleo, nome, ctx) {
  const o = obj(ctx);
  const n = obj(nucleo);
  const C = garantirCoracaoDoSave(coracao);
  const out = { coracao: C, voz: null, linha: "", lados: [], campo: "", revela: false };
  const p = arr(n.pessoas).find((x) => x && x.nome && mesmoNome(x.nome, nome) && x.papel !== "vilao");
  if (!p) return out;
  const insts = Array.isArray(o.subtramas) ? o.subtramas : subtramasDoNucleo(n, o);
  const inst = insts.find((i) => i.nome === p.nome);
  const todos = { elo: insts.find((i) => i.papel === "elo") || null, insts };
  const dia = Math.floor(Number(o.dia)) || 0;
  const a = { ...arcoVazio(), ...(C.arcos[p.nome] || {}) };
  const noite = { ...a, noites: a.noites + 1 };
  const batida = inst ? batidaDaNoite(inst, p, C, { ...o, nucleo: n, emCena: [p.nome] }, todos) : null;
  if (batida === "revelacao") {
    const ato = Math.max(0, Math.floor(Number(o.ato)) || 0);
    out.voz = "ficha";
    out.revela = true;
    out.linha = linhaDaRevelacao("revelacaoAoFogo", inst, p, o);
    out.coracao = garantirCoracaoDoSave({ ...C, arcos: { ...C.arcos, [p.nome]: { ...noite, crise: dia, ato } } });
    return out;
  }
  if (batida === "escolha") {
    out.voz = "pedido";
    out.linha = linhaDaEscolha(inst, o);
    out.lados = ladosParaTela(inst, o);
    out.coracao = garantirCoracaoDoSave({ ...C, arcos: { ...C.arcos, [p.nome]: { ...noite, posta: a.posta == null ? dia : a.posta } } });
    return out;
  }
  if (batida === "pedido") {
    out.voz = "pedido";
    out.linha = linhaDoPedido(inst, p, o);
    out.coracao = garantirCoracaoDoSave({ ...C, arcos: { ...C.arcos, [p.nome]: { ...noite, pedido: dia } } });
    return out;
  }
  const r = fichaNaVoz(p, { contados: a.contados, fio: obj(o.espinha).fio });
  if (r) {
    out.voz = "ficha";
    out.linha = r.linha;
    out.campo = r.campo;
    out.coracao = garantirCoracaoDoSave({ ...C, arcos: { ...C.arcos, [p.nome]: { ...noite, contados: [...a.contados, r.campo] } } });
    return out;
  }
  out.coracao = garantirCoracaoDoSave({ ...C, arcos: { ...C.arcos, [p.nome]: noite } });
  return out;
}

/* (5) a frase verdadeira do ladrilho da manhã (D/E). `noite`: { tipo:
   "vazio" | "dormir" | "ficha" | "pedido" | "lado" | "porta" |
   "semResposta", nome, genero, preco }. */
export const MANHA_DA_FOGUEIRA = {
  vazio: "Ninguém tinha muito a dizer à volta do fogo; dormiu-se cedo.",
  dormir: "Dormiu-se sem conversa à volta do fogo.",
  ficha: "Ficou com você, da noite, o que {nome} contou ao pé do fogo.",
  pedido: "{nome} lhe pediu uma coisa à volta do fogo, e a manhã ainda a traz.",
  lado: "Ficou decidido à volta do fogo: {preco}.",
  porta: "Você ficou mais um pouco com {nome}, só vocês dois.",
  semResposta: "{nome} esperou a sua resposta, e a manhã ainda a traz.",
  revelacao: "Ficou com você, da noite, o que {nome} confessou ao pé do fogo.",
};
export function fraseDaManha(noite) {
  const x = obj(noite);
  const tpl = MANHA_DA_FOGUEIRA[x.tipo] || MANHA_DA_FOGUEIRA.vazio;
  const t = noGenero(encher(tpl, { nome: x.nome || "", preco: x.preco || "" }), x.genero);
  return /\{(nome|preco)\}/.test(t) ? MANHA_DA_FOGUEIRA.vazio : fechar(t.replace(/\.\.$/, "."));
}

