/* ============================================================
   A MESA POSTA (v9.201) — o juízo da ação

   Terceiro órgão do diretor de histórias, e o que dá ao Mestre a "vida
   fácil" que o projeto persegue: quando uma ação declarada chega, o
   sistema já pôs a mesa — se há teste, qual, quão duro, e o que cada
   resultado significa. O Narrador não improvisa o sentido de um dado;
   ele narra a versão que o dado escolheu.

   Os testes são UM prato, não a mesa. Este arquivo é o balcão do juízo
   da ação: a primeira decisão (há teste?), as recusas (quando NÃO se
   rola), as situações com nome (nada de "role percepção" genérico), e —
   a peça que muda tudo — as apostas ANTES da rolagem: as duas versões
   da cena, escritas antes do dado.

   ---------------- O QUE JÁ EXISTIA, E O QUE ISTO ACRESCENTA ----------

   `testes.js` já rola a pedido e trava o Mestre no resultado;
   `dificuldade.js` já dá o veredito por poder; `oraculo.js` responde o
   que ainda não existe; `consequencias.js` cobra a falha crítica. O que
   faltava era a decisão de SE o teste deve existir, o catálogo de
   situações não-genéricas, e a lei da falha: ela NUNCA é "nada
   acontece" — cobra sempre uma das seis moedas, e a cena anda.

   ---------------- SEPARADO DO DESENHO ----------------

   Conta se prova, tela se olha. Este arquivo classifica e cataloga; o
   contrato que vai ao Narrador é o BLOCO_DA_MESA, montado no prompt.
   ============================================================ */

/* ---------------- AS SEIS MOEDAS DA FALHA ----------------
   Toda falha de ação paga numa destas — nunca em "nada aconteceu", nunca
   em morte seca sem cena. Falhar move a história para FRENTE, só que por
   um caminho mais caro. */
export const MOEDAS_DA_FALHA = [
  { id: "tempo", nome: "tempo", diz: "a ação custa mais do que se previa — a janela aperta, alguém se aproxima" },
  { id: "ruido", nome: "ruído", diz: "o gesto chama atenção — quem estava perto agora sabe" },
  { id: "recurso", nome: "recurso", diz: "algo se gasta ou se quebra — a ferramenta, a corda, a última dose" },
  { id: "posicao", nome: "posição", diz: "o herói fica em pior lugar — pendurado, cercado, exposto" },
  { id: "condicao", nome: "condição", diz: "o corpo paga — um ferimento leve, exaustão, uma aflição menor" },
  { id: "info", nome: "informação parcial", diz: "sai meia-verdade: certa o bastante para agir, errada o bastante para custar" },
];
export const moedaPorId = (id) => MOEDAS_DA_FALHA.find((m) => m.id === id) || null;

/* ---------------- AS CINCO TRILHAS ----------------
   A primeira decisão diante de uma ação: por qual porta ela sai. Só a
   trilha "teste" chega ao dado; as outras quatro resolvem sem rolar. */
export const TRILHAS = [
  { id: "impossivel", nome: "Impossível", diz: "o veredito nega: sem chance real, não se rola", entrega: "o porquê, e O QUE FALTA para virar possível — ferramenta, aliado, nível, informação. Negar sem porta é beco." },
  { id: "automatico", nome: "Automático", diz: "ferramenta certa, tempo de sobra, nenhuma pressão", entrega: "acontece. Rolar o rotineiro é desrespeitar o competente." },
  { id: "trivial", nome: "Trivial pelo patamar", diz: "rotina do nível de quem faz", entrega: "acontece, com a naturalidade de quem tem ofício." },
  { id: "teste", nome: "Teste", diz: "risco real E consequência real nas duas pontas", entrega: "a mesa posta: teste, régua, e as duas versões da cena." },
  { id: "oraculo", nome: "Oráculo", diz: "a dúvida é do MUNDO, não da mão do herói", entrega: "os seis graus do sim/não derivado — quem responde é oraculo.js." },
];
export const trilhaPorId = (id) => TRILHAS.find((t) => t.id === id) || null;

/* ---------------- AS OITO RECUSAS ----------------
   Quando NÃO se rola — e por quê. Saber recusar o dado é o que separa um
   juiz de um caça-níquel. */
export const RECUSAS = [
  { id: "sem_custo", diz: "falha sem consequência não é teste, é moeda ao ar: se nada muda ao falhar, acontece e pronto" },
  { id: "sem_repeticao", diz: "falhou, não re-rola a mesma coisa sem fator novo (ferramenta, ajuda, tempo, plano) — senão todo teste é 'até passar'" },
  { id: "rotina", diz: "rotina do patamar: o ladrão de nível 9 não rola para abrir a fechadura da pensão" },
  { id: "gesto_simbolico", diz: "em cena de peso, ajoelhar-se, jurar, chorar — nunca se rola o coração" },
  { id: "competente_ao_lado", diz: "se o companheiro é obviamente melhor e há tempo, ele simplesmente faz" },
  { id: "informacao_comprada", diz: "o que a biblioteca, o informante ou o mapa já entregaram não se rola de novo por desconfiança" },
  { id: "escolha", diz: "dilema moral e decisão de rumo nunca viram dado — dado não decide quem o herói é" },
  { id: "ja_decidido", diz: "o que relógio, decreto ou guerra já estabeleceram não reabre por rolagem" },
];
export const recusaPorId = (id) => RECUSAS.find((r) => r.id === id) || null;

/* ============================================================
   AS 40 SITUAÇÕES — testes com nome, nunca genéricos

   Oito grupos de cinco. Cada uma diz o teste (atributo · perícia), o que
   MOVE a régua (modificadores nomeados, sempre do vocabulário da cena) e
   a MOEDA que a falha cobra — porque a coluna da falha é a alma: ela nunca
   é "nada acontece". A régua-base vem do patamar (dificuldade.js); os
   modificadores a empurram um degrau.
   ============================================================ */
const S = (id, grupo, nome, atributo, pericia, sobe, moeda, falha, chaves) =>
  ({ id, grupo, nome, atributo, pericia, sobe, moeda, falha, chaves });

export const SITUACOES = [
  /* ---- CORPO ---- */
  S("escalar_muralha", "corpo", "Escalar a muralha na chuva", "forca", "atletismo", "altura; chuva −; corda e gancho +; armadura pesada −", "posicao", "desce ao meio, com barulho — a ronda se aproxima", ["escalar", "muralha", "muro", "subir", "parede"]),
  S("saltar_fenda", "corpo", "Saltar a fenda com corrida", "forca", "atletismo", "vão vs. deslocamento; carga −; impulso +", "posicao", "pendurado na borda: segunda decisão, agora pior", ["saltar", "pular", "fenda", "abismo", "vão"]),
  S("nadar_armadura", "corpo", "Nadar vestindo armadura", "forca", "atletismo", "correnteza −; metal −; margem perto +", "recurso", "larga o escudo ou afunda um degrau da régua", ["nadar", "atravessar o rio", "correnteza", "afogar"]),
  S("arrombar_porta", "corpo", "Arrombar a porta reforçada", "forca", "", "material; pé-de-cabra +; pressa −", "ruido", "o estrondo: quem estava perto agora sabe", ["arrombar", "derrubar a porta", "forçar a porta", "quebrar a porta"]),
  S("marcha_forcada", "corpo", "Aguentar a marcha forçada", "vigor", "", "dias seguidos −; clima −; montaria +", "condicao", "exaustão sobe um degrau ao chegar", ["marcha", "forçar o passo", "viajar sem parar", "caminhar a noite"]),

  /* ---- FURTIVIDADE ---- */
  S("passar_posto", "furtividade", "Passar pelo posto de guarda", "destreza", "furtividade", "luz −; neblina +; armadura ruidosa −; guarda distraído +", "posicao", "visto, ainda não alcançado — a perseguição é a próxima cena", ["esgueirar", "passar despercebido", "furtivo", "sorrateiro", "escapulir", "passar pela guarda"]),
  S("palmear_chave", "furtividade", "Palmear a chave do carcereiro", "destreza", "prestidigitacao", "multidão +; alvo sóbrio −; distração armada +", "ruido", "a mão agarrada no pulso — e agora?", ["roubar", "furtar", "palmear", "surrupiar", "batedor de carteira", "bolso"]),
  S("seguir_feira", "furtividade", "Seguir alguém pela feira", "destreza", "furtividade", "multidão +; alvo desconfiado −; segundo seguidor +", "info", "despistado — e o alvo muda a rotina de amanhã", ["seguir", "perseguir discreto", "ir atrás sem", "rastrear na cidade"]),
  S("esconder_adaga", "furtividade", "Esconder a adaga na revista", "destreza", "prestidigitacao", "rigor do posto −; bainha dissimulada +", "recurso", "confiscada, nome anotado no registro da guarda", ["esconder a arma", "revista", "passar pela revista", "ocultar a lâmina"]),
  S("fechadura_pressao", "furtividade", "Abrir a fechadura sob pressão", "destreza", "ferramentas", "qualidade da gazua +; escuro −; turnos contados −", "recurso", "a gazua parte DENTRO — a fechadura trava para todos", ["arrombar a fechadura", "abrir o cadeado", "gazua", "picklock", "destrancar"]),

  /* ---- SOCIAL ---- */
  S("mentir_desconfia", "social", "Mentir a quem já desconfia", "presenca", "enganacao", "história ensaiada +; fato que contradiz −; índole do alvo", "info", "a mentira é ANOTADA, não confrontada — semente do outro lado", ["mentir", "enganar", "blefar", "história falsa", "disfarçar a verdade"]),
  S("intimidar_escolta", "social", "Intimidar quem tem escolta", "presenca", "intimidacao", "fama +; arma à vista +; escolta −", "condicao", "o medo azeda em ódio: inimigo com nome", ["intimidar", "ameaçar", "amedrontar", "meter medo", "coagir"]),
  S("barganhar_monopolio", "social", "Barganhar com o monopólio", "presenca", "persuasao", "alternativa real +; pressa sua −; freguês antigo +", "recurso", "o preço sobe para VOCÊ — e ele avisa os colegas", ["barganhar", "pechinchar", "negociar preço", "regatear"]),
  S("discursar_multidao", "social", "Discursar à multidão hostil", "presenca", "atuacao", "patamar de fama; tumulto −; púlpito +", "posicao", "vaia: a fama esfria um grau nesta cidade", ["discursar", "falar à multidão", "arengar", "convencer o povo", "discurso"]),
  S("consolar_perda", "social", "Consolar quem perdeu tudo", "presenca", "", "vínculo +; cena de peso ativa +", "info", "o silêncio — mas a tentativa fica lembrada (o vínculo não cai)", ["consolar", "confortar", "acalmar o luto", "dar apoio"]),

  /* ---- CONHECIMENTO ---- */
  S("identificar_brasao", "conhecimento", "Identificar o brasão limado", "intelecto", "historia", "biblioteca por perto +; raridade da casa −", "info", "identificação errada e PLAUSÍVEL — informação parcial", ["identificar o brasão", "reconhecer o símbolo", "de quem é esse escudo", "heráldica"]),
  S("datar_ruina", "conhecimento", "Datar a ruína pelo estilo", "intelecto", "historia", "luz; tempo para examinar +", "info", "erro de uma era: a expedição se prepara para o perigo errado", ["datar", "que idade tem", "de que época", "quão antiga"]),
  S("reconhecer_ritual", "conhecimento", "Reconhecer o ritual pelos restos", "intelecto", "arcana", "grimório +; restos removidos −", "info", "reconhece a família da magia, não a intenção", ["reconhecer o ritual", "que magia é", "identificar o feitiço", "runas", "símbolos arcanos"]),
  S("avaliar_peca", "conhecimento", "Avaliar a peça antes de pagar", "intelecto", "", "ferramentas de ofício +; vendedor apressando −", "recurso", "preço de original por uma cópia — descobre ao revender", ["avaliar", "quanto vale", "é verdadeiro", "autenticar", "tasar"]),
  S("lembrar_fraqueza", "conhecimento", "Lembrar a fraqueza da criatura", "intelecto", "", "estante consultada antes +; criatura rara −", "info", "lembra o MITO, não o fato — e o mito morde", ["fraqueza da criatura", "ponto fraco", "como matar", "vulnerabilidade", "o que a fere"]),

  /* ---- PERCEPÇÃO ---- */
  S("notar_emboscada", "percepcao", "Notar a emboscada a tempo", "percepcao", "percepcao", "neblina −; pássaros calados como pista +; pressa −", "posicao", "a surpresa é deles: o primeiro golpe sem resposta", ["notar a emboscada", "algo errado", "perceber perigo", "sentir cilada"]),
  S("achar_porta", "percepcao", "Achar a porta que o mapa nega", "percepcao", "investigacao", "mapa antigo +; tempo +", "tempo", "acha o mecanismo, não o gatilho — abrir à força tem preço", ["passagem secreta", "porta escondida", "procurar saída", "revistar a parede", "compartimento"]),
  S("ler_intencao", "percepcao", "Ler a intenção na mesa de jogo", "percepcao", "intuicao", "índole do alvo; bebida −", "info", "confia na pessoa errada — a régua não avisa duas vezes", ["ler a intenção", "ele está mentindo", "confiar", "sincero", "farol"]),
  S("vigiar_noite", "percepcao", "Vigiar a noite inteira", "percepcao", "", "exaustão −; lua clara +", "condicao", "o sono vence no fim do turno — e o mundo escolhe o que passa", ["vigiar", "montar guarda", "ficar de sentinela", "vigília"]),
  S("sentir_veneno", "percepcao", "Sentir o veneno antes do gole", "percepcao", "", "prato temperado −; veneno conhecido +", "condicao", "um gole antes da certeza — a dose decide o resto", ["cheirar a comida", "veneno na taça", "está envenenado", "provar antes"]),

  /* ---- SOBREVIVÊNCIA ---- */
  S("rastrear_chuva", "sobrevivencia", "Rastrear sob a chuva de ontem", "percepcao", "sobrevivencia", "horas passadas −; terreno mole +", "tempo", "rastro certo, bifurcação errada — meio dia atrás do nada", ["rastrear", "seguir as pegadas", "a trilha", "farejar o caminho"]),
  S("orientar_sem_estrelas", "sobrevivencia", "Orientar-se sem estrelas", "intelecto", "sobrevivencia", "mapa +; mata fechada −", "tempo", "o círculo: a mesma clareira, horas depois", ["me orientar", "achar o norte", "não me perder", "que direção"]),
  S("prever_tempestade", "sobrevivencia", "Prever a tempestade a tempo", "percepcao", "sobrevivencia", "estação; costa; bicho inquieto +", "condicao", "o acampamento montado no lugar que alaga", ["prever o tempo", "vai chover", "ler o céu", "tempestade chegando"]),
  S("forragear_inverno", "sobrevivencia", "Forragear no inverno", "percepcao", "sobrevivencia", "região; neve −; conhecimento local +", "recurso", "ração pela metade: a fome cobra amanhã", ["forragear", "caçar comida", "achar água", "buscar mantimento", "colher"]),
  S("fogo_ventania", "sobrevivencia", "Acender fogo na ventania", "destreza", "sobrevivencia", "pederneira +; lenha molhada −", "condicao", "noite fria: o descanso rende menos", ["acender fogo", "fazer fogueira", "atear", "acampar no frio"]),

  /* ---- OFÍCIO ---- */
  S("consertar_armadura", "oficio", "Consertar a armadura em campo", "intelecto", "ferramentas", "ferramentas certas +; sem forja −", "recurso", "remendo: quebra de novo no primeiro crítico sofrido", ["consertar a armadura", "remendar", "reparar o equipamento"]),
  S("falsificar_selo", "oficio", "Falsificar o selo do decreto", "destreza", "ferramentas", "original à vista +; cera errada −", "info", "a falha é INVISÍVEL agora: descoberta na entrega — e vira semente", ["falsificar", "forjar o selo", "imitar o documento", "copiar o lacre"]),
  S("preparar_antidoto", "oficio", "Preparar o antídoto certo", "intelecto", "medicina", "amostra do veneno +; pressa −", "tempo", "antídoto fraco: adia o veneno, não o cura", ["antídoto", "preparar o remédio", "curar o veneno", "poção de cura caseira"]),
  S("ferrar_cavalo", "oficio", "Ferrar o cavalo arisco", "destreza", "ferramentas", "animal acalmado antes +", "condicao", "o coice: dano leve e uma manhã perdida", ["ferrar o cavalo", "cuidar da montaria", "ferradura"]),
  S("cozinhar_banquete", "oficio", "Cozinhar o banquete que importa", "intelecto", "oficio", "ingredientes da terra +; cozinha alheia −", "info", "o anfitrião nota — a mesa social desce um degrau", ["cozinhar", "preparar o banquete", "fazer a refeição", "o jantar"]),

  /* ---- VONTADE ---- */
  S("concentracao_ferido", "vontade", "Manter a concentração ferido", "vigor", "", "dano sofrido −; âncora de ritual +", "recurso", "a magia escapa — no turno em que mais fazia falta", ["manter a concentração", "segurar o feitiço", "não perder a magia"]),
  S("medo_lendario", "vontade", "Resistir ao medo do lendário", "presenca", "", "aliados de pé +; primeira vez −", "posicao", "hesita: age por último na rodada", ["resistir ao medo", "encarar o dragão", "não fugir", "coragem diante"]),
  S("recusar_oferta", "vontade", "Recusar a oferta do inimigo", "presenca", "", "a oferta toca teu propósito −; testemunhas +", "info", "aceita 'só ouvir' — e o grupo viu aceitar", ["recusar a oferta", "resistir à tentação", "dizer não ao"]),
  S("velar_acordado", "vontade", "Velar acordado no velório", "vigor", "", "exaustão −; dever +", "condicao", "o cochilo — e a cidade repara quem dormiu", ["velar", "ficar acordado", "vigília do morto", "não dormir no velório"]),
  S("ponte_balanca", "vontade", "Atravessar a ponte que balança", "presenca", "", "vento −; corda-guia +; vertigem conhecida −", "posicao", "paralisa no meio: alguém precisa voltar", ["ponte", "travessia perigosa", "abismo embaixo", "corda bamba"]),
];

export const GRUPOS = ["corpo", "furtividade", "social", "conhecimento", "percepcao", "sobrevivencia", "oficio", "vontade"];
export const situacaoPorId = (id) => SITUACOES.find((s) => s.id === id) || null;
export const situacoesDoGrupo = (g) => SITUACOES.filter((s) => s.grupo === g);

/* ---------------- CASAR AÇÃO COM SITUAÇÃO ----------------
   Um casamento CONSERVADOR: só devolve situação quando uma chave forte
   aparece no que o jogador escreveu. Errar para menos (não casar) é
   barato — o Mestre segue sem a dica; casar errado poluiria a cena. Por
   isso as chaves são específicas, e a primeira que casar ganha. */
export function situacaoQueCasa(texto) {
  const t = " " + String(texto || "").toLowerCase() + " ";
  if (t.trim().length < 3) return null;
  for (const s of SITUACOES) {
    if (s.chaves.some((c) => t.includes(c))) return s;
  }
  return null;
}

/* ---------------- AS APOSTAS ANTES DA ROLAGEM ----------------
   As duas versões da cena, para o Narrador ter as duas na mão antes do
   dado. A de falha SEMPRE nomeia a moeda — é a lei que impede o "nada
   acontece". Quando a ação casa com uma situação, usa o custo dela;
   senão, cai numa moeda genérica honesta (tempo). */
export function apostas(situacao) {
  const s = typeof situacao === "string" ? situacaoPorId(situacao) : situacao;
  if (!s) return null;
  const m = moedaPorId(s.moeda) || moedaPorId("tempo");
  return {
    sePassa: `passa: ${s.nome.toLowerCase()} — dê o resultado limpo, sem custo escondido.`,
    seFalha: `falha: ${s.falha}. A moeda é ${m.nome} — a cena anda para frente, nunca 'nada acontece'.`,
    moeda: m.id,
  };
}

export function custoDeFalha(situacao) {
  const a = apostas(situacao);
  return a ? a.moeda : "tempo";
}

/* ---------------- POR QUE NÃO HÁ BLOCO NO PROMPT ----------------
   A primeira versão pôs a doutrina da Mesa no prompt fixo. A sonda de
   custo recusou: o prompt já vivia a 64 caracteres do teto de 82 mil (um
   guarda de custo desta casa), e doutrina permanente o estourava. A cura
   é a certa e é a que o documento já pedia: as duas versões da cena
   "chegam à PAUTA antes do dado". A aposta é DINÂMICA — entra só quando a
   ação casa com uma situação, custa zero nos turnos em que não há risco,
   e é mais específica que qualquer bloco fixo, porque nomeia a moeda
   daquela situação. O contrato mora nas `apostas`, não numa parede. */

/* ---------------- PARA O CONSOLE DE AUTOR ----------------
   A saúde do catálogo, sem despejar as 40 na tela. */
export function resumoDaMesa() {
  return { trilhas: TRILHAS.length, recusas: RECUSAS.length, moedas: MOEDAS_DA_FALHA.length, situacoes: SITUACOES.length, grupos: GRUPOS.length };
}
