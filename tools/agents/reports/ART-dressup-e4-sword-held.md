# ART-dressup-e4-sword-held 报告 · 3D 纸娃娃换装 · E4 · 出鞘持剑：龙泉剑（Tripo 生成 → 归一化 → 握右手 → 门禁 → 入库，AR-107）
## 1. 摘要（3–6 行）
- 复用唯一一次 Tripo `image_to_model` 原始 GLB，未再次生成、未绑骨；完成材质/减面成品的 60° 正握返修、门禁与入库证据统一。
- `check_sockets.py` 新增 `allowReverse:false` 策略；本件只扫 `{0,20,40,60}`，未写字段的 A6/历史道具维持原五档行为。
- `validate.py` 以 guard-peak 判断柄/刃语义；最终 `report.json` 由工具重跑生成，fit SHA-256 与实际文件一致。
- 本轮补齐 manifest 顶层 `socket: gripR`；质检图把 `fingerPose.fist` 15 根右手指骨纳入递归骨矩阵与 LBS，四指包柄、拇指压柄，护手在拳外、刃向前下。
## 2. 产出（文件、行数、主要章节）
- `assets/default/model3d/dressup/props/eq_longquanjian/`：GLB 2,380,764 B / 9,578 三角；`fit/report/sockets_check/manifest`；`preview_hand.png` 1024²、`preview_full.png` 1440×1180。
- `validate.py` 826 行、`check_sockets.py` 599 行、`tests_prop.py` 588 行：guard-peak 语义方向、反握策略及写回重复运行/A6 回归；本报告 33 行。
## 3. 关键结论与数值
- Tripo 项目/任务 ID `a3002088-7ec0-4640-8caf-33be4afa84f8`；操作 ID、点数前后未记录；手册口径 `image_to_model` 65 点，仅历史一次。
- 封面/模型复核：修长直身双刃、如意护手、深青缠柄清楚，剑身完整；无鞘、底座、地面或手。输入图 SHA `faa199…0da3f`，原始 GLB SHA `d75b05…26ac`。
- 护手峰距柄端 26.8853%，峰宽 0.183510 mu、两侧中位宽 0.121982/0.073432 mu、峰比 1.5044；故护手外侧低端为柄端，归一化峰 y=0.111537 mu。
- 原测主长 1.564723 mu；`scale=0.95/(1.564723398×1.69370027)=0.35846724`；成品 0.560902 mu = 0.950000 m。
- 成品 POSITION accessor 107,644 顶点，索引实际引用 8,205 顶点、9,578 三角；`geometry.maxResidualMu=2.9767788413e-08`，锚点记录残差 `1.0430812880e-09 mu`（实算约 `6.94e-18 mu`）。
- `tiltSweep`：0° 1.991269%（draft）、20° 3.718841%（fail）、40° 0.635962%（draft）、60° 0.026904%（approved）；合法四档最小值为 60° 正握。
- `validate` approved 29/29：9,578≤10,000 三角、贴图 2048²、语义 guard-peak；fit SHA `cfe2b78d…071b` 与 `report.inputs.fit` 相同。
- `check_sockets` 退出 0：握点误差 0 mm、刃向夹角 0.000013°、`fingerDirectionDot=0.862498`；深穿 `141/(7,279×72)=0.026904%`；本轮墙钟 152.93 s。
- 最终 `validate` 成功重跑墙钟 1.12 s；首次因未指定只读原始 GLB 根目录失败 0.72 s。早期 normalize/textures/pack/ingest 耗时未记录，不估造。
## 4. 开放问题（附默认值）
- Tripo 余额/操作 ID 与生成时封面截图无历史记录；默认如实保留“未记录”，不补造；本轮未调用网页，无新增次数、条款、水印或参考图能力实测。
- `pack_glb` 尚未压紧未引用顶点；默认接受当前 2.38 MB 合格件，后续通用脚本加入 `compactMesh` 后再降至约 1.5 MB。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；落实 AR-102、AR-107 与 tech/11 §4/§5.2/§6/§7。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/11` §5.5 / `pack_glb.mjs`：减面后压紧未引用顶点；C2 Skill：记载 `allowReverse:false` 正握四档策略及握拳预览要求。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 未再次 Tripo 生成/绑骨；manifest 顶层 `slot=mainHand/socket=gripR/item=eq_longquanjian`，notes 明记“出鞘·持剑态；restTilt=60.000°”。
- ✅ 本件 `allowReverse:false`，fit/socket 仅四档并选 60°；字段缺失保持旧行为，A6 青锋佩剑实际资产回归通过且未被改写。
- ✅ report 由最终 fit 重跑、哈希一致且未手改；两图复用最终变换，局部图清楚显示食/中/无名/小指包住深青柄、拇指压柄、护手在拳外及虎口侧刃向。
- ✅ B 系列预览页交接：持态加载本资产占 `mainHand` 并触发右手握拳；佩态加载 A6 入鞘资产占 `waist` 且不握拳；面板单选互斥，切换先卸另一态。
- ✅ `tests_prop` 27/27、selftest 7/7、专项 `check_sockets` 退出 0、冻结安装通过；`pnpm check` 退出 0（187 文件/1,331 用例，内容/故事/构建/包体全过）。
- ✅ `git diff --check` 通过；无 `scratch/`、无残留临时脚本、无写集外改动；成品图人工复核无落地、无鞘、无反握。
