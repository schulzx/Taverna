/* teste-invocacoes.mjs (v9.46) — a criatura que era só uma frase.

   Treze habilidades de quatro classes prometiam um aliado no campo. O
   necromante entra pela mesma porta do invocador, com outra ficção e em
   número — e é isso que este arquivo cobra.                            */
import {
  INVOCACOES, invocacaoDe, ehInvocacao, criarInvocacoes, limiteDeInvocacoes,
  invocacoesDe, conjuracoesAtivas, expirarInvocacoes, dispensarTodas,
  sacrificarInvocacao, repartirDano, temEloVital, temFusao, temVozDeComando,
  resumoInvocacoesPrompt,
} from "../src/invocacoes.js";
import { CLASSES } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";
import { montarGrade, posicionarPerto, distanciaM } from "../src/grid.js";
import { decidirAcaoCompanheiro, garantirFichaCompanheiro } from "../src/companheiros.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const hab = (nome, descricao) => ({ nome, descricao, custo: 4 });
const heroi = (extra = {}) => ({ nome: "Ysra", classe: "Invocador", nivel: 6, vida: 40, vidaMax: 40, mana: 20, manaMax: 20, grupo: [], habilidades: [], ...extra });

/* ============ 1. TODA HABILIDADE DE INVOCAÇÃO É RECONHECIDA ============ */
sec("1. as treze do catálogo têm molde");
const doCatalogo = [];
/* SUBCLASSES e ESPECIALIZACOES mapeiam o nome DIRETO para a lista de
   habilidades — não há objeto intermediário com `.habilidades`. */
for (const c of CLASSES) for (const h of c.habilidades || []) doCatalogo.push({ fonte: c.nome, ...h });
for (const [nome, lst] of Object.entries(SUBCLASSES)) for (const h of lst || []) doCatalogo.push({ fonte: nome, ...h });
for (const [nome, lst] of Object.entries(ESPECIALIZACOES)) for (const h of lst || []) doCatalogo.push({ fonte: nome, ...h });

const devemSer = [
  "Invocar Fera Menor", "Invocar Fera Maior", "Servo Elemental", "Espírito Guardião",
  "Avatar Ancestral", "Autômato Sentinela", "Autômato Guardião", "Obra-Prima",
  "Servos de Osso", "Legião de Ossos", "Companheiro Animal",
];
for (const nome of devemSer) {
  const h = doCatalogo.find((x) => x.nome === nome);
  t(`${nome} existe no catálogo e é invocação`, !!h && ehInvocacao(h));
}
t("Animar Mortos (grimório) também", ehInvocacao(hab("Animar Mortos", "Um cadáver se levanta e obedece por um dia.")));
t("Golpe Poderoso NÃO é invocação", !ehInvocacao(hab("Golpe Poderoso", "Dano dobrado num golpe só.")));
t("Bola de Fogo NÃO é invocação", !ehInvocacao(hab("Bola de Fogo", "Explosão de chamas em área.")));
t("nulo não quebra", !ehInvocacao(null));
t("todo molde tem prazo e PV", INVOCACOES.every((i) => i.turnos > 0 && i.pv > 0));

/* ============ 2. A CRIATURA QUE NASCE ============ */
sec("2. a ficha que entra no campo");
{
  const h = hab("Invocar Fera Menor", "Chama uma fera espiritual que luta por 3 turnos.");
  const novas = criarInvocacoes(h, heroi(), 1);
  t("nasce uma fera", novas.length === 1);
  const f = novas[0];
  t("com PV que escala com o nível", f.vida === f.vidaMax && f.vida > 10);
  t("marcada como invocada", f.invocada === true);
  t("com prazo de 3 rodadas", f.expiraEm === 4);
  t("com dono", f.dono === "Ysra");
  t("sem XP e sem vínculo", f.xp === 0 && f.vinculo === 0);

  /* o motor de companheiro assume dali em diante */
  const pronta = garantirFichaCompanheiro(f);
  t("ganha classe e habilidades do motor de companheiro", !!pronta.classe && (pronta.habilidades || []).length > 0);
  /* a classe vem do MOLDE, não do sorteio por nome: no primeiro teste em
     jogo a fera de garras saiu Feiticeiro e conjurava. */
  t("a fera é Guerreiro, não conjuradora", pronta.classe === "Guerreiro");
  t("a torreta é Caçador (atira de longe)", garantirFichaCompanheiro(criarInvocacoes(hab("Autômato Sentinela", "torreta que atira"), heroi(), 1)[0]).classe === "Caçador");
  t("o espírito guardião é Clérigo (protege)", garantirFichaCompanheiro(criarInvocacoes(hab("Espírito Guardião", "protege um aliado"), heroi(), 1)[0]).classe === "Clérigo");
  const acao = decidirAcaoCompanheiro(pronta, { inimigos: [{ nome: "Orc", vida: 20, vidaMax: 20 }], aliados: [], jogador: heroi(), rodada: 1 });
  t("e decide um turno sozinha", !!acao && !!acao.tipo);
}

sec("3. o necromante ergue MAIS DE UM");
{
  const servos = criarInvocacoes(hab("Servos de Osso", "Ergue esqueletos que lutam ao seu lado por alguns turnos."), heroi({ classe: "Mago" }), 1);
  t("Servos de Osso ergue 2", servos.length === 2);
  t("com nomes distintos", servos[0].nome !== servos[1].nome);
  const legiao = criarInvocacoes(hab("Legião de Ossos", "Ergue um pequeno exército de esqueletos por vários turnos."), heroi({ classe: "Mago" }), 1);
  t("Legião de Ossos ergue 4", legiao.length === 4);
  t("e é um esqueleto por corpo, não um bloco", legiao.every((g) => g.vidaMax === legiao[0].vidaMax));
  t("mas conta como UMA conjuração", new Set(legiao.map((g) => g.invocacaoId)).size === 1);
}

sec("4. o avatar é maior que a fera menor");
{
  const p = heroi({ nivel: 10 });
  const menor = criarInvocacoes(hab("Invocar Fera Menor", "fera espiritual"), p, 1)[0];
  const avatar = criarInvocacoes(hab("Avatar Ancestral", "Invoca um avatar lendário por 3 turnos."), p, 1)[0];
  t("o avatar tem muito mais PV", avatar.vidaMax > menor.vidaMax * 2);
  t("e ocupa mais chão", avatar.tamanho === "grande");
  const colosso = criarInvocacoes(hab("Obra-Prima", "Ativa sua criação máxima: um colosso por 3 turnos."), p, 1)[0];
  t("o colosso também é grande", colosso.tamanho === "grande");
  const torreta = criarInvocacoes(hab("Autômato Sentinela", "Constrói uma torreta que atira por 4 turnos."), p, 1)[0];
  t("a torreta atira de longe", torreta.distancia === true);
}

/* ============ 3. O TETO ============ */
sec("5. quantas se sustenta ao mesmo tempo");
{
  const semPortal = heroi();
  t("um de cada vez, por padrão", limiteDeInvocacoes(semPortal) === 1);
  const comPortal = heroi({ habilidades: [{ nome: "Portal Duplo", descricao: "Mantém DUAS invocações ao mesmo tempo." }] });
  t("duas com Portal Duplo", limiteDeInvocacoes(comPortal) === 2);
  const comUma = heroi({ grupo: criarInvocacoes(hab("Invocar Fera Menor", "fera"), heroi(), 1) });
  t("uma ativa conta como uma", conjuracoesAtivas(comUma) === 1);
  const comLegiao = heroi({ grupo: criarInvocacoes(hab("Legião de Ossos", "exército de esqueletos"), heroi(), 1) });
  t("a legião de quatro conta como UMA", conjuracoesAtivas(comLegiao) === 1);
  t("companheiro de verdade não conta", conjuracoesAtivas(heroi({ grupo: [{ nome: "Ilse", vida: 10 }] })) === 0);
}

/* ============ 4. O PRAZO ============ */
sec("6. o prazo vence e ela some");
{
  const p = heroi({ grupo: criarInvocacoes(hab("Invocar Fera Menor", "fera"), heroi(), 1) });
  t("na rodada 3 ainda está lá", expirarInvocacoes(p, 3).sumiram.length === 0);
  const venceu = expirarInvocacoes(p, 4);
  t("na rodada 4 vence", venceu.sumiram.length === 1);
  t("e sai do grupo", invocacoesDe(venceu.pers).length === 0);
  t("o jogador lê o porquê", /prazo/.test(venceu.linhas[0]));

  const misto = heroi({ grupo: [{ nome: "Ilse", vida: 10, vidaMax: 10 }, ...criarInvocacoes(hab("Invocar Fera Menor", "fera"), heroi(), 1)] });
  const v2 = expirarInvocacoes(misto, 9);
  t("o companheiro de verdade fica", v2.pers.grupo.some((g) => g.nome === "Ilse"));
  const d = dispensarTodas(misto);
  t("o fim da luta dispensa a invocação", d.sumiram.length === 1);
  t("e não dispensa a companheira", d.pers.grupo.length === 1 && d.pers.grupo[0].nome === "Ilse");
  t("sem invocação, dispensar não faz nada", dispensarTodas(heroi()).sumiram.length === 0);
}

/* ============ 5. AS OUTRAS DEZ DO INVOCADOR ============ */
sec("7. sacrifício arcano");
{
  const p = heroi({ mana: 5, grupo: criarInvocacoes(hab("Invocar Fera Maior", "fera poderosa"), heroi(), 1) });
  const s = sacrificarInvocacao(p);
  t("desfaz e devolve PM", s.ok && s.pm > 0);
  t("a mana sobe de verdade", s.pers.mana > 5);
  t("e a criatura sai do campo", invocacoesDe(s.pers).length === 0);
  t("sem invocação, recusa com motivo", !sacrificarInvocacao(heroi()).ok);
  /* metade do que restava: quem sacrifica cedo ganha mais */
  const ferida = heroi({ mana: 0, grupo: [{ ...criarInvocacoes(hab("Invocar Fera Maior", "fera"), heroi(), 1)[0], vida: 4 }] });
  t("uma fera quase morta rende pouco", sacrificarInvocacao(ferida).pm <= 2);
}

sec("8. elo vital e fusão espiritual");
{
  const inv = criarInvocacoes(hab("Invocar Fera Menor", "fera"), heroi(), 1);
  const semNada = heroi({ grupo: inv });
  t("sem as habilidades, o golpe é todo seu", repartirDano(semNada, 10).dano === 10);

  const comElo = heroi({ grupo: inv, habilidades: [{ nome: "Elo Vital", descricao: "Divide o dano recebido com sua invocação." }] });
  t("Elo Vital é reconhecido", temEloVital(comElo));
  const r1 = repartirDano(comElo, 10);
  t("divide o golpe ao meio", r1.dano === 5);
  t("e a fera apanha de verdade", r1.pers.grupo[0].vida < inv[0].vida);
  t("o jogador vê a divisão", /Elo Vital/.test(r1.linhas[0]));

  const comFusao = heroi({ grupo: inv, habilidades: [
    { nome: "Elo Vital", descricao: "Divide o dano recebido com sua invocação." },
    { nome: "Fusão Espiritual", descricao: "Funde-se à invocação: os golpes atingem ela primeiro." },
  ] });
  t("Fusão é reconhecida", temFusao(comFusao));
  const r2 = repartirDano(comFusao, 10);
  t("a fusão vence o elo e leva o golpe inteiro", r2.dano === 0);
  t("quem tem as duas não paga nada", r2.pers.grupo[0].vida === inv[0].vida - 10);

  t("sem invocação no campo, nada muda", repartirDano(heroi({ habilidades: [{ nome: "Elo Vital", descricao: "Divide o dano recebido com sua invocação." }] }), 10).dano === 10);
  t("dano zero não gasta nada", repartirDano(comElo, 0).dano === 0);
}

sec("9. voz de comando");
{
  t("é reconhecida", temVozDeComando(heroi({ habilidades: [{ nome: "Voz de Comando", descricao: "Todas as invocações agem duas vezes neste turno." }] })));
  t("e não vem de graça", !temVozDeComando(heroi()));
}

/* ============ 6. O TABULEIRO ============ */
sec("10. a criatura nasce ao lado de quem a chamou");
{
  const grade = montarGrade({ planta: "campo", largura: 16, altura: 12 });
  const conjurador = { nome: "Ysra", x: 8, y: 10 };
  const fera = posicionarPerto(grade, { nome: "Fera Espiritual", tamanho: "medio" }, conjurador, [conjurador]);
  t("cai a um passo do conjurador", distanciaM(fera, conjurador) <= 2.2);
  t("e não em cima dele", !(fera.x === conjurador.x && fera.y === conjurador.y));
  const segunda = posicionarPerto(grade, { nome: "Fera 2", tamanho: "medio" }, conjurador, [conjurador, fera]);
  t("a segunda não pisa na primeira", !(segunda.x === fera.x && segunda.y === fera.y));
  t("nem no conjurador", !(segunda.x === conjurador.x && segunda.y === conjurador.y));
}

sec("11. o que o Mestre lê");
{
  const p = heroi({ grupo: criarInvocacoes(hab("Invocar Fera Menor", "fera"), heroi(), 1) });
  const txt = resumoInvocacoesPrompt(p);
  t("nomeia a criatura e o PV", /Fera Espiritual/.test(txt) && /PV/.test(txt));
  t("e proíbe o Mestre de mexer nela", /Não as remova/.test(txt));
  t("sem invocação, não gera linha", resumoInvocacoesPrompt(heroi()) === "");
}

console.log(`\ninvocações v9.46: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
