"""Run the existing geometric normalizer with writes bounded to 50 lines."""
import importlib.util
from pathlib import Path
P=Path(__file__).resolve().parent
original=Path.write_text
def bounded(self,data,encoding=None,errors=None,newline=None):
    lines=data.splitlines(True)
    with self.open('w',encoding=encoding,errors=errors,newline=newline) as f:
        for i in range(0,len(lines),50): f.writelines(lines[i:i+50])
    return len(data)
Path.write_text=bounded
spec=importlib.util.spec_from_file_location('town_normalize',P.parent/'normalize.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
for kind in ['stable','wharf']:
    print(module.normalize(P.parent/'sources'/('bld_kit_song_southern_'+kind+'.json')))
Path.write_text=original
