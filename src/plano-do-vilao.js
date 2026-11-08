/* ============================================================
   O PLANO DO VILÃO — a ficha, o relógio e as camadas
   (08/11/2026, Fase BQ · BQ5)

   A pessoa, 08/11: «uma campanha que não tem vilão só parece várias
   histórias misturadas, temos que ter uma forma de colocá-lo no meio
   disso». A planta (mente/plano-biblioteca-de-quests.md, §11) responde que
   cada quest física é um passo dele ou um passo contra ele — e este módulo
   é o lado dele: quem é, o que vai fazer se ninguém o parar, e o que o
   herói já sabe dele.

   O QUE JÁ EXISTIA, E FICA (nada aqui substitui):
     · vilao.js — os 20 ARQUETIPOS (crença, quer, método, assinaturas), as 6
       FASES (rumor → marca → mão → rosto → guerra → queda), os 9
       PASSOS_DO_PLANO genéricos, `diasDoPasso`, `escolherAlvo`;
     · antagonista.js — os CORPOS (o ritmo e a queda), o livro do que chegou
       até ele (`chegouAteEle`, com fonte e certeza);
     · saga.js — o FIO (o antagonista que a criação elegeu: nome, título,
       motivo, assinatura, o dia em que começou);
     · nucleo.js — a FERIDA_DO_VILAO (o porquê que um jogador entenderia).

   O QUE ERA VAGO, E MUDA AQUI (só em mundos novos — §11.8):
     1. OS PASSOS ERAM OS MESMOS PARA OS VINTE. «Juntar gente», «comprar o
        silêncio»: o que ele fará se ninguém o parar era genérico. Aqui cada
        arquétipo tem os seus seis passos (PLANOS_DO_ARQUETIPO), cada um com
        o presságio (o que se sente antes), a obra (o que fica depois), o
        desvio (o que faz se o travam) e as mãos que o contestam. Os nove
        genéricos ficam como recuo de quem ainda não tem plano próprio.
     2. A FASE SUBIA PELO TEMPO (`FASE_DO_PASSO`). Aqui as camadas sobem
        PELO FACTO, e nunca pelo tempo: o tempo só faz o plano andar, e
        andar não revela nada. O juiz é o livro de factos (BQ1) e o estado
        das quests, nunca a palavra do Narrador.
     3. NÃO HAVIA FRAQUEZA. Aqui há uma, em três famílias (FRAQUEZAS): uma
        pessoa que ele ainda ouve, uma coisa sem a qual o plano não fecha,
        uma verdade que vira o mundo contra ele. E ela muda o fim.

   O NASCIMENTO (a decisão da pessoa, 08/11): o vilão nasce na criação do
   mundo, PELA SEMENTE E PELO ANTECEDENTE do herói (`nascerOVilao`). O lado
   «espelho» — ele adaptar-se ao que o herói faz — passa às reações
   (REACOES_DO_VILAO).

   O QUE O NARRADOR RECEBE: nenhum bloco. Uma linha por turno, «A MÃO DELE
   AQUI», e só quando a cena tem o vilão (`oVilaoNaPauta`), montada só com
   os campos da camada em que o herói está (CAMPOS_DA_CAMADA) — o filtro é
   do código, e a suíte prova que nenhuma camada vaza a seguinte. Os vetos
   vão em `naoPode`: o maior deles é o nome do herói, que o vilão não tem
   até o aprender (§11.5). É o que o Matt faz quando o vilão diz o teu nome
   pela primeira vez.

   O SAVE: um campo NOVO e aditivo, `espinha.fio.vilao` (o registo que a
   criação escreve e as camadas e as reações vão atualizando). A versão
   antiga não o lê, e o fio dela fica como era; `garantirEspinha` (saga.js)
   deixa-o passar, e a catraca dele é `garantirRegistroDoVilao`.

   PURO E DETERMINÍSTICO. A sorte do nascimento sai da semente (`dadoDo`);
   o dia, os factos e as quests entram por argumento; nada é mutado; o
   `null` e o lixo dão o vazio, nunca uma exceção.
   ============================================================ */
import { dadoDo } from "./semente.js";
import { ARQUETIPOS, arquetipoPorId, FASES, faseDe, PASSOS_DO_PLANO, diasDoPasso, escolherAlvo } from "./vilao.js";
import { corpoPorId, escolherCorpo, garantirSaber, certezaDe, chegouAteEle } from "./antagonista.js";
import { FERIDA_DO_VILAO, ATO_DA_REVELACAO } from "./nucleo.js";
import { antecedenteDe } from "./batidas.js";
import { derrotou, poupou } from "./livro-de-factos.js";
import { avaliarCondicao, resolverPapeis } from "./condicoes-da-quest.js";
import { MAOS_DO_VILAO, LIMITES_DA_QUEST } from "./biblioteca-de-quests.js";
import { PLANOS_LOTE_4 } from "./acervo/planos-lote-4.js";
import { PLANOS_LOTE_5 } from "./acervo/planos-lote-5.js";

/* ---------------- A FICHA, EM NÚMEROS ----------------
   `passos`: quantos passos tem um plano (a planta: seis, as frentes do
   Dungeon World têm de três a seis presságios) — o mesmo número que o
   `mao.contra` da ficha da quest aceita (LIMITES_DA_QUEST, BQ4), lido de
   lá para os dois nunca divergirem. `tenentes`: quantos servos, no máximo,
   a criação liga aos passos (os secundários de `chefesDoMundo`, que são de
   três a cinco; o mundo com menos dá menos, e ninguém se inventa).
   `pontePassos`: os passos onde a ponte ao herói pode cair — no meio do
   plano, para que a história do coração o encontre antes do fim.
   `atoDoRosto`: o rosto nunca antes deste ato — é a regra da máscara do
   núcleo (ATO_DA_REVELACAO), estendida ao vilão, como a planta pede.
   `reagiu`: o teto da lista do que ele já reagiu. `texto`/`nome`: o que se
   guarda por extenso no save. */
export const FICHA_DO_VILAO = Object.freeze({
  v: 1,
  passos: LIMITES_DA_QUEST.passosDoPlano,
  tenentes: Object.freeze({ max: 3 }),
  pontePassos: Object.freeze([2, 3, 4]),
  atoDoRosto: ATO_DA_REVELACAO.mascara,
  reagiu: 40,
  nome: 60,
  texto: 200,
});

/* AS MÃOS — onde é que ele está numa quest (§11.3) — são o vocabulário da
   ficha da quest: MAOS_DO_VILAO, de biblioteca-de-quests.js (BQ4). O `contra`
   de cada passo diz que mão o pode contestar, e lê-se dali. */

/* ---------------- O QUE UM PASSO MUDA NO MUNDO ----------------
   Um catálogo fechado (§11.2): quem aplica é a fiação (BQ7), e `quem` diz
   em que módulo isso já tem casa. */
export const EFEITOS_DO_PLANO = Object.freeze({
  base: Object.freeze({ o: "um lugar muda de dono", quem: "mundo-base.js" }),
  relacao: Object.freeze({ o: "uma pessoa muda de lado", quem: "npcs.js" }),
  relogio: Object.freeze({ o: "um relógio regional sobe", quem: "relogios.js" }),
  estrada: Object.freeze({ o: "o preço da estrada sobe", quem: "viagem" }),
  perigo: Object.freeze({ o: "os encontros na estrada sobem", quem: "viagem" }),
  porta: Object.freeze({ o: "uma porta fecha-se ao herói", quem: "npcs.js" }),
  cativeiro: Object.freeze({ o: "uma pessoa vai para cativeiro", quem: "mundo-base.js (situacoes)" }),
  postura: Object.freeze({ o: "a postura do mundo vira", quem: "posturas.js" }),
});

/* ---------------- OS PLANOS ----------------
   Seis passos por arquétipo. Cada passo:
     diz       — o que ele faz (o plano em mundo: só sobe na camada da guerra);
     presagio  — o que se sente enquanto ele o prepara (sem dono);
     obra      — o que fica no mundo quando se cumpre (sem dono);
     seTravado — o desvio: o que ele faz quando o travam a tempo;
     contra    — as mãos (MAOS_DO_VILAO) que o podem contestar;
     muda      — os efeitos (EFEITOS_DO_PLANO) quando se cumpre;
     custa     — o que ele tira, para `escolherAlvo` (vilao.js);
     prazo     — × os dias do passo do corpo dele (diasDoPasso).
   A voz é a que a pessoa pediu: «maravilhosas, provocantes e intensas».
   Um vilão que se sente antes de se ver: nenhuma linha destas tem dono, e
   nenhuma diz o nome do herói — ele ainda não o sabe.
   O PRIMEIRO LOTE trouxe quatro arquétipos; o acervo (BQ8) traz mais quatro
   por lote, no mesmo formato (com o lote 3, doze dos vinte). Os que ainda não têm plano andam pelo
   PLANO_DE_RECUO.
   DO LOTE 4 EM DIANTE (09/11), cada lote vive no seu ficheiro,
   src/acervo/planos-lote-N.js (os planos, as fraquezas e a afinidade dos
   arquétipos novos), e entra aqui por LOTES_DE_PLANOS — uma linha de import
   e um nome na lista. As tabelas continuam a ser estas, e nenhuma função
   muda: quem as lê não sabe de que ficheiro veio cada arquétipo. */
const passo = (diz, presagio, obra, seTravado, contra, muda, custa, prazo) =>
  Object.freeze({ diz, presagio, obra, seTravado, contra: Object.freeze(contra), muda: Object.freeze(muda), custa, prazo });
const LOTES_DE_PLANOS = Object.freeze([PLANOS_LOTE_4, PLANOS_LOTE_5]);
const doLote = (p) => passo(p.diz, p.presagio, p.obra, p.seTravado, p.contra, p.muda, p.custa, p.prazo);
export const PLANOS_DO_ARQUETIPO = Object.freeze({
  /* §11.9: Ilídia Selamar é este plano, com a cara que a criação lhe der */
  vendedor_de_medo: Object.freeze([
    passo("soltar o perigo na estrada",
      "os cães da estrada uivam ao meio-dia, todos virados para o mesmo monte",
      "sumiram duas carroças na estrada, e os bois voltaram sozinhos, sem um arranhão",
      "o perigo fica na jaula mais uns dias, e ele sobe o preço em vez de o soltar",
      ["tenente", "recurso"], ["perigo", "relogio"], "lugar", 1),
    passo("vender a proteção",
      "um homem de capa limpa diz na taverna quanto custa dormir descansado, e ninguém ri",
      "a guarda nova chegou na manhã seguinte ao ataque, e já trazia os recibos escritos",
      "vende a proteção fiada, porta a porta, a quem ainda tem medo de dizer que não",
      ["tenente", "recurso"], ["estrada", "relacao"], "voz", 1),
    passo("queimar quem não paga",
      "cheira a resina queimada de noite, e ninguém acendeu fogueira",
      "a única casa que recusou o recibo ardeu até às pedras, e a testemunha sumiu com o fumo",
      "o fogo não pega; deixa à porta o recado de que podia, e isso também se paga",
      ["consequencia", "pista", "tenente"], ["base", "cativeiro"], "lugar", 1.2),
    passo("comprar a voz do conselho",
      "os conselheiros chegam ao conselho com sapatos novos e a mesma frase na boca",
      "o conselho votou a taxa de muralha sem uma voz contra, e fechou a porta a quem perguntou",
      "compra metade do conselho, e a outra metade começa a provar a comida antes de comer",
      ["pista", "recurso"], ["porta", "relacao"], "voz", 1),
    passo("provar que ninguém mais protege",
      "a guarda da cidade conta as moedas do soldo, e as contas não fecham há duas luas",
      "a guarda da cidade largou as lanças numa noite, e de manhã só havia capas cinzentas",
      "a guarda aguenta, ferida, e ele espalha que só aguenta porque ele deixa",
      ["rosto", "tenente"], ["postura", "relacao"], "esperanca", 1.3),
    passo("fazer a região inteira pagar",
      "em cada porta da região há um prego novo à espera de um recibo",
      "a região inteira paga a proteção, e quem não paga arde",
      "a região rasga os recibos, e pela primeira vez o medo muda de lado",
      ["confronto"], ["base", "estrada", "postura"], "tudo", 1.5),
  ]),
  traido: Object.freeze([
    passo("procurar os que lhe ficaram a dever",
      "alguém anda de cidade em cidade com uma lista de nomes antigos, em letra cuidada",
      "três velhos conhecidos meus receberam visita de noite, e de manhã já não me cumprimentam",
      "a lista perde um nome, e ele escreve outro por cima, com mais força",
      ["tenente", "pista"], ["relacao"], "gente", 1),
    passo("comprar quem trabalha para mim",
      "quem me serve anda a contar moedas que não fui eu que lhe paguei",
      "quem me servia recebeu o dobro para servir outro, e saiu sem dizer de quem",
      "a compra falha, e ele deixa a bolsa à vista, para que eu saiba quanto valiam",
      ["tenente", "recurso"], ["relacao", "porta"], "gente", 1),
    passo("devolver-me o que perdi, por mão que não se mostra",
      "uma coisa minha, perdida há anos, aparece em montras onde nunca a vendi",
      "deixaram-me à porta uma coisa que perdi há anos, sem bilhete, ainda morna de outra mão",
      "o embrulho chega aberto e vazio, e o vazio diz o mesmo",
      ["pista", "consequencia"], ["relogio"], "voz", 1.1),
    passo("virar uma promessa minha contra mim",
      "repetem nas praças uma promessa que fiz, com as palavras certas e o sentido errado",
      "quem me ouviu prometer foi cobrar a promessa a outro, e voltou com uma dívida minha",
      "a promessa aguenta, mas fica rachada, e toda a gente ouviu o estalo",
      ["recurso", "pista", "consequencia"], ["porta", "postura"], "voz", 1),
    passo("mostrar-se a quem amo antes de se mostrar a mim",
      "quem eu amo dorme mal, e não me diz com quem jantou",
      "quem eu amo jantou com um estranho que sabia histórias minhas que nunca contei",
      "o jantar não acontece, e a cadeira vazia fica posta à espera",
      ["rosto", "tenente"], ["cativeiro", "relacao"], "gente", 1.3),
    passo("fazer-me perder tudo por dentro, por gente que conheço",
      "já ninguém me olha nos olhos sem olhar primeiro para trás de mim",
      "não sobra uma porta amiga na região: todos os que me conheciam lhe devem",
      "fica uma porta aberta, uma só, e é por ela que ele vai ter de passar",
      ["confronto"], ["relacao", "base", "postura"], "tudo", 1.5),
  ]),
  faminto: Object.freeze([
    passo("cavar onde os mapas velhos mandam não cavar",
      "à noite ouve-se cavar debaixo do monte, e de dia ninguém encontra a cova",
      "uma escavação abandonada à beira do caminho, com as pás ainda espetadas na terra",
      "a cova abate-se sobre os escavadores, e ele manda cavar mais fundo noutro sítio",
      ["recurso", "tenente"], ["perigo"], "lugar", 1),
    passo("juntar as chaves do selo",
      "um sábio da região deixou de responder às cartas, e o arquivo dele tem prateleiras vazias",
      "o guardião das chaves foi achado a dormir de olhos abertos, e a arca dele está leve",
      "falta-lhe uma chave, e ele começa a forjá-la com o que tira das sepulturas",
      ["recurso", "pista"], ["cativeiro", "relogio"], "voz", 1),
    passo("abrir a primeira porta, e pagar com uma aldeia",
      "os poços de uma aldeia sabem a ferro, e os bichos fogem dela sem ninguém os tocar",
      "uma aldeia inteira vazia, a mesa posta e o pão por comer, sem um sinal de luta",
      "a porta abre-se só uma frincha, e o que passa por ela tem fome de quem a abriu",
      ["consequencia", "pista"], ["base", "relogio"], "gente", 1.2),
    passo("pôr os escavadores dele onde estavam os guardiões",
      "os guardas do santuário velho foram rendidos por homens com terra debaixo das unhas",
      "o santuário velho tem guardas novos, e os selos da cripta estão partidos por dentro",
      "os guardiões resistem, e ele põe gente a vigiá-los de fora, à espera do inverno",
      ["tenente", "recurso"], ["base", "porta"], "lugar", 1),
    passo("mostrar-me o que há do outro lado",
      "sonho com uma porta, e de manhã há terra nos meus sapatos",
      "quem foi ver o que saiu da cripta voltou a falar uma língua que ninguém lhe ensinou",
      "a visão fica a meio, e o que vi chega para não voltar a dormir",
      ["rosto", "pista"], ["postura"], "esperanca", 1.3),
    passo("pagar a última porta com a região inteira",
      "a terra treme ao amanhecer, sempre à mesma hora, e cada dia um pouco mais",
      "a última porta abriu-se, e o que estava do outro lado anda à luz do dia",
      "a última porta fica selada, e o selo agora tem a minha marca",
      ["confronto"], ["base", "postura", "relogio"], "tudo", 1.5),
  ]),
  zeloso: Object.freeze([
    passo("pregar a mesma frase em cidades que não se falam",
      "um pregador sem nome repete numa praça a frase que ouvi noutra cidade ontem",
      "em três praças que não se falam, a mesma frase escrita a carvão: alguém tem de dizer não",
      "correm o pregador da praça, e a frase passa a dizer-se baixinho, que pega melhor",
      ["tenente", "pista"], ["relogio"], "voz", 1),
    passo("acender a vela nas portas de quem concorda",
      "há uma vela acesa numa porta, depois em duas, e ninguém diz quem as acende",
      "metade das portas da rua tem uma vela acesa, e a outra metade fecha as janelas de dia",
      "as velas apagam-se numa noite de vento, e ele conta quem as voltou a acender",
      ["tenente", "recurso"], ["relacao", "porta"], "gente", 1.1),
    passo("julgar em praça um inocente que eu conhecia",
      "levantaram um estrado na praça, e ainda ninguém sabe para quem",
      "julgaram em praça alguém que eu conhecia, e o povo aplaudiu antes de ouvir a sentença",
      "o julgamento fica sem réu, e ele prega que o réu fugiu porque era culpado",
      ["consequencia", "pista", "tenente"], ["cativeiro", "postura"], "gente", 1.2),
    passo("fazer da fé um exército, com armas pagas pelos fiéis",
      "os fiéis levam à missa o dízimo em ferro: pregos, foices, pontas de lança",
      "os fiéis marcham em fila pela estrada, de foice ao ombro, a cantar a frase",
      "o ferro não chega, e ele arma os fiéis com a certeza, que corta menos e dura mais",
      ["recurso", "tenente"], ["base", "relacao"], "lugar", 1),
    passo("pôr a cidade a escolher, em voz alta, entre mim e a ordem",
      "perguntam-me na rua de que lado estou, e ninguém espera pela resposta",
      "a cidade escolheu em voz alta, e a porta da casa onde eu dormia está pregada",
      "a cidade não escolhe, e o silêncio dela começa a meter-lhe medo",
      ["rosto", "pista"], ["postura", "porta"], "esperanca", 1.3),
    passo("pôr a ordem a governar, e fazer de mim o herege",
      "os sinos tocam a horas que não são de missa, e as crianças brincam aos hereges",
      "a ordem governa a região, e nos sermões há um herege sem nome que se parece comigo",
      "a ordem cai num domingo, e os fiéis voltam para casa sem saber o que rezar",
      ["confronto"], ["base", "postura", "relogio"], "tudo", 1.5),
  ]),
  /* ---- o acervo, lote 2 (BQ8): mais quatro, no mesmo formato. Em cada um,
     o passo 4 aceita a pista e o recurso, para que as quests que entregam a
     fraqueza ou tiram o recurso caibam em qualquer plano ---- */
  credor: Object.freeze([
    passo("comprar as dívidas pequenas da cidade",
      "um homem de luvas cinzentas anda pelas lojas a pagar fiados que não são dele",
      "os fiados da rua inteira foram pagos numa manhã, e cada lojista recebeu um recibo com a mesma letra",
      "metade das lojas recusa o dinheiro, e ele compra-lhes as contas ao agiota, mais caras",
      ["tenente", "recurso"], ["relacao"], "voz", 1),
    passo("ficar com a casa de penhores",
      "o penhorista fecha a porta mais cedo e sai pelas traseiras com um saco que não é dele",
      "a casa de penhores mudou de dono, e os anéis de toda a gente estão numa montra que já não é deles",
      "o penhorista não vende, e ele passa a emprestar mais barato à porta do lado, até a casa secar",
      ["tenente", "recurso"], ["base", "relacao"], "lugar", 1),
    passo("cobrar com juros a quem não pode pagar",
      "levam a mesa de jantar de uma casa, depois as camas, e ninguém chama a guarda",
      "uma família saiu da cidade com a roupa do corpo, e a casa dela tem um inquilino que nunca lá dorme",
      "a cobrança fica a meio, e ele perdoa a dívida em voz alta, que é a cobrança mais cara de todas",
      ["consequencia", "pista", "tenente"], ["cativeiro", "base"], "gente", 1.2),
    passo("comprar a dívida de quem eu amo",
      "quem eu amo anda a fazer contas à noite, e esconde o papel quando entro",
      "quem eu amo deve agora a uma mão que não conheço, e paga-lhe com favores que não me conta",
      "a dívida volta paga por outra mão, e ele fica a saber quem a pagou",
      ["pista", "recurso"], ["relacao", "cativeiro"], "gente", 1),
    passo("pôr à minha frente a conta de todos os que amo",
      "chega-me um envelope sem remetente com uma conta somada, e o total é uma pessoa",
      "deixaram-me à porta a lista de tudo o que devem os que amo, e no fim um espaço em branco para assinar",
      "a lista chega rasgada ao meio, e ele manda a outra metade com flores",
      ["rosto", "tenente"], ["porta", "postura"], "esperanca", 1.3),
    passo("cobrar a região inteira, de uma vez",
      "os sinos da região tocam a horas de feira, e não há feira em lado nenhum",
      "não há porta na região sem um recibo pregado, e os juros já se pagam em braços",
      "a região queima os recibos numa noite, e a dívida muda de lado",
      ["confronto"], ["cativeiro", "relacao", "postura"], "tudo", 1.5),
  ]),
  boticaria: Object.freeze([
    passo("envenenar o poço de uma aldeia pequena",
      "os cães de uma aldeia bebem do poço e deitam-se ao sol sem se levantarem",
      "metade de uma aldeia caiu de cama com a mesma febre, e a outra metade jura que foi a água",
      "o poço é tapado a tempo, e a febre passa a vir no pão",
      ["tenente", "recurso"], ["perigo", "relogio"], "gente", 1),
    passo("vender o remédio fiado, em doses pequenas",
      "uma carroça pintada de verde pára na praça e vende frascos a quem tosse, fiado",
      "toda a gente que tossia tem um frasco verde à cabeceira, e já ninguém vai ao boticário velho",
      "o frasco não pega, e a primeira dose passa a ser de graça, que é o anzol mais fundo",
      ["tenente", "recurso"], ["relacao", "estrada"], "voz", 1),
    passo("fechar a botica de quem cura de graça",
      "a velha que cura com ervas tem a porta riscada a carvão, e ninguém lhe diz quem foi",
      "a botica da velha ardeu numa noite sem vento, e a velha não foi vista desde então",
      "a velha não fecha, e a febre começa a aparecer em quem lá vai",
      ["consequencia", "pista", "tenente"], ["base", "cativeiro"], "lugar", 1.2),
    passo("fazer da febre uma moeda",
      "pagam a renda com frascos vazios, e o senhorio aceita",
      "na região já se paga com frascos verdes, e quem não tem frasco não tem crédito",
      "a moeda não vinga, e as doses ficam guardadas para o inverno, mais caras",
      ["pista", "recurso"], ["estrada", "relacao"], "voz", 1),
    passo("pôr-me doente, e oferecer-me a cura",
      "acordo com a boca a saber a cobre, e a febre chega ao fim da tarde",
      "estive três dias de cama, e ao quarto havia um frasco verde à minha cabeceira, sem bilhete",
      "a febre passa sozinha, e chega recado de que da próxima não passa",
      ["rosto", "pista"], ["postura", "porta"], "esperanca", 1.3),
    passo("deixar a região de cama, menos quem paga",
      "não há uma casa sem alguém a tossir, e as boticas velhas têm todas a porta pregada",
      "a região só se levanta com a dose verde, e quem não paga a dose não se levanta",
      "alguém acha a receita da cura, e a febre passa a ser só uma febre",
      ["confronto"], ["relacao", "postura", "perigo"], "tudo", 1.5),
  ]),
  almiranta: Object.freeze([
    passo("afundar um barco de quem não paga bandeira",
      "a maré traz tábuas pintadas de azul, e nenhum barco azul saiu do porto esta semana",
      "um barco de carga afundou com o mar chão, e os náufragos falam de uma bandeira que não descrevem",
      "o barco escapa, e afundam-se dois no lugar dele, para que se conte",
      ["tenente", "recurso"], ["perigo", "estrada"], "lugar", 1),
    passo("pôr preço à travessia",
      "os barqueiros pedem o dobro e olham para o mar antes de dizer porquê",
      "a travessia custa agora o triplo, e o preço já vem combinado em todos os cais",
      "um barqueiro teimoso atravessa barato, e deixam-no, para ver quem o segue",
      ["tenente", "recurso"], ["estrada", "relacao"], "voz", 1),
    passo("deixar uma vila de costa sem pão",
      "os pescadores de uma vila voltam de mãos vazias, e as redes vêm cortadas",
      "uma vila da costa passou o inverno a comer cascas, e os barcos dela apodrecem na praia, de casco furado",
      "a vila pesca de noite, às escondidas, e alguém começa a contar as luzes no mar",
      ["consequencia", "pista", "tenente"], ["base", "relogio"], "gente", 1.2),
    passo("ficar com os armazéns do porto",
      "carregadores novos no porto, todos com a mesma fita atada ao pulso",
      "os armazéns do porto mudaram de dono numa semana, e o trigo de toda a gente dorme agora em casa alheia",
      "um armazém resiste, e deixam-no cheio, à espera de que apodreça",
      ["pista", "recurso"], ["base", "porta"], "lugar", 1),
    passo("chamar-me a bordo, de bandeira branca",
      "um bote sem remador encosta ao cais, com um lugar seco e uma manta dobrada",
      "estive a bordo de um navio sem letras no casco, e trouxe de lá um convite e um cheiro a alcatrão",
      "o bote volta vazio, e o recado chega pela boca de quem eu menos esperava",
      ["rosto", "tenente"], ["postura", "relacao"], "esperanca", 1.3),
    passo("fechar todos os portos da região, menos os seus",
      "não sai um barco dos portos há seis dias, e o pão já se vende a peso de prata",
      "só os cais da bandeira sem descrição têm barcos, e a região come o que lá deixam descarregar",
      "um porto abre-se à força, e por ele entra mais coragem do que trigo",
      ["confronto"], ["estrada", "base", "postura"], "tudo", 1.5),
  ]),
  profeta_queimado: Object.freeze([
    passo("riscar a data nas paredes",
      "alguém risca a carvão uma data nas paredes, e de manhã ninguém a consegue apagar",
      "a mesma data está riscada em três paredes de três cidades, e as crianças já a dizem de cor",
      "lavam as paredes, e a data aparece pintada com sangue de galinha nas portas das igrejas",
      ["tenente", "pista"], ["relogio"], "voz", 1),
    passo("converter os que já não têm nada",
      "os mendigos da ponte deixam de pedir, e põem-se a cantar baixinho",
      "os desesperados da cidade têm todos a mesma queimadura nas costas da mão, e já não pedem esmola: rezam",
      "os convertidos dispersam com a primeira sopa quente, e ele vai buscar outros mais longe",
      ["tenente", "recurso"], ["relacao", "postura"], "gente", 1),
    passo("cumprir com as próprias mãos o primeiro sinal",
      "o pregador anunciou um sinal para a lua cheia, e na lua cheia há quem afie facas",
      "a ponte velha que o pregador disse que cairia caiu na noite dita, e já ninguém se ri dele na praça",
      "o sinal não vem, e ele diz que foi adiado pelos pecados de quem o impediu",
      ["consequencia", "pista", "tenente"], ["base", "postura"], "lugar", 1.2),
    passo("comprar a voz dos sinos",
      "o sineiro da sé anda de sapatos novos e toca os sinos meio minuto mais tarde",
      "os sinos da cidade tocam agora à hora do pregador, e o padre da sé prega de porta fechada",
      "o padre da sé não se cala, e começam a aparecer cinzas no altar dele",
      ["pista", "recurso"], ["porta", "relacao"], "voz", 1),
    passo("mostrar-me o fogo que vem",
      "sonho com a cidade a arder, e de manhã tenho cheiro a fumo no cabelo",
      "estive diante de uma cara queimada que me mostrou a cidade em cinza, e sabia a que horas eu tinha acordado",
      "a visão corta-se a meio, e fica com ele a parte que eu não vi",
      ["rosto", "pista"], ["postura"], "esperanca", 1.3),
    passo("pôr a cidade de joelhos na data riscada, e acender o fogo",
      "faltam três dias para a data riscada, e as lojas já fecham ao meio-dia",
      "a cidade ajoelhou-se na data riscada, e o fogo começou exatamente onde a mão dele apontou",
      "chega o dia e ninguém se ajoelha; o fogo acende-se na mesma, mas só na casa dele",
      ["confronto"], ["base", "postura", "relogio"], "tudo", 1.5),
  ]),
  /* ---- o acervo, lote 3 (BQ8): mais quatro, no mesmo formato e com a
     mesma forma de mãos (1 e 2: o tenente e o recurso; 3: a consequência,
     a pista e o tenente; 4: a pista e o recurso; 5: o rosto e o tenente; 6:
     o confronto), para que toda quest do catálogo caiba no passo que
     contesta. O Domador é o primeiro cujos servos são bichos por ofício: a
     caçada do lote 3 (O Que Desce ao Anoitecer) é o passo 1 dele ---- */
  herdeiro: Object.freeze([
    passo("desenterrar os papéis da linhagem",
      "um escrivão de fora copia registos velhos no cartório, e paga as velas do próprio bolso",
      "o cartório amanheceu com uma pilha de escrituras antigas, todas com um brasão que ninguém daqui conhece",
      "os registos ardem antes de serem copiados, e ele manda buscar os duplicados à capital",
      ["tenente", "recurso"], ["relacao"], "voz", 1),
    passo("comprar os juízes da comarca",
      "os juízes da comarca andam de capa nova, e dão a sentença antes de ouvirem as partes",
      "o tribunal deu razão ao brasão estrangeiro em três pleitos seguidos, sem ouvir uma testemunha",
      "um juiz recusa a bolsa, e é transferido para uma vila sem estrada",
      ["tenente", "recurso"], ["porta", "relacao"], "voz", 1),
    passo("despejar quem mora no que diz ser dele",
      "pregam editais nas portas de uma rua inteira, com letra de cartório e um selo partido ao meio",
      "uma rua inteira foi despejada numa manhã, com a lei na mão e homens armados atrás da lei",
      "a rua não sai, e ele manda os papéis à frente e o fogo atrás",
      ["consequencia", "pista", "tenente"], ["base", "cativeiro"], "lugar", 1.2),
    passo("fazer sua, por casamento, a casa mais antiga da região",
      "a casa mais antiga da região manda fazer roupa de festa, e ninguém da cidade foi convidado",
      "a casa mais antiga da região tem um brasão novo por cima da porta, e as terras dela já pagam foro a outro",
      "o casamento desfaz-se no altar, e ele compra as dívidas da casa em vez da mão",
      ["pista", "recurso"], ["base", "relacao"], "gente", 1),
    passo("pôr-me diante de um pergaminho que diz que a minha casa nunca foi minha",
      "chega-me uma citação para comparecer diante de um juiz que não conheço, por uma terra que nunca pisei",
      "estive diante de um pergaminho que prova que a casa onde nasci era de outro, e de quem mo leu devagar",
      "a audiência adia-se, e chega a convocatória seguinte com mais testemunhas",
      ["rosto", "tenente"], ["porta", "postura"], "esperanca", 1.3),
    passo("ter a região inteira escriturada com o brasão dele",
      "em cada vila da região há um escrivão novo a reescrever as escrituras, de noite",
      "as cidades da região amanheceram com o brasão estrangeiro nos portões, e a lei diz que sempre foi assim",
      "a região queima os cartórios numa noite, e a lei fica sem papel onde morar",
      ["confronto"], ["base", "porta", "postura"], "tudo", 1.5),
  ]),
  cortesao: Object.freeze([
    passo("aprender pelo vinho quem me é leal",
      "um estranho bem vestido paga rodadas na taverna e pergunta, a rir, quem me deve favores",
      "o taberneiro já não me fia, e não diz quem lhe pagou a conta toda",
      "ninguém lhe responde de graça, e ele começa a pagar em segredos",
      ["tenente", "recurso"], ["relacao"], "gente", 1),
    passo("comprar o mensageiro das minhas cartas",
      "as minhas cartas chegam um dia mais tarde, com o lacre direito demais",
      "quem levava as minhas cartas anda de cavalo novo, e as respostas chegam com outra letra",
      "o mensageiro recusa, e as cartas começam a perder-se pelo caminho",
      ["tenente", "recurso"], ["relacao", "porta"], "voz", 1),
    passo("fazer cair em desgraça quem me abriu a primeira porta",
      "quem me deu abrigo quando cheguei anda com os olhos vermelhos e não me diz porquê",
      "quem me abriu a primeira porta nesta terra caiu em desgraça, por uma carta que eu nunca escrevi",
      "a desgraça não pega, e ele espalha que fui eu quem a tentou",
      ["consequencia", "pista", "tenente"], ["porta", "relacao"], "gente", 1.2),
    passo("sentar à mesa dele os que ainda me são fiéis",
      "os que ainda me são fiéis receberam todos o mesmo convite, em papel grosso e sem selo",
      "os que me eram fiéis jantaram em casa alheia, e voltaram de lá a falar baixo quando entro",
      "metade não vai ao jantar, e ele manda-lhes a sobremesa a casa",
      ["pista", "recurso"], ["relacao", "porta"], "gente", 1),
    passo("brindar à minha saúde com os meus amigos à volta",
      "ouço contar que brindaram à minha saúde numa mesa onde eu não estava, e que se riram depois",
      "estive à mesa com quem me tirou os amigos um a um, e ergueu o copo à minha saúde sem tirar os olhos de mim",
      "o brinde fica por fazer, e chega-me um copo vazio com um bilhete por baixo",
      ["rosto", "tenente"], ["postura", "relacao"], "esperanca", 1.3),
    passo("fechar-me a última porta amiga da região",
      "já não há casa na região onde me deixem dormir, e todos pedem desculpa com a mesma frase",
      "não sobra na região um amigo que não tenha jantado com ele, e cada jantar fechou uma porta",
      "fica uma mesa por comprar, e é nela que me sento à espera dele",
      ["confronto"], ["relacao", "porta", "postura"], "tudo", 1.5),
  ]),
  colecionador: Object.freeze([
    passo("comprar o raro antes de alguém saber que é raro",
      "um comprador paciente passa pelas feiras e paga o triplo por coisas que ninguém queria",
      "a feira ficou sem uma única peça antiga, e os vendedores contam moedas que não sabem explicar",
      "os vendedores desconfiam e escondem o que têm, e ele passa a comprar às viúvas",
      ["tenente", "recurso"], ["relacao"], "lugar", 1),
    passo("esvaziar o relicário do templo",
      "o sacristão conta as relíquias duas vezes por dia, e a conta nunca bate",
      "o relicário do templo está vazio, com o veludo ainda marcado no feitio do que lá estava",
      "o templo tranca o relicário, e ele compra o sacristão em vez da relíquia",
      ["tenente", "recurso"], ["base", "relacao"], "lugar", 1),
    passo("levar a peça que uma família guardava há sete gerações",
      "uma família velha recebe a mesma oferta três vezes, cada vez mais alta e menos educada",
      "a família que guardava a peça há sete gerações já não tem a peça, nem a casa, nem o filho mais velho",
      "a família não vende, e ele espera pelo funeral do avô",
      ["consequencia", "pista", "tenente"], ["cativeiro", "base"], "gente", 1.2),
    passo("ficar com os livros de quem é dono de quê",
      "o leiloeiro da cidade fecha os livros quando alguém pergunta de onde veio uma peça",
      "os registos do leiloeiro mudaram de mão, e agora só uma pessoa sabe onde está cada coisa rara da região",
      "os registos ardem a meio, e ele começa a reconstruí-los de memória, peça a peça",
      ["pista", "recurso"], ["base", "porta"], "voz", 1),
    passo("mostrar-me a vitrine onde quer guardar o que trago comigo",
      "alguém fez o inventário das minhas coisas, e deixou-o dobrado na minha almofada",
      "estive diante de uma vitrine vazia, à medida exata de uma coisa que trago comigo",
      "a vitrine fica fechada, e a chave chega-me pelo correio, sem bilhete",
      ["rosto", "tenente"], ["postura", "porta"], "esperanca", 1.3),
    passo("pôr a região inteira atrás de vidro",
      "começa a faltar gente na região, e as casas dela ficam arrumadas como montras",
      "tudo o que havia de raro na região está atrás de vidro, e a próxima vitrine tem o tamanho de uma pessoa",
      "as vitrines partem-se numa noite, e o que era raro volta às mãos de quem o tinha",
      ["confronto"], ["base", "cativeiro", "postura"], "tudo", 1.5),
  ]),
  domador: Object.freeze([
    passo("soltar a primeira fera perto de uma aldeia",
      "os cães de guarda ladram para o monte a noite inteira, e de manhã estão roucos e com medo",
      "um rebanho inteiro amanheceu desfeito no pasto, e as marcas no chão são de uma coisa que não é deste monte",
      "a fera é ferida a tempo e foge, e ele solta outra mais longe",
      ["tenente", "recurso"], ["perigo", "relogio"], "lugar", 1),
    passo("oferecer o assobio que manda as feras embora",
      "um homem com uma coleira ao ombro passa pelas aldeias e diz que sabe o assobio que as manda embora",
      "as aldeias pagam um tributo por cada lua sem ataques, e o tributo vai para um curral que ninguém visitou",
      "uma aldeia não paga, e a fera desce lá na mesma noite",
      ["tenente", "recurso"], ["estrada", "relacao"], "voz", 1),
    passo("fazer da aldeia que não pagou um exemplo",
      "há ossos roídos na estrada que leva a uma aldeia, e já ninguém faz esse caminho",
      "a aldeia que recusou o tributo está vazia, com as portas arranhadas por dentro",
      "a aldeia aguenta atrás das paliçadas, e ele deixa a fera à porta, à espera",
      ["consequencia", "pista", "tenente"], ["base", "perigo"], "gente", 1.2),
    passo("juntar as feras num só curral",
      "à noite ouvem-se rugidos de bichos diferentes, todos vindos do mesmo vale",
      "há um curral no vale com mais feras do que a região tem caçadores, e todas conhecem o mesmo assobio",
      "o curral arde, e as feras espalham-se sem dono pelo monte, que é pior e é melhor",
      ["pista", "recurso"], ["perigo", "base"], "lugar", 1),
    passo("deixar-me ver a fera maior comer-lhe da mão",
      "acordo com o cheiro de um bicho à porta, e na lama, ao lado das patas, as marcas de umas botas",
      "estive diante de quem traz pela coleira a coisa maior que já vi, e a coisa obedeceu-lhe a um gesto",
      "a fera não vem, e chega em vez dela um osso limpo, embrulhado em pano",
      ["rosto", "tenente"], ["postura"], "esperanca", 1.3),
    passo("soltar todas as feras de uma vez sobre a região",
      "não há um cão na região que não uive ao anoitecer, e os caçadores dormem com a besta ao lado",
      "as feras andam soltas pela região inteira, e só as aldeias que pagam dormem de porta fechada",
      "as feras soltam-se, mas sem o assobio viram-se contra quem as trouxe",
      ["confronto"], ["perigo", "estrada", "postura"], "tudo", 1.5),
  ]),
  /* os lotes do acervo (src/acervo/planos-lote-N.js), na mesma forma */
  ...Object.fromEntries(LOTES_DE_PLANOS.flatMap((l) => Object.entries(l.planos || {})).map(([id, ps]) => [id, Object.freeze(ps.map(doLote))])),
});

/* ---------------- O RECUO ----------------
   Quem ainda não tem plano próprio anda por seis dos nove passos genéricos
   de vilao.js (`indices`), com a voz de recuo de cada posição. Não é o
   ideal — é o que existia, e o acervo (BQ8) foi esvaziando esta porta.
   Com o lote 5 (09/11) os vinte de vilao.js têm plano próprio, e já ninguém
   passa por aqui; a porta fica aberta para o arquétipo que nascer sem plano. */
export const PLANO_DE_RECUO = Object.freeze({
  indices: Object.freeze([0, 1, 2, 4, 6, 8]),
  presagio: Object.freeze([
    "os sem-casa somem das soleiras, uma noite de cada vez",
    "quem costumava falar de tudo anda calado, e com a bolsa mais pesada",
    "rondam um sítio que importa, de dia, como quem mede uma porta",
    "alguém que era meu anda a evitar-me na rua",
    "uma frase estranha anda de boca em boca, e ninguém sabe quem a disse primeiro",
    "o ar pesa como antes de uma tempestade que não chega",
  ]),
  obra: Object.freeze([
    "os sem-casa voltaram calados, de botas novas, e não dizem quem lhas deu",
    "quem podia avisar aceitou a bolsa, e já não fala com estranhos",
    "um sítio que importava mudou de dono de um dia para o outro",
    "alguém que era meu passou para o outro lado, e foi sem se despedir",
    "a região inteira repete a mesma frase, até quem nunca ouviu quem a disse",
    "o que ele começou acabou à vista de todos",
  ]),
  seTravado: Object.freeze([
    "a gente que juntou dispersa-se, e ele começa de novo, mais longe",
    "o silêncio sai caro, e alguém fica a meio de uma frase",
    "vieram tomar o sítio e foram interrompidos, e a porta ficou a meio",
    "quem hesitava fica do meu lado, mas já sabe quanto vale",
    "a frase gasta-se de tanto a dizerem, e ele procura outra",
    "o fim fica por acabar, e o mundo respira",
  ]),
  contra: Object.freeze([
    Object.freeze(["tenente", "recurso"]), Object.freeze(["tenente", "pista"]),
    Object.freeze(["consequencia", "recurso"]), Object.freeze(["pista", "tenente"]),
    Object.freeze(["rosto", "pista"]), Object.freeze(["confronto"]),
  ]),
  muda: Object.freeze([
    Object.freeze(["relacao"]), Object.freeze(["relacao", "porta"]), Object.freeze(["base"]),
    Object.freeze(["relacao"]), Object.freeze(["postura"]), Object.freeze(["base", "postura", "relogio"]),
  ]),
  prazo: Object.freeze([1, 1, 1.2, 1, 1.3, 1.5]),
});

/* ---------------- O QUE FARÁ SE NINGUÉM O PARAR ----------------
   Os vinte (§11.1): uma frase que muda o mapa, e os efeitos dela. Os vinte
   já, e não só os quatro do lote: o relógio de qualquer vilão pode chegar
   ao fim, e o fim tem de ser dele. */
const fim = (frase, efeitos) => Object.freeze({ frase, efeitos: Object.freeze(efeitos) });
export const FIM_DO_PLANO = Object.freeze({
  espelho: fim("cada recruta da região aprende primeiro o corte dele, e o mundo passa a medir os heróis por ele", ["postura", "relacao"]),
  herdeiro: fim("as cidades da região voltam à linhagem dele, com selo, cartório e forca para quem discordar", ["base", "porta"]),
  faminto: fim("a última porta abriu-se, e o que estava do outro lado anda à luz do dia", ["perigo", "base", "relogio"]),
  zeloso: fim("a ordem governa a região, e quem não acende a vela à porta é herege", ["postura", "porta", "base"]),
  traido: fim("não sobra uma porta amiga na região: todos os que conheciam o herói lhe devem", ["relacao", "porta"]),
  credor: fim("a região inteira deve-lhe, até quem o herói ama, e os juros cobram-se em gente", ["cativeiro", "relacao"]),
  penitente: fim("a região vota o herói ao exílio, com a lista dos erros dele pregada em todas as portas", ["porta", "postura"]),
  colecionador: fim("tudo o que havia de raro na região está numa vitrine dele, e a próxima tem o tamanho de uma pessoa", ["base", "cativeiro"]),
  cortesao: fim("todos os aliados do herói jantaram com ele, e cada jantar fechou uma porta", ["relacao", "porta"]),
  vendedor_de_medo: fim("a região inteira paga a proteção da guarda dele, e quem não paga arde", ["base", "estrada", "postura"]),
  fomentador: fim("a região está em guerra consigo mesma, e as duas bandeiras compram armas ao mesmo ferreiro", ["postura", "relogio", "estrada"]),
  viuva_do_trono: fim("ela senta-se no trono vazio, e já ninguém se lembra de lhe chamar usurpadora", ["base", "postura"]),
  profeta_queimado: fim("a cidade ajoelhou-se no dia marcado, e o fogo que ele anunciou foi ele que o acendeu", ["base", "postura"]),
  crianca_antiga: fim("ela acordou inteira no corpo que preparou, e a terra voltou a rezar-lhe", ["postura", "cativeiro"]),
  general_sem_guerra: fim("a guerra que ele fabricou começou, e os fortes voltaram a mandar", ["postura", "relogio", "base"]),
  boticaria: fim("a região inteira depende da mão dela, e não há outro boticário de pé", ["relacao", "postura"]),
  santo_vivo: fim("a região só ouve o divino pela boca dele, e o herói chama-se falso milagreiro", ["porta", "postura"]),
  domador: fim("cada aldeia paga para que ele não solte o que traz pela coleira", ["perigo", "estrada"]),
  almiranta: fim("nenhuma carga cruza a região sem passar pela mão dela, e a fome governa por ela", ["estrada", "base"]),
  arquiteto: fim("a peça final caiu no lugar, e a região acordou num mundo que ele desenhou", ["postura", "base", "relogio"]),
});

/* ---------------- QUANDO O RELÓGIO CHEGA AO FIM ----------------
   A campanha não acaba: muda de tom (§11.7). O confronto troca de família,
   de «impedir» para «reconquistar» (a matéria do episódio «Queda e
   Reconstrução»), com um tenente a mais. Ele continua vencível, no auge. */
export const TOM_DO_FIM = Object.freeze({
  de: "impedir",
  para: "reconquistar",
  tenentesAMais: 1,
  materia: "Queda e Reconstrução",
  diz: "ele chegou ao fim do plano, e o mundo é dele; ainda se pode tomar de volta",
});

/* ---------------- O RITMO DO PLANO ----------------
   Os números do relógio (§11.2), que a suíte lê de volta.
   `ignorada`: a quest que contesta o passo e ficou por aceitar até ao
   prazo — o passo cumpre-se, e o seguinte vem com o prazo × isto.
   `recurso`: o herói tirou-lhe um recurso — o passo seguinte × isto.
   `recuo`: um tenente caído ou virado — o passo que corre ganha × isto de
   um passo inteiro, e o que esse tenente servia, se já se cumprira, desfaz-se.
   `prazoMinimo`: nenhum passo dura menos dias do que isto.
   `certezaQueMira`: com uma linha desta certeza no livro dele, o passo
   seguinte escolhe um alvo do que o herói ama (`escolherAlvo`). */
export const RITMO_DO_PLANO = Object.freeze({
  ignorada: 0.75,
  recurso: 1.5,
  recuo: 1,
  prazoMinimo: 2,
  certezaQueMira: 3,
});

/* ---------------- A FRAQUEZA ----------------
   Três famílias (§11.1). Cada entrada: `o` (o que é, em mundo) e, quando
   é de um arquétipo, `arquetipo`. A coisa traz o `nome` do objeto — é por
   ele que `tem` a acha na bolsa. A pessoa e o lugar da verdade são
   preenchidos pelo esqueleto (BQ6) em `papeis.fraqueza`; até lá ninguém a
   tem, e nenhuma linha a diz. */
const fraq = (id, o, extra) => Object.freeze({ id, o, ...(extra || {}) });
/* as fraquezas dos arquétipos dos lotes do acervo, por família, à cauda */
const daFamilia = (fam) => LOTES_DE_PLANOS.flatMap((l) => (l.fraquezas && l.fraquezas[fam]) || [])
  .map((e) => fraq(e.id, e.o, { ...(e.arquetipo ? { arquetipo: e.arquetipo } : {}), ...(e.nome ? { nome: e.nome } : {}) }));
export const FRAQUEZAS = Object.freeze({
  pessoa: Object.freeze([
    fraq("p_salvo_do_fogo", "quem tirou do primeiro incêndio, e que ainda lhe escreve todos os invernos", { arquetipo: "vendedor_de_medo" }),
    fraq("p_o_que_ficou", "o único que nunca o traiu, e que nunca soube que isso importava", { arquetipo: "traido" }),
    fraq("p_guardia_velha", "a guardiã velha que o ensinou a ler os selos, e ainda o chama pelo nome de menino", { arquetipo: "faminto" }),
    fraq("p_irma_de_outra_fe", "a irmã que ele não queimou, e que reza a outro deus", { arquetipo: "zeloso" }),
    fraq("p_primeiro_perdoado", "o primeiro a quem perdoou uma dívida, e que nunca lhe pediu mais nada", { arquetipo: "credor" }),
    fraq("p_aprendiz_fugida", "a aprendiz que lhe fugiu com metade das receitas, e que ainda cura de graça", { arquetipo: "boticaria" }),
    fraq("p_imediato_velho", "o imediato velho que a ensinou a ler as estrelas, e cuja voz ela ainda obedece", { arquetipo: "almiranta" }),
    fraq("p_quem_o_tirou_do_fogo", "quem o tirou da fogueira, e nunca acreditou numa palavra do que ele prega", { arquetipo: "profeta_queimado" }),
    fraq("p_ama_velha", "a ama velha que o criou, e que sabe de quem ele é filho de verdade", { arquetipo: "herdeiro" }),
    fraq("p_primeiro_amigo", "o primeiro amigo que ele vendeu, e que ainda lhe guarda um lugar à mesa", { arquetipo: "cortesao" }),
    fraq("p_artesao_cego", "o artesão cego que fez a primeira peça que ele roubou, e que o reconhece pela voz", { arquetipo: "colecionador" }),
    fraq("p_velho_tratador", "o velho tratador que lhe ensinou o assobio, e cujo assobio as feras ainda preferem", { arquetipo: "domador" }),
    fraq("p_quem_o_criou", "quem o criou, e a quem ele ainda não consegue mentir"),
    fraq("p_crianca_salva", "a criança que ele salvou um dia, e que hoje tem medo dele"),
    ...daFamilia("pessoa"),
  ]),
  coisa: Object.freeze([
    fraq("c_chave_da_jaula", "a chave da jaula onde guarda o perigo que vende", { arquetipo: "vendedor_de_medo", nome: "chave da jaula" }),
    fraq("c_promessa_assinada", "a promessa antiga, assinada pelas duas mãos, que prova quem faltou primeiro", { arquetipo: "traido", nome: "promessa assinada" }),
    fraq("c_ultimo_selo", "o último selo, inteiro, sem o qual a última porta não abre", { arquetipo: "faminto", nome: "último selo" }),
    fraq("c_primeiro_sermao", "o primeiro sermão, pela mão dele, que diz o contrário do de hoje", { arquetipo: "zeloso", nome: "primeiro sermão" }),
    fraq("c_livro_mestre", "o livro-mestre das dívidas, sem o qual nenhuma cobrança se prova", { arquetipo: "credor", nome: "livro-mestre" }),
    fraq("c_receita_da_cura", "a receita da cura verdadeira, que custa três ervas e um caldeirão", { arquetipo: "boticaria", nome: "receita da cura" }),
    fraq("c_carta_de_mares", "a carta dos baixios e das marés onde ela afunda quem não paga", { arquetipo: "almiranta", nome: "carta de marés" }),
    fraq("c_oleo_de_pedra", "o óleo de pedra com que ele acende os sinais que anuncia", { arquetipo: "profeta_queimado", nome: "óleo de pedra" }),
    fraq("c_anel_da_linhagem", "o anel verdadeiro da linhagem, que anda noutro dedo", { arquetipo: "herdeiro", nome: "anel da linhagem" }),
    fraq("c_caderno_dos_precos", "o caderno onde aponta o preço de cada pessoa que comprou", { arquetipo: "cortesao", nome: "caderno dos preços" }),
    fraq("c_peca_falsa", "a peça falsa que ele vende como verdadeira há vinte anos", { arquetipo: "colecionador", nome: "peça falsa" }),
    fraq("c_apito_de_osso", "o apito de osso a que as feras obedecem antes de obedecerem a ele", { arquetipo: "domador", nome: "apito de osso" }),
    fraq("c_selo_pessoal", "o selo pessoal dele, que fecha todas as ordens que dá", { nome: "selo pessoal" }),
    fraq("c_mapa_do_plano", "o mapa onde marcou o plano inteiro, passo a passo", { nome: "mapa do plano" }),
    ...daFamilia("coisa"),
  ]),
  verdade: Object.freeze([
    fraq("v_livro_de_contas", "o livro de contas, com as datas dos ataques e as dos recibos lado a lado", { arquetipo: "vendedor_de_medo" }),
    fraq("v_quem_traiu", "quem o traiu de verdade, e não foi o herói", { arquetipo: "traido" }),
    fraq("v_diario_das_portas", "o que as quatro portas abertas lhe tiraram, escrito no diário dele", { arquetipo: "faminto" }),
    fraq("v_ouro_da_ordem", "a ordem paga-lhe em ouro, e o ouro vem de quem ele condena", { arquetipo: "zeloso" }),
    fraq("v_divida_dele", "a dívida que ele próprio nunca pagou, e a quem a deve", { arquetipo: "credor" }),
    fraq("v_mesma_semente", "a febre e o remédio saem da mesma semente, no mesmo horto", { arquetipo: "boticaria" }),
    fraq("v_naufragios_marcados", "os naufrágios sem tempestade, marcados um a um no diário de bordo dela", { arquetipo: "almiranta" }),
    fraq("v_deuses_calados", "os deuses nunca lhe falaram: a voz que ouviu era a de quem o mandou queimar", { arquetipo: "profeta_queimado" }),
    fraq("v_escritura_original", "a escritura original diz outro sangue: a linhagem que reclama nunca foi a dele", { arquetipo: "herdeiro" }),
    fraq("v_os_comprados_venderam", "ninguém lhe foi leal, nunca: os que ele pagou já o venderam a outro", { arquetipo: "cortesao" }),
    fraq("v_colecao_roubada", "a coleção inteira é roubada, e cada peça tem um dono vivo que a procura", { arquetipo: "colecionador" }),
    fraq("v_erva_das_feras", "as feras não lhe obedecem por respeito: andam drogadas com uma erva que ele lhes mete na água", { arquetipo: "domador" }),
    fraq("v_crime_de_origem", "o crime que o pôs onde está, com uma testemunha ainda viva"),
    fraq("v_origem_inventada", "a mentira que ele conta sobre de onde veio"),
    ...daFamilia("verdade"),
  ]),
});

/* como se tem a fraqueza, por família — em condições do vocabulário
   fechado (condicoes-da-quest.js), sobre o papel `fraqueza` */
export const COMO_SE_TEM_A_FRAQUEZA = Object.freeze({
  pessoa: Object.freeze(["acompanha", "papel:fraqueza"]),
  coisa: Object.freeze(["tem", "item:fraqueza"]),
  verdade: Object.freeze(["descobriu", "lugar:fraqueza"]),
});

/* ---------------- O NASCIMENTO PELO ANTECEDENTE ----------------
   A decisão da pessoa: o vilão nasce da semente e do antecedente do herói.
   `base`: o peso de cada arquétipo com plano; `por`: o que o passado do
   herói lhe soma. Um erudito que leu o que não devia atrai o Faminto; um
   acólito fugido, o Zeloso; um nobre caído, o Traído. Só entram arquétipos
   com plano próprio — o acervo alarga a roda sozinho. Os lotes do acervo
   (src/acervo/) SOMAM os pesos deles aos desta tabela. */
const somarAfinidade = (base) => {
  const out = { ...base };
  for (const l of LOTES_DE_PLANOS) {
    for (const [ant, pesos] of Object.entries(l.afinidade || {})) {
      const novo = { ...(out[ant] || {}) };
      for (const [arq, n] of Object.entries(pesos)) novo[arq] = (novo[arq] || 0) + n;
      out[ant] = Object.freeze(novo);
    }
  }
  return Object.freeze(out);
};
export const AFINIDADE_DO_ANTECEDENTE = Object.freeze({
  base: 1,
  por: somarAfinidade({
    orfao: Object.freeze({ traido: 2, vendedor_de_medo: 1, credor: 1, herdeiro: 1 }),
    soldado: Object.freeze({ traido: 2, vendedor_de_medo: 1, domador: 1 }),
    nobre_caido: Object.freeze({ traido: 3, credor: 1, herdeiro: 2, cortesao: 1 }),
    erudito: Object.freeze({ faminto: 3, profeta_queimado: 1 }),
    ladrao: Object.freeze({ vendedor_de_medo: 2, traido: 1, credor: 1, colecionador: 2 }),
    acolito: Object.freeze({ zeloso: 3, profeta_queimado: 1 }),
    pragado: Object.freeze({ zeloso: 2, faminto: 1, boticaria: 2 }),
    artista: Object.freeze({ faminto: 2, traido: 1, almiranta: 1, colecionador: 1, cortesao: 1 }),
    cacador: Object.freeze({ vendedor_de_medo: 2, traido: 1, domador: 3 }),
    ferreiro: Object.freeze({ faminto: 1, vendedor_de_medo: 1, boticaria: 1, colecionador: 1 }),
    ex_cultista: Object.freeze({ zeloso: 2, faminto: 2, profeta_queimado: 2 }),
    naufrago: Object.freeze({ vendedor_de_medo: 2, faminto: 1, almiranta: 3 }),
  }),
});

/* ---------------- AS CAMADAS, PELO FACTO ----------------
   O que sobe cada camada (§11.4). As camadas são as FASES de vilao.js; o
   que muda é o que as sobe: aqui é o facto, e nunca o tempo.
     factos — [predicado, grupo]: basta um. Os grupos: `passo` (os lugares
              dos passos), `passo_cumprido` (os dos passos já cumpridos),
              `covil`, `assinatura`, `tenente` (cada um), `vilao`. O
              `esteve_depois` é o «esteve» com o dia: o herói viu a obra
              DEPOIS de feita (o livro guarda o último dia lá).
     quests — [mão, situação]: basta uma.
     exige  — [mão, situações]: todas têm de valer.
     ato    — a camada espera o ato do rosto (FICHA_DO_VILAO.atoDoRosto).
     diz    — o facto que a subiu, em palavras, para a linha do envelope. */
export const SOBE_A_CAMADA = Object.freeze({
  marca: Object.freeze({
    factos: Object.freeze([["esteve_depois", "passo_cumprido"], ["descobriu", "passo"], ["descobriu", "covil"], ["tem", "assinatura"]]),
    quests: Object.freeze([["pista", "concluida"], ["consequencia", "concluida"]]),
    diz: "viu a obra depois de feita, ou tem a assinatura na mão",
  }),
  mao: Object.freeze({
    factos: Object.freeze([["conheceu", "tenente"], ["derrotou", "tenente"]]),
    quests: Object.freeze([["tenente", "concluida"]]),
    diz: "esteve frente a frente com um servo dele",
  }),
  rosto: Object.freeze({
    factos: Object.freeze([["conversou", "vilao"]]),
    exige: Object.freeze([["rosto", Object.freeze(["aberta", "concluida"])]]),
    ato: true,
    diz: "falou com ele, no encontro que não é luta",
  }),
  guerra: Object.freeze({
    quests: Object.freeze([["rosto", "concluida"]]),
    ato: true,
    diz: "o encontro com ele acabou, e o plano ficou à vista",
  }),
  queda: Object.freeze({
    quests: Object.freeze([["confronto", "aberta"], ["confronto", "concluida"], ["confronto", "falhada"]]),
    ato: true,
    diz: "o confronto abriu-se",
  }),
});

/* ---------------- O QUE CADA CAMADA PODE DIZER ----------------
   A camada a partir da qual cada campo pode chegar à linha do Narrador. A
   linha monta-se SÓ com os campos permitidos (`oVilaoNaPauta`), e a suíte
   prova, para cada camada, que nenhum campo de cima está no texto: nem o
   nome antes do rosto, nem o plano antes da guerra, nem a fraqueza antes
   de o herói a ter. */
export const CAMPOS_DA_CAMADA = Object.freeze({
  obra: "rumor",
  assinatura: "marca",
  tenente: "mao",
  nome: "rosto",
  titulo: "rosto",
  crenca: "rosto",
  quer: "rosto",
  plano: "guerra",
  fraqueza: "queda",
  ferida: "queda",
});

/* ---------------- A LINHA E OS VETOS ----------------
   `teto`: a linha «A MÃO DELE AQUI» nunca passa disto (§11.6). As frases
   são modelos com {campos}; a ordem diz o que cai primeiro quando não
   cabe (o último sai primeiro). `alcunha`: como ele e os servos chamam o
   herói até lhe saberem o nome — o forasteiro da terra de onde veio. */
export const LINHA_DO_VILAO = Object.freeze({
  teto: 160,
  cabeca: "A MÃO DELE AQUI: ",
  camadas: Object.freeze({
    rumor: Object.freeze(["{obra}", " — e ninguém sabe de quem é a mão"]),
    marca: Object.freeze(["{obra}", "; e lá, {assinatura}, sem explicação"]),
    mao: Object.freeze(["{tenente} age por ele aqui", ", e sabe quem eu sou", "; {obra}"]),
    rosto: Object.freeze(["{nome} quer {quer}", " ({titulo})"]),
    guerra: Object.freeze(["{nome} quer agora {plano}", "; e {quer}"]),
    queda: Object.freeze(["{nome} chegou ao fim; ", "derruba-o sem luta {fraqueza}", "sem a fraqueza dele, só resta a luta"]),
  }),
  alcunha: Object.freeze({ comCidade: "o forasteiro de {cidade}", semCidade: "o forasteiro" }),
  vetos: Object.freeze({
    nome: "que {quem} diga o meu nome: ainda não o sabe, e chama-me «{alcunha}»",
    quemAntes: "ele ou quem o serve",
    quemManda: "que quem o serve diga quem manda: não diz, nem sob ameaça",
    semLuta: "abrir luta com {nome} nesta cena: veio falar, e vai embora inteiro",
  }),
});

/* ---------------- O VILÃO REAGE ----------------
   O lado «espelho» (a decisão da pessoa): um facto do livro gera uma
   reação, e uma linha no livro DELE (`chegouAteEle`, com fonte). Cada
   reação acontece uma vez por coisa (a chave), e fica no registo.
     quando — o facto (a leitura está em `reagirAoHeroi`);
     faz    — o que ele faz, na voz que o Narrador recebe;
     sabe   — a linha no livro dele: { o, fonte, sobre } (sobre «nome» é a
              linha que lhe ensina o nome do herói);
     efeito — o que fica no registo: uma guarda no passo seguinte, um
              tenente que pode cair para qualquer lado;
     reservado — o motivo, quando o jogo ainda não escreve o facto (a lei
              da BQ3: nada pede um facto que ninguém produz). */
export const REACOES_DO_VILAO = Object.freeze([
  Object.freeze({ id: "endurece", quando: "derrotou_tenente",
    faz: "endurece: o próximo passo dele já não anda sozinho, leva guarda, e a guarda leva ordens sobre mim",
    sabe: Object.freeze({ o: "o que o forasteiro fez a quem o servia", fonte: "marca", sobre: "feito" }),
    efeito: "guarda" }),
  Object.freeze({ id: "balanca", quando: "poupou_tenente",
    faz: "o servo que poupei voltou para ele a dever-me a vida, e deu-lhe o meu nome; agora pode cair para qualquer lado",
    sabe: Object.freeze({ o: "o nome do herói, da boca de quem ele poupou", fonte: "viu", sobre: "nome" }),
    efeito: "balanca" }),
  Object.freeze({ id: "apaga", quando: "virou_tenente",
    faz: "risca o nome do servo que mudou de lado, e o lugar dele fica vazio uns dias, à espera de alguém pior",
    sabe: Object.freeze({ o: "que lhe viraram um servo", fonte: "deduziu", sobre: "feito" }) }),
  Object.freeze({ id: "desvia", quando: "travou_passo",
    faz: "não insiste: muda de caminho, e por onde vai agora ninguém estava a olhar",
    sabe: Object.freeze({ o: "onde o herói esteve", fonte: "deduziu", sobre: "onde" }) }),
  Object.freeze({ id: "manda_olhar", quando: "tirou_recurso",
    faz: "atrasa-se, e manda alguém olhar para quem lhe tirou aquilo, de longe, sem fazer nada",
    resposta: "manda_ver" }),
  Object.freeze({ id: "acelera", quando: "ignorou_duas",
    faz: "conclui que eu ainda não sou nada, e deixa de esperar",
    leitura: "ainda_nao" }),
  Object.freeze({ id: "mira_o_que_ama", quando: "famoso_num_passo",
    faz: "o meu nome chegou à cidade que ele queria, e o próximo golpe dele é no que eu amo",
    sabe: Object.freeze({ o: "a fama do herói", fonte: "fama", sobre: "fama" }),
    reservado: "não há fama por cidade no jogo (o save só guarda o patamar geral): nenhuma peça escreve o facto" }),
  Object.freeze({ id: "cobra_depois", quando: "aceitou_oferta",
    faz: "poupa o que eu protejo, como prometeu, e anota o preço para o cobrar quando doer mais",
    sabe: Object.freeze({ o: "tudo: o nome, a cara e o preço do herói", fonte: "viu", sobre: "nome" }) }),
]);

/* ---------------- OS DESFECHOS ----------------
   Os quatro fins do confronto (§11.7 e a decisão da pessoa: o pacto existe).
   Julgam-se por esta ordem, e o primeiro que vale fica.
     caminhos — as portas do desfecho; ele vale se UM caminho se cumpre
                por inteiro. Cada caminho tem, um ou os dois:
       factos   — a condição no vocabulário fechado, sobre os papéis dele;
       escolhas — [mão da quest, escolha]: o que o herói escolheu nela
                  (`escolhas` do estado da quest, BQ4), todas;
     fraqueza — a família que o desfecho exige;
     rito     — os corpos que não morrem assim (a coisa antiga: sela-se), e
                a escolha que os fecha;
     depois   — o que fica; `seSobrevive`, quando o corpo sobrevive à queda.

   TODO FIM DO CATÁLOGO TEM UM DESFECHO (08/11, achado no lote 2). O vilão
   que cai PELA PROVA — a fraqueza posta na mesa, sem luta — não tem o
   facto `derrotou`, e as sentenças «acabar» e «selar» ficavam sem fim
   (null); «poupar» também, fora da redenção. A sentença é o fim, e lê-se
   igual caia ele pela lâmina ou pela prova: «acabar» é derrota; «selar» é
   derrota (é o rito da coisa antiga, e quem fica fechado onde ninguém abre
   já não move peças — os quatro da pessoa, sem um quinto); «poupar» sem
   redenção é fuga. Corrige também o rendido: «acabar» com quem se rendeu
   à lâmina dava fuga, porque o livro diz `poupou`; quem acaba, acaba.
   O pacto é o «cumprir»: a dívida só se abre a quem é aliado dele, e o
   «cumprir» fecha a quest; pedir ainda o «aceitar» do rosto deixava sem
   fim quem chegou à aliança por outra porta. A catraca está na suíte:
   nenhuma quest de confronto do catálogo, nenhuma família, nenhum corpo,
   nenhuma sentença dá null. */
const caminho = (c) => Object.freeze({
  ...(c.factos ? { factos: Object.freeze(c.factos) } : {}),
  ...(c.escolhas ? { escolhas: Object.freeze(c.escolhas.map((e) => Object.freeze(e))) } : {}),
});
export const DESFECHOS_DO_VILAO = Object.freeze([
  Object.freeze({ id: "pacto",
    caminhos: Object.freeze([caminho({ escolhas: [["confronto", "cumprir"]] })]),
    depois: "ele ganha uma parte do que queria; a campanha continua, com o herói a dever-lhe" }),
  Object.freeze({ id: "redencao", fraqueza: "pessoa",
    caminhos: Object.freeze([caminho({
      factos: ["algum", ["acompanha", "papel:fraqueza"], ["todos", ["conversou", "papel:vilao", 2], ["conversou", "papel:fraqueza"]]],
      escolhas: [["confronto", "poupar"]] })]),
    depois: "ele larga o plano; a ferida dele fica dita; nasce um laço rompido, que ainda pode reatar" }),
  Object.freeze({ id: "derrota",
    caminhos: Object.freeze([
      caminho({ factos: ["todos", ["derrotou", "papel:vilao"], ["nenhum", ["poupou", "papel:vilao"]]] }),
      caminho({ escolhas: [["confronto", "acabar"]] }),
      caminho({ escolhas: [["confronto", "selar"]] }),
    ]),
    rito: Object.freeze({ corpos: Object.freeze(["coisa"]), escolha: Object.freeze(["confronto", "selar"]) }),
    depois: "o plano morre com ele",
    seSobrevive: "o que sobra dele continua, mais lento, um passo atrás" }),
  Object.freeze({ id: "fuga",
    caminhos: Object.freeze([
      caminho({ factos: ["algum", ["poupou", "papel:vilao"], ["derrotou", "papel:vilao"]] }),
      caminho({ escolhas: [["confronto", "poupar"]] }),
      /* só chega aqui com «acabar» a coisa antiga sem o rito: não morre assim */
      caminho({ escolhas: [["confronto", "acabar"]] }),
    ]),
    depois: "ele escapa, e o capítulo seguinte herda-o" }),
]);

/* ============================================================
   utilidades
   ============================================================ */
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const inteiro = (v) => (typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : null);
const texto = (s, m) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, m) : "");
const semAc = (s) => String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const preencher = (modelo, v) => String(modelo).replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? String(v[k]) : m));
const RX_PAPEL = /^[a-z0-9_]{1,40}$/;
const ORDEM = Object.freeze(Object.fromEntries(FASES.map((f) => [f.id, f.ordem])));
/* os estados do registo da quest (ESTADOS_DA_QUEST, BQ4) que o vilão lê, e o
   da quest oferecida que o herói ainda não abriu */
const ESTADOS_LIDOS = ["oferecida", "aberta", "concluida", "falhada"];
const TIPOS_DE_PAPEL = ["pessoa", "lugar", "item"];

/* a sorte ponderada, pela mesma régua de vilao.js */
function porPeso(rnd, lista) {
  const total = lista.reduce((n, x) => n + x.peso, 0);
  if (!(total > 0)) return lista[0] || null;
  let corte = rnd() * total;
  return lista.find((x) => (corte -= x.peso) <= 0) || lista[lista.length - 1];
}

/* o nome próprio do antagonista do fio: «Kael Vento, o Devorador» é «Kael
   Vento»; o bicho sem nome próprio é o nome inteiro (a régua de vilaoDoFio) */
function nomeDoFio(fio) {
  const a = texto(fio && fio.antagonista, 60);
  const partes = a.split(", ");
  return partes.length > 1 && partes[0].trim() ? partes[0].trim() : a;
}

/* ============================================================
   O PLANO DE UM ARQUÉTIPO
   ============================================================ */
function planoDe(arquetipo) {
  const proprio = PLANOS_DO_ARQUETIPO[arquetipo];
  if (proprio) return { proprio: true, passos: proprio };
  const R = PLANO_DE_RECUO;
  const passos = R.indices.map((i, k) => {
    const g = PASSOS_DO_PLANO[i] || PASSOS_DO_PLANO[0];
    return Object.freeze({ diz: g.diz, presagio: R.presagio[k], obra: R.obra[k], seTravado: R.seTravado[k], contra: R.contra[k], muda: R.muda[k], custa: g.custa, prazo: R.prazo[k] });
  });
  return { proprio: false, passos: Object.freeze(passos) };
}

/* ============================================================
   O REGISTO NO SAVE — espinha.fio.vilao
   garantirRegistroDoVilao(x) → registo | null
   Campo NOVO, aditivo, ignorado pela versão antiga. Lixo: null.
   ============================================================ */
function garantirPapeis(x) {
  const o = obj(x) || {};
  const out = {};
  for (const k of Object.keys(o)) {
    const p = obj(o[k]);
    if (!RX_PAPEL.test(k) || !p || !TIPOS_DE_PAPEL.includes(p.tipo)) continue;
    const nome = texto(p.nome, FICHA_DO_VILAO.nome);
    const cidade = texto(p.cidade, FICHA_DO_VILAO.nome);
    if (!nome && !cidade && !texto(p.id, 120)) continue;
    out[k] = {
      tipo: p.tipo, nome,
      ...(cidade ? { cidade } : {}),
      ...(texto(p.chave, 120) ? { chave: texto(p.chave, 120) } : {}),
      ...(texto(p.id, 120) ? { id: texto(p.id, 120) } : {}),
    };
  }
  return out;
}
export function garantirRegistroDoVilao(x) {
  const o = obj(x);
  if (!o || typeof o.arquetipo !== "string" || !ARQUETIPOS.some((a) => a.id === o.arquetipo)) return null;
  const F = FICHA_DO_VILAO;
  const fr = obj(o.fraqueza);
  const familia = fr && FRAQUEZAS[fr.familia] ? fr.familia : null;
  const entrada = familia ? FRAQUEZAS[familia].find((e) => e.id === fr.id) : null;
  const pt = obj(o.ponte);
  const ponte = pt && pt.de === "ferida" && (pt.com === "companheiro" || pt.com === "porta")
    ? { de: "ferida", com: pt.com }
    : pt && pt.de === "passo" && F.pontePassos.includes(inteiro(pt.passo)) ? { de: "passo", passo: inteiro(pt.passo) } : null;
  const nd = obj(o.nomeDoHeroi);
  const listaDePassos = (l) => [...new Set(arr(l).map(inteiro).filter((n) => n >= 1 && n <= F.passos))].sort((a, b) => a - b);
  return {
    v: F.v,
    arquetipo: o.arquetipo,
    corpo: corpoPorId(o.corpo).id,
    ferida: FERIDA_DO_VILAO.some((w) => w.id === o.ferida) ? o.ferida : "",
    fraqueza: entrada ? { familia, id: entrada.id } : null,
    assinatura: texto(o.assinatura, F.nome),
    ponte,
    tenentes: arr(o.tenentes).map((t) => obj(t)).filter((t) => t && RX_PAPEL.test(String(t.papel || "")) && texto(t.nome, F.nome))
      .map((t) => ({ papel: t.papel, nome: texto(t.nome, F.nome), passo: Math.max(1, Math.min(F.passos, inteiro(t.passo) || 1)) }))
      .slice(0, F.tenentes.max + TOM_DO_FIM.tenentesAMais),
    papeis: garantirPapeis(o.papeis),
    cidadeInicial: texto(o.cidadeInicial, F.nome),
    inicio: Math.max(0, inteiro(o.inicio) || 0),
    segredo: texto(o.segredo, F.texto),
    camada: ORDEM[o.camada] != null ? o.camada : "rumor",
    subiuPor: texto(o.subiuPor, F.texto),
    reagiu: arr(o.reagiu).map((r) => obj(r)).filter((r) => r && texto(r.chave, 120))
      .map((r) => ({ chave: texto(r.chave, 120), dia: Math.max(0, inteiro(r.dia) || 0) }))
      .filter((r, i, a) => a.findIndex((y) => y.chave === r.chave) === i)
      .slice(-F.reagiu),
    nomeDoHeroi: nd ? { dia: Math.max(0, inteiro(nd.dia) || 0), fonte: texto(nd.fonte, 20) || "viu" } : null,
    guardas: listaDePassos(o.guardas),
    balancas: [...new Set(arr(o.balancas).filter((p) => typeof p === "string" && RX_PAPEL.test(p)))],
  };
}

/* ============================================================
   O NASCIMENTO — na criação do mundo, pela semente e pelo antecedente
   nascerOVilao({ semente, antecedente, fio, chefes, ferida, cidadeInicial })
     → o registo (espinha.fio.vilao)
   `fio`: o da espinha (saga.js) — dá a assinatura, se já a tem (o relógio
   do fio deixa-a), e o dia em que a história começou. `chefes`: os de
   `chefesDoMundo` (ou só nomes): os secundários viram os tenentes, e o
   covil do principal fica como lugar dele. `ferida`: a que o núcleo já
   elegeu para o vilão, se elegeu (senão escolhe-se aqui, entre as que não
   pedem condição). Mesma semente e mesmo antecedente = o mesmo vilão.
   ============================================================ */
export function nascerOVilao(entrada) {
  const o = obj(entrada) || {};
  const F = FICHA_DO_VILAO;
  const semente = o.semente == null ? "" : String(o.semente);
  const ant = antecedenteDe(o.antecedente);
  const rnd = dadoDo(semente, "plano-do-vilao", ant);
  const fio = obj(o.fio) || {};

  /* o arquétipo: só os que têm plano próprio, pesados pelo passado do herói */
  const afin = AFINIDADE_DO_ANTECEDENTE.por[ant] || {};
  const roda = Object.keys(PLANOS_DO_ARQUETIPO).map((id) => ({ id, peso: AFINIDADE_DO_ANTECEDENTE.base + (afin[id] || 0) }));
  const arq = arquetipoPorId((porPeso(rnd, roda) || roda[0]).id);
  const corpo = escolherCorpo(rnd);
  const plano = planoDe(arq.id).passos;

  /* a ferida: a do núcleo, se veio; senão uma das que não pedem ninguém */
  const dada = FERIDA_DO_VILAO.find((w) => w.id === o.ferida);
  const livres = FERIDA_DO_VILAO.filter((w) => !w.so);
  const ferida = dada || livres[Math.floor(rnd() * livres.length)] || livres[0];

  /* a fraqueza: a família à sorte, e dentro dela a do arquétipo, se houver */
  const familias = Object.keys(FRAQUEZAS);
  const familia = familias[Math.floor(rnd() * familias.length)] || familias[0];
  const daqui = FRAQUEZAS[familia].filter((e) => e.arquetipo === arq.id);
  const pool = daqui.length ? daqui : FRAQUEZAS[familia].filter((e) => !e.arquetipo);
  const fraqueza = pool[Math.floor(rnd() * pool.length)] || pool[0];

  const assinatura = texto(fio.assinatura, F.nome) || arq.assinaturas[Math.floor(rnd() * arq.assinaturas.length)] || arq.assinaturas[0];

  /* os tenentes: os secundários do mundo, cada um a servir um passo que a
     mão `tenente` contesta, pela ordem do plano */
  const chefes = arr(o.chefes).map((c) => (typeof c === "string" ? { nome: c, linha: "secundaria" } : obj(c))).filter((c) => c && texto(c.nome, F.nome));
  const principal = chefes.find((c) => c.linha === "principal") || null;
  const secundarios = chefes.filter((c) => c.linha !== "principal").slice(0, F.tenentes.max);
  const servidos = plano.map((p, i) => (p.contra.includes("tenente") ? i + 1 : 0)).filter(Boolean);
  const tenentes = secundarios.map((c, i) => ({ papel: `tenente_${i + 1}`, nome: texto(c.nome, F.nome), passo: servidos.length ? servidos[i % servidos.length] : 1 }));

  /* a ponte ao herói: a ferida com teia, ou um passo do meio do plano onde a
     história do coração o vai encontrar (o esqueleto liga-a, BQ6) */
  const ponte = ferida && ferida.teia
    ? { de: "ferida", com: ferida.teia.com }
    : { de: "passo", passo: F.pontePassos[Math.floor(rnd() * F.pontePassos.length)] };

  const covil = principal ? texto(principal.covil, F.nome) : "";
  return garantirRegistroDoVilao({
    arquetipo: arq.id, corpo, ferida: ferida ? ferida.id : "",
    fraqueza: { familia, id: fraqueza.id },
    assinatura, ponte, tenentes,
    papeis: covil ? { covil: { tipo: "lugar", nome: covil, cidade: covil } } : {},
    cidadeInicial: o.cidadeInicial,
    inicio: Number.isFinite(fio.inicio) ? fio.inicio : 0,
    camada: "rumor",
  });
}

/* ============================================================
   A FICHA — a vista sobre o que existe, mais o registo
   fichaDoVilao(espinhaOuFio) → ficha | null
   Recebe a espinha (ou o fio dela). Sem `fio.vilao` — as campanhas em
   curso, a espinha antiga — é null, e nada muda para elas (§11.8).
   ============================================================ */
export function fichaDoVilao(x) {
  const e = obj(x);
  if (!e) return null;
  const fio = obj(e.fio) || (obj(e.vilao) ? e : null);
  const reg = fio ? garantirRegistroDoVilao(fio.vilao) : null;
  if (!reg) return null;
  const arq = arquetipoPorId(reg.arquetipo);
  const corpo = corpoPorId(reg.corpo);
  const p = planoDe(reg.arquetipo);
  const ferida = FERIDA_DO_VILAO.find((w) => w.id === reg.ferida) || null;
  const fr = reg.fraqueza ? FRAQUEZAS[reg.fraqueza.familia].find((y) => y.id === reg.fraqueza.id) : null;
  return {
    nome: nomeDoFio(fio),
    titulo: texto(fio.titulo, 40),
    corpo,
    arquetipo: arq.id,
    crenca: arq.crenca,
    quer: arq.quer,
    metodo: arq.metodo,
    porque: ferida ? ferida.o : "",
    ferida: reg.ferida,
    fim: FIM_DO_PLANO[arq.id] || null,
    plano: p.passos,
    planoProprio: p.proprio,
    fraqueza: fr ? { familia: reg.fraqueza.familia, id: fr.id, o: fr.o, ...(fr.nome ? { nome: fr.nome } : {}) } : null,
    assinatura: reg.assinatura,
    ponte: reg.ponte,
    tenentes: reg.tenentes,
    papeis: reg.papeis,
    segredo: reg.segredo,
    cidadeInicial: reg.cidadeInicial,
    inicio: reg.inicio,
    semente: texto(e.semente, 120),
    registro: reg,
  };
}

/* os papéis dele, na forma de resolverPapeis (condicoes-da-quest.js): o
   próprio, os tenentes, a assinatura, a fraqueza, e o que o esqueleto
   ancorou (o covil, os lugares dos passos) */
function papeisDoVilao(f) {
  const out = {};
  if (f.nome) out.vilao = { tipo: "pessoa", nome: f.nome };
  for (const t of f.tenentes) out[t.papel] = { tipo: "pessoa", nome: t.nome };
  if (f.assinatura) out.assinatura = { tipo: "item", nome: f.assinatura };
  if (f.fraqueza && f.fraqueza.familia === "coisa" && f.fraqueza.nome) out.fraqueza = { tipo: "item", nome: f.fraqueza.nome };
  for (const [k, p] of Object.entries(f.papeis || {})) out[k] = { ...p };
  return out;
}

/* as quests que o relógio, as camadas, as reações e o fim leem: os
   REGISTOS da BQ4 (abrirQuest/avancarQuest, biblioteca-de-quests.js) com a
   `mao` da ficha ao lado — `{ ...registo, mao: ficha.mao }` —, e a quest
   que o esqueleto ofereceu e o herói ainda não abriu, `{ id, mao, estado:
   "oferecida" }`. Do registo lê-se `estado` (ESTADOS_DA_QUEST, e o
   abandono é a falha com `motivo: "abandono"`), `fechouEm` (o dia em que
   fechou: sem ele, a quest fechada não conta para o relógio — um fecho sem
   data não pode dizer se chegou a tempo) e `escolhas` ({ chave: { opcao } }).
   A mão conta pelo `tipo` e pelo `tambem` (a consequência que é também
   pista). O tipo 2 não tem mão, e não entra. */
function questsDe(lista) {
  return arr(lista).map((q) => {
    const o = obj(q);
    const m = o && obj(o.mao);
    if (!m || !MAOS_DO_VILAO[m.tipo] || !ESTADOS_LIDOS.includes(o.estado)) return null;
    const situacao = o.estado === "falhada" && o.motivo === "abandono" ? "abandonada" : o.estado;
    const escolhas = Object.values(obj(o.escolhas) || {}).map((e) => (obj(e) && typeof e.opcao === "string" ? e.opcao : "")).filter(Boolean);
    return {
      id: texto(o.id, 80),
      maos: [m.tipo, ...arr(m.tambem).filter((t) => MAOS_DO_VILAO[t])],
      contra: arr(m.contra).map(inteiro).filter((n) => n >= 1 && n <= FICHA_DO_VILAO.passos),
      situacao, dia: situacao === "aberta" || situacao === "oferecida" ? inteiro(o.inicio) : inteiro(o.fechouEm),
      escolhas,
    };
  }).filter(Boolean);
}

/* os ids dos papéis, pela régua com que o livro escreve */
function idsDosPapeis(f, E, o) {
  try { return resolverPapeis(papeisDoVilao(f), E, { mundo: obj(o.mundo) }).papeis; } catch { return {}; }
}
const entradaDoLivro = (E, campo, id) => {
  const l = obj(E.factos);
  const m = l && obj(l[campo]);
  return m && typeof id === "string" && id ? obj(m[id]) : null;
};

/* ============================================================
   O RELÓGIO — o plano anda, recua ou desvia-se
   relogioDoPlano(ficha, estado, { quests, amado, mundo }) →
     { passos: [{ n, diz, estado, inicio, vence, dia?, porque?, desvio?,
                  muda?, alvo?, recuado?, mira? }],
       atual, cumpridos, fim }
   `estado`: a forma do save (dia, factos, saber, …). `quests`: a
   projeção acima. `amado`: { pessoas, lugares, promessas } — de onde
   `escolherAlvo` tira o alvo quando ele já sabe do herói.
   O juiz é o livro de factos e o estado das quests, nunca o Narrador:
     · passa o prazo                      → cumpre-se (obra e efeitos);
     · a quest que o contesta falha ou é
       abandonada                         → cumpre-se já;
     · a quest ficou por aceitar até ao
       prazo                              → cumpre-se, e o seguinte × ignorada;
     · a quest conclui até ao prazo       → TRAVADO: sem efeitos, e o plano
                                            desvia-se (seTravado); o seguinte
                                            começa no prazo de origem, para
                                            que travar nunca o adiante;
     · a quest de mão recurso conclui     → o seguinte × recurso;
     · um tenente cai ou vira             → o passo que corre ganha um passo
                                            inteiro × recuo, e o que ele servia,
                                            se já se cumprira, desfaz-se.
   ============================================================ */
function quedasDosTenentes(f, E, ids) {
  const out = [];
  const reg = f.registro;
  for (const t of f.tenentes) {
    const id = (ids[t.papel] || {}).id || "";
    const d = entradaDoLivro(E, "pessoas", id);
    const caiu = d && obj(d.derrotado);
    if (caiu && derrotou(E.factos, id)) { out.push({ papel: t.papel, passo: t.passo, dia: Math.max(0, inteiro(caiu.dia) || 0) }); continue; }
    const virou = reg.reagiu.find((r) => r.chave === `virou|${t.papel}`);
    if (virou) out.push({ papel: t.papel, passo: t.passo, dia: virou.dia });
  }
  return out.sort((a, b) => a.dia - b.dia);
}
export function relogioDoPlano(ficha, estado, opcoes) {
  const vazio = { passos: [], atual: null, cumpridos: 0, fim: null };
  const f = obj(ficha) && Array.isArray(ficha.plano) && obj(ficha.registro) ? ficha : null;
  if (!f) return vazio;
  const E = obj(estado) || {};
  const o = obj(opcoes) || {};
  const R = RITMO_DO_PLANO;
  const hoje = Math.max(0, inteiro(E.dia) || 0);
  const quests = questsDe(o.quests);
  const base = diasDoPasso({ corpo: f.corpo.id });
  const ids = idsDosPapeis(f, E, o);
  const quedas = quedasDosTenentes(f, E, ids).filter((q) => q.dia <= hoje);
  const saber = garantirSaber(E.saber);
  const amado = obj(o.amado) || {};
  const usadas = new Set();
  const marcados = [];
  const passos = [];
  let t = f.inicio, mult = 1, atual = null;

  for (let k = 1; k <= f.plano.length; k++) {
    const p = f.plano[k - 1];
    const inicio = t;
    let vence = t + Math.max(R.prazoMinimo, Math.round(base * p.prazo * mult));
    mult = 1;
    /* o recuo: cada queda de tenente dentro da janela empurra o prazo */
    let mexeu = true;
    while (mexeu) {
      mexeu = false;
      quedas.forEach((q, i) => {
        if (!usadas.has(i) && q.dia >= inicio && q.dia <= vence) { usadas.add(i); vence += Math.round(base * R.recuo); mexeu = true; }
      });
    }
    const contra = quests.filter((q) => q.contra.includes(k));
    const cedo = (lista) => lista.filter((q) => q.dia != null && q.dia <= vence && q.dia <= hoje).sort((a, b) => a.dia - b.dia)[0] || null;
    const conc = cedo(contra.filter((q) => q.situacao === "concluida"));
    const falha = cedo(contra.filter((q) => q.situacao === "falhada" || q.situacao === "abandonada"));
    const ignorada = vence <= hoje && contra.some((q) => q.situacao === "oferecida");
    const mira = saber.some((l) => certezaDe(l) >= R.certezaQueMira && l.dia <= inicio);
    const um = { n: k, diz: p.diz, inicio, vence };

    if (conc && (!falha || conc.dia <= falha.dia)) {
      passos.push({ ...um, estado: "travado", dia: conc.dia, porque: "concluida", desvio: p.seTravado });
      if (contra.some((q) => q.maos.includes("recurso") && q.situacao === "concluida" && q.dia != null && q.dia <= vence)) mult = R.recurso;
      t = vence;
      continue;
    }
    let cumpre = null, porque = "";
    if (falha) { cumpre = Math.max(inicio, falha.dia); porque = falha.situacao === "falhada" ? "falhada" : "abandonada"; }
    else if (vence <= hoje) { cumpre = vence; porque = ignorada ? "ignorada" : "prazo"; if (ignorada) mult = R.ignorada; }
    if (cumpre == null) {
      passos.push({ ...um, estado: "corre", mira });
      atual = k;
      for (let j = k + 1; j <= f.plano.length; j++) passos.push({ n: j, diz: f.plano[j - 1].diz, estado: "por_vir" });
      break;
    }
    let alvo = null;
    if (mira) {
      try { alvo = escolherAlvo(p.custa, amado, dadoDo(f.semente, "alvo-do-plano", k), marcados); } catch { alvo = null; }
      if (alvo) marcados.push(alvo);
    }
    passos.push({ ...um, estado: "cumprido", dia: cumpre, porque, muda: p.muda, ...(alvo ? { alvo } : {}), mira });
    t = cumpre;
  }

  /* o que um tenente caído desfaz: o passo que servia, se já se cumprira */
  for (const q of quedas) {
    const s = passos[q.passo - 1];
    if (s && s.estado === "cumprido" && s.dia <= q.dia) passos[q.passo - 1] = { ...s, recuado: true, muda: [] };
  }
  const cumpridos = passos.filter((s) => s.estado === "cumprido" && !s.recuado).length;
  const ult = passos[f.plano.length - 1];
  const acabou = ult && ult.estado === "cumprido" && !ult.recuado;
  return {
    passos, atual, cumpridos,
    fim: acabou && f.fim ? { frase: f.fim.frase, efeitos: f.fim.efeitos, dia: ult.dia, tom: TOM_DO_FIM.para, tenentesAMais: TOM_DO_FIM.tenentesAMais } : null,
  };
}

/* ============================================================
   A CAMADA — o que o herói já sabe dele, subida pelo facto
   camadaDoVilao(ficha, estado, { quests, relogio, ato, anterior, mundo })
     → { id, ordem, alvo, subiu, subiuPor }
   · sobe pelo FACTO (SOBE_A_CAMADA), nunca pelo tempo;
   · UMA camada por turno, no máximo (quem chama chama uma vez por turno);
   · nunca desce; e nunca o rosto antes do ato do rosto.
   `anterior`: a camada guardada (por omissão, a do registo).
   ============================================================ */
function grupoDe(f, grupo, relogio) {
  if (grupo === "tenente") return f.tenentes.map((t) => t.papel);
  if (grupo === "passo") return Object.keys(f.papeis).filter((k) => /^passo_\d+$/.test(k));
  if (grupo === "passo_cumprido") return arr(relogio && relogio.passos).filter((s) => s.estado === "cumprido").map((s) => `passo_${s.n}`).filter((k) => f.papeis[k]);
  return [grupo];
}
function vale(f, E, o, nivel, relogio, quests, ids) {
  const regra = SOBE_A_CAMADA[nivel];
  if (!regra) return true;
  if (regra.ato && (inteiro(o.ato) || 0) < FICHA_DO_VILAO.atoDoRosto) return false;
  for (const [mao, sits] of arr(regra.exige)) {
    if (!quests.some((q) => q.maos.includes(mao) && sits.includes(q.situacao))) return false;
  }
  const papeis = papeisDoVilao(f);
  const ctx = { estado: E, papeis, mundo: obj(o.mundo) };
  for (const [pred, grupo] of arr(regra.factos)) {
    for (const papel of grupoDe(f, grupo, relogio)) {
      if (pred === "esteve_depois") {
        const s = arr(relogio && relogio.passos).find((x) => `passo_${x.n}` === papel);
        const l = entradaDoLivro(E, "lugares", (ids[papel] || {}).id);
        const ate = l && obj(l.esteve) ? inteiro(l.esteve.ate) : null;
        if (s && ate != null && ate >= s.dia) return true;
        continue;
      }
      if (!papeis[papel]) continue;
      const tipo = papeis[papel].tipo === "item" ? "item" : papeis[papel].tipo === "lugar" ? "lugar" : "papel";
      if (avaliarCondicao([pred, `${tipo}:${papel}`], ctx)) return true;
    }
  }
  for (const [mao, sit] of arr(regra.quests)) {
    if (quests.some((q) => q.maos.includes(mao) && q.situacao === sit)) return true;
  }
  return false;
}
export function camadaDoVilao(ficha, estado, opcoes) {
  const o = obj(opcoes) || {};
  const f = obj(ficha) && obj(ficha.registro) ? ficha : null;
  const ant0 = typeof o.anterior === "string" && ORDEM[o.anterior] != null ? o.anterior : f ? f.registro.camada : "rumor";
  const anterior = ORDEM[ant0] != null ? ORDEM[ant0] : 0;
  if (!f) return { id: FASES[anterior].id, ordem: anterior, alvo: anterior, subiu: false, subiuPor: "" };
  const E = obj(estado) || {};
  const quests = questsDe(o.quests);
  const relogio = obj(o.relogio) || relogioDoPlano(f, E, o);
  const ids = idsDosPapeis(f, E, o);
  let alvo = 0;
  for (let n = FASES.length - 1; n >= 1; n--) {
    if (vale(f, E, o, FASES[n].id, relogio, quests, ids)) { alvo = n; break; }
  }
  const ordem = alvo > anterior ? anterior + 1 : anterior;
  const subiu = ordem > anterior;
  const porQue = subiu ? (SOBE_A_CAMADA[FASES[alvo].id] || {}).diz || "" : "";
  return { id: FASES[ordem].id, ordem, alvo, subiu, subiuPor: subiu ? porQue : f.registro.subiuPor };
}

/* ============================================================
   O NOME DO HERÓI — ele não o tem até o aprender
   sabeONome(registro, saber) → bool
   Uma linha `sobre: "nome"` no livro dele, ou o registo que a guardou
   (o livro dele tem teto, TETO_DO_QUE_SABE, e o nome não se esquece).
   ============================================================ */
export function sabeONome(registro, saber) {
  const r = obj(registro);
  if (r && obj(r.nomeDoHeroi)) return true;
  return garantirSaber(saber).some((l) => l.sobre === "nome");
}

/* ============================================================
   AS REAÇÕES — o espelho
   reagirAoHeroi(ficha, estado, { quests, relogio, mundo })
     → { registro, saber, reacoes: [{ id, chave, faz, resposta?, leitura? }] }
   Cada reação acontece uma vez por coisa (a chave fica em `reagiu`): a
   mesma chamada duas vezes não reage duas vezes. A linha do livro dele
   entra por `chegouAteEle`; a do nome guarda-se também no registo.
   ============================================================ */
const REACAO = Object.freeze(Object.fromEntries(REACOES_DO_VILAO.map((r) => [r.quando, r])));
export function reagirAoHeroi(ficha, estado, opcoes) {
  const f = obj(ficha) && obj(ficha.registro) ? ficha : null;
  const E = obj(estado) || {};
  if (!f) return { registro: null, saber: garantirSaber(E.saber), reacoes: [] };
  const o = obj(opcoes) || {};
  const hoje = Math.max(0, inteiro(E.dia) || 0);
  const quests = questsDe(o.quests);
  const ids = idsDosPapeis(f, E, o);
  const ctx = { estado: E, papeis: papeisDoVilao(f), mundo: obj(o.mundo) };
  const visto = new Set(f.registro.reagiu.map((r) => r.chave));
  const achados = [];
  const ponha = (quando, chave, extra) => { if (!visto.has(chave)) { visto.add(chave); achados.push({ quando, chave, ...(extra || {}) }); } };

  for (const t of f.tenentes) {
    const id = (ids[t.papel] || {}).id || "";
    if (poupou(E.factos, id)) ponha("poupou_tenente", `poupou|${t.papel}`, { papel: t.papel, passo: t.passo });
    else if (derrotou(E.factos, id)) ponha("derrotou_tenente", `derrotou|${t.papel}`, { papel: t.papel, passo: t.passo });
    else if (avaliarCondicao(["algum", ["relacao", `papel:${t.papel}`, "aliado"], ["relacao", `papel:${t.papel}`, "amigo"], ["relacao", `papel:${t.papel}`, "companheiro"]], ctx)) {
      ponha("virou_tenente", `virou|${t.papel}`, { papel: t.papel });
    }
  }
  const relogio = obj(o.relogio) || relogioDoPlano(f, E, o);
  for (const s of arr(relogio.passos)) if (s.estado === "travado") ponha("travou_passo", `travou|${s.n}`);
  for (const q of quests) {
    if (q.maos.includes("recurso") && q.situacao === "concluida") ponha("tirou_recurso", `recurso|${q.id}`);
    if (q.maos.includes("rosto") && q.escolhas.includes("aceitar")) ponha("aceitou_oferta", `aceitou|${q.id}`);
  }
  if (arr(relogio.passos).filter((s) => s.porque === "ignorada").length >= 2) ponha("ignorou_duas", "ignorou|2");

  let saber = garantirSaber(E.saber);
  let nomeDoHeroi = f.registro.nomeDoHeroi;
  let guardas = [...f.registro.guardas];
  let balancas = [...f.registro.balancas];
  const reacoes = [];
  const novos = [];
  for (const a of achados) {
    const r = REACAO[a.quando];
    if (!r || r.reservado) continue;
    novos.push({ chave: a.chave, dia: hoje });
    if (r.sabe) {
      saber = chegouAteEle(saber, { o: r.sabe.o, fonte: r.sabe.fonte, dia: hoje, sobre: r.sabe.sobre });
      if (r.sabe.sobre === "nome" && !nomeDoHeroi) nomeDoHeroi = { dia: hoje, fonte: r.sabe.fonte };
    }
    if (r.efeito === "guarda") {
      const prox = (relogio.atual || a.passo || 1);
      if (!guardas.includes(prox)) guardas = [...guardas, prox];
    }
    if (r.efeito === "balanca" && a.papel && !balancas.includes(a.papel)) balancas = [...balancas, a.papel];
    reacoes.push({ id: r.id, chave: a.chave, faz: r.faz, ...(r.resposta ? { resposta: r.resposta } : {}), ...(r.leitura ? { leitura: r.leitura } : {}) });
  }
  const registro = garantirRegistroDoVilao({ ...f.registro, reagiu: [...f.registro.reagiu, ...novos], nomeDoHeroi, guardas, balancas });
  return { registro, saber, reacoes };
}

/* ============================================================
   A FRAQUEZA NA MÃO
   temAFraqueza(ficha, estado, { mundo }) → bool
   ============================================================ */
export function temAFraqueza(ficha, estado, opcoes) {
  const f = obj(ficha) && obj(ficha.registro) ? ficha : null;
  if (!f || !f.fraqueza) return false;
  const cond = COMO_SE_TEM_A_FRAQUEZA[f.fraqueza.familia];
  const papeis = papeisDoVilao(f);
  if (!cond || !papeis.fraqueza) return false;
  return avaliarCondicao(cond, { estado: obj(estado) || {}, papeis, mundo: obj(obj(opcoes) && opcoes.mundo) });
}

/* ============================================================
   O FIM
   desfechoDoVilao(ficha, estado, { quests, mundo }) → { id, depois } | null
   Os quatro (DESFECHOS_DO_VILAO), por ordem; nenhum, enquanto o confronto
   não decidiu. O relógio que chega ao fim não é um desfecho: é o tom que
   muda (relogioDoPlano().fim), e os quatro continuam alcançáveis.
   ============================================================ */
export function desfechoDoVilao(ficha, estado, opcoes) {
  const f = obj(ficha) && obj(ficha.registro) ? ficha : null;
  if (!f) return null;
  const E = obj(estado) || {};
  const o = obj(opcoes) || {};
  const quests = questsDe(o.quests);
  const ctx = { estado: E, papeis: papeisDoVilao(f), mundo: obj(o.mundo) };
  const escolheu = ([mao, valor]) => quests.some((q) => q.maos.includes(mao) && q.escolhas.includes(valor));
  /* um caminho vazio nunca vale: sem facto nem escolha, não decidiu nada */
  const vale = (c) => (arr(c.escolhas).length > 0 || !!c.factos)
    && arr(c.escolhas).every(escolheu) && (!c.factos || avaliarCondicao(c.factos, ctx));
  for (const d of DESFECHOS_DO_VILAO) {
    if (d.fraqueza && (!f.fraqueza || f.fraqueza.familia !== d.fraqueza)) continue;
    if (!arr(d.caminhos).some(vale)) continue;
    if (d.rito && d.rito.corpos.includes(f.corpo.id) && !escolheu(d.rito.escolha)) continue;
    const depois = d.seSobrevive && f.corpo.sobrevive ? `${f.corpo.queda}; ${d.seSobrevive}` : d.depois;
    return { id: d.id, depois };
  }
  return null;
}

/* ============================================================
   O QUE O NARRADOR RECEBE — uma linha, e os vetos
   oVilaoNaPauta(ficha, estado, { camada, relogio, cena, mundo, quests })
     → { momento: "A MÃO DELE AQUI: …" | "", naoPode: [..] }
   `cena`: { presentes: [ids ou nomes], cidade, lugar, mao } — `mao`: o
   tipo da mão da etapa atual de uma quest, quando a há.
   SÓ QUANDO A CENA O TEM: um tenente presente, um lugar dele, um passo
   cumprido nesta cidade, ou a etapa de uma quest com a mão dele. Fora
   disso, nada: a SOMBRA NO MUNDO (resumoVilaoPrompt) continua a ser tudo.
   A linha monta-se só com os campos que a camada permite
   (CAMPOS_DA_CAMADA), e nunca passa do teto (LINHA_DO_VILAO).
   ============================================================ */
function cabe(partes, teto) {
  let s = "";
  for (const [i, p] of partes.entries()) {
    if (!p) continue;
    if (i === 0 || (s + p).length <= teto) s += p;
  }
  if (s.length > teto) s = s.slice(0, teto).replace(/\s+\S*$/, "").replace(/[;,:—\s]+$/, "");
  return s;
}
export function oVilaoNaPauta(ficha, estado, opcoes) {
  const nada = { momento: "", naoPode: [] };
  const f = obj(ficha) && obj(ficha.registro) ? ficha : null;
  if (!f) return nada;
  const E = obj(estado) || {};
  const o = obj(opcoes) || {};
  const cena = obj(o.cena) || {};
  const camada = typeof o.camada === "string" && ORDEM[o.camada] != null ? o.camada : f.registro.camada;
  const ordem = ORDEM[camada];
  const pode = (campo) => ORDEM[CAMPOS_DA_CAMADA[campo]] <= ordem;
  const relogio = obj(o.relogio) || relogioDoPlano(f, E, o);
  const ids = idsDosPapeis(f, E, o);

  /* a cena tem-no? */
  const presentes = arr(cena.presentes).filter((x) => typeof x === "string");
  const estaAqui = (papel, nome) => presentes.some((p) => (ids[papel] && ids[papel].id && p === ids[papel].id) || semAc(p) === semAc(nome));
  const tenenteAqui = f.tenentes.find((t) => estaAqui(t.papel, t.nome)) || null;
  const cidade = semAc(cena.cidade), lugar = semAc(cena.lugar);
  const lugaresDele = Object.entries(f.papeis).filter(([k, p]) => p.tipo === "lugar" && (k === "covil" || /^passo_\d+$/.test(k)));
  /* o lugar pelo nome; e a cidade que é ela mesma o lugar (o covil numa cidade) */
  const noLugarDele = lugaresDele.some(([, p]) => (lugar && semAc(p.nome) === lugar) || (p.nome === p.cidade && cidade && semAc(p.cidade) === cidade));
  const cumpridos = arr(relogio.passos).filter((s) => s.estado === "cumprido" && !s.recuado);
  const cumpridoAqui = cumpridos.filter((s) => { const p = f.papeis[`passo_${s.n}`]; return p && cidade && semAc(p.cidade) === cidade; }).pop() || null;
  const maoAqui = typeof cena.mao === "string" && MAOS_DO_VILAO[cena.mao];
  if (!tenenteAqui && !noLugarDele && !cumpridoAqui && !maoAqui) return nada;

  /* os campos, só os que a camada deixa */
  const corre = arr(relogio.passos).find((s) => s.estado === "corre") || null;
  const obraDe = (s) => (s ? f.plano[s.n - 1].obra : "");
  const v = {};
  v.obra = cumpridoAqui ? obraDe(cumpridoAqui) : cumpridos.length ? obraDe(cumpridos[cumpridos.length - 1]) : corre ? f.plano[corre.n - 1].presagio : f.plano[0].presagio;
  if (pode("assinatura")) v.assinatura = f.assinatura;
  const servo = tenenteAqui || (corre && f.tenentes.find((t) => t.passo === corre.n)) || f.tenentes[0] || null;
  if (pode("tenente") && servo) v.tenente = servo.nome;
  if (pode("nome")) { v.nome = f.nome; v.titulo = f.titulo; v.quer = f.quer; v.crenca = f.crenca; }
  if (pode("plano") && corre) v.plano = f.plano[corre.n - 1].diz;
  if (pode("fraqueza") && f.fraqueza && temAFraqueza(f, E, o)) v.fraqueza = `: ${f.fraqueza.o}`;

  const L = LINHA_DO_VILAO;
  const sabeDoHeroi = arr(relogio.passos).some((s) => s.mira) || garantirSaber(E.saber).some((l) => certezaDe(l) >= RITMO_DO_PLANO.certezaQueMira);
  let modelos = L.camadas[camada] || L.camadas.rumor;
  if (camada === "mao" && !sabeDoHeroi) modelos = modelos.filter((m) => !m.includes("sabe quem eu sou"));
  if (camada === "mao" && !v.tenente) modelos = L.camadas.marca;
  if (camada === "guerra" && !v.plano) modelos = L.camadas.rosto;
  if (camada === "queda") modelos = v.fraqueza ? modelos.slice(0, 2) : [modelos[0], modelos[2]];
  /* a parte com um campo que a camada não deu (ou vazio) não entra */
  const partes = modelos.map((m) => ([...m.matchAll(/\{(\w+)\}/g)].some((x) => !v[x[1]]) ? "" : preencher(m, v)));
  const corpo = cabe(partes, L.teto - L.cabeca.length);
  const momento = corpo ? `${L.cabeca}${corpo}` : "";

  /* os vetos: o nome do herói, quem manda, e a luta no rosto */
  const naoPode = [];
  if (!sabeONome(f.registro, E.saber)) {
    const c = texto(f.cidadeInicial, FICHA_DO_VILAO.nome);
    const alcunha = c ? preencher(L.alcunha.comCidade, { cidade: c }) : L.alcunha.semCidade;
    naoPode.push(preencher(L.vetos.nome, { quem: pode("nome") ? `${f.nome} ou quem o serve` : L.vetos.quemAntes, alcunha }));
  }
  if (!pode("nome") && tenenteAqui) naoPode.push(L.vetos.quemManda);
  if (camada === "rosto") naoPode.push(preencher(L.vetos.semLuta, { nome: f.nome }));
  return { momento, naoPode };
}

/* ============================================================
   O VILÃO NO DIÁRIO — o cartaz da sombra (08/11/2026, Fase BQ · BQ7, o
   pedido 4 do desenho: mente/formas.md «## BQ · as quests na tela», §BQ 5)
   oVilaoNoDiario(ficha, estado, { quests, relogio, mundo })
     → null | { camada, nome, quemE, linhas: [{ texto, nova }], plano }
   O que o JOGADOR sabe dele, na voz do jogador (não na do Narrador): uma
   linha por camada alcançada, a mais nova à cabeça e marcada `nova`; o
   nome só no rosto (até lá `null`); o plano — um estado por passo — só na
   guerra (até lá `null`); a fraqueza só na queda e só quando o herói a tem.
   A régua dos campos é a MESMA da pauta (CAMPOS_DA_CAMADA), e a suíte prova
   o mesmo: nenhum campo de uma camada de cima aparece.
   DIARIO_DO_VILAO: as frases (modelos com {campos}), o «quem é» de cada
   camada, quantas linhas a tela mostra de cara, e o nome de cada estado de
   um passo no plano. ============================================================ */
export const DIARIO_DO_VILAO = Object.freeze({
  mostra: 3,
  linhas: Object.freeze({
    rumor: "{obra}",
    marca: "Por onde passa, fica {assinatura}.",
    mao: "{tenente} trabalha por ele.",
    rosto: "Quer {quer}.",
    queda: "Cai sem luta {fraqueza}.",
  }),
  quemE: Object.freeze({ semNome: "sem nome, sem rosto", comServo: "sem nome — mas tem quem o sirva", semTitulo: "o nome que já se sabe" }),
  plano: Object.freeze({ cumprido: "feito", recuado: "travado", travado: "travado", corre: "agora", por_vir: "por_vir" }),
});
const frasePronta = (s) => { const t = texto(s, 400); return t ? t[0].toUpperCase() + t.slice(1) + (/[.!?…]$/.test(t) ? "" : ".") : ""; };
export function oVilaoNoDiario(ficha, estado, opcoes) {
  const f = obj(ficha) && obj(ficha.registro) ? ficha : null;
  if (!f) return null;
  const E = obj(estado) || {};
  const o = obj(opcoes) || {};
  const camada = ORDEM[f.registro.camada] != null ? f.registro.camada : "rumor";
  const ordem = ORDEM[camada];
  const pode = (campo) => ORDEM[CAMPOS_DA_CAMADA[campo]] <= ordem;
  const relogio = obj(o.relogio) || relogioDoPlano(f, E, o);
  const D = DIARIO_DO_VILAO;
  const passos = arr(relogio.passos);
  const cumpridos = passos.filter((s) => s.estado === "cumprido" && !s.recuado);
  const corre = passos.find((s) => s.estado === "corre") || null;
  const v = {};
  v.obra = cumpridos.length ? f.plano[cumpridos[cumpridos.length - 1].n - 1].obra : corre ? f.plano[corre.n - 1].presagio : f.plano[0].presagio;
  if (pode("assinatura")) v.assinatura = f.assinatura;
  if (pode("tenente")) {
    const ctx = { estado: E, papeis: papeisDoVilao(f), mundo: obj(o.mundo) };
    const visto = f.tenentes.find((t) => { try { return avaliarCondicao(["conheceu", `papel:${t.papel}`], ctx); } catch { return false; } });
    const servo = visto || (corre && f.tenentes.find((t) => t.passo === corre.n)) || f.tenentes[0] || null;
    if (servo) v.tenente = servo.nome;
  }
  if (pode("quer")) v.quer = f.quer;
  if (pode("fraqueza") && f.fraqueza && temAFraqueza(f, E, o)) v.fraqueza = `: ${f.fraqueza.o}`;
  const linhas = [];
  for (const fase of FASES) {
    if (fase.ordem > ordem) break;
    const m = D.linhas[fase.id];
    if (!m || [...m.matchAll(/\{(\w+)\}/g)].some((x) => !v[x[1]])) continue;
    linhas.unshift({ texto: fase.id === "rumor" ? frasePronta(v.obra) : preencher(m, v), nova: false });
  }
  if (linhas.length) linhas[0] = { ...linhas[0], nova: true };
  const nome = pode("nome") && f.nome ? f.nome : null;
  const quemE = pode("titulo") ? (f.titulo || D.quemE.semTitulo) : v.tenente ? D.quemE.comServo : D.quemE.semNome;
  const plano = pode("plano") ? passos.map((s) => D.plano[s.recuado ? "recuado" : s.estado] || D.plano.por_vir) : null;
  return { camada, nome, quemE, linhas, plano };
}
