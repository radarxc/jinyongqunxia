# 天书录 · 沉浸式界面样稿第三版

打开 [index.html](index.html) 可切换 **1280×720 / 390×844 / 并排对照**；[scene.html](scene.html) 随实际窗口宽度重排。画板按原尺寸展示，审阅窗口较窄时，大画板在外层横滚。

## 1. 浏览与本版变化

- 按 AR-50，底部六工具、顶部三场景、合卷 / 快捷入口与战斗四动作只显示图标；名称在鼠标悬停或键盘聚焦时浮现，浅晕、无框、无黑底。每个入口有 `aria-label`、石青焦点线，热区至少 44×44 px。
- 导航用原生锚链接：Tab / Shift+Tab 到每个入口、Enter 切屏；动作预览用原生单选，方向键 / Space 切朱点。银锭可点按 / Enter / Space 展开精确值，中文余额常驻。
- 按住 450 ms 的浮字由 CSS `:active` 演示；完整长按识别、松手不激活、移动取消，以及双指缩放 / 七格放大点选均交 ENG，静态样稿未实现。不要把松手后的原生点击当成生产长按契约。
- 战斗由第二版 10 格扩为 153 格：桌面格宽×高 41.57×48，手机 31.18×36；人物 20×36 / 15×27，像高为格高 75%。台地、浅溪、断墙、碎石、柳、竹、草簇与花灌木消费 `design/08` 的既有地形含义。
- 大地图、城镇、行囊、人物、图鉴等保留第二版内容和版式，仅调整按钮；对话、金额、资源、地名、题记与标题仍有文字。审阅壳尺寸控件有字，属于评审工具。
- 本稿合卷固定回大地图；四动作只切外观选中，不结算行动；分类、装备与设置值是陈列。没有生产返回栈、数字键、Esc、过滤、交易或存档写入。
- 纯 HTML/CSS（场景内联 SVG），无应用 JavaScript、无构建；仅沿用 Google Fonts 标题 `text=` 子集请求。断网使用系统宋体 / 楷体回退，无新增字体文件。

完整契约见 [design/26](../26-immersive-ui.md) §3.5、§4.8.1–§4.8.2；16 件原图标及 8 件新增库内缩图见 [ASSETS](ASSETS.md)。未改图标母版，未生成临时位图。

## 2. 两种尺寸的真实截图

截图由 macOS 系统 WebKit `WebView` 渲染同份 `scene.html` / `style.css`，本地图片与 CSS 在内存中内联，阻断远端字体，故为 **系统字体回退**。PNG 仅转同像素尺寸 WebP；每张搜索 ≤88 的最高整数 quality，使替换 / 新增截图也 ≤40,000 B，具体质量与字节见 `verification.json`。无重画、缩小截图或拼贴冒充浏览器渲染。

| 屏幕 | 1280×720 | 390×844 |
|---|---|---|
| 大地图 | [横屏](img/review-map-1280x720.webp) | [竖屏](img/review-map-390x844.webp) |
| 城镇对白 | [横屏](img/review-town-1280x720.webp) | [竖屏](img/review-town-390x844.webp) |
| 战斗 | [横屏](img/review-battle-1280x720.webp) | [竖屏](img/review-battle-390x844.webp) |
| 行囊 | [横屏](img/review-bag-1280x720.webp) | [竖屏](img/review-bag-390x844.webp) |
| 武学 | [横屏](img/review-martial-1280x720.webp) | [竖屏](img/review-martial-390x844.webp) |
| 人物 | [横屏](img/review-character-1280x720.webp) | [竖屏](img/review-character-390x844.webp) |
| 图鉴 | [横屏](img/review-codex-1280x720.webp) | [竖屏](img/review-codex-390x844.webp) |
| 江湖志 | [横屏](img/review-journal-1280x720.webp) | [竖屏](img/review-journal-390x844.webp) |
| 系统 | [横屏](img/review-system-1280x720.webp) | [竖屏](img/review-system-390x844.webp) |

[verification.json](verification.json) 记录源 hash、引擎、18 张截图及两尺寸九屏几何检查：单屏可见、无水平溢出、阅读区不压底栏、入口命名 / 常态文字隐藏 / 聚焦可达 / 点击域≥44×44、图像解码、153 格与 75% 人格比。重复随截图执行的九屏检查不计为额外用例。地形、单位与水纹含 22 个 SVG image，58 个 HTML img；桌面完整格 153，手机 104（不扣树冠遮住的部分，按格包围盒是否完整进入视口计）。

限制：该截图宿主无法获得活动窗口焦点，`activeElement` 与 CSS 焦点规则已检查，**原生 `:focus-visible` / hover 的实际显隐未在此工具验收**；须在可聚焦的 Safari / Chrome 复验。延续第二版的在线书法字体、150% 字号、读屏、真机触控与游戏性能待实测；本轮未再尝试下载或启动 Chromium。压缩截图供布局审阅，细纹与字体边缘以直接打开 HTML 为准。

## 3. 数据边界

银两示例 `1,280,000 文÷1,000=1,280 两`，HUD 写“一千二百八十”及单位“两”，展开可读“一百二十八万文”；不是开局预算。格式规则见 design/26 §5.3，精确交易金额不得截短。

资源 `84/100=84%`、`68/100=68%`、`92/100=92%`，气势 `36/100=36%`；先天八项的 60 不是配点建议。十一槽沿 `design/10` §3.1，青钢剑 grade=3 沿物品名录。对白和题记为原创演示。溪岸旧垣是原创综合拼景，不新增地理 / 剧情 ID，林木与花草不能当作白马张掖的植被考据；正六角图不替代生产斜 45° 投影。

## 4. 复现检查

```sh
python3 tools/lint/check_ids.py --strict
python3 - <<'PY'
from pathlib import Path
root = Path('docs/design/ui-mock')
files = [p for p in root.rglob('*') if p.is_file()]
size = sum(p.stat().st_size for p in files)
print(f'{len(files)} files; {size:,} B; {size/1_000_000:.3f} MB')
assert size <= 4_500_000
icons = list((root/'img').glob('ui_*.webp'))
terrain = list((root/'img').glob('terrain-*.webp'))
reviews = list((root/'img').glob('review-*.webp'))
assert (len(icons), len(terrain), len(reviews)) == (16, 8, 18)
assert all(p.stat().st_size <= 40_000 for p in icons + terrain + reviews)
PY
du -sk docs/design/ui-mock
```

[capture.m](capture.m) 头部给出编译与单屏命令，[verify.js](verify.js) 是它读取的验收断言；页面不加载两者。截图后转同尺寸 WebP，删除临时 PNG / 二进制，不把编译缓存带入目录。
