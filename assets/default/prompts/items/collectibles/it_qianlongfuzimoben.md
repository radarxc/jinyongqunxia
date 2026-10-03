---
asset_id: it_qianlongfuzimoben
kind: item
name: 乾隆福字摹片
category: collectibles
category_name: 奢侈品 / 礼品
subcategory: calligraphy
grade: 玄
source: H43 故宫：宫廷福字展 https://ggzl.dpm.org.cn/app/api/app/exhibitionListPc/81；具体取得为（原创扩展），未核事实见名录（待考）
effect: '`grade=6; kind=collectible; sub=calligraphy; stack=1; giftValue=2; giftTo={preferred:[scholar,collector]}; eraRange=[qing]; provenance=expanded; study=none; appraise={art:art,dc:44}`'
output: assets/default/item/collectibles/it_qianlongfuzimoben.png
manifest: assets/default/item/collectibles/manifest.yaml
size: 1536x1536
background: RGB(230,225,216) 不透明均匀浅暖灰底，无投影、无地面
references:
- path: assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png
  use: 仅参考既有物品图的材质、低饱和色彩和柔光；本批按作者要求使用写实古风绘画，不复制剑或旧线稿风格
- path: assets/default/baseline/item/ref_it_miji_jiuyin_shang__ch02_base01.png
  use: 仅参考纸木材质、光线和浅暖灰底；不复制秘籍书衣、文字或构图
status: ready
---

# 乾隆福字摹片（`it_qianlongfuzimoben`）· 奢侈品 / 礼品

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | calligraphy · 书法／拜帖 |
| 品阶 | 玄上（grade=6）——用材匀净、接合细致、表面温润自然 |
| 出处 | [H43 · 故宫：宫廷福字展](https://ggzl.dpm.org.cn/app/api/app/exhibitionListPc/81) |
| 效果字段（只作理解，不画） | `grade=6; kind=collectible; sub=calligraphy; stack=1; giftValue=2; giftTo={preferred:[scholar,collector]}; eraRange=[qing]; provenance=expanded; study=none; appraise={art:art,dc:44}` |
| 外观要点（名录） | 一张暖白纸片，中央仅一个黑色「福」字，四周素净，纸片完整，无印无题跋 |
| 类别专项 | 只画一件帖子、字幅或载文片；文字严格服从本件白名单，其余卷藏或背向，不添印章题跋。 |
| 年代／取得限制 | 仅乾隆阶段五书；御笔题材民间摹写 |
| 文字白名单 | 福 |
| 说明 | 宫廷福字资料可作题材参考，此件明确为乾隆阶段的民间摹片。适合赠喜节令题字的文士藏家，摹写与流传为**（原创扩展）**；不得冒称御赐真迹，不在康熙鹿鼎阶段出现。 |

## Gemini 提示词

```text
生成一张1536×1536、1:1物品图鉴插画。写实古风绘画，与既有写实武侠物品图一致；玉、瓷、木、纸、金属分别呈现可信肌理，柔和左上光与自然体积明暗，低饱和沉稳设色、手绘写实质感，不是照片、3D、卡通或平涂线稿。主体：乾隆福字摹片；一张暖白纸片，中央仅一个黑色「福」字，四周素净，纸片完整，无印无题跋。年代形制：清取得语境；仅乾隆阶段五书；御笔题材民间摹写。历史器物的游戏流转不改变所述时代外形。只画一件帖子、字幅或载文片；文字严格服从本件白名单，其余卷藏或背向，不添印章题跋。品阶只通过用材匀净、接合细致、表面温润自然表达，不画品阶光效。单件完整居中，按外形取轻微三分之四视角；细长琴箫笔可斜置，长轴仍须完整。物件包围框宽高各不超过画布72%，四边留白至少14%。背景严格均匀浅暖灰RGB(230,225,216)，无纸纹、渐变、暗角、地面、接触投影或场景。全图只允许「福」共1个汉字，位置依主体描述，仅出现一次；除此之外不出现其他文字、伪字、落款、印章、年代、版本词或注释。排除人物、人脸、人手、人体、模特、礼盒、包装盒、支架、陈列底座、陪衬、拼贴、多视图、边框、UI、标注箭头、数字、印章、签名、logo、水印；现代材料、跨朝混搭、霓虹、魔光、粒子、自发光、神兽幻影。不要去除或伪造工具自身溯源标识。
```

## 质检要点

- 材质、轮廓、纹样与名录逐项对应；只用本件时代细部，待考造型不冒称精确复原。
- 单件完整，无人手、礼盒、配景、地面或投影；四边留白达标，暖灰底均匀。
- 全图只允许「福」共1个汉字，位置依主体描述，仅出现一次；除此之外不出现其他文字、伪字、落款、印章、年代、版本词或注释。
- `ready` 仅为提示词完成；本任务不出图，实际生成与画面审核由 Gemini 物品线完成。
