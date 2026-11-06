/* ============================================================
   O PORTÃO DA INTRODUÇÃO (Fase SQ · SQ2, 05/11/2026) — src/portao-das-secundarias.js

   A pessoa, a 05/11: "as quests secundárias não devem ser disponibilizadas
   no começo do jogo pra não poluir a experiência, o jogador tem que ser
   introduzido na missão e na história sem ruídos (...) e isso vai resolver
   o problema de toda hora aparecer alguém oferecendo trabalho e poluindo a
   tela (...) o mural pode continuar em funcionamento gerando mini quests
   (...) mas também tem que ser liberado a partir de um certo lvl".

   O censo de SQ1 (`mente/sq1-censo.md`) mediu o antes: numa campanha nova,
   nível 1, o único portão era o da MM13 (`muralLiberado`, abertura.js) —
   o primeiro passo da principal OU seis turnos, o que vier primeiro. Ao
   7.º turno o mural abria com ~3 cartazes, o figurante pregava um papel
   por dia (com a linha "tem um trabalho no mural" e o Mestre a encenar a
   abordagem), o descanso longo dava uma secundária em ~40% das noites e o
   evento global impunha outra missão. Seis turnos não é estar dentro da
   história: é só ter ficado parado.

   O PORTÃO, então, é a história e não o relógio:
     · abre com o PRIMEIRO MARCO DA ESPINHA cumprido (o herói já fez uma
       coisa que a história conta), OU com o NÍVEL 3 — o que vier antes;
     · o MURAL (e todo papel pregado nele: o figurante, a proposta do
       Cronista, a soleira, os contratos da casa) tem o seu número próprio,
       `nivelDoMural`, nunca menor que o do portão — o mural é para quem
       quer subir de nível, e só se abre por nível, como ela pediu.

   PORQUÊ O NÍVEL 3. Na 5e (as tabelas de `regras.js`: 300 XP ao 2, 900 ao
   3), os níveis 1 e 2 são o aprendizado: sobem depressa, e o 3 é onde a
   classe se define. É o fim natural da introdução para quem não anda na
   espinha (luta, explora, mas não toca no primeiro marco): o jogo não o
   deixa sem trabalho para sempre. E o mural no MESMO 3: ele é a mini-missão
   de quem quer subir; antes do 3 o herói ainda está a aprender a mesa, e
   depois dele o mural é exatamente o que o pedido dela descreve.

   O QUE NÃO MUDA. A principal e a abertura não passam por aqui. A trama
   forçada pela abertura (`forcar`) também não. O coração do núcleo
   (subtramas.js, "conta com você") é a gente da própria história, e um
   pedido por pessoa por campanha: não é o ruído de que ela falou.

   SAVE ANTIGO E SEM HISTÓRIA: aberto. Sem abertura (legado, ou um modo
   sem ela) ou sem nenhum marco na espinha, não há introdução a proteger,
   e fechar o que estava aberto a quem já joga seria tirar-lhe o jogo.
   Nenhum campo novo no save: tudo se deriva do que já lá está.

     secundariasAbertas({ abertura, espinha, nivel })
       → { abertas, porque, mural }
   `porque`: "marco" | "nivel" | "introducao" | "save-antigo" | "sem-historia".
   Nunca estoura: lixo e `null` são "save-antigo".
   ============================================================ */
import { garantirAbertura, MURAL } from "./abertura.js";
import { garantirEspinha } from "./saga.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});

export const PORTAO_DAS_SECUNDARIAS = Object.freeze({
  /* quantos marcos da espinha cumpridos abrem o portão (o primeiro) */
  marcos: 1,
  /* ou este nível, o que vier primeiro */
  nivel: 3,
  /* o mural e todo papel pregado nele: só por nível, e nunca antes do portão */
  nivelDoMural: 3,
  /* o veto que vai à pauta (NÃO PODE) enquanto o mural está fechado — a
     MESMA frase da MM13, para a pauta não a levar duas vezes */
  veto: MURAL.veto,
  /* SQ4 (05/11): O MURAL NÃO CHAMA NINGUÉM. Aberto, ele enche-se como
     sempre, mas o papel pregado nunca se oferece na soleira — quem quer
     trabalho vai ao mural. Falso é a regra; verdadeiro devolve a soleira
     de antes, num commit. */
  naSoleira: false,
});

/* ---------------- O MURAL FECHADO DIZ PORQUÊ (SQ4) ----------------
   Antes do nível do mural, o painel dele e o trabalho da casa não ficam
   mudos nem dizem o mecanismo: dizem uma linha do mundo. A lei «o sistema
   não fala de si mesmo» — nenhuma destas frases nomeia nível, portão,
   missão nem mural; o jogador sente o porquê pela ficção, e a suíte
   (teste-mural-vai-se-buscar) prova que nenhuma o nomeia. */
export const FALAS_DO_PORTAO = Object.freeze({
  mural: "Ainda ninguém confia trabalho a quem chegou há pouco.",
  casa: "A casa ainda não tem serviço para quem acabou de entrar.",
});

/* A linha que o lugar diz, dado o portão de agora (o que
   `secundariasAbertas` devolveu). Aberto, ou lugar sem linha: "" — o
   painel mostra o que sempre mostrou. Nunca estoura. */
export function falaDoPortao(onde, portao) {
  const p = obj(portao);
  if (p.mural !== false) return "";
  return FALAS_DO_PORTAO[onde] || "";
}

export function secundariasAbertas(estado) {
  const P = PORTAO_DAS_SECUNDARIAS;
  const e = obj(estado);
  const aberto = (porque) => ({ abertas: true, porque, mural: true });
  if (garantirAbertura(e.abertura).legado) return aberto("save-antigo");
  const marcos = garantirEspinha(e.espinha).atos.flatMap((a) => a.marcos);
  if (!marcos.length) return aberto("sem-historia");
  const n = Math.floor(Number(e.nivel));
  const nivel = Number.isFinite(n) && n > 0 ? n : 1;
  const mural = nivel >= Math.max(P.nivel, P.nivelDoMural);
  if (marcos.filter((m) => m.feito).length >= P.marcos) return { abertas: true, porque: "marco", mural };
  if (nivel >= P.nivel) return { abertas: true, porque: "nivel", mural };
  return { abertas: false, porque: "introducao", mural: false };
}
