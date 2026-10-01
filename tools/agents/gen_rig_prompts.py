#!/usr/bin/env python3
"""生成角色分层部件（AR-22 / tech/09）出图任务的提示词文件：assets/default/prompts/rig/<set>/…

    python3 tools/agents/gen_rig_prompts.py

每个体型集（male_std 1.70 m / female_std 1.62 m）：3 张全身参考图（front34 / back34 / side）+ 13 个源部件 × 3 视图 = 42 份。
数据来自 docs/tech/09-character-rig.md §1.2（部件、pivot、子关节、默认长度）、§1.3（三视图）、§6（目录与 manifest）。
只填模板，不改规格。
"""
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets/default/prompts/rig"
SETS = [("male_std", "男性标准体", 1.70, 1.0, "character-male.md", "普通成年汉族男性、自然骨相、束髻、无胡或淡胡茬，身形匀称（原创扩展）"),
        ("female_std", "女性标准体", 1.62, 1.62 / 1.70, "character-female.md", "普通成年汉族女性、自然骨相、挽髻素簪，身形匀称（原创扩展）")]
VIEWS = [("front34", "前 3/4 视图：面向屏幕左下，可见脸与胸腹，近侧为右侧（nearSide:R）"),
         ("back34", "后 3/4 视图：面向屏幕左上，可见后脑与背，近侧为右侧"),
         ("side", "正侧视图：面向屏幕左，近侧为右侧")]
# (source_key, 中文, 男 front34 画布 w,h, pivot x,y, pivot 说明, 子关节, 长度 m 男, 长度 m 女, tint, 覆盖的运行时 part)
PARTS = [
    ("head", "头（颈至头顶）", 96, 80, 48, 70, "下中颈点", "crown:(48,9) 头顶", 0.24, 0.23, "skin（默认不换色）", "head"),
    ("hair_or_headgear", "发式 / 头饰层", 112, 80, 56, 72, "下中颈点（与 head 同矩阵）", "crown:(56,8)", 0.25, 0.24, "hair 或装备固色", "hair_or_headgear"),
    ("torso", "躯干（骨盆点至颈点）", 132, 154, 66, 142, "下中骨盆点", "neck:(66,9)；shoulder_L/R:(18/114,30)", 0.52, 0.50, "clothPrimary", "torso"),
    ("pelvis_skirt", "骨盆 / 下裳", 146, 92, 73, 8, "上中骨盆点", "hip_L/R:(46/100,8)；hem:(73,80)", 0.28, 0.27, "clothSecondary", "pelvis_skirt"),
    ("upper_arm_L", "左上臂", 58, 92, 29, 8, "顶中（肩点）", "elbow_L:(29,85)", 0.30, 0.28, "clothPrimary", "upper_arm_L"),
    ("upper_arm_R", "右上臂", 58, 92, 29, 8, "顶中（肩点）", "elbow_R:(29,85)", 0.30, 0.28, "clothPrimary", "upper_arm_R"),
    ("forearm_L", "左前臂", 52, 82, 26, 8, "顶中（肘点）", "wrist_L:(26,75)", 0.26, 0.245, "clothSecondary", "forearm_L"),
    ("forearm_R", "右前臂", 52, 82, 26, 8, "顶中（肘点）", "wrist_R:(26,75)", 0.26, 0.245, "clothSecondary", "forearm_R"),
    ("hand_L", "左手", 40, 62, 20, 6, "顶中（腕点）", "grip_L:(20,33) 握点 0.56L", 0.19, 0.18, "skin（默认不换色）", "hand_L"),
    ("hand_R", "右手", 40, 62, 20, 6, "顶中（腕点）", "grip_R:(20,33) 握点 0.56L", 0.19, 0.18, "skin（默认不换色）", "hand_R"),
    ("thigh_shared", "大腿（左右共享源，右侧运行时镜像）", 64, 128, 32, 8, "顶中（髋点）", "knee:(32,121)", 0.44, 0.42, "clothSecondary", "thigh_L / thigh_R"),
    ("shin_shared", "小腿（左右共享源）", 58, 116, 29, 7, "顶中（膝点）", "ankle:(29,109)", 0.40, 0.38, "clothSecondary", "shin_L / shin_R"),
    ("foot_shared", "脚 / 鞋（左右共享源）", 96, 68, 48, 8, "顶中踝点", "toe:(90,57) 脚尖", 0.25, 0.235, "footwear（装备替换）", "foot_L / foot_R"),
]
PALETTE = "clothPrimary #6B5141（主衣）、clothSecondary #394C53（副衣 / 下裳）、skin #E9CFB4、footwear #332B27（布鞋）、hair #211C1A"
NEG = ("不要文字、伪字、水印、签名、UI；不要背景、地面、投影、光晕、粒子、半透明雾；不要兵器、配饰、披风（它们是另外的装备层）；"
       "不要演员脸、具体影视游戏造型；不要日韩动漫、欧美奇幻、赛博朋克；不要透视畸变、多视图拼贴、主体截断；不要抗锯齿以外的柔边或发光描边。")


def px(v, k):
    return int(round(v * k))


def write_ref(set_id, set_name, height, k, char_md, look, view, view_desc):
    h_px = px(height * 256, 1.0)
    fm = {"asset_id": f"rig_{set_id}__ref_{view}", "kind": "rig_ref", "set": set_id, "view": view, "name": f"{set_name} · {view} 全身参考图",
          "output": f"assets/default/rig/{set_id}/ref_{view}.png", "manifest": f"assets/default/rig/{set_id}/manifest.yaml",
          "size": "512x512", "figure_height_px": h_px, "background": "透明 RGBA（alpha 同时含 0 与 255）",
          "references": [{"path": f"assets/default/prompts/{char_md}", "use": "人物比例、服饰时代感与画风规则（§6–§7）"},
                          {"path": "docs/tech/09-character-rig.md", "use": "§1 体型、视图、A 字站姿与部件拆分约定"}],
          "status": "ready", "order": 0}
    prompt = "\n".join([
        f"为《金庸群侠传·天书录》default 风格包绘制 {set_name}（{set_id}）的分层部件母版全身参考图，{view_desc}。",
        f"人物：{look}；素色交领右衽窄袖短衣与下裳、布鞋，无兵器、无披风、无护肩、无头饰以外的配饰。身高 {height:.2f} m，按 256 px/m 画成约 {h_px} px 高，画布 512×512，人物居中、脚底距画布底边约 24 px。",
        "姿势：A 字站姿——双臂自然外展与躯干明显分开（腋下可见背景），双腿分开约肩宽，手掌张开可见五指，所有关节都能被单独裁出；不叠臂、不交叉、不持物。",
        f"画风：与建筑 / 贴片素材一致的写实古风 2.5D——清楚的 2 px 深色墨线描边、低饱和、光源左上、阴影右下、材质层次克制；配色用 {PALETTE}。",
        "输出：真正的透明 RGBA 背景，人物外一切像素 alpha=0；无地面、无投影、无光晕。三张视图（front34 / back34 / side）必须是同一个人、同一套衣着与配色、同一身高。",
        f"排除项：{NEG}",
    ])
    body = ["---", yaml.safe_dump(fm, allow_unicode=True, sort_keys=False, width=1000).rstrip(), "---", "",
            f"# {set_name} · {view} 全身参考图", "",
            "## 要点", "", f"- 用途：本视图所有部件图的唯一图片输入（保证脸、衣着、配色一致），先出它再出部件。", f"- 视图定义：{view_desc}（tech/09 §1.3）。",
            f"- 身高 {height:.2f} m → 约 {h_px} px；画布 512×512；A 字站姿，四肢与躯干分开。", "",
            "## 提示词", "", "```text", prompt, "```", "",
            "## 排除项", "", NEG, "",
            "## 质检要点", "", "- 透明底：alpha 同时含 0 与 255，人物外无半透明雾。", "- 关节可裁：腋下、两腿之间、手指缝可见背景。",
            f"- 三视图一致：同一人、同一衣着配色、身高 ≈ {h_px} px。", "- 2 px 墨线描边清楚，光源左上。", ""]
    d = OUT / set_id
    d.mkdir(parents=True, exist_ok=True)
    (d / f"ref_{view}.md").write_text("\n".join(body), encoding="utf-8")


def write_part(set_id, set_name, height, k, view, view_desc, p):
    key, zh, w, h, pxv, pyv, pdesc, child, lm, lf, tint, runtime = p
    length = lm if set_id == "male_std" else lf
    W, H, PX, PY = px(w, k), px(h, k), px(pxv, k), px(pyv, k)
    fm = {"asset_id": f"rig_{set_id}__{view}__{key}", "kind": "rig_part", "set": set_id, "view": view, "part": key, "name": f"{set_name} · {view} · {zh}",
          "runtime_parts": runtime, "canvas": f"{W}x{H}", "pivot": [PX, PY], "pivot_desc": pdesc, "child_joint": child, "length_m": length, "tintable": tint,
          "output": f"assets/default/rig/{set_id}/{view}/{key}.png", "manifest": f"assets/default/rig/{set_id}/manifest.yaml",
          "background": "透明 RGBA", "references": [{"path": f"assets/default/rig/{set_id}/ref_{view}.png", "use": "同视图全身参考图：唯一图片输入，从中截取 / 重绘该部件，保持衣着配色一致"},
                                                    {"path": "docs/tech/09-character-rig.md", "use": "§1.2 部件表（画布 / pivot / 子关节）、§1.4 z 序与描边、§6 manifest"}],
          "status": "ready", "order": 1}
    prompt = "\n".join([
        f"为《金庸群侠传·天书录》default 风格包绘制 {set_name}（{set_id}）分层部件母版中的单个部件：{zh}（{key}），{view_desc}。",
        f"以同视图的全身参考图为唯一图片输入，只画这一个部件：裁出或重绘它在参考图里的样子（衣着、配色、墨线风格完全一致），其余身体部位一律不画。",
        f"画布 {W}×{H} px（256 px/m），部件轴向竖直摆正；pivot 在{pdesc}（约 ({PX},{PY})），子关节 {child}，骨段长度约 {length:.3f} m。关节两端各留 6–10 px 与相邻部件重叠的余量（关节处圆润收口，不画成平切）。",
        f"画风：2 px 深色墨线描边（烘焙在图里）、低饱和、光源左上、阴影右下；可换色区域为 {tint}，其余保持素色。真正的透明 RGBA 背景，部件外 alpha=0；无地面、无投影、无光晕。",
        "不画文字、标记点、辅助线；pivot 与关节位置只在 manifest 里登记，不画进图。",
        f"排除项：{NEG}",
    ])
    body = ["---", yaml.safe_dump(fm, allow_unicode=True, sort_keys=False, width=1000).rstrip(), "---", "",
            f"# {set_name} · {view} · {zh}（`{key}`）", "",
            "## 要点", "", "| 项 | 内容 |", "|---|---|",
            f"| 运行时部件 | {runtime} |", f"| 画布 / pivot | {W}×{H} px；pivot ({PX},{PY}) {pdesc} |", f"| 子关节 | {child}（男 front34 模板像素，女 ×0.9529；本视图可因剪影改画布，关节米长不变） |",
            f"| 骨段长度 | {length:.3f} m |", f"| tint 槽 | {tint} |", f"| 视图 | {view_desc} |", "",
            "## 提示词", "", "```text", prompt, "```", "",
            "## 排除项", "", NEG, "",
            "## 质检要点", "", "- 只含这一个部件，透明底，alpha 同时含 0 与 255。", f"- 轴向竖直，pivot 约在 ({PX},{PY})；两端留 6–10 px 重叠余量。",
            "- 与同视图全身参考图的衣着、配色、墨线一致；描边 2 px。", "- 不含文字 / 辅助线；交 `tools/rig/make_parts.py` 裁边与定枢轴，`preview.py` 看姿势条带无断裂。", ""]
    d = OUT / set_id / view
    d.mkdir(parents=True, exist_ok=True)
    (d / f"{key}.md").write_text("\n".join(body), encoding="utf-8")


def main():
    n = 0
    for set_id, set_name, height, k, char_md, look in SETS:
        for view, view_desc in VIEWS:
            write_ref(set_id, set_name, height, k, char_md, look, view, view_desc)
            n += 1
            for p in PARTS:
                write_part(set_id, set_name, height, k, view, view_desc, p)
                n += 1
    print(f"已生成 {n} 份 rig 提示词（2 套 × (3 参考 + 13 部件 × 3 视图)）→ {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
