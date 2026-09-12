/* ============================================================
   O PESO DA CENA (v9.204) — luto e glória como movimento

   Sexto órgão do diretor de histórias. O compasso rege o ritmo da AÇÃO;
   não rege a GRAVIDADE. Quando o material do luto existe de verdade — um
   companheiro morto, uma cidade perdida, uma traição revelada —, a cena
   tem peso, e a pauta precisa reconhecê-lo e PROTEGÊ-LO: nenhum mercador
   oferece poção no meio do velório. O mundo tem decoro.

   Peso não se inventa; reconhece-se. Todo gatilho abaixo lê uma perda ou
   uma vitória que o registro JÁ anota — nunca uma emoção que o sistema
   decidiu que o jogador deveria sentir.

   ---------------- AS SEIS PROTEÇÕES ----------------

   Numa cena de peso a pauta: CALA (mercado, oferta, trabalho somem);
   SEGURA (o compasso congela — o velório não avança a onda); CONVOCA
   (quem tem laço com o fato comparece); MARCA (o diário ganha a entrada);
   SOLTA (o jogador encerra quando quiser — peso imposto por tempo mínimo
   é chantagem, não drama); e NÃO EMPILHA (uma cena de peso por vez — dois
   lutos simultâneos viram nenhum).

   ---------------- SEPARADO DO DESENHO ----------------

   Conta se prova. O módulo recebe um snapshot de fatos e devolve o peso
   ativo e o que a pauta cala. O App monta o snapshot e aplica.
   ============================================================ */

/* ---------------- OS DEZ PESOS ----------------
   Cada um é uma cor de gravidade. A cena é SOBRE aquilo. */
export const PESOS = [
  { id: "luto", nome: "Luto", diz: "o que se perdeu e não volta" },
  { id: "furia", nome: "Fúria", diz: "a injustiça ainda quente" },
  { id: "vergonha", nome: "Vergonha", diz: "a falha que teve plateia" },
  { id: "despedida", nome: "Despedida", diz: "quem parte por escolha" },
  { id: "juramento", nome: "Juramento", diz: "a promessa feita com testemunha" },
  { id: "gloria", nome: "Glória", diz: "o que foi conquistado diante de todos" },
  { id: "assombro", nome: "Assombro", diz: "o mundo maior do que se pensava" },
  { id: "alivio", nome: "Alívio", diz: "o perigo que passou raspando" },
  { id: "reencontro", nome: "Reencontro", diz: "quem voltou — mudado" },
  { id: "queda", nome: "Queda", diz: "perder o que dava nome ao herói" },
];
export const pesoPorId = (id) => PESOS.find((p) => p.id === id) || null;

/* ---------------- OS 28 GATILHOS ----------------
   Cada um lê um FATO do registro e acende um peso. A ordem é o conteúdo:
   o primeiro que casar vence, e por isso os mais graves (a morte, a
   traição) vêm antes dos mais leves (a canção, o alívio). Um por cena —
   dois lutos ao mesmo tempo viram nenhum. */
const G = (id, peso, quando, diz) => ({ id, peso, quando, diz });

export const GATILHOS = [
  /* ---- LUTO (4) ---- */
  G("comp_morto_laco", "luto", (s) => !!s.companheiroMortoComLaco, "um companheiro de vínculo morreu"),
  G("npc_querido_morto", "luto", (s) => !!s.npcQueridoMorto, "um NPC de muitas cenas morreu"),
  G("enterro_sem_corpo", "luto", (s) => !!s.enterroSemCorpo, "há um enterro sem corpo para enterrar"),
  G("item_estimacao_destruido", "luto", (s) => !!s.itemEstimacaoDestruido, "um item de estimação foi destruído em cena"),

  /* ---- FÚRIA (4) ---- */
  G("cidade_caiu", "furia", (s) => !!s.cidadeDoHeroiCaiu, "a cidade do herói caiu ou foi saqueada"),
  G("traicao_revelada", "furia", (s) => !!s.traicaoRevelada, "uma traição foi revelada"),
  G("execucao_conhecido", "furia", (s) => !!s.execucaoPublicaConhecido, "houve execução pública de um conhecido"),
  G("templo_profanado", "furia", (s) => !!s.temploProfanado, "o templo do próprio deus foi profanado"),

  /* ---- VERGONHA (3) ---- */
  G("inocente_por_falha", "vergonha", (s) => !!s.inocenteMortoPorFalha, "um inocente morreu por falha do grupo"),
  G("fuga_publica", "vergonha", (s) => !!s.fugaPresenciada, "uma fuga foi presenciada pela cidade"),
  G("credito_roubado", "vergonha", (s) => !!s.impostorExpos, "um impostor expôs o crédito roubado"),

  /* ---- DESPEDIDA (3) ---- */
  G("comp_saiu", "despedida", (s) => !!s.companheiroSaiuPorIndole, "um companheiro saiu do grupo por índole"),
  G("mentor_partiu", "despedida", (s) => !!s.mentorPartiu, "o mentor partiu ou morreu em paz"),
  G("aliado_pra_guerra", "despedida", (s) => !!s.aliadoParaGuerra, "um aliado partiu para guerra distante"),

  /* ---- JURAMENTO (2) ---- */
  G("voto_no_altar", "juramento", (s) => !!s.votoDianteDeAltar, "um voto foi feito diante de altar ou corte"),
  G("pacto_com_faccao", "juramento", (s) => !!s.pactoComTestemunhas, "um pacto foi selado com facção, com testemunhas"),

  /* ---- GLÓRIA (3) ---- */
  G("cidade_conquistada", "gloria", (s) => !!s.primeiraConquista, "a primeira cidade foi conquistada ou libertada"),
  G("titulo_multidao", "gloria", (s) => !!s.tituloDianteDeMultidao, "um título novo foi concedido diante da multidão"),
  G("cancao_do_heroi", "gloria", (s) => !!s.cancaoNaTaverna, "uma canção sobre o herói é tocada na taverna"),

  /* ---- ALÍVIO (3) ---- */
  G("relogio_no_fio", "alivio", (s) => !!s.vitoriaNoUltimoTique, "uma vitória sobre relógio no último tique"),
  G("morte_evitada", "alivio", (s) => !!s.morteEvitadaTestemunhada, "uma morte evitada por um fio, testemunhada"),
  G("divida_quitada", "alivio", (s) => !!s.dividaQuitadaAposAperto, "uma dívida quitada após aperto longo"),

  /* ---- ASSOMBRO (2) ---- */
  G("maravilha", "assombro", (s) => !!s.primeiraMaravilha, "a primeira vista de uma maravilha do mundo"),
  G("criatura_lendaria", "assombro", (s) => !!s.criaturaLendariaVista, "uma criatura lendária vista de longe, viva"),

  /* ---- REENCONTRO (2) ---- */
  G("dado_como_morto", "reencontro", (s) => !!s.retornoDeMorto, "o retorno de alguém dado como morto"),
  G("volta_natal", "reencontro", (s) => !!s.voltaACidadeNatal, "a volta à cidade natal após uma estação fora"),

  /* ---- QUEDA (2) ---- */
  G("perdeu_o_titulo", "queda", (s) => !!s.perdeuOQueDavaNome, "perdeu o que dava nome ao herói"),
  G("dominio_perdido", "queda", (s) => !!s.dominioPerdido, "um domínio conquistado foi perdido"),
];

export const gatilhoPorId = (id) => GATILHOS.find((g) => g.id === id) || null;

/* ---------------- O PESO DA CENA ----------------
   O primeiro gatilho que casa vence — um por cena, nunca empilha. Devolve
   o peso, o gatilho que o acendeu, e as proteções que a pauta aplica.
   Sem gatilho, devolve null: a esmagadora maioria das cenas NÃO tem peso,
   e forçar peso onde não há é o oposto do que este órgão existe para
   fazer. */
export function pesoDaCena(snapshot) {
  const s = snapshot && typeof snapshot === "object" ? snapshot : {};
  for (const g of GATILHOS) {
    let liga = false;
    try { liga = !!g.quando(s); } catch { liga = false; }
    if (liga) {
      const p = pesoPorId(g.peso);
      return { peso: g.peso, nome: p.nome, diz: p.diz, gatilho: g.id, porque: g.diz };
    }
  }
  return null;
}

/* ---------------- O QUE A PAUTA CALA ----------------
   As seções que somem numa cena de peso. Mercado, oferta e trabalho: o
   mundo não vende no velório. É a proteção CALA, entregue como veto — o
   mesmo canal por onde a pauta já diz "não pode". */
export const SECOES_QUE_CALAM = ["mercado", "oferta", "trabalho", "comercio"];
export function vetoDoPeso(peso) {
  const p = pesoPorId(peso);
  if (!p) return "";
  return `CENA DE PESO (${p.nome.toLowerCase()}): o mundo tem decoro. NÃO ofereça mercado, compra, venda, trabalho de guilda nem proposta agora; ninguém puxa assunto de negócio no meio disto. Quem tem laço com o que aconteceu COMPARECE. A cena tem saída: o jogador encerra quando quiser — não prenda a cena por tempo.`;
}

/* segura o compasso: o velório não avança a onda. */
export function seguraOCompasso(peso) { return !!pesoPorId(peso); }

/* ---------------- PARA O CONSOLE DE AUTOR ---------------- */
export function resumoDoPeso(snapshot) {
  const r = pesoDaCena(snapshot);
  return r ? { peso: r.peso, gatilho: r.gatilho } : { peso: null, gatilho: null };
}
