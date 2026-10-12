/* ============================================================
   EM CENA (Fase F2 · F2a, 12/10) — a ficha de tudo

   "Hoje o mestre diz uma coisa que está em cena e o sistema tenta
   adivinhar, não deveria ser o contrário? O sistema entrega ao mestre e
   ele usa?" — a pessoa, depois da 9.ª sessão de prova. E à proposta:
   "Perfeito, ótima sugestão, pode fazer."

   A 8.ª e a 9.ª sessões provaram a mesma classe de erro em ruas
   diferentes: o rato que o Mestre pintou e a frase não achava ("ataco o
   rato gigante da frente", M33), as ataduras cobradas pelo que a frase
   disse e não pelo estoque (M44), o elo procurado pelo ofício que não
   chegava a ele ("procuro meu antigo mestre de recados", M47), e a
   companheira de viagem atacada no lugar de quem levava a corrente (8.ª,
   M39). Em todas, o jogador DISSE a coisa e o sistema não a OUVIU — porque
   cada leitor relia a prosa à procura dela, e cada um à sua maneira.

   A regra é a da espinha estendida à cena inteira: ANTES de cada resposta
   o sistema monta a lista do que existe à volta do herói, cada coisa com
   um id estável e os campos que a fazem ser ela — e o que o herói SABE
   dela, nunca o segredo. Daqui saem três coisas:

     · `montarEmCena(ctx)` — a lista, do que já existia espalhado: o
       registo e o grupo, o núcleo, a criatura da estrada, a sala e a luta,
       a banca à vista, o lugar e as saídas; e o que o Mestre mostrou sem
       ninguém registar (agressao.js#vistosNaProsa), uma vez, com nome;
     · `pautaComEmCena(pauta, lista)` — a linha EM CENA da pauta, curta,
       que engole os NOMES À MÃO e não repete o que outra secção já diz.
       Nunca tira veto, desfecho, resposta, batida nem lugar que chegava:
       encolhe-se até caber, ou não entra;
     · `quemNaFrase(frase, lista)` — a frase do jogador continua livre, e
       lê-se contra a lista: pelo nome, pelo ofício, pela arma que alguém
       leva, pela raiz do bicho no singular ou no plural, pelo nome da
       coisa à venda, e pelo pronome só quando há um candidato só.

   O sistema não fala de si: a linha nunca diz "ficha" nem mostra id. O id
   é para a mão (o toque da F2b, o reconhecimento), nunca para a tela.
   ============================================================ */

import { vistosNaProsa, CRIATURA_NA_PROSA, NUMERO_DO_BICHO, PRONOME_DO_ALVO, ehDeclaracaoDeAtaque, RX_AGRESSAO } from "./agressao.js";
import { nomeiaACoisa, cabecaDaCoisa, NOME_DA_COISA } from "./economia.js";
import { papelProcurado } from "./procura.js";
import { PERGUNTA_DE_PRECO, APONTA_OU_COMPRA } from "./mercado.js";
import { garantirPauta, textoDaPauta } from "./pauta.js";

const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const palavras = (s) => norm(s).split(/[^a-z0-9]+/).filter(Boolean);
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const arr = (x) => (Array.isArray(x) ? x : []);
const nomeDe = (x) => String((x && typeof x === "object" ? x.nome : x) || "").trim();
const textos = (x) => (Array.isArray(x) ? x : [x]).filter((s) => typeof s === "string" && s.trim());
/* o plural cai: "ratos" e "rato", "ataduras" e "atadura" */
const semS = (w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w);

/* ---------------- OS TETOS ----------------
   `EM_CENA_MAX`: quantas coisas de cada tipo a LISTA guarda — a lista é
   para ler a frase contra ela, e a banca de uma capital tem dezenas de
   coisas; as que estão à vista vêm primeiro. `EM_CENA_NA_PAUTA`: quantas
   cabem na LINHA da pauta, que está perto do teto (a 6.ª a 9.ª sessões
   enviaram pautas de 1311 a 1362 de 1400) — a linha é a lista do que está
   à vista agora, não o registo da cidade (esse vai no estado, PRESENTES). */
export const EM_CENA_MAX = { pessoa: 12, criatura: 4, coisa: 40, lugar: 8 };
export const EM_CENA_NA_PAUTA = { pessoa: 3, criatura: 2, coisa: 3, papel: 3 };

/* ---------------- A MEMÓRIA DO QUE A PROSA MOSTROU ----------------
   O que o Mestre mostrou e ninguém registou só está nas últimas falas
   dele — e a cena anda. Na 8.ª, a que levava a corrente apareceu no M37, o
   golpe falhado foi no M39, a fuga no M40, e no M41 o jogador escreveu
   "eu queria atacar a encapuzada da corrente": duas falas depois, ela já
   não estava em nenhuma. A lista de antes (`ctx.antes`, que o App guarda
   de um turno para o outro — não vai ao save) traz o que a prosa mostrou
   durante `turnos`; passado `aVista` turnos sem voltar à prosa, deixa de
   estar à vista (sai da linha da pauta e do pronome) e continua a poder
   ser apontado pelo nome, pela arma, pela raiz. */
export const EM_CENA_MEMORIA = { turnos: 6, aVista: 1 };

/* O TRATO. O jogo trata o jogador por "você" (a tela e o Narrador desde a
   v9.346; catraca em teste-subtramas §7b). A F2a nasceu a dizer "Sari
   (contigo)" e "do teu passado" — e a linha EM CENA vai ao Narrador, que
   copia o registo que lê. As palavras que falam do herói saem daqui. */
export const EM_CENA_TRATO = {
  comigo: "com você",
  andaComigo: "anda com você",
  doPassado: "do seu passado",
};

/* ---------------- O ID ----------------
   Estável pela semente e pela chave de cada coisa (o nome da pessoa, a
   banca e o nome da coisa, a origem e a raiz do bicho): o mesmo rato é o
   mesmo id de um turno ao outro, e duas campanhas não partilham ids. */
function idDe(semente, tipo, chave) {
  let h = 0x811c9dc5;
  const s = `${semente}|${tipo}|${chave}`;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return `${tipo[0]}${h.toString(36)}`;
}

const CABECAS = new Set(CRIATURA_NA_PROSA.cabecas);
/* a raiz de um bicho (a mesma régua de agressao.js: sem número nem género) */
function raizDoBicho(w) {
  const s = norm(NUMERO_DO_BICHO.singular[w] || w);
  return NUMERO_DO_BICHO.macho[s] || s;
}
function raizDoNome(nome) {
  const ps = palavras(nome);
  const c = ps.find((p) => CABECAS.has(p));
  return c ? raizDoBicho(c) : semS(ps[0] || "");
}

const generoCurto = (g) => { const n = norm(g); return /^(mulher|ela|fem|f)$/.test(n) ? "ela" : /^(homem|ele|masc|m)$/.test(n) ? "ele" : ""; };
const semArtigo = (s) => String(s || "").replace(/^(o|a|os|as|um|uma)\s+/i, "").trim();

/* ============================================================
   A LISTA
   `ctx` (tudo opcional; lixo e null não estouram):
     semente, cidade        — a campanha e onde o herói está
     presentes              — o registo de quem vive aqui ([{ nome, papel, genero, relacao, laco }])
     grupo, comigo          — quem anda com o herói (nomes ou { nome, conceito })
     emCena                 — os nomes que a cena põe aqui (o núcleo em cena, o elenco)
     nucleo                 — { pessoas, antecedente } (nucleo.js)
     revelados              — os nomes cujo segredo o herói já viu cair
     sabe                   — { [nome]: ["o que a Intuição, o teste ou a conversa lhe deram"] }
     mostrado               — as últimas falas do Mestre (o que ele mostrou)
     encontro               — a criatura da estrada à vista ({ criatura|nome, ameaca, quantos })
     combate                — { inimigos: [{ nome }] }
     sala                   — a sala da masmorra ({ inimigos, resolvida, itens })
     bancas, moeda          — as bancas da cena (o ambulante à vista), e a palavra da moeda
     frase                  — a frase do jogador (a coisa que ele nomeia fica à vista)
     lugar, saidas, perto   — o sítio, as saídas, o que fica perto ({ nome, distancia, rumo })
   Cada coisa: { id, tipo, nome, aqui, deOnde, sabe, … } — `aqui` é o que
   está à vista agora; o resto da lista é quem a frase pode procurar.
   ============================================================ */
export function montarEmCena(ctx) {
  const c = obj(ctx);
  const semente = String(c.semente || "");
  const cidade = norm(c.cidade);
  const mostrado = textos(c.mostrado);
  const naProsa = ` ${palavras(mostrado.join(" ")).join(" ")} `;
  const citado = (nome) => {
    const ps = palavras(nome);
    if (!ps.length) return false;
    if (naProsa.includes(` ${ps.join(" ")} `)) return true;
    return ps[0].length >= 3 && naProsa.includes(` ${ps[0]} `);
  };
  const grupo = arr(c.grupo).map(nomeDe).filter(Boolean);
  const comigo = arr(c.comigo).map(nomeDe).filter(Boolean);
  const comigoN = new Set([...grupo, ...comigo].map(norm));
  const emCenaN = new Set(arr(c.emCena).map((x) => norm(nomeDe(x))).filter(Boolean));
  const revelados = new Set(arr(c.revelados).map((x) => norm(nomeDe(x))));
  const extra = obj(c.sabe);
  const sabeExtra = (nome) => arr(extra[nome]).map((x) => String(x || "").trim()).filter(Boolean);

  const pessoas = new Map();
  const porPessoa = (nome, f) => {
    const k = norm(nome);
    if (!k) return;
    const ja = pessoas.get(k) || { tipo: "pessoa", nome, papel: "", genero: "", quantos: 1, sabe: [] };
    pessoas.set(k, f(ja));
  };
  /* 1. quem anda comigo */
  for (const g of arr(c.grupo)) {
    const nome = nomeDe(g);
    if (!nome) continue;
    porPessoa(nome, (p) => ({ ...p, comigo: true, aqui: true, deOnde: p.deOnde || "grupo", papel: p.papel || String(obj(g).conceito || ""), sabe: [...p.sabe, EM_CENA_TRATO.andaComigo] }));
  }
  for (const nome of comigo) porPessoa(nome, (p) => ({ ...p, comigo: true, aqui: true, deOnde: p.deOnde || "grupo", sabe: p.sabe.includes(EM_CENA_TRATO.andaComigo) ? p.sabe : [...p.sabe, EM_CENA_TRATO.andaComigo] }));
  /* 2. o registo: à vista se a cena a põe aqui ou o Mestre a citou */
  for (const r of arr(c.presentes)) {
    const n = obj(r);
    const nome = nomeDe(n);
    if (!nome || /morto/i.test(String(n.status || ""))) continue;
    const laco = typeof n.laco === "string" ? n.laco : String(obj(n.laco).tipo || "");
    const relacao = norm(n.relacao);
    porPessoa(nome, (p) => ({
      ...p,
      papel: p.papel || String(n.papel || ""),
      genero: p.genero || generoCurto(n.genero),
      hostil: /^(inimig|hostil)/.test(relacao),
      aqui: !!(p.aqui || emCenaN.has(norm(nome)) || citado(nome)),
      deOnde: p.deOnde || "registo",
      /* o que o herói sabe: o papel, a relação, o laço — nunca o segredo */
      sabe: [...p.sabe, ...[n.papel, relacao && relacao !== "desconhecido" ? relacao : "", laco ? `laço: ${laco}` : ""].map((x) => String(x || "").trim()).filter(Boolean)],
    }));
  }
  /* 3. o núcleo: quem a cena traz, e quem vive aqui (a frase pode procurá-lo) */
  const nu = obj(c.nucleo);
  for (const q of arr(nu.pessoas)) {
    const n = obj(q);
    const nome = nomeDe(n);
    if (!nome || n.morto) continue;
    const emCena = emCenaN.has(norm(nome)) || comigoN.has(norm(nome));
    const daqui = !!cidade && norm(n.cidade) === cidade;
    /* o vilão só entra com o rosto conhecido (o nome só depois do rosto) */
    if (n.papel === "vilao" && !c.vilaoConhecido) continue;
    if (!emCena && !daqui) continue;
    const era = semArtigo(n.eraDoHeroi);
    const esc = String(obj(obj(n.ficha).esconde).o || "");
    porPessoa(nome, (p) => ({
      ...p,
      papel: era || p.papel,
      genero: p.genero || generoCurto(n.genero),
      aqui: !!(p.aqui || emCena || citado(nome)),
      deOnde: p.deOnde || "nucleo",
      ...(n.papel === "elo" && era ? { antecedente: String(nu.antecedente || "") } : {}),
      sabe: [...p.sabe, ...(era ? [`${era}, ${EM_CENA_TRATO.doPassado}`] : []), ...(revelados.has(norm(nome)) && esc && !esc.includes("{") ? [esc] : [])],
    }));
  }
  /* 4. o que o Mestre mostrou e ninguém registou: a gente armada */
  const conhecidos = [...pessoas.values()].map((p) => p.nome);
  const vistos = vistosNaProsa(mostrado, conhecidos);
  for (const v of vistos.filter((x) => x.tipo === "pessoa")) {
    if (pessoas.has(norm(v.nome))) continue;
    pessoas.set(norm(v.nome), { tipo: "pessoa", nome: v.nome, papel: "", genero: "", quantos: 1, aqui: true, deOnde: "prosa", armado: true, arma: v.arma, cabeca: v.cabeca, palavras: v.palavras, sabe: [`leva ${v.arma}`] });
  }

  /* 5. as criaturas: a luta, a sala, a estrada — e o bicho que a prosa mostrou */
  const bichos = new Map();
  const bicho = (nome, quantos, deOnde, ameaca, hostil) => {
    const raiz = raizDoNome(nome);
    if (!raiz) return;
    const ja = bichos.get(raiz);
    if (ja) { if (ja.deOnde === "prosa" && deOnde !== "prosa") bichos.set(raiz, { ...ja, nome, deOnde, ameaca, hostil, quantos }); return; }
    bichos.set(raiz, { tipo: "criatura", nome, raiz, quantos, deOnde, ameaca: ameaca || "", hostil, aqui: true });
  };
  const contar = (lista, deOnde) => {
    const conta = new Map();
    /* a investida numera os iguais ("Rato Gigante 1", "Rato Gigante 2"): é um bicho, dois */
    for (const i of arr(lista)) { const n = nomeDe(i).replace(/\s+\d+$/, ""); if (n && !(obj(i).vida <= 0) && !obj(i).caido) conta.set(n, { q: ((conta.get(n) || {}).q || 0) + 1, a: obj(i).ameaca }); }
    for (const [n, x] of conta) bicho(n, x.q, deOnde, x.a, true);
  };
  contar(obj(c.combate).inimigos, "luta");
  if (c.sala && !obj(c.sala).resolvida) contar(obj(c.sala).inimigos, "sala");
  const enc = obj(c.encontro);
  const nomeEnc = String(enc.criatura || enc.nome || "").trim();
  if (nomeEnc) bicho(nomeEnc, Math.max(1, Number(enc.quantos) || 1), "estrada", enc.ameaca, true);
  for (const v of vistos.filter((x) => x.tipo === "criatura")) {
    const ja = bichos.get(v.raiz);
    if (ja) continue;
    bichos.set(v.raiz, { tipo: "criatura", nome: v.nome, raiz: v.raiz, quantos: v.quantos, deOnde: "prosa", ameaca: "", hostil: null, aqui: true });
  }
  /* a memória: o que a prosa mostrou há pouco e já não mostra */
  const turno = Number.isFinite(Number(c.turno)) ? Number(c.turno) : 0;
  for (const a0 of arr(c.antes)) {
    const a = obj(a0);
    if (a.deOnde !== "prosa" || !a.nome) continue;
    const idade = turno - (Number(a.vistoEm) || 0);
    if (idade < 0 || idade > EM_CENA_MEMORIA.turnos) continue;
    const aqui = idade <= EM_CENA_MEMORIA.aVista;
    if (a.tipo === "pessoa" && !pessoas.has(norm(a.nome))) pessoas.set(norm(a.nome), { ...a, aqui, sabe: arr(a.sabe) });
    if (a.tipo === "criatura" && a.raiz && !bichos.has(a.raiz)) bichos.set(a.raiz, { ...a, aqui });
  }

  /* 6. as coisas: a banca à vista (o ambulante), a que a frase nomeia, o chão */
  const frase = String(c.frase || "");
  const moeda = String(c.moeda || "");
  const coisas = [];
  for (const b0 of arr(c.bancas)) {
    const b = obj(b0);
    for (const it0 of arr(b.estoque)) {
      const it = obj(it0);
      const nome = nomeDe(it);
      if (!nome) continue;
      const nomeada = !!frase && nomeiaACoisa(frase, nome) && !contradiz(frase, nome);
      coisas.push({ tipo: "coisa", nome, preco: Number.isFinite(Number(it.preco)) ? Number(it.preco) : null, moeda, banca: String(b.nome || b.rotulo || ""),
        chave: `${b.id || b.nome || ""}|${nome}`, aqui: b.tipo === "ambulante" || !!b.aVista || nomeada, nomeada, deOnde: "banca",
        sabe: Number.isFinite(Number(it.preco)) ? [`◉ ${Number(it.preco)}${moeda ? ` ${moeda}` : ""}`] : [] });
    }
  }
  for (const it of arr(obj(c.sala).itens).concat(arr(c.noChao))) {
    const nome = nomeDe(it);
    if (nome) coisas.push({ tipo: "coisa", nome, preco: null, moeda: "", banca: "", chave: `chao|${nome}`, aqui: true, deOnde: "chao", sabe: ["no chão"] });
  }

  /* 7. os lugares: o sítio, as saídas, o que fica perto */
  const lugares = [];
  const lg = nomeDe(c.lugar);
  if (lg) lugares.push({ tipo: "lugar", nome: lg, aqui: true, deOnde: "lugar", sabe: ["onde estás"] });
  for (const s of arr(c.saidas)) {
    const nome = String((s && typeof s === "object" ? s.nome || s.pista : s) || "").trim();
    if (nome) lugares.push({ tipo: "lugar", nome, aqui: true, deOnde: "saida", saida: true, sabe: ["uma saída daqui"] });
  }
  for (const s of arr(c.perto)) {
    const x = obj(s);
    const nome = nomeDe(x);
    if (!nome) continue;
    const dist = String(x.distancia || x.dist || "").trim();
    lugares.push({ tipo: "lugar", nome, aqui: false, deOnde: "perto", distancia: dist, rumo: String(x.rumo || ""), sabe: [dist ? `a ${dist}${x.rumo ? `, ${x.rumo}` : ""}` : "perto daqui"] });
  }

  /* os ids, o que o herói sabe a mais, e o teto por tipo (à vista primeiro) */
  const comId = (x, chave) => ({ ...x, id: idDe(semente, x.tipo, chave), sabe: [...new Set([...(x.sabe || []), ...sabeExtra(x.nome)])],
    ...(x.deOnde === "prosa" ? { vistoEm: x.vistoEm != null && Number.isFinite(Number(x.vistoEm)) ? Number(x.vistoEm) : turno } : {}) });
  const porTipo = {
    pessoa: [...pessoas.values()].map((p) => comId(p, norm(p.nome))),
    criatura: [...bichos.values()].map((b) => comId(b, `${b.raiz}`)),
    coisa: coisas.map(({ chave, ...x }) => comId(x, norm(chave))),
    lugar: lugares.map((l) => comId(l, `${l.deOnde}|${norm(l.nome)}`)),
  };
  const out = [];
  for (const tipo of Object.keys(EM_CENA_MAX)) {
    const xs = porTipo[tipo].map((x, i) => [x, i]).sort((a, b) => (b[0].aqui ? 1 : 0) - (a[0].aqui ? 1 : 0) || a[1] - b[1]).map(([x]) => x);
    const vistos2 = new Set();
    for (const x of xs) {
      if (vistos2.has(x.id)) continue;
      vistos2.add(x.id);
      if (out.filter((y) => y.tipo === tipo).length >= EM_CENA_MAX[tipo]) break;
      out.push(x);
    }
  }
  return out;
}

/* a coisa que a frase nomeia e o complemento DESMENTE: "um frasco de cura"
   não é o "Frasco com terra vermelha" (a 9.ª, M42) — a cabeça casa, e a
   palavra que a frase lhe pendura não está no nome da coisa */
function contradiz(frase, nome) {
  const cab = cabecaDaCoisa(nome);
  if (!cab.length) return false;
  const doNome = new Set(palavras(nome).map(semS));
  const ps = palavras(frase);
  const raizE = (p) => semS(p.replace(/(oes|aes)$/, "ao"));
  let viu = false, desmente = false;
  ps.forEach((p, i) => {
    if (!cab.includes(raizE(p))) return;
    viu = true;
    const c = ps[i + 1], w = ps[i + 2];
    if (c && w && NOME_DA_COISA.conectores.includes(c) && w.length >= NOME_DA_COISA.minimo && !doNome.has(semS(w))) desmente = true;
    else desmente = false;
  });
  return viu && desmente;
}

/* ============================================================
   A LINHA DA PAUTA
   `emCenaParaPauta(lista, { moeda, jaDito, nomes })`: o que está à vista,
   numa frase fechada e curta — a gente (com o papel em três palavras, ou
   "com você"), os bichos (com quantos, e se vêm hostis), o que está à venda
   à vista (o preço do estoque, com a moeda uma vez), e, no fim, os nomes à
   mão (a linha deles inteira, para o App os reconhecer chegados). O que
   outra secção já diz (`jaDito`: a resposta, a planta da sala, o coração)
   não se repete. Sem nada à vista nem nomes: "".
   ============================================================ */
function escolher(lista, jaDito) {
  const dito = norm(jaDito);
  const visto = (x) => x.aqui && !(dito && dito.includes(norm(x.nome)));
  const ids = new Set();
  const L = arr(lista).filter((x) => x && x.id && x.nome && visto(x) && !ids.has(x.id) && ids.add(x.id));
  /* a gente que a cena é: a que a prosa e o núcleo trazem, depois o grupo */
  const gente = L.filter((x) => x.tipo === "pessoa").map((x, i) => [x, i]).sort((a, b) => (a[0].comigo ? 1 : 0) - (b[0].comigo ? 1 : 0) || a[1] - b[1]).map(([x]) => x).slice(0, EM_CENA_NA_PAUTA.pessoa);
  const bichos = L.filter((x) => x.tipo === "criatura").slice(0, EM_CENA_NA_PAUTA.criatura);
  /* a coisa que a frase nomeou vem primeiro: é dela que se fala */
  const coisas = L.filter((x) => x.tipo === "coisa").map((x, i) => [x, i]).sort((a, b) => (b[0].nomeada ? 1 : 0) - (a[0].nomeada ? 1 : 0) || a[1] - b[1]).map(([x]) => x).slice(0, EM_CENA_NA_PAUTA.coisa);
  return [...gente, ...bichos, ...coisas];
}
function rotuloDaPessoa(x) {
  if (x.comigo) return EM_CENA_TRATO.comigo;
  if (x.armado) return "";
  const papel = String(x.papel || "").split(",")[0].trim().split(/\s+/).slice(0, EM_CENA_NA_PAUTA.papel).join(" ");
  return papel || x.genero || "";
}
function linhaDe(itens, moeda, nomes) {
  const gente = itens.filter((x) => x.tipo === "pessoa").map((x) => { const r = rotuloDaPessoa(x); return r ? `${x.nome} (${r})` : x.nome; });
  const bichos = itens.filter((x) => x.tipo === "criatura").map((x) => `${x.nome}${x.quantos > 1 ? ` ×${x.quantos}` : ""}${x.hostil ? " (hostil)" : ""}`);
  const venda = itens.filter((x) => x.tipo === "coisa" && x.preco != null).map((x) => `${x.nome} ◉${x.preco}`);
  const chao = itens.filter((x) => x.tipo === "coisa" && x.preco == null).map((x) => x.nome);
  const partes = [
    gente.join(" · "),
    bichos.join(" · "),
    venda.length ? `à venda${moeda ? `, em ${moeda}` : ""}: ${venda.join(" · ")}` : "",
    chao.length ? `no chão: ${chao.join(" · ")}` : "",
    ...arr(nomes),
  ].filter(Boolean);
  return partes.join("; ");
}
export function emCenaParaPauta(lista, opcoes) {
  const o = obj(opcoes);
  const itens = escolher(lista, o.jaDito);
  const moeda = String(o.moeda || (itens.find((x) => x.moeda) || {}).moeda || "");
  return linhaDe(itens, moeda, textos(o.nomes));
}

/* ============================================================
   A LINHA NA PAUTA, SEM TIRAR NADA (`pautaComEmCena`)
   A pauta já anda perto do teto. A linha entra no lugar dos NOMES À MÃO
   (a mesma prioridade, e a linha deles vai dentro dela) e o que ela pode
   tirar é só o que a decora (a cauda do ONDE, a economia da praça, a
   ficha, A GENTE, o DAQUI). O que o turno não perde (`EM_CENA_NAO_TIRA`):
   se uma dessas linhas chegava sem EM CENA e deixaria de chegar com ela, a
   linha encolhe — sai a última coisa à vista, depois a anterior — até
   caber; quando nem os nomes cabiam antes, tenta-se a linha sem eles (é
   mais curta); sem caber, a pauta fica como era (os nomes na secção deles).
   Medido nas 141 pautas enviadas da 6.ª à 8.ª (teste-em-cena): entra em
   toda pauta onde os nomes entravam, e em mais 37 onde eles não cabiam.
   A cabeça cresce com o número do turno: confere-se com o turno dado e,
   sem ele, com a cabeça mais curta e a mais longa. Na luta não entra: a
   vista da luta (QUEM) já é a lista de quem está de pé.
   ============================================================ */
export const EM_CENA_NAO_TIRA = {
  secoes: ["naoPode", "vetoDoDesfecho", "desfecho", "pergunta", "fala", "rumo", "fecho", "coracao", "volta", "masmorra"],
  primeira: ["momento", "onde"],
  /* o que já está dito noutra secção não se repete na linha */
  jaDito: ["pergunta", "masmorra", "coracao", "quemE", "quem"],
  porque: "a lista do que existe ajuda o Narrador; tirar-lhe o veto, a resposta ou a batida desfaz o turno",
};
export function pautaComEmCena(pauta, lista, opcoes) {
  const o = obj(opcoes);
  const p = garantirPauta(pauta);
  if (o.luta) return p;
  const nomes = p.nomes || [];
  const resto = { ...p };
  delete resto.nomes;
  const jaDito = EM_CENA_NAO_TIRA.jaDito.flatMap((id) => resto[id] || []).join(" ");
  const itens = escolher(lista, jaDito);
  if (!itens.length && !nomes.length) return p;
  const moeda = String(o.moeda || (itens.find((x) => x.moeda) || {}).moeda || "");
  const turnos = Number.isFinite(Number(o.turno)) && o.turno != null ? [Number(o.turno)] : [0, 99999];
  const guardadas = (tx) => [
    ...EM_CENA_NAO_TIRA.secoes.flatMap((id) => p[id] || []),
    ...EM_CENA_NAO_TIRA.primeira.map((id) => (p[id] || [])[0]),
    ...nomes,
  ].filter((l) => l && tx.includes(l));
  const antes = turnos.map((turno) => { const tx = textoDaPauta(p, { turno }); return guardadas(tx); });
  const tenta = (linha, base) => {
    const com = garantirPauta({ ...base, emCena: [linha] });
    return turnos.every((turno, i) => { const tx = textoDaPauta(com, { turno }); return antes[i].every((l) => tx.includes(l)) && tx.includes(linha); }) ? com : null;
  };
  for (let k = itens.length; k >= 0; k--) {
    const linha = linhaDe(itens.slice(0, k), moeda, nomes);
    if (!linha) break;
    const com = tenta(linha, resto);
    if (com) return com;
  }
  /* os nomes não cabiam nem antes: a linha sem eles, que é mais curta, ainda
     pode caber — e a secção dos nomes fica onde estava */
  for (let k = itens.length; k >= 1 && nomes.length; k--) {
    const com = tenta(linhaDe(itens.slice(0, k), moeda, []), p);
    if (com) return com;
  }
  return p;
}

/* ============================================================
   A FRASE CONTRA A LISTA (`quemNaFrase`)
   Devolve [{ id, tipo, nome, como, quantos, faz }] — o que a frase aponta, com
   o principal à frente: o que está numa oração que FAZ alguma coisa a ele
   (o golpe, a compra ou o preço, a procura; depois a fala), e, dentro dela,
   o que vem primeiro. `como`: "nome", "papel", "arma", "descricao",
   "raiz", "coisa", "lugar", "pronome". `quantos`: 1, ou o grupo inteiro
   quando a frase diz o plural ("os ratos"). `faz`: o que a oração lhe faz
   ("golpe", "compra", "procura", "golpeDito", "fala", ou "").
   A ordem das réguas é a das leituras que já existiam e resolvem: a raiz
   do bicho (agressao.js), o nome da coisa (economia.js#nomeiaACoisa), o
   ofício do elo (procura.js#papelProcurado). O pronome só aponta quando
   nada mais apontou e há UM candidato só, que não anda com o herói — o
   "ela" da 8.ª foi à companheira de viagem por eliminação.
   ============================================================ */
export const ACAO_QUE_APONTA = {
  forca: { golpe: 3, compra: 3, procura: 3, golpeDito: 2, fala: 1 },
  procura: /\b(procuro|procuramos|busco|buscamos|vou atras|sigo o|sigo a|sigo os|sigo as)\b/,
  fala: /\b(pergunto|perguntar|digo|falo|chamo|peco|entrego|mostro|ofereco|olho|encaro|aceno|cumprimento|pago|toco|ajudo|levanto|aponto)\b/,
  /* o "não X" tira X da frase: "eu queria atacar a da corrente, não Ursa" */
  nega: ["nao", "nem"],
  /* o plural do bicho é o grupo, salvo "um dos ratos" */
  umDos: ["dos", "das"],
  porque: "o que a frase faz a alguém diz quem é o principal; a menção solta vem depois",
};
const ORACOES = /[.!?;\n]+|\s+(?:e|mas|porem|porém|depois|enquanto)\s+/i;
/* o que a oração faz, e com que força aponta: { faz, forca } */
function forcaDa(oracao) {
  const n = norm(oracao);
  const F = ACAO_QUE_APONTA.forca;
  const e = (faz) => ({ faz, forca: F[faz] });
  try { if (ehDeclaracaoDeAtaque(oracao)) return e("golpe"); } catch { /* nunca custa o turno */ }
  if (PERGUNTA_DE_PRECO.test(n) || APONTA_OU_COMPRA.test(n)) return e("compra");
  /* a procura pela régua daqui: `ehProcura` (procura.js) lê "atrás" como
     procurar, e "mando Tônia ficar atrás de mim" não procura ninguém */
  if (ACAO_QUE_APONTA.procura.test(n)) return e("procura");
  try { if (RX_AGRESSAO.test(n)) return e("golpeDito"); } catch { /* idem */ }
  return ACAO_QUE_APONTA.fala.test(n) ? e("fala") : { faz: "", forca: 0 };
}
const seq = (ps, alvo) => { for (let i = 0; i + alvo.length <= ps.length; i++) if (alvo.every((w, k) => ps[i + k] === w)) return i; return -1; };

/* onde (índice de palavra) a oração aponta esta coisa, e como; ou null */
function aponta(x, ps, oracao, lista) {
  const nomeP = palavras(x.nome);
  const negado = (i) => i > 0 && ACAO_QUE_APONTA.nega.includes(ps[i - 1]);
  const achou = (i, como, extra = {}) => (i >= 0 && !negado(i) ? { pos: i, como, ...extra } : null);
  if (x.tipo === "pessoa" && !x.armado) {
    const full = seq(ps, nomeP);
    if (full >= 0) return achou(full, "nome", { forca: 3 });
    const p1 = nomeP[0];
    if (p1 && p1.length >= 3) { const i = ps.indexOf(p1); if (i >= 0) return achou(i, "nome", { forca: 2 }); }
    if (x.antecedente) {
      const r = papelProcurado(oracao, { antecedente: x.antecedente, pessoas: [{ papel: "elo", nome: x.nome, eraDoHeroi: x.papel }] });
      if (r) { const pp = palavras(x.papel); const i = ps.findIndex((w) => pp.includes(w) && w.length >= 4); return achou(i >= 0 ? i : 0, "papel", { forca: 2 }); }
    }
    const cab = semS(palavras(String(x.papel || "").split(",")[0])[0] || "");
    if (cab.length >= 5) { const i = ps.findIndex((w) => semS(w) === cab); if (i >= 0) return achou(i, "papel", { forca: 1 }); }
    return null;
  }
  if (x.tipo === "pessoa") {
    /* quem o Mestre armou: pela arma ("a que leva a corrente"), pelo que
       a prosa lhe pendura ("de barba ruiva"), ou pela cabeça se é só um */
    const ia = ps.findIndex((w, i) => semS(w) === semS(x.arma || "\u0000") && !["sem"].includes(ps[i - 1]));
    if (ia >= 0) return achou(ia, "arma", { forca: 2 });
    const comp = arr(x.palavras);
    if (comp.length && comp.every((w) => ps.includes(w))) return achou(ps.indexOf(comp[0]), "descricao", { forca: 2 });
    if (x.cabeca) {
      const mesmos = arr(lista).filter((y) => y && y.tipo === "pessoa" && y.armado && y.cabeca === x.cabeca);
      const i = ps.findIndex((w) => semS(w) === semS(x.cabeca));
      if (i >= 0 && mesmos.length === 1) return achou(i, "descricao", { forca: 1 });
    }
    return null;
  }
  if (x.tipo === "criatura") {
    const i = ps.findIndex((w) => CABECAS.has(w) && raizDoBicho(w) === x.raiz);
    if (i >= 0) {
      const plural = !!NUMERO_DO_BICHO.singular[ps[i]] && !ACAO_QUE_APONTA.umDos.includes(ps[i - 1]);
      return achou(i, "raiz", { forca: 2, quantos: plural ? Math.max(1, Number(x.quantos) || 1) : 1 });
    }
    const j = seq(ps, nomeP);
    return j >= 0 ? achou(j, "nome", { forca: 3, quantos: 1 }) : null;
  }
  if (x.tipo === "coisa") {
    if (!nomeiaACoisa(oracao, x.nome) || contradiz(oracao, x.nome)) return null;
    const cab = cabecaDaCoisa(x.nome);
    const i = ps.findIndex((w) => cab.includes(semS(w.replace(/(oes|aes)$/, "ao"))));
    return achou(Math.max(0, i), "coisa", { forca: 2 });
  }
  if (x.tipo === "lugar") {
    const i = seq(ps, nomeP);
    return nomeP.length && i >= 0 ? achou(i, "lugar", { forca: 2 }) : null;
  }
  return null;
}

export function quemNaFrase(frase, lista) {
  const L = arr(lista).filter((x) => x && typeof x === "object" && x.id && x.nome && x.tipo);
  const txt = String(frase == null ? "" : frase);
  if (!txt.trim() || !L.length) return [];
  const oracoes = txt.split(ORACOES).filter((s) => s && s.trim());
  const achados = new Map();
  let base = 0;
  oracoes.forEach((oracao, oi) => {
    const ps = palavras(oracao);
    const { faz, forca } = forcaDa(oracao);
    /* na mesma oração, o mesmo trecho é de quem o diz melhor ("Brina" e
       "Brina Pedra": o nome inteiro ganha) */
    const daqui = [];
    for (const x of L) {
      const a = aponta(x, ps, oracao, L);
      if (a) daqui.push({ x, ...a });
    }
    for (const a of daqui) {
      const melhor = daqui.filter((b) => b.pos === a.pos && b.x.tipo === a.x.tipo).sort((b, c) => c.forca - b.forca || (c.x.aqui ? 1 : 0) - (b.x.aqui ? 1 : 0))[0];
      if (melhor !== a) continue;
      const ja = achados.get(a.x.id);
      const novo = { id: a.x.id, tipo: a.x.tipo, nome: a.x.nome, como: a.como, quantos: a.quantos || 1, faz, acao: forca, pos: base + a.pos, oi };
      if (!ja || novo.acao > ja.acao) achados.set(a.x.id, novo);
    }
    base += ps.length + 1;
  });
  /* o pronome, só sem mais nada e com um candidato só */
  if (!achados.size) {
    let porPronome = false;
    try { porPronome = PRONOME_DO_ALVO.rx.test(norm(txt)); } catch { porPronome = false; }
    if (porPronome) {
      const cands = L.filter((x) => x.aqui && !x.comigo && (x.tipo === "criatura" || (x.tipo === "pessoa" && (x.armado || x.hostil))));
      if (cands.length === 1) return [{ id: cands[0].id, tipo: cands[0].tipo, nome: cands[0].nome, como: "pronome", quantos: 1, faz: forcaDa(txt).faz }];
    }
    return [];
  }
  return [...achados.values()]
    .sort((a, b) => b.acao - a.acao || a.pos - b.pos)
    .map(({ id, tipo, nome, como, quantos, faz }) => ({ id, tipo, nome, como, quantos, faz }));
}
