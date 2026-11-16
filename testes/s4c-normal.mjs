/* s4c-normal.mjs (16/11, S4c — o Narrador obedece à cena) — o que os
   dourados do motor deixam de comparar à letra, e porquê.

   Os dourados da pauta, do pedido e da cadeia são o App de um commit fixo
   (o recorte). Nele quem estava aqui era a cidade inteira, a cena de um
   sítio não tinha a gente do posto, a pauta oferecia nomes a figurantes
   em qualquer sítio e o Intérprete (A GENTE) fazia agir o morador da
   cidade a cinco minutos dos portões. O S4c muda isso DE PROPÓSITO, e só
   isso: a linha EM CENA (com os nomes à mão dentro dela), a secção A GENTE,
   a linha do NÃO PODE que diz quem não está, e os refs que guardam o que
   elas escreveram (emCena, elencoMem — o gesto marcado de quem agiu —,
   nomesPendentes/nomesOferecidos, interprete, relevancia, que lê quem está).
   O pushMsgs leva a foto dos refs num hash, e o hash muda com eles: a
   porta compara-se pelo nome e pelas mensagens, sem a foto.

   Tudo o resto — as outras linhas, os outros refs, a ordem das portas, os
   erros — continua byte a byte. A intenção fica: a peça é o recorte, salvo
   a correção escrita. */
const SECOES_DA_CENA = /^(EM CENA|A GENTE)\s/;
const LINHA_DO_VETO = /quem não está nesta cena/;
const REFS_DA_CENA = new Set(["emCena", "elencoMem", "nomesPendentes", "nomesOferecidos", "interprete", "relevancia", "genteNaPauta"]);

/* o texto da pauta sem as secções da cena: uma secção começa com o rótulo
   na coluna 0 e continua nas linhas indentadas */
export function textoSemCena(tx) {
  if (typeof tx !== "string") return tx;
  const out = [];
  let fora = false;
  for (const l of tx.split("\n")) {
    if (/^\S/.test(l)) fora = SECOES_DA_CENA.test(l);
    if (fora) continue;
    if (LINHA_DO_VETO.test(l)) {
      /* o veto na 1.ª linha do NÃO PODE leva o rótulo: a seguinte herda-o */
      if (/^\S/.test(l)) out.push("§rotulo-do-veto");
      continue;
    }
    if (out[out.length - 1] === "§rotulo-do-veto") { out.pop(); out.push("NÃO PODE  " + l.trim()); continue; }
    out.push(l);
  }
  return out.filter((l) => l !== "§rotulo-do-veto").join("\n");
}

export function semCena(v) {
  if (typeof v === "string") return textoSemCena(v);
  if (Array.isArray(v)) {
    if (v[0] === "pushMsgs") return v.slice(0, 2);
    return v.map(semCena);
  }
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).filter(([k]) => !REFS_DA_CENA.has(k)).map(([k, x]) => [k, semCena(x)]));
  return v;
}

/* só o que a cena manda: as secções EM CENA e A GENTE, a linha do veto, e os
   refs da cena — o lado que o S4c mudou de propósito */
export function soACena(v) {
  const o = v && typeof v === "object" ? v : {};
  const linhas = [];
  let dentro = false;
  for (const l of String(o.t == null ? "" : o.t).split("\n")) {
    if (/^\S/.test(l)) dentro = SECOES_DA_CENA.test(l);
    if (dentro || LINHA_DO_VETO.test(l)) linhas.push(l.replace(/^NÃO PODE\s+/, ""));
  }
  const refs = o.r && typeof o.r === "object" ? Object.fromEntries(Object.entries(o.r).filter(([k]) => REFS_DA_CENA.has(k))) : {};
  return { linhas, refs };
}
