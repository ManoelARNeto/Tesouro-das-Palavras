/** Salvamento v4 com migração conservadora da v3. Descoberto ≠ aberto. */
export class SaveManager {
 static KEY='tesouro-das-palavras-v4';
 static LEGACY=['tesouro-das-palavras-v3','tesouro-das-palavras-v2','tesouro-das-palavras-etapa1-v1'];
 constructor(storage=globalThis.localStorage){this.storage=storage;}
 parse(key){try{return JSON.parse(this.storage.getItem(key)||'null');}catch{return null;}}
 load(){
  const now=this.parse(SaveManager.KEY);
  if(now?.version===4 && typeof now.stageStates==='object')return now;
  const old=this.parse(SaveManager.LEGACY[0]);
  if(old?.version===3 && old.stageStates){
   const stageStates={};
   for(const [id,state] of Object.entries(old.stageStates)){
    stageStates[id]={...state,dug:[...new Set([...(state.dug||[]),...(state.found||[])])],opened:[],found:[]};
   }
   return {version:4,currentStage:old.currentStage||0,unlockedStages:old.unlockedStages||[0],stageStates,settings:old.settings||{},questionStats:{},answeredCorrect:[],chestQuestionOverrides:{},updatedAt:new Date().toISOString()};
  }
  for(const k of SaveManager.LEGACY.slice(1)){
   const prior=this.parse(k);if(prior && Number.isFinite(prior.x)&&Number.isFinite(prior.y)){
    return {version:4,currentStage:0,unlockedStages:[0],stageStates:{'praia-naufragos':{dug:[],opened:[],discovered:prior.discovered||[],seconds:prior.seconds||0}},settings:{zoom:prior.zoom||2},questionStats:{},answeredCorrect:[],chestQuestionOverrides:{},legacyState:prior};
   }
  }
  return null;
 }
 save(data){try{this.storage.setItem(SaveManager.KEY,JSON.stringify({...data,version:4,updatedAt:new Date().toISOString()}));return true;}catch{return false;}}
 erase(){try{this.storage.removeItem(SaveManager.KEY);for(const k of SaveManager.LEGACY)this.storage.removeItem(k);}catch{}}
}
