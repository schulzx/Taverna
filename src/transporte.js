/* ============================================================
   O TRANSPORTE (v9.120) — o fio entre as duas cadeiras

   `mesa.js` sabe o que é um turno a duas mãos e não sabe o que é uma
   rede. Este arquivo é o contrário: não sabe o que é um turno, e leva
   objetos de um lado ao outro. A separação não é elegância — é o que
   permite trocar o meio sem tocar na regra, e é aqui que a troca vai
   acontecer.

   ---------------- DOIS CANAIS, LIGADOS AO MESMO TEMPO ----------------

   O LOCAL (`BroadcastChannel`, com `localStorage` de reserva) liga duas
   abas ou duas janelas da MESMA máquina, e é instantâneo.

   A REDE (`/api/sala`) liga dois APARELHOS, por um Redis que guarda os
   recados enquanto o outro lado não olha.

   Os dois ficam abertos juntos, e isso não é desperdício: quem joga na
   mesma máquina continua recebendo na hora, e quem joga longe recebe do
   mesmo jeito, sem que nada aqui precise escolher um modo. O recado que
   chega pelos dois caminhos é entregue UMA vez — todo recado leva
   carimbo, e o carimbo desempata.

   ---------------- O MUNDO NÃO ANDA NA FILA ----------------

   O save passa dos 80 KB e o convidado pergunta "mudou alguma coisa?" a
   cada dois segundos. Se o mundo viajasse na fila, ele estaria puxando 80
   KB para ouvir "não". Então o transporte parte o recado em dois sem que
   ninguém acima saiba: o mundo vai para uma chave que se sobrescreve, e
   na fila anda um ponteiro de poucos bytes. Do lado de lá, o ponteiro é
   remontado no recado inteiro antes de ser entregue.

   É por isso que `enviar` continua recebendo o recado completo e
   `aoReceber` continua devolvendo o recado completo: partir e remontar é
   assunto do fio, e o fio é este arquivo.

   ---------------- A INTERFACE ----------------

       const canal = abrirCanal(codigo, { aoReceber });
       canal.enviar(recado);
       canal.fechar();

   `aoReceber` nunca vê o que o próprio lado mandou: um canal que devolve
   o eco obriga cada leitor a filtrar por conta própria, e um deles vai
   esquecer.

   O canal diz em `tipo` por onde ele fala, e a tela mostra isso: uma sala
   que só alcança a própria máquina precisa dizer que só alcança a própria
   máquina, senão o jogador fica esperando alguém que nunca vai chegar.
   ============================================================ */

export const PREFIXO = "taverna_mesa_";

/* Um identificador por ABA, não por pessoa: a mesma pessoa em duas janelas
   são dois participantes, e é assim que se testa a mesa sozinho. */
export function novoIdDeParticipante(rnd = Math.random) {
  return `p${Date.now().toString(36)}${Math.floor(rnd() * 1e6).toString(36)}`;
}

const nada = () => {};
const temJanela = () => typeof window !== "undefined";
const temCanal = () => temJanela() && typeof window.BroadcastChannel === "function";

/* ---------------- O CANAL DO NAVEGADOR ----------------
   `BroadcastChannel` quando existe; `localStorage` quando não. O segundo é
   um canal de verdade e não uma gambiarra: o evento `storage` dispara em
   TODA outra aba do mesmo domínio, que é exatamente o alcance do primeiro.
   O que ele não tem é ordem garantida, e por isso todo recado leva
   carimbo. */
export const ROTA_DA_SALA = "/api/sala";
/* De quanto em quanto se pergunta se chegou recado. Dois segundos somem ao
   lado dos dez a quinze que a chamada do Mestre leva — e é o intervalo que
   mantém a conta do Upstash pequena numa sessão longa. */
export const INTERVALO_DA_ESPIA = 2000;
/* Depois de uma falha seguida da outra, espia mais devagar: insistir de dois
   em dois segundos contra um servidor fora do ar não conserta nada e ainda
   enche o console de vermelho. */
export const ESPERA_MAXIMA = 15000;

export function abrirCanal(codigo, { aoReceber, rede = true } = {}) {
  const cod = String(codigo || "sem-sala");
  const avisar = typeof aoReceber === "function" ? aoReceber : nada;
  let vivo = true;
  const visto = new Set();

  /* O DEDUPE É COMPARTILHADO pelos dois canais, e tem de ser: o mesmo recado
     chega pela aba do lado e pela rede, e entregar duas vezes faria o
     anfitrião contar a mesma ação do convidado duas vezes. */
  const marcar = (id) => {
    if (!id || visto.has(id)) return false;
    visto.add(id);
    if (visto.size > 600) for (const v of [...visto].slice(0, 300)) visto.delete(v);
    return true;
  };
  const entregar = (r) => {
    if (!vivo || !r || !marcar(r.__id)) return;
    const { __id, ...limpo } = r;
    try { avisar(limpo); } catch { /* um leitor que quebra não derruba o canal */ }
  };

  const local = canalLocal(cod, entregar);
  const naRede = rede ? canalDaRede(cod, entregar) : null;

  return {
    /* O que a tela mostra: uma sala que só alcança a própria máquina precisa
       dizer isso, senão o jogador espera alguém que não vai chegar. É uma
       função e não uma propriedade porque a resposta MUDA — o canal só vira
       "rede" depois da primeira espiada que der certo. */
    estado: () => ({
      tipo: naRede && naRede.ligada() ? "rede" : local.tipo,
      falha: naRede ? naRede.falha() : "",
    }),
    enviar: (recado) => {
      if (!vivo || !recado) return false;
      const r = { ...recado, __id: `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}` };
      /* o próprio lado marca como visto ANTES de mandar: é assim que o eco
         do `localStorage` não volta como recado de outra pessoa */
      marcar(r.__id);
      const a = local.enviar(r);
      const b = naRede ? naRede.enviar(r) : false;
      return a || b;
    },
    fechar: () => {
      vivo = false;
      local.fechar();
      if (naRede) naRede.fechar();
    },
  };
}

/* ---------------- O CANAL DA MESMA MÁQUINA ----------------
   `BroadcastChannel` quando existe; `localStorage` quando não. O segundo é
   um canal de verdade e não uma gambiarra: o evento `storage` dispara em
   TODA outra aba do mesmo domínio, que é exatamente o alcance do primeiro. */
function canalLocal(cod, entregar) {
  const chave = `${PREFIXO}${cod}`;
  if (!temJanela()) return { tipo: "mudo", enviar: () => false, fechar: () => {} };
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
    enviar: (r) => {
      let foi = false;
      if (bc) { try { bc.postMessage(r); foi = true; } catch { /* segue para o outro caminho */ } }
      try { window.localStorage.setItem(chave, JSON.stringify(r)); foi = true; } catch { /* cota cheia ou modo privado */ }
      return foi;
    },
    fechar: () => {
      if (bc) { try { bc.close(); } catch { /* já fechado */ } }
      try { window.removeEventListener("storage", noStorage); } catch { /* nada a remover */ }
    },
  };
}

/* ---------------- O CANAL DOS DOIS APARELHOS ----------------
   Publica na fila e espia de tempos em tempos o que chegou depois do que já
   viu. `desde` é o que separa uma consulta barata de um download: quando não
   houve nada, a resposta é uma lista vazia.

   O MUNDO NÃO ANDA NA FILA. Sai daqui partido em dois e chega remontado, e
   é por isso que ninguém acima deste arquivo sabe que ele foi partido. */
function canalDaRede(cod, entregar) {
  if (!temJanela() || typeof window.fetch !== "function") {
    return { enviar: () => false, fechar: () => {}, ligada: () => false, falha: () => "" };
  }
  let vivo = true, desde = 0, espera = INTERVALO_DA_ESPIA, ligada = false, falha = "", relogio = null;

  const pedir = async (corpo) => {
    const r = await fetch(ROTA_DA_SALA, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ sala: cod, ...corpo }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.erro || `sala ${r.status}`);
    return d;
  };

  const espiar = async () => {
    if (!vivo) return;
    try {
      const d = await pedir({ acao: "ler", desde });
      ligada = true; falha = ""; espera = INTERVALO_DA_ESPIA;
      desde = Number(d.total) || desde;
      for (const r of d.recados || []) {
        if (!vivo) return;
        /* o ponteiro do mundo: o save vem numa segunda ida, e só agora */
        if (r && r.__mundo) {
          try {
            const m = await pedir({ acao: "mundo" });
            entregar({ ...r, __mundo: undefined, save: m.mundo });
          } catch (e) { falha = String((e && e.message) || e).slice(0, 120); }
          continue;
        }
        entregar(r);
      }
    } catch (e) {
      ligada = false;
      falha = String((e && e.message) || e).slice(0, 120);
      espera = Math.min(ESPERA_MAXIMA, Math.round(espera * 1.8));
    }
    if (vivo) relogio = setTimeout(espiar, espera);
  };
  espiar();

  return {
    ligada: () => ligada,
    falha: () => falha,
    enviar: (r) => {
      if (!vivo) return false;
      /* parte o recado: o save vai para a chave que se sobrescreve, e na fila
         anda um ponteiro. Quem chamou nem fica sabendo. */
      const { save, ...leve } = r || {};
      const corpo = save !== undefined && save !== null
        ? { acao: "publicar", recado: { ...leve, __mundo: true }, mundo: save }
        : { acao: "publicar", recado: r };
      /* NÃO adianta `desde` aqui. A primeira versão pulava o índice até o
         fim da fila "para não reler o próprio recado" — e com isso pulava
         também o que o outro tivesse publicado entre a última espiada e
         esta, que é justamente a ação dele no turno. Quem descarta o eco é
         o carimbo, que já faz esse trabalho e não descarta mais nada. */
      pedir(corpo).then(() => {
        ligada = true; falha = "";
      }).catch((e) => { ligada = false; falha = String((e && e.message) || e).slice(0, 120); });
      return true;
    },
    fechar: () => { vivo = false; if (relogio) clearTimeout(relogio); },
  };
}

/* Fora do navegador (as provas rodam em node) os dois canais existem e não
   fazem nada — `canalLocal` devolve "mudo" e `canalDaRede` não espia. Um
   `null` obrigaria todo chamador a testar, e um deles ia esquecer: é a mesma
   razão pela qual A REDE existe nos acervos. */

/* ---------------- O QUE ATRAVESSA, E QUANTO ----------------
   O estado do mundo é o save inteiro, e ele passa dos 80 KB numa campanha
   de dois dias. `BroadcastChannel` aguenta; `localStorage` tem cota, e uma
   cota estourada é um turno que some em silêncio. Quem manda o mundo
   pergunta antes se ele cabe. */
export const TETO_DO_RECADO = 4 * 1024 * 1024;

export function cabeNoFio(carga) {
  try { return JSON.stringify(carga).length <= TETO_DO_RECADO; } catch { return false; }
}
