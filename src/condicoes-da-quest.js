/* ============================================================
   AS CONDIÇÕES DA QUEST — o vocabulário fechado (08/11/2026, Fase BQ · BQ3)

   A planta da biblioteca de quests (mente/plano-biblioteca-de-quests.md,
   §1, §3 e §6) contou 17 fechos de etapa que falharam e achou-lhes quatro
   causas. O livro de factos (BQ1, livro-de-factos.js) matou três: o nome
   como chave, o facto que dura um turno e a presença tomada como prova.
   Este módulo mata a quarta:

     (d) A CONDIÇÃO QUE O MUNDO NÃO PRODUZ. O marco de entrega que ninguém
         podia cumprir (retirado da espinha), o `ir_a` para um lugar que a
         etapa não sabia conferir (v9.117): uma etapa pedia um facto que
         nenhuma peça do jogo escrevia, e ficava presa para sempre, à vista
         de quem jogava.

   Aqui CADA PREDICADO DIZ DE ONDE LÊ e QUEM ESCREVE O QUE ELE LÊ (as
   `portas`: o módulo e a função do jogo). A suíte importa cada porta e
   confere que é uma função exportada — e a teste-ligacao já garante que
   toda função exportada tem leitor. Um predicado sem quem o escreva não
   pode ser ativo: fica `reservado`, com o motivo, e `validarCondicao`
   recusa-o. É o caso de `entregou` e `prometeu`, cujos factos o livro
   guarda com `porta: null` (TIPOS_DE_FACTO): ninguém no jogo os escreve
   ainda, e uma quest que os pedisse nunca fecharia.

   O ESTADO DA PRÓPRIA QUEST (BQ4, biblioteca-de-quests.js). `escolheu` e
   `etapa` nasceram reservados à espera de quem guardasse a escolha e a
   etapa feita; a BQ4 guarda-as no registo da quest (`escolherNaQuest`,
   `avancarQuest`) e passa-as aqui em `contexto.quest` — { feitas,
   escolhas, rotulos }. Leem só isso: nunca o livro, nunca a prosa. Os
   `rotulos` são as frases de mundo que a ficha dá à escolha e à etapa
   («pagar a portagem a Brás»), porque o vocabulário não as sabe.

   OS ARGUMENTOS SÃO PAPÉIS, NUNCA NOMES. A condição diz `papel:mentor`,
   `lugar:covil`, `item:carta`; quem é o mentor sai da criação do mundo, e
   o papel passa a id UMA VEZ (`resolverPapeis`), pelo MESMO elenco com que
   o livro escreve (elencoDoLivro, motor/livro-do-turno.js) — o id que a
   condição lê é o id que o livro escreveu, e nenhuma leitura compara
   nomes. Quem ainda não tem id (a pessoa que o registo ainda não conhece)
   procura-se no livro pelo nome guardado (pessoaDoLivro, a porta da BQ2),
   e enquanto nada a acha a condição não fecha: aparece no «o que falta».

   JULGA O RESULTADO, NÃO O MÉTODO (a planta, §2). `conversou(papel:x)` fecha
   seja qual for o caminho que pôs a conversa no livro: o Cronista, a ficha
   do ator, o registo da cena. A solução que ninguém previu fecha sozinha,
   porque produziu o facto.

   «O QUE FALTA», EM DADOS (§6). `julgarEtapa` devolve { feita, falta }, e
   cada entrada de `falta` é dado — o predicado, os papéis com o id e o
   nome, quanto tem e quanto precisa — com a frase de mundo ao lado
   (`texto`, dos modelos desta tabela), que a tela e a pauta leem. A frase
   nunca diz o nome de um mecanismo nem o de um papel: quem não tem nome é
   «alguém», «um lugar», «uma coisa».

   PURO E DETERMINÍSTICO. Nenhuma sorte, nenhum relógio: tudo sai do
   estado (a forma do save, estado.js) que entra por argumento, que nunca
   é mutado. O `null` e o lixo não fecham nada e nunca lançam.
   ============================================================ */
import {
  idDaPessoa, idDoLugar, pessoaDoLivro, grauDeAfeicao,
  conheceu, conversou, derrotou, poupou, afeicaoAlcancada, esteve, descobriu, deveFavor,
} from "./livro-de-factos.js";
import { elencoDoLivro } from "./motor/livro-do-turno.js";
import { situacaoDe, SITUACOES, lugarConcluido } from "./mundo-base.js";
import { RELACOES_NPC, estadoSemVolta } from "./npcs.js";
import { MARCOS_VINCULO } from "./vinculos.js";
import { contrair } from "./lugar.js";

/* ---------------- OS PAPÉIS ----------------
   O prefixo do argumento diz o tipo do papel: `papel:mentor` é uma pessoa,
   `lugar:covil` um lugar, `item:carta` uma coisa. `semNome`: o que a frase
   diz quando o papel ainda não tem nome (nunca o nome do papel, que é
   bastidor). `artigos`: o que sai da frente do nome de uma coisa, para
   «a carta» achar a «carta selada» na bolsa. O nome do papel é minúsculo,
   sem acento: `[a-z0-9_]`, até 40. */
export const PAPEIS_DA_CONDICAO = Object.freeze({
  papel: Object.freeze({ tipo: "pessoa", semNome: "alguém" }),
  lugar: Object.freeze({ tipo: "lugar", semNome: "um lugar" }),
  item: Object.freeze({ tipo: "item", semNome: "uma coisa", artigos: Object.freeze(["o", "a", "os", "as", "um", "uma", "uns", "umas"]) }),
});
const RX_ARGUMENTO = /^(papel|lugar|item):([a-z0-9_]{1,40})$/;
/* o argumento de texto (a escolha, a opção, a etapa): um id da ficha */
const RX_TEXTO = /^[a-z0-9_]{1,40}$/;
const TIPO_DO_PREFIXO = Object.freeze(Object.fromEntries(Object.entries(PAPEIS_DA_CONDICAO).map(([k, v]) => [k, v.tipo])));

/* ---------------- DE ONDE SE LÊ ----------------
   As fontes, e o campo do estado (estado.js) de cada uma. */
export const FONTES_DA_CONDICAO = Object.freeze({
  livro: "estado.factos — o livro de factos (livro-de-factos.js)",
  ficha: "estado.npcs, estado.personagem.grupo, estado.lugar e estado.cidadeAtual — o registo e a cena",
  base: "estado.baseMundo — os mortos, as situações e as masmorras concluídas (mundo-base.js)",
  dia: "estado.dia — o dia do mundo",
  inventario: "estado.personagem: inventario, equipamento e equipados",
  quest: "contexto.quest — o registo da quest aberta (biblioteca-de-quests.js): as etapas feitas e as escolhas",
});

/* ---------------- OS LIMITES ----------------
   `profundidade`: quantos combinadores dentro uns dos outros (a mais funda
   das três quests da planta usa dois). `filhos`: quantos ramos um
   combinador leva (o passo do Salvo-Conduto, o maior, leva três).
   `contagem`: a frase do progresso quando o predicado conta (conversou,
   consultou, afeição, dia) e precisa de mais de um. */
export const LIMITES_DA_CONDICAO = Object.freeze({
  profundidade: 6,
  filhos: 8,
  contagem: " ({tem} de {precisa})",
});

/* ---------------- OS COMBINADORES ----------------
   `todos`: todos os ramos; `algum`: pelo menos um; `nenhum`: nenhum
   (o veto: «sem sair de», «sem que morra»); `pelo_menos`: N dos ramos, o
   número vem primeiro (`["pelo_menos", 2, a, b, c]`: as três pistas, das
   quais duas chegam). `junta`: como as frases dos ramos se ligam no «o
   que falta». `minimo`: quantos ramos o combinador exige. */
export const COMBINADORES = Object.freeze({
  todos: Object.freeze({ junta: " e ", minimo: 1 }),
  algum: Object.freeze({ junta: " ou ", minimo: 1 }),
  nenhum: Object.freeze({ junta: " e ", minimo: 1, evitar: "evitar: {0}" }),
  pelo_menos: Object.freeze({ junta: " · ", minimo: 1, frase: "{n} de: {0}" }),
});

/* ---------------- O VOCABULÁRIO ----------------
   Cada predicado:
     args   — por ordem: { tipo: "pessoa" | "lugar" | "item" } (um papel),
              { tipo: "numero", omissao, min, max } ou { tipo: "opcao", de };
     le     — as fontes (FONTES_DA_CONDICAO);
     facto  — o tipo de facto do livro que lê (TIPOS_DE_FACTO), quando lê o livro;
     portas — quem escreve no jogo o que ele lê: [modulo, funcao, o quê];
     volta  — false quando o facto, uma vez verdade, não deixa de o ser
              (conhecer, falar, morrer): um `nenhum` sobre ele, já verdade,
              não se cumpre mais (`impossivel` no «o que falta»);
     texto  — a frase de mundo, com {0}, {1} para os argumentos;
     rotulo — onde a frase de mundo vem do registo da quest (contexto.quest
              .rotulos), quando o vocabulário não a sabe: a chave, com os
              argumentos em {0}, {1};
     nao    — a frase do veto (dentro de `nenhum`);
     reservado — o motivo, quando ninguém escreve ainda o facto: o
              predicado existe para a planta, e nenhuma quest o pode usar.
   A afeição vai de 1 a MARCOS_VINCULO.length (a régua do livro, §3). */
const P = (modulo, funcao, oque) => Object.freeze({ modulo, funcao, oque });
const A = Object.freeze({
  pessoa: Object.freeze({ tipo: "pessoa" }),
  lugar: Object.freeze({ tipo: "lugar" }),
  item: Object.freeze({ tipo: "item" }),
  vezes: Object.freeze({ tipo: "numero", omissao: 1, min: 1, max: 20 }),
});
const PORTA_DO_CRONISTA = P("src/motor/cronista-do-turno.js", "oAceitoDoCronista", "o efeito «factos» do Cronista: falou_com, os segredos, os nomeados");
const PORTA_DA_CENA = P("src/motor/livro-do-turno.js", "oQueACenaDaAoLivro", "o fim da resposta: quem está à vista, o lugar, a afeição do grupo");
const PORTA_DA_LUTA = P("src/motor/luta-do-turno.js", "caidosParaOLivro", "o fim da luta: os caídos, com rendido, desacordado e fugiu");
const A_TEXTO = Object.freeze({ tipo: "texto" });
export const CONDICOES = Object.freeze({
  conheceu: Object.freeze({
    args: [A.pessoa], le: ["livro"], facto: "visto", volta: false,
    portas: [PORTA_DA_CENA, PORTA_DO_CRONISTA, PORTA_DA_LUTA],
    texto: "encontrar {0} frente a frente", nao: "nunca se cruzar com {0}" }),
  conversou: Object.freeze({
    args: [A.pessoa, A.vezes], le: ["livro"], facto: "falou", volta: false,
    portas: [PORTA_DO_CRONISTA],
    texto: "falar com {0}", nao: "nunca falar com {0}" }),
  afeicao: Object.freeze({
    args: [A.pessoa, Object.freeze({ tipo: "numero", omissao: 1, min: 1, max: MARCOS_VINCULO.length })],
    le: ["livro", "ficha"], facto: "afeicao", volta: true,
    portas: [PORTA_DA_CENA, P("src/npcs.js", "firmarLaco", "o laço com quem não anda no grupo")],
    texto: "ganhar a confiança de {0}", nao: "perder a confiança de {0}" }),
  derrotou: Object.freeze({
    args: [A.pessoa], le: ["livro"], facto: "derrotado", volta: false,
    portas: [PORTA_DA_LUTA],
    texto: "vencer {0}", nao: "não lutar com {0}" }),
  poupou: Object.freeze({
    args: [A.pessoa], le: ["livro"], facto: "derrotado", volta: true,
    portas: [PORTA_DA_LUTA],
    texto: "vencer {0} e deixar com vida", nao: "não poupar {0}" }),
  morto: Object.freeze({
    args: [A.pessoa], le: ["livro", "base", "ficha"], facto: "derrotado", volta: false,
    portas: [P("src/mundo-base.js", "matar", "o nome riscado no registo do mundo"), PORTA_DA_LUTA],
    texto: "a morte de {0}", nao: "manter {0} com vida" }),
  situacao: Object.freeze({
    args: [A.pessoa, Object.freeze({ tipo: "opcao", de: Object.freeze(Object.values(SITUACOES)) })],
    le: ["base"], volta: true,
    portas: [P("src/mundo-base.js", "porSituacao", "a situação de quem importa: livre, cativa, ferida, escondida")],
    texto: "ver {0} {1}", nao: "impedir que {0} fique {1}" }),
  relacao: Object.freeze({
    args: [A.pessoa, Object.freeze({ tipo: "opcao", de: Object.freeze(Object.keys(RELACOES_NPC)) })],
    le: ["ficha"], volta: true,
    portas: [P("src/npcs.js", "mesclarNPC", "a relação na ficha do registo")],
    texto: "ter {0} como {1}", nao: "não ter {0} como {1}" }),
  consultou: Object.freeze({
    args: [A.pessoa, A.vezes], le: ["ficha"], volta: false,
    portas: [P("src/npcs.js", "registrarConsulta", "a informação arrancada a alguém")],
    texto: "arrancar o que {0} sabe", nao: "nunca perguntar a {0}" }),
  acompanha: Object.freeze({
    args: [A.pessoa], le: ["ficha"], volta: true,
    portas: [P("src/companheiro-inicial.js", "juntarCompanheiroInicial", "quem entra no grupo")],
    texto: "ter {0} ao seu lado", nao: "seguir sem {0}" }),
  esteve: Object.freeze({
    args: [A.lugar], le: ["livro"], facto: "esteve", volta: false,
    portas: [PORTA_DA_CENA],
    texto: "ir a {0}", nao: "nunca pôr os pés em {0}" }),
  esta_em: Object.freeze({
    args: [A.lugar], le: ["ficha"], volta: true,
    portas: [P("src/motor/meio-do-turno.js", "registrarOLugar", "onde o herói está agora")],
    texto: "estar em {0}", nao: "sair de {0}" }),
  descobriu: Object.freeze({
    args: [A.lugar], le: ["livro"], facto: "descobriu", volta: false,
    portas: [PORTA_DO_CRONISTA],
    texto: "descobrir o que {0} esconde", nao: "deixar {0} guardar o segredo" }),
  /* 09/11 (as consequências caladas): o favor que uma quest deixou a dever
     (o efeito «favor», escrito no livro pelo motor das quests) — uma quest
     seguinte pode pedi-lo («ter a dever {0}») ou vetá-lo */
  deve_favor: Object.freeze({
    args: [A.lugar], le: ["livro"], facto: "favor", volta: false,
    portas: [P("src/motor/quests-do-turno.js", "oTurnoDasQuests", "as consequências das quests: o efeito «favor» escreve-o no livro de factos")],
    texto: "ter {0} a dever-te um favor", nao: "nunca ficar com {0} a dever-te nada" }),
  concluiu: Object.freeze({
    args: [A.lugar], le: ["base"], volta: false,
    portas: [P("src/mundo-base.js", "concluirLugar", "a masmorra que chegou ao fundo")],
    texto: "chegar ao fundo de {0}", nao: "não descer até ao fundo de {0}" }),
  tem: Object.freeze({
    args: [A.item], le: ["inventario"], volta: true,
    portas: [P("src/motor/aplicar.js", "aplicar", "o que a resposta põe na bolsa"), PORTA_DO_CRONISTA],
    texto: "ter {0}", nao: "livrar-se de {0}" }),
  dia: Object.freeze({
    args: [Object.freeze({ tipo: "numero", omissao: 1, min: 1, max: 100000 })], le: ["dia"], volta: false,
    portas: [P("src/motor/tempo-do-turno.js", "osMinutosAndam", "o relógio do mundo, que vira o dia")],
    texto: "esperar até ao dia {0}", nao: "acabar antes do dia {0}" }),
  /* ---- o estado da própria quest (BQ4): ativos desde que o registo existe ---- */
  escolheu: Object.freeze({
    args: [A_TEXTO, A_TEXTO], le: ["quest"], volta: false,
    portas: [P("src/biblioteca-de-quests.js", "escolherNaQuest", "a decisão do herói, com o veredito antes do clique, guardada no registo da quest")],
    texto: "tomar uma decisão", nao: "não decidir", rotulo: "{0}:{1}" }),
  etapa: Object.freeze({
    args: [A_TEXTO], le: ["quest"], volta: false,
    portas: [P("src/biblioteca-de-quests.js", "avancarQuest", "a etapa que fecha, guardada no registo da quest com o dia e o ramo")],
    texto: "dar o passo anterior", nao: "antes do passo anterior", rotulo: "etapa:{0}" }),

  /* ---- reservados: a planta pede-os, e o jogo ainda não escreve o facto ---- */
  entregou: Object.freeze({
    args: [A.item, A.pessoa], le: ["livro"], facto: "recebeu", volta: false, portas: [],
    texto: "entregar {0} a {1}", nao: "não entregar {0} a {1}",
    reservado: "o livro guarda `recebeu` (TIPOS_DE_FACTO), mas nenhuma peça do jogo o escreve: porta null" }),
  prometeu: Object.freeze({
    args: [A.pessoa], le: ["livro"], facto: "prometeu", volta: false, portas: [],
    texto: "dar a palavra a {0}", nao: "não prometer nada a {0}",
    reservado: "o livro guarda `prometeu` (TIPOS_DE_FACTO), mas nenhuma peça do jogo o escreve: porta null" }),
  relogio: Object.freeze({
    args: [Object.freeze({ tipo: "texto" }), A.vezes], le: [], volta: false, portas: [],
    texto: "o tempo a correr", nao: "o tempo parado",
    reservado: "o relógio cheio SAI da lista (relogios.js, avancar), e o que saiu não diz se encheu ou se foi vencido: o predicado mentiria até se guardar o fim do relógio" }),
});

/* ---------------- utilidades ---------------- */
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const semAc = (s) => String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const palavras = (s) => semAc(s).replace(/[^a-z0-9]+/g, " ").trim();
const semArtigo = (s) => {
  const ps = String(s).split(" ").filter(Boolean);
  while (ps.length > 1 && PAPEIS_DA_CONDICAO.item.artigos.includes(ps[0])) ps.shift();
  return ps.join(" ");
};
const inteiro = (v) => (typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : null);
const preencher = (modelo, valores) => contrair(String(modelo).replace(/\{(\w+)\}/g, (m, k) => (valores[k] != null ? String(valores[k]) : m)));
const RX_ID_PESSOA = /^(npc\|.+|[^|]+\|gente\|.+)$/;

/* ---------------- DO PAPEL AO ID ----------------
   resolverPapeis(papeis, estado, { mundo }) → { papeis, pendentes }
   `papeis`: o que a criação do mundo preencheu, por nome do papel —
     { mentor: { tipo: "pessoa", nome }, covil: { tipo: "lugar", nome,
       cidade, chave? }, carta: { tipo: "item", nome } }.
   Cada um sai com { tipo, nome, id } — o id que o livro escreve para ele:
     · pessoa: o id que já traz; senão `idDaPessoa` com o elenco do livro
       (o mesmo de `anotarTurno`); senão o livro pelo nome guardado
       (`pessoaDoLivro`, na cidade do herói);
     · lugar: a `chave` da base que a criação já sabe; senão `idDoLugar`
       com a CIDADE DO LUGAR e a ponte da base — a mesma régua com que o
       livro escreve `esteve` e `descobriu`. Sem chave nem cidade, fica
       pendente: o livro põe a cidade no id de todo sítio, e adivinhá-la
       pela cidade onde o herói está agora fixaria, de uma vez, o id errado
       (a cidade é um lugar como os outros: `{ tipo: "lugar", cidade }`);
     · item: as palavras do nome (o inventário não tem ids).
   Idempotente: um id que já veio fica, e chamar de novo não o muda — o
   papel passa a id UMA VEZ, e quem guarda o resultado guarda o id.
   `pendentes`: os papéis que ainda não têm id (ou que vieram tortos). */
export function resolverPapeis(papeis, estado, opcoes) {
  const E = obj(estado) || {};
  const o = obj(opcoes) || {};
  const entrada = obj(papeis) || {};
  const out = {}, pendentes = [];
  let elenco = null;
  const doElenco = () => {
    if (!elenco) {
      try { elenco = elencoDoLivro(E, { mundo: obj(o.mundo) || obj(E.mundo) }); } catch { elenco = {}; }
    }
    return elenco;
  };
  for (const nome of Object.keys(entrada)) {
    const p = obj(entrada[nome]);
    const tipo = p && Object.values(TIPO_DO_PREFIXO).includes(p.tipo) ? p.tipo : null;
    if (!tipo) { pendentes.push(nome); continue; }
    const rotulo = typeof p.nome === "string" ? p.nome.trim() : "";
    let id = typeof p.id === "string" ? p.id : "";
    let mostra = rotulo;
    if (tipo === "pessoa") {
      if (!RX_ID_PESSOA.test(id)) id = "";
      if (!id && rotulo) {
        const r = idDaPessoa(rotulo, doElenco());
        if (r.id) { id = r.id; mostra = rotulo || r.nome; }
      }
      if (!id && rotulo) id = pessoaDoLivro(E.factos, rotulo, { cidade: typeof E.cidadeAtual === "string" ? E.cidadeAtual : "" });
    } else if (tipo === "lugar") {
      if (!id.includes("|")) id = "";
      const cidade = typeof p.cidade === "string" ? p.cidade.trim() : "";
      if (!id && (typeof p.chave === "string" || cidade)) {
        id = idDoLugar({ nome: rotulo, cidade, chave: p.chave }, { cidade, chaveDoLugar: doElenco().chaveDoLugar });
      }
      if (!mostra) mostra = cidade;
    } else {
      id = id || semArtigo(palavras(rotulo));
    }
    if (!mostra && id) mostra = id.split("|").pop();
    out[nome] = { tipo, nome: mostra, id };
    if (!id) pendentes.push(nome);
  }
  return { papeis: out, pendentes };
}

/* ---------------- VALIDAR ----------------
   validarCondicao(cond, papeis) → { ok, erros }
   A forma: um predicado é [nome, ...args]; um combinador é [nome, ...ramos]
   (`pelo_menos` com o número antes dos ramos). Recusa o predicado que não
   existe, o RESERVADO, o argumento que não é do tipo, o papel que a quest
   não declara (ou que é de outro tipo), o número fora da régua, e a árvore
   funda ou larga demais (LIMITES_DA_CONDICAO). `papeis`: os declarados,
   { nome: { tipo } } — sem eles, só a forma se confere. */
export function validarCondicao(cond, papeis) {
  const erros = [];
  const decl = obj(papeis);
  const ver = (c, onde, prof) => {
    if (!Array.isArray(c) || typeof c[0] !== "string") { erros.push(`${onde}: não é uma condição`); return; }
    const nome = c[0];
    if (prof > LIMITES_DA_CONDICAO.profundidade) { erros.push(`${onde}: funda demais`); return; }
    const comb = COMBINADORES[nome];
    if (comb) {
      let ramos = c.slice(1);
      if (nome === "pelo_menos") {
        const n = c[1];
        ramos = c.slice(2);
        if (!Number.isInteger(n) || n < 1 || n > ramos.length) erros.push(`${onde}: pelo_menos precisa de um número entre 1 e o número de ramos`);
      }
      if (ramos.length < comb.minimo) erros.push(`${onde}: ${nome} sem ramos`);
      if (ramos.length > LIMITES_DA_CONDICAO.filhos) erros.push(`${onde}: ${nome} com ramos demais`);
      ramos.forEach((r, i) => ver(r, `${onde}.${nome}[${i}]`, prof + 1));
      return;
    }
    const def = CONDICOES[nome];
    if (!def) { erros.push(`${onde}: o predicado «${nome}» não existe`); return; }
    if (def.reservado) { erros.push(`${onde}: o predicado «${nome}» está reservado — ${def.reservado}`); return; }
    const args = c.slice(1);
    if (args.length > def.args.length) erros.push(`${onde}: ${nome} com argumentos a mais`);
    def.args.forEach((a, i) => {
      const v = args[i];
      if (a.tipo === "numero") {
        if (v === undefined) return;
        if (!Number.isInteger(v) || v < a.min || v > a.max) erros.push(`${onde}: ${nome}, o argumento ${i} devia ser um inteiro de ${a.min} a ${a.max}`);
      } else if (a.tipo === "opcao") {
        if (!a.de.includes(v)) erros.push(`${onde}: ${nome}, o argumento ${i} devia ser um de ${a.de.join(", ")}`);
      } else if (a.tipo === "texto") {
        if (typeof v !== "string" || !RX_TEXTO.test(v)) erros.push(`${onde}: ${nome}, o argumento ${i} devia ser um id da ficha ([a-z0-9_])`);
      } else {
        const m = typeof v === "string" ? v.match(RX_ARGUMENTO) : null;
        if (!m || TIPO_DO_PREFIXO[m[1]] !== a.tipo) { erros.push(`${onde}: ${nome}, o argumento ${i} devia ser um papel do tipo ${a.tipo}`); return; }
        if (decl) {
          const d = obj(decl[m[2]]);
          if (!d) erros.push(`${onde}: ${nome}, o papel «${m[2]}» não está declarado`);
          else if (d.tipo !== a.tipo) erros.push(`${onde}: ${nome}, o papel «${m[2]}» é ${d.tipo}, e o argumento pede ${a.tipo}`);
        }
      }
    });
  };
  ver(cond, "condição", 0);
  return { ok: erros.length === 0, erros };
}

/* ---------------- AS LEITURAS ----------------
   Uma por predicado ativo, sobre o contexto já montado: { E, factos, base,
   npcs, grupo, el (o elenco) }. Recebem os argumentos já resolvidos (o
   papel como { id, nome }, o número já com a omissão). Devolvem { v } e,
   nos que contam, { tem, precisa }. Só factos, só ids — o nome só entra
   onde a fonte é a base do mundo, que guarda por nome. */
const entradaDoLivro = (c, id) => obj((obj(obj(c.factos) && c.factos.pessoas) || {})[id]);
function fichaDe(c, alvo) {
  const npcs = c.npcs;
  const chave = alvo.id.startsWith("npc|") ? alvo.id.slice(4) : alvo.id.split("|").pop();
  if (obj(npcs[chave])) return npcs[chave];
  const k = Object.keys(npcs).find((x) => obj(npcs[x]) && typeof npcs[x].nome === "string" && npcs[x].nome === chave);
  return k ? npcs[k] : null;
}
const nomeDaBase = (alvo) => alvo.id.split("|").pop() || alvo.nome;
function estaMorto(c, alvo) {
  const d = obj((entradaDoLivro(c, alvo.id) || {}).derrotado);
  if (d && d.como === "morto") return true;
  if (situacaoDe(c.base, nomeDaBase(alvo)) === SITUACOES.morta) return true;
  const f = fichaDe(c, alvo);
  return !!(f && estadoSemVolta(f.status));
}
/* os ids de onde o herói está: a mesma régua com que o livro escreve
   `esteve` (anotarTurno) — o sítio, o prédio de que é cómodo, e a cidade
   fora da estrada */
function idsDeAqui(c) {
  const E = c.E;
  const ctx = { cidade: c.el.cidade, chaveDoLugar: c.el.chaveDoLugar };
  const l = typeof E.lugar === "string" ? { nome: E.lugar } : obj(E.lugar);
  const ids = [];
  if (l) {
    ids.push(idDoLugar(l, ctx));
    if (typeof l.dentroDe === "string" && l.dentroDe.trim()) ids.push(idDoLugar({ nome: l.dentroDe, cidade: l.cidade }, ctx));
  }
  const cid = (l && typeof l.cidade === "string" && l.cidade.trim()) || c.el.cidade;
  if (cid && !E.jornada) ids.push(idDoLugar({ cidade: cid }));
  return ids.filter(Boolean);
}
function nosPertences(c) {
  const p = obj(c.E.personagem) || {};
  const equipados = obj(p.equipados) ? Object.values(p.equipados) : [];
  return [...arr(p.inventario), ...arr(p.equipamento), ...equipados]
    .map((i) => palavras(typeof i === "string" ? i : obj(i) && i.nome))
    .filter(Boolean);
}
const LEITURAS = {
  conheceu: (c, [p]) => ({ v: conheceu(c.factos, p.id) }),
  conversou: (c, [p, n]) => {
    const m = obj((entradaDoLivro(c, p.id) || {}).falou);
    return { v: conversou(c.factos, p.id, n), tem: m ? Math.max(1, inteiro(m.vezes) || 1) : 0, precisa: n };
  },
  afeicao: (c, [p, g]) => {
    const membro = c.grupo.find((x) => obj(x) && typeof x.nome === "string" && idDaPessoa(x.nome, c.el).id === p.id);
    const f = fichaDe(c, p);
    const vivo = Math.max(membro ? grauDeAfeicao({ vinculo: membro.vinculo }) : 0, f ? grauDeAfeicao({ laco: f.laco }) : 0);
    const tem = Math.max(afeicaoAlcancada(c.factos, p.id), vivo);
    return { v: tem >= g, tem, precisa: g };
  },
  derrotou: (c, [p]) => ({ v: derrotou(c.factos, p.id) }),
  poupou: (c, [p]) => ({ v: poupou(c.factos, p.id) }),
  morto: (c, [p]) => ({ v: estaMorto(c, p) }),
  situacao: (c, [p, s]) => ({ v: (estaMorto(c, p) ? SITUACOES.morta : situacaoDe(c.base, nomeDaBase(p))) === s }),
  relacao: (c, [p, lado]) => {
    const f = fichaDe(c, p);
    return { v: !!f && semAc(f.relacao) === lado };
  },
  consultou: (c, [p, n]) => {
    const f = fichaDe(c, p);
    const tem = f ? Math.max(0, inteiro(Number(f.consultas)) || 0) : 0;
    return { v: tem >= n, tem, precisa: n };
  },
  acompanha: (c, [p]) => ({ v: c.grupo.some((x) => obj(x) && !x.invocada && typeof x.nome === "string" && idDaPessoa(x.nome, c.el).id === p.id) }),
  esteve: (c, [l]) => ({ v: esteve(c.factos, l.id) }),
  esta_em: (c, [l]) => ({ v: idsDeAqui(c).includes(l.id) }),
  descobriu: (c, [l]) => ({ v: descobriu(c.factos, l.id) }),
  deve_favor: (c, [l]) => ({ v: deveFavor(c.factos, l.id) }),
  concluiu: (c, [l]) => ({ v: lugarConcluido(c.base, nomeDaBase(l)) }),
  /* a coisa pelo nome inteiro, palavra a palavra, dentro do nome do que se
     leva («a carta» está em «carta selada de Brás»; «Espada» não está em
     «Espadachim») */
  tem: (c, [i]) => ({ v: !!i.id && nosPertences(c).some((n) => ` ${n} `.includes(` ${i.id} `)) }),
  /* o registo da quest, e só ele (BQ4) */
  escolheu: (c, [k, op]) => ({ v: !!c.quest && !!obj(c.quest.escolhas) && c.quest.escolhas[k] === op }),
  etapa: (c, [id]) => ({ v: !!c.quest && !!obj(c.quest.feitas) && !!c.quest.feitas[id] }),
  dia: (c, [n]) => {
    const tem = Math.max(0, inteiro(c.E.dia) || 0);
    return { v: tem >= n, tem, precisa: n };
  },
};

/* ---------------- O JULGAMENTO ----------------
   Uma passada só dá o valor e o «o que falta» — nunca discordam: feita
   quando, e só quando, a falta está vazia. */
function montar(contexto) {
  const k = obj(contexto) || {};
  const E = obj(k.estado) || {};
  const r = resolverPapeis(k.papeis, E, { mundo: k.mundo });
  let el = {};
  try { el = elencoDoLivro(E, { mundo: obj(k.mundo) || obj(E.mundo) }) || {}; } catch { el = {}; }
  return {
    E, el, papeis: r.papeis,
    factos: obj(E.factos) || {},
    base: obj(E.baseMundo) || {},
    npcs: obj(E.npcs) || {},
    grupo: arr((obj(E.personagem) || {}).grupo),
    quest: obj(k.quest),
  };
}
function argumentos(c, def, args) {
  const out = [], mostrar = [], dados = [];
  let semId = false, torto = false;
  def.args.forEach((a, i) => {
    const v = args[i];
    if (a.tipo === "numero") {
      /* só o argumento AUSENTE toma a omissão; o torto não fecha nada */
      const n = v === undefined ? a.omissao : v;
      if (!Number.isInteger(n) || n < a.min || n > a.max) torto = true;
      out.push(n); mostrar.push(n); dados.push(n);
      return;
    }
    if (a.tipo === "opcao" || a.tipo === "texto") {
      if (a.tipo === "opcao" ? !a.de.includes(v) : typeof v !== "string") torto = true;
      out.push(v); mostrar.push(RELACOES_NPC[v] ? RELACOES_NPC[v].rotulo.toLowerCase() : v); dados.push(v);
      return;
    }
    const m = typeof v === "string" ? v.match(RX_ARGUMENTO) : null;
    const papel = m && TIPO_DO_PREFIXO[m[1]] === a.tipo ? c.papeis[m[2]] : null;
    const ok = papel && papel.tipo === a.tipo ? papel : null;
    if (!ok || !ok.id) semId = true;
    out.push(ok || { id: "", nome: "" });
    mostrar.push((ok && ok.nome) || PAPEIS_DA_CONDICAO[m ? m[1] : Object.keys(TIPO_DO_PREFIXO).find((x) => TIPO_DO_PREFIXO[x] === a.tipo)].semNome);
    dados.push({ papel: m ? m[2] : null, tipo: a.tipo, id: (ok && ok.id) || "", nome: (ok && ok.nome) || "" });
  });
  return { out, mostrar, dados, semId, torto };
}
function atomo(c, cond) {
  const nome = cond[0];
  const def = CONDICOES[nome];
  if (!def) return { v: false, item: { predicado: nome, desconhecido: true, texto: "" }, descr: "" };
  const { out, mostrar, dados, semId, torto } = argumentos(c, def, cond.slice(1));
  const valores = Object.fromEntries(mostrar.map((x, i) => [i, x]));
  /* a frase que o registo da quest dá à escolha e à etapa, quando a tem */
  const chave = def.rotulo ? String(def.rotulo).replace(/\{(\d+)\}/g, (m, k) => String(cond[1 + Number(k)])) : null;
  const rot = chave && c.quest && obj(c.quest.rotulos) && typeof c.quest.rotulos[chave] === "string" ? c.quest.rotulos[chave] : null;
  const descr = rot || preencher(def.texto, valores);
  const nao = rot ? preencher(COMBINADORES.nenhum.evitar, { 0: rot }) : preencher(def.nao, valores);
  const base = { predicado: nome, args: dados };
  if (def.reservado) return { v: false, item: { ...base, reservado: true, texto: descr }, descr, nao, volta: def.volta };
  if (torto) return { v: false, item: { ...base, invalida: true, texto: "" }, descr: "", nao: "", volta: def.volta };
  if (semId) return { v: false, item: { ...base, semId: true, texto: descr }, descr, nao, volta: def.volta };
  let r = { v: false };
  try { r = LEITURAS[nome](c, out) || { v: false }; } catch { r = { v: false }; }
  const conta = r.precisa != null ? { tem: r.tem, precisa: r.precisa } : {};
  const texto = descr + (r.precisa > 1 ? preencher(LIMITES_DA_CONDICAO.contagem, conta) : "");
  return { v: !!r.v, item: { ...base, ...conta, texto }, descr, nao, volta: def.volta, ...conta };
}
const ehComb = (cond) => Array.isArray(cond) && !!COMBINADORES[cond[0]];
function julgar(c, cond, prof) {
  if (!Array.isArray(cond) || typeof cond[0] !== "string" || prof > LIMITES_DA_CONDICAO.profundidade) {
    return { v: false, falta: [{ predicado: null, invalida: true, texto: "" }], descr: "", semVolta: false };
  }
  if (!ehComb(cond)) {
    const a = atomo(c, cond);
    return { v: a.v, falta: a.v ? [] : [a.item], descr: a.descr, nao: a.nao, semVolta: a.v && a.volta === false, item: a.item };
  }
  const nome = cond[0];
  const comb = COMBINADORES[nome];
  const n = nome === "pelo_menos" ? (Number.isInteger(cond[1]) ? cond[1] : Infinity) : null;
  const ramos = (nome === "pelo_menos" ? cond.slice(2) : cond.slice(1)).slice(0, LIMITES_DA_CONDICAO.filhos);
  const js = ramos.map((r) => julgar(c, r, prof + 1));
  const frase = (j) => (j.falta.length ? j.falta.map((x) => x.texto).filter(Boolean).join(COMBINADORES.todos.junta) : j.descr);
  const descr = js.map((j) => j.descr).filter(Boolean).join(comb.junta);
  if (!js.length) return { v: false, falta: [{ predicado: nome, invalida: true, texto: "" }], descr: "", semVolta: false };
  if (nome === "todos") {
    const v = js.every((j) => j.v);
    return { v, falta: v ? [] : js.flatMap((j) => j.falta), descr, semVolta: v && js.every((j) => j.semVolta) };
  }
  if (nome === "algum") {
    const v = js.some((j) => j.v);
    const opcoes = js.map((j) => j.falta);
    return { v, falta: v ? [] : [{ predicado: "algum", opcoes, texto: js.map(frase).filter(Boolean).join(comb.junta) }], descr, semVolta: js.some((j) => j.semVolta) };
  }
  if (nome === "nenhum") {
    const verdade = js.filter((j) => j.v);
    if (!verdade.length) return { v: true, falta: [], descr: preencher(comb.evitar, { 0: descr }), semVolta: false };
    const evitar = verdade.map((j) => (j.item
      ? { ...j.item, nega: true, impossivel: j.semVolta, texto: j.nao }
      : { predicado: null, nega: true, impossivel: j.semVolta, texto: preencher(comb.evitar, { 0: j.descr }) }));
    return { v: false, falta: [{ predicado: "nenhum", evitar, impossivel: evitar.some((x) => x.impossivel), texto: evitar.map((x) => x.texto).join(comb.junta) }], descr: preencher(comb.evitar, { 0: descr }), semVolta: false };
  }
  /* pelo_menos */
  const tem = js.filter((j) => j.v).length;
  const precisa = Number.isFinite(n) && n >= 1 ? n : ramos.length + 1;
  const v = tem >= precisa;
  const faltam = js.filter((j) => !j.v);
  return {
    v,
    falta: v ? [] : [{ predicado: "pelo_menos", tem, precisa, opcoes: faltam.map((j) => j.falta), texto: preencher(comb.frase, { n: precisa - tem, 0: faltam.map(frase).filter(Boolean).join(comb.junta) }) }],
    descr: preencher(comb.frase, { n: precisa, 0: descr }),
    semVolta: js.filter((j) => j.semVolta).length >= precisa,
  };
}

/* avaliarCondicao(cond, { estado, papeis, mundo, quest }) → true | false
   `estado`: a forma do save (estado.js). `papeis`: os da criação, já
   resolvidos ou não (resolvem-se aqui, pela mesma régua). `mundo`: a
   semente e o molde, para a ponte do lugar (o de elencoDoLivro); sem ele,
   o `estado.mundo`. `quest`: o registo da quest — { feitas, escolhas,
   rotulos } —, o único que `escolheu` e `etapa` leem. É o que a
   reviravolta, a falha e o desfecho da quest (BQ4) perguntam. */
export function avaliarCondicao(cond, contexto) {
  try { return julgar(montar(contexto), cond, 0).v; } catch { return false; }
}

/* julgarEtapa(etapa, { estado, papeis, mundo }) → { feita, falta }
   `etapa`: { id, conclui: <condição> }. `falta`: o «o que falta» em dados,
   vazio quando, e só quando, a etapa está feita. Cada entrada:
     · um predicado — { predicado, args: [{ papel, tipo, id, nome } | número
       | opção], tem?, precisa?, texto }, e `semId` quando um papel ainda
       não tem quem o ocupe, `reservado` quando o predicado não é ativo,
       `desconhecido` quando não existe;
     · `algum` — { predicado: "algum", opcoes: [falta, …], texto };
     · `pelo_menos` — { predicado, tem, precisa, opcoes, texto };
     · `nenhum` — { predicado, evitar: [entrada com `nega`], impossivel,
       texto }: `impossivel` quando o que se queria evitar já aconteceu e
       não volta atrás (o protegido morto) — é o sinal da falha.
   O `todos` não aparece: a falta dele são as faltas dos ramos, juntas. */
export function julgarEtapa(etapa, contexto) {
  const e = obj(etapa);
  if (!e || !Array.isArray(e.conclui)) return { feita: false, falta: [{ predicado: null, invalida: true, texto: "" }] };
  try {
    const j = julgar(montar(contexto), e.conclui, 0);
    return { feita: j.v && j.falta.length === 0, falta: j.v ? [] : j.falta };
  } catch {
    return { feita: false, falta: [{ predicado: null, invalida: true, texto: "" }] };
  }
}
