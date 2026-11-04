import {STAGES} from '../world/stages.js';
// Recompensa única por baú, calculada pela tentativa do primeiro acerto.
// A dificuldade pedagógica não altera o valor da recompensa.
export const COINS_BY_ATTEMPT=Object.freeze({first:50,second:30,thirdOrMore:10});
// Apenas para preservar o saldo das versões antigas na migração v4 → v6.
const LEGACY_COINS_BY_DIFFICULTY=Object.freeze({'Fácil':25,'Médio':50,'Difícil':100});
export function coinsForAttempt(attempts){
 if(!Number.isInteger(attempts)||attempts<1)return 0;
 return attempts===1?COINS_BY_ATTEMPT.first:attempts===2?COINS_BY_ATTEMPT.second:COINS_BY_ATTEMPT.thirdOrMore;
}
export const FRAGMENTS_NEEDED=STAGES.length;
export const SECRET_STAGE_INDEX=STAGES.length;
export function blankRewards(){return {coins:0,rewardedChests:[],fragments:[],secretCompleted:false,relic:false};}
export function ensureStageAttempt(stageState, stage){
 if(!stageState.attempts || typeof stageState.attempts!=='object')stageState.attempts={};
 if(!stageState.firstTry || typeof stageState.firstTry!=='object')stageState.firstTry={};
 // A v4 não armazenava tentativas por baú. Não inferir desempenho perfeito em dados antigos.
 for(const id of stageState.opened||[])if(stage.treasures.some(t=>t.id===id) && stageState.firstTry[id]!==true)stageState.firstTry[id]=false;
 return stageState;
}
export function recordAnswerForChest(stageState, chestId, correct){
 if(!stageState.attempts || typeof stageState.attempts!=='object')stageState.attempts={};
 if(!stageState.firstTry || typeof stageState.firstTry!=='object')stageState.firstTry={};
 const count=(Number(stageState.attempts[chestId])||0)+1;
 stageState.attempts[chestId]=count;
 if(correct)stageState.firstTry[chestId]=(count===1);
 return {attempts:count,firstTry:correct && count===1};
}
export function grantChestCoins(economy,chest,successfulAttempt){
 if(economy.rewardedChests.includes(chest.id))return 0;
 const amount=coinsForAttempt(successfulAttempt);
 if(!amount)return 0; // Nunca creditar moedas por tentativa ausente ou inválida.
 economy.rewardedChests.push(chest.id);economy.coins+=amount;
 return amount;
}
export function awardStageFragment(economy, stage, state){
 if(!stage || stage.number>STAGES.length || economy.fragments.includes(stage.id))return false;
 if(stage.treasures.some(t=>!(state.opened||[]).includes(t.id) || state.firstTry?.[t.id]!==true))return false;
 economy.fragments.push(stage.id);return true;
}
export function secretUnlocked(economy){return STAGES.every(stage=>economy.fragments.includes(stage.id));}
export function resetStageChallenge(stageState,stage){
 if(!stage.treasures.every(t=>(stageState.opened||[]).includes(t.id)))return false;
 stageState.opened=[];stageState.dug=[];stageState.attempts={};stageState.firstTry={};
 stageState.replays=(stageState.replays||0)+1;
 return true;
}
export function migrateRewardsFromV4(stageStates={}){
 const rewards=blankRewards();
 for(const stage of STAGES){
  const state=stageStates[stage.id]; if(!state)continue;
  ensureStageAttempt(state,stage);
  // O saldo já adquirido nas versões antigas não deve ser recalculado.
  for(const treasure of stage.treasures)if((state.opened||[]).includes(treasure.id)){
   rewards.rewardedChests.push(treasure.id);
   rewards.coins+=LEGACY_COINS_BY_DIFFICULTY[treasure.difficulty]||0;
  }
 }
 return rewards;
}
