# O plano do motor — do jogo à tecnologia

> Para a pessoa avaliar (27/10/2026). Nasce da `auditoria-do-motor.md`. Dois agentes em
> paralelo, sempre; cada fase verde (build + `npm test`) antes da seguinte; commit por
> fase; push só verde. Nada aqui mexe em dinheiro ou infra sem a palavra dela.

## O princípio que ordena tudo

Quem compra tecnologia quer **uma função que roda sem o jogo**: entra o estado e a frase,
sai a pauta, as decisões e o estado novo. Tudo o mais — determinismo, testes, prompt no
servidor, modo autor — é o que torna essa função confiável e vendável. O plano constrói
essa função por fora para dentro: primeiro o que a sustenta (estado único, semente), depois
ela própria (o turno), depois o que a prova e o que a protege.

**Duas trilhas, porque o `App.jsx` só aguenta uma mão.** A trilha A toca o `App.jsx` e o
estado (bastão). A trilha B toca só módulos puros e testes. Nunca as duas no mesmo arquivo.

## As soluções, uma por fragilidade

| fragilidade medida | solução | quem | peso |
|---|---|---|---|
| **Sem porta de entrada:** o turno são 22 mil linhas em `Taverna()`, 240 `useRef` | `src/motor/`: `turno(estado, entrada) → { estado, pauta, envelopes, naoPode, efeitos }` e `aplicar(estado, resposta) → { estado, podado, paraOCronista }`. Os `setX` viram **efeitos** que o App aplica. O App fica só com tela + fiação. | A | pesado |
| **Estado espalhado, save sem esquema** | Um objeto `estado` único, com `versao`, que os refs passam a ler. O `retratoDoJogo` (já enumera ~186 campos) vira a fonte. **O save antigo continua a ser lido**; grava-se o novo ao lado (campo novo, ignorado pela versão antiga). | A | pesado (save) |
| **133 `Math.random()` fora da semente** | Todo sorteio por `rng(hashSemente(semente\|turno\|evento))` — `semente.js` já tem `rng`, `hashSemente`, `escolher`. Um varredor `check-sem-random.mjs` proíbe `Math.random` em `src/*.js`. | B | médio |
| **O Cronista (IA) decide estado** (lugar, grupo, mortes, pagamento) | O Cronista passa a **propor**; o motor **decide** por tabela: lugar só se o sistema reconhece, morte só com luta fechada, pagamento só da tabela de missão, grupo só por porta do sistema. O resto vira "dito por X, não fato". | B | médio |
| **Testes leem o texto do App** (187 suítes, ~490 asserções) | Cada asserção de texto renasce como chamada ao motor (`turno`/`aplicar` em Node), com o motivo escrito. Uma suíte de integração **joga 20 turnos em Node**, sem React e sem rede, contra os registos reais. | B (quando A libera cada função) | médio |
| **Prompt e motor no bundle do navegador** | `POST /api/turno` recebe `{ estado, frase }` e devolve a resposta; o prompt monta no servidor. Uma chave por licenciante, quota por chave. | A, depois | pesado (infra: **a pessoa decide**) |
| **Qualidade medida só por nós** | O **Juiz de fidelidade**: a régua das sessões virada módulo (`juiz.js`): a cada resposta, confere a prosa contra EM CENA, mapa, mercado → `{ precosInventados, distanciasFora, pessoasNovas, pautaCumprida }`. Primeiro mede; depois corrige ou repede. | B | pesado (órgão novo) |
| **As 6 `varredura-*.mjs` não correm no `npm test`** | Entram no `rodar-tudo.mjs`. | B | leve |
| **O "+2 de defesa" sem efeito desde 16/09** | A ficha aplica o bônus na mesa; teste. | B | leve |

## A ordem, em fases — dois agentes por fase

Cada fase: ~1 semana no ritmo da casa. As duas trilhas correm ao mesmo tempo e não se tocam.

### Fase 0 · o chão (1 semana)
- **A (frontend/oficial):** o estado único. `estado = retratoDoJogo()` vira a fonte; `salvar` grava `{ versao: 2, ...estado }` ao lado do save antigo; `carregar` lê os dois (o antigo migra na leitura, nunca reescreve). Os refs passam a ser vistas sobre o estado, um grupo por commit (ficha → mundo → cena → história), cada um verde.
- **B (backend):** a semente em todo sorteio. Converter os 103 `Math.random` dos módulos (`divindades` 15, `masmorras` 14, `combate` 13, `nomes` 10, `encontros` 9…) para `rng(hashSemente(...))`, com teste "mesma semente = mesmo resultado" por módulo; o varredor `check-sem-random.mjs`; as varreduras no `npm test`; o +2 de defesa.
- **Prova da fase:** build + 354 suítes verdes; 0 `Math.random` em `src/*.js`; um save antigo abre igual.

### Fase 1 · o turno sai do App (3 semanas, a mais incerta)
- **A:** `src/motor/` nasce com `aplicar` (o `aplicarResposta`, 1.169 linhas — o coração) e depois `turno` (`pautaDoTurno` + rodapé, `continuar`, `cronistaDoTurno`, `concluirRolagem`, a rodada de combate). Uma função por commit; o App chama o motor e aplica os efeitos. **O risco:** a ordem dos efeitos em `aplicarResposta` (os comentários de bug de ordem). Mitigação: cada função movida é provada contra os registos reais (s8–s12) antes e depois — a saída tem de ser idêntica byte a byte.
- **B:** o Cronista propõe e o motor decide (tabela `O_QUE_O_CRONISTA_PODE`); os 30 `Math.random` do App listados para A converter; e **a suíte de integração "20 turnos em Node"** nasce já contra `aplicar` (a primeira função que A entrega), crescendo função a função.
- **Prova da fase:** `node testes/jogar-em-node.mjs` joga 20 turnos de um registo real sem React; a saída bate com o registo.

### Fase 2 · as provas viram comportamento (2 semanas)
- **A:** os 115 envelopes e o rodapé saem do App para `prompt.js` (37% da voz do Mestre está no App); `cronistaDoTurno` inteiro no motor; o App fica com tela + fiação (~4,5 mil linhas de tela + os `calou`).
- **B:** as 187 suítes de texto renascem como chamadas ao motor, com o motivo em cada uma; `check-acoes-do-jogador` (os 96 endereços de linha) morre, substituído por teste de comportamento.
- **Prova da fase:** `npm test` verde sem nenhuma asserção `.test(app)` nova; o App com < 8 mil linhas.

### Fase 3 · o Juiz e a sessão como arquivo (2 semanas)
- **A:** a sessão como arquivo: semente + as frases do jogador reproduzem a campanha (`replay.mjs`); o registo de frases no save (campo novo).
- **B:** o **Juiz de fidelidade** (`juiz.js`): mede cada resposta contra EM CENA/mapa/mercado, com a taxonomia das 12 sessões; suíte sobre os registos reais (as invenções conhecidas têm de ser apanhadas: o rato, as ataduras, os marcos, o posto da estrada…). Primeiro só mede (uma linha no custo); corrigir/repedir é a fase seguinte, com a pessoa.
- **Prova da fase:** o Juiz apanha ≥90% das invenções rotuladas nas sessões 6–12 com ≤5% de falsos positivos; um replay reproduz a 12.ª sessão turno a turno.

### Fase 4 · o servidor e o cenário (2 semanas) — **decisões da pessoa antes**
- **A:** `api/turno.js`: o prompt monta no servidor; o cliente manda `{ estado, frase }`; uma chave por licenciante com quota (Redis já existe). **Toca infra: só com o sim dela.**
- **B:** o cenário como arquivo (JSON: gêneros, ocupações, bestiário, preços, nomes, deuses) carregado em vez de importado — o começo do **modo autor**.
- **Prova da fase:** o jogo publicado joga pelo `/api/turno` com o bundle sem prompt; um cenário novo entra sem editar módulo.

### Depois (para o pitch, não para o motor)
- A avaliação independente: 5–10 pessoas de fora jogando uma campanha cada, com a régua publicada (custa ~R$ 40 de IA).
- A documentação por sistema (entrada, saída, tabelas, invariantes) — nasce da fase 2.
- Os 76 retratos (créditos de 3/11). O que fica fora: outra língua (o intérprete por língua é projeto próprio, 572 regex), a mesa a vários (depende das fases 1 e 3), o livro da campanha.

## O que a pessoa decide (o resto é da mesa)
1. **O save versionado** (fase 0): campo novo ao lado do antigo, nunca reescrito — é reversível, mas é save; peço o sim.
2. **O servidor e a chave por licenciante** (fase 4): infra e custo.
3. **O Juiz corrigir/repedir** (depois da fase 3): muda o que o jogador vive e o custo por turno.
4. **A ordem:** este plano, ou outra.

## O que se ganha, em número, ao fim
- Uma função `turno()` que roda em Node, provada por 20 turnos reais, com 0 sorteios fora da semente.
- Replay de qualquer campanha a partir da semente e das frases.
- Um Juiz que mede a fidelidade de qualquer modelo de IA ao estado do jogo.
- O prompt e o motor fora do navegador, com chave por licenciante.
- Um App de tela (< 8 mil linhas) sobre um motor de ~160 módulos puros + `src/motor/`.
- Total estimado: **8 a 10 semanas**, duas trilhas em paralelo.
