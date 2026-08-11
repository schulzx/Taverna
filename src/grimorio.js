/* ============================================================
   GRIMÓRIO (v9.30) — as magias clássicas, com forma e alcance

   O jogo tinha 148 habilidades escritas à mão, e nenhuma delas sabia
   dizer QUANTA GENTE pegava. "Bola de Fogo" batia num alvo; "Chuva
   de Meteoros", num alvo; a diferença entre as duas era o número que
   saía no dado. Área era adjetivo na descrição — e adjetivo, neste
   projeto, é sempre o mesmo sintoma: a decisão volta para a IA.

   Faltava também o repertório. Um mago de mesa não tem só ataques:
   ele fala com os mortos, adivinha, voa, fica invisível, abre porta
   para o outro lado do continente. Nada disso existia como MECÂNICA,
   então nada disso acontecia sem o Mestre inventar na hora.

   Este arquivo resolve as duas coisas com uma estrutura só:

   1) GEOMETRIA. Toda magia declara FORMA (alvo, esfera, cone, linha,
      cubo, aura), RAIO em metros e ALCANCE em metros. O sistema
      converte isso em zonas de combate e responde sozinho quem foi
      pego — inclusive os seus. Bola de Fogo no meio da sala acerta o
      seu companheiro que está lá, e essa é a decisão que faltava.

   2) FUNÇÃO. Magia que faz algo que não é dano tem um verbo que o
      CÓDIGO entende: "portal" pula a viagem, "consulta" faz uma
      pergunta com regras ao outro lado, "voo" muda o que o terreno
      significa. O Mestre narra a manifestação; as regras são daqui.

   A PONTE METRO→ZONA. O combate da Taverna é por zonas nomeadas, não
   por grade — é o que deixa a tática caber numa frase em português.
   Mas magia de mesa vem em metros, e "1,5 km" precisa significar
   alguma coisa diferente de "6 m". A ponte é uma régua só: uma zona
   tem ~12 m de boca e as zonas estão a ~20 m uma da outra. Uma esfera
   de 6 m pega a zona onde caiu; uma de 30 m pega a vizinha também;
   uma de 300 m pega o campo inteiro. Chuva de Meteoros, com seus
   quatro focos de 12 m espalhados por 1,5 km, pega tudo que existe —
   que é exatamente o que ela faz na mesa.

   AS MAGIAS SÃO DA CLASSE DELAS. Cada entrada diz quais classes
   podem aprendê-la, e o resto do sistema (dado de dano, atributo,
   escola, elemento) continua saindo da classe, como já saía. O
   grimório não é um sistema paralelo: é mais folha na mesma árvore.
   ============================================================ */

/* ---------------- A RÉGUA ---------------- */
export const METROS_POR_ZONA = 12;     // a boca de uma zona
export const METROS_ENTRE_ZONAS = 20;  // de um centro ao outro

export const FORMAS = {
  alvo:      { id: "alvo",      nome: "alvo único",  icone: "🎯", desc: "uma criatura" },
  toque:     { id: "toque",     nome: "toque",       icone: "✋", desc: "precisa estar ao alcance da mão" },
  pessoal:   { id: "pessoal",   nome: "pessoal",     icone: "🧍", desc: "só em você" },
  esfera:    { id: "esfera",    nome: "esfera",      icone: "💥", desc: "estoura num ponto e pega tudo em volta" },
  cubo:      { id: "cubo",      nome: "cubo",        icone: "⬛", desc: "um volume fechado" },
  cilindro:  { id: "cilindro",  nome: "cilindro",    icone: "🛢", desc: "uma coluna que desce do alto" },
  cone:      { id: "cone",      nome: "cone",        icone: "📐", desc: "abre a partir de você" },
  linha:     { id: "linha",     nome: "linha",       icone: "➖", desc: "atravessa em reta" },
  aura:      { id: "aura",      nome: "aura",        icone: "🔆", desc: "acompanha você" },
  campo:     { id: "campo",     nome: "campo",       icone: "🌐", desc: "toma o lugar inteiro" },
};
export function formaDef(f) { return FORMAS[f] || FORMAS.alvo; }

/* Quantas zonas um efeito cobre, a partir do seu tamanho em metros.
   O piso é 1: nenhuma magia de área pega menos que a zona onde caiu. */
export function zonasCobertas(metros) {
  const m = Math.max(0, Number(metros) || 0);
  if (m <= METROS_POR_ZONA / 2) return 1;                       // até 6 m: só ali
  if (m <= METROS_ENTRE_ZONAS + METROS_POR_ZONA / 2) return 2;  // até 26 m: pega a vizinha
  if (m <= METROS_ENTRE_ZONAS * 2 + METROS_POR_ZONA / 2) return 3;
  return 99;                                                     // acima disso, o campo todo
}

/* ---------------- CÍRCULOS ----------------
   Nível de personagem e custo em PM saem do círculo, como no 5e sai do
   slot. Uma tabela só, e nada de número solto por magia: assim não dá
   para uma entrada nascer barata por descuido. */
export const NIVEL_DO_CIRCULO = [1, 1, 3, 5, 7, 9, 11, 13, 15, 17];
export const CUSTO_DO_CIRCULO = [0, 2, 3, 5, 7, 9, 11, 13, 15, 18];
export function nivelDoCirculo(c) { return NIVEL_DO_CIRCULO[Math.max(0, Math.min(9, c | 0))] || 1; }
export function custoDoCirculo(c) { return CUSTO_DO_CIRCULO[Math.max(0, Math.min(9, c | 0))] || 2; }

/* ---------------- O CATÁLOGO ----------------
   M(nome, círculo, classes, tipo, forma, raio, alcance, extra)
   raio/alcance em METROS. tipo casa com o que a ficha já usa:
   ataque | defesa | suporte | utilidade. */
const M = (nome, circulo, classes, tipo, forma, raio, alcance, extra = {}) => ({
  nome, circulo, classes, tipo, forma,
  raio: raio || 0, alcance: alcance || 0,
  /* FOCOS: quantos pontos de estouro separados a magia tem. Chuva de Meteoros
     são QUATRO esferas de 12 m que você posiciona onde quiser dentro de 1,6 km
     — cada uma é pequena, e é por isso que só o raio mentia sobre ela. Com
     três ou mais focos não sobra canto do campo, que é o que ela faz na mesa. */
  focos: extra.focos || 1,
  nivel: nivelDoCirculo(circulo),
  custo: extra.custo != null ? extra.custo : custoDoCirculo(circulo),
  duracao: extra.duracao || "instantânea",
  concentracao: !!extra.concentracao,
  ritual: !!extra.ritual,
  funcao: extra.funcao || "",
  descricao: extra.descricao || "",
  grimorio: true,
});

export const MAGIAS = [
  /* ---- CÍRCULO 1 ---- */
  M("Mísseis Mágicos", 1, ["Mago", "Feiticeiro"], "ataque", "alvo", 0, 36, { descricao: "Dardos de força que nunca erram — divida entre os alvos à vista." }),
  M("Palavra Curativa", 1, ["Clérigo", "Bardo", "Druida"], "suporte", "alvo", 0, 18, { funcao: "cura", descricao: "Uma palavra e a ferida fecha, mesmo do outro lado da sala." }),
  M("Curar Ferimentos", 1, ["Clérigo", "Druida", "Bardo"], "suporte", "toque", 0, 0, { funcao: "cura", descricao: "A mão na ferida, e ela se fecha." }),
  M("Escudo Arcano", 1, ["Mago", "Feiticeiro"], "defesa", "pessoal", 0, 0, { duracao: "1 rodada", descricao: "Um anteparo invisível some depois de aparar o golpe." }),
  M("Mãos Flamejantes", 1, ["Mago", "Feiticeiro"], "ataque", "cone", 5, 0, { descricao: "Um leque de fogo sai das pontas dos dedos." }),
  M("Onda Trovejante", 1, ["Mago", "Feiticeiro", "Druida", "Bardo"], "ataque", "cubo", 5, 0, { descricao: "Um estrondo empurra tudo para longe de você." }),
  M("Enfeitiçar Pessoa", 1, ["Bardo", "Bruxo", "Feiticeiro", "Mago"], "utilidade", "alvo", 0, 9, { concentracao: true, duracao: "1 hora", funcao: "encanto", descricao: "O alvo passa a te ver como amigo — e lembra disso quando passar." }),
  M("Sono", 1, ["Mago", "Bardo", "Feiticeiro"], "utilidade", "esfera", 6, 27, { duracao: "1 minuto", descricao: "Os mais fracos caem no sono onde estiverem." }),
  M("Detectar Magia", 1, ["Mago", "Clérigo", "Druida", "Bardo", "Feiticeiro", "Bruxo"], "utilidade", "aura", 9, 0, { ritual: true, concentracao: true, duracao: "10 minutos", funcao: "detectar", descricao: "O invisível fica visível: auras, encantos, portas seladas." }),
  M("Compreender Idiomas", 1, ["Mago", "Bardo", "Feiticeiro", "Bruxo"], "utilidade", "pessoal", 0, 0, { ritual: true, duracao: "1 hora", funcao: "idioma", descricao: "Toda língua falada ou escrita se abre para você." }),
  M("Identificar", 1, ["Mago", "Bardo"], "utilidade", "toque", 0, 0, { ritual: true, funcao: "identificar", descricao: "O objeto conta o que é e o que faz." }),
  M("Nevoeiro", 1, ["Druida", "Feiticeiro", "Mago"], "utilidade", "esfera", 6, 36, { concentracao: true, duracao: "1 hora", descricao: "Uma névoa espessa apaga a visão de todos dentro dela." }),
  M("Salto Longo", 1, ["Mago", "Druida", "Feiticeiro"], "utilidade", "toque", 0, 0, { duracao: "1 minuto", descricao: "As pernas triplicam o alcance de um pulo." }),
  M("Marca do Caçador", 1, ["Caçador", "Bruxo"], "ataque", "alvo", 0, 27, { concentracao: true, duracao: "1 hora", descricao: "A presa fica marcada: cada golpe seu nela dói mais." }),
  M("Bênção", 1, ["Clérigo"], "suporte", "alvo", 0, 9, { concentracao: true, duracao: "1 minuto", descricao: "Até três aliados acertam e resistem melhor." }),
  M("Escudo da Fé", 1, ["Clérigo"], "defesa", "alvo", 0, 18, { concentracao: true, duracao: "10 minutos", descricao: "Um brilho tênue endurece o ar em volta de quem você escolher." }),

  /* ---- CÍRCULO 2 ---- */
  M("Raio Ardente", 2, ["Mago", "Feiticeiro", "Bruxo"], "ataque", "alvo", 0, 36, { descricao: "Três feixes de fogo, um por alvo ou todos no mesmo." }),
  M("Imobilizar Pessoa", 2, ["Mago", "Clérigo", "Bardo", "Feiticeiro", "Bruxo"], "utilidade", "alvo", 0, 18, { concentracao: true, duracao: "1 minuto", descricao: "O corpo trava; a mente assiste." }),
  M("Invisibilidade", 2, ["Mago", "Bardo", "Feiticeiro", "Bruxo"], "utilidade", "toque", 0, 0, { concentracao: true, duracao: "1 hora", funcao: "invisibilidade", descricao: "Some da vista até atacar ou conjurar." }),
  M("Passo Nebuloso", 2, ["Mago", "Feiticeiro", "Bruxo"], "utilidade", "pessoal", 0, 9, { funcao: "salto_curto", descricao: "Um borrão de névoa e você está do outro lado." }),
  M("Restauração Menor", 2, ["Clérigo", "Druida", "Bardo"], "suporte", "toque", 0, 0, { funcao: "curar_condicao", descricao: "Tira uma doença, uma cegueira, um veneno, uma surdez." }),
  M("Localizar Objeto", 2, ["Mago", "Clérigo", "Druida", "Bardo"], "utilidade", "aura", 300, 0, { concentracao: true, duracao: "10 minutos", funcao: "localizar", descricao: "Sente a direção do que procura, se estiver a até 300 m." }),
  M("Ver o Invisível", 2, ["Mago", "Bardo", "Feiticeiro"], "utilidade", "pessoal", 0, 0, { duracao: "1 hora", funcao: "detectar", descricao: "O que se esconde e o que está no plano etéreo aparecem." }),
  M("Silêncio", 2, ["Clérigo", "Bardo"], "utilidade", "esfera", 6, 36, { ritual: true, concentracao: true, duracao: "10 minutos", descricao: "Nenhum som nasce ou entra na esfera — e nenhuma magia falada sai." }),
  M("Nuvem de Adagas", 2, ["Mago", "Bardo", "Feiticeiro"], "ataque", "cubo", 2, 18, { concentracao: true, duracao: "1 minuto", descricao: "Lâminas giram num ponto e picam quem ficar." }),
  M("Espiritual Arma", 2, ["Clérigo"], "ataque", "alvo", 0, 18, { duracao: "1 minuto", descricao: "Uma arma de luz flutua e golpeia por conta própria." }),
  M("Passo Aracnídeo", 2, ["Mago", "Feiticeiro", "Bruxo"], "utilidade", "toque", 0, 0, { concentracao: true, duracao: "1 hora", descricao: "Paredes e tetos viram chão." }),
  M("Enxame Sufocante", 2, ["Druida", "Bruxo"], "ataque", "cubo", 6, 18, { concentracao: true, duracao: "10 minutos", descricao: "Um enxame toma o espaço e não larga." }),

  /* ---- CÍRCULO 3 ---- */
  M("Bola de Fogo", 3, ["Mago", "Feiticeiro"], "ataque", "esfera", 6, 45, { descricao: "Uma bola do tamanho de um punho voa e estoura numa esfera de 6 m." }),
  M("Relâmpago", 3, ["Mago", "Feiticeiro"], "ataque", "linha", 30, 0, { descricao: "Uma linha de raio de 30 m atravessa tudo no caminho." }),
  M("Contramágica", 3, ["Mago", "Feiticeiro", "Bruxo"], "defesa", "alvo", 0, 18, { funcao: "contramagia", descricao: "Interrompe a magia do outro no meio da conjuração." }),
  M("Voo", 3, ["Mago", "Feiticeiro", "Bruxo"], "utilidade", "toque", 0, 0, { concentracao: true, duracao: "10 minutos", funcao: "voo", descricao: "Sai do chão e o terreno deixa de ser problema." }),
  M("Dissipar Magia", 3, ["Mago", "Clérigo", "Druida", "Bardo", "Feiticeiro", "Bruxo"], "utilidade", "alvo", 0, 36, { funcao: "dissipar", descricao: "Desfaz o encanto, a barreira, a maldição em curso." }),
  M("Reviver os Mortos", 3, ["Clérigo", "Bardo"], "suporte", "toque", 0, 0, { funcao: "reviver", descricao: "Traz de volta quem morreu há menos de um minuto, sem membro perdido." }),
  M("Falar com os Mortos", 3, ["Clérigo", "Bardo", "Bruxo"], "utilidade", "alvo", 0, 3, { duracao: "10 minutos", funcao: "consulta_mortos", descricao: "Um cadáver com boca responde CINCO perguntas — só o que sabia em vida, e sem obrigação de ser gentil." }),
  M("Clarividência", 3, ["Mago", "Clérigo", "Bardo", "Feiticeiro"], "utilidade", "pessoal", 0, 1600, { concentracao: true, duracao: "10 minutos", funcao: "vidente", descricao: "Vê ou ouve um lugar conhecido a até 1,6 km." }),
  M("Medo", 3, ["Mago", "Bardo", "Feiticeiro", "Bruxo"], "utilidade", "cone", 9, 0, { concentracao: true, duracao: "1 minuto", descricao: "Um cone de terror faz largar o que se tem na mão e correr." }),
  M("Nuvem Fétida", 3, ["Mago", "Bruxo"], "ataque", "esfera", 6, 27, { concentracao: true, duracao: "1 minuto", descricao: "Um gás verde toma a esfera e derruba quem respira." }),
  M("Tempestade de Granizo", 3, ["Druida", "Mago", "Feiticeiro"], "ataque", "cilindro", 6, 90, { descricao: "Uma coluna de gelo desaba do céu." }),
  M("Proteção contra Energia", 3, ["Clérigo", "Druida", "Mago", "Feiticeiro", "Caçador"], "defesa", "toque", 0, 0, { concentracao: true, duracao: "1 hora", descricao: "Um tipo de dano elemental passa a doer metade." }),
  M("Animar Mortos", 3, ["Mago", "Bruxo", "Clérigo"], "utilidade", "alvo", 0, 3, { funcao: "invocar", descricao: "Um cadáver se levanta e obedece por um dia." }),
  M("Luz do Dia", 3, ["Clérigo", "Druida", "Mago", "Feiticeiro", "Caçador"], "utilidade", "esfera", 18, 18, { duracao: "1 hora", funcao: "luz", descricao: "Luz de sol num raio de 18 m — e o que odeia o sol sente." }),

  /* ---- CÍRCULO 4 ---- */
  M("Muralha de Fogo", 4, ["Mago", "Druida", "Feiticeiro"], "ataque", "linha", 18, 36, { concentracao: true, duracao: "1 minuto", descricao: "Uma parede de chamas de 18 m divide o campo em dois." }),
  M("Tempestade de Gelo", 4, ["Mago", "Druida", "Feiticeiro"], "ataque", "cilindro", 6, 90, { descricao: "Pedras de gelo caem numa coluna e deixam o chão traiçoeiro." }),
  M("Porta Dimensional", 4, ["Mago", "Feiticeiro", "Bruxo"], "utilidade", "pessoal", 0, 150, { funcao: "portal_curto", descricao: "Uma porta invisível liga dois pontos a até 150 m — você e mais um passam." }),
  M("Invisibilidade Maior", 4, ["Mago", "Bardo", "Feiticeiro"], "utilidade", "toque", 0, 0, { concentracao: true, duracao: "1 minuto", funcao: "invisibilidade", descricao: "Some e continua sumido mesmo atacando." }),
  M("Polimorfia", 4, ["Mago", "Druida", "Bardo", "Feiticeiro"], "utilidade", "alvo", 0, 18, { concentracao: true, duracao: "1 hora", funcao: "transformar", descricao: "O alvo vira uma criatura — e volta ao que era quando os PV acabarem." }),
  M("Banimento", 4, ["Clérigo", "Mago", "Feiticeiro", "Bruxo"], "utilidade", "alvo", 0, 18, { concentracao: true, duracao: "1 minuto", descricao: "Manda o alvo para outro plano enquanto durar." }),
  M("Adivinhação", 4, ["Clérigo", "Druida"], "utilidade", "pessoal", 0, 0, { ritual: true, funcao: "consulta_oraculo", descricao: "Uma pergunta sobre um objetivo dos próximos sete dias — resposta curta e obscura." }),
  M("Olho Arcano", 4, ["Mago"], "utilidade", "pessoal", 0, 9, { concentracao: true, duracao: "1 hora", funcao: "vidente", descricao: "Um olho invisível voa e vê por você." }),
  M("Pele de Pedra", 4, ["Druida", "Mago", "Caçador"], "defesa", "toque", 0, 0, { concentracao: true, duracao: "1 hora", descricao: "A pele endurece e o aço comum passa a machucar metade." }),

  /* ---- CÍRCULO 5 ---- */
  M("Nuvem Mortal", 5, ["Mago", "Feiticeiro"], "ataque", "esfera", 6, 36, { concentracao: true, duracao: "10 minutos", descricao: "Um vapor amarelo e pesado desce e mata devagar." }),
  M("Cone de Frio", 5, ["Mago", "Feiticeiro"], "ataque", "cone", 18, 0, { descricao: "Um cone de 18 m congela tudo que apanhar." }),
  M("Círculo de Teleporte", 5, ["Mago", "Bardo"], "utilidade", "pessoal", 0, 0, { funcao: "portal", duracao: "1 rodada", descricao: "Desenha um portal permanente para um círculo que você conhece — a viagem inteira vira um passo." }),
  M("Erguer os Mortos", 5, ["Clérigo", "Bardo"], "suporte", "toque", 0, 0, { funcao: "reviver", descricao: "Traz de volta quem morreu há até dez dias." }),
  M("Contatar Outro Plano", 5, ["Mago", "Bruxo"], "utilidade", "pessoal", 0, 0, { ritual: true, funcao: "consulta_plano", descricao: "Pergunta a algo que não deveria ser perguntado — e paga se a mente não aguentar." }),
  M("Dominar Pessoa", 5, ["Mago", "Bardo", "Feiticeiro"], "utilidade", "alvo", 0, 18, { concentracao: true, duracao: "1 hora", descricao: "O alvo obedece — e sabe que obedeceu." }),
  M("Restauração Maior", 5, ["Clérigo", "Druida", "Bardo"], "suporte", "toque", 0, 0, { funcao: "curar_condicao", descricao: "Levanta uma maldição, um nível de exaustão, uma petrificação." }),
  M("Comunhão", 5, ["Clérigo"], "utilidade", "pessoal", 0, 0, { ritual: true, funcao: "consulta_oraculo", descricao: "Três perguntas de sim ou não ao que você serve." }),
  M("Muralha de Pedra", 5, ["Druida", "Mago", "Feiticeiro"], "defesa", "linha", 30, 36, { concentracao: true, duracao: "10 minutos", descricao: "Pedra sobe do chão e fecha o caminho." }),

  /* ---- CÍRCULO 6 ---- */
  M("Desintegrar", 6, ["Mago", "Feiticeiro"], "ataque", "alvo", 0, 18, { descricao: "Um feixe fino, e o que sobra é pó." }),
  M("Corrente de Relâmpagos", 6, ["Mago", "Feiticeiro"], "ataque", "esfera", 9, 45, { descricao: "Um raio salta do alvo para mais três em volta." }),
  M("Circulo da Morte", 6, ["Mago", "Feiticeiro", "Bruxo"], "ataque", "esfera", 18, 45, { descricao: "Uma esfera negra de 18 m suga a vida de tudo dentro." }),
  M("Globo de Invulnerabilidade", 6, ["Mago", "Feiticeiro"], "defesa", "esfera", 3, 0, { concentracao: true, duracao: "1 minuto", descricao: "Uma cúpula que magia pequena não atravessa." }),
  M("Vidência", 6, ["Bardo", "Clérigo", "Druida", "Mago", "Bruxo"], "utilidade", "pessoal", 0, 0, { concentracao: true, duracao: "10 minutos", funcao: "vidente", descricao: "Vê e ouve uma criatura em qualquer lugar do mundo, se ela falhar em resistir." }),
  M("Curar em Massa", 6, ["Clérigo", "Bardo", "Druida"], "suporte", "esfera", 9, 18, { funcao: "cura", descricao: "Até seis aliados numa esfera de 9 m fecham as feridas de uma vez." }),
  M("Carne em Pedra", 6, ["Mago", "Druida", "Bruxo"], "utilidade", "alvo", 0, 18, { concentracao: true, duracao: "1 minuto", descricao: "O corpo endurece até virar estátua." }),

  /* ---- CÍRCULO 7 ---- */
  M("Teleporte", 7, ["Mago", "Bardo", "Feiticeiro"], "utilidade", "pessoal", 0, 0, { funcao: "portal", descricao: "Você e até oito companheiros aparecem num lugar que você conhece, a qualquer distância. Lugar mal conhecido erra o alvo." }),
  M("Dedo da Morte", 7, ["Mago", "Feiticeiro", "Bruxo"], "ataque", "alvo", 0, 18, { descricao: "Um dedo apontado, e a carne apodrece por dentro." }),
  M("Esfera Prismática", 7, ["Mago"], "defesa", "esfera", 3, 0, { duracao: "10 minutos", descricao: "Sete camadas de cor, cada uma com o seu jeito de matar quem tocar." }),
  M("Tempestade de Fogo", 7, ["Clérigo", "Druida", "Feiticeiro"], "ataque", "cubo", 12, 45, { descricao: "Colunas de fogo brotam onde você quiser, num volume que você desenha." }),
  M("Reversão Etérea", 7, ["Bardo", "Clérigo", "Mago", "Bruxo"], "utilidade", "pessoal", 0, 0, { concentracao: true, duracao: "8 horas", funcao: "planar", descricao: "Entra no plano etéreo e atravessa o que é sólido." }),

  /* ---- CÍRCULO 8 ---- */
  M("Palavra de Poder: Atordoar", 8, ["Bardo", "Feiticeiro", "Mago", "Bruxo"], "utilidade", "alvo", 0, 18, { descricao: "Uma sílaba, e o alvo perde o corpo por alguns instantes." }),
  M("Terremoto", 8, ["Clérigo", "Druida", "Feiticeiro"], "ataque", "esfera", 30, 150, { concentracao: true, duracao: "1 minuto", descricao: "O chão se abre num círculo de 30 m — e o que estava de pé deixa de estar." }),
  M("Nuvem Incendiária", 8, ["Mago", "Feiticeiro"], "ataque", "esfera", 6, 45, { concentracao: true, duracao: "1 minuto", descricao: "Uma nuvem de fumaça e brasa que caminha sozinha a cada rodada." }),
  M("Dominar Monstro", 8, ["Bardo", "Feiticeiro", "Mago", "Bruxo"], "utilidade", "alvo", 0, 18, { concentracao: true, duracao: "1 hora", descricao: "Qualquer coisa viva passa a obedecer." }),
  M("Clone", 8, ["Mago"], "utilidade", "toque", 0, 0, { funcao: "clone", descricao: "Um corpo de reserva cresce numa cuba. Quando você morrer, acorda nele." }),

  /* ---- CÍRCULO 9 ---- */
  M("Chuva de Meteoros", 9, ["Mago", "Feiticeiro"], "ataque", "esfera", 12, 1600, { focos: 4, descricao: "Quatro pedras em chamas caem de até 1,6 km e estouram em esferas de 12 m — o campo inteiro deixa de existir." }),
  M("Desejo", 9, ["Mago", "Feiticeiro"], "utilidade", "pessoal", 0, 0, { funcao: "desejo", descricao: "A realidade obedece uma vez. E cobra." }),
  M("Parar o Tempo", 9, ["Mago", "Feiticeiro"], "utilidade", "pessoal", 0, 0, { funcao: "tempo", descricao: "O mundo congela e você tem algumas rodadas só suas." }),
  M("Portal Verdadeiro", 9, ["Clérigo", "Mago", "Bruxo"], "utilidade", "pessoal", 0, 0, { funcao: "portal", descricao: "Um rasgo permanente entre dois lugares do mundo, ou entre dois planos." }),
  M("Ressurreição Verdadeira", 9, ["Clérigo", "Druida"], "suporte", "toque", 0, 0, { funcao: "reviver", descricao: "Traz de volta quem morreu há até duzentos anos, inteiro." }),
  M("Palavra de Poder: Matar", 9, ["Bardo", "Feiticeiro", "Mago", "Bruxo"], "ataque", "alvo", 0, 18, { descricao: "Uma palavra. Se o alvo estiver ferido o bastante, ele simplesmente para." }),
  M("Prisão", 9, ["Mago", "Bruxo"], "utilidade", "alvo", 0, 9, { funcao: "prisao", descricao: "Guarda uma criatura fora do mundo até alguém dizer a palavra certa." }),
  M("Presságio", 9, ["Clérigo", "Mago"], "utilidade", "pessoal", 0, 0, { funcao: "consulta_oraculo", descricao: "Vê o que ainda não aconteceu, do jeito que profecia se deixa ver." }),
];

/* ---------------- BUSCA ---------------- */
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export function magiaPorNome(nome) {
  const a = norm(nome);
  return MAGIAS.find((m) => norm(m.nome) === a) || null;
}
export function ehMagiaDoGrimorio(nome) { return !!magiaPorNome(nome); }

/* Quais magias uma classe pode aprender neste nível. Mesma assinatura de
   `habilidadesDisponiveis` para entrar sem atrito na ficha. */
export function magiasDisponiveis(classeNome, nivel, jaTem = []) {
  const nomes = new Set((jaTem || []).map((h) => norm(typeof h === "string" ? h : h && h.nome)));
  return MAGIAS.filter((m) => m.classes.includes(classeNome) && m.nivel <= (nivel || 1) && !nomes.has(norm(m.nome)));
}
export function classesDaMagia(nome) { const m = magiaPorNome(nome); return m ? m.classes : []; }

/* ---------------- A GEOMETRIA DE QUALQUER HABILIDADE ----------------
   Magia catalogada devolve a forma declarada. Para as 148 habilidades
   escritas antes deste arquivo, a forma sai do texto — o mesmo recurso
   que combos.js usa para achar fogo e gelo sem etiquetar tudo à mão. */
/* A palavra EXPLÍCITA de forma ganha da implícita: "sopro" sugere cone, mas
   "causa dano em área em linha" diz linha com todas as letras, e o que está
   escrito vale mais que o que está sugerido. */
const RX_CONE = /\b(cone|em leque|em arco)\b/i;
const RX_CONE_FRACO = /(sopro|baforada|leque)/i;
const RX_LINHA = /(\blinha\b|em reta|perfura(ndo)?|atravessa|feixe reto)/i;
const RX_AREA = /(em area|em área|todos os inimigos|todos ao redor|em volta|ao seu redor|toda a sala|todos os alvos|chuva de|explos|estoura|onda de|irradia)/i;
const RX_AURA = /(aura|campo ao redor|em torno de voce|em torno de você|todos os aliados)/i;

export function geometriaDe(hab) {
  const nome = typeof hab === "string" ? hab : (hab && hab.nome) || "";
  const m = magiaPorNome(nome);
  if (m) return { forma: m.forma, raio: m.raio, alcance: m.alcance, focos: m.focos || 1, doCatalogo: true };
  const txt = `${nome} ${(hab && hab.descricao) || ""}`;
  const g = (forma, raio, alcance) => ({ forma, raio, alcance, focos: 1, doCatalogo: false });
  if (RX_CONE.test(txt)) return g("cone", 9, 0);
  if (RX_LINHA.test(txt)) return g("linha", 18, 0);
  if (RX_CONE_FRACO.test(txt)) return g("cone", 9, 0);
  if (RX_AURA.test(txt)) return g("aura", 6, 0);
  if (RX_AREA.test(txt)) return g("esfera", 6, 18);
  return g("alvo", 0, 18);
}

export function ehArea(hab) {
  const g = geometriaDe(hab);
  return g.forma !== "alvo" && g.forma !== "toque" && g.forma !== "pessoal";
}

/* ---------------- QUEM O EFEITO PEGA ----------------
   Devolve os índices de ZONA cobertos. Cone e linha saem de VOCÊ na
   direção do alvo; esfera, cubo e cilindro caem no ALVO; aura fica em
   você. É a diferença que decide se o seu companheiro apanha junto. */
export function zonasAtingidas(geo, { totalZonas = 3, zonaHeroi = 0, zonaAlvo = 0 } = {}) {
  const g = geo || { forma: "alvo", raio: 0 };
  const dentro = (z) => z >= 0 && z < totalZonas;
  const todas = () => Array.from({ length: totalZonas }, (_, i) => i);
  if (g.forma === "pessoal") return [zonaHeroi].filter(dentro);
  if (g.forma === "alvo" || g.forma === "toque") return [zonaAlvo].filter(dentro);
  if (g.forma === "campo") return todas();

  /* cada foco extra vale uma zona a mais de cobertura: quem pode escolher
     quatro pontos de queda não deixa ninguém de fora */
  const focos = Math.max(1, g.focos || 1);
  const largura = focos >= 3 ? 99 : zonasCobertas(g.raio) + (focos - 1);
  if (largura >= 99) return todas();

  if (g.forma === "aura") {
    const out = [];
    for (let d = 0; d < largura; d++) { if (dentro(zonaHeroi - d)) out.push(zonaHeroi - d); if (d && dentro(zonaHeroi + d)) out.push(zonaHeroi + d); }
    return [...new Set(out)].sort((a, b) => a - b);
  }
  if (g.forma === "cone" || g.forma === "linha") {
    /* saem de você e vão NA DIREÇÃO do alvo: sem direção (alvo na sua
       própria zona), abrem para a frente */
    const passo = zonaAlvo === zonaHeroi ? 1 : Math.sign(zonaAlvo - zonaHeroi);
    const out = [];
    for (let k = 0; k < largura; k++) { const z = zonaHeroi + passo * k; if (dentro(z)) out.push(z); }
    return out.length ? out : [zonaHeroi].filter(dentro);
  }
  /* esfera, cubo, cilindro: centram no ALVO */
  const raioZonas = largura - 1;
  const out = [];
  for (let d = -raioZonas; d <= raioZonas; d++) if (dentro(zonaAlvo + d)) out.push(zonaAlvo + d);
  return out;
}

/* Quem apanha, de verdade. Inimigos vivos nas zonas cobertas — e os
   ALIADOS que estiverem lá também, que é a decisão que faltava: soltar
   a bola de fogo na sala em que o seu companheiro está tem preço.

   O herói fica de fora por escolha: ele é quem mira, e transformar o
   próprio jogador em vítima do próprio botão viraria pegadinha, não
   decisão. Os companheiros, esses ele escolheu pôr ali. */
export function alvosDaArea({ hab, totalZonas = 3, zonaHeroi = 0, zonaAlvo = 0, inimigos = [], aliados = [] } = {}) {
  const geo = geometriaDe(hab);
  const zonas = zonasAtingidas(geo, { totalZonas, zonaHeroi, zonaAlvo });
  const set = new Set(zonas);
  const vivos = (inimigos || []).filter((e) => e && !e.derrotado && (e.vida || 0) > 0);
  const pegos = geo.forma === "alvo" || geo.forma === "toque"
    ? vivos.filter((e) => (e.zona ?? 0) === zonaAlvo).slice(0, 1)
    : vivos.filter((e) => set.has(e.zona ?? 0));
  const amigos = (geo.forma === "alvo" || geo.forma === "toque" || geo.forma === "aura" || geo.forma === "pessoal")
    ? []
    : (aliados || []).filter((a) => a && (a.vida || 0) > 0 && set.has(a.zona ?? zonaHeroi));
  return { geo, zonas, inimigos: pegos, aliados: amigos };
}

/* ---------------- O PORTAL: PULAR A ESTRADA ----------------
   A viagem é um sistema inteiro — clima, encontros, marcha, suprimentos — e
   pular tudo isso precisa ser PRÊMIO, não atalho. Por isso o portal não é uma
   magia: são três, em degraus, e cada degrau compra mais liberdade.

   Círculo 5 (Círculo de Teleporte): só para cidade da SUA facção. Um círculo
   permanente exige um lugar que é seu — quem não governa nada não tem para
   onde ir. Círculo 7 (Teleporte): qualquer lugar que você conheça, com risco
   de errar o alvo, como na mesa. Círculo 9 (Portal Verdadeiro): sem risco.

   O que NÃO se compra em degrau nenhum: destino que o herói nunca ouviu
   falar. Teleportar para um nome que ele não conhece seria o mapa entregando
   o mundo de graça — e a névoa existe justamente para isso não acontecer. */
export const CHANCE_PERCALCO = 0.15;

export function resolverPortal({ magia, destino, cidades = [], cidadeAtual = "", faccaoJogador = "", rnd = Math.random } = {}) {
  const m = typeof magia === "string" ? magiaPorNome(magia) : magia;
  if (!m || m.funcao !== "portal") return { ok: false, motivo: "essa magia não abre passagem" };
  const alvo = String(destino || "").trim();
  if (!alvo) return { ok: false, motivo: "para onde? diga o nome do lugar" };
  const conhecidas = (cidades || []).filter((c) => c && c.descoberta !== false);
  const c = conhecidas.find((x) => norm(x.nome) === norm(alvo));
  if (!c) return { ok: false, motivo: `você não conhece ${alvo} o bastante para fixar o destino` };
  if (norm(c.nome) === norm(cidadeAtual)) return { ok: false, motivo: "você já está aqui" };

  if (m.circulo <= 5) {
    const seu = c.relacao === "jogador" || (faccaoJogador && norm(c.faccao) === norm(faccaoJogador));
    if (!seu) return { ok: false, motivo: `${m.nome} só liga círculos em terra da sua facção — e ${c.nome} não é sua` };
    return { ok: true, destino: c.nome, percalco: null, horas: 0 };
  }
  /* Teleporte erra às vezes. Portal Verdadeiro, nunca — é para isso que ele
     custa dois círculos a mais. */
  if (m.circulo >= 9 || rnd() >= CHANCE_PERCALCO) return { ok: true, destino: c.nome, percalco: null, horas: 0 };
  const outras = conhecidas.filter((x) => norm(x.nome) !== norm(c.nome) && norm(x.nome) !== norm(cidadeAtual));
  const parar = outras.length ? outras[Math.floor(rnd() * outras.length)] : c;
  return {
    ok: true, destino: parar.nome, horas: 12,
    percalco: parar.nome === c.nome
      ? "a passagem resistiu e cuspiu o grupo de volta no mesmo lugar, meio dia depois"
      : `a passagem torceu e abriu em ${parar.nome}, não em ${c.nome}`,
  };
}

export function envelopeDoPortal(m, de, para, percalco) {
  return `[PORTAL — RESOLVIDO PELO SISTEMA] Eu conjurei "${m.nome}" e a passagem me tirou de ${de || "onde eu estava"} e me pôs em ${para}. Isso é fato consumado: a viagem NÃO aconteceu, não houve estrada, encontro nem dias de marcha, e eu estou em ${para} agora.${percalco ? ` MAS ${percalco} — narre o susto e o preço, sem desfazer o resultado.` : ""} Narre a abertura e a travessia em duas ou três frases — o que se vê do outro lado, quem estava lá para ver — e me devolva a palavra em ${para}.`;
}

/* ---------------- AS FUNÇÕES QUE O CÓDIGO EXECUTA (v9.31) ----------------
   Declarar `funcao` já era melhor que adjetivo, mas ainda dependia do Mestre
   narrar dentro da regra. Estas são as que o sistema resolve sozinho.

   O critério para uma função entrar aqui é o de sempre: o código precisa
   conseguir CONFERIR o resultado. "Identificar" cabe, porque a ficha do item
   está na mão. "Desejo" não cabe, e continua sendo envelope — a realidade
   obedecendo uma vez é exatamente o tipo de coisa que só a ficção resolve. */

/* FALAR COM OS MORTOS: cinco perguntas, e a contagem é do sistema. Era isso
   que faltava — sem contador, "cinco perguntas" virava conversa livre. */
export const PERGUNTAS_AOS_MORTOS = 5;

export function abrirInterrogatorio(morto, dia = 0) {
  return { quem: String(morto || "").slice(0, 60), restam: PERGUNTAS_AOS_MORTOS, feitas: [], dia };
}
export function perguntarAoMorto(sessao, pergunta) {
  const s = sessao && typeof sessao === "object" ? sessao : null;
  if (!s) return { ok: false, motivo: "não há ninguém escutando do outro lado" };
  if ((s.restam || 0) <= 0) return { ok: false, motivo: "o cadáver já respondeu as cinco perguntas e volta ao silêncio" };
  const q = String(pergunta || "").trim();
  if (q.length < 4) return { ok: false, motivo: "pergunte alguma coisa" };
  const nova = { ...s, restam: s.restam - 1, feitas: [...(s.feitas || []), q.slice(0, 160)] };
  return { ok: true, sessao: nova, restam: nova.restam, pergunta: q.slice(0, 160) };
}
export function envelopeDoMorto(sessao, pergunta) {
  return `[FALAR COM OS MORTOS — REGRAS APLICADAS PELO SISTEMA] Eu perguntei ao cadáver de ${sessao.quem || "alguém"}: "${pergunta}". Restam ${sessao.restam} pergunta(s) depois desta — o sistema conta, você não.
REGRAS DA MAGIA, sem exceção: (1) ele responde SÓ o que sabia EM VIDA; do que aconteceu depois da morte dele, não sabe nada, nem sobre quem o matou se não viu. (2) Ele não é obrigado a ser prestativo: responde curto, enviesado, às vezes evasivo, do jeito de quem foi arrancado do descanso. (3) Ele NÃO é onisciente e não adivinha o futuro. (4) Se a resposta honesta é "não sei", diga "não sei" — inventar é pior que o silêncio.
Responda em uma ou duas frases, na voz dele.`;
}

/* IDENTIFICAR: a única magia do catálogo que o sistema resolve inteira, sem o
   Mestre — a ficha do objeto já está no save; o que faltava era mostrá-la. */
export function textoDeIdentificacao(item) {
  if (!item) return null;
  const it = typeof item === "string" ? { nome: item } : item;
  const linhas = [`🔎 ${it.nome}${it.raridade ? ` · ${it.raridade}` : ""}`];
  if (it.tipo) linhas.push(`tipo: ${it.tipo}`);
  const atr = it.atributos && Object.entries(it.atributos).filter(([, v]) => v);
  if (atr && atr.length) linhas.push(`atributos: ${atr.map(([k, v]) => `${k} ${v > 0 ? "+" : ""}${v}`).join(", ")}`);
  if (it.dano) linhas.push(`dano: ${it.dano}`);
  if (it.defesa) linhas.push(`defesa: ${it.defesa}`);
  if (it.poder) linhas.push(`poder: ${it.poder}`);
  if (it.resistencias) linhas.push(`resiste a: ${[].concat(it.resistencias).join(", ")}`);
  if (it.descricao) linhas.push(it.descricao);
  return linhas.join(" · ");
}

/* LOCALIZAR OBJETO: direção e distância saem do mapa, não do palpite. O
   alcance da magia é lei — o que estiver além some do resultado, e é isso que
   impede a magia de virar um GPS do continente inteiro. */
export function localizarNoMapa(alvo, { cidades = [], cidadeAtual = "", alcanceM = 300 } = {}) {
  const aqui = (cidades || []).find((c) => norm(c.nome) === norm(cidadeAtual));
  const c = (cidades || []).find((x) => x && x.descoberta !== false && norm(x.nome).includes(norm(alvo)));
  if (!c) return { achou: false, motivo: "nada que você conheça responde a esse nome" };
  if (!aqui) return { achou: true, alvo: c.nome, direcao: "", km: null, dentroDoAlcance: false };
  const dx = c.x - aqui.x, dy = c.y - aqui.y;
  const km = Math.round(Math.sqrt(dx * dx + dy * dy) * 25);
  const dir = [dy < -3 ? "norte" : dy > 3 ? "sul" : "", dx > 3 ? "leste" : dx < -3 ? "oeste" : ""].filter(Boolean).join("-") || "bem perto";
  return { achou: true, alvo: c.nome, direcao: dir, km, dentroDoAlcance: km * 1000 <= alcanceM };
}

/* O QUE UMA FUNÇÃO FAZ, EM UMA PALAVRA — o despachante do App usa isto para
   saber se resolve por código ou se manda envelope. */
export const FUNCOES_DO_SISTEMA = new Set([
  "cura", "curar_condicao", "reviver", "identificar", "localizar",
  "consulta_mortos", "consulta_oraculo", "invisibilidade", "voo", "luz", "portal",
]);
export function resolvidaPeloSistema(m) {
  return !!(m && m.funcao && FUNCOES_DO_SISTEMA.has(m.funcao));
}

/* ---------------- O QUE O MESTRE RECEBE ---------------- */
export function fichaDaMagiaTexto(m) {
  if (!m) return "";
  const f = formaDef(m.forma);
  const tam = m.raio ? ` ${m.raio} m` : "";
  const alc = m.alcance ? `alcance ${m.alcance >= 1000 ? `${(m.alcance / 1000).toFixed(1)} km` : `${m.alcance} m`}` : "em você ou ao toque";
  return `${m.nome} (${m.circulo}º círculo · ${m.custo} PM) — ${f.nome}${tam}, ${alc}${m.concentracao ? " · concentração" : ""}${m.ritual ? " · ritual" : ""}. ${m.descricao}`;
}

export function resumoGrimorioPrompt(pers) {
  const tem = ((pers && pers.habilidades) || []).map((h) => magiaPorNome(typeof h === "string" ? h : h && h.nome)).filter(Boolean);
  if (!tem.length) return "";
  const areas = tem.filter((m) => m.forma !== "alvo" && m.forma !== "toque" && m.forma !== "pessoal");
  return `GRIMÓRIO (magias catalogadas na minha ficha — forma e alcance são FATO do sistema, não estimativa sua):
${tem.slice(0, 14).map((m) => `- ${fichaDaMagiaTexto(m)}`).join("\n")}
${areas.length ? `Quando eu uso uma dessas de ÁREA, o sistema já decidiu quem foi pego (inclusive os meus companheiros, se estavam lá) e te manda a lista pronta. Narre exatamente essa lista: não acrescente atingido, não poupe ninguém e não mude o tamanho do efeito.` : ""}`;
}

export const GRIMORIO_PROMPT = `MAGIAS (v9.30): as magias do grimório têm FORMA (alvo, esfera, cone, linha, cubo, aura), RAIO e ALCANCE em metros, e o sistema resolve com isso quem está dentro do efeito. Você nunca decide o tamanho de uma área nem quem ela pegou — isso chega pronto. Descreva o que a forma faz no lugar (a esfera que engole a sala, a linha que abre um corredor de fumaça), e respeite o alcance: magia de toque não acerta quem está do outro lado do salão.`;
