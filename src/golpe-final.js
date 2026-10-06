/* ============================================================
   O GOLPE FINAL É SEU (Fase MM · MM3 = Q3 + Q5) — letal, poupar, e
   "como você faz isso?"

   AS PALAVRAS DA PESSOA, que são a regra inteira:

   Q3 (14/09): *"quando o player rola o dano, o sistema identifica se
   aquele ataque reduz a vida do inimigo a 0; se sim, pergunta se o golpe
   é letal ou não letal. Se letal, mata; se não letal, o inimigo fica
   desacordado podendo acordar em 1d4 horas."* E a razão: *"nem sempre
   precisa matar uma criatura — assim podendo desmaiá-la, depois prender
   e interrogar, ou tomar o controle. Abre muitas possibilidades."*

   Q5 (15/09): quando o inimigo chega a 0 e o jogador escolhe, o sistema
   pergunta ***"como você faz isso?"*** — e o que ele escrever é o que o
   Narrador narra. O exemplo dela: *"vou correndo em direção a ele,
   deslizo no chão e passo no meio das pernas dele cortando as duas, e
   enquanto ele cai eu me levanto e corto a cabeça dele dizendo 'mexeu
   com a pessoa errada'"*.

   ---------------- POR QUE ISTO É O MÓDULO QUE É ----------------

   É O ÚNICO MOMENTO DO JOGO EM QUE O JOGADOR DIRIGE EM VEZ DE AGIR, e
   cai exatamente onde a emoção já está no pico. O sistema já decidiu
   tudo o que importa — o golpe acertou, o dano leva a zero, a escolha
   foi feita — e por isso a prosa pode ser LIVRE: não há regra em
   disputa. É o avesso de deixar a IA decidir o combate. Aqui ela narra
   o que o código já resolveu, que é a lei da casa na sua melhor forma.

   E é por isso que a frase do jogador NUNCA manda no desfecho. Se ele
   escreve que corta a cabeça de quem escolheu poupar, quem manda é a
   escolha, não a frase: o envelope diz isso ao Narrador com todas as
   letras, e o veto de morte vai para `naoPode`, onde veto mora.

   ---------------- O QUE O MÓDULO DECIDE, EM QUATRO PORTAS ----------------

   · `haEscolhaNoGolpe` — HÁ pergunta? Só quando há escolha de verdade:
     o golpe fere, não é imune, leva a zero quem estava de pé, e não é
     dano de área nem morte instantânea. Área não pergunta porque seriam
     N perguntas num golpe só; a instantânea não pergunta porque o efeito
     já escolheu por ele.
   · `decidirGolpeFinal` — a PREFERÊNCIA de quem não quer ser perguntado
     toda vez: `perguntar`, `sempre_letal`, `sempre_poupar`.
   · `aplicarEscolha` — o CORPO novo do alvo. Letal: morto, como hoje.
     Não letal: desacordado, fora da luta (`derrotado`, para a luta
     acabar), e acorda em 1d4 horas — por semente, nunca `Math.random`.
   · `envelopeDoGolpeFinal` — o que vai à PAUTA DO TURNO: o fato e a
     cena na lista `acabou` do envelope e, quando é poupar, o veto na
     `naoPode`. Nada de bloco estático no prompt: o texto do jogador é do
     turno e morre com ele.
   · `golpeFinalNaPauta` (MM14, MM16) — ONDE esse envelope entra: a lista
     `acabou` vai à seção DESFECHO e a `naoPode` à `vetoDoDesfecho`, as
     duas de FERRO (`PRIO_DE_FERRO`, pauta.js). A MM14 tirou a frase da
     ACABOU DE (prio 3) para o DESFECHO de prio 2, e a 3.ª sessão ainda a
     perdeu 2 em 2: a razão, com os números, está no cabeçalho do teto,
     logo abaixo.

   PULAR É UM CLIQUE: escrever é opcional. Sem cena, o envelope leva só
   o fato — quem não quer escrever não é punido nem atrasado.

   ---------------- O SAVE NÃO MUDA ----------------

   Nenhum campo existente muda de sentido. `desacordado` (booleano) e
   `acordaEmHoras` (inteiro, 1..4) são campos NOVOS e ADITIVOS no inimigo:
   a versão antiga, lendo um save novo, ignora os dois e vê o que sempre
   viu — `vida: 0, derrotado: true`, um inimigo fora da luta. O letal não
   acrescenta campo nenhum (e tira os dois, se o corpo os trazia), para
   que matar continue a ser byte a byte o que era.

   ---------------- O QUE ESTE MÓDULO NÃO FAZ ----------------

   Não liga nada ao `App.jsx` (a fiação é outra mão) e não resolve o que
   o corpo desacordado ABRE — prender, interrogar, carregar, acordar e
   voltar é Q4. E não pergunta a `queda.js` "cai ou morre?": o letal aqui
   é o comportamento de hoje, e quem passa a consultar `quedaAoChegarAZero`
   para o inimigo importante é Q2. Uma nota para essa etapa: o inimigo
   importante que o jogador escolhe matar deve continuar a respeitar a
   porta única de `queda.js` — a escolha diz a INTENÇÃO, a queda diz o
   que o corpo aguenta.
   ============================================================ */

import { hashSemente, rng } from "./semente.js";
import { porNaPauta } from "./pauta.js";

/* ---------------- AS DUAS ESCOLHAS ----------------

   `rotulo` é o que o botão pode mostrar; `id` é o que viaja. As duas são
   gameplay (a pessoa pediu-as pelo nome), não bastidor. */
export const ESCOLHAS_DO_GOLPE_FINAL = {
  letal: { id: "letal", rotulo: "Matar" },
  nao_letal: { id: "nao_letal", rotulo: "Poupar" },
};

/* A ESCOLHA DE LIXO É LETAL, e o motivo é a regressão zero: hoje todo
   golpe que leva a zero mata. Uma escolha que chega torta (save velho,
   clique perdido, envelope malformado) não pode inventar um desacordado
   que ninguém escolheu — e o erro ao contrário seria pior, porque um
   inimigo poupado por acidente é uma semente de Q4 que o jogador não
   plantou. */
const ESCOLHA_PADRAO = "letal";

/* ---------------- AS TRÊS PREFERÊNCIAS ----------------

   `decide` é o que a preferência responde sem perguntar; `null` é
   "pergunte". O padrão é PERGUNTAR porque o momento é a razão do órgão:
   quem nunca viu a pergunta não sabe que pode poupar. */
export const PREFERENCIAS_DO_GOLPE_FINAL = {
  perguntar: { id: "perguntar", rotulo: "Perguntar a cada golpe final", decide: null },
  sempre_letal: { id: "sempre_letal", rotulo: "Sempre matar", decide: "letal" },
  sempre_poupar: { id: "sempre_poupar", rotulo: "Sempre poupar", decide: "nao_letal" },
};
export const PREFERENCIA_PADRAO = "perguntar";

/* ---------------- O DADO DO DESPERTAR ----------------

   1d4 horas, as palavras dela. `unidadeUma` existe só para a frase não
   dizer "1 horas". */
export const DADO_DO_DESPERTAR = { qtd: 1, lados: 4, unidade: "horas", unidadeUma: "hora" };

/* ---------------- O TETO DA CENA DO JOGADOR ----------------

   240 caracteres do texto dele vão à pauta; o resto é cortado na última
   palavra inteira, com reticências. A conta:

   · O EXEMPLO DA PESSOA tem 187 caracteres e tem de caber INTEIRO — é a
     cena que define o órgão. 240 dá-lhe ~28% de folga (duas frases
     longas a mais, ou uma fala de despedida).
   · A LINHA DA CENA, com a moldura (quem, a ordem de narrar, "a escolha
     manda"), fica em 446 caracteres (425 até a MM16, que pôs na moldura
     "abra a narração por isto") no pior caso medido pela suíte (nome
     de 36 letras, herói de 21, cena no teto) — menos de um terço do
     `TETO_DA_PAUTA` (1400). Era 467 até a MM14, que tirou da moldura o
     que não dizia nada novo ("com a sua voz", "se ela poupa, ajuste o
     gesto —"): cada caractere da moldura é um que a frase do jogador
     disputa com o resto do turno. Com 280 a linha ia a ~520. 240 é o
     ponto em que o exemplo dela cabe e o turno ainda respira.
   · E ELA JÁ NÃO CAI (MM14, 30/09). A primeira versão punha a cena na
     segunda linha de ACABOU DE (prio 3,1) e contava com ~320 caracteres
     livres no resto do turno. Nenhum turno jogado os tinha: ONDE e NÃO
     PODE de uma cena comum já gastam mais do que isso, e o corte da pauta
     é guloso — a cena de ~400 não cabia e o CONTRA (prio 5), menor,
     entrava no lugar dela. A sessão de prova (MM11) viu 3 em 3 golpes
     finais sem a frase escrita ("abre um peixe", "quina de um caixote")
     em nenhuma das 99 chamadas, e no terceiro nem o fato. Agora o fato e
     a cena vão à seção DESFECHO, de prio 2 como A FALA: entram depois do
     ONDE e ao lado dos vetos. O preço, medido em teste-mm14-continuidade:
     no turno da sessão saem o MOMENTO e o CONTRA (prio 3 e 5); numa pauta
     cheia e poupando, também o segundo veto (o empate de prio 2 vai pela
     ordem de leitura, como o da FALA); no pior de todos (nome de 36
     letras, poupar, cena no teto, pauta cheia) é a cena que cede, nunca o
     fato nem o veto. O teto (1400) não se move um caractere.
   · E A PRIO 2 AINDA NÃO BASTOU (MM16 nº 5, 05/10). A 3.ª sessão perdeu a
     frase 2 em 2 (M21 e M30), e o registo das chamadas prova porquê: o
     ONDE de um turno de luta numa masmorra tinha QUATRO linhas de prio 1 —
     o lugar, as coordenadas, o que o espaço comporta e 264 caracteres da
     economia da cidade — e o corte, guloso, enchia-as antes do DESFECHO.
     No M30: 1164 gastos antes da cena, a cena com 287, o teto 1400. A MM14
     tinha provado a frase com um ONDE só do Geógrafo, sem a economia. Agora
     o DESFECHO e o veto de quem caiu são de FERRO (abaixo de toda prio, na
     pauta.js; só a 1.ª linha do ONDE lhes ganha no empate), e a economia
     cede em luta e masmorra (`SECOES_QUE_CEDEM`). Com a cena no teto, o
     nome de 36 letras e poupando, o ferro inteiro (fato, cena e veto) gasta
     774 de 1400, ao lado da cabeça (293) e do lugar: cabe sempre, e quem
     cede é o que não é do turno.
     Medido em teste-como-chega: 500 lutas semeadas, 500 frases inteiras. */
export const TETO_DA_CENA_DO_JOGADOR = 240;

/* ---------------- OS MOTIVOS (diagnóstico, nunca tela) ----------------

   Não exportados: quem pergunta de fora lê `ha` e, se quiser log, o
   `motivo` que volta. O sistema não fala de si mesmo — nenhum destes
   aparece ao jogador. */
const MOTIVOS = {
  leva_a_zero: "o golpe leva a zero quem estava de pé",
  sem_golpe: "sem alvo ou sem golpe resolvido",
  ja_caido: "o alvo já estava fora da luta",
  area: "dano de área não pergunta — seriam N perguntas num golpe só",
  instantanea: "morte instantânea — o efeito já escolheu",
  nao_fere: "o golpe não fere (errou, imune ou zero)",
  nao_leva_a_zero: "o alvo continua de pé",
};

/* ---------------- OS TEXTOS DO ENVELOPE ----------------

   O QUE e o COM QUEM, nunca o COMO (cabeçalho de `pauta.js`). A única
   prosa que entra é a do jogador, entre aspas e marcada como dele. */
const TEXTOS = {
  heroiSemNome: "o herói",
  fatoLetal: (h, n) => `${h} deu o golpe final em ${n}, e foi para matar: ${n} está morto.`,
  fatoPoupar: (h, n, horas) => `${h} deu o golpe final em ${n} e o poupou: ${n} está desacordado, vivo, fora da luta${horas ? ` — acorda em ${horas} se ninguém fizer nada` : ""}.`,
  /* MM16 nº 5: "abra por ela" — a frase é o que o jogador acabou de dizer,
     e o M21 e o M30 abriram os dois pelo mesmo "golpe no flanco" que
     ninguém escreveu. +17 caracteres, pagos pelo ferro. */
  cena: (h, cena) => `COMO ${h} FEZ, nas palavras do jogador: “${cena}”. Abra a narração por isto, ampliado, sem copiar nem desmentir.`,
  mandaLetal: (n) => ` Quem manda é a escolha, não a frase: ${n} morreu.`,
  mandaPoupar: (n) => ` Quem manda é a escolha, não a frase: ${n} ficou vivo.`,
  vetoPoupar: (n) => `${n} morrer nesta cena: está desacordado e vivo`,
};

/* ---------------- AS PEÇAS PEQUENAS ---------------- */

const ehObj = (x) => !!x && typeof x === "object" && !Array.isArray(x);

/* O nome que viaja numa linha de pauta: uma linha só, sem as aspas que
   fecham a cena nem os colchetes que forjariam um envelope de sistema. */
function limpar(s) {
  return String(s == null ? "" : s)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/["“”«»„]/g, "'")
    .replace(/\[/g, "(").replace(/\]/g, ")")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* Corta no teto, na última palavra inteira, e as reticências contam para
   o teto — o número da tabela é o que chega, não o que se pede. */
function cortar(s, teto) {
  if (s.length <= teto) return s;
  const miolo = s.slice(0, Math.max(0, teto - 1));
  const esp = miolo.lastIndexOf(" ");
  const base = esp > teto * 0.6 ? miolo.slice(0, esp) : miolo;
  return base.replace(/[\s,;:.—-]+$/, "") + "…";
}

function nomeDoHeroi(heroi) {
  const cru = ehObj(heroi) ? heroi.nome : heroi;
  return limpar(typeof cru === "string" ? cru : "") || TEXTOS.heroiSemNome;
}

function horasEmPalavras(h) {
  const n = Number(h);
  if (!Number.isInteger(n) || n < 1) return "";
  return `${n} ${n === 1 ? DADO_DO_DESPERTAR.unidadeUma : DADO_DO_DESPERTAR.unidade}`;
}

function escolhaValida(escolha) {
  const id = String(escolha == null ? "" : escolha).trim().toLowerCase();
  return ESCOLHAS_DO_GOLPE_FINAL[id] ? id : ESCOLHA_PADRAO;
}

/* ---------------- 1. HÁ ESCOLHA NESTE GOLPE? ----------------

   Devolve SEMPRE `{ ha, motivo }`, mesmo para lixo — o molde de
   `quedaAoChegarAZero`: um `null` no caso torto obrigaria cada chamador a
   ter o seu plano B. `= {}` não cobre `null`, por isso o objeto é testado
   antes de ser lido.

   `alvo` é o corpo como está AGORA (a vida antes deste golpe); `r` é o
   que `resolverAtaque` devolveu, depois do `escopoImune` do App. */
export function haEscolhaNoGolpe(entrada) {
  const e = ehObj(entrada) ? entrada : {};
  const alvo = ehObj(e.alvo) ? e.alvo : null;
  const r = ehObj(e.r) ? e.r : null;
  const nao = (m) => ({ ha: false, motivo: MOTIVOS[m] });
  if (!alvo || !r) return nao("sem_golpe");
  const vida = Number(alvo.vida);
  if (!Number.isFinite(vida)) return nao("sem_golpe");
  if (vida <= 0 || alvo.derrotado === true) return nao("ja_caido");
  if (e.area === true) return nao("area");
  if (e.instantanea === true) return nao("instantanea");
  const dano = Number(r.dano);
  if (r.escopoImune === true || r.resultado === "imune" || !Number.isFinite(dano) || dano <= 0) return nao("nao_fere");
  if (vida - dano > 0) return nao("nao_leva_a_zero");
  return { ha: true, motivo: MOTIVOS.leva_a_zero };
}

/* ---------------- 2. PERGUNTAR, OU A PREFERÊNCIA RESPONDE? ----------------

   `"perguntar"` quando a tela tem de perguntar; senão, a escolha que a
   preferência já tomou. Preferência de lixo cai no padrão (perguntar):
   o erro barato é uma pergunta a mais, nunca uma morte que ninguém
   escolheu. */
export function decidirGolpeFinal(preferencia) {
  const id = String(preferencia == null ? "" : preferencia).trim().toLowerCase();
  const p = PREFERENCIAS_DO_GOLPE_FINAL[id] || PREFERENCIAS_DO_GOLPE_FINAL[PREFERENCIA_PADRAO];
  return p.decide || PREFERENCIA_PADRAO;
}

/* ---------------- 3. O CORPO DEPOIS DA ESCOLHA ----------------

   Estado NOVO; o recebido fica intacto. O que não é corpo volta como
   veio — quem chama isto está a mapear a lista de inimigos, e trocar um
   elemento torto por `null` derrubaria a luta inteira.

   A sorte entra por `semente` (texto ou número, somada ao nome do alvo
   para que dois poupados no mesmo turno não acordem em bloco) ou por
   `sorte` (um gerador `() => [0,1)`); sem nenhum dos dois, a semente é o
   próprio nome — determinístico na mesma, nunca `Math.random`. */
export function aplicarEscolha(alvo, escolha, opcoes) {
  if (!ehObj(alvo)) return alvo;
  const o = ehObj(opcoes) ? opcoes : {};
  const { desacordado: _d, acordaEmHoras: _a, ...resto } = alvo;
  if (escolhaValida(escolha) === "letal") return { ...resto, vida: 0, derrotado: true };
  const nome = String(alvo.nome == null ? "" : alvo.nome);
  const temSemente = o.semente != null && o.semente !== "";
  const sorte = temSemente
    ? rng(hashSemente(`despertar|${String(o.semente)}|${nome}`))
    : typeof o.sorte === "function" ? o.sorte : rng(hashSemente(`despertar|${nome}`));
  const { qtd, lados } = DADO_DO_DESPERTAR;
  let horas = 0;
  for (let i = 0; i < qtd; i++) {
    const x = Number(sorte());
    const u = Number.isFinite(x) ? Math.min(Math.max(x, 0), 0.999999) : 0;
    horas += 1 + Math.floor(u * lados);
  }
  return { ...resto, vida: 0, derrotado: true, desacordado: true, acordaEmHoras: horas };
}

/* ---------------- 4. O QUE VAI À PAUTA ----------------

   Devolve `{ acabou: [], naoPode: [] }` — o molde de `leiParaPauta`
   (`lei-da-forma.js`), uma lista por seção, pronta para `porNaPauta`.
   `alvo` é o corpo DEPOIS de `aplicarEscolha` (é dele que sai a hora do
   despertar); `comoFez` é o texto do jogador, opcional.

   `acabou[0]` é o FATO, sempre. `acabou[1]` é a CENA, só se ele escreveu
   — e traz a ordem de a narrar ampliada e a regra de que a escolha manda.
   `naoPode` leva o veto de morte quando é poupar: veto na seção de veto,
   que é a última a ser cortada. Lixo devolve as duas listas vazias. */
export function envelopeDoGolpeFinal(entrada) {
  const vazio = { acabou: [], naoPode: [] };
  const e = ehObj(entrada) ? entrada : {};
  const alvo = ehObj(e.alvo) ? e.alvo : null;
  const nome = alvo ? limpar(alvo.nome) : "";
  if (!nome) return vazio;
  const h = nomeDoHeroi(e.heroi);
  const poupou = escolhaValida(e.escolha) === "nao_letal";
  const acabou = [poupou ? TEXTOS.fatoPoupar(h, nome, horasEmPalavras(alvo.acordaEmHoras)) : TEXTOS.fatoLetal(h, nome)];
  const cena = cortar(limpar(typeof e.comoFez === "string" ? e.comoFez : ""), TETO_DA_CENA_DO_JOGADOR);
  if (cena) acabou.push(TEXTOS.cena(h, cena) + (poupou ? TEXTOS.mandaPoupar(nome) : TEXTOS.mandaLetal(nome)));
  return { acabou, naoPode: poupou ? [TEXTOS.vetoPoupar(nome)] : [] };
}

/* ---------------- 4b. ONDE O ENVELOPE ENTRA NA PAUTA (MM14) ----------------

   A PORTA ÚNICA entre o envelope do turno e a pauta. O ref do App que o
   guarda (`golpeFinalEnvelopeRef`) junta mais do que o golpe do herói: o
   golpe do grupo (MM3b), a palavra que rende (MM9) e os prisioneiros —
   todos no mesmo formato `{ acabou, naoPode }`, todos o DESFECHO de uma
   luta, todos coisas que o Narrador não pode desmentir. A lista `acabou`
   vai à seção `desfecho` (prio 2) e a `naoPode` à de veto.

   E OS VETOS DESTE TURNO VÃO À SEÇÃO DELES (MM16). Na MM14 iam à frente
   do NÃO PODE (2,0) — à frente dos outros vetos, mas atrás do ONDE
   inteiro. Agora vão à `vetoDoDesfecho`, de FERRO como o DESFECHO, com o
   rótulo do NÃO PODE e colada a ele: o Narrador lê o mesmo bloco de vetos
   com o do turno na primeira linha, como lia, e o fato, a frase e o veto
   de quem acabou de cair cedem só depois de tudo o resto.

   Recebe a pauta como está e devolve uma NOVA; a recebida fica intacta
   (`porNaPauta` não muta). Envelope de lixo — `null`, sem listas, listas
   tortas — devolve a pauta como veio: o golpe final nunca pode custar o
   turno. */
const SECAO_DO_DESFECHO = "desfecho";
const SECAO_DO_VETO = "vetoDoDesfecho";
export function golpeFinalNaPauta(pauta, envelope) {
  const e = ehObj(envelope) ? envelope : {};
  const soTexto = (l) => (Array.isArray(l) ? l : []).filter((x) => typeof x === "string" && x.trim());
  const p = porNaPauta(pauta, SECAO_DO_DESFECHO, ...soTexto(e.acabou));
  return porNaPauta(p, SECAO_DO_VETO, ...soTexto(e.naoPode));
}

/* ---------------- 5. AS QUEDAS DE UMA RODADA (MM3b · o golpe final é do grupo) ----------------

   A pessoa: os companheiros têm iniciativa mais alta e chegam primeiro ao
   último golpe — o momento do jogador nunca vinha. A resposta: o golpe
   final é do GRUPO. Quando quem derruba é um companheiro (ou o próprio
   herói, por um golpe de oportunidade), o cartão sobe igual — só que UMA
   vez por RODADA, nunca uma vez por queda.

   Esta é a PORTA SECA que decide quem entra nesse cartão único: um passeio
   pelos golpes de uma rodada, NA ORDEM em que caem, sem aplicar nada e sem
   mexer em nada — só simula a vida de cada alvo para achar a PRIMEIRA
   queda de cada um. Um alvo que já caiu nesta rodada (por um golpe
   anterior da MESMA lista) não pergunta de novo por ele: a escolha, uma
   vez tomada, vale para a rodada inteira.

   `golpes` é `[{ nome, r, autor, area, instantanea }]`, na ordem em que os
   golpes caem — `r` é o resultado já resolvido (o mesmo formato que
   `haEscolhaNoGolpe` lê, `{ dano, critico, escopoImune, resultado, ... }`),
   `area`/`instantanea` são as MESMAS duas portas de veto de
   `haEscolhaNoGolpe` (opcionais — hoje nenhum golpe de companheiro as usa,
   mas a porta não inventa uma regra nova para não as aceitar), e `autor` é
   livre (quem chama decide o que carregar ali, esta porta só devolve de
   volta).
   `inimigos` é o corpo de cada um ANTES desta rodada — a mesma lista que
   `haEscolhaNoGolpe` já entende. Devolve só os que TÊM escolha de
   verdade: `[{ nome, autor, dano, critico }]`, na mesma ordem. */
export function quedasComEscolhaNaRodada(golpes, inimigos) {
  const lista = Array.isArray(golpes) ? golpes : [];
  const listaInimigos = Array.isArray(inimigos) ? inimigos : [];
  const vidaPor = new Map(listaInimigos.map((e) => [ehObj(e) ? e.nome : undefined, ehObj(e) ? e.vida : null]));
  const caidoPor = new Set(listaInimigos.filter((e) => ehObj(e) && (e.derrotado === true || (e.vida || 0) <= 0)).map((e) => e.nome));
  const pendentes = [];
  for (const g of lista) {
    const e = ehObj(g) ? g : {};
    const nome = e.nome;
    const r = ehObj(e.r) ? e.r : null;
    if (nome == null || !r) continue;
    const dano = Number(r.dano);
    if (!Number.isFinite(dano) || dano <= 0) continue;
    if (caidoPor.has(nome)) continue;
    const vidaAntes = vidaPor.has(nome) ? vidaPor.get(nome) : null;
    if (vidaAntes == null) continue;
    const vidaDepois = Math.max(0, vidaAntes - dano);
    vidaPor.set(nome, vidaDepois);
    if (vidaDepois > 0) continue;
    caidoPor.add(nome);
    let ha = false;
    try { ha = haEscolhaNoGolpe({ alvo: { nome, vida: vidaAntes, derrotado: false }, r, area: e.area, instantanea: e.instantanea }).ha; } catch (err) { ha = false; }
    if (ha) pendentes.push({ nome, autor: e.autor, dano, critico: !!r.critico });
  }
  return pendentes;
}
