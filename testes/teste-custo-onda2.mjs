/* teste-custo-onda2.mjs — a onda 2 do custo do turno (14/10/2026)

   A mensagem do turno é cobrada cheia toda jogada; o texto fixo vai em
   cache. A auditoria (mente/custo-do-turno.md §3, desperdícios 3, 4, 6 e
   7) mediu nos 201 pedidos reais das 8.ª a 10.ª sessões:

     3. o fixo ia no canal que se paga cheio: a ficha do herói, o PATAMAR,
        as regras que só mudam com o nível, as DUAS PROIBIÇÕES, a forma do
        mundo, o treino das perícias, a profissão, as regras de missão e de
        quem anda comigo — ~7 mil caracteres que mudaram em 0–1% dos pares
        de turnos seguidos;
     4. portas abertas sem a coisa em jogo: a tabela de preços (96% dos
        turnos), o governo (92%), os companheiros em combate fora da luta
        (99%), o fim do acampamento (92%);
     6. os CHEFES e as masmorras da região em todo turno, usados em 2–5%;
     7. duplicados: quem está longe três vezes, a regra das missões três
        vezes, os atributos duas.

   Falha na árvore de antes (v9.470): `emJogoNoTurno`, as portas
   `grupoEmLuta`/`governo`/`fimDoAcampamento`, `PROIBICOES_DO_ARCO`, o
   `parte` das perícias, o `naPauta` do QUEM, o `soOAntagonista` dos
   chefes e o `semMasmorras` do "aqui" não existem; o ESTADO leva a ficha. */
import fs from "node:fs";
const P = await import("../src/prompt.js");
const ENV = await import("../src/motor/envelopes-do-turno.js");
const H = await import("../src/historia.js");
const PER = await import("../src/pericias.js");
const MIS = await import("../src/missoes.js");
const CENA = await import("../src/cena.js");
const MB = await import("../src/mundo-base.js");
const REG = JSON.parse(fs.readFileSync(new URL("./registo-s8-s10-cronista.json", import.meta.url), "utf8"));
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const pers = {
  nome: "Hilda Barbaforte", conceito: "sargenta reformada", nivel: 3, raca: "Anão", classe: "Guerreiro", profissao: "Ferreiro",
  atributos: { forca: 3, destreza: 0, vigor: 4, intelecto: 0, presenca: 1, percepcao: 1 }, vidaMax: 30, manaMax: 0,
  grupo: [{ nome: "Saoirse" }],
};
const BN = { elenco: [], cidades: [], tavernas: [] };
const TIT = { vivo: "Desconhecida (mortal). SUPRIMENTOS: 2 rações. VÍNCULOS DO GRUPO: Saoirse: 50/100 (Amizade).", fixo: "ECONOMIA DE AÇÃO (5e — o sistema controla, você narra): uma ação. REGRAS DE PROGRESSÃO: proficiência +2.\nFORMA DESTE MUNDO — TERRAS ABERTAS: estradas." };
const monta = (cena, tit = TIT, arco = "ARCO DA CAMPANHA: Jornada do Herói.") => P.montarSystemPrompt("Brumal", { genero: "Fantasia medieval" }, pers, {}, BN, "", arco, "", "", "TEMPO DA CAMPANHA: dia 3, 18:25", "", tit, cena);
const partes = (s) => { const i = s.indexOf(P.MARCA_DA_CENA_ABERTA); return { fixo: s.slice(0, i), vivo: s.slice(i) }; };

sec("1. O FIXO SOBE PARA O TEXTO EM CACHE");
{
  const s = monta({ emCidade: true, temGrupo: true, temMissao: true, temGente: true });
  const { fixo, vivo } = partes(s);
  t("a ficha do herói mora no fixo", /PERSONAGEM DO JOGADOR:\nNome: Hilda Barbaforte/.test(fixo));
  t("e o PATAMAR", /PATAMAR DE COMBATE: /.test(fixo));
  t("e a FICHA DE CAMINHO, com a profissão", /FICHA DE CAMINHO: .*Guerreiro.*Ferreiro/.test(fixo));
  t("e as regras que só mudam com o nível (o `fixo` do App)", fixo.includes("ECONOMIA DE AÇÃO (5e") && fixo.includes("FORMA DESTE MUNDO"));
  t("e as DUAS PROIBIÇÕES, uma vez só no pedido", fixo.includes(H.PROIBICOES_DO_ARCO) && s.split("DUAS PROIBIÇÕES").length === 2);
  t("e as regras de missão e do mural, pela mesma porta", fixo.includes(MIS.MISSOES_PROMPT) && /TRABALHO DO MUNDO/.test(fixo));
  t("e QUEM ANDA COMIGO, pela porta do grupo", /QUEM ANDA COMIGO/.test(fixo));
  t("o ESTADO fica com o que muda: o título, os suprimentos, os vínculos", /COMO O MUNDO O CHAMA: Desconhecida \(mortal\)\. SUPRIMENTOS/.test(vivo) && /VÍNCULOS DO GRUPO/.test(vivo));
  t("e não repete a ficha, o patamar nem as regras", !/PERSONAGEM DO JOGADOR|PATAMAR DE COMBATE:|ECONOMIA DE AÇÃO|DUAS PROIBIÇÕES|QUEM ANDA COMIGO|MISSÕES \(v9\.119/.test(vivo));
  t("o arco que sobra no ESTADO é a direção, sem as proibições", /ESTRUTURA DA HISTÓRIA: ARCO DA CAMPANHA/.test(vivo));
  const so = monta({ emCidade: true }, "Mortal");
  t("a string de sempre continua a valer: vai inteira ao ESTADO", /COMO O MUNDO O CHAMA: Mortal/.test(partes(so).vivo));
  t("sem missão nem grupo, as regras deles não entram", !/MISSÕES \(v9\.119|QUEM ANDA COMIGO/.test(so));
  const fichaDe = (x) => x.slice(x.indexOf("PERSONAGEM DO JOGADOR:"), x.indexOf("=== COMO ESTE MUNDO FUNCIONA"));
  t("a ficha do fixo é a de sempre, só mudou de lugar", fichaDe(s).includes(`Começa com `) && fichaDe(s).includes("Atributos: "));
}

sec("2. O CACHE EXPLÍCITO CONTINUA ESTÁVEL ENTRE TURNOS");
{
  /* o que os sinais abrem e fecham mora todo depois da marca: dois turnos
     com o mesmo herói e a cena trocada têm o MESMO texto fixo, byte a byte */
  const a = partes(monta({ emCidade: true, temMercado: true, temGrupo: true, temGoverno: true, temMissao: true }));
  const b = partes(monta({ emCombate: true, temGrupo: true, temMissao: true }));
  const c = partes(monta({ emCidade: true, temGrupo: true, temMissao: true, fimDoAcampamento: true }));
  t("comércio, luta, governo e o fim do acampamento não tocam o fixo", a.fixo === b.fixo && b.fixo === c.fixo);
  t("e o vivo muda, como deve", a.vivo !== b.vivo && a.vivo !== c.vivo);
  const outroTitulo = partes(monta({ emCidade: true, temGrupo: true, temMissao: true }, { ...TIT, vivo: "Lâmina de Brumal (mortal)." }));
  t("o título vivo muda sem tocar o fixo", outroTitulo.fixo === a.fixo);
  /* o pedido que viaja: o fixo é o system; a zona e o ESTADO descem para a
     mensagem do turno, antes do rodapé, e a frase continua por último */
  const frase = "[O QUE EU FAÇO AGORA — a narração abre por aqui] Pergunto o preço do pão.";
  const r = P.pedidoNaOrdemDoCache(monta({ emCidade: true }), [{ role: "user", content: "[PAUTA DO TURNO 4]\nONDE na praça\n[RODAPÉ DO SISTEMA] Agora: dia 3.\n" + frase }]);
  const u = r.messages[0].content;
  t("o system é o fixo, com a ficha", r.system.includes("PERSONAGEM DO JOGADOR:") && !r.system.includes(P.MARCA_DA_CENA_ABERTA));
  t("e a frase do jogador é a última coisa lida", u.endsWith(frase) && u.indexOf("ESTADO DESTE TURNO") < u.indexOf("[RODAPÉ DO SISTEMA]"));
}

sec("3. AS PORTAS QUE SÓ ABREM COM A COISA EM JOGO");
{
  const pa = (c) => P.portasAbertas(c);
  t("COMPANHEIROS EM COMBATE: com grupo e luta, abre", pa({ temGrupo: true, emCombate: true }).grupoEmLuta === true);
  t("e com grupo fora da luta, fecha", pa({ temGrupo: true }).grupoEmLuta === false && pa({ emCombate: true }).grupoEmLuta === false);
  t("o governo abre com o que governar, fora da luta", pa({ temGoverno: true }).governo === true && pa({ temGoverno: true, emCombate: true }).governo === false);
  t("e fecha sem ele", pa({ emCidade: true }).governo === false);
  t("o fim do acampamento abre no turno do envelope, ou acampado", pa({ fimDoAcampamento: true }).fimDoAcampamento === true && pa({ acampado: true }).fimDoAcampamento === true);
  t("e fecha no resto, e na luta", pa({ emCidade: true }).fimDoAcampamento === false && pa({ fimDoAcampamento: true, emCombate: true }).fimDoAcampamento === false);
  t("sem cena (o prompt inteiro), todas abrem — o de sempre", ["grupoEmLuta", "governo", "fimDoAcampamento"].every((id) => pa(null)[id] === true));
  const cidade = monta({ emCidade: true, temGrupo: true });
  t("na cidade, sem comércio, a tabela de preços não sobe", !/ESCALA DE RIQUEZA|PREÇOS COMUNS|MERCADO E COMÉRCIO/.test(cidade));
  t("e não sobra o hífen da porta fechada", !/\n- \n/.test(cidade));
  t("com comércio, sobe inteira", /ESCALA DE RIQUEZA/.test(monta({ emCidade: true, temMercado: true })) && /MERCADO E COMÉRCIO/.test(monta({ emCidade: true, temMercado: true })));
  t("o governo some sem o que governar, e o mundo que age fica", !/RESPEITE A AGENDA|GESTÃO POR CÓDIGO|- DIPLOMACIA:/.test(cidade) && /TURNO DO MUNDO \(o mundo AGE/.test(cidade));
  t("e volta com ele", /RESPEITE A AGENDA/.test(monta({ emCidade: true, temGoverno: true })) && /- DIPLOMACIA:/.test(monta({ emCidade: true, temGoverno: true })));
  t("os companheiros em combate não sobem fora da luta", !/COMPANHEIROS EM COMBATE/.test(cidade) && /COMPANHEIROS EM COMBATE/.test(monta({ emCombate: true, temGrupo: true })));
  t("o fim do acampamento só no turno dele", !/FIM DO ACAMPAMENTO \(\[/.test(cidade) && /FIM DO ACAMPAMENTO \(\[/.test(monta({ emCidade: true, fimDoAcampamento: true })));
  t("o descanso (a proibição de curar por narração) continua fora da luta", /DESCANSO \(v9\.17/.test(cidade));
}

sec("4. OS SINAIS DO TURNO — a tabela que decide o que está em jogo");
{
  const s = P.emJogoNoTurno;
  /* o nome não é `sinaisDoTurno` porque o App já tem uma `sinaisDoTurno`
     local (a do adjudicador) — a primeira fiação importou com esse nome,
     a local sombreou a importada, o build passou e o turno vivo calou com
     "acao.startsWith is not a function" (todas as portas abertas). */
  /* MOVIDA NA ONDA 3 (14/10), com o motivo: o mesmo import passou a trazer também `linhasJaDitas` (o O QUE EXISTE não repete o que as PESSOAS CONHECIDAS já dizem); a prova do nome que nada sombreia é a mesma */
  t("o App importa a leitura com um nome que nenhuma função local sombreia", /emJogoNoTurno, SINAIS_ABERTOS(, linhasJaDitas)? \} from "\.\/prompt\.js"/.test(APP) && !/const emJogoNoTurno\b/.test(APP));
  t("a tabela tem as cinco perguntas", ["comercio", "governo", "fimDoAcampamento", "chefe", "masmorra"].every((k) => P.SINAIS_DO_TURNO[k] instanceof RegExp));
  t("sem leitura, tudo abre (o de antes)", Object.values(P.SINAIS_ABERTOS).every((v) => v === true) && Object.isFrozen(P.SINAIS_ABERTOS));
  t("a entrada nula não estoura e não abre nada", (() => { const r = s(null); return r && !r.comercio && !r.governo && !r.chefeEmJogo && !r.masmorraEmJogo; })());
  t("perguntar o preço abre o comércio", s({ frase: "Quanto custa uma caneca de cerveja aqui?" }).comercio);
  t("pedir cama para a noite também", s({ frase: "peço duas camas para a noite" }).comercio);
  t("o envelope da compra abre, sem palavra na frase", s({ frase: "Fechado.", nota: "[COMPRA — JÁ REGISTRADA PELO SISTEMA] Comprei Botas." }).comercio);
  t("a linha O PREÇO da pauta abre", s({ frase: "E aquela?", nota: "[PAUTA]\nO PREÇO    a espada longa: ◉ 40" }).comercio);
  t("falar com alguém não abre o comércio", !s({ frase: "Falo com Nyla Punho-de-Pedra" }).comercio);
  t("o reino na frase abre o governo; o envelope da diplomacia também", s({ frase: "Quero falar dos impostos do meu reino" }).governo && s({ nota: "[DIPLOMACIA — RESOLVIDA PELO SISTEMA] A potência aceitou." }).governo);
  t("o envelope do fim do acampamento abre a regra dele", s({ nota: "[FIM DO ACAMPAMENTO — DESCANSO LONGO] O app restaurou." }).fimDoAcampamento);
  const chefes = ["Dragão Ancião o Rei Emprestado", "Runa Sem-Medo, a Praga Mansa", "Godfrey, a Corda Comprida"];
  t("o nome do chefe no turno o põe em jogo", s({ frase: "Pergunto onde posso encontrar Runa Sem-Medo.", chefes }).chefeEmJogo);
  t("o título sozinho também (\"o Rei Emprestado\")", s({ recentes: "dizem que o Rei Emprestado voltou a voar", chefes }).chefeEmJogo);
  t("sem acento também", s({ frase: "dragao anciao existe aqui?", chefes }).chefeEmJogo);
  t("mas um primeiro nome sozinho não: Godfrey é também o taverneiro", !s({ frase: "Falo com Godfrey da Foz", chefes }).chefeEmJogo);
  t("perguntar pelo covil abre sem saber o nome", s({ frase: "Onde fica o covil daquela coisa?", chefes }).chefeEmJogo);
  t("o caminho, o rumor ou o nome da masmorra a põem em jogo", s({ frase: "Quanto tempo a pé daqui até Pedra Rasa?" }).masmorraEmJogo && s({ nota: "MOMENTO   o Poço de Silêncio", masmorras: ["Poço de Silêncio"] }).masmorraEmJogo);
  t("e conversar no balcão não", !s({ frase: "Sento no balcão e falo com Helga", masmorras: ["Poço de Silêncio"] }).masmorraEmJogo);
  const um = s({ frase: "Compro pão e pergunto o caminho", chefes });
  t("determinista: o mesmo texto, as mesmas portas", JSON.stringify(um) === JSON.stringify(s({ frase: "Compro pão e pergunto o caminho", chefes })));
  /* sobre as 197 frases reais das 8.ª a 10.ª sessões: a tabela de preços
     deixa de subir na maior parte dos turnos, e nunca falta onde o jogador
     comprou ou pagou */
  const T = REG.turnos;
  const com = T.filter((x) => s({ frase: x.frase, nota: (x.envelopes || []).join("\n") }).comercio).length;
  t(`nas 197 frases reais, o comércio abre numa minoria dos turnos (${com})`, com > 20 && com < T.length * 0.6);
  const pagou = T.filter((x) => /\b(compro|pago|vendo)\b/i.test(x.frase || ""));
  t(`e abre em toda frase que compra, paga ou vende (${pagou.length})`, pagou.length > 3 && pagou.every((x) => s({ frase: x.frase }).comercio));
}

sec("5. SEM DUPLICADOS");
{
  const lista = MIS.resumoMissoesPrompt([{ id: "m1", titulo: "O que O Rossio Torto guarda", tipo: "trama", status: "ativa", etapas: [{ tipo: "ir", alvo: "O Rossio Torto", feita: false }] }]);
  t("a lista das missões não repete a regra delas", lista.length > 0 && !/Trate as etapas|etapas futuras/i.test(lista));
  t("a regra mora em MISSOES_PROMPT, uma vez", /NUNCA diga ao jogador quais são as etapas seguintes/.test(MIS.MISSOES_PROMPT));
  const npcs = { "Torvald da Urze": { nome: "Torvald da Urze", local: "Nova Profundo", relacao: "amigo", diaEncontro: 1 }, "Godfrey da Foz": { nome: "Godfrey da Foz", local: "Monte Rasa", diaEncontro: 1 } };
  const mapa = { cidades: [{ nome: "Monte Rasa", x: 0, y: 0 }, { nome: "Nova Profundo", x: 3, y: 0 }], rotas: [{ de: "Monte Rasa", para: "Nova Profundo", dias: 1 }] };
  const antes = CENA.resumoCenaPrompt(npcs, "Monte Rasa", mapa, {});
  const depois = CENA.resumoCenaPrompt(npcs, "Monte Rasa", mapa, { naPauta: ["Torvald da Urze"] });
  t("quem a pauta já veta não volta no LONGE", /LONGE/.test(antes) && /Torvald/.test(antes) && !/Torvald/.test(depois));
  t("e quem está aqui continua aqui", /Godfrey da Foz/.test(depois));
  const p = { pericias: { treinadas: ["atletismo"] }, atributos: { percepcao: 1 } };
  const mod = () => 1;
  const inteiro = PER.resumoPericiasPrompt(p, mod), treino = PER.resumoPericiasPrompt(p, mod, "treino"), passivos = PER.resumoPericiasPrompt(p, mod, "passivos");
  t("as perícias partem em dois: o treino (fixo) e os passivos (vivos)", /TREINADO em/.test(treino) && !/PASSIVOS/.test(treino) && /^PASSIVOS/.test(passivos) && !/TREINADO/.test(passivos));
  t("e as duas partes somam o bloco de sempre", inteiro.includes(treino.split("\n")[1]) && inteiro.includes(passivos.split(": ").slice(1).join(": ").split(".")[0]));
}

sec("6. OS CHEFES E AS MASMORRAS SÓ INTEIROS QUANDO EM JOGO");
{
  const mapa = { cidades: [{ nome: "Monte Rasa", x: 10, y: 10, porte: "cidade", regiao: "Campos do Corvo" }, { nome: "Nova clara", x: 14, y: 10, porte: "vila", regiao: "Campos do Corvo" }], regioes: [{ nome: "Campos do Corvo" }] };
  const todos = MB.resumoChefesPrompt(42, mapa, null, "Fantasia medieval");
  const so = MB.resumoChefesPrompt(42, mapa, null, "Fantasia medieval", null, { soOAntagonista: true });
  t("o mundo de teste tem chefes", todos.length > 0);
  t("sem chefe em jogo, o bloco encolhe e diz que é parcial (+N)", so.length < todos.length && /\|\| \+\d+\.$/.test(so));
  t("e o da linha principal nunca sai", /LINHA PRINCIPAL/.test(so) && /LINHA PRINCIPAL/.test(todos));
  /* com a espinha: quem fica é o antagonista do fio — o que a 8.ª sessão
     evocou de passagem ("o Sem-Rosto enterrou lá") sem nome nenhum no turno */
  const espinha = { fio: { antagonista: "Magnus da Torre, o Sem-Rosto", motivo: "cumpre uma ordem de quem já morreu" }, atos: [] };
  const fioTodos = MB.resumoChefesPrompt(42, mapa, null, "Fantasia medieval", null, { espinha });
  const fioSo = MB.resumoChefesPrompt(42, mapa, null, "Fantasia medieval", null, { espinha, soOAntagonista: true });
  t("com a espinha, o antagonista do fio fica, e os servos viram +N", fioSo.includes("Magnus da Torre, o Sem-Rosto — o antagonista desta história") && /\|\| \+\d+\.$/.test(fioSo) && fioSo.length < fioTodos.length && fioTodos.includes("os que o servem"));
  const com = MB.resumoDaqui(42, mapa, "Monte Rasa", null, "Fantasia medieval");
  const sem = MB.resumoDaqui(42, mapa, "Monte Rasa", null, "Fantasia medieval", null, null, { semMasmorras: true });
  t("sem masmorra em jogo, a linha delas cala, e o resto do lugar fica", !/Masmorras da região/.test(sem) && /O QUE EXISTE EM MONTE RASA/.test(sem) && sem.length <= com.length);
}

sec("7. A FIAÇÃO NO APP");
{
  t("o ref dos sinais nasce aberto", /const sinaisDoTurnoRef = useRef\(SINAIS_ABERTOS\);/.test(APP));
  t("enviar lê os sinais antes do rodapé, em try/calou, e cai em tudo aberto", /sinaisDoTurnoRef\.current = emJogoNoTurno\(\{ frase: conteudo, nota: `\$\{nota\}\\n\$\{missoesTxt\}`, recentes, chefes: chefesNomes, masmorras: masmorrasNomes \}\);[^\n]*\n\s*\} catch \(e\) \{ calou\("os sinais do turno", e\); sinaisDoTurnoRef\.current = SINAIS_ABERTOS;/.test(APP) /* MOVIDA NA ONDA 3 (14/10), com o motivo: a relevância do turno e a linha A GENTE são lidas na MESMA linha dos sinais, cada uma no seu try (o App não podia ganhar linhas: o check-acoes-do-jogador lê-o por número de linha), e o catch dos sinais também as zera; a prova de que os sinais caem em tudo aberto é a mesma */
    /* MOVIDA NA T2-A (28/10), com o motivo: o texto do rodapé saiu para src/motor/envelopes-do-turno.js; a ordem é a mesma, lida no sítio que o monta */
    && APP.indexOf("sinaisDoTurnoRef.current = emJogoNoTurno(") < APP.indexOf("const rodape = oRodapeDoTurno("));
  t("a tabela de preços abre com a cidade E o comércio", /temMercado: !!cidadeAtualRef\.current && !!sinais\.comercio,/.test(APP));
  t("o governo e o fim do acampamento vão à cena", /temGoverno: temOQueGovernar\(\) \|\| !!sinais\.governo,/.test(APP) && /fimDoAcampamento: !!sinais\.fimDoAcampamento,/.test(APP));
  t("os chefes inteiros só com chefe em jogo", /const chefes = chefesDoFio\(!\(sinaisDoTurnoRef\.current \|\| SINAIS_ABERTOS\)\.chefeEmJogo\);/.test(APP));
  /* MOVIDA NA ONDA 3 (14/10), com o motivo: o mesmo objeto de opções passou a levar a relevância, o onde e as linhas já ditas depois do semMasmorras */
  t("as masmorras só com masmorra em jogo", /\{ semMasmorras: !\(sinaisDoTurnoRef\.current \|\| SINAIS_ABERTOS\)\.masmorraEmJogo[, ]/.test(APP));
  t("o QUEM não repete quem a pauta veta", /naPauta: \(\(\) => \{ try \{ return Object\.keys\(npcsRef\.current \|\| \{\}\)\.filter\(\(n\) => n && pauta\.includes\(`\$\{n\} está em `\)\);/.test(APP));
  t("o rodapé leva só os passivos; o treino, a profissão e a forma subiram", /resumoPericiasPrompt\(p, \(id\) => atributoEfetivo\(p, id\), "passivos"\)/.test(APP) && !/const prf = resumoProfissaoPrompt\(p\);/.test(APP) && /const forma = "";/.test(APP));
  t("os ATRIBUTOS não se repetem no rodapé", !/const atr = resumoAtributosPrompt\(p\);/.test(APP) && !/\$\{atr \?/.test(APP));
  t("infoTitulo devolve o vivo e o fixo", /return \{ vivo: `\$\{base\}\. \$\{ermos\}\$\{epico\}\$\{vinc \? ` \$\{vinc\}` : ""\}`, fixo \};/.test(APP));
  /* no nível 20 o ESTADO ÉPICO conta o XP de cada turno: no fixo ele
     reescreveria o cache a cada vitória */
  t("o estado épico (o XP do nível 20) vai ao vivo, não ao fixo", /const infoEpico = \(\) => \{/.test(APP) && !/const ep = resumoEpico\(p\);/.test(APP));
  t("e o fixo da ficha lê a forma, o treino e a profissão, cada um em try/calou", /const fixoDaFicha = \(\) => \{[\s\S]{0,200}resumoMoldePrompt\(moldeMundo\(\)\)[\s\S]{0,200}"treino"[\s\S]{0,200}resumoProfissaoPrompt\(p\)/.test(APP));
  /* MOVIDA NA T2-A (28/10), com o motivo: o Inviolável saiu do App com o resto do texto do rodapé (src/motor/envelopes-do-turno.js);
     a intenção — ele está no rodapé que o App monta, colado à frase — joga-se na peça e no sítio que a chama */
  t("o Inviolável continua no rodapé, colado à frase (o Gemini lê o que está perto dela — MM11)", /Inviolável: \(1\) o tempo SÓ muda por envelope/.test(ENV.aCabecaDoRodape({ dia: 1, minuto: 600, local: "aqui", ascensao: false })) && APP.includes("const rodape = oRodapeDoTurno("));
}

console.log(`\n${ok} ok, ${mal} falharam`);
process.exit(mal ? 1 : 0);
