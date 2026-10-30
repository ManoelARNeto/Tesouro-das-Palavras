export const STAGES = [
  {
    id:'praia-naufragos', number:1, name:'Praia dos Náufragos', biome:'beach', cols:60, rows:44,
    start:{col:7,row:35}, stageHint:'Use o mapa antigo para localizar três tesouros escondidos entre praia, ponte e caverna.',
    landmarks:[
      {id:'acampamento', label:'Acampamento', type:'tent', col:8,row:35, icon:'camp', signText:'O primeiro mapa sempre parte do acampamento.'},
      {id:'ponte', label:'Ponte de Madeira', type:'sign', col:18,row:30, icon:'bridge', signText:'Uma ponte simples liga a praia à trilha do interior.'},
      {id:'palmeiras', label:'Trio de Palmeiras', type:'palm', col:27,row:28, icon:'palms'},
      {id:'pedras', label:'Três Pedras', type:'rock', col:34,row:24, icon:'rocks'},
      {id:'caverna', label:'Entrada da Caverna', type:'rock', col:48,row:15, icon:'cave', signText:'O vento da caverna sopra sobre um solo antigo.'},
      {id:'cais', label:'Pequeno Cais', type:'boat', col:5,row:39, icon:'waves'}
    ],
    roads:[[[8,35],[12,33],[18,30],[24,29],[27,28]], [[27,28],[31,26],[34,24],[41,20],[48,15]]],
    treasures:[
      {id:'s1-t1', difficulty:'Fácil', name:'Tesouro da Maré Baixa', col:16,row:33,
       clue:'Partindo do acampamento, siga até a ponte de madeira. Cave duas casas ao sul da ponte, perto da areia clara.',
       route:['acampamento','ponte']},
      {id:'s1-t2', difficulty:'Médio', name:'Tesouro das Palmeiras', col:30,row:26,
       clue:'Da ponte, avance pela trilha até o trio de palmeiras. O tesouro está escondido a leste das palmeiras e ao norte das três pedras.',
       route:['ponte','palmeiras','pedras']},
      {id:'s1-t3', difficulty:'Difícil', name:'Tesouro da Caverna', col:45,row:18,
       clue:'Passe pelas três pedras e siga para a entrada da caverna. Cave ao sudoeste da caverna, antes do paredão rochoso.',
       route:['palmeiras','pedras','caverna']}
    ]
  },
  {
    id:'bosque-lua-verde', number:2, name:'Bosque da Lua Verde', biome:'forest', cols:60, rows:44,
    start:{col:8,row:36}, stageHint:'As trilhas do bosque se cruzam entre cogumelos, troncos e um círculo de pedras.',
    landmarks:[
      {id:'clareira', label:'Clareira Inicial', type:'tent', col:8,row:36, icon:'camp', signText:'As marcas de botas seguem para o interior do bosque.'},
      {id:'tronco', label:'Tronco Caído', type:'log', col:18,row:32, icon:'log'},
      {id:'cogumelos', label:'Cogumelos Luminosos', type:'mushroom', col:28,row:27, icon:'mushroom'},
      {id:'pedras', label:'Círculo de Pedras', type:'rock', col:40,row:22, icon:'stones', signText:'Quando a trilha se abre, observe o círculo de pedras.'},
      {id:'ruina', label:'Ruína Coberta', type:'pillar', col:49,row:16, icon:'ruin'}
    ],
    roads:[[[8,36],[13,35],[18,32],[23,29],[28,27]], [[28,27],[34,25],[40,22],[45,19],[49,16]]],
    treasures:[
      {id:'s2-t1', difficulty:'Fácil', name:'Tesouro do Tronco', col:20,row:34,
       clue:'Saia da clareira e encontre o tronco caído. Cave logo depois dele, do lado direito da trilha.',
       route:['clareira','tronco']},
      {id:'s2-t2', difficulty:'Médio', name:'Tesouro dos Cogumelos', col:31,row:29,
       clue:'Siga o caminho até os cogumelos luminosos. O tesouro está ao sul deles, entre a trilha e os arbustos.',
       route:['tronco','cogumelos']},
      {id:'s2-t3', difficulty:'Difícil', name:'Tesouro do Círculo Antigo', col:44,row:20,
       clue:'Passe pelos cogumelos, chegue ao círculo de pedras e procure o solo macio entre o círculo e a ruína coberta.',
       route:['cogumelos','pedras','ruina']}
    ]
  },
  {
    id:'lagoa-espelhos', number:3, name:'Lagoa dos Espelhos', biome:'lagoon', cols:60, rows:44,
    start:{col:7,row:34}, stageHint:'Pontes de madeira e juncos cercam as águas calmas da lagoa.',
    landmarks:[
      {id:'cais', label:'Cais da Lagoa', type:'boat', col:7,row:35, icon:'waves'},
      {id:'junco', label:'Campo de Juncos', type:'reeds', col:19,row:31, icon:'reeds'},
      {id:'ponte', label:'Ponte Curva', type:'sign', col:29,row:27, icon:'bridge', signText:'A ponte curva divide as duas margens.'},
      {id:'ilha', label:'Ilhota Central', type:'palm', col:36,row:24, icon:'isle'},
      {id:'pedras', label:'Pedras Brancas', type:'rock', col:48,row:19, icon:'rocks'}
    ],
    roads:[[[7,34],[12,33],[19,31],[24,29],[29,27]], [[29,27],[33,26],[36,24],[42,22],[48,19]]],
    treasures:[
      {id:'s3-t1', difficulty:'Fácil', name:'Tesouro dos Juncos', col:17,row:33,
       clue:'Partindo do cais, caminhe até o campo de juncos. Cave a oeste dos juncos, próximo à margem.',
       route:['cais','junco']},
      {id:'s3-t2', difficulty:'Médio', name:'Tesouro da Ponte Curva', col:31,row:29,
       clue:'Atravesse até a ponte curva. O tesouro está logo ao sul da ponte, onde a trilha toca a água.',
       route:['junco','ponte']},
      {id:'s3-t3', difficulty:'Difícil', name:'Tesouro da Ilhota', col:41,row:22,
       clue:'Da ponte, observe a ilhota central e as pedras brancas. Cave entre a ilhota e as pedras, do lado leste do caminho.',
       route:['ponte','ilha','pedras']}
    ]
  },
  {
    id:'ruinas-aurora', number:4, name:'Ruínas da Aurora', biome:'ruins', cols:60, rows:44,
    start:{col:9,row:36}, stageHint:'As ruínas escondem marcas antigas, pátios de pedra e pilares quebrados.',
    landmarks:[
      {id:'portao', label:'Portão Partido', type:'pillar', col:9,row:35, icon:'gate'},
      {id:'patio', label:'Pátio Central', type:'rune', col:22,row:29, icon:'plaza'},
      {id:'pilares', label:'Quatro Pilares', type:'pillar', col:35,row:24, icon:'pillars'},
      {id:'altar', label:'Altar Quebrado', type:'rune', col:47,row:18, icon:'altar', signText:'Nem todo segredo está no centro das ruínas.'},
      {id:'poço', label:'Poço Seco', type:'rock', col:27,row:20, icon:'well'}
    ],
    roads:[[[9,36],[15,33],[22,29]], [[22,29],[27,20],[35,24],[41,21],[47,18]]],
    treasures:[
      {id:'s4-t1', difficulty:'Fácil', name:'Tesouro do Portão', col:14,row:33,
       clue:'Entre pelo portão partido e siga até o pátio central. Cave no trecho de chão gasto entre o portão e o pátio.',
       route:['portao','patio']},
      {id:'s4-t2', difficulty:'Médio', name:'Tesouro do Poço', col:25,row:23,
       clue:'No pátio central, procure o poço seco. O tesouro está ao sul do poço, onde as pedras formam um quadrado.',
       route:['patio','poço']},
      {id:'s4-t3', difficulty:'Difícil', name:'Tesouro do Altar', col:43,row:20,
       clue:'Dos quatro pilares, siga para o altar quebrado. Cave antes do altar, a oeste, no limite entre o piso de ruína e a grama.',
       route:['poço','pilares','altar']}
    ]
  },
  {
    id:'caverna-rubra', number:5, name:'Caverna Rubra', biome:'cave', cols:60, rows:44,
    start:{col:8,row:37}, stageHint:'Uma trilha pedregosa conduz a uma caverna aberta, com passagens estreitas e marcas nas rochas.',
    landmarks:[
      {id:'entrada', label:'Entrada Rochosa', type:'rock', col:8,row:36, icon:'cave'},
      {id:'ponte', label:'Ponte de Pedra', type:'sign', col:20,row:31, icon:'bridge'},
      {id:'coluna', label:'Coluna Natural', type:'rock', col:31,row:26, icon:'pillar'},
      {id:'cristal', label:'Pedra Vermelha', type:'rune', col:42,row:22, icon:'gem'},
      {id:'saida', label:'Fenda do Fundo', type:'rock', col:50,row:15, icon:'cave', signText:'No fundo da caverna, o eco parece indicar outra passagem.'}
    ],
    roads:[[[8,37],[14,34],[20,31],[26,29],[31,26]], [[31,26],[36,24],[42,22],[46,19],[50,15]]],
    treasures:[
      {id:'s5-t1', difficulty:'Fácil', name:'Tesouro da Ponte de Pedra', col:18,row:33,
       clue:'Da entrada rochosa, siga até a ponte de pedra. Cave ao sul da ponte, junto às pequenas pedras soltas.',
       route:['entrada','ponte']},
      {id:'s5-t2', difficulty:'Médio', name:'Tesouro da Coluna', col:34,row:28,
       clue:'Passe pela ponte de pedra e chegue à coluna natural. O tesouro está enterrado a leste da coluna.',
       route:['ponte','coluna']},
      {id:'s5-t3', difficulty:'Difícil', name:'Tesouro da Fenda Rubra', col:46,row:18,
       clue:'Continue até a pedra vermelha e avance rumo à fenda do fundo. Cave antes da fenda, onde o chão fica mais claro.',
       route:['coluna','cristal','saida']}
    ]
  },
  {
    id:'dunas-sol', number:6, name:'Dunas do Sol', biome:'dunes', cols:60, rows:44,
    start:{col:8,row:35}, stageHint:'As dunas mudam o caminho; use palmeiras e pedras altas como referência.',
    landmarks:[
      {id:'oasis', label:'Pequeno Oásis', type:'palm', col:8,row:35, icon:'oasis'},
      {id:'arco', label:'Arco de Rochas', type:'rock', col:22,row:31, icon:'arch'},
      {id:'colina', label:'Duna Alta', type:'sign', col:31,row:24, icon:'dune'},
      {id:'obelisco', label:'Obelisco Enterrado', type:'pillar', col:43,row:20, icon:'obelisk'},
      {id:'cratera', label:'Cratera Seca', type:'rock', col:50,row:14, icon:'pit'}
    ],
    roads:[[[8,35],[14,34],[22,31],[27,28],[31,24]], [[31,24],[37,22],[43,20],[47,18],[50,14]]],
    treasures:[
      {id:'s6-t1', difficulty:'Fácil', name:'Tesouro do Oásis', col:13,row:33,
       clue:'Saia do pequeno oásis e siga em direção ao arco de rochas. Cave antes do arco, numa faixa de areia mais escura.',
       route:['oasis','arco']},
      {id:'s6-t2', difficulty:'Médio', name:'Tesouro da Duna Alta', col:29,row:27,
       clue:'Do arco de rochas, caminhe até a duna alta. O tesouro está ao sudoeste da duna, onde o caminho faz uma curva.',
       route:['arco','colina']},
      {id:'s6-t3', difficulty:'Difícil', name:'Tesouro do Obelisco', col:45,row:17,
       clue:'Depois da duna alta, procure o obelisco enterrado e a cratera seca. Cave entre os dois marcos, mais perto do obelisco.',
       route:['colina','obelisco','cratera']}
    ]
  },
  {
    id:'pantano-sussurro', number:7, name:'Pântano do Sussurro', biome:'swamp', cols:60, rows:44,
    start:{col:8,row:36}, stageHint:'Águas rasas e troncos antigos escondem atalhos no pântano.',
    landmarks:[
      {id:'cabana', label:'Cabana Abandonada', type:'tent', col:8,row:36, icon:'hut'},
      {id:'tronco', label:'Ponte de Troncos', type:'log', col:20,row:31, icon:'log'},
      {id:'junco', label:'Juncal Grande', type:'reeds', col:30,row:26, icon:'reeds'},
      {id:'arvore', label:'Árvore Torta', type:'tree', col:41,row:23, icon:'tree'},
      {id:'pedras', label:'Pedras do Sussurro', type:'rock', col:50,row:18, icon:'stones'}
    ],
    roads:[[[8,36],[14,34],[20,31],[25,28],[30,26]], [[30,26],[35,24],[41,23],[46,21],[50,18]]],
    treasures:[
      {id:'s7-t1', difficulty:'Fácil', name:'Tesouro da Cabana', col:16,row:34,
       clue:'Da cabana abandonada, siga até a ponte de troncos. Cave antes da ponte, perto da água rasa.',
       route:['cabana','tronco']},
      {id:'s7-t2', difficulty:'Médio', name:'Tesouro do Juncal', col:32,row:28,
       clue:'Atravesse a ponte de troncos e encontre o juncal grande. O tesouro está enterrado ao sul dos juncos.',
       route:['tronco','junco']},
      {id:'s7-t3', difficulty:'Difícil', name:'Tesouro da Árvore Torta', col:45,row:21,
       clue:'Siga da árvore torta em direção às pedras do sussurro. Cave entre a árvore e as pedras, ligeiramente ao norte da trilha.',
       route:['junco','arvore','pedras']}
    ]
  },
  {
    id:'penhascos-trovao', number:8, name:'Penhascos do Trovão', biome:'cliffs', cols:60, rows:44,
    start:{col:7,row:36}, stageHint:'Trilhas estreitas ligam penhascos, pontes e mirantes de pedra.',
    landmarks:[
      {id:'base', label:'Base do Penhasco', type:'tent', col:7,row:36, icon:'camp'},
      {id:'escada', label:'Escadaria Natural', type:'sign', col:18,row:31, icon:'stairs'},
      {id:'ponte', label:'Ponte Suspensa', type:'sign', col:30,row:24, icon:'bridge'},
      {id:'mirante', label:'Mirante Alto', type:'rock', col:43,row:18, icon:'cliff'},
      {id:'estalag', label:'Pedra Fendida', type:'rock', col:51,row:13, icon:'rock'}
    ],
    roads:[[[7,36],[13,34],[18,31],[24,28],[30,24]], [[30,24],[37,21],[43,18],[47,16],[51,13]]],
    treasures:[
      {id:'s8-t1', difficulty:'Fácil', name:'Tesouro da Escadaria', col:16,row:33,
       clue:'Suba pela escadaria natural. O tesouro está enterrado em sua base, junto ao primeiro patamar.',
       route:['base','escada']},
      {id:'s8-t2', difficulty:'Médio', name:'Tesouro da Ponte Suspensa', col:28,row:26,
       clue:'Chegue à ponte suspensa e procure uma área plana ao sul da travessia. Cave ali.',
       route:['escada','ponte']},
      {id:'s8-t3', difficulty:'Difícil', name:'Tesouro do Mirante', col:46,row:16,
       clue:'Da ponte suspensa, avance ao mirante alto e observe a pedra fendida. Cave entre o mirante e a pedra, junto à beira segura do caminho.',
       route:['ponte','mirante','estalag']}
    ]
  },
  {
    id:'jardins-oraculo', number:9, name:'Jardins do Oráculo', biome:'garden', cols:60, rows:44,
    start:{col:8,row:35}, stageHint:'Caminhos simétricos, canteiros e monumentos marcam os jardins antigos.',
    landmarks:[
      {id:'portal', label:'Portal dos Jardins', type:'pillar', col:8,row:35, icon:'gate'},
      {id:'fonte', label:'Fonte Central', type:'rune', col:22,row:28, icon:'fountain'},
      {id:'labirinto', label:'Horta Labiríntica', type:'bush', col:34,row:24, icon:'maze'},
      {id:'obelisco', label:'Obelisco Claro', type:'pillar', col:45,row:18, icon:'obelisk'},
      {id:'altar', label:'Altar do Oráculo', type:'rune', col:52,row:14, icon:'altar'}
    ],
    roads:[[[8,35],[14,33],[22,28]], [[22,28],[28,27],[34,24],[40,21],[45,18]], [[45,18],[49,16],[52,14]]],
    treasures:[
      {id:'s9-t1', difficulty:'Fácil', name:'Tesouro da Fonte', col:18,row:31,
       clue:'Entre pelo portal dos jardins e siga até a fonte central. Cave ao sul da fonte, na borda do piso de pedras.',
       route:['portal','fonte']},
      {id:'s9-t2', difficulty:'Médio', name:'Tesouro do Labirinto', col:37,row:26,
       clue:'Da fonte central, observe a horta labiríntica. O tesouro está a leste do labirinto, onde a trilha faz uma curva.',
       route:['fonte','labirinto']},
      {id:'s9-t3', difficulty:'Difícil', name:'Tesouro do Oráculo', col:48,row:16,
       clue:'Passe pelo obelisco claro e siga na direção do altar do oráculo. Cave antes do altar, no ponto em que o caminho se estreita.',
       route:['labirinto','obelisco','altar']}
    ]
  },
  {
    id:'santuario-lendario', number:10, name:'Santuário do Tesouro Lendário', biome:'sanctuary', cols:60, rows:44,
    start:{col:8,row:36}, stageHint:'O santuário reúne os cenários anteriores: praia, ruínas, pontes e um templo final.',
    landmarks:[
      {id:'portal', label:'Portal Dourado', type:'pillar', col:8,row:35, icon:'gate', signText:'Somente os verdadeiros exploradores chegam até aqui.'},
      {id:'ponte', label:'Ponte Antiga', type:'sign', col:19,row:30, icon:'bridge'},
      {id:'templo', label:'Templo Central', type:'pillar', col:31,row:24, icon:'temple'},
      {id:'jardim', label:'Jardim de Runas', type:'rune', col:42,row:19, icon:'altar'},
      {id:'camara', label:'Câmara Final', type:'rock', col:51,row:13, icon:'cave'}
    ],
    roads:[[[8,36],[13,34],[19,30],[25,27],[31,24]], [[31,24],[37,21],[42,19],[47,16],[51,13]]],
    treasures:[
      {id:'s10-t1', difficulty:'Fácil', name:'Fragmento Lendário I', col:16,row:33,
       clue:'Atravesse do portal dourado até a ponte antiga. Cave logo após a ponte, do lado esquerdo da trilha.',
       route:['portal','ponte']},
      {id:'s10-t2', difficulty:'Médio', name:'Fragmento Lendário II', col:34,row:26,
       clue:'Chegue ao templo central e observe o jardim de runas. O tesouro está enterrado entre os dois, ao norte do caminho.',
       route:['ponte','templo','jardim']},
      {id:'s10-t3', difficulty:'Difícil', name:'Tesouro Lendário', col:47,row:16,
       clue:'Siga do jardim de runas até a câmara final. Cave antes da entrada da câmara, onde o chão muda de pedra para terra.',
       route:['templo','jardim','camara']}
    ]
  }
];

export const TOTAL_TREASURES = STAGES.reduce((sum, stage) => sum + stage.treasures.length, 0);
