/* ============================================================
   OS ARREDORES (v9.51) — o que existe fora dos muros

   O mundo tinha duas escalas e um buraco entre elas. De um lado o
   MAPA: vinte cidades, regiões, estradas, dias de viagem. Do outro a
   BASE: o que existe DENTRO de cada cidade — a taverna, a forja, o
   cemitério, a gente com nome e vontade.

   Entre uma coisa e outra, nada. E é justamente aí que a ficção mais
   acontece: a fazenda de Jessa a quarenta minutos a pé, o moinho onde
   o corpo apareceu, a capela na encruzilhada, a ruína que ninguém
   visita. O `lugar.js` já sabia GUARDAR um ponto assim depois que a
   ficção o inventasse — mas ele nascia do nada, com nome diferente a
   cada vez que o Mestre lembrasse dele, e não existia no mapa.

   Aqui os arredores passam a existir ANTES de serem narrados, como
   tudo mais neste mundo: gerados da semente, sempre os mesmos, com
   nome, dono, distância a pé e uma posição em volta da cidade. O
   Mestre não os inventa — ele os encontra.

   DUAS DECISÕES:

   1) ARREDOR NÃO É VIAGEM. A distância se mede em MINUTOS de
      caminhada, não em dias de estrada. Ir e voltar cabe numa tarde,
      e é isso que separa "a fazenda ali" de "a cidade vizinha".

   2) ARREDOR NÃO TEM NÉVOA. Quem mora numa cidade sabe que há um
      moinho rio acima — não é segredo, é paisagem. O que ESTÁ lá
      dentro (quem, o quê, o porquê) continua sendo descoberta.
   ============================================================ */

import { rngDe } from "./geografia.js";
import { unidadesAPe, coordDe, kmEntre, rumoEntre, aPeEmTexto } from "./coordenadas.js";

const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];

/* `peso` é quantos arredores o porte sustenta: uma aldeia tem um moinho
   e uma capela; uma capital tem cinturão inteiro de fazendas e pedreiras. */
const QUANTOS_POR_PORTE = { aldeia: 2, vila: 3, cidade: 4, fortaleza: 3, capital: 5 };

/* `bioma` restringe onde o tipo aparece; sem bioma, aparece em qualquer lugar.
   `minutos` é a caminhada de ida — o dobro é o custo de ir e voltar. */
export const TIPOS_ARREDOR = [
  { tipo: "fazenda", icone: "🌾", minutos: 45, bioma: ["planicie", "colina", "floresta"], nomes: ["a fazenda velha", "a granja do vale", "as terras baixas", "a courela do rio"] },
  { tipo: "moinho", icone: "🌬", minutos: 35, bioma: ["planicie", "colina", "floresta", "costa"], nomes: ["o moinho de cima", "o moinho quebrado", "a azenha do rio"] },
  { tipo: "capela", icone: "⛪", minutos: 30, nomes: ["a capela da encruzilhada", "o santuário à beira do caminho", "a ermida de pedra"] },
  { tipo: "ponte", icone: "🌉", minutos: 25, bioma: ["planicie", "floresta", "pantano", "colina"], nomes: ["a ponte de pedra", "a passagem estreita", "a ponte dos pedágios"] },
  { tipo: "ruína", icone: "🏚", minutos: 70, nomes: ["a torre caída", "as pedras antigas", "o casarão vazio", "a muralha esquecida"] },
  { tipo: "mina", icone: "⛏", minutos: 80, bioma: ["montanha", "colina", "gelo"], nomes: ["a boca da mina", "o poço fundo", "a galeria de cima"] },
  { tipo: "pedreira", icone: "🪨", minutos: 60, bioma: ["montanha", "colina", "deserto"], nomes: ["a pedreira", "o corte de pedra", "a lavra alta"] },
  { tipo: "pomar", icone: "🍎", minutos: 30, bioma: ["planicie", "floresta", "costa"], nomes: ["o pomar cercado", "as figueiras", "o olival"] },
  { tipo: "cabana", icone: "🛖", minutos: 55, bioma: ["floresta", "montanha", "pantano", "gelo"], nomes: ["a cabana do caçador", "o abrigo de lenhador", "a choça no mato"] },
  { tipo: "embarcadouro", icone: "⛵", minutos: 20, bioma: ["costa"], nomes: ["o embarcadouro", "o cais pequeno", "a enseada dos barcos"] },
  { tipo: "salinas", icone: "🧂", minutos: 50, bioma: ["costa", "deserto"], nomes: ["as salinas", "os tanques de sal"] },
  { tipo: "posto", icone: "🏕", minutos: 65, nomes: ["o posto da estrada", "a estalagem do caminho", "a casa de muda"] },
  { tipo: "cemitério de fora", icone: "🪦", minutos: 25, nomes: ["o campo dos anônimos", "as covas rasas", "o adro velho"] },
];

/* Quem cuida do lugar — não é a `gente` da base (essa mora nos locais da
   cidade); é a linha de cor que faz um moinho ter dono. */
const DONOS = [
  "uma família que não fala com a cidade", "um velho que mora sozinho lá",
  "duas irmãs que herdaram a terra", "ninguém há anos", "um casal e três filhos",
  "um arrendatário que deve ao senhor da cidade", "um antigo soldado",
  "gente que chegou faz pouco e não explica de onde",
];

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* Os arredores de uma cidade. Determinístico: mesma semente e mesma
   cidade, mesmos lugares, para sempre. */
export function arredoresDaCidade(semente, cidade) {
  if (!cidade || !cidade.nome) return [];
  const rnd = rngDe(`${semente}|arredores|${cidade.nome}`);
  const quantos = QUANTOS_POR_PORTE[cidade.porte || cidade.tipo] || 3;
  const elegiveis = TIPOS_ARREDOR.filter((t) => !t.bioma || t.bioma.includes(cidade.bioma || "planicie"));
  const escolhidos = [];
  const resto = [...elegiveis];
  while (escolhidos.length < quantos && resto.length) {
    escolhidos.push(resto.splice(Math.floor(rnd() * resto.length), 1)[0]);
  }
  /* espalha em volta da cidade: cada um num setor do círculo, com uma
     folga sorteada, para o cinturão não sair simétrico como um relógio */
  const passo = 360 / Math.max(1, escolhidos.length);
  return escolhidos.map((t, i) => {
    const ang = (i * passo + rnd() * passo * 0.7) * (Math.PI / 180);
    /* ---------------- A DISTÂNCIA VEM DO RELÓGIO (v9.118) ----------------
       Até aqui a posição no mapa era sorteada entre 6 e 11 unidades da
       cidade — de 150 a 275 km — enquanto o mesmo registro dizia que o
       moinho ficava a trinta e cinco minutos a pé. Duas verdades sobre a
       mesma coisa, e a que o jogador via desenhada era a errada.

       Agora só existe uma: a caminhada. A coordenada é derivada dela, e
       nunca mais pode discordar. `retidao` é o que separa o caminho da
       linha reta — quem anda quarenta minutos não está a quarenta
       minutos em linha reta, porque nenhuma estrada é reta. Ela ocupa o
       mesmo sorteio que a distância crua ocupava, de propósito: mudar a
       ordem dos sorteios trocaria o nome de todo arredor de todo mundo
       já salvo. */
    const retidao = 0.7 + rnd() * 0.25;
    const minutos = Math.round(t.minutos * (0.8 + rnd() * 0.5));
    const dist = unidadesAPe(minutos) * retidao;
    const x = Math.max(0, Math.min(100, (cidade.x || 50) + Math.cos(ang) * dist));
    const y = Math.max(0, Math.min(100, (cidade.y || 50) + Math.sin(ang) * dist));
    return {
      id: `${cidade.nome}|arredor|${t.tipo}`,
      tipo: t.tipo, icone: t.icone,
      nome: pick(rnd, t.nomes),
      cidade: cidade.nome,
      dono: pick(rnd, DONOS),
      minutos,
      /* posição no mapa-mundo, já somada à da cidade */
      x, y,
      coord: coordDe({ x, y }),
      /* posição no mapa da cidade: mesmo ângulo, raio fixo fora dos muros */
      ang: ang,
    };
  });
}

/* A que rumo e a que distância um arredor fica da sua cidade. Deriva da
   posição — nunca de um segundo campo guardado, que é como a v9.51
   deixou o mapa dizer uma coisa e o texto outra. */
export function ondeFicaOArredor(cidade, arredor) {
  const c = coordDe(cidade), a = coordDe(arredor);
  if (!c || !a) return null;
  return { coord: a, km: kmEntre(c, a), rumo: rumoEntre(c, a) };
}

/* O jogador escreveu "vou até o moinho": qual arredor é esse? Aceita o
   nome inteiro, o tipo solto ("moinho") e o nome sem artigo. */
export function arredorPorTexto(semente, cidade, texto) {
  const t = norm(texto);
  if (!t) return null;
  for (const a of arredoresDaCidade(semente, cidade)) {
    const n = norm(a.nome).replace(/^(a|o|as|os)\s+/, "");
    if (t.includes(n) || t.includes(norm(a.tipo))) return a;
  }
  return null;
}

export function tempoDeIda(arredor) {
  return aPeEmTexto(Math.max(5, Number(arredor && arredor.minutos) || 30));
}

/* O que o Mestre lê. Curto de propósito: é uma lista de existências, não
   um texto de regra — a regra de lugar já está em `lugar.js`. */
export function resumoArredoresPrompt(semente, cidade) {
  const lista = arredoresDaCidade(semente, cidade);
  if (!lista.length) return "";
  return `FORA DOS MUROS DE ${String(cidade.nome).toUpperCase()} (existe de verdade, gerado pelo sistema — use estes, não invente outro e não renomeie nenhum): ${lista.map((a) => {
    const o = ondeFicaOArredor(cidade, a);
    return `${a.icone} ${a.nome} (${o && o.rumo ? `${o.rumo.rotulo}, ` : ""}${tempoDeIda(a)}; ${a.dono})`;
  }).join(" · ")}.
- Estes lugares são PAISAGEM, não segredo: qualquer morador sabe apontar o caminho. O que acontece DENTRO deles é que é descoberta.
- Quando o herói for a um deles, registre "lugar_atual" com o nome exato daqui. A ida custa MINUTOS, nunca dias — não transforme em viagem.`;
}

/* v9.118: O BLOCO FIXO DOS ARREDORES SAIU DAQUI, e não foi para caber.
   Ele dizia duas regras — "não invente outros, não renomeie, não trate
   como segredo" e "a ida custa minutos, não dias" — e o envelope acima
   dizia as mesmas duas, logo abaixo da lista. A porta que abria o bloco é
   `emCidade`, exatamente a condição que faz o envelope existir: ele nunca
   apareceu sem o envelope junto. Regra repetida não ensina duas vezes,
   custa duas. O que era só dele — "não renomeie" — subiu para o cabeçalho
   do envelope, que é onde a lista está e onde a tentação de renomear é. */
