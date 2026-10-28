/* ============================================================
   O APLICAR — o coração do turno, fora do componente (Fase T1, trilha A)

   `aplicarResposta` (App.jsx) aplicava a resposta do Narrador ao estado
   como uma closure de React: lia refs, escrevia refs, chamava setX. São
   ~1.160 linhas e a ordem delas é conserto de bug ("depois do relógio,
   nunca antes"). Esta peça é a mesma ordem, como função pura:

     aplicar(estado, resposta, ctx) → { estado, efeitos, paraOCronista, podado, msgs }

   - `estado` é o que o turno lê e escreve (a ficha, a luta, as travas);
     o que sai é um estado NOVO — o que entrou não é tocado.
   - `efeitos` é o que o App ainda tem de fazer fora do estado, descrito
     ({ tipo, ... }), na ordem em que acontecia: a luta que a tela mostra,
     a textura da mesa, os erros que o `calou` regista.
   - `paraOCronista` são as linhas que o sistema manda ao Mestre no
     envelope do próximo pedido (a nota do turno), na ordem em que nasciam.
   - `podado` é a resposta depois da porta da luta e das travas — o que o
     resto do turno lê.
   - `msgs` são as linhas da tela, na ordem.

   ATÉ ONDE ELA VAI (27/10, a primeira fatia): os blocos que só mexem na
   FICHA e na luta — a poda, as travas anti-duplo, o relógio dos efeitos e
   das condições (eu, o grupo, os inimigos), as recargas, as mudanças
   declaradas, a cobrança e o débito. O resto do `aplicarResposta` (o mapa,
   os sinais, o cânone, a gente, o combate, o códex…) ainda é closure no
   App e corre depois disto, com a ficha e a resposta que daqui saem. Cada
   bloco que sair do App entra aqui, na ordem em que está lá.
   A 2.ª fatia (27/10) trouxe o par seguinte — o cânone e a gente —, como
   uma segunda peça (`aplicarORegisto`, mais abaixo) e não como a
   continuação desta: entre os dois, no App, ainda correm as dádivas, o
   mapa, as missões e os sinais, que mexem no mapa, no lugar e na ficha que
   o registo lê. Quando esses saírem, as duas peças fundem-se numa ordem só.
   A 3.ª fatia (28/10) tirou-os (src/motor/meio-do-turno.js) e fundiu: o App
   chama `aplicarOTurno` (no fim deste arquivo), que corre as seis peças na
   ordem de lá e devolve os efeitos todos, numa lista só.

   O DADO (2.ª fatia, 27/10): a salvaguarda do fim do turno rola pela SORTE
   DO TURNO — `ctx.sorte`, a que o App pede a `sorteDoTurno("salvaguarda")`
   (src/motor/sorte-do-turno.js): a semente do mundo, o instante que o save
   guarda e o nome do evento. Antes rolava pela reserva da casa, semeada a
   cada envio: determinista pela ordem dentro do turno, mas qualquer órgão
   que pedisse sorte antes dela mudava o dado. Um só fio para os três
   sítios (eu, o grupo, os inimigos), na ordem de sempre. Sem `ctx.sorte`
   (uma suíte, um chamador antigo) rola como rolava, pela casa.

   A PROVA: `testes/teste-motor-aplicar.mjs` — o estado que o App de antes
   (b9e6e20) produzia, capturado em `testes/aplicar-dourado.json` sobre as
   narrações reais das sessões 8 a 10, tem de sair igual, byte a byte.
   ============================================================ */
import { podarONarrador } from "../agressao.js";
import { tickEfeitos, atributoEfetivo, aplicarMudancas } from "../regras-jogo.js";
import { tickCondicoes, tentarSaidaNoFimDoTurno } from "../condicoes.js";
import { oQueFaltaCreditar, oQueFaltaDebitar, falaDaCobranca, envelopeDaCobranca, envelopeDaCobrancaNegada, falaDoDebito, envelopeDoDebito } from "../cobranca.js";
import { itemConsumivel } from "../pocoes.js";
import { peneirarCanone } from "../segredo-guardado.js";
import { criarCidade } from "../mapa.js";
import { garantirGeografia } from "../geografia.js";
import { nomeComDono, mesclarNPC, criarNPC, notaDoHomonimo, retomarContador } from "../npcs.js";
import { aindaSoUmNome } from "../abertura.js";
import { dadivasConcedidas, aplicarOMapa, aplicarAsMissoes, aplicarOsSinais } from "./meio-do-turno.js";

/* a nota do turno cresce como sempre cresceu no App: uma linha por vez,
   separadas por quebra, sem quebra na frente da primeira */
export function notaComOTurno(notaAntes, linhas) {
  let nota = typeof notaAntes === "string" ? notaAntes : "";
  for (const x of linhas || []) nota = `${nota ? nota + "\n" : ""}${x}`;
  return nota;
}

/* O CORPO É O DO APP, LINHA POR LINHA (b9e6e20), com seis trocas e nenhuma
   outra: o ref da luta virou `combate` (e a escrita nele, um efeito); as
   duas travas, `travas` (copiadas do estado, devolvidas no estado novo);
   `ultimoDesfechoRef`, `ultimoDesfecho`; a escrita na nota, `notas.push`;
   a textura da mesa, um efeito; e `calou`, um efeito que o App entrega ao
   `calou` de verdade. As mutações da resposta passaram a cair numa cópia.
   Os nomes locais (`op`, `resp`, `pers`, `msgs`, `t`) são os de lá, de
   propósito: as suítes que guardam a ordem e a forma destas linhas leem o
   texto, e o texto é o mesmo.

   A LISTA DOS EFEITOS CHAMA-SE `efeitosDoTurno`, e não `efeitos`, por uma
   razão que a prova byte a byte achou: o bloco do relógio declara o SEU
   `efeitos` (os do herói, `const { efeitos, msgs: msgsTick }`), e um push
   no nome curto, dentro dele, caía na ficha — 86 de 275 estados saíam com a
   luta escrita na lista de bênçãos do herói. */
export function aplicar(estado, resposta, ctx = {}) {
  const e0 = estado && typeof estado === "object" ? estado : {};
  const op = ctx && typeof ctx === "object" ? ctx : {};
  let resp = resposta;
  let combate = e0.combate;
  const travas = { danoJaAplicado: e0.danoJaAplicado, habUsada: e0.habUsada };
  const ultimoDesfecho = e0.ultimoDesfecho;
  const msgs = [], notas = [], efeitosDoTurno = [];
  const calou = (onde, erro) => { efeitosDoTurno.push({ tipo: "calou", onde, erro }); };
  /* o d20 da salvaguarda, do fio da sorte do turno (ver O DADO, acima); a
     face é a mesma conta de `rolarSalvaguarda` (salvaguardas.js) */
  const sorteDoTurno = typeof op.sorte === "function" ? op.sorte : null;
  const d20DoTurno = sorteDoTurno ? () => 1 + Math.floor(sorteDoTurno() * 20) : null;
    /* E4 do "o Narrador só narra" (a fiação): A PORTA DA LUTA É DO SISTEMA.
       Antes de qualquer coisa ler a resposta, a guarda tira dela o que o
       Narrador já não decide — o perigo, abrir luta (salvo o pedido do golpe
       sem alvo), o dano e a ficha do inimigo, a vida e a mana negativas — e,
       num turno em que o teste passou, tudo isso mesmo com pedido: um sucesso
       nunca é castigado (8.ª sessão, M64). A regra mora em agressao.js
       (O_NARRADOR_NAO_ABRE); aqui só se aplica, e uma resposta nova substitui
       a antiga (a guarda não muta). Os envelopes são os mesmos que a bolsa lê. */
    try { resp = podarONarrador(resp, { envelopes: op.envelopes || "" }).resp || resp; } catch (e) { calou("a porta da luta", e); }
    /* v9.32: FICHA NUNCA NULA. O erro "undefined is not an object (evaluating
       'e.efeitos')" que apareceu em jogo era isto: alguma chamada de enviar()
       passou `persAtual` vazio, `tickEfeitos(pers)` é a PRIMEIRA coisa que
       toca na ficha aqui, e o turno inteiro morria na primeira linha — com
       ele, as mudanças, os efeitos, a divindade, tudo. Um turno não pode
       depender de quem chamou ter lembrado de mandar a ficha: se ela não
       veio, ela está no ref, e se não está em lugar nenhum não há turno para
       aplicar. Vale tanto para undefined quanto para null. */
    let pers = e0.personagem || null;
    if (!pers) return { estado: e0, efeitos: efeitosDoTurno, paraOCronista: [], podado: resp, msgs: [], semFicha: true };
    /* (a ficha do envio, `persDoEnvio`, ficou no App: é lá que o CÓDEX a lê) */
    /* trava anti-cobrança-dupla: no turno de [HABILIDADE] o custo já foi
       descontado pelo app; qualquer mana negativa do Mestre é ignorada */
    /* TRAVA ANTI-DANO-DUPLO: se o sistema já cobrou o dano dos inimigos neste
       turno, qualquer "vida"/"grupo_vida" negativo do Mestre é o MESMO golpe
       chegando de novo — ignora (senão o herói morre pagando duas vezes). */
    if (travas.danoJaAplicado && resp.mudancas) {
      /* a resposta é nossa a partir daqui: copiada, nunca mexida a de quem chamou */
      resp = { ...resp, mudancas: { ...resp.mudancas } };
      if (typeof resp.mudancas.vida === "number" && resp.mudancas.vida < 0) resp.mudancas.vida = 0;
      if (Array.isArray(resp.mudancas.grupo_vida)) resp.mudancas.grupo_vida = resp.mudancas.grupo_vida.filter((g) => !(g && Number(g.vida) < 0));
      travas.danoJaAplicado = false;
    }
    if (travas.habUsada) {
      if (resp.mudancas && typeof resp.mudancas.mana === "number" && resp.mudancas.mana < 0) resp = { ...resp, mudancas: { ...resp.mudancas, mana: 0 } };
      travas.habUsada = false;
    }
    /* ---- O TURNO VIRA UMA VEZ POR RODADA (v9.5, simplificado em v9.13) ----
       Buff de 3 turnos morria em uma rodada e meia: quem tinha dois movimentos
       mandava DUAS respostas por rodada, e cada uma descontava um turno. Havia
       um freio (pularTickRef) para o caso "meu turno continua". Esse caso
       deixou de existir: agir encerra o turno, então toda resposta É uma
       rodada e o relógio anda exatamente uma vez. */
    {
    /* passa 1 turno nos efeitos que já estavam ativos (os novos entram depois, com duração cheia) */
    const { efeitos, msgs: msgsTick } = tickEfeitos(pers);
    pers = { ...pers, efeitos };
    msgs.push(...msgsTick);
    /* ---------------- O IRMAO NO RELOGIO (v9.233) ----------------
       O grupo nunca teve tique de efeito: `tickEfeitos` so olhava o heroi.
       Enquanto ninguem escrevia em `comp.efeitos` isso nao custava nada; a
       partir do nascimento em `buffDeCompanheiro` custa, e custa do jeito que
       P2 ja ensinou — um abrigo sem prazo atravessaria a porta da luta e
       comeria o primeiro golpe da luta seguinte, inclusive depois de
       carregar o save.

       MORA AQUI, e nao no relogio de rodadas do revide, de proposito: efeito
       vence por TURNO, e turno e toda resposta do Mestre — dentro e fora do
       combate. E o mesmo relogio do heroi, na mesma linha, para os dois nao
       nascerem diferentes. Por isso tambem nao ha irmao em
       `limparConjuracoesDaLuta`: o heroi nao tem, porque nao precisa, e o
       companheiro passa a nao precisar pelo mesmo motivo. */
    try {
      const linhasDoGrupo = [];
      let mexeu = false;
      const grupoComPrazo = (pers.grupo || []).map((g) => {
        if (!g || !((g.efeitos || []).filter(Boolean).length)) return g;
        const tg = tickEfeitos(g);
        mexeu = true;
        for (const m of tg.msgs) linhasDoGrupo.push(`✧ ${g.nome} · ${String(m).replace(/^✧\s*/, "")}`);
        return { ...g, efeitos: tg.efeitos };
      });
      if (mexeu) {
        pers = { ...pers, grupo: grupoComPrazo };
        msgs.push(...linhasDoGrupo);
      }
    } catch (e) { calou("prazo-do-efeito-do-grupo", e); }
    /* TICK DAS CONDIÇÕES (v9.0): decrementa, expira E COBRA o dano por turno.
       Veneno e sangramento existiam só como rótulo; agora doem de verdade —
       o catálogo diz quanto, o sistema aplica e o Mestre recebe para narrar. */
    if ((pers.condicoes || []).length) {
      const t = tickCondicoes(pers.condicoes);
      pers = { ...pers, condicoes: t.condicoes };
      t.expiradas.forEach((c) => msgs.push(`✓ ${c.nome} passou`));
      if (t.dano > 0 && (pers.vida || 0) > 0) {
        const pv = Math.max(0, (pers.vida || 0) - t.dano);
        msgs.push(`${t.fontes.join(" + ")}: −${t.dano} PV (${pv}/${pers.vidaMax})`);
        pers = { ...pers, vida: pv, morrendo: pv <= 0 ? true : pers.morrendo };
        notas.push(`[CONDIÇÃO — DANO JÁ APLICADO PELO SISTEMA] ${t.fontes.join(" e ")} me custou ${t.dano} PV neste turno (estou com ${pv}/${pers.vidaMax}). Mostre isso na ficção — o corpo cobrando o preço — mas NÃO envie dano nenhum por isso: já está cobrado.`);
      }
    }
    /* --------- A SEGUNDA CHANCE, NO FIM DO TURNO (T3) · eu ---------
       DEPOIS DO RELÓGIO, NUNCA ANTES, e a ordem é contrato escrito em
       `condicoes.js`: o tique acima cobra o dano do turno e vence o prazo;
       só então vem a chance de sair. Invertida, passar na salvaguarda
       apagaria retroativamente o dano de um turno em que o corpo ESTEVE
       envenenado — o veneno cobra no turno, a chance vem no fim dele.

       DAQUI SÓ SAI FIAÇÃO. Quem dá segunda chance, com qual salvaguarda e
       contra qual dificuldade, está em `SALVAGUARDA_DO_FIM_DO_TURNO`; a
       frase que o jogador lê nasce em `linhaDaSaidaDeCondicao`, já em voz
       de mundo e com os dois números. O App não escreve uma sílaba de
       regra — aqui só o `modDe`, porque só eu tenho ficha de atributo para
       somar, e quem sabe somá-la é `atributoEfetivo`.

       NÃO FILTRA POR VIDA, ao contrário do irmão dos inimigos: quem cai
       aqui fica em cena (`morrendo`), e o tempo passa para ele também.

       E NÃO PODE CUSTAR O TURNO. O sítio do herói nunca esteve em
       `try/catch`; este pedaço está. Se a porta estourar, a cena segue com
       a condição de pé — que é exatamente o comportamento de antes desta
       versão. */
    try {
      if ((pers.condicoes || []).length) {
        const saida = tentarSaidaNoFimDoTurno(pers, { modDe: (a) => atributoEfetivo(pers, a), d20: d20DoTurno });
        if (saida.mudou) {
          pers = { ...pers, condicoes: saida.condicoes };
          msgs.push(...saida.linhas);
        }
      }
    } catch (e) { calou("salvaguarda-do-fim-do-turno", e); }
    /* ---------------- O RELÓGIO ALCANÇA O GRUPO (T1) ----------------
       `tickCondicoes` tinha dois sítios — eu, logo acima, e os inimigos,
       logo abaixo — e o grupo não tinha nenhum. Cinco sítios vivos
       escreviam condição em `pers.grupo` e zero a decrementavam: desde a
       v9.2, condição de companheiro nascia e não vencia nunca.

       O DENTE QUE IMPORTA AQUI É O BOM, e é o conserto, não o efeito
       colateral. Das condições que chegam ao grupo hoje NENHUMA é ruim:
       são as sete de apoio de `PORTADORES` (aflicoes.js), todas
       `tipo: "bom"`. O relógio TIRA vantagem do grupo — medido em Uma
       Vida (1000 combates, `umavida|0..999`): 727 condições que hoje não
       venceriam passam a vencer, em 4,1 turnos cada, e a exposição do
       grupo cai 42% no cenário duro.

       O DANO POR TURNO FICA DE FORA, DE PROPÓSITO. `tickCondicoes` também
       devolve `dano`/`fontes`, e eu e os inimigos os cobramos. O grupo
       não: companheiro morrendo de veneno é um jeito novo de o jogador
       perder um companheiro, e isso é decisão da pessoa. E não esconde
       nada — as três condições que doem por turno (envenenado, sangrando,
       queimando) têm portador único e sempre `alvo: "alvo"`, que escreve
       em mim ou no inimigo e nunca no grupo. Medido: 0 em 2000 combates,
       com asserção na suíte guardando o zero.

       NÃO FILTRA POR VIDA, e a diferença para o irmão dos inimigos é de
       propósito: o inimigo derrotado sai de cena, o companheiro caído
       continua nela e pode ser erguido. O tempo passa para ele também. */
    try {
      const linhasDoGrupo = [];
      let mexeu = false;
      const grupoComPrazo = (pers.grupo || []).map((g) => {
        if (!g || !((g.condicoes || []).length)) return g;
        const t = tickCondicoes(g.condicoes);
        mexeu = true;
        for (const c of t.expiradas) linhasDoGrupo.push(`✓ ${g.nome}: ${c.nome} passou`);
        return { ...g, condicoes: t.condicoes };
      });
      if (mexeu) {
        pers = { ...pers, grupo: grupoComPrazo };
        msgs.push(...linhasDoGrupo);
      }
    } catch (e) { calou("prazo-da-condicao-do-grupo", e); }
    /* ---- A SEGUNDA CHANCE DO COMPANHEIRO (T3) ----
       DEPOIS DO RELÓGIO, como a minha: o tique de T1 acabou de rodar logo
       acima, e só então vem a chance de sair.

       E DE FORA DAQUELE `map`, DE PROPÓSITO. Embutida lá dentro, ela teria
       de renomear a linha que escreve o prazo de volta na ficha — a linha
       exata que T1 guarda com asserção — e um estouro seu levaria junto o
       tique que já tinha rodado. Aqui o prazo é de T1 e sobrevive sozinho,
       e esta passagem sai irmã do sítio do herói.

       SEM `modDe`, e é medida do módulo, não esquecimento: o companheiro
       não traz `atributos` na ficha, e derivar um modificador de nível ou
       de ameaça seria regra nova e invisível. A metade da proficiência
       dele entra sozinha, porque ele declara `classe` — um Guerreiro
       aguenta veneno melhor que um Mago, que é o que a classe promete.

       NÃO FILTRA POR VIDA, pelo mesmo motivo que o tique de T1 não filtra:
       o companheiro caído continua na cena e pode ser erguido.

       E só tira condição — o dano por turno do grupo segue fora, como T1
       decidiu ali em cima. */
    try {
      const linhasDaSaida = [];
      let mexeu = false;
      const grupoComSaida = (pers.grupo || []).map((g) => {
        if (!g || !((g.condicoes || []).length)) return g;
        const saida = tentarSaidaNoFimDoTurno(g, { quem: g.nome, d20: d20DoTurno });
        if (!saida.mudou) return g;
        mexeu = true;
        linhasDaSaida.push(...saida.linhas);
        return { ...g, condicoes: saida.condicoes };
      });
      if (mexeu) {
        pers = { ...pers, grupo: grupoComSaida };
        msgs.push(...linhasDaSaida);
      }
    } catch (e) { calou("salvaguarda-do-fim-do-turno-do-grupo", e); }
    /* o mesmo vale para quem está do outro lado: veneno num inimigo precisa
       matar o inimigo, não decorar a ficha dele */
    if (combate && (combate.inimigos || []).some((e) => (e.condicoes || []).length && !e.derrotado)) {
      const comb = combate;
      const inimigos = comb.inimigos.map((e) => {
        if (e.derrotado || !(e.condicoes || []).length) return e;
        const t = tickCondicoes(e.condicoes);
        let vida = e.vida;
        if (t.dano > 0) {
          vida = Math.max(0, e.vida - t.dano);
          msgs.push(`${t.fontes.join(" + ")} em ${e.nome}: −${t.dano} PV (${vida}/${e.vidaMax})${vida <= 0 ? " ☠" : ""}`);
        }
        t.expiradas.forEach((c) => msgs.push(`✓ ${e.nome}: ${c.nome} passou`));
        /* A SEGUNDA CHANCE DO INIMIGO (T3) — depois do relógio, e SÓ DE PÉ:
           o que o dano da condição acabou de derrubar sai de cena, e corpo
           caído não se sacode de veneno. É a mesma leitura do filtro por
           `derrotado` que este sítio já faz, e a diferença para o grupo é
           de propósito — T1 escreveu o porquê ali em cima: o companheiro
           caído continua na cena, o inimigo derrotado não.

           Sem `modDe`: o bestiário não traz `atributos` e o inimigo não
           declara classe nenhuma — ele fica no piso declarado na tabela,
           que é o dado cru contra a dificuldade.

           Em `try/catch` porque este sítio também nunca esteve em um: uma
           salvaguarda que estoure não pode levar a luta junto. */
        let condicoes = t.condicoes;
        if (vida > 0) {
          try {
            const saida = tentarSaidaNoFimDoTurno({ ...e, condicoes: t.condicoes }, { quem: e.nome, d20: d20DoTurno });
            if (saida.mudou) { condicoes = saida.condicoes; msgs.push(...saida.linhas); }
          } catch (err) { calou("salvaguarda-do-fim-do-turno-do-inimigo", err); }
        }
        return { ...e, condicoes, vida, derrotado: e.derrotado || vida <= 0 };
      });
      const nc = { ...comb, inimigos };
      combate = nc; efeitosDoTurno.push({ tipo: "combate", combate: nc });
    }
    }
    /* tick das recargas de habilidade (v7.4.3): 1 turno por rodada — e desde
       a v9.13 toda resposta É uma rodada, então não há mais o que checar */
    if (pers.habRecarga && Object.keys(pers.habRecarga).length) {
      const rec = {};
      Object.entries(pers.habRecarga).forEach(([k, t]) => { const nt = (Number(t) || 0) - 1; if (nt > 0) rec[k] = nt; });
      pers = { ...pers, habRecarga: rec };
    }
    if (resp.mudancas) {
      /* v9.154: as recusas do Juiz viajam para o Narrador. Sem isto ele
         narra o poder que o sistema acabou de negar, e o jogador ve as
         duas coisas na mesma tela. */
      const notasDoJuiz = [];
      pers = aplicarMudancas(pers, resp.mudancas, msgs, notasDoJuiz);
      for (const nt of notasDoJuiz) notas.push(nt);
    }
    /* ---------------- A COBRANÇA (v9.70) ----------------
       "Se ela disse 'você acha 100 moedas e uma poção de vida', então o
       mestre credita 100 moedas e uma poção de vida."

       O Mestre tem um canal para declarar o que mudou, e o sistema o aplica
       direitinho. Mas ele é um narrador: às vezes escreve a cena inteira,
       com o brilho das moedas na palma da mão, e esquece de preencher o
       campo. O jogador LÊ que ganhou e olha a bolsa igual.

       Não é bug de código — é a distância entre a ficção e a ficha, e ela
       aparece do lado que ninguém confere. Aqui o sistema lê a narração,
       subtrai o que já foi declarado e credita a diferença. No caso comum,
       em que o campo veio certo, a subtração dá zero e isto não faz nada.

       O AVISO ANTIGO DESTE MESMO LUGAR vale de novo, e está três parágrafos
       abaixo: já houve um cão de guarda que lia condições na narração, e
       "o ar quente preso na garganta" virou dois turnos de Agarrado. Por
       isso aqui só entram QUANTIA e ITEM DE CATÁLOGO, com verbo de aquisição
       e o herói como sujeito — nunca um estado, nunca uma metáfora. */
    try {
      /* E3 (a fiação): o achado da estrada já entrou na bolsa no rolar, e o
         envelope di-lo com uma marca (encontros.js); o que ela diz conta como
         declarado, para a narração do achado não o pagar outra vez.
         8.ª sessão (v9.429): quem desconta a marca é o próprio módulo, pelos
         `envelopes` — somá-la aqui também descontaria o achado duas vezes. E a
         moeda do mundo ("você acha 10 escamas") vai pelo nome, a mesma do débito */
      const falta = oQueFaltaCreditar(resp.narrativa, resp.mudancas, { moeda: typeof op.moeda === "string" ? op.moeda : "", envelopes: op.envelopes || "" });
      /* O DADO MANDA MAIS QUE A NARRAÇÃO. Achado na prova desta versão: o
         teste falhou, o Mestre narrou o roubo dando certo assim mesmo, e a
         cobrança creditou. A peça feita para a ficha obedecer à ficção tinha
         acabado de fazer a ficção passar por cima do dado — a inversão exata
         do projeto. Uma regra que depende de o outro lado obedecer não é
         regra, é pedido; esta pergunta ao resultado antes de creditar. */
      if (falta.temAlgo && ultimoDesfecho === "falha") {
        notas.push(envelopeDaCobrancaNegada(falta));
      } else if (falta.temAlgo) {
        const extras = falta.consumiveis.map((c) => itemConsumivel(c.id)).filter(Boolean);
        pers = {
          ...pers,
          moedas: Math.max(0, (pers.moedas || 0) + falta.moedas),
          inventario: [...(pers.inventario || []), ...extras],
        };
        msgs.push(falaDaCobranca(falta));
        /* v9.71: e a mesa fica sabendo que este turno rendeu. Sem isto, o
           turno em que o herói acha o tesouro pela cobrança — e não pelo
           campo declarado — contaria como turno vazio, e a cena esfriaria
           no papel enquanto esquentava na mesa. */
        efeitosDoTurno.push({ tipo: "textura", ganho: true });
        notas.push(envelopeDaCobranca(falta));
      }
    } catch { /* conferir a narração nunca pode custar o turno */ }
    /* O ESPELHO: o que a narração diz que o herói PAGOU, ver cobranca.js —
       MM13b, da prova jogada de MM13. `envelopes` é o que foi ao Narrador
       neste turno (a pauta, os avisos do sistema): se ele já disse "já
       registrada pelo sistema", a compra já saiu da bolsa por outro
       caminho, e debitar de novo cobraria duas vezes. */
    try {
      const deb = oQueFaltaDebitar(resp.narrativa, resp.mudancas, { bolsa: pers.moedas || 0, envelopes: op.envelopes || "", pedido: typeof op.pedido === "string" ? op.pedido : "", moeda: typeof op.moeda === "string" ? op.moeda : "" });
      if (deb.temAlgo && !deb.semFundos) { pers = { ...pers, moedas: Math.max(0, (pers.moedas || 0) - deb.moedas) }; msgs.push(falaDoDebito(deb)); }
      if (deb.temAlgo) notas.push(envelopeDoDebito(deb));
    } catch (e) { calou("oQueFaltaDebitar", e); }
    return {
      estado: { ...e0, personagem: pers, combate, danoJaAplicado: travas.danoJaAplicado, habUsada: travas.habUsada },
      efeitos: efeitosDoTurno, paraOCronista: notas, podado: resp, msgs,
    };
}

/* ============================================================
   O CONTEXTO DE UM NOME (MM14 · 10), a metade que depende do nome

   `nomeComDono` (npcs.js) decide se um nome novo é homónimo de quem
   importa, e precisa de um contexto. O App monta a parte que é do JOGO
   (a pista e o alvo, os marcos, o grupo, o elenco do mundo, as missões
   ativas, o mural, as falas recentes, onde o herói está) — `base`; aqui se
   junta a parte que é do NOME (o paradeiro, o gênero, o papel, as notas).
   A forma e a ordem são as do `contextoDoNome` do App, que passou a
   chamar esta: os dois lados dizem a mesma coisa porque são a mesma linha.
   ============================================================ */
export function contextoDoNomeCom(base, n) {
  const b = base && typeof base === "object" ? base : {};
  return { importantes: b.importantes || [], conhecidos: b.conhecidos || [], recentes: b.recentes || [], grupo: b.grupo || [], local: (n && n.local) || "", genero: (n && n.genero) || "", papel: (n && n.papel) || "", notas: [n && n.notas, n && n.status, n && n.descricao].filter((x) => typeof x === "string" && x).join(" · "), aqui: b.aqui || [], heroi: b.heroi || "" };
}

/* ============================================================
   O REGISTO — o cânone e a gente que o Narrador declarou (T1-A, 2.ª fatia)

     aplicarORegisto(estado, resposta, ctx) → { estado, efeitos, paraOCronista, msgs }

   O par seguinte do `aplicarResposta`, na MESMA posição de lá (depois do
   mapa, das missões e dos sinais, antes do combate), e o corpo é o do App
   linha por linha (4617715), com estas trocas e nenhuma outra:
   - `canoneRef`, `mapaRef`, `npcsRef`, `npcTurnoRef` → o estado (e cada
     escrita, um efeito: `canone`, `mapa`, `npcTurno`, `npcs` — o App os
     põe nos refs e na tela);
   - `espinhaRef`, `aberturaMundoRef`, `lugarRef`, `missoesRef`, `diaRef`
     → lidos do estado;
   - `mundoDaBase()` → `ctx.mundo` (valor, ou função chamada só quando a
     peneira precisa, dentro do mesmo try de lá), com o mapa do ESTADO (3.ª
     fatia: na fusão, o ref do App ainda não tem o mapa que o meio do turno
     acabou de escrever);
   - `contextoDoNome(n)` → `contextoDoNomeCom(ctx.baseDoNome, n)` (a base
     é pedida uma vez, na primeira vez que um nome precisa dela, e recebe o
     mapa, a cidade, o lugar e a ficha do estado, pela mesma razão);
   - a nota do homónimo → `paraOCronista`; `calou` → efeito;
   - e as DUAS remontagens do prompt (a do cânone e a da gente) viram UM
     efeito `remontarPrompt` no fim. É o mesmo prompt: a segunda lia tudo
     o que a primeira lia, já atualizado, e entre as duas nada que o prompt
     lê mudava (o contador de turnos da gente não entra no prompt).
   Provado byte a byte por `teste-motor-aplicar.mjs` (secção 5) contra o
   bloco de antes, lido do git por `gerar-registo-dourado.mjs`.
   ============================================================ */
export function aplicarORegisto(estado, resposta, ctx = {}) {
  const e0 = estado && typeof estado === "object" ? estado : {};
  const op = ctx && typeof ctx === "object" ? ctx : {};
  const resp = resposta && typeof resposta === "object" ? resposta : {};
  const pers = e0.personagem;
  const msgs = [], notas = [], efeitosDoTurno = [];
  const calou = (onde, erro) => { efeitosDoTurno.push({ tipo: "calou", onde, erro }); };
  let canone = e0.canone, mapa = e0.mapa, npcs = e0.npcs;
  /* o contador da gente não é campo do estado do jogo (o App guarda-o num
     ref, e no load deriva-o das fichas): ausente, deriva-se como o load
     deriva — somar 1 a undefined gravava NaN em `ultimaVez` (28/10) */
  let npcTurno = Number.isFinite(e0.npcTurno) ? e0.npcTurno : retomarContador(e0.npcs);
  let remontar = false;
  let baseDoNome = null, pediuABase = false;
  const contextoDoNome = (n) => {
    if (!pediuABase) { pediuABase = true; baseDoNome = typeof op.baseDoNome === "function" ? op.baseDoNome({ mapa: e0.mapa, cidadeAtual: e0.cidadeAtual, lugar: e0.lugar, ficha: e0.fichaDoRef }) : op.baseDoNome; }
    return contextoDoNomeCom(baseDoNome, n);
  };
    /* CÂNONE: mescla fatos duráveis; campos novos atualizam, nunca apagam a ficha */
    if (resp.mudancas && resp.mudancas.canone && typeof resp.mudancas.canone === "object") {
      const c = { ...canone };
      /* MM15 (4): nenhum segredo que a espinha ainda guarda vira cânone
         pela boca do Narrador — a peneira recusa em silêncio; se ela
         estourar, segue o comportamento de hoje (nunca pior para o segredo). */
      let canoneDoNarrador = resp.mudancas.canone;
      try { const m = typeof op.mundo === "function" ? op.mundo() : op.mundo; canoneDoNarrador = peneirarCanone(resp.mudancas.canone, { espinha: e0.espinha, mundo: m && typeof m === "object" && e0.mapa ? { ...m, mapa: e0.mapa } : m }).canone; } catch (e) { calou("peneirarCanone (Narrador)", e); }
      for (const [nome, ficha] of Object.entries(canoneDoNarrador)) {
        if (!nome || !ficha || typeof ficha !== "object") continue;
        /* v9.36: registra em silêncio. O jogador acabou de LER a coisa na
           narração; avisá-lo de que ela foi arquivada é o sistema falando de
           si mesmo, e o códex está a um toque para quem quiser conferir. */
        c[nome] = { ...(c[nome] || {}), ...ficha };
      }
      canone = c; efeitosDoTurno.push({ tipo: "canone", canone: c });
      /* rede de segurança do MAPA: se o cânone registra um lugar (tipo local/
         cidade/vila/capital), garante que ele exista no mapa mesmo que o Mestre
         não tenha enviado "mapa_cidades". Assim o mapa nunca fica vazio. */
      let mp2 = mapa, tocouMapa = false;
      for (const [nome, ficha] of Object.entries(c)) {
        const tipo = (ficha.tipo || "").toLowerCase();
        const ehLugar = ["local", "cidade", "vila", "capital", "fortaleza", "vilarejo", "povoado", "reduto", "ruína"].some((t) => tipo.includes(t));
        if (!ehLugar) continue;
        if (!(mp2.cidades || []).some((cc) => cc.nome.toLowerCase() === nome.toLowerCase())) {
          if (!tocouMapa) { mp2 = { ...mp2, cidades: [...(mp2.cidades || [])], faccoes: [...(mp2.faccoes || [])] }; tocouMapa = true; }
          mp2.cidades.push(criarCidade(nome, { tipo: tipo.includes("capital") ? "capital" : tipo.includes("vila") || tipo.includes("povoado") ? "vila" : "cidade", regiao: ficha.local || "", faccao: ficha.faccao || null, notas: ficha.notas || "" }));
          msgs.push(`🗺 ${nome} surgiu no mapa`);
        }
      }
      if (tocouMapa) { mp2 = garantirGeografia(mp2, "taverna|canone"); mapa = mp2; efeitosDoTurno.push({ tipo: "mapa", mapa: mp2 }); }
      remontar = true;
    }
    /* PESSOAS (registro de NPCs): o Mestre envia "npcs"; e como blindagem de
       memória, qualquer PESSOA do cânone sem ficha entra no registro por código. */
    /* O CONTADOR DA GENTE ANDA UMA VEZ POR TURNO DO NARRADOR (T1-A, 7.ª fatia;
       o achado da T3-B). Andava só quando a resposta trazia `mudancas`: com
       `{}` contava, e quando a porta da luta as podava todas (a poda devolve
       `null`) não contava — o mesmo turno, duas réguas, e a recência de quem
       foi visto (`ultimaVez`) escorregava um passo por cada poda. */
    npcTurno += 1; efeitosDoTurno.push({ tipo: "npcTurno", npcTurno });
    if (resp.mudancas) {
      let reg = npcs;
      let tocou = false;
      /* MM14 · 10a: um nome novo que colide com quem já importa (mesmo
         primeiro nome) é a mesma pessoa, ou é recusado — as três portas do
         registo (aqui, o cânone logo abaixo, e o Cronista mais adiante)
         passam por `nomeComDono` antes de criar ou mesclar ficha. */
      const homonimos = [];
      [].concat(resp.mudancas.npcs || []).forEach((n) => {
        if (!n || !n.nome) return;
        let id = null;
        try { id = nomeComDono(n.nome, reg, contextoDoNome(n)); } catch (e) { calou("nomeComDono", e); }
        if (id && id.decisao === "recusada") { homonimos.push(id); return; }
        const nomeCerto = (id && id.nome) || n.nome;
        /* MM13: a menção não é presença — o nome da pista (ou do alvo) da
           abertura não entra no registo antes de o herói de fato chegar. */
        if (aindaSoUmNome(e0.abertura, nomeCerto, { lugar: e0.lugar, missoes: e0.missoes })) return;
        const chave = (id && id.chave) || Object.keys(reg).find((k) => k.toLowerCase() === String(nomeCerto).toLowerCase());
        const ficha = chave
          ? mesclarNPC(reg[chave], { ...n, ultimaVez: npcTurno, conhecidoEm: reg[chave].conhecidoEm != null ? reg[chave].conhecidoEm : e0.dia })
          : criarNPC(nomeCerto, { ...n, ultimaVez: npcTurno, conhecidoEm: n.conhecidoEm != null ? n.conhecidoEm : e0.dia });
        if (!tocou) { reg = { ...reg }; tocou = true; }
        reg[chave || nomeCerto] = ficha;
      });
      for (const [nome, f] of Object.entries(canone || {})) {
        if (!f || !String(f.tipo || "").toLowerCase().includes("pessoa")) continue;
        if (Object.keys(reg).some((k) => k.toLowerCase() === nome.toLowerCase())) continue;
        let id = null;
        try { id = nomeComDono(nome, reg, contextoDoNome(f)); } catch (e) { calou("nomeComDono", e); }
        if (id && id.decisao === "recusada") { homonimos.push(id); continue; }
        const nomeCerto = (id && id.nome) || nome;
        /* MM13: idem — a menção não é presença. */
        if (aindaSoUmNome(e0.abertura, nomeCerto, { lugar: e0.lugar, missoes: e0.missoes })) continue;
        const chave = (id && id.chave) || Object.keys(reg).find((k) => k.toLowerCase() === nomeCerto.toLowerCase());
        /* chave achada por homónimo (id.chave): já existe ficha dela — mescla,
           nunca `criarNPC` por cima (apagaria laço e consultas já firmados;
           sem isto, este mesmo cânone recriaria "Delfina" do zero a cada
           turno, porque a chave literal "Delfina da Névoa" nunca entra no
           registo e o `continue` de cima não a barra de novo). */
        const dadosCanone = { papel: f.papel || "", genero: f.genero || "", local: f.local || "", status: f.status || "vivo", notas: f.notas || "", ultimaVez: npcTurno, conhecidoEm: e0.dia,
          /* a marca do que só se ouviu (trilha B, 28/10): a pessoa do cânone que o Cronista
             marcou entra marcada — sem isto esta porta a criava como fato. A mescla não a
             copia para quem já é fato (npcs.js#mesclarNPC). */
          ...(typeof f.dito === "string" && f.dito.trim() ? { dito: f.dito } : {}) };
        if (!tocou) { reg = { ...reg }; tocou = true; }
        reg[chave || nomeCerto] = chave ? mesclarNPC(reg[chave], dadosCanone) : criarNPC(nomeCerto, dadosCanone);
      }
      if (homonimos.length) notas.push(notaDoHomonimo(homonimos));
      if (tocou) {
        npcs = reg; efeitosDoTurno.push({ tipo: "npcs", npcs: reg });
        remontar = true;
      }
    }
  if (remontar) efeitosDoTurno.push({ tipo: "remontarPrompt", personagem: pers });
  return {
    estado: { ...e0, canone, mapa, npcs, npcTurno },
    efeitos: efeitosDoTurno, paraOCronista: notas, msgs,
  };
}

/* ============================================================
   O TURNO NUMA ORDEM SÓ (T1-A, 3.ª fatia, 28/10)

     aplicarOTurno(estado, resposta, ctx) → { estado, efeitos, paraOCronista, podado, msgs }

   As peças do motor, na ORDEM que o `aplicarResposta` tinha: o `aplicar`
   (a porta da luta, as travas, o relógio, a segunda chance, as recargas, as
   mudanças, a cobrança e o débito), a dádiva pendente, o mapa, as missões,
   os sinais e o registo (o cânone e a gente). Até a 3.ª fatia o App corria
   cada uma e aplicava os efeitos nos refs antes da seguinte; agora o estado
   passa de peça em peça AQUI, e os efeitos saem todos, na ordem em que
   nasceram, para o App aplicar uma vez só — o que um efeito do fim lê (o
   prompt remontado) encontra os refs como os efeitos de antes o deixaram.

   `estado`: o de cada peça, num objeto só — a ficha (`personagem`), a
   ficha que o App tem no ref (`fichaDoRef`), a luta e as travas, o mapa, a
   cidade, o lugar, a jornada, a facção, a devoção, o deus, o acampamento, a
   masmorra, a raid, a espinha, a última fala, o dia, os eventos, o arco, os
   contadores (a fama sai do nível da ficha), o cânone, a gente e o contador dela, a
   abertura, as missões. `ctx`: o do `aplicar` (envelopes, pedido da bolsa,
   moeda, sorte da salvaguarda), mais o mundo, a base do nome, o motor do
   arco e a sorte do turno.

   Uma peça do meio que estoure não leva o turno: vira um efeito `calou`, e
   o estado segue como estava antes dela (o mesmo que o App fazia, cada
   bloco no seu try). Sem ficha, não há turno (`semFicha`, como antes).

   Provado byte a byte por `teste-motor-aplicar.mjs` (secção 9) contra a
   fila de antes (48579a9), lida do git por `gerar-turno-dourado.mjs`.
   ============================================================ */
export function aplicarOTurno(estado, resposta, ctx = {}) {
  const a = aplicar(estado, resposta, ctx);
  if (a.semFicha) return a;
  const resp = a.podado;
  let st = a.estado;
  const efeitos = [...a.efeitos], notas = [...a.paraOCronista], msgs = [...a.msgs];
  if ((st.personagem.dadivasPendentes || 0) > 0) {
    try {
      const d = dadivasConcedidas(st.personagem, st.divindade);
      st = { ...st, personagem: d.personagem }; msgs.push(...d.msgs); notas.push(...d.notas);
    } catch (e) { efeitos.push({ tipo: "calou", onde: "as dádivas do turno", erro: e }); }
  }
  const pecas = [["o mapa do turno", aplicarOMapa], ["as missões do turno", aplicarAsMissoes], ["os sinais do turno", aplicarOsSinais], ["o registo do turno", aplicarORegisto]];
  for (const [onde, peca] of pecas) {
    try {
      const r = peca(st, resp, ctx);
      st = { ...st, ...r.estado };
      efeitos.push(...r.efeitos); notas.push(...r.paraOCronista); msgs.push(...r.msgs);
    } catch (e) { efeitos.push({ tipo: "calou", onde, erro: e }); }
  }
  return { estado: st, efeitos, paraOCronista: notas, podado: resp, msgs };
}
