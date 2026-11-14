# A vigésima primeira sessão de prova — o feito chegou, o dado voltou à frase, e a quest continua parada (13/11/2026)

> **A régua:** confirmar ao jogar o que a v9.644 devolveu do que a 20.ª (`mente/sessao-20.md`) achou em falta. Método e formato da 20.ª, mais curto.

> **Campanha:** *Prova da Mesa XXI* · Uma Vida · Fantasia medieval · Terras abertas · **Jornada do Herói** · voz **Sombrio** · apresentação Clássica.
> **Herói:** Ilvara, mulher, **Elfa, Druida (Metamorfo), Herborista, Erudita de Arquivo** (Intelecto +2, Percepção +2, Presença +1, Vigor +1); 13 PV. Companheiro: Merek Ventoforte (mestre de ofício). Cidade: Rio do Sul. Quest de abertura (da biblioteca): *A Barca a Meio do Rio* — um homem tomou a barca com seis reféns e quer Eamon Barba-Ruiva no cais ao meio-dia; primeiro passo *«Chegar à Bota do Ocaso e ouvir Quorin»*. Fio da abertura: o que o Bastião Honesto guarda (pista: Helga o Silencioso, capitã da guarda). Primeira sessão com Elfa, Druida, Herborista, Erudita, Jornada do Herói e Sombrio.
> **Jogada por:** o `jogo`, na noite de 13/11 (02:26–02:44 UTC de 14/11), sobre **`v9.644`** (conferida no bundle publicado, `index-DCm__TAp.js`), no jogo publicado, no navegador do painel, campanha nova pela tela.
> **A amostra:** **28 respostas do Narrador + 1 do corretor (`leve`)**, todas HTTP 200; 27 jogadas, **todas fora da luta** (não houve luta); 4 sítios de Rio do Sul, 1 noite no quarto pago. Parei a 28 respostas e US$ 0,25, longe do teto (40 ou US$ 0,60), porque as sete perguntas já tinham resposta.
> **Como se mediu:** o gancho em `fetch` da 20.ª (hora, latência, `tarefa`, `uso`, pauta inteira), as pautas lidas na aba no próprio turno, e o save lido a meio e no fim. O `custo` do save diz **30 chamadas, US$ 0,25104**; o gancho viu 29 (a diferença é provavelmente o turno T9, que saiu pela reserva: o save pode contar a tentativa falhada).
> **O localStorage:** antes, só `taverna_cfg_golpe_final=perguntar` e `taverna_cfg_rolagens=1`. No fim recarreguei (ecrã inicial com «Continuar aventura»), apaguei só `taverna_save_v1` e `taverna_save_v1_sessao` e reconferi 4 s depois: restam as duas `taverna_cfg_*`, com os mesmos valores.

---

## 1. O custo

| | 20.ª | **21.ª** |
|---|---:|---:|
| respostas do Narrador | 47 | **28** (27 `gemini-3.8-flash`, 1 `deepseek-v4-pro`, a reserva, no T9) |
| outras chamadas | 0 | **1 `leve`** (o corretor de ofício, `gemini-3.5-flash-lite`, US$ 0,0007) |
| total | US$ 0,397 | **US$ 0,251** |
| por resposta | 0,0085 | **0,0090** (a escrita do cache do T1 pesa mais numa amostra curta) |
| latência mediana / máx. | 4,6 s / 10,5 s | **4,9 s / 10,7 s** (o máximo é o turno da reserva) |

O cache cobriu 58% da entrada (12.935 → 15.111 tokens por turno). Nada de novo no preço.

## 2. As sete perguntas

### 2.1 O feito é do sistema: **179 XP fora da luta** (a 20.ª: 0)

Em 27 jogadas sem espada, **11 feitos pagos, 2 travados pelo teto**, e todo XP saiu de facto do sistema:

| fonte | vezes | XP | quando |
|---|---:|---:|---|
| cidade nova (feito) | 1 | 60 | T1 — **Rio do Sul, a cidade onde a campanha começa** |
| sítio novo (pequeno) | 3 | 51 | a Bota do Ocaso (T3), o quarto de cima (T23), o Bastião (T27) |
| teste que passou (pequeno) | 2 | 34 | Percepção (T5), Saberes (T25) |
| primeira conversa (pequeno) | 2 | 34 | Saoirse (T7), Merek (T9) |
| passo de quest / segredo | 0 | 0 | nenhum passo andou (2.3) |

**O teto funciona:** no dia 1 o quarto pequeno caiu no T9; o Saberes do T11 (sucesso, 18 contra 15) e a forja do T14 não pagaram. No dia 2 o contador recomeçou. **Um por turno e sem repetir: cumprido.** O ritmo é ~15% de um nível em 27 jogadas — certo para quem ainda não lutou.

**Mas o jogador não lê o porquê.** O save guarda a frase em voz de mundo — *«✧ +60 XP — uma terra onde nunca tinhas posto o pé.»*, *«✧ +17 XP — uma conversa que ficou.»* — e o ecrã mostra só o chip **«+60 XP»**. A regra que a esconde é antiga e tinha razão quando o texto era do juiz (`src/glifos.js` ~781: *«o comentário do juiz ('um feito de verdade') é bastidor»*); agora esconde a melhor linha do turno. **Nome de mecanismo no ecrã: nenhum.**

Dois tiques: **a cidade de partida paga como terra nova** (o cabeçalho de `feito-do-sistema.js` diz que a ficha nova entra calada; a memória nasceu vazia em vez de ausente, e o livro pôs Rio do Sul a seguir), e **o sítio paga um turno depois** (cheguei à Bota no T2, o +17 veio no T3, colado a uma conversa que não tinha nada com ele).

### 2.2 O dado volta à frase: **6 d20 em 27 jogadas (um a cada 4,5)**, **6 de 6 nascidos da frase**

| | 19.ª | 20.ª | **21.ª** |
|---|---:|---:|---:|
| d20 fora da luta | 1/2,0 | 1/5,8 | **1/4,5** (mais 1 salvaguarda automática, a queda) |
| nascidos da frase | 41% | 6% | **100%** |
| perícias diferentes | 8 | 2 | **4**: Saberes 3, Percepção 1, Atletismo 1, Persuasão 1 |
| sucessos | 10 | 1 | **3, todos com facto do sistema** |

**As frases que falhavam na 20.ª:**
- *«O que é que eu sei de Eamon Barba-Ruiva?»* (T1) → **Saberes 13** ✓; e *«O que é que eu sei do Bastião Honesto?»* (T25) → Saberes 13, sucesso com facto (*«guarnição, onde está Helga o Silencioso… Yorick Passo-de-Gato»*).
- *«procuro com os olhos nesta sala, debaixo das mesas e atrás do balcão»* (T5) → **Percepção 13** ✓.
- *«Conheço este selo?»* (T11) → **Saberes 15** ✓, com um custo de falha bem escrito (*«o símbolo não diz nada, ou diz errado»*).
- *«Não arrombo a porta dos fundos da casa dela»* (T6) → **nenhum dado** ✓.
- *«trepo pela janela alta»* (T19) → Atletismo 15, falha, queda de 5 m (2d6), salvaguarda, −4 PV: a melhor jogada mecânica da sessão.

**As que ainda não têm dado:**
- *«Tateio em volta da bigorna… à procura do que o Eamon deixou para trás»* (T15) → virou **PROCURA de Eamon** (*«ESTÁ AQUI»*), sem Percepção: o nome próprio ganha ao verbo.
- *«Tento convencê-lo»* (T13, aos gritos para a barca) → também PROCURA de Eamon, por *«O Eamon não vem»*.
- *«procuro neste quarto, debaixo das tábuas soltas e atrás da cama»* (T24) → **nenhum envelope**, nem dado nem «já procuraste». É o T13 da 20.ª outra vez, agora num sítio novo (o quarto fica dentro da Bota, onde a busca do T5 passou).

**Duas caras para o mesmo dado:** a Persuasão (T27) veio por outro caminho (`SOCIAL — RESOLVIDO PELO SISTEMA`) e com outra forma — *«Teste de Persuasão · dif. 14 — convencer · +1»*, *«Não era isso»*, depois um ecrã *«Refazer · 1 ponto / Continuar →»* — onde a bandeja diz *«Rolar d20 + 7 / precisa de 13 / Mudar de ideia»*. E o alvo estava errado: *«convencer a capitã»*, quando eu pedia ao recruta que me levasse a ela.

### 2.3 A quest anda: **0 passos em 28 respostas**

**A casa existe, e o Diário diz onde:** o papel tem `local: "A Bota do Ocaso"`; o Diário mostra *«O PRÓXIMO PASSO — Chegar à Bota do Ocaso e ouvir Quorin · falar com Quorin»*. Isso a v9.644 resolveu.

**E mesmo assim o passo não fecha.** Passei **nove turnos na Bota** (T2–T13, T20–T23) e falei com Quorin **cinco vezes** pelo nome (*«Falo com Quorin. — Esse losango…»*, T10). **Quorin nunca entrou em EM CENA** (que teve Merek e, colados, Aldric e Quilla), nunca foi para o registo de gente nem para o livro (`factos.pessoas`: só Merek e Saoirse), e a pauta repetiu *«falta falar com Quorin»* com ela a responder-me na prosa. O mesmo com Eamon na forja (*«Procurei Eamon… ESTÁ AQUI»*, e EM CENA sem ele) e com Helga no Bastião (a pista da abertura, *«encontra-se no Bastião Honesto»*, e EM CENA vazio).
*Hipótese (lida no código, não provada):* `aPessoaDoPasso` só é lida por `motor/ficha-de-ator.js` (o modo `ator`), por `a-pista-como-cartao.js` e pela proposta do App (~25855); a pauta do modo publicado monta EM CENA por outro caminho, e a pessoa do passo não chega lá.

**E sem a pessoa na ficha o Narrador contradiz a quest:** Quorin é o papel `parente` de Eamon, e diz *«O que sou dele? Nada»* (T4) e *«Cuspo longe antes de chamar aquilo de sangue meu»* (T6).

**«Quem se encontra aparece no lugar do passo» — joguei, e não faz sentido.** O papel `cais` desta quest é **a Bota do Ocaso** (uma taverna). A barca grita *«para A Bota do Ocaso»*, o cais não existe como sítio, *«Volto ao cais com o Merek»* (T12) não teve proposta nem envelope, o Narrador levou-me ao cais na prosa, e no turno seguinte o sistema desmentiu-o: *«Seu grito morre no salão úmido da Bota do Ocaso. Não há proa aqui»*. A cena central da quest — os reféns — não tem chão onde se pisar. E o relógio dela calou: *«vai um à água por cada hora»* ao meio-dia do dia 1, e acordei no dia 2 às 07:00 sem nada ter acontecido.

### 2.4 O veto do inventado: **não disparou (1 oportunidade)**; inventado no save: **0**

No T8 um garoto *«vem reto até você e estende uma tira de couro»*; a pauta do T9 não trouxe linha nenhuma *«pôr em jogo…»*. O Narrador resolveu sozinho (no T9 *«joga a tira de couro na mesa»*, e Quorin apanha-a). **No save: inventário só com o *Caderno de anotações cifradas*, cânone vazio, gente só Merek e Saoirse.** Uma amostra só, mas o «estende» sem clítico continua a não contar (a mesma forma do frasco da 20.ª).

### 2.5 A pauta e a «coisa com nome»: **o RUMO está curado, o MUNDO SE MEXE não**

- O sinal do RUMO diz agora *«o que lá se esconde não tem nome nem forma até ser achado (não lhe dê nenhum)»* (T7, T13, T14, T26), e o Narrador obedeceu (*«o que ninguém pode nomear»*).
- Quem vem ter com o herói traz vontade, não recado: *«ouviu que o herói perguntava, e tem pressa — mais alguém o procura»* (T16, Helga). Ela veio sem recado inventado.
- **Mas no T8 o envelope `O MUNDO SE MEXE` diz *«este fio JÁ EXISTE no jogo — o sistema o escolheu»* e o fio é *«o que já se comenta por aqui»*** — nenhum. O Narrador encheu-o: um capitão, *«a caixa que tiraram de—»*, e a tira de couro de 2.4. No T18 o mesmo envelope nomeou o fio (*«Ogro o Segundo Sol»*) e correu bem. *Arquivo:* `src/oraculo.js` ~717 (`${mv.diz}: ${mv.fio}`) e a escolha do fio no App (~20103): sem fio com nome, o envelope não devia sair.

### 2.6 A escuta: **as duas da 20.ª corrigidas**, uma nova

- *«o que é que o Bastião Honesto guarda?»* (T7, T17) → NÃO PODE *«revelar o que O Bastião Honesto esconde»*, sem pergunta sobre a guarda ✓.
- *«quero passar pelo templo desta cidade e acender uma vela»* (T8) → sem «quem cura» ✓.
- **Nova:** *«casa»* no sentido de prédio vira a família nobre: *«porque ele grita para esta casa»* (T3) e *«já o viste antes nesta casa?»* (T10) → `PERGUNTOU Casa Ventoforte (4 na família)`. E *«O Eamon não vem ao meio-dia!»* (T13) virou procura, com *«ESTÁ AQUI (A Casa do Martelo do Cavalo)»* estando eu na Bota.

### 2.7 Os restos da 20.ª

- **DESTINO NÃO RECONHECIDO:** não apareceu; as quatro idas a sítios com nome tiveram proposta com o tempo. Só *«o cais»*, que não é sítio, ficou mudo (2.3).
- **Clérigo sem deus:** não joguei clérigo; a druida também tem `divindade.patrono = ""`.
- **O compasso que corre sozinho:** sem romance; o que correu foi o treino de Aldric e Quilla, PREPARAÇÃO (T7) → APERTA (T12) → A UM PASSO (T16) → AGORA (T17, *«o treino vira briga de verdade»*), sem gesto meu — numa dupla que me segue de sítio em sítio.
- **A promessa:** *«Prometo-te que tiro os reféns daquela barca antes do meio-dia»* (T18) entrou no caderno e foi cobrada no **T22** (quatro turnos depois, não no seguinte) — melhor. Mas `quem: ""`: Helga não está no registo, e a cobrança caiu num quarto sem ela.
- **O quarto da estalagem:** **meio corrigido.** O pagamento tem veredito antes do clique (*«e pagar quarto comum, prato quente (◉ 9)»*) e debita 15 → 6. Mas dormir ainda é *«⛺ Você monta acampamento dentro do quarto de cima — sob algum teto»*, e comeu as rações (10 → 7, uma embolorada) e a água (10 → 8) de um quarto pago. E o ecrã da noite abriu às **09:53** com *«A lenha estala. Ninguém tem pressa de dormir.»*

## 3. Os defeitos, por gravidade

### Graves

1. **A pessoa do passo tem casa e não entra em cena.** Quorin, na Bota, nove turnos e cinco falas; Eamon na forja; Helga no Bastião. O passo 1 não fecha, o Narrador nega o parentesco que a quest lhe dá. *Arquivo provável:* a montagem de EM CENA da pauta do modo publicado (`src/escuta.js` / App) não consome `src/motor/a-pessoa-do-passo.js`, que hoje só chega a `ficha-de-ator.js`; e o `falou` do livro (`registo-da-cena.js`) depende de a pessoa estar na ficha.
2. **O papel de lugar da quest cai num sítio que não é o que a quest diz.** O `cais` de *A Barca a Meio do Rio* é a Bota do Ocaso; o cais não existe, *«Volto ao cais»* não tem resposta, e a prosa e o estado separam-se (T12–T13). O relógio dos reféns passou sem consequência. *Arquivo provável:* `src/esqueleto.js` (`casaDe`, o papel `tipo: "lugar"` resolvido para `Rio do Sul|taverna`) e o texto da quest em `src/biblioteca-de-quests.js`.

### Médios

3. **O porquê do feito não chega ao ecrã** (2.1): a regra de `src/glifos.js` ~781 esconde a linha *«✧ +N XP — …»*; o chip diz só «+17 XP». Com a frase de mundo, a regra perdeu a razão.
4. **`O MUNDO SE MEXE` sem fio com nome** manda trazer «um fio que já existe» e não diz qual (T8) → invenção. `src/oraculo.js` ~717.
5. **Procurar ainda cala às vezes** (T24: nem dado nem «já procuraste»), e o nome próprio rouba o verbo (T13 persuadir, T15 tatear → PROCURA de Eamon). `src/desafios.js` (`chaveDaTentativa`) e a ordem da escuta (procura antes do desafio).
6. **A Persuasão tem outra cara e outro alvo** (2.2): carta social com «Não era isso» e ecrã de Refazer, contra a bandeja; *«convencer a capitã»* com a capitã ausente. Uma ação, duas formas.
7. **O corretor de ofício lê particípio como cargo** e põe bastidor na prosa: *«Saoirse, olhando por cima do seu ombro»* foi tomado por cargo, e o `leve` reescreveu *«murmura a copista que copiou o texto proibido, do passado de Ilvara»* (T9). `src/portao.js` ~356.
8. **O quarto pago dorme como acampamento** e gasta mantimentos; a noite abre às 09:53 com lenha a estalar.
9. **O elenco cola-se:** Aldric o Manco e Quilla Lâmina-Rápida EM CENA no portão, na Bota, na forja e de volta na Bota (T1–T20); Neirin e Ursa Ventoforte no meu quarto fechado e no Bastião.
10. **«casa» (prédio) vira Casa nobre** na escuta (2.6). Provável `src/cidade-por-dentro.js`, a mesma tabela de perguntas da 20.ª.

### Leves

11. **A cidade de partida paga 60 XP como terra nova**, e o sítio paga um turno depois de se chegar (2.1). `src/feito-do-sistema.js` (memória vazia ≠ ausente) e a ordem livro → feito em `motor/aplicar.js` ~388.
12. **Vozes e géneros trocados:** o bordão do Ogro (*«Pela minha bota esquerda»*) na boca de Merek (T19); Yorick Voz-Grave («ele») narrado como *«uma elfa de túnica escura»* (T26); a própria pauta diz de Merek *«o que ela quer»*, *«do ofício dela»* (T24, T27). Eamon chama-me *«Folha-Ligeira»* duas vezes, nome que não tenho.
13. **O envelope da compra** diz *«Os mantimentos já estão na minha mochila»* de um quarto e uma sopa (defeito 12 da 20.ª, de pé).
14. **Dois Yorick à lareira** (Voz-Grave e Passo-de-Gato); *«A APOSTA: escalar a muralha na chuva»* para uma janela de forja (T19, na pauta).
15. **O Narrador impõe consequência que ninguém pediu:** Helga *«gira a chave por fora e deixa você trancada»* na forja (T18).

## 4. O veredito

**A v9.644 devolveu duas das três coisas.** O herói voltou a subir fora da luta — 179 XP em 27 jogadas, cada um saído de um facto que o sistema escreveu, com teto que trava e sem nome de mecanismo à vista. E o dado voltou à frase: seis em seis nasceram do que eu escrevi, *«O que é que eu sei de…»* e *«Conheço este selo?»* rolam outra vez, a negação ficou calada, e os três sucessos trouxeram facto em vez de invenção.

**A terceira não: a quest continua parada no primeiro passo.** A pessoa tem casa e o Diário diz onde, mas eu estive lá nove turnos a falar com ela e a ficha nunca a pôs à mesa. E a quest que me calhou mostra o outro lado da mesma falha: o cais dos reféns é uma taverna, e a cena que justificava a campanha não tem onde acontecer.

**Joguei, e é mais jogo que a 20.ª** — rolei de quatro em quatro jogadas, vi o XP subir pelo que fiz, caí de uma janela e senti a queda. **Mas ainda não é história:** em 28 respostas nenhuma porta da quest se abriu, e o que andou foi um treino entre dois estranhos que me seguem pela cidade.

**A proposta para a pessoa (ambiciosa):** o feito é o laço de recompensa mais barato que o jogo tem, e hoje esconde a melhor parte. Proponho que o chip do recibo leve a frase do mundo (*«+17 XP · uma conversa que ficou»*) e que o feito de grau `feito`/`marco` tenha um momento próprio — uma linha que se acende na página e assenta, com saída e `prefers-reduced-motion` — para o jogador **saber** que aquele gesto contou. É forma nova: nasce com o `desenho`, no Figma, antes do código.

## 5. O que corrigir primeiro

1. **A pessoa do passo na EM CENA da pauta publicada** (defeito 1). Sem isto nenhuma quest de «ouvir alguém» anda, com casa ou sem ela.
2. **O papel `lugar` da quest resolvido para o sítio que a quest nomeia**, ou a quest a nomear o sítio que existe (defeito 2); e o relógio dos reféns a cobrar.
3. **A linha do feito no ecrã** (defeito 3) — uma regra de `glifos.js`.
4. **`O MUNDO SE MEXE` só com fio nomeado** (defeito 4).
