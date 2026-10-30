import assert from 'node:assert/strict';
import { World } from '../src/world/World.js';
import { STAGES } from '../src/world/stages.js';

assert.equal(STAGES.length,10);
for(let i=0;i<STAGES.length;i++){
 const world=new World(i);
 assert.deepEqual(world.stage.treasures.map(t=>t.difficulty),['Fácil','Médio','Difícil']);
 assert.equal(world.dug.size,0);
 assert.equal(world.opened.size,0);
 const first=world.currentTreasure().id;
 assert.equal(world.excavate(STAGES[i].treasures[1].id),null,'Não deve antecipar escavação do segundo baú');
 assert.equal(world.excavate(first)?.type,'chest_discovered');
 assert.equal(world.currentTreasure().id,first,'A escavação por si só não libera a próxima pista');
 assert.equal(world.excavate(first),null,'Não escavar o mesmo baú novamente');
 assert.equal(world.openTreasure(STAGES[i].treasures[1].id),null,'Não abrir o próximo baú sem desenterrá-lo');
 const firstOpen=world.openTreasure(first);
 assert.equal(firstOpen?.type,'chest_opened');assert.equal(firstOpen?.stageComplete,false);
 assert.equal(world.objects.find(o=>o.id===first).type,'chest_open');
 for(const t of STAGES[i].treasures.slice(1)){
  assert.equal(world.currentTreasure().id,t.id);
  assert.equal(world.excavate(t.id)?.type,'chest_discovered');
  assert.ok(world.openTreasure(t.id));
 }
 assert.equal(world.currentTreasure(),null);
 assert.equal(world.opened.size,3);
 const save=world.excavationState();
 world.loadStageByIndex(i,save);
 assert.equal(world.opened.size,3);
 assert.equal(world.objects.filter(o=>o.type==='chest_open').length,3);
}
console.log('test-campaign.mjs: 10 estágios, 30 baús, ordem e salvamento OK');
