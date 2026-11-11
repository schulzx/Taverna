/* A FIAÇÃO DA MC3 (Fase MC, 11/11/2026) — o Mestre chama o dado, no App.jsx

   O motor (`motor/o-mestre-chama.js`, MC2) e as peças (`ChamadoDoMestre`,
   `LinhaDoChamado`, `RolaPorMim`, MC3 do aprendiz) já estavam provados; o que
   faltava era o App PARAR o teste da frase entre o veredito e o dado. Esta
   suíte lê o App por âncora (planta §5, MC3) e prende as três promessas:

     1. O RESOLVER NÃO LANÇA SEM TOQUE OU PREFERÊNCIA. `rolarDesafio` abre o
        chamado e volta; o d20 só se lança por `lancarOChamado`, e só o
        chamam o toque (a bandeja, o dado do campo, o Enter com o campo
        vazio) e o relógio da preferência «o Mestre rola por mim».
     2. COM ERRO, LANÇA COMO HOJE. O chamado que estoura ao abrir deixa as
        linhas entrar e o dado do campo em Rolar; o que estoura no toque abre
        o Véu (setDadoRolando).
     3. «MUDAR DE IDEIA» NÃO REGISTA TENTATIVA NEM PASSA TEMPO. Nem
        fecharTentativa, nem cobrarTempoDoDesafio, nem o Narrador: a rolagem
        sai e a frase volta ao campo.

   E duas que a forma pede: o chamado é estado de tela (nunca no save), e o
   dado do chamado é o do Véu (a mesma semente, a mesma conta). */
import fs from "node:fs";

/* SEM COMENTÁRIO: as réguas abaixo procuram chamadas, e a história escrita
   nos comentários do App diria os mesmos nomes. */
const semComentarios = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(fs.readFileSync("../src/App.jsx", "utf8"));

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* o corpo de uma const-função do componente: da âncora até à próxima
   declaração no mesmo recuo (dois espaços) */
const corpo = (nome) => {
  const i = APP.indexOf(`\n  const ${nome} = `);
  if (i < 0) return "";
  const resto = APP.slice(i + 1);
  const m = /\n  (?:const |useEffect\(|let |function )/.exec(resto.slice(10));
  return m ? resto.slice(0, m.index + 10) : resto;
};

sec("0. O APP LÊ O MOTOR E AS PEÇAS");
{
  /* EM3 (11/11): a linha do import cresceu (o saber do herói, a régua que
     cala, o envelope e a espera da vela); a promessa é a mesma — o App lê
     oChamado e O_CHAMADO do motor —, por isso a régua passou a aceitar mais
     nomes na mesma linha em vez de exigir só os dois. */
  t("importa oChamado e O_CHAMADO do motor", /import \{ oChamado, O_CHAMADO[^}]*\} from "\.\/motor\/o-mestre-chama\.js";/.test(APP));
  t("importa o saber do herói, a régua, o envelope e a espera (EM3)", /import \{[^}]*\bsaberDoHeroi\b[^}]*\bporQueNaoChama\b[^}]*\bsaberComumDe\b[^}]*\benvelopeDoSaberComum\b[^}]*\besperaDoChamado\b[^}]*\} from "\.\/motor\/o-mestre-chama\.js";/.test(APP));
  t("importa momentoDoChamado da bandeja", /import \{ Bandeja, momentoDoChamado \} from "\.\/painel-bandeja\.jsx";/.test(APP));
  t("importa LinhaDoChamado e RolaPorMim do ui", /LinhaDoChamado, RolaPorMim \} from "\.\/ui\.jsx"/.test(APP));
  t("a fala do Mestre vai à folha (LinhaDoChamado)", /<LinhaDoChamado chamado=\{chamadoVivo\.chamado\} \/>/.test(APP));
  t("a soleira recebe momentos.chamado (momentoDoChamado)", /momentoDoChamado\(\{[\s\S]{0,400}aoRolar: lancarOChamado, aoMudar: mudarDeIdeia, aoPousar: pousouOChamado, telefone: !mesaLarga/.test(APP));
  t("a preferência mora no PainelLateral, ao lado das rolagens à vista", /<RolaPorMim ligado=\{rolaPorMim\} aoAlternar=\{aoAlternarRolaPorMim\} \/>/.test(APP));
}

sec("1. O RESOLVER NÃO LANÇA SEM TOQUE OU PREFERÊNCIA");
{
  const rd = corpo("rolarDesafio");
  t("rolarDesafio existe e abre o chamado", rd.length > 0 && /abriu = abrirOChamado\(v, novaRolagem, /.test(rd));
  t("rolarDesafio não lança o dado (nem Véu, nem lance, nem pouso)", !/setDadoRolando|lancarOChamado|lanceDoChamado|concluirRolagem/.test(rd));
  t("sem chamado, as linhas do teste entram já (o caminho de hoje)", /if \(!abriu\) pushMsgs\(linhasDoTeste\);/.test(rd));

  const ab = corpo("abrirOChamado");
  /* o único lance dentro de abrirOChamado é o do pedido do Mestre JÁ TOCADO */
  const semRamoDoPedido = ab.replace(/if \(armado && armado\.frase === ch\.frase\) \{[\s\S]*?return true;\s*\}/, "");
  t("abrirOChamado só lança no ramo do pedido já tocado", /if \(armado && armado\.frase === ch\.frase\)/.test(ab) && !/lanceDoChamado|setDadoRolando|concluirRolagem/.test(semRamoDoPedido));
  t("o pedido armado consome-se ao abrir (não sobra para a frase seguinte)", /pedidoArmadoRef\.current = null;/.test(ab));

  /* quem chama lancarOChamado: o Enter vazio, o dado do campo, a bandeja (aoRolar) e o relógio */
  const chamadas = APP.match(/lancarOChamado\(\)/g) || [];
  t(`lancarOChamado() tem exatamente duas chamadas diretas (Enter e dado do campo): ${chamadas.length}`, chamadas.length === 2);
  t("o Enter só lança com o campo vazio; com texto, o pulso", /if \(!String\(entradaRef\.current \|\| ""\)\.trim\(\)\) lancarOChamado\(\); else setPulsoDoChamado\(\(n\) => n \+ 1\);/.test(corpo("enterNoChamado")) && /if \(enterNoChamado\(\)\) return;/.test(corpo("lancarODado")));
  t("o dado do campo lança o da soleira", /if \(chamadoRef\.current && !chamadoRef\.current\.lance && !carregando\) \{ lancarOChamado\(\); return; \}/.test(corpo("tocarNoDado")));
  const pelaRef = APP.match(/lancarOChamadoRef\.current\(\)/g) || [];
  t("o relógio é a única chamada pela ref", pelaRef.length === 1);
  t("e o relógio só corre com a preferência ligada", /if \(!ch \|\| ch\.lance \|\| !rolaPorMim\) return undefined;[\s\S]{0,300}lancarOChamadoRef\.current\(\)/.test(APP));
  t("a preferência começa desligada e lê-se em try/catch", /localStorage\.getItem\("taverna_cfg_rolaPorMim"\) === "1"; \} catch \{ return false; \}/.test(APP));
  t("o dado do campo fica em repouso enquanto o Mestre chama", /const estadoDado = chamadoVivo && !\(carregando \|\| oMestreTecendo\) \? "repouso" : estadoDoDado\(/.test(APP));
}

sec("2. COM ERRO, LANÇA COMO HOJE");
{
  t("abrir o chamado em try/catch com calou (e então as linhas entram)", /try \{\s*abriu = abrirOChamado\([\s\S]*?\} catch \(e\) \{ calou\("MC3 · abrir o chamado", e\); abriu = false; \}/.test(corpo("rolarDesafio")));
  t("oChamado que estoura cala-se e devolve null", /\} catch \(e\) \{ calou\("MC3 · oChamado", e\); return null; \}/.test(corpo("chamadoDoVeredito")));
  const lc = corpo("lancarOChamado");
  t("o toque que estoura abre o Véu (setDadoRolando(true))", /catch \(e\) \{[\s\S]*?calou\("MC3 · o toque no chamado", e\);[\s\S]*?setDadoRolando\(true\)/.test(lc));
  t("e devolve as linhas do teste ao relato", /pushMsgs\(ch\.linhas \|\| \[\]\)/.test(lc));
  t("o pedido do Mestre sem chamado volta ao cartão de sempre", /if \(chP\) \{[\s\S]*?return;\s*\}\s*const c = oCartaoDoPedido\(p, v, /.test(APP));
}

sec("3. «MUDAR DE IDEIA» NÃO REGISTA TENTATIVA NEM PASSA TEMPO");
{
  const md = corpo("mudarDeIdeia");
  t("mudarDeIdeia existe", md.length > 0);
  t("não regista tentativa", !/fecharTentativa|fecharArmadilhaDoTeste/.test(md));
  t("não passa tempo", !/cobrarTempoDoDesafio|avancarMinutos|passarTempo/.test(md));
  t("não chama o Narrador nem conclui a rolagem", !/enviar\(|concluirRolagem|pushMsgs/.test(md));
  t("a rolagem sai e a frase volta ao campo", /setRolagem\(null\)/.test(md) && /setEntrada\(frase\)/.test(md));
  t("a nota ao Narrador volta ao que era antes do ato", /notaRef\.current = ch\.notaAntes/.test(md) && /notaAntesDoAtoRef\.current = notaRef\.current/.test(corpo("adjudicarAcao")));
  t("só antes do toque (com o lance não há volta)", /if \(!ch \|\| ch\.lance\) return;/.test(md));
  t("Esc no campo ou na soleira é mudar de ideia", /\(\(el && el\.contains\(foco\)\) \|\| foco === campoRef\.current\)\) \{ e\.preventDefault\(\); mudarDeIdeia\(\); return; \}/.test(corpo("teclaDaSoleira")) && /document\.addEventListener\("keydown", ouvir\)/.test(APP));
  t("o Enter sem foco (o turno partiu e o campo descansou) lança pelo mesmo caminho do campo vazio", /\(!foco \|\| foco === document\.body\)\) \{ e\.preventDefault\(\); enterNoChamado\(\); \}/.test(corpo("teclaDaSoleira")));
  t("«Não era isso» não aparece com o chamado", /&& !combate && !chamadoVivo\);/.test(APP));
}

sec("4. O CHAMADO É ESTADO DE TELA, E O DADO É O DO VÉU");
{
  const i = APP.indexOf("salvoEm: Date.now()");
  const doSave = i > 0 ? APP.slice(Math.max(0, i - 4000), i + 200) : "";
  t("o save não leva o chamado", doSave.length > 0 && !/chamado/i.test(doSave));
  const ld = corpo("lanceDoChamado");
  t("a mesma semente do Véu (chaveDaRolagem) e a mesma conta (dadoDo d20)", /chaveDaRolagem\(r\)/.test(ld) && /dadoDo\(semente, "d20"\)/.test(ld) && /dadosRef\.current = semente \? \{ face: dadoDo\(semente, "d20"\)/.test(APP));
  t("o lance rola na bandeja do chamado (jaRolou false, n novo)", /jaRolou: false, n: nDoLanceRef\.current/.test(ld));
  const po = corpo("pousouOChamado");
  t("no pouso, o Narrador logo (concluirRolagem) e a soleira esvazia depois de mostraODado", /concluirRolagem\(ch\.valor\)/.test(po) && /SOLEIRA_DO_MOMENTO\.mostraODado/.test(po));
}

/* o motor, pelo mesmo contrato que o App usa: o número do chamado é o do veredito */
sec("5. O CONTRATO COM O MOTOR");
{
  const D = await import("../src/desafios.js");
  const M = await import("../src/motor/o-mestre-chama.js");
  let v = null;
  try { v = D.lerAcao("sigo o rasto das pegadas até à orla do bosque", {}); } catch (e) { v = null; }
  const ch = v ? M.oChamado(v, { emCombate: false, bonus: 2, mundoDisseNao: false, contexto: { chuva: true } }) : null;
  t("«sigo o rasto» chama o dado", !!ch, v ? `tipo ${v.tipo}` : "lerAcao falhou");
  t("o número do chamado é o do veredito", !!ch && ch.dc === Number(v.dc));
  t("a linha diz a perícia, o número e o preço", !!ch && ch.linha.includes(ch.periciaNome) && ch.linha.includes(String(ch.dc)) && ch.linha.includes(ch.aviso));
  t("na luta, não chama", v ? M.oChamado(v, { emCombate: true, bonus: 2 }) === null : false);
}

/* EM3 (11/11/2026): o saber que a ficha já tem não chama nem rola; o raro
   chama; a vela espera pelas palavras; o preço cobrado chega à falha */
sec("6. EM3 · O HERÓI JÁ SABE, A VELA E O PREÇO COBRADO");
{
  const cx = corpo("ctxDoChamado");
  t("o ctx do chamado leva o saber do herói, com os oito refs", /saber = saberDoHeroi\(\{[\s\S]*?personagem: personagemRef\.current, lugar: lugarRef\.current, cidade: cidadeAtualRef\.current,[\s\S]*?jornada: jornadaRef\.current, factos: factosRef\.current, npcs: npcsRef\.current,[\s\S]*?mapa: mapaRef\.current, espinha: espinhaRef\.current,/.test(cx));
  t("o saber que estoura cala-se em null (o Mestre chama como antes)", /catch \(e\) \{ calou\("EM3 · o saber do herói", e\); saber = null; \}/.test(cx));
  t("chamadoDoVeredito passa o mesmo ctx a oChamado", /return oChamado\(v, ctxDoChamado\(mod\)\) \|\| null;/.test(corpo("chamadoDoVeredito")));
  const sc = corpo("saberComumDoVeredito");
  t("o saber comum: um ctx só para porQueNaoChama e saberComumDe", /const ctx = ctxDoChamado\(\);[\s\S]*?porQueNaoChama\(v, ctx\) === "saberComum" \? \(saberComumDe\(v, ctx\)/.test(sc) && /calou\("EM3 · o saber comum", e\); return null;/.test(sc));

  /* o ramo do saber comum em adjudicarAcao: do «if (saberComum)» ao return */
  const ad = corpo("adjudicarAcao");
  const m = /const saberComum = saberComumDoVeredito\(v\);\s*if \(saberComum\) \{([\s\S]*?return true;\s*\}\s*\})/.exec(ad);
  const ramo = m ? m[1] : "";
  t("adjudicarAcao pergunta o saber comum antes de tudo no teste", !!m && ad.indexOf("saberComumDoVeredito(v)") < ad.indexOf("seguraOTeste("));
  t("o saber comum manda o envelope do facto ao Narrador", /envelopeDoSaberComum\(v, saberComum\)/.test(ramo) && /enviar\(envSaber, /.test(ramo));
  t("o saber comum não rola (nem Véu, nem chamado, nem desafio)", ramo.length > 0 && !/rolarDesafio|setDadoRolando|abrirOChamado|lancarOChamado|setRolagem/.test(ramo));
  t("nem regista tentativa, nem passa tempo", ramo.length > 0 && !/fecharTentativa|cobrarTempoDoDesafio|avancarMinutos/.test(ramo));
  t("o sistema não fala de si: só a frase do jogador entra no relato", /pushMsgs\(\[\{ autor: "jogador", texto: acao \}\]\);/.test(ramo) && !/autor: "sistema"/.test(ramo));
  t("o Mestre não pede dado do que o herói já sabe", /if \(!v \|\| v\.tipo !== "teste"\) return;\s*if \(saberComumDoVeredito\(v\)\) return;/.test(APP));

  const es = corpo("esperaDoChamadoAgora");
  t("a espera da vela vem de esperaDoChamado (com o piso se estourar)", /esperaDoChamado\(ch && ch\.chamado \? ch\.chamado : ch\)/.test(es) && /return O_CHAMADO\.esperaSozinho;/.test(es));
  t("o relógio e a soleira usam a mesma espera", (APP.match(/esperaDoChamadoAgora\(ch\.chamado\)/g) || []).length === 2);

  /* visto jogando (11/11): o Enter que manda a frase abre o chamado e subia até ao
     documento, onde o ouvido da soleira o lia como o Enter do campo vazio */
  t("o Enter que o campo já consumiu (preventDefault) não lança o d20 da soleira", /e.key === "Enter" && !e.defaultPrevented && /.test(corpo("teclaDaSoleira")));
  t("o lance do chamado leva o cobrado como consequencia (a peça escreve «✕ falhou — …»)", /const cobrado = String\(\(ch\.chamado && ch\.chamado\.cobrado\) \|\| ""\);[\s\S]{0,200}consequencia: cobrado/.test(corpo("lanceDoChamado")));
  t("e a Bandeja recebe o mesmo cobrado no pouso", /chP && chP\.pousou && chP\.chamado \? String\(chP\.chamado\.cobrado \|\| ""\)[\s\S]{0,120}consequencia: cobrado/.test(corpo("concluirRolagem")));

  /* o contrato, pelo motor: o mesmo herói que o App monta */
  const D = await import("../src/desafios.js");
  const M = await import("../src/motor/o-mestre-chama.js");
  const saber = M.saberDoHeroi({ personagem: { antecedente: "Soldado Reformado" }, cidade: "Alto Negro", mapa: { cidades: [{ nome: "Alto Negro" }] } });
  const ctx = { emCombate: false, saber };
  const vCidade = D.lerAcao("o que sei desta cidade?", {});
  t("«o que sei desta cidade?» na cidade do herói: saber comum, não chama", M.porQueNaoChama(vCidade, ctx) === "saberComum" && M.oChamado(vCidade, ctx) === null);
  const env = M.envelopeDoSaberComum(vCidade, M.saberComumDe(vCidade, ctx));
  t("e o envelope diz que não houve dado", /SEM DADO/.test(env));
  const vRaro = D.lerAcao("o que sei de dragões antigos?", {});
  const chR = M.oChamado(vRaro, ctx);
  t("«o que sei de dragões antigos?» chama Saberes", !!chR && chR.periciaNome === "Saberes", chR ? chR.periciaNome : "sem chamado");
  t("a espera do raro sai das palavras da fala, dentro do piso e do teto", !!chR && M.esperaDoChamado(chR) >= M.O_CHAMADO.esperaSozinho && M.esperaDoChamado(chR) <= M.O_CHAMADO.esperaTeto);
  t("o cobrado é o aviso sem «Se falhar, » e sem ponto", !!chR && typeof chR.cobrado === "string" && chR.cobrado.length > 0 && !/^Se falhar/i.test(chR.cobrado) && !/\.$/.test(chR.cobrado));
}

console.log(`\nchamado-fiacao: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
