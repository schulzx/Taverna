# A abertura alcançável — 17/11/2026

A pergunta: a prova jogada de 17/11 (commit `e82dc57`, IA real) começou três
campanhas pela chegada nova e em nenhuma a quest de abertura andou até ao fim.
**Está em produção?** Sim. Medido em Node, por semente, sem IA, pelo mesmo
caminho do App (`sortearMesa` → `montarFicha` → `mapaDaCriacao` → espinha →
núcleo → `esqueletoDaCampanha`), em `testes/teste-abertura-alcancavel.mjs`.

## A resposta sobre produção

- **Está no ar (v9.656), sim.** O mesmo número na v9.654 (`cce9c1f`), na v9.656
  (`66a8323`) e no HEAD de 17/11 antes do conserto: em 520 campanhas da chegada
  nova, **só 30,0% tinham o 1.º passo da quest de abertura na cidade onde o
  herói começa.** O resto pedia alguém ou um sítio noutra cidade, na névoa,
  para onde o sistema não deixa viajar (`resolver.js` só conhece
  `descoberta !== false`).
- **O defeito é antigo** — nasceu com o esqueleto (BQ7, `786198d`, v9.623,
  08/11): a quest do ato 0 era ancorada na cidade mais repetida dos marcos
  desse ato (`esqueleto.js`, `mundoDe`, `cidadeDoAto`), e não na cidade de
  partida. No sobremundo (o molde que a criação antiga punha por omissão) já
  falhava em 48% das campanhas.
- **A chegada nova o multiplicou** (V5, `f97da65`, no ar na **v9.653**): o
  molde passou a ser sorteado entre os quatro (`criacao-da-mesa.js:202`), e a
  torre (96% de falha), o arquipélago (68%) e o braço estelar (65%) espalham os
  marcos por cidades longe.
- **A recusa do ausente o expôs** (S4/S4c/S4d/S4e, `f2d82d3` `9104a18`
  `c5fefc1` `9e35696`, 16/11, v9.655–v9.656): até aí a IA «levava» a pessoa até
  ao herói e a quest andava pela prosa; desde então o sistema diz, com razão,
  que a pessoa não está — e o beco aparece. As provas de 16–17/11 com «O Que
  Desce ao Anoitecer» andaram porque caíram nos 30–50% de sorte (no sobremundo
  essa quest nasce na cidade de partida em metade das campanhas).

## As tabelas (520 campanhas, `mesa|0` … `mesa|ea`)

**% do 1.º passo alcançável (pessoa e sítio na cidade de partida)**

| molde | campanhas | antes (v9.654 = v9.656 = HEAD) | depois |
|---|---:|---:|---:|
| braço estelar | 120 | 35,0% | **100%** |
| arquipélago | 137 | 32,1% | **100%** |
| sobremundo | 126 | 51,6% | **100%** |
| torre | 137 | 3,6% | **100%** |
| **total** | 520 | **30,0%** | **100%** |

| quest de abertura | campanhas | antes | depois |
|---|---:|---:|---:|
| A Barca a Meio do Rio | 38 | 21,1% | 100% |
| O Livro dos Nomes | 54 | 20,4% | 100% |
| O Salvo-Conduto | 62 | 32,3% | 100% |
| O Que Desce ao Anoitecer | 114 | 34,2% | 100% |
| O Pão que Sai de Noite | 101 | 34,7% | 100% |
| As Botas na Estrada | 74 | 32,4% | 100% |
| As Chaves da Guarda | 77 | 24,7% | 100% |

**% da quest inteira fechável sem a IA** (com o 1.º passo já consertado; o
modelo está escrito no cabeçalho do §6 da suíte: o herói conhece a cidade de
partida e, ao chegar a uma cidade, as vizinhas por rota de até 12 dias; uma
folha pede a cidade da pessoa ou do sítio conhecida; `acompanha` pede que a
balança do convite aceite no 1.º dia; `tem` nunca fecha)

| molde | sem o convite da história | com ele (commit `1d62fe3`) | + as cidades da quest no mapa (patch 3 do App) |
|---|---:|---:|---:|
| braço estelar | 86,7% | 93,3% | 100% |
| arquipélago | 83,9% | 86,9% | 100% |
| sobremundo | 88,1% | 100% | 100% |
| torre | 93,4% | 93,4% | 100% |
| **total** | **88,1%** | **93,3%** | **100%** |

Antes do conserto do 1.º passo, a quest inteira só podia fechar nas 30% em que
o 1.º passo era alcançável — e o Salvo-Conduto em nenhuma (o protegido vinha no
1.º dia em 1 das 62).

O que ainda não fecha com os três commits, sem o patch do App: só o
Salvo-Conduto, e só por mapa — «Entregar em {destino}» com o destino na névoa
(28 campanhas: `mesa|o` `mesa|s` `mesa|1o`), e «Sair de {origem}» numa ilha do
arquipélago sem nenhuma rota de até 12 dias (7: `mesa|17` `mesa|3z` `mesa|7h`).

## Sementes de exemplo do defeito (antes)

- `mesa|5` (torre, O Pão que Sai de Noite): herói no Andar 1 — dos Espelhos; a
  mãe (Sable) no Andar 10 — dos Nomes.
- `mesa|6` (torre, As Botas na Estrada): herói no Andar 1 — dos Ossos; Halvard no
  Andar 14.
- `mesa|h` (torre, As Chaves da Guarda): herói no Andar 1 — da Chuva; o capitão
  no Andar 18 (a campanha 3 da prova é este caso).
- `mesa|b` (estelar, As Chaves da Guarda): herói em Nix Extremo; Yorick em Ceres
  Profundo (a campanha 2 da prova é este caso, com o Salvo-Conduto).
- `mesa|o` (arquipélago, O Salvo-Conduto): herói em Baía Perdida; Lucan e a
  origem em Enseada das Ossadas.
- `mesa|2` (sobremundo, O Livro dos Nomes): herói em Porto valente; Mabel em
  Forte Profundo (empate 2–2 nos marcos, e ganhava a outra cidade).
- `mesa|1` (arquipélago, A Barca a Meio do Rio), `mesa|4` (arquipélago, O Que
  Desce ao Anoitecer): o sítio do passo noutra ilha.

## As causas, com arquivo e linha

1. **A âncora do ato 0** — `src/esqueleto.js` `mundoDe` (a conta de
   `cidadeDoAto`, ~l. 378–391 antes do conserto): a cidade do ato é a mais
   repetida dos marcos, e o ato 0 não olhava para `cidadeInicial`. **Consertado**
   em `8bc0ddd`: `ESQUELETO.atoDaCasa` (tabela) põe o ato 0 na cidade de partida.
2. **O molde sorteado** — `src/criacao-da-mesa.js:202` (`tirar(fio(s, "molde"),
   moldesDisponiveis())`). Não é defeito por si: é o que fez o defeito 1 cair em
   70% das campanhas. Fica como está.
3. **`acompanha` sem caminho do sistema que aceite** — `src/indole.js`
   `pesarConvite`: o protegido pesava como um estranho (base 30, 1,5 por dia,
   aceita a 55). **Consertado** em `1d62fe3`: quem o passo pede `acompanha`
   aceita; e o rumo oferece «Levar X junto».
4. **O rótulo truncado** — `src/motor/a-proposta-da-frase.js` `aPessoaChamada`
   (o regex do nome próprio, ~l. 287): parava no hífen antes de maiúscula.
   **Consertado** em `b259896`.
5. **Quem a história nomeia não é «conhecido» da proposta** —
   `src/App.jsx:26556–26560`: os `conhecidos` da recusa do ausente são o
   registo, a abertura, as missões e a gente desta cidade; as pessoas dos
   passos das quests ficam de fora, e «Falo com Alaric» virava «não há ninguém
   aqui chamado Alaric». A conta pura (`oQueSeSabeDaPessoa` lê `e.passos`) está
   em `b259896`; **a fiação é do App** (patch 2).
6. **A cidade da quest fora do mapa conhecido** — o mapa da campanha nova só
   abre a cidade de partida (`regiao.js` `mapaDaCampanhaNova`), e a névoa da
   vizinhança só abre ao chegar a outra cidade (`preludio-do-turno.js` ~l. 798).
   O destino do Salvo-Conduto (2–4 cidades adiante) e as ilhas sem rota curta
   ficam inalcançáveis. **Patch 3 do App.**
7. **A abertura do save fala de outra pessoa** (campanha 2: «o rasto de
   Saoirse», «Hilda na Galeria Central» com a quest de Alaric) — a pista do
   marco antigo (`abertura.js`, `abrirAbertura`) continua no save ao lado da
   quest do esqueleto; o pedido cala-a (BQ7b, `ABERTURA_COM_QUEST`), mas quem a
   lê do save (a proposta, `App.jsx:26559`; «Da última vez») não. Não
   consertado aqui: é de quem desenha a abertura com a quest — fica para a
   pauta.

## Os patches do App (por aplicar — o bastão era de outro agente)

Pela régua da casa (script `.cjs` com âncora que falha se não bater). Tudo em
`calou`.

**Patch 1 — o convite sabe o passo da história** (sem isto o commit `1d62fe3`
não chega ao jogo; o rumo «Levar X junto» já aparece, mas o veredito seria o da
balança de sempre):

```js
t(`  const vereditoDoConvite = (nome) => pesarConvite(indoleDe(sementeMundo(), { nome }), {
    convivio: convivioCom(nome), fama: famaAtual(),`,
  `  const vereditoDoConvite = (nome) => pesarConvite(indoleDe(sementeMundo(), { nome }), {
    convivio: convivioCom(nome), fama: famaAtual(),
    /* a abertura alcançável: quem o passo da história pede ao lado vem (indole.js) */
    nome, passos: (() => { try { return passosDasQuestsAgora(); } catch (e) { calou("o convite: os passos da história", e); return []; } })(),`);
```

**Patch 2 — quem a história nomeia é conhecido, e o sistema diz onde anda:**

```js
t(`        for (const m of (missoesRef.current || [])) if (m && m.status === "ativa") for (const et of (m.etapas || [])) if (et && !et.feito && et.tipo === "falar_com" && et.alvo) conhecidos.add(et.alvo);`,
  `        for (const m of (missoesRef.current || [])) if (m && m.status === "ativa") for (const et of (m.etapas || [])) if (et && !et.feito && et.tipo === "falar_com" && et.alvo) conhecidos.add(et.alvo);
        try { for (const p of passosDasQuestsAgora()) for (const c of ((p && p.candidatos && p.candidatos.pessoa) || [])) if (c && c.nome) conhecidos.add(c.nome); } catch (e) { calou("a proposta: a gente da história", e); }`);
t(`      const p = aPropostaDaFrase(leituraDaFrase(acao), estadoDoPedido());`,
  `      const p = aPropostaDaFrase(leituraDaFrase(acao), { ...estadoDoPedido(), passos: (() => { try { return passosDasQuestsAgora(); } catch (e) { calou("a proposta: os passos", e); return []; } })() });`);
```

**Patch 3 — as cidades da quest aberta entram no mapa** (em `aplicarAsQuests`,
logo depois da espinha; `descobrirCidade` e `garantirQuestsDaEspinha` já estão
importados):

```js
t(`    try { if (e.espinha) espinhaRef.current = e.espinha; } catch (err) { calou("BQ7 · " + onde + " · a espinha", err); }`,
  `    try { if (e.espinha) espinhaRef.current = e.espinha; } catch (err) { calou("BQ7 · " + onde + " · a espinha", err); }
    /* a abertura alcançável: a cidade que a quest aberta nomeia (o destino da escolta, a ilha do passo) entra no mapa — sem ela, o resolver não deixa viajar */
    try {
      for (const R of garantirQuestsDaEspinha((espinhaRef.current || {}).quests).registos) {
        if (!R || R.estado !== "aberta") continue;
        for (const p of Object.values(R.papeis || {})) {
          if (!p || !p.cidade) continue;
          const d = descobrirCidade(mapaRef.current, p.cidade);
          if (d.nova) { mapaRef.current = d.mapa; setMapa(d.mapa); }
        }
      }
    } catch (err) { calou("BQ7 · " + onde + " · as cidades da quest no mapa", err); }`);
```

(`descobrirCidade` marca `descoberta: true`; se o desenho preferir o traço «de
ouvir», é o mesmo patch com `deOuvir: true` — e então a conta merece casa
própria em `geografia.js`, com teste.)

## Os factos sem caminho do sistema (para a prova «as peças»)

Contados no catálogo inteiro (52 quests, as folhas de todas as etapas):
`escolheu` 188, `conversou` 92, `esteve` 50, `acompanha` 37, `derrotou` 36,
`descobriu` 27, `esta_em` 21, `afeicao` 19, `consultou` 18, `conheceu` 13,
`tem` 8.

- **`tem` (8 folhas)** — o item na bolsa: as portas da tabela
  (`condicoes-da-quest.js`, `CONDICOES.tem`) são a resposta aplicada e o
  Cronista, as duas da IA. Nenhum caminho do sistema põe o item da quest na
  bolsa. Nenhuma quest de abertura o pede.
- **`acompanha` (37 folhas)** — tinha caminho (o convite), mas a balança
  recusava quem a história mandava levar. Com `1d62fe3` + patch 1, aceita.
  Fora das quests de abertura: Salvo-Conduto (3 etapas) e as do lote 4–6 que
  pedem escolta.
- **Sair de uma cidade sem destino conhecido** (`nenhum esta_em lugar:origem`)
  — não é um facto que falte, é o mapa: precisa de outra cidade conhecida
  (patch 3).
- **`conversou` com quem está noutra cidade** — o caminho existe («Falar», a
  carta), mas a proposta não diz para onde ir: a conta está em `b259896`
  (`oQueSeSabeDaPessoa`), a fiação no patch 2; o botão «Ir até {cidade}» para a
  pessoa longe fica por desenhar (hoje a proposta só leva a sítios da cidade).

## As suítes que rodei (uma a uma, sem `npm test`)

`teste-abertura-alcancavel` (nova, 29/29; e a mesma contra o HEAD anterior:
vermelha), `teste-esqueleto` 148/148, `teste-passo-alcancavel` 14/14,
`teste-bq7-motor` 137/137, `teste-bq7-app` 113/113, `teste-a-quest-manda` 46/46,
`teste-consequencias-caladas` 74/74, `teste-feito-do-sistema` 65/65,
`teste-o-confronto-da-quest` 36/36, `teste-quadro-da-quest` 219/219,
`teste-s5-tres-minutos` 43/43, `teste-sessao-21` 24/24, `teste-te9-motor` 92/92,
`teste-te11-motor` 65/65, `teste-a-proposta-da-frase` 53/53, `teste-convite`
94/94, `teste-indole` 57/57, `teste-ligacao` 27/27, `check-pt-br` verde.
`teste-quadro-fiacao` 80/81: o vermelho é uma asserção sobre o texto do
`App.jsx` («as duas portas do chamado passam por comACartaEmJogo»), que este
trabalho não tocou — é da fiação em curso do outro agente. `npm run build`
limpo.

A suíte nova leva ~60 s (520 campanhas), abaixo do relógio do corredor (240 s).
