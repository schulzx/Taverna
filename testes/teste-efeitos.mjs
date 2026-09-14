/* OS EFEITOS (v9.224) — a promessa com prazo, agora módulo puro

   A2 foi MUDANÇA DE CASA, não de regra: o buff da habilidade, o efeito do
   milagre, a magia de duração e a pilha ("o novo vence") saíram de cinco
   lugares e viraram `src/efeitos.js`. A lei desta suíte é a lei da etapa —
   REGRESSÃO ZERO: mesma conta, mesmo número, mesmo texto.

   Por isso nenhuma prova daqui repete um número à mão. Toda duração e todo
   teto são LIDOS DE VOLTA da tabela nomeada: se alguém mudar `turnosPadrao`
   de 3 para 4 achando que é cosmético, é a relação entre as tabelas que
   quebra, não uma constante copiada que ninguém lembrava de atualizar.

   O que NÃO mora aqui e a suíte prova por ponte: o relógio (`tickEfeitos`),
   o bônus virando rolagem (`bonusEfeito`) e o canal do Mestre
   (`aplicarMudancas`) continuam em `regras-jogo.js`; o escopo do buff
   continua em `combos.js`. A ponte é o que garante que a mudança de casa
   não cortou nenhum fio.                                                  */

const RAIZ = "../src/";
const E = await import(RAIZ + "efeitos.js");
const R = await import(RAIZ + "regras-jogo.js");
const C = await import(RAIZ + "combos.js");
/* v9.234 (C1): o grimório entra porque o NASCIMENTO da magia de duração é
   provado com as magias de verdade, não com objetos inventados — quem decide
   se o campo nasce é a marca do catálogo, e a seção 16 a lê de lá. A catraca
   do CATÁLOGO (a regra, as dez exceções, a porta) mora em `teste-grimorio`,
   que é o território dela; aqui mora só o que o campo faz depois de nascer. */
const G = await import(RAIZ + "grimorio.js");
/* v9.235 (C2): o motor de combate entra de verdade, e não mais só como texto
   lido por regex. A seção 16 fechou o circuito do CAMPO (a magia marcada nasce
   segurada, é achada, é tirada) e terminou numa PONTE de fonte: "existe um
   teste de concentração para ele chamar". A seção 17 é o outro lado da ponte —
   o que esse teste DIZ ao jogador quando a magia cai. Isso é conta, e conta se
   prova chamando a função, não procurando o nome dela num arquivo. */
const CB = await import(RAIZ + "combate.js");
const { readFileSync } = await import("node:fs");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* v9.233 (P3): `ABSORCAO_DO_BUFF` e `absorverDano` entraram nesta lista — é a
   segunda metade da família defensiva, e as seções 13/14 a provam. A lista
   cresceu, nenhum nome saiu dela: as seções 1–12 leem exatamente o que liam. */
const {
  LIMITES_DO_EFEITO, BUFF_DA_HABILIDADE, EFEITO_DO_MILAGRE, EFEITO_DA_MAGIA,
  APLICA_UNIVERSAL, APLICA_NA_NOTA, ABSORCAO_DO_BUFF,
  efeitosDe, empilhar, retirar, efeitoDeBuff, efeitoDeMilagre, turnosDaMagia,
  efeitoDeMagia, efeitoEmConcentracao, quebrarConcentracao, buffsNaRolagem, notaDosBuffs,
  absorverDano,
  /* v9.237 (C3): `firmarEfeito` entra pela mesma porta das outras — a irmã de
     `empilhar` que conta quantas concentrações cabem. Nenhum nome saiu daqui:
     as seções 1–18 leem exatamente o que liam, e `empilhar` continua na lista
     porque a seção 19 o usa como CONTROLE (a regressão é provada contra ele,
     chamada por chamada, e não contra uma cópia da expectativa). */
  firmarEfeito,
} = E;

/* um herói mínimo: só o que o órgão dos efeitos olha */
const heroi = (extra = {}) => ({ nome: "Orin", classe: "Guerreiro", nivel: 5, efeitos: [], ...extra });
/* a ficha inteira, para quando a prova atravessa o canal do Mestre
   (`aplicarMudancas` mexe em bolsa, grupo e equipamento no mesmo passo) */
const fichaDoMestre = (extra = {}) => ({
  ...heroi(), vida: 30, vidaMax: 30, mana: 10, manaMax: 10, moedas: 5,
  atributos: {}, inventario: [], habilidades: [], grupo: [],
  equipamento: [], equipados: {}, condicoes: [], ...extra,
});
const nomes = (lista) => lista.map((e) => e && e.nome).join(",");
const inteiroPositivo = (n) => Number.isInteger(n) && n > 0;

sec("1. as tabelas — o número tem nome e a prova o lê de volta");
{
  const L = LIMITES_DO_EFEITO;
  t("o teto do Mestre é uma faixa coerente (bônus)", L.bonusMin <= L.bonusPadrao && L.bonusPadrao <= L.bonusMax);
  t("e o prazo também (turnos)", L.turnosMin <= L.turnosPadrao && L.turnosPadrao <= L.turnosMax);
  t("todos os seis são inteiros positivos", [L.bonusMin, L.bonusMax, L.bonusPadrao, L.turnosMin, L.turnosMax, L.turnosPadrao].every(inteiroPositivo));

  const B = BUFF_DA_HABILIDADE;
  t("o buff da habilidade tem divisor e piso utilizáveis", B.divisorDoCusto > 0 && B.forcaMinima >= 1 && inteiroPositivo(B.turnosPadrao));
  /* `aplica: "dano"` é de propósito: este buff levanta o GOLPE, não a
     rolagem — por isso NÃO pode ser um dos rótulos coringa */
  t("e o que ele levanta não é rótulo de rolagem", !APLICA_UNIVERSAL.includes(B.aplica));

  const M = EFEITO_DO_MILAGRE;
  t("o milagre vale para qualquer teste", APLICA_UNIVERSAL.includes(M.aplica));
  t("e dura mais que o buff de uma habilidade", M.turnosPadrao > B.turnosPadrao);
  t("com bônus padrão dentro do teto do Mestre", M.bonusPadrao <= L.bonusMax);

  const G = EFEITO_DA_MAGIA;
  t("a magia que dura não soma número nenhum", G.bonus === 0);
  t("a faixa longa é maior que a curta", G.turnosLongos > G.turnosCurtos);
  t("e ela vale para tudo (é estado, não atributo)", APLICA_UNIVERSAL.includes(G.aplica));

  t("APLICA_NA_NOTA é subconjunto de APLICA_UNIVERSAL", APLICA_NA_NOTA.every((x) => APLICA_UNIVERSAL.includes(x)));
  /* e é MENOR: a divergência portada como está — ver seção 9 */
  t("e é estritamente menor (divergência antiga, portada)", APLICA_NA_NOTA.length < APLICA_UNIVERSAL.length);
}

sec("2. duração — quantos turnos cada nascimento dá");
{
  const g = heroi();
  t("o buff sem prazo da condição cai no padrão da tabela",
    efeitoDeBuff({ nome: "Fúria", custo: 4 }, g).efeito.turnos === BUFF_DA_HABILIDADE.turnosPadrao);
  t("com prazo da condição, é o prazo da condição",
    efeitoDeBuff({ nome: "Fúria", custo: 4 }, g, 7).efeito.turnos === 7);
  /* turnos 0 é "condição sem prazo", não "condição instantânea": o `||`
     manda para o padrão, e é assim desde que a linha nasceu no App */
  t("prazo 0 é ausência de prazo, e cai no padrão",
    efeitoDeBuff({ nome: "Fúria", custo: 4 }, g, 0).efeito.turnos === BUFF_DA_HABILIDADE.turnosPadrao);

  t("o milagre sem prazo próprio cai no padrão do milagre",
    efeitoDeMilagre({ nome: "Graça" }).turnos === EFEITO_DO_MILAGRE.turnosPadrao);
  t("e com prazo próprio, manda o dele", efeitoDeMilagre({ nome: "Graça", turnos: 9 }).turnos === 9);
  /* ACHADO, e portado como está: o milagre usa `||`, não `??` — bônus 0 e
     prazo 0 caem no padrão em vez de valerem zero. Vindo do catálogo de
     milagres nunca chega zero; fica registrado para A3 decidir. */
  t("bônus 0 do milagre cai no padrão (é `||`, não `??`)",
    efeitoDeMilagre({ nome: "Graça", bonus: 0 }).bonus === EFEITO_DO_MILAGRE.bonusPadrao);

  t("a magia medida em horas dura a cena", turnosDaMagia("1 hora") === EFEITO_DA_MAGIA.turnosLongos);
  t("a magia medida em rodadas dura a luta", turnosDaMagia("3 rodadas") === EFEITO_DA_MAGIA.turnosCurtos);
  t("magia sem duração escrita dura a luta", turnosDaMagia(undefined) === EFEITO_DA_MAGIA.turnosCurtos);
  /* ACHADO: a régua da faixa longa é /hora/ SEM caixa alta — "1 Hora" no
     grimório cairia na faixa curta. Nenhum texto do catálogo escreve assim
     hoje; registrado, não consertado nesta etapa. */
  t("\"Hora\" com maiúscula NÃO casa a faixa longa (régua minúscula)",
    turnosDaMagia("1 Hora") === EFEITO_DA_MAGIA.turnosCurtos);

  const mg = efeitoDeMagia({ nome: "Invisibilidade", duracao: "1 hora", descricao: "some da vista" });
  t("a magia leva o mesmo número nos dois lugares (linha e ficha)", mg.turnos === mg.efeito.turnos);
  t("e o número é o da faixa longa", mg.turnos === EFEITO_DA_MAGIA.turnosLongos);
  t("a descrição vai junto para o Narrador", mg.efeito.descricao === "some da vista");

  /* ACHADO que a tabela deixa ver: o teto de LIMITES_DO_EFEITO vale só
     para o que o MESTRE pede (`efeitos_adicionar`); o que o próprio
     sistema faz nascer não passa por ele — a magia de uma hora dura mais
     que `turnosMax`. É como sempre foi; a prova existe para que a
     diferença entre os dois canais fique escrita. */
  t("o teto do Mestre não vale para o nascimento interno (magia longa o ultrapassa)",
    EFEITO_DA_MAGIA.turnosLongos > LIMITES_DO_EFEITO.turnosMax);

  /* PONTE — o canal do Mestre, esse sim, é podado pelos tetos da tabela */
  const msgs = [];
  const p = R.aplicarMudancas(fichaDoMestre(), { efeitos_adicionar: [{ nome: "Dádiva", bonus: 99, turnos: 99 }] }, msgs);
  t("o Mestre pedindo bônus alto é podado no teto", p.efeitos[0].bonus === LIMITES_DO_EFEITO.bonusMax);
  t("e o prazo alto também", p.efeitos[0].turnos === LIMITES_DO_EFEITO.turnosMax);
  const p2 = R.aplicarMudancas(fichaDoMestre(), { efeitos_adicionar: [{ nome: "Migalha", bonus: -5, turnos: 0 }] }, []);
  t("pedindo bônus negativo, sobe para o piso", p2.efeitos[0].bonus === LIMITES_DO_EFEITO.bonusMin);
  t("e prazo zero sobe para o piso", p2.efeitos[0].turnos === LIMITES_DO_EFEITO.turnosMin);
  const p3 = R.aplicarMudancas(fichaDoMestre(), { efeitos_adicionar: [{ nome: "Sopro" }] }, []);
  t("sem números, o Mestre recebe os padrões da tabela",
    p3.efeitos[0].bonus === LIMITES_DO_EFEITO.bonusPadrao && p3.efeitos[0].turnos === LIMITES_DO_EFEITO.turnosPadrao);
  t("efeito sem nome o canal recusa", R.aplicarMudancas(fichaDoMestre(), { efeitos_adicionar: [{ bonus: 2 }] }, []).efeitos.length === 0);
}

sec("3. decaimento — o relógio (tickEfeitos, em regras-jogo.js)");
{
  const p = heroi({ efeitos: [
    { nome: "Bênção", bonus: 2, turnos: 3 },
    { nome: "Fúria", bonus: 1, turnos: 1 },
    { nome: "Escudo", bonus: 2, turnos: 5 },
  ] });
  const r = R.tickEfeitos(p);
  t("cada resposta tira um turno de quem sobra", r.efeitos.find((e) => e.nome === "Bênção").turnos === 2);
  t("quem chega a zero se dissipa", !r.efeitos.some((e) => e.nome === "Fúria"));
  t("e o jogador lê o nome de quem foi", r.msgs.some((m) => /Fúria/.test(m) && /dissip/.test(m)));
  t("os outros mantêm a ordem", nomes(r.efeitos) === "Bênção,Escudo");
  t("o relógio não muta a lista de entrada", p.efeitos.length === 3 && p.efeitos[0].turnos === 3);
  t("nem reaproveita os objetos", r.efeitos[0] !== p.efeitos[0]);

  /* quantos tiques cada nascimento aguenta: a conta tem de bater com o
     prazo que a tabela deu, sem o número aparecer aqui */
  const quantosTiques = (efeito) => {
    let lista = [efeito], n = 0;
    while (lista.length && n < 200) { lista = R.tickEfeitos({ efeitos: lista }).efeitos; n++; }
    return n;
  };
  t("o buff da habilidade vive exatamente o prazo da tabela",
    quantosTiques(efeitoDeBuff({ nome: "Fúria", custo: 4 }, heroi()).efeito) === BUFF_DA_HABILIDADE.turnosPadrao);
  t("o milagre vive o prazo do milagre",
    quantosTiques(efeitoDeMilagre({ nome: "Graça" })) === EFEITO_DO_MILAGRE.turnosPadrao);
  t("a magia curta vive a faixa curta",
    quantosTiques(efeitoDeMagia({ nome: "Luz", duracao: "10 rodadas" }).efeito) === EFEITO_DA_MAGIA.turnosCurtos);
  t("a magia longa vive a faixa longa",
    quantosTiques(efeitoDeMagia({ nome: "Voo", duracao: "1 hora" }).efeito) === EFEITO_DA_MAGIA.turnosLongos);
  t("ninguém dura para sempre", quantosTiques({ nome: "Eterno", bonus: 1, turnos: 4 }) === 4);
}

sec("4. a pilha — o novo vence, e vai para o fim");
{
  const lista = [{ nome: "A", turnos: 2 }, { nome: "B", turnos: 2 }, { nome: "C", turnos: 2 }];
  t("num vazio, o novo é a lista", nomes(empilhar([], { nome: "A" })) === "A");
  const r = empilhar(lista, { nome: "B", turnos: 9 });
  t("o de mesmo nome sai e o novo entra no FIM", nomes(r) === "A,C,B");
  t("e o prazo reinicia (não acumula, não compara o maior)", r[2].turnos === 9);
  t("a ordem dos outros é preservada", r[0].nome === "A" && r[1].nome === "C");
  t("nome inédito só cresce a lista", nomes(empilhar(lista, { nome: "D" })) === "A,B,C,D");
  t("efeito sem nome não entra (não poderia ser retirado depois)", nomes(empilhar(lista, { bonus: 3 })) === "A,B,C");
  t("efeito nulo não entra", nomes(empilhar(lista, null)) === "A,B,C");
  t("relançar duas vezes não vira dois", empilhar(empilhar(lista, { nome: "B" }), { nome: "B" }).length === 3);

  t("retirar tira pelo nome", nomes(retirar(lista, "B")) === "A,C");
  t("retirar nome ausente não mexe em nada", nomes(retirar(lista, "Z")) === "A,B,C");
  t("retirar de lista vazia devolve vazia", retirar([], "B").length === 0);
}

sec("5. os dois casamentos — \"exato\" e \"solto\"");
{
  const duas = [{ nome: "Bênção" }, { nome: "bênção" }];
  /* o catálogo e o App comparam o nome EXATO; o canal do Mestre compara
     sem caixa, porque de lá o nome vem digitado por uma IA */
  t("no exato, Bênção e bênção coexistem", empilhar([{ nome: "Bênção" }], { nome: "bênção" }).length === 2);
  t("no solto, elas se fundem", empilhar([{ nome: "Bênção" }], { nome: "bênção" }, { casamento: "solto" }).length === 1);
  t("e quem fica é o novo, com a caixa do novo",
    empilhar([{ nome: "Bênção" }], { nome: "bênção" }, { casamento: "solto" })[0].nome === "bênção");
  t("exato é o padrão quando não se pede nada", empilhar([{ nome: "Bênção" }], { nome: "bênção" }).length === 2);
  t("exato é o padrão também com opções nulas", empilhar([{ nome: "Bênção" }], { nome: "bênção" }, null).length === 2);
  t("e com um objeto de opções vazio", empilhar([{ nome: "Bênção" }], { nome: "bênção" }, {}).length === 2);
  t("casamento desconhecido cai no exato", empilhar([{ nome: "Bênção" }], { nome: "bênção" }, { casamento: "torto" }).length === 2);

  t("retirar exato tira só a caixa pedida", nomes(retirar(duas, "Bênção")) === "bênção");
  t("retirar solto leva as duas", retirar(duas, "BÊNÇÃO", { casamento: "solto" }).length === 0);
  t("retirar solto com opções nulas volta ao exato", retirar(duas, "BÊNÇÃO", null).length === 2);

  /* PONTE — o canal do Mestre sempre usou o solto, e continua usando */
  const comB = fichaDoMestre({ efeitos: [{ nome: "Bênção", bonus: 2, turnos: 3 }] });
  const dobrou = R.aplicarMudancas(comB, { efeitos_adicionar: [{ nome: "bênção", bonus: 2, turnos: 3 }] }, []);
  t("o Mestre digitando com outra caixa NÃO cria duplicata", dobrou.efeitos.length === 1);
  const tirou = R.aplicarMudancas(comB, { efeitos_remover: ["BÊNÇÃO"] }, []);
  t("e removendo com outra caixa, tira mesmo assim", tirou.efeitos.length === 0);
}

sec("6. imutabilidade — nada que entra sai marcado");
{
  const lista = [{ nome: "A", turnos: 2 }, { nome: "B", turnos: 2 }];
  const antes = JSON.stringify(lista);
  const r = empilhar(lista, { nome: "B", turnos: 9 });
  t("empilhar devolve uma lista NOVA", r !== lista);
  t("e a de entrada fica idêntica em conteúdo", JSON.stringify(lista) === antes);
  t("e no comprimento", lista.length === 2);
  t("os efeitos que sobreviveram são os mesmos objetos (não há cópia à toa)", r[0] === lista[0]);

  const rr = retirar(lista, "A");
  t("retirar devolve uma lista NOVA", rr !== lista);
  t("e não toca a de entrada", JSON.stringify(lista) === antes && lista.length === 2);

  const p = heroi({ efeitos: [{ nome: "Voo", concentracao: true, turnos: 5 }, { nome: "Escudo", turnos: 2 }] });
  const antesP = JSON.stringify(p);
  const q = quebrarConcentracao(p, "Voo");
  t("quebrarConcentracao devolve uma ficha NOVA", q !== p);
  t("com uma lista NOVA", q.efeitos !== p.efeitos);
  t("e a ficha de entrada fica intacta", JSON.stringify(p) === antesP);
  t("o resto da ficha é preservado", q.nome === p.nome && q.classe === p.classe && q.nivel === p.nivel);

  const pers = heroi({ efeitos: [{ nome: "A" }] });
  const lidos = efeitosDe(pers);
  lidos.push({ nome: "intruso" });
  t("efeitosDe devolve lista própria — mexer nela não suja a ficha", pers.efeitos.length === 1);
}

sec("7. lixo — save antigo, ficha crua e buraco no meio não custam o turno");
{
  t("efeitosDe(null) é lista vazia", efeitosDe(null).length === 0);
  t("efeitosDe(undefined) é lista vazia", efeitosDe(undefined).length === 0);
  t("efeitosDe({}) é lista vazia", efeitosDe({}).length === 0);
  /* `= {}` no destructuring NÃO cobre `null` — o órgão trata explícito */
  t("efeitosDe({efeitos:null}) é lista vazia", efeitosDe({ efeitos: null }).length === 0);
  t("efeitosDe com `efeitos` que não é lista é lista vazia", efeitosDe({ efeitos: "Bênção" }).length === 0);
  t("efeitosDe filtra o buraco no meio", nomes(efeitosDe({ efeitos: [{ nome: "A" }, null, undefined, { nome: "B" }] })) === "A,B");

  t("empilhar em null devolve só o novo", nomes(empilhar(null, { nome: "A" })) === "A");
  t("empilhar em undefined idem", nomes(empilhar(undefined, { nome: "A" })) === "A");
  t("empilhar lixo em lixo devolve lista vazia", empilhar(null, null).length === 0);
  t("empilhar numa não-lista devolve lista vazia", empilhar("Bênção", null).length === 0);
  t("empilhar filtra o buraco da lista", nomes(empilhar([{ nome: "A" }, null], { nome: "B" })) === "A,B");
  t("retirar de null devolve lista vazia", retirar(null, "A").length === 0);
  t("retirar com nome nulo não estoura", retirar([{ nome: "A" }], null).length === 1);
  t("retirar solto com nome nulo não estoura", retirar([{ nome: "A" }], null, { casamento: "solto" }).length === 1);

  t("efeitoDeBuff(null, null) devolve efeito são",
    (() => { const r = efeitoDeBuff(null, null); return r && r.efeito && r.efeito.turnos > 0 && r.efeito.bonus >= BUFF_DA_HABILIDADE.forcaMinima; })());
  t("efeitoDeBuff com habilidade vazia ainda traz a frase", typeof efeitoDeBuff({}, null).extraEscopo === "string");
  t("efeitoDeMilagre(null) devolve efeito com prazo", efeitoDeMilagre(null).turnos === EFEITO_DO_MILAGRE.turnosPadrao);
  t("efeitoDeMilagre(undefined) idem", efeitoDeMilagre(undefined).bonus === EFEITO_DO_MILAGRE.bonusPadrao);
  t("turnosDaMagia(null) devolve a faixa curta", turnosDaMagia(null) === EFEITO_DA_MAGIA.turnosCurtos);
  t("turnosDaMagia de número não estoura", turnosDaMagia(3) === EFEITO_DA_MAGIA.turnosCurtos);
  t("efeitoDeMagia(null) devolve efeito são", efeitoDeMagia(null).efeito.turnos === EFEITO_DA_MAGIA.turnosCurtos);
  t("efeitoDeMagia({}) idem", efeitoDeMagia({}).turnos === EFEITO_DA_MAGIA.turnosCurtos);

  t("efeitoEmConcentracao(null) é null", efeitoEmConcentracao(null) === null);
  t("efeitoEmConcentracao({}) é null", efeitoEmConcentracao({}) === null);
  t("efeitoEmConcentracao({efeitos:null}) é null", efeitoEmConcentracao({ efeitos: null }) === null);
  t("efeitoEmConcentracao pula o buraco", efeitoEmConcentracao({ efeitos: [null, { nome: "Voo", concentracao: true }] }).nome === "Voo");
  t("quebrarConcentracao(null) devolve o que veio", quebrarConcentracao(null, "Voo") === null);
  t("quebrarConcentracao de ficha sem efeitos devolve lista vazia", quebrarConcentracao({ nome: "Orin" }, "Voo").efeitos.length === 0);

  t("buffsNaRolagem(null) é lista vazia", buffsNaRolagem(null, "Força").length === 0);
  t("buffsNaRolagem sem nome de atributo não estoura", buffsNaRolagem(heroi({ efeitos: [{ nome: "A" }] }), null).length === 1);
  t("notaDosBuffs(null) é texto vazio", notaDosBuffs(null, "Força") === "");
  t("notaDosBuffs({efeitos:null}) é texto vazio", notaDosBuffs({ efeitos: null }, "Força") === "");
}

sec("8. a conta do buff — a força sai do custo em PM");
{
  const B = BUFF_DA_HABILIDADE;
  const forcaEsperada = (custo) => Math.max(B.forcaMinima, Math.round((Number(custo) || B.custoPadrao) / B.divisorDoCusto));
  const g = heroi();
  for (const custo of [1, 2, 3, 4, 5, 8, 12]) {
    t(`custo ${custo} → força ${forcaEsperada(custo)} (fórmula lida da tabela)`,
      efeitoDeBuff({ nome: "X", custo }, g).efeito.bonus === forcaEsperada(custo));
  }
  t("sem custo, a habilidade vale o custo padrão da tabela",
    efeitoDeBuff({ nome: "X" }, g).efeito.bonus === forcaEsperada(B.custoPadrao));
  t("custo negativo não vira força negativa — o piso segura",
    efeitoDeBuff({ nome: "X", custo: -10 }, g).efeito.bonus === B.forcaMinima);
  t("custo que não é número cai no padrão",
    efeitoDeBuff({ nome: "X", custo: "muito" }, g).efeito.bonus === forcaEsperada(B.custoPadrao));

  t("o efeito leva o nome da habilidade", efeitoDeBuff({ nome: "Fúria de Batalha", custo: 4 }, g).efeito.nome === "Fúria de Batalha");
  t("e o que ele levanta vem da tabela", efeitoDeBuff({ nome: "X", custo: 4 }, g).efeito.aplica === B.aplica);

  /* O ESCOPO vem da natureza da habilidade (combos.js): a do catálogo
     manda, venha de que herói vier — Golpe Poderoso é do Guerreiro. */
  const gp = efeitoDeBuff({ nome: "Golpe Poderoso", custo: 2 }, heroi({ classe: "Mago" }));
  t("habilidade física do catálogo dá escopo físico, mesmo num mago", gp.efeito.escopo === "fisico");
  t("e a frase diz \"físico\" com o acento certo", gp.extraEscopo === ` · +${gp.efeito.bonus} de dano físico`);
  const rf = efeitoDeBuff({ nome: "Rajada de Fogo", custo: 3 }, heroi({ classe: "Guerreiro" }));
  t("habilidade mágica do catálogo dá escopo mágico, mesmo num guerreiro", rf.efeito.escopo === "magico");
  t("e a frase diz \"mágico\"", rf.extraEscopo === ` · +${rf.efeito.bonus} de dano mágico`);
  t("a frase traz a MESMA força do efeito", rf.extraEscopo.includes(`+${rf.efeito.bonus} `));
  const solta = efeitoDeBuff({ nome: "Improviso Sem Ficha", custo: 4 }, heroi({ classe: "Mago" }));
  t("habilidade fora do catálogo herda a escola do herói", solta.efeito.escopo === "magico");

  /* PONTE — `aplica: "dano"` levanta o GOLPE e não a rolagem */
  const comBuff = heroi({ efeitos: [gp.efeito] });
  t("o buff de dano NÃO soma na rolagem de atributo", R.bonusEfeito(comBuff, "Força") === 0);
  t("mas soma no golpe da mesma natureza", C.bonusDeDano(comBuff, { nome: "Investida" }).bonus === gp.efeito.bonus);
  t("e não soma no golpe da outra natureza", C.bonusDeDano(comBuff, { nome: "Rajada de Fogo" }).bonus === 0);
  t("e o jogador vê de onde veio", C.bonusDeDano(comBuff, { nome: "Investida" }).fontes.includes("Golpe Poderoso"));
}

/* ============================================================
   9. A DEFENSIVA NÃO SOMA — e o que somava continua somando (P1, v9.231)

   O ACHADO QUE FEZ ESTA SEÇÃO NASCER. A seção 8 acima crava o rótulo e a
   frase do buff com habilidades OFENSIVAS — "X", "Golpe Poderoso",
   "Rajada de Fogo", "Fúria". Ela continua inteira, e continua certa: o
   PADRÃO de `BUFF_DA_HABILIDADE` ainda é "dano", e nenhuma asserção dela
   mudou de lado. O que ela nunca mediu é o DESVIO — a habilidade cujo
   texto promete absorver ou proteger. Foi por isso que "Escudo Arcano"
   pôde prometer barreira na ficha e dizer "+1 de dano mágico" na linha
   que o jogador lê durante versões, sem uma prova ficar vermelha.

   Esta seção ACRESCENTA catraca; não inverte nenhuma.

   ONDE MORA CADA METADE. O acervo inteiro (as 12 classes, as subclasses,
   as especializações e o grimório) é varrido em `check-protecao.mjs`,
   que mede a CLASSIFICAÇÃO. Aqui mora o NÚMERO: o que soma, o que não
   soma, e — o dente que importa mais — o que continuava somando e tem de
   continuar. `bonusEfeito` (regras-jogo.js) trata `aplica` vazio como
   coringa universal; um rótulo novo podia ter virado coringa (todo save
   antigo somando em tudo) ou mudo (todo efeito do Mestre calado), e as
   duas regressões seriam silenciosas.
   ============================================================ */
sec("9. a defensiva não soma — e o que somava continua somando (P1)");
{
  const g = heroi();
  /* a ficha vem escrita à mão, com a descrição do catálogo: quem
     classifica é o TEXTO, e o texto é nome + descrição. */
  const ESCUDO = { nome: "Escudo Arcano", custo: 4, descricao: "Barreira que absorve o próximo dano." };
  const d = efeitoDeBuff(ESCUDO, g, undefined);

  t("a defensiva não nasce com o rótulo padrão da tabela", d.efeito.aplica !== BUFF_DA_HABILIDADE.aplica);
  t("e o rótulo dela está declarado fora do golpe", C.APLICA_FORA_DO_GOLPE.includes(d.efeito.aplica));
  t("a peneira do golpe a recusa", C.efeitoNoGolpe(d.efeito) === false);
  t("ela nasce sem força — a defensiva não soma número nenhum hoje", d.efeito.bonus === 0);
  t("a frase dela fala do corpo e não traz número", !/de dano/.test(d.extraEscopo) && d.extraEscopo.trim().length > 0);
  /* o PRAZO e o ESCOPO continuam saindo de onde sempre saíram: o desvio
     é no rótulo e na frase, não no relógio. */
  t("o prazo dela continua vindo da tabela", d.efeito.turnos === BUFF_DA_HABILIDADE.turnosPadrao);
  t("e o prazo da condição continua mandando quando existe", efeitoDeBuff(ESCUDO, g, 7).efeito.turnos === 7);
  t("e ela ainda carrega o escopo da habilidade", d.efeito.escopo === "magico");

  /* O NÚMERO. `bonus: 0` sozinho não prova a peneira — um efeito de
     proteção com força escrita (save mexido à mão, ou o dia em que a
     defensiva ganhar número) tem de continuar fora do golpe. É este
     efeito, e não o de cima, que prova que quem gateia é `aplica`. */
  const comForca = { nome: "Escudo Arcano", bonus: 3, turnos: 3, aplica: d.efeito.aplica, escopo: "magico" };
  const abrigado = heroi({ efeitos: [comForca] });
  t("proteção com força escrita NÃO entra em bonusDeDano", C.bonusDeDano(abrigado, { nome: "Bola de Fogo" }).bonus === 0);
  t("nem nas fontes que o jogador lê", C.bonusDeDano(abrigado, { nome: "Bola de Fogo" }).fontes.length === 0);
  /* o de arma tem de ser FÍSICO para a prova morder: `bonusDeArma` já
     descarta o que é mágico pelo escopo, e um escudo arcano sairia de lá
     zerado mesmo sem a peneira do rótulo — verde sem provar nada. */
  const abrigadoFisico = heroi({ efeitos: [{ nome: "Postura Defensiva", bonus: 3, turnos: 3, aplica: d.efeito.aplica, escopo: "fisico" }] });
  t("nem em bonusDeArma, nem quando a proteção é física", C.bonusDeArma(abrigadoFisico).bonus === 0);
  /* e não entra na lista dos IGNORADOS: dizer "Escudo Arcano não somou
     no golpe" seria o sistema falando do próprio rótulo (lei iv). */
  t("e nem na lista dos buffs ignorados", C.buffsIgnorados(abrigado, { nome: "Golpe Poderoso" }).length === 0);

  /* ---- O DENTE DA COMPATIBILIDADE: o que somava tem de continuar ----
     Três formas de efeito chegam aqui e NENHUMA passa pela tabela nova:
     o save antigo (sem `aplica`), o milagre (`aplica: "todos"`) e o canal
     do Mestre (`aplica` com nome de atributo). Se qualquer uma delas
     mudasse de número, P1 teria trocado uma mentira por uma regressão. */
  const SOMA = 2;
  const velho = { nome: "Vigor Antigo", bonus: SOMA, turnos: 3 };              /* save antigo: sem `aplica` */
  const milagre = { nome: "Graça", bonus: SOMA, turnos: 5, aplica: EFEITO_DO_MILAGRE.aplica };
  const doMestre = { nome: "Mão Firme", bonus: SOMA, turnos: 3, aplica: "Destreza" };

  for (const [rotulo, ef] of [["save antigo (sem `aplica`)", velho], ["milagre (`todos`)", milagre], ["canal do Mestre (`Destreza`)", doMestre]]) {
    const p = heroi({ efeitos: [ef] });
    t(`${rotulo} continua passando pela peneira do golpe`, C.efeitoNoGolpe(ef) === true);
    t(`${rotulo} continua somando ${SOMA} no golpe`, C.bonusDeDano(p, { nome: "Golpe Poderoso" }).bonus === SOMA);
    t(`${rotulo} continua somando ${SOMA} no golpe de arma`, C.bonusDeArma(p).bonus === SOMA);
  }
  /* A ROLAGEM (bonusEfeito, regras-jogo.js) — nada virou coringa, nada
     virou mudo. O save antigo e o milagre valem em qualquer atributo; o
     do Mestre vale no dele e só nele; a proteção não vale em nenhum,
     porque ela levanta o corpo, não a rolagem. */
  t("save antigo continua coringa na rolagem", R.bonusEfeito(heroi({ efeitos: [velho] }), "Força") === SOMA);
  t("milagre continua coringa na rolagem", R.bonusEfeito(heroi({ efeitos: [milagre] }), "Percepção") === SOMA);
  t("o do Mestre continua valendo no atributo dele", R.bonusEfeito(heroi({ efeitos: [doMestre] }), "Destreza") === SOMA);
  t("e continua NÃO valendo em outro atributo", R.bonusEfeito(heroi({ efeitos: [doMestre] }), "Força") === 0);
  t("a proteção não virou coringa de rolagem", R.bonusEfeito(abrigado, "Força") === 0);

  /* O PADRÃO NÃO SE MEXEU. A prova de que o desvio é desvio: uma
     habilidade que não promete abrigo nenhum sai daqui igual à seção 8. */
  const ofensiva = efeitoDeBuff({ nome: "Golpe Poderoso", custo: 4 }, g, undefined);
  t("quem não promete abrigo continua saindo com o rótulo da tabela", ofensiva.efeito.aplica === BUFF_DA_HABILIDADE.aplica);
  t("com a força de sempre", ofensiva.efeito.bonus === Math.max(BUFF_DA_HABILIDADE.forcaMinima, Math.round(4 / BUFF_DA_HABILIDADE.divisorDoCusto)));
  t("e com a frase de sempre", /\+\d+ de dano (físico|mágico)$/.test(ofensiva.extraEscopo));
}

sec("10. a nota da rolagem — a honestidade com o Narrador");
{
  const comAplica = (aplica, nome = "Bênção") => heroi({ efeitos: [{ nome, bonus: 2, turnos: 3, aplica }] });

  t("efeito do atributo entra na nota daquele atributo", buffsNaRolagem(comAplica("Força"), "Força").length === 1);
  t("e não entra na nota de outro atributo", buffsNaRolagem(comAplica("Força"), "Destreza").length === 0);
  t("a caixa não separa atributo de rótulo", buffsNaRolagem(comAplica("força"), "FORÇA").length === 1);
  t("efeito sem `aplica` entra em qualquer nota", buffsNaRolagem(comAplica(undefined), "Destreza").length === 1);
  t("efeito com `aplica` vazio também", buffsNaRolagem(comAplica(""), "Destreza").length === 1);
  t("o rótulo \"testes\" entra em qualquer nota", buffsNaRolagem(comAplica("testes"), "Destreza").length === 1);

  /* ============================================================
     O ACHADO DESTA SEÇÃO — e é COMPORTAMENTO ATUAL, de propósito.

     `APLICA_NA_NOTA` é menor que `APLICA_UNIVERSAL`: o rótulo "todos"
     SOMA no número (quem soma é `bonusEfeito`, em regras-jogo.js) mas
     NÃO é citado na frase que o Narrador recebe. É divergência antiga —
     nasceu na linha da nota no App e foi portada como estava, porque A2
     prometeu não mudar nada do que o jogador lê.

     A prova abaixo trava o comportamento ATUAL, não o desejado. Quando
     A3 decidir alinhar as duas réguas, é AQUI que a mudança aparece — e
     a linha ao lado, a que prova que o bônus soma, tem de continuar
     verde de qualquer jeito.
     ============================================================ */
  const todos = comAplica("todos", "Dádiva");
  t("[achado, portado] \"todos\" soma no número...", R.bonusEfeito(todos, "Destreza") === 2);
  t("[achado, portado] ...mas NÃO aparece na nota (A3 pode revisitar)", buffsNaRolagem(todos, "Destreza").length === 0);
  t("[achado, portado] e nem na nota do atributo que ele levanta", notaDosBuffs(todos, "Destreza") === "");
  t("já \"testes\" soma E aparece",
    R.bonusEfeito(comAplica("testes"), "Destreza") === 2 && buffsNaRolagem(comAplica("testes"), "Destreza").length === 1);

  t("sem buff nenhum, a nota é texto vazio", notaDosBuffs(heroi(), "Força") === "");
  t("com um buff, a nota o cita pelo nome", notaDosBuffs(comAplica("Força"), "Força") === " (inclui bônus de Bênção)");
  const dois = heroi({ efeitos: [{ nome: "Bênção", bonus: 2, aplica: "testes" }, { nome: "Foco", bonus: 1, aplica: "Força" }] });
  t("com dois, a nota os separa por vírgula", notaDosBuffs(dois, "Força") === " (inclui bônus de Bênção, Foco)");
  t("e na ordem da pilha", buffsNaRolagem(dois, "Força").map((e) => e.nome).join("|") === "Bênção|Foco");
  t("a nota começa com espaço (cola no fim da linha)", /^ \(/.test(notaDosBuffs(dois, "Força")));
  t("buffsNaRolagem pula o buraco da lista", buffsNaRolagem({ efeitos: [null, { nome: "A" }] }, "Força").length === 1);
}

sec("11. a concentração — o que o corpo segura");
{
  const p = heroi({ efeitos: [
    { nome: "Escudo", turnos: 3 },
    { nome: "Voo", turnos: 60, concentracao: true },
  ] });
  t("acha quem está sendo segurado", efeitoEmConcentracao(p).nome === "Voo");
  t("quem não segura nada devolve null", efeitoEmConcentracao(heroi({ efeitos: [{ nome: "Escudo" }] })) === null);
  t("concentracao falsa não conta", efeitoEmConcentracao(heroi({ efeitos: [{ nome: "Voo", concentracao: false }] })) === null);

  const q = quebrarConcentracao(p, "Voo");
  t("quebrada, a magia sai da ficha", !q.efeitos.some((e) => e.nome === "Voo"));
  t("e o resto dos efeitos fica", nomes(q.efeitos) === "Escudo");
  t("e não há mais nada em concentração", efeitoEmConcentracao(q) === null);
  /* a quebra usa o casamento EXATO — é a ficha do jogador, não o canal da IA */
  t("com outra caixa, não quebra (casamento exato)", quebrarConcentracao(p, "voo").efeitos.length === 2);
  t("quebrar um nome ausente não mexe em nada", quebrarConcentracao(p, "Fogo").efeitos.length === 2);
}

sec("12. ligado ao jogo — os quatro leitores do órgão");
{
  const src = (f) => readFileSync("../src/" + f, "utf8");
  const app = src("App.jsx");
  t("o App importa o órgão", /from "\.\/efeitos\.js"/.test(app));
  for (const nome of ["empilhar", "efeitoDeBuff", "efeitoDeMilagre", "efeitoDeMagia", "efeitoEmConcentracao", "quebrarConcentracao", "notaDosBuffs"]) {
    t(`o App importa ${nome}`, new RegExp(`import \\{[^}]*\\b${nome}\\b[^}]*\\} from "\\./efeitos\\.js"`).test(app));
  }
  const rg = src("regras-jogo.js");
  t("regras-jogo lê os tetos e a pilha do órgão",
    /import \{[^}]*LIMITES_DO_EFEITO[^}]*APLICA_UNIVERSAL[^}]*empilhar[^}]*retirar[^}]*\} from "\.\/efeitos\.js"/.test(rg));
  t("e não reescreveu a pilha à mão no canal do Mestre", /empilhar\(efeitos, \{ nome: ef\.nome/.test(rg));
  t("o elixir usa a mesma pilha", /import \{ empilhar \} from "\.\/efeitos\.js"/.test(src("pocoes.js")));
  t("e a relíquia também", /import \{ empilhar \} from "\.\/efeitos\.js"/.test(src("relicas.js")));
  /* P1 (v9.231): o buff da habilidade nasce no App, e é lá que a nota ao
     Narrador jura escola ("o bônus vale só para o que é físico"). Se a
     fiação não perguntar `efeitoNoGolpe`, a nota volta a jurar escola
     mágica para quem não dá dano nenhum — a mentira sai da linha do
     jogador e some dentro do prompt, onde ninguém a vê. */
  t("o App importa a peneira do golpe", /import \{[^}]*\befeitoNoGolpe\b[^}]*\} from "\.\/combos\.js"/.test(app));
  t("e pergunta a ela antes de jurar escola na nota do Narrador", /efeitoNoGolpe\(buff\.efeito\)/.test(app));
  /* v9.237 (C3): A ÂNCORA MUDOU DE ENDEREÇO, E O MOTIVO É A PRÓPRIA ETAPA.
     Ela exigia `empilhar(p.efeitos, buff.efeito)` — a pilha genérica, que só
     substitui por NOME IGUAL. C3 trocou este sítio pela porta que sabe de
     concentração (`firmarOuCeder` no App → `firmarEfeito` → `empilhar`),
     porque desde C2b este buff nasce concentrando e o herói acabava segurando
     duas magias ao mesmo tempo. Ou seja: a letra antiga passou a PROIBIR o
     conserto desta versão. A intenção é a mesma e ficou mais forte — o efeito
     continua nascendo por `efeitoDeBuff` e continua indo para a pilha, só que
     agora por uma porta que conta quantas o herói pode segurar. O controle
     negativo abaixo é o que impede o caminho velho de voltar em silêncio. */
  t("o efeito nasce por efeitoDeBuff e vai para a pilha que conta a concentração", /efeitoDeBuff\(h, pers, res\.cond\.turnos\)/.test(app) && /const fe = firmarOuCeder\(p, buff\.efeito\);/.test(app));
  t("e a pilha genérica não é mais o caminho deste sítio", !/empilhar\(p\.efeitos, buff\.efeito\)/.test(app));
  /* quem soma o golpe na arena também respeita a peneira — a metade que
     `check-protecao.mjs` não vê, porque ele não abre a arena. */
  t("a arena firma o buff pelo mesmo nascimento", /efeitoDeBuff\(hab, eu, undefined\)/.test(src("arena.js")));
}

/* ============================================================
   13 e 14 vêm DEPOIS da 12 ("ligado ao jogo") de propósito, e não por
   desleixo de ordem: renumerar as doze seções para encaixar a absorção no
   meio moveria dezenas de asserções que ninguém pediu para mover, e a lei da
   casa cobra um motivo escrito por asserção movida. Nenhuma foi. A 13 prova a
   REGRA (o módulo puro) e a 14 prova a FIAÇÃO, que é o mesmo par que a 9 e a
   12 formam para P1.
   ============================================================ */

sec("13. a absorção — o abrigo come o golpe e se desfaz (P3)");
{
  const A = ABSORCAO_DO_BUFF;

  /* ---- A TABELA, lida de volta ----
     Nenhum número abaixo é copiado à mão: a prova pergunta à tabela e
     confere a RELAÇÃO entre os campos. É a lei "se é número, é tabela" com
     a catraca que ela pede — mexer em `porPM` sem mexer no resto fica
     vermelho aqui, em vez de passar verde contra uma constante decorada. */
  t("a absorção tem família declarada, e é uma das cinco da tabela de P1",
    typeof A.familia === "string" && C.APLICACAO_DO_BUFF.some((l) => l.id === A.familia));
  t("a régua sai do custo em PM, e é positiva", inteiroPositivo(A.porPM));
  /* A DEFENSIVA COMPRA MAIS POR PM QUE A OFENSIVA, e isso tem motivo: um
     bônus de dano cobra em TODO golpe dos três turnos, o abrigo cobra uma
     vez só. Se as duas réguas se igualarem, a defensiva virou o troco.

     O NÚMERO EXATO, para a catraca poder morder: a ofensiva dá
     `1/divisorDoCusto` = 0,5 de força por PM; a defensiva dá `porPM` = 2.
     São QUATRO vezes, não duas — o comentário de `ABSORCAO_DO_BUFF` diz "o
     dobro da força ofensiva", e a frase está imprecisa quanto ao fator (ver
     o relato desta etapa). A prova crava a RELAÇÃO medida, não a palavra:
     se alguém corrigir a régua para o dobro de verdade, é aqui que a
     mudança de desenho aparece, em vez de passar despercebida. */
  const ofensivaPorPM = 1 / BUFF_DA_HABILIDADE.divisorDoCusto;
  t("a defensiva compra mais golpe aparado por PM do que a ofensiva soma", A.porPM > ofensivaPorPM);
  t("e a relação medida hoje é de 4 para 1 (ofensiva 0,5/PM · defensiva 2/PM)",
    A.porPM / ofensivaPorPM === 4, `mediu ${A.porPM / ofensivaPorPM}`);
  t("o piso e o teto são uma faixa utilizável", inteiroPositivo(A.minimo) && inteiroPositivo(A.teto) && A.minimo < A.teto);
  /* o custo padrão é o MESMO do buff ofensivo, e por um motivo que não é
     estético: relíquia, poção, grimório e o piloto chegam sem custo, e duas
     tabelas com padrões diferentes fariam a mesma habilidade valer números
     distintos conforme a porta por onde entrou. */
  t("e o custo padrão é o mesmo das duas metades", A.custoPadrao === BUFF_DA_HABILIDADE.custoPadrao);

  /* ---- O TETO 12: o dente que importa ----
     O número foi MEDIDO, não escolhido, e a medida está no comentário da
     tabela. Repito-a aqui como tabela local porque a suíte tem de poder
     dizer POR QUE 12 — sem isto, o dia em que alguém subir o teto para 20
     passa verde, e um abrigo que come a batida inteira apaga o combate:
     ninguém apanha, ninguém decide nada, a luta vira contabilidade. É a
     mesma lei que o comentário de `GUARDAS` escreveu para a defesa. */
  const GOLPE_MEDIDO = {
    /* arena, v9.233: mediana 13 e média 13,76 de dano por golpe que acerta,
       sobre duelistas de 24 a 36 PV; uma queda dura 4,85 golpes acertados. */
    medianaDoGolpe: 13, pvMinimoDoDuelista: 24,
  };
  t(`o teto (${A.teto}) fica ABAIXO de um golpe mediano (${GOLPE_MEDIDO.medianaDoGolpe}) — nenhum abrigo apaga uma batida`,
    A.teto < GOLPE_MEDIDO.medianaDoGolpe);
  t("e é o MAIOR número que ainda cabe nessa regra (12 é o teto, não 11)",
    A.teto === GOLPE_MEDIDO.medianaDoGolpe - 1);
  /* O OUTRO LADO DA MESMA MEDIDA, e ele está NA BORDA — vale escrito porque
     a margem é zero: 12 é EXATAMENTE metade do duelista mais frágil (24 PV).
     A prova crava a igualdade em vez de uma desigualdade folgada porque é
     isso que está medido: subir o teto um único ponto põe um abrigo de 2 PM
     valendo mais da metade da barra de quem é mais frágil na arena, e aí a
     defensiva deixa de ser um respiro e vira a decisão da luta inteira. */
  t(`o teto (${A.teto}) é no MÁXIMO metade do duelista mais frágil (${GOLPE_MEDIDO.pvMinimoDoDuelista} PV) — e hoje está na borda`,
    A.teto <= GOLPE_MEDIDO.pvMinimoDoDuelista / 2);
  t("e a borda é exata: hoje o teto é metade certa, sem folga nenhuma",
    A.teto === GOLPE_MEDIDO.pvMinimoDoDuelista / 2);

  /* ---- A FORÇA SAI DO CUSTO, e o teto morde de verdade ----
     `forcaDaAbsorcao` é privada de propósito (um segundo caminho para o
     mesmo número é a forma exata de as duas metades divergirem), então a
     prova entra pela única porta pública: `efeitoDeBuff`. */
  const abrigoDe = (custo) => efeitoDeBuff(
    { nome: "Véu de Bronze", custo, descricao: "Barreira que absorve o próximo dano." },
    heroi(), undefined,
  );
  t("2 PM compram o dobro em golpe aparado", abrigoDe(2).efeito.absorve === 2 * A.porPM);
  t("5 PM idem, a régua é linear", abrigoDe(5).efeito.absorve === 5 * A.porPM);
  /* o custo em que a régua encosta no teto, perguntado à tabela */
  const custoDoTeto = Math.ceil(A.teto / A.porPM);
  t(`a régua encosta no teto em ${custoDoTeto} PM`, abrigoDe(custoDoTeto).efeito.absorve === A.teto);
  t("e o teto MORDE: custo maior não compra mais nada", abrigoDe(custoDoTeto + 6).efeito.absorve === A.teto);
  t("nem um custo absurdo", abrigoDe(999).efeito.absorve === A.teto);
  /* o PISO: só é alcançável por custo fracionário, porque custo 1 já dá 2 e
     custo ausente cai no padrão (que dá 4). Ele guarda a porta de fora —
     relíquia e poção, que chegam com número escrito por outra mão. */
  t("o piso segura o custo fracionário", abrigoDe(0.1).efeito.absorve === A.minimo);
  t("custo ausente cai no padrão da tabela, não no piso",
    abrigoDe(undefined).efeito.absorve === A.custoPadrao * A.porPM);
  t("custo zero também", abrigoDe(0).efeito.absorve === A.custoPadrao * A.porPM);
  t("e custo negativo não vira abrigo negativo", abrigoDe(-5).efeito.absorve >= A.minimo);
  /* toda força possível fica dentro da faixa — a varredura do acervo inteiro
     mora em `check-protecao.mjs`; aqui é a régua, lá é a amostra real */
  t("nenhum custo de 0 a 60 sai da faixa da tabela",
    Array.from({ length: 61 }, (_, c) => abrigoDe(c).efeito.absorve)
      .every((n) => Number.isInteger(n) && n >= A.minimo && n <= A.teto));

  /* ---- O CONSUMO: tira dano de verdade, e o resto passa ---- */
  const comAbrigo = (n, nome = "Véu de Bronze") => heroi({ efeitos: [{ nome, absorve: n, turnos: 3 }] });

  {
    /* golpe MAIOR que o abrigo: sobra o resto, e o abrigo some */
    const r = absorverDano(comAbrigo(4), 10);
    t("golpe maior que o abrigo: o resto chega", r.dano === 6);
    t("e o abrigo levou exatamente o que tinha", r.absorvido === 4);
    t("e ele some da ficha — é de UMA batida", r.pers.efeitos.length === 0);
    t("a soma fecha: o que parou mais o que chegou é o golpe inteiro", r.absorvido + r.dano === 10);
  }
  {
    /* golpe MENOR: o abrigo come tudo e some DO MESMO JEITO. É o dente que
       separa um escudo de uma poupança — guardar o resto para o golpe
       seguinte é o que a ficha NÃO promete ("absorve o PRÓXIMO dano"). */
    const r = absorverDano(comAbrigo(9), 3);
    t("golpe menor que o abrigo: nada chega", r.dano === 0);
    t("o abrigo levou só o que havia (não inventa dano)", r.absorvido === 3);
    t("e some do mesmo jeito — escudo não é poupança", r.pers.efeitos.length === 0);
  }
  {
    const r = absorverDano(comAbrigo(5), 5);
    t("golpe do tamanho exato do abrigo: nada chega e o abrigo some",
      r.dano === 0 && r.absorvido === 5 && r.pers.efeitos.length === 0);
  }
  {
    /* UM por golpe, o MAIOR: dois escudos não estilhaçam na mesma batida, e
       deixá-los somar é o caminho curto para a absorção apagar um golpe
       inteiro — que é justamente o que o teto existe para impedir. */
    const dois = heroi({ efeitos: [{ nome: "Casca", absorve: 3 }, { nome: "Véu de Bronze", absorve: 7 }] });
    const r = absorverDano(dois, 20);
    t("com dois abrigos, só o MAIOR se gasta", r.absorvido === 7 && r.dano === 13);
    t("e o menor continua de pé para a próxima batida", nomes(r.pers.efeitos) === "Casca");
    t("e é o maior que assina a linha", /Véu de Bronze/.test(r.linha) && !/Casca/.test(r.linha));
  }
  {
    /* o efeito SEM `absorve` — a regressão zero fora da família, no módulo */
    const p = heroi({ efeitos: [{ nome: "Vigor", bonus: 2, turnos: 3 }] });
    const r = absorverDano(p, 7);
    t("efeito sem `absorve`: o dano sai intacto", r.dano === 7);
    t("nada foi absorvido", r.absorvido === 0);
    t("a linha é vazia — o sítio nem toca na ficha", r.linha === "");
    t("e a ficha volta a MESMA (identidade, não cópia)", r.pers === p);
    t("com a lista de efeitos intacta", p.efeitos.length === 1);
  }
  {
    /* `absorve: 0` e `absorve` não-numérico não são abrigo nenhum */
    t("`absorve: 0` não é abrigo", absorverDano(comAbrigo(0), 9).dano === 9);
    t("`absorve` negativo não é abrigo", absorverDano(comAbrigo(-4), 9).dano === 9);
    t("`absorve` em texto não vira número", absorverDano(heroi({ efeitos: [{ nome: "X", absorve: "muito" }] }), 9).dano === 9);
    /* mas `absorve` em texto NUMÉRICO conta: é por onde um save antigo ou o
       canal do Mestre entregaria o campo, e recusá-lo seria perder o abrigo
       de quem já o tinha */
    t("mas `absorve` em texto numérico conta", absorverDano(heroi({ efeitos: [{ nome: "X", absorve: "4" }] }), 9).dano === 5);
  }
  {
    /* DANO 0, NEGATIVO e NaN: nada é consumido. O abrigo tem de sobreviver
       a um golpe que não aconteceu — gastá-lo ali seria o jogador perder o
       que pagou por uma rolagem que errou. */
    const p = comAbrigo(4);
    for (const [rotulo, d] of [["zero", 0], ["negativo", -8], ["NaN", NaN], ["undefined", undefined], ["null", null], ["texto", "abc"]]) {
      const r = absorverDano(p, d);
      t(`dano ${rotulo}: nada é consumido`, r.absorvido === 0 && r.linha === "");
      t(`dano ${rotulo}: o abrigo continua de pé`, r.pers === p && p.efeitos.length === 1);
      t(`dano ${rotulo}: o dano devolvido é 0, nunca negativo`, r.dano === 0);
    }
  }
  {
    /* o dano chega arredondado e nunca negativo — quem soma PV do outro lado
       conta com inteiro (é o que `arena.js` e os sete sítios do App fazem) */
    const r = absorverDano(comAbrigo(4), 10.6);
    t("dano fracionário é arredondado antes de encontrar o abrigo", Number.isInteger(r.dano) && r.dano === 7);
  }

  /* ---- IMUTABILIDADE: é onde funções assim costumam mentir ---- */
  {
    const ef = { nome: "Véu de Bronze", absorve: 4, turnos: 3 };
    const p = heroi({ efeitos: [ef, { nome: "Vigor", bonus: 2 }] });
    const antes = JSON.stringify(p);
    const listaAntes = p.efeitos;
    const r = absorverDano(p, 10);
    t("a ficha de entrada sai da chamada idêntica", JSON.stringify(p) === antes);
    t("a lista de efeitos de entrada é a MESMA referência, com o mesmo tamanho",
      p.efeitos === listaAntes && p.efeitos.length === 2);
    t("o abrigo consumido continua na ficha de entrada", p.efeitos.includes(ef));
    t("e o efeito em si não foi marcado nem zerado", ef.absorve === 4);
    t("a ficha devolvida é outra", r.pers !== p);
    t("e a lista devolvida é outra", r.pers.efeitos !== listaAntes);
    t("o resto dos efeitos sobrevive na ficha nova", nomes(r.pers.efeitos) === "Vigor");
    /* o que NÃO é `efeitos` viaja inteiro: a função troca uma chave só */
    t("e o que não é `efeitos` atravessa sem toque", r.pers.nome === p.nome && r.pers.classe === p.classe);
  }
  {
    /* a lista sai LIMPA de buracos, como `empilhar` faz há uma versão */
    const p = heroi({ efeitos: [null, { nome: "Véu de Bronze", absorve: 4 }, undefined, { nome: "Vigor" }] });
    const r = absorverDano(p, 10);
    t("a lista devolvida sai sem os buracos da original", nomes(r.pers.efeitos) === "Vigor");
    t("e a original continua com os buracos dela", p.efeitos.length === 4);
  }

  /* ---- `null` E LIXO NÃO INVENTAM ABSORÇÃO ----
     `= {}` no destructuring NÃO cobre `null` explícito — é lei da casa e é
     o erro que esta família pagaria caro, porque ela mora no caminho de
     TODO dano que chega a um corpo. */
  for (const [rotulo, entrada] of [
    ["null", null], ["undefined", undefined], ["{}", {}],
    ["{efeitos: null}", { efeitos: null }],
    ["{efeitos: 7}", { efeitos: 7 }],
    ["{efeitos: \"x\"}", { efeitos: "x" }],
    ["{efeitos: [null, {}, 3]}", { efeitos: [null, {}, 3] }],
    ["{efeitos: []}", { efeitos: [] }],
    ["string solta", "nada"],
    ["número solto", 42],
  ]) {
    let r, estourou = false;
    try { r = absorverDano(entrada, 9); } catch { estourou = true; }
    t(`${rotulo} não estoura`, !estourou);
    t(`${rotulo} não absorve nada`, !estourou && r.absorvido === 0 && r.linha === "");
    t(`${rotulo} devolve o dano inteiro`, !estourou && r.dano === 9);
  }
  t("e sem argumento nenhum também não estoura",
    (() => { try { const r = absorverDano(); return r.dano === 0 && r.absorvido === 0; } catch { return false; } })());

  /* ---- A FRASE É GAMEPLAY, E É VOZ DE MUNDO ----
     Lei iv: o sistema não fala de si mesmo. A linha traz o NÚMERO (o
     jogador pagou PM por ele e tem de poder ver o que comprou) e NENHUM
     nome de mecanismo. O nome do abrigo é o da habilidade, que é ficção,
     não bastidor — por isso a prova usa "Véu de Bronze", que não carrega
     nenhuma das palavras proibidas dentro de si e não falseia o dente. */
  const PALAVRAS_DE_BASTIDOR = [
    "absor", "buff", "efeito", "guarda", "bônus", "bonus", "modificador",
    "aplica", "rótulo", "rotulo", "postura", "preset", "PM", "atributo",
  ];
  {
    const r = absorverDano(comAbrigo(4), 10);
    t("a linha existe quando algo foi aparado", r.linha.length > 0);
    t("e traz o número que parou", r.linha.includes("4"));
    t("e o número que chegou", r.linha.includes("6"));
    t("e chama o abrigo pelo nome da ficção", r.linha.includes("Véu de Bronze"));
    for (const p of PALAVRAS_DE_BASTIDOR) {
      t(`a linha não diz "${p}"`, !r.linha.toLowerCase().includes(p.toLowerCase()), r.linha);
    }
    /* e não narra contabilidade: nada de "(-0)", nada de fração */
    t("a linha não mostra número negativo", !/-\d/.test(r.linha));
  }
  {
    /* o caso em que nada chega: a linha NÃO escreve "0", porque zero entre
       parênteses é a mesa narrando contabilidade em vez de ficção */
    const r = absorverDano(comAbrigo(9), 3);
    t("quando nada chega, a linha diz isso por palavra e não por zero",
      r.linha.length > 0 && !/\b0\b/.test(r.linha));
    for (const p of PALAVRAS_DE_BASTIDOR) {
      t(`a linha do golpe inteiro aparado não diz "${p}"`, !r.linha.toLowerCase().includes(p.toLowerCase()), r.linha);
    }
  }
  {
    /* abrigo sem nome (save estranho, canal do Mestre) ainda produz uma
       frase de mundo — não um `undefined` na tela do jogador */
    const r = absorverDano(heroi({ efeitos: [{ absorve: 3 }] }), 10);
    t("abrigo sem nome não escreve `undefined` na linha", !/undefined/.test(r.linha));
    t("e ainda assim fala como mundo", r.linha.length > 0);
  }

  /* ---- A PORTA DO NASCIMENTO: só a família `absorve` ganha número ----
     As outras quatro linhas de `APLICACAO_DO_BUFF` prometem outra coisa
     (meio golpe, um chão de PV, um golpe que erra) e cada uma é a sua
     própria etapa. Enquanto não forem, elas saem daqui SEM o campo. */
  {
    const d = abrigoDe(4);
    t("a defensiva da família `absorve` nasce com o campo", inteiroPositivo(d.efeito.absorve));
    t("e continua sem força de golpe (P1 não foi desfeito)", d.efeito.bonus === 0);
    t("e continua fora do golpe", C.efeitoNoGolpe(d.efeito) === false);
    /* a frase do nascimento também é gameplay: diz o número comprado */
    t("a frase do nascimento anuncia o número comprado", d.extraEscopo.includes(String(d.efeito.absorve)));
    t("e não promete dano", !/de dano/.test(d.extraEscopo));
    /* e o efeito recém-nascido, posto numa ficha, absorve o que prometeu */
    t("e o que ela promete é o que ela apara",
      absorverDano(heroi({ efeitos: [d.efeito] }), 30).absorvido === d.efeito.absorve);
  }
  {
    /* a OFENSIVA não ganhou campo nenhum — regressão zero fora da família */
    const of = efeitoDeBuff({ nome: "Golpe Poderoso", custo: 4 }, heroi(), undefined);
    t("a ofensiva não nasce com `absorve`", of.efeito.absorve === undefined);
    t("e não apara nada", absorverDano(heroi({ efeitos: [of.efeito] }), 10).dano === 10);
    /* o milagre e a magia de duração idem: nenhum passa pela tabela nova */
    t("o milagre não nasce com `absorve`", efeitoDeMilagre({ nome: "Graça" }, "d").absorve === undefined);
    t("a magia de duração não nasce com `absorve`", efeitoDeMagia({ nome: "Voo" }).efeito.absorve === undefined);
    t("e nenhum dos dois apara golpe",
      absorverDano(heroi({ efeitos: [efeitoDeMilagre({ nome: "Graça" }, "d"), efeitoDeMagia({ nome: "Voo" }).efeito] }), 10).dano === 10);
  }
  {
    /* as OUTRAS QUATRO famílias defensivas continuam sem número — o dia em
       que uma delas ganhar o campo, é aqui que a etapa aparece */
    const outras = C.APLICACAO_DO_BUFF.filter((l) => l.id !== A.familia);
    t("a tabela de P1 tem mais de uma família (a prova não é vazia)", outras.length > 0);
    for (const l of outras) {
      const ef = { nome: "Promessa", bonus: 0, turnos: 3, aplica: l.aplica };
      t(`a família "${l.id}" continua sem aparar golpe`, absorverDano(heroi({ efeitos: [ef] }), 10).dano === 10);
    }
  }

  /* ---- A PILHA CONTINUA VALENDO PARA O ABRIGO ----
     Relançar o escudo não acumula dois: o novo vence, como todo efeito. */
  {
    const velho = { nome: "Véu de Bronze", absorve: 4, turnos: 3 };
    const novo = { nome: "Véu de Bronze", absorve: 8, turnos: 3 };
    const lista = empilhar([velho], novo);
    t("relançar o abrigo não acumula dois", lista.length === 1);
    t("e quem fica é o novo", lista[0].absorve === 8);
    t("e é o número do novo que apara", absorverDano(heroi({ efeitos: lista }), 30).absorvido === 8);
  }
}

sec("14. o abrigo está ligado ao jogo — a porta única e os sete sítios (P3)");
{
  /* A LIÇÃO DE R4: a âncora mede a DEFINIÇÃO *e* o sítio de chamada. Um
     helper do `App.jsx` é invisível ao `teste-ligacao`, que só conta
     leitores de export — sem estas âncoras, os sete sítios podem sumir num
     refator e a suíte inteira fica verde com a proteção morta outra vez,
     que é exatamente a doença que a Fase P veio fechar. */
  const { readFileSync } = await import("node:fs");
  const APP = readFileSync("../src/App.jsx", "utf8");
  const ARENA = readFileSync("../src/arena.js", "utf8");

  t("o App importa `absorverDano` do órgão",
    /import \{[^}]*\babsorverDano\b[^}]*\} from "\.\/efeitos\.js"/.test(APP));
  t("e existe UMA porta só, com o nome do dono como terceiro argumento",
    /const passarPeloAbrigo = \(quem, dano, nome = ""\) => \{/.test(APP));
  t("e quem decide lá dentro é o módulo, não o App",
    /const ab = absorverDano\(quem, dano\);/.test(APP));
  /* A LEI DO TURNO: um órgão que estoura não pode derrubar a cena, e o
     `catch` tem de devolver o que ENTROU, byte a byte — um `catch` que
     devolvesse `{}` ou zerasse o dano seria pior que o estouro. */
  t("a porta única cala em vez de custar o turno, e devolve o que entrou",
    /catch \(e\) \{ calou\("abrigo", e\); return \{ pers: quem, dano, linha: "" \}; \}/.test(APP));

  /* A CONTAGEM. Sete sítios, e o número é a lei: herói na rodada,
     companheiro na rodada, `sofrerNaPele`, as duas oportunidades, o fogo
     amigo e a armadilha. Se um sumir, fica vermelho; se nascer um oitavo
     sem passar por aqui, também — e é esse o ponto, porque um sítio novo
     que chame `absorverDano` direto perde o try/catch e o nome do dono. */
  const SITIOS_DO_ABRIGO = 7;
  const quantos = (APP.match(/passarPeloAbrigo\(/g) || []).length;
  t(`a porta única é usada em exatamente ${SITIOS_DO_ABRIGO} sítios`, quantos === SITIOS_DO_ABRIGO, `achou ${quantos}`);
  t("e nenhum sítio do App chama o módulo por fora da porta",
    (APP.match(/absorverDano\(/g) || []).length === 1);

  /* A ORDEM NA RODADA: o abrigo é o ÚLTIMO da fila (amortecer → repartir →
     abrigo), porque ele se gasta contra o que de fato chega ao corpo. Se
     ele subir na fila, passa a comer dano que a invocação teria repartido,
     e o jogador paga o escudo duas vezes. */
  const iRepartir = APP.indexOf("repartirDano({ ...persTracos");
  const iAbrigo = APP.indexOf("passarPeloAbrigo(persTracos");
  t("na rodada do herói, repartir e abrigo existem os dois", iRepartir > 0 && iAbrigo > 0);
  t("e o abrigo vem DEPOIS de repartir — ele apara o que chega ao corpo", iRepartir < iAbrigo);

  /* O PREÇO DO ESFORÇO: dano auto-infligido não gasta o abrigo, porque não
     há nada chegando para um escudo encontrar. A queda NÃO entra na
     exceção — cair é o chão batendo em você. */
  t("o sítio do esforço desliga o abrigo por parâmetro com nome", /abriga: false,/.test(APP));
  t("e o parâmetro nasce LIGADO, para que o padrão seja proteger",
    /abriga = true \} = \{\}\) => \{/.test(APP));
  t("e ele é consultado antes de gastar o abrigo", /if \(abriga && perdeu > 0\) \{/.test(APP));
  /* UMA VEZ SÓ: a exceção é do esforço, não de um sítio qualquer que ache
     conveniente não gastar a proteção do jogador. A âncora leva a VÍRGULA
     de propósito — `abriga: false` sem ela também casa com o comentário que
     explica o sítio, logo acima, e a prova contaria 2 medindo texto morto. */
  t("e a exceção é usada UMA vez só no App inteiro",
    (APP.match(/abriga: false,/g) || []).length === 1);

  /* A ARENA consome pelo mesmo módulo — é o leitor de produção que faz
     `absorverDano` não nascer órfã. */
  t("a arena importa o mesmo órgão", /import \{[^}]*\babsorverDano\b[^}]*\} from "\.\/efeitos\.js"/.test(ARENA));
  t("e o abrigo morde no ALVO, não em quem bate", /const ab = absorverDano\(outro, dano\);/.test(ARENA));
  /* escrever a lista de volta é o que GASTA o abrigo — sem esta linha ele
     absorveria uma vez por golpe, para sempre. É a mesma falha que a Fase A
     encontrou no buff da arena, e ela não pode renascer aqui. */
  t("e a arena escreve a ficha de volta — é isso que gasta o abrigo",
    /outro\.efeitos = ab\.pers\.efeitos;/.test(ARENA));
  t("e o PV cai pelo dano JÁ aparado, não pelo original",
    /outro\.vida = Math\.max\(0, outro\.vida - ab\.dano\);/.test(ARENA));
}

/* ============================================================
   15. A OUTRA METADE DA PORTA: O ABRIGO NASCE, E O RELÓGIO CONTA (P3)

   A SEÇÃO 14 PROVA O CONSUMO; esta prova o NASCIMENTO. Enquanto as duas não
   andam juntas o órgão é meia coisa, e foi assim que P3 achou o furo em Uma
   Vida: `buffDeCompanheiro` (`App.jsx`) aplicava CONDIÇÃO e só condição —
   `efeitoDeBuff` nunca era chamado e `comp.efeitos` nunca era escrito. O
   piloto ESCOLHIA o abrigo (P2 lhe deu olhos), a mesa CONSUMIA abrigo (os
   sete sítios da seção 14) e o abrigo NUNCA NASCIA no grupo. A classificação
   inteira de P1 passava ao largo do companheiro, e o efeito medido em Uma
   Vida era ZERO.

   POR QUE ESTAS ÂNCORAS, E POR QUE AQUI. Tudo o que esta seção mede é `const`
   local do `App.jsx` — INVISÍVEL ao `teste-ligacao`, que só conta leitores de
   export. Apagar hoje a linha do `efeitoDeBuff` deixa a casa inteira verde: é
   o `mexerNaReviravolta()` de R4 outra vez, e a lição de R4 é a que esta
   seção aplica — a âncora mede a DEFINIÇÃO *e* o sítio de chamada, e conta
   ocorrências em vez de perguntar "existe?", para o comentário que explica o
   sítio não passar por sítio.

   AS TRÊS COISAS QUE PODEM SUMIR EM SILÊNCIO:
   1. o nascimento (`efeitoDeBuff` + `empilhar` em `comp.efeitos`);
   2. o irmão no relógio — `tickEfeitos` tinha UM chamador e só sobre o
      herói; sem o laço do grupo o abrigo do companheiro atravessa a porta da
      luta e come o primeiro golpe da luta seguinte, inclusive depois de
      carregar o save (é o irmão exato do que P2 fiou para a guarda);
   3. a recusa de P1 — só a absorção fala na tela, porque "+N de dano" no
      companheiro seria anunciar número que ninguém lê (`turnoDosCompanheiros`
      não toca em `efeitos`).
   ============================================================ */
sec("15. o abrigo NASCE no companheiro, e o relógio do grupo conta (P3)");
{
  const { readFileSync } = await import("node:fs");
  const APP = readFileSync("../src/App.jsx", "utf8");
  const quantas = (rx) => (APP.match(rx) || []).length;

  /* ---------------- A LIÇÃO DE R4: DEFINIÇÃO *E* SÍTIO ----------------
     Uma âncora só na definição fica verde com o helper órfão; uma só no
     sítio fica verde com o helper vazio. As duas juntas é que fecham. */
  t("`buffDeCompanheiro` existe — a definição",
    quantas(/const buffDeCompanheiro = \(pers, ac\) => \{/g) === 1);
  t("e é CHAMADA no turno do grupo — o sítio",
    quantas(/buffDeCompanheiro\(persAtual, ac\)/g) === 1);

  /* ---------------- 1. O NASCIMENTO ----------------
     A âncora leva os três argumentos de propósito. `efeitoDeBuff` aparece no
     comentário que explica este sítio e também no caminho do herói
     (`aplicarBuffDeHabilidade`); só a FORMA COMPLETA da chamada separa o
     código do texto que fala sobre ele, e é por isso que a conta é `=== 1` e
     não `> 0`. */
  t("o abrigo do companheiro NASCE pela porta única (`efeitoDeBuff`)",
    quantas(/efeitoDeBuff\(ac\.habilidade,\s*comp,\s*res\.cond\.turnos\)/g) === 1);
  /* v9.237 (C3): MESMO MOVIMENTO DE ENDEREÇO, PELO MESMO MOTIVO. A âncora
     pedia `empilhar(g.efeitos, buff.efeito)`; o companheiro passou a firmar
     pela porta que conta a concentração, e `fe.pers` é o companheiro NOVO
     inteiro, já com a pilha certa. A intenção — o efeito entra em
     `comp.efeitos` por pilha, nunca por atribuição solta — sobreviveu, e veio
     com o teto de "uma de cada vez" junto. */
  t("e entra em `comp.efeitos` pela pilha que conta a concentração, não por atribuição solta",
    quantas(/const fe = firmarOuCeder\(comp,\s*buff\.efeito,\s*ac\.companheiro\);/g) === 1);
  t("e a pilha genérica não é mais o caminho deste sítio",
    quantas(/empilhar\(g\.efeitos,\s*buff\.efeito\)/g) === 0);
  /* O EFEITO FICA EM QUEM CONJUROU, mesmo quando a condição se espalha —
     o mesmo que o herói já faz. Sem esta guarda, um abrigo por companheiro
     no grupo inteiro seria três escudos na mesma pele: o número crescendo
     sem teto que `ABSORCAO_DO_BUFF` existe para impedir. */
  /* v9.237 (C3): a mesma guarda, no endereço novo. O que ela protege não
     mudou — um abrigo por companheiro no grupo inteiro seriam três escudos
     na mesma pele —, mudou só a forma da atribuição: `fe.pers` no lugar do
     objeto montado à mão. */
  t("e vai para QUEM conjurou, não para o grupo inteiro",
    /g\.nome === ac\.companheiro \? fe\.pers : g\)\)/.test(APP));
  /* LEI "nunca pode custar o turno": fiação nova no App entra em try/catch
     com `calou`. Um abrigo que estoura não pode derrubar a cena. */
  t("e a fiação nova cala em vez de custar o turno",
    quantas(/calou\("abrigo-do-companheiro",\s*e\)/g) === 1);

  /* ---------------- 3. A RECUSA DE P1, NA TELA ----------------
     `efeitoDeBuff` devolve bônus de dano também, e em Uma Vida ninguém o lê
     no companheiro. A cláusula que vai à tela é a do `absorve` e só ela —
     a mesma recusa de P1, que tirou o "+2 de dano mágico" do Escudo Arcano.
     A âncora prende o NÚMERO ao TEXTO: é o `> 0` que decide a frase. */
  t("só a absorção fala na tela — o bônus de dano do companheiro fica mudo",
    quantas(/absorve\)\s*\|\|\s*0\)\s*>\s*0\)\s*extraAbrigo\s*=\s*buff\.extraEscopo/g) === 1);

  /* O RAMO "aliados" ESPALHA CONDIÇÃO E NÃO ESPALHA EFEITO — e a prova é
     recortada DENTRO de `buffDeCompanheiro`, porque `aplicarBuffDeHabilidade`
     (o caminho do herói) tem um ramo de mesmo nome algumas centenas de linhas
     acima, e medir o arquivo inteiro leria o ramo errado.
     A prova é de AUSÊNCIA, e ausência mente quando o bloco some junto: por
     isso ela exige primeiro que o ramo EXISTA e espalhe condição. */
  const DEF = "const buffDeCompanheiro = (pers, ac) => {";
  const corpo = APP.slice(APP.indexOf(DEF), APP.indexOf("\n  };", APP.indexOf(DEF)));
  const ramoAliados = corpo.match(/if \(port\.alvo === "aliados"\) \{[\s\S]*?\n    \} else \{/);
  t("o ramo \"aliados\" do companheiro existe e espalha CONDIÇÃO",
    !!ramoAliados && /condicoes\s*:/.test(ramoAliados[0]));
  t("e NÃO espalha efeito — o abrigo não se multiplica pelo grupo",
    !!ramoAliados && !/efeitos\s*:/.test(ramoAliados[0]));

  /* ---------------- 2. O IRMÃO NO RELÓGIO ----------------
     `tickEfeitos` é export de `regras-jogo.js` e tinha UM chamador no App.
     As duas âncoras são o par: some o do herói e o órgão morre; some o do
     grupo e o abrigo do companheiro vira permanente — e é a segunda que
     nenhuma outra prova pega. */
  t("o relógio do HERÓI continua onde estava",
    quantas(/const \{ efeitos, msgs: msgsTick \} = tickEfeitos\(pers\)/g) === 1);
  t("e nasceu o IRMÃO: o relógio corre sobre o grupo também",
    quantas(/const tg = tickEfeitos\(g\)/g) === 1);
  /* tique que não escreve de volta é tique que não conta: a lista nova tem
     de voltar para a ficha do companheiro, senão o prazo roda em cópia. */
  t("e o prazo do grupo é ESCRITO de volta na ficha",
    /return \{ \.\.\.g, efeitos: tg\.efeitos \};/.test(APP)
    && /pers = \{ \.\.\.pers, grupo: grupoComPrazo \};/.test(APP));
  t("e o relógio do grupo também cala em vez de custar o turno",
    quantas(/calou\("prazo-do-efeito-do-grupo",\s*e\)/g) === 1);

  /* MORAM NO MESMO RELÓGIO, e a ordem prova isso: herói, grupo e só então as
     condições. Se o laço do grupo migrar para o relógio de RODADAS do revide,
     o efeito do companheiro passa a vencer só em combate — e fora da luta o
     abrigo fica de pé para sempre. A âncora é a POSIÇÃO, que é o que o
     comentário do App promete por escrito. */
  const iHeroi = APP.indexOf("const { efeitos, msgs: msgsTick } = tickEfeitos(pers)");
  const iGrupo = APP.indexOf("const tg = tickEfeitos(g)");
  const iCond = APP.indexOf("const t = tickCondicoes(pers.condicoes)");
  t("os três relógios existem no mesmo passo do turno", iHeroi > 0 && iGrupo > 0 && iCond > 0);
  t("e a ordem é herói → grupo → condições, no mesmo bloco",
    iHeroi < iGrupo && iGrupo < iCond, `${iHeroi} / ${iGrupo} / ${iCond}`);
}

/* ============================================================
   16. A CONCENTRAÇÃO NASCE E VIAJA — o campo que faltava no meio (C1, v9.234)

   Entra DEPOIS da 15 pelo mesmo motivo escrito no cabeçalho de 13/14:
   renumerar as quinze seções para encaixar esta moveria dezenas de asserções
   que ninguém pediu para mover, e a lei da casa cobra um motivo escrito por
   asserção movida. Nenhuma foi — a seção 11 ("a concentração — o que o corpo
   segura") continua inteira e continua certa, e esta não inverte nada dela.

   O QUE A 11 NUNCA MEDIU. Ela prova o CONSUMIDOR: dado um efeito que já traz
   `concentracao: true`, `efeitoEmConcentracao` o acha e `quebrarConcentracao`
   o tira. Os efeitos daquela seção são escritos à mão dentro do teste. O que
   nenhuma prova desta casa media era o MEIO: nada, em lugar nenhum, PUNHA o
   campo num efeito de verdade. A promessa estava escrita dos dois lados —
   `testeConcentracao` em combate.js, a fiação no App — e o herói segurava
   Invisibilidade, apanhava, e não havia o que perder.

   Por isso esta seção prova o CIRCUITO, e não o campo: a magia marcada vira
   efeito, o efeito é achado pelo consumidor, e a quebra o tira da ficha. Um
   campo que existe e não viaja não é mecânica — é decoração de save.
   ============================================================ */
sec("16. a concentração nasce e viaja — o campo que faltava no meio (C1)");
{
  const { MAGIAS, magiaPorNome, exigeConcentracao } = G;

  /* A RÉGUA, em tabela. `funcoesDaPorta` é a lista que o App usa para decidir
     que uma magia vira EFEITO com prazo; os dois números são o alcance REAL
     da etapa, medido. Ampliar a lista no App sem passar por aqui muda quantas
     magias ganham (ou não) o campo, e é isso que estes números travam. */
  const MEDIDA_DA_PORTA = {
    funcoesDaPorta: ["invisibilidade", "voo", "luz"],
    magiasQueChegam: 4,
    dasQuaisConcentram: 3,
    /* ZERO CONTINUA SENDO A LEI, mas de UM nascimento só (v9.236 · C2b).
       C1 escreveu aqui "habilidade ou milagre", e a medição de C2 desmentiu a
       primeira metade: 8 das 148 habilidades de classe SÃO magia do catálogo
       pelo nome, e 5 concentram — havia tabela de onde perguntar, e era o
       grimório. `efeitoDeBuff` pergunta desde C2b (a prova está na seção 18);
       `efeitoDeMilagre` continua mudo, e continua por prova, porque para ele a
       frase de C1 segue inteira: não há tabela de milagre nesta casa que
       declare concentração, e inventá-la no nascimento seria pôr no efeito um
       número que nenhuma régua sustenta. */
    tetoDeNascimentosMudosComChave: 0,
  };

  const temChave = (ef) => Object.prototype.hasOwnProperty.call(ef || {}, "concentracao");

  /* ---------------- NASCIMENTO 3: a magia marcada nasce com o campo ------ */
  const inv = efeitoDeMagia(magiaPorNome("Invisibilidade"));
  t("magia MARCADA nasce com o campo", inv.efeito.concentracao === true);
  t("e o resto do efeito é o de sempre (regressão zero)",
    inv.efeito.nome === "Invisibilidade" && inv.efeito.bonus === EFEITO_DA_MAGIA.bonus
    && inv.efeito.aplica === EFEITO_DA_MAGIA.aplica && inv.turnos === inv.efeito.turnos);

  const luz = efeitoDeMagia(magiaPorNome("Luz do Dia"));
  t("magia NÃO marcada nasce sem a chave", !temChave(luz.efeito));
  /* a chave ausente e a chave `false` são coisas diferentes no save e em toda
     comparação de igualdade — é o mesmo cuidado que `absorve` teve na v9.233 */
  t("e ausente de verdade, não `false` escrito", luz.efeito.concentracao === undefined);
  t("mas ela continua sendo magia de duração, com o prazo de sempre",
    luz.turnos === EFEITO_DA_MAGIA.turnosLongos);

  /* ---------------- A VARREDURA: as 85, uma a uma ---------------------- */
  const marcadaSemCampo = [], naoMarcadaComChave = [];
  for (const m of MAGIAS) {
    const { efeito } = efeitoDeMagia(m);
    if (m.concentracao && efeito.concentracao !== true) marcadaSemCampo.push(m.nome);
    if (!m.concentracao && temChave(efeito)) naoMarcadaComChave.push(m.nome);
  }
  t(`as ${MAGIAS.length} do catálogo nascem de acordo com a própria marca`,
    marcadaSemCampo.length === 0 && naoMarcadaComChave.length === 0,
    [...marcadaSemCampo.map((n) => `${n} perdeu o campo`), ...naoMarcadaComChave.map((n) => `${n} ganhou de graça`)].join(" | "));
  /* e o nascimento responde à MESMA régua que a ficha do Mestre imprime: se
     `efeitoDeMagia` e `exigeConcentracao` divergirem, o jogador lê uma coisa
     na ficha e carrega outra na ficha de efeitos */
  t("e concordam com a porta única do grimório",
    MAGIAS.every((m) => (efeitoDeMagia(m).efeito.concentracao === true) === exigeConcentracao(m)));

  /* ---------------- LIXO: nada inventa concentração -------------------- */
  t("efeitoDeMagia(null) nasce sem a chave", !temChave(efeitoDeMagia(null).efeito));
  t("efeitoDeMagia(undefined) idem", !temChave(efeitoDeMagia(undefined).efeito));
  t("efeitoDeMagia({}) idem", !temChave(efeitoDeMagia({}).efeito));
  t("efeitoDeMagia(\"\") idem", !temChave(efeitoDeMagia("").efeito));
  t("magia com `concentracao: false` explícito não ganha a chave",
    !temChave(efeitoDeMagia({ nome: "Tocha", duracao: "1 hora", concentracao: false }).efeito));
  t("nem com `concentracao: 0`", !temChave(efeitoDeMagia({ nome: "Tocha", concentracao: 0 }).efeito));
  t("nem com `concentracao: \"\"`", !temChave(efeitoDeMagia({ nome: "Tocha", concentracao: "" }).efeito));
  /* o inverso: o que é verdadeiro nasce como `true` limpo, e não como o que
     veio — um "sim" guardado no save vira comparação estranha três versões
     adiante */
  t("e valor verdadeiro que não é booleano nasce como `true` limpo",
    efeitoDeMagia({ nome: "X", concentracao: "sim" }).efeito.concentracao === true);

  /* ---------------- OS OUTROS DOIS NASCIMENTOS CONTINUAM MUDOS --------- */
  const mudos = [];
  const conferirMudo = (rotulo, efeito) => { if (temChave(efeito)) mudos.push(rotulo); };
  /* AS TRÊS PRIMEIRAS CONTINUAM EXATAMENTE ONDE C1 AS PÔS, e continuam certas
     depois de C2b: "Fúria" não é magia de catálogo nenhuma, "Escudo Arcano" é
     magia mas é uma das dez exceções de `CONCENTRACAO_DA_MAGIA` (dura uma
     rodada), e lixo não tem nome para perguntar. */
  conferirMudo("buff simples", efeitoDeBuff({ nome: "Fúria", custo: 4 }, heroi()).efeito);
  conferirMudo("buff defensivo", efeitoDeBuff({ nome: "Escudo Arcano", custo: 2 }, heroi()).efeito);
  conferirMudo("buff de lixo", efeitoDeBuff(null, null).efeito);
  /* A QUARTA SAIU DAQUI (v9.236 · C2b), E O MOTIVO É QUE ELA VIROU O AVESSO DO
     QUE A CASA QUER. C1 escreveu, com "Voo", um dente contra `efeitoDeBuff`
     copiar campos do que recebe — e o dente estava certo para o mundo de C1,
     em que habilidade não tinha de onde tirar concentração. A medição de C2
     mostrou que tinha: Voo É magia do catálogo e É habilidade de Mago, e o
     efeito nascer mudo era justamente o buraco. Exigir o silêncio aqui seria
     a suíte proibindo o conserto. A intenção do dente não se perdeu, ela
     MUDOU DE ENDEREÇO e ficou mais forte: a seção 18 confere o acervo inteiro
     contra `exigeConcentracao`, nome por nome, nas duas direções — o que
     concentra ganha a chave, o que não concentra continua sem ela. Copiar
     campo de quem chega continua proibido, e agora por 85 asserções em vez de
     uma. */
  conferirMudo("milagre simples", efeitoDeMilagre({ nome: "Graça" }, "a fé responde"));
  conferirMudo("milagre de lixo", efeitoDeMilagre(null));
  conferirMudo("milagre que tenta trazer o campo de fora", efeitoDeMilagre({ nome: "Graça", concentracao: true }));
  t("`efeitoDeMilagre` não produz concentração — nem true, nem false, e o buff só a produz pelo catálogo",
    mudos.length <= MEDIDA_DA_PORTA.tetoDeNascimentosMudosComChave, mudos.join(" | "));
  /* e o consumidor confirma pelo outro lado: efeito de buff na ficha não é
     achado como magia segurada */
  t("e um efeito de buff na ficha não é confundido com magia segurada",
    efeitoEmConcentracao(heroi({ efeitos: [efeitoDeBuff({ nome: "Fúria", custo: 4 }, heroi()).efeito] })) === null);

  /* ---------------- O CIRCUITO: o campo VIAJA -------------------------- */
  /* é esta parte que separa "o campo existe" de "o campo funciona": ele nasce
     no módulo, entra na ficha pela pilha, é encontrado pelo consumidor e sai
     pela quebra. Qualquer elo que se solte deixa a promessa escrita nas duas
     pontas e o meio vazio de novo — que é exatamente o estado que C1 veio
     consertar. */
  const comInvisibilidade = heroi({
    efeitos: empilhar([{ nome: "Bênção", bonus: 2, turnos: 5 }], efeitoDeMagia(magiaPorNome("Invisibilidade")).efeito),
  });
  const segurada = efeitoEmConcentracao(comInvisibilidade);
  t("o efeito nascido de magia marcada É ENCONTRADO pelo consumidor", !!segurada && segurada.nome === "Invisibilidade");
  /* `segurada` pode voltar NULA — é justamente o que acontece quando o campo
     para de nascer, e foi o que a sabotagem (a) mostrou: sem esta guarda a
     suíte ESTOURA em vez de contar, e uma prova que explode diz menos que uma
     prova que aponta. As duas linhas abaixo passam a acusar, não a quebrar. */
  t("e o efeito que não concentra, na mesma ficha, não é o achado", !!segurada && segurada.nome !== "Bênção");

  const comLuz = heroi({
    efeitos: empilhar([{ nome: "Bênção", bonus: 2, turnos: 5 }], efeitoDeMagia(magiaPorNome("Luz do Dia")).efeito),
  });
  t("o efeito nascido de magia NÃO marcada não é encontrado (Luz do Dia)", efeitoEmConcentracao(comLuz) === null);

  const quebrado = quebrarConcentracao(comInvisibilidade, (segurada || {}).nome);
  t("a quebra tira a magia da ficha", !quebrado.efeitos.some((e) => e.nome === "Invisibilidade"));
  t("e o resto dos efeitos fica", nomes(quebrado.efeitos) === "Bênção");
  t("e não sobra nada em concentração", efeitoEmConcentracao(quebrado) === null);
  t("a ficha de entrada não foi mutada", comInvisibilidade.efeitos.length === 2);

  /* O CAMPO SOBREVIVE AO RELÓGIO: `tickEfeitos` reconstrói cada efeito a cada
     resposta. Se ele parar de copiar o campo, a magia deixa de ser segurada no
     segundo turno — e nenhuma prova desta casa veria isso antes. */
  const depoisDoTique = R.tickEfeitos(comInvisibilidade);
  t("o campo atravessa o relógio do turno", efeitoEmConcentracao({ efeitos: depoisDoTique.efeitos }) !== null);
  t("e o prazo desceu um, como todo efeito", depoisDoTique.efeitos.find((e) => e.nome === "Invisibilidade").turnos === EFEITO_DA_MAGIA.turnosLongos - 1);

  /* ---------------- O ALCANCE REAL, DECLARADO COMO FATO ---------------- */
  /* a porta de nascimento do App é uma lista de `funcao`, e é ela que decide
     QUAIS magias viram efeito. Hoje são quatro, três delas de concentração.
     Ampliar a lista (ou marcar/desmarcar uma das quatro) muda o alcance desta
     etapa inteira, e a suíte tem de dizer isso em voz alta. */
  const APP16 = readFileSync("../src/App.jsx", "utf8");
  /* a lista é LIDA DO APP, não redigitada aqui: assim as contagens abaixo
     medem o alcance de verdade. Redigitá-la faria a suíte medir a própria
     cópia e dizer "4 magias" mesmo depois de o App passar a aceitar seis. */
  const casouAPorta = APP16.match(/\[((?:"[a-z_]+",?\s*)+)\]\.includes\(m\.funcao\)/);
  const funcoesDoApp = casouAPorta ? casouAPorta[1].match(/"([a-z_]+)"/g).map((s) => s.slice(1, -1)) : [];
  t("a porta de nascimento do App é uma lista de `funcao` legível", funcoesDoApp.length > 0, "não achei a lista no App.jsx");
  t("e é a lista que esta seção declara", JSON.stringify(funcoesDoApp) === JSON.stringify(MEDIDA_DA_PORTA.funcoesDaPorta),
    `o App diz [${funcoesDoApp.join(", ")}], a tabela diz [${MEDIDA_DA_PORTA.funcoesDaPorta.join(", ")}]`);
  t("e é ela que chama o nascimento da magia", /\befeitoDeMagia\(m\)/.test(APP16));

  const naPorta = MAGIAS.filter((m) => funcoesDoApp.includes(m.funcao));
  const naPortaComCampo = naPorta.filter((m) => efeitoDeMagia(m).efeito.concentracao === true);
  console.log(`  ··  na porta: ${naPorta.map((m) => `${m.nome}${m.concentracao ? " (segura)" : ""}`).join(", ")}`);
  t(`${MEDIDA_DA_PORTA.magiasQueChegam} magias chegam à porta de nascimento`,
    naPorta.length === MEDIDA_DA_PORTA.magiasQueChegam, `chegaram ${naPorta.length}`);
  t(`e ${MEDIDA_DA_PORTA.dasQuaisConcentram} delas nascem segurando`,
    naPortaComCampo.length === MEDIDA_DA_PORTA.dasQuaisConcentram,
    `nasceram ${naPortaComCampo.length}: ${naPortaComCampo.map((m) => m.nome).join(", ")}`);
  t("a que não segura é a Luz do Dia — a luz fica onde foi acesa",
    naPorta.length === naPortaComCampo.length + 1 && !naPortaComCampo.some((m) => m.nome === "Luz do Dia"));

  /* PONTE — o teste que cobra o preço mora em combate.js, e o App o chama.
     Sem esse elo, o campo viaja e nunca é perguntado. */
  t("o App pergunta pelo efeito segurado quando o herói apanha", /efeitoEmConcentracao\(/.test(APP16));
  t("e existe um teste de concentração para ele chamar", /testeConcentracao/.test(readFileSync("../src/combate.js", "utf8")));
}

/* ============================================================
   17. A QUEBRA NA MESA — o que o jogador LÊ quando a magia cai (C2)

   Entra DEPOIS da 16 pelo mesmo motivo que a 16 entrou depois da 15, e
   NENHUMA asserção das dezesseis anteriores foi movida: a 16 prova que o
   campo VIAJA (a magia marcada nasce segurada, é achada, é tirada da ficha)
   e termina numa ponte de fonte — "existe um teste de concentração para ele
   chamar". Esta prova o outro lado da ponte: o que esse teste DIZ.

   O ESTADO QUE ELA VEIO CONSERTAR, medido antes de mexer. Quando o herói
   apanhava segurando uma magia, o App imprimia até duas linhas. A de baixo
   era incondicional e dizia QUE ele perdeu e QUAL magia. A de cima — a única
   que carregava a dificuldade e a rolagem — estava atrás de `mostrarRolagens`,
   que é bastidor e vem desligado. Resultado: o jogador pagava PM e um turno
   por uma magia, via a magia cair, e não lia o número que a derrubou.
   "O veredito antes do clique" tem irmã, e é esta: o veredito DEPOIS do golpe.

   A frase é CONTA, então nasce no módulo — o molde é a `linha` de
   `absorverDano` (seções 13/14), que já devolve voz de mundo com o número
   dentro e o comentário que explica por que o número entra.

   E `texto` NÃO muda: é voz de depuração, tem leitor (a linha 🎲 de
   `mostrarRolagens`) e esta seção o prova intacto, palavra por palavra. Duas
   vozes, dois destinos — misturá-las é o jeito de perder as duas.
   ============================================================ */
sec("17. a quebra na mesa — a frase que o jogador lê quando a magia cai (C2)");
{
  const { testeConcentracao, RESISTENCIA_DA_CONCENTRACAO: RC } = CB;

  /* A RÉGUA, lida de volta da tabela e nunca redigitada — é a lei desta suíte
     desde o cabeçalho. Se alguém trocar o piso de 10 por 12, é a RELAÇÃO que
     tem de continuar de pé, não uma cópia do número escondida aqui. */
  const cdDe = (dano) => Math.max(RC.cdMinima, Math.floor(dano / RC.divisorDoDano));

  t("a dificuldade da concentração é tabela, não número solto na conta",
    !!RC && inteiroPositivo(RC.cdMinima) && inteiroPositivo(RC.divisorDoDano));

  /* A VARREDURA DA CD: o motor tem de concordar com a própria tabela em toda
     a faixa de dano que um golpe de verdade produz. */
  const divergiu = [];
  for (let dano = 0; dano <= 200; dano++) {
    if (testeConcentracao(dano, 0).cd !== cdDe(dano)) divergiu.push(dano);
  }
  t("a CD segue a tabela em toda a faixa de dano (0–200)", divergiu.length === 0, `divergiu em ${divergiu.slice(0, 5).join(", ")}`);
  t("e nunca desce do piso, nem com dano zero ou negativo",
    testeConcentracao(0, 0).cd === RC.cdMinima && testeConcentracao(-50, 0).cd === RC.cdMinima
    && testeConcentracao(null, 0).cd === RC.cdMinima && testeConcentracao(undefined, 0).cd === RC.cdMinima);
  /* acima do piso quem manda é a fração, e é ela que a frase vai carregar */
  t("e acima do piso ela é a fração do dano que a tabela declara",
    testeConcentracao(60, 0).cd === Math.floor(60 / RC.divisorDoDano));

  /* AS DUAS FORÇAS, e por que estes números. `testeConcentracao` rola `d(20)`
     cru — não há semente, e esta etapa não mandou pôr uma. Então a prova não
     adivinha o dado: escolhe faixas em que o dado NÃO decide.
       · cai sempre:    dano 60 → CD 30, e d20+2 chega no máximo a 22.
       · aguenta sempre: dano 4 → CD 10 (o piso), e d20+9 começa em 10.
     Os dois lados ficam determinísticos sem tocar no motor. */
  const CAI = { dano: 60, vigor: 2 };
  const AGUENTA = { dano: 4, vigor: 9 };
  const VOLTAS = 200;

  t("a forçagem é válida: com estes números o dado não decide nada",
    cdDe(CAI.dano) > 20 + CAI.vigor && cdDe(AGUENTA.dano) <= 1 + AGUENTA.vigor);

  /* ---------------- A FRASE NASCE SÓ NA QUEDA ------------------------- */
  /* decisão travada pelo orquestrador: uma linha por rodada aguentada seria
     ruído a cada golpe. Quem quer ver o teste mantido já tem a 🎲. */
  const aguentadas = [], caidas = [];
  for (let i = 0; i < VOLTAS; i++) {
    aguentadas.push(testeConcentracao(AGUENTA.dano, AGUENTA.vigor, "Invisibilidade"));
    caidas.push(testeConcentracao(CAI.dano, CAI.vigor, "Invisibilidade"));
  }
  t(`nas ${VOLTAS} aguentadas a magia fica de pé`, aguentadas.every((r) => r.manteve === true));
  t("e NENHUMA delas fala com o jogador", aguentadas.every((r) => r.linha === ""));
  /* vazia de verdade, e string: `undefined` num `if (linha)` passa igual, mas
     vaza para a tela na hora em que alguém interpolar sem pensar */
  t("e o silêncio é string vazia, não `undefined`", aguentadas.every((r) => typeof r.linha === "string"));
  t(`nas ${VOLTAS} quedas a magia cai`, caidas.every((r) => r.manteve === false));
  t("e TODAS falam com o jogador", caidas.every((r) => r.linha.length > 0));

  /* ---------------- O QUE A FRASE DIZ --------------------------------- */
  const q = caidas[0];
  t("a frase é a que o jogador vai ler, montada com os números reais do teste",
    q.linha === `💢 Invisibilidade escapa dos dedos — o corpo aguentou ${q.rolo}, e era preciso ${q.cd}.`);
  t("ela nomeia a magia perdida", caidas.every((r) => r.linha.includes("Invisibilidade")));
  /* os DOIS números, e os números DAQUELE teste — não um par plausível */
  t("ela traz a rolagem que saiu", caidas.every((r) => r.linha.includes(String(r.rolo))));
  t("e a dificuldade que ela não alcançou", caidas.every((r) => r.linha.includes(String(r.cd))));
  t("e a dificuldade impressa é a da tabela, não outra",
    caidas.every((r) => r.linha.includes(`era preciso ${cdDe(CAI.dano)}.`)));

  /* a CD dentro da FRASE acompanha o dano, em toda a faixa: é o número que
     explica a perda, e imprimir um fixo seria mentir em 199 casos de 200 */
  const erradas = [], semQueda = [];
  for (const dano of [0, 1, 9, 19, 20, 21, 46, 61, 99, 200]) {
    /* insiste com Vigor de ficha de verdade até a queda acontecer, em vez de
       forçar com um modificador impossível: a frase tem de ficar legível com
       os números que a mesa produz. Com CD no piso a queda é provável o
       bastante para 500 voltas serem certeza prática, e o `semQueda` acusa
       em voz alta se um dia deixar de ser. */
    let caiu = null;
    for (let i = 0; i < 500 && !caiu; i++) {
      const r = testeConcentracao(dano, 2, "Voo");
      if (!r.manteve) caiu = r;
    }
    if (!caiu) { semQueda.push(dano); continue; }
    if (!caiu.linha.includes(`era preciso ${cdDe(dano)}.`) || !caiu.linha.includes(`aguentou ${caiu.rolo},`)) erradas.push(dano);
  }
  t("a prova achou uma queda em cada dano da varredura", semQueda.length === 0, `sem queda em ${semQueda.join(", ")}`);
  t("e a frase carrega os dois números certos em todos eles", erradas.length === 0, `errou em ${erradas.join(", ")}`);

  /* ---------------- A VOZ: o sistema não fala de si mesmo -------------- */
  /* a lista é tabela porque é ela que define o que "voz de mundo" quer dizer
     nesta casa — e vem com CONTROLE NEGATIVO logo abaixo, senão uma lista que
     não morde passa verde para sempre */
  const PALAVRAS_DE_BASTIDOR = ["concentracao", "cd", "d20", "dado", "dados", "rolagem", "rolou", "teste", "vigor", "quebrada", "modificador", "bonus", "sistema", "undefined", "null", "nan"];
  const cru = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const bastidorEm = (s) => PALAVRAS_DE_BASTIDOR.filter((p) => new RegExp(`\\b${p}\\b`).test(cru(s)));

  t("a frase da cena não diz uma única palavra de mecanismo",
    bastidorEm(q.linha).length === 0, bastidorEm(q.linha).join(", "));
  t("nem em nenhuma das outras quedas", caidas.every((r) => bastidorEm(r.linha).length === 0));
  /* CONTROLE NEGATIVO: a mesma lista aplicada à voz de depuração TEM de
     reprovar. Se não reprovar, a lista virou decoração e a prova acima não
     está medindo nada. */
  t("e a lista morde de verdade — a voz de depuração é reprovada por ela",
    bastidorEm(q.texto).length >= 3, `só pegou ${bastidorEm(q.texto).join(", ")}`);

  /* ---------------- LIXO NO NOME: a cena não pode estourar ------------- */
  /* save velho guarda efeito sem nome, e `efeitoEmConcentracao` devolve o
     objeto como ele está — o que chega aqui é o que estava salvo */
  const RECUO = "o que ele segurava";
  const estourou = [], vazou = [];
  for (const lixo of [null, undefined, "", "   ", 0, 7, NaN, {}, [], true, false, { nome: "Voo" }]) {
    let r = null;
    try { r = testeConcentracao(CAI.dano, CAI.vigor, lixo); } catch { estourou.push(String(lixo)); continue; }
    if (!r.linha.includes(RECUO) || bastidorEm(r.linha).length) vazou.push(JSON.stringify(lixo) + " → " + r.linha);
  }
  t("nome de lixo não estoura o turno", estourou.length === 0, estourou.join(", "));
  t("e cai na voz de recuo, sem `undefined` nem `[object Object]` na cena",
    vazou.length === 0, vazou.slice(0, 2).join(" | "));
  t("um nome de verdade com espaço em volta é aparado, não perdido",
    testeConcentracao(CAI.dano, CAI.vigor, "  Voo  ").linha.includes("💢 Voo escapa"));

  /* ---------------- REGRESSÃO ZERO: a 🎲 continua a mesma -------------- */
  /* `texto` tem leitor hoje (a linha de `mostrarRolagens`), e a etapa mandou
     não mexer nele. Aqui ele é medido palavra por palavra, com o terceiro
     argumento presente — porque o risco real é o nome da magia vazar para a
     linha de depuração e mudar um texto que alguém já lê. */
  t("a voz de depuração da queda é exatamente a de sempre",
    new RegExp(`^Concentração: d20\\+${CAI.vigor}=\\d+ vs CD ${cdDe(CAI.dano)} → QUEBRADA$`).test(q.texto), q.texto);
  t("e a da mantida também",
    new RegExp(`^Concentração: d20\\+${AGUENTA.vigor}=\\d+ vs CD ${cdDe(AGUENTA.dano)} → mantida$`).test(aguentadas[0].texto), aguentadas[0].texto);
  t("o nome da magia NÃO vaza para a linha de depuração", caidas.every((r) => !r.texto.includes("Invisibilidade")));
  t("e os números das duas vozes são o mesmo par",
    caidas.every((r) => r.texto.includes(`=${r.rolo} `) && r.texto.includes(`CD ${r.cd} `)));

  /* ---------------- O CHAMADOR DE DOIS ARGUMENTOS CONTINUA CERTO ------- */
  /* NENHUMA asserção daqui foi movida — só o COMENTÁRIO mudou, e o motivo é
     este: ele dizia "o App ainda chama com dois; o `frontend` é que vai passar
     o terceiro", e o `frontend` passou (as âncoras estão logo abaixo). A razão
     de o argumento seguir OPCIONAL não era essa espera: é que um save velho
     guarda efeito sem nome, e tornar o terceiro obrigatório derrubaria a mesa
     do jogador que carregasse esse save. A prova continua valendo por esse
     motivo, que é maior que o da etapa. */
  const velho = testeConcentracao(CAI.dano, CAI.vigor);
  t("chamado com dois argumentos, devolve tudo o que devolvia",
    velho.cd === cdDe(CAI.dano) && Number.isInteger(velho.rolo) && velho.manteve === false && typeof velho.texto === "string");
  t("e sem nome a frase tem recuo próprio em vez de buraco", velho.linha.includes(RECUO));

  /* ---------------- A FIAÇÃO: o que o App faz com tudo isto ------------- */
  /* A seção 16 termina numa ponte de fonte — "existe um teste de concentração
     para ele chamar". Esta fecha o outro lado dela, no mesmo molde de âncora
     de texto (`/efeitoEmConcentracao\(/`), e por necessidade: a fiação mora
     dentro de um componente React de vinte mil linhas, não há como chamá-la em
     Node, e uma frase que nasce certa no módulo e é ignorada na tela é
     exatamente o defeito que esta etapa veio consertar. */
  const APP17 = readFileSync("../src/App.jsx", "utf8");
  const i0 = APP17.indexOf("const concentrando = efeitoEmConcentracao(persBase);");
  const i1 = APP17.indexOf(`calou("quebraDaConcentracao"`);
  t("a fiação da quebra existe no App e é um bloco só, achável", i0 > 0 && i1 > i0);
  /* tudo abaixo é medido DENTRO do bloco, não no arquivo inteiro: um `tc.linha`
     solto em qualquer outro canto do App não provaria nada sobre este golpe */
  const FIO = APP17.slice(i0, i1);

  t("o App passa o NOME da magia para o teste",
    /testeConcentracao\(danoNoJogador, atributoEfetivo\(persBase, "vigor"\), concentrando\.nome\)/.test(FIO));
  t("e mostra ao jogador a frase que o módulo montou, sem prefixo nenhum",
    /extra\.push\(\{ autor: "sistema", texto: tc\.linha \}\)/.test(FIO));
  /* o defeito que esta etapa veio consertar não pode voltar por descuido: a
     frase montada à mão dizia QUE caiu e escondia POR QUÊ */
  t("a frase montada à mão não voltou ao App", !/Concentração quebrada — /.test(APP17));
  t("e a voz de ficha continua atrás de quem pediu para ver as rolagens",
    /if \(mostrarRolagensRef\.current\) extra\.push\(\{ autor: "sistema", texto: `🎲 \$\{tc\.texto\}` \}\)/.test(FIO));
  t("a quebra continua sendo anotada onde sempre foi", /persConcQuebrada = concentrando\.nome;/.test(FIO));
  t("e o bloco inteiro está sob a lei do turno que não pode cair",
    APP17.slice(Math.max(0, i0 - 60), i0).includes("try {")
    && /\} catch \(e\) \{ calou\("quebraDaConcentracao", e\); \}/.test(APP17));

  /* A NOTA AO NARRADOR, e o que importa nela é ONDE mora.
     `ECONOMIA_ACAO_PROMPT` promete há versões "quando quebrar, narre o efeito
     se desfazendo na hora" — e não havia sinal nenhum atrás da promessa. A
     nota tem de ser DINÂMICA e nascer só no turno da queda: bloco estático é
     proibido pelo teto do prompt, e uma nota que sobe toda rodada é ruído no
     lugar de aviso. */
  const soNaQueda = FIO.slice(FIO.indexOf("if (!tc.manteve)"), FIO.indexOf("if (extra.length)"));
  t("a nota ao Narrador existe", /\[CONCENTRAÇÃO — QUEBRADA PELO SISTEMA\]/.test(FIO));
  t("e nasce SÓ no turno em que a magia cai", soNaQueda.includes("[CONCENTRAÇÃO — QUEBRADA PELO SISTEMA]"));
  t("ela viaja pela nota por turno, empilhada nas vizinhas",
    /notaRef\.current = `\$\{notaRef\.current \? notaRef\.current \+ "\\n" : ""\}\[CONCENTRAÇÃO/.test(soNaQueda));
  t("ela diz QUAL magia se desfez", /\$\{concentrando\.nome\}/.test(soNaQueda));
  t("e manda narrar o desfazimento", /Narre o efeito se desmanchando/.test(soNaQueda));
  /* CONTROLE: a promessa continua no prompt estático, e nada novo foi somado
     a ela — o canal desta etapa é a nota, não o bloco */
  t("e a promessa do prompt estático segue intacta, sem uma letra a mais",
    /quando quebrar, narre o efeito se desfazendo na hora\.`;$/m.test(readFileSync("../src/combate.js", "utf8")));
}

/* ============================================================
   18. O COMPANHEIRO SEGURA O QUE JÁ CONJURA (C2b · v9.236)

   O MÍNIMO QUE PROVA, e nada além: a suíte dedicada vem depois. O que esta
   seção trava é a regra nova — `efeitoDeBuff` pergunta ao CATÁLOGO, pelo nome,
   e nasce segurando o que o catálogo diz que se segura — e o raio dela, que é
   a parte que a etapa mandou medir antes de escrever.

   O RAIO É HERÓI + COMPANHEIRO, e está medido: a porta é a MESMA
   (`aplicarBuffDeHabilidade` no App, o piloto na arena e na mesa), então
   qualquer número aqui vale para os dois. Do acervo de 148 habilidades de
   classe, 8 são magia do catálogo pelo nome e 5 concentram — Bênção, Escudo
   da Fé, Invisibilidade, Voo e Marca do Caçador. Do lado do HERÓI, só 3
   chegam a virar efeito hoje (Bênção, Escudo da Fé, Invisibilidade): Voo e
   Marca do Caçador não abrem condição boa em `aflicaoDe`, e sem condição boa
   `efeitoDeBuff` nem é chamado. Os números moram em tabela, e a suíte os lê
   de volta contra o acervo: acervo que cresça amanhã com uma sexta magia de
   concentração não passa por aqui em silêncio.
   ============================================================ */
sec("18. o companheiro segura o que já conjura — o buff pergunta ao catálogo (C2b)");
{
  const CL = await import(RAIZ + "classes.js");
  const { magiaPorNome, exigeConcentracao, MAGIAS } = G;
  const temChave = (ef) => Object.prototype.hasOwnProperty.call(ef || {}, "concentracao");
  const heroiC = { nome: "H", classe: "Mago", nivel: 3, atributos: { vigor: 1 } };

  /* A MEDIDA DO RAIO, em tabela — os números que a etapa mediu antes de
     escrever uma linha de comportamento. Não são enfeite: são o que separa
     "o companheiro passou a segurar magia" de "cinco habilidades do herói
     passaram a concentrar sem ninguém ter contado". */
  const RAIO_DO_BUFF = {
    habilidadesDeClasse: 148,
    saoMagiaDoCatalogo: 8,
    dasQuaisConcentram: 5,
    /* nominal, porque contar sem nomear deixa a lista trocar de conteúdo sem
       trocar de tamanho */
    asQueConcentram: ["Bênção", "Escudo da Fé", "Invisibilidade", "Voo", "Marca do Caçador"],
    /* a que é magia do catálogo e NÃO concentra é o controle vivo da exceção */
    controleDaExcecao: "Escudo Arcano",
  };

  const doAcervo = [];
  for (const c of CL.CLASSES) for (const h of (c.habilidades || [])) doAcervo.push(h);
  const saoMagia = doAcervo.filter((h) => !!magiaPorNome(h.nome));
  const concentram = saoMagia.filter((h) => exigeConcentracao(magiaPorNome(h.nome)));
  t(`o acervo de classe tem ${RAIO_DO_BUFF.habilidadesDeClasse} habilidades`,
    doAcervo.length === RAIO_DO_BUFF.habilidadesDeClasse, `medido: ${doAcervo.length}`);
  t(`e ${RAIO_DO_BUFF.saoMagiaDoCatalogo} delas são magia do catálogo pelo nome`,
    saoMagia.length === RAIO_DO_BUFF.saoMagiaDoCatalogo, `medido: ${saoMagia.length}`);
  t(`das quais ${RAIO_DO_BUFF.dasQuaisConcentram} concentram, e são estas`,
    concentram.length === RAIO_DO_BUFF.dasQuaisConcentram
    && RAIO_DO_BUFF.asQueConcentram.every((n) => concentram.some((h) => h.nome === n)),
    concentram.map((h) => h.nome).join(", "));

  /* A REGRA NOVA: o que concentra nasce com a chave, o que não concentra não */
  const erradas = concentram.filter((h) => efeitoDeBuff(h, heroiC).efeito.concentracao !== true);
  t("toda habilidade-magia de concentração sai de `efeitoDeBuff` COM o campo",
    erradas.length === 0, erradas.map((h) => h.nome).join(", "));
  const mudas = saoMagia.filter((h) => !exigeConcentracao(magiaPorNome(h.nome)));
  const vazadas = mudas.filter((h) => temChave(efeitoDeBuff(h, heroiC).efeito));
  t("e a que é magia mas NÃO concentra continua sem a chave — nem `false`",
    vazadas.length === 0, vazadas.map((h) => h.nome).join(", "));
  /* o controle vivo da exceção: Escudo Arcano é magia, é habilidade de Mago,
     dura uma rodada e por isso é uma das dez de `CONCENTRACAO_DA_MAGIA`. Se um
     dia ele sair daqui com a chave, foi a exceção que se soltou */
  t(`"${RAIO_DO_BUFF.controleDaExcecao}" é magia do catálogo, é habilidade, e mesmo assim sai mudo`,
    !!magiaPorNome(RAIO_DO_BUFF.controleDaExcecao)
    && saoMagia.some((h) => h.nome === RAIO_DO_BUFF.controleDaExcecao)
    && !temChave(efeitoDeBuff({ nome: RAIO_DO_BUFF.controleDaExcecao, custo: 2 }, heroiC).efeito));

  /* A PERGUNTA É AO CATÁLOGO E SÓ A ELE — nas duas direções, com o catálogo
     inteiro passando pela porta do buff. É o dente que herdou a intenção da
     asserção que C1 escreveu com "Voo" na seção 16: `efeitoDeBuff` não pode
     divergir de `exigeConcentracao` em NENHUMA das 85. */
  const divergem = MAGIAS.filter((m) => temChave(efeitoDeBuff(m, heroiC).efeito) !== exigeConcentracao(m));
  t(`nenhuma das ${MAGIAS.length} magias divergem entre \`efeitoDeBuff\` e \`exigeConcentracao\``,
    divergem.length === 0, divergem.map((m) => m.nome).join(", "));
  /* e o que o grimório não conhece não segura nada: habilidade inventada pelo
     Mestre, nome de save antigo, lixo */
  const forasteiras = [
    { nome: "Fúria", custo: 4 }, { nome: "Grito de Guerra", custo: 2 },
    { nome: "Magia Que Não Existe", custo: 9, duracao: "1 hora", concentracao: true },
    null, undefined, {}, { nome: null }, { nome: 123 },
  ];
  const intrusas = forasteiras.filter((h) => temChave(efeitoDeBuff(h, heroiC).efeito));
  t("o que o grimório não conhece sai mudo — inclusive quem traz `concentracao` de fora",
    intrusas.length === 0, intrusas.map((h) => (h || {}).nome).join(", "));

  /* O RAIO DO HERÓI, NOMINAL. A porta é a mesma, então o herói ganha junto —
     e quais são as dele tem de estar escrito, não descoberto por alguém que
     perdeu a Bênção no meio de uma luta sem entender por quê. */
  const AF = await import(RAIZ + "aflicoes.js");
  const doHeroi = saoMagia.filter((h) => {
    const port = AF.aflicaoDe(`${h.nome || ""} ${h.descricao || ""}`);
    if (!port || port.alvo === "alvo") return false;
    const res = AF.rolarAflicao({ fonte: port, nomeFonte: h.nome, atacante: "H", sempre: true });
    return !!(res && res.aplicou && res.cond.tipo === "bom");
  });
  const HEROI_QUE_CONCENTRA = ["Bênção", "Escudo da Fé", "Invisibilidade"];
  const heroiConcentra = doHeroi.filter((h) => exigeConcentracao(magiaPorNome(h.nome))).map((h) => h.nome);
  t("no herói, as que passam a concentrar são exatamente três, e são estas",
    heroiConcentra.length === HEROI_QUE_CONCENTRA.length
    && HEROI_QUE_CONCENTRA.every((n) => heroiConcentra.includes(n)), heroiConcentra.join(", "));
  /* Voo e Marca do Caçador são magia de concentração e são habilidade, mas no
     herói não viram efeito nenhum: `aflicaoDe` não acha condição para elas, e
     `efeitoDeBuff` nem chega a ser chamado. Fica escrito para ninguém procurar
     no lugar errado no dia em que alguém perguntar por que o Voo não cai. */
  t("e Voo e Marca do Caçador ficam de fora porque não abrem condição boa",
    !heroiConcentra.includes("Voo") && !heroiConcentra.includes("Marca do Caçador"));

  /* O COMPANHEIRO: a ficha de verdade, montada pelo montador de verdade. Um
     Clérigo de nível 3 sai com as duas, e o piloto escolhe as duas. */
  const CO = await import(RAIZ + "companheiros.js");
  const clerigo = CO.garantirFichaCompanheiro({ nome: "Irmã", classe: "Clérigo", nivel: 3 });
  const dele = (clerigo.habilidades || []).filter((h) => exigeConcentracao(magiaPorNome(h.nome)));
  t("um Clérigo companheiro de nível 3 sai da ficha segurando Bênção e Escudo da Fé",
    dele.length === 2 && dele.some((h) => h.nome === "Bênção") && dele.some((h) => h.nome === "Escudo da Fé"),
    dele.map((h) => h.nome).join(", "));
  t("e o piloto escolhe as duas — uma pelo abrigo, outra pelo apoio",
    CO.ehAbrigo(dele.find((h) => h.nome === "Escudo da Fé")) && CO.ehBuff(dele.find((h) => h.nome === "Bênção")));
  const buffDele = efeitoDeBuff(dele.find((h) => h.nome === "Bênção"), clerigo).efeito;
  t("o efeito que ele firma nasce segurado, e o consumidor o acha",
    buffDele.concentracao === true
    && (efeitoEmConcentracao({ nome: "Irmã", efeitos: [buffDele] }) || {}).nome === "Bênção");

  /* A ARENA CHAMA O TESTE — a outra metade da etapa. O sítio existe, usa o
     dano que SOBROU da absorção (o escudo que comeu a batida já pagou por ela)
     e imprime a linha de C2, não uma frase nova. */
  const ARENA = readFileSync("../src/arena.js", "utf8");
  t("a arena importa o teste de concentração de combate.js", /import \{[^}]*testeConcentracao[^}]*\} from "\.\/combate\.js"/.test(ARENA));
  t("e o chama com o dano que sobrou da absorção, não com o golpe cheio",
    /testeConcentracao\(ab\.dano, atributoEfetivo\(outro, "vigor"\), segurada\.nome\)/.test(ARENA));
  t("só em quem ficou de pé e só quando o golpe tirou PV",
    /if \(ab\.dano > 0 && outro\.vida > 0\) \{[\s\S]{0,80}efeitoEmConcentracao\(outro\)/.test(ARENA));
  t("a queda tira o efeito da ficha pela porta da casa", /quebrarConcentracao\(outro, segurada\.nome\)\.efeitos/.test(ARENA));
  /* A FRASE É A DE C2, palavra por palavra: a arena não escreve uma sílaba,
     só põe o dono na frente, como já faz com a mordida do abrigo. */
  t("e a linha que o jogador lê é `tc.linha`, seca, com o nome de quem perdeu",
    /linhas\.push\(`\$\{outro\.nome\} — \$\{secar\(tc\.linha\)\}`\)/.test(ARENA));
  t("a arena não inventa frase de concentração nenhuma", !/escapa dos dedos/.test(ARENA));
}

/* ============================================================
   19. UMA DE CADA VEZ — o teto da concentração (C3 · v9.237)

   ONDE ENTRA E POR QUÊ AQUI. Depois da 18, e sem mover uma asserção das
   dezoito: a 16 provou que o campo VIAJA, a 17 o que o jogador LÊ quando a
   magia cai, a 18 que o buff aprendeu a perguntar ao catálogo. As três juntas
   deixaram o herói e o companheiro capazes de segurar DUAS ao mesmo tempo —
   e a regra da mesa diz uma. Esta seção é o teto, e é a última da Fase C.

   O QUE A ETAPA CONSERTOU, medido antes. `empilhar` só substitui por NOME
   IGUAL: quem lançava Voo e depois Invisibilidade ficava com as duas, e
   `efeitoEmConcentracao` devolvia a PRIMEIRA da lista — uma batida derrubava
   sempre a mais velha, que é regra decidida por sorte de array.

   AS DUAS METADES DESTA PROVA, e nenhuma vale sem a outra:

   - A METADE QUE MORDE: o teto existe, sai da tabela, é LIDO DE VOLTA pela
     função (a sabotagem do teto 2 está embutida na seção, com o valor
     restaurado no fim), a segunda derruba a primeira, quem fica é a NOVA, e a
     frase diz as duas magias em voz de mundo.
   - A METADE QUE NÃO PODE MORDER: regressão zero para quem não concentra.
     `firmarEfeito` tem de ser `empilhar` e MAIS NADA para as 85 magias do
     catálogo, para as 148 habilidades de classe que não concentram e para
     todo lixo — e isso é provado contra a própria `empilhar`, chamada a
     chamada, e não contra uma cópia da expectativa escrita aqui.

   O DENTE DO BUG SILENCIOSO. Efeito COM a chave e SEM nome não entra na lista
   (`empilhar` o recusa, e sempre recusou) — se ele derrubasse a concentração
   mesmo assim, o jogador perderia a Bênção em troca de NADA, e nenhuma linha
   da tela diria por quê. É o caso mais barato de escrever errado e o mais caro
   de descobrir na mesa; por isso tem dente próprio.

   O QUE ESTA SEÇÃO NÃO MEDE. O preço na mesa dos oito — quantas cessões
   acontecem de verdade e o que elas fizeram com a conta do abrigo — é da
   arena, e está em `teste-arena.mjs` (seções 7 e 11). Aqui é a REGRA; lá, o
   que ela custa.
   ============================================================ */
sec("19. uma de cada vez — a nova toma o lugar da que ele segurava (C3)");
{
  const { CONCENTRACAO_DA_MAGIA, magiaPorNome, MAGIAS } = G;
  const CL = await import(RAIZ + "classes.js");
  const APP19 = readFileSync("../src/App.jsx", "utf8");
  /* OS CONTROLES NEGATIVOS LEEM O CÓDIGO, NÃO A PROSA. Os comentários desta
     casa citam de propósito o que o código deixou de fazer ("a porta é
     `firmarOuCeder`, e não `empilhar`") — uma prova de ausência sobre o
     arquivo cru acusaria a EXPLICAÇÃO da etapa em vez de uma regressão, e
     quem viesse depois aprenderia a apagar o comentário para calar o teste. */
  const soCodigo = (s) => s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^[ \t]*\/\/.*$/gm, " ");
  const APP19_CODIGO = soCodigo(APP19);
  const temChave = (ef) => Object.prototype.hasOwnProperty.call(ef || {}, "concentracao");
  const heroiC = { nome: "H", classe: "Mago", nivel: 3, atributos: { vigor: 1 } };
  /* a mesma comparação de identidade que a lei da imutabilidade pede: não é
     "tem os mesmos nomes", é "são os MESMOS objetos, na mesma ordem" */
  const mesmaLista = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => x === b[i]);
  const doCatalogo = (n) => efeitoDeMagia(magiaPorNome(n)).efeito;

  /* ---------------- A RÉGUA, EM TABELA ----------------
     Nenhum número desta seção é redigitado: o teto sai de
     `CONCENTRACAO_DA_MAGIA` e a PALAVRA sai da promessa que o Narrador já
     recebe em `ECONOMIA_ACAO_PROMPT`. A única coisa escrita aqui é a ponte
     entre as duas — porque "UMA" e `1` são a mesma lei em duas línguas, e
     quem mudar uma sem a outra tem de bater nesta seção. */
  const MEDIDA_DO_TETO = {
    /* a frase do prompt, palavra por palavra, com a quantidade capturada */
    rxDaPromessa: /CONCENTRAÇÃO: um conjurador mantém no máximo (\p{Lu}+) magia de duração por vez/u,
    /* a ponte da palavra para o número — três degraus bastam para qualquer
       teto que esta casa venha a querer, e um quarto seria inventar futuro */
    palavraEmNumero: { UMA: 1, DUAS: 2, TRÊS: 3 },
    /* O NOME DO MECANISMO NÃO APARECE NA FRASE (lei "o sistema não fala de si
       mesmo"). O jogador vê duas magias disputando as mãos de alguém, não um
       teto de tabela sendo cobrado. */
    rxMecanismo: /[Cc]oncentra|efeito|slot|teto|limite/,
    /* o emoji da perda, o mesmo da queda de C2: é a mesma dor, e duas
       pontuações diferentes para a mesma dor seriam a mesa gaguejando */
    marcaDaPerda: "💢",
    /* os NASCIMENTOS que podem segurar algo e por isso passam pela porta
       nova: o buff do herói, o buff do companheiro e a magia de duração */
    sitiosDoApp: 3,
    /* e os módulos onde `empilhar` continua sendo o caminho, porque nenhum
       deles produz concentração nenhuma — o frasco, a relíquia e o canal do
       Mestre. Se `firmarEfeito` aparecer em qualquer um, a regra de magia
       vazou para fora da magia. */
    modulosDoGenerico: ["pocoes.js", "relicas.js", "regras-jogo.js"],
  };

  /* ---------------- (1) O TETO MORA NA TABELA, E A PROMESSA CONCORDA ---- */
  const teto = CONCENTRACAO_DA_MAGIA.quantasAoMesmoTempo;
  t("o teto tem nome e mora em `CONCENTRACAO_DA_MAGIA`", inteiroPositivo(teto), `veio ${JSON.stringify(teto)}`);
  const promessa = readFileSync("../src/combate.js", "utf8").match(MEDIDA_DO_TETO.rxDaPromessa);
  t("a promessa ao Narrador continua legível em `ECONOMIA_ACAO_PROMPT`", !!promessa,
    "não achei a frase da concentração no prompt estático");
  /* O DENTE QUE LIGA AS DUAS PONTAS. A tabela é o que o jogo CUMPRE; o prompt
     é o que o jogo PROMETE. C3 nasceu justamente porque as duas discordavam —
     a promessa dizia UMA e o código deixava segurar duas. Quem mexer numa
     sem a outra reabre o mesmo buraco, e bate aqui. */
  t("e a tabela cumpre exatamente o número que a promessa anuncia",
    !!promessa && MEDIDA_DO_TETO.palavraEmNumero[promessa[1]] === teto,
    `o prompt promete "${promessa ? promessa[1] : "?"}", a tabela diz ${teto}`);

  /* ---------------- (2) A SEGUNDA DERRUBA A PRIMEIRA ------------------- */
  const voo = doCatalogo("Voo");
  const inv = doCatalogo("Invisibilidade");
  const bencao = doCatalogo("Bênção");
  t("as três magias desta prova concentram de verdade, pelo catálogo",
    voo.concentracao === true && inv.concentracao === true && bencao.concentracao === true);

  const comVoo = heroi({ efeitos: [{ nome: "Vigor de Urso", bonus: 2, turnos: 5 }, voo] });
  const efeitosDeEntrada = comVoo.efeitos;
  const r2 = firmarEfeito(comVoo, inv);
  const segurando2 = r2.pers.efeitos.filter((e) => e.concentracao);
  t("depois da segunda, só UMA concentração fica na ficha", segurando2.length === teto,
    `ficaram ${segurando2.length}: ${nomes(segurando2)}`);
  t("e a que fica é a NOVA, não a que já estava", (segurando2[0] || {}).nome === "Invisibilidade", nomes(segurando2));
  t("e ela é o MESMO objeto que chegou, não uma cópia", segurando2[0] === inv);
  t("`cedeu` nomeia quem saiu", JSON.stringify(r2.cedeu) === JSON.stringify(["Voo"]));
  /* o que não concentra não é atingido: o teto é da concentração, não da
     pilha — um herói não perde a poção de Vigor por ter lançado uma magia */
  t("o efeito que NÃO concentra fica onde estava", nomes(r2.pers.efeitos) === "Vigor de Urso,Invisibilidade");
  /* LEI DA IMUTABILIDADE, nos dois níveis: nem a lista de entrada nem a ficha
     de entrada são tocadas, e a ficha que sai é outra. */
  t("a ficha de entrada não foi mutada", mesmaLista(comVoo.efeitos, efeitosDeEntrada) && nomes(comVoo.efeitos) === "Vigor de Urso,Voo");
  t("e a ficha que sai é OUTRA, não a mesma remexida", r2.pers !== comVoo && r2.pers.efeitos !== comVoo.efeitos);
  t("e o resto da ficha atravessa inteiro", r2.pers.nome === comVoo.nome && r2.pers.nivel === comVoo.nivel);
  /* e o consumidor concorda com a pilha: quem ficou é quem ele acha */
  t("e o consumidor acha exatamente quem ficou", (efeitoEmConcentracao(r2.pers) || {}).nome === "Invisibilidade");

  /* ---------------- (3) A FUNÇÃO LÊ O TETO DE VOLTA -------------------- */
  /* A SABOTAGEM EMBUTIDA, e é o dente que separa "a tabela existe" de "a
     tabela manda". Um `1` cravado dentro de um `slice` passaria em TODAS as
     provas acima. Aqui o teto da tabela vira 2 por três chamadas: se a função
     o lê, duas concentrações passam a conviver e a terceira derruba a MAIS
     VELHA; se ele estiver cravado no código, a segunda continua derrubando a
     primeira e estas três linhas ficam vermelhas.
     O valor é restaurado num `finally` e a restauração é conferida logo
     abaixo — uma suíte que deixasse a tabela torta envenenaria as seções
     seguintes e a mentira apareceria em outro arquivo. */
  let comTetoDois = null, restaurado = null;
  try {
    CONCENTRACAO_DA_MAGIA.quantasAoMesmoTempo = 2;
    const a = firmarEfeito(heroi({ efeitos: [voo] }), bencao);
    const b = firmarEfeito(a.pers, inv);
    comTetoDois = { a, b };
  } finally {
    CONCENTRACAO_DA_MAGIA.quantasAoMesmoTempo = teto;
    restaurado = CONCENTRACAO_DA_MAGIA.quantasAoMesmoTempo;
  }
  t("[teto 2] com o teto em 2, a segunda NÃO derruba a primeira — as duas convivem",
    comTetoDois.a.cedeu.length === 0 && nomes(comTetoDois.a.pers.efeitos) === "Voo,Bênção",
    nomes(comTetoDois.a.pers.efeitos));
  t("[teto 2] e a terceira derruba a MAIS VELHA, não a do meio nem a que chegou",
    JSON.stringify(comTetoDois.b.cedeu) === JSON.stringify(["Voo"])
    && nomes(comTetoDois.b.pers.efeitos) === "Bênção,Invisibilidade",
    `cedeu ${comTetoDois.b.cedeu.join(",")} · ficaram ${nomes(comTetoDois.b.pers.efeitos)}`);
  t("e a suíte devolveu a tabela ao valor da casa", restaurado === teto);

  /* E O TETO TORTO NÃO PODE DEVOLVER O ACÚMULO EM SILÊNCIO. Save de tabela
     editada à mão, campo apagado num merge, número que virou texto: em todos
     esses casos a função tem de cair no piso 1, que é a regra da mesa. Um
     `Number(undefined)` virando NaN e o `slice` não derrubando ninguém seria
     o bug de C3 voltando pela porta dos fundos. */
  const tortos = [0, -1, NaN, "duas", null, undefined, {}, 0.4];
  const acumulou = [];
  for (const x of tortos) {
    try {
      CONCENTRACAO_DA_MAGIA.quantasAoMesmoTempo = x;
      const r = firmarEfeito(heroi({ efeitos: [voo] }), inv);
      if (r.pers.efeitos.filter((e) => e.concentracao).length !== 1) acumulou.push(JSON.stringify(x));
    } finally { CONCENTRACAO_DA_MAGIA.quantasAoMesmoTempo = teto; }
  }
  t("teto torto na tabela cai no piso de 1 — nunca no acúmulo", acumulou.length === 0, acumulou.join(" | "));
  t("e a tabela continua inteira depois de tudo isso", CONCENTRACAO_DA_MAGIA.quantasAoMesmoTempo === teto);

  /* ---------------- (4) O DENTE DO BUG SILENCIOSO --------------------- */
  /* efeito COM a chave e SEM nome: `empilhar` o recusa (ele nunca poderia ser
     retirado depois), então ele não ocupa lugar nenhum. Se derrubasse a magia
     do jogador assim mesmo, o jogador perderia a Bênção em troca de NADA. */
  const semNome = [
    { concentracao: true, bonus: 2, turnos: 5 },
    { nome: "", concentracao: true }, { nome: null, concentracao: true },
    { nome: 0, concentracao: true }, { nome: undefined, concentracao: true },
    { nome: false, concentracao: true },
  ];
  const roubaram = semNome.filter((ef) => {
    const r = firmarEfeito(heroi({ efeitos: [voo] }), ef);
    return r.cedeu.length > 0 || r.linha !== "" || !r.pers.efeitos.some((e) => e.nome === "Voo");
  });
  t("efeito COM `concentracao` e SEM nome não entra e NÃO derruba ninguém",
    roubaram.length === 0, `${roubaram.length} de ${semNome.length} roubaram o lugar sem ocupá-lo`);
  /* o controle do controle: `"   "` tem nome "verdadeiro" para o `if` de
     `empilhar` e entra de verdade — então ele derruba, e é certo que derrube.
     Fica escrito para a linha acima não ser lida como "nome fraco não vale". */
  const comBranco = firmarEfeito(heroi({ efeitos: [voo] }), { nome: "   ", concentracao: true });
  t("já um nome só de espaços ENTRA na pilha, e por isso derruba mesmo", comBranco.cedeu.length === 1);
  /* E A FRASE NÃO PODE FICAR COM UM BURACO NO LUGAR DO NOME. Um nome em branco
     vindo de save torto daria "💢 Voo escapa dos dedos — ⟨nada⟩ toma o lugar
     dela", e o jogador leria uma perda sem causa. A porta tem uma voz de
     reserva para os dois lados da frase, e é ela que esta linha trava. */
  t("e a frase usa a voz de reserva em vez de deixar o buraco",
    /escapa dos dedos — o que ele acabou de erguer toma o lugar dela\.$/.test(comBranco.linha), comBranco.linha);
  t("e do outro lado também — quem cede sem nome legível tem voz de reserva",
    /^💢 o que ele segurava escapa dos dedos — Voo toma o lugar dela\.$/
      .test(firmarEfeito(heroi({ efeitos: [{ nome: "   ", concentracao: true }] }), voo).linha));

  /* ---------------- (5) RELANÇAR A MESMA NÃO É TROCA ------------------- */
  const relancou = firmarEfeito(heroi({ efeitos: [inv] }), doCatalogo("Invisibilidade"));
  t("relançar a MESMA magia não gera frase de cessão", relancou.linha === "" && relancou.cedeu.length === 0);
  t("e continua havendo uma só na ficha", relancou.pers.efeitos.filter((e) => e.concentracao).length === 1);
  /* e o prazo reinicia, que é o que `empilhar` sempre fez — a troca de C3 não
     pode ter transformado um relançamento em perda */
  t("e quem ficou é a recém-lançada, com o prazo de novo cheio",
    relancou.pers.efeitos[0].nome === "Invisibilidade" && relancou.pers.efeitos[0].turnos === inv.turnos);

  /* ---------------- (6) A FRASE ---------------------------------------- */
  t("a frase começa pela marca da perda", r2.linha.startsWith(MEDIDA_DO_TETO.marcaDaPerda + " "), r2.linha);
  t("e não diz o nome do mecanismo — nem \"concentração\", nem \"efeito\", nem \"teto\"",
    !MEDIDA_DO_TETO.rxMecanismo.test(r2.linha), r2.linha);
  t("ela nomeia a magia que CEDEU e a que TOMOU o lugar",
    r2.linha.includes("Voo") && r2.linha.includes("Invisibilidade"), r2.linha);
  t("e concorda no singular quando cede uma só",
    / escapa dos dedos — /.test(r2.linha) && / o lugar dela\.$/.test(r2.linha), r2.linha);
  /* DUAS CEDENDO: a ficha de SAVE ANTIGO, guardada antes desta versão com as
     duas dentro. Não nasce mais por aqui, mas chega — e a frase tem de
     concordar no plural em vez de listar a primeira e esquecer a outra. */
  const saveAntigo = heroi({ efeitos: [bencao, doCatalogo("Escudo da Fé")] });
  const r6 = firmarEfeito(saveAntigo, voo);
  t("um save antigo com DUAS é reduzido a uma de uma vez só", r6.cedeu.length === 2
    && r6.pers.efeitos.filter((e) => e.concentracao).length === teto, nomes(r6.pers.efeitos));
  t("e a frase concorda no plural, com as duas nomeadas e o \"e\" antes da última",
    /escapam dos dedos/.test(r6.linha) && / o lugar delas\.$/.test(r6.linha)
    && /Bênção e Escudo da Fé/.test(r6.linha), r6.linha);
  t("e a frase plural também não diz o nome do mecanismo", !MEDIDA_DO_TETO.rxMecanismo.test(r6.linha), r6.linha);
  /* `cedeu` e a frase são a mesma verdade em dois formatos — se um dia se
     soltarem, a tela diria uma coisa e a ficha faria outra */
  t("`cedeu` e a frase dizem a mesma coisa", r6.cedeu.every((n) => r6.linha.includes(n))
    && JSON.stringify(r6.cedeu) === JSON.stringify(["Bênção", "Escudo da Fé"]), r6.cedeu.join(","));
  /* determinismo: a mesma entrada dá a mesma frase, sempre (lei v) */
  t("a mesma entrada devolve a mesma frase", firmarEfeito(saveAntigo, voo).linha === r6.linha);
  console.log(`  ··  a frase de uma: ${r2.linha}`);
  console.log(`  ··  a frase de duas: ${r6.linha}`);

  /* ---------------- (7) REGRESSÃO ZERO, CONTRA A PRÓPRIA `empilhar` ---- */
  /* A METADE QUE NÃO PODE MORDER. Para todo efeito SEM a chave, `firmarEfeito`
     tem de ser `empilhar` e mais nada — mesma lista, mesmos objetos, mesma
     ordem, frase vazia, ninguém cedeu. A prova é feita CONTRA `empilhar`
     chamada a chamada: comparar com uma expectativa escrita aqui provaria a
     expectativa, não a regressão. */
  const doAcervo = [];
  for (const c of CL.CLASSES) for (const h of (c.habilidades || [])) doAcervo.push(h);
  const paraCima = heroi({ efeitos: [{ nome: "Vigor de Urso", bonus: 2, turnos: 5 }, bencao] });
  const divergiram = [], falaram = [];
  const conferirRegressao = (rotulo, ef) => {
    const r = firmarEfeito(paraCima, ef);
    if (!mesmaLista(r.pers.efeitos, empilhar(paraCima.efeitos, ef))) divergiram.push(rotulo);
    if (r.linha !== "" || r.cedeu.length !== 0) falaram.push(rotulo);
  };
  for (const m of MAGIAS) { const ef = efeitoDeMagia(m).efeito; if (!temChave(ef)) conferirRegressao(`magia ${m.nome}`, ef); }
  for (const h of doAcervo) { const ef = efeitoDeBuff(h, heroiC).efeito; if (!temChave(ef)) conferirRegressao(`hab ${h.nome}`, ef); }
  conferirRegressao("milagre", efeitoDeMilagre({ nome: "Graça" }, "a fé responde"));
  for (const lixo of [null, undefined, {}, "", 0, { nome: "Sem Nada" }, { nome: "Falso", concentracao: false }]) {
    conferirRegressao(`lixo ${JSON.stringify(lixo)}`, lixo);
  }
  t(`as ${MAGIAS.length} magias e as ${doAcervo.length} habilidades que NÃO concentram passam por \`firmarEfeito\` como passavam por \`empilhar\``,
    divergiram.length === 0, divergiram.slice(0, 6).join(" | "));
  t("e nenhuma delas gera frase ou faz alguém ceder", falaram.length === 0, falaram.slice(0, 6).join(" | "));
  /* e a ficha de entrada pode ser lixo também: `null`, sem `efeitos`, com
     `efeitos: null` — nenhum desses pode custar o turno */
  const fichasTortas = [null, undefined, {}, { efeitos: null }, { efeitos: "nada" }, { efeitos: [null, voo, undefined] }];
  const estourou = [];
  for (const f of fichasTortas) {
    for (const ef of [inv, { nome: "Vigor", bonus: 1 }, null]) {
      try {
        const r = firmarEfeito(f, ef);
        if (!r || !("linha" in r) || !Array.isArray(r.cedeu)) estourou.push(`${JSON.stringify(f)} + ${JSON.stringify(ef)} devolveu torto`);
      } catch (e) { estourou.push(`${JSON.stringify(f)} + ${JSON.stringify(ef)}: ${e.message}`); }
    }
  }
  t("ficha nula, sem `efeitos` ou com buraco no meio não custa o turno", estourou.length === 0, estourou.slice(0, 3).join(" | "));
  /* `= {}` no destructuring NÃO cobre `null` — a lei da casa em uma linha */
  t("`firmarEfeito(null, ...)` devolve a ficha nula de volta, sem inventar uma",
    firmarEfeito(null, inv).pers === null && firmarEfeito(null, inv).linha === "");
  /* e o efeito que chega não é remexido: o objeto que entra é o que fica */
  const novoIntacto = { ...inv };
  firmarEfeito(heroi({ efeitos: [voo] }), inv);
  t("o efeito que chega não é mutado pela porta", JSON.stringify(inv) === JSON.stringify(novoIntacto));

  /* ---------------- (8) `efeitoEmConcentracao` NOS DOIS SENTIDOS ------- */
  /* O DENTE QUE PROVA QUE A ESCOLHA É REGRA E NÃO ORDEM DE CHEGADA. Antes de
     C3 isto era um `.find(...)`: devolvia a PRIMEIRA da lista, ou seja a mais
     velha. Uma prova numa ordem só não distinguiria "devolve a última" de
     "devolve a que por acaso está ali" — por isso a mesma trinca é lida nas
     duas ordens, e as respostas TÊM de ser diferentes. */
  const trinca = [voo, bencao, inv];
  t("numa ficha de save antigo com três, o consumidor devolve a ÚLTIMA a entrar",
    (efeitoEmConcentracao({ efeitos: trinca }) || {}).nome === "Invisibilidade");
  t("e na ordem invertida devolve a outra — a escolha é regra, não sorte de array",
    (efeitoEmConcentracao({ efeitos: [inv, bencao, voo] }) || {}).nome === "Voo");
  /* REGRESSÃO DA SEÇÃO 16, no endereço novo: com UMA só, a resposta é a mesma
     de sempre, e sem nenhuma continua `null`. A mudança de `.find` para o laço
     de trás para a frente não pode ter mexido nesses dois. */
  t("com uma só, devolve essa mesma", (efeitoEmConcentracao({ efeitos: [{ nome: "X" }, inv] }) || {}).nome === "Invisibilidade");
  t("sem nenhuma, continua `null`", efeitoEmConcentracao({ efeitos: [{ nome: "X" }] }) === null
    && efeitoEmConcentracao({ efeitos: [] }) === null && efeitoEmConcentracao({ efeitos: null }) === null
    && efeitoEmConcentracao(null) === null);
  t("e buraco no meio da lista não derruba a busca", (efeitoEmConcentracao({ efeitos: [inv, null, undefined] }) || {}).nome === "Invisibilidade");

  /* ---------------- (9) LIGADO AO JOGO: OS TRÊS SÍTIOS DO APP ---------- */
  const quantasNoApp = (rx) => (APP19.match(rx) || []).length;
  t("o App importa a porta que conta a concentração",
    /import \{[^}]*\bfirmarEfeito\b[^}]*\} from "\.\/efeitos\.js"/.test(APP19));
  t("e ela chega ao App por UMA porta só (`firmarOuCeder`), definida uma vez",
    quantasNoApp(/const firmarOuCeder = \(quem, efeito, nome = ""\) => \{/g) === 1);
  t("que é quem chama `firmarEfeito` — e o resto do App não o chama por fora",
    quantasNoApp(/\bfirmarEfeito\(/g) === 1);
  const sitios = [
    [/const fe = firmarOuCeder\(p, buff\.efeito\);/g, "o buff do herói"],
    [/const fe = firmarOuCeder\(comp, buff\.efeito, ac\.companheiro\);/g, "o buff do companheiro"],
    [/const fe = firmarOuCeder\(p0, dur\.efeito\);/g, "a magia de duração"],
  ];
  const faltando = sitios.filter(([rx]) => quantasNoApp(rx) !== 1).map(([, n]) => n);
  t(`os ${MEDIDA_DO_TETO.sitiosDoApp} nascimentos que podem segurar algo passam pela porta`,
    faltando.length === 0, `faltou: ${faltando.join(", ")}`);
  /* e em mais nenhum: a definição é `const firmarOuCeder = (quem, ...)`, sem
     parêntese colado ao nome, então este regex conta CHAMADAS e só elas. Um
     quarto nascimento que aparecesse sem passar por esta seção bate aqui. */
  t("e a porta é chamada exatamente nesses três sítios, e em mais nenhum",
    quantasNoApp(/\bfirmarOuCeder\(/g) === MEDIDA_DO_TETO.sitiosDoApp,
    `${quantasNoApp(/\bfirmarOuCeder\(/g)} chamadas`);
  /* O CONTROLE NEGATIVO — o caminho velho não pode voltar em silêncio. É a
     forma de regressão que esta etapa mais arrisca: um merge que restaure a
     linha antiga deixa tudo compilando, tudo verde, e o herói segurando duas
     de novo. */
  t("a pilha genérica não é mais o caminho de nenhum dos três",
    !/empilhar\(p\.efeitos, buff\.efeito\)/.test(APP19_CODIGO)
    && !/empilhar\(g\.efeitos, buff\.efeito\)/.test(APP19_CODIGO)
    && !/empilhar\(p0\.efeitos, dur\.efeito\)/.test(APP19_CODIGO));
  /* LEI "nunca pode custar o turno" — e o RECUO É DE PROPÓSITO, não é bug.
     Se a porta estourar, o efeito ainda tem de ENTRAR: devolver a ficha
     intocada tiraria do jogador o buff que ele acabou de pagar em PM e em
     turno. O recuo é o comportamento de ANTES desta versão (`empilhar` puro,
     ninguém cede) — pior regra, nunca perda de propriedade. Fica escrito para
     ninguém "consertar" isto achando que é um resto do código velho. */
  /* E A PORTA TEM DE DEVOLVER O QUE A REGRA DECIDIU. Este é o dente contra a
     sabotagem mais silenciosa desta etapa: uma porta que CHAMA `firmarEfeito`,
     imprime a frase da troca e devolve a ficha DE ENTRADA passa em todas as
     âncoras de cima — os três sítios continuam lá, o import continua lá, a
     chamada continua lá — e o jogador lê que perdeu a Bênção enquanto continua
     segurando as duas. O App não roda em Node, então o que se pode travar é a
     forma dos dois retornos; são eles que dizem qual ficha sai. */
  t("e a ficha que sai da porta é a que `firmarEfeito` devolveu, não a que entrou",
    /if \(!fe\.linha\) return \{ pers: fe\.pers, linha: "" \};/.test(APP19)
    && /return \{ pers: fe\.pers, linha: nome \? String\(fe\.linha\)\.replace\("💢 ", "💢 " \+ nome \+ " — "\) : fe\.linha \};/.test(APP19));
  t("a fiação nova cala em vez de custar o turno", /calou\("concentracaoFirmada", e\)/.test(APP19));
  t("e o recuo da porta guarda o buff pago: `empilhar` puro, ninguém cede",
    /catch \(e\) \{\s*calou\("concentracaoFirmada", e\);\s*try \{ return \{ pers: quem \? \{ \.\.\.quem, efeitos: empilhar\(quem\.efeitos, efeito\) \} : quem, linha: "" \}; \}/.test(APP19));
  t("e o recuo do recuo também cala", /calou\("concentracaoFirmadaRecuo", e2\)/.test(APP19));
  /* O APP NÃO ESCREVE REGRA NEM PROSA. A frase inteira nasce no módulo; a
     única coisa que a tela acrescenta é o nome do dono, pelo molde do abrigo.
     Se o App começar a montar a frase, a troca passa a soar diferente na mesa
     e na arena — e uma delas envelhece sem ninguém ver. */
  t("o App não inventa a frase da troca — só põe o dono na frente",
    /replace\("💢 ", "💢 " \+ nome \+ " — "\)/.test(APP19)
    && !/escapa dos dedos/.test(APP19_CODIGO) && !/toma o lugar/.test(APP19_CODIGO));
  /* e as três linhas sobem SEPARADAS do texto do buff: primeiro o que subiu,
     depois o preço — a ordem em que a coisa acontece */
  t("e a linha da troca sobe separada, nos três sítios da tela",
    /if \(buffH\.troca\) linhas\.push\(buffH\.troca\);/.test(APP19)
    && /if \(r4\.troca\) pushMsgs\(\[\{ autor: "sistema", texto: r4\.troca \}\]\);/.test(APP19)
    && /\.\.\.\(fe\.linha \? \[\{ autor: "sistema", texto: fe\.linha \}\] : \[\]\)/.test(APP19));

  /* ---------------- (10) O GENÉRICO CONTINUA GENÉRICO ------------------ */
  /* A outra metade da decisão de projeto: a regra nova mora numa porta
     PRÓPRIA justamente para não entrar no caminho do frasco de cerveja. Se
     `firmarEfeito` aparecer na poção, na relíquia ou no canal do Mestre, uma
     regra de magia vazou para onde não há magia nenhuma. */
  const vazou = MEDIDA_DO_TETO.modulosDoGenerico.filter((f) => {
    const s = readFileSync(RAIZ + f, "utf8");
    return /\bfirmarEfeito\b/.test(s) || !/\bempilhar\(/.test(s);
  });
  t("o frasco, a relíquia e o canal do Mestre continuam na pilha genérica",
    vazou.length === 0, vazou.join(", "));
  /* e o milagre do App também: ele não tem tabela que declare concentração,
     e inventá-la no nascimento seria pôr no efeito um número sem régua */
  t("e o milagre do App também continua em `empilhar`",
    /empilhar\(p\.efeitos, efeitoDeMilagre\(ef, mil\.desc\)\)/.test(APP19));
  /* a arena é a quarta porta, e a prova dela mora em `teste-arena.mjs` (11) —
     aqui fica só a ponte, para quem ler esta seção saber que ela existe */
  t("e a quarta porta é a da arena, que importa `firmarEfeito` e não `empilhar`",
    /import \{ firmarEfeito,/.test(readFileSync(RAIZ + "arena.js", "utf8")));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
