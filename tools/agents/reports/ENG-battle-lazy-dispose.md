# ENG-battle-lazy-dispose 报告 · 游戏工程 · 小修：战斗控制器懒加载期间宿主被替换时丢弃加载、不订阅已销毁宿主，调用方接住 promise；确定性回归测试（消除 HOST_DISPOSED 未处理 rejection）
## 1. 摘要（3–6 行）
- 根因是 `ensureBattle()` 的动态导入晚于旧 GameController/host 销毁，完成后仍构造 BattleController 并订阅旧 host；更新回调的 fire-and-forget 链又未接 rejection。
- 现以 controller 内宿主代数判定当前性：dispose 递增代数并清加载缓存，过期导入返回 `null`，不调用工厂、不订阅旧 host。
- `ensureBattle()` 对 import/构造失败统一 fulfilled-null、清缓存并提示重试；更新回调末端亦有 catch，所有调用方均已审计。
- deferred loader 回归确定性覆盖旧宿主销毁后放行、新宿主成功订阅及无未处理 rejection；未改宿主替换、恢复或自动存档语义。
## 2. 产出（文件、行数、主要章节）
- `apps/game/src/game-controller.ts`：695 行；测试 loader seam、代数失效、fulfilled-only 加载、调用点收口、dispose 清理。
- `apps/game/src/game-controller.test.ts`：188 行；新增 2 项生命周期/失败重试回归（净增 95 行）。
- `apps/game/src/battle/controller.ts`：未修改；过期加载在调用工厂前丢弃，无需改订阅实现。
## 3. 关键结论与数值
- deferred 用例中旧 host 订阅保持 1（仅 GameController），战斗工厂只以新 host 调用 1 次，新 host 订阅为 2（GameController + BattleController），未处理 rejection 为 0。
- 指定 `main-flow.test.ts` 连跑 10/10，每轮 1/1 通过且无 Errors；game 32/32 文件、111/111 用例通过。
- 最终 `pnpm check`：149/149 文件、1095/1095 用例，内容 1176/1110/2 Ink/62 地图，entry 38.80/170、session 91.69/110 KiB，全绿。
## 4. 开放问题（附默认值）
- 无产品开放问题；默认继续让 `ensureBattle()` 失败返回 `null`，由界面保持加载占位并允许下次进入重试。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；仅修复界面装配生命周期，不改变玩法或确定性规则。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无；调用方审计共三处：App fire-and-forget 因 fulfilled-only 安全，host 更新另有末端 catch，initialize 已 await。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 产品竞态已修：import 后先验代数/销毁状态；过期加载不构造、不订阅，缓存清除，新 controller 正常加载。
- ✅ 确定性 deferred 回归，无重试/加时/跳过；另测 chunk 首败后清缓存、第二次成功。
- ✅ 冻结安装、game test、strict ID（新增失败 0）、lint/typecheck、diff check 与完整 check 均退出 0。
- ⚠️ 原样 `pnpm check` 首次仅因沙箱禁止 tsx CLI Unix socket 而停；以临时 shell 函数等价改用 `node --import tsx` 后全链通过，未改脚本或门禁。
- ✅ 仅修改允许的 controller/test/报告；未改 packages、依赖、预算、宿主替换与存档语义，未执行改变仓库状态的 git 命令。
