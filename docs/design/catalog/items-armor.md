# 物品图鉴 · 制式盔甲（`items-armor`）

> **归属（基准 §18）**：本表投影 `design/10` §3.4.1 的官府制式甲；通缉状态机不在本表定义。
> **上游**：AR-20、`design/10` §2.4、§3.4.1；年代口径引用 `design/02`。
> **引用而不重定义**：身份合法性由 `design/12` 判断，通缉与正常城门 `blocked` 由 `design/11` 执行。
> **标注约定**：具体军号、配色与效果均 **（原创扩展）**；形制须按宋／元／明／清分别核图。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `eq_songxunyijia` | 宋制巡役甲 | 制式盔甲·宋 | 黄 | **（原创扩展）** | `grade=3; slot=body; armorWeight=medium; lawProfile={uniform:true,allowedIdentityTags:[office_song_patrol],violation:uniformImpersonation,wantedIntent:activate,normalGate:blocked}` | 南宋灰蓝布甲配小片札甲护胸，短摆、皮带，无文字号衣 **（原创扩展）** |
| `eq_qingzaolijia` | 清制皂隶衣甲 | 制式盔甲·清 | 黄 | **（原创扩展）** | `grade=3; slot=body; armorWeight=light; lawProfile={uniform:true,allowedIdentityTags:[office_qing_yamen],violation:uniformImpersonation,wantedIntent:activate,normalGate:blocked}` | 清代深青号衣与黑红滚边，软帽另不入画，无胸背文字 **（原创扩展）** |
| `eq_yuanqibingjia` | 元制骑兵札甲 | 制式盔甲·元 | 玄 | **（原创扩展）** | `grade=6; slot=body; armorWeight=heavy; lawProfile={uniform:true,allowedIdentityTags:[office_yuan_army],violation:uniformImpersonation,wantedIntent:activate,normalGate:blocked}` | 元代铁札甲、皮革系片、暗褐肩带，骑兵短身甲，旧而完整 **（原创扩展）** |
| `eq_mingweisuojia` | 明制卫所甲 | 制式盔甲·明 | 玄 | **（原创扩展）** | `grade=6; slot=body; armorWeight=heavy; lawProfile={uniform:true,allowedIdentityTags:[office_ming_garrison],violation:uniformImpersonation,wantedIntent:activate,normalGate:blocked}` | 明代红布衬铁札、圆护胸与皮革束带，不画官衔文字 **（原创扩展）** |
| `eq_songjinjunburenjia` | 宋制禁军步人甲 | 制式盔甲·宋 | 地 | **（原创扩展）** | `grade=9; slot=body; armorWeight=heavy; lawProfile={uniform:true,allowedIdentityTags:[office_song_imperial_army],violation:uniformImpersonation,wantedIntent:activate,normalGate:blocked}` | 北宋重型札甲长摆、肩吞与护臂，铁灰配暗红绦，约半人高 **（原创扩展）** |
| `eq_mingjinyiweijia` | 明制锦衣卫甲 | 制式盔甲·明 | 地 | **（原创扩展）** | `grade=9; slot=body; armorWeight=medium; lawProfile={uniform:true,allowedIdentityTags:[office_ming_imperial_guard],violation:uniformImpersonation,wantedIntent:activate,normalGate:blocked}` | 明代深青曳撒式罩甲、窄金线与皮革护腰，不画飞鱼纹文字 **（原创扩展）** |
| `eq_yuansuweiqiejia` | 元宿卫怯薛甲 | 制式盔甲·元 | 天 | **（原创扩展）** | `grade=10; slot=body; armorWeight=heavy; catalogTian=true; divine=false; unique=true; price=null; lawProfile={uniform:true,allowedIdentityTags:[office_yuan_keshig],violation:uniformImpersonation,wantedIntent:activate,normalGate:blocked}` | 元代精工铁札与鎏金窄边、深蓝织物衬里，宿卫威仪不奇幻 **（原创扩展）** |
| `eq_qingyulinjia` | 清制御前侍卫甲 | 制式盔甲·清 | 天 | **（原创扩展）** | `grade=10; slot=body; armorWeight=heavy; catalogTian=true; divine=false; unique=true; price=null; lawProfile={uniform:true,allowedIdentityTags:[sect_qinggong,office_qing_imperial_guard],violation:uniformImpersonation,wantedIntent:activate,normalGate:blocked}` | 清代御前棉甲，明黄仅作窄边，铜钉、蓝黑甲片，无人物与文字 **（原创扩展）** |
