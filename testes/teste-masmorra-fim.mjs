/* teste-masmorra-fim.mjs (MM11, defeito 1 da 3.a sessao de prova) — a masmorra
   se acaba.

   Dois buracos, um defeito: a masmorra nao tinha fim.
   (a) A sala do Guardiao (`tipo: "chave"`) nunca abria luta: a porta so abria
       combate para `combate` e `chefe`, a `chave` caia fora de todos os
       ramos, o guardiao nunca caia, a chave nunca soltava e o portao do chefe
       nunca abria. Toda masmorra era um beco sem saida de fato.
   (b) A sala de combate vencida pelo SISTEMA ("todos os inimigos cairam")
       ficava `resolvida:false`: so o ramo da resposta do Narrador a fechava.

   Aqui se prova a DECISAO, em Node: quais salas abrem luta e o que dizem ao
   Narrador, e o desfecho de uma luta vencida (resolve a sala, larga a chave se
   era a do guardiao, uma vez so). A fiacao no App e de outra mao.

   A masmorra e gerada com Math.random; a suite o troca por um gerador semeado
   para que "varias sementes" seja reproduzivel em qualquer maquina.        */
import * as M from "../src/masmorras.js";
import { readFileSync } from "node:fs";

const { gerarMasmorra, entrarNaSala, marcarResolvida, voltarASalaLimpa, saidasDe, saidasDeRecuo } = M;

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
/* uma secao que estoura conta como falha (e nao derruba as outras) — e e assim
   que a suite mostra XX, e nao um stack, antes de o codigo existir */
const sec = (s, fn) => {
  console.log("\n" + s);
  try { fn(); } catch (e) { mal++; console.log("  XX  estourou: " + (e && e.message)); }
};

/* LCG semeado: mesma semente, mesma masmorra */
const comSemente = (semente, fn) => {
  const real = Math.random;
  let x = (semente * 2654435761) >>> 0 || 1;
  Math.random = () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; };
  try { return fn(); } finally { Math.random = real; }
};

/* a masmorra minima, montada a mao: entrada -> guardiao e combate -> chefe */
const pequena = () => ({
  nome: "Prova", nivel: 3, atual: 0, tochas: 9, chave: false, ritmo: "normal",
  saques: { moedas: 0, itens: 0 }, encerrada: false,
  salas: [
    { id: 0, tipo: "entrada", camada: 0, saidas: [1, 2], visitada: true, resolvida: true },
    { id: 1, tipo: "combate", camada: 1, saidas: [3], visitada: false, resolvida: false, inimigos: [{ nome: "Esqueleto", ameaca: "comum" }] },
    { id: 2, tipo: "chave", camada: 1, saidas: [3], visitada: false, resolvida: false, guardaChave: true, inimigos: [{ nome: "Carcereiro", ameaca: "elite" }] },
    { id: 3, tipo: "chefe", camada: 2, saidas: [], visitada: false, resolvida: false, trancada: true, inimigos: [{ nome: "Rei Caído", ameaca: "elite" }] },
    { id: 4, tipo: "tesouro", camada: 1, saidas: [], visitada: false, resolvida: false },
  ],
});

/* o que o App monta INLINE hoje no ramo combate/chefe (App.jsx ~20316-20317) —
   copiado aqui como a referencia de regressao zero: o texto de combate e de
   chefe nao pode mudar uma virgula */
const aviso_antigo = (tipo, nomes) => `⚔ ${tipo === "chefe" ? "A sala do chefe!" : "Emboscada na masmorra!"} ${nomes.join(", ")} — o combate está aberto.`;
const envelope_antigo = (tipo, pos, lista, depois) => `[MASMORRA — ${pos} · ${tipo === "chefe" ? "CHEFE" : "COMBATE"} — COMBATE JÁ ABERTO PELO SISTEMA] Avanço para a próxima sala e os inimigos saltam das sombras: ${lista}. O HUD de combate JÁ ESTÁ ABERTO — NÃO envie "combate_iniciar". Descreva a sala e a investida inicial em 1-2 frases e me passe a vez (eu ajo pelos botões de combate).${tipo === "chefe" ? " É o confronto final desta masmorra — narre à altura." : ""}${depois}`;

sec("1. quais salas abrem luta", () => {
  const abre = (tipo) => M.abreLuta({ id: 1, tipo, inimigos: [{ nome: "X" }] });
  t("a tabela existe e nomeia combate, chave e chefe", !!M.SALAS_DE_LUTA && ["combate", "chave", "chefe"].every((k) => k in M.SALAS_DE_LUTA));
  t("combate abre luta", !!abre("combate"));
  t("chefe abre luta", !!abre("chefe"));
  t("chave (o Guardião) abre luta — era o buraco", !!abre("chave"));
  for (const tipo of ["tesouro", "armadilha", "santuario", "enigma", "entrada"]) t(`${tipo} NÃO abre luta`, !abre(tipo));
  t("tipo desconhecido, null e lixo não abrem (e não estouram)", !M.abreLuta({ tipo: "xyz" }) && !M.abreLuta(null) && !M.abreLuta(undefined) && !M.abreLuta("chave") && !M.abreLuta({}));
  /* o que a tabela promete tem de coincidir com o que as outras tabelas do arquivo sabem de cada tipo */
  t("só abre luta tipo que a masmorra conhece (ROTULO_SALA)", Object.keys(M.SALAS_DE_LUTA).every((k) => k in M.ROTULO_SALA));
  t("e toda sala de luta tem aviso, rótulo, abertura (texto não vazio)", Object.values(M.SALAS_DE_LUTA).every((l) => ["aviso", "rotulo", "abertura"].every((c) => typeof l[c] === "string" && l[c].trim())));
  t("as tres lutas dizem coisas diferentes ao jogador", new Set(Object.values(M.SALAS_DE_LUTA).map((l) => l.aviso)).size === 3);
});

sec("2. o texto: combate e chefe IGUAIS ao de hoje (regressão zero), o Guardião novo", () => {
  const nomes = ["Esqueleto", "Slime"], lista = "Esqueleto (nv 2, 11 PV), Slime (nv 1, 6 PV)";
  const pos = "Cripta dos Ratos · camada 1 · 2/6 salas";
  const depois = " Detalhe do desgaste. PERCEPÇÃO PASSIVA (14) revelou. 🕰 passam 10 minutos.";
  for (const tipo of ["combate", "chefe"]) {
    const sala = { tipo, inimigos: nomes.map((nome) => ({ nome })) };
    t(`${tipo}: a linha de tela é a de hoje, byte a byte`, M.linhaDaLuta(sala, nomes) === aviso_antigo(tipo, nomes));
    t(`${tipo}: o envelope é o de hoje, byte a byte`, M.envelopeDaLuta(sala, { pos, lista, depois }) === envelope_antigo(tipo, pos, lista, depois));
    t(`${tipo}: sem 'depois' o envelope também bate`, M.envelopeDaLuta(sala, { pos, lista }) === envelope_antigo(tipo, pos, lista, ""));
  }
  const g = { tipo: "chave", guardaChave: true, inimigos: [{ nome: "Carcereiro" }] };
  const linha = M.linhaDaLuta(g, ["Carcereiro"]);
  const env = M.envelopeDaLuta(g, { pos, lista: "Carcereiro (nv 3, 20 PV)", depois });
  t("guardião: a linha de tela traz o aviso e o nome de quem luta", linha.startsWith("⚔ ") && linha.includes("Carcereiro") && linha.includes("o combate está aberto"));
  t("guardião: o aviso não é o de emboscada nem o do chefe", !linha.includes("Emboscada") && !linha.includes("sala do chefe"));
  t("guardião: o envelope abre o HUD e proíbe 'combate_iniciar'", env.includes("COMBATE JÁ ABERTO PELO SISTEMA") && env.includes('NÃO envie "combate_iniciar"'));
  t("guardião: o envelope leva a posição, a lista e o 'depois'", env.includes(pos) && env.includes("Carcereiro (nv 3, 20 PV)") && env.endsWith(depois));
  t("guardião: o rótulo do envelope é GUARDIÃO", env.includes("· GUARDIÃO —"));
  t("guardião: o Narrador é proibido de dar a chave (quem decide é o sistema)", /chave/i.test(env) && /sistema/i.test(env));
  t("guardião: o envelope não é o do chefe", !env.includes("confronto final"));
  t("guardião: é curto como os outros (< 700 chars sem a lista e o depois)", env.length - depois.length - pos.length < 700);
  t("lixo: linhaDaLuta/envelopeDaLuta de sala que não luta devolvem string vazia", M.linhaDaLuta({ tipo: "tesouro" }, ["a"]) === "" && M.envelopeDaLuta(null, {}) === "" && M.linhaDaLuta(null, null) === "");
  t("lixo: opções null não estouram", typeof M.envelopeDaLuta({ tipo: "combate" }, null) === "string");
});

sec("3. vencer o guardião larga a chave, e o portão do chefe passa a abrir", () => {
  const mm0 = pequena();
  const antes = entrarNaSala(mm0, 3);
  t("antes: o chefe é `bloqueado` sem a chave", antes.bloqueado === true && antes.mm === mm0);
  const r = M.desfechoDaLuta(mm0, 2);
  t("o guardião resolve a sala", r.mm.salas.find((s) => s.id === 2).resolvida === true);
  t("e larga a chave (mm.chave true)", r.mm.chave === true);
  t("chaveNova é true, resolveuAgora é true, ehChefe é false", r.chaveNova === true && r.resolveuAgora === true && r.ehChefe === false);
  t("o aviso de tela é o de hoje", r.aviso === "🗝 Entre os despojos: a CHAVE do portão lacrado. O caminho para o chefe se abre.");
  t("a nota ao Narrador é a de hoje", r.nota === "[MASMORRA] Achei a chave do portão do chefe entre os restos do guardião. Mencione isso na narração.");
  const depois = entrarNaSala(r.mm, 3);
  t("depois: `entrarNaSala` no chefe passa (não bloqueado)", !depois.bloqueado && depois.mm.atual === 3);
  t("a saída para o chefe deixa de vir trancada", saidasDe({ ...r.mm, atual: 2 }).find((s) => s.id === 3).trancada === false);
  t("não mutou a masmorra recebida", mm0.chave === false && mm0.salas.find((s) => s.id === 2).resolvida === false);
  t("as outras salas ficam como estavam", r.mm.salas.filter((s) => s.id !== 2).every((s, i) => s === mm0.salas.filter((x) => x.id !== 2)[i]));
});

sec("4. vencer uma sala de combate resolve e NÃO dá chave", () => {
  const mm0 = pequena();
  const r = M.desfechoDaLuta(mm0, 1);
  t("a sala de combate fica resolvida", r.mm.salas.find((s) => s.id === 1).resolvida === true);
  t("não dá chave", r.mm.chave === false && r.chaveNova === false);
  t("resolveuAgora é true; sem aviso nem nota de chave", r.resolveuAgora === true && r.aviso === "" && r.nota === "");
  t("o chefe continua trancado", entrarNaSala(r.mm, 3).bloqueado === true);
  t("os saques não mudam", r.mm.saques.moedas === 0 && r.mm.saques.itens === 0);
});

sec("5. a sala do chefe vencida: resolve, e avisa que é o chefe", () => {
  const mm0 = { ...pequena(), chave: true };
  const r = M.desfechoDaLuta(mm0, 3);
  t("ehChefe é true", r.ehChefe === true);
  t("o chefe fica resolvido", r.mm.salas.find((s) => s.id === 3).resolvida === true);
  t("sem chave nova (ela já era sua)", r.chaveNova === false && r.aviso === "" && r.nota === "");
});

sec("6. idempotente: chamar duas vezes não duplica nada", () => {
  const mm0 = pequena();
  const a = M.desfechoDaLuta(mm0, 2);
  const b = M.desfechoDaLuta(a.mm, 2);
  t("a 2.ª vez: chaveNova false, resolveuAgora false", b.chaveNova === false && b.resolveuAgora === false);
  t("a 2.ª vez: nem aviso nem nota (não repete 'a CHAVE' na tela)", b.aviso === "" && b.nota === "");
  t("a 2.ª vez: a masmorra fica igual (a chave continua, a sala continua)", b.mm.chave === true && b.mm.salas.find((s) => s.id === 2).resolvida === true && JSON.stringify(b.mm) === JSON.stringify(a.mm));
  /* o caminho do Narrador e o do sistema chamam os dois: o segundo não pode pagar de novo */
  const c = M.desfechoDaLuta(M.desfechoDaLuta(M.desfechoDaLuta(mm0, 1).mm, 1).mm, 1);
  t("combate: três chamadas = uma só", JSON.stringify(c.mm) === JSON.stringify(M.desfechoDaLuta(mm0, 1).mm));
  t("combate 2.ª vez: resolveuAgora false", c.resolveuAgora === false);
  /* a chave achada por outro lado (já `mm.chave`) não é 'nova' ao vencer o guardião */
  const jaTem = M.desfechoDaLuta({ ...pequena(), chave: true }, 2);
  t("guardião vencido com a chave já na mão: sala resolve, chaveNova false", jaTem.resolveuAgora === true && jaTem.chaveNova === false && jaTem.aviso === "");
  /* save que ficou incoerente (guardião resolvido mas sem chave — o defeito, preso no disco): conserta, uma vez */
  const preso = pequena(); preso.salas[2] = { ...preso.salas[2], resolvida: true };
  const c1 = M.desfechoDaLuta(preso, 2), c2 = M.desfechoDaLuta(c1.mm, 2);
  t("guardião já resolvido sem chave: a chave cai (conserta o save preso)", c1.mm.chave === true && c1.chaveNova === true && c1.resolveuAgora === false);
  t("…e só uma vez", c2.chaveNova === false && c2.aviso === "");
});

sec("7. lixo: mm null, id inexistente, sala lixo", () => {
  const vazio = (r) => r && r.resolveuAgora === false && r.chaveNova === false && r.ehChefe === false && r.aviso === "" && r.nota === "";
  t("mm null: não estoura e devolve o nulo", vazio(M.desfechoDaLuta(null, 1)) && M.desfechoDaLuta(null, 1).mm === null);
  t("mm undefined", vazio(M.desfechoDaLuta(undefined, 1)));
  t("mm {} e mm sem salas", vazio(M.desfechoDaLuta({}, 1)) && vazio(M.desfechoDaLuta({ salas: null }, 1)));
  const mm0 = pequena();
  const x = M.desfechoDaLuta(mm0, 99);
  t("id inexistente: devolve a mesma masmorra, sem efeito", vazio(x) && x.mm === mm0);
  t("id null/undefined/string", vazio(M.desfechoDaLuta(mm0, null)) && vazio(M.desfechoDaLuta(mm0, undefined)) && vazio(M.desfechoDaLuta(mm0, "dois")));
  t("a entrada (id 0, já resolvida) não 'resolve' de novo", M.desfechoDaLuta(mm0, 0).resolveuAgora === false);
  t("sala nula dentro da lista não estoura", vazio(M.desfechoDaLuta({ ...mm0, salas: [null, ...mm0.salas] }, 99)));
});

sec("8. determinismo: mesma entrada, mesmo resultado", () => {
  const a = M.desfechoDaLuta(pequena(), 2), b = M.desfechoDaLuta(pequena(), 2);
  t("o desfecho é uma função pura da entrada", JSON.stringify(a) === JSON.stringify(b));
  const s = { tipo: "chave", inimigos: [{ nome: "A" }] };
  t("abreLuta/linhaDaLuta/envelopeDaLuta são puras", JSON.stringify(M.abreLuta(s)) === JSON.stringify(M.abreLuta(s)) && M.envelopeDaLuta(s, { pos: "p", lista: "l" }) === M.envelopeDaLuta(s, { pos: "p", lista: "l" }));
  const mm0 = pequena(), foto = JSON.stringify(mm0);
  M.desfechoDaLuta(mm0, 2); M.abreLuta(mm0.salas[2]); M.envelopeDaLuta(mm0.salas[2], { pos: "p", lista: "l" });
  t("nada disso muta o que recebe", JSON.stringify(mm0) === foto);
});

sec("9. a sala limpa continua igual para a chave (MM14)", () => {
  const mm0 = pequena();
  const ent = entrarNaSala(mm0, 2);
  t("antes de vencer: entrar na sala do guardião NÃO é sala limpa", ent.jaLimpa === false && voltarASalaLimpa(ent.sala, { pos: "p" }) === null);
  const venceu = M.desfechoDaLuta(ent.mm, 2).mm;
  const volta = entrarNaSala(venceu, 2);
  t("depois de vencer: entrar de novo é `jaLimpa`", volta.jaLimpa === true);
  const v = voltarASalaLimpa(volta.sala, { pos: "Prova · camada 1" });
  t("e a cena é a de SALA_LIMPA.chave", !!v && v.linha === M.SALA_LIMPA.chave.linha && v.envelope.includes(M.SALA_LIMPA.chave.oQueFicou));
  t("o envelope nomeia o guardião como caído", v.envelope.includes("Carcereiro") && v.envelope.includes("continua caído"));
  t("a tabela SALA_LIMPA continua cobrindo toda sala que luta", Object.keys(M.SALAS_DE_LUTA).every((k) => k in M.SALA_LIMPA));
  const combate = M.desfechoDaLuta(mm0, 1).mm;
  t("combate vencido pelo desfecho também é sala limpa ao voltar", entrarNaSala(combate, 1).jaLimpa === true);
});

sec("10. masmorras de verdade: entrar -> vencer o guardião -> entrar no chefe fecha", () => {
  const SEMENTES = 40, NIVEIS = [1, 3, 5, 8, 10, 14, 20];
  let total = 0, fecharam = 0, semLuta = 0, semChaveDoGuardiao = 0, chefeAbriuSemChave = 0, chaveDuplicada = 0, combateNaoResolveu = 0, combateDeuChave = 0, chefeLuta = 0;
  for (const nivel of NIVEIS) for (let sem = 1; sem <= SEMENTES; sem++) {
    total++;
    comSemente(nivel * 1000 + sem, () => {
      const mm0 = gerarMasmorra("Fantasia medieval", nivel, "Prova");
      const guardiao = mm0.salas.find((s) => s.tipo === "chave");
      const chefe = mm0.salas.find((s) => s.tipo === "chefe");
      if (!M.abreLuta(guardiao)) semLuta++;
      if (!M.abreLuta(chefe)) chefeLuta++;
      /* sem a chave, o portão do chefe está de pé */
      if (!entrarNaSala(mm0, chefe.id).bloqueado) chefeAbriuSemChave++;
      /* o caminho de verdade: do ponto de entrada até a sala do guardião sem passar pelo chefe */
      let mm = mm0;
      const rota = (() => {
        const via = new Map([[0, null]]); const fila = [0];
        while (fila.length) {
          const id = fila.shift();
          if (id === guardiao.id) break;
          for (const d of mm0.salas.find((s) => s.id === id).saidas) if (!via.has(d) && !mm0.salas.find((s) => s.id === d).trancada) { via.set(d, id); fila.push(d); }
        }
        const r = []; for (let c = guardiao.id; c !== null && c !== undefined; c = via.get(c)) r.unshift(c);
        return r.slice(1);
      })();
      for (const id of rota) {
        const e = entrarNaSala(mm, id);
        if (e.bloqueado) return;
        mm = e.mm;
        const sala = e.sala;
        if (M.abreLuta(sala)) {
          const d = M.desfechoDaLuta(mm, id);
          mm = d.mm;
          if (sala.tipo === "combate") { if (!mm.salas.find((s) => s.id === id).resolvida) combateNaoResolveu++; if (mm.chave && !mm0.chave && id !== guardiao.id) combateDeuChave++; }
          if (id === guardiao.id) {
            if (!d.chaveNova || !mm.chave) semChaveDoGuardiao++;
            const dois = M.desfechoDaLuta(mm, id);
            if (dois.chaveNova) chaveDuplicada++;
          }
        } else mm = marcarResolvida(mm, id);
      }
      if (!mm.chave) return;
      /* com a chave: andar até o chefe pelas saídas (recuando se preciso) e entrar */
      const visto = new Set([mm.atual]); const fila = [mm.atual];
      let chegou = false;
      while (fila.length && !chegou) {
        const id = fila.shift();
        const mmAqui = { ...mm, atual: id };
        for (const s of [...saidasDe(mmAqui), ...saidasDeRecuo(mmAqui)]) {
          if (visto.has(s.id)) continue;
          visto.add(s.id); fila.push(s.id);
          if (s.id === chefe.id && !s.trancada) chegou = true;
        }
      }
      /* e de fato entrar nele, pela API do jogo */
      const paraChefe = chegou ? entrarNaSala(mm, chefe.id) : { bloqueado: true };
      if (chegou && !paraChefe.bloqueado && paraChefe.sala.tipo === "chefe") fecharam++;
    });
  }
  console.log(`      ${total} masmorras (${NIVEIS.length} níveis x ${SEMENTES} sementes) · fecharam ${fecharam}`);
  t("toda masmorra tem um guardião que abre luta", semLuta === 0);
  t("o chefe abre luta em todas", chefeLuta === 0);
  t("sem a chave, o portão do chefe está de pé em todas", chefeAbriuSemChave === 0);
  t("vencer o guardião larga a chave em todas", semChaveDoGuardiao === 0);
  t("a chave nunca é duplicada na segunda chamada", chaveDuplicada === 0);
  t("sala de combate vencida fica resolvida em todas", combateNaoResolveu === 0);
  t("sala de combate vencida nunca deu a chave", combateDeuChave === 0);
  t("o caminho entrar -> guardião -> chefe fecha em TODAS", fecharam === total);
});

sec("11. a fiação no App: a porta chama a tabela, e as DUAS portas de vitória chamam o desfecho", () => {
  const APP = readFileSync("../src/App.jsx", "utf8");
  /* o corpo de uma função do componente: do 'const nome =' até o próximo 'const' a 2 espaços de recuo (o interior tem 4 ou mais) */
  const corpo = (nome) => {
    const i = APP.indexOf("  const " + nome + " = ");
    if (i < 0) return "";
    const j = APP.indexOf("\n  const ", i + 10);
    return APP.slice(i, j < 0 ? undefined : j);
  };
  const conta = (txt, trecho) => txt.split(trecho).length - 1;
  const irPara = corpo("irParaSala"), resolver = corpo("resolverSalaAposCombate"), fecha = corpo("fecharSeTodosCairam"), helper = corpo("concluirMasmorraDoChefe");

  const linhaImp = (APP.match(/^import \{[^}]*\} from "\.\/masmorras\.js";$/m) || [""])[0];
  t("o import de masmorras.js traz as quatro funções novas (a fiação é uma linha só)", ["abreLuta", "linhaDaLuta as linhaDaLutaDaSala", "envelopeDaLuta", "desfechoDaLuta"].every((n) => linhaImp.includes(n)));

  /* (a) o Guardião: a porta decide pela TABELA, não por um 'combate || chefe' à mão — foi o OU à mão que deixou a chave de fora */
  t("irParaSala abre luta por abreLuta(sala)", irPara.includes("abreLuta(sala)"));
  t("irParaSala NÃO tem mais o teste à mão 'combate || chefe' (era o buraco do Guardião)", !/sala\.tipo === "combate" \|\| sala\.tipo === "chefe"/.test(irPara));
  t("a linha de tela vem de linhaDaLuta (importada como linhaDaLutaDaSala: adversario.js já exporta outra linhaDaLuta), e o envelope de envelopeDaLuta", irPara.includes("linhaDaLutaDaSala(sala") && irPara.includes("envelopeDaLuta(sala"));
  t("o 'depois' do envelope é o que sempre se colou ao fim (desgaste + percepção + tempo), nessa ordem", irPara.includes("depois: `${notaDesgaste}${avisoSegredo}${extraTempo}`"));
  /* o texto vive na tabela, num lugar só: se voltar ao App, as duas cópias divergem */
  t("o texto inline antigo saiu do App ('Emboscada na masmorra!' vive em SALAS_DE_LUTA)", !APP.includes("Emboscada na masmorra!") && M.SALAS_DE_LUTA.combate.aviso === "Emboscada na masmorra!");
  t("nem 'A sala do chefe!' nem o envelope 'COMBATE JÁ ABERTO' moram mais no App", !APP.includes("A sala do chefe!") && !APP.includes("COMBATE JÁ ABERTO PELO SISTEMA"));
  /* o desgaste é do chefe e só dele: o guardião entra na luta com a vida que o gerador deu */
  t("o desgaste (chefeDesgastado) continua só para tipo === 'chefe'", /if \(sala\.tipo === "chefe"\) \{\s*const dg = chefeDesgastado\(/.test(irPara));
  /* o ramo 'a sala não abre combate, ela se resolve agora' não pode resolver a chave: é a LUTA que a resolve (e que larga a chave) */
  const ramoResolve = (irPara.match(/if \(sala\.tipo !== "combate"[^\n]*\{/) || [""])[0];
  t("a sala 'chave' NÃO se resolve ao entrar (a luta a resolve)", ramoResolve.includes('sala.tipo !== "chave"') && ramoResolve.includes('sala.tipo !== "combate"') && ramoResolve.includes('sala.tipo !== "chefe"'));
  t("e a luta marca a sala em curso (salaEmCursoRef) para o desfecho achá-la", irPara.includes("salaEmCursoRef.current = id"));

  /* (b) o desfecho: uma função só, a do módulo puro */
  t("resolverSalaAposCombate usa desfechoDaLuta", resolver.includes("desfechoDaLuta(mm, id)"));
  t("…e não resolve nem larga a chave por conta própria (marcarResolvida saiu dali)", !resolver.includes("marcarResolvida("));
  t("…e solta salaEmCursoRef (a 2.ª chamada é inócua)", resolver.includes("salaEmCursoRef.current = null"));
  t("a tela e a nota da chave vêm do desfecho (r.aviso, r.nota), não de texto à mão", resolver.includes("r.aviso") && resolver.includes("r.nota") && !resolver.includes("CHAVE do portão"));

  /* a outra porta: a vitória que o SISTEMA fecha (o golpe que derruba o último) — era ela que deixava a sala resolvida:false */
  t("o fecho do sistema (fecharSeTodosCairam) chama resolverSalaAposCombate", fecha.includes("resolverSalaAposCombate()"));
  t("…só com masmorra viva e uma sala em curso, e dentro de try/calou (nunca custa o turno)", /try \{[^}]*masmorraRef\.current && salaEmCursoRef\.current !== null[\s\S]*?\} catch \(e\) \{ calou\(/.test(fecha));
  t("…e o chefe conclui a masmorra pelo helper, também por esta porta", fecha.includes("concluirMasmorraDoChefe("));

  /* o chefe: UM bloco de recompensa, chamado pelas duas portas — duplicar é pagar o tesouro duas vezes (ou só numa das portas) */
  t("existe um helper local que conclui a masmorra pelo chefe", helper.length > 0);
  t("a recompensa do chefe é chamada num lugar só (o helper)", conta(APP, "recompensaChefe(") === 1 && helper.includes("recompensaChefe("));
  t("a masmorra concluída conta num lugar só", conta(APP, 'bumpCont("masmorrasConcluidas")') === 1 && helper.includes('bumpCont("masmorrasConcluidas")'));
  t("o helper larga a masmorra (masmorraRef = null): a 2.ª porta não encontra chefe e não paga de novo", helper.includes("masmorraRef.current = null") && helper.includes("setMasmorra(null)"));
  t("o helper devolve a ficha nova ({ pers, concluiu }), sem mutar a recebida", helper.includes("return { pers: p2, concluiu: true }") && !/\bp\.(moedas|equipamento|essencia) =/.test(helper));
  t("a porta do Narrador (a resposta com vitória) chama o MESMO helper (2 chamadas: a do Narrador e a do sistema)", conta(APP, "concluirMasmorraDoChefe(") === 2);
});

console.log(`\nmasmorra-fim: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
