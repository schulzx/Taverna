/* ============================================================
   A DISPUTA (Fase Y · Y1) — dois corpos, uma vontade só ganha

   O QUE ESTE MÓDULO IMPEDE, e está escrito com nome e linha no arquivo
   que o denunciou. `golpe.js:245` declarava, sobre o botão Empurrar:

     "empurrar é disputa de força, e o motor não tem disputa entre duas
      fichas. A regex `derrubada` de aflicoes.js lê o texto da ARMA ou da
      HABILIDADE, nunca a frase do jogador"

   E sobre o Derrubar, na linha a seguir: "mesma falta de empurrar". Os
   dois botões escreviam uma frase na caixa, a frase ia para a IA como
   ficção pura, e o que acontecia dependia do humor da cena. X2 não
   remendou isso: ESCREVEU O BURACO, para ninguém o descobrir jogando.
   Esta etapa tapa-o.

   ---------------- POR QUE UM MÓDULO, E NÃO DOIS ----------------

   Empurrar e Derrubar parecem duas regras e são UMA: o mesmo teste
   oposto, com dois desfechos. Quem vence decide se o corpo do outro
   ANDA (uma casa) ou se ele VAI AO CHÃO — e é só isso que os separa.
   Dois arquivos seriam dois motores, com duas tabelas a dizer quanto
   vale Atletismo, e no dia em que uma mudasse a outra mentiria. Foi
   exatamente assim que este projeto já perdeu a destreza do bestiário e
   a fraqueza do Troll: a tabela estava certa e o jogo via outra.

   ---------------- O QUE ELE NÃO FAZ ----------------

   NÃO INVENTA CONDIÇÃO. `caido` existe em `condicoes.js:120` desde que
   há condições — um turno de prazo e desvantagem declarada —, e o que
   faltava nunca foi a condição: era alguém que a concedesse por
   DECLARAÇÃO do jogador, em vez de só pela aflição de uma arma. Este
   módulo é esse alguém. (E `caido` aqui é PRONO, o corpo no chão que se levanta
   gastando movimento. O `caído` do módulo da queda é OUTRA COISA — é o
   inconsciente a zero de vida. Mesmo nome, mecânicas opostas; este
   módulo não toca nem por engano no de lá, e a suíte proíbe o import.)

   NÃO INVENTA DANO. Quem vence a disputa e não tem para onde empurrar o
   alvo — parede, borda do mapa, alguém no caminho — simplesmente não o
   move, e o resultado diz qual dos três foi. Dano de parede e queda por
   colisão seriam MECÂNICA NOVA, que muda o que o jogador vive, e isso é
   decisão da pessoa, não do módulo. Ficou de fora de propósito.

   NÃO APLICA NADA. Devolve a posição nova e a condição nova, e quem as
   escreve na ficha é quem fia. Estado é substituído, nunca mutado — e
   um motor que muta o alvo não pode ser chamado duas vezes para ver o
   preço antes do clique, que é lei desta casa.

   NÃO MEDE ESPAÇO. Direção, casa livre e bloqueio são `grid.js`, que é o
   dono da posição; aqui só se COMPÕE o que ele já exporta.

   NÃO SORTEIA ESCONDIDO. A sorte entra por parâmetro, no molde de
   `rolarQueda` (`desafios.js:1414`) e pela razão que está escrita lá:
   para o teste poder fixá-la, e para que ninguém, um dia, sorteie isto
   com o acaso da máquina escondido no meio de outra função. A suíte
   varre esta FONTE atrás de qualquer sorteio que não seja o valor por
   omissão do parâmetro — por isso nem os comentários daqui nomeiam o
   gerador global.
   ============================================================ */

import {
  ESCADA,
  tamanhoDe,
  direcaoDe,
  deslocarForcado,
  ocupacaoDe,
  q2m,
  EMPURRAO_NO_TABULEIRO,
} from "./grid.js";
import { atributoEfetivo } from "./regras-jogo.js";
import { bonusDePericia } from "./pericias.js";
import { criarCondicao } from "./condicoes.js";

/* ============================================================
   A TABELA DA DISPUTA — um comentário por número

   Nenhuma destas linhas pode virar constante solta no meio de uma
   função: é a primeira lei desta casa, e é ela que permite à suíte
   perguntar ao módulo o que ele decidiu em vez de repetir o palpite.
   ============================================================ */
export const TABELA_DA_DISPUTA = {
  /* d20, o mesmo dado de todo teste oposto do sistema. Está aqui, e não
     cravado no `Math.floor(...)` da rolagem, porque a conta que escreve
     a linha na tela ("d20 13 + 5") precisa de saber quantas faces rolou. */
  faces: 20,

  /* QUEM EMPURRA rola Força + Atletismo. A perícia não é escolha minha:
     `pericias.js:40` diz, na própria descrição de `atletismo`, "escalar,
     nadar, saltar, EMPURRAR, segurar o que quer cair". A regra já estava
     escrita na tabela; só não havia quem a lesse. */
  ataque: { attr: "forca", pericia: "atletismo" },

  /* QUEM RESISTE escolhe o MELHOR dos dois: firmar-se é força, mas
     também é pé. O leve que não tem como segurar o braço do gigante
     ainda pode sair da linha dele — e sem esta segunda porta, um Ladino
     de Destreza alta e Força zero não teria defesa nenhuma contra um
     botão. Empate entre as duas: vale a primeira (Força), e é só
     desempate de leitura — o número é o mesmo. */
  defesa: [
    { attr: "forca", pericia: "atletismo" },
    { attr: "destreza", pericia: "acrobacia" },
  ],

  /* EMPATE: GANHA QUEM RESISTE, e nada acontece. É a escolha
     conservadora e é a do 5e. O motivo de fundo é que o empurrão é de
     GRAÇA em consequência — não custa vida, não erra crítico — e uma
     ação barata que ganha empates seria clicada todo turno. Quem tenta
     mover um corpo tem de VENCER, não de igualar. */
  empateFavorece: "quemResiste",

  /* A FORÇA DE QUEM NÃO TEM FICHA. `completarInimigo` (bestiario.js:121)
     devolve `{nome, ameaca, nivel, vidaMax, vida, defesa, des, agil, …}`
     e NÃO devolve `atributos`: o inimigo desta casa não tem Força para
     ler. O precedente de produção é `modDoAlvo` (aflicoes.js:99), que há
     versões resolve isto pelo nível — "inimigos não têm ficha de
     atributos: usam o próprio nível como corpo". A forma é dele, o
     número é dele, e só a régua mudou de casa: ali estava na linha, aqui
     está na tabela.

     E é `base: 0` de propósito, escrito em vez de subentendido: um bicho
     de nível 1 entra na disputa com bônus ZERO, e é o dado inteiro que
     decide. Quem quiser dar corpo ao goblin mexe aqui, uma vez, e a
     suíte vê.

     O QUE FICOU DE FORA, DECLARADO: o campo `des` que o bestiário traz
     (a destreza da criatura) NÃO entra nesta conta. Seria mecânica nova
     — e o precedente que a etapa mandou reusar fala só de nível. Quem
     quiser que o lobo se esquive melhor do empurrão do que o zumbi
     acrescenta a linha aqui, com o motivo, e a suíte relê. */
  semFicha: { base: 0, porNivel: 4 },

  /* O PORTÃO DE TAMANHO: um degrau acima, no máximo. A escada é a de
     `grid.js:95` — o comentário dela diz, literalmente, que é ela que dá
     sentido a "empurrar um degrau" —, e é ela que se lê, nunca uma
     cópia. Um Médio empurra um Grande e não empurra um Enorme; abaixo
     não há limite nenhum, porque empurrar quem é menor nunca foi o
     problema. */
  degrauMaximo: 1,

  /* A CONDIÇÃO QUE DERRUBAR APLICA, pelo id do catálogo. Está aqui como
     ENTRADA DE TABELA e não como texto no meio do código porque no dia
     em que o catálogo renomear `caido` este arquivo tem de quebrar num
     sítio só. Os turnos NÃO são escritos aqui: `criarCondicao` sem
     `turnos` usa os do catálogo, e repetir o dele seria uma segunda
     verdade sobre a mesma condição. */
  condicaoDeDerrubar: "caido",
};

/* Os desfechos, por nome. Quem fia compara com a tabela e nunca com um
   texto digitado à mão — e a tela escolhe as palavras a partir daqui,
   porque o jogador não lê o nome do mecanismo, sente o efeito. */
export const DESFECHOS_DA_DISPUTA = {
  impedido: "impedido",
  resistiu: "resistiu",
  empurrou: "empurrou",
  bloqueado: "bloqueado",
  derrubou: "derrubou",
  jaCaido: "jaCaido",
};

const D = DESFECHOS_DA_DISPUTA;

/* Por que o corpo não saiu do lugar, em voz de mundo. O jogador sente o
   muro nas costas do inimigo; nunca lê a palavra "bloqueio". */
const PAROU_PORQUE = {
  borda: "não há chão atrás dele",
  parede: "as costas dele batem na parede",
  ocupado: "há alguém no caminho",
};

/* ---------------- A PORTA E A SORTE ----------------
   `= {}` NO DESTRUCTURING NÃO COBRE `null` — lei da casa —, e estas
   funções são chamadas do meio de um turno, com o que a mesa, o save e o
   envelope da IA mandarem. Por isso o argumento é aparado ANTES de ser
   desmontado, e não pela cláusula de omissão.

   E o mesmo vale para a sorte. A cláusula de omissão do destructuring só
   cobre `undefined`: quem fia que passe um `sorte` nulo — um ref que
   ainda não montou — receberia um não-função e estouraria a cena.
   `daSorte` apaga o que não é função para que a omissão volte a valer —
   e é por isso que o gerador global só aparece nesta fonte na FORMA de
   um valor por omissão de `sorte`, nunca no meio de uma conta. */
const abrir = (args) => (args == null ? {} : args);
const daSorte = (s) => (typeof s === "function" ? s : undefined);

/* ---------------- OS DOIS CORPOS ----------------
   TEM FICHA? A pergunta separa as duas contas e não é cosmética: o herói
   e o companheiro passam por `atributoEfetivo`, que soma atributo,
   proficiência, equipamento e efeito e apara no teto; o inimigo não tem
   nada disso para somar. Ler `pers.atributos.forca` cru — nos dois casos
   — é o que esta casa proíbe: a porta única é `atributoEfetivo`. */
const temFicha = (ent) => !!(ent && ent.atributos && typeof ent.atributos === "object");

function corpoSemFicha(ent) {
  const nivel = Math.max(1, Math.floor(Number(ent && ent.nivel) || 1));
  return TABELA_DA_DISPUTA.semFicha.base + Math.floor(nivel / TABELA_DA_DISPUTA.semFicha.porNivel);
}

/* O bônus de um lado: atributo efetivo mais o TREINO da perícia (que é o
   que `bonusDePericia` soma por cima do modificador que recebe). */
function bonusDe(ent, attr, pericia) {
  if (!temFicha(ent)) {
    return { total: corpoSemFicha(ent), attr, pericia: "", treino: 0, nivelTreino: "nenhum", semFicha: true };
  }
  const mod = atributoEfetivo(ent, attr);
  const b = bonusDePericia(ent, pericia, mod);
  return { total: b.total, attr, pericia, treino: b.treino, nivelTreino: b.nivelTreino, semFicha: false };
}

/* O melhor dos dois de quem resiste. Empate mantém o primeiro da tabela,
   que é Força — ver o comentário de `defesa`. */
function melhorDefesaDe(ent) {
  let melhor = null;
  for (const linha of TABELA_DA_DISPUTA.defesa) {
    const b = bonusDe(ent, linha.attr, linha.pericia);
    if (!melhor || b.total > melhor.total) melhor = b;
  }
  return melhor;
}

/* ============================================================
   O PORTÃO — quem não dá para mover, não se rola

   Vem ANTES do dado, e é de propósito: rolar uma disputa que não podia
   acontecer gastaria a ação do jogador para lhe dizer não. O veredito
   antes do clique é lei desta casa, e `golpe.js` chama esta função
   exatamente para isso, em `vereditoDoEmpurrao`.
   ============================================================ */
export function podeDisputar(quem, alvo) {
  if (!quem || !alvo) return { ok: false, motivo: "não há quem empurrar", degraus: 0 };
  const meu = ESCADA.indexOf(tamanhoDe(quem).id);
  const dele = ESCADA.indexOf(tamanhoDe(alvo).id);
  /* tamanho que a escada não conhece não pode virar um não silencioso:
     na dúvida o portão abre, e quem decide é o dado */
  if (meu < 0 || dele < 0) return { ok: true, motivo: "", degraus: 0 };
  const degraus = dele - meu;
  if (degraus > TABELA_DA_DISPUTA.degrauMaximo) {
    /* o motivo é frase de mesa, nunca diagnóstico: o sistema não fala de
       si mesmo, e "degrau" e "escada" são nomes do mecanismo */
    return { ok: false, motivo: "é grande demais para você tirar do lugar", degraus };
  }
  return { ok: true, motivo: "", degraus };
}

/* ============================================================
   O TESTE OPOSTO — o coração, e é um só

   A ORDEM DAS ROLAGENS É CONTRATO: primeiro quem empurra, depois quem
   resiste. Uma suíte que fixa a sorte numa lista depende disso, e trocar
   a ordem um dia trocaria o resultado de todos os testes de uma vez sem
   nenhum deles ficar vermelho por mérito próprio.

   Não muta nada e não aplica nada: devolve os números e o veredito.
   ============================================================ */
export function rolarDisputa(args) {
  const a = abrir(args);
  const { quem = null, alvo = null, sorte = Math.random } = { ...a, sorte: daSorte(a.sorte) };

  const portao = podeDisputar(quem, alvo);
  if (!portao.ok) {
    return {
      ok: false, venceu: false, empate: false,
      quem: null, alvo: null, totalQuem: 0, totalAlvo: 0, conta: "", motivo: portao.motivo,
    };
  }

  const meu = bonusDe(quem, TABELA_DA_DISPUTA.ataque.attr, TABELA_DA_DISPUTA.ataque.pericia);
  const seu = melhorDefesaDe(alvo);
  const rolar = () => 1 + Math.floor(sorte() * TABELA_DA_DISPUTA.faces);
  const dadoMeu = rolar();
  const dadoSeu = rolar();
  const totalQuem = dadoMeu + meu.total;
  const totalAlvo = dadoSeu + seu.total;
  /* EMPATE GANHA QUEM RESISTE: é por isso que a comparação é `>` e não
     `>=`. Um dia alguém vai achar que é engano — não é, e a linha
     `empateFavorece` de TABELA_DA_DISPUTA está lá para o dizer. */
  const venceu = totalQuem > totalAlvo;
  const sinal = (n) => (n < 0 ? ` - ${Math.abs(n)}` : n > 0 ? ` + ${n}` : "");

  return {
    ok: true,
    venceu,
    empate: totalQuem === totalAlvo,
    /* `total` publicado JÁ SOMA O DADO: é o número que a linha da tela
       mostra ao jogador. O bônus da ficha lê-se tirando o `dado` de
       volta — e é por isso que os dois viajam juntos. */
    quem: { ...meu, dado: dadoMeu, total: totalQuem },
    alvo: { ...seu, dado: dadoSeu, total: totalAlvo },
    totalQuem,
    totalAlvo,
    conta: `d${TABELA_DA_DISPUTA.faces} ${dadoMeu}${sinal(meu.total)} = ${totalQuem}`
      + ` vs d${TABELA_DA_DISPUTA.faces} ${dadoSeu}${sinal(seu.total)} = ${totalAlvo}`,
    motivo: "",
  };
}

/* ============================================================
   PARA ONDE O EMPURRÃO LEVA — sem rolar nada

   Existe separada de `empurrar` porque é ela que dá o VEREDITO ANTES DO
   CLIQUE: o jogador tem de poder ver que o inimigo está encostado à
   parede antes de gastar a ação a descobri-lo, e é isto que `golpe.js`
   chama em `vereditoDoEmpurrao`. É a MESMA função que `empurrar` usa por
   dentro — e tem de ser, senão o preço mostrado não é o preço cobrado.

   Zero aleatoriedade: é geometria, e tem de dar o mesmo resultado
   sempre, em qualquer máquina.
   ============================================================ */
export function destinoDoEmpurrao(args) {
  const a = abrir(args);
  const { grade = null, quem = null, alvo = null, entidades = null } = a;
  const vazio = (motivo) => ({ ok: false, de: null, para: null, casas: 0, metros: 0, bloqueio: null, motivo });
  /* O REFORÇO QUE CHEGA SEM `x`/`y` É REAL — X3b/X4 mediram-no e ele
     continua aberto, e não é este módulo que o conserta. Aqui ele só não
     pode custar o turno: sem lugar no tabuleiro, resposta honesta. */
  if (!quem || !alvo || quem.x == null || alvo.x == null) return vazio("um dos dois não está no tabuleiro");

  /* QUEM ESTÁ A SER EMPURRADO NÃO OCUPA O PRÓPRIO CAMINHO.
     `ocupacaoDe(lista, exceto)` exclui por IDENTIDADE, e quem fia pode
     passar cópias (o estado é substituído, nunca mutado) — então a cópia
     do alvo voltaria a entrar no conjunto e um bicho Grande (2x2) nunca
     sairia do sítio, porque o destino dele sobrepõe o próprio corpo.
     Filtra-se antes, por identidade OU por estar no mesmo lugar com o
     mesmo nome. */
  const lista = Array.isArray(entidades) ? entidades : [];
  const outros = lista.filter((e) => e && e !== alvo
    && !(e.x === alvo.x && e.y === alvo.y && String(e.nome || "") === String(alvo.nome || "")));

  const r = deslocarForcado(grade, alvo, direcaoDe(quem, alvo), EMPURRAO_NO_TABULEIRO.casas, { ocupados: ocupacaoDe(outros) });
  return {
    ok: !!r.ok,
    de: { x: alvo.x, y: alvo.y },
    para: r.ok ? { x: r.x, y: r.y } : null,
    casas: r.casasAndadas,
    metros: q2m(r.casasAndadas),
    bloqueio: r.bloqueio,
    motivo: r.ok ? "" : (PAROU_PORQUE[r.bloqueio] || r.motivo || ""),
  };
}

/* ============================================================
   EMPURRAR — vence a disputa e o corpo anda o que a tabela declara

   Devolve a casa nova; NÃO mexe no alvo. E quando a disputa foi ganha e
   o destino não deixa (parede, borda, alguém), `venceu` continua verdade
   e o desfecho é `bloqueado`, com `bloqueio` a dizer qual dos três — o
   empurrão aconteceu e o mundo é que não cedeu. Uma vitória muda seria a
   tela a mentir, e a pedra não cobra nada por isso: ver o cabeçalho.
   ============================================================ */
export function empurrar(args) {
  const a = abrir(args);
  const { grade = null, quem = null, alvo = null, entidades = null, sorte = Math.random } = { ...a, sorte: daSorte(a.sorte) };
  const rolagem = rolarDisputa({ quem, alvo, sorte });
  const lugar = alvo && alvo.x != null ? { x: alvo.x, y: alvo.y } : null;
  const nada = (desfecho, motivo, bloqueio) => ({
    ok: false, venceu: !!rolagem.venceu, desfecho, rolagem: rolagem.ok ? rolagem : null, motivo,
    de: lugar, para: null, casas: 0, metros: 0, bloqueio: bloqueio || null,
  });

  if (!rolagem.ok) return nada(D.impedido, rolagem.motivo, null);
  if (!rolagem.venceu) return nada(D.resistiu, "ele se firma e não sai do lugar", null);

  const destino = destinoDoEmpurrao({ grade, quem, alvo, entidades });
  if (!destino.ok) return nada(D.bloqueado, destino.motivo, destino.bloqueio);

  return {
    ok: true, venceu: true, desfecho: D.empurrou, rolagem, motivo: "",
    de: destino.de, para: destino.para, casas: destino.casas, metros: destino.metros, bloqueio: null,
  };
}

/* ============================================================
   DERRUBAR — vence a mesma disputa e o corpo vai ao chão

   Devolve a INSTÂNCIA da condição, pronta para quem fia empurrar em
   `alvo.condicoes[]`. Não a aplica, não mexe no alvo, e não inventa
   condição nenhuma: é o `caido` do catálogo, com os turnos do catálogo.

   NÃO EMPILHA, e a verificação vem ANTES do dado — no molde de
   `aflicoes.js:125` ("já está sob a mesma condição? não empilha"). Antes
   e não depois porque rolar para derrubar quem já está no chão gastaria
   a ação do jogador num resultado que não podia mudar nada.

   E `condicao` DIZ SEMPRE QUAL `caido` SEGURA O ALVO depois desta ação:
   quando ele já estava no chão, volta uma CÓPIA do que ele já tinha, e
   nunca um segundo. É essa a prova de que não empilhou — e quem fia lê o
   desfecho `jaCaido` para saber que não há nada a acrescentar.

   E `caido` FICA FORA DA SALVAGUARDA DE FIM DE TURNO, que é onde ele já
   está: `condicoes.js:361` e `:485` escrevem o porquê — levantar-se é
   MOVIMENTO (metade do deslocamento), não salvaguarda, e com um turno de
   prazo a segunda chance chegaria no mesmo instante em que o relógio já
   vence a condição. Este módulo respeita isso e não mexe naquela tabela.
   ============================================================ */
export function derrubar(args) {
  const a = abrir(args);
  const { quem = null, alvo = null, sorte = Math.random } = { ...a, sorte: daSorte(a.sorte) };

  const jaTinha = ((alvo && alvo.condicoes) || []).find((c) => c && c.id === TABELA_DA_DISPUTA.condicaoDeDerrubar);
  if (jaTinha) {
    /* VOLTA O QUE ELE JÁ TINHA, numa cópia — nunca um segundo. É assim
       que quem fia vê que o alvo continua no chão sem ter de acrescentar
       nada: dois `caido` na lista dariam dois turnos de desvantagem por
       um derrube só, e o `tickCondicoes` gastaria os dois separados. */
    return {
      ok: false, venceu: false, desfecho: D.jaCaido, rolagem: null,
      motivo: "ele já está no chão", condicao: { ...jaTinha },
    };
  }

  const rolagem = rolarDisputa({ quem, alvo, sorte });
  if (!rolagem.ok) {
    return { ok: false, venceu: false, desfecho: D.impedido, rolagem: null, motivo: rolagem.motivo, condicao: null };
  }
  if (!rolagem.venceu) {
    return { ok: false, venceu: false, desfecho: D.resistiu, rolagem, motivo: "ele se firma e não cai", condicao: null };
  }

  const condicao = criarCondicao(TABELA_DA_DISPUTA.condicaoDeDerrubar, { origem: (quem && quem.nome) || "" });
  /* o catálogo pode dizer que não conhece o id — nesse caso a disputa foi
     ganha e não há o que aplicar; dizer a verdade é melhor do que fingir
     que derrubou */
  if (!condicao) {
    return { ok: false, venceu: true, desfecho: D.impedido, rolagem, motivo: "não há como derrubá-lo", condicao: null };
  }
  return { ok: true, venceu: true, desfecho: D.derrubou, rolagem, motivo: "", condicao };
}
