import { generateStageWorld } from './generator.js';
import { TILE, TILE_ID as T } from './world-config.js';
import { STAGES } from './stages.js';
const BLOCKED = new Set([T.OCEAN,T.COAST,T.RIVER,T.SHALLOW,T.CLIFF]);

export class World {
 constructor(stageIndex=0){this.loadStageByIndex(stageIndex,{dug:[],opened:[]});}
 loadStageByIndex(index=0,state={dug:[],opened:[]}){
  if(!STAGES[index])throw Error(`Estágio inválido: ${index}`);
  this.stageIndex=index; Object.assign(this,generateStageWorld(STAGES[index]));
  this.width=this.cols*TILE;this.height=this.rows*TILE;this.restoreStageState(state);this.ensureSafeStart();
 }

 ensureSafeStart(){
  if(this.canStand(this.start.x,this.start.y))return;
  const col=Math.floor(this.start.x/TILE),row=Math.floor(this.start.y/TILE);
  for(let r=1;r<=12;r++){
   const candidates=[];
   for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
    const x=(col+dx+.5)*TILE,y=(row+dy+.5)*TILE;
    if(this.canStand(x,y))candidates.push({x,y,score:Math.hypot(dx,dy)});
   }
   candidates.sort((a,b)=>a.score-b.score);
   if(candidates.length){this.start={x:candidates[0].x,y:candidates[0].y};return;}
  }
  throw Error(`Sem ponto seguro para iniciar o estágio ${this.stageIndex+1}`);
 }
 tile(col,row){if(col<0||row<0||col>=this.cols||row>=this.rows)return T.OCEAN;return this.tiles[row*this.cols+col];}
 collides(x,y,w,h){
  const l=Math.floor(x/TILE),r=Math.floor((x+w-.01)/TILE),top=Math.floor(y/TILE),bottom=Math.floor((y+h-.01)/TILE);
  for(let row=top;row<=bottom;row++)for(let col=l;col<=r;col++)if(BLOCKED.has(this.tile(col,row)))return true;
  for(const o of this.objects){if(!o.solid||o.removed||o.hidden)continue;const b=o.hitbox;
   if(x<b.x+b.w&&x+w>b.x&&y<b.y+b.h&&y+h>b.y)return true;}
  return false;
 }
 canStand(x,y,w=16,h=12){return !this.collides(x-w/2,y-h/2,w,h);}
 nearestSign(x,y,distance=55){let target=null,closest=distance;
  for(const sign of this.signs){const d=Math.hypot(sign.x-x,sign.y-y);if(d<closest){target=sign;closest=d;}}return target;
 }
 restoreStageState(state={}){
  const ids=new Set(this.stage.treasures.map(t=>t.id));
  this.dug=new Set([...(state.dug||[]),...(state.opened||[])].filter(id=>ids.has(id)));
  this.opened=new Set((state.opened||[]).filter(id=>ids.has(id)));
  this.found=this.opened; // interface de compatibilidade: encontrado significa aberto e concluído
  this.updateTreasureVisibility();
 }
 updateTreasureVisibility(){
  const next=this.currentTreasure();
  for(const t of this.stage.treasures){
   const o=this.objects.find(obj=>obj.id===t.id);if(!o)continue;
   if(this.opened.has(t.id)){
    o.hidden=false;o.kind='chest';o.type='chest_open';o.solid=true;o.active=false;o.hitbox={x:o.x-14,y:o.y-16,w:28,h:15};o.opened=true;
   } else if(this.dug.has(t.id)){
    o.hidden=false;o.kind='chest';o.type='chest';o.solid=true;o.active=next?.id===t.id;o.hitbox={x:o.x-14,y:o.y-16,w:28,h:15};o.opened=false;
   } else if(next && next.id===t.id){
    o.hidden=false;o.kind='buried';o.type='mound';o.solid=false;o.active=true;o.opened=false;o.hitbox={x:o.x-11.5,y:o.y-8,w:23,h:8};
   } else {o.hidden=true;o.kind='buried';o.type='mound';o.solid=false;o.active=false;o.opened=false;}
  }
 }
 currentTreasure(){return this.stage.treasures.find(t=>!this.opened.has(t.id))||null;}
 excavationState(){return {dug:[...this.dug],opened:[...this.opened]};}
 excavate(id){
  const o=this.objects.find(o=>o.id===id);
  if(!o||o.hidden||o.kind!=='buried'||!o.active||this.dug.has(id))return null;
  this.dug.add(id);this.updateTreasureVisibility();
  return {type:'chest_discovered',treasure:this.stage.treasures.find(t=>t.id===id),object:this.objects.find(o=>o.id===id)};
 }
 openTreasure(id){
  if(!this.dug.has(id)||this.opened.has(id)||this.currentTreasure()?.id!==id)return null;
  this.opened.add(id);this.updateTreasureVisibility();
  return {type:'chest_opened',treasure:this.stage.treasures.find(t=>t.id===id),stageComplete:this.currentTreasure()===null};
 }
 nearestInteractive(x,y,range=60){let target=null,closest=range;
  for(const o of this.objects){if(o.hidden||o.removed||(!['buried','chest'].includes(o.kind)&&!o.signId))continue;
   const d=Math.hypot(o.x-x,o.y-9-y);if(d<closest){closest=d;target=o;}}
  return target;
 }
 areaAt(x,y){let selected={name:this.stage.name},min=Infinity;
  for(const a of this.areas){const d=Math.hypot(x/TILE-a.x,y/TILE-a.y);if(d<a.radius&&d<min){selected=a;min=d;}}
  return selected;
 }
}
