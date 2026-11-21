/* ============================================================
   O CONFERENTE DA PROSA (o Mestre que conhece a cena, etapa 4 · 21/11/2026)
   mente/lancamento/o-mestre-vivo.md §24 — src/motor/o-conferente-da-prosa.js,
   a ficha da cena (o alvo, quem fica calado, a coisa no NÃO PODE), as opções
   novas da poda do ausente e da memória do inventado, e a fiação no App.

   As situações são as da quinta sessão jogada (mestre-vivo-sessao-5.md),
   ditas por nós — nenhuma frase da IA nem de mesa real: a espada vendida
   que o sistema não vendeu, o cordão e os botões postos na mão, a gazua e a
   lâmina que a ficha nega, a pessoa da cena que responde pelo velho e
   repete a mesma fala, e a escalada que a prosa nem narrou. Cada caso tem o
   seu par do outro lado (o portão morde só o necessário: menção não é
   presença).
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { O_CONFERENTE, conferirAProsa, quemFicaCalado, linhaDoResultado, osMeiosNegados, CABECAS_DO_CONFERENTE } from "../src/motor/o-conferente-da-prosa.js";
import { A_FICHA_DA_CENA, fichaDaCenaNaPauta } from "../src/a-ficha-da-cena.js";
import { podarOAusente, PODA_DO_AUSENTE } from "../src/motor/poda-do-ausente.js";
import { oInventadoDaProsa, MEMORIA_DO_INVENTADO } from "../src/motor/memoria-do-inventado.js";
import { textoDaPauta, porNaPauta, TETO_DA_PAUTA } from "../src/pauta.js";

let falhas = 0;
const t = (nome, cond, extra) => { if (cond) console.log("  ok:", nome); else { falhas++; console.log("  FALHA:", nome, extra != null ? `→ ${extra}` : ""); } };
const sec = (s) => console.log(`\n[${s}]`);
const PROIBIDAS = /\b(dado|dados|rol\w+|teste|testes|sucesso|sorte|risco|regra|sistema|mestre|b[oô]nus|per[ií]cia|tu|teu|tua|contigo|ti)\b/i;

/* a cena da quinta sessão, dita por nós: o companheiro, a mulher de
   negócios que tomava a cena, o velho da rede (sem nome) e um vendedor */
const CENA = { pessoas: [
  { nome: "Torvald", papel: "ladino", estados: ["do_grupo"] },
  { nome: "Morgane", papel: "mulher de negócios", estados: [] },
  { nome: "", papel: "velho que remenda a rede", estados: [] },
  { nome: "", papel: "vendedor do balcão", estados: [] },
] };
const base = (x) => ({ cena: CENA, heroi: "Quilla", turno: 30, posses: [], estado: { personagem: { nome: "Quilla", inventario: [], equipado: {} } }, pagou: null, falas: {}, ...x });

sec("1. a tabela e a voz");
{
  const linhas = [...Object.values(O_CONFERENTE.troca), ...Object.values(O_CONFERENTE.resultado).flatMap((r) => Object.values(r))];
  t("as linhas do sistema não falam de dado, regra, sistema nem em PT-PT", linhas.every((s) => !PROIBIDAS.test(s)), linhas.filter((s) => PROIBIDAS.test(s)).join(" | "));
  t("as linhas do sistema são curtas (fala de mesa)", linhas.every((s) => s.length <= 60));
  t("a vez é um número pequeno da tabela", Number.isInteger(O_CONFERENTE.vez) && O_CONFERENTE.vez >= 2 && O_CONFERENTE.vez <= 6);
  t("as cabeças daqui não repetem as da memória do inventado", CABECAS_DO_CONFERENTE.length === Object.keys(O_CONFERENTE.maisObjetos).length);
  t("lixo devolve a prosa como veio e nunca lança", conferirAProsa(null, null).narrativa === "" && conferirAProsa("Chove.", null).narrativa === "Chove." && conferirAProsa("Chove.", { cena: 3, falas: "x" }).narrativa === "Chove.");
  t("as linhas da ficha (alvo e calados) também não falam de si", [A_FICHA_DA_CENA.alvo, A_FICHA_DA_CENA.calados, A_FICHA_DA_CENA.coisa].every((s) => !PROIBIDAS.test(s)));
}

sec("2. a espada que o sistema não vendeu (T14)");
{
  const frase = "compro uma espada curta";
  const prosa = "O mercador alisa a barba e olha a sua bolsa.\nVocê conta as moedas sobre o balcão. Ele lhe entrega a espada curta, embrulhada num pano.\nO cheiro de peixe sobe do cais.";
  const r = conferirAProsa(prosa, base({ frase, pagou: false }));
  t("o pagamento que a bolsa não fez sai", !r.narrativa.includes("conta as moedas"), r.narrativa);
  t("a espada posta na mão sai", !r.narrativa.includes("entrega a espada"), r.narrativa);
  t("o resto da cena fica", r.narrativa.includes("alisa a barba") && r.narrativa.includes("cheiro de peixe"));
  t("as podas dizem o porquê", r.podadas.some((p) => p.motivo === "pagamento") && r.podadas.some((p) => p.motivo === "objeto"), JSON.stringify(r.podadas));
  /* o outro lado: a compra fechou (a bolsa mexeu, a espada é dele) */
  const ok = conferirAProsa(prosa, base({ frase, pagou: true, posses: ["Espada Curta"], estado: { personagem: { nome: "Quilla", inventario: [{ nome: "Espada Curta" }], equipado: {} } } }));
  t("PAR: a compra que fechou passa inteira", ok.narrativa === prosa && ok.podadas.length === 0, JSON.stringify(ok.podadas));
  /* não se sabe se a bolsa mexeu: o pagamento não morde */
  const nulo = conferirAProsa("Você conta as moedas sobre o balcão.", base({ frase: "olho a banca", pagou: null }));
  t("PAR: sem saber da bolsa, o pagamento não morde", nulo.podadas.length === 0);
  /* o jogador nomear a espada não é a espada mudar de mão */
  const mencao = conferirAProsa("A espada curta repousa sobre o pano da banca, com o preço riscado a giz.", base({ frase }));
  t("PAR: a espada à vista na banca fica (menção não é presença)", mencao.podadas.length === 0, JSON.stringify(mencao.podadas));
  const venda = conferirAProsa("O mercador vende-lhe a última que tinha. A praça ferve.", base({ frase: "olho a banca", pagou: false }));
  t("a venda ao herói sem a bolsa mexer sai", !venda.narrativa.includes("vende-lhe") && venda.narrativa.includes("A praça ferve."), venda.narrativa);
}

sec("3. o cordão e os botões postos na mão (T19, T7)");
{
  const r = conferirAProsa("O velho resmunga, corta um palmo de cordão e entrega-lho sem olhar. A rede volta a correr entre os dedos dele.",
    base({ frase: "peço ao velho um pedaço de cordão da rede" }));
  t("o cordão pedido que o sistema não deu sai", !r.narrativa.includes("entrega-lho") && r.narrativa.includes("A rede volta"), r.narrativa);
  const ok = conferirAProsa("O velho resmunga e aponta a banca das cordas, do outro lado. A rede volta a correr entre os dedos dele.",
    base({ frase: "peço ao velho um pedaço de cordão da rede" }));
  t("PAR: o velho que só aponta fica", ok.podadas.length === 0);
  const tem = conferirAProsa("O velho corta um palmo de cordão e entrega-lho.",
    base({ frase: "peço ao velho um pedaço de cordão da rede", posses: ["Cordão"] }));
  t("PAR: o cordão que o sistema já pôs na bolsa fica", tem.podadas.length === 0);
  const b = conferirAProsa("Nada nos caixotes. Uma velha põe dois botões de osso na sua mão e some na multidão.", base({ frase: "reviro os caixotes atrás da barraca" }));
  t("os botões que a prosa pôs na mão saem", !b.narrativa.includes("botões") && b.narrativa.includes("Nada nos caixotes."), b.narrativa);
  const vb = conferirAProsa("Nada nos caixotes. Uma velha vende botões de osso numa esteira ao lado.", base({ frase: "reviro os caixotes atrás da barraca" }));
  t("PAR: os botões à venda na esteira ficam", vb.podadas.length === 0);
}

sec("4. a gazua e a lâmina que a ficha nega (T38, T36)");
{
  t("a frase diz que a gazua é dela, e ela não tem", JSON.stringify(osMeiosNegados("Arrombo o cadeado de um caixote com a minha gazua", [])) === JSON.stringify(["gazua"]));
  t("PAR: a lança do guarda não é do herói", osMeiosNegados("Fujo do guarda armado de lança", []).length === 0);
  t("PAR: quem tem as ferramentas não tem a gazua negada", osMeiosNegados("Arrombo com a minha gazua", ["Ferramentas de ladrão"]).length === 0);
  const g = conferirAProsa("Você enfia a gazua na fechadura e gira com cuidado. O aço range. O cadeado não cede.",
    base({ frase: "Arrombo o cadeado de um caixote com a minha gazua" }));
  t("a gazua em uso sai", !g.narrativa.includes("gazua") && g.narrativa.includes("O aço range."), g.narrativa);
  const gn = conferirAProsa("Você procura a gazua e não a tem; resta o ombro contra a tampa.", base({ frase: "Arrombo o cadeado de um caixote com a minha gazua" }));
  t("PAR: a gazua que a prosa diz que falta fica", gn.podadas.length === 0);
  const l = conferirAProsa("A lâmina encosta no pescoço do vendedor, fria. Ele engole em seco.", base({ frase: "Saco a minha espada e encosto a lâmina no pescoço do vendedor" }));
  t("a lâmina que a heroína não tem sai", !l.narrativa.includes("lâmina") && l.narrativa.includes("engole em seco"), l.narrativa);
  const lg = conferirAProsa("O guarda ergue a espada e manda você parar.", base({ frase: "Saco a minha espada e encosto a lâmina no pescoço do vendedor" }));
  t("PAR: a espada do guarda fica", lg.podadas.length === 0, JSON.stringify(lg.podadas));
  const tem = conferirAProsa("A lâmina encosta no pescoço do vendedor.", base({ frase: "Saco a minha espada", posses: [{ nome: "Espada longa" }] }));
  t("PAR: quem tem a espada a encosta", tem.podadas.length === 0);
}

sec("5. quem responde (T34, T15, T37)");
{
  const frase = "minto ao velho da rede: sou prima da governadora";
  const r = conferirAProsa("Morgane cruza os braços e ri.\n— Prima da governadora? Essa é boa.",
    base({ frase, alvo: "velho que remenda a rede", teste: { sucesso: false, desafio: "mentir" }, familia: "enganar" }));
  t("quem responde pelo velho sai, e a fala dela vai junto", !r.narrativa.includes("Morgane") && !r.narrativa.includes("Essa é boa"), r.narrativa);
  t("e o resultado vem à frente, sem nome de mecanismo", r.frente === O_CONFERENTE.resultado.enganar.falhaSem && r.narrativa.startsWith(r.frente), r.frente);
  const ok = conferirAProsa("O velho para de remendar e franze a testa.\n— Prima dela? E eu sou o rei. Morgane segura o riso.",
    base({ frase, alvo: "velho que remenda a rede", teste: { sucesso: false, desafio: "mentir" }, familia: "enganar" }));
  t("PAR: o velho responde, e a risada curta de quem está ao lado fica", ok.narrativa.includes("velho") && ok.narrativa.includes("Morgane") && ok.frente === "", ok.narrativa);
  const fala = conferirAProsa("Morgane se aproxima. — Ninguém o viu desde a maré alta.", base({ frase: "pergunto a Morgane onde está Magnus" }));
  t("PAR: quem a frase chama fala sempre", fala.podadas.length === 0);
  const grupo = conferirAProsa("Torvald dá de ombros. — Por mim, vamos.", base({ frase: "pergunto ao grupo se seguimos", aoGrupo: true, falas: { torvald: { turno: 29, fala: "outra coisa qualquer dita antes" } } }));
  t("PAR: a frase ao grupo deixa o companheiro falar", grupo.podadas.length === 0);
  const sobre = conferirAProsa("O vendedor cruza os braços. — Magnus? Não aparece há dias.", base({ frase: "pergunto ao vendedor do balcão por Magnus", alvo: "vendedor do balcão" }));
  t("PAR: falar DE alguém ausente pode", sobre.podadas.length === 0);
}

sec("6. a vez e a repetição (Morgane em ~35 de 41 turnos)");
{
  const falas = { morgane: { turno: 22, fala: "Magnus não está. Ninguém o viu desde a maré alta, e ele não deixou recado para você." } };
  const rep = conferirAProsa("Você sobe a escada; os degraus aguentam.\nMorgane diz, do pé da escada:\n— Magnus não está. Ninguém o viu desde a maré alta.",
    base({ frase: "subo pela escada encostada na parede até o sótão", turno: 26, falas }));
  t("a mesma fala outra vez sai", !rep.narrativa.includes("Magnus") && rep.narrativa.includes("Você sobe a escada"), rep.narrativa);
  const nova = conferirAProsa("Você sobe a escada; os degraus aguentam.\nMorgane diz, do pé da escada: — Cuidado com o terceiro degrau, está podre.",
    base({ frase: "subo pela escada encostada na parede até o sótão", turno: 26, falas }));
  t("PAR: uma fala nova, depois da vez, fica", nova.podadas.length === 0, JSON.stringify(nova.podadas));
  const cedo = conferirAProsa("Você olha em volta: barracas, redes, gaivotas. Torvald resmunga que o peixe fede.",
    base({ frase: "olho em volta", turno: 40, falas: { torvald: { turno: 39, fala: "vigio a praça daqui, pode ir" } } }));
  t("quem falou no turno passado e não foi chamado fica quieto", !cedo.narrativa.includes("Torvald") && cedo.narrativa.includes("gaivotas"), cedo.narrativa);
  const vez = conferirAProsa("Você olha em volta: barracas, redes, gaivotas. Torvald resmunga que o peixe fede.",
    base({ frase: "olho em volta", turno: 40, falas: { torvald: { turno: 36, fala: "vigio a praça daqui, pode ir" } } }));
  t("PAR: depois da vez, a intervenção curta fica", vez.podadas.length === 0);
  t("e a memória guarda quem falou, em que turno", vez.falas.torvald && vez.falas.torvald.turno === 40 && /peixe/.test(vez.falas.torvald.fala));
  t("a memória é objeto novo (a de quem chama não muda)", vez.falas !== falas && falas.morgane.turno === 22);
  const comprida = conferirAProsa(`O vendedor cruza os braços. Morgane se adianta e fala ${"sem parar sobre a dívida da casa, ".repeat(6)}até perder o fôlego.`,
    base({ frase: "ameaço o vendedor do balcão", alvo: "vendedor do balcão", teste: { sucesso: false, desafio: "intimidar" } }));
  t("a fala comprida num turno que é de outro sai", !comprida.narrativa.includes("Morgane"), comprida.narrativa);
  t("quem fica calado vai ao veto antes da narração", JSON.stringify(quemFicaCalado({ morgane: { turno: 29 }, torvald: { turno: 20 } }, 30, { frase: "olho em volta", pessoas: CENA.pessoas })) === JSON.stringify(["Morgane"]));
  t("PAR: quem a frase chama, ou o alvo, não fica calado", quemFicaCalado({ morgane: { turno: 29 } }, 30, { frase: "pergunto a Morgane", pessoas: CENA.pessoas }).length === 0
    && quemFicaCalado({ morgane: { turno: 29 } }, 30, { frase: "x", alvo: "Morgane", pessoas: CENA.pessoas }).length === 0);
  t("lixo: nenhum calado", quemFicaCalado(null, "x", null).length === 0);
}

sec("7. a ação não some (T25, T29)");
{
  const falas = { morgane: { turno: 24, fala: "Magnus não está. Ninguém o viu desde a maré alta, e ele não deixou recado." } };
  const r = conferirAProsa("Morgane suspira.\n— Magnus não está. Ninguém o viu desde a maré alta, e ele não deixou recado.",
    base({ frase: "escalo a calha até o telhado", turno: 25, falas, teste: { sucesso: true, desafio: "escalar" }, familia: "travessia", coisa: "calha" }));
  t("a escalada que a prosa trocou pela fala repetida: o resultado no lugar", r.narrativa === O_CONFERENTE.resultado.travessia.ok, r.narrativa);
  const ok = conferirAProsa("Você firma as botas no ferro da calha e se iça até as telhas.", base({ frase: "escalo a calha até o telhado", teste: { sucesso: true, desafio: "escalar" }, coisa: "calha" }));
  t("PAR: a escalada narrada não ganha linha", ok.frente === "" && ok.narrativa.startsWith("Você firma"));
  const ign = conferirAProsa("O vento sopra do mar e as gaivotas gritam sobre os barcos.", base({ frase: "procuro um compartimento nas tábuas do cais", teste: { sucesso: false, desafio: "buscar" }, coisa: "tábuas do cais" }));
  t("a busca que a prosa ignorou ganha a linha à frente, e o resto fica", ign.frente === O_CONFERENTE.resultado.procurar.falha && ign.narrativa.endsWith("sobre os barcos."), ign.narrativa);
  const sem = conferirAProsa("O vento sopra do mar.", base({ frase: "olho o mar" }));
  t("PAR: sem dado, nada à frente", sem.frente === "" && sem.narrativa === "O vento sopra do mar.");
  t("a linha do resultado com nome usa o nome", linhaDoResultado("enganar", true, "Torvald") === "Torvald acredita em você." && linhaDoResultado("enganar", false, "vendedor") === "Não acreditam em você.");
}

sec("8. a gente que a prosa inventou, e a troca");
{
  const r = conferirAProsa("Ursa Sombravinda aparece na porta e diz que tem peixe fresco.", base({ frase: "olho a rua" }));
  t("a pessoa inventada que fala sai, e o sistema escreve a troca", r.narrativa === O_CONFERENTE.troca.inventada && r.troca === O_CONFERENTE.troca.inventada, r.narrativa);
  const rel = conferirAProsa("Dizem que Ursa Sombravinda vende peixe no cais, mas hoje a banca está vazia.", base({ frase: "olho a rua" }));
  t("PAR: o boato sobre ela fica (menção não é presença)", rel.podadas.length === 0, JSON.stringify(rel.podadas));
}

sec("9. determinismo e imutabilidade");
{
  const ctx = base({ frase: "compro uma espada curta", pagou: false });
  const prosa = "Você conta as moedas sobre o balcão. A praça ferve.";
  const antes = JSON.stringify(ctx);
  const a = conferirAProsa(prosa, ctx), b = conferirAProsa(prosa, ctx);
  t("mesma entrada, mesma saída", JSON.stringify(a) === JSON.stringify(b));
  t("não mexe no contexto", JSON.stringify(ctx) === antes);
}

sec("10. as opções novas não mudam quem não as passa");
{
  /* a poda do ausente sem `limiar` nem `semTravaDaFala` é a de sempre */
  const aus = [{ nome: "Morgane Mão-Torta", onde: "Casa do Calafate", morto: false }];
  const prosa = "Morgane entra pela porta.";
  const sempre = podarOAusente(prosa, aus, { frase: "olho em volta" });
  t("a poda de sempre recusa levar o texto inteiro", sempre.recusou === "limiar" && sempre.narrativa === prosa && PODA_DO_AUSENTE.limiar === 0.4);
  const tudo = podarOAusente(prosa, aus, { frase: "olho em volta", limiar: 1 });
  t("com limiar 1 (só o conferente) a poda leva", tudo.recusou === "" && tudo.narrativa === "");
  /* a memória do inventado sem `maisObjetos` não conhece o cordão */
  const p = "O velho entrega-lhe um cordão de linho.";
  t("sem a opção, o cordão não é objeto (a memória de sempre)", oInventadoDaProsa(p, {}, {}).length === 0 && !Object.prototype.hasOwnProperty.call(MEMORIA_DO_INVENTADO.objetos, "cordao"));
  t("com a opção, é", oInventadoDaProsa(p, {}, { maisObjetos: O_CONFERENTE.maisObjetos }).some((o) => o.cabeca === "cordao"));
  t("e depois da chamada a régua volta à de sempre", oInventadoDaProsa(p, {}, {}).length === 0);
}

sec("11. a ficha da cena: a coisa no NÃO PODE, o alvo, os calados");
{
  const m = { cena: CENA, veredito: { tipo: "teste", id: "tranca", chave: "x" }, alvo: "" };
  const pa = fichaDaCenaNaPauta({ frase: "Arrombo o cadeado da arca", momento: m, bancas: [] });
  t("a coisa vai no NÃO PODE (medido: em ACABOU DE o teto a cortava em 44%)", pa.naoPode.some((l) => l.includes("«cadeado da arca»")) && pa.acabou.length === 0, JSON.stringify(pa));
  const ms = { cena: CENA, veredito: { tipo: "teste", id: "mentir", chave: "x" }, alvo: "velho que remenda a rede" };
  const ps = fichaDaCenaNaPauta({ frase: "minto ao velho", momento: ms, bancas: [], calados: ["Morgane", "Velho"] });
  t("o alvo ganha a linha de quem responde", ps.naoPode.includes(A_FICHA_DA_CENA.alvo.replace("{alvo}", "velho que remenda a rede")));
  t("quem falou há pouco vai calado, menos o alvo", ps.naoPode.includes(A_FICHA_DA_CENA.calados.replace("{lista}", "Morgane")), JSON.stringify(ps.naoPode));
  const sem = fichaDaCenaNaPauta({ frase: "olho em volta", momento: { cena: CENA, veredito: null }, bancas: [] });
  t("PAR: sem alvo nem calados, só as duas linhas de sempre", sem.naoPode.length === 2 && sem.acabou.length === 0);
  /* o custo, contra as pautas gravadas fora da luta (o teto do prompt não cresce) */
  const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
  let n = 0, chegou = 0, chegouCoisa = 0;
  for (const f of ["registo-s5-pauta.json", "registo-s6-s7-pauta.json"]) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const tu of j.turnos) {
      if (tu.luta || tu.masmorra) continue;
      let p = {};
      for (const [s, ix] of Object.entries(tu.secoes)) p[s] = ix.map((i) => j.linhas[i]);
      p = porNaPauta(p, "naoPode", ...ps.naoPode, ...pa.naoPode.slice(2));
      const tx = textoDaPauta(p, { turno: 40 });
      n++;
      if (ps.naoPode.every((l) => tx.includes(l))) chegou++;
      if (tx.includes(pa.naoPode[2])) chegouCoisa++;
      if (tx.length > TETO_DA_PAUTA) chegou = -9999;
    }
  }
  console.log(`  (pautas gravadas fora da luta: ${n}; a ficha inteira chega em ${chegou}; a coisa em ${chegouCoisa})`);
  t("nas pautas gravadas, a ficha com alvo e calados chega em ≥ 95% e o texto nunca passa do teto", chegou >= n * 0.95, `${chegou}/${n}`);
  t("e a coisa, no NÃO PODE, chega em ≥ 95% (em ACABOU DE eram 56%)", chegouCoisa >= n * 0.95, `${chegouCoisa}/${n}`);
}

sec("12. a fiação no App (atrás da chave)");
{
  const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
  const app = fs.readFileSync(path.join(dir, "..", "src", "App.jsx"), "utf8");
  const i = app.indexOf("conferirAProsa(resp.narrativa");
  t("o conferente corre no App, depois da poda do ausente e antes do livro", i > 0 && i > app.indexOf("const pd = podarOAusente(resp.narrativa") && i < app.indexOf("const narrativaDoLivro = String(resp.narrativa"));
  const bloco = app.slice(Math.max(0, i - 1200), i);
  t("só com o Mestre vivo, fora da luta, em calou", /if \(mestreVivoLigado\(\) && conferenteDoTurnoRef\.current/.test(bloco) && /calou\("Mestre vivo · o conferente da prosa"/.test(app.slice(i, i + 3000)));
  t("o conferente do turno só nasce na ficha da cena (que só corre com a chave)", (app.match(/conferenteDoTurnoRef\.current = \{/g) || []).length === 1
    && app.indexOf("conferenteDoTurnoRef.current = {") > app.indexOf("const fichaDaCenaNoTurno = (acao, m) => {"));
  t("e os calados vão à ficha pela memória do conferente", /calados = quemFicaCalado\(falasDoConferenteRef\.current/.test(app) && /fichaDaCenaNaPauta\(\{ frase: acao, momento: m, bancas, ausente: qn, calados \}\)/.test(app));
  t("nenhuma chamada nova ao Narrador no conferente", !/chamarMestre|chamarOAtor|chamarModelo/.test(app.slice(i - 1200, i + 3000)));
}

console.log(falhas ? `\n${falhas} falha(s)` : "\ntudo verde");
process.exit(falhas ? 1 : 0);
