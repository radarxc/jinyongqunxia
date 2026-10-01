# 物品图鉴 · 衣物（`items-clothing`）

> **归属（基准 §18）**：本表投影 `design/10` §3.4.1 的非制式外衣；制式盔甲和内甲分表。
> **上游**：AR-20、`design/10` §3.1、§3.4。
> **引用而不重定义**：时代服饰校验引用 `design/02`；身份与潜行归 `design/11` / `design/12`。
> **标注约定**：具体裁片、配色与效果无原著依据者均 **（原创扩展）**，不生成穿着人物。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `eq_buyi` | 粗布短褐 | 衣物·便服 | 黄 | **（原创扩展）** | `grade=3; slot=body; armorWeight=light; eva=2xG` | 灰褐交领短褐折叠平置，粗麻纹、布结系带，宋元通用平民感 **（原创扩展）** |
| `eq_jinzhuang` | 江湖劲装 | 衣物·劲装 | 黄 | **（原创扩展）** | `grade=3; slot=body; armorWeight=light; agi=1` | 深蓝窄袖对襟劲装，无人物，布带与护腕并拢，利落低饱和 **（原创扩展）** |
| `eq_sengyi` | 素色僧衣 | 衣物·袍服 | 黄 | 佛门通用；装备 **（原创扩展）** | `grade=3; slot=body; armorWeight=light; resMindPp=2` | 灰黄交领僧衣整齐叠置，棉麻哑光，不画袈裟文字与人物 **（原创扩展）** |
| `eq_daopao` | 青布道袍 | 衣物·袍服 | 玄 | 道门通用；装备 **（原创扩展）** | `grade=6; slot=body; armorWeight=light; effRes=2xG` | 青灰宽袖道袍平展，黑边与布扣，无太极符号，宋元朴雅感 **（原创扩展）** |
| `eq_yexingyi` | 夜行衣 | 衣物·潜行服 | 玄 | 江湖通用；规则 **（原创扩展）** | `grade=6; slot=body; armorWeight=light; tags=night; eva=2xG` | 墨黑偏蓝窄袖衣裤折叠成套，哑光布、无蒙面人物 **（原创扩展）** |
| `eq_huangmagua` | 黄马褂 | 衣物·礼服 | 玄 | 《鹿鼎记》·御赐黄马褂 | `grade=6; slot=body; armorWeight=light; dialogue.gov=15` **（原创扩展）** | 清代明黄色短褂单件平展，盘扣、深蓝滚边，不画补子文字 **（原创扩展形制）** |
| `eq_taohuajinpao` | 桃花锦袍 | 衣物·礼服 | 地 | **（原创扩展）** | `grade=9; slot=body; armorWeight=light; cha=3; talk=2xG` | 月白锦袍带淡粉桃枝暗纹，丝绸薄光、宽袖，南宋雅致感 **（原创扩展）** |
| `eq_xiyuhufu` | 西域胡服 | 衣物·骑装 | 地 | **（原创扩展）** | `grade=9; slot=body; armorWeight=light; coldResPp=4; rideSta=-10%` | 靛青窄袖长衫、皮革窄腰封与软毡边，西域元代感 **（原创扩展）** |
| `eq_yunjinhechang` | 云锦鹤氅 | 衣物·氅服 | 地 | **（原创扩展）** | `grade=9; slot=body; armorWeight=light; wis=2; resMindPp=4` | 银灰云锦长氅叠置，鹤羽仅作抽象暗纹，无官服补子 **（原创扩展）** |
| `eq_tianchanbaoyi` | 天蚕宝衣 | 衣物·宝衣 | 天 | **（原创扩展）** | `grade=10; slot=body; armorWeight=light; catalogTian=true; divine=false; unique=true; price=null; defOutPct=8%` | 珠白丝织长衣，极细金丝经纬、柔软可折叠，珍贵但不发光 **（原创扩展）** |
| `eq_zixiaqingyi` | 紫霞轻衣 | 衣物·宝衣 | 天 | **（原创扩展）** | `grade=10; slot=body; armorWeight=light; catalogTian=true; divine=false; unique=true; price=null; eva=8; mpMaxPct=5%` | 低饱和紫灰长衣，云霞渐染只在织纹中，轻薄无魔法光 **（原创扩展）** |
| `eq_wucanyi` | 乌蚕衣 | 衣物·宝衣 | 天 | 《连城诀》·狄云所得护身宝衣 **（待考：核材质与取得措辞）** | `grade=10; slot=body; armorWeight=medium; divine=true; buff=bf_daoqiang` | 乌黑偏褐的柔韧短衣，蚕丝般细密哑光纹理，可折叠、无金属甲片 **（待考形制；原创扩展表现）** |
