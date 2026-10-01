# @tianshu/ui

Vue 3.5 DOM 覆盖层，只响应 Pinia `shallowRef` 中的裁剪投影，并通过 `uiBus` 发命令意图。禁止保存或直接修改 `GameState`、重算玩法规则、依赖 Three。内容对象用 `markRaw`；列表优先 `v-memo` / 虚拟化；交互最小点击区 44 px，横屏优先，文案最终必须走 i18n 键。
