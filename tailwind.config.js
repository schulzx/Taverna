/* C2 (16/11/2026): o Tailwind sai da CDN (que avisava no console e baixava
   o compilador inteiro a cada visita) e passa a ser compilado no build. A
   configuração é a da CDN sem nada: o tema padrão, o preflight padrão. As
   classes vêm do texto de src/ — por isso uma classe montada por pedaços
   (`text-${x}`) não existe para ele; a varredura de C2 confirmou que o
   projeto não as tem (ver mente/diario.md, «sem versão — V5+C2»). */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};
