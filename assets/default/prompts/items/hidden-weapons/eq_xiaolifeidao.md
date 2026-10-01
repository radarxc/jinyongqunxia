---
asset_id: eq_xiaolifeidao
kind: item
name: 小李飞刀
category: hidden-weapons
category_name: 暗器
subcategory: 暗器·飞刀
grade: 天
source: 古龙《多情剑客无情剑》
effect: '`grade=10; hiddenKind=dart; catalogTian=true; divine=false; unique=true; price=null; perBattle=1; hiddenHit=8.4` **（原创扩展）**'
output: assets/default/item/hidden-weapons/eq_xiaolifeidao.png
manifest: assets/default/item/hidden-weapons/manifest.yaml
size: 1536x1536
background: RGB(230,225,216) 不透明均匀浅暖灰底，无投影、无地面
references:
- path: assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png
  use: 画风参考（作者已审）：清楚纤细的深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、左上柔光、浅暖灰近象牙底；不复制剑本身
- path: assets/default/baseline/item/ref_it_miji_jiuyin_shang__ch02_base01.png
  use: 画风参考（作者已审）：同上；不复制书册、题签与磨损
prompt_source: manifest:.agents/wt/ART-item-hidden-weapons/assets/default/item/hidden-weapons/manifest.yaml（任务工作区候选）
status: ready
---

# 小李飞刀（`eq_xiaolifeidao`）· 暗器 · 天阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 暗器·飞刀 |
| 品阶 | 天 —— 极稀有材质、完整独特轮廓、细密工艺与温润／冷润自然光泽；包装珍贵但克制（禁：自发光、神器光环、天字与星级） |
| 出处 | 古龙《多情剑客无情剑》 |
| 效果字段（只作理解，不画） | `grade=10; hiddenKind=dart; catalogTian=true; divine=false; unique=true; price=null; perBattle=1; hiddenHit=8.4` **（原创扩展）** |
| 外观要点（名录） | 一柄极简柳叶飞刀，银灰薄刃、无护手、黑木短柄，掌长 **（原创扩展）** |
| 类别专项 | 名针／飞刀按条目数量整齐并置；机括完整闭合，表现孔、簧、筒但不画发射或命中 |

## 提示词

```text
用途：游戏《天书录》default 物品图鉴候选，非商业致敬。题材：小李飞刀（eq_xiaolifeidao），暗器·飞刀，天下 grade=10；古龙《多情剑客无情剑》，不据书名断定历史年代。 主体：恰好一柄掌长极简柳叶飞刀；狭长银灰薄刃、清楚中央折面、无护手、黑木短柄，完整独立。比例与外观为原创扩展。 风格/构图：批准双基线细墨线、薄层低饱和罩染；1:1、1536×1536、完整居中、留白≥12%、包围框≤76%；浅暖平底，无地面投影。
```

## 排除项

文字、logo、水印、人物、手、第二柄刀、剑、护手、命中、血迹、投掷动作、弹道线、日本刀、现代战术刀、影视游戏复刻、摄影、3D、塑料感、霓虹、bloom、魔法阵、光效、品阶框、场景、地面、投影

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：名针／飞刀按条目数量整齐并置；机括完整闭合，表现孔、簧、筒但不画发射或命中；专项排除：命中人体、血迹、现代枪械化、爆炸、弹道线、零件爆炸图。
- 品阶信号：极稀有材质、完整独特轮廓、细密工艺与温润／冷润自然光泽；包装珍贵但克制（禁：自发光、神器光环、天字与星级）。
- 对题：画面必须能辨认为“暗器·飞刀”里的“小李飞刀”，不得画成同类其他物品。
