VERDICT: FAIL

## 逐项结论

- 写集与禁区：通过 —— 21 个改动文件均在授权范围内；未改 `cut_head.py`、依赖、门禁阈值或其他模板；未发现 Blender、新 pip 包及被禁止的对齐方式。
- `sculpt_neck.py`：不通过 —— 双调和求解、UV 缝焊接、Head/IBM 更新及失败不写均已实现，但二面角门在 [sculpt_neck.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ART-dressup-t4b-neck-v3/tools/model3d/dressup/sculpt_neck.py:181) 只检查 `welded_faces[face_in]`，遗漏 ROI 边界及 ROI 外相邻面，不满足“相邻面二面角变化最大 ≤ 12°”的全网格门禁契约。当前女模独立全网格复算仍通过：0 翻面、p99 0.469°、最大 8.258°、超 12° 为 0、边长比 0.873–1.327；问题在工具无法保证以后产物。
- 女 `tpl_f2_medium` 几何与骨架：通过 —— 65 关节，rest=bind `8.96e-08`；拓扑、UV、JOINTS、WEIGHTS、`_REGION` 和 565 个动画 accessor 与基点一致；颈宽比低于 0.50，截图中前、侧、后三向过渡连续，无折线鼓包。
- 男 `tpl_m_medium` 几何与骨架：通过 —— 确为新项目 `11c688eb…` 重生成；65 关节，rest=bind `4.98e-07`；颈宽比低于 0.62，颈更长、斜方肌更平。后脑小黑点和头顶细贴图缝已如实登记，不属于本次颈肩门失败。
- 两份模板 GLB 材质契约：不通过 —— 两个 `body.glb` 均为 `extensionsUsed=None`、材质无 `KHR_materials_unlit`，仍引用 `normalTexture` 和 `metallicRoughnessTexture`。这与 `docs/tech/11` 的模板 `body.glb` 必须 unlit、只留 baseColor 的契约及补充审核要点冲突；两份 manifest 也明确承认仍为 PBR（如 [女模板 manifest](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ART-dressup-t4b-neck-v3/assets/default/model3d/dressup/templates/tpl_f2_medium/manifest.yaml:105)）。
- 颈环补充裁定：通过 —— `RING_RADIUS_RANGE_MU` 与 `--check` 共用；男模由最低宽段改取区间内上段，得到 `0.04114 / 0.03853 mu`；新增测试覆盖“下宽上窄取上段、都宽仍取下段”。
- 男素体与点数台账：基本通过 —— 新图为 1686×2528，旧条目已改 `rejected`；生成 65、绑骨 20，总计 85 点，余额 `16750 → 16665` 连续且 op/project 完整。
- manifest 可移植性：不通过 —— 新男素体条目写入了本机绝对路径：[source_path](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ART-dressup-t4b-neck-v3/assets/default/character/male/ch00/threeview/manifest.yaml:136) 和 [plateTemp.path](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ART-dressup-t4b-neck-v3/assets/default/character/male/ch00/threeview/manifest.yaml:145)，违反不得写死 `/Users/...` 路径的审核要求。
- 图片审核：通过 —— 四张新增/修改图片均已逐张查看；没有文字、水印、现代元素或具体作品造型复刻。女、男颈肩对照均能看出改版效果，未见颈侧折线或鼓包。
- 报告：不通过 —— 7 节齐全且 41 行，包含真实顶点、三角、残差、SHA、rest=bind 和项目 op；但第 3 节没有实际耗时，也没有以实测值明确记录 Head 上移量、Neck 不动等锚点校验，未满足补充审核要点。同时报告把 PBR 留待后续，需改为本任务内完成 unlit。
- 验证证据：通过 —— 本轮亲自运行的 `normalize_rig --check` ×2、`export_skeleton --check` ×2 均通过；监督驱动 `finish --no-commit` 已返回 rc=0。当前只读沙箱因无法创建临时目录而不能重跑依赖 `TemporaryDirectory` 的测试，不是断言失败。

## 返修说明

1. 将二面角门改为全焊接网格检查，至少覆盖 ROI 边界两侧的面；`sculpt.json` 也输出全网格口径。新增一个在 ROI 边界制造折角的合成用例，断言退出码 2 且不写输出。
2. 用现有 `textures.py` 流程把女、男 `body.glb` 转成 `KHR_materials_unlit`，只保留 baseColor 引用，删除 normal/MR 相关引用与数据。转换后重导出 skeleton/regions/skull，更新所有 body、skeleton、ring、region、skull SHA、尺寸及 manifest；再次确认 joints 顺序、IBM、动画和 `_REGION` 不变。
3. 删除新男素体 manifest 中两处机器绝对路径；保留来源 SHA、尺寸和 `from` 即可，临时路径改为无机器信息的说明或省略。
4. 报告第 3 节补充真实运行耗时及锚点实测，例如 Head 世界位移、Neck 世界位移、IBM/rest-bind 复核值；删除“以后再转 unlit”的表述。
5. 重新运行任务列出的全部检查、`tests_skeleton.py`、四副女模板逐字节回归和 `pnpm check`，并用最终 unlit GLB 复核截图。

## 需作者确认

无。