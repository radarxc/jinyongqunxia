# ART-hero-refine-b 报告 · 主角精修 B（鹿鼎记～雪山飞狐）· 复合基线风格立绘、分时期立绘、关键剧情插图配古风题字（作者 10-02 晚，codex gpt-6-astra ultra）

## 1. 摘要（3–6 行）

- 第6次续作**未完成全部返修，仍有阻断**：狄云乡装提示词已删除演员名；未取得可核验的李文秀经典剧照，点名的1基／2期／3景均未重出。
- 既有80张（基础16、阶段32、剧情32）与32幅题字核验记录保留，字体叠加0张；本轮新增／重出0张，图片与manifest全部逐字节不动；各图参考见§3。
- 四条指定检查与git diff --check均通过，但不等于剧照条件通过；未启动runner、未直接出图、未改变git状态。第4次磁盘停机与早期路由失败历史保留。

## 2. 产出（文件、行数、主要章节）

- `W` = `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w12/`；原图、实际提示词、归档及done留W；26张最终联系表含4张新旧对比（16基础）、15个人物阶段行、7组剧情，见`final-sheets-index.json`。
- 本任务既有PNG共80张：人物1024×1536、剧情1536×1024；提示词80文件／6112行，manifest 19文件／11948行；前轮库存见`W/retry5-report-inventory.json`。本轮仅改狄云提示词第32行与本报告；字节比对见`W/retry6-integrity.json`，核查依据见`W/research-retry6-still-blocker.md`。
- 分书实交：ch08 1基/3期/8景；ch09 4基/7期/5景；ch10 1基/2期/3景；ch11 2基/4期/3景；ch12 3基/6期/5景；ch13 3基/6期/5景；ch14 2基/4期/3景。`key-scenes.md`仅追加ch08扬州初行一行；其余既有行未改；本报告七节且≤100行。

## 3. 关键结论与数值

- 以下为前轮已入库的 retry3 成功作业，第6次未重出；ch10六图仍不满足本次审核。基础沿提交前同 asset_id 覆盖。每图按上传次序列参考；阶段第一件为前轮新基础。M1/M2 = `ref_npc_linghuchong__ch05_base01` / `ref_npc_xiaofeng__ch01_base01`；F1/F2 = `ref_npc_wangyuyan__ch01_base01` / `ref_npc_xiaolongnv__ch03_base01`。完整路径与 SHA 见manifest；狄云本次仅将classic_ref.version改为“2004 年经典影视造型”。

| 书／主角 | 基础（提交前同ID）与分时期资产／实际参考／重出 |
|---|---|
| ch08 韦小宝 | `por_npc_weixiaobao__ch08_youth_bishou_base`（重出0；参考：`weixiaobao_1998_chenxiaochun.jpg` → `HDGRP_112-1.png` → `M1` → `M2`）；`por_npc_weixiaobao__ch08_youth_scene_yangzhou_gambler`（重出0；参考：`por_npc_weixiaobao__ch08_youth_bishou_base` → `weixiaobao_1998_chenxiaochun.jpg` → `HDGRP_112-1.png` → `M1` → `M2`）；`por_npc_weixiaobao__ch08_youth_scene_qingmu_incense`（重出0；参考：`por_npc_weixiaobao__ch08_youth_bishou_base` → `weixiaobao_1998_chenxiaochun.jpg` → `HDGRP_112-1.png` → `M1` → `M2`）；`por_npc_weixiaobao__ch08_prime_scene_retirement`（重出0；参考：`por_npc_weixiaobao__ch08_youth_bishou_base` → `weixiaobao_1998_chenxiaochun.jpg` → `HDGRP_112-1.png` → `M1` → `M2`） |
| ch09 狄云 | `por_npc_diyun__ch09_youth_disguise_base`（重出1；参考：`diyun_2004_wuyue_baike03a.jpg` → `diyun_2004_wuyue_baike03b.jpg` → `HDGRP_38-1.png` → `M1` → `M2`）；`por_npc_diyun__ch09_youth_rural_base`（重出0；参考：`por_npc_diyun__ch09_youth_disguise_base` → `diyun_2004_wuyue_baike03a.jpg` → `HDGRP_38-1.png` → `M1` → `M2`）；`por_npc_diyun__ch09_youth_scene_maxipu_rural`（重出0；参考：`por_npc_diyun__ch09_youth_disguise_base` → `diyun_2004_wuyue_baike03a.jpg` → `HDGRP_38-1.png` → `M1` → `M2`）；`por_npc_diyun__ch09_youth_scene_jingzhou_prison`（重出0；参考：`por_npc_diyun__ch09_youth_disguise_base` → `diyun_2004_wuyue_baike03a.jpg` → `HDGRP_38-1.png` → `M1` → `M2`）；`por_npc_diyun__ch09_youth_scene_snowvalley_feathers`（重出0；参考：`por_npc_diyun__ch09_youth_disguise_base` → `diyun_2004_wuyue_baike03a.jpg` → `HDGRP_38-1.png` → `M1` → `M2`） |
| ch09 水笙 | `por_npc_shuisheng__ch09_youth_travel_base`（重出0；参考：`shuisheng_2004_shuchang_pnkds_20261002.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`）；`por_npc_shuisheng__ch09_youth_scene_yuyi`（重出0；参考：`por_npc_shuisheng__ch09_youth_travel_base` → `shuisheng_2004_shuchang_pnkds_20261002.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`）；`por_npc_shuisheng__ch09_youth_scene_xianghou`（重出0；参考：`por_npc_shuisheng__ch09_youth_travel_base` → `shuisheng_2004_shuchang_pnkds_20261002.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`） |
| ch09 戚芳 | `por_npc_qifang__ch09_youth_mother_base`（重出0；参考：`qifang_2004_hemeitian_baike_b812_20261002.jpg` → `qifang_2004_hemeitian_sina20260608_01.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`）；`por_npc_qifang__ch09_youth_scene_maxipu_wooden_sword`（重出0；参考：`por_npc_qifang__ch09_youth_mother_base` → `qifang_2004_hemeitian_baike_b812_20261002.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`）；`por_npc_qifang__ch09_youth_scene_wanfu_poetry_butterfly`（重出0；参考：`por_npc_qifang__ch09_youth_mother_base` → `qifang_2004_hemeitian_baike_b812_20261002.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`） |
| ch10 李文秀 | `por_npc_liwenxiu__ch10_youth_astuo_base`（重出0；参考：`linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`）；`por_npc_liwenxiu__ch10_youth_scene_astuo_snow_defense`（重出0；参考：`por_npc_liwenxiu__ch10_youth_astuo_base` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`）；`por_npc_liwenxiu__ch10_youth_scene_white_horse_east_departure`（重出0；参考：`por_npc_liwenxiu__ch10_youth_astuo_base` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`） |
| ch11 袁冠南 | `por_npc_yuanguannan__ch11_youth_scholar_base`（重出1；参考：`yuanguannan_1982_mengyuanwen_ok_static.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `M1` → `M2`）；`por_npc_yuanguannan__ch11_youth_scene_ink_bluff_zhuo`（重出0；参考：`por_npc_yuanguannan__ch11_youth_scholar_base` → `yuanguannan_1982_mengyuanwen_ok_static.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `M1` → `M2`）；`por_npc_yuanguannan__ch11_youth_scene_zizhu_first_twelve`（重出0；参考：`por_npc_yuanguannan__ch11_youth_scholar_base` → `yuanguannan_1982_mengyuanwen_ok_static.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `M1` → `M2`） |
| ch11 萧中慧 | `por_npc_xiaozhonghui__ch11_youth_departure_base`（重出0；参考：`xiaozhonghui_1982_huiyinghong_ok_static.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`）；`por_npc_xiaozhonghui__ch11_youth_scene_pine_cut_rope`（重出0；参考：`por_npc_xiaozhonghui__ch11_youth_departure_base` → `xiaozhonghui_1982_huiyinghong_ok_static.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`）；`por_npc_xiaozhonghui__ch11_youth_scene_zizhu_short_blade_guard`（重出1；参考：`por_npc_xiaozhonghui__ch11_youth_departure_base` → `xiaozhonghui_1982_huiyinghong_ok_static.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`） |
| ch12 陈家洛 | `por_npc_chenjialuo__ch12_youth_late_base`（重出1；参考：`chenjialuo-1976-zhengshaoqiu-sohu.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `M1` → `M2`）；`por_npc_chenjialuo__ch12_youth_scene_anxi_new_helmsman`（重出0；参考：`por_npc_chenjialuo__ch12_youth_late_base` → `chenjialuo-1976-zhengshaoqiu-sohu.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `M1` → `M2`）；`por_npc_chenjialuo__ch12_youth_scene_fragrant_tomb_westward`（重出0；参考：`por_npc_chenjialuo__ch12_youth_late_base` → `chenjialuo-1976-zhengshaoqiu-sohu.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `M1` → `M2`） |
| ch12 霍青桐 | `por_npc_huoqingtong__ch12_youth_early_base`（重出0；参考：`huoqingtong_1976_wangmingquan_sohu2024.jpg` → `huoqingtong_1976_wangmingquan_sinablog.jpg` → `HDGRP_113-1.png` → `F1` → `F2`）；`por_npc_huoqingtong__ch12_youth_scene_yellow_robe_quran_pursuit`（重出0；参考：`por_npc_huoqingtong__ch12_youth_early_base` → `huoqingtong_1976_wangmingquan_sohu2024.jpg` → `HDGRP_113-1.png` → `F1` → `F2`）；`por_npc_huoqingtong__ch12_youth_scene_blackwater_command`（重出0；参考：`por_npc_huoqingtong__ch12_youth_early_base` → `huoqingtong_1976_wangmingquan_sohu2024.jpg` → `HDGRP_113-1.png` → `F1` → `F2`） |
| ch12 喀丝丽 | `por_npc_kasili__ch12_youth_prepalace_base`（重出0；参考：`kasili-1976-yuanan-thepaper.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`）；`por_npc_kasili__ch12_youth_scene_oasis_first_meeting`（重出0；参考：`por_npc_kasili__ch12_youth_prepalace_base` → `kasili-1976-yuanan-thepaper.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`）；`por_npc_kasili__ch12_youth_scene_palace_warning_letter`（重出0；参考：`por_npc_kasili__ch12_youth_prepalace_base` → `kasili-1976-yuanan-thepaper.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`） |
| ch13 胡斐 | `por_npc_hufei__ch13_youth_base`（重出0；参考：`hufei_1991_mengfei_sohu2022.jpg` → `HDGRP_2-1.png` → `M1` → `M2`）；`por_npc_hufei__ch13_youth_scene_foshan_blood_mark_justice`（重出0；参考：`por_npc_hufei__ch13_youth_base` → `hufei_1991_mengfei_sohu2022.jpg` → `HDGRP_2-1.png` → `M1` → `M2`）；`por_npc_hufei__ch13_youth_scene_grave_return_blade`（重出0；参考：`por_npc_hufei__ch13_youth_base` → `hufei_1991_mengfei_sohu2022.jpg` → `HDGRP_2-1.png` → `M1` → `M2`） |
| ch13 程灵素 | `por_npc_chenglinsu__ch13_youth_alive_base`（重出0；参考：`chenglinsu_1991_gongcien_sohu2021.jpg` → `chenglinsu_1991_gongcien_sohu2022.jpg` → `HDGRP_3-1.png` → `F1` → `F2`）；`por_npc_chenglinsu__ch13_youth_scene_medicine_garden_meeting`（重出0；参考：`por_npc_chenglinsu__ch13_youth_alive_base` → `chenglinsu_1991_gongcien_sohu2021.jpg` → `HDGRP_3-1.png` → `F1` → `F2`）；`por_npc_chenglinsu__ch13_youth_scene_last_choice_save_hu`（重出0；参考：`por_npc_chenglinsu__ch13_youth_alive_base` → `chenglinsu_1991_gongcien_sohu2021.jpg` → `HDGRP_3-1.png` → `F1` → `F2`） |
| ch13 袁紫衣 | `por_npc_yuanziyi__ch13_youth_ziyi_base`（重出0；参考：`yuanziyi_1991_wuyujuan_sina2022_3.jpg` → `yuanziyi_1991_wuyujuan_sina2022_2.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`）；`por_npc_yuanziyi__ch13_youth_scene_purple_traveler_trial`（重出0；参考：`por_npc_yuanziyi__ch13_youth_ziyi_base` → `yuanziyi_1991_wuyujuan_sina2022_3.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`）；`por_npc_yuanziyi__ch13_youth_scene_assembly_yuanxing_reveal`（重出0；参考：`por_npc_yuanziyi__ch13_youth_ziyi_base` → `yuanziyi_1991_wuyujuan_sina2022_3.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`） |
| ch14 胡斐 | `por_npc_hufei__ch14_prime_base`（重出0；参考：`por_npc_hufei__ch13_youth_base` → `hufei_1991_mengfei_sohu2022.jpg` → `HDGRP_2-1.png` → `M1` → `M2`）；`por_npc_hufei__ch14_prime_scene_yubi_rescue`（重出0；参考：`por_npc_hufei__ch14_prime_base` → `hufei_1991_mengfei_sohu2022.jpg` → `HDGRP_2-1.png` → `M1` → `M2`）；`por_npc_hufei__ch14_prime_scene_snow_cliff_suspended_blade`（重出0；参考：`por_npc_hufei__ch14_prime_base` → `hufei_1991_mengfei_sohu2022.jpg` → `HDGRP_2-1.png` → `M1` → `M2`） |
| ch14 苗若兰 | `por_npc_miaoruolan__ch14_youth_base`（重出1；参考：`miaoruolan_1991_wangluyao_sina2023_1.jpg` → `miaoruolan_1991_wangluyao_sina2023_2.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`）；`por_npc_miaoruolan__ch14_youth_scene_manor_stop_fight`（重出0；参考：`por_npc_miaoruolan__ch14_youth_base` → `miaoruolan_1991_wangluyao_sina2023_1.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`）；`por_npc_miaoruolan__ch14_youth_scene_cave_plea_mercy`（重出0；参考：`por_npc_miaoruolan__ch14_youth_base` → `miaoruolan_1991_wangluyao_sina2023_1.jpg` → `linghuchong_game_cover_wuyuejianpai.png` → `F1` → `F2`） |

| 书／插图 ID | 规范题名／实际题字方式／实际参考／重出 |
|---|---|
| ch08 `cg_ch08_yangzhou_departure` | 「扬州初行」；原生；参考 `por_npc_weixiaobao__ch08_youth_bishou_base` → `por_npc_weixiaobao__ch08_youth_scene_yangzhou_gambler` → `por_npc_maoshiba__ch08_prime_base` → `M1` → `M2`；重出0 |
| ch08 `cg_ch08_xiao_xuanzi_wrestle` | 「布库结契」；原生；参考 `por_npc_weixiaobao__ch08_youth_bishou_base` → `por_npc_weixiaobao__ch08_youth_scene_yangzhou_gambler` → `por_npc_kangxi__ch08_youth_xiaoxuanzi_base` → `M1` → `M2`；重出0 |
| ch08 `cg_ch08_capture_aobai` | 「巧擒鳌拜」；原生；参考 `por_npc_weixiaobao__ch08_youth_scene_yangzhou_gambler` → `por_npc_kangxi__ch08_youth_xiaoxuanzi_base` → `por_npc_aobai__ch08_elder_base` → `M1` → `M2`；重出1 |
| ch08 `cg_ch08_qingmu_incense` | 「青木盟心」；原生；参考 `por_npc_weixiaobao__ch08_youth_bishou_base` → `por_npc_weixiaobao__ch08_youth_scene_qingmu_incense` → `por_npc_chenjinnan__ch08_prime_base` → `M1` → `M2`；重出0 |
| ch08 `cg_ch08_wutai_guard` | 「五台护驾」；原生；参考 `por_npc_weixiaobao__ch08_youth_bishou_base` → `por_npc_weixiaobao__ch08_youth_scene_qingmu_incense` → `por_npc_shuanger__ch08_youth_base` → `M1` → `M2`；重出0 |
| ch08 `cg_ch08_shenlong_mutiny` | 「神龙风变」；原生；参考 `por_npc_weixiaobao__ch08_youth_scene_qingmu_incense` → `por_npc_suquan__ch08_youth_base` → `por_npc_hongantong__ch08_elder_base` → `M1` → `M2`；重出0 |
| ch08 `cg_ch08_tongchi_betrayal` | 「通吃惊变」；原生；参考 `por_npc_weixiaobao__ch08_youth_scene_qingmu_incense` → `por_npc_chenjinnan__ch08_prime_base` → `por_npc_shuanger__ch08_youth_base` → `M1` → `M2`；重出0 |
| ch08 `cg_ch08_retirement_choice` | 「江湖归去」；原生；参考 `por_npc_weixiaobao__ch08_youth_bishou_base` → `por_npc_weixiaobao__ch08_prime_scene_retirement` → `por_npc_shuanger__ch08_youth_base` → `M1` → `M2`；重出0 |
| ch09 `cg_ch09_maxipu_sword` | 「麻溪剑影」；原生；参考 `por_npc_diyun__ch09_youth_scene_maxipu_rural` → `por_npc_qifang__ch09_youth_scene_maxipu_wooden_sword` → `por_npc_qichangfa__ch09_prime_rural_base` → `M1` → `M2`；重出1 |
| ch09 `cg_ch09_prison_bond` | 「铁狱同心」；原生；参考 `por_npc_diyun__ch09_youth_disguise_base` → `por_npc_diyun__ch09_youth_scene_jingzhou_prison` → `por_npc_dingdian__ch09_prime_prison_base` → `M1` → `M2`；重出0 |
| ch09 `cg_ch09_snow_valley` | 「雪谷相守」；原生；参考 `por_npc_diyun__ch09_youth_disguise_base` → `por_npc_diyun__ch09_youth_scene_snowvalley_feathers` → `por_npc_shuisheng__ch09_youth_scene_yuyi` → `M1` → `M2`；重出2 |
| ch09 `cg_ch09_wall_rescue` | 「夹墙生机」；原生；参考 `por_npc_diyun__ch09_youth_scene_snowvalley_feathers` → `por_npc_qifang__ch09_youth_scene_wanfu_poetry_butterfly` → `por_npc_wangui__ch09_youth_wanfu_base` → `M1` → `M2`；重出2 |
| ch09 `cg_ch09_tianning_treasure` | 「佛腹照心」；原生；参考 `por_npc_diyun__ch09_youth_scene_snowvalley_feathers` → `por_npc_qichangfa__ch09_prime_rural_base` → `por_npc_lingtusi__ch09_prime_magistrate_base` → `M1` → `M2`；重出1 |
| ch10 `cg_ch10_desert_chase` | 「白马风沙」；原生；参考 `por_npc_liwenxiu__ch10_youth_astuo_base` → `por_npc_liwenxiu__ch10_youth_scene_astuo_snow_defense` → `F1` → `F2`；重出0 |
| ch10 `cg_ch10_ghost_truth` | 「高昌辨鬼」；原生；参考 `por_npc_liwenxiu__ch10_youth_astuo_base` → `por_npc_liwenxiu__ch10_youth_scene_astuo_snow_defense` → `F1` → `F2`；重出0 |
| ch10 `cg_ch10_white_horse_return` | 「白马向东」；原生；参考 `por_npc_liwenxiu__ch10_youth_astuo_base` → `por_npc_liwenxiu__ch10_youth_scene_white_horse_east_departure` → `F1` → `F2`；重出0 |
| ch11 `cg_ch11_jujube_rescue` | 「笔墨退敌」；原生；参考 `por_npc_yuanguannan__ch11_youth_scholar_base` → `por_npc_yuanguannan__ch11_youth_scene_ink_bluff_zhuo` → `por_npc_xiaozhonghui__ch11_youth_departure_base` → `M1` → `M2`；重出0 |
| ch11 `cg_ch11_together_repulse_zhuo` | 「双刀同心」；原生；参考 `por_npc_yuanguannan__ch11_youth_scholar_base` → `por_npc_yuanguannan__ch11_youth_scene_zizhu_first_twelve` → `por_npc_xiaozhonghui__ch11_youth_scene_zizhu_short_blade_guard` → `M1` → `M2`；重出1 |
| ch11 `cg_ch11_benevolence_inscription` | 「仁者无敌」，画面「仁者無敵」；原生；参考 `por_npc_yuanguannan__ch11_youth_scholar_base` → `por_npc_yuanguannan__ch11_youth_scene_zizhu_first_twelve` → `por_npc_xiaozhonghui__ch11_youth_scene_zizhu_short_blade_guard` → `M1` → `M2`；重出1 |
| ch12 `cg_ch12_iron_gall_storm` | 「铁胆释嫌」；原生；参考 `por_npc_chenjialuo__ch12_youth_late_base` → `por_npc_chenjialuo__ch12_youth_scene_anxi_new_helmsman` → `por_npc_luobing__ch12_youth_recovered_base` → `M1` → `M2`；重出0 |
| ch12 `cg_ch12_liuhetower_oath` | 「六和盟誓」；原生；参考 `por_npc_chenjialuo__ch12_youth_late_base` → `por_npc_chenjialuo__ch12_youth_scene_anxi_new_helmsman` → `por_npc_qianlong__ch12_prime_palace_base` → `M1` → `M2`；重出0 |
| ch12 `cg_ch12_qingtong_breaks_formation` | 「黑水奇谋」；原生；参考 `por_npc_huoqingtong__ch12_youth_early_base` → `por_npc_huoqingtong__ch12_youth_scene_blackwater_command` → `F1` → `F2`；重出0 |
| ch12 `cg_ch12_kasili_enters_palace` | 「孤影入宫」；原生；参考 `por_npc_kasili__ch12_youth_prepalace_base` → `por_npc_kasili__ch12_youth_scene_palace_warning_letter` → `F1` → `F2`；重出0 |
| ch12 `cg_ch12_palace_warning` | 「宫墙急信」；原生；参考 `por_npc_kasili__ch12_youth_prepalace_base` → `por_npc_kasili__ch12_youth_scene_palace_warning_letter` → `F1` → `F2`；重出0 |
| ch13 `cg_ch13_foshan_accusation` | 「佛山问罪」；原生；参考 `por_npc_hufei__ch13_youth_base` → `por_npc_hufei__ch13_youth_scene_foshan_blood_mark_justice` → `por_npc_fengtianan__ch13_prime_base` → `M1` → `M2`；重出0 |
| ch13 `cg_ch13_yaowang_first_meet` | 「药圃初逢」；原生；参考 `por_npc_chenglinsu__ch13_youth_alive_base` → `por_npc_chenglinsu__ch13_youth_scene_medicine_garden_meeting` → `por_npc_hufei__ch13_youth_base` → `F1` → `F2`；重出0 |
| ch13 `cg_ch13_leaders_assembly` | 「群雄破局」；原生；参考 `por_npc_hufei__ch13_youth_scene_foshan_blood_mark_justice` → `por_npc_chenglinsu__ch13_youth_alive_base` → `por_npc_yuanziyi__ch13_youth_scene_assembly_yuanxing_reveal` → `M1` → `M2`；重出0 |
| ch13 `cg_ch13_lingsu_protects` | 「灵素护命」；原生；参考 `por_npc_chenglinsu__ch13_youth_alive_base` → `por_npc_chenglinsu__ch13_youth_scene_last_choice_save_hu` → `por_npc_hufei__ch13_youth_base` → `F1` → `F2`；重出0 |
| ch13 `cg_ch13_graveside_farewell` | 「墓畔长风」，画面「墓畔長風」；原生；参考 `por_npc_hufei__ch13_youth_base` → `por_npc_hufei__ch13_youth_scene_grave_return_blade` → `por_npc_yuanziyi__ch13_youth_scene_assembly_yuanxing_reveal` → `M1` → `M2`；重出0 |
| ch14 `cg_ch14_manor_poison_reveal` | 「雪庄辨伪」；原生；参考 `por_npc_miaoruolan__ch14_youth_base` → `por_npc_miaoruolan__ch14_youth_scene_manor_stop_fight` → `por_npc_baoshu__ch14_elder_base` → `F1` → `F2`；重出0 |
| ch14 `cg_ch14_snow_first_meet` | 「雪庄初会」；原生；参考 `por_npc_hufei__ch14_prime_base` → `por_npc_hufei__ch14_prime_scene_yubi_rescue` → `por_npc_miaoruolan__ch14_youth_scene_manor_stop_fight` → `M1` → `M2`；重出0 |
| ch14 `cg_ch14_cliff_raised_blade` | 「雪崖悬刀」，画面「雪崖懸刀」；原生；参考 `por_npc_hufei__ch14_prime_base` → `por_npc_hufei__ch14_prime_scene_snow_cliff_suspended_blade` → `por_npc_miaorenfeng__ch14_elder_base` → `M1` → `M2`；重出0 |

- 既有合计16+32+32=80；manifest重出合计14次（含第5次3幅依赖身份同步）；jobs.tsv的retry3完结记录94次、历史记录4次，均非计费API调用数。第6次新增作业0、重出0、上传剧照0；六图返修未完成，不以旧文件充当新产物。

## 4. 开放问题（附默认值）

- 已解决：旧路由失败改走既有沙箱外runner，旧路由根因未查明；第4次磁盘门槛阻断留下的水笙／戚芳各1基2期、狄云乡装及3幅依赖CG，均在第5次补齐并核验，见§3；历史失败与停机记录保留。
- 已解决：袁紫衣基础与两阶段已入库，胡斐跨两书同脸；双儿是否追加精修仍待作者决定，默认保留现有S级参考，不自行扩至七位夫人。
- 游戏头像缺可靠归属时仍用作者封面；旧白马AR-32文字身份默认值已被本次审核要求取代，尚未解决：未取得可靠李文秀剧照，连带六图未重出。默认保留旧候选与真实参考，不冒用其他角色图片、不自行豁免审核；需可靠图源或明确放宽要求后继续。鸳鸯剧照、唐代白马、胡斐发式、程灵素齐刘海既定口径保留。
- 三联／广州修订版纸本逐字终校仍（待考）：回目版本、囚中发式、鹿鼎退隐地点等见研究文件；默认成人化、服色、镜头及改命构图均为（原创扩展）。全部状态candidate，待作者美术审校。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。沿AR-35／AR-36同步主角身份、复合画风、阶段背景与古风题字，不改基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `catalog/key-scenes.md` ch08：青木捧香立誓、上书房擒鳌拜与茶盏信号、五台人物到场顺序、通吃岛崖道、退隐康熙不现场送行；旧行按只追加约束未改。
- 同文ch09：天宁寺勿让此前已死万震山／言达平争宝；雪谷已改水笙缀羽衣，夹墙救戚芳明确原创改命；`story/09-liancheng.md:158`仍将制衣方向写反，应改水笙抽淡黄衫线、用金钗穿缀；`catalog/npcs-ch09-liancheng.md:10/16`将铃剑双侠误配父女，应为水笙与汪啸风，水岱为落花流水之一。
- ch10–14：马家骏不活着送东归、白马唐代门禁、鸳鸯刀一长一短、枣林萧中慧受点穴；宫墙白巾非原著、佛山袁紫衣拦凤天南与钟阿四台上作证须核、药圃初遇傍晚浇花、程灵素葬地、胡苗月夜树枝代兵刃及苗若兰不在决斗中央；未选CG提示词ch11_pine_forest_blades、ch12_ancient_road_rescue、ch14_snow_rope_cut旧身份门禁交后续同步。
- `catalog/npcs-ch08-luding.md`：顺治／行痴、风际中未见独立主记录，协调者核查是否补入；双儿精修待作者拍板。已解决前轮入库重定向及done登记；通用ingest.py归档／锁路径、ingest8.py不记done与集中加工仍交维护者。本次新增阻断交协调者：李文秀剧照身份待核，不将6图标为返修完成；详见§4及W核查记录。
- 参考资料（2026-10-02／03访问，纸本待考）：[鹿鼎](https://www.zhwuxia.com/read/ludingjixiudingban/3431)、[连城](https://www.99csw.com/book/2174/63767.htm)、[白马](https://m.99csw.com/book/2178/64532.html)、[鸳鸯](https://www.99csw.com/book/4682/167669.htm)、[书剑](https://www.hetubook.com/book2/33/695.html)、[飞狐](https://www.kanunu8.com/wuxia/201102/1621/36916.html)、[雪山](https://www.hetubook.com/book2/36/740.html)。第6次2026-10-03核查：[角色页配图为插画](https://icyfiredh.github.io/data/2737.html)、[1982条目未标李文秀演员](https://wiki.d-addicts.com/White_Horse_Neighs_in_the_Western_Wind)；详见`W/research-retry6-still-blocker.md`，旧研究保留；无新增API、价格或已核实影视版本声明。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ⚠️ 本次返修未通过全部验收：狄云演员名已删且PNG哈希不变；李文秀可靠剧照未取得，1基／2期／3景均未重出，不能勾选完成。既有80图与题字、26张联系表保持不变。
- ✅ ch08–09人物目录检查：退出码0；原始输出见`W/validation-retry6.json`。
- ✅ ch10–14人物目录检查：退出码0；原始输出见`W/validation-retry6.json`。
- ✅ ch08–14场景目录检查：退出码0；原始输出见`W/validation-retry6.json`。
- ✅ 严格ID检查：退出码0、新增失败0；既有基线允许的1个未定义ID不属本次写集，见`W/validation-retry6.json`。
- ✅ git diff --check通过；本轮仅改狄云提示词1行和本报告（100行），其余工作区文件哈希不变，见`W/retry6-integrity.json`；done如实登记6项未完成；未运行构建立绘／索引或改变仓库状态的git命令。⚠️ 图源阻断及纸本考据见§4。
