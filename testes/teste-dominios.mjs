/* O GOVERNO (v9.139)

   O sistema de domínios existia desde a v6.5 e era honesto no que fazia —
   renda por tipo de cidade, população e felicidade vivas, eventos por
   tabela, zero tokens. Mas era um PAINEL, não um governo: abrindo a aba, o
   jogador via números subirem e descerem e não tinha UM ÚNICO BOTÃO.

   Esta suíte defende as quatro decisões que faltavam — imposto, obras,
   custeio e governador — e a consequência sem a qual nenhuma delas pesa:
   uma cidade revoltada SAI. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const semCom = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semCom(readFileSync("../src/App.jsx", "utf8"));
const D = await import(S + "dominios.js");
const G = await import(S + "gestao.js");
const R = await import(S + "reino.js");
const C = await import(S + "comercio.js");
const M = await import(S + "mercado.js");
const I = await import(S + "indole.js");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

const CIDADE = { nome: "Pedra Torta", bioma: "montanha", tipo: "cidade", relacao: "jogador" };
const MAPA = { cidades: [CIDADE] };
const vazio = () => D.garantirGoverno(null);

sec("1. TODA DECISÃO DÓI DE ALGUM LADO");
{
  /* o do meio não é "o certo": é o que não mexe em nada, e por isso a
     escolha é uma escolha */
  t("são três impostos", D.IMPOSTOS.length === 3);
  t("o justo não mexe em nada", D.impostoPorId("justo").renda === 1 && D.impostoPorId("justo").felicidade === 0);
  t("cobrar mais rende mais", D.impostoPorId("pesado").renda > 1);
  t("e custa paciência", D.impostoPorId("pesado").felicidade < 0);
  t("cobrar menos rende menos", D.impostoPorId("brando").renda < 1);
  t("e compra paciência", D.impostoPorId("brando").felicidade > 0);
  /* nenhum é gratuito nos dois lados: isso seria a opção óbvia */
  t("nenhum imposto é bom em tudo", D.IMPOSTOS.every((x) => !(x.renda > 1 && x.felicidade > 0)));
  t("um id desconhecido cai no justo", D.impostoPorId("nada").id === "justo");
}

sec("2. OBRA MUDA ALGUMA COISA QUE O SISTEMA JÁ LÊ");
{
  /* obra que só dá bônus de renda é um botão que imprime ouro */
  t("toda obra custa", D.OBRAS.every((o) => o.custo > 0));
  t("toda obra leva dias", D.OBRAS.every((o) => o.dias > 0));
  t("toda obra tem conta a pagar", D.OBRAS.every((o) => o.custeio > 0));
  t("e nenhuma é só renda", D.OBRAS.every((o) => o.equilibrio || (o.impede || []).length || o.defesa || o.produz));
  /* o celeiro não dá pontos: o celeiro faz a praga parar de acontecer */
  const impedidos = new Set(D.OBRAS.flatMap((o) => o.impede || []));
  const eventos = new Set(R.EVENTOS_REINO.map((e) => e.id));
  t("tudo o que uma obra barra é um evento que existe", [...impedidos].every((x) => eventos.has(x)));
  t("e há eventos ruins que nenhuma obra barra", R.EVENTOS_REINO.some((e) => (e.fel || 0) < 0 && !impedidos.has(e.id)));
  /* o custeio é real: três obras numa cidade comem a renda dela */
  const g = { ...vazio(), obras: ["quartel", "muralha"] };
  t("guarnição e muralha custam caro", D.custeioDe(g) >= 9);
  t("e a conta pode ficar negativa", D.contaDoDominio({ semente: "s", cidade: { tipo: "vila" }, gov: g, rendaBase: 5 }).liquido < 0);
}

sec("3. A OBRA LEVA DIAS");
{
  let g = vazio();
  const chk = D.podeErguer(g, "poco", { cofre: 1000 });
  t("com cofre, pode", chk.pode);
  t("sem cofre, não", D.podeErguer(g, "poco", { cofre: 10 }).pode === false);
  t("e o motivo diz quanto falta", /faltam ◉ 140/.test(D.podeErguer(g, "poco", { cofre: 10 }).motivo));
  g = D.comecarObra(g, "poco", 10);
  t("não termina no clique", D.obraPronta(g, 10) === null);
  t("nem no dia seguinte", D.obraPronta(g, 11) === null);
  t("termina no prazo", !!D.obraPronta(g, 14));
  t("os pedreiros não fazem duas ao mesmo tempo", D.podeErguer(g, "celeiro", { cofre: 9999 }).pode === false);
  g = D.terminarObra(g);
  t("terminada, entra na lista", g.obras.includes("poco") && !g.obrando);
  t("e não se ergue duas vezes", D.podeErguer(g, "poco", { cofre: 9999 }).pode === false);
}

sec("4. O GOVERNADOR É A ÍNDOLE, E NÃO UM MULTIPLICADOR");
{
  /* desde a v9.136 toda pessoa nasce com traços, e um deles é traidor —
     mas isso só chegava à FALA. O domínio é onde ter posto um traidor no
     comando custa. */
  t("sem governador, sem efeito", D.efeitoDoGovernador("s", "").renda === 0);
  const tracos = new Set(I.TRACOS.map((x) => x.id));
  t("todo traço que manda existe na índole", Object.keys(D.MANDO).every((k) => tracos.has(k)));
  /* A SONDA NO JOGO PEGOU ESTA. A primeira tabela cobria dez dos dezessete
     traços: em 600 nomeações, 164 governadores não faziam NADA, e o painel
     ficava mudo — o que lê como recurso quebrado, e não como "governa sem
     deixar marca". Se a índole vale, vale inteira; e esta prova quebra no
     dia em que nascer um décimo oitavo traço sem cadeira. */
  t("e todo traço da índole sabe governar", [...tracos].every((k) => !!D.MANDO[k]));
  let mudos = 0;
  for (let i = 0; i < 600; i++) if (!D.efeitoDoGovernador("m", `P${i}`).linhas.length) mudos++;
  t("nenhuma nomeação é muda", mudos === 0);
  t("o fiel não desvia", D.MANDO.fiel.renda === 0 && D.MANDO.fiel.felicidade > 0);
  t("o traidor desvia", D.MANDO.traidor.renda < 0);
  t("o ganancioso rende e machuca", D.MANDO.ganancioso.renda > 0 && D.MANDO.ganancioso.felicidade < 0);
  /* pequeno de propósito: é um dedo na balança, não um império */
  t("nenhum efeito passa de 12%", Object.values(D.MANDO).every((m) => Math.abs(m.renda) <= 0.12));
  /* e é derivado do NOME, então a mesma pessoa manda igual em toda parte */
  t("a mesma pessoa tem o mesmo mando", D.efeitoDoGovernador("s", "Fina").renda === D.efeitoDoGovernador("s", "Fina").renda);
  /* achar alguém cujo traço mande, e provar que ele mexe na conta */
  const achado = (() => {
    for (let i = 0; i < 900; i++) {
      const nome = `Gente ${i}`;
      const e = D.efeitoDoGovernador("mundo", nome);
      if (e.renda < 0) return { nome, e };
    }
    return null;
  })();
  t("existe alguém que governa mal", !!achado);
  const semEle = D.contaDoDominio({ semente: "mundo", cidade: CIDADE, gov: vazio(), rendaBase: 100 });
  const comEle = D.contaDoDominio({ semente: "mundo", cidade: CIDADE, gov: { ...vazio(), governador: achado.nome }, rendaBase: 100 });
  t("e pô-lo no comando custa moeda", comEle.bruta < semEle.bruta);
  t("e a conta diz que foi ele", comEle.linhas.some((l) => l.o === "governador"));
}

sec("5. A FELICIDADE RESPONDE AO QUE VOCÊ FEZ");
{
  /* até aqui o alvo era 55 fixo (mais o templo), e nenhuma decisão do
     jogador o alcançava */
  t("sem governo, o alvo é o de sempre", D.equilibrioDe({ semente: "s", gov: vazio() }) === D.EQUILIBRIO_BASE);
  t("imposto pesado derruba o alvo", D.equilibrioDe({ semente: "s", gov: { ...vazio(), imposto: "pesado" } }) < D.EQUILIBRIO_BASE);
  t("imposto brando levanta", D.equilibrioDe({ semente: "s", gov: { ...vazio(), imposto: "brando" } }) > D.EQUILIBRIO_BASE);
  t("obras levantam", D.equilibrioDe({ semente: "s", gov: { ...vazio(), obras: ["poco", "celeiro"] } }) > D.EQUILIBRIO_BASE);
  /* e as obras compensam o imposto: é isso que faz o pesado ser jogável */
  t("obras compensam o imposto pesado", D.equilibrioDe({ semente: "s", gov: { ...vazio(), imposto: "pesado", obras: ["poco", "celeiro", "muralha"] } }) >= D.EQUILIBRIO_BASE);
  t("o alvo nunca sai de 0..100", [0, 1].every(() => { const v = D.equilibrioDe({ semente: "s", gov: { ...vazio(), imposto: "pesado", obras: D.OBRAS.map((o) => o.id) } }); return v >= 0 && v <= 100; }));
}

sec("6. UM REINO QUE NÃO SE PERDE É UM PLACAR");
{
  let g = vazio();
  t("povo contente não acumula fúria", D.pulsoDaFuria(g, 80, 10).furiaDesde === 0);
  g = D.pulsoDaFuria(g, 10, 10);
  t("povo furioso começa a contar", g.furiaDesde === 10);
  t("e o contador não reinicia todo dia", D.pulsoDaFuria(g, 10, 11).furiaDesde === 10);
  t("no primeiro dia ainda não caiu", D.revoltaAgora(g, 10).caiu !== true);
  t("mas o prazo é visível", D.revoltaAgora(g, 12).faltam > 0);
  t("no prazo, cai", D.revoltaAgora(g, 10 + D.DIAS_ATE_A_REVOLTA).caiu === true);
  /* a muralha e o quartel seguram — é para isso que comem do cofre */
  const armada = D.pulsoDaFuria({ ...vazio(), obras: ["muralha", "quartel"] }, 10, 10);
  t("gente armada atrasa a revolta", D.revoltaAgora(armada, 10 + D.DIAS_ATE_A_REVOLTA).caiu !== true);
  /* e ela perdoa: baixar o imposto a tempo zera o contador */
  t("acalmar o povo zera a fúria", D.pulsoDaFuria(g, 90, 15).furiaDesde === 0);
  t("sem fúria, não há revolta", D.revoltaAgora(vazio(), 99) === null);
}

sec("7. UMA DECISÃO DE GOVERNO CHEGA À ETIQUETA DE UM PREÇO");
{
  const semOficina = { ...vazio() };
  const comOficina = { ...vazio(), obras: ["casa-de-oficio"] };
  /* a serra produz metal: a oficina barateia metal ALI */
  t("sem a obra, nada muda", D.fatorDaOficina(semOficina, "metal", CIDADE) === 1);
  t("com a obra, o que a cidade produz barateia", D.fatorDaOficina(comOficina, "metal", CIDADE) === D.DESCONTO_DA_OFICINA);
  /* e só o que ela produz: a oficina não barateia o que vem de fora */
  t("o que vem de longe não barateia", D.fatorDaOficina(comOficina, "erva", CIDADE) === 1);
  t("e a linha do painel diz o que ela faz", /metal/.test(D.oQueAOficinaFaz(CIDADE)));
  /* o caminho até o preço existe de verdade */
  const extra = { fator: D.DESCONTO_DA_OFICINA, porque: "a casa de ofício daqui fabrica isto" };
  const semE = C.fatorDoLugar({ tipo: "arma" }, CIDADE, { dia: 1 }).fator;
  const comE = C.fatorDoLugar({ tipo: "arma" }, CIDADE, { dia: 1, extra }).fator;
  t("o fator de fora entra na conta", comE < semE);
  t("e traz o motivo junto", C.fatorDoLugar({ tipo: "arma" }, CIDADE, { dia: 1, extra }).porques.some((x) => /casa de ofício/.test(x)));
  t("o mercado atravessa a oficina até o preço", /oficina && oficina\(generoDoItem\(it\)\)/.test(readFileSync("../src/mercado.js", "utf8")));
}

sec("8. A CONTA É FEITA UMA VEZ SÓ");
{
  const govs = { [CIDADE.nome]: { ...vazio(), imposto: "pesado", obras: ["quartel"] } };
  const r = G.rendaDominios(MAPA, null, { governos: govs, semente: "s" });
  t("a renda por cidade vem do governo", r.porCidade[0].renda > r.porCidade[0].base);
  t("o custeio vem junto", r.porCidade[0].custeio === 6);
  t("e o líquido é a subtração", r.liquido === r.total - r.custeio);
  /* o custeio sai DEPOIS dos multiplicadores: soldado recebe em moeda */
  const semGuilda = G.rendaDiariaTotal(MAPA, 1, false, null, { governos: govs, semente: "s" });
  t("a renda diária desconta o custeio", semGuilda === r.total - r.custeio);
  /* e sem governo nenhum, a conta é a de antes */
  const cru = G.rendaDominios(MAPA, null);
  t("sem governo, nada muda", cru.total === G.rendaDeCidade(CIDADE) && cru.custeio === 0);
}

sec("9. LIGADO AO JOGO");
{
  t("o governo tem estado próprio", /const governosRef = useRef\(\{\}\)/.test(APP));
  t("e é salvo", /governos: governosRef\.current/.test(APP));
  t("e volta do save", /garantirGovernos\(sv\.governos, mapaRef\.current\)/.test(APP));
  t("campanha nova começa sem governo", /governosRef\.current = \{\}; setGovernos\(\{\}\)/.test(APP));
  /* o alvo da felicidade passou a responder ao governo */
  t("o alvo lê o equilíbrio do governo", /equilibrioDe\(\{ semente: sementeMundo\(\), gov: g \}\)/.test(APP));
  t("e o templo continua somando por cima", /base \+ \(\(doTemplo\[nome\] \|\| 55\) - 55\)/.test(APP));
  /* a obra barra o evento */
  t("obra barra evento", /const barrado = evento && \(bonusDeObras\(\(governosRef\.current \|\| \{\}\)\[evento\.cidade\]\)\.impede\)\.has\(evento\.evento\.id\)/.test(APP));
  t("e o evento barrado não acontece", /if \(evento && !barrado\) \{/.test(APP));
  /* a obra termina com o dia, e a cidade se perde */
  t("a obra fica pronta no tique do dia", /const pronta = obraPronta\(g, diaRef\.current\)/.test(APP));
  t("a cidade sai do mapa quando cai", /c\.nome === nome \? \{ \.\.\.c, relacao: "neutra", sede: false \}/.test(APP));
  t("e o governo dela some junto", /delete govs\[nome\]/.test(APP));
  t("o jogador é avisado antes", /está a \$\{rev\.faltam\} dia/.test(APP));
  /* as três decisões, e o cofre paga a obra */
  t("o imposto se escolhe", /const definirImposto = \(nome, id\) =>/.test(APP));
  t("a obra se manda erguer", /const erguerObra = \(nome, obraId\) =>/.test(APP));
  t("e sai do cofre", /cofre: guildaRef\.current\.cofre - o\.custo/.test(APP));
  t("o governador se nomeia", /const nomearGovernador = \(nome, quem\) =>/.test(APP));
  t("a renda do jogo passa pelo governo", /rendaDiariaTotal\(mapaRef\.current, guildaRef\.current\.nivel, temGuilda, devocaoRef\.current, \{ governos: governosRef\.current/.test(APP));
  t("o Narrador recebe o domínio", /porNaPauta\(p, "onde", envelopeDoDominio\(/.test(APP));
  t("só quando o herói está lá", /cd\.relacao === "jogador"/.test(APP));
}

sec("10. O ENVELOPE É FATO, NÃO SUGESTÃO");
{
  const e = D.envelopeDoDominio(CIDADE, { ...vazio(), imposto: "pesado", obras: ["muralha"], governador: "Fina" }, { felicidade: 20 });
  t("diz de quem é", /é sua/.test(e));
  t("qual o imposto", /Imposto pesado/.test(e));
  t("como está o povo", /furioso \(20\/100\)/.test(e));
  t("quem governa", /Quem governa em seu nome: Fina/.test(e));
  t("o que está de pé", /De pé: Muralha/.test(e));
  t("e proíbe inventar", /não invente imposto, obra nem governador/.test(e));
  t("sem cidade, sem envelope", D.envelopeDoDominio(null, vazio()) === "");
  t("é curto o bastante para a Pauta", e.length < 600);
  /* sem governador, ele diz isso — e não cala */
  t("sem governador, diz que é você", /Ninguém governa em seu nome/.test(D.envelopeDoDominio(CIDADE, vazio(), {})));
}

console.log(`\ndominios v9.139: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
