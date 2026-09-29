/* teste-v5-pagina.mjs — a página da pessoa (V5, 25/09/2026)

   O `parchment-body` da pessoa (Figma `ffWFqD7TueSb88Mkeg9bhW`, `129:15`) com os
   desvios que o `jogo` decidiu (`mente/v5-jogo.md`). O que esta suíte guarda:
   1. AS MEDIDAS em tabela: o enchimento e o ritmo da página, a abertura de
      cerimônia, o pé do cartão, o foco da gaveta (V4d).
   2. AS CONTAS, em Node: os parágrafos da prosa, a primeira frase, o glifo de
      cada sala.
   3. AS PEÇAS: a prosa, o botão de ouvir, a runa com ponta, o pé da página.
   4. A FIAÇÃO: a soleira mora no pé do cartão, fora do que rola; a espera se diz
      uma vez, embaixo; a cerimônia é efêmera e não vai ao save; o painel da
      masmorra diz a sala.
   5. NENHUM MOVIMENTO NOVO — a cerimônia é o tamanho, não a animação. */
import { readFileSync } from "node:fs";
import { T, TIPOS, ALVOS, RUNA, ESBATIMENTO, PAGINA, ABERTURA, PE_DA_PAGINA, ALFORJE, FOCO_NA_GAVETA, FONT_CSS } from "../src/estilo.js";
import { GLIFOS, GLIFO_DA_SALA, partesDaProsa, primeiraFrase } from "../src/glifos.js";
import { ROTULO_SALA } from "../src/masmorras.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
/* lê sem o CR: a suíte vale igual numa árvore em LF ou em CRLF */
const ler = (x) => readFileSync(x, "utf8").split(String.fromCharCode(13)).join("");
const UI = ler("../src/ui.jsx");
const APP = ler("../src/App.jsx");
const EST = ler("../src/estilo.js");
const GAVETA = ler("../src/painel-alforje.jsx");
const trecho = (txt, ini, fim) => { const i = txt.indexOf(ini); return i < 0 ? "" : txt.slice(i, txt.indexOf(fim, i + ini.length)); };
const semComentario = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
const PROSA = trecho(UI, "export function Prosa(", "\n}\n");
const OUVIR = trecho(UI, "export function BotaoDeOuvir(", "\n}\n");
const PE = trecho(UI, "export function PeDaPagina(", "\n}\n");
const RUNA_TXT = trecho(UI, "export function DivisoriaRunica(", "\n}\n");

/* ============================================================ */
sec("1. as medidas da página — em tabela");
{
  t("o enchimento do nó: 28 em cima, embaixo e dos lados na mesa", PAGINA.cima === 28 && PAGINA.baixo === 28 && PAGINA.lado === 28);
  t("no telefone os lados são 20 (28 comeria 2 caracteres por linha a uma coluna já abaixo de 45)", PAGINA.ladoTelefone === 20);
  t("e o de cima nunca desce do esbatimento: a primeira linha nasce à luz inteira (R15)", PAGINA.cima >= ESBATIMENTO.altura);
  t("16 entre parágrafos e 24 entre blocos, como o nó", PAGINA.entreParagrafos === 16 && PAGINA.entreBlocos === 24);
  t("a entrelinha da prosa é a de hoje, agora dita", PAGINA.entrelinha === 1.625);
  t("a folha lê a página da tabela, e não de número à mão",
    /\.tv-pagina \{\s*padding: \$\{PAGINA\.cima\}px \$\{PAGINA\.ladoTelefone\}px \$\{PAGINA\.baixo\}px;/.test(EST)
    && /\.tv-pagina > \* \+ \* \{ margin-top: \$\{PAGINA\.entreBlocos\}px; \}/.test(EST)
    && /\.tv-pagina \{ padding-inline: \$\{PAGINA\.lado\}px; \}/.test(EST));
  t("a cerimônia é a letra de display, e a frase longa cai para a de título", ABERTURA.letra === TIPOS.display && ABERTURA.letraLonga === TIPOS.titulo && ABERTURA.tetoDeCaracteres === 110);
  t("o peso da cerimônia é um que a folha CARREGA (nada de negrito falso)", ABERTURA.peso === 500 && /family=Spectral:ital,wght@[^&']*0,500/.test(FONT_CSS));
  t("o pé custa o que a caixa de hoje custava: os 8 de baixo e os 2 da borda ciano, repartidos 6 + 4", PE_DA_PAGINA.cima + PE_DA_PAGINA.baixo === 8 + 2 && PE_DA_PAGINA.cima === 6 && PE_DA_PAGINA.lado === 24 && PE_DA_PAGINA.ladoTelefone === 12);
  t("e a folha lê o pé da tabela", /\.tv-pe-da-pagina \{ padding: \$\{PE_DA_PAGINA\.cima\}px \$\{PE_DA_PAGINA\.ladoTelefone\}px \$\{PE_DA_PAGINA\.baixo\}px; \}/.test(EST));
  t("o glifo do botão de ouvir é o de sempre (14)", RUNA.glifoDeOuvir === 14);
  t("V4d · o cartão pedido para abaixo do cabeçalho da gaveta: 20 + 56 + 16", ALFORJE.focoAbaixoDoCabecalho === 20 + ALVOS.chamado + 16);
}

/* ============================================================ */
sec("2. as contas — em Node");
{
  t("uma linha em branco separa parágrafos", JSON.stringify(partesDaProsa("A noite cai.\n\nO vento vira.")) === JSON.stringify(["A noite cai.", "O vento vira."]));
  t("uma quebra simples continua dentro do parágrafo (o Mestre põe falas assim)", partesDaProsa("Ele diz:\n— Vá.").length === 1);
  t("linhas em branco com espaço e em série contam como uma", partesDaProsa("a\n  \n\n\nb").length === 2);
  t("vazio, nulo e lixo não lançam: nenhum parágrafo", partesDaProsa("").length === 0 && partesDaProsa(null).length === 0 && partesDaProsa("\n\n").length === 0);
  const a = primeiraFrase("A porta range. Lá dentro, nada se mexe.");
  t("a primeira frase acaba no primeiro ponto seguido de espaço", a.frase === "A porta range." && a.resto === "Lá dentro, nada se mexe.");
  t("as reticências e o fecho de aspas vão com ela", primeiraFrase("Silêncio… Depois, passos.").frase === "Silêncio…" && primeiraFrase("“Quem vem lá?” pergunta o guarda.").frase === "“Quem vem lá?”");
  t("um ponto no meio de um número não corta a frase", primeiraFrase("Custa 2.5 moedas. Paga.").frase === "Custa 2.5 moedas.");
  t("sem pontuação, a frase é o parágrafo inteiro", primeiraFrase("A estrada segue").frase === "A estrada segue" && primeiraFrase("A estrada segue").resto === "");
  t("nulo não lança", primeiraFrase(null).frase === "");
  t("cada tipo de sala tem o seu glifo", Object.keys(ROTULO_SALA).every((k) => typeof GLIFO_DA_SALA[k] === "string"), Object.keys(ROTULO_SALA).filter((k) => !GLIFO_DA_SALA[k]).join());
  t("e todos são glifos que existem — nenhum nasceu para isto", Object.values(GLIFO_DA_SALA).every((g) => GLIFOS[g]), Object.values(GLIFO_DA_SALA).filter((g) => !GLIFOS[g]).join());
}

/* ============================================================ */
sec("3. as peças");
{
  t("A prosa: parágrafos a PAGINA.entreParagrafos, na letra de TIPOS.prosa", /gap: PAGINA\.entreParagrafos/.test(PROSA) && /fontSize: TIPOS\.prosa, lineHeight: PAGINA\.entrelinha/.test(PROSA) && /partesDaProsa\(texto\)/.test(PROSA));
  t("a cerimônia é a primeira FRASE, num parágrafo seu, com a letra de ABERTURA",
    /primeiraFrase\(partes\[0\]\)/.test(PROSA) && /data-abertura="cerimonia"/.test(PROSA)
    && /fontSize: longa \? ABERTURA\.letraLonga : ABERTURA\.letra, lineHeight: ABERTURA\.entrelinha, fontWeight: ABERTURA\.peso/.test(PROSA)
    && /frase\.length > ABERTURA\.tetoDeCaracteres/.test(PROSA));
  t("a peça não guarda número de leiaute à mão", !/(?:fontSize|lineHeight|gap|padding|fontWeight):\s*\d/.test(semComentario(PROSA + PE + RUNA_TXT)));
  t("O botão de ouvir tem o alvo de 48 de R2, sem fundo nem borda", /width: ALVOS\.piso, height: ALVOS\.piso, background: "transparent", border: "none"/.test(OUVIR) && ALVOS.piso === 48);
  t("e diz o estado no nome (o 'a ler…' de antes virou o nome acessível)", /"Parar a leitura"/.test(OUVIR) && /"Preparando a leitura"/.test(OUVIR) && /"Ouvir o Mestre"/.test(OUVIR) && /aria-label=\{nome\}/.test(OUVIR));
  t("a voz fala o português do jogo (preparando, lendo, tecendo)", /const ROTULO_DA_VOZ = \{ lendo: "lendo…", preparando: "preparando…" \};/.test(UI) && /o Mestre está tecendo/.test(UI) && !/"a preparar…"|"a ler…"|está a tecer/.test(UI));
  t("a runa com ponta: a linha deixa de ser aria-hidden, os traços continuam",
    /export function DivisoriaRunica\(\{ respiro = RUNA\.respiro, ponta = null \}\)/.test(UI) && /if \(ponta\) \{[\s\S]*?<DivisoriaRunica respiro=\{0\} \/>[\s\S]*?\{ponta\}/.test(RUNA_TXT));
  t("O pé da página: sem oferta não há pé (0 px)", /if \(!children\) return null;/.test(PE));
  t("e o fio que o separa do que rola é uma sombra, sem leiaute", /boxShadow: "inset 0 1px 0 " \+ T\.line/.test(PE) && /background: T\.pagina/.test(PE) && /tv-pe-da-pagina shrink-0/.test(PE));
}

/* ============================================================ */
sec("4. a fiação");
{
  t("a região que rola é a página: .tv-pagina no lugar do px-5/py-6", /className="tv-scroll tv-esbate-topo[^"]*tv-pagina[^"]*"/.test(APP) && !/tv-esbate-topo[^"]*py-6/.test(APP));
  t("a resposta do Mestre começa pela runa com o botão de ouvir na ponta",
    /<DivisoriaRunica respiro=\{0\} ponta=\{<BotaoDeOuvir estado=\{[^}]*\} aoOuvir=\{\(\) => ouvirMestre\(i, m\.texto\)\} \/>\} \/>/.test(APP));
  t("e a prosa é a peça, com a cerimônia só no turno marcado", /<Prosa texto=\{m\.texto\} abertura=\{abertura === i \? "cerimonia" : "nenhuma"\} \/>/.test(APP));
  t("o `O MESTRE` do topo da página saiu: a voz do Mestre só existe na espera",
    (APP.match(/<Voz quem="mestre"/g) || []).length === 1 && /\{carregando && \(\s*<div className="tv-fade tv-coluna flex items-center gap-2">\s*<span className="tv-dice inline-flex"><IconeD20 tamanho=\{16\} cor=\{T\.inkMeio\} \/><\/span>\s*<div className="flex-1 min-w-0"><Voz quem="mestre" voz="preparando" \/><\/div>/.test(APP));
  t("e a espera mora no fim do registro, antes do fim da página", APP.indexOf('<Voz quem="mestre" voz="preparando"') < APP.indexOf("<div ref={fimRef}><FimDaPagina /></div>"));
  const ABRE = trecho(APP, "const aberturaRef = useRef(", "}, [carregando, mensagens.length]);");
  /* A ASSERÇÃO MUDOU, E O MOTIVO FICA: a cerimônia está APAGADA ATÉ V5e, "a
     resposta chega pelo começo" — nasce fora de vista em 5/5 respostas reais e
     empurra o fim da resposta 53–64 px para baixo (`mente/v5-jogo.md` §8.1).
     A regra de QUANDO ela acende continua escrita e provada; o que se prende
     agora é que ela só acende por `ABERTURA.acesa`, e que isso hoje é falso. */
  t("a cerimônia: a chegada a um lugar novo ou a primeira resposta da sessão — e só com ABERTURA.acesa",
    /if \(ABERTURA\.acesa && \(a\.primeira \|\| lugarDaCena\(\) !== a\.lugar\)\) setAbertura\(i\);/.test(ABRE));
  t("e está apagada até V5e (nasce fora de vista em 5/5 respostas reais)", ABERTURA.acesa === false);
  t("e ela é efêmera: o turno seguinte a devolve à prosa", /a\.pendente = true;[^\n]*setAbertura\(null\);/.test(ABRE));
  t("e nunca custa o turno", /calou\("marcar a abertura de cerimonia", e\)/.test(ABRE));
  t("e não vai ao save (é um momento, não um fato)", !/aberturaRef\.current[^\n]*(?:localStorage|salvar)/.test(APP) && !/\babertura: abertura\b/.test(APP));
  const pe = APP.indexOf("<PeDaPagina>"), fim = APP.indexOf("<div ref={fimRef}><FimDaPagina /></div>");
  t("a soleira mora no pé do cartão, e há UMA soleira só", pe > fim && (APP.match(/<Soleira /g) || []).length === 1 && /<PeDaPagina>\s*<Soleira ofertas=\{vivas\.map/.test(APP));
  t("fora do que rola: entre o fim da página e o pé se fecha a região da rolagem", /<div ref=\{fimRef\}><FimDaPagina \/><\/div>\s*<\/div>/.test(APP.slice(fim - 10, pe)));
  /* V5e: a seta é a peça `SetaDaLeitura` — o que se prende é o mesmo lugar: entre o
     fim da página e o pé, dentro do invólucro da rolagem. */
  t("a seta de voltar ao fim mora dentro da região da rolagem (nunca cobre a oferta)", APP.indexOf("<SetaDaLeitura", fim) > fim && APP.indexOf("<SetaDaLeitura", fim) < pe);
  t("todas as peças de V3c continuam (a chegada, a impedida, a janela)", /chegada=\{o\.fila === "B" \|\| \(jaTinha && jaTinha\.has\(o\.id\)\) \? "assentada" : "agora"\}/.test(APP) && /estado=\{o\.precisaDoNarrador && bloqueado \? "impedida" : "repouso"\}/.test(APP) && /janela=\{o\.janela\}/.test(APP));
  /* lado a lado NÃO: a 1280 cada coluna teria 544 px e a oferta pede ~600 numa
     linha (verbo 314 + quem + preço + janela 108) — o verbo quebrava em duas
     linhas. O `jogo` disse *se couberem*; não cabem. */
  t("as ofertas continuam empilhadas na mesa (lado a lado não cabe a 1280)", !/lg:grid-cols-2/.test(UI));
  const OFERTA = trecho(UI, "export function Oferta(", "export function Dobra(");
  t("a oferta ganhou a moldura aberta, e sem ela é a de ontem",
    /aoClicar, moldura = "caixa" \}\)/.test(OFERTA) && /background: aberta \? "transparent" : T\.panel/.test(OFERTA)
    && /border: aberta \? "none" : `1px solid \$\{tomada \? T\.lineStrong : corDoTom\}`/.test(OFERTA) && /\$\{aberta \? "" : "px-3 "\}py-1/.test(OFERTA));
  t("no pé a oferta é aberta: a moldura é a do cartão", /aoClicar=\{o\.aoClicar\} moldura="aberta" \/>/.test(APP));
  t("e o tom continua dito: a cor do preço", /color: corDoTom, fontWeight: 600/.test(OFERTA));
  const SALA = trecho(APP, "V5 · O PAINEL DIZ A SALA", "A PORTA DOS CAPITULOS");
  t("o painel da masmorra diz a SALA, com o glifo dela", /GLIFO_DA_SALA\[salaAtual\?\.tipo\]/.test(SALA) && /" · por resolver"/.test(SALA));
  t("às escuras o título se diz em perigo, e o preço fica escrito", /escuro \? "às escuras"/.test(SALA) && /color: escuro \? T\.danger/.test(SALA) && /Sem tochas — vocês avançam às cegas, em desvantagem\./.test(SALA));
  t("o lugar e as tochas não se repetem: 'Você está em' morreu no painel", !/Você está em:/.test(semComentario(SALA)) && !/\{masmorra\.tochas\}/.test(SALA));
  t("V4d · na mesa o cabeçalho da gaveta fica colado ao topo, com fundo", /md:sticky md:top-0 md:z-10"\s*\n\s*style=\{\{ minHeight: ALVOS\.chamado, background: T\.panel \}\}/.test(GAVETA));
  /* A ASSERÇÃO MUDOU, E O MOTIVO FICA: o foco pedia `ALFORJE.focoAbaixoDoCabecalho`
     (92, uma soma escrita à mão), e a prova do `jogo` (`v5-jogo.md` §8.4) viu uma
     tira de ~8 px do cartão de cima debaixo do título preso — o cabeçalho real é
     maior do que a soma. O foco passa a sair da altura MEDIDA do cabeçalho
     (`--tv-cabecalho-da-gaveta`, escrita pela gaveta) + `respiroDoFoco`; os 92
     ficam como reserva antes da primeira medida. */
  t("V4d · e o cartão pedido para abaixo dele, pela altura medida do cabeçalho",
    /scrollMarginTop: FOCO_NA_GAVETA/.test(APP)
    && FOCO_NA_GAVETA === `calc(var(--tv-cabecalho-da-gaveta, ${ALFORJE.focoAbaixoDoCabecalho - ALFORJE.respiroDoFoco}px) + ${ALFORJE.respiroDoFoco}px)`
    && /ref=\{medirCabecalho\}/.test(GAVETA) && /--tv-cabecalho-da-gaveta/.test(GAVETA) && /new ResizeObserver\(medir\)/.test(GAVETA));
}

/* ============================================================ */
sec("5. nenhum movimento novo");
{
  const css = trecho(EST, ".tv-pagina {", "@media (min-width: 768px) {\n  .tv-pe-da-pagina");
  t("a página e o pé não animam", css.length > 50 && !/animation|transition/.test(css));
  t("a cerimônia não anima: é o tamanho, não o movimento", !/className="tv-(?:fade|vira|slide|pulse|flutua)/.test(PROSA) && !/animation/.test(PROSA));
  t("e o pé também não", !/animation|tv-fade|tv-slide/.test(PE));
}

console.log(`\nV5 · a página: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
