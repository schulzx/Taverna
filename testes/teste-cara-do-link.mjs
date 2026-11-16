/* A CARA DO LINK (lote 2 do lançamento, C1, 15/11/2026).
   Quem recebe o link do Taverna vê, antes de abrir, o título, a frase e a
   imagem que o index.html declara. Esta suíte confere que as tags estão lá,
   que apontam para arquivos que existem em public/, e que a cor do tema é a
   do feltro (T.bg). Roda de testes/ (o rodar-tudo faz chdir). */
import { readFileSync, existsSync, statSync } from "node:fs";
import { T, LUZ_DA_MESA } from "../src/estilo.js";

let falhas = 0;
const ok = (cond, msg) => { if (!cond) { falhas++; console.log("✗ " + msg); } else console.log("✓ " + msg); };

const html = readFileSync("../index.html", "utf8");
const meta = (attr, nome) => {
  const re = new RegExp("<meta\\s+" + attr + "=\"" + nome.replace(/[:.]/g, "\\$&") + "\"\\s+content=\"([^\"]*)\"", "i");
  const m = html.match(re);
  return m ? m[1] : null;
};

const TITULO = "Taverna — toda lenda começa aqui";
const FRASE = "Um RPG de mesa em que o Mestre não inventa: cada dado, cada moeda e cada morte são verdade.";

ok(html.includes("<title>" + TITULO + "</title>"), "o título da aba");
ok(meta("name", "description") === FRASE, "meta description");
ok(meta("property", "og:title") === TITULO, "og:title");
ok(meta("property", "og:description") === FRASE, "og:description");
ok(meta("property", "og:type") === "website", "og:type");
ok(meta("property", "og:image") === "/imagem-de-link.png", "og:image pelo caminho de raiz");
ok(meta("name", "twitter:card") === "summary_large_image", "twitter:card grande");
/* 16/11 · V5+C2 (F3 §5): a asserção MUDOU de cor, e o motivo fica aqui — a
   chegada e a criação acontecem à noite, e o desenho pôs o theme-color no
   feltro da noite (LUZ_DA_MESA.noite.feltro, #0F1E16), o mesmo da abertura
   instantânea. O manifesto (abaixo) continua T.bg: é a cor da mesa de dia,
   a do jogo instalado. */
ok((meta("name", "theme-color") || "").toLowerCase() === String(LUZ_DA_MESA.noite.feltro).toLowerCase(), "theme-color é o feltro da noite (LUZ_DA_MESA.noite.feltro)");

const links = [...html.matchAll(/<link\s+rel="([^"]+)"[^>]*href="([^"]+)"/g)].map((m) => ({ rel: m[1], href: m[2] }));
ok(links.some((l) => l.rel === "icon" && l.href.endsWith(".svg")), "ícone SVG");
ok(links.some((l) => l.rel === "icon" && l.href.endsWith(".png")), "ícone PNG");
ok(links.some((l) => l.rel === "apple-touch-icon"), "apple-touch-icon");
ok(links.some((l) => l.rel === "manifest"), "manifest");

/* todo arquivo apontado existe em public/ e não é vazio */
const apontados = [...links.map((l) => l.href), meta("property", "og:image")].filter(Boolean);
for (const h of apontados) {
  const p = "../public" + h;
  ok(existsSync(p) && statSync(p).size > 0, "existe: " + h);
}

const man = JSON.parse(readFileSync("../public/manifest.webmanifest", "utf8"));
ok(man.lang === "pt-BR" && man.short_name === "Taverna", "manifest em PT-BR com nome curto");
ok(String(man.theme_color).toLowerCase() === String(T.bg).toLowerCase(), "manifest com a cor do feltro");
for (const i of man.icons || []) ok(existsSync("../public" + i.src), "ícone do manifest existe: " + i.src);

if (falhas) { console.log(`\n${falhas} falha(s)`); process.exit(1); }
console.log("\ncara do link: tudo no lugar");
