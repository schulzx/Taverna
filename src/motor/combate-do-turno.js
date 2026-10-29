/* ============================================================
   OS ÓRGÃOS DO COMBATE, PUROS (T1-A, 5.ª fatia, 28/10/2026) — src/motor/combate-do-turno.js

   O bloco do combate do `aplicarResposta` (cerca de 225 linhas) não coube
   na 4.ª fatia: chama uns quinze órgãos do App que escrevem por conta
   própria — nos refs, na nota, na tela. Movê-lo byte a byte pede antes
   que esses órgãos sejam puros: que recebam o que leem e devolvam o que
   mudam. É o que este arquivo junta, um órgão por vez, começando pelos de
   menos leitores.

   A forma é a da casa (aplicar.js, fim-do-turno.js): cada peça devolve
   `{ ..., msgs, paraOCronista, efeitos }` — as linhas da tela, as notas ao
   Narrador (que o App junta com `notaComOTurno`) e as escritas que só o
   App sabe fazer (um ref, um contador). O App guarda o nome antigo do
   órgão, agora um invólucro que chama a peça e aplica o que ela devolve:
   os chamadores não mudam.

   A prova de cada órgão é byte a byte contra o código antigo, lido do git
   (`testes/gerar-combate-dourado.mjs` corre o App de 7338870 sobre os
   casos de `testes/combate-casos.mjs`; `teste-motor-combate.mjs` exige o
   mesmo da peça nova).
   ============================================================ */

import { gerarHabilidadeUnica, chanceUnica } from "../unicas.js";
/* T4-B (29/10) · o gênero de recuo — quando quem chama não diz o seu — é o
   padrão do mundo em uso (`generos.padrao`), e não um literal da Taverna */
import { cenarioAtivo } from "../cenario.js";
import { patamarFama } from "../fama.js";
import { recompensaChefe } from "../masmorras.js";
import { essenciaDoChefe, RARIDADE_ROTULO } from "../loot.js";
import { garantirSuprimentos } from "../ermos.js";
import { concluirLugar } from "../mundo-base.js";
import { agravarParaMorte } from "../crime.js";
import { gerarVilao, resumoVilaoPrompt } from "../vilao.js";
import { nomePessoa } from "../nomes.js";
import { dominiosDe } from "../gestao.js";
import { vilaoDoFio } from "../saga.js";
/* a abertura da luta (6.ª fatia) */
import { completarInimigo } from "../bestiario.js";
import { devolverSegura } from "../gatilhos.js";
import { abrirCombateTracos, iniciativaDeTraco } from "../tracos.js";
import { avaliarEncontro, gastarDoDia, selo, resumoOrcamentoPrompt } from "../orcamento.js";
import { reconciliarGraus } from "../presenca-divina.js";
import { rolarIniciativa, resumoIniciativa, novosRecursos, acoesBonusDe } from "../combate.js";
import { atributoEfetivo } from "../regras-jogo.js";
import { iniciativaDeItem } from "../dadivas.js";
import { mapaEmTexto, ladoDe, tamanhoDe, alcanceNatural, montarGrade, posicionar } from "../grid.js";
import { rng, hashSemente } from "../semente.js";
import { acoesPorRodada, estaEmForma, desfazerForma, baixarGuardas, baixarPressa } from "../habilidades.js";
/* os órgãos do fim da luta (6.ª fatia) */
import { ganharVinculo } from "../vinculos.js";
import { caidosDaLuta } from "../recibo-da-luta.js";
import { dispensarTodas } from "../invocacoes.js";
/* a frase das invocações desfeitas mora nos envelopes do turno (28/10, trilha B) */
import { oEnvelopeDosPoderes } from "./envelopes-do-turno.js";
import { podeAbrirRito, iniciarRito, provaAtual } from "../ascensao.js";
import { grauDe, tituloDe } from "../divindades.js";

/* ---------------- O PODER ÚNICO (v7.4.4) ----------------
   Mesma lógica do loot: a árvore da classe é tabela fixa, mas derrubar
   elite ou lendário pode DESPERTAR uma técnica só sua, gerada por código.
   A IA narra a epifania; o sistema cria e limita.

     despertarUnica(pers, inimigosFinais, { sorteDoTurno }) →
       { pers, msgs, paraOCronista }

   A sorte vem do turno, pelo evento "habilidade-unica", e é pedida DUAS
   vezes quando o poder desperta (o teste da chance e a geração), como no
   App: a contagem do evento anda igual. */
export function despertarUnica(pers, inimigosFinais, ctx) {
  const c = ctx && typeof ctx === "object" ? ctx : {};
  const p2 = pers;
  const msgs = [], paraOCronista = [];
  /* sem a sorte do turno não há sorteio (nenhum dado fora da semente) */
  if (typeof c.sorteDoTurno !== "function" || !p2 || typeof p2 !== "object") return { pers: p2, msgs, paraOCronista };
  const sorteDoTurno = c.sorteDoTurno;
  const ch = chanceUnica(inimigosFinais);
  if (!ch || sorteDoTurno("habilidade-unica")() >= ch) return { pers: p2, msgs, paraOCronista };
  const existentes = (p2.habilidades || []).map((x) => x.nome);
  const hu = gerarHabilidadeUnica(p2.nivel || 1, existentes, sorteDoTurno("habilidade-unica"));
  msgs.push(`🌟 PODER ÚNICO DESPERTOU: ${hu.nome} (${hu.custo} PM · recarga ${hu.recarga}t) — ${hu.descricao}`);
  paraOCronista.push(`[PODER ÚNICO — REGISTRADO PELO SISTEMA] A vitória sobre ${((inimigosFinais || [])[0] || {}).nome || "o inimigo"} despertou em mim uma técnica só minha: "${hu.nome}" (${hu.descricao}). Já está na minha lista de habilidades — NÃO a crie de novo. Narre a epifania como um momento raro e marcante: o poder do derrotado deixou uma marca em mim.`);
  return { pers: { ...p2, habilidades: [...(p2.habilidades || []), hu] }, msgs, paraOCronista };
}

/* ---------------- A FAMA QUE CRESCE (v6.8) ----------------
   Derivada das façanhas reais — a IA não infla nem esquece. Quando o
   patamar sobe, o mundo muda o tratamento: a linha na tela e a nota ao
   Narrador (canon). A fama em si é conta do App (`famaAtual`, que lê os
   contadores, o nível da ficha viva e os domínios); esta peça compara-a
   com a da última checagem.

     aFamaDoFeito(fama, famaAntes) → { fama, msgs, paraOCronista }

   `fama` é também o que o App guarda como a "última checagem"
   (famaPatamarRef), suba ou não o patamar. */
export function aFamaDoFeito(fama, famaAntes) {
  const f = fama;
  const msgs = [], paraOCronista = [];
  const antes = patamarFama(famaAntes), agora = patamarFama(f);
  if (agora.min > antes.min) {
    msgs.push(`📣 Sua fama cresce: agora você é ${agora.rotulo} — ${agora.nota}.`);
    paraOCronista.push(`[FAMA — NOVO PATAMAR, CANON] Minha fama subiu para ${Math.round(f)}: agora sou ${agora.rotulo.toUpperCase()} (${agora.nota}). O mundo passa a me tratar assim — reconhecimento em cidades, olhares, respeito ou medo. NPCs relevantes podem já ter ouvido meu nome.`);
  }
  return { fama: f, msgs, paraOCronista };
}

/* ---------------- O CHEFE CAIU (MM11) ----------------
   A masmorra conclui-se por código: as moedas do fundo, um item épico ou
   lendário garantido, a essência do chefe (a maior fonte do jogo, v9.54),
   e as tochas que sobraram voltam para a mochila (v9.26). UM bloco, DUAS
   portas no App: a vitória declarada na resposta do Narrador e a que o
   SISTEMA fecha no golpe. Idempotente: larga a masmorra, então a segunda
   porta não encontra sala de chefe e devolve a ficha como veio.

     concluirAMasmorra(pers, { masmorra, mapa, base }, { lexico, sorteDoTurno }) →
       { pers, concluiu, msgs, efeitos }

   Os efeitos, na ordem em que o App os fazia: `masmorra` (largada),
   `contador` (masmorrasConcluidas), `base` (MM17 C1: só num mapa de
   região a base guarda QUAL masmorra acabou — é o que o marco "descer" da
   espinha lê) ou `calou` (se essa escrita estourar). O resto — a sala em
   curso que se esvazia e a sessão que pode fechar — é do App, depois. */
export function concluirAMasmorra(pers, estado, ctx) {
  const e0 = estado && typeof estado === "object" ? estado : {};
  const c = ctx && typeof ctx === "object" ? ctx : {};
  const msgs = [], efeitos = [];
  let p2 = pers;
  const mm = e0.masmorra;
  const sala = mm && Array.isArray(mm.salas) ? mm.salas.find((x) => x.id === mm.atual) : null;
  if (!mm || !sala || sala.tipo !== "chefe") return { pers: p2, concluiu: false, msgs, efeitos };
  const rec = recompensaChefe(p2.nivel || 1, c.lexico, typeof c.sorteDoTurno === "function" ? c.sorteDoTurno("chefe") : undefined);
  const essChefe = essenciaDoChefe(p2.nivel || 1);
  p2 = { ...p2, moedas: (p2.moedas || 0) + (sala.moedas || 0), equipamento: [...(p2.equipamento || []), rec.item],
         essencia: (p2.essencia || 0) + essChefe,
         suprimentos: { ...garantirSuprimentos(p2.suprimentos), tochas: Math.max(0, mm.tochas || 0) } };
  msgs.push(`🕳 ${mm.nome} CONCLUÍDA! Tesouro do fundo: +${sala.moedas} moedas · ⚗ +${essChefe} essência · ✦ ${rec.item.nome} (${RARIDADE_ROTULO[rec.item.raridade] || rec.item.raridade})`);
  if ((mm.tochas || 0) > 0) msgs.push(`🕯 ${mm.tochas} tocha(s) voltam para a mochila.`);
  efeitos.push({ tipo: "masmorra", masmorra: null });
  efeitos.push({ tipo: "contador", nome: "masmorrasConcluidas" });
  if (e0.mapa && e0.mapa.regiao) {
    try { efeitos.push({ tipo: "base", base: concluirLugar(e0.base, mm.nome) }); } catch (e) { efeitos.push({ tipo: "calou", onde: "a masmorra concluída na base", erro: e }); }
  }
  return { pers: p2, concluiu: true, msgs, efeitos };
}

/* ---------------- A MORTE DE UM ALVO (v9.0) ----------------
   Alguém morreu por decisão do sistema (o combate, um decreto cumprido):
   registra-se no elenco e propaga-se a quem depende disso.

     aMorteDoAlvo({ npcs, nemesis, lei, dia, ctxDaLei }, nome, causa, { aproximado })
       → { morreu, ehNemesis, efeitos }

   MM10: se a vítima de um crime conhecido cai aqui, o crime vira matar —
   mais caro, mais longo, e a rua já sabia mesmo sem ver o corpo.
   `ctxDaLei` é uma função (o mundo de agora: a semente, o mapa, a cidade…)
   e é chamada DENTRO da rede, como era: se montar o mundo estoura, cala a
   lei e segue a morte.

   Nome exato sempre; parecido SÓ quando o texto veio do jogador (o alvo de
   um decreto é digitado à mão: "a cabeça de Sarna, a Víbora"). Em combate
   exige-se exato — senão "Bandido do Corvo" mataria a NPC "Corvo".

   Os efeitos, na ordem: `lei` (ou `calou`), `npcs` (quem morreu, com a
   nota do dia). Se era a nêmesis, `ehNemesis` — e encerrá-la é o órgão do
   App (encerrarNemesis), a porta única da morte dela. */
export function aMorteDoAlvo(estado, nome, causa, opcoes) {
  const e0 = estado && typeof estado === "object" ? estado : {};
  const { aproximado = false } = opcoes && typeof opcoes === "object" ? opcoes : {};
  const efeitos = [];
  const alvo = String(nome || "").trim();
  if (!alvo) return { morreu: false, ehNemesis: false, efeitos };
  try { efeitos.push({ tipo: "lei", lei: agravarParaMorte(e0.lei, alvo, typeof e0.ctxDaLei === "function" ? e0.ctxDaLei() : e0.ctxDaLei) }); } catch (e) { efeitos.push({ tipo: "calou", onde: "agravarParaMorte", erro: e }); }
  const npcs = e0.npcs;
  const chave = Object.keys(npcs || {}).find((k) => k.toLowerCase() === alvo.toLowerCase())
    || (aproximado ? Object.keys(npcs || {}).find((k) => k.length >= 5 && new RegExp(`(^|\\W)${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\W|$)`, "i").test(alvo)) : null);
  if (chave) {
    efeitos.push({ tipo: "npcs", npcs: { ...npcs, [chave]: { ...npcs[chave], status: "morto", notas: `${npcs[chave].notas || ""} Morreu no dia ${e0.dia}${causa ? ` — ${causa}` : ""}.`.trim() } } });
  }
  const n = e0.nemesis;
  const nomeNem = (n && n.nome ? n.nome : "").toLowerCase();
  const ehNemesis = !!nomeNem && n.status !== "derrotada" && (
    nomeNem === alvo.toLowerCase() ||
    (chave && nomeNem === chave.toLowerCase()) ||
    new RegExp(`(^|\\W)${nomeNem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\W|$)`, "i").test(alvo)
  );
  return { morreu: !!chave || ehNemesis, ehNemesis, efeitos };
}

/* ---------------- A NÊMESIS QUE SURGE (v6.8) ----------------
   Quando o nome cresce demais, alguém jura o fim do herói.

     surgirANemesis({ nemesis, fama, contadores, mapa, moedas, dia, espinha,
                      derrotados, genero, lexico }, { sorteDoTurno }) →
       { nemesis, paraOCronista, efeitos }

   `nemesis` volta `undefined` quando ninguém surgiu (a viva continua, a fama
   não chega a 20, ou o dado não quis). A sorte é pedida na ordem do App:
   "nemesis" (o dado), "vilao" (o vilão) e "nome" (o nome dele).

   v9.167: o retrato ficou mais rico — os arquétipos novos leem diplomacia,
   guerra e bolsa, e sem estes campos eles nunca nasceriam.

   nexo (11/10): QUEM JURA O MEU FIM É QUEM ESPERA NO FIM DO FIO — a
   identidade vem do fio (`vilaoDoFio`, saga.js); o plano, o corpo e as fases
   continuam a ser os do vilão. Save sem fio, ou com o antagonista já caído:
   o de sempre. `derrotados` é uma função (o App lê-a de mundoDasMissoes) e é
   chamada DENTRO da rede, como era: se estourar, cala e fica o vilão novo.

   O REGISTRO DE PESSOAS NÃO O RECEBE AINDA (ele entra no elenco na
   REVELAÇÃO), e nada na tela: o jogador não é avisado de que ganhou um
   inimigo. Só a nota ao Narrador, com o resumo do vilão. */
export function surgirANemesis(estado, ctx) {
  const e0 = estado && typeof estado === "object" ? estado : {};
  const c = ctx && typeof ctx === "object" ? ctx : {};
  const paraOCronista = [], efeitos = [];
  const nada = { nemesis: undefined, paraOCronista, efeitos };
  if (typeof c.sorteDoTurno !== "function") return nada;
  const sorteDoTurno = c.sorteDoTurno;
  if (e0.nemesis && e0.nemesis.status !== "derrotada") return nada;
  if (e0.fama < 20) return nada;
  if (sorteDoTurno("nemesis")() > 0.35) return nada;
  const n0 = gerarVilao({ sorte: sorteDoTurno("vilao"),
    nome: nomePessoa(e0.genero || cenarioAtivo().generos.padrao, undefined, sorteDoTurno("nome"), e0.lexico),
    cont: e0.contadores,
    stats: {
      dominios: dominiosDe(e0.mapa).length,
      tratados: ((e0.mapa || {}).faccoes || []).filter((f) => f.tratado === "comercio" || f.tratado === "alianca").length,
      guerras: ((e0.mapa || {}).faccoes || []).filter((f) => f.tratado === "guerra").length,
      moedas: e0.moedas || 0,
      fama: Math.round(e0.fama),
    },
    dia: e0.dia,
  });
  let n = n0;
  try { n = vilaoDoFio(n0, e0.espinha, { derrotados: typeof e0.derrotados === "function" ? e0.derrotados() : e0.derrotados, dia: e0.dia }) || n0; } catch (e) { efeitos.push({ tipo: "calou", onde: "vilaoDoFio", erro: e }); n = n0; }
  paraOCronista.push(resumoVilaoPrompt(n));
  return { nemesis: n, paraOCronista, efeitos };
}

/* ---------------- A ECONOMIA DA RODADA (v9.43, v9.54) ----------------
   A AÇÃO BÔNUS TEM DONO (v9.43). No 5e ninguém tem ação bônus por existir:
   ela vem de um traço de classe (Surto de Ação, Ação Ardilosa, Rajada de
   Golpes, Fúria…) e quase sempre a partir do segundo nível. Aqui ela nascia
   1 para todo mundo, e um Mago de nível 1 abria a luta com dois movimentos
   — lançava duas magias no mesmo turno, que foi exatamente o que apareceu
   em jogo. `acoesBonusDe` é o catálogo que já sabia disso e que ninguém
   consultava.

   v9.54: `acoesPorRodada` é onde a PRESSA entra no motor, e é o único
   lugar. "Você age duas vezes por rodada" não é "bate duas vezes" — quem
   conjura não bate —, é literalmente uma segunda ação, e a economia da
   rodada já é o que o golpe e a conjuração gastam. Dobrar aqui faz as duas
   coisas de uma vez sem que nenhuma das duas precise saber que a pressa
   existe.

   Moravam no App (T1-A, 6.ª fatia): a abertura da luta é a primeira peça
   pura a precisar delas, e o App passou a importá-las daqui. */
export const temAcaoBonus = (p) => acoesBonusDe((p || {}).classe, (p || {}).nivel || 1).length > 0;
export const economiaNova = (p) => ({ acao: acoesPorRodada(p), extra: temAcaoBonus(p) ? 1 : 0 });

/* ---------------- O TABULEIRO NASCE DO LUGAR (v9.34) ----------------
   O tamanho não é fixo: uma briga de taverna não usa trinta metros de
   comprimento, e um tabuleiro único para tudo seria, na maioria das lutas,
   um campo de quadrados vazios. `montarGrade` lê o cenário e devolve a
   planta com paredes; os companheiros ganham posição aqui (quem os move
   continua sendo o sistema).

   S10b (13/10): A DISTÂNCIA DE ABERTURA POR SITUAÇÃO (`ABERTURA_DA_LUTA`,
   grid.js) — "declarada", "emboscada" ou "cena". A casa exata sai de um
   gerador semeado pelo mundo e pelo turno (`sementeDaAbertura`): a mesma
   semente no mesmo turno abre à mesma distância.

   `planta` é uma função do App — o que a planta lê do lugar (a masmorra,
   a jornada, a cidade, o sítio, o texto do local, o bioma), com a rede do
   App dentro — e é chamada DENTRO de cada montagem, como era. */
function montarAGrade(pers, inimigos, situacao, planta, sementeDaAbertura) {
  const grade = montarGrade(typeof planta === "function" ? planta() : (planta || {}));
  const p = posicionar(grade, {
    heroi: { nome: pers.nome, tamanho: pers.tamanho || "medio" },
    grupo: (pers.grupo || []).map((c) => ({ nome: c.nome, vida: c.vida, vidaMax: c.vidaMax, tamanho: c.tamanho || "medio" })),
    inimigos: inimigos || [],
    situacao: typeof situacao === "string" && situacao ? situacao : "cena",
    sorte: rng(hashSemente(sementeDaAbertura)),
  });
  return { grade, heroi: p.heroi, aliados: p.grupo, inimigos: p.inimigos };
}

/* ---------------- A PORTA ÚNICA DE ABRIR COMBATE (v9.73) ----------------
   A masmorra abria a luta sozinha desde a v7.0, com `{ inimigos }` e nada
   mais, e o bloco que monta terreno, iniciativa, orçamento e presença
   morava dentro do `aplicarResposta`. Toda luta de masmorra rodou sem
   ordem, sem tabuleiro e sem o selo do orçamento. Esta peça é o encontro
   dos caminhos: faz TUDO o que uma luta precisa ter no instante em que
   nasce, e devolve a ficha mexida junto (os traços de abertura — a sorte
   do Halfling, a Pele de Pedra do Goliath — são da ficha).

   O EQUIPAMENTO (v9.32): o grau divino reconciliado com o panteão (A1 · B8:
   o número do GD mora na ficha do inimigo; na linha fica o que ele muda),
   o tabuleiro pela situação (se a situação estoura, a rede cala e a planta
   abre como encontro), a iniciativa pela DESTREZA da criatura (v9.152), e
   a ECONOMIA, que nasce aqui (E4): com `rodada: 1` e sem economia, o
   desconto do passo evaporava e a guarda da ação nunca disparava na
   rodada 1; e nascer aqui mata a economia rançosa de uma luta retomada.

   O ORÇAMENTO: a luta é pesada AGORA, com a mesa cheia — depois que os
   primeiros caem, a conta já não descreve o que o jogador enfrentou.
   O CÓDEX: toda criatura que entra em combate vira registro no bestiário.

     abrirOCombate({ inimigosCrus, jaNoRef, combateNoRef, pers, situacao,
                     panteao, planta, sementeDaAbertura, diaLuta,
                     descobertas }, { sorteDoTurno, calou }) →
       { abriu, saida, combateNoRef, diaLuta, descobertas }

   `saida` é o que o órgão do App devolvia aos chamadores, à letra:
   `{ pers, msgs, nota }` quando não há quem lutar, `{ pers, msgs, nota,
   combate }` quando abre — e `combate` é o equipado, SEM o `aval`, que só
   o ref recebe (`combateNoRef`). A sorte é pedida uma vez, "iniciativa".
   O resto — zerar a marca do território, o ócio, a reação e a escada do
   silêncio, publicar o combate e o códex, e a presença um tique depois —
   é do App, que lê o ref já posto.

   A REDE É A DO APP, e chama-se no instante em que o App a chamava: se o
   lugar da planta estoura nas duas montagens, o erro sobe ao chamador (como
   subia) e a primeira queda já ficou dita. Um efeito devolvido no fim
   morreria com o erro. O códex parte de uma lista vazia quando não há
   lista (o App de antes estourava ali). */
export function abrirOCombate(estado, ctx) {
  const e0 = estado && typeof estado === "object" ? estado : {};
  const c = ctx && typeof ctx === "object" ? ctx : {};
  const calar = typeof c.calou === "function" ? c.calou : () => {};
  const situacao = e0.situacao === undefined ? "cena" : e0.situacao;
  let pers = e0.pers;
  const msgs = [];
  const crus = e0.jaNoRef
    ? ((e0.combateNoRef && e0.combateNoRef.inimigos) || [])
    : (e0.inimigosCrus || []).map((i) => {
      const comp = completarInimigo({ nome: i.nome, ameaca: i.ameaca, nivel: i.nivel }, pers.nivel || 1);
      return { ...comp, derrotado: false, semente: `inimigo|${comp.nome}|${comp.ameaca || ""}` };
    });
  if (!crus.length) return { abriu: false, saida: { pers, msgs, nota: "" } };
  pers = devolverSegura(abrirCombateTracos(pers));
  /* o equipamento */
  const comb = { ...(e0.jaNoRef ? e0.combateNoRef : {}), inimigos: crus };
  const msgsEq = [];
  let inimigos = reconciliarGraus(comb.inimigos, e0.panteao || []);
  inimigos.filter((e) => e.gdPeloSistema).forEach((e) => msgsEq.push(`✦ ${e.nome} é de outra grandeza: o aço comum não o fere.`));
  let g;
  try { g = montarAGrade(pers, inimigos, situacao, e0.planta, e0.sementeDaAbertura); } catch (e) { calar("a abertura da luta pela situação", e); g = montarAGrade(pers, inimigos, "cena", e0.planta, e0.sementeDaAbertura); }
  const ordem = rolarIniciativa([
    { nome: pers.nome, lado: "heroi", modDestreza: atributoEfetivo(pers, "destreza") + iniciativaDeTraco(pers) + iniciativaDeItem(pers) },
    ...(pers.grupo || []).map((g2) => ({ nome: g2.nome, lado: "aliado", modDestreza: 1 })),
    ...g.inimigos.map((e) => ({ nome: e.nome, lado: "inimigo", modDestreza: Number(e.des) || 0 })),
  ], typeof c.sorteDoTurno === "function" ? c.sorteDoTurno("iniciativa") : undefined);
  const equipado = { ...comb, inimigos: g.inimigos, grade: g.grade, heroi: g.heroi, aliados: g.aliados, ordem, rodada: 1, recursos: novosRecursos(), economia: economiaNova(pers) };
  msgsEq.push(`🗺 Terreno: ${mapaEmTexto(g.grade, { heroi: g.heroi, grupo: g.aliados, inimigos: g.inimigos })}`);
  const grandes = g.inimigos.filter((e) => ladoDe(e) > 1);
  if (grandes.length) msgsEq.push(`📏 ${grandes.map((e) => `${e.nome} é ${tamanhoDe(e).nome.toLowerCase()} (${ladoDe(e)}×${ladoDe(e)} quadrados, alcança ${alcanceNatural(e)} m)`).join(" · ")}`);
  msgsEq.push(`🎲 Iniciativa — ${resumoIniciativa(ordem)}`);
  /* a luta posta */
  let combateNoRef = equipado;
  msgs.push(...msgsEq);
  const aval = avaliarEncontro(equipado.inimigos, pers);
  let diaLuta = e0.diaLuta;
  if (aval) {
    combateNoRef = { ...combateNoRef, aval };
    diaLuta = gastarDoDia(diaLuta, aval.custoDoDia);
    msgs.push(selo(aval));
  }
  let descobertas = e0.descobertas || [];
  for (const e of equipado.inimigos) {
    if (e.nome && !descobertas.some((d) => d.toLowerCase() === e.nome.toLowerCase())) descobertas = [...descobertas, e.nome];
  }
  const nota = `${aval ? resumoOrcamentoPrompt(aval, diaLuta) + "\n" : ""}[INICIATIVA ROLADA PELO SISTEMA] Ordem do combate: ${resumoIniciativa(equipado.ordem)}. Respeite essa ordem ao narrar quem age quando.`;
  return { abriu: true, saida: { pers, msgs, nota, combate: equipado }, combateNoRef, diaLuta, descobertas };
}

/* ---------------- O CONTADOR DAS FAÇANHAS (100% por código) ----------------
   Conquistas, fama e nêmesis leem estes contadores; quem os sobe é o
   sistema, nunca o Narrador.

     somarAoContador(contadores, campo, n = 1) → contadores novos

   (o App de antes estourava com os contadores nulos; a peça parte de vazio) */
export function somarAoContador(contadores, campo, n = 1) {
  const c = contadores && typeof contadores === "object" ? contadores : {};
  return { ...c, [campo]: (c[campo] || 0) + n };
}

/* ---------------- O VÍNCULO (por código, zero tokens) ----------------
   Aplica pontos a um companheiro (ou a todos, "todos"). Se cruzar um
   MARCO, o membro ganha +2 PV máx (ganharVinculo) e o Narrador recebe o
   bilhete para criar o momento íntimo.

     osVinculos(grupo, nomeOuTodos, pontos) → { grupo, marcos: [{ linha, nota }] }

   Um marco por membro, na ordem do grupo; o App põe cada linha (no turno ou
   na tela) e a nota dela, uma de cada vez, como fazia. */
export function osVinculos(grupo, nomeOuTodos, pontos) {
  const batidos = [];
  const novo = (grupo || []).map((g) => {
    /* um buraco no grupo fica buraco: não é companheiro, e não estoura em
       `null.nome` quando o vínculo é de um só (T1-A, 7.ª fatia) */
    if (!g || (nomeOuTodos !== "todos" && g.nome !== nomeOuTodos)) return g;
    const r = ganharVinculo(g, pontos);
    if (r.marcoNovo) batidos.push({ nome: g.nome, marco: r.marcoNovo });
    return r.membro;
  });
  const marcos = batidos.map(({ nome, marco }) => ({
    linha: `${marco.icone} ${marco.nome}: seu vínculo com ${nome} se aprofundou — ${nome} ganha +2 PV máx`,
    nota: `[VÍNCULO — MARCO ${marco.nome.toUpperCase()}] ${nome} alcançou o vínculo "${marco.nome}" com o herói. No momento certo (na fogueira, na estrada, após a cena atual), crie um MOMENTO ÍNTIMO: ${nome} compartilha algo pessoal — uma história, um medo, um segredo, um pedido ou um presente simbólico. Se já estivermos conversando com ele(a), pode ser agora.`,
  }));
  return { grupo: novo, marcos };
}

/* ---------------- QUEM FECHA A LUTA E SABE COMO ----------------
   A vitória que o golpe fecha, a que a resposta do Mestre declara: sem
   esta palavra o fecho cai em `encerrada` e conta os caídos pelo último
   retrato visto. Uma luta que abriu e fechou na mesma resposta nunca foi
   vista aberta: nasce aqui, com a ficha de agora como abertura.

     notarOFecho({ lutaDoRecibo, fechoDaLuta, retratoDoFim, fichaViva,
                   idsNoChao, inicio }, { combate, desfecho, caidos, linha })
       → { lutaDoRecibo, fechoDaLuta, retratoDoFim }

   Escreve num dos dois (a luta aberta, ou o fecho que ainda não fechou),
   como o App. MM (a luta tem saída): a `linha` é o que o inimigo fez com
   quem caiu — a frase que a tela do fim mostra debaixo do título. */
export function notarOFecho(estado, args) {
  const e0 = estado && typeof estado === "object" ? estado : {};
  const { combate: c = null, desfecho = null, caidos = null, linha = null } = args && typeof args === "object" ? args : {};
  let lutaDoRecibo = e0.lutaDoRecibo, fechoDaLuta = e0.fechoDaLuta, retratoDoFim = e0.retratoDoFim;
  if (!lutaDoRecibo && !fechoDaLuta) {
    lutaDoRecibo = { fichaNaAbertura: e0.fichaViva, idsNoChao: e0.idsNoChao, inicio: e0.inicio, ultima: c, desfecho: null, caidos: null };
  }
  const naLuta = !!lutaDoRecibo;
  const r = naLuta ? lutaDoRecibo : fechoDaLuta;
  const comb = c || r.ultima;
  if (c) retratoDoFim = c;
  const novo = {
    ...r,
    ultima: comb,
    desfecho: desfecho || r.desfecho,
    ...(linha ? { linha } : {}),
    caidos: Array.from(new Set([...(r.caidos || []), ...(comb ? caidosDaLuta(comb) : []), ...((caidos || []).filter(Boolean))])),
    ...(comb && comb.rodada ? { rodadas: comb.rodada } : {}),
  };
  if (naLuta) lutaDoRecibo = novo; else fechoDaLuta = novo;
  return { lutaDoRecibo, fechoDaLuta, retratoDoFim };
}

/* ---------------- O QUE A LUTA LEVA QUANDO ACABA (v9.53, v9.54, v9.232) ----------------
   A forma animal, a guarda de combate (a do herói e a de cada companheiro),
   a pressa e as invocações não atravessam a porta. Eram cinco lugares que
   zeravam o combate, e o herói ficava urso para sempre e a fera no grupo
   para sempre: uma peça só, chamada em todos.

     limparAsConjuracoes(pers, { calou }) →
       { pers, mudou, telas: [[linha…]…], paraOCronista }

   `telas` são as linhas na ordem e no agrupamento em que o App as punha na
   tela (cada uma, uma chamada); as notas ao Narrador vão à parte (a forma
   desfeita, as invocações encerradas). A guarda do grupo corre na rede do
   App (`calou`): se estourar, cala e fica a do herói. */
export function limparAsConjuracoes(pers, ctx) {
  const c = ctx && typeof ctx === "object" ? ctx : {};
  const calar = typeof c.calou === "function" ? c.calou : () => {};
  let p = pers;
  const telas = [], paraOCronista = [];
  if (!p) return { pers: p, mudou: false, telas, paraOCronista };
  let mudou = false;
  if (estaEmForma(p)) {
    const volta = desfazerForma(p, "luta");
    p = volta.pers; mudou = true;
    telas.push([volta.linha]);
    paraOCronista.push(volta.nota);
  }
  const bg = baixarGuardas(p);
  if (bg.linha) { p = bg.pers; mudou = true; telas.push([bg.linha]); }
  try {
    const linhasBaixa = [];
    const grupoSemGuarda = (p.grupo || []).map((g) => {
      if (!g || !((g.guardas || []).length)) return g;
      const bgc = baixarGuardas(g);
      if (!bgc.linha) return g;
      linhasBaixa.push(`🛡 ${g.nome} · ${bgc.linha.replace(/^🛡\s*/, "")}`);
      return bgc.pers;
    });
    if (linhasBaixa.length) {
      p = { ...p, grupo: grupoSemGuarda }; mudou = true;
      telas.push(linhasBaixa);
    }
  } catch (e) { calar("guarda-do-grupo-fim-da-luta", e); }
  const bp = baixarPressa(p);
  if (bp.linha) { p = bp.pers; mudou = true; telas.push([bp.linha]); }
  const disp = dispensarTodas(p);
  if (disp.sumiram.length) {
    p = disp.pers; mudou = true;
    /* 28/10 (Fase T, trilha B): era a mesma frase de `invocacoesEncerradas`
       escrita aqui à letra — duas cópias que envelhecem em separado. */
    paraOCronista.push(oEnvelopeDosPoderes("invocacoesEncerradas", { sumiram: disp.sumiram }));
  }
  return { pers: p, mudou, telas, paraOCronista };
}

/* ---------------- RITO DE ASCENSÃO (v9.6) ----------------
   Matar um deus não faz de ninguém um deus. O rito faz — e o rito é
   rolado pelo sistema, não narrado pelo Mestre.

     oRitoDoDeicidio(divindade, alvo, nivel) →
       { aberto, divindade, telas, paraOCronista }

   Fechado: uma linha diz porquê, e nada muda. Aberto: a divindade nova
   (com o rito), as duas linhas da prova 1 numa só chamada, e a nota que
   segura o Narrador (o domínio está solto, eu ainda não absorvi nada). O
   App guarda a divindade e salva. */
export function oRitoDoDeicidio(divindade, alvo, nivel) {
  const nv = nivel;
  const chk = podeAbrirRito(divindade, alvo, nv);
  if (!chk.pode) return { aberto: false, divindade, telas: [[`⚱ ${alvo.nome} tombou, mas o rito não abre: ${chk.motivo}.`]], paraOCronista: [] };
  const dv = iniciarRito(divindade, alvo, "deicidio");
  const p = provaAtual(dv);
  return {
    aberto: true, divindade: dv,
    telas: [[
      `⚱ RITO DO DEICÍDIO aberto — o domínio de ${alvo.nome} (GD ${alvo.gd}) está solto e ao alcance.`,
      `Prova 1 de ${p.total}: ${p.nome} — ${p.nota}. Abra o painel de Ascensão para encará-la.`,
    ]],
    paraOCronista: [`[RITO DE ASCENSÃO — ABERTO PELO SISTEMA] ${alvo.nome} caiu e o domínio ficou SOLTO. Eu ainda NÃO absorvi nada e continuo ${tituloDe(grauDe(dv, nv))}. Narre o corpo do deus e o poder pairando sem dono, e pare aí — as provas virão uma a uma, roladas pelo sistema.`],
  };
}
