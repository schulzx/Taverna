# Taverna — a análise cruzada e o plano de lançamento

**15/11/2026 · sobre o produto de hoje: v9.647, HEAD `13364fc`.**

Feito pelo jogo vivo, não pela memória da casa: uma sessão de 41 respostas com a IA real
(26,5 min, US$ 0,355), um passeio por todas as telas em quatro tamanhos mais ~15 turnos com IA
real, e o código de HEAD medido. As provas estão em:

- `analise-jogo.md` — gameplay, enredo, o Mestre (525 linhas) · `sessao-de-hoje.md` — a transcrição
- `analise-visual.md` — experiência e visual (812 linhas) · `capturas/` — 36 capturas de hoje

Este documento não repete os dois relatórios: cruza-os, decide a ordem, e diz o que fazer.

**O que não foi visto hoje, e por isso não sustenta nada aqui:** derrota/cativeiro/morte, a sala a
dois, o fim da campanha, a reabertura de um save noutro dia, a fogueira, a cerimónia do espólio, a
subida de nível vista com calma. Os concorrentes não foram jogados nem pesquisados hoje — toda a
comparação com eles é hipótese até alguém os jogar (etapa L0.4).

---

## 1. O veredito, em uma tela

**Temos um motor que ninguém do género tem, dentro de uma casca que ainda não o mostra, com uma
chegada que perde o jogador antes de ele ver uma coisa ou outra.**

| | o que é forte de verdade (visto hoje) | o que desmente a promessa (visto hoje) |
|---|---|---|
| **O Mestre** | a IA não escreve estado: a compra sem dinheiro foi recusada pela tabela, o anel «vendido» pelo Narrador não entrou na bolsa | a prosa diz que apanhei o anel e ele ficou no chão; o Narrador inventa gente (Myrna, «o morto»); a própria pauta ainda manda inventar (`src/estante.js:140`) |
| **O dado** | nasce da frase em 276 ms, antes da IA, com o preço da falha dito; 6 perícias, todo sucesso com facto | 48 px e meio segundo; um 1 natural saiu como linha de registo; **três formas** de dado e uma quarta escondida (a busca da masmorra) |
| **A quest** | a encruzilhada de três cartas com ganho e custo é o melhor ecrã de decisão | a quest de monstro fecha **sem o monstro**; primeira escolha com peso só aos 9:47; primeira luta aos 13:50, e só procurando |
| **A luta** | legível, um toque anda e ataca, intenção do inimigo à vista | 2 rodadas e 0 de dano num lugar anunciado como «é onde se morre»; um disco branco tapa o tabuleiro; ~30 s entre «Lutar» e o tabuleiro |
| **A arte** | 258 retratos ao nível de indie comercial; a prosa no pergaminho (12:1); o encontro (8,5/10) | a criação esconde os retratos atrás de listas suspensas (4/10); 30 cenas pintadas que nenhum ecrã usa; a 1440, ~60 % da tela é feltro liso |
| **O telefone** | joga-se (8/10), sem rolagem lateral, alvos ≥ 44 px | o Códex não tem porta a 375 |
| **A chegada** | — | ecrã vazio até 1,8 MB de JS; link partilhado sem imagem; sem menu, sem pausa, Esc não faz nada |
| **A máquina** | determinismo real: 0 `Math.random`, replay em Node | a tela mostra o depurador: «207 de poder… 4.5×», «camada 0», «faltam 1 avanco», «3 Rato Gigantes» |

**As três frases que mandam no plano:**

1. **O nosso fosso é «o Mestre é código», e hoje ele parte-se à vista em dez minutos** (o anel). Sem
   consertar isso, a frase que nos distingue é desmentida pelo primeiro objeto.
2. **O melhor do jogo está depois do minuto 10, e o estranho decide antes do minuto 3.** Em 15 turnos
   de campanha nova não apareceu uma única cerimónia.
3. **O determinismo é a tecnologia que mais ninguém tem, e hoje não rende nada para quem joga.** É
   dele que sai o material do meteoro (secção 4).

---

## 2. Decisões que são só suas (bloqueiam o resto — responda primeiro)

| # | a decisão | o que eu recomendo | porque é sua |
|---|---|---|---|
| D1 | **A língua.** O sistema escreve em PT-PT («ficas a saber», «bónus») e o Narrador em PT-BR («você», «tá»), na mesma página. | **PT-BR em tudo** se o público é o Brasil. | voz do sistema em massa |
| D2 | **Quem paga o turno.** Hoje: grátis, 500 chamadas/dia por endereço, sem teto global. A sessão de hoje custou **US$ 0,355 por 41 respostas**. Mil jogadores a uma sessão por dia ≈ US$ 350–550/dia. | Beta por **convite com teto global diário** (o jogo fecha a porta com elegância quando o orçamento do dia acaba) + lista de espera. Preço só depois de medir retenção. | dinheiro e infra |
| D3 | **Telemetria.** Hoje é zero: no dia do lançamento não saberíamos quantos entraram nem onde desistiram. | Eventos anónimos mínimos (funil dos primeiros 10 min, erros) com aviso claro. | dados de jogador, infra |
| D4 | **O save.** Vive só no navegador; trocar de aparelho perde a campanha. | Para o beta: manter, e pôr «Guardar em arquivo» no menu novo. Conta só depois. | formato de save, infra |
| D5 | **A sala a dois.** Está no menu do beta e nunca foi provada a dois. | **Esconder a porta** agora (uma linha, reversível) e voltar com a mesa assíncrona (T5). | tira algo do menu |
| D6 | **O orçamento do meteoro.** Som (ambientes, tema), domínio próprio, créditos para as 9 texturas de chão e o elenco F3. | Domínio e som antes do beta aberto; arte por ordem de impressão. | dinheiro |
| D7 | **Streaming da narração** (hoje chega inteira aos 5–8 s). | Fazer — é a maior queda de espera percebida. | infra |

Tudo o resto abaixo cabe na liberdade das ordens de 23/09, 28/09 e 04/11 (um commit revertido
conserta) e anda sem esperar.

---

## 3. O plano de produto — seis ondas, cada uma com portão

A ordem é por **dano à primeira hora de um estranho**. Uma onda só fecha com a prova dela verde
**numa sessão jogada**, não só nas suítes. Tamanhos: S ≤ 1 ciclo · M 2–4 · G fase.
Os códigos J-P0-n e V-P0-n apontam para o item com o «como» inteiro em `analise-jogo.md` §8 e
`analise-visual.md` §10.

### Onda 1 — A verdade (o fosso deixa de ter buracos)

*Porque primeiro:* é a promessa do produto, e é o que um crítico testa no primeiro minuto.

| etapa | o quê | como | tam. · quem |
|---|---|---|---|
| 1.1 | **O objeto: prosa = bolsa** (J-P0-1) | «apanho/pego/guardo» + coisa do `[NO CHÃO]` vira o recolhimento que o botão já faz (`src/chao.js:183`); vender o que não está na bolsa é recusado antes do Narrador, como a compra sem dinheiro; veto em `naoPode` quando há coisa no chão | M · backend → oficial |
| 1.2 | **A pauta não pede invenção; gente inventada tem veto** (J-P0-2) | alargar `teste-pauta-nao-pede-coisa` a `estante.js`; `memoria-do-inventado.js` ganha a família «pessoa nomeada pela IA» | M · backend + testes |
| 1.3 | **Uma só lista de quem está aqui** (J-P0-5) | achar a causa do elenco que se cola (moradores a 19 km, à fogueira); função pura `quemEstaAqui(estado)` lida pelo chip, pela pauta e pela fogueira | M · backend → oficial |
| 1.4 | **O juiz de coerência, primeiro tijolo** (T3) | verificador determinístico pós-resposta: objetos, gente, quem está em cena; poda como `podarONarrador` | M · backend |
| 1.5 | **Distâncias e nomes** (J-P1-6, J-P1-7) | ida = volta; primeiro nome não repete; epíteto concorda com o género | S · backend |

**Portão:** corpus de 30 frases de apanhar/vender/dar 100 % resolvidas pelo sistema; numa sessão de
40 respostas, **0 divergências prosa × bolsa** e ≤ 1 pessoa inventada; chip da tela = pauta em 100 %.

### Onda 2 — A chegada (do link ao primeiro dado em 60 segundos)

| etapa | o quê | como | tam. · quem |
|---|---|---|---|
| 2.1 | **O link tem cara** (V-P0-3) | `og:title/description/image` 1200×630, favicon, `theme-color`, manifest | S · desenho → aprendiz |
| 2.2 | **Nada de ecrã vazio** (V-P0-1, V-P0-2) | splash inline no `index.html`; hero em WebP/AVIF (hoje PNG de 1,5 MB); `manualChunks` + `import()` para criação, batalha e painéis; Tailwind compilado no build em vez da CDN | M · aprendiz + oficial |
| 2.3 | **«Começar já» e a criação como mesa de retratos** (V-P0-7, J-P1-1) | um toque sorteia mundo e herói pela semente e mostra a carta pintada com «trocar» por campo; a escolha de raça/classe é uma grelha dos 240 retratos | G · desenho → aprendiz → oficial |
| 2.4 | **Os primeiros três minutos** (J-P0-6) | a abertura acaba com três propostas tocáveis (o passo da quest, uma pessoa em cena, um risco); a fraqueza do vilão não sai antes do ato 2; sem XP pela cidade natal; sem conquista no turno 0 | S×4 · backend → oficial |
| 2.5 | **Menu e pausa** (V-P0-6) | ⚙ no topo e Esc: som, tamanho do texto, rolagens, guardar em arquivo, sair | S · desenho → oficial |
| 2.6 | **Só o que está pronto na porta** (J-P0-7, D5) | a sala atrás de `modoNaPorta` | S · oficial |
| 2.7 | **O modal que prende a tela** (J-P0-8) | a fila de cerimónias cobre e prende o foco, ou não bloqueia; a cerimónia da quest aparece uma vez | S–M · oficial |

**Portão:** Lighthouse móvel — FCP < 1,5 s, LCP < 2,5 s, JS inicial < 600 KB gz (hoje 1,8 MB);
do link à primeira narração < 90 s e ≤ 4 toques (hoje 17 cliques); cartão com imagem no Discord e
no WhatsApp.

### Onda 3 — O dado (a assinatura do jogo)

| etapa | o quê | como | tam. · quem |
|---|---|---|---|
| 3.1 | **Uma forma só** (J-P0-4) | a carta social, o enigma e a busca da masmorra passam pelo chamado (`o-mestre-chama.js`); o «Refazer» também na bandeja | M · backend → desenho → oficial |
| 3.2 | **O dado é um momento** (V-P0-8) | no centro da mesa a 160 px, 1,2–1,6 s, tocar salta, cerimónia do 20 e do 1; a animação **cobre** a espera pelo Narrador em vez de a somar | M · desenho → aprendiz |
| 3.3 | **O d20 que se pode provar** (T1) | ver secção 4 | M–G |
| 3.4 | **O ritmo da régua** | hoje 1 dado a cada 3,25 frases; ligar as frases que pediam dado e não tiveram (falar com a pessoa da carta, força bruta, agressão) — J-P1-3, J-P1-8 | S+M · backend |

**Portão:** 100 % dos d20 fora da luta na bandeja; um dado a cada 2–3 frases numa sessão de 40;
um GIF de 20 natural que se queira partilhar.

### Onda 4 — O clímax e a mesa cheia (o jogo parece e age como jogo)

| etapa | o quê | como | tam. · quem |
|---|---|---|---|
| 4.1 | **Toda quest de criatura tem a criatura** (J-P0-3) | a etapa cujo objeto é hostil só fecha com ele em cena, pelo `o-encontro.js`; o rasto fecha no covil; auditar as 37 quests com «derrotou» | M–G · backend → oficial |
| 4.2 | **O perigo dito à porta é o da porta** (J-P1-2) | o veredito diz «à porta» e «ao fundo»; a primeira luta de uma masmorra difícil tem de morder | S–M · backend → aprendiz |
| 4.3 | **As 30 cenas pintadas entram** (V-P1-1) | a cena no topo da página no turno de chegada, recolhendo depois | S–M · desenho → oficial |
| 4.4 | **A mesa cheia a 1440** (V-P1-2) | o grupo em cartas grandes, a bandeja na mesa | M · desenho → aprendiz |
| 4.5 | **A tela deixa de mostrar o depurador** (J-P0-9, V-P0-5, V-P0-4) | varredor de texto de tela («de poder», «×», «camada», «⌖», «(+N)»); cedilha e plural; o disco branco depois de Mover | S–M · testes + backend + aprendiz |
| 4.6 | **A língua única** (D1) | varredor de PT-PT nos textos de tela e reescrita das tabelas | M · backend + desenho |
| 4.7 | **A luta abre já** (V-P1-8) e **a vitória é cerimónia** (V-P1-7) | tabuleiro primeiro, narração depois; XP a contar, espólio em cartas | M+M · oficial, aprendiz |
| 4.8 | **Streaming / a pena que escreve** (V-P1-9, D7) | revelação por frase; streaming real se D7 = sim | S–M |

**Portão:** em 1000 mundos, 100 % das quests de criatura com encontro antes da encruzilhada; numa
sessão nova de 20 turnos, **zero** textos de bastidor na tela; a 1440, ≥ 70 % da tela com conteúdo.

### Onda 5 — As pernas (porque volto amanhã)

| etapa | o quê | tam. |
|---|---|---|
| 5.1 | **O gancho de saída e o «da última vez»** — o fio mais quente ao sair, citado ao voltar | M |
| 5.2 | **O fim da campanha existe** — hoje é só uma instrução à IA (`src/historia.js:57`), sem tela nem estado | M |
| 5.3 | **A derrota, o cativeiro e a morte jogados ao vivo** — não foram vistos hoje; provar antes de lançar | S (prova) |
| 5.4 | **A reabertura de um save noutro dia**, provada | S (prova) |
| 5.5 | **As cerimónias que ninguém viu em 15 turnos** — garantir uma (espólio ou subida de nível) na primeira meia hora | S–M |
| 5.6 | **O tique «ou X ou Y?»** — 8 de 41 respostas | S |

**Portão:** uma campanha jogada do menu ao fim, em sessões de dias diferentes, sem buraco.

### Onda 6 — A infra do dia do meteoro

| etapa | o quê | tam. |
|---|---|---|
| 6.1 | **Teto global diário e porta de convites** (D2) — o orçamento do dia acaba e o jogo diz «a taverna está cheia, volte amanhã», nunca um erro | M |
| 6.2 | **Telemetria e registo de erros** (D3) — o funil dos primeiros 10 minutos, o `LimiteErro` reportado | S–M |
| 6.3 | **O custo por turno** — hoje US$ 0,0087/resposta; as ondas de `mente/custo-do-turno.md` e o preço do modelo base em 2027 **reconfirmados** antes de abrir | M |
| 6.4 | **Acessibilidade mínima** — `role="log"` na narração, piso de 12 px, tamanho de texto | S–M |
| 6.5 | **Domínio, página de entrada e termos** — uma página que mostra o jogo em 10 s (o GIF do dado, o cartão da sessão) | M |
| 6.6 | **Ensaio de carga** — 50 sessões simultâneas contra o teto, o Redis e os provedores | S |

---

## 4. Tecnologia só nossa — o que construir

Tudo sai de duas coisas que já temos e que um concorrente sobre LLM puro não copia num mês: **o
Mestre é código** (estado separado da prosa) e **a semente** (zero `Math.random`, replay em Node).

| # | a tecnologia | o que é | o que já existe | quando | custo |
|---|---|---|---|---|---|
| **T1** | **O dado que se pode provar** | um d20 em CSS 3D cujo voo sai da semente: mesmo link, mesmo lançamento, em qualquer máquina. Um 20 natural que se partilha e se repete exatamente | `FORMAS_DO_DADO`, `MOVIMENTO_DO_DADO`, a semente | Onda 3 | M–G, 0 KB de dependência |
| **T2** | **O cartão da sessão** | ao fechar a sessão, o jogo compõe uma imagem 1080×1350: a carta do herói, o lugar, os dados da noite, a melhor frase, a semente. O *Wrapped* do RPG — cada partilha é um anúncio com a nossa arte | retratos, cenas, o registo no save | antes do beta fechado | M, só cliente |
| **T3** | **O juiz de coerência** | um verificador determinístico que compara a prosa com o estado e poda o que diverge. A resposta direta ao defeito n.º 1 do género | `podarONarrador`, `memoria-do-inventado.js`, o registo de gente | Onda 1 (tijolo) → contínuo | M–G |
| **T4** | **A Semente da Semana** | todos jogam o mesmo mundo, o mesmo vilão, os mesmos dados de abertura — e comparam o que fizeram. Só é possível com determinismo. É o desafio diário de um roguelike aplicado a um RPG de mesa | a semente, a biblioteca de quests | beta aberto | S–M (sem servidor: a semente vai no link) |
| **T5** | **A mesa reproduzível** | um link que abre a campanha de outra pessoa turno a turno e deixa tomar o controlo em qualquer ponto: «vê como morri — tenta tu» | `sessao.js`, o save exportável | depois do lançamento | G; falta o replay correr no navegador |
| **T6** | **O replay da luta** | a luta reproduzida pela semente e exportada como vídeo de 15 s | o combate com semente, a grelha | depois do lançamento | G |
| **T7** | **A crónica ilustrada** | a campanha como livro: cena pintada por capítulo, retratos à margem, o dado que decidiu cada virada | `onExportarCronica`, 30 cenas, 258 retratos | Onda 5 (com o fim da campanha) | M |
| **T8** | **O cartucho** | a aventura como ficheiro aberto, validado pelas mesmas suítes da biblioteca; a comunidade escreve, o motor garante que se joga | `validarQuest`, os lotes do acervo | 2027 | M formato, G editor |
| **T9** | **A mesa assíncrona** | turnos por correio: cada um joga quando pode, o Mestre narra a jogada conjunta. Resolve o problema real do RPG — marcar a sessão | `api/sala.js` | 2027; substitui a sala síncrona | G, infra |
| **T10** | **O retrato que guarda a campanha** | cicatrizes e cabelo branco postos pelo que aconteceu, no sítio certo dos 240 rostos (`retratos-medidos.json`) | o contrato de enquadramento | depois do lançamento | M, campo de save aditivo |

**As três que entram antes de lançar: T1, T2 e T3.** T3 fecha o fosso; T1 e T2 são o material que
o público leva para fora. **T4 é a aposta do beta aberto** — é barata e é o que dá motivo para voltar
toda a semana e para falar do jogo.

---

## 5. O lançamento — passo a passo

### L0 · Preparar (em paralelo com as Ondas 1–3)

1. **Responder D1–D7** (secção 2).
2. **O nome e a frase.** Uma frase que só nós podemos dizer, tirada do fosso — a linha é *«o Mestre
   não inventa: cada dado, cada moeda e cada morte são verdade»*. Testá-la com cinco pessoas de fora.
3. **O quadro que vende.** Hoje é o encontro antes da luta (8,5/10). Depois da Onda 3, o dado no
   centro da mesa. Depois da Onda 4, a página com a cena pintada. Capturar os três em 16:9 e em 9:16.
4. **Jogar os concorrentes** (AI Dungeon, Friends & Fables, AI Realm, Hidden Door) uma hora cada, com
   as mesmas dez perguntas da nossa sessão. Não foi feito hoje; sem isto, «ninguém tem» é opinião.
5. **Domínio, página de entrada, lista de espera.**

### L1 · Beta fechado — 20 a 50 pessoas, por convite

**Entra quando:** portões das Ondas 1, 2 e 3 verdes; T2 no ar; 6.1 e 6.2 no ar.

- Quem: jogadores de mesa e de CRPG que não conhecem o projeto. Não amigos que perdoam.
- O que se mede (pela telemetria de 6.2, não por impressão):

| medida | alvo para avançar |
|---|---|
| chegam à primeira narração | ≥ 80 % de quem abre o link |
| passam do turno 10 | ≥ 60 % |
| voltam no dia seguinte | ≥ 30 % |
| divergências prosa × estado relatadas | < 1 por sessão |
| custo por sessão | dentro do teto de D2 |
| partilham o cartão da sessão | ≥ 15 % das sessões fechadas |

- Um canal só para relatos (Discord), com a semente e o turno em cada relato — o determinismo
  transforma cada queixa num replay.
- **Duas semanas, e duas subidas por semana.** O que não bater o alvo volta à onda dele.

### L2 · Beta aberto — a lista de espera entra em vagas

**Entra quando:** alvos de L1 batidos; portões das Ondas 4 e 5 verdes; 6.3–6.6 feitos.

- **A Semente da Semana (T4)** estreia aqui: um mundo, um vilão, todos os jogadores. É o assunto da
  semana no canal e o formato de conteúdo para criadores.
- Vagas diárias pelo teto global; a porta fechada com elegância também é marketing.
- Criadores de RPG e de CRPG em português, cinco a dez, com acesso antecipado e a semente da semana
  deles. O jogo tem de se ver bem em stream — o layout 16:9 (a «mesa para quem assiste») é um M de
  desenho e entra aqui.

### L3 · O meteoro — um dia, tudo de uma vez

**Entra quando:** retenção do dia seguinte ≥ 30 % mantida no beta aberto, e o custo por jogador
conhecido e coberto (preço ou teto).

1. **O trailer de 45 segundos**, sem narração de marketing: uma frase escrita → o Mestre chama o
   dado com o preço → o d20 voa → 20 natural → a página → a encruzilhada → a luta → o cartão da
   sessão. Fecha com o link «ver este dado» a reproduzir o mesmo 20.
2. **A demonstração que ninguém mais pode fazer:** duas máquinas, a mesma semente, o mesmo
   lançamento. É a prova do fosso em dez segundos.
3. **No mesmo dia:** as comunidades de RPG de mesa e de CRPG, os criadores de L2 com vídeos prontos,
   a semente do lançamento igual para todos, e um desafio com o nome do vilão dela.
4. **A semana seguinte é do jogo, não da campanha:** subidas diárias, o relato de cada defeito
   respondido com a versão que o consertou.

### O que pode adiar o lançamento, e deve

- Um portão de onda vermelho numa sessão jogada.
- Divergência prosa × estado acima de 1 por sessão no beta fechado.
- Custo por jogador sem teto ou sem cobertura.

---

## 6. A ordem dos próximos passos

1. Você responde **D1** (língua), **D2** (teto e convites) e **D5** (esconder a sala) — as três que
   mudam o trabalho da primeira semana.
2. Arranca a **Onda 1** (sistema: 1.1 → 1.2 → 1.3) e, em paralelo, a **Onda 2** pelo desenho
   (2.1 e 2.2 são fora do `App.jsx`; 2.5–2.7 precisam do bastão).
3. No fim de cada onda, uma sessão jogada contra o portão dela, com a transcrição guardada aqui.

Estimativa, pelo tamanho das etapas e não por promessa: Ondas 1–3 são cerca de 25 a 30 ciclos; o
beta fechado fica a **quatro a seis semanas** ao ritmo de duas mãos por dia; o meteoro, a **dez a
doze**. O número certo sai depois da primeira onda fechada.
