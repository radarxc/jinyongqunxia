from pathlib import Path
from PIL import Image
import json,hashlib,math
root=Path(__file__).parent.parent
points={4:((180,666),(989,1104),(1229,971),(494,814),(735,948)),6:((96,687),(980,1104),(1296,945),(271,788),(766,993))}
for k,(left,front,right,hole_l,hole_r) in points.items():
    name=f'tex_town_qing_south_city_gate__k{k}_r000_v01'
    src=root/'review2'/f'gate_k{k}_candidate2.png'; im=Image.open(src)
    box=im.getchannel('A').getbbox(); w=k+4; span=right[0]-left[0]; s=32*(w+4)/span
    crop=im.crop(box); resized=(round(crop.width*s),round(crop.height*s)); crop=crop.resize(resized,Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',(crop.width+32,crop.height+32)); canvas.paste(crop,(16,16)); canvas.save(root/f'{name}.png')
    anchor0=[(left[j]+right[j])/2 for j in (0,1)]
    def trans(pt): return [round((pt[j]-box[j])*s+16,4) for j in (0,1)]
    dx=front[0]-left[0]; dy=right[0]-front[0]
    slopes=[(front[1]-left[1])/dx,(right[1]-front[1])/dy]; ratio=dx/dy
    qa={'source_corners_px':{'left':left,'front':front,'right':right},'source_passage_endpoints_px':[hole_l,hole_r],
        'source_axis_slopes':slopes,'axis_tolerance':.03,'axis_pass':abs(slopes[0]-.5)<=.03 and abs(slopes[1]+.5)<=.03,
        'source_width_depth_ratio':ratio,'expected_width_depth_ratio':w/4,'ratio_relative_error':abs(ratio/(w/4)-1),'ratio_pass':abs(ratio/(w/4)-1)<=.1,
        'measured_depth_cells_front_calibrated':w*dy/dx,'measured_passage_cells_front_calibrated':w*(hole_r[0]-hole_l[0])/dx,
        'measurement_uncertainty_source_px':5,'strict_gate_contract_pass':False,'note':'人工view_image读取基脚三角及孔脚；只声明实际残差，不将目标掩膜当像素通过。'}
    sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
    record={'id':name,'round':2,'selected_attempt':2,'attempts_this_round':2,'source_copy':str(src.relative_to(root)),
        'source_sha256':sha(src),'sha256':sha(root/f'{name}.png'),'size':f'{canvas.width}x{canvas.height}','crop_box':box,'uniform_scale':s,
        'resized_size':resized,'padding_px':16,'source_anchor_px':anchor0,'anchor_px':trans(anchor0),'geometry_qa':qa,
        'processing':'alpha bbox crop, uniform LANCZOS resize with integer rounding, transparent padding only; no warp or alpha repaint',
        'visual_review':'view_image原图及底部裁片：灰砖灰瓦红褐木构、轮廓完整、门孔透明；底面/净孔仍有残差，保持candidate。'}
    # Compact nested records ensure each write stays below 50 lines.
    (root/'review2'/f'gate_k{k}_measurement.json').write_text(json.dumps(record,ensure_ascii=False,indent=None)+'\n')
    print(name,record['size'],qa)
