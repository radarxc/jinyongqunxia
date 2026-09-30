"""生成素材基线审批页（claude.ai artifact）。

用法：python3 tools/review/build.py  → 输出到 .agents/coord/review/{index.html,baseline-review.html,img/,vfx/,files.json}
然后用 Artifact 工具重新发布 baseline-review.html（地址登记在 tools/agents/HANDOFF.md §9.3；旧页 NhZGycmwB5Qd… 已读不到），
files 传 files.json 里的图片路径（root=.agents/coord/review）。作者的审批结论用 ArtifactData list 读集合 `reviews`，
再用 tools/agents/apply_reviews.py 写回 manifest。WT_OVERRIDE 指向未合入的任务工作区，让作者先看图再合入。
"""
import hashlib, json, shutil, sys
from pathlib import Path
import yaml
from PIL import Image

REPO = Path("/Users/bytedance/Projects/jinyongqunxia")
HERE = Path(__file__).resolve().parent
OUT = REPO / ".agents" / "coord" / "review"   # 生成物不入库（.agents/ 在 .gitignore 里）
OUT.mkdir(parents=True, exist_ok=True)
BASE = REPO / "assets/default/baseline"
# 还没合入、要先给作者看的类别：从任务工作区读图（作者说"先给我看图再合入"）
WT_OVERRIDE = {"male": REPO / ".agents/wt/ART-R2-male/assets/default/baseline/character/male",
               # "town": 第 8 次运行未结束，图还会变，先显示占位
               "vfx": REPO / ".agents/wt/ART-R2-vfx/assets/default/baseline/vfx",
               "female": REPO / ".agents/wt/ART-R1-female/assets/default/baseline/character/female"}
WT_BADGE = {"male": "GPT 审核已过 · 未合入，你看过再合", "town": "45 度新图 · GPT 审核进行中 · 未合入", "vfx": "GPT 审核已过 · 未合入，你看过再合", "female": "GPT 审核已过 · 未合入，你看过再合"}

# 演示暂不内嵌的素材（旧的 Canvas 手绘演示作者已否定；图层动画 ART-R3-vfx 返修中，修好后去掉这里的条目并把 WT_OVERRIDE["vfx"] 指向它的工作区）
DEMO_HOLD = {
    "ref_mv_xianglong18_kanglong__ch02_base01": "演示：按你“这个特效看起来太蠢了，跟渲染的图完全不一样”的意见，旧的代码手绘演示已作废；改用这张图拆图层做的动画还在返修（过程帧有切边），修好后本页更新。两段式新管线（效果帧 + 发出方图，程序合成）的样例另行出图。本卡先只审这张图。",
    "ref_sk_liumai__ch01_base01": "演示：图层动画版已做好，和降龙的演示一起更新到本页。两段式新管线的样例另行出图。本卡先只审这张图。",
}

CATS = [  # (cat key, label, manifest dir relative to baseline)
    ("map", "地图", "map"),
    ("town", "城镇", "town"),
    ("building", "建筑·立绘式", "building"),
    ("building-map", "建筑·地图拼接", "building-map"),
    ("male", "人物·男", "character/male"),
    ("female", "人物·女", "character/female"),
    ("vfx", "招式", "vfx"),
    ("item", "物品", "item"),
    ("meridian", "经脉图", "meridian"),
]

# Supervisor summary + questions for the author, per asset id.
NOTES = {
    "ref_map_jianghu__ch01_base01": ("监督已复核通过。地名不画进图里，另有透明标注层，可在卡片上切换显示。",
        ["墨色浓淡、留白、笔触密度是否合适？", "城池用小墨笔地标概括，是否可以接受？",
         "总览图与大理局部图的笔触密度不完全一样（局部的苍山墨更浓），是否可以接受？"]),
    "ref_map_dali__ch01_base01": ("监督已复核通过。地名另有透明标注层，可切换显示；无量山在画幅外，只标方向。",
        ["苍山洱海的构图与三塔、城池的识别方式是否可以接受？"]),
    "ref_sect_shaolin__ch01_base01": ("立绘式建筑。监督评价：北宋少林山门与大殿，宋式斗拱、鸱吻、悬鱼等细节到位；石灯略像日式石灯笼，整体略偏唐辽风。",
        ["写实程度、构图（秋日上午侧光、画面无人）是否可以接受？", "殿序、开间、石灯幢属原创扩展，是否接受？"]),
    "ref_city_beijing__ch08_jiaolou_base01": ("立绘式建筑。第 2 版（第 1 版城墙没有雉堞，已淘汰）。清初紫禁城角楼，宋清差别（斗拱、屋脊、瓦色、彩画）清楚。",
        ["护城河与城墙之间的地带被简化掉了，是否可以接受？", "城墙墙面颜色（红 / 灰）资料说法不一，按现图是否可以？"]),
    "ref_npc_xiaofeng__ch01_base01": ("第 2 版（第 1 版像 45 岁、眯眼山羊胡、衣服像日本浪人，已淘汰）。魁梧方脸、浓眉、短胡茬，灰色旧布袍只在下摆轻度磨损，江湖人裹巾，右衽，空手。",
        ["男性写实程度与暖灰纸底是否采用？", "年龄观感约 30–35 岁、眼睛不算大、腰带偏宽，是否可以？",
         "是否像某位影视演员？（监督只做了目检）"]),
    "ref_npc_linghuchong__ch05_base01": ("第 2 版（第 1 版剑鞘只有剑身 1/3、衣服破成布条、没有明代特征，已淘汰）。明代网巾、灰蓝直身 / 道袍式长衣，剑在鞘中、鞘长容得下整剑。",
        ["剑偏长（约身高 3/4，明剑常见 0.9–1 米），是否可以？", "站姿偏端正，“洒脱”主要靠表情，是否可以？",
         "是否像某位影视演员？（监督只做了目检）"]),
    "ref_mer_renmai_dumai__base01": ("第 2 版（第 1 版任督配色反了，已改为任脉青、督脉赤，合设定“阴青阳赤”）。正反两面，任脉标 6 穴、督脉标 7 穴，骨盆用布遮住；穴名在标注层里。",
        ["作为经脉类的风格母版是否可以？", "只标了主要可见穴位，精确点位还需懂针灸的人逐点审（待考），先这样可以吗？"]),
    "ref_mer_shoujueyin__base01": ("第 2 版（第 1 版前臂三穴不按寸数，已修正为内关 2 寸、间使约 2.8 寸、郄门 5 寸）。劳宫用红心标出阳掌“气过阴门”的出口（原创扩展）。代价是线描比初版软。",
        ["线条比初版软，要不要重出一张更锐利的？", "劳宫用红心标出掌法出口，是否可以？", "图中没画乳头，天池、膻中缺体表参照，是否可以？"]),
    "ref_npc_wangyuyan__ch01_base01": ("监督已复核通过。宋代服饰语汇的原创造型，不是考古复原。",
        ["女性“偏美丽”的程度是否合适？", "与小龙女的面部、发式、身形较接近，辨识度是否够？"]),
    "ref_npc_xiaolongnv__ch03_base01": ("监督已复核通过。白衣清冷，同色领层和裙裾处理较写意。",
        ["女性“偏美丽”的程度是否合适？", "与王语嫣的辨识度是否够？"]),
    "ref_mv_xianglong18_kanglong__ch02_base01": ("第 2 版（第 1 版手只有四指，已淘汰）。墨龙虚实相生，劲从掌心喷出，五指齐全；掌面偏正，没做出 45° 侧前角度。",
        ["龙首是否偏实，墨色浓淡是否合适？", "手用写实淡彩画法可以吗，还是手也要改成纯水墨？"]),
    "ref_sk_liumai__ch01_base01": ("监督已复核通过。六道剑气可数，纸白核心 + 淡墨断边表现“无形”；手指偏细长。另附可运行的水墨动画。",
        ["剑气是否够轻、够“无形”？", "左右手与指别难以判定，这种模糊可以接受吗？", "动画效果（打开演示看）是否是你要的方向？"]),
    "ref_eq_yitianjian__ch04_base01": ("监督已复核通过。细墨线 + 薄罩染；剑首、护手为原创造型。",
        ["剑身近刃处的波浪纹观感接近日本刀刃文，要不要改成直线夹钢纹？（默认保留）",
         "最窄处留边只有 7.7%（模板要求 10%），要不要重出一张主体更小的？"]),
    "ref_it_miji_jiuyin_shang__ch02_base01": ("返修版：画风改为与剑图一致的细墨线薄罩染，软纸书衣、细订线、无投影、四边留白 ≥10%。旧版偏照片写实，已淘汰。",
        ["两张物品图的画风统一程度是否可以？（若你更喜欢写实版，旧图还在，可回选）",
         "线装书到明中叶后才流行，宋元多为蝴蝶装 / 包背装。按武侠惯例保留线装，还是另出一张合乎史实的？"]),
}

R1 = {  # 按作者第 1 轮意见返修过的素材：新说明覆盖 NOTES
    "ref_npc_xiaofeng__ch01_base01": ("第 2 轮：按你“头发太凌乱，整齐一些”的意见，在上一版上把碎发收进束发、裹巾包住顶髻；英雄气与体格保持上一版。上一版说明：昂然远望、坚毅眉眼、方颌短络腮胡，挺胸开肩，肩更宽、胸更厚。“港版造型”只取朴素裹巾、灰布袍、深色布外褂与沉着气质，重新设计，不仿剧中造型与演员。",
        ["英雄气和魁梧程度到位了吗？", "灰袍略带暖褐、腰带多圈稍宽、裹巾上方露出少量发髻，可以吗？"]),
    "ref_npc_linghuchong__ch05_base01": ("按你的意见返修：发带、腰带、衣袂同向扬起；重心偏一侧、松肩侧身、似笑非笑，带酒器与入鞘直剑。游戏画像只取洒脱气质，衣装与面容原创。",
        ["飘逸和浪子味道到位了吗？偏俊秀，和写实的平衡可以吗？", "网巾弱化了；酒器画成短颈皮酒囊而不是葫芦，可以吗？"]),
    "ref_eq_yitianjian__ch04_base01": ("按你的意见返修：镂空卷云护手、四瓣如意剑首、银灰装具配浅金回纹、墨青细缠柄，冷青灰剑身配银白刃线，去掉了日本刀式刃文；画风与九阴真经图统一。",
        ["名剑的辨识度和华贵感够了吗？", "和九阴真经图放在一起算同一套画风吗？"]),
    "ref_mv_xianglong18_kanglong__ch02_base01": ("按你的意见返修：金色为主，气从掌根、鱼际、指根整片透出（不再从掌心一点喷出），巨龙回卷前冲；新增可运行动画。",
        ["金色力度和龙首的具象程度合适吗？", "龙角尖贴近画面顶边，可以吗？", "点“播放”看动画。"]),
    "ref_sk_liumai__ch01_base01": ("按你的两条意见返修：改成六枚离指凝缩的半透明气刃（锐缘、折射、震荡环），全画面不用水墨。刃体近无色，刃缘按经脉阴阳着淡青 / 淡赤——原著没写颜色，这是按设定“阴青阳赤”定的原创配色。动画按“凝聚 → 成刃飞出 → 消散”。",
        ["气刃的样子对吗？透明度合适吗？", "配色（近无色刃体 + 青 / 赤刃缘）可以吗，还是要别的颜色？", "点“播放”看动画。"]),
}
NOTES.update(R1)

NOTES.update({
    "ref_town_dali__ch01_base01": ("按你的要求改为 45 度可行走城市区块：大理国都羊苴咩城，城墙、城门、塔、水渠与石桥，街道和广场能走，建筑与水面挡路。人物极少。",
        ["45 度视角和“主角能在上面走”的感觉对吗？", "大理（白族与宋式交融）的地域特征看得出来吗？"]),
    "ref_town_linan__ch02_base01": ("按你的要求改为 45 度可行走城市区块：南宋临安御街，砖铺大街、沿街店铺、河道与拱桥。人物极少。",
        ["45 度视角和可行走的感觉对吗？", "南宋临安的年代感看得出来吗？和大理的差别够吗？"]),
})

NOTES.update({  # 第 2 / 3 轮
    "ref_sk_liumai__ch01_base01": ("第 2 轮：按你“不是气刃，应该是……线性的，持续的”的意见，改成从指端凝聚点连续射出的细长气线，动画为“凝聚 → 持续激射约 2.8 秒 → 收束”；全画面不用水墨。配色为近无色主体加淡青 / 淡赤刃缘（原著没写颜色，按设定“阴青阳赤”定的原创配色）。",
        ["线性、持续的感觉对吗？请点“播放”看动画。", "配色（近无色 + 青 / 赤刃缘）可以吗？"]),
    "ref_npc_xiaolongnv__ch03_base01": ("第 3 轮：按你“加白手套、佩剑、铃铛（书中经典形象）”的意见，在已通过的原图上只加三样：素白五指薄手套；左腰入鞘中式直剑（淑女剑）；手中白绸两端各一枚小金铃（金铃索）。脸、发式、白衣、构图、光照不变。",
        ["三样东西的大小、位置和画风协调吗？", "腰侧系带上端被袖子挡住、屈指部分被遮挡，可以吗？"]),
})

PENDING = {  # category -> (subjects, reason) while the supervisor has it in rework
    "town": (["大理国都（天龙，约 1093）", "南宋临安（射雕，约 1220s）"],
             "按你的决定改为程序化生成（城市规格 → 生成布局 → 贴片渲染底图 → 按坐标贴建筑）：设计文档在做第 3 轮审核，贴片与建筑单体正在出图，渲染工具随后开工。两张城镇图组装出来后放在这里。"),
    "building-map": (["大理国都沿街建筑，如客栈或茶肆（天龙，约 1093）", "南宋临安沿街建筑，如茶坊或药铺（射雕，约 1220s）"],
             "出图中（宋套件）：要拼到城市地图上的 45 度单体建筑，透明底、按占地格数出图，视角与光源对齐城镇图；大理带佛教元素与本地植物，临安要有繁华商铺感。GPT 审核通过后放在这里。"),
    "male": (["萧峰（天龙）", "令狐冲（笑傲，明代）"],
             "监督复核未通过：令狐冲剑鞘过短、衣服撕裂过重、缺明代网巾与直身；萧峰年龄偏老、面相不符原著。正在重出。"),
    "meridian": (["任督二脉（正反面）", "手厥阴心包经"],
                 "监督复核未通过：任督配色与设定相反（应为阴青阳赤）；心包经前臂三穴位置不按寸数。正在修图。"),
}

def load_manifest(p):
    d = yaml.safe_load(p.read_text(encoding="utf-8"))
    return d["assets"] if isinstance(d, dict) else d

def main_shas():
    """每个素材在主分支上的 sha256：工作区里与主分支相同的条目就是已合入的，不标"未合入"。"""
    out = {}
    for mf in BASE.rglob("manifest.yaml"):
        for a in load_manifest(mf):
            out[a["id"]] = a.get("sha256")
    return out


MAIN_SHA = {}


def main():
    MAIN_SHA.update(main_shas())
    img_dir = OUT / "img"
    if img_dir.exists():
        shutil.rmtree(img_dir)
    img_dir.mkdir()
    files = {}
    items = []
    for cat, label, rel in CATS:
        mdir = WT_OVERRIDE.get(cat) if WT_OVERRIDE.get(cat, Path("/nonexistent")).is_dir() else BASE / rel
        mf = mdir / "manifest.yaml"
        if not mf.exists():
            subj, reason = PENDING[cat]
            for i, s in enumerate(subj):
                items.append({"id": f"pending-{cat}-{i+1}", "cat": cat, "catLabel": label,
                              "state": "rework", "subject": s, "review": reason})
            continue
        for a in load_manifest(mf):
            src = mdir / a["file"]
            raw = src.read_bytes()
            sha = hashlib.sha256(raw).hexdigest()
            if sha != a["sha256"]:
                sys.exit(f"sha mismatch {a['id']}")
            im = Image.open(src).convert("RGB")
            im.thumbnail((1400, 1400), Image.LANCZOS)
            out = img_dir / f"{a['id']}.jpg"
            im.save(out, "JPEG", quality=84, optimize=True, progressive=True)
            files[f"img/{a['id']}.jpg"] = str(out)
            note, ask = NOTES.get(a["id"], ("", []))
            it = {"id": a["id"], "cat": cat, "catLabel": label, "state": "ready",
                  "sha": sha[:16], "subject": a.get("subject", ""), "prompt": a.get("prompt", ""),
                  "negative": a.get("negative", ""), "size": a.get("size", ""),
                  "preview": f"img/{a['id']}.jpg", "review": note, "ask": ask,
                  "badge": ("已通过（仓库里已是 approved）" if a.get("status") == "approved"
                            else WT_BADGE[cat] if cat in WT_OVERRIDE and mdir != BASE / rel and sha != MAIN_SHA.get(a["id"])
                            else "GPT 审核已过" if a["id"] in R1 else "监督已复核")}
            lab = mdir / f"{a['id']}.labels.svg"
            if lab.exists():
                dst = img_dir / lab.name
                shutil.copyfile(lab, dst)
                files[f"img/{lab.name}"] = str(dst)
                it["labels"] = f"img/{lab.name}"
            if a["id"] in DEMO_HOLD:
                it["review"] = (it["review"].replace("；新增可运行动画", "") + " " if it["review"] else "") + DEMO_HOLD[a["id"]]
                it["ask"] = [q for q in it["ask"] if "播放" not in q and "动画" not in q]
            elif a.get("code"):
                code = mdir / a["code"]
                dst = OUT / "vfx" / f"{a['id']}.html"
                dst.parent.mkdir(exist_ok=True)
                shutil.copyfile(code, dst)
                files[f"vfx/{a['id']}.html"] = str(dst)
                it["demoHtml"] = code.read_text(encoding="utf-8")
            items.append(it)
    data = json.dumps(items, ensure_ascii=False).replace("</", "<\\/").replace("<!--", "<\\u0021--")
    tpl = (HERE / "page.tpl.html").read_text(encoding="utf-8")
    (OUT / "index.html").write_text(tpl.replace("__DATA__", data), encoding="utf-8")
    shutil.copyfile(OUT / "index.html", OUT / "baseline-review.html")
    (OUT / "files.json").write_text(json.dumps(files, indent=1), encoding="utf-8")
    ready = sum(1 for i in items if i["state"] == "ready")
    print(f"items={len(items)} ready={ready} files={len(files)} html={len((OUT/'index.html').read_bytes())}B")
    tot = sum(Path(p).stat().st_size for p in files.values())
    print(f"supporting files total={tot/1e6:.2f}MB")

main()
