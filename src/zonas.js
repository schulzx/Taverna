/* ============================================================
   ZONAS DE COMBATE (v9.20) — o espaço volta para a luta

   O combate da Taverna era abstrato: você ataca, o dado cai, o
   inimigo revida. Funciona, e é exatamente por isso que ficou sem
   graça — não havia NADA para decidir além de qual golpe usar. Numa
   mesa, metade das decisões de luta são espaciais: recuar para trás
   da coluna, segurar a porta, atrair o bicho para longe do arqueiro,
   escolher entre atacar agora ou fechar a distância primeiro.

   Sem espaço, também não existem meias-medidas: cobertura, terreno
   difícil, área que pega dois, o motivo de um arqueiro querer
   distância. O ataque de oportunidade que este jogo já tinha era um
   fantasma — ele existe para punir quem SAI DO ALCANCE, e não havia
   alcance nenhum.

   POR QUE ZONAS E NÃO UM TABULEIRO. Grade quadriculada exige contar
   quadrados, desenhar mapa e digitar coordenadas — três coisas que
   matam o ritmo de um jogo que se joga escrevendo. Zonas nomeadas
   ("junto à fogueira", "entre as mesas", "na escada") dão a decisão
   tática inteira e se descrevem em português. É a solução que as
   mesas modernas encontraram, e ela cabe aqui melhor ainda porque o
   Mestre já narra em nomes de lugar, não em metros.

   A REGRA DE OURO DESTE ARQUIVO: sem campo definido, tudo se comporta
   exatamente como antes. Toda função aceita `campo` nulo e responde
   "alcança, pode, sem penalidade". É o que deixa a mudança mais
   invasiva do projeto entrar sem quebrar os seis conjuntos de teste
   de combate que já existiam — e o que garante que um save antigo,
   ou um combate aberto pelo modo criativo, continue jogável.
   ============================================================ */

/* ---------------- OS CENÁRIOS ----------------
   Três zonas em LINHA. Três e não cinco porque a decisão interessante
   ("fico, avanço ou recuo?") já existe com três, e cada zona a mais
   é uma linha a mais na tela e um passo a mais de deslocamento para
   qualquer coisa acontecer.

   `cobertura` dá +2 de defesa a quem está lá. `dificil` custa a ação
   inteira para entrar, não só o movimento. */
const Z = (nome, extra = {}) => ({ nome, cobertura: !!extra.cobertura, dificil: !!extra.dificil });

export const CENARIOS = {
  taverna: [Z("junto ao balcão"), Z("entre as mesas"), Z("ao pé da escada", { cobertura: true })],
  floresta: [Z("na clareira"), Z("entre os troncos", { cobertura: true }), Z("no matagal fechado", { dificil: true })],
  masmorra: [Z("no corredor"), Z("no vão da porta", { cobertura: true }), Z("no fundo da sala")],
  estrada: [Z("na estrada"), Z("na vala", { cobertura: true }), Z("na encosta", { dificil: true })],
  cidade: [Z("no meio da praça"), Z("sob a arcada", { cobertura: true }), Z("no beco estreito")],
  caverna: [Z("na boca da caverna"), Z("atrás das estalagmites", { cobertura: true }), Z("no poço escuro", { dificil: true })],
  ruina: [Z("no pátio"), Z("atrás do muro caído", { cobertura: true }), Z("na torre desabada", { dificil: true })],
  navio: [Z("no convés"), Z("atrás do mastro", { cobertura: true }), Z("no castelo de popa")],
  gelo: [Z("no campo aberto"), Z("atrás do bloco de gelo", { cobertura: true }), Z("na neve funda", { dificil: true })],
  deserto: [Z("na areia batida"), Z("atrás da duna", { cobertura: true }), Z("na areia solta", { dificil: true })],
};

/* O bioma do mapa e o lugar da cena decidem o cenário. A ordem
   importa: masmorra ganha de bioma, porque quem está numa masmorra
   está numa masmorra mesmo que o bioma de fora seja floresta. */
export function cenarioDe({ emMasmorra = false, local = "", bioma = "" } = {}) {
  if (emMasmorra) return "masmorra";
  const t = `${local} ${bioma}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/taverna|estalagem|salao|tasca|bar\b/.test(t)) return "taverna";
  if (/navio|barco|convés|conves|porto|galera/.test(t)) return "navio";
  if (/caverna|gruta|toca|mina/.test(t)) return "caverna";
  if (/ruina|ruína|templo|cripta|catacumba/.test(t)) return "ruina";
  if (/cidade|vila|praca|praça|mercado|rua/.test(t)) return "cidade";
  if (/floresta|bosque|mata|selva/.test(t)) return "floresta";
  if (/gelo|neve|tundra|geleira/.test(t)) return "gelo";
  if (/deserto|areia|dunas/.test(t)) return "deserto";
  return "estrada";
}

export function montarCampo(ctx = {}) {
  const id = cenarioDe(ctx);
  const zonas = (CENARIOS[id] || CENARIOS.estrada).map((z, i) => ({ ...z, i }));
  return { cenario: id, zonas };
}

export function garantirCampo(c) {
  if (!c || !Array.isArray(c.zonas) || !c.zonas.length) return null;
  return { cenario: c.cenario || "estrada", zonas: c.zonas.map((z, i) => ({ nome: String(z.nome || `zona ${i + 1}`), cobertura: !!z.cobertura, dificil: !!z.dificil, i })) };
}

export function zonaDe(campo, i) {
  const c = garantirCampo(campo);
  if (!c) return null;
  return c.zonas[Math.max(0, Math.min(c.zonas.length - 1, Math.floor(Number(i) || 0)))];
}
export function nomeDaZona(campo, i) {
  const z = zonaDe(campo, i);
  return z ? z.nome : "";
}

/* ---------------- POSICIONAR ----------------
   Herói e grupo na primeira zona, inimigos na última — a distância
   inicial é o que dá sentido ao primeiro turno. Bicho ágil começa no
   meio: ele é rápido, e o sistema deve mostrar isso antes de o
   jogador descobrir apanhando. */
export function posicionarInimigos(campo, inimigos) {
  const c = garantirCampo(campo);
  if (!c) return inimigos || [];
  const ultima = c.zonas.length - 1;
  const meio = Math.max(0, ultima - 1);
  return (inimigos || []).map((e) => ({ ...e, zona: e.zona != null ? e.zona : (e.agil ? meio : ultima) }));
}

export const ZONA_HEROI = 0;

/* ---------------- ALCANCE ----------------
   Corpo a corpo alcança a própria zona. À distância alcança tudo,
   mas paga 2 por zona a partir da segunda — atirar longe é pior que
   atirar perto, e sem esse custo ninguém nunca se moveria. */
export const PENALIDADE_POR_ZONA = 2;

export function distanciaEntre(campo, a, b) {
  if (!garantirCampo(campo)) return 0;
  return Math.abs((Number(a) || 0) - (Number(b) || 0));
}

export function alcanca(campo, zonaAtacante, zonaAlvo, { distancia = false } = {}) {
  const c = garantirCampo(campo);
  if (!c) return { ok: true, penalidade: 0 };   // sem campo: comportamento antigo
  const d = distanciaEntre(campo, zonaAtacante, zonaAlvo);
  if (d === 0) return { ok: true, penalidade: 0 };
  if (!distancia) {
    return { ok: false, penalidade: 0, motivo: `está em ${nomeDaZona(campo, zonaAlvo)}, longe demais para golpe de perto` };
  }
  return { ok: true, penalidade: (d - 1) * PENALIDADE_POR_ZONA, distancia: d };
}

/* Cobertura: +2 de defesa para quem está numa zona que protege. */
export const BONUS_COBERTURA = 2;
export function bonusDefesaDaZona(campo, i) {
  const z = zonaDe(campo, i);
  return z && z.cobertura ? BONUS_COBERTURA : 0;
}

/* ---------------- MOVER ----------------
   Uma zona por movimento; terreno difícil come a ação também. Pular
   duas zonas de uma vez não existe: seria teleporte com outro nome, e
   o custo de atravessar é justamente o que torna a posição uma
   decisão em vez de uma etiqueta. */
export function podeMover(campo, de, para) {
  const c = garantirCampo(campo);
  if (!c) return { ok: false, motivo: "não há terreno definido nesta luta" };
  const i = Math.floor(Number(para));
  if (!Number.isFinite(i) || i < 0 || i >= c.zonas.length) return { ok: false, motivo: "essa zona não existe" };
  if (i === de) return { ok: false, motivo: "você já está aí" };
  const d = distanciaEntre(campo, de, i);
  if (d > 1) return { ok: false, motivo: `${c.zonas[i].nome} está a ${d} zonas — atravesse uma de cada vez` };
  return { ok: true, custaAcao: !!c.zonas[i].dificil, zona: c.zonas[i] };
}

/* Quem está colado em você — é a lista que o ataque de oportunidade
   sempre precisou e nunca teve. */
export function inimigosNaZona(inimigos, zona) {
  return (inimigos || []).filter((e) => e && !e.derrotado && (e.vida || 0) > 0 && (e.zona ?? 0) === zona);
}

/* ---------------- A IA DE POSIÇÃO ----------------
   O inimigo que não alcança o alvo anda uma zona na direção dele; o
   que alcança, fica e bate. É a decisão mínima que faz a luta parecer
   ter gente pensando — e ela é determinística, então o Mestre não
   escolhe nada. */
export function moverInimigos(campo, inimigos, zonaAlvo) {
  const c = garantirCampo(campo);
  if (!c) return { inimigos: inimigos || [], movimentos: [] };
  const movimentos = [];
  const novos = (inimigos || []).map((e) => {
    if (e.derrotado || (e.vida || 0) <= 0) return e;
    const z = e.zona ?? c.zonas.length - 1;
    if (z === zonaAlvo) return e;
    /* atirador prefere manter distância: se já alcança de longe, não fecha */
    if (e.distancia && distanciaEntre(campo, z, zonaAlvo) <= 1) return e;
    const passo = z < zonaAlvo ? 1 : -1;
    const destino = z + passo;
    movimentos.push({ nome: e.nome, de: c.zonas[z].nome, para: c.zonas[destino].nome });
    return { ...e, zona: destino };
  });
  return { inimigos: novos, movimentos };
}

/* ---------------- OS TEXTOS ---------------- */
export function mapaDoCampo(campo, { zonaHeroi = 0, inimigos = [], grupo = [] } = {}) {
  const c = garantirCampo(campo);
  if (!c) return "";
  return c.zonas.map((z) => {
    const aqui = [];
    if (z.i === zonaHeroi) aqui.push("você");
    for (const g of grupo) if ((g.zona ?? zonaHeroi) === z.i && (g.vida || 0) > 0) aqui.push(g.nome);
    for (const e of inimigos) if (!e.derrotado && (e.vida || 0) > 0 && (e.zona ?? c.zonas.length - 1) === z.i) aqui.push(e.nome);
    const marcas = `${z.cobertura ? " 🛡" : ""}${z.dificil ? " ⛰" : ""}`;
    return `${z.nome}${marcas}: ${aqui.join(", ") || "—"}`;
  }).join(" | ");
}

export function resumoZonasPrompt(campo, { zonaHeroi = 0, inimigos = [], grupo = [] } = {}) {
  const c = garantirCampo(campo);
  if (!c) return "";
  return `TERRENO DA LUTA (do sistema — obedeça): ${mapaDoCampo(campo, { zonaHeroi, inimigos, grupo })}.
Estas posições são FATO. Você não move ninguém, não faz um inimigo "cruzar o salão" para alcançar quem está longe, não põe alguém a golpe de espada de quem está a duas zonas de distância. Quem se move, se move pelo sistema, e você recebe o movimento pronto para narrar. Use os NOMES dos lugares na prosa — "ele recua para o pé da escada" —, nunca a palavra zona nem números.`;
}

export const ZONAS_PROMPT = `TERRENO E POSIÇÃO (v9.20):
- Toda luta acontece num terreno de três lugares nomeados, e cada combatente está em UM deles. O envelope diz quem está onde.
- Golpe de perto só alcança quem está no MESMO lugar. Arma de longe alcança tudo, com penalidade crescente. Quem sai de perto de um inimigo leva um golpe livre.
- Você NUNCA move ninguém e NUNCA faz alguém alcançar quem está longe. Os movimentos chegam prontos no envelope; sua tarefa é narrá-los com os nomes dos lugares ("ele salta para trás do muro caído"), sem citar zona, distância em metros ou números.`;

/* ---------------- O CÃO DE GUARDA ----------------
   O Mestre narra espaço com naturalidade — é o que ele faz de melhor
   e é exatamente por isso que ele vai errar aqui. "O ogro atravessa o
   salão e te agarra" é uma frase boa e, com zonas, uma contradição
   verificável. Este detector vive junto dos outros, no portão.

   A régua é estreita de propósito: só morde quando um inimigo de
   OUTRA zona é descrito ENCOSTANDO no herói. Aproximar-se, avançar,
   rosnar de longe — tudo isso é livre, e é a maior parte do que ele
   escreve. */
const CONTATO = /(te agarra|te alcanca|te acerta|te atinge|te derruba|crava|encosta a lamina|encosta a espada|fecha as maos|a um palmo|no seu pescoco|no seu rosto|colado em voce|ao seu lado|na sua cara|te pega pel)/;

/* A GUARDA DE NEGAÇÃO, e ela é obrigatória aqui por um motivo específico.
   Quando o portão manda consertar um teleporte, a frase mais natural que o
   revisor escreve é exatamente "ele ruge de longe e AINDA NÃO TE ALCANÇA" —
   que contém "te alcanca" e reprovava na re-checagem. O conserto certo era
   recusado, o portão desistia e o jogador lia o texto errado mesmo assim:
   a violação sobrevivia justamente porque a correção dela foi bem escrita.
   Pego no teste dentro do jogo, não nos testes de unidade. */
const CONTATO_NEGADO = /\b(nao|sem|quase|ainda|antes que|impedid|longe demais|fora de alcance|nem chega)\b/;

export function detectarAlcanceImpossivel(narrativa, { campo, zonaHeroi = 0, inimigos = [] } = {}) {
  const c = garantirCampo(campo);
  if (!c) return [];
  const bruto = String(narrativa || "").normalize("NFD").replace(/[̀-ͯ]/g, "");
  const texto = bruto.toLowerCase();
  if (!texto.trim()) return [];
  const out = [];
  for (const e of inimigos || []) {
    if (!e || !e.nome || e.derrotado || (e.vida || 0) <= 0) continue;
    const z = e.zona ?? c.zonas.length - 1;
    if (z === zonaHeroi) continue;                     // está perto: pode encostar
    const alvo = e.nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    /* TODAS as aparições, não a primeira (v9.20.1). O teste no jogo pegou
       isto: "Um Troll surge no fundo. O Troll te agarra pelo pescoço" passava
       batido, porque a primeira menção estava numa frase inofensiva e a
       busca parava ali. Apresentar a criatura antes de ela agir é como um
       Mestre escreve — então a primeira aparição é justamente a que quase
       nunca tem o contato. */
    let achou = false;
    let pos = texto.indexOf(alvo);
    while (pos >= 0 && !achou) {
      /* a frase inteira, não uma janela: contato descrito em outra frase é
         de outro sujeito, e morder ali seria falso positivo caro. */
      let ini = 0; for (let i = pos - 1; i >= 0; i--) if (/[.!?;:\n]/.test(texto[i])) { ini = i + 1; break; }
      let fim = texto.length; for (let i = pos; i < texto.length; i++) if (/[.!?;:\n]/.test(texto[i])) { fim = i; break; }
      const frase = texto.slice(ini, fim);
      if (CONTATO.test(frase) && !CONTATO_NEGADO.test(frase)) achou = true;
      else pos = texto.indexOf(alvo, pos + alvo.length);
    }
    if (!achou) continue;
    out.push({ nome: e.nome, onde: c.zonas[z].nome, distancia: distanciaEntre(campo, z, zonaHeroi) });
  }
  return out;
}

export function notaAlcanceImpossivel(achados, campo, zonaHeroi = 0) {
  if (!achados.length) return "";
  const c = garantirCampo(campo);
  const aqui = c ? c.zonas[zonaHeroi].nome : "onde estou";
  const l = achados.map((a) => `${a.nome} (que está em ${a.onde}, a ${a.distancia} lugar${a.distancia > 1 ? "es" : ""} de distância)`).join("; ");
  return `[CORREÇÃO DO SISTEMA — ALCANCE] Você pôs ${l} encostando em mim, mas eu estou em ${aqui} e essa criatura NÃO está aqui. Ninguém atravessa o terreno de graça: quem se move, se move pelo sistema, e o movimento chega pronto no envelope. Reescreva: ou ela ameaça e avança SEM me alcançar, ou quem me encostou é outro inimigo que de fato está comigo.`;
}
