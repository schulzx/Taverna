/* ============================================================
   OS REFS DO BASTIDOR (T1-A, 6.ª fatia, 28/10/2026) — src/bastidor.js

   Dois objetos que vivem fora do componente porque `chamarModelo` (que
   também vive fora dele) os escreve a cada resposta do `/api/narrador`, e
   o save os lê. Moravam no topo do `App.jsx`, exportados — e eram os dois
   únicos exports do App que não são componente. Isso bastava para o Fast
   Refresh do Vite recusar o App como fronteira de troca a quente ("export
   is incompatible"): cada edição de QUALQUER módulo que o App importa
   subia até `main.jsx` e recarregava a página inteira, a sessão de jogo
   junto. Com duas mentes a escrever módulos, isso era uma recarga a cada
   meio minuto.

   Aqui eles também deixam de renascer quando o App é trocado a quente: o
   App reexecuta, este módulo não, e a conta da campanha não volta a zero
   no meio de uma sessão de desenvolvimento.

   Nada disto vai para a tela (o sistema não fala de si mesmo). Fica no
   save, no console e no /custo do modo criativo.
   ============================================================ */
import { CUSTO_ZERO } from "./custo.js";

/* QUEM RESPONDEU O ÚLTIMO TURNO (v9.115). O `/api/narrador` tem dois
   provedores e cai do primeiro para o segundo em silêncio — um 429 basta.
   Se os dois escrevem diferente, o jogador vê o narrador mudar de estilo
   sem que nada no jogo tenha mudado, e quem for investigar não tem por
   onde começar: não fica registro em lugar nenhum de qual dos dois falou.

   Isto não vai para a tela, e é de propósito: o sistema não fala de si
   mesmo, só aparece ao jogador o que é gameplay. Fica no console em
   desenvolvimento e no save, que é onde quem investiga vai olhar. */
export const ultimoProvedorRef = { atual: "", historico: [] };

/* O QUE O TURNO CUSTOU (v9.146). Mesma casa e mesmo motivo do ref acima:
   o provedor devolve a contagem de tokens em TODA resposta, e o jogo
   vinha jogando fora. Sem isto, "custo de token é produto" é uma frase
   sem número atrás — e cortar prompt vira chute.

   Não vai para a tela, pela mesma lei que mantém o provedor fora dela: o
   preço da API não é gameplay. Vive no save, no console e no /custo do
   modo criativo, que é o canal que já existe para este tipo de pergunta. */
export const custoRef = { atual: CUSTO_ZERO() };
