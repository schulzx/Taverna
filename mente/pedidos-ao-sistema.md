# Pedidos ao sistema

A mesa de design escreve aqui o que **precisa do motor** e não pode escrever
ela mesma — regra, número, porta em `turno.js`, função pura. A mente do
sistema lê daqui ao escolher o item do ciclo, e trata cada pedido como
qualquer outro item da sua fila: pelo peso.

**Este arquivo existe por um motivo de encanamento, não de organização.**
`git commit -- <caminhos>` protege as duas mentes de commitarem o trabalho
uma da outra — **exceto num arquivo que as duas editam por desenho**, que era
`mente/pauta.md`: o desenho escrevia pedidos lá dentro. Aconteceu três vezes
(`a6a6473`, `e430a12`, `63e0667`), a última com o commit de W1 levando dentro
o bloco de X4 sem o mencionar. Separar o arquivo custa menos que uma trava
nova, e resolve a causa em vez do sintoma.

**Quem escreve:** `regente` (e as mãos dele). **Quem lê e responde:**
`orquestrador`. **Quem atende:** `backend`. Ao atender, o sistema marca `[x]`
com a versão, e a linha fica — o histórico do que uma mente pediu à outra é
barato e vale.

Formato: `- [ ] **o que falta** · de: <etapa> · dd/mm` + duas ou três linhas
dizendo **para quê**, porque um pedido sem o porquê vira adivinhação.

---

## Abertos

- [ ] **a porta do tabuleiro em `turno.js`** · de: E2 · 15/09
  São 17 portas e **nenhuma é do campo**. Hoje *"vou até K14"* cai na porta
  `destino`, que não tem guarda de combate, vai ao resolvedor de cidades do
  mapa-múndi, gasta uma chamada ao Mestre e **ninguém anda**. Precisa de
  `casaDoEndereco`, `vereditoDoPasso` (com o `ateOnde` que não existe),
  `RECUSAS_DO_PASSO` com a catraca de 54 caracteres, e a porta
  `passo-no-campo`. **E há uma nota em `App.jsx:14568` que PROÍBE o Mestre de
  citar quadrados** — a condição não é string em falta, é instrução contrária.
- [ ] **`esperar`: passar a vez sem chamar o Mestre** · de: W1 · 16/09
  **O mais barato e o que mais paga.** São 1,4 rodadas por luta de pura
  caminhada, e hoje cada uma custa ~20 toques e uma chamada ao Narrador
  porque não existe botão de passar a vez.
- [ ] **`declararGolpe(alvo, motivo)`, `alvosDoVerbo`, `vereditoDoVerbo`** · de: W1 · 16/09
  O que o gesto de W1 precisa para perguntar ao motor antes de oferecer:
  quais alvos um verbo alcança, e o que ele custa. Hoje a tela adivinha.
- [ ] **`LINHAS_DO_GOLPE` com a catraca de 54 caracteres** · de: W1 · 16/09
  As frases de X2 **já transbordam em produção** — 64 a 86 caracteres contra
  54, e é a frase que mais aparece no jogo.

## Atendidos

_(vazio)_
