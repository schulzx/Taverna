/* ============================================================
   A LUTA DO TURNO, NO MOTOR (T1-A, 6.ª fatia, 28/10/2026) — src/motor/luta-do-turno.js

   O bloco do combate do `aplicarResposta` — cerca de 225 linhas, o maior
   pedaço do turno que ainda morava no App — vem para cá, na MESMA ORDEM e
   com os porquês de cada linha. É o que o turno faz com o combate depois de
   o Narrador responder: a lista que ele abriu (conferida e aparada), o
   painel que se refaz, a ficha dos inimigos que o mundo já conhece, a
   presença divina, o códex, a iniciativa da luta nova, o painel que se
   dissolve quando ninguém troca golpes, e a vitória — os espólios, o nível,
   os companheiros, quem morre no mundo, os contadores, o relógio do
   rescaldo, a fama e a nêmesis, o vínculo, o que fica no chão, o poder
   único, a masmorra, o deicídio, e a nota que segura o Narrador.

   O QUE É DO APP CHEGA POR PORTAS (`ctx`). O bloco chama quinze órgãos do
   App; cada um já tem a sua peça pura em `combate-do-turno.js`, e cada um
   tem UMA porta no App (o invólucro com o nome de sempre), que é a única
   que escreve nos refs dele. Chamar a peça daqui e reescrever a fiação ao
   lado seria a segunda porta de cada órgão — a forma exata do bug que esta
   casa mais repete. Então o bloco chama as portas, e o que é DELE (as
   linhas, as notas, o combate, a ficha, o códex, o ócio, quem caiu) sai
   como efeito, na ordem em que nasceu.

   A ORDEM É O CONTRATO. Os órgãos leem o App (o relógio, a fama, a nêmesis
   que pode ter caído, quem já caiu nesta sessão), e por isso, antes de
   cada porta, os efeitos que o bloco já produziu são aplicados
   (`ctx.aplicar`), e depois dela o que o bloco lê é relido (`ctx.ler`):
   cada leitura vê exatamente o que via no App. Provado byte a byte contra
   o bloco de antes em `teste-motor-luta.mjs` (o dourado corre o App de
   7338870, o bloco e os órgãos inteiros, recortados à letra).

     aLutaDaResposta({ pers, mudancas }, ctx) → { pers, mudancas, msgs }

   `mudancas` volta como CÓPIA: o bloco escrevia na resposta do Narrador
   (`__nivelJogador`, `__temBonus`, a lista aparada, e o `processarCombate`
   marca `__vitoriaAuto` e `__inimigosFinais`); agora escreve na cópia, e o
   App troca a resposta pela cópia. `msgs` são as linhas do turno, para o
   App juntar às dele.

   ctx: { ler, aplicar, sorteDoTurno, e as portas: abrirCombate,
          limparConjuracoesDaLuta, notarFechoDaLuta, registrarMorteDeAlvo,
          bumpCont, avancarOsMinutos, checarFama, tentarSurgirNemesis,
          aplicarVinculo, porNoChaoAqui, talvezDespertarUnica,
          concluirMasmorraDoChefe, resolverSalaAposCombate, abrirRitoAscensao }
   `ler()` → { combate, divindade, descobertas, ocioso, ataqueResolvido,
              derrotadosDaSessao, masmorra, salaEmCurso, semente, genero,
              molde, lexico }
   Os efeitos: `nota` (linhas ao Narrador), `combate` (o ref e o painel),
   `ficha` (o painel da ficha; o ref, como antes, fica com quem o escreve),
   `descobertas` (o ref e o códex), `ocioso`, `intencao`, `impressionou`,
   `ataqueResolvido`, `derrotados`.
   ============================================================ */
import { processarCombate, aplicarNivel, evoluirCompanheiro } from "../regras-jogo.js";
import { conferirLista, envelopeDaListaAparada, envelopeDaLutaImpossivel } from "../emboscada.js";
import { chefePorNome, criaturaPorNome } from "../mundo-base.js";
import { guardiaoPorNome } from "../lei-da-forma.js";
import { reconciliarGraus, resolverPresenca } from "../presenca-divina.js";
import { grauDe } from "../divindades.js";
import { gerarEspolios } from "../combate.js";
import { moedasDeEspolio, despojosExtras } from "../profissoes.js";
import { essenciaDeEspolio, gerarEspolioItem } from "../loot.js";
import { achadoDeEquipamento, achadoDeConsumivel, achadoDeComponente, resumoDoChao } from "../chao.js";
import { sortearConsumivel, itemConsumivel } from "../pocoes.js";
import { despojosDe, itemComponente } from "../craft.js";
import { identificarDivindadeAbatida } from "../ascensao.js";
import { MINUTOS_POS_COMBATE } from "../calendario.js";
import { temAcaoBonus } from "./combate-do-turno.js";

/* O RETRATO DO FIM, COM OS FINAIS. A vitória que a resposta do Mestre
   declara chega com o retrato de ANTES da resposta (`combateAntes`) e a
   lista final dos inimigos à parte (`__inimigosFinais`). A tela do fim
   desenha o retrato — e com o de antes, o último inimigo ficava de pé com
   PV cheio. Junta-se aqui: cada inimigo do retrato leva a vida e o
   `derrotado` da lista final (pelo nome, como `regras-jogo.js` os casa);
   quem não está nela fica como estava. (Morava no topo do App.) */
export function retratoComOsFinais(antes, finais) {
  if (!antes || typeof antes !== "object") return antes || null;
  const lista = Array.isArray(finais) ? finais.filter((f) => f && f.nome) : [];
  if (!lista.length) return antes;
  const porNome = new Map(lista.map((f) => [String(f.nome).toLowerCase(), f]));
  return {
    ...antes,
    inimigos: ((antes.inimigos) || []).map((e) => {
      const f = e && e.nome ? porNome.get(String(e.nome).toLowerCase()) : null;
      if (!f) return e;
      const vida = typeof f.vida === "number" ? f.vida : e.vida;
      return { ...e, vida, derrotado: !!(f.derrotado || (Number(vida) || 0) <= 0) };
    }),
  };
}

export function aLutaDaResposta(estado, ctx) {
  const e0 = estado && typeof estado === "object" ? estado : {};
  const c = ctx;
  /* os efeitos do bloco, na ordem; aplicados antes de cada porta e de cada leitura */
  const pend = [];
  const fazer = (ef) => { pend.push(ef); };
  const descarregar = () => { if (pend.length) c.aplicar(pend.splice(0)); };
  const ler = () => { descarregar(); return c.ler() || {}; };
  const porta = (nome, ...args) => { descarregar(); return c[nome](...args); };
  const nota = (texto) => fazer({ tipo: "nota", linhas: [texto] });

  let pers = e0.pers;
  const m = { ...(e0.mudancas || {}) };
  const msgs = [];
  let R = ler();
  const combateAntes = R.combate;
  m.__nivelJogador = pers.nivel || 1;
  m.__temBonus = temAcaoBonus(pers);
  /* ---------------- A LISTA ANTIGA GANHA ORÇAMENTO (v9.75) ----------------
     A emboscada da v9.74 era conferida e esta lista não, e é por aqui que
     entra a maior parte das lutas do jogo — a nêmese, os eventos globais,
     tudo o que a IA abre por conta própria. Duas réguas para a mesma
     pergunta é a forma exata do bug que esta casa mais repete.

     A conferência aqui é mais BRANDA que a da emboscada, e de propósito:
     ali o sistema constrói o encontro do zero e pode escolher; aqui a cena
     já existe e pode ser o clímax que a campanha inteira preparou. Então
     ele apara a multidão e nunca recusa o inimigo grande demais — só obriga
     o Mestre a deixar a fuga aberta. */
  try {
    const lista = m.combate_iniciar;
    if (Array.isArray(lista) && lista.length && !R.combate) {
      const conf = conferirLista(lista, pers);
      if (conf.tipo === "aparado") {
        m.combate_iniciar = conf.inimigos;
        /* v9.76: sem linha na tela. "⚖ 8 eram demais para este patamar"
           conta ao jogador uma decisão de bastidor sobre uma luta que ele
           nunca viu com oito — para ele, sempre foram dois, e é exatamente
           isso que o envelope manda o Mestre narrar. */
        nota(envelopeDaListaAparada(conf));
      } else if (conf.tipo === "fuga") {
        nota(envelopeDaLutaImpossivel(conf));
      }
    }
  } catch { /* conferir a lista nunca pode custar a luta */ }
  /* combate: processa de forma síncrona para as mensagens saírem na ordem certa */
  const notasDoCombate = [];
  let combate = processarCombate(R.combate, m, msgs, notasDoCombate);
  for (const nt of notasDoCombate) nota(nt);
  fazer({ tipo: "combate", combate });
  /* PRESENÇA DIVINA (v7.4 — COM MODERAÇÃO): só dispara quando uma
     divindade de verdade (GD 3+) entra em cena E supera o jogador por 2+
     degraus. Uma vez por combate, resistência por código. Proteções: itens
     consagrados/benção ajudam; companheiros de vínculo 4+ são imunes (a
     convivência com o herói os acostumou ao impossível). */
  if (!combateAntes && combate && (combate.inimigos || []).length) {
    /* FICHA VINDA DA BASE (v9.8): se o inimigo é um chefe ou uma criatura
       que o mundo já conhece, o nível e o GD saem do SISTEMA — não do que o
       Mestre lembrou de escrever no combate_iniciar. E o GD, quando não
       vem, é descoberto pelo panteão. Era isto que fazia um deus entrar na
       luta como um orc qualquer: sem Regra do Degrau e sem presença. */
    R = ler();
    const comBase = (combate.inimigos || []).map((e) => {
      const ficha = chefePorNome(R.semente, R.mapa, R.genero, e.nome, R.lexico)
        /* v9.165: o guardião do andar vem ANTES da criatura genérica —
           "Ogro, o Sino do Andar" casaria com o ogro comum do bestiário e
           entraria na luta com o nível errado */
        || guardiaoPorNome(R.semente, R.mapa, R.genero, e.nome, R.lexico, R.molde)
        || criaturaPorNome(R.semente, R.mapa, R.genero, e.nome, R.lexico);
      if (!ficha) return e;
      msgs.push(`🔎 ${e.nome} está na base do mundo: nível ${ficha.nivel}${ficha.gd ? ` · GD ${ficha.gd}` : ""}${ficha.personalidade ? ` · ${ficha.personalidade}` : ""}.`);
      return { ...e, nivel: ficha.nivel, gd: ficha.gd || e.gd || 0, ameaca: ficha.ameaca || e.ameaca };
    });
    const panteaoMundo = (R.divindade && R.divindade.panteao) || [];
    const reconciliados = reconciliarGraus(comBase, panteaoMundo);
    if (reconciliados.some((e, i) => e !== (combate.inimigos || [])[i])) {
      combate = { ...combate, inimigos: reconciliados };
      fazer({ tipo: "combate", combate });
    }
    reconciliados.filter((e) => e.gdPeloSistema).forEach((e) => msgs.push(`✦ ${e.nome} é de outra grandeza: o aço comum não o fere.`));
    const div = reconciliados.filter((e) => (e.gd || 0) >= 3).sort((a, b) => (b.gd || 0) - (a.gd || 0))[0];
    const res = div ? resolverPresenca({ fonte: div, jogador: pers, grupo: pers.grupo || [], gdJogador: grauDe(R.divindade) }) : null;
    if (res) {
      if (res.condJogador) pers = { ...pers, condicoes: [...(pers.condicoes || []).filter((x) => x.id !== res.condJogador.id), res.condJogador] };
      if (res.afetados.length) {
        pers = { ...pers, grupo: (pers.grupo || []).map((g) => {
          const a = res.afetados.find((x) => x.nome === g.nome);
          return a ? { ...g, condicoes: [...(g.condicoes || []).filter((x) => x.id !== a.cond.id), a.cond] } : g;
        }) };
      }
      res.linhas.forEach((l) => msgs.push(l));
      nota(res.nota);
      fazer({ tipo: "ficha", ficha: pers });
    }
  }
  /* CÓDEX: toda criatura que entra em combate vira registro no bestiário */
  {
    let descobertas = ler().descobertas;
    (m.combate_iniciar || []).forEach((ini) => {
      if (ini?.nome && !descobertas.some((d) => d.toLowerCase() === ini.nome.toLowerCase())) {
        descobertas = [...descobertas, ini.nome];
        fazer({ tipo: "descobertas", descobertas });
      }
    });
  }
  /* HUD FANTASMA: se o painel de combate está aberto mas ninguém troca
     golpes (o Mestre seguiu a narrativa sem encerrar), o app fecha sozinho
     após 2 turnos parados. Evita o combate "preso" na tela por vários
     turnos. */
  R = ler();
  if (R.combate) {
    const houveIniciar = Array.isArray(m.combate_iniciar) && m.combate_iniciar.length > 0;
    /* INICIATIVA (v8.9): combate novo → o sistema rola a ordem do turno.
       v9.73: o corpo disto virou `abrirCombate`, a porta única — este
       caminho era o ÚNICO equipado por inteiro, e por isso a masmorra
       lutava há versões sem tabuleiro e sem ordem de iniciativa. */
    if (houveIniciar && R.combate && !R.combate.ordem) {
      const ab = porta("abrirCombate", null, { pers, jaNoRef: true });
      pers = ab.pers;
      msgs.push(...ab.msgs);
      nota(ab.nota);
    }
    R = ler();
    const houveDano = Array.isArray(m.combate_inimigo_vida) && m.combate_inimigo_vida.length > 0;
    const houveAtaqueMeu = R.ataqueResolvido;
    let ocioso = R.ocioso;
    if (houveIniciar || houveDano || houveAtaqueMeu) ocioso = 0;
    else ocioso += 1;
    fazer({ tipo: "ocioso", ocioso });
    if (ocioso >= 2) {
      fazer({ tipo: "ocioso", ocioso: 0 });
      fazer({ tipo: "combate", combate: null }); fazer({ tipo: "intencao", intencao: "" }); fazer({ tipo: "impressionou", impressionou: 0 });
      porta("limparConjuracoesDaLuta", null);
      msgs.push("⚔ O confronto se dissolve — o painel de combate se fecha.");
    }
  } else fazer({ tipo: "ocioso", ocioso: 0 });
  fazer({ tipo: "ataqueResolvido", ataqueResolvido: false });
  /* vitória detectada por código: pede ao Mestre os espólios se ele ainda
     não os deu neste turno (evita esperar ele "perceber" a morte) */
  if (m.__vitoriaAuto) {
    /* A1 · B2: a vitória que a resposta do Mestre declara — os caídos são
       os da lista final, e o retrato é o de antes da resposta */
    porta("notarFechoDaLuta", { combate: retratoComOsFinais(combateAntes, m.__inimigosFinais), desfecho: "vitoria", caidos: (m.__inimigosFinais || []).map((e) => e && e.nome) });
    /* ESPÓLIOS POR CÓDIGO: moedas e XP por tabela; nível sobe sozinho. A IA
       só narra — e cria o item quando o app decide que caiu um. */
    /* v9.27: os nomes dos caídos alimentam as etapas "derrotar" */
    fazer({ tipo: "derrotados", derrotados: [
      ...ler().derrotadosDaSessao,
      ...(m.__inimigosFinais || []).map((e) => e && e.nome).filter(Boolean),
    ].slice(-120) });
    const espBruto = gerarEspolios(m.__inimigosFinais || [], pers.nivel || 1, porta("sorteDoTurno", "espolio"));
    /* v9.44: o Caçador de Recompensas cobra pelo trabalho. O acréscimo é
       sobre as MOEDAS, não sobre o XP — quem vive de contrato ganha mais
       dinheiro pela mesma caçada, não experiência mais rápido. */
    const esp = { ...espBruto, moedas: moedasDeEspolio(pers, espBruto.moedas) };
    let p2 = { ...pers, moedas: (pers.moedas || 0) + esp.moedas, xp: (pers.xp || 0) + esp.xp };
    /* v9.54: a mesma segunda fonte de essência do outro caminho de vitória
       — os dois precisam concordar, senão a forja renderia conforme QUEM
       fechou a luta, e isso o jogador não escolhe. */
    {
      const ess = essenciaDeEspolio(m.__inimigosFinais || []);
      if (ess > 0) { p2.essencia = (p2.essencia || 0) + ess; msgs.push(`⚗ +${ess} de essência — o que sobra quando algo com poder morre.`); }
    }
    /* UMA ESCADA SÓ. Esta linha era um laço à mão que subia o nível e
       contava o pendente — e não dava PV, nem PM, nem a dádiva épica do
       nível 20. Quem subia de nível MATANDO subia mais fraco do que quem
       subia entregando uma missão, e ninguém via porque os dois caminhos
       imprimem a mesma frase. `aplicarNivel` é a escada da casa. */
    const nivelAntes = p2.nivel;
    p2 = aplicarNivel(p2);
    const subiu = p2.nivel - nivelAntes;
    p2.grupo = (p2.grupo || []).map((g) => { if (g.invocada) return g; const ev = evoluirCompanheiro({ ...g, xp: (g.xp || 0) + esp.xp }); const m2 = ev._subiu; delete ev._subiu; if (m2) msgs.push(`✦ ${g.nome} subiu para o nível ${ev.nivel}!`); return ev; });
    msgs.push(`◉ Espólios: +${esp.moedas} moedas · +${esp.xp} XP${subiu ? ` · ✦ NÍVEL ${p2.nivel}!` : ""}`);
    pers = p2;
    fazer({ tipo: "ficha", ficha: p2 });
    /* CÓDEX: contabiliza a vitória — combate vencido + abates por ameaça */
    const fins = m.__inimigosFinais || [];
    /* v9.0: quem caiu no combate e TEM ficha no mundo morre no mundo —
       inclusive a nêmesis. Antes, matá-la em cena não desligava a
       perseguição: ela continuava com ódio crescendo no painel. */
    fins.forEach((e) => { if (e && e.nome) porta("registrarMorteDeAlvo", e.nome, "morto por mim em combate"); });
    porta("bumpCont", "combatesVencidos", 1);
    /* a luta em si é rápida; o rescaldo leva meia hora — e o relógio
       escreve na ficha do turno (5.ª fatia) */
    p2 = porta("avancarOsMinutos", MINUTOS_POS_COMBATE, p2).ficha || p2;
    porta("bumpCont", "inimigosDerrotados", fins.length);
    porta("bumpCont", "elitesDerrotados", fins.filter((e) => e.ameaca === "elite").length);
    porta("bumpCont", "lendariosDerrotados", fins.filter((e) => e.ameaca === "lendario").length);
    /* grandes feitos fazem o nome correr — e atraem ódio */
    porta("checarFama"); porta("tentarSurgirNemesis");
    /* VÍNCULO: sangue derramado junto aproxima (+2 para todo o grupo) */
    p2 = { ...p2, grupo: porta("aplicarVinculo", p2.grupo, "todos", 2, msgs) };
    /* LOOT PROCEDURAL: quando cai item, o CÓDIGO gera pela tabela (a IA só
       descreve o achado — não inventa mais equipamento de vitória). v9.41:
       e o achado NÃO entra sozinho na bolsa — fica caído entre os corpos,
       esperando o jogador se abaixar. Ver chao.js. */
    const caiuAqui = [];
    {
      const ondeCaiu = (i) => {
        const e = fins[Math.min(i, Math.max(0, fins.length - 1))] || {};
        return { de: e.nome || "", x: e.x != null ? e.x : null, y: e.y != null ? e.y : null };
      };
      if (esp.caiItem) caiuAqui.push(achadoDeEquipamento(gerarEspolioItem(fins, p2.nivel || 1, ler().lexico, porta("sorteDoTurno", "espolio-item")), ondeCaiu(0)));
      for (let i = 0; i < (esp.consumiveis || 0); i++) {
        const cs = sortearConsumivel(p2.nivel || 1, { sorte: porta("sorteDoTurno", "consumivel") });
        if (!cs) continue;
        caiuAqui.push(achadoDeConsumivel(cs, itemConsumivel(cs.id), ondeCaiu(i)));
      }
      /* DESPOJOS (v9.13): o corpo também é matéria-prima. Criatura mágica
         deixa essência, peçonhenta deixa glândula, bicho deixa couro. */
      /* v9.44: o Curtidor aproveita a carcaça — um componente a mais por
         corpo. Sorteia de novo na mesma mesa: é o mesmo bicho. */
      const desp = despojosDe(fins, { sorte: porta("sorteDoTurno", "despojo") });
      for (let k = 0; k < despojosExtras(p2) * fins.length; k++) { const x = despojosDe(fins, { sorte: porta("sorteDoTurno", "despojo") })[0]; if (x) desp.push(x); }
      desp.forEach((cp, i) => caiuAqui.push(achadoDeComponente(cp, itemComponente(cp.id), ondeCaiu(i))));
    }
    const noChao = caiuAqui.filter(Boolean);
    if (noChao.length) {
      porta("porNoChaoAqui", noChao);
      msgs.push(`🧺 No chão: ${resumoDoChao(noChao)} — toque em EXAMINAR para recolher.`);
    }
    /* PODER ÚNICO (v7.4.4): vitória sobre elite/lendário pode despertar uma
       habilidade só sua — gerada e limitada pelo sistema */
    p2 = porta("talvezDespertarUnica", p2, m.__inimigosFinais || [], msgs);
    /* MASMORRA: vitória na sala do CHEFE conclui a masmorra por código —
       moedas do fundo + item épico/lendário garantido */
    let chefeCaido = false;
    R = ler();
    const salaCorrente = R.masmorra ? R.masmorra.salas.find((x) => x.id === R.masmorra.atual) : null;
    if (salaCorrente && salaCorrente.tipo === "chefe") {
      /* MM11: o bloco que concluía a masmorra morava aqui, e só aqui — então
         a vitória que o SISTEMA fecha (o golpe que derruba o chefe) nunca a
         concluía. Agora é um helper (concluirMasmorraDoChefe) chamado pelas
         duas portas. */
      const fimM = porta("concluirMasmorraDoChefe", p2, msgs);
      p2 = fimM.pers; chefeCaido = fimM.concluiu;
    } else if (R.masmorra && R.salaEmCurso !== null) {
      porta("resolverSalaAposCombate");
    }
    pers = p2;
    fazer({ tipo: "ficha", ficha: p2 });
    /* DEICÍDIO (v9.6): um deus tombou nesta luta? O sistema reconhece e abre
       o rito. Antes disso, "assimilar o poder" era só uma frase que o Mestre
       escrevia e a ficha ignorava. */
    {
      const abatido = identificarDivindadeAbatida(m.__inimigosFinais || [], ler().divindade);
      if (abatido) porta("abrirRitoAscensao", abatido, p2.nivel || 1);
    }
    nota(`[VITÓRIA — espólios já aplicados pelo sistema: +${esp.moedas} moedas e +${esp.xp} XP para todos] NÃO envie moedas nem xp (seria dobrado). Narre o desfecho da luta em 2-3 frases.${noChao.length
      ? ` FICOU CAÍDO no chão, entre os corpos: ${noChao.map((cp) => `${cp.nome}${cp.de ? ` (de ${cp.de})` : ""}`).join(", ")}. Mostre isso na cena — o brilho no cinto, o couro que dá para tirar — mas NÃO me entregue nada e NÃO envie "adicionar_itens" nem "adicionar_equipamento": quem se abaixa e recolhe sou eu, pelo sistema.`
      : " Nada de aproveitável ficou no chão — não invente achados."}${chefeCaido ? " A MASMORRA FOI CONCLUÍDA e o tesouro do chefe já foi entregue pelo sistema — narre a saída triunfal e retome o mundo lá fora." : ""}`);
  }
  descarregar();
  return { pers, mudancas: m, msgs };
}
