/* teste-prova-viva-462.mjs — as quatro pendências da prova viva da v9.460
   e da v9.462 (13/10; mente/diario.md, blocos v9.460 «o que não soube» e
   v9.462 «o que ficou»). Falha na árvore de antes (v9.462) e passa na de
   depois:

     1. O VENDEDOR SEM NOME. «Ataco o vendedor com a espada» não abriu luta
        — o Mestre narrou «não há ninguém para atacar». O vendedor estava
        no EM CENA (a gente que a prosa apresentou de mãos vazias), mas a
        leitura da agressão só conhecia o nome do registo, o bicho e a
        gente armada; e «dou um soco no vendedor» nem era golpe (o ofício
        não estava em QUEM_APANHA). Agora o achado da frase contra a lista
        (`apontado`) é o alvo, com o veredito do crime antes;
     2. A ESTRADA NA CIDADE. A luta em Monte Escura abriu na planta da
        estrada: na cidade, sem sítio, o lugar que chega a `cenarioDe` é
        «em Monte Escura» — o nome da cidade não traz palavra nenhuma da
        tabela, o bioma também não, e caía no «estrada» do fim. A planta
        passa a sair do lugar dito às claras (grid.js#PLANTA_DO_LUGAR);
     3. O COMPANHEIRO DESARMADO. O companheiro inicial e o recrutado
        nasciam com `equipados: {}`; agora com a arma da classe
        (kit-inicial.js), só na ficha que nasce — o load nunca arma;
     4. A ARMADILHA E O GRUPO. No «Passar assim mesmo» o herói salta com
        vantagem e o companheiro levava tudo, sem salvaguarda. Quem notou a
        armadilha avisou o grupo (masmorras.js#grupoNaArmadilha). */
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const S = "../src/";
const J = JSON.stringify;

const AG = await import(S + "agressao.js");
const EC = await import(S + "em-cena.js");
const CR = await import(S + "crime.js");
const G = await import(S + "grid.js");
const LU = await import(S + "lugar.js");
const KI = await import(S + "kit-inicial.js");
const CI = await import(S + "companheiro-inicial.js");
const CO = await import(S + "companheiros.js");
const RJ = await import(S + "regras-jogo.js");
const MM = await import(S + "masmorras.js");
const { abrirAbertura } = await import(S + "abertura.js");
const { gerarGeografia } = await import(S + "geografia.js");
const { estenderEspinha } = await import(S + "saga.js");
const { MOLDES } = await import(S + "moldes.js");
const { generosDisponiveis } = await import(S + "nomes.js");
const { guildasDoMundo } = await import(S + "guildas.js");
/* o que esta etapa trouxe, lido com rede: na árvore de antes falta, e a
   suíte tem de FALHAR asserção a asserção — não estourar na primeira */
const grupoNaArmadilha = MM.grupoNaArmadilha || (() => ({}));
const PLANTA_DO_LUGAR = G.PLANTA_DO_LUGAR || { porSitio: [] };

/* ============================================================
   1. O VENDEDOR SEM NOME
   ============================================================ */
sec("1. quem a cena sabe à frente pelo papel é alvo");
{
  /* a abertura de uma praça, na forma das da prova viva: três pessoas de
     mãos vazias, trazidas com artigo e ofício */
  const mostrado = ["A praça de Monte Escura ferve ao meio-dia. Um vendedor de enguias grita o preço do dia, um mercador de mulas discute com um cliente, e um guarda de elmo amassado boceja junto à fonte."];
  const presentes = [{ nome: "Joran Vale", papel: "peixeiro do cais", relacao: "neutro" }];
  const grupo = [{ nome: "Sigrun", conceito: "guerreira de aluguel" }];
  const lista = EC.montarEmCena({ semente: "s462", cidade: "Monte Escura", presentes, mostrado, grupo });
  /* a fiação do App (declararAgressao): o achado da frase contra a lista,
     com o `faz` dele, e a coisa da lista inteira */
  const apontadoDe = (frase, L = lista) => { const a = EC.quemNaFrase(frase, L)[0] || null; return a ? { ...L.find((x) => x.id === a.id), faz: a.faz } : null; };
  const ler = (frase, extra = {}) => AG.lerAgressao(frase, { presentes, grupo, mostrado, apontado: apontadoDe(frase), ...extra });
  const mundo = { semente: "s462", cidade: { nome: "Monte Escura" } };
  const crimeCtx = { npcs: {}, presentes, grupo, hostis: [], elenco: [] };

  t("a lista sabe o vendedor (a régua de antes: a prosa o apresentou)", lista.some((x) => x.tipo === "pessoa" && x.nome === "Vendedor de enguias" && x.aqui));
  t("o defeito, medido: sem o achado da cena, a frase real não tem alvo", (AG.lerAgressao("Ataco o vendedor com a espada", { presentes, grupo, mostrado }) || {}).tipo === "semAlvoConhecido");
  const a = ler("Ataco o vendedor com a espada");
  t("«Ataco o vendedor com a espada» abre a luta contra o vendedor", !!a && a.tipo === "agressao" && a.nome === "Vendedor de enguias", J(a));
  t("…ele é gente da cidade: não é luta armada nem bicho", !!a && !a.armadoNaProsa && !a.criatura);
  t("…e o veredito do crime vem antes do clique", (() => { const v = CR.veredictoDoCrime(a, crimeCtx, mundo); return typeof v === "string" && v.includes("Vendedor de enguias") && v.includes("crime"); })());
  t("…a ameaça é a do ofício (vendedor: gente que não se defende)", !!a && a.ameaca === "fraco" && AG.ameacaDoPapel("vendedor").ameaca === "fraco", a && a.ameaca);
  const m = ler("ataco o mercador");
  t("«ataco o mercador» → o mercador de mulas", !!m && m.tipo === "agressao" && m.nome === "Mercador de mulas", J(m));
  const g = ler("dou um soco no guarda");
  t("«dou um soco no guarda» → o guarda de elmo, ameaça de quem tem turno", !!g && g.tipo === "agressao" && g.nome === "Guarda de elmo" && g.ameaca === "comum", J(g));
  t("«dou um soco no vendedor» passa a ser golpe (o ofício em QUEM_APANHA)", AG.ehDeclaracaoDeAtaque("dou um soco no vendedor") && AG.ehDeclaracaoDeAtaque("chuto a peixeira") && AG.ehDeclaracaoDeAtaque("corto o pescador"));
  t("…e abre contra o vendedor", (ler("Dou um soco no vendedor") || {}).nome === "Vendedor de enguias");
  t("«corto a garganta do vendedor de enguias» (o nome inteiro)", (ler("corto a garganta do vendedor de enguias") || {}).nome === "Vendedor de enguias");
  /* o registo pelo papel: quem o jogador não sabe o nome */
  t("o do registo, pelo papel («ataco o peixeiro» → Joran Vale)", (() => { const r = ler("ataco o peixeiro"); return !!r && r.tipo === "agressao" && r.nome === "Joran Vale" && r.papel === "peixeiro do cais"; })(), J(ler("ataco o peixeiro")));
  /* quem anda comigo, pelo papel: recusado como o grupo */
  t("quem anda comigo, apontado pelo papel, é recusado como o grupo", (ler("ataco a guerreira de aluguel") || {}).tipo === "companheiro", J(ler("ataco a guerreira de aluguel")));
  /* o armado da prosa continua luta, não crime */
  const comArma = ["Um encapuzado de capa rota saca uma faca e avança."];
  const L2 = EC.montarEmCena({ semente: "s462", cidade: "Monte Escura", mostrado: comArma });
  const ar = AG.lerAgressao("ataco o encapuzado", { presentes: [], grupo: [], mostrado: comArma, apontado: apontadoDe("ataco o encapuzado", L2) });
  t("o armado da prosa: luta, sem crime", !!ar && ar.tipo === "agressao" && ar.armadoNaProsa === true && CR.lerCrime(ar, crimeCtx) === null, J(ar));
  /* a trava da casa: o sistema não inventa o alvo */
  t("a trava: quem a cena não tem continua sem alvo («ataco o ferreiro»)", (ler("ataco o ferreiro") || {}).tipo === "semAlvoConhecido");
  t("o achado que não é golpe não abre luta (faz «compra»)", (AG.lerAgressao("ataco o vendedor", { presentes, grupo, mostrado, apontado: { ...apontadoDe("ataco o vendedor"), faz: "compra" } }) || {}).tipo === "semAlvoConhecido");
  t("lixo no achado é como não ter achado", [null, undefined, {}, [], "vendedor", { tipo: "criatura", nome: "Rato" }, { tipo: "pessoa" }].every((x) => (AG.lerAgressao("ataco o vendedor", { presentes, grupo, mostrado, apontado: x }) || {}).tipo === "semAlvoConhecido"));
  t("determinismo e imutabilidade: a mesma frase dá o mesmo alvo, e o achado sai intacto", (() => { const ap = Object.freeze(apontadoDe("Ataco o vendedor com a espada")); const x = AG.lerAgressao("Ataco o vendedor com a espada", { presentes, grupo, mostrado, apontado: ap }); return J(x) === J(ler("Ataco o vendedor com a espada")); })());
  t("a tabela da regra existe e diz o que conta como golpe", Array.isArray((AG.ALVO_PELA_CENA || {}).faz) && AG.ALVO_PELA_CENA.faz.includes("golpe") && !AG.ALVO_PELA_CENA.faz.includes("compra"));
}

/* ============================================================
   2. A ESTRADA NA CIDADE
   ============================================================ */
sec("2. a planta sai do lugar onde se pisa");
{
  /* o que o App passava (v9.462): a linha do lugar e o bioma da cidade */
  t("o defeito, medido: «em Monte Escura» pela linha só, cai na estrada", G.cenarioDe({ local: "em Monte Escura", bioma: "colina" }) === "estrada");
  t("na cidade, sem sítio: a rua («em Monte Escura», colina)", G.cenarioDe({ cidade: "Monte Escura", local: "em Monte Escura", bioma: "colina" }) === "cidade");
  t("…e as regiões são as da cidade (praça, arcada, beco)", (() => { const g = G.montarGrade({ cidade: "Monte Escura", local: "em Monte Escura", bioma: "montanha" }); return g.cenario === "cidade" && G.PLANTAS.cidade.regioes.some((r) => /praça/.test(r.nome)); })());
  t("o nome da cidade não manda (Porto Velho não é um convés)", G.cenarioDe({ cidade: "Porto Velho", local: "em Porto Velho", bioma: "costa" }) === "cidade");
  /* o sítio, pelo objeto de lugar.js (o que o App guarda em lugarRef) */
  const sitio = (nome, distancia, extra = {}) => ({ nome, distancia, cidade: "Monte Escura", ...extra });
  const pelo = (l, bioma = "colina") => G.cenarioDe({ cidade: "Monte Escura", lugar: l, local: LU.linhaDeLugar(l), bioma });
  t("a linha do interior mentia: «não estou no salão… nem na rua» fazia toda sala virar taverna", G.cenarioDe({ local: LU.linhaDeLugar(sitio("Beco dos Ratos", "dentro")) }) === "taverna");
  t("o beco é rua", pelo(sitio("Beco dos Ratos", "dentro")) === "cidade");
  t("a taverna é taverna, a casa em que o cômodo fica também conta", pelo(sitio("Javali Cambaleante, taverna", "dentro")) === "taverna" && pelo(sitio("Sala dos fundos", "dentro", { dentroDe: "a estalagem do Cedric" })) === "taverna");
  t("o cômodo sem palavra é um interior", pelo(sitio("Torre do Arquivista", "dentro")) === "taverna");
  t("a linha de fora mentia: «FORA DA CIDADE» punha a clareira na praça", G.cenarioDe({ local: LU.linhaDeLugar(sitio("Clareira dos Corvos", "arredores")) }) === "cidade");
  t("a clareira dos arredores é mato", pelo(sitio("Clareira dos Corvos", "arredores")) === "floresta");
  t("o sítio de fora sem palavra é o chão do bioma (pela tabela da estrada)", pelo(sitio("Pedra Alta", "perto"), "pantano") === "floresta" && pelo(sitio("Pedra Alta", "perto"), "colina") === "estrada");
  t("o cais é convés, a cripta é ruína, o esgoto é caverna", pelo(sitio("Cais Velho", "dentro")) === "navio" && pelo(sitio("Cripta do Sino", "dentro")) === "ruina" && pelo(sitio("Esgotos da Cidade Baixa", "dentro")) === "caverna");
  /* a estrada é da jornada aberta, e só dela */
  t("a jornada aberta continua a mandar (o bioma do trecho)", G.cenarioDe({ emViagem: true, cidade: "Monte Escura", bioma: "floresta" }) === "floresta" && G.cenarioDe({ emViagem: true, cidade: "Monte Escura", bioma: "colina" }) === "estrada");
  t("a jornada fechada dita às claras cala a marca da linha", G.cenarioDe({ emViagem: false, cidade: "Monte Escura", local: "EM VIAGEM: Monte Escura → Ponte — não estou em cidade nenhuma" }) === "cidade");
  t("a masmorra continua a vencer tudo", G.cenarioDe({ emMasmorra: true, cidade: "Monte Escura", lugar: sitio("Taverna", "dentro") }) === "masmorra");
  t("sem lugar nem cidade, a leitura de sempre (E4)", G.cenarioDe({ local: "na praça de Ponto do Sul", bioma: "planicie" }) === "cidade" && G.cenarioDe({ local: "na taverna do Gomo" }) === "taverna" && G.cenarioDe({ local: "no porto" }) === "navio" && G.cenarioDe({ local: "", bioma: "floresta" }) === "floresta");
  t("lixo não estoura (lugar null, [], string; cidade vazia)", G.cenarioDe({ lugar: null, cidade: "" }) === "estrada" && G.cenarioDe({ lugar: [], cidade: "X" }) === "cidade" && G.cenarioDe({ lugar: "taverna", cidade: "X" }) === "cidade" && G.cenarioDe({ lugar: {}, cidade: "X" }) === "cidade");
  t("toda planta da tabela existe", PLANTA_DO_LUGAR.porSitio.length > 0 && [...PLANTA_DO_LUGAR.porSitio.map((x) => x.planta), PLANTA_DO_LUGAR.dentro, PLANTA_DO_LUGAR.naCidade].every((p) => !!G.PLANTAS[p]));
}

/* ============================================================
   3. O COMPANHEIRO DESARMADO
   ============================================================ */
sec("3. o companheiro nasce com a arma da classe");
{
  const w = (() => {
    const g = generosDisponiveis()[0], M = MOLDES[0];
    const semente = "Sonda 462|armado";
    const mapa = gerarGeografia(semente, M);
    return { semente, genero: g, molde: M, mapa, cidade: mapa.cidades[0].nome, guildas: guildasDoMundo(semente, mapa, g, null) };
  })();
  const fichas = [];
  for (const classe of ["Guerreiro", "Ladino", "Mago", "Caçador"]) for (const estrutura of ["jornada", "misterio", "vinganca"]) {
    const espinha = estenderEspinha({ semente: w.semente + "|" + classe + "|" + estrutura, mapa: w.mapa, genero: w.genero, molde: w.molde, estrutura, cidadeInicial: w.cidade });
    const ab = abrirAbertura({ semente: w.semente, mapa: w.mapa, cidade: w.cidade, espinha, estrutura, antecedente: "", genero: w.genero, molde: w.molde, nivel: 1, dia: 1 });
    const ci = ab ? CI.companheiroInicial({ semente: w.semente + "|" + classe, mapa: w.mapa, genero: w.genero, molde: w.molde, espinha, guildas: w.guildas, cidade: w.cidade, antecedente: "", heroi: { nome: "Brann", nivel: 1, classe }, abertura: ab.abertura }) : null;
    if (ci) fichas.push(ci.comp);
  }
  t("há companheiros iniciais para medir", fichas.length >= 3, String(fichas.length));
  t("o companheiro inicial nasce com a arma da classe dele, empunhada", fichas.length > 0 && fichas.every((c) => c.equipados && c.equipados.arma && KI.KIT_INICIAL[c.classe] && c.equipados.arma.nome === KI.KIT_INICIAL[c.classe].arma), J(fichas.map((c) => [c.classe, c.equipados && c.equipados.arma && c.equipados.arma.nome])));
  t("…a peça de banca, igual à do herói (armaInicial)", fichas.every((c) => J(c.equipados.arma) === J(KI.armaInicial(c.classe))));
  /* o recrutado pela resposta do Mestre (grupo_adicionar) */
  const p0 = { nome: "Brann", vida: 10, vidaMax: 10, mana: 5, manaMax: 5, moedas: 0, inventario: [], grupo: [], habilidades: [], atributos: {} };
  let rec = null;
  try { rec = RJ.aplicarMudancas(p0, { grupo_adicionar: [{ nome: "Hilda Ferro", conceito: "guerreira", classe: "Guerreiro", nivel: 1, vida: 12 }] }, [], []); } catch (e) { rec = { erro: String(e && e.message) }; }
  const hilda = rec && rec.grupo ? rec.grupo.find((x) => x.nome === "Hilda Ferro") : null;
  t("o recrutado pela resposta nasce armado (Guerreiro → Espada Longa)", !!hilda && !!hilda.equipados && !!hilda.equipados.arma && hilda.equipados.arma.nome === "Espada Longa", J(hilda && hilda.equipados));
  /* o recrutado do App: garantirFichaCompanheiro e o kit, na mesma ordem */
  const doApp = KI.equiparKitInicial(CO.garantirFichaCompanheiro({ nome: "Oren Vau", conceito: "", nivel: 1, vida: 10, vidaMax: 10, habilidades: [], semente: "npc|Oren Vau|", marcos: [] }));
  t("o recrutado do App (a classe sai da ficha, a arma da classe)", !!doApp.equipados && !!doApp.equipados.arma && doApp.equipados.arma.nome === (KI.KIT_INICIAL[doApp.classe] || {}).arma, J([doApp.classe, doApp.equipados]));
  /* o load NUNCA arma: o companheiro de um save fica com o que tem */
  const doSave = { nome: "Ursa", classe: "Guerreiro", nivel: 2, vida: 13, vidaMax: 13, equipados: {}, inventario: [], equipamento: [], habilidades: [], semente: "npc|Ursa|", vinculo: 3, marcos: [] };
  t("o load nunca arma (garantirFichaCompanheiro)", !(CO.garantirFichaCompanheiro(doSave).equipados || {}).arma);
  t("o load nunca arma (migrarPersonagem, o grupo de um save)", (() => { const p = RJ.migrarPersonagem({ nome: "Brann", classe: "Guerreiro", nivel: 2, vida: 10, vidaMax: 10, atributos: {}, inventario: [], grupo: [doSave] }); return !!p && Array.isArray(p.grupo) && p.grupo.length === 1 && !(p.grupo[0].equipados || {}).arma; })());
  t("a arma que já está na mão não troca (a do save, a de quem veio armado)", (() => { const adaga = { nome: "Adaga", tipo: "arma", atributos: { dano: 1 } }; const x = KI.equiparKitInicial({ ...doSave, equipados: { arma: adaga } }); return x.equipados.arma === adaga; })());
  t("a ficha que entra não é mutada", (() => { const f = Object.freeze({ nome: "Kai", classe: "Ladino", equipados: Object.freeze({}) }); const x = KI.equiparKitInicial(f); return x !== f && !f.equipados.arma && x.equipados.arma.nome === "Espada Curta"; })());
}

/* ============================================================
   4. A ARMADILHA E O GRUPO
   ============================================================ */
sec("4. quem notou a armadilha avisou o grupo");
{
  t("avisado: o companheiro faz a salvaguarda, com vantagem", J(grupoNaArmadilha({ avisou: true })) === J({ salvaguarda: true, vantagem: true }));
  t("surpresa: como hoje, sem salvaguarda", J(grupoNaArmadilha({ avisou: false })) === J({ salvaguarda: false, vantagem: false }));
  t("lixo é surpresa (null, {}, [], avisou não-booleano)", [null, undefined, {}, [], "sim", { avisou: "true" }, { avisou: 1 }].every((x) => J(grupoNaArmadilha(x)) === J({ salvaguarda: false, vantagem: false })));
  t("a resposta é cópia: mexer nela não mexe na tabela", (() => { const r = grupoNaArmadilha({ avisou: true }); r.vantagem = false; return MM.ARMADILHA_DA_SALA.grupo && MM.ARMADILHA_DA_SALA.grupo.avisado.vantagem === true; })());
  /* o preço antes do clique diz o grupo */
  const mm = { nome: "Cripta", atual: 2, tochas: 3, ritmo: "normal", salas: [
    { id: 1, tipo: "entrada", camada: 0, resolvida: true, saidas: [2] },
    { id: 2, tipo: "armadilha", camada: 2, nomeArmadilha: "dardos das paredes", dano: 7, saidas: [3] },
    { id: 3, tipo: "tesouro", camada: 3, saidas: [] } ] };
  const viu = MM.notarArmadilha(mm, { passiva: 20 });
  const correr = (o) => (MM.opcoesDaArmadilha(viu && viu.mm, o).find((x) => x.id === "correr") || {}).preco || "";
  t("com grupo, o preço do «Passar assim mesmo» diz que o grupo salta com vantagem", /grupo/.test(correr({ comGrupo: true })) && /7 de dano/.test(correr({ comGrupo: true })), correr({ comGrupo: true }));
  t("sozinho, o preço de sempre", correr({}) === "ela dispara: até 7 de dano, e você salta com vantagem" && !/grupo/.test(correr({ comGrupo: "sim" })));
}

console.log(`\n${ok} ok · ${mal} falha(s)`);
if (mal) process.exit(1);
