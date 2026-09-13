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
const { readFileSync } = await import("node:fs");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const {
  LIMITES_DO_EFEITO, BUFF_DA_HABILIDADE, EFEITO_DO_MILAGRE, EFEITO_DA_MAGIA,
  APLICA_UNIVERSAL, APLICA_NA_NOTA,
  efeitosDe, empilhar, retirar, efeitoDeBuff, efeitoDeMilagre, turnosDaMagia,
  efeitoDeMagia, efeitoEmConcentracao, quebrarConcentracao, buffsNaRolagem, notaDosBuffs,
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

sec("9. a nota da rolagem — a honestidade com o Narrador");
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

sec("10. a concentração — o que o corpo segura");
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

sec("11. ligado ao jogo — os quatro leitores do órgão");
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
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
