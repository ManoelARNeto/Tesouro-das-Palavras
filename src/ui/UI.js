import { STAGES, TOTAL_TREASURES } from '../world/stages.js';
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
  $('btn-map-hud').addEventListener('click',()=>game.openMap());
  $('btn-map-close').addEventListener('click',()=>game.closeMap());
  $('btn-stage-close').addEventListener('click',()=>game.closeStages());
  $('btn-stages-pause').addEventListener('click',()=>game.openStages('pause'));
  $('setting-zoom').addEventListener('change',e=>game.changeZoom(Number(e.target.value)));
  $('setting-motion').addEventListener('change',e=>game.setReducedMotion(e.target.checked));
  $('btn-error-retry').addEventListener('click',()=>location.reload());
 }
 show(screen){ for(const name of ['menu','pause','settings','journal','map','stages','question','library','win','error']) $(name+'-screen').hidden=name!==screen; this.screen=screen; }
 hud(visible){ $('hud').hidden=!visible; $('touch-controls').hidden=!visible; $('hud-tip').hidden=!visible; }
 updateContinue(hasSave){ $('btn-continue').disabled=!hasSave; }
 openSettings(origin){ this.settingsReturn=origin; $('setting-zoom').value=String(this.game.settings.zoom); $('setting-motion').checked=this.game.settings.reducedMotion; this.show('settings'); }
 updateHUD(game){
  const area=game.world.areaAt(game.player.x,game.player.y); const current=game.world.currentTreasure();
  $('area-label').textContent=area?.name||game.stage.name;
  $('stage-label-hud').textContent=`${game.stage.number} / ${STAGES.length}`;
  $('dig-progress').textContent=`${game.world.found.size} / ${game.stage.treasures.length}`;
  $('global-progress').textContent=`${game.totalFound()} / ${TOTAL_TREASURES}`;
  $('mission-label').textContent=current ? (game.world.dug.has(current.id) ? `Baú ${current.difficulty.toLowerCase()} encontrado! Interaja para responder à questão.` : `Siga a pista do tesouro ${current.difficulty.toLowerCase()} deste estágio.`) : 'Estágio concluído. Você já pode seguir para o próximo cenário.';
  $('travel-time').textContent=this.formatTime(game.seconds);
  const target=game.world.nearestInteractive(game.player.x,game.player.y);
  $('interaction-prompt').hidden=!target||!!game.pendingExcavation;
  if(target){ const label=target.signId?'Ler marco':target.kind==='buried'?'Cavar com a pá':game.world.opened.has(target.id)?'Baú já aberto':'Resolver questão do baú'; $('interaction-label').textContent=label; $('mobile-action').setAttribute('aria-label',label); }
 }
 formatTime(seconds){ const mm=Math.floor(seconds/60),ss=Math.floor(seconds%60); return `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`; }
 updateJournal(game){
  $('journal-title').textContent=`CAMPANHA — ${game.totalFound()} / ${TOTAL_TREASURES} TESOUROS`;
  $('journal-count').textContent=`${game.unlockedStages.size} de ${STAGES.length} estágios desbloqueados`;
  const list=$('journal-items'); list.replaceChildren();
  STAGES.forEach((stage,index)=>{
    const state=game.stageStates[stage.id] || {opened:[]}; const li=document.createElement('li');
    li.className=game.unlockedStages.has(index)?((state.opened||[]).length===3?'found':'partial'):'unknown';
    const mark=document.createElement('span'); mark.className='journal-mark'; mark.textContent=(state.opened||[]).length===3?'✓':game.unlockedStages.has(index)?stage.number:'?';
    const body=document.createElement('div'); const title=document.createElement('strong'); title.textContent=`${stage.number}. ${stage.name}`;
    const desc=document.createElement('p'); desc.textContent=`${stage.stageHint} Progresso: ${(state.opened||[]).length}/3 tesouros.`;
    body.append(title,desc); li.append(mark,body); list.append(li);
  });
  const clueList=$('journal-treasure-items'); clueList.replaceChildren();
  for(const treasure of game.stage.treasures){ const found=game.world.found.has(treasure.id); const li=document.createElement('li'); li.className=found?'found':'unknown';
    const mark=document.createElement('span'); mark.className='journal-mark'; mark.textContent=found?'✦':treasure.difficulty[0];
    const body=document.createElement('div'); const title=document.createElement('strong'); title.textContent=`${treasure.difficulty} — ${found?treasure.name:'Tesouro ainda não localizado'}`;
    const desc=document.createElement('p'); desc.textContent=found?'Baú aberto após resposta correta.':game.world.currentTreasure()?.id===treasure.id?treasure.clue:'Pista bloqueada até abrir o baú anterior.';
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
  $('map-difficulty').textContent=current ? current.difficulty : 'Concluído';
  $('map-clue-text').textContent=current ? current.clue : 'Você concluiu os três tesouros deste estágio. Escolha o próximo cenário no seletor de estágios.';
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
  $('question-meta').textContent=`${q.id}  |  ${q.descritor||'Sem descritor'}  |  ${q.origem.startsWith('autoral')?'Autoral':'Coletânea 2024'}`;
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
   const info=document.createElement('p');info.className='source-notice';info.textContent='Reprodução visual fiel do PDF enviado, com texto-base, enunciado, alternativas e recursos gráficos. O gabarito está pendente de validação docente.';target.append(info);
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
   const type=q.origem==='coletanea_paebes_2024'?'PDF • pendente':'Autoral • '+q.dificuldade;
   option.textContent=`${type} — ${q.id} — ${q.descritor||'—'}`;select.append(option);
  }
  const count=this.game.questions.statistics();
  $('library-summary').textContent=`${count.originais} itens do PDF (${count.pendentes} pendentes) + ${count.autorais} autorais = ${this.game.questions.questions.length} questões. O acervo do PDF só entra na avaliação após validação do gabarito.`;
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
  const grid=$('stage-grid'); grid.replaceChildren();
  STAGES.forEach((stage,index)=>{
    const button=document.createElement('button'); button.type='button';
    const unlocked=game.unlockedStages.has(index); const found=game.stageStates[stage.id]?.opened?.length||0;
    button.className='stage-card '+(unlocked?'':'locked')+(found===3?' complete':''); button.disabled=!unlocked;
    button.innerHTML=`<span class="stage-card-top">ESTÁGIO ${stage.number}</span><strong>${stage.name}</strong><small>${found}/3 tesouros</small><span class="stage-card-foot">${unlocked?(found===3?'Concluído':'Disponível'):'Bloqueado'}</span>`;
    if(unlocked) button.addEventListener('click',()=>game.openStage(index));
    grid.append(button);
  });
 }
 toast(message){ const wrap=$('toasts'), el=document.createElement('div'); el.className='toast'; el.textContent=message; wrap.append(el); setTimeout(()=>{el.classList.add('fade'); setTimeout(()=>el.remove(),380);},4200); if(wrap.children.length>3) wrap.firstElementChild.remove(); }
 error(msg){ $('error-message').textContent=msg; this.show('error'); this.hud(false); }
}
