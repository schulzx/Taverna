/* ============================================================
   CONQUISTAS E TÍTULOS — Taverna
   100% por código: contadores de feitos + condições avaliadas no
   app. Cada conquista desbloqueada concede um TÍTULO que o jogador
   pode equipar na ficha. A IA não participa — nem sabe que existe.
   É a "lição do Pokémon": colecionar é retenção de graça.
   ============================================================ */

export const CONTADORES_INICIAIS = {
  inimigosDerrotados: 0, elitesDerrotados: 0, lendariosDerrotados: 0,
  combatesVencidos: 0, criticos: 0, desastres: 0, quaseMorte: 0,
  viagens: 0, perigosEstrada: 0, descansos: 0,
  presentes: 0, recrutados: 0,
};

/* Cada conquista: quando(stats) dispara; titulo = o que se equipa na ficha.
   segredo: esconde a dica até desbloquear. */
export const CONQUISTAS = [
  /* -------- LÂMINA (combate) -------- */
  { id: "primeiro_sangue", icone: "🩸", nome: "Primeiro Sangue", titulo: "Sangue Novo", dica: "Derrote seu primeiro inimigo.", quando: (s) => s.inimigosDerrotados >= 1 },
  { id: "dez_abatidos", icone: "⚔", nome: "Dez Abatidos", titulo: "o Abatedor", dica: "Derrote 10 inimigos.", quando: (s) => s.inimigosDerrotados >= 10 },
  { id: "cinquenta_abatidos", icone: "🌪", nome: "Tempestade de Aço", titulo: "a Tempestade de Aço", dica: "Derrote 50 inimigos.", quando: (s) => s.inimigosDerrotados >= 50 },
  { id: "cem_abatidos", icone: "☠", nome: "Flagelo dos Campos", titulo: "o Flagelo", dica: "Derrote 100 inimigos.", quando: (s) => s.inimigosDerrotados >= 100 },
  { id: "matador_elite", icone: "🐗", nome: "Caçador de Feras", titulo: "Caçador de Feras", dica: "Derrote um inimigo de elite.", quando: (s) => s.elitesDerrotados >= 1 },
  { id: "cinco_elites", icone: "🏹", nome: "Matador de Campeões", titulo: "Matador de Campeões", dica: "Derrote 5 elites.", quando: (s) => s.elitesDerrotados >= 5 },
  { id: "matador_lendario", icone: "🐉", nome: "Matador de Lendas", titulo: "Matador de Lendas", dica: "Derrote uma criatura lendária.", quando: (s) => s.lendariosDerrotados >= 1 },
  { id: "tres_lendarios", icone: "👑", nome: "Terror dos Míticos", titulo: "Terror dos Míticos", dica: "Derrote 3 criaturas lendárias.", segredo: true, quando: (s) => s.lendariosDerrotados >= 3 },
  { id: "primeiro_critico", icone: "🎯", nome: "Golpe de Sorte", titulo: "o Afortunado", dica: "Acerte um 20 natural.", quando: (s) => s.criticos >= 1 },
  { id: "dez_criticos", icone: "✦", nome: "Mão Precisa", titulo: "Mão Precisa", dica: "Acerte 10 críticos.", quando: (s) => s.criticos >= 10 },
  { id: "primeiro_desastre", icone: "🍌", nome: "Tropeço Memorável", titulo: "o Desastrado", dica: "Role um 1 natural. Acontece com os melhores.", quando: (s) => s.desastres >= 1 },
  { id: "cinco_vitorias", icone: "🛡", nome: "Veterano", titulo: "o Veterano", dica: "Vença 5 combates.", quando: (s) => s.combatesVencidos >= 5 },
  { id: "quinze_vitorias", icone: "⚜", nome: "Senhor da Guerra", titulo: "Senhor da Guerra", dica: "Vença 15 combates.", quando: (s) => s.combatesVencidos >= 15 },
  { id: "fio_da_morte", icone: "💀", nome: "No Fio da Morte", titulo: "o Indestrutível", dica: "Chegue a 0 PV e sobreviva para contar.", segredo: true, quando: (s) => s.quaseMorte >= 1 },

  /* -------- ESTRADA -------- */
  { id: "primeira_viagem", icone: "🧭", nome: "Andarilho", titulo: "Andarilho", dica: "Siga viagem pela estrada.", quando: (s) => s.viagens >= 1 },
  { id: "dez_viagens", icone: "🥾", nome: "Pés Cansados", titulo: "Pés Cansados", dica: "Viaje 10 vezes.", quando: (s) => s.viagens >= 10 },
  { id: "vintecinco_viagens", icone: "🗺", nome: "Senhor das Estradas", titulo: "Senhor das Estradas", dica: "Viaje 25 vezes.", quando: (s) => s.viagens >= 25 },
  { id: "dez_perigos", icone: "🌲", nome: "Sobrevivente das Rotas", titulo: "Sobrevivente das Rotas", dica: "Sobreviva a 10 encontros perigosos na estrada.", quando: (s) => s.perigosEstrada >= 10 },
  { id: "dez_criaturas", icone: "📖", nome: "Naturalista", titulo: "o Naturalista", dica: "Enfrente 10 criaturas diferentes.", quando: (s) => s.criaturasDescobertas >= 10 },
  { id: "vinte_criaturas", icone: "📚", nome: "Cronista de Feras", titulo: "Cronista de Feras", dica: "Enfrente 20 criaturas diferentes.", quando: (s) => s.criaturasDescobertas >= 20 },

  /* -------- CORAÇÃO (social) -------- */
  { id: "primeiro_companheiro", icone: "🤝", nome: "Líder Nato", titulo: "Líder Nato", dica: "Recrute seu primeiro companheiro.", quando: (s) => s.recrutados >= 1 },
  { id: "tres_companheiros", icone: "⚑", nome: "Capitão de Companhia", titulo: "o Capitão", dica: "Viaje com 3 companheiros ao mesmo tempo.", quando: (s) => s.companheiros >= 3 },
  { id: "cinco_pessoas", icone: "😊", nome: "Rosto Conhecido", titulo: "Rosto Conhecido", dica: "Conheça 5 pessoas marcantes.", quando: (s) => s.npcs >= 5 },
  { id: "quinze_pessoas", icone: "🍻", nome: "Alma da Taverna", titulo: "Alma da Taverna", dica: "Conheça 15 pessoas marcantes.", quando: (s) => s.npcs >= 15 },
  { id: "trinta_pessoas", icone: "🌟", nome: "Lenda Viva", titulo: "Lenda Viva", dica: "Conheça 30 pessoas marcantes.", quando: (s) => s.npcs >= 30 },
  { id: "primeiro_presente", icone: "🎁", nome: "Mãos Generosas", titulo: "o Generoso", dica: "Presenteie uma potência.", quando: (s) => s.presentes >= 1 },
  { id: "cinco_presentes", icone: "💝", nome: "O Magnânimo", titulo: "o Magnânimo", dica: "Presenteie 5 vezes.", quando: (s) => s.presentes >= 5 },

  /* -------- OURO -------- */
  { id: "cem_moedas", icone: "🪙", nome: "Bolso Cheio", titulo: "Bolso Cheio", dica: "Junte 100 moedas.", quando: (s) => s.moedas >= 100 },
  { id: "quinhentas_moedas", icone: "💰", nome: "O Próspero", titulo: "o Próspero", dica: "Junte 500 moedas.", quando: (s) => s.moedas >= 500 },
  { id: "mil_moedas", icone: "🏆", nome: "Tesouro Ambulante", titulo: "Tesouro Ambulante", dica: "Junte 1000 moedas.", quando: (s) => s.moedas >= 1000 },
  { id: "cofre_gordo", icone: "🏦", nome: "O Tesoureiro", titulo: "o Tesoureiro", dica: "Tenha 500 no cofre da guilda.", quando: (s) => s.cofre >= 500 },

  /* -------- COROA (gestão) -------- */
  { id: "fundador", icone: "🏛", nome: "Fundador", titulo: "o Fundador", dica: "Funde sua própria guilda.", quando: (s) => s.temGuilda },
  { id: "primeira_cidade", icone: "🏰", nome: "Senhor de Terras", titulo: "Senhor de Terras", dica: "Domine sua primeira cidade.", quando: (s) => s.dominios >= 1 },
  { id: "tres_dominios", icone: "🚩", nome: "O Conquistador", titulo: "o Conquistador", dica: "Domine 3 cidades.", quando: (s) => s.dominios >= 3 },
  { id: "cinco_dominios", icone: "🌍", nome: "O Imperador", titulo: "o Imperador", dica: "Domine 5 cidades.", segredo: true, quando: (s) => s.dominios >= 5 },
  { id: "guilda_nv3", icone: "⚒", nome: "Mestre de Guilda", titulo: "Mestre de Guilda", dica: "Leve sua guilda ao nível 3.", quando: (s) => s.guildaNivel >= 3 },
  { id: "guilda_nv5", icone: "🔨", nome: "Grão-Mestre", titulo: "o Grão-Mestre", dica: "Leve sua guilda ao nível máximo.", quando: (s) => s.guildaNivel >= 5 },
  { id: "primeira_alianca", icone: "🕊", nome: "O Diplomata", titulo: "o Diplomata", dica: "Firme seu primeiro tratado (comércio ou aliança).", quando: (s) => s.tratados >= 1 },
  { id: "tres_tratados", icone: "📜", nome: "Arquiteto de Paz", titulo: "Arquiteto de Paz", dica: "Tenha 3 tratados ativos.", quando: (s) => s.tratados >= 3 },
  { id: "primeiro_vassalo", icone: "♜", nome: "Senhor de Juramentos", titulo: "Senhor de Juramentos", dica: "Tenha um vassalo pagando tributo.", quando: (s) => s.vassalos >= 1 },
  { id: "primeira_guerra", icone: "🔥", nome: "O Belicoso", titulo: "o Belicoso", dica: "Esteja em guerra com uma potência.", quando: (s) => s.guerras >= 1 },

  /* -------- LENDA (nível) -------- */
  { id: "nv5", icone: "✨", nome: "Herói Ascendente", titulo: "Herói Ascendente", dica: "Alcance o nível 5.", quando: (s) => s.nivel >= 5 },
  { id: "nv10", icone: "🌠", nome: "Campeão", titulo: "o Campeão", dica: "Alcance o nível 10.", quando: (s) => s.nivel >= 10 },
  { id: "nv15", icone: "💫", nome: "Lenda", titulo: "a Lenda", dica: "Alcance o nível 15.", quando: (s) => s.nivel >= 15 },
  { id: "nv20", icone: "🌌", nome: "O Mítico", titulo: "o Mítico", dica: "Alcance o nível 20.", segredo: true, quando: (s) => s.nivel >= 20 },
];

/* Avalia as conquistas: devolve as recém-desbloqueadas (que ainda não estavam). */
export function avaliarConquistas(stats, jaDesbloqueadas) {
  return CONQUISTAS.filter((c) => !jaDesbloqueadas[c.id] && c.quando(stats));
}

export function conquistaPorId(id) { return CONQUISTAS.find((c) => c.id === id) || null; }
