/* ============================================================
   CATÁLOGO DE PERSONAGEM — Taverna
   Raças, classes, subclasses, especializações, árvores de
   habilidades e profissões. Tudo definido em CÓDIGO: escolher
   habilidade ao subir de nível NÃO consome tokens de IA, e o
   balanceamento fica sob controle do jogo, não do improviso.
   ============================================================ */

/* ---------------- RAÇAS (mundos de fantasia) ---------------- */
export const RACAS = [
  { nome: "Humano", desc: "Versáteis e ambiciosos. Aprendem rápido e se adaptam a tudo.", bonus: { forca: 1, destreza: 1, vigor: 1, intelecto: 1, presenca: 1, percepcao: 1 }, traco: "Determinação: uma vez por descanso, refaz uma rolagem falha." },
  { nome: "Elfo", desc: "Longevos, graciosos, ligados à magia antiga e às florestas.", bonus: { destreza: 2, intelecto: 1, percepcao: 1 }, traco: "Sentidos élficos: vantagem em testes de percepção." },
  { nome: "Anão", desc: "Robustos, teimosos, mestres da pedra e do metal.", bonus: { vigor: 2, forca: 1 }, traco: "Resistência anã: reduz em 1 todo dano de veneno e fogo." },
  { nome: "Halfling", desc: "Pequenos, sortudos, impossíveis de intimidar.", bonus: { destreza: 2, presenca: 1 }, traco: "Sorte pequena: transforma um 1 natural em 2 uma vez por combate." },
  { nome: "Meio-orc", desc: "Força bruta temperada por uma vontade indomável.", bonus: { forca: 2, vigor: 2 }, traco: "Fúria persistente: ao chegar a 0 PV, fica com 1 PV uma vez por descanso longo." },
  { nome: "Draconato", desc: "Herdeiros de sangue dracônico, orgulhosos e imponentes.", bonus: { forca: 2, presenca: 1 }, traco: "Sopro ancestral: 1× por descanso, causa dano em área em linha." },
  { nome: "Tiefling", desc: "Marcados por um pacto antigo. Temidos, resilientes, astutos.", bonus: { presenca: 2, intelecto: 1 }, traco: "Herança infernal: resistência a fogo e uma pequena magia inata." },
  { nome: "Gnomo", desc: "Inventivos e curiosos, mentes que não param nunca.", bonus: { intelecto: 2, destreza: 1 }, traco: "Astúcia gnômica: vantagem para resistir a efeitos mentais." },
  { nome: "Meio-elfo", desc: "Entre dois mundos, encantadores e adaptáveis.", bonus: { presenca: 2, destreza: 1, percepcao: 1 }, traco: "Diplomata nato: vantagem em testes sociais na primeira impressão." },
  { nome: "Goliath", desc: "Gigantes das montanhas, forjados pelo frio e pela altitude.", bonus: { forca: 3, vigor: 1 }, traco: "Pele de pedra: 1× por combate, reduz um golpe pela metade." },
];

/* ---------------- ORIGENS (ficção científica, cyberpunk, pós-apoc) ---------------- */
export const ORIGENS = [
  { nome: "Terrano", desc: "Nascido no berço da humanidade. Adaptável e teimoso.", bonus: { forca: 1, vigor: 1, presenca: 1, intelecto: 1 }, traco: "Improviso: conserta o que não deveria ter conserto." },
  { nome: "Colono Orbital", desc: "Criado em gravidade baixa, ágil e preciso.", bonus: { destreza: 2, intelecto: 1 }, traco: "Pé de gato: vantagem em movimentação em espaços apertados." },
  { nome: "Sintético", desc: "Consciência artificial em corpo construído.", bonus: { intelecto: 3 }, traco: "Processamento frio: imune a medo e efeitos mentais." },
  { nome: "Mutante", desc: "O ermo reescreveu seu corpo. Não sem preço.", bonus: { vigor: 2, forca: 1 }, traco: "Metabolismo estranho: resistência a veneno e radiação." },
  { nome: "Cromado", desc: "Mais implante do que carne. Rápido, letal, endividado.", bonus: { destreza: 2, forca: 1 }, traco: "Reflexos de fábrica: age primeiro no primeiro turno de combate." },
  { nome: "Vagante", desc: "Sem mundo, sem bandeira. Só a estrada.", bonus: { percepcao: 2, destreza: 1 }, traco: "Faro de perigo: sente emboscadas antes de acontecerem." },
];

/* ---------------- ÁRVORE DE HABILIDADES ----------------
   nivel: nível mínimo para escolher. custo: PM.
   tipo: "ataque" | "defesa" | "suporte" | "utilidade" | "passiva"
--------------------------------------------------------- */

const HAB = (nome, nivel, custo, tipo, descricao) => ({ nome, nivel, custo, tipo, descricao });

/* ---------------- CLASSES ---------------- */
export const CLASSES = [
  {
    nome: "Guerreiro",
    desc: "Mestre das armas. Aguenta o que ninguém aguenta e devolve em dobro.",
    atributoChave: "forca",
    vidaBase: 14, manaBase: 4,
    subclasses: [
      { nome: "Cavaleiro", desc: "Disciplina, escudo e juramento. O muro que protege os outros.", especializacoes: ["Sentinela", "Juramentado"] },
      { nome: "Bárbaro", desc: "Fúria crua. Quanto mais ferido, mais perigoso.", especializacoes: ["Fúria Ancestral", "Devorador"] },
      { nome: "Gladiador", desc: "Luta para a plateia. Precisão, provocação e espetáculo.", especializacoes: ["Duelista", "Provocador"] },
    ],
    habilidades: [
      HAB("Golpe Poderoso", 1, 2, "ataque", "Um golpe carregado que causa dano extra."),
      HAB("Postura Defensiva", 1, 2, "defesa", "Reduz o dano recebido no próximo turno."),
      HAB("Investida", 2, 3, "ataque", "Avança e ataca, derrubando o alvo se acertar."),
      HAB("Grito de Guerra", 3, 3, "suporte", "Aliados ganham vantagem no próximo ataque."),
      HAB("Segundo Fôlego", 3, 0, "defesa", "1× por descanso: recupera parte do PV."),
      HAB("Quebra-Guarda", 4, 3, "ataque", "Ignora a armadura do alvo neste golpe."),
      HAB("Muralha", 5, 4, "defesa", "Protege um aliado adjacente por 2 turnos."),
      HAB("Ataque Duplo", 6, 4, "ataque", "Ataca duas vezes no mesmo turno."),
      HAB("Provocação", 2, 2, "utilidade", "Força o inimigo a atacar você."),
      HAB("Indomável", 7, 5, "passiva", "Ao cair a 0 PV, continua de pé por 1 turno."),
      HAB("Fúria de Batalha", 8, 5, "ataque", "Três turnos de dano aumentado e defesa reduzida."),
      HAB("Golpe Decisivo", 10, 6, "ataque", "Dano massivo em alvo abaixo de metade do PV."),
    ],
  },
  {
    nome: "Mago",
    desc: "Estudioso do arcano. Frágil de corpo, devastador de mente.",
    atributoChave: "intelecto",
    vidaBase: 8, manaBase: 14,
    subclasses: [
      { nome: "Elementalista", desc: "Fogo, gelo, raio e pedra obedecem à sua vontade.", especializacoes: ["Piromante", "Criomante"] },
      { nome: "Necromante", desc: "A morte é só mais um estado da matéria.", especializacoes: ["Ceifador", "Regente dos Ossos"] },
      { nome: "Arcanista", desc: "Manipula o próprio tecido da realidade e do tempo.", especializacoes: ["Cronomante", "Teurgista"] },
    ],
    habilidades: [
      HAB("Projétil Arcano", 1, 2, "ataque", "Dardo de energia que raramente erra."),
      HAB("Escudo Arcano", 1, 2, "defesa", "Barreira que absorve o próximo dano."),
      HAB("Rajada de Fogo", 2, 3, "ataque", "Dano em área a inimigos próximos."),
      HAB("Toque Gélido", 2, 3, "ataque", "Dano e reduz a velocidade do alvo."),
      HAB("Ler Auras", 3, 2, "utilidade", "Revela intenções, magia e mentiras."),
      HAB("Corrente de Raios", 4, 4, "ataque", "Atinge um alvo e salta para outro."),
      HAB("Passo Étereo", 4, 3, "utilidade", "Teleporte curto, escapa de cercos."),
      HAB("Lentidão", 5, 4, "suporte", "O alvo perde uma ação por 2 turnos."),
      HAB("Prisão Arcana", 6, 5, "utilidade", "Prende um inimigo por 2 turnos."),
      HAB("Contramágica", 6, 4, "defesa", "Cancela a magia de um inimigo."),
      HAB("Meteoro", 8, 7, "ataque", "Dano devastador em área ampla."),
      HAB("Reescrever o Instante", 10, 8, "utilidade", "Desfaz o resultado do último turno."),
    ],
  },
  {
    nome: "Ladino",
    desc: "Sombra, lâmina e oportunidade. Vence antes de o inimigo perceber.",
    atributoChave: "destreza",
    vidaBase: 10, manaBase: 8,
    subclasses: [
      { nome: "Assassino", desc: "Um golpe, um fim. Especialista em não deixar rastro.", especializacoes: ["Lâmina Silenciosa", "Envenenador"] },
      { nome: "Batedor", desc: "Olhos do grupo. Vê o perigo antes de todos.", especializacoes: ["Explorador", "Atirador de Elite"] },
      { nome: "Trapaceiro", desc: "Ganha na lábia, na trapaça e no bolso alheio.", especializacoes: ["Vigarista", "Mestre das Fechaduras"] },
    ],
    habilidades: [
      HAB("Ataque Furtivo", 1, 2, "ataque", "Dano extra ao atacar de surpresa ou com vantagem."),
      HAB("Esquiva Ágil", 1, 2, "defesa", "Anula o dano de um ataque por turno."),
      HAB("Passos Silenciosos", 2, 2, "utilidade", "Move-se sem ser detectado."),
      HAB("Lâmina Envenenada", 3, 3, "ataque", "Aplica Envenenado por 3 turnos."),
      HAB("Distração", 3, 2, "utilidade", "Cria abertura: aliado ganha vantagem."),
      HAB("Mãos Leves", 2, 2, "utilidade", "Furta um item ou abre uma fechadura."),
      HAB("Sombra Gêmea", 5, 4, "utilidade", "Ilusão que confunde os inimigos por 2 turnos."),
      HAB("Golpe nas Juntas", 4, 3, "ataque", "Reduz a defesa do alvo permanentemente na luta."),
      HAB("Desaparecer", 6, 4, "utilidade", "Sai de combate e fica invisível por 1 turno."),
      HAB("Punhal Certeiro", 7, 5, "ataque", "Crítico automático em alvo distraído."),
      HAB("Mil Cortes", 9, 6, "ataque", "Vários golpes rápidos no mesmo alvo."),
      HAB("Execução", 10, 7, "ataque", "Elimina alvo com pouco PV restante."),
    ],
  },
  {
    nome: "Clérigo",
    desc: "Canal de um poder maior. Cura, protege e pune.",
    atributoChave: "presenca",
    vidaBase: 12, manaBase: 12,
    subclasses: [
      { nome: "Sacerdote", desc: "A luz que sustenta o grupo inteiro.", especializacoes: ["Curandeiro", "Protetor"] },
      { nome: "Paladino", desc: "Fé com armadura pesada e espada na mão.", especializacoes: ["Juramento da Aurora", "Vingador"] },
      { nome: "Inquisidor", desc: "Caça heresias e criaturas do escuro sem piedade.", especializacoes: ["Caçador de Demônios", "Exorcista"] },
    ],
    habilidades: [
      HAB("Cura Leve", 1, 3, "suporte", "Restaura PV de um aliado."),
      HAB("Luz Sagrada", 1, 2, "ataque", "Dano radiante, extra contra mortos-vivos."),
      HAB("Bênção", 2, 3, "suporte", "Aliados ganham vantagem por 3 turnos."),
      HAB("Escudo da Fé", 3, 3, "defesa", "Protege um aliado de dano por 2 turnos."),
      HAB("Purificar", 3, 3, "suporte", "Remove condições ruins de um aliado."),
      HAB("Golpe Sagrado", 4, 4, "ataque", "Ataque com dano divino adicional."),
      HAB("Palavra de Coragem", 4, 3, "suporte", "Remove medo e concede PV temporário."),
      HAB("Círculo Sagrado", 6, 5, "defesa", "Área protegida onde aliados curam por turno."),
      HAB("Julgamento", 7, 5, "ataque", "Marca um inimigo: sofre dano extra de todos."),
      HAB("Ressurreição Menor", 9, 8, "suporte", "Traz um aliado caído de volta com pouco PV."),
      HAB("Ira Divina", 10, 7, "ataque", "Dano massivo em todos os inimigos próximos."),
      HAB("Intervenção", 8, 6, "defesa", "Anula completamente um golpe fatal."),
    ],
  },
  {
    nome: "Caçador",
    desc: "O ermo é sua casa. Rastreia, emboscada e nunca erra de longe.",
    atributoChave: "percepcao",
    vidaBase: 11, manaBase: 8,
    subclasses: [
      { nome: "Arqueiro", desc: "Mestre do arco. A distância é sua armadura.", especializacoes: ["Tiro Certeiro", "Chuva de Flechas"] },
      { nome: "Domador", desc: "Anda com um companheiro animal leal.", especializacoes: ["Vínculo Selvagem", "Alcateia"] },
      { nome: "Rastreador", desc: "Encontra qualquer coisa que tenha deixado rastro.", especializacoes: ["Caçador de Recompensas", "Guia do Ermo"] },
    ],
    habilidades: [
      HAB("Tiro Preciso", 1, 2, "ataque", "Ataque à distância com bônus de acerto."),
      HAB("Rastrear", 1, 1, "utilidade", "Segue rastros e encontra criaturas."),
      HAB("Armadilha", 2, 2, "utilidade", "Prende o primeiro inimigo que passar."),
      HAB("Tiro Duplo", 3, 3, "ataque", "Dispara duas flechas no mesmo turno."),
      HAB("Marca do Caçador", 3, 2, "suporte", "Alvo marcado sofre dano extra seu."),
      HAB("Camuflagem", 4, 3, "utilidade", "Fica oculto em terreno natural."),
      HAB("Flecha Perfurante", 5, 4, "ataque", "Atravessa e atinge inimigos em linha."),
      HAB("Companheiro Animal", 4, 4, "suporte", "Convoca um aliado animal por 5 turnos."),
      HAB("Tiro Paralisante", 6, 4, "ataque", "Aplica Atordoado por 1 turno."),
      HAB("Emboscada", 7, 5, "ataque", "Ataque surpresa com dano triplo."),
      HAB("Chuva de Flechas", 8, 6, "ataque", "Dano em área a todos os inimigos."),
      HAB("Tiro do Fim", 10, 7, "ataque", "Um único disparo devastador de longe."),
    ],
  },
  {
    nome: "Bardo",
    desc: "Palavra afiada, música que inspira e uma mentira sempre pronta.",
    atributoChave: "presenca",
    vidaBase: 10, manaBase: 12,
    subclasses: [
      { nome: "Menestrel", desc: "Canções que curam feridas e levantam corações.", especializacoes: ["Canto de Cura", "Hino de Guerra"] },
      { nome: "Cronista", desc: "Conhece toda história e usa isso como arma.", especializacoes: ["Erudito", "Contador de Segredos"] },
      { nome: "Encantador", desc: "Dobra vontades com palavras e melodias.", especializacoes: ["Sedutor", "Manipulador"] },
    ],
    habilidades: [
      HAB("Inspiração", 1, 2, "suporte", "Aliado ganha vantagem na próxima rolagem."),
      HAB("Palavra Cortante", 1, 2, "ataque", "Dano psíquico e desvantagem ao alvo."),
      HAB("Canção Curativa", 2, 3, "suporte", "Cura o grupo inteiro um pouco."),
      HAB("Lábia", 2, 2, "utilidade", "Vantagem enorme em persuasão e engano."),
      HAB("Melodia Confusa", 3, 3, "suporte", "Inimigo ataca aliado dele por 1 turno."),
      HAB("Conhecimento Vasto", 3, 1, "utilidade", "Sabe algo útil sobre qualquer coisa."),
      HAB("Hino de Guerra", 4, 4, "suporte", "Todo o grupo ganha dano extra por 3 turnos."),
      HAB("Contra-Canção", 5, 4, "defesa", "Anula efeitos mentais e sonoros no grupo."),
      HAB("Sussurro Fatal", 6, 5, "ataque", "Dano psíquico alto em alvo único."),
      HAB("Fascínio", 7, 5, "utilidade", "Um inimigo para de lutar por 2 turnos."),
      HAB("Balada do Herói", 8, 6, "suporte", "O grupo cura e ganha vantagem por 3 turnos."),
      HAB("Última Estrofe", 10, 8, "suporte", "Reergue todos os aliados caídos."),
    ],
  },
  {
    nome: "Monge",
    desc: "Corpo como arma, mente como fortaleza. Rápido e implacável.",
    atributoChave: "destreza",
    vidaBase: 11, manaBase: 10,
    subclasses: [
      { nome: "Punho de Ferro", desc: "Cada golpe quebra ossos e defesas.", especializacoes: ["Mão Aberta", "Quebra-Montanhas"] },
      { nome: "Andarilho", desc: "Movimento perpétuo. Impossível de encurralar.", especializacoes: ["Vento Veloz", "Sombra Dançante"] },
      { nome: "Asceta", desc: "Domina o próprio corpo e a própria dor.", especializacoes: ["Corpo Imaculado", "Mente Vazia"] },
    ],
    habilidades: [
      HAB("Rajada de Golpes", 1, 2, "ataque", "Vários ataques rápidos desarmados."),
      HAB("Defesa Fluida", 1, 2, "defesa", "Desvia do próximo ataque automaticamente."),
      HAB("Passo do Vento", 2, 2, "utilidade", "Move-se o dobro e ignora terreno difícil."),
      HAB("Golpe Atordoante", 3, 3, "ataque", "Aplica Atordoado por 1 turno."),
      HAB("Foco Interior", 3, 0, "suporte", "Recupera PM meditando 1 turno."),
      HAB("Corpo de Ferro", 4, 3, "defesa", "Reduz todo dano pela metade por 2 turnos."),
      HAB("Palma Trovejante", 5, 4, "ataque", "Empurra e derruba o alvo com dano."),
      HAB("Mente Serena", 5, 3, "defesa", "Imune a medo e confusão por 3 turnos."),
      HAB("Cem Punhos", 7, 5, "ataque", "Sequência devastadora em um alvo."),
      HAB("Toque da Quietude", 8, 6, "ataque", "Impede o alvo de usar habilidades por 2 turnos."),
      HAB("Corpo Imortal", 9, 6, "defesa", "Não pode cair abaixo de 1 PV por 2 turnos."),
      HAB("Palma dos Sete Ventos", 10, 8, "ataque", "Golpe lendário de dano extremo."),
    ],
  },
  {
    nome: "Druida",
    desc: "Voz da natureza. Molda o mundo vivo e veste outras formas.",
    atributoChave: "intelecto",
    vidaBase: 11, manaBase: 12,
    subclasses: [
      { nome: "Metamorfo", desc: "Assume formas animais em combate e fora dele.", especializacoes: ["Forma Predadora", "Forma Alada"] },
      { nome: "Xamã", desc: "Fala com espíritos e comanda os elementos naturais.", especializacoes: ["Espíritos Ancestrais", "Chamado da Tempestade"] },
      { nome: "Guardião", desc: "Protege bosques e feridos com igual ferocidade.", especializacoes: ["Guardião do Bosque", "Semeador"] },
    ],
    habilidades: [
      HAB("Espinhos", 1, 2, "ataque", "Raízes atacam e prendem o alvo."),
      HAB("Toque Curativo", 1, 3, "suporte", "Cura um aliado com energia natural."),
      HAB("Falar com Animais", 2, 1, "utilidade", "Conversa com criaturas selvagens."),
      HAB("Forma Animal", 3, 4, "utilidade", "Transforma-se em um animal por 5 turnos."),
      HAB("Chamado da Chuva", 3, 3, "suporte", "Altera o clima; cura leve contínua."),
      HAB("Casca de Carvalho", 4, 3, "defesa", "Aumenta muito a defesa por 3 turnos."),
      HAB("Enxame", 5, 4, "ataque", "Insetos causam dano em área e cegam."),
      HAB("Raio Solar", 5, 4, "ataque", "Dano radiante concentrado."),
      HAB("Emaranhar", 6, 4, "utilidade", "Prende todos os inimigos da área por 2 turnos."),
      HAB("Renovação", 7, 5, "suporte", "Cura o grupo por 3 turnos seguidos."),
      HAB("Fúria de Gaia", 9, 7, "ataque", "Terremoto que atinge todos os inimigos."),
      HAB("Forma Ancestral", 10, 8, "utilidade", "Assume uma forma lendária por 5 turnos."),
    ],
  },
];

/* ---------------- PROFISSÕES ---------------- */
export const PROFISSOES = [
  { nome: "Ferreiro", desc: "Forja e repara armas e armaduras.", beneficio: "Pode reparar equipamentos em descanso e melhorar armas com materiais." },
  { nome: "Alquimista", desc: "Destila poções, venenos e reagentes.", beneficio: "Cria poções de cura e frascos ofensivos com ingredientes." },
  { nome: "Herborista", desc: "Conhece ervas, raízes e cogumelos.", beneficio: "Coleta ingredientes no ermo e identifica venenos." },
  { nome: "Cartógrafo", desc: "Desenha e lê mapas de terras desconhecidas.", beneficio: "Reduz chance de se perder; revela caminhos ocultos." },
  { nome: "Escriba", desc: "Copia, traduz e decifra documentos antigos.", beneficio: "Lê línguas mortas e identifica pergaminhos." },
  { nome: "Cozinheiro", desc: "Transforma ração em refeição de verdade.", beneficio: "Refeições em acampamento dão bônus temporário ao grupo." },
  { nome: "Joalheiro", desc: "Lapida gemas e engasta encantamentos.", beneficio: "Extrai valor de gemas e prepara focos mágicos." },
  { nome: "Curtidor", desc: "Trabalha couro e peles de criaturas.", beneficio: "Converte despojos de bestas em armaduras leves." },
  { nome: "Minerador", desc: "Sabe onde e como extrair metal e pedra.", beneficio: "Encontra minérios e passagens em cavernas." },
  { nome: "Caçador de Recompensas", desc: "Vive de contratos e alvos marcados.", beneficio: "Ganha mais moedas por inimigos notáveis e acesso a contratos." },
  { nome: "Mercador", desc: "Compra barato, vende caro, conhece todo mundo.", beneficio: "Melhores preços e acesso a mercadorias raras." },
  { nome: "Médico de Campo", desc: "Estanca sangue e remenda ossos sem magia.", beneficio: "Cura extra em descansos e trata condições físicas." },
];

/* ---------------- API ---------------- */
export function classePorNome(n) { return CLASSES.find((c) => c.nome === n) || null; }
export function racaPorNome(n) { return [...RACAS, ...ORIGENS].find((r) => r.nome === n) || null; }

/* Raças disponíveis conforme o gênero do mundo */
export function racasDoGenero(genero) {
  const futurista = ["Ficção científica", "Cyberpunk", "Pós-apocalíptico"];
  return futurista.includes(genero) ? ORIGENS : RACAS;
}

/* Habilidades que o personagem PODE escolher agora (nível suficiente e ainda não possui) */
export function habilidadesDisponiveis(classeNome, nivel, jaTem = []) {
  const c = classePorNome(classeNome);
  if (!c) return [];
  const nomes = new Set(jaTem.map((h) => (typeof h === "string" ? h : h.nome)));
  return c.habilidades.filter((h) => h.nivel <= nivel && !nomes.has(h.nome));
}

/* Habilidades iniciais sugeridas ao criar o personagem (as de nível 1) */
export function habilidadesIniciais(classeNome) {
  const c = classePorNome(classeNome);
  return c ? c.habilidades.filter((h) => h.nivel === 1) : [];
}
