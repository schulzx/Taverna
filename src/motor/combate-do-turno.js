/* ============================================================
   OS ÓRGÃOS DO COMBATE, PUROS (T1-A, 5.ª fatia, 28/10/2026) — src/motor/combate-do-turno.js

   O bloco do combate do `aplicarResposta` (cerca de 225 linhas) não coube
   na 4.ª fatia: chama uns quinze órgãos do App que escrevem por conta
   própria — nos refs, na nota, na tela. Movê-lo byte a byte pede antes
   que esses órgãos sejam puros: que recebam o que leem e devolvam o que
   mudam. É o que este arquivo junta, um órgão por vez, começando pelos de
   menos leitores.

   A forma é a da casa (aplicar.js, fim-do-turno.js): cada peça devolve
   `{ ..., msgs, paraOCronista, efeitos }` — as linhas da tela, as notas ao
   Narrador (que o App junta com `notaComOTurno`) e as escritas que só o
   App sabe fazer (um ref, um contador). O App guarda o nome antigo do
   órgão, agora um invólucro que chama a peça e aplica o que ela devolve:
   os chamadores não mudam.

   A prova de cada órgão é byte a byte contra o código antigo, lido do git
   (`testes/gerar-combate-dourado.mjs` corre o App de 7338870 sobre os
   casos de `testes/combate-casos.mjs`; `teste-motor-combate.mjs` exige o
   mesmo da peça nova).
   ============================================================ */

import { gerarHabilidadeUnica, chanceUnica } from "../unicas.js";
import { patamarFama } from "../fama.js";

/* ---------------- O PODER ÚNICO (v7.4.4) ----------------
   Mesma lógica do loot: a árvore da classe é tabela fixa, mas derrubar
   elite ou lendário pode DESPERTAR uma técnica só sua, gerada por código.
   A IA narra a epifania; o sistema cria e limita.

     despertarUnica(pers, inimigosFinais, { sorteDoTurno }) →
       { pers, msgs, paraOCronista }

   A sorte vem do turno, pelo evento "habilidade-unica", e é pedida DUAS
   vezes quando o poder desperta (o teste da chance e a geração), como no
   App: a contagem do evento anda igual. */
export function despertarUnica(pers, inimigosFinais, ctx) {
  const c = ctx && typeof ctx === "object" ? ctx : {};
  const p2 = pers;
  const msgs = [], paraOCronista = [];
  /* sem a sorte do turno não há sorteio (nenhum dado fora da semente) */
  if (typeof c.sorteDoTurno !== "function" || !p2 || typeof p2 !== "object") return { pers: p2, msgs, paraOCronista };
  const sorteDoTurno = c.sorteDoTurno;
  const ch = chanceUnica(inimigosFinais);
  if (!ch || sorteDoTurno("habilidade-unica")() >= ch) return { pers: p2, msgs, paraOCronista };
  const existentes = (p2.habilidades || []).map((x) => x.nome);
  const hu = gerarHabilidadeUnica(p2.nivel || 1, existentes, sorteDoTurno("habilidade-unica"));
  msgs.push(`🌟 PODER ÚNICO DESPERTOU: ${hu.nome} (${hu.custo} PM · recarga ${hu.recarga}t) — ${hu.descricao}`);
  paraOCronista.push(`[PODER ÚNICO — REGISTRADO PELO SISTEMA] A vitória sobre ${((inimigosFinais || [])[0] || {}).nome || "o inimigo"} despertou em mim uma técnica só minha: "${hu.nome}" (${hu.descricao}). Já está na minha lista de habilidades — NÃO a crie de novo. Narre a epifania como um momento raro e marcante: o poder do derrotado deixou uma marca em mim.`);
  return { pers: { ...p2, habilidades: [...(p2.habilidades || []), hu] }, msgs, paraOCronista };
}

/* ---------------- A FAMA QUE CRESCE (v6.8) ----------------
   Derivada das façanhas reais — a IA não infla nem esquece. Quando o
   patamar sobe, o mundo muda o tratamento: a linha na tela e a nota ao
   Narrador (canon). A fama em si é conta do App (`famaAtual`, que lê os
   contadores, o nível da ficha viva e os domínios); esta peça compara-a
   com a da última checagem.

     aFamaDoFeito(fama, famaAntes) → { fama, msgs, paraOCronista }

   `fama` é também o que o App guarda como a "última checagem"
   (famaPatamarRef), suba ou não o patamar. */
export function aFamaDoFeito(fama, famaAntes) {
  const f = fama;
  const msgs = [], paraOCronista = [];
  const antes = patamarFama(famaAntes), agora = patamarFama(f);
  if (agora.min > antes.min) {
    msgs.push(`📣 Sua fama cresce: agora você é ${agora.rotulo} — ${agora.nota}.`);
    paraOCronista.push(`[FAMA — NOVO PATAMAR, CANON] Minha fama subiu para ${Math.round(f)}: agora sou ${agora.rotulo.toUpperCase()} (${agora.nota}). O mundo passa a me tratar assim — reconhecimento em cidades, olhares, respeito ou medo. NPCs relevantes podem já ter ouvido meu nome.`);
  }
  return { fama: f, msgs, paraOCronista };
}
