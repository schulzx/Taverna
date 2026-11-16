/* A RAIZ (C2 + V5 · 16/11/2026): nada de tela vazia.

   O jogo inteiro (`App.jsx` e os ~380 módulos que ele puxa) pesava 1,8 MB
   em gzip num arquivo só, e a primeira tela esperava por ele. Agora a
   primeira tela — a chegada e a criação em cartas — vive aqui, com o que
   ela precisa e nada mais; o jogo carrega em segundo plano logo depois do
   primeiro quadro (`import()`), e monta quando o jogador diz para onde vai:
   «Continuar», «Começar» ou o arquivo. A abertura em HTML do index.html
   (#tv) cobre até este primeiro quadro, e sai quando ele pinta.

   Um pedaço que falha ao carregar não derruba a mesa: o LimiteDaRaiz
   mostra o estado de erro do F3 com «Atualizar a página». */
import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./tailwind.css";
import { FONT_CSS } from "./estilo.js";
import { MODO_PADRAO, espacoDoSave } from "./modos.js";
import { ESTADO_VERSAO } from "./estado.js";
import { resumoDoSave, sementeDaVisita, sementeSeguinte } from "./criacao-da-mesa.js";
import { Chegada, MesaDaNoite, PedidoDaPorta } from "./painel-chegada.jsx";
import { Criacao, MesaSendoPosta } from "./painel-criacao.jsx";

const carregarOJogo = () => import("./App.jsx");
const App = React.lazy(carregarOJogo);

const avisar = (onde, e) => { try { console.error(`Taverna · ${onde} calou:`, e); } catch { /* nada mais a fazer */ } };

function lerAPorta() {
  try { return resumoDoSave(localStorage.getItem(espacoDoSave(MODO_PADRAO)), ESTADO_VERSAO); } catch (e) { avisar("a porta", e); return { estado: "nenhum" }; }
}

class LimiteDaRaiz extends React.Component {
  constructor(props) { super(props); this.state = { erro: null }; }
  static getDerivedStateFromError(erro) { return { erro }; }
  componentDidCatch(erro) { avisar("o jogo ao carregar", erro); }
  render() {
    if (!this.state.erro) return this.props.children;
    return <MesaSendoPosta heroi={null} erro aoTentar={() => { try { window.location.reload(); } catch { /* idem */ } }} />;
  }
}

function Raiz() {
  const [entrada, setEntrada] = React.useState(null);
  const [tela, setTela] = React.useState("chegada");
  const [semente, setSemente] = React.useState(null);
  const [resumo] = React.useState(lerAPorta);

  /* a abertura em HTML sai no primeiro quadro pintado; o jogo começa a
     descer logo a seguir, sem disputar a rede com a primeira tela */
  React.useEffect(() => {
    try { requestAnimationFrame(() => { const tv = document.getElementById("tv"); if (tv) tv.remove(); }); } catch (e) { avisar("a abertura", e); }
    const id = setTimeout(() => { carregarOJogo().catch((e) => avisar("o jogo em segundo plano", e)); }, 600);
    return () => clearTimeout(id);
  }, []);

  if (entrada) {
    const espera = entrada.tipo === "comecar"
      ? <MesaSendoPosta heroi={{ ...entrada.mesa.heroi, genero: entrada.mesa.heroi.sexo, semente: entrada.mesa.semente }} />
      : <MesaDaNoite telefone={false} />;
    return <LimiteDaRaiz><Suspense fallback={espera}><PedidoDaPorta.Provider value={entrada}><App /></PedidoDaPorta.Provider></Suspense></LimiteDaRaiz>;
  }
  return (
    <>
      <style>{FONT_CSS}</style>
      {tela === "criacao"
        ? <Criacao semente={semente} aoComecar={(mesa) => setEntrada({ tipo: "comecar", mesa })} aoNovaSemente={() => setSemente((s) => sementeSeguinte(s))} />
        : <Chegada resumo={resumo}
            aoSentar={() => { setSemente(sementeDaVisita(Date.now())); setTela("criacao"); }}
            aoContinuar={() => setEntrada({ tipo: "continuar", comResumo: false })}
            aoOuvir={() => setEntrada({ tipo: "continuar", comResumo: true })}
            aoArquivo={() => setEntrada({ tipo: "arquivo" })}
            aoAtualizar={() => { try { window.location.reload(); } catch { /* idem */ } }} />}
    </>
  );
}

/* uma raiz só: o recarregamento a quente do servidor de desenvolvimento reexecuta
   este arquivo, e uma segunda createRoot no mesmo #root avisa no console */
const ONDE = document.getElementById("root");
if (!ONDE.__raiz) ONDE.__raiz = createRoot(ONDE);
ONDE.__raiz.render(<Raiz />);
