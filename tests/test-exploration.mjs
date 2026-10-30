import assert from 'node:assert/strict';
import {World} from '../src/world/World.js';
import {STAGES} from '../src/world/stages.js';
import {Player} from '../src/entities/Player.js';

function reachable(world,target){
 const start=[Math.floor(world.start.x/32),Math.floor(world.start.y/32)];
 const queue=[start];let qi=0;const seen=new Set([start.join(',')]);
 const around=[[0,1],[0,-1],[1,0],[-1,0]];
 while(qi<queue.length){
  const [col,row]=queue[qi++],x=(col+.5)*32,y=(row+.5)*32;
  if(Math.hypot(x-target.x,y-target.y-9)<56)return {col,row};
  for(const [dx,dy] of around){const cx=col+dx,cy=row+dy,k=`${cx},${cy}`;
   if(cx<0||cy<0||cx>=world.cols||cy>=world.rows||seen.has(k))continue;
   if(!world.canStand((cx+.5)*32,(cy+.5)*32))continue;
   seen.add(k);queue.push([cx,cy]);}
 }
 return null;
}

for(let i=0;i<STAGES.length;i++){
 const world=new World(i);const player=new Player(world.start.x,world.start.y);
 assert.ok(world.canStand(player.x,player.y),`Estágio ${i+1}: início bloqueado`);
 for(const t of world.stage.treasures){
  const obj=world.objects.find(o=>o.id===t.id);
  assert.ok(obj,`objeto ausente ${t.id}`);
  const point=reachable(world,obj);
  assert.ok(point,`estágio ${i+1}: o tesouro ${t.id} não é alcançável`);
  assert.ok(world.excavate(t.id));
  assert.ok(world.openTreasure(t.id));
 }
}
console.log('test-exploration.mjs: 30 pontos acessíveis e colisões preservadas');
