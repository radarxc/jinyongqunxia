# 本任务：素材管线 MVP——`tools/aigc`（Python 包 `tsgen`）、资产登记库、Blender 8 向渲染脚本、打包到清单

`tech/07` §6 的最小集合（作者决定 P02：只接 TraeX `image_generation` 与人工导入，不接 ComfyUI / 本地模型 / 租卡）：登记库 + 请求 / 导入 + 状态机 + Blender 渲染 + 图集 / KTX2 / WebP 打包 + manifest。图像**生成**本身在 T4b 做；本任务交付工具与流程，并用占位图（程序生成的灰模 / 线稿）证明全链路可跑。

## 必读

- `docs/tech/07-asset-generation.md` §1.3–§1.4（规格与资产 ID）、§5.4（精灵 3D 中转与 Blender 渲染脚本要求：8 向正交、颜色 + 视空间法线 + 可选深度、事件、轮廓排除；先通过 AST 静态检查再在 Blender 4.5 LTS 执行）、§5.5–§5.6（材质 / 图标模板）、§6（目录、存储分层、提示词模板 YAML、登记库字段 `AssetEntry`、状态机与 stale 传播、批处理片段、审核清单）、§7.4（金样本回归 30 条）。
- `docs/tech/06-asset-storage.md` §3（`AssetKey`、清单 schema、`assets.lock.json`）、§4（格式：KTX2 UASTC/ETC1S、WebP、AAC、H.264；工具命令 `ktx create`、`sharp`、ffmpeg）、§5（构建流程：源 → 校验 → 转码 → 打包 → 哈希 → manifest）。
- `packages/spec/iso-camera.json`、`sprite-spec.json`（T0）；`packages/data/src/schemas/asset-entry.ts`（T2 若已定义则以它为准并导出 `asset.schema.json`；未定义则由本任务在 `packages/data` 补上并导出）。
- `docs/design/05-martial-arts-system.md` §14（1,138 武学 → 图标需求由 `tsgen icons plan` 从图鉴表生成，不手写名单）。

## 至少实现

1. `tools/aigc/`：`pyproject.toml`（uv，Python ≥ 3.11；依赖只用 Pillow、numpy、PyYAML、pydantic、typer、jinja2、rectpack；`bpy` 只在 Blender 内）、`package.json`（`"tsgen": "uv run tsgen"`）、`tsgen/cli.py`：`doctor`（检查 Blender、ktx、ffmpeg、uv 环境并给出缺失项；**缺失只报告不报错，退出码 0**，只有 Python / uv 自身损坏才非零）、`registry check`（schema 校验、`inputs@version` 依赖图、stale 传播）、`plan icons --catalog docs/design/catalog/skills-*.md`（1,138 条需求）、`generate-request --provider traex --type <t> --subject <id> --n N`（生成可审阅的请求 YAML，不调用任何服务）、`import-candidate <file> --request <req.yaml>`（写 provenance、哈希、iTXt 元数据，进入 `draft`）、`review` / `approve`（只改状态并记录，`approve` 要求 `--by` 参数且默认拒绝 AI 调用者）、`render-sprites --job <yaml>`（调用 `blender -b`；无 Blender 时 `--dry-run` 只生成 job 与命令行）、`pack sprites|portraits|icons`（图集、法线、WebP、KTX2 via `ktx create`，缺工具时 WebP 回退并标记）、`manifest`（按 tech/06 §3 生成 `manifest.json` + `assets.lock.json`）、`tile-check`、`normal-from-height`、`contact-sheet`。
2. `tools/aigc/blender/render_sprites.py` + `lib/`（相机从 `iso-camera.json` 读；8 向；颜色 / 法线 / 深度 pass；`events_at`；轮廓排除；输出帧元数据 `tipPx / hitPx / headPx / depthBiasM`）；`python3 -m py_compile` 与 AST 检查通过；若本机有 Blender 4.5 LTS，用内置立方体 + 人形骨架跑一次 8 向金样并入库结果哈希，没有则 `--dry-run` 并在报告标（待实测）。
3. `content/assets/registry/`：`asset.schema.json`（生成物）、`global/{ui,vfx,anim,kit}.yaml`、`ch01/{ref,model,portrait,sprite,cg,icon,terrain,building,audio,video}.yaml` 骨架，各含 1–2 条占位条目（`status: todo`）。
4. `tools/aigc/prompts/`：`style.yaml`（三档风格片段，版本号）、`era.yaml`（五朝服饰片段）、`negatives.yaml`、`blacklist.yaml`（演员名 / 版权画作关键词）、`characters/pc_main_m.yaml`、`pc_main_f.yaml`、`npc_duanyu.yaml`、`npc_wuliang_disciple.yaml`（杂兵）、`icons/skill.yaml`；`review/checklists/portrait.v1.yaml`、`sheet.v1.yaml`、`icon.v1.yaml`。
5. 端到端占位演练：用程序生成的占位 PNG 走 `import-candidate → review → pack → manifest`，产物写到 `art/runtime/`（git 忽略）并把 manifest 摘要（键、哈希、字节）写进报告。
6. 测试：`pytest`（≥ 30 条：schema、状态机、stale 传播、请求渲染、黑名单拦截、图集打包、manifest 双射、`AssetKey` ↔ id）。

## 验收标准（亲自运行）

- `uv run --directory tools/aigc pytest -q` 通过；`uv run --directory tools/aigc tsgen doctor` 能运行并如实列出缺失工具；`uv run --directory tools/aigc tsgen registry check` 对骨架登记库通过。
- `pnpm content:validate` 仍通过（登记库纳入校验）；`packages/spec/generated/asset.schema.json` 与 Zod 无漂移。
- 报告第 6 节：T4b 的操作顺序（先 `generate-request`，生成后 `import-candidate`，再 `contact-sheet`）与每类资产的规格阈值。
