/* ============================================================
   O TRANSPORTE (v9.120) — o fio entre as duas cadeiras

   `mesa.js` sabe o que é um turno a duas mãos e não sabe o que é uma
   rede. Este arquivo é o contrário: não sabe o que é um turno, e leva
   objetos de um lado ao outro. A separação não é elegância — é o que
   permite trocar o meio sem tocar na regra, e é aqui que a troca vai
   acontecer.

   ---------------- O QUE FUNCIONA HOJE, E O QUE NÃO ----------------

   Esta é a parte honesta, e ela precisa estar escrita no arquivo e não só
   numa conversa: o canal implementado aqui é o do NAVEGADOR — duas abas,
   duas janelas ou dois perfis na MESMA máquina, por `BroadcastChannel`,
   com `localStorage` de reserva para o navegador que não o tenha.

   Ele NÃO atravessa a internet. Dois computadores diferentes precisam de
   um terceiro ponto que guarde e repasse os recados, e não existe forma
   de fazer isso sem um: uma função serverless não guarda estado entre
   chamadas, e o WebRTC precisa de alguém para apresentar um lado ao
   outro. É uma escolha de infraestrutura, e ela é de quem paga a conta.

   O que este arquivo garante é que essa escolha custe UM arquivo. Todo o
   resto — sala, cadeiras, ordem das ações, sincronização do mundo — já
   funciona por cima desta interface, e foi testado por ela.

   ---------------- A INTERFACE ----------------

       const canal = abrirCanal(codigo, { aoReceber });
       canal.enviar(recado);
       canal.fechar();

   `aoReceber` nunca vê o que o próprio lado mandou: um canal que devolve
   o eco obriga cada leitor a filtrar por conta própria, e um deles vai
   esquecer.
   ============================================================ */

export const PREFIXO = "taverna_mesa_";

/* Um identificador por ABA, não por pessoa: a mesma pessoa em duas janelas
   são dois participantes, e é assim que se testa a mesa sozinho. */
export function novoIdDeParticipante(rnd = Math.random) {
  return `p${Date.now().toString(36)}${Math.floor(rnd() * 1e6).toString(36)}`;
}

const temJanela = () => typeof window !== "undefined";
const temCanal = () => temJanela() && typeof window.BroadcastChannel === "function";

/* ---------------- O CANAL DO NAVEGADOR ----------------
   `BroadcastChannel` quando existe; `localStorage` quando não. O segundo é
   um canal de verdade e não uma gambiarra: o evento `storage` dispara em
   TODA outra aba do mesmo domínio, que é exatamente o alcance do primeiro.
   O que ele não tem é ordem garantida, e por isso todo recado leva
   carimbo. */
export function abrirCanal(codigo, { aoReceber = () => {} } = {}) {
  const chave = `${PREFIXO}${String(codigo || "sem-sala")}`;
  if (!temJanela()) return canalMudo();
  let vivo = true;
  const visto = new Set();
  const avisar = aoReceber;

  /* o mesmo recado pode chegar pelos dois caminhos (o navegador que tem
     BroadcastChannel também dispara `storage`); o carimbo desempata */
  const entregar = (r) => {
    if (!vivo || !r || !r.__id || visto.has(r.__id)) return;
    visto.add(r.__id);
    if (visto.size > 400) for (const v of [...visto].slice(0, 200)) visto.delete(v);
    const { __id, ...limpo } = r;
    try { avisar(limpo); } catch { /* um leitor que quebra não derruba o canal */ }
  };

  let bc = null;
  if (temCanal()) {
    try {
      bc = new window.BroadcastChannel(chave);
      bc.onmessage = (ev) => entregar(ev && ev.data);
    } catch { bc = null; }
  }
  const noStorage = (ev) => {
    if (!ev || ev.key !== chave || !ev.newValue) return;
    try { entregar(JSON.parse(ev.newValue)); } catch { /* recado corrompido é recado perdido */ }
  };
  try { window.addEventListener("storage", noStorage); } catch { /* ambiente sem eventos */ }

  return {
    tipo: bc ? "broadcast" : "storage",
    enviar: (recado) => {
      if (!vivo || !recado) return false;
      const r = { ...recado, __id: `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}` };
      /* o próprio lado marca como visto ANTES de mandar: é assim que o eco
         do `localStorage` não volta como recado de outra pessoa */
      visto.add(r.__id);
      let foi = false;
      if (bc) { try { bc.postMessage(r); foi = true; } catch { /* segue para o outro caminho */ } }
      try { window.localStorage.setItem(chave, JSON.stringify(r)); foi = true; } catch { /* cota cheia ou modo privado */ }
      return foi;
    },
    fechar: () => {
      vivo = false;
      if (bc) { try { bc.close(); } catch { /* já fechado */ } }
      try { window.removeEventListener("storage", noStorage); } catch { /* nada a remover */ }
    },
  };
}

/* Fora do navegador (as provas rodam em node) o canal existe e não faz
   nada. Devolver `null` obrigaria todo chamador a testar, e um deles ia
   esquecer — a mesma razão pela qual A REDE existe nos acervos. */
function canalMudo() {
  return { tipo: "mudo", enviar: () => false, fechar: () => {} };
}

/* ---------------- O QUE ATRAVESSA, E QUANTO ----------------
   O estado do mundo é o save inteiro, e ele passa dos 80 KB numa campanha
   de dois dias. `BroadcastChannel` aguenta; `localStorage` tem cota, e uma
   cota estourada é um turno que some em silêncio. Quem manda o mundo
   pergunta antes se ele cabe. */
export const TETO_DO_RECADO = 4 * 1024 * 1024;

export function cabeNoFio(carga) {
  try { return JSON.stringify(carga).length <= TETO_DO_RECADO; } catch { return false; }
}
