import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {Game} from '../src/core/Game.js';
import {World} from '../src/world/World.js';
import {STAGES} from '../src/world/stages.js';
import {QuestionRepository} from '../src/data/QuestionRepository.js';
import {blankRewards} from '../src/core/Rewards.js';
const root=path.resolve(import.meta.dirname,'..');
const originalFetch=globalThis.fetch;
globalThis.fetch=async relative=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'))});
const questions=new QuestionRepository();await questions.load();
globalThis.fetch=originalFetch;

// Integração: exercita o mesmo Game.answerQuestion utilizado pelos botões reais.
const stage=STAGES[0];
const economy=blankRewards();
for(const [index,chest] of stage.treasures.entries()){
 const world=new World(0);
 world.restoreStageState({dug:stage.treasures.slice(0,index+1).map(t=>t.id),opened:stage.treasures.slice(0,index).map(t=>t.id)});
 const q=questions.chestQuestion(chest.id,chest.difficulty);
 const state={dug:[...world.dug],opened:[...world.opened],attempts:{},firstTry:{}};
 const stub={
  stage,stageStates:{[stage.id]:state},state:'question',currentStageIndex:0,
  activeChestId:chest.id,activeQuestion:q,answeredThisChallenge:false,questions,
  questionStats:{},answeredCorrect:new Set(),world,economy,unlockedStages:new Set([0]),
  finishedCampaign:false,winPending:false,
  saveCurrentStage(){state.opened=[...world.opened];},save(){},
  ui:{updateHUD(){},refreshStageSelect(){}},
  get secretUnlocked(){return false;}
 };
 const invalid=q.alternativas.find(a=>a.id!==q.gabarito.alternativa).id;
 for(let wrong=0;wrong<index;wrong++){
  const before=economy.coins;
  const current=stub.activeQuestion;
  const incorrect=current.alternativas.find(a=>a.id!==current.gabarito.alternativa).id;
  const feedback=Game.prototype.answerQuestion.call(stub,incorrect);
  assert.equal(feedback.correct,false);
  assert.notEqual(stub.activeQuestion.id,current.id,'Após erro a questão deve alternar');
  assert.equal(economy.coins,before,'Não há perda nem ganho de moedas ao errar');
  assert.equal(stub.answeredThisChallenge,false);
 }
 const feedback=Game.prototype.answerQuestion.call(stub,stub.activeQuestion.gabarito.alternativa);
 assert.equal(feedback.correct,true);
 assert.equal(feedback.coinsEarned,[50,30,10][index]);
 assert.equal(stub.stageStates[stage.id].attempts[chest.id],index+1);
 assert.equal(world.opened.has(chest.id),true);
}
assert.equal(economy.coins,90,'50 + 30 + 10 moedas com acertos na primeira, segunda e terceira tentativas');
console.log('test-coin-flow.mjs: integração de Game.answerQuestion (50/30/10), sem descontos e com baús abertos OK');
