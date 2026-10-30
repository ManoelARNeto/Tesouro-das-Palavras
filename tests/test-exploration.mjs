import assert from 'node:assert/strict';
import {World} from '../src/world/World.js';
import {Player} from '../src/entities/Player.js';
import {SaveManager} from '../src/core/SaveManager.js';
import {BURIED_SITES,SAND_BARRIERS,SECRET_AREAS,START,TILE} from '../src/world/world-config.js';

const w=new World();
const at=(o)=>({x:o.x,y:o.y-9});
assert.equal(BURIED_SITES.length,5);
assert.equal(SAND_BARRIERS.length,3);
assert.equal(SECRET_AREAS.length,3);
assert.equal(w.excavationState().buried.length,0);
assert.equal(w.excavationState().cleared.length,0);
assert.equal(new Set([...BURIED_SITES,...SAND_BARRIERS].map(a=>a.id)).size,8,'IDs devem ser únicos');
// Alcançabilidade: cada alvo possui pelo menos um piso livre a menos de 59 px.
const sx=Math.floor(START.x/TILE),sy=Math.floor(START.y/TILE);
const q=[[sx,sy]],visited=new Set([`${sx},${sy}`]);
for(let head=0;head<q.length;head++){
 const [x,y]=q[head];
 for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){
  const a=x+dx,b=y+dy,key=`${a},${b}`;
  if(!visited.has(key)&&w.canStand((a+.5)*TILE,(b+.5)*TILE)){
   visited.add(key);q.push([a,b]);
  }
 }
}
for(const site of [...BURIED_SITES,...SAND_BARRIERS]){
 const o=w.objects.find(o=>o.id===site.id);assert.ok(o,`alvo ${site.id} existe`);
 assert.ok(q.some(([x,y])=>Math.hypot((x+.5)*TILE-o.x,(y+.5)*TILE-(o.y-9))<59),`${site.id} é acessível`);
}
// Baús: precisam ser escavados, nunca surgem diretamente abertos.
for(const site of BURIED_SITES){
 const o=w.objects.find(o=>o.id===site.id);
 assert.equal(o.kind,'buried');assert.equal(o.solid,false);
 const outcome=w.excavate(site.id);assert.equal(outcome.type,'chest');
 assert.equal(o.kind,'chest');assert.equal(o.solid,true);
 assert.equal(w.excavate(site.id),null,'não escavar duas vezes');
}
// Barreiras impedem passagem e são removíveis permanentemente.
for(const barrier of SAND_BARRIERS){
 const o=w.objects.find(o=>o.id===barrier.id),{x,y}=at(o);
 assert.equal(w.collides(o.hitbox.x,o.hitbox.y,o.hitbox.w,o.hitbox.h),true);
 const result=w.excavate(barrier.id);assert.equal(result.type,'passage');
 assert.equal(o.removed,true);assert.equal(w.excavate(barrier.id),null);
 assert.equal(w.canStand(x,y),true,`piso sob ${barrier.id} deve ser acessível`);
}
assert.equal(w.excavationState().buried.length,5);
assert.equal(w.excavationState().cleared.length,3);
w.resetExcavations();
assert.equal(w.excavationState().buried.length,0);
assert.equal(w.excavationState().cleared.length,0);
assert.equal(w.objects.find(o=>o.id==='tesouro-praia').solid,false);
w.restoreExcavations(['tesouro-praia','id-desconhecido'],['passagem-central']);
assert.deepEqual(w.excavationState(),{buried:['tesouro-praia'],cleared:['passagem-central']});
// A pá é sempre disponível e o personagem fica parado durante escavação.
const player=new Player(START.x,START.y);assert.equal(player.dig(),true);
assert.equal(player.dig(),false);
const oldPos=[player.x,player.y];player.update(.3,{x:1,y:0},w);
assert.deepEqual([player.x,player.y],oldPos);
player.update(.5,{x:1,y:0},w);assert.equal(player.digTimer,0);
assert.equal(player.dig(),true);
// Persistência v2 e migração de partida v1.
const store=new Map();
const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const save=new SaveManager(storage);
store.set(SaveManager.LEGACY_KEY,JSON.stringify({version:1,x:START.x,y:START.y,discovered:['praia'],seconds:47}));
assert.equal(save.load().version,2);
assert.deepEqual(save.load().buried,[]);
assert.deepEqual(save.load().cleared,[]);
assert.deepEqual(save.load().secrets,[]);
assert.equal(save.save(player,new Set(['praia']),47,{zoom:2},w.excavationState(),new Set(['secreto-centro'])),true);
const load=save.load();assert.equal(load.version,2);
assert.deepEqual(load.buried,['tesouro-praia']);
assert.deepEqual(load.cleared,['passagem-central']);
assert.deepEqual(load.secrets,['secreto-centro']);
assert.equal(load.discovered[0],'praia');
save.erase();assert.equal(save.load(),null);
console.log(`PASS — ${q.length} pisos alcançáveis; cinco sítios, três passagens, pá, colisões, reset, save v1→v2.`);
