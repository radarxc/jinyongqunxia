#!/usr/bin/env python3
"""第三波追踪：生成要登记的 tasks.json 条目（ART-ui-icons 等 + 城图批），写到 <stage>/tasks_new.json，并把城图 expect 清单放进暂存区。
    build_tasks.py <stage_dir> <cityplan_dir> <rosters.json>
"""
import json, shutil, sys
from pathlib import Path
STAGE, PLAN, ROST = Path(sys.argv[1]), Path(sys.argv[2]), json.load(open(sys.argv[3], encoding='utf-8'))
GEM = "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem"
REF = "/Users/bytedance/Projects/jinyongqunxia/.agents/coord/imagegen-reference"
def roots(*r): return ["-c", "sandbox_workspace_write.writable_roots=" + json.dumps(list(r))]
PY = "{python}"
IDS = [PY, "tools/lint/check_ids.py", "--strict"]
T = []
def task(**kw):
    base = dict(phase="PROD", wave=18, kind="draft", review=False, vars={})
    base.update(kw); T.append(base)
task(id="ART-ui-icons", title="界面图标 · 武侠主题图标一套（工具栏 8 + 城镇 / 战斗 / 银两 / 城池标记 + 状态 10，共 22 件，512 RGBA 真透明；作者 AR-48，codex gpt-6-astra xhigh）",
     prompt="ART-ui-icons.md", deps=[], web=False, writes=["assets/default/ui/icons/**"],
     validate={"exists": ["assets/default/ui/icons/manifest.yaml"], "cmd": [
         [PY, "tools/agents/check_assets.py", "assets/default/ui/icons", "--min", "22", "--max", "22", "--min-side", "512"],
         [PY, "-c", "import glob,sys; from PIL import Image; fs=sorted(glob.glob('assets/default/ui/icons/*.png')); bad=[f for f in fs if (lambda im: im.mode!='RGBA' or im.size!=(512,512) or im.getchannel('A').getextrema()!=(0,255) or max(im.getchannel('A').crop(b).getextrema()[1] for b in ((0,0,32,32),(480,0,512,32),(0,480,32,512),(480,480,512,512)))>0)(Image.open(f))]; print(len(fs),'icons; bad:',bad); sys.exit(1 if bad or len(fs)!=22 else 0)"],
         IDS]},
     agent_args=roots(GEM, "/private/tmp"), sparse_include=["assets/default/ui/icons", "assets/default/baseline/item"])
task(id="ART-rig-std-refs", title="标准体参考 · 男 / 女标准体 A 字三视图各 1 张 + sheet_split 拆出 6 张视图参考（AR-47；codex gpt-6-astra xhigh）",
     prompt="ART-rig-std-refs.md", deps=[], web=False,
     writes=["assets/default/rig/male_std/sheet/**", "assets/default/rig/male_std/ref/**", "assets/default/rig/female_std/sheet/**",
             "assets/default/rig/female_std/ref/**", "assets/default/prompts/rig/male_std/ref_*.md", "assets/default/prompts/rig/female_std/ref_*.md"],
     validate={"exists": ["assets/default/rig/male_std/sheet/sheet_L.png", "assets/default/rig/female_std/sheet/sheet_L.png"], "cmd": [
         [PY, "tools/agents/check_assets.py", "assets/default/rig/male_std/sheet", "--min", "1", "--max", "1", "--min-side", "1000"],
         [PY, "tools/agents/check_assets.py", "assets/default/rig/female_std/sheet", "--min", "1", "--max", "1", "--min-side", "1000"],
         [PY, "tools/agents/check_assets.py", "assets/default/rig/male_std/ref", "--min", "3", "--max", "3", "--min-side", "256"],
         [PY, "tools/agents/check_assets.py", "assets/default/rig/female_std/ref", "--min", "3", "--max", "3", "--min-side", "256"], IDS]},
     agent_args=roots(GEM, "/private/tmp"),
     sparse_include=["assets/default/rig/male_std", "assets/default/rig/female_std",
                     "assets/default/character/male/ch00/por_npc_zhujue__ch00_m_base.png", "assets/default/character/female/ch00/por_npc_zhujue__ch00_f_base.png"])
task(id="ART-rig-sheet-f", title="动作原型 · 主角·女（npc_zhujue__ch00_f）A 字三视图 L / R 与纯侧视补充图 L / R（AR-47；codex gpt-6-astra xhigh，上传女主立绘作身份参考）",
     prompt="ART-rig-sheet-f.md", deps=[], web=False, writes=["assets/default/rig/npc_zhujue__ch00_f/sheet/**"],
     validate={"exists": ["assets/default/rig/npc_zhujue__ch00_f/sheet/sheet_L.png", "assets/default/rig/npc_zhujue__ch00_f/sheet/sheet_R.png",
                          "assets/default/rig/npc_zhujue__ch00_f/sheet/sheet_side_L.png", "assets/default/rig/npc_zhujue__ch00_f/sheet/sheet_side_R.png"],
               "cmd": [[PY, "tools/agents/check_assets.py", "assets/default/rig/npc_zhujue__ch00_f/sheet", "--min", "4", "--max", "4", "--min-side", "1000"], IDS]},
     agent_args=roots(GEM, "/private/tmp"),
     sparse_include=["assets/default/rig/npc_zhujue__ch00_f", "assets/default/character/female/ch00/por_npc_zhujue__ch00_f_base.png"])
task(id="TOOL-rig-parts-f", title="动作原型 · 主角·女三视图切件、身份 rig 与走路 / 剑招动图（用 TOOL-rig-sheet 的切件工具链；AR-47；traex GPT-5.6-Sol max）",
     prompt="TOOL-rig-parts-f.md", deps=["ART-rig-sheet-f"], web=False,
     writes=["assets/default/rig/npc_zhujue__ch00_f/manifest.yaml", "assets/default/rig/npc_zhujue__ch00_f/front34/**", "assets/default/rig/npc_zhujue__ch00_f/side/**",
             "assets/default/rig/npc_zhujue__ch00_f/back34/**", "assets/default/rig/npc_zhujue__ch00_f/preview/**", "assets/default/rig/npc_zhujue__ch00_f/work/**",
             "tools/rig/*.py"],
     validate={"exists": ["assets/default/rig/npc_zhujue__ch00_f/manifest.yaml", "assets/default/rig/npc_zhujue__ch00_f/preview/walk_dir8.gif"], "cmd": [
         [PY, "-m", "unittest", "discover", "-s", "tools", "-p", "test_*.py"],
         [PY, "tools/rig/make_parts.py", "assets/default/rig/npc_zhujue__ch00_f", "--check"],
         [PY, "tools/rig/make_parts.py", "assets/default/rig/npc_zhujue__ch00_m", "--check"],
         [PY, "tools/agents/check_assets.py", "assets/default/rig/npc_zhujue__ch00_f", "--min", "39", "--max", "60", "--min-side", "16"], IDS],
         "shrink_exempt": ["tools/rig/*.py"]},
     agent_args=roots("/private/tmp"),
     sparse_include=["assets/default/rig", "assets/default/character/female/ch00/por_npc_zhujue__ch00_f_base.png", "assets/default/character/male/ch00/por_npc_zhujue__ch00_m_base.png"])
task(id="ART-ruins-tiles", title="遗迹贴片 · 洞壁、墓道、土坯残墙、石刻、矿支架、毡帐、药架、灯具、宝箱、钟乳石笋、湿壁、夯土剖面、淤沙、坍塌、盗洞 22 件 + Tiled 图块集（装饰 / 方向地形）（AR-47；codex gpt-6-astra xhigh）",
     prompt="ART-ruins-tiles.md", deps=[], web=True,
     writes=["assets/default/tile/ruins/**", "assets/default/prompts/tile.md", "content/tiled/tilesets/deco_ruins.tsj", "content/tiled/tilesets/terrain_dir.tsj"],
     validate={"exists": ["assets/default/tile/ruins/manifest.yaml", "content/tiled/tilesets/deco_ruins.tsj", "content/tiled/tilesets/terrain_dir.tsj"], "cmd": [
         [PY, "tools/agents/check_assets.py", "assets/default/tile/ruins", "--min", "22", "--max", "30", "--min-side", "32"],
         [PY, "-c", "import json,re,os,sys; b='content/tiled/tilesets'; d=json.load(open(b+'/deco_ruins.tsj')); P=[({p['name']:p['value'] for p in t.get('properties',[])}, t.get('image','')) for t in d['tiles']]; bad=[i for p,i in P if not re.fullmatch(r'[a-z][a-z0-9]*(?:_[a-z0-9]+)*', str(p.get('decoId',''))) or not os.path.isfile(os.path.normpath(os.path.join(b,i)))]; print(len(P),'deco tiles; bad',bad); sys.exit(1 if bad or len(P)<22 else 0)"],
         [PY, "-c", "import json,sys; d=json.load(open('content/tiled/tilesets/terrain_dir.tsj')); P=[{p['name']:p['value'] for p in t.get('properties',[])} for t in d['tiles']]; bad=[p for p in P if not str(p.get('terrainId','')).startswith('tr_') or (p.get('ramp') is True and p.get('rampDir') not in range(6)) or (p.get('terrainId') in ('tr_jiliu','tr_pubu') and p.get('flowDir') not in range(6))]; print(len(P),'dir tiles; bad',bad); sys.exit(1 if bad or len(P)<18 else 0)"],
         IDS]},
     agent_args=roots(GEM, "/private/tmp"),
     sparse_include=["assets/default/tile/ruins", "assets/default/tile/song_north/manifest.yaml", "assets/default/tile/song_north/*.png"])
# 人物两批
DIR = {'ch01':'ch01-tianlong','ch02':'ch02-shediao','ch03':'ch03-shendiao','ch04':'ch04-yitian','ch05':'ch05-xiaoao','ch06':'ch06-xiake','ch07':'ch07-bixue','ch08':'ch08-luding','ch09':'ch09-liancheng','ch10':'ch10-baima','ch11':'ch11-yuanyang','ch12':'ch12-shujian','ch13':'ch13-feihu','ch14':'ch14-xueshan'}
for suf, chs, wno, title, count, source, extra in (
    ("c", [f"ch0{i}" for i in range(1, 8)], "22", "天龙八部～碧血剑（ch01–ch07）", "71 项 + 神雕 1",
     "`docs/design/18-npc-and-companions.md` §13.6（A 批七册名录的补充索引当时未合入，以 §13.6 为准）、`tools/agents/reports/DES-npcs-register-a.md` §3 / §6、各书名录 `docs/design/catalog/npcs-chNN-*.md`",
     "- 照 `tools/agents/reports/ART-cast-fill-a.md` §4 / §6 的默认处理：**神雕**（`npc_shendiao`，非人形）用已有提示词 `assets/default/prompts/characters/ch03-shendiao/npc_shendiao.md`（去掉 `generation_hold`），选非人形参考（不用人类基线，runner 队列第 3 列写 `none`；可上传一张缩小的已过审非人形 / 动物类素材作画风参考，没有就只靠文字），图与 manifest 在 `assets/default/character/other/ch03/`（新建），入库用 `tools/imagegen/ingest.py`（`--tool \"codex exec · image_gen\" --model gpt-6-astra --prompt-file … --refs …`），2:3 竖幅 1024×1536。\n- **何足道**只做倚天（ch04）这一张（倚天楔子，复用既有 `npc_hezudao`），不在神雕造本人出场。\n- 丘处机（ch03）以射雕已入库的 `por_npc_qiuchuji__ch02_elder_base` 作锚点，年长约 20 岁；归钟（ch07）以鹿鼎的 `por_npc_guisong__ch08_prime_base` 作锚点，年轻约 10 岁；瑛姑 ch02、ch03 两版同一人（先出 ch02 作锚点）。\n- 工具箱从 `…/gem/codex_w13/`（上一波 A 批，ingest8 已改成保留旧条目字节、只追加）复制到你的目录；`ingest8.py` 不认 `other` 性别，神雕按上面单独入库。"),
    ("d", ["ch08", "ch09", "ch10", "ch11", "ch12", "ch13", "ch14"], "23", "鹿鼎记～雪山飞狐（ch08–ch14）", "39 项（姜小铁暂缓）",
     "七册补充名录 `docs/design/catalog/npcs-08-luding.md`～`npcs-14-xueshan.md`、`docs/design/18-npc-and-companions.md` §13.7、`tools/agents/reports/DES-npcs-register-b.md` §3 / §6",
     "- **姜小铁**（`npc_jiangxiaotie`）按 DES-npcs-register-b 默认暂缓（幼童保护与年龄形象待定）：只写提示词，`status: hold`，不出图。\n- 雅丽仙、杨伯冲、袁银姑、商剑鸣、李自成（ch14）等「只作前史 / 史笺」的人物照常出 `_base` 立绘（画其生前 / 前史时点的样子），名录里的「不生成主体年代活体」指剧情，不影响立绘。\n- 跨书锚点：风际中、毛东珠、何铁手、王维扬、骆冰、李自成有他书已入库的图或主记录，见名单标注；用已入库图作第一张身份参考。\n- 工具箱从 `…/gem/codex_w14/`（上一波 B 批，ingest8 已改为只追加、禁止覆盖）复制到你的目录。")):
    roster_file = f"tools/agents/rosters/ART-cast-fill-{suf}.txt"
    lines = [l.split() for l in (STAGE / roster_file).read_text(encoding='utf-8').splitlines() if l.strip() and not l.startswith('#')]
    writes, sparse = [], []
    for ch in chs:
        for g in ("male", "female"):
            writes.append(f"assets/default/character/{g}/{ch}/**")
        writes.append(f"assets/default/prompts/characters/{DIR[ch]}/**")
    for ch, g, npc, *rest in lines:
        if not rest:
            sparse.append(f"assets/default/character/{g}/{ch}/por_{npc}__*.png")
    if suf == "c":
        writes.append("assets/default/character/other/ch03/**")
    wl = "、".join(f"`{w}`" for w in writes)
    task(id=f"ART-cast-fill-{suf}", title=f"新登记人物立绘 {suf.upper()}（{title}）· DES-npcs-register 新增、还没有立绘的人物按名单补提示词与立绘（AR-47；codex gpt-6-astra xhigh）",
         prompt="ART-cast-fill-reg.md", deps=[], web=True, writes=writes,
         vars={"books_title": title, "count": count, "source": source, "roster": ROST[suf], "extra_note": extra, "roster_file": roster_file,
               "worker_no": wno, "slots": "3", "writes_list": wl,
               "char_checks": f"- `python3 tools/agents/check_roster_portraits.py {roster_file}`"},
         validate={"exists": [roster_file], "cmd": [[PY, "tools/agents/check_roster_portraits.py", roster_file], IDS]},
         agent_args=roots(GEM, REF, "/private/tmp"), sparse_include=sparse)
task(id="TOOL-city-generic", title="城图工具 · 小城 / 遗址推定格局生成器（make_generic_city.py）+ 年代套件接入总装 + JPEG 预览（AR-47 全量城图前置；traex GPT-5.6-Sol max）",
     prompt="TOOL-city-generic.md", deps=[], web=False, writes=["tools/town/**", "docs/design/town/schema.yaml"],
     validate={"exists": ["tools/town/make_generic_city.py"], "shrink_exempt": ["tools/town/**", "docs/design/town/schema.yaml"], "cmd": [
         [PY, "-m", "unittest", "discover", "-s", "tools/town", "-p", "test_*.py"],
         [PY, "tools/town/make_generic_city.py", "--all", "--importance", "secondary,site", "--check"],
         [PY, "tools/town/check_town.py", "docs/design/town/city_hami__ch10.yaml", "assets/default/town/city_hami__ch10/layout.yaml", "--strict-assets"],
         [PY, "tools/town/check_town.py", "docs/design/town/city_xian__ch10.yaml", "assets/default/town/city_xian__ch10/layout.yaml", "--strict-assets"], IDS]},
     agent_args=roots("/private/tmp"),
     sparse_include=["assets/default/town/*/layout.yaml", "assets/default/baseline/town/*.layout.yaml",
                     "assets/default/tile/ming_north/manifest.yaml", "assets/default/tile/ming_north/*.png",
                     "assets/default/building-map/ming_north/manifest.yaml", "assets/default/building-map/ming_north/*.png"])
# 城图批
plan = json.load(open(PLAN / 'city_tasks.json', encoding='utf-8'))
(STAGE / 'docs/design/town/progress').mkdir(parents=True, exist_ok=True)
for c in plan:
    tid = c['id']
    exp = f"docs/design/town/progress/{tid}.expect.csv"
    shutil.copy2(PLAN / 'expect' / f'{tid}.expect.csv', STAGE / exp)
    prog, done = f"docs/design/town/progress/{tid}.csv", f"docs/design/town/progress/{tid}.done.txt"
    study = c['kind_'] == 'study'
    task(id=tid, title=c['title'], prompt="CITY-layouts-batch.md", deps=["TOOL-city-generic"], web=study, writes=c['writes'],
         vars={"batch_title": c['title'].split(' · ', 1)[1].split('（AR-47')[0], "expect": exp, "progress": prog, "done": done},
         validate={"exists": [exp, prog], "cmd": [[PY, "tools/agents/check_city_batch.py", exp, prog], IDS]},
         agent_args=roots("/private/tmp"), sparse_include=c['sparse'])
json.dump(T, open(STAGE.parent / 'tasks_new.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(T), 'tasks;', [t['id'] for t in T][:9], '…')
