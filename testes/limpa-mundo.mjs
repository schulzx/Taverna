import fs from "fs";
const p = "../src/App.jsx";
let t = fs.readFileSync(p, "utf8");
const NL = "\r\n";
function rep(a, b, rot) {
  const A = a.split("\n").join(NL);
  const B = b.split("\n").join(NL);
  if (!t.includes(A)) throw new Error("NAO ACHOU: " + rot);
  t = t.replace(A, B);
}

rep("  const [aguardandoMundo, setAguardandoMundo] = useState(false);\n", "", "estado");
rep("  const modoMundoRef = useRef(0);           // rotação de tipos de cena\n  const urgenciaRef = useRef(0);            // quantas cenas recentes usaram urgência\n", "", "modo/urgencia");
rep("  const ehAcaoMundoRef = useRef(false); // marca que o próximo enviar é a vez do mundo\n", "", "ehAcao");
rep("    if (combateRef.current) { combateRef.current = null; setCombate(null); combateOciosoRef.current = 0; }\n    setAguardandoMundo(false);\n    definirAcampado(true);",
    "    if (combateRef.current) { combateRef.current = null; setCombate(null); combateOciosoRef.current = 0; }\n    definirAcampado(true);", "acampar");

/* o detector de urgência era só para o prompt da vez do mundo */
rep(`    {
      const nrt = (resp.narrativa || "").toLowerCase();
      const marcas = /irromp|invade o|invadem o|arromb/.test(nrt)
        || /(porta|portas)[^.]{0,40}(se abre|se abrem|escancar)/.test(nrt)
        || /(mensageiro|arauto|batedor|soldado)[^.]{0,40}(ofegante|corre|irrompe|chega gritando)/.test(nrt)
        || /(arrast|jogam|atiram)[^.]{0,40}(aos seus pés|para dentro)/.test(nrt)
        || /(urgênc|urgente|emergênc|com pressa|sem fôlego)/.test(nrt)
        || /(interromp|é rompid|foi rompid|se lança (pelo|para)|surge de repente|de súbito)/.test(nrt);
      urgenciaRef.current = marcas ? urgenciaRef.current + 1 : 0;
    }
`, "", "detector de urgencia");

/* vezDoMundo e responderEMover morrem inteiros */
rep(`  const vezDoMundo = () => {
    if (bloqueado || acampadoRef.current) return;
    ehAcaoMundoRef.current = true;
    setAguardandoMundo(false);
    pushMsgs([{ autor: "sistema", texto: "🌍 O mundo vive…" }]);
    const modo = MODOS_MUNDO[modoMundoRef.current % MODOS_MUNDO.length];
    modoMundoRef.current += 1;
    tiquear("turno_mundo", { porque: "o mundo se mexeu" });
    enviar(\`[VEZ DO MUNDO] \${instrucaoMundo(modo, urgenciaRef.current >= 1)}\`, personagem);
  };
`, "", "vezDoMundo");

rep(`  /* RESPONDER + VEZ DO MUNDO ao mesmo tempo: sua fala é conduzida E o mundo
     vive o mesmo instante (pessoas agem e falam, coisas acontecem no presente). */
  const responderEMover = (texto) => {`, `  /* NÃO EXISTE MAIS "responderEMover" (v9.31): havia dois campos de escrita
     porque havia dois turnos. Com um turno só, há um campo só — e a porta dos
     fundos que pulava a cadeia de interceptação fecha junto. */
  const responderEMoverRemovido = (texto) => {`, "marca responder");

fs.writeFileSync(p, t, "utf8");
console.log("bloco 1 ok");
