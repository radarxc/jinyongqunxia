"""Independent QA composites: orange ideal perimeter, cyan measured points."""
import json
from pathlib import Path
from PIL import Image, ImageDraw
P=Path(__file__).resolve().parent; R=P.parent
for kind in ['stable','wharf']:
    ident='bld_kit_song_southern_'+kind
    e=json.loads((R/'meta'/(ident+'.entry.json')).read_text())
    im=Image.open(R/(ident+'.png'));bg=Image.new('RGBA',im.size,(219,224,213,255));bg.alpha_composite(im)
    d=ImageDraw.Draw(bg);w,h=e['building']['footprint'];ax,ay=e['building']['anchor']
    def pos(x,y): return (ax+32*(x-y-(w-h)/2),ay+16*(x+y-(w+h)/2))
    for x in range(w+1): d.line([pos(x,0),pos(x,h)],fill=(74,120,151,130),width=1)
    for y in range(h+1): d.line([pos(0,y),pos(w,y)],fill=(74,120,151,130),width=1)
    poly=[pos(0,h),pos(w,h),pos(w,0),pos(0,0)];d.line(poly+[poly[0]],fill='#ff772b',width=2)
    p=e['processing'];sx,sy=p['rounded_effective_scale'];crop=p['crop_box'];off=p['paste_offset']
    measured=[]
    for x,y in e['geometry_qa']['source_corners_px'].values():
        a,b=(x-crop[0])*sx+off[0],(y-crop[1])*sy+off[1];measured.append([a,b]);d.ellipse([a-3,b-3,a+3,b+3],fill='#00ffff')
    d.ellipse([ax-3,ay-3,ax+3,ay+3],fill='#0033ff')
    bg.convert('RGB').save(P/(ident+'_overlay.png'))
    print(ident,e['geometry_qa']['source_axis_slopes'],e['geometry_qa']['ratio_relative_error'],e['size'],e['building']['anchor'],measured)
