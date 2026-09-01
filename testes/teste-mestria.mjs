/* teste-mestria.mjs (v9.71) — "ele parece um mestre iniciante meio perdido".

   O que esta suíte prova NÃO é que o mestre ficou criativo: é que ele
   ficou PONTUAL. Cada asserção aqui é um erro de mesa com nome — pedir
   dado demais, deixar a cena morrer, esquecer o que o jogador plantou,
   matar sem aviso, dar o sucesso e nada além dele.

   E metade dela é o contrário: as horas em que o mestre NÃO pode
   intervir. Um mestre que corrige o ritmo toda hora é pior que um que
   nunca corrige — ele não deixa o jogo acontecer. */
import {
  MESTRES, JANELA, garantirMesa, anotarTurno,
  TEMPERATURAS, temperaturaDaMesa,
  testeEhConsequente, seguraOTeste, falaDaConcessao, envelopeDaConcessao,
  PILARES, pilarFaminto, SINAIS_DO_PILAR, pilarDoTexto,
  FIOS_DA_MEMORIA, fioDaMemoria, marcarFio, envelopeDoFio, linhaDoFio,
  BRILHOS, brilhoDoSucesso, falaDoBrilho, envelopeDoBrilho,
  jaAvisou, marcarAvisado, avisarAntesDeMorder, envelopeDoAviso,
} from "../src/mestria.js";
import { DESAFIOS, custoPorAlvo, garantirTentativas, registrarTentativa, fracassoEsquecido } from "../src/desafios.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

/* atalhos para montar uma mesa */
const mesaDe = (...ts) => ts.reduce((m, x) => anotarTurno(m, x), null);
const nada = { rolou: false, perigo: false, ganho: false, luta: false, pilar: null };
const dado = { ...nada, rolou: true };
const papo = { ...nada, pilar: "social" };
const N = (n, x) => Array.from({ length: n }, () => x);

sec("1. a memória curta — dez turnos e nada além");
{
  const m = garantirMesa(null);
  t("mesa nula nasce vazia e íntegra", Array.isArray(m.turnos) && m.turnos.length === 0 && m.desdeFio === 0);
  const cheia = mesaDe(...N(20, dado));
  t("a janela não passa de " + JANELA, cheia.turnos.length === JANELA);
  t("lixo no save não quebra", garantirMesa({ turnos: "isto não é lista", avisados: 7 }).turnos.length === 0);
  t("pilar inventado é descartado", anotarTurno(null, { pilar: "culinaria" }).turnos[0].pilar === null);
  t("pilar válido entra", anotarTurno(null, { pilar: "social" }).turnos[0].pilar === "social");
}

sec("2. a temperatura — o mestre lê a mesa antes de decidir");
{
  t("mesa vazia é morna, não fria", temperaturaDaMesa(null).id === "morna");
  t("quatro turnos parados ainda não são frios (janela curta não conclui)",
    temperaturaDaMesa(mesaDe(...N(4, nada))).id === "morna");
  t("cinco turnos sem dado, sem ganho e sem perigo: a cena morreu",
    temperaturaDaMesa(mesaDe(...N(5, papo))).id === "fria");
  t("três dados nos últimos cinco: a mesa está quente",
    temperaturaDaMesa(mesaDe(nada, dado, dado, nada, dado)).id === "quente");
  t("luta agora é brasa", temperaturaDaMesa(mesaDe(...N(5, papo), { ...nada, luta: true })).id === "brasa");
  t("perigo no turno passado ainda é brasa",
    temperaturaDaMesa(mesaDe({ ...nada, perigo: true }, nada)).id === "brasa");
  /* a ordem da tabela é o conteúdo: brasa ganha de quente */
  t("com dado demais E perigo agora, vence a brasa",
    temperaturaDaMesa(mesaDe(dado, dado, dado, { ...nada, perigo: true })).id === "brasa");
  t("um ganho recente basta para a cena não ser fria",
    temperaturaDaMesa(mesaDe(...N(4, papo), { ...nada, ganho: true })).id === "morna");
  for (const x of TEMPERATURAS) t(`"${x.id}" diz por que existe`, x.porque.length > 40);
}

sec("3. O GOVERNADOR DO DADO — as travas primeiro");
{
  const mesaQuente = mesaDe(dado, dado, dado);
  t("a mesa do teste está mesmo quente", temperaturaDaMesa(mesaQuente).id === "quente");
  const pequeno = { tipo: "teste", rotulo: "ler a placa torta", dc: 11, corpo: false, testemunha: false, barulho: false, dispensavel: true };
  /* A MARCA É POSITIVA, e é a trava mais importante desta seção: a régua
     não pode ser a AUSÊNCIA de uma linha em CUSTO_DE_FALHAR, ou falsificar
     um documento vira dispensável só porque ninguém escreveu ainda o que
     a falha dele custa. Lacuna numa tabela virando permissão em outra é a
     classe de bug que esta casa mais repete. */
  t("o que ninguém marcou como dispensável rola sempre",
    seguraOTeste({ ...pequeno, dispensavel: false }, mesaQuente).segura === false);
  t("e a recusa diz que a marca é que manda",
    /apenas não saber/.test(seguraOTeste({ ...pequeno, dispensavel: false }, mesaQuente).porque));
  t("o pequeno e provável é concedido na mesa quente", seguraOTeste(pequeno, mesaQuente).segura === true);
  t("e na mesa morna ele rola normalmente", seguraOTeste(pequeno, null).segura === false);

  /* AS TRAVAS — nada consequente é dispensado, em mesa nenhuma */
  const naoPode = [
    ["põe o corpo em risco", { ...pequeno, corpo: true }],
    ["deixa testemunha", { ...pequeno, testemunha: true }],
    ["faz barulho", { ...pequeno, barulho: true }],
    ["é difícil (DC 18+)", { ...pequeno, dc: 18 }],
    ["pode fazer cair", { ...pequeno, queda: { metros: 6 } }],
  ];
  for (const [porque, v] of naoPode) t(`nunca dispensa o que ${porque}`, seguraOTeste(v, mesaQuente).segura === false);

  /* as três exceções que NÃO são sobre consequência: conceder aqui não
     pouparia um dado sem graça, entregaria o que o sistema não tem como
     entregar — o que foi achado, e o que exatamente o sim comprou */
  t("não dispensa o que depende de HAVER o quê (oportunidade)",
    seguraOTeste({ ...pequeno, oportunidade: { nada: "silêncio" } }, mesaQuente).segura === false);
  t("nem o que tem tesouro atrás", seguraOTeste({ ...pequeno, achado: { nome: "anel" } }, mesaQuente).segura === false);
  t("nem a busca que fecha o lugar depois", seguraOTeste({ ...pequeno, fechaDepois: true }, mesaQuente).segura === false);
  t("nem o teste social", seguraOTeste({ ...pequeno, social: { tamanho: "cortesia" } }, mesaQuente).segura === false);
  t("e a recusa social explica o motivo", /envelope social/.test(seguraOTeste({ ...pequeno, social: {} }, mesaQuente).porque));
  t("no combate nada é dispensado", seguraOTeste(pequeno, mesaQuente, { emCombate: true }).segura === false);
  t("e a recusa diz o motivo em português", /não se dispensa em mesa nenhuma/.test(seguraOTeste({ ...pequeno, corpo: true }, mesaQuente).porque));

  t("o que não é teste não é assunto do governador", seguraOTeste({ tipo: "livre" }, mesaQuente).segura === false);
  t("consequente exige ser teste", testeEhConsequente({ tipo: "impossivel", corpo: true }) === false);

  /* o jogador vê que conseguiu, não que foi perdoado */
  const s = seguraOTeste(pequeno, mesaQuente);
  t("a linha do jogador não menciona dado", !/dado|teste|rolagem/i.test(falaDaConcessao(s)));
  t("mas diz que deu certo", /você faz/.test(falaDaConcessao(s)));
  t("o envelope proíbe a complicação de compensação", /NÃO invente uma complicação/.test(envelopeDaConcessao(s)));
  t("e proíbe mencionar a decisão", /não mencione dado/.test(envelopeDaConcessao(s)));
  t("sem concessão não há envelope", envelopeDaConcessao({ segura: false }) === "");
}

sec("3b. e o catálogo de verdade: quem carrega a marca, e o que ela promete");
{
  const dispensaveis = DESAFIOS.filter((d) => d.dispensavel);
  t("a marca existe em alguém", dispensaveis.length > 0);
  t("e não em muitos — dispensar é exceção", dispensaveis.length <= DESAFIOS.length / 4);
  /* A ASSERÇÃO QUE IMPORTA: a marca PROMETE que falhar só custa não saber.
     Se um dia alguém marcar dispensável um desafio que sangra, faz barulho,
     deixa testemunha ou pede algo a alguém, é aqui que isso aparece — e não
     numa sessão de jogo, com o herói levando um item de graça. */
  for (const d of dispensaveis) {
    const c = custoPorAlvo(d.alvo) || {};
    const sujo = [
      c.pele || c.peleSeca || c.pelePorPouco ? "custa pele" : "",
      c.barulhoExtra || d.barulho ? "faz barulho" : "",
      d.testemunha ? "deixa testemunha" : "",
      d.corpo ? "põe o corpo" : "",
      d.social ? "é conversa" : "",
      d.oportunidade ? "depende de haver o quê" : "",
    ].filter(Boolean);
    t(`"${d.id}" só custa não saber`, sujo.length === 0 || `${d.id}: ${sujo.join(", ")}` === "");
  }
  /* e a busca nunca: o resultado dela é fato do mundo, não do herói */
  t("buscar não carrega a marca", !DESAFIOS.find((d) => d.id === "buscar").dispensavel);
  t("investigar também não", !DESAFIOS.find((d) => d.id === "investigar").dispensavel);
  t("falsificar também não", !DESAFIOS.find((d) => d.id === "falsificar").dispensavel);
}

sec("4. o holofote — o pilar que passa fome");
{
  t("mesa curta não conclui nada", pilarFaminto(mesaDe(...N(5, papo))) === null);
  const soConversa = mesaDe(...N(8, papo));
  const f = pilarFaminto(soConversa);
  t("oito turnos de conversa: algum pilar está em falta", !!f);
  /* e o que ele aponta NÃO é a luta: empurrar uma luta porque não houve
     luta é o pior conselho que esta tabela poderia dar */
  t("e não é a luta que ele empurra", f.id !== "combate");
  const variada = mesaDe(papo, { ...nada, pilar: "combate" }, { ...nada, pilar: "exploracao" }, papo, papo, papo);
  t("mesa que passeia pelos três pilares não tem fome", pilarFaminto(variada) === null);
}

sec("4b. DE ONDE SAI O PILAR — o buraco que a v9.71 deixou aberto");
{
  /* A primeira versão lia o pilar SÓ do desafio que rolou. Um turno
     inteiro de taverna — o herói falando com três pessoas, sem tocar num
     dado — entrava como `null`, e então uma campanha feita de taverna
     podia acusar fome de "a gente". O holofote apontava para a luz acesa. */
  const social = [
    "Pergunto ao ferreiro quanto custa a lâmina.",
    "Digo à elfa que ela caiu do céu.",
    "Peço outra caneca e comento o tempo.",
    "Agradeço e proponho um acordo melhor.",
    'Chego perto e solto: "você conhece o dono disto?"',
  ];
  for (const f of social) t(`conversa: "${f.slice(0, 34)}…"`, pilarDoTexto(f) === "social");

  const fora = [
    "Vou até a ponte velha ver o que sobrou dela.",
    "Desço pela escada de pedra.",
    "Atravesso a praça e sigo pela estrada do norte.",
    "Vasculho o baú do porão.",
  ];
  for (const f of fora) t(`mundo lá fora: "${f.slice(0, 34)}…"`, pilarDoTexto(f) === "exploracao");

  /* a conversa ganha do deslocamento, e é de propósito: a frase do jogador
     que abriu esta linhagem toda tem um passo de caminhada dentro de uma
     cena social, não o contrário */
  t("'vou até a elfa e digo…' é cena social, não caminhada",
    pilarDoTexto("Vou na elfa bonita que acabou de passar e digo que ela caiu do céu.") === "social");
  t("o que não é nem um nem outro fica sem pilar", pilarDoTexto("Espero.") === null);
  t("texto vazio não inventa pilar", pilarDoTexto("") === null && pilarDoTexto(null) === null);
  t("acento não muda a leitura", pilarDoTexto("PEÇO LICENÇA") === "social");
  for (const s of SINAIS_DO_PILAR) t(`o sinal "${s.pilar}" diz por que existe`, s.porque.length > 40);

  /* e a prova de que o buraco fechou: oito turnos de conversa pura, sem
     dado nenhum, não podem mais acusar fome do pilar social */
  const soPapo = N(8, { ...nada, pilar: "social" });
  const f = pilarFaminto(soPapo.reduce((m, x) => anotarTurno(m, x), null));
  t("oito turnos de conversa não acusam fome de conversa", !f || f.id !== "social");
}

sec("4c. O FRACASSO QUE FICOU PARA TRÁS — a fonte que faltava");
{
  /* O fio mais forte dos seis nasceu sem fonte na v9.71: o livro de
     tentativas sabia que o herói tinha falhado e não sabia dizer em quê,
     porque a chave é normalizada e não há texto legível nela. */
  let reg = registrarTentativa(null, "porao|tranca", { resultado: "falha", dia: 3, rotulo: "arrombar a fechadura", onde: "o porão da estalagem" });
  reg = registrarTentativa(reg, "muro|escalada", { resultado: "falha", dia: 9, rotulo: "escalar o muro", onde: "a muralha leste" });
  reg = registrarTentativa(reg, "bau|busca", { resultado: "sucesso", dia: 5, rotulo: "vasculhar o baú", onde: "o quarto" });

  t("o livro guarda como a coisa se escreve", garantirTentativas(reg)["porao|tranca"].rotulo === "arrombar a fechadura");
  const x = fracassoEsquecido(reg, { dia: 12 });
  t("acha um fracasso para puxar", !!x);
  t("e é o MAIS ANTIGO, que é o mais esquecido", x.chave === "porao|tranca");
  t("a frase diz o quê, o onde e o quando", /arrombar a fechadura — o porão da estalagem, no dia 3/.test(x.frase));

  /* os três filtros, e cada um tira um jeito de a lembrança sair errada */
  t("sucesso não é fio pendente", fracassoEsquecido({ "b|c": { resultado: "sucesso", dia: 1, rotulo: "abrir", vias: [], vezes: 1 } }, { dia: 9 }) === null);
  t("lugar já esgotado não cobra nada",
    fracassoEsquecido({ "b|c": { resultado: "falha", limpo: true, dia: 1, rotulo: "vasculhar", vias: [], vezes: 1 } }, { dia: 9 }) === null);
  t("o que falhou HOJE ainda está na cena, não é memória", fracassoEsquecido(reg, { dia: 3 }) === null);
  t("sem rótulo não vira frase (save antigo não quebra)",
    fracassoEsquecido({ "b|c": { resultado: "falha", dia: 1, vias: [], vezes: 1 } }, { dia: 9 }) === null);
  t("livro vazio devolve nada", fracassoEsquecido(null, { dia: 5 }) === null);

  /* o texto é o do PRIMEIRO registro: reescrevê-lo a cada insistência
     trocaria a lembrança pela última tentativa */
  const dnv = registrarTentativa(reg, "porao|tranca", { resultado: "falha", dia: 11, rotulo: "outro nome qualquer", onde: "outro lugar" });
  t("insistir não reescreve a lembrança", garantirTentativas(dnv)["porao|tranca"].rotulo === "arrombar a fechadura");
  t("e conta as vezes", garantirTentativas(dnv)["porao|tranca"].vezes === 2);
  /* mas insistir REFRESCA a data, e com isso a porta do porão deixa de ser
     a coisa mais esquecida — passa a vez para o muro, que ninguém tocou
     desde o dia 9. É o comportamento certo: o mundo lembra do que foi
     abandonado, e quem insistiu ontem não abandonou nada. */
  t("insistir tira a coisa da fila do esquecimento", fracassoEsquecido(dnv, { dia: 14 }).chave === "muro|escalada");
  const so = registrarTentativa(registrarTentativa(null, "porta|tranca", { resultado: "falha", dia: 2, rotulo: "forçar a porta", onde: "a cripta" }), "porta|tranca", { resultado: "falha", dia: 2, rotulo: "x", onde: "y" });
  t("e a frase conta quantas vezes doeu", /você tentou 2 vezes/.test(fracassoEsquecido(so, { dia: 6 }).frase));
}

sec("5. O FIO DA MEMÓRIA — o mundo lembra do que o jogador fez");
{
  const ctx = {
    promessaAberta: "jurou trazer a cabeça do lobo para a viúva de Ponte do Sul",
    nomeEsquecido: { nome: "Doran", vontade: "quer notícia do irmão" },
    cicatriz: "a queimadura do lado esquerdo do rosto",
  };
  const mv = fioDaMemoria(ctx, { sorte: () => 0 });
  t("com fios abertos, sai um fio", !!mv && !!mv.fio);
  t("e ele é marcado como memória", mv.memoria === true);
  t("sem nada registrado, não inventa nada", fioDaMemoria({}, { sorte: () => 0 }) === null);
  t("campo vazio não vira fio", fioDaMemoria({ promessaAberta: "   " }, { sorte: () => 0 }) === null);

  /* a trava do tique: o mesmo fio duas vezes seguidas é pior que
     esquecimento — o jogador aprende a ignorar */
  let mesa = null;
  const saiu = [];
  for (let i = 0; i < 3; i++) {
    const x = fioDaMemoria(ctx, { sorte: () => 0, mesa });
    saiu.push(x.id);
    mesa = marcarFio(mesa, x.id);
  }
  t("três puxadas seguidas não repetem o mesmo fio", new Set(saiu).size === 3);
  t("marcar o fio zera o contador", marcarFio(null, "nome").desdeFio === 0);

  const env = envelopeDoFio(mv);
  t("o envelope crava que isto já aconteceu", /JÁ ACONTECEU nesta campanha/.test(env));
  t("proíbe trama nova", /NÃO invente uma trama nova/.test(env));
  t("proíbe virar combate sozinho", /NÃO transforme em combate/.test(env));
  t("proíbe reescrever o passado", /NÃO reescreva o que aconteceu antes/.test(env));
  t("com pilar faminto, o envelope sugere o lado", /O PILAR QUE ESTÁ EM FALTA/.test(envelopeDoFio(mv, PILARES[2])));
  t("e sem pilar não sugere nada", !/PILAR/.test(env));
  t("a linha da tela não entrega o conteúdo do fio", !linhaDoFio(mv).includes(mv.fio));
  for (const f of FIOS_DA_MEMORIA) t(`o fio "${f.id}" diz por que existe`, f.porque.length > 30);
}

sec("6. O BRILHO — o outro lado do dado");
{
  t("falhar não brilha", brilhoDoSucesso({ total: 9, dc: 15 }) === null);
  t("passar raspando não brilha", brilhoDoSucesso({ total: 15, dc: 15 }) === null);
  t("nove de folga ainda não brilha", brilhoDoSucesso({ total: 24, dc: 15 }) === null);
  t("dez de folga brilha", brilhoDoSucesso({ total: 25, dc: 15 }).id === "folgado");
  t("20 natural brilha mesmo sem folga", brilhoDoSucesso({ total: 21, dc: 20, natural: 20 }).id === "natural");
  /* e o 20 natural que FALHOU continua falha: o brilho é do sucesso, e a
     casa não tem sucesso automático em teste de perícia */
  t("20 natural que não alcançou a DC não brilha", brilhoDoSucesso({ total: 22, dc: 25, natural: 20 }) === null);

  const b = brilhoDoSucesso({ total: 28, dc: 15 });
  const env = envelopeDoBrilho(b, "forçar o portão");
  t("o envelope pede UMA coisa a mais", /UMA coisa a mais/.test(env));
  /* A TRAVA QUE IMPORTA: o brilho não paga em ouro. Moeda e item são do
     sistema — preço, peso, raridade — e a cobrança (v9.70) existe
     justamente porque a narração premiando sozinha desmonta a bolsa. */
  t("e proíbe pagar em tesouro", /NÃO dê moeda, item, poção nem tesouro/.test(env));
  t("proíbe promessa futura", /NÃO prometa recompensa futura/.test(env));
  t("proíbe nomear a mecânica", /sem nomear a mecânica/.test(env));
  t("sem brilho não há envelope", envelopeDoBrilho(null) === "");
  t("a linha do jogador celebra o número", /20 natural/.test(falaDoBrilho(brilhoDoSucesso({ total: 25, dc: 12, natural: 20 }))));
}

sec("7. O AVISO ANTES DA MORDIDA");
{
  t("golpe pequeno morde direto", avisarAntesDeMorder({ dano: 4, pv: 40, fonteId: "espinhos" }).avisa === false);
  t("golpe que leva metade do corpo se anuncia", avisarAntesDeMorder({ dano: 20, pv: 30, fonteId: "fosso" }).avisa === true);
  t("e a razão traz os números", /20 de 30 PV/.test(avisarAntesDeMorder({ dano: 20, pv: 30, fonteId: "fosso" }).porque));

  /* um turno, e só o primeiro: a segunda vez a mesma armadilha morde */
  const mesa = marcarAvisado(null, "fosso");
  t("a mesma fonte não avisa duas vezes", avisarAntesDeMorder({ dano: 20, pv: 30, fonteId: "fosso", mesa }).avisa === false);
  t("mas outra fonte ainda avisa", avisarAntesDeMorder({ dano: 20, pv: 30, fonteId: "chamas", mesa }).avisa === true);
  t("marcar duas vezes não duplica", marcarAvisado(mesa, "fosso").avisados.length === 1);
  t("já avisou responde certo", jaAvisou(mesa, "fosso") === true && jaAvisou(mesa, "chamas") === false);
  t("dano zero não é mordida", avisarAntesDeMorder({ dano: 0, pv: 30 }).avisa === false);

  /* o envelope chega DEPOIS de a IA ter narrado a mordida — o canal do
     perigo é a fala dela. Então ele tem a forma da cobrança negada: uma
     recusa que manda a cena recuar, não um pedido de aviso. */
  const env = envelopeDoAviso("o fosso de estacas sob o alçapão", { avisa: "levaria 20 de 30 PV" });
  t("a recusa diz que não alcançou", /NÃO alcançou/.test(env));
  t("manda recuar até o instante anterior", /recue até o instante ANTES/.test(env));
  t("proíbe dano neste turno", /Sem dano, sem salvaguarda/.test(env));
  t("proíbe o desmentido", /NÃO se desminta/.test(env));
  t("proíbe resolver a armadilha", /NÃO resolva a armadilha/.test(env));
  t("e diz que da próxima vez morde", /da próxima vez ela morde de verdade/.test(env));
  t("e devolve a palavra ao jogador", /a palavra volta para mim/.test(env));
}

sec("8. a escola está declarada, e cada padrão aponta para código");
{
  t("os quatro mestres e o consenso estão na tabela", MESTRES.length === 5);
  for (const m of MESTRES) t(`${m.nome}: a regra aponta para onde ela mora`, m.onde.length > 3 && m.regra.length > 30);
}

console.log(`\nmestria v9.72: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
