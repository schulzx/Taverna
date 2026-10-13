/* O SERVIDOR DA FERRAMENTA DE CORTE — só na máquina de quem corta

   `node mente/figma/corte/servir.cjs` e abrir http://127.0.0.1:5798/ .
   Antes, `node mente/figma/corte/lista.mjs` escreve a `lista.json` que este
   serve (as matrizes vêm de `mente/figma/matrizes/`, fora do repositório).

   Faz quatro coisas, e nenhuma fora destas pastas:
   - GET  /                 a página (`cortar.html`)
   - GET  /lista.json       o manifesto com as matrizes achadas
   - GET  /valores.json     `mente/figma/retratos-medidos.json`, se existir
   - GET  /corte.json       o `cx`/`olhos` de `RETRATOS` (`src/retratos.js`): é
                            com ESTES que se corta, para o arquivo e a tabela
                            do jogo nunca discordarem do canto do recorte
   - GET  /fonte/<n>      o PNG da n-ésima matriz da lista
   - POST /webp/<tipo>/<arquivo>   grava `public/retratos/<tipo>/<arquivo>.webp`
   - POST /medidos          grava `medidos-bruto.json` aqui ao lado

   O nome do arquivo passa por `^[a-z0-9-]+$` e o tipo por especie|gente:
   a página não escreve fora de `public/retratos/`.
   Fora de `src/`, sem dependência: nada disto vai ao jogo. */
const http = require("http"), fs = require("fs"), path = require("path");

const AQUI = __dirname;
const RAIZ = path.join(AQUI, "..", "..", "..");
const DESTINO = path.join(RAIZ, "public", "retratos");
const PORTA = Number(process.env.PORTA || 5798);

const lista = () => JSON.parse(fs.readFileSync(path.join(AQUI, "lista.json"), "utf8"));
const corpo = (req) => new Promise((ok, falha) => {
  const partes = [];
  req.on("data", (p) => partes.push(p));
  req.on("end", () => ok(Buffer.concat(partes)));
  req.on("error", falha);
});
const manda = (res, cod, tipo, dado) => { res.writeHead(cod, { "Content-Type": tipo }); res.end(dado); };

http.createServer(async (req, res) => {
  try {
    const url = decodeURIComponent(req.url.split("?")[0]);
    if (req.method === "GET" && (url === "/" || url === "/cortar.html")) {
      return manda(res, 200, "text/html; charset=utf-8", fs.readFileSync(path.join(AQUI, "cortar.html")));
    }
    if (req.method === "GET" && url === "/lista.json") {
      return manda(res, 200, "application/json", JSON.stringify(lista()));
    }
    if (req.method === "GET" && url === "/valores.json") {
      const p = path.join(AQUI, "..", "retratos-medidos.json");
      return manda(res, 200, "application/json", fs.existsSync(p) ? fs.readFileSync(p) : "{}");
    }
    if (req.method === "GET" && url === "/corte.json") {
      const alvo = "file:///" + path.join(RAIZ, "src", "retratos.js").replace(/\\/g, "/") + "?t=" + Date.now();
      const tabela = await import(alvo);
      const valores = {};
      for (const r of tabela.RETRATOS) {
        const a = r.arquivo.match(/\/retratos\/(especie|gente)\/([a-z0-9-]+)\.webp$/);
        if (a) valores[a[1] + "/" + a[2]] = { cx: r.cx, olhos: r.olhos, origem: "tabela" };
      }
      return manda(res, 200, "application/json", JSON.stringify(valores));
    }
    let m = url.match(/^\/fonte\/(\d+)$/);
    if (req.method === "GET" && m) {
      const item = lista()[Number(m[1])];
      if (!item) return manda(res, 404, "text/plain", "sem matriz");
      return manda(res, 200, "image/png", fs.readFileSync(item.fonte));
    }
    m = url.match(/^\/webp\/(especie|gente)\/([a-z0-9-]+)$/);
    if (req.method === "POST" && m) {
      const dado = await corpo(req);
      if (dado.slice(0, 4).toString() !== "RIFF" || dado.slice(8, 12).toString() !== "WEBP") {
        return manda(res, 400, "text/plain", "nao e webp");
      }
      fs.mkdirSync(path.join(DESTINO, m[1]), { recursive: true });
      fs.writeFileSync(path.join(DESTINO, m[1], m[2] + ".webp"), dado);
      return manda(res, 200, "text/plain", String(dado.length));
    }
    m = url.match(/^\/folha\/([a-z0-9-]+)$/);
    if (req.method === "POST" && m) {
      const dado = await corpo(req);
      fs.mkdirSync(path.join(AQUI, "folhas"), { recursive: true });
      fs.writeFileSync(path.join(AQUI, "folhas", m[1] + ".png"), dado);
      return manda(res, 200, "text/plain", "ok");
    }
    if (req.method === "POST" && url === "/cortados") {
      /* o `cx` com que cada arquivo foi cortado: `teste-rosto-pintado` compara-o
         com a tabela do jogo, e fica vermelho se ela mudar sem novo corte */
      const dado = JSON.parse((await corpo(req)).toString("utf8"));
      const ordenado = {};
      for (const k of Object.keys(dado).sort()) ordenado[k] = dado[k];
      fs.writeFileSync(path.join(AQUI, "cortados.json"), JSON.stringify(ordenado, null, 1) + "\n");
      return manda(res, 200, "text/plain", "ok");
    }
    if (req.method === "POST" && url === "/medidos") {
      const dado = await corpo(req);
      JSON.parse(dado.toString("utf8"));
      fs.writeFileSync(path.join(AQUI, "medidos-bruto.json"), dado);
      return manda(res, 200, "text/plain", "ok");
    }
    manda(res, 404, "text/plain", "nada aqui");
  } catch (e) {
    manda(res, 500, "text/plain", String(e && e.message));
  }
}).listen(PORTA, "127.0.0.1", () => console.log("corte em http://127.0.0.1:" + PORTA + "/"));
