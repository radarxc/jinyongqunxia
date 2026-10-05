# 本任务：内容 · 序章 ch00 三场遭遇（竹林、白猿切磋、边道）

本任务写遭遇数据，**不写引擎代码**。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `content/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-26-encounter-builder.md`：`encounter.v1` 的写法、特殊条件与脚本节拍，必须照做；
- 报告 `CONTENT-ch00-data.md`（人物、角色槽、招式 ID）、`CONTENT-ch00-maps.md`（战场 ID）；
- 设计 `docs/design/chapters/00-yuenv.md` §5.1–§5.4。

## 为什么做

序章三场战斗要能从内容开出来，M1 闸门要求序章完整通关。

## 范围

- **`enc_00_zhulin`**：剧情战，输了重试；战场约 61 格；
  - 阿青在玩家气血 < 45% 时出手；
  - 连输 3 次后演示。
- **`enc_00_baiyuan`**：切磋；击中一次或坚持 2 回合即胜；认输也推进；留桃可跳过（O05：消耗 `it_tao`）。
- **`enc_00_biandao`**：剧情战，`lethalIntent=false`，允许留手；一名越兵 AI 同伴；战场约 91 格。
- D1 倍率只乘气血与攻击，取 0.90；三档难度照 design/13。
- 战场引用 CONTENT-ch00b 地图里的 BattleArena；站位与朝向照设计。

约束：
- 写集：`content/chapters/ch00_yuenv/encounters/**`。写集外的改动在提交时会被丢弃。
- 不改 `packages/**`、`apps/**`、`docs/**` 与其他内容目录。schema 不够用就在报告里写明。
- 每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm content:validate`
- `pnpm content:build`
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 三场遭遇的参战者、战场、条件与节拍表；
- 与设计的出入。

报告 ≤ 40 行。
