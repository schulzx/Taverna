/* AR 11 · 07/11/2026 — A CONSTELAÇÃO DO HERÓI: a geometria de cada classe.
   Puro: só dados e funções que devolvem dados ou strings SVG. É a MESMA fonte
   que montou os quadros no Figma (página «AR · 05/11», §AR 11 de formas.md) e
   que escreveu as tabelas de lá. Quem porta para src/ (o `aprendiz`) copia
   FIGURAS_DA_CONSTELACAO e LUGAR_DAS_FIGURAS para estilo.js e o desenho para
   o painel; não redesenha.

   O QUE É UMA ESTRELA: um nó REAL da árvore da classe, pela chave
     "classe:<nome>"          — arvoreDaClasse(pers, classe)        (12; o Mago 16)
     "sub:<Subclasse>:<nome>" — arvoreDaSubclasse(pers, classe)     (4 por subclasse)
     "esp:<Especial.>:<nome>" — arvoreDaEspecializacao(pers, classe) (3 por especialização)
   O <nome> é o `nome` da habilidade, exato (o mesmo que `dominada` compara).
   O prefixo é preciso porque há nomes repetidos entre ramos (o Arqueiro tem
   «Tiro Duplo», «Flecha Perfurante», «Chuva de Flechas» e «Tiro do Fim» também
   na classe; o Arcanista, o Assassino, o Paladino, o Punho de Ferro e o
   Andarilho também repetem). Como `dominada` é por nome, as duas acendem
   juntas — é a verdade do sistema, e está escrita em formas.md §AR 11.

   AS COORDENADAS: normalizadas, 0..1 num QUADRADO (x para a direita, y para
   baixo). A figura da classe mora em cima (y 0,03–0,44); da raiz (a estrela
   de baixo da figura) pendem os três braços das subclasses; do fim de cada
   braço, os dois ramos das especializações. Distância mínima entre duas
   estrelas que podem estar à vista juntas: 0.07 do lado — 42 px na mesa
   (lado 600, a 1905 e a 1280) e 24 px a 375 (lado 343, = os 24 de WCAG 2.2
   2.5.8). O alvo de cada estrela é min(44, distância à vizinha mais perto).
   `validarCeu()` volta a medir tudo; o `aprendiz` põe-na numa suíte.

   O QUE ESTÁ À VISTA (nunca as três camadas inteiras ao mesmo tempo):
     sem subclasse      → a figura + os TRÊS braços (por acender; o convite)
     subclasse, sem esp → a figura + o braço dela + os DOIS ramos dele
     especialização     → a figura + o braço + o ramo escolhido
   As ligações de nascença têm `null` à esquerda: no braço, é a raiz da
   figura; no ramo, é a última estrela do braço. Acendem quando a estrela da
   direita acende (a escolha é que as acende, não a estrela de cima).

   Os braços e os ramos foram CALCULADOS (BRACO e RAMO, abaixo) e escritos como
   números; as figuras foram desenhadas à mão. As habilidades ocupam os pontos
   da figura pela ordem do nível (estável na ordem de CLASSES): a figura
   desenha-se a subir de degrau. */

/* o cálculo que gerou os braços e os ramos — registo, para quem um dia os
   refizer; a verdade são os números de FIGURAS_DA_CONSTELACAO, e validarCeu()
   é quem os prende */
export const BRACO_E_RAMO = {
  braco: { angulos: [-40,0,40], primeiro: 0.105, passo: 0.075, curva: 6 },  /* graus a partir de «para baixo»; a curva abre para fora a cada passo */
  ramo: { abertura: 32, passos: [0.075,0.072,0.072] },
  minimo: 0.07, borda: [0.03,0.97],
};

export const FIGURAS_DA_CONSTELACAO = {
  "Guerreiro": {
    figura: "o escudo",
    raiz: "Quebra-Guarda",
    estrelas: {
      "Golpe Poderoso": [0.34, 0.08],
      "Postura Defensiva": [0.5, 0.05],
      "Investida": [0.66, 0.08],
      "Provocação": [0.7, 0.19],
      "Grito de Guerra": [0.68, 0.3],
      "Segundo Fôlego": [0.6, 0.38],
      "Quebra-Guarda": [0.5, 0.44],
      "Muralha": [0.4, 0.38],
      "Ataque Duplo": [0.32, 0.3],
      "Indomável": [0.3, 0.19],
      "Fúria de Batalha": [0.5, 0.17],
      "Golpe Decisivo": [0.5, 0.3],
    },
    ligacoes: [["Golpe Poderoso", "Postura Defensiva"], ["Postura Defensiva", "Investida"], ["Investida", "Provocação"], ["Provocação", "Grito de Guerra"], ["Grito de Guerra", "Segundo Fôlego"], ["Segundo Fôlego", "Quebra-Guarda"], ["Quebra-Guarda", "Muralha"], ["Muralha", "Ataque Duplo"], ["Ataque Duplo", "Indomável"], ["Indomável", "Golpe Poderoso"], ["Postura Defensiva", "Fúria de Batalha"], ["Fúria de Batalha", "Golpe Decisivo"], ["Golpe Decisivo", "Quebra-Guarda"]],
    bracos: {
      "Cavaleiro": {
        estrelas: {
          "Juramento de Guarda": [0.433, 0.52],
          "Provocação de Ferro": [0.379, 0.573],
          "Muralha Viva": [0.319, 0.619],
          "Voto Inquebrável": [0.256, 0.658],
        },
        ligacoes: [[null, "Juramento de Guarda"], ["Juramento de Guarda", "Provocação de Ferro"], ["Provocação de Ferro", "Muralha Viva"], ["Muralha Viva", "Voto Inquebrável"]],
        ramos: {
          "Sentinela": { estrelas: { "Postura de Vigília": [0.181, 0.658], "Escudo do Aliado Caído": [0.109, 0.658], "Nada Passa": [0.037, 0.658] }, ligacoes: [[null, "Postura de Vigília"], ["Postura de Vigília", "Escudo do Aliado Caído"], ["Escudo do Aliado Caído", "Nada Passa"]] },
          "Juramentado": { estrelas: { "Voto de Ferro": [0.223, 0.725], "Punição do Perjuro": [0.192, 0.79], "Juramento Final": [0.16, 0.855] }, ligacoes: [[null, "Voto de Ferro"], ["Voto de Ferro", "Punição do Perjuro"], ["Punição do Perjuro", "Juramento Final"]] },
        },
      },
      "Bárbaro": {
        estrelas: {
          "Fúria Sangrenta": [0.5, 0.545],
          "Pele de Pedra": [0.5, 0.62],
          "Golpe Dilacerante": [0.5, 0.695],
          "Último Rugido": [0.5, 0.77],
        },
        ligacoes: [[null, "Fúria Sangrenta"], ["Fúria Sangrenta", "Pele de Pedra"], ["Pele de Pedra", "Golpe Dilacerante"], ["Golpe Dilacerante", "Último Rugido"]],
        ramos: {
          "Fúria Ancestral": { estrelas: { "Sangue dos Antigos": [0.46, 0.834], "Pele de Totem": [0.422, 0.895], "Rugido dos que Vieram Antes": [0.384, 0.956] }, ligacoes: [[null, "Sangue dos Antigos"], ["Sangue dos Antigos", "Pele de Totem"], ["Pele de Totem", "Rugido dos que Vieram Antes"]] },
          "Devorador": { estrelas: { "Sede de Carne": [0.54, 0.834], "Banquete de Guerra": [0.578, 0.895], "Fome Sem Fundo": [0.616, 0.956] }, ligacoes: [[null, "Sede de Carne"], ["Sede de Carne", "Banquete de Guerra"], ["Banquete de Guerra", "Fome Sem Fundo"]] },
        },
      },
      "Gladiador": {
        estrelas: {
          "Finta da Arena": [0.567, 0.52],
          "Aplauso da Multidão": [0.621, 0.573],
          "Duelo Declarado": [0.681, 0.619],
          "Espetáculo Final": [0.744, 0.658],
        },
        ligacoes: [[null, "Finta da Arena"], ["Finta da Arena", "Aplauso da Multidão"], ["Aplauso da Multidão", "Duelo Declarado"], ["Duelo Declarado", "Espetáculo Final"]],
        ramos: {
          "Duelista": { estrelas: { "Linha da Lâmina": [0.777, 0.725], "Resposta do Mestre": [0.808, 0.79], "Estocada Perfeita": [0.84, 0.855] }, ligacoes: [[null, "Linha da Lâmina"], ["Linha da Lâmina", "Resposta do Mestre"], ["Resposta do Mestre", "Estocada Perfeita"]] },
          "Provocador": { estrelas: { "Insulto Certeiro": [0.819, 0.658], "Palco Aberto": [0.891, 0.658], "Ovação": [0.963, 0.658] }, ligacoes: [[null, "Insulto Certeiro"], ["Insulto Certeiro", "Palco Aberto"], ["Palco Aberto", "Ovação"]] },
        },
      },
    },
  },
  "Mago": {
    figura: "o cajado",
    raiz: "Projétil Arcano",
    estrelas: {
      "Projétil Arcano": [0.5, 0.44],
      "Escudo Arcano": [0.52, 0.36],
      "Rajada de Fogo": [0.54, 0.28],
      "Toque Gélido": [0.56, 0.2],
      "Ler Auras": [0.58, 0.12],
      "Corrente de Raios": [0.51, 0.07],
      "Passo Étereo": [0.58, 0.03],
      "Lentidão": [0.65, 0.07],
      "Bola de Fogo": [0.66, 0.15],
      "Prisão Arcana": [0.42, 0.12],
      "Contramágica": [0.34, 0.18],
      "Muralha de Gelo": [0.29, 0.27],
      "Invisibilidade": [0.75, 0.12],
      "Meteoro": [0.78, 0.22],
      "Voo": [0.73, 0.31],
      "Reescrever o Instante": [0.65, 0.37],
    },
    ligacoes: [["Projétil Arcano", "Escudo Arcano"], ["Escudo Arcano", "Rajada de Fogo"], ["Rajada de Fogo", "Toque Gélido"], ["Toque Gélido", "Ler Auras"], ["Ler Auras", "Corrente de Raios"], ["Corrente de Raios", "Passo Étereo"], ["Passo Étereo", "Lentidão"], ["Lentidão", "Bola de Fogo"], ["Bola de Fogo", "Ler Auras"], ["Corrente de Raios", "Prisão Arcana"], ["Prisão Arcana", "Contramágica"], ["Contramágica", "Muralha de Gelo"], ["Bola de Fogo", "Invisibilidade"], ["Invisibilidade", "Meteoro"], ["Meteoro", "Voo"], ["Voo", "Reescrever o Instante"]],
    bracos: {
      "Elementalista": {
        estrelas: {
          "Manto Flamejante": [0.433, 0.52],
          "Lança de Gelo": [0.379, 0.573],
          "Tempestade Elemental": [0.319, 0.619],
          "Convergência": [0.256, 0.658],
        },
        ligacoes: [[null, "Manto Flamejante"], ["Manto Flamejante", "Lança de Gelo"], ["Lança de Gelo", "Tempestade Elemental"], ["Tempestade Elemental", "Convergência"]],
        ramos: {
          "Piromante": { estrelas: { "Brasa Persistente": [0.181, 0.658], "Sopro de Forja": [0.109, 0.658], "Estrela Ígnea": [0.037, 0.658] }, ligacoes: [[null, "Brasa Persistente"], ["Brasa Persistente", "Sopro de Forja"], ["Sopro de Forja", "Estrela Ígnea"]] },
          "Criomante": { estrelas: { "Mordida do Inverno": [0.223, 0.725], "Armadura de Geada": [0.192, 0.79], "Zero Absoluto": [0.16, 0.855] }, ligacoes: [[null, "Mordida do Inverno"], ["Mordida do Inverno", "Armadura de Geada"], ["Armadura de Geada", "Zero Absoluto"]] },
        },
      },
      "Necromante": {
        estrelas: {
          "Toque Sepulcral": [0.5, 0.545],
          "Servos de Osso": [0.5, 0.62],
          "Colheita de Almas": [0.5, 0.695],
          "Véu da Morte": [0.5, 0.77],
        },
        ligacoes: [[null, "Toque Sepulcral"], ["Toque Sepulcral", "Servos de Osso"], ["Servos de Osso", "Colheita de Almas"], ["Colheita de Almas", "Véu da Morte"]],
        ramos: {
          "Ceifador": { estrelas: { "Foice de Sombra": [0.46, 0.834], "Marca do Fim": [0.422, 0.895], "Colheita Final": [0.384, 0.956] }, ligacoes: [[null, "Foice de Sombra"], ["Foice de Sombra", "Marca do Fim"], ["Marca do Fim", "Colheita Final"]] },
          "Regente dos Ossos": { estrelas: { "Legião de Ossos": [0.54, 0.834], "Trono de Caveiras": [0.578, 0.895], "Grande Necrópole": [0.616, 0.956] }, ligacoes: [[null, "Legião de Ossos"], ["Legião de Ossos", "Trono de Caveiras"], ["Trono de Caveiras", "Grande Necrópole"]] },
        },
      },
      "Arcanista": {
        estrelas: {
          "Dilatação": [0.567, 0.52],
          "Contramágica": [0.621, 0.573],
          "Prisão Arcana": [0.681, 0.619],
          "Reescrever o Instante": [0.744, 0.658],
        },
        ligacoes: [[null, "Dilatação"], ["Dilatação", "Contramágica"], ["Contramágica", "Prisão Arcana"], ["Prisão Arcana", "Reescrever o Instante"]],
        ramos: {
          "Cronomante": { estrelas: { "Instante Roubado": [0.777, 0.725], "Bolha Estagnada": [0.808, 0.79], "Volta Atrás": [0.84, 0.855] }, ligacoes: [[null, "Instante Roubado"], ["Instante Roubado", "Bolha Estagnada"], ["Bolha Estagnada", "Volta Atrás"]] },
          "Teurgista": { estrelas: { "Geometria Viva": [0.819, 0.658], "Empréstimo Arcano": [0.891, 0.658], "Palavra Primeira": [0.963, 0.658] }, ligacoes: [[null, "Geometria Viva"], ["Geometria Viva", "Empréstimo Arcano"], ["Empréstimo Arcano", "Palavra Primeira"]] },
        },
      },
    },
  },
  "Ladino": {
    figura: "a adaga",
    raiz: "Ataque Furtivo",
    estrelas: {
      "Ataque Furtivo": [0.5, 0.44],
      "Esquiva Ágil": [0.5, 0.365],
      "Passos Silenciosos": [0.5, 0.29],
      "Mãos Leves": [0.4, 0.3],
      "Lâmina Envenenada": [0.6, 0.3],
      "Distração": [0.33, 0.25],
      "Golpe nas Juntas": [0.67, 0.25],
      "Sombra Gêmea": [0.5, 0.21],
      "Desaparecer": [0.38, 0.16],
      "Punhal Certeiro": [0.5, 0.13],
      "Mil Cortes": [0.62, 0.1],
      "Execução": [0.5, 0.05],
    },
    ligacoes: [["Ataque Furtivo", "Esquiva Ágil"], ["Esquiva Ágil", "Passos Silenciosos"], ["Passos Silenciosos", "Mãos Leves"], ["Mãos Leves", "Distração"], ["Passos Silenciosos", "Lâmina Envenenada"], ["Lâmina Envenenada", "Golpe nas Juntas"], ["Passos Silenciosos", "Sombra Gêmea"], ["Sombra Gêmea", "Punhal Certeiro"], ["Punhal Certeiro", "Execução"], ["Sombra Gêmea", "Desaparecer"], ["Punhal Certeiro", "Mil Cortes"]],
    bracos: {
      "Assassino": {
        estrelas: {
          "Lâmina Peçonhenta": [0.433, 0.52],
          "Bote Silencioso": [0.379, 0.573],
          "Marca Mortal": [0.319, 0.619],
          "Execução": [0.256, 0.658],
        },
        ligacoes: [[null, "Lâmina Peçonhenta"], ["Lâmina Peçonhenta", "Bote Silencioso"], ["Bote Silencioso", "Marca Mortal"], ["Marca Mortal", "Execução"]],
        ramos: {
          "Lâmina Silenciosa": { estrelas: { "Passo sem Som": [0.181, 0.658], "Corte na Nuca": [0.109, 0.658], "Uma Só Respiração": [0.037, 0.658] }, ligacoes: [[null, "Passo sem Som"], ["Passo sem Som", "Corte na Nuca"], ["Corte na Nuca", "Uma Só Respiração"]] },
          "Envenenador": { estrelas: { "Frasco na Manga": [0.223, 0.725], "Coquetel Amargo": [0.192, 0.79], "Bafo da Cripta": [0.16, 0.855] }, ligacoes: [[null, "Frasco na Manga"], ["Frasco na Manga", "Coquetel Amargo"], ["Coquetel Amargo", "Bafo da Cripta"]] },
        },
      },
      "Batedor": {
        estrelas: {
          "Passo de Sombra": [0.5, 0.545],
          "Mira do Batedor": [0.5, 0.62],
          "Tocaia do Batedor": [0.5, 0.695],
          "Olho de Falcão": [0.5, 0.77],
        },
        ligacoes: [[null, "Passo de Sombra"], ["Passo de Sombra", "Mira do Batedor"], ["Mira do Batedor", "Tocaia do Batedor"], ["Tocaia do Batedor", "Olho de Falcão"]],
        ramos: {
          "Explorador": { estrelas: { "Leitura do Terreno": [0.46, 0.834], "Trilha Impossível": [0.422, 0.895], "Vantagem do Lugar": [0.384, 0.956] }, ligacoes: [[null, "Leitura do Terreno"], ["Leitura do Terreno", "Trilha Impossível"], ["Trilha Impossível", "Vantagem do Lugar"]] },
          "Atirador de Elite": { estrelas: { "Respiração Contida": [0.54, 0.834], "Tiro que Atravessa": [0.578, 0.895], "A Um Quilômetro": [0.616, 0.956] }, ligacoes: [[null, "Respiração Contida"], ["Respiração Contida", "Tiro que Atravessa"], ["Tiro que Atravessa", "A Um Quilômetro"]] },
        },
      },
      "Trapaceiro": {
        estrelas: {
          "Bolso Furado": [0.567, 0.52],
          "Areia nos Olhos": [0.621, 0.573],
          "Escapada": [0.681, 0.619],
          "Golpe Baixo": [0.744, 0.658],
        },
        ligacoes: [[null, "Bolso Furado"], ["Bolso Furado", "Areia nos Olhos"], ["Areia nos Olhos", "Escapada"], ["Escapada", "Golpe Baixo"]],
        ramos: {
          "Vigarista": { estrelas: { "Conversa de Bolso": [0.777, 0.725], "Identidade Emprestada": [0.808, 0.79], "O Golpe Grande": [0.84, 0.855] }, ligacoes: [[null, "Conversa de Bolso"], ["Conversa de Bolso", "Identidade Emprestada"], ["Identidade Emprestada", "O Golpe Grande"]] },
          "Mestre das Fechaduras": { estrelas: { "Nenhuma Porta": [0.819, 0.658], "Armadilha Devolvida": [0.891, 0.658], "Chave de Tudo": [0.963, 0.658] }, ligacoes: [[null, "Nenhuma Porta"], ["Nenhuma Porta", "Armadilha Devolvida"], ["Armadilha Devolvida", "Chave de Tudo"]] },
        },
      },
    },
  },
  "Clérigo": {
    figura: "o cálice",
    raiz: "Cura Leve",
    estrelas: {
      "Cura Leve": [0.5, 0.44],
      "Luz Sagrada": [0.41, 0.44],
      "Bênção": [0.59, 0.44],
      "Escudo da Fé": [0.5, 0.36],
      "Purificar": [0.5, 0.28],
      "Golpe Sagrado": [0.4, 0.23],
      "Palavra de Coragem": [0.6, 0.23],
      "Círculo Sagrado": [0.33, 0.13],
      "Julgamento": [0.67, 0.13],
      "Intervenção": [0.42, 0.07],
      "Ressurreição Menor": [0.58, 0.07],
      "Ira Divina": [0.5, 0.14],
    },
    ligacoes: [["Luz Sagrada", "Cura Leve"], ["Cura Leve", "Bênção"], ["Cura Leve", "Escudo da Fé"], ["Escudo da Fé", "Purificar"], ["Purificar", "Golpe Sagrado"], ["Purificar", "Palavra de Coragem"], ["Golpe Sagrado", "Círculo Sagrado"], ["Palavra de Coragem", "Julgamento"], ["Círculo Sagrado", "Intervenção"], ["Julgamento", "Ressurreição Menor"], ["Intervenção", "Ira Divina"], ["Ira Divina", "Ressurreição Menor"]],
    bracos: {
      "Sacerdote": {
        estrelas: {
          "Cura Maior": [0.433, 0.52],
          "Palavra de Alívio": [0.379, 0.573],
          "Aura de Vida": [0.319, 0.619],
          "Chamar de Volta": [0.256, 0.658],
        },
        ligacoes: [[null, "Cura Maior"], ["Cura Maior", "Palavra de Alívio"], ["Palavra de Alívio", "Aura de Vida"], ["Aura de Vida", "Chamar de Volta"]],
        ramos: {
          "Curandeiro": { estrelas: { "Mãos que Não Cansam": [0.181, 0.658], "Vida Emprestada": [0.109, 0.658], "Aurora Restauradora": [0.037, 0.658] }, ligacoes: [[null, "Mãos que Não Cansam"], ["Mãos que Não Cansam", "Vida Emprestada"], ["Vida Emprestada", "Aurora Restauradora"]] },
          "Protetor": { estrelas: { "Manto de Luz": [0.223, 0.725], "Fé Compartilhada": [0.192, 0.79], "Baluarte Sagrado": [0.16, 0.855] }, ligacoes: [[null, "Manto de Luz"], ["Manto de Luz", "Fé Compartilhada"], ["Fé Compartilhada", "Baluarte Sagrado"]] },
        },
      },
      "Paladino": {
        estrelas: {
          "Golpe Consagrado": [0.5, 0.545],
          "Escudo da Aurora": [0.5, 0.62],
          "Juramento Radiante": [0.5, 0.695],
          "Julgamento": [0.5, 0.77],
        },
        ligacoes: [[null, "Golpe Consagrado"], ["Golpe Consagrado", "Escudo da Aurora"], ["Escudo da Aurora", "Juramento Radiante"], ["Juramento Radiante", "Julgamento"]],
        ramos: {
          "Juramento da Aurora": { estrelas: { "Lâmina de Amanhecer": [0.46, 0.834], "Luz que Não Recua": [0.422, 0.895], "Julgamento da Aurora": [0.384, 0.956] }, ligacoes: [[null, "Lâmina de Amanhecer"], ["Lâmina de Amanhecer", "Luz que Não Recua"], ["Luz que Não Recua", "Julgamento da Aurora"]] },
          "Vingador": { estrelas: { "Dívida de Sangue": [0.54, 0.834], "Perseguição Sagrada": [0.578, 0.895], "Cobrança Final": [0.616, 0.956] }, ligacoes: [[null, "Dívida de Sangue"], ["Dívida de Sangue", "Perseguição Sagrada"], ["Perseguição Sagrada", "Cobrança Final"]] },
        },
      },
      "Inquisidor": {
        estrelas: {
          "Marca do Ímpio": [0.567, 0.52],
          "Correntes Sagradas": [0.621, 0.573],
          "Interrogatório": [0.681, 0.619],
          "Banimento": [0.744, 0.658],
        },
        ligacoes: [[null, "Marca do Ímpio"], ["Marca do Ímpio", "Correntes Sagradas"], ["Correntes Sagradas", "Interrogatório"], ["Interrogatório", "Banimento"]],
        ramos: {
          "Caçador de Demônios": { estrelas: { "Olho que Enxerga": [0.777, 0.725], "Selo de Interdito": [0.808, 0.79], "Volta ao Abismo": [0.84, 0.855] }, ligacoes: [[null, "Olho que Enxerga"], ["Olho que Enxerga", "Selo de Interdito"], ["Selo de Interdito", "Volta ao Abismo"]] },
          "Exorcista": { estrelas: { "Palavra que Expulsa": [0.819, 0.658], "Corrente de Ritos": [0.891, 0.658], "Nome Verdadeiro": [0.963, 0.658] }, ligacoes: [[null, "Palavra que Expulsa"], ["Palavra que Expulsa", "Corrente de Ritos"], ["Corrente de Ritos", "Nome Verdadeiro"]] },
        },
      },
    },
  },
  "Caçador": {
    figura: "o arco",
    raiz: "Tiro Preciso",
    estrelas: {
      "Tiro Preciso": [0.5, 0.44],
      "Rastrear": [0.5, 0.365],
      "Armadilha": [0.5, 0.29],
      "Tiro Duplo": [0.27, 0.33],
      "Marca do Caçador": [0.73, 0.33],
      "Camuflagem": [0.31, 0.22],
      "Companheiro Animal": [0.69, 0.22],
      "Flecha Perfurante": [0.39, 0.15],
      "Tiro Paralisante": [0.61, 0.15],
      "Emboscada": [0.5, 0.21],
      "Chuva de Flechas": [0.5, 0.12],
      "Tiro do Fim": [0.5, 0.04],
    },
    ligacoes: [["Tiro Preciso", "Rastrear"], ["Rastrear", "Armadilha"], ["Armadilha", "Emboscada"], ["Emboscada", "Chuva de Flechas"], ["Chuva de Flechas", "Tiro do Fim"], ["Tiro Preciso", "Tiro Duplo"], ["Tiro Preciso", "Marca do Caçador"], ["Tiro Duplo", "Camuflagem"], ["Camuflagem", "Flecha Perfurante"], ["Flecha Perfurante", "Chuva de Flechas"], ["Marca do Caçador", "Companheiro Animal"], ["Companheiro Animal", "Tiro Paralisante"], ["Tiro Paralisante", "Chuva de Flechas"]],
    bracos: {
      "Arqueiro": {
        estrelas: {
          "Tiro Duplo": [0.433, 0.52],
          "Flecha Perfurante": [0.379, 0.573],
          "Chuva de Flechas": [0.319, 0.619],
          "Tiro do Fim": [0.256, 0.658],
        },
        ligacoes: [[null, "Tiro Duplo"], ["Tiro Duplo", "Flecha Perfurante"], ["Flecha Perfurante", "Chuva de Flechas"], ["Chuva de Flechas", "Tiro do Fim"]],
        ramos: {
          "Tiro Certeiro": { estrelas: { "Olho que Mede o Vento": [0.181, 0.658], "Flecha na Junta": [0.109, 0.658], "Disparo Definidor": [0.037, 0.658] }, ligacoes: [[null, "Olho que Mede o Vento"], ["Olho que Mede o Vento", "Flecha na Junta"], ["Flecha na Junta", "Disparo Definidor"]] },
          "Chuva de Flechas": { estrelas: { "Salva Rápida": [0.223, 0.725], "Céu Escuro": [0.192, 0.79], "Tempestade de Hastes": [0.16, 0.855] }, ligacoes: [[null, "Salva Rápida"], ["Salva Rápida", "Céu Escuro"], ["Céu Escuro", "Tempestade de Hastes"]] },
        },
      },
      "Domador": {
        estrelas: {
          "Chamado Selvagem": [0.5, 0.545],
          "Vínculo de Presa": [0.5, 0.62],
          "Investida da Alcateia": [0.5, 0.695],
          "Fera Ancestral": [0.5, 0.77],
        },
        ligacoes: [[null, "Chamado Selvagem"], ["Chamado Selvagem", "Vínculo de Presa"], ["Vínculo de Presa", "Investida da Alcateia"], ["Investida da Alcateia", "Fera Ancestral"]],
        ramos: {
          "Vínculo Selvagem": { estrelas: { "Duas Almas": [0.46, 0.834], "Ferida Compartilhada": [0.422, 0.895], "Forma Conjunta": [0.384, 0.956] }, ligacoes: [[null, "Duas Almas"], ["Duas Almas", "Ferida Compartilhada"], ["Ferida Compartilhada", "Forma Conjunta"]] },
          "Alcateia": { estrelas: { "Chamado do Bando": [0.54, 0.834], "Cerco de Presas": [0.578, 0.895], "Uivo do Alfa": [0.616, 0.956] }, ligacoes: [[null, "Chamado do Bando"], ["Chamado do Bando", "Cerco de Presas"], ["Cerco de Presas", "Uivo do Alfa"]] },
        },
      },
      "Rastreador": {
        estrelas: {
          "Farejar Presa": [0.567, 0.52],
          "Armadilha de Corda": [0.621, 0.573],
          "Terreno Conhecido": [0.681, 0.619],
          "Golpe do Predador": [0.744, 0.658],
        },
        ligacoes: [[null, "Farejar Presa"], ["Farejar Presa", "Armadilha de Corda"], ["Armadilha de Corda", "Terreno Conhecido"], ["Terreno Conhecido", "Golpe do Predador"]],
        ramos: {
          "Caçador de Recompensas": { estrelas: { "Contrato Aberto": [0.777, 0.725], "Amarras de Captura": [0.808, 0.79], "Cobrança em Dobro": [0.84, 0.855] }, ligacoes: [[null, "Contrato Aberto"], ["Contrato Aberto", "Amarras de Captura"], ["Amarras de Captura", "Cobrança em Dobro"]] },
          "Guia do Ermo": { estrelas: { "Leitura de Rastro": [0.819, 0.658], "Acampamento Seguro": [0.891, 0.658], "O Ermo é Meu": [0.963, 0.658] }, ligacoes: [[null, "Leitura de Rastro"], ["Leitura de Rastro", "Acampamento Seguro"], ["Acampamento Seguro", "O Ermo é Meu"]] },
        },
      },
    },
  },
  "Bardo": {
    figura: "a lira",
    raiz: "Inspiração",
    estrelas: {
      "Inspiração": [0.5, 0.44],
      "Palavra Cortante": [0.4, 0.4],
      "Canção Curativa": [0.6, 0.4],
      "Lábia": [0.34, 0.31],
      "Melodia Confusa": [0.66, 0.31],
      "Conhecimento Vasto": [0.33, 0.21],
      "Hino de Guerra": [0.67, 0.21],
      "Contra-Canção": [0.37, 0.12],
      "Sussurro Fatal": [0.63, 0.12],
      "Fascínio": [0.3, 0.055],
      "Balada do Herói": [0.7, 0.055],
      "Última Estrofe": [0.5, 0.14],
    },
    ligacoes: [["Inspiração", "Palavra Cortante"], ["Palavra Cortante", "Lábia"], ["Lábia", "Conhecimento Vasto"], ["Conhecimento Vasto", "Contra-Canção"], ["Contra-Canção", "Fascínio"], ["Inspiração", "Canção Curativa"], ["Canção Curativa", "Melodia Confusa"], ["Melodia Confusa", "Hino de Guerra"], ["Hino de Guerra", "Sussurro Fatal"], ["Sussurro Fatal", "Balada do Herói"], ["Contra-Canção", "Última Estrofe"], ["Última Estrofe", "Sussurro Fatal"], ["Inspiração", "Última Estrofe"]],
    bracos: {
      "Menestrel": {
        estrelas: {
          "Canção de Ninar": [0.433, 0.52],
          "Refrão Curativo": [0.379, 0.573],
          "Hino da Vitória": [0.319, 0.619],
          "Ópera Final": [0.256, 0.658],
        },
        ligacoes: [[null, "Canção de Ninar"], ["Canção de Ninar", "Refrão Curativo"], ["Refrão Curativo", "Hino da Vitória"], ["Hino da Vitória", "Ópera Final"]],
        ramos: {
          "Canto de Cura": { estrelas: { "Melodia que Fecha Feridas": [0.181, 0.658], "Refrão Teimoso": [0.109, 0.658], "Réquiem ao Contrário": [0.037, 0.658] }, ligacoes: [[null, "Melodia que Fecha Feridas"], ["Melodia que Fecha Feridas", "Refrão Teimoso"], ["Refrão Teimoso", "Réquiem ao Contrário"]] },
          "Hino de Guerra": { estrelas: { "Marcha Sem Recuo": [0.223, 0.725], "Tambor de Investida": [0.192, 0.79], "Hino Final": [0.16, 0.855] }, ligacoes: [[null, "Marcha Sem Recuo"], ["Marcha Sem Recuo", "Tambor de Investida"], ["Tambor de Investida", "Hino Final"]] },
        },
      },
      "Cronista": {
        estrelas: {
          "Ler a Cena": [0.5, 0.545],
          "Citação Oportuna": [0.5, 0.62],
          "Página Viva": [0.5, 0.695],
          "Escrever o Feito": [0.5, 0.77],
        },
        ligacoes: [[null, "Ler a Cena"], ["Ler a Cena", "Citação Oportuna"], ["Citação Oportuna", "Página Viva"], ["Página Viva", "Escrever o Feito"]],
        ramos: {
          "Erudito": { estrelas: { "Já Li Sobre Isso": [0.46, 0.834], "Nota de Rodapé": [0.422, 0.895], "Biblioteca Viva": [0.384, 0.956] }, ligacoes: [[null, "Já Li Sobre Isso"], ["Já Li Sobre Isso", "Nota de Rodapé"], ["Nota de Rodapé", "Biblioteca Viva"]] },
          "Contador de Segredos": { estrelas: { "Boato Plantado": [0.54, 0.834], "O Que Você Esconde": [0.578, 0.895], "Verdade Pública": [0.616, 0.956] }, ligacoes: [[null, "Boato Plantado"], ["Boato Plantado", "O Que Você Esconde"], ["O Que Você Esconde", "Verdade Pública"]] },
        },
      },
      "Encantador": {
        estrelas: {
          "Sussurro Doce": [0.567, 0.52],
          "Ordem Irresistível": [0.621, 0.573],
          "Máscara Social": [0.681, 0.619],
          "Corte de Marionetes": [0.744, 0.658],
        },
        ligacoes: [[null, "Sussurro Doce"], ["Sussurro Doce", "Ordem Irresistível"], ["Ordem Irresistível", "Máscara Social"], ["Máscara Social", "Corte de Marionetes"]],
        ramos: {
          "Sedutor": { estrelas: { "Olhar que Prende": [0.777, 0.725], "Favor Concedido": [0.808, 0.79], "Corte Encantada": [0.84, 0.855] }, ligacoes: [[null, "Olhar que Prende"], ["Olhar que Prende", "Favor Concedido"], ["Favor Concedido", "Corte Encantada"]] },
          "Manipulador": { estrelas: { "Sugestão Plantada": [0.819, 0.658], "Discórdia": [0.891, 0.658], "Marionete": [0.963, 0.658] }, ligacoes: [[null, "Sugestão Plantada"], ["Sugestão Plantada", "Discórdia"], ["Discórdia", "Marionete"]] },
        },
      },
    },
  },
  "Monge": {
    figura: "o círculo aberto",
    raiz: "Rajada de Golpes",
    estrelas: {
      "Rajada de Golpes": [0.5, 0.435],
      "Defesa Fluida": [0.399, 0.406],
      "Passo do Vento": [0.329, 0.328],
      "Golpe Atordoante": [0.311, 0.225],
      "Foco Interior": [0.35, 0.128],
      "Corpo de Ferro": [0.435, 0.066],
      "Palma Trovejante": [0.54, 0.059],
      "Mente Serena": [0.632, 0.108],
      "Cem Punhos": [0.684, 0.199],
      "Toque da Quietude": [0.601, 0.406],
      "Corpo Imortal": [0.671, 0.328],
      "Palma dos Sete Ventos": [0.5, 0.245],
    },
    ligacoes: [["Rajada de Golpes", "Defesa Fluida"], ["Defesa Fluida", "Passo do Vento"], ["Passo do Vento", "Golpe Atordoante"], ["Golpe Atordoante", "Foco Interior"], ["Foco Interior", "Corpo de Ferro"], ["Corpo de Ferro", "Palma Trovejante"], ["Palma Trovejante", "Mente Serena"], ["Mente Serena", "Cem Punhos"], ["Rajada de Golpes", "Toque da Quietude"], ["Toque da Quietude", "Corpo Imortal"], ["Palma dos Sete Ventos", "Rajada de Golpes"]],
    bracos: {
      "Punho de Ferro": {
        estrelas: {
          "Rajada de Golpes": [0.433, 0.515],
          "Palma Atordoante": [0.379, 0.568],
          "Punho que Rompe": [0.319, 0.614],
          "Punho da Montanha": [0.256, 0.653],
        },
        ligacoes: [[null, "Rajada de Golpes"], ["Rajada de Golpes", "Palma Atordoante"], ["Palma Atordoante", "Punho que Rompe"], ["Punho que Rompe", "Punho da Montanha"]],
        ramos: {
          "Mão Aberta": { estrelas: { "Palma que Desloca": [0.181, 0.653], "Sequência de Cinco": [0.109, 0.653], "Toque do Fim": [0.037, 0.653] }, ligacoes: [[null, "Palma que Desloca"], ["Palma que Desloca", "Sequência de Cinco"], ["Sequência de Cinco", "Toque do Fim"]] },
          "Quebra-Montanhas": { estrelas: { "Punho de Pedra": [0.223, 0.72], "Impacto Sísmico": [0.192, 0.785], "Rachar o Mundo": [0.16, 0.85] }, ligacoes: [[null, "Punho de Pedra"], ["Punho de Pedra", "Impacto Sísmico"], ["Impacto Sísmico", "Rachar o Mundo"]] },
        },
      },
      "Andarilho": {
        estrelas: {
          "Passo do Vento": [0.5, 0.54],
          "Dança das Sombras": [0.5, 0.615],
          "Corrida Impossível": [0.5, 0.69],
          "Cem Passos": [0.5, 0.765],
        },
        ligacoes: [[null, "Passo do Vento"], ["Passo do Vento", "Dança das Sombras"], ["Dança das Sombras", "Corrida Impossível"], ["Corrida Impossível", "Cem Passos"]],
        ramos: {
          "Vento Veloz": { estrelas: { "Passo de Trinta Metros": [0.46, 0.829], "Vendaval de Punhos": [0.422, 0.89], "Mais Rápido que o Olho": [0.384, 0.951] }, ligacoes: [[null, "Passo de Trinta Metros"], ["Passo de Trinta Metros", "Vendaval de Punhos"], ["Vendaval de Punhos", "Mais Rápido que o Olho"]] },
          "Sombra Dançante": { estrelas: { "Passo entre Sombras": [0.54, 0.829], "Golpe do Escuro": [0.578, 0.89], "Dança Sem Vulto": [0.616, 0.951] }, ligacoes: [[null, "Passo entre Sombras"], ["Passo entre Sombras", "Golpe do Escuro"], ["Golpe do Escuro", "Dança Sem Vulto"]] },
        },
      },
      "Asceta": {
        estrelas: {
          "Corpo Sereno": [0.567, 0.515],
          "Mente Vazia": [0.621, 0.568],
          "Respiração de Ferro": [0.681, 0.614],
          "Vazio Perfeito": [0.744, 0.653],
        },
        ligacoes: [[null, "Corpo Sereno"], ["Corpo Sereno", "Mente Vazia"], ["Mente Vazia", "Respiração de Ferro"], ["Respiração de Ferro", "Vazio Perfeito"]],
        ramos: {
          "Corpo Imaculado": { estrelas: { "Carne Sem Veneno": [0.777, 0.72], "Fôlego de Aço": [0.808, 0.785], "Casulo de Chi": [0.84, 0.85] }, ligacoes: [[null, "Carne Sem Veneno"], ["Carne Sem Veneno", "Fôlego de Aço"], ["Fôlego de Aço", "Casulo de Chi"]] },
          "Mente Vazia": { estrelas: { "Silêncio Interior": [0.819, 0.653], "Antevisão": [0.891, 0.653], "Nada Me Alcança": [0.963, 0.653] }, ligacoes: [[null, "Silêncio Interior"], ["Silêncio Interior", "Antevisão"], ["Antevisão", "Nada Me Alcança"]] },
        },
      },
    },
  },
  "Druida": {
    figura: "o carvalho",
    raiz: "Espinhos",
    estrelas: {
      "Espinhos": [0.5, 0.44],
      "Toque Curativo": [0.5, 0.36],
      "Falar com Animais": [0.5, 0.28],
      "Forma Animal": [0.4, 0.22],
      "Chamado da Chuva": [0.6, 0.22],
      "Casca de Carvalho": [0.36, 0.3],
      "Enxame": [0.5, 0.19],
      "Raio Solar": [0.31, 0.15],
      "Emaranhar": [0.69, 0.15],
      "Renovação": [0.4, 0.1],
      "Fúria de Gaia": [0.6, 0.1],
      "Forma Ancestral": [0.5, 0.05],
    },
    ligacoes: [["Espinhos", "Toque Curativo"], ["Toque Curativo", "Falar com Animais"], ["Falar com Animais", "Enxame"], ["Enxame", "Forma Ancestral"], ["Falar com Animais", "Forma Animal"], ["Falar com Animais", "Chamado da Chuva"], ["Toque Curativo", "Casca de Carvalho"], ["Forma Animal", "Raio Solar"], ["Chamado da Chuva", "Emaranhar"], ["Enxame", "Renovação"], ["Enxame", "Fúria de Gaia"], ["Renovação", "Forma Ancestral"], ["Fúria de Gaia", "Forma Ancestral"], ["Raio Solar", "Renovação"], ["Emaranhar", "Fúria de Gaia"]],
    bracos: {
      "Metamorfo": {
        estrelas: {
          "Forma de Caça": [0.433, 0.52],
          "Couro Selvagem": [0.379, 0.573],
          "Forma Alada": [0.319, 0.619],
          "Fera Primordial": [0.256, 0.658],
        },
        ligacoes: [[null, "Forma de Caça"], ["Forma de Caça", "Couro Selvagem"], ["Couro Selvagem", "Forma Alada"], ["Forma Alada", "Fera Primordial"]],
        ramos: {
          "Forma Predadora": { estrelas: { "Presas do Bosque": [0.181, 0.658], "Faro de Sangue": [0.109, 0.658], "Besta Primordial": [0.037, 0.658] }, ligacoes: [[null, "Presas do Bosque"], ["Presas do Bosque", "Faro de Sangue"], ["Faro de Sangue", "Besta Primordial"]] },
          "Forma Alada": { estrelas: { "Asas de Tempestade": [0.223, 0.725], "Mergulho de Rapina": [0.192, 0.79], "Senhor do Céu": [0.16, 0.855] }, ligacoes: [[null, "Asas de Tempestade"], ["Asas de Tempestade", "Mergulho de Rapina"], ["Mergulho de Rapina", "Senhor do Céu"]] },
        },
      },
      "Xamã": {
        estrelas: {
          "Espírito Vigia": [0.5, 0.545],
          "Chamado do Trovão": [0.5, 0.62],
          "Vozes Ancestrais": [0.5, 0.695],
          "Tempestade Ancestral": [0.5, 0.77],
        },
        ligacoes: [[null, "Espírito Vigia"], ["Espírito Vigia", "Chamado do Trovão"], ["Chamado do Trovão", "Vozes Ancestrais"], ["Vozes Ancestrais", "Tempestade Ancestral"]],
        ramos: {
          "Espíritos Ancestrais": { estrelas: { "Conselho dos Antigos": [0.46, 0.834], "Totem de Guarda": [0.422, 0.895], "Marcha dos Ancestrais": [0.384, 0.956] }, ligacoes: [[null, "Conselho dos Antigos"], ["Conselho dos Antigos", "Totem de Guarda"], ["Totem de Guarda", "Marcha dos Ancestrais"]] },
          "Chamado da Tempestade": { estrelas: { "Raio Convocado": [0.54, 0.834], "Vendaval": [0.578, 0.895], "Coração da Tormenta": [0.616, 0.956] }, ligacoes: [[null, "Raio Convocado"], ["Raio Convocado", "Vendaval"], ["Vendaval", "Coração da Tormenta"]] },
        },
      },
      "Guardião": {
        estrelas: {
          "Raízes Agarradoras": [0.567, 0.52],
          "Bênção do Bosque": [0.621, 0.573],
          "Muralha de Espinhos": [0.681, 0.619],
          "Ira da Floresta": [0.744, 0.658],
        },
        ligacoes: [[null, "Raízes Agarradoras"], ["Raízes Agarradoras", "Bênção do Bosque"], ["Bênção do Bosque", "Muralha de Espinhos"], ["Muralha de Espinhos", "Ira da Floresta"]],
        ramos: {
          "Guardião do Bosque": { estrelas: { "Raízes que Prendem": [0.777, 0.725], "Cerca Viva": [0.808, 0.79], "O Bosque Acorda": [0.84, 0.855] }, ligacoes: [[null, "Raízes que Prendem"], ["Raízes que Prendem", "Cerca Viva"], ["Cerca Viva", "O Bosque Acorda"]] },
          "Semeador": { estrelas: { "Semente de Cura": [0.819, 0.658], "Terra Fértil": [0.891, 0.658], "Renascimento": [0.963, 0.658] }, ligacoes: [[null, "Semente de Cura"], ["Semente de Cura", "Terra Fértil"], ["Terra Fértil", "Renascimento"]] },
        },
      },
    },
  },
  "Feiticeiro": {
    figura: "a chama",
    raiz: "Rajada Instintiva",
    estrelas: {
      "Rajada Instintiva": [0.5, 0.44],
      "Pele Arcana": [0.4, 0.4],
      "Metamagia: Alcance": [0.6, 0.4],
      "Sopro Herdado": [0.34, 0.31],
      "Onda Caótica": [0.66, 0.31],
      "Metamagia: Gêmea": [0.36, 0.21],
      "Coração Tempestuoso": [0.62, 0.2],
      "Sangue Ardente": [0.43, 0.12],
      "Ressonância": [0.68, 0.1],
      "Forma Dracônica": [0.5, 0.32],
      "Tempestade Viva": [0.52, 0.22],
      "Explosão de Poder": [0.52, 0.04],
    },
    ligacoes: [["Rajada Instintiva", "Pele Arcana"], ["Pele Arcana", "Sopro Herdado"], ["Sopro Herdado", "Metamagia: Gêmea"], ["Metamagia: Gêmea", "Sangue Ardente"], ["Sangue Ardente", "Explosão de Poder"], ["Rajada Instintiva", "Metamagia: Alcance"], ["Metamagia: Alcance", "Onda Caótica"], ["Onda Caótica", "Coração Tempestuoso"], ["Coração Tempestuoso", "Ressonância"], ["Ressonância", "Explosão de Poder"], ["Rajada Instintiva", "Forma Dracônica"], ["Forma Dracônica", "Tempestade Viva"]],
    bracos: {
      "Linhagem Dracônica": {
        estrelas: {
          "Sopro de Brasa": [0.433, 0.52],
          "Escamas Ancestrais": [0.379, 0.573],
          "Asas de Cinza": [0.319, 0.619],
          "Presença Dracônica": [0.256, 0.658],
        },
        ligacoes: [[null, "Sopro de Brasa"], ["Sopro de Brasa", "Escamas Ancestrais"], ["Escamas Ancestrais", "Asas de Cinza"], ["Asas de Cinza", "Presença Dracônica"]],
        ramos: {
          "Coração de Brasa": { estrelas: { "Escamas em Brasa": [0.181, 0.658], "Sopro de Berço": [0.109, 0.658], "Sangue de Dragão": [0.037, 0.658] }, ligacoes: [[null, "Escamas em Brasa"], ["Escamas em Brasa", "Sopro de Berço"], ["Sopro de Berço", "Sangue de Dragão"]] },
          "Asa Ancestral": { estrelas: { "Asas de Escama": [0.223, 0.725], "Sombra de Asa": [0.192, 0.79], "Forma do Ancestral": [0.16, 0.855] }, ligacoes: [[null, "Asas de Escama"], ["Asas de Escama", "Sombra de Asa"], ["Sombra de Asa", "Forma do Ancestral"]] },
        },
      },
      "Alma da Tempestade": {
        estrelas: {
          "Toque Estático": [0.5, 0.545],
          "Passo do Relâmpago": [0.5, 0.62],
          "Corrente Saltitante": [0.5, 0.695],
          "Olho do Furacão": [0.5, 0.77],
        },
        ligacoes: [[null, "Toque Estático"], ["Toque Estático", "Passo do Relâmpago"], ["Passo do Relâmpago", "Corrente Saltitante"], ["Corrente Saltitante", "Olho do Furacão"]],
        ramos: {
          "Senhor dos Ventos": { estrelas: { "Corrente Ascendente": [0.46, 0.834], "Lâminas de Ar": [0.422, 0.895], "Ciclone Pessoal": [0.384, 0.956] }, ligacoes: [[null, "Corrente Ascendente"], ["Corrente Ascendente", "Lâminas de Ar"], ["Lâminas de Ar", "Ciclone Pessoal"]] },
          "Filho do Trovão": { estrelas: { "Estalo": [0.54, 0.834], "Corrente Viva": [0.578, 0.895], "Descarga Celeste": [0.616, 0.956] }, ligacoes: [[null, "Estalo"], ["Estalo", "Corrente Viva"], ["Corrente Viva", "Descarga Celeste"]] },
        },
      },
      "Magia Selvagem": {
        estrelas: {
          "Surto de Caos": [0.567, 0.52],
          "Sorte Torta": [0.621, 0.573],
          "Rajada Instável": [0.681, 0.619],
          "Maré do Acaso": [0.744, 0.658],
        },
        ligacoes: [[null, "Surto de Caos"], ["Surto de Caos", "Sorte Torta"], ["Sorte Torta", "Rajada Instável"], ["Rajada Instável", "Maré do Acaso"]],
        ramos: {
          "Onda de Caos": { estrelas: { "Surto Instável": [0.777, 0.725], "Reescrita Selvagem": [0.808, 0.79], "Caos Puro": [0.84, 0.855] }, ligacoes: [[null, "Surto Instável"], ["Surto Instável", "Reescrita Selvagem"], ["Reescrita Selvagem", "Caos Puro"]] },
          "Sorte Torta": { estrelas: { "Dado Virado": [0.819, 0.658], "Azar Alheio": [0.891, 0.658], "Improvável": [0.963, 0.658] }, ligacoes: [[null, "Dado Virado"], ["Dado Virado", "Azar Alheio"], ["Azar Alheio", "Improvável"]] },
        },
      },
    },
  },
  "Bruxo": {
    figura: "o crescente",
    raiz: "Explosão Mística",
    estrelas: {
      "Explosão Mística": [0.5, 0.442],
      "Armadura Sombria": [0.394, 0.386],
      "Maldição do Patrono": [0.519, 0.36],
      "Sussurros": [0.338, 0.28],
      "Corrente Infernal": [0.467, 0.271],
      "Passo Feérico": [0.354, 0.16],
      "Toque do Vazio": [0.485, 0.17],
      "Presença Aterradora": [0.435, 0.072],
      "Escudo do Pacto": [0.552, 0.046],
      "Dádiva Sombria": [0.645, 0.17],
      "Forma Abissal": [0.715, 0.25],
      "Cobrança": [0.645, 0.32],
    },
    ligacoes: [["Explosão Mística", "Armadura Sombria"], ["Armadura Sombria", "Sussurros"], ["Sussurros", "Passo Feérico"], ["Passo Feérico", "Presença Aterradora"], ["Presença Aterradora", "Escudo do Pacto"], ["Explosão Mística", "Maldição do Patrono"], ["Maldição do Patrono", "Corrente Infernal"], ["Corrente Infernal", "Toque do Vazio"], ["Toque do Vazio", "Escudo do Pacto"], ["Dádiva Sombria", "Forma Abissal"], ["Forma Abissal", "Cobrança"], ["Cobrança", "Dádiva Sombria"]],
    bracos: {
      "Pacto Infernal": {
        estrelas: {
          "Chama Contratual": [0.433, 0.522],
          "Preço de Sangue": [0.379, 0.575],
          "Marca do Contrato": [0.319, 0.621],
          "Cobrança de Alma": [0.256, 0.66],
        },
        ligacoes: [[null, "Chama Contratual"], ["Chama Contratual", "Preço de Sangue"], ["Preço de Sangue", "Marca do Contrato"], ["Marca do Contrato", "Cobrança de Alma"]],
        ramos: {
          "Chama Contratual": { estrelas: { "Fogo do Contrato": [0.181, 0.66], "Cláusula de Sangue": [0.109, 0.66], "Selo Infernal": [0.037, 0.66] }, ligacoes: [[null, "Fogo do Contrato"], ["Fogo do Contrato", "Cláusula de Sangue"], ["Cláusula de Sangue", "Selo Infernal"]] },
          "Cobrador de Almas": { estrelas: { "Penhora": [0.223, 0.727], "Moeda de Alma": [0.192, 0.792], "Livro-Caixa do Abismo": [0.16, 0.857] }, ligacoes: [[null, "Penhora"], ["Penhora", "Moeda de Alma"], ["Moeda de Alma", "Livro-Caixa do Abismo"]] },
        },
      },
      "Pacto Feérico": {
        estrelas: {
          "Riso Enganoso": [0.5, 0.547],
          "Passo de Névoa": [0.5, 0.622],
          "Espinhos do Bosque": [0.5, 0.697],
          "Corte Radiante": [0.5, 0.772],
        },
        ligacoes: [[null, "Riso Enganoso"], ["Riso Enganoso", "Passo de Névoa"], ["Passo de Névoa", "Espinhos do Bosque"], ["Espinhos do Bosque", "Corte Radiante"]],
        ramos: {
          "Enganador Radiante": { estrelas: { "Mentira Luminosa": [0.46, 0.836], "Presente Envenenado": [0.422, 0.897], "Corte de Espelhos": [0.384, 0.958] }, ligacoes: [[null, "Mentira Luminosa"], ["Mentira Luminosa", "Presente Envenenado"], ["Presente Envenenado", "Corte de Espelhos"]] },
          "Sombra do Bosque": { estrelas: { "Atalho de Orvalho": [0.54, 0.836], "Névoa de Encanto": [0.578, 0.897], "A Corte Cobra": [0.616, 0.958] }, ligacoes: [[null, "Atalho de Orvalho"], ["Atalho de Orvalho", "Névoa de Encanto"], ["Névoa de Encanto", "A Corte Cobra"]] },
        },
      },
      "Pacto do Abismo": {
        estrelas: {
          "Sussurro do Vazio": [0.567, 0.522],
          "Tentáculo Insone": [0.621, 0.575],
          "Olho que Não Dorme": [0.681, 0.621],
          "Boca do Abismo": [0.744, 0.66],
        },
        ligacoes: [[null, "Sussurro do Vazio"], ["Sussurro do Vazio", "Tentáculo Insone"], ["Tentáculo Insone", "Olho que Não Dorme"], ["Olho que Não Dorme", "Boca do Abismo"]],
        ramos: {
          "Voz do Vazio": { estrelas: { "Sussurro Errado": [0.777, 0.727], "Silêncio Que Grita": [0.808, 0.792], "Verbo Anterior": [0.84, 0.857] }, ligacoes: [[null, "Sussurro Errado"], ["Sussurro Errado", "Silêncio Que Grita"], ["Silêncio Que Grita", "Verbo Anterior"]] },
          "Olho Insone": { estrelas: { "Não Pisco": [0.819, 0.66], "Olhar que Consome": [0.891, 0.66], "Mil Olhos": [0.963, 0.66] }, ligacoes: [[null, "Não Pisco"], ["Não Pisco", "Olhar que Consome"], ["Olhar que Consome", "Mil Olhos"]] },
        },
      },
    },
  },
  "Engenheiro": {
    figura: "a engrenagem",
    raiz: "Disparo Calibrado",
    estrelas: {
      "Disparo Calibrado": [0.5, 0.44],
      "Escudo Dobrável": [0.5, 0.36],
      "Bomba de Fumaça": [0.405, 0.305],
      "Granada": [0.335, 0.345],
      "Autômato Sentinela": [0.405, 0.195],
      "Frasco de Ácido": [0.335, 0.155],
      "Elixir de Combate": [0.5, 0.14],
      "Mina Oculta": [0.5, 0.06],
      "Autômato Guardião": [0.595, 0.195],
      "Tiro Perfurante": [0.665, 0.155],
      "Barragem": [0.595, 0.305],
      "Obra-Prima": [0.665, 0.345],
    },
    ligacoes: [["Escudo Dobrável", "Bomba de Fumaça"], ["Bomba de Fumaça", "Autômato Sentinela"], ["Autômato Sentinela", "Elixir de Combate"], ["Elixir de Combate", "Autômato Guardião"], ["Autômato Guardião", "Barragem"], ["Barragem", "Escudo Dobrável"], ["Escudo Dobrável", "Disparo Calibrado"], ["Bomba de Fumaça", "Granada"], ["Autômato Sentinela", "Frasco de Ácido"], ["Elixir de Combate", "Mina Oculta"], ["Autômato Guardião", "Tiro Perfurante"], ["Barragem", "Obra-Prima"]],
    bracos: {
      "Artilheiro": {
        estrelas: {
          "Granada de Fragmentos": [0.433, 0.52],
          "Tiro Calibrado": [0.379, 0.573],
          "Fumaça Cegante": [0.319, 0.619],
          "Bombardeio": [0.256, 0.658],
        },
        ligacoes: [[null, "Granada de Fragmentos"], ["Granada de Fragmentos", "Tiro Calibrado"], ["Tiro Calibrado", "Fumaça Cegante"], ["Fumaça Cegante", "Bombardeio"]],
        ramos: {
          "Demolidor": { estrelas: { "Carga Modelada": [0.181, 0.658], "Barril na Linha": [0.109, 0.658], "Derrubada Controlada": [0.037, 0.658] }, ligacoes: [[null, "Carga Modelada"], ["Carga Modelada", "Barril na Linha"], ["Barril na Linha", "Derrubada Controlada"]] },
          "Franco-Atirador": { estrelas: { "Cano Longo": [0.223, 0.725], "Mira Assistida": [0.192, 0.79], "Um Tiro, Um Nome": [0.16, 0.855] }, ligacoes: [[null, "Cano Longo"], ["Cano Longo", "Mira Assistida"], ["Mira Assistida", "Um Tiro, Um Nome"]] },
        },
      },
      "Mecanista": {
        estrelas: {
          "Autômato de Bolso": [0.5, 0.545],
          "Torreta Improvisada": [0.5, 0.62],
          "Reparo de Campo": [0.5, 0.695],
          "Engrenagem Viva": [0.5, 0.77],
        },
        ligacoes: [[null, "Autômato de Bolso"], ["Autômato de Bolso", "Torreta Improvisada"], ["Torreta Improvisada", "Reparo de Campo"], ["Reparo de Campo", "Engrenagem Viva"]],
        ramos: {
          "Pai das Máquinas": { estrelas: { "Autômato de Guerra": [0.46, 0.834], "Oficina de Campo": [0.422, 0.895], "Legião de Engrenagens": [0.384, 0.956] }, ligacoes: [[null, "Autômato de Guerra"], ["Autômato de Guerra", "Oficina de Campo"], ["Oficina de Campo", "Legião de Engrenagens"]] },
          "Engrenagem Viva": { estrelas: { "Enxerto Mecânico": [0.54, 0.834], "Sobrecarga": [0.578, 0.895], "Homem-Máquina": [0.616, 0.956] }, ligacoes: [[null, "Enxerto Mecânico"], ["Enxerto Mecânico", "Sobrecarga"], ["Sobrecarga", "Homem-Máquina"]] },
        },
      },
      "Alquimista de Campo": {
        estrelas: {
          "Frasco Corrosivo": [0.567, 0.52],
          "Elixir de Campo": [0.621, 0.573],
          "Nuvem Tóxica": [0.681, 0.619],
          "Mistura Instável": [0.744, 0.658],
        },
        ligacoes: [[null, "Frasco Corrosivo"], ["Frasco Corrosivo", "Elixir de Campo"], ["Elixir de Campo", "Nuvem Tóxica"], ["Nuvem Tóxica", "Mistura Instável"]],
        ramos: {
          "Químico Louco": { estrelas: { "Mistura do Dia": [0.777, 0.725], "Elixir Duplo": [0.808, 0.79], "Reação em Cadeia": [0.84, 0.855] }, ligacoes: [[null, "Mistura do Dia"], ["Mistura do Dia", "Elixir Duplo"], ["Elixir Duplo", "Reação em Cadeia"]] },
          "Boticário de Guerra": { estrelas: { "Cinto Cheio": [0.819, 0.658], "Antídoto Universal": [0.891, 0.658], "Farmácia de Batalha": [0.963, 0.658] }, ligacoes: [[null, "Cinto Cheio"], ["Cinto Cheio", "Antídoto Universal"], ["Antídoto Universal", "Farmácia de Batalha"]] },
        },
      },
    },
  },
  "Invocador": {
    figura: "o portal",
    raiz: "Invocar Fera Menor",
    estrelas: {
      "Invocar Fera Menor": [0.5, 0.44],
      "Elo Vital": [0.36, 0.44],
      "Comando: Atacar": [0.64, 0.44],
      "Servo Elemental": [0.36, 0.34],
      "Espírito Guardião": [0.64, 0.34],
      "Enxame Espiritual": [0.36, 0.24],
      "Sacrifício Arcano": [0.64, 0.24],
      "Invocar Fera Maior": [0.4, 0.13],
      "Fusão Espiritual": [0.6, 0.13],
      "Portal Duplo": [0.5, 0.07],
      "Voz de Comando": [0.5, 0.28],
      "Avatar Ancestral": [0.5, 0.19],
    },
    ligacoes: [["Elo Vital", "Invocar Fera Menor"], ["Invocar Fera Menor", "Comando: Atacar"], ["Elo Vital", "Servo Elemental"], ["Servo Elemental", "Enxame Espiritual"], ["Enxame Espiritual", "Invocar Fera Maior"], ["Invocar Fera Maior", "Portal Duplo"], ["Comando: Atacar", "Espírito Guardião"], ["Espírito Guardião", "Sacrifício Arcano"], ["Sacrifício Arcano", "Fusão Espiritual"], ["Fusão Espiritual", "Portal Duplo"], ["Invocar Fera Menor", "Voz de Comando"], ["Voz de Comando", "Avatar Ancestral"]],
    bracos: {
      "Mestre das Feras": {
        estrelas: {
          "Chamado da Alcateia": [0.433, 0.52],
          "Presa Espiritual": [0.379, 0.573],
          "Elo de Sangue": [0.319, 0.619],
          "Colosso de Presa": [0.256, 0.658],
        },
        ligacoes: [[null, "Chamado da Alcateia"], ["Chamado da Alcateia", "Presa Espiritual"], ["Presa Espiritual", "Elo de Sangue"], ["Elo de Sangue", "Colosso de Presa"]],
        ramos: {
          "Alcateia Espiritual": { estrelas: { "Matilha de Névoa": [0.181, 0.658], "Elo de Matilha": [0.109, 0.658], "Caçada Sem Fim": [0.037, 0.658] }, ligacoes: [[null, "Matilha de Névoa"], ["Matilha de Névoa", "Elo de Matilha"], ["Elo de Matilha", "Caçada Sem Fim"]] },
          "Colosso de Presa": { estrelas: { "Chamar o Grande": [0.223, 0.725], "Rugido que Racha": [0.192, 0.79], "Pisada do Colosso": [0.16, 0.855] }, ligacoes: [[null, "Chamar o Grande"], ["Chamar o Grande", "Rugido que Racha"], ["Rugido que Racha", "Pisada do Colosso"]] },
        },
      },
      "Conjurador Elemental": {
        estrelas: {
          "Servo de Chama": [0.5, 0.545],
          "Punho de Terra": [0.5, 0.62],
          "Elemental Maior": [0.5, 0.695],
          "Pulso Primordial": [0.5, 0.77],
        },
        ligacoes: [[null, "Servo de Chama"], ["Servo de Chama", "Punho de Terra"], ["Punho de Terra", "Elemental Maior"], ["Elemental Maior", "Pulso Primordial"]],
        ramos: {
          "Coração Ígneo": { estrelas: { "Servo de Magma": [0.46, 0.834], "Chão em Chamas": [0.422, 0.895], "Elemental Primevo": [0.384, 0.956] }, ligacoes: [[null, "Servo de Magma"], ["Servo de Magma", "Chão em Chamas"], ["Chão em Chamas", "Elemental Primevo"]] },
          "Pulso da Terra": { estrelas: { "Servo de Granito": [0.54, 0.834], "Muralha Erguida": [0.578, 0.895], "Coração do Mundo": [0.616, 0.956] }, ligacoes: [[null, "Servo de Granito"], ["Servo de Granito", "Muralha Erguida"], ["Muralha Erguida", "Coração do Mundo"]] },
        },
      },
      "Chamador de Espíritos": {
        estrelas: {
          "Guia Ancestral": [0.567, 0.52],
          "Mão Fantasma": [0.621, 0.573],
          "Corte Fantasma": [0.681, 0.619],
          "Portal dos Mortos": [0.744, 0.658],
        },
        ligacoes: [[null, "Guia Ancestral"], ["Guia Ancestral", "Mão Fantasma"], ["Mão Fantasma", "Corte Fantasma"], ["Corte Fantasma", "Portal dos Mortos"]],
        ramos: {
          "Guia Ancestral": { estrelas: { "Voz do Antepassado": [0.777, 0.725], "Memória Emprestada": [0.808, 0.79], "Linhagem Convocada": [0.84, 0.855] }, ligacoes: [[null, "Voz do Antepassado"], ["Voz do Antepassado", "Memória Emprestada"], ["Memória Emprestada", "Linhagem Convocada"]] },
          "Corte Fantasma": { estrelas: { "Cortesãos de Bruma": [0.819, 0.658], "Baile dos Mortos": [0.891, 0.658], "Trono de Névoa": [0.963, 0.658] }, ligacoes: [[null, "Cortesãos de Bruma"], ["Cortesãos de Bruma", "Baile dos Mortos"], ["Baile dos Mortos", "Trono de Névoa"]] },
        },
      },
    },
  },
};

/* ONDE MORA CADA FIGURA quando há mais de uma classe. Unidades = o lado do
   quadrado da principal. A principal é a classe de origem (pers.classe); as
   outras vêm por ordem de degraus (ranksDoPersonagem), desempate pelo nome.
   As figuras de trás NÃO têm estrelas tocáveis: a figura inteira é UM botão
   («Trazer o Ladino para a frente») — a 0,48 as estrelas ficavam a 21 px. */
export const LUGAR_DAS_FIGURAS = {
  mesa: {
    duas: [{ x: 0, y: 0, escala: 1 }, { x: 1.04, y: 0.14, escala: 0.72 }],
    tres: [{ x: 0, y: 0, escala: 1 }, { x: 1.04, y: 0, escala: 0.48 }, { x: 1.04, y: 0.52, escala: 0.48 }],
  },
  telefone: {
    duas: [{ x: 0, y: 0, escala: 1 }, { x: 0.14, y: 1.06, escala: 0.72 }],
    tres: [{ x: 0, y: 0, escala: 1 }, { x: 0, y: 1.06, escala: 0.48 }, { x: 0.52, y: 1.06, escala: 0.48 }],
  },
  /* 4 ou mais: as de trás ficam na fila das «tres», e o resto entra pela troca */
};

/* ---------- as funções ---------- */
const d2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/* As estrelas e as ligações À VISTA, com a chave do nó real. */
export function ceuDaClasse(classe, { sub = null, esp = null } = {}) {
  const f = FIGURAS_DA_CONSTELACAO[classe];
  if (!f) return { estrelas: [], ligacoes: [] };
  const estrelas = [], ligacoes = [];
  const k = { classe: (n) => "classe:" + n, sub: (s, n) => `sub:${s}:${n}`, esp: (e, n) => `esp:${e}:${n}` };
  for (const [n, p] of Object.entries(f.estrelas)) estrelas.push({ chave: k.classe(n), nome: n, ramo: "classe", p });
  for (const [a, b] of f.ligacoes) ligacoes.push({ de: k.classe(a), para: k.classe(b), ramo: "classe" });
  const subs = sub ? [sub] : Object.keys(f.bracos);
  for (const s of subs) {
    const b = f.bracos[s]; if (!b) continue;
    const nomes = Object.keys(b.estrelas);
    for (const [n, p] of Object.entries(b.estrelas)) estrelas.push({ chave: k.sub(s, n), nome: n, ramo: "subclasse", sub: s, p });
    for (const [a, c] of b.ligacoes) ligacoes.push({ de: a === null ? k.classe(f.raiz) : k.sub(s, a), para: k.sub(s, c), ramo: "subclasse", sub: s, nascenca: a === null });
    if (!sub) continue;
    const esps = esp ? [esp] : Object.keys(b.ramos);
    for (const e of esps) {
      const r = b.ramos[e]; if (!r) continue;
      for (const [n, p] of Object.entries(r.estrelas)) estrelas.push({ chave: k.esp(e, n), nome: n, ramo: "especializacao", sub: s, esp: e, p });
      for (const [a, c] of r.ligacoes) ligacoes.push({ de: a === null ? k.sub(s, nomes[nomes.length - 1]) : k.esp(e, a), para: k.esp(e, c), ramo: "especializacao", sub: s, esp: e, nascenca: a === null });
    }
  }
  return { estrelas, ligacoes };
}

/* Mede de novo: dentro da borda e a distância mínima, em cada conjunto que pode estar à vista. */
export function validarCeu() {
  const erros = [];
  const medir = (rot, es) => {
    for (const e of es) if (e.p.some((v) => v < BRACO_E_RAMO.borda[0] || v > BRACO_E_RAMO.borda[1])) erros.push(`${rot}: ${e.chave} fora`);
    for (let i = 0; i < es.length; i++) for (let j = i + 1; j < es.length; j++)
      if (d2(es[i].p, es[j].p) < BRACO_E_RAMO.minimo - 0.0015) erros.push(`${rot}: ${es[i].chave} ~ ${es[j].chave}`);
  };
  for (const [classe, f] of Object.entries(FIGURAS_DA_CONSTELACAO)) {
    medir(classe, ceuDaClasse(classe).estrelas);
    for (const s of Object.keys(f.bracos)) {
      medir(`${classe}/${s}`, ceuDaClasse(classe, { sub: s }).estrelas);
      for (const e of Object.keys(f.bracos[s].ramos)) medir(`${classe}/${s}/${e}`, ceuDaClasse(classe, { sub: s, esp: e }).estrelas);
    }
  }
  return erros;
}

/* O desenho, para o Figma e para conferir: `acesas` e `disponiveis` são Sets de
   chaves; `cores` traz os hex (no código vêm de CONSTELACAO / T / GEMA_DA_SUBCLASSE). */
export function svgDoCeu(classe, { sub = null, esp = null, acesas = new Set(), disponiveis = new Set(), escolhida = null, lado = 640, gema = null, cores, r = { acesa: 5, halo: 16, disponivel: 7, apagada: 2.5, anel: 12 }, rotulos = true } = {}) {
  const c = cores;
  const { estrelas, ligacoes } = ceuDaClasse(classe, { sub, esp });
  const P = Object.fromEntries(estrelas.map((e) => [e.chave, e]));
  const X = (p) => Math.round(p[0] * lado * 10) / 10, Y = (p) => Math.round(p[1] * lado * 10) / 10;
  const corDo = (e, forte) => e.ramo === "classe" ? (forte ? c.ouroClaro : c.ouroMeio) : e.ramo === "subclasse" ? (forte ? gema(e.sub).luz : gema(e.sub).corpo) : (forte ? c.prataClaro : c.prataMeio);
  let s = "";
  for (const l of ligacoes) {
    const a = P[l.de], b = P[l.para]; if (!a || !b) continue;
    const acesa = acesas.has(l.para) && (l.nascenca || acesas.has(l.de));
    s += acesa
      ? `<line x1="${X(a.p)}" y1="${Y(a.p)}" x2="${X(b.p)}" y2="${Y(b.p)}" stroke="${corDo(b, false)}" stroke-width="2" stroke-linecap="round"/>`
      : `<line x1="${X(a.p)}" y1="${Y(a.p)}" x2="${X(b.p)}" y2="${Y(b.p)}" stroke="${c.lineStrong}" stroke-width="1" stroke-dasharray="3 5"/>`;
  }
  for (const e of estrelas) {
    const x = X(e.p), y = Y(e.p), cor = corDo(e, true);
    if (acesas.has(e.chave)) s += `<circle cx="${x}" cy="${y}" r="${r.halo}" fill="${cor}" fill-opacity=".18"/><circle cx="${x}" cy="${y}" r="${r.acesa}" fill="${cor}"/>`;
    else if (disponiveis.has(e.chave)) s += `<circle cx="${x}" cy="${y}" r="${r.disponivel}" fill="none" stroke="${c.amber}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r.apagada}" fill="${c.inkDim}"/>`;
    else s += `<circle cx="${x}" cy="${y}" r="${r.apagada}" fill="${c.inkDim}"/>`;
    if (escolhida === e.chave) s += `<circle cx="${x}" cy="${y}" r="${r.anel}" fill="none" stroke="${c.ouroClaro}" stroke-width="2"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}">${s}</svg>`;
}
