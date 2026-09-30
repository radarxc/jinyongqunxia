#!/usr/bin/env python3
"""批量生产任务登记（作者 2026-09-30：分别做所有城市（城市×年代）、所有天 / 地级武功招式；玄级统一模板；验收 GPT 做，不要太复杂）。

    python3 tools/agents/prod_plan.py list  [--group kits|cities|skills] [--band B] [--tier 天|地]
    python3 tools/agents/prod_plan.py register --group kits|cities|skills [--band B] [--tier 天|地] [--kit K] [--limit N]

读 docs/design/map/cities.yaml（城市 × 年代带）与武学图鉴（品阶、招式），按模板登记到 tools/agents/tasks.json：
- KIT-<kit_id>：建筑套件（prompts/KIT.md）
- CITY-<city>__<band>：城镇复原 + 总装（prompts/CITY.md），同年代带的多个章节一个任务
- VFX-<skill_id>：单门武学全部招式特效（prompts/VFX-skill.md）
脚本幂等：已登记的任务不重复登记。ROOT 取脚本所在仓库（在集成分支工作区里运行就登记到那里）。
"""
import argparse
import json
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
TASKS = ROOT / "tools/agents/tasks.json"
CITIES = ROOT / "docs/design/map/cities.yaml"

BAND_DESC = {
    "northern_song": "北宋 · 辽 · 西夏 · 大理（约 1093）",
    "southern_song_jin_mongol": "南宋 · 金 · 蒙古（约 1217–1259）",
    "yuan": "元末（约 1360）",
    "ming": "明（约 1523–1644）",
    "qing_early": "清初（约 1685–1725）",
    "qing_middle": "清中期（约 1740–1780）",
}
BAND_YEAR = {"northern_song": 1093, "southern_song_jin_mongol": 1217, "yuan": 1360, "ming": 1523,
             "qing_early": 1685, "qing_middle": 1755}

# 建筑套件：kit_id -> (名称, 年代 / 地域描述, 参考城市, 适用年代带, 适用地区前缀)
KITS = {
    "song_dali": ("宋 · 大理国套件（基线，已有）", "北宋同期大理国，白族与宋式交融，佛教元素多", "大理", ["northern_song", "southern_song_jin_mongol"], ["rg_dali_cangshan", "rg_yundian_qianzhong"]),
    "song_southern": ("宋 · 江南套件（基线，已有）", "南宋江南，河桥密、商住混合", "临安", ["northern_song", "southern_song_jin_mongol"], ["rg_jiangnan_taihu", "rg_zhedong", "rg_jianghuai", "rg_fujian", "rg_jingxiang", "rg_huxiang", "rg_bashu", "rg_lingnan", "rg_jiangxi", "rg_guangxi", "rg_qinba", "rg_donghai_islands", "rg_nanhai_islands", "rg_taiwan"]),
    "song_north": ("宋 · 北方中原套件", "北宋中原大城：东京开封、西京洛阳；开放街巷、瓦子、汴河；北方院落、砖瓦城门", "开封、洛阳、大名", ["northern_song"], ["rg_zhongyuan", "rg_guanzhong", "rg_hedong_jinzhong", "rg_qilu", "rg_hexilongyou", "rg_xixia_helan", "rg_qinba"]),
    "liao_jin_north": ("辽 · 金北方套件", "辽南京 / 金中都、辽上京、大同：契丹女真与汉式并存，土城砖门、佛塔", "燕京、大同、上京", ["northern_song", "southern_song_jin_mongol"], ["rg_yanjing_zhili", "rg_liaodong", "rg_liaoxi", "rg_dongbei", "rg_hedong_jinzhong"]),
    "yuan_north": ("元 · 北方套件", "元大都 / 路城：正交干道、规整坊块、宫城皇城层级、驿路马市", "大都、大同、开封", ["yuan"], ["rg_yanjing_zhili", "rg_zhongyuan", "rg_guanzhong", "rg_hedong_jinzhong", "rg_qilu", "rg_liaodong", "rg_liaoxi", "rg_dongbei", "rg_hexilongyou", "rg_xixia_helan"]),
    "yuan_south": ("元 · 江南套件", "元末江南：沿用宋河网街巷，替换官署（路府）、宗教与防务", "杭州路、集庆路、平江路", ["yuan"], ["rg_jiangnan_taihu", "rg_zhedong", "rg_jianghuai", "rg_fujian", "rg_jingxiang", "rg_huxiang", "rg_bashu", "rg_lingnan", "rg_jiangxi", "rg_guangxi", "rg_qinba", "rg_donghai_islands", "rg_nanhai_islands", "rg_taiwan"]),
    "ming_north": ("明 · 北方套件", "明代北方府城：规整城垣、瓮城、官署轴线、会馆当铺、硬山灰瓦院落", "北京、大同、西安", ["ming"], ["rg_yanjing_zhili", "rg_zhongyuan", "rg_guanzhong", "rg_hedong_jinzhong", "rg_qilu", "rg_liaodong", "rg_liaoxi", "rg_dongbei", "rg_hexilongyou", "rg_xixia_helan"]),
    "ming_south": ("明 · 江南套件", "明代江南：河桥密、粉墙黛瓦、商帮会馆、镖局当铺", "南京、苏州、杭州", ["ming"], ["rg_jiangnan_taihu", "rg_zhedong", "rg_jianghuai", "rg_fujian", "rg_jingxiang", "rg_huxiang", "rg_bashu", "rg_lingnan", "rg_jiangxi", "rg_guangxi", "rg_qinba", "rg_donghai_islands", "rg_nanhai_islands", "rg_taiwan"]),
    "qing_north": ("清 · 北方套件", "清初至清中北方：旗民分城、胡同院落、衙署驻防、灰砖城门", "北京、盛京、济南", ["qing_early", "qing_middle"], ["rg_yanjing_zhili", "rg_zhongyuan", "rg_guanzhong", "rg_hedong_jinzhong", "rg_qilu", "rg_liaodong", "rg_liaoxi", "rg_dongbei", "rg_hexilongyou", "rg_xixia_helan"]),
    "qing_south": ("清 · 江南套件", "清初至清中江南：继承明街巷河网，屋面墙体门窗彩画换清式", "杭州、扬州、苏州、福州", ["qing_early", "qing_middle"], ["rg_jiangnan_taihu", "rg_zhedong", "rg_jianghuai", "rg_fujian", "rg_jingxiang", "rg_huxiang", "rg_bashu", "rg_lingnan", "rg_jiangxi", "rg_guangxi", "rg_qinba", "rg_donghai_islands", "rg_nanhai_islands", "rg_taiwan"]),
    "xiyu": ("西域套件", "西域回部城镇：土坯平顶、清真寺穹顶与邦克楼、巴扎、葡萄架，各年代通用", "喀什、和田、叶尔羌", ["northern_song", "southern_song_jin_mongol", "yuan", "ming", "qing_early", "qing_middle"], ["rg_xiyu_nanjiang", "rg_xiyu_beijiang"]),
    "tubo": ("吐蕃 · 藏地套件", "藏地城镇：石砌碉房、平顶、寺院金顶、经幡、玛尼堆，各年代通用", "拉萨、日喀则、昌都", ["northern_song", "southern_song_jin_mongol", "yuan", "ming", "qing_early", "qing_middle"], ["rg_qingzang"]),
    "mongol": ("蒙古 · 草原套件", "草原营地与和林：毡帐群、木栅、汉式殿宇残留", "和林、上都", ["southern_song_jin_mongol", "yuan", "ming", "qing_early", "qing_middle"], ["rg_mobei", "rg_monan"]),
}


def load_tasks():
    return json.loads(TASKS.read_text(encoding="utf-8"))


def save_tasks(d):
    TASKS.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def kit_for(region: str, band: str) -> str:
    """按地区与年代带选套件；找不到就退回宋江南（并由任务报告写明）。"""
    for kit, (_, _, _, bands, regions) in KITS.items():
        if band in bands and any(region.startswith(r) for r in regions):
            return kit
    return "song_southern"


def city_units(band=None):
    d = yaml.safe_load(CITIES.read_text(encoding="utf-8"))
    band_of = {ch: v["band"] for ch, v in d["chapters"].items()}
    units = {}
    for c in d["cities"]:
        for ch, e in (c.get("eras") or {}).items():
            if not e.get("open"):
                continue
            b = band_of[ch]
            if band and b != band:
                continue
            u = units.setdefault((c["id"], b), {"city": c, "chapters": [], "names": {}})
            u["chapters"].append(ch)
            u["names"][ch] = e.get("name")
    return units


def register_kits(d, only=None):
    have = {t["id"] for t in d["tasks"]}
    n = 0
    for kit, (name, desc, refs, bands, _) in KITS.items():
        if kit in ("song_dali", "song_southern"):
            continue
        if only and kit != only:
            continue
        tid = f"KIT-{kit}"
        if tid in have:
            continue
        d["tasks"].append({
            "id": tid, "title": f"建筑套件 · {name}", "phase": "PROD", "wave": 10, "kind": "draft", "prompt": "KIT.md",
            "deps": ["TOWN-assemble"], "review": False, "web": True,
            "writes": [f"assets/default/building-map/{kit}/**", f"assets/default/tile/{kit}/**",
                       "assets/default/prompts/building-map.md", "assets/default/prompts/tile.md"],
            "vars": {"kit_id": kit, "kit_name": name, "era_desc": desc, "ref_cities": refs},
            "validate": {"exists": [f"assets/default/building-map/{kit}/manifest.yaml", f"assets/default/tile/{kit}/manifest.yaml"],
                         "cmd": [["{python}", "tools/agents/check_assets.py", f"assets/default/building-map/{kit}", "--min", "18", "--max", "22", "--min-side", "256"],
                                 ["{python}", "tools/agents/check_assets.py", f"assets/default/tile/{kit}", "--min", "5", "--max", "10", "--min-side", "32"],
                                 ["{python}", "tools/lint/check_ids.py", "--strict"]]}})
        n += 1
    return n


def register_cities(d, band=None, kit=None, limit=None, importance=("capital", "major")):
    have = {t["id"] for t in d["tasks"]}
    kits_ready = {"song_dali", "song_southern"} | {t["id"][4:] for t in d["tasks"] if t["id"].startswith("KIT-")}
    n = 0
    for (cid, b), u in sorted(city_units(band).items(), key=lambda kv: ({"capital": 0, "major": 1, "secondary": 2, "site": 3}[kv[1]["city"].get("importance", "major")], kv[0])):
        c = u["city"]
        if c.get("importance") not in importance:
            continue
        k = kit_for(c.get("region", ""), b)
        if kit and k != kit:
            continue
        if k not in kits_ready:
            continue
        tid = f"CITY-{cid[5:]}__{b}"
        if tid in have:
            continue
        chs = sorted(u["chapters"])
        primary = chs[0]
        display = u["names"].get(primary) or c.get("modern_name")
        story = "、".join(f"`docs/design/chapters/{ch[2:]}-*.md`" for ch in chs)
        d["tasks"].append({
            "id": tid, "title": f"城镇 · {display}（{c['modern_name']} · {BAND_DESC[b]} · {'/'.join(chs)}）", "phase": "PROD", "wave": 10,
            "kind": "draft", "prompt": "CITY.md", "deps": ["TOWN-assemble"] + ([f"KIT-{k}"] if k not in ("song_dali", "song_southern") else []),
            "review": False, "web": True,
            "writes": [f"docs/design/town/city_{cid}__*.yaml", f"docs/design/town/history/{cid}__{b}*", f"assets/default/town/{cid}__*/**"],
            "vars": {"city_id": cid, "display_name": display, "band": b, "band_desc": BAND_DESC[b], "year": str(BAND_YEAR[b]),
                     "chapters": "/".join(chs), "ch_primary": primary, "ch_others": "、".join(chs[1:]) or "（无）",
                     "kit_id": k, "story_refs": story},
            "validate": {"exists": [f"docs/design/town/history/{cid}__{b}.md", f"docs/design/town/history/{cid}__{b}_plan.png"]
                                   + [f"assets/default/town/{cid}__{ch}/{f}" for ch in chs for f in ("town.png", "preview.png", "layout.yaml", "manifest.yaml")],
                         "cmd": sum(([["{python}", "tools/town/gen_layout.py", f"docs/design/town/city_{cid}__{ch}.yaml", "-o", f"/tmp/tianshu_{cid}_{ch}.yaml"],
                                      ["{python}", "tools/town/check_town.py", f"docs/design/town/city_{cid}__{ch}.yaml", f"assets/default/town/{cid}__{ch}/layout.yaml", "--strict-assets"],
                                      ["{python}", "tools/agents/check_assets.py", f"assets/default/town/{cid}__{ch}", "--min", "1", "--max", "1", "--min-side", "512"]]
                                     for ch in chs), []) + [["{python}", "tools/lint/check_ids.py", "--strict"]]}})
        n += 1
        if limit and n >= limit:
            break
    return n


TIER = lambda g: "天" if g >= 10 else "地" if g >= 7 else "玄" if g >= 4 else "黄"
EMITTER = {"palm": "palm", "finger": "finger", "fist-grapple": "fist", "leg": "leg", "movement": "palm", "inner": "palm", "None": "palm", "weapon": "sword"}


def skill_units():
    """从图鉴导出每门武学：品阶、性质、发出方式、招式（绝招 / 外放标记）。"""
    p = subprocess.run([sys.executable, "tools/lint/check_skill_catalogs.py", "--json", "--delivery", "--details"], cwd=ROOT,
                       capture_output=True, text=True)
    routes = json.loads(p.stdout)["delivery"]["routes"]
    skills = {}
    for r in routes:
        m = re.search(r"（(\d+) (天|地|玄|黄)", r["action_context"])
        s = skills.setdefault(r["skill_id"], {"grade": int(m.group(1)) if m else 0, "catalog": r["source"], "nature": r["nature"],
                                               "delivery": set(), "moves": {}})
        s["delivery"].add(str(r["delivery"]))
        s["moves"][r["move_id"]] = {"ultimate": True, "projection": bool(r["projection"])}
        m2 = re.search(r"`(sk_[a-z0-9_]+)` ([^\s（]+)（", r["action_context"])
        if m2 and "name" not in s:
            s["name"] = m2.group(2)
    # 普通招：图鉴里前缀属于该武学、非绝招的 mv_
    for f in sorted((ROOT / "docs/design/catalog").glob("skills-*.md")):
        txt = f.read_text(encoding="utf-8")
        for mv in set(re.findall(r"`(mv_[a-z0-9_]+)`", txt)):
            rest = mv[3:]
            cand = [k for k in skills if rest.startswith(k[3:] + "_")]
            if cand:
                k = max(cand, key=len)
                skills[k]["moves"].setdefault(mv, {"ultimate": False, "projection": False})
    return skills


def register_skills(d, tier=None, limit=None):
    have = {t["id"] for t in d["tasks"]}
    n = 0
    for sid, s in sorted(skill_units().items(), key=lambda kv: (-kv[1]["grade"], kv[0])):
        t = TIER(s["grade"])
        if t not in ("天", "地") or (tier and t != tier):
            continue
        tid = f"VFX-{sid}"
        if tid in have:
            continue
        moves = "、".join(f"`{mv}`{'*' if v['ultimate'] else ''}{'P' if v['projection'] else ''}" for mv, v in sorted(s["moves"].items()))
        deliv = sorted(s["delivery"] - {"None"}) or ["inner"]
        emitter = next((EMITTER[x] for x in ("palm", "finger", "fist-grapple", "leg", "weapon") if x in s["delivery"]), "palm")
        d["tasks"].append({
            "id": tid, "title": f"招式特效 · {t}级 {s.get('name', sid)}（{sid}，{len(s['moves'])} 招）", "phase": "PROD", "wave": 10,
            "kind": "draft", "prompt": "VFX-skill.md", "deps": ["VFX-emitters", "VFX-templates"], "review": False, "web": False,
            "writes": [f"assets/default/vfx/{sid}/**"],
            "vars": {"skill_id": sid, "skill_name": s.get("name", sid), "tier": t, "grade": str(s["grade"]), "nature": s["nature"],
                     "delivery": "/".join(deliv), "catalog": f"docs/design/catalog/{s['catalog']}", "moves": moves, "emitter": emitter},
            "validate": {"exists": [f"assets/default/vfx/{sid}/manifest.yaml"],
                         "cmd": [["{python}", "tools/vfx/check_skill_suite.py", f"assets/default/vfx/{sid}", "--catalog", f"docs/design/catalog/{s['catalog']}"],
                                 ["{python}", "tools/agents/check_assets.py", f"assets/default/vfx/{sid}", "--min", "1", "--max", "60", "--min-side", "256"],
                                 ["{python}", "tools/lint/check_ids.py", "--strict"]]}})
        n += 1
        if limit and n >= limit:
            break
    return n


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["list", "register"])
    ap.add_argument("--group", choices=["kits", "cities", "skills"])
    ap.add_argument("--band")
    ap.add_argument("--tier")
    ap.add_argument("--kit")
    ap.add_argument("--limit", type=int)
    a = ap.parse_args()
    if a.cmd == "list":
        if a.group in (None, "kits"):
            for k, v in KITS.items():
                print(f"KIT-{k:16s} {v[0]}")
        if a.group in (None, "cities"):
            by = defaultdict(int)
            for (cid, b), u in city_units(a.band).items():
                by[(b, kit_for(u["city"].get("region", ""), b), u["city"].get("importance"))] += 1
            for k, v in sorted(by.items()):
                print("CITY", k, v)
        if a.group in (None, "skills"):
            sk = skill_units()
            by = defaultdict(lambda: [0, 0])
            for s in sk.values():
                by[TIER(s["grade"])][0] += 1
                by[TIER(s["grade"])][1] += len(s["moves"])
            for t, (ns, nm) in by.items():
                print(f"SKILL tier={t} skills={ns} moves={nm}")
        return 0
    d = load_tasks()
    n = {"kits": lambda: register_kits(d, a.kit), "cities": lambda: register_cities(d, a.band, a.kit, a.limit),
         "skills": lambda: register_skills(d, a.tier, a.limit)}[a.group]()
    save_tasks(d)
    print(f"已登记 {n} 个任务到 {TASKS}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
