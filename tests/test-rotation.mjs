import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {QuestionRepository} from '../src/data/QuestionRepository.js';
import {Game} from '../src/core/Game.js';
import {World} from '../src/world/World.js';
import {SaveManager} from '../src/core/SaveManager.js';
import {STAGES} from '../src/world/stages.js';
import {blankRewards} from '../src/core/Rewards.js';

const root=path.resolve(import.meta.dirname,'..');
const fetchOriginal=globalThis.fetch;
globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,url),'utf8'))});
const repo=new QuestionRepository();await repo.load();
globalThis.fetch=fetchOriginal;
const seen=new Set();
for(const stage of STAGES)for(const chest of stage.treasures){
 const qs=repo.questionsForChest(chest.id,chest.difficulty);
 assert.equal(qs.length,3);
 assert.equal(new Set(qs.map(q=>q.id)).size,3);
 qs.forEach(q=>{assert.ok(repo.assessable(q));assert.equal(q.dificuldade,chest.difficulty);assert.equal(q.origem,'coletanea_paebes_2024');seen.add(q.id);});
 for(let attempts=0;attempts<15;attempts++){
  assert.equal(repo.chestQuestion(chest.id,chest.difficulty,attempts).id,qs[attempts%3].id);
  assert.equal(repo.chestQuestion(chest.id,chest.difficulty,attempts,2).id,qs[(attempts+2)%3].id);
 }
}
assert.equal(seen.size,50,'50 questões diferentes distribuídas por 90 posições');
for(const stage of STAGES){
 const world=new World(stage.number-1);
 const opened=[];
 for(const chest of stage.treasures){
  world.restoreStageState({dug:[...opened,chest.id],opened:[...opened]});
  const state={dug:[...world.dug],opened:[...world.opened],attempts:{},firstTry:{},replays:0};
  const stub={stage,stageStates:{[stage.id]:state},state:'question',currentStageIndex:stage.number-1,activeChestId:chest.id,
    activeQuestion:repo.chestQuestion(chest.id,chest.difficulty),answeredThisChallenge:false,
    questions:repo,questionStats:{},answeredCorrect:new Set(),world,
    economy:blankRewards(),unlockedStages:new Set([stage.number-1]),
    finishedCampaign:false,winPending:false,
    saveCurrentStage(){state.opened=[...world.opened]},save(){},
    ui:{updateHUD(){},refreshStageSelect(){}},get secretUnlocked(){return false;}
  };
  const initial=stub.activeQuestion.id;
  for(let i=0;i<5;i++){
   const q=stub.activeQuestion;
   const wrong=q.alternativas.find(a=>a.id!==q.gabarito.alternativa).id;
   const feedback=Game.prototype.answerQuestion.call(stub,wrong);
   assert.equal(feedback.correct,false);
   assert.equal(feedback.accepted,true);
   assert.equal(feedback.nextQuestion.id,repo.chestQuestion(chest.id,chest.difficulty,i+1).id);
   assert.notEqual(stub.activeQuestion.id,q.id,'Não repetir imediatamente após erro');
   assert.equal(world.opened.has(chest.id),false,'O baú não abre com resposta incorreta');
   assert.equal(state.attempts[chest.id],i+1);
  }
  const expected=repo.chestQuestion(chest.id,chest.difficulty,5);
  assert.equal(stub.activeQuestion.id,expected.id,'Após reabrir deve persistir a questão correspondente à contagem de erros');
  const result=Game.prototype.answerQuestion.call(stub,expected.gabarito.alternativa);
  assert.equal(result.correct,true);assert.equal(result.coinsEarned,10);assert.equal(result.firstTry,false);
  assert.equal(world.opened.has(chest.id),true);
  opened.push(chest.id);
 }
}
// Restore after error from a v6 localStorage snapshot; no version bump required.
const store={};const storage={getItem:k=>store[k]??null,setItem(k,v){store[k]=v},removeItem(k){delete store[k]}};
const saver=new SaveManager(storage);
const state={dug:['s1-t1'],opened:[],attempts:{'s1-t1':1},firstTry:{},replays:0};
saver.save({currentStage:0,unlockedStages:[0],stageStates:{[STAGES[0].id]:state},settings:{zoom:2},questionStats:{},answeredCorrect:[],chestQuestionOverrides:{'s1-t1':'AUT-2026-888'},economy:blankRewards()});
const loaded=saver.load();assert.equal(loaded.version,6);
const resumed=repo.chestQuestion('s1-t1','Fácil',loaded.stageStates[STAGES[0].id].attempts['s1-t1']);
assert.equal(resumed.id,repo.questionsForChest('s1-t1','Fácil')[1].id);
console.log('test-rotation.mjs: 30 baús × 3, 50 questões originais, 90 posições com reuso, 5 erros/baú, retomada, recompensa e ciclo de 3 aprovados');
