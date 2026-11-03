import { TILE, TILE_ID as T } from './world-config.js';

function noise(a,b,seed=0){
  let n=Math.imul(a+seed*23,374761393)+Math.imul(b+seed*5,668265263);
  n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;
}
const inMap=(cols,rows,x,y)=>x>=0&&y>=0&&x<cols&&y<rows;
const idx=(cols,x,y)=>y*cols+x;
const BLOCK_LAND = new Set([T.OCEAN, T.COAST, T.RIVER, T.SHALLOW, T.CLIFF]);
const defaultHitbox = {
  tree:[19,13], pine:[18,13], palm:[14,12], rock:[30,21], bush:[18,12], sign:[13,8], pillar:[25,18],
  crate:[25,16], tent:[54,18], boat:[56,21], mound:[23,8], chest:[25,16], sandpile:[27,15], log:[38,14],
  stump:[20,12], mushroom:[6,5], reeds:[6,4], rune:[6,4], altar_livro:[28,13]
};

function addObject(objects, cols, rows, type, col, row, opts={}){
  if(!inMap(cols,rows,col,row)) return null;
  const x=(col+.5)*TILE, y=(row+1)*TILE;
  const [w,h]=defaultHitbox[type] || [20,12];
  const obj={id:opts.id||`${type}-${col}-${row}`, type, x,y, col,row, solid:opts.solid!==false,
    hidden:!!opts.hidden, removed:false, signId:opts.signId??null, kind:opts.kind??null,
    label:opts.label??null, difficulty:opts.difficulty??null, active:opts.active??false,
    landmarkId:opts.landmarkId??null,
    hitbox:{x:x-w/2,y:y-h,w,h}
  };
  objects.push(obj); return obj;
}

function paintCircle(tiles, cols, rows, cx, cy, r, tileId, condition=null){
  for(let y=Math.floor(cy-r); y<=Math.ceil(cy+r); y++) for(let x=Math.floor(cx-r); x<=Math.ceil(cx+r); x++){
    if(!inMap(cols,rows,x,y)) continue;
    if(Math.hypot(x-cx,y-cy) > r+0.05) continue;
    if(condition && !condition(tiles[idx(cols,x,y)],x,y)) continue;
    tiles[idx(cols,x,y)] = tileId;
  }
}
function paintRect(tiles, cols, rows, x1,y1,x2,y2,tileId, condition=null){
  for(let y=y1;y<=y2;y++) for(let x=x1;x<=x2;x++){
    if(!inMap(cols,rows,x,y)) continue;
    if(condition && !condition(tiles[idx(cols,x,y)],x,y)) continue;
    tiles[idx(cols,x,y)] = tileId;
  }
}
function paintPath(tiles, cols, rows, points, width=1, tileId=T.PATH, condition=null){
  for(let i=1;i<points.length;i++){
    const [ax,ay] = points[i-1], [bx,by] = points[i];
    const len = Math.hypot(bx-ax, by-ay);
    const steps = Math.max(1, Math.round(len*5));
    for(let s=0;s<=steps;s++){
      const t = s/steps, x = ax + (bx-ax)*t, y = ay + (by-ay)*t;
      paintCircle(tiles, cols, rows, x, y, width, tileId, condition);
    }
  }
}

function setupBase(stage){
  const cols=stage.cols, rows=stage.rows;
  const tiles=new Uint8Array(cols*rows);
  const biomeBase={ beach:T.SAND, forest:T.GRASS, lagoon:T.GRASS, ruins:T.GRASS, cave:T.GRAVEL,
    dunes:T.SAND, swamp:T.GRASS, cliffs:T.GRAVEL, garden:T.GRASS, sanctuary:T.GRASS, secret:T.FOREST };
  tiles.fill(biomeBase[stage.biome] ?? T.GRASS);
  const edgeTile=(stage.biome==='beach'||stage.biome==='lagoon'||stage.biome==='secret') ? T.OCEAN : (stage.biome==='cave'||stage.biome==='cliffs' ? T.CLIFF : T.FOREST);
  for(let y=0;y<rows;y++) for(let x=0;x<cols;x++){
    const d=Math.min(x,y,cols-1-x,rows-1-y);
    if(d<2) tiles[idx(cols,x,y)] = edgeTile;
    else if(d<3 && edgeTile===T.OCEAN) tiles[idx(cols,x,y)] = T.COAST;
  }
  return tiles;
}

function decorateTerrain(stage, tiles){
  const cols=stage.cols, rows=stage.rows;
  const land=v=>!BLOCK_LAND.has(v);
  // Biome-specific ground painting.
  switch(stage.biome){
    case 'beach':
      paintCircle(tiles, cols, rows, 28, 19, 18, T.GRASS, v=>v!==T.OCEAN&&v!==T.COAST);
      paintCircle(tiles, cols, rows, 48, 14, 7, T.ROCK, v=>v!==T.OCEAN&&v!==T.COAST);
      paintCircle(tiles, cols, rows, 11, 36, 6, T.SAND, v=>v!==T.OCEAN&&v!==T.COAST);
      break;
    case 'forest':
      for(let y=4;y<rows-4;y++) for(let x=4;x<cols-4;x++) if(noise(x,y,stage.number)>.83) tiles[idx(cols,x,y)] = T.FOREST;
      paintCircle(tiles, cols, rows, 48, 16, 5, T.RUINS, v=>land(v));
      break;
    case 'lagoon':
      paintCircle(tiles, cols, rows, 33, 24, 8, T.SHALLOW, v=>v!==T.OCEAN&&v!==T.COAST);
      paintCircle(tiles, cols, rows, 33, 24, 5.5, T.RIVER, v=>v!==T.OCEAN&&v!==T.COAST);
      paintRect(tiles, cols, rows, 12, 29, 22, 33, T.SHALLOW, v=>land(v));
      break;
    case 'ruins':
      paintRect(tiles, cols, rows, 15, 24, 48, 33, T.RUINS, v=>land(v));
      paintCircle(tiles, cols, rows, 27, 20, 4.5, T.GRAVEL, v=>land(v));
      break;
    case 'cave':
      paintRect(tiles, cols, rows, 5, 8, 55, 37, T.GRAVEL, v=>v!==T.CLIFF);
      paintCircle(tiles, cols, rows, 49, 15, 6, T.ROCK, v=>v!==T.CLIFF);
      paintCircle(tiles, cols, rows, 9, 36, 5, T.ROCK, v=>v!==T.CLIFF);
      break;
    case 'dunes':
      for(let y=3;y<rows-3;y++) for(let x=3;x<cols-3;x++) if((x+y)%7===0 && !BLOCK_LAND.has(tiles[idx(cols,x,y)])) tiles[idx(cols,x,y)] = T.FLOWERS;
      paintCircle(tiles, cols, rows, 8, 35, 3.6, T.SHALLOW, v=>v!==T.OCEAN&&v!==T.COAST);
      paintCircle(tiles, cols, rows, 43, 20, 3, T.ROCK, v=>land(v));
      break;
    case 'swamp':
      for(let y=6;y<rows-6;y++) for(let x=6;x<cols-6;x++) if(noise(x,y,13+stage.number)>.89) paintCircle(tiles, cols, rows, x,y,1.5,T.SHALLOW, v=>land(v));
      break;
    case 'cliffs':
      paintRect(tiles, cols, rows, 24, 5, 56, 16, T.CLIFF);
      paintRect(tiles, cols, rows, 15, 20, 23, 28, T.CLIFF);
      break;
    case 'garden':
      paintRect(tiles, cols, rows, 12, 18, 50, 32, T.FLOWERS, v=>land(v));
      paintCircle(tiles, cols, rows, 22, 28, 4, T.RUINS, v=>land(v));
      break;
    case 'secret':
      paintCircle(tiles,cols,rows,30,22,17,T.GRASS,v=>land(v));
      paintCircle(tiles,cols,rows,30,22,10,T.FLOWERS,v=>land(v));
      paintCircle(tiles,cols,rows,30,22,5,T.RUINS,v=>land(v));
      paintCircle(tiles,cols,rows,46,15,5,T.RUINS,v=>land(v));
      paintCircle(tiles,cols,rows,9,35,5,T.SAND,v=>land(v));
      break;
    case 'sanctuary':
      paintRect(tiles, cols, rows, 22, 18, 39, 30, T.RUINS, v=>land(v));
      paintCircle(tiles, cols, rows, 48, 14, 6, T.ROCK, v=>land(v));
      paintRect(tiles, cols, rows, 4, 32, 18, 40, T.SAND, v=>land(v));
      break;
  }
  // Common roads.
  for(const road of stage.roads) paintPath(tiles, cols, rows, road, 1.0, stage.biome==='cave'||stage.biome==='cliffs' ? T.GRAVEL : T.PATH, v=>!BLOCK_LAND.has(v));
  // Bridges over water when appropriate.
  if(stage.biome==='lagoon' || stage.biome==='swamp'){
    paintRect(tiles, cols, rows, 27, 26, 31, 28, T.BRIDGE);
  }
  if(stage.biome==='beach'){
    paintRect(tiles, cols, rows, 16, 30, 20, 30, T.BRIDGE);
    paintRect(tiles, cols, rows, 4, 38, 6, 40, T.BRIDGE);
  }
}

/** Corredores transitáveis: cada ponto escavável deve ter um acesso conectado à trilha.
 * Em água, a trilha torna-se ponte; nas rochas, piso de cascalho.
 * Preserva o desenho geral de cada bioma, corrigindo cortes do mapa da Etapa 3.
 */
function ensureTreasureRoutes(stage, tiles){
  const cols=stage.cols, rows=stage.rows;
  const before=tiles.slice();
  const roadPoints=stage.roads.flat();
  const paths=[...stage.roads.map(points=>points)];
  for(const t of stage.treasures){
    const closest=roadPoints.reduce((best,point)=>
      Math.hypot(point[0]-t.col,point[1]-t.row)<Math.hypot(best[0]-t.col,best[1]-t.row)?point:best,roadPoints[0]);
    paths.push([closest,[t.col,t.row]]);
  }
  paths.push([[stage.start.col,stage.start.row],stage.roads[0][0]]);
  for(const path of paths)paintPath(tiles,cols,rows,path,1.35,T.PATH);
  for(const t of stage.treasures)paintCircle(tiles,cols,rows,t.col,t.row,1.65,T.PATH);
  paintCircle(tiles,cols,rows,stage.start.col,stage.start.row,1.65,T.PATH);
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const k=idx(cols,col,row);
    if(tiles[k]!==T.PATH)continue;
    if([T.OCEAN,T.COAST,T.RIVER,T.SHALLOW].includes(before[k]))tiles[k]=T.BRIDGE;
    else if(before[k]===T.CLIFF)tiles[k]=T.GRAVEL;
    else if(stage.biome==='cave')tiles[k]=T.GRAVEL;
  }
}

function addLandmarkObjects(stage, tiles, objects){
  const cols=stage.cols, rows=stage.rows;
  const land=v=>!BLOCK_LAND.has(v);
  for(const lm of stage.landmarks){
    const typeMap = { bridge:'sign', camp:'tent', cave:'rock', rocks:'rock', stones:'rock', ruin:'pillar',
      temple:'pillar', altar:'rune', fountain:'rune', maze:'bush', oasis:'palm', obelisk:'pillar',
      hut:'tent', cliff:'rock', stairs:'sign', gem:'rune', plaza:'rune', gate:'pillar', well:'rock',
      waves:'boat', reeds:'reeds', log:'log', tree:'tree', isle:'palm', pillars:'pillar', dune:'sign', arch:'rock' };
    let type = stage.secret&&lm.id==='altar-livro'?'altar_livro':lm.type;
    if(['camp','bridge','cave','rocks','stones','ruin','temple','altar','fountain','maze','oasis','obelisk','hut','cliff','stairs','gem','plaza','gate','well','waves','reeds','log','tree','isle','pillars','dune','arch'].includes(lm.icon)){
      if(!(stage.secret&&lm.id==='altar-livro'))type = typeMap[lm.icon] || lm.type;
    }
    // ensure landmark ground is walkable around it
    if(land(tiles[idx(cols,lm.col,lm.row)])) addObject(objects, cols, rows, type, lm.col, lm.row, {landmarkId:lm.id, label:lm.label, signId:lm.signText?lm.id:null, solid:type!=='boat'&&type!=='reeds'&&type!=='mushroom'&&type!=='rune'});
    if(type==='pillar' && lm.icon==='pillars'){
      addObject(objects, cols, rows, 'pillar', lm.col+1, lm.row, {solid:true, landmarkId:lm.id, label:lm.label});
      addObject(objects, cols, rows, 'pillar', lm.col, lm.row+1, {solid:true, landmarkId:lm.id, label:lm.label});
      addObject(objects, cols, rows, 'pillar', lm.col+1, lm.row+1, {solid:true, landmarkId:lm.id, label:lm.label});
    }
  }
  const signs=objects.filter(o=>o.signId).map(o=>{
    const lm=stage.landmarks.find(item=>item.id===o.signId);
    return {...o,text:lm?.signText||lm?.label||'Uma antiga marca na paisagem.'};
  });
  return signs;
}

function addFillerObjects(stage, tiles, objects){
  const cols=stage.cols, rows=stage.rows;
  const walkable=id=>!BLOCK_LAND.has(id);
  const occupied=new Set(objects.map(o=>`${o.col},${o.row}`));
  const tryAdd=(type,col,row,solid=true)=>{
    if(!inMap(cols,rows,col,row) || occupied.has(`${col},${row}`) || !walkable(tiles[idx(cols,col,row)])) return;
    occupied.add(`${col},${row}`); addObject(objects, cols, rows, type, col, row, {solid});
  };
  for(let y=3;y<rows-3;y++) for(let x=3;x<cols-3;x++){
    if(occupied.has(`${x},${y}`) || !walkable(tiles[idx(cols,x,y)])) continue;
    const n=noise(x,y,stage.number*3);
    if(stage.biome in {beach:1,dunes:1,sanctuary:1,secret:1} && tiles[idx(cols,x,y)]===T.SAND && n>.965) tryAdd('palm',x,y,true);
    if((stage.biome==='forest'||stage.biome==='swamp'||stage.biome==='garden') && (tiles[idx(cols,x,y)]===T.FOREST||tiles[idx(cols,x,y)]===T.GRASS) && n>.978) tryAdd('tree',x,y,true);
    if(stage.biome==='lagoon' && tiles[idx(cols,x,y)]===T.GRASS && n>.982) tryAdd('reeds',x,y,false);
    if((stage.biome==='ruins'||stage.biome==='sanctuary'||stage.biome==='secret') && tiles[idx(cols,x,y)]===T.RUINS && n>.988) tryAdd('crate',x,y,true);
    if((stage.biome==='cave'||stage.biome==='cliffs'||stage.biome==='dunes') && (tiles[idx(cols,x,y)]===T.GRAVEL||tiles[idx(cols,x,y)]===T.ROCK) && n>.976) tryAdd('rock',x,y,true);
    if(n<.009) tryAdd('bush',x,y,false);
  }
}

export function generateStageWorld(stage){
  const tiles=setupBase(stage);
  decorateTerrain(stage, tiles);
  ensureTreasureRoutes(stage, tiles);
  const objects=[];
  const signs=addLandmarkObjects(stage, tiles, objects);
  addFillerObjects(stage, tiles, objects);
  // Treasure objects: initially hidden; World will activate only the current target.
  for(const treasure of stage.treasures){
    addObject(objects, stage.cols, stage.rows, 'mound', treasure.col, treasure.row, {
      id: treasure.id, label: treasure.name, kind:'buried', difficulty:treasure.difficulty, hidden:true, solid:false
    });
  }
  return {
    tiles, objects, signs, cols:stage.cols, rows:stage.rows, tileSize:TILE,
    start:{x:(stage.start.col+.5)*TILE,y:(stage.start.row+.5)*TILE},
    areas:stage.landmarks.map(l=>({id:l.id,name:l.label,x:l.col,y:l.row,radius:3.6,detail:l.label})),
    stage
  };
}
