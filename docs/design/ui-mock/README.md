# 天书录 · 沉浸式界面样稿第二版

打开 [index.html](index.html) 可切换 **1280×720 / 390×844 / 并排对照**；[scene.html](scene.html) 随实际窗口宽度重排。画板按原尺寸展示，不把整幅桌面界面缩小成手机图；审阅窗口较窄时，大画板在外层横滚。

## 1. 浏览与范围

- 顶部场景签：大地图、城镇对白、战斗；底部六工具：行囊、武学、人物、图鉴、江湖志、系统。九屏均为静态方向稿。
- 点签切屏；键盘 Tab 聚焦当前原生单选项，方向键换屏。银两可点按 / Enter / Space 展开精确值，焦点为石青双短线。
- 本稿“合卷”固定回大地图；不实现生产返回栈、数字快捷键、Esc、物品过滤、交易、战斗结算或写入存档。分类和动作陈列用普通文本，没有假按钮。
- 纯 HTML/CSS、无应用 JavaScript、无构建；仅沿用 Google Fonts 标题 `text=` 子集请求。断网使用系统宋体 / 楷体回退；不新增字体文件。
- 去掉第一版地名方牌、深色工具板、队伍黑条、卷轴框、物品格框与夜读黑底。以浅纸晕染、浮字、朱砂点、成品器物和留白组织界面。旧物品图仅用 CSS 提亮 / 淡边融入纸面，立绘淡边配浅晕，源文件不改。

完整设计、字体管线、数值格式与后续实现契约见 [design/26](../26-immersive-ui.md) §3–§10；16 件 Codex 成品图标的 ID、来源与字节见 [ASSETS](ASSETS.md)。全部仍为候选素材，不代作者批准。

## 2. 两种尺寸的真实截图

截图由 macOS 系统 WebKit `WebView` 渲染 `scene.html` 与 `style.css`，像素尺寸逐张核验；只将本地图片 / CSS 在内存中内联以避免沙箱资源加载限制，主动阻断远端字体，**截图显示系统字体回退效果**。没有重画页面、缩放截图或用合成图假装浏览器结果；PNG 截图仅转 WebP quality=88/method=6，原像素尺寸不变。

| 屏幕 | 1280×720 | 390×844 | 检查说明 |
|---|---|---|---|
| 大地图 | [横屏](img/review-map-1280x720.webp) | [竖屏](img/review-map-390x844.webp) | 地名无方牌；浮置六工具；银两中文；手机保留当前队员三资源 |
| 城镇对白 | [横屏](img/review-town-1280x720.webp) | [竖屏](img/review-town-390x844.webp) | 人物边缘淡出；对白无轴头、黑底和框；姓名与正文可读 |
| 战斗 | [横屏](img/review-battle-1280x720.webp) | [竖屏](img/review-battle-390x844.webp) | 时间轴、落点摘要、动作列分置；六角仅为场景示意 |
| 行囊 | [横屏](img/review-bag-1280x720.webp) | [竖屏](img/review-bag-390x844.webp) | 器物不套格框；手机三列；详情在同一区域向下滚动 |
| 图鉴 | [横屏](img/review-codex-1280x720.webp) | [竖屏](img/review-codex-390x844.webp) | 图像与题记分栏；五类册目完整露出 |
| 人物 | [横屏](img/review-character-1280x720.webp) | [竖屏](img/review-character-390x844.webp) | 立绘、八属性、三资源、十一槽；手机纵滚读全 |

[verification.json](verification.json) 记录两尺寸的九屏布局检查：单屏可见、根页面 / 阅读区无水平溢出、可见点击标签与银两摘要均至少 44×44、阅读区不压底栏、46 个图像元素全部解码、`:has()` 支持。九屏检查随每张截图重复执行，不把重复轮次虚报为新用例；六屏各两张，共 12 张截图。手机六工具每项 60×82，桌面每项 76×90；原生面板纵滚保留。

限制：Chromium 在本环境因 Mach 服务权限启动失败；WKWebView 的进程 / 资源服务亦不可用，故使用系统进程内 WebKit。本次截图与布局检查不能代替现代 Safari / Chrome、真实触屏、屏幕阅读器、150% 字号、在线书法字体和游戏性能验收。纯色正文 / 次字 / 朱字对浅纸为 11.33 / 5.76 / 5.88:1，对温纸为 9.37 / 4.76 / 4.86:1；动态场景的实际合成对比度仍交 ENG 复核。

## 3. 数据边界

银两示例 `1,280,000 文÷1,000=1,280 两`，HUD 写“一千二百八十”及单位“两”，展开可读“一百二十八万文”。这是排版样例，不是开局预算。格式规则含补零与超长向下截短，见 design/26 §5.3；精确交易金额不得截短。

资源示意为 `84/100=84%`、`68/100=68%`、`92/100=92%`，气势 `36/100=36%`；先天八项的 60 不是推荐配点。十一槽沿 `design/10` §3.1，青钢剑上品标签沿 `catalog/items-weapons.md` 的 grade=3；其余不自行推断数值。图鉴 / 对白短笺为原创演示，不冒充原著引文。地图是参考画，地名位置与路线不作为正式坐标。

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
assert len(icons) == 16 and all(p.stat().st_size <= 40_000 for p in icons)
PY
du -sk docs/design/ui-mock
```

可选截图工具 [capture.m](capture.m) 的头部列出 macOS 编译与单屏命令。它只在验收时执行；页面不加载该文件，不需要编译它才能看样稿。截图后压成同尺寸 WebP 并删除临时 PNG / 二进制，不把编译缓存带入目录体积。
