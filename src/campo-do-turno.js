/* src/campo-do-turno.js (Fase T1-A, 4.ª fatia, 28/10/2026) — o gesto do campo

   ---------------- O GESTO DO CAMPO (R3) ----------------
   `Enter` manda e `Shift+Enter` quebra a linha. É o gesto mais repetido
   do jogo, e num `<input>` de uma linha ele era de graça: `Enter` era a
   única coisa que a tecla podia fazer. Passando a `<textarea>`, quebrar
   a linha passa a ser o comportamento NATIVO — e mandar o turno passa a
   ter de ser escrito. Trocá-lo em silêncio é o defeito que passa no
   build, passa na suíte de regra, e só o uso pega.

   Morava no topo do App.jsx, com nome e fora do componente, e a suíte
   `teste-r3-campo-do-turno` extraía-a do texto do arquivo para a correr.
   Mudou-se para cá sem mudar uma linha (a nota da trilha B,
   assercoes-de-texto.json, `paraOficial`): a suíte importa-a e corre os
   casos contra o código que vai para produção — o mesmo, sem extração.

   O TERCEIRO CASO é o que quase se esquece: com o teclado a compor um
   acento (o `^` de "você", o `~` de "não"), o `Enter` que fecha a
   composição NÃO é um pedido de turno. `isComposing` (e o 229 dos
   navegadores que ainda não o dizem) é o que separa os dois, e num jogo
   escrito em português isso não é um caso de canto. */
export function gestoDoCampo(e) {
  if (!e || e.key !== "Enter") return "nada";
  if (e.isComposing || e.keyCode === 229) return "nada";
  if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return "quebrar";
  return "mandar";
}
