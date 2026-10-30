export class SaveManager {
  static KEY='tesouro-das-palavras-v3';
  static LEGACY_KEYS=['tesouro-das-palavras-v2','tesouro-das-palavras-etapa1-v1'];
  constructor(storage=globalThis.localStorage){ this.storage=storage; }
  load(){
    try{
      const fresh=JSON.parse(this.storage.getItem(SaveManager.KEY)||'null');
      if(this.isValid(fresh) && fresh.version===3) return fresh;
      const old2=JSON.parse(this.storage.getItem(SaveManager.LEGACY_KEYS[0])||'null');
      if(this.isValid(old2)) return this.migrateV2(old2);
      const old1=JSON.parse(this.storage.getItem(SaveManager.LEGACY_KEYS[1])||'null');
      if(this.isValid(old1)) return this.migrateV1(old1);
    }catch{}
    return null;
  }
  isValid(o){ return !!o && (o.version===3 || (Number.isFinite(o.x)&&Number.isFinite(o.y))); }
  migrateV2(old){
    return { version:3, currentStage:0, unlockedStages:[0], settings:{zoom:old.zoom||2,reducedMotion:false},
      stageStates:{ 'praia-naufragos': { x:old.x, y:old.y, found:old.buried||[], discovered:old.discovered||[], seconds:Number(old.seconds)||0 } },
      updatedAt:new Date().toISOString() };
  }
  migrateV1(old){
    return { version:3, currentStage:0, unlockedStages:[0], settings:{zoom:old.zoom||2,reducedMotion:false},
      stageStates:{ 'praia-naufragos': { x:old.x, y:old.y, found:[], discovered:old.discovered||[], seconds:Number(old.seconds)||0 } },
      updatedAt:new Date().toISOString() };
  }
  save(data){ try{ this.storage.setItem(SaveManager.KEY, JSON.stringify({...data, version:3, updatedAt:new Date().toISOString()})); return true; } catch { return false; } }
  erase(){ try{ this.storage.removeItem(SaveManager.KEY); for(const k of SaveManager.LEGACY_KEYS) this.storage.removeItem(k);} catch{} }
}
