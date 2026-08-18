/* ============================================================
   OS CÔMODOS (v9.58) — lugar dentro do lugar

   A pergunta que abriu este arquivo foi direta: "o sistema de locais
   dentro dos lugares está funcionando? Tipo, quartos numa taverna."

   A resposta honesta era MEIO. A distância `dentro` existia desde a
   v9.54, e o Mestre podia registrar `lugar_atual: "o quarto de cima"`
   — o rodapé passava a defender o herói ali, e isso funcionava. Mas
   era uma regra escrita sem código atrás, da pior espécie: o sistema
   não SABIA que a taverna tem quartos. Não sabia quantos, nem quais,
   nem se o quarto da primeira noite era o mesmo da terceira. Só
   acreditava no que o Mestre dissesse depois de dizer.

   E a consequência aparecia na hora de andar. `talvezAndarNaCidade`
   move o herói quando ele escreve o nome de um lugar QUE O SISTEMA
   CONHECE — e a lista de lugares conhecidos parava na porta do
   prédio. "Subo para o quarto" não movia nada, porque não havia
   quarto nenhum em lista nenhuma.

   Aqui a cidade ganha o terceiro andar da sua hierarquia:

       mundo → cidade → local → cômodo

   TRÊS DECISÕES:

   1) O CÔMODO É DO PRÉDIO, NÃO DA CIDADE. A adega é da taverna. Só
      entra na lista de destinos de quem está NA taverna — "vou para a
      adega" no meio da praça não quer dizer nada, e tratar como se
      quisesse teleportaria o herói para dentro de um prédio em que
      ele não entrou.

   2) O MESMO PRÉDIO TEM OS MESMOS CÔMODOS PARA SEMPRE. Mesma semente,
      mesmo local, mesma planta — é isso que faz o quarto de cima do
      Javali virar UM lugar em vez de um cenário reciclado.

   3) NEM TODO CÔMODO É PÚBLICO. A adega, a cela, a cripta e a sala
      dos fundos existem e o sistema deixa entrar — mas avisa o Mestre
      de que entrar ali é invadir. Um cômodo restrito sem essa marca
      seria uma porta pintada na parede: aberta para o código e
      fechada para a ficção, ou o contrário, dependendo do humor da
      narração.
   ============================================================ */

import { rngDe } from "./geografia.js";

const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];

/* Os cômodos que cada tipo de local pode ter. `sempre` é o que define o
   prédio — uma taverna sem salão não é uma taverna. O resto é sorteado. */
const PLANTAS = {
  taverna: {
    sempre: [
      { id: "salao", nome: "o salão", icone: "🍺", nota: "as mesas, o fogo e quem bebe" },
    ],
    talvez: [
      { id: "quarto", nome: "o quarto de cima", icone: "🛏", nota: "cama estreita, bacia, tranca fraca", hospedagem: true },
      { id: "quartos", nome: "os quartos do sótão", icone: "🛏", nota: "três camas debaixo do telhado", hospedagem: true },
      { id: "cozinha", nome: "a cozinha", icone: "🍲", nota: "panela no fogo e uma porta para os fundos", restrito: true },
      { id: "adega", nome: "a adega", icone: "🍷", nota: "barris, escuro, cheiro de vinagre", restrito: true },
      { id: "estrebaria", nome: "a estrebaria", icone: "🐴", nota: "palha, dois cavalos e o menino que cuida" },
      { id: "fundos", nome: "a sala dos fundos", icone: "🚪", nota: "onde se joga e onde se combina o que não se fala na mesa", restrito: true },
    ],
  },
  templo: {
    sempre: [{ id: "nave", nome: "a nave", icone: "🕯", nota: "os bancos, o altar, quem reza" }],
    talvez: [
      { id: "sacristia", nome: "a sacristia", icone: "📿", nota: "vestes, óleos e o livro do dia", restrito: true },
      { id: "cripta", nome: "a cripta", icone: "⚰", nota: "degraus para baixo e nomes gastos na pedra", restrito: true },
      { id: "campanario", nome: "o campanário", icone: "🔔", nota: "escada em caracol e a cidade inteira lá de cima" },
      { id: "cela", nome: "a cela do sacerdote", icone: "🚪", nota: "catre, mesa, uma vela", restrito: true },
    ],
  },
  forja: {
    sempre: [{ id: "bancada", nome: "a bancada", icone: "🔨", nota: "bigorna, fole e o calor" }],
    talvez: [
      { id: "deposito", nome: "o depósito de ferro", icone: "📦", nota: "barras, sucata e encomendas por buscar", restrito: true },
      { id: "patio", nome: "o pátio da têmpera", icone: "💧", nota: "tina d'água e fumaça branca" },
      { id: "sobrado", nome: "o sobrado do ferreiro", icone: "🛏", nota: "onde a família dorme", restrito: true },
    ],
  },
  mercado: {
    sempre: [{ id: "praca", nome: "a praça", icone: "⚖", nota: "as bancas e o pregão" }],
    talvez: [
      { id: "armazem", nome: "o armazém", icone: "📦", nota: "fardos empilhados até o teto", restrito: true },
      { id: "cambio", nome: "a banca dos cambistas", icone: "🪙", nota: "balança, pesos e olhos atentos" },
      { id: "beco", nome: "o beco atrás das bancas", icone: "🌑", nota: "onde se vende o que não tem banca" },
    ],
  },
  quartel: {
    sempre: [{ id: "patio", nome: "o pátio de armas", icone: "🛡", nota: "recrutas, poeira e gritos" }],
    talvez: [
      { id: "arsenal", nome: "o arsenal", icone: "🗡", nota: "lanças em fileira e cotas penduradas", restrito: true },
      { id: "alojamento", nome: "o alojamento", icone: "🛏", nota: "beliches e o cheiro de couro" },
      { id: "sala_capitao", nome: "a sala do capitão", icone: "📜", nota: "mapas na mesa e uma porta que se fecha", restrito: true },
    ],
  },
  cadeia: {
    sempre: [{ id: "guarita", nome: "a guarita", icone: "⛓", nota: "o carcereiro e o livro dos nomes" }],
    talvez: [
      { id: "celas", nome: "as celas", icone: "🔒", nota: "corredor de grades e quem chama de dentro", restrito: true },
      { id: "poco", nome: "o poço", icone: "🕳", nota: "a cela funda, sem janela", restrito: true },
      { id: "sala_ferros", nome: "a sala dos ferros", icone: "🔥", nota: "o que ninguém quer descrever", restrito: true },
    ],
  },
  biblioteca: {
    sempre: [{ id: "sala_leitura", nome: "a sala de leitura", icone: "📖", nota: "mesas longas e luz de janela alta" }],
    talvez: [
      { id: "arquivo", nome: "o arquivo", icone: "🗄", nota: "prateleiras de registros e pó", restrito: true },
      { id: "copias", nome: "a sala das cópias", icone: "🖋", nota: "tinta, pergaminho e mãos manchadas" },
      { id: "reserva", nome: "a reserva trancada", icone: "🔐", nota: "o que não sai daqui e não se lê em voz alta", restrito: true },
    ],
  },
  docas: {
    sempre: [{ id: "cais", nome: "o cais", icone: "⚓", nota: "cordame, gaivotas e carga descendo" }],
    talvez: [
      { id: "casa_porto", nome: "a casa do porto", icone: "📜", nota: "manifestos, taxas e o mestre do porto" },
      { id: "galpao", nome: "o galpão", icone: "📦", nota: "caixotes com selo de longe", restrito: true },
      { id: "estaleiro", nome: "o estaleiro", icone: "🔨", nota: "um casco aberto e serragem molhada" },
    ],
  },
  arena: {
    sempre: [{ id: "areia", nome: "a areia", icone: "⚔", nota: "o círculo, e a multidão em volta" }],
    talvez: [
      { id: "jaulas", nome: "as jaulas", icone: "🪤", nota: "o que entra na areia quando não é gente", restrito: true },
      { id: "vestiario", nome: "o vestiário dos lutadores", icone: "🩸", nota: "bandagens, óleo e silêncio antes" },
      { id: "camarote", nome: "o camarote", icone: "🍇", nota: "de onde os que apostam alto assistem", restrito: true },
    ],
  },
  cemitério: {
    sempre: [{ id: "campo", nome: "o campo de pedras", icone: "🪦", nota: "as lápides e o vento" }],
    talvez: [
      { id: "jazigo", nome: "o jazigo antigo", icone: "⚰", nota: "porta de ferro e um nome apagado", restrito: true },
      { id: "casa_coveiro", nome: "a casa do coveiro", icone: "🏚", nota: "pás, cal e um caderno de datas" },
      { id: "ossario", nome: "o ossário", icone: "💀", nota: "empilhado com método", restrito: true },
    ],
  },
  guilda: {
    sempre: [{ id: "salao_contratos", nome: "o salão dos contratos", icone: "🏛", nota: "o mural, as mesas e quem espera" }],
    talvez: [
      { id: "sala_mestre", nome: "a sala do mestre de guilda", icone: "📜", nota: "selo, livro-caixa e uma cadeira só para visita", restrito: true },
      { id: "treino", nome: "o pátio de treino", icone: "🎯", nota: "alvos gastos e um veterano corrigindo" },
      { id: "cofre", nome: "o cofre", icone: "🔐", nota: "duas fechaduras e duas chaves diferentes", restrito: true },
    ],
  },
  "casa de banhos": {
    sempre: [{ id: "piscina", nome: "a piscina quente", icone: "💧", nota: "vapor e conversa que não devia acontecer" }],
    talvez: [
      { id: "vestiario", nome: "o vestiário", icone: "🧺", nota: "roupas dobradas e ninguém olhando" },
      { id: "sala_privada", nome: "a sala privada", icone: "🚪", nota: "alugada pela hora, cortina pesada", restrito: true },
      { id: "caldeira", nome: "a caldeira", icone: "🔥", nota: "lenha, fumaça e quem alimenta o fogo", restrito: true },
    ],
  },
};

/* Quantos cômodos, além dos obrigatórios. Um prédio de três andares não
   cabe numa aldeia, e uma capital não tem uma taverna de um cômodo só. */
const EXTRAS_POR_PORTE = { aldeia: 1, vila: 2, cidade: 3, fortaleza: 2, capital: 3 };

export function comodosDoLocal(semente, local, genero = "Fantasia medieval", molde = null) {
  if (!local || !local.tipo) return [];
  const planta = PLANTAS[local.tipo];
  if (!planta) return [];
  const rnd = rngDe(`${semente}|comodos|${local.id || local.nome}`);
  const extras = EXTRAS_POR_PORTE[local.porte] || 2;
  const resto = [...planta.talvez];
  const escolhidos = [...planta.sempre];
  for (let i = 0; i < extras && resto.length; i++) {
    escolhidos.push(resto.splice(Math.floor(rnd() * resto.length), 1)[0]);
  }
  return escolhidos.map((c) => ({
    id: `${local.id || local.nome}|${c.id}`,
    nome: c.nome,
    icone: c.icone,
    tipo: "cômodo",
    nota: c.nota,
    restrito: !!c.restrito,
    hospedagem: !!c.hospedagem,
    de: local.nome,
    deTipo: local.tipo,
  }));
}

/* O cômodo que hospeda: é aqui que "durmo na taverna" tem onde acontecer.
   Devolve null quando o prédio não aluga cama. */
export function camaDoLocal(semente, local, genero, molde) {
  return comodosDoLocal(semente, local, genero, molde).find((c) => c.hospedagem) || null;
}

/* A linha que o Mestre recebe sobre o prédio em que o herói está. Não é
   decoração: sem ela o Mestre inventa uma escada que não existe, e o
   jogador que escreve "subo" descobre que o sistema não o segue. */
export function resumoComodosPrompt(comodos, deNome) {
  const cs = (comodos || []).filter((c) => c && c.nome);
  if (!cs.length) return "";
  const linhas = cs.map((c) => `- ${c.nome}${c.restrito ? " (RESTRITO — entrar aqui é invadir)" : ""}: ${c.nota}.`);
  return `OS CÔMODOS DAQUI${deNome ? ` (${deNome})` : ""}:
${linhas.join("\n")}
- Esta é a planta INTEIRA do prédio, e ela é fixa: não invente um cômodo que não está na lista, e não negue um que está.
- Mover-se entre cômodos é do jogador, e o sistema registra. Você narra a chegada; não me arraste para outro cômodo por conta própria.`;
}

export const COMODOS_PROMPT = `LUGAR DENTRO DO LUGAR (v9.58):
- Um prédio tem cômodos, e o sistema conhece os dele: o salão, o quarto de cima, a adega, a cripta, as celas. Quando a lista de cômodos aparecer acima, ela é completa e é fixa.
- Quando eu escrever que subo, desço ou entro num cômodo, o SISTEMA registra o movimento e o tempo — você só narra a chegada e o que há lá.
- Um cômodo RESTRITO não está trancado para o código: está fechado para a ficção. Se eu entrar num, trate como invasão — quem me vê, o que se arrisca, o que acontece se me pegarem.
- Estar num cômodo não é estar fora da cidade nem em viagem: descer uma escada custa um minuto, nunca horas nem dias.`;
