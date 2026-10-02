# 本任务：游戏工程 · 存档正式化（TSAV v1、每槽三代与损坏回退、JSON / TSAV / ZIP 导入导出）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/platform/README.md`、`apps/game/CLAUDE.md`；
- ENG-01 / ENG-07 的报告 `tools/agents/reports/ENG-01-storage.md`、`ENG-07-ui-panels.md`。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.3 离线行与 §3.5「离线 / 存档」闸门要求：IndexedDB 本地三代档，单档 JSON / TSAV 与全部 ZIP 导入导出，损坏回退。M1、M2 都靠这一块。

现状（集成分支实测）：
- `packages/platform/src/storage/schema.ts` 的 `saves` 表主键是 `&slot`，同槽新档覆盖旧档，`generation` 只自增；
- `save_auto_1..3` 是三个轮换槽，不是每槽三代；
- 没有损坏回退；
- 平台层有整库的 TSDB 自定义格式（`archive-codec.ts`），但界面没接；
- 应用层只有单槽临时格式 `.tsui`（`apps/game/src/storage/save-service.ts`）；
- 全仓没有 TSAV / ZIP，也没调用 `navigator.storage.persist()`。

## 规格（照这些写，不自创）

- `docs/tech/08-backend-and-online.md`：
  - §3.1 分层；
  - §3.2 `SaveHeader`；
  - §3.3 `TSAV v1` 二进制布局：魔数 + 明文头 JSON + gzip 负载，双 SHA-256；
  - §3.4 成本；
  - §3.5 schema 版本与迁移链，§3.5.1 版本登记；
  - §3.6 内容版本与 ID 重映射：本任务只留接口与恒等实现。
- `docs/tech/01-architecture.md` §6.9 页面生命周期与存档时机：
  - 「先写新记录、再切换指针」两阶段；
  - `saves` 表每槽保留最近 3 份，读档取最新且校验通过的；
  - 自动存档触发与 30 s 去抖。
- `docs/tech/05-gameplay-engine.md` §14.1 序列化边界、§14.2 纯迁移与内容修复：core 的 `serialize()` 只给 JSON；TSAV 头、gzip、hash、IndexedDB 全在 I/O 层。

## 要做的事

1. **TSAV v1 编解码**（`packages/platform/src/storage/`）：
   - 严格照 §3.3 的字节布局与 §3.2 的头字段；
   - gzip 用 `CompressionStream` / `DecompressionStream`（浏览器与 Node 18+ 原生），SHA-256 用 WebCrypto，**不加新依赖**；
   - 解压上限、头校验、两个 hash 的校验失败都给枚举错误；
   - 相同快照两次编码，负载 hash 必须一致（确定性）。
2. **迁移链**：
   - 头里带 `saveSchema`；
   - 迁移注册表是纯函数 JSON → JSON，写一个 v1 恒等迁移，再写一个示例升级来证明链路，后者放在测试里；
   - 内容修复（§3.6）只留钩子。
3. **每槽三代**：
   - Dexie 升版本，旧数据迁移到新表 / 复合主键（比如 `[slot+generation]`），写进 README；
   - 两阶段写：先写新代，再切当前指针；超过 3 代删最旧；
   - 读档取最新且校验通过的一代；该代损坏（hash 不符、解压失败、迁移失败）就退到上一代，并向界面报「已从第 N 代恢复」；
   - 自动档保持现在的槽位语义。
4. **导入导出**：
   - 单档导出 JSON（头 + GameState 负载的规范 JSON）与 TSAV；
   - 全部存档导出 ZIP：TSAV 本身已压缩，ZIP 用 store 方式，自写最小实现，不加依赖；如确需依赖，在报告里说明理由与体积；
   - 导入：识别格式 → 校验 → 迁移 → 写入新代，不覆盖现有代；
   - 旧的 `.tsui` 临时格式不再导出；导入时能识别的给出转换，不能的给出明确提示。
5. **持久化**：首次存档时调用 `navigator.storage.persist()`，结果在设置或存档页可见。
6. **界面接线**：
   - `packages/ui/src/components/TxSaveSlots.vue` 加：单档导出（JSON / TSAV）、全部导出（ZIP）、导入、每槽历史代（可回到上一代）；
   - 文案进 `packages/ui/src/i18n.ts`；
   - 应用侧接线写在 `apps/game/src/storage/`。确需改 `apps/game/src/App.vue` 或 `game-controller.ts` 时，每个文件改动 ≤ 30 行，因为大地图 / 城镇 / 特效任务也在改这两个文件。
7. **测试**（`fake-indexeddb`）：
   - TSAV 往返与确定性；
   - 篡改一个字节后的各类校验失败；
   - 三代轮换与两阶段写中途失败；
   - 损坏回退；
   - 迁移链；
   - ZIP 导出导入往返；
   - 旧库升级；
   - 性能：1 MB 快照存 / 读各 ≤ 50 ms，写进测试。

约束：
- core 零改动；
- `packages/platform` 不依赖 Vue；
- 每次写入 ≤ 150 行；
- 不加新依赖（见上）。

性能是作者硬要求（AR-21「性能要最好」）：单一事务写入，流式压缩，不做大字符串拼接。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./packages/platform test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- TSAV 头与布局实现对照（§3.2 / §3.3 逐字段）；
- 数据库升级方案；
- 三代与回退的状态机；
- 导入导出格式表；
- 错误枚举；
- 测试与性能数据；
- 交给后续「core 命令总线 / saveSchema」任务的接口：core 侧需要提供的 `saveSchema` 与 `serialize()` 约定。

报告 ≤ 100 行。
