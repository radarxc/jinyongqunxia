# 世界数据

`navigation/` 是 `design/19` 权威地图源的构建镜像；`regions/<rg_id>/<sc_id>.tmj` 是区域内可行走场景，两者不得混为第二事实源。地图转换产物按书界进入 `chNN.rules.<region-token>.json`，跨时代底图进入 `world.rules.region.<region-token>.json`；其中 `<region-token>` 是把 `rg_id` 下划线改为连字符所得的逻辑名片段（例如 `rg_jiangnan_taihu` → `rg-jiangnan-taihu`），manifest 的 `region` 字段仍保留原 ID。
