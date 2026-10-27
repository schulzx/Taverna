/* ============================================================
   O ESTADO DO JOGO, UM OBJETO SÓ (Fase T0, trilha A) — Taverna

   POR QUE ELE EXISTE. Até aqui o jogo inteiro vivia espalhado por ~240
   `useRef` dentro de `Taverna()`, e a única hora em que ele virava uma
   coisa só era o instante do save: `retratoDoJogo()` juntava os campos
   num literal e o `salvar` gravava-o cru, sem esquema e sem versão. Um
   motor que se possa chamar de fora do React (o `src/motor/` da fase
   seguinte: `turno(estado, entrada) → estado`) precisa do contrário —
   um estado com forma conhecida, que se lê e se grava sempre igual.

   Este módulo é essa forma. Ele não sabe de React nem de localStorage:
   recebe objetos e devolve objetos.

   ---------------- O QUE É O ESTADO v2 ----------------

   O MESMO objeto plano que o save v1 já era, campo a campo, mais um
   campo: `versao: 2`. Os grupos (ficha, relógio, mundo, cena…) são uma
   TABELA sobre os campos, não um aninhamento — e isto é de propósito:

   1. **O rollback continua a abrir o save.** Um commit revertido volta a
      ler o save com o código antigo, que lê `sv.personagem`, `sv.mapa`…
      Um save v2 aninhado (`sv.ficha.personagem`) abriria vazio na versão
      de ontem; um save v2 plano abre igual, e o `versao` a mais é um
      campo que ela ignora. A lei de 23/09 é "o que um revert não desfaz é
      da pessoa": o save plano é o que mantém isto reversível.
   2. **A sala e o arquivo exportado não mudam de forma.** Os dois carregam
      o mesmo objeto; aninhar seria mudar o protocolo da sala.

   ---------------- COMO O SAVE v1 É LIDO ----------------

   `estadoDoSave(sv)` aceita o v1 (sem `versao`) e o v2. Migrar é só isto:
   pôr `versao: 2` e dar a cada campo que FALTA o seu padrão. **Um campo
   que existe e tem o tipo certo passa intacto, pela mesma referência** —
   nunca é reescrito, nunca é "consertado" aqui.

   O padrão de quase todo campo é `null`, e isso não é preguiça: é a
   medida do App. O leitor de cada campo (`continuar`, no App) trata a
   AUSÊNCIA como sinal em vários sítios — `missoes` ausente migra as
   quests antigas, `abasAbertas` ausente abre todas as abas a quem já
   jogava, `nevoaVersao` ausente revela o mapa inteiro, `mapa` ausente
   gera a geografia. Um padrão "bonito" (`missoes: []`) apagaria essas
   migrações em silêncio. `null` é tratado pelo leitor exatamente como a
   ausência (`Array.isArray`, `&&`, `||`, `!= null`, e as garantias de
   cada módulo — a suíte prova as garantias uma a uma). Onde o vazio é
   comprovadamente igual à ausência para o leitor, o padrão é o vazio.

   ---------------- O LIXO ----------------

   O tipo de cada campo na tabela é o tipo que o LEITOR do App exige: um
   campo que ele lê com `Array.isArray` é `lista`; um que lê com
   `x && typeof x === "object"` é `objeto`; um que entrega a uma
   `garantirX` (que faz a sua própria validação) é `qualquer`. Por isso
   trocar lixo pelo padrão aqui é o que o leitor já faria — o jogo não
   perde nada que usaria. `null` é sempre aceite: refs nulos são estado
   normal do jogo (sem masmorra, sem raid, sem jornada). E um save que não
   é objeto (string, número, lista, `null`) vira o estado vazio, sem
   estourar.

   ---------------- O QUE NUNCA SE PERDE ----------------

   Campo que a tabela não conhece (de uma versão mais nova, ou de um
   remendo antigo) atravessa a leitura e a gravação intacto, depois dos
   campos da tabela. `saveDoEstado` não valida nem descarta nada: grava o
   que recebe, na ordem da tabela, e o padrão onde o campo falta — para
   que um save v2 lido e regravado saia byte a byte igual.
   ============================================================ */

/* A versão do ESQUEMA do save — não a do jogo (`VERSAO`, em constantes.js).
   Ela só muda quando a forma do estado mudar; o conteúdo muda toda semana
   e não tem nada a ver com isto. O save sem o campo é o v1. */
export const ESTADO_VERSAO = 2;

/* Os grupos, na ordem em que o estado se lê. A ordem não é regra: é a
   arrumação que o motor da fase seguinte vai receber. */
export const GRUPOS = Object.freeze([
  "campanha", "ficha", "relogio", "cena", "mundo", "economia",
  "historia", "coracao", "memoria", "codex", "modos", "bastidor",
]);

/* ---------------- A TABELA DOS CAMPOS ----------------
   Um por campo que `retratoDoJogo()` grava, na ordem dele (a suíte lê o
   literal do App e falha se um campo nascer lá sem nascer aqui).
   `tipo`: objeto | lista | texto | numero | qualquer — o que o leitor
   exige (veja o cabeçalho). `padrao`: `null`, ou `"lista"` (o vazio) onde
   o leitor trata `[]` como a ausência. */
const L = "lista";
const C = (campo, grupo, tipo, padrao = null) => Object.freeze({ campo, grupo, tipo, padrao });
export const CAMPOS = Object.freeze([
  C("nomeCampanha", "campanha", "texto"),
  C("mundo", "campanha", "objeto"),
  C("personagem", "ficha", "objeto"),
  C("mensagens", "memoria", "lista", L),
  C("historico", "memoria", "lista", L),
  C("combate", "cena", "objeto"),
  C("registro", "memoria", "qualquer"),
  C("fimSemSaida", "cena", "qualquer"),
  C("cobradas", "historia", "lista", L),
  C("ultimaCobranca", "historia", "numero"),
  C("formasCobradas", "historia", "lista", L),
  C("elencoMem", "memoria", "qualquer"),
  C("elenco", "memoria", "qualquer"),
  C("lei", "memoria", "qualquer"),
  C("aliados", "coracao", "qualquer"),
  C("memoria", "memoria", "qualquer"),
  C("saber", "memoria", "qualquer"),
  C("coracao", "coracao", "qualquer"),
  C("vilaoAgiu", "historia", "numero"),
  C("canone", "memoria", "objeto"),
  C("npcs", "memoria", "objeto"),
  C("acampado", "cena", "qualquer"),
  C("sitio", "cena", "objeto"),
  C("mapa", "mundo", "objeto"),
  C("faccaoJogador", "mundo", "qualquer"),
  C("cidadeAtual", "cena", "qualquer"),
  C("guilda", "economia", "objeto"),
  C("clima", "mundo", "objeto"),
  C("conquistas", "codex", "objeto"),
  C("contadores", "codex", "objeto"),
  C("tituloAtivo", "codex", "qualquer"),
  C("descobertas", "codex", "lista", L),
  C("masmorra", "cena", "objeto"),
  C("raid", "cena", "qualquer"),
  C("cacadasFeitas", "historia", "lista", L),
  C("tramasFeitas", "historia", "lista", L),
  C("intencoesFeitas", "historia", "lista", L),
  C("mural", "mundo", "lista", L),
  C("decretos", "mundo", "lista", L),
  C("dia", "relogio", "qualquer"),
  C("reino", "mundo", "objeto"),
  C("governos", "mundo", "qualquer"),
  C("tomando", "mundo", "objeto"),
  C("diplomacia", "mundo", "qualquer"),
  C("minuto", "relogio", "qualquer"),
  C("acordouAbs", "relogio", "qualquer"),
  C("nemesis", "mundo", "objeto"),
  C("famaPatamar", "mundo", "qualquer"),
  C("correio", "mundo", "qualquer"),
  C("jornada", "cena", "objeto"),
  C("lugar", "cena", "qualquer"),
  C("eventos", "mundo", "qualquer"),
  C("relogios", "mundo", "qualquer"),
  C("diaLuta", "relogio", "qualquer"),
  C("divindade", "mundo", "qualquer"),
  C("modo", "bastidor", "qualquer"),
  C("historia", "historia", "objeto"),
  C("espinha", "historia", "qualquer"),
  C("abertura", "historia", "qualquer"),
  C("guildas", "mundo", "lista", L),
  C("tarefasCasa", "historia", "lista", L),
  C("quests", "historia", "lista", L),
  /* `missoes` AUSENTE é o sinal da migração das quests antigas (v9.27):
     o padrão é null, nunca a lista vazia. */
  C("missoes", "historia", "lista"),
  C("devocao", "mundo", "qualquer"),
  C("mercado", "economia", "objeto"),
  C("baseMundo", "mundo", "qualquer"),
  C("tentativas", "historia", "qualquer"),
  C("fatos", "memoria", "qualquer"),
  C("turnosDeMundo", "historia", "qualquer"),
  C("desdeMundo", "historia", "qualquer"),
  C("mesa", "historia", "qualquer"),
  C("estante", "historia", "qualquer"),
  C("compasso", "historia", "qualquer"),
  C("promessas", "historia", "qualquer"),
  C("reviravolta", "historia", "qualquer"),
  C("reviravoltaMaior", "historia", "qualquer"),
  C("escada", "historia", "qualquer"),
  C("escuta", "coracao", "qualquer"),
  C("prometido", "historia", "qualquer"),
  C("postura", "historia", "qualquer"),
  C("episodio", "historia", "qualquer"),
  C("gestos", "historia", "qualquer"),
  C("noite", "modos", "objeto"),
  C("torneio", "modos", "qualquer"),
  C("confidencias", "coracao", "qualquer"),
  /* `nevoaVersao` ausente revela o mapa inteiro a quem já jogava (v9.14). */
  C("nevoaVersao", "bastidor", "qualquer"),
  C("chao", "cena", "qualquer"),
  C("forma", "historia", "qualquer"),
  C("leituraDoCronista", "bastidor", "qualquer"),
  C("provedor", "bastidor", "qualquer"),
  C("provedores", "bastidor", "qualquer"),
  C("custo", "bastidor", "objeto"),
  /* `abasAbertas` ausente abre todas as portas a quem já jogava: null. */
  C("abasAbertas", "bastidor", "lista"),
  C("preferenciaDaReacao", "bastidor", "texto"),
  C("sessao", "bastidor", "objeto"),
  C("guardado", "cena", "objeto"),
  C("backupEm", "bastidor", "qualquer"),
  C("rolagem", "cena", "objeto"),
  C("salvoEm", "bastidor", "qualquer"),
]);

const NOMES = new Set(CAMPOS.map((c) => c.campo));
const ehObjeto = (x) => x !== null && typeof x === "object";
const tem = (o, k) => Object.prototype.hasOwnProperty.call(o, k) && o[k] !== undefined;

/* O tipo aceita `null` sempre — ref nulo é estado normal do jogo. */
const ACEITA = Object.freeze({
  /* `typeof x === "object"` aceita listas, e o leitor do App também:
     a régua é a dele, não a do dicionário. */
  objeto: (x) => typeof x === "object",
  lista: (x) => x === null || Array.isArray(x),
  texto: (x) => x === null || typeof x === "string",
  numero: (x) => x === null || (typeof x === "number" && Number.isFinite(x)),
  qualquer: () => true,
});

const padraoDe = (c) => (c.padrao === L ? [] : null);

/* A versão de um save: o número gravado, ou 1 para o save sem campo. */
export function versaoDoSave(sv) {
  const v = ehObjeto(sv) ? sv.versao : undefined;
  return typeof v === "number" && Number.isInteger(v) && v >= 1 ? v : 1;
}

export function estadoVazio() {
  const e = { versao: ESTADO_VERSAO };
  for (const c of CAMPOS) e[c.campo] = padraoDe(c);
  return e;
}

/* Lê um save (v1 ou v2) e devolve o estado v2. Nunca lança. */
export function estadoDoSave(sv) {
  if (!ehObjeto(sv) || Array.isArray(sv)) return estadoVazio();
  const e = { versao: ESTADO_VERSAO };
  for (const c of CAMPOS) {
    const v = tem(sv, c.campo) ? sv[c.campo] : undefined;
    e[c.campo] = v !== undefined && ACEITA[c.tipo](v) ? v : padraoDe(c);
  }
  /* o que a tabela não conhece atravessa intacto, na ordem em que veio */
  for (const k of Object.keys(sv)) if (k !== "versao" && !NOMES.has(k)) e[k] = sv[k];
  return e;
}

/* O estado como vai para o disco: `versao` à frente, os campos na ordem
   da tabela (o padrão onde faltam), e os desconhecidos atrás. Não valida
   nem descarta — quem lê é que sabe o que usar. */
export function saveDoEstado(estado) {
  const e = ehObjeto(estado) && !Array.isArray(estado) ? estado : {};
  const s = { versao: ESTADO_VERSAO };
  for (const c of CAMPOS) s[c.campo] = tem(e, c.campo) ? e[c.campo] : padraoDe(c);
  for (const k of Object.keys(e)) if (k !== "versao" && !NOMES.has(k) && e[k] !== undefined) s[k] = e[k];
  return s;
}

export function camposDoGrupo(grupo) {
  return CAMPOS.filter((c) => c.grupo === grupo).map((c) => c.campo);
}

/* Um grupo do estado como objeto próprio — a ficha, o relógio… */
export function fatiaDoGrupo(estado, grupo) {
  const e = ehObjeto(estado) ? estado : {};
  const f = {};
  for (const k of camposDoGrupo(grupo)) f[k] = tem(e, k) ? e[k] : null;
  return f;
}

/* ---------------- A VISTA (o ref que lê do estado) ----------------
   Um objeto com a cara de um `useRef` — `.current` para ler e para
   escrever — cujo valor mora num campo do estado. Os ~300 sítios do App
   que já escrevem `minutoRef.current = x` continuam a escrever o mesmo,
   e o valor passa a viver em `caixa.current.minuto`. Escrever SUBSTITUI
   o estado (imutabilidade: o estado de ontem não muda debaixo de quem o
   guardou), nunca o muta. `caixa` é qualquer `{ current }` — no App, o
   `estadoRef`. */
export function vistaDoCampo(caixa, campo) {
  const vista = {};
  Object.defineProperty(vista, "current", {
    enumerable: true,
    get: () => (ehObjeto(caixa.current) ? caixa.current[campo] : undefined),
    set: (v) => { caixa.current = { ...(ehObjeto(caixa.current) ? caixa.current : {}), [campo]: v }; },
  });
  return vista;
}
