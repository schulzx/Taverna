/* ============================================================
   CONSTANTES DO JOGO (v9.244) — Taverna
   Gêneros, atributos, limites e o prompt do Mestre.
   Extraído do App.jsx na modularização.

   A PALETA E A FOLHA SAÍRAM DAQUI na v9.244: eram 156 linhas de CSS
   embaixo do arquivo que guarda XP por nível e teto de companheiro.
   Agora moram em `estilo.js`, que não importa nada — veja o cabeçalho
   de lá para o porquê.
   ============================================================ */
import { xpDoProximoNivel, XP_POR_DADIVA } from "./regras.js";

export const BRAND = "Taverna";
export const SLOGAN = "toda lenda começa aqui";

/* A VERSÃO, num lugar só (v9.146). Ela ficou parada em "v8.9 · economia
   de ação" da v8.9 até a v9.145, escrita à mão dentro de um JSX no meio
   do App — que é exatamente onde um número vai para ser esquecido.
   Aqui ela fica ao lado do resto do que a casa sabe sobre si mesma, e um
   varredor confere que o App não voltou a escrevê-la à mão. */
export const VERSAO = "v9.257";
export const LEVA = "o turno guardado";

export const XP_POR_NIVEL = (nivel) => xpDoProximoNivel(nivel) ?? XP_POR_DADIVA;
export const MOEDAS_INICIAIS = 15;
export const PONTOS_TOTAIS = 6;
export const ATRIBUTO_MAX_CRIACAO = 3;
export const ATRIBUTO_MAX = 5;
export const MAX_COMPANHEIROS = 4;

/* A PALETA E A FOLHA MUDARAM DE CASA (v9.244).

   `T` e todo o CSS foram para `estilo.js` — a mesa de design ganhou
   arquivo proprio, e `estilo.js` nao importa nada (este aqui importa
   `regras.js`, e o estilo nao tem por que arrastar regra junto).

   `T` CONTINUA SAINDO DAQUI, por reexport: quinze arquivos escrevem
   `import { T } from "./constantes.js"` e nenhum deles precisou mudar
   uma letra. O reexport e a ponte, e tem leitor de sobra.

   `FONT_CSS` NAO ganha ponte. Ele tinha exatamente dois leitores — o
   `App.jsx` e o `teste-arte.mjs` —, os dois repontados nesta mesma
   etapa. Um reexport sem leitor seria export morto no dia em que
   nascesse, e a catraca do `teste-ligacao` existe justamente para isso
   nao acontecer. Quem quer a folha pede `FOLHA` a `estilo.js`. */
export { T } from "./estilo.js";

export const GENEROS = [
  { id: "fantasia", label: "Fantasia medieval", dica: "Reinos, magia antiga, criaturas lendárias" },
  { id: "scifi", label: "Ficção científica", dica: "Naves, colônias estelares, IAs e alienígenas" },
  { id: "cyberpunk", label: "Cyberpunk", dica: "Megacorporações, implantes, ruas de neon" },
  { id: "horror", label: "Horror cósmico", dica: "Segredos proibidos, sanidade em risco" },
  { id: "posapoc", label: "Pós-apocalíptico", dica: "Ruínas, facções, sobrevivência" },
  { id: "steampunk", label: "Steampunk", dica: "Vapor, engrenagens, impérios voadores" },
  { id: "livre", label: "Universo próprio", dica: "Você descreve tudo do zero" },
];

export const ATRIBUTOS = [
  { id: "forca", nome: "Força", desc: "Poder físico, combate corpo a corpo" },
  { id: "destreza", nome: "Destreza", desc: "Agilidade, furtividade, precisão" },
  { id: "vigor", nome: "Vigor", desc: "Resistência, saúde, fôlego" },
  { id: "intelecto", nome: "Intelecto", desc: "Conhecimento, raciocínio, poder místico" },
  { id: "presenca", nome: "Presença", desc: "Carisma, persuasão, liderança" },
  { id: "percepcao", nome: "Percepção", desc: "Intuição, sentidos, vontade" },
];

/* ---------------- Prompt do Mestre ---------------- */
