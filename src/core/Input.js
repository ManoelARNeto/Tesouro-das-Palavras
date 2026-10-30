export class Input {
 constructor(){
  this.down=new Set();this.joy={x:0,y:0};this.actionRequested=false;this.pauseRequested=false;
  const blockedKeys=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ']);
  window.addEventListener('keydown',e=>{
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    if(blockedKeys.has(e.key))e.preventDefault();
    this.down.add(e.key.toLowerCase());
    if(!e.repeat&&(e.code==='KeyE'||e.code==='Space'))this.actionRequested=true;
    if(!e.repeat&&e.key==='Escape')this.pauseRequested=true;
  });
  window.addEventListener('keyup',e=>this.down.delete(e.key.toLowerCase()));
  window.addEventListener('blur',()=>this.clear());
  this.setupJoystick();
  document.getElementById('mobile-action').addEventListener('pointerdown',e=>{e.preventDefault();this.actionRequested=true;});
 }
 clear(){this.down.clear();this.joy={x:0,y:0};this.actionRequested=false;this.pauseRequested=false;this.centerStick();}
 vector(){
  let x=(this.down.has('d')||this.down.has('arrowright')?1:0)-(this.down.has('a')||this.down.has('arrowleft')?1:0);
  let y=(this.down.has('s')||this.down.has('arrowdown')?1:0)-(this.down.has('w')||this.down.has('arrowup')?1:0);
  if(x===0&&y===0){x=this.joy.x;y=this.joy.y;}return {x,y};
 }
 consumeAction(){const v=this.actionRequested;this.actionRequested=false;return v;}
 consumePause(){const v=this.pauseRequested;this.pauseRequested=false;return v;}
 centerStick(){const stick=document.querySelector('#joystick-stick');if(stick)stick.style.transform='translate(0px, 0px)';}
 setupJoystick(){
  const area=document.getElementById('joystick'),stick=document.getElementById('joystick-stick');
  let id=null;const max=42;
  const move=e=>{if(e.pointerId!==id)return;const rect=area.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
    let dx=e.clientX-cx,dy=e.clientY-cy;const d=Math.hypot(dx,dy);if(d>max){dx*=max/d;dy*=max/d;}
    this.joy={x:dx/max,y:dy/max};stick.style.transform=`translate(${dx}px,${dy}px)`;
  };
  area.addEventListener('pointerdown',e=>{e.preventDefault();if(id!==null)return;id=e.pointerId;area.setPointerCapture(id);move(e);});
  area.addEventListener('pointermove',move);
  const release=e=>{if(e.pointerId===id){id=null;this.joy={x:0,y:0};this.centerStick();}};
  area.addEventListener('pointerup',release);area.addEventListener('pointercancel',release);area.addEventListener('lostpointercapture',release);
 }
}
