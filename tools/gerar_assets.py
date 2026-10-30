"""Gera sprites pixel art ORIGINAIS. Dependência apenas para desenvolvimento: Pillow.
Os PNGs gerados já acompanham o jogo; este script NÃO é necessário para jogar.
"""
from PIL import Image, ImageDraw
from pathlib import Path
import random
ROOT=Path(__file__).resolve().parents[1]
A=ROOT/'assets'
COL={'outline':'#202e35','shadow':'#284b3f','grass':'#6cab6d','grass2':'#56975e','grass3':'#81ba72','sand':'#e8cf8c','sand2':'#d6b675','water':'#266d8f','water2':'#3987a4','water3':'#67b5bb','wood':'#a2764f','wood2':'#d4a36a','stone':'#75848a','stone2':'#a1a8a0','stone3':'#57646c'}

def img(size):return Image.new('RGBA',size,(0,0,0,0))
def rect(d,xy,c):d.rectangle(xy,fill=c)

def tile(kind):
 i=img((32,32));d=ImageDraw.Draw(i);r=random.Random(304+kind*43)
 if kind in (0,1,8,13):
  base={0:'#22637e',1:'#2d829a',8:'#337d99',13:'#55acb4'}[kind]
  d.rectangle((0,0,31,31), fill=base)
  for j in range(7):
   x=r.randint(1,26);y=r.randint(2,29); col=r.choice(['#4094a5','#3b90a4','#6cc1bf']) if kind else r.choice(['#2c728b','#327a93'])
   d.rectangle((x,y,x+r.randint(2,5),y),fill=col)
   if j%2==0:d.rectangle((x+1,y+1,x+4,y+1),fill=base)
 elif kind in (2,):
  d.rectangle((0,0,31,31),fill='#e7ca87')
  for j in range(12):
   x=r.randint(1,30);y=r.randint(1,30);d.rectangle((x,y,x+r.randint(1,2),y+1),fill=r.choice(['#d5b774','#f2dc9c','#e4be79']))
  d.rectangle((6,20,9,21),fill='#cfaa6b')
 elif kind in (3,4,10):
  d.rectangle((0,0,31,31),fill='#659f60' if kind==3 else '#4f8c59' if kind==4 else '#68a567')
  for j in range(11):
   x=r.randint(1,30);y=r.randint(1,30);d.rectangle((x,y,x+1,y+2),fill=r.choice(['#78b96d','#488b55','#8fc176']))
  if kind==10:
   for x,y in [(8,8),(24,20),(16,28)]:
    d.rectangle((x-1,y-1,x+1,y+1),fill=r.choice(['#f2e3a2','#e5a0a1','#fff1d5']));d.point((x,y),fill='#e09a51')
 elif kind==5:
  d.rectangle((0,0,31,31),fill='#a99568')
  for j in range(15):
   x=r.randint(0,30);y=r.randint(0,30);d.rectangle((x,y,x+r.randint(1,3),y+r.randint(1,2)),fill=r.choice(['#b6a477','#938660','#c3ab77']))
 elif kind in (6,7,11,12):
  base={6:'#8b928c',7:'#697c78',11:'#a4a192',12:'#8d8878'}[kind];d.rectangle((0,0,31,31),fill=base)
  for j in range(10):
   x=r.randint(0,28);y=r.randint(0,28);d.rectangle((x,y,x+r.randint(2,5),y+r.randint(1,3)),fill=r.choice(['#bbc0ac','#737e7b','#687476','#a3aa9e']))
  if kind==11:
   for x in (0,16):d.line((x,0,x,31),fill='#6f827d',width=1)
   for y in (0,16):d.line((0,y,31,y),fill='#788783',width=1)
 elif kind==9:
  d.rectangle((0,0,31,31),fill='#8d6345')
  for y in (0,8,16,24):
   d.rectangle((0,y+1,31,y+6),fill='#c79a62');d.line((1,y+6,31,y+6),fill='#805437')
   for x in (4,27):d.rectangle((x,y+3,x+1,y+4),fill='#604c42')
 return i
atlas=img((32*14,32));
for n in range(14):atlas.alpha_composite(tile(n),(n*32,0))
atlas.save(A/'tiles.png')

# Reusable pixel sprite utilities, always no antialiasing.
def spr(name,size,paint):
 i=img(size);d=ImageDraw.Draw(i);paint(i,d);i.save(A/'objects'/f'{name}.png')

def tree(i,d):
 rect(d,(28,52,36,78),'#5b4539');rect(d,(30,55,33,76),'#966a45')
 for x,y,w,h,c in [(15,36,44,27,'#285b42'),(5,35,45,23,'#366d4b'),(14,22,42,26,'#3a8050'),(23,12,30,24,'#4c9359'),(6,26,30,24,'#488451'),(28,22,28,28,'#387247')]:
  rect(d,(x,y,x+w-1,y+h-1),c)
 for x,y in [(20,26),(34,16),(14,41),(43,35),(29,48),(51,29)]:
  rect(d,(x,y,x+9,y+3),'#74b76d');rect(d,(x+2,y+4,x+5,y+5),'#5ca763')
 rect(d,(15,60,23,63),'#274e3b')
spr('tree',(66,82),tree)

def pine(i,d):
 rect(d,(25,54,32,79),'#644933');rect(d,(28,55,30,77),'#ae8050')
 for y,w,h,col in [(8,20,27,'#234e47'),(20,31,26,'#306958'),(33,42,30,'#397862'),(49,54,21,'#295b50')]:
  x=29-w//2;d.polygon([(29,y),(x,y+h),(x+w,y+h)],fill=col)
 for x,y in [(21,30),(35,25),(16,51),(37,52)]:rect(d,(x,y,x+7,y+2),'#76a483')
spr('pine',(60,82),pine)

def palm(i,d):
 rect(d,(24,44,30,73),'#8c6241');rect(d,(25,48,29,52),'#e0b270');rect(d,(23,60,29,64),'#d6a264')
 for pts,col in [([(27,23),(14,15),(3,21),(5,26),(15,22),(20,29)],'#418965'), ([(27,23),(39,11),(52,12),(48,18),(37,24)],'#2e745b'), ([(27,23),(47,24),(57,38),(50,39),(40,31)],'#4da36c'), ([(27,22),(11,31),(3,45),(12,39),(22,30)],'#5eaa67'), ([(27,22),(27,7),(35,2),(33,12),(31,23)],'#43885e')]: d.polygon(pts,fill=col)
 for x,y in [(23,22),(28,21),(26,26)]:rect(d,(x,y,x+3,y+3),'#a77a4f')
spr('palm',(60,80),palm)

def rock(i,d):
 d.polygon([(4,36),(9,19),(21,7),(35,10),(47,27),(49,39),(40,45),(10,45)],fill='#586c72')
 d.polygon([(9,19),(21,7),(35,10),(39,25),(29,34),(11,30)],fill='#8c9a96')
 d.polygon([(21,8),(35,10),(39,24),(27,24)],fill='#bbc0b1')
 rect(d,(11,33,27,36),'#667c7d');rect(d,(37,33,45,35),'#71878a')
spr('rock',(52,49),rock)

def bush(i,d):
 rect(d,(4,21,32,36),'#2b634d');rect(d,(1,15,18,32),'#397e51');rect(d,(13,8,34,30),'#4d965d');rect(d,(6,12,25,28),'#5ea56a')
 for x,y in [(6,19),(15,11),(24,17),(27,27)]:rect(d,(x,y,x+5,y+3),'#91c77a')
 rect(d,(9,34,26,36),'#2e5f45')
spr('bush',(36,38),bush)

def sign(i,d):
 rect(d,(17,16,22,46),'#69452e');rect(d,(19,18,20,44),'#bd8d55')
 rect(d,(2,5,37,27),'#503e31');rect(d,(4,7,35,24),'#b68b55');rect(d,(7,9,32,22),'#dbb77b')
 d.line((11,16,28,16),fill='#775e40',width=2);d.point((8,12),fill='#4f4634');d.point((30,12),fill='#4f4634')
spr('sign',(40,48),sign)

def pillar(i,d):
 rect(d,(6,65,39,71),'#606c6f');rect(d,(8,60,36,66),'#9ca99d')
 rect(d,(11,16,33,62),'#73877f');rect(d,(14,19,30,61),'#bac1ad')
 rect(d,(7,12,37,21),'#5b7474');rect(d,(7,10,37,16),'#a4afa0')
 rect(d,(4,6,41,13),'#7b8b83');rect(d,(9,3,36,9),'#a6b1a3')
 for x,y in [(19,28),(23,44),(27,51)]:rect(d,(x,y,x+2,y+5),'#728c79')
spr('pillar',(46,74),pillar)

def crate(i,d):
 rect(d,(3,8,35,36),'#624b39');rect(d,(5,9,32,33),'#bc9163')
 for y in (13,25):rect(d,(4,y,34,y+3),'#805f42')
 d.line((8,10,30,32),fill='#d8ad78',width=3);d.line((30,11,8,32),fill='#815a42',width=2)
spr('crate',(40,40),crate)

def tent(i,d):
 d.polygon([(7,47),(39,5),(75,47),(74,54),(7,54)],fill='#624e42')
 d.polygon([(9,47),(39,9),(45,48)],fill='#ddbb77')
 d.polygon([(40,9),(73,47),(45,48)],fill='#bd975e')
 d.polygon([(33,34),(40,23),(49,48),(30,48)],fill='#3a514c')
 rect(d,(6,50,75,54),'#755943');rect(d,(7,55,12,60),'#6e5036');rect(d,(72,55,77,60),'#6e5036')
spr('tent',(82,62),tent)

def boat(i,d):
 d.ellipse((5,37,78,65),fill='#37505d')
 d.polygon([(6,38),(77,38),(67,59),(16,59)],fill='#a36c43')
 d.polygon([(12,39),(73,39),(65,54),(20,54)],fill='#d8a06b')
 rect(d,(41,6,44,44),'#6b5648');d.polygon([(44,10),(44,37),(65,33)],fill='#e9d6ad')
 d.polygon([(39,11),(40,34),(22,32)],fill='#f7e0b6')
 rect(d,(30,40,58,43),'#8e613d')
spr('boat',(84,69),boat)

# Aventureiro. Cada sprite 24x32; 3 frames/direção.
hero=img((24*3,32*4));
for direction in range(4):
 for frame in range(3):
  p=img((24,32));d=ImageDraw.Draw(p);walk=1 if frame==1 else -1 if frame==2 else 0
  # sombra dos pés / botas
  rect(d,(7,26+max(0,walk),10,30+max(0,walk)),'#263943')
  rect(d,(14,26+max(0,-walk),17,30+max(0,-walk)),'#263943')
  rect(d,(8,22,16,27),'#425b64')
  # mochila mais visível por trás
  if direction==1: rect(d,(6,13,18,23),'#775640')
  else: rect(d,(5,13,19,20),'#654d39')
  # tronco e camisa
  rect(d,(6,12,18,24),'#183b4c');rect(d,(8,13,16,24),'#338a83')
  rect(d,(7,23,18,25),'#b9824b');rect(d,(12,23,13,24),'#edc57d')
  # braços variam em caminhada
  if direction in (0,1):
   rect(d,(3,14+walk,6,22+walk),'#c69066');rect(d,(18,14-walk,21,22-walk),'#c69066')
   rect(d,(4,14+walk,6,18+walk),'#316f74');rect(d,(18,14-walk,20,18-walk),'#316f74')
  else:
   rect(d,(5,15+walk,8,22+walk),'#c69066');rect(d,(16,15-walk,19,22-walk),'#c69066')
  # rosto/cabelo e chapéu
  rect(d,(7,6,17,14),'#c88e65');rect(d,(6,5,8,12),'#49382f');rect(d,(16,5,18,12),'#49382f')
  if direction==0:
   rect(d,(9,10,10,11),'#243338');rect(d,(15,10,16,11),'#243338')
   rect(d,(11,14,14,15),'#bb6c52')
  if direction==1:rect(d,(7,6,17,12),'#563f34')
  if direction==2:rect(d,(8,10,9,11),'#243338')
  if direction==3:rect(d,(16,10,17,11),'#243338')
  rect(d,(6,3,18,7),'#c49659');rect(d,(5,6,19,8),'#dbaf6d')
  rect(d,(8,1,16,4),'#876040');rect(d,(9,2,15,4),'#cda06c')
  # lenço
  rect(d,(7,14,17,16),'#e39d56');rect(d,(13,16,16,20),'#e09b55')
  hero.alpha_composite(p,(frame*24,direction*32))
hero.save(A/'sprites'/'aventureiro.png')
# Elementos da Etapa 2: escavação, obstáculos removíveis, clareiras e tesouros lacrados.
def mound(i,d):
 d.ellipse((1,9,32,19),fill='#8b784f')
 d.polygon([(2,14),(9,7),(20,5),(30,12),(30,17),(3,17)],fill='#c6ab72')
 d.polygon([(10,8),(20,5),(26,10),(18,12)],fill='#e3c489')
 for x,y in [(5,14),(24,13),(13,15)]:rect(d,(x,y,x+4,y+1),'#91744e')
 d.line((8,9,13,12),fill='#92754c',width=1)
spr('mound',(34,21),mound)

def chest(i,d):
 rect(d,(4,14,39,32),'#4e3b31')
 rect(d,(6,15,37,29),'#8e5d39')
 rect(d,(7,17,37,18),'#ca9352')
 d.polygon([(4,14),(7,5),(34,5),(40,14)],fill='#503d35')
 d.polygon([(8,13),(10,7),(32,7),(36,13)],fill='#a96b3b')
 rect(d,(9,6,11,28),'#c59c53');rect(d,(32,7,34,29),'#c59c53')
 rect(d,(17,14,25,25),'#ddbe6b')
 rect(d,(19,16,23,22),'#705038');rect(d,(20,18,22,21),'#2a3739')
 rect(d,(6,29,39,33),'#5f4032')
 for x in [8,34]:rect(d,(x,25,x+2,28),'#e5bb6b')
spr('chest',(44,36),chest)

def sandpile(i,d):
 d.ellipse((1,17,43,29),fill='#9b835d')
 d.polygon([(2,23),(8,12),(18,6),(30,7),(40,19),(44,25),(4,27)],fill='#c5a674')
 d.polygon([(11,13),(19,7),(30,8),(34,15),(22,18)],fill='#ead299')
 for x,y in [(5,22),(35,23),(20,20)]:rect(d,(x,y,x+5,y+2),'#9c8058')
 d.line((24,12,29,17),fill='#9b805c')
spr('sandpile',(46,32),sandpile)

def log(i,d):
 d.ellipse((4,13,55,31),fill='#674b39')
 rect(d,(8,12,46,29),'#825e43')
 rect(d,(12,13,42,16),'#ba8a57')
 for x in (16,28,38):d.line((x,18,x+2,26),fill='#523e31',width=2)
 d.ellipse((44,12,59,30),fill='#513d30',outline='#d0a06b',width=3)
 d.ellipse((48,16,56,25),outline='#9c6d4a',width=2)
 rect(d,(14,8,24,14),'#458361');rect(d,(26,6,37,12),'#4b945e')
spr('log',(62,33),log)

def stump(i,d):
 rect(d,(5,13,27,24),'#765039')
 rect(d,(7,14,23,22),'#a77b50')
 d.ellipse((3,5,29,17),fill='#664638')
 d.ellipse((5,6,27,15),fill='#cea071')
 d.ellipse((10,8,22,13),outline='#896044',width=2)
 rect(d,(4,19,6,23),'#4f734e')
spr('stump',(33,26),stump)

def mushroom(i,d):
 for x,y in [(7,9),(13,12)]:rect(d,(x,y,x+3,y+9),'#e2d1a0')
 d.polygon([(1,12),(5,6),(11,4),(16,9),(16,13)],fill='#b55f59')
 d.polygon([(10,15),(13,10),(18,9),(22,14)],fill='#d19062')
 for x,y in [(7,8),(11,10),(17,13)]:rect(d,(x,y,x+2,y+1),'#f7dba3')
spr('mushroom',(24,24),mushroom)

def reeds(i,d):
 for x,y in [(3,18),(9,14),(16,16),(19,17)]:
  d.line((x,20,x-2,y-12),fill='#4b7c57',width=2)
  d.line((x+2,21,x+4,y-8),fill='#72a767',width=2)
 rect(d,(8,1,11,9),'#9f7850');rect(d,(19,2,22,10),'#b08b5e')
spr('reeds',(27,24),reeds)

def rune(i,d):
 d.ellipse((2,19,33,31),fill='#62736e')
 d.polygon([(7,19),(12,6),(29,5),(33,22),(26,27),(9,26)],fill='#84958b')
 d.polygon([(12,7),(29,5),(25,13),(12,16)],fill='#a8b4a3')
 d.line((16,12,22,21),fill='#d2c585',width=2);d.line((22,12,16,21),fill='#d2c585',width=2)
 rect(d,(19,11,20,14),'#ead99d')
spr('rune',(36,33),rune)

print('Sprites originais gerados em',A)
