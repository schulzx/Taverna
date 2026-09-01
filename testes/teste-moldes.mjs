import { MOLDES, moldePorId, moldesDisponiveis, biomaDe, idsDeBioma, temEixo, fatorDePerigo, comoSeChama, resumoMoldePrompt } from "../src/moldes.js";
import { gerarGeografia, PORTES, TERRENO_VIAGEM } from "../src/geografia.js";
import { oQueExisteAqui, garantirBase } from "../src/mundo-base.js";
let ok=0, fail=0;
const t=(n,c)=>{ if(c) ok++; else { fail++; console.log("  ✗ "+n); } };

/* --- os moldes --- */
t("há quatro moldes", MOLDES.length === 4);
t("todo molde declara eixos", MOLDES.every(m => Array.isArray(m.eixos) && m.eixos.length));
t("todo molde nomeia o assentamento", MOLDES.every(m => m.assentamento && m.assentamento.singular && m.assentamento.plural));
t("todo molde traz biomas com custo", MOLDES.every(m => m.biomas.length >= 5 && m.biomas.every(b => b.id && b.rotulo && b.cd > 0 && b.abundancia > 0)));
t("todo molde traz locais com papéis", MOLDES.every(m => m.locais.length >= 6 && m.locais.every(l => l.tipo && l.papeis.length)));
t("todo molde traz vontades", MOLDES.every(m => m.vontades.length >= 12));
t("todo molde tem ao menos dois locais sempre presentes", MOLDES.every(m => m.locais.filter(l => l.sempre).length >= 2));
t("id desconhecido cai no padrão", moldePorId("nada").id === "sobremundo");
t("a torre é 1D", temEixo("torre","z") && !temEixo("torre","x"));
t("o sobremundo é 2D", temEixo("sobremundo","x") && !temEixo("sobremundo","z"));
t("o braço estelar é 3D", ["x","y","z"].every(e => temEixo("estelar", e)));
t("moldesDisponiveis é enxuto", moldesDisponiveis().every(m => m.id && m.nome && m.icone));

/* --- vocabulário --- */
t("na torre o lugar é andar", comoSeChama("torre") === "andar" && comoSeChama("torre",2) === "andares");
t("no arquipélago é ilha", comoSeChama("arquipelago") === "ilha");
t("no sobremundo é cidade", comoSeChama("sobremundo") === "cidade");

/* --- progressão --- */
t("sem progressão, perigo é plano", fatorDePerigo("sobremundo", 50) === 1);
t("na torre o andar 1 é o piso", fatorDePerigo("torre", 1) === 1);
t("e o andar 11 pesa 2,2x", Math.abs(fatorDePerigo("torre", 11) - 2.2) < 0.001);
t("perigo nunca é negativo", fatorDePerigo("torre", -5) === 1);

/* --- biomas --- */
t("bioma desconhecido tem fallback", !!biomaDe("torre","planicie"));
t("cada molde tem ids próprios", idsDeBioma("torre").includes("salao") && !idsDeBioma("torre").includes("pantano"));

/* --- geração por topologia --- */
const SEM = "molde-teste";
for (const m of MOLDES) {
  const g = gerarGeografia(SEM, m);
  t(`${m.id}: gera lugares`, g.cidades.length >= 4);
  t(`${m.id}: gera rotas`, g.rotas.length >= 1);
  t(`${m.id}: todo lugar tem nome único`, new Set(g.cidades.map(c=>c.nome)).size === g.cidades.length);
  t(`${m.id}: todo bioma é do molde`, g.cidades.every(c => idsDeBioma(m).includes(c.bioma)));
  t(`${m.id}: todo porte tem ficha`, g.cidades.every(c => !!PORTES[c.porte]));
  t(`${m.id}: todo terreno de rota tem ficha`, g.rotas.every(r => !!TERRENO_VIAGEM[r.terreno]));
  t(`${m.id}: rotas ligam lugares que existem`, g.rotas.every(r => g.cidades.some(c=>c.nome===r.de) && g.cidades.some(c=>c.nome===r.para)));
  t(`${m.id}: determinístico`, JSON.stringify(gerarGeografia(SEM, m)) === JSON.stringify(g));
  t(`${m.id}: semente diferente, mundo diferente`, JSON.stringify(gerarGeografia("outra", m)) !== JSON.stringify(g));
  t(`${m.id}: só um lugar começa descoberto ou todos fechados`, g.cidades.filter(c=>c.descoberta).length <= 1);
}

/* --- a torre é uma pilha de verdade --- */
{
  const g = gerarGeografia(SEM, moldePorId("torre"));
  const zs = g.cidades.map(c=>c.z).sort((a,b)=>a-b);
  t("torre: andares numerados de 1 em diante", zs[0] === 1 && zs[zs.length-1] === zs.length);
  t("torre: sem andar repetido", new Set(zs).size === zs.length);
  t("torre: rotas só ligam andares vizinhos", g.rotas.every(r => {
    const a = g.cidades.find(c=>c.nome===r.de), b = g.cidades.find(c=>c.nome===r.para);
    return Math.abs(a.z - b.z) === 1;
  }));
  t("torre: subir custa horas, não dias", g.rotas.every(r => r.dias <= 0.5));
  t("torre: o topo é o átrio", g.cidades.find(c=>c.z===zs.length).porte === "átrio");
  t("torre: só o primeiro andar começa aberto", g.cidades.filter(c=>c.descoberta).length === 1);
}

/* --- o braço estelar usa os três eixos --- */
{
  const g = gerarGeografia(SEM, moldePorId("estelar"));
  t("estelar: sistemas têm z", g.cidades.every(c => typeof c.z === "number"));
  t("estelar: z varia", new Set(g.cidades.map(c=>c.z)).size > 1);
}

/* --- o sobremundo não regrediu --- */
{
  const g = gerarGeografia(SEM, moldePorId("sobremundo"));
  t("sobremundo: sem eixo z", g.cidades.every(c => c.z === undefined));
  t("sobremundo: rotas em km", g.rotas.every(r => r.km >= 20));
  t("sobremundo: continentes nomeados", g.continentes.length >= 1 && !!g.continente);
}

/* --- o prompt --- */
const p = resumoMoldePrompt("torre");
t("o prompt diz a palavra certa", /ANDAR/.test(p) && !/nunca "cidade" por hábito/.test(p) === false);
t("o prompt lista os terrenos", /salões de pedra/.test(p));
t("o prompt traz a progressão", /12% mais perigoso/.test(p));
t("o prompt do sobremundo não inventa progressão", !/PROGRESSÃO/.test(resumoMoldePrompt("sobremundo")));


/* --- v9.40: o obrigatório é obrigatório ---
   Um patamar da Torre nasceu sem PORTAL porque a contagem de locais do porte
   cortava a lista antes do fim. Sem portal não há como subir: o mundo virava
   um beco. Este teste existe para isso nunca mais passar despercebido. */
{
  const base = garantirBase(null);
  for (const m of MOLDES) {
    const g = gerarGeografia("obrig", m);
    const obrig = m.locais.filter((l) => l.sempre).map((l) => l.tipo);
    t(`${m.id}: declara locais obrigatórios`, obrig.length >= 2);
    let piorCaso = 99, faltou = null;
    for (const c of g.cidades) {
      const q = oQueExisteAqui("obrig", g, c.nome, base, m.generoPadrao, m);
      const tipos = q.locais.map((l) => l.tipo);
      piorCaso = Math.min(piorCaso, q.locais.length);
      const f = obrig.find((o) => !tipos.includes(o));
      if (f && !faltou) faltou = `${c.nome} sem ${f}`;
    }
    t(`${m.id}: todo lugar tem os locais obrigatórios${faltou ? ` (${faltou})` : ""}`, !faltou);
    t(`${m.id}: nenhum lugar fica sem nada`, piorCaso >= 2);
  }
  const torre = gerarGeografia("obrig", moldePorId("torre"));
  t("a Torre tem dezenas de andares, não uma dúzia", torre.cidades.length >= 72);
  t("e o portal é obrigatório em todo andar", moldePorId("torre").locais.some((l) => l.tipo === "portal" && l.sempre));
}

console.log(`\nmoldes v9.40: ${ok} passaram, ${fail} falharam`);
process.exit(fail?1:0);
