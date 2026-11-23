/* A INFRAESTRUTURA DA BANCADA DA TROCA
   Sobe, na árvore do projeto e sem dependência nova:
     1. um «Narrador de mentira» (servidor local) que responde às rotas /api com
        uma narração fixa e neutra — é ELE o destino do proxy do Vite, então
        nenhuma chamada de IA sai para a internet;
     2. o dev-server do Vite, com TAVERNA_API apontando para o de mentira;
     3. o Edge headless, com a porta de depuração (CDP) e um perfil descartável.
   Tudo o que sobe é registrado por PID e morre pelo PID (nada de matar por nome). */
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const EDGE = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find((p) => fs.existsSync(p));

export const NARRACAO_FIXA = "O Mestre escuta em silêncio, e a cena segue.";

/* O Narrador de mentira. Responde no formato do /api/narrador:
   { texto, provedor, uso }. `formato: "json"` pede o molde do Narrador
   ({ narrativa, ... }); a tarefa «leve» (Juiz, cronista…) recebe um objeto vazio. */
export function subirNarradorDeMentira(porta) {
  const chamadas = [];
  const servidor = http.createServer((req, res) => {
    let corpo = "";
    req.on("data", (d) => (corpo += d));
    req.on("end", () => {
      let j = {};
      try { j = JSON.parse(corpo || "{}"); } catch { /* corpo torto: registra assim mesmo */ }
      chamadas.push({ t: Date.now(), metodo: req.method, url: req.url, tarefa: j.tarefa || null, formato: j.formato || null, host: req.headers.host });
      res.setHeader("content-type", "application/json");
      if (!/^\/api\/narrador/.test(req.url || "")) { res.statusCode = 404; res.end(JSON.stringify({ erro: "rota sem Narrador de mentira" })); return; }
      let texto;
      if (j.formato === "json") texto = j.tarefa && j.tarefa !== "narrador" ? "{}" : JSON.stringify({ narrativa: NARRACAO_FIXA, mudancas: {} });
      else texto = NARRACAO_FIXA;
      res.end(JSON.stringify({ texto, provedor: "bancada", uso: { entrada: 0, saida: 0, cache: 0 } }));
    });
  });
  return new Promise((ok, falha) => {
    servidor.once("error", falha);
    servidor.listen(porta, "127.0.0.1", () => ok({ chamadas, parar: () => new Promise((r) => servidor.close(r)) }));
  });
}

const dorme = (ms) => new Promise((r) => setTimeout(r, ms));
async function esperarUrl(url, ms = 60000) {
  const fim = Date.now() + ms;
  while (Date.now() < fim) { try { const r = await fetch(url); if (r.ok) return true; } catch { /* ainda não */ } await dorme(400); }
  throw new Error("não subiu a tempo: " + url);
}

export async function subir({ portaVite = 5391, portaCdp = 9391, portaNarrador = 5392, log = () => {} } = {}) {
  if (!EDGE) throw new Error("Edge não encontrado");
  const pids = [];
  const narrador = await subirNarradorDeMentira(portaNarrador);
  const alvoApi = "http://127.0.0.1:" + portaNarrador;
  /* o Vite, direto pelo node (sem shell), com a API de mentira */
  const vite = spawn(process.execPath, [path.join(RAIZ, "node_modules", "vite", "bin", "vite.js"), "--port", String(portaVite), "--strictPort", "--host", "127.0.0.1"], {
    cwd: RAIZ, env: { ...process.env, TAVERNA_API: alvoApi }, stdio: ["ignore", "pipe", "pipe"], windowsHide: true,
  });
  pids.push(vite.pid);
  let logVite = "";
  vite.stdout.on("data", (d) => (logVite += d));
  vite.stderr.on("data", (d) => (logVite += d));
  await esperarUrl("http://127.0.0.1:" + portaVite + "/");
  log("vite no ar (pid " + vite.pid + ", porta " + portaVite + ", TAVERNA_API=" + alvoApi + ")");
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "bancada-perfil-"));
  const edge = spawn(EDGE, ["--headless=new", "--remote-debugging-port=" + portaCdp, "--user-data-dir=" + perfil, "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--window-size=1400,1000", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows", "about:blank"], { stdio: "ignore", windowsHide: true });
  pids.push(edge.pid);
  await esperarUrl("http://127.0.0.1:" + portaCdp + "/json/version");
  log("edge no ar (pid " + edge.pid + ", cdp " + portaCdp + ")");
  const matar = (pid) => { try { spawn("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore", windowsHide: true }); } catch { /* já morreu */ } };
  return {
    portaVite, portaCdp, alvoApi, narrador, pids, perfil,
    logVite: () => logVite,
    async parar() {
      /* o Edge se relança e o PID que o spawn devolve some: fecha-se pelo CDP e, se sobrar, pelos PIDs
         dos processos cuja linha de comando traz O MEU perfil (só os que esta bancada abriu) */
      try { const v = await (await fetch("http://127.0.0.1:" + portaCdp + "/json/version")).json(); const w = new WebSocket(v.webSocketDebuggerUrl); await new Promise((ok) => { w.onopen = ok; w.onerror = ok; }); w.send(JSON.stringify({ id: 1, method: "Browser.close" })); await dorme(800); } catch { /* já fechou */ }
      await new Promise((ok) => { const k = spawn("powershell", ["-NoProfile", "-Command", "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*" + path.basename(perfil) + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"], { stdio: "ignore", windowsHide: true }); k.on("exit", ok); k.on("error", ok); });
      matar(vite.pid);
      await narrador.parar().catch(() => {});
      await dorme(1500);
      try { fs.rmSync(perfil, { recursive: true, force: true }); } catch { /* o sistema limpa a pasta temporária */ }
    },
  };
}

/* uso solto: `node infra.mjs` sobe tudo e fica no ar (para explorar à mão) */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const s = await subir({ log: (m) => console.log(m) });
  console.log("PIDS", s.pids.join(","), "perfil", s.perfil);
  process.on("SIGINT", async () => { await s.parar(); process.exit(0); });
  setInterval(() => {}, 1e6);
}
