/* ============================================================
   ESPECIALIZAÇÕES (v9.6) — o terceiro andar da árvore — Taverna

   A classe é o que você é. A subclasse é o caminho que você
   escolheu. A especialização é a obsessão: o que você fez tantas
   vezes que virou seu nome. Duas por subclasse, e você segue UMA.

   Elas abrem tarde de propósito — degraus 10, 12 e 14 NAQUELA
   classe. Chegar lá custa quase todo o orçamento de pontos do
   nível 20, e é essa a escolha grande do jogo:

     · ir FUNDO — uma classe inteira, subclasse e especialização;
     · ou ir LARGO — duas classes com subclasse cada (a multiclasse).

   As duas cabem no orçamento. As duas juntas, não. É de propósito.
   ============================================================ */

/* nome, custo em PM, tipo, descrição — o degrau vem da posição */
const E = (nome, custo, tipo, descricao) => ({ nome, custo, tipo, descricao });
export const DEGRAUS_ESPECIALIZACAO = [10, 12, 14];

export const ESPECIALIZACOES = {
  /* ═══════════ GUERREIRO ═══════════ */
  "Sentinela": [
    E("Postura de Vigília", 4, "defesa", "Você guarda um trecho do campo: quem tentar passar leva um golpe de graça."),
    E("Escudo do Aliado Caído", 5, "defesa", "Um aliado a 0 PV é arrastado para trás de você e estabilizado."),
    E("Nada Passa", 7, "defesa", "Enquanto você estiver de pé, nenhum inimigo alcança quem está atrás — por três turnos."),
  ],
  "Juramentado": [
    E("Voto de Ferro", 4, "suporte", "Declara um voto: enquanto cumpri-lo, você rola com vantagem."),
    E("Punição do Perjuro", 5, "ataque", "Contra quem quebrou palavra ou traiu, seu golpe dobra."),
    E("Juramento Final", 8, "ataque", "Você aposta o próprio corpo: dano imenso, mas você termina o turno ferido."),
  ],
  "Fúria Ancestral": [
    E("Sangue dos Antigos", 4, "ataque", "A fúria vem de longe: dano extra que cresce a cada turno de luta."),
    E("Pele de Totem", 5, "defesa", "Marcas ancestrais absorvem parte de todo dano físico por quatro turnos."),
    E("Rugido dos que Vieram Antes", 8, "ataque", "Os ancestrais lutam com você: golpe pesado em todos os inimigos próximos."),
  ],
  "Devorador": [
    E("Sede de Carne", 4, "ataque", "Cada golpe que acerta devolve PV a você."),
    E("Banquete de Guerra", 5, "suporte", "Ao derrubar um inimigo, você recupera fôlego e ganha uma ação extra."),
    E("Fome Sem Fundo", 8, "ataque", "Você morde a essência do alvo: dano brutal e cura pelo mesmo valor."),
  ],
  "Duelista": [
    E("Linha da Lâmina", 4, "ataque", "Golpe preciso que ignora escudo e armadura leve."),
    E("Resposta do Mestre", 3, "defesa", "Toda vez que o inimigo erra você, ele leva um talho."),
    E("Estocada Perfeita", 7, "ataque", "Um único golpe no ponto exato: crítico automático."),
  ],
  "Provocador": [
    E("Insulto Certeiro", 3, "utilidade", "O inimigo perde a cabeça: ataca só você, com desvantagem."),
    E("Palco Aberto", 4, "suporte", "Você rouba toda a atenção — o grupo age livre e com vantagem por dois turnos."),
    E("Ovação", 7, "ataque", "A plateia enlouquece: você e o grupo ganham um turno de ataques extras."),
  ],

  /* ═══════════ MAGO ═══════════ */
  "Piromante": [
    E("Brasa Persistente", 4, "ataque", "O alvo pega fogo e continua queimando por vários turnos."),
    E("Sopro de Forja", 5, "ataque", "Uma língua de fogo em linha atinge todos no caminho."),
    E("Estrela Ígnea", 8, "ataque", "Um sol pequeno nasce e desaba: dano devastador em todos os inimigos."),
  ],
  "Criomante": [
    E("Mordida do Inverno", 4, "ataque", "Dano gélido que reduz a ação do alvo no turno seguinte."),
    E("Armadura de Geada", 4, "defesa", "Uma casca de gelo absorve dano e congela quem te acerta."),
    E("Zero Absoluto", 8, "ataque", "O calor some da cena: dano em área e todos os inimigos ficam lentos."),
  ],
  "Ceifador": [
    E("Foice de Sombra", 4, "ataque", "Um corte que atravessa carne e alma — o alvo perde vida máxima na luta."),
    E("Marca do Fim", 5, "utilidade", "Marca um alvo: ao cair, ele libera energia que cura você."),
    E("Colheita Final", 8, "ataque", "Todo inimigo abaixo de um terço de PV cai de uma vez."),
  ],
  "Regente dos Ossos": [
    E("Legião de Ossos", 5, "suporte", "Ergue um pequeno exército de esqueletos por vários turnos."),
    E("Trono de Caveiras", 4, "defesa", "Os mortos formam uma muralha ao seu redor e recebem o dano por você."),
    E("Grande Necrópole", 8, "suporte", "Todos os caídos da cena se erguem do seu lado até o fim do combate."),
  ],
  "Cronomante": [
    E("Instante Roubado", 5, "utilidade", "Você age duas vezes neste turno."),
    E("Bolha Estagnada", 5, "utilidade", "Um inimigo sai do tempo: perde dois turnos inteiros."),
    E("Volta Atrás", 8, "utilidade", "Desfaz o último turno inteiro — dano, condições e posições."),
  ],
  "Teurgista": [
    E("Geometria Viva", 4, "utilidade", "Escreve um círculo no chão: quem entrar sofre o efeito que você desenhou."),
    E("Empréstimo Arcano", 4, "suporte", "Copia uma habilidade que um aliado usou nesta cena."),
    E("Palavra Primeira", 8, "ataque", "Pronuncia uma sílaba da língua que criou o mundo: dano que nada resiste."),
  ],

  /* ═══════════ LADINO ═══════════ */
  "Lâmina Silenciosa": [
    E("Passo sem Som", 3, "utilidade", "Fica invisível e se move sem deixar rastro por três turnos."),
    E("Corte na Nuca", 5, "ataque", "Contra alvo desprevenido, o dano é multiplicado e não faz barulho."),
    E("Uma Só Respiração", 8, "ataque", "Você aparece, mata e some — o alvo cai antes de reagir, se estiver ferido."),
  ],
  "Envenenador": [
    E("Frasco na Manga", 3, "ataque", "Reveste a arma: os próximos golpes envenenam sem teste."),
    E("Coquetel Amargo", 4, "ataque", "Três venenos de uma vez: o alvo fica envenenado, enfraquecido e lento."),
    E("Bafo da Cripta", 7, "ataque", "Uma nuvem tóxica envenena todos os inimigos e apodrece o chão."),
  ],
  "Explorador": [
    E("Leitura do Terreno", 2, "utilidade", "Revela armadilhas, saídas e a melhor posição da cena."),
    E("Trilha Impossível", 3, "utilidade", "O grupo atravessa qualquer terreno sem custo nem risco."),
    E("Vantagem do Lugar", 6, "suporte", "Você posiciona o grupo: todos começam a luta com vantagem."),
  ],
  "Atirador de Elite": [
    E("Respiração Contida", 3, "ataque", "Um tiro só, sem chance de errar."),
    E("Tiro que Atravessa", 5, "ataque", "O projétil perfura o alvo e acerta quem estiver atrás."),
    E("A Um Quilômetro", 8, "ataque", "Acerta qualquer alvo visível, por mais longe e protegido que esteja."),
  ],
  "Vigarista": [
    E("Conversa de Bolso", 2, "utilidade", "Enquanto fala, você já levou algo — e ninguém percebeu."),
    E("Identidade Emprestada", 4, "utilidade", "Assume um papel convincente: portas, guardas e nomes se abrem."),
    E("O Golpe Grande", 7, "utilidade", "Uma trapaça montada em cena que vira a situação inteira a seu favor."),
  ],
  "Mestre das Fechaduras": [
    E("Nenhuma Porta", 2, "utilidade", "Abre qualquer fechadura, cofre ou selo mecânico."),
    E("Armadilha Devolvida", 4, "utilidade", "Desarma e reaproveita: a armadilha passa a servir você."),
    E("Chave de Tudo", 7, "utilidade", "Um gazua encantado que abre até o que foi selado por magia."),
  ],

  /* ═══════════ CLÉRIGO ═══════════ */
  "Curandeiro": [
    E("Mãos que Não Cansam", 4, "suporte", "Cura em área, todo turno, enquanto você se concentrar."),
    E("Vida Emprestada", 5, "suporte", "Transfere seu PV para um aliado — e o excesso vira escudo."),
    E("Aurora Restauradora", 8, "suporte", "O grupo inteiro volta ao PV cheio e perde todas as condições ruins."),
  ],
  "Protetor": [
    E("Manto de Luz", 4, "defesa", "Um aliado fica imune a dano por um turno inteiro."),
    E("Fé Compartilhada", 4, "defesa", "Todo dano no grupo é dividido entre você e o alvo."),
    E("Baluarte Sagrado", 8, "defesa", "Ninguém do grupo cai enquanto o círculo durar — quatro turnos."),
  ],
  "Juramento da Aurora": [
    E("Lâmina de Amanhecer", 4, "ataque", "A arma acende: dano radiante somado a todo golpe seu."),
    E("Luz que Não Recua", 5, "defesa", "Enquanto você avançar, nem medo nem escuridão te tocam — nem ao grupo."),
    E("Julgamento da Aurora", 8, "ataque", "Uma coluna de luz cai sobre o inimigo mais forte da cena."),
  ],
  "Vingador": [
    E("Dívida de Sangue", 4, "ataque", "Contra quem feriu um aliado seu, você bate com vantagem e dano extra."),
    E("Perseguição Sagrada", 4, "utilidade", "Marca um alvo: ele não consegue fugir de você nesta cena."),
    E("Cobrança Final", 8, "ataque", "Todo o dano que seu grupo levou nesta luta volta de uma vez no alvo."),
  ],
  "Caçador de Demônios": [
    E("Olho que Enxerga", 3, "utilidade", "Vê o que se disfarça: possessões, ilusões e criaturas ocultas."),
    E("Selo de Interdito", 5, "defesa", "Um demônio ou morto-vivo fica preso e sem poderes por três turnos."),
    E("Volta ao Abismo", 8, "ataque", "Manda de volta ao lugar de onde veio — some da cena, permanentemente."),
  ],
  "Exorcista": [
    E("Palavra que Expulsa", 4, "suporte", "Arranca de um aliado qualquer possessão, maldição ou controle."),
    E("Corrente de Ritos", 5, "ataque", "Amarras litúrgicas queimam quem é profano ao toque."),
    E("Nome Verdadeiro", 8, "utilidade", "Descobre e pronuncia o nome real da criatura: ela obedece uma ordem sua."),
  ],

  /* ═══════════ CAÇADOR ═══════════ */
  "Tiro Certeiro": [
    E("Olho que Mede o Vento", 3, "ataque", "Ignora cobertura, penumbra e distância neste disparo."),
    E("Flecha na Junta", 4, "ataque", "Acerta onde dói: o alvo perde a ação seguinte."),
    E("Disparo Definidor", 7, "ataque", "Um tiro carregado que derruba até criatura grande."),
  ],
  "Chuva de Flechas": [
    E("Salva Rápida", 4, "ataque", "Três disparos em alvos diferentes no mesmo turno."),
    E("Céu Escuro", 5, "ataque", "Uma nuvem de flechas cai sobre toda a área inimiga."),
    E("Tempestade de Hastes", 8, "ataque", "Dois turnos seguidos de chuva contínua sobre o campo."),
  ],
  "Vínculo Selvagem": [
    E("Duas Almas", 3, "suporte", "Você e sua fera agem no mesmo turno, sem gastar ação separada."),
    E("Ferida Compartilhada", 4, "defesa", "O dano é dividido entre você e a fera — e nenhum dos dois cai sozinho."),
    E("Forma Conjunta", 8, "ataque", "Vocês lutam como uma criatura só: ataques dobrados por quatro turnos."),
  ],
  "Alcateia": [
    E("Chamado do Bando", 4, "suporte", "Três feras menores entram na luta ao seu lado."),
    E("Cerco de Presas", 4, "ataque", "A alcateia cerca um alvo: ele sofre desvantagem em tudo."),
    E("Uivo do Alfa", 8, "ataque", "Toda a alcateia investe de uma vez no mesmo inimigo."),
  ],
  "Caçador de Recompensas": [
    E("Contrato Aberto", 3, "utilidade", "Marca um alvo: você sempre sabe onde ele está, em qualquer lugar do mapa."),
    E("Amarras de Captura", 4, "utilidade", "Prende o alvo vivo — útil quando o contrato paga mais assim."),
    E("Cobrança em Dobro", 7, "ataque", "Contra o alvo marcado, cada golpe seu vale por dois."),
  ],
  "Guia do Ermo": [
    E("Leitura de Rastro", 2, "utilidade", "Sabe quem passou, quando, quantos eram e para onde foram."),
    E("Acampamento Seguro", 3, "suporte", "O descanso rende o dobro e nada surpreende o grupo à noite."),
    E("O Ermo é Meu", 6, "suporte", "Fora das cidades, o grupo inteiro ganha vantagem e não se perde jamais."),
  ],

  /* ═══════════ BARDO ═══════════ */
  "Canto de Cura": [
    E("Melodia que Fecha Feridas", 4, "suporte", "Enquanto você toca, o grupo cura a cada turno."),
    E("Refrão Teimoso", 4, "suporte", "Um aliado caído volta cantando junto, com metade do PV."),
    E("Réquiem ao Contrário", 8, "suporte", "A canção reverte o combate: o grupo volta ao estado do primeiro turno."),
  ],
  "Hino de Guerra": [
    E("Marcha Sem Recuo", 4, "suporte", "O grupo ganha dano extra e imunidade a medo por quatro turnos."),
    E("Tambor de Investida", 4, "suporte", "Todos os aliados agem antes dos inimigos na próxima rodada."),
    E("Hino Final", 8, "suporte", "Todo o grupo recebe uma ação extra por três turnos."),
  ],
  "Erudito": [
    E("Já Li Sobre Isso", 2, "utilidade", "Revela a fraqueza, a origem e o ponto fraco de qualquer criatura."),
    E("Nota de Rodapé", 3, "suporte", "Concede a um aliado o resultado de uma rolagem já feita nesta cena."),
    E("Biblioteca Viva", 6, "utilidade", "Responde qualquer pergunta de conhecimento que a cena comporte."),
  ],
  "Contador de Segredos": [
    E("Boato Plantado", 3, "utilidade", "Uma mentira sua começa a circular como verdade na região."),
    E("O Que Você Esconde", 4, "utilidade", "Arranca de um NPC o segredo que ele mais protege."),
    E("Verdade Pública", 7, "utilidade", "Revela um segredo devastador em cena — reputações caem na hora."),
  ],
  "Sedutor": [
    E("Olhar que Prende", 3, "utilidade", "O alvo não consegue te atacar nem sair da conversa."),
    E("Favor Concedido", 4, "utilidade", "Um NPC faz por você algo que não faria por mais ninguém."),
    E("Corte Encantada", 7, "utilidade", "Uma sala inteira passa a te tratar como convidado de honra."),
  ],
  "Manipulador": [
    E("Sugestão Plantada", 4, "utilidade", "O alvo executa uma ordem simples achando que foi ideia dele."),
    E("Discórdia", 4, "ataque", "Dois inimigos se voltam um contra o outro por dois turnos."),
    E("Marionete", 8, "utilidade", "Controla um inimigo por três turnos — ele luta do seu lado."),
  ],

  /* ═══════════ MONGE ═══════════ */
  "Mão Aberta": [
    E("Palma que Desloca", 3, "ataque", "O golpe empurra, derruba ou tira o ar do alvo — você escolhe."),
    E("Sequência de Cinco", 5, "ataque", "Cinco golpes encadeados no mesmo alvo."),
    E("Toque do Fim", 8, "ataque", "Um golpe silencioso: o alvo cai depois de alguns turnos, sem defesa possível."),
  ],
  "Quebra-Montanhas": [
    E("Punho de Pedra", 4, "ataque", "Dano que ignora armadura e racha escudo."),
    E("Impacto Sísmico", 5, "ataque", "O chão treme: todos os inimigos próximos caem no chão."),
    E("Rachar o Mundo", 8, "ataque", "Um golpe único que abre a terra e devasta a linha inteira à frente."),
  ],
  "Vento Veloz": [
    E("Passo de Trinta Metros", 2, "utilidade", "Atravessa a cena inteira e ainda ataca no mesmo turno."),
    E("Vendaval de Punhos", 4, "ataque", "Acerta todos os inimigos ao alcance com um golpe cada."),
    E("Mais Rápido que o Olho", 7, "ataque", "Você age duas vezes por rodada durante quatro turnos."),
  ],
  "Sombra Dançante": [
    E("Passo entre Sombras", 3, "utilidade", "Teleporta de sombra em sombra e reaparece atrás do alvo."),
    E("Golpe do Escuro", 4, "ataque", "Na penumbra, seus ataques acertam com vantagem e dano extra."),
    E("Dança Sem Vulto", 7, "defesa", "Por três turnos, tudo que vier em sua direção erra."),
  ],
  "Corpo Imaculado": [
    E("Carne Sem Veneno", 3, "defesa", "Imune a veneno, doença e desgaste do corpo."),
    E("Fôlego de Aço", 4, "defesa", "Reduz todo dano recebido pela metade por três turnos."),
    E("Casulo de Chi", 8, "defesa", "Você para de sofrer dano por dois turnos e cura tudo ao sair."),
  ],
  "Mente Vazia": [
    E("Silêncio Interior", 3, "defesa", "Imune a medo, encantamento e leitura de mente."),
    E("Antevisão", 4, "defesa", "Você sabe o que vem antes: o próximo golpe inimigo erra."),
    E("Nada Me Alcança", 8, "defesa", "Por quatro turnos, nenhum efeito mental ou mágico funciona em você."),
  ],

  /* ═══════════ DRUIDA ═══════════ */
  "Forma Predadora": [
    E("Presas do Bosque", 4, "ataque", "Assume forma de predador: dano físico pesado e velocidade."),
    E("Faro de Sangue", 3, "utilidade", "Rastreia qualquer criatura ferida pelo cheiro, por dias."),
    E("Besta Primordial", 8, "ataque", "Uma forma colossal e antiga: dano imenso por quatro turnos."),
  ],
  "Forma Alada": [
    E("Asas de Tempestade", 4, "utilidade", "Voa livremente e leva um aliado junto."),
    E("Mergulho de Rapina", 5, "ataque", "Cai do céu sobre o alvo: dano de investida e derruba."),
    E("Senhor do Céu", 8, "ataque", "Domina o ar da cena: ninguém em terra alcança você, e você alcança todos."),
  ],
  "Espíritos Ancestrais": [
    E("Conselho dos Antigos", 3, "suporte", "Os espíritos respondem uma pergunta sobre o passado do lugar."),
    E("Totem de Guarda", 4, "defesa", "Ergue um totem que cura e protege quem estiver perto."),
    E("Marcha dos Ancestrais", 8, "ataque", "Uma procissão de espíritos atravessa a cena ferindo só os inimigos."),
  ],
  "Chamado da Tempestade": [
    E("Raio Convocado", 4, "ataque", "Um relâmpago cai no alvo — e salta para quem estiver molhado."),
    E("Vendaval", 5, "ataque", "O vento empurra, derruba e cega todos os inimigos."),
    E("Coração da Tormenta", 8, "ataque", "Uma tempestade fixa na cena castiga os inimigos a cada turno."),
  ],
  "Guardião do Bosque": [
    E("Raízes que Prendem", 4, "utilidade", "O chão agarra os inimigos e os segura no lugar."),
    E("Cerca Viva", 4, "defesa", "Uma muralha de espinhos cresce entre o grupo e o perigo."),
    E("O Bosque Acorda", 8, "ataque", "Árvores e pedras entram na luta do seu lado por vários turnos."),
  ],
  "Semeador": [
    E("Semente de Cura", 3, "suporte", "Planta uma semente que cura o grupo a cada turno onde ficar."),
    E("Terra Fértil", 4, "suporte", "O terreno passa a favorecer o grupo: cura, cobertura e movimento livre."),
    E("Renascimento", 8, "suporte", "A vida volta: todos os aliados caídos se erguem com PV parcial."),
  ],

  /* ═══════════ FEITICEIRO ═══════════ */
  "Coração de Brasa": [
    E("Escamas em Brasa", 4, "defesa", "Escamas cobrem você: reduz dano e queima quem te toca."),
    E("Sopro de Berço", 5, "ataque", "Um sopro de dragão em cone atinge todos à frente."),
    E("Sangue de Dragão", 8, "ataque", "Você assume traços do ancestral: dano dobrado por quatro turnos."),
  ],
  "Asa Ancestral": [
    E("Asas de Escama", 3, "utilidade", "Ergue voo e ataca de cima, com vantagem."),
    E("Sombra de Asa", 4, "utilidade", "Sua aura de dragão apavora todos os inimigos da cena."),
    E("Forma do Ancestral", 8, "ataque", "Você vira um dragão menor até o fim da luta."),
  ],
  "Senhor dos Ventos": [
    E("Corrente Ascendente", 3, "utilidade", "O vento carrega você e o grupo por cima do obstáculo."),
    E("Lâminas de Ar", 4, "ataque", "Cortes invisíveis atingem todos os inimigos em linha."),
    E("Ciclone Pessoal", 8, "defesa", "Um vórtice ao seu redor desvia projéteis e arrasta quem se aproxima."),
  ],
  "Filho do Trovão": [
    E("Estalo", 3, "ataque", "Um trovão seco atordoa o alvo antes que ele aja."),
    E("Corrente Viva", 5, "ataque", "A eletricidade salta entre todos os inimigos próximos."),
    E("Descarga Celeste", 8, "ataque", "O céu abre e descarrega tudo num ponto só."),
  ],
  "Onda de Caos": [
    E("Surto Instável", 3, "ataque", "Dano imprevisível: pode ser pouco, pode arrasar a cena."),
    E("Reescrita Selvagem", 4, "utilidade", "Um efeito mágico em cena vira outra coisa completamente."),
    E("Caos Puro", 8, "ataque", "A realidade cede: efeito devastador e imprevisível em todos os inimigos."),
  ],
  "Sorte Torta": [
    E("Dado Virado", 2, "utilidade", "Troca o resultado de uma rolagem sua ou de um aliado."),
    E("Azar Alheio", 4, "utilidade", "O próximo acerto crítico inimigo vira erro crítico."),
    E("Improvável", 7, "suporte", "Por três turnos, tudo que puder dar certo para o grupo dá."),
  ],

  /* ═══════════ BRUXO ═══════════ */
  "Chama Contratual": [
    E("Fogo do Contrato", 4, "ataque", "Chamas que não apagam até o alvo cair ou pagar o preço."),
    E("Cláusula de Sangue", 4, "suporte", "Você paga com PV e recebe poder na mesma medida."),
    E("Selo Infernal", 8, "ataque", "Marca o alvo com o selo do seu senhor: dano crescente até o fim da luta."),
  ],
  "Cobrador de Almas": [
    E("Penhora", 4, "ataque", "Cada inimigo que cai perto de você deixa uma alma no seu bolso."),
    E("Moeda de Alma", 3, "suporte", "Gasta uma alma guardada para recuperar PV, PM ou um turno."),
    E("Livro-Caixa do Abismo", 8, "ataque", "Cobra todas as dívidas de uma vez: dano por alma acumulada."),
  ],
  "Enganador Radiante": [
    E("Mentira Luminosa", 3, "utilidade", "Cria uma cópia sua perfeita que age por um turno."),
    E("Presente Envenenado", 4, "utilidade", "Oferece algo real que cobra um preço escondido depois."),
    E("Corte de Espelhos", 7, "defesa", "Seis cópias suas confundem a cena: quase todo golpe erra o original."),
  ],
  "Sombra do Bosque": [
    E("Atalho de Orvalho", 3, "utilidade", "Some daqui e aparece a qualquer lugar visível."),
    E("Névoa de Encanto", 4, "ataque", "Uma névoa que confunde e faz os inimigos errarem o alvo."),
    E("A Corte Cobra", 8, "ataque", "Os feéricos aparecem e levam um inimigo embora da cena."),
  ],
  "Voz do Vazio": [
    E("Sussurro Errado", 3, "ataque", "Palavras que não deveriam existir ferem a mente do alvo."),
    E("Silêncio Que Grita", 4, "utilidade", "Ninguém consegue conjurar nem falar por dois turnos — só você."),
    E("Verbo Anterior", 8, "ataque", "Uma frase da língua do vazio: dano psíquico em todos e loucura temporária."),
  ],
  "Olho Insone": [
    E("Não Pisco", 2, "utilidade", "Vê tudo na cena: invisíveis, ocultos, mentiras e intenções."),
    E("Olhar que Consome", 4, "ataque", "Encarar o alvo o desgasta por dentro a cada turno."),
    E("Mil Olhos", 7, "utilidade", "Enxerga qualquer lugar da região que já tenha visitado, agora."),
  ],

  /* ═══════════ ENGENHEIRO ═══════════ */
  "Demolidor": [
    E("Carga Modelada", 4, "ataque", "Explosivo colocado com precisão: dano imenso num ponto só."),
    E("Barril na Linha", 5, "ataque", "Rola um barril que explode no meio dos inimigos."),
    E("Derrubada Controlada", 8, "ataque", "O cenário desaba sobre a área inimiga."),
  ],
  "Franco-Atirador": [
    E("Cano Longo", 3, "ataque", "Um disparo de longuíssimo alcance que ignora cobertura."),
    E("Mira Assistida", 4, "ataque", "Marca o alvo: os próximos disparos não erram."),
    E("Um Tiro, Um Nome", 8, "ataque", "Contra alvo marcado e distante, o disparo é fatal ou quase."),
  ],
  "Pai das Máquinas": [
    E("Autômato de Guerra", 5, "suporte", "Monta um autômato que luta ao seu lado até ser destruído."),
    E("Oficina de Campo", 4, "suporte", "Repara o autômato e melhora o equipamento do grupo em cena."),
    E("Legião de Engrenagens", 8, "suporte", "Três autômatos entram na luta e obedecem sem falha."),
  ],
  "Engrenagem Viva": [
    E("Enxerto Mecânico", 4, "defesa", "Peças no próprio corpo: resistência e força extras por vários turnos."),
    E("Sobrecarga", 4, "ataque", "Queima os próprios sistemas por dano brutal — e sofre por isso."),
    E("Homem-Máquina", 8, "defesa", "Você vira metal: imune a veneno, sangramento e medo, e bate mais forte."),
  ],
  "Químico Louco": [
    E("Mistura do Dia", 3, "ataque", "Um frasco de efeito sorteado — sempre potente, nunca previsível."),
    E("Elixir Duplo", 4, "suporte", "Bebe dois elixires de uma vez sem sofrer a reação."),
    E("Reação em Cadeia", 8, "ataque", "Uma explosão química que se alimenta de si mesma por três turnos."),
  ],
  "Boticário de Guerra": [
    E("Cinto Cheio", 3, "suporte", "Distribui frascos: o grupo inteiro cura ou ganha um bônus."),
    E("Antídoto Universal", 4, "suporte", "Remove qualquer veneno, doença ou condição química do grupo."),
    E("Farmácia de Batalha", 7, "suporte", "Por quatro turnos, todo aliado cura no começo do próprio turno."),
  ],

  /* ═══════════ INVOCADOR ═══════════ */
  "Alcateia Espiritual": [
    E("Matilha de Névoa", 4, "suporte", "Quatro feras espectrais entram e cercam os inimigos."),
    E("Elo de Matilha", 4, "suporte", "Você e as feras compartilham vantagem e dano extra."),
    E("Caçada Sem Fim", 8, "ataque", "A matilha persegue um alvo até ele cair, turno após turno."),
  ],
  "Colosso de Presa": [
    E("Chamar o Grande", 5, "suporte", "Invoca uma fera enorme que segura a linha de frente."),
    E("Rugido que Racha", 5, "ataque", "O colosso ruge: inimigos ficam apavorados e atordoados."),
    E("Pisada do Colosso", 8, "ataque", "O gigante pisa: dano devastador em área e o chão cede."),
  ],
  "Coração Ígneo": [
    E("Servo de Magma", 5, "suporte", "Um elemental de lava luta e queima quem o ataca."),
    E("Chão em Chamas", 4, "ataque", "O solo pega fogo sob os inimigos por vários turnos."),
    E("Elemental Primevo", 8, "suporte", "Convoca um titã de fogo até o fim do combate."),
  ],
  "Pulso da Terra": [
    E("Servo de Granito", 5, "suporte", "Um elemental de pedra absorve o dano por você."),
    E("Muralha Erguida", 4, "defesa", "A terra sobe e divide o campo de batalha ao meio."),
    E("Coração do Mundo", 8, "ataque", "O chão inteiro se levanta e esmaga a área inimiga."),
  ],
  "Guia Ancestral": [
    E("Voz do Antepassado", 3, "suporte", "Um espírito guia o grupo: vantagem em tudo por dois turnos."),
    E("Memória Emprestada", 4, "utilidade", "O espírito lembra por você: revela o que aconteceu neste lugar."),
    E("Linhagem Convocada", 8, "suporte", "Gerações inteiras se manifestam e lutam ao seu lado."),
  ],
  "Corte Fantasma": [
    E("Cortesãos de Bruma", 4, "suporte", "Vários espectros entram na luta e distraem os inimigos."),
    E("Baile dos Mortos", 5, "ataque", "Os espectros arrastam os inimigos para uma dança que fere."),
    E("Trono de Névoa", 8, "suporte", "Você comanda a corte inteira: espectros agem todo turno até o fim."),
  ],
};

/* A árvore de uma especialização, com o degrau (rank exigido) já calculado. */
export function habilidadesDaEspecializacao(nomeEsp) {
  const lista = ESPECIALIZACOES[nomeEsp];
  if (!lista) return [];
  return lista.map((h, i) => ({ ...h, nivel: DEGRAUS_ESPECIALIZACAO[i] || 14, especializacao: nomeEsp }));
}

export function especializacaoDaHabilidade(nomeHab) {
  const alvo = String(nomeHab || "").toLowerCase();
  for (const [esp, lista] of Object.entries(ESPECIALIZACOES)) {
    if (lista.some((h) => h.nome.toLowerCase() === alvo)) return esp;
  }
  return null;
}

/* Rank mínimo na classe para escolher a especialização. É o degrau da primeira
   habilidade: chegar aqui já significa ter vivido a classe inteira. */
export const RANK_PARA_ESPECIALIZACAO = DEGRAUS_ESPECIALIZACAO[0];

export const ESPECIALIZACOES_PROMPT = `ESPECIALIZAÇÕES (v9.6 — o terceiro andar da ficha):
- Depois de dez degraus numa mesma classe, o herói pode escolher UMA especialização dentro da subclasse dele — a obsessão que virou nome. Ela abre três habilidades exclusivas.
- Quem escolhe isso está indo FUNDO numa classe só; quem prefere multiclasse não chega lá. Nenhum dos dois é "certo": narre a diferença (o especialista é temido pelo que faz de melhor; o multiclasse surpreende por não ter forma).
- Você NUNCA concede, sugere nem cria especializações e habilidades. Elas vêm da ficha, escolhidas pelo jogador no painel de talentos. Se ele usar uma, o envelope do sistema chega com o resultado pronto.`;
