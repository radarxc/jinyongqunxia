# tools/imagegen · 用 Gemini 网页（作者的 Pro 订阅）出图

2026-10-01 起的出图路线（作者：Codex 额度没了；Gemini API 生图无免费层；改用订阅网页版）。每张图约 20 秒出图，不花 API 费用。

## 一张图的步骤（Claude in Chrome）

1. 打开 `https://gemini.google.com/images`，用 `javascript_tool` 注入 `gemini_driver.js` 全文（站内跳转不丢；整页刷新后重注入）。
2. 提示词：`python3 tools/imagegen/gemini_prompt.py <asset_id>` 输出 JSON 字符串（取 `assets/default/prompts/**/<asset_id>.md` 的「提示词」节，去掉参考图句子，加写实画风说明与排除项）。
3. `await __gem.submit(<JSON 字符串>, { template: 'Oil painting', aspect: '1:1' })`（作者：不上传参考图、选 Oil painting 模板）。
4. `await __gem.waitImage(35000)`；`ok:false` 就再调一次；页面停在空的 `/app` 时 `await __gem.openLatestChat()`。
5. 看图（点开大图后 `computer zoom`）；合格则 `await __gem.download()`（需作者同意下载），文件落在 `~/Downloads/Gemini_Generated_Image_*.png`。
6. 入库：移到 frontmatter 的 `output` 路径，manifest 追加条目（`tool: gemini-web · Nano Banana（Oil painting 模板）`、`model: gemini-app-pro`、`source_path`、`prompt`、`size`、`sha256`、`status: candidate`）。
7. 透明底素材（角色部件等）：提示词要求浅暖灰 RGB(230,225,216) 均匀底，下载后 `python3 tools/imagegen/key_background.py in.png out.png` 抠透明（复用 `tools/item/common.remove_background`）。

## 坑

- `javascript_tool` 单次调用 45 秒超时：提交与等图分两次调用。
- 模板卡列表延迟加载，`pickTemplate` 最多等 20 秒；侧栏有隐藏的重复链接，判可见用 `getClientRects()`（fixed 元素 `offsetParent` 为 null）。
- 页面版生成图 1024×1024；下载的完整尺寸以实际文件为准。
- 订阅有每日生图上限，触顶时页面会提示，次日继续。
