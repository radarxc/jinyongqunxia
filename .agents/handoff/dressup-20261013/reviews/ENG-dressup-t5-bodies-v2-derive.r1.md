VERDICT: FAIL

## 逐项结论

- 写集与禁区：通过 —— 所有改动均位于允许的工具、报告及六个模板目录内；旧 `template_specs.json`、`derive_template.py`、`normalize_rig.py`、`export_skeleton.py` 和 `tpl_f_*` 均未修改，也未发现绝对路径或新增依赖。
- `fix_inverted_faces.py` / `tests_fix_faces.py`：通过 —— 实现支持多 primitive、共享/交错 accessor、u8/u16/u32 索引、幂等与 `--check` 退出码；中等模板只改变索引字节。测试在当前只读沙箱因没有可写临时目录无法复跑，但留存记录为 12/12 通过，不是本次 FAIL 的依据。
- `template_specs_v2.json`：通过 —— 六行身高、髋比、肩比及 source 与 T4b 补充裁定完全一致。
- `tpl_f2_medium` / `tpl_m_medium`：通过 —— 分别翻正 89/67 面，当前 `--check` 均为 0；SHA、尺寸、skeleton source SHA 与 manifest 闭合。`normalize_rig`、`export_skeleton` 均通过，65 关节且 rest=bind。
- 男性后脑倒置面：通过 —— bind、walk 0.60 s、run 0.30 s 的单面材质对照图清楚显示面 103350 修复后黑三角消失。
- 四个派生模板的比例与骨架：通过 —— 身高、髋比、肩比误差远小于 0.005，最大位移均低于各自门限；六套 `normalize_rig` 和 `export_skeleton` 检查均通过。
- 四个派生模板的翻面门禁：不通过 —— `fix_inverted_faces.py --check` 实跑结果为 small/tall/lean/bulk 分别残留 `80 / 7 / 8 / 11` 个负点积面，全部退出 1；与 [impl spec](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-t5-bodies-v2-derive/docs/tech/11-paper-doll-3d-impl-spec.md:229) 的“翻面三角 0”冲突。产物自身也在四份 manifest 的 `invertedFacesAfterDerive` 中记录了失败，例如 [tpl_f2_small manifest](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-t5-bodies-v2-derive/assets/default/model3d/dressup/templates/tpl_f2_small/manifest.yaml:37)。
- 四个派生模板的颈环门禁：不通过 —— 相对源半径差分别为 `2.420761 / 3.645394 / 6.300312 / 3.085995 mm`，四者都超过 `< 2 mm` 的硬门禁；见 [任务报告](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-t5-bodies-v2-derive/tools/agents/reports/ENG-dressup-t5-bodies-v2-derive.md:27) 和 [impl spec](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-t5-bodies-v2-derive/docs/tech/11-paper-doll-3d-impl-spec.md:330)。
- GLB/manifest 契约：通过 —— SHA、尺寸、derive/skeleton/regions/skull SHA 均闭合；六套为单 primitive、`KHR_materials_unlit`、单面、仅 baseColor，含 `_REGION`、65 关节及 idle/walk/run。
- 图片：通过 —— 六张预览均为 640×960 RGB 正面全身 bind；六模板拼图含同米制 bind 与 walk；没有水印、现代元素或明显风格违规。
- 报告：不通过 —— 七节齐全且正好 60 行，也如实记录 HOLD；但报告及 `validation.summary.json` 已明确写出 `templateAcceptance.pass=false`，因此不能作为合入完成产物。

## 返修说明

1. 当前四个派生模板不能合入，也不能进入衣物/头/道具重贴合或默认模板切换。
2. 先为 `derive_template.py`、必要时 `export_skeleton.py` 和 `tests_derive.py` 开独立前置修复任务；这些文件不在当前任务写集内，不能在本任务越权修改。
3. 修复派生后的法线/绕序一致性，使四个最终 GLB 的 `fix_inverted_faces.py --check` 均退出 0。若对最终派生 GLB再次翻面，必须同步更新 body SHA、skeleton source SHA、manifest、验证侧车和截图，且不要继续声称索引与源逐字节一致。
4. 修复颈环带在 LBS 派生中的形变或取环稳定性，确保每个派生模板相对其中等源的两轴米制半径最大差严格 `< 2 mm`；不得只改 `skeleton.json` 半径或放宽门禁。
5. 从女源 `f7c6cfb1…82a94`、男源 `aa2a1e95…91549` 重新派生四体，重导 skeleton、重算全部 SHA，并重拍四张 preview 和六体拼图。
6. 为新 `tpl_f2_*` 和 `tpl_m_*` 增加真实产物回归覆盖；现有 `tests_derive.py` 的真实产物测试仍只硬编码旧 `tpl_f_medium/small/tall`，无法阻止本次失败再次出现。
7. 最终重新验证四体：倒置面 0、颈环差 `<2 mm`、比例/位移门、65 关节、rest=bind、normalize/export，以及完整 `pnpm check`。

## 需作者确认

无。