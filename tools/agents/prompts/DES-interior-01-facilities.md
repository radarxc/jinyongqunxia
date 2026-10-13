# 本任务：城镇 3D 古建 · 试点城设施绑定补全——三座试点城每栋可进建筑的设施类与招牌文字键

**第一个动作**：读 `tools/agents/reports/DES-town2-pilot-content.md` 第 3、7 节（已绑的店铺 / 客栈设施表）与 `tools/agents/reports/ENG-town2-shop-schema.md` 第 3 节（`town-facilities.v1` 字段），再打开三份已有设施文件 `content/town/facilities/{city_dali__ch01,city_dali__ch10,city_turpan__ch10}.yaml`、三份试点布局（`assets/default/baseline/town/town_dali__ch01.layout.yaml`、`assets/default/town/city_dali__ch10/layout.yaml`、`assets/default/town/city_turpan__ch10/layout.yaml`）的 `buildings` 段，以及 `docs/tech/16-town-3d-spec.md` §8.1（类型 → 缺省设施表）、§8.3（16 类室内模板）、§12.3（招牌）；读完直接动手，不要先写计划。

本任务写内容（YAML / 文本），不写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。事实优先级与标注规则见 `_common.md`；原著没有的标（原创扩展）。

## 背景
作者 AR-114（2026-10-10，逐字）：「希望用threejs做一个能进入建筑的游戏体验。同时，采买这些都在建筑里进行（搭配NPC对话）。」三座试点城（大理 ch01 北宋大理约 1093 年、大理 ch10 与吐鲁番 ch10 唐长安二年 702 年西州一带）要能走进每一栋可进的房子，室内按设施类摆家具（i1 / i2 的 16 类模板）。DES-town2-pilot-content 已绑定了店铺与客栈；本任务补全**其余可进建筑**（住宅、寺庙、衙门、镖局、赌坊、马厩、仓房、哨所等）的设施类，并给需要招牌的建筑加招牌文字键。

## 要做的事
1. **补绑定**（在三份已有设施文件里**追加**条目，已有条目逐字不动）：
   - 每栋可进建筑（布局类型属于 tech/16 §8.1 表左列，且不是 `palace` / `palace_hall`）都要有设施类：先按 §8.1 缺省表；按史实与布局 `business_ref` 判断需要改绑的（例如大理 ch01 的寺庙 → `temple`、衙门 → `office`），写明依据。
   - 住宅类大量重复的民居可以不逐栋写（缺省即 `residence`），但**每类 i1 / i2 模板在三城合计至少用到一次**（杂货、布庄、书肆、药铺、客栈、酒肆 / 茶馆、铁匠铺、当铺、钱庄、镖局、武馆、住宅、寺庙、公堂、赌坊、厩 / 仓 / 哨所、货摊 / 食摊）——某类在三城布局里确实没有合适建筑的，在报告第 4 节写明，不要硬绑到不合适的建筑上。
   - 非店铺设施 `shop: null`；`roles` 按模板站位（如寺庙 `[monk]`、镖局 `[chief, clerk]`）。
2. **招牌文字键**：在 `content/locales/zh-Hans/town-facilities.yaml` **追加**招牌文字（`town.<layoutKey>.<facilityKey>.sign`），每个店铺 / 客栈 / 酒肆 / 镖局 / 钱庄 / 当铺 / 寺庙一块（匾额 2–4 字，竖幌 / 酒旗 1–2 字）；北宋大理用宋代店招口吻（如「回春堂」「酒」），唐西州用唐代风格（如「张家逆旅」「胡饼」），不用明清以后的字号格式；全部标（原创扩展）。招牌样式（黑漆金字 / 本色木墨字 / 红底金字仅寺庙官署 / 竖幌 / 酒旗）写在设施条目的 `sign: { textKey, style }` 字段——若 `town-facilities.v1` 尚无该字段，**不改 schema**，改为写进报告第 7 节作为 schema 扩充建议，文字键照样加。
3. `dali_yaopu` 对应的药铺绑定保持不变（已由 pilot-content 绑定）。

## 约束
- 只写：`content/town/facilities/{city_dali__ch01,city_dali__ch10,city_turpan__ch10}.yaml`（只追加）、`content/locales/zh-Hans/town-facilities.yaml`（只追加）与本任务报告。不改代码、schema、布局、`assets/**`、已有剧情与 Ink。
- `buildingId` 必须是该布局里真实存在的建筑 id；同一建筑不重复绑定；同城设施 key 不重复。
- 沙箱里 `pnpm content:*` 若因 tsx socket 被拒跑不了，照实写进报告，交校验阶段跑；不要改 `node_modules`。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm content:build`
- `pnpm content:validate`
- `python3 tools/lint/check_ids.py --strict`

## 报告
`tools/agents/reports/DES-interior-01-facilities.md`（≤ 70 行）：第 3 节列三城新增绑定表（设施 key、建筑 id、布局类型、设施类、依据）与 16 类模板的覆盖表；第 4 节列（原创扩展）与没有合适建筑的模板；第 7 节写给 i1 / i2（各模板在试点城里的房间尺寸实例）、TOOL-signs-t5（招牌所用汉字全集）与 schema（`sign` 字段建议）的交接。
