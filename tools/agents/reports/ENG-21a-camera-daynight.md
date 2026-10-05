# ENG-21a-camera-daynight 报告 · 游戏工程 · 渲染补齐 A（战斗四偏航旋转 / 昼夜色调）

## 1. 摘要（3–6 行）

- 已交付无 Three 依赖的等距相机/朝向模块，以及战斗 45°/135°/225°/315° 四偏航、Q/E 与按钮控制。
- 旋转为 350 ms `easeInOutCubic`；逐帧更新公告板所读视图矩阵、Dir8 与 DOM 标签，旋转中及结束后 150 ms 禁止拾取；减少动效瞬切。
- 已交付八关键帧 OKLab 昼夜求值：大地图驱动既有灯光/清屏色且不增 draw；战斗以 1-pass multiply 色调层冻结开战时刻。
- 专项 13/13、全仓 527/527 测试通过；安装、检查、game build、严格 ID 与包体门禁全部通过。浏览器/真机帧率仍（待实测）。

## 2. 产出（文件、行数、主要章节）

| 文件                                         |  行数 | 主要产出                                                 |
| -------------------------------------------- | ----: | -------------------------------------------------------- |
| `packages/render/src/camera/`                |   204 | v1 相机常量、`cameraBack`、零分配补间、朝向换算及测试    |
| `packages/render/src/lighting/`              |   388 | 八关键帧 OKLab 求值、太阳方位、全屏色调 pass 及测试      |
| `packages/render/src/battle/`                |   539 | 相机控制、Dir8 更新、拾取保护、冻结昼夜、4 draw 场景测试 |
| `packages/render/src/worldmap/`              |   383 | `setTimeOfDay`、相机相对灯位/清屏色与不增 draw 测试      |
| `BattleField.vue` / `battle.css` / `i18n.ts` | 1,058 | Q/E、双按钮、输入保护、DOM 重投影、开战 tick 换算、文案  |
| `packages/render/{src/index.ts,CLAUDE.md}`   |   165 | 根导出、API/性能/下游约定及联网来源                      |

## 3. 关键结论与数值

- 相机：pitch 30°，默认 yaw 45°；预设 `45/135/225/315°`；旋转 `350 ms`；拾取保护总计 `350+150=500 ms`。
- `spriteDir=floor((((facingYaw-cameraYaw)%360+360)%360)/45+0.5)%8`；±22.5° 半档取较大顺时针索引并覆盖 0/360 回绕。
- core `HexDir dir0..5=[0,300,240,180,120,60]°` 的 `HexDir × ψ`：

|    ψ | dir0 | dir1 | dir2 | dir3 | dir4 | dir5 |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
|  45° |    7 |    6 |    4 |    3 |    2 |    0 |
| 135° |    5 |    4 |    2 |    1 |    0 |    6 |
| 225° |    3 |    2 |    0 |    7 |    6 |    4 |
| 315° |    1 |    0 |    6 |    5 |    4 |    2 |

- 昼夜关键帧为 `0/4.5/6/8/12/16/18/20 h`；颜色 OKLab、标量线性；`Δ=80+30cos(π·phase)` 在日出/正午/日落为 `110/80/50°`。
- 战斗 draw：改前格 1 + rig 2 = 3，改后再加 tint 1 = 4；大地图基线仍 7，目的地可见仍 8。
- `pnpm size`：entry `128.99/170 KiB`、render `152.45/180 KiB`、WebGL total `281.44/350 KiB`，全部 PASS。

## 4. 开放问题（附默认值）

- 色调层夜间 RGB 可读性下限默认 0.42、混合强度 0.58；后续按目标设备与书界样片校色。
- 城镇 shader/预渲染贴片不受 Three 灯光且 `town/**` 不在写集；默认保持 45°，后续复用 `createTimeTintPass()` 接入 +1 draw。
- （待实测）中端手机 GPU 帧率、触屏旋转/拾取保护、关键帧亮度、横竖屏及浏览器 WebGL 上下文恢复。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；实现按 `tech/02`、`tech/09-character-rig`、`design/09/11/14/22` 现有契约落地。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 任务    | 位置                           | 改什么                                                                                                              |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| ENG-21b        | renderer 创建与 `resize()`     | 在 battle/worldmap 的 WebGLRenderer 与 DPR 位置接上下文恢复/自适应质量，并恢复昼夜状态与 tint pass                  |
| ENG-12c        | 朝向消费                       | 复用 `BattleRenderer.camera.yawDeg`、`spriteDir()` / `hexDirToRig()`，不持久化 Dir8                                 |
| ENG-15 后续 UI | `WorldMapPage`                 | 从 `UiProjection.worldTick` 算 `(worldTick/TICKS_PER_HOUR)%24`，挂载及 tick 变化调用 `WorldMapScene.setTimeOfDay()` |
| rig 后续任务   | `rig/character.ts` `setMotion` | 镜头导致 Dir8 改变时跳过现有 160 ms 转身动画，以符合 tech/09 §4.3                                                   |
| 城镇渲染后续   | `packages/render/src/town/**`  | 保持 `allowRotation=false`，接入公共 tint pass；建筑/贴片仍使用预渲染 45° 图                                        |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 镜头与朝向：API、四偏航表、旧 45° 结果、`cameraBack(45)`、边界/回绕与 350 ms 均有确定性测试。
- ✅ 战斗：旋转控制、Q/E/按钮、输入保护、逐帧 DOM 重投影、减少动效与 150 ms 尾部拾取保护已实现；首帧前瞬切边界已测试；转镜头不产生玩法命令。
- ✅ 昼夜：八关键帧精确值/回绕、OKLab/标量插值、太阳三相位、大地图光照/清屏色与战斗 1 draw 色调层均覆盖。
- ✅ 性能：补间与昼夜热路径复用对象；战斗 4 draw、大地图 7/8 draw；rig 最佳 P95 为 20 人 0.056 ms、100 人 0.232 ms；包体全绿。
- ✅ 分层：render 不依赖 core/platform；`TICKS_PER_HOUR=600` 仅由 app 换算，战斗挂载时冻结；render 仍动态导入。
- ✅ 门禁：`pnpm install --frozen-lockfile`、`pnpm check`、独立 game build、strict IDs、Prettier 与 `git diff --check` 退出 0；ID 仅报告基线 `sk_babuganchan`，新增失败 0。
- ✅ 技术核实：Three 0.186.1 锁定；Color / WebGLRenderer / ShaderMaterial / Material 官方页于 2026-10-02 联网 HTTP 200，见 `packages/render/CLAUDE.md`。
- ✅ 单测工作流：新增 13 个用例全过；未配置用户要求的覆盖率卡口，Step6 按规则跳过；`utree flush` 已执行。
- ✅ 范围：仅改允许写集，未改 rig/town/VFX/docs/TODO/manifest/锁文件，未执行改变仓库状态的 git 命令。
- ⚠️ 沙箱不能完成浏览器/真机 GPU 验证；按要求保留（待实测），未用 Node 数据冒充帧率。
