# A vigésima sessão de prova — nada entra pela IA, e o que a mesa ainda pede que ela invente (13/11/2026)

> **A régua:** é a NE9 da Fase NE (*nada entra pela IA*, `mente/plano-nada-entra.md`). O método e o formato são os da 19.ª (`mente/sessao-19.md`), e as comparações de custo são com ela.

> **Campanha:** *Prova da Mesa XX* · Uma Vida · Fantasia medieval · Terras abertas · **Arquipélago** · voz **Fábula** · apresentação Clássica.
> **Herói:** Bromar Pedra-Funda, homem, **Anão, Clérigo (caminho Inquisidor), Cartógrafo, Acólito Fugitivo** (Presença +3, Percepção +2, Força +1); 16 PV, 14 PM, Lança e Brigantina. Companheira: Fenna da Urze (ex-carpideira, Ladina, 12 PV). Cidade: Monte do Martelo (capital, 54 mil almas). Quest de abertura (da biblioteca): *O Pão Que Sai de Noite* — falta pão em casa de Brigid, e a pequena Helga sai pela janela com ele. Fio da abertura: o que o Arquivo Dourado guarda, com Varek Sem-Medo, arquivista. Primeira sessão com Anão, Clérigo, Inquisidor, Cartógrafo, Acólito Fugitivo, o arco Arquipélago e a voz Fábula.
> **Jogada por:** o `jogo`, a 13/11 (22:10–22:35 UTC), sobre **`v9.643`** (conferida no bundle publicado, `index-Cs3v8Ufr.js`), no **jogo publicado**, no navegador do painel, com campanha nova criada pela tela.
> **A amostra:** **47 respostas do Narrador, 0 do Cronista, 0 do Léxico: 47 chamadas a `/api/*`, todas a `/api/narrador`, todas HTTP 200**, nenhuma tentativa perdida. 38 turnos de pauta (≈ 35 fora da luta), 2 lutas (2 Capangas na estrada; o Bandido guardião da chave), 1 viagem de um dia com encontro, 1 noite na estalagem com conversa à lareira, 2 das 7 salas de uma masmorra. Parei a 47 respostas e US$ 0,40, longe do teto (60 ou US$ 1,00), porque as seis perguntas já tinham resposta e as últimas cinco jogadas só repetiam padrões.
> **Como se mediu:** o gancho em `fetch` da 19.ª, na própria aba: por chamada, a hora, a latência, a `tarefa` do corpo (`narrador`/`cronista`/`lexico`), o `uso` inteiro e o texto inteiro da última mensagem (a pauta do turno). As citações de pauta foram lidas da aba no próprio turno. **O `custo` do save (47 chamadas, US$ 0,39723) bate com a soma do gancho ao token** (entrada 1.026.468, cache 649.548, escrita 43.675, saída 8.234).
> **O localStorage:** antes, só `taverna_cfg_golpe_final=perguntar` e `taverna_cfg_rolagens=1`. No fim recarreguei a aba para desmontar o jogo (ficou no ecrã inicial, com «Continuar aventura»), apaguei só `taverna_save_v1` e `taverna_save_v1_sessao` e reconferi 4 s depois: restam as duas `taverna_cfg_*`, com os mesmos valores. Fechei a aba.

---

## 1. O custo real

**Quem respondeu:** `gemini-3.8-flash` nas 47 (a reserva nunca entrou). **Cronista: 0 chamadas** (eram 30 na 19.ª). **Léxico: 0** (era 1, de 55,9 s): o mundo nasceu com vocabulário e lei («Todo juramento feito diante de testemunhas obriga quem o fez…») sem chamada nenhuma.

| componente | US$ | % da sessão | porquê |
|---|---:|---:|---|
| Narrador: entrada **não cacheada** | 0,2827 | **71,2** | 376,9 mil tokens, **8.020 por turno**, a 0,75 |
| Narrador: **escritas** do cache (3: i=1, 25 e 37) | 0,0328 | 8,3 | 43.675 tokens (13.002 · 15.385 · 15.288) |
| Narrador: leitura do cache | 0,0454 | 11,4 | 605,9 mil tokens a 0,075 |
| Narrador: saída | 0,0309 | 7,8 | 8.234 tokens; mediana de **101 palavras** por resposta fora da luta |
| Narrador: guarda do cache | 0,0054 | 1,4 | o resto da conta do save |
| **Cronista / Léxico** | 0 | 0 | não foram chamados |
| **Total medido** | **0,3972** | 100 | **US$ 0,0085 por resposta** |

**23% mais barato por resposta que a 19.ª** (0,0110 → 0,0085). A troca vem de três lados: o Cronista e o Léxico saíram (eram 12,9% da 19.ª), a saída encolheu (mediana de 168 para 101 palavras: a EM2 funciona) e a entrada não cacheada por turno desceu um pouco (8.310 → 8.020). Contando só o Narrador, a 19.ª custava 0,0096 por resposta e esta 0,0085 (−12%). O cache cobriu 63% da entrada, como sempre.

**A latência melhorou muito:** mediana de **4,6 s** (a 19.ª teve 7,1), máximo de **10,5 s** e nenhum turno acima de 15 s (a 19.ª teve três).

**A projeção** (R$ a 5,45 com 13% de impostos, × 6,16): **US$ 0,53 por sessão de 63 turnos (R$ 3,28)**, contra US$ 0,69 da 19.ª. O aviso continua: o 3.8 Flash dobra de preço a 01/01/2027.

## 2. A régua dos dados (um dado a cada dois ou três turnos fora da luta)

**A régua caiu.** Em ≈ 35 turnos fora da luta houve **6 d20 pedidos à mesa (um a cada 5,8 turnos)**; com as 2 navegações automáticas, 8 (um a cada 4,4). Só **2 nasceram da frase do jogador**.

| | 19.ª | **20.ª** |
|---|---:|---:|
| d20 fora da luta pedidos à mesa | 17 em 34 (1/2,0) | **6 em ≈ 35 (1/5,8)** |
| dados nascidos da frase do jogador | 14 (41%) | **2 (6%)**: T2 e T30 |
| perícias diferentes | 8 | **2**: Percepção 5, Prestidigitação 1 (mais Navegação 2, automática) |
| de onde vieram os outros 4 | — | a oferta da abertura (T1), a oferta do encontro na estrada, a oferta à boca da masmorra (T34) e o botão «Procurar nesta sala» |
| sucessos | 10 (3 com facto) | **1, e com facto**: T1, *«o que corre na rua: Muralha Quebrada de Prata Podre, contam que o dono ainda está lá, esperando»* |

**O que melhorou:** bater carteira tem dado (T2, *«Passo rente ao Wystan… e tento aliviar a bolsa dele»* → *«Prestidigitação. Precisa de 15. Se falhar, a mão é vista onde não devia tocar.»*); procurar armadilha tem dado (T30, Percepção 13); o único sucesso trouxe facto do sistema e o envelope novo diz o que o sucesso **não** dá (*«não crie objeto, chave ou artefato novo»*).

**Frases que pediam dado e não o tiveram (as exatas):**
- T3 · *«tateio o cascalho e a lama em volta… Pego o que achar»*: nenhum envelope (o Narrador, honesto, deu *«apenas cascalho pontudo»*).
- T5 e T6 · persuadir Brigid à porta (*«Deixa-me ajudar a menina»*): o Narrador decidiu sozinho que ela bate a porta.
- T9 · *«examino o sinete contra a luz. Conheço este selo?»*: nenhum envelope, e a resposta veio da imaginação.
- T12 · *«vou até à estante do fundo… Vasculho por trás das prateleiras e debaixo das lajes soltas»*: deu **DESTINO NÃO RECONHECIDO**, e a busca perdeu-se.
- T13 · *«procuro com cuidado, laje por laje e prateleira por prateleira, qualquer papel ou objeto escondido nesta sala»*: **nenhum envelope**, sem dado e sem «já procuraste». Na 19.ª, procurar dava sempre Percepção.
- T14 · rezar pedindo um sinal: nada (secção 4).
- T24 · ameaçar o capanga caído com a lança no peito: virou oráculo, sem Intimidação.
- T38 · *«O que é que eu sei desta Muralha Quebrada de Prata Podre?»*: **sem Saberes** (a 19.ª dava Saberes, com o objeto errado; agora nem isso).

**Dado com forma diferente:** «Procurar nesta sala» rola sozinho (*«Busca: d20=4+2=6»*), sem bandeja, sem «precisa de», sem aviso — a mesma ação tem outra cara na masmorra (defeito 8 da 19.ª, de pé).

## 3. A régua Matt Mercer (a resposta sai do sistema ou da imaginação?)

| pergunta | resposta | veredito |
|---|---|---|
| a quem passa: «viram a menina da Brigid?» (T7) | *«A menina desce pro mato antes da ronda»* | **imaginação** (o covil da quest é a Fonte da Raposa, dentro da cidade) |
| «Conheço este selo?» (T9) | *«o martelo quebrado do templo de onde fugiu»* | **imaginação**, sem dado |
| «Quem do templo esteve neste arquivo?» (T11) | as casas de cura caras e o templo cheio | **a escuta ouviu outra pergunta** (`PERGUNTOU quem cura`), e o resto foi inventado |
| «O que é que o Arquivo Dourado guarda?» (T18, T19) | a milícia e o salvo-conduto; depois *«registro de terra, testamento velho»* | **a escuta ouviu outra pergunta** (`PERGUNTOU quem guarda a lei`) e a resposta foi plausível; é a pergunta do fio da abertura, e o sistema não tinha resposta para ela |
| «Quer vir comigo?» (T17) | *«⚑ Ceridwen o Silencioso recusou»*, pelas razões da tabela | **verdade** |
| «Quem vos pôs nesta estrada?» (T24) | oráculo, 42% → 57, *«NÃO, MAS»*: *«Foi o bando da serra»* | **oráculo e imaginação** |
| a distância e o perigo da masmorra | *«O Prumo de Espinhos — DIFÍCIL… 5.7× menos do que isto pede»* | **verdade** (da tabela, mas com o número à vista: defeito 14) |
| procurar Ceridwen em Monte Serena | *«está em Monte do Martelo — 7,7 km a sudoeste»* | **verdade** |
| o cais dos doentes (T32) | *«Não há cais aqui… Isto é serra e mata fechada»* | **verdade do mapa contra o próprio evento do sistema** (defeito 7) |
| «O que eu sei desta Muralha? Quem é o dono?» (T38) | *«mistérios que as pedras não respondem»* | **verdade honesta** (o RUMO manda dizer que não sabe), sem dado |

**Contagem: 4 verdades, 1 verdade honesta («não sei»), 1 oráculo, 4 respostas plausíveis ou inventadas e 2 perguntas que a escuta trocou por outra.** A troca da escuta é nova e tem causa exata (defeito 3).

## 4. As seis perguntas da NE9

### 4.1 Objetos inventados no estado: **0**

Li o save a meio (T5, T9, T10, T16, T18) e no fim. **Tudo o que está no estado nasceu do sistema:**
- **inventário (3):** *Símbolo sagrado riscado* (do antecedente), *Cordão de Ceridwen o Silencioso* (da oferta aceite pelo botão), *Retalho de Couro* (espólio recolhido); a chave da masmorra está em `masmorra.chave` (o guardião caiu);
- **cânone (1):** o boato da Muralha, *«contam que o dono ainda está lá, esperando»*, com a nota *«meia-verdade»* (do sistema);
- **gente (5):** Fenna, Ceridwen, Osric, «Capanga ×2», Bandido — todos postos pelo sistema; **facções: 0**; mapa: as 5 cidades da semente, sem sítio novo; livro de factos: 5 lugares e 5 pessoas, todos conhecidos.

**O que o Narrador inventou na prosa e não entrou** (procurei cada nome no save inteiro: 0 ocorrências):
- objetos: o **pedaço de cera vermelha com o sinete** (T8; T9 *«Você a guarda na bolsa»*); o **Diário do Templo**, um rolo de couro (T14; T15 Fenna *«estende o Diário do Templo direto para o seu peito»*; T16 lido: *«o nome de Brigid riscado em tinta fresca, associado a um dízimo desviado»*); o **frasco de vidro fosco** que Ceridwen estende (T21); a **lasca de cedro com o sinete de Varek** (T25); o **bilhete selado** de Varek (T36); *«os pergaminhos da capela»* (T35);
- gente: *o prior*, *o homem do templo*, *o bando da serra*, *o capitão da milícia*, *o intendente* morto, *Sigrun Passo-de-Gato* (a estalajadeira, que o sistema chama Osric Rompe-Escudos);
- factos: Helga presa pela milícia *«na cela… na Torre Velha»* (T8), contra a quest.

**Mas o inventado vive na conversa, e o veto do inventado (NE8) não disparou nenhuma vez.** Em nenhuma das pautas que li (o NÃO PODE inteiro de T9 a T38) apareceu uma linha *«pôr em jogo…»*. O Diário durou **20 turnos** na prosa: *«o peso do diário roubado puxa a outra fivela»* (T22), *«o diário roubado cobra que você procure Brigid»* (T25), *«na sua bolsa o diário clama por Brigid»* (T30), *«você fugiu com os pergaminhos da capela»* (T35). O jogador abre a Bolsa e não o encontra, e o Narrador continua a falar dele como de uma coisa que o herói tem.

**Porquê (lido no código, `src/motor/memoria-do-inventado.js`):** a régua é estreita de mais para as frases que saíram. A cera foi posta *no chão* sem verbo de posse (T8) e no turno seguinte fui eu que a nomeei ao apanhá-la, e o que o jogador nomeia «não morde»; o Diário chegou *«direto para o seu peito»* (o peito não está em `corpo`/`noCorpo`, e o «estende» sem «lhe/te» não conta como dar ao herói); o frasco foi estendido por Ceridwen sem destinatário. E a folga da família (*livro/diário/registro*) deixa passar qualquer diário se um «registo» existir em algum enredo.

**E a maior fonte de invenção agora é a própria pauta** (defeito 1): o RUMO manda o Narrador pôr na cena uma coisa *«com o nome dito»* que o sistema não tem.

### 4.2 Passos de quest: **0 em 47 respostas**

Nenhum passo andou. **O primeiro passo da quest de abertura é impossível:** *«Ouvir Brigid — falta falar com Brigid»* conclui com `conversou(papel:mae)`, e Brigid é um papel de elenco **sem lugar e sem id** (`papeis.mae = { nome: "Brigid", cidade: "Monte do Martelo", id: "" }`). Uma capital de 54 mil almas não põe ninguém em cena (`a-pessoa-do-passo.js`: *«Um onde que é a cidade inteira não põe ninguém em cena»*). Fui à porta dela (T4, que deu DESTINO NÃO RECONHECIDO), falei duas vezes (T5, T6), e Brigid nunca entrou em EM CENA nem no registo de gente. Na 19.ª era o Cronista (porta `cronista.conversa`, a `falou_com`) ou o livro lido da prosa que fechavam isto; as duas portas estão fechadas, e nada as substituiu para um papel sem sítio. **O sistema fecha bem o que entra; a quest é que ficou sem caminho.**

Os outros fios também não andaram: *O Sangue do Carrasco* (o da Fenna) nunca chegou à pauta; o fio da abertura (o Arquivo Dourado, Varek) não é missão — não aparece no Diário — e no entanto o RUMO o repetiu em 10 turnos seguidos (T27–T36) e trouxe Varek até mim quatro vezes, uma delas **para dentro da masmorra** (T36), sem ter recado nenhum para dar (defeito 1).

### 4.3 Chamadas a `/api/*`

**47 do Narrador, 0 do Cronista, 0 do Léxico** (19.ª: 44, 30 e 1). Custo por resposta **US$ 0,0085 contra 0,0110 (−23%)**. Há um botão «📜 Gerar crônica» no Diário que escreve a campanha por extenso; não o toquei (não é o Cronista do turno, e custaria uma chamada à parte).

### 4.4 O que partiu

| frase | antes (19.ª) | agora | o que o jogador sente |
|---|---|---|---|
| ataque a alguém só da prosa: *«saco a maça e ataco o primeiro irmão da ordem que me aparecer»* (T20) | o Narrador abria a luta | o sistema leu **PROCURA de Ceridwen** («a irmã de votos»), e a escuta juntou `PERGUNTOU quem cura`; o «não há ninguém» não apareceu | o gesto não teve resposta mecânica; a prosa salvou-o (*«Nenhum inquisidor salta das sombras»*) |
| recrutar pela conversa: *«E tu, quer vir comigo?»* (T17) | o Cronista punha no grupo | **funciona**: *«⚑ Ceridwen o Silencioso recusou»*, com o que pesou (*«calado… vocês se conheceram ontem»*) | melhor que antes: a recusa tem razão e não se discute |
| rezar: *«rezo com ela a prece das nove… pedindo ao meu deus um sinal»* (T14) | `fe:` pela IA | **nada**: fé 0 → 0, nenhum envelope, nenhum dado. E o herói, clérigo, **não tem deus** (`divindade.patrono = ""`) | o «sinal» que chegou foi o Diário inventado (pelo RUMO, defeito 1) — o pior desfecho possível: a reza responde com uma mentira |
| pagar: *«Pago duas moedas pela verdade, Varek»* (T18) | debitava pela prosa | **funciona**, com o veredito antes do clique (*«a bolsa fica com ◉ 13»*), 15 → 13 | bom; mas o envelope diz *«COMPRA… Os mantimentos já estão na minha mochila»* (defeito 12) |
| viagem sem destino: *«pegamos a estrada, para onde ela levar»* (T21) | o Narrador punha na estrada | **nada**: fico no Arquivo, *«Você sai para a rua»*; nenhum envelope | quis partir e não parti, sem saber porquê |
| promessa ao NPC: *«Prometo-te que levo o teu cordão ao templo de Monte Serena antes da lua nova»* (T17) | o Cronista guardava | **funciona**: entra no caderno (`prometido`) | mas é cobrada **no turno seguinte** e mais três vezes (T18, T20, T22), e prometi um templo que a aldeia não tem — o sistema aceitou-o (defeito 9) |
| conversa com a pessoa do passo (T5–T6) | o Cronista dava o `falou_com` | **impossível** para um papel sem sítio | a quest de abertura parou no primeiro passo (4.2) |
| quarto na estalagem: *«Peço ao estalajadeiro um quarto»* (T27) | *«pagar quarto comum (◉ 6)»* | virou **acampamento** com as minhas rações (10 → 8), *«nos arredores de Monte Serena»*, estando dentro | não é da NE, mas partiu entre a 19.ª e esta (defeito 10) |

### 4.5 A progressão fora da luta: **0 XP**

**XP total: 31, todo de luta** — 14 dos dois Capangas, 17 do Bandido guardião. **0 de quest, 0 de feito, 0 de conversa** em ≈ 35 turnos fora da luta. É a base para o XP por feitos do sistema; nesta campanha nenhum feito chegou a existir, porque nenhum passo andou (4.2).

### 4.6 Os restos da 19.ª

- **A régua dos dados:** caiu (secção 2) — 1 d20 a cada 5,8 turnos, 6% da frase, 2 perícias.
- **Bater carteira sem dado (T1 da 19.ª):** **corrigido** (Prestidigitação 15).
- **Desarmar armadilha (T17 da 19.ª):** **meio corrigido.** *«apalpo a fechadura da porta atrás de alguma armadilha… e desarmo o que achar»* deu Percepção 13, mas como **«vasculhar o lugar»**: o custo foi *«o lugar fica remexido»* e a prosa mostrou mesas e bancos revirados, não a fechadura. O desarmar continua sem passo.
- **«Procurar nesta sala»:** rola sozinho e com outra forma (secção 2).
- **O «NÃO, MAS» e o «por um fio»:** aparecem e são cumpridos (T24 *«— Não, mas…»* e o *«bando da serra»* como sobra). Mas no T2 o aviso do dado (*«a mão é vista onde não devia tocar»*) e o oráculo da mesma falha (*«alguém viu? … NÃO, MAS»*) contradizem-se, e o Narrador narrou o oráculo (*«Ninguém na multidão nota»*). E por baixo do «Não, mas…» aparece *«-8 aqui fora, quase nada»*, que é número de bastidor.
- **EM2:** **funciona.** Mediana de 101 palavras fora da luta (19.ª: 168), máximo 173; as conversas curtas ficam curtas (*«⚑ Ceridwen recusou»* + 2 falas).

## 5. Os defeitos, por gravidade

### Graves (mudam o que o jogador vive)

1. **A pauta manda o Narrador inventar.** Três linhas do sistema pedem uma coisa com nome sem dar o nome, e foram a origem de quase toda a invenção desta sessão:
   - *«uma coisa fora do sítio chama o olho do herói: é aqui mesmo que se esconde o que a história procura — é fato: entra nesta resposta, com o nome dito»* (T8, T14, T15, T16) → a cera vermelha e o **Diário do Templo**;
   - *«Varek Sem-Medo vem ter com o herói…: tem um recado que não confia a mais ninguém»* (T33–T36) → um recado diferente em cada turno: *«você fugiu com os pergaminhos da capela»*, *«a lâmina que matou o intendente tinha a marca da sua antiga guarnição»*, o bilhete selado;
   - o encontro da estrada *«um sinal que toca Varek Sem-Medo: um rasto, um objeto, uma marca»* (T25) → a lasca de cedro com o sinete.
   Fechar as portas tirou o inventado do estado; estas linhas continuam a pô-lo na conversa. *Arquivo provável:* `src/escuta.js` ~385 (`DEGRAU_EM_CENA.sinal.lugarAqui`) e ~396 (`motivos`); `src/fios-da-estrada.js` ~108 (`cena`). A linha só devia sair quando o sistema tem a coisa (o objeto do alvo da abertura, o facto do livro), e dizê-la.
2. **A quest de abertura não pode andar.** *«Ouvir Brigid»* pede `conversou(papel:mae)`, e Brigid não tem sítio nem id; ninguém a põe em cena (4.2). Sem o Cronista e o livro da prosa, não há outro caminho. *Arquivo provável:* o papel `de: "elenco"` sem lugar em `src/biblioteca-de-quests.js` (quando a quest se acende) e `src/motor/a-pessoa-do-passo.js` (só conhece missões `falar_com` com `onde`). A pessoa do passo de uma quest precisa de casa (uma rua, uma porta) e de entrar em EM CENA quando o herói lá chega.
3. **A escuta troca a pergunta por outra, por uma palavra.** Em `PERGUNTAS_DA_CIDADE` o `cura` casa **«templo»** e a `lei` casa **«guarda»** (o verbo). Resultado: *«Quem do templo esteve neste arquivo?»* → `PERGUNTOU quem cura` (T11); *«O que é que o Arquivo Dourado guarda?»* → `PERGUNTOU quem guarda a lei` (T18, T19); *«Procuro o templo desta aldeia»* → quem cura **e** procura de Ceridwen (T26); *«ataco o primeiro irmão da ordem»* → quem cura (T20). O Narrador obedece e responde à pergunta errada. *Arquivo:* `src/cidade-por-dentro.js` ~478–480. Mais as frases de sempre: *«Não arrombo porta de viúva»* deu **Arrombamento 16** (a negação, defeito 3 da 19.ª); *«vou até a casa de Brigid»*, *«vou até à estante do fundo»*, *«vou até ao cais»* deram DESTINO NÃO RECONHECIDO; *«templo de Monte Serena»* deu *«Ir até o santuário à beira do caminho · 28 min»*.
4. **O veto do inventado (NE8) nunca disparou** em 47 respostas, com três objetos dados ao herói na prosa (4.1). *Arquivo:* `src/motor/memoria-do-inventado.js` — o objeto posto na cena sem posse e apanhado pelo jogador no turno seguinte, o «estende… para o seu peito», o «estende» sem clítico, e a folga da família. Proposta: o objeto que o Narrador **pôs na cena** num turno e o jogador apanha no seguinte é do Narrador, não do jogador.
5. **Procurar e saber deixaram de chamar o dado.** T13 (procurar laje por laje) e T38 (*«O que é que eu sei desta…»*) não tiveram envelope nenhum; na 19.ª davam Percepção e Saberes. *Hipótese* para a busca: a chave da tentativa (`chaveDaTentativa(lugar, alvo)`, `src/desafios.js` ~1699 e ~2096) é a da cidade, e a oferta «Olho em volta» do T1, no portão, gastou a busca de Monte do Martelo inteira — mas então devia vir o «já procuraste aqui», e não veio nada.

### Médios

6. **A reza não tem sistema, e o clérigo não tem deus.** `divindade.patrono` vazio num Clérigo criado pela tela; rezar não mexe na fé nem chama dado (4.4). *Arquivo provável:* a criação do herói (`divindades.js`, o patrono do clérigo) e o substituto da NE4 para a fé.
7. **O evento local é impossível no mapa.** *«Uma doença estranha se espalha pelo bairro portuário de Monte Serena»* — uma aldeia de 270 almas na serra, sem cais; o Narrador desmente-o (*«Não há cais aqui»*). E *«Osric Rompe-Escudos, elfa homem, estalajadeiro»*. *Arquivo provável:* o gerador de eventos locais (não confere o porte nem o bioma).
8. **O compasso corre à frente do jogador.** O romance com a Fenna foi de PREPARAÇÃO (T5) a APERTA (T7), A UM PASSO (T14), AGORA (T15) e O QUE FICOU (T16) em 11 turnos, sem eu ter feito um gesto romântico. A promessa feita no T17 volta como *«O PASSADO VOLTA»* no T18. O RUMO do Arquivo Dourado repetiu-se em 10 turnos seguidos e virou tique da prosa (*«o Arquivo Dourado tem dono e ele já procura por Pedra-Funda»*, quase palavra por palavra, de T27 a T31).
9. **A promessa aceita um alvo que não existe** (o templo de Monte Serena) e é cobrada quatro vezes em cinco turnos.
10. **O quarto da estalagem virou acampamento**, com as rações do herói e sem preço, e *«nos arredores de Monte Serena»* estando dentro (T27–T28).
11. **O elenco cola-se e a companheira some.** Wystan e Nesa («a quem não tem nome») estão EM CENA do T1 ao T24, incluindo no Arquivo e na estrada; Ceridwen está EM CENA na estrada (T22) e duas cenas depois o sistema diz que ela está a 8 h dali; à boca da masmorra, Osric, Rhogar e Aelith estão EM CENA e **a Fenna não** (T33, T34), embora esteja no grupo. **Duas narrações no mesmo segundo** ao Partir (i=22 e 23, 22:23:13 e :14) e outra vez no encontro (i=24 e 25).
12. **O envelope do pagamento diz que comprei mantimentos** (*«COMPRA — JÁ REGISTRADA… Os mantimentos já estão na minha mochila»*) quando paguei um suborno; e o T17 levou um *«o descanso já foi resolvido pelo sistema; a frase acontece dentro dele»* sem descanso nenhum.

### Leves

13. **Nomes:** Fenna da Urze e Nesa da Urze no mesmo portão; *«Golem de Pedra a Bruxa do Pântano»* como nome da fera da quest; *«Capanga ×2»* gravado como uma pessoa no registo de gente; Brigid *«a elfa»*; a arma: a ficha diz **Lança**, eu escrevi «maça» e o Narrador seguiu-me até à luta, onde passou a dizer «lança» — a ficha não corrige o jogador.
14. **O bastidor à vista:** *«176 de poder (você 114 + 1 no grupo) contra 1.010 — 5.7× menos»* no chip da viagem; *«-8 aqui fora, quase nada»* sob o oráculo; *«O grupo está gasto»* com tudo cheio; *«A APOSTA: aguentar a marcha forçada»* sem marcha forçada; *«a luta acabou»* na grelha com o Bandido a 12/12 e a minha vez.
15. **A grelha:** depois de «Mover», um círculo laranja e branco do tamanho da grelha cobre as casas (vi-o nas duas lutas); o primeiro toque em «Mover» depois de a grelha rolar levou o herói para longe; «Atacar» fica mudo enquanto há uma reação pendente (contra-ataque, aparar), sem dizer porquê.

## 6. O veredito

**A Fase NE cumpriu o que prometeu.** Zero objetos inventados no estado, zero chamadas ao Cronista e ao Léxico, 23% mais barato por resposta, a latência a cair de 7,1 para 4,6 s. Convite, pagamento e promessa já passam por regra e respondem melhor do que quando a IA os escrevia: a recusa da Ceridwen tem motivo, o pagamento mostra o preço antes de cobrar.

**Mas o jogador não vê o estado, vê a prosa.** E nesta sessão a prosa deu-lhe uma cera, um diário, um frasco e um bilhete que a Bolsa não tem, e falou do diário durante vinte turnos — não porque o Narrador tivesse uma porta, mas porque **a pauta lhe pediu que pusesse em cena uma coisa com nome sem lhe dizer qual**. A NE fechou a saída da invenção; a entrada está numa linha do RUMO.

**E o jogo encolheu onde a IA fazia o trabalho sem que ninguém visse.** A quest da abertura parou no primeiro passo porque a pessoa do passo não tem casa; a reza não faz nada; a estrada sem destino não leva a lado nenhum; procurar e lembrar deixaram de rolar. Em 35 turnos fora da luta houve 6 dados e 0 de XP. **Joguei, e é menos jogo que a 19.ª**: mais honesto, mais barato e mais rápido, e com menos a acontecer entre uma luta e a outra.

## 7. O que corrigir primeiro

1. **As linhas do RUMO que pedem invenção** (`escuta.js` ~385 e ~396, `fios-da-estrada.js` ~108): só com a coisa do sistema dita, ou não saem. É o que mais tira inventado da conversa, e custa pouco.
2. **A pessoa do passo de uma quest tem casa** (`biblioteca-de-quests.js` ao acender, `a-pessoa-do-passo.js`): Brigid numa rua, em EM CENA quando o herói lá chega, e a conversa a fechar `conversou`. Sem isto, nenhuma quest de «ouvir alguém» anda.
3. **`PERGUNTAS_DA_CIDADE`** (`cidade-por-dentro.js` ~478–480): tirar «templo» do `cura` e o verbo «guarda» da `lei`. É uma linha, e trocou três perguntas centrais por outras.
4. **Procurar e saber voltam a chamar o dado** (T13, T38); conferir a chave da tentativa da busca.
5. **O veto do inventado** apanha o objeto que o Narrador pôs na cena e o jogador apanhou, e o «estende… para o seu peito».
6. **O clérigo nasce com deus, e a reza tem regra.**

Onde olhar: o cabeçalho e as secções 1–2 da 19.ª (`mente/sessao-19.md`) para o método; `mente/plano-nada-entra.md` para o que a NE fechou.
