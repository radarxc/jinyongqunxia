# 本任务：3D 纸娃娃换装 · 阶段 B2 · `/character-3d` 预览页「换装 v2」面板（模板 / 发型 / 衣物 / 道具实穿，unlit）

本任务写代码（UI 装配 + 少量构建接线）。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md` §7、§8、§9、§10.B，`docs/tech/10-paper-doll-3d.md` §3（运行时机制）与 §0.2（作者 5 个问题的根因与解法），B1a / B1b / A5 报告第 7 节。

## 作者要求
作者原始需求（AR-102）：在 `http://localhost:5173/character-3d` 预览纸娃娃换装；本地预览要与 Tripo 的 unlit 观感一致；头发、衣服、饰品、武器都要正确地穿戴到素体上、随动作运动、大小合适、武器在手里。本任务把阶段 A / T / B1 的成果接到这个页面上，让作者能看到效果。

> 协调者 2026-10-08 01:10：本任务不再等 A4。页面只读 `index.json`，A4 的衣物 / 发型合入后会自动出现在列表里；现在可用的是三套女模板（small / medium / tall）与三件道具（剑 mainHand / 斗笠 headTop / 玉佩 chest）。作者要尽快在本地看到效果，先保证模板切换、unlit 对比、道具插槽与动作切换可用。

## 第 0 步：导入预览页基线（主检出里未提交的现有文件，只读拷贝）
以下文件只存在于主检出 `/Users/bytedance/Projects/jinyongqunxia` 的工作区（未提交），先原样拷进你的工作区，再在其上开发：
- `apps/game/src/pages/Character3dPage.vue`
- `packages/render/src/character-viewer/{index,scene,types}.ts`
- `packages/render/package.json` 的 `exports` 增加一行 `"./character-viewer": "./src/character-viewer/index.ts"`（B1b 已加 `./dressup`，两行都保留）
- `apps/game/src/main.ts` **只取** `start()` 开头的 `/character-3d`（及 `/model3d`、`?character-3d`）开发路由那一段（`import.meta.env.DEV` 守卫、动态 `import('./pages/Character3dPage.vue')` 后 `mount`）；主检出 main.ts 里其他改动（音频管理器、`__gameController` 等）**不要带进来**。
拷进来后先让 `pnpm lint` / `pnpm typecheck` 过（必要的最小修正写进报告）。

## 要做的事
1. **素材索引**：扩展 `apps/game/build/dressup-assets.ts`，在发布时额外写 `apps/game/public/assets/default/model3d/dressup/index.json`：列出所有 non-rejected 条目 `{ kind, id, template, file, fit, report, status, slot?, socket? }`（含 `fits` 变体），按 kind 分组；补测试。页面运行时只读这个索引，不在页面里硬编码资产清单。
2. **viewer**（`character-viewer/scene.ts` / `types.ts`）：新增 `attachExternal(root)` / `detachExternal(root)`；新增 `setUnlitMode(on)`：on 时 `renderer.toneMapping = NoToneMapping`（unlit 角色不受灯光影响，底座可保留现有光照）；身高不再用 `geometry.boundingBox`（meshopt 量化后会错），外部 actor 自带缩放。
3. **「换装 v2」选项卡**（`Character3dPage.vue`）：
   - 模板选择：`tpl_f_small` / `tpl_f_medium` / `tpl_f_tall`（来自索引的 template 条目，读各自 `body.glb` + `skeleton.json`，`heightM` 取 manifest）；
   - 装备列表：按 kind 分组（衣物 / 发型 / 道具），显示 status（candidate / draft 用徽标区分，draft 也能试穿以便诊断）；点选即 `actor.equip()`，再点卸下；同 slot 互斥；
   - 动作：idle / walk / run 切换（`actor.playClip`）；持械（mainHand 道具）时自动用握拳指骨；
   - 经 `import('@tianshu/render/dressup')` 动态创建 `DressupActor`，`viewer.attachExternal(actor.root)`，默认 `setUnlitMode(true)`，提供 unlit / 原灯光对比开关；
   - 调试：`window.__dressup = { actor, viewer, index }`，便于协调者自动截图；面板显示 `actor.stats()`（draw call、三角、boneTexture 上传次数）。
   - 保留旧的 attachProp 面板与其他功能不删。
4. **自检截图**：用仓库里已有的浏览器驱动做法（或 Node 里不可行就跳过并在报告说明），不强制；协调者会在浏览器里实测验收。

## 约束
- 只写 `apps/game/src/pages/Character3dPage.vue`、`packages/render/src/character-viewer/**`、`packages/render/package.json`（只加 character-viewer 导出）、`apps/game/src/main.ts`（只加开发路由段）、`apps/game/build/dressup-assets.ts`、`apps/game/build/dressup-assets.test.ts` 与本任务报告。
- 换装运行时只能动态 `import()`，不得让 render 主块或首屏 entry 增长（`pnpm size` 前后对比）；不改 `packages/render/src/dressup/**`（B1a 产物；发现 bug 写进报告第 4 节）；不改门禁阈值；不加依赖。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game build`

## 报告
第 3 节写导入基线时做的修正、索引格式、页面交互清单、`pnpm size` 前后 entry / render / render-dressup 体积；第 7 节写协调者在浏览器验收的步骤（打开地址、点哪些、看什么）。报告 ≤ 60 行。
