ENG-worldmap-painted-2d · AR-111
状态：实现已交付，验收未全绿；指定测试有 2 项写集外依赖失败。
改动行数相对本任务开始时的主检出快照统计（保留原有未提交改动）；+新增 / -删除，括号内为文件总行数：

- `apps/game/src/pages/WorldMapPage.vue`：+473 / -323（817 行）。
- `apps/game/src/worldmap/painted-view.ts`：+139 / -0（139 行）。
- `apps/game/src/worldmap/painted-view.test.ts`：+178 / -0（178 行）。
- `apps/game/src/runtime/worldmap-texture.ts`：+8 / -0（8 行）。
- `apps/game/src/runtime/worldmap-texture.test.ts`：+18 / -0（18 行）。
- `apps/game/src/projection.ts`：+2 / -6（119 行）。
- `apps/game/src/runtime/session-projection.ts`：+2 / -6（115 行）。
- `apps/game/src/runtime/worldmap-page.test.ts`：+389 / -86（407 行）。
- `apps/game/build/asset-manifest.ts`：+3 / -2（144 行）。
- `apps/game/build/asset-manifest.test.ts`：+31 / -0（87 行）。
- `tools/agents/reports/ENG-worldmap-painted-2d.md`：新建，33 行。

坐标与夹边：`painted-view.ts` 的 gridToImage/imageToGrid/gridToScreen/screenToGrid、clampView、zoomAt、panView、centerOnGrid、resizeView；cover=max(vw/W,vh/H)，s∈[cover,4cover]。
视口变化保留中心网格点后重夹；指针缩放先算不动点，双指平移与缩放合并后只夹一次；默认 z=1.6、滑杆 1—4。
零空闲逐帧：页面 queueFrame/paintFrame 仅响应变化，最多挂一个 rAF；仅 200ms 跟随缓动续帧，结束即停；保留且仅保留 scheduleStep 的行程 timeout。
变换只写 map-painted-plane 一个 style.transform；道路用 SVG g 属性；标签 shallowRef + 输入比较，同帧最多重算一次，悬停/文案变化不重算。
标签优先级：选中/当前所在/目的地同档 > 本时代且两端开放的路段连通度 > 城镇 > 遗迹 > id 字典序；低优先级碰撞标签隐藏。
标签框 max(44, Unicode 字数×13+6)×22px；图标22px居中节点，文字框顶端 y+13；去掉（待考）/(待考)及地区所指治所/所指治所。
页面保留行路笺与全部行程按钮/scene事件，补滚轮、双指/Safari、6px拖动阈值、28px拾取、定位/跟随、64px主角立牌与朱砂目的地环。
图片 naturalWidth/naturalHeight 驱动换算，比例偏差>0.5%或失败显示单行提示并使用纸底；DEV 调试句柄冻结快照，卸载清监听器/observer/timeout/rAF。
检查 1：`pnpm exec vitest run --config vitest.workspace.ts --project node apps/game/src/worldmap apps/game/src/runtime apps/game/build`
原样结果：`Test Files  1 failed | 16 passed (17)`；`Tests  2 failed | 127 passed (129)`；退出码 1。
失败均来自未修改的 `apps/game/build/dressup-assets.test.ts` 两条 GLB 打包用例；`tools/model3d/dressup/pack_glb.mjs` 报 `ERR_MODULE_NOT_FOUND: Cannot find package 'meshoptimizer'`。
检查 2：`pnpm typecheck`；实际执行 `vue-tsc -b --pretty false`，退出码 0，0 项类型错误。
检查 3：`pnpm exec eslint --max-warnings 0 apps/game/src/pages/WorldMapPage.vue apps/game/src/worldmap/painted-view.ts apps/game/src/worldmap/painted-view.test.ts apps/game/src/runtime/worldmap-texture.ts apps/game/src/runtime/worldmap-texture.test.ts apps/game/src/projection.ts apps/game/src/runtime/session-projection.ts apps/game/src/runtime/worldmap-page.test.ts apps/game/build/asset-manifest.ts apps/game/build/asset-manifest.test.ts`
原样结果：无输出，退出码 0（0 错误 / 0 警告）。地图纯函数与页面专项 36/36 通过；素材选择/投影5项、构建清单3项通过。
与 tech/13 的实现取舍：道路 d 按512×384网格缓存，额外 SVG 内层 g 乘 W/512、H/384 转为图像像素，外层仍 translate(tx ty) scale(s)。视觉坐标等价，图片载入也无需重建路径。
未验证：1920×935/390×844 浏览器截图；5173 端口实际 connection refused，常驻浏览器桥中无该游戏页；尺寸、夹边与空闲5秒零rAF已由测试覆盖。
正式水墨素材由出图线同名替换；未改资产、依赖、门禁和写集外源码，未执行改变 git 状态的命令；全量 pnpm check 按任务约定交协调者。
