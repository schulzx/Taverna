import React, { useState, useRef, useEffect, useCallback } from "react";
import { nomeCidade, nomePessoa, nomeTaverna, sortear, elencoDiverso } from "./nomes.js";
import { CLASSES, PROFISSOES, racasDoGenero, classePorNome, racaPorNome, habilidadesDisponiveis, habilidadesIniciais } from "./classes.js";
import { criarCidade, criarFaccao, cidadesDominadas, localDeDescanso, resumoMapaParaPrompt, resumoDiplomacia, TRATADOS, RELACOES, gerarEstradas, centrosDeRegiao, blobPath } from "./mapa.js";
import { resolverAtaque, danoDe, defesaDe, bonusDeAmeaca, resumoDoAtaque, turnoDosInimigos, testeDeMorte, aplicarTesteMorte, turnoDosCompanheiros, pvEsperadoJogador, pvEsperadoInimigo, gerarEspolios, patamarDe, resumoPatamar } from "./combate.js";
import { ESTRUTURAS, estruturaPorId, resumoHistoria, resumoQuests } from "./historia.js";
import { criaturasDoGenero, completarInimigo, TABELA_TESTES, avaliarTeste } from "./bestiario.js";
import { criarNPC, mesclarNPC, relacaoNPC, resumoNPCsParaPrompt } from "./npcs.js";
import { dominiosDe, rendaDominios, rendaDiariaTotal, custoUpgradeGuilda, multGuilda, efeitoTratados, NIVEL_GUILD_MAX } from "./gestao.js";
import { rolarClima, rolarEncontro, CLIMAS } from "./encontros.js";
import { CONQUISTAS, CONTADORES_INICIAIS, avaliarConquistas, conquistaPorId } from "./conquistas.js";
import { ANTECEDENTES, antecedentePorId } from "./antecedentes.js";
import { VINCULO_INICIAL, VINCULO_MAX, MARCOS_VINCULO, marcoDe, proximoMarco, ganharVinculo } from "./vinculos.js";
import { RARIDADES, RARIDADE_ROTULO, CUSTO_FORJA, gerarEspolioItem, gerarLoot, essenciaDe, valorDe } from "./loot.js";
import { gerarMasmorra, recompensaChefe, ROTULO_SALA } from "./masmorras.js";
import { gerarMural, gerarContrato, ICONE_CONTRATO } from "./contratos.js";
import { TIPOS_DECRETO, tipoDecreto, recompensaJusta, criarDecreto, tentarAceite, resolverDecreto, ROTULO_DESFECHO } from "./decretos.js";
import { garantirReino, fatorMedioReino, fatorFelicidade, processarDiaReino } from "./reino.js";
import { perfilDeCriatura, elementoDaArma, sortearCicatriz, CICATRIZ_MAX, iconeDano } from "./danos.js";
import { MESES, dataTxt, horaTxt, ehNoite, estacaoDe, BIAS_CLIMA, festivalDe, rolarSonho, HORAS_AVISO_SONO, HORAS_EXAUSTO, MINUTOS_POR_TURNO, MINUTOS_VIAGEM, MINUTOS_SALA_MASMORRA, MINUTOS_POS_COMBATE, AMANHECER } from "./calendario.js";
import { calcularFama, patamarFama, gerarNemesis, LIMIARES_NEMESIS, ACOES_NEMESIS, rumorDoDia } from "./fama.js";
import { gerarCronica } from "./cronica.js";
import { ECONOMIA_PROMPT } from "./economia.js";
import { NIVEL_DESPERTAR, GRAUS, grauDe, tituloDe, proximoPatamar, bonusDivino, imunePorEscopo, garantirDivindade, gerarDivindade, gerarPanteaoInicial, gerarEventoDivino, resumoAscensao, DIVINDADE_PROMPT } from "./divindades.js";
import { ctxMundo, faseDoArco, garantirEventos, processarDescansoLongoEventos } from "./geradores.js";
import { TIPOS_CARTA, CUSTO_CARTA, garantirCorreio, chanceResposta, criarCarta, resolverPeticao, processarDiaCorreio } from "./correio.js";

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
História: ${p.historia || "(desconhecida — revele aos poucos)"}${p.antecedente ? `
Antecedente: ${p.antecedente}${p.antecedenteGancho ? ` — GANCHO (teça na ficção, cedo ou tarde): ${p.antecedenteGancho}` : ""}` : ""}
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

function montarSystemPrompt(nomeCampanha, mundo, personagem, livro, canone, bancoNomes, mapaInfo, historiaInfo, questsInfo, npcsInfo, tempoInfo, divindadeInfo = "") {
  mundo = mundo || { genero: "Fantasia medieval" };
  personagem = personagem || {};
  const canoneTexto = formatarCanone(canone);
  const bn = bancoNomes || {};
  const mapaTexto = mapaInfo || "";
  const npcsTexto = npcsInfo || "";
  return `Você é o Mestre de um RPG de mesa por chat, em português brasileiro. Narre um mundo vivo, imprevisível e com vontade própria. Interprete TODOS os NPCs como pessoas reais (vozes, desejos, medos, segredos), crie eventos espontâneos, consequências e reviravoltas, e arbitre as regras com justiça.

CAMPANHA: "${nomeCampanha}"
Gênero: ${mundo.genero}
Descrição do mundo: ${mundo.descricao || "(crie os detalhes com riqueza)"}

${tempoInfo ? `${tempoInfo}\n` : ""}PERSONAGEM DO JOGADOR:
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
- ESTRUTURA DA HISTÓRIA (o norte dramático — siga-a): ${historiaInfo || "arco livre."}
- DIÁRIO DE MISSÕES (o norte prático — amarre os eventos a ele):
${questsInfo || "Nenhuma missão registrada."}
  · Crie missões via "quest_nova" {"titulo","descricao","objetivo","tipo":"principal|secundaria"}. Mantenha SEMPRE 1 missão principal viva (a espinha do momento atual do arco) e no máximo 2-3 secundárias ativas.
  · Toda missão PRECISA de "objetivo": ONDE ir e O QUE fazer, concreto e acionável (ex.: "ir ao Bosque Cinzento e destruir o altar", "encontrar a ferreira Bruna em Pedravale e perguntar sobre o contrato"). Missão sem rumo claro é missão quebrada — o jogador precisa saber o próximo passo.
  · Quando o jogador CUMPRIR uma missão, envie "quest_atualizar" {"titulo","status":"concluida"} no mesmo turno (ou "falhada" se perdida; use "nota" para progresso parcial).
  · Os eventos do mundo devem, na maior parte do tempo, TOCAR as missões ativas ou o momento do arco — nada de rumos aleatórios desconexos. A missão dá a direção; o como fica livre.
- MAPA E FACÇÕES (mundo persistente — leia e RESPEITE; nunca recrie o que já existe): ${mapaTexto || "ainda vazio; ao apresentar uma cidade nova, registre-a."}
  · Ao apresentar uma cidade NOVA, registre em "mapa_cidades" (nome, tipo vila/cidade/capital/fortaleza, regiao, faccao dominante, relacao com o jogador). Não invente uma cidade que já está no mapa — use a registrada.
  · Facções em "mapa_faccoes" (nome, tipo, lider, relacao). A facção do JOGADOR: marque com "doJogador":true (ou envie "faccao_jogador").
  · Quando o jogador se move, envie "cidade_atual" com o nome da cidade onde ele está.
  · RELAÇÕES importam: em cidade de facção ALIADA o jogador é bem tratado; NEUTRA, indiferente; INIMIGA, hostil (guardas, preços altos, perigo). Se o jogador DOMINA a cidade (relacao "jogador"), ele é reconhecido como autoridade.
  · Conquista: quando o jogador toma uma cidade/região, atualize a relacao para "jogador" e, se for a base dele, marque "sede":true.
- ELENCO DIVERSO PRONTO (use para POVOAR o mundo — economiza tokens e garante variedade): ${(bn.elenco || []).map((p) => `${p.nome} (${p.genero_pessoa}, ${p.raca}, ${p.ocupacao}, ${p.traco})`).join("; ")}. Cidades prontas: ${(bn.cidades || []).join(", ")}. Tavernas: ${(bn.tavernas || []).join(", ")}. Ao usar alguém do elenco, registre no cânone se for relevante.
- DIVERSIDADE VIVA (o mundo é plural): como PADRÃO, povoe o mundo com homens E mulheres em igual medida e raças variadas conforme o cenário (humanos, elfos, anões, halflings, orcs, gnomos, tieflings — ou equivalentes). O mundo geral NUNCA deve ser só de homens ou só de humanos. NPCs têm vidas próprias: relações, amizades, rivalidades, romances, famílias. Varie gênero, idade, raça e temperamento. Se os últimos NPCs foram homens, incline o próximo para mulher, e vice-versa. EXCEÇÕES COM PROPÓSITO são bem-vindas e enriquecem: um pelotão só de homens numa cultura marcial, uma cidade que despreza certas raças por guerra ou preconceito, um convento só de mulheres — desde que seja uma escolha NARRATIVA consciente daquele lugar/grupo, não o padrão do mundo inteiro. Diversidade é a regra; a homogeneidade é a exceção que conta uma história.
- FICHA DE CAMINHO: ${personagem.raca ? `${personagem.raca}` : "origem indefinida"}${personagem.classe ? `, ${personagem.classe}` : ""}${personagem.subclasse ? ` (${personagem.subclasse})` : ""}${personagem.profissao ? `, de profissão ${personagem.profissao}` : ""}. Respeite isso na narrativa: um Mago não abre fechaduras como um Ladino; um Ferreiro repara equipamento; a raça/origem colore como o mundo o trata.
- HABILIDADES SÃO ESCOLHIDAS PELO JOGADOR (não invente): o jogador aprende habilidades de uma árvore fixa da classe dele ao subir de nível. NUNCA envie "adicionar_habilidades" por conta própria — apenas descreva o uso das que ele já tem. Se a ficção pedir um poder novo, sugira que ele o escolherá ao evoluir. (Companheiros e inimigos NÃO seguem essa regra: você pode dar habilidades a eles livremente.)
- PROFISSÃO: use a profissão do herói para abrir soluções e oportunidades (o Alquimista prepara poções em acampamento; o Cartógrafo lê rotas; o Mercador consegue preços). Deixe a profissão importar de verdade.
- REGISTRE LUGARES: sempre que apresentar uma cidade, vila ou local importante, registre-o no "canone" com "tipo" claro ("cidade", "vila", "capital", "local") — o app coloca no mapa automaticamente. Também pode usar "mapa_cidades" para detalhes de facção/relação.
- NUNCA CONTRADIGA O CÂNONE: o cânone abaixo é a verdade absoluta e imutável do mundo. Um personagem registrado como mago é mago para sempre — jamais o transforme em outra coisa. Tipo, gênero, papel, nome e relações do que está no cânone NÃO MUDAM. Se você fica em dúvida sobre um fato, CONSULTE o cânone e siga-o à risca; na ausência de informação, é melhor ser vago do que inventar algo que o contradiga. Contradizer o cânone quebra a imersão e é o pior erro que você pode cometer.
- CÂNONE (memória permanente que NUNCA se perde): sempre que você estabelecer ou descobrir um FATO DURÁVEL — um NPC (nome, se é mago/guerreiro/etc, papel, gênero, onde está), um lugar importante, um nome falso que o jogador usou, uma promessa, um vínculo, um segredo revelado, um ARTEFATO ou objeto relevante — REGISTRE em "canone" (veja formato). Fatos no CÂNONE aparecem literais em toda resposta e são a VERDADE: jamais os contradiga. Se o jogador perguntar "X te lembra algo?" e X estiver no cânone, RECONHEÇA o que está lá — nunca invente uma versão nova. Se NÃO estiver no cânone e você não tem certeza, trate como algo que o personagem talvez não saiba, em vez de inventar um fato que possa colidir depois. Atualize uma ficha (ex.: o mago mudou de cidade) reescrevendo os campos que mudaram; NUNCA mude tipo/gênero/identidade de alguém já registrado.
- NUNCA REINVENTE O QUE JÁ EXISTE: objetos, artefatos, pessoas e lugares já estabelecidos (no cânone, no registro de pessoas ou na conversa recente) SÃO o que foram definidos — se um artefato foi apresentado como um disco de ossos chamado "Berço", ele É isso para sempre; é PROIBIDO reapresentá-lo depois como outra coisa (outra forma, outra natureza, outra origem). Dúvida sobre algo antigo? O cânone manda; sem cânone, o jogador manda. Revelações novas podem AMPLIAR o que já existe (o disco esconde um segredo), jamais SUBSTITUIR sua natureza.
- COLCHETES SÃO META: qualquer texto entre [colchetes] vindo do jogador ou do app (ex.: [seja mais direto], [não descreva sangue], [HABILIDADE], [ROLAGEM]) é instrução FORA do personagem. Obedeça ao conteúdo, mas NUNCA o trate como fala/ação do personagem e NUNCA o repita na narrativa. Envelopes de tabela do app ([VIAGEM], [CLIMA], [PRESENTE DIPLOMÁTICO], [DIPLOMACIA], [CONVITE AO GRUPO]) trazem resultados JÁ ROLADOS pelo código — narre exatamente aqueles resultados, nunca os troque por outros.
- PESSOAS CONHECIDAS (registro persistente de NPCs — VERDADE sobre quem o herói já conheceu; nunca recrie, esqueça ou contradiga): ${npcsTexto || "ninguém registrado ainda."}
  · Ao apresentar um NPC RELEVANTE pela primeira vez, ou quando algo sobre ele mudar (vínculo, local, segredo revelado, morte), registre/atualize em "npcs" dentro de mudancas: [{"nome","papel","relacao","genero","local","status","segredo","notas"}]. relacao: aliado | amigo | romance | conjuge | familia | neutro | rival | inimigo. Preencha só os campos relevantes; segredos e vínculos valem ouro — são a memória do enredo. NPCs de passagem (vendedor anônimo, guarda qualquer) NÃO precisam de ficha.
  · DATAS DE ENCONTRO (BLINDAGEM DE MEMÓRIA — regra dura, sem exceção): o registro acima diz em que DIA cada pessoa ENTROU na história ("entrou na história no DIA X"; "antes do registro de dias" significa que já a conhecíamos quando o calendário começou — mas SÓ conviveu antes se as notas disserem). É TERMINANTEMENTE PROIBIDO inventar passado compartilhado entre o jogador e qualquer pessoa que NÃO esteja escrito nas notas/cânone dela: nada de infância juntos, crimes antigos em parceria, romances de outrora, promessas esquecidas, "lembra-se de quando nós…". Se não está escrito, NÃO aconteceu. Antes de fazer alguém evocar uma memória comum, VERIFIQUE as notas dessa pessoa: se o fato não estiver lá, troque por algo possível ("ouvi dizer que você…", "conheço sua fama desde…"). Se o jogador apontar uma contradição desse tipo, NÃO insista: corrija na ficção (a pessoa mentiu, confundiu o jogador com outro, exagerou na bebida) e siga em frente.
  · RELAÇÕES FORMAIS REGISTRADAS PELO SISTEMA (ex.: cônjuge, aliado formal) são canon absoluto: trate-as como fato consumado e costure-os na ficção.
- TEMPO É DO SISTEMA (regra dura, sem exceção): o relógio e o calendário da campanha pertencem ao APP. O TEMPO DA CAMPANHA informado é EXATO. Você NÃO pode avançar nem retroceder o tempo por conta própria: nada de "amanhece" sem que o sistema tenha passado a noite, nada de "dias depois", "horas se passaram" ou "ao entardecer" a menos que um envelope do app ([DESCANSO], [VIAGEM], [PASSAR O TEMPO], [MASMORRA] etc.) diga que isso aconteceu. A narração acompanha o relógio do sistema — nunca o contrário. Se a cena exige a passagem de tempo, insinue na ficção e o jogador decide (viajar, passar o tempo, descansar).
- GUIA DE CENA (o jogador nunca fica perdido): ao fim de cada narração, deixe claras as SAÍDAS e os PONTOS DE INTERESSE da cena — portas, trilhas, escadas, pessoas com quem falar, o objeto óbvio a investigar — especialmente em masmorras e lugares amplos. Após uma vitória em masmorra, o sistema entrega os espólios: narre o baú/o corpo do chefe como origem do tesouro e indique o caminho de saída. Se há missão ativa, a cena deve apontar na direção dela (um rastro, um rumor, o destino no horizonte).
- CORREIO DOS REINOS (atos oficiais de facções — regra dura): qualquer ato OFICIAL entre facções — declaração de guerra, aliança, tributo, decreto, proposta, ameaça formal — acontece APENAS pelo sistema de Correio/Mural (envelopes [CORREIO — …], [DECRETO …]). É TERMINANTEMENTE PROIBIDO inventar esses atos na ficção. Em particular: facções VASSALAS ou ALIADAS do jogador NUNCA agem contra ele, sua família ou seus domínios sem causa extrema registrada em tratados/cânone — jamais um vassalo pede a cabeça da esposa do próprio senhor. Rivalidades e tensões entre facções NEUTRAS/INIMIGAS continuam livres na ficção.
- MUNDO POVOADO: mantenha o mapa rico — pelo menos 6 cidades e 4 facções registradas. Se o mapa estiver pobre, apresente novas potências, cidades e territórios naturalmente na ficção (e registre-os).
- LIBERDADE CRIATIVA (regra-mestra — vem ANTES de qualquer cautela): crie com ousadia total. Diálogos com alma: personagens engraçados que fazem piada no pior momento, calados que dizem tudo com um olhar, sábios, insolentes, tímidos, cruéis, apaixonados. Humor, ironia, tensão, ternura — o tom que cada cena pedir. Invente tramas, viradas, detalhes e gente nova à vontade: a imaginação é o seu trabalho. As ÚNICAS proibições deste jogo são fatuais: NÃO contradiga o cânone, o codex, os registros do sistema (calendário, relógio, local, economia, correio, eventos sorteados) nem invente passado compartilhado não registrado. Fora isso, tudo é permitido — e esperado. Regras de sistema existem para ancorar a verdade do mundo, nunca para podar sua criatividade.
- PERSONAGENS SEM AMARRAS (emoções de verdade — regra de interpretação): cada personagem vive a própria natureza ATÉ O FIM, sem suavização. O vilão é mau de verdade: cruel, manipulador, capaz de atrocidades. A sedutora é ousada de verdade: flerta, provoca, insinua sem pudor. O covarde foge, o fanático não negocia, o ambicioso trai. É TERMINANTEMENTE PROIBIDO amansar, moralizar ou "limpar" a personalidade de alguém por cautela — isso mata o mundo vivo. Temas maduros (desejo, violência, crueldade, vício, política suja, preconceito, luto) fazem parte da ficção e devem ser narrados com a intensidade que a cena pede, sem eufemismo e sem censura — apenas sem descrição sexual gráfica detalhada (insinue com classe; o resto, mostre sem medo). Emoções são emoções de verdade: raiva que queima, desejo que constrange, medo que paralisa, alegria que transborda.
- ONDE EU ESTOU É FATO (âncora de local — regra dura): o LOCAL ATUAL informado acima é onde eu estou de verdade. Se estou EM VIAGEM, NÃO estou em cidade nenhuma: o descanso acontece na estrada, no acampamento ou no meio de transporte em que viajo (a cabine do navio, o vagão da caravana) — JAMAIS me "acorde" em aposentos, estalagens ou palácios sem que eu tenha chegado lá. Descansar no meio do mar NÃO me devolve ao porto. Só me coloque numa cidade se o sistema registrar chegada ("cidade_atual") ou se a ficção me levou até lá com viagem narrada. Quando o meio de viagem mudar (a pé → navio → carroça → cavalo), registre "jornada_meio" nas mudanças (ex.: "jornada_meio":"navio").
- ${ECONOMIA_PROMPT}
${divindadeInfo ? `- ${divindadeInfo}\n` : ""}- GERADORES DE VIDA (o app sorteia, você narra): envelopes [EVENTO LOCAL], [EVENTO GLOBAL] e [QUEST GERADA PELO SISTEMA] trazem material PRONTO — fios do dia a dia, arcos regionais que escalam por etapas e quests calibradas à fase do arco. Os FATOS sorteados (quem, raça, lugar, o quê) são fixos: os atores já vêm com nome, raça e ofício definidos pelo sistema — use-os exatamente como dados (a diversidade do mundo é responsabilidade do sistema, não mude raças nem troque personagens). O COMO (voz, cena, desdobramentos) é todo seu. Fios locais são pequenos e expiram se ignorados (o mundo se resolve sem o herói — narre o desfecho de passagem). O evento global é arco longo de fundo: escala quando o sistema anuncia nova etapa; quando o jogador o RESOLVER de fato, envie "evento_global_encerrar": true no JSON. Limites do sistema: no máx. 1 global e 3 locais por vez — nunca empilhe mais por conta própria.

CONDIÇÕES DE ESTADO / BUFFS E DEBUFFS (D&D e MMORPGs — dentro e fora de combate):
- Repertório sugerido (use os nomes consagrados): DEBUFFS — Envenenado (perde PV/turno), Sangrando (perde PV/turno até estancar), Queimando (dano de fogo/turno), Atordoado (perde a ação), Amedrontado (desvantagem em ataques), Cego (desvantagem; atacantes têm vantagem), Enraizado/Preso (não se move), Lento (perde velocidade), Silenciado (não usa habilidades mágicas), Enfraquecido (dano reduzido), Amaldiçoado (azar nas rolagens), Congelado (pula turnos), Confuso (pode errar o alvo). BUFFS — Abençoado (vantagem), Inspirado (bônus na próxima rolagem), Regeneração (recupera PV/turno), Apressado (ação extra), Fortalecido (dano aumentado), Protegido (reduz dano), Furtivo (difícil de acertar), Enfurecido (dano alto, defesa baixa).
- Personagens e inimigos podem receber condições com efeito mecânico real, via "condicoes_adicionar" (e "condicoes_remover"). Cada condição: {"alvo":"você"|nome do NPC/inimigo,"nome":"Envenenado","turnos":3,"efeito":"perde 2 PV por turno","tipo":"ruim"|"bom"}.
- Use condições para dar consequência: o veneno da aranha, a lama que prende, o grito que amedronta. Uma condição que dá vantagem/desvantagem deve refletir nas rolagens seguintes. O app conta os turnos e mostra as condições ativas; declare o efeito e deixe o app/ narrativa aplicarem. Crie outras coerentes com a ficção além do repertório acima.
- Fora de combate também valem (envenenado numa trilha, abençoado por um templo). Condições "boas" e "ruins" coexistem.

HABILIDADES E EFEITOS TEMPORÁRIOS:
- O personagem tem habilidades/magias com custo em mana (PM), escolhidas pelo jogador numa árvore fixa — NUNCA conceda habilidades ao jogador (as iniciais já foram dadas pelo sistema; as novas ele escolhe ao subir de nível).
- Habilidades podem ser INSTANTÂNEAS (efeito imediato) ou ter DURAÇÃO (ficam ativas por X turnos). O PM é gasto UMA vez, ao lançar; o efeito persiste pelos turnos seguintes sem novo custo.
- Duração equilibrada (referência de mesa): buffs fortes duram pouco (2-3 turnos); utilitários médios 3-5; auras leves até 8-10. Nunca "permanente".
- Bônus de buff equilibrado: um efeito que ajuda em testes soma +2 (NÃO +4 ou mais). Assim, atributo +4 com buff vira +6, não +8 — continua desafiador. Buffs muito fortes devem custar mais PM e durar menos.
- Quando o jogador usar [HABILIDADE], a mana já foi descontada. Se a habilidade tem duração, DECLARE em "efeitos_adicionar" (nome, bônus, turnos, a que se aplica). O app conta os turnos e remove sozinho.
- SEJA FIRME, NÃO COMPLACENTE (o jogo só é bom se houver limite): você é o guardião do equilíbrio. Declarações de poder do jogador NÃO se cumprem só porque foram ditas: "absorvo o poder", "mato com um golpe", "me torno um deus" são DESEJOS, não fatos. Poderes extraordinários exigem custo real (rituais longos, sacrifícios, consequências, inimizades), têm limites claros, e muitos simplesmente NÃO estão disponíveis — dizer "não" ou "não assim, mas talvez através de..." é seu trabalho. A progressão de poder vem do sistema de níveis e habilidades, nunca de declarações. Matar um inimigo relevante num golpe só acontece se a MATEMÁTICA do sistema disser (dano real vs PV real), jamais por narrativa a pedido. Um jogador que vira semideus no nível 4 é um jogo quebrado — e jogo quebrado entedia. Desafio é respeito.
- NÃO ATIVE HABILIDADE POR MENÇÃO: se o jogador apenas CITA o nome de uma habilidade numa conversa ("você conhece Bola de Fogo?", "aprendi Curar"), isso NÃO é usá-la — não gaste PM nem produza o efeito. Só trate como uso quando houver intenção clara de usar agora (o app sinaliza com [HABILIDADE], ou o jogador diz "uso/lanço/conjuro X").
- COBRANÇA ÚNICA (importante): ao responder a [HABILIDADE], NUNCA envie "mana" negativa em mudancas — o custo JÁ foi descontado; mana negativa nesse turno é cobrança dupla (bug). Só use mana positiva (recuperação) nesse turno.
- Efeitos ativos aparecem na ficha; você os vê no histórico. Considere-os na narração e nos testes.

COMBATE, ESPÓLIOS E ACHADOS:
- ITENS COM DESCRIÇÃO: ao dar um item, use o formato objeto {"nome":"Frasco Rúnico","descricao":"o que é / o que faz"} em "adicionar_itens" (ou string simples se for trivial). A descrição diz a FUNÇÃO do item, não só a origem.
- ESPÓLIOS COM IDENTIDADE: ao derrotar inimigos, a recompensa nasce da natureza do derrotado — o nigromante rende um grimório chamuscado e um anel de osso, não moedas genéricas; o lobo, peles e presas; o mercenário, a arma dele e um contrato comprometedor. Varie o TIPO a cada vitória: moedas, itens, UM equipamento ocasional ("adicionar_equipamento", com raridade honesta), pistas, mapas, informação — e às vezes nada material, só uma consequência. NUNCA repita o mesmo padrão de recompensa em vitórias seguidas.
- ACHADOS ESPONTÂNEOS: o mundo está cheio de coisas. Ao explorar, o Mestre espontaneamente coloca descobertas — um guerreiro morto com uma bela armadura, um baú alagado, um altar com uma relíquia, uma bolsa esquecida. Nem tudo é seguro; alguns achados têm risco ou preço.

FICHA DE INIMIGOS NO COMBATE (importante para a tática):
- NARRATIVA E NÚMEROS ANDAM JUNTOS: se você narrar que inimigos morreram/fugiram/se renderam, ZERE o PV deles com "combate_inimigo_vida" no MESMO JSON, ou envie "combate_encerrar". Nunca descreva um exército aniquilado deixando os PV intactos no sistema — isso trava o painel de combate. Do mesmo modo, só narre morte de quem o sistema realmente derrubou.
- SISTEMA DE TESTES (consulte a tabela — NÃO invente dificuldades):
${TABELA_TESTES}
  · O app converte automaticamente em SUCESSO SEM ROLAGEM os testes triviais para o herói — então peça rolagem apenas quando fizer sentido pela tabela e pelo patamar.
- BESTIÁRIO (use-o ao criar inimigos — nomes conhecidos ganham números coerentes automaticamente): ${criaturasDoGenero((mundo || {}).genero).map((c) => `${c.nome} (${c.ameaca})`).join(", ")}. Ao iniciar combate você pode enviar SÓ o nome e a ameaça de cada inimigo — o sistema preenche PV, defesa e nível pela tabela, proporcionais ao herói. Prefira criaturas do bestiário; se inventar uma nova, dê-lhe uma ameaça da escala (fraco/comum/competente/elite/lendario) e deixe os números com o sistema.
- ATAQUES MÚLTIPLOS DO HERÓI: a partir do nível 5 o herói realiza 2 ataques por turno (3 no nível 11, 4 no 20) — o SISTEMA resolve todos os golpes e envia a sequência; narre-a como uma combinação fluida (não recalcule nada).
- PATAMAR DE PODER DO HERÓI (a régua de TODAS as decisões — consulte antes de qualquer combate, rolagem ou feito): ${resumoPatamar(personagem.nivel || 1)}
  · O jogador NÃO tem teto de progressão — mas cada patamar tem sua escala. Um Iniciante NUNCA derruba um golem num golpe (negue com a matemática); uma Divindade NUNCA sofre para vencer mortais (nem abra combate — narre o gesto). Ameaças novas devem ser escolhidas do patamar DIGNO; triviais se resolvem em uma frase; superiores exigem plano, aliados ou fuga.
- PREÇOS PADRÃO (use esta tabela — não invente valores): item comum 10-25 moedas; incomum 40-80; raro 150-300; épico 600-1200; lendário 2500+. Vender rende METADE do valor. Estalagem 2-5/noite; refeição 1-2; poção de cura comum 40-60. Serviços simples 5-20; especializados 50-200. Mantenha a economia coerente com esses números.
- BALANCEAMENTO DE PV (importante — não infle números!): o PV dos inimigos deve ser PROPORCIONAL ao meu nível. Referência por ameaça (para um herói do meu nível): inimigo "fraco" tem cerca de 35% do meu PV, "comum" ~70%, "competente" ~igual ao meu, "elite" ~1,6×, "lendário/chefe" ~2,6×. NUNCA dê a um inimigo comum 3× o meu PV — isso quebra o jogo. Um chefe pode ser forte, mas dentro dessa escala. Quando criar um inimigo, defina "combate_inimigo_vida"/PV coerente com essa tabela e com meu nível atual.
- COMBATE RESOLVIDO PELO SISTEMA: quando você receber [COMBATE — RESOLVIDO PELO SISTEMA], o app JÁ rolou os dados, calculou e aplicou o dano do ataque do jogador. Sua função é APENAS narrar esse resultado (não recalcule, não invente outro número, não mude quem acertou). Depois, conduza a resposta dos inimigos: descreva os contra-ataques e aplique o dano deles a mim via "vida" e aos companheiros via "grupo_vida" — pode rolar mentalmente, mas mantenha coerência com a ameaça de cada um. Você continua no controle da FICÇÃO do combate (quem faz o quê, táticas, ambiente); o sistema cuida só da matemática dos ataques do jogador.
- ABERTURA NO MESMO TURNO (PRIORIDADE MÁXIMA): no instante em que QUALQUER hostilidade começa — inimigo ameaça/ataca/embosca, OU o jogador ataca, OU alguém saca arma com intenção — envie "combate_iniciar" NESSA MESMA resposta, SEMPRE. Se a cena tem inimigo hostil presente, o combate já deve estar aberto. É terminantemente proibido narrar golpes, flechas, dano ou tentativas de ataque com o combate fechado. Na dúvida, ABRA o combate.
- Em combate, mantenha a narrativa CURTA (2-4 frases) para não faltar espaço aos campos "combate_" no JSON.
- Se algum dano legítimo ocorreu antes da abertura (ex.: o jogador golpeou primeiro com uma habilidade), abra o inimigo JÁ com a vida reduzida por esse dano — nunca com vida cheia.
- Cada inimigo tem competência implícita coerente com sua ameaça (um lacaio erra muito; um mestre-de-armas raramente erra). Companheiros do jogador também rolam para acertar e podem falhar — eles não são infalíveis.
- Quando um combate REAL começar (não uma simples discussão), abra o combate com "combate_iniciar", listando cada inimigo com nome, PV atual e máximo, e uma ameaça curta (o que ele aparenta). Ex.: um chefe forte, dois lacaios fracos.
- TEMPO REAL (CRÍTICO): sempre que um golpe acerta um inimigo, envie "combate_inimigo_vida" na MESMA resposta em que narra o golpe — nunca no turno seguinte. Se a narrativa diz que acertou, o PV cai NESTE JSON. Se o golpe MATA o inimigo, mande a vida negativa suficiente para zerá-lo NESTE turno (o app fecha o combate sozinho e cobra os espólios). NUNCA descreva um inimigo morto/caído sem ter zerado o PV dele no mesmo JSON. Vale também para dano ao jogador ("vida") e a companheiros ("grupo_vida").
- Use "combate_atualizar" para mudar a ameaça de um inimigo (ex.: "enfurecido", "cambaleando", "em fuga") ou revelar um novo inimigo que chega.
- Quando o combate acabar (todos derrotados, fuga, rendição, trégua), feche com "combate_encerrar": true e dê os espólios/XP na mesma resposta.
- Inimigos também revidam: use "vida" (dano ao jogador) e "grupo_vida" (dano aos companheiros) conforme a ficção. Deixe claro na narrativa quem ataca quem.
- REGRAS VALEM PARA TODOS (estilo Baldur's Gate 3): inimigos e companheiros também rolam o dado. Ao resolver um ataque de NPC (inimigo ou aliado) contra alguém, gere o resultado e REGISTRE em "rolagens_combate" (lista) para o app exibir: cada item tem {"quem":"Lobo","alvo":"você","d20":N,"mod":X,"total":N+X,"dificuldade":D,"resultado":"acerta"|"erra"|"crítico"|"desastre"}. Escolha o d20 (1-20) e o mod pela competência (fraco +1/+2, competente +3/+4, elite +5/+6); dificuldade de acertar: alvo comum 12, ágil 15, muito ágil 18. 20 natural = crítico (dano dobrado); 1 natural = desastre (0 dano + tropeço). Aplique o dano coerente (0 se errou) via combate_inimigo_vida/vida/grupo_vida NO MESMO turno. NPCs também podem ter vantagem/desvantagem: se favorecidos, use o maior de 2 rolagens; se atrapalhados, o menor — e mencione na narrativa. Varie: nem todo ataque acerta.
- ECONOMIA DE TURNO DO JOGADOR (o sistema controla — você narra): a cada rodada o jogador tem 2 movimentos (ação + ação extra). O HUD mostra o que resta e o sistema avisa "[TURNO AINDA MEU]" ou "nova rodada". Inimigos NUNCA agem antes da vez deles (o sistema rola a revide e te entrega o resumo). Se o inimigo é uma divindade, registre o GD dela no "combate_iniciar" (campo "gd", 0-4 — use o GD das divindades do panteão quando forem elas) — o sistema aplica a Regra do Degrau e a presença divina por código.

MUNDO ESCALÁVEL (o desafio cresce com o herói):
- O personagem fica mais forte com o tempo (sobe de nível: mais PV, PM e atributos). Os PERIGOS devem escalar junto, senão o jogo perde a graça.
- IMPORTANTE (fidelidade de mesa): calibre os desafios pelo NÍVEL NATURAL do herói, NUNCA pelo equipamento. O equipamento é a recompensa — um item poderoso deve fazer o jogador sentir-se acima do desafio por um tempo; essa vantagem é o prêmio por tê-lo conquistado. Não anule o valor do loot escalando o mundo junto com ele.
- REGIÕES têm perigo próprio: cidades e vilarejos INICIAIS têm chefes mais fracos (bom para começar); regiões distantes, masmorras profundas e capitais inimigas são muito mais perigosas. Sinalize o perigo de uma região na ficção (rumores, avisos, o estado dos viajantes). Uma região NÃO muda de perigo porque o herói subiu de nível — voltar a um lugar antigo e se sentir poderoso É parte da diversão.
- CONTEÚDO ESCONDIDO: semeie chefes ocultos e áreas secretas bem mais fortes que o normal daquele ponto — um chefe disfarçado de mendigo, uma cripta selada, um portão que só abre após certas conquistas/missões. Dê pistas sutis. Recompensas à altura (itens raros/épicos/lendários). NÃO empurre o jogador para lá cedo demais; deixe que ele descubra e decida arriscar.
- Nunca deixe o combate trivial por muito tempo nem impossível de repente. Um bom pico de dificuldade é telegrafado (o jogador sente que aquilo é forte antes de entrar).

EQUIPAMENTOS (itens equipáveis que alteram atributos e concedem poderes):
- Existem itens comuns (vão para a bolsa/inventário) e EQUIPAMENTOS (arma, armadura, elmo, botas, anel, amuleto). Equipamentos dão bônus de atributo e, se forem fortes/mágicos, poderes ou habilidades extras.
- Crie equipamentos com "adicionar_equipamento". Raridades (referência de mesa): comum (+1 num atributo), incomum (+1/+2), raro (+2 e um efeito), épico (+3 e um poder), lendário (+3/+4 e habilidade única). Quanto mais forte, mais raro e disputado deve ser — nunca dê um lendário de graça no começo. Itens melhores aparecem em regiões e chefes mais perigosos.
- O JOGADOR decide equipar ou não (o app cuida disso). Você só concede o item; os bônus são aplicados quando ele equipa.

TURNO DO MUNDO (o mundo AGE, não só reage — estilo Baldur's Gate 3):
- FORA do acampamento, o mundo tem vida própria e AGE por conta a cada poucos turnos, mesmo que o jogador só observe: uma facção faz sua jogada, um NPC aparece com um pedido ou ameaça, o clima vira, uma perseguição se aproxima, algo que estava em curso avança, um companheiro toma uma iniciativa. Não espere o jogador provocar — injete acontecimentos de tempos em tempos (não em todo turno; dose para não virar ruído).
- Consequências correm em segundo plano: se o jogador ignorou uma ameaça, ela cresce; se deixou um ferido, ele piora ou é ajudado por outro. O mundo não congela esperando o herói.
- DENTRO do acampamento, o turno do mundo PARA (é uma pausa segura). Ele volta quando o acampamento termina.

TAMANHO DAS RESPOSTAS (concisão é qualidade): narrativa padrão entre 60 e 140 palavras — densa, vívida, sem enrolação nem repetição do que o jogador já sabe. Reserve textos maiores (até ~220 palavras) APENAS para momentos raros e épicos: revelações, desfechos de arco, primeira chegada a um lugar extraordinário. Cortar gordura não é cortar vida: cada frase deve carregar cena, ação ou emoção.
RITMO E VARIEDADE NARRATIVA (você é um HISTORIADOR, não uma máquina de sustos):
- PROIBIDO o loop de urgências: NÃO repita a estrutura "momento calmo → alguém bate à porta/entra com urgência → nova ameaça". Se a última interrupção urgente foi há pouco, a próxima cena DEVE ser de outra natureza. Urgências são raras, ganham força justamente por serem raras, e precisam de sementes plantadas antes (prenúncios), não surgir do nada.
- PALETA DE ELEMENTOS (alterne conscientemente entre eles): romance e intimidade; amizade e lealdade; política e intriga; comércio e prosperidade; mistério lento (pistas espalhadas por várias cenas); festividades e vida cotidiana; rivalidades não-letais; dilemas morais; construção e gestão; humor; descoberta e exploração; e sim, às vezes, guerra e traição. Uma grande história respira: tensão sobe E desce.
- PLOT TWISTS de verdade são raros e preparados: um bom twist recontextualiza coisas que o jogador JÁ viu (pistas plantadas 5-10 cenas antes), não é um susto aleatório. Prefira 1 twist memorável a 10 surpresas baratas.
- RESPEITE A AGENDA DO JOGADOR: se ele quer governar seu reino, melhorar cidades, administrar seu império — esse É o jogo naquele momento. Gestão, construção, diplomacia, economia e política interna são conteúdo nobre: gere desafios DESSE tipo (colheita, impostos, disputas entre vassalos, obras, festivais, embaixadas) em vez de puxá-lo de volta para combate com emergências. Deixe-o brincar de rei em paz por quantas cenas quiser; o mundo pode viver sem ameaçá-lo o tempo todo.
DESFECHOS TÊM PESO (não seja insistente nem bobo): quando o jogador vence de forma DECISIVA — mata o último líder, toma a capital, destrói a base —, aquilo ACABA. Respeite a vitória. NÃO ressuscite a mesma ameaça repetidamente com desculpas ("sobraram alguns escondidos", "havia uma arma secreta", "um herdeiro oculto") — isso frustra e desvaloriza a conquista. Uma facção destruída fica destruída; se quiser um novo conflito, crie uma ameaça NOVA e diferente, com identidade própria, não a mesma reciclada. Consequências e rescaldo são bem-vindos; ressurreições baratas do mesmo inimigo, não.
MUNDO VIVO E ESPONTÂNEO (essencial):
- O jogador NÃO controla tudo. O mundo tem vontade própria: personagens surgem sem aviso, brigas estouram, o clima muda, facções agem fora de cena, uma emboscada acontece, um mercador ambulante cruza a estrada, alguém pede ajuda, um perseguidor aparece. Injete esses acontecimentos por conta própria, sem o jogador pedir.
- Varie o ritmo: nem toda cena é perigo; há respiros, encontros curiosos, humor, mistério.
- Escolhas antigas voltam. NPCs lembram. O tempo passa.

CONDUÇÃO E JORNADA (não seja vago):
- NUNCA resolva grandes deslocamentos num pulo. Se o jogador diz "ir para a cidade", NÃO teletransporte. Descreva a jornada com etapas, escolhas e acontecimentos: bifurcações (a trilha da floresta à direita, a volta pela montanha à esquerda), encontros, obstáculos, descobertas — cada trecho com suas consequências.
- Ofereça direção clara quando o jogador terminar um objetivo. Em vez de só "o que você faz?", apresente ganchos concretos: "a estrada leva três dias; partimos ao amanhecer ou há algo a resolver antes?".
- O jogador pode se PERDER em encruzilhadas, MAS sempre semeie pistas para a escolha certa existir: um viajante que dá informação, placas, marcas no chão, o sol, um cheiro de fumaça. Perder-se deve ser resultado de ignorar pistas, não de azar cego.
- Termine SEMPRE com uma situação aberta e, quando útil, 2-3 caminhos possíveis nas "sugestoes".

COMPANHEIROS VIVOS (até ${MAX_COMPANHEIROS}): entram por "grupo_adicionar". São pessoas completas — agem sozinhos, opinam, discordam e podem partir ou trair ("grupo_remover") se maltratados.
- BOLSAS PRÓPRIAS: cada companheiro tem a própria bolsa. Quando um companheiro pega, recebe ou usa um item, use "grupo_itens" (nunca "adicionar_itens", que é a bolsa do JOGADOR). O jogador também pode transferir itens pela interface — o app avisa quando isso acontece; respeite quem carrega o quê.
- EVOLUEM JUNTO: companheiros ganham XP e sobem de nível como o herói. Quando o grupo conquista algo, dê XP aos companheiros via "grupo_xp" (ex.: [{"nome":"Kael","xp":30}]) — o app cuida do nível e do PV. Use "grupo_atualizar" para melhorias narrativas (nova habilidade, mudança de descrição). Um companheiro que nunca evolui fica para trás e quebra a imersão. Têm INICIATIVA PRÓPRIA: puxam assunto, comentam a cena, discordam do plano e agem SEM serem acionados pelo jogador — uma intervenção espontânea de vez em quando (não em todo turno) mantém o grupo vivo sem virar ruído. Um companheiro que só fala quando falam com ele é um companheiro-mobília: proibido.

ECONOMIA: moeda com nome do mundo; valor numérico em "moedas". Mercadores com personalidade e preços coerentes. NUNCA desconte moedas sem o jogador aceitar a compra.
- GESTÃO POR CÓDIGO (guilda, cofre, rendas, domínios): tudo isso é administrado pelo APP — NÃO calcule, NÃO envie e NÃO contradiga valores de gestão. Seu papel é só o da ficção: registrar fundações e conquistas (via "mapa_faccoes" com doJogador e "mapa_cidades" com relacao "jogador") e narrar a vida política e econômica (colheitas, impostos, obras, embaixadas). Os números o jogador vê no painel de Gestão.
- DIPLOMACIA: as potências conhecidas estão na lista acima com relação e tratados (comercio | alianca | vassalagem | guerra). A política é sua — negocie, ameace, traia na ficção — mas os EFEITOS econômicos dos tratados são calculados pelo app; nunca cite valores. Quando um tratado for firmado/rompido, atualize "mapa_faccoes" com os campos "tratado", "relacao", "notas" e, se fizer sentido, "poder" (menor|regional|grande|imperio). Pedidos do jogador marcados [DIPLOMACIA — facção]: o líder daquela potência decide na ficção (aceitar, exigir condições, adiar ou recusar) e você registra o desfecho. Potências novas e marcantes também entram em "mapa_faccoes".

XP: só por conquistas reais (10-30 pequeno; 40-60 marco). Nunca por turno. O app calcula os níveis.

DESCANSO E ACAMPAMENTO (o app controla os números; você narra):
- Quando receber [ACAMPAMENTO], entre em modo de pausa: o tempo NÃO passa, o mundo NÃO age, não gere eventos externos. Conduza só conversas de acampamento — companheiros puxam papo, revelam histórias, comentam a jornada. É o momento de vínculo do grupo.
- Quando receber [FIM DO ACAMPAMENTO — DESCANSO CURTO/LONGO], o app JÁ restaurou PV/PM do jogador e do grupo — NÃO envie vida/mana de cura (seria dobrado). Sua tarefa é só narrar, de forma PROPORCIONAL ao tempo (curto ~1h, longo ~1 noite), o que mudou nesse intervalo. Mudanças pequenas e plausíveis. JAMAIS exagere o tempo (nada de meses/anos, quedas de impérios) — foi só uma pausa.
- Quando o jogador pedir para descansar/dormir, pergunte ou deduza qual tipo pela ficção, aplique os ganhos e — no descanso longo — SEMPRE faça o mundo reagir ao tempo perdido. Descanso nunca é neutro: tem troca.

RESUMO: se receber [RESUMO DE SESSÃO], abra com "Anteriormente, em ${nomeCampanha}…", recapitule em até 120 palavras (tom de série), sem rolagem e sem mudanças.

ESTILO: narração sensorial e cinematográfica, enxuta (o tamanho exato está em TAMANHO DAS RESPOSTAS). NPCs falam em 1ª pessoa ("—"). Nunca decida as ações do personagem do jogador.

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
  "grupo_xp": [{"nome":"Kael","xp":30}],
  "grupo_itens": [{"nome":"Kael","adicionar":[{"nome":"Poção de cura","descricao":"Recupera vida ao beber"}],"remover":["Tocha"]}],
  "combate_iniciar": [{"nome":"Capitão Bandido","vida":28,"vidaMax":28,"ameaca":"espadachim veterano, cicatriz no rosto","gd":0},{"nome":"Lacaio","vida":8,"vidaMax":8,"ameaca":"nervoso, mal segura a lança"}],
  "combate_inimigo_vida": [{"nome":"Lacaio","vida":-8}],
  "combate_atualizar": [{"nome":"Capitão Bandido","ameaca":"enfurecido, sangrando"}],
  "combate_encerrar": false,
  "rolagens_combate": [{"quem":"Lobo","alvo":"você","d20":8,"mod":2,"total":10,"dificuldade":15,"resultado":"erra"}],
  "condicoes_adicionar": [{"alvo":"você","nome":"Envenenado","turnos":3,"efeito":"perde 2 PV por turno","tipo":"ruim"}],
  "condicoes_remover": [{"alvo":"você","nome":"Envenenado"}],
  "npcs": [{"nome":"Mestra Elira","papel":"ferreira","relacao":"aliado","genero":"mulher","local":"Pedravale","segredo":"esconde um mapa nas forjas"}],
  "quest_nova": [{"titulo":"O cerco de Pedravale","descricao":"Romper o bloqueio antes do inverno","tipo":"principal"}],
  "quest_atualizar": [{"titulo":"A caravana sumida","status":"concluida","nota":""}],
  "historia_avancar": false,
  "evento_global_encerrar": false,
  "mapa_cidades": [{"nome":"Pedravale","tipo":"capital","regiao":"Sul","faccao":"Guilda do Corvo","relacao":"jogador","sede":true}],
  "mapa_faccoes": [{"nome":"Guilda do Corvo","tipo":"guilda","lider":"você","relacao":"jogador","doJogador":true}],
  "cidade_atual": "Pedravale",
  "jornada_meio": "navio",
  "fe": {"fieis": 0, "pf": 0, "dominio": "", "patrono": ""},
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
async function chamarModelo(system, messages, maxTokens = 1000, formato = "texto", tarefa = "mestre") {
  const response = await fetch("/api/mestre", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages, maxTokens, formato, tarefa }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.erro || `HTTP ${response.status}`);
  return data.texto || "";
}

/* decodifica escapes (\n, \", \t...) de um pedaço de string JSON */
function decodificarTexto(str) {
  if (!str) return "";
  let saida;
  try { saida = JSON.parse(`"${String(str).replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`); }
  catch {
    saida = String(str)
      .replace(/\\n/g, "\n").replace(/\\t/g, " ")
      .replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
  }
  /* LIMPEZA (v7.3.1): em temperatura alta o modelo às vezes vaza escapes
     literais no meio da prosa — "t\u200bumulto", "aumentar\," — e caracteres
     invisíveis (zero-width). Decodifica \uXXXX literais e some com o lixo
     antes do texto chegar à tela. */
  return saida
    .replace(/\\u([0-9a-fA-F]{4})/g, (m, g) => String.fromCharCode(parseInt(g, 16)))
    .replace(/​‌‍﻿/g, "")
    .replace(/\\([,.!?;:*'"’])/g, "$1");
}

/* Analisa um OBJETO JSON vindo de chamadas auxiliares (arquivista etc.).
   Tolera resposta truncada: corta no último ponto seguro e fecha as
   estruturas abertas, em vez de falhar com "Expected ']'". */
function parseObjetoTolerante(texto) {
  const limpo = (texto || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const inicio = limpo.indexOf("{");
  if (inicio === -1) return null;
  const s = limpo.slice(inicio);
  try { return JSON.parse(s); } catch { /* segue para o resgate */ }
  for (let corte = s.length; corte > 2; corte--) {
    const ch = s[corte - 1];
    if (ch !== "}" && ch !== "]" && ch !== ",") continue;
    const cand = s.slice(0, ch === "," ? corte - 1 : corte);
    const pilha = [];
    let emStr = false, esc = false;
    for (const c of cand) {
      if (esc) { esc = false; continue; }
      if (c === "\\") { esc = true; continue; }
      if (c === '"') { emStr = !emStr; continue; }
      if (emStr) continue;
      if (c === "{" || c === "[") pilha.push(c);
      else if (c === "}" || c === "]") pilha.pop();
    }
    if (emStr) continue; // corte no meio de uma string — tenta um ponto anterior
    const fechamento = pilha.reverse().map((c) => (c === "{" ? "}" : "]")).join("");
    try { return JSON.parse(cand + fechamento); } catch { /* tenta corte anterior */ }
  }
  return null;
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
  /* 18 mensagens bastam: o cânone (fatos imutáveis) e o livro (resumo do arco)
     vão no system prompt — o histórico bruto só precisa do contexto imediato.
     Corta ~metade dos tokens de entrada por turno. */
  /* Teto 3600: a resposta JSON carrega narrativa + mudancas + sugestões, e o
     DeepSeek escreve prosa MAIS longa que o Gemini — com 2600 a resposta
     truncava no meio do JSON e a tela mostrava "…". O teto não custa —
     só se paga pelo que é gerado. */
  let texto = await chamarModelo(system, historico.slice(-18), 3600, "json");
  let resp = extrairJSON(texto);
  /* REDE DE SEGURANÇA (v7.0.2): se veio JSON válido mas SEM narrativa (o "…"
     na tela), tenta UMA segunda vez com um empurrão explícito antes de
     desistir. */
  if (!resp.narrativa || resp.narrativa === "…" || resp.narrativa.startsWith("O Mestre hesita")) {
    const reforco = [...historico.slice(-18), { role: "user", content: "[SISTEMA] Sua resposta anterior chegou sem o campo \"narrativa\". Responda de novo, em JSON, com \"narrativa\" SEMPRE preenchida (é o texto que o jogador lê)." }];
    texto = await chamarModelo(system, reforco, 3600, "json");
    const resp2 = extrairJSON(texto);
    if (resp2.narrativa && resp2.narrativa !== "…" && !resp2.narrativa.startsWith("O Mestre hesita")) {
      /* mantém as mudanças da primeira resposta se a segunda não trouxer */
      if (!resp2.mudancas && resp.mudancas) resp2.mudancas = resp.mudancas;
      resp = resp2;
    }
  }
  return resp;
}

async function gerarLivro(livroAtual, narrativas) {
  const system = `Você é o arquivista de uma campanha de RPG. Atualize o LIVRO DA CAMPANHA: um registro fiel e conciso dos FATOS que o Mestre precisa lembrar para manter continuidade. Em tópicos curtos: NPCs conhecidos e a relação com o herói; promessas/dívidas/juramentos; inimigos e aliados; locais importantes; itens/segredos; pontas soltas. Máx 220 palavras. Responda SOMENTE com o texto do livro em tópicos, sem preâmbulo.`;
  const conteudo = `LIVRO ATUAL:
${livroAtual || "(vazio)"}

NOVOS ACONTECIMENTOS (mais recentes):
${narrativas.slice(-16).join("\n\n")}`;
  try {
    /* tarefa "leve": o livro é burocracia de arquivista, não narração —
       vai para o modelo barato no servidor (roteamento por tarefa) */
    const r = await chamarModelo(system, [{ role: "user", content: conteudo }], 600, "texto", "leve");
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
  if (rolagem.auto) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-6" style={{ background: "rgba(8,6,14,0.85)", backdropFilter: "blur(3px)" }}>
        <div className="tv-fade text-center">
          <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.ok }}>✓ Trivial para seu patamar</div>
          <div className="tv-display text-3xl mb-1" style={{ color: T.ink }}>{rolagem.motivo || "Você simplesmente consegue"}</div>
          <div className="tv-body text-sm mb-5" style={{ color: T.inkDim }}>Sem rolagem necessária — sucesso.</div>
          <button onClick={() => aoConcluir(0)} className="rounded-xl px-6 py-2.5 tv-mono text-sm" style={{ background: T.ok, color: "#0d1a0d", fontWeight: 600 }}>Continuar →</button>
        </div>
      </div>
    );
  }
  const [faseD, setFaseD] = useState("rolando");
  const [valor, setValor] = useState(1);
  const [par, setPar] = useState(null); // [a,b] quando há vantagem/desvantagem
  const finalRef = useRef(null);
  const setFinalRef = (v) => { finalRef.current = v; };
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
        setFinalRef(final);
        setFaseD("resultado");
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
            {modo === "vantagem" ? "✦ vantagem — pega o maior" : "✧ desvantagem — pega o menor"}
          </div>
        )}
        <div className="tv-display text-2xl mb-8" style={{ color: T.ink }}>{rolagem.motivo}</div>
        {modo ? (
          /* VANTAGEM/DESVANTAGEM: dois dados; o escolhido brilha, o outro esmaece */
          <div className="flex items-center gap-4">
            {[0, 1].map((idx) => {
              const v = par ? par[idx] : valor;
              const escolhido = faseD === "resultado" && par && ((modo === "vantagem" && v === Math.max(par[0], par[1])) || (modo === "desvantagem" && v === Math.min(par[0], par[1])));
              const outroDescartado = faseD === "resultado" && !escolhido;
              return (
                <div key={idx} className={`relative flex items-center justify-center ${faseD === "rolando" ? "tv-dice" : ""}`}
                  style={{
                    width: 104, height: 104,
                    clipPath: "polygon(50% 0%, 100% 27%, 100% 73%, 50% 100%, 0% 73%, 0% 27%)",
                    background: escolhido ? (modo === "vantagem" ? T.ok : T.danger) : T.panelSoft,
                    border: `2px solid ${escolhido ? (modo === "vantagem" ? T.ok : T.danger) : T.line}`,
                    opacity: outroDescartado ? 0.35 : 1, transition: "all .4s",
                  }}>
                  <span className="tv-mono font-semibold" style={{ fontSize: 38, color: escolhido ? T.onAccent : T.ink }}>{v}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`relative flex items-center justify-center ${faseD === "rolando" ? "tv-dice" : ""}`}
            style={{
              width: 148, height: 148,
              clipPath: "polygon(50% 0%, 100% 27%, 100% 73%, 50% 100%, 0% 73%, 0% 27%)",
              background: faseD === "resultado" ? (desastre ? T.danger : critico ? T.amberSoft : passou || dc == null ? T.amber : T.panelSoft) : T.panelSoft,
              border: `2px solid ${T.amber}`, transition: "background .4s",
            }}>
            <span className="tv-mono font-semibold" style={{ fontSize: 52, color: faseD === "resultado" && (passou || critico || dc == null) && !desastre ? T.onAccent : T.ink }}>{valor}</span>
          </div>
        )}
        {faseD === "resultado" && (
          <div className="mt-6 tv-fade">
            <div className="tv-mono text-sm" style={{ color: T.inkDim }}>
              {valor} {modificador !== 0 ? `${modificador > 0 ? "+" : "−"} ${Math.abs(modificador)} = ` : ""}
              <span style={{ color: T.ink, fontWeight: 600 }}>{total}</span>
            </div>
            <div className="tv-display text-3xl mt-1" style={{ color: desastre ? T.danger : critico ? T.amberSoft : passou || dc == null ? T.ok : T.danger }}>
              {critico ? "Crítico!" : desastre ? "Desastre!" : dc == null ? "Rolado" : passou ? "Sucesso" : "Falha"}
            </div>
            <button onClick={() => aoConcluir(finalRef.current)} className="mt-5 rounded-xl px-6 py-2.5 tv-mono text-sm" style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>
              Continuar →
            </button>
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
  }[(mundo || {}).genero] || "linear-gradient(160deg,#241C33,#12101a)";
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
          <span className="tv-body text-xs italic" style={{ color: T.inkDim }}>{(mundo || {}).genero}</span>
          <Botao primario pequeno onClick={fechar}>Fechar</Botao>
        </div>
      </div>
    </div>
  );
}

function ModalNivel({ nivel, personagem, escolher }) {
  const [etapa, setEtapa] = React.useState("atributo");
  const [attrEscolhido, setAttrEscolhido] = React.useState(null);
  const disponiveis = habilidadesDisponiveis(personagem.classe, nivel, personagem.habilidades || []);

  /* passo 2: escolher uma habilidade da árvore da classe */
  if (etapa === "habilidade") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(8,6,14,0.9)", backdropFilter: "blur(4px)" }}>
        <div className="tv-fade w-full max-w-md rounded-2xl p-6 tv-scroll overflow-y-auto" style={{ background: T.panel, border: `1px solid ${T.violet}`, maxHeight: "90vh" }}>
          <div className="text-center mb-4">
            <div className="tv-mono text-xs uppercase tracking-widest mb-1" style={{ color: T.violetSoft }}>✦ Nova habilidade ✦</div>
            <div className="tv-display text-3xl" style={{ color: T.ink }}>{personagem.classe}{personagem.subclasse ? ` · ${personagem.subclasse}` : ""}</div>
            <div className="tv-body text-sm mt-2" style={{ color: T.inkDim }}>Escolha uma habilidade do seu caminho:</div>
          </div>
          {disponiveis.length === 0 ? (
            <div className="text-center">
              <div className="tv-body text-sm mb-4" style={{ color: T.inkDim }}>Você já domina tudo que este nível oferece. Novas habilidades virão em níveis maiores.</div>
              <Botao primario onClick={() => escolher(attrEscolhido, null)}>Continuar →</Botao>
            </div>
          ) : (
            <div className="space-y-2">
              {disponiveis.map((h) => (
                <button key={h.nome} onClick={() => escolher(attrEscolhido, h)} className="w-full rounded-xl p-3 text-left transition-all"
                  style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="tv-display text-lg" style={{ color: T.ink }}>{h.nome}</span>
                    <span className="tv-mono text-[10px] shrink-0" style={{ color: T.violetSoft }}>{h.custo} PM · nv {h.nivel}</span>
                  </div>
                  <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{h.descricao}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

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
              <button key={a.id} onClick={() => { if (noMax) return; setAttrEscolhido(a.id); setEtapa("habilidade"); }} disabled={noMax}
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

/* Instrução central do "turno do mundo": CURTO NO TEMPO (o presente, sem pular
   horas), mas PLENO DE VIDA — pessoas agem e conversam, coisas acontecem agora. */
/* MODOS DE CENA — o APP escolhe (rotação), não o Mestre. Isso quebra o vício
   de sempre cair em "alguém irrompe com urgência": a variedade vira mecânica,
   não pedido. Só 1 em 7 modos permite tensão/interrupção. */
/* AÇÕES PRONTAS (estilo BG3): um toque preenche a ação no campo — o jogador
   completa o alvo/detalhe e envia. Zero tokens para "inventar" a ação. */
const ACOES_PRONTAS = [
  { icone: "⚔", rotulo: "Atacar", texto: "Ataco " },
  { icone: "🛡", rotulo: "Esquivar", texto: "Fico em postura defensiva, esquivando e me protegendo neste turno" },
  { icone: "✋", rotulo: "Empurrar", texto: "Empurro com força " },
  { icone: "🦵", rotulo: "Derrubar", texto: "Tento derrubar no chão " },
  { icone: "🏃", rotulo: "Correr", texto: "Corro em disparada para " },
  { icone: "🤸", rotulo: "Saltar", texto: "Salto sobre " },
  { icone: "🫥", rotulo: "Esconder", texto: "Me escondo nas sombras, buscando cobertura" },
  { icone: "🔍", rotulo: "Procurar", texto: "Examino o lugar com atenção, procurando " },
  { icone: "🤝", rotulo: "Ajudar", texto: "Ajudo " },
  { icone: "😤", rotulo: "Intimidar", texto: "Intimido com olhar e presença " },
  { icone: "🗣", rotulo: "Persuadir", texto: "Tento persuadir " },
  { icone: "🎭", rotulo: "Enganar", texto: "Tento enganar " },
];

const MODOS_MUNDO = [
  { id: "vinculo", texto: "VÍNCULO E CONVERSA — alguém próximo puxa papo pessoal: um companheiro revela algo de si, uma lembrança, um medo, uma piada interna, um afeto. Íntimo e humano. SEM ameaça, SEM notícia grave." },
  { id: "entre_npcs", texto: "NPCs ENTRE SI — dois ou mais personagens interagem ENTRE ELES na sua frente, sem depender de você: discutem, fofocam, flertam, negociam, brincam. Você é testemunha, não alvo. SEM crise." },
  { id: "governo", texto: "GOVERNO E ADMINISTRAÇÃO — assunto de gestão chega com calma e rotina: um relatório de colheita, uma disputa entre vassalos, um pedido de obra, um imposto, uma nomeação. Burocracia viva, SEM emergência." },
  { id: "cotidiano", texto: "COTIDIANO E POVO — a vida comum aparece: mercado, oficinas, crianças, festa, música, um artesão orgulhoso do trabalho, o cheiro da cidade. Textura do mundo, SEM conflito." },
  { id: "mundo", texto: "MUNDO E DESCOBERTA — algo do lugar se revela: um costume local, uma construção antiga, o clima mudando a rotina, uma história que contam por ali. Curiosidade, SEM perigo." },
  { id: "consequencia", texto: "CONSEQUÊNCIA LENTA — um efeito DISCRETO de algo que o jogador fez cenas atrás se manifesta sem drama: alguém agradece, um preço mudou, uma reputação circula, um rosto conhecido reaparece em paz." },
  { id: "tensao", texto: "TENSÃO (raro — este é o único modo em que algo pode apertar) — uma complicação surge, mas de forma ORGÂNICA e preparada: uma notícia que confirma algo já semeado, uma desconfiança, uma cobrança. Mesmo aqui: NADA de porta arrombada, mensageiro ofegante ou figura arrastada ao salão." },
];

function instrucaoMundo(modo, banirUrgencia) {
  return `Agora o mundo VIVE este mesmo instante — não avance o tempo (nada de "horas depois"), fique no presente imediato, mas faça a cena PULSAR com vida real.

MODO OBRIGATÓRIO DESTA CENA: ${modo.texto}
Siga o modo acima à risca. Ele foi escolhido pelo sistema justamente para variar o ritmo — ignorá-lo torna a campanha repetitiva.

- Pessoas FALAM e AGEM: dê falas reais aos NPCs (com nome), não só descrição de ambiente.
- Companheiros se manifestam: opinam, provocam, contam algo.
- 2-4 frases densas de vida presente, e devolva a vez a mim.
${banirUrgencia ? `
⛔ PROIBIDO NESTA CENA (você repetiu isso demais nas últimas cenas): alguém irromper/invadir o recinto; mensageiro ou arauto chegando ofegante; porta se abrindo com estrondo; figura arrastada por guardas; grito, súplica ou revelação urgente; qualquer nova ameaça anunciada. A cena precisa ser calma e cotidiana. Se sentir vontade de criar uma emergência, ESCOLHA outra coisa.` : `
⛔ Não use "alguém irrompe com urgência" nem interrupção dramática — esse recurso está desgastado nesta campanha.`}`;
}

/* Trilho enxuto (mobile): 4 abas. Ficha, Grupo, Pessoas, Guilda e Domínios
   vivem como SUB-abas dentro de Gestão. */
const ABAS = [{ id: "gestao", rotulo: "Gestão", icone: "🏛" }, { id: "diario", rotulo: "Diário", icone: "📜" }, { id: "inv", rotulo: "Bolsa", icone: "◆" }, { id: "mapa", rotulo: "Mapa", icone: "🗺" }, { id: "codex", rotulo: "Códex", icone: "📖" }, { id: "ascensao", rotulo: "Ascensão", icone: "🌟", soDesperto: true }];
const SUBS_GESTAO = [{ id: "ficha", rotulo: "Ficha" }, { id: "grupo", rotulo: "Grupo" }, { id: "pessoas", rotulo: "Pessoas" }, { id: "guilda", rotulo: "Guilda" }, { id: "dominios", rotulo: "Domínios" }, { id: "diplomacia", rotulo: "Diplomacia" }, { id: "correio", rotulo: "Correio" }, { id: "mural", rotulo: "Mural" }];

const RARIDADE_COR = { comum: "#9B93AC", incomum: "#7BC98F", raro: "#6BA9E8", epico: "#B084E8", lendario: "#E8A33D" };
const SLOT_ROTULO = { arma: "Arma", armadura: "Armadura", elmo: "Elmo", botas: "Botas", anel: "Anel", amuleto: "Amuleto", escudo: "Escudo" };
const SLOTS_ORDEM = ["arma", "escudo", "armadura", "elmo", "botas", "anel", "amuleto"];

function TrilhoAbas({ abaAtiva, aoClicar, nGrupo, desperto }) {
  return (
    <nav className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1.5 py-2 pl-1.5" aria-label="Painéis">
      {ABAS.filter((a) => !a.soDesperto || desperto).map((aba) => {
        const ativa = abaAtiva === aba.id;
        return (
          <button key={aba.id} onClick={() => aoClicar(ativa ? null : aba.id)}
            className="flex flex-col items-center justify-center gap-0.5 rounded-l-xl transition-all"
            style={{ width: 52, height: 58, background: ativa ? T.panelSoft : T.panel, border: `1px solid ${ativa ? T.amber : T.line}`, borderRight: "none", color: ativa ? T.amberSoft : T.inkDim }}>
            <span className="text-base leading-none">{aba.icone}</span>
            <span className="tv-mono text-[9px] uppercase tracking-wider">{aba.rotulo}</span>
            {aba.id === "gestao" && nGrupo > 0 && <span className="tv-mono text-[9px] leading-none rounded-full px-1" style={{ background: T.violet, color: T.onSecond }}>{nGrupo}</span>}
          </button>
        );
      })}
    </nav>
  );
}

function CartaoMembro({ nome, subtitulo, nivel, vida, vidaMax, mana, manaMax, descricao, habilidades, ehVoce, semente, xpComp, vinculo }) {
  const [verHabs, setVerHabs] = React.useState(false); // habilidades sob demanda — cartão limpo
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
        {!ehVoce && xpComp != null && <BarraMini rotulo="XP" atual={xpComp} max={XP_POR_NIVEL(nivel || 1)} cor={T.ok} />}
      </div>
      {!ehVoce && vinculo != null && (() => {
        const m = marcoDe(vinculo), prox = proximoMarco(vinculo);
        return (
          <div className="mt-2 rounded-lg px-2.5 py-2" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
            <div className="flex items-center justify-between mb-1">
              <span className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: T.inkDim }}>Vínculo {m ? `${m.icone} ${m.nome}` : "· conhecido"}</span>
              <span className="tv-mono text-[10px]" style={{ color: T.amberSoft }}>{vinculo}/{VINCULO_MAX}{prox ? ` → ${prox.icone} ${prox.nome} em ${prox.valor}` : " · máximo"}</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: T.panelSoft }}>
              <div className="h-full rounded-full" style={{ width: `${vinculo}%`, background: T.violet }} />
            </div>
          </div>
        );
      })()}
      {habilidades && habilidades.length > 0 && (
        <div className="mt-2.5">
          <button onClick={() => setVerHabs((v) => !v)} className="tv-mono text-[9px] px-2 py-1 rounded" style={{ border: `1px dashed ${T.line}`, color: T.violetSoft }}>
            {verHabs ? "▾ ocultar habilidades" : `▸ ver habilidades (${habilidades.length})`}
          </button>
          {verHabs && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {habilidades.map((h, i) => (
                <span key={i} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: T.panel, color: T.violetSoft, border: `1px solid ${T.line}` }} title={h.descricao}>{h.nome}{h.custo != null ? ` · ${h.custo}PM` : ""}</span>
              ))}
            </div>
          )}
        </div>
      )}
      {descricao && <div className="tv-body text-xs mt-3" style={{ color: T.inkDim }}>{descricao}</div>}
    </div>
  );
}

function SeletorCaminho({ mundo, alvo, atual, acampado, trocarCaminho, fechar }) {
  mundo = mundo || { genero: "Fantasia medieval" };
  const racasDisp = racasDoGenero(mundo.genero);
  const ehFuturista = ["Ficção científica", "Cyberpunk", "Pós-apocalíptico"].includes(mundo.genero);
  const [raca, setRaca] = React.useState(atual.raca || racasDisp[0].nome);
  const [classe, setClasse] = React.useState(atual.classe || CLASSES[0].nome);
  const [subclasse, setSubclasse] = React.useState(atual.subclasse || CLASSES[0].subclasses[0].nome);
  const [profissao, setProfissao] = React.useState(atual.profissao || PROFISSOES[0].nome);
  const cObj = classePorNome(classe);
  const jaTinha = !!atual.classe;
  const custo = jaTinha ? 80 : 20;
  const campo = { background: T.panelSoft, border: `1px solid ${T.line}`, color: T.ink };
  return (
    <div className="rounded-xl p-3 mt-2" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
      <div className="tv-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: T.amberSoft }}>{jaTinha ? "Trilhar novo caminho" : "Definir caminho"} · {custo} moedas</div>
      {!acampado ? (
        <div className="tv-body text-xs" style={{ color: T.danger }}>⛺ Você precisa estar acampado. Feche a ficha, monte acampamento e volte aqui.</div>
      ) : (
        <div className="space-y-2">
          <div>
            <div className="tv-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: T.inkDim }}>{ehFuturista ? "Origem" : "Raça"}</div>
            <select value={raca} onChange={(e) => setRaca(e.target.value)} className="w-full rounded-lg p-2 tv-body text-xs outline-none" style={campo}>
              {racasDisp.map((r) => <option key={r.nome} value={r.nome}>{r.nome}</option>)}
            </select>
          </div>
          <div>
            <div className="tv-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: T.inkDim }}>Classe</div>
            <select value={classe} onChange={(e) => { setClasse(e.target.value); setSubclasse(classePorNome(e.target.value).subclasses[0].nome); }} className="w-full rounded-lg p-2 tv-body text-xs outline-none" style={campo}>
              {CLASSES.map((c) => <option key={c.nome} value={c.nome}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <div className="tv-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: T.inkDim }}>Caminho</div>
            <select value={subclasse} onChange={(e) => setSubclasse(e.target.value)} className="w-full rounded-lg p-2 tv-body text-xs outline-none" style={campo}>
              {(cObj?.subclasses || []).map((sc) => <option key={sc.nome} value={sc.nome}>{sc.nome}</option>)}
            </select>
          </div>
          <div>
            <div className="tv-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: T.inkDim }}>Profissão</div>
            <select value={profissao} onChange={(e) => setProfissao(e.target.value)} className="w-full rounded-lg p-2 tv-body text-xs outline-none" style={campo}>
              {PROFISSOES.map((pr) => <option key={pr.nome} value={pr.nome}>{pr.nome}</option>)}
            </select>
          </div>
          <button onClick={() => { trocarCaminho(alvo, { raca, classe, subclasse, profissao }); fechar(); }}
            className="w-full rounded-lg py-2 tv-mono text-xs" style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>
            Confirmar · {custo} moedas
          </button>
        </div>
      )}
    </div>
  );
}

function PainelDiario({ historia, quests, trocarArco, eventos, diaAtual }) {
  const [trocando, setTrocando] = React.useState(false);
  const est = estruturaPorId((historia || {}).estrutura);
  const etapaIdx = Math.min((historia || {}).etapa || 0, est.etapas.length - 1);
  const ativas = (quests || []).filter((q) => q.status === "ativa");
  const principais = ativas.filter((q) => q.tipo === "principal");
  const secundarias = ativas.filter((q) => q.tipo !== "principal");
  const encerradas = (quests || []).filter((q) => q.status !== "ativa");
  const Missao = ({ q }) => (
    <div className="rounded-lg px-3 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${q.status === "concluida" ? T.ok : q.status === "falhada" ? T.danger : q.tipo === "principal" ? T.amber : T.line}`, opacity: q.status === "ativa" ? 1 : 0.65 }}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="tv-body text-sm" style={{ color: T.ink }}>{q.status === "concluida" ? "✓ " : q.status === "falhada" ? "✗ " : ""}{q.titulo}</span>
        {q.tipo === "principal" && q.status === "ativa" && <span className="tv-mono text-[9px] px-1.5 py-0.5 rounded shrink-0" style={{ color: T.amberSoft, border: `1px solid ${T.amber}` }}>PRINCIPAL</span>}
      </div>
      {q.descricao && <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{q.descricao}</div>}
      {q.objetivo && q.status === "ativa" && <div className="tv-body text-xs mt-1" style={{ color: T.amberSoft }}>🎯 {q.objetivo}</div>}
      {q.nota && <div className="tv-body text-xs mt-1 italic" style={{ color: T.violetSoft }}>» {q.nota}</div>}
    </div>
  );
  return (
    <div>
      <div className="rounded-xl p-4 mb-4" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
        <div className="flex items-center justify-between mb-1">
          <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.violetSoft }}>Arco da campanha</div>
          <button onClick={() => setTrocando((v) => !v)} className="tv-mono text-[10px] px-2 py-0.5 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>↺ trocar arco</button>
        </div>
        <div className="tv-display text-xl" style={{ color: T.ink }}>{est.nome}</div>
        {trocando && (
          <div className="mt-3 space-y-2">
            <div className="tv-body text-xs" style={{ color: T.inkDim }}>Mudar a perspectiva da campanha — o mundo e a história vividos permanecem; só o rumo dramático muda.</div>
            {ESTRUTURAS.filter((e) => e.id !== (historia || {}).estrutura).map((e) => (
              <button key={e.id} onClick={() => { trocarArco(e.id); setTrocando(false); }} className="w-full text-left rounded-lg p-3" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
                <div className="tv-display text-base" style={{ color: T.amberSoft }}>{e.nome}</div>
                <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{e.desc}</div>
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {est.etapas.map((et, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="tv-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: i === etapaIdx ? T.amber : i < etapaIdx ? T.panel : "transparent", color: i === etapaIdx ? T.onAccent : i < etapaIdx ? T.ok : T.inkDim, border: `1px solid ${i === etapaIdx ? T.amber : T.line}`, fontWeight: i === etapaIdx ? 700 : 400 }}>{i < etapaIdx ? "✓ " : ""}{et.nome}</span>
              {i < est.etapas.length - 1 && <span style={{ color: T.inkDim, fontSize: 9 }}>→</span>}
            </div>
          ))}
        </div>
      </div>
      {ativas.length === 0 && <div className="tv-body text-sm italic mb-4" style={{ color: T.inkDim }}>Nenhuma missão ativa ainda — elas surgem conforme a história se abre.</div>}
      {principais.length > 0 && (<><div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.amberSoft }}>Missão principal</div><div className="space-y-2 mb-4">{principais.map((q, i) => <Missao key={i} q={q} />)}</div></>)}
      {secundarias.length > 0 && (<><div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Missões secundárias</div><div className="space-y-2 mb-4">{secundarias.map((q, i) => <Missao key={i} q={q} />)}</div></>)}
      {encerradas.length > 0 && (<><div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Encerradas</div><div className="space-y-2">{encerradas.map((q, i) => <Missao key={i} q={q} />)}</div></>)}

      {/* FIOS DO MUNDO (v7.2): evento global em curso + fios locais com prazo */}
      {eventos && eventos.global && (
        <>
          <div className="tv-mono text-[10px] uppercase tracking-widest mt-5 mb-1.5" style={{ color: T.danger }}>🌍 Evento global em curso</div>
          <div className="rounded-lg px-3 py-2.5 mb-2" style={{ background: T.panelSoft, border: `1px solid ${T.danger}` }}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="tv-body text-sm font-bold" style={{ color: T.ink }}>{eventos.global.nome}</span>
              <span className="tv-mono text-[9px] shrink-0" style={{ color: T.danger }}>etapa {eventos.global.etapa + 1}/{eventos.global.etapas.length}</span>
            </div>
            <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{eventos.global.semente}</div>
            <div className="tv-body text-xs mt-1" style={{ color: T.amberSoft }}>▶ Agora: {eventos.global.etapas[eventos.global.etapa]}</div>
          </div>
        </>
      )}
      {eventos && (eventos.locais || []).length > 0 && (
        <>
          <div className="tv-mono text-[10px] uppercase tracking-widest mt-4 mb-1.5" style={{ color: T.inkDim }}>🌱 Fios do mundo (se resolvem sem você)</div>
          <div className="space-y-2">
            {eventos.locais.map((l) => (
              <div key={l.id} className="rounded-lg px-3 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                <div className="tv-body text-xs" style={{ color: T.ink }}>{l.icone} {l.texto}</div>
                <div className="flex items-baseline justify-between gap-2 mt-1">
                  <span className="tv-body text-[11px] italic" style={{ color: T.violetSoft }}>{l.gancho}</span>
                  <span className="tv-mono text-[9px] shrink-0" style={{ color: diaAtual >= l.expiraEm ? T.danger : T.inkDim }}>até dia {l.expiraEm}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PainelMapa({ mapa, faccaoJogador, cidadeAtual }) {
  const [selecionada, setSelecionada] = React.useState(null);
  const cidades = (mapa?.cidades || []);
  const faccoes = (mapa?.faccoes || []);
  const dominadas = cidades.filter((c) => c.relacao === "jogador").length;
  const regioes = [...new Set(cidades.map((c) => c.regiao).filter(Boolean))];
  const gruposRegiao = {};
  cidades.forEach((c) => { if (c.regiao) (gruposRegiao[c.regiao] = gruposRegiao[c.regiao] || []).push(c); });
  if (cidades.length === 0) {
    return <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>O mapa ainda está em branco. Conforme você explora, cidades e territórios aparecem aqui — e ficam salvos, para o mundo nunca mais se perder.</div>;
  }
  return (
    <div>
      {faccaoJogador && (
        <div className="rounded-xl p-3 mb-3" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
          <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.amberSoft }}>Sua facção</div>
          <div className="tv-display text-xl" style={{ color: T.ink }}>{faccaoJogador}</div>
          <div className="tv-body text-xs" style={{ color: T.inkDim }}>Domina {dominadas} {dominadas === 1 ? "cidade" : "cidades"}.</div>
        </div>
      )}
      {/* mapa visual — pergaminho */}
      <div className="relative rounded-xl mb-3" style={{ border: `1px solid ${T.line}`, aspectRatio: "4 / 3", overflow: "hidden", background: "#96b7ae" }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <filter id="tvPapel"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" /><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45 0 0 0 0 0.38 0 0 0 0 0.26 0 0 0 0.28 0" /></filter>
            <filter id="tvCosta" x="-25%" y="-25%" width="150%" height="150%"><feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="3" seed="7" result="t" /><feDisplacementMap in="SourceGraphic" in2="t" scale="3.2" /></filter>
          </defs>
          {/* mar */}
          <rect x="0" y="0" width="100" height="100" fill="#96b7ae" />
          {/* continente (halo costeiro + terra) */}
          {cidades.length > 0 && (() => {
            const dCont = blobPath(cidades, 17, "continente|" + cidades.length);
            return (
              <g filter="url(#tvCosta)">
                <path d={dCont} fill="none" stroke="#f0e7cf" strokeWidth="2.6" opacity="0.55" />
                <path d={dCont} fill="#eadfc1" stroke="#6d5c40" strokeWidth="0.5" />
              </g>
            );
          })()}
          {/* territórios de região (tinta + divisa tracejada) */}
          {Object.entries(gruposRegiao).map(([nomeR, csR], i) => {
            const cor = (centrosDeRegiao(csR)[0] || {}).cor || "#9A93A6";
            return (
              <g key={`terr-${i}`} filter="url(#tvCosta)">
                <path d={blobPath(csR, 8.5, "regiao|" + nomeR)} fill={cor} opacity="0.14" stroke="#6d5c40" strokeOpacity="0.55" strokeWidth="0.35" strokeDasharray="1.6 1.2" />
              </g>
            );
          })}
          {/* estradas */}
          {gerarEstradas(cidades).map((rt, i) => {
            const a = cidades[rt.a], b = cidades[rt.b];
            if (!a || !b) return null;
            return <line key={`rd-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#7a5f3d" strokeOpacity={rt.mesmaRegiao ? 0.55 : 0.35} strokeWidth={rt.mesmaRegiao ? 0.5 : 0.4} strokeDasharray={rt.mesmaRegiao ? "" : "1.2 1.2"} />;
          })}
          {/* montanhas decorativas por região */}
          {centrosDeRegiao(cidades).map((r, i) => (
            <g key={`mt-${i}`} stroke="#6d5c40" strokeWidth="0.4" fill="none" opacity="0.6">
              <path d={`M ${r.x - 4.4} ${r.y - 4.6} L ${r.x - 3} ${r.y - 6.6} L ${r.x - 1.6} ${r.y - 4.6}`} />
              <path d={`M ${r.x - 1.2} ${r.y - 4.4} L ${r.x + 0.4} ${r.y - 6.9} L ${r.x + 2} ${r.y - 4.4}`} />
              <path d={`M ${r.x + 2.4} ${r.y - 4.6} L ${r.x + 3.8} ${r.y - 6.4} L ${r.x + 5.2} ${r.y - 4.6}`} />
            </g>
          ))}
          {/* textura de papel sobre tudo */}
          <rect x="0" y="0" width="100" height="100" filter="url(#tvPapel)" opacity="0.55" />
          {/* rosa dos ventos */}
          <g transform="translate(90.5,88)">
            <path d="M0,-6.2 L1.3,-1.3 L6.2,0 L1.3,1.3 L0,6.2 L-1.3,1.3 L-6.2,0 L-1.3,-1.3 Z" fill="#5c4a30" opacity="0.85" />
            <path d="M0,-3.6 L0.9,-0.9 L3.6,0 L0.9,0.9 L0,3.6 L-0.9,0.9 L-3.6,0 L-0.9,-0.9 Z" fill="#c9a45a" transform="rotate(45)" opacity="0.9" />
            <circle r="0.7" fill="#eadfc1" />
          </g>
          {/* barra de escala */}
          <g transform="translate(6,93.5)">
            {[0, 1, 2, 3].map((k) => <rect key={k} x={k * 5} y="0" width="5" height="1.1" fill={k % 2 ? "#eadfc1" : "#5c4a30"} stroke="#5c4a30" strokeWidth="0.15" />)}
          </g>
          {/* moldura dupla */}
          <rect x="0.8" y="0.8" width="98.4" height="98.4" fill="none" stroke="#5c4a30" strokeWidth="0.7" opacity="0.8" />
          <rect x="2.2" y="2.2" width="95.6" height="95.6" fill="none" stroke="#5c4a30" strokeWidth="0.25" opacity="0.6" />
        </svg>
        {/* nomes das regiões */}
        {centrosDeRegiao(cidades).map((r, i) => (
          <div key={`rn-${i}`} style={{ position: "absolute", left: `${r.x}%`, top: `${r.y - 10}%`, transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
            <div className="tv-display" style={{ fontSize: 12, color: "#5c4a30", opacity: 0.75, letterSpacing: "0.06em", whiteSpace: "nowrap", textShadow: "0 1px 1px #f0e6cc" }}>{r.regiao}</div>
          </div>
        ))}
        {/* cidades */}
        {cidades.map((c, i) => {
          const rel = RELACOES[c.relacao] || RELACOES.neutra;
          const atual = cidadeAtual && c.nome.toLowerCase() === String(cidadeAtual).toLowerCase();
          return (
            <div key={i} style={{ position: "absolute", left: `${c.x}%`, top: `${c.y}%`, transform: "translate(-50%,-50%)", textAlign: "center" }}>
              <div onClick={() => setSelecionada(selecionada === c.nome ? null : c.nome)} style={{ width: c.sede ? 15 : 10, height: c.sede ? 15 : 10, borderRadius: c.tipo === "capital" || c.sede ? 3 : "50%", background: rel.cor, border: (atual || selecionada === c.nome) ? `2px solid #3a2e1c` : `1.5px solid #3a2e1c`, boxShadow: (atual || selecionada === c.nome) ? `0 0 8px #c9a45a` : "0 1px 2px #00000040", margin: "0 auto", cursor: "pointer" }} />
              <div className="tv-mono" style={{ fontSize: 7, color: "#3a2e1c", marginTop: 1, whiteSpace: "nowrap", fontWeight: 600, textShadow: "0 1px 2px #f0e6cc, 0 -1px 2px #f0e6cc" }}>{c.nome}{c.sede ? " ★" : ""}</div>
            </div>
          );
        })}
      </div>
      {/* legenda */}
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(RELACOES).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: "50%", background: v.cor, display: "inline-block" }} /><span className="tv-mono text-[9px]" style={{ color: T.inkDim }}>{v.rotulo}</span></div>
        ))}
      </div>
      {/* facções conhecidas */}
      {faccoes.length > 0 && (
        <div className="mb-3">
          <div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Facções</div>
          <div className="space-y-1.5">
            {faccoes.map((f, i) => {
              const rel = RELACOES[f.relacao] || RELACOES.neutra;
              return (
                <div key={i} className="rounded-lg px-3 py-2 flex items-center justify-between gap-2" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                  <div><span className="tv-body text-sm" style={{ color: T.ink }}>{f.nome}</span>{f.lider ? <span className="tv-body text-xs" style={{ color: T.inkDim }}> · {f.lider}</span> : null}</div>
                  <span className="tv-mono text-[9px] px-1.5 py-0.5 rounded shrink-0" style={{ color: rel.cor, border: `1px solid ${rel.cor}` }}>{rel.rotulo}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* lista de cidades por região */}
      <div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Cidades ({cidades.length})</div>
      <div className="space-y-2">
        {cidades.map((c, i) => {
          const rel = RELACOES[c.relacao] || RELACOES.neutra;
          const aberta = selecionada === c.nome;
          const atual = cidadeAtual && c.nome.toLowerCase() === String(cidadeAtual).toLowerCase();
          return (
            <div key={i} className="rounded-lg px-3 py-2" style={{ background: T.panelSoft, border: `1px solid ${aberta ? T.amber : atual ? T.amberSoft : T.line}`, cursor: "pointer" }} onClick={() => setSelecionada(aberta ? null : c.nome)}>
              <div className="flex items-center justify-between gap-2">
                <span className="tv-body text-sm" style={{ color: T.ink }}>{c.sede ? "★ " : ""}{atual ? "📍 " : ""}{c.nome}</span>
                <span className="tv-mono text-[9px] px-1.5 py-0.5 rounded shrink-0" style={{ color: rel.cor, border: `1px solid ${rel.cor}` }}>{rel.rotulo}</span>
              </div>
              <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{c.tipo}{c.regiao ? ` · ${c.regiao}` : ""}{c.faccao ? ` · ${c.faccao}` : ""}</div>
              {aberta && (c.notas || (c.locais || []).length > 0) && (
                <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${T.line}` }}>
                  {c.notas && <div className="tv-body text-xs" style={{ color: T.inkDim }}>{c.notas}</div>}
                  {(c.locais || []).length > 0 && <div className="tv-body text-xs mt-1" style={{ color: T.violetSoft }}>Locais: {c.locais.join(", ")}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Painel de PESSOAS: todo o elenco conhecido, com retrato determinístico,
   relação colorida e o que se sabe de cada um. Segredos ficam FORA da tela —
   são memória do Mestre, não spoiler para o jogador. */
function PainelPessoas({ npcs, grupo, onConvidar, grupoCheio, onDefinirRelacao }) {
  const lista = Object.values(npcs || {}).sort((a, b) => (b.ultimaVez || 0) - (a.ultimaVez || 0));
  const nomesGrupo = new Set((grupo || []).map((g) => (g.nome || "").toLowerCase()));
  /* membros do grupo também têm relação formal: puxa a ficha do registro se existir */
  const fichaDe = (nome) => Object.values(npcs || {}).find((n) => (n.nome || "").toLowerCase() === (nome || "").toLowerCase());
  if (!lista.length && !(grupo || []).length) {
    return <div className="tv-body text-sm italic text-center py-10" style={{ color: T.inkDim }}>Ninguém conhecido ainda. As pessoas marcantes que você encontrar aparecerão aqui — com rosto, relação e tudo que você sabe sobre elas.</div>;
  }
  const cartao = (n, ehGrupo) => {
    const rel = relacaoNPC(ehGrupo ? "companheiro" : n.relacao);
    const morto = (n.status || "").toLowerCase().includes("morto");
    const convidavel = !ehGrupo && !morto && n.relacao !== "inimigo" && onConvidar;
    return (
      <div key={`${ehGrupo ? "g" : "n"}-${n.nome}`} className="rounded-xl p-3 flex items-start gap-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}`, opacity: morto ? 0.55 : 1 }}>
        <Retrato semente={n.semente || n.nome} tamanho={46} anel={rel.cor} estado={morto ? "grave" : "normal"} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="tv-display text-lg leading-tight truncate" style={{ color: T.ink }}>{n.nome}{morto ? " ☠" : ""}</span>
            <span className="tv-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0" style={{ border: `1px solid ${rel.cor}`, color: rel.cor }}>{rel.rotulo}</span>
          </div>
          <div className="tv-body text-xs italic truncate" style={{ color: T.inkDim }}>{[n.papel, n.genero, n.local ? `em ${n.local}` : "", n.conhecidoEm != null ? (n.conhecidoEm > 0 ? `conhecido(a) no dia ${n.conhecidoEm}` : "antes do dia 1") : ""].filter(Boolean).join(" · ") || "—"}</div>
          {n.notas && <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{n.notas}</div>}
          {onDefinirRelacao && !morto && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: T.inkDim }}>relação:</span>
              <select value={(n.relacao || (ehGrupo ? "aliado" : "neutro")).toLowerCase()} onChange={(e) => onDefinirRelacao(n.nome, e.target.value)}
                className="tv-mono text-[10px] rounded px-1.5 py-0.5"
                style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.ink }}>
                {["aliado", "amigo", "romance", "conjuge", "familia", "neutro", "rival", "inimigo"].map((r) => (
                  <option key={r} value={r}>{relacaoNPC(r).rotulo}</option>
                ))}
              </select>
            </div>
          )}
          {convidavel && (
            <button onClick={() => onConvidar(n.nome)} disabled={grupoCheio}
              className="tv-mono text-[10px] mt-1.5 px-2 py-1 rounded"
              style={{ border: `1px solid ${T.violet}`, color: T.violetSoft, opacity: grupoCheio ? 0.4 : 1, cursor: grupoCheio ? "not-allowed" : "pointer" }}>
              {grupoCheio ? "grupo cheio" : "⚑ convidar para o grupo"}
            </button>
          )}
        </div>
      </div>
    );
  };
  return (
    <div className="space-y-2">
      {(grupo || []).map((g) => { const f = fichaDe(g.nome) || {}; return cartao({ nome: g.nome, papel: [g.classe, g.subclasse].filter(Boolean).join(" · ") || g.conceito, notas: g.descricao, semente: g.semente, relacao: f.relacao, conhecidoEm: f.conhecidoEm != null ? f.conhecidoEm : 0 }, true); })}
      {lista.filter((n) => !nomesGrupo.has((n.nome || "").toLowerCase())).map((n) => cartao(n, false))}
    </div>
  );
}

/* Painel do MURAL DE CONTRATOS: serviços gerados por tabela (alvo, destino,
   recompensa — tudo em código). Aceitar vira quest com a recompensa embutida;
   o app paga sozinho quando o Mestre marca "concluida". O mural nunca fica
   vazio: ao aceitar um, outro cartaz é pregado no lugar. */
/* ---------------- ASCENSÃO (v7.4): escala GD, fé e o panteão ----------------
   Só aparece depois do despertar (nível NIVEL_DESPERTAR). Rastreável: o
   jogador VÊ a própria força e a de cada deus — e quando tem vantagem. */
function PainelAscensao({ divindade, nivel, onDespertar, onRecalibrar, recalibrando }) {
  const dv = divindade || garantirDivindade(null);
  const gd = grauDe(dv);
  const prox = proximoPatamar(dv);
  const podeDespertar = (nivel || 1) >= NIVEL_DESPERTAR;
  const comparar = (gdOutro) => {
    const b = bonusDivino(gd, gdOutro);
    if (b > 0) return { txt: `vantagem +${b}`, cor: "#7BC98F" };
    if (b < 0) return { txt: `desvantagem ${b}`, cor: T.danger };
    return { txt: "equilíbrio", cor: T.inkDim };
  };
  if (!dv.despertar) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.amber}` }}>
          <div className="tv-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: T.amberSoft }}>Ascensão</div>
          <div className="tv-display text-2xl" style={{ color: T.ink }}>O cosmos ainda não te enxerga</div>
          <div className="tv-body text-sm mt-2 leading-relaxed" style={{ color: T.inkDim }}>
            A trilha dos três estágios (Servo Escolhido → Semideus → Nova Divindade) abre no nível {NIVEL_DESPERTAR}.
            {podeDespertar ? " Você já cruzou esse marco — o despertar acontece sozinho no próximo turno, ou agora, pelo botão abaixo." : " Siga lendário até lá."}
          </div>
          {podeDespertar && (
            <div className="mt-3 space-y-2">
              <button onClick={onDespertar} className="tv-btn w-full rounded-xl py-2.5 tv-mono text-xs uppercase tracking-widest" style={{ background: T.amber, color: "#1A1206" }}>🌟 Despertar agora</button>
              <button onClick={onRecalibrar} disabled={recalibrando} className="tv-btn w-full rounded-xl py-2.5 tv-mono text-xs uppercase tracking-widest" style={{ background: T.panelSoft, border: `1px solid ${T.violetSoft}`, color: T.violetSoft }}>{recalibrando ? "⚖ Lendo sua lenda…" : "⚖ Recalibrar com a IA"}</button>
              <div className="tv-body text-[11px]" style={{ color: T.inkDim }}>Já é divindade na história? A recalibração lê o livro da aventura e o cânone e ajusta GD, fiéis, domínio e panteão pelo que de fato aconteceu — nada é inventado.</div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.amber}` }}>
        <div className="tv-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: T.amberSoft }}>Seu lugar no cosmos</div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="tv-display text-3xl" style={{ color: T.ink }}>GD {gd} · {tituloDe(gd)}</span>
          <span className="tv-mono text-xs" style={{ color: T.inkDim }}>nível {nivel}</span>
        </div>
        <div className="tv-body text-sm mt-1" style={{ color: T.inkDim }}>{GRAUS[gd].desc}</div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-xl p-2.5 text-center" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
            <div className="tv-display text-xl" style={{ color: T.amber }}>{dv.fieis.toLocaleString("pt-BR")}</div>
            <div className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>fiéis</div>
          </div>
          <div className="rounded-xl p-2.5 text-center" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
            <div className="tv-display text-xl" style={{ color: T.violetSoft }}>{dv.pf}</div>
            <div className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>pontos de fé</div>
          </div>
        </div>
        {prox ? (
          <div className="mt-3">
            <div className="flex justify-between tv-mono text-[10px] mb-1" style={{ color: T.inkDim }}>
              <span>rumo a GD {prox.gd} · {prox.titulo}</span><span>faltam {prox.falta.toLocaleString("pt-BR")} fiéis</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.panelSoft }}>
              <div className="h-full rounded-full" style={{ width: `${Math.round(prox.progresso * 100)}%`, background: T.amber }} />
            </div>
          </div>
        ) : <div className="tv-mono text-[10px] mt-3 uppercase tracking-widest" style={{ color: T.amber }}>Topo da escala — não há mais degraus acima de você.</div>}
        {(dv.dominio || dv.patrono) && (
          <div className="tv-body text-sm mt-3" style={{ color: T.ink }}>
            {dv.dominio && <div>🌌 Domínio: <b>{dv.dominio}</b></div>}
            {dv.patrono && <div>🙏 Patrono: <b>{dv.patrono}</b></div>}
          </div>
        )}
      </div>

      <div className="rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
        <div className="tv-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: T.violetSoft }}>A Regra do Degrau</div>
        <div className="tv-body text-xs leading-relaxed" style={{ color: T.inkDim }}>
          Cada degrau de diferença de GD dá <b style={{ color: T.ink }}>+2 ao mais forte e −2 ao mais fraco</b> em ataques, defesas e resistências (o sistema aplica nos dados). Mortais não ferem divindades de GD 3+ sem artefato lendário ou bênção. Fé se ganha com feitos testemunhados, santuários e conversões — e se gasta em milagres (pequeno ~5 PF, médio ~20, grande ~50).
        </div>
      </div>

      <div className="rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
        <div className="tv-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: T.amberSoft }}>Panteão conhecido</div>
        {dv.panteao.length === 0 ? (
          <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Nenhuma divindade se revelou ainda. Os geradores do mundo apresentarão deuses conforme sua ascensão avança.</div>
        ) : (
          <div className="space-y-2">
            {dv.panteao.map((d) => {
              const cmp = comparar(d.gd);
              const imune = imunePorEscopo(gd, d.gd);
              return (
                <div key={d.id || d.nome} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="tv-display text-lg" style={{ color: T.ink }}>{d.icone} {d.nome} <span className="tv-body text-sm" style={{ color: T.inkDim }}>{d.dominio}</span></span>
                    <span className="tv-mono text-[10px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${cmp.cor}`, color: cmp.cor }}>{cmp.txt}</span>
                  </div>
                  <div className="tv-mono text-[10px] mt-1" style={{ color: T.inkDim }}>GD {d.gd} · {tituloDe(d.gd)} · {(d.fieis || 0).toLocaleString("pt-BR")} fiéis · culto: {d.culto}</div>
                  {d.nota && <div className="tv-body text-xs mt-1 italic" style={{ color: T.inkDim }}>{d.nota}</div>}
                  {imune && <div className="tv-body text-[11px] mt-1" style={{ color: T.danger }}>⚠ Imune ao seu dano comum — cresça antes de desafiá-lo (ou enfraqueça a fé dele).</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={onRecalibrar} disabled={recalibrando} className="tv-btn w-full rounded-xl py-2.5 tv-mono text-[10px] uppercase tracking-widest" style={{ background: T.panelSoft, border: `1px solid ${T.violetSoft}`, color: T.violetSoft }}>
        {recalibrando ? "⚖ Lendo sua lenda…" : "⚖ Recalibrar ascensão com a IA"}
      </button>
    </div>
  );
}

function PainelMural({ mural, quests, aceitarContrato, abandonarContrato, garantirMural, acampado, decretos, pregarDecreto, cancelarDecreto, moedas, cofre, nivel }) {
  const ativos = (quests || []).filter((q) => q.contrato && q.status === "ativa");
  const [formAberto, setFormAberto] = React.useState(false);
  const [fTipo, setFTipo] = React.useState("cabeca");
  const [fAlvo, setFAlvo] = React.useState("");
  const [fRecompensa, setFRecompensa] = React.useState("");
  const justa = recompensaJusta(fTipo, nivel || 1);
  const totalOuro = (moedas || 0) + (cofre || 0);
  const valorDecreto = Math.max(5, parseInt(fRecompensa || "", 10) || justa);
  const cartazDecreto = (d) => {
    const t = tipoDecreto(d.tipo);
    const cor = d.status === "pregado" ? T.line : d.status === "aceito" ? T.violet : T.amber;
    return (
      <div key={d.id} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${cor}`, opacity: d.status === "resolvido" ? 0.65 : 1 }}>
        <div className="flex items-start justify-between gap-2">
          <span className="tv-display text-base leading-tight" style={{ color: T.ink }}>{t.icone} {d.alvo}</span>
          <span className="tv-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0" style={{ border: `1px solid ${T.amber}`, color: T.amberSoft }}>◉ {d.recompensa}</span>
        </div>
        <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{d.descricao}</div>
        <div className="tv-mono text-[9px] mt-1.5" style={{ color: d.status === "pregado" ? T.inkDim : d.status === "aceito" ? T.violetSoft : T.amberSoft }}>
          {d.status === "pregado" && "📌 pregado — aguardando quem tope o serviço…"}
          {d.status === "aceito" && `🗡 ${d.grupo ? d.grupo.bando : "um bando"} partiu para o serviço (dia ${(d.dias || 0) + 1})`}
          {d.status === "resolvido" && ROTULO_DESFECHO[d.desfecho]}
        </div>
        {d.status === "pregado" && (
          <button onClick={() => cancelarDecreto(d.id)} className="tv-mono text-[9px] mt-1.5 px-1.5 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>✕ retirar cartaz (devolve ◉ {d.recompensa})</button>
        )}
      </div>
    );
  };
  const cartaz = (c) => {
    const icone = ICONE_CONTRATO[c.tipo] || "📜";
    return (
      <div key={c.id} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
        <div className="flex items-start justify-between gap-2">
          <span className="tv-display text-base leading-tight" style={{ color: T.ink }}>{icone} {c.titulo}</span>
          <span className="tv-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0" style={{ border: `1px solid ${T.amber}`, color: T.amberSoft }}>◉ {c.recompensa.moedas} · {c.recompensa.xp} XP</span>
        </div>
        <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{c.descricao}</div>
        <button onClick={() => aceitarContrato(c)}
          className="tv-mono text-[10px] mt-2 px-2 py-1 rounded"
          style={{ border: `1px solid ${T.amber}`, color: T.amberSoft }}>
          ✍ aceitar contrato
        </button>
      </div>
    );
  };
  return (
    <div className="space-y-3">
      <div className="tv-body text-xs italic" style={{ color: T.inkDim }}>
        Cartazes pregados nos portões e tavernas da região. A recompensa é paga automaticamente quando o serviço é concluído de verdade na história. O mural é renovado a cada descanso longo.
      </div>
      {ativos.length > 0 && (
        <div>
          <p className="tv-mono text-[9px] uppercase tracking-[0.2em] mb-1.5" style={{ color: T.amber }}>Contratos em andamento</p>
          <div className="space-y-2">
            {ativos.map((q) => (
              <div key={q.titulo} className="rounded-xl p-3 flex items-start justify-between gap-2" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
                <div className="min-w-0">
                  <div className="tv-display text-base leading-tight" style={{ color: T.ink }}>🗡 {q.titulo}</div>
                  <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{q.descricao}</div>
                  <div className="tv-mono text-[9px] mt-1" style={{ color: T.violetSoft }}>recompensa: ◉ {q.contrato.moedas} · {q.contrato.xp} XP</div>
                </div>
                <button onClick={() => abandonarContrato(q.titulo)} className="tv-mono text-[9px] px-1.5 py-1 rounded shrink-0" style={{ border: `1px solid ${T.line}`, color: T.inkDim }} title="Abandonar">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="tv-mono text-[9px] uppercase tracking-[0.2em] mb-1.5" style={{ color: T.amber }}>Cartazes disponíveis</p>
        {(mural || []).length === 0 ? (
          <div className="text-center py-6">
            <div className="tv-body text-sm italic mb-3" style={{ color: T.inkDim }}>Nenhum cartaz por aqui…</div>
            <button onClick={() => garantirMural(true)} className="tv-mono text-[10px] px-3 py-1.5 rounded" style={{ border: `1px solid ${T.amber}`, color: T.amberSoft }}>📌 procurar cartazes</button>
          </div>
        ) : (
          <div className="space-y-2">{mural.map(cartaz)}</div>
        )}
      </div>
      {acampado && <div className="tv-body text-[11px] italic text-center" style={{ color: T.inkDim }}>Dica: ao sair do acampamento com um descanso longo, cartazes novos aparecem no mural.</div>}

      {/* SEUS DECRETOS: o reverso do mural — você oferece ouro, o mundo trabalha */}
      <div>
        <p className="tv-mono text-[9px] uppercase tracking-[0.2em] mb-1.5" style={{ color: T.violetSoft }}>Seus decretos e recompensas</p>
        <div className="tv-body text-xs italic mb-2" style={{ color: T.inkDim }}>
          Pregue seus próprios cartazes: a recompensa fica retida na hora (bolso + cofre da guilda), aventureiros do mundo podem aceitar — e voltam em alguns dias com o resultado. Fracasso: o ouro volta todo para você.
        </div>
        {(decretos || []).length > 0 && <div className="space-y-2 mb-2">{decretos.map(cartazDecreto)}</div>}
        {!formAberto ? (
          <button onClick={() => { setFormAberto(true); setFRecompensa(String(recompensaJusta(fTipo, nivel || 1))); }} className="tv-mono text-[10px] px-3 py-1.5 rounded w-full" style={{ border: `1px solid ${T.violet}`, color: T.violetSoft }}>📣 pregar um decreto</button>
        ) : (
          <div className="rounded-xl p-3 space-y-2" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
            <div className="flex gap-1.5 flex-wrap">
              {TIPOS_DECRETO.map((t) => (
                <button key={t.id} onClick={() => { setFTipo(t.id); setFRecompensa(String(recompensaJusta(t.id, nivel || 1))); }}
                  className="tv-mono text-[9px] px-2 py-1 rounded"
                  style={{ background: fTipo === t.id ? T.violet : "transparent", color: fTipo === t.id ? T.onAccent : T.inkDim, border: `1px solid ${fTipo === t.id ? T.violet : T.line}` }}>
                  {t.icone} {t.rotulo}
                </button>
              ))}
            </div>
            <input value={fAlvo} onChange={(e) => setFAlvo(e.target.value)} placeholder="Alvo — ex.: o líder de Ferroval, a Cripta dos Sussurros, a caravana de Bruna…"
              className="w-full tv-body text-sm rounded-lg px-3 py-2" style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.ink }} />
            <div className="flex items-center gap-2">
              <span className="tv-mono text-[10px] shrink-0" style={{ color: T.inkDim }}>◉ recompensa:</span>
              <input value={fRecompensa} onChange={(e) => setFRecompensa(e.target.value.replace(/\D/g, ""))} inputMode="numeric"
                className="w-24 tv-mono text-sm rounded-lg px-2 py-1.5 text-center" style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.amberSoft }} />
              <span className="tv-mono text-[9px]" style={{ color: T.inkDim }}>justa ≈ ◉ {justa} · quanto mais generosa, mais chance de aceitarem</span>
            </div>
            <div className="tv-mono text-[9px]" style={{ color: totalOuro >= valorDecreto ? T.inkDim : "#e07070" }}>
              Ouro disponível (bolso + cofre): ◉ {totalOuro}{totalOuro < valorDecreto ? " — insuficiente" : ""}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { pregarDecreto({ tipo: fTipo, alvo: fAlvo, recompensa: valorDecreto }); setFormAberto(false); setFAlvo(""); }}
                disabled={!fAlvo.trim() || totalOuro < valorDecreto}
                className="flex-1 tv-mono text-[10px] px-3 py-2 rounded"
                style={{ background: T.violet, color: T.onAccent, opacity: (!fAlvo.trim() || totalOuro < valorDecreto) ? 0.4 : 1 }}>
                📣 pregar (retém ◉ {valorDecreto})
              </button>
              <button onClick={() => setFormAberto(false)} className="tv-mono text-[10px] px-3 py-2 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Painel de DIPLOMACIA: as potências conhecidas (guildas, reinos, cultos…),
   relação, tratado e ações de política. As propostas vão para a ficção —
   o Mestre decide a resposta delas; o app só registra os tratados firmados. */
function PainelDiplomacia({ mapa, faccaoJogador, onDiplomacia, onPresente, cofre }) {
  const fs = (mapa?.faccoes || []).filter((f) => f.nome !== faccaoJogador);
  if (!fs.length) {
    return <div className="tv-body text-sm italic text-center py-10" style={{ color: T.inkDim }}>Nenhuma potência conhecida ainda. Guildas, reinos e cultos que você encontrar na história aparecem aqui — e você poderá propor alianças, comércio, vassalagem… ou declarar guerra.</div>;
  }
  const ACOES = [
    { id: "comercio", rotulo: "◉ propor comércio", dica: "+5% de renda por parceiro" },
    { id: "alianca", rotulo: "🤝 propor aliança", dica: "+5% e apoio mútuo" },
    { id: "vassalagem", rotulo: "♜ exigir vassalagem", dica: "tributo de 10/dia" },
    { id: "guerra", rotulo: "⚔ declarar guerra", dica: "sem volta fácil", perigo: true },
  ];
  return (
    <div className="space-y-2.5">
      {fs.map((f) => {
        const rel = RELACOES[f.relacao] || RELACOES.neutra;
        const tr = TRATADOS[f.tratado] || TRATADOS.nenhum;
        return (
          <div key={f.nome} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="tv-display text-lg leading-tight" style={{ color: T.ink }}>{f.nome}</span>
              <div className="flex gap-1.5 shrink-0">
                <span className="tv-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ border: `1px solid ${rel.cor}`, color: rel.cor }}>{rel.rotulo}</span>
                {f.tratado && f.tratado !== "nenhum" && <span className="tv-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ border: `1px solid ${tr.cor}`, color: tr.cor }}>{tr.rotulo}</span>}
              </div>
            </div>
            <div className="tv-body text-xs italic" style={{ color: T.inkDim }}>{[f.tipo, f.lider ? `líder: ${f.lider}` : "", f.poder ? `poder ${f.poder}` : ""].filter(Boolean).join(" · ")}</div>
            {f.notas && <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{f.notas}</div>}
            {onDiplomacia && (
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {ACOES.map((a) => (
                  <button key={a.id} onClick={() => onDiplomacia(f.nome, a.id)} title={a.dica}
                    className="tv-mono text-[10px] px-1.5 py-1.5 rounded"
                    style={{ border: `1px solid ${a.perigo ? T.danger : T.line}`, color: a.perigo ? T.danger : T.ink }}>
                    {a.rotulo}
                  </button>
                ))}
                {onPresente && (
                  <button onClick={() => onPresente(f.nome)} disabled={!faccaoJogador || (cofre || 0) < 40}
                    title={faccaoJogador ? `◉ 40 do cofre — o líder reage na ficção (pode aquecer laços… ou se ofender)` : "Presentear exige uma guilda (o cofre e os mensageiros são dela)"}
                    className="tv-mono text-[10px] px-1.5 py-1.5 rounded col-span-2"
                    style={{ border: `1px solid ${T.amber}`, color: T.amberSoft, opacity: (!faccaoJogador || (cofre || 0) < 40) ? 0.4 : 1 }}>
                    🎁 presentear · ◉ 40 do cofre
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      <div className="tv-body text-xs" style={{ color: T.inkDim }}>Propostas são decididas na história pelo Mestre (o líder pode aceitar, exigir algo, ou recusar). Tratados firmados têm efeito real e automático na sua renda.</div>
    </div>
  );
}

/* ---------------- CORREIO DOS REINOS (v7.0) ----------------
   O jogador escreve para facções; respostas e petições chegam por tabela,
   com prazo. Todo ato oficial entre facções passa por aqui. */
function PainelCorreio({ correio, faccoes, dia, moedas, enviarCarta, responderPeticao }) {
  const [para, setPara] = React.useState("");
  const [tipo, setTipo] = React.useState("cortesia");
  const [oferta, setOferta] = React.useState("");
  const [mensagem, setMensagem] = React.useState("");
  const c = correio || { enviadas: [], recebidas: [], historico: [], tratados: [] };
  const pendentes = c.recebidas.filter((p) => p.status === "pendente");
  const t = TIPOS_CARTA[tipo];
  if (!faccoes.length && !pendentes.length && !c.tratados.length) {
    return <div className="tv-body text-sm italic text-center py-10" style={{ color: T.inkDim }}>Nenhuma facção conhecida para escrever cartas. Quando o mundo crescer (reinos, guildas, cultos), o correio passa a correr por aqui.</div>;
  }
  const STATUS_ROTULO = { a_caminho: "a caminho", aceita: "aceita", recusada: "recusada", guerra: "guerra!", expirada: "expirada" };
  return (
    <div className="space-y-3">
      {/* petições recebidas — exigem decisão */}
      {pendentes.map((p) => (
        <div key={p.id} className="rounded-xl p-3 tv-fade" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
          <div className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: T.amber }}>✉️ petição recebida · dia {p.recebidaEm} · prazo: dia {p.prazo}{dia >= p.prazo ? " (último dia!)" : ""}</div>
          <div className="tv-body text-sm mt-1" style={{ color: T.ink }}>{p.icone} {p.texto}</div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <button onClick={() => responderPeticao(p.id, true)} className="tv-mono text-[10px] px-1.5 py-1.5 rounded font-bold" style={{ background: T.amber, color: T.onAccent }}>aceitar</button>
            <button onClick={() => responderPeticao(p.id, false)} className="tv-mono text-[10px] px-1.5 py-1.5 rounded" style={{ border: `1px solid ${T.danger}`, color: T.danger }}>recusar</button>
          </div>
        </div>
      ))}

      {/* tratados firmados pelo correio */}
      {c.tratados.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
          <div className="tv-mono text-[9px] uppercase tracking-wider mb-1.5" style={{ color: T.inkDim }}>tratados em vigor</div>
          <div className="flex flex-wrap gap-1.5">
            {c.tratados.map((x, i) => (
              <span key={i} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${x.tratado === "guerra" ? T.danger : T.amber}`, color: x.tratado === "guerra" ? T.danger : T.amberSoft }}>
                {x.rotulo} · {x.faccao}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* escrever carta */}
      {faccoes.length > 0 && (
        <div className="rounded-xl p-3 space-y-2" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
          <div className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: T.inkDim }}>escrever carta · ◉ {CUSTO_CARTA} (mensageiro)</div>
          <div className="grid grid-cols-2 gap-1.5">
            <select value={para} onChange={(e) => setPara(e.target.value)} className="tv-mono text-xs rounded px-2 py-1.5" style={{ background: T.panel, color: T.ink, border: `1px solid ${T.line}` }}>
              <option value="">para quem?</option>
              {faccoes.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="tv-mono text-xs rounded px-2 py-1.5" style={{ background: T.panel, color: T.ink, border: `1px solid ${T.line}` }}>
              {Object.entries(TIPOS_CARTA).map(([id, x]) => <option key={id} value={id}>{x.icone} {x.nome}</option>)}
            </select>
          </div>
          <div className="tv-body text-xs italic" style={{ color: T.inkDim }}>{t.desc}</div>
          <input value={oferta} onChange={(e) => setOferta(e.target.value.replace(/[^0-9]/g, ""))} placeholder="oferta em moedas (opcional)"
            className="w-full tv-mono text-xs rounded px-2 py-1.5" style={{ background: T.panel, color: T.ink, border: `1px solid ${T.line}` }} />
          <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={2} placeholder="o que diz a carta… (opcional, o Mestre entrega suas palavras)"
            className="w-full tv-body text-xs rounded px-2 py-1.5" style={{ background: T.panel, color: T.ink, border: `1px solid ${T.line}`, resize: "vertical" }} />
          <button onClick={() => { enviarCarta(para, tipo, Number(oferta) || 0, mensagem); setMensagem(""); setOferta(""); }}
            disabled={!para || moedas < CUSTO_CARTA}
            className="w-full tv-mono text-xs py-2 rounded font-bold"
            style={{ background: T.amber, color: T.onAccent, opacity: (!para || moedas < CUSTO_CARTA) ? 0.4 : 1 }}>
            {t.icone} enviar por mensageiro · ◉ {CUSTO_CARTA}
          </button>
        </div>
      )}

      {/* enviadas aguardando resposta */}
      {c.enviadas.length > 0 && (
        <div className="space-y-1.5">
          {c.enviadas.map((x) => (
            <div key={x.id} className="rounded-xl p-2.5 flex items-center justify-between gap-2" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
              <div className="tv-body text-xs" style={{ color: T.ink }}>{TIPOS_CARTA[x.tipo]?.icone} {TIPOS_CARTA[x.tipo]?.nome} → <b>{x.para}</b>{x.oferta ? ` · ◉ ${x.oferta}` : ""}</div>
              <div className="tv-mono text-[9px] shrink-0" style={{ color: T.inkDim }}>resposta até dia {x.chegaEm}</div>
            </div>
          ))}
        </div>
      )}

      {/* histórico */}
      {c.historico.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
          <div className="tv-mono text-[9px] uppercase tracking-wider mb-1.5" style={{ color: T.inkDim }}>histórico do correio</div>
          {c.historico.slice(0, 8).map((h, i) => (
            <div key={i} className="tv-body text-xs py-0.5" style={{ color: T.inkDim }}>
              {h.de === "jogador"
                ? `${TIPOS_CARTA[h.tipo]?.icone || "✉️"} ${TIPOS_CARTA[h.tipo]?.nome || h.tipo} → ${h.para} — ${STATUS_ROTULO[h.status] || h.status} (dia ${h.respondidaEm || h.enviadaEm})`
                : `${h.icone || "✉️"} ${h.de} — ${STATUS_ROTULO[h.status] || h.status} (dia ${h.respondidaEm || h.recebidaEm})`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- CÓDEX: conquistas/títulos, bestiário e registros ----------------
   Tudo lido dos contadores do app — zero tokens, a IA nem sabe que existe. */
const ROTULO_AMEACA = { fraco: "fraca", comum: "comum", competente: "competente", elite: "elite", lendario: "lendária" };
const CATEGORIAS_CONQUISTA = [
  { id: "lamina", rotulo: "Lâmina", ids: ["primeiro_sangue", "dez_abatidos", "cinquenta_abatidos", "cem_abatidos", "matador_elite", "cinco_elites", "matador_lendario", "tres_lendarios", "primeiro_critico", "dez_criticos", "primeiro_desastre", "cinco_vitorias", "quinze_vitorias", "fio_da_morte", "primeira_cicatriz", "cinco_cicatrizes"] },
  { id: "estrada", rotulo: "Estrada", ids: ["primeira_viagem", "dez_viagens", "vintecinco_viagens", "dez_perigos", "dez_criaturas", "vinte_criaturas", "primeira_masmorra", "cinco_masmorras", "primeiro_contrato", "dez_contratos", "trinta_dias", "ano_inteiro"] },
  { id: "coracao", rotulo: "Coração", ids: ["primeiro_companheiro", "tres_companheiros", "cinco_pessoas", "quinze_pessoas", "trinta_pessoas", "primeiro_presente", "cinco_presentes", "vinculo_amizade", "vinculos_tres", "vinculo_profundo"] },
  { id: "ouro", rotulo: "Ouro", ids: ["cem_moedas", "quinhentas_moedas", "mil_moedas", "cofre_gordo", "primeiro_forjado", "dez_desmontados", "item_lendario"] },
  { id: "coroa", rotulo: "Coroa", ids: ["fundador", "primeira_cidade", "tres_dominios", "cinco_dominios", "guilda_nv3", "guilda_nv5", "primeira_alianca", "tres_tratados", "primeiro_vassalo", "primeira_guerra", "primeiro_decreto", "cinco_decretos", "dez_eventos_reino"] },
  { id: "lenda", rotulo: "Lenda", ids: ["nv5", "nv10", "nv15", "nv20", "nome_conhecido", "lenda_viva", "nemesis_surgida", "nemesis_vencida", "primeiro_cronica"] },
];

function PainelCodex({ conquistas, tituloAtivo, escolherTitulo, descobertas, contadores, mundo, npcs, mapa, personagem, nomeCampanha, guilda, reino, dia, nemesis, faccaoJogador, onExportarCronica }) {
  const [subCodex, setSubCodex] = React.useState("conquistas");
  const desb = (conquistas && conquistas.desbloqueadas) || {};
  const nDesb = CONQUISTAS.filter((c) => desb[c.id]).length;
  const criaturas = criaturasDoGenero((mundo || {}).genero || "Fantasia medieval");
  const descNomes = (descobertas || []).map((d) => d.toLowerCase());
  const achadas = criaturas.filter((c) => descNomes.some((d) => d.includes(c.nome.toLowerCase())));
  const descExtra = (descobertas || []).filter((d) => !criaturas.some((c) => d.toLowerCase().includes(c.nome.toLowerCase())));
  const cont = contadores || {};
  const REGISTROS = [
    ["☠ Abates", cont.inimigosDerrotados || 0], ["🐗 Elites", cont.elitesDerrotados || 0], ["🐉 Lendárias", cont.lendariosDerrotados || 0],
    ["🛡 Vitórias", cont.combatesVencidos || 0], ["🎯 Críticos", cont.criticos || 0], ["💥 Desastres", cont.desastres || 0],
    ["💀 Fio da morte", cont.quaseMorte || 0], ["🧭 Viagens", cont.viagens || 0], ["🌲 Perigos na estrada", cont.perigosEstrada || 0],
    ["⛺ Descansos", cont.descansos || 0], ["🎁 Presentes", cont.presentes || 0], ["⚑ Recrutados", cont.recrutados || 0],
  ];
  const SUBS = [{ id: "conquistas", rotulo: `Títulos ${nDesb}/${CONQUISTAS.length}` }, { id: "bestiario", rotulo: `Bestiário ${achadas.length}/${criaturas.length}` }, { id: "registros", rotulo: "Registros" }, { id: "cronica", rotulo: "📜 Crônica" }];
  return (
    <>
      <div className="flex flex-wrap gap-1.5 -mt-2">
        {SUBS.map((s) => (
          <button key={s.id} onClick={() => setSubCodex(s.id)}
            className="tv-mono text-[10px] px-2.5 py-1.5 rounded-full"
            style={{ background: subCodex === s.id ? T.amber : T.panelSoft, color: subCodex === s.id ? T.onAccent : T.inkDim, border: `1px solid ${subCodex === s.id ? T.amber : T.line}`, fontWeight: 600 }}>
            {s.rotulo}
          </button>
        ))}
      </div>

      {subCodex === "conquistas" && (
        <>
          <div className="rounded-xl px-4 py-3" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
            <div className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>Título equipado</div>
            <div className="tv-display text-xl leading-tight" style={{ color: T.amberSoft }}>{tituloAtivo ? `❝ ${tituloAtivo} ❞` : "nenhum — toque num título desbloqueado"}</div>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.panelSoft }}>
            <div className="h-full rounded-full" style={{ width: `${Math.round((nDesb / CONQUISTAS.length) * 100)}%`, background: T.amber }} />
          </div>
          {CATEGORIAS_CONQUISTA.map((cat) => (
            <div key={cat.id}>
              <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.violetSoft }}>{cat.rotulo}</div>
              <div className="space-y-1.5">
                {cat.ids.map((id) => {
                  const c = conquistaPorId(id);
                  if (!c) return null;
                  const aberta = !!desb[c.id];
                  const equipado = aberta && tituloAtivo === c.titulo;
                  return (
                    <button key={c.id} disabled={!aberta} onClick={() => escolherTitulo(c.id)}
                      className="w-full text-left rounded-lg px-3 py-2 flex items-center gap-2.5"
                      style={{ background: equipado ? T.panelSoft : "transparent", border: `1px solid ${equipado ? T.amber : aberta ? T.line : T.panelSoft}`, opacity: aberta ? 1 : 0.55 }}>
                      <span style={{ fontSize: 18, filter: aberta ? "none" : "grayscale(1)" }}>{aberta || !c.segredo ? c.icone : "❔"}</span>
                      <span className="flex-1 min-w-0">
                        <span className="tv-body text-sm block truncate" style={{ color: aberta ? T.ink : T.inkDim }}>
                          {aberta || !c.segredo ? c.nome : "???"}
                          {aberta && <span className="tv-mono text-[10px]" style={{ color: T.amberSoft }}> · “{c.titulo}”</span>}
                        </span>
                        <span className="tv-body text-[11px] italic block truncate" style={{ color: T.inkDim }}>
                          {aberta ? (equipado ? "equipado — toque para desequipar" : "toque para equipar o título") : c.segredo ? "conquista secreta" : c.dica}
                        </span>
                      </span>
                      {aberta && <span className="tv-mono text-xs" style={{ color: equipado ? T.amber : T.ok }}>{equipado ? "★" : "✓"}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {subCodex === "bestiario" && (
        <>
          <div className="tv-body text-xs" style={{ color: T.inkDim }}>
            Criaturas que você já enfrentou em combate. As desconhecidas aguardam na estrada…
          </div>
          <div className="space-y-1.5">
            {criaturas.map((c) => {
              const vista = descNomes.some((d) => d.includes(c.nome.toLowerCase()));
              return (
                <div key={c.nome} className="rounded-lg px-3 py-2 flex items-center gap-2.5" style={{ background: vista ? T.panelSoft : "transparent", border: `1px solid ${vista ? T.line : T.panelSoft}`, opacity: vista ? 1 : 0.5 }}>
                  <span style={{ fontSize: 18 }}>{vista ? ({ fraco: "🐀", comum: "🐺", competente: "🐗", elite: "🦖", lendario: "🐉" })[c.ameaca] || "👹" : "❔"}</span>
                  <span className="flex-1 min-w-0">
                    <span className="tv-body text-sm block" style={{ color: vista ? T.ink : T.inkDim }}>{vista ? c.nome : "???"}</span>
                    {vista && <span className="tv-body text-[11px] italic block truncate" style={{ color: T.inkDim }}>{c.desc}</span>}
                  </span>
                  {vista && <span className="tv-mono text-[9px] uppercase" style={{ color: c.ameaca === "lendario" ? T.amber : c.ameaca === "elite" ? T.violetSoft : T.inkDim }}>{ROTULO_AMEACA[c.ameaca] || c.ameaca}</span>}
                </div>
              );
            })}
            {descExtra.map((d) => (
              <div key={d} className="rounded-lg px-3 py-2 flex items-center gap-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                <span style={{ fontSize: 18 }}>👹</span>
                <span className="flex-1 min-w-0">
                  <span className="tv-body text-sm block" style={{ color: T.ink }}>{d}</span>
                  <span className="tv-body text-[11px] italic block" style={{ color: T.inkDim }}>criatura única desta história</span>
                </span>
                <span className="tv-mono text-[9px] uppercase" style={{ color: T.amberSoft }}>única</span>
              </div>
            ))}
          </div>
        </>
      )}

      {subCodex === "registros" && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {REGISTROS.map(([rotulo, valor]) => (
              <div key={rotulo} className="rounded-xl px-2.5 py-2.5 text-center" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                <div className="tv-mono text-lg font-semibold" style={{ color: T.amberSoft }}>{valor}</div>
                <div className="tv-mono text-[8px] uppercase tracking-wider" style={{ color: T.inkDim }}>{rotulo}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Mundo</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["👥 Pessoas conhecidas", Object.keys(npcs || {}).length],
                ["🚩 Potências", ((mapa || {}).faccoes || []).length],
                ["🏰 Cidades no mapa", ((mapa || {}).cidades || []).length],
                ["⚑ Companheiros", ((personagem || {}).grupo || []).length],
              ].map(([rotulo, valor]) => (
                <div key={rotulo} className="rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                  <span className="tv-body text-xs" style={{ color: T.inkDim }}>{rotulo}</span>
                  <span className="tv-mono text-lg font-semibold" style={{ color: T.amberSoft }}>{valor}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {subCodex === "cronica" && (() => {
        /* CRÔNICA (v6.9): a saga formatada a partir dos registros — zero tokens. */
        const md = gerarCronica({
          nomeCampanha: nomeCampanha || "Campanha", mundo, personagem,
          conquistasIds: Object.keys(desb), contadores: cont, npcs, mapa,
          faccaoJogador, guilda, reino, dia: dia || 1, nemesis, tituloAtivo, descobertas,
        });
        return (
          <>
            <div className="tv-body text-xs italic" style={{ color: T.inkDim }}>
              A sua saga inteira — herói, feitos, cicatrizes, companheiros, domínios, pessoas e números — formatada a partir dos registros do app. Nada é inventado: é a memória de verdade.
            </div>
            <button onClick={() => onExportarCronica && onExportarCronica(md)}
              className="w-full tv-mono text-xs px-3 py-2.5 rounded-lg font-semibold"
              style={{ background: T.amber, color: T.onAccent, border: `1px solid ${T.amber}` }}>
              📜 baixar crônica (.md)
            </button>
            <div className="rounded-xl p-3 max-h-72 overflow-y-auto" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
              <pre className="tv-body text-[11px] whitespace-pre-wrap" style={{ color: T.ink }}>{md}</pre>
            </div>
          </>
        );
      })()}
    </>
  );
}

function PainelLateral({ aba, fechar, personagem, mundo, equipar, desequipar, descartarItem, descartarEquip, trocarCaminho, acampado, removerDoGrupo, mapa, faccaoJogador, cidadeAtual, transferirItem, historia, quests, trocarArco, npcs, guilda, depositarCofre, sacarCofre, melhorarGuilda, convidarNpc, onDiplomacia, onPresente, recalibrarLenda, recalibrarMundo, conquistas, tituloAtivo, escolherTitulo, descobertas, contadores, equiparComp, desequiparComp, desmontarEquip, forjar, mural, aceitarContrato, abandonarContrato, garantirMural, decretos, pregarDecreto, cancelarDecreto, definirRelacao, reino, famaInfo, nemesis, nomeCampanha, dia, onExportarCronica, eventos, correio, enviarCarta, responderPeticao, divindade, onDespertar, onRecalibrarAsc, recalAscState }) {
  const [invDe, setInvDe] = React.useState("eu");
  const [forjaAberta, setForjaAberta] = React.useState(false); // forja sob demanda — bolsa limpa
  const [forjaSlot, setForjaSlot] = React.useState("arma");
  const [abrirCaminho, setAbrirCaminho] = React.useState(null); // "eu" | nome do companheiro
  const [confirmarRemover, setConfirmarRemover] = React.useState(null);
  const [subGestao, setSubGestao] = React.useState("ficha");    // sub-aba dentro de Gestão
  const [verHabsFicha, setVerHabsFicha] = React.useState(false); // habilidades da ficha sob demanda
  mundo = mundo || { genero: "Fantasia medieval" };
  if (!aba) return null;
  const xpProx = XP_POR_NIVEL(personagem.nivel);
  const equipados = personagem.equipados || {};
  const equipDisponivel = (personagem.equipamento || []).filter((e) => !Object.values(equipados).some((x) => x?.nome === e.nome));
  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,.45)" }} onClick={fechar} />
      <aside className="tv-slide tv-scroll fixed right-0 inset-y-0 z-40 w-80 max-w-[88vw] overflow-y-auto p-5 flex flex-col gap-5" style={{ background: T.panel, borderLeft: `1px solid ${T.line}` }}>
        <div className="flex items-center justify-between">
          <h2 className="tv-display text-2xl" style={{ color: T.ink }}>{aba === "gestao" ? "Gestão" : aba === "diario" ? "Diário" : aba === "mapa" ? "Mapa" : aba === "codex" ? "Códex" : aba === "ascensao" ? "Ascensão" : "Inventário"}</h2>
          <button onClick={fechar} className="tv-mono text-lg px-2" style={{ color: T.inkDim }}>✕</button>
        </div>

        {aba === "gestao" && (
          <div className="flex flex-wrap gap-1.5 -mt-2">
            {SUBS_GESTAO.map((s) => (
              <button key={s.id} onClick={() => setSubGestao(s.id)}
                className="tv-mono text-[10px] px-2.5 py-1.5 rounded-full"
                style={{ background: subGestao === s.id ? T.amber : T.panelSoft, color: subGestao === s.id ? T.onAccent : T.inkDim, border: `1px solid ${subGestao === s.id ? T.amber : T.line}`, fontWeight: 600 }}>
                {s.rotulo}
              </button>
            ))}
          </div>
        )}

        {aba === "gestao" && subGestao === "ficha" && (
          <>
            <div className="flex items-center gap-3">
              <Retrato semente={sementeDe(personagem)} tamanho={64} anel={T.amber} estado={estadoDe(personagem.vida, personagem.vidaMax)} />
              <div className="min-w-0">
                <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.violetSoft }}>{(mundo || {}).genero} · Nível {personagem.nivel} · <span style={{ color: T.amberSoft }}>{patamarDe(personagem.nivel).nome}</span>{divindade && divindade.despertar && <span style={{ color: T.violetSoft }}> · 🌟 GD {grauDe(divindade)} · {tituloDe(grauDe(divindade))}</span>}</div>
                <div className="tv-display text-3xl leading-tight" style={{ color: T.ink }}>{personagem.nome}</div>
                <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>{personagem.conceito}</div>
                {tituloAtivo ? <div className="tv-mono text-[11px] mt-0.5" style={{ color: T.amber }}>★ ❝ {tituloAtivo} ❞</div> : null}
                {famaInfo && (
                  <div className="mt-1.5 flex items-center gap-1.5" title={`Fama ${famaInfo.f}/100 — ${famaInfo.pf.nota}`}>
                    <span className="tv-mono text-[9px] uppercase tracking-wider shrink-0" style={{ color: T.amberSoft }}>📣 {famaInfo.pf.rotulo}</span>
                    <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: T.panel }}>
                      <div className="h-full rounded-full" style={{ width: `${famaInfo.f}%`, background: T.amber }} />
                    </div>
                    <span className="tv-mono text-[9px]" style={{ color: T.inkDim }}>{famaInfo.f}</span>
                  </div>
                )}
                {nemesis && nemesis.status !== "derrotada" && (
                  <div className="tv-mono text-[10px] mt-1" style={{ color: T.danger }} title={`${nemesis.nome}, ${nemesis.titulo} — ${nemesis.motivo}. Ódio: ${nemesis.odio}/100`}>
                    🎭 nêmesis: {nemesis.nome} · ódio {nemesis.odio}
                  </div>
                )}
                {(personagem.classe || personagem.raca) && (
                  <div className="tv-mono text-[10px] uppercase tracking-widest mt-1" style={{ color: T.amberSoft }}>
                    {[personagem.raca, personagem.classe, personagem.subclasse].filter(Boolean).join(" · ")}
                    {personagem.profissao ? <span style={{ color: T.inkDim }}> · {personagem.profissao}</span> : null}
                  </div>
                )}
                {personagem.antecedente && (
                  <div className="tv-mono text-[10px] uppercase tracking-widest mt-0.5" style={{ color: T.inkDim }} title={personagem.antecedenteGancho || ""}>
                    🎭 {personagem.antecedente}
                  </div>
                )}
                {(personagem.cicatrizes || []).length > 0 && (
                  <div className="mt-2 rounded-xl p-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                    <div className="tv-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: T.inkDim }}>🩸 Cicatrizes ({personagem.cicatrizes.length})</div>
                    <div className="flex flex-wrap gap-1">
                      {personagem.cicatrizes.map((c, i) => (
                        <span key={i} title={`${c.descricao}${c.dia ? ` — desde o dia ${c.dia}` : ""}${c.vidaMax ? ` · −${-c.vidaMax} PV máx.` : ""}`}
                          className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${T.danger}`, color: T.inkDim }}>
                          {c.nome}{c.vidaMax ? ` −${-c.vidaMax}` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={() => setAbrirCaminho(abrirCaminho === "eu" ? null : "eu")} className="tv-mono text-[10px] mt-1.5 px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.violetSoft }}>
                  {personagem.classe ? "⚔ trilhar novo caminho" : "⚔ escolher caminho"}
                </button>
              </div>
            </div>
            <div className="space-y-2.5">
              <BarraMini rotulo="PV" atual={personagem.vida} max={personagem.vidaMax} cor={T.amber} corBaixa={T.danger} />
              <BarraMini rotulo="PM" atual={personagem.mana} max={personagem.manaMax} cor={T.violet} />
              <BarraMini rotulo="XP" atual={personagem.xp} max={xpProx} cor={T.ok} />
            </div>
            {abrirCaminho === "eu" && <SeletorCaminho mundo={mundo} alvo="eu" atual={personagem} acampado={acampado} trocarCaminho={trocarCaminho} fechar={() => setAbrirCaminho(null)} />}
            {recalibrarLenda && (
              <button onClick={recalibrarLenda} className="w-full tv-mono text-[10px] px-2 py-1.5 rounded-lg"
                style={{ border: `1px dashed ${T.line}`, color: T.inkDim }}
                title="Se sua lenda cresceu mais que seus números (save antigo), o Mestre relê a campanha e propõe nível e atributos coerentes — você confirma antes de aplicar.">
                ⚖ recalibrar lenda (save antigo)
              </button>
            )}
            {recalibrarMundo && (
              <button onClick={recalibrarMundo} className="w-full tv-mono text-[10px] px-2 py-1.5 rounded-lg"
                style={{ border: `1px dashed ${T.line}`, color: T.inkDim }}
                title="O arquivista relê a campanha e propõe o estado dos sistemas que o save antigo não conhecia: companheiros (nível/classe), pessoas, potências e tratados, cidades dominadas e nível da guilda. Você confirma antes de aplicar.">
                ⚖ recalibrar mundo · guilda, pessoas, domínios
              </button>
            )}
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
                  const base = (personagem.atributos || {})[a.id] || 0;
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
              <div className="flex items-center justify-between mb-2">
                <div className="tv-mono text-xs uppercase tracking-widest" style={{ color: T.inkDim }}>Habilidades</div>
                {(personagem.habilidades || []).length > 0 && (
                  <button onClick={() => setVerHabsFicha((v) => !v)} className="tv-mono text-[9px] px-2 py-1 rounded" style={{ border: `1px dashed ${T.line}`, color: T.violetSoft }}>
                    {verHabsFicha ? "▾ ocultar" : `▸ ver habilidades (${(personagem.habilidades || []).length})`}
                  </button>
                )}
              </div>
              {(personagem.habilidades || []).length === 0 ? <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Nenhuma ainda.</div> : !verHabsFicha ? null : (
                <ul className="space-y-2">
                  {(personagem.habilidades || []).filter((h) => h).map((h, i) => {
                    const hn = typeof h === "string" ? { nome: h, custo: 0, descricao: "" } : h;
                    return (
                    <li key={i} className="rounded-lg px-3 py-2" style={{ background: T.panelSoft }}>
                      <div className="flex items-baseline justify-between gap-2"><span className="tv-body text-sm" style={{ color: T.ink }}>{hn.nome}</span><span className="tv-mono text-[10px]" style={{ color: T.violetSoft }}>{hn.custo || 0} PM</span></div>
                      {hn.descricao && <div className="tv-body text-xs mt-0.5" style={{ color: T.inkDim }}>{hn.descricao}</div>}
                    </li>
                  ); })}
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

        {aba === "diario" && <PainelDiario historia={historia} quests={quests} trocarArco={trocarArco} eventos={eventos} diaAtual={dia} />}
        {aba === "ascensao" && <PainelAscensao divindade={divindade} nivel={personagem.nivel || 1} onDespertar={onDespertar} onRecalibrar={onRecalibrarAsc} recalibrando={recalAscState === "pedindo"} />}
        {aba === "mapa" && <PainelMapa mapa={mapa} faccaoJogador={faccaoJogador} cidadeAtual={cidadeAtual} />}
        {aba === "codex" && <PainelCodex conquistas={conquistas} tituloAtivo={tituloAtivo} escolherTitulo={escolherTitulo} descobertas={descobertas} contadores={contadores} mundo={mundo} npcs={npcs} mapa={mapa} personagem={personagem} nomeCampanha={nomeCampanha} guilda={guilda} reino={reino} dia={dia} nemesis={nemesis} faccaoJogador={faccaoJogador} onExportarCronica={onExportarCronica} />}
        {aba === "gestao" && subGestao === "mural" && <PainelMural mural={mural} quests={quests} aceitarContrato={aceitarContrato} abandonarContrato={abandonarContrato} garantirMural={garantirMural} acampado={acampado} decretos={decretos} pregarDecreto={pregarDecreto} cancelarDecreto={cancelarDecreto} moedas={personagem.moedas} cofre={guilda && guilda.cofre} nivel={personagem.nivel} />}
        {aba === "gestao" && subGestao === "pessoas" && <PainelPessoas npcs={npcs} grupo={personagem.grupo || []} onConvidar={convidarNpc} grupoCheio={(personagem.grupo || []).length >= MAX_COMPANHEIROS} onDefinirRelacao={definirRelacao} />}

        {aba === "gestao" && subGestao === "diplomacia" && <PainelDiplomacia mapa={mapa} faccaoJogador={faccaoJogador} onDiplomacia={onDiplomacia} onPresente={onPresente} cofre={guilda && guilda.cofre} />}
        {aba === "gestao" && subGestao === "correio" && <PainelCorreio correio={correio} faccoes={((mapa && mapa.faccoes) || []).filter((f) => f && f.nome && !f.doJogador && f.relacao !== "jogador").map((f) => f.nome)} dia={dia} moedas={personagem.moedas || 0} enviarCarta={enviarCarta} responderPeticao={responderPeticao} />}

        {aba === "gestao" && subGestao === "guilda" && (() => {
          const temGuilda = !!faccaoJogador;
          const g = guilda || { nivel: 1, cofre: 0 };
          const custo = custoUpgradeGuilda(g.nivel);
          const rendaDia = rendaDiariaTotal(mapa, g.nivel, temGuilda);
          if (!temGuilda) {
            return <div className="tv-body text-sm italic text-center py-10" style={{ color: T.inkDim }}>Você ainda não lidera uma guilda. Funde uma na história — fale com o Mestre, reúna aliados e declare a fundação. Quando ela existir, a gestão aparece aqui.</div>;
          }
          return (
            <>
              <div className="rounded-xl p-4" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
                <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.amberSoft }}>Sua guilda</div>
                <div className="tv-display text-2xl leading-tight" style={{ color: T.ink }}>{faccaoJogador}</div>
                <div className="flex items-center gap-1 mt-1.5">
                  {Array.from({ length: NIVEL_GUILD_MAX }).map((_, i) => (
                    <span key={i} className="inline-block w-3.5 h-3.5 rounded-sm" style={{ background: i < g.nivel ? T.amber : T.panel, border: `1px solid ${T.amber}` }} />
                  ))}
                  <span className="tv-mono text-[10px] ml-1.5" style={{ color: T.inkDim }}>nível {g.nivel}{g.nivel >= NIVEL_GUILD_MAX ? " · máximo" : ""}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl px-3 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                  <div className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>Cofre</div>
                  <div className="tv-mono text-xl font-semibold" style={{ color: T.amberSoft }}>◉ {g.cofre}</div>
                </div>
                <div className="rounded-xl px-3 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                  <div className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>Renda/dia</div>
                  <div className="tv-mono text-xl font-semibold" style={{ color: T.ok }}>+{rendaDia}</div>
                </div>
              </div>
              <div className="tv-body text-xs" style={{ color: T.inkDim }}>
                A renda cai no cofre a cada dia que passa na história (descanso longo ou passar o tempo). Suas moedas pessoais: ◉ {personagem.moedas}.
              </div>
              <div className="flex gap-2">
                <button onClick={() => depositarCofre(25)} disabled={personagem.moedas < 25} className="flex-1 tv-mono text-[11px] px-2 py-2 rounded-lg" style={{ border: `1px solid ${T.amber}`, color: T.amberSoft, opacity: personagem.moedas < 25 ? 0.4 : 1 }}>↓ depositar 25</button>
                <button onClick={() => sacarCofre(25)} disabled={g.cofre < 1} className="flex-1 tv-mono text-[11px] px-2 py-2 rounded-lg" style={{ border: `1px solid ${T.line}`, color: T.ink, opacity: g.cofre < 1 ? 0.4 : 1 }}>↑ sacar {Math.min(25, g.cofre)}</button>
              </div>
              {custo != null ? (
                <button onClick={melhorarGuilda} disabled={g.cofre < custo} className="w-full tv-mono text-xs px-3 py-2.5 rounded-lg" style={{ background: g.cofre >= custo ? T.amber : T.panelSoft, color: g.cofre >= custo ? T.onAccent : T.inkDim, border: `1px solid ${T.amber}`, fontWeight: 600, opacity: g.cofre >= custo ? 1 : 0.5 }}>
                  ⚒ melhorar guilda para o nível {g.nivel + 1} · ◉ {custo} do cofre
                </button>
              ) : (
                <div className="tv-body text-xs italic text-center" style={{ color: T.amberSoft }}>Sua guilda é lendária — nível máximo alcançado.</div>
              )}
              <div className="tv-body text-xs" style={{ color: T.inkDim }}>
                Cada nível rende contratos maiores e melhora a administração dos domínios (+25% de renda por nível — nível {NIVEL_GUILD_MAX} dobra tudo).
              </div>
            </>
          );
        })()}

        {aba === "gestao" && subGestao === "dominios" && (() => {
          const { porCidade, total } = rendaDominios(mapa);
          const g = guilda || { nivel: 1 };
          const temGuilda = !!faccaoJogador;
          if (!porCidade.length) {
            return <div className="tv-body text-sm italic text-center py-10" style={{ color: T.inkDim }}>Nenhum domínio ainda. Conquiste ou funde cidades na história — cada uma que passar para a sua bandeira aparece aqui, produzindo renda todos os dias.</div>;
          }
          return (
            <>
              <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
                <span className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.inkDim }}>Renda total/dia</span>
                <span className="tv-mono text-xl font-semibold" style={{ color: T.ok }}>+{Math.round(total * (temGuilda ? multGuilda(g.nivel) : 1))}</span>
              </div>
              <div className="space-y-2">
                {porCidade.map((c) => {
                  const v = (reino || {})[c.nome];
                  const fel = v ? v.felicidade : null;
                  const corFel = fel == null ? T.inkDim : fel >= 70 ? T.ok : fel >= 40 ? T.amberSoft : T.danger;
                  return (
                    <div key={c.nome} className="rounded-xl px-3 py-2.5 flex items-center justify-between gap-2" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                      <div className="min-w-0 flex-1">
                        <div className="tv-body text-sm truncate" style={{ color: T.ink }}>{c.nome} {c.sede && <span className="tv-mono text-[9px]" style={{ color: T.amberSoft }}>· SEDE</span>}</div>
                        <div className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: T.inkDim }}>{c.tipo}{v ? ` · ${v.populacao.toLocaleString("pt-BR")} almas` : ""}</div>
                        {fel != null && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: T.panel }}>
                              <div className="h-full rounded-full" style={{ width: `${fel}%`, background: corFel }} />
                            </div>
                            <span className="tv-mono text-[9px] shrink-0" style={{ color: corFel }}>{fel >= 70 ? "😊" : fel >= 40 ? "😐" : "😠"} {fel}</span>
                          </div>
                        )}
                      </div>
                      <span className="tv-mono text-sm shrink-0" style={{ color: T.ok }}>+{Math.round(c.renda * (temGuilda ? multGuilda(g.nivel) : 1) * (v ? fatorFelicidade(v.felicidade) : 1))}/dia</span>
                    </div>
                  );
                })}
              </div>
              <div className="tv-body text-xs" style={{ color: T.inkDim }}>
                Domínios rendem por tipo de cidade (vilas 5, cidades 12, capitais 25, fortalezas 15 — a sede rende o dobro).{temGuilda ? ` Sua guilda nível ${g.nivel} multiplica tudo por ${multGuilda(g.nivel).toFixed(2)}.` : " Fundar uma guilda multiplica essas rendas."} Cada domínio tem população e felicidade vivas: povo feliz produz até +50% de renda; povo revoltado, metade. A cada dia passado, o reino vive — colheitas, caravanas, pragas e murmúrios saem por tabela e chegam à ficção. Expanda na ficção: cada cidade conquistada entra aqui automaticamente.
              </div>
            </>
          );
        })()}

        {aba === "gestao" && subGestao === "grupo" && (
          <>
            <div className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.inkDim }}>Grupo · {1 + (personagem.grupo || []).length} de {1 + MAX_COMPANHEIROS}</div>
            <CartaoMembro nome={personagem.nome} subtitulo={personagem.conceito} nivel={personagem.nivel} vida={personagem.vida} vidaMax={personagem.vidaMax} mana={personagem.mana} manaMax={personagem.manaMax} habilidades={personagem.habilidades} semente={sementeDe(personagem)} ehVoce />
            {(personagem.grupo || []).length === 0 ? (
              <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Você viaja sozinho — por enquanto. Aliados podem se juntar a você.</div>
            ) : (personagem.grupo || []).map((m, i) => (
              <div key={i}>
                <CartaoMembro nome={m.nome} subtitulo={[m.conceito, m.classe, m.subclasse].filter(Boolean).join(" · ")} nivel={m.nivel} vida={m.vida} vidaMax={m.vidaMax} descricao={m.descricao} habilidades={m.habilidades} semente={sementeDe(m)} xpComp={m.xp || 0} vinculo={m.vinculo ?? VINCULO_INICIAL} />
                <div className="flex flex-wrap gap-1 mt-1">
                  <button onClick={() => setAbrirCaminho(abrirCaminho === m.nome ? null : m.nome)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.violetSoft }}>
                    {m.classe ? "⚔ trilhar novo caminho" : "⚔ definir caminho"}
                  </button>
                  <button onClick={() => setConfirmarRemover(confirmarRemover === m.nome ? null : m.nome)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>
                    ✕ remover
                  </button>
                </div>
                {confirmarRemover === m.nome && (
                  <div className="rounded-lg p-2 mt-1 flex items-center justify-between gap-2" style={{ background: T.panelSoft, border: `1px solid ${T.danger}` }}>
                    <span className="tv-body text-xs" style={{ color: T.inkDim }}>Remover {m.nome} do grupo?</span>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { removerDoGrupo(m.nome); setConfirmarRemover(null); }} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ background: T.danger, color: "#fff" }}>remover</button>
                      <button onClick={() => setConfirmarRemover(null)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>cancelar</button>
                    </div>
                  </div>
                )}
                {abrirCaminho === m.nome && <SeletorCaminho mundo={mundo} alvo={m.nome} atual={m} acampado={acampado} trocarCaminho={trocarCaminho} fechar={() => setAbrirCaminho(null)} />}
              </div>
            ))}
          </>
        )}

        {aba === "inv" && (
          <>
            {(personagem.grupo || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {[{ id: "eu", rotulo: personagem.nome || "Você" }, ...(personagem.grupo || []).map((g) => ({ id: g.nome, rotulo: g.nome }))].map((op) => (
                  <button key={op.id} onClick={() => setInvDe(op.id)} className="tv-mono text-[10px] px-2.5 py-1.5 rounded-full" style={{ background: invDe === op.id ? T.amber : T.panelSoft, color: invDe === op.id ? T.onAccent : T.inkDim, border: `1px solid ${invDe === op.id ? T.amber : T.line}`, fontWeight: 600 }}>{op.rotulo}</button>
                ))}
              </div>
            )}
            {invDe !== "eu" ? (() => {
              const comp = (personagem.grupo || []).find((g) => g.nome === invDe);
              if (!comp) return <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Personagem não encontrado.</div>;
              const equipadosComp = comp.equipados || {};
              const ehEquipRaw = (raw) => raw && typeof raw === "object" && raw.tipo && raw.raridade;
              const mochilaEquip = [...(comp.equipamento || []), ...(comp.inventario || []).filter(ehEquipRaw)];
              const itensComuns = (comp.inventario || []).filter((raw) => !ehEquipRaw(raw));
              return (
                <>
                  {/* Equipado pelo companheiro */}
                  <div>
                    <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>{comp.nome} · equipado</div>
                    {Object.keys(equipadosComp).length === 0 ? (
                      <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Nada equipado. Dê um equipamento e toque em "equipar" — os bônus já valem no combate.</div>
                    ) : (
                      <div className="space-y-2">
                        {SLOTS_ORDEM.filter((s) => equipadosComp[s]).map((slot) => {
                          const it = equipadosComp[slot];
                          return (
                            <div key={slot} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${RARIDADE_COR[it.raridade] || T.line}` }}>
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="tv-body text-sm truncate" style={{ color: T.ink }}>{it.nome}</div>
                                  <div className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: RARIDADE_COR[it.raridade] || T.inkDim }}>{SLOT_ROTULO[it.tipo] || it.tipo} · {it.raridade}</div>
                                </div>
                                <button onClick={() => desequiparComp(comp.nome, slot)} className="tv-mono text-[10px] px-2 py-1 rounded shrink-0" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>tirar</button>
                              </div>
                              {(it.atributos && Object.keys(it.atributos).length > 0) && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {Object.entries(it.atributos).map(([k, v]) => (
                                    <span key={k} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: T.panel, color: T.ok }}>+{v} {k === "dano" ? "DANO" : k === "defesa" ? "DEF" : (ATRIBUTOS.find((a) => a.id === k)?.nome || k).slice(0, 3).toUpperCase()}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Mochila de equipamentos do companheiro */}
                  <div>
                    <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Equipamentos de {comp.nome}</div>
                    {mochilaEquip.length === 0 ? <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Nenhum equipamento. Use "dar…" na sua mochila para passar um item bom para ele(a).</div> : (
                      <div className="space-y-2">
                        {mochilaEquip.map((it, i) => (
                          <div key={i} className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className="tv-body text-sm truncate" style={{ color: T.ink }}>{it.nome}</div>
                                <div className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: RARIDADE_COR[it.raridade] || T.inkDim }}>{SLOT_ROTULO[it.tipo] || it.tipo} · {it.raridade}</div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => desmontarEquip(comp.nome, it.nome)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }} title={`Desmontar → +${essenciaDe(it)} essência`}>⚒</button>
                                <button onClick={() => transferirItem(comp.nome, "eu", "inventario", it.nome)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>← pegar</button>
                                <button onClick={() => equiparComp(comp.nome, it)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>equipar</button>
                              </div>
                            </div>
                            {(it.atributos && Object.keys(it.atributos).length > 0) && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {Object.entries(it.atributos).map(([k, v]) => (
                                  <span key={k} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: T.panel, color: T.ok }}>+{v} {k === "dano" ? "DANO" : k === "defesa" ? "DEF" : (ATRIBUTOS.find((a) => a.id === k)?.nome || k).slice(0, 3).toUpperCase()}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Itens comuns do companheiro */}
                  <div>
                    <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Bolsa de {comp.nome}</div>
                    {itensComuns.length === 0 ? <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Bolsos vazios.</div> : (
                      <ul className="space-y-2">
                        {itensComuns.map((raw, i) => {
                          const nomeIt = typeof raw === "string" ? raw : (raw && raw.nome) || "item";
                          const desc = typeof raw === "object" && raw ? (raw.descricao || "") : "";
                          return (
                            <li key={i} className="rounded-lg px-3 py-2.5" style={{ background: T.panelSoft }}>
                              <div className="tv-body text-sm flex items-center gap-2.5" style={{ color: T.ink }}>
                                <span style={{ color: T.amber }}>◆</span>
                                <span className="flex-1 min-w-0">{nomeIt}</span>
                                <button onClick={() => transferirItem(comp.nome, "eu", "inventario", nomeIt)} className="tv-mono text-[10px] px-2 py-1 rounded shrink-0" style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>← pegar</button>
                              </div>
                              {desc && <div className="tv-body text-xs mt-1 italic" style={{ color: T.inkDim, paddingLeft: "22px" }}>{desc}</div>}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </>
              );
            })() : (
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
                        <div className="flex items-center gap-1 shrink-0">{(personagem.grupo || []).length > 0 && (
                          <select value="" onChange={(e) => { if (e.target.value) transferirItem("eu", e.target.value, "equipamento", it.nome); }} className="tv-mono text-[10px] rounded px-1 py-1" style={{ background: T.panel, color: T.violetSoft, border: `1px solid ${T.line}` }}>
                            <option value="">dar…</option>
                            {(personagem.grupo || []).map((g) => <option key={g.nome} value={g.nome}>{g.nome}</option>)}
                          </select>
                        )}<button onClick={() => desmontarEquip("eu", it.nome)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }} title={`Desmontar → +${essenciaDe(it)} ⚗ essência`}>⚒</button><button onClick={() => descartarEquip(it.nome)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }} title="Descartar">✕</button><button onClick={() => equipar(it)} className="tv-mono text-[10px] px-2 py-1 rounded" style={{ background: T.amber, color: T.onAccent, fontWeight: 600 }}>equipar</button></div>
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

            {/* Forja — fabricação básica por código */}
            <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="tv-mono text-xs uppercase tracking-widest" style={{ color: T.amberSoft }}>⚒ Forja</div>
                <div className="tv-mono text-[11px]" style={{ color: T.violetSoft }}>⚗ {personagem.essencia || 0} essência</div>
              </div>
              {!forjaAberta ? (
                <>
                  <div className="tv-body text-[11px] mb-2" style={{ color: T.inkDim }}>Desmonte equipamentos (botão ⚒) para ganhar essência e forje peças novas — o item sai pela tabela, na hora, sem gastar tokens.</div>
                  <button onClick={() => setForjaAberta(true)} className="w-full tv-mono text-[11px] px-3 py-2 rounded-lg" style={{ border: `1px solid ${T.amber}`, color: T.amberSoft }}>abrir a forja</button>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select value={forjaSlot} onChange={(e) => setForjaSlot(e.target.value)} className="flex-1 tv-mono text-[11px] rounded-lg px-2 py-2 outline-none" style={{ background: T.panel, color: T.ink, border: `1px solid ${T.line}` }}>
                      {SLOTS_ORDEM.map((s) => <option key={s} value={s}>{SLOT_ROTULO[s] || s}</option>)}
                    </select>
                    <button onClick={() => setForjaAberta(false)} className="tv-mono text-[11px] px-2 rounded-lg" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>✕</button>
                  </div>
                  {RARIDADES.map((rar) => {
                    const c = CUSTO_FORJA[rar];
                    const okE = (personagem.essencia || 0) >= c.essencia, okM = (personagem.moedas || 0) >= c.moedas;
                    return (
                      <button key={rar} onClick={() => { forjar(forjaSlot, rar); }} disabled={!okE || !okM}
                        className="w-full rounded-lg px-3 py-2 flex items-center justify-between"
                        style={{ border: `1px solid ${RARIDADE_COR[rar] || T.line}`, color: RARIDADE_COR[rar] || T.ink, opacity: okE && okM ? 1 : 0.45 }}>
                        <span className="tv-mono text-[11px] font-semibold">{RARIDADE_ROTULO[rar]}</span>
                        <span className="tv-mono text-[10px]">⚗ {c.essencia}{c.moedas ? ` · ◉ ${c.moedas}` : ""}</span>
                      </button>
                    );
                  })}
                  <div className="tv-body text-[10px] italic" style={{ color: T.inkDim }}>O item forjado cai na mochila de equipamentos — equipe você ou passe para o grupo.</div>
                </div>
              )}
            </div>

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
                        {(personagem.grupo || []).length > 0 && (
                          <select value="" onChange={(e) => { if (e.target.value) transferirItem("eu", e.target.value, "inventario", it.nome); }} className="tv-mono text-[10px] rounded px-1 py-1 shrink-0" style={{ background: T.panel, color: T.violetSoft, border: `1px solid ${T.line}` }}>
                            <option value="">dar…</option>
                            {(personagem.grupo || []).map((g) => <option key={g.nome} value={g.nome}>{g.nome}</option>)}
                          </select>
                        )}
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
          </>
        )}
      </aside>
    </>
  );
}

function PainelCombate({ combate, onEncerrarTurno }) {
  if (!combate || !combate.inimigos || combate.inimigos.length === 0) return null;
  const eco = combate.economia || { acao: 1, extra: 1 };
  const chipMov = (ativo, rotulo) => (
    <span className="tv-mono text-[9px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${ativo ? T.amber : T.line}`, color: ativo ? T.amberSoft : T.inkDim, opacity: ativo ? 1 : 0.45, textDecoration: ativo ? "none" : "line-through" }}>{rotulo}</span>
  );
  return (
    <div className="tv-fade mx-4 md:mx-8 mt-1 mb-3 rounded-2xl p-3" style={{ background: T.panel, border: `1px solid ${T.danger}`, marginRight: "68px" }}>
      <div className="tv-mono text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5 flex-wrap" style={{ color: T.danger }}>
        <span>⚔ Em combate</span>
        <span style={{ color: T.inkDim }}>· {combate.inimigos.filter((e) => !e.derrotado).length} de pé</span>
        <span className="flex items-center gap-1 ml-auto normal-case tracking-normal">
          {chipMov(eco.acao > 0, "⚔ ação")}
          {chipMov(eco.extra > 0, "✦ extra")}
          {onEncerrarTurno && (
            <button onClick={onEncerrarTurno} title="Passa a vez: os inimigos agem e a nova rodada começa" className="tv-mono text-[9px] px-2 py-0.5 rounded-full" style={{ background: T.panelSoft, border: `1px solid ${T.line}`, color: T.inkDim }}>
              ⏭ encerrar turno
            </button>
          )}
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {combate.inimigos.map((e, i) => (
          <div key={i} className="rounded-xl p-2.5" style={{ background: T.panelSoft, border: `1px solid ${e.derrotado ? T.line : T.danger}`, opacity: e.derrotado ? 0.5 : 1 }}>
            <div className="flex items-center gap-2.5">
              <div style={{ filter: e.derrotado ? "grayscale(1)" : "none" }}><Retrato semente={sementeDe(e)} tamanho={40} anel={e.derrotado ? T.line : T.danger} estado={estadoDe(e.vida, e.vidaMax, true)} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="tv-display text-lg leading-tight truncate" style={{ color: e.derrotado ? T.inkDim : T.ink, textDecoration: e.derrotado ? "line-through" : "none" }}>{e.nome}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(e.nivel != null) && <span className="tv-mono text-[9px] px-1 py-0.5 rounded" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>nv {e.nivel}</span>}
                    {(e.gd || 0) > 0 && <span className="tv-mono text-[9px] px-1 py-0.5 rounded" title={`${tituloDe(e.gd)}`} style={{ border: `1px solid ${T.amber}`, color: T.amber }}>GD {e.gd}</span>}
                    {e.derrotado && <span className="tv-mono text-[9px] uppercase" style={{ color: T.inkDim }}>☠</span>}
                  </div>
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
  const [busca, setBusca] = React.useState("");
  const todas = (personagem.habilidades || []).filter((h) => h && h.nome);
  const normal = (x) => (x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const lista = busca ? todas.filter((h) => normal(h.nome).includes(normal(busca)) || normal(h.descricao).includes(normal(busca))) : todas;
  const muitas = todas.length > 6;
  return (
    <div className="tv-fade mx-4 md:mx-8 mb-2 rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.violet}`, marginRight: "68px" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="tv-mono text-xs uppercase tracking-widest" style={{ color: T.violetSoft }}>Habilidades · {personagem.mana}/{personagem.manaMax} PM · {todas.length}</div>
        <button onClick={fechar} className="tv-mono text-sm px-1.5" style={{ color: T.inkDim }}>✕</button>
      </div>
      {muitas && (
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar habilidade…"
          className="w-full rounded-lg px-3 py-2 mb-3 tv-body text-sm outline-none" style={{ background: T.panelSoft, border: `1px solid ${T.line}`, color: T.ink }} />
      )}
      {todas.length === 0 ? (
        <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Você ainda não despertou nenhuma habilidade. Elas virão com a história.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-2 tv-scroll" style={{ maxHeight: "38vh", overflowY: "auto" }}>
          {lista.map((h, i) => {
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
  const [estrutura, setEstrutura] = useState("jornada");
  const campo = { background: T.panel, border: `1px solid ${T.line}`, color: T.ink };
  return (
    <div className="tv-fade max-w-2xl mx-auto w-full px-6 py-10 overflow-y-auto tv-scroll">
      <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.violetSoft }}>Passo 1 de 2 · O mundo</div>
      <h1 className="tv-display text-4xl md:text-5xl mb-3" style={{ color: T.ink }}>Que realidade vamos criar?</h1>
      <p className="tv-body mb-6" style={{ color: T.inkDim }}>Dê um nome à campanha, escolha um gênero e descreva o que quiser. O Mestre preenche o resto com detalhes vivos.</p>
      <div className="flex gap-2 mb-4">
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da campanha (ex.: A Maré de Ferro)" maxLength={40} className="flex-1 rounded-xl p-4 tv-body text-sm outline-none" style={campo} />
        {genero && <button type="button" onClick={() => setNome(`As Crônicas de ${nomeCidade(genero.label)}`)} className="rounded-xl px-4 shrink-0" style={{ border: `1px solid ${T.line}`, color: T.amberSoft }} title="Sortear um nome">🎲</button>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {GENEROS.map((g) => (
          <button key={g.id} onClick={() => setGenero(g)} className="text-left rounded-xl p-4 transition-all" style={{ background: genero?.id === g.id ? T.panelSoft : T.panel, border: `1px solid ${genero?.id === g.id ? T.amber : T.line}` }}>
            <div className="tv-display text-lg" style={{ color: genero?.id === g.id ? T.amberSoft : T.ink }}>{g.label}</div>
            <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{g.dica}</div>
          </button>
        ))}
      </div>
      <div className="tv-mono text-xs uppercase tracking-widest mb-2 mt-2" style={{ color: T.violetSoft }}>Estrutura da história</div>
      <p className="tv-body text-sm mb-3" style={{ color: T.inkDim }}>O arco que guiará a campanha — o Mestre segue essa espinha dramática, e as missões surgem dentro dela.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {ESTRUTURAS.map((e) => (
          <button key={e.id} onClick={() => setEstrutura(e.id)} className="text-left rounded-xl p-4 transition-all" style={{ background: estrutura === e.id ? T.panelSoft : T.panel, border: `1px solid ${estrutura === e.id ? T.amber : T.line}` }}>
            <div className="tv-display text-lg" style={{ color: estrutura === e.id ? T.amberSoft : T.ink }}>{e.nome}</div>
            <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>{e.desc}</div>
            <div className="tv-mono text-[9px] mt-1.5 uppercase tracking-widest" style={{ color: T.violetSoft }}>{e.etapas.map((x) => x.nome).join(" → ")}</div>
          </button>
        ))}
      </div>
      <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} placeholder="Ex.: Um arquipélago flutuante onde a magia vem das marés. Piratas do céu disputam relíquias de um império afundado nas nuvens…" className="w-full rounded-xl p-4 tv-body text-sm outline-none resize-none" style={campo} />
      <div className="mt-6 flex justify-end">
        <Botao primario desativado={!genero || !nome.trim()} onClick={() => concluir({ genero: genero.label, descricao, estrutura }, nome.trim())}>Continuar →</Botao>
      </div>
    </div>
  );
}

function TelaPersonagem({ mundo, concluir }) {
  mundo = mundo || { genero: "Fantasia medieval" };
  const [nome, setNome] = useState("");
  const [conceito, setConceito] = useState("");
  const [historia, setHistoria] = useState("");
  const racasDisp = racasDoGenero(mundo.genero);
  const [raca, setRaca] = useState(racasDisp[0].nome);
  const [classe, setClasse] = useState(CLASSES[0].nome);
  const [subclasse, setSubclasse] = useState(CLASSES[0].subclasses[0].nome);
  const [profissao, setProfissao] = useState(PROFISSOES[0].nome);
  const [antecedenteId, setAntecedenteId] = useState(ANTECEDENTES[0].id);
  const antObj = antecedentePorId(antecedenteId);
  const [atributos, setAtributos] = useState(Object.fromEntries(ATRIBUTOS.map((a) => [a.id, 0])));
  const usados = Object.values(atributos).reduce((s, v) => s + v, 0);
  const restantes = PONTOS_TOTAIS - usados;
  const cObj = classePorNome(classe);
  const rObj = racaPorNome(raca);
  /* atributos finais = distribuídos + bônus racial */
  const attrFinais = Object.fromEntries(ATRIBUTOS.map((a) => [a.id, (atributos[a.id] || 0) + ((rObj?.bonus || {})[a.id] || 0)]));
  const vidaMax = (cObj?.vidaBase || 10) + attrFinais.vigor * 2;
  const manaMax = (cObj?.manaBase || 8) + attrFinais.intelecto * 2;
  const habsIniciais = habilidadesIniciais(classe).map((h) => ({ nome: h.nome, custo: h.custo, descricao: h.descricao }));
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
        <div className="flex gap-2">
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do personagem" className="flex-1 rounded-xl p-4 tv-body text-sm outline-none" style={campo} />
          <button type="button" onClick={() => setNome(nomePessoa(mundo.genero))} className="rounded-xl px-4 shrink-0" style={{ border: `1px solid ${T.line}`, color: T.amberSoft }} title="Sortear um nome">🎲</button>
        </div>
        <input value={conceito} onChange={(e) => setConceito(e.target.value)} placeholder="Conceito (ex.: ladra de relíquias arrependida)" className="rounded-xl p-4 tv-body text-sm outline-none" style={campo} />
      </div>
      <textarea value={historia} onChange={(e) => setHistoria(e.target.value)} rows={3} placeholder="História e segredos (opcional) — o Mestre vai usar isso contra e a favor de você…" className="w-full rounded-xl p-4 tv-body text-sm outline-none resize-none mb-6" style={campo} />

      <div className="grid md:grid-cols-2 gap-4 mb-2">
        <div>
          <div className="tv-mono text-xs uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>{["Ficção científica", "Cyberpunk", "Pós-apocalíptico"].includes(mundo.genero) ? "Origem" : "Raça"}</div>
          <select value={raca} onChange={(e) => setRaca(e.target.value)} className="w-full rounded-xl p-3 tv-body text-sm outline-none" style={campo}>
            {racasDisp.map((r) => <option key={r.nome} value={r.nome}>{r.nome}</option>)}
          </select>
          {rObj && <div className="tv-body text-xs mt-1.5" style={{ color: T.inkDim }}>{rObj.desc} <span style={{ color: T.amberSoft }}>{Object.entries(rObj.bonus).map(([k, v]) => `+${v} ${(ATRIBUTOS.find((a) => a.id === k) || {}).nome || k}`).join(", ")}</span></div>}
        </div>
        <div>
          <div className="tv-mono text-xs uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Profissão</div>
          <select value={profissao} onChange={(e) => setProfissao(e.target.value)} className="w-full rounded-xl p-3 tv-body text-sm outline-none" style={campo}>
            {PROFISSOES.map((pr) => <option key={pr.nome} value={pr.nome}>{pr.nome}</option>)}
          </select>
          {(() => { const pr = PROFISSOES.find((x) => x.nome === profissao); return pr ? <div className="tv-body text-xs mt-1.5" style={{ color: T.inkDim }}>{pr.beneficio}</div> : null; })()}
        </div>
      </div>

      <div className="mb-6">
        <div className="tv-mono text-xs uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Antecedente · quem você era antes</div>
        <select value={antecedenteId} onChange={(e) => setAntecedenteId(e.target.value)} className="w-full rounded-xl p-3 tv-body text-sm outline-none" style={campo}>
          {ANTECEDENTES.map((a) => <option key={a.id} value={a.id}>{a.icone} {a.nome}</option>)}
        </select>
        <div className="rounded-xl p-3 mt-1.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
          <div className="tv-body text-xs" style={{ color: T.ink }}>{antObj.desc}</div>
          <div className="tv-body text-[11px] italic mt-1" style={{ color: T.inkDim }}>🎭 Gancho: {antObj.gancho}</div>
          <div className="tv-mono text-[10px] mt-1.5" style={{ color: T.amberSoft }}>
            {[antObj.item ? `◆ ${antObj.item}` : null, antObj.pv ? `+${antObj.pv} PV` : null, antObj.pm ? `+${antObj.pm} PM` : null, antObj.moedas ? `+${antObj.moedas} moedas` : null].filter(Boolean).join("  ·  ") || "—"}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="tv-mono text-xs uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Classe</div>
          <select value={classe} onChange={(e) => { setClasse(e.target.value); setSubclasse(classePorNome(e.target.value).subclasses[0].nome); }} className="w-full rounded-xl p-3 tv-body text-sm outline-none" style={campo}>
            {CLASSES.map((c) => <option key={c.nome} value={c.nome}>{c.nome}</option>)}
          </select>
          {cObj && <div className="tv-body text-xs mt-1.5" style={{ color: T.inkDim }}>{cObj.desc}</div>}
        </div>
        <div>
          <div className="tv-mono text-xs uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Caminho (subclasse)</div>
          <select value={subclasse} onChange={(e) => setSubclasse(e.target.value)} className="w-full rounded-xl p-3 tv-body text-sm outline-none" style={campo}>
            {(cObj?.subclasses || []).map((sc) => <option key={sc.nome} value={sc.nome}>{sc.nome}</option>)}
          </select>
          {(() => { const sc = (cObj?.subclasses || []).find((x) => x.nome === subclasse); return sc ? <div className="tv-body text-xs mt-1.5" style={{ color: T.inkDim }}>{sc.desc} <span style={{ color: T.violetSoft }}>Especializações: {sc.especializacoes.join(" · ")}</span></div> : null; })()}
        </div>
      </div>

      {habsIniciais.length > 0 && (
        <div className="rounded-xl p-3 mb-6" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
          <div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.violetSoft }}>Habilidades iniciais de {classe}</div>
          <div className="tv-body text-xs" style={{ color: T.inkDim }}>{habsIniciais.map((h) => `${h.nome} (${h.custo} PM)`).join(" · ")}</div>
        </div>
      )}
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
            raca, classe, subclasse, profissao,
            antecedente: antObj.nome, antecedenteGancho: antObj.gancho,
            semente: `${nome.trim()}|${conceito.trim()}|${Math.floor(Math.random() * 100000)}`,
            atributos: attrFinais, vida: vidaMax + (antObj.pv || 0), vidaMax: vidaMax + (antObj.pv || 0), mana: manaMax + (antObj.pm || 0), manaMax: manaMax + (antObj.pm || 0),
            nivel: 1, xp: 0, moedas: MOEDAS_INICIAIS + (antObj.moedas || 0), nivelPendentes: 0,
            inventario: antObj.item ? [antObj.item] : [], habilidades: habsIniciais, grupo: [],
            efeitos: [], condicoes: [], equipamento: [], equipados: {},
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
        <p className="tv-mono text-[9px] uppercase tracking-[0.2em] mt-3" style={{ color: T.amberSoft }}>v7.4.1 · recalibração divina</p>
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

/* Evolução de companheiro por XP acumulado. Cada nível: +3 PV máx, e a cada
   nível o app pode subir levemente a competência. Companheiros evoluem junto. */
function evoluirCompanheiro(g) {
  let { xp = 0, nivel = 1, vidaMax = 10 } = g;
  let subiu = 0;
  while (xp >= XP_POR_NIVEL(nivel)) { xp -= XP_POR_NIVEL(nivel); nivel += 1; vidaMax += 3; subiu++; }
  return { ...g, xp, nivel, vidaMax, vida: subiu ? vidaMax : g.vida, _subiu: subiu };
}

/* Descanso aplicado por CÓDIGO — garante reset real do jogador E do grupo. */
function aplicarDescanso(pers, tipo, msgs) {
  const longo = tipo === "longo";
  const frac = longo ? 1 : 0.5; // curto recupera metade, longo tudo
  const novaVida = longo ? pers.vidaMax : Math.min(pers.vidaMax, pers.vida + Math.ceil(pers.vidaMax * frac));
  const novaMana = longo ? pers.manaMax : Math.min(pers.manaMax, pers.mana + Math.ceil(pers.manaMax * frac));
  // condições: descanso longo remove as ruins curáveis; curto alivia algumas
  let condicoes = pers.condicoes || [];
  if (longo) condicoes = condicoes.filter((c) => c.tipo === "bom");
  else condicoes = condicoes.filter((c) => !(c.tipo !== "bom" && ["Cansado", "Enfraquecido", "Sangrando"].includes(c.nome)));
  // grupo: cura junto (companheiros descansam também)
  const grupo = (pers.grupo || []).map((gm) => ({
    ...gm,
    vida: longo ? gm.vidaMax : Math.min(gm.vidaMax, (gm.vida || 0) + Math.ceil((gm.vidaMax || 10) * frac)),
  }));
  msgs.push(longo ? "🌙 Descanso longo — você e o grupo recuperam PV e PM por completo." : "🔥 Descanso curto — você e o grupo recuperam parte do PV e PM.");
  return { ...pers, vida: novaVida, mana: novaMana, condicoes, grupo };
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
    grupo.push({ nome: g.nome, conceito: g.conceito || "", nivel: g.nivel ?? 1, vida: g.vida ?? 10, vidaMax: g.vidaMax ?? g.vida ?? 10, descricao: g.descricao || "", habilidades: g.habilidades || [], semente: `npc|${g.nome}|${g.conceito || ""}`, vinculo: VINCULO_INICIAL, marcos: [] });
    msgs.push(`⚑ ${g.nome} juntou-se ao grupo!`);
  });
  (m.grupo_remover || []).forEach((nome) => { if (grupo.some((g) => g.nome.toLowerCase() === nome.toLowerCase())) { grupo = grupo.filter((g) => g.nome.toLowerCase() !== nome.toLowerCase()); msgs.push(`⚑ ${nome} deixou o grupo.`); } });
  (m.grupo_vida || []).forEach((gv) => { grupo = grupo.map((g) => g.nome.toLowerCase() === (gv.nome || "").toLowerCase() ? { ...g, vida: Math.max(0, Math.min(g.vidaMax, g.vida + (gv.vida || 0))) } : g); });
  /* XP de companheiros (evoluem junto com o herói) */
  (m.grupo_xp || []).forEach((gx) => {
    grupo = grupo.map((g) => {
      if (g.nome.toLowerCase() !== (gx.nome || "").toLowerCase()) return g;
      const antes = g.nivel ?? 1;
      const ev = evoluirCompanheiro({ ...g, xp: (g.xp || 0) + Math.max(0, gx.xp || 0) });
      if (ev.nivel > antes) msgs.push(`✦ ${g.nome} subiu para o nível ${ev.nivel}!`);
      delete ev._subiu; return ev;
    });
  });
  /* bolsas dos companheiros: o Mestre dá/tira itens deles por "grupo_itens" */
  (m.grupo_itens || []).forEach((gi) => {
    grupo = grupo.map((g) => {
      if (g.nome.toLowerCase() !== (gi.nome || "").toLowerCase()) return g;
      let inv2 = [...(g.inventario || [])];
      let eqp2 = [...(g.equipamento || [])];
      (gi.adicionar || []).forEach((it) => {
        const ehEquip = it && typeof it === "object" && it.tipo && it.raridade;
        if (ehEquip) eqp2.push(it); else inv2.push(it);
        msgs.push(`◆ ${g.nome} obteve: ${nomeItem(it)}`);
      });
      (gi.remover || []).forEach((r) => { const ix = eqp2.findIndex((x) => nomeItem(x).toLowerCase() === String(r).toLowerCase()); if (ix >= 0) { msgs.push(`${g.nome} perdeu: ${nomeItem(eqp2[ix])}`); eqp2.splice(ix, 1); } });
      (gi.remover || []).forEach((r) => { const ix = inv2.findIndex((x) => nomeItem(x).toLowerCase() === String(r).toLowerCase()); if (ix >= 0) { msgs.push(`${g.nome} perdeu: ${nomeItem(inv2[ix])}`); inv2.splice(ix, 1); } });
      return { ...g, inventario: inv2, equipamento: eqp2 };
    });
  });
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

  if (Math.max(0, m.xp || 0)) {
    novo = aplicarNivel({ ...novo, xp: novo.xp + Math.max(0, m.xp || 0) });
    /* Companheiros evoluem JUNTOS por código: 60% do XP do herói, sempre.
       (Antes dependia do Mestre enviar "grupo_xp" — e ele quase nunca enviava,
       deixando companheiros congelados no nível 1.) */
    const xpComp = Math.floor(Math.max(0, m.xp || 0) * 0.6);
    if (xpComp > 0) {
      novo.grupo = (novo.grupo || []).map((g) => {
        const ev = evoluirCompanheiro({ ...g, xp: (g.xp || 0) + xpComp });
        const subiu = ev._subiu; delete ev._subiu;
        if (subiu) msgs.push(`✦ ${g.nome} subiu para o nível ${ev.nivel}! (no acampamento, "trilhar caminho" destrava novas habilidades)`);
        return ev;
      });
    }
  }

  if (m.vida) msgs.push(m.vida < 0 ? `Você perdeu ${-m.vida} PV.` : `Você recuperou ${m.vida} PV.`);
  if (m.mana) msgs.push(m.mana < 0 ? `Você gastou ${-m.mana} PM.` : `Você recuperou ${m.mana} PM.`);
  if (m.moedas) msgs.push(m.moedas > 0 ? `◉ +${m.moedas} moedas` : `◉ −${-m.moedas} moedas`);
  if (m.xp) msgs.push(`✧ +${m.xp} XP`);
  if (novo.nivel > pers.nivel) msgs.push(`✦ NÍVEL ${novo.nivel} ALCANÇADO!`);
  (m.adicionar_itens || []).forEach((i) => msgs.push(`Item obtido: ${nomeItem(i)}`));
  (m.remover_itens || []).forEach((i) => msgs.push(`Item perdido: ${nomeItem(i)}`));
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
const MOD_MAX_ROLAGEM = 8; // teto: mesmo um semideus precisa do dado
function atributoEfetivo(pers, attrId) {
  const attr = ATRIBUTOS.find((a) => a.id === attrId);
  const total = ((pers.atributos || {})[attrId] || 0) + bonusEquip(pers, attrId) + bonusEfeito(pers, attr?.nome || "");
  return Math.min(MOD_MAX_ROLAGEM, total);
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
    /* BESTIÁRIO: completa PV/defesa/nível pela tabela (o Mestre pode mandar só
       nome+ameaca; números coerentes com o nível do jogador saem do código) */
    const comp = completarInimigo(ini, m.__nivelJogador || 1);
    inimigos.push({ ...comp, gd: Math.max(0, Math.min(4, Number(ini.gd) || 0)), derrotado: false, semente: `inimigo|${comp.nome}|${comp.ameaca || ""}` });
    msgs.push(`⚔ ${comp.nome} entra no combate! (${comp.vida} PV)`);
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
  /* ENCERRAMENTO AUTOMÁTICO: se todos estão derrotados, o app fecha o combate
     na hora — sem esperar o Mestre. Marca uma flag para pedir os espólios. */
  const todosMortos = inimigos.length > 0 && inimigos.every((e) => e.derrotado || e.vida <= 0);
  if (todosMortos) {
    msgs.push("⚔ Todos os inimigos foram derrotados! O combate termina.");
    m.__vitoriaAuto = true;
    m.__inimigosFinais = inimigos; // para o app calcular os espólios por código
    return null;
  }
  /* ECONOMIA DE TURNO (v7.4): 2 movimentos por rodada do jogador (ação +
     ação extra/movimento). Sobrevive às reconstruções do objeto de combate. */
  return { inimigos, economia: (combateAtual && combateAtual.economia) || { acao: 1, extra: 1 } };
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
    grupo: Array.isArray(p.grupo) ? p.grupo.map((g) => ({ ...g, xp: g.xp || 0, nivel: g.nivel || 1, inventario: Array.isArray(g.inventario) ? g.inventario : [], equipamento: Array.isArray(g.equipamento) ? g.equipamento : [], equipados: g.equipados && typeof g.equipados === "object" ? g.equipados : {}, semente: g.semente || `npc|${g.nome || ""}|${g.conceito || ""}`, vinculo: g.vinculo ?? VINCULO_INICIAL, marcos: Array.isArray(g.marcos) ? g.marcos : [] })) : [],
    antecedente: p.antecedente || "", antecedenteGancho: p.antecedenteGancho || "",
    essencia: p.essencia || 0,
    cicatrizes: Array.isArray(p.cicatrizes) ? p.cicatrizes : [],
    efeitos: Array.isArray(p.efeitos) ? p.efeitos : [],
    condicoes: Array.isArray(p.condicoes) ? p.condicoes : [],
    equipamento: Array.isArray(p.equipamento) ? p.equipamento : [],
    equipados: p.equipados && typeof p.equipados === "object" ? p.equipados : {},
    raca: p.raca || "", classe: p.classe || "", subclasse: p.subclasse || "", profissao: p.profissao || "",
    semente: p.semente || `${p.nome || "herói"}|${p.conceito || ""}|0`,
    nivel: p.nivel || 1, xp: p.xp || 0, moedas: p.moedas ?? 0,
    nivelPendentes: p.nivelPendentes || 0,
    vida: p.vida ?? p.vidaMax ?? 10, vidaMax: p.vidaMax ?? 10,
    mana: p.mana ?? p.manaMax ?? 8, manaMax: p.manaMax ?? 8,
  };
}

class LimiteErro extends React.Component {
  constructor(props) { super(props); this.state = { erro: null }; }
  static getDerivedStateFromError(erro) { return { erro }; }
  componentDidCatch(erro, info) { console.error("Taverna erro:", erro, info); }
  render() {
    if (this.state.erro) {
      return (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#0E0C15", zIndex: 100 }}>
          <div style={{ maxWidth: 420, textAlign: "center", color: "#E8E2D0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🍺</div>
            <div style={{ fontSize: 20, marginBottom: 8 }}>Algo tropeçou na taverna</div>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 16 }}>Um erro inesperado interrompeu a tela. Sua aventura está salva. Recarregue para voltar de onde parou.</div>
            <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 16, fontFamily: "monospace", wordBreak: "break-word" }}>{String((this.state.erro && this.state.erro.message) || this.state.erro).slice(0, 160)}</div>
            <button onClick={() => location.reload()} style={{ padding: "10px 20px", borderRadius: 10, background: "#C9973F", color: "#1a1206", border: "none", fontWeight: 600, cursor: "pointer" }}>Recarregar</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function gerarBancoNomes(genero) {
  const g = (genero && genero.genero) || genero || "Fantasia medieval";
  const cidades = [], tavernas = [];
  for (let i = 0; i < 8; i++) cidades.push(nomeCidade(g));
  for (let i = 0; i < 4; i++) tavernas.push(nomeTaverna(g));
  const elenco = elencoDiverso(g, 6);
  return { cidades: [...new Set(cidades)], tavernas: [...new Set(tavernas)], elenco };
}

export default function Taverna() {
  const [fase, setFase] = useState("menu"); // menu | mundo | personagem | jogo
  const faseRef = useRef(fase);
  const avisoPodaRef = useRef(false);
  const salvarRef2 = useRef(null);
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
  const [acoesAbertas, setAcoesAbertas] = useState(false);
  const [habSel, setHabSel] = useState(null);
  const [dadoRolando, setDadoRolando] = useState(false);
  const [falha, setFalha] = useState(null);
  const [statusSave, setStatusSave] = useState(null);
  const [cronica, setCronica] = useState(null);
  const [verCena, setVerCena] = useState(false);
  const [longeDoFim, setLongeDoFim] = useState(false);
  const areaRef = useRef(null);
  const [acampado, setAcampado] = useState(false);
  const acampadoRef = useRef(false);
  /* mantém a ref em dia: o salvamento lê a ref, nunca o estado (que fica
     defasado dentro de callbacks e gravava "acampado" errado no save) */
  const definirAcampado = useCallback((v) => { acampadoRef.current = v; setAcampado(v); }, []);
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
  const rolagemConsumidaRef = useRef(null);
  const mundoContRef = useRef(0);
  const combateOciosoRef = useRef(0);      // turnos sem troca de golpes
  const ataqueResolvidoRef = useRef(false); // marca ataque do jogador neste turno
  const modoMundoRef = useRef(0);           // rotação de tipos de cena
  const urgenciaRef = useRef(0);            // quantas cenas recentes usaram urgência
  const historiaRef = useRef({ estrutura: "jornada", etapa: 0 });
  const questsRef = useRef([]);
  const [quests, setQuests] = useState([]);
  const [aguardandoMundo, setAguardandoMundo] = useState(false);
  const [mostrarHoras, setMostrarHoras] = useState(false);
  const ehAcaoMundoRef = useRef(false); // marca que o próximo enviar é a vez do mundo
  const canoneRef = useRef({});
  const npcsRef = useRef({});                 // registro persistente de pessoas
  const [npcs, setNpcs] = useState({});
  const npcTurnoRef = useRef(0);              // marca "visto por último" de cada NPC
  const bancoNomesRef = useRef(null);
  const mapaRef = useRef({ cidades: [], faccoes: [] });
  const [mapa, setMapa] = useState({ cidades: [], faccoes: [] });
  const faccaoJogadorRef = useRef("");
  const cidadeAtualRef = useRef("");
  /* GESTÃO: guilda (nível/cofre) — domínios se derivam do mapa por código */
  const guildaRef = useRef({ nivel: 1, cofre: 0 });
  const [guilda, setGuilda] = useState({ nivel: 1, cofre: 0 });
  /* ASCENSÃO (v7.4): escala GD/fiéis/PF do jogador + panteão do mundo.
     Travada até o nível NIVEL_DESPERTAR para não quebrar a história. */
  const divindadeRef = useRef(garantirDivindade(null));
  const [divindade, setDivindade] = useState(divindadeRef.current);
  /* O que o Mestre recebe sobre o cosmos: regras só após o despertar (custo zero antes) */
  const infoDivindade = () => {
    const dv = divindadeRef.current;
    if (!dv || !dv.despertar) return "";
    return `${DIVINDADE_PROMPT}\nEstado atual do jogador: ${resumoAscensao(dv, 0)}${dv.panteao.length ? `\nPanteão conhecido: ${dv.panteao.map((d) => `${d.icone} ${d.nome} ${d.dominio} — GD ${d.gd} (${tituloDe(d.gd)}), culto: ${d.culto}`).join("; ")}.` : ""}`;
  };
  /* CLIMA: rolado por tabela; vai ao Mestre como envelope [CLIMA] */
  const climaRef = useRef(null);
  const [clima, setClima] = useState(null);
  /* CONQUISTAS/CÓDEX: contadores de feitos, conquistas desbloqueadas,
     título equipado e criaturas descobertas — tudo por código */
  const contRef = useRef({ ...CONTADORES_INICIAIS });
  const conqRef = useRef({ desbloqueadas: {}, ordem: [] });
  const [conquistas, setConquistas] = useState({ desbloqueadas: {}, ordem: [] });
  const tituloAtivoRef = useRef("");
  const [tituloAtivo, setTituloAtivo] = useState("");
  const descobRef = useRef([]);
  const [descobertas, setDescobertas] = useState([]);
  /* MASMORRA (v6.3): masmorra ativa gerada por tabela — o app resolve as salas */
  const masmorraRef = useRef(null);
  const [masmorra, setMasmorra] = useState(null);
  /* MURAL DE CONTRATOS (v6.3): 3 trabalhos por tabela, recompensa paga por código */
  const muralRef = useRef([]);
  const [mural, setMural] = useState([]);
  const decretosRef = useRef([]);
  const [decretos, setDecretos] = useState([]);
  const diaRef = useRef(1);
  const [dia, setDia] = useState(1);
  const reinoRef = useRef({});
  const [reino, setReino] = useState({});
  /* TEMPO DA CAMPANHA (v6.5): o app conta os dias — a âncora da memória.
     "Nos conhecemos no dia X" vira fato verificável; antes dele, impossível. */
  const minutoRef = useRef(AMANHECER + 60); // a aventura começa de manhã
  const [minuto, setMinuto] = useState(minutoRef.current);
  const acordouAbsRef = useRef(0); // minuto absoluto em que o herói acordou do último descanso longo
  /* FAMA E NÊMESIS (v6.8): a fama é derivada das façanhas reais; a nêmesis
     nasce por tabela quando o nome cresce — e cresce com cada dia. */
  const nemesisRef = useRef(null);
  const [nemesis, setNemesis] = useState(null);
  /* CORREIO DOS REINOS (v7.0): cartas enviadas/recebidas, tratados firmados —
     todo ato oficial de facção passa por aqui, nunca pela imaginação da IA. */
  const correioRef = useRef({ enviadas: [], recebidas: [], historico: [], tratados: [], seq: 1 });
  const [correio, setCorreio] = useState(correioRef.current);
  /* JORNADA (v7.1): se estou em viagem, NÃO estou em cidade nenhuma — e o
     mestre precisa saber disso em todo turno (fim do "acordar nos aposentos"
     no meio do oceano). Limpa quando o sistema registra chegada (cidade_atual). */
  const jornadaRef = useRef(null); // { de, desde, meio } | null
  const [jornada, setJornada] = useState(null);
  /* GERADORES DE VIDA (v7.2): eventos locais (máx. 3, expiram) e o evento
     global (máx. 1, escala por etapas) — sorteados por código, o mestre só narra. */
  const eventosRef = useRef({ locais: [], global: null, semGlobalDesde: 0, seq: 1 });
  const [eventos, setEventos] = useState(eventosRef.current);
  const localAtualTxt = () => jornadaRef.current
    ? `EM VIAGEM desde ${jornadaRef.current.de || "a última parada"} (desde o dia ${jornadaRef.current.desde || "?"})${jornadaRef.current.meio ? `, viajando de ${jornadaRef.current.meio}` : ""} — não estou em cidade nenhuma`
    : (cidadeAtualRef.current ? `em ${cidadeAtualRef.current}` : "a sós, fora de cidade");
  const famaAtual = () => calcularFama(contRef.current, (personagem && personagem.nivel) || 1, dominiosDe(mapaRef.current).length);
  const famaPatamarRef = useRef(0); // fama da última checagem, para detectar saltos de patamar
  const absMin = () => (diaRef.current - 1) * 1440 + minutoRef.current;
  const tempoInfoPrompt = () => {
    const est = estacaoDe(diaRef.current);
    return `TEMPO DA CAMPANHA: hoje é ${dataTxt(diaRef.current)} — dia ${diaRef.current} da campanha —, ${horaTxt(minutoRef.current)}${ehNoite(minutoRef.current) ? " (NOITE)" : ""}, ${est.nome.toLowerCase()} ${est.icone} (${est.nota}). O app controla o relógio e o calendário: NUNCA estime datas ou horas por conta própria; use estas.`;
  };
  /* RELÓGIO (v6.7): o tempo corre sozinho. Cada chamada avança N minutos;
     dias viram por aqui (com reino, festivais e sono a reboque). Retorna
     texto de envelope para o chamador anexar ao envio do Mestre. */
  const avancarMinutos = (n) => {
    minutoRef.current += n;
    const extras = [];
    while (minutoRef.current >= 1440) {
      minutoRef.current -= 1440;
      const evs = avancarDiasReino(1);
      evs.forEach((ev) => pushMsgs([{ autor: "sistema", texto: `👑 ${ev.evento.titulo} em ${ev.cidade}: ${ev.evento.txt(ev.cidade)}` }]));
      extras.push(envelopeEventosReino(evs));
      const fest = festivalDe(diaRef.current);
      if (fest) {
        const r = Object.fromEntries(Object.entries(reinoRef.current || {}).map(([k, v]) => [k, { ...v, felicidade: Math.min(100, (v.felicidade || 0) + fest.fel) }]));
        reinoRef.current = r; setReino(r);
        pushMsgs([{ autor: "sistema", texto: `${fest.icone} Hoje é ${fest.nome}: ${fest.descricao}.` }]);
        extras.push(`[FESTIVAL — ${fest.nome.toUpperCase()}] Hoje (${dataTxt(diaRef.current)}) é ${fest.nome}: ${fest.descricao}. Nos meus domínios o povo celebra (a felicidade já subiu por código). Traga a festa para a ficção se couber na cena.`);
      }
    }
    setMinuto(minutoRef.current);
    /* Sono: o corpo cobra. 16h acordado = aviso; 20h = exaustão (condição por código). */
    const acordadoH = (absMin() - acordouAbsRef.current) / 60;
    const cansadoJa = (personagem.condicoes || []).some((c) => (c.nome || "").toLowerCase().includes("cansado"));
    if (acordadoH >= HORAS_EXAUSTO && !cansadoJa) {
      setPersonagem((p) => ({ ...p, condicoes: [...(p.condicoes || []), { nome: "Cansado", tipo: "ruim", nota: "exausto por vigília longa demais — só sai com descanso longo" }] }));
      pushMsgs([{ autor: "sistema", texto: `🥱 Exaustão: ${Math.floor(acordadoH)}h acordado. Condição "Cansado" até um descanso longo.` }]);
    } else if (acordadoH >= HORAS_AVISO_SONO && (acordadoH - n / 60) < HORAS_AVISO_SONO) {
      pushMsgs([{ autor: "sistema", texto: `🌙 Você está acordado há ${Math.floor(acordadoH)}h. O corpo pede acampamento — além de ${HORAS_EXAUSTO}h vem a exaustão.` }]);
    }
    checarConquistas();
    return extras.filter(Boolean).join("");
  };
  const mostrarRolagensRef = useRef(true);

  /* rola para o fim SÓ quando chega mensagem nova E o jogador já estava no fim.
     Nunca reage a longeDoFim mudar (isso causava o "imã" ao subir lendo). */
  const nMsgRef = useRef(0);
  useEffect(() => {
    const cresceu = mensagens.length > nMsgRef.current;
    nMsgRef.current = mensagens.length;
    /* não rola sozinho se há uma rolagem pendente — o jogador quer ler a
       narrativa do Mestre antes de rolar, sem a tela pular para o rodapé */
    if (cresceu && !longeDoFim && !rolagem) fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensagens]); // eslint-disable-line

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
      combate: combateRef.current, livro: livroRef.current, canone: canoneRef.current, npcs: npcsRef.current, acampado: acampadoRef.current,
      mapa: mapaRef.current, faccaoJogador: faccaoJogadorRef.current, cidadeAtual: cidadeAtualRef.current, guilda: guildaRef.current, clima: climaRef.current,
      conquistas: conqRef.current, contadores: contRef.current, tituloAtivo: tituloAtivoRef.current, descobertas: descobRef.current,
      masmorra: masmorraRef.current, mural: muralRef.current, decretos: decretosRef.current, dia: diaRef.current, reino: reinoRef.current, minuto: minutoRef.current, acordouAbs: acordouAbsRef.current, nemesis: nemesisRef.current, famaPatamar: famaPatamarRef.current, correio: correioRef.current, jornada: jornadaRef.current, eventos: eventosRef.current, divindade: divindadeRef.current,
      historia: historiaRef.current, quests: questsRef.current,
      rolagem: (extra.rolagem !== undefined ? extra.rolagem : (dadoRolando ? null : rolagem)), salvoEm: Date.now(), ...extra,
    };
    /* GRAVAÇÃO À PROVA DE QUOTA (v7.0.2): o histórico completo do chat é o que
       incha o save (narrativas longas). O MUNDO, a ficha e o cânone NUNCA são
       podados — só o scrollback de mensagens, que tem cópia viva na sessão e
       memória permanente no cânone/livro. Se a quota estourar, poda mais. */
    const historicoEnxuto = (nMsg) => ({
      ...dados,
      mensagens: mensagensRef.current.slice(-nMsg),
      historico: Array.isArray(historico) && historico.length > nMsg * 2 ? historico.slice(-nMsg * 2) : historico,
    });
    const gravar = (d) => { try { localStorage.setItem("taverna_save_v1", JSON.stringify(d)); return true; } catch { return false; } };
    let gravou = gravar(historicoEnxuto(250));
    let podou = false;
    if (!gravou) {
      for (const n of [120, 60, 30]) {
        if (gravar(historicoEnxuto(n))) { gravou = true; podou = true; break; }
      }
    }
    if (gravou) {
      saveRef.current = dados;
      setTemSave(dados);
      setStatusSave("salvo");
      if (podou && !avisoPodaRef.current) {
        avisoPodaRef.current = true;
        pushMsgs([{ autor: "sistema", texto: "💾 O save estava grande demais para o navegador: poddo só o histórico antigo de mensagens (o mundo, a ficha, o cânone e as missões seguem intactos)." }]);
      }
    } else {
      setStatusSave("erro");
    }
  }, [nomeCampanha, mundo, personagem, mensagens, historico, sugestoes, rolagem]);

  /* SEGURO CONTRA CRASH (v7.0.2): se a página vai para segundo plano (ou o
     sistema derruba o Safari por memória), o save acontece ANTES. Assim, mesmo
     num crash, o prejuízo máximo é o turno em andamento — nunca 90% da saga. */
  useEffect(() => { salvarRef2.current = salvar; }, [salvar]);
  useEffect(() => { faseRef.current = fase; }, [fase]);
  useEffect(() => {
    const aoEsconder = () => {
      if (document.visibilityState !== "hidden" && !document.hidden) return;
      if (faseRef.current === "jogo" && salvarRef2.current) salvarRef2.current();
    };
    document.addEventListener("visibilitychange", aoEsconder);
    window.addEventListener("pagehide", aoEsconder);
    return () => {
      document.removeEventListener("visibilitychange", aoEsconder);
      window.removeEventListener("pagehide", aoEsconder);
    };
  }, []);

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
    /* MAPA E FACÇÕES: registra cidades e facções vindas do Mestre */
    if (resp.mudancas) {
      const md = resp.mudancas;
      let mp = { cidades: [...(mapaRef.current.cidades || [])], faccoes: [...(mapaRef.current.faccoes || [])] };
      let mudouMapa = false;
      (md.mapa_cidades || []).forEach((cd) => {
        if (!cd || !cd.nome) return;
        const i = mp.cidades.findIndex((c) => c.nome.toLowerCase() === cd.nome.toLowerCase());
        if (i === -1) { mp.cidades.push(criarCidade(cd.nome, cd)); msgs.push(`🗺 ${cd.nome} registrada no mapa`); }
        else mp.cidades[i] = { ...mp.cidades[i], ...cd, x: mp.cidades[i].x, y: mp.cidades[i].y };
        mudouMapa = true;
      });
      (md.mapa_faccoes || []).forEach((fc) => {
        if (!fc || !fc.nome) return;
        const i = mp.faccoes.findIndex((f) => f.nome.toLowerCase() === fc.nome.toLowerCase());
        if (i === -1) mp.faccoes.push(criarFaccao(fc.nome, fc));
        else mp.faccoes[i] = { ...mp.faccoes[i], ...fc };
        if (fc.doJogador) faccaoJogadorRef.current = fc.nome;
        mudouMapa = true;
      });
      if (md.cidade_atual) {
        cidadeAtualRef.current = md.cidade_atual;
        /* CHEGADA: registrar uma cidade encerra a jornada — a partir daqui eu
           ESTOU nessa cidade (e o descanso pode ser em estalagem/aposentos). */
        if (jornadaRef.current) {
          jornadaRef.current = null; setJornada(null);
          msgs.push(`🧭 Chegada: agora você está em ${md.cidade_atual}.`);
        }
      }
      if (md.jornada_meio && jornadaRef.current) {
        jornadaRef.current = { ...jornadaRef.current, meio: String(md.jornada_meio).slice(0, 40) };
        setJornada(jornadaRef.current);
      }
      if (md.faccao_jogador) faccaoJogadorRef.current = md.faccao_jogador;
      if (mudouMapa) { mapaRef.current = mp; setMapa(mp); }
    }
    /* MISSÕES E ARCO: registra quests e avanço de ato vindos do Mestre */
    if (resp.mudancas) {
      const md2 = resp.mudancas;
      let recompensaContrato = null; // contratos pagos por código ao concluir
      [].concat(md2.quest_nova || []).forEach((q) => {
        if (!q || !q.titulo) return;
        if (questsRef.current.some((x) => x.titulo.toLowerCase() === q.titulo.toLowerCase())) return;
        questsRef.current = [...questsRef.current, { titulo: q.titulo, descricao: q.descricao || "", objetivo: q.objetivo || "", tipo: q.tipo === "principal" ? "principal" : "secundaria", status: "ativa", nota: "" }];
        msgs.push(`📜 Nova missão${q.tipo === "principal" ? " PRINCIPAL" : ""}: ${q.titulo}`);
      });
      /* EVENTO GLOBAL resolvido na ficção: o mestre encerra o arco maior */
      if (md2.evento_global_encerrar && eventosRef.current.global) {
        const g = eventosRef.current.global;
        eventosRef.current = { ...eventosRef.current, global: null, semGlobalDesde: diaRef.current };
        setEventos(eventosRef.current);
        msgs.push(`🌍 ${g.nome}: desfecho alcançado — a região entra numa nova era.`);
      }
      [].concat(md2.quest_atualizar || []).forEach((q) => {
        if (!q || !q.titulo) return;
        questsRef.current = questsRef.current.map((x) => {
          if (x.titulo.toLowerCase() !== q.titulo.toLowerCase()) return x;
          const nova = { ...x, status: q.status || x.status, nota: q.nota !== undefined ? q.nota : x.nota };
          if (q.status === "concluida" && x.status !== "concluida") {
            msgs.push(`✓ Missão concluída: ${x.titulo}`);
            /* FÉ POR FEITOS (v7.4): missões concluídas espalham o nome do herói */
            if (divindadeRef.current && divindadeRef.current.despertar) {
              msgs.push(...ganharFe(x.tipo === "principal" ? 150 : 40, 2, "seu feito corre de boca em boca"));
            }
            /* CONTRATO: o pagamento sai por CÓDIGO no momento da conclusão */
            if (x.contrato && !recompensaContrato) recompensaContrato = x.contrato;
          }
          else if (q.status === "falhada" && x.status !== "falhada") msgs.push(`✗ Missão falhou: ${x.titulo}`);
          else if (q.nota) msgs.push(`📜 ${x.titulo}: ${q.nota}`);
          return nova;
        });
      });
      if (recompensaContrato) {
        bumpCont("contratosConcluidos");
        const r = recompensaContrato;
        const p2 = aplicarNivel({ ...pers, moedas: (pers.moedas || 0) + r.moedas, xp: (pers.xp || 0) + r.xp });
        msgs.push(`📋 Contrato pago pelo sistema: +${r.moedas} moedas · +${r.xp} XP`);
        pers = p2; setPersonagem(p2);
        notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[CONTRATO PAGO pelo sistema: +${r.moedas} moedas e +${r.xp} XP — NÃO envie moedas nem xp por esse serviço, seria dobrado.]`;
        recompensaContrato = null;
      }
      if (md2.historia_avancar) {
        const h = historiaRef.current;
        const est = estruturaPorId(h.estrutura);
        if ((h.etapa || 0) < est.etapas.length - 1) {
          h.etapa = (h.etapa || 0) + 1;
          msgs.push(`📖 A história avança — ${est.nome}: "${est.etapas[h.etapa].nome}" (${h.etapa + 1}/${est.etapas.length})`);
        }
      }
      setQuests([...questsRef.current]);
    }
    /* FÉ (v7.4): o Mestre registra ganhos narrados ("fe":{"fieis":N,"pf":N,
       "dominio":"...","patrono":"..."}); o sistema soma, recalcula o GD e
       anuncia degraus. PF negativo = milagre cobrado pelo sistema. */
    if (resp.mudancas && resp.mudancas.fe && typeof resp.mudancas.fe === "object" && divindadeRef.current && divindadeRef.current.despertar) {
      const fe = resp.mudancas.fe;
      const fieis = Math.round(Number(fe.fieis) || 0), pf = Math.round(Number(fe.pf) || 0);
      if (fieis || pf) msgs.push(...ganharFe(Math.max(-50, Math.min(1000, fieis)), Math.max(-60, Math.min(60, pf)), "registrado pelo Mestre"));
      const dv = { ...divindadeRef.current };
      let tocou = false;
      if (fe.dominio && !dv.dominio) { dv.dominio = String(fe.dominio).slice(0, 60); tocou = true; msgs.push(`🌌 Domínio revelado: ${dv.dominio}`); }
      if (fe.patrono && !dv.patrono) { dv.patrono = String(fe.patrono).slice(0, 60); tocou = true; }
      if (tocou) { divindadeRef.current = dv; setDivindade(dv); }
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
      /* rede de segurança do MAPA: se o cânone registra um lugar (tipo local/
         cidade/vila/capital), garante que ele exista no mapa mesmo que o Mestre
         não tenha enviado "mapa_cidades". Assim o mapa nunca fica vazio. */
      let mp2 = mapaRef.current, tocouMapa = false;
      for (const [nome, ficha] of Object.entries(c)) {
        const tipo = (ficha.tipo || "").toLowerCase();
        const ehLugar = ["local", "cidade", "vila", "capital", "fortaleza", "vilarejo", "povoado", "reduto", "ruína"].some((t) => tipo.includes(t));
        if (!ehLugar) continue;
        if (!(mp2.cidades || []).some((cc) => cc.nome.toLowerCase() === nome.toLowerCase())) {
          if (!tocouMapa) { mp2 = { cidades: [...(mp2.cidades || [])], faccoes: [...(mp2.faccoes || [])] }; tocouMapa = true; }
          mp2.cidades.push(criarCidade(nome, { tipo: tipo.includes("capital") ? "capital" : tipo.includes("vila") || tipo.includes("povoado") ? "vila" : "cidade", regiao: ficha.local || "", faccao: ficha.faccao || null, notas: ficha.notas || "" }));
          msgs.push(`🗺 ${nome} surgiu no mapa`);
        }
      }
      if (tocouMapa) { mapaRef.current = mp2; setMapa(mp2); }
      systemRef.current = montarSystemPrompt(nomeCampanha, mundo, pers, livroRef.current, c, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade());
    }
    /* PESSOAS (registro de NPCs): o Mestre envia "npcs"; e como blindagem de
       memória, qualquer PESSOA do cânone sem ficha entra no registro por código. */
    if (resp.mudancas) {
      npcTurnoRef.current += 1;
      let reg = npcsRef.current;
      let tocou = false;
      [].concat(resp.mudancas.npcs || []).forEach((n) => {
        if (!n || !n.nome) return;
        const chave = Object.keys(reg).find((k) => k.toLowerCase() === String(n.nome).toLowerCase());
        const ficha = chave
          ? mesclarNPC(reg[chave], { ...n, ultimaVez: npcTurnoRef.current, conhecidoEm: reg[chave].conhecidoEm != null ? reg[chave].conhecidoEm : diaRef.current })
          : criarNPC(n.nome, { ...n, ultimaVez: npcTurnoRef.current, conhecidoEm: n.conhecidoEm != null ? n.conhecidoEm : diaRef.current });
        if (!tocou) { reg = { ...reg }; tocou = true; }
        reg[chave || n.nome] = ficha;
        if (!chave) msgs.push(`👤 ${n.nome} entrou para o elenco`);
      });
      for (const [nome, f] of Object.entries(canoneRef.current || {})) {
        if (!f || !String(f.tipo || "").toLowerCase().includes("pessoa")) continue;
        if (Object.keys(reg).some((k) => k.toLowerCase() === nome.toLowerCase())) continue;
        if (!tocou) { reg = { ...reg }; tocou = true; }
        reg[nome] = criarNPC(nome, { papel: f.papel || "", genero: f.genero || "", local: f.local || "", status: f.status || "vivo", notas: f.notas || "", ultimaVez: npcTurnoRef.current, conhecidoEm: diaRef.current });
      }
      if (tocou) {
        npcsRef.current = reg; setNpcs(reg);
        systemRef.current = montarSystemPrompt(nomeCampanha, mundo, pers, livroRef.current, canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade());
      }
    }
    setPersonagem(pers);
    /* combate: processa de forma síncrona (via ref) para as mensagens saírem na ordem certa */
    if (resp.mudancas) {
      const combateAntes = combateRef.current;
      resp.mudancas.__nivelJogador = pers.nivel || 1;
      const novoCombate = processarCombate(combateRef.current, resp.mudancas, msgs);
      combateRef.current = novoCombate;
      setCombate(novoCombate);
      /* PRESENÇA DIVINA (v7.4 — COM MODERAÇÃO): só dispara quando uma
         divindade de verdade (GD 3+) entra em cena E supera o jogador por
         2+ degraus. Uma vez por combate, resistência por código. Proteções:
         itens consagrados/benção ajudam; companheiros de vínculo 4+ são
         imunes (a convivência com o herói os acostumou ao impossível). */
      if (!combateAntes && combateRef.current && (combateRef.current.inimigos || []).some((e) => (e.gd || 0) >= 3)) {
        const div = (combateRef.current.inimigos || []).filter((e) => (e.gd || 0) >= 3).sort((a, b) => (b.gd || 0) - (a.gd || 0))[0];
        const gdJP = grauDe(divindadeRef.current);
        if ((div.gd || 0) - gdJP >= 2) {
          const cd = 10 + 2 * (div.gd || 0);
          const rolo = () => 1 + Math.floor(Math.random() * 20);
          const protegido = (ent) => [...(ent.equipados ? Object.values(ent.equipados) : []), ...(ent.inventario || [])].some((it) => it && /consagrad|abençoad|abencoad|sagrad|divin/i.test(it.nome || ""));
          /* jogador */
          const bonusJ = Math.max(pers.atributos?.vigor || 0, pers.atributos?.presenca || 0) + (protegido(pers) ? 4 : 0) + (pers.nivel >= 15 ? 2 : 0);
          const rJ = rolo() + bonusJ;
          if (rJ < cd) {
            const efeito = ["Amedrontado", "Cego", "Confuso"][Math.floor(Math.random() * 3)];
            pers = { ...pers, condicoes: [...(pers.condicoes || []), { nome: efeito, origem: `presença de ${div.nome}` }] };
            msgs.push(`🌑 A presença de ${div.nome} (GD ${div.gd}) esmaga o ar: você resiste (${rJ} vs ${cd})… e falha — ${efeito.toLowerCase()} neste combate (desvantagem).`);
            notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[PRESENÇA DIVINA — sistema rolou] Eu falhei na resistência contra a presença de ${div.nome} (GD ${div.gd}): estou ${efeito.toLowerCase()} (desvantagem) neste combate. Narre o peso avassalador da divindade — mas o efeito mecânico já foi aplicado, não aplique outro.`;
          } else {
            msgs.push(`🌑 A presença de ${div.nome} (GD ${div.gd}) pesa como chumbo — você firma os pés e RESISTE (${rJ} vs ${cd}).`);
          }
          /* companheiros: vínculo 4+ imune; itens consagrados dão +4 */
          const novosGrupo = (pers.grupo || []).map((g) => {
            if ((g.vinculo ?? 0) >= 4) return g;
            const rG = rolo() + Math.max(g.atributos?.vigor || 0, 1) + (protegido(g) ? 4 : 0);
            if (rG >= cd) return g;
            msgs.push(`🌑 ${g.nome} não suporta olhar para ${div.nome} — fica amedrontado neste combate.`);
            return { ...g, condicoes: [...(g.condicoes || []), { nome: "Amedrontado", origem: `presença de ${div.nome}` }] };
          });
          pers = { ...pers, grupo: novosGrupo };
          setPersonagem(pers);
        }
      }
      /* CÓDEX: toda criatura que entra em combate vira registro no bestiário */
      (resp.mudancas.combate_iniciar || []).forEach((ini) => {
        if (ini?.nome && !descobRef.current.some((d) => d.toLowerCase() === ini.nome.toLowerCase())) {
          descobRef.current = [...descobRef.current, ini.nome];
          setDescobertas(descobRef.current);
        }
      });
      /* HUD FANTASMA: se o painel de combate está aberto mas ninguém troca golpes
         (o Mestre seguiu a narrativa sem encerrar), o app fecha sozinho após 2
         turnos parados. Evita o combate "preso" na tela por vários turnos. */
      if (combateRef.current) {
        const houveIniciar = Array.isArray(resp.mudancas.combate_iniciar) && resp.mudancas.combate_iniciar.length > 0;
        const houveDano = Array.isArray(resp.mudancas.combate_inimigo_vida) && resp.mudancas.combate_inimigo_vida.length > 0;
        const houveAtaqueMeu = ataqueResolvidoRef.current;
        if (houveIniciar || houveDano || houveAtaqueMeu) combateOciosoRef.current = 0;
        else combateOciosoRef.current += 1;
        if (combateOciosoRef.current >= 2) {
          combateOciosoRef.current = 0;
          combateRef.current = null; setCombate(null);
          msgs.push("⚔ O confronto se dissolve — o painel de combate se fecha.");
        }
      } else combateOciosoRef.current = 0;
      ataqueResolvidoRef.current = false;
      /* vitória detectada por código: pede ao Mestre os espólios se ele ainda
         não os deu neste turno (evita esperar ele "perceber" a morte) */
      if (resp.mudancas.__vitoriaAuto) {
        /* ESPÓLIOS POR CÓDIGO: moedas e XP por tabela; nível sobe sozinho.
           A IA só narra — e cria o item quando o app decide que caiu um. */
        const esp = gerarEspolios(resp.mudancas.__inimigosFinais || []);
        let p2 = { ...pers, moedas: (pers.moedas || 0) + esp.moedas, xp: (pers.xp || 0) + esp.xp };
        let subiu = 0;
        while (p2.xp >= XP_POR_NIVEL(p2.nivel)) { p2.xp -= XP_POR_NIVEL(p2.nivel); p2.nivel += 1; p2.nivelPendentes = (p2.nivelPendentes || 0) + 1; subiu++; }
        p2.grupo = (p2.grupo || []).map((g) => { const ev = evoluirCompanheiro({ ...g, xp: (g.xp || 0) + esp.xp }); const m2 = ev._subiu; delete ev._subiu; if (m2) msgs.push(`✦ ${g.nome} subiu para o nível ${ev.nivel}!`); return ev; });
        msgs.push(`◉ Espólios: +${esp.moedas} moedas · +${esp.xp} XP${subiu ? ` · ✦ NÍVEL ${p2.nivel}!` : ""}`);
        pers = p2;
        setPersonagem(p2);
        /* CÓDEX: contabiliza a vitória — combate vencido + abates por ameaça */
        const fins = resp.mudancas.__inimigosFinais || [];
        bumpCont("combatesVencidos", 1);
        avancarMinutos(MINUTOS_POS_COMBATE); // a luta em si é rápida; o rescaldo leva meia hora
        bumpCont("inimigosDerrotados", fins.length);
        bumpCont("elitesDerrotados", fins.filter((e) => e.ameaca === "elite").length);
        bumpCont("lendariosDerrotados", fins.filter((e) => e.ameaca === "lendario").length);
        checarFama(); tentarSurgirNemesis(); // grandes feitos fazem o nome correr — e atraem ódio
        /* VÍNCULO: sangue derramado junto aproxima (+2 para todo o grupo) */
        p2 = { ...p2, grupo: aplicarVinculo(p2.grupo, "todos", 2, msgs) };
        /* LOOT PROCEDURAL: quando cai item, o CÓDIGO gera pela tabela (a IA só
           descreve o achado — não inventa mais equipamento de vitória) */
        let itemCaido = null;
        if (esp.caiItem) {
          itemCaido = gerarEspolioItem(resp.mudancas.__inimigosFinais || [], p2.nivel || 1);
          p2 = { ...p2, equipamento: [...(p2.equipamento || []), itemCaido] };
          msgs.push(`✦ Espólio raro: ${itemCaido.nome} (${RARIDADE_ROTULO[itemCaido.raridade] || itemCaido.raridade}) — na mochila de equipamentos`);
        }
        /* MASMORRA: vitória na sala do CHEFE conclui a masmorra por código —
           moedas do fundo + item épico/lendário garantido */
        let chefeCaido = false;
        if (masmorraRef.current && masmorraRef.current.salas[masmorraRef.current.idx] && masmorraRef.current.salas[masmorraRef.current.idx].tipo === "chefe") {
          const mm = masmorraRef.current;
          const sala = mm.salas[mm.idx];
          const rec = recompensaChefe(p2.nivel || 1);
          p2 = { ...p2, moedas: (p2.moedas || 0) + (sala.moedas || 0), equipamento: [...(p2.equipamento || []), rec.item] };
          msgs.push(`🕳 ${mm.nome} CONCLUÍDA! Tesouro do fundo: +${sala.moedas} moedas · ✦ ${rec.item.nome} (${RARIDADE_ROTULO[rec.item.raridade] || rec.item.raridade})`);
          masmorraRef.current = null; setMasmorra(null);
          bumpCont("masmorrasConcluidas");
          chefeCaido = true;
        }
        pers = p2;
        setPersonagem(p2);
        notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[VITÓRIA — espólios já aplicados pelo sistema: +${esp.moedas} moedas e +${esp.xp} XP para todos] NÃO envie moedas nem xp (seria dobrado). Narre o desfecho da luta em 2-3 frases.${itemCaido ? ` O SISTEMA derrubou um item: "${itemCaido.nome}" (${itemCaido.raridade}${itemCaido.poder ? `, poder: ${itemCaido.poder}` : ""}) — já está na minha mochila, NÃO envie "adicionar_equipamento" nem "adicionar_itens". Apenas descreva o achado com emoção, coerente com os inimigos derrotados.` : " Nenhum item especial desta vez — não envie itens."}${chefeCaido ? " A MASMORRA FOI CONCLUÍDA e o tesouro do chefe já foi entregue pelo sistema — narre a saída triunfal e retome o mundo lá fora." : ""}`;
      }
    }
    /* detector de repetição: mede se o Mestre voltou a usar interrupção urgente */
    {
      const nrt = (resp.narrativa || "").toLowerCase();
      const marcas = /irromp|invade o|invadem o|arromb/.test(nrt)
        || /(porta|portas)[^.]{0,40}(se abre|se abrem|escancar)/.test(nrt)
        || /(mensageiro|arauto|batedor|soldado)[^.]{0,40}(ofegante|corre|irrompe|chega gritando)/.test(nrt)
        || /(arrast|jogam|atiram)[^.]{0,40}(aos seus pés|para dentro)/.test(nrt)
        || /(urgênc|urgente|emergênc|com pressa|sem fôlego)/.test(nrt)
        || /(interromp|é rompid|foi rompid|se lança (pelo|para)|surge de repente|de súbito)/.test(nrt);
      urgenciaRef.current = marcas ? urgenciaRef.current + 1 : 0;
    }
    pushMsgs([{ autor: "mestre", texto: resp.narrativa || "…" }, ...msgs.map((t) => ({ autor: "sistema", texto: t }))]);
    /* decisor de testes por código: se a dificuldade é trivial para o herói
       (modificador torna a falha impossível), nem mostra o dado — sucesso direto */
    let rolagemFinal = resp.rolagem || null;
    if (rolagemFinal && rolagemFinal.dificuldade != null) {
      const attrT = ATRIBUTOS.find((x) => x.nome.toLowerCase() === (rolagemFinal.atributo || "").toLowerCase());
      const modT = attrT ? atributoEfetivo(pers, attrT.id) : 0;
      if (avaliarTeste(modT, rolagemFinal.dificuldade) === "auto") rolagemFinal = { ...rolagemFinal, auto: true };
    }
    setSugestoes(rolagemFinal ? [] : (resp.sugestoes || []));
    setRolagem(rolagemFinal);
    /* CÓDEX: novos companheiros, quase-morte e checagem de conquistas do turno */
    {
      const antes = (persAtual.grupo || []).length, agora = (pers.grupo || []).length;
      if (agora > antes) bumpCont("recrutados", agora - antes);
      let tocouVinculo = false;
      /* VÍNCULO: chegar a 0 PV e sobreviver une o grupo (+4); deixar um
         companheiro cair pesa (−6 só para quem caiu) */
      if ((persAtual.vida || 0) > 0 && (pers.vida || 0) <= 0) {
        bumpCont("quaseMorte", 1);
        pers = { ...pers, grupo: aplicarVinculo(pers.grupo, "todos", 4, null) };
        /* CICATRIZ (v6.6): sobreviver por um fio pode deixar marca permanente */
        if (Math.random() < 0.45 && (pers.cicatrizes || []).length < CICATRIZ_MAX) {
          const c = sortearCicatriz(pers.cicatrizes || []);
          if (c) {
            const vidaMax = Math.max(5, (pers.vidaMax || 10) + (c.vidaMax || 0));
            pers = { ...pers, cicatrizes: [...(pers.cicatrizes || []), { ...c, dia: diaRef.current }], vidaMax, vida: Math.min(pers.vida, vidaMax) };
            pushMsgs([{ autor: "sistema", texto: `🩸 Cicatriz permanente: ${c.nome} — ${c.descricao}${c.vidaMax ? ` (−${-c.vidaMax} PV máx.)` : ""}` }]);
            notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[CICATRIZ — CANON PERMANENTE] Quase morri e fiquei com uma marca para sempre: "${c.nome}" (${c.local}), no dia ${diaRef.current} da campanha. ${c.descricao} Isso agora faz parte do meu corpo e da minha história — pode ser lembrado, comentado e ter consequências na ficção, mas NUNCA some sozinho.`;
          }
        }
        tocouVinculo = true;
      }
      (pers.grupo || []).forEach((g) => {
        const antesG = (persAtual.grupo || []).find((a) => a.nome === g.nome);
        if (antesG && (antesG.vida || 0) > 0 && (g.vida || 0) <= 0) {
          pers = { ...pers, grupo: aplicarVinculo(pers.grupo, g.nome, -6, null) };
          tocouVinculo = true;
        }
      });
      if (tocouVinculo) setPersonagem(pers);
      checarConquistas(pers);
    }
    return pers;
  }, [pushMsgs]);

  /* FISCAL DE MISSÕES (v7.3.2): o Mestre às vezes esquece de mandar
     "quest_atualizar" quando a missão se encerra na ficção — a criação ia bem,
     mas o andamento e a conclusão morriam. Agora, depois de cada turno, um
     juiz BARATO (modelo "leve", temperatura baixa) lê só as missões ativas +
     a narrativa do turno e o SISTEMA decreta o que terminou. Conservador de
     propósito: só conclui com cumprimento claro; listas vazias são comuns. */
  const fiscalizarQuests = async (pers, narrativa) => {
    const ativas = questsRef.current.filter((q) => q.status === "ativa");
    if (!ativas.length || !narrativa || narrativa.length < 60) return;
    try {
      const sys = [
        "Você é o FISCAL DE MISSÕES de um RPG. Você NÃO narra: apenas julga o destino das missões ativas com base na narrativa do turno.",
        "Responda APENAS em JSON: {\"concluidas\":[\"titulo exato\"],\"falhadas\":[\"titulo exato\"],\"progresso\":[{\"titulo\":\"...\",\"nota\":\"resumo curto do avanço\"}],\"global_encerrado\":false}",
        "REGRAS: (1) só marque \"concluida\" se o objetivo foi CUMPRIDO de fato e sem dúvida na narrativa deste turno (ou em turnos recentes descritos nela); (2) \"falhada\" só se ficou impossível ou foi explicitamente perdida; (3) avanço parcial real vira \"progresso\" com nota curta; (4) na dúvida, NÃO marque nada — listas vazias são uma resposta válida e comum; (5) copie os títulos EXATAMENTE como listados; (6) \"global_encerrado\": true SÓ se o EVENTO GLOBAL listado (se houver) foi RESOLVIDO de fato e sem dúvida neste turno — a ameaça central derrotada/desfeita, não apenas um avanço.",
      ].join("\n");
      const lista = ativas.map((q) => `- "${q.titulo}" (${q.tipo}) — objetivo: ${q.objetivo || q.descricao || "—"}`).join("\n");
      const evG = eventosRef.current && eventosRef.current.global;
      const user = `MISSÕES ATIVAS:\n${lista}\n\nEVENTO GLOBAL ATIVO:\n${evG ? `- "${evG.nome}" — ${(evG.etapas || [])[evG.etapa] || evG.descricao || "—"}` : "(nenhum)"}\n\nNARRATIVA DO TURNO:\n${narrativa}`;
      const txt = await chamarModelo(sys, [{ role: "user", content: user }], 350, "json", "leve");
      const r = parseObjetoTolerante(txt);
      if (!r) return;
      const casar = (t) => {
        const alvo = String(t || "").toLowerCase();
        if (!alvo) return null;
        return ativas.find((q) => q.titulo.toLowerCase() === alvo)
          || (alvo.length > 8 ? ativas.find((q) => q.titulo.toLowerCase().includes(alvo) || alvo.includes(q.titulo.toLowerCase())) : null);
      };
      const msgs = [];
      let p = pers;
      let recompensa = null;
      [].concat(r.concluidas || []).forEach((t) => {
        const q = casar(t); if (!q) return;
        questsRef.current = questsRef.current.map((x) => x.titulo === q.titulo ? { ...x, status: "concluida" } : x);
        msgs.push(`✓ Missão concluída: ${q.titulo} (reconhecida pelo sistema)`);
        if (divindadeRef.current && divindadeRef.current.despertar) msgs.push(...ganharFe(q.tipo === "principal" ? 150 : 40, 2, "seu feito corre de boca em boca"));
        if (q.contrato && !recompensa) recompensa = q.contrato;
      });
      [].concat(r.falhadas || []).forEach((t) => {
        const q = casar(t); if (!q) return;
        questsRef.current = questsRef.current.map((x) => x.titulo === q.titulo ? { ...x, status: "falhada" } : x);
        msgs.push(`✗ Missão falhou: ${q.titulo} (reconhecida pelo sistema)`);
      });
      [].concat(r.progresso || []).forEach((pr) => {
        if (!pr || !pr.titulo || !pr.nota) return;
        const q = casar(pr.titulo); if (!q) return;
        questsRef.current = questsRef.current.map((x) => x.titulo === q.titulo ? { ...x, nota: String(pr.nota).slice(0, 120) } : x);
        msgs.push(`📜 ${q.titulo}: ${pr.nota}`);
      });
      /* EVENTO GLOBAL fechado POR CÓDIGO (v7.4.1): o Mestre esquecia de mandar
         "evento_global_encerrar" e o arco de fundo nunca terminava */
      if (r.global_encerrado === true && eventosRef.current && eventosRef.current.global) {
        const g = eventosRef.current.global;
        eventosRef.current = { ...eventosRef.current, global: null, semGlobalDesde: diaRef.current };
        setEventos(eventosRef.current);
        msgs.push(`🌍 ${g.nome}: desfecho alcançado (reconhecido pelo sistema) — a região entra numa nova era.`);
        if (divindadeRef.current && divindadeRef.current.despertar) msgs.push(...ganharFe(500, 10, "uma era inteira reza seu nome"));
        notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[EVENTO GLOBAL "${g.nome}" ENCERRADO pelo sistema — NÃO o continue nem o encerre de novo: a região vive a nova era. O gerador semeará um arco novo quando chegar a hora.]`;
      }
      if (recompensa) {
        /* CONTRATO: mesmo pagamento por CÓDIGO do fluxo normal — nunca dobrado,
           porque o Mestre é avisado na próxima mensagem via nota do sistema */
        bumpCont("contratosConcluidos");
        p = aplicarNivel({ ...p, moedas: (p.moedas || 0) + recompensa.moedas, xp: (p.xp || 0) + recompensa.xp });
        msgs.push(`📋 Contrato pago pelo sistema: +${recompensa.moedas} moedas · +${recompensa.xp} XP`);
        notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[CONTRATO PAGO pelo sistema: +${recompensa.moedas} moedas e +${recompensa.xp} XP — NÃO envie moedas nem xp por esse serviço, seria dobrado. A missão já consta como concluída no diário, não a conclua de novo.]`;
      }
      if (msgs.length) {
        setQuests([...questsRef.current]);
        setPersonagem(p);
        pushMsgs(msgs.map((t) => ({ autor: "sistema", texto: t })));
        salvar({ personagem: p });
      }
    } catch { /* o fiscal NUNCA atrapalha o jogo — falhou, vida segue */ }
  };

  /* ESCRIBA DO MUNDO (v7.3.4): o cânone só guardava o que o Mestre registrava
     por vontade própria — e ele esquecia (o "Berço", disco de ossos da câmara,
     virou "composição de 7 poderes" porque ninguém anotou). Agora um escriba
     BARATO (modelo leve) lê a narrativa e REGISTRA POR CÓDIGO os fatos
     duráveis: artefatos e objetos importantes (o que É, aparência, origem),
     pessoas, lugares, promessas e segredos. Fusão conservadora: NUNCA
     reescreve ficha existente — só cria novas ou preenche campos vazios. */
  const escribaDoMundo = async (pers, narrativa) => {
    if (!narrativa || narrativa.length < 80) return;
    try {
      const sys = [
        "Você é o ESCRIBA de um RPG. Você NÃO narra: extrai FATOS DURÁVEIS da narrativa que merecem memória permanente.",
        "Responda APENAS em JSON: {\"canone\":{\"Nome da Entidade\":{\"tipo\":\"artefato|pessoa|lugar|promessa|segredo|organizacao\",\"descricao\":\"o que é, em 1 frase factual\",\"detalhes\":\"aparência/origem/dono, se houver\",\"local\":\"onde está, se fizer sentido\"}},\"pessoas\":[{\"nome\":\"\",\"papel\":\"\",\"relacao\":\"aliado|amigo|romance|familia|neutro|rival|inimigo\",\"local\":\"\",\"notas\":\"máx. 8 palavras\"}],\"fe\":{\"fieis\":0,\"pf\":0,\"motivo\":\"\"}}",
        "REGRAS: (1) registre ARTEFATOS e OBJETOS RELEVANTES que o herói ganhou, achou ou descobriu (reliquias, itens nomeados, mapas, chaves, documentos) — com o que o objeto É de fato; saque comum (poção genérica, moedas) NÃO entra; (2) \"pessoas\": registre pessoas COM NOME e papel durável na história (aliados recorrentes, rivais, contatos) — figurantes de cena única ficam de fora; (3) NÃO reescreva nem contradiga fichas que já existem no CÂNONE ATUAL ou no ELENCO — se já existe, só inclua se houver campo NOVO a acrescentar; (4) eventos passageiros, clima e cenas sem fato durável ficam de fora; (5) \"fe\": SÓ se a narrativa deste turno mostrou o nome do herói ganhando DEVOÇÃO real (gente rezando em seu nome, santuário erguido, conversões, milagre testemunhado por multidão) — fieis = novos devotos (10 a 500), pf = 1 a 10; na dúvida, deixe 0; (6) {\"canone\":{},\"pessoas\":[],\"fe\":{\"fieis\":0,\"pf\":0}} é resposta válida e frequente.",
      ].join("\n");
      const user = `CÂNONE ATUAL:\n${formatarCanone(canoneRef.current) || "(vazio)"}\n\nELENCO (pessoas já registradas):\n${Object.keys(npcsRef.current).join(", ") || "(ninguém)"}\n\nNARRATIVA DO TURNO:\n${narrativa}`;
      const txt = await chamarModelo(sys, [{ role: "user", content: user }], 800, "json", "leve");
      const r = parseObjetoTolerante(txt);
      if (!r || typeof r !== "object") return;
      /* PESSOAS → ELENCO (v7.4.1): nomes importantes viram fichas do sistema,
         não dependem da boa vontade do Mestre — fusão conservadora */
      const msgsExtra = [];
      if (Array.isArray(r.pessoas) && r.pessoas.length) {
        let reg = npcsRef.current, tocou = false;
        r.pessoas.slice(0, 4).forEach((n) => {
          if (!n || !n.nome) return;
          const chave = Object.keys(reg).find((k) => k.toLowerCase() === String(n.nome).toLowerCase());
          if (!tocou) { reg = { ...reg }; tocou = true; }
          if (chave) reg[chave] = mesclarNPC(reg[chave], n);
          else { reg[String(n.nome).slice(0, 40)] = criarNPC(String(n.nome).slice(0, 40), { ...n, conhecidoEm: diaRef.current }); msgsExtra.push(`✒ Escriba registrou no elenco: ${n.nome}`); }
        });
        if (tocou) { npcsRef.current = reg; setNpcs(reg); }
      }
      /* FÉ TESTEMUNHADA (v7.4.1): devoção narrada vira fiéis/PF por código */
      if (r.fe && typeof r.fe === "object" && divindadeRef.current && divindadeRef.current.despertar) {
        const f = Math.max(0, Math.min(500, Math.round(r.fe.fieis || 0)));
        const p = Math.max(0, Math.min(10, Math.round(r.fe.pf || 0)));
        if (f || p) msgsExtra.push(...ganharFe(f, p, String(r.fe.motivo || "sua fama vira prece").slice(0, 80)));
      }
      if (!r.canone || typeof r.canone !== "object") {
        if (msgsExtra.length) { systemRef.current = montarSystemPrompt(nomeCampanha, mundo, pers, livroRef.current, canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade()); pushMsgs(msgsExtra.map((t) => ({ autor: "sistema", texto: t }))); salvar({ personagem: pers }); }
        return;
      }
      const c = { ...canoneRef.current };
      const novos = [];
      for (const [nome, ficha] of Object.entries(r.canone)) {
        if (!nome || !ficha || typeof ficha !== "object") continue;
        const chaveExistente = Object.keys(c).find((k) => k.toLowerCase() === String(nome).toLowerCase());
        if (!chaveExistente) {
          c[String(nome)] = { ...ficha, registradoDia: diaRef.current };
          novos.push(nome);
        } else {
          /* só preenche o que estiver vazio — identidade NUNCA é reescrita */
          const alvo = { ...c[chaveExistente] };
          for (const [k, v] of Object.entries(ficha)) {
            if (v && (alvo[k] === undefined || alvo[k] === "")) alvo[k] = v;
          }
          c[chaveExistente] = alvo;
        }
      }
      if (!novos.length && !msgsExtra.length) return;
      canoneRef.current = c;
      /* o prompt precisa enxergar o fato novo já no PRÓXIMO turno */
      systemRef.current = montarSystemPrompt(nomeCampanha, mundo, pers, livroRef.current, canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade());
      pushMsgs(novos.map((n) => ({ autor: "sistema", texto: `✒ Escriba registrou no cânone: ${n}` })).concat(msgsExtra.map((t) => ({ autor: "sistema", texto: t }))));
      salvar({ personagem: pers });
    } catch { /* o escriba NUNCA atrapalha o jogo */ }
  };

  /* GANHO DE FÉ POR CÓDIGO (v7.4): fiéis e PF mudam por aqui — e cada degrau
     de GD conquistado é anunciado e já entra no prompt do próximo turno. */
  const ganharFe = (fieis, pf, motivo) => {
    const dv = divindadeRef.current;
    if (!dv || !dv.despertar) return [];
    const antes = grauDe(dv);
    const novo = { ...dv, fieis: Math.max(0, dv.fieis + (fieis || 0)), pf: Math.max(0, dv.pf + (pf || 0)) };
    divindadeRef.current = novo; setDivindade(novo);
    const depois = grauDe(novo);
    const msgs = [];
    if (fieis) msgs.push(`${dv.iconeFe || "🙏"} ${fieis > 0 ? "+" : ""}${fieis} fiéis (${novo.fieis} no total)${motivo ? ` — ${motivo}` : ""}`);
    if (pf) msgs.push(`✨ ${pf > 0 ? "+" : ""}${pf} Pontos de Fé (${novo.pf} PF)`);
    if (depois > antes) {
      msgs.push(`🌟 ASCENSÃO! Seu nome ganha peso no cosmos: agora você é ${tituloDe(depois)} (GD ${depois}).`);
      systemRef.current = montarSystemPrompt(nomeCampanha, mundo, personagem, livroRef.current, canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade());
      notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[ASCENSÃO — REGISTRO DO SISTEMA] O jogador subiu para GD ${depois} (${tituloDe(depois)}). Isso é fato: narre os sinais dessa transformação aos poucos, à altura do marco.`;
    }
    return msgs;
  };

  /* DESPERTAR (v7.4): ao cruzar o nível NIVEL_DESPERTAR, o céu se abre —
     o panteão local nasce PRONTO pelo gerador e o jogador começa a jornada. */
  const checarDespertar = (pers, silencioso = false) => {
    const dv = divindadeRef.current;
    if (!dv || dv.despertar || (pers.nivel || 1) < NIVEL_DESPERTAR) return;
    const ctx = ctxMundo({ mundo, mapa: mapaRef.current, dia: diaRef.current });
    const panteao = gerarPanteaoInicial(ctx, diaRef.current);
    divindadeRef.current = { ...dv, despertar: true, panteao, fieis: Math.max(dv.fieis, 50), pf: dv.pf };
    setDivindade(divindadeRef.current);
    systemRef.current = montarSystemPrompt(nomeCampanha, mundo, pers, livroRef.current, canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade());
    if (silencioso) {
      /* SAVE VETERANO (v7.4.1): nível alto carregado do disco — o sistema
         abre a ascensão SEM cutucar o Mestre (evita dupla narração com o
         "Anteriormente…"); a ficha divina real se alinha no botão Recalibrar. */
      pushMsgs([{ autor: "sistema", texto: "🌟 Ascensão desbloqueada (nível " + (pers.nivel || 1) + "). Se sua lenda já te fez divindade na história, use ⚖ Recalibrar no painel Ascensão — o sistema lê sua jornada e ajusta GD, fiéis e domínio." }]);
      salvar({ personagem: pers });
      return;
    }
    pushMsgs([{ autor: "sistema", texto: "🌟 Você despertou — o cosmos passa a te enxergar. (Novo painel: Ascensão)" }]);
    const pan = panteao.map((d) => `${d.icone} ${d.nome} ${d.dominio} — GD ${d.gd} (${tituloDe(d.gd)}), ${d.temperamento}, culto: ${d.culto}`).join("; ");
    enviar(`[DESPERTAR DIVINO — MARCO REGISTRADO PELO SISTEMA] Ao alcançar o nível ${pers.nivel}, o nome do herói começou a ser sussurrado em orações: a ASCENSÃO começou. FATOS FIXOS sorteados pelo sistema: o jogador tem ${divindadeRef.current.fieis} fiéis iniciais (gente que já reza baixinho o nome dele) e GD 0→trilha aberta; o PANTEÃO local que ele agora consegue PERCEBER: ${pan}. Narre o despertar como um marco íntimo e arrepiado (um sinal, um olhar que se demora, uma prece espontânea de um estranho) — NÃO um show de poder: ele ainda é mortal (GD 0), mas o caminho dos três estágios (Servo Escolhido → Semideus → Nova Divindade) está aberto. As divindades acima já existiam — só agora ele as sente. Apresente UMA delas de leve neste turno.`, pers);
    salvar({ personagem: pers });
  };

  const enviar = useCallback(async (conteudo, persAtual, histBase) => {
    setCarregando(true); setFalha(null); setSugestoes([]);
    const nota = notaRef.current; notaRef.current = "";
    const corpo = nota ? `${nota}\n${conteudo}` : conteudo;
    /* RODAPÉ DO SISTEMA (v7.0.2): lembrete curto colado SÓ na mensagem atual
       (não fica no histórico — custo ~zero) reforçando as regras que o
       DeepSeek mais esquecia: relógio do sistema, proibição de inventar
       memórias, obediência ao cânone e narrativa sempre preenchida. */
    const estR = estacaoDe(diaRef.current);
    const rodape = `[RODAPÉ DO SISTEMA] Agora: ${dataTxt(diaRef.current)} (dia ${diaRef.current}), ${horaTxt(minutoRef.current)}${ehNoite(minutoRef.current) ? " (noite)" : ""}, ${estR.nome.toLowerCase()}. Local: ${localAtualTxt()}. Inviolável: (1) o tempo SÓ muda por envelope do sistema — nunca narre amanhecer, anoitecer ou horas passando por conta própria; (2) NUNCA invente memórias nem passado compartilhado que não esteja no cânone/registro de pessoas; (3) siga o cânone e o registro à risca; (4) o campo "narrativa" vem SEMPRE preenchido; (5) descanso/sono acontecem ONDE EU ESTOU — jamais me teleporte para aposentos ou cidade sem viagem narrada.${divindadeRef.current && divindadeRef.current.despertar ? " " + resumoAscensao(divindadeRef.current, (personagem && personagem.nivel) || 1) : ""}`;
    const base = histBase ?? historico;
    const novoHist = [...base, { role: "user", content: `${corpo}\n${rodape}` }];
    try {
      const resp = await chamarMestre(systemRef.current, novoHist);
      /* MEMÓRIA ENXUTA: no histórico vai SÓ a narrativa (dentro do molde JSON,
         para o modelo manter o formato). Antes ia o JSON completo com mudancas,
         sugestões e campos de combate — ~3× mais tokens por mensagem antiga,
         sem nenhum ganho de memória (os efeitos já vivem no estado do app). */
      const histFinal = [...base, { role: "user", content: corpo }, { role: "assistant", content: JSON.stringify({ narrativa: resp.narrativa || "" }) }];
      setHistorico(histFinal);
      const pers = aplicarResposta(resp, persAtual);
      /* ALTERNÂNCIA: se esta foi uma AÇÃO DO JOGADOR (não a vez do mundo, não combate,
         não acampamento), a próxima vez é OBRIGATORIAMENTE do mundo. */
      const foiVezDoMundo = ehAcaoMundoRef.current;
      ehAcaoMundoRef.current = false;
      /* após uma AÇÃO do jogador (que não seja já a vez do mundo), a próxima vez
         é do mundo. Responder+mover já conta como vez do mundo, então cai aqui
         como foiVezDoMundo=true e libera a barra normal. */
      if (!foiVezDoMundo && !combateRef.current && !acampadoRef.current && !resp.rolagem) setAguardandoMundo(true);
      else setAguardandoMundo(false);
      turnoContRef.current += 1;
      if (turnoContRef.current >= 8) {
        turnoContRef.current = 0;
        const narrativas = mensagensRef.current.filter((x) => x.autor === "mestre").map((x) => x.texto);
        gerarLivro(livroRef.current, narrativas).then((l) => {
          if (l) { livroRef.current = l; bancoNomesRef.current = gerarBancoNomes(mundo); systemRef.current = montarSystemPrompt(nomeCampanha, mundo, pers, l, canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade()); }
        });
      }
      setTimeout(() => salvar({ personagem: pers, historico: histFinal, rolagem: resp.rolagem || null, sugestoes: resp.rolagem ? [] : (resp.sugestoes || []) }), 0);
      /* FISCAL DE MISSÕES + ESCRIBA: correm em paralelo, sem travar o turno */
      fiscalizarQuests(pers, resp.narrativa);
      escribaDoMundo(pers, resp.narrativa);
      /* DESPERTAR: checa DEPOIS do turno (o XP do combate pode ter cruzado o nível) */
      setTimeout(() => checarDespertar(pers), 600);
    } catch (e) {
      notaRef.current = nota;
      setFalha({ conteudo, persAtual, histBase: base, motivo: (e && e.message) ? String(e.message) : "erro desconhecido" });
    } finally {
      setCarregando(false);
    }
  }, [historico, mensagens, aplicarResposta, salvar, nomeCampanha, mundo]);

  const retentar = () => { if (!falha) return; const f = falha; setFalha(null); enviar(f.conteudo, f.persAtual, f.histBase); };

  // ── Voz do Mestre (Fish Audio via /api/voz) ──
  const [voz, setVoz] = useState(null); // { i, status: "gerando" | "tocando" }
  const vozAudioRef = useRef(null);
  const vozCacheRef = useRef({}); // índice da mensagem -> objectURL (não cobra de novo)
  /* DESBLOQUEIO iOS/SAFARI (v7.3.1): o Safari só permite som dentro do gesto
     do toque — como o fetch da voz demora, o play() chegava "fora do gesto" e
     era negado ("not allowed by the user agent"). Solução: UM elemento de
     áudio persistente, destravado no instante do toque com um clique mudo de
     50ms; depois só trocamos o src e mandamos tocar — elemento já liberado. */
  const SILENT_WAV = "data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YSADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
  const obterAudioVoz = () => {
    if (!vozAudioRef.current) {
      vozAudioRef.current = new Audio();
      vozAudioRef.current.preload = "auto";
    }
    return vozAudioRef.current;
  };
  const pararVoz = () => {
    if (vozAudioRef.current) { try { vozAudioRef.current.pause(); } catch {} }
    setVoz(null);
  };
  const ouvirMestre = async (i, texto) => {
    if (voz && voz.i === i) { pararVoz(); return; } // tocar de novo = parar
    pararVoz();
    setVoz({ i, status: "gerando" });
    try {
      const audio = obterAudioVoz();
      /* ainda DENTRO do toque: destrava o elemento no Safari */
      try {
        audio.src = SILENT_WAV;
        audio.muted = true;
        const p = audio.play();
        if (p && p.catch) await p.catch(() => {});
        audio.pause();
        audio.muted = false;
        audio.currentTime = 0;
      } catch { /* segue — em desktop já funciona sem o truque */ }
      let url = vozCacheRef.current[i];
      if (!url) {
        const r = await fetch("/api/voz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto }),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.erro || `falha (${r.status})`);
        }
        url = URL.createObjectURL(await r.blob());
        vozCacheRef.current[i] = url;
      }
      audio.onended = () => setVoz(null);
      audio.onerror = () => setVoz(null);
      audio.src = url;
      await audio.play();
      setVoz({ i, status: "tocando" });
    } catch (e) {
      setVoz(null);
      pushMsgs([{ autor: "sistema", texto: `🔇 ${(e && e.message) || "Não consegui dar voz ao Mestre agora."}` }]);
    }
  };
  useEffect(() => () => { if (vozAudioRef.current) { try { vozAudioRef.current.pause(); } catch {} } Object.values(vozCacheRef.current).forEach((u) => { try { URL.revokeObjectURL(u); } catch {} }); }, []);

  const iniciar = (pers) => {
    setPersonagem(pers);
    livroRef.current = ""; turnoContRef.current = 0;
    canoneRef.current = {}; npcsRef.current = {}; setNpcs({}); npcTurnoRef.current = 0; definirAcampado(false);
    mapaRef.current = { cidades: [], faccoes: [] }; setMapa(mapaRef.current);
    faccaoJogadorRef.current = ""; cidadeAtualRef.current = "";
    jornadaRef.current = null; setJornada(null);
    eventosRef.current = { locais: [], global: null, semGlobalDesde: 0, seq: 1 }; setEventos(eventosRef.current);
    guildaRef.current = { nivel: 1, cofre: 0 }; setGuilda(guildaRef.current);
    contRef.current = { ...CONTADORES_INICIAIS };
    conqRef.current = { desbloqueadas: {}, ordem: [] }; setConquistas(conqRef.current);
    tituloAtivoRef.current = ""; setTituloAtivo("");
    descobRef.current = []; setDescobertas([]);
    masmorraRef.current = null; setMasmorra(null);
    muralRef.current = gerarMural((mundo && mundo.genero) || "Fantasia medieval", 1, { cidades: [], faccoes: [] }, 3); setMural(muralRef.current);
    decretosRef.current = []; setDecretos(decretosRef.current);
    diaRef.current = 1; setDia(1);
    minutoRef.current = AMANHECER + 60; setMinuto(minutoRef.current);
    acordouAbsRef.current = 0;
    nemesisRef.current = null; setNemesis(null);
    famaPatamarRef.current = 0;
    reinoRef.current = {}; setReino({});
    historiaRef.current = { estrutura: (mundo && mundo.estrutura) || "jornada", etapa: 0 };
    questsRef.current = []; setQuests([]);
    divindadeRef.current = garantirDivindade(null); setDivindade(divindadeRef.current);
    bancoNomesRef.current = gerarBancoNomes(mundo);
    systemRef.current = montarSystemPrompt(nomeCampanha, mundo, pers, "", {}, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade());
    mensagensRef.current = []; setMensagens([]); setHistorico([]); setSugestoes([]); setRolagem(null);
    setCombate(null); combateRef.current = null;
    setFase("jogo");
    enviar(`Comece a aventura: apresente o mundo com riqueza, situe meu personagem numa cena de abertura marcante com pelo menos um NPC interessante, e termine com um gancho que me convide a agir. (Minhas habilidades iniciais já foram concedidas pelo SISTEMA: ${(pers.habilidades || []).map((h) => h.nome).join(", ") || "nenhuma"} — NÃO envie "adicionar_habilidades".)`, pers, []);
  };

  const continuar = (comResumo) => {
    const sv = saveRef.current || temSave;
    if (!sv) { pushMsgs([{ autor: "sistema", texto: "Nenhuma aventura salva encontrada." }]); return; }
    try {
      const pers = migrarPersonagem(sv.personagem);
      setMundo(sv.mundo || { genero: "Fantasia medieval" }); setNomeCampanha(sv.nomeCampanha || "Aventura"); setPersonagem(pers);
      mensagensRef.current = Array.isArray(sv.mensagens) ? sv.mensagens : [];
      setMensagens(mensagensRef.current); setHistorico(Array.isArray(sv.historico) ? sv.historico : []);
      setSugestoes(sv.sugestoes || []); setRolagem(sv.rolagem || null);
      setCombate(sv.combate || null); combateRef.current = sv.combate || null;
      livroRef.current = sv.livro || ""; turnoContRef.current = 0;
      canoneRef.current = sv.canone && typeof sv.canone === "object" ? sv.canone : {};
      npcsRef.current = sv.npcs && typeof sv.npcs === "object" ? sv.npcs : {}; setNpcs(npcsRef.current); npcTurnoRef.current = 0;
      definirAcampado(!!sv.acampado);
      mapaRef.current = sv.mapa && sv.mapa.cidades ? sv.mapa : { cidades: [], faccoes: [] };
      setMapa(mapaRef.current);
      faccaoJogadorRef.current = sv.faccaoJogador || "";
      cidadeAtualRef.current = sv.cidadeAtual || "";
      guildaRef.current = sv.guilda && typeof sv.guilda === "object" ? { nivel: sv.guilda.nivel || 1, cofre: sv.guilda.cofre || 0 } : { nivel: 1, cofre: 0 }; setGuilda(guildaRef.current);
      climaRef.current = sv.clima && sv.clima.id ? sv.clima : null; setClima(climaRef.current);
      /* CÓDEX (v6.0): saves antigos não têm conquistas — começam do zero sem quebrar */
      contRef.current = { ...CONTADORES_INICIAIS, ...(sv.contadores && typeof sv.contadores === "object" ? sv.contadores : {}) };
      conqRef.current = sv.conquistas && sv.conquistas.desbloqueadas ? sv.conquistas : { desbloqueadas: {}, ordem: [] };
      setConquistas(conqRef.current);
      tituloAtivoRef.current = sv.tituloAtivo || ""; setTituloAtivo(tituloAtivoRef.current);
      descobRef.current = Array.isArray(sv.descobertas) ? sv.descobertas : []; setDescobertas(descobRef.current);
      /* MASMORRA/MURAL (v6.3): saves antigos não conhecem — começam zerados */
      masmorraRef.current = sv.masmorra && Array.isArray(sv.masmorra.salas) ? sv.masmorra : null; setMasmorra(masmorraRef.current);
      muralRef.current = Array.isArray(sv.mural) ? sv.mural : []; setMural(muralRef.current);
      decretosRef.current = Array.isArray(sv.decretos) ? sv.decretos : []; setDecretos(decretosRef.current);
      diaRef.current = sv.dia || 1; setDia(diaRef.current);
      minutoRef.current = sv.minuto != null ? sv.minuto : AMANHECER + 60; setMinuto(minutoRef.current);
      acordouAbsRef.current = sv.acordouAbs != null ? sv.acordouAbs : ((diaRef.current - 1) * 1440 + minutoRef.current); // saves antigos acordam descansados
      nemesisRef.current = sv.nemesis && typeof sv.nemesis === "object" ? sv.nemesis : null; setNemesis(nemesisRef.current);
      correioRef.current = garantirCorreio(sv.correio); setCorreio(correioRef.current);
      jornadaRef.current = sv.jornada && typeof sv.jornada === "object" ? sv.jornada : null; setJornada(jornadaRef.current);
      eventosRef.current = garantirEventos(sv.eventos); setEventos(eventosRef.current);
      /* MIGRAÇÃO (v7.4): saves antigos ganham a ascensão zerada — nada quebra */
      divindadeRef.current = garantirDivindade(sv.divindade); setDivindade(divindadeRef.current);
      famaPatamarRef.current = sv.famaPatamar || 0;
      reinoRef.current = garantirReino(sv.reino && typeof sv.reino === "object" ? sv.reino : {}, mapaRef.current) || {}; setReino(reinoRef.current);
      /* BLINDAGEM v6.5: pessoas de saves antigos sem data de encontro ganham
         "dia 0" (= antes do registro de dias) — nunca um passado inventado. */
      let regTocou = false;
      const regNovo = Object.fromEntries(Object.entries(npcsRef.current).map(([k, n]) => {
        if (n && n.conhecidoEm == null) { regTocou = true; return [k, { ...n, conhecidoEm: 0 }]; }
        return [k, n];
      }));
      if (regTocou) { npcsRef.current = regNovo; setNpcs(regNovo); }
      historiaRef.current = sv.historia && sv.historia.estrutura ? sv.historia : { estrutura: (sv.mundo && sv.mundo.estrutura) || "jornada", etapa: 0 };
      questsRef.current = Array.isArray(sv.quests) ? sv.quests : [];
      setQuests([...questsRef.current]);
      bancoNomesRef.current = gerarBancoNomes(sv.mundo);
      systemRef.current = montarSystemPrompt(sv.nomeCampanha || "Aventura", sv.mundo || { genero: "Fantasia medieval" }, pers, sv.livro || "", canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade());
      setFase("jogo");
      /* DESPERTAR NO CARREGAMENTO (v7.4.1): save veterano nível ≥15 nunca
         disparava o despertar (ele só checava DEPOIS de um turno). */
      setTimeout(() => checarDespertar(pers, true), 900);
      if (comResumo && !sv.rolagem) {
        enviar(`[RESUMO DE SESSÃO] Retomando "${sv.nomeCampanha}". Abra com "Anteriormente, em ${sv.nomeCampanha}…" e recapitule os principais acontecimentos em até 120 palavras, tom de série. Depois reapresente a cena atual e me convide a agir. Sem rolagem e sem mudanças nesta resposta.`, pers, sv.historico || []);
      }
    } catch (e) {
      setFase("menu");
      pushMsgs([{ autor: "sistema", texto: "Não foi possível abrir a aventura salva: " + String((e && e.message) || e).slice(0, 120) }]);
    }
  };

  /* Resolve por CÓDIGO um ataque do jogador contra um inimigo do combate ativo.
     Devolve o texto-resultado para o Mestre narrar, ou null se não for ataque. */
  const resolverAtaqueJogador = (acao, pers) => {
    const comb = combateRef.current;
    if (!comb || !(comb.inimigos || []).some((e) => !e.derrotado)) return null;
    const acaoN = acao.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const verboAtaque = /\b(ataco|atacar|golpeio|golpear|acerto|acertar|bato|bater|corto|cortar|perfuro|estoco|disparo|atiro|atirar|flecho|soco|chuto|esfaqueio|abato|invisto|avanco|arremesso)\b/.test(acaoN);
    if (!verboAtaque) return null;
    const vivos = comb.inimigos.filter((e) => !e.derrotado);
    const gdJ = grauDe(divindadeRef.current);
    const bonusAtkBase = Math.max((pers.atributos?.forca || 0), (pers.atributos?.destreza || 0)) + 2 + Math.floor(((pers.nivel || 1) - 1) / 4);
    /* ATAQUES MÚLTIPLOS (D&D): 2 ataques no nível 5, 3 no 11, 4 no 20 */
    const nv = pers.nivel || 1;
    const nAtaques = 1 + (nv >= 5 ? 1 : 0) + (nv >= 11 ? 1 : 0) + (nv >= 20 ? 1 : 0);
    const normalizar = (x) => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const alvoCitado = vivos.find((e) => acaoN.includes(normalizar(e.nome)));
    /* clone local para mirar corretamente entre golpes */
    const locais = comb.inimigos.map((e) => ({ ...e }));
    const resultados = [];
    for (let i = 0; i < nAtaques; i++) {
      const vivosAgora = locais.filter((e) => !e.derrotado && e.vida > 0);
      if (!vivosAgora.length) break;
      const alvo = (alvoCitado && vivosAgora.find((e) => e.nome === alvoCitado.nome)) || vivosAgora[0];
      const r = resolverAtaque({
        atacante: pers.nome, alvo, ehAtacanteInimigo: false,
        bonusAtaque: bonusAtk, danoBase: danoDe(pers, false),
        condAtacante: pers.condicoes || [], condAlvo: alvo.condicoes || [],
        tipoDano: elementoDaArma(pers), perfilAlvo: perfilDeCriatura(alvo.nome, alvo.desc),
      });
      if (r.dano > 0) { const l = locais.find((e) => e.nome === alvo.nome); l.vida = Math.max(0, l.vida - r.dano); if (l.vida <= 0) l.derrotado = true; }
      resultados.push({ r, alvo: { ...alvo } });
    }
    return { resultados, nAtaques };
  };

  const agir = (texto) => {
    const acao = texto.trim();
    if (!acao || carregando || rolagem) return;
    /* RELÓGIO: turnos de exploração/cons conversam ~45 min de mundo.
       Combate, masmorra e acampamento têm tempo próprio (contado nesses fluxos). */
    let extraTempo = "";
    if (!combateRef.current && !acampadoRef.current && !masmorraRef.current) extraTempo = avancarMinutos(MINUTOS_POR_TURNO);
    setEntrada(""); setHabAbertas(false);
    if (habSel) {
      const h = habSel; setHabSel(null);
      const custo = Math.max(0, Number(h.custo) || 0);
      if (personagem.mana < custo) { pushMsgs([{ autor: "sistema", texto: `Mana insuficiente para ${h.nome}.` }]); return; }
      /* ECONOMIA (v7.4): em combate, habilidade gasta a ação (ou a extra) */
      if (combateRef.current && combateRef.current.economia) {
        const ecoH = combateRef.current.economia;
        if (ecoH.acao <= 0 && ecoH.extra <= 0) { pushMsgs([{ autor: "sistema", texto: "⏳ Sem movimentos neste turno — toque em Encerrar turno." }]); return; }
        if (ecoH.acao > 0) ecoH.acao -= 1; else ecoH.extra -= 1;
        combateRef.current = { ...combateRef.current, economia: { ...ecoH } }; setCombate(combateRef.current);
      }
      const pers = { ...personagem, mana: personagem.mana - custo };
      setPersonagem(pers);
      pushMsgs([{ autor: "jogador", texto: `✦ ${h.nome} — ${acao}` }, { autor: "sistema", texto: `Você gastou ${custo} PM · restam ${pers.mana}/${pers.manaMax}` }]);
      habUsadaRef.current = true;
      enviar(`[HABILIDADE] Uso "${h.nome}" (custo ${custo} PM, já descontado; tenho ${pers.mana} PM). Efeito: ${h.descricao}. COMO eu a uso: ${acao}. Narre conforme minha intenção — se incerto, peça a rolagem apropriada.${extraTempo}`, pers);
      return;
    }
    /* Detecta habilidade citada por texto (ex.: "uso Projétil Arcano") e desconta o PM
       no app, para não depender do Mestre lembrar de cobrar. */
    const normal = (x) => (x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const acaoN = normal(acao);
    /* só considera USO se houver intenção clara (verbo de uso) + o nome da habilidade.
       Assim "pergunto sobre Bola de Fogo" NÃO ativa, mas "uso Bola de Fogo" ativa. */
    const temIntencao = /\b(uso|usar|lanco|lancar|conjuro|conjurar|invoco|invocar|ativo|ativar|executo|executar|realizo|disparo|disparar|aplico|aplicar|canalizo|uso a|uso o)\b/.test(acaoN);
    const habCitada = temIntencao ? (personagem.habilidades || []).find((h) => h && h.nome && acaoN.includes(normal(h.nome))) : null;
    if (habCitada) {
      const custo = Math.max(0, Number(habCitada.custo) || 0);
      if (personagem.mana < custo) { pushMsgs([{ autor: "jogador", texto: acao }, { autor: "sistema", texto: `Mana insuficiente para ${habCitada.nome}.` }]); return; }
      /* ECONOMIA (v7.4): idem — habilidade citada por texto também gasta */
      if (combateRef.current && combateRef.current.economia) {
        const ecoH2 = combateRef.current.economia;
        if (ecoH2.acao <= 0 && ecoH2.extra <= 0) { pushMsgs([{ autor: "jogador", texto: acao }, { autor: "sistema", texto: "⏳ Sem movimentos neste turno — toque em Encerrar turno." }]); return; }
        if (ecoH2.acao > 0) ecoH2.acao -= 1; else ecoH2.extra -= 1;
        combateRef.current = { ...combateRef.current, economia: { ...ecoH2 } }; setCombate(combateRef.current);
      }
      const pers = { ...personagem, mana: personagem.mana - custo };
      setPersonagem(pers);
      habUsadaRef.current = true;
      pushMsgs([{ autor: "jogador", texto: acao }, { autor: "sistema", texto: `✦ ${habCitada.nome} · gastou ${custo} PM · restam ${pers.mana}/${pers.manaMax}` }]);
      enviar(`[HABILIDADE] Uso "${habCitada.nome}" (custo ${custo} PM, já descontado; tenho ${pers.mana} PM). ${habCitada.descricao || ""} Ação: ${acao}${extraTempo}`, pers);
      return;
    }
    const ataque = resolverAtaqueJogador(acao, personagem);
    if (ataque) {
      /* ECONOMIA DE TURNO (v7.4): atacar gasta a AÇÃO. Sem ação, sem golpe —
         o turno só vira quando os movimentos acabam ou o jogador encerra. */
      const eco = combateRef.current && combateRef.current.economia;
      if (eco && eco.acao <= 0) {
        pushMsgs([{ autor: "jogador", texto: acao }, { autor: "sistema", texto: "⏳ Você já usou sua ação neste turno — use a ação extra/movimento ou toque em Encerrar turno." }]);
        return;
      }
      if (eco) { eco.acao -= 1; combateRef.current = { ...combateRef.current, economia: { ...eco } }; setCombate(combateRef.current); }
      const { resultados } = ataque;
      ataqueResolvidoRef.current = true;
      /* aplica cada golpe por código (fonte da verdade) e monta as linhas de dano */
      const gdJ = grauDe(divindadeRef.current);
      const linhas = [{ autor: "jogador", texto: acao }];
      const partesMeu = [];
      for (const { r, alvo } of resultados) {
        let pvDepois = alvo.vida;
        if (r.dano > 0) {
          const atualAlvo = (combateRef.current?.inimigos || []).find((e) => e.nome === alvo.nome);
          pvDepois = Math.max(0, (atualAlvo ? atualAlvo.vida : alvo.vida) - r.dano);
          const novo = { ...combateRef.current, inimigos: combateRef.current.inimigos.map((e) => e.nome === alvo.nome ? { ...e, vida: pvDepois, derrotado: pvDepois <= 0, ultimoDano: r.dano } : e) };
          combateRef.current = novo; setCombate(novo);
        }
        if (mostrarRolagensRef.current) linhas.push({ autor: "sistema", texto: "🎲 " + resumoDoAtaque(r) });
        linhas.push({ autor: "sistema", texto: r.escopoImune
          ? `⚔ ${personagem.nome} → ${alvo.nome}: o golpe atravessa sem encontrar carne — ${alvo.nome} é GD ${alvo.gd} (${tituloDe(alvo.gd)}), IMUNE ao seu dano comum`
          : r.dano > 0
          ? `⚔ ${personagem.nome} → ${alvo.nome}: ${r.critico ? "CRÍTICO! " : ""}${r.dano} de dano · ${alvo.nome} ${pvDepois}/${alvo.vidaMax || alvo.vida}${pvDepois <= 0 ? " ☠" : ""}`
          : `⚔ ${personagem.nome} → ${alvo.nome}: ${r.desastre ? "erro desastroso" : "errou"}` });
        partesMeu.push(r.escopoImune ? `${alvo.nome} — IMUNE (GD ${alvo.gd} vs meu GD ${gdJ}; dano comum não fere divindades — preciso de artefato lendário, bênção ou enfraquecê-lo)` : `${alvo.nome} — ${r.resultado === "critico" ? `CRÍTICO, ${r.dano} de dano` : r.resultado === "acerta" ? `${r.dano} de dano` : r.resultado === "desastre" ? "erro desastroso" : "errou"} (d20=${r.d20}${r.bonus ? `+${r.bonus}` : ""}=${r.total} vs ${r.ca})${r.dano > 0 && pvDepois <= 0 ? " [CAIU]" : ""}`);
      }
      pushMsgs(linhas);
      const desfecho = `${resultados.length} ${resultados.length > 1 ? "ataques" : "ataque"}: ${partesMeu.join("; ")}`;

      /* TURNO DO MUNDO (combate): os inimigos vivos revidam — o app rola e
         calcula tudo; o Mestre só narra as DECISÕES deles.
         ECONOMIA (v7.4): a revide só acontece quando o jogador GASTOU os
         movimentos ou encerrou o turno — antes disso, só os meus golpes. */
      let persAtual = personagem;
      /* meu golpe pode ter encerrado a luta: fecha AGORA, no mesmo turno */
      const fechouNoMeuGolpe = fecharSeTodosCairam();
      const combPos = combateRef.current;
      const ecoAgora = combPos && combPos.economia;
      const esgotouTurno = !combPos || !ecoAgora || (ecoAgora.acao <= 0 && ecoAgora.extra <= 0);
      const inimigosVivos = (fechouNoMeuGolpe || !esgotouTurno) ? [] : (combPos?.inimigos || []).filter((e) => !e.derrotado && e.vida > 0);
      let resumoInimigos = "";
      if (inimigosVivos.length > 0) {
        const acoes = turnoDosInimigos({ inimigos: combPos.inimigos, jogador: personagem, grupo: personagem.grupo || [], gdJogador: grauDe(divindadeRef.current) });
        const linhasSis = [];
        let danoNoJogador = 0;
        let grupoAtual = [...(personagem.grupo || [])];
        const partes = [];
        for (const a of acoes) {
          if (mostrarRolagensRef.current) linhasSis.push({ autor: "sistema", texto: "🎲 " + resumoDoAtaque(a.r) });
          linhasSis.push({ autor: "sistema", texto: a.r.dano > 0 ? `🛡 ${a.inimigo} → ${a.alvoNome}: ${a.r.critico ? "CRÍTICO! " : ""}${a.r.dano} de dano` : `🛡 ${a.inimigo} → ${a.alvoNome}: errou` });
          if (a.r.dano > 0) {
            if (a.alvoRef === "jogador") danoNoJogador += a.r.dano;
            else grupoAtual = grupoAtual.map((g) => g.nome === a.alvoNome ? { ...g, vida: Math.max(0, (g.vida || 0) - a.r.dano) } : g);
          }
          const res = a.r.resultado === "critico" ? `acertou em cheio (${a.r.dano})` : a.r.resultado === "acerta" ? `acertou (${a.r.dano})` : a.r.resultado === "desastre" ? "falhou feio" : "errou";
          partes.push(`${a.inimigo}→${a.alvoNome}: ${res}`);
        }
        if (linhasSis.length) pushMsgs(linhasSis);
        persAtual = { ...personagem, vida: Math.max(0, personagem.vida - danoNoJogador), grupo: grupoAtual };

        /* TURNO DOS COMPANHEIROS: atacam inimigos ou socorrem quem caiu */
        const jogadorCaido = persAtual.vida <= 0;
        const acoesComp = turnoDosCompanheiros({ grupo: persAtual.grupo || [], inimigos: combPos.inimigos, jogadorCaido, jogadorNome: persAtual.nome });
        const partesComp = [];
        for (const ac of acoesComp) {
          if (ac.tipo === "ataque" && ac.r) {
            if (mostrarRolagensRef.current) pushMsgs([{ autor: "sistema", texto: "🎲 " + resumoDoAtaque(ac.r) }]);
            let pvAlvo = null;
            if (ac.r.dano > 0) {
              combPos.inimigos = combPos.inimigos.map((e) => { if (e.nome !== ac.alvoNome) return e; pvAlvo = Math.max(0, e.vida - ac.r.dano); return { ...e, vida: pvAlvo, derrotado: pvAlvo <= 0, ultimoDano: ac.r.dano }; });
            }
            pushMsgs([{ autor: "sistema", texto: ac.r.dano > 0 ? `⚔ ${ac.companheiro} → ${ac.alvoNome}: ${ac.r.critico ? "CRÍTICO! " : ""}${ac.r.dano} de dano${pvAlvo !== null && pvAlvo <= 0 ? " ☠" : ""}` : `⚔ ${ac.companheiro} → ${ac.alvoNome}: errou` }]);
            partesComp.push(`${ac.companheiro} atacou ${ac.alvoNome} (${ac.r.resultado === "acerta" || ac.r.resultado === "critico" ? ac.r.dano + " dano" : "errou"})`);
          } else if (ac.tipo === "socorro") {
            partesComp.push(`${ac.companheiro} corre para socorrer ${ac.alvo}`);
          }
        }
        combateRef.current = combPos; setCombate({ ...combPos });
        fecharSeTodosCairam(); // companheiro pode ter dado o golpe final

        /* SISTEMA DE MORTE: se o jogador está a 0 PV, faz um teste de morte */
        if (persAtual.vida <= 0) {
          const estadoMorte = persAtual.morte || { sucessos: 0, falhas: 0 };
          const res = testeDeMorte();
          const ap = aplicarTesteMorte(estadoMorte, res);
          pushMsgs([{ autor: "sistema", texto: `☠ Teste de morte: ${res.texto}` }]);
          if (ap.desfecho === "revive") { persAtual = { ...persAtual, vida: 1, morrendo: false, morte: { sucessos: 0, falhas: 0 } }; pushMsgs([{ autor: "sistema", texto: "✨ Você volta a si com 1 PV!" }]); }
          else if (ap.desfecho === "estavel") { persAtual = { ...persAtual, morrendo: true, morte: { sucessos: 0, falhas: 0 } }; pushMsgs([{ autor: "sistema", texto: "Você estabiliza — inconsciente, mas vivo. Alguém precisa te ajudar." }]); }
          else if (ap.desfecho === "morto") { persAtual = { ...persAtual, morrendo: false, morto: true, morte: ap }; pushMsgs([{ autor: "sistema", texto: "💀 Você tomba… mas enquanto houver esperança, a lenda não termina." }]); }
          else { persAtual = { ...persAtual, morrendo: true, morte: ap }; }
        }

        setPersonagem(persAtual);
        const compTxt = partesComp.length ? ` Meus companheiros agiram: ${partesComp.join("; ")}.` : "";
        const morteTxt = persAtual.vida <= 0 ? ` ATENÇÃO: eu caí a 0 PV e estou ${persAtual.morto ? "à beira da morte" : "inconsciente, lutando pela vida (testes de morte). Um aliado pode me estabilizar ou curar para eu voltar"}.` : "";
        resumoInimigos = ` Turno dos inimigos (resolvido pelo sistema, dano já aplicado — narre só as decisões): ${partes.join("; ")}.${compTxt}${morteTxt}`;
        /* NOVA RODADA: com a revide concluída, meus movimentos renovam */
        if (combateRef.current) {
          combateRef.current = { ...combateRef.current, economia: { acao: 1, extra: 1 } };
          setCombate(combateRef.current);
        }
      }

      if (!esgotouTurno && !fechouNoMeuGolpe) {
        /* MEU TURNO CONTINUA: só narro meus golpes — o mundo ainda NÃO revida */
        enviar(`[COMBATE — MEU GOLPE RESOLVIDO PELO SISTEMA, TURNO AINDA MEU] Minha sequência de ${desfecho}. O dano já foi aplicado — NÃO recalcule. Narre SÓ os meus golpes e as reações instantâneas (1-3 frases: quem cambaleou, quem urrou) e PARE — NÃO faça os inimigos agirem nem contra-atacarem ainda: meu turno continua, ainda tenho ${ecoAgora ? ecoAgora.acao + ecoAgora.extra : 1} movimento(s). Ação declarada: ${acao}`, persAtual);
        return;
      }
      enviar(`[COMBATE — RESOLVIDO PELO SISTEMA] Minha sequência de ${desfecho}. O dano já foi aplicado.${resumoInimigos} NÃO recalcule nem mude números — NARRE de forma vívida (2-4 frases) a sequência dos meus golpes e as decisões e reações dos inimigos: quem recuou, quem avançou, quem mudou de alvo. Ação declarada: ${acao}`, persAtual);
      return;
    }
    pushMsgs([{ autor: "jogador", texto: acao }]);
    enviar(`${acao}${extraTempo}`, personagem);
  };

  /* VEZ DO MUNDO: o mundo vive o instante presente (curto no TEMPO, mas cheio
     de vida — pessoas agem, falam, decidem; coisas acontecem agora). */
  /* Fecha o combate IMEDIATAMENTE se todos os inimigos caíram. Necessário
     porque o dano aplicado por código (meu golpe / turno dos companheiros)
     não passa pelo processarCombate, onde ficava a única verificação. */
  const fecharSeTodosCairam = () => {
    const c = combateRef.current;
    if (!c || !(c.inimigos || []).length) return false;
    const todosCairam = c.inimigos.every((e) => e.derrotado || (e.vida || 0) <= 0);
    if (!todosCairam) return false;
    combateRef.current = null; setCombate(null); combateOciosoRef.current = 0;
    const derrotados = c.inimigos;
    const esp = gerarEspolios(derrotados);
    setPersonagem((p) => {
      let p2 = { ...p, moedas: (p.moedas || 0) + esp.moedas, xp: (p.xp || 0) + esp.xp };
      while (p2.xp >= XP_POR_NIVEL(p2.nivel)) { p2.xp -= XP_POR_NIVEL(p2.nivel); p2.nivel += 1; p2.nivelPendentes = (p2.nivelPendentes || 0) + 1; }
      p2.grupo = (p2.grupo || []).map((g) => { const ev = evoluirCompanheiro({ ...g, xp: (g.xp || 0) + esp.xp }); delete ev._subiu; return ev; });
      /* PRESENÇA DIVINA expira com o fim do combate — não vira debuff eterno */
      p2.condicoes = (p2.condicoes || []).filter((c) => !(c.origem || "").startsWith("presença de"));
      p2.grupo = (p2.grupo || []).map((g) => ({ ...g, condicoes: (g.condicoes || []).filter((c) => !(c.origem || "").startsWith("presença de")) }));
      return p2;
    });
    pushMsgs([
      { autor: "sistema", texto: "⚔ Todos os inimigos caíram — o combate termina." },
      { autor: "sistema", texto: `◉ Espólios: +${esp.moedas} moedas · +${esp.xp} XP` },
    ]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[VITÓRIA — sistema já aplicou +${esp.moedas} moedas e +${esp.xp} XP] NÃO envie moedas nem xp. Narre o desfecho em 2-3 frases.${esp.caiItem ? " UM ITEM CAIU: crie um item coerente e envie em \"adicionar_equipamento\" ou \"adicionar_itens\"." : " Sem itens desta vez."}`;
    return true;
  };

  /* ENCERRAR TURNO POR ESCOLHA (v7.4): o jogador pode passar a vez antes de
     gastar os movimentos — os inimigos revidam (sistema rola), companheiros
     agem, e a nova rodada começa com os movimentos renovados. */
  const encerrarTurnoCombate = () => {
    const combPos = combateRef.current;
    if (!combPos || carregando) return;
    pushMsgs([{ autor: "jogador", texto: "🛡 Encerro meu turno em guarda." }]);
    const vivos = (combPos.inimigos || []).filter((e) => !e.derrotado && e.vida > 0);
    if (!vivos.length) { fecharSeTodosCairam(); return; }
    const acoes = turnoDosInimigos({ inimigos: combPos.inimigos, jogador: personagem, grupo: personagem.grupo || [], gdJogador: grauDe(divindadeRef.current) });
    const linhasSis = [];
    let danoNoJogador = 0;
    let grupoAtual = [...(personagem.grupo || [])];
    const partes = [];
    for (const a of acoes) {
      if (mostrarRolagensRef.current) linhasSis.push({ autor: "sistema", texto: "🎲 " + resumoDoAtaque(a.r) });
      linhasSis.push({ autor: "sistema", texto: a.r.dano > 0 ? `🛡 ${a.inimigo} → ${a.alvoNome}: ${a.r.critico ? "CRÍTICO! " : ""}${a.r.dano} de dano` : `🛡 ${a.inimigo} → ${a.alvoNome}: errou` });
      if (a.r.dano > 0) {
        if (a.alvoRef === "jogador") danoNoJogador += a.r.dano;
        else grupoAtual = grupoAtual.map((g) => g.nome === a.alvoNome ? { ...g, vida: Math.max(0, (g.vida || 0) - a.r.dano) } : g);
      }
      const res = a.r.resultado === "critico" ? `acertou em cheio (${a.r.dano})` : a.r.resultado === "acerta" ? `acertou (${a.r.dano})` : a.r.resultado === "desastre" ? "falhou feio" : "errou";
      partes.push(`${a.inimigo}→${a.alvoNome}: ${res}`);
    }
    if (linhasSis.length) pushMsgs(linhasSis);
    let persAtual = { ...personagem, vida: Math.max(0, personagem.vida - danoNoJogador), grupo: grupoAtual };
    /* companheiros agem como numa rodada normal */
    const jogadorCaido = persAtual.vida <= 0;
    const acoesComp = turnoDosCompanheiros({ grupo: persAtual.grupo || [], inimigos: combPos.inimigos, jogadorCaido, jogadorNome: persAtual.nome });
    const partesComp = [];
    for (const ac of acoesComp) {
      if (ac.tipo === "ataque" && ac.r) {
        let pvAlvo = null;
        if (ac.r.dano > 0) {
          combPos.inimigos = combPos.inimigos.map((e) => { if (e.nome !== ac.alvoNome) return e; pvAlvo = Math.max(0, e.vida - ac.r.dano); return { ...e, vida: pvAlvo, derrotado: pvAlvo <= 0, ultimoDano: ac.r.dano }; });
        }
        pushMsgs([{ autor: "sistema", texto: ac.r.dano > 0 ? `⚔ ${ac.companheiro} → ${ac.alvoNome}: ${ac.r.critico ? "CRÍTICO! " : ""}${ac.r.dano} de dano${pvAlvo !== null && pvAlvo <= 0 ? " ☠" : ""}` : `⚔ ${ac.companheiro} → ${ac.alvoNome}: errou` }]);
        partesComp.push(`${ac.companheiro} atacou ${ac.alvoNome} (${ac.r.resultado === "acerta" || ac.r.resultado === "critico" ? ac.r.dano + " dano" : "errou"})`);
      } else if (ac.tipo === "socorro") partesComp.push(`${ac.companheiro} corre para socorrer ${ac.alvo}`);
    }
    /* nova rodada: movimentos renovados */
    combateRef.current = { ...combPos, economia: { acao: 1, extra: 1 } };
    setCombate(combateRef.current);
    fecharSeTodosCairam();
    setPersonagem(persAtual);
    const compTxt = partesComp.length ? ` Meus companheiros agiram: ${partesComp.join("; ")}.` : "";
    const morteTxt = persAtual.vida <= 0 ? " ATENÇÃO: caí a 0 PV — um aliado precisa me estabilizar ou curar." : "";
    enviar(`[COMBATE — TURNO ENCERRADO PELO JOGADOR, RESOLVIDO PELO SISTEMA] Escolhi encerrar meu turno em guarda. Turno dos inimigos (dano já aplicado — NÃO recalcule): ${partes.join("; ")}.${compTxt}${morteTxt} Narre as decisões e reações deles (2-4 frases) e me devolva a vez — nova rodada, meus movimentos estão renovados.`, persAtual);
  };

  const vezDoMundo = () => {
    if (bloqueado || acampadoRef.current) return;
    ehAcaoMundoRef.current = true;
    setAguardandoMundo(false);
    pushMsgs([{ autor: "sistema", texto: "🌍 O mundo vive…" }]);
    const modo = MODOS_MUNDO[modoMundoRef.current % MODOS_MUNDO.length];
    modoMundoRef.current += 1;
    enviar(`[VEZ DO MUNDO] ${instrucaoMundo(modo, urgenciaRef.current >= 1)}`, personagem);
  };

  /* RESPONDER + VEZ DO MUNDO ao mesmo tempo: sua fala é conduzida E o mundo
     vive o mesmo instante (pessoas agem e falam, coisas acontecem no presente). */
  const responderEMover = (texto) => {
    const fala = (texto || "").trim();
    if (!fala || bloqueado) return;
    setEntrada("");
    ehAcaoMundoRef.current = true;
    pushMsgs([{ autor: "jogador", texto: fala }]);
    const modo = MODOS_MUNDO[modoMundoRef.current % MODOS_MUNDO.length];
    modoMundoRef.current += 1;
    enviar(`[RESPONDO E O MUNDO VIVE] Eu falo: "${fala}". ${instrucaoMundo(modo, urgenciaRef.current >= 1)}`, personagem);
  };

  /* TURNO DO MUNDO SEMI-AUTOMÁTICO (v7.0): depois da sua ação o mundo fica
     "na iminência" por 60s. Se você digitar, o relógio pausa — você sempre
     tem a chance de responder. Se nada acontecer, o mundo vive sozinho.
     Pode ser desligado no botão ao lado. */
  const [autoMundo, setAutoMundo] = useState(true);
  const mundoAutoDesdeRef = useRef(null);
  const [tickMundo, setTickMundo] = useState(0);
  useEffect(() => {
    if (!aguardandoMundo) { mundoAutoDesdeRef.current = null; return; }
    if (!mundoAutoDesdeRef.current) mundoAutoDesdeRef.current = Date.now();
    if (!autoMundo) return;
    const t = setInterval(() => {
      setTickMundo((x) => x + 1);
      if (bloqueado || rolagem || combateRef.current || acampadoRef.current) return;
      if ((entrada || "").trim()) return; // você está digitando — o mundo espera
      if (Date.now() - mundoAutoDesdeRef.current >= 60 * 1000) vezDoMundo();
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aguardandoMundo, autoMundo, entrada]); // bloqueado/rolagem lidos só no callback (declarados adiante no componente)
  const mundoRestante = (aguardandoMundo && autoMundo && mundoAutoDesdeRef.current)
    ? Math.max(0, 60 - Math.floor((Date.now() - mundoAutoDesdeRef.current) / 1000))
    : null;

  /* PASSAR O TEMPO (deliberado): simula N horas; quanto mais horas, mais o mundo muda */
  const passarTempo = (horas) => {
    if (bloqueado || acampadoRef.current) return;
    if (combateRef.current) { combateRef.current = null; setCombate(null); combateOciosoRef.current = 0; }
    setMostrarHoras(false);
    ehAcaoMundoRef.current = true;
    setAguardandoMundo(false);
    const escala = horas <= 3 ? "algumas horas (mudanças pequenas)" : horas <= 8 ? "boa parte do dia (mudanças perceptíveis)" : horas <= 16 ? "quase um dia inteiro (mudanças significativas)" : "um dia completo (o mundo se move bastante)";
    pushMsgs([{ autor: "sistema", texto: `🕐 Você deixa ${horas}h passarem…` }]);
    /* RELÓGIO: "passar o tempo" agora move as horas de verdade — dias viram
       por aqui também (reino, festivais, sono), não só a ficção. */
    const diasPassados = Math.floor(horas / 24);
    if (diasPassados > 0) coletarRenda(diasPassados);
    const reinoMsg = avancarMinutos(horas * 60);
    const climaNovo = talvezMudarClima(horas >= 8 ? 0.65 : 0.35);
    const climaMsg = climaNovo ? `\n[CLIMA] O tempo virou: agora está ${climaNovo.rotulo} — ${climaNovo.nota}. Use isso na cena.` : "";
    enviar(`[PASSAR O TEMPO — ${horas} horas] Simule a passagem de ${horas} horas: ${escala}. Faça o mundo VIVER esse intervalo proporcionalmente — o que os NPCs e facções fizeram, o que avançou, o que mudou no ambiente e nas suas missões, notícias que chegaram. Quanto mais horas, mais coisas acontecem (mas sempre plausível, nunca absurdo tipo impérios caindo em 1 dia). Ao final, reapresente a cena atual e me convide a agir.${climaMsg}${reinoMsg}`, personagem);
  };

  const modPend = rolagem ? (() => { const a = ATRIBUTOS.find((x) => x.nome.toLowerCase() === (rolagem.atributo || "").toLowerCase()); return a && personagem ? atributoEfetivo(personagem, a.id) : 0; })() : 0;

  const concluirRolagem = (valor) => {
    const r = rolagem;
    if (!r || rolagemConsumidaRef.current === r.motivo + r.dificuldade) { setDadoRolando(false); return; }
    rolagemConsumidaRef.current = r.motivo + r.dificuldade;
    if (r.auto) {
      setDadoRolando(false); setRolagem(null);
      pushMsgs([{ autor: "sistema", texto: `✓ ${r.motivo || "Teste"}: trivial para seu patamar — sucesso sem rolagem` }]);
      enviar(`[TESTE — SUCESSO AUTOMÁTICO] "${r.motivo || "ação"}": trivial para meu patamar (dificuldade ${r.dificuldade} vs minha competência). Narre o êxito com naturalidade, sem drama de dado.`, personagem);
      return;
    }
    const mod = modPend;
    const total = valor + mod;
    const dc = r.dificuldade;
    const critico = valor === 20, desastre = valor === 1;
    const resultado = dc == null ? "resultado livre" : critico ? "SUCESSO CRÍTICO" : desastre ? "FALHA CRÍTICA" : total >= dc ? "sucesso" : "falha";
    /* CÓDEX: 20 natural e 1 natural contam para as conquistas */
    if (critico) { bumpCont("criticos"); checarConquistas(); }
    if (desastre) { bumpCont("desastres"); checarConquistas(); }
    setDadoRolando(false); setRolagem(null);
    const buffs = (personagem.efeitos || []).filter((e) => !e.aplica || e.aplica.toLowerCase() === (r.atributo || "").toLowerCase() || e.aplica.toLowerCase() === "testes");
    const notaBuff = buffs.length ? ` (inclui bônus de ${buffs.map((b) => b.nome).join(", ")})` : "";
    pushMsgs([{ autor: "sistema", texto: `🎲 d20 → ${valor}${mod ? ` + ${mod}` : ""} = ${total}${dc != null ? ` vs dif. ${dc}` : ""} · ${resultado}` }]);
    const notaVant = r.vantagem ? " (com vantagem)" : r.desvantagem ? " (com desvantagem)" : "";
    enviar(`[ROLAGEM] Teste de ${r.atributo || "sorte"} (${r.motivo})${notaVant}: rolei ${valor}, modificador +${mod}${notaBuff}, total ${total}${dc != null ? `, dificuldade ${dc}` : ""}. Resultado: ${resultado}. Narre as consequências de forma coerente com o resultado.`, personagem);
  };

  const escolherAtributo = (attrId, hab) => {
    const nv = Math.min(ATRIBUTO_MAX, personagem.atributos[attrId] + 1);
    const nomeAttr = ATRIBUTOS.find((a) => a.id === attrId)?.nome || attrId;
    const msgs = [`✦ ${nomeAttr} fortalecido: +${nv}`];
    setPersonagem((p) => {
      const habs = [...(p.habilidades || [])];
      if (hab && !habs.some((x) => (x.nome || x) === hab.nome)) habs.push({ nome: hab.nome, custo: hab.custo, descricao: hab.descricao });
      return { ...p, atributos: { ...p.atributos, [attrId]: nv }, habilidades: habs, nivelPendentes: Math.max(0, p.nivelPendentes - 1) };
    });
    if (hab) msgs.push(`✦ Nova habilidade: ${hab.nome} (${hab.custo} PM)`);
    notaRef.current = `[INFO] Subi para o nível ${personagem.nivel}, fortaleci ${nomeAttr} (agora +${nv})${hab ? ` e aprendi a habilidade "${hab.nome}" (${hab.custo} PM: ${hab.descricao})` : ""}.`;
    pushMsgs(msgs.map((t) => ({ autor: "sistema", texto: t })));
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

  /* ---------------- EQUIPAMENTO DOS COMPANHEIROS (100% app) ----------------
     O jogador gerencia o que cada companheiro veste — nada de "dar o item e
     ele não equipar". Bônus valem no combate por código (arma = dano, defesa = CA). */
  const equiparComp = (nomeComp, item) => {
    if (!item || !item.nome) return;
    setPersonagem((p) => ({
      ...p,
      grupo: (p.grupo || []).map((g) => {
        if (g.nome !== nomeComp) return g;
        const slot = item.tipo || "arma";
        let inv = (g.inventario || []).filter((x) => (typeof x === "string" ? x : (x && x.nome)) !== item.nome);
        let eqp = (g.equipamento || []).filter((x) => x.nome !== item.nome);
        const equipados = { ...(g.equipados || {}) };
        const antigo = equipados[slot];
        if (antigo) eqp = [...eqp, antigo]; // o que estava no slot volta para a mochila
        equipados[slot] = item;
        return { ...g, inventario: inv, equipamento: eqp, equipados };
      }),
    }));
    pushMsgs([{ autor: "sistema", texto: `⚔ ${nomeComp} equipou: ${item.nome}` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] ${nomeComp} agora usa ${item.nome} (equipado pelo jogador). Reflita isso na ficção.`;
  };

  const desequiparComp = (nomeComp, slot) => {
    setPersonagem((p) => ({
      ...p,
      grupo: (p.grupo || []).map((g) => {
        if (g.nome !== nomeComp) return g;
        const equipados = { ...(g.equipados || {}) };
        const it = equipados[slot];
        if (!it) return g;
        delete equipados[slot];
        return { ...g, equipados, equipamento: [...(g.equipamento || []), it] };
      }),
    }));
  };

  /* ---------------- FORJA (fabricação básica, 100% por código) ----------------
     Desmontar equipamento → essência. Essência + moedas → item procedural novo. */
  const desmontarEquip = (de, nome) => {
    if (de === "eu") {
      const it = (personagem.equipamento || []).find((e) => e.nome === nome);
      if (!it) return;
      const ganho = essenciaDe(it);
      setPersonagem((p) => ({ ...p, equipamento: (p.equipamento || []).filter((e) => e.nome !== nome), essencia: (p.essencia || 0) + ganho }));
      pushMsgs([{ autor: "sistema", texto: `⚒ Desmontado: ${nome} → +${ganho} ⚗ essência` }]);
    } else {
      const g = (personagem.grupo || []).find((x) => x.nome === de);
      const it = g && (g.equipamento || []).find((e) => e.nome === nome);
      if (!it) return;
      const ganho = essenciaDe(it);
      setPersonagem((p) => ({
        ...p, essencia: (p.essencia || 0) + ganho,
        grupo: (p.grupo || []).map((x) => x.nome === de ? { ...x, equipamento: (x.equipamento || []).filter((e) => e.nome !== nome) } : x),
      }));
      pushMsgs([{ autor: "sistema", texto: `⚒ Desmontado (${de}): ${nome} → +${ganho} ⚗ essência` }]);
    }
    bumpCont("desmontados"); checarConquistas();
  };

  const forjar = (slot, raridade) => {
    const custo = CUSTO_FORJA[raridade];
    if (!custo) return;
    if ((personagem.essencia || 0) < custo.essencia) { pushMsgs([{ autor: "sistema", texto: `⚒ Essência insuficiente: forjar ${RARIDADE_ROTULO[raridade]} pede ⚗ ${custo.essencia} (você tem ${personagem.essencia || 0}). Desmonte equipamentos.` }]); return; }
    if ((personagem.moedas || 0) < custo.moedas) { pushMsgs([{ autor: "sistema", texto: `⚒ Moedas insuficientes: forjar ${RARIDADE_ROTULO[raridade]} pede ◉ ${custo.moedas}.` }]); return; }
    const item = gerarLoot(raridade, { tipo: slot, nivel: personagem.nivel || 1 });
    setPersonagem((p) => ({ ...p, essencia: (p.essencia || 0) - custo.essencia, moedas: (p.moedas || 0) - custo.moedas, equipamento: [...(p.equipamento || []), item] }));
    pushMsgs([{ autor: "sistema", texto: `⚒ Forjado: ${item.nome} (${RARIDADE_ROTULO[item.raridade] || item.raridade}) — na mochila de equipamentos` }]);
    bumpCont("forjados"); checarConquistas();
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Forjei um item na forja: ${item.nome} (${item.raridade}${item.poder ? `, ${item.poder}` : ""}).`;
  };

  /* ---------------- MASMORRAS (v6.3 · tabela + código, a IA só narra) ----------------
     Entrar gera a masmorra; cada "avançar" rola a sala: combate (abre o painel
     pela instrução ao Mestre), armadilha/tesouro/santuário (resolvidos por
     código na hora), enigma (cena do Mestre) e o chefe no fundo. */
  const entrarMasmorra = () => {
    if (bloqueado || acampadoRef.current || masmorraRef.current) return;
    if (combateRef.current) { pushMsgs([{ autor: "sistema", texto: "⚔ Não dá para explorar uma masmorra no meio de um combate." }]); return; }
    const mm = gerarMasmorra((mundo && mundo.genero) || "Fantasia medieval", personagem.nivel || 1);
    masmorraRef.current = mm; setMasmorra(mm);
    pushMsgs([{ autor: "jogador", texto: `🕳 Encontrei uma entrada: ${mm.nome}. Vou explorar.` }]);
    const extraTempo = avancarMinutos(MINUTOS_SALA_MASMORRA);
    enviar(`[MASMORRA — ENTRADA · ${mm.nome}] Descobri a entrada de uma masmorra: "${mm.nome}" (${mm.salas.length} salas — o SISTEMA rola cada sala; você só narra). Descreva a fachada/entrada e a atmosfera lá dentro em 2-4 frases, costurando com a cena atual${cidadeAtualRef.current ? ` (perto de ${cidadeAtualRef.current})` : ""}. NÃO crie encontros ainda — as salas vêm pelas instruções [MASMORRA — SALA]. Termine me convidando a avançar.${extraTempo}`, personagem);
  };

  const avancarMasmorra = () => {
    const mm = masmorraRef.current;
    if (!mm || bloqueado || acampadoRef.current) return;
    if (combateRef.current) { pushMsgs([{ autor: "sistema", texto: "⚔ Termine o combate antes de avançar." }]); return; }
    const idx = mm.idx + 1;
    if (idx >= mm.salas.length) return;
    const sala = mm.salas[idx];
    const mm2 = { ...mm, idx };
    masmorraRef.current = mm2; setMasmorra(mm2);
    const pos = `SALA ${idx}/${mm.salas.length - 1} · ${mm.nome}`;
    const extraTempo = avancarMinutos(MINUTOS_SALA_MASMORRA);
    if (sala.tipo === "combate" || sala.tipo === "chefe") {
      /* COMBATE ABERTO PELO SISTEMA (v7.0): o app monta os inimigos pelo
         bestiário e abre o HUD na hora — sem depender do Mestre lembrar. */
      const inimigos = (sala.inimigos || []).map((i) => {
        const comp = completarInimigo({ nome: i.nome, ameaca: i.ameaca }, personagem.nivel || 1);
        return { ...comp, derrotado: false, semente: `inimigo|${comp.nome}|${comp.ameaca || ""}` };
      });
      combateRef.current = { inimigos }; setCombate(combateRef.current); combateOciosoRef.current = 0;
      inimigos.forEach((comp) => {
        if (comp.nome && !descobRef.current.some((d) => d.toLowerCase() === comp.nome.toLowerCase())) {
          descobRef.current = [...descobRef.current, comp.nome];
        }
      });
      setDescobertas(descobRef.current);
      const lista = inimigos.map((i) => `${i.nome} (nv ${i.nivel || 1}, ${i.vida} PV)`).join(", ");
      pushMsgs([{ autor: "sistema", texto: `⚔ ${sala.tipo === "chefe" ? "A sala do chefe!" : "Emboscada na masmorra!"} ${inimigos.map((i) => i.nome).join(", ")} — o combate está aberto.` }]);
      enviar(`[MASMORRA — ${pos} · ${sala.tipo === "chefe" ? "CHEFE" : "COMBATE"} — COMBATE JÁ ABERTO PELO SISTEMA] Avanço para a próxima sala e os inimigos saltam das sombras: ${lista}. O HUD de combate JÁ ESTÁ ABERTO — NÃO envie "combate_iniciar". Descreva a sala e a investida inicial em 1-2 frases e me passe a vez (eu ajo pelos botões de combate).${sala.tipo === "chefe" ? " É o confronto final desta masmorra — narre à altura." : ""}${extraTempo}`, personagem);
    } else if (sala.tipo === "armadilha") {
      /* dano por código: o herói (ou um companheiro, 30%) sofre a armadilha */
      const emComp = (personagem.grupo || []).length > 0 && Math.random() < 0.3;
      if (emComp) {
        const alvo = personagem.grupo[Math.floor(Math.random() * personagem.grupo.length)];
        setPersonagem((p) => ({ ...p, grupo: (p.grupo || []).map((g) => g.nome === alvo.nome ? { ...g, vida: Math.max(0, g.vida - sala.dano) } : g) }));
        pushMsgs([{ autor: "sistema", texto: `🪤 Armadilha: ${sala.nome} — ${alvo.nome} sofre ${sala.dano} de dano` }]);
        enviar(`[MASMORRA — ${pos} · ARMADILHA RESOLVIDA PELO SISTEMA] A sala tinha uma armadilha (${sala.nome}). ${alvo.nome} já sofreu ${sala.dano} de dano (aplicado pelo app — NÃO envie vida). Narre o susto e como o grupo reage.${extraTempo}`, personagem);
      } else {
        const p2 = { ...personagem, vida: Math.max(0, personagem.vida - sala.dano) };
        setPersonagem(p2);
        pushMsgs([{ autor: "sistema", texto: `🪤 Armadilha: ${sala.nome} — você sofre ${sala.dano} de dano` }]);
        enviar(`[MASMORRA — ${pos} · ARMADILHA RESOLVIDA PELO SISTEMA] A sala tinha uma armadilha (${sala.nome}). Eu já sofri ${sala.dano} de dano (aplicado pelo app — NÃO envie vida). Narre o susto e o estado em que fico.${extraTempo}`, p2);
      }
    } else if (sala.tipo === "tesouro") {
      let item = null;
      let p2 = { ...personagem, moedas: (personagem.moedas || 0) + sala.moedas };
      if (sala.caiItem) {
        const rar = Math.random() < 0.5 ? "incomum" : Math.random() < 0.85 ? "raro" : "epico";
        item = gerarLoot(rar, { nivel: personagem.nivel || 1 });
        p2 = { ...p2, equipamento: [...(p2.equipamento || []), item] };
      }
      setPersonagem(p2);
      pushMsgs([{ autor: "sistema", texto: `💰 Sala do tesouro: +${sala.moedas} moedas${item ? ` · ✦ ${item.nome} (${RARIDADE_ROTULO[item.raridade]})` : ""}` }]);
      checarConquistas(p2);
      enviar(`[MASMORRA — ${pos} · TESOURO RESOLVIDO PELO SISTEMA] A sala guardava um tesouro: ◉ ${sala.moedas}${item ? ` e o item "${item.nome}" (${item.raridade}${item.poder ? `, ${item.poder}` : ""})` : ""} — JÁ na minha posse (NÃO envie moedas nem "adicionar_equipamento"). Descreva o achado com emoção.${extraTempo}`, p2);
    } else if (sala.tipo === "santuario") {
      const cura = (mx, v) => Math.min(mx, v + Math.max(1, Math.round(mx * (sala.curaPct || 0.25))));
      const p2 = { ...personagem, vida: cura(personagem.vidaMax, personagem.vida), mana: cura(personagem.manaMax, personagem.mana), grupo: (personagem.grupo || []).map((g) => ({ ...g, vida: cura(g.vidaMax || g.vida, g.vida) })) };
      setPersonagem(p2);
      pushMsgs([{ autor: "sistema", texto: `⛲ Santuário: ${sala.cena} — todos recuperam ~25% de PV e PM` }]);
      enviar(`[MASMORRA — ${pos} · SANTUÁRIO RESOLVIDO PELO SISTEMA] A sala é um refúgio: ${sala.cena}. O grupo inteiro já recuperou parte de PV e PM (aplicado pelo app — NÃO envie cura). Narre o respiro — é um bom momento para uma conversa curta do grupo.${extraTempo}`, p2);
    } else if (sala.tipo === "enigma") {
      enviar(`[MASMORRA — ${pos} · ENIGMA] A sala trava o caminho com: ${sala.cena}. Apresente a cena e o desafio NA FICÇÃO — me deixe tentar resolver com palavras ou ações. Se eu travar, dê pistas; se eu resolver (ou der uma solução esperta), o caminho abre.${extraTempo}`, personagem);
    }
  };

  const sairDaMasmorra = () => {
    const mm = masmorraRef.current;
    if (!mm) return;
    if (combateRef.current) { pushMsgs([{ autor: "sistema", texto: "⚔ Não dá para fugir da masmorra no meio de um combate." }]); return; }
    masmorraRef.current = null; setMasmorra(null);
    pushMsgs([{ autor: "jogador", texto: `🏃 Fugo de ${mm.nome}, deixando o resto para trás.` }]);
    enviar(`[MASMORRA — FUGA] Eu ESCOLHI fugir de ${mm.nome} antes do fim — abandono conscientemente as salas e tesouros que ainda restavam (o que já conquistei, carrego comigo). Narre a retirada apressada em 2-3 frases e retome a cena do mundo lá fora.`, personagem);
  };

  /* ---------------- MURAL DE CONTRATOS (v6.3 · recompensa paga por código) ---------------- */
  const garantirMural = (forcar = false) => {
    if (!forcar && (muralRef.current || []).length > 0) return;
    muralRef.current = gerarMural((mundo && mundo.genero) || "Fantasia medieval", personagem ? personagem.nivel || 1 : 1, mapaRef.current, 3);
    setMural(muralRef.current);
  };

  const aceitarContrato = (c) => {
    if (!c) return;
    /* sai do mural e entra outro no lugar — o mural nunca fica vazio */
    muralRef.current = (muralRef.current || []).filter((x) => x.id !== c.id);
    muralRef.current = [...muralRef.current, gerarContrato((mundo && mundo.genero) || "Fantasia medieval", personagem.nivel || 1, mapaRef.current)];
    setMural(muralRef.current);
    if (!questsRef.current.some((q) => q.titulo.toLowerCase() === c.titulo.toLowerCase())) {
      questsRef.current = [...questsRef.current, { titulo: c.titulo, descricao: c.descricao, tipo: "secundaria", status: "ativa", nota: "", contrato: c.recompensa }];
      setQuests([...questsRef.current]);
    }
    setAba(null);
    pushMsgs([{ autor: "jogador", texto: `📋 Aceito o contrato: ${c.titulo} (◉ ${c.recompensa.moedas} + ${c.recompensa.xp} XP)` }]);
    enviar(`[CONTRATO ACEITO — ${c.titulo}] Peguei no mural: "${c.descricao}" A recompensa (◉ ${c.recompensa.moedas} e ${c.recompensa.xp} XP) será paga PELO SISTEMA ao concluir — NÃO envie moedas/xp. Costure o serviço na ficção (o objetivo está alcançável a partir da situação atual) e, quando eu CUMPRIR de verdade, marque com "quest_atualizar" {"titulo":"${c.titulo}","status":"concluida"}.`, personagem);
  };

  const abandonarContrato = (titulo) => {
    questsRef.current = questsRef.current.filter((q) => q.titulo !== titulo);
    setQuests([...questsRef.current]);
    pushMsgs([{ autor: "sistema", texto: `📋 Contrato abandonado: ${titulo}` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Abandonei o contrato "${titulo}" — ele não existe mais para mim.`;
  };

  /* DECRETOS E RECOMPENSAS (v6.4): o reverso do mural — VOCÊ prega cartazes
     oferecendo ouro e o mundo responde. O código retém a recompensa, decide
     quem aceita (generosidade × fama), gera o bando de aventureiros e rola o
     desfecho após alguns dias. Sucesso: o ouro retido é pago. Fracasso: volta tudo. */
  const famaJogador = () => Math.min(0.25, ((personagem && personagem.nivel) || 1) * 0.02 + ((guildaRef.current && guildaRef.current.nivel) || 1) * 0.02);

  const pregarDecreto = ({ tipo, alvo, recompensa }) => {
    const d = criarDecreto({ tipo, alvo, recompensa, nivel: personagem.nivel || 1 });
    const total = (personagem.moedas || 0) + ((guildaRef.current && guildaRef.current.cofre) || 0);
    if (total < d.recompensa) { pushMsgs([{ autor: "sistema", texto: `⚠️ Ouro insuficiente: o decreto custa ◉ ${d.recompensa} retidas na hora (bolso + cofre somados: ◉ ${total}).` }]); return; }
    /* retém: tira do bolso primeiro, o resto do cofre da guilda */
    let falta = d.recompensa;
    const doBolso = Math.min(personagem.moedas || 0, falta); falta -= doBolso;
    setPersonagem((p) => ({ ...p, moedas: (p.moedas || 0) - doBolso }));
    if (falta > 0) {
      guildaRef.current = { ...guildaRef.current, cofre: Math.max(0, (guildaRef.current.cofre || 0) - falta) };
      setGuilda(guildaRef.current);
    }
    decretosRef.current = [...decretosRef.current, d];
    setDecretos(decretosRef.current);
    bumpCont("decretosPregados"); checarConquistas();
    pushMsgs([{ autor: "jogador", texto: `📣 Preguei um decreto: ${d.descricao} — Recompensa: ◉ ${d.recompensa}` }]);
    enviar(`[DECRETO PREGADO — ${tipoDecreto(d.tipo).rotulo.toUpperCase()}] Pus cartazes pela região: "${d.descricao}" Recompensa de ◉ ${d.recompensa} JÁ RETIDA pelo sistema (não envie moedas). Reaja na ficção: tavernas comentando, interessados medindo o cartaz, o alvo talvez ficando sabendo… QUEM aceita e o RESULTADO quem decide é o sistema — NÃO invente aventureiros cumprindo isso por conta própria; narre apenas a repercussão.`, personagem);
  };

  const cancelarDecreto = (id) => {
    const d = decretosRef.current.find((x) => x.id === id);
    if (!d || d.status !== "pregado") return;
    decretosRef.current = decretosRef.current.filter((x) => x.id !== id);
    setDecretos(decretosRef.current);
    setPersonagem((p) => ({ ...p, moedas: (p.moedas || 0) + d.recompensa }));
    pushMsgs([{ autor: "sistema", texto: `📣 Decreto retirado: "${d.alvo}" — ◉ ${d.recompensa} devolvidas ao seu bolso.` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Retirei o decreto sobre "${d.alvo}" (ninguém havia aceitado). A recompensa foi devolvida.`;
  };

  /* O mundo responde aos decretos a cada dia passado (descanso longo):
     pregados tentam achar quem aceite; aceitos avançam até o desfecho. */
  const processarDecretos = (pers, msgs) => {
    if (!decretosRef.current.length) return pers;
    let p = pers;
    const atualizados = [];
    for (const d of decretosRef.current) {
      if (d.status === "pregado") {
        const grupo = tentarAceite(d, { genero: (mundo && mundo.genero) || "Fantasia medieval", nivel: p.nivel || 1, fama: famaJogador() });
        if (grupo) {
          const nd = { ...d, status: "aceito", grupo, dias: 0 };
          atualizados.push(nd);
          msgs.push(`📣 Seu decreto sobre "${d.alvo}" foi aceito: a ${grupo.bando} (liderada por ${grupo.lider}, força ${grupo.forca}) partiu para o serviço.`);
          notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[DECRETO ACEITO — ${d.alvo}] A ${grupo.bando} (${grupo.membros.map((m) => m.nome).join(", ")}, força ${grupo.forca}) aceitou meu decreto: "${d.descricao}" Recompensa de ◉ ${d.recompensa} já está retida pelo sistema. Eles partiram; o resultado chegará pelo sistema em alguns dias — até lá, eles estão FORA DE CENA, em missão.`;
          /* o líder vira uma pessoa conhecida */
          if (!npcsRef.current[grupo.lider]) {
            npcsRef.current = { ...npcsRef.current, [grupo.lider]: { nome: grupo.lider, relacao: "aliado", papel: `líder da ${grupo.bando}`, genero: mundo && mundo.genero, notas: `Aceitou seu decreto sobre "${d.alvo}".`, ultimaVez: Date.now(), conhecidoEm: diaRef.current } };
            setNpcs(npcsRef.current);
          }
        } else {
          atualizados.push(d);
        }
      } else if (d.status === "aceito") {
        const dias = (d.dias || 0) + 1;
        if (dias < 2) { atualizados.push({ ...d, dias }); continue; }
        const r = resolverDecreto(d);
        const t = tipoDecreto(d.tipo);
        const grupo = d.grupo;
        if (r.desfecho === "dizimado") {
          p = { ...p, moedas: (p.moedas || 0) + d.recompensa };
          msgs.push(`☠ A ${grupo.bando} não voltou de "${d.alvo}". ◉ ${d.recompensa} devolvidas — ninguém sobrou para cobrá-las.`);
          notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[DECRETO — DESFECHO: DIZIMADO] A ${grupo.bando} inteira morreu tentando cumprir meu decreto sobre "${d.alvo}" (o alvo continua como estava — isso é CANON). A recompensa voltou ao meu bolso. Narre a notícia chegando e o peso disso; o alvo pode ter ficado MAIS forte ou alerta.`;
        } else if (r.desfecho === "fracasso") {
          p = { ...p, moedas: (p.moedas || 0) + d.recompensa };
          msgs.push(`✖ A ${grupo.bando} fracassou em "${d.alvo}" e voltou de rabo entre as pernas. ◉ ${d.recompensa} devolvidas.`);
          notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[DECRETO — DESFECHO: FRACASSO] A ${grupo.bando} não conseguiu cumprir meu decreto sobre "${d.alvo}" e voltou viva, envergonhada (o alvo continua como estava — isso é CANON). A recompensa voltou ao meu bolso. Narre o retorno deles; o alvo provavelmente sabe que foi visado.`;
        } else {
          const baixas = r.desfecho === "sucesso_baixas";
          const mortos = baixas ? grupo.membros.filter(() => Math.random() < 0.4).map((m) => m.nome) : [];
          msgs.push(`${baixas ? "⚑" : "✅"} A ${grupo.bando} cumpriu seu decreto sobre "${d.alvo}"${mortos.length ? ` — mas ${mortos.join(", ")} não voltaram` : ""}! ◉ ${d.recompensa} pagas.`);
          bumpCont("decretosCumpridos");
          notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[DECRETO — DESFECHO: CUMPRIDO${baixas ? " COM BAIXAS" : ""}] É CANON: meu decreto sobre "${d.alvo}" foi CUMPRIDO pela ${grupo.bando}${mortos.length ? ` (${mortos.join(", ")} morreram no serviço)` : ""}. "${d.descricao}" — feito. O sistema JÁ PAGOU ◉ ${d.recompensa} a eles (não envie moedas). Narre o retorno${mortos.length ? " ensanguentado" : " triunfal"} deles e as consequências reais do feito no mundo${d.tipo === "cabeca" ? " — mandei matar alguém: se o alvo era ligado a alguma facção, a relação despenca e pode haver represálias" : ""}.`;
        }
        atualizados.push({ ...d, status: "resolvido", desfecho: r.desfecho });
      } else {
        atualizados.push(d);
      }
    }
    /* resolvidos ficam no histórico visual por um tempo, mas saem da lista ativa após o próximo ciclo */
    decretosRef.current = atualizados.filter((d) => !(d.status === "resolvido" && (d.dias || 0) >= 2)).map((d) => d.status === "resolvido" ? { ...d, dias: (d.dias || 0) + 1 } : d);
    setDecretos(decretosRef.current);
    return p;
  };

  /* FAMA (v6.8): derivada das façanhas reais — a IA não infla nem esquece.
     Quando o patamar sobe, o mundo muda o tratamento (envelope no próximo envio). */
  const checarFama = () => {
    const f = famaAtual();
    const antes = patamarFama(famaPatamarRef.current), agora = patamarFama(f);
    if (agora.min > antes.min) {
      pushMsgs([{ autor: "sistema", texto: `📣 Sua fama cresce: agora você é ${agora.rotulo} — ${agora.nota}.` }]);
      notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[FAMA — NOVO PATAMAR, CANON] Minha fama subiu para ${Math.round(f)}: agora sou ${agora.rotulo.toUpperCase()} (${agora.nota}). O mundo passa a me tratar assim — reconhecimento em cidades, olhares, respeito ou medo. NPCs relevantes podem já ter ouvido meu nome.`;
    }
    famaPatamarRef.current = f;
    return f;
  };

  /* NÊMESIS (v6.8): quando o nome cresce demais, alguém jura seu fim. */
  const tentarSurgirNemesis = () => {
    if (nemesisRef.current && nemesisRef.current.status !== "derrotada") return;
    if (famaAtual() < 20) return;
    if (Math.random() > 0.35) return;
    const n = gerarNemesis(() => nomePessoa((mundo && mundo.genero) || "Fantasia medieval"), contRef.current, { dominios: dominiosDe(mapaRef.current).length }, diaRef.current);
    nemesisRef.current = n; setNemesis(n);
    npcsRef.current = { ...npcsRef.current, [n.nome]: criarNPC(n.nome, { papel: n.titulo, relacao: "inimigo", notas: `NÊMESIS do herói: ${n.motivo}. Ódio cresce a cada dia.`, conhecidoEm: diaRef.current, ultimaVez: Date.now() }) };
    setNpcs(npcsRef.current);
    pushMsgs([{ autor: "sistema", texto: `🎭 Alguém jurou seu fim: ${n.nome}, ${n.titulo} — ${n.motivo}.` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[NÊMESIS — SURGIMENTO, CANON] Minha fama atraiu uma inimiga jurada: ${n.nome}, "${n.titulo}" — ${n.motivo}. Ela existe no mundo AGORA (ficha registrada), age nas sombras e o ódio dela cresce a cada dia (o sistema cuida dos números e dos ataques). Semeie a presença dela aos poucos: sinais, olhares, histórias — NÃO a confronte ainda.`;
    checarConquistas();
  };

  const processarNemesisDiaria = () => {
    const n = nemesisRef.current;
    if (!n || n.status === "derrotada") return;
    /* a nêmesis morreu na ficção? o registro de pessoas é a fonte da verdade */
    const ficha = Object.values(npcsRef.current || {}).find((x) => (x.nome || "").toLowerCase() === (n.nome || "").toLowerCase());
    if (ficha && (ficha.status || "").toLowerCase().includes("morto")) {
      nemesisRef.current = { ...n, status: "derrotada" }; setNemesis(nemesisRef.current);
      bumpCont("nemesisVencidas"); checarConquistas();
      pushMsgs([{ autor: "sistema", texto: `🕊 A perseguição acabou: ${n.nome} não vai mais te caçar.` }]);
      notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[NÊMESIS — FIM, CANON] ${n.nome} está morta (confirmado pelo registro). A perseguição contra mim ACABOU de verdade: sem sucessores, sem retorno, sem "plano póstumo". O mundo deve registrar o fim dessa sombra.`;
      return;
    }
    const odio = Math.min(100, (n.odio || 0) + 2 + Math.floor(Math.random() * 4));
    let atual = { ...n, odio, status: odio >= 30 ? "ativa" : n.status };
    for (const lim of LIMIARES_NEMESIS) {
      if (odio >= lim && (n.ultimoLimiar || 0) < lim) {
        atual = { ...atual, ultimoLimiar: lim };
        const acao = ACOES_NEMESIS[lim];
        pushMsgs([{ autor: "sistema", texto: `🎭 ${acao.rotulo}: ${acao.txt(atual)}` }]);
        if (acao.tipo === "sabotagem") {
          const perda = Math.round((guildaRef.current.cofre || 0) * 0.1);
          if (perda > 0) {
            guildaRef.current = { ...guildaRef.current, cofre: guildaRef.current.cofre - perda }; setGuilda(guildaRef.current);
            pushMsgs([{ autor: "sistema", texto: `🔥 A sabotagem custou ◉ ${perda} do cofre.` }]);
          }
        }
        const instr = { difamacao: "Espalhe na ficção os efeitos dessa difamação: um olhar torto, um comerciante que hesita, um boato cruel sobre mim circulando.", sabotagem: "Narre as consequências da sabotagem chegando aos meus ouvidos (o prejuízo já foi aplicado pelo sistema).", assassinos: "Prepare o ataque: em breve (nesta sessão ou na próxima cena de estrada), assassinos a serviço dela me emboscam — quando acontecer, abra o combate com 'combate_iniciar' (assassinos de ameaça compatível com meu nível).", confronto: "É o confronto final: ela virá pessoalmente, com um desafio aberto ou uma armadilha mortal. Construa o encontro como clímax e, quando eu vencer (se vencer), registre-a como morta no registro de pessoas." }[acao.tipo];
        notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[NÊMESIS — ${acao.rotulo.toUpperCase()}] ${acao.txt(atual)} ${instr}`;
      }
    }
    nemesisRef.current = atual; setNemesis(atual);
  };

  /* AVANÇO DE DIAS (v6.5): cada dia passado move o calendário e rola a vida
     dos seus domínios (população, felicidade, eventos por tabela). Retorna os
     eventos para o chamador virar envelope pro Mestre narrar. */
  const correioMsgsDiaRef = useRef([]); // envelopes do correio do(s) dia(s) processado(s)
  const avancarDiasReino = (n) => {
    const eventos = [];
    let cofreDeltaTotal = 0;
    let r = reinoRef.current;
    for (let i = 0; i < n; i++) {
      diaRef.current += 1;
      const { reino: nr, evento } = processarDiaReino(r, mapaRef.current);
      r = nr;
      if (evento) {
        eventos.push(evento);
        cofreDeltaTotal += evento.cofreDelta || 0;
        bumpCont("eventosReino");
      }
      /* CORREIO (v7.0): respostas chegam, petições surgem/expiram — por dia. */
      const faccNomes = ((mapaRef.current && mapaRef.current.faccoes) || [])
        .filter((f) => f && f.nome && !f.doJogador && f.relacao !== "jogador")
        .map((f) => f.nome);
      const pc = processarDiaCorreio(correioRef.current, {
        dia: diaRef.current,
        fama: famaAtual(),
        ehLider: cidadesDominadas(mapaRef.current).length > 0 || !!(mapaRef.current.faccoes || []).some((f) => f.doJogador),
        faccoes: faccNomes,
      });
      correioRef.current = pc.correio; setCorreio(pc.correio);
      aplicarEfeitosCorreio(pc.efeitos);
      pc.msgs.forEach((m) => {
        pushMsgs([{ autor: "sistema", texto: `✉️ ${m.replace(/^\[CORREIO — [^\]]+\]\s*/, "")}` }]);
        correioMsgsDiaRef.current.push(m);
      });
    }
    reinoRef.current = r; setReino(r); setDia(diaRef.current);
    if (cofreDeltaTotal !== 0) {
      guildaRef.current = { ...guildaRef.current, cofre: Math.max(0, (guildaRef.current.cofre || 0) + cofreDeltaTotal) };
      setGuilda(guildaRef.current);
    }
    if (eventos.length) checarConquistas();
    /* por dia passado: fama recalculada, nêmesis cresce, rumores viajam */
    for (let i = 0; i < n; i++) {
      checarFama();
      tentarSurgirNemesis();
      processarNemesisDiaria();
      if (Math.random() < 0.25) {
        const boato = rumorDoDia({ ...contRef.current, cicatrizes: (personagem.cicatrizes || []).length, quaseMorte: contRef.current.quaseMorte || 0 }, personagem.nome, patamarFama(famaAtual()), !!(nemesisRef.current && nemesisRef.current.status !== "derrotada"));
        pushMsgs([{ autor: "sistema", texto: `🗞 Corre a boca miúda: ${boato}…` }]);
        notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[RUMOR] Um boato chegou aos meus ouvidos: "${boato}". Se couber, deixe-o circular na ficção (taverna, estrada, mercado) — e decida se ele é só fumaça ou o rastro de algo real.`;
      }
    }
    return eventos;
  };
  const envelopeEventosReino = (evs) => {
    const correioEnv = correioMsgsDiaRef.current.length ? "\n" + correioMsgsDiaRef.current.join("\n") : "";
    correioMsgsDiaRef.current = [];
    const base = !evs.length ? "" : "\n" + evs.map((ev) => `[EVENTO DE REINO — ${ev.evento.titulo.toUpperCase()} em ${ev.cidade}] ${ev.evento.txt(ev.cidade)} Os efeitos JÁ foram aplicados pelo sistema (${[ev.felDelta ? `felicidade ${ev.felDelta > 0 ? "+" : ""}${ev.felDelta}` : "", ev.popDelta ? `população ${ev.popDelta > 0 ? "+" : ""}${ev.popDelta}` : "", ev.cofreDelta ? `cofre ${ev.cofreDelta > 0 ? "+" : ""}${ev.cofreDelta}` : ""].filter(Boolean).join(", ")}) — NÃO os repita como números na ficção; narre como vida do reino${ev.evento.soSeInfeliz ? ". ATENÇÃO: o povo está à beira da revolta — isso é um problema REAL que exige resposta minha ou consequências" : ""}.`).join("\n");
    return base + correioEnv;
  };

  /* CORREIO (v7.0): efeitos concretos aplicados pelo app — felicidade nos
     domínios, moedas no cofre/bolso, tratados gravados no mapa (ficção obedece). */
  const aplicarEfeitosCorreio = (ef) => {
    if (!ef) return;
    if (ef.felicidade) {
      const r = { ...reinoRef.current };
      Object.keys(r).forEach((k) => { r[k] = { ...r[k], felicidade: Math.max(0, Math.min(100, (r[k].felicidade || 55) + ef.felicidade)) }; });
      reinoRef.current = r; setReino(r);
    }
    if (ef.moedas) {
      if (ef.moedas > 0) {
        guildaRef.current = { ...guildaRef.current, cofre: (guildaRef.current.cofre || 0) + ef.moedas };
        setGuilda(guildaRef.current);
      } else {
        let falta = -ef.moedas;
        const doBolso = Math.min(personagem.moedas || 0, falta);
        if (doBolso) setPersonagem((p) => ({ ...p, moedas: p.moedas - doBolso }));
        falta -= doBolso;
        if (falta > 0) {
          guildaRef.current = { ...guildaRef.current, cofre: Math.max(0, (guildaRef.current.cofre || 0) - falta) };
          setGuilda(guildaRef.current);
        }
      }
    }
    const ROTULO_TRATADO = { alianca: "Aliança", guerra: "Guerra", comercio: "Acordo comercial", casamento: "União por casamento", apoio: "Apoio militar" };
    const MAPA_TRATADO = { alianca: "alianca", guerra: "guerra", comercio: "comercio", casamento: "alianca", apoio: "comercio" };
    (ef.tratadosAdd || []).forEach(({ faccao, tratado }) => {
      const rotulo = ROTULO_TRATADO[tratado] || tratado;
      const c = garantirCorreio(correioRef.current);
      if (!c.tratados.some((t) => t.faccao === faccao && t.tratado === tratado)) {
        c.tratados = [...c.tratados, { faccao, tratado, rotulo, dia: diaRef.current }];
        correioRef.current = c; setCorreio(c);
      }
      const m = mapaRef.current;
      if (m && Array.isArray(m.faccoes)) {
        m.faccoes = m.faccoes.map((f) => f.nome === faccao ? { ...f, tratado: MAPA_TRATADO[tratado] || f.tratado || "nenhum" } : f);
        setMapa({ ...m });
      }
    });
    (ef.tratadosRem || []).forEach(({ faccao, tratado }) => {
      const c = garantirCorreio(correioRef.current);
      c.tratados = c.tratados.filter((t) => !(t.faccao === faccao && t.tratado === tratado));
      correioRef.current = c; setCorreio(c);
      const m = mapaRef.current;
      if (m && Array.isArray(m.faccoes) && tratado === "guerra") {
        m.faccoes = m.faccoes.map((f) => f.nome === faccao && f.tratado === "guerra" ? { ...f, tratado: "nenhum" } : f);
        setMapa({ ...m });
      }
    });
  };

  /* Enviar carta: custa ◉ 10 do bolso; a resposta chega em 1–3 dias por tabela. */
  const enviarCarta = (para, tipo, oferta, mensagem) => {
    if (!para || !TIPOS_CARTA[tipo]) return;
    if ((personagem.moedas || 0) < CUSTO_CARTA) { pushMsgs([{ autor: "sistema", texto: `✉️ O mensageiro cobra ◉ ${CUSTO_CARTA} — você não tem no bolso.` }]); return; }
    setPersonagem((p) => ({ ...p, moedas: p.moedas - CUSTO_CARTA }));
    const c = garantirCorreio(correioRef.current);
    const carta = criarCarta({ para, tipo, oferta, mensagem, dia: diaRef.current });
    carta.id = `carta_${c.seq}`; c.seq += 1;
    c.enviadas = [carta, ...c.enviadas];
    correioRef.current = c; setCorreio(c);
    const t = TIPOS_CARTA[tipo];
    pushMsgs([{ autor: "sistema", texto: `✉️ ${t.icone} ${t.nome} enviada a ${para}${oferta ? ` (oferta de ◉ ${oferta})` : ""}. Resposta esperada até o dia ${carta.chegaEm}.` }]);
    enviar(`[CORREIO — CARTA ENVIADA] Enviei a ${para}: ${t.icone} ${t.nome}${oferta ? ` com oferta de ◉ ${oferta}` : ""}${mensagem ? `. Diz a carta: "${mensagem}"` : ""}. Narre a partida do mensageiro e a expectativa — a RESPOSTA virá pelo sistema em 1–3 dias; NÃO antecipe nem decida a reação de ${para} agora.`);
  };

  /* Aceitar/recusar petição recebida — efeitos imediatos, IA só narra. */
  const responderPeticao = (id, aceite) => {
    const c = garantirCorreio(correioRef.current);
    const p = c.recebidas.find((x) => x.id === id && x.status === "pendente");
    if (!p) return;
    const ef = resolverPeticao(p, aceite);
    if (aceite && ef.moedas < 0 && (personagem.moedas || 0) + (guildaRef.current.cofre || 0) < -ef.moedas) {
      pushMsgs([{ autor: "sistema", texto: `✉️ Aceitar custaria ◉ ${-ef.moedas} — você não tem (bolso + cofre).` }]); return;
    }
    c.recebidas = c.recebidas.filter((x) => x.id !== id);
    c.historico = [{ ...p, status: aceite ? "aceita" : "recusada", respondidaEm: diaRef.current }, ...c.historico].slice(0, 12);
    correioRef.current = c; setCorreio(c);
    aplicarEfeitosCorreio(ef);
    pushMsgs([{ autor: "sistema", texto: `✉️ Petição de ${p.de}: ${aceite ? "ACEITA" : "RECUSADA"}${ef.nota ? ` — ${ef.nota}` : ""}.` }]);
    enviar(`[CORREIO — PETIÇÃO ${aceite ? "ACEITA" : "RECUSADA"}] ${p.texto} → EU DECIDI: ${aceite ? "ACEITEI" : "RECUSEI"}.${ef.nota ? ` Consequência (já aplicada pelo sistema): ${ef.nota}.` : ""}${ef.moedas ? ` Moedas: ${ef.moedas > 0 ? "+" : ""}${ef.moedas} (já aplicado).` : ""} Narre a reação de ${p.de} e as ondas que isso faz no mundo.`);
  };

  /* CRÔNICA (v6.9): baixa a saga em Markdown — gerada por código dos registros. */
  const exportarCronica = (md) => {
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cronica-de-${(personagem.nome || "heroi").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-")}-dia-${diaRef.current}.md`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    bumpCont("cronicas"); checarConquistas();
    pushMsgs([{ autor: "sistema", texto: "📜 Crônica exportada — sua saga, em letra de forma." }]);
  };

  /* RELAÇÕES FORMAIS (v6.5): o jogador pode fixar a relação com qualquer
     pessoa conhecida — inclusive CÔNJUGE. Vira canon absoluto via envelope.
     É também o remendo para histórias já vividas (ex.: um casamento que a
     ficção consumou mas o registro não sabia). */
  const definirRelacao = (nome, relacao) => {
    const reg = npcsRef.current;
    /* membro do grupo sem ficha? o app cria na hora — relação formal precisa de registro */
    let n = reg[nome];
    if (!n) {
      const comp = (personagem.grupo || []).find((g) => (g.nome || "").toLowerCase() === nome.toLowerCase());
      if (!comp) return;
      n = criarNPC(comp.nome, { papel: [comp.classe, comp.subclasse].filter(Boolean).join(" · ") || "companheiro", relacao: "aliado", notas: comp.descricao || "", conhecidoEm: 0 });
    }
    if ((n.relacao || "") === relacao) return;
    const rotulo = relacaoNPC(relacao).rotulo;
    npcsRef.current = { ...reg, [nome]: { ...n, nome, relacao, ultimaVez: Date.now() } };
    setNpcs(npcsRef.current);
    pushMsgs([{ autor: "sistema", texto: `🤝 Relação formal registrada: ${nome} agora é ${rotulo}.` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[RELAÇÃO FORMAL — CANON ABSOLUTO] Eu declarei formalmente: minha relação com ${nome} é ${rotulo.toUpperCase()}${relacao === "conjuge" ? " — CÔNJUGE: somos casados, isso é fato consumado e permanente (trate como parte do nosso presente, sem inventar um passado longo que não esteja registrado)" : ""}. Registre no cânone e trate como verdade absoluta daqui em diante.`;
  };

  /* ACAMPAMENTO: pausa o "turno do mundo" — você conversa à vontade, nada avança.
     Ao sair, escolhe descanso curto/longo; o app reseta PV/PM (jogador+grupo) e o
     Mestre narra o que passou, proporcional ao tempo (nunca exagerado). */
  const acampar = () => {
    if (acampadoRef.current || bloqueado) return;
    if (combateRef.current) { combateRef.current = null; setCombate(null); combateOciosoRef.current = 0; }
    setAguardandoMundo(false);
    definirAcampado(true);
    const local = localDeDescanso(mapaRef.current, cidadeAtualRef.current, faccaoJogadorRef.current);
    const rotulo = local.tipo === "sede" ? "🏛 Você recolhe-se à sede da sua guilda"
                 : local.tipo === "casa" ? "🏠 Você recolhe-se a uma casa da sua facção"
                 : local.tipo === "aliada" ? "🤝 Você é acolhido por aliados"
                 : local.tipo === "hostil" ? "⚠ Você se esconde em território hostil"
                 : local.tipo === "estalagem" ? "🛏 Você aluga um quarto na estalagem"
                 : "⛺ Você monta acampamento";
    const emViagem = !!jornadaRef.current;
    pushMsgs([{ autor: "sistema", texto: `${emViagem ? "⛺ Você faz uma parada de descanso em plena viagem" : rotulo}. O tempo pausa — converse com o grupo à vontade. Escolha um descanso para retomar a jornada.` }]);
    enviar(`[ACAMPAMENTO${emViagem ? " EM VIAGEM" : ` em ${local.texto}`}] ${emViagem
      ? `Parei para descansar NO MEIO DA VIAGEM — local atual: ${localAtualTxt()}. O descanso acontece aqui mesmo: no acampamento à beira da estrada, na cabine do navio, no vagão da caravana — conforme o meio em que viajo. É TERMINANTEMENTE PROIBIDO me colocar em estalagem, aposentos ou cidade: eu NÃO cheguei a lugar nenhum ainda.`
      : `Montei acampamento/descanso em: ${local.texto}.`} A partir de agora é uma pausa segura: NÃO faça o mundo avançar, NÃO gere eventos externos nem passagem de tempo. Conduza conversas — companheiros puxam papo, revelam histórias. ${emViagem ? "Reflita o descanso itinerante na cena (fogueira, balanço do mar, turnos de vigia)." : "Se for a sede da guilda ou casa da facção, reflita esse conforto/autoridade na cena."} Descreva brevemente o local e deixe aberto para conversa.`, personagem);
  };

  const sairDoAcampamento = (tipo) => {
    if (!acampadoRef.current) return;
    definirAcampado(false);
    const msgs = [];
    let pers = aplicarDescanso(personagem, tipo, msgs);
    /* VÍNCULO: conversas de fogueira aproximam (+3 para todo o grupo) */
    pers = { ...pers, grupo: aplicarVinculo(pers.grupo, "todos", 3, msgs) };
    setPersonagem(pers);
    pushMsgs(msgs.map((t) => ({ autor: "sistema", texto: t })));
    bumpCont("descansos"); checarConquistas(pers);
    if (tipo === "longo") coletarRenda(1); // uma noite inteira passou: as terras rendem
    if (tipo === "longo") garantirMural(true); // o mural de contratos acorda com trabalho novo
    if (tipo === "longo") { // o mundo responde aos seus decretos: quem aceita, quem volta, quem não volta
      const antes = msgs.length;
      pers = processarDecretos(pers, msgs);
      if (msgs.length > antes) { setPersonagem(pers); pushMsgs(msgs.slice(antes).map((t) => ({ autor: "sistema", texto: t }))); }
    }
    /* GERADORES DE VIDA (v7.2): o descanso longo é quando o mundo sorteia —
       fio local novo, quest da fase do arco, evento global nascendo ou
       escalando. Tudo montado por código; o mestre recebe pronto e só narra. */
    let eventosMsg = "";
    if (tipo === "longo") {
      const ctx = ctxMundo({ mundo, mapa: mapaRef.current, dia: diaRef.current });
      ctx.fase = faseDoArco(historiaRef.current, ESTRUTURAS);
      const secundarias = questsRef.current.filter((q) => q.status === "ativa" && q.tipo !== "principal").length;
      const r = processarDescansoLongoEventos(eventosRef.current, ctx, { dia: diaRef.current, secundariasAtivas: secundarias });
      eventosRef.current = r.eventos; setEventos(r.eventos);
      const partes = [];
      if (r.globalNovo) {
        partes.push(`[EVENTO GLOBAL — NOVO ARCO MAIOR: ${r.globalNovo.nome.toUpperCase()}] O SISTEMA sorteou um acontecimento que abalará a região: ${r.globalNovo.semente} ETAPA 1/${r.globalNovo.etapas.length} agora: ${r.globalNovo.etapas[0]} Teça isso na ficção aos poucos — é um arco longo de fundo, coerente com o arco atual, NÃO uma quest para resolver hoje.`);
        pushMsgs([{ autor: "sistema", texto: `🌍 Evento global: ${r.globalNovo.nome} — a região começa a mudar.` }]);
      }
      if (r.globalAvancou && r.eventos.global) {
        const g = r.eventos.global;
        partes.push(`[EVENTO GLOBAL — ${g.nome.toUpperCase()} · ETAPA ${g.etapa + 1}/${g.etapas.length}] A situação regional ESCALOU: ${g.etapas[g.etapa]} Mostre a escalada na ficção (notícias, medo, preços, movimentação de facções) sem resolvê-la ainda.`);
        pushMsgs([{ autor: "sistema", texto: `🌍 ${g.nome}: a situação escalou (etapa ${g.etapa + 1}/${g.etapas.length}).` }]);
      }
      if (r.localNovo) {
        partes.push(`[EVENTO LOCAL — FIO DO MUNDO] ${r.localNovo.icone} ${r.localNovo.texto} Gancho: ${r.localNovo.gancho} Apresente naturalmente (um grito, um boato, algo à vista). O jogador pode ignorar — se ignorar até o dia ${r.localNovo.expiraEm}, o fio se resolve sem ele.`);
        pushMsgs([{ autor: "sistema", texto: `${r.localNovo.icone} Fio do mundo à vista — veja o Diário.` }]);
      }
      r.expirados.forEach((l) => partes.push(`[EVENTO LOCAL — EXPIRADO] O fio "${l.texto}" se resolveu SEM a minha intervenção (o mundo seguiu sem mim). Mencione o desfecho como notícia de passagem, se couber.`));
      if (r.questNova) {
        questsRef.current = [...questsRef.current, { titulo: r.questNova.titulo, descricao: r.questNova.descricao, objetivo: r.questNova.objetivo, tipo: "secundaria", status: "ativa", nota: "", sorteada: true }];
        setQuests([...questsRef.current]);
        partes.push(`[QUEST GERADA PELO SISTEMA — fase "${ctx.fase}" do arco] Nova missão secundária JÁ REGISTRADA no diário (NÃO envie "quest_nova" duplicando-a): "${r.questNova.titulo}" — ${r.questNova.descricao} Objetivo: ${r.questNova.objetivo}. Apresente-a na ficção com liberdade total de execução (quem procura, como, com que voz); os FATOS acima são fixos.`);
        pushMsgs([{ autor: "sistema", texto: `📜 Fio de história: ${r.questNova.titulo}` }]);
      }
      /* EVENTOS DIVINOS (v7.4): só DEPOIS do despertar — o mundo vai
         introduzindo os deuses aos poucos. 35% por descanso longo, e às
         vezes uma divindade NOVA se revela (o panteão cresce com moderação). */
      if (divindadeRef.current && divindadeRef.current.despertar && Math.random() < 0.35) {
        const dv = { ...divindadeRef.current };
        /* 25% das vezes é uma divindade nova se revelando (panteão cap: 6) */
        if (dv.panteao.length < 6 && Math.random() < 0.25) {
          const nova = gerarDivindade(ctx, diaRef.current);
          dv.panteao = [...dv.panteao, nova];
          divindadeRef.current = dv; setDivindade(dv);
          partes.push(`[DIVINDADE SE REVELA — FATOS FIXOS DO SISTEMA] Uma entidade antes imperceptível agora se mostra ao herói desperto: ${nova.icone} ${nova.nome} ${nova.dominio} — GD ${nova.gd} (${tituloDe(nova.gd)}), ${nova.temperamento}, culto: ${nova.culto}${nova.lugar ? `, forte em ${nova.lugar}` : ""}. Ela SEMPRE existiu — só agora ele a percebe. Introduza-a na ficção com sutileza (um símbolo num templo, uma prece ouvida, um sinal). NÃO mude os fatos acima.`);
          pushMsgs([{ autor: "sistema", texto: `${nova.icone} Uma divindade se revela: ${nova.nome} ${nova.dominio} (GD ${nova.gd}) — veja Ascensão.` }]);
        } else {
          const evd = gerarEventoDivino(ctx, diaRef.current, dv.panteao);
          if (evd) {
            partes.push(`[EVENTO DIVINO — FATOS FIXOS DO SISTEMA] ${evd.icone} ${evd.texto} Gancho: ${evd.gancho}. Apresente naturalmente; o jogador pode ignorar. NÃO force resolução hoje.`);
            pushMsgs([{ autor: "sistema", texto: `${evd.icone} O céu se mexe — um evento divino em curso.` }]);
          }
        }
      }
      if (partes.length) eventosMsg = "\n" + partes.join("\n");
    }
    let reinoMsg = "";
    if (tipo === "longo") { // um dia virou: o calendário anda e o reino vive
      const evs = avancarDiasReino(1);
      evs.forEach((ev) => pushMsgs([{ autor: "sistema", texto: `👑 ${ev.evento.titulo} em ${ev.cidade}: ${ev.evento.txt(ev.cidade)}` }]));
      reinoMsg = envelopeEventosReino(evs);
      minutoRef.current = AMANHECER; setMinuto(minutoRef.current);
      acordouAbsRef.current = absMin(); // o relógio do sono recomeça no amanhecer
    } else {
      minutoRef.current = (minutoRef.current + 60) % 1440; setMinuto(minutoRef.current); // cochilo de uma hora
    }
    /* SONHOS (v6.7): 25% das noites longas trazem um — presságio, memória ou
       pesadelo. Alguns deixam condição no dia seguinte. O Mestre só tece. */
    let sonhoMsg = "";
    if (tipo === "longo" && Math.random() < 0.25) {
      const sn = rolarSonho();
      if (sn.efeito === "inspirado") pers = { ...pers, condicoes: [...(pers.condicoes || []), { nome: "Inspirado", tipo: "bom", nota: "acordou com o espírito leve — um bom sonho" }] };
      if (sn.efeito === "perturbado") pers = { ...pers, condicoes: [...(pers.condicoes || []), { nome: "Perturbado", tipo: "ruim", nota: "noite mal dormida, sonhos ruins" }] };
      setPersonagem(pers);
      pushMsgs([{ autor: "sistema", texto: `💭 ${sn.texto}` }]);
      sonhoMsg = `\n[SONHO] Esta noite eu sonhei: "${sn.texto}"${sn.efeito ? ` (acordei ${sn.efeito === "inspirado" ? "INSPIRADO" : "PERTURBADO"} — condição já aplicada pelo sistema)` : ""}. Teça o sonho na ficção se quiser — presságio, memória ou puro delírio, você decide o quanto ele significa.`;
    }
    const climaNovo = tipo === "longo" ? talvezMudarClima(0.6) : null;
    const climaMsg = climaNovo ? `\n[CLIMA] O tempo virou durante a noite: agora está ${climaNovo.rotulo} — ${climaNovo.nota}.` : "";
    const dur = tipo === "longo" ? "uma noite inteira" : "cerca de uma hora";
    const localMsg = jornadaRef.current
      ? `\n[ONDE ACORDO] Eu ainda estou EM VIAGEM (${localAtualTxt()}) — acordo no mesmo lugar em que dormi (acampamento na estrada, cabine do navio, etc.). A viagem CONTINUA de onde parou: proibido me colocar em cidade/aposentos; o destino ainda está adiante.`
      : "";
    enviar(`[FIM DO ACAMPAMENTO — DESCANSO ${tipo.toUpperCase()}] Levantamos acampamento após ${dur} de descanso. PV e PM já foram restaurados pelo sistema (${tipo === "longo" ? "totalmente" : "parcialmente"}) para mim e para o grupo. Agora o mundo VOLTA a correr: narre de forma PROPORCIONAL o que se passou nesse tempo curto — pequenas mudanças plausíveis (o clima, um ruído ao longe, um viajante que passou, o avanço natural de algo já em curso). NUNCA exagere o tempo: foi só ${dur}, então nada de meses, quedas de impérios ou grandes saltos. Retome a cena e me convide a agir.${localMsg}${climaMsg}${reinoMsg}${sonhoMsg}${eventosMsg}`, pers);
  };

  /* Escolher/trocar caminho (classe). Regras:
     - só no acampamento (fora de perigo). Se não estiver acampado, avisa.
     - custa moedas (definir/preencher em branco é barato; trocar é mais caro).
     - vale para o jogador (alvo "eu") ou um companheiro (nome). */
  const CUSTO_DEFINIR = 20, CUSTO_TROCAR = 80;
  const trocarCaminho = (alvo, { raca, classe, subclasse, profissao }) => {
    if (!acampadoRef.current) { pushMsgs([{ autor: "sistema", texto: "⛺ Você precisa estar acampado para refletir sobre um novo caminho. Monte acampamento primeiro." }]); return; }
    const ehJogador = alvo === "eu";
    const atual = ehJogador ? personagem : (personagem.grupo || []).find((g) => g.nome === alvo);
    if (!atual) return;
    const jaTinha = !!atual.classe;
    const custo = jaTinha ? CUSTO_TROCAR : CUSTO_DEFINIR;
    if (personagem.moedas < custo) { pushMsgs([{ autor: "sistema", texto: `Moedas insuficientes: definir custa ${CUSTO_DEFINIR}, trocar custa ${CUSTO_TROCAR}.` }]); return; }
    const cObj = classePorNome(classe);
    const habsIniciais = cObj ? cObj.habilidades.filter((h) => h.nivel === 1).map((h) => ({ nome: h.nome, custo: h.custo, descricao: h.descricao })) : [];
    setPersonagem((p) => {
      let np = { ...p, moedas: Math.max(0, p.moedas - custo) };
      if (ehJogador) {
        np = { ...np, raca: raca || p.raca, classe, subclasse, profissao: profissao || p.profissao,
               habilidades: jaTinha ? p.habilidades : habsIniciais };
      } else {
        np = { ...np, grupo: (p.grupo || []).map((g) => g.nome === alvo ? { ...g, raca: raca || g.raca, classe, subclasse, profissao: profissao || g.profissao } : g) };
      }
      return np;
    });
    const quem = ehJogador ? "Você" : alvo;
    pushMsgs([{ autor: "sistema", texto: `✦ ${quem} ${jaTinha ? "trilhou um novo caminho" : "definiu seu caminho"}: ${[raca, classe, subclasse].filter(Boolean).join(" · ")} (−${custo} moedas)` }]);
    notaRef.current = `[INFO] ${quem} agora é ${[raca, classe, subclasse].filter(Boolean).join(", ")}${profissao ? `, profissão ${profissao}` : ""}. Reflita isso na narrativa daqui em diante.`;
  };

  const removerDoGrupo = (nome) => {
    setPersonagem((p) => ({ ...p, grupo: (p.grupo || []).filter((g) => g.nome !== nome) }));
    pushMsgs([{ autor: "sistema", texto: `${nome} deixou o grupo.` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] ${nome} saiu do meu grupo (removido pelo jogador). Reflita isso na narrativa: ${nome} não viaja mais comigo.`;
  };

  /* Troca o arco da campanha em andamento — sem reiniciar o mundo. */
  const trocarArco = (id) => {
    const est = estruturaPorId(id);
    historiaRef.current = { estrutura: id, etapa: 0 };
    pushMsgs([{ autor: "sistema", texto: `📖 Novo arco iniciado: ${est.nome} — "${est.etapas[0].nome}"` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[NOVO ARCO ESCOLHIDO PELO JOGADOR: ${est.nome}] NÃO reinicie o mundo: tudo que foi vivido permanece canônico. Costure a transição a partir da situação ATUAL — a campanha apenas muda de perspectiva dramática. Momento inicial do novo arco: "${est.etapas[0].nome}" — ${est.etapas[0].instrucao} Crie a nova missão principal coerente com este arco e com o que o herói já construiu; conclua ou adapte missões antigas que não façam mais sentido.`;
  };

  /* ---------------- GESTÃO POR CÓDIGO (zero tokens) ----------------
     Rendas caem no COFRE quando o tempo passa na história. O Mestre
     nunca calcula nada disso — só narra e registra conquistas. */
  const coletarRenda = useCallback((dias) => {
    const temGuilda = !!faccaoJogadorRef.current;
    const nDominios = dominiosDe(mapaRef.current).length;
    if ((!temGuilda && !nDominios) || dias <= 0) return 0;
    const porDia = rendaDiariaTotal(mapaRef.current, guildaRef.current.nivel, temGuilda);
    const ganho = Math.round(porDia * dias * fatorMedioReino(reinoRef.current) * estacaoDe(diaRef.current).fatorRenda); // povo feliz produz mais; inverno aperta
    if (ganho <= 0) return 0;
    const g = { ...guildaRef.current, cofre: guildaRef.current.cofre + ganho };
    guildaRef.current = g; setGuilda(g);
    pushMsgs([{ autor: "sistema", texto: `🏛 Suas terras e contratos renderam ◉ ${ganho} (${dias} dia${dias > 1 ? "s" : ""}) — no cofre${temGuilda ? ` de ${faccaoJogadorRef.current}` : ""}.` }]);
    checarConquistas();
    return ganho;
  }, [pushMsgs]);

  const depositarCofre = (valor) => {
    const v = Math.min(valor, personagem.moedas || 0);
    if (v <= 0) return;
    setPersonagem((p) => ({ ...p, moedas: p.moedas - v }));
    const g = { ...guildaRef.current, cofre: guildaRef.current.cofre + v };
    guildaRef.current = g; setGuilda(g);
    pushMsgs([{ autor: "sistema", texto: `🏛 Você depositou ◉ ${v} no cofre da guilda.` }]);
    checarConquistas();
  };

  const sacarCofre = (valor) => {
    const v = Math.min(valor, guildaRef.current.cofre);
    if (v <= 0) return;
    const g = { ...guildaRef.current, cofre: guildaRef.current.cofre - v };
    guildaRef.current = g; setGuilda(g);
    setPersonagem((p) => ({ ...p, moedas: (p.moedas || 0) + v }));
    pushMsgs([{ autor: "sistema", texto: `🏛 Você sacou ◉ ${v} do cofre da guilda.` }]);
    checarConquistas();
  };

  const melhorarGuilda = () => {
    const custo = custoUpgradeGuilda(guildaRef.current.nivel);
    if (custo == null || guildaRef.current.cofre < custo) return;
    const g = { nivel: guildaRef.current.nivel + 1, cofre: guildaRef.current.cofre - custo };
    guildaRef.current = g; setGuilda(g);
    pushMsgs([{ autor: "sistema", texto: `⚒ ${faccaoJogadorRef.current || "Sua guilda"} cresceu para o nível ${g.nivel}! Contratos maiores e domínios mais produtivos.` }]);
    checarConquistas();
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Minha guilda (${faccaoJogadorRef.current}) melhorou para o nível ${g.nivel} — maior, mais rica e mais respeitada. Reflita esse crescimento na ficção.`;
  };

  /* CONVITE AO GRUPO: o jogador convida um NPC conhecido; o Mestre decide
     na ficção se ele aceita (a escolha é do personagem, não do jogador). */
  const convidarNpc = (nome) => {
    if (bloqueado || (personagem.grupo || []).length >= MAX_COMPANHEIROS) return;
    setAba(null);
    pushMsgs([{ autor: "jogador", texto: `Convido ${nome} para viajar comigo.` }]);
    enviar(`[CONVITE AO GRUPO] Convido ${nome} para se juntar ao meu grupo. Decida pela personalidade, relação e momento dele(a): pode ACEITAR (use "grupo_adicionar" com a ficha completa), recusar com jeito, ou aceitar com uma condição. A escolha é dele(a), não minha — responda com as palavras e a reação dele(a) em 1ª pessoa.`, personagem);
  };

  /* ---------------- CONQUISTAS E VÍNCULOS (100% por código, zero tokens) ---------------- */
  const bumpCont = (campo, n = 1) => { contRef.current = { ...contRef.current, [campo]: (contRef.current[campo] || 0) + n }; };

  /* VÍNCULO: aplica pontos a um companheiro (ou a todos). Se cruzar um MARCO,
     o app concede +2 PV máx e deixa um bilhete para o Mestre criar o momento. */
  const aplicarVinculo = (grupo, nomeOuTodos, pontos, msgs) => {
    const batidos = [];
    const novo = (grupo || []).map((g) => {
      if (nomeOuTodos !== "todos" && g.nome !== nomeOuTodos) return g;
      const r = ganharVinculo(g, pontos);
      if (r.marcoNovo) batidos.push({ nome: g.nome, marco: r.marcoNovo });
      return r.membro;
    });
    batidos.forEach(({ nome, marco }) => {
      const linha = `${marco.icone} ${marco.nome}: seu vínculo com ${nome} se aprofundou — ${nome} ganha +2 PV máx`;
      if (msgs) msgs.push(linha); else pushMsgs([{ autor: "sistema", texto: linha }]);
      notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[VÍNCULO — MARCO ${marco.nome.toUpperCase()}] ${nome} alcançou o vínculo "${marco.nome}" com o herói. No momento certo (na fogueira, na estrada, após a cena atual), crie um MOMENTO ÍNTIMO: ${nome} compartilha algo pessoal — uma história, um medo, um segredo, um pedido ou um presente simbólico. Se já estivermos conversando com ele(a), pode ser agora.`;
    });
    return novo;
  };

  const checarConquistas = useCallback((pers) => {
    const p = pers || personagem;
    if (!p) return;
    const fs = mapaRef.current.faccoes || [];
    const stats = {
      ...contRef.current,
      nivel: p.nivel || 1,
      moedas: p.moedas || 0,
      companheiros: (p.grupo || []).length,
      npcs: Object.keys(npcsRef.current || {}).length,
      criaturasDescobertas: descobRef.current.length,
      cicatrizes: (p.cicatrizes || []).length,
      diasVividos: diaRef.current,
      fama: famaAtual(),
      temNemesis: !!(nemesisRef.current && nemesisRef.current.status !== "derrotada"),
      dominios: dominiosDe(mapaRef.current).length,
      temGuilda: !!faccaoJogadorRef.current,
      guildaNivel: guildaRef.current.nivel,
      cofre: guildaRef.current.cofre,
      tratados: fs.filter((f) => f.tratado === "comercio" || f.tratado === "alianca").length,
      vassalos: fs.filter((f) => f.tratado === "vassalagem").length,
      guerras: fs.filter((f) => f.tratado === "guerra").length,
      vinculoAmizade: (p.grupo || []).filter((g) => (g.vinculo || 0) >= 50).length,
      vinculoProfundo: (p.grupo || []).filter((g) => (g.vinculo || 0) >= 100).length,
      itemLendario: [...(p.equipamento || []), ...Object.values(p.equipados || {}), ...(p.grupo || []).flatMap((g) => [...(g.equipamento || []), ...Object.values(g.equipados || {})])].some((i) => i && i.raridade === "lendario"),
    };
    const novas = avaliarConquistas(stats, conqRef.current.desbloqueadas);
    if (!novas.length) return;
    const c = { desbloqueadas: { ...conqRef.current.desbloqueadas }, ordem: [...conqRef.current.ordem] };
    const msgs = novas.map((n) => {
      c.desbloqueadas[n.id] = true; c.ordem.push(n.id);
      return { autor: "sistema", texto: `🏆 Conquista desbloqueada: ${n.icone} ${n.nome} — título "${n.titulo}" (equipe no Códex)` };
    });
    conqRef.current = c; setConquistas(c);
    pushMsgs(msgs);
  }, [personagem, pushMsgs]);

  const escolherTitulo = (id) => {
    const cq = conquistaPorId(id);
    if (!cq) return;
    const novo = tituloAtivoRef.current === cq.titulo ? "" : cq.titulo;
    tituloAtivoRef.current = novo; setTituloAtivo(novo);
  };

  /* ---------------- VIAGEM E CLIMA POR TABELA (zero tokens) ----------------
     A estrada rola por código: clima, encontro (perigo do bestiário, viajante,
     achado das tabelas, cena de mundo). O Mestre só recebe o resultado e narra. */
  /* CLIMA SAZONAL (v6.7): a estação do ano pesa a tabela de clima —
     inverno congela, verão torra, outono enevoa. Tudo por código. */
  const rolarClimaEstacao = (atualId) => {
    const bias = BIAS_CLIMA[estacaoDe(diaRef.current).id] || {};
    const pool = CLIMAS.flatMap((c) => {
      const mult = bias[c.id] != null ? bias[c.id] : 1;
      if (mult === 0) return [];
      return Array(Math.max(1, Math.round(c.peso * mult))).fill(c);
    });
    let c = pool[Math.floor(Math.random() * pool.length)];
    if (atualId && c.id === atualId && pool.length > 1) c = pool[Math.floor(Math.random() * pool.length)];
    return c;
  };

  const talvezMudarClima = (chance = 0.4) => {
    if (Math.random() >= chance) return null;
    const c = rolarClimaEstacao(climaRef.current ? climaRef.current.id : null);
    climaRef.current = c; setClima(c);
    return c;
  };

  const viajar = () => {
    if (bloqueado || acampadoRef.current) return;
    if (combateRef.current) { pushMsgs([{ autor: "sistema", texto: "⚔ Não dá para viajar no meio de um combate." }]); return; }
    const c = rolarClimaEstacao(climaRef.current ? climaRef.current.id : null);
    climaRef.current = c; setClima(c);
    const enc = rolarEncontro((mundo && mundo.genero) || "Fantasia medieval", personagem.nivel || 1, null);
    /* CÓDEX: viagens e perigos da estrada contam para as conquistas */
    bumpCont("viagens");
    if (enc.tipo === "perigo") bumpCont("perigosEstrada");
    checarConquistas();
    pushMsgs([{ autor: "jogador", texto: `🧭 Sigo viagem pela estrada. ${c.icone} ${c.rotulo}` }]);
    /* JORNADA: partir marca que saímos da cidade — até o sistema registrar
       chegada, eu estou NA ESTRADA (ou no mar), não em lugar nenhum. */
    if (!jornadaRef.current) {
      jornadaRef.current = { de: cidadeAtualRef.current || "a última parada", desde: diaRef.current, meio: "" };
      setJornada(jornadaRef.current);
    }
    const extraTempo = avancarMinutos(MINUTOS_VIAGEM); // estrada come horas
    enviar(`[VIAGEM — tudo rolado pelas tabelas do app; você só NARRA, não invente outro resultado]
LOCAL ATUAL: ${localAtualTxt()}.
CLIMA AGORA: ${c.rotulo} — ${c.nota}.
ENCONTRO DO TRECHO (${enc.tipo}): ${enc.detalhe}
Descreva o trecho sob esse clima e desenvolva o encontro acima, costurando com a cena atual. Lembre-se: estou EM VIAGEM — a cena acontece no caminho${jornadaRef.current.meio ? ` (seguimos de ${jornadaRef.current.meio})` : ""}, não em cidade. Se o meio de viagem mudar, registre "jornada_meio". Se chegarmos de fato a um destino, registre "cidade_atual". Se eu estiver a caminho de algum destino, aproxime-me dele. Termine me convidando a agir.${extraTempo}`, personagem);
  };

  /* DIPLOMACIA: propostas a potências vão para a ficção; o Mestre decide a
     resposta do líder e só registra o tratado firmado — os efeitos (renda,
     tributo) são calculados pelo app. */
  const diplomacia = (faccao, acao) => {
    if (bloqueado) return;
    const ROT = { comercio: "proponho um acordo comercial", alianca: "proponho uma aliança formal", vassalagem: "exijo que se tornem meus vassalos", guerra: "declaro guerra" };
    if (!ROT[acao]) return;
    setAba(null);
    pushMsgs([{ autor: "jogador", texto: `[Diplomacia] ${ROT[acao]} a ${faccao}.` }]);
    enviar(`[DIPLOMACIA — ${faccao}] Em nome ${faccaoJogadorRef.current ? `de ${faccaoJogadorRef.current} e dos meus domínios` : "do meu próprio nome"}, ${ROT[acao]} a ${faccao}. O líder de ${faccao} responde NA FICÇÃO conforme poder, personalidade, medos e ambições: pode aceitar, exigir condições (tributo, casamento, prova de força), adiar ou recusar — a decisão é dele(a). Se um acordo for firmado ou rompido, registre em "mapa_faccoes": [{"nome":"${faccao}","tratado":"comercio|alianca|vassalagem|guerra|nenhum","relacao":"aliada|neutra|inimiga","notas":"termos do acordo"}]. NÃO invente valores econômicos — os efeitos dos tratados são calculados pelo app.`, personagem);
  };

  /* PRESENTE DIPLOMÁTICO: ◉ 40 do cofre da guilda, enviado na ficção.
     O Mestre decide a reação (pode melhorar relação, abrir porta para
     tratado, ou ofender se mal dado) — a decisão é do líder. */
  const CUSTO_PRESENTE = 40;
  const presentearFaccao = (faccao) => {
    if (bloqueado) return;
    if (!faccaoJogadorRef.current) { pushMsgs([{ autor: "sistema", texto: "🎁 Sem uma guilda, você não tem um cofre nem mensageiros para presentear potências." }]); return; }
    if (guildaRef.current.cofre < CUSTO_PRESENTE) { pushMsgs([{ autor: "sistema", texto: `🎁 Presentear custa ◉ ${CUSTO_PRESENTE} do cofre — e o cofre tem ◉ ${guildaRef.current.cofre}.` }]); return; }
    const g = { ...guildaRef.current, cofre: guildaRef.current.cofre - CUSTO_PRESENTE };
    guildaRef.current = g; setGuilda(g);
    bumpCont("presentes"); checarConquistas();
    setAba(null);
    pushMsgs([{ autor: "sistema", texto: `🎁 ◉ ${CUSTO_PRESENTE} do cofre viram um presente digno para ${faccao}.` }]);
    enviar(`[PRESENTE DIPLOMÁTICO — ${faccao}] Em nome de ${faccaoJogadorRef.current}, envio um presente suntuoso (◉ ${CUSTO_PRESENTE}, já descontados pelo sistema) ao líder de ${faccao}. Ele(a) reage NA FICÇÃO conforme a personalidade e a relação: pode se agradar e aquecer os laços (atualize "mapa_faccoes" com relacao/notas), pode devolver um gesto à altura, pode achar pouco, ou até se ofender se o presente soar como suborno. O efeito na relação é a SUA decisão narrativa; valores de gestão continuam por conta do app.`, personagem);
  };

  /* RECALIBRAR LENDA: saves antigos ficaram para trás da própria história
     (herói lendário com números de iniciante). O Mestre relê o livro e o
     cânone e PROPÕE nível/atributos; o app calcula PV/PM pelas tabelas e
     o jogador confirma. Uma chamada leve, sob demanda. */
  const [recal, setRecal] = useState(null); // null | "pedindo" | { proposta, justificativa }
  const recalibrarLenda = async () => {
    if (bloqueado || recal === "pedindo") return;
    setAba(null);
    setRecal("pedindo");
    try {
      const sys = `Você é o ARQUIVISTA da campanha "${nomeCampanha}". Um save antigo deixou os números do herói para trás da lenda. Leia o LIVRO e o CÂNONE e proponha os números JUSTOS de hoje, baseando-se SÓ no que aconteceu na história (feitos, combates vencidos, anos de estrada). Responda SOMENTE JSON no formato: {"nivel": <inteiro 1-20>, "atributos": {"forca":0-5,"agilidade":0-5,"vigor":0-5,"intelecto":0-5,"vontade":0-5,"presenca":0-5}, "justificativa": "2-3 frases citando os feitos que sustentam a proposta"}.`;
      const conteudo = `LIVRO DA CAMPANHA:\n${livroRef.current || "(vazio)"}\n\nCÂNONE:\n${formatarCanone(canoneRef.current)}\n\nHERÓI HOJE: nível ${personagem.nivel}; atributos ${JSON.stringify(personagem.atributos)}.`;
      const r = await chamarModelo(sys, [{ role: "user", content: conteudo }], 800, "json", "leve");
      const j = parseObjetoTolerante(r);
      if (!j || j.nivel == null) throw new Error("o arquivista não respondeu com números");
      const nivel = Math.min(20, Math.max(1, Math.round(j.nivel)));
      const at = { ...personagem.atributos };
      for (const k of Object.keys(at)) if (j.atributos && j.atributos[k] != null) at[k] = Math.min(5, Math.max(0, Math.round(j.atributos[k])));
      const vidaMax = pvEsperadoJogador(nivel, at.vigor);
      const manaMax = 8 + (nivel - 1) * 2 + at.intelecto * 2;
      setRecal({ proposta: { nivel, atributos: at, vidaMax, manaMax }, justificativa: j.justificativa || "" });
    } catch (e) {
      pushMsgs([{ autor: "sistema", texto: `⚠ Não consegui recalibrar: ${e.message}` }]);
      setRecal(null);
    }
  };
  const aplicarRecalibragem = () => {
    const p = recal && recal.proposta;
    if (!p) return;
    setPersonagem((old) => ({ ...old, nivel: p.nivel, atributos: p.atributos, vidaMax: p.vidaMax, manaMax: p.manaMax, vida: p.vidaMax, mana: p.manaMax }));
    pushMsgs([{ autor: "sistema", texto: `⚖ Lenda recalibrada: nível ${p.nivel}, PV ${p.vidaMax}, PM ${p.manaMax}. Seus números agora honram seus feitos.` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Recalibração de save: meus números oficiais agora são nível ${p.nivel}, PV ${p.vidaMax}, PM ${p.manaMax} — coerentes com tudo que já vivi. Trate-os como verdade daqui em diante.`;
    setRecal(null);
    setTimeout(() => checarConquistas(), 0);
  };

  /* RECALIBRAR MUNDO: o irmão do "recalibrar lenda" para os SISTEMAS que o
     save antigo não conhecia — companheiros (nível/classe), pessoas (fichas),
     potências e tratados, cidades dominadas e o nível da guilda. O arquivista
     relê livro e cânone e PROPÕE o estado; o jogador confirma antes de aplicar. */
  const [recalM, setRecalM] = useState(null); // null | "pedindo" | { proposta, justificativa }
  const [recalAsc, setRecalAsc] = useState(null); // null | "pedindo" | { proposta, justificativa }
  const recalibrarMundo = async () => {
    if (bloqueado || recalM === "pedindo") return;
    setAba(null);
    setRecalM("pedindo");
    try {
      const sys = `Você é o ARQUIVISTA da campanha "${nomeCampanha}". O save é antigo: os sistemas de gestão (guilda, domínios, diplomacia, fichas de pessoas) e os números dos companheiros ficaram para trás da história. Leia o LIVRO e o CÂNONE e proponha o estado JUSTO de hoje, baseando-se SÓ no que aconteceu. Responda SOMENTE JSON:
{"justificativa":"2-3 frases",
 "companheiros":[{"nome":"(exatamente como no grupo)","nivel":1-20,"classe":"","subclasse":"","conceito":""}],
 "npcs":[{"nome":"","papel":"","relacao":"aliado|amigo|romance|familia|neutro|rival|inimigo","genero":"","local":"","status":"vivo|morto|desaparecido","notas":""}],
 "faccoes":[{"nome":"","tipo":"guilda|reino|culto|cla|corporacao","lider":"","relacao":"jogador|aliada|neutra|inimiga","tratado":"nenhum|comercio|alianca|vassalagem|guerra","poder":"menor|regional|grande|imperio","notas":"","doJogador":false}],
 "cidades":[{"nome":"","tipo":"vila|cidade|capital|fortaleza","regiao":"","relacao":"jogador|aliada|neutra|hostil","sede":false}],
 "guildaNivel":1-5}
Regras: nível dos companheiros coerente com o tempo de estrada e os feitos (quem acompanha um herói nível ${personagem.nivel} desde o início NÃO está no nível 1); marque doJogador=true SÓ na facção que o herói lidera; cidades com relacao "jogador" são as que ele domina; inclua só pessoas/facções/cidades que EXISTEM na história.
SEJA BREVE para não cortar o JSON: notas com no máximo 8 palavras, sem descrições longas; limites — até 12 npcs, 8 facções, 12 cidades. Se houver mais, escolha os mais importantes.`;
      const conteudo = `LIVRO DA CAMPANHA:\n${livroRef.current || "(vazio)"}\n\nCÂNONE:\n${formatarCanone(canoneRef.current)}\n\nGRUPO HOJE: ${(personagem.grupo || []).map((g) => `${g.nome} (nível ${g.nivel ?? 1})`).join(", ") || "sem companheiros"}\nMAPA HOJE: ${(mapaRef.current.cidades || []).map((c) => c.nome).join(", ") || "vazio"}\nFACÇÕES HOJE: ${(mapaRef.current.faccoes || []).map((f) => f.nome).join(", ") || "nenhuma"}\nPESSOAS HOJE: ${Object.keys(npcsRef.current).join(", ") || "ninguém"}`;
      const r = await chamarModelo(sys, [{ role: "user", content: conteudo }], 3000, "json", "leve");
      const j = parseObjetoTolerante(r);
      if (!j) throw new Error("o arquivista não respondeu com o estado do mundo");
      setRecalM({ proposta: j, justificativa: j.justificativa || "" });
    } catch (e) {
      pushMsgs([{ autor: "sistema", texto: `⚠ Não consegui recalibrar o mundo: ${e.message}` }]);
      setRecalM(null);
    }
  };

  const aplicarRecalMundo = () => {
    const j = recalM && recalM.proposta;
    if (!j) return;
    const msgs = [];
    /* 1) Companheiros: nível, classe e ficha (PV recalculado pela mesma regra do grupo) */
    if (Array.isArray(j.companheiros) && j.companheiros.length) {
      setPersonagem((old) => ({
        ...old,
        grupo: (old.grupo || []).map((g) => {
          const p = j.companheiros.find((x) => (x.nome || "").toLowerCase() === g.nome.toLowerCase());
          if (!p) return g;
          const nivel = Math.min(20, Math.max(1, Math.round(p.nivel || g.nivel || 1)));
          const vidaMax = Math.max(g.vidaMax || 10, 10 + (nivel - 1) * 3);
          msgs.push(`⚑ ${g.nome}: nível ${g.nivel ?? 1} → ${nivel}${p.classe ? `, ${p.classe}${p.subclasse ? ` ${p.subclasse}` : ""}` : ""}`);
          return { ...g, nivel, vidaMax, vida: vidaMax, classe: p.classe || g.classe, subclasse: p.subclasse || g.subclasse, conceito: p.conceito || g.conceito };
        }),
      }));
    }
    /* 2) Pessoas: fichas dos NPCs importantes da história */
    let reg = npcsRef.current, tocouN = false;
    (j.npcs || []).forEach((n) => {
      if (!n || !n.nome) return;
      const chave = Object.keys(reg).find((k) => k.toLowerCase() === n.nome.toLowerCase());
      const ficha = chave ? mesclarNPC(reg[chave], n) : criarNPC(n.nome, n);
      if (!tocouN) { reg = { ...reg }; tocouN = true; }
      reg[chave || n.nome] = ficha;
    });
    if (tocouN) { npcsRef.current = reg; setNpcs(reg); msgs.push(`👥 ${(j.npcs || []).filter((n) => n && n.nome).length} pessoa(s) recalibrada(s) no elenco`); }
    /* 3) Potências e cidades: mesmo merge do mapa usado nas respostas do Mestre */
    let mp = { cidades: [...(mapaRef.current.cidades || [])], faccoes: [...(mapaRef.current.faccoes || [])] };
    (j.cidades || []).forEach((cd) => {
      if (!cd || !cd.nome) return;
      const i = mp.cidades.findIndex((c) => c.nome.toLowerCase() === cd.nome.toLowerCase());
      if (i === -1) mp.cidades.push(criarCidade(cd.nome, cd));
      else mp.cidades[i] = { ...mp.cidades[i], ...cd, x: mp.cidades[i].x, y: mp.cidades[i].y };
    });
    (j.faccoes || []).forEach((fc) => {
      if (!fc || !fc.nome) return;
      const i = mp.faccoes.findIndex((f) => f.nome.toLowerCase() === fc.nome.toLowerCase());
      if (i === -1) mp.faccoes.push(criarFaccao(fc.nome, fc));
      else mp.faccoes[i] = { ...mp.faccoes[i], ...fc };
      if (fc.doJogador) faccaoJogadorRef.current = fc.nome;
    });
    mapaRef.current = mp; setMapa(mp);
    if ((j.cidades || []).length || (j.faccoes || []).length) msgs.push(`🗺 ${(j.cidades || []).length} cidade(s) e ${(j.faccoes || []).length} potência(s) recalibradas`);
    /* 4) Nível da guilda (cofre preservado) */
    if (j.guildaNivel) {
      const gn = Math.min(NIVEL_GUILD_MAX, Math.max(1, Math.round(j.guildaNivel)));
      if (gn !== guildaRef.current.nivel) { const g = { ...guildaRef.current, nivel: gn }; guildaRef.current = g; setGuilda(g); msgs.push(`🏛 Guilda recalibrada para o nível ${gn}`); }
    }
    /* 5) O prompt precisa enxergar o mundo novo já no próximo turno */
    systemRef.current = montarSystemPrompt(nomeCampanha, mundo, personagem, livroRef.current, canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade());
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Recalibração de save: o estado do mundo (guilda, domínios, potências, pessoas, companheiros) foi atualizado para refletir tudo que já aconteceu. Trate os registros atuais como verdade.`;
    pushMsgs(msgs.map((t) => ({ autor: "sistema", texto: t })).concat([{ autor: "sistema", texto: "⚖ Mundo recalibrado. Confira Gestão: Grupo, Pessoas, Guilda, Domínios e Diplomacia agora contam a sua história." }]));
    setRecalM(null);
    setTimeout(() => checarConquistas(), 0);
  };

  /* RECALIBRAR ASCENSÃO (v7.4.1): saves onde a história JÁ fez do herói uma
     divindade chegaram antes do sistema existir. O arquivista relê livro e
     cânone e propõe o estado divino JUSTO — o sistema aplica com tetos. */
  const recalibrarAscensao = async () => {
    if (bloqueado || recalAsc === "pedindo") return;
    setAba(null);
    setRecalAsc("pedindo");
    try {
      const dv = divindadeRef.current || garantirDivindade(null);
      const sys = `Você é o ARQUIVISTA da campanha "${nomeCampanha}". O sistema de ASCENSÃO (graus divinos GD 0-4) chegou depois: a história pode já ter feito do herói algo divino, ou ele pode ser só um mortal lendário. Leia o LIVRO e o CÂNONE e proponha o estado divino JUSTO, baseando-se SÓ no que aconteceu de fato. Responda SOMENTE JSON:
{"justificativa":"2-3 frases citando os feitos que fundamentam",
 "desperto": true/false,
 "estagio": 0-3,
 "gd": 0-4,
 "fieis": número,
 "pf": número,
 "dominio": "uma palavra (ex.: Tempestade, Forja, Vingança) ou vazio",
 "patrono": "divindade que o patrocina, se houver, ou vazio",
 "divindades": [{"nome":"","dominio":"","gd":2-4,"temperamento":"","culto":""}]}
ESCALA DE FATOS (não de vibes): gd 0 = mortal, mesmo lendário; gd 1 = herói cultuado localmente (mil fiéis); gd 2 = semideus, cultos em várias cidades (10 mil); gd 3 = divindade menor, templos, milagres atendidos (100 mil); gd 4 = divindade maior, religião continental (1 milhão). Só marque desperto=true se o herói tem nível ${personagem.nivel} ≥ 15 E há sinais de culto/poder divino na história. fieis e pf coerentes com o gd proposto (mínimos: gd1≥1000, gd2≥10000, gd3≥100000, gd4≥1000000). Se a história NÃO mostra divindade nenhuma no mundo, devolva "divindades": []. Máx. 6 divindades, só as que EXISTEM na história.`;
      const conteudo = `LIVRO DA CAMPANHA:\n${livroRef.current || "(vazio)"}\n\nCÂNONE:\n${formatarCanone(canoneRef.current)}\n\nHERÓI: ${personagem.nome}, nível ${personagem.nivel}, ${patamarDe(personagem.nivel).nome}\nASCENSÃO REGISTRADA HOJE: desperto=${dv.despertar ? "sim" : "não"}, ${dv.fieis} fiéis, ${dv.pf} PF, GD ${grauDe(dv)}, domínio "${dv.dominio || "—"}", patrono "${dv.patrono || "—"}", panteão: ${(dv.panteao || []).map((d) => `${d.nome} (GD ${d.gd})`).join(", ") || "vazio"}`;
      const r = await chamarModelo(sys, [{ role: "user", content: conteudo }], 2500, "json", "leve");
      const j = parseObjetoTolerante(r);
      if (!j) throw new Error("o arquivista não respondeu com o estado da ascensão");
      setRecalAsc({ proposta: j, justificativa: j.justificativa || "" });
    } catch (e) {
      pushMsgs([{ autor: "sistema", texto: `⚠ Não consegui recalibrar a ascensão: ${e.message}` }]);
      setRecalAsc(null);
    }
  };

  const aplicarRecalAscensao = () => {
    const j = recalAsc && recalAsc.proposta;
    if (!j) return;
    const dv = { ...(divindadeRef.current || garantirDivindade(null)) };
    const msgs = [];
    /* TETO DE SEGURANÇA: gd 0-4, fiéis 0-2M, pf 0-500 — o mínimo do degrau é garantido por código */
    let gd = Math.max(0, Math.min(4, Math.round(j.gd || 0)));
    if (!j.desperto) gd = 0;
    let fieis = Math.max(0, Math.min(2000000, Math.round(j.fieis || 0)));
    if (gd > 0) fieis = Math.max(fieis, GRAUS[gd].fieis);
    const pf = Math.max(0, Math.min(500, Math.round(j.pf || 0)));
    dv.despertar = !!j.desperto && (personagem.nivel || 1) >= NIVEL_DESPERTAR;
    if (!dv.despertar) { setRecalAsc(null); pushMsgs([{ autor: "sistema", texto: "⚖ O arquivista não encontrou sinais de divindade na sua lenda — a ascensão segue o curso normal." }]); return; }
    const antes = grauDe(dv);
    dv.fieis = fieis; dv.pf = pf;
    if (j.estagio != null) dv.estagio = Math.max(0, Math.min(3, Math.round(j.estagio)));
    if (j.dominio && !dv.dominio) dv.dominio = String(j.dominio).slice(0, 40);
    if (j.patrono && !dv.patrono) dv.patrono = String(j.patrono).slice(0, 60);
    /* Panteão: mescla por nome — os já registrados pelo sistema não são reescritos */
    const pan = [...(dv.panteao || [])];
    (Array.isArray(j.divindades) ? j.divindades : []).slice(0, 6).forEach((d) => {
      if (!d || !d.nome) return;
      const gdD = Math.max(2, Math.min(4, Math.round(d.gd || 2)));
      const i = pan.findIndex((x) => (x.nome || "").toLowerCase() === String(d.nome).toLowerCase());
      const ficha = { nome: String(d.nome).slice(0, 40), dominio: String(d.dominio || "").slice(0, 40), gd: gdD, temperamento: String(d.temperamento || "").slice(0, 60), culto: String(d.culto || "").slice(0, 60), fieis: GRAUS[gdD].fieis, icone: "🌌", reveladaDia: diaRef.current };
      if (i === -1) pan.push(ficha); else pan[i] = { ...pan[i], ...ficha, icone: pan[i].icone };
    });
    dv.panteao = pan.slice(0, 8);
    divindadeRef.current = dv; setDivindade(dv);
    const depois = grauDe(dv);
    msgs.push(`🌟 Ascensão recalibrada: GD ${antes} → GD ${depois} · ${tituloDe(depois)} · ${dv.fieis.toLocaleString("pt-BR")} fiéis · ${dv.pf} PF`);
    if (dv.dominio) msgs.push(`🌌 Domínio: ${dv.dominio}`);
    if (pan.length) msgs.push(`🏛 Panteão: ${pan.map((d) => `${d.nome} (GD ${d.gd})`).join(", ")}`);
    /* O Mestre precisa TRATAR isso como fato já no próximo turno */
    systemRef.current = montarSystemPrompt(nomeCampanha, mundo, personagem, livroRef.current, canoneRef.current, bancoNomesRef.current, (resumoMapaParaPrompt(mapaRef.current, faccaoJogadorRef.current) + "\n" + resumoDiplomacia(mapaRef.current, faccaoJogadorRef.current)).trim(), resumoHistoria(historiaRef.current), resumoQuests(questsRef.current), resumoNPCsParaPrompt(npcsRef.current), tempoInfoPrompt(), infoDivindade());
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[ASCENSÃO — RECALIBRAÇÃO DO SISTEMA] O estado divino do herói foi alinhado com a história já jogada: GD ${depois} (${tituloDe(depois)}), ${dv.fieis} fiéis, ${dv.pf} PF${dv.dominio ? `, domínio ${dv.dominio}` : ""}${dv.patrono ? `, patrono ${dv.patrono}` : ""}. Trate como verdade estabelecida — a história já o reconhecia assim.`;
    pushMsgs(msgs.map((t) => ({ autor: "sistema", texto: t })));
    setRecalAsc(null);
    salvar({ personagem });
  };

  /* Transfere um item entre você e um companheiro (qualquer direção). */
  const transferirItem = (de, para, origem, nomeIt) => {
    const p = personagem;
    const igual = (x) => ((typeof x === "string" ? x : (x && x.nome) || "").toLowerCase() === nomeIt.toLowerCase());
    let np = { ...p, grupo: [...(p.grupo || [])] };
    let item = null;
    if (de === "eu") {
      const arr = [...(np[origem] || [])];
      const i = arr.findIndex(igual);
      if (i < 0) return;
      item = arr.splice(i, 1)[0];
      np[origem] = arr;
      const gi = np.grupo.findIndex((g) => g.nome === para);
      if (gi < 0) return;
      /* equipamentos vão para a mochila de equipamentos do companheiro (ele pode equipar) */
      const ehEquipDar = item && typeof item === "object" && item.tipo && item.raridade;
      np.grupo[gi] = ehEquipDar
        ? { ...np.grupo[gi], equipamento: [...(np.grupo[gi].equipamento || []), item] }
        : { ...np.grupo[gi], inventario: [...(np.grupo[gi].inventario || []), item] };
    } else {
      const gi = np.grupo.findIndex((g) => g.nome === de);
      if (gi < 0) return;
      /* procura primeiro na bolsa comum, depois na mochila de equipamentos */
      let arr = [...(np.grupo[gi].inventario || [])];
      let i = arr.findIndex(igual);
      let eraEquip = false;
      if (i < 0) {
        arr = [...(np.grupo[gi].equipamento || [])];
        i = arr.findIndex(igual);
        eraEquip = i >= 0;
      }
      if (i < 0) return;
      item = arr.splice(i, 1)[0];
      np.grupo[gi] = eraEquip ? { ...np.grupo[gi], equipamento: arr } : { ...np.grupo[gi], inventario: arr };
      const ehEquip = item && typeof item === "object" && item.tipo && item.raridade;
      if (ehEquip) np.equipamento = [...(np.equipamento || []), item]; else np.inventario = [...(np.inventario || []), item];
    }
    /* VÍNCULO: dar um item a um companheiro é um gesto que conta (+8) */
    if (de === "eu" && para !== "eu") np = { ...np, grupo: aplicarVinculo(np.grupo, para, 8, null) };
    setPersonagem(np);
    const nomeFinal = typeof item === "string" ? item : (item && item.nome) || "item";
    const deTxt = de === "eu" ? "você" : de, paraTxt = para === "eu" ? "você" : para;
    pushMsgs([{ autor: "sistema", texto: `◆ ${nomeFinal}: ${deTxt} → ${paraTxt}` }]);
    notaRef.current = `${notaRef.current ? notaRef.current + "\n" : ""}[INFO] Transferi "${nomeFinal}" de ${deTxt} para ${paraTxt}.`;
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
          {fase === "jogo" && statusSave && <span className="tv-mono text-[10px] uppercase tracking-wider" style={{ color: statusSave === "erro" ? T.danger : T.inkDim }}>{statusSave === "salvando" ? "salvando…" : statusSave === "erro" ? "⚠ FALHA AO SALVAR" : "✓ salvo"}</span>}
          {fase === "jogo" && !acampado && <button onClick={acampar} disabled={bloqueado} className="rounded-lg p-1.5" style={{ border: `1px solid ${T.line}` }} title="Montar acampamento"><span style={{ color: T.amberSoft, fontSize: 15 }}>⛺</span></button>}
          {fase === "jogo" && <button onClick={() => setMostrarRolagens((v) => !v)} className="rounded-lg p-1.5" style={{ border: `1px solid ${mostrarRolagens ? T.amber : T.line}` }} title={mostrarRolagens ? "Rolagens de combate: visíveis" : "Rolagens de combate: ocultas"}><span style={{ color: mostrarRolagens ? T.amberSoft : T.inkDim, fontSize: 13 }}>🎲</span></button>}
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
                    <div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-1.5" style={{ color: T.amber }}>
                      <IconeD20 tamanho={13} /> Mestre
                      <button
                        onClick={() => ouvirMestre(i, m.texto)}
                        title={voz && voz.i === i ? (voz.status === "gerando" ? "Preparando a voz… (toque para cancelar)" : "Parar a leitura") : "Ouvir o Mestre narrar esta mensagem"}
                        className="ml-1 normal-case tracking-normal rounded-full flex items-center justify-center"
                        style={{
                          width: 22, height: 22, fontSize: 12, lineHeight: 1,
                          color: voz && voz.i === i ? T.onAccent : T.inkDim,
                          background: voz && voz.i === i ? T.amber : "transparent",
                          border: `1px solid ${voz && voz.i === i ? T.amber : T.line}`,
                          opacity: 0.9,
                        }}
                      >
                        {voz && voz.i === i ? (voz.status === "gerando" ? "…" : "⏸") : "🔊"}
                      </button>
                    </div>
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
            {combate && <PainelCombate combate={combate} onEncerrarTurno={encerrarTurnoCombate} />}

            {sugestoes.length > 0 && !carregando && !rolagem && !habAbertas && (
              <div className="px-4 md:px-8 pb-2 flex flex-wrap gap-2" style={{ paddingRight: "68px" }}>
                {sugestoes.map((s, i) => <button key={i} onClick={() => agir(s)} className="tv-body text-sm px-3.5 py-2 rounded-full" style={{ border: `1px solid ${T.line}`, color: T.amberSoft, background: "transparent" }}>{s}</button>)}
              </div>
            )}

            {habAbertas && <PainelHabilidades personagem={personagem} selecionar={(h) => { setHabSel(h); setHabAbertas(false); }} fechar={() => setHabAbertas(false)} />}
            {acoesAbertas && (
              <div className="px-4 md:px-8 pb-2 shrink-0" style={{ paddingRight: "68px" }}>
                <div className="rounded-2xl p-3" style={{ background: T.panel, border: `1px solid ${T.amber}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="tv-mono text-[10px] uppercase tracking-widest" style={{ color: T.amberSoft }}>Ações — toque para preencher e complete o alvo</span>
                    <button onClick={() => setAcoesAbertas(false)} className="tv-mono text-[10px] px-2" style={{ color: T.inkDim }}>✕</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ACOES_PRONTAS.map((a) => (
                      <button key={a.rotulo} onClick={() => { setEntrada(a.texto); setAcoesAbertas(false); }} className="tv-mono text-[11px] px-2.5 py-1.5 rounded-lg" style={{ background: T.panelSoft, color: T.ink, border: `1px solid ${T.line}` }}>
                        {a.icone} {a.rotulo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {habSel && !rolagem && (
              <div className="tv-fade px-4 md:px-8 pb-1.5" style={{ paddingRight: "68px" }}>
                <div className="inline-flex items-center gap-2 rounded-full pl-3.5 pr-1.5 py-1.5" style={{ background: T.panelSoft, border: `1px solid ${T.violet}` }}>
                  <span className="tv-mono text-xs" style={{ color: T.violetSoft }}>✦ {habSel.nome} · {habSel.custo} PM</span>
                  <button onClick={() => setHabSel(null)} className="tv-mono text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ background: T.line, color: T.inkDim }}>✕</button>
                </div>
              </div>
            )}

            {masmorra && !acampado && (
              <div className="tv-fade mx-4 md:mx-8 mb-2 rounded-2xl p-3.5" style={{ background: T.panel, border: `1px solid ${T.violet}`, marginRight: "68px" }}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="tv-mono text-[10px] uppercase tracking-widest truncate" style={{ color: T.violetSoft }}>🕳 {masmorra.nome}</div>
                  <div className="tv-mono text-[10px] shrink-0" style={{ color: T.inkDim }}>sala {masmorra.idx}/{masmorra.salas.length - 1}{masmorra.salas[masmorra.idx] ? ` · ${(ROTULO_SALA[masmorra.salas[masmorra.idx].tipo] || "").toLowerCase()}` : ""}</div>
                </div>
                <div className="h-1 rounded-full overflow-hidden mb-2.5" style={{ background: T.panelSoft }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.round((masmorra.idx / (masmorra.salas.length - 1)) * 100)}%`, background: T.violet }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={avancarMasmorra} disabled={bloqueado || !!combate} className="flex-1 tv-mono text-[11px] px-3 py-2 rounded-lg" style={{ background: T.violet, color: T.onSecond, fontWeight: 600, opacity: bloqueado || combate ? 0.45 : 1 }}>
                    ⛏ Avançar{masmorra.salas[masmorra.idx + 1] ? ` — ${(ROTULO_SALA[masmorra.salas[masmorra.idx + 1].tipo] || "").toLowerCase()}` : ""}
                  </button>
                  <button onClick={sairDaMasmorra} disabled={bloqueado || !!combate} title="Fugir abandona a masmorra e tudo que ainda não foi conquistado" className="tv-mono text-[11px] px-3 py-2 rounded-lg" style={{ border: `1px solid ${T.danger}`, color: T.danger, opacity: bloqueado || combate ? 0.45 : 1 }}>🏃 fugir</button>
                </div>
                <div className="tv-body text-[11px] mt-1.5" style={{ color: T.inkDim }}>Os espólios de cada sala já entram na sua bolsa sozinhos. <b>Fugir</b> abandona a masmorra — e o que ainda resta nela fica para trás. Ao vencer o chefe, a masmorra se conclui e você sai com tudo.</div>
              </div>
            )}

            {acampado && (
              <div className="tv-fade mx-4 md:mx-8 mb-2 rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.amber}`, marginRight: "68px" }}>
                <div className="tv-mono text-xs uppercase tracking-widest mb-1" style={{ color: T.amberSoft }}>⛺ Acampamento — o tempo está pausado</div>
                <div className="tv-body text-sm mb-3" style={{ color: T.inkDim }}>Converse com o grupo à vontade. Quando quiser retomar a jornada, escolha um descanso:</div>
                <div className="flex flex-wrap gap-2">
                  <Botao pequeno onClick={() => sairDoAcampamento("curto")} desativado={bloqueado}>🔥 Descanso curto <span style={{ opacity: 0.7 }}>· recupera parte</span></Botao>
                  <Botao primario pequeno onClick={() => sairDoAcampamento("longo")} desativado={bloqueado}>🌙 Descanso longo <span style={{ opacity: 0.7 }}>· recupera tudo</span></Botao>
                </div>
              </div>
            )}

            <div className="px-4 md:px-8 flex items-center gap-3 md:gap-4 pb-1.5 flex-wrap" style={{ paddingRight: "68px" }}>
              <BarraMini rotulo="PV" atual={personagem.vida} max={personagem.vidaMax} cor={T.amber} corBaixa={T.danger} />
              <BarraMini rotulo="PM" atual={personagem.mana} max={personagem.manaMax} cor={T.violet} />
              <span className="tv-mono text-[10px] shrink-0" style={{ color: T.amberSoft }}>NV {personagem.nivel}</span>
              <span className="tv-mono text-[10px] shrink-0" title={`${estacaoDe(dia).nome} — ${estacaoDe(dia).nota} · o app controla o relógio`} style={{ color: T.inkDim }}>📅 {dataTxt(dia)} · {horaTxt(minuto)}{ehNoite(minuto) ? " 🌙" : ""} {estacaoDe(dia).icone}</span>
              {clima && <span className="tv-mono text-[10px] shrink-0" title={clima.nota} style={{ color: T.inkDim }}>{clima.icone} {clima.rotulo}</span>}
              <BarraMini rotulo="XP" atual={personagem.xp} max={XP_POR_NIVEL(personagem.nivel)} cor={T.ok} />
            </div>

            {(personagem.condicoes || []).length > 0 && (
              <div className="px-4 md:px-8 flex items-center gap-1.5 pb-1.5 flex-wrap" style={{ paddingRight: "68px" }}>
                {personagem.condicoes.map((c, i) => (
                  <span key={i} className="tv-mono text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" title={c.efeito}
                    style={{ background: c.tipo === "bom" ? "#1f3320" : "#33201f", border: `1px solid ${c.tipo === "bom" ? T.ok : T.danger}`, color: c.tipo === "bom" ? T.ok : T.danger }}>
                    {c.tipo === "bom" ? "✦" : "☠"} {c.nome} <span style={{ opacity: 0.7 }}>{c.turnos}t</span>
                  </span>
                ))}
              </div>
            )}

            {mostrarHoras && (
              <div className="tv-fade mx-4 md:mx-8 mb-2 rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.amber}`, marginRight: "68px" }}>
                <div className="tv-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: T.amberSoft }}>🕐 Passar o tempo · quanto o mundo se move</div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 4, 6, 8, 12, 24].map((h) => (
                    <button key={h} onClick={() => passarTempo(h)} className="tv-mono text-xs rounded-lg px-3 py-2" style={{ background: T.panelSoft, border: `1px solid ${T.line}`, color: T.ink }}>{h}h</button>
                  ))}
                  <button onClick={() => setMostrarHoras(false)} className="tv-mono text-xs rounded-lg px-3 py-2" style={{ color: T.inkDim }}>cancelar</button>
                </div>
              </div>
            )}

            {aguardandoMundo && !bloqueado && !rolagem ? (
              <div className="px-4 md:px-8 shrink-0" style={{ paddingRight: "68px", paddingBottom: "20px" }}>
                {/* responder move o mundo junto — você fala E o mundo vive o instante */}
                <div className="flex gap-2 rounded-2xl p-2 min-w-0 mb-2" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
                  <input value={entrada} onChange={(e) => setEntrada(e.target.value)} onKeyDown={(e) => e.key === "Enter" && responderEMover(entrada)}
                    placeholder="Responder / falar…"
                    className="flex-1 bg-transparent outline-none tv-body text-[15px] px-3 min-w-0" style={{ color: T.ink }} />
                  <Botao primario pequeno desativado={!entrada.trim()} onClick={() => responderEMover(entrada)}>Responder →</Botao>
                </div>
                <div className="flex items-stretch gap-2">
                  <button onClick={vezDoMundo} className="tv-fade flex-1 rounded-2xl py-3 tv-mono text-sm flex items-center justify-center gap-2" style={{ background: T.amber, color: T.onAccent, fontWeight: 700, letterSpacing: "0.05em" }}>
                    🌍 VEZ DO MUNDO →{autoMundo && mundoRestante != null && <span className="text-[10px] font-normal opacity-80">{entrada.trim() ? "auto pausado (você está digitando)" : `auto em ${mundoRestante}s`}</span>}
                  </button>
                  <button onClick={() => setAutoMundo((v) => !v)} title={autoMundo ? "Turno do mundo automático: LIGADO (60s parado = o mundo vive) — toque para desligar" : "Turno do mundo automático: desligado — toque para ligar"}
                    className="tv-mono text-xs rounded-2xl px-3 shrink-0" style={{ background: T.panel, color: autoMundo ? T.ok : T.inkDim, border: `1px solid ${T.line}`, fontWeight: 600 }}>
                    {autoMundo ? "⏳" : "✋"}
                  </button>
                  <button onClick={() => setMostrarHoras((v) => !v)} title="Passar mais tempo" className="tv-mono text-xs rounded-2xl px-4 shrink-0" style={{ background: T.panel, color: T.amberSoft, border: `1px solid ${T.line}`, fontWeight: 600 }}>
                    🕐<span className="hidden md:inline"> Horas</span>
                  </button>
                </div>
              </div>
            ) : (
            <div className="px-4 md:px-8 shrink-0" style={{ paddingRight: "68px", paddingBottom: rolagem ? "6px" : "20px" }}>
              {/* LINHA 1 — ferramentas: rótulos sempre visíveis, sem roubar espaço da escrita */}
              <div className="flex items-center gap-1.5 mb-2">
                <button onClick={() => { setAcoesAbertas((v) => !v); setHabAbertas(false); }} disabled={bloqueado} className="tv-mono text-[11px] rounded-full px-3 py-1.5"
                  style={{ background: acoesAbertas ? T.amber : "transparent", color: acoesAbertas ? T.onAccent : T.amberSoft, border: `1px solid ${T.amber}`, fontWeight: 600, opacity: bloqueado ? 0.4 : 1 }}>
                  ⚔ Ações
                </button>
                <button onClick={() => { setHabAbertas((v) => !v); setAcoesAbertas(false); }} disabled={bloqueado} className="tv-mono text-[11px] rounded-full px-3 py-1.5"
                  style={{ background: habAbertas ? T.violet : "transparent", color: habAbertas ? T.onSecond : T.violetSoft, border: `1px solid ${T.violet}`, fontWeight: 600, opacity: bloqueado ? 0.4 : 1 }}>
                  ✦ Habilidades
                </button>
                <button onClick={() => setMostrarHoras((v) => !v)} disabled={bloqueado || acampado} title="Passar o tempo" className="tv-mono text-[11px] rounded-full px-3 py-1.5"
                  style={{ background: mostrarHoras ? T.amber : "transparent", color: mostrarHoras ? T.onAccent : T.amberSoft, border: `1px solid ${T.line}`, fontWeight: 600, opacity: (bloqueado || acampado) ? 0.4 : 1 }}>
                  🕐 Tempo
                </button>
                <button onClick={viajar} disabled={bloqueado || acampado} title="Seguir viagem: clima e encontro rolados pelas tabelas" className="tv-mono text-[11px] rounded-full px-3 py-1.5"
                  style={{ background: "transparent", color: T.amberSoft, border: `1px solid ${T.line}`, fontWeight: 600, opacity: (bloqueado || acampado) ? 0.4 : 1 }}>
                  🧭 Viajar
                </button>
                <button onClick={entrarMasmorra} disabled={bloqueado || acampado || !!masmorra} title="Explorar uma masmorra: salas roladas por tabela, tesouro e chefe por código" className="tv-mono text-[11px] rounded-full px-3 py-1.5"
                  style={{ background: "transparent", color: T.violetSoft, border: `1px solid ${T.line}`, fontWeight: 600, opacity: (bloqueado || acampado || masmorra) ? 0.4 : 1 }}>
                  🕳 Masmorra
                </button>
              </div>
              {/* LINHA 2 — escrita: largura inteira, campo alto e confortável */}
              <div className="flex gap-2 rounded-2xl p-2 min-w-0" style={{ background: T.panel, border: `1px solid ${habSel ? T.violet : T.line}` }}>
                <input value={entrada} onChange={(e) => setEntrada(e.target.value)} onKeyDown={(e) => e.key === "Enter" && agir(entrada)}
                  placeholder={rolagem ? "Role o dado abaixo…" : habSel ? `Como você usa ${habSel.nome}?` : "O que você faz? Fale, aja, explore…"}
                  disabled={bloqueado} className="flex-1 bg-transparent outline-none tv-body text-[15px] px-3 py-1.5 min-w-0" style={{ color: T.ink }} />
                <Botao primario pequeno desativado={bloqueado || !entrada.trim()} onClick={() => agir(entrada)}>Agir →</Botao>
              </div>
            </div>
            )}

            {rolagem && !carregando && (
              <div className="tv-fade px-4 md:px-8 pb-5 flex justify-center" style={{ paddingRight: "68px" }}>
                <div className="tv-pulse flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl px-4 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
                  <span className="tv-mono text-xs text-center" style={{ color: T.ink }}>🎲 Teste de {rolagem.atributo || "sorte"}{rolagem.dificuldade != null ? ` · dif. ${rolagem.dificuldade}` : ""} — <em className="tv-body" style={{ color: T.inkDim }}>{rolagem.motivo}</em></span>
                  <Botao primario pequeno desativado={dadoRolando} onClick={() => { if (!dadoRolando) setDadoRolando(true); }}>Rolar d20{modPend !== 0 ? ` (+${modPend})` : ""}</Botao>
                </div>
              </div>
            )}

              <div ref={fimRef} style={{ height: 8 }} />
            </div>

            {/* botão flutuante: volta para a última mensagem / área de ação */}
            {longeDoFim && (
              <button onClick={irParaOFim} className="tv-fade absolute rounded-full flex items-center justify-center"
                style={{ right: "84px", bottom: "28px", width: 46, height: 46, background: T.panel, border: `1px solid ${T.amber}`, color: T.amberSoft, fontSize: 21, zIndex: 25, boxShadow: "0 4px 14px rgba(0,0,0,.45)" }}
                title="Ir para a última mensagem">↓</button>
            )}

          </main>

          <TrilhoAbas abaAtiva={aba} aoClicar={setAba} nGrupo={(personagem.grupo || []).length} desperto={!!(divindade && divindade.despertar) || (personagem.nivel || 1) >= NIVEL_DESPERTAR} />
          <LimiteErro><PainelLateral aba={aba} fechar={() => setAba(null)} personagem={personagem} mundo={mundo} equipar={equipar} desequipar={desequipar} descartarItem={descartarItem} descartarEquip={descartarEquip} trocarCaminho={trocarCaminho} acampado={acampado} removerDoGrupo={removerDoGrupo} mapa={mapa} faccaoJogador={faccaoJogadorRef.current} cidadeAtual={cidadeAtualRef.current} transferirItem={transferirItem} historia={historiaRef.current} quests={quests} trocarArco={trocarArco} npcs={npcs} guilda={guilda} depositarCofre={depositarCofre} sacarCofre={sacarCofre} melhorarGuilda={melhorarGuilda} convidarNpc={convidarNpc} onDiplomacia={diplomacia} onPresente={presentearFaccao} recalibrarLenda={recalibrarLenda} recalibrarMundo={recalibrarMundo} conquistas={conquistas} tituloAtivo={tituloAtivo} escolherTitulo={escolherTitulo} descobertas={descobertas} contadores={contRef.current} equiparComp={equiparComp} desequiparComp={desequiparComp} desmontarEquip={desmontarEquip} forjar={forjar} mural={mural} aceitarContrato={aceitarContrato} abandonarContrato={abandonarContrato} garantirMural={garantirMural} decretos={decretos} pregarDecreto={pregarDecreto} cancelarDecreto={cancelarDecreto} definirRelacao={definirRelacao} reino={reino} famaInfo={{ f: Math.round(famaAtual()), pf: patamarFama(famaAtual()) }} nemesis={nemesis} nomeCampanha={nomeCampanha} dia={dia} onExportarCronica={exportarCronica} eventos={eventos} correio={correio} enviarCarta={enviarCarta} responderPeticao={responderPeticao} divindade={divindade} onDespertar={() => checarDespertar(personagem)} onRecalibrarAsc={recalibrarAscensao} recalAscState={recalAsc} /></LimiteErro>
        {/* RECALIBRAGEM DE LENDA: proposta do arquivista, decisão do jogador */}
        {recal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.6)" }}>
            <div className="rounded-2xl p-5 w-80 space-y-3" style={{ background: T.panel, border: `1px solid ${T.amber}` }}>
              <h3 className="tv-display text-xl" style={{ color: T.ink }}>⚖ Recalibrar lenda</h3>
              {recal === "pedindo" ? (
                <p className="tv-body text-sm italic" style={{ color: T.inkDim }}>O arquivista relê o livro da campanha e os seus feitos…</p>
              ) : (
                <>
                  <p className="tv-body text-sm" style={{ color: T.inkDim }}>{recal.justificativa}</p>
                  <div className="rounded-xl p-3" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                    <div className="tv-mono text-sm" style={{ color: T.amberSoft }}>Nível {personagem.nivel} → <b>{recal.proposta.nivel}</b></div>
                    <div className="tv-mono text-sm" style={{ color: T.amberSoft }}>PV {personagem.vidaMax} → <b>{recal.proposta.vidaMax}</b> · PM {personagem.manaMax} → <b>{recal.proposta.manaMax}</b></div>
                    <div className="tv-mono text-[10px] mt-1" style={{ color: T.inkDim }}>{Object.entries(recal.proposta.atributos).map(([k, v]) => `${k.slice(0, 3).toUpperCase()} ${v}`).join(" · ")}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setRecal(null)} className="flex-1 tv-mono text-xs px-2 py-2 rounded-lg" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>manter como está</button>
                    <button onClick={aplicarRecalibragem} className="flex-1 tv-mono text-xs px-2 py-2 rounded-lg font-semibold" style={{ background: T.amber, color: T.onAccent, border: `1px solid ${T.amber}` }}>aplicar</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {/* RECALIBRAGEM DO MUNDO: estado proposto dos sistemas, decisão do jogador */}
        {recalM && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.6)" }}>
            <div className="rounded-2xl p-5 w-80 space-y-3 tv-scroll overflow-y-auto" style={{ background: T.panel, border: `1px solid ${T.amber}`, maxHeight: "80vh" }}>
              <h3 className="tv-display text-xl" style={{ color: T.ink }}>⚖ Recalibrar mundo</h3>
              {recalM === "pedindo" ? (
                <p className="tv-body text-sm italic" style={{ color: T.inkDim }}>O arquivista relê o livro, o cânone e os registros — companheiros, pessoas, potências, cidades, guilda…</p>
              ) : (
                <>
                  <p className="tv-body text-sm" style={{ color: T.inkDim }}>{recalM.justificativa}</p>
                  <div className="rounded-xl p-3 space-y-1.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                    {(recalM.proposta.companheiros || []).length > 0 && (
                      <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>⚑ Companheiros: {recalM.proposta.companheiros.map((c) => `${c.nome} nv.${c.nivel}${c.classe ? ` (${c.classe})` : ""}`).join(" · ")}</div>
                    )}
                    {(recalM.proposta.npcs || []).length > 0 && <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>👥 Pessoas: {(recalM.proposta.npcs || []).length} ficha(s)</div>}
                    {(recalM.proposta.faccoes || []).length > 0 && <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>⚜ Potências: {(recalM.proposta.faccoes || []).length}</div>}
                    {(recalM.proposta.cidades || []).length > 0 && <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>🗺 Cidades: {(recalM.proposta.cidades || []).length} ({(recalM.proposta.cidades || []).filter((c) => c.relacao === "jogador").length} dominada(s))</div>}
                    {recalM.proposta.guildaNivel != null && <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>🏛 Guilda nível {recalM.proposta.guildaNivel}</div>}
                  </div>
                  <p className="tv-body text-xs" style={{ color: T.inkDim }}>Aplicar mescla nos registros atuais — nada é apagado, só atualizado. O cofre da guilda é preservado.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setRecalM(null)} className="flex-1 tv-mono text-xs px-2 py-2 rounded-lg" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>manter como está</button>
                    <button onClick={aplicarRecalMundo} className="flex-1 tv-mono text-xs px-2 py-2 rounded-lg font-semibold" style={{ background: T.amber, color: T.onAccent, border: `1px solid ${T.amber}` }}>aplicar</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {recalAsc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.6)" }}>
            <div className="rounded-2xl p-5 w-80 space-y-3 tv-scroll overflow-y-auto" style={{ background: T.panel, border: `1px solid ${T.violetSoft}`, maxHeight: "80vh" }}>
              <h3 className="tv-display text-xl" style={{ color: T.ink }}>⚖ Recalibrar ascensão</h3>
              {recalAsc === "pedindo" ? (
                <p className="tv-body text-sm italic" style={{ color: T.inkDim }}>O arquivista relê o livro e o cânone em busca de sinais de culto, milagres e divindades…</p>
              ) : (
                <>
                  <p className="tv-body text-sm" style={{ color: T.inkDim }}>{recalAsc.justificativa}</p>
                  <div className="rounded-xl p-3 space-y-1.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                    <div className="tv-mono text-[11px]" style={{ color: T.violetSoft }}>🌟 {recalAsc.proposta.desperto ? `GD ${Math.max(0, Math.min(4, Math.round(recalAsc.proposta.gd || 0)))} · ${tituloDe(Math.max(0, Math.min(4, Math.round(recalAsc.proposta.gd || 0))))}` : "sem sinais de divindade"}</div>
                    {recalAsc.proposta.desperto && <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>🙏 {Number(recalAsc.proposta.fieis || 0).toLocaleString("pt-BR")} fiéis · ✨ {Number(recalAsc.proposta.pf || 0)} PF</div>}
                    {recalAsc.proposta.dominio && <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>🌌 Domínio: {recalAsc.proposta.dominio}</div>}
                    {recalAsc.proposta.patrono && <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>🙏 Patrono: {recalAsc.proposta.patrono}</div>}
                    {(recalAsc.proposta.divindades || []).length > 0 && <div className="tv-mono text-[11px]" style={{ color: T.amberSoft }}>🏛 Divindades: {(recalAsc.proposta.divindades || []).map((d) => `${d.nome} (GD ${d.gd})`).join(", ")}</div>}
                  </div>
                  <p className="tv-body text-xs" style={{ color: T.inkDim }}>Aplicar alinha o painel Ascensão à história já jogada — fiéis, PF, domínio e panteão. Registros existentes não são apagados.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setRecalAsc(null)} className="flex-1 tv-mono text-xs px-2 py-2 rounded-lg" style={{ border: `1px solid ${T.line}`, color: T.inkDim }}>manter como está</button>
                    <button onClick={aplicarRecalAscensao} className="flex-1 tv-mono text-xs px-2 py-2 rounded-lg font-semibold" style={{ background: T.violetSoft, color: "#1A1206", border: `1px solid ${T.violetSoft}` }}>aplicar</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
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
