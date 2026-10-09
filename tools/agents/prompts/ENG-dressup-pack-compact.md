# 本任务：3D 纸娃娃换装 · 打包压缩：减面后清除未引用顶点，并重打包现有四件道具（协调者 2026-10-08 23:40）

本任务写代码并实跑。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md`（§5.2、§6）、`tools/model3d/dressup/pack_glb.mjs`、`apps/game/build/dressup-assets.test.ts` 中 "packs rigid props without changing vertex accessors" 用例。

> 工具链口径：以根 `package.json` 为准（pnpm 9.15.9、Node ≥22.12）。

## 背景（协调者实测）
`pack_glb.mjs --simplify` 只重写了索引，没有压缩顶点缓冲：四件道具成品里绝大多数顶点未被任何三角引用——龙泉剑 107,644 顶点只用 8,205、斗笠 160,426 / 8,334、青锋剑 157,844 / 7,263、玉佩 159,289 / 7,764，单件 2.4~4.5 MB（贴图约 0.7 MB）。量产 246 把兵器时会成倍放大包体与加载时间。

## 要做的事
1. **`pack_glb.mjs`**：减面（及任何会让顶点失去引用的步骤）之后，按索引压缩所有顶点属性（POSITION / NORMAL / TEXCOORD_n / COLOR / JOINTS / WEIGHTS / 自定义 `_REGION` 等），重建索引；可用 meshoptimizer 的重映射 / `optimizeVertexFetch` 或自写重映射，不加新依赖。压缩是**无损**的：每个三角的三个顶点的全部属性逐字节不变（只是编号变了）。stats 输出压缩前后顶点数。
2. **更新 "packs rigid props without changing vertex accessors" 用例**（本任务写集只允许改这一个用例）：原意是"打包不改几何"，改为断言**每个三角引用到的顶点属性逐字节不变**、且输出不含未引用顶点；不得放宽成"大致相等"。
3. **重打包四件道具**（`props/{eq_longquanjian,item_bamboo_hat,item_qingfeng_sword,luxury_jade_pendant}`）：在现有成品 GLB 上做无损压缩（不重新减面、不改贴图、不改 fit 变换），然后对每件重跑 `validate.py` 与 `check_sockets.py`，刷新 report / sockets_check / manifest 的哈希与字节数；门禁等级与插槽结果必须与压缩前一致（报告列出压缩前后顶点数、文件大小、level 对比）。
4. 测试：合成"含 1000 个未引用顶点的小网格"压缩后只剩被引用顶点、三角属性逐字节相同、skinned 网格的 JOINTS / WEIGHTS 同步压缩。

## 约束
- 只写 `tools/model3d/dressup/pack_glb.mjs`、`apps/game/build/dressup-assets.test.ts`（只改上述一个用例）、`assets/default/model3d/dressup/props/**` 与本任务报告。
- 衣物 / 头不在本任务（另有任务在改劲装与黄蓉头，避免冲突）；不改运行时；不加依赖；不改门禁阈值；不花点数。

检查：
- `pnpm install --frozen-lockfile`
- `python3 tools/model3d/dressup/check_sockets.py --template assets/default/model3d/dressup/templates/tpl_f_medium --props assets/default/model3d/dressup/props/item_qingfeng_sword assets/default/model3d/dressup/props/item_bamboo_hat assets/default/model3d/dressup/props/luxury_jade_pendant assets/default/model3d/dressup/props/eq_longquanjian`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-dressup-pack-compact.md`：第 3 节列四件压缩前后顶点数 / 文件大小 / validate level / sockets level；第 7 节写给量产 P1 / P2：打包命令与压缩约定。报告 ≤ 30 行。
