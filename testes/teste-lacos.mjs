/* teste-lacos.mjs (v9.95) — o romance depende da história.

   "Romance é importante nas histórias, até nas mais sombrias — daí
   depende do romance né, um romance mais sombrio ou mais besteirol
   dependendo da história."

   Havia UM romance, com uma forma só, e ele saía igual em toda campanha:
   a convivência, o interesse, a declaração. Um romance sombrio e um
   besteirol não são o mesmo assunto narrado com outra voz — são FORMAS
   DIFERENTES, com semente, véspera e sobretudo PREÇO diferentes.

   E quem separa as leves das duras NÃO é a voz: é a estrutura. A voz
   continua sendo só a boca. O que decide se cabe um casamento-contrato ou
   uma paixão imprudente é o momento do arco e o lugar — porque um amor
   que custa caro precisa de campanha por baixo para custar. */
import { ASSUNTOS, assuntoPorId, escolherAssunto, FAMILIAS } from "../src/compasso.js";
import { garantirSituacao } from "../src/biblioteca.js";
import { VOZES } from "../src/vozes.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const LACOS = ASSUNTOS.filter((a) => a.familia === "laco");
const base = {
  emCidade: true, pessoaNaCena: true, temGenteConhecida: true, temPassado: true,
  temLugarVisitado: true, gentePorPerto: 3, genteLonge: 3, diasAteVizinha: 2, nivel: 8, fama: 40,
};
const abertosLaco = (sit) => LACOS.filter((a) => !a.quando || a.quando(garantirSituacao({ ...base, ...sit }))).map((a) => a.id);

sec("1. A FAMÍLIA TEM CORPO");
{
  t(`há muitos laços (${LACOS.length})`, LACOS.length >= 15);
  t(`e o acervo cresceu junto (${ASSUNTOS.length})`, ASSUNTOS.length >= 65);
  const completos = LACOS.filter((a) => a.nome && a.preparo && a.subindo && a.vespera && a.agora && a.depois);
  t("todos têm os cinco tempos", completos.length === LACOS.length);
  /* nenhuma família pode engolir o acervo, nem esta */
  const conta = {};
  for (const a of ASSUNTOS) conta[a.familia] = (conta[a.familia] || 0) + 1;
  const maior = Math.max(...Object.values(conta));
  t(`nenhuma família domina (maior: ${maior} de ${ASSUNTOS.length})`, maior < ASSUNTOS.length * 0.35);
  t("e as seis continuam povoadas", FAMILIAS.every((f) => (conta[f.id] || 0) >= 6));

  /* AS FORMAS SÃO DISTINTAS, não a mesma cena repintada: o que separa um
     romance do outro é a SEMENTE e o PREÇO, e os dois têm de diferir */
  const romances = ["romance", "paixao_subita", "amor_proibido", "amor_antigo", "quem_me_quer", "triangulo", "casamento_arranjado"];
  t("há sete formas de romance", romances.every((id) => !!assuntoPorId(id)));
  t("com sementes distintas", new Set(romances.map((id) => assuntoPorId(id).preparo)).size === romances.length);
  t("e preços distintos", new Set(romances.map((id) => assuntoPorId(id).depois)).size === romances.length);
  /* e nenhuma delas resolve por mim: a palavra volta ao jogador nas que
     pedem decisão dele */
  t("quem me quer devolve a palavra", /a palavra volta para mim/.test(assuntoPorId("quem_me_quer").agora));
}

sec("2. A ESTRUTURA SEPARA AS LEVES DAS DURAS");
{
  const cedo = abertosLaco({ momento: 0.1, porte: "aldeia" });
  const meio = abertosLaco({ momento: 0.5, porte: "cidade" });
  const fim = abertosLaco({ momento: 0.85, porte: "capital", ordemDaFase: 3, temDerrotado: true });

  t(`o começo tem laços (${cedo.length})`, cedo.length >= 6);
  t(`o meio tem mais (${meio.length})`, meio.length > cedo.length);
  t(`e o fim tem mais ainda (${fim.length})`, fim.length > meio.length);
  t("no fim, todos abrem", fim.length === LACOS.length);

  /* AS LEVES ESTÃO LÁ DESDE O COMEÇO: um jogo em que só se pode amar
     depois da metade é um jogo sem juventude */
  for (const id of ["romance", "paixao_subita", "amizade", "quem_me_quer"]) {
    t(`"${id}" abre desde o começo`, cedo.includes(id));
  }
  /* AS DURAS PEDEM CAMPANHA POR BAIXO: um amor que custa caro precisa de
     história acumulada para ter o que custar */
  for (const id of ["amor_proibido", "amor_antigo", "inimigo_util"]) {
    t(`"${id}" não abre no começo`, !cedo.includes(id));
  }
  t("o amor antigo abre no meio", meio.includes("amor_antigo"));
  t("e o inimigo útil só perto do fim", !meio.includes("inimigo_util") && fim.includes("inimigo_util"));

  /* e o amor antigo exige alguém que NÃO esteja aqui — senão a IA teria de
     inventar de onde a pessoa reapareceu */
  t("sem ninguém longe, não há amor antigo",
    !abertosLaco({ momento: 0.6, porte: "cidade", genteLonge: 0 }).includes("amor_antigo"));
}

sec("3. A CORTE TEM LAÇOS PRÓPRIOS");
{
  /* era a pendência da v9.94: a corte só tinha ganhado a intriga */
  const vila = abertosLaco({ momento: 0.6, porte: "vila" });
  const cidade = abertosLaco({ momento: 0.6, porte: "cidade" });
  const capital = abertosLaco({ momento: 0.6, porte: "capital" });
  t("o casamento-contrato pede cidade", !vila.includes("casamento_arranjado") && cidade.includes("casamento_arranjado"));
  t("o refém-hóspede pede capital", !cidade.includes("refem_hospede") && capital.includes("refem_hospede"));
  t("a intriga de corte pede capital", !cidade.includes("intriga_de_corte") && capital.includes("intriga_de_corte"));
  t("o afilhado pede cidade e fama", cidade.includes("afilhado") && !abertosLaco({ momento: 0.6, porte: "cidade", fama: 4 }).includes("afilhado"));
  t(`a capital ganhou laços de verdade (${capital.length - vila.length} a mais que a vila)`, capital.length - vila.length >= 3);
}

sec("4. O CHÃO ENCONTRA O TAMANHO");
{
  /* a outra pendência da v9.94: uma capital no gelo e uma aldeia no gelo
     abriam os mesmos assuntos de chão, e não são a mesma coisa — um
     povoado SOBREVIVE ao lugar, uma cidade DEPENDE dele em escala */
  const abre = (id, sit) => {
    const a = assuntoPorId(id);
    return !!a && (!a.quando || a.quando(garantirSituacao({ ...base, ...sit })));
  };
  t("o porto pede costa E cidade",
    abre("porto", { bioma: "costa", porte: "cidade" })
    && !abre("porto", { bioma: "costa", porte: "aldeia" })
    && !abre("porto", { bioma: "gelo", porte: "cidade" }));
  t("a política da água pede deserto E vila",
    abre("oasis", { bioma: "deserto", porte: "vila" }) && !abre("oasis", { bioma: "costa", porte: "vila" }));
  t("a cidade alimentada pede chão duro E tamanho",
    abre("cidade_alimentada", { bioma: "gelo", porte: "cidade" })
    && !abre("cidade_alimentada", { bioma: "gelo", porte: "aldeia" })
    && !abre("cidade_alimentada", { bioma: "planicie", porte: "cidade" }));
  t("o entreposto pede montanha, vila E ter para onde ir",
    abre("entreposto", { bioma: "montanha", porte: "vila", diasAteVizinha: 3 })
    && !abre("entreposto", { bioma: "montanha", porte: "vila", diasAteVizinha: 0 }));
}

sec("5. A VOZ NÃO ESCOLHE NADA DISTO");
{
  /* a divisão da v9.92 continua de pé: a voz é a boca. Um romance sombrio
     e um besteirol são o MESMO assunto se a estrutura escolher o mesmo —
     e formas diferentes quando a estrutura oferece formas diferentes. É a
     estrutura que dá o leque, e a voz que dá o timbre. */
  const nomesDeVoz = VOZES.map((v) => v.id);
  const acopla = LACOS.filter((a) => nomesDeVoz.some((id) => String(a.quando).includes(id)));
  t("nenhum laço consulta a voz", acopla.length === 0);
  /* A REGRA ESTRUTURAL, e não a busca por palavras: "voz" é palavra comum
     em português ("dito em voz baixa") e "sombrio" é adjetivo antes de ser
     id. Procurar por elas reprova texto correto — foi o TERCEIRO homógrafo
     a morder esta suíte, depois de "role" dentro de "controle" e "cobre"
     de "cobrir". O que importa é o ACOPLAMENTO: nenhum `quando` pode ler a
     voz, e nenhum texto pode mandar narrar num modo específico. */
  const leemVoz = ASSUNTOS.filter((a) => /s\.voz|vozPorId|VOZES/.test(String(a.quando)));
  t("nenhum assunto lê a voz na condição", leemVoz.length === 0);
  const mandamModo = ASSUNTOS.filter((a) => /narre no (tom|modo|registro)|use a voz/i.test(a.preparo + a.agora + a.depois));
  t("e nenhum manda narrar num modo", mandamModo.length === 0);

  /* e a prova pelo outro lado: o sorteio não recebe a voz */
  const semVoz = escolherAssunto(garantirSituacao({ ...base, momento: 0.5, porte: "cidade" }), { sorte: () => 0.5 });
  t("o sorteio funciona sem voz nenhuma", !!semVoz);
}

console.log(`\nlaços v9.95: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
