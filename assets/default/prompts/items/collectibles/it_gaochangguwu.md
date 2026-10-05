---
asset_id: it_gaochangguwu
kind: item
name: 高昌古物
category: collectibles
category_name: 奢侈品 / 礼品
subcategory: antique
grade: 玄
source: B13 白马：标作三联版的目录与梗概 https://www.99csw.com/book/2178/index.htm；具体取得为（原创扩展），未核事实见名录（待考）
effect: '`grade=6; kind=collectible; sub=antique; stack=1; tags=[relic]; giftValue=2; giftTo={preferred:[scholar,merchant,collector]}; eraRange=[tang]; provenance=book; study={art:art,delta:3,once:true}; appraise={art:art,dc:44}`'
output: assets/default/item/collectibles/it_gaochangguwu.png
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

# 高昌古物（`it_gaochangguwu`）· 奢侈品 / 礼品

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | antique · 其他古玩 |
| 品阶 | 玄上（grade=6）——用材匀净、接合细致、表面温润自然 |
| 出处 | [B13 · 白马：标作三联版的目录与梗概](https://www.99csw.com/book/2178/index.htm) |
| 效果字段（只作理解，不画） | `grade=6; kind=collectible; sub=antique; stack=1; tags=[relic]; giftValue=2; giftTo={preferred:[scholar,merchant,collector]}; eraRange=[tang]; provenance=book; study={art:art,delta:3,once:true}; appraise={art:art,dc:44}` |
| 外观要点（名录） | 一件合拢的褐色木质器物陈设，素面矩形木盖与盒体合为单体，双掌宽，无锁无字 |
| 类别专项 | 只画本件完整清玩；成组库存的图标仅展示指定代表物，不增添陪衬、不画人像与展开书页。 |
| 年代／取得限制 | 白马；默认普通旧藏，不替代主线牺牲物 |
| 文字白名单 | 无；全部字面卷藏或朝后 |
| 说明 | 《白马啸西风》高昌旧藏沿用既有古物总名，具体器类须核修订版。图标用一件素木容器代示，不宣称书中具名；宜赠藏家，保留原鉴赏收益，取得须与牺牲物分开。 |

## Gemini 提示词

```text
生成一张1536×1536、1:1物品图鉴插画。写实古风绘画，与既有写实武侠物品图一致；玉、瓷、木、纸、金属分别呈现可信肌理，柔和左上光与自然体积明暗，低饱和沉稳设色、手绘写实质感，不是照片、3D、卡通或平涂线稿。主体：高昌古物；一件合拢的褐色木质器物陈设，素面矩形木盖与盒体合为单体，双掌宽，无锁无字。年代形制：唐武周取得语境；白马；默认普通旧藏，不替代主线牺牲物。历史器物的游戏流转不改变所述时代外形。只画本件完整清玩；成组库存的图标仅展示指定代表物，不增添陪衬、不画人像与展开书页。品阶只通过用材匀净、接合细致、表面温润自然表达，不画品阶光效。单件完整居中，按外形取轻微三分之四视角；细长琴箫笔可斜置，长轴仍须完整。物件包围框宽高各不超过画布72%，四边留白至少14%。背景严格均匀浅暖灰RGB(230,225,216)，无纸纹、渐变、暗角、地面、接触投影或场景。不出现任何可读文字、汉字、伪字或字母；所有原有题款朝后或卷藏。排除人物、人脸、人手、人体、模特、礼盒、包装盒、支架、陈列底座、陪衬、拼贴、多视图、边框、UI、标注箭头、数字、印章、签名、logo、水印；现代材料、跨朝混搭、霓虹、魔光、粒子、自发光、神兽幻影。不要去除或伪造工具自身溯源标识。
```

## 质检要点

- 材质、轮廓、纹样与名录逐项对应；只用本件时代细部，待考造型不冒称精确复原。
- 单件完整，无人手、礼盒、配景、地面或投影；四边留白达标，暖灰底均匀。
- 不出现任何可读文字、汉字、伪字或字母；所有原有题款朝后或卷藏。
- `ready` 仅为提示词完成；本任务不出图，实际生成与画面审核由 Gemini 物品线完成。
