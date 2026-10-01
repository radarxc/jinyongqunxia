# 本任务：游戏工程 · core 随机数整数化修复（ENG-00 遗留：`intInclusive()` 用了浮点）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/core/CLAUDE.md`。

## 背景

`docs/tech/05-gameplay-engine.md` §4.4：core 零浮点。ENG-01-storage 合入前审核发现 `packages/core/src/rng/index.ts` 的 `intInclusive()`（第 56 行附近）用浮点除法 / 乘法做区间缩放，属于 ENG-00 脚手架遗留，ENG-01 无权改 core，故另开本任务。

## 要做的事

1. 把 `intInclusive(lo, hi)` 改为精确整数运算，且**每次公开抽样只消费一次 `nextU32()`**：用 32×32→64 位乘法取高 32 位（把 32 位数拆成两个 16 位半字做乘加，全程在安全整数范围内，不用 BigInt 也不用浮点），`span = hi - lo + 1`，结果 `lo + ((u32 * span) >> 32)`；`span = 2^32` 时直接返回 `lo + u32`。
2. 测试：跨度 1、2、2^32；`u32 = 2147483647 / span = 2147483649` 的舍入边界；每次抽样恰好消费一次 `nextU32()`；tech/05 §4.2 的 PCG32 测试向量仍通过；分布粗检（1e5 次抽样，各桶偏差 < 2%）。
3. 抽样映射变了：按 tech/05 §4.2 / §4.6 提升 `rngProtocol` 版本并更新相应 golden fixture；写进 `packages/core/CLAUDE.md` 的变更记录。
4. 在 core 的 eslint 规则里确认浮点运算禁令覆盖 `/` 与 `Math.floor(x / y)` 这类写法（若规则漏网，补规则；别的现有违规只列报告不改）。

约束：只改 `packages/core/**`；不改接口签名；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：新算法与边界测试结果；`rngProtocol` 版本号；eslint 规则是否补充；其余发现的浮点用法清单（不改）。报告 ≤ 60 行。
