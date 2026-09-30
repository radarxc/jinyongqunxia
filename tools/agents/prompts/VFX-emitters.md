# 本任务：外放招式 · 共用发出方图池（掌、指、拳、剑、刀、棍杖、枪、鞭索、扇、暗器手、乐器、腿）

本任务生成图片并写 EmitterPlate YAML，不改设计文档。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 背景

作者定下外放招式两段式：发出方图（掌 / 指 / 剑 + 手…）与效果图分开，代码（Three.js）合成。两招样例已有掌（`assets/default/baseline/vfx/mv_xianglong18_kanglong/emitter/source_palm.png`）与指（`assets/default/baseline/vfx/sk_liumai/emitter/source_finger.png`）。后面要给几百门武学出特效，**发出方图按"发出方式"共用**，不逐招重出。本任务建这个池。

## 要做的事

输出目录 `assets/default/vfx/emitters/<type>/`，每种一张透明底 RGBA PNG（`source_<type>.png`，画幅 1254×1254 或同比，与样例一致）+ `emitter-plate.yaml`（按 `docs/design/23-projection-vfx-pipeline.md` §3、`docs/design/vfx/schema.yaml` 的 EmitterPlate：`emit_point_px`、`direction`、`emission_width_px` 实测标注）。类型与发出点：

| type | 画什么 | 发出点 / 方向 |
|---|---|---|
| `palm` | 复用样例掌（逐字节复制，不重出） | 掌面中心，向右 |
| `finger` | 复用样例指（逐字节复制） | 指尖，向右 |
| `fist` | 握拳前伸的手臂（拳法） | 拳面中心，向右 |
| `sword` | 持剑手 + 直剑，剑尖向右 | 剑尖 |
| `sabre` | 持刀手 + 单刀，刀尖向右 | 刀尖 |
| `staff` | 持棍 / 杖的手臂，棍端向右 | 棍端 |
| `spear` | 持枪手臂，枪尖向右 | 枪尖 |
| `whip` | 持鞭 / 软索的手，鞭稍向右 | 鞭稍 |
| `fan` | 持折扇的手，扇沿向右 | 扇沿中点 |
| `throw` | 投掷手（暗器离手瞬间，不画暗器） | 指尖前方离手点 |
| `instrument` | 持箫 / 笛的手（音功） | 管口 |
| `leg` | 踢出的腿（腿法） | 脚尖 |

画法与样例一致（写实手部、朴素布袖、无面部、无背景、透明底真 RGBA、光源左上）；兵器按宋明常见形制，不画名剑名刀；每张 `view_image` 自查五指 / 握持 / 朝向 / 边缘干净。每张最多出 2 候选选 1。

`assets/default/vfx/emitters/manifest.yaml`：每种一条（字段按 `assets/README.md`，`id` 形如 `vfx_emitter_sword`），`status: candidate`。`assets/default/prompts/vfx.md` 增加"发出方图池"一节：类型表、提示词模板、发出点量法。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_assets.py assets/default/vfx/emitters --min 12 --max 12 --min-side 512`
- 每种：`python3 tools/vfx/check_vfx.py assets/default/vfx/emitters/<type>/emitter-plate.yaml --root assets/default/vfx/emitters/<type>`

## 报告

第 7 节写：12 种的文件、发出点、宽度；候选数与淘汰原因；需作者确认的事项（默认：写实手部画法沿用样例）。报告 ≤ 100 行。
