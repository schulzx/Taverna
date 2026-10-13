/* O MAPA VIVO NA TELA (MM17) — a faixa do rumo, a tela grande, e a conta delas

   A forma está em `mente/formas.md` § Mapa e no Figma da pessoa
   (`ffWFqD7TueSb88Mkeg9bhW`, página `07 · Mapa`). Esta suíte prova três
   coisas, como a casa manda (conta se prova, tela se olha):

     1. a tabela `MAPA_VIVO` (estilo.js): o que é igual a `T` É `T`, os três
        modos têm as mesmas chaves, e os contrastes de §7 seguram;
     2. a conta (`faixa-do-rumo.js`), contra os NÓS do Figma na semente 0 —
        a faixa `172:1467` foi desenhada com os dados reais desta semente
        (`dadosDoMapaVivo`), e é com eles que os números batem: a frente a
        188°, Torre Serena a 485,7 px com 25,2 de lado, o N a 1117, o nome
        do sul que cede ao feixe, as duas filas alternadas;
     3. o texto do painel nos pontos onde um descuido mentiria calado: uma
        cor solta, um nome de mecanismo, a contagem de ocultos na tela, o
        feixe a ler o ato, um componente nascido dentro do render, o verbo
        com outra forma que não a da casa.

   E a regra que mais pesa (§5): o fundo da carta e as cristas da faixa
   NUNCA lêem o lugar do fim — nem quando ele aparece.

   FALHA ANTES: `src/faixa-do-rumo.js` e `src/painel-mapa-vivo.jsx` não
   existem, `MAPA_VIVO` não está em estilo.js, e o import cai.
*/
import { readFileSync } from "node:fs";
import * as R from "../src/regiao.js";
import * as MVM from "../src/mapa-vivo.js";
import * as FR from "../src/faixa-do-rumo.js";
import { T, MAPA_VIVO } from "../src/estilo.js";
import { moldePorId } from "../src/moldes.js";
import { estenderEspinha } from "../src/saga.js";
import { ESTRUTURAS } from "../src/historia.js";
import { sementeDe, generoDe } from "./medir-regiao.mjs";

const PAINEL = readFileSync(new URL("../src/painel-mapa-vivo.jsx", import.meta.url), "utf8");
const CONTA = readFileSync(new URL("../src/faixa-do-rumo.js", import.meta.url), "utf8");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const perto = (a, b, eps) => Math.abs(a - b) <= eps;

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const CODIGO = semComentarios(PAINEL);

/* ---------------- os mundos ---------------- */
const molde = moldePorId("sobremundo");
function mundo(i) {
  const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id;
  const mapa = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde, genero, estrutura, modo: "historia" }));
  const e0 = estenderEspinha({ semente, mapa, genero, molde, estrutura, cidadeInicial: mapa.cidades[0].nome });
  const espinha0 = R.espinhaNaRegiao(mapa, e0, { semente, genero, molde });
  /* S10a (13/10) — MOTIVO DA MUDANÇA: a faixa do Figma foi desenhada com o
     feixe no GANCHO (a Muralha, o ato seguinte). Desde a S10a o feixe aponta
     primeiro o marco de pé do ato de agora, e na semente 0 ele mora na base,
     onde o herói está (feixe nenhum). Os números do Figma continuam a valer
     para o caso que eles desenham: o ato 0 cumprido, a frente a cair no
     gancho. A regra nova prova-se em teste-mapa-vivo.mjs (secção 13). */
  const espinha = { ...espinha0, atos: espinha0.atos.map((a, k) => (k === 0 ? { ...a, marcos: a.marcos.map((m) => ({ ...m, feito: true })) } : a)) };
  const estado = { cidadeAtual: mapa.cidades[0].nome, espinha, etapa: 0, dia: 1, minuto: 480, semente };
  return { mapa, estado, dados: MVM.dadosDoMapaVivo(mapa, estado) };
}
const w0 = mundo(0);
const d0 = w0.dados;
const nome = (id) => (d0.nos.find((n) => n.id === id) || {}).nome;

sec("1. A tabela MAPA_VIVO: o que é igual a T é T (§3)");
{
  const alias = { heroi: "amber", heroiTinta: "onAccent", gancho: "amberSoft", perigo: "danger", concluido: "ok", tinta: "ink", tintaMeio: "inkMeio", tintaDim: "inkDim", trilha: "inkDim", estrada: "inkMeio", halo: "pagina", estradaBorda: "pagina", medalhao: "panel", painel: "panel", painelAlto: "panelSoft", medalhaoBorda: "lineStrong", linha: "line", moldura: "bg", aguaLuz: "mundoSoft" };
  const errados = Object.entries(alias).filter(([k, v]) => MAPA_VIVO[k] !== T[v]).map(([k]) => k);
  t("os dezanove apelidos de §3 são as cores de T", errados.length === 0, errados.join(", "));
  const chaves = (o) => JSON.stringify(Object.keys(o).sort());
  const [dia, ent, noite] = ["dia", "entardecer", "noite"].map((m) => MAPA_VIVO.modos[m]);
  t("os três modos têm as mesmas chaves", chaves(dia) === chaves(ent) && chaves(ent) === chaves(noite));
  t("e os mesmos oito chãos", chaves(dia.chao) === chaves(noite.chao) && Object.keys(dia.chao).length === 8);
  t("os chãos são os do motor da viagem (TERRENO_VIAGEM) que a carta pinta", ["floresta", "gelo", "planicie", "colina", "costa", "pantano", "deserto", "montanha"].every((c) => dia.chao[c]));
  t("a lua nunca é âmbar (o âmbar é o herói)", ![T.amber, T.amberSoft].includes(noite.astro));
  t("as estrelas: 0 · 0,3 · 0,9", dia.estrelas === 0 && ent.estrelas === 0.3 && noite.estrelas === 0.9);
  t("toda fase do relógio tem modo", MVM.FASES_DO_DIA.every((f) => MAPA_VIVO.modos[MAPA_VIVO.modoDaFase[f.id]]));
  const Md = MAPA_VIVO.medidas;
  t("§3: medalhão 32/28, alvo 44, faixa 96/48, zoom 1,5/1,8, janela 360/140, longe ½ lado",
    Md.medalhao === 32 && Md.medalhaoTelefone === 28 && Md.alvo === 44 && Md.faixa === 96 && Md.faixaTelefone === 48 && Md.zoom === 1.5 && Md.zoomTelefone === 1.8 && Md.janela === 360 && Md.janelaTelefone === 140 && Md.longe === 0.5);
  t("§3: a névoa abre 0,15 · 0,09 · 0,04 · na estrada 0,08", Md.nevoa.visitado === 0.15 && Md.nevoa.concluido === 0.15 && Md.nevoa.conhecido === 0.09 && Md.nevoa.boato === 0.04 && Md.nevoa.heroiNaEstrada === 0.08);
}

sec("2. O contraste que o desenho mediu (§7)");
{
  for (const m of ["dia", "entardecer", "noite"]) {
    const M = MAPA_VIVO.modos[m];
    t(`${m}: tintaDim sobre o céu ≥ 4,5 (o rumo, o horizonte)`, contraste(T.inkDim, M.ceuAlto) >= 4.5, contraste(T.inkDim, M.ceuAlto).toFixed(2));
    t(`${m}: o âmbar sobre a mata e o gelo ≥ 3 (1.4.11)`, contraste(T.amber, M.mata) >= 3 && contraste(T.amber, M.chao.gelo) >= 3);
    t(`${m}: o âmbar sobre a névoa ≥ 3`, contraste(T.amber, M.nevoa) >= 3);
  }
  t("tinta sobre o painel ≥ 4,5 (o cartão)", contraste(T.ink, T.panel) >= 4.5);
  t("tintaDim sobre o painel ≥ 4,5 (os rótulos do cartão)", contraste(T.inkDim, T.panel) >= 4.5);
  t("onAccent sobre o âmbar ≥ 4,5 (o verbo armado)", contraste(T.onAccent, T.amber) >= 4.5);
  t("o perigo sobre o medalhão ≥ 3 (o selo)", contraste(T.danger, T.panel) >= 3);
}

sec("3. A faixa contra o nó `172:1467` (semente 0, dia 1, 08:00)");
const it = FR.itensDaFaixa(d0, { largura: 1142 });
{
  t("o alvo do feixe é o próximo passo (Muralha Quebrada de Prata Podre)", nome(it.alvoId) === "Muralha Quebrada de Prata Podre", nome(it.alvoId));
  t("a frente é o rumo dele (188°), não o norte", perto(it.frente, 188, 0.5), String(it.frente));
  const rd = FR.rumoEDistancia(d0, d0.nos.find((n) => n.id === it.alvoId));
  t("a 9,3 km do herói (o nome do nó: «188° · 9.3 km»)", !!rd && perto(rd.km, 9.3, 0.06) && !rd.mesmoPonto, rd && String(rd.km));
  const torre = it.lugares.find((l) => l.nome === "Torre Serena");
  /* o nó `172:1514`: x 473,15 + 25,17/2 = 485,7; y 58,34 + 12,58 = 70,9 */
  t("Torre Serena a 485,7 px (±2)", !!torre && perto(torre.x, 485.7, 2), torre && String(torre.x));
  t("com 25,2 de lado (±0,2) e o centro a 70,9 (±0,3)", !!torre && perto(torre.lado, 25.17, 0.2) && perto(torre.cy, 70.92, 0.3), torre && `${torre.lado} · ${torre.cy}`);
  const monte = it.lugares.find((l) => l.nome === "Monte do Sul"), gruta = it.lugares.find((l) => l.nome === "Gruta Névoa");
  t("o mais perto é maior e mais baixo que o mais longe (a régua fixa)", !!monte && !!gruta && monte.lado > gruta.lado && monte.cy > gruta.cy);
  t("o alvo no centro exacto da faixa", it.lugares.some((l) => l.alvo && l.x === 571));
  t("o alvo desenha-se por cima de todos (o último)", it.lugares[it.lugares.length - 1].alvo === true);
  t("o herói não está na faixa (o olhar dele é a frente, §9)", !it.lugares.some((l) => l.id === d0.heroi.noId));
  const N = it.rumos.find((r) => r.id === "norte");
  t("o N a 1117 px e aceso; os outros sete apagados", !!N && perto(N.x, 1117, 2) && N.norte && it.rumos.filter((r) => !r.norte).length === 7);
  const sul = it.horizonte.find((h) => h.nome === "Fronteiras Altos");
  t("o nome do sul cede ao feixe (cai a menos de 30 px dele)", !!sul && sul.oculto);
  const vivos = it.horizonte.filter((h) => !h.oculto);
  t("os que ficam alternam as duas filas, da esquerda para a direita", vivos.every((h, k) => h.y === MAPA_VIVO.faixa.horizonte.filas[k % 2]), vivos.map((h) => h.y).join(","));
  t("a largura do nome do horizonte é a do nó (COLINAS QUEBRADAS ≈ 150)", perto(vivos.find((h) => h.nome === "Colinas Quebradas").largura, 150, 1.5));
  t("o sol às 08:00, a leste da frente e baixo", !!it.astro && it.astro.tipo === "sol" && it.astro.x < 571 && perto(it.astro.y, 31, 1));
  t("o modo da manhã é o dia", it.modo === "dia");
  t("determinístico: a mesma entrada dá a mesma faixa", JSON.stringify(FR.itensDaFaixa(d0, { largura: 1142 })) === JSON.stringify(it));
  const cr = FR.cristasDaFaixa(d0, it);
  t("as duas cristas são caminhos fechados que cobrem a largura", !!cr && /^M-6,96 L/.test(cr.longe) && /Z$/.test(cr.perto));
}

sec("4. O telefone: 140° à frente, só ícones, sem horizonte");
{
  const tel = FR.itensDaFaixa(d0, { largura: 343, telefone: true });
  t("48 de altura e escala ½", tel.altura === 48 && tel.escala === 0.5);
  t("sem horizonte e sem astro", tel.horizonte.length === 0 && tel.astro === null);
  t("só o que cabe em ±70° da frente", tel.lugares.every((l) => Math.abs(((l.graus - tel.frente + 540) % 360) - 180) <= 70));
  t("e menos lugares que na mesa", tel.lugares.length < it.lugares.length);
}

sec("5. O fim não entra no chão (§5.1) — nem quando aparece");
{
  const chaos = FR.chaosDosNos(d0);
  t("o chão vem dos nós visíveis", chaos.length === d0.nos.length);
  t("o chão da ida da ficha pinta o gelo da Muralha", chaos.find((c) => c.id === it.alvoId).bioma === "gelo");
  /* um fim revelado, de gelo, longe de tudo: o fundo e as cristas ficam iguais */
  const fim = { id: "fim|x", nome: "O Fim", tipo: "lugar", subtipo: "cripta", x: 0.9, y: 0.9, estado: "conhecido", atoDaHistoria: "fim", momento: null, bioma: "gelo", vizinhos: [], aqui: false };
  const comFim = { ...d0, nos: [...d0.nos, fim] };
  t("chaosDosNos não o lê", !FR.chaosDosNos(comFim).some((c) => c.id === fim.id));
  t("o fundo da carta é o mesmo, byte a byte", JSON.stringify(FR.fundoDaCarta(comFim)) === JSON.stringify(FR.fundoDaCarta(d0)));
  t("as cristas da faixa também", JSON.stringify(FR.cristasDaFaixa(comFim, it)) === JSON.stringify(FR.cristasDaFaixa(d0, it)));
  /* o motor esconde o fim do mapa num mundo novo; a tela não o desenha */
  t("no mundo novo, o fim nem está nos nós", !d0.nos.some((n) => n.atoDaHistoria === "fim"));
}

sec("6. O feixe lê só `momento` (§2, §5.2)");
{
  const fonte = FR.alvoDoFeixe.toString();
  t("alvoDoFeixe não lê atoDaHistoria", !/atoDaHistoria/.test(fonte));
  t("e o painel não o lê em lado nenhum", !/atoDaHistoria/.test(CODIGO));
  const semGancho = { ...d0, nos: d0.nos.map((n) => ({ ...n, momento: n.aqui ? n.momento : null })) };
  const sg = FR.itensDaFaixa(semGancho, { largura: 1142 });
  t("sem para onde ir, a frente é o norte e não há alvo", sg.frente === 0 && sg.alvoId === null);
  t("e sem alvo nenhum nome cede", sg.horizonte.every((h) => !h.oculto));
  const viagem = { ...d0, heroi: { onde: "viagem", noId: null, x: 0.52, y: 0.55, jornada: { paraId: "cidade|Torre Serena", deId: d0.heroi.noId, fracao: 0.4, horasQueFaltam: 2.2 } } };
  t("na estrada, o alvo é o destino", FR.alvoDoFeixe(viagem).id === "cidade|Torre Serena");
}

sec("7. A carta: a câmara, a estrada curva, os nomes sem colisão");
{
  const cam = FR.camaraDaCarta(d0.heroi, { lado: 860 });
  t("zoom 1,5 centrado no herói", cam.zoom === 1.5 && perto(cam.x0 + cam.vista / 2, d0.heroi.x * 860, 0.5));
  const canto = FR.camaraDaCarta({ x: 0, y: 1 }, { lado: 860 });
  t("presa ao quadro (no canto não mostra fora)", canto.x0 === 0 && perto(canto.y0, 860 - canto.vista, 0.01));
  const a = { x: 0, y: 0 }, b = { x: 100, y: 0 };
  const c = FR.curvaDaAresta(a, b, "x~y");
  t("a curva sai do meio para um lado, pelo id (determinística)", c.x === 50 && Math.abs(c.y) === 8 && JSON.stringify(FR.curvaDaAresta(a, b, "x~y")) === JSON.stringify(c));
  t("o ponto na curva começa e acaba nas pontas", JSON.stringify(FR.pontoNaCurva(a, c, b, 0)) === JSON.stringify({ x: 0, y: 0 }) && FR.pontoNaCurva(a, c, b, 1).x === 100);
  const pos = d0.nos.map((n) => ({ id: n.id, ...FR.noEcra(cam, n.x, n.y) }));
  const itens = pos.map((p) => { const n = d0.nos.find((x) => x.id === p.id); return { id: p.id, x: p.x, y: p.y, raio: 15.25, largura: FR.larguraDoTexto(n.nome, 16), altura: 19 }; });
  const r = FR.colocarRotulos(itens, { lado: 860 });
  const caixas = Object.values(r);
  let cruzam = 0;
  for (let i = 0; i < caixas.length; i++) for (let j = i + 1; j < caixas.length; j++) {
    const p = caixas[i], q = caixas[j];
    if (p.x < q.x + q.largura && q.x < p.x + p.largura && p.y < q.y + q.altura && q.y < p.y + p.altura) cruzam++;
  }
  t("na semente 0, nenhum nome em cima de outro", cruzam === 0, String(cruzam));
  t("nenhum nome em cima de um marcador", Object.entries(r).every(([, p]) => !itens.some((i) => p.x < i.x + 15.25 && i.x - 15.25 < p.x + p.largura && p.y < i.y + 15.25 && i.y - 15.25 < p.y + p.altura)));
  t("o primeiro sítio tentado é por baixo", r[d0.heroi.noId].sitio === "baixo");
  const sul = FR.vizinhoNaSeta(d0.nos, d0.heroi.noId, "baixo");
  const no = d0.nos.find((n) => n.id === sul), base = d0.nos.find((n) => n.id === d0.heroi.noId);
  t("a seta para baixo anda para um nó a sul", !!no && no.y > base.y, no && no.nome);
}

sec("8. As palavras que são conta");
{
  t("horas: 4 h · 2,6 h · 10,5 h", FR.textoDeHoras(4) === "4 h" && FR.textoDeHoras(2.58) === "2,6 h" && FR.textoDeHoras(10.5) === "10,5 h");
  t("quem anda lá: Cultistas e esqueletos.", FR.quemEmTexto(["Cultista", "Esqueleto"]) === "Cultistas e esqueletos.");
  t("três nomes com vírgula e «e»", FR.quemEmTexto(["Lobo", "Javali", "Urso"]) === "Lobos, javalis e ursos.");
  t("plural português: -ão, -l, -r", FR.quemEmTexto(["Dragão"]) === "Dragões." && FR.quemEmTexto(["Chacal"]) === "Chacais." && FR.quemEmTexto(["Caçador"]) === "Caçadores.");
  const muralha = d0.nos.find((n) => n.id === it.alvoId);
  t("a Muralha fica ao sul da Casa do Martelo", FR.rumoPorExtenso(d0.nos.find((n) => n.tipo === "base"), muralha) === "ao sul");
  t("o modo pela fase: madrugada é noite, entardecer é entardecer", FR.modoDaLuz({ fase: "madrugada" }) === "noite" && FR.modoDaLuz({ fase: "entardecer" }) === "entardecer" && FR.modoDaLuz(null) === "dia");
}

sec("9. Trinta regiões: a conta nunca cai nem sai da faixa");
{
  let ruins = [];
  for (let i = 0; i < 30; i++) {
    const w = i === 0 ? w0 : mundo(i);
    if (!w.dados) continue;
    try {
      const f = FR.itensDaFaixa(w.dados, { largura: 1142 });
      const tel = FR.itensDaFaixa(w.dados, { largura: 343, telefone: true });
      const ok = f.lugares.every((l) => l.x >= 0 && l.x <= 1142 && l.lado >= 17.6 && l.lado <= 29)
        && tel.lugares.every((l) => l.x >= 0 && l.x <= 343)
        && FR.cristasDaFaixa(w.dados, f) && FR.fundoDaCarta(w.dados);
      if (!ok) ruins.push(i);
    } catch (e) { ruins.push(`${i}:${e.message}`); }
  }
  t("as trinta faixas cabem e as trinta cartas têm fundo", ruins.length === 0, ruins.join(" "));
  t("lixo dá null, não estoura", FR.itensDaFaixa(null) === null && FR.cristasDaFaixa(null, null) === null && FR.fundoDaCarta(null) === null && FR.alvoDoFeixe(undefined) === null);
}

sec("10. O painel: o que a tela nunca diz, e a forma da casa");
{
  const contrato = PAINEL.slice(0, PAINEL.indexOf("import React"));
  /* MOVIDA na v9.449 (oficial): as duas peças ganharam `chegada` (a hora a que
     a viagem em curso chega, `chegadaDaViagem`), e o contrato escrito no topo
     cresceu com ela — a asserção prende o contrato novo, prop a prop. */
  t("o contrato de props está no topo (as duas peças)", /<FaixaDoRumo dados estadoDaPartida chegada telefone recolhida aoTocarLugar \/>/.test(contrato) && /<TelaDoMapa dados estadoDaPartida chegada telefone inicial aoPartir aoFechar \/>/.test(contrato));
  t("exporta FaixaDoRumo e TelaDoMapa", /export function FaixaDoRumo\(/.test(PAINEL) && /export function TelaDoMapa\(/.test(PAINEL));
  t("nenhuma cor solta (hex ou rgb) no painel", !/#[0-9a-fA-F]{3,8}\b/.test(CODIGO.replace(/url\(#mv-[\w-]+\)/g, "").replace(/`url\(#mv-[^`]*`/g, "")) && !/\brgba?\(/.test(CODIGO));
  t("nem na conta", !/#[0-9a-fA-F]{6}\b/.test(semComentarios(CONTA)) && !/\brgba?\(/.test(semComentarios(CONTA)));
  t("a contagem de ocultos não vai para a tela (§5.3)", !/ocultos|contagem/.test(CODIGO));
  const visiveis = [...CODIGO.matchAll(/"([^"\n]{3,})"/g)].map((m) => m[1]).concat([...CODIGO.matchAll(/>([^<>{}\n]{3,})</g)].map((m) => m[1]));
  const mecanismo = visiveis.filter((s) => /\b(gancho|boato|neblina|momento|postura|feixe)\b/i.test(s) && !/^[a-z]+$/.test(s) && !/mv-|url\(|=>|\$\{|[={}]|MV\./.test(s));
  t("nenhum nome de mecanismo num texto da tela (§5.7)", mecanismo.length === 0, mecanismo.join(" | "));
  t("o feixe diz «para onde a história chama»", /PARA_ONDE_CHAMA = "para onde a história chama"/.test(CODIGO));
  t("e o boato diz «só se ouviu falar»", /boato: "só se ouviu falar"/.test(CODIGO));
  t("o boato sem ficha diz o preço de não ter ido ver (esconder seria mentir)", /Ninguém sabe\. É o preço de não ter ido ver\./.test(CODIGO));
  /* componente dentro do render mata o foco: toda peça nasce no topo */
  const internas = [...PAINEL.matchAll(/^[ \t]+(?:function [A-Z]\w*\(|const [A-Z]\w* = \(\{)/gm)];
  t("nenhum componente definido dentro de outro", internas.length === 0, internas.map((m) => m[0].trim()).join(", "));
  t("o verbo do cartão é o VerboComPreco de ui.jsx (uma ação, uma forma)", /import \{[^}]*\bVerboComPreco\b[^}]*\} from "\.\/ui\.jsx"/.test(PAINEL) && /<VerboComPreco /.test(CODIGO));
  t("o botão violeta do pergaminho não renasce aqui", !/T\.violet/.test(CODIGO));
  t("o veredito vem do motor, protegido (nunca custa a cena)", /function vereditoSeguro[\s\S]{0,160}try \{ return vereditoDaPartida\(/.test(CODIGO));
  t("o veredito sem a chegada não inventa hora: só a do motor", /v\.chegada\.hora/.test(CODIGO) && !/minuto\s*\+\s*.*horasQueFaltam/.test(CODIGO));
  t("o fecho é alvo de 44 e diz Esc", MAPA_VIVO.coluna.fechar.lado === 44 && /aria-label="Voltar à cena \(Esc\)"/.test(CODIGO));
  t("Esc e M fecham; as setas andam; Enter é o verbo", /k === "Escape" \|\| k === "m" \|\| k === "M"/.test(CODIGO) && /vizinhoNaSeta\(/.test(CODIGO) && /k === "Enter"/.test(CODIGO));
  t("em combate a faixa recolhe a zero", /if \(!dados \|\| recolhida\) return null;/.test(CODIGO));
  /* 12/10, v9.444: na janela baixa (800×451) a faixa deixava à prosa 2 linhas
     à vista (6 sem ela). Na altura em que as fichas já tomam a página, a faixa
     recolhe como na luta — o mapa continua pela tecla M e pela aba. */
  t("na janela baixa a faixa recolhe (a prosa não fica com 2 linhas)",
    /recolhida=\{!!combate \|\| alturaDaJanela < FICHAS\.baixaAltura\}/.test(readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8")));
  t("nada anima ao montar (§6): o painel não tem classe de movimento", !/tv-fade|tv-slide|tv-pulse|animation/.test(CODIGO));
  t("o emoji do motor não entra (`icone`)", !/\.icone\b/.test(CODIGO));
}

sec("13. Os acertos de 12/10 (aprendiz): o nome do rumo, o foco, o artigo, as quatro dúvidas");
{
  /* o panorama cortava o nome na borda («EIRAS QUEBRADAS»): o nome que
     passaria da faixa encosta a `horizonte.borda` dela. A função sai do
     painel e corre aqui com a tabela de verdade. */
  const fonteX = (PAINEL.match(/const xDoHorizonte = \(x, largura\) => \{[\s\S]*?\n\};/) || [""])[0];
  t("o painel tem a conta do x do horizonte", !!fonteX);
  const xDoHorizonte = new Function("MV", fonteX + "\nreturn xDoHorizonte;")(MAPA_VIVO);
  const B = MAPA_VIVO.faixa.horizonte.borda;
  t("a borda é 16, o lado da descida", B === 16 && B === MAPA_VIVO.faixa.descida.ladoDireito);
  let fora = [], vistos = 0;
  for (let i = 0; i < 30; i++) {
    const w = i === 0 ? w0 : mundo(i);
    if (!w.dados) continue;
    for (const L of [1142, 760, 520]) {
      const f = FR.itensDaFaixa(w.dados, { largura: L });
      for (const h of f.horizonte.filter((x) => !x.oculto)) {
        vistos++;
        const x = xDoHorizonte(h, L);
        if (x - h.largura / 2 < B - 0.01 || x + h.largura / 2 > L - B + 0.01) fora.push(`${i}:${L}:${h.texto}`);
      }
    }
  }
  t(`nenhum nome do horizonte sai da faixa (${vistos} nomes, 30 regiões, 3 larguras)`, vistos > 0 && fora.length === 0, fora.slice(0, 4).join(", "));
  t("o nome que já cabe não se mexe", xDoHorizonte({ x: 500, largura: 120 }, 1142) === 500);
  t("o nome na borda encosta: «PEDREIRAS QUEBRADAS» a x 40 vai a 16 + metade", xDoHorizonte({ x: 40, largura: 150 }, 1142) === 16 + 75);
  t("o nome maior que a faixa fica ao meio", xDoHorizonte({ x: 10, largura: 2000 }, 1142) === 571);
  t("o desenho usa a conta, não o x cru", /x=\{xDoHorizonte\(x, it\.largura\)\}/.test(CODIGO));

  /* o foco volta a quem o tinha (WAI-ARIA APG, Dialog Modal) */
  const efeito = (CODIGO.match(/React\.useEffect\(\(\) => \{\s*let antes = null;[\s\S]*?\}, \[\]\);/) || [""])[0];
  t("a tela guarda quem tinha o foco antes de o tomar", /antes = typeof document !== "undefined" \? document\.activeElement/.test(efeito) && efeito.indexOf("activeElement") < efeito.indexOf("raiz.current.focus()"));
  t("e devolve-lho ao fechar, só se ele ainda existe", /return \(\) => \{[\s\S]*antes\.isConnected[\s\S]*antes\.focus\(/.test(efeito));

  /* o artigo do nome: sem artigo, a preposição seca (como «de Ponte Nova»);
     nome que começa por artigo contrai */
  const fonteP = (PAINEL.match(/const CONTRACAO = \{[\s\S]*?\nfunction prep\(p, nome\) \{[\s\S]*?\n\}/) || [""])[0];
  const prep = new Function(fonteP + "\nreturn prep;")();
  t("de Casa do Martelo (o nome sem artigo fica seco)", prep("de", "Casa do Martelo") === "de Casa do Martelo");
  t("à porta do que sobrou de Gelo Fundo", prep("de", "O que sobrou de Gelo Fundo") === "do que sobrou de Gelo Fundo");
  t("partir para a Torre…, em os… → nos…", prep("para", "A Torre Serena") === "para a Torre Serena" && prep("em", "Os Fornos") === "nos Fornos");
  t("o «A» que é letra de nome não é artigo sem espaço", prep("de", "Abismo") === "de Abismo");
  t("o verbo e o «onde» usam a contração", /verbo: `Partir \$\{prep\("para", no\.nome\)\}`/.test(CODIGO) && /à porta \$\{prep\("de", no\.nome\)\}/.test(CODIGO) && !/Partir para \$\{no\.nome\}/.test(CODIGO));

  /* as quatro dúvidas da v9.441, decididas e escritas onde moram */
  t("(1) o amanhecer pinta com o Entardecer, decidido", MAPA_VIVO.modoDaFase.amanhecer === "entardecer" && /amanhecer usa o entardecer — DECIDIDO/.test(readFileSync(new URL("../src/estilo.js", import.meta.url), "utf8")));
  t("(2) a régua à escala, decidido", /É À ESCALA|À ESCALA \(15 km/.test(PAINEL) && /DECIDIDO \(`aprendiz`, 12\/10;\s*dúvida 2/.test(PAINEL));
  t("(3) o partir sem glifo: a peça da casa", /dúvida 3 da v9\.441/.test(PAINEL) && /<VerboComPreco /.test(CODIGO));
  t("(4) a chegada às HH:MM, a hora do relógio", /dúvida 4 da v9\.441/.test(PAINEL) && /você chega às \$\{v\.chegada\.hora\}/.test(CODIGO));
}

sec("A tela grande cabe na janela baixa (MM11 · 10.ª sessão, 13/10, foto 13)");
{
  /* A 800×451 a soma era 40 + 320 + 40 + 560 + 40 = 1.000 px, e o
     justify-center com transbordo mandava 64 px da carta para a ESQUERDA,
     onde nenhuma rolagem chega (medido numa página de prova com o painel
     real: carta em x = −64, a caixa a rolar 856 de 792). Depois: carta
     40..360, coluna 400..752 (352), nada a rolar de lado; a 1280×912 nada
     muda (carta 592, coluna 560). */
  const tela = (CODIGO.match(/export function TelaDoMapa\([\s\S]*?\n\}/) || [""])[0];
  const C = MAPA_VIVO.coluna, K = MAPA_VIVO.carta;
  t("os dois pisos estão em tabela (a carta e a coluna)", K.minimo === 320 && C.minimo === 320 && C.minimo < C.largura);
  t("e o 320 escrito à mão saiu do painel", !/minWidth: 320\b/.test(tela) && /minWidth: MV\.carta\.minimo/.test(tela));
  t("a coluna cede primeiro, de 560 ao piso dela, em % da caixa (a barra de rolagem não conta)",
    /const larguraDaColuna = `clamp\(\$\{C\.minimo\}px, calc\(100% - \$\{C\.vao \+ MV\.carta\.minimo\}px\), \$\{C\.largura\}px\)`;/.test(tela)
    && /width: larguraDaColuna/.test(tela));
  t("a carta fica com o resto, e nunca mede pela viewport inteira (100vw)", /calc\(100% - \$\{C\.vao\}px - \$\{larguraDaColuna\}\)/.test(tela) && !/100vw/.test(tela));
  t("o transbordo, se houver, vai para o lado que rola (safe center)", /justifyContent: "safe center"/.test(tela) && !/justify-center/.test(tela.slice(tela.indexOf("const larguraDaColuna"))));
  t("a carta fica presa ao topo enquanto a coluna rola", /position: "sticky", top: MV\.carta\.margem/.test(tela));
  /* a conta, na janela mais estreita que ainda é a tela grande (768): as
     duas colunas nos pisos cabem */
  t("a 768 de largura as duas cabem nos pisos", 2 * K.margem + K.minimo + C.vao + C.minimo <= MAPA_VIVO.medidas.telefoneAte);
}

console.log(`\n${bons} ok, ${maus} falha(s)`);
if (maus) process.exit(1);
