from PIL import Image,ImageDraw
from pathlib import Path
p=Path(__file__).parent
spec={'restaurant':(12,9),'yamen':(17,13),'biaoju':(15,12),'manor':(16,13),'wangfu':(22,18)}
for n,(w,d) in spec.items():
 s=1280/(w+d); L=(128,940-w*s/2);F=(128+w*s,940);R=(1408,940-d*s/2);B=(128+d*s,300)
 im=Image.new('RGBA',(1536,1024),(0,0,0,0));dr=ImageDraw.Draw(im)
 dr.polygon([L,F,R,B],fill=(201,197,183,255),outline=(60,60,60,255))
 for j in range(w+1):
  a=(L[0]+j*s,L[1]+j*s/2);b=(a[0]+d*s,a[1]-d*s/2);dr.line([a,b],fill=(130,126,116,255),width=2)
 for j in range(d+1):
  a=(L[0]+j*s,L[1]-j*s/2);b=(a[0]+w*s,a[1]+w*s/2);dr.line([a,b],fill=(130,126,116,255),width=2)
 im.save(p/f'{n}.guide.png');print(n,L,F,R,B)
