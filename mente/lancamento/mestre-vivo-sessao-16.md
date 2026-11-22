# O Mestre vivo — décima sexta sessão jogada (22/11/2026): a quest manda na cena e o ouvido escuta

Commit jogado: `d7a43a8` (v9.674, lido em `src/constantes.js` da cópia). Cópia limpa fora do repositório (`git archive` em `$TEMP/jogar-d7a43a8`, `node_modules` por junção, Vite na porta 5216), `?mestre=1`, IA real, Edge headless por CDP com perfil novo (`perfis-jogar/s16`). O console foi capturado a cada turno (gancho em `console.info`): 52 das 60 frases têm a linha `[o ouvido] {…}` guardada em `s16-ouvido.txt` do scratchpad. Nenhum arquivo do projeto foi tocado, fora este relatório.

**A campanha é a mesma da 15?** Sim no que importa: Horror cósmico · Terras abertas · Mistério em Camadas, voz «quieta», lei «Saber custa», Rio do Martelo, «O Livro dos Nomes», Mercy Quintus, Lavinia Sallow, alvo da abertura «procurar Zipporah» (origem Fenda de Névoa). A criação não deixa fixar a semente: o herói saiu **Barnabas, Humano Monge, acólito fugitivo**, mas sem checar a semente `77690`. O que mudou foi a cadeia da quest: aqui o passo 2 foi «Saber onde quem lê o livro à noite guarda o livro», o 3 «Tirar o livro das mãos de Thaddeus Crane, a Coisa no Poço», e ao fechar nasceu uma segunda quest, «A Torre do Sino». O vilão e a cadeia **não são os mesmos da 15**.

**Orçamento:** 60 frases enviadas, mais 2 cliques em painéis (a «Espreitar» do cartão «Frente a frente» e o «Escolher» do cartão de desfecho) que também geraram turno. Nenhuma frase de teste, nenhum turno repetido por curiosidade. 4 das 60 frases nunca entraram no histórico visível (12, 29, 30, 55: ficaram numa linha de sistema ou num cartão sem Narrador). Uma frase (a 5, «Eu fico com o troco da caneca») foi enviada por erro meu de script; conta no orçamento e entra na tabela. A luta não houve. Numeração abaixo = ordem da frase digitada (a 1 é a primeira).

## 1. A quest (na 15: «1 de 2» parado por 53 turnos, 0 cartas, 0 fechadas, 9 turnos perdido)

| batida | frase | o que foi |
|---|---|---|
| destino dito pelo Narrador | 1 | «Praça de Armas do Afogado… armazém O Sino Rachado» — **e o botão dizia «Ir até A Lâmpada dos Sonhos»**: prosa e botão **divergiram** |
| prosa e botão concordam | 6 | Mercy: «o beco atrás da capela»; botão «Ir até A Capela do Afogado». **Concordaram nas frases 6 e 7**, depois não houve mais botão de ir |
| passo 1 «Ouvir Mercy» virou | 3 | |
| passo 2 virou | 7 | ao chegar na capela (o texto do passo mudou para «Tirar o livro das mãos de quem lê…» e, na 13, para «…de Thaddeus Crane, a Coisa no Poço») |
| o quadro nomeia o vilão | 13 | Thaddeus Crane entra em «Em cena»; **a prosa só o nomeou na 14, quando eu perguntei**, e ele só falou na 19 |
| passo 3 virou | 33 | por uma **falha** de Persuasão (15 contra 18): preço de 18 moedas, o passo cumpre e o livro entra na ficha |
| desfecho | 33–34 | cartão «Decidir o que fica do livro»: 3 cartas (queimar / devolver a Mercy / cópia de Tabitha) com GANHA e CUSTA antes do clique |
| quest cumprida | 34 (clique: turno 36) | «★ O Livro dos Nomes — cumprida», +100 XP, +37 moedas, uma Poção de Cura Média no chão |

- **A quest fechou: 1. Cartas viradas: 2** (uma «cúmplice», a outra no passo 3; `quadro.cartas` tinha 1 na 25 e 2 na 33). Turnos até fechar: **34 frases (36 contando os dois cliques)**.
- **Prosa e botão concordaram?** Em 2 frases de 34 (6 e 7). Em quatro momentos divergiram: 1 (Lâmpada vs Praça de Armas), 13 (quadro: Thaddeus; prosa: um viajante falando de Zipporah, o mesmo nome da abertura), 17 (o quadro manda «tirar o livro de Thaddeus», que está «Em cena», e **não há botão para ir ao poço**; Mordecai diz que ele mora no poço), 41 (passo 2 da segunda quest diz «Constance», o sistema só conhece «Charity Mordaunt»).
- **A segunda quest não andou:** «A Torre do Sino · Ouvir Constance Mordaunt», nasceu na frase 34 e ficou em **0 de 1 por 26 frases** (35 a 60). O passo nunca virou, nem depois de eu ouvir Charity falar de Constance (frase 53). `Em cena` ficou vazio na torre; Constance **não existe como pessoa do sistema** (o sistema só tem Charity Mordaunt, na Lâmpada).
- **Turnos em que não sabia o que fazer:** quest 1, **6** (17, 19–23: o livro troca de mão na prosa e não na ficha, e não há botão de ir ao poço); quest 2, **~15** (38–53 e depois, sem como cumprir «ouvir Constance»). Total **21**, na 15 foram 9.

## 2. O elenco (na 15: vilão, cripta e filha inventados)

Falaram com nome: Mercy Quintus, Thomasine Nightingale, Mordecai, Eudora Ottoline, **Thaddeus Crane, a Coisa no Poço**, Charity Mordaunt, Tabitha (1 fala), e Lavinia (companheira). **Todos estavam na lista «Em cena»** no turno em que falaram, com uma exceção contada abaixo. **O vilão veio do sistema** (figurante com nome, 6 falas, voz boa: «Guardei o livro por engano. Agora ele que me guarda.») e a prosa o aceitou assim que o chamei. Melhora clara frente à 15.

- **Nomes que a prosa deu a quem o sistema não tinha: 1** (Zipporah, citado por «um viajante» na frase 12b; o viajante não tem nome nem lugar em «Em cena»).
- **Pessoas sem nome e fora da lista que falaram: 2** — o «viajante» (1 fala) e a «mulher atrás do balcão» (3 falas; depois ora é «A Âncora do Sul», ora «Constance», na prosa da frase 45).
- **Constance Mordaunt:** o nome veio do **passo** da quest (não da IA), mas a prosa lhe deu corpo (frases 40–41: «guarda as moedas no avental», «Vi o forasteiro subir. E vi a maré escutar») sem ela estar em «Em cena», e o sistema depois diz «a torre está vazia» (46). Pessoa que fala, existe só quando eu digito o nome.
- **Lugares que a prosa criou e o sistema não conhece: 3** — «Praça de Armas do Afogado» (1), «estalagem» (6), «o poço velho» (14) —, e um 4.º conflito: «a torre do sino fica na capela» (38), enquanto o sistema criou o lugar «a nave» quando digitei «subo até a torre» (39).
- **Objeto na lista de pessoas:** «Chave sem fechadura conhecida» apareceu em «Em cena: Eudora…, Chave sem fechadura…» (8 e 26). Um cartão «Frente a frente» pôs como criatura «quem lê o livro à noite» (o texto do passo, sem nome) na frase 12; a prosa nunca falou dela, e a lista passou a ter Thaddeus.

## 3. Troca por troca (nas sessões 9 a 14: 51% a 73% de concordância)

Frases de troca ou que **procuraram** ser troca: **40 de 60** (escolhi frases duras de propósito: pronome, verbo fora do manual, duas ações, ausente, algo que não tenho). Lido do console `[o ouvido]` e da lista de mensagens.

| frase | o que digitei | o que o ouvido leu | resposta do sistema (tela) | ficha antes → depois | prosa | classe |
|---|---|---|---|---|---|---|
| 4 | «se eu pagar uma caneca pra você, você me conta…» | convencer, quem=**Mercy Ottoline** (longe), caneca | nenhuma | ◉15 → 15 | «aceito a caneca» | (i) |
| 5 | «Eu fico com o troco da caneca» | **esperar**, coisa moeda | nenhuma | igual | «você fica com o troco» | (ii) |
| 7 | «deixo duas moedas na mesa pra Mercy… e saio pra capela» | dar 2 moedas, quem=Mercy **Ottoline** longe, veredito **nao/ausente** | nenhuma de negativa; só «◉ −2 moedas» | ◉15 → 13 | «Mercy sem tocar nas moedas» | (iii) |
| 8 | «Eudora, quanto você quer pela chave?» | falar, coisa chave | nenhuma | igual | «Não vendo hoje» | concorda |
| 9 | «troco o meu símbolo sagrado riscado pela chave, Eudora» | escambo, símbolo (minha), **nao_vende** | «Eudora Ottoline não vende Símbolo sagrado riscado.» (direção invertida) | igual | «O símbolo é seu e a chave é minha» | (i) |
| 12 | «tento passar a mão na chave da Eudora sem ela perceber» | **sem linha** (ouvido não rodou) | «A chave da Eudora não está com você — não há o que entregar.» (porta antiga, furtar lido como entregar) | igual | cartão «Frente a frente» no lugar | (i) |
| 14 | «empresta a vassoura um minuto, Mordecai? Eu devolvo já» | emprestar, **quem=null** (Mordecai estava na frase), **pergunta** | «A quem você empresta a vassoura? 1. Eudora · 2. Mordecai · 3. Thaddeus Crane · 4. O Sino Rachado · 5. A Âncora do Sul · 6. O Cálice do Vigia · 7. Balcão · 8. Lavinia» | igual | nenhuma | (i) |
| 15 | «Mordecai» (resposta por nome) | idem, **a frase acumulada**, quem=null | a **mesma** pergunta | igual | nenhuma | (i) |
| 16 | «2» (por número) | idem, acumulada de novo | a **mesma** pergunta (3.ª vez) | igual | nenhuma | (i) |
| 18 | «Thaddeus Crane, me devolve o Livro dos Nomes. Pago o que você pedir.» | **devolver**, livro, nao_tem | «Você não tem livro.» (direção invertida: pedi a ele que devolvesse) | igual | Thaddeus aparece: «O que você tem para me dar?» | (i) |
| 19 | «entrego o meu símbolo sagrado a ele, em troca do livro» | dar, quem=**Mordecai** (ele=Thaddeus), sim_com_preco, aplicar | nenhuma | **símbolo continua** na bolsa | «Thaddeus apanha o símbolo» | (iv) |
| 20 | «passo dez moedas por baixo do manto pra Thaddeus, só pra ele me soltar o livro» | dar 10 moedas, Thaddeus aqui, sim_com_preco, aplicar (**leu certo**) | «Aqui ninguém vende baixo.» | ◉13 → 13 (**não debitou**) | «recolhe as moedas… solta o livro sobre a mesa» | (iii) |
| 21 | «pego o livro da mesa e guardo na bolsa» | pegar, veredito **dado** | «Livro fica onde está: não é coisa de se levar.» | igual | «o livro já não está lá» (nega o que entregara) | (iv) |
| 22 | «arranco o livro da mão dele» | **agir** | nenhuma, sem dado | igual | «o livro pesa na sua mão» | (ii) |
| 23 | «guardo o Livro dos Nomes dentro da bolsa» | **agir** | nenhuma | igual | «você desliza o livro para dentro da bolsa» | (ii) |
| 24 | «Thaddeus, ouça: esse livro não é seu. Entregue ele a mim por bem…» | trocar, coisa **«Sais Aromáticos»** (inventada), pergunta | «O que você faz com o Sais Aromáticos? 1. Comprar · 2. Pedir · 3. Furtar» | igual | nenhuma | (i) |
| 25 | «2» | pedir, deGraça, dado | «Persuasão. Precisa de 22.» d20 4+4=8 falha | igual | ignora Sais e dado | (i) |
| 26 | «furto a chave que a Eudora prendeu no pescoço» | furtar, chave, dado | «Prestidigitação. Precisa de 15.» 4+3=7, «Eudora vê a sua mão» | igual | «os dedos dela fecharam sobre os seus» | **concorda** |
| 28 | «compro duas tochas da mulher do balcão» | comprar, tochas, 2, sim_com_preco | «2× Tochas — ◉ 2 (restam ◉ 11)» + cartão | ◉13 → 11, tochas 5 → 7 | «Duas? Para descer ou voltar?» | **concorda** |
| 29 | «vendo o símbolo sagrado riscado pra ela» | **sem linha** (porta antiga abriu o cartão) | cartão: «O ela não está aqui para comprar»; Vender desabilitado | igual | nenhuma | (i) |
| 30 | «vendo o símbolo… pra mulher do balcão» | **sem linha** | cartão: «O mulher não está aqui para comprar» | igual | nenhuma | (i) |
| 31 | «vendo o símbolo sagrado riscado» | vender (o 2.º leitor, depois da venda: nao_tem) | «Vendido… ao Sino Rachado por ◉ 7» + «Você não tem símbolo.» | ◉11 → 18, símbolo saiu | «a mulher o guarda sob o pano» | concorda |
| 32 | «cobro de Thaddeus as dez moedas que já passei pra ele» | cobrar, 10, dado | «Thaddeus Crane… não cede: nada muda de mão.» | igual | «Não foi pagamento. Foi pedido.» | concorda |
| 34 | «devolvo o livro a Mercy Quintus, inteiro como estava» (a ausente) | **sem linha**: o cartão de desfecho casou a frase com a carta | cartão «Escolher: devolver…» | **o livro continua na bolsa** | Mercy aparece na frente de quem estava na capela | (iii) |
| 35 | «pego a poção de cura que ficou no chão» | pegar, dado, aplicar | «Você recolhe: Poção…» **e** «Não há poção aqui que se leve» | poção entrou | «recolhe a Poção» | (v) |
| 36 | «dou a poção de cura pra Lavinia, de presente» | dar, Lavinia, sim_com_preco | «Poção… agora é de Lavinia Sallow.» | poção → bolsa de Lavinia | «guarda no cinto» | **concorda** |
| 37 | «pago cinco moedas de doação pro altar da capela» | pagar, 5 | cartão «Pagar ◉ 5 (a bolsa fica com ◉ 70)» | ◉75 → 70 | «cinco moedas na caixa do altar» | **concorda** |
| 40 | «dou duas moedas pra Constance Mordaunt» (ausente) | dar, quem=null, **pergunta** | cartão «Pagar ◉2» (cliquei: ◉70 → 68) **e** «A quem você entrega as moedas? 1. O Sino Rachado · … · 5. Lavinia» | ◉ −2 a ninguém | nenhuma | (i) |
| 41 | «Lavinia Sallow» (resposta por nome) | idem, acumulada, quem=Lavinia, aplicar | **outro** cartão «Pagar ◉2» (68 → 66) | ◉ −2 a ninguém | «põe as moedas na mão de **Constance**… bolso do avental» | (iii) |
| 43 | «quanto custa uma ração? Não vou pagar mais que três moedas» | falar, ração, 3 | nenhuma | igual | «Três moedas… Leva uma» (preço da IA) | (ii) |
| 44 | «compro uma ração dela, como combinado» | comprar, quem=**A Âncora do Sul**, nao_vende | «A Âncora do Sul não vende ração.» (cartão antigo oferecia ◉ 7) | igual | «Aqui não é armazém» (nega o que ela ofereceu 1 turno antes) | (iv) |
| 48 | «Charity, me serve uma sopa. Fico devendo até amanhã» | falar, sem coisa | nenhuma | igual | «Crédito é cova funda… serve a sopa mesmo assim» | (ii) |
| 50 | «Mercy, me empresta o alaúde só um instante?» | emprestar, Mercy Quintus aqui, dado | «Mercy não cede: nada muda de mão.» + «🔮 …— Não.» | igual | «Este alaúde não sai da minha mão» | **concorda** |
| 51 | «vendo duas tochas pra Charity» | vender, tochas, 2 | «Vendido: 2 tochas a Charity por ◉ 1» + cartão | ◉66 → 67, tochas 7 → 5 | «A moeda some no avental» | **concorda** |
| 54 | «devolvo o Livro dos Nomes a Mercy, já que ele ainda está comigo» | devolver, Mercy, livro, sim | «Você devolve O livro dos nomes a Mercy Quintus.» | livro saiu | «Você devolveu» | **concorda** |
| 55 | «dou três poções de mana pra Charity» (que não tenho) | **sem linha** (porta antiga) | «As poções de mana não estão com você — não há o que entregar.» | igual | nenhuma | **concorda** |
| 56 | «digo a Thomasine: "pago o dobro, se você me contar…"» | falar, Thomasine (condicional não virou troca) | nenhuma | igual | «O dobro não me serve de nada se eu não estiver viva» | **concorda** |
| 57 | «pago a sopa da Charity e deixo uma gorjeta pra Thomasine» | pagar, sopa | cartão «Pagar prato quente ◉3» | ◉67 → 64 | «Isso é demais para uma sopa… Thomasine agradece» (a gorjeta só em prosa) | (v) |
| 58 | «peço a poção de volta pra ela, se ainda não usou» | pedir, quem=**Tabitha** (ela=Lavinia), dado | «A poção não tem poção para dar.» | igual | Thomasine responde sobre «o que não devia ter saído daqui» | (i) |
| 59 | «troco uma tocha por uma caneca de cerveja, Charity» | escambo, tocha, **nao_vende** | «Charity Mordaunt não vende tocha.» (a oferta é minha) | igual | «Tocha não bebe e cerveja não ilumina» | (v) |

**Total de concordância: 12 de 40 (30%).** Por classe: (i) o sistema leu ou decidiu errado **13**; (ii) sem resposta **5**; (iii) a prosa negou ou contrariou o aplicado **4**; (iv) a prosa deu o que o sistema negou/não decidiu **3**; (v) detalhe trocado **3**. Os 12 concordantes: 8, 26, 28, 31, 32, 36, 37, 50, 51, 54, 55, 56. **Nas fáceis, o ouvido novo é bom** (comprar, vender «pra Charity», dar, pagar, devolver, furtar com dado, cobrar, condicional que não vira troca: as 12 concordantes são todas deste tipo). O que o derruba:
1. **A porta antiga ainda manda e roda antes (e às vezes sozinha).** Em 29, 30 (vender), 12 (furtar), 55 e 34 não há linha `[o ouvido]`. Em 35, 31 e 40 as **duas portas respondem** e se contradizem (linha «Você recolhe» seguida de «Não há poção aqui»; venda seguida de «Você não tem símbolo»; cartão de pagar mais pergunta «A quem?»).
2. **Pessoa errada** em frase com pronome ou primeiro nome só: «ela» virou Tabitha (58), «ele» virou Mordecai (19), «Mercy» virou «Mercy Ottoline» (4, 6, 7), e «A Âncora do Sul» (uma loja) virou quem (44).
3. **Direção invertida** de pedir/devolver/trocar (9, 14, 18, 59).

## 4. As perguntas numeradas

**Vieram 5** (frases 14, 15, 16, 24, 40; as três primeiras são a mesma pergunta repetida). **Eram a pergunta certa: 0 de 3 distintas.** «A quem você empresta a vassoura?» (era eu pedindo emprestado a Mordecai, que já estava na frase); «O que você faz com o Sais Aromáticos? 1. Comprar · 2. Pedir · 3. Furtar» (era uma ameaça de conversa, e o item não existe); «A quem você entrega as moedas?» com 5 opções, entre elas 3 lojas e Lavinia (a destinatária, Constance, estava ausente e o sistema não disse). 
- **Por nome:** 15 («Mordecai») **não fechou** (a frase foi acumulada, a pergunta voltou igual); 41 («Lavinia Sallow») fechou a pergunta mas o cartão antigo cobrou de novo.
- **Por número:** 16 («2») não fechou (3.ª pergunta idêntica); 25 («2») fechou e rolou a troca, mas era a troca errada.
- **A troca fechou depois: 2 de 5**, nas duas com resultado sem sentido (Persuasão 22 por um item inventado; duas moedas pagas a ninguém). **As perguntas custaram 6 frases** (14, 15, 16, 24, 25, 40, 41) e só a 17 («Deixa pra lá») tirou do laço — **o jogador sai da pergunta por frase nova, o que funcionou** (a pergunta pendente não acumulou com um assunto novo).

## 5. As negativas

**12 linhas de negativa** na tela (9, 12, 18, 20, 21, 32, 35, 44, 50, 55, 58, 59). **Um mestre real também negaria 5** (32, 50, 55, 59 por motivo plausível, 9 só o veredito), **7 não** (12, 18, 20, 21, 35, 44, 58: motivo errado, direção invertida, ou a prosa tinha oferecido o contrário um turno antes).

## 6. Silêncios (na 15: 17 de 60)

Frases sem resposta nenhuma do sistema (nem negativa, nem dado, nem pergunta): **8** (5, 22, 23, 43, 48, mais 29 e 30 pelo cartão morto e a 12 pela linha errada). Mais **3 frases de ato** sem marca (11 a mentira ao Mordecai sem dado, 45 a ofensa lida como Enganação, 52 a ajuda sem XP nem nota). Pela **mesma régua da 15** (silêncio + leu errado + negou o que um mestre aceitaria): **28 trocas + 3 atos = 31 de 60**, contra 17 de 60. Não é piora de motor puro: a 15 testou poucas frases de troca (o ouvido não existia) e aqui 40 de 60 foram troca de propósito; mas **em número absoluto de frases mal tratadas, subiu**.

## 7. Progressão e loot (na 15: 68 XP nos turnos 2–5 e zero depois; 2 ganhos reais)

- **XP em 10 pontos:** f1 0 · f3 17 · f4 34 · f7 68 · f10 68 · f20 68 · f30 68 · f33 68 · **f34 168** · f60 168. **168 XP**, todos fora de luta. Os 68 primeiros em 4 turnos seguidos (3, 4, 7×2, linhas «uma conversa que ficou» / «um lugar por onde você nunca tinha passado»); **os 100 seguintes vieram da quest cumprida** («O que «O Livro dos Nomes» deixa: +100 XP · +37 moedas»). Entre a 8 e a 33 foram 26 frases sem um ponto; depois do fechamento, 26 sem um ponto.
- **Níveis: 0** (nível 1 do começo ao fim, 168 XP). Escolha sentida de progressão: nenhuma.
- **Moeda (10 pontos):** f1 15 · f7 13 · f20 13 · f28 11 · f31 18 · f33 19 · f34 75 · f40 68 · f51 67 · f60 64. Gastei em 5 coisas (tochas, doação, sopa, 2 pagamentos a ninguém, mais as 18 do preço da falha e a 2 da frase 7); ◉64 ficaram paradas.
- **O que entrou na ficha, e de onde:** Poção de Cura Média (chão, depois do fim da quest; passei a Lavinia); duas tochas (comprei); o Livro dos Nomes (entrou na frase 33 como fim do passo 3; ficou 20 frases na bolsa depois de a prosa e o cartão o terem «devolvido», até a 54); ◉19 + ◉37 moedas (o texto do ◉19 apareceu duas vezes, é um cartão duplicado); título «Rosto Conhecido». **Ganhos reais: 3** (poção, +56 moedas, o livro) e a venda de um símbolo e duas tochas.
- **Preço da falha:** na 33 (Persuasão 15 contra 18), a falha cobrou ◉18 (a bolsa toda) **e** cumpriu o passo, com o texto do passo «Thaddeus Crane não negocia» — a prosa negou o que a ficha concedeu (iii).

## 8. Diálogo e eco

| personagem | falas | voz | desejo | saber | utilidade | total |
|---|---|---|---|---|---|---|
| Thaddeus Crane (sistema) | 6 | 2 | 2 | 1 | 2 | **7** |
| Eudora Ottoline (sistema) | 8 | 2 | 2 | 1 | 2 | **7** |
| Mercy Quintus | 7 | 2 | 2 | 1 | 1 | **6** |
| Mordecai (sistema) | 5 | 1 | 1 | 2 | 2 | **6** |
| Charity Mordaunt | 6 | 2 | 1 | 1 | 1 | **5** |
| a mulher do balcão (sem nome) | 3 | 1 | 1 | 0 | 1 | **3** |
| Thomasine Nightingale | 4 | 1 | 1 | 0 | 0 | **2** |
| Constance (sem corpo no sistema) | 3 | 1 | 0 | 1 | 0 | **2** |
| Lavinia Sallow (companheira) | 3 falas, 18 gestos | 1 | 0 | 0 | 0 | **1** |

**Os figurantes do sistema soam como gente, não como etiqueta**: Thaddeus, Mordecai e Eudora têm 3 a 8 falas, tiques próprios (a voz «úmida», a chave na corda do pescoço, a vassoura) e uma informação que a história usa. Falha em voz: «ergue o queixo» (Mordecai, 13), fala «Thomasine… a torre escuta antes de a gente subir» e a de Charity «Da torre ninguém fala quando os sinos param» são o mesmo aforismo vazio sobre a torre, em três bocas.

**Ecos dos 5 atos:** promessa (frases 10 e 33) → eco no mesmo turno nos dois (Eudora «se achar, me traga», Thaddeus «O livro não se negocia»); **o medalhão de cobre nunca mais voltou** (Eudora, sem fecho). Mentira (11) → imediato, bom (Mordecai desconfia do «sacristão do norte»). Presente (36) → imediato («Não era preciso», Lavinia). Ofensa (45) → imediato e estranho («Fique com as moedas, então. E me deve um favor.»). Ajuda (52) → **eco no turno seguinte**, o melhor (53: Charity revela «Subiu para consertar o sino e desceu sem ele»). **5 de 5 ecoaram no mesmo turno ou no seguinte; 0 voltaram 3 ou mais turnos depois, e 1 parcial** (a dívida da sopa «Amanhã a gente acerta»). Eco de sistema: **nenhum** (sem reputação, sem XP, sem linha) além das moedas.

## 9. O sistema na voz do Narrador, cortes, PT-PT

- **Voz do sistema dentro da cena: 3 turnos.** 42: «As moedas seguem na sua bolsa.» (a poda do conferente trocou uma frase de pagamento por esta, e ela **desmente a ficha**, que já tinha perdido 4 moedas); a linha «🔮 "Mercy, me empresta o alaúde…" — Não.» (50) cita a frase do jogador como se fosse a cena; e «Aqui ninguém vende baixo.» (20) é o catálogo lendo «por baixo do manto» como pechincha.
- **Texto estranho na tela: 4 ocorrências.** «música de canto» na abertura («Ouvir Mercy Quintus, a música de canto que apertava a mão forte demais») e como rótulo solto em outras 4 telas; **«sacerdote(isa)acólito»** como rótulo solto em 4 telas (12, 15, 33, 40); «Ponto valente» em minúscula (botões de horizonte); «O ela / O mulher não está aqui para comprar» nos cartões de venda. **«[…]»: 0.** Cortes de texto: 0.
- **PT-PT: 0 turnos** com «tu», ênclise ou vocabulário de Portugal no texto do sistema ou da prosa (varredura por regex nas 54 mensagens do Narrador). A expressão «Levo um recado, se quiser» (14) e «despenca» (39) são PT-BR.

## Os dez pontos em que um mestre de mesa bom teria feito diferente (por impacto)

1. **Frases 29, 30, 12, 55, 34: a porta antiga ainda roda antes do ouvido.** O jogo: 5 de 60 frases sem leitura do ouvido, 3 com dupla resposta contraditória (35, 31, 40), 2 cartões mortos (29, 30: «O mulher não está aqui»). O mestre: uma única porta. Impacto: 14 das 28 trocas falhas.
2. **Frases 14–16 e 24–25: a pergunta numerada pergunta a coisa errada e não fecha.** O jogo: 0 de 3 perguntas distintas eram a pergunta certa; «Sais Aromáticos» (item inventado), «A quem você empresta» (a direção invertida), 3 vezes a mesma pergunta; 6 frases gastas. O mestre: «O que você quer pedir emprestado?» ou, vendo Mordecai já nomeado, «Ele hesita; Persuasão?».
3. **Frases 41 e 45 em diante: a segunda quest nasce sem pessoa.** O jogo: «Ouvir Constance Mordaunt», 26 frases em 0 de 1, e o sistema só conhece Charity Mordaunt. O mestre: o nome do passo é o do elenco; ao fechar a quest 1, a Constance estaria na Lâmpada.
4. **Frases 33–36: o passo 3 cumpriu por uma falha, o livro entrou e saiu da ficha por conta própria.** O jogo: Persuasão 15 contra 18 falha → ◉18 e passo cumprido, livro na bolsa com a prosa dizendo «o livro não se negocia»; depois «devolvo a Mercy» (34) e o livro continua 20 frases na bolsa até eu digitar a 54. O mestre: se a falha cobra, a cena diz o preço pago e o que mudou de mão; devolver tira o objeto.
5. **Frases 13–19: o vilão está em «Em cena» e a prosa só o conhece quando eu o chamo; e não há botão para o poço.** O jogo: o quadro nomeou Thaddeus na 13, a prosa falou de Zipporah/viajante; só na 14 (por pergunta minha) Thaddeus aparece; sem «Ir ao poço» (17). O mestre: o Narrador faria Thaddeus entrar na cena do turno em que o quadro o nomeia.
6. **Frases 20, 19, 7: o sistema leu certo e não aplicou** (10 moedas ao Thaddeus, símbolo a Thaddeus: «aplicar», sem mudança de ficha) ou **aplicou o contrário da prosa** (7: «◉ −2» com a Mercy «sem tocar nas moedas»). O mestre: o que o jogador paga sai da bolsa uma vez, e a cena diz quem recebeu.
7. **Frases 11, 45, 22, 12b: dado fora de lugar e ausente.** Mentira a um NPC desconfiado sem dado (11), ofensa lida como Enganação com 23 contra 14 (45), «arranco o livro da mão dele» sem dado (22) — enquanto «ameaçar» foi lido como «pedir Sais Aromáticos» com dificuldade 22 (25). O mestre pede Enganação/Intimidação/Atletismo onde a cena os pede.
8. **Frase 12b: um cartão «Frente a frente» com uma «lenda» sem nome** (o texto do passo «quem lê o livro à noite») que a prosa nunca tocou e que passou com um d20 sem consequência. O mestre: se a lenda está lá, ela aparece depois; se não vai aparecer, o cartão não abre.
9. **Frases 28, 31, 51, 54: preço e prosa em dois mundos.** Tochas a ◉1 cada (28), vendidas a ◉0,5 (51), ração a ◉7 no cartão e ◉3 na boca da mulher (43, 44), que depois nega vender (44). O mestre: um preço e um dono do balcão (a «mulher do balcão» virou «A Âncora do Sul» e «Constance»).
10. **O fecho que funcionou, e que o resto não alcança:** na 33–34 o cartão «Decidir o que fica do livro» mostrou GANHA e CUSTA antes do clique (queimar / devolver / cópia de Tabitha) e a frase digitada («devolvo o livro a Mercy») foi casada com a carta. É o melhor momento da sessão: **o veredito antes do clique, escrito pelo sistema**; o ouvido deveria dar à troca a mesma clareza (ele a dá nas frases simples: as 12 concordantes).

## O que mudou frente à 15 (por número)

- **A quest mandou na cena:** o vilão veio do quadro (Thaddeus Crane em «Em cena» na 13, 6 falas), 0 nomes de vilão inventados pela prosa (na 15: o vilão, a cripta e a filha); prosa e botão concordaram em 2 frases e divergiram em 4.
- **A quest fechou: 1** (na 15: 0), com 2 cartas viradas (na 15: 0), 100 XP + 37 moedas e um cartão de desfecho com 3 caminhos. **A 2.ª quest não andou: 0 de 1 por 26 frases** (a 15 teve 53 turnos parados).
- **Perdido: 21 turnos** (na 15: 9).
- **Concordância das trocas: 12 de 40 (30%)** (nas sessões 9 a 14: 51% a 73%), e as 12 concordantes são todas de frase simples; as 28 falhas concentram pronome, direção invertida, ausente e a porta antiga.
- **Silêncios: 8 puros e 31 pela régua da 15** (na 15: 17 de 60).

## O que não verifiquei

Luta (não houve); subida de nível e o que ela dá (168 XP, nível 1); venda do loot além de 1 símbolo e 2 tochas; as habilidades de Monge e o grimório de Lavinia; a gaveta «Pessoas» e o Códex («▸ Códex — há o que registrar» apareceu na frase 12b e não foi aberto); as outras duas cartas do desfecho (queimar e a cópia de Tabitha); se a semente `77690` foi a mesma (a criação não mostra); o texto do prompt que o Narrador recebeu (só vi a prosa e o quadro, então não sei se o destino chegou ao Narrador na frase 13 ou se ele o ignorou); sensação visual (nenhuma captura); a mesma cena jogada com outra semente; o custo real em chamadas de IA.
