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
import { recompensaChefe } from "../masmorras.js";
import { essenciaDoChefe, RARIDADE_ROTULO } from "../loot.js";
import { garantirSuprimentos } from "../ermos.js";
import { concluirLugar } from "../mundo-base.js";
import { agravarParaMorte } from "../crime.js";

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

/* ---------------- O CHEFE CAIU (MM11) ----------------
   A masmorra conclui-se por código: as moedas do fundo, um item épico ou
   lendário garantido, a essência do chefe (a maior fonte do jogo, v9.54),
   e as tochas que sobraram voltam para a mochila (v9.26). UM bloco, DUAS
   portas no App: a vitória declarada na resposta do Narrador e a que o
   SISTEMA fecha no golpe. Idempotente: larga a masmorra, então a segunda
   porta não encontra sala de chefe e devolve a ficha como veio.

     concluirAMasmorra(pers, { masmorra, mapa, base }, { lexico, sorteDoTurno }) →
       { pers, concluiu, msgs, efeitos }

   Os efeitos, na ordem em que o App os fazia: `masmorra` (largada),
   `contador` (masmorrasConcluidas), `base` (MM17 C1: só num mapa de
   região a base guarda QUAL masmorra acabou — é o que o marco "descer" da
   espinha lê) ou `calou` (se essa escrita estourar). O resto — a sala em
   curso que se esvazia e a sessão que pode fechar — é do App, depois. */
export function concluirAMasmorra(pers, estado, ctx) {
  const e0 = estado && typeof estado === "object" ? estado : {};
  const c = ctx && typeof ctx === "object" ? ctx : {};
  const msgs = [], efeitos = [];
  let p2 = pers;
  const mm = e0.masmorra;
  const sala = mm && Array.isArray(mm.salas) ? mm.salas.find((x) => x.id === mm.atual) : null;
  if (!mm || !sala || sala.tipo !== "chefe") return { pers: p2, concluiu: false, msgs, efeitos };
  const rec = recompensaChefe(p2.nivel || 1, c.lexico, typeof c.sorteDoTurno === "function" ? c.sorteDoTurno("chefe") : undefined);
  const essChefe = essenciaDoChefe(p2.nivel || 1);
  p2 = { ...p2, moedas: (p2.moedas || 0) + (sala.moedas || 0), equipamento: [...(p2.equipamento || []), rec.item],
         essencia: (p2.essencia || 0) + essChefe,
         suprimentos: { ...garantirSuprimentos(p2.suprimentos), tochas: Math.max(0, mm.tochas || 0) } };
  msgs.push(`🕳 ${mm.nome} CONCLUÍDA! Tesouro do fundo: +${sala.moedas} moedas · ⚗ +${essChefe} essência · ✦ ${rec.item.nome} (${RARIDADE_ROTULO[rec.item.raridade] || rec.item.raridade})`);
  if ((mm.tochas || 0) > 0) msgs.push(`🕯 ${mm.tochas} tocha(s) voltam para a mochila.`);
  efeitos.push({ tipo: "masmorra", masmorra: null });
  efeitos.push({ tipo: "contador", nome: "masmorrasConcluidas" });
  if (e0.mapa && e0.mapa.regiao) {
    try { efeitos.push({ tipo: "base", base: concluirLugar(e0.base, mm.nome) }); } catch (e) { efeitos.push({ tipo: "calou", onde: "a masmorra concluída na base", erro: e }); }
  }
  return { pers: p2, concluiu: true, msgs, efeitos };
}

/* ---------------- A MORTE DE UM ALVO (v9.0) ----------------
   Alguém morreu por decisão do sistema (o combate, um decreto cumprido):
   registra-se no elenco e propaga-se a quem depende disso.

     aMorteDoAlvo({ npcs, nemesis, lei, dia, ctxDaLei }, nome, causa, { aproximado })
       → { morreu, ehNemesis, efeitos }

   MM10: se a vítima de um crime conhecido cai aqui, o crime vira matar —
   mais caro, mais longo, e a rua já sabia mesmo sem ver o corpo.
   `ctxDaLei` é uma função (o mundo de agora: a semente, o mapa, a cidade…)
   e é chamada DENTRO da rede, como era: se montar o mundo estoura, cala a
   lei e segue a morte.

   Nome exato sempre; parecido SÓ quando o texto veio do jogador (o alvo de
   um decreto é digitado à mão: "a cabeça de Sarna, a Víbora"). Em combate
   exige-se exato — senão "Bandido do Corvo" mataria a NPC "Corvo".

   Os efeitos, na ordem: `lei` (ou `calou`), `npcs` (quem morreu, com a
   nota do dia). Se era a nêmesis, `ehNemesis` — e encerrá-la é o órgão do
   App (encerrarNemesis), a porta única da morte dela. */
export function aMorteDoAlvo(estado, nome, causa, opcoes) {
  const e0 = estado && typeof estado === "object" ? estado : {};
  const { aproximado = false } = opcoes && typeof opcoes === "object" ? opcoes : {};
  const efeitos = [];
  const alvo = String(nome || "").trim();
  if (!alvo) return { morreu: false, ehNemesis: false, efeitos };
  try { efeitos.push({ tipo: "lei", lei: agravarParaMorte(e0.lei, alvo, typeof e0.ctxDaLei === "function" ? e0.ctxDaLei() : e0.ctxDaLei) }); } catch (e) { efeitos.push({ tipo: "calou", onde: "agravarParaMorte", erro: e }); }
  const npcs = e0.npcs;
  const chave = Object.keys(npcs || {}).find((k) => k.toLowerCase() === alvo.toLowerCase())
    || (aproximado ? Object.keys(npcs || {}).find((k) => k.length >= 5 && new RegExp(`(^|\\W)${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\W|$)`, "i").test(alvo)) : null);
  if (chave) {
    efeitos.push({ tipo: "npcs", npcs: { ...npcs, [chave]: { ...npcs[chave], status: "morto", notas: `${npcs[chave].notas || ""} Morreu no dia ${e0.dia}${causa ? ` — ${causa}` : ""}.`.trim() } } });
  }
  const n = e0.nemesis;
  const nomeNem = (n && n.nome ? n.nome : "").toLowerCase();
  const ehNemesis = !!nomeNem && n.status !== "derrotada" && (
    nomeNem === alvo.toLowerCase() ||
    (chave && nomeNem === chave.toLowerCase()) ||
    new RegExp(`(^|\\W)${nomeNem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\W|$)`, "i").test(alvo)
  );
  return { morreu: !!chave || ehNemesis, ehNemesis, efeitos };
}
