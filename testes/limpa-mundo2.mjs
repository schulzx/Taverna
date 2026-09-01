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

rep(`  /* NÃO EXISTE MAIS "responderEMover" (v9.31): havia dois campos de escrita
     porque havia dois turnos. Com um turno só, há um campo só — e a porta dos
     fundos que pulava a cadeia de interceptação fecha junto. */
  const responderEMoverRemovido = (texto) => {
    const fala = (texto || "").trim();
    if (!fala || bloqueado) return;
    /* v9.18: o campo "Responder" da vez do mundo é outro caminho de entrada, e
       ele não passava pelo interceptador de comandos — digitar "/curar" ali
       mandava a barra literal para o Mestre. Comando é comando em qualquer
       campo; o Mestre nunca vê nenhum dos dois. */
    if (fala.startsWith("/")) { setEntrada(""); if (executarComando(fala)) return; }
    /* v9.30: e o resto da cadeia também. Responder ao mundo dizendo "sigo para
       Rio do Sul" ou "conjuro Teleporte para Aldoria" é a mesma coisa que
       dizê-lo no campo de ação — só o rótulo do botão muda. */
    setEntrada("");
    if (interceptarMovimento(fala)) return;
    ehAcaoMundoRef.current = true;
    pushMsgs([{ autor: "jogador", texto: fala }]);
    const modo = MODOS_MUNDO[modoMundoRef.current % MODOS_MUNDO.length];
    modoMundoRef.current += 1;
    enviar(\`[RESPONDO E O MUNDO VIVE] Eu falo: "\${fala}". \${instrucaoMundo(modo, urgenciaRef.current >= 1)}\`, personagem);
  };

  /* TURNO DO MUNDO SEMI-AUTOMÁTICO (v7.0): depois da sua ação o mundo fica
     "na iminência" por 60s. Se você digitar, o relógio pausa — você sempre
     tem a chance de responder. Se nada acontecer, o mundo vive sozinho.
     Pode ser desligado no botão ao lado. */
  const [autoMundo, setAutoMundo] = useState(true);
  const mundoAutoDesdeRef = useRef(null);
  const [tickMundo, setTickMundo] = useState(0);
  useEffect(() => {
    if (!aguardandoMundo) { mundoAutoDesdeRef.current = null; return; }
    if (!mundoAutoDesdeRef.current) mundoAutoDesdeRef.current = Date.now();
    if (!autoMundo) return;
    const t = setInterval(() => {
      setTickMundo((x) => x + 1);
      if (bloqueado || rolagem || combateRef.current || acampadoRef.current) return;
      if ((entrada || "").trim()) return; // você está digitando — o mundo espera
      if (Date.now() - mundoAutoDesdeRef.current >= 60 * 1000) vezDoMundo();
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aguardandoMundo, autoMundo, entrada]); // bloqueado/rolagem lidos só no callback (declarados adiante no componente)
  const mundoRestante = (aguardandoMundo && autoMundo && mundoAutoDesdeRef.current)
    ? Math.max(0, 60 - Math.floor((Date.now() - mundoAutoDesdeRef.current) / 1000))
    : null;
`,
`  /* O TEMPORIZADOR MORREU (v9.31). Ele existia para resolver um problema que
     deixou de existir: o mundo ficava "na iminência" 60 segundos porque, sem
     um turno da IA, nada acontecia. Hoje o que faz o mundo viver são os
     sistemas — relógios andam, missões conferem, eventos nascem, o arco vira
     — e eles rodam no turno normal, de graça. Um relógio na tela cobrando uma
     ação que o jogador não precisa tomar era pressa sem motivo. */
`, "temporizador");

fs.writeFileSync(p, t, "utf8");
console.log("bloco 2 ok");
