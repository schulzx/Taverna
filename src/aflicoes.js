/* ============================================================
   AFLIÇÕES (v9.1) — quem carrega condição, e como ela passa

   A pergunta que este módulo responde: "esta adaga envenenada
   deveria envenenar?" — e responde SOZINHO, sem perguntar ao
   Mestre. Toda fonte de golpe (arma, habilidade, magia, garra de
   bicho) é lida contra um catálogo de PORTADORES; se casar, o
   sistema rola o dado e a condição passa ou não. O Mestre recebe
   o resultado pronto e narra.

   Isso vale para TODO MUNDO em cena: herói, companheiros e
   inimigos usam as mesmas regras e o mesmo catálogo. Ninguém
   envenena ninguém por força de adjetivo bonito na narração.
   ============================================================ */

import { CONDICOES, criarCondicao } from "./condicoes.js";

/* ---------------- PORTADORES ----------------
   Cada linha é "o que, na ficção, carrega qual condição". A ordem
   importa: a primeira que casar vence (do mais específico para o mais
   genérico). `alvo` diz em quem a condição cai — no inimigo atingido,
   em quem usou, ou nos aliados de quem usou.

   `chance` é a probabilidade de o golpe SEQUER tentar afligir (um
   crítico sempre tenta); `dif` soma na dificuldade do teste do alvo.

   A FRONTEIRA DE PALAVRA (Fase MM, as paredes · 29/09). Até aqui cada
   linha casava por PEDAÇO: "Sussurro assombrado", o golpe do Necromante,
   inspirava o bando de quem o lançava, porque "assombrado" contém
   "brado"; a "Clava de Ossos" queimava ("c-LAVA"); o "Coração" da
   Tormenta abençoava ("c-ORAÇÃO"); "Emaranhar" envenenava ("em-ARANHA-r");
   a "Bomba de Fumaça" atordoava ("fu-MAÇA") em vez de cegar; o "Atalho"
   sangrava, o "Bosque Acorda" prendia, "Disparo Calibrado" inspirava.
   Agora toda linha começa por `(?<!\p{L})` — o pedaço só casa no começo
   de uma palavra (com a flag `u`, que é o que faz "é" e "ç" serem letra
   para a fronteira; o `\b` do JavaScript não os vê).
   ONDE A PALAVRA CERTA TEM O PEDAÇO NO MEIO, ela entra por extenso e com
   o nome: "envenen", "intoxic", "apavor", "aterroriz", "apress",
   "abrasad", "sanguessuga". E onde o pedaço é uma palavra inteira que,
   esticada, vira outra — "cobra"/"cobrança", "chama"/"chamado",
   "garra"/"garrafa", "rede"/"redenção", "carga"/"cargo" —, ela fecha
   também no fim (`(?!\p{L})`), com o plural. "enfraquec" passou a ler o
   verbo ("o alvo enfraquece") e não o estado ("executa alvo
   enfraquecido" é a condição da execução, não o efeito do golpe).
   Varrido o acervo inteiro (716 textos: habilidades de classe,
   subclasse, especialização e grimório, os dois catálogos de golpe, o
   bestiário e as armas), 36 mudam de portador, e as 36 estão nomeadas em
   `teste-afl.mjs`; nenhuma linha casa mais um pedaço no meio de palavra. */
export const PORTADORES = [
  /* ---- debuffs no alvo ---- */
  { id: "veneno",     re: /(?<!\p{L})(?:venen|envenen|peçonh|pecconh|tóxic|toxic|intoxic|víbora|vibora|serpente|escorpi|aranha|naja|cobras?(?!\p{L})|ácido|acido)/iu, cond: "envenenado", alvo: "alvo", chance: 0.55, dif: 0 },
  { id: "fogo",       re: /(?<!\p{L})(?:flamej|ígne|igne|fogo|chamas?(?!\p{L})|incandes|brasa|abrasad|infern|piro|lava(?!\p{L})|magma|solar)/iu,                       cond: "queimando",  alvo: "alvo", chance: 0.5,  dif: 0 },
  { id: "sangria",    re: /(?<!\p{L})(?:serrilh|dilacer|estripa|rasga|garras?(?!\p{L})|talho|sangr|acutilan|farpad)/iu,                               cond: "sangrando",  alvo: "alvo", chance: 0.45, dif: 0 },
  /* Estes dois vêm ANTES dos debuffs de propósito: "Grito de Guerra" e
     "Postura Defensiva" são buffs, mas casariam com "grito" (terror) e
     "guarda" se a ordem fosse outra. A primeira linha que casa vence. */
  /* v9.265 (H1): três frases de habilidade de CLASSE que prometiam vantagem
     ao grupo e não abriam condição nenhuma — "Cria abertura: aliado ganha
     vantagem" (Distração), "aliados próximos ganham eco do seu poder"
     (Ressonância) e "empresta poder do pacto a um aliado" (Dádiva Sombria).
     As três entram como FRASE INTEIRA, não como palavra solta: "abertura",
     "eco" e "empresta" sozinhos casariam com meia dúzia de golpes e com a
     descrição de criatura, e um falso positivo aqui inspira o grupo inteiro
     porque um zumbi arrombou uma porta. */
  { id: "inspiracao", re: /(?<!\p{L})(?:grito de guerra|inspir|canção|cancao|hino|balada|arenga|estandarte|brados?(?!\p{L})|cria abertura|eco do seu poder|empresta poder)/iu,          cond: "inspirado",  alvo: "aliados", chance: 1, dif: 0 },
  /* v9.265 (H1): "Armadura Sombria — trevas protetoras envolvem o corpo" tem
     a palavra "protetoras", que NÃO casa com `prote[çc]` (é "protet", não
     "protec"). Um nível 1 de Bruxo prometia abrigo e entregava a linha. */
  /* v9.278 (F2) · O AMPARO, E É A LINHA QUE PARTE `guarda` AO MEIO.
     O que distingue a família `protege` (`APLICACAO_DO_BUFF`, combos.js) das
     duas irmãs que já compram não é QUANTO, é EM QUEM: `absorve` compra
     pontos, `amortece` compra proporção, e esta promete um corpo que NÃO é o
     de quem usou. A ficha di-lo com todas as letras em quatro entradas de
     `AGUARDAM` — "protege um ALIADO adjacente", "protege um ALIADO de dano",
     "um espírito protege um ALIADO" — e o sistema entregava o abrigo a quem
     conjurava, porque `guarda` é `alvo: "proprio"` e apanhava a frase antes
     de alguém perguntar de quem ela falava.

     A MÁQUINA JÁ EXISTIA, E É POR ISSO QUE ESTA ETAPA NÃO TEM UMA LINHA DE
     `App.jsx`: `alvo: "aliados"` tem dois leitores vivos na fiação do herói
     (`aplicarBuffDeHabilidade`) e do companheiro (`buffDeCompanheiro`), mais
     um terceiro na régua de Uma Vida. `bencao` e `inspiracao` já o usavam.
     O caminho do abrigo até outro corpo estava aberto e ninguém o tomava.

     O RECORTE É A FRASE INTEIRA, E FOI MEDIDO — é a lição de H1 e H4 cobrada
     na família onde ela é mais perigosa, porque a palavra "escudo" aparece
     dos dois lados da briga (há veto escrito sobre isso em `combos.js:161`).
     Duas condições ao mesmo tempo, e as duas têm de estar na frase:
       (1) o VERBO de proteger — `proteg`, e só ele. Não "escudo", não
           "barreira", não "muralha". Medido no acervo de 593: com as palavras
           de abrigo dentro, o recorte sobe de 9 para 12 e as três que entram
           não prometem proteger ninguém — "Escudo do Aliado Caído" arrasta um
           caído, "Vida Emprestada" transfere PV, "Cerca Viva" cresce entre o
           grupo e o perigo. Era o regex a ser alargado até as habilidades
           casarem, que é exatamente o que H4 proibiu por asserção.
       (2) o CORPO declarado — `aliad`, "o grupo", "quem estiver perto".
     Quem promete proteção e NÃO nomeia outro corpo fica onde estava: é o caso
     de "Armadura Sombria — trevas protetoras envolvem O CORPO", que continua
     em `guarda` (e continua a casar pela alternativa literal que H1 escreveu,
     porque "protetoras" é "protet", não "proteg").

     NOVE FRASES DO ACERVO INTEIRO MUDAM DE LADO, e nenhuma outra: seis diziam
     "aliado" e três dizem "o grupo"/"quem estiver perto". As três últimas são
     as mais bem servidas de todas — `aliados` entrega EXATAMENTE "você e o
     grupo", que é o que elas prometem, com zero de sobra. Bestiário e itens
     passam pelo mesmo `aflicaoDe` e foram medidos contra este recorte: zero.

     `chance: 1` pelo motivo de `guarda`, `bencao` e `inspiracao` — amparar
     não é o efeito colateral de um golpe, é o turno inteiro.

     E VEM ANTES DE `guarda` porque a ordem desta tabela é do mais específico
     para o mais genérico, e duas condições casadas são mais específicas que
     uma palavra solta. Medido: nenhuma das nove casa qualquer portador que
     venha antes desta linha, então a posição é a mínima que funciona. */
  { id: "amparo",     re: /(?=[\s\S]*proteg)(?=[\s\S]*(aliad|o grupo|quem estiver perto))/i,                                   cond: "protegido", alvo: "aliados", chance: 1, dif: 0 },
  { id: "guarda",     re: /(?<!\p{L})(?:postura defensiv|defensiv|escudo|barreira|prote[çc]|trevas protetoras|muralha|couraça|couraca|égide|egide|aparar|bloquei|reduz o dano)/iu, cond: "protegido", alvo: "proprio", chance: 1, dif: 0 },

  /* v9.276 (H4) · A MARCA, E ELA ENTRA POR FRASE INTEIRA — nunca pela
     palavra "marca". É a lição de H1 cobrada na família mais perigosa
     para a soltar: o acervo tem ONZE habilidades que começam por "Marca
     um alvo" e prometem coisas que não têm nada a ver umas com as
     outras — quem não foge (Perseguição Sagrada), quem é sempre
     localizado (Contrato Aberto), quem não é errado (Mira Assistida),
     quem cura ao cair (Marca do Fim). Um `/marca/` cru transformaria as
     onze em dano extra, e todas de uma vez.

     A PALAVRA QUE RECORTA É **TODOS**. Esta linha casa só com a promessa
     de que o alvo apanha mais DE QUALQUER UM — "sofre dano extra de
     todos" (Julgamento, Clérigo nv7) e "todo dano contra ele aumenta"
     (Marca Mortal, subclasses.js). A outra metade da família — Marca do
     Caçador e Maldição do Patrono, que prometem dano extra **SEU** —
     fica DE FORA de propósito: ela pede saber de quem é a marca, e nem
     o efeito nem a instância de condição carregam dono hoje. Dar-lhes
     esta linha seria entregar-lhes mais do que prometem e chamar isso
     de paga.

     `chance: 1` porque a marca não é o efeito colateral de um golpe — é
     o golpe inteiro. Onde o veneno da lâmina pergunta "pegou desta
     vez?", uma habilidade cujo texto é a marca não tem essa pergunta.
     É a mesma razão de `inspiracao` e `guarda`, e é o que as separa das
     aflições de arma. O alvo continua com a salvaguarda de entrada que
     `rolarAflicao` rola para todo `alvo: "alvo"`.

     Vem ANTES de `concussao` e das restantes porque a ordem é do mais
     específico para o mais genérico, e uma frase inteira é o mais
     específico que esta tabela tem. */
  { id: "marca",      re: /sofre dano extra de todos|todo dano contra ele aumenta/i,                                          cond: "marcado",    alvo: "alvo", chance: 1,    dif: 0 },

  { id: "concussao",  re: /(?<!\p{L})(?:atordo|concuss|maças?(?!\p{L})|maca de|martelo|marreta|clava|pancada|trov[aã]o|estrondo|cabeçada)/iu,          cond: "atordoado",  alvo: "alvo", chance: 0.35, dif: 1 },
  { id: "paralisia",  re: /(?<!\p{L})(?:paralis|petrific|basilisco|medusa|estase|entorpec)/iu,                                             cond: "paralisado", alvo: "alvo", chance: 0.35, dif: 1 },
  { id: "gelo",       re: /(?<!\p{L})(?:gélid|gelid|gelo|congel|glacial|nevasca|frio mordaz)/iu,                                           cond: "lento",      alvo: "alvo", chance: 0.5,  dif: 0 },
  { id: "cegueira",   re: /(?<!\p{L})(?:cega|cegue|ofusc|clarão|clarao|areia nos olhos|fumaça|fumaca|flash)/iu,                            cond: "cego",       alvo: "alvo", chance: 0.45, dif: 0 },
  { id: "terror",     re: /(?<!\p{L})(?:terror|aterroriz|pavor|apavor|medo|amedront|uivo|berro|aterrad|macabr|espectr|assombr|arrepi)/iu,                   cond: "amedrontado", alvo: "alvo", chance: 0.45, dif: 0 },
  /* v9.45: "prende", "imobiliza", "impede de sair do lugar" são a mesma coisa
     que rede e teia, e faltavam. A varredura de habilidades encontrou Prisão
     Arcana ("Prende um inimigo por 2 turnos") e Armadilha ("Prende o primeiro
     inimigo que passar") sem nenhum portador — duas habilidades cujo efeito
     inteiro é a palavra que ninguém estava lendo. */
  { id: "prisao",     re: /(?<!\p{L})(?:redes?(?!\p{L})|teias?(?!\p{L})|laço|laco|cordas?(?!\p{L})|grilh[aã]o|agarr|enred|lama|piche|raiz|vinhas?(?!\p{L})|prend[ea]|prision|aprision|imobiliz|algem|cativ)/iu, cond: "agarrado",   alvo: "alvo", chance: 0.5,  dif: 0 },
  /* "para de lutar", "sai da luta", "não ataca mais" — o Fascínio do Bardo
     dizia isso por extenso e o sistema não tinha onde encaixar. */
  { id: "fascinio",   re: /(?<!\p{L})(?:fascin|para de lutar|deixa de lutar|baixa a arma|perde a vontade de lutar|encara sem reagir)/iu,     cond: "enfeiticado", alvo: "alvo", chance: 0.5, dif: 1 },
  /* "impede de usar habilidades" (Toque da Quietude) e "silêncio": quem não
     conjura perde a ação mágica, e Atordoado é o mais próximo do catálogo.
     SILENCIAR NÃO É SER SILENCIOSO (29/09, etapa do empilhamento). O
     `silenc` desta linha é o verbo de calar alguém — silencia, silenciar,
     silenciado —, e apanhava também o adjetivo de quem anda sem ruído:
     "Passos Silenciosos — move-se sem ser detectado" atordoava; "Bote
     Silencioso" e o "golpe silencioso" do Toque do Fim, idem. O adjetivo
     tem dono escrito, a linha `sombra` lá em baixo (`silencios`), que
     nunca era alcançada porque esta vinha antes. Por isso `silenc` recusa
     o "-ios-" do adjetivo, e "silêncio" (com o acento, que o `silenc`
     nunca casou) entra por extenso. */
  { id: "quietude",   re: /(?<!\p{L})(?:impede.{0,20}(habilidade|magia|conjur)|silenc(?!ios)|silênci|emudec|sela a voz|sem conseguir conjurar)/iu,          cond: "atordoado",  alvo: "alvo", chance: 0.5, dif: 1 },
  { id: "encanto",    re: /(?<!\p{L})(?:encant|enfeitiç|enfeitic|domin(?!go)|hipnot|sedu|canto de sereia|sussurr|persuas[aã]o arcana)/iu,        cond: "enfeiticado", alvo: "alvo", chance: 0.4,  dif: 1 },
  { id: "derrubada",  re: /(?<!\p{L})(?:derrub|investida|rasteira|empurr|tromba|arremete|cargas?(?!\p{L})|placagem)/iu,                               cond: "caido",      alvo: "alvo", chance: 0.45, dif: 0 },
  { id: "drenagem",   re: /(?<!\p{L})(?:drena|suga|sanguessuga|debilit|enfraquece(?:r|m)?(?!\p{L})|fica enfraquecid|maldi[çc]|praga|definha|murcha)/iu,                                   cond: "enfraquecido", alvo: "alvo", chance: 0.45, dif: 0 },
  { id: "lentidao",   re: /(?<!\p{L})(?:lentid|retard|melaço|melaco|atras|peso do tempo)/iu,                                              cond: "lento",      alvo: "alvo", chance: 0.5,  dif: 0 },

  /* ---- buffs em quem usa ou nos aliados ---- */
  /* CONSAGRAR É O VERBO, NÃO O ADJETIVO (29/09, etapa do empilhamento).
     "Golpe consagrado" é o golpe das criaturas sagradas, e "Golpe
     Consagrado" o do Paladino ("a arma brilha: dano sagrado extra no
     impacto"): nos dois é a LÂMINA que é consagrada, e o golpe fere com
     luz. O `consagra` casava o adjetivo e dava a bênção aos aliados de
     quem golpeava — o bando do monstro abençoado pelo golpe que o monstro
     dá, e o grupo do Paladino abençoado a cada ataque que a ficha não
     promete. Agora é só o verbo — "consagra o chão", "consagrar",
     "consagram" —, a mesma regra que `drenagem` usa para "enfraquece". No
     acervo inteiro, os dois golpes eram os únicos que a palavra apanhava;
     o dano sagrado deles é do elemento (`sagrado`, perfil de dano), não
     de uma condição. */
  { id: "bencao",     re: /(?<!\p{L})(?:bênção|bencao|abençoa|abencoa|consagra(?:r|m)?(?!\p{L})|graça divina|milagre menor|oração|oracao)/iu, cond: "abencoado",  alvo: "aliados", chance: 1, dif: 0 },
  { id: "furia",      re: /(?<!\p{L})(?:fúria|furia|frenesi|enfurec|berserk|sanha)/iu,                                       cond: "enfurecido", alvo: "proprio", chance: 1, dif: 0 },
  { id: "pressa",     re: /(?<!\p{L})(?:pressa|apress|acelera|velocidade|ligeireza|ímpeto|impeto|passo rápido|passo rapido)/iu,      cond: "apressado",  alvo: "proprio", chance: 1, dif: 0 },
  /* v9.265 (H1): `invisib` não casa com "invisível" — é "invisív". "Desaparecer
     — sai de combate e fica invisível por 1 turno" passava batido pelos dois
     lados da alternância, e o Ladino de nível 6 sumia só na frase.

     E A ALTERNATIVA É "FICA INVISÍVEL", NÃO "INVISÍVEL". A varredura do acervo
     mostrou o preço da palavra solta: um `invisiv` cru transformava em
     esconderijo do próprio conjurador seis coisas que não escondem ninguém —
     "Cortes INVISÍVEIS atingem todos em linha" (um ataque), "Ver o Invisível",
     "Detectar Magia", "Porta Dimensional", "Olho Arcano" e "Não Pisco" (que
     ENXERGA invisíveis). Quem fica invisível diz que FICA. */
  { id: "sombra",     re: /(?<!\p{L})(?:furtiv|sombra|invisib|fica invis[ií]vel|silencios|camufla|espreita)/iu,              cond: "furtivo",    alvo: "proprio", chance: 1, dif: 0 },
  { id: "vigor",      re: /(?<!\p{L})(?:fortalec|força bruta|forca bruta|potenciali)/iu,                                     cond: "fortalecido", alvo: "proprio", chance: 1, dif: 0 },
];

/* Lê qualquer fonte (nome da arma + elemento, nome+descrição da habilidade,
   nome+descrição da criatura) e diz o que ela carrega. */
export function aflicaoDe(...partes) {
  const texto = partes.filter(Boolean).join(" ");
  if (!texto.trim()) return null;
  for (const p of PORTADORES) if (p.re.test(texto)) return p;
  return null;
}

/* Atributo que resiste a cada condição — o catálogo já diz; aqui só o
   traduzimos para a ficha de quem quer que esteja apanhando. */
function modDoAlvo(alvo, attr) {
  const a = (alvo && alvo.atributos) || {};
  const base = a[attr] != null ? a[attr] : Math.max(a.vigor || 0, a.destreza || 0, a.intelecto || 0);
  /* inimigos não têm ficha de atributos: usam o próprio nível como corpo */
  const porNivel = Math.floor(((alvo && alvo.nivel) || 1) / 4);
  return (Number(base) || 0) + porNivel;
}

/* ---------------- O DADO QUE DECIDE ----------------
   Um só ponto de verdade: quem tenta afligir, quem resiste, e o texto
   pronto para o jogador e para o Mestre. Devolve null quando a fonte
   não carrega nada (a maioria dos golpes). */
/* v9.60: `bonusResistir` e `rotuloResistir` entram por fora. Esta função
   sempre rolou uma resistência — atributo cru mais nível/4 —, e o que ela
   rolava ERA uma salvaguarda sem saber que era. Quando quem resiste é o
   herói, o App passa o bônus de salvaguarda de verdade (com a proficiência
   da classe) e o nome dela, e a linha na tela deixa de dizer "o golpe
   tentou" para dizer o que de fato aconteceu. Sem os dois, o comportamento
   é o de antes — que é o que vale para inimigos, que não têm classe. */
export function rolarAflicao({ fonte, nomeFonte = "", atacante = "", alvo, alvoNome = "", critico = false, sempre = false, bonusResistir = null, rotuloResistir = "", vantagem = false, desvantagem = false }) {
  const port = typeof fonte === "object" && fonte ? fonte : aflicaoDe(fonte);
  if (!port) return null;
  const cat = CONDICOES[port.cond];
  if (!cat) return null;
  if (!sempre && !critico && Math.random() > port.chance) return null;
  /* já está sob a mesma condição? não empilha */
  if ((alvo && (alvo.condicoes || []).some((c) => c.id === port.cond))) return null;

  const cond = criarCondicao(port.cond, { origem: nomeFonte || atacante });
  if (!cond) return null;

  /* buffs não têm resistência: quem se abençoa, se abençoa */
  if (port.alvo !== "alvo") {
    return {
      aplicou: true, resistiu: false, cond, portador: port, escopo: port.alvo,
      texto: `${cond.icone} ${atacante || "Alguém"} — ${nomeFonte || cond.nome}: ${cond.nome}${cond.turnos ? ` (${cond.turnos}t)` : ""}`,
      nota: `[EFEITO APLICADO PELO SISTEMA] ${nomeFonte || cond.nome} deixou ${port.alvo === "proprio" ? atacante : "o grupo"} ${cond.nome.toLowerCase()} (${cond.efeito}). Já está aplicado — narre a manifestação, não recalcule nem envie condição.`,
    };
  }

  const dif = ((cat.resistir && cat.resistir.dif) || 12) + (port.dif || 0) + (critico ? 2 : 0);
  const attr = (cat.resistir && cat.resistir.attr) || "vigor";
  const mod = bonusResistir != null ? Number(bonusResistir) || 0 : modDoAlvo(alvo, attr);
  /* vantagem é DOIS DADOS, não um bônus fixo — o Gnomo e o Sintético
     prometem "vantagem para resistir ao que é mental", e traduzir isso em
     "+3" seria trocar a promessa por outra coisa parecida. */
  const um = () => 1 + Math.floor(Math.random() * 20);
  const a1 = um();
  const d20 = vantagem ? Math.max(a1, um()) : desvantagem ? Math.min(a1, um()) : a1;
  const rolo = d20 + mod;
  const nomeAlvo = alvoNome || (alvo && alvo.nome) || "o alvo";
  const comoSeChama = rotuloResistir || "resistência";
  const conta = `d20 ${d20}${mod ? ` + ${mod}` : ""} = ${rolo} vs ${dif}`;

  if (rolo >= dif) {
    return {
      aplicou: false, resistiu: true, cond, portador: port, escopo: "alvo", salva: rotuloResistir || "", rolo, dif, d20, mod,
      texto: rotuloResistir
        ? `🛡 ${comoSeChama} contra ${nomeFonte || "o golpe"}: ${conta} · resistiu`
        : `🎲 ${nomeFonte || "o golpe"} tentou deixar ${nomeAlvo} ${cond.nome.toLowerCase()} — resistiu (${rolo} vs ${dif}).`,
      nota: `[${rotuloResistir ? "SALVAGUARDA" : "AFLIÇÃO RESISTIDA"} — ROLADA PELO SISTEMA] ${nomeFonte || "O golpe"} de ${atacante} carregava ${cond.nome.toLowerCase()}; ${nomeAlvo} passou (${conta})${rotuloResistir ? ` na ${comoSeChama}` : ""}. Narre o perigo que passou raspando e NÃO aplique a condição — nem suavizada, nem por um instante. Você não rola salvaguarda e não a repete.`,
    };
  }
  return {
    aplicou: true, resistiu: false, cond, portador: port, escopo: "alvo", salva: rotuloResistir || "", rolo, dif, d20, mod,
    texto: rotuloResistir
      ? `🛡 ${comoSeChama} contra ${nomeFonte || "o golpe"}: ${conta} · ${cond.icone} ${cond.nome}${cond.turnos ? ` (${cond.turnos}t)` : ""}`
      : `${cond.icone} ${nomeAlvo} está ${cond.nome}${cond.turnos ? ` (${cond.turnos}t)` : ""} — ${nomeFonte || atacante} (${rolo} vs ${dif})`,
    nota: `[${rotuloResistir ? "SALVAGUARDA" : "AFLIÇÃO APLICADA"} — ROLADA PELO SISTEMA] ${nomeFonte || "O golpe"} de ${atacante} deixou ${nomeAlvo} ${cond.nome.toLowerCase()}: falhou (${conta})${rotuloResistir ? ` na ${comoSeChama}` : ""}. Efeito e duração já estão aplicados (${cond.efeito}). Narre isso como fato — e não invente outro efeito nem outra condição: condição é do sistema. Você não rola esta salvaguarda e não a repete, nem para ser generoso.`,
  };
}

/* ---------------- GOLPES DE CRIATURA (catálogo) ----------------
   Antes, todo inimigo "atacava". Agora cada criatura tem golpes com
   NOME, tirados de um catálogo por elemento — o Mestre narra "Mordida
   peçonhenta" em vez de improvisar, e o golpe carrega a aflição certa
   porque o próprio nome está no catálogo de portadores. Determinístico
   pelo nome da criatura: o mesmo bicho usa sempre o mesmo repertório. */
export const GOLPES_POR_ELEMENTO = {
  veneno:  ["Mordida peçonhenta", "Ferroada tóxica", "Cuspe ácido", "Presas envenenadas"],
  fogo:    ["Sopro incandescente", "Garra flamejante", "Jato de brasas", "Bafo ígneo"],
  gelo:    ["Toque gélido", "Lufada glacial", "Estilhaço de gelo", "Mordida congelante"],
  raio:    ["Descarga estrondosa", "Chicote de raios", "Estrondo de trovão", "Fagulha atordoante"],
  sombrio: ["Toque espectral", "Uivo aterrador", "Garra macabra", "Sussurro assombrado"],
  sagrado: ["Lâmina radiante", "Clarão ofuscante", "Golpe consagrado", "Julgamento em luz"],
  arcano:  ["Dardo arcano", "Pulso encantado", "Amarras místicas", "Sussurro hipnótico"],
  fisico:  ["Golpe pesado", "Investida brutal", "Talho profundo", "Cabeçada estonteante", "Rasteira", "Marretada"],
};

function hashNome(s) {
  let h = 2166136261;
  const t = String(s || "");
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return h >>> 0;
}

/* Repertório fixo de uma criatura: 1 golpe (fracos) a 3 (lendários),
   sempre os mesmos para o mesmo nome. */
export function golpesDeCriatura(nome, elemento = "fisico", ameaca = "comum") {
  const pool = GOLPES_POR_ELEMENTO[elemento] || GOLPES_POR_ELEMENTO.fisico;
  const quantos = ameaca === "lendario" ? 3 : ameaca === "elite" ? 2 : ameaca === "fraco" ? 1 : 2;
  const h = hashNome(nome);
  const fisicos = GOLPES_POR_ELEMENTO.fisico;
  const lista = [];
  for (let i = 0; i < quantos; i++) {
    /* o primeiro golpe é do elemento da criatura; os outros alternam com
       um golpe físico, para o bicho não ser só um truque repetido */
    const fonte = i === 0 ? pool : (i % 2 ? fisicos : pool);
    lista.push(fonte[(h + i * 7) % fonte.length]);
  }
  return lista;
}

export function golpeDaVez(nome, elemento, ameaca, indice = 0) {
  const g = golpesDeCriatura(nome, elemento, ameaca);
  return g[indice % g.length] || g[0];
}

/* ---------------- OS GOLPES DE QUEM ATIRA (MM7) ----------------
   O Atirador do bestiário atirava "Rasteira" e "Marretada" — o nome do
   golpe sai do hash do nome contra o catálogo por elemento, e o físico só
   tinha golpe de encostar. Com o atirador a disparar de doze metros, o
   Narrador ouviria que ele passou uma rasteira em alguém do outro lado da
   sala, e a rasteira ainda levava a aflição dela (`caido`) de brinde.

   Um catálogo à parte, com a mesma forma, e só com o que chega longe. Os
   elementos repetem de propósito nomes do catálogo de cima que JÁ são de
   distância ("Dardo arcano", "Jato de brasas", "Estilhaço de gelo"): são
   os mesmos portadores, e a aflição que carregam continua a mesma. Os do
   físico não carregam aflição nenhuma — um tiro é dano, e é por isso que
   esta linha não tem "nas pernas" nem "atordoante". E "Sussurro
   assombrado" ficou de fora do sombrio: em MM7 "assombrado" casava o
   "brado" do portador `inspiracao`, e o golpe inspirava o bando de quem o
   lançava. A fronteira de palavra (lá em cima, em `PORTADORES`) consertou
   o catálogo de cima — hoje ele é `terror`, no alvo —, e aqui a lista
   ficou como estava. Não há "sombra" em nome nenhum daqui: o portador
   `sombra` dá `furtivo` a quem lança. A suíte de MM7 cobra que nenhum
   disparo case um portador que não seja do alvo.
   O repertório tem o tamanho do de `golpesDeCriatura` (1 a 3 pela ameaça)
   e sai do mesmo hash: o mesmo atirador usa sempre os mesmos disparos. */
export const GOLPES_DE_LONGE = {
  fisico:  ["Disparo certeiro", "Tiro na junta da armadura", "Disparo rasante", "Tiro de cobertura"],
  arcano:  ["Dardo arcano", "Pulso encantado", "Amarras místicas", "Raio arcano"],
  fogo:    ["Jato de brasas", "Sopro incandescente", "Seta de fogo", "Bola de chamas"],
  gelo:    ["Estilhaço de gelo", "Lufada glacial", "Raio gélido", "Seta de geada"],
  raio:    ["Descarga estrondosa", "Estrondo de trovão", "Fagulha atordoante", "Relâmpago"],
  sombrio: ["Raio sombrio", "Uivo aterrador", "Seta necrótica", "Dardo de trevas"],
  sagrado: ["Clarão ofuscante", "Julgamento em luz", "Lança de luz", "Raio radiante"],
  veneno:  ["Cuspe ácido", "Dardo peçonhento", "Nuvem tóxica", "Seta envenenada"],
};

export function golpeDeLonge(nome, elemento, ameaca, indice = 0) {
  const pool = GOLPES_DE_LONGE[elemento] || GOLPES_DE_LONGE.fisico;
  const quantos = golpesDeCriatura(nome, elemento, ameaca).length;
  const h = hashNome(nome);
  const i = Math.max(0, Number(indice) || 0) % quantos;
  return pool[(h + i * 7) % pool.length];
}

export const AFLICOES_PROMPT = `GOLPES E AFLIÇÕES (v9.1 — o sistema decide, você narra):
- Armas, habilidades, magias e golpes de criatura são lidos por um catálogo do sistema. Uma adaga envenenada envenena, uma maça atordoa, um sopro ígneo queima — o SISTEMA reconhece a fonte, rola o teste do alvo e aplica (ou não) a condição, para o herói, para os companheiros e para os inimigos igualmente.
- Quando isso acontecer você recebe o resultado pronto ("[AFLIÇÃO APLICADA — sistema rolou]" ou "RESISTIDA"). Narre exatamente o que o sistema decidiu: não envenene ninguém por conta própria, não anule o que passou, não invente outro efeito.
- Os inimigos têm GOLPES COM NOME vindos do catálogo (ex.: "Mordida peçonhenta", "Sopro incandescente"). O envelope de combate diz qual golpe foi usado — use esse nome na narração em vez de inventar um ataque genérico.
- Se o jogador descrever uma manobra que deveria afligir (jogar areia nos olhos, chutar o joelho, incendiar), NÃO aplique nada e NÃO peça rolagem — você não pede nenhuma. Narre a tentativa até o instante do contato e devolva a vez: o sistema já leu a ação dele e decide se houve dado, contra quanto e com que custo.`;
