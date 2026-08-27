import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/* O SERVIDOR DE DESENVOLVIMENTO NÃO TEM `/api`.

   `api/narrador.js` e `api/voz.js` são funções da Vercel: existem no deploy
   e não existem no `vite dev`. Sem isto, jogar localmente significa jogar
   sem Mestre — o que esconde justamente os defeitos que só aparecem com a
   IA no meio.

   A saída é o desenvolvimento falar com o `/api` que JÁ ESTÁ NO AR. A
   chave continua onde sempre esteve, na variável de ambiente da Vercel, e
   nunca passa por aqui nem pelo navegador.

   `TAVERNA_API` sobrepõe o endereço quando se quer apontar para outro
   deploy (uma prévia, um branch). */
const API = process.env.TAVERNA_API || "https://taverna-sooty.vercel.app";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { target: API, changeOrigin: true, secure: true },
    },
  },
});
