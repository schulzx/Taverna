/* O MOTORISTA — o que se faz na página do jogo, e o que se lê dela.
   Regra da bancada: confiar no DOM e no estado (localStorage), nunca em foto.
   A ficha sai do save que o próprio jogo grava; as linhas de sistema, do mesmo
   save (autor «sistema»); os cartões, do DOM (botões). */
import { LER_FICHA, LER_MENSAGENS, LER_CARTAO, ABRIR_PROPOSTA, CLICAR_CONFIRMAR, CLICAR_BOTAO, ESTA_OCUPADO, CAMPO_PRONTO, ENVIAR_FRASE, LER_PERGUNTA, LER_EM_CENA } from "./pagina.mjs";

const dorme = (ms) => new Promise((r) => setTimeout(r, ms));
export { dorme };

/* PRNG com semente: o d20 que o jogo rola passa a ser o mesmo em toda rodada.
   (mulberry32; a semente é fixa — a bancada mede a leitura da frase, não a sorte) */
export const FONTE_DA_SEMENTE = `(()=>{let a=0x7A7E12A;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})();`;

/* Restaura o estado de partida: o jogo está DESMONTADO (uma página estática do
   mesmo servidor), injeta-se o localStorage inteiro, e só então se abre o jogo.
   O autosave sobrescreve a injeção se o jogo estiver montado — por isso a ordem. */
export async function restaurar(pag, porta, estado) {
  await pag.navegar(`http://127.0.0.1:${porta}/package.json`);
  await pag.avaliar(`(()=>{localStorage.clear();sessionStorage.clear();const e=${JSON.stringify(estado.ls)};for(const k of Object.keys(e))localStorage.setItem(k,e[k]);return 1})()`);
  pag.consoleLog.length = 0;
  await pag.navegar(`http://127.0.0.1:${porta}/?mestre=1`);
  for (let t = 0; t < 60; t++) {
    const pronto = await pag.avaliar(CAMPO_PRONTO);
    if (pronto === "campo") break;
    if (pronto === "menu") { await pag.avaliar(CLICAR_BOTAO("CONTINUAR")); }
    await dorme(500);
  }
  await dorme(600);
}

export const ficha = async (pag) => JSON.parse(await pag.avaliar(LER_FICHA));
export const mensagens = async (pag) => JSON.parse(await pag.avaliar(LER_MENSAGENS));
export const cartao = async (pag) => JSON.parse(await pag.avaliar(LER_CARTAO));
export const pergunta = async (pag) => JSON.parse(await pag.avaliar(LER_PERGUNTA));
export const emCena = async (pag) => JSON.parse(await pag.avaliar(LER_EM_CENA));

/* espera o turno acabar: nada «preparando», as mensagens quietas e o cartão (se
   houver) estável — por `calmo` leituras seguidas. Devolve o motivo da saída. */
export async function esperarFim(pag, { limite = 25000, calmo = 4, passo = 350 } = {}) {
  const fim = Date.now() + limite;
  let quietas = 0, ultima = "";
  while (Date.now() < fim) {
    await dorme(passo);
    const o = JSON.parse(await pag.avaliar(ESTA_OCUPADO));
    const chave = [o.n, o.cartao, o.pergunta, o.ocupado].join("|");
    if (!o.ocupado && chave === ultima) quietas++; else quietas = 0;
    ultima = chave;
    if (quietas >= calmo) return "quieto";
  }
  return "limite";
}

export async function digitar(pag, frase) {
  const r = await pag.avaliar(ENVIAR_FRASE(frase));
  if (r !== "enviou") throw new Error("não enviou: " + r);
}

export const abrirProposta = async (pag) => JSON.parse(await pag.avaliar(ABRIR_PROPOSTA));
export const confirmarProposta = (pag) => pag.avaliar(CLICAR_CONFIRMAR);
export const clicarBotao = (pag, texto) => pag.avaliar(CLICAR_BOTAO(texto));
/* 24/11 (etapa 7 da identidade e posse): o dado que o Mestre pede, rolado como o jogador rola — o botão «Rolar» do
   cartão do chamado. Serve ao «antes» que prepara um furto (o d20 da bancada tem semente: o mesmo em toda rodada) */
export const rolar = (pag) => pag.avaliar(CLICAR_BOTAO("Rolar"));
