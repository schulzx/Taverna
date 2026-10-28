/* ============================================================
   O CRONISTA DO TURNO, NO MOTOR (T1-A, 9.ª fatia, 28/10/2026) — src/motor/cronista-do-turno.js

   Depois de o Narrador responder, o `cronistaDoTurno` do App lia a
   narração com uma segunda chamada (o Cronista) e escrevia no estado o que
   ela registou: as promessas, o lugar, o cartaz, o relógio, o fim do evento
   global, a gente, a conversa e o segredo que fecham etapas, a fé, a
   coesão da luta, o cânone, quem entrou no grupo e o teste que a concessão
   grande exige. O JUÍZO já era do motor (`julgarOCronista`, cronista.js,
   T1-B): o Cronista propõe, o motor decide. Faltava o resto, e vem para
   cá, na MESMA ORDEM e com os porquês de cada linha:

     oGatilhoDoCronista(ler, { narrativa, doTurno, pers }, leitura)
       → o `decidirOCronista` com os nomes que o sistema já conhece
     oPedidoAoCronista(ler, { narrativa, fila })
       → { sys, user, erro }     (o pedido inteiro; `erro` vai ao `calou`)
     oAceitoDoCronista(aceito, recusado, proposta, ctx)
       → { p, msgs, tocouCanone, tocouElenco }

   No App ficam a chamada de rede, a fila da leitura, o juízo (que lê o
   retrato do jogo e a porta do convite), a nota para a sessão gravada e o
   fecho (o prompt remontado, a tela, o save).

   A FORMA É A DO FECHO (fecho-da-resposta.js): o que é do App chega por
   PORTAS (`ctx`) — os órgãos com o nome de sempre —, e o que é do bloco
   sai como EFEITO, na ordem em que nasceu. Antes de cada porta os efeitos
   pendentes são aplicados (`ctx.aplicar`), porque as portas leem e
   escrevem nos mesmos refs e na mesma nota, e a ordem é o contrato. E
   cada secção lê o estado DE AGORA (`ctx.ler()`), à hora em que o App o
   lia: o lugar que a primeira secção registou é o lugar que a do cartaz vê.

   Os efeitos: `nota` (linhas ao Narrador), `calou` (o erro que a secção
   engoliu, com o nome de sempre), `prometido`, `relogios`, `eventos`,
   `quests` (a lista redesenhada), `ficha` (o painel da ficha), `npcs`,
   `canone` e `rolagem` (o teste que se abre).

   As portas (ctx): ler, aplicar, registrarLugar, historiaDoMural,
   contextoDoNome, nucleoAgora, pregarNoMural, marcarNoArco, ganharFe,
   sincronizarNemesis, conferirCom (as missões conferidas com a conversa
   ou o segredo do turno), mundoDaBase, fichaDeCompanheiro,
   notaDoRecrutamento; e os valores do turno: pers, narrativa,
   testeDoTurno, rolagem.

   Provado byte a byte contra o App de antes (760fe1b, o bloco inteiro
   recortado à letra) em `teste-motor-cronista-do-turno.mjs`.
   ============================================================ */
import { decidirOCronista } from "../gatilho-do-cronista.js";
import { SECAO_DO_CRONISTA, abertasParaOCronista, pagarSementes, guardarSementes } from "../prometido.js";
import { garantirMissoes } from "../missoes.js";
import { formatarCanone } from "../prompt.js";
import { muralLiberado } from "../abertura.js";
import { cartazDaProposta, envelopeDoRecado } from "../ofertas.js";
import { nomeComDono, fichaDoCronista, mesclarNPC, criarNPC, notaDoHomonimo } from "../npcs.js";
import { favorJaPedido } from "../subtramas.js";
import { aceitarProposta, tipoDe, barraDe, envelopeNovo } from "../relogios.js";
import { segredosReveladosNoTurno } from "../saga.js";
import { peneirarCanone } from "../segredo-guardado.js";
import { frasesDoGrupoCheio } from "./meio-do-turno.js";
import { MAX_COMPANHEIROS, ATRIBUTOS } from "../constantes.js";
import { pesarCompanheiro } from "../dificuldade.js";
import { formatarPoder } from "../poder.js";
import { atributoEfetivo } from "../regras-jogo.js";
import { dificuldadePorPerfil } from "../bestiario.js";

/* ---------------- O GATILHO (ONDA 1 DO CUSTO, 13/10) ----------------
   O gatilho decide se o Cronista lê AGORA. O que não lê fica na fila e vai
   junto na próxima leitura (no máximo três turnos depois) — o gatilho
   escolhe a hora, nunca se a narração é lida. Os nomes que o sistema já
   conhece (o elenco, o cânone, o herói, o grupo, quem está de pé na luta,
   as cidades do mapa, a cidade e o lugar) não acendem o "nome novo".
   Estoura como estourava: o App lê, que é o comportamento de antes. */
export function oGatilhoDoCronista(ler, turno, leitura) {
  const E = ler || {};
  const { narrativa, doTurno, pers } = turno || {};
  const dt = doTurno && typeof doTurno === "object" ? doTurno : {};
  const pc = pers || E.personagem || {};
  const deEmLuta = ((E.combate && E.combate.inimigos) || []).filter((e) => e && !e.derrotado && e.vida > 0);
  const conhecidos = [
    ...Object.keys(E.npcs || {}), ...Object.keys(E.canone || {}),
    pc.nome, ...((pc.grupo || []).map((g) => g && g.nome)), ...deEmLuta.map((e) => e.nome),
    ...(((E.mapa || {}).cidades || []).map((c) => c && c.nome)),
    E.cidadeAtual, (E.lugar || {}).nome,
  ].filter((x) => typeof x === "string" && x);
  return decidirOCronista({ narrativa, frase: dt.frase, envelopes: dt.envelopes, conhecidos, emLuta: deEmLuta.length > 0, fe: !!(E.divindade && E.divindade.despertar) }, leitura);
}

/* ---------------- O PEDIDO ----------------
   O que o Cronista é (as secções, cada uma com o seu "na dúvida, não") e o
   que ele lê: as missões já abertas (sem isso reoferece o mesmo serviço com
   outro nome, que foi exatamente o bug do gado), o evento global, quem
   está de pé na luta, o cânone, as promessas abertas, o elenco, a fila das
   narrações ainda não lidas e a narrativa do turno. */
export const PEDIDO_DO_CRONISTA = [
  "Você é o CRONISTA de um RPG. Você NÃO narra: lê a narrativa do turno e julga, por seções, o que o SISTEMA deve registrar. Responda APENAS em JSON:",
  "{\"lugar\":null,\"missoes\":{\"global_encerrado\":false},\"canone\":{\"Nome\":{\"tipo\":\"artefato|pessoa|lugar|promessa|segredo|organizacao\",\"descricao\":\"o que é, 1 frase factual\",\"detalhes\":\"aparência/origem/dono\",\"local\":\"\"}},\"pessoas\":[{\"nome\":\"\",\"papel\":\"\",\"relacao\":\"aliado|amigo|romance|familia|neutro|rival|inimigo\",\"genero\":\"ele|ela\",\"local\":\"\",\"notas\":\"máx. 8 palavras\"}],\"fe\":{\"fieis\":0,\"pf\":0,\"motivo\":\"\",\"acontecimento\":null},\"grupo\":{\"entraram\":[]},\"teste_sugerido\":null,\"combate\":{\"mortes_narradas\":[]},\"promessas\":[],\"promessas_pagas\":[]}",
  "SEÇÃO missoes: \"global_encerrado\": true SÓ se o EVENTO GLOBAL (se listado) foi RESOLVIDO de fato — a ameaça central derrotada/desfeita, não um avanço.",
  "SEÇÃO canone: fatos DURÁVEIS — artefatos e objetos relevantes que o herói ganhou/achou/descobriu (com o que o objeto É de fato; saque comum não entra), lugares importantes, promessas, segredos. NÃO reescreva nem contradiga o CÂNONE ATUAL — só crie novo ou acrescente campo novo.",
  "SEÇÃO pessoas: pessoas COM NOME e papel durável (aliados recorrentes, rivais, contatos) que ainda não estão no ELENCO — figurantes de cena única ficam de fora. \"genero\": \"ele\" ou \"ela\", pelo que a narrativa diz da pessoa (o pronome, o artigo, senhor/senhora); se a cena não deixa saber, \"\" — nunca chute.",
  "SEÇÃO falou_com (lista de nomes): as pessoas com quem o herói FALOU frente a frente NESTE turno — estavam na cena com ele e trocaram palavras com ele. Quem só foi citado, lembrado, procurado ou descrito de longe NÃO entra. Na dúvida, lista vazia.",
  "SEÇÃO fe: SÓ se o turno mostrou o nome do herói ganhando DEVOÇÃO real. Para gestos comuns, fieis 10 a 500, pf 1 a 10; na dúvida, 0. Para GRANDES acontecimentos de fé, NÃO chute números: preencha \"acontecimento\":{\"tipo\":\"alianca_reino|libertacao|milagre_publico|santuario|conversao_lider|vitoria_lendaria|pregacao\",\"local\":\"nome da cidade/reino\"} e deixe fieis/pf em 0 — o SISTEMA calcula pela população do local. Um povo/reino inteiro prometendo sua fé ao herói É \"alianca_reino\" (ou \"libertacao\", se o herói o libertou) — NUNCA deixe isso passar sem registrar.",
  "O CAMPO \"local\" É O MAIS IMPORTANTE DA SEÇÃO fe: a devoção mora em cidades reais do mapa, não no ar. Use SEMPRE o nome exato da cidade onde o feito foi testemunhado (vale também no campo \"local\" solto, junto de fieis/pf). Sem local reconhecível, a fé vira \"andarilhos\" — conta muito menos e míngua rápido.",
  "SEÇÃO grupo: \"entraram\" = nomes de pessoas que ACEITARAM de fato acompanhar o herói como companheiros de jornada NESTE turno (o Mestre narrando \"vou com você\" conta). Se o convite foi recusado ou só um encontro casual, [].",
  "SEÇÃO teste_sugerido: se o Mestre CONCEDEU de graça algo grande que deveria ter exigido convencimento — uma criatura anciã entregando seu poder, um rei cedendo o trono, um inimigo virando aliado do nada — preencha {\"atributo\":\"Presença|Intelecto|Força|Destreza|Vigor\",\"perfil\":\"dificil|formidavel\",\"motivo\":\"o que precisava ser provado\"}. Concessões pequenas e naturais da história NÃO entram. Na maioria dos turnos: null.",
  "SEÇÃO combate (só se houver COMBATENTES listados): \"mortes_narradas\" = inimigos que a NARRATIVA declarou mortos/destruídos/desfeitos NESTE turno. Liste só nomes da lista de combatentes; se ninguém morreu na narração, [].",
  "SEÇÃO missao_oferecida (v9.119 — isto vira CARTAZ NO MURAL, não missão no diário): se alguém em cena deixou claro que quer um serviço feito — um nobre desesperado, um capitão precisando de escolta, um aldeão com um problema —, descreva o trabalho em {\"titulo\":\"nome curto do trabalho\",\"tipo\":\"contrato|favor\",\"dador\":\"de quem é o serviço\",\"descricao\":\"uma frase\",\"paga\":15,\"prazo\":0,\"etapas\":[{\"tipo\":\"ir_a|derrotar|achar|falar_com|levar_a\",\"alvo\":\"nome exato de cidade, criatura, pessoa ou objeto\",\"item\":\"só para levar_a\",\"quantos\":1}]}. De 1 a 3 etapas, todas CONCRETAS e verificáveis — \"ganhar a confiança\" não é etapa. O sistema prega o papel no mural e o herói decide lá: não registre aceite nem recusa. Só quando alguém de fato quis um serviço NESTE turno; caso contrário, null.",
  "CAMPO \"paga\": o número EXATO de moedas que a cena prometeu (o cartaz que diz \"paga-se 15 moedas\" é 15). Se o combinado NÃO é dinheiro — um favor em troca de informação, uma dívida, uma porta que se abre —, \"paga\": 0. Se ninguém falou de pagamento, \"paga\": null e o sistema arbitra. NUNCA invente um valor.",
  "SEÇÃO lugar (v9.39): onde o herói está AO FIM deste turno. Se ele está num ponto NOMEADO fora da cidade, \"lugar\": \"a fazenda de Jessa\" (nome curto, como se diz em voz alta: uma fazenda, um moinho, uma gruta, o acampamento da tocaia) — e REPITA esse nome em todo turno em que ele continuar lá. Se ele está dentro da cidade, a palavra exata \"cidade\". Se você não souber dizer, null. Isto é o que impede o sistema de achar que ele voltou para a cidade sem ter voltado.",
  "CAMPO \"prazo\": só quando a CENA impôs pressa em número de noites (\"até a próxima lua\", \"antes que ela morra\", \"tenho três dias\") — use 4, 6 ou 8, o mais próximo do que foi dito. Sem pressa dita, \"prazo\": 0. Não invente urgência: prazo em toda missão não pressiona em nenhuma.",
  "UM TRABALHO É UMA MISSÃO SÓ: se a proposta desta cena é o mesmo serviço de uma missão que já está na lista (o cartaz no mural e a pessoa que vem falar dele são a mesma coisa), missao_oferecida é null. E a etapa \"falar_com\" nunca aponta para quem está oferecendo — o herói já está diante dele.",
  "SEÇÃO relogio_novo (v9.18): se ALGO LONGO COMEÇOU DE FATO em cena — um ritual que passou a ser conduzido, uma perseguição que se iniciou, uma obra que o jogador pôs em marcha — proponha {\"nome\":\"frase curta no presente\",\"tipo\":\"ameaca|cacada|oportunidade|obra\",\"segmentos\":4|6|8,\"gatilho\":\"noite|turno_mundo|falha|sucesso|viagem\",\"consequencia\":\"o que acontece quando encher\"}. NO MÁXIMO UM por turno, e só quando de fato começou — intenção, ameaça verbal e possibilidade NÃO contam. Na esmagadora maioria dos turnos: null.",
  SECAO_DO_CRONISTA,
  "REGRA GERAL: na dúvida, NÃO marque — {\"missoes\":{\"global_encerrado\":false},\"canone\":{},\"pessoas\":[],\"fe\":{\"fieis\":0,\"pf\":0}} é resposta válida e frequente.",
].join("\n");

export function oPedidoAoCronista(ler, turno) {
  const E = ler || {};
  const { narrativa, fila } = turno || {};
  let erro = null;
  const sys = PEDIDO_DO_CRONISTA;
  const evG = E.eventos && E.eventos.global;
  const combatentes = (E.combate && E.combate.inimigos || []).filter((e) => !e.derrotado && e.vida > 0);
  const jaNoDiario = garantirMissoes(E.missoes)
    .filter((q) => ["ativa", "oferecida"].includes(q.status))
    .map((q) => `- "${q.titulo}"${q.dador ? ` (de ${q.dador})` : ""} — ${q.descricao || "—"}`).join("\n");
  const user = `MISSÕES DO SISTEMA JÁ ABERTAS (não proponha nenhuma que seja o mesmo serviço que uma destas):\n${jaNoDiario || "(nenhuma)"}\n\nEVENTO GLOBAL ATIVO:\n${evG ? `- "${evG.nome}" — ${(evG.etapas || [])[evG.etapa] || evG.descricao || "—"}` : "(nenhum)"}\n\nCOMBATENTES AINDA DE PÉ (nome — PV):\n${combatentes.map((e) => `- ${e.nome} — ${e.vida} PV`).join("\n") || "(sem combate aberto)"}\n\nCÂNONE ATUAL:\n${formatarCanone(E.canone) || "(vazio)"}\n\n${(() => { try { const ab = abertasParaOCronista(E.prometido); return ab ? ab + "\n\n" : ""; } catch (e) { erro = { onde: "as abertas ao Cronista", erro: e }; return ""; } })()}ELENCO (pessoas já registradas):\n${Object.keys(E.npcs).join(", ") || "(ninguém)"}\n\n${fila}NARRATIVA DO TURNO:\n${narrativa}`;
  return { sys, user, erro };
}

/* os efeitos pendentes de uma peça: aplicados antes de cada porta, e no fim
   (a mesma mecânica do fecho da resposta) */
function pendentes(ctx) {
  const pend = [];
  const descarregar = () => { if (pend.length) ctx.aplicar(pend.splice(0)); };
  return {
    fazer: (ef) => { pend.push(ef); },
    descarregar,
    porta: (nome, ...args) => { descarregar(); return ctx[nome](...args); },
    /* o estado de agora: o que os efeitos e as portas já escreveram */
    ler: () => { descarregar(); return ctx.ler() || {}; },
  };
}

/* ---------------- O ACEITO, APLICADO ----------------
   Toda secção lê `aceito` (o que o juízo assinou), nunca a proposta crua —
   salvo o lugar recusado, que a régua do lugar ainda tem de ver para
   escrever a nota de correção. Cada secção é isolada: uma que estoura não
   derruba as outras (as que calavam, calam; as que diziam ao `calou`,
   dizem). */
export function oAceitoDoCronista(aceito, recusado, proposta, ctx) {
  const ac = aceito || {};
  const recusadoDoCronista = Array.isArray(recusado) ? recusado : [];
  const r = proposta || {};
  const narrativa = ctx.narrativa;
  const testeDoTurno = ctx.testeDoTurno;
  const rolagem = ctx.rolagem;
  const { fazer, descarregar, porta, ler } = pendentes(ctx);
  const nota = (linha) => fazer({ tipo: "nota", linhas: [linha] });
  const calou = (onde, erro) => fazer({ tipo: "calou", onde, erro });
  /* ---- SEÇÃO promessas (a campanha que prende) ----
     Primeiro paga o que a narração pagou, depois guarda o que plantou:
     o filtro do lembrete de cena e o caderno de seis são do motor. */
  try {
    const pg = pagarSementes(ler().prometido, ac.promessas_pagas).estado;
    fazer({ tipo: "prometido", prometido: guardarSementes(pg, ac.promessas).estado });
  } catch (e) { calou("as promessas do Cronista", e); }
  const msgs = [];
  let p = ctx.pers;
  let tocouElenco = false;
  /* ---- SEÇÃO lugar (v9.39) ----
     O Cronista lê a narração e diz onde o herói ficou. É a rede que
     apanha o caso em que o Mestre esqueceu de mandar "lugar_atual" —
     e é justamente esse esquecimento que produzia o teleporte. */
  try {
    /* só um TEXTO conta. `null` aqui é "não sei dizer", e tratá-lo como
       "voltou para a cidade" faria o descuido do Cronista desfazer o
       lugar a cada turno — o bug de novo, por outra porta. */
    if (typeof ac.lugar === "string" && ac.lugar.trim()) {
      const aviso = porta("registrarLugar", ac.lugar, "cronista");
      if (aviso) msgs.push(aviso);
    } else if (typeof r.lugar === "string" && recusadoDoCronista.some((x) => x && x.secao === "lugar" && x.acao === "recusa")) {
      /* a recusa de sempre (o Cronista tirou o herói de onde ele está):
         a régua escreve a nota de correção e não move ninguém */
      porta("registrarLugar", r.lugar, "cronista");
    }
  } catch { /* nunca derruba o turno */ }
  /* ---- SEÇÃO missão oferecida (v9.27, redirecionada na v9.119) ----
     O Mestre traz o nobre desesperado; o sistema decide o que aquilo
     vira. Proposta sem etapa verificável é recusada em silêncio — é a
     trava que impede "ganhe a confiança do barão" de virar missão.

     O que mudou é o DESTINO. A proposta não vira mais uma missão
     esperando sim ou não no diário: vira um CARTAZ no mural, com o
     mesmo formato dos outros, e o jogador decide lá. Missão que é da
     história chega por outra porta (a trama) e não se recusa; o resto
     é papel pregado, e papel pregado espera. */
  try {
    const prop = ac.missao_oferecida;
    const E = ler();
    if (prop && typeof prop === "object" && prop.titulo && muralLiberado({ abertura: E.abertura, missoes: E.missoes })) {
      /* a paga já é a da tabela da oferta (o juízo, `pagamento`): o
         número que a prosa disse não entra mais pela porta dos fundos */
      const cartaz = cartazDaProposta(
        prop,
        { cidade: E.cidadeAtual, nivel: p.nivel || 1, historia: porta("historiaDoMural") });
      if (cartaz) {
        /* MM14 · 10a: um dador homônimo de quem já importa não prega —
           "Delfina da Névoa" recrutadora não vira cartaz ao lado da
           Delfina que a principal já persegue a 146 km. */
        let semHomonimo = true;
        try { const npcs = ler().npcs; semHomonimo = nomeComDono(cartaz.dador, npcs, porta("contextoDoNome", {})).decisao !== "recusada"; } catch (e) { calou("nomeComDono do mural", e); }
        /* MM-C · 7.ª sessão (M26–M27): quem do núcleo já fez o pedido
           ao herói pela linha do coração não tem cartaz — o favor é o
           pedido, e dois botões para a mesma coisa desmentem o aceite */
        let semPedido = true;
        try { const coracao = ler().coracao; semPedido = !favorJaPedido(cartaz.dador, coracao, porta("nucleoAgora")); } catch (e) { calou("o favor já pedido", e); }
        if (semHomonimo && semPedido && porta("pregarNoMural", cartaz)) {
          msgs.push(`📋 ${cartaz.dador || "Alguém"} tem um trabalho no mural.`);
          nota(envelopeDoRecado(cartaz));
        }
      }
    }
  } catch { /* proposta malformada nunca derruba o turno */ }
  /* ---- SEÇÃO relógio proposto (v9.18) ----
     O Mestre conhece a ficção melhor que qualquer tabela, então PODE
     pedir um relógio. Propor não é criar: o sistema apara o tamanho,
     força um gatilho da lista, recusa duplicata e recusa quando já há
     relógios demais. Mesmo contrato do resto da casa. */
  try {
    const prop = ac.relogio_novo;
    if (prop && typeof prop === "object" && prop.nome) {
      const E = ler();
      const aceite = aceitarProposta(E.relogios, prop, E.dia);
      if (aceite.ok) {
        fazer({ tipo: "relogios", relogios: aceite.relogios });
        msgs.push(`${tipoDe(aceite.relogio.tipo).icone} Começou a contar: ${aceite.relogio.nome} ${barraDe(aceite.relogio)} — ${tipoDe(aceite.relogio.tipo).desc}.`);
        nota(envelopeNovo(aceite.relogio));
      }
    }
  } catch { /* proposta malformada nunca derruba o turno */ }
  /* ---- SEÇÃO missões (isolada) ---- */
  try {
    const rm = ac.missoes && typeof ac.missoes === "object" ? ac.missoes : {};
    /* MM14 (30/09, os canais): "concluidas"/"falhadas"/"progresso"
       saíram — fechavam a lista antiga só pelo TÍTULO que o Cronista
       casasse, sem conferir nada. A lista antiga agora vira missão do
       sistema (no load e no descanso longo, `tarefas-antigas.js`) e
       fecha pela mesma porta que toda missão fecha: `conferirAsMissoes`,
       pelas etapas — o contrato que carregava paga lá (`pagaDoFecho`). */
    const E = ler();
    if (rm.global_encerrado === true && E.eventos && E.eventos.global) {
      const g = E.eventos.global;
      fazer({ tipo: "eventos", eventos: { ...E.eventos, global: null, semGlobalDesde: E.dia } });
      porta("marcarNoArco", "global", `${g.nome} chegou ao fim`);
      msgs.push(`🌍 ${g.nome}: desfecho alcançado — a região entra numa nova era.`);
      const div = ler().divindade;
      if (div && div.despertar) msgs.push(...porta("ganharFe", 500, 10, "uma era inteira reza seu nome"));
      nota(`[EVENTO GLOBAL "${g.nome}" ENCERRADO pelo sistema — NÃO o continue nem o encerre de novo: a região vive a nova era. O gerador semeará um arco novo quando chegar a hora.]`);
    }
    if (msgs.length) { fazer({ tipo: "quests" }); fazer({ tipo: "ficha", personagem: p }); }
  } catch { /* seção quebrada não derruba as outras */ }
  /* ---- SEÇÃO pessoas (isolada) ---- */
  try {
    if (Array.isArray(ac.pessoas) && ac.pessoas.length) {
      const E = ler();
      let reg = E.npcs, tocou = false;
      /* v9.113: O HERÓI NÃO É NPC. O Cronista devolveu "Íris Vantel —
         fendida, caçadora de fendas" e o sistema registrou: a partir
         dali ela entrava no elenco da cena, virava `viu` de todo
         registro (testemunha de si mesma), virava linha do Intérprete
         dizendo ao Narrador o que ela faz — quando o que ela faz é a
         única coisa que o JOGADOR decide — e virava boca pela qual o
         Vilão podia saber das coisas. */
      const euMesmo = String((E.personagem || {}).nome || "").toLowerCase().trim();
      /* MM14 · 10a: a terceira porta — mesma régua do homónimo */
      const homonimos = [];
      ac.pessoas.slice(0, 4).forEach((n) => {
        if (!n || !n.nome) return;
        if (euMesmo && String(n.nome).toLowerCase().trim() === euMesmo) return;
        let id = null;
        try { id = nomeComDono(n.nome, reg, porta("contextoDoNome", n)); } catch (e) { calou("nomeComDono", e); }
        if (id && id.decisao === "recusada") { homonimos.push(id); return; }
        const nomeCerto = (id && id.nome) || n.nome;
        const chave = (id && id.chave) || Object.keys(reg).find((k) => k.toLowerCase() === String(nomeCerto).toLowerCase());
        if (!tocou) { reg = { ...reg }; tocou = true; }
        /* E3 do "o Narrador só narra" (a fiação): sem o canal npcs do
           Narrador, o gênero vem do Cronista ("ele"/"ela"), entra no
           registo como "homem"/"mulher" e não se reescreve em quem já
           o tem (fichaDoCronista, npcs.js).
           (e) da v9.447: o paradeiro «cidade» ganha a cidade onde o herói
           está — e só quando está numa; na estrada ou numa masmorra aberta
           a cidade vai vazia e o paradeiro fica como o Cronista o deu. */
        let nF = n;
        try {
          const naoNaCidade = !!(E.jornada || (E.masmorra && !E.masmorra.encerrada));
          nF = fichaDoCronista(n, chave ? reg[chave] : null, { cidade: naoNaCidade ? "" : (E.cidadeAtual || ""), mapa: E.mapa });
        } catch (e) { calou("o gênero do Cronista", e); nF = n; }
        if (chave) reg[chave] = mesclarNPC(reg[chave], nF);
        else reg[String(nomeCerto).slice(0, 40)] = criarNPC(String(nomeCerto).slice(0, 40), { ...nF, ultimaVez: E.npcTurno, conhecidoEm: E.dia });
      });
      if (homonimos.length) nota(notaDoHomonimo(homonimos));
      if (tocou) { fazer({ tipo: "npcs", npcs: reg }); porta("sincronizarNemesis"); tocouElenco = true; }
    }
  } catch { /* seção quebrada não derruba as outras */ }
  /* ---- SEÇÃO falou_com (isolada) — 11/10, a 4.ª sessão ----
     Quatro turnos a falar com a Inocência e a etapa "falar com Inocência
     Bordão" ficou em falso: a conferência do turno corre ANTES do
     Cronista, e só sabia do lugar. Agora a conversa que ele viu é
     conferida aqui, uma vez, e a lista some logo a seguir (a porta
     `conferirCom` põe a lista, confere e tira-a, mesmo se estourar). */
  try {
    const falou = Array.isArray(ac.falou_com)
      ? ac.falou_com.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim().slice(0, 60)).slice(0, 6) : [];
    if (falou.length) {
      const antes = ler();
      p = porta("conferirCom", p, { falouCom: falou }) || p;
      const depois = ler();
      if (depois.missoes !== antes.missoes || depois.espinha !== antes.espinha) tocouElenco = true;
    }
  } catch (e) { calou("falou_com do Cronista", e); }
  /* ---- SEÇÃO o segredo revelado (isolada) — MM-C · C0 ----
     O "descobrir" com segredo fecha quando o segredo se revela: o teste
     que passou, ou a pista dada na prosa, com o herói NO lugar do marco.
     Conferido aqui, uma vez, e a lista some logo a seguir. */
  try {
    let seg = [];
    const E = ler();
    try { seg = segredosReveladosNoTurno(E.espinha, { lugar: E.lugar && E.lugar.nome, teste: testeDoTurno, narrativa }); } catch (e) { calou("segredosReveladosNoTurno", e); seg = []; }
    if (Array.isArray(seg) && seg.length) {
      const antes = ler();
      p = porta("conferirCom", p, { segredos: seg }) || p;
      const depois = ler();
      if (depois.missoes !== antes.missoes || depois.espinha !== antes.espinha) tocouElenco = true;
    }
  } catch (e) { calou("o segredo revelado", e); }
  /* ---- SEÇÃO fé (isolada) ----
     T1-B: o Cronista só CLASSIFICA o que viu; a conta é a da tabela
     (motor/cronista.js#TABELA_DA_FE) sobre a população do lugar — o
     gesto comum também (a linha `gesto`), no lugar dos "10 a 500" que
     ele chutava. Cada linha do `ac.fe` já vem calculada. */
  try {
    const div = ler().divindade;
    if (Array.isArray(ac.fe) && ac.fe.length && div && div.despertar) {
      for (const g of ac.fe) {
        if (!g || !(g.fieis > 0 || g.pf > 0)) continue;
        const doAcontecimento = g.de === "acontecimento";
        const motivo = doAcontecimento ? `${g.rotulo}${g.pop ? ` (pop. ${Number(g.pop).toLocaleString("pt-BR")})` : ""}` : String(g.motivo || g.rotulo || "sua fama vira prece").slice(0, 80);
        msgs.push(...porta("ganharFe", g.fieis, g.pf, motivo, g.local || ""));
        if (doAcontecimento) nota(`[FÉ — REGISTRO DO SISTEMA] ${g.rotulo}${g.local ? ` em ${g.local}` : ""}: +${g.fieis} fiéis, +${g.pf} PF, calculados pela população do local. Isso já está contabilizado — narre a devoção chegando, não a negue.`);
      }
    }
  } catch (e) { calou("a fé do Cronista", e); }
  /* ---- SEÇÃO combate: CÃO DE GUARDA DE COESÃO (v7.4.4) ----
     O Mestre declarou morto quem o SISTEMA mantém de pé? Correção
     pública + nota firme — o PV não muda, a NARRATIVA é que se alinha. */
  try {
    /* T1-B: o juízo já separou quem o sistema mantém de pé (`morte`,
       porque `vivo`); a correção de coesão é para esses */
    const E = ler();
    const vivosAgora = (E.combate && E.combate.inimigos || []).filter((e) => !e.derrotado && e.vida > 0);
    recusadoDoCronista.filter((x) => x && x.secao === "morte" && x.porque === "vivo").forEach((x) => {
      const alvo = vivosAgora.find((e) => (e.nome || "").toLowerCase() === String(x.o || "").toLowerCase()) || (x.o ? { nome: x.o, vida: x.vida } : null);
      if (!alvo) return;
      msgs.push(`⚔ ${alvo.nome} continua de pé — ${alvo.vida} PV. A luta não acabou.`);
      nota(`[CORREÇÃO DE COESÃO — REGRA ABSOLUTA] Você narrou a morte de ${alvo.nome}, mas o SISTEMA registra ${alvo.vida} PV: ele está VIVO e em combate. RETOME tratando-o como vivo — sem ressuscitar, sem cinzas, sem "última investida póstuma": ele simplesmente NÃO morreu. Dano e morte são decididos SÓ pelo sistema (envelopes [COMBATE — RESOLVIDO] e o PV do painel); palavras de empolgação do jogador ("estraçalho você!") são figura de linguagem, NUNCA resultado.`);
    });
  } catch { /* seção quebrada não derruba as outras */ }
  /* ---- SEÇÃO cânone (isolada) ---- */
  let tocouCanone = false;
  try {
    if (ac.canone && typeof ac.canone === "object") {
      const E = ler();
      const c = { ...E.canone };
      const novos = [];
      /* MM15 (4): a mesma peneira da porta do Narrador — nenhum segredo
         que a espinha ainda guarda vira cânone pela boca do Cronista.
         Se a peneira estourar, segue o comportamento de hoje (nunca
         pior para o segredo). */
      let canoneDoCronista = ac.canone;
      try { canoneDoCronista = peneirarCanone(ac.canone, { espinha: E.espinha, mundo: porta("mundoDaBase") }).canone; } catch (e) { calou("peneirarCanone (Cronista)", e); }
      for (const [nome, ficha] of Object.entries(canoneDoCronista)) {
        if (!nome || !ficha || typeof ficha !== "object") continue;
        const chaveExistente = Object.keys(c).find((k) => k.toLowerCase() === String(nome).toLowerCase());
        if (!chaveExistente) {
          c[String(nome)] = { ...ficha, registradoDia: E.dia };
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
      if (novos.length) { fazer({ tipo: "canone", canone: c }); tocouCanone = true; }
    }
  } catch { /* seção quebrada não derruba as outras */ }
  /* ---- SEÇÃO grupo: RECRUTAMENTO REAL (v7.5) ----
     O Mestre narrava "vou com você" e o convite se perdia no ar — o
     companheiro nunca entrava na ficha. Agora o Cronista aponta quem
     aceitou e o CÓDIGO assina o registro (com os dados do elenco, se houver). */
  try {
    /* T1-B: só quem o juízo deixou passar pela porta do convite; o
       grupo cheio continua a ser dito ao jogador. Com o grupo cheio o
       convite recusa todos, e o juízo diz `semPorta` (ou `desconhecido`)
       antes de chegar a `cheio`: a frase sai para esses também, como
       saía antes do juízo para todo nome que não fosse já do grupo.
       A régua mora em `frasesDoGrupoCheio` (src/motor/meio-do-turno.js),
       guardada por teste-grupo-cheio.mjs (3.ª fatia). */
    msgs.push(...frasesDoGrupoCheio(recusadoDoCronista, p.grupo));
    const entraram = (ac.grupo && Array.isArray(ac.grupo.entraram)) ? ac.grupo.entraram : [];
    if (entraram.length) {
      const grupoAtual = [...(p.grupo || [])];
      entraram.forEach((nome0) => {
        const nome = String(nome0 || "").slice(0, 40).trim();
        if (!nome) return;
        if (grupoAtual.some((x) => (x.nome || "").toLowerCase() === nome.toLowerCase())) return;
        if (grupoAtual.filter((g) => !g.invocada).length >= MAX_COMPANHEIROS) { msgs.push(`O grupo está cheio — ${nome} não pôde se juntar.`); return; }
        /* v9.143: a MESMA montagem do convite. Duas cópias seria a
           segunda ficando para trás na primeira mudança. */
        const novoComp = porta("fichaDeCompanheiro", nome, p);
        grupoAtual.push(novoComp);
        /* QUANTO ELE SOMA (v9.116). "Fulano juntou-se ao grupo" não diz
           se veio ajuda ou bagagem — e o pedido é explícito em que o
           jogador precisa saber "se o personagem é fraco ou forte pra
           entrar no grupo". O peso responde com número e com uma
           palavra, que é o que se lê primeiro. */
        const peso = pesarCompanheiro(novoComp, p);
        msgs.push(`⚑ ${nome} juntou-se ao grupo — ⚡ ${formatarPoder(peso.poder)} de poder, ${peso.veredito}.`);
        nota(porta("notaDoRecrutamento", novoComp));
      });
      if (grupoAtual.length !== (p.grupo || []).length) { p = { ...p, grupo: grupoAtual }; fazer({ tipo: "ficha", personagem: p }); }
    }
  } catch { /* seção quebrada não derruba as outras */ }
  /* ---- SEÇÃO teste_sugerido: CONCESSÃO GRANDE EXIGE PROVA (v7.5) ----
     O caso do lobo ancestral: o Mestre entregou de graça algo que deveria
     ter sido conquistado. O Cronista sinaliza e o CÓDIGO abre um teste
     real (dificuldade por perfil, calculada do modificador do herói) para
     selar a concessão — se passar, o feito é canon; se falhar, o Mestre
     narra a resistência (sem apagar o que já foi dito, o tom muda). */
  try {
    const ts = ac.teste_sugerido;
    if (ts && typeof ts === "object" && ts.atributo && !rolagem && !ler().combate) {
      const attrT = ATRIBUTOS.find((x) => x.nome.toLowerCase() === String(ts.atributo).toLowerCase());
      if (attrT) {
        const modT = atributoEfetivo(p, attrT.id);
        const dc = dificuldadePorPerfil(modT, ts.perfil === "formidavel" ? "formidavel" : "dificil");
        const motivo = String(ts.motivo || "concessão grande demais para ser de graça").slice(0, 120);
        fazer({ tipo: "rolagem", rolagem: { atributo: attrT.nome, dificuldade: dc, motivo, origem: "cronista" } });
        msgs.push(`🎲 O Mestre pede um teste de ${attrT.nome}: ${motivo}`);
        nota(`[TESTE EXIGIDO PELO SISTEMA] A concessão que você narrou (${motivo}) é grande demais para ser de graça: o sistema abriu um teste de ${attrT.nome} (dificuldade ${dc}). Se o herói PASSAR, tudo que você narrou é canon e selado; se FALHAR, narre a concessão se complicando (condição, preço, resistência parcial) — sem apagar o que foi dito, mas sem entregar o ouro inteiro de bandeja.`);
      }
    }
  } catch { /* seção quebrada não derruba as outras */ }
  descarregar();
  return { p, msgs, tocouCanone, tocouElenco };
}
