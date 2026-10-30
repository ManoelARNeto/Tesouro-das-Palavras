import { generateStageWorld } from './generator.js';
import { TILE, TILE_ID as T } from './world-config.js';
import { STAGES } from './stages.js';
const BLOCKED = new Set([T.OCEAN,T.COAST,T.RIVER,T.SHALLOW,T.CLIFF]);

export class World {
  constructor(stageIndex=0){ this.loadStageByIndex(stageIndex, {found:[]}); }
  loadStageByIndex(index=0, state={found:[]}){
    this.stageIndex=index;
    const stage=STAGES[index];
    Object.assign(this, generateStageWorld(stage));
    this.width=this.cols*TILE; this.height=this.rows*TILE;
    this.restoreStageState(state);
  }
  tile(col,row){ if(col<0||row<0||col>=this.cols||row>=this.rows) return T.OCEAN; return this.tiles[row*this.cols+col]; }
  collides(x,y,w,h){
    const l=Math.floor(x/TILE),r=Math.floor((x+w-.01)/TILE),top=Math.floor(y/TILE),btm=Math.floor((y+h-.01)/TILE);
    for(let cy=top;cy<=btm;cy++) for(let cx=l;cx<=r;cx++) if(BLOCKED.has(this.tile(cx,cy))) return true;
    for(const o of this.objects){ if(!o.solid||o.removed||o.hidden) continue; const b=o.hitbox;
      if(x<b.x+b.w && x+w>b.x && y<b.y+b.h && y+h>b.y) return true;
    }
    return false;
  }
  canStand(x,y,w=16,h=12){ return !this.collides(x-w/2,y-h/2,w,h); }
  nearestSign(x,y,distance=55){ let near=null,best=distance;
    for(const sign of this.signs){ const obj=this.objects.find(o=>o.id===sign.id)||sign; if(obj.hidden||obj.removed) continue; const d=Math.hypot(sign.x-x,sign.y-y); if(d<best){ near=sign; best=d; } }
    return near;
  }
  restoreStageState(state={found:[]}){
    this.found=new Set(state.found||[]);
    this.updateTreasureVisibility();
  }
  updateTreasureVisibility(){
    const next=this.currentTreasure();
    for(const t of this.stage.treasures){
      const o=this.objects.find(obj=>obj.id===t.id); if(!o) continue;
      if(this.found.has(t.id)){
        o.hidden=false; o.kind='chest'; o.type='chest'; o.solid=true; o.active=false; o.hitbox={x:o.x-14,y:o.y-16,w:28,h:15};
      } else if(next && next.id===t.id){
        o.hidden=false; o.kind='buried'; o.type='mound'; o.solid=false; o.active=true; o.hitbox={x:o.x-11.5,y:o.y-8,w:23,h:8};
      } else {
        o.hidden=true; o.kind='buried'; o.type='mound'; o.solid=false; o.active=false; o.hitbox={x:o.x-11.5,y:o.y-8,w:23,h:8};
      }
    }
  }
  currentTreasure(){ return this.stage.treasures.find(t=>!this.found.has(t.id)) || null; }
  excavationState(){ return { found:[...this.found] }; }
  excavate(id){
    const o=this.objects.find(obj=>obj.id===id);
    if(!o || o.hidden) return null;
    if(o.kind==='buried' && o.active){
      this.found.add(id); const treasure=this.stage.treasures.find(t=>t.id===id);
      this.updateTreasureVisibility();
      const became=this.objects.find(obj=>obj.id===id);
      return { type:'treasure', object:became, treasure, stageComplete:this.currentTreasure()===null };
    }
    return null;
  }
  nearestInteractive(x,y,range=60){
    let target=null,closest=range;
    for(const o of this.objects){
      if(o.hidden||o.removed||(!['buried','chest'].includes(o.kind) && !o.signId)) continue;
      const d=Math.hypot(o.x-x,o.y-9-y); if(d<closest){ closest=d; target=o; }
    }
    return target;
  }
  areaAt(x,y){
    let selected={name:this.stage.name},min=Infinity;
    for(const a of this.areas){ const d=Math.hypot(x/TILE-a.x,y/TILE-a.y); if(d<a.radius && d<min){ selected=a; min=d; } }
    return selected;
  }
}
