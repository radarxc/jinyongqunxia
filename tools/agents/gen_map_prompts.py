#!/usr/bin/env python3
"""生成地图类出图任务的提示词文件：assets/default/prompts/maps/

    python3 tools/agents/gen_map_prompts.py

- `region/<rg_id>.md`：design/19 的 30 个区域各一张水墨局部图（类比作者已审的大理苍洱局部图），
  地理内容从 docs/design/map/{regions,cities,sects,routes}.yaml 读出，套 assets/default/prompts/map.md §4 的模板；
- `jianghu_world_ink_base.md`：全国导航图的水墨衬纸（可选，需作者确认）——与 design/19 的 Albers 投影 SVG 对位。
只做数据填模板，不改地图数据。
"""
import json
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets/default/prompts/maps"
MAP = ROOT / "docs/design/map"
IMPORTANCE = {"capital": "都城", "major": "大城", "secondary": "小城", "site": "遗址 / 野外"}
REF_STYLE = ("assets/default/baseline/map/ref_map_jianghu__ch01_base01.png", "画风参考（作者已审）：水墨层次、纸本质感、留白与地图符号语言")
REF_LOCAL = ("assets/default/baseline/map/ref_map_dali__ch01_base01.png", "局部图构图参考（作者已审）：近俯视山水、地标适度夸张、北上、横向 3:2")
NEG = ("不要文字、汉字、字母、数字、伪字、书法、题跋、印文、签名或装饰水印；不要现代城市天际线、公路、铁路、汽车、电线、现代桥梁、景区设施、卫星底图、经纬网、现代国界省界；"
       "不要跨时代城楼宫殿、日式鸟居、欧美城堡或奇幻铠甲；不要摄影写实、3D 塑料材质、赛博朋克、霓虹、动漫大眼人物；不要人物、商旅、演员面孔；不要把地图翻转或颠倒东西南北。")


def load(name):
    p = MAP / name
    txt = p.read_text(encoding="utf-8")
    try:
        return json.loads(txt)
    except json.JSONDecodeError:
        return yaml.safe_load(txt)


def points_of(obj):
    """递归找出所有 [lon, lat] 数对。"""
    pts = []
    if isinstance(obj, (list, tuple)):
        if len(obj) == 2 and all(isinstance(v, (int, float)) for v in obj):
            return [tuple(obj)]
        for v in obj:
            pts += points_of(v)
    elif isinstance(obj, dict):
        for k, v in obj.items():
            if k in ("bounds", "center", "extent"):
                continue
            pts += points_of(v)
    return pts


def inside(pt, b):
    return b[0] <= pt[0] <= b[2] and b[1] <= pt[1] <= b[3]


def names_in(features, bounds):
    out = []
    for f in features or []:
        if not isinstance(f, dict):
            continue
        name = f.get("name") or f.get("id") or ""
        pts = points_of(f)
        if name and pts and any(inside(p, bounds) for p in pts):
            out.append(str(name))
    return out[:8]


def era_names(city):
    names = []
    for ch, e in sorted((city.get("eras") or {}).items()):
        n = (e or {}).get("name")
        if n and n not in names:
            names.append(n)
    return names[:3]


def write_region(rg, cities, sects, routes, regions_doc):
    rid, name, b = rg["id"], rg["name"], rg["bounds"]
    cs = sorted([c for c in cities if c.get("region") == rid], key=lambda c: ({"capital": 0, "major": 1, "secondary": 2, "site": 3}.get(c.get("importance"), 9), c["id"]))
    ss = [s for s in sects if s.get("region") == rid]
    rs = [r for r in routes if rid in (r.get("regions") or [])]
    mountains = names_in(regions_doc.get("mountains"), b)
    rivers = names_in(regions_doc.get("rivers"), b)
    neighbors = {r["id"]: r["name"] for r in regions_doc["regions"]}
    city_lines = [f"{c.get('modern_name', c['id'])}（{IMPORTANCE.get(c.get('importance'), c.get('importance'))}；历代名：{' / '.join(era_names(c)) or '待考'}；约 {c.get('longitude')}E {c.get('latitude')}N）" for c in cs]
    sect_lines = [f"{s.get('name')}（{s.get('site_name') or '—'}）" for s in ss]
    route_lines = [f"{r.get('name')}（{r.get('kind')}）" for r in rs][:8]
    # 相对位置：按经纬度把城市分到九宫格，便于提示词写“西北角 / 东南”
    def sector(lon, lat):
        x = "西" if lon < b[0] + (b[2] - b[0]) / 3 else "东" if lon > b[2] - (b[2] - b[0]) / 3 else "中"
        y = "南" if lat < b[1] + (b[3] - b[1]) / 3 else "北" if lat > b[3] - (b[3] - b[1]) / 3 else ""
        if y and x != "中":
            return x + y  # 东北 / 西南 这样的中文顺序
        if y:
            return y + "部"
        return "中部" if x == "中" else x + "部"
    rel = "；".join(f"{c.get('modern_name', c['id'])}在{sector(float(c['longitude']), float(c['latitude']))}" for c in cs[:8]) or "按 regions.yaml 的 bounds 与 cities.yaml 坐标"
    landmarks = "、".join(sect_lines[:6] + mountains[:4] + rivers[:4]) or "以山水为主，不虚构具名地标"
    prompt = "\n".join([
        "为《金庸群侠传·天书录》默认风格包制作一幅古风水墨地图。",
        f"题材：{name}区域局部图（{rid}），覆盖经度 {b[0]}–{b[2]}E、纬度 {b[1]}–{b[3]}N。书界：跨书界共用的地理底图，不写任何一代的城名。年代：山川地貌为主，建筑只用克制的城垣、缓坡瓦顶、木构屋舍、素朴佛塔等识别轮廓，不复刻明清城楼或现代景区。",
        f"参考图：{REF_STYLE[0]}（画风）、{REF_LOCAL[0]}（局部图构图）；只继承已审定参考的水墨层次、纸本质感、留白和地图符号语言，不沿用其地名与方位。",
        f"地理依据：docs/design/map/regions.yaml（{rid}）、cities.yaml、sects.yaml、routes.yaml。必须保持的相对位置与方向：{rel}。",
        f"主要地标：{landmarks}。相邻区域（画面边缘延伸方向）：{'、'.join(neighbors.get(n, n) for n in rg.get('neighbors', []))}。",
        "构图：北上南下、西左东右，近俯视山水地图，横向 3:2，目标 1536×1024；主要城市用细小墨笔的城垣 / 屋舍符号标位，门派驻地用素朴殿宇或山门符号，重点地标清楚而不铺满画面。",
        "山脉用浓淡墨和干笔皴擦，河流与湖面以留白和淡墨线表现，道路用细虚墨线。温暖纸白、细微宣纸纤维，柔和均匀纸面光，疏朗云雾；纸纹不盖住河道、城墙或佛塔。",
        "在水面、云雾、平缓地带保留疏朗空隙供运行时叠加标签，纸白合计目标至少 35%。地图默认无人物，不生成任何文字、题字、印文或方位字。",
        "此图为山水地图美术示意，不作精确历史疆域图或建筑复原图；山峰和地标可为识别适度夸张，但不水平翻转、不为了构图倒置东西关系。",
        f"排除项：{NEG}",
    ])
    fm = {
        "asset_id": f"map_region_{rid[3:]}__base", "kind": "map", "map_kind": "region", "name": f"{name}区域局部图", "region_id": rid,
        "bounds_wgs84": b, "center": rg.get("center"), "neighbors": rg.get("neighbors", []),
        "output": f"assets/default/map/regions/{rid}.png", "manifest": "assets/default/map/regions/manifest.yaml",
        "overlay": "docs/design/map/jianghu-base.svg（城市 / 门派 / 路线标签由代码叠加，图上不画字）",
        "size": "1536x1024", "orientation": "北上南下、西左东右", "background": "不透明暖纸白",
        "references": [{"path": REF_STYLE[0], "use": REF_STYLE[1]}, {"path": REF_LOCAL[0], "use": REF_LOCAL[1]}],
        "data_sources": ["docs/design/map/regions.yaml", "docs/design/map/cities.yaml", "docs/design/map/sects.yaml", "docs/design/map/routes.yaml", "docs/design/19-world-map.md"],
        "status": "ready",
    }
    body = [
        "---", yaml.safe_dump(fm, allow_unicode=True, sort_keys=False, width=1000).rstrip(), "---", "",
        f"# {name} · 区域局部图（`{rid}`）", "",
        "## 区域要点", "", "| 项 | 内容 |", "|---|---|",
        f"| 范围（WGS84） | 经 {b[0]}–{b[2]}E，纬 {b[1]}–{b[3]}N；中心 {rg.get('center')} |",
        f"| 城市（{len(cs)}） | " + ("；".join(city_lines) if city_lines else "无登记城市") + " |",
        f"| 门派 / 据点（{len(ss)}） | " + ("；".join(sect_lines) if sect_lines else "无") + " |",
        f"| 山系（regions.yaml 落在范围内） | {'、'.join(mountains) or '—'} |",
        f"| 水系 | {'、'.join(rivers) or '—'} |",
        f"| 路线（{len(rs)}） | " + ("；".join(route_lines) if route_lines else "无") + " |",
        f"| 相邻区域 | {'、'.join(neighbors.get(n, n) for n in rg.get('neighbors', []))} |",
        "| 相对位置 | " + rel + " |", "",
        "## 提示词", "", "```text", prompt, "```", "",
        "## 排除项", "", NEG, "",
        "## 质检要点", "",
        "- 方位：北上南下、西左东右；城市与门派的相对位置与上表一致，不得镜像或为构图挪位。",
        "- 画面无任何文字、方位字、印文；标签由代码按 design/19 叠加。",
        "- 留白：水面 / 云雾 / 平地纸白合计 ≥ 35%，地标不铺满画面。",
        "- 风格对基线：浓淡墨皴擦山脉、留白水面、暖纸白纤维、疏朗云雾；非摄影、非 3D、非卫星图。",
        "- 建筑符号为克制的古代轮廓，不出现现代设施与跨时代城楼。", "",
    ]
    (OUT / "region").mkdir(parents=True, exist_ok=True)
    (OUT / "region" / f"{rid}.md").write_text("\n".join(body), encoding="utf-8")


def write_world_base():
    fm = {
        "asset_id": "map_jianghu_world__ink_base", "kind": "map", "map_kind": "world_ink_base", "name": "江湖万里图 · 水墨衬纸（全国底图）",
        "output": "assets/default/map/jianghu_world/ink_base.png", "manifest": "assets/default/map/jianghu_world/manifest.yaml",
        "size": "4096x3072", "orientation": "北上；与 docs/design/map/jianghu-base.svg 的 Albers 投影逐像素对位",
        "background": "不透明暖纸白", "status": "optional",
        "references": [{"path": REF_STYLE[0], "use": REF_STYLE[1]}, {"path": "docs/design/map/jianghu-base.svg", "use": "构图锁定：海岸线、岛屿、河流、山脉位置以它的 base-geography / rivers / mountains 层为准，先用 tools/map/render_map.py --render 栅格化成图作为图片输入"}],
        "data_sources": ["docs/design/19-world-map.md §2、§8.1", "docs/tech/06 D19（map/jianghu_world/base）"],
        "note": "可选项：design/19 的全国导航图是代码生成的 SVG，已可用；本任务只是给它换一张手绘水墨衬纸。是否需要由作者定。",
    }
    prompt = "\n".join([
        "为《金庸群侠传·天书录》默认风格包制作全国江湖导航图的水墨衬纸：73°E–135°E、18°N–54°N 的中国及周边，Albers 等积圆锥投影，4:3，目标 4096×3072。",
        "以附带的 SVG 栅格化图为唯一构图锁定：海岸线、岛屿、主要河流与山脉的位置、走向、画幅占位必须与它逐像素对位，不得挪动、简化或镜像；只把它的几何轮廓重新演绎为水墨质感。",
        "参考图：assets/default/baseline/map/ref_map_jianghu__ch01_base01.png，只继承水墨层次、纸本质感与留白语言。",
        "山脉用浓淡墨和干笔皴擦，河流与湖海以留白和淡墨线表现；温暖纸白、细微宣纸纤维、柔和均匀纸面光、疏朗云雾；不画城市、门派、道路、题签与任何文字（这些由代码按时代图层叠加）。",
        "陆地只用海岸轮廓，不画现代国界、省界、经纬网。整体明度偏亮、对比克制，保证上层叠加的朱印、城池符号与文字可读。",
        f"排除项：{NEG}",
    ])
    body = ["---", yaml.safe_dump(fm, allow_unicode=True, sort_keys=False, width=1000).rstrip(), "---", "",
            "# 江湖万里图 · 水墨衬纸（全国底图，可选）", "",
            "## 要点", "", "- 全国导航图本身是 `tools/map/render_map.py` 从 design/19 数据生成的 SVG（14 个时代图层），已能用；本任务只提供一张与其对位的水墨衬纸，替换 SVG 里程序化的 paper / fibers + base-geography 外观。",
            "- 先 `python3 tools/map/render_map.py --render --out /tmp/map` 得到 `jianghu-base.svg`，栅格化为 4096×3072 PNG 作为图片输入（构图锁定）。",
            "- 不画任何文字、城市、路线；陆地只用海岸轮廓。", "",
            "## 提示词", "", "```text", prompt, "```", "",
            "## 排除项", "", NEG, "",
            "## 质检要点", "", "- 与 SVG 栅格图叠加对比：海岸线与主要河流偏差 ≤ 8 px（4096 宽）。", "- 无文字、无城市符号、无现代边界。", "- 明度与对比克制，叠加文字后可读。", ""]
    (OUT / "jianghu_world_ink_base.md").write_text("\n".join(body), encoding="utf-8")


def main():
    regions_doc = load("regions.yaml")
    cities = load("cities.yaml")["cities"]
    sects = load("sects.yaml")
    sects = sects.get("sects", sects) if isinstance(sects, dict) else sects
    routes = load("routes.yaml")
    routes = routes.get("routes", routes) if isinstance(routes, dict) else routes
    for rg in regions_doc["regions"]:
        write_region(rg, cities, sects, routes, regions_doc)
    write_world_base()
    print(f"已生成 {len(regions_doc['regions'])} 份区域局部图提示词 + 1 份全国水墨衬纸（可选）→ {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
