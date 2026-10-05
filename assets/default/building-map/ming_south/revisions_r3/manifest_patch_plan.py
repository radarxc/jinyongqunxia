"""Print small patches only for changed fields of nominated R3 entries."""
import json, re, sys
from pathlib import Path
import yaml
ROOT = Path(__file__).resolve().parents[1]
manifest = ROOT / 'manifest.yaml'
typ = sys.argv[1]
result = json.loads((ROOT / 'revisions_r3' / typ / 'result.json').read_text())
entry = result.get('entry') or result['manifest_replacement']
text = manifest.read_text()
blocks = re.split(r'(?=^- id: )', text, flags=re.M)
old = next(b for b in blocks if b.startswith('- id: ' + entry['id'] + '\n'))
parsed = yaml.safe_load(old)[0]
fields = re.split(r'(?=^  [a-zA-Z_]\w*:)', old, flags=re.M)
by_name = {re.match(r'  (\w+):', f).group(1): f for f in fields if re.match(r'  (\w+):', f)}
patches = []
for key, value in entry.items():
    if parsed.get(key) == value:
        continue
    assert key != 'id'
    new = ''.join('  ' + line + '\n' for line in yaml.safe_dump({key: value}, allow_unicode=True, sort_keys=False, width=100000).splitlines())
    previous = by_name.get(key)
    if previous is None:
        previous = by_name['file']
        new = previous + new
    lines = ['*** Begin Patch', '*** Update File: ' + str(manifest), '@@ - id: ' + entry['id']]
    lines += ['-' + line for line in previous.rstrip('\n').split('\n')]
    lines += ['+' + line for line in new.rstrip('\n').split('\n')]
    lines += ['*** End Patch']
    assert len(lines) <= 50, (key, len(lines))
    patches.append('\n'.join(lines))
print(json.dumps(patches, ensure_ascii=False))
