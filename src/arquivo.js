/* ============================================================
   O SAVE EM ARQUIVO (v9.147) — a campanha sai do navegador — Taverna

   Até aqui a única cópia de uma campanha era uma chave de localStorage
   chamada `taverna_save_v1`. Meses de saga dependiam de ninguém limpar o
   cache, não trocar de navegador, não usar a aba anônima por engano e o
   Safari não decidir sozinho que aquele site estava velho demais.

   O jogo já sabia exportar a CRÔNICA — a saga em letra de forma, bonita
   e ilegível para a máquina. O que faltava era o contrário: o estado, em
   arquivo, que volta.

   ---------------- O QUE ESTE MÓDULO NÃO FAZ ----------------

   Ele não toca no localStorage nem baixa nada: não conhece `window`. Ele
   só ENVELOPA, NOMEIA e ABRE. Quem grava é o App, e é de propósito — o
   momento de gravar é a única parte perigosa disto, e ela precisa ficar
   onde se pode ver que o jogo está desmontado.

   ---------------- POR QUE UM ENVELOPE, E NÃO O SAVE CRU ----------------

   Um save cru num arquivo não sabe dizer de onde veio. Daqui a um ano,
   com o esquema mudado três vezes, quem abrir um `.json` solto na pasta
   de downloads não vai ter como saber se aquilo é da Taverna, de que
   versão, nem de qual herói — e a única forma de descobrir seria
   importar e ver o que acontece, que é a forma cara.

   O envelope responde as três antes de qualquer coisa ser carregada, e é
   o que a tela mostra ao jogador ANTES de ele confirmar.
   ============================================================ */

/* O formato do ARQUIVO, que não é a versão do jogo. Ele só muda se a
   forma do envelope mudar — o conteúdo do save muda toda semana e não
   tem nada a ver com isto. */
export const FORMATO = 1;

const so = (x) => (typeof x === "string" ? x : "");
const semAcento = (s) => so(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ---------------- O NOME DA CAMPANHA, E POR QUE ELE É UMA FUNÇÃO ----------
   ACHADO CONSERTANDO, e é o único defeito desta casa que APAGA TRABALHO DE
   JOGADOR: "A Prova do Depois" abriu um dia chamada "Aventura". Ela não foi
   renomeada por engano — foi **gravada sem nome e batizada na leitura**.

   O LADO DA ESCRITA (consertado em `App.jsx`): de todos os campos que o save
   grava do ESTADO e não do ref, `nomeCampanha` é o único que nenhum chamador
   nunca passa fresco. Contados: `salvar({ personagem: ... })` aparece 50
   vezes, `mundo` e `historico` uma cada, e `nomeCampanha` **zero**. Os outros
   têm o mesmo guarda (`if (x) ref.current = x`) E uma rede que os mantém
   quentes; este tem o guarda e nenhuma rede. *Não é uma corrida rara: é o
   estado normal deste campo.*

   O LADO DA LEITURA, que é este: quatro sítios independentes escreviam
   `sv.nomeCampanha || "Aventura"` — este, e três no `App.jsx`. Um literal
   repetido em quatro sítios é a mesma doença que a primeira lei desta casa
   persegue nos números, e a consequência aqui foi pior do que a de um número
   errado: **um save mudo abria com o nome de outra coisa, e o jogador não via
   um erro — via outra campanha.**

   A REGRA, E ELA NÃO INVENTA: o nome gravado manda sempre. Faltando ele, o
   nome sai do que o PRÓPRIO SAVE carrega — o herói —, porque um save mudo
   ainda sabe de quem é. Só quando nem isso existe é que resta a palavra
   genérica, e aí ela é honesta: não há nada ali para reconhecer.

   ISTO CURA O QUE JÁ ESTÁ NO DISCO. Impedir a próxima corrupção não desfaz a
   de ninguém — quem já tem o save mudo continuaria a abri-lo como "Aventura"
   para sempre. Com esta função ele volta a ser distinguível pelo herói, que é
   o que o jogador reconhece. */
export const NOME_GENERICO = "Aventura";

export function nomeDaCampanha(sv) {
  const s = sv && typeof sv === "object" ? sv : {};
  const gravado = so(s.nomeCampanha).trim();
  if (gravado) return gravado;
  const p = (s.personagem && typeof s.personagem === "object") ? s.personagem : {};
  const heroi = so(p.nome).trim();
  return heroi ? `A saga de ${heroi}` : NOME_GENERICO;
}

/* Um save que perdeu o nome na gravação — o `App.jsx` pergunta isto para
   poder DIZER, em vez de calar. Um conserto silencioso é a mesma falha com
   melhores modos. */
export function salvoSemNome(sv) {
  const s = sv && typeof sv === "object" ? sv : {};
  return !so(s.nomeCampanha).trim();
}

/* ---------------- O RESUMO ----------------
   Uma linha que descreve a campanha sem abrir o save. Vai no envelope, no
   nome do arquivo e na tela de confirmação — os três lugares onde alguém
   precisa reconhecer o que está prestes a fazer. */
export function resumoDoSave(sv) {
  const s = sv && typeof sv === "object" ? sv : {};
  const p = (s.personagem && typeof s.personagem === "object") ? s.personagem : {};
  return {
    campanha: nomeDaCampanha(s),
    heroi: so(p.nome) || "sem nome",
    nivel: Number(p.nivel) || 1,
    classe: so(p.classe),
    dia: Number(s.dia) || 0,
    genero: so(s.mundo && s.mundo.genero),
    salvoEm: Number(s.salvoEm) || 0,
  };
}

export function linhaDoResumo(r) {
  const x = r && typeof r === "object" ? r : {};
  const partes = [x.campanha, `${x.heroi}${x.classe ? `, ${x.classe}` : ""} nível ${x.nivel || 1}`];
  if (x.dia > 0) partes.push(`dia ${x.dia}`);
  return partes.filter(Boolean).join(" · ");
}

/* ---------------- O NOME DO ARQUIVO ----------------
   Ele é a única etiqueta na pasta de downloads, e o jogador vai ter mais
   de um: a data separa as cópias de uma mesma campanha, e é o que
   transforma "exportar" em "fazer backup". Sem ela, cada exportação
   sobrescreveria a anterior no disco e o recurso teria uma cópia só —
   que é quase o problema que ele veio resolver. */
export function nomeDoArquivo(sv, agora = Date.now()) {
  const r = resumoDoSave(sv);
  const limpo = (s) => semAcento(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "taverna";
  const d = new Date(agora);
  const dd = (n) => String(n).padStart(2, "0");
  const data = `${d.getFullYear()}-${dd(d.getMonth() + 1)}-${dd(d.getDate())}`;
  return `taverna-${limpo(r.campanha)}-${limpo(r.heroi)}-dia${r.dia}-${data}.json`;
}

/* ---------------- ENVELOPAR ---------------- */
export function envelopar(sv, { versao = "", leva = "", agora = Date.now() } = {}) {
  return {
    taverna: {
      formato: FORMATO,
      versao: so(versao),
      leva: so(leva),
      exportadoEm: new Date(agora).toISOString(),
      resumo: resumoDoSave(sv),
    },
    save: sv,
  };
}

export function textoDoArquivo(sv, opcoes) {
  /* dois espaços de indentação: o arquivo cresce uns 20%, e em troca ele
     pode ser lido e consertado por uma pessoa num editor de texto — que é
     exatamente a situação em que alguém vai precisar dele */
  return JSON.stringify(envelopar(sv, opcoes), null, 2);
}

/* ---------------- ABRIR ----------------
   Devolve sempre a mesma forma: `{ ok, save, resumo, avisos[] }` ou
   `{ ok: false, erro }`. Nunca lança — quem chama isto está lidando com
   um arquivo que o jogador escolheu no disco, e "o programa quebrou" é a
   pior resposta possível para "escolhi o arquivo errado". */
export function abrir(texto) {
  let dados;
  try { dados = JSON.parse(so(texto)); }
  catch { return { ok: false, erro: "Este arquivo não é um JSON válido — provavelmente não é um save da Taverna." }; }
  if (!dados || typeof dados !== "object") return { ok: false, erro: "Arquivo vazio ou com formato irreconhecível." };

  const avisos = [];
  let save = dados;

  /* O SAVE CRU TAMBÉM ENTRA, e isto não é generosidade: é o caminho de
     socorro. Quem já perdeu um save uma vez aprende a copiar o valor da
     chave do localStorage para um arquivo de texto — e essa pessoa é
     exatamente quem mais precisa que a importação funcione. */
  if (dados.taverna && dados.save && typeof dados.save === "object") {
    save = dados.save;
    const f = Number(dados.taverna.formato) || 0;
    if (f > FORMATO) avisos.push(`Este arquivo foi criado por uma versão mais nova do jogo (formato ${f}). Pode haver coisas que esta versão não entende.`);
  } else {
    avisos.push("Arquivo sem envelope — lendo como save cru.");
  }

  /* A ÚNICA COISA QUE TORNA UM JSON UM SAVE: uma ficha com nome. Sem
     `personagem.nome` não há o que continuar, e todo o resto do jogo
     assume que ela existe. */
  const p = save && typeof save === "object" ? save.personagem : null;
  if (!p || typeof p !== "object" || !so(p.nome).trim()) {
    return { ok: false, erro: "Não achei um personagem neste arquivo — ele não parece ser um save da Taverna." };
  }
  if (!save.mundo || typeof save.mundo !== "object") avisos.push("O arquivo não traz o mundo; o jogo vai usar um genérico.");
  if (!Array.isArray(save.mensagens)) avisos.push("O arquivo não traz o histórico de mensagens.");

  return { ok: true, save, resumo: resumoDoSave(save), avisos };
}
