/** Área bônus. Não entra na contagem das 30 questões ou dos 10 fragmentos. */
export const SECRET_STAGE={
 id:'ilha-palavras-perdidas',number:11,name:'Ilha das Palavras Perdidas',biome:'secret',secret:true,
 cols:60,rows:44,start:{col:8,row:35},
 stageHint:'Os dez fragmentos reunidos revelam a Ilha das Palavras Perdidas. Siga os símbolos até o Altar do Livro e interaja para concluir a exploração secreta.',
 landmarks:[
  {id:'portal-secreto',label:'Portal de Pergaminhos',type:'pillar',col:8,row:35,icon:'gate',signText:'Dez pedaços de mapa abrem a rota para a ilha invisível.'},
  {id:'ponte-estrelas',label:'Ponte das Estrelas',type:'sign',col:19,row:30,icon:'bridge',signText:'A antiga ponte foi preservada pelas palavras.'},
  {id:'circulo-runas',label:'Círculo de Runas',type:'pillar',col:30,row:25,icon:'pillars',signText:'A luz segue a direção do pergaminho reunido.'},
  {id:'jardim-eco',label:'Jardim dos Ecos',type:'tree',col:37,row:21,icon:'tree'},
  {id:'altar-livro',label:'Altar do Livro',type:'rune',col:46,row:15,icon:'altar',signText:'As dez marcas de sabedoria brilham. O Livro das Palavras foi encontrado.'}
 ],
 roads:[[[8,35],[14,33],[19,30],[25,27],[30,25]],[[30,25],[36,22],[37,21],[41,18],[46,15]]],
 treasures:[]
};
