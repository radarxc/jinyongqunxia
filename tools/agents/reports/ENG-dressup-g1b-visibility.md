# ENG-dressup-g1b-visibility 报告 · 3D 纸娃娃换装 · G1b · 身体遮罩改按可见性判定（消除衣摆 / 开口黑洞）
## 1. 摘要（3–6 行）
- `visibility` 已为默认、`rays` 仅留对照；bind 用游戏相机球带真三角 z-buffer 定隐藏，动画仅回补“直接可见且仍在衣物里侧”的开口露肤。
- validate 新增单面身体 + 双面衣物的面片级 holes 门及三视最坏帧预览；三模板 bind visible 均 0。
- small/tall holes 达标，medium run=`0.0622%` 略超 `0.05%`；动态 penetration visible=`4.37%~9.08%` 超 `2%`，三 report 如实 fail，未回退旧判据。
## 2. 产出（文件、行数、主要章节）
- 工具：`bake_hide_mask.py` 1112 行、`tests_hidemask.py` 405 行、`validate.py` 1065 行；资产：3 fit/mask/mask preview/holes preview/report 与 manifest，素材目录无日志。
- 实跑：hidemask 24/24、selftest 7/7；冻结安装 `1.1s`；`pnpm check` 187/187 文件、1331/1331 测试、1777 内容文件、故事/构建/包体门全过。
## 3. 关键结论与数值
- 参数：bind `128` 视角，仰角 `[-15°,80°]`；动画 idle/walk/run 各 6 帧 × 128 视角，另全 24 帧 × 8 holes 视角；深度图 256²（holes 192²）、容差 2 mm。
- medium：bind/final=`47.3369%/30.4698%`，回补 `68137`，bake `572.462s`；visible/all idle=`5.0969%/8.8736%`、walk=`7.7673%/10.0095%`、run=`6.2270%/8.4632%`；holes=`0/0/0/0.0622%`。
- small：bind/final=`46.8256%/29.5957%`，回补 `69677`，bake `581.072s`；visible/all idle=`7.5651%/11.3774%`、walk=`9.0817%/12.5134%`、run=`7.5354%/10.0452%`；holes=`0/0/0/0.0400%`。
- tall：bind/final=`47.9252%/31.1675%`，回补 `67579`，bake `566.475s`；visible/all idle=`4.3714%/8.5227%`、walk=`6.9406%/9.6408%`、run=`5.3229%/7.4997%`；holes=`0/0/0/0.0144%`；三模板 seam=`0/255661`。
- 最坏帧逐区/视角：主因均为 `torsoUpper/torsoLower`，次为前臂、手、髋/大腿；walk/run 以前方/前上 45°及左右视角最明显，属于 E2b 动态版型/蒙皮穿插。
## 4. 开放问题（附默认值）
- 默认保持 draft/experimental/fail，交 E2b 修躯干、袖口、衣摆几何/蒙皮后同参数重烘；medium run 的衣物外侧穿出不能按裁定回补，既有翻面/边长（small 另有 close-fit）门也未过。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；落实协调者第 3 轮裁定，不改 AR-108 或门限。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/12-dressup-production.md` P2：注明 bind 初判、动画衣内回补、单面身体 holes 门，以及 E2b 须先清动态穿插；本任务受写集限制未改。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 真三角 z-buffer、球带同范围、neverHide、仅开运算/不可见小岛填充、短筒裙/短上衣/前片穿出/面片中心/背面剔除/256↔512 回归；L8 1024² 与 seam 均合规。
- ✅ bind=0；small/tall holes≤0.05%；⚠️ medium run holes=0.0622%、三模板 penetration visible=4.37%~9.08%>2%，失败数字与醒目预览已保留。
- ✅ P2 参数：`--mode visibility --views 128 --frames-per-clip 6 --depth-size 256 --size 1024`；fit 记录球带、bind/动画/holes 姿态数，三模板逐一 validate。
- ✅ 四条指定检查与 `git diff --check` 通过；未改依赖/运行时/GLB/遮罩格式，未花点数；技术事实均来自仓库与实测，未引入待联网事实。
