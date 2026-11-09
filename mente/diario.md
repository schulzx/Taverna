# O diário da mente

Um registro por ciclo, o mais recente no topo. É aqui que a pessoa vê o que
cada agente fez, e é aqui que a mente lê o próprio passado antes de agir.

Formato:

```
## 13/10 · v9.454 · o companheiro recrutado ganha retrato no mesmo turno

O coordenador, com o bastão por dez minutos. `fichaDeCompanheiro` passa a devolver a ficha por `garantirFichaCompanheiro`, com o gênero do registo, dentro de `calou`; antes, o recrutado só ganhava raça (e pintura) no load seguinte. A fiação 2 do backend (dar `genero` aos companheiros iniciais dos saves antigos no load) NÃO foi feita: mudaria a cara de quem já está a jogar. Régua em `teste-retratos.mjs`.

## 12/10 · v9.444 · a faixa recolhe na janela baixa

O coordenador, com o bastão das 21:55 às 22:05. A prova viva do mapa (v9.443) mediu 2 linhas de prosa à vista a 800×451 com a faixa e as fichas (6 sem a faixa). Decisão média, pelo número: na altura em que as fichas já tomam a página (`FICHAS.baixaAltura`), a faixa recolhe como na luta; o mapa continua pela tecla M, pela aba e pelo toque nas fichas de lugar. Uma linha no App, a régua em `teste-painel-mapa-vivo.mjs`.

## dd/mm hh:mm · vX.YYY · <título do item> · commit <hash>
- **estado inicial:** suítes verdes/vermelhas, o que a pauta tinha
- **conselheiro:** o que propôs (ou "não chamado")
- **backend / frontend / testes:** o que cada um entregou, em uma linha cada
- **decisões médias tomadas:** cada uma com o motivo (é o que a pessoa audita)
- **o que ficou:** o que não coube, o que dormiu, o que foi para "pesado"
```

---

## 09/11 · v9.631 · os espólios chegam ao jogo, com a cerimónia e os artefactos com nome
- **TE9 motor (`backend`, bae2671):** o achado escondido, o da etapa e a paga no fecho (uma vez só, três trincos); a paga substitui o feito do Narrador; o artefacto acorda; a linha do que se leva na pauta (pior caso 1366/1400); o replay igual.
- **TE10 peças (`aprendiz`, bae2671):** a cerimónia (as cartas de costas a virar pela raridade, teto 4 s), o veredito com «Equipar já», o chip do achado, o despertar, a relíquia. O agente caiu por falha de rede no fim; o trabalho estava no disco e verde.
- **a fiação (`oficial`, bastão 20:21–21:14):** a fila das cerimónias (espólio → nível → despertar, nunca com a luta aberta), «Equipar já» pelo equipar da gaveta, a faixa da quest sem peça; visto a 1905 e a 375 (CONCLUÍDA com +125 XP; «O QUE FICA» e a lembrança equipada). **Decisão minha:** a paga da quest vai direta à mochila (é o que a cerimónia diz); os achados do caminho ficam no chão — próxima volta do motor.
- **TE8 (`backend`):** 17 artefactos e 16 lembranças (`src/acervo/artefactos-lote-1.js`, leitura em `mente/leitura-artefactos.md`); o confronto leva sempre o seu; a relíquia arma ganha aço pelo nível (`ACO_DA_RELIQUIA`: antes −18 a −28 no 17, agora +2,7 a +19,7 em 18 de 20 mesas, nunca acima de 70%); o Último Argumento perde o golpe extra. **Desvio aceite:** do nível 11 a arma desperta acende a Aurora/Ceifa (a régua aprova; nível 12: +3 a +7, contra ~0 da peça genérica). Defeito antigo à parte: `criticoMinimo` não lê os poderes dos itens.
- **a pessoa (09/11):** o som (ligado, volume baixo, interruptor; três momentos), a carta de costas no Diário (só a luz da raridade, sem a tabela dos caminhos), a lenda que a arma escreve (dos factos, teto 5) — próxima volta.

## 09/11 · v9.630 · a temperatura das quests (TE1–TE5), e os espólios com a régua do poder (TE6–TE7)
- **TE1–TE3 (`backend`):** a temperatura (brasa, chama, fogueira, incêndio) nas 52, coerente com o `quando`; `pressupoe`/`estabelece` com três predicados novos (camada do vilão, sabe_nome, convivência); o efeito `deixa` sai (escrevia numa lista sem leitor; as 18 reviravoltas que só o tinham passam a uma linha do QUEM É). As 14 correções da auditoria: «com o teu nome» 154 → 0, a Ama antes da hora 34 → 0.
- **TE4–TE5 (`backend`):** `CURVA_DA_TEMPERATURA` por ato com um respiro; o grafo nunca se viola; a quest do coração espera o pressuposto (`espinha.quests.espera`, 7 dias, depois a reserva). Rosto antes do ato 35 → 0, duplo encontro 35 → 0, coração quente no turno 0 315 → 0, fora da curva 111 → 0. Eu liguei `elenco` ao estado das quests no App (bastão de minutos).
- **TE7 + TE6 (`backend`):** a régua do poder (20 mesas justas, 5 classes × 4 níveis, peças sorteadas): o kit da história +2 a +11 pontos no 3 e no 7, nunca acima de 70%. **A régua mudou a planta:** do nível 11 a quest dá um degrau abaixo do teto do DMG (no teto, +25 no Guerreiro); o artefacto não passa o teto nem leva passivos de dano/defesa (a força é o gesto); a relíquia arma piora com o nível (sem `dano` de base) — para a TE8. `src/espolios.js`: uma campanha típica dá ~1 nível de XP, ~600–960 moedas, 2–3 peças acima do nível, até 2 artefactos, ~10 achados, uma relíquia em cada 4–5. Antes: 0 XP e 0 itens por código.
- **a prova (10e8a3f):** 466/466 suítes; o `varredura-exports` foi parado pelo relógio do corredor aos 120 s (dois agentes a correr suítes em paralelo) — o próprio corredor diz «não é veredito da suíte». Corrido sozinho na mesma cópia limpa: exit 0. Subido com esta nota.
- **o que fica:** TE8 (os artefactos com nome, e a relíquia arma), TE9 (a fiação), TE10 (o momento da recompensa, do desenho), TE11 (a prova); do nível 11 em diante o «mais forte» tem de vir do artefacto.

## 09/11 · v9.629 · a prosa tocável no ar, e a planta da temperatura e dos espólios
- **a prosa tocável:** o `desenho` (formas.md «TP», Figma 327:2), o `backend` (`marcasDaProsa` em fichas.js, 87 provas com as 194 respostas gravadas), o `aprendiz` (NomeTocavel, CartaoNaProsa, EmCena com `nomeados`) e o `oficial` (bastão 14:12–14:27; as marcas uma vez por resposta, em `calou`; o mesmo estado do EmCena; uma ficha aberta só — decisão dele, aceite). Visto a 1905: «Falo com Conrado Sem-Senhor» ao 1.º toque, o cartão ao 2.º; a 375 o cartão tapava o nome — o `aprendiz` corrigiu (o nome 16 px acima da folha) e o nome repetido no campo (`juntarNomeNoCampo`, defeito antigo).
- **a palavra (09/11):** a temperatura das quests («uma missão quente e depois uma missão fria») e os espólios («ele precisa da recompensa e da sensação de ficar mais forte»). O `conselheiro` fez `mente/plano-temperatura-e-espolios.md` e a Fase TE (TE1–TE11) no topo da pauta. **Achado:** uma quest da biblioteca paga 0 XP e 0 itens por código. 14 quests pressupõem o que pode não ter acontecido. Decisões da pessoa: 2 artefactos + até 2 lembranças por campanha, as 10 relíquias no confronto; o achado espera até a quest fechar.
- **eu:** arquivei a mente (`node mente/arquivar.mjs`: diário 486 KB → 12 KB, a mente 41% mais leve por ciclo).

## 09/11 · v9.628 · o acervo completo — 36 quests físicas, 16 do coração, 20 vilões com plano
- **lote 5 (`backend`):** oito físicas do cedo e do meio (O Pão Que Sai de Noite, A Barca a Meio do Rio, As Chaves da Guarda, A Torre do Sino, A Rua Que Não Acorda, As Pegadas no Barro — a besta lida só pelas pegadas —, A Estalagem do Temporal, As Duas Fogueiras) e quatro do coração (A Vigia Trocada, A Última Lição, O Sangue do Carrasco, Quarenta Invernos), e os quatro últimos planos (espelho, penitente, fomentador, viúva do trono): **20 de 20**, o plano de recuo já não é alcançado.
- **lote 6 (`backend`, em paralelo, cada lote no seu ficheiro):** nove físicas do meio e do fim (Os Dados Dele, A Mesma Tempestade, A Nona Noite, O Último Barco, O Teu Nome na Parede, O Posto do Capitão Morto, As Armas do Poço, O Recado Verdadeiro, O Que a Ama Esqueceu) e quatro do coração (A Cabeça Que Não Se Baixa, O Que o Tio Deixou, O Juramento à Cabeceira, O Morto Que Voltou a Casa).
- **as medidas (1000 mundos):** a partilha média entre duas campanhas **0,84** (a meta da planta: abaixo de 1); o passo 4 por contestar nas espinhas de 4 atos 20 de 500; nenhuma quest a zero (a mínima entra em 32); o ato 0 espalhado por 7 quests. Catracas em `teste-esqueleto` 2b e 2c; a biblioteca com 836 provas, cada caminho de cada quest jogado.
- **o que fica:** a prosa tocável (aprovada) e a sessão de teste com IA, que se avalia com a pessoa.

---

## 09/11 · v9.627 · as quatro consequências caladas, e o lote 4 do acervo
- **a palavra:** «A prosa tocável é interessante, os outros dois não são necessários, prossiga para o que falta, termine o acervo e as quatro consequências caladas, depois faça a prosa tocável, e então avaliamos uma sessão teste». As duas recusadas foram para «Recusado» em `pauta-desenho.md`.
- **as consequências (`backend`):** `relogio_regional` (só a ameaça e a caçada andam — o mapa é uma região só; tabela `RELOGIOS_DA_REGIAO`, pelo `tiquear` de sempre); `favor` (tipo novo no livro de factos, a condição `deve_favor`, uma linha em «O QUE VOLTA» com o herói no lugar); `quem_e` (linha durável no livro, que o Cronista não apaga, lida por `quemEParaPauta`); o plano do vilão (`MUDA_DO_PLANO`: o relógio anda com a obra como causa, o «amado» perde um grau, a postura vira para a Sombra; base, porta, estrada, perigo e cativeiro calados com o motivo; cada passo cumprido manda a obra ao Narrador como facto longe). Eu liguei as três linhas no App (bastão de minutos).
- **o lote 4 (`backend`):** a casa nova — cada lote no seu ficheiro (`src/acervo/quests-lote-N.js`, `planos-lote-N.js`), para correrem em paralelo. Dez quests (À Luz do Dia: a besta mostra-se ao meio-dia; O Fundo da Toca; O Fundo da Pedreira; O Enforcado de Amanhã; O Livro dos Nomes; As Mãos Que Curam; Do Outro Lado do Vau; e do coração A Palavra Dada a Um Enforcado, A Vida Que Se Deve, A Farda Debaixo do Colchão) e quatro planos (16 de 20). **O vilão-fera à mesa: 289 → 0**; partilha média 2,35 → 1,64; passo 4 por contestar nas espinhas de 4 atos 216 → 81.

---

## 08/11 · v9.626 · a campanha nova já não herda nada da anterior
- **o `oficial` (bastão 09:28–09:51 e 09:53–10:09):** (1) a base do mundo repõe-se no começo de `iniciar`, antes da primeira composição do esqueleto — sem companheiro, o núcleo lia a base da campanha anterior; provado com duas campanhas seguidas no navegador (a base da primeira suja de propósito: zero nomes partilhados nos papéis da segunda). (2) o sino da abertura cala num mundo com esqueleto quando a quest do ato 0 tomou o lugar da principal antiga (apontava para «O Cervo Lento», alheio à quest). (3) **o defeito irmão:** `iniciar` não repunha doze refs de campanha — promessas, reviravoltas, escada, escuta, gestos, fatos do peso, episódio, a Noite e a postura —, e uma campanha nova na mesma sessão herdava o Livro de Promessas e a reviravolta da anterior. Repostas só numa campanha nova (não no capítulo, não na Noite, que semeia o Livro antes).

---

## 08/11 · v9.625 · BQ7b — as consequências das quests chegam ao jogo
- **o `oficial` (bastão 08:25–fim):** `src/motor/efeitos-da-quest.js` (puro) calcula cada efeito e o App executa pelo órgão de sempre: vinculo e marco (`aplicarVinculo`), afeição (no grupo pelo vínculo; fora, o grau ao livro e o laço que já exista), situação (`porSituacao`), dia (o relógio). **A morte** pelo caminho que já existia (sai do grupo como na luta sem saída, `registrarMorteDeAlvo`, `registrarMorte`), só com o registo terminado num desfecho que a traz e a pessoa ainda no grupo; a suíte confirma no acervo que toda morte exige uma escolha do herói.
- **corrigido da BQ7:** o estado passado ao motor das quests não levava a base do mundo — «situacao» e «morto» viam toda a gente livre.
- **a abertura** num ato com quest usa o gancho e a etapa da quest; o marco antigo cala. **O núcleo:** o esqueleto recompõe-se uma vez quando o companheiro inicial entra (só na criação) — o companheiro ganha a quest do coração dele (4 de 4 mundos; ao vivo, a Sable com O Sangue do Outro Lado). **Os rostos** ligados na encruzilhada e no Diário; o foco volta à soleira depois de «Depois».
- **o que fica:** calados à espera do sistema — `relogio_regional` (relógios sem região), `favor` (sem órgão), `quem_e` (sem linha durável), os efeitos do plano do vilão (sem alvo que o mundo aceite); o sino da abertura ainda toca sobre o alvo antigo; `rostoDoVilao`/`rostoDoTenente`; **um defeito antigo:** sem companheiro, o esqueleto compõe-se antes de a base do mundo ser reposta e o núcleo lê a da campanha anterior.

---

## 08/11 · v9.624 · a biblioteca entra no jogo (BQ7), e o lote 3 do acervo
- **o motor (`backend`, 1a1ae13):** `src/motor/quests-do-turno.js` — as quests e o vilão andam no fim do turno (depois do Cronista, que também escreve no livro); o registo em `espinha.quests` (o nome `quests` à cabeça do save já era das missões antigas); num mundo novo a quest concluída fecha o ato; «O PASSO» e «A MÃO DELE AQUI» pela pauta no lugar da batida (o MOMENTO mais longo cai de 1105 para 209 caracteres); o replay igual; a campanha antiga byte a byte; os oito pedidos da tela (gravidade e risco, `como`, `gente`, `oVilaoNoDiario`, `vistaEm`, o género `{papel:dele|dela}`, a frase que é carta).
- **as peças (`aprendiz`, 1a1ae13), da forma do `desenho` (`formas.md` «BQ · as quests na tela», Figma `313:2`):** a Encruzilhada (cartas de duas faces, gravidade pela forma, rosto de quem pode morrer, dois toques com o preço no botão), a soleira com o momento «escolha», o Diário com as duas histórias e o cartaz da sombra.
- **a fiação (`oficial`, bastão 07:19–07:47):** o esqueleto nasce na criação do mundo; as quests do ato 0 abrem antes do primeiro turno e a principal antiga só nasce sem quest do tipo 1; o turno das quests depois do Cronista; a encruzilhada e a frase que é carta; o Diário. **Visto no navegador:** O Salvo-Conduto abre no ato 1; a portagem com 15 moedas diz «faltam 25»; com 100, «Pagar 40» → 60 moedas, a etapa fecha, «3 de 4». Decisão do `oficial`, aceite: confirmar uma escolha manda um turno ao Narrador (sem isso ele nunca sabe o que se escolheu).
- **o lote 3 (`backend`):** oito quests (O Que Desce ao Anoitecer, As Botas na Estrada, Os Braços Que Faltam, O Último a Sair, O Velório Pago, A Hora Marcada, O Sangue do Outro Lado, As Cartas de Outra Casa) e os planos do Herdeiro, do Cortesão, do Colecionador e do Domador (12 de 20). Acertos no esqueleto: o Celeiro entra (0 → 125 em 1000), peso à quest que cobre passo por contestar, `NATUREZAS_DO_FIO` (bicho nunca em papel de gente), o primeiro nome que não se repete, o tipo de sítio. **Partilha média 4,66 → 2,35**; nenhuma quest em todas as campanhas.
- **o que fica:** doze efeitos do motor sem órgão no App (dia, relogio_regional, afeicao, marco, situacao, favor, quem_e, **morte**, passo_do_plano, fim_do_plano, desfecho_do_vilao, reacao_do_vilao) — a próxima volta; a pista da abertura aponta ao marco antigo num ato com quest; `rostoDe` e `devolverFocoA` por ligar; o companheiro inicial fora do núcleo do esqueleto; **o vilão-bicho** (549 de 1000) senta-se à mesa no Convite e no Velório — o próximo lote precisa de um rosto que seja demonstração; 18,8% dos mundos sem tenente gente.

---

## 08/11 · v9.623 · o esqueleto (BQ6), o lote 2 do acervo, e todo fim do vilão com desfecho
- **o lote 2 (`backend`, BQ8):** seis quests — A Mão Que Mudou de Lado, O Celeiro de Inverno, O Convite Sem Selo (o rosto: onde nasce o pacto), O Cimo da Escada (o confronto, com a fraqueza a abrir caminho sem luta), Os Dias Que Faltam e A Lâmina Enterrada (o coração) — e os planos do Credor, da Boticária, da Almiranta e do Profeta Queimado. Leitura em `mente/leitura-bq-lote-2.md`. Suíte da biblioteca 261, com a cobertura de cada ramo, falha e desfecho.
- **BQ6 (`backend`):** `src/esqueleto.js` — o vilão primeiro, depois a quest de cada ato pelo passo que contesta, a fraqueza como fio (quem a entrega e o confronto apontam para a mesma coisa), duas do coração, os papéis do mundo. Mil sementes: 1000 válidos; com as 9 de hoje duas campanhas partilham 4,66 quests; o catálogo sintético cai abaixo de 1 aos 42 (o alvo de 52 passa). Degradação provada: os atos sem quest caem no marco antigo.
- **o conserto (`backend`):** pela prova, «acabar»/«selar»/«poupar» davam desfecho `null`. Os quatro desfechos passam a ter `caminhos`; acabar e selar são derrota, poupar sem redenção é fuga, o pacto é a dívida cumprida. Catraca: nenhum fim do catálogo dá `null`. **Mudança de comportamento:** rendido e acabado passa de fuga a derrota.
- **o que fica:** a tabela §11.7 da planta desatualizada (pacto, derrota, fuga); para o acervo: o Celeiro nunca entra (contesta só o passo 4), falta uma quest «meio» contra os passos 3–4, os papéis de coisa sem `nome`, e os tenentes-bicho a ocupar papéis de gente; **BQ7 (a fiação, só em mundos novos)** — com a minha decisão: num mundo novo, a quest concluída é o peso do ato (a biblioteca substitui o sorteio, decisão da pessoa); os marcos antigos só nos atos sem quest.

---


## Os ciclos anteriores

Os 106 ciclos mais antigos estão em `mente/arquivo/diario-antigo.md`,
inteiros. Saíram daqui porque a mente lê este arquivo ao começar todo
ciclo, e o que ela precisa é do que aconteceu ontem — o resto é consulta.
