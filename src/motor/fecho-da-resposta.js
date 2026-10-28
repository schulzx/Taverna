/* ============================================================
   O FECHO DA RESPOSTA, NO MOTOR (T1-A, 7.ª fatia, 28/10/2026) — src/motor/fecho-da-resposta.js

   Depois da luta, do códex, da chegada e do portão, o `aplicarResposta`
   ainda fazia no App o que a resposta do Narrador pede no fim: o PERIGO que
   ela declarou (a investida que vira emboscada montada pelo sistema, ou a
   armadilha que vira salvaguarda) e a QUASE-MORTE (o contador de quem
   chegou ao grupo, o vínculo que a queda a zero aperta e o companheiro que
   caiu desfaz, a cicatriz que fica para sempre, e as conquistas do turno).
   Vêm para cá, na MESMA ORDEM e com os porquês de cada linha.

   A FORMA É A DA LUTA (luta-do-turno.js): o que é do App chega por PORTAS
   (`ctx`) — os órgãos com o nome de sempre, cada um com uma porta só —, e
   o que é do bloco sai como EFEITO, na ordem em que nasceu. Antes de cada
   porta os efeitos pendentes são aplicados (`ctx.aplicar`), porque as
   portas escrevem na tela e na nota e a ordem das linhas é o contrato.

   E O ERRO NÃO SOBE. O bloco do perigo calava tudo ("perigo mal descrito
   nunca custa o turno"); o da quase-morte não tinha guarda nenhuma, e um
   membro torto no grupo derrubava o resto do turno. Aqui as duas peças
   param onde o erro as parou — o que já tinham escrito fica escrito, como
   no App — e devolvem-no em `erro`, para o App o entregar ao `calou`.

   Provado byte a byte contra o App de antes (3ec3364, os dois blocos
   recortados à letra) em `teste-motor-fecho.mjs`.

     oPerigoDaResposta({ pers, perigo, combate, folego, lugares }, ctx)
       → { pers, msgs, erro? }
       ctx: { aplicar, abrirCombate, dispararPerigo }
     aQuaseMorte({ persDoEnvio, pers, dia }, ctx)
       → { pers, erro? }
       ctx: { aplicar, sorteDoTurno, bumpCont, aplicarVinculo, checarConquistas }

   Os efeitos: `nota` (linhas ao Narrador), `textura` (o que a mesa lê do
   turno, somado à de agora), `tela` (linhas do sistema, já na tela) e
   `ficha` (o painel da ficha).
   ============================================================ */
import { montarEmboscada, falaDaEmboscada, envelopeDaEmboscada, envelopeSemCriatura, envelopeDesproporcional } from "../emboscada.js";
import { folegoSegura } from "../fuga.js";
import { sortearCicatriz, CICATRIZ_MAX } from "../danos.js";

/* os efeitos pendentes de uma peça: aplicados antes de cada porta, e no fim */
function pendentes(ctx) {
  const pend = [];
  const descarregar = () => { if (pend.length) ctx.aplicar(pend.splice(0)); };
  return {
    fazer: (ef) => { pend.push(ef); },
    descarregar,
    porta: (nome, ...args) => { descarregar(); return ctx[nome](...args); },
  };
}

/* ---------------- O CANAL FECHADO (v9.68) ----------------
   `resp.rolagem` era o campo pelo qual o Mestre de IA pedia um teste, e o
   código o atendia com uma régua inteira só dele. Deixou de ser lido: o
   contrato não o pede mais, e uma resposta antiga que ainda o traga é
   ignorada em silêncio, porque avisar o jogador de um campo obsoleto seria
   o sistema falando de si mesmo. No lugar dele entra `resp.perigo`: a IA
   diz o que o MUNDO fez, e o sistema escolhe a salvaguarda, a dificuldade,
   o dano e a condição.

   ---------------- A OUTRA METADE DA BRIGA (v9.74) ----------------
   O canal `perigo` servia só às armadilhas e aos elementos. Aqui entra o
   outro tipo de perigo — o que tem vontade própria e vem em cima. A divisão
   é a da casa: ELA diz que há hostilidade e de que tipo, porque isso é
   cena; o SISTEMA decide o encontro, porque quantos são e se aquilo cabe no
   herói da frente é conta, não ficção. Antes disto ela mandava a lista
   inteira montada por conta própria e o sistema só carimbava um selo depois
   do fato consumado — seis ogros contra um herói de nível 2 eram
   anunciados educadamente como "Encontro mortal".

   Com a luta aberta, a investida não abre outra: o perigo vai à
   salvaguarda, como uma armadilha. E o fôlego da fuga protege quem a IA
   descreveu e acabou de ficar para trás. */
export function oPerigoDaResposta(estado, ctx) {
  const e0 = estado && typeof estado === "object" ? estado : {};
  const { fazer, descarregar, porta } = pendentes(ctx);
  let pers = e0.pers;
  const msgs = [];
  const perigo = e0.perigo;
  try {
    if (perigo && !e0.combate) {
      const emb = montarEmboscada(perigo, { pers });
      const embSeguro = emb && emb.tipo === "emboscada"
        && folegoSegura(e0.folego, { lugares: e0.lugares, origem: "emboscada", criatura: emb.criatura });
      if (embSeguro) {
        /* nada: o fôlego da fuga protege — quem a IA descreveu e quem
           acabou de ficar para trás */
      } else if (emb && emb.tipo === "emboscada") {
        const ab = porta("abrirCombate", emb.inimigos, { pers, situacao: "emboscada" });
        pers = ab.pers;
        msgs.push(falaDaEmboscada(emb), ...ab.msgs);
        fazer({ tipo: "nota", linhas: [`${ab.nota}\n${envelopeDaEmboscada(emb)}`] });
        fazer({ tipo: "textura", textura: { luta: true, pilar: "combate" } });
      } else if (emb && emb.tipo === "desproporcional") {
        fazer({ tipo: "nota", linhas: [envelopeDesproporcional(emb)] });
      } else if (emb && emb.tipo === "semCriatura") {
        fazer({ tipo: "nota", linhas: [envelopeSemCriatura()] });
      } else if (!emb) {
        porta("dispararPerigo", perigo);
      }
    } else if (perigo) {
      porta("dispararPerigo", perigo);
    }
  } catch (erro) {
    descarregar();
    return { pers, msgs, erro };
  }
  descarregar();
  return { pers, msgs };
}

/* ---------------- A QUASE-MORTE (o códex do turno) ----------------
   Novos companheiros, a quase-morte e as conquistas do turno, comparando a
   ficha do ENVIO (antes do relógio e da luta) com a de agora.

   VÍNCULO: chegar a 0 PV e sobreviver une o grupo (+4); deixar um
   companheiro cair pesa (−6 só para quem caiu). As linhas dos marcos vão à
   tela pela porta (`aplicarVinculo` sem lista do turno), como sempre foram.

   CICATRIZ (v6.6): sobreviver por um fio pode deixar marca permanente — a
   sorte do turno decide se fica (45%) e qual; o teto é da tabela
   (`CICATRIZ_MAX`, danos.js). O que ela tira da vida máxima nunca leva o
   herói abaixo de 5, e a vida não passa da máxima nova. A nota diz ao
   Narrador que é cânone: pode ser lembrada, e nunca some sozinha. */
export function aQuaseMorte(estado, ctx) {
  const e0 = estado && typeof estado === "object" ? estado : {};
  const { fazer, descarregar, porta } = pendentes(ctx);
  const persDoEnvio = e0.persDoEnvio;
  const dia = e0.dia;
  let pers = e0.pers;
  try {
    const antes = (persDoEnvio.grupo || []).length, agora = (pers.grupo || []).length;
    if (agora > antes) porta("bumpCont", "recrutados", agora - antes);
    let tocouVinculo = false;
    if ((persDoEnvio.vida || 0) > 0 && (pers.vida || 0) <= 0) {
      porta("bumpCont", "quaseMorte", 1);
      pers = { ...pers, grupo: porta("aplicarVinculo", pers.grupo, "todos", 4, null) };
      if (porta("sorteDoTurno", "cicatriz")() < 0.45 && (pers.cicatrizes || []).length < CICATRIZ_MAX) {
        const c = sortearCicatriz(pers.cicatrizes || [], porta("sorteDoTurno", "qual-cicatriz"));
        if (c) {
          const vidaMax = Math.max(5, (pers.vidaMax || 10) + (c.vidaMax || 0));
          pers = { ...pers, cicatrizes: [...(pers.cicatrizes || []), { ...c, dia }], vidaMax, vida: Math.min(pers.vida, vidaMax) };
          fazer({ tipo: "tela", linhas: [`🩸 Cicatriz permanente: ${c.nome} — ${c.descricao}${c.vidaMax ? ` (−${-c.vidaMax} PV máx.)` : ""}`] });
          fazer({ tipo: "nota", linhas: [`[CICATRIZ — CANON PERMANENTE] Quase morri e fiquei com uma marca para sempre: "${c.nome}" (${c.local}), no dia ${dia} da campanha. ${c.descricao} Isso agora faz parte do meu corpo e da minha história — pode ser lembrado, comentado e ter consequências na ficção, mas NUNCA some sozinho.`] });
        }
      }
      tocouVinculo = true;
    }
    (pers.grupo || []).forEach((g) => {
      const antesG = (persDoEnvio.grupo || []).find((a) => a.nome === g.nome);
      if (antesG && (antesG.vida || 0) > 0 && (g.vida || 0) <= 0) {
        pers = { ...pers, grupo: porta("aplicarVinculo", pers.grupo, g.nome, -6, null) };
        tocouVinculo = true;
      }
    });
    if (tocouVinculo) fazer({ tipo: "ficha", ficha: pers });
    porta("checarConquistas", pers);
  } catch (erro) {
    descarregar();
    return { pers, erro };
  }
  descarregar();
  return { pers };
}
