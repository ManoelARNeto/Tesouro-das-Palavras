import assert from 'node:assert/strict';
import {World} from '../src/world/World.js';
import {STAGES} from '../src/world/stages.js';
import {SECRET_STAGE} from '../src/world/secret-stage.js';
import {blankRewards,recordAnswerForChest,ensureStageAttempt,grantChestCoins,awardStageFragment,secretUnlocked,resetStageChallenge,migrateRewardsFromV4} from '../src/core/Rewards.js';
import {SaveManager} from '../src/core/SaveManager.js';

// 1 - A primeira resposta conta; reabrir a janela e trocar a questão não reiniciam o contador.
const economy=blankRewards(),states={};
for(const stage of STAGES){
 const state={dug:[],opened:[],attempts:{},firstTry:{}};
 states[stage.id]=state;ensureStageAttempt(state,stage);
 const world=new World(stage.number-1);
 for(const chest of stage.treasures){
  assert.equal(world.excavate(chest.id)?.type,'chest_discovered');
  const attempt=recordAnswerForChest(state,chest.id,true);
  assert.equal(attempt.attempts,1);
  assert.ok(world.openTreasure(chest.id));state.opened.push(chest.id);
  assert.equal(grantChestCoins(economy,chest),{Fácil:25,Médio:50,Difícil:100}[chest.difficulty]);
 }
 assert.ok(awardStageFragment(economy,stage,state));
 assert.equal(awardStageFragment(economy,stage,state),false,'Fragmento concedido uma única vez');
}
assert.equal(economy.fragments.length,10);
assert.equal(economy.coins,1750,'10 x 175 moedas');
assert.equal(economy.rewardedChests.length,30);
assert.ok(secretUnlocked(economy));

// 2 - Uma única resposta errada invalida o fragmento daquela rodada.
const mixed=STAGES[0],failed={dug:[],opened:[],attempts:{},firstTry:{}};
for(const [index,chest] of mixed.treasures.entries()){
 if(index===1){assert.equal(recordAnswerForChest(failed,chest.id,false).attempts,1);assert.equal(recordAnswerForChest(failed,chest.id,true).firstTry,false);}
 else assert.equal(recordAnswerForChest(failed,chest.id,true).firstTry,true);
 failed.opened.push(chest.id);
}
const reward2=blankRewards();
assert.equal(awardStageFragment(reward2,mixed,failed),false);
assert.ok(resetStageChallenge(failed,mixed),'Deve ser possível repetir o estágio após completá-lo');
assert.equal(failed.opened.length,0);assert.deepEqual(failed.attempts,{});
for(const chest of mixed.treasures){recordAnswerForChest(failed,chest.id,true);failed.opened.push(chest.id);grantChestCoins(reward2,chest);}
assert.ok(awardStageFragment(reward2,mixed,failed));
for(const chest of mixed.treasures)assert.equal(grantChestCoins(reward2,chest),0,'Não duplicar moedas ao repetir');
assert.equal(reward2.coins,175);
assert.equal(resetStageChallenge(failed,mixed),true,'Lógica de nova rodada independente da interface');

// 3 - Migração conservadora da Etapa 4, sem fragmento por acerto não verificável.
const oldState={};oldState[STAGES[0].id]={dug:STAGES[0].treasures.map(t=>t.id),opened:STAGES[0].treasures.map(t=>t.id),discovered:[]};
const migratedRewards=migrateRewardsFromV4(oldState);
assert.equal(migratedRewards.coins,175);assert.equal(migratedRewards.fragments.length,0);
assert.deepEqual(Object.values(oldState[STAGES[0].id].firstTry),[false,false,false]);
assert.equal(awardStageFragment(migratedRewards,STAGES[0],oldState[STAGES[0].id]),false);
const storage={store:{'tesouro-das-palavras-v4':JSON.stringify({version:4,stageStates:oldState,unlockedStages:[0,1],currentStage:0})},getItem(k){return this.store[k]||null;},setItem(k,v){this.store[k]=v;},removeItem(k){delete this.store[k];}};
const saver=new SaveManager(storage);const s=saver.load();assert.equal(s.version,6);assert.equal(s.economy.coins,175);
assert.equal(s.economy.fragments.length,0);assert.equal(saver.save(s),true);assert.equal(saver.load().version,6);

// 4 - A ilha secreta é um mundo real, com altar alcançável e sem alterar os 30 baús.
const secret=new World(10);assert.equal(secret.stage.id,SECRET_STAGE.id);
assert.equal(secret.stage.treasures.length,0);assert.equal(secret.opened.size,0);
assert.ok(secret.canStand(secret.start.x,secret.start.y),'A ilha secreta deve ter entrada livre');
const altar=secret.objects.find(obj=>obj.signId==='altar-livro');assert.ok(altar,'Altar interativo deve existir');
const access=[];
for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
 const x=altar.x+dx*32, y=altar.y+dy*32;if(secret.canStand(x,y))access.push({x,y});
}
assert.ok(access.length>0,'O altar deve ter local adjacente para interação');
assert.equal(STAGES.length,10);
console.log('test-rewards.mjs: 10 fragmentos, 30 baús, primeira tentativa, replay, moedas, migração, ilha secreta OK');
// 5 - Verifica que é possível caminhar do portal ao altar sem atravessar obstáculos.
const origin={col:Math.floor(secret.start.x/32),row:Math.floor(secret.start.y/32)};
const destination={col:Math.floor(altar.x/32),row:Math.floor(altar.y/32)};
const key=(col,row)=>`${col},${row}`;
const visited=new Set([key(origin.col,origin.row)]),queue=[origin];
let foundAltar=false;
for(let head=0;head<queue.length;head++){
 const cur=queue[head];
 if(Math.hypot(cur.col-destination.col,cur.row-destination.row)<2){foundAltar=true;break;}
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const col=cur.col+dx,row=cur.row+dy,k=key(col,row),x=(col+.5)*32,y=(row+.5)*32;
  if(visited.has(k)||!secret.canStand(x,y))continue;
  visited.add(k);queue.push({col,row});
 }
}
assert.ok(foundAltar,'A ilha secreta precisa permitir deslocamento real até o altar');
console.log('test-rewards.mjs: caminhada até o Altar do Livro OK');
