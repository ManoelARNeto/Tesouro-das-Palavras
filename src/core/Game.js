import {World} from '../world/World.js';
import {Player} from '../entities/Player.js';
import {Camera} from './Camera.js';
import {Input} from './Input.js';
import {SaveManager} from './SaveManager.js';
import {Renderer} from '../render/Renderer.js';
import {UI} from '../ui/UI.js';
import {QuestionRepository} from '../data/QuestionRepository.js';
import {STAGES, TOTAL_TREASURES} from '../world/stages.js';

export class Game {
 constructor(){
  this.world=new World(0);this.player=new Player(this.world.start.x,this.world.start.y);
  this.renderer=new Renderer(document.getElementById('game-canvas'));this.camera=new Camera();this.input=new Input();
  this.saves=new SaveManager();this.questions=new QuestionRepository();
  this.currentStageIndex=0;this.discovered=new Set();this.pendingExcavation=null;this.seconds=0;
  this.unlockedStages=new Set([0]);this.stageStates={};this.state='menu';this.lastTick=0;this.accSave=0;
  this.questionStats={};this.answeredCorrect=new Set();this.chestQuestionOverrides={};
  this.activeQuestion=null;this.activeChestId=null;this.answeredThisChallenge=false;this.finishedCampaign=false;
  let settings={};try{settings=this.saves.load()?.settings||JSON.parse(localStorage.getItem('tesouro-settings')||'{}')||{};}catch{}
  this.settings={zoom:[1.5,2,2.5].includes(settings.zoom)?settings.zoom:2,reducedMotion:!!settings.reducedMotion};
  this.camera.zoom=this.settings.zoom;this.ui=new UI(this);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.state==='playing')this.pause();});
  window.addEventListener('pagehide',()=>this.save());window.addEventListener('resize',()=>this.resize());
 }
 async boot(){
  try{
   await Promise.all([this.renderer.load(),this.questions.load()]);this.renderer.build(this.world);this.resize();
   this.ui.updateContinue(!!this.saves.load());this.ui.hud(false);this.ui.refreshStageSelect(this);this.ui.show('menu');
   requestAnimationFrame(t=>this.loop(t));
  }catch(e){console.error(e);this.ui.error(e.message);}
 }
 resize(){this.renderer.resize();this.camera.resize(this.renderer.width,this.renderer.height);}
 defaultStageState(stage){return {x:(stage.start.col+.5)*32,y:(stage.start.row+.5)*32,dug:[],opened:[],discovered:[],seconds:0};}
 get stage(){return STAGES[this.currentStageIndex];}
 totalFound(){return Object.values(this.stageStates).reduce((n,s)=>n+(s?.opened?.length||0),0);}
 loadStage(index,freshPosition=false){
  const stage=STAGES[index];if(!stage||!this.unlockedStages.has(index))return;
  this.currentStageIndex=index;const st=this.stageStates[stage.id]||this.defaultStageState(stage);this.stageStates[stage.id]=st;
  this.world.loadStageByIndex(index,st);this.renderer.build(this.world);
  const px=freshPosition?this.world.start.x:(Number.isFinite(st.x)?st.x:this.world.start.x);
  const py=freshPosition?this.world.start.y:(Number.isFinite(st.y)?st.y:this.world.start.y);
  this.player=new Player(px,py);if(!this.world.canStand(px,py)){this.player.x=this.world.start.x;this.player.y=this.world.start.y;}
  this.discovered=new Set(st.discovered||[]);this.seconds=Math.max(0,Number(st.seconds)||0);
  this.pendingExcavation=null;this.activeQuestion=null;this.activeChestId=null;this.answeredThisChallenge=false;
  this.camera.ready=false;this.state='playing';this.input.clear();this.ui.show(null);this.ui.hud(true);
  this.discover();this.ui.updateHUD(this);this.save();
 }
 newGame(){
  this.saves.erase();this.unlockedStages=new Set([0]);this.stageStates={};this.questionStats={};this.answeredCorrect.clear();this.chestQuestionOverrides={};this.finishedCampaign=false;
  this.loadStage(0,true);this.ui.toast('Abra o mapa e siga a primeira pista. Use a pá para revelar o baú.');
 }
 continueGame(){
  const saved=this.saves.load();if(!saved){this.newGame();return;}
  this.unlockedStages=new Set((saved.unlockedStages||[0]).filter(n=>Number.isInteger(n)&&n>=0&&n<STAGES.length));this.unlockedStages.add(0);
  this.stageStates=saved.stageStates||{};this.questionStats=saved.questionStats||{};
  this.answeredCorrect=new Set(saved.answeredCorrect||[]);this.chestQuestionOverrides=saved.chestQuestionOverrides||{};
  this.settings.zoom=[1.5,2,2.5].includes(saved.settings?.zoom)?saved.settings.zoom:this.settings.zoom;
  this.settings.reducedMotion=!!saved.settings?.reducedMotion;this.camera.zoom=this.settings.zoom;
  this.finishedCampaign=!!saved.finishedCampaign;
  const index=this.unlockedStages.has(Number(saved.currentStage))?Number(saved.currentStage):0;
  this.loadStage(index,false);this.ui.toast('Campanha restaurada. Os baús abertos permanecem abertos.');
 }
 openStage(index){
  if(!this.unlockedStages.has(index))return;
  if(this.state!=='menu')this.saveCurrentStage();
  this.loadStage(index,true);this.ui.toast(`Estágio ${index+1}: ${STAGES[index].name}`);
 }
 saveCurrentStage(){
  const st=this.stageStates[this.stage.id]||this.defaultStageState(this.stage);
  st.x=this.player.x;st.y=this.player.y;st.dug=[...this.world.dug];st.opened=[...this.world.opened];st.discovered=[...this.discovered];st.seconds=this.seconds;
  this.stageStates[this.stage.id]=st;
 }
 changeZoom(zoom){if(![1.5,2,2.5].includes(zoom))return;this.settings.zoom=zoom;this.camera.zoom=zoom;this.camera.ready=false;this.saveSettings();this.save();}
 setReducedMotion(value){this.settings.reducedMotion=!!value;this.saveSettings();this.save();}
 saveSettings(){try{localStorage.setItem('tesouro-settings',JSON.stringify(this.settings));}catch{}}
 save(){
  if(['playing','paused','journal','map','question','settings','stages'].includes(this.state))this.saveCurrentStage();
  return this.saves.save({currentStage:this.currentStageIndex,unlockedStages:[...this.unlockedStages],stageStates:this.stageStates,settings:this.settings,
   questionStats:this.questionStats,answeredCorrect:[...this.answeredCorrect],chestQuestionOverrides:this.chestQuestionOverrides,finishedCampaign:this.finishedCampaign});
 }
 pause(){if(this.state!=='playing')return;this.state='paused';this.input.clear();this.save();this.ui.show('pause');this.ui.hud(false);}
 resume(){if(!['paused','settings','stages'].includes(this.state))return;this.state='playing';this.input.clear();this.ui.show(null);this.ui.hud(true);}
 backToMenu(){this.save();this.state='menu';this.input.clear();this.ui.updateContinue(!!this.saves.load());this.ui.refreshStageSelect(this);this.ui.show('menu');this.ui.hud(false);}
 openJournal(){if(this.state!=='playing')return;this.state='journal';this.input.clear();this.ui.updateJournal(this);this.ui.show('journal');this.ui.hud(false);}
 closeJournal(){if(this.state!=='journal')return;this.state='playing';this.input.clear();this.ui.show(null);this.ui.hud(true);}
 openMap(){if(this.state!=='playing')return;this.state='map';this.input.clear();this.ui.updateMap(this);this.ui.show('map');this.ui.hud(false);}
 closeMap(){if(this.state!=='map')return;this.state='playing';this.input.clear();this.ui.show(null);this.ui.hud(true);}
 openStages(origin='menu'){this.ui.stageReturn=origin;if(origin!=='menu')this.state='stages';this.input.clear();this.ui.refreshStageSelect(this);this.ui.show('stages');if(origin!=='menu')this.ui.hud(false);}
 closeStages(){if(this.ui.stageReturn==='menu'){this.state='menu';this.ui.show('menu');this.ui.hud(false);return;}this.resume();}
 discover(){for(const area of this.world.areas){if(this.discovered.has(area.id))continue;
  const d=Math.hypot(this.player.x/32-area.x,this.player.y/32-area.y);
  if(d<area.radius*.8){this.discovered.add(area.id);this.ui.toast('✦ Referência reconhecida: '+area.name);this.save();}}
 }
 interact(){
  const target=this.world.nearestInteractive(this.player.x,this.player.y);
  if(!target){this.ui.toast('Abra o mapa e localize o tesouro indicado pela pista.');return;}
  if(target.signId){const sign=this.world.signs.find(s=>s.id===target.id);this.ui.toast(sign?.text||target.label||'Um marco antigo.');return;}
  if(target.kind==='chest'){
   if(this.world.opened.has(target.id)){this.ui.toast('Este baú já foi aberto. A conquista está salva.');return;}
   this.openChestQuestion(target.id);return;
  }
  if(target.kind==='buried' && this.player.dig()){
   this.pendingExcavation=target.id;this.ui.toast('Escavando com sua pá...');
  }
 }
 finishDig(){
  if(!this.pendingExcavation)return;const id=this.pendingExcavation;this.pendingExcavation=null;
  const result=this.world.excavate(id);if(!result)return;
  if(!this.world.canStand(this.player.x,this.player.y)){
   const px=this.player.x,py=this.player.y,candidates=[];
   for(const r of [24,32,40,48,64])for(const [dx,dy] of [[0,1],[-1,0],[1,0],[0,-1],[-1,1],[1,1],[-1,-1]]){
    const k=Math.hypot(dx,dy);candidates.push([px+r*dx/k,py+r*dy/k]);}
   const safe=candidates.find(([x,y])=>this.world.canStand(x,y));if(safe){this.player.x=safe[0];this.player.y=safe[1];}
  }
  this.save();this.ui.updateHUD(this);this.openChestQuestion(id);
 }
 openChestQuestion(id){
  const t=this.stage.treasures.find(t=>t.id===id);
  if(!t||!this.world.dug.has(id)||this.world.opened.has(id)||this.world.currentTreasure()?.id!==id)return;
  const q=this.questions.chestQuestion(id,t.difficulty,this.chestQuestionOverrides[id]);
  if(!q){this.ui.toast('O gabarito deste desafio não está validado. O baú continuará fechado.');return;}
  this.activeQuestion=q;this.activeChestId=id;this.answeredThisChallenge=false;
  this.state='question';this.input.clear();this.ui.showQuestion(this,q);this.ui.show('question');this.ui.hud(false);this.save();
 }
 answerQuestion(letter){
  if(this.state!=='question'||!this.activeQuestion||this.answeredThisChallenge)return null;
  const q=this.activeQuestion;if(!this.questions.assessable(q))return {accepted:false,message:'Questão sem gabarito validado.'};
  if(!q.alternativas.some(a=>a.id===letter))return {accepted:false,message:'Selecione uma alternativa antes de confirmar.'};
  const stats=this.questionStats[q.id]||{tentativas:0,erros:0,acertos:0,descritor:q.descritor,dificuldade:q.dificuldade};
  stats.tentativas++;stats.ultimaResposta=letter;stats.ultimaEtapa=this.stage.id;
  const ok=letter===q.gabarito.alternativa;
  if(!ok){stats.erros++;this.questionStats[q.id]=stats;this.save();return {accepted:true,correct:false,message:'Ainda não é essa a resposta. Releia o texto e compare as alternativas.',hint:q.dica||'Procure no texto elementos que comprovem a resposta.'};}
  stats.acertos++;this.questionStats[q.id]=stats;this.answeredCorrect.add(q.id);
  const result=this.world.openTreasure(this.activeChestId);
  if(!result)return {accepted:false,message:'Não foi possível confirmar o estado do baú.'};
  this.answeredThisChallenge=true;const next=this.currentStageIndex+1;
  if(result.stageComplete){
   if(next<STAGES.length)this.unlockedStages.add(next);
   else this.finishedCampaign=true;
  }
  this.save();this.ui.updateHUD(this);this.ui.refreshStageSelect(this);
  return {accepted:true,correct:true,stageComplete:result.stageComplete,campaignComplete:this.finishedCampaign,
   message:result.stageComplete?(this.finishedCampaign?'Tesouro Lendário aberto! Você concluiu os 10 estágios.':`Estágio concluído! ${STAGES[next].name} desbloqueado.`):'Resposta correta! O baú foi aberto e sua próxima pista está disponível.',
   why:q.justificativa||''};
 }
 changeQuestion(){
  if(this.state!=='question'||!this.activeQuestion||this.answeredThisChallenge)return false;
  const previous=this.activeQuestion;const excluded=new Set([previous.id,...Object.keys(this.questionStats).filter(id=>this.questionStats[id].ultimaEtapa===this.stage.id)]);
  const alternate=this.questions.alternative(previous,excluded,this.answeredCorrect);
  if(!alternate)return false;
  this.chestQuestionOverrides[this.activeChestId]=alternate.id;this.activeQuestion=alternate;
  this.ui.showQuestion(this,alternate);this.save();return true;
 }
 closeQuestion(){
  if(this.state!=='question')return;
  const completed=this.answeredThisChallenge;
  this.activeQuestion=null;this.activeChestId=null;this.answeredThisChallenge=false;this.state='playing';
  this.input.clear();this.ui.show(null);this.ui.hud(true);this.ui.updateHUD(this);
  if(completed){if(this.finishedCampaign){this.state='win';this.ui.show('win');this.ui.hud(false);}else if(this.world.currentTreasure())this.ui.toast('Abra o mapa: uma nova pista foi liberada.');else this.ui.toast('Estágio concluído! Use Pausa → Estágios para avançar.');}
  this.save();
 }
 loop(t){
  const dt=this.lastTick?Math.min((t-this.lastTick)/1000,.05):0;this.lastTick=t;
  if(this.input.consumePause()){
   if(this.state==='playing')this.pause();else if(this.state==='paused')this.resume();
   else if(this.state==='journal')this.closeJournal();else if(this.state==='map')this.closeMap();
   else if(this.state==='question')this.closeQuestion();else if(this.state==='stages')this.closeStages();
   else if(this.state==='settings')this.ui.show(this.ui.settingsReturn);
  }
  if(this.state==='playing'){
   this.player.update(dt,this.input.vector(),this.world);
   if(this.pendingExcavation&&!this.player.digTimer)this.finishDig();
   this.seconds+=dt;this.accSave+=dt;if(this.accSave>=5){this.save();this.accSave=0;}
   this.discover();if(this.input.consumeAction()&&!this.pendingExcavation)this.interact();this.ui.updateHUD(this);
  }else this.input.consumeAction();
  this.camera.follow(this.player.x,this.player.y,this.world,Math.min(dt,.04));
  this.renderer.render(this.world,this.player,this.camera,t,this.settings.reducedMotion);
  requestAnimationFrame(next=>this.loop(next));
 }
}
