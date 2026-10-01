# 物品图鉴 · 内甲（`items-innerarmor`）

> **归属（基准 §18）**：本表投影 `design/10` §3.1、§3.4.1 的 `innerBody` 装备。
> **上游**：AR-20、`design/10` §3.1.1、§4.1、§5。
> **引用而不重定义**：刀枪减伤、猬刺和抗性 Buff 见 `design/06`；存档迁移见 `design/10` §3.1.1。
> **标注约定**：原著未明确材质或形制处标 **（待考）**；玩法与出图造型均 **（原创扩展）**。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `eq_zhusutiejia` | 竹丝贴甲 | 内甲·编织 | 黄 | **（原创扩展）** | `grade=3; slot=innerBody; defOutK=0.10; defInK=0.08` | 细竹篾与麻线编成短背心，浅褐色、柔韧薄片，半身尺度 **（原创扩展）** |
| `eq_pirutiejia` | 皮绒贴甲 | 内甲·皮甲 | 黄 | **（原创扩展）** | `grade=3; slot=innerBody; resBleedPp=2` | 深褐软皮短背心，内衬灰绒、细密缝线，无金属钉 **（原创扩展）** |
| `eq_ruansijia` | 软丝甲 | 内甲·丝甲 | 玄 | **（原创扩展）** | `grade=6; slot=innerBody; weaponZ4=2%` | 灰银丝线密织短衣，可折叠、微金属光但柔软 **（原创扩展）** |
| `eq_jinsijia` | 金丝甲 | 内甲·金丝 | 玄 | 武侠通用意象；本作 **（原创扩展）** | `grade=6; slot=innerBody; weaponZ4=3%` | 暗金细丝交织无袖背心，织孔极细、边缘布包条 **（原创扩展）** |
| `eq_jinsibeixin` | 金丝背心 | 内甲·金丝背心 | 地 | 《碧血剑》·木桑道人、袁承志 | `grade=8; slot=innerBody; weaponZ4=3%xG; fixed=af_jianjia,af_renxing,af_tipo` **（原创扩展）** | 乌金丝、发丝与金丝猴毛混织的暗金短背心，柔软贴身 **（待考形制）** |
| `eq_xuansuoruanjia` | 玄锁软甲 | 内甲·锁甲 | 地 | **（原创扩展）** | `grade=9; slot=innerBody; weaponZ4=5%; mov=0` | 乌黑极细锁环短衫，环径如米粒，布边收口、可卷叠 **（原创扩展）** |
| `eq_ruanweijia` | 软猬甲 | 内甲·猬刺宝甲 | 天 | 《射雕英雄传》·桃花岛宝物 | `grade=10; slot=innerBody; divine=true; buff=bf_weici,bf_daoqiang` | 深褐软甲表面密布短刺，贴身背心轮廓，刺短而不血腥 **（待考形制；原创扩展表现）** |
| `eq_tianchansiruanjia` | 天蚕丝软甲 | 内甲·蚕丝软甲 | 天 | **（原创扩展）** | `grade=10; slot=innerBody; catalogTian=true; divine=false; unique=true; price=null; weaponZ4=7%; poisonResPp=6` | 珠灰天蚕丝密织短衣，银丝暗纹、柔软可卷，珍稀但不发光 **（原创扩展）** |
