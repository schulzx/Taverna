import {
  gerarDadivaUnica, ataquesExtras, danoExtraDeDadiva, defesaDeDadiva, descontoDePM,
  bonusSocialDeDadiva, temVantagemMental, dobraMovimento, ignoraTerrenoDificil,
  criticoMinimo, imuneA, imunidadesDe, refazerDisponivel, gastarRefazer, repousarDadivas,
  segundoFolegoDisponivel, gastarSegundoFolego, todasAsLinhas, resumoDadivasPrompt, envelopeDaUnica,
} from "../src/dadivas.js";
import { resolverAtaque, defesaDe } from "../src/combate.js";
import { presencaDoHeroiEmCombate } from "../src/presenca-divina.js";

let ok = 0, mau = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mau++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const vazio = { nome: "Vera", dadivas: [], dadivasUnicas: [] };

sec("1. ficha sem dádiva nenhuma se comporta como antes");
t("sem ataque extra", ataquesExtras(vazio) === 0);
t("sem dano extra", danoExtraDeDadiva(vazio) === 0);
t("sem defesa extra", defesaDeDadiva(vazio) === 0);
t("sem desconto de PM", descontoDePM(vazio) === 0);
t("crítico continua 20", criticoMinimo(vazio) === 20);
t("sem dádiva, não dobra", dobraMovimento(vazio) === false);
t("não ignora terreno difícil", ignoraTerrenoDificil(vazio) === false);
t("nenhuma imunidade", imunidadesDe(vazio).length === 0);
t("nenhuma linha na ficha", todasAsLinhas(vazio).length === 0);
t("rodapé vazio", resumoDadivasPrompt(vazio) === "");
t("undefined não derruba", ataquesExtras(undefined) === 0 && criticoMinimo(null) === 20);

sec("2. as dez da tabela viram número");
const p = { ...vazio, dadivas: ["combate", "sorte", "magia", "passos", "presenca", "vontade", "vigor"] };
t("Combate dá +1 ataque", ataquesExtras(p) === 1);
t("Sorte Impossível abaixa o crítico para 19", criticoMinimo(p) === 19);
t("Magia desconta 1 PM", descontoDePM(p) === 1);
t("Passos Longos dobra o deslocamento", dobraMovimento(p) === true);
t("Passos Longos ignora terreno difícil", ignoraTerrenoDificil(p) === true);
t("Presença dá +2 social", bonusSocialDeDadiva(p) === 2);
t("Vontade de Ferro dá vantagem mental", temVantagemMental(p) === true);
t("Vigor Irreal é imune a veneno", imuneA(p, "veneno"));
t("Vigor Irreal é imune a exaustão (com acento no id)", imuneA(p, "exaustao") && imuneA(p, "exaustão"));
t("não é imune ao que não está na lista", !imuneA(p, "sangramento"));

sec("3. o crítico em 19 chega ao dado de verdade");
{
  /* d20 fixado em 19 pela substituição de Math.random */
  const real = Math.random;
  Math.random = () => 0.93;          // → 1 + floor(0.93*20) = 19
  const alvo = { nome: "Ogro", vida: 100, vidaMax: 100, ameaca: "comum" };
  const semDadiva = resolverAtaque({ atacante: "Vera", alvo, ehAtacanteInimigo: false, bonusAtaque: 5, danoBase: 10 });
  const comDadiva = resolverAtaque({ atacante: "Vera", alvo, ehAtacanteInimigo: false, bonusAtaque: 5, danoBase: 10, criticoEm: 19 });
  Math.random = real;
  t("19 sem dádiva NÃO é crítico", semDadiva.critico === false);
  t("19 com dádiva É crítico", comDadiva.critico === true);
  t("crítico dobra o dano", comDadiva.dano === semDadiva.dano * 2);
}

sec("4. a defesa da dádiva entra na CA");
{
  const base = { nome: "Vera", atributos: { destreza: 3 }, equipados: {} };
  t("sem bônus, CA = 13", defesaDe(base, false) === 13);
  t("com +3 de dádiva, CA = 16", defesaDe({ ...base, bonusDefesa: 3 }, false) === 16);
}

sec("5. os recursos que se gastam");
{
  const d = { ...vazio, dadivas: ["destino", "recuperacao"] };
  t("um refazer disponível", refazerDisponivel(d) === 1);
  const gasto = gastarRefazer(d);
  t("depois de gastar, zero", refazerDisponivel(gasto) === 0);
  t("o descanso longo devolve", refazerDisponivel(repousarDadivas(gasto)) === 1);
  t("segundo fôlego disponível no dia 3", segundoFolegoDisponivel(d, 3));
  const usou = gastarSegundoFolego(d, 3);
  t("no mesmo dia, não de novo", !segundoFolegoDisponivel(usou, 3));
  t("no dia seguinte, volta sozinho", segundoFolegoDisponivel(usou, 4));
  t("quem não tem a dádiva nunca tem fôlego", !segundoFolegoDisponivel(vazio, 1));
}

sec("6. a dádiva ÚNICA nasce pronta — nome, número e ficha");
{
  const heroi = { nome: "Merlim", semente: "merlim|mago|0", dadivasUnicas: [] };
  const u1 = gerarDadivaUnica(heroi, { dominio: "Abismo", titulo: "Divindade Maior", quantas: 0 });
  t("tem nome próprio", typeof u1.nome === "string" && u1.nome.length > 3);
  t("o domínio entra no nome", /Abismo/.test(u1.nome));
  t("tem efeito mecânico", u1.efeito && Object.keys(u1.efeito).length > 0);
  t("tem descrição do que faz", typeof u1.desc === "string" && u1.desc.length > 10);
  const u2 = gerarDadivaUnica(heroi, { dominio: "Abismo", titulo: "Divindade Maior", quantas: 0 });
  t("determinística: a mesma lenda dá a mesma dádiva", u1.nome === u2.nome && u1.id === u2.id);
  const u3 = gerarDadivaUnica(heroi, { dominio: "Abismo", quantas: 1 });
  t("a segunda dádiva é outra", u3.id !== u1.id);
  const outro = gerarDadivaUnica({ nome: "Vera", semente: "vera|x|0" }, { quantas: 0 });
  t("outro herói, outra dádiva", outro.nome !== u1.nome);
  t("sem domínio ainda ganha qualificador", /\sd[aeo]s?\s|\sd[ao]\s/.test(outro.nome));

  const env = envelopeDaUnica(u1, heroi);
  t("o envelope traz o nome exato", env.includes(u1.nome));
  t("o envelope proíbe registrar como habilidade", /adicionar_habilidades/.test(env));
  t("o envelope diz que já está aplicada", /J[ÁA] est/.test(env));
}

sec("7. a única entra nas contas junto com as da tabela");
{
  const u = { id: "unica:gume:0", nome: "Gume do Abismo", efeito: { danoExtra: 6 }, desc: "x" };
  const h = { ...vazio, dadivas: ["combate"], dadivasUnicas: [u] };
  t("dano extra vem da única", danoExtraDeDadiva(h) === 6);
  t("ataque extra vem da tabela", ataquesExtras(h) === 1);
  const linhas = todasAsLinhas(h);
  t("as duas aparecem na ficha", linhas.length === 2);
  t("a única vem marcada", linhas.some((l) => l.unica));
  t("o rodapé cita as duas", /Gume do Abismo/.test(resumoDadivasPrompt(h)) && /Dádiva do Combate/.test(resumoDadivasPrompt(h)));
}

sec("8. a ficha explica como usar o que tem carga");
{
  const d = { ...vazio, dadivas: ["destino", "recuperacao", "resiliencia"] };
  const l = todasAsLinhas(d);
  const destino = l.find((x) => x.id === "destino");
  const folego = l.find((x) => x.id === "recuperacao");
  const passiva = l.find((x) => x.id === "resiliencia");
  t("Destino diz onde o botão aparece", /bot[ãa]o/.test(destino.extra));
  t("Destino está marcada como ativa", destino.ativa === true);
  t("Recuperação diz que é automática", /autom[áa]tica/.test(folego.extra));
  t("passiva não promete botão nenhum", !passiva.extra);
  const gasta = gastarRefazer(d);
  t("depois de usada, a ficha diz que voltou no descanso", /descanso/.test(todasAsLinhas(gasta).find((x) => x.id === "destino").extra));
}

sec("9. a presença do herói divino na luta");
{
  const inim = [
    { nome: "Minotauro 1", vida: 80, vidaMax: 80, nivel: 20, gd: 0 },
    { nome: "Minotauro 2", vida: 80, vidaMax: 80, nivel: 20, gd: 0 },
    { nome: "Esqueleto", vida: 10, vidaMax: 10, nivel: 2, gd: 0 },
    { nome: "Ashar, o Menor", vida: 200, vidaMax: 200, nivel: 20, gd: 3 },
    { nome: "Caído", vida: 0, vidaMax: 40, nivel: 5, gd: 0, derrotado: true },
  ];
  const r = presencaDoHeroiEmCombate({ gdJogador: 4, inimigos: inim, nomeHeroi: "Merlim", rolar: () => 1 });
  t("dispara com GD 4 contra mortais", !!r);
  t("os minotauros se curvam", r.afetados.some((a) => a.nome === "Minotauro 1") && r.afetados.some((a) => a.nome === "Minotauro 2"));
  t("o morto-vivo não sente medo", !r.afetados.some((a) => a.nome === "Esqueleto"));
  t("o deus GD 3 não se curva (um degrau só)", !r.afetados.some((a) => a.nome.startsWith("Ashar")));
  t("quem já caiu não entra", !r.afetados.some((a) => a.nome === "Caído"));
  t("a condição é amedrontado", r.afetados[0].cond.id === "amedrontado");
  t("dura 3 turnos", r.afetados[0].cond.turnos === 3);
  t("a nota diz que o sistema APLICOU", /APLICOU/.test(r.nota));

  t("herói mortal não faz ninguém tremer", presencaDoHeroiEmCombate({ gdJogador: 0, inimigos: inim }) === null);
  t("GD 1 ainda não pesa", presencaDoHeroiEmCombate({ gdJogador: 1, inimigos: inim }) === null);
  t("quem resiste (rolagem alta) não é afetado", presencaDoHeroiEmCombate({ gdJogador: 4, inimigos: inim, rolar: () => 20 }) === null);
  t("lista vazia devolve nulo", presencaDoHeroiEmCombate({ gdJogador: 4, inimigos: [] }) === null);
}

console.log(`\n${ok} ok, ${mau} falhas`);
process.exit(mau ? 1 : 0);
