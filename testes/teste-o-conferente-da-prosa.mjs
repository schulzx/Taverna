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
import { O_CONFERENTE, conferirAProsa, quemFicaCalado, linhaDoResultado, osMeiosNegados, CABECAS_DO_CONFERENTE, linhaDeReposicao, ehOrfa, contaOExito, aBolsaAgora, oQueEntrou } from "../src/motor/o-conferente-da-prosa.js";
import { A_FICHA_DA_CENA, fichaDaCenaNaPauta, nomesDoAchado, O_NOME_DO_ACHADO } from "../src/a-ficha-da-cena.js";
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
  /* MOVIDA em 21/11 (sessão 6 do Mestre vivo, «a frase órfã»): «Ele engole em seco» vinha logo
     depois da frase cortada, e o «ele» era o vendedor que só ela nomeava — sem ela, o pronome fica
     sem ninguém. A asserção dizia que a vizinha ficava; agora a órfã sai junto, e o que fica é a
     linha que diz o que vale (a lâmina não está com você). */
  t("a lâmina que a heroína não tem sai, e a vizinha órfã vai junto", !l.narrativa.includes("lâmina") && !l.narrativa.includes("engole em seco") && O_CONFERENTE.reposicao.meio.includes(l.narrativa), l.narrativa);
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
  /* MOVIDA em 21/11 (sessão 7 do Mestre vivo): a janela era de 1200 letras antes da chamada; a
     bolsa antes/depois e as linhas do sistema do turno entraram entre a chave e a chamada, e a
     chave ficou mais longe. A intenção é a mesma: o conferente só corre atrás da chave. */
  const bloco = app.slice(Math.max(0, i - 2600), i);
  t("só com o Mestre vivo, fora da luta, em calou", /if \(mestreVivoLigado\(\) && conferenteDoTurnoRef\.current/.test(bloco) && /calou\("Mestre vivo · o conferente da prosa"/.test(app.slice(i, i + 3000)));
  t("o conferente do turno só nasce na ficha da cena (que só corre com a chave)", (app.match(/conferenteDoTurnoRef\.current = \{/g) || []).length === 1
    && app.indexOf("conferenteDoTurnoRef.current = {") > app.indexOf("const fichaDaCenaNoTurno = (acao, m) => {"));
  t("e os calados vão à ficha pela memória do conferente", /calados = quemFicaCalado\(falasDoConferenteRef\.current/.test(app) && /fichaDaCenaNaPauta\(\{ frase: acao, momento: m, bancas, ausente: qn, calados \}\)/.test(app));
  t("nenhuma chamada nova ao Narrador no conferente", !/chamarMestre|chamarOAtor|chamarModelo/.test(app.slice(i - 1200, i + 3000)));
  /* 21/11: quem a ficha diz que não está aqui chega ao conferente */
  t("o ausente da ficha vai ao conferente do turno, e dele à conferência", /conferenteDoTurnoRef\.current = \{[^}]*ausente: qn/.test(app) && /ausente: cf\.ausente/.test(app.slice(i, i + 1500)));
}

sec("13. cortou, repõe (sessão 6: dez disparos, nenhuma linha no lugar)");
{
  const linhas = Object.values(O_CONFERENTE.reposicao).flat();
  t("as linhas que repõem não falam de si, nem em PT-PT, e são curtas", linhas.every((x) => !PROIBIDAS.test(x) && x.length <= 60 && !/\b(ficha|pauta|envelope)\b/i.test(x)), linhas.filter((x) => PROIBIDAS.test(x)).join(" | "));
  const frase = "compro uma espada curta";
  const prosa = "O mercador alisa a barba e olha a sua bolsa.\nVocê conta as moedas sobre o balcão. Ele lhe entrega a espada curta, embrulhada num pano.\nO cheiro de peixe sobe do cais.";
  const r = conferirAProsa(prosa, base({ frase, pagou: false }));
  const lp = linhaDeReposicao("pagamento", frase + "|30"), lo = linhaDeReposicao("objeto", frase + "|30");
  t("a venda cortada dá lugar à linha do pagamento e à do objeto, no lugar dela", r.repostas.includes(lp) && r.repostas.includes(lo) && r.narrativa.indexOf(lp) > r.narrativa.indexOf("alisa a barba") && r.narrativa.indexOf(lo) < r.narrativa.indexOf("cheiro de peixe"), r.narrativa);
  t("as linhas saem da tabela", O_CONFERENTE.reposicao.pagamento.includes(lp) && O_CONFERENTE.reposicao.objeto.includes(lo));
  t("mesma frase e mesmo turno, mesma linha (semente)", linhaDeReposicao("meio", "x|3") === linhaDeReposicao("meio", "x|3") && conferirAProsa(prosa, base({ frase, pagou: false })).narrativa === r.narrativa);
  const g = conferirAProsa("Você enfia a gazua na fechadura e gira com cuidado. O aço range. O cadeado não cede.", base({ frase: "Arrombo o cadeado de um caixote com a minha gazua" }));
  t("a gazua cortada dá lugar à linha do meio", O_CONFERENTE.reposicao.meio.some((x) => g.narrativa.startsWith(x)) && g.narrativa.endsWith("O cadeado não cede."), g.narrativa);
  const ok = conferirAProsa(prosa, base({ frase, pagou: true, posses: ["Espada Curta"], estado: { personagem: { nome: "Quilla", inventario: [{ nome: "Espada Curta" }], equipado: {} } } }));
  t("PAR: a troca que o sistema deu não ganha linha nenhuma", ok.narrativa === prosa && ok.repostas.length === 0);
  const opina = conferirAProsa("Torvald torce o nariz. — Cinquenta moedas por isso? Roubo.", base({ frase: "pergunto a Torvald o que acha da espada", pagou: false }));
  t("PAR: o companheiro que opina sobre o preço fica, sem linha", opina.podadas.length === 0 && opina.repostas.length === 0, JSON.stringify(opina.podadas));
}

sec("14. a frase órfã do que saiu (turnos 16, 54, 55)");
{
  t("o pronome, o «com ela», o «dele» e o gesto sem sujeito abrem órfã", ["Ela espera a resposta, imóvel.", "Com ela na mão, ele sorri.", "Os olhos dele varrem o salão.", "Não tira os olhos de você.", "Isso basta."].every(ehOrfa));
  t("PAR: a frase com sujeito próprio não é órfã", !["A meio-orc espera a resposta.", "O sino toca.", "Você espera.", "Dagny sorri."].some(ehOrfa));
  const r = conferirAProsa("A meio-orc se inclina sobre a banca. Você entrega duas moedas a ela. Ela espera a resposta, imóvel. O sino do cais toca.", base({ frase: "pago a meio-orc", pagou: false }));
  t("a órfã logo depois do pagamento cortado sai, o resto fica", !r.narrativa.includes("Ela espera") && r.narrativa.includes("se inclina") && r.narrativa.endsWith("O sino do cais toca.") && r.podadas.some((p) => p.motivo === "orfa"), r.narrativa);
  const f = conferirAProsa("Você olha em volta: barracas, redes, gaivotas. Torvald resmunga que o peixe fede. Não tira os olhos de você. A maré sobe.",
    base({ frase: "olho em volta", turno: 40, falas: { torvald: { turno: 39, fala: "vigio a praça daqui, pode ir" } } }));
  t("a órfã da fala cortada sai também", !f.narrativa.includes("Não tira") && f.narrativa.includes("A maré sobe."), f.narrativa);
  const longe = conferirAProsa("Você entrega duas moedas a ela. O sino do cais toca. Ela espera a resposta, imóvel.", base({ frase: "pago a meio-orc", pagou: false }));
  t("PAR: só a vizinha imediata — a que vem depois de outra frase fica", longe.narrativa.includes("Ela espera a resposta"), longe.narrativa);
  const sem = conferirAProsa("A meio-orc conta as moedas. Ela espera a resposta, imóvel.", base({ frase: "olho a banca", pagou: false }));
  t("PAR: sem corte, nenhuma órfã", sem.podadas.length === 0 && sem.narrativa.includes("Ela espera"));
}

sec("15. quem não está não fala (turnos 14, 26, 56)");
{
  const aus = { nome: "Neirin da Torre", onde: "Feira do Saque", morto: false };
  const r = conferirAProsa("A porta range.\nNeirin da Torre se aproxima do balcão.\n— Fala, então — diz Neirin.", base({ frase: "Neirin, vem cá, preciso falar com você", ausente: aus }));
  t("o ausente chamado que chega e fala sai, com a fala", r.narrativa === "A porta range." && r.podadas.every((p) => p.motivo === "ausente"), r.narrativa);
  const u = conferirAProsa("Ulric da Torre se ergue atrás da banca de mapas.\n— Estou aqui — responde.\nO vento traz sal.", base({ frase: "Ulric, vem cá!", ausente: { nome: "Ulric da Torre", onde: "" } }));
  t("o ausente que se ergue e responde sai", !u.narrativa.includes("Ulric") && !u.narrativa.includes("Estou aqui") && u.narrativa.includes("O vento traz sal."), u.narrativa);
  const so = conferirAProsa("— Fala, então — diz Neirin.", base({ frase: "Neirin, vem cá", ausente: aus }));
  t("a prosa que era só dele dá lugar à linha do chamado sem resposta", so.narrativa === O_CONFERENTE.troca.ausente && so.troca === O_CONFERENTE.troca.ausente, so.narrativa);
  const sobre = conferirAProsa("A atendente dá de ombros.\n— Neirin? Foi para a feira cedo — diz ela.", base({ frase: "Neirin, vem cá", ausente: aus }));
  t("PAR: falar DELE continua a valer", sobre.podadas.length === 0, JSON.stringify(sobre.podadas));
  const rel = conferirAProsa("Dizem que Neirin da Torre passou a manhã na feira.", base({ frase: "Neirin, vem cá", ausente: aus }));
  t("PAR: o relato sobre o ausente fica", rel.podadas.length === 0);
}

sec("16. o êxito na falha (turno 39)");
{
  const prosa = "Você corre entre as bancas e salta a primeira caixa. A mão segura, o pé assenta, e você está do outro lado, de pé. O guarda grita atrás.";
  const r = conferirAProsa(prosa, base({ frase: "fujo do guarda armado de lança, correndo e pulando as caixas", teste: { sucesso: false, desafio: "escapar" } }));
  t("a fuga que falhou e a prosa conta como certa: a frase do êxito sai e a falha entra no lugar", !r.narrativa.includes("do outro lado") && r.narrativa.includes(O_CONFERENTE.resultado.travessia.falha) && r.narrativa.startsWith("Você corre") && r.narrativa.endsWith("O guarda grita atrás.") && r.podadas.some((p) => p.motivo === "exito"), r.narrativa);
  t("e a falha não vem duas vezes", r.narrativa.split(O_CONFERENTE.resultado.travessia.falha).length === 2 && r.frente === "");
  const ok = conferirAProsa(prosa, base({ frase: "fujo do guarda", teste: { sucesso: true, desafio: "escapar" } }));
  t("PAR: o dado que passou deixa o êxito", ok.narrativa === prosa && ok.podadas.length === 0);
  t("PAR: a falha narrada fica (negação, «mas», «quase»)", !contaOExito("Você tenta saltar, mas o pé escorrega e você não chega do outro lado.") && !contaOExito("Você quase consegue.") && !contaOExito("Você não consegue."));
  t("PAR: ver alguém do outro lado não é chegar lá", !contaOExito("Você corre e vê o guarda do outro lado da praça."));
  t("PAR: o êxito de outro não é o seu", !contaOExito("O guarda chega do outro lado antes de você."));
  const conv = conferirAProsa("Você consegue arrancar dele um meio sorriso, e só.", base({ frase: "tento convencer o guarda", teste: { sucesso: false, desafio: "convencer" } }));
  t("PAR: fora da travessia a regra não morde", !conv.podadas.some((p) => p.motivo === "exito"));
}

/* ============================================================
   21/11 — a sétima sessão do Mestre vivo (mestre-vivo-sessao-7.md): as
   situações ditas por nós, nos moldes do que a sessão viu. Cada regra só
   morde quando se SABE que nada mudou de mão (a bolsa antes e depois).
   ============================================================ */
const CENA7 = { pessoas: [
  { nome: "Brigid Cinza-Antiga", papel: "guerreira", estados: ["do_grupo"] },
  { nome: "Hakon", papel: "moço da casa", estados: [] },
  { nome: "Sable", papel: "vendedora de ervas", estados: [] },
] };
const P7 = { nome: "Kaelith Punho-de-Pedra", inventario: [{ nome: "Bússola empenada" }], equipado: {}, moedas: 15, suprimentos: { racoes: 10, agua: 10, tochas: 5 } };
const NADA7 = oQueEntrou(aBolsaAgora(P7), aBolsaAgora(P7));
const b7 = (x) => ({ cena: CENA7, heroi: P7.nome, turno: 7, posses: P7.inventario, estado: { personagem: P7 }, pagou: false, entrou: NADA7, falas: {}, ...x });

sec("17. a bolsa antes e depois (o conferente só diz «não deu» quando sabe)");
{
  t("a mesma bolsa: sabe, e nada entrou", NADA7.sabe && !NADA7.ganhou && NADA7.entrou.length === 0);
  const depois = aBolsaAgora({ ...P7, moedas: 83, inventario: [...P7.inventario, { nome: "Erva Amarga" }, { nome: "Erva Amarga" }], suprimentos: { ...P7.suprimentos, tochas: 6 } });
  const e = oQueEntrou(aBolsaAgora(P7), depois);
  t("as moedas que subiram, as duas ervas (com repetição) e a tocha a mais entram", e.ganhou && JSON.stringify(e.entrou) === JSON.stringify(["Erva Amarga", "Erva Amarga", "tochas"]), JSON.stringify(e));
  t("PAR: sem retrato, não sabe (e as regras novas não mordem)", !oQueEntrou(null, depois).sabe && aBolsaAgora(null) === null);
  const venda = oQueEntrou(aBolsaAgora(P7), aBolsaAgora({ ...P7, inventario: [] }));
  t("PAR: o que saiu da bolsa não é o que entrou", venda.sabe && venda.entrou.length === 0 && !venda.ganhou);
}

sec("18. o companheiro que paga ou entrega por você (turnos 7, 59; sessão 6)");
{
  const r7 = conferirAProsa("Brigid se adianta, joga duas moedas no balcão e acena para Hakon. A cerveja desce diante de você.", b7({ frase: "peço a Brigid que pague uma caneca de cerveja para mim" }));
  t("a companheira que joga as moedas no balcão sai, e a linha dela entra no lugar", !r7.narrativa.includes("duas moedas") && r7.podadas.some((p) => p.motivo === "companheiro")
    && O_CONFERENTE.reposicao.companheiro.some((l) => r7.narrativa.startsWith(l.replace("{nome}", "Brigid"))) && r7.narrativa.endsWith("diante de você."), r7.narrativa);
  const r59 = conferirAProsa("Brigid não hesita. Puxa uma tocha do cinturão e a estende. — Leva.\nO fogo da lareira estala.", b7({ frase: "peço a Brigid que me entregue uma das tochas dela" }));
  t("a tocha que ela puxa e estende sai (o sujeito vem da frase de antes), e o «— Leva.» junto", !r59.narrativa.includes("tocha") && !r59.narrativa.includes("Leva") && r59.narrativa.startsWith("Brigid não hesita.") && r59.narrativa.endsWith("lareira estala."), r59.narrativa);
  t("e a fala que só entregava não repõe uma segunda linha", r59.repostas.length === 1, JSON.stringify(r59.repostas));
  const d = { pessoas: [{ nome: "Dagny", estados: ["do_grupo"] }, { nome: "Orsk", papel: "mercador", estados: [] }] };
  const s6 = conferirAProsa("Dagny estende a moeda sem olhar. Orsk sorri.", b7({ frase: "peço a Dagny uma moeda", cena: d }));
  const s6b = conferirAProsa("Dagny suspira. Enfia duas moedas na sua mão. A praça ferve.", b7({ frase: "pago o mercador", cena: d }));
  t("«Dagny estende a moeda» e «enfia duas moedas na sua mão» (sessão 6) saem", !s6.narrativa.includes("estende a moeda") && !s6b.narrativa.includes("Enfia duas") && s6b.narrativa.endsWith("A praça ferve."), `${s6.narrativa} | ${s6b.narrativa}`);
  t("a linha que repõe usa o primeiro nome dela, e sai da tabela", /^Dagny /.test(s6.narrativa) && O_CONFERENTE.reposicao.companheiro.some((l) => s6.narrativa.startsWith(l.replace("{nome}", "Dagny"))));
  const fr = "peço a Brigid que pague uma caneca de cerveja para mim";
  t("PAR: a recusa fica", conferirAProsa("Brigid cruza os braços. — Paga você. Hakon espera.", b7({ frase: fr })).podadas.length === 0);
  t("PAR: oferecer-se fica («posso pagar, se você quiser»)", conferirAProsa("Brigid ergue a sobrancelha. — Posso pagar, se você quiser.", b7({ frase: fr })).podadas.length === 0);
  t("PAR: a opinião sobre o preço fica", conferirAProsa("Brigid torce o nariz para o preço da caneca.", b7({ frase: fr })).podadas.length === 0);
  t("PAR: «não paga» fica", conferirAProsa("Brigid não paga nada a ninguém.", b7({ frase: fr })).podadas.length === 0);
  t("PAR: a transferência que o sistema fez fica", conferirAProsa("Brigid estende a moeda sem olhar.", b7({ frase: "peço a Brigid uma moeda", entrou: { sabe: true, ganhou: true, entrou: [] } })).podadas.length === 0);
  t("PAR: sem saber da bolsa, nada morde", conferirAProsa("Brigid joga duas moedas no balcão.", b7({ frase: fr, pagou: null, entrou: null })).podadas.length === 0);
  t("PAR: «estende a mão» não é dar a espada", conferirAProsa("Brigid estende a mão para o cabo da espada e balança a cabeça.", b7({ frase: "peço a Brigid que me entregue a espada dela" })).podadas.length === 0);
  t("PAR: numa frase que não é troca nem fala com ela, a bebida dela é dela", conferirAProsa("Brigid joga duas moedas no balcão pela própria caneca.", b7({ frase: "olho as pessoas do salão" })).podadas.length === 0);
  t("PAR: Hakon que estende a caneca não é a companheira", conferirAProsa("Hakon estende a caneca para Brigid.", b7({ frase: fr })).podadas.every((p) => p.motivo !== "companheiro"));
}

sec("19. o figurante que entrega o que o sistema não deu (turnos 26, 29)");
{
  const r26 = conferirAProsa("Sable amarra o maço de tomilho e alecrim com um fio.\n— Leva. Se eu não dormir, ninguém dorme.",
    b7({ frase: "regateio com a vendedora de ervas: um maço pela metade do preço", teste: { sucesso: true, desafio: "convencer" }, alvo: "vendedora de ervas" }));
  t("o «— Leva.» do regateio que só mexeu no preço sai, e o resto da fala fica", !/Leva/.test(r26.narrativa) && r26.narrativa.includes("— Se eu não dormir, ninguém dorme.") && r26.narrativa.includes("amarra o maço"), r26.narrativa);
  const r29 = conferirAProsa("O homem desliza um vidro pelo balcão. — Leva. E não volte.", b7({ frase: "regateio com o freguês dela: um frasco de graça" }));
  t("o frasco pedido que virou «um vidro» deslizado sai, com o «Leva»", !r29.narrativa.includes("vidro") && !r29.narrativa.includes("Leva") && r29.podadas.some((p) => p.motivo === "objeto"), r29.narrativa);
  t("PAR: o maço que foi pago fica, com o «Leva»", conferirAProsa("Sable empurra o maço. — Leva.", b7({ frase: "dou duas moedas a Sable pelo tomilho", pagou: true })).podadas.length === 0);
  t("PAR: «Leva o maço por seis» é preço, não entrega", conferirAProsa("Sable cruza os braços. — Leva o maço por seis.", b7({ frase: "regateio o maço" })).podadas.length === 0);
  t("PAR: sem pedido na frase, o «Leva» de outra conversa fica", conferirAProsa("Sable ri para o freguês. — Leva.", b7({ frase: "olho a banca" })).podadas.length === 0);
}

sec("20. o achado fantasma (turnos 25, 35, 36)");
{
  const r36 = conferirAProsa("Você enfia a carta na mochila, entre a bússola e a capa.", b7({ frase: "pego a carta amarrada e guardo na mochila" }));
  t("«enfia a carta na mochila» sem nada ter entrado sai, e a linha repõe", !r36.narrativa.includes("enfia a carta") && O_CONFERENTE.reposicao.objeto.includes(r36.narrativa), r36.narrativa);
  t("PAR: ler a carta no lugar fica", conferirAProsa("Você desamarra a carta e lê as primeiras linhas, úmidas.", b7({ frase: "pego a carta amarrada e leio" })).podadas.length === 0);
  t("PAR: a carta que entrou na bolsa fica", conferirAProsa("Você enfia a carta na mochila.", b7({ frase: "pego a carta e guardo na mochila", entrou: { sabe: true, ganhou: false, entrou: ["Carta amarrada"] } })).podadas.length === 0);
  t("PAR: a chave pendurada no gancho é vista, não levada (menção não é presença)", conferirAProsa("E logo atrás, pendurada num gancho, uma chave de ferro com a alça quebrada.", b7({ frase: "reviro os cestos de peixe" })).podadas.length === 0);
  /* o achado que o sistema deu: a linha do sistema nomeou o relicário, e a prosa que o conta fica */
  const P47 = { ...P7, moedas: 79, inventario: [...P7.inventario, { nome: "Erva Amarga" }, { nome: "Erva Amarga" }] };
  const prosa47 = "A gaveta cede. Você encontra um relicário de prata escondido sob papéis, com moedas e duas ervas secas.";
  const c47 = { frase: "reviro as gavetas da mesa do capitão", posses: P47.inventario, estado: { personagem: P47 }, teste: { sucesso: true, desafio: "buscar" }, entrou: { sabe: true, ganhou: true, entrou: ["Erva Amarga", "Erva Amarga"] } };
  const r47 = conferirAProsa(prosa47, b7({ ...c47, doSistema: ["📿 Achado: um relicário guardado longe dos olhos — ◉ 68 moedas · 🌿 Erva Amarga, 🌿 Erva Amarga"] }));
  t("PAR: o relicário que a linha do achado nomeou fica (cortar o que o sistema deu apaga a recompensa)", r47.narrativa === prosa47 && r47.podadas.length === 0, r47.narrativa);
  const r47s = conferirAProsa(prosa47, b7({ ...c47, doSistema: [] }));
  t("(sem a linha do sistema, o relicário que ninguém deu continua a sair, como antes)", r47s.podadas.some((p) => p.motivo === "objeto"));
}

sec("21. o nome do achado na linha que o anuncia (turno 47)");
{
  const l = nomesDoAchado(["🌿 Erva Amarga", "🌿 Erva Amarga", "🗡 Adaga curta"]);
  t("o nome exato, contado, sem o ícone", l.includes("2× Erva Amarga") && l.includes("Adaga curta") && !l.includes("🌿"), l);
  t("a linha sai da tabela, e não fala de si", l.startsWith(O_NOME_DO_ACHADO.linha.split("{lista}")[0]) && !/\b(sistema|ficha|pauta|dado|regra)\b/i.test(l));
  t("PAR: sem nada além das moedas, nenhuma linha", nomesDoAchado([]) === "" && nomesDoAchado(null) === "");
}

sec("22. o ausente que fala (turno 51; «Neirin para no vão da porta»)");
{
  const aus = { nome: "Sable", onde: "O Rossio dos Andarilhos", morto: false };
  const c1 = { pessoas: [{ nome: "Brigid Cinza-Antiga", estados: ["do_grupo"] }] };
  const r51 = conferirAProsa("Passos na escada.\nSable sobe a escada devagar… — Aqui em cima? … — Fala.\nBrigid encosta na parede.", b7({ frase: "Sable, venha cá! Preciso falar com você", ausente: aus, cena: c1 }));
  t("a ausente que sobe a escada (verbo que a poda não conhecia) sai, com a fala colada", !r51.narrativa.includes("Sable") && !r51.narrativa.includes("Aqui em cima") && r51.narrativa === "Passos na escada.\nBrigid encosta na parede.", r51.narrativa);
  const n = { nome: "Neirin da Torre", onde: "Feira do Saque", morto: false };
  const rn = conferirAProsa("Neirin para no vão da porta.\n— O que foi?\nA chuva bate.", b7({ frase: "Neirin, vem cá", ausente: n }));
  t("«Neirin para no vão» sai pela posição, e a linha de fala seguinte vai junto", rn.narrativa === "A chuva bate.", rn.narrativa);
  t("PAR: «Para Neirin, isso…» e «fala para Neirin» ficam", conferirAProsa("A atendente dá de ombros. Para Neirin, isso é cedo demais. Ela fala para Neirin vir depois.", b7({ frase: "Neirin, vem cá", ausente: n })).podadas.length === 0);
  t("PAR: «Neirin? Ninguém a viu.» fica (nada de verbo logo depois)", conferirAProsa("Neirin? Ninguém a viu hoje.", b7({ frase: "Neirin, vem cá", ausente: n })).podadas.length === 0);
  t("PAR: «Neirin está na feira» fica (estar não é chegar)", conferirAProsa("Neirin está na feira desde cedo.", b7({ frase: "Neirin, vem cá", ausente: n })).podadas.length === 0);
  t("PAR: sem ausente, «Sable sobe a escada» fica", conferirAProsa("Sable sobe a escada devagar.", b7({ frase: "olho a escada" })).podadas.length === 0);
}

sec("23. as frases órfãs (turnos 8, 12, 19, 49)");
{
  const r8 = conferirAProsa("Hakon olha a janela. Brigid tira uma moeda e põe na sua mão: \"Toma. Cerveja paga, agora me diz o que viu lá fora.\" A lareira estala.", b7({ frase: "peço à Brigid que me dê uma moeda do bolso dela" }));
  t("a fala entre aspas que a frase cortada abriu vai junto (sem a aspa que fecha sozinha)", !r8.narrativa.includes("Cerveja paga") && !r8.narrativa.includes("\"") && r8.narrativa.startsWith("Hakon olha a janela.") && r8.narrativa.endsWith("A lareira estala."), r8.narrativa);
  const r49 = conferirAProsa("Rolos, cotas, botas velhas. Brigid ergue um mapa: \"O capitão andou olhando para o mar. E tem pressa.\" Ela solta o pergaminho devagar. A sala esfria.", b7({ frase: "olho a estante de mapas", turno: 49, falas: { brigid: { turno: 48, fala: "nada aqui" } } }));
  t("o resto da fala e o «Ela solta» sem dono saem com a fala cortada", r49.narrativa === "Rolos, cotas, botas velhas. A sala esfria.", r49.narrativa);
  const r12 = conferirAProsa("Sua voz corta o salão. Cora Rompe-Escudos ergue a cabeça da mesa. Junta as mãos no avental e aproxima-se… — O que quer de mim?", b7({ frase: "Cora, venha aqui", ausente: { nome: "Cora Rompe-Escudos", onde: "Casa do Martelo Calada" } }));
  t("«Junta as mãos… e aproxima-se» sem sujeito sai com a ausente, e a fala dela também", r12.narrativa === "Sua voz corta o salão.", r12.narrativa);
  t("a etiqueta com pronome abre órfã («diz ele.»)", ehOrfa("diz ele.") && ehOrfa("Responde ela, seca."));
  t("PAR: a etiqueta com nome não é órfã", !ehOrfa("diz Hakon.") && !ehOrfa("Diz que vem amanhã."));
  const sem = conferirAProsa("Brigid ergue um mapa: \"O capitão andou olhando para o mar.\" A sala esfria.", b7({ frase: "olho a estante" }));
  t("PAR: sem corte, a fala entre aspas fica inteira", sem.podadas.length === 0);
}

sec("24. a fiação nova no App (a bolsa, as linhas do turno, o nome do achado, o log)");
{
  const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
  const app = fs.readFileSync(path.join(dir, "..", "src", "App.jsx"), "utf8");
  t("o retrato da bolsa nasce com o conferente do turno, em calou", /bolsaC = aBolsaAgora\(/.test(app) && /calou\("Mestre vivo · a bolsa antes da frase"/.test(app) && /conferenteDoTurnoRef\.current = \{[^}]*bolsa: bolsaC/.test(app));
  const i = app.indexOf("conferirAProsa(resp.narrativa");
  /* 22/11 (a décima terceira sessão): a janela cresceu de 2500 para 3500 — a fiação do mundo fechado (E1) e do
     ausente lido antes de mudar de lugar (T41) entrou na chamada, e o log ficou fora dos 2500; a intenção é a mesma */
  const bloco = app.slice(i - 3500, i + 3500);
  t("o que entrou e as linhas do sistema do turno chegam à conferência", /entrouC = cf\.bolsa \? oQueEntrou\(cf\.bolsa, aBolsaAgora\(pC\)\)/.test(bloco) && /entrou: entrouC, doSistema: doSistemaC/.test(bloco));
  /* 21/11 (a oitava sessão): a asserção mudou — o testador não conseguia julgar
     os cortes 14 e 28 com 60 letras; o console guarda agora a frase cortada inteira */
  t("o log do console leva, por corte, o motivo e a frase inteira (só no console)", /cortes: cfr\.podadas\.map\(\(x\) => \(\{ motivo: x\.motivo, frase: String\(x\.frase \|\| ""\) \}\)\)/.test(bloco));
  t("o nome do achado vai na linha que o anuncia, em calou", /nomesA = nomesDoAchado\(extras\)/.test(app) && /calou\("Mestre vivo · o nome do achado"/.test(app));
}

console.log(falhas ? `\n${falhas} falha(s)` : "\ntudo verde");
process.exit(falhas ? 1 : 0);
