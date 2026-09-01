/* ============================================================
   CONSTANTES E TEMA (v8.6) — Taverna
   Paleta, fontes, gêneros, atributos e limites do jogo.
   Extraído do App.jsx na modularização.
   ============================================================ */
import { xpDoProximoNivel, XP_POR_DADIVA } from "./regras.js";

export const BRAND = "Taverna";
export const SLOGAN = "toda lenda começa aqui";

/* A VERSÃO, num lugar só (v9.146). Ela ficou parada em "v8.9 · economia
   de ação" da v8.9 até a v9.145, escrita à mão dentro de um JSX no meio
   do App — que é exatamente onde um número vai para ser esquecido.
   Aqui ela fica ao lado do resto do que a casa sabe sobre si mesma, e um
   varredor confere que o App não voltou a escrevê-la à mão. */
export const VERSAO = "v9.146";
export const LEVA = "o custo do turno";

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

/* ---------------- A CORTIÇA E O PAPEL (v9.127) ----------------
   O mural era uma lista de retângulos iguais dentro de um painel igual a
   todos os outros. Ele é a única tela do jogo que representa um OBJETO do
   mundo — uma tábua com papéis pregados — e não custa nada dizer isso.

   Tudo aqui é gradiente e sombra: nem um arquivo de imagem entra no
   repositório, e a cortiça continua sendo cortiça no telefone e no monitor.
   E nada de cortiça bege com papel creme: o jogo é âmbar sobre violeta
   escuro, e uma tábua clara no meio disso não seria charme, seria mancha. */
.tv-cortica {
  background-color: #1A1424;
  background-image:
    radial-gradient(rgba(232,163,61,.13) 1.1px, transparent 1.6px),
    radial-gradient(rgba(139,123,216,.11) 1px, transparent 1.5px),
    radial-gradient(rgba(234,228,214,.07) 1.2px, transparent 1.7px),
    radial-gradient(ellipse at 22% 18%, rgba(232,163,61,.05), transparent 55%),
    radial-gradient(ellipse at 78% 72%, rgba(139,123,216,.05), transparent 55%);
  background-size: 17px 17px, 29px 25px, 11px 21px, 100% 100%, 100% 100%;
  background-position: 0 0, 7px 11px, 3px 5px, 0 0, 0 0;
  box-shadow: inset 0 0 46px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.04);
  border: 7px solid #3B2A1B;
  border-radius: 14px;
  outline: 1px solid rgba(150,112,66,.4);
  outline-offset: -8px;
}
.tv-cartaz {
  background-image: linear-gradient(155deg, #241D33 0%, #1C1729 62%, #191426 100%);
  border: 1px solid rgba(232,163,61,.16);
  box-shadow: 0 7px 16px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.04);
  transition: transform .18s ease, box-shadow .18s ease;
}
/* o giro fica no embrulho e o levantar no papel: assim o passar do dedo
   endireita o cartaz sem brigar com o ângulo que ele tem parado */
.tv-pregado:hover .tv-cartaz { transform: translateY(-3px); box-shadow: 0 13px 26px rgba(0,0,0,.62); }
/* o percevejo atravessa o papel, e não paira acima dele: em cima da borda
   ele vira uma continha solta no ar. Fica DENTRO do cartaz, com a sombra
   curta que uma cabeça de alfinete faz no papel. */
.tv-percevejo {
  position: absolute; top: 6px; left: 50%; margin-left: -6px;
  width: 12px; height: 12px; border-radius: 50%;
  background: radial-gradient(circle at 34% 28%, #FFE2AC, #D98F22 58%, #6E4207);
  box-shadow: 0 1px 2px rgba(0,0,0,.75), 0 0 0 1px rgba(0,0,0,.45), 0 3px 5px rgba(0,0,0,.35);
}
.tv-percevejo.tv-roxo { background: radial-gradient(circle at 34% 28%, #E4DEFF, #8A78D8 58%, #3B3072); }

/* A VINHETA: o canto da tela escurece de leve, e o meio — onde a narração
   acontece — parece iluminado. É a coisa mais barata que existe para dar
   profundidade, e some sozinha em quem tiver o brilho baixo. */
.tv-vinheta {
  position: fixed; inset: 0; pointer-events: none; z-index: 1;
  background: radial-gradient(120% 85% at 50% 42%, transparent 52%, rgba(4,3,8,.45) 100%);
}
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
