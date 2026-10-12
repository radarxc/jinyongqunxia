# ENG-town2-facility-key 报告 · 城镇探索 v2 · 城镇设施键统一为城镇定义的 cityId__chapterId（借用布局的城镇也能找到店员与店铺）

## 1. 摘要（3–6 行）

设施对话、界面投影和 v1 店内交易校验已统一使用城镇定义的 `${cityId}__${chapterId}`。
本轮投影改从基础投影的 `townRuntime` 取会话已选中的懒加载定义，不依赖静态 `content.towns`。
区域显式 `layoutKey` 仍优先；卷十借用大理 ch01 时能找到药铺、店员与店铺并正常买卖。

## 2. 产出（文件、行数、主要章节）

- `packages/core/src/dialogue/{facility.ts,facility.test.ts}`（116/107 行）与 `economy/{shop-locator.ts,shop-locator.test.ts}`（43/75 行）：统一纯函数、对话、定位及买卖回归。
- `apps/game/src/runtime/{explore-projection.ts,explore-projection.test.ts}`（95/75 行）：设施投影；测试读取真实 YAML/城镇 JSON。
- 冻结安装通过、锁文件未变；指定 Vitest 27 文件/172 测试通过（含 `v1-shop-flow.test.ts`）。
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`：253 文件/2156 测试、1793 内容文件通过；entry 38.56/170 KiB、首次会话 103.54/110 KiB、core-shop 4.27/8 KiB 均 PASS。

## 3. 关键结论与数值

- 旧运行时：`${town.cityId}__${town.chapterId}`；旧对话：`${town.sceneId}__${eraLayerId}`；旧投影：`${town.sceneId}__${chapterId.slice(0,4)}`；旧交易校验同旧对话。
- 新算法：区域显式键优先，否则以当前 `town.sceneId` 查城镇定义，再取 `${cityId}__${chapterId}`。
- ch10 借用实测：静态内容无 `towns` 时仍投影设施 `yaopu_01` 与“交谈”；店员入口 `story_ch10_facility/yaopu_keeper`，店铺键 `city_dali__ch01/yaopu_01`；钱足成交，钱不足仅拒绝 `SHOP_MONEY_INSUFFICIENT`。
- ch01 原生用例仍为 `story_ch01_facility/yaopu_keeper` 与同一店铺键。

## 4. 开放问题（附默认值）

- 默认保留老夹具兼容：缺少 `content.towns` 且同 scene 只有一个设施布局时使用该键，并按内容对象缓存；生产内容仍严格走城镇定义。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- 无。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 唯一正式算法、区域显式键优先、`entryKey`、无静态 `towns` 的懒加载产品形状投影、店铺查询/定位/买卖、ch01 不变均有通过用例。
- ✅ 未改内容、素材、存档、`handlers.ts`、禁改应用文件或依赖；`git diff --check` 通过。
- ✅ 给协调者的 5173 手检：卷十存档 → 进洱海河蛮城邑 → 走进苍山药肆 → 交互条出现「交谈」→「看看货」→ 店铺页。
- ⚠️ 本执行环境未启动 5173 浏览器，最后一条请协调者按上述路径手检。
