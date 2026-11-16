# A sessão de hoje — o jogo vivo, jogado como um estranho (15/11/2026)

> **Versão:** HEAD `13364fc`, `VERSAO = "v9.647"` (`src/constantes.js:22`), num dev-server próprio
> (`npx vite --port 5198`, que manda `/api` ao Vercel: IA real). Aba própria no navegador do painel,
> localStorage vazio antes de começar (nenhuma chave).
> **Quem jogou:** o `conselheiro`, como estranho: campanha nova desde o menu, sem ler o código antes.
> **Medição:** um gancho em `fetch` (hora, latência, corpo inteiro do pedido, resposta crua) e o save
> lido no fim. Os tempos «até» contam-se desde o clique em «Entrar na taverna».
> **A amostra:** **41 respostas do Narrador**, **US$ 0,355** (`custo` do save: 41 chamadas;
> gemini-3.8-flash 0,320 + deepseek-v4-pro, a reserva, 0,035), 26,5 min de jogo, 26 frases escritas,
> 28 toques (propostas, dados, escolhas, sala de masmorra), uma luta.
> **Herói:** Saoirse Voz-Grave (nome sorteado), mulher, Halfling, Ladina (Assassino), Ferreira,
> Filho da Guilda dos Dedos; DES +3 PER +2 PRE +1. Companheiro dado pelo sistema: Nolan o Silencioso
> (Caçador). Fantasia medieval · Terras abertas · Jornada do Herói · voz por omissão.
> **Antagonista eleito:** Fendrel, o Rei Sem Coroa (nível 14, visto na pauta).

---

## Números

| medida | valor |
|---|---|
| cliques do menu até ao jogo | **17** (+ dois campos de texto obrigatórios: nome da campanha e «conceito») |
| campos na criação | 2 passos; 7 géneros × 4 moldes × 4 arcos × 8 vozes × 2 apresentações; 10 raças × 12 classes × 12 profissões × 3 caminhos × 12 antecedentes; 6 pontos |
| primeira resposta do Mestre | 5,1 s depois de «Entrar» |
| **primeiro dado** | **1.ª frase** (~2 min depois de entrar): «O que é que eu sei sobre o que desce do morro?» → *Saberes. Precisa de 13.* |
| **primeira escolha com peso** | **9 min 47 s**, 13.ª ação: a encruzilhada da quest, três cartas com GANHAS/CUSTA |
| **primeira luta** | **13 min 50 s** (por escolha minha: fui à masmorra marcada DIFÍCIL) |
| quest de abertura (4 etapas) | **cumprida em ~10 min**, 13 ações, **sem luta** |
| d20 à vista fora da luta | **8** em 26 frases (1 a cada 3,25 frases), 6 perícias (Saberes ×2, Percepção ×2, Sobrevivência, Persuasão, Atletismo, «agulha»); +1 busca de masmorra rolada sem bandeja; +3 Navegação e 2 dados de tocha automáticos |
| latência do Narrador | mediana **5,1 s**, mín. 3,2 s, máx. 8,2 s |
| tamanho da resposta | mediana **94 palavras** |
| respostas que acabam em pergunta | 11 de 41; **8 acabam num «ou X ou Y?»** |
| pedido ao Narrador | **62.225 caracteres** no 2.º turno |
| XP / nível | nível 2 depois de ~12 ações (o +60 XP da cidade de partida incluído) |
| save no fim | 95 KB, 104 chaves |

---

## A transcrição, condensada (o que importa para a análise; citações literais entre aspas)

**T0 — a abertura (sistema + Narrador).** *«Monte Profundo cheira a esterco seco e ferro batido. […]
Ontem, o que desce do morro massacrou a criação de Nolan Olho-de-Corvo. As carcaças continuam
apodrecendo no Malho das Cinzas.»* Logo abaixo: *«Conquista desbloqueada: 🍻 Ombro Amigo»* (no turno
zero, sem ter feito nada). Nenhuma sugestão de ação à vista: o campo vazio «O que você faz?». O
companheiro chama-se **Nolan** o Silencioso e a vítima **Nolan** Olho-de-Corvo.

**T1 — «O que é que eu sei sobre o que desce do morro?»** → bandeja: *«Saberes. Precisa de 13. Se
falhar, esse caminho fecha-se e não volta.»* Sucesso. O Narrador: *«— Por Santa Efigênia das Cordas...
mataram a Myrna lá no Malho das Cinzas […] Arrancaram a menina de dentro da forja»*. **Myrna não existe
no sistema** (não está no pedido; só a criação de Nolan Olho-de-Corvo). Chip: *«+60 XP · uma terra
onde nunca tinhas posto o pé»* — **pela cidade onde a campanha começa**. No painel das pistas aparece,
ao minuto 2: *«o que o pode derrubar: os deuses nunca lhe falaram: a voz que ouviu era a de quem o
mandou queimar»* — a fraqueza do vilão.

**T2 — «Nolan, quem é a Myrna? E quem mais está aqui na praça?»** → *«Myrna era prima do moleiro»* (a
invenção ganha família). Cedric e Runa entram — vêm do sistema (`EM CENA … a quem não tem nome`).

**T3 — «Vamos ao Malho das Cinzas»** → proposta «Ir até o Malho das Cinzas · 5 min», **dois toques**
(abrir, depois «Ir · 5 min»). Etapa 1 ✓ ao chegar. *«+17 XP · uma conversa que ficou»* (foi uma
chegada). O sistema oferece **Percepção 13** com o preço da carta: *«Se falhar, ficas a saber na mesma.
Mas pode custar: as horas vão-se nisso ou sabes só a metade ou alguém vê-te.»* Sucesso: pegadas para a
Alfândega Cambaleante. Nolan fecha com dilema: *«Escolher um é largar o outro na lama»*.

**T4 — «Sigo as pegadas… com cuidado para não perder o rasto»** → **Sobrevivência 15** (*«Se falhar, a
trilha se perde e meia hora com ela»*). Rolou 19. O facto do sistema era genérico (*«o chão daqui é o de
quem o pisa todos os dias: Nolan Olho-de-Corvo, aprendiz»*); o Narrador fê-lo **acusação**: *«os passos
fundos na cinza batida pertencem a Nolan Olho-de-Corvo»*.

**T5 — «Vou à Alfândega Cambaleante»** → dois toques; **etapa 2 «Seguir o rasto até onde a besta
dorme» ✓ ao chegar à praça da alfândega**. Achado do sistema: Anel de Ouro (Destreza +1). Oferta
secundária de Isen. Cedric e Runa estão lá outra vez.

**T6 — pergunta a Isen** → na tela: *«"— Isen, quanto deves…" — Não. +8 cidade tem de tudo»* (o
modificador do oráculo à vista). O Narrador: *«meter a mão no ouro do morto»* (outro morto inventado).

**T7 — «Apanho o Anel de Ouro da tábua e guardo-o.»** → o Narrador: *«Seus dedos fecham sobre o Anel de
Ouro»*. **O sistema não o recolheu**: no pedido seguinte, *«[NO CHÃO — FATO DO SISTEMA] Ainda há coisa
caída perto de mim: ✦ Anel de Ouro»*; no save, inventário = gazua + sais.

**T8 — «Vou ao Sino do Vigia e compro um antídoto.»** → *«◉ Não chega: Antídoto custa ◉ 48, e a bolsa
tem ◉ 25.»* Certo, da tabela.

**T9 — «Levo o Anel de Ouro ao Martelo Torto e vendo-o.»** → o Narrador: *«a balança range sob o Anel de
Ouro, e as moedas caem na sua palma»* e ainda *«o frasco de óleo que você comprou mais cedo»*. **Bolsa:
25, igual.** O jogador acha que vendeu um anel que nunca apanhou.

**T10–T11 — Nesa da Foz.** O quadro (Pistas) diz que a carta que falta é *«uma pessoa»*: *«Falar com
Nesa da Foz · Persuasão · 5 min / Apertar… / Ler em Nesa… / Pagar… 10»*, com *«SE FALHAR: ficas a saber
na mesma. Mas pode custar…»*. Pergunto onde ela está: *«Nesa da Foz está aqui — O Arquivo da Colina»*
(diz «aqui» de um sítio a que ainda não fui). Chego: o Narrador põe-na *«a sumir para o fundo das
estantes»*; a pauta tem **EM CENA: Cedric · Runa** e não a Nesa. Oferta Percepção 13: falha
(*«o lugar fica remexido»*). O facto da carta (*«três crias… quem paga a coleira já mandou vir outra»*)
**foi ao Narrador como «É FACTO» e ele pô-lo na boca de Ceridwen**; a carta ficou por virar (1 de 2).

**T12 — «Falo com a Nesa da Foz: — O que sabe da besta…?»** → **nenhum dado**; *«Não sei de besta
nenhuma»*. **T13 — «Tento convencer a Nesa…»** → outra forma de dado: *«convencer Nesa da Foz —
dificuldade 16 (um favor que lhe custa pouco, desconhecido (+2)). Seu bônus: +4 ★ treinado.»*, *«Teste
de Persuasão · dif. 16»*, *«Não era isso»*, depois *«✧ Refazer · 1 ponto / Continuar →»*. Sucesso:
*«O sujeito da coleira atende por Fendrel.»* Etapa 3 ✓. Achado: +19 moedas.

**T14 — a encruzilhada (9 min 47 s).** *«UMA ESCOLHA · O QUE DESCE AO ANOITECER»*, três cartas, cada uma
com GANHAS e CUSTA (entregar à aldeia / levar viva de coleira à praça / soltar no alto do monte), e
*«Fá-lo à tua maneira: escreve o que fazes.»* É o melhor ecrã da sessão. Escolhi «levar viva». O
Narrador: *«a criatura arrasta a pança na terra e aceita a corda, manseta feito cão velho»*. **A besta
que massacrou a criação nunca apareceu, nunca houve luta.** *«★ O Que Desce ao Anoitecer — cumprida»*,
*«+125 XP · +37 moedas · Sais Aromáticos»*. Nova quest na mesma resposta (Perrine, «só há uma vaga»).

**T15 — «Quem está aqui na praça agora?»** → a cena de Perrine; a pauta: *EM CENA: Cedric · Runa*; o
chip da tela: *«Em cena: Perrine Olho-de-Corvo e Isen»*. Duas verdades para a mesma pergunta.

**T16 — «Partimos para a Paliçada de Sangue Velho.»** → *«● Paliçada de Sangue Velho — DIFÍCIL: acima de
você: sem plano, terreno ou ajuda, é onde se morre. (207 de poder (você 145 + 1 no grupo) contra 937 —
4.5× menos do que isto pede)»*. 19 km num turno; achado de 8 moedas. Isen, Cedric e Runa **estão lá**.

**T17 — «Bato o ombro com força no mourão podre»** → sem dado; cai *«um sino de ferro sem badalo […] que
tilinta sozinho»*. Foi pedido pela pauta: *«[A FORMA DESTA CENA — ESCOLHIDA PELO SISTEMA] Isto chega
como COISA […] um objeto que está onde não devia, e que fala sozinho.»* (`src/estante.js:140`).

**T18 — a masmorra.** «Entrar · ● Difícil» → 1 de 6 salas, tochas (5 → 4). O Narrador narra um golpe
da adaga num bandido antes de haver luta. Passagem → **a luta**: Bandido + Zumbi contra mim e Nolan;
intenções à vista (*«3–12 → Saoirse»*), **um toque no inimigo andou e atacou** (*«16 +7 = 23 contra 13
acerta»*), reação *«esquiva ágil · 0 PM — anula»*, «Bandido cai · poupado / matar». **2 rodadas, 0 de
dano em mim**, num lugar que a tela dizia ser «onde se morre»; a pauta do mesmo lugar dizia *«perigo
médio — Zumbi (nv 2), Bandido (nv 2)»*. Um círculo laranja e branco do tamanho da grelha tapou o
inimigo na 2.ª rodada.

**T19–T24 — o resto da masmorra.** «Procurar nesta sala» rola sozinho, sem bandeja (*«Percepção 15 vs
15. ENCONTREI: respiração contida… (emboscada)»*), e a emboscada nunca vira luta. «Subo pelas vigas» →
**Atletismo 15**, falha, *«d20 → 2 + 9 = 11 vs 13 · não resistiu / 3 de dano — 4 m de queda»*. Sala do
tesouro: +53 moedas e *«Élfico Mangual do Amanhecer»*; o portão do chefe lacrado. Enigma: *«Teste de
agulha · dif. 17»* (terceira forma de dado), falha com meia informação. Saio com 0 tochas.

**T25 — «montamos acampamento para dormir até de manhã»** → narrado, **não descansa**. O descanso vive
no botão da hora (*«Montar acampamento»*). Lá: *«⛺ dentro de Paliçada de Sangue Velho»* (estou fora);
Descanso longo *«custa uma noite inteira · 2 rações e 2 águas»* — veredito certo. 15:40 e *«A lenha
estala. Ninguém tem pressa de dormir.»* À fogueira: Nolan, **Isen e Ceridwen** (não são do grupo). Nolan
confessa: *«Fui eu, Voz-Grave. Naquela noite na serra, dei a ordem pra trancar a cancela.»* Rações 10 → 8.

**T26 — «O que é que eu sei de Fendrel?»** → Saberes 13, sucesso: **a mesma fraqueza pela terceira vez**
(*«a voz que juravam ser dos deuses […] era só o mandante da tocha»*).

**T27–T30 — Acampamento de Espinhos.** «DIFÍCIL… sem uma tocha: entram 91 contra 490 — 5.4×»; *«faltam
1 avanco»* (sem cedilha). Ao chegar, Eamon, Ondine e Perrine também lá estão. **«Forço a entrada»** e
**«Ataco com a adaga o guarda mais próximo»** → nenhuma luta, nenhum dado, nenhum aviso; o Narrador
desvia (*«Quem você quer que sangre primeiro…»*). **O botão «Partir» de volta não fez nada, três vezes,
sem mensagem nem erro na consola** — havia por baixo a cerimónia da quest e a subida de nível (dois
pontos de atributo) por fechar, invisíveis até eu abrir o Mapa. Fechadas, partiu: volta de **11,6 km /
0,5 dias** pela estrada que na ida tinha **28 km / 1 dia**. Achado: +15 moedas (o terceiro «moedas
numa vala»).

**T31 — «Vou ao Sino do Vigia e compro um antídoto.»** → *«Comprar Antídoto · ◉ 48»*, dois toques,
*«Antídoto — ◉ 48 (restam ◉ 150)»*. Perfeito.

---

## O que não joguei

Derrota/captura (não cheguei a 0 PV), morte, a sala a dois, o telemóvel, um clérigo, o modo «o Mestre
rola por mim», a reabertura de um save noutro dia. O dev-server foi parado no fim (`TaskStop`).
