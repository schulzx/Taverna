# MM11 · a sétima sessão de prova — transcrição

> **Campanha:** *Prova da Mesa VII* · Uma Vida · Fantasia medieval · Terras abertas · Jornada do Herói · voz por omissão
> **Herói:** Dornel Cinzabrasa — homem, Draconato, Bardo (Menestrel), Cozinheiro, Artista Itinerante. Presença +4 · Força +2 · Percepção +2 ·
> Destreza +1; 10 PV, 15 moedas, treinado em Persuasão, Enganação, Atuação, Intuição, Saberes. Conceito: *bardo que canta para pagar a dívida
> de um incêndio que ele não começou*. É a primeira sessão de **Bardo**, de **Draconato**, de **Cozinheiro** e de **Artista Itinerante** (a 6.ª foi
> Maga/Gnomo/Erudito; a 4.ª, Bruxo; a 5.ª, Clérigo) — e a primeira com **o coração da campanha** (C0, C1, C2, C6: v9.407 a v9.416).
> **Companheiro de antes:** Jaco Faro — Feiticeiro, 12 PV, "mestre de ofício", laço *aprendizado* força 2, no grupo desde o turno 1.
> **Respostas do Mestre: 71** (71 de cena, **0 de luta** — `combate` foi `null` do princípio ao fim —, mais o Léxico na criação). Quase cinco dias de
> jogo: 1 de Brumal 08:00 → 6 de Brumal 07:20. **Nenhuma chamada falhou** (149 chamadas, todas HTTP 200; nenhum 402; foi tudo pelo DeepSeek).
> A sessão **não acabou numa derrota nem num marco**: parei de propósito, na estrada, depois de quatro respostas de empaque, com Jaco a
> dizer *"Por causa de uma criança que não é sua."*
> **Jogada por:** o `tester`, a 11/10, sobre `v9.416` (`6fa0e59`), navegador do painel, **800×451** (a roda e a soleira) e **467×851** (a fogueira
> no telefone), campanha nova criada pela tela, ~1 h 20 de relógio.
> **Como se conferiu:** um gancho em `fetch` mandou **toda** chamada a `/api/*` (hora, endereço, pedido inteiro e resposta) a um servidor local
> que guardou um JSONL no scratchpad (`s7/registo-s7.jsonl`, 149 chamadas + 2 fotografias do save). Cada resposta foi lida contra a pauta desse
> turno por script (`t7.cjs`, `tab7.cjs`, `quem.cjs`; só as linhas de que se precisou) e contra o save. O **núcleo** foi recalculado fora do
> jogo, com a mesma `nucleoDaCampanha` e o save (`nuc.mjs`), para saber quem era o elo **sem o jogador o saber**. O localStorage foi lido antes
> (`taverna_cfg_golpe_final=perguntar`, `taverna_cfg_rolagens=1`) e, no fim, **com o jogo desmontado** (pelo "Sair para o início"), apagou-se
> só a chave que a sessão criou — `taverna_save_v1`, 396.720 caracteres —, e as duas de antes ficaram com os mesmos valores, por leitura.
> **Medida de passagem:** ao fim, `npcs` = 10 (**o herói não é NPC**; Hilda, Tônia, Pregado, Marlo sem gênero; "Dário" — o morto — como gente viva),
> `canone` = 10, `prometido` = **15** (12 cobradas, 3 abertas, **0 pagas**), `coracao.arcos` = 4 (Tônia, Hilda, Jaco, Lia), o Livro com **2 sementes do elo
> maduras e 0 pagas**, `reviravolta` e `reviravoltaMaior` = **null**, a espinha com **2 de 4 marcos do ato 0 feitos e 0 nos outros** (nenhum fora
> de ordem), duas missões "concluídas" (**uma delas, de uma viagem que o jogador não fez**), `relogios` = 1, laços: Jaco *aprendizado/2*, Tônia *amor/1*.

Convenção: a das seis primeiras. **J** é o que o jogador escreveu (ou tocou). **M** é o Mestre, encurtado com "…" e nunca reescrito; o número
é o da resposta (M1–M71, pela ordem das chamadas ao Narrador). `SISTEMA` são as linhas da tela que não são do Mestre. À margem, em *itálico*, o
que se provou ou partiu. Os cliques (Aceitar, Perguntar porquê, Sentar-se, Dormir, a decisão) aparecem como **[toque]**.

---

## Parte 1 — a chegada, o Píer Rachado e o regimento (M1–M9)

**M1** (abertura) — *"O cheiro de salmoura e peixe defumado entra pelo portão antes de você… É a regra daqui: salvo-conduto, selo e nome… Você lembra do
homem que te devia a vida. Antes de morrer, ele pediu: 'Vai a Quebrado do Leste. Procura Tônia Lodoso.' E uma das suas canções fala disso, sem dizer
o nome… Jaco: 'Cê acha que a Frida ainda tá viva, Dornel?'"* — *o gancho usa o antecedente (a canção é do **artista**); o sistema mandou `QUEM É Jaco Faro (voz do
Jaco: diz os números exatos)` e o Mestre **não** a honrou (Jaco fala sem número nenhum).*
**M2** J *Como se chega ao Píer Rachado daqui, e quanto tempo leva a pé?* → o vigia: *"meia hora de perna se não parar pra mijar"*. *`jornada` = null, relógio parado em 08:00:
**a pergunta não abriu viagem** (regressão 1 da 6.ª: passou).*
**M3** J *Pego o alaúde e sigo com Jaco pela ladeira do sal até o Píer Rachado* → *"Frida do Mar esfrega canecas… 'Sou eu. Fala.' E é nesse instante que **Tônia Lodoso**
aparece da cozinha com uma bandeja de pão, puxa você pelo braço… com a voz baixa e cheia de fome, pede: 'Se alguém do regimento perguntar, você nunca me viu.'"*
— *a pauta trazia `QUEM CARREGA Tônia Lodoso (é fato: entra nesta resposta, dito por ela): PEDE ao herói: "…" (voz da Tônia: põe comida em toda a metáfora)` e o Mestre **disse-o,
com o pedido palavra por palavra e o tique (a bandeja de pão, a fome), na mesma resposta**. A soleira passou a mostrar **Aceitar / Recusar o que Tônia pede · 5 min**.
SISTEMA: `Encontrar Frida do Mar ✓ (1/2) → agora: Procurar Tônia Lodoso no Peixe Cego, em Sul Molhado` — **a pessoa que o marco manda procurar a quatro horas está, nesta resposta,
na cozinha.***
**M4** J *Pergunto a Frida se conhece Tônia, e de onde vem a canção* → *"Conheço a Tônia. Ela anda por aí de vez em quando… Pergunta pra ela."* — *Tônia acabou de puxar o herói pelo braço,
uma resposta antes. Entra um "homem de capa de chuva" que "deixou um papel no mural": SISTEMA `Otto tem um trabalho no mural` **e** `homem de capa de chuva tem um trabalho no mural`
(o mesmo homem, duas vezes, um deles pelo descritor).*
**M5** J *toco baixinho a canção para Tônia* → *"'Merda,' sussurra, e a voz é de **sopa fria** na boca de quem tem fome. 'Onde você aprendeu isso?'"* — *o tique virou imagem, não frase.*
**M6** J *Digo a verdade: aprendi com um homem que me devia a vida…* → Tônia: *"jurei um favor pra quem paga com comida… A canção que ele te deu não era dele. Era de outro… atrás do
balcão de um bar que não existe mais"*; entra **"Frida da Vela"** — *a pauta mandou `QUEM É Frida da Vela` (o **núcleo**), a serviçal do Píer já se chamava **Frida do Mar** (a espinha): duas Fridas.*
**M7** J *Respondo a Frida: vou, sim. E pergunto a Tônia o nome do bar* → *"O Peixe Cego, em Sul Molhado. O velho chamavam de Ambrósio… cantava de olho fechado e cobrava em peixe defumado."*
**M8** J *Peço duas canecas, uma para mim e uma para Jaco. Quanto é?* → *"Dois cobres."* — **M9** J *Pago os dois cobres.* → SISTEMA `◉ −2 moedas` (**15 → 13**: *"quanto é?" → "pago" debita*, regressão 5: passou);
Jaco: *"Três dobradiças da porta da frente tão comendo o batente… Duas oficinas brigando pelo mesmo ferro"* (o tique, bem). *Vaza o `O FECHO`: "A consequência é essa: a casa agora tem olhos."*

## Parte 2 — a estrada que o jogo andou e a que o herói andou (M10–M24)

**M10** J *Como se chega ao Peixe Cego, em Sul Molhado, e quanto tempo leva até lá?* → Tônia: *"uns onze quilômetros por um caminho litorâneo. A pé, dá umas quatro horas se não chover"* — *a pauta:
`PERGUNTOU distância: Sul Molhado (a sudeste, 11 km, 4 h de marcha)`. **Do sistema.** `jornada` = null (regressão 1: passou, 2 de 2).*
**M11** J *Termino a cerveja… saio com Jaco do Píer Rachado, seguindo a pé pelo caminho litorâneo para Sul Molhado.* → SISTEMA `Navegação em costa: d20+2 = 19 vs 5` · `Fim da estrada: depois de **0.5 dias de marcha e 20 km**, você
chega a Sul Molhado` · **`Você está na estalagem do caminho — 72 min de caminhada desde Sul Molhado`**. *Relógio 08:35 → 13:47. A mesma rota, 11 km/4 h no M10 e 20 km/0.5 d aqui.* M: um pescador morto
na enseada, **"Oito cobres escorrem para a palma dele [Jaco]"**; um assobio, *"Dornel? Você não me conhece, mas eu conhecia o Ambrósio."* — SISTEMA ao fim: **`◉ +8 moedas` — para o herói**; a prosa deu os cobres a Jaco.
**M12–M14** Pregado: *"Me chamam de Pregado… eu sei onde ele está. Mas não é de graça."* → *"Cinco cobres."* → J *Pago os cinco cobres.* → *"Pregado pega as cinco, uma a uma…"* — *`◉ 21 → 21`: **pagar uma pessoa
por uma informação não debita** (a bolsa só sabe de balcão).*
**M15** J *Sigo com Pregado até o Peixe Cego e procuro Ambrósio* → SISTEMA `Ambrósio está aqui — a estalagem do caminho` · `Você está no Peixe Cego` — *moveu primeiro, narrou depois (regressão 8c da 6.ª: passou).*
**M16** J *toco o primeiro verso a Ambrósio* → *"Eu não ensinei. Eu só guardei… Mas ela me levou a você, não o contrário."* — **M17** J *procuro Tônia no salão* → Ambrósio: *"Faz dez minutos que saiu pela porta do fundo. **Deixou a tigela de caldo meio cheia e a colher torta.**"*
— *a pauta (O RUMO) dizia "falar com Tônia Lodoso, **que está aqui**"; o Mestre obedeceu sem a pôr em cena, e a **comida da Tônia** ficou como rasto: o tique serviu a história.*
**M18** J *corro pela porta do fundo* → Tônia, num beco: *"Não era para você me achar assim."* Jaco: *"Tem dois carregando tocha na ladeira do porto."*
**M19** J *Seguro Tônia pelo ombro… 'Quem vieram buscar, Tônia? Você ou eu?'* → *"Vieram me buscar. Sempre vêm. Mas agora também sabem que você anda comigo, e isso é pior… Então decide logo."* — SISTEMA `Encontrar Tônia Lodoso ✓ (2/2)` ·
`★ MISSÃO CONCLUÍDA: O rasto de Tônia Lodoso — +81 moedas · +128 XP` · `Reforçado Porrete de madeira`. *O marco fechou **pelo fato** (a conversa, no Peixe Cego); as seis respostas de conversa com Tônia no Píer Rachado (M3–M9) **não** o fecharam
(regressão 3: passou, e **só fechou 2 marcos, nenhum fora de ordem**).*
**M20** J *Mando Tônia ficar atrás de mim. Avanço com Jaco e ataco o homem da tocha.* → *"A ladeira está vazia. Só as tochas fincadas nas argolas… 'Dornel… você tem um plano? Porque eu só tenho pernas.'"* — *o ameaçador que Jaco mostrou **evaporou**; o ataque
não abriu luta.* **M21** J *meu plano é ouvir tudo… a quem ela jurou* → *"Eu jurei pra uma mulher que não usa nome… os homens da tocha não são dela. São de quem quer a canção — e queima quem canta."*
**M22** J *voltamos ao Peixe Cego. Quanto custa um quarto com três camas?* → **Hilda, "o taverneiro"**: *"Fica três cobres a noite"* — *a pauta: `PERGUNTOU pouso: quarto comum ◉ 3 a noite` (**sistema**); mas Hilda (elenco: "taverneiro(a)", e **mulher** no núcleo) é "ele" na prosa.*
**M23** J *Pago os três cobres* → `◉ −3` (102 → 99). **M24** J *Sento na beira da cama e peço a Tônia que me conte tudo desde o começo* → *"O homem se chamava **Dário**… remador do Píer Rachado… Quem queima quem canta é a Ordem da Coroa."* (inventado) — *a pauta mandou
`QUEM CARREGA Hilda: PEDE… "Leve esta carta a Sal Morto"`; **Hilda está lá embaixo, o Mestre não a diz** (o pedido ficou para a resposta M26, duas respostas depois).*

## Parte 3 — o pedido, a fogueira e a manhã (M25–M35)

**M25 [toque]** *Perguntar a Tônia Lodoso porquê* → *"Porque eu era nova demais quando jurei… Eu quero sair. Mas sair custa. Pra quem sai, e pra quem ajuda."* — *o porquê é a ficha na voz dela, em fala direta, sem etiqueta: **do sistema** (`quer ver-se livre de um juramento`).*
**M26** J *vou até Hilda no balcão* → *"Hilda ri antes de terminar a frase: — Dornel. Sempre volta pro balcão, como todo bom devedor… Eu queria te pedir uma coisa. Mas custa… Leve esta carta a Sal Morto."* — *os dois tiques da Hilda (a **ri antes**, **pergunta o preço**) e o pedido da pauta,
um turno depois de a pauta o mandar.* SISTEMA `📋 Hilda tem um trabalho no mural` — **e a soleira passa a ter duas formas para o mesmo pedido: "Aceitar o que Hilda pede" e "Aceitar: A carta para Sal Morto · +59 XP" (o mural).**
**M27 [toque]** *Aceitar o que Hilda pede* → *"Hilda pega o envelope de volta e o guarda no bolso do avental… **Não preciso que você aceite agora. O papel está no mural, se um dia quiser.**"* — *a resposta do jogador foi `aceitou` no save;
a pauta daquele turno trazia **duas ordens contrárias**: `[RESPOSTA A Hilda — DADA POR MIM] Eu aceito o que Hilda me pede. Narre só a reação…` e o bloco antigo do mural, `NÃO ofereça o trabalho a mim… o papel está no mural`. O Mestre obedeceu à antiga.*
**M28** (o campo, ao tocar no relógio → *Montar acampamento*) — *o painel diz: `Descanso longo · custa uma noite inteira · 2 rações e 2 águas · devolve PV e PM cheios · metade dos dados de vida · **uma conversa à fogueira**`.*
**[toque]** *Descanso longo* → a roda abre: **«A noite · numa estalagem em Sul Molhado — A lenha estala. Ninguém tem pressa de dormir. Com quem você se senta esta noite?»** — **Jaco Faro** *conta moedas que não chegam* · **Tônia Lodoso** *atiça o fogo sem precisar* ·
**Hilda** *passa o dedo por um nome gravado numa tábua* · **Dormir já** *a noite passa em silêncio*.
**M29 [toque]** *Jaco Faro* → *"Dez anos atrás, uma carta me procurou. Não respondi. E até hoje ela fica na minha cabeça, dizendo o que eu devia ter dito. … Você tem um favor da Tônia na sua mão agora. Eu tenho uma carta na minha faz dez anos. A gente carrega coisa que não escolheu, Dornel."* —
*`QUEM CARREGA Jaco Faro (… à volta do fogo): conta a dívida que carrega: deve uma resposta a uma carta com dez anos`; honrada, com o número ("dez anos") e ligada ao que acabou de acontecer.*
**M30** J (escrito, com a roda aberta) *Pergunto a Jaco quem lhe escreveu a carta e se ele ainda sabe dizer de cor* → *"Não sei quem mandou. O papel chegou molhado de sal… Cada palavra. **'Ou você volta, ou leva a culpa. Não há terceiro caminho.'** Dez anos, e eu ainda não escolhi."* *(a fogueira ficou; foi a melhor fala da sessão).*
**M31 [toque]** *Dormir* → manhã de 2 de Brumal, 07:00: *ladrilho «Ficou com você, da noite, o que Jaco Faro contou ao pé do fogo.»* + `uma noite inteira · PV e PM cheios · metade dos dados de vida` · *fazedor de caldos: +3 PV* · `Comida acabou — 2 bocas passam fome hoje` · `Água acabou`; M: Jaco, na porta: *"Nesta cidade não diga o meu nome. Nenhum dos dois."* (o pedido do Jaco, na manhã, **do sistema**).
**M32** J *vou à Rua do Sal ver o mercado; preciso comprar comida* → *"Quem vende comida de verdade se chama **Bento** — diz Tônia… Responde com pergunta, mas a farinha dele não tem gorgulho."* — *Bento é o marco do ato 1 ("Encontrar Bento Pescador, Rua do Sal"): o Mestre o pôs em cena, certo.* **M33** J *pergunto quanto custa uma maçã* → *Bento: "A maçã custa o que você tem de mais bonito na mochila. Vai comer aqui ou levar para a estrada?"* — *a pauta: **`PERGUNTOU não há maca à venda em Sul Molhado; armas à venda: Cimitarra ◉ 12`** — "maçã" ainda é lida como "maca".*
**M34** J *Compro três maçãs e duas rações, e pago agora* → *"Bento apanha duas maçãs… põe as três numa folha de couro… duas rações de peixe seco e farinha"* — `◉ 99 → 93`, `suprimentos.racoes 0 → 2`; **maçãs no inventário: 0**; SISTEMA não escreveu recibo.

## Parte 4 — Quebrado do Leste, Lia e as duas pistas (M35–M49)

**M35** J *dou uma maçã a cada um… saímos de Sul Molhado de volta pelo caminho litorâneo* → SISTEMA `Fim da estrada: depois de 0.5 dias de marcha e 20 km…` · `✦ **A palavra dada a Jaco Faro** — entrou no diário` (*o jogador nunca deu palavra a Jaco*); M: Tônia *"come a maçã devagar"* (comida, outra vez); Jaco para numa pedra: *"Essa marca é de carta que não chegou"* (a carta de Jaco **volta** como objeto: `O QUE VOLTA`).
**M36** J *entramos em Quebrado do Leste… vou direto ao Píer Norte, procurar Lia Cinzela* → *"No fim da rua, o Píer Norte aparece… Lia Cinzela está na ponta, de costas."* **M37** J *caminho sozinho pela madeira molhada… ouvir o que ela faz* → *"— Então vocês vieram. Os três."*
**M38** J *digo meu nome e canto o primeiro verso. Pergunto se ela a conhece* → Lia: *"não fui eu que a ensinei. Eu só guardo o que ela aponta… Mas antes: quem te ensinou o primeiro verso?"* — *o núcleo diz que **Lia é "quem ensinou a canção ao herói"** (o elo); o Mestre não o sabe e a nega — ainda é cedo (`ATO_DA_REVELACAO`).*
**M39** J *este é Jaco Faro. Fico olhando a cara dos dois* → Lia: *"Eu ouvi falar de um Jaco Faro. Faz tempo."* — *o núcleo diz que **Jaco a julga morta** (`t_morto_vivo`); nem ele nem ela mostram nada.*
**M40** J *entro no galpão e fico olhando* → *"Lia reza a meio da frase, baixinho, a um santo de cada coisa que vê: **'São Brás da fechadura, quase me fez esperar; São Caim do caixote, o que está dentro está quieto; Santa Rita da chuva, não deixe o mar subir.'** … 'Veja o que faço uma vez, e me diga se presta.'"* — *`QUEM CARREGA Lia Cinzela: PEDE ao herói "Veja o que faço uma vez…" (voz da Lia: reza a meio da frase a um santo de cada coisa)`: honrada, com a **voz**. A melhor entrada de personagem da sessão.*
**M41** *Lia corta a corda; uma caixa com cadeado em forma de peixe; "Santa Rita da chuva, não deixe o mar subir"* (o exemplo da tabela, **repetido à letra** — 2.ª vez). **M42** J *digo que a canção é um mapa; peço licença para examinar o cadeado* → *"Pode olhar. Mas não abre."*
**M43** J *examino o cadeado com Investigação* → teste `vasculhar o lugar — dif. 13 · Percepção +2 sem treino` (o jogador disse Investigação) — **d20 5 → 7, falha; [toque] Refazer · 1 ponto → 9 → 11, falha**; SISTEMA `Você revira o que dá e não encontra — e o lugar fica remexido` — M: *"Lia acompanha o seu fracasso… Depois, baixinho, ela começa a trautear. É a sua canção, mas não do jeito que você conhece. No meio de um verso, ela encaixa uma frase que você nunca ouviu: **'…e o sal não dorme, o sal só finge que esquece…'**"* —
***a pista A (a que se ouve), na resposta de uma falha, palavra por palavra do `QUEM CARREGA Lia Cinzela (ela) (é fato…): trauteia a canção do herói com um verso que o herói nunca ouviu`.** *O Livro ficou `termo_fora_do_lugar: semeada → madura`.*
**M44** J *fico em silêncio, ouvindo o verso novo; olho as mãos de Lia, a bolsa* → *"Lia percebe o seu silêncio e para de trautear… Você ouviu o que não devia. E agora quer saber o que mais eu carrego."* — *a pauta trouxe **`QUEM CARREGA Lia (ela) (é fato…): mente ao herói sobre isso, e o herói percebe que mente; a verdade não sai`**: o Mestre não pôs mentira nenhuma. **Não honrada.** (E eu **suspeitei aqui**: o turno logo depois da pista A.)*
**M45** J *digo a Lia que o verso novo prova que ela conhecia o homem; estendo a mão para a bolsa* → *"Verso novo é só verso… Se quer a bolsa, vai ter que dizer o que espera achar nela."* **M46** J *espero achar um caderno de música com a pauta do último verso* → *"Nada de papel. … Canção eu carrego aqui. [toca a testa]"* — *a pista B está seminada ("semeada") e ainda não foi dita.*
**M47** J *…você é de quem me ensinou. Chega de mentir: diga o que é essa canção* → teste `**enganar** — dif. 14, +8 treinado: 9 → 17, sucesso` (*o jogador **acusou** uma mentira; o jogo leu "enganar"*) → Lia: *"essa canção já era velha quando eu nasci. E ninguém mandou guardar este galpão… Eu o guardo porque o meu pai guardou… amanhã, na maré baixa, te apresento a quem conhece a letra inteira."*
**M48** (campo: *Montar acampamento*) *"O galpão escurece… 'Até onde você vai por esse nome?'"* — **M49 [toque]** *Sair sem descansar* (20 min) → *"Lia está de pé perto da lanterna, as mãos ocupadas com um **caderno de capa escura**, surrado… **Uma pena queimada na ponta cai do meio das páginas**, e ela a apanha antes que toque o chão, sem dizer o que é."*
— ***a pista B (a que se vê), na saída do campo, a `QUEM CARREGA Lia (… à vista): o caderno da pauta, com uma pena queimada na ponta no lugar da assinatura`: honrada, à letra.** *Os dois **QUEM CARREGA** do elo foram à cena, no sítio e com o elo a falar, **antes** da revelação; Jaco, de pé: "Vai mesmo confiar nela?"*

## Parte 5 — a viagem que o jogador não fez, a crise e a decisão (M50–M67)

**M50** J *Digo a Jaco que não vou confiar em ninguém aqui. Depois **me volto** para Lia e aponto a pena queimada na mão dela: o verso que você cantou e essa pena no seu caderno vêm do mesmo lugar. Você servia a quem mandou aquele homem… Diga o nome dele.* →
SISTEMA **`🧭 Entendi "…" como Sul Molhado (O Peixe Cego está lá)`** · `Navegação em costa: d20+2 = 16 vs 5` · `Fim da estrada: depois de 0.5 dias de marcha e 20 km, você chega a Sul Molhado` — *a frase tinha "volto" e um "Jaco" na oração; **o relógio andou de 12:36 para 16:56**, `cidadeAtual` virou Sul Molhado, e a missão
**"A palavra dada a Jaco Faro: ir_a Sul Molhado ✓"** fechou.* M: *"Lia guarda o caderno sob a capa… 'Não sirvo a homem nenhum… E o nome que você quer, Dornel, mora onde a canção termina. Não comigo.'"* — **a prosa ficou no galpão de Quebrado do Leste, o sistema ficou em Sul Molhado.**
**M51** J *digo a Lia que fico aqui no galpão até a maré baixa* → SISTEMA `✦ A palavra dada a Jaco Faro: a coisa vira aqui` · `★ MISSÃO CONCLUÍDA: A palavra dada a Jaco Faro — +57 moedas · +89 XP` · `📍 Você está no galpão de Lia Cinzela (dentro de **Sul Molhado**)`. *A pauta: `LONGE (NÃO podem aparecer…): Lia Cinzela está em Quebrado do Leste, a 1 dia daqui · Marlo… Dário… Frida do Mar` — com Lia à frente do herói.*
**[toque no relógio] Esperar 8h** → *dia 3, 01:00*. **M52** (a resposta a essa espera) — *"Perto da meia-noite, **um velho camarada de Tônia** aparece na soleira, pingando… 'Tônia Lodoso! Foi você que sumiu com a prata do voto da gente.'"* — *`QUEM CARREGA Tônia (ela) (é fato…): um velho camarada de Tônia Lodoso aparece e acusa-a em voz alta`: honrada. **Era o pedido da Tônia que eu ignorei desde o dia 1: a crise chegou ao fim do 2.º dia, e o pedido saiu da soleira** (`crise: 3`).*
**M53** J *levo Marlo para fora do galpão, para ouvir o que ele tem contra Tônia* → *"— Eu vi ela de noite, no marco do porto, com saco pequeno… Ela te disse o que andou carregando?"* (Marlo entra no registo: *camarada de Tônia, acusador*).
**M54** J *Digo a Marlo que… **vou ouvi-la** ainda esta noite* → teste **`ouvir a ainda esta noite — dif. 13 (Percepção) +2: d20 3 → 5, falha`** (*"vou ouvi-la" lido como "ouvir"*) → *"Você tenta ouvir além da voz dele… a chuva engole tudo"*, Jaco leva Marlo embora. *Uma resposta e um teste perdidos para uma frase que era uma promessa.*
**M55** J *entro no galpão… ponho diante dela o verso e a pena queimada. Digo que isso é a marca de quem ela serve, e quero o nome* → Lia: *"A pena queimada é da minha mãe. O verso é do meu pai. E os dois estão mortos… O nome que você quer… se carrega no caderno que eu herdei, e ele só se abre na maré baixa."* — *as duas pistas, o confronto explícito, **e a revelação não veio**; o Mestre inventou o álibi (pais mortos). **`reviravolta` = null.***
**M56** (campo) · **[toque] Descanso longo** → a roda: **Jaco** *desenha qualquer coisa na terra com um pau* · **Tônia** *atiça o fogo sem precisar* · **Hilda** *passa o dedo por um nome gravado numa tábua* · *Dormir já* — **Lia não está na roda**, e Hilda, **a quatro horas dali** na prosa, está.
**M57 [toque]** *Tônia Lodoso* → *"Eu devia ter falado… No outro dia, a prata sumiu, e eu calei. Se eu tivesse acusado, talvez tivessem escutado. Mas eu fiquei quieta, porque quem acusa também é olhado de lado. … Alguém pagou por isso… Agora me diz se a gente deve falar tudo, mesmo quando ninguém pergunta."* — *`QUEM CARREGA Tônia: diz, porque é noite e há fogo, o que de dia não diz: calou quando devia ter falado, e alguém pagou`: honrada; e **é a crise de M52 virada em confissão**.*
**M58** J *Digo que sim: é melhor falar tudo… amanhã ela diz isso a Marlo, e eu fico ao lado dela* → *"Então fica do meu lado. Amanhã, na frente do Marlo. Sem baixar a cabeça… Eu passei a vida inteira esperando alguém me dizer que falar adianta. Agora fica comigo."*
**M59 [toque]** *Dormir* → manhã de 4 de Brumal: **cartão "Tônia Lodoso — Defender a versão dela · o camarada desafia você para um duelo / Deixá-a confessar · o camarada vai-se — e Tônia Lodoso fica, mais leve, sem o medo que a roía"**. *A pauta mandou `QUEM CARREGA Tônia (ela) (a decisão é do herói: não a feche): … Tônia diz-lhe as duas saídas`; o Mestre contou o sonho de Jaco e um torneio, **não as duas saídas**.*
**M60 [toque]** *Defender a versão dela* → *"'Então o bardo fala por ela? Pois que fale com a lâmina, não com a língua.' Ele tira uma faca de pesca… Lia: 'No meu telhado não. Lá fora, na lama. E sem faca.'"* — *`arcos.Tônia.escolha = defender`, laço **amor/1** firmado (o preço da escolha de lado).*
**M61** J *Aceito o desafio. Saio para a lama, sem faca, como Lia mandou, e **ataco o pescador de barba ruiva** com os punhos.* → *"Não há ninguém para atacar… O pescador de barba ruiva se foi com a chuva."* — *a pauta: **`[ATAQUE DECLARADO — SEM ALVO NO REGISTRO]… não tem, no registro deste lugar, ninguém com o nome que eu citei`** — o homem que o Mestre acabou de pôr à frente do herói, com faca, não existe para o sistema: **o preço de "Defender" prometido no cartão (um duelo) não existe.***
**M62** J *saio com Jaco pela estrada atrás da fera de cicatriz de anzol* (um boato do Mestre no M59) → viagem aberta; **M63** *passo pela estalagem* — *a fera nunca apareceu.* **[toque] Esperar 8h** → **M64** *"A tempestade desaba sem aviso… Jaco: 'Doze anos atrás… achei um javali de espinho com anzol preso na bochecha.'"* *(a fera é só um boato dito por quem a viu em sonho.)*
**M65** (campo, **467×851**) · **[toque] Descanso longo** → *roda de **um** nome* (Jaco, na estrada) + *Dormir já*: **«Jaco F…»** *(o nome cortado a 178 px)*. **M66 [toque]** *Jaco Faro* → *"Eu quero ver uma criança crescer longe disto. Dez anos, talvez doze… Eu queria isso para mim. Não para ser pai. Para ser o motivo de não precisar ser."* **M67 [toque]** *Dormir* → 6 de Brumal, 07:00; SISTEMA `⚠ O Torneio das Coroas ●○○○○○○○ — mais uma noite passou` · `✉ A Ordem da Coroa propõe um tratado` — *o mundo antigo entra de novo*.

## Parte 6 — o empaque (M68–M71)

**M68–M71** J *Sento num torrão seco à beira da estrada… Continuo sentado… Fico olhando as nuvens… Não me levanto, toco a mesma nota de novo* → *(`escuta.semAvanco` 2 → 5)*: **M68** SISTEMA `✦ Jaco Faro: esconder uma criança. Ela quer ir junto — o convite é seu para aceitar ou não` (o sistema escreve o desejo de Jaco, fora do Mestre) ·
**M69** *"Um grito distante vem do fim da estrada… Jaco: 'Alguém viu a fera. Agora decide.'"* · **M70** *no barro um casco e "um pedaço de latão preso no espinheiro"* · **M71** *Jaco: "Se ela aparecer, eu corro na frente. Não por você. Por causa de uma criança que não é sua."* — ***o Mestre encheu o vazio sozinho, com cenas novas e uma fera por caçar***; a pauta do M71 trouxe o degrau 1 — `o mundo dá um sinal… quem passa fala baixo de Píer Norte… é fato: entra nesta resposta, com o nome dito` — e **não foi dito** (`escada.degrau` ficou em 0 no save).

---

## As perguntas, contra o sistema

*Só as perguntas que o jogador faria ao Matt e que o sistema podia ter respondido.*

| # | resp. | pergunta | o que o Mestre disse | veio de | onde |
|---|---|---|---|---|---|
| 1 | M2 | como se chega ao Píer Rachado, quanto leva? | "meia hora de perna" | **sistema** (dentro da cidade) | `lugar.distancia` |
| 2 | M4 | Frida conhece Tônia? | "Ela anda por aí de vez em quando" | **errada contra a resposta anterior** | M3: Tônia saiu da cozinha |
| 3 | M7 | de que bar vem a canção? | "O Peixe Cego… Ambrósio" | **sistema** (o Peixe Cego é o local do marco) + inventado (Ambrósio) | `espinha|0|0` |
| 4 | M8 | quanto custam duas canecas? | "Dois cobres" | **inventado** (a pauta não trazia preço) | — |
| 5 | M10 | como se chega ao Peixe Cego, quanto leva? | "onze quilômetros… quatro horas" | **sistema** | `PERGUNTOU distância: Sul Molhado (… 11 km, 4 h)` |
| 6 | M10→M11 | (a mesma estrada, andada) | **20 km, 0,5 dias** | **contradita pelo próprio sistema** | `jornada` |
| 7 | M22 | quanto custa um quarto? | "três cobres a noite" | **sistema** | `PERGUNTOU pouso: quarto comum ◉ 3` |
| 8 | M24 | quem era o homem que me deu a canção? | "Dário, remador do Píer Rachado" | **inventado** (e o Cronista o registou como **gente viva**, em Quebrado do Leste) | `npcs`: Dário |
| 9 | M25 | porquê o pedido? | "Eu quero sair. Mas sair custa." | **sistema** (a ficha na voz dela) | `QUEM É Tônia: quer ver-se livre de um juramento` |
| 10 | M30 | quem escreveu a carta? | "Não sei quem mandou… 'Ou você volta, ou leva a culpa'" | **sistema** (o "carrega" de Jaco) + inventado o texto | `QUEM CARREGA Jaco` |
| 11 | M33 | quanto custa uma maçã? | "o que você tem de mais bonito na mochila" | **esquivada** — o sistema disse "não há **maca**" | `PERGUNTOU não há maca à venda` |
| 12 | M38 | quem lhe ensinou a canção? | "não fui eu" | **contradita pelo núcleo** (Lia é o elo: "quem ensinou a canção ao herói") — *de propósito, antes da revelação* | `nuc.mjs` |
| 13 | M45 | o que há na bolsa? | "uma madeira roída e um dente; nada de papel" | **contradita pelo Livro** (a pena e o caderno, já semeados) — *de propósito, antes da pista B* | `promessas.sementes[2]` |
| 14 | M55 | quem manda em ti? | "a minha mãe… o meu pai… estão mortos" | **inventado** (álibi) | — |

**Contagem:** 14 perguntas — **6 do sistema, 3 inventadas, 2 erradas contra o sistema, 1 esquivada, 2 contraditas de propósito** (a 6.ª deu 8 / 7 / 3 / 2; a 5.ª, 5 / 8 / 1 / 2). **O sistema sabia e não entregou em 2:** o preço da maçã (a leitura "maca") e a mentira de Lia (a linha do M44).

---

## O custo — cada chamada, com dono

| quem | chamadas | tokens entrada (cache) | saída | tempo médio |
|---|---|---|---|---|
| Narrador | **71** (+ o Léxico, 1 chamada) | 2.972.893 (1.490.304 em cache, 50%) · *as 72 chamadas, com o Léxico* | 24.098 | 8,6 s |
| Cronista | 71 | ≈ 200.000 (166.912 em cache, com os Revisores) | ≈ 12.000 | 1,9 s |
| Léxico | (a 1.ª das 72) | 4.779 | 5.034 | 56 s |
| Revisor de continuidade | 6 | — | — | 1,9 s |

- **Chamadas por resposta: 2,08** (a 6.ª, 2,16; a 5.ª, 2,02). **Seis Revisores em 71 respostas** (a 6.ª, 10) — nenhum trocou o gênero de ninguém.
- **Pedido do Narrador (caracteres): pico 159.620** (a 6.ª: 159.603) e **system 66.000–72.183** (a 6.ª: 72.757): o system **não cresceu**; o teto de prompt (82 mil) não foi tocado.
- **A pauta**, medida do cabeçalho ao primeiro envelope: **1.013–1.146 caracteres**, mediana 1.116; **nunca acima de 1.400** (71 de 71). **`NÃO PODE` em 71 de 71** pautas: nenhum veto foi cortado pela linha `coracao`. Com os envelopes (O QUE VOLTA, A FORMA…), a pauta chegou a 4.766.
- **O save pesou 396.720 caracteres** ao fim (a 6.ª: 347.302; 71 turnos, 5 dias); a chave é uma só.
- **Zero chamadas a mais por turno** que o previsto. O **campo** (Montar acampamento, Sair, Dormir) custa **uma chamada do Narrador por toque** quando ele escreve a cena (M28, M48, M49, M56, M65): **a fogueira não somou chamadas**; foi a mesma "pausa" de antes.

---

## A escuta, turno a turno (v9.416, 11/10)

*O que a pessoa pediu na 4.ª e o que o Mestre fez agora.* Medido no registo (as 71 respostas), por script.
- **Respondeu à pergunta em 16 de 17** perguntas feitas (a 6.ª: 38 de 42). A única esquivada: o preço da maçã (M33).
- **A frase do jogador é a última linha do pedido em 49 de 49** pedidos que a têm (os outros 22 nascem de um clique: Aceitar, Perguntar porquê, Sentar-se, Dormir, a decisão, ou de um teste). Aguentou outra vez.
- **Reagiu primeiro** em todos os turnos de cena lidos. As falhas desta sessão **não são do Mestre que narra, são do sistema que lê a ação**: M50 (viagem), M54 (teste), M47 (enganar), M61 (alvo).
- **Empurrões: 29 linhas `O RUMO` em 71 — 18 `aponta`, 10 `sinal`, 1 `vem`, 0 `cobra` — nunca mais de um por pedido** (a 6.ª: 40 em 67). A ponte única aguentou.

## O mundo que anda quando empacas

Empaquei **4 respostas** (M68–M71; `semAvanco` 2 → 5), mais duas esperas de 8 h (M52, M64).
- **A espera de 8 h é onde o mundo anda**: M52 trouxe a **crise da Tônia** (o camarada), com o `QUEM CARREGA` honrado e o pedido ignorado saindo da soleira; M64, a tempestade e a memória de Jaco. *Quem ignora, paga* — e **o jogador vê**.
- **A escada** (degrau 1 aos 4 sem avanço): o `sinal` entrou na pauta do M71, com o lugar errado para quem estava na estrada ("quem passa fala baixo de Píer Norte") e **não foi dito**; `escada.degrau` ficou em 0 no save. **Disse no turno certo: 0 de 1** (a 6.ª, 0 de 3).
- **O Mestre encheu o vazio sozinho** (M69–M71: o grito, o casco, o latão, a criança de Jaco) — **melhor do que o degrau**, mas **fora do sistema**: a "fera de cicatriz de anzol" não existe no registro, e é a única coisa que o jogador foi caçar no fim.
- **Prosa do vazio:** **0 repetições verbatim** em M68–M71.

---

## O que a sessão tinha de provar

| item (v9.407 → v9.416) | aguentou? | como / porquê |
|---|---|---|
| **1a. uma pergunta de rumo não abre viagem** | **sim (2 de 2) — e partiu noutro verbo** | M2 e M10: `jornada` = null, relógio parado. **Mas M50: "me volto para Lia" abriu a jornada**, 20 km, +4 h, e **fechou uma missão com recompensa** (+57 moedas, +89 XP). O que a C0 cobre é a **pergunta**; "volto" continua a ser verbo de partida |
| **1b. "ataco X" ataca o que o Mestre mostrou** | **não (0 de 1) — e o único caso era uma pessoa** | M20 (o homem da tocha **evapora**: ladeira vazia) e M61 (o pescador de faca: `SEM ALVO NO REGISTRO`). A C0 cobre o **bicho**; **a pessoa que o Mestre põe com faca à frente do herói** continua sem existir para o sistema. Não houve bicho em 71 respostas (a fera é um boato) |
| **1c. o marco só fecha pelo fato, e na ordem** | **sim** | 2 marcos fechados em 71 respostas, ambos **ao falar com a pessoa, no sítio do marco** (M19, Tônia no Peixe Cego; Hilda); **seis respostas de conversa com ela no Píer Rachado não o fecharam**; `O que Píer Rachado esconde` (revelar) **não fechou só por entrar**; nenhum marco de outro ato fechou |
| **1d. o herói nunca vira NPC** | **sim** | `npcs` (10) não tem "Dornel"; mas o Cronista pôs **`nome: "Dornel", papel: "homem magro de capa escura…"` na chamada #23** (o Cronista errou; o registo recusou) — **a recusa funcionou, é a rede** |
| **1e. "quanto é?" → "pago" debita** | **sim em 2 de 3 situações** | caneca (15 → 13), quarto (102 → 99); **a terceira, "Pago os cinco cobres" a Pregado, não** (a bolsa só paga balcão) |
| **1f. "maçã"** | **não** | `PERGUNTOU não há maca à venda em Sul Molhado; armas à venda: Cimitarra`. A compra de "três maçãs e duas rações" debitou 6 e criou 2 rações; **0 maçãs**. O conserto de `O_ACENTO_SEPARA` ficou em `bolsa-da-frase`; `mercado.js` (que fala com o Narrador) continua a ler "maca" |
| **2. o núcleo** | **em parte** | ver a secção abaixo |
| **3. as subtramas** | **sim, o motor; a tela, em parte** | 4 pedidos postos (Tônia, Hilda, Jaco, Lia), 1 aceite (Hilda, **desmentido pelo Mestre**), 1 ignorado (Tônia, **crise**), 1 decisão com os dois lados |
| **4. a reviravolta do ato 1** | **plantada, não colhida** | ver abaixo. `reviravolta` = null |
| **5. a fogueira** | **sim — e é o que mais pega** | ver abaixo |
| **6. as 9 notas** | **3,6 de 5** (a 6.ª: 3,2) | ver abaixo |

---

## O núcleo

**Quem são** (recalculado fora do jogo com o save, 6 pessoas): **Jaco Faro** (companheiro, mestre de ofício; quer *ver uma criança crescer longe disto*, teme *que o herói o veja como ele se vê*,
esconde *que foi dado como morto, e há quem o chore em Porto Velho*; voz: **diz os números exatos**) · **Golem de Pedra A Boca do Fosso** (o vilão; assinatura **uma pena queimada na ponta**; só aparece como
"mulher que não usa nome" e como `O MUNDO SE MEXE`) · **Lia Cinzela** (o **elo**: *quem ensinou a canção ao herói*, "julgada morta" por Jaco; quer ser chamada mestra; voz: **reza a meio da frase a um santo de cada coisa**;
`ELO_DO_ANTECEDENTE` artista: *"servia {sombra}; o último verso é um mapa"*) · **Tônia Lodoso** (a voz; quer ver-se livre de um juramento; esconde *que fugiu de uma luta*; voz: **põe comida em toda a metáfora**) ·
**Hilda** (a balança; **desertora**, o regimento a procura; voz: **ri antes de terminar a frase**) · **Frida da Vela** (a porta; Angra Alta; voz: **responde com outra pergunta**).

**Quantas apareceram** (a pessoa pelo nome na prosa, em 71 respostas): Jaco **58**, Tônia **51**, Lia **20**, Hilda **6**, Frida (da Vela **3**; do Mar 10), o vilão **0** (certo: está de longe). Cada uma com ≥ 3: **5 de 5** com cara; o vilão fora de cena, como devia.

**Quantas linhas do coração foram**: `QUEM É` em **12** respostas, `QUEM CARREGA` em **13**, alguma das duas em **23 de 71 (32%)**; **o maior intervalo sem linha foi de 15 respostas** (M9–M23, a viagem e o Peixe Cego). Em 34 de 71 pautas a batida da espinha estava lá; `A FORMA DESTA CENA` em 21; `O QUE VOLTA` em 11; `O PASSADO VOLTA` em 9.

**O Narrador honra a frase fechada (`QUEM CARREGA`) na mesma resposta: 10 de 13 = 77%** (alvo ≥ 85%; a 6.ª mediu o `vem` calado 3 de 3).
- **Honradas (10):** M3 (o pedido da Tônia, à letra), M29 e M66 (Jaco à fogueira), M31 (o pedido do Jaco), M40 (o pedido da Lia), **M43 (a pista A, o verso)**, **M49 (a pista B, o caderno e a pena)**, M52 (a crise), M57 (a confissão), M60 (o duelo).
- **Falhadas (3):** M24 (Hilda **não está na cena**: a linha entra "dito por ela" e ela está no andar de baixo — **chegou 2 respostas depois**, em M26); M44 (**`mente ao herói… e o herói percebe que mente`** — uma ordem aberta, sem fala dada; o Mestre não mentiu); M59 (**`diz-lhe as duas saídas`** — o Mestre contou um sonho; as saídas só existiram no cartão).
- **A regra que se vê:** quando a linha traz **a fala, o objeto ou a imagem** ("PEDE… 'Veja o que faço uma vez…'", "trauteia… um verso", "o caderno… uma pena queimada na ponta"), **o Narrador cumpre 10 de 10**. As **duas** falhas que não são de pessoa ausente são as que dão **um verbo** ("mente", "diz as saídas") — a mesma lição da 6.ª (frase fechada obedece, ordem aberta calla).

**O tique (voz, não frase):**
- **Jaco** (números exatos): em **10 de 27** parágrafos de fala com número ≥ 2 (37%; alvo ≥ 60%) — *"Três dobradiças… Duas oficinas brigando pelo mesmo ferro"*, *"Dois, um com tocha, outro com a mão na capa"*, *"Dez anos, talvez doze"*, *"Doze anos atrás… javali de espinho"*. **Pega quando há cena; some em conversa.**
- **Tônia** (comida): **4 de 30** parágrafos (13%) — *"a voz é de sopa fria na boca de quem tem fome"*, *a bandeja de pão*, *"jurei um favor pra quem paga com comida"*, *"come a maçã devagar"*, *a tigela de caldo meio cheia* (esta, bem, é rasto, não fala). **Pega nas primeiras 6 respostas e some** — não está nas duas falas mais fortes dela (a confissão do M57).
- **Lia** (um santo de cada coisa): **2 respostas** (M40, M41) — *"São Brás da fechadura…"* — **e o exemplo da tabela repetido à letra** (`Santa Rita da chuva, não deixe o mar subir`, 2×, o limite). Depois, **0**.
- **Hilda** (ri antes): *"ri antes de terminar a frase"* **3×** com as mesmas palavras (M22, M26, M31) — **passou do limite de 2 e virou a frase que o Mestre já tinha lido**.

**Gênero na narração:** a pauta passou a levar "(ela)"/"(ele)" e o artigo no tique ("voz da Tônia") e **o Mestre acertou o de Tônia, Lia, Jaco e Pregado**. **Errou o de Hilda em 2 respostas** (M22, M23: *"Hilda, o taverneiro… Ele ri"*; a ficha do elenco diz "taverneiro(a)", o núcleo "mulher") — **o `taverneiro(a)` do elenco manda mais que o `(ela)` do núcleo**.

**O que o jogador ficou a saber, sem etiqueta** (≥ 3 dos 6 campos): **Jaco 4** (quer: *a criança*; carrega: *a carta de dez anos*; tique; o laço de Tônia — falta o *esconde*), **Tônia 4** (quer: *sair do juramento*; carrega: *a prata que calou*; esconde — em parte; tique), **Lia 3** (tique; carrega: *o caderno*; o *esconde* só nas duas pistas), **Hilda 2** (tique; o pedido) ✗, **Frida 0–1** ✗.

**Dois nomes para a mesma pessoa:** o núcleo gerou **Frida da Vela** (Angra Alta, a "porta") e a espinha já pusera **Frida do Mar** (Píer Rachado, a serviçal); a pauta mandou a primeira sobre a segunda (M6, M7, M8) e o Mestre, 3 vezes, chamou-lhe **da Vela** a uma mulher que o registo conhece como **do Mar**.

---

## As subtramas

- **Pedidos recebidos (4):** Tônia (M3), Hilda (M26), Jaco (M31), Lia (M40). **Aceites:** 1 (Hilda, M27), **que o Mestre desfez** (o bloco do mural, ver M27). **Recusados:** 0. **Ignorado de propósito:** 1 (Tônia, do dia 1 ao dia 3).
- **Se ignoro, a crise piora?** **Sim.** Pedido da Tônia posto no dia 1 (M3); `arcos.Tônia.crise = 3` na resposta à espera de 8 h do dia 2 → 3 (**M52**): *um velho camarada aparece e acusa-a em voz alta*; o pedido sai da soleira; à noite, **ela confessa** (M57); de manhã, **há um cartão com dois lados**. **1 caso testado, e deu história.**
- **A decisão, com os dois lados e o preço antes do clique (M59):** *Defender a versão dela — o camarada desafia você para um duelo* / *Deixá-a confessar — o camarada vai-se — e Tônia Lodoso fica, mais leve, sem o medo que a roía*. **Os lados estão à vista, escritos na voz do que vai acontecer** (não "luta" nem "custo").
  Escolhi *Defender* (a menos fácil). **O que custou de fato:** **laço *amor/1*** com Tônia (a mão dada a um romance que o jogador não pediu) e **um duelo que não existe** (M60 *"Pois que fale com a lâmina"* → M61 *"Não há ninguém para atacar"*). **O lado que o cartão anunciou mais caro foi o que o jogo não soube cobrar**; o outro, *"o camarada vai-se"*, **sai de graça** — a escolha é uma pergunta sem custo para quem a faz do lado seguro, **e uma promessa quebrada para o outro**.
- **A consequência volta à prosa** (≥ 2 vezes nos turnos seguintes): **sim, 2 de 2** — o camarada com a faca (M60) e Lia a expulsar o duelo do telhado (M60), **mas** depois de M61 ninguém volta a mencionar Marlo, a faca, a lama ou o amor.
- **Pedido e mural são a mesma coisa em dois botões** (M26–M27): *"Aceitar o que Hilda pede"* (soleira) e *"Aceitar: A carta para Sal Morto · +59 XP"* (mural). **A mesma ação com duas caras**, e **uma das caras mente** (a que o jogador toca).
- **A soleira acumula:** 3 pessoas × 3 botões (Aceitar, Recusar, Perguntar porquê) + 3 do mural = **12 botões** ("mais 10 ofertas") **a 800×451, onde, aberta, ela cobre toda a prosa** (só duas linhas do texto ficam à vista).

---

## A reviravolta do ato 1

**As duas pistas do elo foram à cena, ambas, na ordem e no sítio do elo:**
- **A, a que se ouve (M43):** Lia **trauteia a canção do herói com um verso que o herói nunca ouviu** — *"…e o sal não dorme, o sal só finge que esquece…"* — **numa resposta de falha de teste**: o Mestre cumpriu o `REGRA DESTE ENVELOPE: eu FALHEI, NÃO revela nada` e **encaixou a pista pela boca dela, fora do que o teste procurava**.
- **B, a que se vê (M49):** Lia, com **um caderno de capa escura**; **uma pena queimada na ponta cai das páginas** e ela a apanha *sem dizer o que é*. **Pelo registo: 2 de 2 (100%)**.
- **O turno em que desconfiei:** **M44**, a resposta **logo depois da pista A** — *"olho para as mãos de Lia, a bolsa, tudo o que ela traz consigo, e comparo com a canção"* (**entre as duas pistas, como a spec quer**: nem antes, óbvio; nem depois, não plantou).
- **Confrontei:** M45 (com a pista A), M47 (com A, e acusação), **M55 (com as duas: "o verso novo… e a pena queimada… quero o nome")**. **A revelação não veio.** O Mestre inventou o álibi (*"a pena é da minha mãe, o verso é do meu pai, os dois estão mortos"*) e **adiou para "a maré baixa"**. `reviravolta` = null; o Livro ficou `madura`, 2 de 2, **0 pagas**.
- **O que a pauta do M55 tinha**: `MOMENTO` da batida 3, `O PASSADO VOLTA`, `O QUE VOLTA`, `A FORMA DESTA CENA` — **nenhuma linha do coração**, nenhuma `revelação`. Com o elo em cena, com as duas pistas dadas e com o jogador a nomeá-las, **o motor não deu a verdade ao Narrador**; e **o Narrador não a tinha**.
- **Tentei chegar ao fim do ato 1: não consegui.** Ato 0, 2 de 4 marcos (os outros dois, *revelar o que o Píer Rachado/o Píer Norte esconde*, **ficam por revelação**: a mesma que não vem).

---

## A fogueira

**Três noites, três rodas.**
1. **Estalagem do Peixe Cego** (dia 1, 14:42): *Jaco · Tônia · Hilda · Dormir já*. Sentei-me com Jaco (M29): *a carta de dez anos* (o campo **carrega**); respondi por escrito e a roda ficou (M30); **Dormir** → manhã. **A noite fechou com: ladrilho «Ficou com você, da noite, o que Jaco Faro contou ao pé do fogo.», `uma noite inteira · PV e PM cheios · metade dos dados de vida`, `fazedor de caldos`, `Comida acabou`, `Água acabou`, e o pedido de Jaco dito pela manhã.**
2. **O galpão** (dia 3, 01:06): *Jaco · Tônia · Hilda* — **Lia, que estava à minha frente, não**, e **Hilda, que estava a quatro horas, sim** (efeito da viagem fantasma de M50). Tônia (M57): *"calou quando devia ter falado, e alguém pagou"* — **a crise do M52 virada em confissão**; respondi; **Dormir** → manhã com **o cartão de dois lados** (M59).
3. **Ao pé de um marco de estrada** (dia 5, 00:12, **467×851**): *Jaco · Dormir já*. Jaco (M66): *o campo "quer"* (a criança). **O segundo campo da mesma pessoa, na segunda noite com ele: o sistema não repete.**

**O que o jogador sente (jogado):** a roda **não é um menu**: é *a lenha estala, ninguém tem pressa de dormir* e **quatro gestos** (*conta moedas que não chegam*, *atiça o fogo sem precisar*, *passa o dedo por um nome gravado numa tábua*) — **os gestos já dizem quem é quem antes de abrir a boca**; a fala vem na voz dela; **escrever é responder-lhe e a fogueira fica**; **o preço (uma noite inteira, 2 rações, 2 águas) está escrito antes de tocar**, e **o botão diz "uma conversa à fogueira"** — *o veredito antes do clique, cumprido*. Duas das três falas (M30 *"Ou você volta, ou leva a culpa. Não há terceiro caminho."*; M57 *"Eu passei a vida inteira esperando alguém me dizer que falar adianta"*) **são as melhores da sessão**.
**Três limites jogados:**
- **Uma roda por dia, e o botão o diz** (*"devolve o mesmo que um curto (já dormiu hoje)"*, 12:36 do dia 2). Honesto; mas **o jogador não sabe, ao ver "uma conversa à fogueira" no botão do dia 1, que ela só vem uma vez por dia**.
- **Quem se senta depende de onde o sistema acha que o herói está.** Com a viagem fantasma (M50), **Lia não estava na roda e Hilda estava**; e **na estrada só há Jaco**.
- **A noite abre e fecha o Narrador:** *Montar acampamento* e *Sair sem descansar* custam **uma resposta cada** — e **foi na saída do campo (M49) que a pista B entrou**: a pausa é um bom sítio para o mundo mexer.

**800×451 (mesa baixa):** a roda de quatro cabe em duas linhas de 56 px, mas **a segunda (y 324–380) está 14 px por baixo do campo de escrita (y 366)**; lê-se com o scroll da página, não de relance. **Os dois nomes ficam inteiros** (264 px por cartão). **A soleira aberta com 12 botões cobre a prosa.**
**467×851 (telefone):** a roda passa a **duas colunas de 178 px** e **o nome é cortado — «Jaco F…» e o gesto «desenha …»** (`scrollWidth` 176 de 178): **confirmado o aviso**; com *Tônia Lodoso* seria «Tônia L…», e com *Lia Cinzela*, «Lia C…». Sob a roda, ~400 px **vazios** na página; **o telefone dá mais altura do que a roda usa e menos largura do que o nome pede**.

---

## As promessas, os fechos, a luta

- **Promessas (o Livro de Promessas do Cronista):** plantadas **15**, cobradas **12**, **pagas 0** (a 6.ª: 12 / 12 / 0). `promessas_pagas` não veio em nenhuma chamada. *Pagas em cena, por leitura: a carta de Jaco (M35, "volta" como objeto), a cera/sal rasgado (M35), "o regimento" (a pergunta de Tônia, M3 → a crise do M52 já não é regimento) — ~3 de 15; abertas: "o favor grande a Tônia" (M24), "o regimento" e a carta a Sal Morto.* **O Livro do coração (2 sementes do elo) está maduro e sem colheita.**
- **Os fechos (71):** corte/ação/imagem **30** · silêncio/espera **15** · ambiente **15** · pergunta **7** · fala **4** (a 6.ª: 24 / 21 / 5 / 10 / 7). **A instrução `O FECHO: alguém fica calado à espera da minha resposta` ainda saiu em 15 pedidos** (a 6.ª, 10) e **o Mestre cumpriu 9**: o sistema ainda manda a muleta. **As muletas somadas** (*fica calado à espera* **12** + *sem tirar os olhos* **3** + *cruza os braços* **8**) = **23 em 71** (a 6.ª: 32 em 67; alvo ≤ 15): **desceu 9, e é só a sexta parte do que a ordem pedia.**
- **A prosa:** "cheiro" **18** respostas (23 na 6.ª); mas **"sal" em 30** e **"chuva" em 29** (e *o mar bate* em 7) — **o tique deixou de ser verbo e passou a ser cenário**.
- **A luta:** **nenhuma** (`combate` null; **0 de 71**). O único golpe declarado (M61) caiu num "sem alvo no registo". **A luta perdida, a 4.ª–6.ª ensinaram; nesta sessão não houve onde a provar** (a fera de cicatriz de anzol não saiu do boato).

---

## A coerência: as contradições, e de onde vieram

| # | o que não casa | origem |
|---|---|---|
| 1 | **Uma frase com "me volto" abre viagem** (M50): 20 km, +4 h, `cidadeAtual` = Sul Molhado, a prosa fica no galpão; a pauta diz `LONGE: Lia Cinzela… a 1 dia daqui` com Lia à frente do herói; **uma missão ("A palavra dada a Jaco") fecha com +57 moedas / +89 XP**; **a roda da fogueira exclui Lia e inclui Hilda** | (a) o Intérprete |
| 2 | **Três medidas** para Sul Molhado ↔ Quebrado do Leste: **11 km/4 h** (a pauta, M10), **20 km/0,5 dia** (a jornada, M11, M35, M50), "**72 min desde Sul Molhado**" (o lugar `estalagem do caminho`, M11) — e **"chega a Sul Molhado" duas vezes na mesma linha** | (a) o relógio / `lugar` |
| 3 | **O pedido aceite é desmentido** (M27): `aceitou` no save; o Mestre devolve o envelope e manda ao mural | (c) dois blocos na pauta, o antigo ganha |
| 4 | **Pedido e mural = dois botões para o mesmo favor** (Hilda, M26–M27) | (a)+(d) |
| 5 | **O duelo do cartão não existe** (M60 → M61): *"Defender… o camarada desafia você para um duelo"* → `SEM ALVO NO REGISTRO`; o homem que o Mestre pôs com faca à frente do herói **não é registado** como alvo | (a)+(c) |
| 6 | **Pagar uma pessoa não debita** (M14: `◉ 21 → 21`) e **o Mestre deu a bolsa do morto a Jaco, o sistema deu ao herói** (M11: `◉ +8`) | (a)+(c) |
| 7 | **"Maçã" é "maca"** (M33): o veto do Narrador (`não há maca à venda`) e `armas à venda: Cimitarra` numa pergunta sobre uma fruta; a compra cria 2 rações e **0 maçãs** | (a) `mercado.js` |
| 8 | **Dois nomes, uma mulher:** Frida **do Mar** (espinha) / **da Vela** (núcleo) (M6–M8); **Hilda é "o taverneiro… ele"** (M22–M23) e **mulher** no núcleo | (a) núcleo ↔ elenco |
| 9 | **A pessoa do marco está em dois sítios:** a espinha manda procurar Tônia **"no Peixe Cego, em Sul Molhado"**; o núcleo a põe **no Píer Rachado, em Quebrado do Leste** na 3.ª resposta (e Frida diz *"pergunta pra ela"* uma resposta depois de ela puxar o herói pelo braço) | (a) |
| 10 | **O morto é gente viva:** "o homem que me devia a vida" é **Dário** (M24, inventado) e o Cronista o regista como **pessoa de Quebrado do Leste**; a pauta passa a dizer `Dário está em Quebrado do Leste, a 4 h`; **a pauta do M54 lista "Dário" entre os LONGE** | (a) o Cronista |
| 11 | **O mesmo homem, duas ofertas** (M4): `assina Otto` e `assina homem de capa de chuva` | (a) o Cronista (descritor como pessoa) |
| 12 | **O ameaçador que o Mestre mostra evapora** (M20): *"Tem dois carregando tocha"* → *"A ladeira está vazia"* ao primeiro passo | (c) |
| 13 | **O Mestre diz a ordem do sistema** (M9): *"A consequência é essa: a casa agora tem olhos"* — o `O FECHO: termine em a consequência do que eu fiz` ditado em prosa | (c) |
| 14 | **A pauta pede um romance** (M40): `[A UM PASSO — DECISÃO DO SISTEMA] Está prestes a acontecer: um romance… E É COM TÔNIA LODOSO` — o mecanismo antigo (`compasso`) **a empurrar um romance com a pessoa que a C3 reserva para o jogador abrir**; e **o laço `amor/1`** nasce de "defender" | (a) |
| 15 | **A palavra dada que ninguém deu** (M35: `✦ A palavra dada a Jaco Faro — entrou no diário`): o jogador **não prometeu nada** a Jaco; a missão é "ir a Sul Molhado" | (a) |

---

## Os defeitos, pela ordem em que partem a sessão

1. **"me volto" é partida (M50).** Uma frase de confronto com o elo — **o ponto alto do ato** — abre uma viagem que ninguém pediu, anda 4 h, fecha **uma missão com recompensa**, põe o herói noutra cidade para o sistema e deixa a prosa onde estava; **daí em diante o jogo mente** (a roda, os LONGE, a missão paga). É **a mesma classe do defeito 1 da 6.ª** (a pergunta lida como partida): a C0 fechou a **pergunta**, não o **verbo**. *Gravidade: alta.*
2. **A reviravolta não cai (M43–M55).** As duas pistas foram à cena (2 de 2), **a desconfiança nasceu no turno certo, e a confrontação, com as duas pistas e as palavras certas, ficou sem resposta**: o Mestre inventa um álibi e adia para "a maré baixa". **O ato inteiro depende de uma frase que o sistema nunca entrega.** *Gravidade: alta (é a razão de a C2 existir).*
3. **O que o Mestre põe à frente do herói, com faca, não existe (M20, M61).** O cartão anuncia um **duelo**; o ataque diz "sem alvo"; o ameaçador anterior "evapora". **O lado caro da decisão é falso** (e o seguro, grátis). *Gravidade: alta — a promessa do cartão é a razão de ele existir.*
4. **O pedido aceite é desmentido (M27).** O jogador toca em *Aceitar*; a pauta traz **duas ordens contrárias** e o Mestre devolve o envelope. **O mural e o pedido são dois botões para o mesmo favor.** *Gravidade: média-alta.*
5. **O dinheiro e a bolsa (M11, M14, M33–M34).** `+8` para o herói que a prosa deu a Jaco; **pagar uma pessoa não debita**; **"maçã" é "maca"**; as três medidas de distância. *Gravidade: média.*
6. **A pauta "cala" o coração em 68% das respostas** (23 de 71 com alguma linha) **e 15 seguidas sem nenhuma** (M9–M23); quando entra, entra bem (10 de 10 se a linha traz fala/objeto/imagem). *Gravidade: média.*
7. **Os testes que não são o que o jogador disse (M43, M47, M54).** *Investigação* → Percepção; *"chega de mentir"* → **enganar**; *"vou ouvi-la ainda esta noite"* → **"ouvir a ainda esta noite", Percepção 13, falha** (um turno e uma rolagem perdidos por uma promessa). *Gravidade: média.*
8. **Os nomes e os gêneros:** Frida do Mar/da Vela, Hilda "o taverneiro", Dário vivo, Otto/"homem de capa de chuva", Tônia/Hilda sem gênero no registo. *Gravidade: média-baixa* (a 6.ª tinha 4 deste tipo).
9. **O tique vira frase ou some:** Jaco 37% das falas, Tônia 13%, Lia 2 respostas (e o exemplo da tabela 2×), Hilda 3× à letra. *Gravidade: baixa-média.*
10. **A tela (fogueira):** a 800×451 a segunda linha da roda fica 14 px por baixo do campo e a **soleira aberta cobre a prosa (12 botões)**; a 467 o nome é cortado («Jaco F…»). *Gravidade: baixa — o aviso era real.*
11. **Latente:** `escada.degrau` ficou em 0 com `semAvanco` 5 e o `sinal` entrou na pauta e não foi dito; `O FECHO: calado à espera` em 15 pedidos; **`A UM PASSO: um romance` com a pessoa do núcleo**; o save a 396 KB.

---

## A qualidade da campanha

*A mesma régua da 4.ª, da 5.ª e da 6.ª.* Joguei como jogaria uma mesa: perguntei o que perguntaria ao Matt, agi, empaquei, ignorei um pedido de propósito, perdi dois testes, acusei o elo duas vezes. Notas de 0 a 5, com a passagem.

| # | ponto | 4.ª | 5.ª | 6.ª | **7.ª** | porquê, com a passagem |
|---|---|---|---|---|---|---|
| 1 | **o gancho: dá vontade de ir?** | 4 | 4 | 4 | **4** | *"Vai a Quebrado do Leste. Procura Tônia Lodoso." E uma das suas canções fala disso, sem dizer o nome.* — **o antecedente (artista) vira objeto de gancho: a canção.** Perde 1: a abertura fecha em pergunta de Jaco sobre uma Frida que ninguém conhece ainda. |
| 2 | **o mundo e o lugar: específicos ou genéricos?** | 4 | 3 | 3 | **3** | *salvo-conduto, selo e nome*; *Santa Rita da chuva*; *peixe de defumação longa*; o galpão com o cadeado em forma de peixe. **Mas "sal" em 30 de 71, "chuva" em 29, "cheiro" em 18**, e o mundo, de Sul Molhado a Quebrado do Leste, **não é um sítio, é três medidas**. |
| 3 | **as personagens: querem, têm voz, lembram-se de ti?** | 3 | 3 | 4 | **4** | **Lia** — *"São Brás da fechadura, quase me fez esperar"*; **Jaco** — *"'Ou você volta, ou leva a culpa. Não há terceiro caminho.' Dez anos, e eu ainda não escolhi."*; **Tônia** — *"Eu passei a vida inteira esperando alguém me dizer que falar adianta."*; Ambrósio e Pregado (os que o Mestre inventou) são os mais vivos. **Lembram:** Jaco liga o favor da Tônia à própria carta (M29); Lia *"Veremos quem acorda primeiro"*. **Não passa de 4:** o tique some (Tônia 13%), Hilda é "o taverneiro", **a Frida tem dois nomes**, Hilda e Frida são finas. |
| 4 | **o que está em jogo: pessoal e concreto?** | 3 | 3 | 3 | **4** | **Ignorar custou:** o pedido da Tônia do dia 1 virou, no dia 3, *"um velho camarada aparece e acusa-a em voz alta… 'Foi você que sumiu com a prata do voto'"* — e à noite ela confessa. *Pessoal e com rosto.* Jaco: *"uma criança que não é sua"*. **Mas** o prazo continua sem estar na tela (a carroça do carroceiro *"ainda não partiu"* aparece em 8 pautas e nunca parte), e o preço **"duelo"** do cartão era falso. |
| 5 | **a reviravolta e a revelação** | 3 | 3 | 3 | **3** | **Craft melhor do que nunca** (a pista que **se ouve**, no meio de uma **falha**; a que **se vê**, uma pena que cai de um caderno) — **e a revelação não vem**, com as duas dadas e o jogador a nomeá-las: *"A pena queimada é da minha mãe. O verso é do meu pai. E os dois estão mortos."* O álibi é bom; **é do Mestre, não do sistema**. |
| 6 | **a escalada e o ritmo** | 2 | 3 | 3 | **3** | **A melhor sequência é M15–M21** (Ambrósio, o beco, "dois carregando tocha", Tônia: *"Então decide logo"*) **e M40–M49 (o galpão)** + **M52–M60 (a crise, a fogueira, o cartão)**. **Cai** em M32–M35 (a maçã), em **M50–M51 (a viagem fantasma)** e em **M62–M71 (a estrada sem fera)**: **o ritmo cai pelo sistema, outra vez**. |
| 7 | **a agência: as tuas escolhas mudaram algo?** | 3 | 3 | 3 | **4** | **Mudaram:** quem escolhi para a fogueira (Jaco → a carta; Tônia → "fica comigo"); **ignorar** (a crise); **falhar** (a pista A entrou por uma falha); **o lado do cartão** (laço *amor/1*, o duelo). **Não mudaram:** *Aceitar o que Hilda pede* (desmentido), *Defender* (o duelo não existe), *pagar* uma pessoa (sem débito), **a confrontação com as duas pistas**. |
| 8 | **a prosa** | 3 | 3 | 3 | **3** | *"a voz é de sopa fria na boca de quem tem fome"*; *"Ele fala devagar, como quem solta uma âncora"*; **as muletas desceram (23 vs 32)**; sem repetição verbatim no empaque. **Entrou:** *"sal"* e *"chuva"* como cenário, **"A consequência é essa: a casa agora tem olhos"** (o sistema a falar), *"ri antes de terminar a frase"* 3×, *"Santa Rita da chuva"* 2×. |
| 9 | **o fecho de sessão** | 2 | 2 | 3 | **4** | Parei **vivo, a 10/10 PV, na estrada**, com **seis razões** para jogar a próxima: **o caderno de Lia e a "maré baixa"** (uma pessoa do núcleo a meio do arco), **Jaco e a criança que "quer ir junto"** (idem), **Tônia e Marlo, a confissão por fazer** (idem), a fera de cicatriz de anzol, o Torneio, a carta de Hilda. **Pessoas do núcleo largadas: Hilda** (o pedido desfeito) **e a Frida**. |

**Média: 3,6 de 5** (32 ÷ 9) — **a 6.ª deu 3,2, a 5.ª 3,0, a 4.ª 3,0**; o que subiu foi **o que está em jogo (3 → 4), a agência (3 → 4) e o fecho (3 → 4)**; o que **não** subiu, e devia (`coracao-c1-c2.md` §5): **as personagens ficaram em 4 (alvo 5)** e **a reviravolta ficou em 3 (alvo 4)**. **A 1, a 2, a 6 e a 8 não desceram.**
O que o número esconde: **a primeira metade (M1–M14) vale ~3,3; o Peixe Cego e o beco (M15–M21) ~4,0; o Píer Norte e as pistas (M36–M49) ~3,8; a fantasma e a crise (M50–M61) ~3,3; a estrada (M62–M71) ~2,8.**

### Onde a história prende, e onde esfria

**Prende:** (1) **quando há um gesto que é uma pessoa** — Lia a rezar a um santo de cada coisa enquanto corta a corda; Tônia a deixar a tigela de caldo meio cheia; Jaco a repetir *"dez anos"* — **o tique como voz**, não como frase; (2) **quando a ficha vem na fala da pessoa, de noite** — as três falas da fogueira; (3) **quando uma pista chega onde o jogador falhou** (M43) — **a falha vira presente**; (4) **quando ignorar custa** (M52).
**Esfria:** (1) **quando o sistema e a prosa discordam do lugar do herói** (M50–M56): o jogador deixa de acreditar no mapa; (2) **quando o cartão promete e o jogo não cobra** (M60–M61): a decisão deixa de ser uma decisão; (3) **quando a revelação é adiada pelo Narrador** (M45–M55): o jogador **faz tudo certo e a história não paga**; (4) **na estrada sem fera** (M62–M71): *"Alguém viu a fera"* **sem fera**.

### O que o sistema dá ao Narrador nesses momentos, e o que não dá

| o Narrador recebe | o que é | o que lhe falta |
|---|---|---|
| **`QUEM CARREGA` (fala/objeto/imagem)** | a fala do pedido; o verso; o caderno e a pena; a acusação | **cumprido 10 de 10** quando a linha é **fechada**; **0 de 2** quando é um **verbo** ("mente", "diz as saídas") |
| **`QUEM É`** | a ficha da pessoa **em 12 de 71** respostas | **o resto**: **15 respostas seguidas sem linha** (M9–M23); o tique some quando a linha não vem |
| **A confrontação do elo** | **nada** (M55: nenhuma linha de revelação) | **a verdade, em frase fechada**: o motor sabe quem é o elo, o que escondia, **e que o jogador tem as duas pistas** |
| **O cartão da decisão** | a escolha e o `defender` | **o alvo da consequência** (o duelo): o Cronista nunca registou o camarada como combatente |
| **A bolsa (preço)** | o preço do balcão (quarto 3, correto) | **o preço da pessoa** (os 5 cobres) e **o `maçã`** |
| **O sinal do degrau** | `é fato: entra nesta resposta` | **o lugar do herói** (a estrada, não o Píer) |
| **O `mundo se mexe`** | `Golem de Pedra A Boca do Fosso` | **uma cena que o ponha** (o vilão tem **0 de 71** respostas, e **tem só 2 linhas de envelope**) |

### Os 3 consertos de maior efeito

1. **"Me volto", "volto-me", "virar-se" não são partida; e o que abre viagem sem o jogador pedir não fecha missão.** O Intérprete só abre `jornada` por **verbo de partida + destino dito** (e o *"Entendi … como Sul Molhado"* **só com o destino na oração**); **uma `jornada` aberta por inferência não fecha `ir_a`**, e o `lugar` do herói **volta** ao que a prosa disse quando as duas divergem (`LONGE` contra o que o Mestre acabou de pôr à frente do herói). **Médio** (bug com teste que prova) · `rastro.js` (`VERBOS_DE_PARTIDA`: o reflexivo), `missoes.js`, `interprete`.
2. **A confrontação do elo entrega a verdade, em frase fechada, e a pauta cede o lugar.** **Quando o elo está em cena, as duas pistas estão `madura`s e a frase do jogador nomeia o elo + um sinal das duas (verso, pena, caderno, o nome dele), `avancarCoracao` devolve `QUEM CARREGA` com a revelação inteira, na voz dele**, em frase fechada (*"Foi {sombra} quem me mandou…"*), e os envelopes antigos (`O QUE VOLTA`, `O PASSADO VOLTA`, `A FORMA DESTA CENA`) **cedem a ela** — **o jogador cumpriu o que a spec pedia**. **Médio** (liga sinal dormente a tracker que existe) · `subtramas.js` (`avancarCoracao`/`revelacaoPermitida`), `pauta.js` (prio).
3. **O que o Mestre põe com faca à frente do herói existe, e o cartão que o promete cobra.** **A pessoa que o Mestre mostra com arma (o `camarada`, o `pescador`, os dois da tocha) entra no registo como alvo possível** no turno em que é mostrada (a regra de `criaturaMostrada` estendida a **pessoas armadas**); **o lado "duelo" do cartão abre mesmo o duelo** (ou o cartão não promete). **E o `Aceitar` do pedido corta o bloco do mural para a mesma pessoa** (uma ação, uma forma). **Médio→pesado** (muda o que o jogador vive: abre combate com NPC) · `agressao.js`, `subtramas.js` (`EFEITOS_DO_LADO`), `pauta.js`.

*(Fora dos três, **leve**: "pagar a uma pessoa debita" (`bolsa-da-frase`), `mercado.js` a ler "maçã", **uma Frida só** (o núcleo promove o nome do elenco), **Hilda é mulher** (o `(ela)` manda no `taverneiro(a)`), `Dário` não é gente viva, `A UM PASSO: um romance` calado com o núcleo até a C3; **para o desenho**: a roda a 467 px mostra o nome inteiro (uma coluna), a segunda linha a 800×451 não fica por baixo do campo, e **a soleira não cobre a prosa** (3 pedidos = 3 botões, não 9).)*

**E a proposta que mais mudaria o que o jogador vive:** ***o elo só se revela à fogueira.*** Hoje a verdade depende de uma frase que o jogador tem de acertar numa cena de pé, com o Mestre livre de a adiar — e **a sessão provou que ele a adia**. **A fogueira já existe, já tem a ficha na voz de cada um, e é o único sítio em que o jogo diz "o que de dia não diz".** Proponho: **quando as duas pistas do elo estão `madura`s e o elo está na roda, o gesto dele passa a ser *"…trauteia um verso que você não conhece"* e, se o jogador se senta com ele, a fala da fogueira **é a revelação** (frase fechada do motor, `QUEM CARREGA`), na noite — "convite" em vez de "confronto". O jogador **ganha a verdade por escolher quem merece a noite**, não por acertar numa frase; **o motor já sabe fazê-lo** (`fichaNaVoz`, `sentarAoFogo`, `revelacaoPermitida`); **o Narrador cumpre as frases fechadas 10 de 10**. É **pesado** (muda o que a fogueira é e quando a verdade cai), **reversível por tabela** (uma entrada em `FOGUEIRA_CONTA`), e **a razão** é a mesma das cenas do Matt: **as revelações que se lembram não são ditas numa discussão, são ditas ao lume**.

---

## O veredito

**O nosso Mestre toca uma sessão à la Matt Mercer? Com gente, sim — e agora com gente que tem ficha; com a história, quase; com as mãos, ainda não.**

**Com gente, sim.** *Lia reza a um santo de cada coisa enquanto corta a corda; Jaco guarda uma carta de dez anos e sabe de cor o que dizia; Tônia deixa uma tigela de caldo meio cheia e, de noite, confessa.* **13 linhas do coração, 10 cumpridas à letra**; **ignorar um pedido dá uma crise com rosto**; **a fogueira é o melhor sítio novo do jogo** (os gestos, o preço antes do clique, a resposta que não fecha a roda). **As duas pistas do elo vieram, na ordem, e uma delas no meio de uma falha** — **craft que não existia na 6.ª**.

**Com a história, quase.** **O elo está plantado, maduro e em cena — e a verdade não cai.** *"A pena queimada é da minha mãe. O verso é do meu pai. E os dois estão mortos."* **O jogador fez tudo o que a tabela pedia e ficou sem a revelação**: `reviravolta` = null, o ato 0 a 2 de 4.

**Com as mãos, ainda não.** **"me volto" abre uma viagem, fecha uma missão com recompensa e põe a prosa e o sistema em cidades diferentes**; **o duelo do cartão não existe**; **aceitar o pedido da Hilda é desmentido pelo mural**; **pagar uma pessoa não debita**; **"maçã" é "maca"**. **A história é de Matt; os botões, outra vez, de formulário.**

**Os cinco que mexem a sessão, pela ordem:** (1) o verbo "volto" lido como partida (e a viagem fantasma que fecha uma missão); (2) a revelação que o sistema não entrega; (3) o alvo que o Mestre mostra e o sistema não conhece (o duelo); (4) o pedido aceite que o mural desfaz; (5) a bolsa que não paga a pessoa. **E o que fica de pé:** a escuta (49 de 49), as linhas fechadas (10 de 10), **as duas pistas, a crise do pedido ignorado, a fogueira, o marco que fecha pelo fato**.

| | 4.ª (v9.371) | 5.ª (v9.393) | 6.ª (v9.406) | **7.ª (v9.416)** |
|---|---|---|---|---|
| respostas jogadas | 42 | 64 | 67 (55 cena + 12 luta) | **71** (71 de cena, 0 de luta) |
| janela do painel | 800×451 | 800×451 | 800×451 | **800×451 e 467×851** |
| herói | Sibila · Tiefling · Bruxo | Gaspar · Meio-orc · Clérigo | Tamsin · Gnomo · Maga | **Dornel · Draconato · Bardo** |
| perguntas do sistema | 4 de 14 | 5 de 16 | 8 de 20 | **6 de 14** (3 inventadas, 2 erradas, 1 esquivada, 2 de propósito) |
| onde a sessão partiu | M22–M26 e M35 | M16–M27 e M47–M64 | M19, M36–M47, o marco na porta | **M50 ("me volto"), M43–M55 (a revelação) e M60–M61 (o duelo)** |
| respondeu à pergunta | 11 de 16 | 20 de 24 | 38 de 42 | **16 de 17** |
| frase do jogador última linha | — | — | 57 de 57 | **49 de 49** |
| empurrões por resposta | 23 em 18/24 turnos (até 4) | 17 em 64, máx. 1 | 40 em 67, máx. 1 | **29 em 71, máx. 1** |
| o mundo anda quando empacas | nunca | dispara; 0 de 3 vira cena | dispara com fato; 2 de 3 dito, tarde | **a espera de 8 h trouxe a crise; o degrau 1: 0 de 1 dito** |
| `QUEM CARREGA` honrado na mesma resposta | — | — | `vem`: 0 de 3 | **10 de 13 (77%)**; 10 de 10 se a linha é fala/objeto/imagem |
| muletas (calado-espera + olhos + braços) | — | — | 32 em 67 | **23 em 71** |
| recusas falsas de lugar | 0 de 42 | 0 de 64 | 0 de 67 | **0 de 71** (mas **M50: lugar do sistema ≠ lugar da prosa**) |
| chamadas por resposta | 2,19 | 2,02 | 2,16 | **2,08** |
| system do Narrador (máx.) | — | 74.957 | 72.757 | **72.183** |
| as 9 notas | 3,0 | 3,0 | 3,2 | **3,6** |
