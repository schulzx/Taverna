/* teste-fios-da-estrada.mjs (Fase MM · a campanha que prende, item 3)
   — a viagem e a noite do acampamento falam da história, não de outra

   Na 4.ª sessão de prova, três viagens e um acampamento (M22–M26, 36 h)
   não acrescentaram uma frase de história e trouxeram três fios novos sem
   relação nenhuma com ela: a Câmara do Dragão pelo correio (M15), o Torneio
   das Coroas e o pedido de Ondine na manhã do acampamento (M24). E os
   encontros de cena saíam de uma tabela solta ("um marco de pedra com
   oferendas recentes"). `fios-da-estrada.js` tira o tema do encontro e da
   conversa da noite do fio ou de uma promessa aberta, e na estrada só deixa
   entrar o fio novo que se amarra a algo que já existe.

   A secção 6 é a sessão 4: os quatro envelopes de fio novo que chegaram na
   estrada (copiados do registo), os tipos de encontro de cada trecho, e as
   promessas que o caderno (`prometido.js`) teria abertas.

   FALHA em HEAD de 11/10 (v9.387): `src/fios-da-estrada.js` não existe. */
import { guardarSementes } from "../src/prometido.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = "estourou") => { try { return f(); } catch { return d; } };

let F = null;
try { F = await import("../src/fios-da-estrada.js"); } catch { F = null; }
t("o módulo existe e importa em Node", !!F);
if (!F) { console.log(`\nfios da estrada: ${ok} passaram, ${mal + 1} falharam`); process.exit(1); }

const FIO = [{ nome: "Inocência Bordão", tipo: "pessoa" }, { nome: "Noé Laminado", tipo: "pessoa" }, { nome: "Muralha Quebrada de Silêncio", tipo: "lugar" }];
const caderno = (...xs) => xs.reduce((e, x) => guardarSementes(e, [x]).estado, null);

sec("1. as tabelas");
{
  t("a ordem do tema: promessa no fio, promessa, pessoa, lugar", F.ORDEM_DO_TEMA.join() === "promessa_no_fio,promessa,pessoa_do_fio,lugar_do_fio");
  t("o tema entra nos três encontros de cena", ["viajante", "cena", "tranquilo"].every((k) => /\{tema\}/.test(F.COMO_O_FIO_ENTRA[k])));
  t("o perigo e o achado ficam com a tabela", !F.COMO_O_FIO_ENTRA.perigo && !F.COMO_O_FIO_ENTRA.achado);
  t("a noite do acampamento tem tema e quem fala", /\{tema\}/.test(F.NOITE_DO_ACAMPAMENTO) && /\{quem\}/.test(F.NOITE_DO_ACAMPAMENTO));
  t("os cinco envelopes de fio novo", F.FIOS_NOVOS.map((f) => f.id).sort().join() === "correio,global,mural,rumor,trama");
  t("o lugar sozinho não amarra; a pessoa e a promessa amarram", F.O_QUE_AMARRA.lugar === false && F.O_QUE_AMARRA.pessoa && F.O_QUE_AMARRA.promessa && F.O_QUE_AMARRA.palavrasDaPromessa >= 2);
}

sec("2. o tema");
{
  const pr = caderno(
    { tipo: "frase", texto: "Euzébio não tem marca e passa sem som", quem: "Euzébio" },
    { tipo: "ameaca", texto: "A dívida não dorme, e livro velho não paga homem", quem: "Euzébio" },
    { tipo: "objeto", texto: "a caixinha com o molho de chaves pretas de Noé", quem: "Noé Laminado" },
  );
  const a = F.temaDaEstrada({ fio: FIO, prometido: pr });
  t("primeiro a promessa que toca o fio (as chaves de Noé)", a && a.de === "promessa_no_fio" && /chaves pretas/.test(a.texto));
  const b = F.temaDaEstrada({ fio: FIO, prometido: pr, ultimoTema: a.texto });
  t("a mesma não vem duas vezes: depois, a promessa mais pesada (a ameaça)", b && b.de === "promessa" && /dívida não dorme/.test(b.texto));
  const c = F.temaDaEstrada({ fio: FIO, prometido: null });
  t("sem promessas, a pessoa do fio", c && c.de === "pessoa_do_fio" && c.texto === "Inocência Bordão");
  t("sem pessoa, o lugar do fio", F.temaDaEstrada({ fio: [FIO[2]] }).de === "lugar_do_fio");
  t("sem nada, nenhum tema (e não inventa)", F.temaDaEstrada({}) === null && F.temaDaEstrada(null) === null);
}

sec("3. o encontro e a noite");
{
  const enc = { tipo: "cena", titulo: "sinais no caminho", detalhe: "Na estrada: um marco de pedra com oferendas recentes." };
  const r = F.encontroComFio(enc, { fio: FIO });
  t("o sinal na estrada toca o fio", /Inocência Bordão/.test(r.detalhe) && !/marco de pedra/.test(r.detalhe) && r.tema.texto === "Inocência Bordão");
  t("o título e o tipo ficam", r.tipo === "cena" && r.titulo === "sinais no caminho");
  t("nunca muta o recebido", /marco de pedra/.test(enc.detalhe) && !enc.tema);
  const v = F.encontroComFio({ tipo: "viajante", detalhe: "x" }, { fio: FIO });
  t("o viajante traz notícia do fio", /traz notícia de Inocência Bordão/.test(v.detalhe));
  const q = F.encontroComFio({ tipo: "tranquilo", detalhe: "x" }, { fio: FIO, prometido: caderno({ tipo: "volta", texto: "a mulher de capa verde quer o óleo de mirra", quem: "Belmira" }) });
  /* 13/10 (11.ª sessão, O_ECO): a promessa continua a voltar na conversa,
     mas marcada como PALAVRA de quem a disse — antes ia só "(Belmira)", e o
     Mestre lia-a como fato do mundo. A asserção mudou de "(Belmira)" para o
     "dito por Belmira"; a intenção (o trecho calmo volta à promessa, com quem
     a fez) é a mesma. */
  t("o trecho calmo volta a uma promessa, com quem a fez (dita, não fato)", /a conversa do caminho volta a "a mulher de capa verde quer o óleo de mirra" \(dito por Belmira: palavra, não fato\)/.test(q.detalhe));
  const p = F.encontroComFio({ tipo: "perigo", detalhe: "Criatura do bestiário: Lobo Atroz" }, { fio: FIO });
  t("o perigo passa como veio", p.detalhe === "Criatura do bestiário: Lobo Atroz" && !p.tema);
  t("sem fio, o encontro da tabela fica", F.encontroComFio(enc, {}).detalhe === enc.detalhe);
  t("lixo: devolve objeto, sem estourar", typeof tenta(() => F.encontroComFio(null, null)) === "object");
  const n = F.linhaDoAcampamento({ fio: FIO, grupo: [{ nome: "Euzébio" }] });
  t("a noite: Euzébio fala do fio", /volta a Inocência Bordão: Euzébio tem/.test(n));
  t("sozinho, não há conversa da noite (nem lembrança posta na minha cabeça)", F.linhaDoAcampamento({ fio: FIO }) === "" && F.linhaDoAcampamento({ fio: FIO, grupo: [null, ""] }) === "");
  t("sem tema, a noite não ganha linha", F.linhaDoAcampamento({}) === "" && F.linhaDoAcampamento(null) === "");
}

sec("4. o que amarra");
{
  const pr = caderno({ tipo: "volta", texto: "a mulher de capa verde quer o óleo de mirra", quem: "mulher de capa verde" });
  t("a pessoa do fio amarra", F.amarraDoFio("[RUMOR] dizem que Noé Laminado fugiu de noite", { fio: FIO }) === "Noé Laminado");
  t("o lugar do fio sozinho não amarra", F.amarraDoFio("[QUEST GERADA] encontre alguém na Muralha Quebrada", { fio: FIO }) === null);
  t("a pessoa da promessa, dita inteira, amarra", /capa verde/.test(F.amarraDoFio("a mulher de capa verde manda um recado", { prometido: pr }) || ""));
  t("uma palavra solta da pessoa não amarra (\"anão mulher\")", F.amarraDoFio("Ondine, anão mulher, procura ajuda", { prometido: pr }) === null);
  t("duas palavras da promessa amarram", !!F.amarraDoFio("roubaram o óleo de mirra da mulher na estrada, e a capa verde ficou", { prometido: caderno({ tipo: "objeto", texto: "a capa verde e o frasco de mirra roubado" }) }));
  t("um nome que o App dê (o antagonista) amarra", F.amarraDoFio("[EVENTO GLOBAL] o Senhor das Cinzas reúne tropas", { nomes: ["Senhor das Cinzas"] }) === "Senhor das Cinzas");
  t("lixo não amarra, sem estourar", tenta(() => F.amarraDoFio(null, null)) === null && tenta(() => F.amarraDoFio("x", { fio: "y", prometido: 3, nomes: {} })) === null);
}

sec("5. o fio novo na estrada");
{
  const env = ["[VIAGEM — tudo rolado pelas tabelas] trecho", "[RUMOR] Um boato: o marquês fugiu", "[CORREIO — PETIÇÃO RECEBIDA] Noé Laminado pede socorro"];
  const fora = F.fiosNovosNaEstrada(env, { naEstrada: false, fio: FIO });
  t("fora da estrada tudo fica", fora.ficam.length === 3 && !fora.seguram.length);
  const na = F.fiosNovosNaEstrada(env, { naEstrada: true, fio: FIO });
  t("na estrada, o envelope da viagem fica sempre", na.ficam[0] === env[0]);
  t("o boato sem relação é seguro", na.seguram.length === 1 && /marquês/.test(na.seguram[0]));
  t("a petição de Noé amarra, e a amarra é dita", na.amarrados.length === 1 && na.amarrados[0].id === "correio" && /Isto amarra-se a Noé Laminado/.test(na.ficam[1]));
  t("nunca muta o recebido", env.length === 3 && !/amarra-se/.test(env[2]));
  t("lixo: listas vazias, sem estourar", tenta(() => F.fiosNovosNaEstrada(null, null).ficam.length) === 0);
}

sec("6. a sessão 4, na estrada");
{
  /* os quatro envelopes de fio novo que chegaram na estrada, do registo */
  const M15 = [
    "[RUMOR] Um boato chegou aos meus ouvidos: \"um mercador jura ter visto luzes andando sozinhas no pântano, em fila, como uma procissão\". Se couber, deixe-o circular na ficção (taverna, estrada, mercado) — e decida se ele é só fumaça ou o rastro de algo real.",
    "[CORREIO — PETIÇÃO RECEBIDA] 🆘 A Câmara do Dragão pede auxílio contra seus inimigos. (A Câmara do Dragão quer braço armado ao lado.) Prazo: até o dia 5. O jogador decide na aba Correio.",
  ];
  const M24 = [
    "[EVENTO GLOBAL — NOVO ARCO MAIOR: O TORNEIO DAS COROAS] O SISTEMA sorteou um acontecimento que abalará a região: O maior torneio da geração foi anunciado: campeões de todos os reinos, bolsa lendária e — mais importante — os poderosos todos no mesmo lugar, no mesmo mês. ETAPA 1/3 agora: Preparativos: qualificatórias, convites, apostas e intrigas de bastidor.",
    "[QUEST GERADA PELO SISTEMA — fase \"abertura\" do arco] Nova missão secundária JÁ REGISTRADA no diário (NÃO envie \"quest_nova\" duplicando-a): \"O pedido de Ondine\" — Ondine, anão mulher, estalajadeiro (melancólico) procura ajuda: alguém roubou o que tinha de mais valioso. Objetivo: Encontrar Ondine em Rio Cinzento e ouvir o pedido completo.",
  ];
  /* as promessas abertas nessa altura (as da suíte do prometido, M1–M21) */
  const pr = caderno(
    { tipo: "ameaca", texto: "A dívida não dorme, e livro velho não paga homem", quem: "Euzébio" },
    { tipo: "volta", texto: "a mulher de capa verde quer o óleo de mirra da botica", quem: "mulher de capa verde" },
    { tipo: "objeto", texto: "a caixinha com o molho de chaves pretas de Noé", quem: "Noé Laminado" },
    { tipo: "ameaca", texto: "A Muralha deu um nome, e o nome é o teu", quem: "Noé Cantoneiro" },
  );
  const r15 = F.fiosNovosNaEstrada(M15, { naEstrada: true, fio: FIO, prometido: pr });
  const r24 = F.fiosNovosNaEstrada(M24, { naEstrada: true, fio: FIO, prometido: pr });
  const seguros = r15.seguram.length + r24.seguram.length;
  console.log(`      ANTES: 4 fios novos entraram na estrada · DEPOIS: ${seguros} seguros, ${r15.amarrados.length + r24.amarrados.length} amarrados`);
  t("a Câmara do Dragão e o boato do pântano não entram na estrada (M15)", r15.seguram.length === 2 && r15.ficam.length === 0);
  t("o Torneio e Ondine não entram na manhã do acampamento (M24)", r24.seguram.length === 2 && r24.ficam.length === 0);
  /* os encontros dos cinco trechos: achado, cena, tranquilo, perigo, perigo */
  const TRECHOS = [["M14", "achado"], ["M15", "cena"], ["M22", "tranquilo"], ["M25", "perigo"], ["M26", "perigo"]];
  let ult = "";
  const com = TRECHOS.map(([m, tipo]) => { const e = F.encontroComFio({ tipo, detalhe: "(da tabela)" }, { fio: FIO, prometido: pr, ultimoTema: ult }); if (e.tema) ult = e.tema.texto; return [m, e]; });
  const temados = com.filter(([, e]) => e.tema);
  console.log(`      encontros com tema da história: ${temados.map(([m, e]) => `${m} (${e.tema.de})`).join(", ")}`);
  /* 13/10 (11.ª sessão, O_ECO): o sinal na estrada (M15, "cena") AFIRMA uma
     coisa no mundo, e por isso já não toma a promessa (palavra do Mestre) —
     toma a pessoa do fio, que o sistema decidiu. O trecho calmo (M22) é
     conversa e continua a poder voltar à promessa. A intenção — os dois
     encontros de cena falam da história — fica. */
  t("os dois encontros de cena tiram o tema da história (o sinal, do sistema)", temados.length === 2 && temados[0][1].tema.de === "pessoa_do_fio" && temados[1][1].tema.de.startsWith("promessa"));
  t("e não repetem o tema", temados[0][1].tema.texto !== temados[1][1].tema.texto);
  t("o achado e os dois perigos ficam com a tabela", com.filter(([, e]) => !e.tema).length === 3);
  const noite = F.linhaDoAcampamento({ fio: FIO, prometido: pr, grupo: ["Euzébio"], ultimoTema: ult });
  t("a noite do acampamento (M23) fala de uma promessa, pela boca de Euzébio", /^A conversa da noite volta a "/.test(noite) && /Euzébio tem/.test(noite));
}

console.log(`\nfios da estrada: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
