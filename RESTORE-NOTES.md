# 覆盖前默认分支的独有内容（2026-10-13 存档）

## 背景
- 10-13 作者决定以 `claude/vigilant-wright-2unuk1` 覆盖默认分支 `claude/jinyong-online-game-design-jko1v9`（PR #4）。主干上的合并提交 b0dfca92e 用了 `-s ours`，文件内容与主干 39d5016cf 完全一致。
- 本分支 = 覆盖前默认分支的最新提交 7481a3be6，加上这份说明和 `RESTORE-LISTS/` 三份清单。用途：在别的机器上挑出要找回主干的内容。
- 分叉点 3c7d4b2af（10-04 17:41）。默认分支独有 3,465 个提交，主干独有 3,900 个。

## 三份清单（`RESTORE-LISTS/`）
| 文件 | 条数 | 含义 |
|---|---|---|
| `only-in-default.txt` | 1,679 | 主干里不存在的文件：yaml 796、md 220、png 214、svg 208、jpg 207、ts 9 等 |
| `default-only-changes.txt` | 754 | 非素材文件，分叉后只有默认分支改过、主干没动、内容不同。覆盖后直接丢，是找回的重点 |
| `both-changed.txt` | 424 | 非素材文件，分叉后两边都改过且结果不同。要逐个比对，主干的版本多半更新 |

素材（`assets/**`、图片、GLB）不在后两份清单里。原因是默认分支 dead0f55c 把 12,663 个素材改成了 Git LFS 指针，两边绝大多数素材“不同”只是存法不同。要核实内容是否真的不同，比较 LFS 指针里的 `oid sha256` 与主干文件的 sha256。

## 来源提交
| 内容 | 提交 | 主要路径 |
|---|---|---|
| 城镇布局 7 批（当时标“未经复审”） | ch01-b 74c580ac6、ch01-c 63d384302、ch01-d 0648666dd、ch01-g d0c35cec3、ch02-a 777956366、ch02-b 106c023cd、ch02-c deb4ba501 | `docs/design/town/{history,progress}/`、`assets/default/town/city_*`、`tools/agents/reports/CITY-layouts-*.md` |
| 地图合成改版 TOOL-map-compose | 6a0e90954 | `tools/map/compose/**`、`assets/default/map/composed/` |
| 3 个 wip（当时未跑 pnpm check） | ch00-encounter-wiring 90261a0f7（合并 ca17832c8）；dialogue-runtime-lazy c262b8c6f（合并 37e9ee008）；move-onhit-effects 97f1b4ed4（合并 7481a3be6） | `apps/game/src/runtime/encounter-runtime.ts`、`packages/core/src/dialogue/intent-actions.ts`、`packages/core/src/event/quest-actions.ts`、`packages/data/src/schemas/{buff,time-window}.ts`、`content/common/buffs/bf_*.yaml` 等 |
| DEV-SPEC 开发规格索引 | 547083e03（PR #2，ac807e7ab） | `docs/tech/DEV-SPEC.md` |
| AGENTS 说明 | 750960782 | `AGENTS.md` |
| 全部工作并入默认分支、素材改 LFS 指针 | b5fe70455（PR #1，517f0125f）、dead0f55c | `.gitattributes`（LFS 规则） |

## 在别的机器上怎么处理
1. 本分支的 png / jpg 是 LFS 指针。先 `git lfs install`，在本分支的检出里拉真文件：
   `git lfs pull --include="assets/default/town/**,assets/default/map/composed/**,docs/design/town/**"`
   GitHub LFS 下载有流量额度。
2. 主干不用 LFS。往主干搬图片时，复制拉下来的真文件提交，不要带 `.gitattributes` 的 LFS 规则；否则主干上已有的普通图片会被当成“应该是指针”。
3. 文本文件可以在主干检出里直接取：`git checkout claude/restore-from-default-20261004 -- <路径>`。
4. 看某个来源提交改了什么：`git show --stat <提交>`。wip 三项还改了两边都有的文件，在 `both-changed.txt` 里，要连同原提交一起看。
