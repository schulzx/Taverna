/* A QUEST É DO MESTRE, O TRABALHO É DO MURAL (v9.119)

   Desde a v9.117 a trama do Mestre carrega a intenção do arco e a fase do
   vilão, e não é opcional. Mas continuavam existindo DUAS outras fontes de
   missão, as duas opcionais e as duas caindo no diário: a pessoa que o
   sistema escolhia para abordar o herói, e o campo `missao_oferecida` do
   Mestre. Três fontes disputando as mesmas oito vagas, e o jogador sem
   como distinguir o fio da história de um bico de aldeão.

   Aqui as duas opcionais mudam de endereço: viram papel no MURAL. O que
   esta suíte defende é a fronteira — o que ainda pode virar missão sozinho,
   o que passa a esperar no prego, e o que o Narrador não pode mais fazer. */

const S = "../src/";
const O = await import(S + "ofertas.js");
const M = await import(S + "missoes.js");
const { readFileSync } = await import("node:fs");
const APP = readFileSync("../src/App.jsx", "utf8");

let ok = 0, mau = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mau++; console.log("  XX  " + nome + (extra ? ` — ${extra}` : "")); }
};
const sec = (s) => console.log(`\n${s}`);

sec("1. o que o Mestre propõe vira CARTAZ, não proposta no diário");
{
  const prop = {
    titulo: "O gado de Jessa", tipo: "favor", dador: "Jessa", descricao: "Sumiram três cabeças.",
    paga: 20, prazo: 5, etapas: [{ tipo: "derrotar", alvo: "lobo", quantos: 3 }],
  };
  const c = O.cartazDaProposta(prop, { cidade: "Pedravale", nivel: 4 });
  t("a proposta vira um cartaz", !!c && c.titulo === "O gado de Jessa");
  /* a marca é o que põe o papel na pilha de baixo do mural — o de cima é
     do mundo, este é de alguém que falou com o herói */
  t("e ele nasce marcado como oferecido", c.oferecido === true);
  t("o que o mundo prega NÃO leva a marca", !O.MOLDES.some((m) => m.oferecido));
  t("o preço da cena é o preço", c.paga === 20);
  t("o prazo encosta numa duração possível", M.PRAZOS.includes(c.prazo), String(c.prazo));
  t("o nível vem do herói quando a proposta não traz o seu", c.nivel === 4);
  t("e o da proposta ganha quando existe", O.cartazDaProposta({ ...prop, nivel: 11 }, { nivel: 4 }).nivel === 11);
  t("o cartaz sabe de que cidade é", c.cidade === "Pedravale");
  t("e tem id estável", O.cartazDaProposta(prop, { cidade: "Pedravale", nivel: 4 }).id === c.id);

  /* A TRAVA DA v9.27 CONTINUA INTEIRA: sem etapa que o código saiba
     conferir, não vira papel nenhum. Era ela que impedia "ganhe a
     confiança do barão" de virar missão, e mudar o destino não a afrouxa. */
  t("sem etapa, sem cartaz", O.cartazDaProposta({ ...prop, etapas: [] }) === null);
  t("etapa sem alvo não conta", O.cartazDaProposta({ ...prop, etapas: [{ tipo: "derrotar" }] }) === null);
  t("sem título, sem cartaz", O.cartazDaProposta({ ...prop, titulo: "  " }) === null);
  t("lixo não vira cartaz", O.cartazDaProposta(null) === null && O.cartazDaProposta("x") === null);
  /* sem preço combinado o sistema calcula — e nunca devolve NaN, que é como
     um cartaz passaria a prometer "◉ null" na tela */
  const semPreco = O.cartazDaProposta({ ...prop, paga: undefined }, { nivel: 6 });
  t("sem preço combinado, o sistema calcula um", Number.isFinite(semPreco.paga) && semPreco.paga > 0, String(semPreco.paga));

  /* o cartaz tem de caber onde os outros cabem: mesma forma, mesma porta */
  const p = O.propostaDaOferta(c);
  t("o cartaz do Mestre entra na mesma tradução dos outros", p.titulo === c.titulo && p.etapas.length === 1 && p.nivel === c.nivel);
  const r = M.aceitarProposta([], p, { nivel: 4, dia: 1, mundo: { derrotados: [] } });
  t("e vira missão de verdade ao ser aceito", r.ok && r.missao.titulo === c.titulo);
}

sec("2. o envelope fecha a porta da cena antiga");
{
  const c = O.cartazDaProposta({
    titulo: "A carta que não chegou", tipo: "favor", dador: "Otávio", descricao: "Alguém precisa levá-la.",
    paga: 0, etapas: [{ tipo: "levar_a", alvo: "Rio do Sul", item: "carta selada" }],
  }, { cidade: "Pedravale", nivel: 3 });
  const rec = O.envelopeDoRecado(c);
  /* abrir a porta nova não basta: se as antigas ficarem abertas o Narrador
     faz as duas coisas — menciona o mural E oferece o serviço na mesma cena */
  t("manda encenar a MENÇÃO", /MENCIONA o serviço/.test(rec));
  t("proíbe oferecer o trabalho", /NÃO ofereça o trabalho a mim/.test(rec));
  t("proíbe perguntar se aceito", /não pergunte se eu aceito/.test(rec));
  t("proíbe negociar preço", /não negocie preço/.test(rec));
  t("proíbe começar o serviço", /não comece o serviço/.test(rec));
  t("e diz de quem é a decisão", /quem tira o papel do mural sou eu/.test(rec));
  t("sem moedas, não promete dinheiro", /NÃO se paga em moedas/.test(rec));
  t("é curto — é uma menção, não uma cena", rec.length < 1000, String(rec.length));
}

sec("3. as regras que o Mestre lê");
{
  const of = O.OFERTAS_PROMPT, mi = M.MISSOES_PROMPT;
  t("o bloco das ofertas diz que ninguém oferece na conversa", /NINGUÉM oferece missão ao herói numa conversa/.test(of));
  t("e manda pregar no mural", /PREGA UM CARTAZ NO MURAL/.test(of));
  t("e diz que a missão da história não se recusa", /não se recusa/.test(of));
  t("o bloco das missões manda o campo virar cartaz", /vira CARTAZ, não proposta/.test(of) || /transforma em cartaz do mural/.test(mi));
  t("e separa o fio do trabalho", /chegam ATIVAS e não se recusam/.test(mi));
  /* OS DOIS BLOCOS ENTRAM PELA MESMA PORTA (`missao`): dizer a mesma regra
     nos dois é pagar duas vezes por uma lição que se aprende uma. */
  t("a regra de não oferecer mora num bloco só", !/NINGUÉM OFERECE MISSÃO NUMA CONVERSA/.test(mi));
  t("some a ordem de parar e esperar resposta", !/PARE e espere a resposta/.test(mi));
}

sec("4. o que o código de verdade faz com a proposta");
{
  /* Provas sobre a FONTE, porque a ligação mora no App e nenhuma delas
     sobrevive a alguém religar o caminho antigo por engano. */
  t("o App transforma missao_oferecida em cartaz", /cartazDaProposta\(/.test(APP));
  t("e prega no mural", /pregarNoMural\(cartaz\)/.test(APP));
  t("nada mais registra a proposta como missão do diário", !/envelopeDeOferta/.test(APP));
  t("o trabalho de quem está na cidade também vai ao mural", /pregarNoMural\(\{ \.\.\.of, oferecido: true \}\)/.test(APP));
  t("e o envelope dele é o recado", /envelopeDoRecado\(of\)/.test(APP));
  /* CLEAN: uma linha por trabalho, e é a linha que o jogador pediu */
  t("o aviso é uma linha só, e manda ao mural", /tem um trabalho no mural\./.test(APP));
  /* as duas linhas do aviso antigo sumiram. A linha "primeiro passo…"
     continua existindo, e deve: ela sai quando o JOGADOR aceita, que é
     quando ele quer saber por onde começar. O que não pode voltar é o
     anúncio não pedido, com duas linhas, de um trabalho que ele nem viu. */
  t("some o anúncio de oferta no log", !/Ofereceram um trabalho/.test(APP));
  t("e o \"abra o Diário para aceitar ou recusar\"", !/abra o Diário para aceitar ou recusar/.test(APP));
  t("e some o aviso de elenco", !/entrou para o elenco/.test(APP));
  /* a ordem das duas pilhas: o mundo em cima, o oferecido embaixo */
  t("o mural monta mundo primeiro, oferecidos depois", /\[\.\.\.mundo, \.\.\.oferecidos\]/.test(APP));
  t("e os oferecidos atravessam a renovação", /filter\(\(c\) => c && c\.oferecido\)/.test(APP));
  t("a tela separa as duas pilhas", /Oferecidos a você/.test(APP));
  /* achado na tela da mesa de dois: Zulmira apareceu DUAS vezes no mesmo
     turno — uma pelo trabalho que o sistema pregou por ela e outra pelo
     que o Mestre relatou da cena. Títulos diferentes, mesma pessoa. */
  t("uma pessoa não prega dois cartazes", /UMA PESSOA, UM TRABALHO/.test(APP));
  t("e a peneira é pelo DADOR, não só pelo título", /c\.oferecido && semNome\(c\.dador \|\| ""\) === semNome\(cartaz\.dador\)/.test(APP));
}

sec("5. o que NÃO mudou, e não podia mudar");
{
  /* A trama continua nascendo ativa: é o fio da história, e história que se
     recusa num botão não é história. */
  t("a trama é forçada", M.ehForcada("trama") && M.tipoDef("trama").rotulo === "Do Mestre");
  t("contrato e favor continuam não sendo forçados", !M.ehForcada("contrato") && !M.ehForcada("favor"));
  /* o mural continua sendo aceito por botão, e o contrato nasce ATIVO ao
     ser pego: pegar o papel já é aceitar */
  t("pegar o papel já é aceitar", /contrato do mural nasce ATIVO/.test(APP));
  /* e a saída dos saves antigos continua de pé */
  t("quem tinha uma oferta parada ainda pode responder", typeof M.responderOferta === "function");
  const velha = M.garantirMissoes([{ titulo: "Resto de save", status: "oferecida", etapas: [{ tipo: "ir_a", alvo: "X" }] }]);
  t("e ela sobrevive ao carregamento", M.ofertas(velha).length === 1);
  t("e o sim continua funcionando", M.responderOferta(velha, velha[0].id, true).missoes[0].status === "ativa");
}

sec("6. o save que já tinha ofertas paradas no diário");
{
  /* Achado no save real do jogador: três missões "oferecida" penduradas,
     com aceitar/recusar, no lugar de onde a decisão saiu. Deixá-las ali
     seria manter na tela exatamente a coisa que se pediu para tirar. */
  const velha = M.criarMissao({
    titulo: "A carta de Vera da Serpente", tipo: "contrato", dador: "Vera da Serpente",
    descricao: "Levar uma carta selada.", nivel: 3, dia: 2,
    etapas: [{ tipo: "levar_a", alvo: "Rio do Sul", item: "carta selada" }],
  });
  t("a oferta nasceu como o save a guardou", velha.status === "oferecida" && velha.recompensa.moedas > 0);
  const c = O.cartazDaProposta({ ...velha, paga: velha.recompensa && velha.recompensa.moedas },
    { cidade: "Baixo do Eco", nivel: 1 });
  t("uma oferta parada vira cartaz", !!c && c.dador === "Vera da Serpente");
  t("e cai na pilha dos oferecidos", c.oferecido === true);
  t("levando o preço que já estava combinado", c.paga === velha.recompensa.moedas, String(c.paga) + " vs " + String(velha.recompensa.moedas));
  t("e o nível do trabalho, não o de quem carrega o save", c.nivel === 3);
  t("o App faz a migração ao carregar", /a oferta parada no diário vai para o mural/.test(APP));
  /* migração que perde alguma coisa em silêncio é pior do que migração
     nenhuma: o que não converter continua no diário, com o botão de sempre */
  t("e o que não converter fica onde está", /ficam\.includes\(q\.titulo\)/.test(APP));
  t("por isso a saída antiga não pode sumir", /responderOferta/.test(APP));
}

console.log(`\nmural do mestre v9.119: ${ok} passaram, ${mau} falharam`);
process.exit(mau ? 1 : 0);
