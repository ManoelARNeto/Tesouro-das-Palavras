"""Sprite original do Altar do Livro; executar com Pillow para regenerar."""
from pathlib import Path
from PIL import Image, ImageDraw
out=Path(__file__).resolve().parents[1]/'assets'/'objects'/'altar_livro.png'
im=Image.new('RGBA',(48,56),(0,0,0,0));d=ImageDraw.Draw(im)
# sombra e pedestal de pedra
d.ellipse((6,47,42,54),fill=(14,29,27,90))
d.rectangle((5,42,43,49),fill='#455755')
d.rectangle((8,36,40,43),fill='#71857c')
d.rectangle((10,33,38,37),fill='#bac4ad')
d.rectangle((12,15,36,34),fill='#687e75')
d.rectangle((14,17,34,31),fill='#a1ac96')
d.rectangle((18,29,30,33),fill='#465c55')
# brilho mágico e topo dourado
d.rectangle((7,13,41,18),fill='#967647')
d.rectangle((9,10,39,15),fill='#e5ba70')
d.rectangle((11,10,37,11),fill='#f6e1ad')
# livro aberto: couro violeta e páginas
d.polygon([(11,10),(12,3),(23,6),(24,15)],fill='#673d6f')
d.polygon([(24,15),(25,6),(36,3),(37,10)],fill='#864b7c')
d.polygon([(13,8),(14,5),(22,8),(23,13)],fill='#f5e4b3')
d.polygon([(25,13),(26,8),(34,5),(35,8)],fill='#f5e4b3')
d.line((24,5,24,15),fill='#f4c75b',width=2)
# runas azuis e centelha
d.rectangle((19,21,22,23),fill='#81c7d1')
d.rectangle((26,21,29,23),fill='#81c7d1')
for x,y in [(8,5),(39,3),(4,21),(43,24)]:
 d.point((x,y),fill='#ffeec2');d.line((x-2,y,x+2,y),fill='#e9cb8a');d.line((x,y-2,x,y+2),fill='#e9cb8a')
# contornos internos para efeito pixel art
d.line([(11,15),(11,34),(13,36)],fill='#3f554e',width=2)
d.line([(37,15),(37,34),(35,36)],fill='#3f554e',width=2)
out.parent.mkdir(parents=True,exist_ok=True);im.save(out)
print('Criado',out)
