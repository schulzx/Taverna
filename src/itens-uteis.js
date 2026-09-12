/* ============================================================
   ITENS ÚTEIS (v9.200) — a lei que mata o item inerte

   Segundo movimento do diretor de histórias, e um conserto que o jogador
   pediu com nome e sobrenome: o caderno de anotações cifradas do Erudito
   tem um gancho lindo na ficha — "leu algo que não deveria, e o lugar
   pode ser real" — e ZERO código atrás. A única coisa que o jogador
   podia fazer com ele era SOLTAR. É o bug dos três lobos em miniatura:
   uma promessa escrita sem motor.

   ---------------- A LEI ----------------

   Todo item pertence a exatamente uma classe:

     usavel      tem um verbo próprio (empunhar, tocar, abrir, mostrar…)
     insumo      alimenta um sistema que já existe (ofício, ritual, cura)
     mercadoria  o valor É a venda — e a descrição DIZ isso, em voz de
                 mundo: "alguns mercadores pagam caro por isto"
     semente     é portador de uma promessa do Livro (o caderno!)

   Item sem classe não nasce. A suíte é a catraca: nenhum item de
   antecedente fica sem classe, e nenhuma mercadoria esconde que só serve
   para vender. É a mesma mecânica do teste-ligacao — a regra quebra no
   dia em que for violada, não quando alguém topar com o item morto.

   ---------------- SEPARADO DO DESENHO ----------------

   Conta se prova, tela se olha. Este arquivo CLASSIFICA e diz o verbo;
   quem desenha o botão e quem executa o efeito é o App. O caso do
   caderno (a classe semente) fala com o Livro de Promessas — a promessa
   que o item carrega planta, rega e paga como qualquer outra.
   ============================================================ */

export const CLASSES = ["usavel", "insumo", "mercadoria", "semente"];
export const classeValida = (c) => CLASSES.includes(String(c || ""));

/* ============================================================
   OS 24 VERBOS

   O catálogo do que um item pode fazer, e a qual sistema cada verbo
   entrega o resultado. Como as 39 formas de semente, é referência: o
   verbo dá o corpo da ação; o item concreto diz qual verbo tem. A
   maioria já aponta para um sistema que existe — o verbo não inventa
   mecânica, ele liga o item à mecânica que já está de pé.
   ============================================================ */
export const VERBOS = [
  /* ---- SEMENTE: o item que guarda uma promessa ---- */
  { id: "decifrar", rotulo: "Investigar", classe: "semente", alimenta: "promessas", faz: "vira pista: planta ou rega uma semente no Livro, e paga quando amadurece" },

  /* ---- INSUMO: o item que outro sistema consome ---- */
  { id: "usar_oficio", rotulo: "Usar no ofício", classe: "insumo", alimenta: "craft", faz: "matéria-prima de uma receita da oficina" },
  { id: "destravar_receita", rotulo: "Estudar", classe: "insumo", alimenta: "craft", faz: "o pergaminho de ofício ensina o que a oficina não sabia" },
  { id: "reagente_ritual", rotulo: "Preparar ritual", classe: "insumo", alimenta: "grimorio", faz: "reagente que o grimório ou a invocação consome" },
  { id: "remediar", rotulo: "Remediar", classe: "insumo", alimenta: "descanso", faz: "limpa a condição que a cama não limpa" },

  /* ---- MERCADORIA: o valor é a venda, e a descrição o declara ---- */
  { id: "vender", classe: "mercadoria", rotulo: "Vender", alimenta: "mercado", faz: "mercadoria com comprador certo, nomeado na descrição" },
  { id: "penhorar", classe: "mercadoria", rotulo: "Penhorar", alimenta: "cobrador", faz: "dinheiro agora, prazo depois" },

  /* ---- USÁVEL: o item com verbo próprio ---- */
  { id: "ler", classe: "usavel", rotulo: "Ler", alimenta: "estante", faz: "conhecimento com efeito, pela biblioteca" },
  { id: "mostrar", classe: "usavel", rotulo: "Mostrar a alguém", alimenta: "indole", faz: "reação por índole: medo, cobiça, reconhecimento" },
  { id: "presentear", classe: "usavel", rotulo: "Presentear", alimenta: "vinculos", faz: "o vínculo sobe conforme a índole de quem recebe" },
  { id: "oferendar", classe: "usavel", rotulo: "Oferendar", alimenta: "devocao", faz: "o altar aceita, o deus responde" },
  { id: "abrir", classe: "usavel", rotulo: "Abrir", alimenta: "lugar", faz: "chave de porta, cofre ou passagem real do mapa" },
  { id: "revelar_mapa", classe: "usavel", rotulo: "Consultar", alimenta: "mapa", faz: "marca no pergaminho um lugar que passa a existir descoberto" },
  { id: "subornar", classe: "usavel", rotulo: "Oferecer", alimenta: "oraculo", faz: "o item certo mexe a chance mais que moeda" },
  { id: "provar", classe: "usavel", rotulo: "Apresentar como prova", alimenta: "diplomacia", faz: "o documento encerra a discussão" },
  { id: "exibir", classe: "usavel", rotulo: "Vestir", alimenta: "social", faz: "reação de patamar, entrada em lugares fechados" },
  { id: "trofeu", classe: "usavel", rotulo: "Expor como troféu", alimenta: "fama", faz: "exibido na taverna ou no domínio, rende e atrai" },
  { id: "tocar", classe: "usavel", rotulo: "Tocar", alimenta: "palco", faz: "instrumento: cena, moedas, atenção" },
  { id: "brindar", classe: "usavel", rotulo: "Brindar", alimenta: "social", faz: "língua solta na taverna, assunto novo" },
  { id: "iscar", classe: "usavel", rotulo: "Usar como isca", alimenta: "encontros", faz: "atrai de propósito a criatura certa" },
  { id: "queimar", classe: "usavel", rotulo: "Destruir", alimenta: "promessas", faz: "fecha uma promessa, apaga um rastro, quebra uma maldição — com registro" },
  { id: "contrabandear", classe: "usavel", rotulo: "Contrabandear", alimenta: "portao", faz: "risco e prêmio nas travessias de guarda" },
  { id: "sintonizar", classe: "usavel", rotulo: "Sintonizar", alimenta: "sintonia", faz: "a relíquia com eco e vontade" },
  { id: "documentar_posse", classe: "usavel", rotulo: "Registrar posse", alimenta: "dominios", faz: "o título de terra vale uma cidade inteira" },
];

export function verboPorId(id) { return VERBOS.find((v) => v.id === id) || null; }
export function verbosDaClasse(classe) { return VERBOS.filter((v) => v.classe === classe); }

/* ============================================================
   O REGISTRO DOS ITENS QUE JÁ EXISTEM

   A auditoria do documento, feita: cada item de antecedente ganha uma
   classe e um verbo. Seis são usáveis, três são sementes. Nenhum ficou
   como estava — só soltar.

   A CHAVE é o nome exato do item na ficha, porque é por nome que o item
   viaja no inventário (string ou {nome}). Um item de semente traz, além
   da classe, o material que o Livro planta e a colheita que ele paga —
   sem nunca escrever a conclusão na descrição que o jogador lê.
   ============================================================ */
export const ITENS_DE_ANTECEDENTE = {
  "Faca herdada (única lembrança da família)": {
    classe: "usavel", verbo: "mostrar",
    /* a faca É arma e equipa pelo sistema de sempre; o verbo da bolsa e o
       lado sentimental — mostrada a quem for da familia, acende algo. */
  },
  "Distintivo do antigo regimento": {
    classe: "usavel", verbo: "mostrar",
    nota: "Mostrado a um velho soldado, abre a guarda — ou a ferida.",
  },
  "Gazua de osso (presente de despedida)": {
    classe: "usavel", verbo: "abrir",
  },
  "Símbolo sagrado riscado": {
    classe: "usavel", verbo: "oferendar",
    nota: "Riscado, ainda é símbolo: um altar reconhece o gesto, mesmo torto.",
  },
  "Instrumento de viagem gasto": {
    classe: "usavel", verbo: "tocar",
  },
  "Martelo do pai (cabeça lascada)": {
    classe: "usavel", verbo: "usar_oficio",
  },
  /* ---- AS TRÊS SEMENTES ---- */
  "Caderno de anotações cifradas": {
    classe: "semente", verbo: "decifrar",
    forma: "margem_anotada", peso: "medio",
    material: "o caderno cifrado menciona um lugar — e o lugar pode ser real",
    colheita: "decifrado, o lugar que o caderno escondia entra no mapa",
  },
  "Amuleto oculto virado do avesso": {
    classe: "semente", verbo: "decifrar",
    forma: "brasao_limado", peso: "medio",
    material: "o amuleto tem, do avesso, um símbolo que alguém quis esconder",
    colheita: "o que o amuleto guardava sobre o culto, enfim legível",
  },
  "Bússola empenada (ainda aponta para algo)": {
    classe: "semente", verbo: "decifrar",
    forma: "chave_sem_porta", peso: "medio",
    material: "a bússola empenada não aponta o norte — aponta, teimosa, para outro lugar",
    colheita: "para onde a bússola sempre apontou",
  },
};

/* ---------------- A CLASSIFICAÇÃO ----------------
   Diz a classe e o verbo de um item, seja ele string ou objeto. Um item
   pode carregar a própria classe (`item.classe`/`item.verbo`) — é o
   caminho por onde loot e mercado declararão os seus. Sem isso, cai no
   registro dos antecedentes. Item que ninguém classificou devolve null:
   é a catraca dizendo "este item não devia existir assim". */
export function fichaDoItem(item) {
  if (!item) return null;
  if (typeof item === "object") {
    if (classeValida(item.classe)) {
      return { classe: item.classe, verbo: item.verbo || verboPadraoDaClasse(item.classe), ...item };
    }
    const porNome = ITENS_DE_ANTECEDENTE[item.nome];
    if (porNome) return { ...porNome };
    return null;
  }
  const reg = ITENS_DE_ANTECEDENTE[item];
  return reg ? { ...reg } : null;
}
export function classeDoItem(item) { const f = fichaDoItem(item); return f ? f.classe : null; }
export function verboDoItem(item) { const f = fichaDoItem(item); return f ? (f.verbo || verboPadraoDaClasse(f.classe)) : null; }

function verboPadraoDaClasse(classe) {
  return ({ usavel: "mostrar", insumo: "usar_oficio", mercadoria: "vender", semente: "decifrar" })[classe] || "mostrar";
}

/* ---------------- A SEMENTE QUE O ITEM PLANTA ----------------
   Traduz um item de classe semente no que o Livro precisa para semear.
   O App chama isto quando o jogador investiga o item pela primeira vez,
   e passa o resultado a `semear`. Devolve null se o item não é semente. */
export function sementeDoItem(item, { ato = 0, dia = 0 } = {}) {
  const f = fichaDoItem(item);
  if (!f || f.classe !== "semente") return null;
  return {
    forma: f.forma || "margem_anotada",
    dona: "item",
    ato,
    peso: f.peso || "medio",
    material: f.material || (typeof item === "string" ? item : (item && item.nome) || ""),
    dia,
  };
}
export function colheitaDoItem(item) { const f = fichaDoItem(item); return (f && f.colheita) || ""; }

/* ---------------- MERCADORIA DECLARADA ----------------
   Uma mercadoria mente se a descrição não avisa que ela só serve para
   vender. Esta função dá a frase que a descrição precisa conter — e a
   suíte confere que toda mercadoria a tem. "Estátua da deusa… alguns
   mercadores pagam caro por ela", exatamente como o jogador pediu. */
export const MARCA_DE_MERCADORIA = "pagam caro";
export function declaraVenda(descricao) { return String(descricao || "").toLowerCase().includes(MARCA_DE_MERCADORIA); }
export function fraseDeMercadoria(oQue = "isto") {
  return `Não tem uso na aventura — mas alguns mercadores pagam caro por ${oQue}.`;
}

/* ---------------- O QUE A BOLSA OFERECE ----------------
   O verbo que o botão da bolsa mostra, já com rótulo. Um item sem ficha
   devolve só o rótulo de mercadoria se a descrição declarar venda; senão,
   null — e a bolsa cai no "soltar" de sempre, que agora é a exceção, não
   a regra. */
export function acaoDaBolsa(item, descricao = "") {
  const f = fichaDoItem(item);
  if (f) {
    const v = verboPorId(f.verbo || verboPadraoDaClasse(f.classe));
    if (v) return { verbo: v.id, rotulo: v.rotulo, classe: f.classe };
  }
  if (declaraVenda(descricao || (typeof item === "object" && item ? item.descricao : ""))) {
    return { verbo: "vender", rotulo: "Vender", classe: "mercadoria" };
  }
  return null;
}
