import assert from 'node:assert/strict';
import {SaveManager} from '../src/core/SaveManager.js';
import {QuestionRepository} from '../src/data/QuestionRepository.js';
import {World} from '../src/world/World.js';
import {STAGES} from '../src/world/stages.js';
import {blankRewards,recordAnswerForChest,grantChestCoins,awardStageFragment,secretUnlocked} from '../src/core/Rewards.js';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const readJSON=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const v5={version:5,currentStage:2,unlockedStages:[0,1,2],stageStates:{[STAGES[2].id]:{dug:['s3-t1'],opened:[],attempts:{'s3-t1':1},firstTry:{},x:300,y:300}},settings:{zoom:2,reducedMotion:false},questionStats:{'AUT-001':{acertos:1}},answeredCorrect:['AUT-001'],chestQuestionOverrides:{'s3-t1':'AUT-001'},economy:blankRewards()};
const store={'tesouro-das-palavras-v5':JSON.stringify(v5)};
const storage={getItem(k){return store[k]??null},setItem(k,v){store[k]=v},removeItem(k){delete store[k]}};
const saves=new SaveManager(storage);
const migrated=saves.load();
assert.equal(migrated.version,6);
assert.equal(migrated.currentStage,2);
assert.deepEqual(migrated.questionStats,v5.questionStats);
assert.deepEqual(migrated.answeredCorrect,v5.answeredCorrect);
assert.deepEqual(migrated.stageStates[STAGES[2].id],v5.stageStates[STAGES[2].id]);
assert.equal(saves.importBackup(migrated),true);
assert.deepEqual(saves.load().answeredCorrect,['AUT-001']);
assert.equal(saves.importBackup({...migrated,version:500}),false);
assert.equal(saves.importBackup({...migrated,economy:{}}),false);
assert.equal(saves.importBackup({...migrated,currentStage:999}),false);
assert.equal(saves.importBackup({...migrated,stageStates:{x:{dug:{},opened:[]}}}),false);
assert.equal(saves.load().currentStage,2,'Backup inválido não pode substituir o save.');
// Dados sem gabarito continuam inacessíveis à correção.
const originalFetch=globalThis.fetch;
globalThis.fetch=async url=>({ok:true,json:async()=>readJSON(url)});
const repository=new QuestionRepository();await repository.load();
globalThis.fetch=originalFetch;
for(const stage of STAGES)for(const chest of stage.treasures){
 const known=repository.chestQuestion(chest.id,chest.difficulty);
 assert.ok(known);
 assert.equal(repository.chestQuestion(chest.id,chest.difficulty,'ID-REMOVIDO')?.id,known.id,'Uma questão removida do banco não pode bloquear o baú.');
}
const original=repository.questions.find(q=>q.origem==='coletanea_paebes_2024');
assert.equal(repository.assessable(original),false);
// Fluxo de campanha completa e fragmentos, com as questões efetivamente atribuídas.
const economy=blankRewards();
const answerIds=new Set();
for(let i=0;i<STAGES.length;i++){
 const stage=STAGES[i],world=new World(i);
 const state={dug:[],opened:[],attempts:{},firstTry:{}};
 for(const chest of stage.treasures){
  const question=repository.chestQuestion(chest.id,chest.difficulty);
  assert.ok(question.gabarito?.validado);
  assert.ok(question.alternativas.some(a=>a.id===question.gabarito.alternativa));
  answerIds.add(question.id);
  assert.equal(world.excavate(chest.id)?.type,'chest_discovered');
  assert.ok(recordAnswerForChest(state,chest.id,true).firstTry);
  assert.equal(world.openTreasure(chest.id)?.type,'chest_opened');
  state.opened.push(chest.id);
  grantChestCoins(economy,chest);
 }
 assert.equal(world.currentTreasure(),null);
 assert.equal(awardStageFragment(economy,stage,state),true);
}
assert.equal(answerIds.size,30);
assert.equal(economy.coins,1750);
assert.equal(economy.rewardedChests.length,30);
assert.equal(economy.fragments.length,10);
assert.equal(secretUnlocked(economy),true);
console.log('test-release.mjs: migração v5→v6, importação segura, fallback, 30 desafios e 10 fragmentos OK');
