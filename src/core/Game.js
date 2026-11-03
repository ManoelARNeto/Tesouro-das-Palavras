import {World} from '../world/World.js';
import {Player} from '../entities/Player.js';
import {Camera} from './Camera.js';
import {Input} from './Input.js';
import {SaveManager} from './SaveManager.js';
import {Renderer} from '../render/Renderer.js';
import {UI} from '../ui/UI.js';
import {QuestionRepository} from '../data/QuestionRepository.js';
import {STAGES, TOTAL_TREASURES} from '../world/stages.js';
import {SECRET_STAGE} from '../world/secret-stage.js';
import {blankRewards,ensureStageAttempt,recordAnswerForChest,grantChestCoins,awardStageFragment,secretUnlocked,resetStageChallenge,SECRET_STAGE_INDEX} from './Rewards.js';

export class Game {
 constructor(){
  this.world=new World(0);this.player=new Player(this.world.start.x,this.world.start.y);
  this.renderer=new Renderer(document.getElementById('game-canvas'));this.camera=new Camera();this.input=new Input();
  this.saves=new SaveManager();this.questions=new QuestionRepository();
  this.currentStageIndex=0;this.discovered=new Set();this.pendingExcavation=null;this.seconds=0;
  this.unlockedStages=new Set([0]);this.stageStates={};this.state='menu';this.lastTick=0;this.accSave=0;this.hudAcc=0;this.renderAcc=0;
  this.questionStats={};this.answeredCorrect=new Set();this.chestQuestionOverrides={};
  this.activeQuestion=null;this.activeChestId=null;this.answeredThisChallenge=false;this.finishedCampaign=false;this.winPending=false;
  this.economy=blankRewards();
  let settings={};try{settings=this.saves.load()?.settings||JSON.parse(localStorage.getItem('tesouro-settings')||'{}')||{};}catch{}
  this.settings={zoom:[1.5,2,2.5].includes(settings.zoom)?settings.zoom:2,reducedMotion:settings.reducedMotion===undefined?!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches:!!settings.reducedMotion};
  this.camera.zoom=this.settings.zoom;this.ui=new UI(this);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.state==='playing')this.pause();});
  window.addEventListener('pagehide',()=>this.save());window.addEventListener('resize',()=>this.resize());
 }
 async boot(){
  try{
   await Promise.all([this.renderer.load(),this.questions.load()]);this.renderer.build(this.world);this.resize();
   const preview=this.saves.load();
   if(preview)this.restoreSnapshot(preview);
   this.ui.updateContinue(!!preview);this.ui.hud(false);this.ui.refreshStageSelect(this);this.ui.show('menu');
   requestAnimationFrame(t=>this.loop(t));
  }catch(e){console.error(e);this.ui.error(e.message);}
 }
 resize(){this.renderer.resize();this.camera.resize(this.renderer.width,this.renderer.height);}
 /** Restaura TODO o histórico mesmo quando o aluno escolhe um estágio diretamente no menu. */
 restoreSnapshot(saved){
  this.unlockedStages=new Set((saved.unlockedStages||[0]).filter(n=>Number.isInteger(n)&&n>=0&&n<STAGES.length));this.unlockedStages.add(0);
  this.stageStates=saved.stageStates||{};this.questionStats=saved.questionStats||{};this.economy=saved.economy||blankRewards();
  this.answeredCorrect=new Set(saved.answeredCorrect||[]);this.chestQuestionOverrides=saved.chestQuestionOverrides||{};
  this.settings.zoom=[1.5,2,2.5].includes(saved.settings?.zoom)?saved.settings.zoom:this.settings.zoom;
  this.settings.reducedMotion=!!saved.settings?.reducedMotion;this.camera.zoom=this.settings.zoom;this.finishedCampaign=!!saved.finishedCampaign;
 }
 /** Arquivo de backup: sem dados pessoais, adequado à transferência entre navegadores. */
 exportBackup(){
  // Não sobrescrever o último estágio salvo se o aluno estiver somente no menu.
  if(this.state!=='menu')this.save();
  return this.saves.load();
 }
 importBackup(data){
  if(!this.saves.importBackup(data))return false;
  this.restoreSnapshot(data);this.continueGame();return true;
 }
 defaultStageState(stage){return {x:(stage.start.col+.5)*32,y:(stage.start.row+.5)*32,dug:[],opened:[],discovered:[],seconds:0,attempts:{},firstTry:{},replays:0};}
 get stage(){return this.currentStageIndex===SECRET_STAGE_INDEX?SECRET_STAGE:STAGES[this.currentStageIndex];}
 get isSecretStage(){return this.currentStageIndex===SECRET_STAGE_INDEX;}
 get secretUnlocked(){return secretUnlocked(this.economy);}
 get fragmentCount(){return this.economy.fragments.length;}
 get coinCount(){return this.economy.coins;}
 hasFragment(stage){return this.economy.fragments.includes(stage.id);}
 totalFound(){return this.economy.rewardedChests.length;}
 loadStage(index,freshPosition=false){
  const stage=index===SECRET_STAGE_INDEX?SECRET_STAGE:STAGES[index];if(!stage||(index===SECRET_STAGE_INDEX?!this.secretUnlocked:!this.unlockedStages.has(index)))return;
  this.currentStageIndex=index;const st=this.stageStates[stage.id]||this.defaultStageState(stage);ensureStageAttempt(st,stage);this.stageStates[stage.id]=st;
  this.world.loadStageByIndex(index,st);this.renderer.build(this.world);
  const px=freshPosition?this.world.start.x:(Number.isFinite(st.x)?st.x:this.world.start.x);
  const py=freshPosition?this.world.start.y:(Number.isFinite(st.y)?st.y:this.world.start.y);
  this.player=new Player(px,py);if(!this.world.canStand(px,py)){this.player.x=this.world.start.x;this.player.y=this.world.start.y;}
  this.discovered=new Set(st.discovered||[]);this.seconds=Math.max(0,Number(st.seconds)||0);
  this.pendingExcavation=null;this.activeQuestion=null;this.activeChestId=null;this.answeredThisChallenge=false;
  this.camera.ready=false;this.state='playing';this.winPending=false;this.input.clear();this.ui.show(null);this.ui.hud(true);
  this.discover();this.ui.updateHUD(this);this.save();
 }
 newGame(){
  this.saves.erase();this.unlockedStages=new Set([0]);this.stageStates={};this.questionStats={};this.answeredCorrect.clear();this.chestQuestionOverrides={};this.finishedCampaign=false;this.winPending=false;this.economy=blankRewards();
  this.loadStage(0,true);this.ui.toast('Abra o mapa e siga a primeira pista. Use a pá para revelar o baú.');
 }
 continueGame(){
  const saved=this.saves.load();if(!saved){this.newGame();return;}
  this.restoreSnapshot(saved);
  const savedIndex=Number(saved.currentStage);const index=(savedIndex===SECRET_STAGE_INDEX?this.secretUnlocked:this.unlockedStages.has(savedIndex))?savedIndex:0;
  this.loadStage(index,false);this.ui.toast('Campanha restaurada. Os baús abertos permanecem abertos.');
 }
 advanceStage(){
  if(this.state!=='playing'||this.isSecretStage||this.world.currentTreasure())return false;
  const next=this.currentStageIndex+1;
  if(next<STAGES.length && this.unlockedStages.has(next)){this.openStage(next);return true;}
  if(next===STAGES.length && this.secretUnlocked){this.openStage(SECRET_STAGE_INDEX);return true;}
  this.openStages('playing');return true;
 }
 openStage(index){
  if(index===SECRET_STAGE_INDEX?!this.secretUnlocked:!this.unlockedStages.has(index))return;
  if(this.state!=='menu')this.saveCurrentStage();
  this.loadStage(index,true);this.ui.toast(index===SECRET_STAGE_INDEX?'Cenário secreto: '+SECRET_STAGE.name:`Estágio ${index+1}: ${STAGES[index].name}`);
 }
 retryStage(index){
  const stage=STAGES[index];if(!stage||!this.unlockedStages.has(index)||this.hasFragment(stage))return false;
  if(this.state!=='menu')this.saveCurrentStage();
  const st=this.stageStates[stage.id];if(!st||!resetStageChallenge(st,stage))return false;
  for(const chest of stage.treasures){
   delete this.chestQuestionOverrides[chest.id];
   const fresh=this.questions.replayQuestion(chest.id,chest.difficulty,this.answeredCorrect,st.replays);
   if(fresh)this.chestQuestionOverrides[chest.id]=fresh.id;
  }
  this.loadStage(index,true);this.ui.toast('Nova tentativa de fragmento: acerte os três baús de primeira. As moedas e conquistas anteriores foram preservadas.');return true;
 }
 finishSecret(){
  if(!this.isSecretStage||!this.secretUnlocked)return false;
  const first=!this.economy.secretCompleted;
  this.economy.secretCompleted=true;this.economy.relic=true;this.save();
  this.state='secret-win';this.input.clear();this.ui.updateSecretWin(first);this.ui.show('secret-win');this.ui.hud(false);return true;
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
  if(this.state==='menu'){
   const previous=this.saves.load();
   return previous?this.saves.save({...previous,settings:this.settings}):false;
  }
  if(['playing','paused' ,'journal','inventory','map','question','settings','stages','secret-win'].includes(this.state))this.saveCurrentStage();
  return this.saves.save({currentStage:this.currentStageIndex,unlockedStages:[...this.unlockedStages],stageStates:this.stageStates,settings:this.settings,
   questionStats:this.questionStats,answeredCorrect:[...this.answeredCorrect],chestQuestionOverrides:this.chestQuestionOverrides,finishedCampaign:this.finishedCampaign,economy:this.economy});
 }
 pause(){if(this.state!=='playing')return;this.state='paused';this.input.clear();this.save();this.ui.show('pause');this.ui.hud(false);}
 resume(){if(!['paused','settings','stages'].includes(this.state))return;this.state='playing';this.input.clear();this.ui.show(null);this.ui.hud(true);}
 backToMenu(){this.save();this.state='menu';this.input.clear();this.ui.updateContinue(!!this.saves.load());this.ui.refreshStageSelect(this);this.ui.show('menu');this.ui.hud(false);}
 openJournal(){if(this.state!=='playing')return;this.state='journal';this.input.clear();this.ui.updateJournal(this);this.ui.show('journal');this.ui.hud(false);}
 closeJournal(){if(this.state!=='journal')return;this.state='playing';this.input.clear();this.ui.show(null);this.ui.hud(true);}
 openInventory(){if(!['playing','paused','win','secret-win'].includes(this.state))return;this.inventoryReturn=this.state;this.state='inventory';this.input.clear();this.ui.updateInventory(this);this.ui.show('inventory');this.ui.hud(false);this.save();}
 closeInventory(){if(this.state!=='inventory')return;const previous=this.inventoryReturn||'playing';this.state=previous;this.input.clear();this.ui.show(previous==='playing'?null:previous);this.ui.hud(previous==='playing');}
 openMap(){if(this.state!=='playing')return;this.state='map';this.input.clear();this.ui.updateMap(this);this.ui.show('map');this.ui.hud(false);}
 closeMap(){if(this.state!=='map')return;this.state='playing';this.input.clear();this.ui.show(null);this.ui.hud(true);}
 openStages(origin='menu'){this.ui.stageReturn=origin;if(origin!=='menu')this.state='stages';this.input.clear();this.ui.refreshStageSelect(this);this.ui.show('stages');if(origin!=='menu')this.ui.hud(false);}
 closeStages(){
  if(this.ui.stageReturn==='menu'){this.state='menu';this.ui.show('menu');this.ui.hud(false);return;}
  if(this.ui.stageReturn==='pause'){this.state='paused';this.input.clear();this.ui.show('pause');this.ui.hud(false);return;}
  this.resume();
 }
 discover(){for(const area of this.world.areas){if(this.discovered.has(area.id))continue;
  const d=Math.hypot(this.player.x/32-area.x,this.player.y/32-area.y);
  if(d<area.radius*.8){this.discovered.add(area.id);this.ui.toast('✦ Referência reconhecida: '+area.name);this.save();}}
 }
 interact(){
  const target=this.world.nearestInteractive(this.player.x,this.player.y);
  if(!target){this.ui.toast('Abra o mapa e localize o tesouro indicado pela pista.');return;}
  if(this.isSecretStage&&target.signId==='altar-livro'){this.finishSecret();return;}
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
  const st=this.stageStates[this.stage.id]||this.defaultStageState(this.stage);
  const attempt=recordAnswerForChest(st,this.activeChestId,ok);this.stageStates[this.stage.id]=st;
  if(!ok){stats.erros++;this.questionStats[q.id]=stats;this.save();return {accepted:true,correct:false,message:'Ainda não é essa a resposta. Releia o texto e compare as alternativas.',hint:q.dica||'Procure no texto elementos que comprovem a resposta.'};}
  stats.acertos++;this.questionStats[q.id]=stats;this.answeredCorrect.add(q.id);
  const result=this.world.openTreasure(this.activeChestId);
  if(!result)return {accepted:false,message:'Não foi possível confirmar o estado do baú.'};
  this.answeredThisChallenge=true;const next=this.currentStageIndex+1;
  const coinsEarned=grantChestCoins(this.economy,result.treasure);
  this.saveCurrentStage();
  const fragmentEarned=result.stageComplete&&awardStageFragment(this.economy,this.stage,this.stageStates[this.stage.id]);
  const secretOpened=fragmentEarned&&this.secretUnlocked;

  if(result.stageComplete){
   if(next<STAGES.length)this.unlockedStages.add(next);
   else {this.finishedCampaign=true;this.winPending=true;}
  }
  this.save();this.ui.updateHUD(this);this.ui.refreshStageSelect(this);
  const base=result.stageComplete?(next>=STAGES.length?'Os dez estágios foram concluídos.':`Estágio concluído! ${STAGES[next].name} está disponível.`):'Resposta correta! O baú foi aberto e sua próxima pista está disponível.';
  const rewardText=` +${coinsEarned} moedas`+(fragmentEarned?' • Você ganhou um fragmento do mapa antigo!':'')+(secretOpened?' • Cenário secreto desbloqueado!':'');
  return {accepted:true,correct:true,stageComplete:result.stageComplete,campaignComplete:this.winPending,
   firstTry:attempt.firstTry,fragmentEarned,secretOpened,coinsEarned,
   message:base+rewardText,why:q.justificativa||''};
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
  if(completed){if(this.winPending){this.winPending=false;this.state='win';this.ui.updateCampaignWin(this);this.ui.show('win');this.ui.hud(false);}else if(this.world.currentTreasure())this.ui.toast('Abra o mapa: uma nova pista foi liberada.');else this.ui.toast('Estágio concluído! Use Pausa → Estágios para avançar.');}
  this.save();
 }
 loop(t){
  const dt=this.lastTick?Math.min((t-this.lastTick)/1000,.05):0;this.lastTick=t;
  const menu=this.input.consumeMenu();
  if(this.state==='playing' && menu==='map')this.openMap();
  else if(this.state==='playing' && menu==='inventory')this.openInventory();
  else if(this.state==='playing' && menu==='journal')this.openJournal();
  if(this.input.consumePause()){
   if(this.state==='playing')this.pause();else if(this.state==='paused')this.resume();
   else if(this.state==='journal')this.closeJournal();else if(this.state==='inventory')this.closeInventory();else if(this.state==='map')this.closeMap();
   else if(this.state==='question')this.closeQuestion();else if(this.state==='stages')this.closeStages();
   else if(this.state==='settings')this.ui.show(this.ui.settingsReturn);
  }
  if(this.state==='playing'){
   this.player.update(dt,this.input.vector(),this.world);
   if(this.pendingExcavation&&!this.player.digTimer)this.finishDig();
   this.seconds+=dt;this.accSave+=dt;if(this.accSave>=5){this.save();this.accSave=0;}
   this.discover();if(this.input.consumeAction()&&!this.pendingExcavation)this.interact();
   this.hudAcc+=dt;if(this.hudAcc>=.10){this.ui.updateHUD(this);this.hudAcc=0;}
  }else this.input.consumeAction();
  this.camera.follow(this.player.x,this.player.y,this.world,Math.min(dt,.04));
  // Menus não precisam renderizar o mundo 60 vezes por segundo.
  if(this.state==='playing'||t-this.renderAcc>=80){this.renderer.render(this.world,this.player,this.camera,t,this.settings.reducedMotion);this.renderAcc=t;}
  requestAnimationFrame(next=>this.loop(next));
 }
}
