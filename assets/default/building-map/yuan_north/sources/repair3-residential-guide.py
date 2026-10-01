from PIL import Image, ImageDraw
from pathlib import Path
ROOT=Path('assets/default/building-map/yuan_north/sources')
for name,w,d,h in [('house',7,6,3.2),('courtyard',10,8,3.1),('inn',12,9,5.6),('shop_1f',6,5,3.1)]:
 s=min(1100/(w+d),690/((w+d)/2+h+1.3)); ox=768-(w-d)*s/2; oy=860-(w+d)*s/2
 im=Image.new('RGBA',(1536,1024)); dr=ImageDraw.Draw(im)
 def P(x,y,z=0):return (round(ox+(x-y)*s),round(oy+(x+y)*s/2-z*s))
 def poly(pts,col):dr.polygon([P(*p) for p in pts],fill=col,outline='#5c5448',width=2)
 def box(x1,y1,x2,y2,z):
  poly([(x1,y1,z),(x2,y1,z),(x2,y2,z),(x1,y2,z)],'#b8a484')
  poly([(x1,y2,0),(x2,y2,0),(x2,y2,z),(x1,y2,z)],'#c7ad87')
  poly([(x2,y1,0),(x2,y2,0),(x2,y2,z),(x2,y1,z)],'#978269')
 def hall(x1,y1,x2,y2,z):
  box(x1,y1,x2,y2,z); ym=(y1+y2)/2; rise=(y2-y1)*.33
  poly([(x2,y1,z),(x2,ym,z+rise),(x2,y2,z)],'#bba180')
  poly([(x1-.18,y1-.18,z),(x2+.18,y1-.18,z),(x2+.18,ym,z+rise),(x1-.18,ym,z+rise)],'#65625b')
  poly([(x1-.18,ym,z+rise),(x2+.18,ym,z+rise),(x2+.18,y2+.18,z),(x1-.18,y2+.18,z)],'#77766e')
  dr.line([P(x1-.18,ym,z+rise),P(x2+.18,ym,z+rise)],fill='#bbb2a1',width=9)
  for x in [x1+(x2-x1)*.15,x1+(x2-x1)*.5,x1+(x2-x1)*.84]:
   poly([(x-.33,y2,.12),(x+.33,y2,.12),(x+.33,y2,z*.7),(x-.33,y2,z*.7)],'#574431')
 poly([(0,0,0),(w,0,0),(w,d,0),(0,d,0)],'#bdaa87')
 if name in ('house','shop_1f'):hall(.45,.55,w-.45,d-.6,h)
 else:
  hall(.5,.5,w-.5,d*.42,h)
  if name=='inn':hall(.55,d*.46,2.6,d-.6,2.3)
  box(0,d-.24,w,d,1.6);box(w-.24,0,w,d,1.6);box(0,0,.24,d,1.6)
  hall(w*.40,d-.5,w*.6,d,1.9)
 im.save(ROOT/f'bld_kit_yuan_north_{name}.repair3.guide.png')
 print(name,{'s':s,'left':P(0,d),'front':P(w,d),'right':P(w,0)})
