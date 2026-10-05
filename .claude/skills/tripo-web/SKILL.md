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

### 1.3 2D 参考图“去破损”前处理黄金准则（方案 A 规范）
在把立绘或 A 字图送入 Tripo 之前，必须执行以下清理：
1. **清空额头眉眼覆盖物（Clear Forehead & Brow）**：
   - 眉眼上方、额头中间绝不能有垂落的细碎刘海遮挡；
   - 保持清晰干净的额头、眉弓与完整眼睑轮廓；
2. **发丝体块化与收拢（Solid Hair Volume）**：
   - 头发轮廓必须是清晰收拢的整块发髻（如高束发、背头或两鬓梳理至耳后）；
   - 彻底擦除空气中飘散的半透明毛刺发丝；
3. **眼睑折痕锐化（Crisp Eyelid Lines）**：
   - 眼眶与眼睑线条对比度必须鲜明、闭合，杜绝软模糊渐变阴影。

### 1.4 AR-95 头部 5 大致命缺陷深度机理与方案 A 根治规范
在 3D 人脸实测验收中，常见的 5 大缺陷机理及根治方案：
1. **额头碎发黏连化肉坨**：
   - **机理**：2D 扩散模型绘制的半透明、羽化、发丝状刘海缺乏深度视差，Tripo 重建算法将其误判为额头突出的几何厚度，烘焙出肉瘤状硬块。
   - **根治**：彻底擦除额前散发，露额整块化；发际线明确清晰。
2. **耳廓悬浮灰白薄片**：
   - **机理**：耳前垂下的细长发丝在去背或侧视深度推断时形成非流形（non-manifold）三角面片，网格破裂并悬浮在半空中。
   - **根治**：发型梳理至耳后，鬓角收紧贴近头颅，不留悬空细丝。
3. **太阳穴与面颊刀劈削角（断层切口）**：
   - **机理**：多视图输入时，2D Front 与 Left/Right 视角存在 5°~10° 细微透视偏差。重建算法做 Visual Hull（多视角视锥布尔交集）时，将面颊多余部分当成背景直接“削掉”，产生刀劈凹陷。
   - **根治**：**改用高质量单图 A-pose 生成**（见 §1.5 选型矩阵），消除视角交集切削。
4. **嘴唇边缘撕裂与下唇裂口**：
   - **机理**：原画微张唇缝或半透高光在深度粗化时造成上下唇网格撕裂。
   - **根治**：唇缝闭合平整，高光不过曝。
5. **颅顶与发包头盔感（过分膨胀）**：
   - **机理**：古装盘发在 2D 视角下横向纵向蓬松，3D 旋转时显得像笨重的安全帽。
   - **根治**：2D 图预处理时，将发包高度与宽度紧实压缩 15%（颅顶降高），达到紧致秀雅的武侠/仙侠头型。
6. **耳坠与耳下碎发误判肉块（AR-97 铁律）**：
   - **机理**：耳坠、耳环、悬垂流苏或耳垂后侧向下延伸的细微发丝，在 3D 重建中极易被视作悬空挂件，烘焙成贴在侧颈与耳下的粗糙灰白多边形长块。
   - **根治**：**严禁任何耳坠与耳饰**！耳垂下边缘与下颌侧面彻底露空擦净，不留任何发丝垂于耳下。
7. **发饰与帽子烘焙冲突（AR-97 铁律）**：
   - **机理**：发簪、发钗、步摇、花钿、帽子若烘焙在头部几何上，不仅极易破面，更导致后续无法自由更换发饰与头盔。
   - **根治**：**抹除一切发饰与帽子**！保留纯净、无任何外挂饰物的素发髻或束发。

### 1.5 生成模式选型决策矩阵：单图 A-pose vs 多视图

| 角色类型 / 特征 | 推荐模式 | 核心理由 |
|---|---|---|
| **女性角色 / 长发 / 古装仙侠** | **单图 A-pose** (`image_to_model`) | 女性发型发饰复杂，扩散模型三视图极难做到 100% 正交对齐；单图 A-pose 依靠 Tripo H3.1 预训练深度先验，生成的面部对称平滑无凹陷，下唇完好，成功率极高。 |
| **男性角色 / 短发 / 铠甲硬结构** | **严格对齐多视图** (`multiview_to_model`) 或 **单图 A-pose** | 短发或束发男角若有经过 `prepare_male_hero.py` 严格平肩加宽的多视图切片，多视图可准确捕捉背部结构；若多视图侧脸有透视冲突，退回单图 A-pose。 |


---

## 2. 身材比例与体态控制准则（AR-93 / AR-94 / AR-97）

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

### 2.3 基底素体化（Base Body Mesh）与纸娃娃换装系统解耦（AR-97 核心架构）
- **架构动因**：
  游戏未来各类衣物、护甲、披风、发饰、帽子均为独立外挂装备资产，需支持自由穿脱、更换与染色。若 3D 基底模型自带宽袍大袖或长裙发饰，外层装备穿戴时必定产生大面积穿模（Clipping & Z-fighting）。
- **3D 基底模型三大黄金标准**：
  1. **衣物贴身、短（Tight & Short）**：
     - 生成基底模型时必须采用**贴身短款衣物**（如素色贴身短打、紧身短衫窄裤、抹胸短裤或无袖贴身内衬，参考 `npc_generic_f`）；
     - 最大化露出颈部、四肢线条与关节，严禁宽袍大袖、拖地长裙、松散下摆；
  2. **头部去发饰帽子（No Hairpin / Hat / Accessories）**：
     - 去除一切发簪、发钗、步摇、花钿、帽子、发带飘尾，保留最干净利落的基础束发或盘髻；
  3. **几何网格干净（Clean Mesh Topology）**：
     - 彻底消除一切外挂多余面片与悬浮结构，保证骨骼权重纯净，便于外层衣物与发饰模块独立绑定与挂载。


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

#### 方式 A：单图 A-pose 模式（女角色、仙侠、古装长发推荐）
```js
// 1. 进入生成页并切到单图
await window.__t.toGenerate('single');
window.__t.clearUpload();

// 2. 上传经方案 A 净化的 A-pose 图
await window.__t.uploadRef('zhujue_f_v3_clean_apose.png');

// 3. 确认生成参数（H3.1 Best Quality, Ultra Mesh, 8K Extreme, PBR, Detailed, 100k faces）
// 4. 真提交生成
const gen = await window.__t.generate({ go: true, open: true });
// 返回 { pid, op, credits: { spent: 65 } }

// 5. 等待完成
await window.__t.waitOp(gen.op);
```

#### 方式 B：多视图模式（短发/硬结构男角色推荐）
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
| 眼皮撕裂、额头灰肉块 | 2D 原画额前有虚化细碎刘海 | 2D 预处理抹除额前碎发，露出完整干净额骨与眉弓（方案 A 露额准则） |
| 耳前悬浮灰白非流形薄片 | 耳前留有半透明细碎发丝 | 将发丝规整别至耳后，发际线闭合清晰 |
| 太阳穴/面颊刀劈削角 | 多视图正侧面有 5°~10° 透视微差，视锥相交被切掉 | 改用高质量单图 A-pose 生成（`image_to_model`），避免视差冲突 |
| 嘴唇撕裂/下唇裂口 | 原画微张口缝或半透高光被粗糙深度撕扯 | 保证唇缝闭合平整，下唇无过曝反光 |
| 颅顶过大（发包头盔感） | 2D 盘发蓬松，3D 深度膨胀 | 2D 预处理时将发髻与颅顶高度压低 15% |
| 溜肩、显得不够英挺 | 原画斜方肌角度过大（$\approx 40^\circ$） | 用 `prepare_male_hero.py` 执行平肩形变，外肩抬升 35~40px 并加宽 10% |
| 男主视觉比女主矮 | 各模型被 Tripo 独立归一化至 0.98 | 男主减少画布边缘留白至极限（99%），女主保留 10% 留白，并在 runtime 按 1.82m vs 1.68m 进行尺度映射 |
| 骨架倒立或压扁 | 衣服袖子过宽、裙摆过大或手持武器 | 必须采用窄轮廓 A 字图（束袖、直筒裙、双臂展开 30°、空手） |
| 奔跑动作切换时人物瞬间跳位 | Tripo 导出原地 run 动作自带 $\sim 0.55$ 偏移 | 必须用 `fix_anim_offset.py` 平移修正 Hips 水平分量 |
| Retarget 报 406 12003 锁冲突 | 前一个动作未完全结束即提交新动作 | 驱动已内置队列保护，单次仅提交 1 个动作并等待完成 |

