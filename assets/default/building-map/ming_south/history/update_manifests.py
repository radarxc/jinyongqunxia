#!/usr/bin/env python3
"""Refresh both ming_south manifests from the selected historical rerenders."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

import yaml
from PIL import Image

from generate_hist import REFS, SPECS

ROOT = Path(__file__).resolve().parents[5]
TMP = Path("/private/tmp/KIT-ming_south-hist-refs")
HISTORY = ROOT / "assets/default/building-map/ming_south/history"
CHOICES = {
    "bld_kit_ming_south_stable": 2,
    "tex_town_ming_south_city_gate__k4_r000_v01": 2,
    "tex_town_ming_south_city_gate__k6_r000_v01": 2,
}
REF_DETAILS = {
    "domestic_wu": "明末吴氏接待厅：开间比例、硬山灰瓦、木构直棂门窗与石基",
    "village": "明代江南村寺画卷：低缓灰瓦屋面、粉墙聚落尺度与前后层次",
    "courtyard": "明式院落实物：合院围墙、天井铺地、硬山与青砖墙脚",
    "market1": "《南都繁会图》局部：临街铺屋、木板铺面、棚布与器具",
    "market2": "《南都繁会图》局部：街屋层高、连续檐口、河埠与市井尺度",
    "temple1": "苏州玄妙观实物：殿堂柱网、灰瓦歇山、台基与克制脊饰",
    "temple2": "苏州玄妙观构件近景：短出跳斗拱、檐下梁枋与彩画尺度",
    "pagoda1": "南京报恩寺塔历史图像：八角逐层收分、各层出檐与塔刹",
    "pagoda2": "南京报恩寺塔历史图像：塔身比例、券龛、外廊及琉璃色带",
    "gate1": "南京中华门遗存：青灰城砖、花岗岩墙脚、券洞与城台体量",
    "gate2": "南京中华门遗存：砖砌法、灰缝旧化、门台比例与低女墙",
    "bridge1": "朱家角放生桥实物：花岗石分节拱券、缓拱桥面与素栏",
    "bridge2": "朱家角放生桥实物：桥台石作、踏步磨损与运河尺度",
    "willow1": "苏州平江路实景：垂柳灰褐裂纹树干与细长下垂枝幕",
    "willow2": "1759年西湖图：湖岸垂柳的疏透轮廓与地域意象",
    "bamboo1": "明代夏昶墨竹：分节细竿、交替叶簇与疏密节奏",
    "bamboo2": "扬州竹园实物：根部聚生、竿叶比例与内部通透空隙",
}
HISTORICAL_NOTES = {
    "bld_kit_ming_south_house_small": "三开间低举折硬山；灰板瓦筒瓦、素脊；无斗拱；栗褐柱架、粉墙青砖脚、石基、板门与直方格窗",
    "bld_kit_ming_south_house_large": "五开间两层木构；灰瓦硬山与略高封火墙；露檩端、无正式斗拱；粉墙青砖脚、板门直棂窗与素木栏",
    "bld_kit_ming_south_courtyard": "正房两厢围石铺天井；硬山灰瓦与克制封火墙；粉墙青砖脚、直棂门、花岗石门槛与素墙门",
    "bld_kit_ming_south_shop_1f": "明代市街三开间窄铺；硬山灰瓦素脊；无斗拱出椽；可卸板铺面、直棂窗、低石槛与素布棚",
    "bld_kit_ming_south_shop_2f": "两层窄面阔铺屋；硬山灰瓦和粉白封火墙；下层板铺、上层直棂窗与素木栏；无灯会装饰",
    "bld_kit_ming_south_inn": "两层临街客舍与低后翼围小院；灰瓦、白封火墙、栗褐柱、直棂客窗；只留空白吊牌",
    "bld_kit_ming_south_restaurant": "五开间两层茶酒肆；下层敞厅、上层廊；低硬山灰瓦、白封火墙、素栏直棂与浅色素布棚",
    "bld_kit_ming_south_market_stall": "四根榫卯木竹柱、略垂靛青布棚、板案、竹篮与陶罐；无砌筑地台，结构空隙透明",
    "bld_kit_ming_south_yamen": "门院厅轴序；五开间正厅与低侧房；花岗石低台、灰瓦歇山、两层短出跳斗拱、直棂与克制土红梁枋",
    "bld_kit_ming_south_biaoju": "匿名护运货院；粉墙青砖脚、铁钉宽木车门、三开间接待厅、货棚与石铺地；低硬山灰瓦、无城垛",
    "bld_kit_ming_south_casino": "普通商住外观；三开间深铺屋、闭合直棂窗和厚板门；硬山灰瓦、白封火墙、石槛；不绘赌博符号",
    "bld_kit_ming_south_manor": "两进石铺院、轴线门与照壁、五开间厅及低侧翼；灰瓦白封火墙、栗褐柱网、直棂门与薄石台",
    "bld_kit_ming_south_wangfu": "五开间正式殿与深前院；灰瓦歇山、克制鸱吻和三枚小脊兽；两层短出跳斗拱、朱褐柱、花岗石台与低饱和彩画",
    "bld_kit_ming_south_temple_hall": "五开间殿堂、花岗石低台；低举折灰板瓦筒瓦歇山；素脊、克制鸱吻小兽；两层短出跳斗拱和低饱和彩画",
    "bld_kit_ming_south_pagoda": "八角九层游戏概化；逐层收分、浅斗拱、灰瓦木廊、券龛、克制琉璃色带与九环铁刹；非具名塔精确复原",
    "bld_kit_ming_south_guardhouse": "三开间守舍；青灰砖下墙、粉白上墙；低硬山灰瓦素脊、无斗拱；厚板门、窄直棂窗和花岗石脚",
    "bld_kit_ming_south_stable": "五开间低敞棚；硬山灰瓦与栗褐重柱；三开放马栏、半高板隔、石槽和系马横木；土坯后墙与粗石前场",
    "bld_kit_ming_south_warehouse": "宽低硬山灰瓦、最小出檐；厚青灰砖墙与石防潮脚；铁条厚双板门和高位方形通风孔；无斗拱",
    "bld_kit_ming_south_wharf": "青灰砖驳岸、花岗石压顶与一端磨损宽踏步；错缝砌法、排水孔、两枚素系船石和麻绳；不带水景",
    "tex_town_ming_south_city_gate__k4_r000_v01": "青灰烧结城砖台与花岗石脚；浅圆券放射券砖、修补灰缝、低女墙、低缓灰瓦门楼和短浅承托；门洞真透明",
    "tex_town_ming_south_city_gate__k6_r000_v01": "宽体青灰城砖台与花岗石脚；宽浅圆券放射券砖、修补灰缝、低女墙和完整低缓灰瓦门楼；门洞真透明",
    "tex_town_ming_south_wall__brick_r000_v01": "青灰烧结城砖细横皮错缝、细石灰缝和克制窑色差；粗花岗石底皮、平砖压顶；无屋顶与垛口",
    "tex_town_ming_south_wall_corner__outer_ne_v01": "三格L形同高等厚墙臂；连续平顶、转角咬砌、细灰缝与花岗石底皮；缺失第四格真透明",
    "tex_town_ming_south_bridge__stone_w5_l10_r000_v01": "暖灰花岗石低缓单孔拱；放射券石和粗石拱腹；磨损缓拱桥面、方柱素栏；拱孔真透明",
    "tex_town_ming_south_tree_cluster__willow_v01": "灰褐裂纹分叉树干、疏透不对称树冠、细长下垂枝幕与披针叶；内部木枝可见，根部无土岛",
    "tex_town_ming_south_tree_cluster__bamboo_v01": "6至9根可见节的细绿竿根部聚生；披针叶分离交替成簇、内部通透、略倾不对称；无石组花盆",
}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def ref_items(spec):
    items = []
    for key in spec["refs"]:
        filename, url = REFS[key]
        ref_path = TMP / "refs" / filename
        items.append({
            "url": url, "accessed": "2026-10-01",
            "sha256": sha(ref_path), "used_detail": REF_DETAILS[key],
            "role": "historical_form_material_reference_actual_image_input",
        })
    return items


def refresh(base, entry):
    asset_id = entry["id"]
    for stale in ("source_copy", "metadata", "style_reference_chain", "historical_research"):
        entry.pop(stale, None)
    record = json.loads((HISTORY / "records" / f"{asset_id}.json").read_text())
    final_path = base / entry["file"]
    source_path = HISTORY / "selected-sources" / f"{asset_id}.png"
    spec = SPECS[asset_id]
    entry["prompt"] = record["prompt"]
    entry["negative"] = "无人、文字、水印、现代物件、背景地台、假棋盘、清式繁饰；门桥孔洞真透明。"
    entry["references"] = ref_items(spec)
    entry["references"].insert(0, {
        "file": f"assets/default/building-map/ming_south/history/guides/{asset_id}.png",
        "sha256": record["guide_sha256"],
        "used_detail": "旧版同ID成品，仅控制相机、朝向、画布与逻辑占地，不提供年代造型",
        "role": "geometry_camera_guide_actual_image_input",
    })
    entry["tool"] = "codex exec · built-in image_gen"
    entry["model"] = "image_gen (underlying image model undisclosed)"
    entry["effort"] = "ultra (codex orchestration; image backend undisclosed)"
    entry["created"] = datetime.fromtimestamp(source_path.stat().st_mtime, timezone.utc).isoformat()
    entry["source_path"] = f"assets/default/building-map/ming_south/history/selected-sources/{asset_id}.png"
    entry["source_sha256"] = record["selected_source_sha256"]
    entry["size"] = f"{Image.open(final_path).width}x{Image.open(final_path).height}"
    entry["sha256"] = sha(final_path)
    entry["status"] = "candidate"
    entry["candidate_count"] = record["candidate_count"]
    entry["selected_candidate"] = record["selected_candidate"]
    entry["source_record"] = f"assets/default/building-map/ming_south/history/records/{asset_id}.json"
    entry["processing"] = {
        "method": "alpha>=2 bbox, uniform LANCZOS resize, transparent padding",
        "scale": round(record["normalization"]["uniform_scale"], 8),
        "paste_offset": record["normalization"]["paste_offset"],
        "excluded": "no warp, anisotropic scale, repaint, flip, or alpha threshold rewrite",
    }
    entry["notes"] = (f"2026-10-01按历史图片重出；历史细节：{HISTORICAL_NOTES[asset_id]}。"
                      "逐图目检通过主体完整、真RGBA及禁项；保留原ID/type/footprint/anchor。"
                      "仅单视图candidate，换图后未做整城总装、格孔碰撞或墙段接缝实测。")
    if "projection_contract" in entry:
        entry["projection_contract"]["geometry_verified"] = False
        entry["projection_contract"]["geometry_release_ready"] = False
        entry["projection_contract"]["verification_note"] = "历史重出后未继承旧图几何验证；待总装复测。"
    return entry


def main():
    for kind in ("building-map", "tile"):
        base = ROOT / "assets/default" / kind / "ming_south"
        manifest = base / "manifest.yaml"
        entries = yaml.safe_load(manifest.read_text())
        entries = [refresh(base, entry) for entry in entries]
        manifest.write_text(yaml.safe_dump(entries, allow_unicode=True, sort_keys=False, width=140))
        print(manifest, len(entries))


if __name__ == "__main__":
    main()
