/* ============================================================
   ANTECEDENTES — Taverna
   Quem o herói era ANTES da aventura. Escolhido na criação:
   dá um gancho de história (o Mestre tece na ficção) + um
   pequeno bônus aplicado POR CÓDIGO (item, moedas, PV ou PM).
   A IA não calcula nada — só recebe o gancho na ficha.
   ============================================================ */

export const ANTECEDENTES = [
  {
    id: "orfao", nome: "Órfão da Estrada", icone: "🛤",
    desc: "Cresceu sem lar, trocando trabalho por comida. Aprendeu a ler pessoas e a nunca depender de ninguém.",
    gancho: "Busca pistas da família que perdeu — qualquer nome parecido acende uma esperança perigosa.",
    item: "Faca herdada (única lembrança da família)",
  },
  {
    id: "soldado", nome: "Soldado Reformado", icone: "🎖",
    desc: "Anos de caserna, marchas e uma guerra que não deveria ter acontecido. Saiu com o corpo inteiro — a alma, nem tanto.",
    gancho: "Carrega uma ordem que desobedeceu (ou obedeceu) e que ainda o assombra; antigos companheiros de armas aparecem.",
    item: "Distintivo do antigo regimento", pv: 2,
  },
  {
    id: "nobre_caido", nome: "Sangue Nobre Caído", icone: "👑",
    desc: "Nasceu entre seda e criados — até a família perder tudo. Guarda os modos, o orgulho e o que sobrou do cofre.",
    gancho: "O nome da família ainda abre portas — e atrai credores, rivais e antigos aliados cobrando promessas.",
    moedas: 25,
  },
  {
    id: "erudito", nome: "Erudito de Arquivo", icone: "📚",
    desc: "Passou a juventude entre livros empoeirados, traduzindo o que ninguém mais conseguia ler.",
    gancho: "Leu algo que não deveria — um texto proibido que menciona um lugar, e o lugar pode ser real.",
    item: "Caderno de anotações cifradas", pm: 2,
  },
  {
    id: "ladrao", nome: "Filho da Guilda dos Dedos", icone: "🗝",
    desc: "Cresceu nos becos sob a proteção (e a cobrança) da guilda dos ladrões. Sabe onde tudo se esconde.",
    gancho: "A guilda considera que ele(a) deve favores — e um dia cobra, na pior hora possível.",
    item: "Gazua de osso (presente de despedida)", moedas: 10,
  },
  {
    id: "acolito", nome: "Acólito Fugitivo", icone: "🕯",
    desc: "Foi criado para servir a um templo. Um dia duvidou — e duvidar ali era crime.",
    gancho: "A ordem não esquece seus fugitivos; irmãos de fé podem aparecer para trazê-lo(a) de volta — ou julgá-lo(a).",
    item: "Símbolo sagrado riscado", pm: 2,
  },
  {
    id: "pragado", nome: "Sobrevivente da Praga", icone: "🩸",
    desc: "A febre levou a vila inteira. Sobrou só ele(a) — e ninguém sabe explicar por quê.",
    gancho: "Há quem o(a) tema como amaldiçoado(a) e quem o(a) cace como chave da cura.",
    pv: 2,
  },
  {
    id: "artista", nome: "Artista Itinerante", icone: "🎻",
    desc: "Viveu de palco em palco, de taverna em taverna. Conhece todas as canções — e metade dos segredos delas.",
    gancho: "Uma de suas canções fala de um tesouro real; colecionadores e bardos rivais querem a letra completa.",
    item: "Instrumento de viagem gasto",
  },
  {
    id: "cacador", nome: "Caçador de Recompensas", icone: "🎯",
    desc: "Rastreou gente por dinheiro. Bom nisso — bom demais para que certos fugitivos durmassem tranquilos.",
    gancho: "Um alvo que escapou (ou foi entregue injustamente) ainda está por aí, e a conta vai chegar.",
    moedas: 15,
  },
  {
    id: "ferreiro", nome: "Herdeiro da Forja", icone: "⚒",
    desc: "Filho(a) de ferreiro, criado(a) entre brasas. Sabe o valor do trabalho bem feito — e o peso de um martelo.",
    gancho: "A forja da família foi tomada por alguém; recuperá-la é questão de honra.",
    item: "Martelo do pai (cabeça lascada)", pv: 2,
  },
  {
    id: "ex_cultista", nome: "Ex-Cultista Arrependido", icone: "🐍",
    desc: "Serviu a algo sombrio antes de entender o que era. Saiu — mas o culto não deixa ninguém simplesmente sair.",
    gancho: "Conhece rituais, nomes e planos do culto; os antigos irmãos o(a) querem calado(a) — ou de volta.",
    item: "Amuleto oculto virado do avesso", pm: 2,
  },
  {
    id: "naufrago", nome: "Náufrago", icone: "⚓",
    desc: "O mar (ou o vazio entre estrelas) engoliu o navio, a tripulação e a vida que ele(a) tinha.",
    gancho: "Sabe o que afundou o navio — e nem todo mundo quer que essa história seja contada.",
    item: "Bússola empenada (ainda aponta para algo)",
  },
];

export function antecedentePorId(id) {
  return ANTECEDENTES.find((a) => a.id === id) || ANTECEDENTES[0];
}
