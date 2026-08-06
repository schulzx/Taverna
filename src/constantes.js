/* ============================================================
   CONSTANTES E TEMA (v8.6) — Taverna
   Paleta, fontes, gêneros, atributos e limites do jogo.
   Extraído do App.jsx na modularização.
   ============================================================ */
import { xpDoProximoNivel, XP_POR_DADIVA } from "./regras.js";

export const BRAND = "Taverna";
export const SLOGAN = "toda lenda começa aqui";

export const XP_POR_NIVEL = (nivel) => xpDoProximoNivel(nivel) ?? XP_POR_DADIVA;
export const MOEDAS_INICIAIS = 15;
export const PONTOS_TOTAIS = 6;
export const ATRIBUTO_MAX_CRIACAO = 3;
export const ATRIBUTO_MAX = 5;
export const MAX_COMPANHEIROS = 4;

export const T = {
  bg: "#0E0C15", panel: "#171322", panelSoft: "#1E1930", line: "#2E2745",
  ink: "#EAE4D6", inkDim: "#9B93AC",
  amber: "#E8A33D", amberSoft: "#F5C878", onAccent: "#1A1408",
  violet: "#8B7BD8", violetSoft: "#B0A5EC", onSecond: "#14101F",
  danger: "#D86A5B", ok: "#7BC98F",
};

export const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Spectral:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@400;600&display=swap');
.tv-display { font-family: 'Cormorant Garamond', Georgia, serif; }
.tv-body { font-family: 'Spectral', Georgia, serif; }
.tv-mono { font-family: 'JetBrains Mono', monospace; }
.tv-fade { animation: tvFade .5s ease both; }
@keyframes tvFade { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: none;} }
@keyframes tvGlow { 0%,100%{box-shadow:0 0 24px rgba(232,163,61,.25);} 50%{box-shadow:0 0 48px rgba(232,163,61,.55);} }
@keyframes tvShake { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-8deg)} 40%{transform:rotate(7deg)} 60%{transform:rotate(-5deg)} 80%{transform:rotate(4deg)} }
.tv-dice { animation: tvShake .35s linear infinite, tvGlow 1s ease infinite; }
.tv-pulse { animation: tvGlow 1.6s ease infinite; }
.tv-scroll::-webkit-scrollbar { width: 8px; }
.tv-scroll::-webkit-scrollbar-thumb { background: #2E2745; border-radius: 4px; }
@keyframes tvSlide { from { transform: translateX(24px); opacity: 0;} to { transform: none; opacity: 1;} }
.tv-slide { animation: tvSlide .25s ease both; }
`;

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
