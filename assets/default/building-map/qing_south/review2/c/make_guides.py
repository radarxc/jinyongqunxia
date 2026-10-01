from PIL import Image, ImageDraw
from pathlib import Path
ROOT=Path(__file__).parent
SPECS={'temple_hall':(14,11,180),'pagoda':(7,7,670),'guardhouse':(7,5,280),'stable':(9,7,260),'warehouse':(10,8,260),'wharf':(10,4,170)}
for name,(w,d,h) in SPECS.items():
 scale=1200/(w+d) if name!='pagoda' else 750/(w+d)
 lx=168 if name!='pagoda' else 390
 fy=930
 pts=[(lx,fy-w*scale/2),(lx+w*scale,fy),(lx+(w+d)*scale,fy-d*scale/2),(lx+d*scale,fy-(w+d)*scale/2)]
 im=Image.new('RGBA',(1536,1024),(255,255,255,0));draw=ImageDraw.Draw(im)
 draw.polygon(pts,fill=(195,186,168,255),outline=(45,41,35,255),width=3)
 for i in range(1,w):
  t=i/w;draw.line([(pts[0][0]+w*scale*t,pts[0][1]+w*scale*t/2),(pts[3][0]+w*scale*t,pts[3][1]+w*scale*t/2)],fill=(155,146,129,255),width=1)
 for i in range(1,d):
  t=i/d;draw.line([(pts[0][0]+d*scale*t,pts[0][1]-d*scale*t/2),(pts[1][0]+d*scale*t,pts[1][1]-d*scale*t/2)],fill=(155,146,129,255),width=1)
 im.save(ROOT/f'{name}.guide.png')
 print(name,pts)
