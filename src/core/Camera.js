export class Camera {
 constructor(){this.x=0;this.y=0;this.width=0;this.height=0;this.zoom=2;this.ready=false;}
 resize(w,h){this.width=w;this.height=h;}
 follow(px,py,world,dt){
  const tw=this.width/this.zoom,th=this.height/this.zoom;
  let tx=px-tw/2,ty=py-th/2;
  tx=Math.max(0,Math.min(tx,Math.max(0,world.width-tw)));
  ty=Math.max(0,Math.min(ty,Math.max(0,world.height-th)));
  if(!this.ready){this.x=tx;this.y=ty;this.ready=true;return;}
  const t=1-Math.exp(-dt*8);this.x+=(tx-this.x)*t;this.y+=(ty-this.y)*t;
 }
}
