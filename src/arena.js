/* ============================================================
   A ARENA (v9.225) — o duelo provável, uma peça para três mesas

   Nasce a serviço do Torneio (M4: as chaves que correm sozinhas) e o
   Duelo (D2) a herda pronta. O trabalho dela: pôr duas fichas de HERÓI
   uma contra a outra, com as regras que já existem, e devolver o mesmo
   vencedor para a mesma semente em qualquer máquina.

   ---------------- LEI-MÃE: NENHUMA REGRA NOVA ----------------

   Os dois lados lutam como COMPANHEIROS: `turnoDosCompanheiros` decide
   (cura, poção, buff, habilidade ou arma, pelo catálogo de classes) e
   `resolverAtaque` rola — as fórmulas exatas que a mesa de campanha usa
   para quem luta sem jogador. O lado que apanha é uma PROJEÇÃO no
   formato de alvo do combate, mas com `defesa` explícita vinda de
   `defesaDe(ficha)` — o caminho de inimigo honra a defesa explícita, e
   assim o herói é defendido pelas regras de herói mesmo do outro lado
   do balcão. Simetria total: nenhum lado luta com conta de monstro.

   ---------------- A SORTE TRAVADA ----------------

   `combate.js` rola com Math.random. Em vez de duplicar as fórmulas
   para injetar dado (a regra copiada que a lei-mãe proíbe), a arena
   TRAVA a sorte: troca Math.random por um gerador semeado durante a
   simulação e restaura no finally. Mesma dupla + mesma semente = mesmo
   duelo, golpe a golpe — o determinismo é o árbitro (lei v).

   ---------------- O QUE DURA ALGUNS TURNOS (v9.225 · A3) ----------------

   Até a v9.224 a arena traduzia buff e guarda em UMA LINHA DE PROSA e
   descontava a mana: `prepararDuelista` criava `f.efeitos = []` e ninguém
   nunca escrevia nele. A medição de A1 disse o tamanho do buraco — 382
   meias-rodadas mortas em 420 quedas, 20 delas abrindo com duas, e o dano
   logo depois da guarda em 1,034× o normal (ou seja: guardar não
   descontava nada). O piloto pagava o turno e não comprava coisa alguma.

   Agora compra, e **sem uma regra nova** — cada peça é chamada de onde já
   morava (lei-mãe):

   - a GUARDA por `erguerGuarda` (habilidades.js, v9.53). A defesa sobe
     sozinha porque `projecaoDe` chama `defesaDe`, e `defesaDe` já soma
     `defesaDeGuarda`. A projeção leva a lista de guardas junto, para as
     guardas de esquiva e de intocável — que `resolverAtaque` já sabe ler
     — não ficarem promessa pela metade.
   - o BUFF por `efeitoDeBuff` (efeitos.js, v9.224) firmado por
     `firmarEfeito` (v9.237 · C3 — era `empilhar` até então, e por isso o
     duelista segurava duas concentrações ao mesmo tempo). O prazo sai de
     `BUFF_DA_HABILIDADE` e o teto de `CONCENTRACAO_DA_MAGIA`; nenhum número
     de regra mora aqui.
   - o BÔNUS NO GOLPE por `bonusDeDano` / `bonusDeArma` (combos.js), que
     são os leitores que respeitam o escopo físico/mágico.
   - o PRAZO por `tickEfeitos` (regras-jogo.js) e `expirarGuardas`
     (habilidades.js), uma vez por rodada — buff que não vence é buff
     eterno, e buff eterno é regra nova pela porta dos fundos.
   - a ABSORÇÃO por `absorverDano` (efeitos.js, v9.233), no instante em que
     o dano vira PV. Até a v9.232 a família defensiva era a única que a
     arena firmava e não cumpria: o abrigo entrava na ficha com força zero,
     e três dos oito prontos gastavam a rodada 1 comprando nada. Aqui ele
     come do golpe e se gasta.

   ---------------- O QUE ELA NÃO FAZ ----------------

   Não muta a ficha original (trabalha em cópia — o duelo não deixa
   cicatriz, lei vi), não fala com rede nem tela, e o TERRENO da queda é
   COR narrativa por enquanto: a mecânica de terreno da campanha mora na
   grade da luta do App, e portá-la inteira é trabalho de outra etapa —
   cor declarada é melhor que regra pela metade.
   ============================================================ */

import { turnoDosCompanheiros, defesaDe, testeConcentracao } from "./combate.js";
import { firmarEfeito, efeitoDeBuff, absorverDano, efeitoEmConcentracao, quebrarConcentracao } from "./efeitos.js";
import { guardaDe, erguerGuarda, expirarGuardas } from "./habilidades.js";
import { bonusDeDano, bonusDeArma } from "./combos.js";
import { tickEfeitos, atributoEfetivo } from "./regras-jogo.js";
import { usarConsumivel } from "./pocoes.js";
import { montarPronto, PRONTOS } from "./prontos.js";

/* ---------------- A VOZ SECA ----------------
   `tickEfeitos` e `expirarGuardas` devolvem linha na voz do App: emoji na
   frente e ponto no fim. A arena narra seco. Tira o enfeite e deixa o
   fato — e o que sai daqui nunca pode terminar em " se guarda" nem em
   "(−N)", que são as duas réguas que a suíte lê. */
const secar = (l) => String(l == null ? "" : l).replace(/^[^\p{L}\p{N}]+/u, "").replace(/\.$/, "");

/* ---------------- OS TERRENOS DA QUEDA ----------------
   O vocabulário é o mesmo do combate da campanha (apertado, aberto,
   escuro, alto, água) — cor para o duelo seco narrar. */
export const TERRENOS_DA_ARENA = [
  { id: "apertado", nome: "o fosso", diz: "paredes perto demais para arma comprida" },
  { id: "aberto", nome: "a areia aberta", diz: "sem canto para se esconder" },
  { id: "escuro", nome: "a arena às tochas", diz: "metade da luta é sombra" },
  { id: "alto", nome: "o tablado alto", diz: "cair já é meio golpe" },
  { id: "agua", nome: "o raso alagado", diz: "cada passo pesa" },
];

/* ---------------- A SORTE TRAVADA ---------------- */
function sorteDaSemente(semente) {
  let h = 2166136261;
  const s = String(semente || "arena");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  let k = h >>> 0;
  return () => { k = (Math.imul(k, 1103515245) + 12345) >>> 0; return (k >>> 8) / 16777216; };
}
function comSorteTravada(semente, fn) {
  const original = Math.random;
  Math.random = sorteDaSemente(semente);
  try { return fn(); } finally { Math.random = original; }
}

/* ---------------- A PROJEÇÃO ----------------
   O duelista inteiro (a ficha em cópia funda, que ataca com as próprias
   habilidades) e o alvo-projeção que o outro lado enxerga. A projeção
   compartilha a MESMA vida por referência de leitura: a arena sincroniza
   após cada meia-rodada. */
export function prepararDuelista(ficha) {
  const f = JSON.parse(JSON.stringify(ficha));
  f.vida = f.vidaMax; f.mana = f.manaMax;
  /* a guarda entra junto de condições e efeitos: é da mesma família de
     coisa com prazo, e um duelo que começasse com a guarda da luta
     anterior de pé deixaria cicatriz (lei vi) */
  f.condicoes = []; f.efeitos = []; f.guardas = [];
  return f;
}
function projecaoDe(f) {
  return {
    nome: f.nome, vida: f.vida, vidaMax: f.vidaMax,
    /* defesa de HERÓI, explícita — o caminho de inimigo a honra, e ela já
       traz `defesaDeGuarda` somada por `defesaDe` */
    defesa: defesaDe(f, false),
    /* v9.225: as guardas viajam junto porque duas das três famílias não
       somam defesa — a de esquiva entorta o dado e a de intocável faz o
       golpe errar, e quem lê as duas é `resolverAtaque`, no alvo. Sem
       isto, erguer uma delas não faria absolutamente nada: promessa pela
       metade é o que esta etapa veio matar. Não duplica número nenhum —
       `defesa` acima é explícita e o caminho de inimigo não re-soma. */
    guardas: f.guardas || [],
    condicoes: f.condicoes || [], derrotado: false,
  };
}

/* aplica as ações que turnoDosCompanheiros devolveu: dano no outro lado,
   cura, guarda, buff e custo no próprio. Devolve linhas do que houve (o
   duelo seco). `rodada` entra porque a guarda vence por rodada, não por
   turnos contados. */
function aplicarAcoes(acoes, eu, outro, rodada) {
  const linhas = [];
  for (const a of acoes || []) {
    if (a.tipo === "cura") {
      eu.mana = Math.max(0, (eu.mana || 0) - (a.custo || 0));
      eu.vida = Math.min(eu.vidaMax, eu.vida + (a.valor || 0));
      linhas.push(`${eu.nome} se recompõe (+${a.valor || 0})`);
      continue;
    }
    if (a.tipo === "pocao") {
      /* a pocao e aplicada pelo aplicador oficial (pocoes.js) e SAI da
         bolsa — sem isso o frasco seria eterno */
      const r2 = usarConsumivel(eu, a.item);
      if (r2 && r2.ent) {
        eu.vida = r2.ent.vida; if (r2.ent.mana != null) eu.mana = r2.ent.mana;
        if (r2.gastou !== false) {
          const i = (eu.inventario || []).indexOf(a.item);
          if (i >= 0) eu.inventario.splice(i, 1);
        }
        linhas.push(`${eu.nome} bebe às pressas`);
      } else linhas.push(`${eu.nome} tateia a bolsa`);
      continue;
    }
    if (a.tipo === "buff" || a.tipo === "guarda") {
      if (a.custo) eu.mana = Math.max(0, (eu.mana || 0) - a.custo);
      const hab = a.habilidade;
      /* A AÇÃO SECA: `turnoDosCompanheiros` emite `{tipo:"guarda"}` sem
         habilidade nenhuma quando não há inimigo de pé. Não há o que
         aplicar, e esta linha continua sendo a única meia-rodada morta
         legítima da arena. */
      if (!hab) { linhas.push(`${eu.nome} se guarda`); continue; }
      /* 1. A GUARDA PRIMEIRO. É efeito de outra família — vence por RODADA
         e soma à defesa, não ao golpe — e por isso tem de ser testada
         antes: uma habilidade que casa com a tabela GUARDAS é guarda, e
         transformá-la em buff de dano seria inventar o que ela faz. */
      if (guardaDe(hab)) {
        const defesaAntes = defesaDe(eu, false);
        const g = erguerGuarda(eu, hab, rodada);
        if (g && g.ok) {
          eu.guardas = g.pers.guardas;
          /* o valor que subiu, MEDIDO pela defesa de antes e de depois, e
             não copiado da tabela: a guarda de esquiva e a de intocável não
             somam defesa alguma, e escrever "+0" seria mentir um número. */
          const ganho = defesaDe(eu, false) - defesaAntes;
          linhas.push(`${eu.nome} ergue ${hab.nome}${ganho > 0 ? ` (defesa +${ganho})` : ""}`);
        } else linhas.push(`${eu.nome} insiste numa guarda que já está de pé`);
        continue;
      }
      /* 2. SENÃO, O BUFF. `turnos` vai indefinido de propósito: sem prazo
         de condição, quem decide é `BUFF_DA_HABILIDADE.turnosPadrao` — a
         tabela, nunca um número solto aqui.

         A PORTA É `firmarEfeito` DESDE A v9.237 (C3), e não `empilhar`. A
         pilha genérica só substitui por NOME IGUAL, então o Remendo e o Voto
         — os dois prontos que firmam Bênção e Escudo da Fé, as únicas duas
         concentrações que o piloto chega a firmar na mesa dos oito — ficavam
         segurando as duas ao mesmo tempo, e uma batida derrubava só uma.
         Medido antes: 316 das 1352 firmadas de concentração em 2094 quedas
         eram uma SEGUNDA por cima de outra. Agora a nova toma o lugar, o teto
         é o de `CONCENTRACAO_DA_MAGIA`, e o duelista cede em voz alta.

         A LINHA DA CEDIDA É A DO MÓDULO, seca, com o dono na frente — o mesmo
         molde da mordida do abrigo e da queda de concentração logo abaixo. A
         arena não escreve uma sílaba, e por isso a troca soa igual aqui e na
         mesa da campanha. Quem não concentra passa por aqui exatamente como
         passava: `linha` vem vazia e nada é empurrado. */
      const { efeito, extraEscopo } = efeitoDeBuff(hab, eu, undefined);
      const fe = firmarEfeito(eu, efeito);
      eu.efeitos = fe.pers.efeitos;
      linhas.push(`${eu.nome} firma ${hab.nome}${extraEscopo}`);
      if (fe.linha) linhas.push(`${eu.nome} — ${secar(fe.linha)}`);
      continue;
    }
    const r = a.r;
    if (!r) continue;
    if (a.custo) eu.mana = Math.max(0, (eu.mana || 0) - a.custo);
    if (r.dano > 0) {
      /* O BUFF ENTRA NO NÚMERO — e entra DEPOIS do crítico. Quem rolou o
         golpe foi `turnoDosCompanheiros`, que não conhece os efeitos de
         quem bate; a arena só vê o resultado pronto. Somar antes exigiria
         duplicar `resolverAtaque` aqui dentro, que é exatamente a regra
         copiada que a lei-mãe proíbe. Então o bônus não é dobrado pelo
         crítico: sai mais barato que na mesa da campanha, e está escrito
         para ninguém precisar descobrir isso sozinho.
         Quem soma são os leitores da casa (combos.js): `bonusDeDano`
         respeita o escopo (fúria física não levanta feitiço) e
         `bonusDeArma` é físico por definição — o cajado do mago ainda é um
         pedaço de pau. */
      const b = a.tipo === "habilidade" ? bonusDeDano(eu, a.habilidade) : bonusDeArma(eu);
      const dano = r.dano + b.bonus;
      const peso = b.bonus > 0 ? ` — ${b.fontes.join(", ")} pesa${b.fontes.length > 1 ? "m" : ""} no golpe` : "";
      /* A ABSORÇÃO MORDE AQUI (v9.233), e morde no ALVO — este é o único
         ponto da arena em que dano vira PV, e o abrigo é de quem apanha, não
         de quem bate. Vem DEPOIS do bônus do golpe de propósito: o escudo
         encontra o golpe do jeito que ele chega, já engordado, que é a mesma
         ordem de `amortecerDano` na mesa da campanha. Escrever `outro.efeitos`
         de volta é o que gasta o abrigo — sem esta linha ele absorveria uma
         vez por golpe, para sempre. */
      const ab = absorverDano(outro, dano);
      if (ab.absorvido > 0) {
        outro.efeitos = ab.pers.efeitos;
        linhas.push(`${outro.nome} — ${secar(ab.linha)}`);
      }
      outro.vida = Math.max(0, outro.vida - ab.dano);
      const golpe = `${eu.nome} ${r.critico ? "acerta em cheio" : "acerta"} ${outro.nome}${peso}`;
      /* sem "(−0)": quando o abrigo comeu a batida inteira não houve dano, e
         escrever zero entre parênteses seria a arena narrando contabilidade */
      linhas.push(ab.dano > 0 ? `${golpe} (−${ab.dano})` : golpe);
      /* A CONCENTRAÇÃO CAI AQUI (v9.236 · C2b). Desde C2b o duelista nasce
         segurando o que conjura: `efeitoDeBuff` pergunta ao grimório, e Bênção
         e Escudo da Fé — as duas que o piloto firma de verdade na mesa dos
         oito — entram na ficha com `concentracao`. Sem esta chamada o abrigo e
         a bênção durariam o prazo inteiro sem ninguém poder derrubá-los, que é
         exatamente a promessa escrita nas duas pontas e vazia no meio que a
         Fase C veio fechar.

         DEPOIS DO GOLPE, E COM O DANO QUE CHEGOU. `ab.dano` é o que sobrou da
         absorção, e é ele que manda: o escudo que comeu a batida já pagou por
         ela, e testar pelo golpe cheio faria o abrigo derrubar a si mesmo. É a
         mesma ordem da mesa da campanha (`App.jsx`), onde o teste vem depois
         de o dano virar PV.

         SÓ DE PÉ, E SÓ COM DANO. Quem caiu não tem o que segurar, e a queda já
         é o fim da cena — uma linha de magia escapando por cima do golpe que
         matou seria a arena narrando contabilidade depois do fim. Golpe que
         não tirou PV nenhum (o abrigo comeu tudo) também não testa: ninguém
         apanhou.

         A FRASE É A DE C2, PALAVRA POR PALAVRA — `tc.linha`, voz de mundo, com
         os dois números. O que a arena põe é só o dono, pelo mesmo molde de
         `absorverDano` duas linhas acima: `nome — frase seca`. */
      if (ab.dano > 0 && outro.vida > 0) {
        const segurada = efeitoEmConcentracao(outro);
        if (segurada) {
          const tc = testeConcentracao(ab.dano, atributoEfetivo(outro, "vigor"), segurada.nome);
          if (!tc.manteve) {
            outro.efeitos = quebrarConcentracao(outro, segurada.nome).efeitos;
            linhas.push(`${outro.nome} — ${secar(tc.linha)}`);
          }
        }
      }
    } else {
      linhas.push(`${eu.nome} ${r.desastre ? "erra feio" : "erra"} ${outro.nome}`);
    }
  }
  return linhas;
}

/* meia-rodada: `eu` age contra `outro`, pelas regras de companheiro, com o
   REPERTÓRIO INTEIRO na mesa.

   O FILTRO QUE CAIU (v9.225 · A3). Daqui até a v9.224 havia uma visão
   podada — as habilidades passavam por um filtro que só deixava ficar as
   de cura de grupo e as ofensivas, pelos dois classificadores de
   companheiros.js — e ela existia por um motivo honesto: a arena não portava efeito
   nenhum, então buff e guarda viravam prosa, e deixá-los à mesa fazia o
   piloto gastar turno em promessa que a simulação não cumpria; o mago
   perdia por culpa da moldura, não da classe.

   O filtro nunca funcionou. `ehOfensiva` (companheiros.js) casa
   `RX_OFENSIVA` contra nome **e descrição**, e "Postura Defensiva" e
   "Escudo Arcano" dizem *dano* na descrição ("absorve o próximo dano"):
   as duas passavam por ele todos os dias. A1 mediu o preço — 382 meias
   rodadas mortas, 20 quedas de 420 abrindo com duas.

   Com `aplicarAcoes` aplicando o efeito de verdade, o filtro perdeu o
   motivo e caiu inteiro: o piloto vê tudo o que a ficha tem, e o que ele
   escolher a arena cumpre. E `eu` entra direto, sem cópia de visão — não
   havia mais o que esconder dele. */
function meiaRodada(eu, outro, rodada) {
  const alvo = projecaoDe(outro);
  /* o duelista entra também como `jogador`: o cérebro de companheiro só
     cura "quem está pior (inclui o herói)" — num duelo de um, o herói a
     proteger é ele mesmo. Sem isso o curandeiro nunca se curaria. */
  const acoes = turnoDosCompanheiros({ grupo: [eu], inimigos: [alvo], jogador: eu, jogadorNome: eu.nome, rodada });
  return aplicarAcoes(acoes, eu, outro, rodada);
}

/* ---------------- UMA QUEDA ----------------
   Iniciativa por destreza + dado; depois, meia-rodada de cada lado até
   alguém cair. O teto de rodadas nunca deixa a queda virar empate
   eterno: estourou, vence quem tiver a maior fração de vida. */
export const RODADAS_MAX = 30;
export function simularQueda(fichaA, fichaB, { semente = "queda", terreno = null } = {}) {
  return comSorteTravada(semente, () => {
    const A = prepararDuelista(fichaA);
    const B = prepararDuelista(fichaB);
    const linhas = [];
    const t = terreno || TERRENOS_DA_ARENA[0];
    linhas.push(`Em ${t.nome}: ${t.diz}.`);
    const iniA = (A.atributos?.destreza || 0) + Math.floor(Math.random() * 20);
    const iniB = (B.atributos?.destreza || 0) + Math.floor(Math.random() * 20);
    let ordem = iniA >= iniB ? [A, B] : [B, A];
    let rodada = 1;
    while (rodada <= RODADAS_MAX && A.vida > 0 && B.vida > 0) {
      for (const quem of ordem) {
        if (A.vida <= 0 || B.vida <= 0) break;
        const outro = quem === A ? B : A;
        linhas.push(...meiaRodada(quem, outro, rodada));
      }
      /* O PRAZO CORRE, uma vez por rodada, depois das duas meias-rodadas.
         Efeito que não decrementa é buff eterno, e guarda que não vence é
         armadura de graça — as duas seriam regra nova pela porta dos
         fundos. Os dois relógios são os da casa (`tickEfeitos`,
         `expirarGuardas`) e devolvem estado NOVO, que a arena escreve de
         volta na cópia. Só corre com os dois de pé: relógio depois da
         queda é ruído na narração. */
      if (A.vida > 0 && B.vida > 0) {
        for (const quem of ordem) {
          const tk = tickEfeitos(quem);
          quem.efeitos = tk.efeitos;
          for (const msg of tk.msgs) linhas.push(`${quem.nome} — ${secar(msg)}`);
          const eg = expirarGuardas(quem, rodada);
          if (eg.linhas.length) {
            quem.guardas = eg.pers.guardas || [];
            for (const l of eg.linhas) linhas.push(`${quem.nome} — ${secar(l)}`);
          }
        }
      }
      rodada++;
    }
    let vencedor;
    if (A.vida <= 0 && B.vida <= 0) vencedor = ordem[0] === A ? "B" : "A"; /* quem caiu por último de pé */
    else if (B.vida <= 0) vencedor = "A";
    else if (A.vida <= 0) vencedor = "B";
    else vencedor = (A.vida / A.vidaMax) >= (B.vida / B.vidaMax) ? "A" : "B";
    return { vencedor, rodadas: rodada - 1, linhas, vidaA: A.vida, vidaB: B.vida };
  });
}

/* ---------------- A SÉRIE: MELHOR DE TRÊS ----------------
   Terreno novo por queda, sorteado da tabela pela semente. */
export function simularSerie(fichaA, fichaB, { semente = "serie", melhorDe = 3 } = {}) {
  const precisa = Math.floor(melhorDe / 2) + 1;
  const sorte = sorteDaSemente(semente + "|terrenos");
  const quedas = [];
  let a = 0, b = 0;
  for (let q = 0; a < precisa && b < precisa && q < melhorDe; q++) {
    const terreno = TERRENOS_DA_ARENA[Math.floor(sorte() * TERRENOS_DA_ARENA.length)];
    const r = simularQueda(fichaA, fichaB, { semente: `${semente}|queda${q}`, terreno });
    quedas.push({ ...r, terreno: terreno.id });
    if (r.vencedor === "A") a++; else b++;
  }
  return { vencedor: a > b ? "A" : "B", placar: `${a}×${b}`, quedas };
}

/* ---------------- OS PRONTOS NA ARENA ----------------
   A porta que o Torneio e o Duelo justo usam: dois ids do roster, uma
   semente, uma série. É também por aqui que a CATRACA DO EQUILÍBRIO
   roda o round-robin — o equilíbrio do roster é teste, não intenção. */
export function duelarProntos(idA, idB, { semente = "duelo", melhorDe = 3 } = {}) {
  const A = montarPronto(idA);
  const B = montarPronto(idB);
  if (!A || !B) return null;
  return { a: idA, b: idB, ...simularSerie(A, B, { semente, melhorDe }) };
}

/* o round-robin completo do roster: todo par, muitas sementes. Devolve a
   taxa de vitória de cada pronto — a suíte trava a faixa (35%–65%).
   O `prefixo` escolhe a FAMÍLIA de sementes: uma família só é uma amostra, e
   amostra tem ruído — o mesmo pronto oscila vários pontos de família para
   família. A catraca precisa provar estabilidade ENTRE famílias independentes,
   não a sorte de uma; por isso a família entra por parâmetro. O padrão "rr"
   mantém, ao dígito, o retrato que a suíte já conhecia. */
export function roundRobin({ sementes = 20, melhorDe = 3, prefixo = "rr" } = {}) {
  const vit = Object.fromEntries(PRONTOS.map((p) => [p.id, 0]));
  const jogos = Object.fromEntries(PRONTOS.map((p) => [p.id, 0]));
  for (let i = 0; i < PRONTOS.length; i++) {
    for (let j = i + 1; j < PRONTOS.length; j++) {
      const a = PRONTOS[i].id, b = PRONTOS[j].id;
      for (let s = 0; s < sementes; s++) {
        const r = duelarProntos(a, b, { semente: `${prefixo}|${a}|${b}|${s}`, melhorDe });
        jogos[a]++; jogos[b]++;
        vit[r.vencedor === "A" ? a : b]++;
      }
    }
  }
  return Object.fromEntries(PRONTOS.map((p) => [p.id, jogos[p.id] ? vit[p.id] / jogos[p.id] : 0]));
}
