import {TILE, TILE_ID as T} from '../world/world-config.js';
const OBJECT_NAMES=['tree','pine','palm','rock','bush','sign','pillar','crate','tent','boat','mound','chest','sandpile','log','stump','mushroom','reeds','rune'];
export class Renderer {
 constructor(canvas){ this.canvas=canvas; this.ctx=canvas.getContext('2d',{alpha:false}); this.width=1; this.height=1; this.assets={}; this.land=null; }
 async load(){
  const files={tiles:'assets/tiles.png',hero:'assets/sprites/aventureiro.png'}; for(const name of OBJECT_NAMES) files[name]=`assets/objects/${name}.png`;
  await Promise.all(Object.entries(files).map(([id,src])=>new Promise((resolve,reject)=>{ const image=new Image(); image.onload=()=>{this.assets[id]=image; resolve();}; image.onerror=()=>reject(new Error('Não foi possível carregar: '+src)); image.src=src; })));
 }
 build(world){
  const canvas=document.createElement('canvas'); canvas.width=world.width; canvas.height=world.height; const ctx=canvas.getContext('2d'); ctx.imageSmoothingEnabled=false;
  for(let y=0;y<world.rows;y++) for(let x=0;x<world.cols;x++) ctx.drawImage(this.assets.tiles, world.tile(x,y)*32, 0, 32, 32, x*TILE, y*TILE, 32, 32);
  this.land=canvas;
 }
 resize(){ const r=this.canvas.getBoundingClientRect(),w=Math.max(1,Math.round(r.width)),h=Math.max(1,Math.round(r.height)); const dpr=Math.min(window.devicePixelRatio||1,2); if(this.width!==w||this.height!==h||this.canvas.width!==Math.round(w*dpr)){ this.width=w; this.height=h; this.canvas.width=Math.round(w*dpr); this.canvas.height=Math.round(h*dpr); this.ctx.setTransform(dpr,0,0,dpr,0,0); this.ctx.imageSmoothingEnabled=false; } }
 render(world,player,camera,time,reducedMotion=false){
  if(!this.land) return; const c=this.ctx,w=this.width,h=this.height,z=camera.zoom;
  c.setTransform(this.canvas.width/w,0,0,this.canvas.height/h,0,0); c.imageSmoothingEnabled=false; c.fillStyle='#1d526b'; c.fillRect(0,0,w,h);
  c.save(); c.scale(z,z); c.translate(-camera.x,-camera.y);
  const sx=Math.max(0,Math.floor(camera.x)),sy=Math.max(0,Math.floor(camera.y)); const sw=Math.min(world.width-sx,Math.ceil(w/z)+2),sh=Math.min(world.height-sy,Math.ceil(h/z)+2);
  if(sw>0&&sh>0) c.drawImage(this.land,sx,sy,sw,sh,sx,sy,sw,sh);
  if(!reducedMotion){ const tx=Math.floor(camera.x/TILE)-1,ty=Math.floor(camera.y/TILE)-1,maxX=Math.ceil((camera.x+w/z)/TILE)+1,maxY=Math.ceil((camera.y+h/z)/TILE)+1; c.fillStyle='rgba(178,239,222,.36)'; for(let y=Math.max(0,ty);y<Math.min(world.rows,maxY);y++) for(let x=Math.max(0,tx);x<Math.min(world.cols,maxX);x++){ const t=world.tile(x,y); if(t!==T.OCEAN&&t!==T.COAST&&t!==T.RIVER&&t!==T.SHALLOW) continue; if((x*13+y*7)%4!==0) continue; const offset=Math.round(3*Math.sin(time*.0017+x+y*.6)); c.fillRect(x*TILE+7+offset,y*TILE+12,9,1); } }
  const top=camera.y-110,bottom=camera.y+h/z+110,left=camera.x-110,right=camera.x+w/z+110;
  const visible=world.objects.filter(o=>!o.removed&&!o.hidden&&o.y>top&&o.y<bottom&&o.x>left&&o.x<right).map(o=>({kind:'object',y:o.y,item:o})); visible.push({kind:'player',y:player.y,item:player}); visible.sort((a,b)=>a.y-b.y);
  for(const entry of visible){ if(entry.kind==='player') this.drawPlayer(c,player); else this.drawObject(c,entry.item); }
  const nearby=world.nearestInteractive(player.x,player.y); if(nearby&&!nearby.signId&&nearby.kind!=='chest'){ const bob=reducedMotion?0:Math.round(Math.sin(time*.0045)*2); c.fillStyle='#fbe4a6'; c.strokeStyle='#775c38'; c.lineWidth=1.3; const x=Math.round(nearby.x),y=Math.round(nearby.y-46+bob); c.fillRect(x-7,y-2,14,14); c.strokeRect(x-7,y-2,14,14); c.fillStyle='#60442c'; c.font='bold 11px monospace'; c.fillText('E',x-4,y+9); }
  const sign=world.nearestSign(player.x,player.y); if(sign){ c.fillStyle='#f8e4a8'; c.strokeStyle='#634c35'; c.lineWidth=2; const bob=reducedMotion?0:Math.round(Math.sin(time*.005)*2); c.fillRect(sign.x-6,sign.y-55+bob,12,13); c.strokeRect(sign.x-6,sign.y-55+bob,12,13); c.fillStyle='#513d32'; c.font='bold 10px monospace'; c.fillText('!',sign.x-3,sign.y-45+bob); }
  c.restore(); const grad=c.createRadialGradient(w*.5,h*.45,Math.min(w,h)*.15,w*.5,h*.5,Math.max(w,h)*.73); grad.addColorStop(0,'rgba(17,29,34,0)'); grad.addColorStop(1,'rgba(13,25,32,.32)'); c.fillStyle=grad; c.fillRect(0,0,w,h);
 }
 drawObject(ctx,o){ const im=this.assets[o.type]; if(!im) return; ctx.fillStyle='rgba(14,40,31,.22)'; ctx.beginPath(); ctx.ellipse(o.x,o.y-4,Math.min(im.width*.35,22),5,0,0,Math.PI*2); ctx.fill(); ctx.drawImage(im,Math.round(o.x-im.width/2),Math.round(o.y-im.height)); }
 drawPlayer(ctx,p){ ctx.fillStyle='rgba(14,39,37,.38)'; ctx.beginPath(); ctx.ellipse(p.x,p.y+2,11,4,0,0,Math.PI*2); ctx.fill(); ctx.drawImage(this.assets.hero,p.frame()*24,p.facing*32,24,32,Math.round(p.x-12),Math.round(p.y-29),24,32); if(p.digTimer>0){ const phase=(.52-p.digTimer)/.52,angle=(phase<.5?-0.8+phase*2.6:1.8-(phase-.5)*2.6); ctx.save(); ctx.translate(Math.round(p.x+9),Math.round(p.y-15)); ctx.rotate(angle); ctx.fillStyle='#845b39'; ctx.fillRect(-2,-3,3,24); ctx.fillStyle='#a7bec1'; ctx.fillRect(-5,18,9,11); ctx.fillRect(-3,28,5,3); ctx.fillStyle='#d5dfe0'; ctx.fillRect(-4,19,2,8); ctx.restore(); if(phase>.35){ ctx.fillStyle='#b48c5b'; for(let i=0;i<5;i++) ctx.fillRect(Math.round(p.x)+i*4-7,Math.round(p.y)+2+((i*3)%5),2,2); } } }
}
