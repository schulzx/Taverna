/* ============================================================
   O LIVRO DE PROMESSAS (v9.199) — o razão do que foi insinuado

   Primeiro dos seis órgãos do diretor de histórias. Toda história que
   parece escrita por gente é feita de promessas pagas: a arma pendurada
   na parede no primeiro ato dispara no terceiro. O prompt já PROÍBE o
   Narrador de colher sem plantar (`prompt.js:459` — "se o sistema não
   plantou, não colha"). Faltava o lado do motor: quem guarda o que foi
   plantado, quando, quantas vezes foi regado, e o que ainda deve.

   Este arquivo é esse razão. Ele não CRIA plantadores — dá memória e
   cobrança aos que já existem (o compasso, o vilão, a espinha, os itens).

   ---------------- O DEFEITO QUE ISTO CONSERTA ----------------

   O inverso exato do bug dos três lobos. Lá, uma etapa mandava colher
   ("mate três lobos") sem nada plantar o lobo — e o Narrador narrou
   pegadas para sempre. Aqui o risco é o gêmeo: o sistema INSINUA (a
   moeda estrangeira no bolso do morto, o brasão limado no espólio) e
   depois nunca colhe — e a insinuação vira ruído, porque nada quebra:
   só nada acontece. O Livro é a catraca que impede as duas metades.

   ---------------- A CATRACA DE DUAS DIREÇÕES ----------------

   ① Nada marcado como revelação ou reviravolta dispara sem o número
      mínimo de sementes MADURAS (leve 1, médio 2, pesado 3). Colher sem
      plantar o bastante é a reviravolta que sai do nada.

   ② Ao fechar um ato da saga, toda semente daquele ato está PAGA ou
      MURCHA-DECLARADA — nunca esquecida. Semente que a janela fechou
      não some em silêncio: vira FIO SOLTO no diário, um mistério aberto
      que o jogador VÊ. Mundo honesto deixa pontas à vista; mundo
      preguiçoso as esconde.

   As duas direções são asserções de suíte, no espírito do teste-ligacao:
   a regra quebra no dia em que for violada, não quando alguém topar com
   ela jogando.

   ---------------- SEPARADO DO DESENHO ----------------

   Conta se prova, desenho se olha — a mesma divisão de `semente.js` e
   `rosto.jsx`. O Livro é conta pura: nenhuma palavra dele vai à tela
   sem passar pela pauta, e a verdade que ele guarda (de que semente é
   semente) NUNCA aparece antes do turno em que se paga. O Narrador
   insinua sem saber do que insinua, e descobre junto com o jogador.
   ============================================================ */

/* ---------------- QUANTO CADA PESO EXIGE ----------------
   Regas até amadurecer, e maduras até poder colher. É a mesma escada nos
   dois lados: um segredo pequeno se paga com uma insinuação; uma
   reviravolta que vira a campanha exige três, de ângulos diferentes.
   Regar não é repetir — é a mesma verdade por outra fresta. */
export const PESOS = { leve: 1, medio: 2, pesado: 3 };
export const pesoValido = (p) => Object.prototype.hasOwnProperty.call(PESOS, String(p || ""));
export function regasParaMadurar(peso) { return PESOS[String(peso || "medio")] || PESOS.medio; }
export function madurasParaColher(peso) { return PESOS[String(peso || "medio")] || PESOS.medio; }

/* ---------------- OS CINCO ESTADOS ----------------
   semeada → regada → madura → paga
                             ↘ murcha (a janela fechou sem pagamento)
   `madura` é o único estado do qual um pagamento PODE partir; `murcha` é
   o único que o diário mostra como fio solto. */
export const ESTADOS = ["semeada", "regada", "madura", "paga", "murcha"];
export const estadoValido = (e) => ESTADOS.includes(String(e || ""));

/* ============================================================
   AS 39 FORMAS DE SEMENTE

   Cada forma diz COMO a insinuação entra em cena (o material concreto
   que o Narrador recebe, sem a conclusão) e o que ela COSTUMA pagar
   (a leitura do sistema, nunca uma ordem à IA). Quem escolhe qual
   plantar é o dono — o compasso, o vilão, a espinha, o item. A forma dá
   o corpo da cena; a semente da campanha dá o determinismo.
   ============================================================ */
export const FORMAS_DE_SEMENTE = [
  /* ---- NO OBJETO (10): a coisa carregada é mais do que parece ---- */
  { id: "brasao_limado", categoria: "objeto", nome: "O brasão limado", comoAparece: "Um item com o símbolo raspado de propósito — sobra a cicatriz de onde o símbolo estava.", pagaComo: "identidade escondida, a facção por trás" },
  { id: "presente_cedo", categoria: "objeto", nome: "O presente cedo demais", comoAparece: "Alguém dá algo valioso sem motivo suficiente para dar.", pagaComo: "dívida futura, o segundo propósito do presente" },
  { id: "chave_sem_porta", categoria: "objeto", nome: "A chave sem porta", comoAparece: "Uma chave ornada entre o espólio; nenhuma fechadura conhecida a recebe.", pagaComo: "um lugar secreto de ato futuro" },
  { id: "margem_anotada", categoria: "objeto", nome: "A margem anotada", comoAparece: "Um mapa ou livro com anotação de outra mão, mais recente que o resto.", pagaComo: "alguém passou por aqui antes, e sabia" },
  { id: "moeda_estrangeira", categoria: "objeto", nome: "A moeda estrangeira", comoAparece: "Cunhagem que não circula na região, no bolso errado.", pagaComo: "financiamento externo, uma rota oculta" },
  { id: "nome_na_lamina", categoria: "objeto", nome: "O nome na lâmina", comoAparece: "Uma arma com nome gravado — de quem ela foi tirada?", pagaComo: "o dono verdadeiro aparece" },
  { id: "retrato_medalhao", categoria: "objeto", nome: "O retrato no medalhão", comoAparece: "Um rosto pequeno que ninguém sabe identificar na hora.", pagaComo: "parentesco, um laço com NPC vivo" },
  { id: "conserto_invisivel", categoria: "objeto", nome: "O conserto invisível", comoAparece: "Item caro consertado com perfeição — quem pagou esse artesão?", pagaComo: "um patrono rico agindo em silêncio" },
  { id: "pagina_arrancada", categoria: "objeto", nome: "A página arrancada", comoAparece: "Um livro da estante com exatamente uma página faltando.", pagaComo: "censura, o fato que alguém apagou" },
  { id: "selo_refeito", categoria: "objeto", nome: "O selo aberto com cuidado", comoAparece: "Carta que chegou lacrada — mas o lacre foi descolado e refeito.", pagaComo: "o correio é lido por terceiros" },

  /* ---- NA FALA (8): o que a boca deixa escapar ---- */
  { id: "nome_que_nao_devia", categoria: "fala", nome: "O nome que não devia saber", comoAparece: "Um NPC usa o nome de alguém que nunca lhe foi apresentado.", pagaComo: "vigilância, um informante" },
  { id: "pergunta_especifica", categoria: "fala", nome: "A pergunta específica demais", comoAparece: "\"E o cofre, ficava mesmo no segundo andar?\" — detalhe que ninguém pediria à toa.", pagaComo: "interesse de quem planeja algo" },
  { id: "negacao_nao_pedida", categoria: "fala", nome: "A negação não pedida", comoAparece: "\"Eu nem conhecia o morto\" — dito antes de qualquer pergunta.", pagaComo: "culpa, envolvimento" },
  { id: "elogio_que_vigia", categoria: "fala", nome: "O elogio que vigia", comoAparece: "\"Soube que se saiu bem na estrada norte\" — quem contou?", pagaComo: "a rede de olhos do vilão ou de um patrono" },
  { id: "termo_fora_do_lugar", categoria: "fala", nome: "O termo fora do lugar", comoAparece: "Gíria de outra região, jargão de um ofício que não é o dele.", pagaComo: "um passado escondido do NPC" },
  { id: "promessa_pequena", categoria: "fala", nome: "A promessa pequena", comoAparece: "\"Um dia te conto como perdi o dedo.\"", pagaComo: "a história vem quando doer mais" },
  { id: "aviso_do_bebado", categoria: "fala", nome: "O aviso do bêbado", comoAparece: "Uma verdade dita por quem ninguém leva a sério.", pagaComo: "o único que avisou desde o começo" },
  { id: "crianca_que_repete", categoria: "fala", nome: "A criança que repete", comoAparece: "Fala de adulto na boca de uma criança — ela ouviu em casa.", pagaComo: "o que a cidade comenta portas adentro" },

  /* ---- NO CENÁRIO (7): o lugar guarda o que a gente cala ---- */
  { id: "janela_as_pressas", categoria: "cenario", nome: "A janela consertada às pressas", comoAparece: "Madeira nova numa casa que \"nunca foi assaltada\".", pagaComo: "o incidente que abafaram" },
  { id: "cova_sem_nome", categoria: "cenario", nome: "A cova recente sem nome", comoAparece: "Terra revolvida no canto do cemitério, sem lápide.", pagaComo: "uma morte que não podia ser registrada" },
  { id: "fumaca_na_ruina", categoria: "cenario", nome: "A fumaça onde ninguém mora", comoAparece: "Chaminé viva na ruína \"abandonada\".", pagaComo: "esconderijo, célula, foragido" },
  { id: "preco_estranho", categoria: "cenario", nome: "O preço estranho", comoAparece: "Alguém compra TODO o salitre (ou sal, ou lona) da região há meses.", pagaComo: "preparação de guerra ou de ritual" },
  { id: "animais_que_desviam", categoria: "cenario", nome: "Os animais que desviam", comoAparece: "Cães não passam daquela esquina; cavalos empacam na ponte.", pagaComo: "uma presença que os sentidos humanos não pegam" },
  { id: "sino_fora_de_hora", categoria: "cenario", nome: "O sino fora de hora", comoAparece: "A torre toca sem festa nem funeral.", pagaComo: "um código entre conspiradores" },
  { id: "estrada_pra_nada", categoria: "cenario", nome: "A estrada para lugar nenhum", comoAparece: "Trilha batida e recente terminando \"no nada\".", pagaComo: "entrada escondida, tráfego que ninguém admite" },

  /* ---- NA AUSÊNCIA (5): o buraco antes da parede ---- */
  { id: "faltou_ao_funeral", categoria: "ausencia", nome: "Quem faltou ao funeral", comoAparece: "A pessoa mais próxima do morto não veio.", pagaComo: "medo, culpa ou exílio forçado" },
  { id: "loja_fechada", categoria: "ausencia", nome: "A loja fechada em dia de feira", comoAparece: "O único que fecharia só se algo grave tivesse acontecido.", pagaComo: "coação, fuga, luto secreto" },
  { id: "posto_sem_guarda", categoria: "ausencia", nome: "O posto sem guarda", comoAparece: "A muralha tem um trecho que nunca é vigiado.", pagaComo: "suborno de dentro, a brecha do ataque futuro" },
  { id: "nome_riscado", categoria: "ausencia", nome: "O nome riscado", comoAparece: "Registro da guilda com uma linha raspada.", pagaComo: "membro expulso que voltou com outro rosto" },
  { id: "santo_sem_festa", categoria: "ausencia", nome: "O santo sem festa", comoAparece: "Este ano, pela primeira vez, não houve procissão.", pagaComo: "a fé local está sendo sufocada — por quem?" },

  /* ---- NO COMPORTAMENTO (5): o gesto que trai a índole ---- */
  { id: "generosidade_estranha", categoria: "comportamento", nome: "A generosidade fora da índole", comoAparece: "O sovina paga uma rodada. A índole dele diz que nunca faria isso.", pagaComo: "compra de silêncio, uma despedida disfarçada" },
  { id: "medo_de_um_lugar", categoria: "comportamento", nome: "O medo de um lugar só", comoAparece: "O veterano de guerra que não entra na capela.", pagaComo: "o que ele viu ou fez lá" },
  { id: "mao_que_treme", categoria: "comportamento", nome: "A mão que treme diante do símbolo", comoAparece: "Calmo o tempo todo — até ver aquele anel, aquele brasão.", pagaComo: "reconhecimento, um trauma com dono" },
  { id: "assunto_desviado", categoria: "comportamento", nome: "O assunto sempre desviado", comoAparece: "Três conversas, e ele muda de tema sempre no mesmo ponto.", pagaComo: "o contorno exato do segredo" },
  { id: "moeda_recusada", categoria: "comportamento", nome: "A moeda recusada", comoAparece: "Mercador que não aceita dinheiro de certa cidade.", pagaComo: "uma história de sangue entre praças" },

  /* ---- NO DOCUMENTO (4): o papel mente com precisão ---- */
  { id: "data_impossivel", categoria: "documento", nome: "A data impossível", comoAparece: "Carta datada de depois da morte do remetente.", pagaComo: "alguém escreve em nome do morto" },
  { id: "testemunha_morta", categoria: "documento", nome: "A testemunha morta antes", comoAparece: "Contrato assinado por quem já não vivia na data.", pagaComo: "fraude com cobertura oficial" },
  { id: "predio_a_mais", categoria: "documento", nome: "O prédio a mais", comoAparece: "Mapa antigo da cidade mostra um edifício que \"nunca existiu\".", pagaComo: "o lugar apagado dos registros" },
  { id: "duas_cronicas", categoria: "documento", nome: "As duas versões da crônica", comoAparece: "Dois livros da biblioteca contam o mesmo ano de formas incompatíveis.", pagaComo: "a história oficial mente — qual metade?" },
];

export const CATEGORIAS = ["objeto", "fala", "cenario", "ausencia", "comportamento", "documento"];
export function formaPorId(id) { return FORMAS_DE_SEMENTE.find((f) => f.id === id) || null; }
export function formasPorCategoria(cat) { return FORMAS_DE_SEMENTE.filter((f) => f.categoria === cat); }

/* ============================================================
   O RAZÃO
   ============================================================ */

/* Lido do objeto e não desestruturado na assinatura: `= {}` cobre
   `undefined` e não cobre `null` — a armadilha que já mordeu esta casa
   três vezes, e o save é exatamente o tipo de coisa que vem nula. */
export function garantirLivro(l) {
  const o = l && typeof l === "object" ? l : {};
  const n = (x, d) => (Number.isFinite(Number(x)) ? Number(x) : d);
  const sementes = (Array.isArray(o.sementes) ? o.sementes : []).map(garantirSemente).filter(Boolean);
  /* proxId nunca recua: um id reciclado é uma semente que some quando a
     outra é paga. Anda com o maior id já visto. */
  const maiorId = sementes.reduce((m, s) => Math.max(m, Number(s.id) || 0), 0);
  return { sementes, proxId: Math.max(n(o.proxId, 1), maiorId + 1) };
}

function garantirSemente(s) {
  if (!s || typeof s !== "object") return null;
  const forma = formaPorId(s.forma);
  if (!forma) return null;   /* semente de forma que não existe mais é ruído — cai fora */
  const n = (x, d) => (Number.isFinite(Number(x)) ? Number(x) : d);
  const estado = estadoValido(s.estado) ? s.estado : "semeada";
  const peso = pesoValido(s.peso) ? s.peso : "medio";
  return {
    id: n(s.id, 0),
    forma: s.forma,
    dona: typeof s.dona === "string" && s.dona ? s.dona : "sistema",
    ato: Math.max(0, n(s.ato, 0)),
    peso,
    estado,
    diaSemeada: Math.max(0, n(s.diaSemeada, 0)),
    regas: (Array.isArray(s.regas) ? s.regas : []).map((r) => ({
      dia: Math.max(0, n(r && r.dia, 0)),
      cena: typeof (r && r.cena) === "string" ? r.cena : "",
    })).slice(-8),
    /* o alvo é opcional: nem toda semente aponta para alguém nomeado */
    alvo: typeof s.alvo === "string" ? s.alvo : "",
    /* material concreto escolhido no plantio; cai para o texto da forma */
    material: typeof s.material === "string" && s.material ? s.material : forma.comoAparece,
    /* o ato-limite: se passar dele sem pagar, murcha. 0 = sem janela. */
    janela: Math.max(0, n(s.janela, 0)),
    pagaEm: Math.max(0, n(s.pagaEm, 0)),
    /* a leitura que o pagamento revelou — escrita SÓ ao pagar, e é o que o
       diário usa para ligar os pontos. Antes disso, vazia. */
    colheita: typeof s.colheita === "string" ? s.colheita : "",
  };
}

/* ---------------- PLANTAR ----------------
   Devolve o livro novo e a semente criada. Não muta o livro que entra —
   o estado desta casa é sempre substituído, nunca remendado no lugar,
   porque o React só repinta o que trocou de identidade. */
export function semear(livro, { forma, dona = "sistema", ato = 0, peso = "medio", material = "", alvo = "", janela = 0, dia = 0 } = {}) {
  const L = garantirLivro(livro);
  const f = formaPorId(forma);
  if (!f) return { livro: L, semente: null };
  const semente = garantirSemente({
    id: L.proxId, forma, dona, ato, peso,
    estado: "semeada", diaSemeada: dia,
    material: material || f.comoAparece, alvo, janela,
  });
  return {
    livro: { sementes: [...L.sementes, semente], proxId: L.proxId + 1 },
    semente,
  };
}

/* ---------------- REGAR ----------------
   Uma insinuação nova da MESMA verdade. Amadurece sozinha quando o número
   de regas alcança o que o peso pede. Regar semente já paga ou murcha não
   faz nada — o passado não se rega. */
export function regar(livro, id, { dia = 0, cena = "" } = {}) {
  const L = garantirLivro(livro);
  let mudou = false;
  const sementes = L.sementes.map((s) => {
    if (s.id !== id || s.estado === "paga" || s.estado === "murcha") return s;
    mudou = true;
    const regas = [...s.regas, { dia, cena }].slice(-8);
    const madura = regas.length >= regasParaMadurar(s.peso);
    return { ...s, regas, estado: madura ? "madura" : "regada" };
  });
  return { livro: mudou ? { ...L, sementes } : L, mudou };
}

export function estaMadura(s) { return !!s && s.estado === "madura"; }
export function sementePorId(livro, id) { return garantirLivro(livro).sementes.find((s) => s.id === id) || null; }
export function sementesPorDona(livro, dona) { return garantirLivro(livro).sementes.filter((s) => s.dona === dona); }
export function sementesDoAto(livro, ato) { return garantirLivro(livro).sementes.filter((s) => s.ato === ato); }
export function sementesMaduras(livro, filtro = {}) {
  return garantirLivro(livro).sementes.filter((s) =>
    s.estado === "madura"
    && (filtro.dona == null || s.dona === filtro.dona)
    && (filtro.alvo == null || s.alvo === filtro.alvo)
    && (filtro.ato == null || s.ato === filtro.ato));
}

/* ---------------- A CATRACA ①: COLHER EXIGE MATURIDADE ----------------
   Uma revelação ou reviravolta de peso P só pode disparar se há pelo
   menos `madurasParaColher(P)` sementes maduras que se aplicam a ela.
   É o que impede a reviravolta que sai do nada. */
export function podeColher(livro, { peso = "medio", dona = null, alvo = null } = {}) {
  const preciso = madurasParaColher(peso);
  const tenho = sementesMaduras(livro, { dona, alvo }).length;
  return tenho >= preciso;
}

/* ---------------- PAGAR ----------------
   A colheita. Só de semente madura — a catraca ① mora aqui também: uma
   semente que ninguém regou o bastante não paga. Escreve a leitura que o
   diário vai usar para ligar os pontos. */
export function pagar(livro, id, { dia = 0, colheita = "" } = {}) {
  const L = garantirLivro(livro);
  let pagou = false;
  const sementes = L.sementes.map((s) => {
    if (s.id !== id || s.estado !== "madura") return s;
    pagou = true;
    return { ...s, estado: "paga", pagaEm: dia, colheita: colheita || formaPorId(s.forma).pagaComo };
  });
  return { livro: pagou ? { ...L, sementes } : L, pagou };
}

/* ---------------- A CATRACA ②: FECHAR O ATO NÃO ESQUECE NADA ----------------
   Ao virar o ato da saga, toda semente daquele ato tem de estar resolvida.
   O que já foi pago fica; o resto MURCHA — e murcha é declarada, não
   apagada. Devolve a lista do que murchou, para o diário anunciar os fios
   soltos. Uma semente sem ato (ato 0, sistema) nunca é varrida por aqui:
   ela pertence à campanha inteira, não a um ato. */
export function fecharAto(livro, ato, { dia = 0 } = {}) {
  const L = garantirLivro(livro);
  const murchou = [];
  const sementes = L.sementes.map((s) => {
    if (s.ato !== ato || ato <= 0) return s;
    if (s.estado === "paga" || s.estado === "murcha") return s;
    murchou.push(s);
    return { ...s, estado: "murcha", pagaEm: dia };
  });
  return { livro: murchou.length ? { ...L, sementes } : L, murchou };
}

/* ---------------- OS FIOS SOLTOS ----------------
   As sementes murchas, do jeito que o diário as mostra. Mundo honesto
   diz "isto ficou sem resposta" em vez de fingir que nunca plantou. */
export function fiosSoltos(livro) {
  return garantirLivro(livro).sementes
    .filter((s) => s.estado === "murcha")
    .map((s) => ({ id: s.id, texto: s.material, era: formaPorId(s.forma).pagaComo }));
}

/* ---------------- O QUE VAI À PAUTA ----------------
   O material para o Narrador insinuar, sem a conclusão. Uma semente
   recém-plantada pede para ser mostrada; uma regada, para reaparecer de
   outro ângulo. A verdade (pagaComo) NUNCA entra aqui — o Narrador planta
   sem saber do que planta. É a única blindagem real contra o vazamento.

   Devolve no máximo `teto` linhas, as mais novas primeiro, porque uma
   pauta cheia de insinuações some com a cena do turno. */
export function envelopeDoLivro(livro, { teto = 2 } = {}) {
  const abertas = garantirLivro(livro).sementes
    .filter((s) => s.estado === "semeada" || s.estado === "regada")
    .slice(-teto)
    .reverse();
  if (!abertas.length) return "";
  const linhas = abertas.map((s) => {
    const nova = s.estado === "semeada";
    return nova
      ? `· Semeie, sem sublinhar: ${s.material}`
      : `· Deixe reaparecer, por outro ângulo: ${s.material}`;
  });
  return "SEMENTES A PLANTAR (o jogador não deve notar que são sementes; NUNCA explique o que significam — nem você sabe):\n" + linhas.join("\n");
}

/* ---------------- PARA O CONSOLE DE AUTOR ----------------
   O autor vê a saúde do razão — quantas de cada estado — sem ver a
   verdade escondida de cada semente. A mesma régua do arco e do compasso:
   forma, não conteúdo. */
export function resumoDoLivro(livro) {
  const L = garantirLivro(livro);
  const por = (e) => L.sementes.filter((s) => s.estado === e).length;
  return {
    total: L.sementes.length,
    semeadas: por("semeada"), regadas: por("regada"), maduras: por("madura"),
    pagas: por("paga"), murchas: por("murcha"),
  };
}
