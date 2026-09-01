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

/* 1) a barra "Responder / VEZ DO MUNDO" some inteira; sobra o compositor único */
rep(`            {aguardandoMundo && !bloqueado && !rolagem ? (
              <div className="px-4 md:px-8 shrink-0" style={{ paddingRight: "68px", paddingBottom: "20px" }}>
                {/* responder move o mundo junto — você fala E o mundo vive o instante */}
                <div className="flex gap-2 rounded-2xl p-2 min-w-0 mb-2" style={{ background: T.panel, border: \`1px solid \${T.line}\` }}>
                  <input value={entrada} onChange={(e) => setEntrada(e.target.value)} onKeyDown={(e) => e.key === "Enter" && responderEMover(entrada)}
                    placeholder="Responder / falar…"
                    className="flex-1 bg-transparent outline-none tv-body text-[15px] px-3 min-w-0" style={{ color: T.ink }} />
                  <Botao primario pequeno desativado={!entrada.trim()} onClick={() => responderEMover(entrada)}>Responder →</Botao>
                </div>
                <div className="flex items-stretch gap-2">
                  <button onClick={vezDoMundo} className="tv-fade flex-1 rounded-2xl py-3 tv-mono text-sm flex items-center justify-center gap-2" style={{ background: T.amber, color: T.onAccent, fontWeight: 700, letterSpacing: "0.05em" }}>
                    🌍 VEZ DO MUNDO →{autoMundo && mundoRestante != null && <span className="text-[10px] font-normal opacity-80">{entrada.trim() ? "auto pausado (você está digitando)" : \`auto em \${mundoRestante}s\`}</span>}
                  </button>
                  <button onClick={() => setAutoMundo((v) => !v)} title={autoMundo ? "Turno do mundo automático: LIGADO (60s parado = o mundo vive) — toque para desligar" : "Turno do mundo automático: desligado — toque para ligar"}
                    className="tv-mono text-xs rounded-2xl px-3 shrink-0" style={{ background: T.panel, color: autoMundo ? T.ok : T.inkDim, border: \`1px solid \${T.line}\`, fontWeight: 600 }}>
                    {autoMundo ? "⏳" : "✋"}
                  </button>
                  <button onClick={() => setMostrarHoras((v) => !v)} title="Passar mais tempo" className="tv-mono text-xs rounded-2xl px-4 shrink-0" style={{ background: T.panel, color: T.amberSoft, border: \`1px solid \${T.line}\`, fontWeight: 600 }}>
                    🕐<span className="hidden md:inline"> Horas</span>
                  </button>
                </div>
              </div>
            ) : (
            <div`,
`            {/* v9.31: UM campo de escrita só. A barra "Responder / VEZ DO
                MUNDO" existia porque existiam dois turnos fora do combate; com
                um turno só, ela vira ruído — e o botão que pedia ao jogador
                para mandar o mundo viver some junto, porque o mundo já vive. */}
            {(
            <div`, "barra do mundo");

/* 2) os botões Viajar e Masmorra saem: o sistema abre os dois sozinho */
rep(`                {/* v9.14: era onClick={viajar}, que entrega o EVENTO do React
                    como \`destino\` — objeto truthy, e o envelope saía dizendo
                    "Estou a caminho de [object Object]". */}
                <button onClick={() => viajar("")} disabled={bloqueado || acampado} title="Seguir viagem: clima e encontro rolados pelas tabelas" className="tv-mono text-[11px] rounded-full px-3 py-1.5"
                  style={{ background: "transparent", color: T.amberSoft, border: \`1px solid \${T.line}\`, fontWeight: 600, opacity: (bloqueado || acampado) ? 0.4 : 1 }}>
                  🧭 Viajar
                </button>
                <button onClick={entrarMasmorra} disabled={bloqueado || acampado || !!masmorra} title="Explorar uma masmorra: salas roladas por tabela, tesouro e chefe por código" className="tv-mono text-[11px] rounded-full px-3 py-1.5"
                  style={{ background: "transparent", color: T.violetSoft, border: \`1px solid \${T.line}\`, fontWeight: 600, opacity: (bloqueado || acampado || masmorra) ? 0.4 : 1 }}>
                  🕳 Masmorra
                </button>
`,
`                {/* v9.31: os botões "Viajar" e "Masmorra" saíram. Desde o
                    rastro, os dois módulos abrem sozinhos quando o herói põe o
                    pé na estrada ou desce num covil — e um botão que faz o que
                    a própria ação já faz é uma segunda maneira de dizer a
                    mesma coisa, com o agravante de sugerir que sem ele não
                    acontece. A tela fica mais limpa e a regra, mais simples:
                    escreva o que você faz. */}
`, "botoes viajar/masmorra");

fs.writeFileSync(p, t, "utf8");
console.log("bloco 3 ok");
