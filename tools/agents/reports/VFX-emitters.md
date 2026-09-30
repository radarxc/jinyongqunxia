# VFX-emitters 报告 · 外放招式 · 共用发出方图池（12 种）

## 1. 摘要（3–6 行）

- 完成 12 类共用发出方：12 张原生 RGBA PNG、12 份 EmitterPlate、总 manifest 与提示词图池章节；全部 `candidate`。
- 掌 / 指逐字节复用样例；其余 10 类用内置 `image_gen` 生成 17 个候选，选入 10、淘汰 7，每类至多 2 个。
- 逐张 `view_image` 检查手型、握持、发出方向与边缘，并量取点 / 宽；全部指定检查通过。保留原 alpha，未后处理 PNG。
- 拳 / 腿缺少现行类别枚举，采用明确标注的兼容值；边缘、器物考据及真实合成限制如实列出，未代替作者审批。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 / 数量 | 内容 |
|---|---:|---|
| `assets/default/vfx/emitters/<type>/source_<type>.png` | 12 张二进制，6,726,883 bytes | 12 类透明发出方，逐项文件见 §7 |
| `assets/default/vfx/emitters/<type>/emitter-plate.yaml` | 12 份，共 140 行 | 尺寸、类别、发出点、单位方向、源截面宽 |
| `assets/default/vfx/emitters/manifest.yaml` | 822 行 | 12 条完整元数据、实发提示词、候选链、测量法、哈希与 alpha 统计 |
| `assets/default/prompts/vfx.md` | 276 行 | 新增 §8 图池类型 / 模板 / 量法、§10 校验，保留既有待决项 |
| `tools/agents/reports/VFX-emitters.md` | 76 行 | 七节报告；候选取舍与下游交接 |

## 3. 关键结论与数值

- 全部 `1254×1254`，比例 `1254÷1254=1`，短边 `1254≥512`；每张 alpha 最小 0、最大 255，8 px 边框内 alpha>1 像素均为 0。极低 alpha 噪点仍保留，此统计不是无瑕疵证明。
- 数量 `2 复用 + 10 新图 = 12`；新候选 `7×2 + 3×1 = 17`，淘汰 `17−10=7`。复制和新图都与 manifest.source_path 原件逐字节一致。
- 11 类方向 `[1,0]`；乐器沿实测管轴 `[937,26]/sqrt(937²+26²)=[0.9996152427470851,0.027737456042074934]`，朝右略下约 1.59°。
- 宽度是垂直于发出方向的视觉截面：指 `489−447+1=43`；掌有效面 `864−544=320`；扇沿 `1009−68=941`。尖兵器使用尖端内侧截面，不取零宽数学尖点；全部测量依据见 manifest.measurement。
- 新量取的像素中心采用 `(i+0.5,j+0.5)`；掌 / 指沿用样例连续坐标。像素数不转成伤害、CT 或射程。投掷离手偏移 12 px 是表现选点（原创扩展）。

## 4. 开放问题（附默认值）

| 事项 | 默认值 |
|---|---|
| 作者确认画法 / 握持审美 | 写实手部画法沿用样例，朴素布袖、左上柔光；12 类维持 `candidate`，不把自检视为 approved |
| 拳 / 腿 category 缺项 | 暂用 `palm` 兼容编码，真实类型在目录、ID、manifest.emitter_type 和 YAML 注释；按 ID / 路径选图，上游扩枚举后迁移 |
| 边缘与留白 | 保留原生 alpha 与样例原字节；剑 / 刀查看时仍有少量浅色边，低 alpha 彩边未程序抹去，后续 Three.js 多底合成复核；alpha≥128 的剑右 / 枪右 / 鞭左净距 24 / 28 / 30 px，低于 32 px 建议但主体未裁断 |
| 器物 / 原著动作考据 | 宋明语境普通形制视觉候选（原创扩展）；精确断代及小说特定人物握法、左右手（待考），不绑定名器或具体人物 |
| 乐器发声与运行时 | 管口为音功视觉源点，不定义真实乐器声学；人物挂点、实机表现与跨库装配（待实测），默认交下游处理 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增基准或玩法修改提案。沿用 `VFX-design` 的 VFX-P01（design/23 制作子契约归属）及旧二进制入库同步事项；本次不改基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/design/23-projection-vfx-pipeline.md` | §3、§7、§9 | 引用 12 类共用池，补拳 / 腿造型类别和按动作选图；管口 / 扇沿取点说明 |
| `docs/design/vfx/schema.yaml` | EmitterPlate.category | 增列准确的拳 / 腿枚举并迁移这两份 YAML；其余类型可复用现有类别 |
| `tools/vfx/README.md`、后续效果库任务 | 套件打包与 `--root` | 规划共享池引用；现有检查器只允许共享 root 内相对路径，不能跨 root 逃逸；可由打包环节显式复制或用共同根 |
| `assets/default/STYLE.md`、`docs/tech/07-asset-generation.md` | 发出方规范 / 素材索引 | 引用本池及 prompts §8；审批完成后再升状态，运行时挂点另行接入 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

以下路径均相对 `assets/default/vfx/emitters/`；每行同时交付所列 PNG 和同目录 `emitter-plate.yaml`。点 / 宽单位 px；方向除乐器见 §3 外均 `[1,0]`。候选栏是“本次生成数 → 入选序号”。

| PNG 文件 | 发出点 | 宽度 | 候选数与淘汰原因 |
|---|---|---:|---|
| `palm/source_palm.png` | `[850,704]` | 320 | 0，新生成无；复用 1，未淘汰 |
| `finger/source_finger.png` | `[1178,468]` | 43 | 0，新生成无；复用 1，未淘汰 |
| `fist/source_fist.png` | `[1050.5,600.5]` | 273 | 2→2；首张袖端裁边 |
| `sword/source_sword.png` | `[1229.5,622]` | 13 | 2→2；首张袖端裁边、剑背浅色碎边较多 |
| `sabre/source_sabre.png` | `[1192.5,606]` | 24 | 2→2；首张刀下缘浅色残边更明显 |
| `staff/source_staff.png` | `[1189.5,645]` | 54 | 2→2；首张袖端裁边 |
| `spear/source_spear.png` | `[1225.5,581.5]` | 15 | 1→1；无淘汰 |
| `whip/source_whip.png` | `[1220.5,603]` | 5 | 1→1；无淘汰 |
| `fan/source_fan.png` | `[1205.5,538.5]` | 941 | 1→1；无淘汰 |
| `throw/source_throw.png` | `[1181.5,419]` | 40 | 2→2；首张袖端触左 / 下边 |
| `instrument/source_instrument.png` | `[1137,547]` | 85 | 2→2；首张袖端裁边 |
| `leg/source_leg.png` | `[1163.5,690]` | 74 | 2→2；首张裤管裁边 |

- ✅ `python3 tools/agents/check_assets.py assets/default/vfx/emitters --min 12 --max 12 --min-side 512`：退出 0，12 张 / 12 条 / 0 问题。
- ✅ 每种执行 `python3 tools/vfx/check_vfx.py assets/default/vfx/emitters/<type>/emitter-plate.yaml --root assets/default/vfx/emitters/<type>`：12/12 退出 0、valid=true；主代理运行时禁写 Python 字节码。
- ✅ 12 张全部 `view_image` 自查，真实 RGBA、无脸 / 背景 / 烧入特效；投掷图无暗器。手型 / 握持在自然遮挡下可辨，腿图为单腿单鞋；精细姿态审美仍待作者确认。
- ✅ 掌 / 指哈希分别为 `f0e83e6586baae3f7ece37510fcec6b9c75d3401a217bffd703bb4bb0f07322c` / `09b23637489db1342a22f252ef3b209b1afacf4e168c9648ff0e51cf1957cbd9`，与样例一致；新图也逐字节保存工具输出。
- ✅ 所有 YAML 与 manifest 的点 / 方向 / 宽度相等；全套完整提示词、来源、候选链和哈希已登记，临时 provenance 已汇总移除。
- ⚠️ 精确 category、边缘审美、器物断代与实机合成限制见 §4；未生成效果帧、未运行 Three.js / 真机，也未声称这些已通过。
- ✅ 仅改授权资产、提示词和本报告；未改设计文档、基准或任务表，未执行 git 状态变更命令。分节写入、无截断表格 / 代码围栏 / 未完占位；既有待决项均保留。
