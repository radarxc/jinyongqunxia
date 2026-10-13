VERDICT: PASS

## 逐项结论

- 写集与仓库状态：通过 —— 14 个修改/新增文件全部位于允许写集；`git diff --check` 通过；未改素材、依赖、门禁阈值或写集外文件。
- 身体遮罩 shader：通过 —— `uHideMap`、`uHideMapOn` 与区域 `uHideMask` 独立共存；使用原始 `vUv`、红通道 `> 0.5` 丢弃；固定 program cache key，并同步处理可选 `customDepthMaterial`。
- 独立遮罩合成：通过 —— 不再依赖 2048² 身体底图尺寸；按参与遮罩最大边长建立画布，将不同尺寸遮罩平滑缩放后逐像素取最大值。纹理设置为 `NoColorSpace`、`flipY=false`、线性过滤、无 mipmap。
- actor 生命周期与缓存：通过 —— 穿脱装备会重算有序遮罩集合；缓存键包含模板、body URL、遮罩 ID/URL/声明尺寸；跨 actor 引用计数、竞态结果、最后引用和销毁路径均有释放处理。空集合关闭 shader 分支，默认开关开启，`update(dt)` 未增加每帧合成或集合分配。
- 异步错误处理：通过 —— 同步 `unequip` 对后台 Promise 显式 `.catch`；失败写入 `stats().hideMapError`、执行 `console.warn` 并关闭旧遮罩，没有未处理 rejection。
- 挂头与肤色：通过 —— `kind: 'head'` 复用蒙皮骨名重映射和显式 bindMatrix；新头替换旧头，IBM 不变；`hideRegions` 正常参与位掩码，`skinTint` 乘原身体颜色，卸头恢复。`setHead` 调用闭包 `equip`，解构调用安全。
- 素材索引：通过 —— 主件及 `fits` 变体均读取并发布 fit 所指 PNG，索引条目携带 `hideMask` URL；`head` 分组及 fit URL齐全；真实坏 JSON继续抛错。`content-plugin.test.ts` 仅将桩 fit 内容改为合法 JSON。
- 预览页：通过 —— “换装 v2”加入头分组和身体遮罩开关；模板切换优先选择对应变体、缺失时回退主件并恢复已穿装备；`window.__dressup` 暴露 `hideMap`、实时 `hideMapError` 和 `hideMapSize`。
- 自动测试覆盖：通过 —— 覆盖 2048 身体底图配 1024/512 遮罩、max 并集、纹理参数、缓存共享和释放、竞态、开关、失败重试、解构挂头、单头替换、肤色恢复以及 PNG 实际尺寸与 fit 声明一致。
- 超时与分配门禁：通过 —— Python 工具调用保持 300 秒上限，没有跳过用例或放宽断言；分配采样逻辑、采样窗口和判定阈值未被本任务改变。
- 禁区与工程约束：通过 —— 未使用包围盒配对、`HeadTop_End`、固定 Neck 偏移、`bone.scale`、跨骨架动画混用、Blender或新依赖；运行时仍由 `import('@tianshu/render/dressup')` 动态加载。
- 检查与体积：通过 —— 执行日志记录 `pnpm check` 退出 0，共 187 个文件、1331 项测试通过，game 构建及内容门禁通过；render 主块保持 166.66 KiB，`render-dressup` 为 5.90/24 KiB。报告中的独立 render 包失败来自额外收集的 rig 性能项目，按最新协调者裁定不属于本任务闸门；本审核环境的聚焦复跑因只读沙箱禁止写 `.vite-temp` 未能启动，并非断言失败。
- 浏览器验收：通过当前任务要求 —— 报告已列出三模板 idle/walk/run、遮罩开关、领口/袖口/衣摆、换头/卸头、错误与尺寸状态的完整验收步骤；依据 17:20 裁定，真实 G1/D1 素材合入后的浏览器实测由协调者统一执行，不是本任务合入闸门。
- 报告：通过 —— 七节齐全，共 45 行，记录了 API、合成/缓存、shader、体积、现存依赖和浏览器交接步骤。

## 需作者确认

无。