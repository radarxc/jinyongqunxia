from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,datetime
P=Path(__file__).resolve().parent; base=P.parent
srcdir='/Users/bytedance/.codex/generated_images/01a0f474-2f2e-72b1-b434-61f8b19c12a6/'
config={4:([(117,831),(667,1118),(939,971)],[(260,906),(520,1041)],'exec-7d3fdeb9-f838-4fd0-aba2-bce615d76dbc.png',[0.53549,-0.53825]),6:([(121,831),(805,1179),(1077,1041)],[(252,901),(660,1105)],'exec-a18e1d37-93f5-4232-a7c5-f1f8ae4acf84.png',[0.52321,-0.50624])}
updates={}
for k,(corners,opening,original,fitted) in config.items():
 id=f'tex_town_qing_south_city_gate__k{k}_r000_v01';L,F,R=corners;front=F[0]-L[0];depth=R[0]-F[0]
 src=P/f'gate_k{k}_candidate2.png';im=Image.open(src).convert('RGBA');bbox=im.getchannel('A').point(lambda p:255 if p>=2 else 0).getbbox()
 crop=[max(0,bbox[0]-2),max(0,bbox[1]-2),min(im.width,bbox[2]+2),min(im.height,bbox[3]+2)];scale=(k+4)*32/front;cut=im.crop(crop)
 cut=cut.resize((round(cut.width*scale),round(cut.height*scale)),Image.Resampling.LANCZOS);out=Image.new('RGBA',(cut.width+32,cut.height+32));out.paste(cut,(16,16));dest=base/(id+'.png');out.save(dest)
 conv=lambda p:[round((p[0]-crop[0])*scale+16,4),round((p[1]-crop[1])*scale+16,4)]
 center=[(L[i]+R[i])/2 for i in range(2)];anchor=conv(center);w=k+4;dx=w*16;dy=w*8
 target=[[anchor[0]-dx-64,anchor[1]-dy+32],[anchor[0]+dx-64,anchor[1]+dy+32],[anchor[0]+dx+64,anchor[1]+dy-32],[anchor[0]-dx+64,anchor[1]-dy-32]]
 slopes=[(F[1]-L[1])/front,(R[1]-F[1])/depth];ratio=front/depth;passage=w*(opening[1][0]-opening[0][0])/front;deep=w*depth/front
 qa={'source_corners_px':dict(zip(['left','front','right'],corners)),'source_passage_endpoints_px':opening,'source_axis_slopes':slopes,'source_edge_fit_slopes':fitted,'axis_tolerance':0.03,'axis_pass':all(abs(abs(s)-.5)<=.03 for s in slopes+fitted),'source_width_depth_ratio':ratio,'expected_width_depth_ratio':w/4,'ratio_relative_error':abs(ratio/(w/4)-1),'ratio_pass':abs(ratio/(w/4)-1)<=.05,'measured_depth_cells_front_calibrated':deep,'measured_passage_cells_front_calibrated':passage,'measurement_uncertainty_source_px':5,'gate_dimensions_within_endpoint_uncertainty':k==6,'strict_gate_contract_pass':k==6,'note':'实测alpha>=128的基脚轮廓与目视同正面孔脚；k6数值与4/6格目标在±5源px取点误差内，仍不代表运行时像素碰撞对格通过。k4净宽与轴斜率未达。'}
 request=json.loads((P/f'gate_k{k}_candidate2_request.json').read_text())
 u={'id':id,'prompt':request['prompt'],'references':request['referenced_image_paths'],'created':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_path':srcdir+original,'source_copy':f'review3/{src.name}','source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'size':f'{out.width}x{out.height}','sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'anchor_px':anchor,'geometry_updates':{'anchor_basis':'实测源底面左右角中点，经裁切和同一等比比例换算；取点±5源px','source_anchor_px':center,'crop_box':crop,'uniform_scale':scale,'padding_px':16,'footprint_polygon_target_px':target,'validation':'near-target gate dimensions within source endpoint uncertainty; runtime collision untested' if k==6 else 'improved depth but passage width and projection still outside target'},'geometry_qa':qa,'notes':'第3轮每门2候选选第2；仅alpha>=2外接框外扩2px裁切、等比缩放、16px透明留边；保留框内全部原始alpha。'+('净宽/进深与目标差分别-0.035/-0.023格，位于取点误差内。' if k==6 else '实测净宽约3.782格，进深3.956格；底边拟合斜率0.535/-0.538，未满足0.50±0.03，不可release。')}
 updates[id]=u
 (P/f'gate_k{k}_measurement.json').write_text(json.dumps(qa,ensure_ascii=False)+'\n')
 overlay=Image.new('RGBA',im.size,'#777777');overlay.alpha_composite(im);dr=ImageDraw.Draw(overlay)
 for lab,xy in zip(['L','F','R','A','B'],corners+opening):
  x,y=xy;dr.ellipse((x-4,y-4,x+4,y+4),fill='red');dr.text((x+6,y-15),lab+str(xy),fill='white')
 overlay.save(P/f'gate_k{k}_selected_measurement_overlay.png')
 qaimg=Image.new('RGBA',(out.width*2,out.height),'#eeeeee');dark=Image.new('RGBA',out.size,'#30343a');dark.alpha_composite(out);qaimg.alpha_composite(out);qaimg.alpha_composite(dark,(out.width,0));qaimg.save(P/f'gate_k{k}_final_light_dark.png')
 print(id,u['size'],u['sha256'],json.dumps(qa,ensure_ascii=False))
(P/'entry-updates.json').write_text(json.dumps(updates,ensure_ascii=False)+'\n')
