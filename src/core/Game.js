import {World} from '../world/World.js';
import {Player} from '../entities/Player.js';
import {Camera} from './Camera.js';
import {Input} from './Input.js';
import {SaveManager} from './SaveManager.js';
import {Renderer} from '../render/Renderer.js';
import {UI} from '../ui/UI.js';
import {STAGES, TOTAL_TREASURES} from '../world/stages.js';

export class Game {
 constructor(){
  this.world=new World(0); this.player=new Player(this.world.start.x,this.world.start.y);
  this.renderer=new Renderer(document.getElementById('game-canvas'));
  this.camera=new Camera(); this.input=new Input(); this.saves=new SaveManager(); this.ui=new UI(this);
  this.currentStageIndex=0; this.discovered=new Set(); this.pendingExcavation=null; this.seconds=0;
  this.unlockedStages=new Set([0]); this.stageStates={}; this.state='menu'; this.lastTick=0; this.accSave=0;
  let settings={}; try{ settings=(this.saves.load()?.settings)||JSON.parse(localStorage.getItem('tesouro-settings')||'{}')||{}; }catch{}
  this.settings={zoom:[1.5,2,2.5].includes(settings.zoom)?settings.zoom:2,reducedMotion:!!settings.reducedMotion};
  this.camera.zoom=this.settings.zoom;
  document.addEventListener('visibilitychange',()=>{ if(document.hidden && this.state==='playing') this.pause(); });
  window.addEventListener('pagehide',()=>this.save());
  window.addEventListener('resize',()=>this.resize());
 }
 async boot(){
  try{
    await this.renderer.load(); this.renderer.build(this.world); this.resize();
    this.ui.updateContinue(!!this.saves.load()); this.ui.hud(false); this.ui.refreshStageSelect(this); this.ui.show('menu');
    requestAnimationFrame(t=>this.loop(t));
  }catch(e){ console.error(e); this.ui.error(e.message); }
 }
 resize(){ this.renderer.resize(); this.camera.resize(this.renderer.width,this.renderer.height); }
 defaultStageState(stage){ return {x:(stage.start.col+.5)*32, y:(stage.start.row+.5)*32, found:[], discovered:[], seconds:0}; }
 get stage(){ return STAGES[this.currentStageIndex]; }
 totalFound(){ return Object.values(this.stageStates).reduce((sum,s)=>sum+(s?.found?.length||0),0); }
 loadStage(index, freshPosition=false){
  const stage=STAGES[index]; if(!stage) return; this.currentStageIndex=index;
  const state=this.stageStates[stage.id] || this.defaultStageState(stage); this.stageStates[stage.id]=state;
  this.world.loadStageByIndex(index,state); this.renderer.build(this.world);
  const px = freshPosition ? (this.world.start.x) : (Number.isFinite(state.x)?state.x:this.world.start.x);
  const py = freshPosition ? (this.world.start.y) : (Number.isFinite(state.y)?state.y:this.world.start.y);
  this.player=new Player(px,py); if(!this.world.canStand(this.player.x,this.player.y)){ this.player.x=this.world.start.x; this.player.y=this.world.start.y; }
  this.discovered=new Set(state.discovered||[]); this.seconds=Number(state.seconds)||0; this.pendingExcavation=null;
  this.camera.ready=false; this.state='playing'; this.input.clear(); this.ui.show(null); this.ui.hud(true); this.discover(); this.ui.updateHUD(this); this.save();
 }
 newGame(){
  this.saves.erase(); this.unlockedStages=new Set([0]); this.stageStates={}; this.loadStage(0, true);
  this.ui.toast('A campanha começou. Abra o mapa e siga a primeira pista.');
 }
 continueGame(){
  const saved=this.saves.load(); if(!saved){ this.newGame(); return; }
  this.unlockedStages=new Set((saved.unlockedStages||[0]).map(Number));
  this.stageStates=saved.stageStates||{};
  this.settings.zoom=[1.5,2,2.5].includes(saved.settings?.zoom)?saved.settings.zoom:this.settings.zoom;
  this.settings.reducedMotion=!!saved.settings?.reducedMotion; this.camera.zoom=this.settings.zoom;
  this.loadStage(Number(saved.currentStage)||0, false); this.ui.toast('Campanha restaurada.');
 }
 openStage(index){ if(!this.unlockedStages.has(index)) return; this.saveCurrentStage(); this.loadStage(index,true); this.ui.toast(`Estágio ${index+1}: ${STAGES[index].name}`); }
 saveCurrentStage(){ const st=this.stageStates[this.stage.id] || this.defaultStageState(this.stage); st.x=this.player.x; st.y=this.player.y; st.found=[...this.world.found]; st.discovered=[...this.discovered]; st.seconds=this.seconds; this.stageStates[this.stage.id]=st; }
 changeZoom(zoom){ if(![1.5,2,2.5].includes(zoom)) return; this.settings.zoom=zoom; this.camera.zoom=zoom; this.camera.ready=false; this.saveSettings(); this.save(); }
 setReducedMotion(value){ this.settings.reducedMotion=!!value; this.saveSettings(); }
 saveSettings(){ try{ localStorage.setItem('tesouro-settings', JSON.stringify(this.settings)); }catch{} }
 save(){ if(['playing','paused','journal','map','settings','stages'].includes(this.state)) this.saveCurrentStage(); this.saves.save({currentStage:this.currentStageIndex, unlockedStages:[...this.unlockedStages], stageStates:this.stageStates, settings:this.settings}); }
 pause(){ if(this.state!=='playing') return; this.state='paused'; this.input.clear(); this.save(); this.ui.show('pause'); this.ui.hud(false); }
 resume(){ if(!['paused','settings','stages'].includes(this.state)) return; this.state='playing'; this.input.clear(); this.ui.show(null); this.ui.hud(true); }
 backToMenu(){ this.save(); this.state='menu'; this.input.clear(); this.ui.updateContinue(!!this.saves.load()); this.ui.refreshStageSelect(this); this.ui.show('menu'); this.ui.hud(false); }
 openJournal(){ if(this.state!=='playing') return; this.state='journal'; this.input.clear(); this.ui.updateJournal(this); this.ui.show('journal'); this.ui.hud(false); }
 closeJournal(){ if(this.state!=='journal') return; this.state='playing'; this.input.clear(); this.ui.show(null); this.ui.hud(true); }
 openMap(){ if(this.state!=='playing') return; this.state='map'; this.input.clear(); this.ui.updateMap(this); this.ui.show('map'); this.ui.hud(false); }
 closeMap(){ if(this.state!=='map') return; this.state='playing'; this.input.clear(); this.ui.show(null); this.ui.hud(true); }
 openStages(origin='menu'){ this.ui.stageReturn=origin; if(origin!=='menu') this.state='stages'; this.input.clear(); this.ui.refreshStageSelect(this); this.ui.show('stages'); if(origin!=='menu') this.ui.hud(false); }
 closeStages(){ if(this.ui.stageReturn==='menu'){ this.state='menu'; this.ui.show('menu'); this.ui.hud(false); return; } this.resume(); }
 discover(){
  for(const area of this.world.areas){ if(this.discovered.has(area.id)) continue; const d=Math.hypot(this.player.x/32-area.x,this.player.y/32-area.y); if(d<area.radius*.8){ this.discovered.add(area.id); this.ui.toast('✦ Referência reconhecida: '+area.name); this.save(); } }
 }
 interact(){
  const target=this.world.nearestInteractive(this.player.x,this.player.y);
  if(!target){ this.ui.toast('Abra o mapa e procure o próximo marco do tesouro.'); return; }
  if(target.signId){ const sign=this.world.signs.find(s=>s.id===target.id); this.ui.toast(sign?.text || target.label || 'Uma antiga marca na paisagem.'); return; }
  if(target.kind==='chest'){ const t=this.stage.treasures.find(item=>item.id===target.id); this.ui.toast(`Tesouro ${t?.difficulty||''} já encontrado. As questões desse nível serão ligadas na Etapa 4.`); return; }
  if(target.kind==='buried' && this.player.dig()){
    this.pendingExcavation=target.id; this.ui.toast(`Você usa a pá para procurar o ${target.label.toLowerCase()}...`);
  }
 }
 finishDig(){
  if(!this.pendingExcavation) return; const id=this.pendingExcavation; this.pendingExcavation=null;
  const result=this.world.excavate(id); if(!result) return;
  if(!this.world.canStand(this.player.x,this.player.y)){
    const px=this.player.x, py=this.player.y, candidates=[];
    for(const r of [24,32,40,48,64]) for(const [dx,dy] of [[0,1],[-1,0],[1,0],[0,-1],[-1,1],[1,1],[-1,-1],[1,-1]]){ const k=Math.hypot(dx,dy); candidates.push([px+r*dx/k, py+r*dy/k]); }
    const safe=candidates.find(([x,y])=>this.world.canStand(x,y)); if(safe){ this.player.x=safe[0]; this.player.y=safe[1]; }
  }
  this.ui.toast(`✦ ${result.treasure.name} encontrado! Dificuldade: ${result.treasure.difficulty}.`);
  if(result.stageComplete){
    const next=this.currentStageIndex+1;
    if(next<STAGES.length && !this.unlockedStages.has(next)){ this.unlockedStages.add(next); this.ui.toast(`Novo estágio desbloqueado: ${STAGES[next].name}.`); }
    else if(next>=STAGES.length){ this.ui.toast('Parabéns! Todos os 10 estágios foram concluídos.'); }
  } else {
    const nextTreasure=this.world.currentTreasure(); if(nextTreasure) this.ui.toast(`Nova pista liberada: ${nextTreasure.difficulty}. Abra o mapa para continuar.`);
  }
  this.save(); this.ui.updateHUD(this); this.ui.refreshStageSelect(this);
 }
 loop(t){
  const dt=this.lastTick?Math.min((t-this.lastTick)/1000,.05):0; this.lastTick=t;
  if(this.input.consumePause()){
    if(this.state==='playing') this.pause();
    else if(this.state==='paused') this.resume();
    else if(this.state==='journal') this.closeJournal();
    else if(this.state==='map') this.closeMap();
    else if(this.state==='stages') this.closeStages();
    else if(this.state==='settings') this.ui.show(this.ui.settingsReturn);
  }
  if(this.state==='playing'){
    this.player.update(dt,this.input.vector(),this.world); if(this.pendingExcavation && !this.player.digTimer) this.finishDig();
    this.seconds+=dt; this.accSave+=dt; if(this.accSave>=5){ this.save(); this.accSave=0; }
    this.discover(); if(this.input.consumeAction() && !this.pendingExcavation) this.interact(); this.ui.updateHUD(this);
  } else this.input.consumeAction();
  this.camera.follow(this.player.x,this.player.y,this.world,Math.min(dt,.04));
  this.renderer.render(this.world,this.player,this.camera,t,this.settings.reducedMotion);
  requestAnimationFrame(next=>this.loop(next));
 }
}
