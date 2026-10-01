"""Merge separately generated entries and verify selected assets without changing images."""
from pathlib import Path
import hashlib,json,yaml
from PIL import Image
BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[3]
class NoAliasDumper(yaml.SafeDumper):
    def ignore_aliases(self,data):return True

def dump(value):return yaml.dump(value,Dumper=NoAliasDumper,allow_unicode=True,sort_keys=False,width=100000,default_flow_style=None)
entries=[]
root_ids={e['id'] for e in json.loads((BASE/'catalog-root.json').read_text())}
frozen={'bld_kit_yuan_house','bld_kit_yuan_market','bld_kit_yuan_yamen','bld_kit_yuan_biaoju','bld_kit_yuan_wangfu'}
for path in sorted((BASE/'meta').glob('*.entry.yaml')):
    e=yaml.safe_load(path.read_text())
    e['processing']['paste_offset']=e['processing']['paste_offset'][:2]
    e['png_rotations_available']=[0];e['allowRotation']=False
    e['anchor_px']=e['building']['anchor'][:]
    if 'footprint_basis' not in e:
        e['footprint_basis']='design/22 §3.4 冻结骨架' if e['building']['type'] in frozen else '【建议值】元北方同功能模块占地；非上游冻结数值、非历史测绘。'
    e['visual_qa']={'source_view_image':True,'final_view_image':True,'status':'candidate','note':'逐张目视轮廓/材质/光向；不替代严格几何、历史复原及作者审批。'}
    serialized=dump(e);assert len(serialized.splitlines())<=150
    path.write_text(serialized)
    entries.append(e)
assert len(entries)==19
manifest=BASE/'manifest.yaml'
manifest.write_text('')
for e in entries:
    serialized=dump([e]);assert len(serialized.splitlines())<=150
    with manifest.open('a') as out:out.write(serialized)
assert len(yaml.safe_load(manifest.read_text()))==19
checks=[]
for directory in [BASE,ROOT/'assets/default/tile/yuan_north']:
    for e in yaml.safe_load((directory/'manifest.yaml').read_text()):
        file=directory/e['file'];im=Image.open(file);im.load();a=im.getchannel('A')
        assert im.mode=='RGBA' and a.getextrema()[0]==0 and a.getextrema()[1]>=250,e['id']
        assert e['sha256']==hashlib.sha256(file.read_bytes()).hexdigest(),e['id']
        assert e['size']==f'{im.width}x{im.height}',e['id']
        assert e['status']=='candidate'
        edges=[(0,0,im.width,1),(0,im.height-1,im.width,im.height),(0,0,1,im.height),(im.width-1,0,im.width,im.height)]
        assert max(a.crop(r).getextrema()[1] for r in edges)==0,e['id']
        anchor=e.get('building',{}).get('anchor',e.get('anchor_px'))
        assert anchor and 0<=anchor[0]<im.width and 0<=anchor[1]<im.height,e['id']
        if 'building' in e:
            pr=e['processing'];source=directory/e.get('source_archive',pr.get('source_archive'))
            source_hash=e.get('source_sha256',pr.get('source_sha256'))
            assert hashlib.sha256(source.read_bytes()).hexdigest()==source_hash
            assert len(pr['paste_offset'])==2
            raw=Image.open(source);crop=raw.crop(pr['crop_box']);scaled=crop.resize(pr['resized_size'],Image.Resampling.LANCZOS)
            replica=Image.new('RGBA',im.size,(0,0,0,0));replica.paste(scaled,tuple(pr['paste_offset']))
            assert replica.tobytes()==im.tobytes(),e['id']
            for ref in e['references']:
                rp=ROOT/(ref.get('file') or ref.get('path'))
                assert hashlib.sha256(rp.read_bytes()).hexdigest()==ref['sha256'],str(rp)
        check={'id':e['id'],'size':e['size'],'rgba_sha_anchor_border':'pass'}
        geometry=e.get('geometry_qa',{})
        if 'building' in e:
            check.update(axis_pass=geometry.get('axis_pass'),parallel_edge_pass=geometry.get('parallel_edge_pass'),ratio_pass=geometry.get('ratio_pass'))
        else:
            qa=yaml.safe_load((directory/(file.stem+'__qa.yaml')).read_text())
            check['strict_projection_pass']=None if qa.get('source_ground_slopes') is None else qa.get('strict_projection_pass')
        checks.append(check)
with (BASE/'verification.json').open('w') as out:
    out.write('[\n')
    for i,e in enumerate(checks):out.write(json.dumps(e,ensure_ascii=False)+(',' if i<len(checks)-1 else '')+'\n')
    out.write(']\n')
print('26 selected PNGs: RGBA, hashes, size, anchor and transparent borders pass; 19 buildings exact geometric replay passes.')
geometry_warnings=sum(
    e['geometry_qa'].get('axis_pass') is False
    or e['geometry_qa'].get('parallel_edge_pass') is False
    or e['geometry_qa'].get('ratio_pass') is False
    for e in entries
)
print('Buildings with no failure in recorded geometry fields:',len(entries)-geometry_warnings,'of',len(entries),'; warnings:',geometry_warnings)
print('Manifest lines:',len(manifest.read_text().splitlines()))
