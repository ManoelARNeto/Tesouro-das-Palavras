import { STAGES, TOTAL_TREASURES } from '../world/stages.js';
import {SECRET_STAGE} from '../world/secret-stage.js';
import {FRAGMENTS_NEEDED,COINS_BY_DIFFICULTY,SECRET_STAGE_INDEX} from '../core/Rewards.js';
const $=id=>document.getElementById(id);

export class UI {
 constructor(game){
  this.game=game; this.stageReturn='menu'; this.libraryReturn='menu';
  $('btn-new').addEventListener('click',()=>game.newGame());
  $('btn-continue').addEventListener('click',()=>game.continueGame());
  $('btn-stage-menu').addEventListener('click',()=>game.openStages('menu'));
  $('btn-main-settings').addEventListener('click',()=>this.openSettings('menu'));
  $('btn-library-menu').addEventListener('click',()=>this.openLibrary('menu'));
  $('btn-library-pause').addEventListener('click',()=>this.openLibrary('pause'));
  $('btn-library-close').addEventListener('click',()=>this.closeLibrary());
  $('library-question-select').addEventListener('change',e=>this.showLibraryQuestion(e.target.value));
  $('btn-question-close').addEventListener('click',()=>game.closeQuestion());
  $('btn-question-switch').addEventListener('click',()=>game.changeQuestion());
  $('question-form').addEventListener('submit',e=>{e.preventDefault(); const selected=document.querySelector('input[name=question-answer]:checked');this.showQuestionResult(game.answerQuestion(selected?.value));});
  $('btn-win-menu').addEventListener('click',()=>game.backToMenu());
  $('btn-settings-pause').addEventListener('click',()=>this.openSettings('pause'));
  $('btn-back-settings').addEventListener('click',()=>this.show(this.settingsReturn));
  $('btn-pause').addEventListener('click',()=>game.pause());
  $('btn-resume').addEventListener('click',()=>game.resume());
  $('btn-go-menu').addEventListener('click',()=>game.backToMenu());
  $('btn-journal-close').addEventListener('click',()=>game.closeJournal());
  $('btn-journal-hud').addEventListener('click',()=>game.openJournal());
  $('btn-inventory-hud').addEventListener('click',()=>game.openInventory());
  $('btn-next-stage').addEventListener('click',()=>game.advanceStage());
  $('btn-save-export').addEventListener('click',()=>this.exportSave());
  $('btn-save-import').addEventListener('click',()=>$('save-file-input').click());
  $('save-file-input').addEventListener('change',e=>this.importSave(e.target.files?.[0]));
  $('btn-inventory-pause').addEventListener('click',()=>game.openInventory());
  $('btn-inventory-close').addEventListener('click',()=>game.closeInventory());
  $('btn-secret-from-inventory').addEventListener('click',()=>game.openStage(SECRET_STAGE_INDEX));
  $('btn-win-secret').addEventListener('click',()=>game.openStage(SECRET_STAGE_INDEX));
  $('btn-secret-win-inventory').addEventListener('click',()=>game.openInventory());
  $('btn-secret-win-menu').addEventListener('click',()=>game.backToMenu());
  $('btn-map-hud').addEventListener('click',()=>game.openMap());
  $('btn-map-close').addEventListener('click',()=>game.closeMap());
  $('btn-stage-close').addEventListener('click',()=>game.closeStages());
  $('btn-stages-pause').addEventListener('click',()=>game.openStages('pause'));
  $('setting-zoom').addEventListener('change',e=>game.changeZoom(Number(e.target.value)));
  $('setting-motion').addEventListener('change',e=>game.setReducedMotion(e.target.checked));
  $('btn-error-retry').addEventListener('click',()=>location.reload());
 }
 show(screen){ for(const name of ['menu','pause','settings','journal','inventory','map','stages','question','library','win','secret-win','error']) $(name+'-screen').hidden=name!==screen; this.screen=screen; if(screen)$('toasts').replaceChildren(); }
 hud(visible){ $('hud').hidden=!visible; $('touch-controls').hidden=!visible; $('hud-tip').hidden=!visible;$('economy-chip').hidden=!visible; }
 updateContinue(hasSave){ $('btn-continue').disabled=!hasSave; }
 openSettings(origin){ this.settingsReturn=origin; $('setting-zoom').value=String(this.game.settings.zoom); $('setting-motion').checked=this.game.settings.reducedMotion; $('backup-feedback').textContent='';this.show('settings'); }
 exportSave(){
  const data=this.game.exportBackup();
  if(!data){$('backup-feedback').textContent='Não foi possível acessar o salvamento local. Verifique as permissões do navegador.';return;}
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const href=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=href;link.download='Tesouro_das_Palavras_Progresso_v6.json';document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(href),1000);
  $('backup-feedback').textContent='Cópia de segurança preparada. Guarde o JSON em um lugar seguro.';
 }
 async importSave(file){
  if(!file)return;
  try{
   if(file.size>1024*1024)throw Error('O arquivo excede o limite de 1 MB.');
   const data=JSON.parse(await file.text());
   if(!this.game.saves.validSession(data)||data.version!==6)throw Error('Formato de salvamento incompatível ou incompleto.');
   if(!window.confirm('Importar esta cópia substituirá o progresso atual neste navegador. Deseja continuar?'))return;
   if(!this.game.importBackup(data))throw Error('Não foi possível gravar a cópia neste navegador.');
   this.toast('Progresso importado! Continue sua campanha.');
  }catch(e){$('backup-feedback').textContent='Importação não realizada: '+e.message;}
  finally{$('save-file-input').value='';}
 }
 updateHUD(game){
  const area=game.world.areaAt(game.player.x,game.player.y); const current=game.world.currentTreasure();
  $('area-label').textContent=area?.name||game.stage.name;
  $('stage-label-hud').textContent=game.isSecretStage?'SECRETO':`${game.stage.number} / ${STAGES.length}`;
  $('dig-progress').textContent=game.isSecretStage?'★':`${game.world.found.size} / ${game.stage.treasures.length}`;
  $('global-progress').textContent=`${game.totalFound()} / ${TOTAL_TREASURES}`;
  $('btn-next-stage').hidden=game.isSecretStage || !!current || (game.currentStageIndex===STAGES.length-1 && !game.secretUnlocked);
  $('coins-hud').textContent=game.coinCount; $('fragments-hud').textContent=`${game.fragmentCount} / ${FRAGMENTS_NEEDED}`;
  $('mission-label').textContent=game.isSecretStage?(game.economy.secretCompleted?'Relíquia recuperada! Explore livremente a ilha.':'Encontre o Altar do Livro e pressione AÇÃO.') : current ? (game.world.dug.has(current.id) ? `Baú ${current.difficulty.toLowerCase()} encontrado! Interaja para responder à questão.` : `Siga a pista do tesouro ${current.difficulty.toLowerCase()} deste estágio.`) : 'Estágio concluído. Você já pode seguir para o próximo cenário.';
  $('travel-time').textContent=this.formatTime(game.seconds);
  const target=game.world.nearestInteractive(game.player.x,game.player.y);
  $('interaction-prompt').hidden=!target||!!game.pendingExcavation;
  if(target){ const label=target.signId?'Ler marco':target.kind==='buried'?'Cavar com a pá':game.world.opened.has(target.id)?'Baú já aberto':'Resolver questão do baú'; $('interaction-label').textContent=label; $('mobile-action').setAttribute('aria-label',label); }
 }
 formatTime(seconds){ const mm=Math.floor(seconds/60),ss=Math.floor(seconds%60); return `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`; }
 updateJournal(game){
  $('journal-title').textContent=`CAMPANHA — ${game.totalFound()} / ${TOTAL_TREASURES} TESOUROS`;
  $('journal-count').textContent=`${game.unlockedStages.size} de ${STAGES.length} estágios desbloqueados • ${game.fragmentCount}/${FRAGMENTS_NEEDED} fragmentos`; 
  const list=$('journal-items'); list.replaceChildren();
  STAGES.forEach((stage,index)=>{
    const state=game.stageStates[stage.id] || {opened:[]}; const li=document.createElement('li');
    li.className=game.unlockedStages.has(index)?((state.opened||[]).length===3?'found':'partial'):'unknown';
    const mark=document.createElement('span'); mark.className='journal-mark'; mark.textContent=(state.opened||[]).length===3?'✓':game.unlockedStages.has(index)?stage.number:'?';
    const body=document.createElement('div'); const title=document.createElement('strong'); title.textContent=`${stage.number}. ${stage.name}`;
    const desc=document.createElement('p'); desc.textContent=`${stage.stageHint} Progresso desta rodada: ${(state.opened||[]).length}/3 tesouros. Fragmento: ${game.hasFragment(stage)?'conquistado':'não conquistado'}.`; 
    body.append(title,desc); li.append(mark,body); list.append(li);
  });
  const clueList=$('journal-treasure-items'); clueList.replaceChildren();
  for(const treasure of game.stage.treasures){ const found=game.world.found.has(treasure.id); const li=document.createElement('li'); li.className=found?'found':'unknown';
    const mark=document.createElement('span'); mark.className='journal-mark'; mark.textContent=found?'✦':treasure.difficulty[0];
    const body=document.createElement('div'); const title=document.createElement('strong'); title.textContent=`${treasure.difficulty} — ${found?treasure.name:'Tesouro ainda não localizado'}`;
    const desc=document.createElement('p'); desc.textContent=found?(`Baú aberto. ${game.stageStates[game.stage.id]?.firstTry?.[treasure.id]?'Acerto na primeira tentativa!':'Acerto após nova tentativa ou registro anterior.'}`):game.world.currentTreasure()?.id===treasure.id?treasure.clue:'Pista bloqueada até abrir o baú anterior.';
    body.append(title,desc); li.append(mark,body); clueList.append(li); }
  const landmarkList=$('journal-secret-items'); landmarkList.replaceChildren();
  for(const area of game.world.areas){ const found=game.discovered.has(area.id); const li=document.createElement('li'); li.className=found?'found':'unknown';
    const mark=document.createElement('span'); mark.className='journal-mark'; mark.textContent=found?'⌖':'?';
    const body=document.createElement('div'); const title=document.createElement('strong'); title.textContent=found?area.name:'Marco ainda não reconhecido';
    const desc=document.createElement('p'); desc.textContent=found?'Você já usou esse ponto de referência para interpretar o mapa.':'Explore o estágio e aproxime-se dos marcos para reconhecê-los.';
    body.append(title,desc); li.append(mark,body); landmarkList.append(li); }
  $('journal-treasure-count').textContent=`${game.world.opened.size} de ${game.stage.treasures.length} baús abertos neste estágio`;
  $('journal-secret-count').textContent=`${game.discovered.size} de ${game.world.areas.length} marcos reconhecidos neste estágio`;
 }
 updateMap(game){
  $('map-stage-title').textContent=`ESTÁGIO ${game.stage.number} — ${game.stage.name}`;
  $('map-stage-subtitle').textContent=game.stage.stageHint;
  const current=game.world.currentTreasure();
  $('map-difficulty').textContent=current ? current.difficulty : (game.isSecretStage?'Secreto':'Concluído');
  $('map-clue-text').textContent=current ? current.clue : (game.isSecretStage?'Explore a Ilha das Palavras Perdidas. Encontre o Altar do Livro e pressione E / AÇÃO.':'Você concluiu os três tesouros deste estágio. Escolha o próximo cenário no seletor de estágios.');
  this.drawTreasureMap(game.stage, current);
 }
 drawTreasureMap(stage, treasure){
  const canvas=$('map-canvas'), ctx=canvas.getContext('2d'); const w=canvas.width, h=canvas.height;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle='#ead2a0'; ctx.fillRect(14,14,w-28,h-28);
  ctx.fillStyle='#d9b77b';
  const corners=[[20,20],[w-34,22],[24,h-30],[w-36,h-34]]; corners.forEach(([x,y],i)=>{ ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+14,y+4); ctx.lineTo(x+4,y+14); ctx.closePath(); ctx.fill(); });
  ctx.strokeStyle='#8e6a3f'; ctx.lineWidth=3; ctx.strokeRect(14,14,w-28,h-28);
  // Decorative tears
  ctx.fillStyle='#c89f62'; for(const x of [90,220,360]){ ctx.beginPath(); ctx.arc(x,16,7,0,Math.PI); ctx.fill(); }
  const pad=38, sx=(w-pad*2)/(stage.cols-1), sy=(h-pad*2)/(stage.rows-1);
  const toXY=(col,row)=>[pad+col*sx,pad+row*sy];
  // faint landmarks
  for(const lm of stage.landmarks){ const [x,y]=toXY(lm.col,lm.row); this.drawLandmarkIcon(ctx,lm.icon,x,y,'#6e4e2f',0.55); }
  if(treasure){
    const route = treasure.route.map(id=>stage.landmarks.find(l=>l.id===id)).filter(Boolean);
    ctx.setLineDash([7,8]); ctx.strokeStyle='#6d5338'; ctx.lineWidth=2.5; ctx.beginPath();
    route.forEach((lm,index)=>{ const [x,y]=toXY(lm.col,lm.row); if(index===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    const [tx,ty]=toXY(treasure.col, treasure.row); if(route.length){ const [lx,ly]=toXY(route[route.length-1].col, route[route.length-1].row); ctx.lineTo(tx,ty); } ctx.stroke(); ctx.setLineDash([]);
    route.forEach(lm=>{ const [x,y]=toXY(lm.col,lm.row); this.drawLandmarkIcon(ctx,lm.icon,x,y,'#5b3c25',1); });
    ctx.strokeStyle='#c33d2d'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(tx-10,ty-10); ctx.lineTo(tx+10,ty+10); ctx.moveTo(tx+10,ty-10); ctx.lineTo(tx-10,ty+10); ctx.stroke();
  }
  // skull inspired by reference
  ctx.fillStyle='#5b3c25'; ctx.beginPath(); ctx.arc(w-70,h-78,14,0,Math.PI*2); ctx.fill(); ctx.fillRect(w-78,h-67,16,10); ctx.clearRect(w-76,h-85,4,4); ctx.clearRect(w-68,h-85,4,4);
  // waves
  ctx.strokeStyle='#537c85'; ctx.lineWidth=2; for(const [x,y] of [[w-135,72],[w-120,82],[88,h-88]]){ ctx.beginPath(); ctx.moveTo(x,y); ctx.quadraticCurveTo(x+8,y-5,x+16,y); ctx.quadraticCurveTo(x+24,y+5,x+32,y); ctx.stroke(); }
 }
 drawLandmarkIcon(ctx, icon, x, y, color='#5b3c25', alpha=1){
  ctx.save(); ctx.translate(x,y); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.globalAlpha=alpha; ctx.lineWidth=2;
  switch(icon){
    case 'camp': case 'hut': ctx.beginPath(); ctx.moveTo(-10,8); ctx.lineTo(0,-10); ctx.lineTo(10,8); ctx.closePath(); ctx.stroke(); break;
    case 'bridge': case 'stairs': ctx.beginPath(); ctx.moveTo(-12,6); ctx.quadraticCurveTo(0,-8,12,6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-10,6); ctx.lineTo(-10,10); ctx.moveTo(10,6); ctx.lineTo(10,10); ctx.stroke(); break;
    case 'palms': case 'oasis': case 'isle': ctx.beginPath(); ctx.moveTo(0,10); ctx.lineTo(0,-6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,-5); ctx.lineTo(-8,-10); ctx.moveTo(0,-5); ctx.lineTo(8,-9); ctx.moveTo(0,-7); ctx.lineTo(-4,-15); ctx.stroke(); break;
    case 'rocks': case 'stones': case 'rock': case 'arch': ctx.beginPath(); ctx.moveTo(-10,8); ctx.lineTo(-4,-8); ctx.lineTo(4,-5); ctx.lineTo(10,8); ctx.closePath(); ctx.stroke(); break;
    case 'cave': ctx.beginPath(); ctx.moveTo(-12,8); ctx.quadraticCurveTo(0,-12,12,8); ctx.stroke(); ctx.fillRect(-4,-1,8,9); break;
    case 'waves': ctx.beginPath(); ctx.moveTo(-12,0); ctx.quadraticCurveTo(-6,-4,0,0); ctx.quadraticCurveTo(6,4,12,0); ctx.stroke(); break;
    case 'reeds': ctx.beginPath(); for(const dx of [-4,0,4]){ ctx.moveTo(dx,10); ctx.lineTo(dx-1,-8); } ctx.stroke(); break;
    case 'mushroom': ctx.beginPath(); ctx.arc(0,-2,8,Math.PI,0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,-2); ctx.lineTo(0,10); ctx.stroke(); break;
    case 'gate': case 'pillars': case 'obelisk': case 'pillar': case 'temple': ctx.strokeRect(-8,-10,16,20); if(icon==='pillars'){ ctx.strokeRect(10,-10,10,20); ctx.strokeRect(-20,-10,10,20); } break;
    case 'plaza': case 'altar': case 'fountain': case 'gem': ctx.beginPath(); ctx.moveTo(0,-10); ctx.lineTo(10,0); ctx.lineTo(0,10); ctx.lineTo(-10,0); ctx.closePath(); ctx.stroke(); break;
    case 'maze': ctx.strokeRect(-11,-11,22,22); ctx.strokeRect(-5,-5,10,10); break;
    case 'cliff': ctx.beginPath(); ctx.moveTo(-12,10); ctx.lineTo(-5,-10); ctx.lineTo(10,-6); ctx.lineTo(12,10); ctx.stroke(); break;
    case 'well': case 'pit': ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.stroke(); break;
    default: ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.stroke();
  }
  ctx.restore();
 }

 showQuestion(game,q){
  $('question-title').textContent=`BAÚ ${game.stage.number} • ${q.dificuldade.toUpperCase()}`;
  $('question-meta').textContent=`${q.id}  |  ${q.descritor||'Sem descritor'}  |  ${q.origem.startsWith('autoral')?'Autoral':'Coletânea 2024'}  |  🪙 ${COINS_BY_DIFFICULTY[q.dificuldade]||0} moedas (primeira abertura)`;
  $('question-panel').scrollTop=0;
  const content=$('question-content');this.renderQuestionContent(content,q);
  const options=$('question-options');options.replaceChildren();
  for(const alt of q.alternativas){
   const label=document.createElement('label');label.className='answer-option';
   const radio=document.createElement('input');radio.type='radio';radio.name='question-answer';radio.value=alt.id;
   const span=document.createElement('span');span.textContent=`${alt.id}) ${alt.texto}`;
   label.append(radio,span);options.append(label);
  }
  $('btn-question-confirm').disabled=false;$('btn-question-close').textContent='Voltar à exploração';
  $('question-feedback').replaceChildren();$('question-feedback').className='question-feedback';
  const alternative=game.questions.alternative(q,new Set([q.id,...Object.keys(game.questionStats).filter(id=>game.questionStats[id].ultimaEtapa===game.stage.id)]),game.answeredCorrect);
  $('btn-question-switch').hidden=!alternative;
 }
 renderQuestionContent(target,q){
  target.replaceChildren();
  const heading=document.createElement('h3');heading.textContent=q.titulo||'Questão de Língua Portuguesa';target.append(heading);
  if(q.origem==='coletanea_paebes_2024'){
   const info=document.createElement('p');info.className='source-notice';info.textContent=this.game.questions.assessable(q)?'Reprodução visual do PDF enviado. Gabarito validado e identificado no banco.':'Reprodução visual do PDF enviado, com texto-base, enunciado e recursos gráficos. Gabarito pendente de validação docente.';target.append(info);
   for(const resource of q.imagens_original||[]){
    const figure=document.createElement('figure');figure.className='original-figure';
    const link=document.createElement('a');link.href=resource.src;link.target='_blank';link.rel='noopener';link.title='Ampliar página original';
    const img=document.createElement('img');img.src=resource.src;img.alt=`Questão ${q.numero_original||q.id}, trecho da página ${resource.pagina_pdf} do PDF`;img.loading='lazy';
    link.append(img);figure.append(link);target.append(figure);
   }
  }else{
   const text=document.createElement('div');text.className='question-text';text.textContent=q.texto_base||'';target.append(text);
   const prompt=document.createElement('p');prompt.className='question-stem';prompt.textContent=q.enunciado||'';target.append(prompt);
  }
 }
 showQuestionResult(result){
  if(!result)return;
  const feedback=$('question-feedback');feedback.replaceChildren();feedback.className='question-feedback '+(result.correct?'correct':'incorrect');
  const title=document.createElement('strong');title.textContent=result.message||'';feedback.append(title);
  if(result.correct){
   const why=document.createElement('p');why.textContent=result.why||'O desafio foi concluído.';feedback.append(why);
   $('btn-question-confirm').disabled=true;$('btn-question-switch').hidden=true;
   document.querySelectorAll('input[name=question-answer]').forEach(input=>input.disabled=true);
   $('btn-question-close').textContent=result.campaignComplete?'Ver conclusão':'Continuar aventura';
  }else{
   const hint=document.createElement('p');hint.textContent=result.hint||'Leia novamente o texto-base.';feedback.append(hint);
   $('btn-question-confirm').disabled=false;
  }
  feedback.scrollIntoView({block:'nearest',behavior:'auto'});
 }
 openLibrary(origin){
  this.libraryReturn=origin;
  const select=$('library-question-select');select.replaceChildren();
  for(const q of this.game.questions.questions){
   const option=document.createElement('option');option.value=q.id;
   const type=q.origem==='coletanea_paebes_2024'?(this.game.questions.assessable(q)?'PDF • validada':'PDF • pendente'):'Autoral • '+q.dificuldade;
   option.textContent=`${type} — ${q.id} — ${q.descritor||'—'}`;select.append(option);
  }
  const count=this.game.questions.statistics();
  $('library-summary').textContent=`${count.originais} itens do PDF (${count.pendentes} pendentes) + ${count.autorais} autorais = ${this.game.questions.questions.length} questões. Somente itens com gabarito validado entram na avaliação.`;
  if(select.value)this.showLibraryQuestion(select.value);
  this.show('library');this.game.input.clear();this.hud(false);
 }
 showLibraryQuestion(id){
  const q=this.game.questions.find(id);if(!q)return;
  $('library-item-meta').textContent=`${q.id} • ${q.descritor||'Sem descritor'} • ${this.game.questions.assessable(q)?'Gabarito validado':'Aguardando gabarito validado'}`;
  this.renderQuestionContent($('library-item-preview'),q);
  const list=$('library-item-alternatives');list.replaceChildren();
  for(const a of q.alternativas){const item=document.createElement('li');item.textContent=`${a.id}) ${a.texto}`;list.append(item);}
 }
 closeLibrary(){this.show(this.libraryReturn);this.hud(false);}

 refreshStageSelect(game){
  const grid=$('stage-grid');grid.replaceChildren();
  STAGES.forEach((stage,index)=>{
    const unlocked=game.unlockedStages.has(index),state=game.stageStates[stage.id]||{opened:[]};
    const found=(state.opened||[]).length,fragment=game.hasFragment(stage);
    const wrapper=document.createElement('div');wrapper.className='stage-entry';
    const button=document.createElement('button');button.type='button';button.className='stage-card '+(unlocked?'':'locked')+(fragment?' complete':'');button.disabled=!unlocked;
    const top=document.createElement('span');top.className='stage-card-top';top.textContent=`ESTÁGIO ${stage.number}`;
    const name=document.createElement('strong');name.textContent=stage.name;
    const detail=document.createElement('small');detail.textContent=`Rodada atual: ${found}/3 baús • ${fragment?'🧩 Fragmento obtido':'🧩 Fragmento pendente'}`;
    const foot=document.createElement('span');foot.className='stage-card-foot';foot.textContent=unlocked?'Explorar estágio':'Bloqueado';
    button.append(top,name,detail,foot);if(unlocked)button.addEventListener('click',()=>game.openStage(index));wrapper.append(button);
    if(unlocked&&found===3&&!fragment){
      const retry=document.createElement('button');retry.type='button';retry.className='stage-retry';retry.textContent='↻ Repetir os 3 baús para tentar o fragmento';
      retry.title='Reinicia a rodada dos três baús, preservando moedas, histórico e estágios desbloqueados';
      retry.addEventListener('click',()=>game.retryStage(index));wrapper.append(retry);
    }
    grid.append(wrapper);
  });
  const secret=document.createElement('div');secret.className='stage-entry';
  const button=document.createElement('button');button.type='button';button.className='stage-card special'+(game.secretUnlocked?'':' locked');button.disabled=!game.secretUnlocked;
  const top=document.createElement('span');top.className='stage-card-top';top.textContent='✧ ÁREA BÔNUS ✧';
  const title=document.createElement('strong');title.textContent=game.secretUnlocked?SECRET_STAGE.name:'Cenário secreto bloqueado';
  const info=document.createElement('small');info.textContent=`🧩 ${game.fragmentCount}/${FRAGMENTS_NEEDED} partes do mapa • ${game.economy.secretCompleted?'Relíquia encontrada':game.secretUnlocked?'Acesso liberado':'Acerte os 3 baús de cada estágio de primeira'}`;
  const foot=document.createElement('span');foot.className='stage-card-foot';foot.textContent=game.secretUnlocked?'Entrar na ilha secreta':'Reúna os 10 fragmentos';
  button.append(top,title,info,foot);if(game.secretUnlocked)button.addEventListener('click',()=>game.openStage(SECRET_STAGE_INDEX));secret.append(button);grid.append(secret);
 }
 updateCampaignWin(game){
  const status=$('win-fragment-status');
  status.textContent=game.secretUnlocked?'Os dez fragmentos foram reunidos! A Ilha das Palavras Perdidas está disponível.':
   `Você reuniu ${game.fragmentCount}/10 fragmentos. Rejogue estágios concluídos sem fragmento para abrir os três baús com um acerto na primeira tentativa.`;
  $('btn-win-secret').hidden=!game.secretUnlocked;
 }
 updateSecretWin(first){$('secret-win-text').textContent=first?
  'Os dez fragmentos revelaram este lugar. Você encontrou o Livro das Palavras: a relíquia final foi adicionada ao inventário!':
  'Você já encontrou o Livro das Palavras. A relíquia continua no inventário, e a ilha secreta permanece disponível.';
 }
 updateInventory(game){
  $('inventory-coins').textContent=game.coinCount;
  $('inventory-fragments').textContent=`${game.fragmentCount} / ${FRAGMENTS_NEEDED}`;
  $('inventory-chests').textContent=`${game.totalFound()} / ${TOTAL_TREASURES}`;
  $('inventory-message').textContent=game.secretUnlocked?'Mapa restaurado! A entrada da Ilha das Palavras Perdidas está liberada.':
   `Faltam ${FRAGMENTS_NEEDED-game.fragmentCount} fragmentos. Para obter cada um, responda corretamente na primeira tentativa aos três baús de um mesmo estágio.`;
  $('btn-secret-from-inventory').hidden=!game.secretUnlocked;
  const grid=$('fragment-grid');grid.replaceChildren();
  STAGES.forEach((stage,index)=>{
   const obtained=game.hasFragment(stage);const tile=document.createElement('div');tile.className='fragment-tile'+(obtained?' earned':'');
   const mark=document.createElement('span');mark.textContent=obtained?'🧩':'🔒';
   const text=document.createElement('small');text.textContent=`Parte ${index+1}`;tile.append(mark,text);tile.title=obtained?`${stage.name}: adquirido`:`${stage.name}: pendente`;grid.append(tile);
  });
  const items=$('inventory-items');items.replaceChildren();
  const tools=document.createElement('div');tools.textContent='🪏 Pá do aventureiro — permanente • 🗺 Mapas dos 10 estágios — disponíveis durante a exploração';items.append(tools);
  const relic=document.createElement('div');relic.textContent=game.economy.relic?'✧ Livro das Palavras — relíquia secreta recuperada':'✧ Livro das Palavras — escondido na ilha secreta';items.append(relic);
  this.drawSecretMap(game.economy.fragments);
 }
 drawSecretMap(fragments){
  const canvas=$('secret-map-canvas'),ctx=canvas.getContext('2d');const width=canvas.width,height=canvas.height;
  ctx.clearRect(0,0,width,height);ctx.fillStyle='#463d2e';ctx.fillRect(0,0,width,height);
  const cols=5,rows=2,pad=10,tw=(width-pad*2)/cols,th=(height-pad*2)/rows;
  const earned=new Set(fragments);
  const route=[[38,218],[103,199],[158,165],[207,198],[258,152],[309,171],[352,119],[420,141],[469,105],[542,61]];
  STAGES.forEach((stage,i)=>{
   const x=pad+(i%cols)*tw,y=pad+Math.floor(i/cols)*th,have=earned.has(stage.id);
   ctx.save();ctx.beginPath();ctx.rect(x+1,y+1,tw-2,th-2);ctx.clip();
   ctx.fillStyle=have?'#ecd09d':'#40392e';ctx.fillRect(x,y,tw,th);
   if(have){
    ctx.fillStyle='#ddb87b';for(let k=0;k<18;k++){let px=x+((k*47+i*21)%Math.floor(tw)),py=y+((k*29+i*37)%Math.floor(th));ctx.fillRect(px,py,3,2);}
    ctx.strokeStyle='#8b6843';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+10,y+th*.76);ctx.quadraticCurveTo(x+tw*.36,y+th*.12,x+tw*.82,y+th*.51);ctx.stroke();
    ctx.fillStyle='#715039';ctx.font='bold 12px Georgia';ctx.fillText(`✧ ${i+1}`,x+9,y+23);
    const gx=x+tw*.59,gy=y+th*.58;
    if(i%4===0){ctx.beginPath();ctx.moveTo(gx-14,gy+11);ctx.lineTo(gx,gy-14);ctx.lineTo(gx+13,gy+11);ctx.closePath();ctx.fill();}
    else if(i%4===1){ctx.strokeStyle='#477b7a';ctx.beginPath();ctx.moveTo(gx-16,gy);ctx.quadraticCurveTo(gx-8,gy-8,gx,gy);ctx.quadraticCurveTo(gx+7,gy+8,gx+16,gy);ctx.stroke();}
    else if(i%4===2){ctx.beginPath();ctx.arc(gx,gy,13,Math.PI,0);ctx.fill();ctx.fillRect(gx-6,gy-1,12,15);}
    else{ctx.beginPath();ctx.moveTo(gx-12,gy+10);ctx.lineTo(gx-4,gy-9);ctx.lineTo(gx+5,gy-3);ctx.lineTo(gx+15,gy+10);ctx.closePath();ctx.fill();}
   }else{ctx.fillStyle='#d7bb88';ctx.font='bold 37px Georgia';ctx.textAlign='center';ctx.fillText('?',x+tw/2,y+th/2+10);ctx.textAlign='start';}
   ctx.strokeStyle=have?'#8d603d':'#82725f';ctx.lineWidth=2;ctx.setLineDash([3,4]);ctx.strokeRect(x+3,y+3,tw-6,th-6);ctx.setLineDash([]);ctx.restore();
  });
  if(earned.size===FRAGMENTS_NEEDED){
   ctx.save();ctx.strokeStyle='#774a2d';ctx.lineWidth=3;ctx.setLineDash([6,8]);ctx.beginPath();route.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);
   ctx.strokeStyle='#bc3b2d';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(522,50);ctx.lineTo(554,78);ctx.moveTo(554,50);ctx.lineTo(522,78);ctx.stroke();ctx.restore();
  }
 }
 toast(message){ const wrap=$('toasts'), el=document.createElement('div'); el.className='toast'; el.textContent=message; wrap.append(el); setTimeout(()=>{el.classList.add('fade'); setTimeout(()=>el.remove(),380);},4200); if(wrap.children.length>3) wrap.firstElementChild.remove(); }
 error(msg){ $('error-message').textContent=msg; this.show('error'); this.hud(false); }
}
