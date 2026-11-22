/* ============================================================
   A REGRA DO IMPROVISO (22/11/2026) — a resposta do Mestre a toda troca e
   todo uso que o ouvido reconheceu, e nunca o silêncio.

   Um mestre de mesa, diante de «empresto minha gazua a Rhogar», não fica
   calado porque o verbo é novo: ele diz sim, diz o preço, pede o dado,
   pergunta o que faltou, ou diz não com o porquê. São cinco respostas, e
   toda leitura de `trocar` e `usar` recebe uma:

     sim            — o herói só recebe ou recupera (pegar o que está solto
                      ou com um morto, emprestar, devolver, usar o que tem);
     sim_com_preco  — o herói perde algo e a troca é limpa (dar, pagar,
                      comprar, vender, escambo justo);
     dado           — há oposição (suborno, furto, cobrança, pedir de graça,
                      regatear, pegar o que é de alguém à vista);
     pergunta       — falta quem, falta o quê, ou dois respondem pelo nome:
                      vem o texto ao jogador e as opções fechadas (as
                      pessoas da cena, as coisas da ficha), saídos de tabela;
     nao            — ninguém aqui, ausente, morto, sem moeda, não tem, não
                      vende — com o motivo.

   A ordem das portas é a de uma mesa: primeiro QUEM (dois com o nome, o
   morto, o ausente, ninguém), depois O QUÊ (falta, não tem, não vende, não
   paga), por fim a natureza do gesto (o padrão do subtipo).
   O texto da pergunta é gameplay — o que o Mestre diria —, nunca o nome do
   mecanismo. Módulo puro. → aRespostaDoMestre(leitura, cena)
   ============================================================ */
import { oOuvido } from "./o-ouvido.js";

export const A_REGRA_DO_IMPROVISO = Object.freeze({
  vereditos: Object.freeze(["sim", "sim_com_preco", "dado", "pergunta", "nao"]),
  motivos: Object.freeze(["ausente", "morto", "sem_moeda", "nao_tem", "nao_vende", "falta_quem", "falta_o_que", "dois_com_o_nome", "ninguem_aqui"]),
  /* o padrão de cada subtipo, quando nenhuma porta fechou antes */
  padrao: Object.freeze({
    comprar: "sim_com_preco", vender: "sim_com_preco", pagar: "sim_com_preco", dar: "sim_com_preco", escambo: "sim_com_preco",
    emprestar: "sim", devolver: "sim", pegar: "sim",
    pedir: "dado", furtar: "dado", subornar: "dado", cobrar: "dado",
  }),
  /* quem precisa de alguém do outro lado (sem ninguém na cena: não) */
  precisaDeAlguem: Object.freeze(["comprar", "vender", "pagar", "pedir", "furtar", "emprestar", "devolver", "subornar", "escambo", "cobrar"]),
  /* quem entrega algo da ficha (o herói tem de ter) */
  entregaDaFicha: Object.freeze(["dar", "vender", "emprestar", "devolver", "escambo"]),
  /* quem tira algo de quem está à vista: o morto não se opõe */
  tiraDeAlguem: Object.freeze(["pegar", "furtar"]),
  /* as perguntas ao jogador — {Coisa} e {Nome} vêm da leitura */
  verbo: Object.freeze({
    comprar: "compra", vender: "vende", pagar: "paga", dar: "entrega", pedir: "pede", pegar: "pega", furtar: "tenta pegar",
    emprestar: "empresta", devolver: "devolve", subornar: "oferece", escambo: "troca", cobrar: "cobra",
  }),
  textos: Object.freeze({
    faltaQuemCom: "A quem você {verbo} {coisa}?",
    faltaQuem: "A quem?",
    faltaQuemDe: "De quem você {verbo} {coisa}?",
    faltaQuemDeSem: "De quem?",
    faltaOQue: "O que você {verbo}?",
    faltaOQueA: "O que você {verbo} a {Nome}?",
    faltaOQueDe: "O que você {verbo} de {Nome}?",
    dois: "Qual {primeiro}: {lista}?",
    usarOQue: "O que você usa?",
    oQueFaz: "O que você faz com {coisa}?",
  }),
  /* as ações oferecidas quando o verbo não se reconhece (as opções fechadas) */
  acoesDaCoisaMinha: Object.freeze(["dar", "emprestar", "vender"]),
  acoesDaCoisaDele: Object.freeze(["comprar", "pedir", "furtar"]),
  /* subtipos em que a coisa vem de outro (pergunta «de quem») */
  vemDeOutro: Object.freeze(["comprar", "pedir", "pegar", "furtar", "cobrar"]),
});

const str = (x) => (x == null ? "" : String(x));
const arr = (x) => (Array.isArray(x) ? x : []);
const sem = (s) => str(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const tpl = (t, o) => str(t).replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? "" : String(o[k])));
const ou = (l) => (l.length <= 1 ? l.join("") : l.slice(0, -1).join(", ") + " ou " + l[l.length - 1]);
const comArtigo = (coisa) => {
  const c = str(coisa).trim();
  if (!c) return "";
  if (c === "moeda") return "as moedas";
  const w = sem(c).split(" ")[0];
  const fem = /(a|ao|ade|agem)$/.test(w) && !/(ma|dia|mapa)$/.test(w) ? (/ao$/.test(w) ? !/(cao|sao|gao|rao)$/.test(w) ? false : true : true) : false;
  return (fem ? "a " : "o ") + c;
};

/* aRespostaDoMestre(leitura, cena) → { veredito, motivo, pergunta }
   `leitura` é a de oOuvido (ou uma frase, que se lê aqui).
   pergunta: null | { texto, opcoes: [texto] } */
export function aRespostaDoMestre(leitura, cena) {
  const nada = Object.freeze({ veredito: null, motivo: null, pergunta: null });
  try {
    const R = A_REGRA_DO_IMPROVISO;
    const l = typeof leitura === "string" ? oOuvido(leitura, cena) : (leitura && typeof leitura === "object" ? leitura : null);
    if (!l || !["trocar", "usar"].includes(l.familia)) return nada;
    const c = cena && typeof cena === "object" ? cena : {};
    const h = c.heroi && typeof c.heroi === "object" ? c.heroi : {};
    const pessoas = arr(c.pessoas).filter((p) => p && str(p.nome).trim());
    const carrega = arr(h.carrega).map(str);
    const moeda = Number(h.moeda) || 0;
    const companheiro = str(h.companheiro).trim();
    const presentes = [...pessoas.map((p) => p.nome), ...(companheiro ? [companheiro] : [])];
    const sai = (veredito, motivo = null, pergunta = null) => Object.freeze({ veredito, motivo, pergunta: pergunta ? Object.freeze({ texto: pergunta.texto, opcoes: Object.freeze([...pergunta.opcoes]) }) : null });
    const tem = (coisa) => { const s = sem(coisa); return carrega.some((x) => sem(x) === s || sem(x).split(" ")[0] === s || sem(x).replace(/s$/, "") === s.replace(/s$/, "")); };

    /* o uso: tem → sim; não tem → não; sem coisa → pergunta */
    if (l.familia === "usar") {
      if (!l.coisa) return sai("pergunta", "falta_o_que", { texto: R.textos.usarOQue, opcoes: carrega });
      if (l.coisaTipo === "moeda") return moeda > 0 ? sai("sim") : sai("nao", "sem_moeda");
      if (tem(l.coisa) || l.coisaTipo === "solta") return sai("sim");
      return sai("nao", "nao_tem");
    }

    const s = l.subtipo;
    const V = R.verbo[s] || "faz";
    const Coisa = l.coisa ? comArtigo(l.coisa) : "";
    /* o verbo que ninguém previu: a pergunta oferece as ações possíveis */
    if (!s) {
      const ops = l.coisaTipo === "dele" ? R.acoesDaCoisaDele : R.acoesDaCoisaMinha;
      return sai("pergunta", "falta_o_que", { texto: tpl(R.textos.oQueFaz, { coisa: Coisa || "isso" }), opcoes: ops });
    }

    /* 1. QUEM */
    if (l.quemEstado === "qual") {
      const ops = arr(l.opcoesDeQuem);
      const primeiro = str(ops[0]).split(" ")[0];
      return sai("pergunta", "dois_com_o_nome", { texto: tpl(R.textos.dois, { primeiro, lista: ou(ops) }), opcoes: ops });
    }
    if (l.quemEstado === "morto") {
      if (R.tiraDeAlguem.includes(s)) return sai("sim");
      return sai("nao", "morto");
    }
    if (l.quemEstado === "longe") return sai("nao", "ausente");
    /* o companheiro não é o outro lado de uma troca com o mundo: sem ninguém dito e sem gente na cena, não */
    if (!pessoas.length && !l.quem && !l.companheiro && R.precisaDeAlguem.includes(s)) return sai("nao", "ninguem_aqui");

    const pessoa = l.quem ? pessoas.find((p) => p.nome === l.quem) || null : null;
    const vendeQuem = (coisa) => pessoas.filter((p) => arr(p.vende).some((v) => sem(v.item) === sem(coisa) || sem(v.item).split(" ")[0] === sem(coisa).split(" ")[0]));
    const precoDe = (p, coisa) => { const it = arr(p && p.vende).find((v) => sem(v.item) === sem(coisa) || sem(v.item).split(" ")[0] === sem(coisa).split(" ")[0]); return it ? Number(it.preco) || 0 : null; };

    /* falta quem: o pronome sem dono, o «que devo» sem credor */
    if (l.quemPronomeSemDono && !l.quem) return sai("pergunta", "falta_quem", { texto: tpl(R.vemDeOutro.includes(s) ? (Coisa ? R.textos.faltaQuemDe : R.textos.faltaQuemDeSem) : (Coisa ? R.textos.faltaQuemCom : R.textos.faltaQuem), { verbo: V, coisa: Coisa }), opcoes: presentes });

    /* 2. O QUÊ, por subtipo */
    const qtd = Number(l.quantia) || 0;
    if (s === "comprar") {
      if (!l.coisa) {
        if (pessoa && arr(pessoa.vende).length > 1) return sai("pergunta", "falta_o_que", { texto: tpl(R.textos.faltaOQueDe, { verbo: V, Nome: pessoa.nome }), opcoes: pessoa.vende.map((v) => v.item) });
        if (pessoa && arr(pessoa.vende).length === 0) return sai("nao", "nao_vende");
        if (!pessoa) return sai("pergunta", "falta_o_que", { texto: tpl(R.textos.faltaOQue, { verbo: V }), opcoes: pessoas.flatMap((p) => arr(p.vende).map((v) => v.item)) });
      }
      const quem = pessoa ? [pessoa] : vendeQuem(l.coisa);
      if (pessoa && precoDe(pessoa, l.coisa) == null) return sai("nao", "nao_vende");
      if (!quem.length) return sai("nao", pessoas.length ? "nao_vende" : "ninguem_aqui");
      const preco = precoDe(quem[0], l.coisa) || 0;
      /* a quantia é de coisas («duas poções») ou de dinheiro posto na mesa («pago cinco pelo reparo») */
      const deCoisas = l.quantiaDe === "coisa";
      const vezes = deCoisas && qtd > 1 ? qtd : 1;
      const oferta = !deCoisas && qtd > 0 ? qtd : 0;
      /* com a oferta dita, é ela que sai da bolsa; oferecer menos que o preço é regatear */
      if (oferta > 0) {
        if (oferta > moeda) return sai("nao", "sem_moeda");
        if (oferta < preco || l.regateio) return sai("dado");
        return sai("sim_com_preco");
      }
      if (preco * vezes > moeda) return sai("nao", "sem_moeda");
      if (l.regateio) return sai("dado");
      return sai("sim_com_preco");
    }
    if (s === "vender") {
      if (!l.coisa) return sai("pergunta", "falta_o_que", { texto: tpl(R.textos.faltaOQue, { verbo: V }), opcoes: carrega });
      if (!tem(l.coisa)) return sai("nao", "nao_tem");
      if (!pessoa) {
        const merc = pessoas.filter((p) => arr(p.vende).length);
        if (merc.length !== 1 && pessoas.length !== 1) return sai("pergunta", "falta_quem", { texto: tpl(R.textos.faltaQuemCom, { verbo: V, coisa: Coisa }), opcoes: presentes });
      }
      if (qtd > 0 || l.regateio) return sai("dado");
      return sai("sim_com_preco");
    }
    if (s === "pagar") {
      if (moeda <= 0 || (qtd > 0 && qtd > moeda)) return sai("nao", "sem_moeda");
      if (!pessoa && !l.coisa && !/\b(conta)\b/.test(sem(l.marcada))) return sai("pergunta", "falta_quem", { texto: R.textos.faltaQuem, opcoes: presentes });
      if (l.coisa && l.coisaTipo === "dele") { const p = pessoa || vendeQuem(l.coisa)[0]; const preco = p ? precoDe(p, l.coisa) : null; if (preco != null && preco > moeda) return sai("nao", "sem_moeda"); }
      return sai("sim_com_preco");
    }
    if (s === "dar" || s === "emprestar" || s === "devolver") {
      const recebe = s === "emprestar" && l.direcao === "recebe";
      if (!l.coisa) return sai("pergunta", "falta_o_que", { texto: l.quem ? tpl(R.textos.faltaOQueA, { verbo: V, Nome: l.quem }) : tpl(R.textos.faltaOQue, { verbo: V }), opcoes: recebe && pessoa ? arr(pessoa.vende).map((v) => v.item) : carrega });
      if (recebe) return sai("dado");
      /* sem a quem: o gesto num lugar («no cofre», «no chafariz») segue; a quem, com gente em volta, pergunta-se */
      if (!l.quem && !l.companheiro && !/\b(no|na|em|nos|nas|dentro)\s+<COISA_SOLTA>/.test(str(l.marcada))) {
        if (!pessoas.length) return sai("nao", "ninguem_aqui");
        return sai("pergunta", "falta_quem", { texto: tpl(R.textos.faltaQuemCom, { verbo: V, coisa: Coisa }), opcoes: presentes });
      }
      if (l.coisaTipo === "moeda") {
        const q = qtd || 1;
        if (q > moeda) return sai("nao", "sem_moeda");
      } else if (!tem(l.coisa)) return sai("nao", "nao_tem");
      if (!l.quem && !l.companheiro && !pessoas.length && s !== "dar") return sai("nao", "ninguem_aqui");
      return sai(R.padrao[s]);
    }
    if (s === "subornar") {
      if (qtd > moeda || (l.coisaTipo === "moeda" && moeda <= 0)) return sai("nao", "sem_moeda");
      return sai("dado");
    }
    if (s === "escambo") {
      if (!l.coisa) return sai("pergunta", "falta_o_que", { texto: tpl(R.textos.faltaOQue, { verbo: V }), opcoes: carrega });
      if (!tem(l.coisa)) return sai("nao", "nao_tem");
      const alvo = l.propostaDeEmTroca;
      if (pessoa && arr(pessoa.vende).length === 0) return sai("nao", "nao_vende");
      if (pessoa && alvo) {
        if (arr(pessoa.vende).length === 0 || (alvo.tipo === "dele" && alvo.dono && alvo.dono !== pessoa.nome && precoDe(pessoa, alvo.nome) == null) || (alvo.tipo !== "dele" && precoDe(pessoa, alvo.nome) == null)) return sai("nao", "nao_vende");
        return sai("sim_com_preco");
      }
      if (!pessoa && alvo && alvo.tipo === "dele") return sai("dado");
      if (!pessoa && !alvo) return sai("pergunta", "falta_o_que", { texto: tpl(R.textos.faltaOQue, { verbo: V }), opcoes: pessoas.flatMap((p) => arr(p.vende).map((v) => v.item)) });
      return sai("dado");
    }
    if (s === "pegar") {
      if (pessoa) return sai("dado");
      return sai(pessoas.length ? "dado" : "sim");
    }
    if (s === "furtar" || s === "pedir" || s === "cobrar") {
      if (s === "pedir" && !pessoa && l.coisa) {
        const v = vendeQuem(l.coisa);
        if (!v.length && pessoas.length > 1) return sai("pergunta", "falta_quem", { texto: tpl(R.textos.faltaQuemDe, { verbo: V, coisa: Coisa }), opcoes: presentes });
      }
      if (s === "cobrar" && !pessoa && !l.quem) return sai("pergunta", "falta_quem", { texto: tpl(R.textos.faltaQuemDeSem, {}), opcoes: presentes });
      return sai("dado");
    }
    return sai(R.padrao[s] || "dado");
  } catch {
    return Object.freeze({ veredito: null, motivo: null, pergunta: null });
  }
}
