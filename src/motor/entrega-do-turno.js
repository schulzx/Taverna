/* ============================================================
   A ENTREGA DO TURNO, NO MOTOR (T1-A, 8.ª fatia, 28/10/2026) — src/motor/entrega-do-turno.js

   Depois da luta, o `aplicarResposta` ainda fazia no App cinco coisas que
   são regra: o cão de guarda da NÊMESIS na narração (morreu na cena sem
   registo? apareceu depois de morta?), os VISTOS do elenco (quem a prosa
   pôs em cena conta como visto hoje), o TRABALHO que o sistema marcou para
   esta cena, a QUEDA A ZERO (o último a falar, porque é o único que precisa
   do número final) e a ENTREGA (a narração e as linhas do sistema, que vão
   à tela ou ficam presas atrás do portão). Vêm para cá, na MESMA ordem e com
   os porquês de cada linha; o App ficou com a fiação.

   A FORMA É A DAS OUTRAS PEÇAS: o que entra é lido, nunca tocado; o que
   sai é novo. A nota ao Narrador sai como `paraOCronista` (as linhas que o
   App junta com `notaComOTurno`, como juntava à mão); o que é órgão do App
   sai como pedido (`encerrar`, a nêmesis que acaba; `morreu`, a tela do
   desfecho que abre 400 ms depois) e o App chama a porta de sempre.

   A queda é UMA função (v9.41) e todo caminho passa por ela — o dano do
   combate, o veneno, a queda narrada, a armadilha. Por isso `aQueda` não é
   só do turno do Narrador: o `resolverQueda` do App é um invólucro dela, e
   os três chamadores (o turno, o revide, a estrada) leem a mesma regra.

   Provado byte a byte contra o App de antes (a9ef8cf) em
   `teste-motor-entrega.mjs`, sobre os 275 casos de `entrega-bloco.mjs`.
   ============================================================ */
import { segundoFolegoDisponivel, gastarSegundoFolego } from "../dadivas.js";
import { firmeDisponivel, gastarFirme } from "../tracos.js";
import { seguraEmPe, gastarSegura } from "../gatilhos.js";
import { testeDeMorte, aplicarTesteMorte } from "../combate.js";
import { ganharHeroismo } from "../heroismo.js";
import { vistosDaNarrativa } from "../elenco.js";

/* ---------------- A NÊMESIS NA NARRAÇÃO ----------------
   Cão de guarda da nêmesis na narração: ela morreu na cena sem ninguém
   registrar? O sistema encerra. Ela apareceu depois de morta? O sistema
   corrige o Mestre — como já faz com mortes de inimigos em combate.
   → { paraOCronista, encerrar }: a correção (quando ela está morta e foi
   citada) ou o motivo de a encerrar (quando a prosa a matou). */
export function aNemesisNaNarrativa(nemesis, narrativa) {
  const nada = { paraOCronista: [], encerrar: null };
  const n = nemesis;
  if (!n || !n.nome) return nada;
  const txt = String(narrativa || "");
  if (!txt) return nada;
  const semAc = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const t = semAc(txt), alvo = semAc(n.nome);
  if (!t.includes(alvo)) return nada;
  if (n.status === "derrotada") {
    return { paraOCronista: [`[CORREÇÃO DE COESÃO — NÊMESIS MORTA] Você citou ${n.nome} na cena, mas o SISTEMA a registra MORTA desde o dia ${n.mortaEm || "?"}${n.comoMorreu ? ` (${n.comoMorreu})` : ""}. Ela não pode aparecer, agir, ameaçar nem enviar ninguém. Se a menção era memória, legado ou herança do que ela deixou, tudo bem — deixe isso explícito. Se você a colocou em cena, RETOME: ela não está lá.`], encerrar: null };
  }
  /* morte narrada sem registro: a frase precisa citá-la e matá-la */
  const frases = txt.split(/(?<=[.!?;])\s+|\n+/);
  const morte = /(morre|morreu|morta|morto|cai sem vida|tomba sem vida|expira|último suspiro|ultimo suspiro|degola|decapit|sem vida|corpo (dela|dele) )/i;
  const negado = /\b(não|nao|quase|fingiu|parece|como se)\b/i;
  for (const f of frases) {
    if (!semAc(f).includes(alvo)) continue;
    if (negado.test(f)) continue;
    if (morte.test(f)) return { paraOCronista: [], encerrar: "morta na cena narrada pelo Mestre" };
  }
  return nada;
}

/* ---------------- OS VISTOS DO ELENCO (MM8e) ----------------
   Quem a narração pôs em cena conta como visto hoje — é a recência que o
   elenco lê para promover e para dizer "já te vi antes". O erro volta com
   o estado de antes, e o App entrega-o ao `calou` com o nome de sempre. */
export function osVistosDaNarrativa(ler, narrativa) {
  const { elenco, npcs, dia } = ler || {};
  try { return { elenco: vistosDaNarrativa(elenco, npcs, narrativa, dia), erro: null }; }
  catch (e) { return { elenco, erro: e }; }
}

/* ---------------- O TRABALHO QUE O SISTEMA MARCOU PARA ESTA CENA (v9.37) ----------------
   O envelope foi mandado no turno passado e a abordagem está NESTA
   narração — então é aqui, depois dela, que o aviso aparece. Anunciar antes
   seria o sistema contando o que a ficção ainda não mostrou. Sem trabalho,
   o pendente volta como estava (o `null` continua `null`). */
export function oTrabalhoPendente(pendente) {
  if (!(pendente || []).length) return { msgs: [], pendente };
  return { msgs: [...pendente], pendente: [] };
}

/* ---------------- CAIR A ZERO (v9.41) ----------------
   `morteRolada` impede que o mesmo zero seja testado duas vezes no mesmo
   giro — o revide rola e marca; a resposta do Mestre lê a marca e não rola
   de novo. `sorteDoTurno` é chamada só quando há teste de morte (o evento
   "morte"): uma sorte pedida a mais andava a contagem dos outros sorteios.
   → { pers, msgs, paraOCronista, morteRolada, morreu } */
export function aQueda(pers, opcoes) {
  /* `= {}` não cobre `null`: as opções leem-se à mão */
  const { morteRolada = false, dia, sorteDoTurno } = opcoes || {};
  const msgs = [], paraOCronista = [];
  const fim = (p, extra) => ({ pers: p, msgs, paraOCronista, morteRolada, morreu: false, ...(extra || {}) });
  if (!pers) return fim(pers);
  if ((pers.vida || 0) > 0) {
    /* levantou (cura, poção, segundo fôlego): os contadores zeram — e o
       histórico de dados com eles, senão a próxima queda abre mostrando
       a rolagem da queda passada */
    const m = pers.morte || {};
    if (pers.morrendo || (m.falhas || 0) + (m.sucessos || 0) > 0 || (m.rolagens || []).length) {
      return fim({ ...pers, morrendo: false, morte: { sucessos: 0, falhas: 0, rolagens: [] } });
    }
    return fim(pers);
  }
  if (pers.morto) return fim(pers);
  if (morteRolada) return fim(pers, { morteRolada: false });
  /* MM (a luta tem saída): QUEM ESTABILIZOU NÃO ROLA DE NOVO. No 5e o
     estável fica quieto até alguém o curar ou ele acordar; é o que
     `morte.estavel` diz. */
  if (pers.morte && pers.morte.estavel) return fim(pers);
  /* SEGUNDO FÔLEGO (v9.32): a Dádiva da Recuperação vale em qualquer
     queda, não só na que acontece no turno dos inimigos. */
  if (segundoFolegoDisponivel(pers, dia)) {
    const volta = Math.max(1, Math.round((pers.vidaMax || 10) / 2));
    msgs.push(`🌠 Dádiva da Recuperação — você cai e o corpo se recusa: +${volta} PV (uma vez por dia).`);
    paraOCronista.push(`[QUEDA — RESOLVIDA PELO SISTEMA] Meus PV chegaram a zero e a Dádiva da Recuperação me pôs de pé na hora, com ${volta} PV. Narre o joelho que dobra e o corpo que se recusa a ficar no chão — sem mudar número nenhum.`);
    return fim(gastarSegundoFolego({ ...pers, vida: volta, morrendo: false, morte: { sucessos: 0, falhas: 0 } }, dia));
  }
  /* v9.45: a habilidade da CLASSE que promete o mesmo — "Ao cair a 0 PV,
     continua de pé por 1 turno" (Indomável) e "Não pode cair abaixo de 1 PV"
     (Corpo Imortal). Vem antes do traço racial porque volta a cada luta,
     e recurso que se renova mais rápido se gasta primeiro. */
  {
    const quem = seguraEmPe(pers);
    if (quem) {
      msgs.push(`🛡 ${quem} — você deveria cair, e não cai: fica com 1 PV (uma vez por luta).`);
      paraOCronista.push(`[QUEDA — RESOLVIDA PELO SISTEMA] Meus PV chegaram a zero e "${quem}" me segurou de pé com 1 PV. Narre o corpo que se recusa a ir ao chão. Não mude número nenhum, e deixe claro que agora qualquer coisa me derruba.`);
      return fim(gastarSegura({ ...pers, vida: 1, morrendo: false, morte: { sucessos: 0, falhas: 0 } }));
    }
  }
  /* FÚRIA PERSISTENTE (v9.44): mesma regra, mesma porta. Vale em qualquer
     queda — a do turno inimigo, a do sangramento, a do veneno na estrada. */
  if (firmeDisponivel(pers, dia)) {
    msgs.push("🩸 Fúria persistente — você deveria cair, e não cai: fica com 1 PV (uma vez por descanso longo).");
    paraOCronista.push("[QUEDA — RESOLVIDA PELO SISTEMA] Meus PV chegaram a zero e o traço da minha origem me deixou de pé com 1 PV. Narre o corpo que se recusa a ir ao chão, e deixe claro que agora qualquer coisa me derruba. Não mude número nenhum.");
    return fim(gastarFirme({ ...pers, vida: 1, morrendo: false, morte: { sucessos: 0, falhas: 0 } }, dia));
  }
  const caiuAgora = !pers.morrendo;
  const res = testeDeMorte(sorteDoTurno("morte"));
  const ap = aplicarTesteMorte(pers.morte || { sucessos: 0, falhas: 0 }, res);
  /* OS DADOS FICAM GUARDADOS (v9.42): um desfecho que o jogador não
     consegue reconstruir parece arbitrário, e arbitrário é o oposto do que
     uma regra de morte precisa ser — o 1 natural conta DUAS falhas, e a
     tela de tombamento tem de o mostrar. */
  const historico = [...((pers.morte || {}).rolagens || []), { rolo: res.rolo, tipo: res.tipo, texto: res.texto }].slice(-8);
  if (caiuAgora) msgs.push("💥 Seus PV chegam a zero — você desaba, inconsciente.");
  msgs.push(`☠ Teste de morte: ${res.texto}`);
  if (ap.desfecho === "revive") {
    msgs.push("✨ Você volta a si com 1 PV!");
    const rh = ganharHeroismo({ ...pers, vida: 1, morrendo: false, morte: { sucessos: 0, falhas: 0, rolagens: [] } }, "sobreviveu");
    if (rh.msg) msgs.push(rh.msg);
    paraOCronista.push("[QUEDA — RESOLVIDA PELO SISTEMA] Caí a 0 PV e o teste de morte saiu 20 natural: estou de pé de novo, com 1 PV. Narre o retorno brutal à consciência. Não mude números.");
    return fim(rh.pers);
  }
  if (ap.desfecho === "estavel") {
    msgs.push("Você estabiliza — inconsciente, mas vivo. Alguém precisa te ajudar.");
    paraOCronista.push("[QUEDA — RESOLVIDA PELO SISTEMA] Estou a 0 PV e ESTABILIZEI: inconsciente, respirando, sem poder agir. Narre a cena de quem está caído — e quem estiver por perto pode me socorrer. NÃO me faça levantar, andar ou falar.");
    return fim({ ...pers, morrendo: true, morte: { sucessos: 0, falhas: 0, rolagens: [], estavel: true } });
  }
  if (ap.desfecho === "morto") {
    msgs.push("💀 Você tomba. O que vem depois é escolha sua — e custa.");
    paraOCronista.push("[MORTE — DECLARADA PELO SISTEMA] Falhei o terceiro teste de morte. Narre o instante final, curto e sem consolo, e pare aí: o que vem depois o sistema resolve.");
    return fim({ ...pers, morrendo: false, morto: true, morte: { ...ap, rolagens: historico } }, { morreu: true });
  }
  paraOCronista.push(`[QUEDA — RESOLVIDA PELO SISTEMA] Estou caído a 0 PV, inconsciente, rolando testes de morte (${ap.sucessos} sucesso${ap.sucessos === 1 ? "" : "s"}, ${ap.falhas} falha${ap.falhas === 1 ? "" : "s"}). Narre isso do lado de fora — eu não vejo, não ouço e não ajo. Uma cura ou uma estabilização me traz de volta.`);
  return fim({ ...pers, morrendo: true, morte: { ...ap, rolagens: historico } });
}

/* ---------------- A ENTREGA ----------------
   Sem violação — o caso comum — sai na tela agora, exatamente como sempre
   saiu. Com violação, as linhas ficam guardadas e a tela trava até o
   conserto voltar: quem solta é o `passarPeloPortao` do App.
   A1 · B2: a mensagem do Mestre nasce SEM `recibo` — no fim do turno,
   depois do Cronista, `fecharORecibo` troca-a por uma cópia com o campo;
   aqui ainda faltaria o que o Cronista cobra.
   → { linhas, segurar } */
export function aEntrega(ler) {
  const { narrativa, msgs, portao } = ler || {};
  const linhas = [{ autor: "mestre", texto: narrativa || "…" }, ...(msgs || []).map((t) => ({ autor: "sistema", texto: t }))];
  return { linhas, segurar: (portao || []).length > 0 };
}
