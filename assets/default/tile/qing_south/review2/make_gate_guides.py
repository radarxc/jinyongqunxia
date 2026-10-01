from PIL import Image,ImageDraw
from pathlib import Path
import math
out=Path(__file__).parent
for k in (4,6):
    w=k+4; u=1080/(w+4); oy=730 if k==4 else 710
    def p(x,y,z=0): return (round(150+(x+y)*u),round(oy+(x-y)*u/2-z*105))
    im=Image.new('RGBA',(1536,1280)); d=ImageDraw.Draw(im)
    def face(ps,c): d.polygon([p(*q) for q in ps],fill=c,outline=(45,45,45,255),width=3)
    # Deep piers: their widths/depths exactly 2/4 cells.
    for a,b in [(0,2),(w-2,w)]:
        face([(a,0,0),(b,0,0),(b,0,3),(a,0,3)],(180,180,175))
        face([(b,0,0),(b,4,0),(b,4,3),(b,0,3)],(115,120,123))
        face([(a,0,3),(b,0,3),(b,4,3),(a,4,3)],(205,205,200))
    # Horizontal lintel over a genuinely open tunnel.
    face([(2,0,2.7),(w-2,0,2.7),(w-2,0,3),(2,0,3)],(180,180,175))
    face([(0,0,3),(w,0,3),(w,4,3),(0,4,3)],(185,180,170))
    # Gatehouse and exact-axis simple tiled roof volume.
    face([(.2,.2,3),(w-.2,.2,3),(w-.2,.2,4),(.2,.2,4)],(155,95,65))
    face([(w-.2,.2,3),(w-.2,3.8,3),(w-.2,3.8,4),(w-.2,.2,4)],(105,65,48))
    face([(-.3,-.3,4),(w+.3,-.3,4),(w+.3,2,4.8),(-.3,2,4.8)],(110,115,118))
    face([(w+.3,-.3,4),(w+.3,4.3,4),(w+.3,2,4.8)],(90,95,98))
    im.save(out/f'gate_k{k}_guide.png')
