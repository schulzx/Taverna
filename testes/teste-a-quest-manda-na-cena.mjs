/* teste-a-quest-manda-na-cena.mjs — QC1 (22/11/2026): a quest manda na cena

   A décima quinta sessão do Mestre vivo (mente/lancamento/mestre-vivo-sessao-15.md):
   o sistema tinha «O Livro dos Nomes» desenhada e não a contou ao Narrador —
   a tela mostrou «Ir até A Capela do Afogado» nos 56 turnos, e a pauta calava
   o destino (a ponte do RUMO vazia, o «falta» de um «algum» omitido). Sem
   matéria, a IA inventou um Corvo, uma cripta e uma filha flautista, e nada
   disso virou fato.

   O que esta suíte prova, sobre um estado mínimo no formato do save do fim
   da sessão (a quest, o registo dela, o quadro, Mercy no registo — não o
   save inteiro):
     1. a ponte do passo é o destino do botão, e diz quem sabe o caminho;
     2. o PASSO diz o «falta» que a tela mostra, e só esse;
     3. o segredo não aparece (o servo, o copista, o que há lá dentro);
     4. a pauta inteira do turno traz a ponte no RUMO;
     5. o figurante do lugar: mesma semente, mesmo figurante; entra em cena
        e o livro de fatos aceita-o;
     6. o elenco fechado: a linha do NÃO PODE;
     7. o pior caso cabe no teto, e a ponte e o veto entram nele. */
import { aPonteDoPasso, quemSabeDoCaso, A_PONTE_DO_PASSO } from "../src/motor/a-ponte-do-passo.js";
import { oRumoDaBusca } from "../src/propostas-da-abertura.js";
import { osPassosDasQuests } from "../src/a-quest-manda.js";
import { osQuadrosDoEstado } from "../src/quadro-da-quest.js";
import { aMesaDasQuests, QUESTS_DO_TURNO } from "../src/motor/quests-do-turno.js";
import { aPautaDoTurno } from "../src/motor/pauta-do-turno.js";
import { textoDaPauta, TETO_DA_PAUTA } from "../src/pauta.js";
import { oFiguranteDaCena, oElencoFechado, O_FIGURANTE_DA_CENA, O_ELENCO_FECHADO } from "../src/motor/o-figurante.js";
import { criarNPC } from "../src/npcs.js";
import { anotarOLivro } from "../src/motor/livro-do-turno.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* o estado mínimo, tirado do save do fim da sessão 15 (só o que a quest lê) */
const S15 = {
 "espinha": {
  "estrutura": "misterio",
  "semente": "A lenda de Barnabas|Horror cósmico",
  "esqueleto": {
   "v": 1,
   "estrutura": "misterio",
   "semente": "A lenda de Barnabas|Horror cósmico",
   "atos": [
    {
     "ato": 0,
     "passo": 1,
     "posicao": "cedo",
     "maos": [
      "tenente",
      "recurso"
     ],
     "cidade": "Rio do Martelo",
     "quest": "o_livro_dos_nomes",
     "mao": "tenente",
     "contra": [
      1,
      2
     ],
     "papeis": {
      "escrivao": {
       "nome": "Mercy Quintus",
       "cidade": "Rio do Martelo",
       "local": "A Lâmpada dos Sonhos"
      },
      "casa": {
       "nome": "A Capela do Afogado",
       "cidade": "Rio do Martelo",
       "chave": "Rio do Martelo|templo"
      },
      "servo": {
       "nome": "Thaddeus Crane, a Coisa no Poço"
      },
      "copista": {
       "nome": "Tabitha",
       "cidade": "Rio do Martelo",
       "local": "A Praça de Armas do Afogado"
      },
      "livro": {
       "nome": "o livro dos nomes",
       "cidade": "Rio do Martelo"
      }
     },
     "fraqueza": false
    }
   ],
   "coracao": [],
   "fraqueza": null,
   "ordem": [
    {
     "id": "o_livro_dos_nomes",
     "tipo": 1,
     "ato": 0
    }
   ],
   "semQuest": [],
   "semContestacao": []
  },
  "quests": {
   "v": 1,
   "atos": [
    0
   ],
   "registos": [
    {
     "v": 1,
     "id": "o_livro_dos_nomes",
     "tipo": 1,
     "inicio": 1,
     "ultimoAvanco": 1,
     "papeis": {
      "escrivao": {
       "nome": "Mercy Quintus",
       "cidade": "Rio do Martelo",
       "local": "A Lâmpada dos Sonhos",
       "tipo": "pessoa",
       "id": "npc|Mercy Quintus"
      },
      "casa": {
       "nome": "A Capela do Afogado",
       "cidade": "Rio do Martelo",
       "chave": "Rio do Martelo|templo",
       "tipo": "lugar",
       "id": "Rio do Martelo|templo"
      },
      "servo": {
       "nome": "Thaddeus Crane, a Coisa no Poço",
       "tipo": "pessoa",
       "id": ""
      },
      "copista": {
       "nome": "Tabitha",
       "cidade": "Rio do Martelo",
       "local": "A Praça de Armas do Afogado",
       "tipo": "pessoa",
       "id": ""
      },
      "livro": {
       "nome": "o livro dos nomes",
       "cidade": "Rio do Martelo",
       "tipo": "item",
       "id": "livro dos nomes"
      }
     },
     "feitas": {
      "escrivao": {
       "dia": 1,
       "ramo": null,
       "variante": null
      }
     },
     "escolhas": {},
     "acesas": {
      "escrivao": 1,
      "casa": 1
     },
     "reviravoltas": [],
     "consequencias": [],
     "estado": "aberta",
     "motivo": null,
     "desfecho": null,
     "fecho": null,
     "fechouEm": null
    }
   ],
   "fora": [],
   "aplicadas": {
    "o_livro_dos_nomes": 0
   },
   "pesadas": [],
   "passos": [],
   "premissas": [],
   "desfecho": null,
   "fim": null
  }
 },
 "historia": {
  "estrutura": "misterio",
  "etapa": 0,
  "marcos": 0,
  "feitos": [],
  "capitulo": 1,
  "capitulos": []
 },
 "dia": 1,
 "cidadeAtual": "Rio do Martelo",
 "factos": {
  "v": 1,
  "pessoas": {
   "npc|Mercy Quintus": {
    "nome": "Mercy Quintus",
    "nomeado": {
     "de": 1
    },
    "visto": {
     "de": 1,
     "ate": 1,
     "vezes": 2,
     "turno": 47
    },
    "falou": {
     "de": 1,
     "ate": 1,
     "vezes": 2,
     "turno": 47
    }
   }
  },
  "lugares": {}
 },
 "npcs": {
  "Mercy Quintus": {
   "conhecidoEm": 1,
   "nome": "Mercy Quintus",
   "papel": "música de canto",
   "relacao": "desconhecido",
   "genero": "mulher",
   "local": "A Lâmpada dos Sonhos, em Rio do Martelo",
   "status": "vivo",
   "segredo": "",
   "notas": "",
   "laco": {
    "tipo": "rivalidade",
    "forca": 1,
    "desde": 1,
    "rompido": false,
    "rompidoEm": 0
   },
   "entre": {},
   "consultas": 0,
   "ultimaVez": 4,
   "semente": "npc|Mercy Quintus|música de canto"
  },
  "Cornelius": {
   "conhecidoEm": 1,
   "nome": "Cornelius",
   "papel": "mercador(a)",
   "relacao": "desconhecido",
   "genero": "",
   "local": "Rio do Martelo",
   "status": "vivo",
   "segredo": "",
   "notas": "",
   "laco": null,
   "entre": {},
   "consultas": 0,
   "ultimaVez": 20,
   "semente": "npc|Cornelius|mercador(a)"
  }
 },
 "abertura": {
  "v": 1,
  "principalId": "mis_principal",
  "cidade": "Rio do Martelo",
  "chegada": "à porta de Rio do Martelo, com a poeira da estrada ainda na roupa",
  "razao": "aconteceu uma coisa que não se explica, e o único fio solto que leva a algum lado é Zipporah, em Rio do Martelo, e a ordem de que fugiu procura a mesma coisa",
  "sabe": "Mercy Quintus é quem mais sabe do que está acontecendo; está na Lâmpada dos Sonhos",
  "historia": "Rio do Martelo vive do que os outros trazem para vender aqui; a 4 horas de marcha dela, a sudeste, fica Fenda de Névoa, e as pessoas da região não falam o nome em voz alta",
  "titulo": "O Livro dos Nomes",
  "pista": {
   "nome": "Mercy Quintus",
   "papel": "",
   "local": "A Lâmpada dos Sonhos"
  },
  "alvo": {
   "feitio": "procurar",
   "quem": "Zipporah",
   "onde": "A Ribeira da Névoa",
   "alvo": "",
   "objeto": "Zipporah",
   "origem": "Fenda de Névoa"
  },
  "sinal": "o sino",
  "porta": "um salvo-conduto com selo e nome, pedido na porta e cobrado nas pontes",
  "turnos": 0,
  "semAvanco": 0,
  "feitas": 0,
  "conhecidos": 0,
  "visitados": [],
  "cheios": 0,
  "prenunciado": false,
  "tocou": false,
  "prenunciadoEm": null,
  "tocouEm": null,
  "oQueTocou": ""
 },
 "quadro": {
  "v": 1,
  "cartas": {}
 }
};
const MUNDO = { genero: "Horror cósmico", molde: "sobremundo" };
const BECO = { nome: "o beco atrás das bancas", cidade: "Rio do Martelo" };
const LAMPADA = { nome: "A Lâmpada dos Sonhos", cidade: "Rio do Martelo" };
const GRUPO = [{ nome: "Lavinia Sallow", vida: 12, vidaMax: 12 }];
const estado = (lugar, mais) => ({ ...S15, lugar, personagem: { nome: "Barnabas", vida: 17, vidaMax: 17, grupo: GRUPO }, mundo: MUNDO, nomeCampanha: "A lenda de Barnabas", ...(mais || {}) });
const SEGREDO = /thaddeus|crane|coisa no po[cç]o|tabitha|copista|servo/i;

sec("1. A PONTE DO PASSO É O DESTINO DO BOTÃO");
{
  const E = estado(LAMPADA);
  const passos = osPassosDasQuests(E, {});
  const botao = oRumoDaBusca({ passos, aqui: LAMPADA.nome, cidade: "Rio do Martelo", grupo: GRUPO, emLuta: false, naEstrada: false });
  t("a tela mostra «Ir até A Capela do Afogado» (o botão da sessão)", botao && botao.verbo === "Ir até A Capela do Afogado", botao && botao.verbo);
  const sabem = quemSabeDoCaso(osQuadrosDoEstado(E, {}));
  t("quem sabe do caso é quem o herói já ouviu: Mercy Quintus", sabem.length === 1 && sabem[0] === "Mercy Quintus", JSON.stringify(sabem));
  const ponte = aPonteDoPasso({ passos, aqui: LAMPADA.nome, cidade: "Rio do Martelo", grupo: GRUPO, presentes: ["Lavinia Sallow", "Mercy Quintus"], sabem });
  console.log("      ponte: " + ponte + " (" + ponte.length + ")");
  t("a ponte diz o destino do botão, e a cidade", ponte.startsWith(botao.nome + ", em Rio do Martelo"), ponte);
  t("e quem em cena sabe o caminho (Mercy, que o caso já fez falar)", ponte.endsWith("; Mercy Quintus sabe o caminho"), ponte);
  t("dentro do teto da tabela", ponte.length <= A_PONTE_DO_PASSO.teto);
  const semMercy = aPonteDoPasso({ passos, aqui: BECO.nome, cidade: "Rio do Martelo", grupo: GRUPO, presentes: ["Lavinia Sallow"], sabem });
  t("no beco, sem ninguém fora do grupo, a ponte não põe quem não está (nem a companheira)", !/sabe o caminho/.test(semMercy) && semMercy.includes("A Capela do Afogado"), semMercy);
  /* nunca mais do que o botão: com o herói já na Capela, o botão some e a ponte também */
  const naCapela = aPonteDoPasso({ passos, aqui: "A Capela do Afogado", cidade: "Rio do Martelo", grupo: GRUPO, presentes: [], sabem });
  const botaoNaCapela = oRumoDaBusca({ passos, aqui: "A Capela do Afogado", cidade: "Rio do Martelo", grupo: GRUPO });
  t("lá dentro o botão some, e a ponte também (nem mais do que a tela)", !botaoNaCapela && naCapela === "", naCapela);
  t("na luta e na estrada, nada (o botão também não aparece)", aPonteDoPasso({ passos, aqui: BECO.nome, cidade: "Rio do Martelo", emLuta: true }) === "" && aPonteDoPasso({ passos, aqui: BECO.nome, cidade: "Rio do Martelo", naEstrada: true }) === "");
  t("sem passos (a campanha antiga), a ponte é vazia", aPonteDoPasso({ passos: [], aqui: BECO.nome, cidade: "Rio do Martelo" }) === "" && aPonteDoPasso(null) === "");
}

sec("2. O PASSO DIZ O «FALTA» QUE A TELA MOSTRA, E SÓ ESSE");
{
  const m = aMesaDasQuests(estado(BECO), { cena: { presentes: [], lugar: BECO.nome } });
  console.log("      " + m.passo);
  t("«falta ir à Capela do Afogado» (era omitido por ser um «algum»)", m.passo === "O PASSO: Saber onde quem lê o livro à noite guarda o livro — falta ir à Capela do Afogado", m.passo);
  t("a outra solução do «algum» continua fora (§7)", !/descobrir o que/.test(m.passo));
  t("o caminho que vai à linha é o de ir ao lugar (a tabela)", QUESTS_DO_TURNO.passo.algumIr.includes("esteve"));
}

sec("3. O SEGREDO CONTINUA GUARDADO");
{
  const E = estado(LAMPADA);
  const passos = osPassosDasQuests(E, {});
  const ponte = aPonteDoPasso({ passos, aqui: LAMPADA.nome, cidade: "Rio do Martelo", grupo: GRUPO, presentes: ["Mercy Quintus"], sabem: quemSabeDoCaso(osQuadrosDoEstado(E, {})) });
  const m = aMesaDasQuests(E, { cena: { presentes: ["Mercy Quintus"], lugar: LAMPADA.nome } });
  t("nem a ponte nem o passo dizem quem é o servo, o copista ou o que há lá dentro", !SEGREDO.test(ponte) && !SEGREDO.test(m.passo), ponte + " | " + m.passo);
}

sec("4. A PAUTA INTEIRA DO TURNO TRAZ A PONTE NO RUMO");
let pautaDoBeco = null;
{
  const erros = [];
  const r = aPautaDoTurno(estado(LAMPADA), { frase: "pergunto a Mercy Quintus quem levou o livro" }, { calou: (o, e) => erros.push(o + ": " + (e && e.message)) });
  const tx = textoDaPauta(r.pauta, { turno: 57 });
  t("nenhum órgão calou", erros.length === 0, erros.join(" | "));
  t("o RUMO aponta para a Capela do Afogado", (r.pauta.rumo || []).some((l) => l.includes("uma coisa só aponta para: A Capela do Afogado, em Rio do Martelo")), JSON.stringify(r.pauta.rumo));
  t("e a linha chega ao texto do Narrador", tx.includes("A Capela do Afogado, em Rio do Martelo — é para lá que a pista do caso leva"));
  t("o MOMENTO diz o «falta»", tx.includes("falta ir à Capela do Afogado"));
  t("o segredo não está na pauta", !SEGREDO.test(tx), (tx.match(SEGREDO) || [""])[0]);
  const r2 = aPautaDoTurno(estado(BECO), { frase: "olho em volta" }, {});
  pautaDoBeco = r2.pauta;
  t("no beco também (o turno do jogador sem pergunta)", (r2.pauta.rumo || []).some((l) => l.includes("A Capela do Afogado")));
}

sec("5. O FIGURANTE DO LUGAR");
{
  const E = estado(BECO);
  const f1 = oFiguranteDaCena(E, { comNome: 0 });
  const f2 = oFiguranteDaCena(estado(BECO), { comNome: 0 });
  console.log("      " + JSON.stringify(f1 && { nome: f1.nome, papel: f1.papel, tique: f1.tique }));
  t("o beco (sítio sem função, dentro dos muros) tem um figurante com nome", !!(f1 && f1.nome && f1.papel && f1.tique));
  t("mesma semente, mesmo figurante", JSON.stringify(f1) === JSON.stringify(f2));
  t("outro sítio, outra pessoa", (() => { const f3 = oFiguranteDaCena(estado({ nome: "o pátio dos curtumes", cidade: "Rio do Martelo" }), { comNome: 0 }); return !!f3 && f3.nome !== f1.nome; })());
  t("o ofício é o do tipo do lugar (na taverna, quem serve ao balcão)", (() => { const f = oFiguranteDaCena(estado(LAMPADA), { comNome: 0 }); return !!f && /balcão/.test(f.papel); })());
  t("não repete nome que o sistema já deu (o registo, o grupo, a abertura, os papéis da quest)", (() => {
    const proibidos = ["mercy", "cornelius", "lavinia", "sallow", "zipporah", "thaddeus", "tabitha", "barnabas", "quintus"];
    for (let i = 0; i < 40; i++) { const f = oFiguranteDaCena(estado({ nome: "o beco número " + i, cidade: "Rio do Martelo" }), { comNome: 0 }); if (f && f.nome.toLowerCase().split(" ").some((w) => proibidos.includes(w))) return false; }
    return true;
  })());
  t("com gente com nome em cena, não há figurante", oFiguranteDaCena(E, { comNome: 1 }) === null);
  t("na luta, na masmorra, no acampamento e fora dos muros, ninguém", oFiguranteDaCena({ ...E, combate: {} }, { comNome: 0 }) === null && oFiguranteDaCena({ ...E, masmorra: {} }, { comNome: 0 }) === null
    && oFiguranteDaCena({ ...E, acampado: true }, { comNome: 0 }) === null && oFiguranteDaCena(estado({ nome: "Fenda de Névoa", cidade: "Rio do Martelo", distancia: "perto" }), { comNome: 0 }) === null);
  t("o que o elenco do lugar já escalou e o registo não tem: regista-se esse, não outro", (() => {
    const a = oFiguranteDaCena(estado(LAMPADA), { comNome: 1, atende: { nome: "Josiah Marsh", rotulo: "moço da casa", genero: "homem" } });
    return !!a && a.nome === "Josiah Marsh" && a.papel === "moço da casa" && oFiguranteDaCena(estado(LAMPADA, { npcs: { ...S15.npcs, "Josiah Marsh": {} } }), { comNome: 1, atende: { nome: "Josiah Marsh" } }) === null;
  })());
  /* o App regista-o como o batismo (criarNPC); daí em diante está em cena e o livro conhece-o */
  const npcs = { ...S15.npcs, [f1.nome]: criarNPC(f1.nome, f1.ficha) };
  const r = aPautaDoTurno(estado(BECO, { npcs }), { frase: `pergunto ao ${f1.papel} se viu alguém passar` }, {});
  const tx = textoDaPauta(r.pauta, { turno: 57 });
  t("registado, o figurante está em EM CENA", tx.includes(f1.nome), tx.split("\n").find((l) => l.startsWith("EM CENA")));
  const lv = anotarOLivro(estado(BECO, { npcs }), { falouCom: [f1.nome] }, {});
  const id = lv && Object.keys(lv.factos.pessoas).find((k) => lv.factos.pessoas[k].nome === f1.nome);
  t("e o livro de fatos aceita-o (falou com ele vira fato)", !!id && !!lv.factos.pessoas[id].falou, JSON.stringify(lv && lv.notas));
  const inventado = anotarOLivro(estado(BECO), { falouCom: ["Corvo"] }, {});
  t("o nome que a prosa inventou continua a não entrar (o Corvo da sessão)", !Object.values(inventado.factos.pessoas).some((p) => p.nome === "Corvo"));
  t("a nota do figurante leva o traço de fala (a tabela)", f1.ficha.notas === O_FIGURANTE_DA_CENA.notas.replace("{tique}", f1.tique));
}

sec("6. O ELENCO FECHADO");
{
  const l = oElencoFechado({ nomes: ["Lavinia Sallow", "Mercy Quintus", "Caleb"], lugar: BECO.nome });
  console.log("      " + l + " (" + l.length + ")");
  t("nome só para quem o sistema pôs em cena, e a cena não muda de sítio sozinha", l === "dar nome a quem não é Lavinia Sallow, Mercy Quintus ou Caleb (quem mais aparecer fica sem nome), ou mudar a cena de lugar sem o sistema", l);
  t("sem ninguém com nome, a forma vazia", oElencoFechado({ nomes: [], lugar: BECO.nome }) === O_ELENCO_FECHADO.vazio);
  t("no máximo a tabela de nomes, sem repetir", oElencoFechado({ nomes: ["A", "B", "C", "D", "E", "F", "G", "a"], lugar: "x" }) === O_ELENCO_FECHADO.linha.replace("{nomes}", "A, B, C, D, E ou F"));
  t("sem lugar, nada (lixo não estoura)", oElencoFechado({ nomes: ["x"] }) === "" && oElencoFechado(null) === "");
}

sec("7. O PIOR CASO CABE NO TETO, E A PONTE E O VETO ENTRAM");
{
  /* o pior caso: a pauta do turno com a ponte mais comprida que a tabela deixa
     (o teto dela, 200) e o veto do elenco com os seis nomes mais compridos,
     pelo canal de um turno (o NÃO PODE do App) */
  const longos = ["Mordecai Nightingale", "Temperance Blackwood", "Constance Mordaunt", "Thomasine Fenwick", "Lavinia Sallow", "Mercy Quintus"];
  const ef = oElencoFechado({ nomes: longos, lugar: BECO.nome });
  const r = aPautaDoTurno(estado(LAMPADA, { pautaDeUmTurno: { naoPode: [ef] } }), { frase: "pergunto a Mercy Quintus quem levou o livro" }, {});
  const tx = textoDaPauta(r.pauta, { turno: 99999 });
  console.log(`      pauta: ${tx.length} de ${TETO_DA_PAUTA}; veto do elenco: ${ef.length}; RUMO: ${(r.pauta.rumo || [""])[0].length}`);
  /* o que o veto do elenco tira (a medida, para quem decidir a prio): as linhas
     que chegavam sem ele e deixam de chegar com ele */
  const sem = textoDaPauta(aPautaDoTurno(estado(LAMPADA), { frase: "pergunto a Mercy Quintus quem levou o livro" }, {}).pauta, { turno: 99999 });
  const tirou = sem.split("\n").map((l) => l.replace(/^.{10}/, "").trim()).filter((l) => l && !tx.includes(l));
  console.log("      o veto do elenco tirou: " + (tirou.length ? tirou.map((l) => l.slice(0, 60) + "… (" + l.length + ")").join(" | ") : "nada"));
  t("cabe no teto", tx.length <= TETO_DA_PAUTA);
  t("o veto do elenco chega ao texto", tx.includes(ef));
  t("o RUMO com a ponte chega ao texto", tx.includes("aponta para: A Capela do Afogado"));
  t("e nenhum veto que já chegava deixou de chegar", (r.pauta.naoPode || []).filter((v) => v !== ef).every((v) => tx.includes(v)), (r.pauta.naoPode || []).filter((v) => !tx.includes(v)).join(" | "));
  /* a mesma régua no beco do turno da secção 4, com o veto do elenco a mais */
  const tb = textoDaPauta({ ...pautaDoBeco, naoPode: [...(pautaDoBeco.naoPode || []), ef] }, { turno: 99999 });
  t("no beco também: cabe, e o veto e a ponte entram", tb.length <= TETO_DA_PAUTA && tb.includes(ef) && tb.includes("aponta para: A Capela do Afogado"));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
