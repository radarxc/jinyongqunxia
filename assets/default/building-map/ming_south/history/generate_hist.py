#!/usr/bin/env python3
import json, os, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
TMP = Path("/private/tmp/KIT-ming_south-hist-refs")
CODEX = Path("/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex")
REF = TMP / "refs"

REFS = {
    "domestic_wu": ("domestic_wu.jpg", "https://commons.wikimedia.org/wiki/Special:Redirect/file/The_Wu_Family_Reception_Hall%2C_early_17th_century.jpg?width=1600"),
    "village": ("jiangnan_village_ming.jpg", "https://www.metmuseum.org/art/collection/search/45665"),
    "courtyard": ("domestic_courtyard.jpg", "https://commons.wikimedia.org/wiki/File:Ming_courtyard_(6238830623).jpg"),
    "market1": ("market_nandu_1.jpg", "https://commons.wikimedia.org/wiki/File:%E4%BB%87%E8%8B%B1%E3%80%8A%E5%8D%97%E9%83%BD%E7%B9%81%E4%BC%9A%E5%9B%BE%E3%80%8B%E5%B1%80%E9%83%A8.jpg"),
    "market2": ("market_nandu_2.jpg", "https://commons.wikimedia.org/wiki/File:%E5%8D%97%E9%83%BD%E7%B9%81%E4%BC%9A%E5%9B%BE%E5%B1%80%E9%83%A8%EF%BC%88%E6%98%8E_%E4%BB%87%E8%8B%B1%EF%BC%89.jpg"),
    "temple1": ("temple_xuanmiao_1.jpg", "https://commons.wikimedia.org/wiki/File:Suzhou_Xuanmiao_Guan_2015.04.23_17-53-17.jpg"),
    "temple2": ("temple_xuanmiao_2.jpg", "https://commons.wikimedia.org/wiki/File:Suzhou_Xuanmiao_Guan_2015.04.23_18-02-22.jpg"),
    "pagoda1": ("pagoda_baoensi_1.jpg", "https://commons.wikimedia.org/wiki/File:Porcelain_Tower_of_Nanjing.jpg"),
    "pagoda2": ("pagoda_baoensi_2.jpg", "https://commons.wikimedia.org/wiki/File:Nanking_Erlach.jpg"),
    "gate1": ("gate_zhonghua_1.jpg", "https://commons.wikimedia.org/wiki/File:Nanjing-Zhonghua-Gate-3071.jpg"),
    "gate2": ("gate_zhonghua_2.jpg", "https://commons.wikimedia.org/wiki/File:Nanjing-Zhonghua-Gate-3072.jpg"),
    "bridge1": ("bridge_fangsheng_1.jpg", "https://commons.wikimedia.org/wiki/File:The_Fangsheng_Bridge-1.jpg"),
    "bridge2": ("bridge_fangsheng_2.jpg", "https://commons.wikimedia.org/wiki/File:The_Fangsheng_Bridge-2.jpg"),
    "willow1": ("willow_pingjiang.jpg", "https://commons.wikimedia.org/wiki/File:A_willow_and_a_boat_in_Pingjiang_Road_(6650483501).jpg"),
    "willow2": ("willow_westlake.jpg", "https://commons.wikimedia.org/wiki/File:Hangzhou_-_West_Lake_1759.jpg"),
    "bamboo1": ("bamboo_wind_ming.jpg", "https://www.metmuseum.org/art/collection/search/44590"),
    "bamboo2": ("bamboo_garden_yangzhou.jpg", "https://commons.wikimedia.org/wiki/File:Bamb_Garden_in_Yangzhou.JPG"),
}

def S(subject, detail, refs):
    return {"subject": subject, "detail": detail, "refs": refs}

SPECS = {
    "bld_kit_ming_south_house_small": S("small commoner's house", "three bays; low hard-gable roof with shallow pitch; tight grey pan-and-cover tiles; plain ridge, no beasts; no dougong; chestnut columns, white lime infill over blue-grey brick foot, stone plinth; plank door and straight square lattice windows", ["domestic_wu", "village"]),
    "bld_kit_ming_south_house_large": S("large two-storey residence", "five-bay timber frame; hard gables rising slightly above low grey-tile roof; plain ridge; simple exposed purlin ends, no formal dougong; white lime walls, blue-grey brick foot; plank doors, straight lattice windows and plain timber balcony rail", ["domestic_wu", "village"]),
    "bld_kit_ming_south_courtyard": S("enclosed courtyard residence", "main hall and two lower wings around a stone-paved tianjing; hard-gable grey tile roofs and restrained fire gables; white lime walls with grey-brick foot; straight lattice doors; thin granite thresholds and plain wall gate", ["domestic_wu", "courtyard"]),
    "bld_kit_ming_south_shop_1f": S("single-storey street shop", "narrow three-bay shop from a Ming market street; hard-gable grey tile roof, plain ridge, projecting rafters without dougong; removable plank frontage, straight lattice shutters, low stone sill, one rolled blank cloth awning", ["market1", "market2"]),
    "bld_kit_ming_south_shop_2f": S("two-storey street shop", "narrow timber shop house; grey-tile hard-gable roof and raised white fire gables; open plank shopfront below, straight lattice windows and plain rail above; no lantern festival decoration", ["market1", "market2"]),
    "bld_kit_ming_south_inn": S("courtyard inn", "two-storey street lodging front with shallow continuous eave and low rear wings around a small paved court; grey tiles, white fire gables, chestnut posts, straight lattice guest windows; blank hanging board only", ["market1", "market2"]),
    "bld_kit_ming_south_restaurant": S("two-storey restaurant and teahouse", "five-bay open lower floor and upper gallery; low grey-tile hard-gable roof, white fire gables, plain timber rail and straight lattice screens; shallow blank awnings, no tower or lantern mass", ["market1", "market2"]),
    "bld_kit_ming_south_market_stall": S("market stall", "four mortise-and-tenon timber or bamboo posts; tied slightly sagging muted indigo cloth canopy; plank counter, woven baskets and ceramic jars; no masonry base and transparent gaps", ["market1", "market2"]),
    "bld_kit_ming_south_yamen": S("county yamen compound", "axial gate-court-hall order; five-bay main hall, two low side offices, low granite platform; grey-tile hipped-gable roof with restrained ridge ends; chestnut columns, two shallow bracket steps, straight lattice screens and austere earth-red beam accents", ["domestic_wu", "courtyard"]),
    "bld_kit_ming_south_biaoju": S("anonymous guarded transport yard", "merchant courtyard with high white-grey wall, iron-studded broad timber cart gate, three-bay receiving hall, short cargo shed and stone paving; low hard-gable grey tiles, straight lattice windows, no battlements", ["courtyard", "market1"]),
    "bld_kit_ming_south_casino": S("anonymous gaming house disguised as an ordinary merchant residence", "three-bay deep shop-house with closed square lattice windows and heavy plank doors; hard-gable grey tiles, white fire gables and stone sill; one plain interior wood table visible, no gambling symbols", ["market1", "domestic_wu"]),
    "bld_kit_ming_south_manor": S("wealthy Jiangnan manor", "two linked paved courts, axial gate and screen wall, five-bay reception hall and lower side wings; grey tiles, white fire gables, chestnut column grid, straight lattice doors, thin stone terraces and restrained brick door hood", ["domestic_wu", "courtyard"]),
    "bld_kit_ming_south_wangfu": S("Ming princely residence main-hall module", "deep axial forecourt and five-bay formal hall; grey hipped-gable roof, plain ridge with restrained chiwen and three small ridge beasts; two-layer short-projecting dougong, vermilion-brown columns, straight lattice doors, granite terrace and steps, subdued blue-green-red beam painting", ["temple1", "domestic_wu"]),
    "bld_kit_ming_south_temple_hall": S("Jiangnan temple hall", "five-bay hall on low granite platform; low-pitch grey pan-and-cover tiled hipped-gable roof; plain ridge with restrained chiwen and two small beasts; two-layer short-projecting dougong, red-brown columns, straight lattice doors and subdued red-blue-green beam painting", ["temple1", "temple2"]),
    "bld_kit_ming_south_pagoda": S("Nanjing-inspired Ming brick-and-timber pagoda", "octagonal nine-storey tower with clear gradual taper; pale glazed-brick or lime-faced core, dark grey tiled eaves and timber galleries at each floor; shallow bracket sets, arched niches, restrained colored glazed trim and iron finial with nine rings; no gold fantasy tower", ["pagoda1", "pagoda2"]),
    "bld_kit_ming_south_guardhouse": S("small city-wall guardhouse", "three-bay defensive service house; blue-grey brick lower wall and white lime upper infill; low hard-gable grey-tile roof, plain ridge, no dougong; heavy plank door, narrow straight-lattice windows and granite footing", ["gate1", "domestic_wu"]),
    "bld_kit_ming_south_stable": S("courtyard stable", "five-bay low open-front shed; hard-gable grey tiled roof on heavy unpainted chestnut posts; three open stalls, half-height plank dividers, stone trough and tether rail; earth-brick rear infill and rough granite forecourt", ["market1", "domestic_wu"]),
    "bld_kit_ming_south_warehouse": S("grain and cargo warehouse", "broad low hard-gable grey-tile roof with minimal eaves; thick blue-grey brick walls and stone damp-proof plinth; double heavy plank doors with simple iron straps and small high square ventilation holes; no dougong", ["market1", "gate1"]),
    "bld_kit_ming_south_wharf": S("canal wharf and landing", "low blue-grey brick revetment with large granite coping and worn broad stone steps descending at one end; staggered brick bonding, drainage scuppers, two plain stone mooring posts and coiled hemp rope; no water or scenery", ["market2", "bridge2"]),
    "tex_town_ming_south_city_gate__k4_r000_v01": S("Ming city gate with four-unit clear passage", "massive blue-grey fired-brick gate platform on granite footings; radiating brick voussoirs around one shallow round arch; repaired lime joints, low parapet; complete low grey-tile guard hall above with plain ridge and restrained bracket blocks; true empty tunnel", ["gate1", "gate2"]),
    "tex_town_ming_south_city_gate__k6_r000_v01": S("Ming city gate with six-unit clear passage", "broad blue-grey fired-brick gate platform on granite footings; radiating brick voussoirs around one wide shallow round arch; repaired lime joints, low parapet; complete low grey-tile guard hall above; true empty tunnel", ["gate1", "gate2"]),
    "tex_town_ming_south_wall__brick_r000_v01": S("straight Ming city-wall module", "tall square blue-grey fired-brick pier; thin staggered horizontal courses, lime joints and restrained kiln-color variation; rough granite bottom course and plain flat brick cap; no roof or crenellation", ["gate1", "gate2"]),
    "tex_town_ming_south_wall_corner__outer_ne_v01": S("outer L corner of a Ming city wall", "two equal-height and equal-thickness blue-grey brick arms in a three-voxel L plan; continuous flat cap, interlocking corner bond, thin lime joints, granite bottom course; missing fourth square fully transparent", ["gate1", "gate2"]),
    "tex_town_ming_south_bridge__stone_w5_l10_r000_v01": S("single-span Jiangnan stone footbridge", "low segmental arch in warm-grey granite; radiating voussoirs and rough block soffit; worn stone-paved gently humped deck; plain post-and-panel rails with square posts; arch opening entirely transparent", ["bridge1", "bridge2"]),
    "tex_town_ming_south_tree_cluster__willow_v01": S("mature Jiangnan weeping willow", "forked grey-brown fissured trunk; airy asymmetrical crown with many fine drooping branch curtains and narrow lanceolate leaves; visible inner woody structure and clean root contact, no soil island", ["willow1", "willow2"]),
    "tex_town_ming_south_tree_cluster__bamboo_v01": S("compact Jiangnan bamboo clump", "six to nine slender green culms with visible segmented nodes, gathered cleanly at roots; fine lanceolate leaves in separated alternating sprays, open internal gaps and slightly leaning asymmetric crown; no rocks or planter", ["bamboo1", "bamboo2"]),
}

COMMON = """You are a narrow image-generation tool runner. Call image_gen exactly ONCE, then stop; do not inspect or edit the result. Generate one entirely new anonymous original game sprite. The first attached image is only a geometry, camera and scale guide. The last two historical images control form, construction, proportion and materials; do not copy either composition.

Subject: one isolated Ming dynasty Jiangnan {subject}. Strong historical construction detail: {detail}.

Preserve the guide's logical footprint {w} by {h}, approximate silhouette scale and entrance orientation. Orthographic yaw 45 degrees, elevation 30 degrees, 2:1 dimetric ground axes about +0.5 and -0.5; verticals upright, opposite edges parallel, no perspective convergence. Show the whole subject and a readable thin ground-contact boundary. Soft daylight from screen upper-left and tiny lower-right contact shadow. Match the guide's restrained realistic weathered materials and fine detail density, but replace its period detail with the historical references.

TRUE transparent RGBA background with clean antialiasing and at least 8 percent empty margin on every side; required openings also alpha zero. Exactly one coherent sprite. No people, readable writing, signs, flags, watermark, modern object, landscape, sky, checkerboard, glow, thick floating base, clipping, fantasy architecture, exaggerated roof lift, gold or Qing dragon decoration. Use transparent_background true. Output only the generated image result."""

def load_manifest(path):
    import yaml
    return {x["id"]: x for x in yaml.safe_load(path.read_text())}

def main():
    asset_id = sys.argv[1]
    candidate = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    is_tile = asset_id.startswith("tex_")
    base = ROOT / "assets/default" / ("tile" if is_tile else "building-map") / "ming_south"
    entry = load_manifest(base / "manifest.yaml")[asset_id]
    shape = entry["tile" if is_tile else "building"]
    w, h = shape["footprint"]
    spec = SPECS[asset_id]
    prompt = COMMON.format(subject=spec["subject"], detail=spec["detail"], w=w, h=h)
    if "city_gate" in asset_id:
        k = 4 if "__k4_" in asset_id else 6
        prompt += f" Gate geometry: front division exactly 2:{k}:2 units; central {k}-unit arch and tunnel fully transparent, with no door, floor or dark back wall."
    if "wall_corner" in asset_id:
        prompt += " Corner geometry: exact 2 by 2 plan made of three 1 by 1 wall voxels; arms two units long, one unit thick and three units tall."
    if "tree_cluster" in asset_id:
        prompt += " Tree geometry: retain a clean root contact as anchor and draw no ground tile."
    images = [base / entry["file"]] + [REF / REFS[k][0] for k in spec["refs"]]
    outdir = TMP / "runs" / asset_id / f"c{candidate}"
    outdir.mkdir(parents=True, exist_ok=True)
    (outdir / "prompt.txt").write_text(prompt + "\n")
    template = TMP / "codex-home"
    home = TMP / "codex-homes" / f"{asset_id}-c{candidate}"
    if not home.exists():
        shutil.copytree(template, home, ignore=shutil.ignore_patterns("generated_images", "sessions", "shell_snapshots", "*.sqlite-wal", "*.sqlite-shm"))
    before = set((home / "generated_images").rglob("*.png"))
    cmd = [str(CODEX), "--no-daemon", "exec", "--ephemeral", "-m", "gpt-6-astra",
           "-c", 'model_reasoning_effort="ultra"', "-c", 'approval_policy="never"',
           "-s", "workspace-write", "--skip-git-repo-check", "-C", str(TMP)]
    for image in images:
        cmd += ["-i", str(image)]
    cmd += ["-"]
    env = dict(os.environ, SSL_CERT_FILE="/etc/ssl/cert.pem", CODEX_HOME=str(home))
    with (outdir / "prompt.txt").open() as inp, (outdir / "run.log").open("w") as log:
        result = subprocess.run(cmd, stdin=inp, stdout=log, stderr=subprocess.STDOUT, env=env)
    after = set((home / "generated_images").rglob("*.png"))
    outputs = sorted(after - before, key=lambda p: p.stat().st_mtime)
    record = {"id": asset_id, "candidate": candidate, "returncode": result.returncode,
              "prompt": prompt, "guide": str(images[0]), "refs": spec["refs"],
              "ref_paths": [str(p) for p in images[1:]], "outputs": [str(p) for p in outputs]}
    (outdir / "record.json").write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(record, ensure_ascii=False))
    raise SystemExit(0 if result.returncode == 0 and len(outputs) == 1 else 1)

if __name__ == "__main__":
    main()
