/* teste-o-mestre-chama.mjs (Fase MC, MC2 · 10/11/2026) — «o Mestre chama o
   dado».

   Entre a frase e o dado, a linha do Mestre: a perícia, o número a bater e o
   preço de falhar (motor/o-mestre-chama.js). As provas são as da linha MC2
   da planta (mente/plano-o-mestre-chama-o-dado.md, §5):
     · todo alvo com chamado tem aviso;
     · o efeito avisado é o cobrado — dez mil rolagens por linha;
     · a CD e a linha de uma busca com e sem achado são indistinguíveis;
     · não chama em livre, trivial, automático, luta, conversa (nem quando o
       mundo já disse NÃO);
     · mesma semente = mesmo chamado;
     · a régua de sucesso por degrau não cai. */
import {
  lerAcao, comoSeDiz, DESAFIOS, DIFICULDADES, CUSTO_DE_FALHAR, custoPorAlvo, desfechoDaFalha,
  SITUACAO_DA_CD, EFEITOS_DA_FALHA, efeitosCobrados,
} from "../src/desafios.js";
import { oChamado, porQueNaoChama, O_CHAMADO, QUANDO_O_MESTRE_CHAMA, esperaDoChamado } from "../src/motor/o-mestre-chama.js";
import { rngDe } from "../src/geografia.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const heroi = { nivel: 1, inventario: [{ nome: "Gazuas de ladrão" }], habilidades: [], equipado: {} };
const base = { personagem: heroi, semente: "mc2|chamado", lugar: "Largo do Cereal", tentativas: {}, dia: 4, objetoEmCena: () => true };
const ler = (f, extra = {}) => lerAcao(f, { ...base, ...extra });
const avisosDe = (c) => (typeof c.aviso === "string" ? [c.aviso] : Object.values(c.aviso || {}));
/* o veredito de cada desafio, pela frase que ele próprio ensina */
const vereditos = DESAFIOS.map((d) => ({ d, v: ler(comoSeDiz(d.id)) })).filter((x) => x.v && x.v.tipo === "teste");

sec("1. todo alvo com chamado tem aviso, e o aviso cabe numa linha");
{
  t("o catálogo inteiro deu teste pela frase de exemplo", vereditos.length === DESAFIOS.length);
  const semAviso = CUSTO_DE_FALHAR.filter((c) => !avisosDe(c).length || !c.efeito).map((c) => c.alvo);
  t(`toda linha de CUSTO_DE_FALHAR tem aviso e efeito${semAviso.length ? " — faltam: " + semAviso.join(", ") : ""}`, semAviso.length === 0);
  const longos = CUSTO_DE_FALHAR.flatMap((c) => avisosDe(c).filter((a) => a.length > O_CHAMADO.tetoDoAviso).map((a) => `${c.alvo} (${a.length})`));
  t(`nenhum aviso passa de ${O_CHAMADO.tetoDoAviso} caracteres${longos.length ? " — " + longos.join(", ") : ""}`, longos.length === 0);
  t("todo aviso começa por «Se falhar,»", CUSTO_DE_FALHAR.every((c) => avisosDe(c).every((a) => /^Se falhar, /.test(a))));
  t("toda variante de aviso é uma que o chamado sabe escolher",
    CUSTO_DE_FALHAR.every((c) => typeof c.aviso === "string" || Object.keys(c.aviso).every((k) => k === "base" || O_CHAMADO.ordemDoAviso.includes(k))));
  t("toda variante tem a base", CUSTO_DE_FALHAR.every((c) => typeof c.aviso === "string" || typeof c.aviso.base === "string"));
  t("todo efeito é uma etiqueta da tabela", CUSTO_DE_FALHAR.every((c) => EFEITOS_DA_FALHA.some((e) => e.id === c.efeito)));
  /* o chamado de cada desafio que não é conversa: com aviso, e o aviso é o da linha */
  const naoSociais = vereditos.filter((x) => !x.v.social);
  const mudos = naoSociais.filter(({ v }) => {
    const c = oChamado(v, {});
    const linha = custoPorAlvo(v.alvoDoCusto);
    return !c || !c.aviso || !linha || !avisosDe(linha).includes(c.aviso) || c.efeito !== linha.efeito;
  }).map((x) => x.d.id);
  t(`todo desafio que não é conversa é chamado, com o aviso e o efeito da sua linha${mudos.length ? " — " + mudos.join(", ") : ""}`, mudos.length === 0);
  const um = oChamado(ler("Sigo o rasto até à mata."), {});
  t("a linha é o molde: perícia, número, preço", um.linha === `Sobrevivência. Precisa de ${um.dc}. ${um.aviso}`);
  t("e o dado à espera é o d20", um.dado.teste === "d20");
  t("o preço que morde diz o dado da mordida", oChamado(ler("desarmo a armadilha antes de pisar nela"), {}).dado.preco === "2d6");
  t("o que cai diz o dado da queda", /^\d+d6$/.test(oChamado(ler("escalo o muro pelo lado da hera"), {}).dado.preco));
  t("e o que não morde não inventa dado", oChamado(ler("Sigo o rasto até à mata."), {}).dado.preco === null);
}

sec("2. o efeito avisado é o cobrado — dez mil falhas por linha");
{
  /* o veredito de cada linha: o do catálogo quando há desafio com esse
     alvo; para o improviso, um veredito mínimo da família */
  const vDaLinha = (c) => {
    const real = vereditos.find((x) => x.v.alvoDoCusto === c.alvo);
    return real ? real.v : { tipo: "teste", id: "improviso", alvoDoCusto: c.alvo, chave: `largo|${c.alvo}`, dc: 13, barulho: false, testemunha: false };
  };
  const r = rngDe("mc2|dez-mil");
  const erros = [];
  let secas = 0;
  for (const c of CUSTO_DE_FALHAR) {
    const v0 = vDaLinha(c);
    for (let i = 0; i < 10000; i++) {
      const deg = DIFICULDADES[Math.floor(r() * DIFICULDADES.length)];
      const dc = deg.dc;
      const total = dc - 1 - Math.floor(r() * 12);
      const v = { ...v0, dc, fechaDepois: v0.fechaDepois || (c.alvo === "busca" && r() < 0.5) };
      const des = desfechoDaFalha(v, total, dc, { desastre: r() < 0.05, sorte: r });
      if (!des || des.porPouco) continue; /* o «quase» é um SIM pago: o preço dele é outro */
      secas++;
      if (!efeitosCobrados(des, v).includes(c.efeito)) { erros.push(`${c.alvo}@${dc}/${total}`); break; }
    }
  }
  t(`${secas} falhas secas roladas, e em todas o efeito avisado foi cobrado${erros.length ? " — " + erros.join(", ") : ""}`, erros.length === 0 && secas > CUSTO_DE_FALHAR.length * 5000);
  /* `fecha` é o preço de toda falha (o livro de tentativas); só é a etiqueta
     de uma linha cuja falha seca não cobra mais nada */
  const fingidas = CUSTO_DE_FALHAR.filter((c) => {
    const v = vDaLinha(c);
    const des = desfechoDaFalha({ ...v, dc: 13 }, 1, 13, { sorte: () => 0 });
    const outros = efeitosCobrados(des, v).filter((e) => e !== "fecha");
    return c.efeito === "fecha" ? outros.length > 0 : false;
  }).map((c) => c.alvo);
  t(`«fecha» só onde a falha não cobra mais nada${fingidas.length ? " — " + fingidas.join(", ") : ""}`, fingidas.length === 0);
  t("a etiqueta sem desfecho não cobra nada", efeitosCobrados(null, {}).length === 0);
}

sec("3. o número não denuncia o segredo (§2.6)");
{
  for (const frase of ["Olho em volta com atenção.", "Examino o corte na carcaça."]) {
    for (const dcDoAchado of [10, 18, 25]) {
      const achadoDe = () => ({ especie: "segredo", dc: dcDoAchado, nome: "um fundo falso", acha: "percepcao" });
      const com = ler(frase, { achadoDe });
      const sem = ler(frase, { achadoDe: () => null });
      t(`«${frase}» com achado de CD ${dcDoAchado}: a mesma CD e a mesma etiqueta`, com.dc === sem.dc && com.deOnde === sem.deOnde);
      const cc = oChamado(com, {}), cs = oChamado(sem, {});
      t("e a mesma linha do chamado", cc && cs && cc.linha === cs.linha && cc.dc === cs.dc);
    }
  }
  t("o achado continua a viajar no veredito (é ele que decide o que o sucesso dá)",
    !!ler("Olho em volta com atenção.", { achadoDe: () => ({ dc: 18, nome: "x" }) }).achado);
  t("e nenhuma etiqueta conta que há algo escondido",
    !/escondido/.test(ler("Olho em volta com atenção.", { achadoDe: () => ({ dc: 18, nome: "x" }) }).deOnde));
}

sec("4. quando o Mestre NÃO chama");
{
  t("a régua tem as seis linhas de §2.3", ["naoETeste", "luta", "conversa", "trivial", "automatico", "mundoDisseNao"].every((id) => QUANDO_O_MESTRE_CHAMA.some((r) => r.id === id)));
  t("toda linha diz porquê e o que acontece em vez", QUANDO_O_MESTRE_CHAMA.every((r) => r.porque && r.emVez));
  const rasto = ler("Sigo o rasto até à mata.");
  t("livre: «bebo a cerveja»", oChamado(ler("bebo a cerveja"), {}) === null && porQueNaoChama(ler("bebo a cerveja"), {}) === "naoETeste");
  t("nada: null, {} e lixo", oChamado(null, {}) === null && oChamado({}, null) === null && oChamado("teste", {}) === null);
  t("trivial: CD 5", oChamado({ ...rasto, dc: 5 }, {}) === null && porQueNaoChama({ ...rasto, dc: 5 }, {}) === "trivial");
  t("automático: o bónus que nem o 1 falha", porQueNaoChama(rasto, { bonus: rasto.dc }) === "automatico" && oChamado(rasto, { bonus: rasto.dc }) === null);
  t("automático: e o que nem o 20 alcança", porQueNaoChama(rasto, { bonus: -10 }) === "automatico");
  t("mas o bónus que deixa o dado decidir chama", oChamado(rasto, { bonus: 3 }) !== null);
  t("e sem bónus conhecido também chama", oChamado(rasto, { bonus: null }) !== null && oChamado(rasto, { bonus: "3" }) !== null);
  const luta = ler("Sigo o rasto até à mata.", { emCombate: true });
  t("luta: a mesa tem o seu d20", oChamado(luta, { emCombate: true }) === null && porQueNaoChama(luta, { emCombate: true }) === "luta");
  const conversa = ler("tento convencer o guarda a me deixar passar");
  t("conversa: não se rola", conversa.tipo === "teste" && oChamado(conversa, {}) === null && porQueNaoChama(conversa, {}) === "conversa");
  t("mas ler quem fala, sim (Intuição chama)", oChamado(ler("tento saber se ele está mentindo"), {}) !== null);
  t("o mundo disse NÃO antes do dado", oChamado(rasto, { mundoDisseNao: true }) === null && porQueNaoChama(rasto, { mundoDisseNao: true }) === "mundoDisseNao");
  t("e o já revirado não chama", oChamado({ tipo: "vasculhado", rotulo: "vasculhar o lugar" }, {}) === null);
}

sec("5. mesma semente, mesmo chamado");
{
  const frases = ["Sigo o rasto até à mata.", "forço a fechadura com a gazua", "escalo o muro pelo lado da hera", "O que sei de Alto Negro?"];
  for (const f of frases) {
    const a = JSON.stringify(oChamado(ler(f, { chove: true }), { contexto: { cidade: true } }));
    const b = JSON.stringify(oChamado(ler(f, { chove: true }), { contexto: { cidade: true } }));
    t(`«${f}»: o mesmo chamado duas vezes`, a === b && a !== "null");
  }
  /* a tranca e a queda saem da semente: outra semente pode dar outro número */
  const dcs = new Set(["a", "b", "c", "d", "e", "f", "g", "h"].map((s) => oChamado(ler("forço a fechadura com a gazua", { semente: s }), {}).dc));
  t("a semente manda no número da tranca (e só ela)", dcs.size > 1);
  t("o chamado devolvido é congelado", Object.isFrozen(oChamado(ler("Sigo o rasto até à mata."), {})));
}

sec("6. a CD pela situação, e a régua que não cai");
{
  t("a tabela tem a luta, a chuva e o escuro", ["luta", "chuva", "escuro"].every((id) => SITUACAO_DA_CD.some((l) => l.id === id)));
  t("toda linha diz quando, quanto e o quê", SITUACAO_DA_CD.every((l) => l.quando && Number.isFinite(l.delta) && l.delta > 0 && l.diz && l.se));
  const luta = SITUACAO_DA_CD.find((l) => l.id === "luta");
  /* o +3 que era solto em lerAcao (desafios.js, v9.64) mora na tabela, e a
     etiqueta é a mesma de sempre, letra por letra */
  const r0 = ler("Sigo o rasto até à mata."), rL = ler("Sigo o rasto até à mata.", { emCombate: true });
  t("a luta soma o delta da tabela", rL.dc === r0.dc + luta.delta && /no meio da luta \(\+3\)/.test(rL.deOnde));
  t("a fraqueza continua a valer na luta sem pagar", ler("o que sei sobre essa criatura?", { emCombate: true }).dc === ler("o que sei sobre essa criatura?").dc);
  const rC = ler("Sigo o rasto até à mata.", { chove: true });
  t("a chuva pesa no rasto, e diz-se", rC.dc === r0.dc + 2 && rC.situacoes.some((s) => s.id === "chuva"));
  t("e o chamado diz a chuva e escolhe o aviso dela", /com a chuva/.test(oChamado(rC, {}).linha) && /chuva/.test(oChamado(rC, {}).aviso));
  t("a chuva não pesa na fechadura", ler("forço a fechadura com a gazua", { chove: true }).dc === ler("forço a fechadura com a gazua").dc);
  /* A RÉGUA: sem contexto, a CD de hoje; com qualquer contexto, nunca mais
     do que o peso da luta acima dela — o pior caso que o jogo já tinha */
  const contextos = [{ chove: true }, { escuro: true }, { chove: true, escuro: true }, { emCombate: true }, { emCombate: true, chove: true, escuro: true }];
  const passaram = vereditos.every(({ d, v }) => contextos.every((cx) => {
    const w = ler(comoSeDiz(d.id), cx);
    return !w || w.tipo !== "teste" || (w.dc - v.dc >= 0 && w.dc - v.dc <= luta.delta);
  }));
  t("nenhum contexto sobe a CD mais do que a luta já subia", passaram);
  t("o chamado não mexe no número: a CD dele é a do veredito",
    vereditos.filter((x) => !x.v.social).every(({ v }) => { const c = oChamado(v, {}); return c && c.dc === v.dc; }));
  /* a taxa de sucesso por degrau do herói de nível 1 (bónus de 0 a +5),
     com o chamado e sem contexto, é a da régua — número por número */
  const taxa = (b, dc) => Math.max(0, Math.min(20, 21 + b - dc)) / 20;
  const rasto = ler("Sigo o rasto até à mata.");
  const igual = DIFICULDADES.filter((g) => g.dc > 5).every((g) => {
    const c = oChamado({ ...rasto, dc: g.dc, situacoes: [] }, {});
    return c && [0, 1, 2, 3, 4, 5].every((b) => taxa(b, c.dc) === taxa(b, g.dc));
  });
  t("a taxa de sucesso por degrau, com o chamado, é a de hoje", igual);
  /* e com a chuva e o escuro juntos no rasto, a taxa nunca fica abaixo da
     que a luta de hoje já dava ao mesmo degrau */
  const juntos = ler("Sigo o rasto até à mata.", { chove: true, escuro: true });
  t("chuva e escuro juntos não descem abaixo da taxa da luta",
    [0, 1, 2, 3, 4, 5].every((b) => taxa(b, juntos.dc) >= taxa(b, rasto.dc + luta.delta)));
}

sec("7. o que a peça pede ao motor (formas.md §MC 9, 11/11)");
{
  /* o cobrado: o preço no indicativo, para a linha da falha depois do dado */
  const todos = vereditos.flatMap(({ v }) => [{}, { contexto: { chuva: true } }, { contexto: { noite: true } }, { contexto: { cidade: true } }].map((cx) => oChamado(v, cx))).filter(Boolean);
  t("houve chamados para provar", todos.length > 0);
  t("o cobrado nunca começa por «Se falhar»", todos.every((c) => typeof c.cobrado === "string" && c.cobrado && !/^se falhar/i.test(c.cobrado)));
  t("nem acaba em ponto", todos.every((c) => !/[.!…;]\s*$/.test(c.cobrado)));
  t("e é o aviso, palavra por palavra, sem o condicional", todos.every((c) => c.aviso === "Se falhar, " + c.cobrado + "."));
  const rasto = oChamado(ler("Sigo o rasto até à mata.", { chove: true }), {});
  t("o rasto com chuva: «a chuva apaga a trilha e meia hora se vai»", rasto && rasto.cobrado === "a chuva apaga a trilha e meia hora se vai");
  /* a espera cresce com a fala: 250 ms por palavra, piso e teto (Brysbaert 2019) */
  const palavras = (c) => c.linha.split(/\s+/).filter(Boolean).length;
  t(`a fala do rasto com chuva (${palavras(rasto)} palavras) espera ${esperaDoChamado(rasto)} ms`, esperaDoChamado(rasto) === Math.min(O_CHAMADO.esperaTeto, Math.max(O_CHAMADO.esperaSozinho, palavras(rasto) * O_CHAMADO.esperaPorPalavra)) && esperaDoChamado(rasto) > O_CHAMADO.esperaSozinho);
  t("toda espera fica entre o piso e o teto", todos.every((c) => { const e = esperaDoChamado(c); return e >= O_CHAMADO.esperaSozinho && e <= O_CHAMADO.esperaTeto; }));
  t("a fala curta fica no piso, a longa no teto", esperaDoChamado({ linha: "Atletismo. Precisa de 12." }) === O_CHAMADO.esperaSozinho && esperaDoChamado({ linha: "palavra ".repeat(60) }) === O_CHAMADO.esperaTeto);
  t("sem chamado, ou com lixo, o piso", [null, undefined, {}, "x", { linha: 7 }].every((x) => esperaDoChamado(x) === O_CHAMADO.esperaSozinho));
  t("os números da tabela: 250 por palavra, piso 2600, teto 5000", O_CHAMADO.esperaPorPalavra === 250 && O_CHAMADO.esperaSozinho === 2600 && O_CHAMADO.esperaTeto === 5000);
  /* os verbos da peça */
  t("«Rolar já» e o recuo com maiúscula", O_CHAMADO.rolarJa === "Rolar já" && O_CHAMADO.recuo === "Mudar de ideia" && /^[A-ZÀ-Ý]/.test(O_CHAMADO.recuo));
}

console.log(`\no Mestre chama (MC2): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
