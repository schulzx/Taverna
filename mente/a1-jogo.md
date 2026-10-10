# A1 · o que a mesa diz além do Mestre: peça a peça (`jogo`, 10/10)

*Pedido da pessoa (10/10): "há coisas e informações que aparecem que não são
necessárias, isso acaba confundindo o player mais do que ajudando… veja se é
realmente necessário, e se for, se a forma que ela está aparecendo é a melhor
forma". A pessoa pôs isto na mão do designer de jogo, então quem decide aqui sou
eu, o `jogo`.*

*O que usei: o ANTES jogado por mim (`scratchpad/auditoria/antes.md`, árvore
`15c1595`, v9.362, 10 turnos e 50 peças) e o inventário do código
(`auditoria/inventario.md`, 145 peças, sem a #144, que não existe). Conferi no
código o que pesa na decisão: `BlocoSistema` (`App.jsx:3884`), `resumo.js`,
`ASSUNTO_DO_EMOJI` (`glifos.js:193`), `regras-jogo.js:133-170,314-325`,
`registrarLugar` (`App.jsx:7998-8057`), `responderMissao` (`App.jsx:17632`), o
mural (`App.jsx:10740`), `abas.js`, `marca-da-porta.js`, `golpe-final.js`
(`haEscolhaNoGolpe`), `adversario.js` (`menteDaCriatura`) e
`grade-de-batalha.jsx:497,636,885-917`.*

---

## §1 · A régua

Uma mesa com o Matt Mercer. Dela tirei cinco testes, e cada peça passa por
eles nesta ordem:

1. **A cena já disse isto?** Se a prosa disse, a peça é eco: **corta**. Um
   Mestre não repete por escrito o que acabou de dizer em voz alta.
2. **Alguém decide com este número?** Se ninguém decide nada com ele neste
   momento, ele **sai da frente**: vai para o lugar onde se decide (a cinta, o
   painel, a soleira) ou desaparece. *A mesa só mostra número quando o jogador
   decide com ele.*
3. **Contradiz a cena ou o estado?** A peça que desmente o Mestre custa mais do
   que dez peças a mais. Quando o jogador lê três preços para uma poção, ele
   deixa de acreditar nos três. **Essa é a pior falha, e o conserto é na
   verdade, não na tela** (§5). A tela, enquanto isso, não pode inventar uma
   quarta versão. Por isso o recibo (§3, A2) **lê a ficha, não a frase**.
4. **Fala do sistema?** "Sistema", "IA", "Narrador", "Cronista", "tokens",
   "aferido", "pela tabela", nome de mecanismo ou de painel: **corta a
   palavra**. Se o número é verdadeiro, quem o diz é o mundo (o cambista diz
   20). Se é uma correção, ela é feita em silêncio.
5. **Se fica, está no lugar e na hora certos?** O número que decide aparece
   **antes** do clique (veredito), na mão (soleira), e some quando fica velho.

**O critério de corte tem trava:** *nada se corta sem tradução quando é
necessário* (lei 3 da Fase V). Toda informação que hoje só existe numa linha de
sistema ganha morada **antes** de a linha morrer. O que é calado continua no
save, no envelope do Narrador e no teto do prompt, intactos. **Calar é coisa de
apresentação, e a memória do jogo não perde nada.**

**O que o ANTES me ensinou, e que manda na ordem do plano:** o que mais
confundiu não foi o excesso, foi a **contradição**. Foram 8 das 50 peças (16%):
o preço com três valores, a poção fantasma, o "Aceitar" depois de ter aceitado,
o lugar errado no topo, o "6 sofrido" quando sofri 3. O excesso se resolve na
tela (A e B). A contradição se resolve no motor (C). **Os dois planos andam
juntos, e cada um sozinho entrega só metade.**

---

## §2 · O veredito, peça a peça

Legenda: **corta** · **muda** · **fica**. Coluna "onde": **A** fora do `App.jsx`
(aprendiz) · **B** dentro do `App.jsx` (oficial, com o bastão) · **C** pedido ao
motor · **D** para a pessoa · **—** nada a fazer. Os números `#` são os do
inventário. As linhas **N1–N9** são o que achei jogando e o inventário não lista.

**Totais: 153 peças, sendo 144 do inventário e 9 achadas jogando. Corto 24,
mudo 53, ficam 76.**

### 2.1 · Flutuantes e sobreposições

*Família: são raras, são momento ou são segurança. Quase todas ficam.*

| # | peça | veredito | forma certa | motivo / exemplo | onde |
|---|---|---|---|---|---|
| 1 | Faixa de chegada | fica | — | É a morada da chegada. Passa a ser **a única** voz dela, porque a linha 🧭 (#32) se cala | — |
| 2 | Cerimônia do lugar novo | fica | — | Momento raro que merece pausa | — |
| 3 | "✓ guardado" | fica | — | Num save só em `localStorage`, é a única garantia. É convenção de plataforma: as certificações de console (TRC da Sony, requisitos do Xbox) exigem indicador de gravação. Ocupa 0 px e é passageiro | — |
| 4 | "não guardou" | fica | — | Falha que precisa continuar dita | — |
| 5 | Faixa de fase do chefe | fica | — | Muda a luta, e é rara | — |
| 6 | Seta da leitura | fica | — | Serve à leitura, é só aria | — |
| 7 | Espreita no alforje | fica | — | O jogador está noutro painel e a cena andou | — |
| 8 | Marca "novo" no retrato | **muda** | Na mesa (≥ md), a marca mora **na porta da coisa** (BOLSA, DIÁRIO no trilho) e **não no retrato**. O retrato só a carrega no telefone, onde o trilho se recolhe (R21). Além disso, **não acende o que a tela principal acabou de mostrar** (o recibo, a porta do aceite) | T4: o ponto dizia "há novo na bolsa" no meu retrato, e o botão BOLSA não dizia nada. T6: virou "há novo no diário" e a novidade da bolsa sumiu sem eu ter olhado. É a lei que o próprio `marca-da-porta.js` escreve ("não acende o que a tela principal já mostra"), aplicada à tela nova | A (`marca-da-porta.js`) + B (`App.jsx:1598`, 24750) |
| 9 | Pulso do selo de prazo | fica | — | Quando o prazo aperta, a decisão é hoje | — |
| 10 | Pulso do dado | fica | — | Feedback do Enter, com saída | — |
| 11 | Cerimônia de recalibração | **muda** | Tirar "o mundo e os seus **sistemas**" e dizer "o mundo se reorganiza" | Regra 4 | B (26088-26145) |

### 2.2 · Linhas de sistema no relato

**A decisão de família, que vale para tudo o que vem abaixo.** O relato passa a
ter **quatro moradas**, numa tabela por prefixo e padrão (`MORADA_DA_LINHA`, §3
A1):

- **`cena`**: fica à vista. É o padrão de toda linha que não está na tabela.
  *Na dúvida, fica visível* (a lei do próprio `resumo.js`).
- **`recibo`**: a linha não se desenha. O número dela aparece no **recibo do
  turno**, uma fila só, **debaixo** da prosa, **calculada pela diferença da
  ficha** (antes e depois do turno), e nunca lida da frase.
- **`luta`**: vai para **uma** dobra, "A luta", fechada.
- **`cala`**: a cena ou a tela já o disse. Não se desenha, e fica no save.

*O ledger como linha a linha é o defeito de origem. No ANTES, o mesmo turno
dava "◉ 30" na prosa, "◉ 20 pela tabela" na linha e "−15" na bolsa. Um recibo
que lê a ficha **não consegue** discordar da bolsa, porque é a bolsa. Discordar
da prosa ele ainda consegue, e esse conserto é o C1.*

| # | peça | veredito | forma certa | motivo / exemplo | onde |
|---|---|---|---|---|---|
| 12 | "◉ +n moedas" | **corta** | → recibo `◉ +n` | O número é verdade e a linha é ruído. A cinta já muda | A |
| 13 | "Você perdeu n PV." | **corta** | → recibo `−n PV` | A cena diz a ferida e o anel diz o resto | A |
| 14 | "✦ +xp XP — um feito de verdade" | **corta** | → recibo `+xp XP`, sem o comentário | O XP é o laço de recompensa e fica num chip. O comentário do juiz é bastidor | A |
| 15 | "✦ NÍVEL n ALCANÇADO!" | **corta** | O `ModalNivel` (#141) é o momento | É a mesma coisa duas vezes, e ainda podia sumir dentro de uma dobra | A |
| 16 | Companheiro sobe de nível | **muda** | "Isen chega ao nível 2." sem a instrução "(no acampamento, 'trilhar caminho'…)". A instrução vai para a porta do Grupo | Regra 4: é instrução de interface dita em voz de mundo | A (frase via tabela) / C8 na fonte |
| 17 | "Item obtido / perdido: x" | **corta** | → recibo `+ Poção de Cura` / `− Corda` | T4: a prosa já pôs o frasco na minha mão. T6: era a **fantasma** (C2) | A |
| 18 | "⚖ … aferido pelo sistema … pela tabela" | **corta** | → recibo com o débito **real**. O preço certo vai para a boca do cambista **antes** da prosa (C1) | A lei "o sistema não fala de si" quebrada diante do jogador, e errada duas vezes (T4, T6). É o Mestre sendo corrigido em público | A (calar) + **C1, C2** (a verdade) |
| 19 | "Dano ambiental … (calculado pelo sistema)" | **corta** | → recibo `−n PV` | A queda é a prosa que narra. O resto é regra 4 | A |
| 20 | "[raio] ◉ 100 · poção foram para a bolsa" | **corta** | → recibo | É a cobrança pela narração, e a prosa acabou de dizer o mesmo | A |
| 21 | "◉ −n moedas" (débito pela narração) | **corta** | → recibo | Idem | A |
| 22 | Tique de efeitos | **muda** | "x ativo (+b, t turnos)" **cala**, porque o chip da cinta (#138) já o diz. "x se dissipou" **fica**: o fim de uma bênção muda a próxima decisão | O ruído é o tique de todo turno, e a perda merece uma linha | A |
| 23 | Tique e saída de condição | **muda** | "✓ cond passou" fica. "fonte: −n PV" → recibo, e o chip diz a causa | Idem | A |
| 24 | Falha crítica → condição | fica | — | É condição nova e rara, e muda decisões | — |
| 25 | "🎲 d20 → 14 + 3 = 17 vs dif. 15 · sucesso" | **corta** | O véu do dado (#140) já mostrou o mesmo dado, com o mesmo alvo | O jogador acabou de ver o dado rolar e parar | A |
| 26 | Trivial, impossível, "não se pede" | **muda** | "Sem dado: isto é fácil para você." O impossível fica (é recusa). "Teste de X não se pede, quem decide se há dado é o sistema" vira "Aqui não há o que rolar." | O Matt diz "não precisa rolar", e não explica a arquitetura | C8 (`desafios.js:1653-1667`) |
| 27 | "⚖ Passou por 1 — e por um fio o mundo cobra…" | **muda** | A margem vai para o **véu** ("por um fio") e a linha cala. A cobrança o Mestre narra, porque o envelope já vai | Um fato só, no momento do dado | B (véu, `App.jsx:549-695`; linha 18048) |
| 28 | "🎲 O sistema pediu prova — Força (dif. 15)" | **muda** | "O Mestre pede um teste de Força." | Regra 4, e o véu abre logo em seguida | B (`App.jsx:10918`) |
| 29 | Heroísmo e sorte | **muda** | "+1 ponto de heroísmo" → recibo. "Dádiva do Destino" fica (momento) | O recurso vai para o recibo, o momento fica | A |
| 30 | Resultados sociais | **muda** | "◉ n moedas mudaram de mão" → recibo. "{npc} passa a ver você como hostil" **fica** | A relação nova decide quem me ajuda, e a prosa nem sempre a nomeia | A |
| 31 | "📍 Você está em X" / "📍 De volta a…" | **corta** | O cabeçalho da página (#73) é a morada do lugar | Em 4 de 4 vezes a prosa abriu pelo lugar (T1, T3, T10). Na T10, o "De volta" **contradisse** a prosa (C3). Era um fato com três sinais | A |
| 32 | "🧭 Chegada…" / "🗺 X entrou no seu mapa" / "fica sabendo de N lugares" | **muda** | A chegada se cala (a faixa #1 já a diz). O mapa novo vira **marca no MAPA**, que é onde se decide para onde ir | O nome de um lugar ouvido serve quando se planeja a viagem, não no meio da cena | A |
| 33 | Viagem | **muda** | "o sistema assume clima, encontros e tempo" sai, e fica "A caminho de X." A barra "▰▰▱ 40% · escreva que segue viagem" **cala**: a cinta em viagem (R17 §14) e a soleira "Seguir" já carregam isso | Regra 4, e uma instrução de interface no relato | B (`App.jsx:9984`, 23143) |
| 34 | "Entendi 'frase' como X" / "serve para 3 lugares… Qual?" | fica | — | Confirma uma interpretação e pede escolha. É veredito | — |
| 35 | Partida bloqueada | fica | — | É recusa com motivo | — |
| 36 | "Comida acabou… Gestão › Mercado" | **muda** | O caminho de menu vira a porta "▸ Mercado" (a linha-botão que já existe) | O mundo não dita caminho de interface. A porta abre com um toque | B (`App.jsx:6714`) |
| 37 | Exaustão | fica | — | Decide se durmo | — |
| 38 | "Você deixa h horas passarem" | fica | — | É o retorno do clique Esperar | — |
| 39 | O dia vira (reino, festa, rendas, boatos) | **muda** | Vira **uma dobra só, "O dia: n notícias ▾"**, com a primeira à vista. As rendas → recibo | Hoje são vários por dia, um atrás do outro. O Matt abre o dia com uma frase e guarda o resto para quem perguntar | A (morada `dia`) |
| 40 | Eventos globais, fios, deuses | **muda** | "Fio do mundo à vista — veja o Diário" → marca no Diário. "(reconhecido pelo sistema)" sai | Regra 4, e o caminho de menu vira marca | B (`App.jsx:9946`, 10776) |
| 41 | Missão aceita / passos | **muda** | O aceite vira **uma porta**: "▸ Diário · O que há em O Oratório das Velas · próximo: encontrar Cora Guarda-Portão". Sem os cinco números, porque o ◉ 60 a soleira mostrou **antes** do clique, e sem marca. Os passos ("etapa ✓ (2/4) → agora: …") ficam | T6: "🔎 … ◉ 60 (o combinado) · 95 XP · +3 fama · primeiro passo…" despejou o recibo de um clique cujo preço eu já tinha visto. A porta junta três peças (linha, marca, ida ao diário) numa | B (`App.jsx:17643`) |
| 42 | Missão concluída / falhada | **muda** | O momento fica ("Missão concluída: X") e os números vão para o recibo | O momento é o fecho, e a conta é a conta | A + B (17503-17531) |
| 43 | "anterior ao sistema de etapas" | **muda** | "Encerrada por você." | Regra 4 | B (`App.jsx:17628`) |
| 44 | Relógios e prazos | **muda** | O tique "●●○○ — 4 noites" **cala**, porque o selo da cinta (#136) o diz. "Começou a contar", "esta noite" e "o tempo acabou" **ficam** | Avisa só quando aperta (a lei `APERTOS` de R9) | A (por padrão: `●○`) |
| 45 | "📋 X tem um trabalho no mural" | **muda** | Só aparece se X **não** tem trabalho ativo comigo | T7: anunciou o trabalho que eu tinha aceitado na T6 | B (`App.jsx:10740`) |
| 46 | Abertura de luta (Terreno, tamanho, Iniciativa, "Encontro fácil", "entra no combate") | **corta** | Tudo isto a mesa de batalha mostra. No relato, vai para a dobra "A luta". "○ Encontro fácil — resolve-se sem sustos…" **corta de vez** | O sistema contando a dificuldade é coisa que um Mestre nunca diz, e ainda chega **depois** da luta, porque o relato fica oculto durante a batalha | A |
| 47 | "O sistema reconheceu X como divindade de GD n — Regra do Degrau em vigor" | **muda** | "X é de outra grandeza: o aço comum não o fere." | Regra 4. O número do GD fica na ficha do inimigo, na batalha | B (`App.jsx:5901`, 10216) |
| 48 | Golpes do herói | **corta** | → dobra "A luta". Já foram vistos na batalha, no rastro (#104) | T8: o mesmo golpe saiu em duas linhas seguidas (🎲 e ⚔, N2) | A |
| 49 | "🌍 VEZ DO MUNDO — rodada n" | **corta** | → dobra "A luta" | É bastidor de turno | A |
| 50 | Companheiros agem | **corta** | → dobra "A luta" | Idem 48 | A |
| 51 | Reações e oportunidade | **corta** | → dobra "A luta" | A batalha já disse no instante | A |
| 52 | Golpe final e fuga | **corta** | → dobra "A luta" | Idem | A |
| 53 | "◉ Espólios…" / "🧺 No chão… toque em EXAMINAR" / "O confronto se dissolve — o painel de combate se fecha" / "Você recolhe" | **corta** | Os espólios e o chão vão para **o fim da luta** (#106). O recolher vai para o recibo. "o painel de combate se fecha" corta de vez | A vitória chegava como linha mono entre outras seis. "toque em EXAMINAR" é manual de instruções. "o painel se fecha" é a interface falando de si | A + B |
| 54 | Poder único despertou | fica | — | Raro, e é momento | — |
| 55 | Queda e morte | fica | — | A vida está em jogo | — |
| 56 | Habilidade fora da luta | **muda** | "gastou 4 PM · restam 8/20" → a cinta e o recibo. A recarga a gaveta mostra. "custa 6 PM, você tem 3" fica (recusa) | O preço se vê **antes** (a pílula armada #79) e não depois | A |
| 57 | Milagres, fé, ascensão | **muda** | "+120 fiéis" → recibo. "o sistema lê sua jornada" sai | Regra 4 | B (`App.jsx:11252`) |
| 58 | Grupo e NPCs | **muda** | "n juntou-se ao grupo" fica. "— 1,2k de poder" sai | Ninguém decide com "poder" na hora em que alguém entra no grupo | C8 (`regras-jogo.js:190-196`) |
| 59 | Mercado, forja, bancada (clique em painel) | **muda** | O retorno do clique fica **no painel**, onde o clique foi. Não vai para o relato | O alforje cobre o relato, e a linha chega a um lugar que ninguém está olhando | B (vários sítios; baixa prioridade) |
| 60 | Talentos e atributos | **muda** | Idem 59 | Idem | B |
| 61 | Guilda, domínios, diplomacia, correio | **muda** | "Sua fama cresce: agora você é X" fica (título novo é momento). O retorno de clique fica no painel | Idem 59 | B |
| 62 | Masmorra e raide | fica | — | O estado da masmorra decide a próxima sala | — |
| 63 | Acampamento e descanso | fica | — | É o resultado da escolha que o jogador acabou de fazer | — |
| 64 | Capítulos, léxico, fim de sessão | fica | — | Raros e estruturais | — |
| 65 | Porta para aba nova | **muda** | As sub-abas de Gestão ficam (são a única porta). "▸ Códex — há o que registrar" **cala**: a aba nasce no trilho, com marca. E **nenhuma porta nasce dentro da dobra da luta** | T8: a porta nasceu no meio do golpe, e o texto nomeia o mecanismo | A |
| 66 | Conquista desbloqueada | **muda** | Sai "(equipe no Códex)" e entra a marca no Códex | O caminho de menu vira marca | B (`App.jsx:22954`) |
| 67 | "A mesa não anda sem a palavra do Mestre" | **muda** | "O Mestre ainda não contou o que você fez. Peça que conte." | Fica, mais curto. Os bastidores do turno saem | B (`App.jsx:8414`) |
| 68 | Falhas técnicas | **muda** | Sai "O sistema tropeçou" e entra "Este turno se perdeu. Tente de novo." | A falha precisa ser honesta, mas não é sobre a arquitetura | B |
| 69 | Resultados da recalibração | **muda** | "O arquivista propôs GD 3" vira linguagem de mundo | Regra 4. É raro e foi pedido pelo jogador | B |
| 70 | Exportar | fica | — | Retorno de clique | — |
| 71 | Modo criativo | fica | — | Ferramenta de quem a ligou | — |
| 72 | Balanço da luta (dobra) | **muda** | Vira **"A luta · 2 lobos caídos · 2 rodadas"**, seguido do recibo da luta (`◉ +7 · +14 XP · −3 PV`), e nenhuma soma de dano | T8: dizia "3 causado · 6 sofrido". Sofri 3 (aparei 6 → 3). A soma vinha da frase e não da ficha | A |

### 2.3 · Cartões, selos, pílulas e contadores da tela principal

*Família: esta é a mesa que funciona. O pé da página com o preço é exatamente
a forma certa: convite, na mão, com o número que decide. O que falha é ficar
velho.*

| # | peça | veredito | forma certa | motivo / exemplo | onde |
|---|---|---|---|---|---|
| 73 | Cabeçalho (lugar · luz · clima) | fica | — | É a morada do lugar. Mentiu na T10 por causa do motor (C3) | — |
| 74 | "o Mestre está tecendo" | fica | — | A espera é legítima, e "o Mestre" é figura da mesa | — |
| 75 | Linha do jogador | fica | — | Minha voz | — |
| 76 | Runa e ouvir | fica | — | — | — |
| 77 | Pílula de falha | fica | — | — | — |
| 78–79 | Pílulas armadas (milagre, habilidade) | fica | — | É o preço antes do clique | — |
| 80 | Barra do raide | fica | — | Decide a luta | — |
| 81 | Painel da masmorra | fica | — | Decide a sala | — |
| 82 | Painel do acampamento | fica | — | Decide a saída | — |
| 83 | Porta do capítulo | fica | — | — | — |
| 84 | Veredito de atacar quem não é inimigo | fica | — | O veredito antes do clique | — |
| 85 | Soleira | **muda** | Uma oferta **morre quando o fato se resolve por outro caminho** (a prosa aceitou, o herói saiu do lugar). "Examinar o chão" fica **presa ao lugar** onde está a coisa | T6: "Aceitar" depois de "Aceitou". T10: "Examinar o chão · 1 coisa" me seguiu da praça até a estalagem | B (lugar) + C4 (aceite pela frase) |
| 86 | "+N" da soleira | fica | — | — | — |
| 87 | Faixa da sala de dois | fica | — | É a espera do outro | — |
| 88 | Linha do veredito sobre o campo | fica | — | É a lei | — |
| 89–91 | O dado, o placeholder, o painel examinar | fica | — | — | — |
| 92 | Trilho de abas com marcas | fica | — | É a morada certa das marcas (ver #8) | — |

### 2.4 · Tela de batalha

| # | peça | veredito | forma certa | motivo / exemplo | onde |
|---|---|---|---|---|---|
| 93 | Cabeçalho "Taverna / mesa de batalha" | **muda** | A forma do quadro fica e o conteúdo passa a ser de mundo: "{lugar} · rodada n" | Lei 2 da Fase V: a forma da etiqueta fica e o que nomeia o produto ou a tela sai | A (`painel-batalha.jsx` ~1115) |
| 94–96 | Últimas palavras, participantes, linha do veredito | fica | — | — | — |
| 97 | "a esquiva ainda não pesa nos golpes deles — use Mover" | **corta** | **Esquivar sai da fileira** até ter regra. Quando o pedido aberto de B1 for atendido, o verbo volta | Um botão que só existe para dizer que não funciona é o sistema confessando um buraco. Do Esquivar ninguém pode depender, porque ele não faz nada | A (`painel-batalha.jsx:127-129`) |
| 98–105 | Verbos, bolsa, alvos, turno, tira, nesta batalha, rastro, foco | fica | — | É ali que se decide a luta. O rastro (#104) é a morada dos dados da luta, e é por isso que o relato pode calá-los | — |
| 106 | Fim da luta ("Respirar fundo →") | **muda** | **O fim da luta é o momento do ganho.** Mostra "Vitória", o espólio (`◉ +7 · +14 XP`), "no chão: Retalho de Couro [Recolher]" e "Respirar fundo →" | Nota 7 do ANTES: "ganhar não tem momento". A primeira vitória da campanha passou como linha mono no meio de seis. Peça nova (§7) | A + B (prop) |
| 107 | Janela de reação com relógio | **muda** | (a) O relógio fica legível **antes** de correr. (b) "deixar passar" não encavala a legenda "ÁREA DE MOVIMENTO" (N7). (c) Ver D1: com só uma opção, e grátis, a janela é uma decisão falsa | T8: expirou enquanto eu lia, e eu não sabia que havia relógio | A (b), D1 (c) |
| 108 | Golpe final "Poupar / Matar" | **muda** | Não pergunta a **fera** nem a **morto-vivo** (`menteDaCriatura` → `besta`, `morto`). Para gente, fica igual | T8: pediu duas vezes para eu poupar um lobo. Num lobo, a pergunta é ruído | **C7** |

### 2.5 · Rodapés e textos de ajuda

*Família: não interrompem, porque o jogador abre o painel para ler. Mas onde
falam do sistema, quebram a lei na cara de quem está procurando ajuda.*

| # | peça | veredito | forma certa | onde |
|---|---|---|---|---|
| 109 | Forja: "…sem gastar tokens" | **corta** | "tokens" é a conta do produtor, não do herói | B (`App.jsx:3654`) |
| 110 | Bancada: "O sistema rola a bancada…" | **muda** | "A bancada rola e consome o material." | B (3806) |
| 111 | "quando o sistema rola por trás da cena…" | **muda** | "Mostrar os dados que o Mestre rola por trás do escudo" | B (2870) |
| 112 | "o Cronista escreve a campanha…" | **muda** | "Escreve a campanha por extenso, como crônica" | B (2895) |
| 113 | Sair ao início | fica | — | — |
| 114 | Diplomacia: "Quem decide é o sistema, e não o Narrador…" | **muda** | "A resposta sai das forças em jogo, e não do humor de quem fala." | A (`painel-diplomacia.jsx:128`) |
| 115 | Talentos: "o sistema joga por eles… O Mestre só narra" | **muda** | "Eles lutam por conta própria." | A (`painel-talentos.jsx:127,160`) |
| 116 | Ascensão: "(o sistema aplica…)", "com a IA" | **muda** | Sai "IA" e sai "sistema" | A (`painel-ascensao.jsx`) |
| 117 | Heroísmo: "O Mestre é obrigado a aceitar…" | fica | É regra dita em termos de mesa, como o Matt diria | — |
| 118 | Diário: "arbitrado pelo sistema" / "antes do sistema de etapas" | **muda** | "preço da praça" / "encerrável por você" | A (`painel-diario.jsx:90-107`) |
| 119 | Ficha: "(o sistema vê: base)" | **muda** | "(conta como {base})" | A (`painel-ficha.jsx:466`) |
| 120–130 | Ficha, sintonia, carta, guilda, domínios, mural, masmorra, acampamento, códex, tempo, recalibração | fica | Já falam em termos de mundo ou de mesa | — |
| 131 | Criação: "nenhuma voz inventa regra" / "o sistema está traduzindo…" | **muda** | Sai a filosofia da casa e entra "Lendo a sua descrição…" | B (4079-5163) |
| 132 | Sala de dois | fica | — | — |

### 2.6 · A cinta, o tempo, os momentos

| # | peça | veredito | forma certa | motivo / exemplo | onde |
|---|---|---|---|---|---|
| 133–134 | Anel do herói, grupo | fica | — | O PV decide | — |
| 135 | Pílula da hora "08:10" | **muda** | **Hora cheia: "8h".** O minuto mora em O TEMPO (no toque) | É **a peça que mais aparece no ANTES (9 de 50)**, e com ela eu nunca decidi nada. O Matt diz "meio da manhã", nunca "oito e dez". O que decide no tempo (prazo em noites, loja, esperar 6h) é medido em hora e em noite. A luz da cinta continua a mudar nas viradas | A (`ui.jsx:2191`, `PilulaDoTempo`) |
| 136 | Selo de prazo | fica | — | Decide | — |
| 137 | ◉ e ◆ | fica | — | Decidem a compra. A bolsa mente porque o motor mente (C1) | — |
| 138 | Chips de estado vivo | fica | — | É a morada das condições, e é por isso que o tique (#22) se cala | — |
| 139 | Painel do tempo | fica | — | — | — |
| 140 | Véu do dado | **muda** | Ganha a margem ("por um fio", vinda de #27) | Um fato, um lugar | B |
| 141–143 | Nível, espólio, morte | fica | — | São os momentos | — |
| 145 | Veredito final (noite, duelo) | fica | Fora do beta | — |

### 2.7 · Achadas jogando (N1–N9)

| N | peça | veredito | forma certa | motivo / exemplo | onde |
|---|---|---|---|---|---|
| N1 | Eco do sistema na minha boca ("Ataco lobo 1", "Pego o cartaz: …") | **corta** | Os verbos da batalha vão para a dobra "A luta". O clique da soleira registra calado, e o retorno dele é a porta do aceite (#41) | "Eu não disse isso." É a mesa falando por mim | B |
| N2 | O mesmo golpe em duas linhas (🎲 … 5 de dano / ⚔ … 5 de dano) | **corta** | Dentro da dobra, uma linha por golpe ("⚔ Brida → lobo 2: 18+4=22 contra 14 · 5 · ☠") | É um fato só | A (fusão na dobra) |
| N3 | O "1" violeta em GESTÃO | **corta** | — | É `nGrupo` (o Isen). Os anéis da cinta já mostram o grupo, e um número sem nome é enigma, como foi para mim por dez turnos | B (`App.jsx:24750`) |
| N4 | "Aceitar" na soleira depois de a prosa dizer "Aceitou" | **corta** | Morre com C4 | É contradição | C4 |
| N5 | O chão inteiro numerado (~100 custos) antes de armar Mover | **muda** | **Escreve o custo só onde ele surpreende**: na casa cujo custo é diferente de passos × 1,5 m (terreno difícil, desvio). A área de movimento continua visível pelo tom | É a própria lei de E4 levada até o fim. Lá, o custo existe porque em 6 das 10 plantas o olho erra. Onde o olho acerta, o número é planilha. Assina o `desenho` (é lei de E4) | A (`grade-de-batalha.jsx:636,914`) |
| N6 | Lobos com retrato de gente | **muda** | Fera e morto-vivo ganham silhueta própria (`menteDaCriatura`) | Um lobo com rosto de homem lê-se como "bandido". Peça nova (§7) | A (`rosto.jsx`) |
| N7 | "deixar passar" em cima da legenda "ÁREA DE MOVIMENTO" | **muda** | A legenda cede quando a reação abre | É colisão de leiaute | A (`grade-de-batalha.jsx:1218`, `painel-reacao.jsx`) |
| N8 | Toast "o instinto aparou por você · 6 vira 3" | fica | — | Foi uma escolha feita por mim (o padrão), e eu preciso saber dela | — |
| N9 | Disco branco sobre Brida e o lobo depois de mover | **muda** (a confirmar) | Confirmar num navegador real antes de virar defeito | Pode ser coisa do headless | A, se confirmar |

*Fora da régua (não são peças, são mentiras do mundo), e todas vão para C:* o
retalho que a prosa me deu e não entrou na bolsa (T9, C5); o "durmo até de
manhã" que andou 10 min (T10, C6); a ficha "de mãos vazias" com a prosa me
fazendo limpar "a lâmina" (C9); o Isen que troca de gênero e os "caminhões" numa
fantasia medieval (C10).

---

## §3 · O plano A, fora do `App.jsx` (`aprendiz`)

**Depende do B1** (o relato sai do App). Sem ele, A1 a A3 não têm onde viver.
Ordem por ganho no roteiro.

| ordem | o quê | arquivo | peça nova? | ganho no roteiro |
|---|---|---|---|---|
| **A1** | **`MORADA_DA_LINHA` e `moradaDaLinha(texto)`**: a tabela das quatro moradas (`cena` · `recibo` · `luta` · `cala` · e `dia` para #39), por prefixo e por padrão (`/^Item (obtido\|perdido):/`, `/^Você (perdeu\|recuperou\|gastou)/`, `/^🎲 d20 →/`, `/^⚖ .*aferid/`, `/^📍 /`, `/^🧭 Chegada/`, `/^○ Encontro\|^◐ Encontro\|^● Encontro/`, `/^🌍 VEZ DO MUNDO/`, `/●○\|○●/` etc.), **cada linha com o porquê escrito**, como `MARCA_ACENDE`. **Lista branca do que se cala, e o resto é `cena`.** O `painel-relato.jsx` lê a tabela e não desenha `recibo` nem `cala` | `glifos.js` (puro) + `painel-relato.jsx` | não (só filtra) | −4 (📍 ×4) e é a base de A2 e A3 |
| **A2** | **O recibo do turno**: `reciboDoTurno(antes, depois)` puro, que compara duas fichas (moedas, PV, PM, XP, nível, heroísmo, essência, itens como multiconjunto de nomes) e devolve chips na ordem fixa ◉ · PV · PM · XP · itens. O sinal de menos é `U+2212` (lei de E4 §5). O recibo vazio não desenha nada. Desenha-se **debaixo da prosa** do Mestre, numa fila | `glifos.js` + `painel-relato.jsx` | **sim: `O recibo`** (§7) | −3 (T4 −2, T6 −1) e mata 3 contradições de tela |
| **A3** | **A dobra "A luta"**: as mensagens marcadas `naLuta` (B1), incluindo os ecos do jogador, viram **uma** dobra fechada. A linha de cima é "A luta · {quem caiu} · {n} rodadas" seguida do recibo da luta (da ficha, de quando a luta abriu até quando fechou). Dentro, uma linha por golpe (N2 fundido) e nenhuma porta | `painel-relato.jsx` | **sim: eixo de `A dobra`** (§7) | **−11 na T8** (13 peças do relato viram 1) |
| **A4** | **Hora cheia na cinta**: a `PilulaDoTempo` mostra "8h". A granularidade sai de tabela (`TEMPO_NA_CINTA.passoEmMinutos = 60`). O minuto continua em O TEMPO | `ui.jsx`, `estilo.js`/`constantes` da mesa | estado de peça (o `desenho` assina) | **−8** (T1–T7, T9) |
| **A5** | A marca não acende o que a tela principal acabou de mostrar (o item que o recibo listou, a missão que a porta do aceite abriu) | `marca-da-porta.js` | não | −1 (T4) |
| **A6** | **O fim da luta com o espólio** (#106, #53): Vitória, chips do ganho, "no chão" com Recolher, e "Respirar fundo →". `prefers-reduced-motion`: sem a entrada dos chips. O toque em "Respirar fundo" continua a sair, e nada fica bloqueado | `painel-batalha.jsx` | **sim: `O fim da luta`** (§7) | +1 peça na batalha que paga −2 no relato (espólios, chão), e é o momento que faltava |
| **A7** | Grade: custo só onde surpreende (N5). Legenda que cede à reação (N7). Esquivar fora da fileira até ter regra (#97). Cabeçalho de mundo (#93) | `grade-de-batalha.jsx`, `painel-batalha.jsx` | N5 é emenda de lei de E4 (o `desenho` assina) | ~100 números → poucos (não estava na régua do ANTES) |
| **A8** | Silhueta de fera e de morto-vivo (N6) | `rosto.jsx` | **sim: 2 glifos** (§7) | leitura do inimigo |
| **A9** | Morada do relato para #22, #23, #29, #30, #39 (a dobra "O dia"), #44, #56, #65 (Códex cala, porta nunca dentro da luta) | `glifos.js` (linhas da tabela A1) | #39 reusa `A dobra` | fora do roteiro (turnos com efeito, dia novo) |
| **A10** | Rodapés dos painéis: #114, #115, #116, #118, #119 | `painel-*.jsx` | não | regra 4 |

**O que prova A (catracas):**
- `testes/teste-a1-relato.mjs`: (1) todo prefixo de `ASSUNTO_DO_EMOJI` tem
  morada declarada (a lei de V3b, que recusa prefixo novo sem entrada, estendida
  à morada); (2) **as 50 peças do ANTES, com o texto literal**, caem na morada
  que este documento decide; (3) `reciboDoTurno` contra fichas de fixture,
  incluindo `null`, item repetido, sinal U+2212 e recibo vazio; (4) a dobra "A
  luta" de T8 resume "2 lobos caídos · 2 rodadas" e o recibo dá **−3 PV**, e não
  6.
- **Varredor `check-sistema-nao-fala.mjs`** (o `testes` cria): conta nas
  strings visíveis de `src/` (`texto:`, JSX, `title=`, placeholder) as palavras
  `sistema|IA\b|Narrador|Cronista|tokens|aferid|pela tabela`, com lista de
  exceções (envelope ao Narrador, comentário). **O número congela e só pode
  descer**, como a catraca D5h.1. Hoje são as linhas de #18, 19, 26, 28, 33, 40,
  43, 47, 57, 67, 68, 69, 109-119, 131.
- O teto do prompt **não muda**: tudo isto é apresentação.

---

## §4 · O plano B, dentro do `App.jsx` (`oficial`, com o bastão)

| ordem | o quê | onde | peça nova? | ganho |
|---|---|---|---|---|
| **B1** | **O relato sai do App.** `BlocoSistema`, `portaDaLinhaDeSistema`, `semSetaQueMente`, `PORTAS_DO_SISTEMA` e o laço que desenha `agruparMensagens` vão para `src/painel-relato.jsx`. O App passa a renderizar `<Relato mensagens aoAbrir …/>`. Dois campos **novos** em cada mensagem, que a versão antiga ignora (permitido pela ordem de 28/09): `naLuta: true` em toda mensagem empurrada com `combateRef.current` aberto, incluindo os ecos do jogador; e `recibo` na mensagem do Mestre | `App.jsx:3855-3960` + o sítio do `agruparMensagens` | não | é a base de A1–A3. *Mover vale mais que remendar*: depois de B1, o relato inteiro é da mesa |
| **B2** | **O antes da ficha.** Tirar uma foto da ficha ao **enviar** o turno e, no **fim** do turno (depois do Cronista, porque a cobrança pela narração de 9791 e 9807 cai ali), calcular `reciboDoTurno` e substituir a mensagem do Mestre por uma nova com `recibo` (imutável). Na luta, a foto é a da abertura. Tudo em `calou(...)`: se o recibo falhar, o turno segue sem ele | `pushMsgs` (8393), fim do turno | não | habilita A2 |
| **B3** | **Os ecos e o aceite.** Os verbos da batalha não viram fala do jogador fora da dobra. O clique "Aceitar" da soleira não escreve "Pego o cartaz". `responderMissao` passa a empurrar **a porta** "▸ Diário · {título} · próximo: {passo}" (a linha-botão que já existe abre o Diário no cartão) | `App.jsx:17643` + o caminho do cartaz | não (reusa a porta) | **−2** (T6) |
| **B4** | Mural: não prega quem já tem trabalho ativo comigo | `App.jsx:10740` | não | **−1** (T7) |
| **B5** | Soleira: "Examinar o chão" presa ao lugar da coisa | soleira (23803-24253) | não | tira a faixa velha da T10 |
| **B6** | Contador "1" de GESTÃO sai (N3). A marca do retrato só aparece quando o trilho não está à vista (#8) | 24750, 1598 | não | menos 1 enigma permanente |
| **B7** | O espólio e o chão vão para a `TelaDeBatalha` no fim (prop de A6) | o caminho da vitória (~10297) | não | habilita A6 |
| **B8** | Lote de frases "o sistema fala de si": #11, 28, 33, 36, 40, 43, 47, 57, 66, 67, 68, 69, 109-112, 131. Margem do dado no véu (#27/#140) | as linhas citadas em §2 | não | regra 4. A catraca do varredor desce |
| **B9** | A linha 🛡 do golpe deles diz o dano **depois** da reação ("6 → 3, aparado") | ~16003 | não | o detalhe da dobra deixa de mentir |
| **B10** | O retorno dos cliques em painel (#59-61) fica no painel | vários | talvez (retorno no painel) | baixo no roteiro, e fica por último |

**O que prova B:** `npm run build` limpo, `npm test` verde, e **eu jogo o DEPOIS
com o mesmo roteiro** (`auditoria/roteiro.md`, com `MSYS_NO_PATHCONV=1` no T8),
contando com a mesma régua.

---

## §5 · Pedidos ao sistema (C), redigidos para `mente/pedidos-ao-sistema.md`

*Todos são da Fase MM pela pergunta da pessoa: "a resposta é verdade?". Hoje a
prosa diz 30, a tabela diz 20 e a bolsa perde 15. São três verdades, logo
nenhuma.*

- [ ] **o preço de uma compra decide-se antes da prosa, e a bolsa que não chega recusa** · de: A1 (jogo) · 10/10 · médio
  T4 do ANTES: "Compro uma poção de cura". A prosa disse "trinta moedas", `regras-jogo.js:162-169` aferiu ◉ 20 ("faixa justa ◉ 5–20 pela tabela") e a bolsa, que tinha 15, foi a 0. **Para quê:** quem diz o preço é o cambista, e ele tem de dizer o preço certo. O jogador tem de vê-lo antes de pagar (o veredito antes do clique), e não receber uma correção depois. **O que se pede:** quando a frase do turno é uma compra (o detector de intenção já existe para outros verbos), o motor resolve item e preço pela tabela **antes** da chamada ao Narrador e põe na pauta "o preço é ◉ N; o herói tem ◉ M" (`naoPode` se M < N). A aferição de depois continua como rede e **nunca escreve linha visível** (a tela já a cala, A1). Com suíte. Irmão de `vereditoDaFrase` (V6b).

- [ ] **uma mudança da ficha não se repete no turno seguinte sem a frase pedir** · de: A1 (jogo) · 10/10 · médio
  T6 do ANTES: "Aceito o trabalho." trouxe "⚖ Preço aferido: ◉ 10 (o cobrado era ◉ 30)" e "Item obtido: Poção de Cura", **uma segunda poção**, sem compra nenhuma e com a bolsa em 0. O Mestre reenviou nos `mudancas` a compra do turno anterior. **Para quê:** o recibo do turno (A2) lê a ficha e vai mostrar a poção fantasma, porque ela entrou de verdade na bolsa. A tela não pode esconder uma verdade, então o conserto tem de ser na entrada. **O que se pede:** `adicionar_itens` acompanhado de `moedas < 0` só vale quando a frase do turno é uma compra, ou quando a prosa nomeia a troca **neste** turno. A repetição exata do par (item, débito) do turno anterior é recusada e vai a `naoPode`. Com suíte.

- [ ] **o lugar só volta à cidade quando a prosa o tira de lá** · de: A1 (jogo) · 10/10 · médio
  T10 do ANTES: a prosa me sentou no salão da Espada & o Punhal. Depois dela veio "📍 De volta a Forte escura — A Espada & o Punhal fica para trás" e o topo virou FORTE ESCURA. **Para quê:** o cabeçalho é a morada do lugar desde que o 📍 se calou (A1). Se ele mente, mente sozinho. **O que se pede:** em `lerLugarDito` (`lugar.js`), a ação `volta` vinda do Cronista exige que a narração **deste** turno contenha a saída (o mesmo crivo que MM15 aplicou ao campo do Mestre: "só volta quem escreveu que volta"). Com o caso da T10 na suíte.

- [ ] **a frase "aceito o trabalho" aceita a oferta da soleira** · de: A1 (jogo) · 10/10 · médio
  T6 do ANTES: escrevi "Aceito o trabalho.", a prosa disse "Aceitou", e a soleira continuou a oferecer "Aceitar" um trabalho de uma Cora que nunca apareceu na cena. **Para quê:** a frase e o botão são duas caras da mesma ação (*uma ação, uma forma*). Quando só a frase acontece, a prosa e a mesa se desmentem. **O que se pede:** com **uma** oferta de missão na soleira e uma frase de aceite ("aceito", "fechado", "topo", "pego o trabalho"), registrar como `responderMissao(id, true)` **antes** da chamada ao Narrador, com o envelope do aceite na pauta. Com duas ou mais ofertas, nada: a soleira pergunta. Com suíte.

- [ ] **"reviro e guardo o que prestar" recolhe o que está no chão** · de: A1 (jogo) · 10/10 · médio
  T9 do ANTES: a prosa disse que guardei o retalho de couro, e ele não entrou na bolsa. O único caminho é o botão Examinar, e a prosa não sabe disso. **Para quê:** o Mestre narra como verdade o que a ficha nega. **O que se pede:** com itens no chão ao alcance e uma frase de recolha ("pego", "guardo", "recolho", "reviro… e guardo"), recolher o que a frase nomeia (ou tudo, se ela diz "o que prestar") antes do Narrador. A prosa passa a ser verdade. Com suíte.

- [ ] **"durmo até de manhã" numa estalagem descansa** · de: A1 (jogo) · 10/10 · médio
  T10 do ANTES: "pago um quarto e durmo até de manhã" e o relógio andou de 08:51 a 09:01. Ninguém me disse que o descanso não aconteceu. **Para quê:** o tempo é a peça que mais aparece na tela, e mente justamente quando importa. **O que se pede:** frase de dormir em lugar com cama (estalagem, quarto) → descanso longo pelo `descanso.js`, relógio até a manhã seguinte e o preço do quarto pela tabela, com o veredito na linha de cima do campo **antes** de enviar, quando `vereditoDaFrase` existir. Com suíte.

- [ ] **o golpe final não pergunta a fera nem a morto-vivo** · de: A1 (jogo) · 10/10 · leve
  T8 do ANTES: "Poupar / Matar" duas vezes para dois lobos. **Para quê:** a pergunta só é cena quando há quem se renda. **O que se pede:** em `haEscolhaNoGolpe` (`golpe-final.js:251`), um motivo novo, `"sem_rendicao"`, quando `menteDaCriatura(nome, desc, lex)` dá `besta` ou `morto`. O painel não abre, e a fera cai. Na suíte, o lobo, o lobo esquelético e o bandido.

- [ ] **as falas do motor que nomeiam o sistema** · de: A1 (jogo) · 10/10 · leve
  A tela já cala a maioria (A1), mas a frase continua indo para o save, para a crônica e para o Códex. **O que se pede** (troca de string, com o teste da frase quando houver): `regras-jogo.js:143,155,169` (as três aferições: a frase vira só o fato, "◉ N", sem "pelo sistema" nem "pela tabela"); `:315` ("calculado pelo sistema" sai); `:479` ("⚖ PV aferido" vai **só** ao envelope, sem linha); `:190-196` ("— 1,2k de poder" sai); `:309` (a instrução "(no acampamento, 'trilhar caminho'…)" sai); `desafios.js:1653-1667` ("quem decide se há dado é o sistema" → "aqui não há o que rolar"); `abas.js` `codex: "há o que registrar"` (a tela cala, mas o texto fica no save).

- [ ] **a ficha inicial tem a arma que a prosa dá** · de: A1 (jogo) · 10/10 · médio
  ANTES: Brida, Guerreira (Cavaleiro), começa com a ficha "Nada equipado — de mãos vazias", e na T9 a prosa me faz "limpar a lâmina". **Para quê:** o que o sistema sabe e não conta ao Narrador é defeito. Aqui é o contrário: o Narrador supõe o que o sistema não tem. **O que se pede:** ou a classe começa com o equipamento da tabela da classe, ou o envelope diz ao Narrador "o herói está de mãos vazias". O sistema escolhe qual dos dois.

- [ ] **o gênero dos NPCs nomeados vai na pauta, e a época do mundo também** · de: A1 (jogo) · 10/10 · médio
  ANTES: Isen é "ele" até a T4 e "ela" desde a T5. Na T7 aparecem "dois caminhões de entregas" numa fantasia medieval. **Para quê:** um jogador que pergunta ao Matt "quem é Isen?" recebe sempre a mesma pessoa. **O que se pede:** o gênero do NPC nomeado entra na ficha dele (o campo existe?) e na seção da pauta que já leva o NPC presente. O léxico da época vai a `naoPode` ("sem veículo a motor", em fantasia medieval). Sem bloco estático novo, só pela pauta.

---

## §6 · Para a pessoa decidir (D)

**D1 · A reação só abre quando há escolha com preço.** Na T8, a janela "⚔
aparar · 0 PM / deixar passar" abriu com relógio, expirou enquanto eu lia, e o
padrão aparou (6 → 3). Com uma opção só, e grátis, **não há decisão**: há um
teste de reflexo para ganhar o que o instinto já ganha. Proposta: a janela abre
quando há **duas** reações com preços diferentes (aparar contra Escudo Arcano
por PM) ou quando a única custa alguma coisa. Fora disso, o instinto decide pela
preferência (K1) e o rastro mostra "aparou: 6 → 3". **Por que é dela:** tira da
luta um momento que o jogador vive hoje. Ganho: −1 a −2 peças por rodada
inimiga, e a luta deixa de ter relógio onde não há escolha. (O conserto é em
`ritmo-da-reacao.js`, que decide se a janela abre, e por isso é C. Fica aqui
porque muda o que o jogador faz.)

**D2 · A proposta ambiciosa: "o Mestre diz o número, a mesa só anota".**
Depois de C1, C2, C4 e C5, a prosa passa a ser verdade, e o recibo (A2) vira
redundância honesta: o cambista disse 20, a bolsa perdeu 20. Proponho então
**aposentar o recibo também**. A cinta passa a **anotar** o que a voz disse:
o ◉ desce de 15 para 0 com um "−20" que sobe e some em 1,2 s (instantâneo com
`prefers-reduced-motion`, e nada que bloqueie entrada), e o item **cai na
BOLSA** com a marca. O relato fica **só prosa, portas e recusas**, como uma
mesa onde o Mestre fala e o jogador escreve na ficha. É o melhor RPG de mesa do
mundo pela régua da própria pessoa: **a mesa só mostra número quando se decide
com ele, e quem diz o número é o mundo.** Previsão: 2,1 → ~1,4 peças por turno
no mesmo roteiro, e zero linhas de ledger. **Por que espera a pessoa:** muda o
que o jogador lê depois de cada turno, e o recibo é a rede que ela viu nascer.
Um commit revertido desfaz, mas a ordem é minha mostrar e dela dizer.

**D3 · A luta devolve a cena ao Mestre na própria mesa de batalha.** Hoje o
"Respirar fundo →" leva de volta à tela principal, onde a prosa da vitória
chega depois. Proposta: as últimas palavras (#94) do fim da luta **são** a
narração da vitória, e a volta à tela principal já cai na cena seguinte. Muda a
ordem do que se vê, e por isso é dela.

---

## §7 · As peças que peço ao `desenho`

*Eu componho, ele fabrica. Cada peça passa pelo Figma antes do código.*

1. **`O recibo`** (A2). Uma fila de chips, glifo + número, **debaixo** da prosa.
   O momento: aparece com a prosa, nunca antes e nunca sozinho. Requisitos meus:
   ganho e perda distinguidos **por sinal** (`+` / `U+2212`) e por glifo, e a cor
   não é canal (lei de R1). Teto de chips na mesa e no telefone, e o que passa
   vira "+N" (a gramática da soleira). Item com nome inteiro até o piso de
   truncagem (§21). Altura de uma linha de `TIPOS.maquina`, com 0 px quando
   vazio. Contraste ≥ 4,5:1 sobre `panel`.
2. **`A dobra` com eixo `Luta`** (A3). O cabeçalho diz quem caiu e as rodadas e
   leva o recibo da luta em linha. Fechada por padrão. Por dentro, as linhas do
   rastro (a mesma gramática do #104, para a luta ter **uma** cara de log).
3. **`O fim da luta`** (A6). "Vitória", chips do ganho (a mesma peça do recibo,
   em tamanho de momento), "no chão" com Recolher, e "Respirar fundo →". Saída:
   o toque em "Respirar fundo" funciona desde o primeiro quadro.
   `prefers-reduced-motion` sem entrada animada.
4. **Os glifos `fera` e `morto`** (A8), na família de `GLIFOS`, para o rosto de
   criatura que não é gente.
5. **Estado da `PilulaDoTempo`: hora cheia** (A4). O `desenho` assina o formato
   ("8h", ou "8 h", com espaço fino?) e a regra de virada da luz.
6. **Emenda à lei de E4, "o custo onde surpreende"** (N5). Ele assina, porque a
   lei é dele. A minha medida para defender: no tabuleiro aberto da T8, quantas
   casas alcançáveis têm custo ≠ passos × 1,5 (espero < 10 de ~100).

---

## §8 · A previsão

Mesma régua do ANTES (cada coisa fora da prosa que nasce ou muda na tela por
causa do turno), mesmo roteiro, com **o plano A + B construído**, sem C nem D:

| turno | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | **total** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ANTES | 4 | 1 | 3 | 5 | 1 | 8 | 2 | 21 | 1 | 4 | **50** |
| **DEPOIS (A+B)** | 2 | 0 | 1 | 2 | 0 | 4 | 0 | 10 | 0 | 2 | **21** |

- **5,0 → 2,1 peças por turno (−58%). Sem a luta: 3,2 → 1,2.**
- De onde saem as 29: hora cheia **−8** · a luta numa dobra só com o seu
  recibo e o fim da luta como momento **−11** (13 peças do relato → 1; a
  batalha ganha 1, o fim) · 📍 calado **−4** · recibo no lugar das linhas
  de ledger **−3** · aceite como porta e sem eco **−2** · mural sem repetição
  **−1**.
- **O que sobra, peça a peça:** T1 topo + porta Mercado. T3 topo. T4 ◉ na cinta
  + recibo. T6 recibo + porta Mural + soleira "Aceitar" + porta do aceite. T8 a
  dobra "A luta" + Poupar/Matar ×2 + reação + toast + fim da luta + ◉ + PV +
  botão CÓDEX + soleira "Examinar". T10 topo + a hora (8h → 9h).
- **Contradições à vista: 8 → 4 com A+B.** Sobram a prosa "30" contra o recibo
  "−15" (T4), a poção fantasma no recibo (T6), o "Aceitar" depois de aceitar
  (T6) e o topo na rua (T10). **Todas quatro são do motor**, e a tela não pode
  apagá-las sem mentir. **Com C1–C4: 0.**
- **Com C** (C2 tira o recibo fantasma, C4 tira o "Aceitar", C7 tira os dois
  Poupar/Matar): **21 → 17, 1,7 por turno**. **Com D1:** ~16, 1,6. **Com D2:**
  ~1,4.
- **Nada custa o turno:** nenhuma peça nova bloqueia a entrada. O fim da luta
  sai no primeiro quadro, e todo cálculo novo no App entra em `calou`. **O teto
  do prompt não muda:** é tudo apresentação, e o Narrador continua a receber
  exatamente o que recebia.

**Como provo:** jogo o DEPOIS com `auditoria/roteiro.md`, na mesma janela de
1440×900, com o mesmo save do turno 0, e conto. O alvo é **≤ 2,3 por turno** (a
previsão com 10% de folga, porque o Mestre responde diferente a cada vez e a
prosa pode trazer uma porta a mais) e **nenhuma contradição que não esteja na
lista dos quatro do motor**. Se der mais, escrevo onde errei a conta.
