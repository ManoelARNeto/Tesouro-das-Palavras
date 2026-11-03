import {migrateRewardsFromV4, blankRewards} from './Rewards.js';
/** Salvamento v6: recupera versões anteriores, exportação/importação validada e isolamento de dados. */
export class SaveManager {
 static KEY='tesouro-das-palavras-v6';
 static LEGACY=['tesouro-das-palavras-v5','tesouro-das-palavras-v4','tesouro-das-palavras-v3','tesouro-das-palavras-v2','tesouro-das-palavras-etapa1-v1'];
 constructor(storage=globalThis.localStorage){this.storage=storage;}
 parse(key){try{return JSON.parse(this.storage.getItem(key)||'null');}catch{return null;}}
 load(){
  const now=this.parse(SaveManager.KEY);
  if(this.validSession(now) && now.version===6)return now;
  const v5=this.parse(SaveManager.LEGACY[0]);
  if(this.validSession(v5) && v5.version===5)return {...v5,version:6};
  const previous=this.parse(SaveManager.LEGACY[1]);
  if(previous?.version===4 && previous.stageStates){
   const stageStates=structuredClone(previous.stageStates);
   return {...previous,version:6,stageStates,economy:migrateRewardsFromV4(stageStates),updatedAt:new Date().toISOString()};
  }
  const old=this.parse(SaveManager.LEGACY[2]);
  if(old?.version===3 && old.stageStates){
   const stageStates={};
   for(const [id,state] of Object.entries(old.stageStates)){
    stageStates[id]={...state,dug:[...new Set([...(state.dug||[]),...(state.found||[])])],opened:[],found:[]};
   }
   return {version:6,currentStage:old.currentStage||0,unlockedStages:old.unlockedStages||[0],stageStates,settings:old.settings||{},questionStats:{},answeredCorrect:[],chestQuestionOverrides:{},updatedAt:new Date().toISOString(),economy:blankRewards()};
  }
  for(const k of SaveManager.LEGACY.slice(3)){
   const prior=this.parse(k);if(prior && Number.isFinite(prior.x)&&Number.isFinite(prior.y)){
    return {version:6,currentStage:0,unlockedStages:[0],stageStates:{'praia-naufragos':{dug:[],opened:[],discovered:prior.discovered||[],seconds:prior.seconds||0}},settings:{zoom:prior.zoom||2},questionStats:{},answeredCorrect:[],chestQuestionOverrides:{},legacyState:prior,economy:blankRewards()};
   }
  }
  return null;
 }
 /** Confere estrutura essencial; não atribui gabaritos, moedas ou conquistas a dados inválidos. */
 validSession(o){
  if(!o || ![5,6].includes(o.version) || !o.stageStates || typeof o.stageStates!=='object' || Array.isArray(o.stageStates))return false;
  if(!Array.isArray(o.unlockedStages)||!o.unlockedStages.includes(0))return false;
  if(!o.economy || typeof o.economy!=='object' || !Array.isArray(o.economy.fragments) || !Array.isArray(o.economy.rewardedChests))return false;
  if(!Number.isFinite(o.economy.coins)||o.economy.coins<0)return false;
  if(!Number.isInteger(o.currentStage)||o.currentStage<0||o.currentStage>10)return false;
  for(const state of Object.values(o.stageStates)){
   if(!state||typeof state!=='object'||!Array.isArray(state.dug)||!Array.isArray(state.opened))return false;
   if(state.attempts && (typeof state.attempts!=='object'||Array.isArray(state.attempts)))return false;
  }
  return true;
 }
 /** Importação da cópia de segurança v6 sem aceitar dados incompletos. */
 importBackup(backup){
  if(!this.validSession(backup)||backup.version!==6)return false;
  const data=structuredClone(backup);
  return this.save(data);
 }
 save(data){try{this.storage.setItem(SaveManager.KEY,JSON.stringify({...data,version:6,updatedAt:new Date().toISOString()}));return true;}catch{return false;}}
 erase(){try{this.storage.removeItem(SaveManager.KEY);for(const k of SaveManager.LEGACY)this.storage.removeItem(k);}catch{}}
}
