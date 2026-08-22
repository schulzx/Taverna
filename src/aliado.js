/* ============================================================
   O SISTEMA ALIADO (v9.108) — quem anda comigo quer alguma coisa

   "Membros do grupo do personagem podem ser mais vivos, com diálogos e
   ações sem que o player force algo. Eles precisam ter vontade."

   Hoje o companheiro tem classe e decide o turno de luta
   (`companheiros.js`), e um número de vínculo (`vinculos.js`). Fora do
   combate, é móvel. Um Mestre de mesa joga os aliados o tempo todo — e
   os aliados são o único elenco que está SEMPRE presente, o que os torna
   a maior fonte de vida desperdiçada do jogo.

   Este é o segundo AGENTE: ele É alguém e responde "o que eu faço".
   Mas ele é diferente do vilão em duas coisas que mudam o desenho:

   1) ELE INICIA, não só reage. Um NPC responde quando é abordado; um
      aliado age sem ser chamado, e é isso que o faz parecer vivo.

   2) ELE TEM UM STAKE NAS MINHAS ESCOLHAS. O que eu faço aprova ou
      desaprova, e isso acumula até virar uma decisão dele.

   ---------------- QUATRO PEÇAS ----------------

   A VONTADE avança ou APODRECE sozinha. Se o herói nunca ajuda, ela se
   resolve mal — e é isso que a torna real em vez de decorativa. Uma
   vontade que só anda quando o jogador empurra é uma missão, não uma
   pessoa.

   O CÓDIGO é a versão de aliado das "linhas que não se cruzam": duas ou
   três coisas em que ele acredita. Cruzar o código é o que gasta a
   relação — e não o número de vínculo, que mede outra coisa.

   A OPINIÃO é POSIÇÃO, não número. "Ele para de te chamar pelo nome" diz
   mais que "vínculo −3", e é encenável.

   A PARTIDA tem de ser possível, senão as opiniões não valem nada.

   ---------------- O TETO ----------------

   UM aliado por turno. Quatro companheiros comentando cada jogada é
   insuportável, e o silêncio dos outros três é o que faz a fala do
   primeiro valer alguma coisa.
   ============================================================ */

/* ---------------- O CÓDIGO ----------------
   Duas ou três por aliado, sorteadas do conceito dele quando ele entra.
   `cruzou` recebe o ATO do herói e a situação — as mesmas categorias
   fechadas que o Intérprete usa, para não haver duas linguagens. */
export const CODIGOS = [
  { id: "nao_se_mente", o: "não se mente para quem confia", cruzou: (a) => a.ato === "menti" && a.presente },
  { id: "nao_se_bate_em_quem_ja_caiu", o: "não se bate em quem já caiu", cruzou: (a) => a.ato === "feri" && a.rendido },
  { id: "nao_se_compra_gente", o: "não se compra gente", cruzou: (a) => a.ato === "paguei" && a.suborno },
  { id: "nao_se_deixa_ninguem", o: "não se deixa ninguém para trás", cruzou: (a) => a.ato === "ignorei" && a.alguemPrecisava },
  { id: "palavra_dada", o: "palavra dada é dívida", cruzou: (a) => a.quebreiPromessa },
  { id: "nao_se_rouba_pobre", o: "não se rouba de quem tem pouco", cruzou: (a) => a.roubeiPobre },
  { id: "sangue_por_ultimo", o: "sangue é o último recurso, nunca o primeiro", cruzou: (a) => a.ato === "feri" && !a.emCombate },
  { id: "sem_covardia", o: "não se foge de uma briga que se começou", cruzou: (a) => a.fugi },
  { id: "os_meus_primeiro", o: "os meus vêm antes dos outros", cruzou: (a) => a.escolhiEstranho },
  { id: "nada_de_magia_suja", o: "há poder que não se toca", cruzou: (a) => a.usoProibido },
  { id: "respeito_aos_mortos", o: "não se mexe em quem já morreu", cruzou: (a) => a.saqueiCorpo },
  { id: "lei_e_lei", o: "a lei é a lei, mesmo quando é ruim", cruzou: (a) => a.quebreiLei },
];
export function codigoPorId(id) { return CODIGOS.find((c) => c.id === id) || null; }

/* ---------------- A VONTADE ----------------
   Três etapas, e não nove: a vontade de um aliado é uma linha ao lado da
   história, não uma segunda campanha. `apodrece` é o que acontece quando
   o herói nunca ajuda — e é isso que a faz existir de verdade. */
export const VONTADES = [
  { id: "achar_irmao", o: "achar o irmão que sumiu", etapas: ["descobrir a última cidade em que o viram", "chegar a quem falou com ele por último", "encontrar o que sobrou dele"], apodrece: "descobre que ele morreu, e descobre por terceiros" },
  { id: "pagar_divida", o: "pagar uma dívida antiga", etapas: ["juntar o que falta", "encontrar a quem deve", "entregar em mãos"], apodrece: "a dívida é cobrada de alguém da família dele" },
  { id: "evitar_cidade", o: "nunca mais pisar numa certa cidade", etapas: ["desviar da rota", "recusar o trabalho que leva para lá", "explicar por quê"], apodrece: "alguém de lá o encontra primeiro" },
  { id: "provar_valor", o: "provar que serve para alguma coisa", etapas: ["pedir a tarefa difícil", "fazê-la sozinho", "que alguém veja"], apodrece: "endurece, e passa a arriscar demais" },
  { id: "chegar_a_tempo", o: "chegar a um lugar antes de uma data", etapas: ["dizer que tem pressa", "pedir para desviar", "ir sozinho se preciso"], apodrece: "perde a data, e não fala mais nisso" },
  { id: "vingar_alguem", o: "cobrar de quem matou alguém dele", etapas: ["confirmar quem foi", "chegar perto", "decidir o que fazer com isso"], apodrece: "se conforma, e o conforto o azeda" },
  { id: "aprender", o: "aprender o que o herói sabe fazer", etapas: ["pedir para ver", "tentar e errar", "acertar uma vez"], apodrece: "desiste, e passa a diminuir o que não conseguiu" },
  { id: "juntar_dinheiro", o: "juntar dinheiro para comprar uma coisa específica", etapas: ["guardar em vez de gastar", "recusar uma tentação", "comprar"], apodrece: "gasta tudo de uma vez em outra coisa" },
  { id: "voltar_para_casa", o: "voltar para casa uma vez que seja", etapas: ["dizer de onde veio", "pedir a parada", "entrar pela porta"], apodrece: "para de falar de casa" },
  { id: "proteger_alguem", o: "proteger alguém que o herói nem sabe que existe", etapas: ["sumir por umas horas", "pedir dinheiro sem explicar", "ser descoberto"], apodrece: "a pessoa se machuca, e ele culpa a si mesmo" },
  { id: "limpar_o_nome", o: "limpar o próprio nome de uma acusação", etapas: ["procurar quem estava lá", "conseguir um documento", "falar com quem acusou"], apodrece: "aceita o nome sujo, e passa a agir como quem já não tem o que perder" },
  { id: "matar_o_bicho", o: "matar uma criatura específica", etapas: ["achar o rastro", "preparar a armadilha", "encarar"], apodrece: "o bicho mata outra pessoa, e ele soube tarde" },
  { id: "ver_o_mar", o: "ver uma coisa que nunca viu", etapas: ["contar por que quer", "chegar perto", "ver"], apodrece: "para de querer, e é isso o que dói" },
  { id: "sair_do_grupo", o: "sair do grupo em bons termos", etapas: ["cumprir o que prometeu", "arrumar quem o substitua", "despedir-se"], apodrece: "sai mal, num dia ruim, sem despedida" },
];
export function vontadePorId(id) { return VONTADES.find((v) => v.id === id) || null; }

/* ---------------- A OPINIÃO ----------------
   Posição, e não número. `sinal` é +1 aprova, −1 desaprova, e ele é o
   que move o vínculo — mas o que sobe à Pauta é o ATO, não o sinal. */
export const OPINIOES = [
  { id: "aprova_alto", sinal: 1, peso: 3, quando: (a) => a.ato === "ajudei" && a.publico, faz: "conta o que eu fiz para quem não viu, e conta melhor do que foi" },
  { id: "aprova_baixo", sinal: 1, peso: 3, quando: (a) => a.ato === "ajudei" || a.poupei, faz: "não diz nada, mas passa a ficar do meu lado da mesa" },
  { id: "aprova_pagar", sinal: 1, peso: 2, quando: (a) => a.ato === "paguei" && !a.suborno, faz: "repara que eu paguei o justo e guarda isso" },
  { id: "gosta_da_verdade", sinal: 1, peso: 3, quando: (a) => a.ato === "revelei", faz: "para o que estava fazendo para ouvir, e depois retribui com uma coisa dele" },
  { id: "desaprova_mentira", sinal: -1, peso: 4, quando: (a) => a.ato === "menti" && a.presente, faz: "deixa de confirmar a minha versão, e o silêncio dele é notado" },
  { id: "desaprova_sangue", sinal: -1, peso: 4, quando: (a) => a.ato === "feri" && !a.emCombate, faz: "limpa a arma dele devagar, olhando para outro lugar" },
  { id: "desaprova_suborno", sinal: -1, peso: 3, quando: (a) => a.suborno, faz: "recusa a parte dele do que veio disso" },
  { id: "desaprova_abandono", sinal: -1, peso: 4, quando: (a) => a.ato === "ignorei" && a.alguemPrecisava, faz: "volta sozinho para trás e resolve por conta própria" },
  { id: "desaprova_covardia", sinal: -1, peso: 3, quando: (a) => a.fugi, faz: "chega depois, sem explicar por onde andou" },
  { id: "cansou", sinal: -1, peso: 4, quando: (a) => a.cruzou >= 2, faz: "para de me chamar pelo nome curto" },
  { id: "esta_indo", sinal: -1, peso: 4, quando: (a) => a.cruzou >= 3, faz: "arruma as próprias coisas de um jeito que não é o de sempre" },
];
export function opiniaoPorId(id) { return OPINIOES.find((o) => o.id === id) || null; }

/* ---------------- OS MOVIMENTOS DE ALIADO ----------------
   O que ele faz por conta própria, sem ninguém pedir. É o que separa um
   companheiro de um item de inventário. */
export const MOVIMENTOS = [
  /* a vontade dele puxando */
  { id: "puxa_a_vontade", peso: 4, quando: (a) => a.vontade && a.etapa === 0 && a.calado >= 2, faz: (a) => `puxa conversa sobre ${a.vontadeTexto}, pela primeira vez` },
  { id: "insiste", peso: 4, quando: (a) => a.vontade && a.etapa >= 1 && a.calado >= 3, faz: (a) => `volta a falar de ${a.vontadeTexto}, e desta vez pede alguma coisa concreta` },
  { id: "some_um_pouco", peso: 3, quando: (a) => a.vontade && a.etapa >= 1 && a.emCidade, faz: () => "some por umas horas e volta sem dizer onde esteve" },
  { id: "vai_sozinho", peso: 4, quando: (a) => a.vontade && a.etapa >= 2 && a.apodrecendo, faz: (a) => `avisa que vai resolver ${a.vontadeTexto} com ou sem mim` },
  { id: "apodreceu", peso: 5, quando: (a) => a.apodreceu, faz: (a) => `carrega o que sobrou de ${a.vontadeTexto}: ${a.apodrecerTexto}` },
  /* o código dele */
  { id: "avisa_do_codigo", peso: 4, quando: (a) => a.cruzouAgora, faz: (a) => `deixa claro, na frente de quem estiver, que ${a.codigoTexto}` },
  { id: "vai_embora", peso: 6, quando: (a) => a.cruzou >= 4 || (a.cruzou >= 3 && a.vinculo <= 20), faz: () => "diz que isto não vai dar certo, e vai embora — de verdade" },
  /* o atrito com outro aliado, que reusa o `entre` do registro */
  { id: "atrito", peso: 4, quando: (a) => !!a.atritoCom, faz: (a) => `arruma um jeito de contrariar ${a.atritoCom} em alguma coisa pequena` },
  { id: "toma_partido", peso: 3, quando: (a) => !!a.atritoCom && a.publico, faz: (a) => `pede que eu escolha entre ele e ${a.atritoCom}, sem dizer que é isso que está pedindo` },
  /* a rede: um aliado sempre tem alguma coisa a fazer */
  { id: "comenta", peso: 2, quando: (a) => a.calado >= 3, faz: () => "comenta o que acabou de acontecer com uma frase que ninguém pediu" },
  { id: "cuida_do_grupo", peso: 2, quando: (a) => a.calado >= 2 && a.acampado, faz: () => "cuida de alguma coisa do grupo que ninguém tinha reparado que precisava" },
  { id: "pergunta_do_rumo", peso: 2, quando: (a) => a.calado >= 4, faz: () => "pergunta para onde estamos indo, e a pergunta não é sobre geografia" },
];
export function movimentoPorId(id) { return MOVIMENTOS.find((m) => m.id === id) || null; }

const limpar = (s, m = 60) => String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, m);

/* ---------------- A FICHA DE ALIADO ----------------
   Guardada por nome, ao lado da ficha de combate que `companheiros.js`
   já mantém. Nasce sorteada e não muda de vontade nem de código: uma
   pessoa que troca de código toda semana não tem código. */
export function garantirAliado(a) {
  const o = a && typeof a === "object" ? a : {};
  return {
    vontade: vontadePorId(o.vontade) ? String(o.vontade) : "",
    etapa: Math.max(0, Math.min(3, Math.floor(Number(o.etapa) || 0))),
    parada: Math.max(0, Math.floor(Number(o.parada) || 0)),   // dias sem andar
    apodreceu: !!o.apodreceu,
    codigos: (Array.isArray(o.codigos) ? o.codigos : []).filter((c) => codigoPorId(c)).slice(0, 3),
    cruzou: Math.max(0, Math.floor(Number(o.cruzou) || 0)),
    calado: Math.max(0, Math.floor(Number(o.calado) || 0)),
    saiu: !!o.saiu,
  };
}

export function garantirAliados(m) {
  const o = m && typeof m === "object" ? m : {};
  const out = {};
  for (const [nome, v] of Object.entries(o)) {
    if (typeof nome === "string" && nome) out[nome] = garantirAliado(v);
  }
  return out;
}

/* Nasce com uma vontade e dois códigos, sorteados de forma determinística
   pelo nome: o mesmo companheiro tem sempre a mesma alma. */
export function nascerAliado(nome, sorte = null) {
  const s = sorte || semear(String(nome || ""));
  const v = VONTADES[Math.floor(s() * VONTADES.length)];
  const c1 = CODIGOS[Math.floor(s() * CODIGOS.length)];
  let c2 = CODIGOS[Math.floor(s() * CODIGOS.length)];
  if (c2.id === c1.id) c2 = CODIGOS[(CODIGOS.indexOf(c1) + 1) % CODIGOS.length];
  return garantirAliado({ vontade: v.id, codigos: [c1.id, c2.id] });
}

/* Um gerador barato e determinístico pelo nome — o mesmo companheiro tem
   sempre a mesma vontade, em qualquer save. */
function semear(txt) {
  let h = 2166136261;
  for (let i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
}

/* ---------------- A VONTADE ANDA OU APODRECE ----------------
   Chamada uma vez por dia. Se o herói ajudou, ela anda; se não, ela
   espera; e se esperar demais, apodrece. */
export const DIAS_ATE_APODRECER = 18;

export function andarVontade(a, { ajudou = false, dias = 1 } = {}) {
  const x = garantirAliado(a);
  if (!x.vontade || x.apodreceu || x.saiu) return x;
  if (ajudou) {
    const v = vontadePorId(x.vontade);
    const etapa = Math.min((v.etapas || []).length, x.etapa + 1);
    return { ...x, etapa, parada: 0 };
  }
  const parada = x.parada + Math.max(1, dias);
  if (parada >= DIAS_ATE_APODRECER) return { ...x, parada, apodreceu: true };
  return { ...x, parada };
}

export function cruzouOCodigo(a, ctx = {}) {
  const x = garantirAliado(a);
  for (const id of x.codigos) {
    const c = codigoPorId(id);
    if (!c) continue;
    let bateu = false;
    try { bateu = !!c.cruzou(ctx); } catch { bateu = false; }
    if (bateu) return c;
  }
  return null;
}

/* ---------------- A SITUAÇÃO ---------------- */
export function garantirCena(c) {
  const o = c && typeof c === "object" ? c : {};
  const b = (v) => !!v;
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  return {
    nome: limpar(o.nome, 30),
    vontade: limpar(o.vontade, 30),
    vontadeTexto: limpar(o.vontadeTexto, 60),
    apodrecerTexto: limpar(o.apodrecerTexto, 70),
    etapa: num(o.etapa),
    apodrecendo: b(o.apodrecendo),
    apodreceu: b(o.apodreceu),
    codigoTexto: limpar(o.codigoTexto, 60),
    cruzouAgora: b(o.cruzouAgora),
    cruzou: num(o.cruzou),
    vinculo: num(o.vinculo, 50),
    calado: num(o.calado),
    atritoCom: limpar(o.atritoCom, 30),
    publico: b(o.publico),
    emCidade: b(o.emCidade),
    acampado: b(o.acampado),
    emCombate: b(o.emCombate),
    ato: limpar(o.ato, 20),
    /* v9.108: e o CONTEXTO DO ATO, que as opiniões leem. A primeira
       versão o passou por fora da situação, e o resultado foi
       "desaprova_mentira" nunca disparando: `presente` era `undefined`
       em silêncio, a condição virava falsa para sempre e ninguém
       percebia. É o modo de falhar que a catraca existe para pegar. */
    presente: b(o.presente),
    suborno: b(o.suborno),
    alguemPrecisava: b(o.alguemPrecisava),
    fugi: b(o.fugi),
    poupei: b(o.poupei),
  };
}

/* ---------------- A HORA DE FALAR ----------------
   O problema mais difícil deste módulo. Um aliado que comenta todo turno
   é insuportável; um que nunca fala é móvel. Ele fala quando toca a
   vontade dele, quando cruzam o código dele, quando a mesa parou, ou
   quando faz tempo demais. */
export const CALADO_ATE_FALAR = 4;

export function podeFalar(cena) {
  const a = garantirCena(cena);
  if (!a.nome) return false;
  if (a.emCombate) return false;          /* na luta ele já age pelo combate */
  if (a.cruzouAgora || a.apodreceu) return true;
  if (a.atritoCom && a.calado >= 2) return true;
  if (a.vontade && a.calado >= 2) return true;
  return a.calado >= CALADO_ATE_FALAR;
}

export function oQueOAliadoFaz(cena, { sorte = Math.random } = {}) {
  const a = garantirCena(cena);
  if (!podeFalar(a)) return null;
  const cand = [];
  for (const m of MOVIMENTOS) {
    let vale = false;
    try { vale = !!m.quando(a); } catch { vale = false; }
    if (vale) cand.push(m);
  }
  if (!cand.length) return null;
  const total = cand.reduce((s, m) => s + m.peso, 0);
  let r = sorte() * total;
  let escolhido = cand[cand.length - 1];
  for (const m of cand) { r -= m.peso; if (r <= 0) { escolhido = m; break; } }
  let texto = "";
  try { texto = escolhido.faz(a); } catch { texto = ""; }
  return texto ? { id: escolhido.id, texto, vaiEmbora: escolhido.id === "vai_embora" } : null;
}

/* A opinião sobre o que o herói acabou de fazer. Separada do movimento
   porque uma coisa é o que ele quer, outra é o que ele achou. */
export function oQueEleAchou(cena, { sorte = Math.random } = {}) {
  const a = garantirCena(cena);
  const cand = [];
  for (const o of OPINIOES) {
    let vale = false;
    try { vale = !!o.quando(a); } catch { vale = false; }
    if (vale) cand.push(o);
  }
  if (!cand.length) return null;
  const total = cand.reduce((s, o) => s + o.peso, 0);
  let r = sorte() * total;
  for (const o of cand) { r -= o.peso; if (r <= 0) return o; }
  return cand[cand.length - 1];
}

/* ---------------- A LINHA DA PAUTA ----------------
   UMA, e de UM aliado. Quatro companheiros comentando cada jogada é
   insuportável, e o silêncio dos outros três é o que faz a fala do
   primeiro valer alguma coisa. */
export function paraPauta(cenas = [], { sorte = Math.random } = {}) {
  const podem = (cenas || []).map(garantirCena).filter((c) => c.nome && podeFalar(c));
  if (!podem.length) return { linhas: [], quem: "", vaiEmbora: false };
  /* quem está calado há mais tempo tem a vez; empate, quem teve o código
     cruzado — porque isso não espera */
  podem.sort((a, b) => (b.cruzouAgora - a.cruzouAgora) || (b.calado - a.calado));
  for (const c of podem) {
    const m = oQueOAliadoFaz(c, { sorte });
    if (!m) continue;
    const linhas = [`${c.nome} ${m.texto}`];
    const op = oQueEleAchou(c, { sorte });
    if (op && op.id !== "esta_indo") linhas.push(`e sobre o que eu acabei de fazer: ${op.faz}`);
    return { linhas, quem: c.nome, vaiEmbora: m.vaiEmbora, opiniao: op ? op.sinal : 0 };
  }
  return { linhas: [], quem: "", vaiEmbora: false };
}

export const ALIADO_PROMPT = `QUEM ANDA COMIGO (v9.108):
· A linha O ALIADO da Pauta é um companheiro AGINDO POR CONTA PRÓPRIA — porque ele quer alguma coisa, porque cruzaram uma linha dele, ou porque ficou calado tempo demais. Não é reação ao que eu pedi: é vontade dele.
· Como sempre, o sistema diz o QUE ele faz; a fala é sua. E dê a ele um jeito próprio de dizer as coisas, que não seja o dos outros.
· Um por turno, e só um. Os outros companheiros estão na cena e calados — isso é deliberado, e é o que faz a vez de cada um valer alguma coisa.`;
