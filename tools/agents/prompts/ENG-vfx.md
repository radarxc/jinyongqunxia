# 本任务：游戏工程 · 动效层（招式特效接入战斗界面）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`、`apps/game/CLAUDE.md`、`tools/vfx/README.md`（若有）与 `tools/vfx/web/`。

## 作者要求

`docs/decisions/author-requirements.md` **AR-19** 交互层 3.5 动效层：招式效果等。相关既有决定：招式 = 几张图 + 代码合成（three.js）；降龙十八掌龙放大 2 倍（素材不变，特效放大素材）；玄级有外放统一外放气效果（颜色取决于内力阴阳：阴青 / 阳赤 / 调和淡金 / 中性素白），无外放残影；黄级普通招式（`assets/default/STYLE.md` 2026-09-30 原话）。

## 设计依据

`tools/vfx/web/{timeline.js,vfx_player.js}`（THREE 由调用方传入；bespoke 合成 + 模板模式 qi_projection / afterimage / plain_strike）、`assets/default/vfx/bindings.yaml`（全库 `mv_*` → 套件 / 模板绑定）、`assets/default/vfx/<skill>/moves/<move>/composition.yaml`、`assets/default/vfx/emitters/`、`docs/design/vfx/palette.yaml`、`tools/vfx/{compose,build_demo,bind_moves,check_skill_suite}.py`、`docs/tech/01` 决策（three r186）。ENG-10 的 `onMoveResolved` 钩子与战场坐标。

## 要做的事

1. 把 `tools/vfx/web/` 的播放器以 TS 模块形式接入 `packages/render/src/vfx/`（保留原 JS 可运行：要么 re-export，要么移植并在 `tools/vfx/web/` 留兼容导出；`build_demo.py` 产的 demo.html 仍可用）；加载 `bindings.yaml`（打包成 JSON：`tools/vfx/export_bindings.py` → `content/vfx/bindings.json`）与各招 composition；贴图图集 / 懒加载 / 缓存。
2. 战斗接入：`onMoveResolved` → 按 `mv_*` 查绑定 → bespoke 套件或模板（qi_projection 颜色按施招者内力阴阳 / 调和 / 中性；afterimage；plain_strike）→ 从施招者格到目标格 / 范围落点播放，时长与伤害飘字对齐；命中 / 抵消（`combat.qiRepel`）/ 透劲入体 / 打穴各有附加效果（简洁）；降龙十八掌龙按 composition 的 2× 参数放大。
3. 性能：同屏多特效池化、纹理共享、≥ 60 fps；无素材的招式回退模板并记日志（不报错）。
4. 校验：`tools/vfx/check_skill_suite.py` 与 `check_vfx.py --html` 对改动后的 demo 仍通过；`content/vfx/bindings.json` 与 YAML 一致的测试。
5. 测试：绑定解析（天 / 地 bespoke、玄模板、黄 plain）、颜色选择、播放时间轴（无头）、回退路径；`pnpm check` 全绿；web build 成功。
6. 更新 `packages/render/CLAUDE.md`。

约束：不改素材与 `bindings.yaml`；`tools/vfx/web/` 只做兼容性最小改动；每次写入 ≤ 150 行；尽量不加新依赖（并行任务改同一份 `pnpm-lock.yaml` 会冲突），必须加的写进报告。

性能是作者硬要求（AR-21「性能要最好」）：特效对象池、纹理共享与图集、同屏多特效 ≥ 60 fps 桌面；懒加载按书界 / 招式分包，不进首屏 chunk；`pnpm size` 必须过。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game build`
- `python3 tools/vfx/export_bindings.py --check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：接入结构；绑定 → 播放路径；性能数据；回退统计；需作者确认（附默认）。报告 ≤ 100 行。
