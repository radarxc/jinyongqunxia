"""Apply the audited 2026-10-01 historical-reference rebuild metadata."""
from pathlib import Path
import hashlib, json, re, subprocess, yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TILE = ROOT.parents[1] / "tile/tubo"
REPO = ROOT.parents[3]
REFS = Path("/private/tmp/KIT-tubo-hist-refs")
PROMPTS = Path("/private/tmp/KIT-tubo-extracted-prompts.json")
MAP = json.loads((ROOT / "sources/historical-rebuild-map.json").read_text())

URLS = {
 "commons_british_mission.jpg": "https://commons.wikimedia.org/wiki/File:The_British_Mission_in_Lhasa,_1936.jpg",
 "commons_trimon_house.jpg": "https://commons.wikimedia.org/wiki/File:Trimon%27s_house.jpg",
 "commons_tsarong_house.jpg": "https://commons.wikimedia.org/wiki/File:Tsarong%27s_house_in_Lhasa.jpg",
 "loc_2021670596.jpg": "https://www.loc.gov/item/2021670596/", "loc_2021670602.jpg": "https://www.loc.gov/item/2021670602/",
 "loc_2021670610.jpg": "https://www.loc.gov/item/2021670610/", "loc_2021670617.jpg": "https://www.loc.gov/item/2021670617/",
 "loc_2021670618.jpg": "https://www.loc.gov/item/2021670618/", "loc_2021670619.jpg": "https://www.loc.gov/item/2021670619/",
 "loc_2002698079.jpg": "https://www.loc.gov/item/2002698079/",
 "asianart_2.1.1photo.jpg": "https://www.asianart.com/associations/lhasa_restoration/report98/ch_02.htm",
 "asianart_2.2.2photo.jpg": "https://www.asianart.com/associations/lhasa_restoration/report98/ch_02.htm",
 "asianart_2.3.2photo.jpg": "https://www.asianart.com/associations/lhasa_restoration/report98/ch_02.htm",
 "asianart_5.1.3plan.jpg": "https://www.asianart.com/lhasa_restoration/report98/ch_05.htm",
 "asianart_5.1.4photo.jpg": "https://www.asianart.com/lhasa_restoration/report98/ch_05.htm",
 "rubin_yumbu_castle.jpg": "https://rubinmuseum.org/projecthimalayanart/essays/yumbu-lagang-castle/",
 "rubin_katsel_section_diagram.jpg": "https://rubinmuseum.org/projecthimalayanart/essays/jokhang-temple-lhasa/",
 "rubin_katsel_tower_diagram.jpg": "https://rubinmuseum.org/projecthimalayanart/essays/jokhang-temple-lhasa/",
 "lacma_stupa.jpg": "https://collections.lacma.org/object/61926", "met_stupa_13c.jpg": "https://www.metmuseum.org/art/collection/search/39421",
 "prm_nyamchu_bridge_1928.jpg": "https://web.prm.ox.ac.uk/tibet/photo_BMH.F.79.1.html",
 "prm_iron_bridge_1936.jpg": "https://web.prm.ox.ac.uk/tibet/photo_2001.35.76.1.html",
 "prm_willows_1936.jpg": "https://web.prm.ox.ac.uk/tibet/photo_1998.131.270.html",
 "frontiers_seabuckthorn.webp": "https://doi.org/10.3389/fpls.2022.1051587",
 "flowers_seabuckthorn.jpg": "https://flowersofindia.net/catalog/slides/Tibetan%20Sea%20Buckthorn.html"}
DETAILS = {
 "commons_british_mission.jpg": "院落房翼、平顶石木体量", "commons_trimon_house.jpg": "厚墙、深窗与朴素平顶",
 "commons_tsarong_house.jpg": "两层宅第、密木棂与木廊", "loc_2021670596.jpg": "围墙尺度、收分墙与粗石基脚",
 "loc_2021670602.jpg": "山堡收分石墙与防御体量", "loc_2021670610.jpg": "约1900年泽当低矮土石聚落尺度",
 "loc_2021670617.jpg": "约1900年宫苑门院、乔木尺度与石木层级", "loc_2021670618.jpg": "约1900年 Bar Chorten 覆钵门轮廓",
 "loc_2021670619.jpg": "约1900年玉拓桥石桥台与桥屋关系", "loc_2002698079.jpg": "1939年拉萨街市低层界面与摊棚尺度",
 "asianart_2.1.1photo.jpg": "传统收分墙、毛石砌层与白灰修补", "asianart_2.2.2photo.jpg": "八廓街木构棚架与沿街尺度",
 "asianart_2.3.2photo.jpg": "深窗、石板雨披与木梁椽", "asianart_5.1.3plan.jpg": "门院、内院与房翼轴线",
 "asianart_5.1.4photo.jpg": "木廊、平顶房翼和院墙层级", "rubin_yumbu_castle.jpg": "收分白墙、垂直主楼与厚墙比例",
 "rubin_katsel_section_diagram.jpg": "7世纪主龛剖面、绕行廊与厚墙", "rubin_katsel_tower_diagram.jpg": "Katsel 塔形主龛与木柱梁平顶",
 "lacma_stupa.jpg": "覆钵、方台、叠轮与伞盖层次", "met_stupa_13c.jpg": "西藏13世纪塔的构件顺序",
 "prm_nyamchu_bridge_1928.jpg": "1928年年楚河低跨桥与粗石岸坎", "prm_iron_bridge_1936.jpg": "1936年铁桥作为材料反例，排除现代铁构",
 "prm_willows_1936.jpg": "1936年拉萨河谷柳树干形与疏垂树冠", "frontiers_seabuckthorn.webp": "现代西藏沙棘低矮枝形、狭叶与橙果",
 "flowers_seabuckthorn.jpg": "现代植物图交叉核对密刺短枝和狭叶"}

OBJECT_DETAILS = {
 "bld_kit_tubo_biaoju": "低门围院、单层长翼、木构装卸棚、毛石基脚和平压土顶",
 "bld_kit_tubo_casino": "低矮厚墙、深窗洞、密木棂、短木挑檐与修补白灰",
 "bld_kit_tubo_courtyard": "收分院墙、毛石砌层、门院轴线与平顶房翼",
 "bld_kit_tubo_guardhouse": "山堡式收分石墙、窄深窗、粗石基脚与平顶守舍",
 "bld_kit_tubo_house_large": "两层收分碉房、木廊、密木棂、石板雨披与土顶",
 "bld_kit_tubo_house_small": "单层收分土石墙、深窗、木梁椽、低女墙与平土顶",
 "bld_kit_tubo_inn": "门院、内院、双层房翼、木廊与遮蔽牲口棚",
 "bld_kit_tubo_manor": "围院轴线、收分主楼、木廊、深窗与粗石墙脚",
 "bld_kit_tubo_market_stall": "低层街市尺度、粗木棚架、素色毛织篷与石压脚",
 "bld_kit_tubo_palace_hall": "高耸收分主楼、层叠白墙、深窗列与厚石墙基",
 "bld_kit_tubo_restaurant": "沿街厚墙、深窗、短木挑檐、石板雨披与平土顶",
 "bld_kit_tubo_shop_1f": "单层深门洞、密木棂、短挑檐、修补白灰与毛石基脚",
 "bld_kit_tubo_shop_2f": "两层窄面商铺、外挑木廊、密木棂与平土屋面",
 "bld_kit_tubo_stable": "低矮石木厩房、内院、粗木柱棚、土墙与平顶",
 "bld_kit_tubo_stupa": "方台、覆钵、叠轮与伞盖层次，排除文字和具名复刻",
 "bld_kit_tubo_temple_hall": "梯形厚墙主龛、绕行廊、木柱梁平顶，无后世大面积金铜顶",
 "bld_kit_tubo_warehouse": "低矮厚墙、少窗深洞、粗木门、毛石基脚和平压土顶",
 "bld_kit_tubo_wharf": "年楚河低跨岸坎、粗石码头与短木装卸面，原创同功能概化",
 "bld_kit_tubo_yamen": "围墙门院、轴线内院、收分官署房翼、木廊与平土顶",
 "tex_town_tubo_city_gate__k4_r000_v01": "Bar Chorten覆钵门、收分石台、透明四格通行孔",
 "tex_town_tubo_city_gate__k6_r000_v01": "Bar Chorten覆钵门、收分石台、透明六格通行孔",
 "tex_town_tubo_wall__stone_r000_v01": "一格高墙墩、收分毛石墙、修补白灰与石板压顶",
 "tex_town_tubo_wall_corner__outer_ne_v01": "紧凑L形高墙角、收分毛石墙、修补白灰与石板压顶",
 "tex_town_tubo_bridge_deck__w4_l8_r000_v01": "低跨粗石桥台、木梁桥面；排除铁构，原创同功能概化",
 "tex_town_tubo_tree_cluster__willow_v01": "拉萨河谷柳树干形与疏垂树冠，仅作跨年代地域点景",
 "tex_town_tubo_shrub__seabuckthorn_v01": "西藏沙棘密刺短枝、狭叶与橙果，仅作跨年代地域点景",
}
ANCHOR_OVERRIDES = {
 "tex_town_tubo_city_gate__k4_r000_v01": [295.5, 400.0],
 "tex_town_tubo_city_gate__k6_r000_v01": [389.0, 432.0],
 "tex_town_tubo_wall__stone_r000_v01": [44.0, 111.0],
 "tex_town_tubo_wall_corner__outer_ne_v01": [150.0, 200.0],
 "tex_town_tubo_bridge_deck__w4_l8_r000_v01": [248.5, 257.0],
 "tex_town_tubo_tree_cluster__willow_v01": [225.5, 253.0],
 "tex_town_tubo_shrub__seabuckthorn_v01": [67.0, 80.0],
}

SUBJECT_OVERRIDES = {
 "bld_kit_tubo_temple_hall": "吐蕃初建佛殿：梯形厚墙主龛与绕行廊（原创概化；具体复原待考）",
 "tex_town_tubo_city_gate__k4_r000_v01": "吐蕃·藏地跨年代套件·净宽4格Bar Chorten覆钵门（原创概化；非实测复原）",
 "tex_town_tubo_city_gate__k6_r000_v01": "吐蕃·藏地跨年代套件·净宽6格Bar Chorten覆钵门（原创概化；非实测复原）",
}

def scalar(value):
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    return yaml.safe_dump(value, allow_unicode=True, default_style="'", width=100000).strip()

def plain(value):
    if not isinstance(value, str):
        return scalar(value)
    if value and not value.startswith("-") and "#" not in value and ": " not in value and "\n" not in value:
        return value
    return scalar(value)

def flow(value):
    return yaml.safe_dump(value, allow_unicode=True, default_flow_style=True,
                          sort_keys=False, width=100000).strip()

def block_field(key, value, indent=2):
    pad = " " * indent
    if key == "references":
        lines = [f"{pad}{key}:"]
        lines += [f"{pad}- {flow(item)}" for item in value]
        return "\n".join(lines)
    if key == "anchor_px":
        return f"{pad}{key}: {flow(value)}"
    return f"{pad}{key}: {scalar(value) if key in {'prompt', 'notes'} else plain(value)}"

def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def chosen_prompts():
    rows = json.loads(PROMPTS.read_text())
    chosen = {}
    for row in rows:
        if row["id"] in MAP and row["refs"]:
            chosen[row["id"]] = row
    return chosen

def update(path, base, prompts):
    relative = path.relative_to(REPO).as_posix()
    original = subprocess.run(["git", "show", f"HEAD:{relative}"], cwd=REPO,
                              check=True, capture_output=True, text=True).stdout
    baseline = {entry["id"]: entry for entry in yaml.safe_load(original)}
    starts = list(re.finditer(r"(?m)^- id: (\S+)$", original))
    rendered = []
    for index, match in enumerate(starts):
        ident = match.group(1)
        text = original[match.start():starts[index + 1].start() if index + 1 < len(starts) else len(original)]
        entry = baseline[ident]; row = prompts[ident]; image = base / entry["file"]
        refs = []
        for source in row["refs"]:
            name = Path(source).name
            refs.append({"url": URLS[name], "download_file": name, "download_sha256": sha(REFS/name),
                         "accessed": "2026-10-01", "used": DETAILS[name], "model_input": True})
        archive = base / ("source/historical-rebuild" if ident.startswith("tex_") else "sources/historical-rebuild") / f"{ident}__raw.png"
        candidate_count = 2 if ident in {"tex_town_tubo_wall__stone_r000_v01",
            "tex_town_tubo_wall_corner__outer_ne_v01", "tex_town_tubo_shrub__seabuckthorn_v01"} else 1
        note = "历史图片已实际输入；" + OBJECT_DETAILS[ident] + "。真RGBA、左上光、无文字人物现代物；功能仍按subject所标原创边界。"
        prompt = row["prompt"]
        registered = (entry.get("building") or entry.get("tile") or {}).get("footprint")
        if ident in {"bld_kit_tubo_biaoju", "bld_kit_tubo_courtyard", "bld_kit_tubo_guardhouse"}:
            prompt = re.sub(r"footprint \d+ by \d+", f"footprint {registered[0]} by {registered[1]}", prompt)
        replacements = {
            "subject": SUBJECT_OVERRIDES.get(ident, entry["subject"]), "prompt": prompt,
            "references": refs, "tool": "codex exec · built-in image_generation",
            "model": "gpt-5.6-sol (image backend undisclosed)", "effort": "not exposed",
            "created": "2026-10-01", "source_path": str(archive.relative_to(base)),
            "size": f"{Image.open(image).width}x{Image.open(image).height}", "sha256": sha(image),
            "notes": note, "source_copy": str(archive.relative_to(base)),
            "source_sha256": sha(archive), "candidate_count": candidate_count,
        }
        if ident in ANCHOR_OVERRIDES:
            replacements["anchor_px"] = ANCHOR_OVERRIDES[ident]
        for key, value in replacements.items():
            pattern = rf"(?ms)^  {re.escape(key)}:.*?(?=^  [A-Za-z_][A-Za-z0-9_]*:|\Z)"
            replacement = block_field(key, value) + "\n"
            if re.search(pattern, text):
                text = re.sub(pattern, replacement, text, count=1)
            else:
                text = text.rstrip() + "\n" + replacement
        text = re.sub(r"(?ms)^  historical_references:.*?(?=^  [A-Za-z_][A-Za-z0-9_]*:|\Z)", "", text, count=1)
        rendered.append(text.rstrip() + "\n")
    path.write_text("".join(rendered), encoding="utf-8")

if __name__ == "__main__":
    prompts = chosen_prompts()
    update(ROOT/"manifest.yaml", ROOT, prompts); update(TILE/"manifest.yaml", TILE, prompts)
