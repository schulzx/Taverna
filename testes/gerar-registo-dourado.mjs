/* gerar-registo-dourado.mjs (Fase T1-A, 2.ª fatia, 27/10/2026) — a fotografia de ANTES

   Não é suíte (o `npm test` não o corre): é a ferramenta que fez o
   `registo-dourado.json`, e fica para quem quiser refazer a prova. Lê o
   `aplicarResposta` do App de ANTES da mudança — `git show 4617715:src/App.jsx`,
   o último commit em que o cânone e a gente moravam inteiros no App —,
   recorta os dois blocos (de "CÂNONE: mescla fatos duráveis" até o
   `setPersonagem(pers)` que os segue, exclusive) e corre-os em Node com os
   refs trocados por objetos simples e as funções dos módulos de verdade.

   O que é closure do App e não saiu com o bloco vira um dublê declarado:
   - `contextoDoNome(n)` — o RETORNO de lá, copiado aqui à letra, sobre a
     base do caso (a parte do jogo, que o motor recebe pronta);
   - `mundoDaBase()` — o mundo do caso;
   - `montarSystemPrompt` e os resumos que ele lê — contam as chamadas (o
     que o retrato guarda é SE o prompt foi remontado, não o texto dele:
     o prompt é de `prompt.js`, que não mudou).

   uso: node testes/gerar-registo-dourado.mjs [commit]  */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { casosDoRegisto, retratoDoRegisto, digital } from "./aplicar-casos.mjs";
import { semearACasa } from "../src/semente.js";
import { peneirarCanone } from "../src/segredo-guardado.js";
import { criarCidade } from "../src/mapa.js";
import { garantirGeografia } from "../src/geografia.js";
import { nomeComDono, mesclarNPC, criarNPC, notaDoHomonimo } from "../src/npcs.js";
import { aindaSoUmNome } from "../src/abertura.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv[2] || "4617715";
const app = execSync(`git show ${COMMIT}:src/App.jsx`, { cwd: path.join(AQUI, ".."), maxBuffer: 1 << 28 }).toString().replace(/\r\n/g, "\n");
const i0 = app.indexOf("    /* CÂNONE: mescla fatos duráveis; campos novos atualizam, nunca apagam a ficha */");
const i1 = app.indexOf("    setPersonagem(pers);\n    /* combate: processa de forma síncrona", i0);
if (i0 < 0 || i1 < i0) throw new Error("o bloco não está onde estava");
const corpo = app.slice(i0, i1);

const velho = new Function("R", `
  const { resp, pers, msgs, canoneRef, mapaRef, setMapa, espinhaRef, mundoDaBase, npcTurnoRef, npcsRef, setNpcs,
    aberturaMundoRef, lugarRef, missoesRef, diaRef, notaRef, systemRef, nomeCampanhaRef, nomeCampanha, mundoAtual,
    bancoNomesRef, faccaoJogadorRef, questsRef, montarSystemPrompt, resumoMapaParaPrompt, resumoDiplomacia, resumoDoArco,
    resumoQuests, resumoNPCsParaPrompt, tempoInfoPrompt, infoDivindade, infoTitulo, cenaDoPrompt, contextoDoNome, calou,
    peneirarCanone, criarCidade, garantirGeografia, nomeComDono, mesclarNPC, criarNPC, notaDoHomonimo, aindaSoUmNome } = R;
${corpo}
`);

const fora = [];
const dourado = casosDoRegisto().map((c) => {
  const k = JSON.parse(JSON.stringify(c));
  const base = k.ctx.baseDoNome;
  let remontagens = 0;
  const vazio = () => "";
  const msgs = [];
  const R = {
    resp: k.resp, pers: k.estado.personagem, msgs,
    canoneRef: { current: k.estado.canone }, mapaRef: { current: k.estado.mapa }, setMapa: () => {},
    espinhaRef: { current: k.estado.espinha }, mundoDaBase: () => k.ctx.mundo,
    npcTurnoRef: { current: k.estado.npcTurno }, npcsRef: { current: k.estado.npcs }, setNpcs: () => {},
    aberturaMundoRef: { current: k.estado.abertura }, lugarRef: { current: k.estado.lugar }, missoesRef: { current: k.estado.missoes },
    diaRef: { current: k.estado.dia }, notaRef: { current: k.notaAntes }, systemRef: { current: "" },
    nomeCampanhaRef: { current: "c" }, nomeCampanha: "c", mundoAtual: () => null, bancoNomesRef: { current: null },
    faccaoJogadorRef: { current: null }, questsRef: { current: [] },
    montarSystemPrompt: () => { remontagens++; return "PROMPT"; },
    resumoMapaParaPrompt: vazio, resumoDiplomacia: vazio, resumoDoArco: vazio, resumoQuests: vazio, resumoNPCsParaPrompt: vazio,
    tempoInfoPrompt: vazio, infoDivindade: vazio, infoTitulo: vazio, cenaDoPrompt: () => null,
    /* o retorno do `contextoDoNome` do App de antes, à letra, sobre a base do caso */
    contextoDoNome: (n) => ({ importantes: base.importantes, conhecidos: base.conhecidos, recentes: base.recentes, grupo: base.grupo, local: (n && n.local) || "", genero: (n && n.genero) || "", papel: (n && n.papel) || "", notas: [n && n.notas, n && n.status, n && n.descricao].filter((x) => typeof x === "string" && x).join(" · "), aqui: base.aqui, heroi: base.heroi }),
    calou: (onde) => fora.push(onde),
    peneirarCanone, criarCidade, garantirGeografia, nomeComDono, mesclarNPC, criarNPC, notaDoHomonimo, aindaSoUmNome,
  };
  semearACasa(c.semente);
  velho(R);
  const ret = retratoDoRegisto({
    canone: R.canoneRef.current, mapa: R.mapaRef.current, npcs: R.npcsRef.current, npcTurno: R.npcTurnoRef.current,
    nota: R.notaRef.current, msgs, remontou: remontagens > 0,
  });
  return { id: c.id, digital: digital(ret), bytes: ret.length, msgs, nota: R.notaRef.current, remontou: remontagens > 0 };
});
const saida = { origem: `o aplicarResposta de ${COMMIT} (blocos 'o cânone' e 'a gente'), sobre aplicar-casos.mjs#casosDoRegisto`, calou: fora.length, ondeCalou: [...new Set(fora)], casos: dourado };
fs.writeFileSync(path.join(AQUI, "registo-dourado.json"), JSON.stringify(saida));
console.log(`dourado do registo: ${dourado.length} casos, ${fora.length} calou (${[...new Set(fora)].join(", ")})`);
