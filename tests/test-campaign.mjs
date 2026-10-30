import assert from 'node:assert/strict';
import {World} from '../src/world/World.js';

const world=new World(0);
const stage=world.stage;
for(const treasure of stage.treasures){
  const target=world.currentTreasure();
  assert.equal(target.id,treasure.id,'A ordem da pista deve ser sequencial');
  const result=world.excavate(target.id);
  assert.ok(result && result.type==='treasure','Escavar o alvo atual deve revelar um tesouro');
}
assert.equal(world.currentTreasure(),null,'Após os 3 tesouros, o estágio deve terminar');
assert.equal(world.found.size,3,'Todos os 3 tesouros do estágio precisam ser registrados');
console.log('test-campaign.mjs: OK');
