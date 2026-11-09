/* O ENCONTRO NA ESTRADA, EM TRÊS TEMPOS (CB2, 09/11/2026) — src/encontro-na-estrada.js

   «Apertei em viajar e instantaneamente abriu uma batalha contra um dragão
   ancião… não teve narração sobre o encontro, não teve nada.» O encontro
   passa a ter três tempos — o sinal de longe, a escolha com o preço à
   vista, a narração antes de a mesa abrir —, e esta suíte prova:

   §1 as tabelas: todo sinal, toda escolha, todo desfecho, e a abertura de
      cada luta é uma chave de ABERTURA_DA_LUTA;
   §2 o sinal: o Mestre pede uma frase do catálogo (Percepção), com a CD do
      sinal, no cartão de sempre; o «a evitar» vê-se sem dado;
   §3 o dragão nunca investe sem sinal: nenhuma luta abre sem um dado
      falhado ou uma escolha, e o lendário nem com o dado falhado;
   §4 a fuga aberta no lendário;
   §5 cada escolha e a sua abertura;
   §6 o veredito antes do clique: a chance dita é a chance rolada;
   §7 a pauta de cada tempo (o canal dinâmico, curta);
   §8 determinismo, imutabilidade, lixo, e o estado que cabe no save. */
import * as M from "../src/encontro-na-estrada.js";
import * as E from "../src/encontros.js";
import { ABERTURA_DA_LUTA } from "../src/grid.js";
import { O_MESTRE_PEDE, oCartaoDoPedido } from "../src/motor/o-mestre-pede.js";
import { lerAcao } from "../src/desafios.js";
import { criaturasDoGenero, ARQUETIPOS } from "../src/bestiario.js";
import { PERICIAS } from "../src/pericias.js";
import { CLIMAS } from "../src/encontros.js";
import { rng, hashSemente } from "../src/semente.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const G = "Fantasia medieval";
const semente = (s) => rng(hashSemente(s));
const solo = (nivel) => ({ nivel, atributos: {}, grupo: [] });
const comGrupo = (nivel, n) => ({ nivel, atributos: {}, grupo: Array.from({ length: n }, () => ({ vida: 20 })) });
const DRAGAO = { tipo: "perigo", criatura: "Dragão Ancião", ameaca: "lendario", quantos: 1, nivelRef: 16, perigo: "mortal", importante: true };
const LOBOS = { tipo: "perigo", criatura: "Lobo", ameaca: "fraco", quantos: 2, nivelRef: 1, perigo: "baixo" };
const BANDIDO = { tipo: "perigo", criatura: "Bandido", ameaca: "comum", quantos: 1, nivelRef: 2, perigo: "baixo" };
const D = M.DESFECHOS_DO_ENCONTRO.desfechos;
const X = M.ESCOLHAS_DO_ENCONTRO;
/* o encontro já na escolha, com quem viu primeiro à mão */
const naEscolha = (enc, pers, quemViu, extra = {}) => {
  const s = M.oEncontroNaEstrada(enc, { pers, dia: 1, trecho: "A>B", ...extra });
  return s.fase === "escolha" ? { ...s, quemViu } : M.avistar(s, { d20: quemViu === "heroi" ? 20 : 1, sorte: () => 0.99 });
};

sec("§1 as tabelas");
{
  const fantasia = criaturasDoGenero(G);
  t("toda criatura do bestiário de fantasia tem o seu sinal", fantasia.every((c) => M.SINAIS_DO_BESTIARIO[c.nome] || ARQUETIPOS.some((a) => a.nome === c.nome)), fantasia.filter((c) => !M.SINAIS_DO_BESTIARIO[c.nome]).map((c) => c.nome).join(", "));
  t("toda ameaça tem um sinal de reserva", ["fraco", "comum", "competente", "elite", "lendario"].every((a) => M.SINAL_POR_AMEACA[a]));
  const todos = [...Object.entries(M.SINAIS_DO_BESTIARIO), ...Object.entries(M.SINAL_POR_AMEACA)];
  t("todo sinal tem tipo, CD e frase", todos.every(([, s]) => ["rasto", "som", "cheiro", "vulto", "silencio", "sombra"].includes(s.tipo) && Number.isInteger(s.cd) && s.cd >= 5 && s.cd <= 20 && s.frase.length > 10));
  t("e a frase do sinal nunca diz o nome da criatura", Object.entries(M.SINAIS_DO_BESTIARIO).every(([nome, s]) => !s.frase.toLowerCase().includes(nome.toLowerCase().split(" ")[0])));
  t("o grande vê-se de mais longe que o pequeno (o Ancião, CD menor que o lobo)", M.SINAIS_DO_BESTIARIO["Dragão Ancião"].cd < M.SINAIS_DO_BESTIARIO["Lobo"].cd);
  t("o céu tira vista pelos ids da tabela de CLIMAS", Object.keys(M.PERCEPCAO_DO_SINAL.porClima).every((id) => CLIMAS.some((c) => c.id === id)) && M.PERCEPCAO_DO_SINAL.porClima.neblina > 0);
  const nomes = new Set([...fantasia, ...ARQUETIPOS].map((c) => c.nome));
  t("quem fala é gente do bestiário", M.QUEM_FALA.every((n) => nomes.has(n)), M.QUEM_FALA.filter((n) => !nomes.has(n)).join(", "));
  t("as seis escolhas, pela ordem: contornar, esconder, negociar, emboscar, voltar atrás, lutar", J(X.ordem) === J(["evitar", "esconder", "negociar", "emboscar", "fugir", "lutar"]) && X.ordem.every((id) => X.escolhas[id]));
  const pericias = new Set(PERICIAS.map((p) => p.id));
  t("toda perícia pedida existe na ficha", X.ordem.every((id) => X.escolhas[id].pericia === null || pericias.has(X.escolhas[id].pericia)));
  t("todo desfecho de escolha está na tabela dos desfechos", X.ordem.every((id) => D[X.escolhas[id].sucesso] && D[X.escolhas[id].falha]));
  const sit = Object.keys(ABERTURA_DA_LUTA.situacoes);
  t("toda luta abre numa situação de ABERTURA_DA_LUTA", Object.values(D).filter((d) => d.luta).every((d) => sit.includes(d.situacao)), sit.join(","));
  t("a surpresa é de um lado, do outro, ou de ninguém", Object.values(D).filter((d) => d.luta).every((d) => [null, "heroi", "inimigos"].includes(d.iniciativa)));
  t("a emboscada existe a favor e contra", D.emboscadaAFavor.situacao === "emboscada" && D.emboscadaAFavor.iniciativa === "heroi" && D.emboscadaContra.situacao === "emboscada" && D.emboscadaContra.iniciativa === "inimigos");
  t("o bónus de iniciativa é um número da tabela", Number.isInteger(M.DESFECHOS_DO_ENCONTRO.bonusDeIniciativa) && M.DESFECHOS_DO_ENCONTRO.bonusDeIniciativa > 0);
  t("o tributo e a percepção passiva crescem com a ameaça", ["fraco", "comum", "competente", "elite", "lendario"].every((a, i, l) => i === 0 || (M.TRIBUTO[a] > M.TRIBUTO[l[i - 1]] && M.PERCEPCAO_PASSIVA[a] > M.PERCEPCAO_PASSIVA[l[i - 1]])));
}

sec("§2 o sinal, pedido pelo Mestre");
{
  const s = M.oEncontroNaEstrada(LOBOS, { pers: solo(3), dia: 2, trecho: "Vau>Ponte" });
  t("o encontro começa no sinal, e ninguém viu ninguém", s.fase === "sinal" && s.quemViu === null && s.desfecho === null);
  const v = lerAcao(O_MESTRE_PEDE.sinal.frase(), { personagem: { nivel: 3, atributos: {}, pericias: {} }, semente: "x1", lugar: "estrada", emCombate: false, tentativas: {}, dia: 1, pessoaDe: () => null, fama: 0, ehPessoaConhecida: () => false, achadoDe: () => null });
  t("a frase pedida é um teste do catálogo, de Percepção (a lei de o-mestre-pede)", v && v.tipo === "teste" && v.pericia === "percepcao", J(v && { tipo: v.tipo, pericia: v.pericia }));
  t("o pedido leva a frase e o veredito com a CD do sinal", s.pedido.frase === O_MESTRE_PEDE.sinal.frase() && s.pedido.v.pericia === "percepcao" && s.pedido.v.dc === M.SINAIS_DO_BESTIARIO.Lobo.cd);
  const cartao = oCartaoDoPedido(s.pedido, s.pedido.v, { mod: 2, pericia: "Percepção" });
  t("e o cartão é o de sempre: o dado e o número antes do toque", cartao && cartao.pedido === true && cartao.preco === "d20 + 2" && cartao.linhas[0] === `Percepção · precisa de ${s.sinal.cd}`, J(cartao && cartao.linhas));
  t("a chave não deixa pedir duas vezes no mesmo trecho e dia", s.pedido.chave === M.oEncontroNaEstrada(LOBOS, { pers: solo(3), dia: 2, trecho: "vau>ponte" }).pedido.chave);
  const nev = M.oEncontroNaEstrada(LOBOS, { pers: solo(3), clima: "neblina", noite: true });
  t("a neblina e a noite tiram vista", nev.sinal.cd === M.SINAIS_DO_BESTIARIO.Lobo.cd + M.PERCEPCAO_DO_SINAL.porClima.neblina + M.PERCEPCAO_DO_SINAL.noite);
  const dr = M.oEncontroNaEstrada(DRAGAO, { pers: solo(14) });
  t("o «a evitar» vê-se sempre: sem dado, já na escolha, e visto primeiro", dr.aEvitar === true && dr.fase === "escolha" && dr.pedido === null && dr.quemViu === "heroi" && dr.percepcao.automatico === "sucesso");
  const facil = M.oEncontroNaEstrada(LOBOS, { pers: solo(3), bonus: { percepcao: 12 } });
  t("o que nem o pior dado falha não se rola (a regra da casa)", facil.fase === "escolha" && facil.pedido === null);
  const passou = M.avistar(s, { d20: 20, bonus: { percepcao: 0 } });
  t("passar é ver primeiro", passou.fase === "escolha" && passou.quemViu === "heroi" && passou.percepcao.d20 === 20 && passou.pedido === null);
  const falhou = M.avistar(s, { d20: 1, sorte: () => 0.99 });
  t("falhar é ser visto primeiro (sem investida, ainda se escolhe)", falhou.fase === "escolha" && falhou.quemViu === "eles");
  const investiu = M.avistar(s, { d20: 1, sorte: () => 0 });
  t("e a criatura comum pode investir: emboscada contra", investiu.fase === "resolvido" && investiu.investiu === true && investiu.desfecho.id === "emboscadaContra" && investiu.desfecho.situacao === "emboscada" && investiu.desfecho.iniciativa === "inimigos");
  t("a investida usa a tabela de sempre (INVESTIDA_DA_ESTRADA)", M.avistar(s, { d20: 1, sorte: () => E.INVESTIDA_DA_ESTRADA.base - 0.01 }).fase === "resolvido" && M.avistar(s, { d20: 1, sorte: () => E.INVESTIDA_DA_ESTRADA.base + 0.01 }).fase === "escolha");
}

sec("§3 o dragão nunca investe sem sinal");
{
  const sDr = M.oEncontroNaEstrada(DRAGAO, { pers: comGrupo(20, 3), dia: 1 });
  t("com um grupo que o aguenta, o Ancião deixa de ser «a evitar» e pede o dado", sDr.aEvitar === false && sDr.fase === "sinal");
  const falhou = M.avistar(sDr, { d20: 1, sorte: () => 0 });
  t("e mesmo com o dado falhado e a sorte toda contra, não investe", falhou.fase === "escolha" && falhou.quemViu === "eles" && !falhou.desfecho);
  /* a estrada inteira: 4000 trechos por nível, no topo e no meio */
  let lutas = 0, semPorque = 0, lendasInvestem = 0, primeiroTempoLuta = 0;
  for (const nivel of [5, 14, 20]) {
    const r = semente(`cb2|estrada|${nivel}`);
    for (let i = 0; i < 4000; i++) {
      const enc = E.rolarEncontro(G, nivel, null, r, { perigo: "mortal" });
      const s = M.oEncontroNaEstrada(enc, { pers: solo(nivel), clima: "neblina", bonus: { percepcao: 2 } });
      if (!s) continue;
      if (s.fase === "resolvido") primeiroTempoLuta++;
      const a = s.fase === "sinal" ? M.avistar(s, { sorte: r, bonus: { percepcao: 2 } }) : s;
      if (a.desfecho && a.desfecho.luta) {
        lutas++;
        if (!(a.percepcao && a.percepcao.passou === false)) semPorque++;
        if (s.lendario || s.importante || s.aEvitar) lendasInvestem++;
      }
    }
  }
  t("o encontro nunca começa resolvido: há sempre um sinal primeiro", primeiroTempoLuta === 0);
  t(`antes da escolha, só há luta com a Percepção falhada (${lutas} investidas, todas depois do dado)`, lutas > 0 && semPorque === 0);
  t("e nunca do lendário, do `importante` ou do «a evitar»", lendasInvestem === 0);
  t("fora da fase do sinal, o dado não muda nada", M.avistar(falhou, { d20: 20 }) === falhou);
}

sec("§4 a fuga aberta no lendário");
{
  for (const [nome, quemViu] of [["visto primeiro por mim", "heroi"], ["visto primeiro por ele", "eles"]]) {
    const s = naEscolha(DRAGAO, comGrupo(20, 3), quemViu);
    const f = M.escolhasDoEncontro(s, {}).find((x) => x.id === "fugir");
    t(`${nome}: voltar atrás está aberto, sem dado, a 100%`, s.fugaAberta === true && f.disponivel && f.pericia === null && f.chance === 100 && f.seFalhar === null && f.seConseguir.id === "fugiu" && f.seConseguir.recuo === true);
    const r = M.resolverEscolha(s, "fugir", { d20: 1 });
    t(`${nome}: e voltar atrás nunca acaba em luta`, r.desfecho.luta === false && r.teste === null);
  }
  const s = naEscolha(DRAGAO, comGrupo(20, 3), "eles");
  const r = M.resolverEscolha(s, "evitar", { d20: 1, bonus: { sobrevivencia: 0 } });
  t("a luta com um lendário (um contorno falhado) leva a fuga aberta para a mesa", r.desfecho.luta === true && r.desfecho.fugaAberta === true);
  const lobos = naEscolha(LOBOS, solo(3), "eles");
  const fl = M.escolhasDoEncontro(lobos, { bonus: { atletismo: 1 } }).find((x) => x.id === "fugir");
  t("perante lobos que já me viram, fugir pede Atletismo, e falhar é ser alcançado", fl.pericia === "atletismo" && fl.cd === X.escolhas.fugir.cd.fraco && fl.seFalhar.id === "alcancado" && fl.seFalhar.situacao === "emboscada");
  t("perante lobos que ainda não me viram, voltar atrás é sem dado", M.escolhasDoEncontro(naEscolha(LOBOS, solo(3), "heroi"), {}).find((x) => x.id === "fugir").pericia === null);
  t("lutar contra o «a evitar» leva o aviso", M.escolhasDoEncontro(M.oEncontroNaEstrada(DRAGAO, { pers: solo(14) }), {}).find((x) => x.id === "lutar").aviso === "aEvitar");
}

sec("§5 cada escolha e a sua abertura");
{
  const visto = (enc, pers) => naEscolha(enc, pers, "heroi");
  const casos = [
    ["evitar", BANDIDO, "contornou", "descoberto"],
    ["esconder", BANDIDO, "passou", "descoberto"],
    ["negociar", BANDIDO, "pagou", "palavraQuebrada"],
    ["emboscar", BANDIDO, "emboscadaAFavor", "descoberto"],
  ];
  for (const [id, enc, ok, nao] of casos) {
    const s = visto(enc, solo(3));
    const bem = M.resolverEscolha(s, id, { d20: 20, moedas: 999 });
    const mal = M.resolverEscolha(s, id, { d20: 1, moedas: 999 });
    const dOk = D[ok], dNao = D[nao];
    t(`${id}: conseguir → ${ok}${dOk.luta ? ` (luta: ${dOk.situacao}, surpresa ${dOk.iniciativa})` : " (sem luta)"}`, bem.fase === "resolvido" && bem.escolha === id && bem.desfecho.id === ok && bem.desfecho.luta === !!dOk.luta && bem.desfecho.situacao === (dOk.luta ? dOk.situacao : null) && bem.teste.passou === true);
    t(`${id}: falhar → ${nao} (luta: ${dNao.situacao}, surpresa ${dNao.iniciativa})`, mal.desfecho.id === nao && mal.desfecho.luta === true && mal.desfecho.situacao === dNao.situacao && mal.desfecho.iniciativa === dNao.iniciativa && mal.teste.passou === false);
  }
  const lutar = M.resolverEscolha(visto(BANDIDO, solo(3)), "lutar", {});
  t("lutar → frente a frente (encontro, sem surpresa), sem dado", lutar.desfecho.id === "frenteAFrente" && lutar.desfecho.situacao === "encontro" && lutar.desfecho.iniciativa === null && lutar.teste === null);
  const viram = naEscolha(BANDIDO, solo(3), "eles");
  const lv = M.escolhasDoEncontro(viram, { moedas: 999 });
  t("se ele já me viu, esconder e emboscar fecham, com o porquê", ["esconder", "emboscar"].every((id) => { const x = lv.find((y) => y.id === id); return x.disponivel === false && x.porqueNao === "já te viu"; }));
  t("e quem fecha não se resolve (null, o estado fica)", M.resolverEscolha(viram, "emboscar", { d20: 20 }) === null);
  t("e contornar fica mais difícil", lv.find((x) => x.id === "evitar").cd === X.escolhas.evitar.cd.comum + X.escolhas.evitar.seViram);
  const lobos = M.escolhasDoEncontro(visto(LOBOS, solo(3)), {});
  t("a fera não ouve propostas (o lobo não está em QUEM_FALA)", lobos.find((x) => x.id === "negociar").disponivel === false && lobos.find((x) => x.id === "negociar").porqueNao === "não ouve propostas");
  const bandos = { ...BANDIDO, quantos: 2 };
  const neg = M.escolhasDoEncontro(visto(bandos, solo(5)), { moedas: 3 }).find((x) => x.id === "negociar");
  t("o tributo é por cabeça, e sem as moedas a negociação fecha", neg.custo.moedas === M.TRIBUTO.comum * 2 && neg.disponivel === false && neg.porqueNao === "faltam moedas");
  t("com as moedas, abre", M.escolhasDoEncontro(visto(bandos, solo(5)), { moedas: 100 }).find((x) => x.id === "negociar").disponivel === true);
  const esc = M.escolhasDoEncontro(visto(BANDIDO, solo(3)), {}).find((x) => x.id === "esconder");
  t("esconder-se é contra a percepção passiva dela, e custa uma hora", esc.cd === M.PERCEPCAO_PASSIVA.comum && esc.custo.horas === 1);
  t("emboscar é mais difícil que esconder-se", M.escolhasDoEncontro(visto(BANDIDO, solo(3)), {}).find((x) => x.id === "emboscar").cd > esc.cd);
  t("contornar custa horas, e o desfecho leva o custo", (() => { const r = M.resolverEscolha(visto(BANDIDO, solo(3)), "evitar", { d20: 20 }); return r.desfecho.custo.horas === X.escolhas.evitar.custo.horas && r.desfecho.luta === false; })());
}

sec("§6 o veredito antes do clique");
{
  const s = naEscolha(BANDIDO, solo(3), "heroi");
  const bonus = { sobrevivencia: 1, furtividade: 3, persuasao: 0, atletismo: 2 };
  const lista = M.escolhasDoEncontro(s, { bonus, moedas: 100 });
  t("toda escolha diz a chance, o custo e o que acontece ao conseguir", lista.length === 6 && lista.every((x) => Number.isInteger(x.chance) && x.chance >= 0 && x.chance <= 100 && x.custo && x.seConseguir));
  t("e toda escolha com dado diz o que acontece ao falhar", lista.filter((x) => x.pericia).every((x) => x.seFalhar && typeof x.seFalhar.luta === "boolean"));
  for (const x of lista.filter((y) => y.pericia && y.disponivel)) {
    const r = semente(`cb2|chance|${x.id}`);
    let ok = 0;
    for (let i = 0; i < 4000; i++) if (M.resolverEscolha(s, x.id, { sorte: r, bonus, moedas: 100 }).teste.passou) ok++;
    const medida = Math.round((ok / 4000) * 100);
    t(`${x.id}: a chance dita (${x.chance}%) é a rolada (${medida}%)`, Math.abs(medida - x.chance) <= 3);
  }
  t("fora da fase da escolha, nenhuma escolha", M.escolhasDoEncontro(M.oEncontroNaEstrada(LOBOS, { pers: solo(3) }), {}).length === 0);
}

sec("§7 a pauta de cada tempo");
{
  const s = M.oEncontroNaEstrada(LOBOS, { pers: solo(3), dia: 1 });
  const p1 = M.pautaDoEncontro(s);
  t("no sinal: o facto, sem o nome da criatura, e o veto de revelar ou atacar", p1.acabou[0].includes(M.SINAIS_DO_BESTIARIO.Lobo.frase) && !/Lobo/.test(p1.acabou[0]) && /abrir luta/.test(p1.naoPode[0]));
  const e = M.avistar(s, { d20: 20 });
  const p2 = M.pautaDoEncontro(e);
  t("na escolha: quem é, se já me viu, e o veto de escolher por mim", /2× Lobo/.test(p2.acabou[0]) && /ainda não me viu/.test(p2.acabou[0]) && /escolher por mim/.test(p2.naoPode[0]));
  const l = M.resolverEscolha(e, "emboscar", { d20: 20 });
  const p3 = M.pautaDoEncontro(l);
  t("na luta: o instante em uma ou duas frases, antes de a mesa abrir; o dado decide os golpes", /uma ou duas frases/.test(p3.acabou[0]) && /a luta abre depois/.test(p3.acabou[0]) && /o dado decide/.test(p3.naoPode[0]));
  const sl = M.resolverEscolha(e, "evitar", { d20: 20 });
  t("sem luta: o que se fez, e o veto de a fazer voltar", /contornei/.test(M.pautaDoEncontro(sl).acabou[0]) && /voltar a aparecer/.test(M.pautaDoEncontro(sl).naoPode[0]));
  const dr = M.pautaDoEncontro(M.oEncontroNaEstrada(DRAGAO, { pers: solo(14) }));
  t("o «a evitar» chega ao Narrador como tal", /a evitar/.test(dr.acabou[0]));
  const todas = [p1, p2, p3, dr].flatMap((p) => [...p.acabou, ...p.naoPode]);
  t("toda linha é curta (≤ 200 caracteres): a pauta tem teto", todas.every((x) => x.length <= 200), String(Math.max(...todas.map((x) => x.length))));
  t("lixo dá pauta vazia", J(M.pautaDoEncontro(null)) === J({ acabou: [], naoPode: [] }) && J(M.pautaDoEncontro({})) === J({ acabou: [], naoPode: [] }));
}

sec("§8 determinismo, imutabilidade, lixo e o save");
{
  const corre = () => {
    const r = semente("cb2|det");
    const out = [];
    for (let i = 0; i < 300; i++) {
      const enc = E.rolarEncontro(G, 8, null, r, { perigo: "alto" });
      const s = M.oEncontroNaEstrada(enc, { pers: solo(8), dia: 3, trecho: "x>y" });
      if (!s) continue;
      const a = s.fase === "sinal" ? M.avistar(s, { sorte: r }) : s;
      out.push(a.fase === "escolha" ? M.resolverEscolha(a, "evitar", { sorte: r }) : a);
    }
    return J(out);
  };
  t("a mesma semente, os mesmos encontros e os mesmos desfechos", corre() === corre());
  const s = M.oEncontroNaEstrada(LOBOS, { pers: solo(3) });
  const antes = J(s);
  const a = M.avistar(s, { d20: 20 });
  M.resolverEscolha(a, "lutar", {});
  M.escolhasDoEncontro(a, {});
  t("imutável: o estado recebido fica como veio", J(s) === antes && a !== s);
  t("o estado cabe no save: é dado, e volta igual do JSON", J(JSON.parse(J(a))) === J(a) && !J(a).includes("function"));
  t("o encontro guarda o campo de versão (campo novo e aditivo)", s.versao === 1);
  t("o lote do inimigo é o aparado pela régua (a mesma da investida)", s.inimigos.length === s.quantos && s.inimigos.every((x) => x.nome.startsWith("Lobo")));
  let estourou = false;
  try {
    M.oEncontroNaEstrada(null); M.oEncontroNaEstrada({}); M.oEncontroNaEstrada({ tipo: "achado" }); M.oEncontroNaEstrada({ tipo: "perigo" }, null);
    M.oEncontroNaEstrada({ tipo: "perigo", criatura: "Coisa Inventada", ameaca: "lixo", quantos: "muitos" }, { pers: "lixo", bonus: "x", clima: 3 });
    M.avistar(null); M.avistar({}, null); M.avistar(s, { d20: "x", bonus: null });
    M.escolhasDoEncontro(null); M.escolhasDoEncontro({ fase: "escolha" }, null);
    M.resolverEscolha(null, "lutar"); M.resolverEscolha(a, "voar"); M.resolverEscolha(a, "lutar", null);
  } catch (e) { estourou = e; }
  t("lixo não estoura", !estourou, String(estourou && estourou.stack));
  t("fora do perigo, nada", M.oEncontroNaEstrada(null) === null && M.oEncontroNaEstrada({ tipo: "achado" }) === null && M.oEncontroNaEstrada({ tipo: "perigo" }) === null);
  t("a criatura inventada cai no sinal da ameaça", M.oEncontroNaEstrada({ tipo: "perigo", criatura: "Coisa Inventada", ameaca: "elite", quantos: 1 }, {}).sinal.frase === M.SINAL_POR_AMEACA.elite.frase);
  t("a escolha que não existe dá null", M.resolverEscolha(a, "voar") === null && M.resolverEscolha(null, "lutar") === null);
  t("o dado fora de 1..20 rola pela sorte (e não estoura)", (() => { const x = M.avistar(s, { d20: 99, sorte: () => 0.5 }); return x.percepcao.d20 === 11; })());
}

console.log(`\no encontro na estrada: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
