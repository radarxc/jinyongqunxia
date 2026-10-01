from pathlib import Path
from PIL import Image
import hashlib,json,math
r=Path(__file__).parent;root=r.parent.parent;asset='bld_kit_qing_south_stable'
source=r/'candidate2.png';im=Image.open(source);a=im.getchannel('A');box=a.getbbox()
L=(130,564);F=(860,943);R=(1436,650);B=(L[0]+R[0]-F[0],L[1]+R[1]-F[1]);s=512/(R[0]-L[0])
size=tuple(round(v*s) for v in (box[2]-box[0],box[3]-box[1]));canvas=tuple(max(256,math.ceil((v+32)/32)*32) for v in size);offset=tuple((canvas[i]-size[i])//2 for i in (0,1))
out=Image.new('RGBA',canvas,(0,0,0,0));out.paste(im.crop(box).resize(size,Image.Resampling.LANCZOS),offset);out.save(root/(asset+'.png'))
def trans(p):return [round((p[i]-box[i])*s+offset[i],4) for i in (0,1)]
anchor=trans(((L[0]+R[0])/2,(L[1]+R[1])/2));qa={'source_corners_px':dict(left=L,front=F,right=R,back_inferred=B),'source_axis_slopes':[(F[1]-L[1])/(F[0]-L[0]),(R[1]-F[1])/(R[0]-F[0])],'axis_tolerance':0.03,'source_width_depth_ratio':(F[0]-L[0])/(R[0]-F[0]),'expected_width_depth_ratio':9/7,'measurement_uncertainty_source_px':3,'precision_note':'第3轮原图同平面石边下缘角，放大审图人工读点±3px；非guide理论点；后角由L+R-F推算。'}
qa['axis_pass']=all(abs(abs(m)-.5)<=.03 for m in qa['source_axis_slopes']);qa['ratio_relative_error']=abs(qa['source_width_depth_ratio']/(9/7)-1);qa['ratio_tolerance_suggestion']=.1;qa['ratio_pass']=qa['ratio_relative_error']<=.1
h=out.getchannel('A').histogram();bb=out.getchannel('A').getbbox();pixel={'mode':out.mode,'size':canvas,'alpha_extrema':out.getchannel('A').getextrema(),'alpha_zero_pixels':h[0],'alpha_partial_pixels':sum(h[1:255]),'alpha_opaque_pixels':h[255],'alpha_near_opaque_pixels':sum(h[192:]),'alpha_nonzero_bbox':bb,'transparent_margins_px':[bb[0],bb[1],canvas[0]-bb[2],canvas[1]-bb[3]],'border_alpha_max':0}
processing={'source_archive':'review3/stable/candidate2.png','source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'source_size':im.size,'crop_box':box,'uniform_scale_requested':s,'resized_size':size,'rounded_effective_scale':[size[i]/(box[i+2]-box[i]) for i in (0,1)],'paste_offset':offset,'final_file':asset+'.png','steps':['crop alpha>0 bounding box','one uniform LANCZOS resize with integer rounding','transparent padding; no warp, redraw, alpha edit or contour trimming']}
record={'id':asset,'source_path':'/Users/bytedance/.codex/generated_images/01a0f473-4145-7162-9950-8a31a2ce42a7/exec-20aab8ef-ebfe-45a9-894a-1ecc09b75940.png','candidate_count':2,'selected_candidate':2,'building':{'type':asset,'footprint':[9,7],'anchor':anchor,'era':'qing_south'},'geometry_qa':qa,'pixel_qa':pixel,'processing':processing,'measured_corners_final_px':{k:trans(p) for k,p in [('left',L),('front',F),('right',R),('back_inferred',B)]},'size':f'{canvas[0]}x{canvas[1]}','sha256':hashlib.sha256((root/(asset+'.png')).read_bytes()).hexdigest()}
(r/'record.json').write_text(json.dumps(record,ensure_ascii=False)+'\n');print(json.dumps(record,ensure_ascii=False))
