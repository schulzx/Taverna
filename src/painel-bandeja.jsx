/* ============================================================
   A BANDEJA (04/11/2026) — src/painel-bandeja.jsx

   A faixa da mesa onde os dados pousam, entre a página e o campo. A pessoa:
   «um rpg precisa de constantes rolagens… além de que são diferentes dados
   jogados». Cada dado tem a forma dele e a cor do papel que tem no lance.

   A FORMA É DO `desenho` (Mesa C, Figma `243:46` · `243:72` · `244:613`;
   formas.md §«A mesa à luz de vela (C)» §4–§5), e mora em estilo.js:
   FORMAS_DO_DADO, PAPEL_DO_DADO, BANDEJA, MOVIMENTO_DO_DADO. Nenhum número de
   forma aqui dentro.

   CADA ESTADO TEM UMA FORMA ALÉM DA COR (quem não vê cor lê-o):
     rolando — rodado, sem anel, o número a trocar (teatro: o resultado já
               veio da semente; a peça NUNCA sorteia);
     sucesso — anel contínuo `ok` e o selo ✓;
     falha   — anel TRACEJADO `danger`, o dado apagado, o selo ✕;
     crítico — anel âmbar forte, oito raios e o selo ✦;
     desastre — a racha no corpo, anel `danger` forte e o selo !.
   E ao lado vai sempre a frase: a conta e o veredito em letra.

   DUAS ALTURAS: FRESCA (logo depois do lance) e RECOLHIDA (o jogador já
   mandou outro turno — só a fileira pequena; a mesa lembra o que saiu).

   O SOM (TE, decisão da pessoa de 09/11; som-da-mesa.js): o lance novo
   soa quando POUSA — no fim da rolagem, ou logo, com o reduce (o som fica
   com quem pediu menos movimento). O que já rolou no Véu (jaRolou) não
   soa aqui: soou lá. Um som que estoura cala-se; o dado pousa na mesma.
   ============================================================ */
import { useCallback, useEffect, useRef, useState } from "react";
import { T, TIPOS, FORMAS_DO_DADO, PAPEL_DO_DADO, BANDEJA, MOVIMENTO_DO_DADO, GOLPE_SENTIDO, SOLEIRA_DO_MOMENTO, CHAMADO_DO_MESTRE, PALAVRAS_DO_QUADRO, alfa } from "./estilo.js";
/* QQ (§QQ 4): o chamado que vira uma carta leva o leque do quadro — o mesmo
   glifo do sinal da barra, não um segundo */
import { LequeDoQuadro } from "./painel-quadro.jsx";
import { Glifo, FacesDoD20, precoDoChamado } from "./ui.jsx";
/* MC (10/11): o texto do chamado é do motor — «Rolar», o dado, a espera */
import { O_CHAMADO } from "./motor/o-mestre-chama.js";
/* CB 15 (decisão do coordenador, 09/11): o d20 do ataque rola AQUI, com as
   faces que acertam acesas ANTES de pousar («precisas de 6+»). O lançamento
   do golpe (`lancamentoDoAtaque`, motor/a-bandeja.js) traz `golpe`,
   `acertam` e `criticoEm`; as faces são as mesmas que a coluna acende
   (`golpePorExtenso`). Rola GOLPE_SENTIDO.dadoNaBandeja, um toque na bandeja
   salta, e nada disto prende a entrada: o golpe já está aplicado. */
import { golpePorExtenso } from "./batalha-na-tela.js";
import { aLinhaDoLancamento, NOME_DO_DESFECHO } from "./motor/a-bandeja.js";
import { tocarDado } from "./som-da-mesa.js";

/* o dado pousou: o som, e nunca o turno */
const soarDado = () => { try { tocarDado(); } catch { /* um som que estoura cala-se */ } };

/* o crítico não tem letra: a faísca desenha-se (FAISCA), a casa não pede glifo à fonte */
const SELO = { sucesso: "✓", falha: "✕", critico: "", desastre: "!" };
const TEM_SELO = { sucesso: true, falha: true, critico: true, desastre: true };
const FAISCA = "M0 -1 L0.28 -0.28 L1 0 L0.28 0.28 L0 1 L-0.28 0.28 L-1 0 L-0.28 -0.28 Z";
const corDoSelo = (d) => (d === "sucesso" ? T.ok : d === "critico" ? T.amber : T.danger);
/* a cor da palavra do desfecho (a Bandeja e o chamado dizem-na igual) */
const corDoDesfecho = (d) => (d === "critico" ? T.amberSoft : d === "sucesso" ? T.ok : d === "falha" || d === "desastre" ? T.danger : T.inkMeio);
/* a palavra do desfecho com o seu glifo: ✦ desenhado no crítico, o selo nos outros */
function PalavraDoDesfecho({ desfecho, cor }) {
  const nome = NOME_DO_DESFECHO[desfecho] || "";
  if (!nome) return null;
  return <>{desfecho === "critico" ? <><Glifo nome="faisca" tamanho={14} cor={cor} />{" "}</> : SELO[desfecho] ? `${SELO[desfecho]} ` : ""}{nome}</>;
}
const RACHA = "M30 6 L26 18 L33 24 L27 36 L31 46";
const RAIOS = [0, 45, 90, 135, 180, 225, 270, 315];

const semMovimento = () => {
  try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch { return false; }
};

/* Um corpo de dado (um d10 do d100 também): a forma, as facetas e o número.
   Exportado (AR 12, 07/11): o dado de uso dos mantimentos é este mesmo corpo,
   papel uso — não se desenha um segundo dado. */
export function Corpo({ faces, legenda, papel, tam, desfecho = "livre", rolando = false, apagado = false }) {
  const f = FORMAS_DO_DADO[faces] || FORMAS_DO_DADO[20];
  const p = PAPEL_DO_DADO[papel] || PAPEL_DO_DADO.teste;
  const cor = T[p.corpo], tinta = T[p.numero];
  const tamDaLetra = String(legenda).length > 1 && faces === 10 ? FORMAS_DO_DADO[100].tamDezenas : f.tam;
  const opacidade = apagado ? BANDEJA.falhaApagada : desfecho === "falha" && !rolando ? BANDEJA.falhaApagada + 0.2 : 1;
  return (
    <svg width={tam} height={tam} viewBox="0 0 48 48" aria-hidden="true" style={{ flex: "none", overflow: "visible", opacity: opacidade,
      transform: rolando ? "rotate(-18deg)" : "none", transition: `transform ${MOVIMENTO_DO_DADO.pousar}ms ease-out` }}>
      {f.retangulo
        ? <rect x={f.retangulo.x} y={f.retangulo.y} width={f.retangulo.lado} height={f.retangulo.lado} rx={f.retangulo.raio} fill={cor} stroke={tinta} strokeOpacity={BANDEJA.alfaDoTraco} strokeWidth={BANDEJA.traco} strokeLinejoin="round" />
        : <polygon points={f.corpo} fill={cor} stroke={tinta} strokeOpacity={BANDEJA.alfaDoTraco} strokeWidth={BANDEJA.traco} strokeLinejoin="round" />}
      {(f.facetas || []).map((d, i) => <path key={i} d={d} fill="none" stroke={tinta} strokeOpacity={BANDEJA.alfaDaFaceta} strokeWidth="1" />)}
      {desfecho === "desastre" && !rolando && <path d={RACHA} fill="none" stroke={T.perigoFundo} strokeWidth="2" strokeLinecap="round" />}
      <text x={f.numero[0]} y={f.numero[1]} textAnchor="middle" dominantBaseline="central"
        fontFamily="'JetBrains Mono', ui-monospace, monospace" fontWeight="700" fontSize={tamDaLetra} fill={tinta}>{legenda}</text>
    </svg>
  );
}

/* A marca do desfecho por cima do dado: o anel (contínuo, tracejado, forte),
   os raios do crítico e o selo do canto. */
function Marca({ desfecho, tam, largura = tam }) {
  if (!TEM_SELO[desfecho]) return null;
  const cor = desfecho === "critico" ? T.amber : desfecho === "sucesso" ? T.ok : T.danger;
  const forte = desfecho === "critico" || desfecho === "desastre";
  const cx = largura / 2, cy = tam / 2, rx = largura / 2 + 4, ry = tam / 2 + 4;
  return (
    <svg className="tv-dado-veredito" width={largura + 16} height={tam + 16} viewBox={`-8 -8 ${largura + 16} ${tam + 16}`} aria-hidden="true"
      style={{ position: "absolute", left: -8, top: -8, overflow: "visible", pointerEvents: "none", animationDuration: `${MOVIMENTO_DO_DADO.veredito}ms` }}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={cor} strokeWidth={forte ? BANDEJA.anelForte : BANDEJA.anel}
        strokeDasharray={desfecho === "falha" ? "4 3" : undefined} />
      {desfecho === "critico" && RAIOS.map((g) => {
        const a = (g * Math.PI) / 180;
        return <line key={g} x1={cx + Math.cos(a) * (rx + 3)} y1={cy + Math.sin(a) * (ry + 3)} x2={cx + Math.cos(a) * (rx + 8)} y2={cy + Math.sin(a) * (ry + 8)} stroke={T.amber} strokeWidth="2" strokeLinecap="round" />;
      })}
      <g transform={`translate(${largura - BANDEJA.selo / 2 + 2} ${-BANDEJA.selo / 2 + 4})`}>
        <circle cx={BANDEJA.selo / 2} cy={BANDEJA.selo / 2} r={BANDEJA.selo / 2} fill={corDoSelo(desfecho)} stroke={T.pagina} strokeWidth="2" />
        {desfecho === "critico"
          ? <path d={FAISCA} transform={`translate(${BANDEJA.selo / 2} ${BANDEJA.selo / 2}) scale(${BANDEJA.selo * 0.32})`} fill={T.onAccent} />
          : <text x={BANDEJA.selo / 2} y={BANDEJA.selo / 2} textAnchor="middle" dominantBaseline="central" fontSize={BANDEJA.selo * 0.62} fontWeight="700" fill={T.onAccent}>{SELO[desfecho]}</text>}
      </g>
    </svg>
  );
}

/* Um dado do lance. O d100 é dois d10 (dezenas e unidades), com a marca à volta dos dois.
   Exportado (CB 17.1, 09/11): o d20 que rola no alvo (`DadoNoAlvo`, grade-de-batalha.jsx)
   é este mesmo dado — não se desenha um segundo. Nada muda na Bandeja de fora da luta. */
export function DadoDoLance({ d, tam, rolando, desfecho, troca, classeRola = "tv-dado-rola", atraso = 0 }) {
  const papel = d.papel;
  /* MC: o chamado rola no lugar (tv-chamado-rola), e o dado da mordida entra `atraso` ms depois */
  const classe = rolando ? classeRola : "tv-dado-pousa";
  const tempo = atraso > 0 ? { animationDelay: `${atraso}ms` } : null;
  if (d.faces === 100) {
    const v = d.valor % 100;
    const dz = rolando ? String(((troca * 3) % 10) * 10).padStart(2, "0") : String(Math.floor(v / 10) * 10).padStart(2, "0");
    const un = rolando ? String((troca * 7) % 10) : String(v % 10);
    return (
      <span className={classe} style={{ position: "relative", display: "inline-flex", gap: 4, ...tempo }}>
        <Corpo faces={10} legenda={dz} papel={papel} tam={tam} rolando={rolando} desfecho={desfecho} apagado={d.posto} />
        <Corpo faces={10} legenda={un} papel={papel} tam={tam} rolando={rolando} desfecho={desfecho} apagado={d.posto} />
        {!rolando && !d.posto && <Marca desfecho={desfecho} tam={tam} largura={tam * 2 + 4} />}
      </span>
    );
  }
  const legenda = rolando ? String(((troca * 7 + d.faces) % d.faces) + 1) : String(d.valor);
  return (
    <span className={classe} style={{ position: "relative", display: "inline-flex", ...tempo }}>
      <Corpo faces={d.faces} legenda={legenda} papel={papel} tam={tam} rolando={rolando} desfecho={desfecho} apagado={d.posto} />
      {!rolando && !d.posto && <Marca desfecho={desfecho} tam={tam} />}
    </span>
  );
}

/* O RELÓGIO DE UM LANCE (MC · 10/11; formas.md §MC 4) — saiu de dentro da
   Bandeja para que o chamado do Mestre role com A MESMA lógica, e não com uma
   cópia: o lance novo rola por MOVIMENTO_DO_DADO.rolar (o golpe, por
   GOLPE_SENTIDO.dadoNaBandeja) e o número troca a cada `troca` ms; o que já
   rolou no Véu (`jaRolou`) pousa logo e não soa; com reduce, tudo pousa já
   com o número final. `pousar()` faz o dado pousar agora (o toque durante a
   rolagem). `aoPousar` (opcional) é chamado uma vez, com o lance, quando o
   lance novo pousa — é aí que o App chama o Narrador (§MC 3) —, e um aoPousar
   que estoura cala-se. Devolve { rolando, troca, pousar }. */
export function useLance(lancamento, aoPousar = null) {
  const n = lancamento ? lancamento.n : 0;
  const [rolandoN, setRolandoN] = useState(0);
  const [troca, setTroca] = useState(0);
  const pousarRef = useRef(null);
  const aoPousarRef = useRef(aoPousar);
  aoPousarRef.current = aoPousar;
  useEffect(() => {
    const pousou = () => { soarDado(); try { if (typeof aoPousarRef.current === "function") aoPousarRef.current(lancamento); } catch { /* nunca custa o turno */ } };
    if (!lancamento || lancamento.jaRolou) { setRolandoN(0); return undefined; }
    if (semMovimento()) { setRolandoN(0); pousou(); return undefined; }
    setRolandoN(n); setTroca(0);
    const inicio = Date.now();
    const passo = setInterval(() => setTroca(Math.floor((Date.now() - inicio) / MOVIMENTO_DO_DADO.troca)), MOVIMENTO_DO_DADO.troca);
    let feito = false;
    const pousar = () => { if (feito) return; feito = true; clearInterval(passo); clearTimeout(fim); setRolandoN(0); pousou(); pousarRef.current = null; };
    const fim = setTimeout(pousar, lancamento.golpe ? GOLPE_SENTIDO.dadoNaBandeja : MOVIMENTO_DO_DADO.rolar);
    pousarRef.current = pousar;
    return () => { clearInterval(passo); clearTimeout(fim); pousarRef.current = null; };
  }, [n]); // eslint-disable-line react-hooks/exhaustive-deps
  const pousar = useCallback(() => { try { if (pousarRef.current) pousarRef.current(); } catch { /* saltar nunca custa o turno */ } }, []);
  return { rolando: !!lancamento && rolandoN === n, troca, pousar };
}

export function Bandeja({ lancamentos = [], fresca = true }) {
  const lista = Array.isArray(lancamentos) ? lancamentos.filter(Boolean) : [];
  const ultimo = lista[0] || null;
  const n = ultimo ? ultimo.n : 0;
  const { rolando, troca, pousar } = useLance(ultimo);
  if (!ultimo) return null;
  const linha = aLinhaDoLancamento(ultimo);
  const desfecho = NOME_DO_DESFECHO[ultimo.desfecho] || "";
  const corD = corDoDesfecho(ultimo.desfecho);
  const anteriores = lista.slice(1);

  if (!fresca) {
    return (
      <div role="group" aria-label={`Últimos dados: ${lista.map(aLinhaDoLancamento).join("; ")}`}
        style={{ display: "flex", alignItems: "center", gap: BANDEJA.espaco + 4, padding: "4px 2px" }}>
        {lista.map((l, i) => (
          <span key={l.n} style={{ display: "inline-flex", gap: 2, opacity: i === 0 ? 0.9 : 0.5 }}>
            {l.dados.filter((d) => !d.posto).slice(0, 3).map((d, j) => <Corpo key={j} faces={d.faces === 100 ? 10 : d.faces} legenda={d.faces === 100 ? String(d.valor % 10) : String(d.valor)} papel={d.papel} tam={BANDEJA.dadoPequeno} />)}
          </span>
        ))}
      </div>
    );
  }

  const tam = ultimo.dados.length > 3 ? BANDEJA.dado - 12 : BANDEJA.dado;
  /* o golpe: as 20 faces, as que acertam acesas; pousado, a que saiu marcada */
  const doGolpe = ultimo.golpe && Array.isArray(ultimo.acertam) ? golpePorExtenso({ faces: ultimo.acertam, criticoEm: ultimo.criticoEm }) : null;
  const natural = (ultimo.dados.find((d) => !d.posto) || {}).valor;
  return (
    <div className="tv-fade tv-bandeja" role="group" aria-label="Os dados na mesa"
      onClick={rolando ? pousar : undefined}
      title={rolando ? "toque para o dado pousar já" : undefined}
      style={{ display: "flex", alignItems: "center", gap: BANDEJA.espaco + 4, padding: `0 ${BANDEJA.espaco + 6}px`, borderRadius: BANDEJA.raio,
        border: `1px solid ${T.line}`, background: T.pagina, boxShadow: BANDEJA.sombraInterior }}>
      <span style={{ display: "inline-flex", gap: BANDEJA.espaco + 4, alignItems: "center", padding: "6px 0" }}>
        {ultimo.dados.map((d, i) => <DadoDoLance key={`${n}-${i}`} d={d} tam={tam} rolando={rolando && !d.posto} desfecho={ultimo.desfecho} troca={troca + i} />)}
      </span>
      <span style={{ flex: 1, minWidth: 0 }} aria-live="polite">
        <span className="tv-mono" style={{ display: "block", fontSize: TIPOS.rotulo, color: T.inkMeio, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {rolando ? (ultimo.rotulo || "…") : linha}
        </span>
        {doGolpe && doGolpe.faces && (
          <span style={{ display: "block", marginTop: 4 }}>
            <FacesDoD20 faces={doGolpe.faces} saiu={rolando ? null : natural} rotulo={doGolpe.legenda} />
          </span>
        )}
        {!rolando && desfecho && (
          <span className="tv-dado-veredito" style={{ display: "block", fontSize: TIPOS.corpo, fontWeight: 700, color: corD, animationDuration: `${MOVIMENTO_DO_DADO.veredito}ms` }}>
            <PalavraDoDesfecho desfecho={ultimo.desfecho} cor={corD} />
          </span>
        )}
      </span>
      {anteriores.length > 0 && (
        <span style={{ display: "inline-flex", gap: BANDEJA.espaco, alignItems: "center" }} aria-hidden="true">
          {anteriores.map((l) => (
            <span key={l.n} style={{ display: "inline-flex", gap: 2, opacity: 0.45 }}>
              {l.dados.filter((d) => !d.posto).slice(0, 2).map((d, j) => <Corpo key={j} faces={d.faces === 100 ? 10 : d.faces} legenda={d.faces === 100 ? String(d.valor % 10) : String(d.valor)} papel={d.papel} tam={BANDEJA.dadoPequeno} />)}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

/* ============================================================
   MC · O CHAMADO DO MESTRE (10/11/2026) — formas.md §MC 2–§MC 4;
   Figma 382:237 (10 variantes), o par em 382:347.

   O conteúdo da soleira em Momento=chamado: a bandeja inteira é o botão, e
   o d20 espera nela, de pé e sem número, com o preço dito ao lado. Rola onde
   está à espera (useLance, o mesmo relógio da Bandeja), pousa lá e mostra o
   veredito. A fala que o acompanha na folha é a LinhaDoChamado (ui.jsx), e a
   preferência que acende a vela é o botão RolaPorMim (ui.jsx); quem monta o
   momento para a SoleiraDoMomento é momentoDoChamado, logo abaixo.

   A PEÇA NÃO DECIDE NADA: o chamado vem de oChamado (motor/o-mestre-chama.js),
   o bónus do App (modDoTeste), o lance do motor da bandeja (motor/a-bandeja.js)
   já com o resultado da semente. Nenhum número de forma aqui: tudo de
   CHAMADO_DO_MESTRE, SOLEIRA_DO_MOMENTO e MOVIMENTO_DO_DADO.

   O QUE A PEÇA LÊ (tudo com valor por omissão; sem chamado não há peça):
     chamado  — o que oChamado devolve: { periciaNome, dc, aviso, chave, … }.
                Lê também, se vier, chamado.cobrado (§MC 9.2: o aviso sem
                «Se falhar, » e sem ponto, para depois de «✕ falhou —»).
     mod      — o bónus do teste (número; 0 = só «d20»).
     lance    — null na espera; o lançamento da bandeja depois do toque (o
                mesmo objeto que vai à Bandeja). Com ele, a peça rola e pousa.
                Lê lance.consequencia como reserva de chamado.cobrado.
     sozinho  — a preferência «o Mestre rola por mim» ligada: a vela e «Rolar já».
     espera   — ms da vela. Por omissão O_CHAMADO.esperaSozinho; quando o motor
                der esperaDoChamado(chamado) (§MC 9.1), o App passa-a aqui.
                A peça só desenha a vela: o relógio que lança é do App.
     pulso    — contador: cada valor novo dá o pulso único do d20 (Enter com
                texto escrito no campo).
     aoRolar  — o toque na espera (o App lança e devolve o lance).
     aoPousar — chamado uma vez quando o lance pousa (o Narrador vai aqui).
     telefone — a 375: a perícia sai da bandeja (já está na fala da folha).
     chamado.carta — QQ (§QQ 4 e §QQ 8, 5): o teste vira uma carta do quadro
                (a fiação da Q3, aCartaEmJogo). A bandeja leva o leque 24 à
                direita do d20, e o nome acessível da espera acrescenta «Isto
                revela uma pista.». O «se falhar» da carta já vem no chamado
                (aviso, cobrado): a bandeja diz o que a folha diz.
   O ESTADO deriva do lance, e não é prop: sem lance, espera; com lance, a
   rolar e depois pousado com lance.desfecho.
   ============================================================ */
const C = CHAMADO_DO_MESTRE;
const P_SOLEIRA = SOLEIRA_DO_MOMENTO.principal;
/* «d20 + 2», «d20 − 1», «d20» — o sinal como na conta da bandeja */
const dadoComMod = (mod) => {
  const m = Math.trunc(Number(mod) || 0);
  return O_CHAMADO.dado + (m > 0 ? ` + ${m}` : m < 0 ? ` − ${-m}` : "");
};
/* o texto que o motor ainda não dá cai na reserva da tabela (§MC 9.4) */
const verboJa = () => (typeof O_CHAMADO.rolarJa === "string" && O_CHAMADO.rolarJa) || C.reserva.rolarJa;
const recuoDoChamado = () => (/^[A-ZÀ-Ý]/.test(String(O_CHAMADO.recuo || "")) ? O_CHAMADO.recuo : C.reserva.recuo);

export function ChamadoDoMestre({ chamado = null, mod = 0, lance = null, sozinho = false, espera = O_CHAMADO.esperaSozinho, pulso = 0, aoRolar = null, aoPousar = null, telefone = false }) {
  const { rolando, troca, pousar } = useLance(lance, aoPousar);
  if (!chamado || typeof chamado !== "object") return null;
  const pericia = String(chamado.periciaNome || "");
  const preco = precoDoChamado(chamado);
  const dado = dadoComMod(mod);
  const pousado = !!lance && !rolando;
  const estado = !lance ? (sozinho ? "sozinho" : "espera") : rolando ? "rolando" : "pousado";
  const tocavel = !pousado;
  const verbo = sozinho ? verboJa() : `${O_CHAMADO.rolar} ${dado}`;
  const comPericia = !telefone || C.telefone.comPericia;
  const desfecho = lance ? lance.desfecho : "";
  const cobrado = String(chamado.cobrado || (lance && lance.consequencia) || "");
  const conta = lance ? aLinhaDoLancamento(lance) : "";
  const nome = !lance
    ? `${O_CHAMADO.rolar} ${dado}. ${[pericia, preco].filter(Boolean).join(", ")}. ${chamado.aviso || ""}`.trim()
    : rolando ? [pericia, dado, preco].filter(Boolean).join(", ")
      : [conta, NOME_DO_DESFECHO[desfecho] || "", desfecho === "falha" && cobrado ? cobrado : ""].filter(Boolean).join(". ");
  const tocar = !lance ? aoRolar : rolando ? pousar : undefined;
  const corD = corDoDesfecho(desfecho);
  const B = C.bandeja, D = C.dado, V = C.vela;
  const perimetro = 2 * Math.PI * V.raio;
  const dados = lance && Array.isArray(lance.dados) ? lance.dados : [];
  const comPista = !!(chamado.carta && typeof chamado.carta === "object");
  const nomeComPista = comPista && !lance ? `${nome} ${PALAVRAS_DO_QUADRO.leitor.revela}` : nome;
  return (
    <button type="button" data-chamado={estado} data-chamado-pista={comPista ? "" : undefined} aria-label={nomeComPista} aria-disabled={pousado || undefined}
      onClick={tocar ? () => { try { tocar(); } catch { /* um toque nunca custa o turno */ } } : undefined}
      onPointerDown={(ev) => { try { ev.preventDefault(); } catch { /* o foco fica no campo (V6a) */ } }}
      className={"tv-anel-foco flex items-center text-left min-w-0" + (tocavel ? " tv-chamado-bandeja" : "")}
      style={{ flex: "1 1 0", height: "100%", gap: B.vao, padding: `0 ${B.enchimento[1]}px 0 ${B.enchimento[0]}px`, borderRadius: B.raio,
        borderWidth: 1, borderStyle: "solid", ...(pousado ? { borderColor: B.aroPousado } : null),
        background: B.chao, boxShadow: B.sombra, color: T.ink, cursor: tocavel ? "pointer" : "default" }}>
      <span aria-hidden="true" style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, minWidth: D.caixa, height: D.caixa, gap: BANDEJA.espaco }}>
        {!lance ? (
          <span className="tv-chamado-d20" style={{ display: "inline-flex" }}>
            <span className="tv-chamado-poe tv-chamado-surge" style={{ display: "inline-flex" }}>
              <span key={pulso} className={pulso ? "tv-dado-pulso" : undefined} style={{ display: "inline-flex" }}>
                <Corpo faces={20} legenda="" papel={D.papel} tam={D.lado} />
              </span>
            </span>
          </span>
        ) : (
          <span className={rolando ? "tv-chamado-d20" : undefined} style={{ display: "inline-flex", gap: BANDEJA.espaco }}>
            {dados.map((d, i) => <DadoDoLance key={`${lance.n}-${i}`} d={d} tam={D.lado} rolando={rolando && !d.posto} desfecho={desfecho} troca={troca + i}
              classeRola="tv-chamado-rola" atraso={i > 0 ? MOVIMENTO_DO_DADO.entreDados * i : 0} />)}
          </span>
        )}
        {sozinho && !lance ? (
          <svg className="tv-chamado-vela" width={D.caixa} height={D.caixa} viewBox={`0 0 ${D.caixa} ${D.caixa}`}
            style={{ position: "absolute", left: 0, top: "50%", marginTop: -D.caixa / 2, overflow: "visible", pointerEvents: "none", transform: "rotate(-90deg)",
              "--tv-vela-perimetro": perimetro + "px", "--tv-vela-dura": `${Math.max(0, Number(espera) || 0)}ms` }}>
            <circle cx={D.caixa / 2} cy={D.caixa / 2} r={V.raio} fill="none" stroke={alfa(V.cor, V.alfa)} strokeWidth={V.traco} strokeLinecap="round" strokeDasharray={perimetro} />
          </svg>
        ) : null}
      </span>
      {comPista ? <span style={{ display: "inline-flex", flexShrink: 0, lineHeight: 0 }}><LequeDoQuadro /></span> : null}
      <span className="flex flex-col min-w-0" aria-live="polite" style={{ flex: "1 1 0", gap: 1 }}>
        {pousado ? (
          <>
            <span className="tv-mono" style={{ fontSize: TIPOS.rotulo, color: T.inkMeio, lineHeight: `${P_SOLEIRA.verbo.entrelinha}px`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{conta}</span>
            <span className="tv-body tv-dado-veredito" style={{ fontSize: TIPOS.corpo, fontWeight: 700, color: corD, lineHeight: `${P_SOLEIRA.preco.entrelinha}px`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", animationDuration: `${MOVIMENTO_DO_DADO.veredito}ms` }}>
              <PalavraDoDesfecho desfecho={desfecho} cor={corD} />{desfecho === "falha" && cobrado ? ` — ${cobrado}` : ""}
            </span>
          </>
        ) : (
          <>
            <span className="tv-body" style={{ fontSize: P_SOLEIRA.verbo.tamanho, fontWeight: P_SOLEIRA.verbo.peso, lineHeight: `${P_SOLEIRA.verbo.entrelinha}px`, color: rolando ? T.inkMeio : T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {rolando ? pericia : verbo}
            </span>
            <span className="tv-mono flex items-center min-w-0" style={{ gap: 6, fontSize: P_SOLEIRA.preco.tamanho, lineHeight: `${P_SOLEIRA.preco.entrelinha}px` }}>
              <span style={{ flex: "1 1 0", minWidth: 0, color: T.inkMeio, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{rolando ? dado : comPericia ? pericia : ""}</span>
              {preco ? <span data-chamado-preco="" style={{ flexShrink: 0, whiteSpace: "nowrap", fontWeight: 700, color: T.amberSoft }}>{preco}</span> : null}
            </span>
          </>
        )}
      </span>
    </button>
  );
}

/* O MOMENTO DO CHAMADO, pronto para a soleira (o padrão de momentoDaEscolha e
   momentoDaProposta): devolve { qual: "chamado", momento: { conteudo,
   secundario, chave } } ou null sem chamado. O secundário «Mudar de ideia» só
   existe ANTES do toque: com o lance, não há volta (§MC 3). Recebe as props da
   ChamadoDoMestre e mais aoMudar. */
export function momentoDoChamado(opcoes) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  if (!o.chamado || typeof o.chamado !== "object") return null;
  const { aoMudar = null, ...props } = o;
  return {
    qual: "chamado",
    momento: {
      chave: String(o.chamado.chave || ""),
      conteudo: <ChamadoDoMestre {...props} />,
      secundario: o.lance ? null : { rotulo: recuoDoChamado(), aoTocar: aoMudar },
    },
  };
}
