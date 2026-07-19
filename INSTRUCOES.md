# Como publicar a Taverna — passo a passo para quem nunca programou

Este guia coloca a Taverna no ar, de graça, em cerca de 30 a 45 minutos.
Ao final você terá um link (ex.: `taverna.vercel.app`) para mandar aos
jogadores. Siga na ordem. Nada aqui exige saber programar.

O que você vai publicar: o modo solo da Taverna. Cada jogador cria mundo e
personagem, joga com o Mestre por IA, e o progresso fica salvo no aparelho
dele. Contas, amigos e mesas em grupo são a próxima etapa (explico no final).

---

## Etapa 1 — Chave da IA (Anthropic) e trava de gastos

O Mestre do jogo é a IA da Anthropic (Claude). Para o site funcionar, você
precisa de uma chave — e de um limite de gasto, que é sua proteção.

1. Acesse `console.anthropic.com` e crie uma conta.
2. Será preciso colocar um método de pagamento e adicionar créditos
   (comece com pouco, tipo US$ 5 a 10 — dá para muitas horas de jogo).
3. No menu, procure por **API Keys** e clique em **Create Key**.
   Dê o nome `taverna` e copie a chave (começa com `sk-ant-`).
   Guarde num lugar seguro — ela aparece só uma vez.
4. IMPORTANTE: procure nas configurações da conta a opção de **limites de
   uso/gasto** (spend limit) e defina um teto mensal baixo (ex.: US$ 10).
   Isso garante que, aconteça o que acontecer, você nunca gasta mais que isso.

Por que isso importa: cada resposta do Mestre consome créditos da SUA chave.
Com o limite definido, o pior cenário do mês é o valor que você escolheu.

## Etapa 2 — Conta no GitHub (onde o código mora)

1. Acesse `github.com` e crie uma conta gratuita.
2. Clique no **+** no canto superior direito → **New repository**.
3. Nome: `taverna`. Deixe **Public** marcado. NÃO marque "Add a README".
4. Clique em **Create repository**.

## Etapa 3 — Subir os arquivos do jogo

Você recebeu a pasta `taverna-site` (descompacte o .zip se ainda não fez).

1. Na página do repositório recém-criado, clique no link
   **uploading an existing file** (aparece no meio da página).
2. Abra a pasta `taverna-site` no seu computador, selecione TUDO que está
   DENTRO dela (os arquivos e as pastas `src` e `api`) e arraste para a
   página do GitHub. Atenção: arraste o conteúdo, não a pasta em si —
   os arquivos `package.json`, `index.html` etc. devem ficar na raiz.
3. Espere a lista carregar (deve mostrar `src/App.jsx`, `api/mestre.js`,
   `package.json`, `index.html` e os demais).
4. Embaixo, clique em **Commit changes**.

## Etapa 4 — Publicar na Vercel (o site em si)

1. Acesse `vercel.com` e clique em **Sign Up** → **Continue with GitHub**
   (isso conecta as duas contas sozinho).
2. No painel, clique em **Add New…** → **Project**.
3. Ache o repositório `taverna` na lista e clique em **Import**.
4. Antes de finalizar, abra a seção **Environment Variables** e adicione:
   - Name: `ANTHROPIC_API_KEY`
   - Value: cole a sua chave `sk-ant-...` da Etapa 1
5. Clique em **Deploy** e aguarde 1 a 2 minutos.
6. Ao terminar, a Vercel mostra o link do seu site (algo como
   `taverna-abc123.vercel.app`). Clique e teste!

## Etapa 5 — Testar de verdade

1. Abra o link, crie uma campanha e um personagem, e jogue alguns turnos.
2. Se o Mestre responder e a história andar: está no ar. Manda o link
   para os amigos.
3. Se aparecer "O Mestre não respondeu", olhe a mensagem pequena embaixo
   do botão "Tentar de novo" — ela diz o motivo real:
   - Menção a `401` ou `authentication`: a chave foi colada errada na
     Vercel. Refaça o passo 4.4 (Settings → Environment Variables do
     projeto) e depois **Redeploy**.
   - Menção a `credit` ou `billing`: faltam créditos na conta Anthropic.
   - Outra coisa: me mande um print da mensagem que eu diagnostico.

## Como atualizar o jogo depois

Quando eu te entregar uma versão nova do `App.jsx`:
1. No GitHub, abra `src/App.jsx` → ícone de lápis (**Edit**) →
   apague tudo, cole o novo conteúdo → **Commit changes**.
2. A Vercel percebe sozinha e republica em ~1 minuto. Só isso.

## O que este site tem — e o que ainda não tem

Tem: criação de mundo e personagem, Mestre por IA com mundo vivo e
espontâneo, dado d20, habilidades com efeitos temporários, equipamentos
com raridade, combate com ficha dos inimigos, retratos consistentes com
expressões, jornadas com bifurcações, chefes escondidos, livro de memória,
crônica compartilhável e salvamento no aparelho do jogador.

Ainda não tem (Etapa 2 do projeto): contas de jogador, salvamento na nuvem
(trocar de aparelho perde o progresso), mesas multiplayer com amigos e
espectadores, e pagamentos. Tudo isso já está desenhado no documento de
arquitetura (`taverna-arquitetura-independencia.md`) e usa Supabase — uma
plataforma acessível que dá para aprender aos poucos ou contratar um
freelancer por poucos dias para montar seguindo o documento.

## Custos, em resumo

- Vercel e GitHub: grátis nesse volume.
- Anthropic: paga pelo uso. O teste com ~20 jogadores cabe em poucos
  dólares; o limite de gasto da Etapa 1 é sua rede de segurança.
- Quando o jogo tiver assinatura, essa conta passa a ser coberta pela
  receita — é exatamente o modelo do documento de custos.

Boa sorte, fundador. Toda lenda começa aqui. 🍺
