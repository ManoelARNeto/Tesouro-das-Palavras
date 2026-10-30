import assert from 'node:assert/strict';
import {World} from '../src/world/World.js';
import {STAGES} from '../src/world/stages.js';

const world=new World(0);
assert.equal(STAGES.length,10,'Deve haver 10 estágios');
for(let i=0;i<STAGES.length;i++){
  world.loadStageByIndex(i,{found:[]});
  assert.equal(world.stage.treasures.length,3,`Estágio ${i+1} deve possuir 3 tesouros`);
  assert.ok(world.width>0&&world.height>0,'Mundo precisa ter dimensões válidas');
  const current=world.currentTreasure();
  assert.ok(current,'Todo estágio novo deve iniciar com um tesouro ativo');
  const visibleMounds=world.objects.filter(o=>!o.hidden&&o.kind==='buried');
  assert.equal(visibleMounds.length,1,'Apenas um tesouro deve estar ativo por vez');
}
console.log('test-world.mjs: OK');
