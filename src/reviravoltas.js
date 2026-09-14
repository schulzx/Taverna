/* ============================================================
   AS REVIRAVOLTAS (v9.203) — a verdade escondida na criação

   Quinto órgão do diretor de histórias. Num sistema sem IA generativa,
   reviravolta é uma FORMA DE INVERSÃO aplicada a fatos que o jogador
   viveu. A forma diz: só nasço se tais fatos existirem; planto tais
   sementes; disparo em tal condição; e no dia seguinte o mundo muda
   assim. Eleita NA CRIAÇÃO do mundo, por semente, determinística — a
   mesma campanha tem sempre a mesma verdade escondida, e ela se prova.

   Esta é a primeira, ponta a ponta: A MÁSCARA DO ALIADO — o companheiro
   de confiança é agente do vilão. Ela não nasce do nada: o propósito
   "trair" já existe em indole.js. O que a reviravolta acrescenta é o
   que faltava para a inversão ser história, e não acidente:

     · ela é ELEITA na criação (determinística), não sorteada na hora;
     · ela SEMEIA no Livro de Promessas, ao longo do arco, os sinais que
       a preparam — e a revelação NÃO pode cair antes de eles amadurecerem
       (a catraca ① do Livro: três sementes maduras);
     · ela LIGA a traição ao VILÃO — o traidor não vende por ouro, vende
       para quem move as sombras; e o antagonista.js ganha o que o traidor
       sabia;
     · o Narrador DESCOBRE junto com o jogador: a verdade eleita nunca
       entra na pauta antes do turno da revelação. As sementes ele planta
       sem saber do que são sementes.

   ---------------- SEPARADO DO DESENHO ----------------

   Conta se prova. A eleição, o gate e o dia seguinte se provam em Node.
   O App elege uma vez, planta no Livro e revela quando a catraca deixa.
   ============================================================ */

import { hashSemente } from "./semente.js";
import { podeColher } from "./promessas.js";
/* v9.228: o DETECTOR de cada forma mora aqui, e por isso este arquivo
   passa a conhecer o vocabulário do mundo. Não há ciclo, e dá para
   provar: só o `App.jsx` importa `reviravoltas.js`; `npcs.js`,
   `itens-uteis.js` e `antecedentes.js` não importam nada; `indole.js`
   puxa apenas `geografia.js`. */
import { paresEntre, vezesQueUsouInformante, palavrasDoPapel } from "./npcs.js";
import { classeDoItem } from "./itens-uteis.js";
import { indoleDe } from "./indole.js";
import { oficioDoAntecedente } from "./antecedentes.js";

/* ============================================================
   R2 (v9.228) — TODA FORMA ELEITA TEM DETECTOR

   Sete formas na prateleira e duas com detector: quando o mundo elegia
   uma das outras cinco, o App perguntava "quem é o alvo?", ouvia `null`
   e a virada nunca nascia. Acervo escrito que não pode acontecer é o
   bug de sempre, com roupa de enredo.

   O detector DESCEU do App e mora NA PRÓPRIA FORMA, ao lado de
   `soNasceSe`, por duas razões:

   · achar o alvo é REGRA, e regra se prova em Node — no App dependia de
     seis refs e não se provava em lugar nenhum;
   · a catraca fica ESTRUTURAL: forma nova sem `achaAlvo` quebra na
     primeira asserção, sem ninguém precisar lembrar da lei.

   `achaAlvo(mundo)` é a `soNasceSe` daquela forma traduzida em BUSCA DE
   ALVO VIVO: devolve o NOME (string) ou `null`. Determinístico sempre —
   onde a ordem de inserção de um registro decidiria, há desempate
   explícito, e ele está comentado onde está.
   ============================================================ */

/* Os números que as formas medem. Se é número, é tabela — e é aqui que
   eles vivem, um por linha, para `soNasceSe` e `achaAlvo` lerem a MESMA
   linha e as duas metades da mesma forma nunca discordarem. */
export const LIMIARES_DA_VIRADA = {
  /* quantas vezes a campanha se apoiou numa boca antes de ela valer uma
     reviravolta: três é o mínimo que faz "sempre vendeu para os dois"
     soar como hábito, e não como acidente */
  consultasDoInformante: 3,
  /* 1500 é o piso do porte `cidade` em geografia.js — a faixa onde há
     mercado permanente, guilda e templo. Abaixo disso não há dízimo que
     se pague: uma aldeia de duzentas almas não compra a paz de ninguém. */
  populacaoDaCidadeProspera: 1500,
};

/* ---------------- O MESTRE DO OFÍCIO ----------------
   `oficioDoAntecedente` devolve o ofício como a ficha o diz — "a forja",
   "as letras mortas" —, e o papel de um NPC vem no vocabulário de quem o
   exerce: "ferreiro", "arquivista". As duas metades quase nunca
   compartilham palavra, então casar por `mesmoPapel` sozinho não acha
   ninguém — e, pior, aquele leitor devolve `true` quando um dos lados
   não tem palavra informativa, o que daria o mestre do herói a qualquer
   figurante de papel vazio.

   Esta tabela é a ponte, e é tabela porque é regra: por ofício, as
   palavras que nomeiam quem o domina. Uma palavra por entrada, sem
   acento e com quatro letras ou mais — é o que `palavrasDoPapel` deixa
   passar do outro lado, e casar com o que ela filtra seria escrever
   regra que nunca dispara. Antecedente sem ofício não entra aqui: quem
   não teve mestre não pode ter sido traído por ele. */
export const PAPEIS_DO_MESTRE = {
  "as armas": ["armas", "espada", "espadachim", "esgrimista", "instrutor", "sargento", "capitao", "veterano", "guerreiro"],
  "as letras mortas": ["letras", "escriba", "arquivista", "bibliotecario", "erudito", "sabio", "tradutor", "copista", "escrivao"],
  "a gazua": ["gazua", "ladrao", "gatuno", "arrombador", "batedor", "contrabandista", "punguista", "trapaceiro"],
  "o rito": ["rito", "ritos", "sacerdote", "sacerdotisa", "clerigo", "abade", "abadessa", "acolito", "capelao", "monge"],
  "as canções": ["cancoes", "bardo", "menestrel", "trovador", "musico", "cantor", "cantora", "harpista", "alaudista"],
  "o rastreio": ["rastreio", "rastreador", "batedor", "cacador", "cacadora", "monteiro", "explorador", "guia"],
  "a forja": ["forja", "ferreiro", "ferreira", "ferraria", "armeiro", "forjador", "funileiro"],
  "os ritos do culto": ["culto", "cultista", "hierofante", "oficiante", "profeta", "profetisa", "iniciado", "sacerdote"],
};

/* ---------------- AS FERRAMENTAS DOS DETECTORES ----------------
   Pequenas, privadas e sem opinião: quem decide é a forma. */

/* o intervalo de marcas combinantes vai ESCAPADO ([\u0300-\u036f]), e nao
   literal como nos arquivos vizinhos: escrito literal ele atravessa mal
   ferramenta e shell, e uma normalizacao que perdeu o acento so se
   descobre no dia em que um nome com til deixa de casar */
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

/* a ordem alfabética da forma normalizada — é o desempate desta casa
   sempre que a alternativa seria a ordem de inserção de um registro, que
   é o acaso de quem foi registrado antes */
const porNome = (a, b) => (norm(a) < norm(b) ? -1 : norm(a) > norm(b) ? 1 : 0);

/* vivo no registro: sem nome ninguém existe, e `morto` é a única marca
   que tira alguém da mesa (desaparecido e exilado ainda podem voltar) */
const vivoNoRegistro = (n) => !!(n && n.nome) && norm(n.status || "vivo") !== "morto";

const vilaoVivo = (v) => !!(v && v.nome) && norm(v.status) !== "derrotada";

const consultasDe = (n) => {
  const x = Math.floor(Number(n && n.consultas));
  return Number.isFinite(x) && x > 0 ? x : 0;
};

const fichaPorNome = (npcs, nome) => {
  const k = norm(nome);
  if (!k) return null;
  return Object.values(npcs || {}).find((n) => n && norm(n.nome) === k) || null;
};

/* a índole da pessoa é a dela, ou a que a semente do mundo deriva do
   nome dela — o mesmo caminho que o `indoleDaPessoa` do App faz, para os
   dois lados chegarem sempre à mesma índole */
const propositoDe = (semente, pessoa) => {
  try {
    const i = (pessoa && pessoa.indole) || indoleDe(semente, pessoa || {});
    return (i && i.proposito) || "";
  } catch (e) { return ""; }
};

/* ---------------- A ANATOMIA DE TODA FORMA ----------------
   sóNasceSe — precondições no vocabulário real (índole, vínculo, vilão).
   sementes  — 2 a 3 formas do Livro, com peso, agendadas por ato.
   revelação — a condição de FATO que a dispara (nunca opinião).
   oDiaSeguinte — o que muda no mundo, porque reviravolta sem consequência
                  é truque de salão.
   A prateleira nasce com uma; as outras 47 formas do documento entram
   uma por versão, cada uma com o consumidor e a prova juntos. */
export const FORMAS = [
  {
    id: "aliado_agente",
    familia: "mascaras",
    porte: "menor",
    nome: "O aliado é agente do vilão",
    /* só nasce se houver um companheiro/NPC com o propósito de trair e um
       vínculo que valha a pena trair — e um vilão para quem entregar */
    soNasceSe: (c) => !!c.temVilao && !!c.temAliadoTraidor,
    /* O DETECTOR (v9.228) — portado do App, que o tinha à mão dos refs.
       Exige vilão de pé (sem para quem entregar não há traição, só
       deserção) e o PRIMEIRO do grupo cuja índole quer trair. A ordem do
       grupo é a da ficha, que é estável — é o desempate, e é o mesmo que
       o App fazia. */
    achaAlvo: (m) => {
      if (!vilaoVivo(m.vilao)) return null;
      const traidor = m.grupo.find((p) => propositoDe(m.semente, p) === "trair");
      return traidor ? traidor.nome : null;
    },
    /* três sementes leves: regada uma vez cada, cada uma amadurece; três
       maduras satisfazem a catraca de peso PESADO (a revelação grande) */
    sementes: [
      { forma: "elogio_que_vigia", peso: "leve" },
      { forma: "generosidade_estranha", peso: "leve" },
      { forma: "selo_refeito", peso: "leve" },
    ],
    /* o peso da COLHEITA: pesado, porque vira a confiança da campanha —
       e por isso exige três maduras para poder cair */
    pesoDaColheita: "pesado",
    revela: "o companheiro em quem você confiava serve ao vilão, e o que ele soube o vilão sabe",
    /* o dia seguinte: o traidor escolhe, e o vilão ganha o dossiê */
    oDiaSeguinte: (alvo, vilao) => [
      `o vilão passa a saber o que só passou por ${alvo || "o traidor"}`,
      `${alvo || "o traidor"} escolhe diante de todos: fugir, implorar ou dobrar a aposta`,
      `a relação com ${alvo || "ele"} vira inimigo — e o grupo viu`,
    ],
  },
  {
    id: "heranca_roubada",
    familia: "objetos",
    porte: "menor",
    nome: "A herança é roubada — o dono aparece",
    soNasceSe: (c) => !!c.temItemDeOrigemVaga,
    /* O DETECTOR (v9.228) — portado do App. Item de classe `semente` é,
       em itens-uteis.js, justamente o que carrega origem por decifrar:
       não é "um item qualquer da bolsa", é o que já nasceu com história
       pendurada. O alvo aqui é COISA, não gente — e é a única forma em
       que é assim. NÃO exige vilão: o dono verdadeiro veio por conta
       própria, e a `soNasceSe` concorda. */
    achaAlvo: (m) => {
      const item = m.inventario.find((x) => {
        try { return classeDoItem(x) === "semente"; } catch (e) { return false; }
      });
      if (!item) return null;
      return typeof item === "string" ? item : (String(item.nome || "").trim() || "a herança");
    },
    sementes: [
      { forma: "nome_na_lamina", peso: "leve" },
      { forma: "mao_que_treme", peso: "leve" },
    ],
    pesoDaColheita: "medio",
    revela: "o item que você herdou foi tirado de alguém — e esse alguém veio buscar",
    oDiaSeguinte: (alvo) => [
      "o dono verdadeiro do item se apresenta, com prova",
      "devolver, pagar ou provar posse — a escolha é do jogador, e cada uma cobra",
      "a índole do dono decide se é ameaça, súplica ou proposta",
    ],
  },
  {
    id: "trai_para_proteger",
    familia: "mascaras",
    porte: "menor",
    nome: "Trai para proteger alguém",
    soNasceSe: (c) => !!c.temCompanheiroComFamilia,
    /* O DETECTOR (v9.228) — o refém.

       O ALVO É QUEM TRAIU, e não o parente. Vale insistir porque a
       intuição erra: `oDiaSeguinte` diz "o vilão revela o refém que
       forçava a mão de {alvo}" e "o vínculo com {alvo} decide se ele
       fica ou parte", e o App registra o gesto "delatou" contra
       `rev.alvo`. Pôr o parente ali poria a delação na conta de quem
       estava amarrado numa cadeira.

       A máquina é `paresEntre(npcs, "familia")` — os laços de sangue
       ENTRE duas pessoas do elenco, que já vêm com os dois lados vivos.
       Serve o par em que UM dos lados anda no grupo: esse é o alvo, o
       outro é o refém.

       PAR COM OS DOIS NO GRUPO NÃO SERVE, e isso é regra, não descuido:
       se o sangue todo está na mesa, o vilão não tem o que segurar — e
       sem refém fora do grupo a forma não é esta. */
    achaAlvo: (m) => {
      const doGrupo = (nome) => {
        const k = norm(nome);
        const g = m.grupo.find((p) => norm(p.nome) === k);
        /* devolve o nome como a FICHA o escreve: é o companheiro que o
           jogador vê, e é essa grafia que o resto do App usa */
        return g ? g.nome : "";
      };
      const cand = [];
      for (const par of paresEntre(m.npcs, "familia")) {
        const a = doGrupo(par.a), b = doGrupo(par.b);
        if (a && !b) cand.push({ alvo: a, refem: par.b });
        else if (b && !a) cand.push({ alvo: b, refem: par.a });
      }
      if (!cand.length) return null;
      /* `paresEntre` varre o registro na ordem de inserção; o desempate
         pelo nome tira o acaso de quem foi registrado antes */
      cand.sort((x, y) => porNome(x.alvo, y.alvo) || porNome(x.refem, y.refem));
      return cand[0].alvo;
    },
    sementes: [
      { forma: "selo_refeito", peso: "leve" },
      { forma: "generosidade_estranha", peso: "leve" },
    ],
    pesoDaColheita: "medio",
    revela: "o companheiro te traiu — mas para salvar alguém que o vilão tem nas mãos",
    oDiaSeguinte: (alvo) => [
      "o vilão revela o refém que forçava a mão de " + (alvo || "ele"),
      "a tração vira missão de resgate — se o herói escolher perdoar",
      "o vínculo com " + (alvo || "ele") + " decide se ele fica ou parte",
    ],
  },
  {
    id: "informante_duplo",
    familia: "traicoes",
    porte: "menor",
    nome: "O informante sempre vendeu para os dois",
    /* o limiar vem da tabela, e não do número solto que morava aqui: o
       detector mede a MESMA coisa logo abaixo, e duas cópias de um três
       são duas oportunidades de discordar */
    soNasceSe: (c) => (c.vezesQueUsouInformante || 0) >= LIMIARES_DA_VIRADA.consultasDoInformante,
    /* O DETECTOR (v9.228) — a boca mais usada.

       O PORTÃO é a conta da campanha inteira (`vezesQueUsouInformante`
       soma todo mundo, vivos e mortos: o herói se apoiou naquela boca e
       o que ela soube dele não morre com ela). O ALVO, esse, tem de
       estar VIVO — `oDiaSeguinte` oferece "calar, virar ou usar o
       informante de volta", e nenhuma das três se faz com um defunto.
       Por isso o portão conta todos e a escolha só olha os de pé.

       NÃO exige vilão, porque a `soNasceSe` não exige: o informante
       vendia para os dois muito antes de a campanha saber de quem. */
    achaAlvo: (m) => {
      if (vezesQueUsouInformante(m.npcs) < LIMIARES_DA_VIRADA.consultasDoInformante) return null;
      const bocas = Object.values(m.npcs).filter((n) => vivoNoRegistro(n) && consultasDe(n) > 0);
      if (!bocas.length) return null;
      /* mais consultado primeiro; EMPATE PELO NOME, explícito, porque
         `Object.values` segue a ordem de inserção do registro e duas
         bocas com cinco consultas cada trocariam de lugar conforme quem
         foi registrado antes — o que faria a mesma campanha ter dois
         culpados dependendo da máquina */
      const ord = [...bocas].sort((a, b) => (consultasDe(b) - consultasDe(a)) || porNome(a.nome, b.nome));
      return ord[0].nome;
    },
    sementes: [
      { forma: "moeda_estrangeira", peso: "leve" },
      { forma: "elogio_que_vigia", peso: "leve" },
    ],
    pesoDaColheita: "medio",
    revela: "o informante em quem você confiava vendia cada palavra também ao vilão",
    oDiaSeguinte: (alvo, vilao) => [
      "tudo que passou por " + (alvo || "ele") + " está no dossiê de " + (vilao || "o vilão"),
      "o Livro lista o que foi vendido — o antagonista sabia mais do que parecia",
      "calar, virar ou usar o informante de volta: três saídas, três preços",
    ],
  },
  {
    id: "contratante_servia",
    familia: "patronos",
    porte: "maior",
    nome: "O contratante da primeira missão servia ao vilão",
    soNasceSe: (c) => !!c.temVilao && !!c.primeiraMissaoDeNpcVivo,
    /* O DETECTOR (v9.228) — quem assinou o primeiro serviço.

       A MISSÃO É A PRIMEIRA QUE ALGUÉM ENCOMENDOU, e não a primeira da
       lista: missão de sistema nasce sem `dador` (a nêmesis que te caça,
       o evento que engole a região), e uma coisa que ninguém encomendou
       não tem contratante para servir ao vilão.

       A ordem é por `criadaEm`, com desempate pelo `id` — a ordem do
       array é a de inserção, e duas missões criadas no mesmo dia
       trocariam de lugar conforme o save.

       VIVO É "NÃO REGISTRADO COMO MORTO". Quem encomendou pode nunca ter
       virado ficha — a maior parte de quem fala numa taverna não vira —,
       e exigir registro faria o detector recusar quase toda campanha.
       Recusar um morto conhecido é o que importa: é ele que não pode
       aparecer no dia seguinte para ser confrontado. */
    achaAlvo: (m) => {
      if (!vilaoVivo(m.vilao)) return null;
      const comDador = m.missoes.filter((q) => q.dador);
      if (!comDador.length) return null;
      const ord = [...comDador].sort((a, b) => (a.criadaEm - b.criadaEm) || porNome(a.id, b.id));
      const primeira = ord.find((q) => {
        const f = fichaPorNome(m.npcs, q.dador);
        return !f || vivoNoRegistro(f);
      });
      return primeira ? primeira.dador : null;
    },
    sementes: [
      { forma: "presente_cedo", peso: "leve" },
      { forma: "elogio_que_vigia", peso: "leve" },
      { forma: "margem_anotada", peso: "leve" },
    ],
    pesoDaColheita: "pesado",
    revela: "quem te deu a primeira missão servia ao vilão — tudo que ela rendeu foi mapeamento seu",
    oDiaSeguinte: (alvo, vilao) => [
      (vilao || "o vilão") + " ganha o dossiê retroativo de tudo que você fez desde o começo",
      "a primeira missão se relê inteira — cada favor foi um passo do plano dele",
      "confrontar " + (alvo || "o contratante") + " ou usar o que ele não sabe que você sabe",
    ],
  },
  {
    id: "cidade_dizimo",
    familia: "lugares",
    porte: "maior",
    nome: "A cidade acolhedora paga dízimo ao vilão",
    soNasceSe: (c) => !!c.temVilao && !!c.temCidadeProsperaSobAmeaca,
    /* O DETECTOR (v9.228) — a única forma cujo alvo é um LUGAR.

       PRÓSPERA é população acima do piso da tabela: quem não tem mercado
       permanente não tem dízimo para pagar.

       ACOLHEDORA é `relacao` neutra ou aliada, e DESCOBERTA. Território
       inimigo não acolhe ninguém, e cidade do jogador não compra paz do
       vilão pelas costas do próprio dono — isso seria outra reviravolta,
       e pior. Cidade que o herói nunca pisou também não serve: "a cidade
       que te acolheu" tem de ter acolhido.

       SOB AMEAÇA é o vilão de pé, e ele já é exigido: é dele que a
       cidade compra a paz. Não há um campo de ameaça por cidade neste
       mundo — o vilão não tem endereço —, e inventar um seria criar dado
       que ninguém alimenta.

       A CIDADE ATUAL TEM PREFERÊNCIA quando se qualifica: a traição do
       lugar dói onde o herói está dormindo. Fora isso, a mais próspera
       (é a que tem mais a perder), e o nome desempata. */
    achaAlvo: (m) => {
      if (!vilaoVivo(m.vilao)) return null;
      const acolhe = (c) => c.descoberta
        && (c.relacao === "neutra" || c.relacao === "aliada")
        && c.populacao >= LIMIARES_DA_VIRADA.populacaoDaCidadeProspera;
      const cand = m.cidades.filter(acolhe);
      if (!cand.length) return null;
      const aqui = cand.find((c) => norm(c.nome) === norm(m.cidadeAtual));
      if (aqui) return aqui.nome;
      const ord = [...cand].sort((a, b) => (b.populacao - a.populacao) || porNome(a.nome, b.nome));
      return ord[0].nome;
    },
    sementes: [
      { forma: "preco_estranho", peso: "leve" },
      { forma: "loja_fechada", peso: "leve" },
      { forma: "sino_fora_de_hora", peso: "leve" },
    ],
    pesoDaColheita: "pesado",
    revela: "a cidade que te acolheu compra a própria paz pagando dízimo ao vilão",
    oDiaSeguinte: (alvo, vilao) => [
      "a paz da cidade era comprada — e libertá-la custa essa paz",
      "os notáveis que sorriam sabiam; expor divide a cidade em dois",
      "cortar o dízimo aperta " + (vilao || "o vilão") + " e põe a cidade na mira dele",
    ],
  },
  {
    id: "mestre_treinou",
    familia: "passado",
    porte: "maior",
    nome: "O mestre de ofício treinou o vilão primeiro",
    soNasceSe: (c) => !!c.temVilao && !!c.antecedenteComOficio,
    /* O DETECTOR (v9.228) — o mestre tem de ter NOME.

       `oDiaSeguinte` escreve "o mestre {alvo} sabia, e calou" e "buscar o
       mestre por respostas, ou por contas: a índole dele decide o tom".
       As duas linhas pedem uma pessoa que o mundo conheça — com índole,
       com paradeiro, com quem se possa falar. Devolver o ofício ("a
       forja") no lugar do nome daria "o mestre a forja sabia, e calou", e
       devolver um nome inventado daria um mestre que não existe em lugar
       nenhum do registro.

       Então: o antecedente diz o OFÍCIO, `PAPEIS_DO_MESTRE` traduz o
       ofício nas palavras de quem o domina, e o alvo é um NPC vivo cujo
       papel usa uma delas. SEM NPC ASSIM, `null` — o detector honesto que
       diz "não dá" é melhor que a virada com um fantasma no meio. É a
       forma mais exigente das sete, e é o preço de ela ser a que mais
       precisa de uma pessoa de verdade. */
    achaAlvo: (m) => {
      if (!vilaoVivo(m.vilao)) return null;
      const oficio = oficioDoAntecedente(m.personagem.antecedente);
      if (!oficio) return null;
      /* as palavras do próprio ofício entram junto: um NPC cujo papel é
         "mestre da forja" casa sem a tabela precisar prever a frase */
      const chaves = new Set([...(PAPEIS_DO_MESTRE[oficio] || []), ...palavrasDoPapel(oficio)]);
      if (!chaves.size) return null;
      const mestres = Object.values(m.npcs).filter((n) => {
        if (!vivoNoRegistro(n)) return false;
        /* `palavrasDoPapel` já devolve sem acento e sem as vazias; papel
           sem palavra informativa não casa com nada, e é de propósito —
           é `mesmoPapel` que perdoaria isso, e perdoar aqui daria o
           mestre do herói ao primeiro figurante sem papel */
        return palavrasDoPapel(n.papel).some((w) => chaves.has(w));
      });
      if (!mestres.length) return null;
      const ord = [...mestres].sort((a, b) => porNome(a.nome, b.nome));
      return ord[0].nome;
    },
    sementes: [
      { forma: "promessa_pequena", peso: "leve" },
      { forma: "margem_anotada", peso: "leve" },
      { forma: "duas_cronicas", peso: "leve" },
    ],
    pesoDaColheita: "pesado",
    revela: "o mestre que te ensinou o ofício ensinou o vilão primeiro — ele conhece cada gesto seu",
    oDiaSeguinte: (alvo, vilao) => [
      (vilao || "o vilão") + " conhece cada gesto do herói ANTES dele — vencer exige desaprender",
      "o mestre " + (alvo || "") + " sabia, e calou — a confiança nele reprecifica tudo",
      "buscar o mestre por respostas, ou por contas: a índole dele decide o tom",
    ],
  },
];

export const formaPorId = (id) => FORMAS.find((f) => f.id === id) || null;
export const PORTES = ["menor", "maior"];

/* ---------------- O MUNDO QUE OS DETECTORES LEEM ----------------
   Um snapshot, e só. É o contrato entre o App (que tem os refs) e as
   formas (que têm a regra): o App tira a foto, isto normaliza, e nenhum
   detector precisa saber que existe um `useRef` no mundo.

   NASCE DO LIXO, como todo estado desta casa — e `= {}` no
   destructuring NÃO cobre `null` explícito, que é exatamente o que um
   ref não inicializado entrega. Por isso cada campo é conferido no
   corpo, e não na assinatura.

   NÃO MUTA NADA: as fichas de NPC entram por referência de propósito
   (`paresEntre` precisa achar `npcs[outro]` pela chave que estava lá),
   e ninguém escreve nelas. */
export function garantirMundo(m) {
  const o = m && typeof m === "object" ? m : {};

  /* a semente do mundo: é ela que deriva a índole de quem não tem uma.
     O mesmo padrão de `elegerReviravoltas` — sem semente, "aventura" —,
     para que os dois lados do mesmo arquivo nunca discordem do mundo. */
  const semente = String(o.semente == null ? "" : o.semente) || "aventura";

  const v = o.vilao && typeof o.vilao === "object" ? o.vilao : null;
  const vilao = v && String(v.nome || "").trim()
    ? { nome: String(v.nome).trim(), status: String(v.status || "espreita") }
    : null;

  /* o grupo aceita nome cru ou ficha inteira; a ficha inteira segue
     inteira porque a índole pode estar dentro dela */
  const grupo = (Array.isArray(o.grupo) ? o.grupo : [])
    .map((p) => (typeof p === "string" ? { nome: p } : (p && typeof p === "object" ? p : null)))
    .filter((p) => p && String(p.nome || "").trim())
    .map((p) => ({ ...p, nome: String(p.nome).trim() }));

  /* o inventário passa CRU: `classeDoItem` sabe ler string e objeto, e
     normalizar aqui seria uma segunda verdade sobre o que é um item */
  const inventario = (Array.isArray(o.inventario) ? o.inventario : []).filter(Boolean);

  const npcs = {};
  const reg = o.npcs && typeof o.npcs === "object" ? o.npcs : {};
  for (const [k, ficha] of Object.entries(reg)) {
    if (typeof k === "string" && k && ficha && typeof ficha === "object") npcs[k] = ficha;
  }

  const p = o.personagem && typeof o.personagem === "object" ? o.personagem : {};
  const personagem = { antecedente: String(p.antecedente || "") };

  const missoes = (Array.isArray(o.missoes) ? o.missoes : [])
    .filter((q) => q && typeof q === "object")
    .map((q) => ({
      id: String(q.id || ""),
      dador: String(q.dador || "").trim(),
      criadaEm: Math.max(0, Number(q.criadaEm) || 0),
    }));

  const cidades = (Array.isArray(o.cidades) ? o.cidades : [])
    .filter((c) => c && typeof c === "object" && String(c.nome || "").trim())
    .map((c) => ({
      nome: String(c.nome).trim(),
      populacao: Math.max(0, Number(c.populacao) || 0),
      /* "neutra" é o que `gerarGeografia` põe em toda cidade que nasce */
      relacao: norm(c.relacao) || "neutra",
      descoberta: !!c.descoberta,
    }));

  const cidadeAtual = String(o.cidadeAtual || "").trim();

  return { semente, vilao, grupo, inventario, npcs, personagem, missoes, cidades, cidadeAtual };
}

/* ---------------- A FACHADA ----------------
   O que o App chama, e a única porta: acha a forma, normaliza o mundo,
   pergunta ao detector dela. Um detector que estoura devolve `null` e
   não custa o turno — a regra vale para dentro do módulo também.

   Devolve SEMPRE string não-vazia ou `null`: alvo em branco viraria "o
   traidor" nas linhas do dia seguinte e uma semente sem dono no Livro,
   que é pior que virada nenhuma. */
export function alvoDaForma(forma, mundo) {
  const f = formaPorId(forma);
  if (!f || typeof f.achaAlvo !== "function") return null;
  try {
    const alvo = f.achaAlvo(garantirMundo(mundo));
    return typeof alvo === "string" && alvo.trim() ? alvo.trim() : null;
  } catch (e) { return null; }
}

/* ---------------- A ELEIÇÃO, NA CRIAÇÃO DO MUNDO ----------------
   Determinística: a mesma semente de mundo dá sempre a mesma verdade
   escondida. Uma menor e (quando houver formas maiores) uma maior, sem
   dividir o mesmo alvo. Hoje há uma forma só — então a eleição escolhe
   a menor e deixa a maior para quando a prateleira crescer.

   NÃO imprime nada em lugar visível: devolve só os ids eleitos, e a
   verdade fica aqui dentro até o turno da revelação. */
export function elegerReviravoltas(seedMundo) {
  const h = hashSemente("reviravolta|" + String(seedMundo || "aventura"));
  const menores = FORMAS.filter((f) => f.porte === "menor");
  const maiores = FORMAS.filter((f) => f.porte === "maior");
  /* `>>> 8` (sem sinal): com `>> 8` o deslocamento herda o bit de sinal e o
     índice podia sair negativo — e negativo % n é negativo, o que acessava
     fora do array. Só apareceu quando passou a haver mais de uma maior. */
  const menor = menores.length ? menores[(h >>> 0) % menores.length].id : null;
  const maior = maiores.length ? maiores[(h >>> 8) % maiores.length].id : null;
  /* nunca a mesma forma nos dois papéis */
  return { menor, maior: maior === menor ? null : maior };
}

/* ---------------- O ESTADO DE UMA REVIRAVOLTA ELEITA ----------------
   O que o save guarda: a forma, o alvo (o traidor eleito), e se já foi
   semeada e revelada. Nasce do nada e do lixo, como todo estado desta
   casa. */
export function garantirReviravolta(r) {
  if (!r || typeof r !== "object") return null;
  const f = formaPorId(r.forma);
  if (!f) return null;
  return {
    forma: r.forma,
    alvo: typeof r.alvo === "string" ? r.alvo : "",
    semeada: !!r.semeada,
    revelada: !!r.revelada,
    eleitaEm: Math.max(0, Number(r.eleitaEm) || 0),
    /* o último dia em que uma semente foi regada: espaça as regas por
       dias, para a máscara cair no ritmo do arco e não em quatro turnos */
    regadaEm: Math.max(0, Number(r.regadaEm) || 0),
    /* v9.229: o dia em que ela CAIU. É a partida da folga entre uma
       virada e a seguinte, e por isso não dava para derivar de nada:
       `revelada` diz que caiu, e não quando. Save antigo não tem o campo
       e cai em 0 — uma menor revelada num save de ontem satisfaz
       qualquer folga, que é exatamente o que se quer (ninguém deve ser
       punido por ter revelado antes de o campo existir). */
    reveladaEm: Math.max(0, Number(r.reveladaEm) || 0),
  };
}

/* ============================================================
   R3 (v9.229) — O RITMO DAS DUAS VIRADAS

   Até aqui havia uma virada por campanha na prática: `elegerReviravoltas`
   devolvia `{ menor, maior }` e o App lia só `.menor`. As três maiores
   eram acervo escrito e nunca vivido.

   Ligar a maior não é só "ler também o `.maior`": duas viradas no mesmo
   mundo precisam de uma regra de convivência, e ela tem de ser
   ESTRUTURAL — quem chama não pode ser obrigado a lembrar. Por isso a
   pergunta que o App faz deixa de ser "já posso revelar?" (uma por
   virada, duas respostas independentes, duas podendo ser `true` no mesmo
   turno) e passa a ser "DE QUEM É A VEZ?", que só tem uma resposta.
   ============================================================ */

/* Os números do ritmo. Um lugar só, porque a menor e a maior medem a
   MESMA grandeza — dias — e duas cópias de um número são duas chances de
   discordar amanhã. */
export const RITMO_DAS_VIRADAS = {
  /* dias entre uma rega e outra, por porte.

     MENOR: 3, e é o mesmo três que já estava aqui — regressão zero é
     literal. Ele também é o `DIAS_ENTRE_MARCOS` de `episodios.js`, o
     passo em que um episódio respira: a menor amadurece no compasso do
     episódio (três sementes leves, uma rega cada, nove dias — a vida de
     um episódio inteiro).

     MAIOR: 6, o dobro. A maior é a virada da CAMPANHA, e o dobro é o que
     a tira do compasso da cena e a põe no do arco. Mas o número não é
     "dobro porque soa maior": três sementes a seis dias são DEZOITO dias,
     e o episódio mais longo do catálogo (quatro marcos, três dias cada)
     vive DOZE. Isto é o que importa: nenhum episódio dura o
     amadurecimento inteiro da maior. A lei "não atropela episódio
     aberto" ADIA a maior, e um adiamento que durasse mais que a espera
     seria um cancelamento disfarçado — o defeito de R2 (acervo escrito
     que não pode acontecer) com outra roupa. */
  diasEntreRegas: { menor: 3, maior: 6 },

  /* dias de digestão entre uma virada e a seguinte. 3 = um marco de
     episódio: o mundo vive uma batida inteira do `oDiaSeguinte` da
     primeira antes de a segunda poder cair. Duas viradas coladas não são
     duas viradas — são uma cena confusa, e o jogador não consegue dizer
     qual revelação explicava qual sinal. */
  folgaEntreViradas: 3,

  /* quantos dias a maior espera a menor APARECER antes de nascer por
     conta própria. 9 = o amadurecimento inteiro da menor (três regas de
     três dias): se em todo esse tempo o mundo não deu um alvo vivo a
     ela, não vai dar.

     Sem esta linha, "a menor vem primeiro" viraria "a maior nunca
     acontece" em toda campanha cujo detector da menor não acha ninguém —
     o herói que anda sozinho e a máscara do aliado, por exemplo, ou a
     campanha sem item de origem vaga. Seria repetir, um andar acima,
     exatamente o bug que R3 veio corrigir. */
  diasDeEsperaPelaMenor: 9,
};

/* quantos dias entre uma rega e outra: a reviravolta amadurece devagar,
   como um vilão — sementes, alguns dias cada, uma revelação que parecia
   estar vindo desde sempre. Porque estava.

   Continua sendo o número DA MENOR, e continua com o mesmo valor; o que
   mudou é que ele LÊ a tabela em vez de repetir o 3 por conta própria. */
export const DIAS_ENTRE_REGAS = RITMO_DAS_VIRADAS.diasEntreRegas.menor;

/* o ritmo de uma forma, sem o chamador precisar saber o porte dela: a
   forma diz se é menor ou maior, a tabela diz o número. Forma
   desconhecida cai no ritmo da menor, que é o conservador — regar mais
   cedo não revela mais cedo, quem decide isso é a catraca do Livro. */
export function diasEntreRegasDe(forma) {
  const f = formaPorId(forma);
  const d = RITMO_DAS_VIRADAS.diasEntreRegas;
  return (f && d[f.porte]) || d.menor;
}

/* o mesmo alvo, pela PESSOA (ou pelo lugar) e não pela grafia.

   A contaminação no Livro é por igualdade exata — `podeColher` filtra
   `dona` + `alvo` com `===` —, mas a confusão na mesa é por quem: "José"
   e "Jose" são o mesmo homem para o jogador, e duas viradas sobre ele
   seriam duas viradas sobre a mesma pessoa mesmo que o Livro não
   misturasse nada. Recusamos pelo critério mais largo.

   Compara STRING, e só: `cidade_dizimo` devolve nome de cidade, não de
   gente, e nada aqui supõe uma pessoa do outro lado. Alvo vazio nunca é
   "o mesmo" que coisa nenhuma — senão duas viradas sem alvo pareceriam
   colidir. */
const mesmoAlvo = (a, b) => !!norm(a) && norm(a) === norm(b);

/* ---------------- AS SEMENTES QUE ELA PLANTA ----------------
   Traduz a forma nas sementes que o Livro semeia. O App passa cada uma a
   `semear`, com dona "reviravolta" e alvo = o traidor, para que a catraca
   as conte juntas. */
export function sementesDaReviravolta(forma, { alvo = "", ato = 0, dia = 0 } = {}) {
  const f = formaPorId(forma);
  if (!f) return [];
  return f.sementes.map((s) => ({
    forma: s.forma, dona: "reviravolta", peso: s.peso, alvo, ato, dia,
    material: null,   /* o material cai para o texto da forma do Livro — concreto, sem a conclusão */
  }));
}

/* ---------------- A CATRACA DA REVELAÇÃO ----------------
   Só pode revelar quando o Livro tem sementes maduras o bastante para o
   peso da colheita — a catraca ① do Livro, aplicada à reviravolta. É o
   que impede a máscara de cair antes de ter sido preparada. */
export function podeRevelar(forma, livro, { alvo = "" } = {}) {
  const f = formaPorId(forma);
  if (!f) return false;
  return podeColher(livro, { peso: f.pesoDaColheita, dona: "reviravolta", alvo });
}

/* ---------------- DE QUEM É A VEZ (R3) ----------------
   A arbitragem entre a menor e a maior, num turno. Devolve UM NOME —
   `"menor"`, `"maior"` ou `""` — e é isso que torna "as duas não estouram
   na mesma cena" estrutural: não há resposta em que as duas caibam, então
   não há como quem chama esquecer de escolher.

   POR QUE O LIVRO ENTRA AQUI, e não um par de booleanos `pronta`: se a
   maturidade viesse de fora, o App poderia perguntar "de quem é a vez?",
   ouvir "maior" e descobrir só depois que a maior não está madura — e a
   menor, que estava, teria perdido o turno em silêncio. Com o Livro
   dentro, a resposta já é final: quem sai daqui pode revelar agora.

   O `motivo` é BASTIDOR — vai para a suíte e para o diário de
   desenvolvimento, nunca para a tela. O sistema não fala de si mesmo.

   A ORDEM DAS TRANCAS é a ordem das leis, e cada uma tem seu porquê
   escrito onde está. */
export function quemPodeRevelar(o) {
  const a = o && typeof o === "object" ? o : {};
  const dia = Math.max(0, Number(a.dia) || 0);
  const livro = a.livro;
  /* `garantirReviravolta` engole `null`, `undefined` e forma que não
     existe mais — os refs do App entregam `null` explícito, e `= {}` no
     destructuring não cobre isso */
  const menor = garantirReviravolta(a.menor);
  const maior = garantirReviravolta(a.maior);

  /* ① A MENOR PRIMEIRO, e SEM NENHUMA CONDIÇÃO NOVA. É exatamente a
     catraca que ela já tinha: madura no Livro, cai. Episódio aberto não a
     segurava e não passa a segurar; folga não a segurava e não passa a
     segurar. Numa campanha que já roda, este ramo devolve no dia N
     precisamente o que a v9.228 devolvia. */
  if (menor && !menor.revelada && podeRevelar(menor.forma, livro, { alvo: menor.alvo })) {
    return { quem: "menor", motivo: "a menor está madura, e a menor vem primeiro" };
  }

  if (!maior) return { quem: "", motivo: "não há maior eleita" };
  if (maior.revelada) return { quem: "", motivo: "a maior já caiu" };

  /* ② a maior não cai por cima de uma menor EM CURSO. A maior é a virada
     da campanha, não um evento a mais: se a menor foi eleita e ainda não
     caiu, o arco ainda está pagando aquela dívida. */
  if (menor && !menor.revelada) {
    return { quem: "", motivo: "a menor está em curso — a maior não cai por cima dela" };
  }

  /* ③ nem sobre o ALVO da menor. Com os DOIS nascimentos guardados
     (`maiorPodeNascer` e `menorPodeNascer`), esta tranca virou fundo de
     gaveta — nenhuma ordem de nascimento produz mais um par colidido. Ela
     fica porque SAVE não nasce, é lido: um save escrito por um build em
     que só um dos lados tinha guarda traz o par colidido pronto, e aí as
     sementes das duas estão misturadas no Livro (o filtro de `podeColher`
     é `dona` + `alvo`, e a dona é "reviravolta" nas duas) — a maior
     colheria o que a menor plantou, a catraca paga com dinheiro alheio.
     Barrar aqui não muda a menor: ela já passou pelo ramo ①. */
  if (menor && mesmoAlvo(menor.alvo, maior.alvo)) {
    return { quem: "", motivo: "a maior divide o alvo com a menor — as sementes estão misturadas" };
  }

  /* ④ não atropela episódio aberto. Um episódio é uma promessa de forma
     já feita ao jogador; a virada da campanha caindo no meio dele
     transforma as duas coisas em ruído. A espera é finita por desenho —
     ver `diasEntreRegas.maior` na tabela. */
  if (a.episodioAberto) {
    return { quem: "", motivo: "há episódio aberto — a maior espera ele fechar" };
  }

  /* ⑤ a folga desde a virada anterior. Sem menor revelada, `reveladaEm`
     é 0 e a folga já está vencida em qualquer dia útil — a maior sozinha
     não tem de esperar ninguém. */
  const caiuEm = menor ? menor.reveladaEm : 0;
  if (dia - caiuEm < RITMO_DAS_VIRADAS.folgaEntreViradas) {
    return { quem: "", motivo: "a folga desde a virada anterior ainda não passou" };
  }

  /* ⑥ e só então a catraca do Livro: nada dispara sem semear. */
  if (!podeRevelar(maior.forma, livro, { alvo: maior.alvo })) {
    return { quem: "", motivo: "as sementes da maior ainda não amadureceram" };
  }

  return { quem: "maior", motivo: "a maior está madura, sem menor em curso e sem episódio aberto" };
}

/* ---------------- A MAIOR PODE NASCER? (R3) ----------------
   O guarda do nascimento. Duas coisas, e as duas são regra:

   · NUNCA O MESMO ALVO DA MENOR. `elegerReviravoltas` garante formas
     diferentes, e não alvos diferentes: `aliado_agente` (o traidor do
     grupo) e `contratante_servia` (quem encomendou a primeira missão)
     podem perfeitamente ser a mesma pessoa. Se fossem, as sementes das
     duas se somariam no Livro — mesma `dona`, mesmo `alvo` — e uma
     pagaria a catraca da outra. Duas máscaras no mesmo rosto também não é
     reviravolta: é o jogador achando que entendeu errado.

   · A MENOR TEM A PREFERÊNCIA, MAS NÃO PARA SEMPRE. Enquanto a menor não
     nasceu, o campo é dela até `diasDeEsperaPelaMenor`. Depois disso a
     maior nasce sozinha: há campanhas em que o detector da menor eleita
     nunca acha alvo (o herói que anda sem grupo, a bolsa sem item de
     origem vaga), e travar a maior nelas seria escrever de novo o bug que
     esta etapa veio desfazer.

   `alvoDaMaior` é o que `alvoDaForma` devolveu — string não-vazia ou
   `null`. Sem alvo não nasce nada, e isso é a primeira tranca: uma virada
   sem dono planta semente sem dono no Livro, que é pior que virada
   nenhuma. O alvo pode ser um LUGAR (`cidade_dizimo`), e nada aqui supõe
   gente. */
export function maiorPodeNascer(menorEleita, alvoDaMaior, opcoes) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const dia = Math.max(0, Number(o.dia) || 0);
  const alvo = String(alvoDaMaior == null ? "" : alvoDaMaior).trim();
  if (!alvo) return false;
  const menor = garantirReviravolta(menorEleita);
  if (!menor) return dia >= RITMO_DAS_VIRADAS.diasDeEsperaPelaMenor;
  return !mesmoAlvo(menor.alvo, alvo);
}

/* ---------------- A MENOR PODE NASCER? (a tranca simétrica) ----------------
   A irmã de `maiorPodeNascer`, e pela mesma lei: nunca o mesmo alvo. O
   guarda de um lado só deixava o caminho inverso aberto — a maior nasce
   no dia 9 sobre alguém, a menor acha a MESMA pessoa no dia 12, e as duas
   plantam sob `dona: "reviravolta"` + o mesmo `alvo`. Aí a menor colhe as
   três sementes que a maior plantou (a catraca "pesado" paga com dinheiro
   alheio) e a tranca ③ de `quemPodeRevelar` tranca a maior para sempre —
   acervo escrito que não pode mais acontecer, que é o bug de R2 outra vez.

   ---------------- QUEM CEDE, E POR QUÊ É A MENOR ----------------

   A intuição diz que devia ceder a MAIOR: ela nasceu no lugar que não era
   dela, e a menor é o degrau do arco, que não deveria esperar por
   ninguém. A intuição está certa sobre a culpa e errada sobre a física.

   CEDER É DEVOLVER O ALVO, E A MAIOR NÃO CONSEGUE DEVOLVER: no turno em
   que nasce ela já plantou, e as três sementes estão no Livro com aquele
   nome. Uma maior que "cedesse" sairia de cena deixando exatamente a
   herança que causou o problema — e a menor colheria assim mesmo. Tirá-la
   de lá seria cirurgia no Livro (murchar semente alheia, ou reescrever a
   dona de sementes já plantadas), que é mecanismo grande para consertar um
   caso de borda. A menor, que ainda não plantou nada, cede de graça.

   E O QUE ELA PERDE É MENOS DO QUE PARECE. A campanha não fica sem
   história sobre aquela pessoa — fica com a MAIOR, que é a maior das
   duas. O que a menor perde é o direito de ser a segunda máscara no mesmo
   rosto, e duas máscaras no mesmo rosto não é reviravolta: é o jogador
   achando que entendeu errado.

   E ELA NÃO FICA REFÉM. Não há prazo aqui — ao contrário da irmã, que
   espera `diasDeEsperaPelaMenor` — porque a menor não está esperando nada:
   o detector dela roda de novo no turno seguinte, e o alvo dele é do
   mundo, não do contrato. A boca mais consultada muda, o grupo muda, o
   par de sangue muda. Ela nasce no dia em que o mundo lhe der outra
   pessoa. A assimetria é de propósito, e está na assinatura: a irmã tem
   `dia`, esta não.

   VALE COM A MAIOR JÁ REVELADA, e isso não é rigor de sobra: ao revelar,
   o App paga só as sementes MADURAS: as imaturas ficam no Livro com aquele
   alvo, e o passo de rega da menor (`dona` + `alvo` + imatura) regaria as
   sobras da maior como se fossem dela. O alvo da maior é dela antes e
   depois de a máscara cair.

   REGRESSÃO ZERO: sem maior eleita — o caso comum, e o único que existia
   até v9.228 — devolve `true` sempre, e a menor nasce sem perguntar nada a
   ninguém, como sempre nasceu. Alvo vazio devolve `false`, que é
   exatamente o que o App já fazia por conta própria. */
export function menorPodeNascer(maiorEleita, alvoDaMenor) {
  const alvo = String(alvoDaMenor == null ? "" : alvoDaMenor).trim();
  if (!alvo) return false;
  const maior = garantirReviravolta(maiorEleita);
  if (!maior) return true;
  return !mesmoAlvo(maior.alvo, alvo);
}

/* ---------------- O DIA SEGUINTE ----------------
   As consequências concretas, para o Narrador encenar e o sistema
   aplicar. Reviravolta sem dia seguinte é truque de salão. */
export function oDiaSeguinte(forma, { alvo = "", vilao = "" } = {}) {
  const f = formaPorId(forma);
  if (!f) return [];
  try { return f.oDiaSeguinte(alvo, vilao); } catch { return []; }
}

export function revelacaoDe(forma) { const f = formaPorId(forma); return f ? f.revela : ""; }
