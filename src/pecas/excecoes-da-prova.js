/* ============================================================
   AS PEÇAS · AS EXCEÇÕES DA QUEST DA PROVA (17/11/2026, Fase A) — src/pecas/excecoes-da-prova.js

   O molde dá a peça genérica; a qualidade vem do que se escreve à mão onde
   a etapa é especial (as-pecas.md §4). Na fase A a biblioteca não se toca,
   e por isso as exceções da quest da prova vivem aqui, por id de quest e de
   etapa, na MESMA forma do campo opcional `pecas` que uma etapa poderá
   declarar na fase B:
     solucoes: { <predicado>: { tira: [id do molde], poe: [solução] } }
     pistas:   { <id da solução>: "frase com {nome}" }
     relogio:  { cheio }
     evento:   { <predicado>: "o que o mundo faz quando cobra, com {nome}" }

   «O Que Desce ao Anoitecer» (o_que_desce_ao_anoitecer), 4 etapas:
   · ver — o curral está aberto: a pastora deixou lá os bichos para serem
     vistos. Não há caminho a vencer até lá (tira-se o «chegar»), há o que
     ler lá dentro: os rastos, a palha, o que os vizinhos ouviram;
   · rasto — o molde serve (2 de: descobrir o curral, falar com a pastora,
     ir à toca), com a pista da tabela;
   · fera — a besta não fala (QUEM_FALA não a tem): sai o «falar» do
     encontro; entra «acalmar» (a perícia do bicho), que é o assobio
     sem o tratador;
   · destino — a carta de escolha, sem exceção.

   FASE B (17/11/2026, o que a fase A2 mostrou faltar — SÓ nesta quest):
   · a toca ganha o «olhar»: quem examina a toca à procura do bicho
     (sondar, investigar/buscar) ganha a vantagem de espreitar; falhar
     custa tempo e a etapa continua. Não fecha a etapa: é o caminho para a
     vantagem, e por isso o mundo nunca a força (fecha: false);
   · as pistas do rastro: as do caminho até à toca, que o quadro não tem
     (as outras já saem do quadro da quest, CAMINHOS_DA_CARTA, e ficam);
   · FALAS_DA_SETA: o que o Mestre diz antes do dado, quando a falha leva a
     outra solução — secas, de Mestre de mesa. Lidas por no-jogo.js
     (avisoDaSeta); a chave é a ação base da solução que se tenta.
   ============================================================ */
const sol = (id, acao, pede, sucesso, falha, extra) => Object.freeze({ id, acao, pede, sucesso: Object.freeze(sucesso), falha: falha ? Object.freeze(falha) : null, ...(extra || {}) });

export const FALAS_DA_SETA = Object.freeze({
  o_que_desce_ao_anoitecer: Object.freeze({
    intimidar: "Se falhar, ela não recua — é luta.",
    espreitar: "Se falhar, ela sente você antes — é luta, e ela ataca primeiro.",
    emboscar: "Se falhar, ela sente você antes — é luta, e ela ataca primeiro.",
    recuar: "Se falhar, ela alcança você — é luta, de costas.",
    fugir: "Se falhar, ela alcança você — é luta, de costas.",
    capturar: "Se falhar, a corda escapa — é luta.",
    acalmar: "Se falhar, ela estranha o assobio — é luta.",
    lutar: "Se perder, ela fica com a toca, e alguém vai saber.",
  }),
});

export const EXCECOES_DA_PROVA = Object.freeze({
  o_que_desce_ao_anoitecer: Object.freeze({
    ver: Object.freeze({
      solucoes: Object.freeze({
        esteve: Object.freeze({
          tira: Object.freeze(["rastrear", "orientar", "seguir", "esgueirar", "escalar", "arrombar", "convencer", "pagar"]),
          poe: Object.freeze([
            sol("ler", "investigar", "noLugar", { fato: true }, { preco: "incompleta", escreve: true }),
            sol("revistar", "buscar", "noLugar", { fato: true }, { para: "ler" }),
            sol("pegadas", "rastrear", "noLugar", { fato: true }, { preco: "tempo", escreve: true }),
            sol("vizinhos", "fazer_falar", "alguem", { fato: true }, { para: "ler" }),
          ]),
        }),
      }),
      pistas: Object.freeze({
        ler: "a porta de {nome} foi arranhada de fora, à altura de um homem",
        revistar: "há tufos de pelo escuro presos na palha de {nome}",
        pegadas: "as marcas na lama de {nome} são de quatro patas, e fundas",
        vizinhos: "quem mora ao lado de {nome} ouviu o sino e depois mais nada",
      }),
      evento: Object.freeze({ esteve: "a besta desce outra vez ao toque do sino, e há mais um animal morto em {nome}" }),
    }),
    rasto: Object.freeze({
      pistas: Object.freeze({
        rastrear: "as marcas fundas na lama, de quatro patas, levam a {nome}",
        orientar: "quem conhece o caminho do mato sabe onde fica {nome}",
      }),
      evento: Object.freeze({
        descobriu: "a besta desce outra vez, e o rastro de ontem fica por baixo do de hoje",
        conversou: "{nome} se cansa de esperar e vai pregar um prego por cima da porta",
        esteve: "a noite cai antes de você chegar, e a besta já não está na toca",
        esta_em: "a noite cai antes de você chegar, e a besta já não está na toca",
      }),
    }),
    fera: Object.freeze({
      solucoes: Object.freeze({
        encontrou: Object.freeze({
          tira: Object.freeze(["falar"]),
          poe: Object.freeze([
            sol("acalmar", "acalmar_bicho", "presente", { fato: true }, { para: "lutar", vantagem: "descoberto" }),
            sol("sondar", "investigar", "presente", { para: "espreitar", vantagem: "espreitou" }, { preco: "tempo", continua: true }, { fecha: false }),
          ]),
        }),
      }),
      pistas: Object.freeze({
        acalmar: "{nome} baixa a cabeça a quem lhe conhece o assobio",
        lutar: "{nome} defende a entrada da toca, e não recua",
        intimidar: "{nome} recua diante do fogo e do barulho, mas só uma vez",
        capturar: "{nome} é forte, mas pesada: uma corda bem atirada a prende",
        sondar: "a terra na boca da toca está remexida de um lado só: é por ali que {nome} entra e sai",
        espreitar: "o vento sopra da toca para fora: quem chegar por baixo dele chega sem cheiro",
      }),
      evento: Object.freeze({
        derrotou: "{nome} sai da toca ao toque do sino e leva mais um animal antes de você a encarar",
        encontrou: "{nome} sai da toca ao toque do sino e leva mais um animal antes de você a encarar",
      }),
    }),
  }),
});
