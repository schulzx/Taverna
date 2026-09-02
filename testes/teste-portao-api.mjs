/* O PORTÃO (v9.155)

   `api/narrador.js` respondia à internet inteira: sem origem, sem
   limite, sem nada. Hoje só uma pessoa conhece a URL — num beta ela
   circula, e quem a encontrasse gastaria as chaves do DeepSeek e do
   Gemini de graça, sem nem abrir o jogo. Um `curl` num laço faz isso a
   noite inteira.

   O QUE ESTA SUÍTE PROTEGE, e é a parte que se esquece: que as TRÊS
   rotas estejam atrás do portão. Na primeira passada eu fechei duas e
   deixei a voz aberta — a rota mais fácil de esquecer é sempre a que não
   se parece com as outras.

   E protege a decisão de deixar passar quando o Redis some: um jogo que
   para de funcionar porque o contador caiu é pior do que um jogo sem
   contador. */

const { readFileSync, readdirSync } = await import("node:fs");
const P = await import("../api/_portao.js");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

/* o ambiente é global: guardo e devolvo, senão uma seção contamina a
   seguinte e o resultado vira sorte */
const guardado = { ...process.env };
const comAmbiente = (vars, fn) => {
  for (const k of ["VERCEL_URL", "ORIGENS_EXTRA", "KV_REST_API_URL", "KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"]) delete process.env[k];
  Object.assign(process.env, vars);
  try { return fn(); } finally {
    for (const k of Object.keys(process.env)) if (!(k in guardado)) delete process.env[k];
    Object.assign(process.env, guardado);
  }
};
const pedido = (headers) => ({ headers: headers || {} });

sec("1. SEM DOMÍNIO CONFIGURADO, O PORTÃO FICA ABERTO");
{
  /* É a máquina de quem desenvolve. Travar ali só ensinaria a desligar o
     portão inteiro — e portão desligado para testar é portão que vai ao
     ar desligado. */
  comAmbiente({}, () => {
    t("sem VERCEL_URL, passa", P.origemAceita(pedido({ origin: "http://localhost:5173" })).ok);
    t("e passa até sem origem nenhuma", P.origemAceita(pedido({})).ok);
    t("a lista sai vazia", P.origensPermitidas().length === 0);
  });
}

sec("2. COM DOMÍNIO, SÓ O JOGO ENTRA");
{
  comAmbiente({ VERCEL_URL: "taverna.vercel.app" }, () => {
    t("o próprio domínio entra", P.origemAceita(pedido({ origin: "https://taverna.vercel.app" })).ok);
    t("com barra no fim também", P.origemAceita(pedido({ origin: "https://taverna.vercel.app/" })).ok);
    /* O CASO QUE MOTIVOU TUDO: requisição sem `Origin` não veio de página
       nenhuma. É curl, script ou robô — um navegador SEMPRE manda este
       cabeçalho num fetch. */
    t("sem origem NÃO entra", !P.origemAceita(pedido({})).ok);
    t("e o motivo é dito", P.origemAceita(pedido({})).motivo === "sem origem");
    t("outro site não entra", !P.origemAceita(pedido({ origin: "https://malandro.example" })).ok);
    t("nem o localhost, quando há domínio", !P.origemAceita(pedido({ origin: "http://localhost:5173" })).ok);
    /* pré-visualizações mudam de subdomínio a cada deploy; recusá-las
       tornaria impossível testar o que se vai publicar */
    t("pré-visualização da Vercel entra", P.origemAceita(pedido({ origin: "https://taverna-git-abc123.vercel.app" })).ok);
    t("mas não um .vercel.app com caminho estranho", !P.origemAceita(pedido({ origin: "https://taverna.vercel.app.malandro.com" })).ok);
  });
  /* domínio próprio, quando houver */
  comAmbiente({ ORIGENS_EXTRA: "https://taverna.com.br, https://www.taverna.com.br" }, () => {
    t("o domínio próprio entra", P.origemAceita(pedido({ origin: "https://taverna.com.br" })).ok);
    t("e o www também", P.origemAceita(pedido({ origin: "https://www.taverna.com.br" })).ok);
    t("um vizinho não", !P.origemAceita(pedido({ origin: "https://taverna.com" })).ok);
  });
}

sec("3. QUEM É — o melhor identificador que existe sem conta");
{
  t("lê o x-forwarded-for", P.quemE(pedido({ "x-forwarded-for": "203.0.113.7" })) === "203.0.113.7");
  /* a Vercel encadeia proxies: o primeiro é o cliente */
  t("pega o primeiro da cadeia", P.quemE(pedido({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" })) === "203.0.113.7");
  t("cai no x-real-ip", P.quemE(pedido({ "x-real-ip": "198.51.100.4" })) === "198.51.100.4");
  t("e nunca fica vazio", P.quemE(pedido({})) === "desconhecido");
}

sec("4. SEM REDIS, O TETO NÃO DERRUBA NINGUÉM");
{
  /* Um jogo que para de funcionar porque o contador caiu é pior do que um
     jogo sem contador. A origem continua barrando o principal. */
  const r = await comAmbiente({}, () => P.dentroDoTeto(pedido({ "x-forwarded-for": "1.2.3.4" })));
  t("passa", r.ok);
  t("e diz que não mediu", r.medido === false);
  t("o teto tem um padrão", P.TETO_DIARIO >= 100);
}

sec("5. AS TRÊS ROTAS ESTÃO ATRÁS DO PORTÃO");
{
  /* A rota mais fácil de esquecer é a que não se parece com as outras: na
     primeira passada eu fechei o narrador e a sala, e deixei a voz — que
     gasta chave de terceiro do mesmo jeito. */
  const rotas = readdirSync("../api").filter((f) => f.endsWith(".js") && !f.startsWith("_"));
  t(`há ${rotas.length} rotas: ${rotas.join(", ")}`, rotas.length === 3);
  for (const r of rotas) {
    const src = readFileSync(`../api/${r}`, "utf8");
    t(`${r} importa o portão`, /import \{ deixarEntrar \} from "\.\/_portao\.js"/.test(src));
    t(`${r} o chama`, /await deixarEntrar\(req\)/.test(src));
    /* E LOGO NO COMEÇO DO HANDLER, que é o que garante que nada é feito
       antes: não se paga pela contagem de um robô nem se revela, pelo
       tempo de resposta, se a chave existe.

       A primeira versão desta linha comparava a POSIÇÃO NO TEXTO do
       portão com a da primeira menção a uma chave — e falhou em
       `sala.js`, onde o token aparece dentro de uma função auxiliar
       declarada antes do handler e só CHAMADA bem depois dele. Posição
       no arquivo não é ordem de execução; o que se mede agora é o corpo
       do handler. */
    const corpo = src.slice(src.indexOf("export default async function handler"));
    const iPortao = corpo.indexOf("deixarEntrar(req)");
    t(`${r} fecha logo na entrada`, iPortao > 0 && iPortao < 700);
  }
}

sec("6. A RECUSA EXPLICA, E NÃO ENTREGA NADA");
{
  const bloqueado = await comAmbiente({ VERCEL_URL: "taverna.vercel.app" }, () => P.deixarEntrar(pedido({ origin: "https://malandro.example" })));
  t("recusa com 403", bloqueado.status === 403);
  t("e uma frase de gente", /só responde ao jogo/.test(bloqueado.erro));
  /* a recusa NÃO diz qual origem seria aceita: dizer seria entregar a
     chave da fechadura junto com o aviso de que ela existe */
  t("sem entregar o domínio certo", !/vercel\.app/.test(bloqueado.erro));
  t("sem citar variável de ambiente", !/VERCEL_URL|ORIGENS_EXTRA/.test(bloqueado.erro));
  const passou = await comAmbiente({ VERCEL_URL: "taverna.vercel.app" }, () => P.deixarEntrar(pedido({ origin: "https://taverna.vercel.app" })));
  t("e o jogo entra", passou.ok);
}

console.log(`\nportão v9.155: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
