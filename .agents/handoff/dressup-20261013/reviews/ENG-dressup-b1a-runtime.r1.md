VERDICT: FAIL

## 逐项结论

- 写集与禁区：通过 —— 仅新增 `packages/render/src/dressup/**` 和任务报告；未改门禁、依赖、`node_modules` 或其他资产，也未出现 `bone.scale`、`retargetClip`、包围盒贴合、`HeadTop_End` 头顶等禁区实现。
- 类型与骨架帧访问：通过 —— `types.ts` 覆盖 skeleton/fit/equip/actor 主契约；`skeleton-frame.ts` 实现 URL Promise 缓存、socket、≤32 位区域双向映射和清洗骨名后的指骨姿势访问。
- 共享骨架与装备重映射：通过 —— [actor.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-b1a-runtime/packages/render/src/dressup/actor.ts:45) 在克隆属性后按清洗骨名重映射，缺骨权重清零并归一；所有 `bind` 均显式传入 `bindMatrix`，身体多 primitive 也合并到同一 Skeleton。
- 插槽与持械姿势：通过 —— prop 挂到骨骼下的固定 socket，矩阵顺序为骨世界矩阵 × socket × gripAdjust；动画更新后覆盖对应手的指骨姿势。
- 区域遮罩与 unlit shader：通过 —— `_region`、flat uint varying、`uHideMask`、固定 cache key 均符合契约；身体关闭 `castShadow`，缺 `_region` 抛枚举错误。
- GPU 资源所有权：不通过 —— [materials.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-b1a-runtime/packages/render/src/dressup/materials.ts:13) 将 PBR 材质替换为只保留 baseColor `map` 的 `MeshBasicMaterial` 后，仅 dispose 旧材质；[actor.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-b1a-runtime/packages/render/src/dressup/actor.ts:103) 最终只能从新材质树收集纹理。真实 `tpl_f_medium/body.glb` 含 baseColor、normal、metallicRoughness 三张纹理，normal 与 metallicRoughness 在替换时丢失引用，之后无法显式 `Texture.dispose()`，违反根 `CLAUDE.md` 的 GPU 资源所有权要求。
- 骨长和动画：通过 —— 子骨 position 在首次 update 前按 0.97–1.03 调整，不改 scale；模板 clip 直接播放，不做 retarget。
- 稳态零分配验证：不通过 —— [actor-runtime.test.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-b1a-runtime/packages/render/src/dressup/actor-runtime.test.ts:122) 只比较 root、Skeleton、boneMatrices、socket 和 stats 的对象身份；这不能检测 `AnimationMixer.update()` 或遍历过程中的短生命周期分配。报告第 26 行将其写成“零分配实测”，证据与结论不相符。
- 测试与门禁：通过 —— 监督日志记录专项 4 文件/15 tests、render 43 文件/210 tests、全仓 183 文件/1301 tests 及 `pnpm check` 通过；本审核的 Vitest 复跑因只读沙箱禁止写 `.vite-temp`/系统临时目录而未能独立执行。ESLint 和无输出 TypeScript 检查通过。
- 报告和文本自检：不通过 —— 报告结构完整且 49 行，但第 48 行声称 `git diff --check` 通过；新文件未被普通 `git diff --check` 覆盖。执行 `git diff --check --no-index -- /dev/null packages/render/src/dressup/types.ts` 会报 [types.ts](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-b1a-runtime/packages/render/src/dressup/types.ts:165) `new blank line at EOF`。
- 补充审核要点中的真实 GLB 数字、fit/report 残差及 GLB 字节一致性：不适用于 B1a 的纯运行时写集；其上游产物未被本任务修改。

## 返修说明

1. 修复 PBR→unlit 的纹理所有权：替换材质前收集原 GLTF 的全部纹理，并由 actor/equipment 持有；`unequip()` 与 `dispose()` 时对 baseColor、normal、metallicRoughness 等所有纹理去重后显式释放。不要只遍历替换后的 `MeshBasicMaterial`。补测试验证被丢弃的 normal/roughness/metalness 纹理也各 dispose 一次。
2. 增强 `update(dt)` 零分配测试，覆盖已播放 clip、持械指骨和 socket 更新的稳态路径，并实际检测短生命周期分配；不能只比较少量长期对象身份。若只能证明存储身份复用，报告必须如实改称“稳态存储复用证据”，不得写“零分配实测”。
3. 删除 `types.ts` 末尾多余空行。对所有未跟踪新增文件逐一运行 `git diff --check --no-index -- /dev/null <file>`，再更新报告中的自检结论。
4. 返修后重跑专项测试、`pnpm --filter @tianshu/render test` 与 `pnpm check`，在报告中登记最终实际结果。

## 需作者确认

无。