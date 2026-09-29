# assets · 素材风格包（mod）

本目录存放入库的二进制素材与其元数据。作者决定（2026-09-29）：**二进制素材入库**，在仓库内按风格包分目录存放并提交（取代 `docs/tech/07` §6.1 / §6.2"二进制永不进 Git"的旧口径，待文档任务同步）。

## 目录约定

```
assets/
├─ README.md                 # 本文件：风格包约定
└─ <style>/                  # 一个风格包 = 一个 mod；当前只有 default
   ├─ STYLE.md               # 风格要求（作者原文 + 各类规则展开）
   ├─ prompts/<类别>.md       # 各类提示词模板（生成时读取）
   ├─ baseline/<类别>/        # 基线参考：每类 1–2 张，作者审批后作为后续生成的参考输入
   │  ├─ manifest.yaml       # 逐张元数据（见下）
   │  └─ <asset_id>.png
   └─ <类别>/…               # 正式素材（基线审批通过后再批量生成）
```

- 类别：`map` 地图、`town` 城镇、`building` 建筑、`character/male` 男性人物、`character/female` 女性人物、`vfx` 招式、`item` 物品、`meridian` 经脉图等（"其他"类）。
- 新增风格包（mod）时，复制 `default/` 的结构，另写 `STYLE.md` 与 `prompts/`；运行时按所选风格包取素材。
- 素材 ID 沿用 `docs/tech/07` §1.4 前缀规范（如 `ref_` 基线参考、`por_` 立绘、`bld_` 建筑、`vfx_` 特效、`ico_` 图标、`map_` 地图）。

## manifest.yaml 字段（每张一条）

`id`、`file`、`category`、`style`（风格包名）、`subject`（画的是什么，含书界 / 年代）、`prompt`（完整提示词）、`negative`（排除项）、`references`（参考输入列表；基线为空）、`tool`（如 `codex exec · image_gen`）、`model`、`effort`、`created`（ISO 时间）、`source_path`（生成工具原始保存位置）、`size`（宽×高）、`sha256`、`status`（`candidate` / `approved` / `rejected`）、`notes`。

## 生成工具

本地 Codex CLI（ChatGPT.app 自带）：`/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex`，模型 `gpt-6-astra`，推理强度 `ultra`，内置 `image_gen` 工具；原图默认保存在 `~/.codex/generated_images/…`，须复制进本目录并登记 `source_path` 与 `sha256`。
