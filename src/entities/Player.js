export class Player {
 constructor(x,y){this.x=x;this.y=y;this.speed=148;this.facing=0;this.anim=0;this.moving=false;this.width=16;this.height=12;this.digTimer=0;}
 dig(){if(this.digTimer>0)return false;this.digTimer=.52;this.anim=0;this.moving=false;return true;}
 update(dt,vector,world){
  if(this.digTimer>0){this.digTimer=Math.max(0,this.digTimer-dt);this.moving=false;return;}
  const size=Math.hypot(vector.x,vector.y);this.moving=size>.1;
  if(!this.moving){this.anim=0;return;}
  const dx=vector.x/Math.max(size,1),dy=vector.y/Math.max(size,1);
  if(Math.abs(dx)>Math.abs(dy))this.facing=dx>0?3:2;
  else this.facing=dy>0?0:1;
  this.anim+=dt*9;
  // Resolução por eixo: colisão precisa sem atravessar obstáculos na diagonal.
  let movement=dx*this.speed*dt;
  if(!world.collides(this.x+movement-this.width/2,this.y-this.height/2,this.width,this.height))this.x+=movement;
  movement=dy*this.speed*dt;
  if(!world.collides(this.x-this.width/2,this.y+movement-this.height/2,this.width,this.height))this.y+=movement;
 }
 frame(){return this.moving?1+Math.floor(this.anim)%2:0;}
}
