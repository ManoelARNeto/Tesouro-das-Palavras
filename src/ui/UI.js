import { STAGES, TOTAL_TREASURES } from '../world/stages.js';
const $=id=>document.getElementById(id);

export class UI {
 constructor(game){
  this.game=game; this.stageReturn='menu';
  $('btn-new').addEventListener('click',()=>game.newGame());
  $('btn-continue').addEventListener('click',()=>game.continueGame());
  $('btn-stage-menu').addEventListener('click',()=>game.openStages('menu'));
  $('btn-main-settings').addEventListener('click',()=>this.openSettings('menu'));
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
 show(screen){ for(const name of ['menu','pause','settings','journal','map','stages','error']) $(name+'-screen').hidden=name!==screen; this.screen=screen; }
 hud(visible){ $('hud').hidden=!visible; $('touch-controls').hidden=!visible; $('hud-tip').hidden=!visible; }
 updateContinue(hasSave){ $('btn-continue').disabled=!hasSave; }
 openSettings(origin){ this.settingsReturn=origin; $('setting-zoom').value=String(this.game.settings.zoom); $('setting-motion').checked=this.game.settings.reducedMotion; this.show('settings'); }
 updateHUD(game){
  const area=game.world.areaAt(game.player.x,game.player.y); const current=game.world.currentTreasure();
  $('area-label').textContent=area?.name||game.stage.name;
  $('stage-label-hud').textContent=`${game.stage.number} / ${STAGES.length}`;
  $('dig-progress').textContent=`${game.world.found.size} / ${game.stage.treasures.length}`;
  $('global-progress').textContent=`${game.totalFound()} / ${TOTAL_TREASURES}`;
  $('mission-label').textContent=current ? `Siga a pista do tesouro ${current.difficulty.toLowerCase()} deste estágio.` : 'Estágio concluído. Você já pode seguir para o próximo cenário.';
  $('travel-time').textContent=this.formatTime(game.seconds);
  const target=game.world.nearestInteractive(game.player.x,game.player.y);
  $('interaction-prompt').hidden=!target||!!game.pendingExcavation;
  if(target){ const label=target.signId?'Ler marco':target.kind==='buried'?'Cavar com a pá':'Inspecionar tesouro'; $('interaction-label').textContent=label; $('mobile-action').setAttribute('aria-label',label); }
 }
 formatTime(seconds){ const mm=Math.floor(seconds/60),ss=Math.floor(seconds%60); return `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`; }
 updateJournal(game){
  $('journal-title').textContent=`CAMPANHA — ${game.totalFound()} / ${TOTAL_TREASURES} TESOUROS`;
  $('journal-count').textContent=`${game.unlockedStages.size} de ${STAGES.length} estágios desbloqueados`;
  const list=$('journal-items'); list.replaceChildren();
  STAGES.forEach((stage,index)=>{
    const state=game.stageStates[stage.id] || {found:[]}; const li=document.createElement('li');
    li.className=game.unlockedStages.has(index)?(state.found.length===3?'found':'partial'):'unknown';
    const mark=document.createElement('span'); mark.className='journal-mark'; mark.textContent=state.found.length===3?'✓':game.unlockedStages.has(index)?stage.number:'?';
    const body=document.createElement('div'); const title=document.createElement('strong'); title.textContent=`${stage.number}. ${stage.name}`;
    const desc=document.createElement('p'); desc.textContent=`${stage.stageHint} Progresso: ${state.found.length}/3 tesouros.`;
    body.append(title,desc); li.append(mark,body); list.append(li);
  });
  const clueList=$('journal-treasure-items'); clueList.replaceChildren();
  for(const treasure of game.stage.treasures){ const found=game.world.found.has(treasure.id); const li=document.createElement('li'); li.className=found?'found':'unknown';
    const mark=document.createElement('span'); mark.className='journal-mark'; mark.textContent=found?'✦':treasure.difficulty[0];
    const body=document.createElement('div'); const title=document.createElement('strong'); title.textContent=`${treasure.difficulty} — ${found?treasure.name:'Tesouro ainda não localizado'}`;
    const desc=document.createElement('p'); desc.textContent=found?'Tesouro escavado e registrado na campanha.':treasure.clue;
    body.append(title,desc); li.append(mark,body); clueList.append(li); }
  const landmarkList=$('journal-secret-items'); landmarkList.replaceChildren();
  for(const area of game.world.areas){ const found=game.discovered.has(area.id); const li=document.createElement('li'); li.className=found?'found':'unknown';
    const mark=document.createElement('span'); mark.className='journal-mark'; mark.textContent=found?'⌖':'?';
    const body=document.createElement('div'); const title=document.createElement('strong'); title.textContent=found?area.name:'Marco ainda não reconhecido';
    const desc=document.createElement('p'); desc.textContent=found?'Você já usou esse ponto de referência para interpretar o mapa.':'Explore o estágio e aproxime-se dos marcos para reconhecê-los.';
    body.append(title,desc); li.append(mark,body); landmarkList.append(li); }
  $('journal-treasure-count').textContent=`${game.world.found.size} de ${game.stage.treasures.length} tesouros encontrados neste estágio`;
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
 refreshStageSelect(game){
  const grid=$('stage-grid'); grid.replaceChildren();
  STAGES.forEach((stage,index)=>{
    const button=document.createElement('button'); button.type='button';
    const unlocked=game.unlockedStages.has(index); const found=game.stageStates[stage.id]?.found?.length||0;
    button.className='stage-card '+(unlocked?'':'locked')+(found===3?' complete':''); button.disabled=!unlocked;
    button.innerHTML=`<span class="stage-card-top">ESTÁGIO ${stage.number}</span><strong>${stage.name}</strong><small>${found}/3 tesouros</small><span class="stage-card-foot">${unlocked?(found===3?'Concluído':'Disponível'):'Bloqueado'}</span>`;
    if(unlocked) button.addEventListener('click',()=>game.openStage(index));
    grid.append(button);
  });
 }
 toast(message){ const wrap=$('toasts'), el=document.createElement('div'); el.className='toast'; el.textContent=message; wrap.append(el); setTimeout(()=>{el.classList.add('fade'); setTimeout(()=>el.remove(),380);},4200); if(wrap.children.length>3) wrap.firstElementChild.remove(); }
 error(msg){ $('error-message').textContent=msg; this.show('error'); this.hud(false); }
}
