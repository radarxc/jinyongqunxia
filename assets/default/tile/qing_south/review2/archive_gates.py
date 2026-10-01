from pathlib import Path
from PIL import Image
import shutil
r=Path('/Users/bytedance/.codex/generated_images/01a0f44f-8a72-7022-a2bd-9234557650ce')
out=Path(__file__).parent
files={
'gate_k4_candidate1.png':'exec-16a3f313-e72d-48c3-b512-128cdf7affc6.png',
'gate_k4_candidate2.png':'exec-6da4b343-bbcc-45fd-974b-3e3365292868.png',
'gate_k6_candidate1.png':'exec-ca09354d-2e66-4678-bb87-c2c740508c96.png',
'gate_k6_candidate2.png':'exec-2f55d9eb-d034-4526-aba8-b468895aee2d.png'}
for dst,src in files.items(): shutil.copy2(r/src,out/dst)
for k in (4,6):
 im=Image.open(out/f'gate_k{k}_candidate2.png')
 im.crop((0,620,im.width,im.height)).save(out/f'gate_k{k}_base_crop.png')
