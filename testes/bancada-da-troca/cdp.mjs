/* Cliente CDP mínimo (WebSocket nativo do Node 22+). Uma página, três coisas:
   avaliar JavaScript, navegar, e guardar o que o console e a rede disseram. */
const dorme = (ms) => new Promise((r) => setTimeout(r, ms));

export async function abrirPagina(portaCdp) {
  const lista = await (await fetch(`http://127.0.0.1:${portaCdp}/json`)).json();
  const alvo = lista.find((t) => t.type === "page");
  const ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise((ok, falha) => { ws.onopen = ok; ws.onerror = falha; });
  let id = 0;
  const pend = new Map();
  const consoleLog = []; /* { tipo, texto, t } */
  const rede = []; /* { url, metodo } só do que sai da página */
  const esperando = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); return; }
    if (d.method === "Runtime.consoleAPICalled") {
      const texto = (d.params.args || []).map((a) => (a.value !== undefined ? (typeof a.value === "string" ? a.value : JSON.stringify(a.value)) : a.description || "")).join(" ");
      consoleLog.push({ tipo: d.params.type, texto, t: Date.now() });
    } else if (d.method === "Runtime.exceptionThrown") {
      consoleLog.push({ tipo: "excecao", texto: JSON.stringify((d.params.exceptionDetails.exception || {}).description || d.params.exceptionDetails.text).slice(0, 400), t: Date.now() });
    } else if (d.method === "Network.requestWillBeSent") {
      rede.push({ url: d.params.request.url, metodo: d.params.request.method, t: Date.now() });
    } else if (d.method === "Page.loadEventFired") {
      for (const f of esperando.splice(0)) f();
    }
  };
  const enviar = (method, params = {}) => new Promise((ok, falha) => {
    const i = ++id;
    const timer = setTimeout(() => { pend.delete(i); falha(new Error("CDP sem resposta: " + method)); }, 90000);
    pend.set(i, (d) => { clearTimeout(timer); d.error ? falha(new Error(method + ": " + JSON.stringify(d.error))) : ok(d.result); });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  await enviar("Runtime.enable");
  await enviar("Page.enable");
  await enviar("Network.enable");
  await enviar("Emulation.setDeviceMetricsOverride", { width: 1400, height: 1000, deviceScaleFactor: 1, mobile: false });
  const avaliar = async (expressao) => {
    const r = await enviar("Runtime.evaluate", { expression: expressao, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error("JS: " + String((r.exceptionDetails.exception || {}).description || r.exceptionDetails.text).slice(0, 300));
    return r.result.value;
  };
  const navegar = async (url) => {
    const carregou = new Promise((ok) => esperando.push(ok));
    await enviar("Page.navigate", { url });
    await Promise.race([carregou, dorme(30000)]);
  };
  return {
    avaliar, navegar, enviar, consoleLog, rede,
    scriptNoCarregar: (fonte) => enviar("Page.addScriptToEvaluateOnNewDocument", { source: fonte }),
    fechar: () => { try { ws.close(); } catch { /* nada */ } },
  };
}
