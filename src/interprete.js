/* ============================================================
   O INTÉRPRETE (v9.106) — o que a gente FAZ

   A maior ausência que a revisão dos 68 módulos encontrou, e a que mais
   muda o jogo.

   NADA no sistema decidia o que uma pessoa faz. Confirmado por
   varredura: `npcs.js` é registro (quem ela é), `social.js` é a conta da
   persuasão (consigo convencê-la), `mundo-base.js` dá `vontade` e `modo`
   (sabor para o prompt). O único `comportamento` do código inteiro é de
   BICHO, e é uma palavra solta numa lista.

   Quem decidia o que Marta faz quando o herói mente na frente dela era a
   IA, livre. E é exatamente daí que vem a incoerência que este projeto
   combateu em todas as outras frentes: a ferreira desconfiada que de
   repente conta tudo, o guarda subornável que de repente é íntegro, o
   amigo que não reage ao que acabou de ver.

   ---------------- A REGRA QUE PROTEGE O NARRADOR ----------------

   O Intérprete diz O QUE a pessoa FAZ. Nunca o que ela DIZ.

     "Marta muda de assunto e olha para a porta"  ← dele
     "Marta diz: '…'"                             ← nunca

   A fala é do Narrador, sempre, e é onde ele é insubstituível. Se um
   movimento deste acervo pudesse ser copiado para a narração como está,
   ele estaria errado.

   ---------------- AS LINHAS QUE NÃO SE CRUZAM ----------------

   A peça que só este conselheiro tem, e a que faz a coerência: cada
   pessoa carrega uma ou duas coisas que ela NUNCA faz. É um veto POR
   PESSOA, não por cena — e é o que impede o covarde de virar heroico
   porque a cena pediu um herói.

   ---------------- O TETO ----------------

   Uma linha por pessoa, no máximo três pessoas. Sem isso, uma taverna
   com seis conhecidos vira seis linhas de Pauta e a cena vira assembleia.
   ============================================================ */

/* ---------------- OS GESTOS ----------------
   O movimento por baixo do movimento. Servem para o mesmo que os gestos
   do Bibliotecário: impedir que dois movimentos diferentes produzam a
   mesma cena, e dar ao veto uma unidade maior que a entrada. */
export const GESTOS = [
  { id: "esquiva", o: "sai de perto do assunto sem sair do lugar" },
  { id: "aproxima", o: "encurta a distância — física, ou de confiança" },
  { id: "testa", o: "põe o outro à prova sem dizer que está provando" },
  { id: "cobra", o: "chama para a conta: o que foi prometido, o que foi feito" },
  { id: "protege", o: "põe o corpo, o nome ou o silêncio entre alguém e o perigo" },
  { id: "entrega", o: "dá o que tinha guardado — coisa, verdade ou pessoa" },
  { id: "recua", o: "diminui, cede espaço, some da conversa" },
  { id: "ameaca", o: "mostra o que pode fazer, sem ainda fazer" },
  { id: "oferece", o: "propõe uma troca" },
  { id: "cala", o: "não faz nada, e o não fazer é o que se vê" },
];
export function gestoPorId(id) { return GESTOS.find((g) => g.id === id) || null; }

/* ---------------- O QUE ACABOU DE ACONTECER ----------------
   A categoria do ato do herói, que é o que a maioria dos movimentos lê.
   Fechada de propósito: um acervo que reagisse a texto livre reagiria a
   homógrafo, e esta casa já catalogou quatro. */
export const ATOS = [
  { id: "menti", o: "menti, blefei ou omiti" },
  { id: "ameacei", o: "ameacei, intimidei, saquei aço" },
  { id: "ajudei", o: "ajudei, curei, defendi" },
  { id: "feri", o: "feri, matei, quebrei" },
  { id: "paguei", o: "paguei, dei, subornei" },
  { id: "pedi", o: "pedi, perguntei, implorei" },
  { id: "revelei", o: "contei uma coisa minha" },
  { id: "ignorei", o: "ignorei, virei as costas, saí" },
  { id: "elogiei", o: "elogiei, agradeci, brindei" },
  { id: "acusei", o: "acusei, cobrei, desconfiei em voz alta" },
  { id: "cheguei", o: "cheguei agora, entrei, apareci" },
  { id: "nada", o: "nada que a mexa" },
];
export function atoPorId(id) { return ATOS.find((a) => a.id === id) || null; }

/* Ler o ato do que o jogador escreveu. Deliberadamente grosseiro: errar a
   categoria dá uma reação levemente fora de tom, e não uma regra
   quebrada. É a diferença entre este detector e os do portão, que mordem
   a ficha e por isso precisam de cuidado. */
const RX_ATO = [
  ["menti", /\b(minto|menti|mentir|blefo|blefei|invento uma|finjo|fingi|disfar[çc]o|omito|escondo que)\b/i],
  ["ameacei", /\b(amea[çc]o|amea[çc]ei|intimido|intimidei|saco a|puxo a lâmina|encosto a lâmina|mando calar|aviso que|se n[ãa]o)\b/i],
  ["feri", /\b(ataco|golpeio|corto|mato|matei|esfaqueio|soco|derrubo|quebro|arrebento|atiro n)\b/i],
  ["ajudei", /\b(ajudo|ajudei|curo|curei|defendo|salvo|socorro|levanto|carrego|protejo)\b/i],
  ["paguei", /\b(pago|paguei|dou|entrego|ofere[çc]o dinheiro|suborno|compro|deixo a moeda)\b/i],
  ["acusei", /\b(acuso|acusei|cobro|desconfio|duvido|exijo|questiono|aponto o dedo)\b/i],
  ["revelei", /\b(conto|contei|revelo|confesso|admito|digo a verdade|mostro (o|a|meu|minha))\b/i],
  ["elogiei", /\b(elogio|agrade[çc]o|brindo|felicito|louvo|reconhe[çc]o o)\b/i],
  ["pedi", /\b(pe[çc]o|pedi|pergunto|perguntei|imploro|solicito|quero saber|indago)\b/i],
  ["ignorei", /\b(ignoro|viro as costas|saio|vou embora|deixo (ele|ela|eles)|n[ãa]o respondo)\b/i],
  ["cheguei", /\b(entro|chego|apare[çc]o|me aproximo|volto (para|ao|à))\b/i],
];
export function atoDoTexto(texto) {
  const t = String(texto || "");
  for (const [id, rx] of RX_ATO) if (rx.test(t)) return id;
  return "nada";
}

/* ---------------- A SITUAÇÃO DE UMA PESSOA ----------------
   A catraca de sempre: todo campo que um `quando` lê é normalizado aqui
   e entregue por quem chama. */
export function garantirPessoa(p) {
  const o = p && typeof p === "object" ? p : {};
  const b = (v) => !!v;
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const txt = (v, m = 40) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, m);
  return {
    nome: txt(o.nome, 30),
    papel: txt(o.papel, 40).toLowerCase(),
    temperamento: txt(o.temperamento, 24).toLowerCase(),
    quer: txt(o.quer, 60),
    teme: txt(o.teme, 60),
    /* comigo */
    relacao: txt(o.relacao, 20).toLowerCase() || "desconhecido",
    laco: txt(o.laco, 20).toLowerCase(),
    forcaDoLaco: Math.max(0, Math.min(3, num(o.forcaDoLaco))),
    rompido: b(o.rompido),
    meDeve: b(o.meDeve),
    euDevo: b(o.euDevo),
    sabeDeMim: b(o.sabeDeMim),
    euSeiDela: b(o.euSeiDela),
    primeiraVez: b(o.primeiraVez),
    /* agora */
    ato: atoPorId(o.ato) ? String(o.ato) : "nada",
    quantosEscutam: num(o.quantosEscutam),
    aSos: b(o.aSos),
    emPerigo: b(o.emPerigo),
    emCombate: b(o.emCombate),
    noLugarDela: b(o.noLugarDela),
    tocaramNoSegredo: b(o.tocaramNoSegredo),
    euGanhei: b(o.euGanhei),
    euPerdi: b(o.euPerdi),
    ehCompanheiro: b(o.ehCompanheiro),
    fama: num(o.fama),
    noite: b(o.noite),
  };
}

/* ---------------- AS LINHAS QUE NÃO SE CRUZAM ----------------
   Um veto POR PESSOA. `nunca` lista GESTOS, e não movimentos: quem é
   covarde não é covarde só numa das quinze maneiras de ameaçar. */
export const LINHAS = [
  { id: "covarde", quando: (p) => /covarde|medroso|t[íi]mido/.test(p.temperamento), nunca: ["ameaca", "protege"], porque: "quem tem medo não põe o corpo na frente nem mostra os dentes" },
  { id: "leal", quando: (p) => /leal|protetor|honrad/.test(p.temperamento), nunca: ["entrega"], porque: "não entrega quem confiou nele — é o que faz dele leal" },
  { id: "orgulhoso", quando: (p) => /orgulhos|arrogante|nobre|soberb/.test(p.temperamento + " " + p.papel), nunca: ["recua"], porque: "não diminui na frente dos outros" },
  { id: "reservado", quando: (p) => /reservad|calad|silencios|desconfiad/.test(p.temperamento), nunca: ["entrega", "aproxima"], porque: "não abre, e demora a chegar perto" },
  { id: "ganancioso", quando: (p) => /gananci|oportunist|mesquinh/.test(p.temperamento), nunca: ["entrega"], porque: "não dá o que pode vender" },
  { id: "sacerdote", quando: (p) => /sacerdot|cl[ée]rig|padre|freira|mong/.test(p.papel), nunca: ["ameaca"], porque: "o hábito dele não faz isso em público" },
  { id: "guarda", quando: (p) => /guarda|capit[ãa]|sargent|soldad|guardi/.test(p.papel), nunca: ["esquiva"], porque: "a função dele é não sair de perto do assunto" },
  { id: "crianca", quando: (p) => /crian[çc]a|menin|garot|aprendiz/.test(p.papel), nunca: ["ameaca", "cobra"], porque: "não tem posição de onde cobrar nem com que ameaçar" },
  { id: "inimigo", quando: (p) => p.relacao === "inimigo", nunca: ["entrega", "protege"], porque: "não te dá nada e não te protege — é o que a palavra quer dizer" },
  { id: "conjuge", quando: (p) => p.relacao === "conjuge" || p.relacao === "romance", nunca: ["ameaca"], porque: "com quem se dorme não se ameaça — e se ameaçar, era outra coisa" },
];
export function linhaPorId(id) { return LINHAS.find((l) => l.id === id) || null; }

/* Os gestos que ESTA pessoa nunca faz. */
export function gestosProibidos(pessoa) {
  const p = garantirPessoa(pessoa);
  const fora = new Set();
  for (const l of LINHAS) {
    let vale = false;
    try { vale = !!l.quando(p); } catch { vale = false; }
    if (vale) for (const g of l.nunca) fora.add(g);
  }
  return [...fora];
}

/* ---------------- O ACERVO ----------------
   Cada movimento é UMA coisa que uma pessoa faz numa cena. `faz` é
   escrito de fora: descreve o ATO visível, nunca a fala e nunca o que se
   passa por dentro — o dentro é do Narrador. */
export const MOVIMENTOS = [
  /* ============ ESQUIVA — sair do assunto sem sair do lugar ============ */
  { id: "muda_de_assunto", gesto: "esquiva", peso: 3, quando: (p) => p.tocaramNoSegredo, faz: "muda de assunto — não bruscamente, mas de um jeito que não deixa voltar" },
  { id: "olha_a_porta", gesto: "esquiva", peso: 2, quando: (p) => p.teme && p.quantosEscutam >= 2, faz: "olha para a porta antes de responder, e responde menos do que sabe" },
  { id: "arruma_as_maos", gesto: "esquiva", peso: 2, quando: (p) => p.ato === "acusei", faz: "arruma alguma coisa com as mãos para não ter de olhar de volta" },
  { id: "responde_com_pergunta", gesto: "esquiva", peso: 3, quando: (p) => p.ato === "pedi" && p.relacao !== "amigo", faz: "responde com outra pergunta, e a pergunta dela é sobre mim" },
  { id: "atrasa", gesto: "esquiva", peso: 2, quando: (p) => p.euDevo, faz: "encontra um serviço urgente para fazer bem agora" },
  { id: "ri_errado", gesto: "esquiva", peso: 2, quando: (p) => p.ato === "revelei", faz: "ri no lugar errado da frase e não explica por quê" },
  { id: "finge_nao_ouvir", gesto: "esquiva", peso: 2, quando: (p) => p.quantosEscutam >= 3 && p.ato !== "nada", faz: "finge que não ouviu, e a plateia percebe que ela ouviu" },
  { id: "chama_outro", gesto: "esquiva", peso: 2, quando: (p) => p.quantosEscutam >= 2 && !p.aSos, faz: "chama uma terceira pessoa para dentro da conversa" },
  { id: "some_um_pouco", gesto: "esquiva", peso: 2, quando: (p) => p.rompido, faz: "sai de perto por um tempo e volta como se nada tivesse acontecido" },
  { id: "corta_curto", gesto: "esquiva", peso: 2, quando: (p) => /reservad|calad/.test(p.temperamento), faz: "responde em três palavras e volta ao que fazia" },
  { id: "aponta_outro", gesto: "esquiva", peso: 2, quando: (p) => p.ato === "acusei" && p.quantosEscutam >= 1, faz: "aponta outra pessoa como quem sabe mais do assunto" },
  { id: "muda_de_lugar", gesto: "esquiva", peso: 2, quando: (p) => p.tocaramNoSegredo && p.quantosEscutam >= 2, faz: "se move para outro canto e continua de lá, mais baixo" },

  /* ============ APROXIMA — encurtar distância ============ */
  { id: "senta_junto", gesto: "aproxima", peso: 3, quando: (p) => p.laco === "amizade" && !p.rompido, faz: "senta do lado sem pedir licença" },
  { id: "usa_o_nome", gesto: "aproxima", peso: 3, quando: (p) => p.forcaDoLaco >= 2, faz: "passa a me chamar pelo nome curto, ou pelo apelido que só ela usa" },
  { id: "toca_o_braco", gesto: "aproxima", peso: 2, quando: (p) => p.relacao === "romance" || p.relacao === "conjuge", faz: "encosta a mão no meu braço no meio da frase, e deixa lá um instante" },
  { id: "oferece_bebida", gesto: "aproxima", peso: 2, quando: (p) => /taverneir|estalajad|serviç/.test(p.papel), faz: "põe alguma coisa na minha frente sem eu ter pedido" },
  { id: "conta_dela", gesto: "aproxima", peso: 3, quando: (p) => p.ato === "revelei" && p.relacao !== "inimigo", faz: "conta uma coisa dela do mesmo tamanho, para empatar" },
  { id: "puxa_pro_canto", gesto: "aproxima", peso: 3, quando: (p) => p.euSeiDela && p.quantosEscutam >= 2, faz: "me puxa para um canto antes de dizer o resto" },
  { id: "lembra_de_antes", gesto: "aproxima", peso: 2, quando: (p) => !p.primeiraVez && p.forcaDoLaco >= 1, faz: "menciona uma coisa que fizemos juntos, sem contexto, como quem sabe que eu lembro" },
  { id: "espera_por_mim", gesto: "aproxima", peso: 2, quando: (p) => p.ehCompanheiro, faz: "espera eu decidir antes de fazer o que já ia fazer" },
  { id: "arruma_meu_lugar", gesto: "aproxima", peso: 2, quando: (p) => p.relacao === "familia" || p.relacao === "conjuge", faz: "arruma alguma coisa minha que estava torta, sem comentar" },
  { id: "vem_de_longe", gesto: "aproxima", peso: 2, quando: (p) => p.ato === "cheguei" && p.forcaDoLaco >= 2, faz: "atravessa o lugar inteiro para chegar antes que eu procure" },

  /* ============ TESTA — pôr à prova sem dizer ============ */
  { id: "repete_a_pergunta", gesto: "testa", peso: 3, quando: (p) => p.ato === "menti", faz: "faz a mesma pergunta de outro jeito, mais tarde" },
  { id: "cita_um_nome", gesto: "testa", peso: 3, quando: (p) => p.ato === "menti" || p.ato === "acusei", faz: "solta um nome no meio da conversa e observa a minha cara" },
  { id: "erra_de_proposito", gesto: "testa", peso: 2, quando: (p) => /desconfiad|sagaz|astut/.test(p.temperamento), faz: "erra um detalhe de propósito para ver se eu corrijo" },
  { id: "pede_favor_pequeno", gesto: "testa", peso: 2, quando: (p) => p.primeiraVez || p.relacao === "desconhecido", faz: "pede um favor pequeno que não precisava pedir" },
  { id: "oferece_demais", gesto: "testa", peso: 2, quando: (p) => /mercador|corretor|negociant/.test(p.papel), faz: "oferece mais do que o justo e espera a minha reação" },
  { id: "conta_meio_segredo", gesto: "testa", peso: 3, quando: (p) => p.forcaDoLaco === 1, faz: "conta metade de uma coisa e para, para ver o que eu faço com a metade" },
  { id: "me_deixa_sozinho", gesto: "testa", peso: 2, quando: (p) => p.euSeiDela, faz: "arruma um motivo para me deixar sozinho perto do que ela guarda" },
  { id: "olha_o_grupo", gesto: "testa", peso: 2, quando: (p) => p.ehCompanheiro === false && p.quantosEscutam >= 2, faz: "fala comigo mas olha para quem está comigo, medindo os dois" },
  { id: "pergunta_do_dinheiro", gesto: "testa", peso: 2, quando: (p) => p.fama >= 25, faz: "pergunta de onde veio o dinheiro, com a naturalidade de quem já sabe" },

  /* ============ COBRA — chamar para a conta ============ */
  { id: "lembra_a_divida", gesto: "cobra", peso: 4, quando: (p) => p.euDevo, faz: "lembra do que eu devo, sem levantar a voz, na frente de quem estiver" },
  { id: "conta_os_dias", gesto: "cobra", peso: 3, quando: (p) => p.euDevo && !p.aSos, faz: "diz há quantos dias está esperando, e o número é exato" },
  { id: "cobra_a_promessa", gesto: "cobra", peso: 3, quando: (p) => p.laco === "divida" || p.laco === "aprendizado", faz: "chama a conversa de volta para o que ficou combinado" },
  { id: "quer_ver", gesto: "cobra", peso: 3, quando: (p) => p.ato === "paguei", faz: "quer ver antes de aceitar, e conta na frente de mim" },
  { id: "pede_desculpa_do_outro", gesto: "cobra", peso: 2, quando: (p) => p.rompido, faz: "espera o pedido de desculpas sem pedir por ele" },
  { id: "cita_o_que_prometi", gesto: "cobra", peso: 3, quando: (p) => p.ato === "pedi" && p.meDeve === false && p.euDevo, faz: "cita, palavra por palavra, o que eu prometi da última vez" },
  { id: "chama_de_lado", gesto: "cobra", peso: 2, quando: (p) => p.ehCompanheiro && p.ato === "feri", faz: "me chama de lado depois, quando já não há plateia" },
  { id: "quer_explicacao", gesto: "cobra", peso: 3, quando: (p) => p.ato === "menti" && p.forcaDoLaco >= 2, faz: "não aceita a versão que eu dei, e cobra a outra sem levantar a voz" },
  { id: "aumenta_o_preco", gesto: "cobra", peso: 2, quando: (p) => /mercador|corretor|avaliador|vendedor/.test(p.papel) && p.ato === "ameacei", faz: "aumenta o preço, e não explica por quê" },

  /* ============ PROTEGE — pôr-se entre ============ */
  { id: "fica_na_frente", gesto: "protege", peso: 4, quando: (p) => p.emPerigo && p.forcaDoLaco >= 2, faz: "se põe entre mim e o que veio" },
  { id: "puxa_pra_tras", gesto: "protege", peso: 3, quando: (p) => p.emCombate && p.ehCompanheiro, faz: "me puxa um passo para trás sem largar o que está fazendo" },
  { id: "esconde_alguem", gesto: "protege", peso: 3, quando: (p) => p.emPerigo && /pai|m[ãa]e|irm[ãa]|filh/.test(p.papel + " " + p.quer), faz: "põe alguém atrás de si antes de olhar quem chegou" },
  { id: "cala_pelo_outro", gesto: "protege", peso: 3, quando: (p) => p.sabeDeMim && p.quantosEscutam >= 2, faz: "cala uma coisa que sabe de mim, na hora em que dizê-la resolveria o problema dela" },
  { id: "mente_por_mim", gesto: "protege", peso: 4, quando: (p) => p.forcaDoLaco >= 3 && p.ato === "menti", faz: "confirma a minha versão sem eu ter pedido — e sabe que é mentira" },
  { id: "avisa_baixo", gesto: "protege", peso: 3, quando: (p) => p.teme && p.forcaDoLaco >= 1, faz: "me avisa de alguma coisa em voz baixa, e só uma vez" },
  { id: "assume_a_culpa", gesto: "protege", peso: 3, quando: (p) => p.forcaDoLaco >= 3 && p.ato === "feri", faz: "assume na frente dos outros uma parte do que fui eu que fiz" },
  { id: "cuida_do_ferido", gesto: "protege", peso: 3, quando: (p) => /curandeir|m[ée]dic|cl[ée]rig|enfermeir/.test(p.papel) && p.emPerigo, faz: "vai direto para quem está pior, mesmo que não seja do lado dela" },

  /* ============ ENTREGA — dar o que tinha guardado ============ */
  { id: "conta_tudo", gesto: "entrega", peso: 4, quando: (p) => p.forcaDoLaco >= 3 && p.aSos, faz: "conta a coisa inteira, e conta de uma vez" },
  { id: "da_o_objeto", gesto: "entrega", peso: 3, quando: (p) => p.meDeve && p.ato === "ajudei", faz: "me dá alguma coisa que estava guardando para outra ocasião" },
  { id: "entrega_terceiro", gesto: "entrega", peso: 3, quando: (p) => p.emPerigo && /informante|ladr|contraband/.test(p.papel), faz: "entrega um nome que não era para ser dito" },
  { id: "mostra_onde", gesto: "entrega", peso: 3, quando: (p) => p.ato === "paguei", faz: "me mostra onde fica, em vez de explicar como se chega" },
  { id: "abre_a_porta", gesto: "entrega", peso: 3, quando: (p) => p.noLugarDela && p.forcaDoLaco >= 2, faz: "abre uma porta que estava fechada para mim até hoje" },
  { id: "confessa_o_medo", gesto: "entrega", peso: 3, quando: (p) => p.teme && p.aSos && p.forcaDoLaco >= 2, faz: "diz do que tem medo, e é a primeira vez que diz para alguém" },
  { id: "devolve", gesto: "entrega", peso: 2, quando: (p) => p.rompido && p.ato === "elogiei", faz: "devolve uma coisa minha que estava com ela desde antes" },

  /* ============ RECUA — diminuir ============ */
  { id: "abaixa_a_voz", gesto: "recua", peso: 3, quando: (p) => p.ato === "ameacei", faz: "abaixa a voz e concorda com o que eu disser" },
  { id: "sai_de_cena", gesto: "recua", peso: 3, quando: (p) => p.ato === "ameacei" && /covarde|medroso/.test(p.temperamento), faz: "arruma uma desculpa e sai do lugar" },
  { id: "pede_desculpa", gesto: "recua", peso: 2, quando: (p) => p.ato === "acusei" && p.euDevo, faz: "pede desculpas por uma coisa menor que a que foi cobrada" },
  { id: "deixa_passar", gesto: "recua", peso: 2, quando: (p) => p.ato === "ignorei", faz: "deixa passar, e o rosto dela diz que anotou" },
  { id: "cede_o_lugar", gesto: "recua", peso: 2, quando: (p) => p.fama >= 45 && p.relacao !== "inimigo", faz: "cede o lugar dela e fica de pé" },
  { id: "evita_o_olho", gesto: "recua", peso: 2, quando: (p) => p.sabeDeMim && p.ato === "acusei", faz: "para de olhar nos olhos e responde para o balcão" },
  { id: "some_do_assunto", gesto: "recua", peso: 2, quando: (p) => p.emCombate && !p.ehCompanheiro && /covarde|civil|comerciant/.test(p.temperamento + " " + p.papel), faz: "encolhe atrás de alguma coisa e para de existir na cena" },

  /* ============ AMEAÇA — mostrar o que pode fazer ============ */
  { id: "mostra_o_ferro", gesto: "ameaca", peso: 3, quando: (p) => p.ato === "ameacei" && /guarda|capit[ãa]|mercen|soldad/.test(p.papel), faz: "põe a mão na arma sem sacá-la, e deixa a mão lá" },
  { id: "diz_quem_conhece", gesto: "ameaca", peso: 3, quando: (p) => p.ato === "acusei" && p.fama < 45, faz: "menciona quem ela conhece, e o nome é maior que o meu" },
  { id: "conta_ate", gesto: "ameaca", peso: 2, quando: (p) => p.noLugarDela && p.ato === "ameacei", faz: "dá um prazo, e o prazo é curto" },
  { id: "chama_os_dela", gesto: "ameaca", peso: 3, quando: (p) => p.noLugarDela && p.quantosEscutam >= 2, faz: "faz um sinal, e mais gente aparece atrás dela" },
  { id: "lembra_do_segredo", gesto: "ameaca", peso: 4, quando: (p) => p.sabeDeMim && p.relacao === "rival", faz: "lembra, sem dizer o quê, que sabe de uma coisa minha" },
  { id: "fecha_a_porta", gesto: "ameaca", peso: 3, quando: (p) => p.noLugarDela && p.ato === "acusei", faz: "manda alguém fechar a porta antes de continuar" },
  { id: "promete_a_conta", gesto: "ameaca", peso: 3, quando: (p) => p.ato === "feri" && p.relacao !== "aliado", faz: "diz que isto vai voltar, e não diz quando" },

  /* ============ OFERECE — propor troca ============ */
  { id: "propoe_troca", gesto: "oferece", peso: 3, quando: (p) => p.quer && p.ato === "pedi", faz: "aceita, e pede uma coisa em troca que não tem a ver com o assunto" },
  { id: "oferece_trabalho", gesto: "oferece", peso: 3, quando: (p) => p.quer && p.fama >= 10 && !p.primeiraVez, faz: "oferece um trabalho, e o trabalho é do tamanho do que ela quer" },
  { id: "vende_informacao", gesto: "oferece", peso: 3, quando: (p) => /informante|taverneir|mendig|batedor|rep[óo]rter/.test(p.papel), faz: "deixa claro que sabe de uma coisa, e que a coisa tem preço" },
  { id: "oferece_abrigo", gesto: "oferece", peso: 3, quando: (p) => p.emPerigo && p.forcaDoLaco >= 2, faz: "oferece um lugar para eu ficar, e não pergunta por quê" },
  { id: "propoe_sociedade", gesto: "oferece", peso: 2, quando: (p) => p.fama >= 45 && /mercador|mestre|l[íi]der|corretor/.test(p.papel), faz: "propõe entrar junto no que eu estiver fazendo" },
  { id: "oferece_perdao", gesto: "oferece", peso: 3, quando: (p) => p.rompido && p.ato === "ajudei", faz: "abre uma brecha para consertar, e finge que a brecha não é dela" },
  { id: "pede_para_ir_junto", gesto: "oferece", peso: 3, quando: (p) => p.quer && p.forcaDoLaco >= 2 && !p.ehCompanheiro, faz: "pergunta se pode ir junto, e já tem as coisas prontas" },

  /* ============ CALA — o não fazer que se vê ============ */
  { id: "silencio_longo", gesto: "cala", peso: 3, quando: (p) => p.ato === "revelei" && /reservad|severo|frio/.test(p.temperamento), faz: "fica em silêncio tempo demais antes de responder" },
  { id: "para_de_trabalhar", gesto: "cala", peso: 3, quando: (p) => p.ato === "acusei" || p.ato === "menti", faz: "para o que estava fazendo com as mãos, e não recomeça" },
  { id: "olha_e_nao_diz", gesto: "cala", peso: 2, quando: (p) => p.euSeiDela && p.quantosEscutam >= 1, faz: "olha para mim e não diz nada, e é claro que era para dizer" },
  { id: "serve_e_sai", gesto: "cala", peso: 2, quando: (p) => /taverneir|serviç|estalajad/.test(p.papel) && p.ato === "nada", faz: "serve, não pergunta nada, e some para os fundos" },
  { id: "nao_cumprimenta", gesto: "cala", peso: 3, quando: (p) => p.rompido, faz: "não me cumprimenta, e cumprimenta todo mundo em volta" },
  { id: "vira_o_rosto", gesto: "cala", peso: 2, quando: (p) => p.relacao === "inimigo" && p.quantosEscutam >= 2, faz: "vira o rosto quando eu entro, e faz isso devagar" },
  { id: "escuta_de_longe", gesto: "cala", peso: 2, quando: (p) => p.quantosEscutam >= 2 && p.teme, faz: "fica perto o bastante para ouvir e longe o bastante para não ser chamada" },
  { id: "espera_eu_falar", gesto: "cala", peso: 2, quando: (p) => p.primeiraVez, faz: "espera eu falar primeiro, e o silêncio dura mais do que o confortável" },

  /* ============ DEPOIS DA LUTA — o que se faz com o resultado ============
     A catraca pegou `euGanhei`, `euPerdi` e `noite` sem leitor nenhum:
     campo entregue que ninguém lê é peso morto e, pior, é a promessa de
     que o acervo reage a uma coisa a que ele não reage. */
  { id: "olha_diferente", gesto: "testa", peso: 3, quando: (p) => p.euGanhei && !p.ehCompanheiro, faz: "passa a olhar para mim de um jeito que não olhava antes, e não disfarça" },
  { id: "recolhe_o_que_sobrou", gesto: "cala", peso: 2, quando: (p) => p.euGanhei && p.quantosEscutam >= 1, faz: "recolhe o que ficou no chão sem perguntar de quem é" },
  { id: "toma_distancia", gesto: "recua", peso: 3, quando: (p) => p.euGanhei && p.relacao !== "aliado" && p.relacao !== "amigo", faz: "passa a manter uma pessoa de distância a mais do que mantinha" },
  { id: "vem_ver_o_estrago", gesto: "aproxima", peso: 3, quando: (p) => p.euPerdi && p.forcaDoLaco >= 2, faz: "vem ver o estrago antes de qualquer outra coisa, e mexe onde dói" },
  { id: "duvida_de_mim", gesto: "testa", peso: 3, quando: (p) => p.euPerdi && !p.ehCompanheiro, faz: "reconsidera na minha frente uma coisa que já tinha combinado comigo" },
  { id: "fecha_cedo", gesto: "recua", peso: 2, quando: (p) => p.noite && !p.ehCompanheiro, faz: "deixa claro que está de saída, e começa a fechar o que é dela" },
  { id: "fala_mais_baixo", gesto: "esquiva", peso: 2, quando: (p) => p.noite && p.quantosEscutam >= 1, faz: "fala mais baixo do que falaria de dia, e olha em volta antes" },

  /* ============ OS QUE VALEM SEMPRE — a rede ============
     Sem eles, uma pessoa em situação neutra não teria movimento nenhum e
     o Intérprete calaria justamente na cena mais comum do jogo. */
  { id: "toca_a_vida", gesto: "cala", peso: 1, quando: () => true, faz: "continua o que estava fazendo, e o que estava fazendo é do ofício dela" },
  { id: "repara_em_mim", gesto: "testa", peso: 1, quando: () => true, faz: "repara em alguma coisa minha que mudou desde a última vez" },
  { id: "comenta_o_lugar", gesto: "aproxima", peso: 1, quando: () => true, faz: "comenta uma coisa do lugar que só quem vive aqui repararia" },
  { id: "quer_o_que_quer", gesto: "oferece", peso: 2, quando: (p) => !!p.quer, faz: "puxa a conversa para perto do que ela quer, sem dizer que é isso" },
  { id: "esconde_o_medo", gesto: "esquiva", peso: 2, quando: (p) => !!p.teme, faz: "desconversa quando o assunto chega perto do que ela teme" },
];
export function movimentoPorId(id) { return MOVIMENTOS.find((m) => m.id === id) || null; }

/* ---------------- A MEMÓRIA ----------------
   Por pessoa, e não por cena: o que Marta fez três turnos atrás não pode
   voltar, mas Ubba pode fazer a mesma coisa que Marta fez. */
export const NAO_REPETIR = 4;
export const NAO_REPETIR_GESTO = 2;

export function garantirElenco(e) {
  const o = e && typeof e === "object" ? e : {};
  const out = {};
  for (const [nome, v] of Object.entries(o)) {
    if (typeof nome !== "string" || !nome) continue;
    out[nome] = {
      feitos: (Array.isArray(v && v.feitos) ? v.feitos : []).filter((x) => typeof x === "string").slice(-NAO_REPETIR),
      gestos: (Array.isArray(v && v.gestos) ? v.gestos : []).filter((x) => typeof x === "string").slice(-NAO_REPETIR_GESTO),
    };
  }
  return out;
}

export function marcarMovimento(elenco, nome, id, gesto) {
  const e = garantirElenco(elenco);
  const meu = e[nome] || { feitos: [], gestos: [] };
  return garantirElenco({
    ...e,
    [nome]: {
      feitos: [...meu.feitos, id].slice(-NAO_REPETIR),
      gestos: [...meu.gestos, gesto].slice(-NAO_REPETIR_GESTO),
    },
  });
}

/* ---------------- A CONSULTA ----------------
   Um movimento quebrado NÃO passa: a mesma decisão do Bibliotecário na
   v9.85, e pela mesma razão — uma lacuna nunca vira permissão. */
export function consultarInterprete(pessoa, { sorte = Math.random, elenco = null, ignorarMemoria = false } = {}) {
  const p = garantirPessoa(pessoa);
  const proibidos = new Set(gestosProibidos(p));
  const mem = garantirElenco(elenco)[p.nome] || { feitos: [], gestos: [] };
  const candidatos = [];
  for (const m of MOVIMENTOS) {
    if (proibidos.has(m.gesto)) continue;
    if (!ignorarMemoria && mem.feitos.includes(m.id)) continue;
    if (!ignorarMemoria && mem.gestos.includes(m.gesto) && m.peso < 4) continue;
    let vale = false;
    try { vale = !!m.quando(p); } catch { vale = false; }
    if (!vale) continue;
    candidatos.push(m);
  }
  if (!candidatos.length) return null;
  const total = candidatos.reduce((a, m) => a + Math.max(1, m.peso), 0);
  let r = sorte() * total;
  for (const m of candidatos) {
    r -= Math.max(1, m.peso);
    if (r <= 0) return m;
  }
  return candidatos[candidatos.length - 1];
}

/* ---------------- A LINHA DA PAUTA ----------------
   Uma por pessoa, no máximo três. Sem esse teto, uma taverna com seis
   conhecidos vira seis linhas e a cena vira assembleia. */
export const QUANTAS_PESSOAS = 3;

export function paraPauta(pessoas = [], { sorte = Math.random, elenco = null, quantas = QUANTAS_PESSOAS } = {}) {
  const linhas = [], marcas = [];
  /* quem tem laço mais forte fala primeiro: é de quem o jogador espera
     reação, e é de quem a falta de reação mais dói */
  const ordenadas = [...(pessoas || [])]
    .map(garantirPessoa)
    .filter((p) => p.nome)
    .sort((a, b) => (b.forcaDoLaco - a.forcaDoLaco) || (b.ehCompanheiro - a.ehCompanheiro))
    .slice(0, quantas);
  const movimentos = [];
  for (const p of ordenadas) {
    const m = consultarInterprete(p, { sorte, elenco });
    if (!m) continue;
    linhas.push(`${p.nome} ${m.faz}`);
    marcas.push({ nome: p.nome, id: m.id, gesto: m.gesto });
    /* v9.135: e o MOVIMENTO inteiro, com a pessoa e os vetos dela. O gesto
       ja ia a Pauta; isto vai ao ATOR, que precisa saber o que ela esta
       fazendo enquanto fala — e o que ela nunca faria. */
    movimentos.push({ pessoa: p, nome: p.nome, faz: m.faz, gesto: m.gesto, proibidos: gestosProibidos(p) });
  }
  return { linhas, marcas, movimentos };
}

export const INTERPRETE_PROMPT = `A GENTE EM CENA (v9.106):
· A linha A GENTE da Pauta diz o que cada pessoa FAZ neste turno — decidido pelo sistema a partir de quem ela é, do que ela quer, do que ela teme e do que acabou de acontecer. Cumpra: é ato, e ato é fato.
· O QUE ELA DIZ É SEU, inteiro. O sistema nunca escreve fala. "Marta muda de assunto" é dele; a frase com que ela muda é sua, e é onde você é insubstituível.
· Quem não está na lista está na cena mesmo assim — só não fez nada digno de nota. Não force reação em todo mundo.`;
