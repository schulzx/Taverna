/* ============================================================
   A CHEGADA E A CRIAÇÃO (V5 + C2 · 16/11/2026) — testes/teste-criacao-da-mesa.mjs

   O sorteio pela semente (mesma semente ⇒ mesma mesa), o que «trocar»
   preserva, os pontos (a regra da classe, o piso e o teto), A FICHA IGUAL
   À DA CRIAÇÃO ANTIGA (uma cópia do objeto que vivia no onClick de
   «ENTRAR NA TAVERNA», comparada campo a campo com montarFicha), o herói
   da mesa ser um herói que o caminho antigo podia criar, o mundo na forma
   que a tela antiga entregava, o save visto da porta, os glifos copiados
   presos ao original, a abertura instantânea do index.html batendo com
   ABERTURA_INSTANTANEA, as telas renderizadas e a fiação.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildSync } from "esbuild";
import {
  SORTEIO_DA_MESA, ATRIBUTOS_POR_CLASSE, NO_FEMININO, POR_PONTO, NOME_DA_CAMPANHA, fio, generoPorId, generosDaCriacao, espinhasDaCriacao,
  racasDaCriacao, noSexo, pontosVazios, pontosUsados, pontosRestantes, ordemDaClasse, distribuirPorClasse, ajustarPonto, razaoDoPonto,
  porOsQueFaltam, atributosComRaca, nomeSorteado, conceitoDoSistema, antecedenteDaMesa, sortearMesa, trocarNoHeroi, outroNome, trocarNoMundo,
  vizinho, mundoDaMesa, nomeDaCampanhaDaMesa, escolhasDaMesa, razaoDeNaoComecar, resumoDoSave, sementeDaVisita, sementeSeguinte, textoNoSexo,
} from "../src/criacao-da-mesa.js";
import { montarFicha } from "../src/ficha-da-criacao.js";
import { CLASSES, PROFISSOES, racasDoGenero, classePorNome, racaPorNome, habilidadesIniciais } from "../src/classes.js";
import { ANTECEDENTES, antecedentePorId } from "../src/antecedentes.js";
import { VOZES } from "../src/vozes.js";
import { moldesDisponiveis } from "../src/moldes.js";
import { ESTRUTURAS } from "../src/historia.js";
import { GENEROS, ATRIBUTOS, PONTOS_TOTAIS, ATRIBUTO_MAX_CRIACAO, MOEDAS_INICIAIS } from "../src/constantes.js";
import { periciasIniciais } from "../src/pericias.js";
import { comDom } from "../src/tracos.js";
import { equiparKitInicial } from "../src/kit-inicial.js";
import { GLIFOS } from "../src/glifos.js";
import { ABERTURA_INSTANTANEA, LUZ_DA_CHEGADA, LUZ_DA_MESA, CARTA_DE_RETRATO, CARTA_DO_HEROI, CARTA_DO_MUNDO, PECA_DE_ATRIBUTO, BOTAO_DA_MESA, POR_A_MESA, REVELAR_A_PROSA, GLIFOS_DA_CHEGADA, GLIFO_DA_VOZ, GLIFO_DO_MOLDE, GLIFO_DO_ARCO, CSS_DA_CHEGADA } from "../src/estilo.js";
import { letraDaMesa } from "../src/mesa-do-mestre.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..");
const SRC = path.join(RAIZ, "src");
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (n) => console.log("\n" + n);
const J = JSON.stringify;
const SEMENTES = Array.from({ length: 200 }, (_, i) => `mesa|prova${i}`);

sec("1. o sorteio pela semente");
{
  const a = sortearMesa("mesa|abc"), b = sortearMesa("mesa|abc");
  t("mesma semente ⇒ mesma mesa, campo a campo", J(a) === J(b));
  const mesas = SEMENTES.map(sortearMesa);
  t("200 sementes dão mais de 6 classes e mais de 5 raças diferentes", new Set(mesas.map((m) => m.heroi.classe)).size > 6 && new Set(mesas.map((m) => m.heroi.raca)).size > 5);
  t("os dois sexos aparecem", new Set(mesas.map((m) => m.heroi.sexo)).size === 2);
  t("o mundo sorteado sai de SORTEIO_DA_MESA.generos (a fantasia, a das 240 pinturas)", mesas.every((m) => SORTEIO_DA_MESA.generos.includes(m.mundo.generoId)));
  t("molde, arco e voz variam e saem das tabelas", new Set(mesas.map((m) => m.mundo.voz)).size > 4 && mesas.every((m) => moldesDisponiveis().some((x) => x.id === m.mundo.molde) && espinhasDaCriacao().some((x) => x.id === m.mundo.estrutura) && VOZES.some((v) => v.id === m.mundo.voz)));
  t("o fio de um campo é determinístico e próprio do campo", fio("s", "raca")() === fio("s", "raca")() && fio("s", "raca")() !== fio("s", "classe")());
  t("nenhum texto obrigatório: nome e conceito já vêm escritos", mesas.every((m) => m.heroi.nome.trim() && m.heroi.conceito.trim()));
  t("o nome ouve o sexo (mesma semente, outro sexo ⇒ outro nome)", SEMENTES.slice(0, 30).filter((s) => nomeSorteado(s, "fantasia", "mulher") !== nomeSorteado(s, "fantasia", "homem")).length >= 25);
  t("sementeDaVisita é a base 36 do relógio", sementeDaVisita(46655) === "mesa|zzz" && sementeDaVisita(NaN) === "mesa|0");
  t("sementeSeguinte anda na corrente (#1, #2…)", sementeSeguinte("mesa|x") === "mesa|x#1" && sementeSeguinte("mesa|x#1") === "mesa|x#2");
}

sec("2. o que «trocar» preserva");
{
  const m = sortearMesa("mesa|trocar");
  const outraRaca = racasDaCriacao("fantasia").find((r) => r.nome !== m.heroi.raca).nome;
  const r = trocarNoHeroi(m, "raca", outraRaca);
  t("trocar a raça não mexe no nome, nos pontos nem no mundo", r.heroi.nome === m.heroi.nome && J(r.heroi.pontos) === J(m.heroi.pontos) && J(r.mundo) === J(m.mundo));
  const outroSexo = m.heroi.sexo === "mulher" ? "homem" : "mulher";
  const s = trocarNoHeroi(m, "sexo", outroSexo);
  t("trocar o sexo sorteia outro nome daquele sexo (se o jogador não escreveu)", s.heroi.nome === nomeSorteado(m.semente, "fantasia", outroSexo, 0));
  const escrito = trocarNoHeroi(m, "nome", "Ume das Fendas");
  t("o nome escrito fica ao trocar o sexo", trocarNoHeroi(escrito, "sexo", outroSexo).heroi.nome === "Ume das Fendas");
  const outraClasse = CLASSES.find((c) => c.nome !== m.heroi.classe);
  const c = trocarNoHeroi(m, "classe", outraClasse.nome);
  t("trocar a classe põe a primeira subclasse dela (a da tela antiga)", c.heroi.subclasse === outraClasse.subclasses[0].nome);
  t("o conceito do sistema acompanha a troca; o escrito fica", c.heroi.conceito === conceitoDoSistema(c.heroi) && trocarNoHeroi(trocarNoHeroi(m, "conceito", "ladra arrependida"), "classe", outraClasse.nome).heroi.conceito === "ladra arrependida");
  t("sortear outro nome muda só o nome", (() => { const o = outroNome(m); return o.heroi.nome !== m.heroi.nome || o.heroi.vezDoNome === 1; })() && J(outroNome(m).heroi.pontos) === J(m.heroi.pontos));
  const futuro = trocarNoMundo(m, "generoId", "scifi");
  t("trocar o mundo para um gênero futurista leva a raça para uma origem dele", racasDoGenero("Ficção científica").some((x) => x.nome === futuro.heroi.raca));
  t("trocar o arco não mexe no herói", J(trocarNoMundo(m, "estrutura", "misterio").heroi) === J(m.heroi));
  t("vizinho roda em círculo", vizinho(["a", "b", "c"], "c", 1) === "a" && vizinho(["a", "b", "c"], "a", -1) === "c" && vizinho([], "x", 1) === "x");
}

sec("3. os pontos");
{
  t("ATRIBUTOS_POR_CLASSE cobre as doze, e o primeiro é o atributoChave", CLASSES.every((c) => (ATRIBUTOS_POR_CLASSE[c.nome] || [])[0] === c.atributoChave));
  t("a regra da classe põe exatamente PONTOS_TOTAIS, nenhum acima do teto", CLASSES.every((c) => { const p = distribuirPorClasse(c.nome); return pontosUsados(p) === PONTOS_TOTAIS && Object.values(p).every((v) => v >= 0 && v <= ATRIBUTO_MAX_CRIACAO); }));
  t("a partilha é 3 · 2 · 1 pela ordem da classe", J(SORTEIO_DA_MESA.partilha) === J([3, 2, 1]) && distribuirPorClasse("Ladino").destreza === 3 && ordemDaClasse("Ladino").length === ATRIBUTOS.length);
  const v = pontosVazios();
  t("pontosVazios: seis zeros; restantes = PONTOS_TOTAIS", Object.keys(v).length === 6 && pontosRestantes(v) === PONTOS_TOTAIS);
  t("− no piso devolve os MESMOS pontos, com a razão", ajustarPonto(v, "forca", -1) === v && razaoDoPonto(v, "forca", -1) === "Já está no piso.");
  const teto = { ...v, forca: ATRIBUTO_MAX_CRIACAO };
  t("+ no teto não anda, com a razão", ajustarPonto(teto, "forca", 1) === teto && /teto/.test(razaoDoPonto(teto, "forca", 1)));
  const cheio = distribuirPorClasse("Mago");
  t("sem pontos na mão o + não anda", ajustarPonto(cheio, "forca", 1) === cheio && razaoDoPonto(cheio, "forca", 1) === "Sem pontos na mão.");
  t("o Mestre põe os que faltam, pela ordem da classe", pontosRestantes(porOsQueFaltam(v, "Guerreiro")) === 0 && porOsQueFaltam(v, "Guerreiro").forca === 3);
  t("o valor final soma o bônus da raça (como a ficha)", (() => { const r = racaPorNome("Anão"); const f = atributosComRaca(cheio, "Anão"); return ATRIBUTOS.every((a) => f[a.id] === (cheio[a.id] || 0) + ((r.bonus || {})[a.id] || 0)); })());
  t("POR_PONTO diz em palavras o que cada um dos seis muda", ATRIBUTOS.every((a) => typeof POR_PONTO[a.id] === "string" && POR_PONTO[a.id].length > 10));
  const m = sortearMesa("mesa|pronto");
  t("«Começar» impedido diz por quê (faltam pontos)", razaoDeNaoComecar({ ...m, heroi: { ...m.heroi, pontos: v } }) === "Faltam 6 pontos por pôr." && razaoDeNaoComecar(m) === null);
}

sec("4. a ficha é a da criação antiga (montarFicha = o objeto do onClick)");
/* A CÓPIA do objeto que vivia no onClick de «ENTRAR NA TAVERNA» (App.jsx,
   TelaPersonagem, v9.652). Se montarFicha mudar um campo, isto acende. */
function fichaAntiga({ nome, sobrenome, sexo, conceito, historia, raca, classe, subclasse, profissao, antecedenteId, atributos, n }) {
  const nomeInteiro = [nome.trim(), sobrenome.trim()].filter(Boolean).join(" ");
  const antObj = antecedentePorId(antecedenteId);
  const cObj = classePorNome(classe);
  const rObj = racaPorNome(raca);
  const attrFinais = Object.fromEntries(ATRIBUTOS.map((a) => [a.id, (atributos[a.id] || 0) + ((rObj?.bonus || {})[a.id] || 0)]));
  const vidaMax = (cObj?.vidaBase || 10) + attrFinais.vigor * 2;
  const manaMax = (cObj?.manaBase || 8) + attrFinais.intelecto * 2;
  const habsIniciais = habilidadesIniciais(classe).map((h) => ({ nome: h.nome, custo: h.custo, descricao: h.descricao }));
  return equiparKitInicial(comDom({
    genero: sexo, feicoesFixas: true,
    nome: nomeInteiro, primeiroNome: nome.trim(), sobrenome: sobrenome.trim(),
    conceito: conceito.trim(), historia: historia.trim(),
    raca, classe, subclasse, profissao,
    antecedente: antObj.nome, antecedenteGancho: antObj.gancho,
    semente: `${nomeInteiro}|${conceito.trim()}|${n}`,
    atributos: attrFinais, vida: vidaMax + (antObj.pv || 0), vidaMax: vidaMax + (antObj.pv || 0), mana: manaMax + (antObj.pm || 0), manaMax: manaMax + (antObj.pm || 0),
    baseAtributos: { ...attrFinais }, pontosAtr: 0, atributosVersao: 1,
    nivel: 1, xp: 0, moedas: MOEDAS_INICIAIS + (antObj.moedas || 0), nivelPendentes: 0,
    inventario: antObj.item ? [antObj.item] : [], habilidades: habsIniciais, grupo: [],
    efeitos: [], condicoes: [], equipamento: [], equipados: {},
    pericias: periciasIniciais({ classe, antecedente: antObj.nome }), periciasVersao: 1,
  }));
}
{
  let iguais = 0, possiveis = 0;
  const diferentes = [];
  for (const s of SEMENTES) {
    const mesa = sortearMesa(s);
    const e = escolhasDaMesa(mesa);
    const nova = montarFicha(e);
    const velha = fichaAntiga({ ...e, atributos: e.pontos, n: Math.floor(e.numeroDaSorte) });
    if (J(nova) === J(velha)) iguais++; else diferentes.push(s);
    /* o caminho antigo podia criar este herói? as mesmas listas e as mesmas travas
       (o botão antigo exigia nome, conceito, sexo e os pontos todos postos) */
    const generoLabel = mundoDaMesa(mesa).genero;
    const c = classePorNome(e.classe);
    if (e.nome.trim() && e.conceito.trim() && ["homem", "mulher"].includes(e.sexo) && pontosRestantes(e.pontos) === 0
      && Object.values(e.pontos).every((v) => v >= 0 && v <= ATRIBUTO_MAX_CRIACAO)
      && racasDoGenero(generoLabel).some((r) => r.nome === e.raca) && c && c.subclasses.some((x) => x.nome === e.subclasse)
      && PROFISSOES.some((p) => p.nome === e.profissao) && ANTECEDENTES.some((a) => a.id === e.antecedenteId)) possiveis++;
  }
  t("200 sorteios: a ficha da mesa é, campo a campo, a da criação antiga", iguais === SEMENTES.length, diferentes.slice(0, 3).join(","));
  t("200 sorteios: todo herói da mesa é um herói que o caminho antigo podia criar", possiveis === SEMENTES.length, `${possiveis}`);
  const escolhida = { nome: "Ume", sobrenome: "das Fendas", sexo: "mulher", conceito: " ladra ", historia: " ", raca: "Elfo", classe: "Bruxo", subclasse: classePorNome("Bruxo").subclasses[1].nome, profissao: PROFISSOES[3].nome, antecedenteId: "nobre_caido", pontos: { forca: 0, destreza: 1, vigor: 1, intelecto: 1, presenca: 3, percepcao: 0 } };
  t("e uma ficha escolhida à mão (trocar tudo) também", J(montarFicha({ ...escolhida, numeroDaSorte: 4242 })) === J(fichaAntiga({ ...escolhida, atributos: escolhida.pontos, n: 4242 })));
  const vazio = sortearMesa("mesa|vazio");
  t("conceito apagado na mesa vai o do sistema (o antigo exigia um)", escolhasDaMesa(trocarNoHeroi(vazio, "conceito", "")).conceito === conceitoDoSistema(vazio.heroi));
  t("antecedenteDaMesa cai no primeiro com id desconhecido", antecedenteDaMesa("nada").id === ANTECEDENTES[0].id);
}

sec("5. o mundo na forma que a tela antiga entregava");
{
  const m = sortearMesa("mesa|mundo");
  const mundo = mundoDaMesa(m);
  t("as mesmas sete chaves de TelaMundo.concluir", J(Object.keys(mundo).sort()) === J(["apresentacao", "descricao", "estrutura", "genero", "limites", "molde", "voz"]));
  t("o gênero vai pelo rótulo, como antes", GENEROS.some((g) => g.label === mundo.genero) && generoPorId(m.mundo.generoId).label === mundo.genero && generoPorId("nada") === GENEROS[0]);
  t("a apresentação é a clássica e os textos livres vazios", mundo.apresentacao === "estrita" && mundo.descricao === "" && mundo.limites === "");
  t("as escolhas da tela do mundo são as de hoje: 7 cenários, 4 formas, 4 arcos, 8 vozes", generosDaCriacao().length === 7 && moldesDisponiveis().length === 4 && espinhasDaCriacao().length === 4 && VOZES.length === 8 && espinhasDaCriacao().every((e) => ESTRUTURAS.includes(e)));
  t("o nome da campanha sai do herói", nomeDaCampanhaDaMesa(m) === `${NOME_DA_CAMPANHA.prefixo} ${m.heroi.nome.split(" ")[0]}`);
  t("o texto das tabelas no sexo do herói: calado(a), o(a), senhor(a)", textoNoSexo("querem o(a) calado(a)", "mulher") === "querem a calada" && textoNoSexo("querem o(a) calado(a)", "homem") === "querem o calado" && textoNoSexo("senhor(a)", "mulher") === "senhora");
  t("no feminino: Humana ladina, Órfã da Estrada; no masculino, como na tabela", noSexo("Humano", "mulher") === "Humana" && noSexo("Ladino", "mulher") === "Ladina" && noSexo("Órfão da Estrada", "mulher") === "Órfã da Estrada" && noSexo("Ladino", "homem") === "Ladino" && Object.keys(NO_FEMININO).length > 20);
}

sec("6. o save visto da porta");
{
  t("sem save: primeira visita", resumoDoSave(null).estado === "nenhum" && resumoDoSave("").estado === "nenhum");
  t("JSON quebrado: a campanha que não abre (nada se apaga)", resumoDoSave("{oi").estado === "naoAbre" && resumoDoSave("[1]").motivo === "quebrado");
  t("versão mais nova que a página: não abre, motivo «nova»", resumoDoSave(J({ versao: 9, personagem: { nome: "X" } }), 2).motivo === "nova");
  const r = resumoDoSave(J({ versao: 2, nomeCampanha: "A lenda de Ume", lugar: { nome: "Monte Profundo" }, salvoEm: 1, personagem: { nome: "Ume", raca: "Elfo", classe: "Bruxo", nivel: 3, genero: "mulher", moedas: 40, suprimentos: { racoes: 8, agua: 7, tochas: 4 } } }), 2);
  t("com campanha: nome, raça, classe, nível, lugar e as peças", r.estado === "campanha" && r.nome === "Ume" && r.nivel === 3 && r.sexo === "mulher" && r.lugar === "Monte Profundo" && r.recursos.racoes === 8 && r.recursos.moedas === 40);
  t("save sem herói é primeira visita", resumoDoSave(J({ versao: 2, personagem: null })).estado === "nenhum");
}

sec("7. as tabelas do F3 e os glifos");
{
  const copiados = Object.keys(GLIFOS_DA_CHEGADA).filter((n) => GLIFOS[n]);
  t("os glifos copiados de GLIFOS são o original, byte a byte", copiados.length >= 12 && copiados.every((n) => GLIFOS_DA_CHEGADA[n] === GLIFOS[n].d), copiados.filter((n) => GLIFOS_DA_CHEGADA[n] !== GLIFOS[n].d).join(","));
  const existe = (n) => !!(GLIFOS_DA_CHEGADA[n]);
  t("GLIFO_DA_VOZ cobre as oito vozes, cada uma com glifo que a chegada desenha", VOZES.every((v) => existe(GLIFO_DA_VOZ[v.id])));
  t("GLIFO_DO_MOLDE e GLIFO_DO_ARCO cobrem as formas e os arcos", moldesDisponiveis().every((m) => existe(GLIFO_DO_MOLDE[m.id])) && espinhasDaCriacao().every((e) => existe(GLIFO_DO_ARCO[e.id])));
  t("LUZ_DA_CHEGADA é a noite com o halo de 600 (330 no telefone)", LUZ_DA_CHEGADA.feltro === LUZ_DA_MESA.noite.feltro && LUZ_DA_CHEGADA.haloRaio === 600 && LUZ_DA_CHEGADA.haloRaioTelefone === 330);
  t("as cartas e as peças nas medidas do quadro", CARTA_DE_RETRATO.leque.largura === 140 && CARTA_DE_RETRATO.tira.largura === 88 && CARTA_DO_HEROI.largura === 340 && CARTA_DO_HEROI.altura === 476 && CARTA_DO_MUNDO.largura === 280 && PECA_DE_ATRIBUTO.botao === 44 && BOTAO_DA_MESA.principal.altura === 56);
  t("toda coisa que se toca tem ≥ 44", PECA_DE_ATRIBUTO.botao >= 44 && BOTAO_DA_MESA.vinculo.altura >= 44 && BOTAO_DA_MESA.opcao.altura >= 44 && BOTAO_DA_MESA.papel.altura >= 44);
  t("POR_A_MESA: as quatro pilhas e os quatro objetos em passo de 150, a nota aos 2 600, 12 s sem resposta", J(POR_A_MESA.pilhas) === J([900, 1050, 1200, 1350]) && J(POR_A_MESA.objetos) === J([1500, 1650, 1800, 1950]) && POR_A_MESA.nota.em === 2600 && POR_A_MESA.semResposta === 12000 && REVELAR_A_PROSA.caracteres === 24);
  t("a folha da chegada tem saída no prefers-reduced-motion", /prefers-reduced-motion: reduce/.test(CSS_DA_CHEGADA) && /tv-pousa/.test(CSS_DA_CHEGADA));
  t("letraDaMesa mudou-se para mesa-do-mestre.js e as peças ainda a exportam", letraDaMesa("notaDoMestre").fontStyle === "italic" && /export \{ letraDaMesa \}/.test(fs.readFileSync(path.join(SRC, "pecas-da-mesa.jsx"), "utf8")));
}

sec("8. a abertura instantânea (C2) e o Tailwind compilado");
{
  const html = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
  const ini = html.indexOf("<style>"), fim = html.indexOf("</div>\n", html.indexOf("<noscript>")) + 7;
  const bloco = html.slice(ini, fim).replace(/\n/g, "");
  t("a abertura vem antes do #root, e cabe em ~3 KB", ini > 0 && html.indexOf('id="tv"') < html.indexOf('id="root"') && Buffer.byteLength(bloco) < 3200, `${Buffer.byteLength(bloco)} bytes`);
  const A = ABERTURA_INSTANTANEA;
  t("marca, vela e halo nas posições de ABERTURA_INSTANTANEA", bloco.includes(`left:${A.mesa.marca.x};top:${A.mesa.marca.y};width:${A.mesa.marca.largura}px`) && bloco.includes(`left:${A.mesa.vela.x};top:${A.mesa.vela.y}`) && bloco.includes(`left:${A.mesa.halo.x};top:${A.mesa.halo.y}`) && bloco.includes(`margin:-${A.mesa.halo.raio}px`) && bloco.includes(`margin:-${A.telefone.halo.raio}px`));
  t("no telefone a frase cai em 528 (28 da marca + 500)", A.telefone.marca.topo + 500 === A.telefone.frase.topo && bloco.includes(`top:${A.telefone.marca.topo}px`));
  t("o feltro da abertura é o da noite", bloco.includes(LUZ_DA_MESA.noite.feltro) && A.feltro === LUZ_DA_MESA.noite.feltro);
  t("nenhuma CDN do Tailwind; o tailwind.css entra pelo main.jsx", !/cdn\.tailwindcss/.test(html) && /import "\.\/tailwind\.css"/.test(fs.readFileSync(path.join(SRC, "main.jsx"), "utf8")));
  t("o Tailwind lê o index.html e todo src/", /src\/\*\*\/\*\.\{js,jsx\}/.test(fs.readFileSync(path.join(RAIZ, "tailwind.config.js"), "utf8")));
}

sec("9. as telas renderizadas");
const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Chegada } from "./painel-chegada.jsx";
import { Criacao, MesaSendoPosta } from "./painel-criacao.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, Chegada, Criacao, MesaSendoPosta };
`;
const saida = path.join(AQUI, `.tmp-criacao-${process.pid}.mjs`);
try {
  buildSync({
    stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-criacao.jsx" },
    bundle: true, format: "esm", platform: "node", outfile: saida, jsx: "automatic", logLevel: "silent", external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime"],
    loader: { ".js": "jsx", ".webp": "empty", ".png": "empty", ".jpg": "empty", ".svg": "empty", ".css": "empty" }, define: { "process.env.NODE_ENV": '"production"' },
  });
  const R = await import(pathToFileURL(saida).href);
  const h = R.React.createElement;
  const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
  const primeira = R.html(h(R.Chegada, { resumo: { estado: "nenhum" } }));
  t("primeira visita: uma ação, «Sentar à mesa»; sem «Continuar»", /Sentar à mesa/.test(primeira) && !/Continuar/.test(primeira));
  const volta = R.html(h(R.Chegada, { resumo: { estado: "campanha", nome: "Ume das Fendas", raca: "Elfo", classe: "Bruxo", nivel: 3, sexo: "mulher", campanha: "A lenda de Ume", recursos: {} } }));
  t("quem volta: «Continuar», a carta, o «Anteriormente» e o arquivo", /Continuar/.test(volta) && /Ume das Fendas/.test(volta) && /Anteriormente/i.test(volta) && /campanha em arquivo/.test(volta));
  const naoAbre = R.html(h(R.Chegada, { resumo: { estado: "naoAbre", motivo: "nova" } }));
  t("a campanha que não abre: «Atualizar a página», e nenhum estado oferece apagar", /Atualizar a página/.test(naoAbre) && /versão mais nova/.test(naoAbre) && !/[Aa]pagar/.test(naoAbre.replace(/Nada foi apagado/g, "")));
  const ficha = R.html(h(R.Criacao, { semente: "mesa|tela", aoComecar: () => {}, aoNovaSemente: () => {} }));
  const m = sortearMesa("mesa|tela");
  t("o sorteio: o nome, «trocar», «Começar», «Sortear tudo de novo»", ficha.includes(m.heroi.nome) && /trocar/.test(ficha) && /Começar/.test(ficha) && /Sortear tudo de novo/.test(ficha));
  t("nenhum emoji do sistema na chegada nem na criação", !EMOJI.test(ficha + primeira + volta));
  t("o − e o + não existem no sorteio (moram em «do que é feita»)", !/mais Força/.test(ficha));
  const posta = R.html(h(R.MesaSendoPosta, { heroi: { nome: "Ume", raca: "Elfo", classe: "Bruxo", sexo: "mulher" }, nota: "Você chega com 8 rações." }));
  t("a passagem: a nota verdadeira e a pena, nunca uma barra", /Você chega com 8 rações/.test(posta) && /tv-pena/.test(posta) && !/progress/.test(posta));
  const erro = R.html(h(R.MesaSendoPosta, { heroi: { nome: "Ume", genero: "mulher" }, erro: true, aoTentar: () => {}, aoVoltar: () => {} }));
  t("o erro de rede: «O Mestre não respondeu», «Tentar de novo», «Voltar à ficha»", /O Mestre não respondeu/i.test(erro) && /Tentar de novo/.test(erro) && /Voltar à ficha/.test(erro) && /guardada/.test(erro));
} finally { try { fs.unlinkSync(saida); } catch { /* nada */ } }

sec("10. a fiação");
{
  const app = fs.readFileSync(path.join(SRC, "App.jsx"), "utf8");
  const main = fs.readFileSync(path.join(SRC, "main.jsx"), "utf8");
  t("a criação antiga passa pela mesma conta (montarFicha), sem o objeto à mão", /concluir\(montarFicha\(\{ nome, sobrenome, sexo, conceito, historia, raca, classe, subclasse, profissao, antecedenteId, pontos: atributos/.test(app) && !/onClick=\{\(\) => concluir\(equiparKitInicial\(comDom\(/.test(app));
  t("a chegada e a criação vivem no App também (depois do jogo, «Início» volta à chegada)", /<Chegada /.test(app) && /<Criacao /.test(app) && /setFase\("chegada"\); \};/.test(app));
  t("começar pela mesa e a passagem, tudo em calou", /calou\("V5 · começar pela mesa"/.test(app) && /calou\("V5 · a entrada pela porta"/.test(app) && /<MesaSendoPosta /.test(app));
  t("a porta carrega o jogo por import() e com limite de erro", /React\.lazy\(carregarOJogo\)/.test(main) && /import\("\.\/App\.jsx"\)/.test(main) && /class LimiteDaRaiz/.test(main) && /<Suspense /.test(main));
  t("a porta não importa o App nem as peças pesadas de forma estática", !/from "\.\/App\.jsx"/.test(main) && !/from "\.\/(ui|pecas-da-mesa)\.jsx"/.test(fs.readFileSync(path.join(SRC, "painel-chegada.jsx"), "utf8") + fs.readFileSync(path.join(SRC, "painel-criacao.jsx"), "utf8")));
  t("os modos atrás da porta continuam atrás dela (o arquivo é a tela antiga)", /modoNaPorta\("rapida"\)/.test(app) && /modoNaPorta\("duelo"\)/.test(app) && /modoNaPorta\("sala"\)/.test(app));
}

console.log(`\n${ok} ok · ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
