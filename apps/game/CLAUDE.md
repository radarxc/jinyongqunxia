# @tianshu/game

Vite + Vue 装配与发布层。这里创建 CoreHost、把事件投影到 UI、驱动渲染和场景切换；不得复制 core 规则或把可写状态交给 UI。core 默认模块 Worker，失败时才回退主线程。Three 场景必须动态加载，内容按书界动态加载；交付前跑 `pnpm size`。
