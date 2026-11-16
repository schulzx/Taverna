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
/* S4e (16/11, o elenco do lugar): a secção NOMES À MÃO cala de propósito
   (elenco-do-lugar.js, ELENCO_DO_LUGAR.nomesAMao = false) — quem atende um
   sítio é o figurante que o sistema escala, e onde ninguém atende quem passa
   não tem nome. É a mesma correção do S4c («a pauta oferecia nomes a
   figurantes em qualquer sítio»), levada ao fim: entra no lado da cena. */
const SECOES_DA_CENA = /^(EM CENA|A GENTE|NOMES À MÃO)\s/;
const LINHA_DO_VETO = /quem não está nesta cena/;
/* S4e: e o elencoCache — o bloco dos nomes à mão era quem o enchia (nomesDoElenco), e com os nomes calados ele fica
   como estava; e o calou("nomesAMao"), que deixa de poder soar */
const REFS_DA_CENA = new Set(["emCena", "elencoMem", "nomesPendentes", "nomesOferecidos", "interprete", "relevancia", "genteNaPauta", "elencoCache"]);
const PORTA_DOS_NOMES = JSON.stringify(["calou", "nomesAMao"]);

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
    return v.filter((x) => JSON.stringify(x) !== PORTA_DOS_NOMES).map(semCena);
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

/* S4e (16/11): a cena mudou SÓ porque os nomes à mão calaram? (a secção NOMES
   À MÃO, a cauda «a quem não tem nome: …» da linha EM CENA e os refs dela).
   É a única mudança que a rua da cidade pode ter — os testes da regra «a cena
   muda só onde há sítio…» leem esta, com o motivo escrito ao lado. */
const semNomes = (tx) => String(tx == null ? "" : tx).split("\n").filter((l) => !/^NOMES À MÃO\s/.test(l)).map((l) => (/^EM CENA\s/.test(l) ? l.replace(/;?\s*a quem não tem nome:.*$/, "") : l)).filter((l) => !/^EM CENA\s*$/.test(l)).join("\n");
const semRefsDosNomes = (r) => (r && typeof r === "object" ? Object.fromEntries(Object.entries(r).filter(([k]) => !["nomesPendentes", "nomesOferecidos", "elencoCache", "emCena", "relevancia", "genteNaPauta"].includes(k))) : r);
export function soOsNomesCalaram(a, b) {
  const x = a && typeof a === "object" ? a : {}, y = b && typeof b === "object" ? b : {};
  const p = soACena({ t: semNomes(x.t), r: semRefsDosNomes(x.r) }), q = soACena({ t: semNomes(y.t), r: semRefsDosNomes(y.r) });
  /* A GENTE vem e vai com o arrumo do teto (pautaComEmCena: a linha EM CENA,
     com os nomes, trazia-a consigo; sem eles, a economia da praça ocupa o
     lugar — medido nos casos 120 e 140 da prova da pauta). O que tem de ficar
     igual: a linha EM CENA sem os nomes, o veto, e os refs da cena. */
  /* e a linha EM CENA entra «no lugar dos NOMES À MÃO» (em-cena.js,
     pautaComEmCena): sem eles, a linha só do grupo («Saoirse (com você)»,
     caso 146) pode não entrar, e o grupo de dois troca de vez (caso 198). A
     régua é a da jornada no S4: ninguém de fora do grupo entra na peça sem
     estar no recorte, e os refs da cena são os mesmos. */
  const gente = (ls) => ls.filter((l) => /^EM CENA\s/.test(l)).flatMap((l) => l.replace(/^EM CENA\s+/, "").split(/ · |; /)).filter((x) => x && !/\(com você\)/.test(x));
  const antes = gente(q.linhas);
  return JSON.stringify(p.refs) === JSON.stringify(q.refs) && gente(p.linhas).every((x) => antes.includes(x));
}
