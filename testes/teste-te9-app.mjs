/* ============================================================
   TE9 + TE10 · A FIAÇÃO DOS ESPÓLIOS NO App.jsx (09/11/2026)
   testes/teste-te9-app.mjs

   O motor (motor/quests-do-turno.js, a paga e os achados) prova-se em
   teste-te9-motor; as peças da cerimónia (painel-espolio.jsx,
   espolio-na-tela.js) em teste-painel-espolio e teste-espolio-na-tela.
   Esta suíte é de TEXTO e é curta: prova que o App as liga onde a planta
   manda (formas.md §TE 11, a parte do `oficial`).

     1. o estado das quests leva o chão e a luta, e o chão que o motor
        devolve volta ao App;
     2. o `feitoDoTurno` sai do aplicar e só entra no fim do turno (os dois
        sítios), nunca na criação do mundo;
     3. a ordem «revelacao» vai à fila das cerimónias (ou à faixa do fecho),
        e a ordem desconhecida vai ao calou;
     4. «Equipar já» é o MESMO equipar da gaveta;
     5. a fila: espólio → nível → despertar, nunca com a luta aberta, nada no
        save, e esquecida com o recibo;
     6. tudo em calou;
     7. (TE11, 09/11) a lenda, a carta de costas e o som: o interruptor no
        menu, o dado do Véu que soa, a carta no Diário, o tom pelo sistema,
        a paga que já está na mochila e os achados no recibo.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { oQueOEfeitoPede } from "../src/motor/efeitos-da-quest.js";
import { entrarNaFila, proximaCerimonia, formaDoEspolio } from "../src/espolio-na-tela.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const app = fs.readFileSync(path.join(AQUI, "..", "src", "App.jsx"), "utf8");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  FALHA  " + nome + (extra ? " — " + extra : "")); }
};
const conta = (agulha) => app.split(agulha).length - 1;
/* o corpo de uma função do App: de «const nome = » até à próxima
   declaração no mesmo recuo (duas casas) */
const corpo = (nome) => {
  const i = app.indexOf("\n  const " + nome + " = ");
  if (i < 0) return "";
  const j = app.indexOf("\n  const ", i + 10);
  return app.slice(i, j < 0 ? undefined : j);
};

console.log("\n1. o chão e a luta no estado das quests");
{
  const eq = corpo("estadoDasQuests");
  t("o estado das quests leva o chão", eq.includes("chao: chaoRef.current"));
  t("e a luta", eq.includes("combate: combateRef.current"));
  const aq = corpo("aplicarAsQuests");
  t("o chão que o motor devolve volta ao ref e à tela, em calou",
    aq.includes('try { if (e.chao) { chaoRef.current = e.chao; setChao(e.chao); } } catch (err) { calou("BQ7 · " + onde + " · o chão", err); }'));
  t("a ficha de antes da paga é tirada antes de a nova entrar", aq.indexOf("const fichaAntes = personagemRef.current || personagem;") >= 0
    && aq.indexOf("const fichaAntes") < aq.indexOf("if (e.personagem) { personagemRef.current = e.personagem;"));
  t("e vai a cada efeito", aq.includes("aplicarEfeitoDaQuest(ef, { fichaAntes, onde })"));
}

console.log("\n2. o feito do turno: do aplicar ao fim do turno, e só lá");
{
  const iA = app.indexOf("    aplicarOsEfeitos(saida);\n");
  const iF = app.indexOf("feitoDoTurnoRef.current = feito != null ? { grau: feito, nivel: (pers && pers.nivel) || null } : null;");
  const iP = app.indexOf("    pers = saida.estado.personagem;\n");
  t("o feito guarda-se logo a seguir ao aplicar", iA > 0 && iF > iA);
  t("com o nível de ANTES (pers ainda é a ficha da entrada)", iF > 0 && iF < iP);
  /* Movida a 13/11 (o feito é do sistema): o feito que a quest abate passa a ser
     o que o aplicar PAGOU (`saida.feitoDoTurno`, do sistema ou o maior dos dois
     em mestre); o `mudancas.feito` da IA fica só como reserva, para o turno sem
     doSistema. A intenção é a mesma: a quest desconta o feito deste turno. */
  t("o feito sai do que o aplicar pagou, e o da IA é reserva", app.includes("const feito = saida && saida.feitoDoTurno ? saida.feitoDoTurno.grau : (saida && saida.podado && saida.podado.mudancas ? saida.podado.mudancas.feito : null);"));
  t("o ref do feito não vai ao save", !/salvar\([^)]*feitoDoTurno/.test(app) && conta("feitoDoTurnoRef") >= 3);
  t("tomar o feito limpa o ref", corpo("tomarOFeitoDoTurno").includes("const f = feitoDoTurnoRef.current; feitoDoTurnoRef.current = null; return f || null;"));
  t("correrAsQuests passa o feito ao motor", corpo("correrAsQuests").includes("oTurnoDasQuests(estadoDasQuests(), { mundo: mundoDoLivro(), feitoDoTurno })"));
  t("o feito entra nos dois sítios do fim do turno",
    app.includes('correrAsQuests("o fim do turno", feitoDeste)') && app.includes('correrAsQuests("o fim do turno, sem o Cronista", feitoDeste)'));
  t("e só neles (o feito tira-se duas vezes, uma por sítio)", conta("const feitoDeste = tomarOFeitoDoTurno();") === 2 && conta("tomarOFeitoDoTurno()") === 2);
  t("a criação do mundo não leva feito", app.includes('correrAsQuests("a criação do mundo");'));
}

console.log("\n3. a ordem «revelacao» vai à fila; a desconhecida, ao calou");
{
  const ap = corpo("aplicarEfeitoDaQuest");
  t("a revelação entra pelo receberOEspolio", ap.includes('} else if (o.ordem === "revelacao") {') && ap.includes("receberOEspolio(o, ctx);"));
  t("a ordem desconhecida vai ao calou (não passa calada)", /\} else \{\s*\/\*[^*]*\*\/\s*calou\("BQ7 · ordem sem órgão no App: " \+ o\.ordem, new Error\(EFEITOS_NA_TELA\.semOrgao\)\);\s*\}/.test(ap));
  const re = corpo("receberOEspolio");
  t("a forma decide-a o módulo (formaDoEspolio), nunca o App", re.includes("const forma = formaDoEspolio(entradas);"));
  t("sem peça: a faixa do fecho", re.includes('if (forma === "fecho") {') && re.includes("setFechoDaQuest({"));
  /* visto no navegador (09/11): a escolha confirmada parte logo o turno que
     a narra, e o envio desse turno apagava a faixa no mesmo clique */
  t("a faixa da escolha sobrevive ao envio que a escolha partiu", re.includes('vaiComOEnvio: !!(ctx && ctx.onde === "a escolha")'));
  t("com peça: a cerimónia entra na fila (entrarNaFila)", re.includes('tipo: "espolio"') && re.includes("entrarNaFila(f, c)"));
  t("a mesma paga não entra duas vezes (a chave)", re.includes("f.some((x) => x && x.chave === chave) ? f : entrarNaFila(f, c)"));
  /* a ordem é a do módulo puro: provada aqui sobre um efeito de verdade */
  const ef = { tipo: "espolio", quest: "q1", titulo: "A Capela", paga: { chave: "espolio:q1", xp: 40, moedas: 12, itens: [{ nome: "Lâmina Curta", tipo: "arma", raridade: "raro", atributos: { dano: 2 } }], efeitos: [], achados: [] } };
  const ord = oQueOEfeitoPede(ef, { personagem: { nome: "Vera", equipados: {}, equipamento: [] }, combate: null });
  t("o efeito «espolio» vira a ordem «revelacao»", ord.length === 1 && ord[0].ordem === "revelacao" && ord[0].quest === "q1" && Array.isArray(ord[0].revelacao));
  t("e com peça a forma é a cerimónia", formaDoEspolio(ord[0].revelacao) === "cerimonia");
  const sem = oQueOEfeitoPede({ ...ef, paga: { ...ef.paga, itens: [] } }, { personagem: { nome: "Vera" }, combate: null });
  t("sem peça, a faixa do fecho", sem.length === 1 && formaDoEspolio(sem[0].revelacao) === "fecho");
}

console.log("\n4. «Equipar já» é o mesmo equipar da gaveta");
{
  const ee = corpo("equiparDoEspolio");
  t("chama equipar (o da gaveta: equipar={equipar})", /\bequipar\(naMochila\);/.test(ee) && app.includes(" equipar={equipar} "));
  t("e não monta a troca à mão (nada de equipados nem setPersonagem)", !/equipados|setPersonagem|mudarFicha/.test(ee));
  /* MOVIDA (09/11, TE11): a paga já entra na mochila pelo motor; o «Equipar
     já» só tira do chão a peça QUE ELE EQUIPA, e só se ela não coube
     (`noChao`). A intenção fica: antes de equipar, o recolher de sempre. */
  t("antes, a peça (se ficou no chão) sai dele pelo recolher de sempre", ee.indexOf("recolherDaPaga(c, item);") >= 0 && ee.indexOf("recolherDaPaga(c, item);") < ee.indexOf("equipar(naMochila)")
    && corpo("recolherDaPaga").includes("recolherDoChao(item ? ids.slice(0, 1) : ids)"));
  t("o painel recebe esse handler", app.includes("aoEquipar={(item) => equiparDoEspolio(c, item)}"));
  /* MOVIDA (09/11, TE11): «Guardar na mochila» continua verdade, mas quem a
     cumpre é o motor (ESPOLIO_NO_TURNO.mochila). Fechar só fecha; recolher
     aqui tiraria do chão a peça que não coube, contra o que a carta disse. */
  t("fechar já não recolhe: só sai da cerimónia", !corpo("fecharOEspolio").includes("recolherDaPaga") && corpo("fecharOEspolio").includes("sairDaCerimonia(c);"));
}

console.log("\n5. a fila das cerimónias");
{
  t("a fila e a faixa são estado de tela (useState), fora do save", app.includes("const [filaDasCerimonias, setFilaDasCerimonias] = useState([]);")
    && !/salvar\([^)]*(filaDasCerimonias|fechoDaQuest)/.test(app));
  const cf = corpo("cerimoniaDaFilaAgora");
  t("nunca com a luta aberta (proximaCerimonia com lutaAberta)", cf.includes("proximaCerimonia(fila, { lutaAberta: !!combate })"));
  t("a subida entra na fila como lugar, e não abre por aqui", cf.includes('entrarNaFila(filaDasCerimonias, { tipo: "nivel" })') && cf.includes('c.tipo !== "nivel" ? c : null'));
  t("a subida espera o espólio que está na fila", app.includes('if (filaDasCerimonias.some((c) => c && c.tipo === "espolio")) return;\n      if ((personagem?.nivelPendentes || 0) > 0) abrirCerimoniaDoNivel();'));
  t("o despertar entra pela comparação do módulo (despertarNaTela)", corpo("acordouNaQuest").includes("despertarNaTela(velho, novo,") && corpo("acordouNaQuest").includes('tipo: "despertar"'));
  t("as cerimónias esquecem-se com a campanha (nova e save carregado)", corpo("esquecerAsCerimonias").includes("setFilaDasCerimonias([]); setFechoDaQuest(null); feitoDoTurnoRef.current = null;")
    && app.includes('calou("esquecer o recibo (campanha nova)", e); }\n    esquecerAsCerimonias();') && app.includes('calou("esquecer o recibo (save carregado)", e); }\n      esquecerAsCerimonias();'));
  /* visto no navegador (09/11): o turno que cai depois de confirmar uma
     escolha repõe a ficha do envio (aplicarRetrato → esquecerORecibo), com
     a paga dentro — se o recibo levasse a fila, a cerimónia sumia e a paga
     ficava. O turno desfeito NÃO esquece as cerimónias. */
  t("o turno desfeito não esquece as cerimónias", !corpo("esquecerORecibo").includes("setFilaDasCerimonias") && conta("esquecerAsCerimonias();") === 2);
  t("a faixa do fecho vive até o turno seguinte começar", app.includes('try { setFechoDaQuest((f) => (f && f.vaiComOEnvio ? { ...f, vaiComOEnvio: false } : null)); } catch (e) { calou("TE10 · a faixa do fecho (envio)", e); }'));
  /* a ordem da fila é a da tabela: provada sobre o módulo */
  let f = [];
  f = entrarNaFila(f, { tipo: "despertar", chave: "d" });
  f = entrarNaFila(f, { tipo: "espolio", chave: "e" });
  f = entrarNaFila(f, { tipo: "nivel" });
  t("espólio → nível → despertar", f.map((c) => c.tipo).join(">") === "espolio>nivel>despertar");
  t("com a luta aberta, nada", proximaCerimonia(f, { lutaAberta: true }) === null);
}

console.log("\n6. tudo em calou (nunca custa o turno nem a recompensa)");
{
  for (const nome of ["receberOEspolio", "acordouNaQuest", "sairDaCerimonia", "recolherDaPaga", "equiparDoEspolio", "fecharOEspolio", "cerimoniaDaFilaAgora", "tomarOFeitoDoTurno", "esquecerAsCerimonias"]) {
    const c = corpo(nome);
    t(nome + " em try/calou", c.includes("try {") && c.includes("calou(\"TE"));
  }
  t("as duas cerimónias e a faixa vivem num LimiteDaCerimonia com a sua chave", conta("<LimiteDaCerimonia key={c.chave}") === 2 && app.includes("<LimiteDaCerimonia key={fechoDaQuest.chave}"));
  t("a que estoura sai da fila e cala-se", conta('aoEstourar={(err) => { calou("TE10 · a cerimónia do') === 2);
  t("o despertar na aplicação das quests, em calou", app.includes('try { if (e.personagem) acordouNaQuest(fichaAntes, e.personagem); } catch (err) { calou("TE10 · " + onde + " · o despertar", err); }'));
  t("nada de som", !/new Audio\(|AudioContext/.test(corpo("receberOEspolio") + corpo("equiparDoEspolio") + corpo("fecharOEspolio")));
}

console.log("\n7. TE11 · a lenda, a carta de costas, o som, e os restos da TE10");
{
  /* o interruptor do som mora no menu, logo abaixo das rolagens do mundo */
  const iRol = app.indexOf("mostrar os dados que o Mestre rola por trás do escudo");
  const iSom = app.indexOf("<InterruptorDoSom />");
  const iMenu = app.indexOf("⌂ Sair para o início");
  t("o interruptor do som no menu, logo abaixo das rolagens", iRol > 0 && iSom > iRol && iSom < iMenu && conta("<InterruptorDoSom") === 1);
  t("e vem da peça (ui.jsx), sem estado no App", /import \{[^}]*\bInterruptorDoSom\b[^}]*\} from "\.\/ui\.jsx"/.test(app) && !/["']taverna_cfg_som["']/.test(app));
  /* o dado do Véu soa quando pousa, uma vez, em calou */
  const iOv = app.indexOf("function OverlayDado(");
  const ov = app.slice(iOv, app.indexOf("\n}\n", iOv));
  t("o tocarDado no Véu, quando o d20 pousa", /import \{ tocarDado \} from "\.\/som-da-mesa\.js"/.test(app)
    && ov.indexOf("tocarDado()") > ov.indexOf('setFaseD("resultado");'));
  t("uma vez só por véu (o refazer não volta a soar), e em calou", ov.includes('if (!soouRef.current) { soouRef.current = true; try { tocarDado(); } catch (e) { calou("TE · o som do dado no véu", e); } }')
    && conta("tocarDado()") === 1);
  t("nem a carta nem o despertar se tocam no App (já soam nas peças)", !/tocarCarta|tocarDespertar/.test(app));
  /* a carta de costas no Diário: a prop nos dois Diários, lida do sistema */
  t("a prop raridadeDaRecompensa nos dois Diários", conta("raridadeDaRecompensa={raridadeDaRecompensaDe(bq)}") === 2);
  const iRr = app.indexOf("function raridadeDaRecompensaDe(bq) {");
  const rr = app.slice(iRr, app.indexOf("\n}\n", iRr));
  t("o degrau vem do sistema (podePagar), e sem esqueleto a prop é null", rr.includes("missao.podePagar") && rr.includes("if (!qs.length) return null;") && rr.includes("calou("));
  /* o tom do coração vem do sistema (tomDaRevelacao), a lembrança de recurso */
  const re = corpo("receberOEspolio");
  t("o tom pelo sistema", re.includes('const coracao = typeof o.tom === "string" && o.tom ? o.tom === "coracao"') && re.includes('genero === "lembranca"'));
  t("o nome do favor pelo sistema (nomesDosFavores)", app.includes('nomeDoFavor={(p) => { try { return ganhoDoEspolio(c.entradas).nomesDosFavores[p] || ""; }'));
  /* a paga já está na mochila: o recolher só leva a que não coube */
  t("o recolher só procura a peça que não coube (noChao)", corpo("recolherDaPaga").includes("e.noChao === true"));
  t("o recolher já não corre ao fechar", !corpo("fecharOEspolio").includes("recolherDaPaga") && conta("recolherDaPaga(") === 1);
  /* os achados do turno: os primeiros chips do recibo da última resposta */
  const aq = corpo("aplicarAsQuests");
  t("os achados no recibo, lidos de r.achados e em calou", aq.includes('try { if (Array.isArray(r.achados) && r.achados.length) porOsAchadosNoRecibo(r.achados); } catch (err) { calou("TE11 · " + onde + " · os achados no recibo", err); }'));
  const pa = corpo("porOsAchadosNoRecibo");
  t("o chip lê-se do módulo (chipDoAchado), com a ficha de agora", pa.includes("chipDoAchado(a, heroi)") && /import \{[^}]*\bchipDoAchado\b[^}]*\} from "\.\/espolio-na-tela\.js"/.test(app));
  t("à frente do recibo, na última resposta do Mestre, sem repetir", pa.includes("recibo: [...novos, ...ja]") && pa.includes('m.autor !== "mestre"') && pa.includes("!ja.some((x) => mesmo(x, c))"));
  t("e o relato recebe o toque que abre o exame do chão", conta("achados={achadosDoRelato}") === 3 && app.includes("setExaminando(true); } catch (e) { calou(\"TE11 · o achado abre o chão\""));
  const relato = fs.readFileSync(path.join(AQUI, "..", "src", "painel-relato.jsx"), "utf8");
  t("o relato desenha o achado com a peça dele (ChipDoAchado), antes do Recibo", /import \{ ChipDoAchado \} from "\.\/painel-espolio\.jsx"/.test(relato)
    && relato.indexOf("<ChipDoAchado") > 0 && relato.indexOf("<Recibo chips={resto}", relato.indexOf("<ChipDoAchado")) > relato.indexOf("<ChipDoAchado"));
  t("porOsAchadosNoRecibo em try/calou", pa.includes("try {") && pa.includes('calou("TE11'));
}

console.log(`\nte9-app: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
