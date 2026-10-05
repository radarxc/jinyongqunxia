"""KIT-tubo group B: preserve source alpha; crop, uniform resize and pad only."""
from pathlib import Path
import hashlib
import json
import shutil
import yaml
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[3]
SUFFIXES = ("yamen", "biaoju", "casino", "manor", "palace_hall", "temple_hall")
BASELINE = REPO / "assets/default/baseline/building-map/bld_kit_song_dali_yamen.png"
def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def compact_write(path, data):
    text = json.dumps(data, ensure_ascii=False, indent=None) + "\n"
    path.write_text(text, encoding="utf-8")
def pxqa(im):
    alpha = im.getchannel("A")
    hist = alpha.histogram()
    box = alpha.getbbox()
    w, h = im.size
    return dict(mode=im.mode, size=list(im.size), alpha_extrema=list(alpha.getextrema()),
                alpha_zero_pixels=hist[0], alpha_partial_pixels=sum(hist[1:255]),
                alpha_near_opaque_pixels=sum(hist[192:]), alpha_opaque_pixels=hist[255],
                alpha_nonzero_bbox=list(box), transparent_margins_px=[box[0],box[1],w-box[2],h-box[3]],
                border_alpha_max=max(alpha.crop((0,0,w,1)).getextrema()[1],alpha.crop((0,h-1,w,h)).getextrema()[1],
                                     alpha.crop((0,0,1,h)).getextrema()[1],alpha.crop((w-1,0,w,h)).getextrema()[1]))
def process(suffix):
    ident = "bld_kit_tubo_" + suffix
    record_path = ROOT / "sources" / (ident + ".json")
    rec = json.loads(record_path.read_text())
    source = Path(rec["source_path"])
    archive = ROOT / "sources" / (ident + ".png")
    shutil.copyfile(source, archive)
    for rejected in rec["rejected"]:
        dest = ROOT / "sources/rejected" / (ident + "_attempt01.png")
        dest.parent.mkdir(exist_ok=True)
        shutil.copyfile(rejected["source_path"], dest)
        rejected["source_archive"] = str(dest.relative_to(ROOT))
        rejected["source_sha256"] = sha(dest)
        rejected["references"] = [dict(id="bld_kit_song_dali_yamen", file=str(BASELINE.relative_to(REPO)),
            sha256=sha(BASELINE), role="宋候选仅作材质和细节密度参考；非藏地形制", status="candidate")]
    for ref in rec["references"]:
        path = REPO / ref["file"] if ref["file"].startswith("assets/") else ROOT / ref["file"]
        ref["sha256"] = sha(path)
        ref.setdefault("status", "candidate")
    im = Image.open(source)
    assert im.mode == "RGBA"
    source_qa = pxqa(im)
    box = im.getchannel("A").getbbox()
    left, front, right = [rec["source_corners_px"][k] for k in ("left","front","right")]
    w, h = rec["w"], rec["h"]
    target = 32 * (w+h)
    scale = target / (right[0]-left[0])
    crop = im.crop(box)
    rs = [round(crop.width*scale), round(crop.height*scale)]
    sx, sy = rs[0]/crop.width, rs[1]/crop.height
    resized = crop.resize(rs, Image.Resampling.LANCZOS)
    canvas = [max(256,rs[0]+64), max(256,rs[1]+64)]
    offset = [(canvas[0]-rs[0])//2,(canvas[1]-rs[1])//2]
    out = Image.new("RGBA", canvas, (0,0,0,0))
    out.paste(resized, offset)
    final = ROOT / (ident+".png")
    out.save(final)
    anchor = [round(((left[0]+right[0])/2-box[0])*sx+offset[0],4),
              round(((left[1]+right[1])/2-box[1])*sy+offset[1],4)]
    slopes = [(front[1]-left[1])/(front[0]-left[0]), (right[1]-front[1])/(right[0]-front[0])]
    ratio = (front[0]-left[0])/(right[0]-front[0])
    ratio_error = abs(ratio/(w/h)-1)
    geometry = dict(source_corners_px=rec["source_corners_px"], source_axis_slopes=slopes,
        axis_tolerance=0.03, axis_pass=max(abs(slopes[0]-.5),abs(slopes[1]+.5))<=.03,
        source_width_depth_ratio=ratio, expected_width_depth_ratio=w/h, ratio_relative_error=ratio_error,
        ratio_tolerance_suggestion=.1, ratio_pass=ratio_error<=.1, measurement_uncertainty_source_px=3,
        precision_note="人工读取可见底面，±3 px；biaoju量墙身接地线，其他量薄基面边。后角由平行边推算；非三维测绘。")
    process = dict(source_archive=str(archive.relative_to(ROOT)), source_sha256=sha(archive), source_size=list(im.size),
        crop_box=list(box), uniform_scale_requested=scale, resized_size=rs, rounded_effective_scale=[sx,sy],
        paste_offset=offset, target_canvas=canvas, final_file=final.name,
        steps=["crop alpha>0 bounding box","uniform LANCZOS resize, nearest-integer dimensions",
               "paste without mask onto transparent RGBA; no repaint, warp, alpha threshold, flip or rotation"])
    building = dict(type=ident,footprint=[w,h],anchor=anchor,era="tubo")
    entrance = dict(edge="S",offset_cells=w/2)
    projection = dict(tile_px=[64,32],ground_bbox_px=[32*(w+h),16*(w+h)],
        ground_width_px=target,light="screen_upper_left",shadow="screen_lower_right_contact_only")
    meta = dict(id=ident,status="candidate",building=building,anchor_px=anchor,footprint_m=[w,h],
        entrance=entrance,entrance_note="S边中点为规划默认，非实际门洞像素；运行时待实测。",
        collision_polygon_m=[[0,0],[w,0],[w,h],[0,h]],collision_note="规划整占地代理，不含阴影；院内行走细化待实测。",
        actual_height_m=None,height_note="未做三维量测；不可把PNG轮廓当作精确高度。",
        occluder_proxy_px=list(out.getchannel("A").getbbox()),occluder_note="alpha非零包围框仅作离线保守代理。",
        views=[dict(rotation_deg=0,yaw_deg=45,pitch_deg=30,file=final.name)],
        png_rotations_available=[0],allowRotation=False,glb=None,projection_contract=projection,
        geometry_qa=geometry,pixel_qa=pxqa(out),processing=process,release_ready=False,
        visual_review=rec["visual_review"],historical_note="原创地域功能组合；非任何具名实物或全年代复原。")
    (ROOT/"meta").mkdir(exist_ok=True)
    meta_text = yaml.safe_dump(meta,allow_unicode=True,sort_keys=False,default_flow_style=None,width=160)
    assert len(meta_text.splitlines()) <= 150
    (ROOT/"meta"/(ident+".yaml")).write_text(meta_text,encoding="utf-8")
    entry = {k:rec[k] for k in ("id","subject","prompt","negative","references","tool","model","effort","created","source_path","status")}
    entry.update(file=final.name,category="building-map",style="default",size=f"{out.width}x{out.height}",sha256=sha(final),
        notes=rec["visual_review"]+" 单45°视图；未通过城市拼接和作者审批。",building=building,
        footprint_m=[w,h],entrance=entrance,projection_contract=projection,meta="meta/"+ident+".yaml")
    rec.update(source_archive=str(archive.relative_to(ROOT)),source_sha256=sha(archive),source_size=list(im.size),
               source_alpha=source_qa,processing=process,geometry_qa=geometry,pixel_qa=pxqa(out),manifest_entry=entry)
    compact_write(record_path,rec)
    gray=Image.new("RGBA",out.size,(120,120,120,255)); gray.alpha_composite(out)
    gray.save("/tmp/"+ident+"_final_gray.png")
    print(ident, canvas, anchor, slopes, ratio_error, "axis_pass",geometry["axis_pass"])
for suffix in SUFFIXES:
    process(suffix)

