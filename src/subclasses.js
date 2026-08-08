/* ============================================================
   SUBCLASSES (v9.3) — o segundo andar da árvore — Taverna

   As subclasses existiam só como nome na ficha. Agora cada uma
   tem árvore própria: quatro habilidades que só abrem depois que
   o herói tem estrada naquela classe (degraus 3, 5, 7 e 9).

   Isso resolve duas coisas de uma vez: dá para onde mandar os
   pontos de quem já esgotou a classe base, e força ESCOLHA — a
   subclasse é uma só por classe, então o cavaleiro nunca terá as
   fúrias do bárbaro. Quem quiser as duas paga com multiclasse.

   O `degrau` é o rank exigido NAQUELA classe, não o nível do
   herói: um mago 9 de mago abre o último degrau da subclasse
   dele; um mago 9 espalhado em três classes, não.
   ============================================================ */

/* nome, custo em PM, tipo, descrição — o degrau vem da posição (3,5,7,9) */
const S = (nome, custo, tipo, descricao) => ({ nome, custo, tipo, descricao });
export const DEGRAUS_SUBCLASSE = [3, 5, 7, 9];

export const SUBCLASSES = {
  /* ---------------- GUERREIRO ---------------- */
  "Cavaleiro": [
    S("Juramento de Guarda", 3, "defesa", "Assume o dano de um aliado adjacente até o fim do turno."),
    S("Provocação de Ferro", 3, "suporte", "Força os inimigos a te encarar — eles atacam você, não o grupo."),
    S("Muralha Viva", 5, "defesa", "Você e um aliado ficam protegidos por 3 turnos."),
    S("Voto Inquebrável", 7, "defesa", "Enquanto houver aliado de pé, você não cai: o golpe fatal é negado uma vez."),
  ],
  "Bárbaro": [
    S("Fúria Sangrenta", 3, "ataque", "Entra em fúria: dano aumentado enquanto durar a luta."),
    S("Pele de Pedra", 4, "defesa", "A carne endurece — dano reduzido por 3 turnos."),
    S("Golpe Dilacerante", 5, "ataque", "Um talho que rasga fundo e faz o alvo sangrar."),
    S("Último Rugido", 7, "ataque", "Quanto menos vida você tem, mais brutal é o golpe."),
  ],
  "Gladiador": [
    S("Finta da Arena", 3, "ataque", "Engana a guarda e acerta em cheio, derrubando o alvo."),
    S("Aplauso da Multidão", 3, "suporte", "A plateia ruge: o grupo inteiro fica inspirado."),
    S("Duelo Declarado", 5, "ataque", "Escolhe um alvo e o persegue: dano extra contra ele."),
    S("Espetáculo Final", 7, "ataque", "Um golpe teatral e devastador que encerra o duelo."),
  ],

  /* ---------------- MAGO ---------------- */
  "Elementalista": [
    S("Manto Flamejante", 3, "defesa", "Chamas envolvem você e queimam quem se aproxima."),
    S("Lança de Gelo", 4, "ataque", "Estilhaço glacial que perfura e alenta o alvo."),
    S("Tempestade Elemental", 6, "ataque", "Fogo, gelo e raio caem sobre todos os inimigos."),
    S("Convergência", 8, "ataque", "Funde os elementos num único golpe incandescente."),
  ],
  "Necromante": [
    S("Toque Sepulcral", 3, "ataque", "Dreno sombrio: o alvo enfraquece e você se sustenta."),
    S("Servos de Osso", 5, "suporte", "Ergue esqueletos que lutam ao seu lado por alguns turnos."),
    S("Colheita de Almas", 6, "ataque", "Cada inimigo caído alimenta o próximo lançamento."),
    S("Véu da Morte", 8, "ataque", "Uma mortalha que amedronta e definha todos por perto."),
  ],
  "Arcanista": [
    S("Dilatação", 3, "utilidade", "O tempo se estica: você age com pressa sobrenatural."),
    S("Contramágica", 4, "defesa", "Anula a próxima magia inimiga antes que ela se forme."),
    S("Prisão Arcana", 6, "ataque", "Amarras místicas paralisam o alvo no lugar."),
    S("Reescrever o Instante", 8, "utilidade", "Desfaz o último golpe sofrido, como se não tivesse acontecido."),
  ],

  /* ---------------- LADINO ---------------- */
  "Assassino": [
    S("Lâmina Peçonhenta", 3, "ataque", "Unta a arma: o golpe envenena quem sangrar."),
    S("Bote Silencioso", 4, "ataque", "Ataque das sombras com dano multiplicado."),
    S("Marca Mortal", 5, "ataque", "Marca um alvo — todo dano contra ele aumenta."),
    S("Execução", 8, "ataque", "Contra alvo abaixo de metade da vida, o dano dobra."),
  ],
  "Batedor": [
    S("Passo de Sombra", 3, "utilidade", "Some de vista e reaparece onde quiser — fica furtivo."),
    S("Mira do Batedor", 4, "ataque", "Um disparo calculado que ignora a armadura."),
    S("Tocaia do Batedor", 5, "ataque", "Abre a luta com vantagem e dano extra."),
    S("Olho de Falcão", 7, "utilidade", "Vê a fraqueza de todos: o grupo ganha vantagem."),
  ],
  "Trapaceiro": [
    S("Bolso Furado", 3, "utilidade", "Rouba algo do alvo no meio da luta."),
    S("Areia nos Olhos", 3, "ataque", "Um punhado de terra cega o inimigo."),
    S("Escapada", 5, "defesa", "Sai de qualquer cerco ou agarrão sem sofrer nada."),
    S("Golpe Baixo", 7, "ataque", "Um ataque desonesto que atordoa e humilha."),
  ],

  /* ---------------- CLÉRIGO ---------------- */
  "Sacerdote": [
    S("Cura Maior", 4, "suporte", "Restaura muita vida de um aliado ferido."),
    S("Palavra de Alívio", 3, "suporte", "Limpa veneno, sangramento e medo de quem você tocar."),
    S("Aura de Vida", 6, "suporte", "O grupo inteiro recupera vida por alguns turnos."),
    S("Chamar de Volta", 8, "suporte", "Traz de volta um aliado caído com parte da vida."),
  ],
  "Paladino": [
    S("Golpe Consagrado", 4, "ataque", "A arma brilha: dano sagrado extra no impacto."),
    S("Escudo da Aurora", 4, "defesa", "Uma barreira de luz protege você e quem estiver perto."),
    S("Juramento Radiante", 6, "suporte", "O grupo fica abençoado enquanto o juramento durar."),
    S("Julgamento", 8, "ataque", "Luz que ofusca e queima todos os inimigos em cena."),
  ],
  "Inquisidor": [
    S("Marca do Ímpio", 3, "ataque", "Marca um herege: você acerta com vantagem contra ele."),
    S("Correntes Sagradas", 5, "ataque", "Amarras de luz prendem o alvo no lugar."),
    S("Interrogatório", 4, "utilidade", "O alvo não consegue mentir para você nesta cena."),
    S("Banimento", 8, "ataque", "Expulsa demônios e mortos-vivos de uma vez."),
  ],

  /* ---------------- CAÇADOR ---------------- */
  "Arqueiro": [
    S("Tiro Duplo", 3, "ataque", "Duas flechas no mesmo movimento."),
    S("Flecha Perfurante", 4, "ataque", "Atravessa a armadura e a carne atrás dela."),
    S("Chuva de Flechas", 6, "ataque", "Uma saraivada que atinge todos os inimigos."),
    S("Tiro do Fim", 8, "ataque", "Um único disparo, longo e certeiro, com dano brutal."),
  ],
  "Domador": [
    S("Chamado Selvagem", 4, "suporte", "Um animal aliado entra na luta ao seu lado."),
    S("Vínculo de Presa", 3, "suporte", "Você e sua fera atacam o mesmo alvo com vantagem."),
    S("Investida da Alcateia", 6, "ataque", "A matilha avança e derruba os inimigos."),
    S("Fera Ancestral", 8, "suporte", "Invoca um predador enorme por alguns turnos."),
  ],
  "Rastreador": [
    S("Farejar Presa", 3, "utilidade", "Sabe onde o alvo está, mesmo escondido ou distante."),
    S("Armadilha de Corda", 4, "ataque", "Prende o inimigo numa laçada bem colocada."),
    S("Terreno Conhecido", 5, "suporte", "O grupo se move sem penalidade e ganha vantagem no ermo."),
    S("Golpe do Predador", 7, "ataque", "Ataca a fraqueza estudada: dano pesado e sangramento."),
  ],

  /* ---------------- BARDO ---------------- */
  "Menestrel": [
    S("Canção de Ninar", 3, "ataque", "A melodia enfeitiça o inimigo, que baixa a guarda."),
    S("Refrão Curativo", 4, "suporte", "O grupo inteiro recupera vida ao ouvir."),
    S("Hino da Vitória", 6, "suporte", "Todos ficam inspirados e batem mais forte."),
    S("Ópera Final", 8, "suporte", "O grupo cura, ganha vantagem e o inimigo hesita."),
  ],
  "Cronista": [
    S("Ler a Cena", 3, "utilidade", "Revela uma verdade oculta do lugar ou da pessoa."),
    S("Citação Oportuna", 3, "suporte", "Um aliado refaz uma rolagem ruim."),
    S("Página Viva", 5, "utilidade", "Descobre a fraqueza de uma criatura como se a tivesse estudado."),
    S("Escrever o Feito", 8, "suporte", "Registra a façanha: o grupo inteiro fica abençoado."),
  ],
  "Encantador": [
    S("Sussurro Doce", 3, "ataque", "O alvo fica enfeitiçado e hesita em te atacar."),
    S("Ordem Irresistível", 5, "ataque", "O inimigo obedece a uma ordem curta e simples."),
    S("Máscara Social", 4, "utilidade", "Passa por outra pessoa numa conversa inteira."),
    S("Corte de Marionetes", 8, "ataque", "Domina a vontade de todos os inimigos por um instante."),
  ],

  /* ---------------- MONGE ---------------- */
  "Punho de Ferro": [
    S("Rajada de Golpes", 3, "ataque", "Uma sequência rápida de socos no mesmo alvo."),
    S("Palma Atordoante", 4, "ataque", "Um golpe seco que atordoa quem recebe."),
    S("Punho que Rompe", 5, "ataque", "Ignora a defesa do alvo neste ataque."),
    S("Punho da Montanha", 8, "ataque", "Um único impacto capaz de derrubar um gigante."),
  ],
  "Andarilho": [
    S("Passo do Vento", 3, "utilidade", "Move-se muito além do normal e fica apressado."),
    S("Dança das Sombras", 4, "defesa", "Esquiva do próximo ataque e reaparece atrás do inimigo."),
    S("Corrida Impossível", 5, "utilidade", "Atravessa a cena inteira sem ser tocado."),
    S("Cem Passos", 8, "ataque", "Atinge todos os inimigos em movimento, um após o outro."),
  ],
  "Asceta": [
    S("Corpo Sereno", 3, "defesa", "Limpa uma condição de si mesmo pela pura disciplina."),
    S("Mente Vazia", 4, "defesa", "Imune a medo e encantamento por alguns turnos."),
    S("Respiração de Ferro", 5, "defesa", "Reduz pela metade o dano do próximo golpe."),
    S("Vazio Perfeito", 8, "defesa", "Por um turno, nada te atinge."),
  ],

  /* ---------------- DRUIDA ---------------- */
  "Metamorfo": [
    S("Forma de Caça", 4, "ataque", "Assume forma de predador: garras que dilaceram."),
    S("Couro Selvagem", 3, "defesa", "A pele vira casca e couro — dano reduzido."),
    S("Forma Alada", 6, "utilidade", "Ganha asas e sai de qualquer cerco."),
    S("Fera Primordial", 8, "ataque", "A forma ancestral: enorme, furiosa e devastadora."),
  ],
  "Xamã": [
    S("Espírito Vigia", 4, "suporte", "Um espírito protege um aliado por alguns turnos."),
    S("Chamado do Trovão", 5, "ataque", "Um raio cai sobre o alvo e atordoa quem está perto."),
    S("Vozes Ancestrais", 4, "utilidade", "Os antepassados respondem uma pergunta sobre este lugar."),
    S("Tempestade Ancestral", 8, "ataque", "Vento e raio castigam todos os inimigos."),
  ],
  "Guardião": [
    S("Raízes Agarradoras", 3, "ataque", "Raízes prendem o inimigo no chão."),
    S("Bênção do Bosque", 4, "suporte", "O grupo recupera vida e resiste a veneno."),
    S("Muralha de Espinhos", 6, "defesa", "Uma barreira viva protege o grupo e fere quem cruza."),
    S("Ira da Floresta", 8, "ataque", "A mata inteira se volta contra os inimigos."),
  ],

  /* ---------------- FEITICEIRO ---------------- */
  "Linhagem Dracônica": [
    S("Sopro de Brasa", 4, "ataque", "Um bafo incandescente atinge todos à frente."),
    S("Escamas Ancestrais", 3, "defesa", "A pele vira escama: dano reduzido e resistência a fogo."),
    S("Asas de Cinza", 5, "utilidade", "Alça voo por alguns turnos, fora do alcance."),
    S("Presença Dracônica", 8, "ataque", "Um rugido que amedronta todos os inimigos em cena."),
  ],
  "Alma da Tempestade": [
    S("Toque Estático", 3, "ataque", "Descarga que atordoa o alvo."),
    S("Passo do Relâmpago", 4, "utilidade", "Move-se como um raio: fica apressado e sai de cercos."),
    S("Corrente Saltitante", 5, "ataque", "O raio salta de inimigo em inimigo."),
    S("Olho do Furacão", 8, "ataque", "Uma tempestade fechada castiga todos ao redor."),
  ],
  "Magia Selvagem": [
    S("Surto de Caos", 3, "ataque", "Um efeito imprevisível — poderoso e sem controle."),
    S("Sorte Torta", 4, "suporte", "Um aliado refaz a rolagem; um inimigo repete a dele."),
    S("Rajada Instável", 5, "ataque", "Dano forte em área, do jeito que a magia quiser."),
    S("Maré do Acaso", 8, "ataque", "O caos toma a cena: efeitos violentos em todos."),
  ],

  /* ---------------- BRUXO ---------------- */
  "Pacto Infernal": [
    S("Chama Contratual", 3, "ataque", "Fogo do pacto que queima e não apaga fácil."),
    S("Preço de Sangue", 4, "ataque", "Paga com a própria vida para dobrar o dano."),
    S("Marca do Contrato", 5, "ataque", "O alvo enfraquece enquanto a marca durar."),
    S("Cobrança de Alma", 8, "ataque", "Dreno devastador que fortalece você a cada baixa."),
  ],
  "Pacto Feérico": [
    S("Riso Enganoso", 3, "ataque", "O alvo fica enfeitiçado e ataca o lado errado."),
    S("Passo de Névoa", 4, "utilidade", "Some numa névoa e reaparece furtivo."),
    S("Espinhos do Bosque", 5, "ataque", "Vinhas prendem e ferem os inimigos."),
    S("Corte Radiante", 8, "suporte", "A corte feérica abençoa o grupo com vantagem e cura."),
  ],
  "Pacto do Abismo": [
    S("Sussurro do Vazio", 3, "ataque", "Palavras que amedrontam quem as escuta."),
    S("Tentáculo Insone", 4, "ataque", "Algo agarra o inimigo e não solta."),
    S("Olho que Não Dorme", 5, "utilidade", "Vê o que está oculto — e o que não deveria ser visto."),
    S("Boca do Abismo", 8, "ataque", "O vazio se abre e devora tudo à frente."),
  ],

  /* ---------------- ENGENHEIRO ---------------- */
  "Artilheiro": [
    S("Granada de Fragmentos", 4, "ataque", "Explosão que fere todos os inimigos próximos."),
    S("Tiro Calibrado", 3, "ataque", "Um disparo preciso que ignora cobertura."),
    S("Fumaça Cegante", 4, "ataque", "Uma cortina que cega os inimigos."),
    S("Bombardeio", 8, "ataque", "Uma sequência de explosões em toda a cena."),
  ],
  "Mecanista": [
    S("Autômato de Bolso", 4, "suporte", "Monta um servo mecânico que luta com você."),
    S("Torreta Improvisada", 5, "ataque", "Uma torre que atira sozinha por alguns turnos."),
    S("Reparo de Campo", 3, "suporte", "Conserta a si mesmo ou a um aliado ferido."),
    S("Engrenagem Viva", 8, "suporte", "Suas máquinas dobram de potência nesta luta."),
  ],
  "Alquimista de Campo": [
    S("Frasco Corrosivo", 3, "ataque", "Ácido que queima carne e armadura."),
    S("Elixir de Campo", 4, "suporte", "Prepara na hora um tônico que cura e fortalece um aliado."),
    S("Nuvem Tóxica", 5, "ataque", "Um gás que envenena todos os inimigos."),
    S("Mistura Instável", 8, "ataque", "Uma reação violenta e imprevisível de dano pesado."),
  ],

  /* ---------------- INVOCADOR ---------------- */
  "Mestre das Feras": [
    S("Chamado da Alcateia", 4, "suporte", "Espíritos animais lutam ao seu lado."),
    S("Presa Espiritual", 3, "ataque", "Uma fera espectral morde e dilacera o alvo."),
    S("Elo de Sangue", 5, "suporte", "Você e suas feras compartilham força e vantagem."),
    S("Colosso de Presa", 8, "ataque", "Invoca um predador colossal por alguns turnos."),
  ],
  "Conjurador Elemental": [
    S("Servo de Chama", 4, "suporte", "Um elemental de fogo entra na luta."),
    S("Punho de Terra", 5, "ataque", "Um golpe de rocha que atordoa o alvo."),
    S("Elemental Maior", 7, "suporte", "Convoca um elemental grande e obediente."),
    S("Pulso Primordial", 8, "ataque", "A terra e o fogo explodem sob todos os inimigos."),
  ],
  "Chamador de Espíritos": [
    S("Guia Ancestral", 3, "suporte", "Um espírito aconselha: vantagem na próxima rolagem do grupo."),
    S("Mão Fantasma", 4, "ataque", "Garras espectrais que amedrontam e ferem."),
    S("Corte Fantasma", 6, "suporte", "Vários espíritos lutam ao seu lado por alguns turnos."),
    S("Portal dos Mortos", 8, "ataque", "Os mortos atravessam e arrastam os inimigos."),
  ],
};

/* A árvore de uma subclasse, com o degrau (rank exigido) já calculado. */
export function habilidadesDaSubclasse(nomeSub) {
  const lista = SUBCLASSES[nomeSub];
  if (!lista) return [];
  return lista.map((h, i) => ({ ...h, nivel: DEGRAUS_SUBCLASSE[i] || 9, subclasse: nomeSub }));
}

export function subclasseDaHabilidade(nomeHab) {
  const alvo = String(nomeHab || "").toLowerCase();
  for (const [sub, lista] of Object.entries(SUBCLASSES)) {
    if (lista.some((h) => h.nome.toLowerCase() === alvo)) return sub;
  }
  return null;
}

/* Rank mínimo na classe para escolher a subclasse. Antes disso o herói ainda
   está aprendendo o básico — especializar cedo demais não faz sentido. */
export const RANK_PARA_SUBCLASSE = 3;
