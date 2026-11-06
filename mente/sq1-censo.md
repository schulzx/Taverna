# SQ1 · o censo — quem oferece trabalho numa campanha nova (05/11/2026)

A régua do antes da Fase SQ. Herói de nível 1, campanha nova (Uma Vida), sem
o primeiro passo da principal dado, **primeiros 20 turnos / 3 dias**. Medido
em Node, sem IA e sem navegador, sobre **24 mundos** (6 géneros × 4 moldes;
`gerarGeografia` + `estenderEspinha` + `abrirAbertura`, o molde de
`teste-companheiro-inicial.mjs`) e, para o que é sorte, **3.000 sementes**
(`rng(hashSemente(...))`). O roteiro está no scratchpad do backend (`censo.mjs`,
`desc.mjs`); onde a fonte só existe na fiação do App, o número é **estimativa**
pela regra lida no código, e está marcado.

**O único portão de hoje é o da MM13** (`muralLiberado`, `abertura.js`): o
primeiro passo da principal **ou** `MURAL.turnos` = 6 turnos. Medido: sem o
passo, o mural abre ao **7.º turno em 24 de 24 mundos**. Seis turnos parados
contam como "orientado".

| # | fonte | arquivo · função | quem a dispara | a trava de hoje | 3 dias, nível 1 |
|---|---|---|---|---|---|
| 1 | o mural do mundo | `App.jsx` `garantirMural` → `ofertas.js` `ofertasDaqui` | abrir o mural, chegar a cidade, descanso longo | MM13 | **2,92 cartazes** por renovação (0 mundos sem); 3 renovações ≈ **8,8** |
| 2 | o figurante que prega | `motor/depois-do-turno.js` `oferecerTrabalhoDaqui` | todo turno (App, depois da resposta) | MM13 · fora de luta/masmorra · 1 por dia · < 3 abertas | **3,0** (um por dia em 24/24 mundos), cada um com "📋 X tem um trabalho no mural" e o Mestre a encenar a abordagem |
| 3 | a proposta do Cronista | `motor/cronista-do-turno.js` (`missao_oferecida` → cartaz) | a leitura da prosa do Narrador | MM13 | **estimativa 0–2** (depende da IA) |
| 4 | a soleira | `App.jsx` `ofertasDaSoleira` (o papel `oferecido`) | toda cena | MM13 | os mesmos **3** do figurante, como cartão "Aceitar" (não soma) |
| 5 | a trama forçada | `motor/preludio-do-turno.js` `talvezDarUmaTrama` | todo turno | MM13 · MM14 (`tramaTemEspaco`: o primeiro passo) · fora do respiro | **0** sem o passo; **estimativa 0–1** logo depois dele |
| 6 | a missão da noite | `geradores.js` `processarDescansoLongoEventos` (`questNova`) → `App.jsx` `tarefaParaMissao` | descanso longo | < 2 secundárias | **1,16** missões ("📜 Fio de história") |
| 7 | o arco regional | o mesmo (`globalNovo`) → `missoes.js` `semearMissoes` (`mis_global`) | descanso longo | nenhum | **0,49** ("🌍 Evento global" + "O mundo te impôs uma missão") |
| 8 | a petição do correio | `correio.js` `processarDiaCorreio` (motor/prelúdio e `App.jsx` `avancarDiasReino`) | a virada do dia | facções/potências existirem | **0,46** com potências na região (o mapa novo não traz facções; elas vêm de `potenciasAqui`) |
| 9 | os contratos da casa | `guildas.js` `trabalhosDaCasa` (`App.jsx` `trabalhosDaMinhaCasa`) | abrir a casa | ser membro | **0** (3 por visita, só depois de entrar numa casa) |
| — | o pedido do coração | `subtramas.js` `avancarCoracao` ("conta com você") | a gente do núcleo em cena | as âncoras do papel | **≤ 1, estimativa** — não entra na soma: é a gente da própria história, um pedido por pessoa por campanha |
| — | o fio local | `geradores.js` (`localNovo`) | descanso longo | ≤ 3 | 1,66 — **não é oferta** (briga de taverna, feira: o dia a dia) |

**A soma, em 3 dias de nível 1, sem o primeiro passo:**

- **≈ 15 ofertas** de trabalho a passar pela tela (8,8 cartazes do mural + 3
  do figurante + ~1 do Cronista + 1,16 + 0,49 + 0,46 do sistema, mais ~0,5 de
  trama logo a seguir ao passo);
- delas, **≈ 6 interrupções na cena** — alguém vem ao herói ou o sistema
  escreve no registo (3 do figurante, 1,16 da noite, 0,49 do arco, 0,46 da
  petição, ~1 do Cronista) —, **todas antes de o herói ter tocado na
  história**, porque nenhuma delas pergunta pela espinha.

É esse o "toda hora aparecer alguém oferecendo trabalho". A meta de SQ5:
**zero** antes do portão.
