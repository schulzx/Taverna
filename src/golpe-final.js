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
   · `envelopeDoGolpeFinal` — o que vai à PAUTA DO TURNO: o fato na
     seção `acabou` ("o que o sistema resolveu agora", prio 3) e, quando
     é poupar, o veto na `naoPode`. Nada de bloco estático no prompt: o
     texto do jogador é do turno e morre com ele.

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
     manda"), fica em 467 caracteres no pior caso medido pela suíte (nome
     de 36 letras, herói de 21, cena no teto) — um terço do `TETO_DA_PAUTA`
     (1400). A cabeça da pauta gasta ~300; a pauta só com o golpe fica em
     1077, e sobram ~320 para o resto do turno. Com 280 a linha ia a 567 e
     a sobra a ~220: a cena empurrava para fora o QUEM e o CONTRA de uma
     luta que pode não ter acabado. 240 é o ponto em que o exemplo dela
     cabe e o turno ainda respira.
   · E ELA CAI PRIMEIRO QUE O FATO: a cena é a SEGUNDA linha da seção
     `acabou` (prio 3,1); o fato é a primeira (prio 3). Se o turno estiver
     cheio, o Narrador perde a prosa do jogador, nunca o desfecho. */
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
  cena: (h, cena) => `COMO ${h} FEZ, escrito pelo jogador: “${cena}”. Narre ampliada, com a sua voz, sem copiar nem desmentir.`,
  mandaLetal: (n) => ` Quem manda é a escolha, não a frase: se ela poupa, ajuste o gesto — ${n} morreu.`,
  mandaPoupar: (n) => ` Quem manda é a escolha, não a frase: se ela mata, ajuste o gesto — ${n} ficou vivo.`,
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
