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

/* v9.233 (P3): `ABSORCAO_DO_BUFF` e `absorverDano` entraram nesta lista — é a
   segunda metade da família defensiva, e as seções 13/14 a provam. A lista
   cresceu, nenhum nome saiu dela: as seções 1–12 leem exatamente o que liam. */
const {
  LIMITES_DO_EFEITO, BUFF_DA_HABILIDADE, EFEITO_DO_MILAGRE, EFEITO_DA_MAGIA,
  APLICA_UNIVERSAL, APLICA_NA_NOTA, ABSORCAO_DO_BUFF,
  efeitosDe, empilhar, retirar, efeitoDeBuff, efeitoDeMilagre, turnosDaMagia,
  efeitoDeMagia, efeitoEmConcentracao, quebrarConcentracao, buffsNaRolagem, notaDosBuffs,
  absorverDano,
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
  t("o efeito nasce por efeitoDeBuff e vai para a pilha", /efeitoDeBuff\(h, pers, res\.cond\.turnos\)/.test(app) && /empilhar\(p\.efeitos, buff\.efeito\)/.test(app));
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
  t("e entra em `comp.efeitos` pela pilha, não por atribuição solta",
    quantas(/empilhar\(g\.efeitos,\s*buff\.efeito\)/g) === 1);
  /* O EFEITO FICA EM QUEM CONJUROU, mesmo quando a condição se espalha —
     o mesmo que o herói já faz. Sem esta guarda, um abrigo por companheiro
     no grupo inteiro seria três escudos na mesma pele: o número crescendo
     sem teto que `ABSORCAO_DO_BUFF` existe para impedir. */
  t("e vai para QUEM conjurou, não para o grupo inteiro",
    /g\.nome === ac\.companheiro \? \{ \.\.\.g, efeitos: empilhar\(g\.efeitos, buff\.efeito\) \}/.test(APP));
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

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
