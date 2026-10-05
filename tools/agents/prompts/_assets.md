## 一之二、素材任务附加规则（本任务生成或审阅图像）

1. **入口与边界**（作者决定 P02；`tech/07` §0 D5、§4.1）：图像只用你当前环境提供的 `image_generation` 工具生成；不安装、不调用任何其他模型或服务，不上传仓库内容到外部网站。生成失败或工具不可用时如实记录，用占位（灰模 / 线稿说明）继续完成登记与流程，**不要伪造图片或成功记录**。
2. **风格与硬规则**（`tech/07` §2 美术圣经，审核一票否决项见 §2.9）：工笔为骨、水墨为气，三档风格 S1 / S2 / S3；**交领右衽**（不得镜像翻转成左衽）；服饰按书界朝代（北宋 / 南宋 / 元 / 明 / 清）；**不得使用任何影视剧演员、真人肖像**，不得复制具体受版权画作；不得出现可读文字、水印、签名；手指、兵器握持、五官对称必须检查。
3. **文件与目录**：
   - 原始输出与全部候选放 `art/work/<任务ID>/<subject>/NN.png`（该目录被 `.gitignore` 排除，不会提交）；
   - 通过初筛的候选缩到长边 ≤ 1024 px、WebP、单文件 ≤ 400 KB，放 `art/golden/<subject>/<变体>.webp`（**会提交**；本任务最多提交 40 个文件）；同一目录写 `contact-<subject>.webp` 联系表（每主题 1 张，≤ 600 KB）；
   - 每张 golden 图对应 `content/assets/registry/ch01/*.yaml` 或 `content/assets/registry/global/*.yaml` 一条登记（字段见 `tech/07` §6.4），`status` 最高只能写到 `review`（`approved` 由作者人工审定），`provenance.steps[].displayModel` 界面未展示就写 `null`，`seed: null`，`license.accountVerified: false`；
   - 提示词模板 / 片段写入 `tools/aigc/prompts/**`（YAML），生成请求写入 `tools/aigc/requests/<assetId>.NN.yaml`，做到"从登记条目能追溯到请求与提示词"。
4. **自检**：每个主题至少 8 张候选、挑 2–4 张进 golden；同一人物跨 ≥ 10 张不同构图做"识别锚"一致性自评（1–5 分，写明扣分原因），≥ 4 分才可进 golden；分数与理由写进 `art/golden/<subject>/notes.md`。
5. **报告**第 2 节列每个主题的候选数 / 入选数 / 平均分与文件路径；第 4 节列工具限制（分辨率、次数、参考图是否可用、是否有水印）——这些是作者后续实测 P02 / 许可条款的输入。

