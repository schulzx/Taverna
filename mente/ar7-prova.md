# AR7 · a prova jogada (v9.616, 06/11/2026)

Quem jogou: o `jogo`, em `taverna-sem-ia` (porta 5199), a **1906×860** (`innerWidth` 1906) e a **375×812**.
Uma campanha nova (Fantasia, Guerreiro Cavaleiro, Osric no grupo), depois posta no nível 3 para abrir os Talentos.
Usei o DOM (`getBoundingClientRect`, `elementFromPoint`) e a árvore, não a captura: ela congelou duas vezes.
Não havia save antes. No fim apaguei o `taverna_save_v1`, deixei as duas chaves `taverna_cfg_*` que já lá estavam
e repus a janela.

> **Para quem repetir:** o menu lê o save quando monta. Injetar com o menu aberto e carregar em seguida
> **não pega**. Tem de ser: recarregar → injetar → **recarregar outra vez** → Continuar. E com um turno
> pendente (`guardado`), o jogo repõe a ficha de antes do turno: ponha `guardado = null` ao injetar.

---

## As portas, uma a uma

| porta | 1906×860 | 375×812 | ação usada | Fechar / Esc |
|---|---|---|---|---|
| carta do herói | «O herói», tela inteira, ficha-carta | a mesma, com abas Ficha · Equipamento | ver «Perícias e detalhes» | Fechar volta à mesa, sem nada por baixo; Esc idem |
| Bolsa | **a mesma tela**, rolada até à mochila (scrollTop 322) | a mesma, aberta em **Equipamento** | «Dar a… Osric»: a faca passa e a narração regista | idem — mas veja D4 |
| carta do companheiro (Osric) | «A bolsa de Osric» | a mesma, em Equipamento | «Passar a Halvard»: volta | idem |
| Grupo | tela inteira: carta grande, vínculo, «sabe fazer» | dentro da **gaveta** «Gestão» | abrir a bolsa dele; abrir «Explosão Mística» | ✕ no canto; Esc idem |
| Talentos (nível ≥ 2) | tela inteira, a árvore | dentro da gaveta «Gestão» | aprender Investida: o veredito antes (2 → 1 ponto, 3 PM, «só sai se recomeçares») | ✕ no canto; Esc idem |
| Mercado | tela inteira, com as bancas | dentro da gaveta | comprar rações: 15 → 8 moedas, «ficas com 8» antes do clique | Fechar; Esc idem |
| **Pessoas** | **a gaveta velha «Gestão»** (320 px à direita) | a gaveta | — | ✕ da gaveta; Esc idem |
| **Mural** | **a gaveta velha «Gestão»** | a gaveta | — | idem |
| Diário | tela inteira (missão, próximo passo, etapas, o que se ganha) | gaveta com Em curso · Ofertas · Estante | tocar a missão | Fechar; Esc idem |
| Mapa | tela inteira | tela inteira | — | ícone «Voltar à cena (Esc)»; Esc real fecha |
| chip «Pessoas —» da narração | **gaveta velha** | gaveta | — | — |
| chip «Mercado —» da narração | Mercado, tela inteira | gaveta | — | — |
| Guilda, Códex, Ascensão, Casa | não aparecem numa campanha nova nem no nível 3 sem jogar; **não provados** | | | |

**O defeito da v9.605 não voltou.** Em todas as portas, o Fechar (ou o ✕, ou o ‹) deixa zero camadas
`fixed` à vista, e o Esc também.
**Nada transborda na horizontal**, nos dois tamanhos e em nenhuma tela: `scrollWidth` é igual à largura.
A fila de bancas do Mercado no telefone rola de lado, e isso é de propósito.

---

## Os defeitos, por gravidade

### Alta: uma função perdida e uma tela antiga à vista

**D1 · Ao aposentar a ficha antiga, quatro coisas ficaram sem casa.** A AR1 prometeu que nenhuma função
se perdia. O bloco `App.jsx` 2485–2779 está desligado por `GAVETAS_ANTIGAS.ficha = false`, e era o único
sítio que mostrava:
- **os mantimentos:** 🥖 rações, 💧 água e 🕯 tochas, quantos dias duram e a exaustão (linhas 2602–2620);
- **«Quando um golpe chega»:** Eu decido · Eu decido, sem pressa · *verbo* sempre · Deixar passar (2555);
- **«Ao derrubar um inimigo»** (2589);
- **a lista das dádivas** (2540 e 2663).

Para repetir: no Mercado, compre «Rações de viagem». As moedas descem e a narração confirma. Depois
procure as rações na Bolsa, na Ficha ou em «Perícias e detalhes»: não estão em lado nenhum. O save
diz `racoes: 11`. **O jogador paga e não vê o que comprou.**

**D2 · Pessoas e Mural ainda abrem a gaveta velha.** No 1906, a carta do herói → «Pessoas» (ou «Mural»,
ou o chip «Pessoas —» da narração) fecha a tela do herói e deixa à vista a gaveta de 320 px. Ela chama-se
«Gestão» e tem a fila antiga de abas: Ficha · Grupo · Pessoas · Talentos · Mercado · Mural. Por dentro,
Pessoas é uma lista com oito botões de relação (Aliado … Inimigo), e o Mural é texto corrido. Dali, a
aba «Ficha» abre a tela nova por cima da gaveta, que fica por baixo. **São duas linguagens na mesma viagem.**

### Média: uma ação com várias caras, e uma promessa que não se cumpre

**D3 · Fechar tem quatro caras.**
- «Fechar» em texto, dentro da coluna central (x≈1421), no Herói, na Bolsa, no Mercado e no Diário.
- ✕ em ícone, no canto da janela (x≈1826), no Grupo e nos Talentos.
- ‹ no telefone, na tela do herói.
- O ícone do Mapa, com o nome «Voltar à cena (Esc)».

Uma ação, uma forma. O caminho é o `CabecalhoDaTela` (já existe em `painel-talentos.jsx`) em todas as telas.

**D4 · Pela Bolsa, no 1906, o Fechar abre fora do ecrã.** A tela abre rolada 322 px até à mochila. O
cabeçalho não é fixo, e o Fechar fica em y = −290. Só o Esc fecha sem subir antes. O cabeçalho tem de
ser fixo, ou o Fechar tem de estar também em baixo.

**D5 · No Grupo, «Ver a ficha · atributos e talentos» abre a bolsa.** Leva à mesma tela de «Abrir a bolsa
de Osric» (`aria-label` «A bolsa de Osric…»): PV, PM, CA, encaixes e mochila. Não mostra atributos nem
talentos. São dois botões para um destino, e a etiqueta promete o que a tela não tem.

**D6 · Na mochila, os encaixes estão mortos.** O encaixe ocupado é uma `div`: não tem nome nem ação, e
tocar não faz nada. O mesmo item aparece logo abaixo, em «O que se leva», com Mostrar · Soltar · Dar a….
É a mesma coisa com duas caras na mesma tela, e só uma delas responde.

**D7 · No telefone, a gaveta ainda se chama «Gestão» e traz uma segunda navegação.** Ao abrir Grupo,
Talentos, Mercado, Pessoas ou Mural, aparecem:
- o título «Gestão»;
- uma fila de pílulas (Ficha · Grupo · Pessoas · Talentos · Mercado · Mural);
- uma barra em baixo (GESTÃO · DIÁRIO · BOLSA · MAPA), a competir com os objetos da mesa.

Nos Talentos isso dá três camadas de navegação: a barra, as pílulas e Árvore · Atributos · Do grupo.
«Gestão» é nome de bastidor: o jogador nunca o lê na mesa.

**D8 · Força aparece com dois valores na mesma tela.** Em cima, «ATRIBUTOS +2 Força». Em «Perícias e
detalhes», «FOR +4», que já soma o equipamento. Tem legenda, mas fica longe. O número que entra na
rolagem devia ser um só.

**D9 · A navegação entre salas é assimétrica.** A tela do herói tem a fila «as outras salas». Grupo,
Talentos e Mercado não a têm, e de lá só se sai pela mesa.

### Leve

- **D10 · No telefone, os números da carta do herói ficam cortados.** O PV e o Destino estão em
  y 805–816 com a janela a 812: perdem-se 4 px e não há rolagem.
- **D11 · A segunda gema da carta muda de sentido.** No herói é **Destino** (1); no companheiro é **PM**
  (13). O desenho é quase igual, e o PM do herói não está na mesa.
- **D12 · Debaixo de cada tela inteira fica uma gaveta montada e invisível.** Há uma camada z40 («Gestão
  ✕», «Bolsa ✕», «Diário ✕») sob a z50. Não se vê, mas o Tab e o leitor de ecrã passam por ela. O Fechar
  leva as duas.
- **D13 · A voz muda de pessoa.** Os Talentos dizem «a tua classe», «ficas com» e, uma aba ao lado,
  «Sua estrada», «você tem». O Mercado diz «ficas com». A narração diz «você».
- **D14 · No Diário, «A Urze de Ferro» não se toca.** A AR2 prometeu que tocar leva ao lugar no mapa.
  Talvez o lugar ainda não esteja no mapa; está por confirmar.
- **D15 · O Mural fala do sistema.** Diz «A recompensa é paga automaticamente…» e «O mural é renovado a
  cada descanso longo».
- **D16 · Defeitos do sistema, fora da AR, deixados aqui:** o Diário diz «chamou-o» de uma heroína (o
  `genero` é «mulher»); o Mercado diz «Primavera encareceu mantimento» no dia «1 de Brumal».

---

## O que está bem

- **Uma porta, uma tela pegou.** A carta do herói, a Bolsa e a carta do companheiro abrem a mesma tela,
  na aba certa nos dois tamanhos. A bolsa velha não aparece em lado nenhum.
- **Dar e passar itens é sentido.** A faca vai a Osric e volta, e a narração regista as duas linhas
  «◆ … : você → Osric».
- **O veredito antes do clique é exemplar.**
  - Talentos: o ponto que sai (2 → 1), o que se ganha (3 → 4 habilidades), o custo (3 PM) e o
    «só sai se recomeçares do zero (125)».
  - Mercado: «ficas com 8» ou «faltam 20» em cada botão.
- **O Esc fecha tudo, em todo o lado.** O Fechar nunca deixa uma camada à vista.

## A leitura de jogador

- **Os Talentos são jogo.** A árvore tem molduras e o custo pintado no nó. As ligações e os ramos da
  subclasse e da especialização leem-se como uma árvore de RPG. É a melhor tela do jogo hoje.
- **O Grupo é jogo.** A carta é grande, a barra do vínculo tem marcos («33 → Amizade aos 50») e o «sabe
  fazer» é feito de ícones.
- **O Herói é jogo em cima e formulário em baixo.** A carta, os atributos em medalhão e os encaixes
  funcionam. Logo abaixo vem «O que se leva»:
  - um `<select>` nativo para «Dar a…»;
  - o botão laranja primário gasto em «Mostrar a alguém», que é a ação menos importante;
  - a Bancada e a Forja em acordeão de texto;
  - e «Perícias e detalhes», que é a ficha antiga inteira dentro de um `<details>`.
- **O Mercado fica a meio.** As bancas têm cara de lugar. A lista de mercadoria é uma tabela de botões.
- **Pessoas e Mural são o jogo de antes.**
- **No 1906 há duas grelhas.** O Herói, a Bolsa e o Diário ocupam uma coluna central de ~1100 px. O Grupo
  e os Talentos ocupam a largura toda, com o título encostado à esquerda. Passar de um ao outro parece
  mudar de aplicação.

---

## O que recomendo a seguir (AR8, pela ordem)

1. **Dar casa ao que se perdeu (D1).** Os mantimentos, as duas reações e as dádivas voltam a ter onde
   viver. Uma função perdida pesa mais do que qualquer cara.
2. **Pessoas e Mural em tela inteira, e a gaveta «Gestão» aposentada na mesa (D2, D7, D12).** No
   telefone, a gaveta perde o título «Gestão» e a barra de baixo, e a navegação passa a ser só a mesa.
3. **Um cabeçalho só para todas as telas (D3, D4, D9).** Fixo, com o mesmo Fechar e a fila «as outras
   salas» em todas.
4. **A mochila tocável (D6) e «Dar a…» como as cartas do grupo, não como `<select>`.** Corrigir também
   a etiqueta de «Ver a ficha» (D5).

## Para a pessoa decidir: a proposta ambiciosa

**Os mantimentos saem da lista e ficam na mesa, como dados de uso.** A ordem de 04/11 já aprovou os
dados de uso (tochas, rações, flechas) e o campo de save. Então a casa do D1 não tem de ser uma linha
de texto na Bolsa. Podem ser **três dados pousados ao lado da Bolsa**: 🥖, 💧 e 🕯, cada um com a sua
face (d8 → d6 → d4). Ao fim do dia, ou quando se acende a tocha, o dado rola à vista. Se cair baixo,
encolhe. O jogador vê a comida acabar **sem abrir nada**, e ganha um dado a rolar fora da luta, que é
a régua da ordem de 04/11.

É a mesma regra, só que vista e sentida. Pede ao `desenho` a peça «dado de uso» e ao `backend` só a
leitura do que já existe. Se o d8/d6/d4 ainda não estiver em tabela, isso é do sistema e vai por
`mente/pedidos-ao-sistema.md`.
