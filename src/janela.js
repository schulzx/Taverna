/* ============================================================
   A JANELA ANCORADA (v9.162) — o histórico para de serrar o cache

   O prompt paga por byte, e o provedor cobra um décimo pelo que
   reconhece do turno anterior — desde que seja IDÊNTICO, byte a byte,
   do primeiro caractere em diante. A v9.153 arrumou o system prompt
   para isso (o volátil desceu todo para o fim). Sobrou a outra metade
   da conversa: o histórico.

   `slice(-30)` era uma serra: a cada turno a janela DESLIZAVA uma
   mensagem, o começo dela mudava, e tudo dali em diante — histórico
   inteiro — era cobrado cheio, todo turno, para sempre. Acrescentar no
   FIM preserva o prefixo; tirar do COMEÇO destrói.

   A âncora conserta isso: a janela começa num ponto FIXO e só cresce
   pelo fim. Quando fica comprida demais, a âncora salta de uma vez —
   o cache quebra UMA vez a cada salto, e não uma vez por turno.

   ---------------- A CONTA ----------------

   A âncora é função pura do comprimento: nada é guardado, nenhum save
   muda de formato, e a mesma conversa dá sempre a mesma janela.

     âncora(n) = ⌊(n − MIN) / SALTO⌋ × SALTO   (nunca negativa)

   Com MIN = 24 e SALTO = 24, a janela respira entre 24 e 47 mensagens
   e a âncora salta a cada 24 (≈ doze turnos, a duas mensagens por
   turno). A janela média fica em ~35 contra as 30 fixas de antes —
   maior no bruto, muito menor na fatura: o que antes era 30 mensagens
   cobradas cheias todo turno vira ~35 quase todas a um décimo.

   ---------------- POR QUE COMEÇAR NO JOGADOR ----------------

   Janela que abre com resposta do narrador é conversa começando pela
   metade — a primeira fala fica sem a pergunta que a causou, e há
   provedor que recusa histórico que não abre no usuário. O ajuste come
   no máximo uma mensagem, e só nos saltos.
   ============================================================ */

export const JANELA_MIN = 24;
export const SALTO_DA_ANCORA = 24;

export function janelaAncorada(historico) {
  const l = Array.isArray(historico) ? historico : [];
  const ancora = Math.max(0, Math.floor((l.length - JANELA_MIN) / SALTO_DA_ANCORA) * SALTO_DA_ANCORA);
  let corte = l.slice(ancora);
  while (corte.length && corte[0] && corte[0].role !== "user") corte = corte.slice(1);
  return corte;
}
