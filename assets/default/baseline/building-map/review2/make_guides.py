"""Geometry-only reference guides; not used to paint final asset pixels."""
from pathlib import Path
from PIL import Image, ImageDraw
P=Path(__file__).resolve().parent
for ident,w,h in [('southern_wharf',10,4),('southern_stable',9,7)]:
    im=Image.new('RGB',(1536,1024),'white');d=ImageDraw.Draw(im)
    unit=64 if ident.endswith('stable') else 80
    cx,cy=768,720 if ident.endswith('stable') else 540
    def pos(x,y):return (cx+unit*(x-y-(w-h)/2),cy+unit/2*(x+y-(w+h)/2))
    points=[pos(0,h),pos(w,h),pos(w,0),pos(0,0)]
    for x in range(w+1):d.line([pos(x,0),pos(x,h)],fill='#c8d2de',width=2)
    for y in range(h+1):d.line([pos(0,y),pos(w,y)],fill='#c8d2de',width=2)
    d.line(points+[points[0]],fill='#e65f26',width=5)
    im.save(P/(ident+'_geometry_guide.png'))
    print(ident,points)
