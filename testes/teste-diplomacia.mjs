/* A DIPLOMACIA (v9.142)

   Esta era a última sala da casa onde a IA ainda decidia o que existe. O
   texto que o jogo mandava ao Narrador dizia, com todas as letras:

     "O líder de X responde NA FICÇÃO ... pode aceitar, exigir condições,
      adiar ou recusar — A DECISÃO É DELE(A). Se um acordo for firmado,
      registre em mapa_faccoes."

   O jogador apertava um botão, a IA inventava a resposta e depois escrevia
   o tratado de volta no mundo. Todo o resto do projeto foi feito para tirar
   exatamente isso dela.

   Esta suíte defende que quem pesa é o código, que o veredito se explica, e
   que a guerra — que desde a v6.5 não fazia absolutamente nada — custe. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const semCom = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semCom(readFileSync("../src/App.jsx", "utf8"));
const PAINEL = semCom(readFileSync("../src/painel-diplomacia.jsx", "utf8"));
const D = await import(S + "diplomacia.js");
const L = await import(S + "lugar.js");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

const casa = { nome: "A Ordem do Vácuo", poder: 40, mestre: "Tessa", oficio: "voto" };
const imperio = { nome: "O Reino de Ferro", poder: "imperio", lider: "Rei Corvo" };

sec("1. A DECISÃO SAIU DA IA");
{
  /* a frase exata que estava no prompt, e que era o coração do problema.
     Medida DENTRO do handler: "a decisão é dele(a)" ainda existe no convite
     ao grupo, que é outra porta e outra conversa — e está anotada. */
  const HANDLER = APP.slice(APP.indexOf("const diplomacia = (nomePotencia, acao)"), APP.indexOf("const cumprirExigencia"));
  t("o handler existe", HANDLER.length > 400);
  t("o prompt não diz mais que a decisão é do líder", !/A decisão é dele/i.test(HANDLER));
  t("nem manda a IA escolher entre aceitar e recusar", !/pode aceitar, exigir/.test(HANDLER));
  t("nem manda a IA registrar o tratado", !/registre em "mapa_faccoes"/.test(APP));
  t("agora quem pesa é o código", /const v = vereditoDe\(p, acao\)/.test(APP));
  /* e o tratado é escrito pelo sistema, no mapa */
  t("o tratado é escrito pelo sistema", /const firmarTratado = \(nome, tratado\) =>/.test(APP));
  /* medido por ORDEM, e não por distância: entre um e outro moram os
     ramos do "exige" e do "adia" */
  t("e o veredito muda o mundo ANTES da narração", APP.indexOf("firmarTratado(p.nome, acao)") < APP.indexOf("enviar(envelopeDaResposta"));
  t("o Narrador recebe fato consumado", /enviar\(envelopeDaResposta\(p, acao, v\), personagem\)/.test(APP));
}

sec("2. UMA POTÊNCIA QUER ALGUMA COISA");
{
  const p = D.potenciaDe(casa);
  t("a potência nasce", !!p && p.nome === "A Ordem do Vácuo");
  t("com apetite", !!D.apetitePorId(p.apetite));
  t("com medo", !!D.medoPorId(p.medo));
  t("e com orgulho de 0 a 3", p.orgulho >= 0 && p.orgulho <= 3);
  /* derivada do NOME, como a índole de uma pessoa: quem volta encontra a
     mesma potência, e não é preciso guardar nada no save */
  t("a mesma potência quer sempre a mesma coisa", D.potenciaDe(casa).apetite === D.potenciaDe({ nome: casa.nome }).apetite);
  t("sem nome, não há potência", D.potenciaDe({ poder: 90 }) === null);
  /* o poder vem em dois dialetos: número (as casas) e palavra (a IA) */
  t("o poder numérico passa", D.potenciaDe(casa).poder === 40);
  t("e a palavra vira número", D.potenciaDe(imperio).poder === 90);
  t("palavra desconhecida não quebra", D.potenciaDe({ nome: "X", poder: "colossal" }).poder > 0);
  /* todo apetite ama e odeia uma proposta REAL, ou seria adjetivo */
  const acoes = new Set(["comercio", "alianca", "vassalagem", "guerra"]);
  t("todo apetite ama uma proposta que existe", D.APETITES.every((a) => acoes.has(a.ama)));
  t("e despreza outra que existe", D.APETITES.every((a) => acoes.has(a.odeia)));
  t("e nunca ama e despreza a mesma", D.APETITES.every((a) => a.ama !== a.odeia));
}

sec("3. AS DUAS FONTES VIRARAM UMA");
{
  /* a aba lia só `mapa.faccoes`, que só existe quando a IA nomeia alguém —
     enquanto o mundo já nascia com sete casas de código que ela ignorava */
  const ps = D.potenciasDoMundo({ guildas: [casa, { nome: "A Liga", poder: 39 }], faccoes: [imperio] });
  t("as casas do mundo entram", ps.some((x) => x.nome === "A Ordem do Vácuo"));
  t("e as facções do Narrador também", ps.some((x) => x.nome === "O Reino de Ferro"));
  t("sem duplicar quem aparece nas duas", D.potenciasDoMundo({ guildas: [casa], faccoes: [{ nome: "A Ordem do Vácuo" }] }).length === 1);
  t("a sua própria casa é marcada", D.potenciasDoMundo({ guildas: [{ ...casa, membro: true }] })[0].doJogador === true);
  t("e a sua facção também", D.potenciasDoMundo({ faccoes: [{ nome: "Casa do Corvo" }], faccaoJogador: "Casa do Corvo" })[0].doJogador === true);
  /* e o App lê as duas */
  t("o App junta guildas e facções", /potenciasDoMundo\(\{\s*guildas: guildasRef\.current/.test(APP));
}

sec("4. O VEREDITO SE EXPLICA");
{
  const p = D.potenciaDe(casa);
  const v = D.pesarProposta({ potencia: p, acao: "comercio", fama: 0, meuPoder: 10, dia: 5 });
  t("há veredito", !!v);
  t("e ele é um dos quatro", ["aceita", "exige", "adia", "recusa"].includes(v.resposta));
  /* decisão que não se explica é a mesma arbitrariedade de antes, com
     outro dono */
  t("e sempre traz os porquês", v.porques.length > 0);
  t("o apreço está entre eles", v.porques.some((x) => /apreço/.test(x)));
  t("proposta que não existe não tem veredito", D.pesarProposta({ potencia: p, acao: "casamento" }) === null);
  t("sem potência, sem veredito", D.pesarProposta({ potencia: null, acao: "comercio" }) === null);
  /* guerra não se negocia: é ato, não proposta */
  t("guerra sempre 'passa'", D.pesarProposta({ potencia: p, acao: "guerra" }).resposta === "aceita");
  t("e diz que não era proposta", /guerra não é proposta/.test(D.pesarProposta({ potencia: p, acao: "guerra" }).porques.join(" ")));
}

sec("5. O QUE VOCÊ FAZ MUDA A RESPOSTA");
{
  const p = D.potenciaDe(casa);
  const frio = D.pesarProposta({ potencia: p, acao: "comercio", fama: 0, meuPoder: 10, dia: 5 });
  /* apreço alto e lenda grande abrem a porta que o frio fecha */
  let dip = null;
  for (let i = 0; i < 8; i++) dip = D.presentear(dip, p, { dia: 1 }).dip;
  const quente = D.pesarProposta({ potencia: p, acao: "comercio", dip, fama: 80, meuPoder: 60, dia: 30 });
  const ordem = { recusa: 0, adia: 1, exige: 2, aceita: 3 };
  t("de mão vazia, a resposta é fria", ordem[frio.resposta] <= 1);
  t("com apreço e lenda, esquenta", ordem[quente.resposta] > ordem[frio.resposta]);
  /* ninguém vira vassalo de quem é menor */
  const menor = D.pesarProposta({ potencia: p, acao: "vassalagem", dip, fama: 99, meuPoder: 10, dia: 30 });
  t("quem é menor não exige vassalagem", menor.resposta === "recusa");
  t("e o motivo compara os dois poderes", menor.porques.some((x) => /poder 40 e você/.test(x)));
  /* insistir cansa */
  const hoje = D.pesarProposta({ potencia: p, acao: "comercio", dip: D.mexerNoApreco(dip, p.nome, 0, { ultimaEm: 30 }), fama: 80, meuPoder: 60, dia: 31 });
  t("pedir de novo no dia seguinte pesa contra", hoje.porques.some((x) => /anteontem/.test(x)));
}

sec("6. A CONDIÇÃO É CONFERÍVEL");
{
  /* exigência que o sistema não sabe olhar é adjetivo, e adjetivo devolve a
     decisão à IA — é o mesmo erro de "ganhar a confiança do barão" */
  const tipos = new Set();
  for (let i = 0; i < 300; i++) {
    const p = D.potenciaDe({ nome: `Casa ${i}`, poder: 40 });
    tipos.add(D.exigenciaDe(p, "comercio").tipo);
  }
  t("as exigências são poucas e conhecidas", [...tipos].every((x) => ["tributo", "espera", "inimigo"].includes(x)));
  t("e todas aparecem", tipos.size >= 2);
  t("toda exigência se diz em português", [...tipos].length && D.exigenciaDe(D.potenciaDe(casa), "comercio").o.length > 8);
  /* e o App sabe conferir as três */
  for (const tp of ["tributo", "espera", "inimigo"]) t(`o App confere "${tp}"`, new RegExp(`ex\\.tipo === "${tp}"`).test(APP));
  t("o tributo sai do cofre", /cofre: guildaRef\.current\.cofre - ex\.moedas/.test(APP));
  t("a espera conta os dias", /ex\.dias - \(diaRef\.current - \(ex\.desde/.test(APP));
  t("e só então o tratado é firmado", /firmarTratado\(p\.nome, ex\.acao\)/.test(APP));
}

sec("7. O PRESENTE PESA, E PODE OFENDER");
{
  const pequena = D.potenciaDe({ nome: "Bando da Estrada", poder: 10 });
  const grande = D.potenciaDe({ nome: "O Reino de Ferro", poder: 90 });
  /* custava 40 fixos, fosse para um bando ou para um império */
  t("impressionar um império custa mais", D.custoDoPresente(grande) > D.custoDoPresente(pequena) * 3);
  t("e nunca custa menos que o piso antigo", D.custoDoPresente(pequena) >= 40);
  const r = D.presentear(null, pequena, { dia: 1 });
  t("o presente move um número", D.aprecoDe(r.dip, pequena.nome) !== D.APRECO_INICIAL || r.ofendeu);
  t("e conta que foi mandado", D.fichaDe(r.dip, pequena.nome).presenteados === 1);
  /* orgulho alto e apetite que despreza ouro: o presente ofende */
  const ofendiveis = [];
  for (let i = 0; i < 400; i++) {
    const p = D.potenciaDe({ nome: `Corte ${i}`, poder: 50 });
    if (D.presentear(null, p, {}).ofendeu) ofendiveis.push(p.nome);
  }
  /* A SONDA PEGOU ESTA. O peso do orgulho era 1,5 e o pior dos vinte e
     quatro cruzamentos de apetite e orgulho ainda dava +2: `ofendeu` NUNCA
     era verdade, e o painel e o envelope falavam de uma ofensa que o
     sistema não sabia produzir. Promessa que o código não entrega é
     adjetivo. */
  t("há quem se ofenda com presente", ofendiveis.length > 0);
  t("mas não é a maioria", ofendiveis.length < 200);
  /* o apreço não sai da faixa */
  let d = null;
  for (let i = 0; i < 60; i++) d = D.presentear(d, pequena, {}).dip;
  t("o apreço tem teto", D.aprecoDe(d, pequena.nome) <= 100);
  /* E ESTA TAMBÉM. `Number(0) || 40` devolve 40: uma potência que passasse
     a te odiar por completo voltava a neutra na primeira normalização — ou
     seja, no próximo save. O zero é um valor, não a falta de um. */
  t("e piso", D.aprecoDe(D.mexerNoApreco(null, "X", -999), "X") === 0);
  t("e o zero sobrevive a uma volta pelo save", D.aprecoDe(D.garantirDiplomacia(JSON.parse(JSON.stringify(D.mexerNoApreco(null, "X", -999)))), "X") === 0);
  t("acento e caixa não criam duas potências", D.chaveDaPotencia(" A Ordem DO Vácuo ") === D.chaveDaPotencia("a ordem do vacuo"));
}

sec("8. A GUERRA CUSTA");
{
  /* `gestao.js` dizia desde a v6.5: "guerra: sem bônus — os efeitos da
     guerra são ficção do Mestre". Declarar guerra não fazia nada. */
  const emPaz = D.potenciasDoMundo({ guildas: [casa] });
  t("sem guerra, sem golpe", D.golpeDaGuerra(emPaz, { dominios: 2 }) === null);
  const emGuerra = D.potenciasDoMundo({ guildas: [{ ...casa, tratado: "guerra" }] });
  t("sem domínio, não há onde doer", D.golpeDaGuerra(emGuerra, { dominios: 0 }) === null);
  const g = D.golpeDaGuerra(emGuerra, { dominios: 2 });
  t("com guerra e domínio, dói", !!g && g.felicidade < 0);
  t("e diz quem está do outro lado", g.quem.includes("A Ordem do Vácuo"));
  /* quem é maior, dói mais */
  const forte = D.golpeDaGuerra(D.potenciasDoMundo({ guildas: [{ nome: "Império", poder: 90, tratado: "guerra" }] }), { dominios: 1 });
  t("império dói mais que casa pequena", forte.felicidade < g.felicidade);
  /* a sua própria casa não guerreia com você */
  t("a sua casa não entra na conta", D.golpeDaGuerra(D.potenciasDoMundo({ guildas: [{ ...casa, tratado: "guerra", membro: true }] }), { dominios: 2 }) === null);
  /* e o App aplica isso todo dia */
  t("o App cobra a guerra por dia", /const golpe = golpeDaGuerra\(potenciasAqui\(\), \{ dominios/.test(APP));
  t("nos domínios, no ânimo", /felicidade: Math\.max\(0, Math\.min\(100, v\.felicidade \+ golpe\.felicidade\)\)/.test(APP));
}

sec("9. O ENVELOPE É FATO, NÃO SUGESTÃO");
{
  const p = D.potenciaDe(casa);
  const v = D.pesarProposta({ potencia: p, acao: "comercio", fama: 0, meuPoder: 10, dia: 5 });
  const e = D.envelopeDaResposta(p, "comercio", v);
  t("diz que o sistema resolveu", /RESOLVIDA PELO SISTEMA/.test(e));
  t("manda narrar com este desfecho", /com ESTE desfecho e nenhum outro/.test(e));
  t("proíbe firmar por conta própria", /não firme nada além disto/.test(e));
  t("e proíbe reabrir", /não reabra a decisão/.test(e));
  t("traz os porquês para a cena", /O que pesou/.test(e));
  /* o português: os nomes vêm com artigo colado */
  t("a contração está certa", /à Ordem do Vácuo/.test(e) && !/ a A Ordem/.test(e));
  t("e o masculino também", /ao Reino de Ferro/.test(D.envelopeDaResposta(D.potenciaDe(imperio), "comercio", v)));
  t("nome sem artigo fica em paz", L.comA("Tessa") === "a Tessa");
  /* a lista das potências vai à Pauta, e proíbe a IA de mexer */
  const lista = D.envelopeDasPotencias(D.potenciasDoMundo({ guildas: [casa] }), null);
  t("a Pauta recebe quem são", /A Ordem do Vácuo \(poder 40\)/.test(lista));
  t("com o que cada uma quer", /quer /.test(lista));
  t("e o apreço", /Apreço por você: 40\/100/.test(lista));
  t("e a proibição", /quem decide isso é o sistema/.test(lista));
  t("a sua casa não entra na lista", D.envelopeDasPotencias(D.potenciasDoMundo({ guildas: [{ ...casa, membro: true }] }), null) === "");
  t("o App manda a lista à Pauta", /porNaPauta\(p, "mundo", envelopeDasPotencias\(potenciasAqui\(\), diplomaciaRef\.current\)\)/.test(APP));
}

sec("10. O JOGADOR VÊ ANTES DE APERTAR");
{
  /* quatro botões que mandavam a proposta para a IA decidir, sem o jogador
     fazer ideia do que ia acontecer nem por quê */
  t("o painel mostra o que ela quer", /\{ap\.o\}/.test(PAINEL));
  t("e o que ela teme", /\{md\.o\}/.test(PAINEL));
  t("e o apreço", /apreco\}\/100/.test(PAINEL));
  t("e o veredito, antes do clique", /veredito\(p, a\.id\)/.test(PAINEL));
  t("com o porquê no título", /v\.porques\.join/.test(PAINEL));
  t("a condição pendente aparece", /Ela exige \{f\.exigencia\.o\}/.test(PAINEL));
  t("com botão de cumprir", /onCumprir && onCumprir\(p\.nome\)/.test(PAINEL));
  t("o preço do presente é o desta potência", /◉ \{custo\} do cofre/.test(PAINEL));
  t("e o rodapé diz quem decide", /Quem decide é o sistema, e não o Narrador/.test(PAINEL));
  t("guerra não é proposta, e o painel diz", /não se propõe: se declara/.test(PAINEL));
  /* o App entrega tudo o que o painel precisa */
  t("o App entrega as potências", /potencias=\{potenciasAqui\(\)\}/.test(APP));
  t("o veredito", /veredito=\{vereditoDe\}/.test(APP));
  t("e o cumprir", /onCumprirExigencia=\{cumprirExigencia\}/.test(APP));
  t("e o estado é salvo", /salvar\(\{ diplomacia: d \}\)/.test(APP));
}


sec("O PRESENTE DIZ SE PEGA (v9.190)");
{
  /* `painel-diplomacia-v2` foi redesenhado a partir do que o painel faz — o
     que ela quer, o que ela teme, a barra de apreço, a exigência pendente e
     o veredito em cada uma das quatro propostas. E aí ficou visível que o
     PRESENTE era a única ação sem veredito na tela: ele mostrava o preço, e
     escondia num `title` a única coisa que importa — se ele pega. Num
     telefone o title não existe, e lá o botão era um sorteio de ◉ 200. */
  t("o botão do presente diz o preço", /🎁 presentear · ◉ \{custo\} do cofre/.test(PAINEL));
  t("e diz, em linha visível, se o presente pega", /\{semCasa \? "exige uma casa" : semCofre \? `o cofre tem ◉ \$\{cofre \|\| 0\}` : pega\.diz\}/.test(PAINEL));
  t("a leitura sai do multiplicador da potência", /ap\.presente >= 1\.1 \? \{ diz: "isto impressiona"/.test(PAINEL));
  t("com as três faixas", /isto serve/.test(PAINEL) && /pode soar pouco — ela não se compra com ouro/.test(PAINEL));
  /* e os dois motivos de estar travado agora se distinguem: sem casa é uma
     coisa, cofre curto é outra, e antes as duas davam o mesmo botão apagado */
  t("sem casa e sem cofre dizem coisas diferentes", /const semCasa = !temCasa;/.test(PAINEL) && /const semCofre = \(cofre \|\| 0\) < custo;/.test(PAINEL));
  /* o multiplicador é da tabela, e não inventado aqui */
  t("o apreço por ouro é da tabela", D.APETITES.every((a) => typeof a.presente === "number"));
}
console.log(`\ndiplomacia v9.142: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
