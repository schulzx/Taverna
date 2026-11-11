# A décima oitava sessão de prova — isto já é um jogo, e um Mestre à Matt Mercer? (10/11/2026)

> **Sobre o número:** o pedido chamou-lhe 13.ª, mas `mente/sessao-13.md` a `sessao-17.md` já existem (29/10 a 04/11), e esta é a primeira depois das fases BQ, TE, prosa tocável e CB. Fica como 18.ª para não apagar a 13.ª verdadeira. As comparações de custo são com a 12.ª (`mm11-sessao-12.md`), a última com a mesma régua de custo.

> **Campanha:** *Prova da Mesa XIII* · Uma Vida · Fantasia medieval · Terras abertas · Jornada do Herói · voz **Sombrio** · apresentação clássica.
> **Herói:** Torvald Brann — homem, **Goliath, Guerreiro (caminho Bárbaro), Ferreiro, Soldado Reformado** (Força +3, Vigor +2, Percepção +1); 22 PV. Companheira: Elowen (irmã, caçadora, 14 PV). Cidade: Alto Negro; a quest de abertura: *o que desce ao anoitecer* (algo do ermo ataca o burgo toda noite); a masmorra: a Agulha de Sal. Primeira sessão de Goliath, de Bárbaro, de Ferreiro e da voz Sombrio.
> **Jogada por:** o `jogo`, a 10/11 (23:42–00:13 UTC), sobre **`v9.635`** (conferida no bundle publicado, `index-DLrEsE_o.js`), no **jogo publicado**, no navegador do painel (painel oculto, 1280×720), campanha nova pela tela.
> **A amostra:** **33 respostas do Narrador** + 21 do Cronista + 1 Léxico = **55 chamadas a `/api/*`, todas HTTP 200.** 26 turnos fora da luta, 2 lutas (2 e 3 rodadas), 1 derrota com captura, 1 fuga de masmorra, 1 acampamento por menu com conversa à fogueira e descanso longo. Parei longe do teto (60 respostas / US$ 1,00) porque as perguntas da pessoa já tinham resposta e a campanha tinha chegado a um fim natural (fuga, noite, manhã).
> **Como se mediu:** um gancho em `fetch` na própria aba guardou, por chamada, hora, latência, `uso` inteiro, tamanhos, a narrativa **e o texto inteiro da última mensagem do pedido** (a pauta do turno, como a 12.ª pediu). **A ressalva:** o receptor local que gravaria tudo em disco foi bloqueado pelo painel (`ERR_BLOCKED_BY_CLIENT`), e a pauta inteira (15–25 mil caracteres por turno) ficou na memória da aba. Para o disco foi a tabela por chamada, com os **envelopes** de cada pauta; as citações da pauta que aparecem abaixo foram lidas da aba no próprio turno. **O `custo` do save (55 chamadas, US$ 0,36239) bate com a minha conta (0,3624) na quarta casa:** a conta é a de `src/custo.js`.
> **O localStorage:** antes, só `taverna_cfg_golpe_final=perguntar` e `taverna_cfg_rolagens=1`. No fim, com o jogo desmontado (aba recarregada, "Continuar aventura" no ecrã inicial), apaguei só `taverna_save_v1` e `taverna_save_v1_sessao`; as duas `taverna_cfg_*` ficaram iguais. Reconferi 4 s depois: o autosave não as trouxe de volta. Aba fechada.

---

## 1. O custo real

**Quem respondeu.** `gemini-3.8-flash` nas 33 respostas do Narrador e no Léxico (a reserva não entrou nenhuma vez); `gemini-3.5-flash-lite` nas 21 do Cronista.

| componente | US$ | % da sessão | por quê |
|---|---:|---:|---|
| Narrador: entrada **não cacheada** | 0,2007 | **55,4** | 267,6 mil tokens, **8.110 por turno**, a 0,75 |
| Narrador: **escritas** do cache (3: turnos i=3, 33 e 41) | 0,0367 | 10,1 | 48.974 tokens (13.298 · 19.514 · 16.162) |
| Narrador: leitura do cache | 0,0357 | 9,9 | 476 mil tokens a 0,075 |
| Narrador: saída | 0,0377 | 10,4 | 10.052 tokens; mediana **170 palavras** por resposta |
| Narrador: guarda do cache | 0,0029 | 0,8 | 5.587 tokens·hora |
| **Cronista** (21 chamadas) | 0,0267 | 7,4 | 0,0013 por chamada; **0,64 por turno** |
| **Léxico** (Gemini, sem reserva) | 0,0220 | 6,1 | 5.003 tokens de saída; **53 s** |
| **Total medido** | **0,3624** | 100 | **US$ 0,0110 por resposta do Narrador** (só o Narrador: 0,0095) |

**O cache:** 64% da entrada veio dele (igual à 12.ª). O prefixo cacheado fica parado (13.298 tokens do turno 2 ao 32) enquanto a entrada cresce de 18 mil para 27 mil: **a parte que cresce é a parte que se paga a preço cheio**. As duas reescritas (i=33 e i=41) vieram na masmorra, quando o prefixo mudou.

**As projeções** (R$ a 5,45 e +13% de impostos = × 6,16):

| cenário | US$/turno | **US$/sessão de 63** | R$/sessão | **US$/hora (35 turnos)** | R$/hora |
|---|---:|---:|---:|---:|---:|
| linear sobre o medido (com Léxico e abertura diluídos) | 0,0110 | **0,69** | 4,27 | 0,39 | 2,37 |
| a 12.ª, medida (v9.472) | 0,0105 | 0,66 | 4,08 | 0,37 | 2,27 |

**Custo estável contra a 12.ª (+5%), com respostas 20% mais longas (170 contra 142 palavras) e uma sessão com muito mais sistema dentro** (masmorra, duas lutas, acampamento). A latência piorou: **mediana 6,0 s** (a 12.ª: 4,6), máximo 12,5 s. O aviso continua de pé: **o 3.8 Flash dobra de preço a 01/01/2027** e esta sessão passa a ~US$ 1,3.

## 2. A régua dos dados (um dado a cada dois ou três turnos fora da luta)

**26 turnos fora da luta, 9 lançamentos: um a cada 2,9 turnos. A régua cumpre-se no número e falha no sentido.**

| turno | o dado | quem pediu | o que valeu |
|---|---|---|---|
| T2 | Percepção 19 vs 13, à vista | a oferta «Olhar à volta» | **sucesso vazio:** «AQUI NÃO HÁ NADA ESCONDIDO» |
| T6 | Percepção vs 13, à vista | a mesma oferta | **sucesso vazio**, no Largo do Cereal que a quest manda «descobrir o que esconde» |
| T11 | Percepção vs 13, à vista | a mesma oferta | **falha com preço** (o cemitério fica remexido): o único dado com consequência |
| T12 | Navegação d20+1 = 5 vs 5 | automático na viagem | só texto, CD 5 |
| T14 | Navegação d20+1 = 13 vs 5 | automático | só texto, CD 5 |
| T15 | Percepção vs 13, à vista | a mesma oferta | **sucesso vazio** (3.º) |
| T18 | Percepção 8, «procurar nesta sala» | o botão da masmorra | **não apareceu bandeja**: o número só existe na pauta |
| T22 | dado de vida d12: 5 + 3 = 8 | eu, no acampamento | à vista e bom: PV 1 → 9 |
| T25 | mantimentos 6 · 3, precisa de 2 | o descanso longo | à vista; os dados de uso a funcionar |

**O que conta mais do que a razão:** a oferta «Olhar à volta · Percepção · precisa de 13» apareceu **quatro vezes, igual, depois de cada deslocação**, e deu sucesso vazio três vezes. **Nos cinco momentos da ficção que pediam um dado, não houve nenhum:** examinar o corte na carcaça (Investigação), seguir o rastro (Sobrevivência: o oráculo decidiu antes que não havia rastro), lembrar o que se sabe do lugar (Saberes), estancar a irmã caída (Medicina), arrebentar as amarras no cativeiro (Atletismo). **O jogador aprende em dez minutos que o dado é ritual e a ficção é de graça.** É o contrário do que a ordem de 04/11 pede: *"sentimento de que você está arriscando algo"*.

## 3. A régua Matt Mercer (a resposta sai do sistema ou da imaginação?)

| pergunta | resposta | veredito |
|---|---|---|
| «Quem manda em Alto Negro?» (T3) | o pedido virou **pergunta de sim/não ao oráculo** (58%, rolou 69: «NÃO, MAS…»); Drogo: *«Ninguém manda no que a maré e o morro cospem»* | **plausível e evasiva.** O sistema só tem «burgomestres» genéricos; ninguém com nome |
| «Alguém paga por acabar com isto?» (T3) | *«Ninguém vai botar moeda na sua mão»* | verdade do oráculo, não da quest |
| «O que sei de Alto Negro, da Agulha, de bichos assim?» (T4) | *«corte limpo em carneiro não é hábito de fera comum»* | **vazio.** Sem teste de Saberes, sem facto |
| «Quanto custa a noite e a refeição?» (T9) | *«No Barril Rachado… seis pratas… quarto bom quinze… três a cinco»* | **verdade:** a faixa é a da tabela e o Barril Rachado está no registo |
| «Onde isso dorme de dia?» (T8, a Milo) | *«vá perguntar no Repouso das Cruzes Podres»* | **verdade:** é o passo seguinte da quest |
| «Quem era esse Klaus?» (T13) | *«vendia arreios podres para a intendência»* | plausível (o ofício é do registo; a história, não) |
| o mapa: «quem anda lá?» | *«Afogados do brejos e bruxas da primeiras raizes»* | **verdade, e cumprida:** na masmorra estavam exatamente bruxas e um afogado |
| o mapa: «o preço» | «perigo médio» … e, **depois** de partir, «DIFÍCIL: 5,1× menos do que isto pede» | **duas verdades que se contradizem** |

**4 verdades, 1 oráculo, 3 plausíveis ou vazias.** As verdades estão onde há tabela (preço, mapa, passo da quest). As falhas estão onde a pergunta é aberta («quem», «o que sei»): a escuta transforma-a em sim/não ou não a ouve.

## 4. O que cada fase nova fez na tela

**BQ (a biblioteca de quests e o vilão).** **A abertura saiu da biblioteca e é boa:** uma ameaça concreta que ataca toda noite, um lugar a duas esquinas com o sangue fresco, um nome (Milo), um gancho secundário (a luz na Agulha de Sal). Os passos existem e andam (*Ver o que ficou em Largo do Cereal → Seguir o rasto até onde a besta dorme → Pôr o que desce ao anoitecer ao alcance da tua mão*), com a ✓ visível ao cumprir. **O vilão é fio e não nome:** a pauta traz *«A MÃO DELE AQUI: as sentinelas da fronteira contam fogueiras do outro lado que ninguém do outro lado acendeu»* e o veto do nome. **Mas o veto virou o maior tique da sessão** (defeito 5) e **a quest perde para os outros subsistemas** (defeitos 1 e 2).

**TE (a temperatura e os espólios).** O espólio aparece e cheira a quest: *«Silencioso Espada Longa — de O Que Desce ao Anoitecer · +2 de dano — uma lâmina enterrada com o dono»*, no cemitério, como prémio do passo. A primeira vitória deu **+71 moedas, +132 XP, +8 essência** e um *«Consagrado Dente de Besta Engastado do Rei Decaído — Amuleto · épico»*. **A sensação de ficar mais forte não chega:** a espada achada é pior do que a que o herói já traz equipada, o épico *«pede sintonia: o poder dorme»*, e a derrota levou as 86 moedas. Três recompensas, nenhuma que mude o golpe seguinte.

**A prosa tocável.** Funciona e poupa escrita: os nomes da prosa são botões; tocar em **Drogo** pôs «Drogo · AGIR» e *«Falo com Drogo»* na caixa (um toque em vez de uma frase). Senti falta de tocar em quem **falou** (Gretel Val-Profundo, no T2, não era tocável) e o rótulo do papel cola-se à prosa (*«…ganho de patente.mercador(a)terceira da companhia — outra camarada daquela guerra»*).

**CB (o encontro e o combate, lotes 1–3).**
- **O encontro na estrada não aconteceu:** dois trechos (um *tranquilo*, um *viajante* social). Não vi o sinal nem a escolha com veredito.
- **A abertura da luta:** a mesa abriu primeiro e a frase do Narrador chegou ~4 s depois, já dentro dela (*«A criatura fecha o espaço com os braços erguidos para despedaçar.»*). A ordem certa, sem o defeito do dragão.
- **A previsão do golpe é a melhor peça da sessão:** *«O TEU GOLPE → BRUXA · acertas com 5 ou mais no dado · o 20 é crítico»*, com a régua 1–20 desenhada, e depois *«d20 12+8=20 vs 13 · acerta, 12 de dano»*. Isto é jogo.
- **A intenção deles** está lá (*«Bruxa da Primeira Raiz · 14–34 → Elowen · 91%»*), mas **o «14–34» não se lê:** os golpes reais foram 16, 17, 3 e 8. Ninguém sabe se é dano, alcance ou outra coisa.
- **O turno deles** aparece em lista (*«A RODADA 1 · Bruxa → Elowen 16 de dano · Bruxa → Elowen 17 de dano»*). O meu golpe não entra na lista. Não pude julgar a animação passo a passo com o painel oculto.
- **A reação «aparar · corta metade»** é um bom momento de decisão.
- **Lote 3:** não houve altura nas duas salas (o «+2 do alto» não apareceu). O chão e os objetos aparecem no pairar (*«caixote · arde: em 1 casa, deixa fogo»*). **O Empurrar tem previsão (*«Empurrar · 86% · 1 casa»*) e não funciona pela tela** (defeito 3).
- **A luta do nível 1 dura mais do que um golpe?** Dura, e mata. 1.ª luta: 2 rodadas, Elowen abatida na 1.ª (14 PV contra 33 de dano). 2.ª luta: 3 rodadas, o herói cai e é **capturado** (*«acordo com 1 PV, de mãos atadas»*). **A captura é o melhor momento narrativo da sessão:** falhar para a frente, como o Matt faz.

## 5. Os defeitos, por gravidade

### Graves (mudam o que o jogador vive)

1. **O único dado que o Mestre oferece fora da luta é vazio.** A oferta «Olhar à volta · Percepção 13» saiu 4 vezes e deu sucesso vazio 3 vezes (T2, T6, T15), sempre com o envelope *«[BUSCA CONCLUÍDA] … AQUI NÃO HÁ NADA ESCONDIDO … NÃO invente um achado»*. No T6 isso aconteceu **no Largo do Cereal, quando o passo ativo da quest era «descobrir o que Largo do Cereal esconde»**. *Hipótese:* a oferta aparece depois de cada deslocação sem perguntar se o lugar tem segredo, e o passo «descobrir o que X esconde» não planta nada em X.
2. **O oráculo desmente a quest.** No T7 o passo era *«Seguir o rasto até onde a besta dorme»*; o sistema perguntou-se a si mesmo *«há rastro para seguir em Largo do Cereal?» (25%, rolou 84) → NÃO… não plante uma pegada de consolo*. **Não houve dado de Sobrevivência:** *«não se rola contra o que não existe»*. Duas respostas depois, a Elowen diz que *«o rastro ainda marca a terra úmida»*, e mais tarde o passo fica ✓ sem rastro nenhum. *Hipótese:* o «MUNDO RESPONDE — perguntado pelo próprio sistema» não consulta os factos do passo ativo.
3. **O Empurrar (lote 3) não se joga pela tela.** (a) Com o verbo armado, tocar na criatura na grelha **cancela o verbo sem aviso** (três tentativas, com eventos sintéticos e com clique real). (b) Pelo botão do alvo e «Agir →», o empurrão **virou um ataque normal** (*«d20 12+8=20 vs 13 · acerta, 12 de dano»*) e esse golpe **não chegou à pauta do Narrador** (i=36). (c) Na terceira tentativa, o botão do alvo escreveu *«Empurro com força »* na caixa, o meu complemento saiu baralhado (*«…ogado contra a paredeo com força»*), **o sistema não resolveu empurrão nenhum** e o Narrador inventou-o (*«empurra o Afogado do Brejo contra os blocos do portal»*), com o Afogado parado na mesma casa.
4. **Depois da captura, o sistema deixa de arbitrar.** *«forço os pulsos contra as raízes… para arrebentá-las»* foi lido como pedido de rolagem: *«[SEM TESTE] Eu pedi uma rolagem, e rolagem não se pede»*. *Hipótese:* «força» foi lido como «teste de Força». Na frase seguinte, sem dado, o Narrador soltou-me, deu-me **uma chave que o sistema não tem** (a tela continua a dizer *«portão lacrado — falta a chave»*) e tirou-me da sala, com a pauta sem envelope nenhum (i=45). A tela da masmorra ignorou o cativeiro (com «sair» à mão), e o acampamento seguinte diz *«⛺ dentro de Agulha de Sal»* quando já estávamos fora.
5. **O epíteto do vilão virou o nome do herói.** O veto *«que ele ou quem o serve diga o meu nome: … chama-me «o forasteiro de Alto Negro»»* vai em todas as pautas, e o modelo pô-lo na boca de **toda a gente**: Drogo, Maren, Milo, Cael, Klaus, Birgit, um caçador de passagem, o próprio Narrador em terceira pessoa no meio da luta (*«o forasteiro de Alto Negro arranca sangue espesso»*) e **a irmã, duas vezes** (*«Fala para o forasteiro de Alto Negro o que a patrulha finge que não vê»*). Contei-o em pelo menos 14 das 33 respostas. Para piorar, o herói está **em** Alto Negro. É o tique do nome da 12.ª (o defeito 4 dela) com outra roupa, e **queima o fio do vilão**: o que devia arrepiar quando *ele* o dissesse já é ruído.
6. **A luta mata sem veredito.** O mapa disse *«perigo médio»* antes de partir; o *«DIFÍCIL… 5,1× menos do que isto pede»* só apareceu **depois** do clique em Partir, e o chip «Entrar» na masmorra não tinha veredito nenhum. A Bruxa «nv 1» deu 16 + 17 na 1.ª rodada (Elowen, 14 PV, abatida) e **o segundo feitiço foi num corpo que já tinha caído**. É a lei *o veredito antes do clique*, falhada no clique que mais custa.

### Médios

7. **Os números não batem entre a tela, a pauta e a narração.** O golpe da Elowen (8) não chegou ao Narrador (HUD 10/29 contra pauta 18/29). No aparar, a pauta diz *«levei 7 em vez de 15»* e o HUD diz *«3 de dano»* (PV 22 → 19). Houve ainda uma *«CORREÇÃO DE COESÃO — MORTE INDEVIDA»*: o Narrador tinha matado uma bruxa que estava viva.
8. **Socorrer a irmã a 0 PV não tem regra.** Não houve teste de Medicina nem testes de morte à vista (o do herói existe na pauta: *«rolando testes de morte (1 sucesso, 0 falhas)»*, e nunca apareceu na tela). O Narrador decidiu sozinho que *«o sangue para de escorrer»* e acrescentou febre e costelas quebradas.
9. **O elenco cola-se ao herói.** Cael, Maren e Anelise (ferreira) seguiram-me do Largo para o cemitério, a estrada e a torre (*«a bigorna fria da oficina»* no meio da mata); Milo, Birgit e Klaus aparecem em três sítios cada um; o «Em cena» do topo fica velho depois de uma deslocação.
10. **As formas de cena entram fora do lugar.** Um torneio (*«a liça de outono»*, na primavera) num cemitério, e a seguir *«APERTA — as apostas começam»* com o herói à fogueira na floresta; um velho com um cão cego a passar *dentro* da masmorra durante o cativeiro; meirinhos a partir os dedos de um ladrão ao pé de uma torre em ruína, de noite.
11. **As perguntas abertas não têm resposta.** «Quem manda?» vira sim/não do oráculo; «o que sei?» não pede teste de Saberes.
12. **Duas falhas de verdade sobre o acampamento:** *«acampamos aqui até de manhã»*, escrito, não foi ouvido como descanso; pelo menu («Montar acampamento») funciona muito bem.

### Leves

13. **Nomes e concordância:** *«Silencioso Espada Longa»*; *«Consagrado Dente de Besta Engastado do Rei Decaído»* (a cadeia de afixos); *«Afogados do brejos e bruxas da primeiras raizes»*; *«Eu me desloquei de no vão da porta para no corredor»*; dois Milos (*«a carneira de Milo Braço-de-Ferro, não a minha»*, diz o Milo); Dagmar Braço-de-Ferro (o sobrenome repete-se).
14. **Falsos alarmes da escuta:** *«DESTINO NÃO RECONHECIDO»* para «sigo para a torre»; uma *«CORREÇÃO DO SISTEMA — CÂNONE»* que cita lixo (*«você o chamou de "deita elowen na terra batida sob a copa gotej"»*).
15. **A tela diz uma coisa e a prosa outra:** três passagens na tela, «duas» na prosa; o espólio do cemitério só existe na tela até ao turno seguinte; a Birgit vira «a taverneira».
16. **O Léxico ainda leva 53 s** (agora sem cair na reserva). A ficha do herói esconde quase tudo, não tudo.

## 6. O veredito: isto já é um jogo?

**Dentro da luta e à fogueira, já é. Fora delas ainda é um sistema interativo muito bem escrito.**

**O que prende:**
- a previsão do golpe com a régua do d20, e a reação *aparar · corta metade*;
- a derrota que vira captura em vez de ecrã de morte;
- o acampamento com a pergunta *«Com quem você se senta esta noite?»* e os dados de uso à vista;
- a abertura que põe sangue fresco a duas esquinas;
- o mapa que diz *«quem anda lá»* e cumpre;
- os preços que saem da tabela.

**O que ainda é formulário:**
- os dados fora da luta são ritual: quatro vezes a mesma oferta, três sucessos vazios;
- os momentos que pediam dado passam sem ele;
- a quest, o oráculo e a busca dizem coisas diferentes do mesmo chão;
- quando o sistema se cala (no cativeiro), o Narrador dá tudo de graça;
- todos chamam o herói pelo nome que só o vilão devia usar.

**Um Mestre à Matt Mercer?** Ainda não. O Matt teria pedido Investigação na carcaça, Sobrevivência no rastro, Medicina na irmã e Atletismo nas amarras. **Esta mesa pediu Percepção quatro vezes, sempre a mesma**, e a única pergunta aberta que respondeu com verdade foi a do preço.

**As três coisas que mais mudariam a sessão:**
1. **O dado nasce da frase, não da deslocação.** «Examino / sigo o rastro / estanco / arrebento / lembro» têm de chegar à bandeja com perícia, número a bater e preço de falhar. A oferta «Olhar à volta» só aparece quando o lugar tem alguma coisa, e o sucesso dá sempre um facto (o livro de factos da BQ existe para isso).
2. **Uma verdade só: a quest manda nos outros.** O oráculo, a busca e o «não há rastro» consultam o passo ativo; «descobrir o que X esconde» planta o segredo em X; o epíteto do vilão sai da linha NÃO PODE e entra só no turno em que *ele* está em cena.
3. **A luta honesta até ao fim.** O 5,1× aparece **antes** do Partir e no chip Entrar; o Empurrar dispara ao tocar no alvo e chega à pauta; o cativeiro é estado do sistema (com dado para sair), e não uma página em branco para o Narrador.

**A proposta ambiciosa (para a pessoa decidir):** ***«O Mestre chama o dado.»*** A seguir à frase do jogador, antes da narração, a mesa responde com um compasso curto: *«Sobrevivência. Precisa de 14. Se falhar, a chuva apaga o rasto.»* O d20 fica pousado na bandeja à espera de um toque, com saída para quem tem pressa. A regra é a que já existe (o catálogo julga a frase, o envelope cobra o preço); muda o **momento**: o dado deixa de ser um botão que aparece depois de andar e passa a ser a pergunta do Mestre à ficção do jogador. É o gesto que define o Matt, e é o que esta sessão mais sentiu a falta. Pesa porque muda o compasso de todos os turnos fora da luta.

## 7. Onde olhar

- Tabela por chamada (com os envelopes de cada pauta): `C:\Users\clara\AppData\Local\Temp\claude\d5096f640d890ce8\953734d9-f48f-4ab6-9fdf-7529c9232286\scratchpad\s13\registo-s13-parte1.csv` e `…\s13\registo-s13-parte2.csv`; as notas de progresso em `…\s13\notas.md`; o localStorage de antes em `…\s13\localStorage-antes.json`.
- Os turnos dos defeitos, pelo índice `i` da tabela: busca vazia i=3, 8 e 22; o oráculo contra a quest i=9; o Empurrar i=36 e 38; o cativeiro i=42, 43 e 45; os números da luta i=28 e 36; o acampamento i=51 e 54.
- A 12.ª: `mente/mm11-sessao-12.md` (a régua de custo e o tique do nome, o defeito 4).
