# 外放管线占位样例（非正式素材）

此目录只有程序生成的金色渐变弧与灰色掌形示意，用于验收切帧、抠图、根部对齐、
插帧与离线 HTML 播放。它不是金龙、不是亢龙有悔的造型成品，也不代表作者审美批准。
未加入任何素材 manifest。程序绘图仅用于这个明确标记的测试占位；正式效果与发出方
必须使用分别生成并审核的素材，不能以程序图代替。

从仓库根目录重建：

```sh
python3 tools/vfx/make_placeholder.py
python3 tools/vfx/check_vfx.py assets/default/baseline/vfx/preview/composition.yaml
```

打开 `demo_placeholder.html`，可播放/暂停、调速或选择减少动态静帧。
资源为内嵌 WebP；HTML 可置于 `sandbox="allow-scripts"` 的 `srcdoc` iframe。
桌面浏览器与移动设备的实际观感须人工复核；占位不能证明真实素材造型合格。

| 文件 | 用途 |
|---|---|
| `effect/source_placeholder.png` | 4 格白底原件，单格 320×160，格间 16 px |
| `effect/effect-set.yaml`、`effect/frame_000.png`–`frame_003.png` | EffectSet 与 4 张抠图帧 |
| `effect/preview_black.png` / `preview_gray.png` / `preview_white.png` | 黑、50% 灰、白底质检联系表 |
| `effect/quality.json` | cut 阶段逐帧抠图指标 |
| `emitter/plate.png`、`emitter/emitter-plate.yaml` | 原生透明灰掌占位与视觉发出点 |
| `composition.yaml` | 基线模式、固定纸底、根部合成及节奏配置 |
| `frames/key_000.png`–`key_003.png` | 4 张整图关键帧，不预先施加包络 |
| `frames/keyframes.json` | 关键帧相位、原 Composition 引用与变换边界 |
| `frames/frame_0000.png`–`frame_0012.png` | 13 张整图重采样帧 |
| `peak.png`、`frames_thumbnail.png` | 精确峰值与帧序列缩略图 |
| `demo_placeholder.html`、`animation.json` | 单文件演示与实际输出/时间表 |
| `placeholder_quality.json` | 本次生成的抠图质量与 HTML 大小实测 |

占位显式使用 `key_full_8bit=163=255−min(201,164,92)`，通用默认仍为 25。
`reference_quality` 用已知金色与生成前覆盖率在三底对拍；黑/灰底亮边比例按任一
通道高于真值 2/255 计数，分母是原始柔边像素（包括误判为不透明的输出）。
同时记录绝对色差与覆盖率误差：实心金色保持原色，柔边会更深、更饱和，不能
据此宣称恢复了真实 alpha。真实素材没有此真值，须独立调参并逐帧检查三底。

母版仅 640×400，便于仓库保存与工具回归，不充当 1536×1024 正式母版。
总时长为 0.10+0.15+0.25+0.10=0.60 s，20 fps 输出 ceil(0.60×20)+1=13 帧；
末帧只持有 0.40 s 循环间隔，一轮 1.00 s。峰值相位为 0.25/0.60。
纵向比例为 320/224，横向为 32/32=1；方向 0° 向右，90° 向下。
效果每帧保留至少 32 px 白边；4 张原始末帧仍含颜色，最终透明由时间包络生成。

`vfx_sk_xianglong_dragon`、`vfx_mv_xianglong18_kanglong__ch02_base01` 与
`mv_xianglong18_kanglong` 复用已存在的结构引用，只为让占位通过 schema/外键校验。
本目录不登记新 ID，不声明该招的射程或范围，也不把占位转为生产候选。
