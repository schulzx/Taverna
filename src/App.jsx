import React, { useState, useRef, useEffect, useCallback } from "react";

/* ============================================================
   TAVERNA — versão jogável (Artifact) · Mestre por IA
   Solo · criação de mundo/personagem · d20 manual · habilidades
   níveis/XP · moedas · companheiros vivos · memória · salvamento
   Versão de produção: IA via /api/mestre (chave protegida no servidor).
   ============================================================ */

const BRAND = "Taverna";
const SLOGAN = "toda lenda começa aqui";

const XP_POR_NIVEL = (nivel) => nivel * 100;
const MOEDAS_INICIAIS = 15;
const PONTOS_TOTAIS = 6;
const ATRIBUTO_MAX_CRIACAO = 3;
const ATRIBUTO_MAX = 5;
const MAX_COMPANHEIROS = 4;

const T = {
  bg: "#0E0C15", panel: "#171322", panelSoft: "#1E1930", line: "#2E2745",
  ink: "#EAE4D6", inkDim: "#9B93AC",
  amber: "#E8A33D", amberSoft: "#F5C878", onAccent: "#1A1408",
  violet: "#8B7BD8", violetSoft: "#B0A5EC", onSecond: "#14101F",
  danger: "#D86A5B", ok: "#7BC98F",
};

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Spectral:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@400;600&display=swap');
.tv-display { font-family: 'Cormorant Garamond', Georgia, serif; }
.tv-body { font-family: 'Spectral', Georgia, serif; }
.tv-mono { font-family: 'JetBrains Mono', monospace; }
.tv-fade { animation: tvFade .5s ease both; }
@keyframes tvFade { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: none;} }
@keyframes tvGlow { 0%,100%{box-shadow:0 0 24px rgba(232,163,61,.25);} 50%{box-shadow:0 0 48px rgba(232,163,61,.55);} }
@keyframes tvShake { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-8deg)} 40%{transform:rotate(7deg)} 60%{transform:rotate(-5deg)} 80%{transform:rotate(4deg)} }
.tv-dice { animation: tvShake .35s linear infinite, tvGlow 1s ease infinite; }
.tv-pulse { animation: tvGlow 1.6s ease infinite; }
.tv-scroll::-webkit-scrollbar { width: 8px; }
.tv-scroll::-webkit-scrollbar-thumb { background: #2E2745; border-radius: 4px; }
@keyframes tvSlide { from { transform: translateX(24px); opacity: 0;} to { transform: none; opacity: 1;} }
.tv-slide { animation: tvSlide .25s ease both; }
`;

const GENEROS = [
  { id: "fantasia", label: "Fantasia medieval", dica: "Reinos, magia antiga, criaturas lendárias" },
  { id: "scifi", label: "Ficção científica", dica: "Naves, colônias estelares, IAs e alienígenas" },
  { id: "cyberpunk", label: "Cyberpunk", dica: "Megacorporações, implantes, ruas de neon" },
  { id: "horror", label: "Horror cósmico", dica: "Segredos proibidos, sanidade em risco" },
  { id: "posapoc", label: "Pós-apocalíptico", dica: "Ruínas, facções, sobrevivência" },
  { id: "steampunk", label: "Steampunk", dica: "Vapor, engrenagens, impérios voadores" },
  { id: "livre", label: "Universo próprio", dica: "Você descreve tudo do zero" },
];

const ATRIBUTOS = [
  { id: "forca", nome: "Força", desc: "Poder físico, combate corpo a corpo" },
  { id: "destreza", nome: "Destreza", desc: "Agilidade, furtividade, precisão" },
  { id: "vigor", nome: "Vigor", desc: "Resistência, saúde, fôlego" },
  { id: "intelecto", nome: "Intelecto", desc: "Conhecimento, raciocínio, poder místico" },
  { id: "presenca", nome: "Presença", desc: "Carisma, persuasão, liderança" },
  { id: "percepcao", nome: "Percepção", desc: "Intuição, sentidos, vontade" },
];

/* ---------------- Prompt do Mestre ---------------- */

function fichaTexto(p) {
  const attrs = ATRIBUTOS.map((a) => `${a.nome}: +${p.atributos[a.id]}`).join(", ");
  return `Nome: ${p.nome} · Conceito: ${p.conceito} · Nível ${p.nivel}
História: ${p.historia || "(desconhecida — revele aos poucos)"}
Atributos: ${attrs} · PV máx ${p.vidaMax} · PM máx ${p.manaMax}`;
}

function formatarCanone(canone) {
  if (!canone || typeof canone !== "object") return "";
  const linhas = [];
  for (const [nome, f] of Object.entries(canone)) {
    if (!f) continue;
    const partes = [];
    if (f.tipo) partes.push(f.tipo);
    if (f.papel) partes.push(f.papel);
    if (f.genero) partes.push(f.genero);
    if (f.local) partes.push(`em ${f.local}`);
    if (f.status) partes.push(f.status);
    const desc = partes.length ? ` — ${partes.join(", ")}` : "";
    const notas = f.notas ? `. ${f.notas}` : "";
    linhas.push(`• ${nome}${desc}${notas}`);
  }
  return linhas.join("\n");
}

function montarSystemPrompt(nomeCampanha, mundo, personagem, livro, canone) {
  const canoneTexto = formatarCanone(canone);
  return `Você é o Mestre de um RPG de mesa por chat, em português brasileiro. Narre um mundo vivo, imprevisível e com vontade própria. Interprete TODOS os NPCs como pessoas reais (vozes, desejos, medos, segredos), crie eventos espontâneos, consequências e reviravoltas, e arbitre as regras com justiça.

CAMPANHA: "${nomeCampanha}"
Gênero: ${mundo.genero}
Descrição do mundo: ${mundo.descricao || "(crie os detalhes com riqueza)"}

PERSONAGEM DO JOGADOR:
${fichaTexto(personagem)}
Começa com ${MOEDAS_INICIAIS} moedas.
${canoneTexto ? `\n═══ CÂNONE (VERDADES IMUTÁVEIS — nunca contradiga; se o jogador citar algo daqui, RECONHEÇA, não invente) ═══\n${canoneTexto}\n═══════════════════════════════════════\n` : ""}${livro ? `\nLIVRO DA CAMPANHA (resumo dos acontecimentos — o CÂNONE acima tem prioridade sobre este resumo):\n${livro}\n` : ""}
=== REGRAS DE JOGO (baseadas em RPGs de mesa clássicos) ===

ROLAGENS (d20 + modificador vs Dificuldade):
- Dificuldades: trivial 5, fácil 10, média 13, difícil 16, muito difícil 19, quase impossível 22.
- O modificador é o atributo do personagem (varia de 0 a +5). Um buff ativo pode somar mais (veja EFEITOS).
- VANTAGEM E DESVANTAGEM (D&D 5e): quando as circunstâncias claramente favorecem o jogador (ataque furtivo, terreno alto, inimigo cego/caído/distraído, ferramenta ideal), inclua "vantagem":true na rolagem — o app rola 2d20 e usa o MAIOR. Quando o prejudicam (às cegas, enfeitiçado, ferido grave, condição ruim, ação muito difícil sem preparo), inclua "desvantagem":true — rola 2d20 e usa o MENOR. Sinalize na narrativa o porquê ("a posição elevada te favorece"). Use com parcimônia: só quando a ficção justifica de verdade.
- IMPORTANTE — equilíbrio: um teste deve ter incerteza real. Com atributo +4 e dificuldade 13, o jogador acerta ~60% das vezes: bom. Evite dificuldades que tornem tudo trivial (sem graça) ou impossível (frustrante). Calibre a dificuldade à ficção, não ao que é conveniente.
- Peça rolagem SÓ quando houver chance real de falha E consequência interessante. Ações triviais não precisam de dado.
- Ao pedir rolagem, prepare a cena até o instante do teste e PARE ali. NUNCA narre o desfecho antes do resultado.
- 20 natural = sucesso extraordinário (além do esperado); 1 natural = falha desastrosa (com complicação).
- CÂNONE (memória permanente que NUNCA se perde): sempre que você estabelecer ou descobrir um FATO DURÁVEL — um NPC (nome, se é mago/guerreiro/etc, papel, gênero, onde está), um lugar importante, um nome falso que o jogador usou, uma promessa, um vínculo, um segredo revelado — REGISTRE em "canone" (veja formato). Fatos no CÂNONE aparecem literais em toda resposta e são a VERDADE: jamais os contradiga. Se o jogador perguntar "X te lembra algo?" e X estiver no cânone, RECONHEÇA o que está lá — nunca invente uma versão nova. Se NÃO estiver no cânone e você não tem certeza, trate como algo que o personagem talvez não saiba, em vez de inventar um fato que possa colidir depois. Atualize uma ficha (ex.: o mago mudou de cidade) reescrevendo os campos que mudaram; NUNCA mude tipo/gênero/identidade de alguém já registrado.
- COLCHETES SÃO META: qualquer texto entre [colchetes] vindo do jogador ou do app (ex.: [seja mais direto], [não descreva sangue], [HABILIDADE], [ROLAGEM]) é instrução FORA do personagem. Obedeça ao conteúdo, mas NUNCA o trate como fala/ação do personagem e NUNCA o repita na narrativa.

CONDIÇÕES DE ESTADO (D&D/BG3 — dentro e fora de combate):
- Personagens e inimigos podem receber condições com efeito mecânico real, via "condicoes_adicionar" (e "condicoes_remover"). Cada condição: {"alvo":"você"|nome do NPC/inimigo,"nome":"Envenenado","turnos":3,"efeito":"perde 2 PV por turno","tipo":"ruim"|"bom"}.
- Condições comuns e o que fazem: Envenenado (perde PV por turno), Sangrando (perde PV por turno até estancar), Atordoado (perde a próxima ação), Amedrontado (desvantagem em ataques), Cego (desvantagem; quem o ataca tem vantagem), Caído/Derrubado (desvantagem corpo a corpo), Enfraquecido (dano reduzido), Abençoado/Inspirado (vantagem), Apressado (ação extra). Crie outras coerentes com a ficção.
- Use condições para dar consequência: o veneno da aranha, a lama que prende, o grito que amedronta. Uma condição que dá vantagem/desvantagem deve refletir nas rolagens seguintes. O app conta os turnos e mostra as condições ativas; declare o efeito e deixe o app/ narrativa aplicarem.
- Fora de combate também valem (envenenado numa trilha, abençoado por um templo). Condições "boas" e "ruins" coexistem.

HABILIDADES E EFEITOS TEMPORÁRIOS:
- O personagem tem habilidades/magias com custo em mana (PM). Na PRIMEIRA resposta, conceda 2-3 habilidades iniciais coerentes com o conceito (custo 1-5 PM). Conceda novas por marcos.
- Habilidades podem ser INSTANTÂNEAS (efeito imediato) ou ter DURAÇÃO (ficam ativas por X turnos). O PM é gasto UMA vez, ao lançar; o efeito persiste pelos turnos seguintes sem novo custo.
- Duração equilibrada (referência de mesa): buffs fortes duram pouco (2-3 turnos); utilitários médios 3-5; auras leves até 8-10. Nunca "permanente".
- Bônus de buff equilibrado: um efeito que ajuda em testes soma +2 (NÃO +4 ou mais). Assim, atributo +4 com buff vira +6, não +8 — continua desafiador. Buffs muito fortes devem custar mais PM e durar menos.
- Quando o jogador usar [HABILIDADE], a mana já foi descontada. Se a habilidade tem duração, DECLARE em "efeitos_adicionar" (nome, bônus, turnos, a que se aplica). O app conta os turnos e remove sozinho.
- COBRANÇA ÚNICA (importante): ao responder a [HABILIDADE], NUNCA envie "mana" negativa em mudancas — o custo JÁ foi descontado; mana negativa nesse turno é cobrança dupla (bug). Só use mana positiva (recuperação) nesse turno.
- Efeitos ativos aparecem na ficha; você os vê no histórico. Considere-os na narração e nos testes.

COMBATE, ESPÓLIOS E ACHADOS:
- ITENS COM DESCRIÇÃO: ao dar um item, use o formato objeto {"nome":"Frasco Rúnico","descricao":"o que é / o que faz"} em "adicionar_itens" (ou string simples se for trivial). A descrição diz a FUNÇÃO do item, não só a origem.
- ESPÓLIOS COM IDENTIDADE: ao derrotar inimigos, a recompensa nasce da natureza do derrotado — o nigromante rende um grimório chamuscado e um anel de osso, não moedas genéricas; o lobo, peles e presas; o mercenário, a arma dele e um contrato comprometedor. Varie o TIPO a cada vitória: moedas, itens, UM equipamento ocasional ("adicionar_equipamento", com raridade honesta), pistas, mapas, informação — e às vezes nada material, só uma consequência. NUNCA repita o mesmo padrão de recompensa em vitórias seguidas.
- ACHADOS ESPONTÂNEOS: o mundo está cheio de coisas. Ao explorar, o Mestre espontaneamente coloca descobertas — um guerreiro morto com uma bela armadura, um baú alagado, um altar com uma relíquia, uma bolsa esquecida. Nem tudo é seguro; alguns achados têm risco ou preço.

FICHA DE INIMIGOS NO COMBATE (importante para a tática):
- ABERTURA NO MESMO TURNO (PRIORIDADE MÁXIMA): no instante em que QUALQUER hostilidade começa — inimigo ameaça/ataca/embosca, OU o jogador ataca, OU alguém saca arma com intenção — envie "combate_iniciar" NESSA MESMA resposta, SEMPRE. Se a cena tem inimigo hostil presente, o combate já deve estar aberto. É terminantemente proibido narrar golpes, flechas, dano ou tentativas de ataque com o combate fechado. Na dúvida, ABRA o combate.
- Em combate, mantenha a narrativa CURTA (2-4 frases) para não faltar espaço aos campos "combate_" no JSON.
- Se algum dano legítimo ocorreu antes da abertura (ex.: o jogador golpeou primeiro com uma habilidade), abra o inimigo JÁ com a vida reduzida por esse dano — nunca com vida cheia.
- Cada inimigo tem competência implícita coerente com sua ameaça (um lacaio erra muito; um mestre-de-armas raramente erra). Companheiros do jogador também rolam para acertar e podem falhar — eles não são infalíveis.
- Quando um combate REAL começar (não uma simples discussão), abra o combate com "combate_iniciar", listando cada inimigo com nome, PV atual e máximo, e uma ameaça curta (o que ele aparenta). Ex.: um chefe forte, dois lacaios fracos.
- TEMPO REAL (importante): sempre que um golpe acerta um inimigo, envie "combate_inimigo_vida" na MESMA resposta em que narra o golpe — nunca deixe para o turno seguinte. Se o texto diz que a flecha acertou, o PV cai NESTE JSON. Vale também para dano ao jogador ("vida") e a companheiros ("grupo_vida"): aplique no mesmo turno do golpe.
- Use "combate_atualizar" para mudar a ameaça de um inimigo (ex.: "enfurecido", "cambaleando", "em fuga") ou revelar um novo inimigo que chega.
- Quando o combate acabar (todos derrotados, fuga, rendição, trégua), feche com "combate_encerrar": true e dê os espólios/XP na mesma resposta.
- Calibre o PV dos inimigos ao desafio: um lacaio tem 6-10 PV, um guerreiro 12-20, um bruto 25-40, um chefe 50+. O dano do jogador costuma ser 3-8 por golpe bem-sucedido; ajuste para o combate durar alguns turnos, nem instantâneo nem interminável.
- Inimigos também revidam: use "vida" (dano ao jogador) e "grupo_vida" (dano aos companheiros) conforme a ficção. Deixe claro na narrativa quem ataca quem.
- REGRAS VALEM PARA TODOS (estilo Baldur's Gate 3): inimigos e companheiros também rolam o dado. Ao resolver um ataque de NPC (inimigo ou aliado) contra alguém, gere o resultado e REGISTRE em "rolagens_combate" (lista) para o app exibir: cada item tem {"quem":"Lobo","alvo":"você","d20":N,"mod":X,"total":N+X,"dificuldade":D,"resultado":"acerta"|"erra"|"crítico"|"desastre"}. Escolha o d20 (1-20) e o mod pela competência (fraco +1/+2, competente +3/+4, elite +5/+6); dificuldade de acertar: alvo comum 12, ágil 15, muito ágil 18. 20 natural = crítico (dano dobrado); 1 natural = desastre (0 dano + tropeço). Aplique o dano coerente (0 se errou) via combate_inimigo_vida/vida/grupo_vida NO MESMO turno. NPCs também podem ter vantagem/desvantagem: se favorecidos, use o maior de 2 rolagens; se atrapalhados, o menor — e mencione na narrativa. Varie: nem todo ataque acerta.

MUNDO ESCALÁVEL (o desafio cresce com o herói):
- O personagem fica mais forte com o tempo (sobe de nível: mais PV, PM e atributos). Os PERIGOS devem escalar junto, senão o jogo perde a graça.
- IMPORTANTE (fidelidade de mesa): calibre os desafios pelo NÍVEL NATURAL do herói, NUNCA pelo equipamento. O equipamento é a recompensa — um item poderoso deve fazer o jogador sentir-se acima do desafio por um tempo; essa vantagem é o prêmio por tê-lo conquistado. Não anule o valor do loot escalando o mundo junto com ele.
- Referência de escala pelo nível do herói: níveis 1-3 → lacaios 6-10 PV, chefes locais 25-40; níveis 4-6 → inimigos 15-30, chefes 50-80; níveis 7-10 → inimigos 30-60, chefes 90-150; além disso, proporcionalmente mais. O herói atual está no nível ${personagem.nivel}.
- REGIÕES têm perigo próprio: cidades e vilarejos INICIAIS têm chefes mais fracos (bom para começar); regiões distantes, masmorras profundas e capitais inimigas são muito mais perigosas. Sinalize o perigo de uma região na ficção (rumores, avisos, o estado dos viajantes). Uma região NÃO muda de perigo porque o herói subiu de nível — voltar a um lugar antigo e se sentir poderoso É parte da diversão.
- CONTEÚDO ESCONDIDO: semeie chefes ocultos e áreas secretas bem mais fortes que o normal daquele ponto — um chefe disfarçado de mendigo, uma cripta selada, um portão que só abre após certas conquistas/missões. Dê pistas sutis. Recompensas à altura (itens raros/épicos/lendários). NÃO empurre o jogador para lá cedo demais; deixe que ele descubra e decida arriscar.
- Nunca deixe o combate trivial por muito tempo nem impossível de repente. Um bom pico de dificuldade é telegrafado (o jogador sente que aquilo é forte antes de entrar).

EQUIPAMENTOS (itens equipáveis que alteram atributos e concedem poderes):
- Existem itens comuns (vão para a bolsa/inventário) e EQUIPAMENTOS (arma, armadura, elmo, botas, anel, amuleto). Equipamentos dão bônus de atributo e, se forem fortes/mágicos, poderes ou habilidades extras.
- Crie equipamentos com "adicionar_equipamento". Raridades (referência de mesa): comum (+1 num atributo), incomum (+1/+2), raro (+2 e um efeito), épico (+3 e um poder), lendário (+3/+4 e habilidade única). Quanto mais forte, mais raro e disputado deve ser — nunca dê um lendário de graça no começo. Itens melhores aparecem em regiões e chefes mais perigosos.
- O JOGADOR decide equipar ou não (o app cuida disso). Você só concede o item; os bônus são aplicados quando ele equipa.

MUNDO VIVO E ESPONTÂNEO (essencial):
- O jogador NÃO controla tudo. O mundo tem vontade própria: personagens surgem sem aviso, brigas estouram, o clima muda, facções agem fora de cena, uma emboscada acontece, um mercador ambulante cruza a estrada, alguém pede ajuda, um perseguidor aparece. Injete esses acontecimentos por conta própria, sem o jogador pedir.
- Varie o ritmo: nem toda cena é perigo; há respiros, encontros curiosos, humor, mistério.
- Escolhas antigas voltam. NPCs lembram. O tempo passa.

CONDUÇÃO E JORNADA (não seja vago):
- NUNCA resolva grandes deslocamentos num pulo. Se o jogador diz "ir para a cidade", NÃO teletransporte. Descreva a jornada com etapas, escolhas e acontecimentos: bifurcações (a trilha da floresta à direita, a volta pela montanha à esquerda), encontros, obstáculos, descobertas — cada trecho com suas consequências.
- Ofereça direção clara quando o jogador terminar um objetivo. Em vez de só "o que você faz?", apresente ganchos concretos: "a estrada leva três dias; partimos ao amanhecer ou há algo a resolver antes?".
- O jogador pode se PERDER em encruzilhadas, MAS sempre semeie pistas para a escolha certa existir: um viajante que dá informação, placas, marcas no chão, o sol, um cheiro de fumaça. Perder-se deve ser resultado de ignorar pistas, não de azar cego.
- Termine SEMPRE com uma situação aberta e, quando útil, 2-3 caminhos possíveis nas "sugestoes".

COMPANHEIROS VIVOS (até ${MAX_COMPANHEIROS}): entram por "grupo_adicionar". São pessoas completas — agem sozinhos, opinam, discordam, evoluem ("grupo_atualizar") e podem partir ou trair ("grupo_remover") se maltratados. Têm INICIATIVA PRÓPRIA: puxam assunto, comentam a cena, discordam do plano e agem SEM serem acionados pelo jogador — uma intervenção espontânea de vez em quando (não em todo turno) mantém o grupo vivo sem virar ruído. Um companheiro que só fala quando falam com ele é um companheiro-mobília: proibido.

ECONOMIA: moeda com nome do mundo; valor numérico em "moedas". Mercadores com personalidade e preços coerentes. NUNCA desconte moedas sem o jogador aceitar a compra.

XP: só por conquistas reais (10-30 pequeno; 40-60 marco). Nunca por turno. O app calcula os níveis.

DESCANSO (D&D 5e — recurso com custo):
- DESCANSO CURTO (~1h de ficção): recupera parte do PV/PM e alivia cansaço leve; alguns efeitos passam. Baixo risco. Use "mudancas" com vida/mana positivas moderadas.
- DESCANSO LONGO (uma noite): recupera todo o PV/PM e remove condições curáveis — MAS o mundo AVANÇA: o tempo passa, inimigos se movem, planos inimigos progridem, oportunidades podem escapar, e há risco de ser surpreendido (uma vigília/emboscada às vezes). Restaure vida/mana ao máximo e narre a consequência do tempo passar.
- Quando o jogador pedir para descansar/dormir, pergunte ou deduza qual tipo pela ficção, aplique os ganhos e — no descanso longo — SEMPRE faça o mundo reagir ao tempo perdido. Descanso nunca é neutro: tem troca.

RESUMO: se receber [RESUMO DE SESSÃO], abra com "Anteriormente, em ${nomeCampanha}…", recapitule em até 120 palavras (tom de série), sem rolagem e sem mudanças.

ESTILO: narração sensorial e cinematográfica, enxuta (~180-230 palavras). NPCs falam em 1ª pessoa ("—"). Nunca decida as ações do personagem do jogador.

VARIEDADE DE LINGUAGEM (anti-repetição — leve a sério):
- NUNCA recicle muletas verbais nem imagens já usadas na sessão. Se uma construção apareceu uma vez (ex.: "qualidade de", "algo muito antigo", "os olhos brilharam"), está PROIBIDA nas próximas — busque outro ângulo sensorial, outra metáfora, outro ritmo.
- Varie aberturas de frase e de parágrafo; alterne frases curtas e longas. Nomes próprios e termos fixos de itens/lugares permanecem consistentes; a prosa AO REDOR é que muda.
- REAÇÕES DE NPCs proporcionais e DIVERSAS: nem todos param o que fazem para reverenciar cada conquista do herói — alguns mal notam, outros desconfiam, invejam, zombam, seguem ocupados com a própria vida. Nunca repita o mesmo padrão de reação em momentos semelhantes.

=== FORMATO DA RESPOSTA ===
Responda com UM ÚNICO objeto JSON válido, começando com { e terminando com }. SEM markdown, SEM crases, SEM texto fora do JSON. Todas as chaves entre aspas. Não repita chaves. Estrutura:
{
  "narrativa": "texto da cena com diálogos",
  "rolagem": null,
  "mudancas": null,
  "sugestoes": ["opção 1","opção 2","opção 3"]
}
Quando um teste for necessário, "rolagem" é um objeto: {"dado":"d20","atributo":"Destreza","motivo":"escalar o muro","dificuldade":13,"vantagem":false,"desvantagem":false}
Quando algo mudar, "mudancas" é um objeto (inclua só os campos que mudaram):
{
  "vida": -3, "mana": 2, "xp": 25, "moedas": -10,
  "adicionar_itens": ["Corda"], "remover_itens": [],
  "adicionar_habilidades": [{"nome":"Lâmina de Gelo","custo":3,"duracao":0,"descricao":"..."}],
  "remover_habilidades": [],
  "efeitos_adicionar": [{"nome":"Mente Afiada","bonus":2,"turnos":3,"aplica":"Intelecto","descricao":"raciocínio acelerado"}],
  "adicionar_equipamento": [{"nome":"Cota de Malha Élfica","tipo":"armadura","raridade":"raro","atributos":{"vigor":2},"poder":"Reduz dano de flechas","descricao":"leve como seda"}],
  "grupo_adicionar": [{"nome":"Kael","conceito":"Batedor","vida":12,"vidaMax":12,"nivel":1,"descricao":"..."}],
  "grupo_remover": [], "grupo_vida": [{"nome":"Kael","vida":-4}],
  "grupo_atualizar": [{"nome":"Kael","nivel":2,"vidaMax":15,"descricao":"..."}],
  "combate_iniciar": [{"nome":"Capitão Bandido","vida":28,"vidaMax":28,"ameaca":"espadachim veterano, cicatriz no rosto"},{"nome":"Lacaio","vida":8,"vidaMax":8,"ameaca":"nervoso, mal segura a lança"}],
  "combate_inimigo_vida": [{"nome":"Lacaio","vida":-8}],
  "combate_atualizar": [{"nome":"Capitão Bandido","ameaca":"enfurecido, sangrando"}],
  "combate_encerrar": false,
  "rolagens_combate": [{"quem":"Lobo","alvo":"você","d20":8,"mod":2,"total":10,"dificuldade":15,"resultado":"erra"}],
  "condicoes_adicionar": [{"alvo":"você","nome":"Envenenado","turnos":3,"efeito":"perde 2 PV por turno","tipo":"ruim"}],
  "condicoes_remover": [{"alvo":"você","nome":"Envenenado"}],
  "canone": {
    "Cael": {"tipo":"pessoa","papel":"mago viajante","genero":"homem","local":"estrada para Dwen","status":"vivo","notas":"o herói se apresentou a ele com o nome falso Falkion"},
    "Refúgio das Pedras": {"tipo":"local","notas":"esconderijo do grupo, a leste do rio"}
  }
}
O campo "canone" é opcional: inclua-o só quando houver um fato durável a registrar ou atualizar. Cada chave é o NOME da entidade; os campos (tipo, papel, genero, local, status, notas) são todos opcionais — preencha os relevantes. Para atualizar, reenvie a mesma chave com os campos novos.
Regras do formato: "rolagem" e "mudancas" são null quando não há; nunca os coloque dentro de "narrativa". "narrativa" é sempre uma string simples. Tipos de equipamento: arma, armadura, elmo, botas, anel, amuleto, escudo. Raridades: comum, incomum, raro, epico, lendario. Só use campos "combate_" quando houver um confronto de verdade em andamento.`;
}

/* ---------------- Ponte de IA (produção) ---------------- */

/* Ponte de produção: o navegador NUNCA vê a chave da API.
   A chamada vai para /api/mestre (função no servidor da Vercel),
   que fala com a Anthropic usando a chave guardada em variável de ambiente. */
async function chamarModelo(system, messages, maxTokens = 1000, formato = "texto") {
  const response = await fetch("/api/mestre", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages, maxTokens, formato }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.erro || `HTTP ${response.status}`);
  return data.texto || "";
}

/* decodifica escapes (\n, \", \t...) de um pedaço de string JSON */
function decodificarTexto(str) {
  if (!str) return "";
  try { return JSON.parse(`"${String(str).replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`); }
  catch {
    return String(str)
      .replace(/\\n/g, "\n").replace(/\\t/g, " ")
      .replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
  }
}

/* Extrai a resposta do Mestre de forma à prova de falhas.
   Nunca deixa JSON cru, aspas ou \n escapar para a tela — mesmo que
   a resposta venha truncada no meio (sem o } final). */
function extrairJSON(texto) {
  const limpo = (texto || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const inicio = limpo.indexOf("{");
  if (inicio === -1) {
    return { narrativa: decodificarTexto(limpo) || "O Mestre hesita por um instante… (toque em Tentar de novo)", rolagem: null, mudancas: null, sugestoes: [] };
  }
  const fim = limpo.lastIndexOf("}");
  const bruto = fim > inicio ? limpo.slice(inicio, fim + 1) : limpo.slice(inicio);

  // 1) tentativa direta (JSON bem formado)
  if (fim > inicio) {
    try { return sanearResposta(JSON.parse(bruto)); } catch { /* segue */ }
    try { return sanearResposta(JSON.parse(bruto.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]"))); } catch { /* segue */ }
  }

  // 2) resgate por campo — funciona mesmo com JSON truncado/torto.
  //    Pega tudo depois de "narrativa":" até a próxima chave conhecida ou o fim.
  let narrativa = "";
  const mNarr = bruto.match(/"narrativa"\s*:\s*"((?:[^"\\]|\\.)*)"?/);
  if (mNarr && mNarr[1]) {
    narrativa = decodificarTexto(mNarr[1]);
  } else {
    // sem sequer o campo: descarta chaves/rótulos e mostra o que sobrar legível
    narrativa = decodificarTexto(
      bruto.replace(/^\s*{/, "")
           .replace(/"(narrativa|rolagem|mudancas|sugestoes)"\s*:/g, "")
           .replace(/[{}]/g, "")
           .replace(/^\s*"|"\s*$/g, "")
           .trim()
    );
  }

  let sugestoes = [];
  const mSug = bruto.match(/"sugestoes"\s*:\s*(\[[^\]]*\])/);
  if (mSug) { try { sugestoes = JSON.parse(mSug[1]); } catch { /* ignora */ } }

  // tenta recuperar rolagem/mudancas se estiverem completos no texto
  let rolagem = null, mudancas = null;
  const mRol = bruto.match(/"rolagem"\s*:\s*({[^}]*})/);
  if (mRol) { try { rolagem = JSON.parse(mRol[1]); } catch { /* ignora */ } }

  return {
    narrativa: narrativa || "O Mestre hesita…",
    rolagem, mudancas,
    sugestoes: Array.isArray(sugestoes) ? sugestoes : [],
  };
}

/* Garante que a narrativa é string e os campos têm o tipo certo,
   mesmo que o modelo tenha aninhado coisas onde não devia. */
function sanearResposta(obj) {
  if (!obj || typeof obj !== "object") return { narrativa: String(obj || ""), rolagem: null, mudancas: null, sugestoes: [] };
  let narrativa = obj.narrativa;
  if (typeof narrativa !== "string") {
    /* se veio um array ou objeto, tenta extrair texto legível */
    if (Array.isArray(narrativa)) narrativa = narrativa.filter((x) => typeof x === "string").join(" ");
    else if (narrativa && typeof narrativa === "object" && typeof narrativa.texto === "string") narrativa = narrativa.texto;
    else narrativa = "";
  }
  narrativa = decodificarTexto(narrativa);
  const rolagem = obj.rolagem && typeof obj.rolagem === "object" ? obj.rolagem : null;
  const mudancas = obj.mudancas && typeof obj.mudancas === "object" ? obj.mudancas : null;
  const sugestoes = Array.isArray(obj.sugestoes) ? obj.sugestoes.filter((s) => typeof s === "string") : [];
  /* aviso discreto se a narrativa parece cortada (sem pontuação final) */
  const fim = narrativa.trim().slice(-1);
  if (narrativa.length > 40 && !".!?\"'»)…".includes(fim)) {
    narrativa = narrativa.trim() + " […]";
  }
  return { narrativa: narrativa || "…", rolagem, mudancas, sugestoes };
}

async function chamarMestre(system, historico) {
  /* histórico já está no formato Messages API: [{role, content}, ...] */
  const texto = await chamarModelo(system, historico.slice(-40), 1000, "json");
  return extrairJSON(texto);
}

async function gerarLivro(livroAtual, narrativas) {
  const system = `Você é o arquivista de uma campanha de RPG. Atualize o LIVRO DA CAMPANHA: um registro fiel e conciso dos FATOS que o Mestre precisa lembrar para manter continuidade. Em tópicos curtos: NPCs conhecidos e a relação com o herói; promessas/dívidas/juramentos; inimigos e aliados; locais importantes; itens/segredos; pontas soltas. Máx 220 palavras. Responda SOMENTE com o texto do livro em tópicos, sem preâmbulo.`;
  const conteudo = `LIVRO ATUAL:
${livroAtual || "(vazio)"}

NOVOS ACONTECIMENTOS (mais recentes):
${narrativas.slice(-16).join("\n\n")}`;
  try {
    const r = await chamarModelo(system, [{ role: "user", content: conteudo }], 600, "texto");
    return (r || "").trim();
  } catch {
    return livroAtual;
  }
}

/* ---------------- UI básicos ---------------- */

function Botao({ children, onClick, primario, desativado, pequeno, className = "" }) {
  return (
    <button onClick={onClick} disabled={desativado}
      className={`tv-mono rounded-lg transition-all ${pequeno ? "px-3 py-1.5 text-xs" : "px-5 py-3 text-sm"} ${className}`}
      style={{
        background: primario ? T.amber : "transparent",
        color: primario ? T.onAccent : T.inkDim,
        border: primario ? "none" : `1px solid ${T.line}`,
        opacity: desativado ? 0.4 : 1, cursor: desativado ? "not-allowed" : "pointer",
        fontWeight: 600, letterSpacing: "0.04em",
      }}>
      {children}
    </button>
  );
}

function IconeD20({ tamanho = 22, cor = T.amber }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <path d="M12 2 L21 7.5 L21 16.5 L12 22 L3 16.5 L3 7.5 Z" stroke={cor} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12 2 L12 8.5 M12 8.5 L3 7.5 M12 8.5 L21 7.5 M12 8.5 L6.5 15.5 M12 8.5 L17.5 15.5 M6.5 15.5 L3 7.5 M17.5 15.5 L21 7.5 M6.5 15.5 L12 22 M17.5 15.5 L12 22 M6.5 15.5 L17.5 15.5" stroke={cor} strokeWidth="0.9" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}

function IconeCaneca({ tamanho = 20, cor = T.inkDim }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <path d="M6 6 h10 v13 a1.5 1.5 0 0 1 -1.5 1.5 h-7 A1.5 1.5 0 0 1 6 19 Z" stroke={cor} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M16 9.5 h2.2 a2 2 0 0 1 2 2 v2.5 a2 2 0 0 1 -2 2 H16" stroke={cor} strokeWidth="1.5" />
      <path d="M6 6 c1 -2.2 9 -2.2 10 0" stroke={cor} strokeWidth="1.5" />
      <path d="M9 10 v7 M12.5 10 v7" stroke={cor} strokeWidth="1.1" opacity="0.55" />
    </svg>
  );
}

function BarraMini({ rotulo, atual, max, cor, corBaixa }) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (atual / max) * 100 : 0));
  const baixa = pct <= 33;
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="tv-mono text-[10px] shrink-0" style={{ color: T.inkDim }}>{rotulo}</span>
      <div className="h-1.5 rounded-full flex-1 min-w-[32px] max-w-[90px] overflow-hidden" style={{ background: T.bg }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: baixa && corBaixa ? corBaixa : cor }} />
      </div>
      <span className="tv-mono text-[10px] shrink-0" style={{ color: baixa && corBaixa ? corBaixa : T.ink }}>{atual}/{max}</span>
    </div>
  );
}

/* ---------------- Retratos determinísticos (rosto consistente) ----------------
   O rosto de cada personagem é derivado de uma "semente" (o nome + um sufixo fixo
   criado na criação). O mesmo personagem gera SEMPRE o mesmo rosto — sem IA de
   imagem, sem custo, instantâneo, e com consistência perfeita entre cenas.
   Vestimenta/equipamento podem mudar por cima; o rosto nunca muda. */

function hashSemente(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}
/* gerador pseudoaleatório determinístico a partir da semente */
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
function escolher(rand, arr) { return arr[Math.floor(rand() * arr.length)]; }

const PELE = ["#F2D2B6", "#E8B893", "#D89B6E", "#B87A4E", "#8C5A38", "#6B4226", "#F5DCC4", "#C68A5E"];
const CABELO = ["#1A1310", "#3B2415", "#6B4226", "#A6641E", "#C9A227", "#8C8C8C", "#D8D8D8", "#5B2A86", "#7A1F1F", "#2E4A3B"];
const OLHOS = ["#4A3728", "#5B7A3A", "#3A5A7A", "#6B4226", "#3B3B3B", "#7A5A2E"];

/* deriva os traços visuais a partir da semente (determinístico) */
function tracos(semente) {
  const rand = rng(hashSemente(semente || "herói"));
  return {
    pele: escolher(rand, PELE),
    cabelo: escolher(rand, CABELO),
    olhos: escolher(rand, OLHOS),
    formatoRosto: Math.floor(rand() * 3),   // 0 oval, 1 quadrado, 2 fino
    penteado: Math.floor(rand() * 5),
    barba: rand() < 0.45 ? Math.floor(rand() * 3) + 1 : 0,
    sobrancelha: 0.2 + rand() * 0.3,
    marca: rand() < 0.3 ? Math.floor(rand() * 3) : -1, // cicatriz/pintura
    fundo: escolher(rand, ["#241C33", "#2A2036", "#1E2A33", "#33241C", "#2A2A33"]),
  };
}

/* estado: "normal" | "ferido" (PV ≤ 2/3) | "grave" (PV ≤ 1/3) | "furioso" (inimigo pressionado).
   O ROSTO BASE nunca muda (mesma semente = mesmos traços); só expressão e marcas mudam. */
function estadoDe(vida, vidaMax, inimigo = false) {
  const r = vidaMax > 0 ? vida / vidaMax : 1;
  if (inimigo) return r <= 0.25 ? "grave" : r <= 0.55 ? "furioso" : "normal";
  return r <= 0.33 ? "grave" : r <= 0.66 ? "ferido" : "normal";
}

function Retrato({ semente, tamanho = 44, anel = T.line, corSubstituta, estado = "normal" }) {
  const grave = estado === "grave", ferido = estado === "ferido", furioso = estado === "furioso";
  const sobAng = furioso ? 12 : grave ? -10 : ferido ? -5 : 0;   // + = brava, − = aflita
  const bocaCurva = furioso || grave ? -2.5 : ferido ? -1 : 2;   // + sorriso, − careta
  const t = tracos(semente);
  const cx = 32, cy = 30;
  const rostoW = t.formatoRosto === 1 ? 20 : t.formatoRosto === 2 ? 15 : 17;
  const rostoH = t.formatoRosto === 2 ? 23 : 21;
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" style={{ borderRadius: "50%", border: `2px solid ${anel}`, background: corSubstituta || t.fundo, display: "block" }}>
      {/* pescoço */}
      <rect x={cx - 6} y={cy + 12} width="12" height="12" rx="3" fill={t.pele} />
      {/* cabelo atrás */}
      {t.penteado !== 4 && <ellipse cx={cx} cy={cy - 2} rx={rostoW + 3} ry={rostoH} fill={t.cabelo} />}
      {/* rosto */}
      <ellipse cx={cx} cy={cy} rx={rostoW} ry={rostoH} fill={t.pele} />
      {/* orelhas */}
      <circle cx={cx - rostoW} cy={cy + 2} r="3" fill={t.pele} />
      <circle cx={cx + rostoW} cy={cy + 2} r="3" fill={t.pele} />
      {/* cabelo na frente (penteados) */}
      {t.penteado === 0 && <path d={`M${cx - rostoW - 2} ${cy - 4} Q${cx} ${cy - rostoH - 6} ${cx + rostoW + 2} ${cy - 4} Q${cx} ${cy - rostoH + 2} ${cx - rostoW - 2} ${cy - 4}`} fill={t.cabelo} />}
      {t.penteado === 1 && <path d={`M${cx - rostoW - 2} ${cy - 6} Q${cx - 4} ${cy - rostoH - 4} ${cx + rostoW + 2} ${cy - 8} L${cx + rostoW} ${cy - 2} Q${cx} ${cy - rostoH + 1} ${cx - rostoW - 2} ${cy - 2} Z`} fill={t.cabelo} />}
      {t.penteado === 2 && <><ellipse cx={cx} cy={cy - rostoH + 2} rx={rostoW} ry="7" fill={t.cabelo} /><rect x={cx - rostoW - 3} y={cy - 6} width="3" height="16" rx="1.5" fill={t.cabelo} /><rect x={cx + rostoW} y={cy - 6} width="3" height="16" rx="1.5" fill={t.cabelo} /></>}
      {t.penteado === 3 && <path d={`M${cx - rostoW - 1} ${cy - 3} Q${cx} ${cy - rostoH - 7} ${cx + rostoW + 1} ${cy - 3} L${cx + rostoW + 1} ${cy - 8} Q${cx} ${cy - rostoH - 2} ${cx - rostoW - 1} ${cy - 8} Z`} fill={t.cabelo} />}
      {t.penteado === 4 && <path d={`M${cx - rostoW + 2} ${cy - rostoH + 4} Q${cx} ${cy - rostoH - 3} ${cx + rostoW - 2} ${cy - rostoH + 4}`} stroke={t.cabelo} strokeWidth="3" fill="none" strokeLinecap="round" />}
      {/* sobrancelhas com ângulo de expressão */}
      <rect x={cx - 9} y={cy - 4} width="6" height="1.6" rx="0.8" fill={t.cabelo} opacity={t.sobrancelha + 0.4} transform={`rotate(${-sobAng} ${cx - 6} ${cy - 3})`} />
      <rect x={cx + 3} y={cy - 4} width="6" height="1.6" rx="0.8" fill={t.cabelo} opacity={t.sobrancelha + 0.4} transform={`rotate(${sobAng} ${cx + 6} ${cy - 3})`} />
      {/* olhos (semicerrados quando furioso; olheiras quando grave) */}
      <ellipse cx={cx - 6} cy={cy} rx="2.4" ry={furioso ? 2 : 2.8} fill="#FFF" />
      <ellipse cx={cx + 6} cy={cy} rx="2.4" ry={furioso ? 2 : 2.8} fill="#FFF" />
      <circle cx={cx - 6} cy={cy + 0.5} r="1.5" fill={t.olhos} />
      <circle cx={cx + 6} cy={cy + 0.5} r="1.5" fill={t.olhos} />
      {grave && <><path d={`M${cx - 8.5} ${cy + 3} q2.5 1.5 5 0`} stroke="#00000022" strokeWidth="1" fill="none" /><path d={`M${cx + 3.5} ${cy + 3} q2.5 1.5 5 0`} stroke="#00000022" strokeWidth="1" fill="none" /></>}
      {/* nariz */}
      <path d={`M${cx} ${cy} L${cx - 1.5} ${cy + 5} Q${cx} ${cy + 6.5} ${cx + 1.5} ${cy + 5}`} stroke={t.pele} strokeWidth="1" fill="none" style={{ filter: "brightness(0.8)" }} />
      <path d={`M${cx} ${cy + 1} L${cx - 1.5} ${cy + 5} Q${cx} ${cy + 6} ${cx + 1.5} ${cy + 5}`} stroke="#00000022" strokeWidth="1" fill="none" />
      {/* boca com curva de expressão */}
      <path d={`M${cx - 4} ${cy + 9 - bocaCurva / 2} Q${cx} ${cy + 9 + bocaCurva} ${cx + 4} ${cy + 9 - bocaCurva / 2}`} stroke="#00000044" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {furioso && <path d={`M${cx - 3} ${cy + 10.5} L${cx + 3} ${cy + 10.5}`} stroke="#00000033" strokeWidth="0.8" />}
      {/* barba */}
      {t.barba === 1 && <path d={`M${cx - rostoW + 2} ${cy + 6} Q${cx} ${cy + rostoH + 4} ${cx + rostoW - 2} ${cy + 6} Q${cx} ${cy + rostoH - 2} ${cx - rostoW + 2} ${cy + 6}`} fill={t.cabelo} opacity="0.9" />}
      {t.barba === 2 && <ellipse cx={cx} cy={cy + rostoH - 4} rx="6" ry="5" fill={t.cabelo} opacity="0.9" />}
      {t.barba === 3 && <path d={`M${cx - 8} ${cy + 8} Q${cx} ${cy + 10} ${cx + 8} ${cy + 8} Q${cx + 6} ${cy + 16} ${cx} ${cy + 16} Q${cx - 6} ${cy + 16} ${cx - 8} ${cy + 8}`} fill={t.cabelo} opacity="0.85" />}
      {/* marca/cicatriz */}
      {t.marca === 0 && <line x1={cx + 5} y1={cy - 6} x2={cx + 8} y2={cy + 4} stroke="#00000055" strokeWidth="1" />}
      {t.marca === 1 && <path d={`M${cx - 10} ${cy - 2} q2 -3 4 0`} stroke="#7A1F1F" strokeWidth="1.2" fill="none" opacity="0.6" />}
      {t.marca === 2 && <circle cx={cx - 7} cy={cy + 6} r="1" fill="#00000033" />}
      {/* estado por cima (não altera o rosto base) */}
      {grave && <ellipse cx={cx} cy={cy} rx={rostoW} ry={rostoH} fill="#00000018" />}
      {(ferido || grave) && <line x1={cx - rostoW + 4} y1={cy + 3} x2={cx - rostoW + 8} y2={cy + 7} stroke="#7A1F1F" strokeWidth="1.3" opacity="0.8" />}
      {grave && <><rect x={cx - 2} y={cy - rostoH + 3} width="11" height="3.5" rx="1.7" fill="#D8D0C0" transform={`rotate(18 ${cx} ${cy - rostoH + 4})`} /><circle cx={cx + rostoW - 4} cy={cy + 8} r="1.4" fill="#7A1F1F" opacity="0.7" /></>}
    </svg>
  );
}

/* semente estável do personagem: fixada na criação e nunca mais alterada */
function sementeDe(ent) {
  return ent?.semente || ent?.nome || "herói";
}

/* ---------------- Overlay do dado ---------------- */

function OverlayDado({ rolagem, modificador, aoConcluir }) {
  const [faseD, setFaseD] = useState("rolando");
  const [valor, setValor] = useState(1);
  const [par, setPar] = useState(null); // [a,b] quando há vantagem/desvantagem
  const vant = !!rolagem.vantagem, desv = !!rolagem.desvantagem;
  const modo = vant && !desv ? "vantagem" : desv && !vant ? "desvantagem" : null;
  const lados = 20;
  useEffect(() => {
    const inicio = Date.now();
    const iv = setInterval(() => {
      setValor(1 + Math.floor(Math.random() * lados));
      if (modo) setPar([1 + Math.floor(Math.random() * lados), 1 + Math.floor(Math.random() * lados)]);
      if (Date.now() - inicio > 1200) {
        clearInterval(iv);
        let final;
        if (modo) {
          const a = 1 + Math.floor(Math.random() * lados), b = 1 + Math.floor(Math.random() * lados);
          setPar([a, b]);
          final = modo === "vantagem" ? Math.max(a, b) : Math.min(a, b);
        } else {
          final = 1 + Math.floor(Math.random() * lados);
        }
        setValor(final);
        setFaseD("resultado");
        setTimeout(() => aoConcluir(final), 1600);
      }
    }, 70);
    return () => clearInterval(iv);
  }, []); // eslint-disable-line
  const total = valor + modificador;
  const dc = rolagem.dificuldade ?? null;
  const critico = faseD === "resultado" && valor === 20;
  const desastre = faseD === "resultado" && valor === 1;
  const passou = dc != null && (critico || (!desastre && total >= dc));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(8,6,14,0.88)", backdropFilter: "blur(4px)" }}>
      <div className="tv-fade flex flex-col items-center text-center max-w-sm w-full">
        <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.violetSoft }}>
          Teste de {rolagem.atributo || "sorte"}{dc != null ? ` · dificuldade ${dc}` : ""}
        </div>
        {modo && (
          <div className="tv-mono text-[11px] uppercase tracking-widest mb-1 px-2 py-0.5 rounded-full" style={{ color: modo === "vantagem" ? T.ok : T.danger, border: `1px solid ${modo === "vantagem" ? T.ok : T.danger}` }}>
            {modo === "vantagem" ? "✦ vantagem" : "✧ desvantagem"}{par ? ` · ${par[0]} / ${par[1]}` : ""}
          </div>
        )}
        <div className="tv-display text-2xl mb-8" style={{ color: T.ink }}>{rolagem.motivo}</div>
        <div className={`relative flex items-center justify-center ${faseD === "rolando" ? "tv-dice" : ""}`}
          style={{
            width: 148, height: 148,
            clipPath: "polygon(50% 0%, 100% 27%, 100% 73%, 50% 100%, 0% 73%, 0% 27%)",
            background: faseD === "resultado" ? (desastre ? T.danger : critico ? T.amberSoft : passou || dc == null ? T.amber : T.panelSoft) : T.panelSoft,
            border: `2px solid ${T.amber}`, transition: "background .4s",
          }}>
          <span className="tv-mono font-semibold" style={{ fontSize: 52, color: faseD === "resultado" && (passou || critico || dc == null) && !desastre ? T.onAccent : T.ink }}>{valor}</span>
        </div>
        {faseD === "resultado" && (
          <div className="mt-6 tv-fade">
            <div className="tv-mono text-sm" style={{ color: T.inkDim }}>
              {valor} {modificador !== 0 ? `${modificador > 0 ? "+" : "−"} ${Math.abs(modificador)} = ` : ""}
              <span style={{ color: T.ink, fontWeight: 600 }}>{total}</span>
            </div>
            <div className="tv-display text-3xl mt-1" style={{ color: desastre ? T.danger : critico ? T.amberSoft : passou || dc == null ? T.ok : T.danger }}>
              {critico ? "Crítico!" : desastre ? "Desastre!" : dc == null ? "Rolado" : passou ? "Sucesso" : "Falha"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Modal de nível ---------------- */

function ModalCena({ personagem, combate, mundo, nomeCampanha, fechar }) {
  const aliados = [personagem, ...(personagem.grupo || [])];
  const inimigos = (combate?.inimigos || []).filter((e) => !e.derrotado);
  const climaFundo = {
    "Fantasia medieval": "linear-gradient(160deg,#2A2036,#1a1420)",
    "Ficção científica": "linear-gradient(160deg,#16232e,#0e1620)",
    "Cyberpunk": "linear-gradient(160deg,#2a1030,#10121e)",
    "Horror cósmico": "linear-gradient(160deg,#1a1420,#0a0a10)",
    "Pós-apocalíptico": "linear-gradient(160deg,#2b2418,#161208)",
    "Steampunk": "linear-gradient(160deg,#2a2018,#15100a)",
  }[mundo.genero] || "linear-gradient(160deg,#241C33,#12101a)";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(8,6,14,0.92)", backdropFilter: "blur(4px)" }} onClick={fechar}>
      <div className="tv-fade w-full max-w-lg rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.amber}` }} onClick={(e) => e.stopPropagation()}>
        <div className="p-5" style={{ background: climaFundo }}>
          <div className="tv-mono text-[10px] uppercase tracking-[0.3em] mb-4 text-center" style={{ color: T.amberSoft }}>{nomeCampanha} · cena</div>
          <div className="flex flex-wrap items-end justify-center gap-3 mb-2">
            {aliados.map((a, i) => (
              <div key={i} className="flex flex-col items-center gap-1" style={{ width: 74 }}>
                <Retrato semente={sementeDe(a)} tamanho={i === 0 ? 60 : 50} anel={i === 0 ? T.amber : T.violet} estado={estadoDe(a.vida, a.vidaMax)} />
                <span className="tv-body text-xs text-center leading-tight truncate w-full" style={{ color: T.ink }}>{a.nome}</span>
                {i === 0 && <span className="tv-mono text-[8px] uppercase" style={{ color: T.amberSoft }}>você</span>}
              </div>
            ))}
          </div>
          {inimigos.length > 0 && (
            <>
              <div className="flex items-center gap-2 my-3">
                <div className="h-px flex-1" style={{ background: T.danger, opacity: 0.5 }} />
                <span className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.danger }}>⚔ contra</span>
                <div className="h-px flex-1" style={{ background: T.danger, opacity: 0.5 }} />
              </div>
              <div className="flex flex-wrap items-end justify-center gap-3">
                {inimigos.map((e, i) => (
                  <div key={i} className="flex flex-col items-center gap-1" style={{ width: 74 }}>
                    <Retrato semente={sementeDe(e)} tamanho={54} anel={T.danger} estado={estadoDe(e.vida, e.vidaMax, true)} />
                    <span className="tv-body text-xs text-center leading-tight truncate w-full" style={{ color: T.ink }}>{e.nome}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="p-4 flex items-center justify-between" style={{ background: T.panel, borderTop: `1px solid ${T.line}` }}>
          <span className="tv-body text-xs italic" style={{ color: T.inkDim }}>{mundo.genero}</span>
          <Botao primario pequeno onClick={fechar}>Fechar</Botao>
        </div>
      </div>
    </div>
  );
}

function ModalNivel({ nivel, personagem, escolher }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(8,6,14,0.9)", backdropFilter: "blur(4px)" }}>
      <div className="tv-fade w-full max-w-md rounded-2xl p-6 tv-scroll overflow-y-auto" style={{ background: T.panel, border: `1px solid ${T.amber}`, maxHeight: "90vh" }}>
        <div className="text-center mb-5">
          <div className="tv-mono text-xs uppercase tracking-widest mb-1" style={{ color: T.amberSoft }}>✦ Nível alcançado ✦</div>
          <div className="tv-display text-5xl" style={{ color: T.ink }}>Nível {nivel}</div>
          <div className="tv-body text-sm mt-2" style={{ color: T.inkDim }}>+3 PV máx · +2 PM máx · vida e mana restauradas.<br />Escolha um atributo para fortalecer:</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ATRIBUTOS.map((a) => {
            const atual = personagem.atributos[a.id];
            const noMax = atual >= ATRIBUTO_MAX;
            return (
              <button key={a.id} onClick={() => !noMax && escolher(a.id)} disabled={noMax}
                className="rounded-xl p-3 text-left transition-all"
                style={{ background: T.panelSoft, border: `1px solid ${noMax ? T.line : T.amber}`, opacity: noMax ? 0.4 : 1, cursor: noMax ? "not-allowed" : "pointer" }}>
                <div className="flex items-baseline justify-between">
                  <span className="tv-display text-lg" style={{ color: T.ink }}>{a.nome}</span>
                  <span className="tv-mono text-xs" style={{ color: T.amber }}>+{atual} → +{Math.min(ATRIBUTO_MAX, atual + 1)}</span>
                </div>
                <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{a.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Painel lateral (Ficha/Grupo/Bolsa) ---------------- */

const ABAS = [{ id: "ficha", rotulo: "Ficha", icone: "☰" }, { id: "grupo", rotulo: "Grupo", icone: "⚑" }, { id: "inv", rotulo: "Bolsa", icone: "◆" }];

const RARIDADE_COR = { comum: "#9B93AC", incomum: "#7BC98F", raro: "#6BA9E8", epico: "#B084E8", lendario: "#E8A33D" };
const SLOT_ROTULO = { arma: "Arma", armadura: "Armadura", elmo: "Elmo", botas: "Botas", anel: "Anel", amuleto: "Amuleto", escudo: "Escudo" };
const SLOTS_ORDEM = ["arma", "escudo", "armadura", "elmo", "botas", "anel", "amuleto"];

function TrilhoAbas({ abaAtiva, aoClicar, nGrupo }) {
  return (
    <nav className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1.5 py-2 pl-1.5" aria-label="Painéis">
      {ABAS.map((aba) => {
        const ativa = abaAtiva === aba.id;
        return (
          <button key={aba.id} onClick={() => aoClicar(ativa ? null : aba.id)}
            className="flex flex-col items-center justify-center gap-0.5 rounded-l-xl transition-all"
            style={{ width: 52, height: 58, background: ativa ? T.panelSoft : T.panel, border: `1px solid ${ativa ? T.amber : T.line}`, borderRight: "none", color: ativa ? T.amberSoft : T.inkDim }}>
            <span className="text-base leading-none">{aba.icone}</span>
            <span className="tv-mono text-[9px] uppercase tracking-wider">{aba.rotulo}</span>
            {aba.id === "grupo" && nGrupo > 0 && <span className="tv-mono text-[9px] leading-none rounded-full px-1" style={{ background: T.violet, color: T.onSecond }}>{nGrupo}</span>}
          </button>
        );
      })}
    </nav>
  );
}

function CartaoMembro({ nome, subtitulo, nivel, vida, vidaMax, mana, manaMax, descricao, habilidades, ehVoce, semente }) {
  return (
    <div className="rounded-xl p-4" style={{ background: T.panelSoft, border: `1px solid ${ehVoce ? T.amber : T.line}` }}>
      <div className="flex items-start gap-3">
        <Retrato semente={semente || nome} tamanho={48} anel={ehVoce ? T.amber : T.line} estado={estadoDe(vida, vidaMax)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="tv-display text-xl leading-tight truncate" style={{ color: T.ink }}>{nome}</div>
            <div className="flex items-center gap-1.5 shrink-0">
              {nivel != null && <span className="tv-mono text-[10px]" style={{ color: T.amberSoft }}>NV {nivel}</span>}
              {ehVoce && <span className="tv-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: T.amber, color: T.onAccent }}>Você</span>}
            </div>
          </div>
          <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>{subtitulo}</div>
        </div>
      </div>
      <div className="space-y-2 mt-3">
        <BarraMini rotulo="PV" atual={vida} max={vidaMax} cor={T.amber} corBaixa={T.danger} />
        {manaMax != null && <BarraMini rotulo="PM" atual={mana} max={manaMax} cor={T.violet} />}
      </div>
      {habilidades && habilidades.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {habilidades.map((h, i) => (
            <span key={i} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: T.panel, color: T.violetSoft, border: `1px solid ${T.line}` }} title={h.descricao}>{h.nome}{h.custo != null ? ` · ${h.custo}PM` : ""}</span>
          ))}
        </div>
      )}
      {descricao && <div className="tv-body text-xs mt-3" style={{ color: T.inkDim }}>{descricao}</div>}
    </div>
  );
}

function PainelLateral({ aba, fechar, personagem, mundo, equipar, desequipar, descartarItem, descartarEquip }) {
  if (!aba) return null;
  const xpProx = XP_POR_NIVEL(personagem.nivel);
  const equipados = personagem.equipados || {};
  const equipDisponivel = (personagem.equipamento || []).filter((e) => !Object.values(equipados).some((x) => x?.nome === e.nome));
  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,.45)" }} onClick={fechar} />
      <aside className="tv-slide tv-scroll fixed right-0 inset-y-0 z-40 w-80 max-w-[88vw] overflow-y-auto p-5 flex flex-col gap-5" style={{ background: T.panel, borderLeft: `1px solid ${T.line}` }}>
        <div className="flex items-center justify-between">
          <h2 className="tv-display text-2xl" style={{ color: T.ink }}>{aba === "ficha" ? "Ficha" : aba === "grupo" ? "Grupo" : "Inventário"}</h2>
          <button onClick={fechar} className="tv-mono text-lg px-2" style={{ color: T.inkDim }}>✕</button>
        </div>

        {aba === "ficha" && (
          <>
            <div className="flex items-center gap-3">
              <Retrato semente={sementeDe(personagem)} tamanho={64} anel={T.amber} estado={estadoDe(personagem.vida, personagem.vidaMax)} />
              <div className="min-w-0">
                <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.violetSoft }}>{mundo.genero} · Nível {personagem.nivel}</div>
                <div className="tv-display text-3xl leading-tight" style={{ color: T.ink }}>{personagem.nome}</div>
                <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>{personagem.conceito}</div>
              </div>
            </div>
            <div className="space-y-2.5">
              <BarraMini rotulo="PV" atual={personagem.vida} max={personagem.vidaMax} cor={T.amber} corBaixa={T.danger} />
              <BarraMini rotulo="PM" atual={personagem.mana} max={personagem.manaMax} cor={T.violet} />
              <BarraMini rotulo="XP" atual={personagem.xp} max={xpProx} cor={T.ok} />
            </div>
            {(personagem.condicoes || []).length > 0 && (
              <div>
                <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Condições</div>
                <div className="space-y-1.5">
                  {personagem.condicoes.map((c, i) => (
                    <div key={i} className="rounded-lg px-3 py-2 flex items-center justify-between" style={{ background: T.panelSoft, border: `1px solid ${c.tipo === "bom" ? T.ok : T.danger}` }}>
                      <span className="tv-body text-sm" style={{ color: T.ink }}>{c.tipo === "bom" ? "✦" : "⚠"} {c.nome} <span className="tv-body text-xs italic" style={{ color: T.inkDim }}>{c.efeito}</span></span>
                      <span className="tv-mono text-[10px]" style={{ color: T.amberSoft }}>{c.turnos}t</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(personagem.efeitos || []).length > 0 && (
              <div>
                <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.violetSoft }}>Efeitos ativos</div>
                <div className="space-y-1.5">
                  {personagem.efeitos.map((e, i) => (
                    <div key={i} className="rounded-lg px-3 py-2 flex items-center justify-between" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
                      <span className="tv-body text-sm" style={{ color: T.ink }}>✧ {e.nome} <span className="tv-mono text-[10px]" style={{ color: T.violetSoft }}>+{e.bonus} {e.aplica}</span></span>
                      <span className="tv-mono text-[10px]" style={{ color: T.amberSoft }}>{e.turnos}t</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Atributos</div>
              <div className="grid grid-cols-2 gap-2">
                {ATRIBUTOS.map((a) => {
                  const base = personagem.atributos[a.id] || 0;
                  const efetivo = atributoEfetivo(personagem, a.id);
                  const bonus = efetivo - base;
                  return (
                    <div key={a.id} className="rounded-lg px-3 py-2 flex items-center justify-between" style={{ background: T.panelSoft }}>
                      <span className="tv-body text-sm" style={{ color: T.ink }}>{a.nome.slice(0, 3).toUpperCase()}</span>
                      <span className="tv-mono text-sm font-semibold" style={{ color: bonus > 0 ? T.ok : T.amber }}>+{efetivo}{bonus > 0 ? <span className="text-[9px]" style={{ color: T.inkDim }}> ({base}+{bonus})</span> : null}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Habilidades</div>
              {personagem.habilidades.length === 0 ? <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Nenhuma ainda.</div> : (
                <ul className="space-y-2">
                  {personagem.habilidades.map((h, i) => (
                    <li key={i} className="rounded-lg px-3 py-2" style={{ background: T.panelSoft }}>
                      <div className="flex items-baseline justify-between gap-2"><span className="tv-body text-sm" style={{ color: T.ink }}>{h.nome}</span><span className="tv-mono text-[10px]" style={{ color: T.violetSoft }}>{h.custo} PM</span></div>
                      <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{h.descricao}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {personagem.historia && (
              <div>
                <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>História</div>
                <div className="tv-body text-sm" style={{ color: T.inkDim }}>{personagem.historia}</div>
              </div>
            )}
          </>
        )}

        {aba === "grupo" && (
          <>
            <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.inkDim }}>Grupo · {1 + personagem.grupo.length} de {1 + MAX_COMPANHEIROS}</div>
            <CartaoMembro nome={personagem.nome} subtitulo={personagem.conceito} nivel={personagem.nivel} vida={personagem.vida} vidaMax={personagem.vidaMax} mana={personagem.mana} manaMax={personagem.manaMax} habilidades={personagem.habilidades} semente={sementeDe(personagem)} ehVoce />
            {personagem.grupo.length === 0 ? (
              <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Você viaja sozinho — por enquanto. Aliados podem se juntar a você.</div>
            ) : personagem.grupo.map((m, i) => (
              <CartaoMembro key={i} nome={m.nome} subtitulo={m.conceito} nivel={m.nivel} vida={m.vida} vidaMax={m.vidaMax} descricao={m.descricao} habilidades={m.habilidades} semente={sementeDe(m)} />
            ))}
          </>
        )}

        {aba === "inv" && (
          <>
            <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
              <span className="tv-mono text-xs uppercase tracking-widest" style={{ color: T.inkDim }}>Moedas</span>
              <span className="tv-mono text-xl font-semibold" style={{ color: T.amberSoft }}>◉ {personagem.moedas}</span>
            </div>

            {/* Equipado */}
            <div>
              <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Equipado</div>
              {Object.keys(equipados).length === 0 ? (
                <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Nada equipado. Equipe itens abaixo para ganhar bônus.</div>
              ) : (
                <div className="space-y-2">
                  {SLOTS_ORDEM.filter((s) => equipados[s]).map((slot) => {
                    const it = equipados[slot];
                    return (
                      <div key={slot} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${RARIDADE_COR[it.raridade] || T.line}` }}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="tv-body text-sm truncate" style={{ color: T.ink }}>{it.nome}</div>
                            <div className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: RARIDADE_COR[it.raridade] || T.inkDim }}>{SLOT_ROTULO[it.tipo] || it.tipo} · {it.raridade}</div>
                          </div>
                          <button onClick={() => desequipar(slot)} className="tv-mono text-[10px] px-2 py-1 rounded shrink-0" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>tirar</button>
                        </div>
                        {(it.atributos && Object.keys(it.atributos).length > 0) && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {Object.entries(it.atributos).map(([k, v]) => (
                              <span key={k} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: T.panel, color: T.ok }}>+{v} {(ATRIBUTOS.find((a) => a.id === k)?.nome || k).slice(0, 3).toUpperCase()}</span>
                            ))}
                          </div>
                        )}
                        {it.poder && <div className="tv-body text-xs mt-2" style={{ color: T.violetSoft }}>✦ {it.poder}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Equipamentos disponíveis */}
            {equipDisponivel.length > 0 && (
              <div>
                <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Equipamentos na mochila</div>
                <div className="space-y-2">
                  {equipDisponivel.map((it, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="tv-body text-sm truncate" style={{ color: T.ink }}>{it.nome}</div>
                          <div className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: RARIDADE_COR[it.raridade] || T.inkDim }}>{SLOT_ROTULO[it.tipo] || it.tipo} · {it.raridade}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0"><button onClick={() => descartarEquip(it.nome)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }} title="Descartar">✕</button><button onClick={() => equipar(it)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>equipar</button></div>
                      </div>
                      {(it.atributos && Object.keys(it.atributos).length > 0) && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {Object.entries(it.atributos).map(([k, v]) => (
                            <span key={k} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: T.panel, color: T.ok }}>+{v} {(ATRIBUTOS.find((a) => a.id === k)?.nome || k).slice(0, 3).toUpperCase()}</span>
                          ))}
                        </div>
                      )}
                      {it.poder && <div className="tv-body text-xs mt-2" style={{ color: T.violetSoft }}>✦ {it.poder}</div>}
                      {it.descricao && <div className="tv-body text-xs mt-1 italic" style={{ color: T.inkDim }}>{it.descricao}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bolsa (itens comuns) */}
            <div>
              <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Bolsa</div>
              {personagem.inventario.length === 0 ? <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Bolsos vazios — explore, negocie ou saqueie.</div> : (
                <ul className="space-y-2">
                  {Object.values(personagem.inventario.reduce((acc, raw) => {
                    const nome = typeof raw === "string" ? raw : (raw && raw.nome) || "item";
                    const descricao = typeof raw === "object" && raw ? (raw.descricao || "") : "";
                    if (!acc[nome]) acc[nome] = { nome, descricao, qtd: 0 };
                    if (descricao && !acc[nome].descricao) acc[nome].descricao = descricao;
                    acc[nome].qtd++; return acc;
                  }, {})).map((it, i) => (
                    <li key={i} className="rounded-lg px-3 py-2.5" style={{ background: T.panelSoft }}>
                      <div className="tv-body text-sm flex items-center gap-2.5" style={{ color: T.ink }}>
                        <span style={{ color: T.amber }}>◆</span>
                        <span className="flex-1 min-w-0">{it.nome}{it.qtd > 1 ? <span className="tv-mono text-[10px]" style={{ color: T.amberSoft }}> ×{it.qtd}</span> : null}</span>
                        <button onClick={() => descartarItem(it.nome)} className="tv-mono text-[10px] px-2 py-1 rounded shrink-0" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>soltar</button>
                      </div>
                      {it.descricao && <div className="tv-body text-xs mt-1 italic" style={{ color: T.inkDim, paddingLeft: "22px" }}>{it.descricao}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function PainelCombate({ combate }) {
  if (!combate || !combate.inimigos || combate.inimigos.length === 0) return null;
  return (
    <div className="tv-fade mx-4 md:mx-8 mt-1 mb-3 rounded-2xl p-3" style={{ background: T.panel, border: `1px solid ${T.danger}`, marginRight: "68px" }}>
      <div className="tv-mono text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: T.danger }}>
        <span>⚔ Em combate</span>
        <span style={{ color: T.inkDim }}>· {combate.inimigos.filter((e) => !e.derrotado).length} de pé</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {combate.inimigos.map((e, i) => (
          <div key={i} className="rounded-xl p-2.5" style={{ background: T.panelSoft, border: `1px solid ${e.derrotado ? T.line : T.danger}`, opacity: e.derrotado ? 0.5 : 1 }}>
            <div className="flex items-center gap-2.5">
              <div style={{ filter: e.derrotado ? "grayscale(1)" : "none" }}><Retrato semente={sementeDe(e)} tamanho={40} anel={e.derrotado ? T.line : T.danger} estado={estadoDe(e.vida, e.vidaMax, true)} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="tv-display text-lg leading-tight truncate" style={{ color: e.derrotado ? T.inkDim : T.ink, textDecoration: e.derrotado ? "line-through" : "none" }}>{e.nome}</span>
                  {e.derrotado && <span className="tv-mono text-[9px] uppercase shrink-0" style={{ color: T.inkDim }}>☠</span>}
                </div>
                {!e.derrotado && <div className="mt-1"><BarraMini rotulo="PV" atual={e.vida} max={e.vidaMax} cor={T.danger} corBaixa={T.danger} /></div>}
              </div>
            </div>
            {!e.derrotado && e.ameaca && <div className="tv-body text-xs mt-1.5 italic" style={{ color: T.inkDim }}>{e.ameaca}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PainelHabilidades({ personagem, selecionar, fechar }) {
  return (
    <div className="tv-fade mx-4 md:mx-8 mb-2 rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.violet}`, marginRight: "68px" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="tv-mono text-xs uppercase tracking-widest" style={{ color: T.violetSoft }}>Habilidades · {personagem.mana}/{personagem.manaMax} PM · toque para selecionar</div>
        <button onClick={fechar} className="tv-mono text-sm px-1.5" style={{ color: T.inkDim }}>✕</button>
      </div>
      {personagem.habilidades.length === 0 ? (
        <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Você ainda não despertou nenhuma habilidade. Elas virão com a história.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-2">
          {(personagem.habilidades || []).filter((h) => h && h.nome).map((h, i) => {
            const custo = Math.max(0, Number(h.custo) || 0);
            const semMana = personagem.mana < custo;
            return (
              <button key={i} onClick={() => !semMana && selecionar(h)} disabled={semMana} className="text-left rounded-xl p-3 transition-all"
                style={{ background: T.panelSoft, border: `1px solid ${semMana ? T.line : T.violet}`, opacity: semMana ? 0.45 : 1, cursor: semMana ? "not-allowed" : "pointer" }}>
                <div className="flex items-baseline justify-between gap-2"><span className="tv-display text-lg leading-none" style={{ color: T.ink }}>{h.nome}</span><span className="tv-mono text-[10px] shrink-0" style={{ color: semMana ? T.danger : T.violetSoft }}>{custo} PM</span></div>
                <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{h.descricao}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- Telas de criação ---------------- */

function TelaMundo({ concluir }) {
  const [nome, setNome] = useState("");
  const [genero, setGenero] = useState(null);
  const [descricao, setDescricao] = useState("");
  const campo = { background: T.panel, border: `1px solid ${T.line}`, color: T.ink };
  return (
    <div className="tv-fade max-w-2xl mx-auto w-full px-6 py-10 overflow-y-auto tv-scroll">
      <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.violetSoft }}>Passo 1 de 2 · O mundo</div>
      <h1 className="tv-display text-4xl md:text-5xl mb-3" style={{ color: T.ink }}>Que realidade vamos criar?</h1>
      <p className="tv-body mb-6" style={{ color: T.inkDim }}>Dê um nome à campanha, escolha um gênero e descreva o que quiser. O Mestre preenche o resto com detalhes vivos.</p>
      <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da campanha (ex.: A Maré de Ferro)" maxLength={40} className="w-full rounded-xl p-4 tv-body text-sm outline-none mb-4" style={campo} />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {GENEROS.map((g) => (
          <button key={g.id} onClick={() => setGenero(g)} className="text-left rounded-xl p-4 transition-all" style={{ background: genero?.id === g.id ? T.panelSoft : T.panel, border: `1px solid ${genero?.id === g.id ? T.amber : T.line}` }}>
            <div className="tv-display text-lg" style={{ color: genero?.id === g.id ? T.amberSoft : T.ink }}>{g.label}</div>
            <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{g.dica}</div>
          </button>
        ))}
      </div>
      <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} placeholder="Ex.: Um arquipélago flutuante onde a magia vem das marés. Piratas do céu disputam relíquias de um império afundado nas nuvens…" className="w-full rounded-xl p-4 tv-body text-sm outline-none resize-none" style={campo} />
      <div className="mt-6 flex justify-end">
        <Botao primario desativado={!genero || !nome.trim()} onClick={() => concluir({ genero: genero.label, descricao }, nome.trim())}>Continuar →</Botao>
      </div>
    </div>
  );
}

function TelaPersonagem({ mundo, concluir }) {
  const [nome, setNome] = useState("");
  const [conceito, setConceito] = useState("");
  const [historia, setHistoria] = useState("");
  const [atributos, setAtributos] = useState(Object.fromEntries(ATRIBUTOS.map((a) => [a.id, 0])));
  const usados = Object.values(atributos).reduce((s, v) => s + v, 0);
  const restantes = PONTOS_TOTAIS - usados;
  const vidaMax = 10 + atributos.vigor * 2;
  const manaMax = 8 + atributos.intelecto * 2;
  const ajustar = (id, d) => {
    const nv = atributos[id] + d;
    if (nv < 0 || nv > ATRIBUTO_MAX_CRIACAO) return;
    if (d > 0 && restantes <= 0) return;
    setAtributos({ ...atributos, [id]: nv });
  };
  const campo = { background: T.panel, border: `1px solid ${T.line}`, color: T.ink };
  return (
    <div className="tv-fade max-w-2xl mx-auto w-full px-6 py-10 overflow-y-auto tv-scroll">
      <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.violetSoft }}>Passo 2 de 2 · O herói (ou não)</div>
      <h1 className="tv-display text-4xl md:text-5xl mb-3" style={{ color: T.ink }}>Quem entra nesse mundo?</h1>
      <p className="tv-body mb-8" style={{ color: T.inkDim }}>Mundo: <em style={{ color: T.amberSoft }}>{mundo.genero}</em>. Dê nome, conceito e distribua {PONTOS_TOTAIS} pontos.</p>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do personagem" className="rounded-xl p-4 tv-body text-sm outline-none" style={campo} />
        <input value={conceito} onChange={(e) => setConceito(e.target.value)} placeholder="Conceito (ex.: ladra de relíquias arrependida)" className="rounded-xl p-4 tv-body text-sm outline-none" style={campo} />
      </div>
      <textarea value={historia} onChange={(e) => setHistoria(e.target.value)} rows={3} placeholder="História e segredos (opcional) — o Mestre vai usar isso contra e a favor de você…" className="w-full rounded-xl p-4 tv-body text-sm outline-none resize-none mb-6" style={campo} />
      <div className="flex items-baseline justify-between mb-3">
        <div className="tv-mono text-xs uppercase tracking-widest" style={{ color: T.inkDim }}>Atributos (0 a +{ATRIBUTO_MAX_CRIACAO})</div>
        <div className="tv-mono text-sm" style={{ color: restantes === 0 ? T.ok : T.amber }}>{restantes} ponto{restantes !== 1 ? "s" : ""} restante{restantes !== 1 ? "s" : ""}</div>
      </div>
      <div className="grid md:grid-cols-2 gap-3 mb-6">
        {ATRIBUTOS.map((a) => (
          <div key={a.id} className="rounded-xl p-4 flex items-center justify-between gap-3" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
            <div><div className="tv-display text-lg leading-none" style={{ color: T.ink }}>{a.nome}</div><div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{a.desc}</div></div>
            <div className="flex items-center gap-2">
              <Botao pequeno onClick={() => ajustar(a.id, -1)}>−</Botao>
              <span className="tv-mono w-8 text-center font-semibold" style={{ color: T.amber }}>+{atributos[a.id]}</span>
              <Botao pequeno onClick={() => ajustar(a.id, 1)}>+</Botao>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="tv-mono text-xs" style={{ color: T.inkDim }}>PV: <span style={{ color: T.ink }}>{vidaMax}</span> · PM: <span style={{ color: T.violetSoft }}>{manaMax}</span> · Moedas: <span style={{ color: T.amberSoft }}>{MOEDAS_INICIAIS}</span></div>
        <Botao primario desativado={!nome.trim() || !conceito.trim() || restantes !== 0}
          onClick={() => concluir({
            nome: nome.trim(), conceito: conceito.trim(), historia: historia.trim(),
            semente: `${nome.trim()}|${conceito.trim()}|${Math.floor(Math.random() * 100000)}`,
            atributos, vida: vidaMax, vidaMax, mana: manaMax, manaMax,
            nivel: 1, xp: 0, moedas: MOEDAS_INICIAIS, nivelPendentes: 0,
            inventario: [], habilidades: [], grupo: [],
            efeitos: [], equipamento: [], equipados: {},
          })}>Começar aventura →</Botao>
      </div>
    </div>
  );
}

function TelaMenu({ irNovo, continuar, temSave }) {
  return (
    <div className="tv-fade flex-1 flex flex-col items-center justify-center px-6 py-10">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4"><IconeCaneca tamanho={52} cor={T.amber} /></div>
        <h1 className="tv-display text-6xl md:text-7xl tracking-wide" style={{ color: T.ink }}>{BRAND}</h1>
        <p className="tv-mono text-xs uppercase tracking-[0.3em] mt-2" style={{ color: T.inkDim }}>{SLOGAN}</p>
        <p className="tv-mono text-[9px] uppercase tracking-[0.2em] mt-3" style={{ color: T.amberSoft }}>v1.7 · interface fixa</p>
      </div>
      <div className="grid gap-4 w-full max-w-sm">
        {temSave && (
          <button onClick={() => continuar(false)} className="text-left rounded-2xl p-5 flex flex-col gap-1" style={{ background: T.panel, border: `1px solid ${T.amber}` }}>
            <div className="tv-display text-2xl" style={{ color: T.amberSoft }}>Continuar aventura</div>
            <div className="tv-body text-sm" style={{ color: T.inkDim }}>{temSave.nomeCampanha} · {temSave.personagem?.nome} · Nível {temSave.personagem?.nivel}</div>
          </button>
        )}
        {temSave && (
          <button onClick={() => continuar(true)} className="text-left rounded-2xl p-4 flex items-center gap-2" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
            <span style={{ color: T.amberSoft }}>📜</span>
            <span className="tv-body text-sm" style={{ color: T.ink }}>Continuar com resumo <span style={{ color: T.inkDim }}>— "Anteriormente, em…"</span></span>
          </button>
        )}
        <button onClick={irNovo} className="text-left rounded-2xl p-5 flex flex-col gap-1" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
          <div className="tv-display text-2xl" style={{ color: T.ink }}>{temSave ? "Nova campanha" : "Começar a jogar"}</div>
          <div className="tv-body text-sm" style={{ color: T.inkDim }}>Você, o Mestre e um mundo inteiro por criar</div>
        </button>
      </div>
      {temSave && <p className="tv-body text-xs mt-6" style={{ color: T.inkDim }}>Começar uma nova campanha substitui a anterior neste dispositivo.</p>}
    </div>
  );
}

/* ---------------- Aplicação de mudanças ---------------- */

function aplicarNivel(pers) {
  let { xp, nivel, nivelPendentes, vidaMax, manaMax, vida, mana } = pers;
  while (xp >= XP_POR_NIVEL(nivel)) {
    xp -= XP_POR_NIVEL(nivel); nivel += 1; nivelPendentes += 1;
    vidaMax += 3; manaMax += 2; vida = vidaMax; mana = manaMax;
  }
  return { ...pers, xp, nivel, nivelPendentes, vidaMax, manaMax, vida, mana };
}

function aplicarMudancas(pers, m, msgs) {
  let vida = Math.max(0, Math.min(pers.vidaMax, pers.vida + (m.vida || 0)));
  let mana = Math.max(0, Math.min(pers.manaMax, pers.mana + (m.mana || 0)));
  let moedas = Math.max(0, pers.moedas + (m.moedas || 0));
  const nomeItem = (x) => (typeof x === "string" ? x : (x && x.nome) || "");
  let inv = [...pers.inventario, ...(m.adicionar_itens || [])];
  inv = inv.filter((i) => !(m.remover_itens || []).some((r) => nomeItem(i).toLowerCase() === String(r).toLowerCase()));
  let habs = [...pers.habilidades];
  (m.adicionar_habilidades || []).forEach((h) => { if (h?.nome && !habs.some((x) => x.nome.toLowerCase() === h.nome.toLowerCase())) habs.push({ nome: h.nome, custo: Math.max(0, h.custo || 1), descricao: h.descricao || "" }); });
  habs = habs.filter((h) => !(m.remover_habilidades || []).some((r) => h.nome.toLowerCase() === r.toLowerCase()));
  let grupo = [...pers.grupo];
  (m.grupo_adicionar || []).forEach((g) => {
    if (!g?.nome || grupo.some((x) => x.nome.toLowerCase() === g.nome.toLowerCase())) return;
    if (grupo.length >= MAX_COMPANHEIROS) { msgs.push(`O grupo está cheio — ${g.nome} não pôde se juntar.`); return; }
    grupo.push({ nome: g.nome, conceito: g.conceito || "", nivel: g.nivel ?? 1, vida: g.vida ?? 10, vidaMax: g.vidaMax ?? g.vida ?? 10, descricao: g.descricao || "", habilidades: g.habilidades || [], semente: `npc|${g.nome}|${g.conceito || ""}` });
    msgs.push(`⚑ ${g.nome} juntou-se ao grupo!`);
  });
  (m.grupo_remover || []).forEach((nome) => { if (grupo.some((g) => g.nome.toLowerCase() === nome.toLowerCase())) { grupo = grupo.filter((g) => g.nome.toLowerCase() !== nome.toLowerCase()); msgs.push(`⚑ ${nome} deixou o grupo.`); } });
  (m.grupo_vida || []).forEach((gv) => { grupo = grupo.map((g) => g.nome.toLowerCase() === (gv.nome || "").toLowerCase() ? { ...g, vida: Math.max(0, Math.min(g.vidaMax, g.vida + (gv.vida || 0))) } : g); });
  (m.grupo_atualizar || []).forEach((ga) => {
    grupo = grupo.map((g) => {
      if (g.nome.toLowerCase() !== (ga.nome || "").toLowerCase()) return g;
      let gh = [...(g.habilidades || [])];
      (ga.adicionar_habilidades || []).forEach((h) => { if (h?.nome && !gh.some((x) => x.nome.toLowerCase() === h.nome.toLowerCase())) gh.push({ nome: h.nome, custo: h.custo ?? null, descricao: h.descricao || "" }); });
      if (ga.nivel && ga.nivel > (g.nivel ?? 1)) msgs.push(`✦ ${g.nome} evoluiu para o nível ${ga.nivel}!`);
      (ga.adicionar_habilidades || []).forEach((h) => h?.nome && msgs.push(`✦ ${g.nome} aprendeu: ${h.nome}`));
      return { ...g, habilidades: gh, nivel: ga.nivel ?? g.nivel, vidaMax: ga.vidaMax ?? g.vidaMax, vida: ga.vidaMax ? Math.min(ga.vidaMax, g.vida) : g.vida, descricao: ga.descricao ?? g.descricao };
    });
  });

  let novo = { ...pers, vida, mana, moedas, inventario: inv, habilidades: habs, grupo };

  /* EFEITOS TEMPORÁRIOS (buffs com duração) — bônus limitado a +2 por equilíbrio */
  let efeitos = [...(pers.efeitos || [])];
  (m.efeitos_adicionar || []).forEach((ef) => {
    if (!ef?.nome) return;
    const bonus = Math.max(1, Math.min(2, ef.bonus ?? 2)); // teto de +2
    const turnos = Math.max(1, Math.min(10, ef.turnos ?? 3)); // teto de 10 turnos
    efeitos = efeitos.filter((e) => e.nome.toLowerCase() !== ef.nome.toLowerCase());
    efeitos.push({ nome: ef.nome, bonus, turnos, aplica: ef.aplica || "", descricao: ef.descricao || "" });
    msgs.push(`✧ ${ef.nome} ativo (+${bonus} em ${ef.aplica || "testes"}, ${turnos} turno${turnos !== 1 ? "s" : ""})`);
  });
  (m.efeitos_remover || []).forEach((nome) => { efeitos = efeitos.filter((e) => e.nome.toLowerCase() !== (nome || "").toLowerCase()); });
  novo.efeitos = efeitos;

  /* EQUIPAMENTOS obtidos (vão para a mochila de equipamentos, não equipados ainda) */
  let equip = [...(pers.equipamento || [])];
  (m.adicionar_equipamento || []).forEach((eq) => {
    if (!eq?.nome || equip.some((x) => x.nome.toLowerCase() === eq.nome.toLowerCase())) return;
    const item = {
      nome: eq.nome, tipo: (eq.tipo || "arma").toLowerCase(), raridade: (eq.raridade || "comum").toLowerCase(),
      atributos: eq.atributos || {}, poder: eq.poder || "", descricao: eq.descricao || "",
    };
    equip.push(item);
    msgs.push(`⚔ Equipamento encontrado: ${item.nome} (${item.raridade})`);
  });
  (m.remover_equipamento || []).forEach((nome) => {
    equip = equip.filter((e) => e.nome.toLowerCase() !== (nome || "").toLowerCase());
    /* se estava equipado, desequipa */
    const eqp = { ...(novo.equipados || {}) };
    Object.keys(eqp).forEach((slot) => { if (eqp[slot]?.nome?.toLowerCase() === (nome || "").toLowerCase()) delete eqp[slot]; });
    novo.equipados = eqp;
  });
  novo.equipamento = equip;
  if (!novo.equipados) novo.equipados = pers.equipados || {};

  if (Math.max(0, m.xp || 0)) novo = aplicarNivel({ ...novo, xp: novo.xp + Math.max(0, m.xp || 0) });

  if (m.vida) msgs.push(m.vida < 0 ? `Você perdeu ${-m.vida} PV.` : `Você recuperou ${m.vida} PV.`);
  if (m.mana) msgs.push(m.mana < 0 ? `Você gastou ${-m.mana} PM.` : `Você recuperou ${m.mana} PM.`);
  if (m.moedas) msgs.push(m.moedas > 0 ? `◉ +${m.moedas} moedas` : `◉ −${-m.moedas} moedas`);
  if (m.xp) msgs.push(`✧ +${m.xp} XP`);
  if (novo.nivel > pers.nivel) msgs.push(`✦ NÍVEL ${novo.nivel} ALCANÇADO!`);
  (m.adicionar_itens || []).forEach((i) => msgs.push(`Item obtido: ${i}`));
  (m.remover_itens || []).forEach((i) => msgs.push(`Item perdido: ${i}`));
  (m.adicionar_habilidades || []).forEach((h) => h?.nome && msgs.push(`✦ Nova habilidade: ${h.nome} (${Math.max(0, h.custo || 1)} PM)`));
  return novo;
}

/* Atributo efetivo = base + bônus de equipamentos equipados + efeitos ativos que se aplicam */
function bonusEquip(pers, attrId) {
  let b = 0;
  const eqp = pers.equipados || {};
  Object.values(eqp).forEach((it) => { if (it?.atributos?.[attrId]) b += it.atributos[attrId]; });
  return b;
}
function bonusEfeito(pers, attrNome) {
  let b = 0;
  (pers.efeitos || []).forEach((e) => {
    if (!e.aplica || e.aplica.toLowerCase() === (attrNome || "").toLowerCase() || e.aplica.toLowerCase() === "testes" || e.aplica.toLowerCase() === "todos") b += e.bonus;
  });
  return b;
}
function atributoEfetivo(pers, attrId) {
  const attr = ATRIBUTOS.find((a) => a.id === attrId);
  return (pers.atributos[attrId] || 0) + bonusEquip(pers, attrId) + bonusEfeito(pers, attr?.nome || "");
}

/* Reduz a duração dos efeitos em 1 turno; remove os que expiram. Retorna {efeitos, msgs}. */
function tickEfeitos(pers) {
  const msgs = [];
  const efeitos = [];
  (pers.efeitos || []).forEach((e) => {
    const t = e.turnos - 1;
    if (t <= 0) msgs.push(`✧ ${e.nome} se dissipou.`);
    else efeitos.push({ ...e, turnos: t });
  });
  return { efeitos, msgs };
}

/* Processa mudanças de combate. Recebe o estado atual (ou null) e as mudanças,
   devolve o novo estado de combate e mensagens. Combate é transitório (fora da ficha). */
function processarCombate(combateAtual, m, msgs) {
  if (!m) return combateAtual;
  let inimigos = combateAtual ? [...combateAtual.inimigos] : [];

  (m.combate_iniciar || []).forEach((ini) => {
    if (!ini?.nome) return;
    if (inimigos.some((x) => x.nome.toLowerCase() === ini.nome.toLowerCase())) return;
    const vidaMax = ini.vidaMax ?? ini.vida ?? 10;
    inimigos.push({ nome: ini.nome, vida: ini.vida ?? vidaMax, vidaMax, ameaca: ini.ameaca || "", derrotado: false, semente: `inimigo|${ini.nome}|${ini.ameaca || ""}` });
    msgs.push(`⚔ ${ini.nome} entra no combate!`);
  });

  (m.combate_inimigo_vida || []).forEach((cv) => {
    inimigos = inimigos.map((e) => {
      if (e.nome.toLowerCase() !== (cv.nome || "").toLowerCase()) return e;
      const vida = Math.max(0, Math.min(e.vidaMax, e.vida + (cv.vida || 0)));
      const derrotado = vida <= 0;
      if (derrotado && !e.derrotado) msgs.push(`☠ ${e.nome} foi derrotado!`);
      return { ...e, vida, derrotado };
    });
  });

  (m.combate_atualizar || []).forEach((ca) => {
    inimigos = inimigos.map((e) => e.nome.toLowerCase() === (ca.nome || "").toLowerCase() ? { ...e, ameaca: ca.ameaca ?? e.ameaca, vidaMax: ca.vidaMax ?? e.vidaMax } : e);
  });

  (m.combate_remover || []).forEach((nome) => { inimigos = inimigos.filter((e) => e.nome.toLowerCase() !== (nome || "").toLowerCase()); });

  if (m.combate_encerrar) { if (inimigos.length) msgs.push("⚔ O combate termina."); return null; }
  if (inimigos.length === 0) return combateAtual; // nada mudou de combate
  /* se todos derrotados e o Mestre não encerrou, mantém visível até ele encerrar */
  return { inimigos };
}

/* ---------------- App ---------------- */

/* Normaliza personagem de saves antigos: preenche campos que versões novas
   esperam mas que não existiam quando o save foi criado. Preserva tudo. */
function migrarPersonagem(p) {
  if (!p || typeof p !== "object") return p;
  const atributosBase = { forca: 0, destreza: 0, vigor: 0, intelecto: 0, presenca: 0, percepcao: 0 };
  return {
    ...p,
    atributos: { ...atributosBase, ...(p.atributos || {}) },
    inventario: Array.isArray(p.inventario) ? p.inventario : [],
    habilidades: Array.isArray(p.habilidades) ? p.habilidades.filter((h) => h && h.nome).map((h) => ({ nome: h.nome, custo: Math.max(0, Number(h.custo) || 0), descricao: h.descricao || "", duracao: h.duracao || 0 })) : [],
    grupo: Array.isArray(p.grupo) ? p.grupo.map((g) => ({ ...g, semente: g.semente || `npc|${g.nome || ""}|${g.conceito || ""}` })) : [],
    efeitos: Array.isArray(p.efeitos) ? p.efeitos : [],
    condicoes: Array.isArray(p.condicoes) ? p.condicoes : [],
    equipamento: Array.isArray(p.equipamento) ? p.equipamento : [],
    equipados: p.equipados && typeof p.equipados === "object" ? p.equipados : {},
    semente: p.semente || `${p.nome || "herói"}|${p.conceito || ""}|0`,
    nivel: p.nivel || 1, xp: p.xp || 0, moedas: p.moedas ?? 0,
    nivelPendentes: p.nivelPendentes || 0,
    vida: p.vida ?? p.vidaMax ?? 10, vidaMax: p.vidaMax ?? 10,
    mana: p.mana ?? p.manaMax ?? 8, manaMax: p.manaMax ?? 8,
  };
}

export default function Taverna() {
  const [fase, setFase] = useState("menu"); // menu | mundo | personagem | jogo
  const [mundo, setMundo] = useState(null);
  const [nomeCampanha, setNomeCampanha] = useState("");
  const [personagem, setPersonagem] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [rolagem, setRolagem] = useState(null);
  const [combate, setCombate] = useState(null); // null | { inimigos: [{nome, vida, vidaMax, ameaca}] }
  const [carregando, setCarregando] = useState(false);
  const [entrada, setEntrada] = useState("");
  const [aba, setAba] = useState(null);
  const [habAbertas, setHabAbertas] = useState(false);
  const [habSel, setHabSel] = useState(null);
  const [dadoRolando, setDadoRolando] = useState(false);
  const [falha, setFalha] = useState(null);
  const [statusSave, setStatusSave] = useState(null);
  const [cronica, setCronica] = useState(null);
  const [verCena, setVerCena] = useState(false);
  const [longeDoFim, setLongeDoFim] = useState(false);
  const areaRef = useRef(null);
  const [mostrarRolagens, setMostrarRolagens] = useState(() => {
    try { const v = localStorage.getItem("taverna_cfg_rolagens"); return v === null ? true : v === "1"; } catch { return true; }
  });
  useEffect(() => { mostrarRolagensRef.current = mostrarRolagens; try { localStorage.setItem("taverna_cfg_rolagens", mostrarRolagens ? "1" : "0"); } catch {} }, [mostrarRolagens]);
  const [temSave, setTemSave] = useState(null);

  const systemRef = useRef("");
  const livroRef = useRef("");
  const notaRef = useRef("");
  const turnoContRef = useRef(0);
  const fimRef = useRef(null);
  const saveRef = useRef(null);
  const combateRef = useRef(null);
  combateRef.current = combate;
  const mensagensRef = useRef([]);
  const habUsadaRef = useRef(false);
  const canoneRef = useRef({});
  const mostrarRolagensRef = useRef(true);

  /* rola para o fim a cada novidade — mas respeita quem subiu para reler */
  useEffect(() => {
    if (longeDoFim) return;
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensagens, carregando, rolagem, longeDoFim]);

  /* carrega o save deste dispositivo na abertura */
  useEffect(() => {
    try {
      const bruto = localStorage.getItem("taverna_save_v1");
      if (bruto) { const sv = JSON.parse(bruto); if (sv && sv.personagem) sv.personagem = migrarPersonagem(sv.personagem); saveRef.current = sv; setTemSave(sv); }
    } catch { /* save corrompido: ignora */ }
  }, []);

  /* ao entrar no jogo, posiciona direto na última mensagem (sem animação) */
  useEffect(() => {
    if (fase !== "jogo") return;
    const t = setTimeout(() => fimRef.current?.scrollIntoView({ behavior: "auto", block: "end" }), 80);
    return () => clearTimeout(t);
  }, [fase]);

  const aoRolar = useCallback((e) => {
    const el = e.currentTarget;
    const distancia = el.scrollHeight - el.scrollTop - el.clientHeight;
    setLongeDoFim(distancia > 240);
  }, []);

  const irParaOFim = useCallback(() => {
    const el = areaRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    else fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setLongeDoFim(false);
  }, []);

  const pushMsgs = useCallback((novas) => {
    mensagensRef.current = [...mensagensRef.current, ...novas];
    setMensagens(mensagensRef.current);
  }, []);

  const salvar = useCallback((extra = {}) => {
    setStatusSave("salvando");
    const dados = {
      nomeCampanha, mundo, personagem, mensagens: mensagensRef.current, historico, sugestoes, rolagem,
      combate: combateRef.current, livro: livroRef.current, canone: canoneRef.current, salvoEm: Date.now(), ...extra,
    };
    saveRef.current = dados;
    setTemSave(dados);
    try {
      localStorage.setItem("taverna_save_v1", JSON.stringify(dados));
      setStatusSave("salvo");
    } catch {
      setStatusSave("erro");
    }
  }, [nomeCampanha, mundo, personagem, mensagens, historico, sugestoes, rolagem]);

  const aplicarResposta = useCallback((resp, persAtual) => {
    let pers = persAtual;
    const msgs = [];
    /* trava anti-cobrança-dupla: no turno de [HABILIDADE] o custo já foi
       descontado pelo app; qualquer mana negativa do Mestre é ignorada */
    if (habUsadaRef.current) {
      if (resp.mudancas && typeof resp.mudancas.mana === "number" && resp.mudancas.mana < 0) resp.mudancas.mana = 0;
      habUsadaRef.current = false;
    }
    /* passa 1 turno nos efeitos que já estavam ativos (os novos entram depois, com duração cheia) */
    const { efeitos, msgs: msgsTick } = tickEfeitos(pers);
    pers = { ...pers, efeitos };
    msgs.push(...msgsTick);
    /* tick das condições: decrementa e remove as que expiram */
    if ((pers.condicoes || []).length) {
      const vivas = [];
      pers.condicoes.forEach((c) => {
        const t = c.turnos - 1;
        if (t <= 0) msgs.push(`✓ ${c.nome} passou`);
        else vivas.push({ ...c, turnos: t });
      });
      pers = { ...pers, condicoes: vivas };
    }
    if (resp.mudancas) pers = aplicarMudancas(pers, resp.mudancas, msgs);
    /* CONDIÇÕES: adiciona/remove nos alvos (jogador ou NPCs do grupo/combate) */
    if (resp.mudancas) {
      const md = resp.mudancas;
      (md.condicoes_adicionar || []).forEach((c) => {
        if (!c || !c.nome) return;
        const alvo = (c.alvo || "você").toLowerCase();
        const cond = { nome: c.nome, turnos: Math.max(1, Math.min(20, Number(c.turnos) || 3)), efeito: c.efeito || "", tipo: c.tipo === "bom" ? "bom" : "ruim" };
        if (alvo === "você" || alvo === "voce" || alvo === (pers.nome || "").toLowerCase()) {
          const cs = (pers.condicoes || []).filter((x) => x.nome.toLowerCase() !== cond.nome.toLowerCase());
          pers = { ...pers, condicoes: [...cs, cond] };
          msgs.push(`${cond.tipo === "bom" ? "✦" : "⚠"} Você está ${cond.nome} (${cond.turnos}t)`);
        } else {
          msgs.push(`${cond.tipo === "bom" ? "✦" : "⚠"} ${c.alvo}: ${cond.nome}`);
        }
      });
      (md.condicoes_remover || []).forEach((c) => {
        if (!c || !c.nome) return;
        const alvo = (c.alvo || "você").toLowerCase();
        if (alvo === "você" || alvo === "voce" || alvo === (pers.nome || "").toLowerCase()) {
          pers = { ...pers, condicoes: (pers.condicoes || []).filter((x) => x.nome.toLowerCase() !== c.nome.toLowerCase()) };
          msgs.push(`✓ ${c.nome} passou`);
        }
      });
      /* ROLAGENS DE COMBATE (visíveis, se ligado nas config) */
      if (mostrarRolagensRef.current && Array.isArray(md.rolagens_combate)) {
        md.rolagens_combate.forEach((r) => {
          if (!r || !r.quem) return;
          const ic = r.resultado === "crítico" ? "🎯" : r.resultado === "desastre" ? "💥" : r.resultado === "acerta" ? "⚔" : "🛡";
          msgs.push(`${ic} ${r.quem} → ${r.alvo || "alvo"} · ${r.d20 ?? "?"}${r.mod ? `+${r.mod}` : ""}${r.total != null ? `=${r.total}` : ""}${r.dificuldade != null ? ` vs ${r.dificuldade}` : ""} · ${r.resultado || ""}`);
        });
      }
    }
    /* CÂNONE: mescla fatos duráveis; campos novos atualizam, nunca apagam a ficha */
    if (resp.mudancas && resp.mudancas.canone && typeof resp.mudancas.canone === "object") {
      const c = { ...canoneRef.current };
      for (const [nome, ficha] of Object.entries(resp.mudancas.canone)) {
        if (!nome || !ficha || typeof ficha !== "object") continue;
        const nova = !c[nome];
        c[nome] = { ...(c[nome] || {}), ...ficha };
        if (nova) msgs.push(`📖 Registrado: ${nome}`);
      }
      canoneRef.current = c;
      systemRef.current = montarSystemPrompt(nomeCampanha, mundo, pers, livroRef.current, c);
    }
    setPersonagem(pers);
    /* combate: processa de forma síncrona (via ref) para as mensagens saírem na ordem certa */
    if (resp.mudancas) {
      const novoCombate = processarCombate(combateRef.current, resp.mudancas, msgs);
      combateRef.current = novoCombate;
      setCombate(novoCombate);
    }
    pushMsgs([{ autor: "mestre", texto: resp.narrativa || "…" }, ...msgs.map((t) => ({ autor: "sistema", texto: t }))]);
    setSugestoes(resp.rolagem ? [] : (resp.sugestoes || []));
    setRolagem(resp.rolagem || null);
    return pers;
  }, [pushMsgs]);

  const enviar = useCallback(async (conteudo, persAtual, histBase) => {
    setCarregando(true); setFalha(null); setSugestoes([]);
    const nota = notaRef.current; notaRef.current = "";
    const corpo = nota ? `${nota}\n${conteudo}` : conteudo;
    const base = histBase ?? historico;
    const novoHist = [...base, { role: "user", content: corpo }];
    try {
      const resp = await chamarMestre(systemRef.current, novoHist);
      const histFinal = [...novoHist, { role: "assistant", content: JSON.stringify(resp) }];
      setHistorico(histFinal);
      const pers = aplicarResposta(resp, persAtual);
      turnoContRef.current += 1;
      if (turnoContRef.current >= 8) {
        turnoContRef.current = 0;
        const narrativas = mensagensRef.current.filter((x) => x.autor === "mestre").map((x) => x.texto);
        gerarLivro(livroRef.current, narrativas).then((l) => {
          if (l) { livroRef.current = l; systemRef.current = montarSystemPrompt(nomeCampanha, mundo, pers, l, canoneRef.current); }
        });
      }
      setTimeout(() => salvar({ personagem: pers, historico: histFinal, rolagem: resp.rolagem || null, sugestoes: resp.rolagem ? [] : (resp.sugestoes || []) }), 0);
    } catch (e) {
      notaRef.current = nota;
      setFalha({ conteudo, persAtual, histBase: base, motivo: (e && e.message) ? String(e.message) : "erro desconhecido" });
    } finally {
      setCarregando(false);
    }
  }, [historico, mensagens, aplicarResposta, salvar, nomeCampanha, mundo]);

  const retentar = () => { if (!falha) return; const f = falha; setFalha(null); enviar(f.conteudo, f.persAtual, f.histBase); };

  const iniciar = (pers) => {
    setPersonagem(pers);
    livroRef.current = ""; turnoContRef.current = 0;
    canoneRef.current = {};
    systemRef.current = montarSystemPrompt(nomeCampanha, mundo, pers, "", {});
    mensagensRef.current = []; setMensagens([]); setHistorico([]); setSugestoes([]); setRolagem(null);
    setCombate(null); combateRef.current = null;
    setFase("jogo");
    enviar("Comece a aventura: apresente o mundo com riqueza, situe meu personagem numa cena de abertura marcante com pelo menos um NPC interessante, conceda minhas 2 ou 3 habilidades iniciais coerentes com meu conceito, e termine com um gancho que me convide a agir.", pers, []);
  };

  const continuar = (comResumo) => {
    const sv = saveRef.current || temSave;
    if (!sv) { pushMsgs([{ autor: "sistema", texto: "Nenhuma aventura salva encontrada." }]); return; }
    try {
      const pers = migrarPersonagem(sv.personagem);
      setMundo(sv.mundo); setNomeCampanha(sv.nomeCampanha); setPersonagem(pers);
      mensagensRef.current = Array.isArray(sv.mensagens) ? sv.mensagens : [];
      setMensagens(mensagensRef.current); setHistorico(Array.isArray(sv.historico) ? sv.historico : []);
      setSugestoes(sv.sugestoes || []); setRolagem(sv.rolagem || null);
      setCombate(sv.combate || null); combateRef.current = sv.combate || null;
      livroRef.current = sv.livro || ""; turnoContRef.current = 0;
      canoneRef.current = sv.canone && typeof sv.canone === "object" ? sv.canone : {};
      systemRef.current = montarSystemPrompt(sv.nomeCampanha || "Aventura", sv.mundo || { genero: "Fantasia medieval" }, pers, sv.livro || "", canoneRef.current);
      setFase("jogo");
      if (comResumo && !sv.rolagem) {
        enviar(`[RESUMO DE SESSÃO] Retomando "${sv.nomeCampanha}". Abra com "Anteriormente, em ${sv.nomeCampanha}…" e recapitule os principais acontecimentos em até 120 palavras, tom de série. Depois reapresente a cena atual e me convide a agir. Sem rolagem e sem mudanças nesta resposta.`, pers, sv.historico || []);
      }
    } catch (e) {
      setFase("menu");
      pushMsgs([{ autor: "sistema", texto: "Não foi possível abrir a aventura salva: " + String((e && e.message) || e).slice(0, 120) }]);
    }
  };

  const agir = (texto) => {
    const acao = texto.trim();
    if (!acao || carregando || rolagem) return;
    setEntrada(""); setHabAbertas(false);
    if (habSel) {
      const h = habSel; setHabSel(null);
      const custo = Math.max(0, Number(h.custo) || 0);
      if (personagem.mana < custo) { pushMsgs([{ autor: "sistema", texto: `Mana insuficiente para ${h.nome}.` }]); return; }
      const pers = { ...personagem, mana: personagem.mana - custo };
      setPersonagem(pers);
      pushMsgs([{ autor: "jogador", texto: `✦ ${h.nome} — ${acao}` }, { autor: "sistema", texto: `Você gastou ${custo} PM · restam ${pers.mana}/${pers.manaMax}` }]);
      habUsadaRef.current = true;
      enviar(`[HABILIDADE] Uso "${h.nome}" (custo ${custo} PM, já descontado; tenho ${pers.mana} PM). Efeito: ${h.descricao}. COMO eu a uso: ${acao}. Narre conforme minha intenção — se incerto, peça a rolagem apropriada.`, pers);
      return;
    }
    pushMsgs([{ autor: "jogador", texto: acao }]);
    enviar(acao, personagem);
  };

  const modPend = rolagem ? (() => { const a = ATRIBUTOS.find((x) => x.nome.toLowerCase() === (rolagem.atributo || "").toLowerCase()); return a && personagem ? atributoEfetivo(personagem, a.id) : 0; })() : 0;

  const concluirRolagem = (valor) => {
    const r = rolagem;
    const mod = modPend;
    const total = valor + mod;
    const dc = r.dificuldade;
    const critico = valor === 20, desastre = valor === 1;
    const resultado = dc == null ? "resultado livre" : critico ? "SUCESSO CRÍTICO" : desastre ? "FALHA CRÍTICA" : total >= dc ? "sucesso" : "falha";
    setDadoRolando(false); setRolagem(null);
    const buffs = (personagem.efeitos || []).filter((e) => !e.aplica || e.aplica.toLowerCase() === (r.atributo || "").toLowerCase() || e.aplica.toLowerCase() === "testes");
    const notaBuff = buffs.length ? ` (inclui bônus de ${buffs.map((b) => b.nome).join(", ")})` : "";
    pushMsgs([{ autor: "sistema", texto: `🎲 d20 → ${valor}${mod ? ` + ${mod}` : ""} = ${total}${dc != null ? ` vs dif. ${dc}` : ""} · ${resultado}` }]);
    const notaVant = r.vantagem ? " (com vantagem)" : r.desvantagem ? " (com desvantagem)" : "";
    enviar(`[ROLAGEM] Teste de ${r.atributo || "sorte"} (${r.motivo})${notaVant}: rolei ${valor}, modificador +${mod}${notaBuff}, total ${total}${dc != null ? `, dificuldade ${dc}` : ""}. Resultado: ${resultado}. Narre as consequências de forma coerente com o resultado.`, personagem);
  };

  const escolherAtributo = (attrId) => {
    const nv = Math.min(ATRIBUTO_MAX, personagem.atributos[attrId] + 1);
    const nomeAttr = ATRIBUTOS.find((a) => a.id === attrId)?.nome || attrId;
    setPersonagem((p) => ({ ...p, atributos: { ...p.atributos, [attrId]: nv }, nivelPendentes: Math.max(0, p.nivelPendentes - 1) }));
    notaRef.current = `[INFO] Subi para o nível ${personagem.nivel} e fortaleci ${nomeAttr} (agora +${nv}).`;
    pushMsgs([{ autor: "sistema", texto: `✦ ${nomeAttr} fortalecido: +${nv}` }]);
  };

  const equipar = (item) => {
    setPersonagem((p) => {
      const slot = item.tipo || "arma";
      const equipados = { ...(p.equipados || {}) };
      equipados[slot] = item; // substitui o que estiver no mesmo slot (volta pra mochila automaticamente)
      return { ...p, equipados };
    });
    pushMsgs([{ autor: "sistema", texto: `⚔ Equipou: ${item.nome}` }]);
  };

  const desequipar = (slot) => {
    setPersonagem((p) => {
      const equipados = { ...(p.equipados || {}) };
      delete equipados[slot];
      return { ...p, equipados };
    });
  };

  const descartarItem = (nome) => {
    setPersonagem((p) => {
      const idx = p.inventario.findIndex((x) => (typeof x === "string" ? x : (x && x.nome)) === nome);
      if (idx === -1) return p;
      const inv = [...p.inventario]; inv.splice(idx, 1);
      return { ...p, inventario: inv };
    });
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Descartei o item: ${nome}.`;
    pushMsgs([{ autor: "sistema", texto: `Item descartado: ${nome}` }]);
  };

  const descartarEquip = (nome) => {
    setPersonagem((p) => ({ ...p, equipamento: (p.equipamento || []).filter((e) => e.nome !== nome) }));
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Descartei o equipamento: ${nome}.`;
    pushMsgs([{ autor: "sistema", texto: `Equipamento descartado: ${nome}` }]);
  };

  const gerarCronica = async () => {
    const narrativas = mensagens.filter((m) => m.autor === "mestre").map((m) => m.texto).slice(-14).join("\n\n");
    if (!narrativas) return;
    setCronica("gerando");
    try {
      const r = await chamarModelo(
        `Você é o cronista da Taverna. A partir dos trechos de uma campanha de RPG, escreva uma CRÔNICA épica e concisa (máx 130 palavras) em português, em tom de lenda contada à beira do fogo — heroica, evocativa. Destaque um momento marcante. Responda SOMENTE com JSON: {"titulo":"...","texto":"..."}.`,
        [{ role: "user", content: `Campanha: "${nomeCampanha}".\n\nTrechos:\n${narrativas}` }],
        600,
        "json"
      );
      const limpo = (r || "").replace(/```json/gi, "").replace(/```/g, "").trim();
      const i = limpo.indexOf("{"), f = limpo.lastIndexOf("}");
      const obj = JSON.parse(limpo.slice(i, f + 1));
      setCronica({ titulo: obj.titulo || nomeCampanha, texto: obj.texto || "" });
    } catch {
      setCronica({ titulo: nomeCampanha, texto: "A crônica se perdeu na névoa. Tente novamente." });
    }
  };

  const irMenu = () => { setAba(null); setHabAbertas(false); setHabSel(null); setEntrada(""); setDadoRolando(false); setFase("menu"); };

  const bloqueado = carregando || !!rolagem;

  return (
    <div className="flex flex-col" style={{ background: T.bg, height: "100dvh", maxHeight: "100dvh", overflow: "hidden" }}>
      <style>{FONT_CSS}</style>

      <header className="flex items-center justify-between px-4 md:px-5 py-3 shrink-0 sticky top-0 z-30" style={{ borderBottom: `1px solid ${T.line}`, background: T.panel }}>
        <div className="flex items-center gap-2 min-w-0">
          {fase !== "menu" && (
            <button onClick={irMenu} className="rounded-lg p-1.5 shrink-0" style={{ border: `1px solid ${T.line}` }} title="Início">
              <IconeCaneca tamanho={18} cor={T.amberSoft} />
            </button>
          )}
          <span className="tv-display text-xl tracking-wide ml-1 shrink-0" style={{ color: T.ink }}>{BRAND}</span>
          {fase === "jogo" && nomeCampanha && <span className="tv-mono text-[10px] uppercase tracking-widest truncate hidden sm:inline" style={{ color: T.inkDim }}>· {nomeCampanha}</span>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {fase === "jogo" && personagem && (
            <button onClick={() => setAba("ficha")} className="shrink-0" title="Abrir ficha">
              <Retrato semente={sementeDe(personagem)} tamanho={32} anel={T.amber} estado={estadoDe(personagem.vida, personagem.vidaMax)} />
            </button>
          )}
          {fase === "jogo" && statusSave && <span className="tv-mono text-[10px] uppercase tracking-wider" style={{ color: statusSave === "erro" ? T.danger : T.inkDim }}>{statusSave === "salvando" ? "salvando…" : "✓ salvo"}</span>}
          {fase === "jogo" && <button onClick={() => setMostrarRolagens((v) => !v)} className="rounded-lg p-1.5" style={{ border: `1px solid ${mostrarRolagens ? T.amber : T.line}` }} title={mostrarRolagens ? "Rolagens de combate: visíveis" : "Rolagens de combate: ocultas"}><span style={{ color: mostrarRolagens ? T.amberSoft : T.inkDim, fontSize: 13 }}>🎲</span></button>}
          {fase === "jogo" && <button onClick={() => setVerCena(true)} className="rounded-lg p-1.5" style={{ border: `1px solid ${T.line}` }} title="Ver cena"><span style={{ color: T.violetSoft, fontSize: 15 }}>🎭</span></button>}
          {fase === "jogo" && <button onClick={gerarCronica} className="rounded-lg p-1.5" style={{ border: `1px solid ${T.line}` }} title="Gerar crônica"><span style={{ color: T.amberSoft, fontSize: 15 }}>📜</span></button>}
        </div>
      </header>

      {fase === "menu" && <div className="flex-1 min-h-0 overflow-y-auto tv-scroll flex flex-col"><TelaMenu irNovo={() => setFase("mundo")} continuar={continuar} temSave={temSave} /></div>}
      {fase === "mundo" && <div className="flex-1 min-h-0 overflow-y-auto tv-scroll"><TelaMundo concluir={(m, nome) => { setMundo(m); setNomeCampanha(nome); setFase("personagem"); }} /></div>}
      {fase === "personagem" && <div className="flex-1 min-h-0 overflow-y-auto tv-scroll"><TelaPersonagem mundo={mundo} concluir={iniciar} /></div>}

      {fase === "jogo" && personagem && (
        <div className="flex flex-1 min-h-0 relative">
          <main className="flex-1 flex flex-col min-w-0">
            <div ref={areaRef} onScroll={aoRolar} className="tv-scroll flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4" style={{ paddingRight: "68px" }}>
              {mensagens.map((m, i) => {
                if (m.autor === "sistema") return <div key={i} className="tv-fade flex justify-center"><span className="tv-mono text-xs px-3 py-1.5 rounded-full text-center" style={{ background: T.panelSoft, color: T.violetSoft }}>{m.texto}</span></div>;
                if (m.autor === "jogador") return <div key={i} className="tv-fade flex justify-end"><div className="max-w-[85%] md:max-w-[70%] rounded-2xl rounded-br-sm px-4 py-3 tv-body text-[15px]" style={{ background: T.panelSoft, color: T.ink, border: `1px solid ${T.line}` }}>{m.texto}</div></div>;
                return (
                  <div key={i} className="tv-fade max-w-[95%] md:max-w-[82%]">
                    <div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-1.5" style={{ color: T.amber }}><IconeD20 tamanho={13} /> Mestre</div>
                    <div className="tv-body text-[15px] leading-relaxed whitespace-pre-wrap rounded-2xl rounded-tl-sm px-5 py-4" style={{ background: T.panel, color: T.ink, borderLeft: `2px solid ${T.amber}` }}>{m.texto}</div>
                  </div>
                );
              })}
              {carregando && <div className="tv-fade tv-mono text-xs flex items-center gap-2" style={{ color: T.inkDim }}><span className="tv-dice inline-flex"><IconeD20 tamanho={16} cor={T.inkDim} /></span> O Mestre tece o destino…</div>}
              {falha && !carregando && (
                <div className="tv-fade flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-3 rounded-full pl-4 pr-2 py-2" style={{ background: T.panel, border: `1px solid ${T.danger}` }}>
                    <span className="tv-mono text-xs" style={{ color: T.danger }}>O Mestre não respondeu.</span>
                    <Botao primario pequeno onClick={retentar}>Tentar de novo</Botao>
                  </div>
                  {falha.motivo && <span className="tv-mono text-[10px] px-4 text-center" style={{ color: T.inkDim }}>{falha.motivo}</span>}
                </div>
              )}
              <div ref={fimRef} />
            </div>

            {longeDoFim && (
              <button onClick={irParaOFim} className="tv-fade absolute rounded-full flex items-center justify-center"
                style={{ right: "84px", bottom: "150px", width: 44, height: 44, background: T.panel, border: `1px solid ${T.amber}`, color: T.amberSoft, fontSize: 20, zIndex: 20, boxShadow: "0 4px 14px rgba(0,0,0,.45)" }}
                title="Ir para a última mensagem">↓</button>
            )}

            {combate && <PainelCombate combate={combate} />}

            {sugestoes.length > 0 && !carregando && !rolagem && !habAbertas && (
              <div className="px-4 md:px-8 pb-2 flex flex-wrap gap-2" style={{ paddingRight: "68px" }}>
                {sugestoes.map((s, i) => <button key={i} onClick={() => agir(s)} className="tv-body text-sm px-3.5 py-2 rounded-full" style={{ border: `1px solid ${T.line}`, color: T.amberSoft, background: "transparent" }}>{s}</button>)}
              </div>
            )}

            {habAbertas && <PainelHabilidades personagem={personagem} selecionar={(h) => { setHabSel(h); setHabAbertas(false); }} fechar={() => setHabAbertas(false)} />}

            {habSel && !rolagem && (
              <div className="tv-fade px-4 md:px-8 pb-1.5" style={{ paddingRight: "68px" }}>
                <div className="inline-flex items-center gap-2 rounded-full pl-3.5 pr-1.5 py-1.5" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
                  <span className="tv-mono text-xs" style={{ color: T.violetSoft }}>✦ {habSel.nome} · {habSel.custo} PM</span>
                  <button onClick={() => setHabSel(null)} className="tv-mono text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ background: T.line, color: T.inkDim }}>✕</button>
                </div>
              </div>
            )}

            <div className="px-4 md:px-8 flex items-center gap-3 md:gap-4 pb-1.5 flex-wrap" style={{ paddingRight: "68px" }}>
              <BarraMini rotulo="PV" atual={personagem.vida} max={personagem.vidaMax} cor={T.amber} corBaixa={T.danger} />
              <BarraMini rotulo="PM" atual={personagem.mana} max={personagem.manaMax} cor={T.violet} />
              <span className="tv-mono text-[10px] shrink-0" style={{ color: T.amberSoft }}>NV {personagem.nivel}</span>
              <BarraMini rotulo="XP" atual={personagem.xp} max={XP_POR_NIVEL(personagem.nivel)} cor={T.ok} />
            </div>

            <div className="px-4 md:px-8 shrink-0 flex items-stretch gap-2" style={{ paddingRight: "68px", paddingBottom: rolagem ? "6px" : "20px" }}>
              <div className="flex flex-1 gap-2 rounded-2xl p-2 min-w-0" style={{ background: T.panel, border: `1px solid ${habSel ? T.violet : T.line}` }}>
                <input value={entrada} onChange={(e) => setEntrada(e.target.value)} onKeyDown={(e) => e.key === "Enter" && agir(entrada)}
                  placeholder={rolagem ? "Role o dado abaixo…" : habSel ? `Como você usa ${habSel.nome}?` : "O que você faz? Fale, aja, explore…"}
                  disabled={bloqueado} className="flex-1 bg-transparent outline-none tv-body text-[15px] px-3 min-w-0" style={{ color: T.ink }} />
                <Botao primario pequeno desativado={bloqueado || !entrada.trim()} onClick={() => agir(entrada)}>Agir</Botao>
              </div>
              <button onClick={() => setHabAbertas((v) => !v)} disabled={bloqueado} className="tv-mono text-xs rounded-2xl px-3 md:px-4 shrink-0"
                style={{ background: habAbertas ? T.violet : T.panel, color: habAbertas ? T.onSecond : T.violetSoft, border: `1px solid ${T.violet}`, fontWeight: 600, opacity: bloqueado ? 0.4 : 1 }}>
                ✦<span className="hidden md:inline"> Habilidades</span>
              </button>
            </div>

            {rolagem && !carregando && (
              <div className="tv-fade px-4 md:px-8 pb-5 flex justify-center" style={{ paddingRight: "68px" }}>
                <div className="tv-pulse flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl px-4 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
                  <span className="tv-mono text-xs text-center" style={{ color: T.ink }}>🎲 Teste de {rolagem.atributo || "sorte"}{rolagem.dificuldade != null ? ` · dif. ${rolagem.dificuldade}` : ""} — <em className="tv-body" style={{ color: T.inkDim }}>{rolagem.motivo}</em></span>
                  <Botao primario pequeno onClick={() => setDadoRolando(true)}>Rolar d20{modPend !== 0 ? ` (+${modPend})` : ""}</Botao>
                </div>
              </div>
            )}
          </main>

          <TrilhoAbas abaAtiva={aba} aoClicar={setAba} nGrupo={personagem.grupo.length} />
          <PainelLateral aba={aba} fechar={() => setAba(null)} personagem={personagem} mundo={mundo} equipar={equipar} desequipar={desequipar} descartarItem={descartarItem} descartarEquip={descartarEquip} />
        </div>
      )}

      {dadoRolando && rolagem && <OverlayDado rolagem={rolagem} modificador={modPend} aoConcluir={concluirRolagem} />}
      {fase === "jogo" && personagem?.nivelPendentes > 0 && !carregando && !dadoRolando && (
        <ModalNivel nivel={personagem.nivel - personagem.nivelPendentes + 1} personagem={personagem} escolher={escolherAtributo} />
      )}

      {verCena && personagem && <ModalCena personagem={personagem} combate={combate} mundo={mundo} nomeCampanha={nomeCampanha} fechar={() => setVerCena(false)} />}

      {cronica && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(8,6,14,0.9)", backdropFilter: "blur(4px)" }} onClick={() => cronica !== "gerando" && setCronica(null)}>
          <div className="tv-fade w-full max-w-md rounded-2xl overflow-hidden" style={{ background: T.panel, border: `1px solid ${T.amber}` }} onClick={(e) => e.stopPropagation()}>
            {cronica === "gerando" ? (
              <div className="p-10 flex flex-col items-center gap-4"><span className="tv-dice inline-flex"><IconeD20 tamanho={30} /></span><span className="tv-mono text-xs" style={{ color: T.inkDim }}>Escrevendo sua lenda…</span></div>
            ) : (
              <>
                <div className="p-6" style={{ background: T.panelSoft, borderBottom: `1px solid ${T.line}` }}>
                  <div className="flex items-center gap-2 mb-3"><IconeCaneca tamanho={20} cor={T.amber} /><span className="tv-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: T.inkDim }}>{BRAND} · crônica</span></div>
                  <div className="tv-display text-3xl leading-tight" style={{ color: T.amberSoft }}>{cronica.titulo}</div>
                </div>
                <div className="p-6"><p className="tv-body text-[15px] leading-relaxed whitespace-pre-wrap" style={{ color: T.ink }}>{cronica.texto}</p><p className="tv-mono text-[10px] uppercase tracking-[0.3em] mt-5 text-center" style={{ color: T.inkDim }}>{SLOGAN}</p></div>
                <div className="p-4 flex justify-end" style={{ borderTop: `1px solid ${T.line}` }}><Botao primario pequeno onClick={() => setCronica(null)}>Fechar</Botao></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
