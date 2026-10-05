---
name: tripo-web
description: 用作者 Chrome 里已登录的 Tripo Studio 网页版给人物建 3D 模型：2D 参考图几何/比例预处理 → H3.1 生成（65 点）→ 几何/脸部质量质检 → Humanoid·Mixamo 绑骨（20 点）→ 预设动作生成（idle/walk/run）→ 动作根位移校正 → 导出 GLB 和封面预览 → 入库 assets/default/model3d/ 并提交。浏览器走 Chrome 扩展，驱动是 tools/model3d/tripo_web.js 的 window.__t（页面内 JS 调接口，少截图点选）。用于人物 3D 生产全流程、骨架绑定、动作导出、比例/脸部质量迭代与故障排查。
---

# Tripo 网页版建模（人物 3D 全流程与质量控制）

**范围**：金庸群侠传主要人物与通用 3D 模型（`assets/default/model3d/<npc_id>/`）。
生成输入是作者定过脸的立绘或 A 字参考图；立绘本身走 codex（AR-31 / AR-32），物品图走 gemini-imagegen。

**依据**：
- 作者最新指示（AR-79, AR-85, AR-93, AR-94）：
  - **男主角身形比例**：头身比必须 $\ge 8.0$ 头身，身高级别 180~185cm，体格肩膀宽阔（再加宽 10%），**杜绝溜肩（必须一字平肩）**，四肢修长健美；
  - **女主角身形比例**：头身比 8.0~9.0 头身，身高级别 165~170cm，双腿修长高挑，胸部丰满/普通依据人物描述；
  - **高矮视觉对比**：男主在直观对比和场景呈现中必须显著高于女主；
  - **面部质量门禁**：杜绝眼皮撕裂、额头碎发融化、脸部网格硬块；
- 驱动源码：`tools/model3d/tripo_web.js`（`window.__t`，Nuxt globalProperties `$request` 原生通信）；
- 核心辅助工具：
  - `tools/model3d/prepare_male_hero.py`（男主平肩、加宽、防破面预处理）；
  - `tools/model3d/stretch_apose.py`（A 字图脖子以下纵向拉伸补偿）；
  - `tools/model3d/measure_heads.py`（GLB 3D 头身比测量）；
  - `tools/model3d/fix_anim_offset.py`（修复 Tripo 导出 run 动作根位移跳位）；
  - `tools/model3d/ingest.py`（入库校验、骨架体检、时区规范写入 manifest 与自动 commit）。

---

## 0. 规矩与边界

- **标签页**：只操作 Chrome「Claude」标签组里的 Tripo 标签页，组外一律不碰。
- **账号与点数**：作者已登录，不输密码；不点 Upgrade / 购买；生成 65 点，绑骨 20 点，动作/导出/重试 0 点。每做完 2–3 个向协调者汇报余额。
- **隐私保护**：项目详情中包含 `owner_name`, `owner_user_id` 等，驱动已自动过滤；对外严禁输出作者个人信息。
- **调用规范**：单次 JS 调用 $\le 40$ 秒（驱动等待默认 28 秒，返回 `pending:true` 即可继续轮询）；严禁直接序列化大 Vue/Pinia 实例。
- **git**：在主分支/工作区内按路径提交，严禁 push，不读 `.env`。

---

## 1. 核心质量控制：AI 3D 人脸破损根因与 2D 源头治理（AR-94 铁律）

### 1.1 脸部融化与眼皮撕裂根因
AI 3D 生成（NeRF / Multi-view SDF / Gaussian Splatting 转 Mesh）在处理 2D 扩散模型输出时具有以下物理特性：
1. **半透明碎发误判为 3D 实体**：原画中前额垂落的细碎刘海、眼眶上方的虚化发丝，在 2D 空间缺乏立体视差。重建算法会将这些半透明发丝判读为额头皮肤向前突出的几何厚度；
2. **多边形网格熔接硬块**：在 10 万面三角化烘焙时，发丝厚度不足以形成独立几何体，直接与额骨、眼眶平滑熔接成一块块肉瘤状硬块；
3. **眼皮撕裂与色斑**：当 8K 贴图贴上突起的畸形网格时，发丝黑色与皮肤肉色被强行拉扯在同一凸起面上，导致双眼皮折痕断裂、额头出现半透明灰/肉色融化碎片。

### 1.2 Tripo 平台后处理能力边界（已实测确认）
- **Free Retry（免费重试）**：若输入图不变，算法在相同像素处依然会产生相同的几何熔融，**无法解决破损**；
- **Edit / Magic Brush（局部重绘）**：仅修改 2D 贴图 UV 颜色，**完全无法增删或平滑 3D 几何网格顶点**，无法消除肉块；且不支持 8K 模型；
- **Retopo（网格拓扑重构）**：属于全局重采样，对人脸细微拓扑粘连束手无策；
- **结论**：**Tripo 平台没有任何 3D 雕刻或几何修模能力，脸部质量必须 100% 在 2D 输入阶段根治**！

### 1.3 2D 参考图“去破损”前处理黄金准则
在把立绘或 A 字图送入 Tripo 之前，必须执行以下清理：
1. **清空额头眉眼覆盖物（Clear Forehead & Brow）**：
   - 眉眼上方、额头中间绝不能有垂落的细碎刘海遮挡；
   - 保持清晰干净的额头、眉弓与完整眼睑轮廓；
2. **发丝体块化与收拢（Solid Hair Volume）**：
   - 头发轮廓必须是清晰收拢的整块发髻（如高束发、背头或两鬓梳理至耳后）；
   - 彻底擦除空气中飘散的半透明毛刺发丝；
3. **眼睑折痕锐化（Crisp Eyelid Lines）**：
   - 眼眶与眼睑线条对比度必须鲜明、闭合，杜绝软模糊渐变阴影。

---

## 2. 身材比例与体态控制准则（AR-93 / AR-94）

### 2.1 高魅力男主角
- **平肩与肩宽变换**：
  - 原画常有 40° 溜肩下垂，武侠大侠必须具备“一字平肩”；
  - 采用 smoothstep 变换，将外侧三角肌/肩峰区域向上提升约 35~40 像素，消除溜肩；
  - 双肩与胸肌水平宽度在原画基础上横向扩宽 +10%~18%；
- **头身比与修长四肢**：
  - Tripo 生成后会将头部放大约 5%~15%；
  - 2D 输入前必须在颈部以下（y $\approx$ 210）做纵向拉伸（Scale $\approx 1.15$），使 2D 头身比达到 8.5~8.6 头身，生成 3D 即可精准落在 $\ge 8.0$ 头身；
- **高个子视觉呈现（高度归一化补偿）**：
  - Tripo 会将任意模型的外接立方体归一化到约 0.98；
  - 男主画布切片须将顶部发髻与底部鞋底紧贴边缘（上下留白 $\le 4\text{px}$，画布占比 99%）；女主则适当增加留白（画布占比 88%~90%）；
  - 引擎与展示端按实际身高设定比例（男 182cm / 女 168cm，缩放比 1.083），确保男主显著高于女主。

### 2.2 高魅力女主角
- **头身比**：8.0~9.0 头身，头小、颈长、腿长；
- **体态**：下肢纵向拉伸（`stretch_apose.py --scale 1.18~1.22`），胸部饱满度视原著设定，腰身纤细，裙摆收束成直筒窄轮廓以利于骨架绑定。

---

## 3. 标准操作流程（Standard SOP）

### 3.1 准备 2D 三视图切片
1. **多视图准备**：准备 Front、Left、Back 3 张切片（或窄轮廓 A-pose 单图）；
2. **执行几何与身形预处理**：
   - 男主运行 `python3 tools/model3d/prepare_male_hero.py`；
   - 女主运行 `python3 tools/model3d/stretch_apose.py`；
3. **输入质检**：
   - 检查额头眼睑是否光滑无遮挡；
   - 检查肩膀是否水平平直；
   - 测量 2D 头身比（头顶骨至下巴为 1 头）。

### 3.2 装载驱动与暂存素材
在 Tripo 标签页中执行：
```js
// 1. 载入驱动
window.__claudeTT ??= trustedTypes.createPolicy('cl' + Date.now(), { createScript: (s) => s });
eval(window.__claudeTT.createScript(localStorage.getItem('claudeT')));

// 2. 插入文件上传框并上传切片
const inp = document.createElement('input'); inp.type = 'file'; inp.multiple = true;
inp.setAttribute('aria-label', 'claude loader'); document.body.appendChild(inp);
// (通过 DevTools upload_file 传入切片绝对路径)

// 3. 暂存进 IndexedDB
await window.__t.stage(inp);
inp.remove();
```

### 3.3 提交生成（65 点）
```js
// 1. 进入生成页并切到多视图
await window.__t.toGenerate('multiView');
window.__t.clearUpload();

// 2. 挂载三个槽位
await window.__t.uploadRef('zhujue_m_v3_front.png', { slot: 0 });
await window.__t.uploadRef('zhujue_m_v3_left.png', { slot: 1 });
await window.__t.uploadRef('zhujue_m_v3_back.png', { slot: 2 });

// 3. 确认生成参数（H3.1 Best Quality, Ultra Mesh, 8K Extreme, PBR, Detailed, 100k faces）
// 4. 真提交生成
const gen = await window.__t.generate({ go: true, open: true });
// 返回 { pid, op, credits: { spent: 65 } }

// 5. 等待完成
await window.__t.waitOp(gen.op);
```

### 3.4 验收与骨架绑定（20 点）
```js
// 1. 检查封面与白模质量（杜绝面部粘连）
await window.__t.showCovers(pid);

// 2. 提交自动绑骨（Humanoid Mixamo 65 joints）
const r = await window.__t.rig(pid, { go: true });
await window.__t.waitOp(r.op);

// 3. 关节体检
const joints = await window.__t.joints(pid);
if (!joints.ok) throw new Error('Joint check failed: ' + JSON.stringify(joints));
```

### 3.5 预设动作生成（0 点，主角标配）
```js
// 依次生成待机、行走、奔跑动作（避免锁冲突，每次等待完成）
await window.__t.retarget(pid, ['idle', 'walk', 'run'], { go: true });
```

### 3.6 导出与位移修复
```js
// 1. 导出带动作与不带动作的 GLB 模型
await window.__t.exportGlb(pid, 'npc_zhujue_m__ch00_charmhigh');
await window.__t.exportGlb(pid, 'npc_zhujue_m__ch00_charmhigh', { anims: ['idle', 'walk', 'run'] });
await window.__t.preview(pid, 'npc_zhujue_m__ch00_charmhigh');

// 2. 修复奔跑动作的原点水平偏移（Hips Jump Offset）
// python3 tools/model3d/fix_anim_offset.py <anim.glb> <anim_fixed.glb>
```

### 3.7 入库与提交
```bash
python3 tools/model3d/ingest.py npc_zhujue_m__ch00_charmhigh \
  --project <pid> --gen-op <gen_op> --rig-op <rig_op> \
  --anim idle,walk,run --anim-ops idle=<op>,walk=<op>,run=<op> \
  --gen-kind multiview_to_model --input "multiview: Front + Left + Back" \
  --ref scratch/threeview_slices_v3/zhujue_m_v3_front.png \
  --ref scratch/threeview_slices_v3/zhujue_m_v3_left.png \
  --ref scratch/threeview_slices_v3/zhujue_m_v3_back.png \
  --subject "高魅力男主角（平肩八头身武侠形象）" \
  --notes "平肩修正无溜肩；头身比>=8.0；露额面无撕裂；Mixamo 65关节全通" --commit
```

---

## 4. 常见问题排查与速查清单

| 异常现象 | 核心原因 | 彻底对策 |
|---|---|---|
| 眼皮撕裂、额头灰肉块 | 2D 原画额前有虚化细碎刘海 | 2D 预处理抹除额前碎发，露出完整干净额骨与眉弓 |
| 溜肩、显得不够英挺 | 原画斜方肌角度过大（$\approx 40^\circ$） | 用 `prepare_male_hero.py` 执行平肩形变，外肩抬升 35~40px 并加宽 10% |
| 男主视觉比女主矮 | 各模型被 Tripo 独立归一化至 0.98 | 男主减少画布边缘留白至极限（99%），女主保留 10% 留白，并在 runtime 按 1.82m vs 1.68m 进行尺度映射 |
| 骨架倒立或压扁 | 衣服袖子过宽、裙摆过大或手持武器 | 必须采用窄轮廓 A 字图（束袖、直筒裙、双臂展开 30°、空手） |
| 奔跑动作切换时人物瞬间跳位 | Tripo 导出原地 run 动作自带 $\sim 0.55$ 偏移 | 必须用 `fix_anim_offset.py` 平移修正 Hips 水平分量 |
| Retarget 报 406 12003 锁冲突 | 前一个动作未完全结束即提交新动作 | 驱动已内置队列保护，单次仅提交 1 个动作并等待完成 |
