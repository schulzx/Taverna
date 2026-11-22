# O Mestre vivo — décima quinta sessão jogada (22/11/2026): a história, não a troca

Commit jogado: `8009484` (v9.672, lido em `src/constantes.js` da cópia). Cópia limpa fora do repositório (`git archive` em `$TEMP/jogar-8009484`, `node_modules` por junção, Vite na porta 5215), `?mestre=1` (`taverna_cfg_mestre_vivo = 1` conferido), IA real, Edge headless por CDP com perfil novo (`perfis-jogar/s15`). Console só capturado em parte (o gancho zera a cada turno); o que está abaixo vem da lista de mensagens do save e do texto da página.

**Cenário:** Horror cósmico · Terras abertas · Mistério em Camadas, voz «quieta», lei do mundo «Saber custa: cada verdade sobre o que há além do véu é paga com um pedaço da mente de quem a aprende».
**Herói:** Barnabas, Humano Monge (acólito fugitivo), nível 1, 17 PV, Espada Curta, 15 moedas, bolsa com um Símbolo sagrado riscado; companheira **Lavinia Sallow** (Maga). Semente: `Barnabas|Humano monge, acólito fugitivo|77690`. Mundo e herói diferentes dos da sessão 14 (fantasia em arquipélago).
**Quest principal:** «O Livro dos Nomes» (cidade Rio do Martelo; alvo no save: «procurar Zipporah», origem Fenda de Névoa). Passos na tela: «Ouvir Mercy Quintus» (cumprido no turno 3) e «Saber onde quem lê o livro à noite guarda o livro» (nunca marcado).

**Orçamento:** 60 frases enviadas = **56 turnos** + 1 frase que virou um cartão «Esperar» e foi descartada (por Reescrever) + **3 frases barradas** por uma linha de sistema, que nunca viraram turno (ver 8). Nenhuma frase de teste; nenhum turno repetido por curiosidade. Os cartões de pagar/comprar/ir tiveram os dois cliques (7 no total). **Uma luta não houve**: não poupei inimigo nenhum, porque a história não deu inimigo. Numeração abaixo = turno do save (o 1 é a primeira frase).

## 1. Estrutura da história (quest principal)

| batida | turno | o que foi |
|---|---|---|
| gancho | 0 (abertura) | o Livro dos Nomes sumiu; alguém chama pessoas pelo nome |
| objetivo claro | 3 | quadro: «Saber onde quem lê o livro à noite guarda o livro» |
| complicação | 4 · 10 · 11 | Mercy deu o livro a um homem de manto cinza (4); Mercy volta ao quarto dele (10); ele ameaça «o próximo nome será o de quem o enviou» (11) |
| escolha com preço | 42–44 | Corvo cobra «a lembrança mais antiga»; o jogador a conta |
| revelação | 4, 27, 41 | quem levou o livro (4); a flautista é Zipporah, a filha (27); a mãe pagou «com três sonhos e uma promessa» (41) |
| clímax | 44 | «Está quitado» — Corvo risca o nome |
| recompensa | **não houve** | 0 XP, 0 moeda, 0 item depois do turno 5 |
| fecho | 46 (só em prosa) | reencontro de Mercy e Zipporah; a quest continua aberta (pistas «1 de 2») |

**Batidas que não aconteceram em 56 turnos:** a recompensa (nenhuma linha de sistema depois do clímax); o fecho da quest (o quadro ficou em «1 de 2» do turno 3 ao 56, mesmo depois da cripta no 39 e de Zipporah livre no 44); luta alguma; o mandante de Corvo («quem manda nele não se mostra», 26 e 49) nunca apareceu. A Fenda de Névoa foi alcançada no 54 e a sessão acabou diante dela.
**Turnos em que o jogador não sabia o que fazer a seguir: 9** (6, 7, 12, 23, 33, 35, 36, 49, 55). Os dois grandes buracos: o túnel (31–37) e o depois do clímax (49–51), quando Mercy diz «leve-a onde ninguém conheça o nome» e o quadro não muda.
**Um defeito de ponta a ponta:** o save diz que o alvo é «Zipporah» («o único fio solto»), mas a tela e a narração nunca falaram dela até eu perguntar «o nome dela é Zipporah?» no turno 27 — o nome eu li no save, um jogador de verdade não teria como saber. Funcionou porque a IA aceitou a pergunta; sem ela a revelação não acontecia.

## 2. Diálogo

Personagens com 3 falas ou mais (voz / desejo / saber / utilidade, 0 a 2):

| personagem | falas | voz | desejo | saber | utilidade | total |
|---|---|---|---|---|---|---|
| Corvo (o manto cinza) | 9 (11, 13, 14, 16, 39–41, 43, 44) | 2 | 2 | 2 | 2 | **8** |
| Mercy Quintus | 6 (3, 4, 10, 46, 49, 50) | 2 | 2 | 1 | 2 | **7** |
| Zipporah (a flautista) | 11 (22–27, 30, 31, 35, 37, 38) | 2 | 2 | 1 | 2 | **7** |
| Lavinia Sallow (companheira) | 9 (1, 2, 16, 29, 32, 36, 53, 55 …) | 1 | 1 | 0 | 1 | **3** |
| o viajante encharcado | 3 (54, 55, 56) | 0 | 0 | 1 | 0 | **1** |

Por que as notas baixas: o «saber» de Mercy tropeça na abertura («sumiu faz uma semana», e a encontro no balcão no 3; no 9 ela vira «a mulher baixa que visita o forasteiro»); Lavinia diz «Fenda de Névoa é longe demais para irmos sem tocha» (53) com **5 tochas** na ficha, e some das falas do turno 2 ao 12, quando eu peço a ela que saia do quarto e quem responde («recusou») é Mercy; o viajante repete a mesma fala três turnos seguidos («Ouvi dizer que a filha de Mercy veio atrás de você»), e ela ainda é **falsa** (eu a deixei com a mãe no 54).
Com menos de 3 falas: Thomasine, Prudence, Cornelius, Charity Mordaunt, o homem das cinzas (2 cada).

- **Fala boa (turno 25, Zipporah):** «O forasteiro quer que os nomes deixem de ser nomes. E não volto porque a casa da minha mãe tem uma janela que nunca abre.» Voz própria, desejo, e uma informação que a história usa. Outra: Corvo, 40, «Zipporah é um nome que já foi pago. E eu? Eu só guardo o que alguém entregou.»
- **Fala fraca (turno 7, o homem das cinzas):** «Depende do livro. E da noite.» É o aforismo vazio que dá ao jogador a obrigação de pagar para obter uma informação.
- **Falas repetidas / sósias:** o viajante 3×; «aqui ninguém a chama pelo nome» 3× (Corvo 16, flautista 23, Zipporah 27); «ergue o queixo, os dedos parados» em **3 NPCs diferentes** (o homem das cinzas 7, Prudence 18, Cornelius 19); Zipporah «segura/aperta a flauta contra o peito» 5×; Lavinia «a lamparina apagada» 5× (15, 34, 35, 36, 55). **Personagens que soam iguais: 5** (homem das cinzas, Thomasine, Prudence, Cornelius, Charity — todos de frase curta mais fecho de provérbio). Gênero errado: Charity Mordaunt no masculino duas vezes (48, 52: «Ele aponta», «Ele some»); Prudence diz «obrigado» (20).

## 3. Quest

- Os passos fazem sentido em sequência **na prosa** (Mercy → forasteiro → filha → cripta → quitar → voltar) e **não no quadro**: o quadro teve 2 linhas e a segunda nunca foi riscada.
- **Cartas do quadro:** `quadro.cartas = {}` durante a sessão toda. «O que está em jogo» foi dito só por falas de NPC.
- **A quest reconheceu o que fiz?** Não. Resolvi Zipporah de um jeito não previsto (pagar com uma lembrança): a ficha não mudou (cicatrizes, condições, essência, memória: vazios), o quadro não mudou, nenhuma linha de sistema registrou o pagamento. O mundo só reagiu em prosa.
- **Becos sem saída:** o túnel (31–37, 7 turnos sem decisão nem dado); o objeto «livro» (ver abaixo); a flautista até eu dar o nome certo; o cartão «Esperar» (35), que ofereceu 1 h / 2 h / 4 h para «espero o que vem pelo túnel».
- **Quests que apareceram: 1. Fecharam: 0.** Pistas no fim: «1 de 2».
- **O livro:** a narração me deu o livro duas vezes (11 «Leve-o», 13 «pego o pacote») e o sistema respondeu «Não há livro aqui que se leve» (12) e, depois, «O livro não está com você — não há o que entregar» (3 vezes antes do 42). A tala de madeira da cadeira quebrada (15) e o pão e a água (51) também foram narrados e nunca entraram na ficha.

## 4. Loot

| turno | o quê | de onde | serviu? |
|---|---|---|---|
| 20 | Ração (◉ 7), dada a Prudence | compra em Cornelius | sim: virou o presente do ato 5 (a conta de rações ficou em 10) |
| 30 | ◉ 64 moedas | alçapão atrás da prateleira, Percepção 20 vs 13 | gastei ◉ 9 no quarto; ◉ 63 **ficaram paradas** |
| 54 | título «Andarilho» | viagem, falha de navegação | não serve para nada visível |
| 11, 13 | Livro dos Nomes | narração | **nunca entrou na ficha** |
| 15 | tala de madeira | cadeira quebrada | só narrada |
| 51 | pão, moringa, corda | armário de Mercy | **negado** («nada passa para você») |

Inventário no fim: o mesmo Símbolo sagrado riscado do início. **Ganhos reais na ficha em 56 turnos: 2** (as moedas do alçapão e um título).
**Curva da moeda (10 pontos):** t1 15 · t10 15 · t19 15 · t20 8 · t25 8 · t30 72 · t40 72 · t45 72 · t52 63 · t56 63. Houve em que gastar? Em tese sim (Cornelius vende rações, tochas, água); na prática nada que o herói precisasse, e o único gasto narrativo (suborno de 2 moedas no 8) **não foi debitado** (15 → 15). O quarto que paguei no 52 não foi usado; a sessão acabou.

## 5. Progressão

- **XP por turno (10 pontos):** t1 0 · t2 17 · t3 34 · t4 51 · t5 68 · t10 68 · t20 68 · t30 68 · t44 68 · t56 68. **68 XP, todos em 4 turnos seguidos (2 a 5), todos fora de luta (100%, não houve luta).** Depois do 5, **51 turnos sem um ponto**, incluindo o clímax (44), o reencontro (46), a chegada a uma região «Difícil» (54) e o dado de Atletismo (15).
- **Níveis subidos: 0** (nível 1 do começo ao fim). O que cada nível deu: nada, não houve nível. **Escolha sentida de progressão: nenhuma.**
- Linhas de XP: «uma conversa que ficou» (2, 4), «um lugar por onde você nunca tinha passado» (3 — numa taverna onde eu já estava no turno 2) e «um risco enfrentado, e vencido» (5 — por um dado que não devia ter existido, ver 7).

## 6. Eco — dos dez atos marcantes

| # | ato (turno) | eco | quando |
|---|---|---|---|
| 1 | promessa a Mercy (5) | Mercy: «Eu sonhei que você voltava» ao ver a filha, sem citar a promessa | 46 |
| 2 | suborno de duas moedas (8) | o homem dá a pista; moeda não debitada; nunca mais citado | 8 (imediato) |
| 3 | mentir ao Corvo que sou emissário (11) | ameaça «o próximo nome será o de quem o enviou»; nunca cobrada | 11 (imediato) |
| 4 | quebrar a cadeira e desafiar Corvo (15) | «Isso fez barulho», Thomasine sobe a escada; depois «olhos cheios de pergunta» | 15, 17 |
| 5 | ração a Prudence (20) | «Não me acostumo a receber. Mas obrigado.» | 20 (imediato) |
| 6 | prometer a Zipporah que não a obrigo (25) | «E por isso eu sei que você fala a verdade» | 27 |
| 7 | desobedecer Corvo e abrir o livro (28) | Lavinia: «alguém chamou por nós»; a voz «Fechou o livro?» | 28, 29 |
| 8 | propor a troca do livro por Zipporah (40) | Corvo: «Você veio trocar o que não é seu» | 40 |
| 9 | pagar com a lembrança mais antiga (44) | Lavinia: «você pagou com um nome que não se devolve» | **53** (9 turnos depois) |
| 10 | ofender a sopa de Charity (48) | «Água suja queimada, disse? Pois a tigela vai sair do meu bolso» | **52** (4 turnos depois) |

**Ecoaram no mesmo turno ou no seguinte: 10 de 10.** Ecoaram **3 turnos ou mais depois: 3 sólidos** (1, 9, 10) **e 1 parcial** (3, que voltou no 39 sem citar a mentira). **Nenhum eco de sistema** (preço, XP, ficha, linha de reputação) em nenhum dos dez; todos são só prosa da IA. Os melhores ecos (10 e 9) vieram de personagens que a IA tinha à mão na cena. Dos «dez atos» pedidos, **não houve poupar inimigo**: o ato 7 (desobedecer) o substituiu.

## 7. Ritmo

- **Turnos sem nada novo (nenhum fato, escolha ou mudança): 19** (6, 7, 12, 13, 23, 29, 31–37, 43, 48, 50, 51, 53, 56). **Maior sequência: 7** (31–37, do alçapão à poça escura); com os 3 turnos seguintes (38–40) o túnel e a cripta somam 10 turnos com um único dado.
- **Dados rolados: 4 d20 do herói nas frases + 1 de «Navegação»** (viagem). Cada um:
  1. turno 5, Investigação 16 vs 13, sucesso — **nada em jogo**: o pedido foi uma promessa; narração «Você consegue.»
  2. turno 11, Enganação 16 vs 14, sucesso — **tinha algo em jogo** (o livro).
  3. turno 15, Atletismo 17 vs 13, sucesso — algo pequeno em jogo; teve consequência real («Isso fez barulho»).
  4. turno 30, Percepção 20 vs 13, sucesso — **nada em jogo para o meu pedido**: eu pedi para proteger Zipporah; o sistema leu como «procurar» e deu ◉ 64.
  5. turno 54, Navegação 3 vs 5, falha — tinha algo em jogo (3 h perdidas).
  **Em jogo: 3 de 5 (60%).** O herói tirou sucesso em todos os dados de frase (4 de 4); só a viagem falhou. Onde um mestre real teria rolado e o sistema não: o assobio no túnel (31–35: Percepção), o ataque à poça (36), o convencer Corvo (40) e o pagamento da lembrança (44) — **o clímax inteiro correu sem dado**. (Isto não é cota: é o ponto do clímax em que um mestre pediria teste.)

## 8. Silêncios

**Frases em que o sistema não reconheceu, leu errado ou negou o que um mestre real aceitaria: 17 de 60.** Só a lista:
5 (promessa lida como Investigação) · 8 (pagar suborno sem linha de moeda) · 12 («não há livro» logo depois de o forasteiro entregá-lo) · 13 (pegar o pacote: nada na ficha) · 15 (a tala narrada, sem item) · 30 (pedido de proteção lido como Percepção) · 31 (acender a tocha sem linha; tochas 5 → 5) · 33 («Você não tem isso com você», tendo espada equipada e 5 tochas) · 35* (cartão «Esperar 1 h / 2 h / 4 h» para «espero o que vem»; descartada) · 36 (golpear a poça sem rolagem nem combate) · 40 (propor troca sem linha) · 42a, 42b, 42c* («ofereço uma lembrança… soltá-la do livro» lida três vezes como entrega do livro; 3 linhas «O livro não está com você», frases perdidas) · 43 (linha de ajuda «Diga o que você dá ou pede… dou a corda a Hakon» no meio da cena) · 44 (o sacrifício sem nenhuma marca na ficha) · 51 (aceitar o pão e a água oferecidos).
(*) frases que **não viraram turno**: 35, 42a, 42b, 42c.

## 9. PT-PT

- **Texto do sistema: 0 turnos** com «tu», ênclise ou vocabulário de Portugal.
- **Narração: 2 turnos com ênclise de Portugal:** 14 («Chamam-me Corvo») e 30 («fez-o com pressa»). Fora disso, «Leve-o/Leve-a» (11, 49) são imperativos aceitos em PT-BR, e o `pés` que o detector marcou como «és» era falso positivo. Nenhum «tu». Vocabulário limítrofe a notar: «à escuta atrás da porta» (9).

## Os dez pontos em que um mestre de mesa bom teria feito diferente (por impacto)

1. **Turnos 44–46: o clímax e o fecho sem nenhuma marca no jogo.** O jogo: «Está quitado», o abraço, e XP 68 desde o turno 5, quest em «1 de 2», ficha igual. O mestre: fecharia a quest, daria o XP (uma noite como esta sobe um nível), e anotaria no personagem o que ele deu.
2. **Turno 44 e 28: «Saber custa» nunca cobrou.** O jogo: abri o livro (28) e doei a lembrança mais antiga (44): PV 17/17, essência 0, cicatrizes/memória vazias. O mestre: cobraria uma perda que ficasse (uma lembrança riscada da ficha, ou PV/mana) — foi a promessa do mundo.
3. **Turnos 11–13 e 42: o livro.** A narração dá, o sistema nega, três frases minhas morreram numa linha de sistema. O mestre: um objeto só; se Corvo o entrega, ele está na bolsa.
4. **Quadro parado do turno 3 ao 56.** A pista «onde guarda o livro» cumprida no 39 e não marcada; `quadro.cartas` vazio; o save mandava «procurar Zipporah» e o sistema repetiu «Zipporah está a 18 km» (29, 35) com ela do meu lado. O mestre: mantém a lista viva e a atualiza na frente do jogador.
5. **Turnos 31–37: o túnel.** 7 turnos sem decisão, sem dado, sem dano; o ataque à poça (36) «corta o ar» e nada acontece. O mestre: pediria Percepção no assobio, daria uma ameaça com dano, e o ataque rolaria.
6. **Dados no lugar errado:** promessa → Investigação (5); proteger Zipporah → Percepção e ◉ 64 (30). O mestre: não rola a promessa e não troca o pedido do jogador por uma busca.
7. **Turnos 9, 33, 51, 24, 43: o sistema na boca do Narrador.** «Você pergunta, e o sistema resolveu:» (9), «Você não tem isso com você» (33), «Por ora, nada passa para você» (51), «[…]» literal (24, 30, 48), a ajuda de exemplo (43). O mestre nunca fala da mesa na voz da cena.
8. **A companheira, e o elenco que soa igual.** Lavinia some do 2 ao 12 e depois vira «a lamparina apagada» 5×; o viajante diz a mesma frase em 3 turnos (e falsa); 5 NPCs com o mesmo tique. O mestre: daria a Lavinia uma escolha e uma discordância e diria quando um NPC repete.
9. **Mundo que se contradiz:** Mercy «sumiu faz uma semana» (abertura) e está no balcão (3); «a mulher baixa» (9); o «barracão sul» virou «A Balança dos Que Voltaram» (17); o viajante diz que Zipporah «veio atrás de você» (54). O mestre: lugares e pessoas fixos.
10. **Loot e moeda sem uso.** Em 56 turnos, 2 ganhos reais; ◉ 63 paradas; o suborno de ◉ 2 (8) e o pão (51) sem débito nem entrada. O mestre: o item entra quando a cena o dá, e o que se gastou sai da bolsa.

## O que não verifiquei

Luta de qualquer tipo (não houve; não poupei inimigo); subida de nível e o que ela dá; venda, uso ou troca do loot (nada de loot servível entrou); uma segunda quest; as habilidades de Monge e o grimório de Lavinia; a gaveta «Pessoas» e o Códex («▸ Códex — há o que registrar» apareceu no 54 e não foi aberto); a carta «CARTA» da quest na tela; sensação visual (nenhuma captura); se a lei «Saber custa» tinha implementação mecânica que eu não disparei com outro tipo de frase; o custo real em chamadas de IA; o console completo (só parte, o gancho zera por turno); a mesma cena jogada com outra semente.
