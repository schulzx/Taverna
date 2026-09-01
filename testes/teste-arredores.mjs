/* teste-arredores.mjs (v9.51) — o cinturao da cidade e a nevoa que abre. */
import { arredoresDaCidade, arredorPorTexto, tempoDeIda, resumoArredoresPrompt, TIPOS_ARREDOR } from "../src/arredores.js";
import { descobrirVizinhanca, descobrirCidade, pisarNaCidade, gerarGeografia } from "../src/geografia.js";
import { locaisDaCidade } from "../src/mundo-base.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const SEM = "Prova|Fantasia medieval";
const cidade = { nome: "Nova do Norte", porte: "capital", tipo: "capital", bioma: "planicie", x: 70, y: 53, regiao: "Fronteiras do Estio" };
const aldeia = { nome: "Vila das Águias", porte: "aldeia", tipo: "aldeia", bioma: "planicie", x: 67, y: 20 };
const porto = { nome: "Porto clara", porte: "vila", tipo: "vila", bioma: "costa", x: 54, y: 65 };
const gelo = { nome: "Pedra do Rei", porte: "vila", tipo: "vila", bioma: "gelo", x: 71, y: 43 };

sec("1. o cinturao existe e e sempre o mesmo");
{
  const a = arredoresDaCidade(SEM, cidade);
  const b = arredoresDaCidade(SEM, cidade);
  t("a capital tem 5 arredores", a.length === 5);
  t("a aldeia tem 2", arredoresDaCidade(SEM, aldeia).length === 2);
  t("mesma semente, mesmos lugares", JSON.stringify(a) === JSON.stringify(b));
  t("outra semente, outro cinturao", JSON.stringify(arredoresDaCidade("outra", cidade)) !== JSON.stringify(a));
  t("cada um tem nome, dono e minutos", a.every((x) => x.nome && x.dono && x.minutos > 0));
  t("e id unico", new Set(a.map((x) => x.id)).size === a.length);
  t("cidade sem nome nao quebra", arredoresDaCidade(SEM, null).length === 0 && arredoresDaCidade(SEM, {}).length === 0);
}

sec("2. o bioma manda no que existe");
{
  const tipos = (c) => arredoresDaCidade(SEM, c).map((x) => x.tipo);
  t("a costa pode ter embarcadouro, a planicie nao", !tipos(cidade).includes("embarcadouro"));
  t("o gelo nao tem pomar nem salinas", !tipos(gelo).some((x) => ["pomar", "salinas"].includes(x)));
  t("a planicie nao tem mina", !tipos(cidade).includes("mina"));
  /* a regra em si, sem depender do sorteio */
  for (const c of [cidade, aldeia, porto, gelo]) {
    const fora = arredoresDaCidade(SEM, c).filter((a) => {
      const def = TIPOS_ARREDOR.find((x) => x.tipo === a.tipo);
      return def.bioma && !def.bioma.includes(c.bioma);
    });
    t(`nada fora do bioma em ${c.nome}`, fora.length === 0);
  }
}

sec("3. arredor e caminhada, nao viagem");
{
  const a = arredoresDaCidade(SEM, cidade);
  t("ninguem passa de 2 horas de ida", a.every((x) => x.minutos <= 120));
  t("o texto sai em minutos ou horas", /min a pé|h a pé/.test(tempoDeIda(a[0])));
  t("30 min sai em minutos", tempoDeIda({ minutos: 30 }) === "30 min a pé");
  /* v9.118: com VÍRGULA. A formatação passou para aPeEmTexto, que é a
     mesma dos pontos do rastreio — e ela escreve em português, como o
     resto dos números que o jogador lê nesta casa. O ponto decimal era o
     que aparecia na tela desde a v9.51. */
  t("90 min sai em horas", tempoDeIda({ minutos: 90 }) === "1,5 h a pé");
}

sec("4. o jogador aponta pelo nome ou pelo tipo");
{
  const a = arredoresDaCidade(SEM, cidade);
  const alvo = a[0];
  t("acha pelo nome inteiro", (arredorPorTexto(SEM, cidade, `vou até ${alvo.nome}`) || {}).id === alvo.id);
  t("acha pelo tipo solto", !!arredorPorTexto(SEM, cidade, `sigo para o ${alvo.tipo}`));
  t("frase sem arredor nenhum devolve null", arredorPorTexto(SEM, cidade, "converso com o taverneiro") === null);
  t("texto vazio nao quebra", arredorPorTexto(SEM, cidade, "") === null);
}

sec("5. a posicao serve as duas escalas");
{
  const a = arredoresDaCidade(SEM, cidade);
  t("no mapa-mundo fica perto da cidade", a.every((x) => Math.hypot(x.x - cidade.x, x.y - cidade.y) < 12));
  t("e dentro do pergaminho", a.every((x) => x.x >= 2 && x.x <= 98 && x.y >= 2 && x.y <= 98));
  t("na planta cada um tem seu angulo", new Set(a.map((x) => Math.round(x.ang * 100))).size === a.length);
}

sec("6. o Mestre recebe a lista pronta");
{
  const txt = resumoArredoresPrompt(SEM, cidade);
  const a = arredoresDaCidade(SEM, cidade);
  t("todos os nomes vao no envelope", a.every((x) => txt.includes(x.nome)));
  t("com o tempo de ida", txt.includes("a pé"));
  t("e a proibicao de inventar outro", /não invente outro/.test(txt));
  /* v9.118: o bloco fixo dos arredores saiu do prompt (era o mesmo par de
     regras que este envelope já diz, atrás de uma porta que só abre quando
     o envelope existe). A parte que era só dele desceu para cá. */
  t("e a de renomear, que era do bloco fixo", /não renomeie/.test(txt));
  t("e o RUMO de cada um, para 'do outro lado da cidade' ser um fato", /(ao norte|a nordeste|a leste|a sudeste|ao sul|a sudoeste|a oeste|a noroeste)/.test(txt));
  t("diz que e paisagem, nao segredo", /PAISAGEM, não segredo/.test(txt));
  t("cidade sem arredor devolve vazio", resumoArredoresPrompt(SEM, null) === "");
}

sec("7. a nevoa abre ao redor de onde o pe pisa");
{
  const mapa = gerarGeografia("teste|nevoa", null);
  const cs = mapa.cidades.map((c) => ({ ...c, descoberta: false }));
  let m = { ...mapa, cidades: cs };
  t("o mundo comeca todo na nevoa", m.cidades.every((c) => c.descoberta === false));

  const inicial = m.cidades[0].nome;
  m = descobrirCidade(m, inicial).mapa;
  const antes = m.cidades.filter((c) => c.descoberta !== false).length;
  t("pisar revela uma", antes === 1);

  const viz = descobrirVizinhanca(m, inicial);
  t("e a vizinhanca revela mais", viz.novas.length >= 1);
  m = viz.mapa;
  t("as novas vem marcadas como 'de ouvir'", m.cidades.filter((c) => viz.novas.includes(c.nome)).every((c) => c.deOuvir === true));
  t("a que ele pisou NAO e de ouvir", !m.cidades.find((c) => c.nome === inicial).deOuvir);
  t("nao abre o mundo inteiro", m.cidades.filter((c) => c.descoberta !== false).length < m.cidades.length);

  t("repetir nao revela de novo", descobrirVizinhanca(m, inicial).novas.length === 0);
  t("cidade que nao existe nao quebra", descobrirVizinhanca(m, "Lugar Nenhum").novas.length === 0);
  t("mapa vazio nao quebra", descobrirVizinhanca(null, "x").novas.length === 0);

  /* a regua e a rota: so entra quem esta ligado por estrada dentro do teto */
  const ligadas = new Set();
  for (const r of m.rotas) { if (r.de === inicial) ligadas.add(r.para); if (r.para === inicial) ligadas.add(r.de); }
  t("todas as novas estao ligadas por rota", viz.novas.every((n) => ligadas.has(n)));

  /* e pisar nela tira o tracejado: saber que existe nao e conhecer */
  const alvo = viz.novas[0];
  const m2 = pisarNaCidade(m, alvo);
  t("pisar apaga o de-ouvir", !m2.cidades.find((c) => c.nome === alvo).deOuvir);
  t("e ela continua descoberta", m2.cidades.find((c) => c.nome === alvo).descoberta === true);
  t("pisar de novo nao muda nada", pisarNaCidade(m2, alvo) === m2);
  t("pisar em quem nunca foi ouvida nao quebra", pisarNaCidade(m2, "Lugar Nenhum") === m2);
}

sec("8. a planta da cidade tem o que desenhar");
{
  const locais = locaisDaCidade(SEM, cidade, "Fantasia medieval", null);
  t("a capital tem 7 locais", locais.length === 7);
  t("todos com icone e nome", locais.every((l) => l.icone && l.nome));
  t("a taverna existe sempre", locais.some((l) => l.tipo === "taverna"));
  t("o mercado tambem (e vira a praça)", locais.some((l) => l.tipo === "mercado"));
  t("a aldeia tem menos", locaisDaCidade(SEM, aldeia, "Fantasia medieval", null).length === 2);
  t("dentro + fora nao colidem em id", new Set([...locais, ...arredoresDaCidade(SEM, cidade)].map((x) => x.id)).size === locais.length + 5);
}

console.log(`\narredores v9.51: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
