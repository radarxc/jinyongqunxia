from PIL import Image,ImageDraw
from pathlib import Path
p=Path(__file__).parent
spec={'wangfu':(22,18)}
for n,(w,d) in spec.items():
 s=1200/(w+d); ly=900-w*s*.47
 def pt(x,z,h=0):return (168+(x+z)*s,ly+(x-z)*s*.47-h)
 im=Image.new('RGBA',(1536,1024),(0,0,0,0));dr=ImageDraw.Draw(im)
 dr.polygon([pt(0,0),pt(w,0),pt(w,d),pt(0,d)],fill=(195,186,168,255),outline=(60,60,60,255))
 def box(x0,z0,x1,z1,h):
  a,b,c,e=[pt(x,z) for x,z in [(x0,z0),(x1,z0),(x1,z1),(x0,z1)]]
  A,B,C,E=[(x,y-h) for x,y in [a,b,c,e]]
  dr.polygon([a,b,B,A],fill=(231,219,202,255),outline=(80,75,70,255))
  dr.polygon([b,c,C,B],fill=(173,164,153,255),outline=(80,75,70,255))
  dr.polygon([A,B,C,E],fill=(98,99,99,255),outline=(60,60,60,255))
 if n=='restaurant':box(.5,.5,w-.5,d-.5,250)
 else:
  box(.5,d-3.5,w-.5,d-.5,150)
  box(.5,.5,2.8,d-3.5,105)
  box(w-2.8,.5,w-.5,d-3.5,105)
  box(.25,.25,w-.25,.6,70)
  box(w/2-1.2,.25,w/2+1.2,1.8,120)
 im.save(p/f'{n}.mid-block.png')
