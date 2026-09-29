# 门派武学图鉴 · 道家与神雕诸派（`skills-daojia`）

> **版本**：v1.3（CXd 扩充；全局审计）；经脉系统落地、绝招数量调整（2026-09-27）；M4 返修（解锁层 7/9/10、同门绝招独立路线）；图鉴一致性审计、天中 / 地中绝招数统一、外放标记、绝招路线叙事化（2026-09-28）；经脉落地终审、路线叙事第三轮（2026-09-29）。

> **归属**（基准 §18）：`design/catalog/skills-*.md` 门派武学图鉴。本文件覆盖：**全真教、古墓派（含李莫愁一系）、杨过自创与传承（含独孤求败剑冢剑意）、武当派（倚天 → 笑傲 → 侠客 → 书剑 → 飞狐）、绝情谷**。
> **上游**：`decisions/author-decisions.md`、`decisions/author-requirements.md`（含 AR-14）、`00-canon.md`、`decisions/rulings-v1.md`、`design/21` v2.0。数据结构、层数节奏、招式预算、范围模板、特殊武学规则以 `design/05` 为准；附带效果只引用 `design/06` 目录中已有的 `bf_` ID；属性与资质 ID 见 `design/03`；书界、境界、残篇、再遇、印证见 `design/02`；合击与阵法流程归 `design/09`；兵器与名器归 `design/10`；套装本体归 `design/07`；门派身份、职级和月钱归 `design/12`、门派资料见 `design/17`；战斗经脉运行、招式路线、调息、护体内劲与经脉速度归 `design/21`；经脉、穴位、冲穴、周天与九转只接入 `design/15`；资源、资源点与营生只接入 `design/16`；大地图与时代图层只接入 `design/11`；NPC 招募、生卒与跨书界同伴归 `design/18`；正邪主线与选择节点归 `design/story/`，本文任务号仅是武学来源接口。
> **跨组引用（只引用 ID，不在本文定义）**：九阴真经系 `sk_jiuyin`；周伯通 `sk_zuoyouhubo`、`sk_kongming`；独孤九剑 `sk_dugu9`（五岳组）；一阳指 `sk_yiyangzhi`（大理组）；蛤蟆功 `sk_hama`、铁掌功 `sk_tiezhang`（西域组）；铁砂掌 `sk_tieshazhang`（05）；玄冥神掌 `sk_xuanming`；**武当九阳功**（倚天组定义，本文暂记 `sk_wudangjiuyang`，以倚天组 ID 为准）。
> **引用而不重定义**：本文定义本组武学内容卡与候选套装成员关系；上述系统的通用规则均只引用归属文档。跨文档尚未同步时，以本段上游优先级为准。
> **标注约定**：**（原创扩展）** = 原著没有的内容；**（待考）** = 原著事实尚需以三联/广州修订版逐字核对；**（待核实）** = 技术事实尚未联网确认；**（待实测）** = 需要真机或真账号验证；**【建议值】** = 依赖其他文档、暂给可用数值并在文末登记。**★** = 该书界原著未见本门派或本武学，可习得属原创扩展（门派存续推定），须由 `chapters/` 采纳。已由上游定稿的数值不再统称建议值；尚未归属文档定稿者逐项标 **【建议值】**。

---

## 0. 阅读指引与记法
### 绝招显式路线索引（镜像正文卡，非覆写层；2026-09-28）

本索引镜像正文卡，非覆写层；与正文不一致即为错误，并以正文为准。每记绝招使用独立稳定路线与显式穴位序列。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 11 天中 | `sk_xiantiangong` | `mv_xiantiangong_gangqi` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_xiantiangong_gangqi}` | `mfr_xiantiangong_gangqi` | `MeridianRouteDef{moveRef:mv_xiantiangong_gangqi; ultimate:true; purpose:defense}`；`ap_renmai_qihai/66/90→ap_renmai_guanyuan/69/120→ap_dumai_yaoshu/72/150→ap_dumai_jizhong/75/200→ap_dumai_shuigou/78/170→ap_dumai_shenzhu/81/140→ap_shouyangming_quchi/84/110→ap_shouyangming_shousanli/87/100→ap_shouyangming_hegu/90/130→ap_dumai_baihui/93/160` |
| 11 天中 | `sk_xiantiangong` | `mv_xiantiangong_wuqi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_xiantiangong_wuqi}` | `mfr_xiantiangong_wuqi` | `MeridianRouteDef{moveRef:mv_xiantiangong_wuqi; ultimate:true; purpose:attack}`；`ap_shoushaoyin_shenmen/80/100→ap_shoutaiyin_tianfu/80/120→ap_yinqiao_lieque/80/140→ap_yinwei_lianquan/80/160→ap_zujueyin_taichong/80/180→ap_zushaoyin_fuliu/80/200→ap_zushaoyin_yongquan/80/220→ap_zutaiyin_xuehai/80/240→ap_renmai_qihai/80/260→ap_renmai_zhongwan/80/280` |
| 10 天下 | `sk_tiangang` | `mv_tiangang_hewei` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_tiangang_hewei}` | `mfr_tiangang_hewei` | `MeridianRouteDef{moveRef:mv_tiangang_hewei; ultimate:true; purpose:attack}`；`ap_chongmai_qichong/75/100→ap_renmai_guanyuan/75/110→ap_shoushaoyin_shenmen/75/120→ap_zutaiyin_yinlingquan/75/130→ap_zushaoyang_yanglingquan/75/140→ap_zuyangming_zusanli/75/150→ap_zutaiyang_chengshan/75/160→ap_daimai_weidao/75/170→ap_yangqiao_shenmai/75/180→ap_zushaoyin_yongquan/75/190` |
| 10 天下 | `sk_tiangang` | `mv_tiangang_guiyi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_tiangang_guiyi}` | `mfr_tiangang_guiyi` | `MeridianRouteDef{moveRef:mv_tiangang_guiyi; ultimate:true; purpose:attack}`；`ap_yinqiao_jingming/80/100→ap_yinwei_fushe/80/120→ap_zujueyin_ququan/80/140→ap_zushaoyin_dazhong/80/160→ap_zushaoyin_yingu/80/180→ap_zutaiyin_taibai/80/200→ap_renmai_huiyin/80/220→ap_renmai_zhongji/80/240→ap_shoujueyin_tianchi/80/260→ap_shoushaoyin_shaochong/80/280` |
| 8 地中 | `sk_jinguanyusuo` | `mv_jinguanyusuo_zhoutian` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_jinguanyusuo_zhoutian}` | `mfr_jinguanyusuo_zhoutian` | `MeridianRouteDef{moveRef:mv_jinguanyusuo_zhoutian; ultimate:true; purpose:defense}`；`ap_zutaiyang_cuanzhu/90/100→ap_zutaiyang_zhiyin/90/120→ap_zuyangming_sibai/90/140→ap_dumai_shangxing/90/160→ap_dumai_zhiyang/90/180→ap_shoushaoyang_yifeng/90/200→ap_shoutaiyang_tinggong/90/220→ap_shouyangming_pianli/90/240` |
| 7 地下 | `sk_tongguijian` | `mv_tongguijian_tonggui` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tongguijian_tonggui}` | `mfr_tongguijian_tonggui` | `MeridianRouteDef{moveRef:mv_tongguijian_tonggui; ultimate:true; purpose:attack}`；`ap_shoujueyin_ximen/90/100→ap_shoushaoyin_shaohai/90/120→ap_shoutaiyin_taiyuan/90/140→ap_yinqiao_jingming/90/160→ap_yinwei_fushe/90/180→ap_zujueyin_ququan/90/200→ap_zushaoyin_dazhong/90/220→ap_shoutaiyang_wangu/90/240` |
| 10 天下 | `sk_yunvxinjing` | `mv_yunvxinjing_hufa` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_yunvxinjing_hufa}` | `mfr_yunvxinjing_hufa` | `MeridianRouteDef{moveRef:mv_yunvxinjing_hufa; ultimate:true; purpose:defense}`；`ap_daimai_zulinqi/66/90→ap_chongmai_qixue/69/120→ap_yinwei_zhubin/72/150→ap_renmai_guanyuan/75/200→ap_zushaoyin_shuiquan/78/170→ap_zutaiyang_shenshu/81/140→ap_dumai_yaoshu/84/110→ap_dumai_jizhong/87/100→ap_dumai_shendao/90/130→ap_dumai_baihui/93/160` |
| 10 天下 | `sk_yunvxinjing` | `mv_yunvxinjing_bingxin` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_yunvxinjing_bingxin}` | `mfr_yunvxinjing_bingxin` | `MeridianRouteDef{moveRef:mv_yunvxinjing_bingxin; ultimate:true; purpose:defense}`；`ap_renmai_guanyuan/80/100→ap_zushaoyin_shuiquan/80/120→ap_zushaoyin_fuliu/80/140→ap_zutaiyin_xuehai/80/160→ap_yinwei_zhubin/80/180→ap_yinqiao_lougu/80/200→ap_shoushaoyin_tongli/80/220→ap_shoujueyin_jianshi/80/240→ap_renmai_shuifen/80/260→ap_renmai_danzhong/80/280` |
| 7 地下 | `sk_chilianshenzhang` | `mv_chilianshenzhang_xiangxu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_chilianshenzhang_xiangxu}` | `mfr_chilianshenzhang_xiangxu` | `MeridianRouteDef{moveRef:mv_chilianshenzhang_xiangxu; ultimate:true; purpose:attack}`；`ap_zujueyin_ligou/90/100→ap_zujueyin_xingjian/90/120→ap_zujueyin_ququan/90/140→ap_zushaoyin_dazhong/90/160→ap_zushaoyin_yingu/90/180→ap_zutaiyin_taibai/90/200→ap_renmai_huiyin/90/220→ap_shoujueyin_laogong/90/240` |
| 7 地下 | `sk_jinlingsuo` | `mv_jinlingsuo_shepo` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_jinlingsuo_shepo}` | `mfr_jinlingsuo_shepo` | `MeridianRouteDef{moveRef:mv_jinlingsuo_shepo; ultimate:true; purpose:attack}`；`ap_zushaoyin_taixi/90/100→ap_zutaiyin_shangqiu/90/120→ap_renmai_guanyuan/90/140→ap_renmai_yinjiao/90/160→ap_shoujueyin_quze/90/180→ap_shoushaoyin_qingling/90/200→ap_shoutaiyin_chize/90/220→ap_shoushaoyang_yangchi/90/240` |
| 7 地下 | `sk_bingpoyinzhen` | `mv_bingpoyinzhen_shehun` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_bingpoyinzhen_shehun}` | `mfr_bingpoyinzhen_shehun` | `MeridianRouteDef{moveRef:mv_bingpoyinzhen_shehun; ultimate:true; purpose:attack}`；`ap_zushaoyin_shuiquan/90/100→ap_zutaiyin_diji/90/120→ap_yinwei_qimen/90/140→ap_shoujueyin_tianquan/90/160→ap_shoushaoyin_shaofu/90/180→ap_shoujueyin_neiguan/90/200→ap_shoujueyin_daling/90/220→ap_shoutaiyin_shaoshang/90/240` |
| 9 地上 | `sk_gumuqinggong` | `mv_gumuqinggong_youshen` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_gumuqinggong_youshen}` | `mfr_gumuqinggong_youshen` | `MeridianRouteDef{moveRef:mv_gumuqinggong_youshen; ultimate:true; purpose:movement}`；`ap_daimai_wushu/82/90→ap_daimai_zhangmen/84/110→ap_yangqiao_fuyang/86/130→ap_zushaoyang_fengshi/88/150→ap_zushaoyang_yanglingquan/90/210→ap_zushaoyang_waiqiu/92/170→ap_zushaoyang_xuanzhong/94/140→ap_zushaoyin_yongquan/96/120` |
| 9 地上 | `sk_gumuqinggong` | `mv_gumuqinggong_fenying` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_gumuqinggong_fenying}` | `mfr_gumuqinggong_fenying` | `MeridianRouteDef{moveRef:mv_gumuqinggong_fenying; ultimate:true; purpose:movement}`；`ap_zujueyin_taichong/90/100→ap_zushaoyin_fuliu/90/120→ap_zushaoyin_yongquan/90/140→ap_zutaiyin_xuehai/90/160→ap_renmai_qihai/90/180→ap_renmai_zhongwan/90/200→ap_shoujueyin_tianquan/90/220→ap_shoushaoyin_shaofu/90/240` |
| 11 天中 | `sk_anran` | `mv_anran_xiaohun` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_anran_xiaohun}` | `mfr_anran_xiaohun` | `MeridianRouteDef{moveRef:mv_anran_xiaohun; ultimate:true; purpose:attack}`；`ap_zushaoyin_shufu/80/100→ap_zutaiyin_shangqiu/80/120→ap_yinwei_fuai/80/140→ap_yinqiao_jiaoxin/80/160→ap_renmai_shimen/80/180→ap_shoushaoyin_yinxi/80/200→ap_shoutaiyin_yuji/80/220→ap_shoujueyin_quze/80/240→ap_shoujueyin_neiguan/80/260→ap_shoujueyin_laogong/80/280` |
| 11 天中 | `sk_anran` | `mv_anran_xiangru` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_anran_xiangru}` | `mfr_anran_xiangru` | `MeridianRouteDef{moveRef:mv_anran_xiangru; ultimate:true; purpose:attack}`；`ap_zushaoyin_lingxu/80/100→ap_zutaiyin_dabao/80/120→ap_yinwei_qimen/80/140→ap_yinqiao_sanyinjiao/80/160→ap_renmai_qugu/80/180→ap_shoushaoyin_tongli/80/200→ap_shoujueyin_tianquan/80/220→ap_shoujueyin_quze/80/240→ap_shoujueyin_neiguan/80/260→ap_shoujueyin_laogong/80/280` |
| 11 天中 | `sk_anran` | `mv_anran_daimu` `MoveDef{unlock:10; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_anran_daimu}` | `mfr_anran_daimu` | `MeridianRouteDef{moveRef:mv_anran_daimu; ultimate:true; purpose:attack}`；`ap_dumai_mingmen/66/90→ap_dumai_zhiyang/69/120→ap_dumai_shendao/72/150→ap_dumai_baihui/75/200→ap_shouyangming_quchi/78/170→ap_shouyangming_shousanli/81/140→ap_shouyangming_hegu/84/110→ap_shouyangming_shangyang/87/100→ap_zushaoyin_yongquan/90/130→ap_shoujueyin_laogong/93/160` |
| 11 天中 | `sk_xuantie` | `mv_xuantie_daqiao` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_xuantie_daqiao}` | `mfr_xuantie_daqiao` | `MeridianRouteDef{moveRef:mv_xuantie_daqiao; ultimate:true; purpose:attack}`；`ap_dumai_yaoshu/75/100→ap_dumai_jizhong/75/110→ap_zutaiyang_shenshu/75/120→ap_zutaiyang_chengshan/75/130→ap_zushaoyang_fengshi/75/140→ap_chongmai_huangshu/75/150→ap_shouyangming_quchi/75/160→ap_shouyangming_shousanli/75/170→ap_shouyangming_hegu/75/180→ap_shoushaoyang_yangchi/75/190` |
| 11 天中 | `sk_xuantie` | `mv_xuantie_caomu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_xuantie_caomu}` | `mfr_xuantie_caomu` | `MeridianRouteDef{moveRef:mv_xuantie_caomu; ultimate:true; purpose:attack}`；`ap_dumai_yaoshu/68/80→ap_dumai_jizhong/70/100→ap_dumai_shenzhu/72/120→ap_chongmai_siman/74/140→ap_chongmai_zhongzhu/76/180→ap_shoujueyin_tianchi/78/220→ap_shoujueyin_neiguan/80/160→ap_shoujueyin_laogong/82/130→ap_shoujueyin_zhongchong/84/110→ap_shoushaoyang_yangchi/86/90` |
| 11 天中 | `sk_suxin` | `mv_suxin_huaqian` `MoveDef{unlock:10; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_suxin_huaqian}` | `mfr_suxin_huaqian` | `MeridianRouteDef{moveRef:mv_suxin_huaqian; ultimate:true; purpose:attack}`；`ap_daimai_daimai/75/100→ap_daimai_zhangmen/75/110→ap_chongmai_shiguan/75/120→ap_yinqiao_zhaohai/75/130→ap_zutaiyin_diji/75/140→ap_yangqiao_fuyang/75/150→ap_zushaoyang_waiqiu/75/160→ap_shoutaiyang_qiangu/75/170→ap_shoutaiyang_wangu/75/180→ap_shoushaoyang_yangchi/75/190` |
| 11 天中 | `sk_suxin` | `mv_suxin_hebi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_suxin_hebi}` | `mfr_suxin_hebi` | `MeridianRouteDef{moveRef:mv_suxin_hebi; ultimate:true; purpose:attack}`；`ap_chongmai_dahe/80/100→ap_chongmai_siman/80/120→ap_daimai_wushu/80/140→ap_daimai_jingmen/80/160→ap_yinqiao_lougu/80/180→ap_shoutaiyin_taiyuan/80/200→ap_shoushaoyin_tongli/80/220→ap_shouyangming_yangxi/80/240→ap_shoutaiyang_wangu/80/260→ap_shoushaoyang_yangchi/80/280` |
| 11 天中 | `sk_suxin` | `mv_suxin_juan` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_suxin_juan}` | `mfr_suxin_juan` | `MeridianRouteDef{moveRef:mv_suxin_juan; ultimate:true; purpose:defense}`；`ap_dumai_mingmen/75/100→ap_zuyangming_zusanli/75/110→ap_shoushaoyin_shenmen/75/120→ap_zutaiyin_yinlingquan/75/130→ap_yangwei_jinmen/75/140→ap_zutaiyang_weizhong/75/150→ap_dumai_shenzhu/75/160→ap_dumai_shendao/75/170→ap_renmai_qihai/75/180→ap_shoushaoyang_waiguan/75/190` |
| 8 地中 | `sk_zhongjianyi` | `mv_zhongjianyi_hengxing` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_zhongjianyi_hengxing}` | `mfr_zhongjianyi_hengxing` | `MeridianRouteDef{moveRef:mv_zhongjianyi_hengxing; ultimate:true; purpose:defense}`；`ap_dumai_shangxing/90/100→ap_dumai_zhiyang/90/120→ap_shoushaoyang_yifeng/90/140→ap_shoutaiyang_tinggong/90/160→ap_shouyangming_pianli/90/180→ap_yangqiao_dicang/90/200→ap_yangqiao_pucan/90/220→ap_yangwei_toulinqi/90/240` |
| 9 地上 | `sk_mujianyi` | `mv_mujianyi_caomu` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_mujianyi_caomu}` | `mfr_mujianyi_caomu` | `MeridianRouteDef{moveRef:mv_mujianyi_caomu; ultimate:true; purpose:defense}`；`ap_renmai_qihai/82/90→ap_dumai_mingmen/84/110→ap_chongmai_henggu/86/130→ap_daimai_jingmen/88/150→ap_zutaiyang_shenshu/90/210→ap_zushaoyin_lingxu/92/170→ap_shoujueyin_tianchi/94/140→ap_shoujueyin_laogong/96/120` |
| 9 地上 | `sk_mujianyi` | `mv_mujianyi_wanwu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_mujianyi_wanwu}` | `mfr_mujianyi_wanwu` | `MeridianRouteDef{moveRef:mv_mujianyi_wanwu; ultimate:true; purpose:attack}`；`ap_zushaoyang_riyue/90/100→ap_zutaiyang_chengshan/90/120→ap_zutaiyang_xinshu/90/140→ap_zuyangming_renying/90/160→ap_dumai_mingmen/90/180→ap_dumai_yinjiao/90/200→ap_shoushaoyang_yangchi/90/220→ap_shoushaoyang_waiguan/90/240` |
| 11 天中 | `sk_taijiquan` | `mv_taijiquan_shizi` `MoveDef{unlock:10; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_taijiquan_shizi}` | `mfr_taijiquan_shizi` | `MeridianRouteDef{moveRef:mv_taijiquan_shizi; ultimate:true; purpose:attack}`；`ap_daimai_daimai/75/100→ap_dumai_zhiyang/75/110→ap_shoutaiyin_taiyuan/75/120→ap_shoutaiyang_wangu/75/130→ap_zutaiyang_weizhong/75/140→ap_zushaoyin_taixi/75/150→ap_shouyangming_quchi/75/160→ap_shouyangming_pianli/75/170→ap_shouyangming_shousanli/75/180→ap_shoujueyin_laogong/75/190` |
| 11 天中 | `sk_taijiquan` | `mv_taijiquan_baohu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_taijiquan_baohu}` | `mfr_taijiquan_baohu` | `MeridianRouteDef{moveRef:mv_taijiquan_baohu; ultimate:true; purpose:attack}`；`ap_zushaoyin_shufu/80/100→ap_zutaiyin_shangqiu/80/120→ap_renmai_qihai/80/140→ap_shoujueyin_jianshi/80/160→ap_shoushaoyin_lingdao/80/180→ap_shoutaiyin_kongzui/80/200→ap_yinqiao_jingming/80/220→ap_yinwei_qimen/80/240→ap_shouyangming_hegu/80/260→ap_shoujueyin_laogong/80/280` |
| 11 天中 | `sk_taijiquan` | `mv_taijiquan_yunshou` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_taijiquan_yunshou}` | `mfr_taijiquan_yunshou` | `MeridianRouteDef{moveRef:mv_taijiquan_yunshou; ultimate:true; purpose:attack}`；`ap_dumai_mingmen/75/100→ap_chongmai_qichong/75/110→ap_zujueyin_ligou/75/120→ap_shoutaiyin_taiyuan/75/130→ap_zushaoyang_guangming/75/140→ap_zutaiyin_yinlingquan/75/150→ap_zushaoyin_rangu/75/160→ap_shouyangming_quchi/75/170→ap_shouyangming_shousanli/75/180→ap_shoujueyin_laogong/75/190` |
| 11 天中 | `sk_taijijian` | `mv_taijijian_jianquan` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_taijijian_jianquan}` | `mfr_taijijian_jianquan` | `MeridianRouteDef{moveRef:mv_taijijian_jianquan; ultimate:true; purpose:defense}`；`ap_dumai_zhiyang/75/100→ap_chongmai_qichong/75/110→ap_shoutaiyin_chize/75/120→ap_zushaoyang_guangming/75/130→ap_zujueyin_ligou/75/140→ap_zushaoyin_rangu/75/150→ap_shoujueyin_daling/75/160→ap_shoutaiyang_wangu/75/170→ap_shoushaoyang_waiguan/75/180→ap_shoushaoyang_yangchi/75/190` |
| 11 天中 | `sk_taijijian` | `mv_taijijian_zhanjian` `MoveDef{unlock:10; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_taijijian_zhanjian}` | `mfr_taijijian_zhanjian` | `MeridianRouteDef{moveRef:mv_taijijian_zhanjian; ultimate:true; purpose:attack}`；`ap_chongmai_qichong/75/100→ap_chongmai_henggu/75/110→ap_daimai_daimai/75/120→ap_daimai_wushu/75/130→ap_zutaiyin_yinlingquan/75/140→ap_zushaoyang_yanglingquan/75/150→ap_shoutaiyin_taiyuan/75/160→ap_shouyangming_yangxi/75/170→ap_shoutaiyang_yanggu/75/180→ap_shoushaoyang_yangchi/75/190` |
| 11 天中 | `sk_taijijian` | `mv_taijijian_liangyi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_taijijian_liangyi}` | `mfr_taijijian_liangyi` | `MeridianRouteDef{moveRef:mv_taijijian_liangyi; ultimate:true; purpose:attack}`；`ap_zujueyin_zhongdu/80/100→ap_zushaoyin_yingu/80/120→ap_zutaiyin_yinbai/80/140→ap_renmai_shimen/80/160→ap_shoujueyin_quze/80/180→ap_shoushaoyin_shaofu/80/200→ap_shoutaiyin_tianfu/80/220→ap_yinqiao_sanyinjiao/80/240→ap_zujueyin_dadun/80/260→ap_shoutaiyang_wangu/80/280` |
| 8 地中 | `sk_chunyangwuji` | `mv_chunyangwuji_zhenhuo` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_chunyangwuji_zhenhuo}` | `mfr_chunyangwuji_zhenhuo` | `MeridianRouteDef{moveRef:mv_chunyangwuji_zhenhuo; ultimate:true; purpose:attack}`；`ap_dumai_mingmen/75/100→ap_renmai_guanyuan/75/110→ap_zutaiyang_chengshan/75/120→ap_zutaiyin_yinlingquan/75/130→ap_shoushaoyin_shaohai/75/140→ap_zushaoyin_taixi/75/150→ap_shoushaoyang_waiguan/75/160→ap_shoushaoyang_yangchi/75/170` |
| 7 地下 | `sk_huzhaojuehushou` | `mv_huzhaojuehushou_juehu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huzhaojuehushou_juehu}` | `mfr_huzhaojuehushou_juehu` | `MeridianRouteDef{moveRef:mv_huzhaojuehushou_juehu; ultimate:true; purpose:attack}`；`ap_zujueyin_ligou/90/100→ap_zushaoyin_taixi/90/120→ap_zutaiyin_shangqiu/90/140→ap_renmai_guanyuan/90/160→ap_renmai_yinjiao/90/180→ap_shoujueyin_jianshi/90/200→ap_shouyangming_quchi/90/220→ap_shouyangming_hegu/90/240` |
| 7 地下 | `sk_wujixuangongquan` | `mv_wujixuangongquan_huoshou` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_wujixuangongquan_huoshou}` | `mfr_wujixuangongquan_huoshou` | `MeridianRouteDef{moveRef:mv_wujixuangongquan_huoshou; ultimate:true; purpose:attack}`；`ap_shoutaiyin_xiabai/90/100→ap_yinqiao_sanyinjiao/90/120→ap_yinwei_qimen/90/140→ap_zujueyin_xiguan/90/160→ap_zushaoyin_shuiquan/90/180→ap_zutaiyin_dabao/90/200→ap_shouyangming_quchi/90/220→ap_shouyangming_hegu/90/240` |
| 7 地下 | `sk_rouyunjian` | `mv_rouyunjian_wanli` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_rouyunjian_wanli}` | `mfr_rouyunjian_wanli` | `MeridianRouteDef{moveRef:mv_rouyunjian_wanli; ultimate:true; purpose:attack}`；`ap_renmai_qihai/75/100→ap_daimai_daimai/75/110→ap_zutaiyin_diji/75/120→ap_zutaiyin_yinlingquan/75/130→ap_zuyangming_fenglong/75/140→ap_shoutaiyang_wangu/75/150→ap_shoushaoyang_waiguan/75/160→ap_shoushaoyang_yangchi/75/170` |
| 7 地下 | `sk_shenmen13` | `mv_shenmen13_shisan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_shenmen13_shisan}` | `mfr_shenmen13_shisan` | `MeridianRouteDef{moveRef:mv_shenmen13_shisan; ultimate:true; purpose:attack}`；`ap_shoushaoyin_tongli/90/100→ap_shoujueyin_tianquan/90/120→ap_shoutaiyin_xiabai/90/140→ap_yinqiao_lougu/90/160→ap_yinwei_tiantu/90/180→ap_zushaoyin_lingxu/90/200→ap_shoutaiyang_yanglao/90/220→ap_shoutaiyang_yanggu/90/240` |
| 8 地中 | `sk_yitiantulonggong` | `mv_yitiantulonggong_haoling` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yitiantulonggong_haoling}` | `mfr_yitiantulonggong_haoling` | `MeridianRouteDef{moveRef:mv_yitiantulonggong_haoling; ultimate:true; purpose:attack}`；`ap_dumai_mingmen/75/100→ap_daimai_daimai/75/110→ap_zushaoyang_yanglingquan/75/120→ap_shoutaiyin_taiyuan/75/130→ap_shoutaiyin_chize/75/140→ap_zushaoyin_rangu/75/150→ap_dumai_shendao/75/160→ap_shoushaoyang_waiguan/75/170` |
| 8 地中 | `sk_yitiantulonggong` | `mv_yitiantulonggong_zhengfeng` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yitiantulonggong_zhengfeng}` | `mfr_yitiantulonggong_zhengfeng` | `MeridianRouteDef{moveRef:mv_yitiantulonggong_zhengfeng; ultimate:true; purpose:attack}`；`ap_zuyangming_zusanli/90/100→ap_dumai_shenzhu/90/120→ap_shoushaoyang_sizhukong/90/140→ap_shoushaoyang_zhongzhu/90/160→ap_shoutaiyang_xiaohai/90/180→ap_shouyangming_sanjian/90/200→ap_yangqiao_jianyu/90/220→ap_shoutaiyang_wangu/90/240` |
| 8 地中 | `sk_tiyunzong` | `mv_tiyunzong_fuyao` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tiyunzong_fuyao}` | `mfr_tiyunzong_fuyao` | `MeridianRouteDef{moveRef:mv_tiyunzong_fuyao; ultimate:true; purpose:movement}`；`ap_dumai_mingmen/75/100→ap_chongmai_qichong/75/110→ap_shoushaoyin_shenmen/75/120→ap_zutaiyin_diji/75/130→ap_zushaoyang_yanglingquan/75/140→ap_zushaoyin_rangu/75/150→ap_daimai_weidao/75/160→ap_yangqiao_shenmai/75/170→ap_zushaoyin_yongquan/75/180` |
| 8 地中 | `sk_zhenwuqijie` | `mv_zhenwuqijie_guishe` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_zhenwuqijie_guishe}` | `mfr_zhenwuqijie_guishe` | `MeridianRouteDef{moveRef:mv_zhenwuqijie_guishe; ultimate:true; purpose:attack}`；`ap_dumai_mingmen/78/100→ap_dumai_zhiyang/81/120→ap_renmai_zhongwan/84/160→ap_renmai_danzhong/87/220→ap_shouyangming_quchi/90/180→ap_shouyangming_shousanli/93/150→ap_shouyangming_hegu/96/130→ap_shouyangming_shangyang/99/110` |
| 8 地中 | `sk_zhenwuqijie` | `mv_zhenwuqijie_guizhen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_zhenwuqijie_guizhen}` | `mfr_zhenwuqijie_guizhen` | `MeridianRouteDef{moveRef:mv_zhenwuqijie_guizhen; ultimate:true; purpose:attack}`；`ap_dumai_mingmen/90/100→ap_dumai_zhiyang/90/120→ap_renmai_qugu/90/140→ap_shoujueyin_daling/90/160→ap_shoujueyin_ximen/90/180→ap_shoushaoyin_shaohai/90/200→ap_shoutaiyin_taiyuan/90/220→ap_yinqiao_jingming/90/240` |
| 7 地下 | `sk_bixuegong` | `mv_bixuegong_suoyuan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_bixuegong_suoyuan}` | `mfr_bixuegong_suoyuan` | `MeridianRouteDef{moveRef:mv_bixuegong_suoyuan; ultimate:true; purpose:defense}`；`ap_renmai_qihai/90/100→ap_renmai_shimen/90/120→ap_zushaoyin_dazhong/90/140→ap_zushaoyin_yingu/90/160→ap_shoujueyin_jianshi/90/180→ap_shoushaoyin_tongli/90/200→ap_yinwei_qimen/90/220→ap_renmai_shenque/90/240` |
| 8 地中 | `sk_yinyangdaoluan` | `mv_yinyangdaoluan_jindao` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yinyangdaoluan_jindao}` | `mfr_yinyangdaoluan_jindao` | `MeridianRouteDef{moveRef:mv_yinyangdaoluan_jindao; ultimate:true; purpose:attack}`；`ap_renmai_guanyuan/75/100→ap_renmai_qihai/75/110→ap_shoutaiyang_wangu/75/120→ap_zuyangming_fenglong/75/130→ap_shoushaoyin_shenmen/75/140→ap_zutaiyin_yinlingquan/75/150→ap_shoushaoyang_waiguan/75/160→ap_shoushaoyang_yangchi/75/170` |
| 8 地中 | `sk_yinyangdaoluan` | `mv_yinyangdaoluan_liangyi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_yinyangdaoluan_liangyi}` | `mfr_yinyangdaoluan_liangyi` | `MeridianRouteDef{moveRef:mv_yinyangdaoluan_liangyi; ultimate:true; purpose:attack}`；`ap_shoutaiyang_xiaohai/90/100→ap_shouyangming_shousanli/90/120→ap_yangqiao_naoshu/90/140→ap_yangwei_yamen/90/160→ap_zushaoyang_yanglingquan/90/180→ap_zutaiyang_xinshu/90/200→ap_zuyangming_tianshu/90/220→ap_shoushaoyang_yangchi/90/240` |
| 6 玄上 | `sk_sanhuajudingzhang` | `mv_sanhuajudingzhang_juding` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_sanhuajudingzhang_juding}` | `mfr_sanhuajudingzhang_juding` | `MeridianRouteDef{moveRef:mv_sanhuajudingzhang_juding; ultimate:true; purpose:attack}`；`ap_shoujueyin_quze/100/100→ap_shoushaoyin_qingling/100/120→ap_shoutaiyin_chize/100/140→ap_shoutaiyin_yunmen/100/160→ap_yinqiao_zhaohai/100/180→ap_shoujueyin_laogong/100/200` |
| 6 玄上 | `sk_jinyangong` | `mv_jinyangong_yanhui` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_jinyangong_yanhui}` | `mfr_jinyangong_yanhui` | `MeridianRouteDef{moveRef:mv_jinyangong_yanhui; ultimate:true; purpose:movement}`；`ap_renmai_yinjiao/100/100→ap_shoujueyin_quze/100/120→ap_shoushaoyin_qingling/100/140→ap_shoutaiyin_chize/100/160→ap_daimai_wushu/100/180→ap_zushaoyang_xuanzhong/100/200` |
| 6 玄上 | `sk_chongyangzhang` | `mv_chongyangzhang_diezhang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_chongyangzhang_diezhang}` | `mfr_chongyangzhang_diezhang` | `MeridianRouteDef{moveRef:mv_chongyangzhang_diezhang; ultimate:true; purpose:attack}`；`ap_renmai_zhongji/100/100→ap_shoujueyin_tianchi/100/120→ap_shoushaoyin_tongli/100/140→ap_shouyangming_quchi/100/160→ap_shouyangming_shousanli/100/180→ap_shoujueyin_laogong/100/200` |
| 6 玄上 | `sk_tongxuanjian` | `mv_tongxuanjian_poguan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_tongxuanjian_poguan}` | `mfr_tongxuanjian_poguan` | `MeridianRouteDef{moveRef:mv_tongxuanjian_poguan; ultimate:true; purpose:attack}`；`ap_zushaoyang_xuanzhong/100/100→ap_zushaoyin_rangu/100/120→ap_zutaiyang_cuanzhu/100/140→ap_zutaiyang_zhiyin/100/160→ap_zutaiyin_xuehai/100/180→ap_shoutaiyang_wangu/100/200` |
| 6 玄上 | `sk_beidoufuchen` | `mv_beidoufuchen_chanchen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_beidoufuchen_chanchen}` | `mfr_beidoufuchen_chanchen` | `MeridianRouteDef{moveRef:mv_beidoufuchen_chanchen; ultimate:true; purpose:attack}`；`ap_shoutaiyang_xiaohai/100/100→ap_shouyangming_sanjian/100/120→ap_yinwei_daheng/100/140→ap_zujueyin_dadun/100/160→ap_zujueyin_zhongdu/100/180→ap_shoushaoyang_waiguan/100/200` |
| 6 玄上 | `sk_hanyuxinjue` | `mv_hanyuxinjue_hanqi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_hanyuxinjue_hanqi}` | `mfr_hanyuxinjue_hanqi` | `MeridianRouteDef{moveRef:mv_hanyuxinjue_hanqi; ultimate:true; purpose:defense}`；`ap_renmai_shuifen/100/100→ap_zushaoyin_lingxu/100/120→ap_shoutaiyin_xiabai/100/140→ap_shoushaoyin_tongli/100/160→ap_yinqiao_lougu/100/180→ap_renmai_shenque/100/200` |
| 6 玄上 | `sk_yunvjian` | `mv_yunvjian_tousuo` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_yunvjian_tousuo}` | `mfr_yunvjian_tousuo` | `MeridianRouteDef{moveRef:mv_yunvjian_tousuo; ultimate:true; purpose:attack}`；`ap_yinwei_zhubin/100/100→ap_zujueyin_xingjian/100/120→ap_zutaiyin_taibai/100/140→ap_renmai_huiyin/100/160→ap_renmai_zhongji/100/180→ap_shoushaoyang_yangchi/100/200` |
| 6 玄上 | `sk_sanwusanbushou` | `mv_sanwusanbushou_sanbu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_sanwusanbushou_sanbu}` | `mfr_sanwusanbushou_sanbu` | `MeridianRouteDef{moveRef:mv_sanwusanbushou_sanbu; ultimate:true; purpose:attack}`；`ap_zujueyin_xingjian/100/100→ap_zushaoyin_rangu/100/120→ap_zutaiyin_shangqiu/100/140→ap_renmai_guanyuan/100/160→ap_renmai_yinjiao/100/180→ap_shoutaiyang_yanggu/100/200` |
| 6 玄上 | `sk_yufengshu` | `mv_yufengshu_fengqun` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_yufengshu_fengqun}` | `mfr_yufengshu_fengqun` | `MeridianRouteDef{moveRef:mv_yufengshu_fengqun; ultimate:true; purpose:attack}`；`ap_zujueyin_xingjian/100/100→ap_zutaiyin_dadu/100/120→ap_renmai_zhongji/100/140→ap_shoujueyin_tianchi/100/160→ap_shoushaoyin_shaochong/100/180→ap_shoutaiyin_kongzui/100/200` |
| 6 玄上 | `sk_wudumichuan` | `mv_wudumichuan_jiedu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_wudumichuan_jiedu}` | `mfr_wudumichuan_jiedu` | `MeridianRouteDef{moveRef:mv_wudumichuan_jiedu; ultimate:true; purpose:defense}`；`ap_renmai_qihai/75/100→ap_renmai_guanyuan/75/110→ap_zutaiyang_chengshan/75/120→ap_zutaiyin_yinlingquan/75/130→ap_shoutaiyang_wangu/75/140→ap_zushaoyin_rangu/75/150→ap_shoushaoyang_waiguan/75/160→ap_shoushaoyang_yangchi/75/170` |
| 6 玄上 | `sk_baichousuofa` | `mv_baichousuofa_juanwan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_baichousuofa_juanwan}` | `mfr_baichousuofa_juanwan` | `MeridianRouteDef{moveRef:mv_baichousuofa_juanwan; ultimate:true; purpose:attack}`；`ap_zutaiyin_diji/100/100→ap_yinwei_fuai/100/120→ap_shoujueyin_ximen/100/140→ap_shoushaoyin_tongli/100/160→ap_shoutaiyin_taiyuan/100/180→ap_shoutaiyang_wangu/100/200` |
| 6 玄上 | `sk_yufengyin` | `mv_yufengyin_huzhu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_yufengyin_huzhu}` | `mfr_yufengyin_huzhu` | `MeridianRouteDef{moveRef:mv_yufengyin_huzhu; ultimate:true; purpose:defense}`；`ap_yinwei_qimen/100/100→ap_zujueyin_yinlian/100/120→ap_zutaiyin_gongsun/100/140→ap_renmai_danzhong/100/160→ap_renmai_shuifen/100/180→ap_shoujueyin_neiguan/100/200` |
| 6 玄上 | `sk_lijianyi` | `mv_lijianyi_zhengfeng` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_lijianyi_zhengfeng}` | `mfr_lijianyi_zhengfeng` | `MeridianRouteDef{moveRef:mv_lijianyi_zhengfeng; ultimate:true; purpose:defense}`；`ap_shoutaiyang_wangu/100/100→ap_shoutaiyin_taiyuan/100/120→ap_shouyangming_hegu/100/140→ap_shouyangming_yingxiang/100/160→ap_yangqiao_naoshu/100/180→ap_yangwei_tianliao/100/200` |
| 6 玄上 | `sk_ruanjianyi` | `mv_ruanjianyi_raojian` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_ruanjianyi_raojian}` | `mfr_ruanjianyi_raojian` | `MeridianRouteDef{moveRef:mv_ruanjianyi_raojian; ultimate:true; purpose:defense}`；`ap_yangqiao_shenmai/100/100→ap_yangwei_yamen/100/120→ap_yinqiao_zhaohai/100/140→ap_yinwei_zhubin/100/160→ap_zujueyin_xingjian/100/180→ap_zushaoyang_tongziliao/100/200` |
| 6 玄上 | `sk_haichaolianjian` | `mv_haichaolianjian_huichao` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_haichaolianjian_huichao}` | `mfr_haichaolianjian_huichao` | `MeridianRouteDef{moveRef:mv_haichaolianjian_huichao; ultimate:true; purpose:attack}`；`ap_zujueyin_zhongdu/100/100→ap_zushaoyang_xuanzhong/100/120→ap_zushaoyin_rangu/100/140→ap_zutaiyang_cuanzhu/100/160→ap_zutaiyang_zhiyin/100/180→ap_shoushaoyang_yangchi/100/200` |
| 6 玄上 | `sk_taijituishou` | `mv_taijituishou_shuai` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_taijituishou_shuai}` | `mfr_taijituishou_shuai` | `MeridianRouteDef{moveRef:mv_taijituishou_shuai; ultimate:true; purpose:attack}`；`ap_dumai_yaoyangguan/100/100→ap_renmai_huiyin/100/120→ap_renmai_zhongji/100/140→ap_shoujueyin_tianchi/100/160→ap_shoushaoyang_waiguan/100/180→ap_shouyangming_shousanli/100/200` |
| 6 玄上 | `sk_raozhirou` | `mv_raozhirou_huagang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_raozhirou_huagang}` | `mfr_raozhirou_huagang` | `MeridianRouteDef{moveRef:mv_raozhirou_huagang; ultimate:true; purpose:defense}`；`ap_zujueyin_yinlian/100/100→ap_zushaoyang_waiqiu/100/120→ap_zushaoyin_lingxu/100/140→ap_zutaiyang_chengshan/100/160→ap_zutaiyang_xinshu/100/180→ap_shoutaiyang_wangu/100/200` |
| 6 玄上 | `sk_furongjinzhen` | `mv_furongjinzhen_mianli` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_furongjinzhen_mianli}` | `mfr_furongjinzhen_mianli` | `MeridianRouteDef{moveRef:mv_furongjinzhen_mianli; ultimate:true; purpose:attack}`；`ap_shoutaiyin_tianfu/100/100→ap_shoujueyin_ximen/100/120→ap_zushaoyin_dazhong/100/140→ap_zushaoyin_yingu/100/160→ap_zutaiyin_taibai/100/180→ap_shoujueyin_laogong/100/200` |
| 6 玄上 | `sk_xuanxujian` | `mv_xuanxujian_xieshi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_xuanxujian_xieshi}` | `mfr_xuanxujian_xieshi` | `MeridianRouteDef{moveRef:mv_xuanxujian_xieshi; ultimate:true; purpose:attack}`；`ap_renmai_danzhong/100/100→ap_renmai_shuifen/100/120→ap_shoujueyin_neiguan/100/140→ap_shoushaoyang_sizhukong/100/160→ap_shoushaoyang_zhongzhu/100/180→ap_shoushaoyang_waiguan/100/200` |
| 6 玄上 | `sk_liangyibu` | `mv_liangyibu_huanxing` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_liangyibu_huanxing}` | `mfr_liangyibu_huanxing` | `MeridianRouteDef{moveRef:mv_liangyibu_huanxing; ultimate:true; purpose:movement}`；`ap_shoushaoyin_shaochong/100/100→ap_shoutaiyang_qiangu/100/120→ap_shoutaiyang_yanglao/100/140→ap_shoutaiyin_yuji/100/160→ap_shouyangming_sanjian/100/180→ap_yangqiao_jianyu/100/200` |
| 6 玄上 | `sk_wudangfuchen` | `mv_wudangfuchen_qiansi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_wudangfuchen_qiansi}` | `mfr_wudangfuchen_qiansi` | `MeridianRouteDef{moveRef:mv_wudangfuchen_qiansi; ultimate:true; purpose:attack}`；`ap_shoushaoyin_tongli/100/100→ap_shoutaiyang_xiaohai/100/120→ap_shoutaiyin_chize/100/140→ap_shouyangming_hegu/100/160→ap_shouyangming_yingxiang/100/180→ap_yangqiao_naoshu/100/200` |
| 6 玄上 | `sk_zaoheding` | `mv_zaoheding_penhe` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_zaoheding_penhe}` | `mfr_zaoheding_penhe` | `MeridianRouteDef{moveRef:mv_zaoheding_penhe; ultimate:true; purpose:attack}`；`ap_renmai_qihai/100/100→ap_renmai_guanyuan/100/120→ap_zushaoyin_shuiquan/100/140→ap_zutaiyin_gongsun/100/160→ap_shoujueyin_daling/100/180→ap_shoutaiyin_shaoshang/100/200` |
<!-- skill-catalog-audit:end -->


| 章节 | 内容 |
|---|---|
| §1 | 本组门派一览、书界分布与装配栏覆盖速查 |
| §2 | 全真教 `sect_quanzhen` |
| §3 | 古墓派 `sect_gumu`（含李莫愁一系） |
| §4 | 杨过自创与传承、独孤求败剑冢剑意 |
| §5 | 武当派 `sect_wudang` |
| §6 | 绝情谷 `sect_jueqinggu` |
| §7 | 套装候选（交 design/07 定稿） |
| §8 | 本组统计（门派 × 品阶、类别、原生书界） |
| §8.7 | AR-14 经脉运行绑定：路线模板、高阶逐招、轻功、内功调息与护体档 |
| §9 | 本文新增术语与 ID |
| §10 | 数据校验规则与测试用例 |
| §11 | 待决事项 / 依赖 |

**记法**

- 品阶写作"数字＋名称"，如 `8 地中`；G 值见基准 §4。
- 招式表"附带"列写作 `bf_ID·承·概率·持续`："承" = `grade: inherit`（= 本武学有效品阶，05 §2.6）；持续以持有者回合计（06 §5.1）。
- "核算"列：`AF × (1 + Σadj) × K_delivery × K_parry − Σcost`（05 §4.2）。adj 简写：cd 冷却每回合 +0.12；mp 耗内每高 1% +0.05；rec 收招每多 100 +0.07；hp 自损每 1% +0.06；条件 常见 +0.15 / 罕见 +0.30。
- 耗内按大阶基准：黄 5% / 玄 6% / 地 7% / 天 8%（× `MPREF`）；绝招 = 基准 + 2%。收招默认 1000（绝招 1200）。"招架"列 ✓ = `parryable: true`。
- 被动 ID 前缀 `ps_<武功拼音>_`（05 §16 P-4）。内功贡献按 05 §5.5：`IP = mpMaxPct + hpMaxPct + 2 × 属性点 + 5 × mpRegen`。
- 轻功的 `Q_skill` 统一按 03 §4.5：`QS(g) × (0.40 + 0.06 × 层)`，本文不再逐条重复。
- 战斗为六角格（AR-12）。`aoe_single`、`aoe_self`、线、环、扇形等按 `design/09` §5.3、§13.1 的生产 schema 表达；“中心点＋六邻格”目标面统一写 `aoe_disk {r:1}`（N=7，AF=0.70），持续面统一写 `aoe_zone {inner:{tpl:aoe_disk,r:1},duration:N}`。旧方格专用十字/九宫及旧占位模板不得进入新数据（见 §11 D-18）。
- 门派职级（`sect.rank`）统一为 L1–L5，抽象层级依次为外门弟子 / 入门弟子 / 亲传或闭门弟子 / 长老 / 掌门。全真、武当采用 `design/17` §1.3 T02：L1 记名弟子 / 道童，L2 入门道士，L3 亲传弟子，L4 监院·长老 / 都讲，L5 掌教 / 观主 / 掌门；古墓采用 `design/17` §7.3 小规模 T04 变体；绝情谷采用 `design/17` §7.6 T04。月钱与资源只引用 `design/12`、`design/16`，本文不重定义。
- NPC、任务、物品 ID 为占位（任务统一用本文件保留号段 `_71`–`_99`，见 §11 D-9）。

**`cost_buff` 取值**（05 §4.2 已定者照用；其余为本文 **【建议值】**，登记于 §11 D-2，待 06 给出 Buff 价值后替换）

| Buff | cost（× 施加率，按 06 条目默认持续） | 来源 |
|---|---|---|
| 眩晕 `bf_xuanyun`、定身 `bf_dingshen` | 0.25 | 05 |
| 穴位受封 `bf_xueweishoufeng` 9 级 | 0.20 | 06 §8.14.3 |
| 内伤 `bf_neishang`、破甲 `bf_pojia`、流血 `bf_liuxue`、减速 `bf_jiansu` | 0.10 | 05 |
| 自身增益 | 0.10–0.20 | 05 |
| 缴械 `bf_jiaoxie`、恐惧 `bf_kongju`、迷惑 `bf_mihuo` | 0.25 | 本文建议 |
| 麻痹 `bf_mabi`、手擒 `bf_shouqin` 4 级、穴位受封 8 级（原封内） | 0.20 | 本文建议；状态等级见 06 §8.14.3 |
| 剧毒 `bf_judu`、乱心 `bf_luanxin`、穴位受封 `bf_xueweishoufeng` 7 级（原封经脉） | 0.15 | 本文建议；状态等级见 06 §8.14.3 |
| 中毒/寒气（每层）、封轻功、失衡、迟缓、震慑、泄气、脱力、散功、迟滞、蹒跚、创口难愈、失明 | 0.10 | 本文建议 |
| 锁定 `bf_suoding` | 0.05 | 本文建议 |
| 持续超出 06 默认值 | 每多 1 回合 ×1.5 | 本文建议 |

---

## 1. 本组门派一览

### 1.1 门派一览表

| 门派 | ID | 出现书界 | 正邪 | 驻地 | 代表人物 | 武学风格 | 内力性质倾向 | 可否加入 |
|---|---|---|---|---|---|---|---|---|
| 全真教 | `sect_quanzhen` | 射雕、神雕（鹿鼎★：北京白云观为全真龙门派祖庭，史实；原著鹿鼎未写） | 正 | 终南山重阳宫 | 王重阳（已故）、周伯通、全真七子（马钰、谭处端、刘处玄、丘处机、王处一、郝大通、孙不二）、尹志平、赵志敬 | 玄门正宗；剑阵合击；攻守端凝 | 阳（镇派内功金关玉锁为调和） | 可：射雕为七子门下弟子；神雕为三代弟子门下；鹿鼎★白云观只传入门 |
| 古墓派 | `sect_gumu` | 神雕（倚天★：黄衫女子与古墓一脉的关系仅有文本暗示，具体世系**（待考：《倚天屠龙记》屠狮大会黄衫女子出场及自述）**） | 正（李莫愁叛出，行邪） | 终南山活死人墓 | 林朝英（已故）、小龙女、杨过、孙婆婆、李莫愁、洪凌波 | 轻灵阴柔、专克全真；毒针、金铃、驭蜂 | 阴 | 限：需小龙女或孙婆婆好感并完成"古墓门规"任务**（原创扩展）**；李莫愁一系可"投师"（邪路线，原创扩展） |
| 杨过传承 | —（`sect: null`，`lineage` 杨过 / 独孤求败） | 神雕 | 正 | 剑冢、绝情谷底、襄阳 | 杨过、神雕、（遗迹）独孤求败 | 以情入武；重剑无锋 | 阴 / 中性 | 羁绊传承（非门派）；剑冢为奇遇 |
| 武当派 | `sect_wudang` | 倚天（开派）、笑傲、侠客、书剑、飞狐（连城★、鸳鸯★：游方武当道人） | 正（书剑张召重投清廷） | 武当山真武殿 | 张三丰；宋远桥、俞莲舟、俞岱岩、张松溪、张翠山、殷梨亭、莫声谷；冲虚（笑傲）；侠客、书剑、飞狐人物见 §5.1 的版本核对标记 | 以柔克刚、圆转连绵、后发制人；七人结阵 | 调和 / 阳 | 可：倚天为七侠门下；其余书界为当代弟子 |
| 绝情谷 | `sect_jueqinggu` | 神雕 | 中立（谷主公孙止阴鸷行邪） | 绝情谷（情花丛、鳄鱼潭、剑室） | 公孙止、裘千尺、公孙绿萼、樊一翁 | 刀剑互易、阴阳倒乱；闭穴；渔网合围 | 阴 / 调和 | 可：以公孙止弟子入谷；裘千尺线（谷底石窟）得其独门（原创扩展） |

### 1.2 书界分布与装配栏覆盖速查

| 书界 | 境界 | 内 | 拳脚 | 兵器 | 轻 | 暗 | 杂 | 合计 | 本组本土最高（内 / 拳脚 / 兵器） | 说明 |
|---|---|---|---|---|---|---|---|---|---|---|
| 射雕 `ch02` | 高 | 5 | 8 | 6 | 3 | 0 | 2 | 24 | 11 天中 / 6 玄上 / 7 地下 | 全真主场；本组剑类 4 门，可同持剑装配 |
| 神雕 `ch03` | 高 | 13 | 16 | 21 | 11 | 4 | 12 | 77 | 10 天下 / 11 天中 / 11 天中 | 本组主场：全真三代、古墓、杨过、绝情谷 |
| 倚天 `ch04` | 高 | 9 | 11 | 11 | 6 | 0 | 1 | 38 | 8 地中（另有武当九阳功，倚天组）/ 11 天中 / 11 天中 | 含黄衫女子古墓延续★；兵器以武当剑类为主 |
| 笑傲 `ch05` | 中 | 8 | 9 | 9 | 4 | 0 | 1 | 31 | 8 地中 / 7 地下 / 7 地下 | 太极拳、太极剑为 10 品残承，列入可学池但不计完整原生天级；最高栏只列完整传承 |
| 侠客 `ch06` | 中 | 8 | 8 | 7 | 4 | 0 | 1 | 28 | 8 地中 / 7 地下 / 7 地下 | 武当掌门赴侠客岛不归（02 C7） |
| 书剑 `ch12` | 中 | 6 | 8 | 4 | 5 | 1 | 0 | 24 | 8 地中 / 7 地下 / 7 地下 | 陆菲青、张召重一代；剑类 4 门形成同类兵器覆盖 |
| 飞狐 `ch13` | 中 | 5 | 4 | 3 | 3 | 1 | 0 | 16 | 5 玄中 / 6 玄上 / 7 地下 | 武当后世传承延伸；本组剑类恰 3 门 |
| 鹿鼎 `ch08`★ | 低 | 3 | 3 | 3 | 1 | 0 | 0 | 10 | 5 玄中 / 3 黄上 / 3 黄上 | 北京白云观全真入门（原创扩展）；本组恰好满足 3/3/3 |
| 连城 `ch09`★、鸳鸯 `ch11`★（各） | 低 | 2 | 2 | 1 | 1 | 0 | 0 | 6 | 2 黄中 / 5 玄中 / 3 黄上 | 本组只到 2/2/1；由 `skills-general` §11.1 的 `ALL14` 三类底座补足 3/3/3 |
| 天龙、碧血、白马、雪山 | — | — | — | — | — | — | — | 0 | — | 本组无原生武学（只能携带） |

> 表按本组全部合法路线的可习得 ID 并集统计；笑傲不把太极两门 10 品残承冒充完整天级。射雕、神雕、倚天、笑傲、侠客、书剑、飞狐均由本组自身满足内功 / 拳脚 / 同类兵器各 ≥3；鹿鼎由本组满足三大类各 ≥3，但“两剑一拂尘”尚不满足同一兵器子类 3 门，须由 `skills-general` §11.1 的 `ALL14` 三剑链补齐。连城、鸳鸯同样明确依赖 `ALL14` 通行底座，而非虚构本门派来源。天级获取仍受 02 §2.9 预算与进度门槛约束（神雕：古墓系、杨过系等至多深入 2 系）。

---

## 2. 全真教 `sect_quanzhen`

> 本门补录武学见 `skills-bulu-02-shediao.md` §3：`sk_quanzhenzhoutiangong`；补录卡归该册定义，本文只登记入口。

### 2.1 门派简介

- **射雕（约 1217–1227）**：王重阳已逝，全真七子分掌教务，天罡北斗阵为镇教阵法，曾以阵围斗黄药师；王重阳生前以先天功配合一阳指制欧阳锋蛤蟆功，又与段智兴互授一阳指、先天功以留制衡；马钰曾在蒙古悬崖夜授郭靖玄门内功（原著）。**强**：七子皆一流，门下弟子众多。
- **神雕（1237–1259）**：三代弟子当家；人物姓名随版本不同，本文不混列版本，须核对**（待考：《神雕侠侣》三联/广州修订版中尹志平、甄志丙的替换范围）**。重阳宫一役以七个北斗阵合成七七四十九人大阵迎战郭靖；杨过拜入全真后转投古墓。**中**：普通弟子武功平庸，以阵势取胜。
- **倚天以后**：原著不再出场。元明以降全真龙门派存续为史实；本作只在鹿鼎北京白云观设入门彩蛋（★，原创扩展）。
- **敌人配置建议**（02 §2.11）：射雕全真道士普通玄中、精英地下（持天罡北斗阵）；神雕三代普通玄上、精英地下—地中（持北斗大阵）。

### 2.2 武学总表（27 门）

| ID | 名称 | 大类/子类 | 品阶 | 内力性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_quanzhentunajue` | 全真吐纳诀 | 内功/心法 | 2 黄中 | 阳 | 0/1 | 射雕、神雕、鹿鼎★ | 拜师（L1 记名弟子 / 道童）；鹿鼎★白云观道长 | 原创扩展 |
| `sk_quanzhenxinfa` | 全真心法 | 内功/心法 | 5 玄中 | 阳 | 0/1 | 射雕、神雕、鹿鼎★ | 拜师（L2 入门道士）；射雕"马钰夜授"羁绊线；秘籍 | 原著扩展（原著泛称全真内功） |
| `sk_jinguanyusuo` | 金关玉锁二十四诀 | 内功/心法 | 8 地中 | 调和 | 0/1 | 射雕、神雕 | 拜师（L4 监院·长老 / 都讲）；神雕古墓石室·全真篇解谜 | 原著名目，内容**（待考：《神雕侠侣》古墓石室口诀）** |
| `sk_xiantiangong` | 先天功 | 内功/心法 | 11 天中 | 阳 | 0/1 | 射雕 | 一灯大师羁绊传功；重阳遗刻奇遇（原创扩展） | 原著（基准 §13） |
| `sk_sanqingzhang` | 三清掌 | 拳脚/拳掌 | 2 黄中 | 阳 | 0.70/0.30 | 射雕、神雕、鹿鼎★ | 拜师（L1） | 原创扩展 |
| `sk_yuyangtui` | 玉阳腿 | 拳脚/腿法 | 3 黄上 | 阳 | 0.80/0.20 | 射雕、神雕 | 拜师（王处一一系，L2）；残页 | 原创扩展（致敬王处一） |
| `sk_changchunqinna` | 长春擒拿手 | 拳脚/擒拿 | 4 玄下 | 阳 | 0.75/0.25 | 射雕、神雕 | 拜师（丘处机一系，L2）；秘籍 | 原创扩展（致敬丘处机） |
| `sk_haotianzhang` | 昊天掌 | 拳脚/拳掌 | 5 玄中 | 阳 | 0.55/0.45 | 射雕、神雕 | 拜师（L2）；秘籍；残页 | 名目**（待考：《神雕侠侣》全真门人交手段落及使用者）** |
| `sk_sanhuajudingzhang` | 三花聚顶掌 | 拳脚/拳掌 | 6 玄上 | 阳 | 0.40/0.60 | 射雕、神雕 | 拜师（郝大通一系，L3） | 原著 |
| `sk_zhongnanjian` | 终南剑法 | 兵器/剑 | 3 黄上 | 阳 | 0.75/0.25 | 射雕、神雕、鹿鼎★ | 拜师（L1） | 原创扩展 |
| `sk_quanzhenjian` | 全真剑法 | 兵器/剑 | 5 玄中 | 阳 | 0.60/0.40 | 射雕、神雕 | 见 05 §13.6 | 原著扩展（05 定义） |
| `sk_tongguijian` | 同归剑法 | 兵器/剑 | 7 地下 | 阳 | 0.60/0.40 | 射雕、神雕 | 拜师（L4）；门派任务"西毒将至"（原创扩展） | 原著，创制与出场**（待考：《神雕侠侣》全真门人对敌段落）** |
| `sk_jinyangong` | 金雁功 | 轻功 | 6 玄上 | 阳 | 0.80/0.20 | 射雕、神雕 | 拜师（L2）；"马钰夜授" | 原著 |
| `sk_tiangang` | 天罡北斗阵 | 杂学/阵法（合击） | 10 天下 | 阳 | 0.55/0.45 | 射雕、神雕 | 门派任务链"七星聚义"（原创扩展）；合击领悟 | 原著（基准 §13） |
| `sk_dabeidouzhen` | 北斗大阵 | 杂学/阵法（合击） | 5 玄中 | 阳 | 0.60/0.40 | 神雕 | 拜师（三代弟子，L3）；观摩 | 游戏概括名**（待考：《神雕侠侣》重阳宫四十九人大阵的原文称谓）** |
| `sk_beidouxinfa` | 北斗心法 | 内功/心法 | 5 玄中 | 阳 | 0/1 | 射雕、神雕 | 拜师（L2）；七星桩进阶 | 原创扩展 |
| `sk_qixingbu` | 七星步 | 轻功 | 4 玄下 | 阳 | 0.80/0.20 | 射雕、神雕 | 拜师（L2）；七星桩进阶 | 原创扩展 |
| `sk_chongyangzhang` | 重阳掌 | 拳脚/拳掌 | 6 玄上 | 阳 | 0.55/0.45 | 射雕、神雕 | 拜师（L3）；昊天掌进阶 | 原创扩展命名 |
| `sk_tongxuanjian` | 通玄剑 | 兵器/剑 | 6 玄上 | 调和 | 0.65/0.35 | 射雕、神雕 | 拜师（L3）；全真剑法进阶 | 原创扩展 |
| `sk_beidoufuchen` | 北斗拂尘 | 兵器/鞭索（拂尘） | 6 玄上 | 阳 | 0.65/0.35 | 射雕、神雕 | 拜师（L3）；七星步进阶 | 原创扩展 |
| `sk_baiyunguanxinfa` | 白云观心法 | 内功/心法 | 2 黄中 | 调和 | 0/1 | 鹿鼎★ | 北京白云观道长（L1） | 原创扩展；史实宫观不等同小说武学 |
| `sk_chongyangchangquan` | 重阳长拳 | 拳脚/拳掌 | 3 黄上 | 阳 | 0.80/0.20 | 射雕、神雕、鹿鼎★ | 拜师（L1） | 原创扩展 |
| `sk_quanzhenqinna` | 全真擒拿 | 拳脚/擒拿 | 3 黄上 | 阳 | 0.75/0.25 | 射雕、神雕、鹿鼎★ | 拜师（L1） | 原创扩展 |
| `sk_longmenjian` | 龙门剑式 | 兵器/剑 | 3 黄上 | 调和 | 0.75/0.25 | 鹿鼎★ | 北京白云观道长（L1） | 原创扩展；借全真龙门派名目 |
| `sk_quanzhenfuchen` | 全真拂尘 | 兵器/鞭索（拂尘） | 3 黄上 | 阳 | 0.70/0.30 | 射雕、神雕、鹿鼎★ | 拜师（L1） | 原创扩展 |
| `sk_xuanmenxingbu` | 玄门行步 | 轻功 | 2 黄中 | 调和 | 0.80/0.20 | 射雕、神雕、鹿鼎★ | 拜师（L1） | 原创扩展 |
| `sk_qixingzhuang` | 七星桩 | 杂学/阵法 | 3 黄上 | 阳 | 0.60/0.40 | 射雕、神雕 | 拜师（L1）；北斗阵教学 | 原创扩展 |

### 2.3 天级条目卡

#### `sk_xiantiangong` 先天功（11 天中 · 内功 · 全真 / 王重阳）

> **原著**：王重阳独门内功。王重阳以先天功并一阳指破欧阳锋蛤蟆功；曾赴大理以先天功与段智兴互换一阳指，意在身后仍有人能制西毒；又曾“诈死”诱欧阳锋现身。叙述细节仍须核对**（待考：《射雕英雄传》一灯大师向郭靖、黄蓉追述王重阳与欧阳锋、段智兴往事的段落）**。招式、被动效果为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | `nature: yang`；运功招式 `wOut/wIn: 0/1` |
| 原生书界 | 射雕（基准 §13；神雕起只能携带） |
| reqs | `attrs {con 50, wil 55, wis 50}`；`aptitude {apInner 55}`；`morality {min 10}`；`prereq [sk_jinguanyusuo ≥ 5]`；`hard [morality, prereq]` |
| 内功贡献（10 重主运） | `mpMaxPct 52, hpMaxPct 26, attrs {con 6, wil 8, wis 6}, mpRegen 3.5` → IP 135.5（= 天中预算）；`stats {effRes 10, resInjury 10}`（合计 20） |
| InnerDef | `bridge: false`；`seclusionCap: 8`；`auxUsableMoves: [mv_xiantiangong_gangqi]` |
| 层数要点 | 1 重"先天一炁"；4 重"以正克邪"；6 重"返本还元"；**7 重五气朝元（第一绝招）**；8 重"龟息"；**9 重先天罡气（第二绝招）**；10 重"先天大成" |
| 获取 | ① `master`：一灯大师 `npc_yideng`（羁绊 ≥ 4，完成"南帝疗伤"一线后，占位 `q_02_bond_75`；`reqsOverride {prereq: []}`，原创扩展：一灯以先天功回赠），maxLayer 10；② `qiyu`：重阳宫后殿"重阳遗刻"（全真L5 且天罡北斗阵 ≥ 3，占位 `q_02_qiyu_74`，原创扩展），maxLayer 8。进度门槛：射雕主线第 4 幕后（02 §2.9 R3）；随机池不产出 |
| setTags | `[set_quanzhen_beidou]` |
| conflicts | `{with: sk_yiyangzhi, type: synergy}`：同时装配时一阳指招式 Z3 +8%（02 同源 `lg_yiyang`）；`{with: sk_hama, type: counter}`：见 4 重"以正克邪" |
| special | `fusible: true`；`observable: false` |

**招式**（天阶耗内基准 8%）

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 先天罡气（绝招；原创扩展命名） | `mv_xiantiangong_gangqi` | 9 | `aoe_self` | 0 | 10% | — | 1200 | `ultimate:true`；气势 100；`bf_hutizhenqi`·承·100%·3（护体 = 自身 hpMax 25%）；`bf_fanzhen`·承·100%·3 | — | 天中护体绝招；效果预算与 05 §4.8 同档支援绝招对齐；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 一炁贯虹（原创扩展命名） | `mv_xiantiangong_yiqi` | 5 | `aoe_line n3` · 1–3（`ranged`） | 0.85 | 10% | 2 | 1000 | 驱散目标 1 个 `stance` 增益（purge，品阶承） | ✓ | N=3、AF=0.85；0.85 ×(1+0.24+0.10)× 0.85 = 0.97，−0.10（驱散）≈ 0.85 |
| 五气朝元（绝招；原创扩展命名，取道家内丹语） | `mv_xiantiangong_wuqi` | 7 | 对敌 `aoe_around`；对己 `aoe_self` | 1.80 | 10% | — | 1200 | `ultimate:true`；气势 100；自身驱散 2 个减益；`bf_neijin_sheng`·承·100%·3 | ✓ | N=6、AF=0.75；3.0 × 0.75 = 2.25，−0.45（自身驱散与增益）= 1.80（对照 05 九阳普照）；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

- **AR-16 审计**：`mv_xiantiangong_yiqi` 的远程直线与原创招名尚不能证明伤害由离体真气造成，暂记待考；罡气是纯护体，五气朝元是周身近战／自身支援，均不标。

**被动**

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 先天一炁 | `ps_xiantiangong_xiantian` | 1 | stat · 属性层 | `attr:atkIn pct +4% → +12%` | `auxMode: scaled` |
| 以正克邪 | `ps_xiantiangong_kexie` | 4 | trigger · Z3 | +15% | 攻击处于 `stance.charge`（蓄势 `bf_xushi`，如蛤蟆功）的目标时本方招式 Z3 +15%，且 50% 打散其架势（purge `stance`，品阶承）；致敬王重阳制西毒。`auxMode: none` |
| 返本还元 | `ps_xiantiangong_huanyuan` | 6 | mechanic | — | 免疫品阶 ≤ 本功有效品阶的 `bf_neixiwenluan`（走火 1 级）；`auxMode: full` |
| 龟息 | `ps_xiantiangong_guixi` | 8 | trigger | ×1/战 | 首次受致死伤害时获得 `bf_zhasi`（诈死，06 §8.9；每战 1 次，06 §11.3）；致敬王重阳诈死诱敌 |
| 先天大成 | `ps_xiantiangong_dacheng` | 10 | stat · Z4 | 内劲伤害 −10% | 主运时受到伤害的内劲部分 Z4 +10%；全真门派武学修炼 +10%（计入 `bonusMult`） |

#### `sk_tiangang` 天罡北斗阵（10 天下 · 杂学/阵法（合击）· 全真）

> **原著**：全真教镇教阵法须七人分据北斗七星方位，攻其一则余者相援；《射雕英雄传》中全真七子用阵围斗黄药师，《神雕侠侣》中三代弟子又以七个七人阵组成四十九人大阵。七子的具体星位对应仍须核对**（待考：《射雕英雄传》全真七子围斗黄药师段落）**。玩家侧四人起阵、六人近满与虚拟阵位均为**（原创扩展）**，流程接口见 `design/09` §6.8；该文尚存旧阈值时以 `decisions/rulings-v1.md` C13 为准。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阳 · wOut 0.55 / wIn 0.45（阵中合击招式） |
| 原生书界 | 射雕、神雕（杂学不可携带；02 §5.7 神雕为 `recall`） |
| reqs | `attrs {wis 45, wil 45}`；`sect {sect_quanzhen, rank 4}`；`prereq [sk_quanzhenjian ≥ 5]`；`hard [sect, prereq]`；阵法强度用技艺 `formation`（05 §2.3） |
| layerStats | `{parry [3, 10], hit [2, 10]}`（合计 20；仅阵中生效） |
| 层数要点 | 1 重布阵、七星合围、"北斗"；3 重斗柄回旋；5 重"牵一发而动全身"；6 重天枢镇守；**7 重天罡归一（第一绝招）**；8 重"七星连珠"；**9 重七星合围（第二绝招）**；10 重"天权兼领" |
| 获取 | ① 门派任务链"七星聚义"（射雕，占位 `q_02_faction_73`，原创扩展）完成后由马钰 `npc_mayu` / 丘处机 `npc_qiuchuji` 传授，maxLayer 10；② `combo` 合击领悟：阵主与至少 3 名合格同伴（共 4 个实际单位）合击 5 次；③ 神雕：残篇忆起 / 三代掌教传授，maxLayer 8 |
| setTags · conflicts | `[set_quanzhen_beidou]`；无 |
| special | `formation`（下表）；`fusible: false`（合击）；`observable: false` |

**阵法规则 `special.formation`**（原创扩展改编；与 design/09 §6.8 对接）

| 规则 | 值 |
|---|---|
| 阵员 | 同阵营、装配本武学、未倒地且未受硬控的实际单位（敌方 NPC 同规则）；起阵与维持均只计这些有效实际单位 |
| 成阵 | `minMembers: 4`：施放"布阵"时，阵主 3 格内有效实际阵员 ≥ 4（含阵主），且每名阵员 2 格内至少另有 1 名有效阵员 |
| 七星位 | 阵主居"天权"，其余按与阵主距离依次为天枢、天璇、天玑、玉衡、开阳、摇光（只影响 UI 与 AI 站位） |
| 七人之数 | 原著七人成阵；基准 §8 的玩家队伍上场 ≤ 6，故 6 个实际单位为"近满阵"。仅阵主本武学有效 10 重且已有 6 个实际阵员时生成 1 个虚拟阵位，视为七星俱全；虚位不降低四人门槛，不增加单位、CT、追击或反击次数，虚实阵位合计上限 7 |
| 阵中光环 | 阵员常驻 `bf_zhuiji`（追击）；相邻阵员互得 `bf_yuanhu`（援护，每回合 1 次）；与 ≥ 2 名阵员相邻的敌人获得 `bf_suoding`（锁定，每名相邻阵员一实例，06 `defSource`） |
| 持续与阵散 | 持续 3 次阵主行动；每次相关状态更新后复核。有效实际阵员 `< 4`（`dissolveBelow: 4`）、阵主倒地或受硬控，立即阵破；任一阵员失格后按剩余实际单位重算，阵破后 1 次阵主行动内不可再布阵 |
| 敌方用法 | 射雕全真七子 Boss 组可 7 人成阵（敌方上场规模归 09） |

**招式**（天阶耗内基准 8%）

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 布阵 | `mv_tiangang_buzhen` | 1 | `aoe_allies r3` | 0 | 6% | 5 | 900 | 成阵持续 3 次阵主行动（上表光环） | — | 功能招式 |
| 七星合围（绝招） | `mv_tiangang_hewei` | 9 | `aoe_single` · 1 | 3.35 | 10% | — | 1200 | `ultimate:true`；气势 100；条件：已成阵；`bf_suoding`·承·100%·2 | ✓ | `3.00×(1+0.15)−0.10（锁定）=3.35`；条件加成按 05 §4.2 进入 `Σadj`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 斗柄回旋 | `mv_tiangang_doubing` | 3 | `aoe_allies r3` | 0 | 6% | 3 | 800 | 全体阵员各自移动 ≤ 1 格（不触发截击），或阵主与 1 名阵员换位 | — | 功能招式 |
| 天枢镇守 | `mv_tiangang_tianshu` | 6 | `aoe_self` | 0 | 8% | 4 | 800 | 自身 `bf_shoushi`·承·2；全体阵员 `bf_yuanhu`·承·2 | — | 架势 |
| 天罡归一（绝招，原创扩展命名） | `mv_tiangang_guiyi` | 7 | `aoe_single` · 1–2 | 2.60 | 10% | — | 1200 | `ultimate:true`；气势 100；`bf_shiheng`·承·100%·1；距目标 ≤ 2 的其余阵员各追加一击（基础招式 ×0.5，`followup`） | ✓ | 3.0 −0.10（失衡）−0.30（阵员追击价值）= 2.60；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

**被动**

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 北斗 | `ps_tiangang_beidou` | 1 | stat · 属性层 | `attr:parry pct`、`attr:hit pct` 各 +4% → +10% | 仅阵中；与 layerStats 叠加 |
| 牵一发而动全身 | `ps_tiangang_qianyifa` | 5 | trigger | ×0.6 | 阵员被近战攻击后，距其 ≤ 2 的另一阵员（优先阵主）以基础招式 ×0.6 反击攻击者（每阵每回合 1 次，`counter`） |
| 七星连珠 | `ps_tiangang_lianzhu` | 8 | effect | 气势 −10 | 阵员 ≥ 5 时，阵中敌人每回合开始气势 −10（效果钩子 `rageDrain`，05 §4.11） |
| 天权兼领（原创扩展） | `ps_tiangang_tianquan` | 10 | mechanic | — | 仅 6 个有效实际阵员在阵时补 1 个虚拟阵位；虚实共 7 位时阵员 Z3 +10%，不改变 `minMembers` / `dissolveBelow`，不生成额外行动或追击 |

### 2.4 地阶条目卡

#### `sk_jinguanyusuo` 金关玉锁二十四诀（8 地中 · 内功 · 全真）

> **原著**：原著有“金关玉锁二十四诀”之名，为全真派上乘内功口诀；出处与内容仍须核对**（待考：《神雕侠侣》杨过、小龙女研读古墓石室全真口诀的段落）**。本作定为全真镇派内功：金关属阳、玉锁属阴，锁住阴阳而归于调和。招式与被动为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | `nature: harmony`；`wOut/wIn: 0/1` |
| 原生书界 | 射雕、神雕 |
| reqs | `attrs {wil 45, wis 40}`；`aptitude {apInner 45}`；`sect {sect_quanzhen, rank 4}`；`prereq [sk_quanzhenxinfa ≥ 6]`；`hard [sect, prereq]` |
| 内功贡献 | `mpMaxPct 30, hpMaxPct 18, attrs {con 4, wil 5, wis 3}, mpRegen 2.2` → IP 83（= 地中预算）；`stats {resSeal 8, resMind 7}`（15） |
| InnerDef | 调和且品阶 ≥ 7 → 自动桥接（05 §5.4，辅运亦然）；`auxUsableMoves: [mv_jinguanyusuo_kaiguan]` |
| 层数要点 | 1 重"金关"；3 重锁窍；4 重"玉锁"；5 重开关；**7 重绝招周天**；8 重"二十四诀"；10 重"阴阳互济" |
| 获取 | 射雕：拜师丘处机 / 马钰（L4），maxLayer 10；神雕：`puzzle` 古墓石室·全真篇（原著杨过、小龙女据石刻修习全真武功，占位 `q_03_side_76`；`reqsOverride {sect: null}`），maxLayer 8 |
| setTags · conflicts | `[set_quanzhen_beidou]`；无（作为桥接内功，可令全真心法、先天功与古墓玉女心经同装而不相冲） |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 锁窍（原创扩展命名） | `mv_jinguanyusuo_suoqiao` | 3 | `aoe_self` | 0 | 7% | 4 | 800 | `bf_mian_xue`·承·100%·2（免疫穴道） | — | 支援 |
| 开关（原创扩展命名） | `mv_jinguanyusuo_kaiguan` | 5 | `aoe_single` · 0–1（友方） | 0 | 8% | 3 | 1000 | 驱散目标 2 个 `seal` / `mind` 减益（品阶承）；`bf_huinei`·承·100%·2 | — | 支援；可作辅运使用 |
| 周天（绝招，原创扩展命名） | `mv_jinguanyusuo_zhoutian` | 7 | `aoe_allies r2` | 0 | 9% | — | 1200 | `ultimate:true`；气势 100；友方各驱散 2 个减益；`bf_hutizhenqi`·承·100%·3（护体 = 施招者 hpMax 15%）；自身回复 20% 内力 | — | 内功绝招以友方效果为主（05 §4.8）；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 金关 | `ps_jinguanyusuo_jinguan` | 1 | stat · 属性层 | `attr:resSeal pp +4 → +10` | `auxMode: scaled` |
| 玉锁 | `ps_jinguanyusuo_yusuo` | 4 | trigger | 30% | 被施加 `seal` / `mind` 减益时 30% 当即运功冲开（等效 `acupoint` / `circulate`，品阶承；每回合 1 次）；`auxMode: full` |
| 二十四诀 | `ps_jinguanyusuo_ershisi` | 8 | mechanic | +0.05 | 装配时，阴阳相冲组合的辅运比例在桥接值 0.40 上再 +0.05；`auxMode: full` |
| 阴阳互济 | `ps_jinguanyusuo_huji` | 10 | stat · Z5 | +4% | 主运时阳招、阴招相性加成由 +4% 提至 +8%（05 §5.3 调和主运行） |

#### `sk_tongguijian` 同归剑法（7 地下 · 兵器/剑 · 全真）

> **原著**：全真派为对付武功远胜己方的强敌所备的剑法，招招与敌同归于尽；创制者与针对西毒之说仍须核对**（待考：《神雕侠侣》全真门人施展同归剑法对敌的段落）**。本作归入代价型武学（05 §9.1）：以自损换伤害，代价在习得前完整展示。招式名与效果为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阳 · 0.60/0.40 |
| 原生书界 | 射雕、神雕 |
| reqs | `attrs {con 40, wil 40, wis 40}`；`aptitude {apSword 40}`；`sect {sect_quanzhen, rank 4}`；`prereq [sk_quanzhenjian ≥ 6]`；`hard [sect, prereq]` |
| layerStats | `{crit [1, 6], pierce [2, 9]}`（15） |
| weaponReq | `{category: sword}` |
| 层数要点 | 1 重以命搏命、"置之死地"；3 重玉石俱焚；4 重两败俱伤；5 重破釜沉舟、"舍身"；**7 重绝招同归于尽**；8 重"同归不死"；9 重不共戴天；10 重"生死一线" |
| 获取 | 射雕：拜师丘处机（L4，门派任务"西毒将至"后，占位 `q_02_faction_77`），maxLayer 10；神雕：拜师郝大通或三代掌教，maxLayer 9；秘籍 `it_miji_tongguijian`（神雕重阳宫之变后散出，原创扩展），maxLayer 7 |
| setTags · conflicts | `[set_quanzhen_beidou]`；无 |
| special | `cost: {hpCostMoves: true}`（代价型，计入 05 §14.6"地阶代价型 ≤ 5%"）；`fusible: false` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 以命搏命 | `mv_tongguijian_boming` | 1 | `aoe_single` · 1 | 1.20 | 7% | 0 | 1000 | 自损 3% hpMax | ✓ | 1 + 0.18（hp）= 1.18 ≈ 1.20 |
| 玉石俱焚 | `mv_tongguijian_yushi` | 3 | `aoe_around` | 1.20 | 8% | 2 | 1000 | 自损 5% hpMax | ✓ | N=6、AF=0.75；0.75 ×(1+0.24+0.05+0.30)= 1.19 ≈ 1.20 |
| 两败俱伤 | `mv_tongguijian_liangbai` | 4 | `aoe_self`（架势） | 0 | 5% | 2 | 850 | 至下次行动前被近战攻击：以 1.10 倍反击（反击时自损 2%） | — | 触发型（05 §4.10） |
| 破釜沉舟 | `mv_tongguijian_pofu` | 5 | `aoe_self` | 0 | 5% | 3 | 800 | `bf_gongshi`·承·100%·3（攻势） | — | 架势 |
| 同归于尽（绝招） | `mv_tongguijian_tonggui` | 7 | `aoe_single` · 1 | 4.45 | 9% | — | 1200 | `ultimate:true`；气势 100；自损 8% hpMax | ✓ | 3.0 ×(1+0.48)= 4.44 ≈ 4.45；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 不共戴天 | `mv_tongguijian_bugong` | 9 | `aoe_single` · 1 | 1.40 | 7% | 1 | 1000 | 条件：目标当前气血比例高于自身 | ✓ | `1.00×(1+0.12+0.30)=1.42≈1.40` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 置之死地 | `ps_tongguijian_sidi` | 1 | stat · Z3 | +6% → +15% | 自身气血 < 50% 时本武学招式伤害 |
| 舍身 | `ps_tongguijian_sheshen` | 5 | effect | — | 本武学自损招式击杀目标时返还所损气血（效果钩子 `refundHpCostOnKill`，05 §4.11） |
| 同归不死 | `ps_tongguijian_busi` | 8 | trigger | ×1/战 | 气血 ≤ 20% 后首次受致死伤害：获得 `bf_suoxue`（锁血，06；每战 1 次） |
| 生死一线 | `ps_tongguijian_dacheng` | 10 | mechanic | −30% | 本武学招式 `hpCost` −30% |

### 2.5 玄阶 · 黄阶（紧凑表）

**`sk_quanzhentunajue` 全真吐纳诀**（2 黄中 · 内功 · 阳 · 原创扩展）
- `nature: yang`。
- 内功贡献：`mpMaxPct 8, hpMaxPct 5, attrs {con 1, wil 2}, mpRegen 1.0`（IP 24）；`stats {resInjury 3, effRes 3}`；无招式。
- reqs：`sect {sect_quanzhen, rank 1}`；`hard [sect]`。获取：全真知客道人岗位槽（射雕、神雕）；鹿鼎★北京白云观道长岗位槽（maxLayer 8）。
- 被动：`ps_quanzhentunajue_tiaoxi` 调息有法（1 重，运功调息回内 +5% → +10%）；`ps_quanzhentunajue_zhoutian` 小周天（5 重，闭关修炼全真武学 +10%）；`ps_quanzhentunajue_yuanman` 入门圆满（10 重，学习全真心法软门槛 −10）。

**`sk_quanzhenxinfa` 全真心法**（5 玄中 · 内功 · 阳 · 原著扩展）
- `nature: yang`。
- 原著：马钰于蒙古悬崖夜授郭靖全真派内功，教以呼吸吐纳并每夜攀崖；情节位置仍须核对**（待考：《射雕英雄传》马钰夜授郭靖玄门内功的段落）**。全真弟子通习之内功为原著泛称。
- 内功贡献：`mpMaxPct 18, hpMaxPct 10, attrs {con 3, wil 2, agi 2}, mpRegen 1.3`（IP 48.5）；`stats {resInjury 5, effRes 5}`。
- reqs：`attrs {wil 25}`；`aptitude {apInner 25}`；`sect {sect_quanzhen, rank 2}`；`prereq [sk_quanzhentunajue ≥ 4]`；`hard [sect]`（"马钰夜授"免 sect 与 prereq）。
- 获取：射雕 `npc_mayu` 羁绊线"马钰夜授"（占位 `q_02_bond_72`，maxLayer 10）；射雕、神雕全真拜师；秘籍 `it_miji_quanzhenxinfa`（maxLayer 8）；鹿鼎★白云观（maxLayer 6）。
- `setTags: [set_quanzhen_beidou]`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 归元（原创扩展命名） | `mv_quanzhenxinfa_guiyuan` | 3 | `aoe_self` | 0 | 5% | 3 | 900 | 驱散自身 1 个 `injury` / `poison`（品阶承）；`bf_huinei`·承·100%·2 | — |

- 被动：`ps_quanzhenxinfa_shangya` 夜攀悬崖（4 重，`attr:qinggong flat +4 → +10`；探索攀崖体力 −15%，08）；`ps_quanzhenxinfa_shouyi` 守一（7 重，战斗开始获得 `bf_shouyi` 2 回合）；`ps_quanzhenxinfa_yuanrong` 心法圆融（10 重，全真武学修炼 +10%）。

**`sk_sanqingzhang` 三清掌**（2 黄中 · 拳脚/拳掌 · 阳 · 0.70/0.30 · 原创扩展）
- reqs：`sect {sect_quanzhen, rank 1}`；`hard [sect]`。layerStats `{hit [1, 3], parry [1, 3]}`。获取：拜师；鹿鼎★白云观。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 玉清掌 | `mv_sanqingzhang_yuqing` | 1 | `aoe_single` · 1 | 1.00 | 5% | 0 | 1000 | — | ✓ |
| 上清掌 | `mv_sanqingzhang_shangqing` | 4 | `aoe_line n2` | 0.95 | 5% | 1 | 1000 | — | ✓ |
| 太清掌 | `mv_sanqingzhang_taiqing` | 7 | `aoe_single` · 1 | 1.25 | 6% | 2 | 1000 | 击退 1 | ✓ |

- 核算：上清掌 0.85 × 1.12 = 0.95；太清掌 1 + 0.24 + 0.05 − 0.05 = 1.24。被动：`ps_sanqingzhang_qingjing` 清静（5 重，`attr:resMind pp +5`）；`ps_sanqingzhang_yuanman` 入门圆满（10 重，全真拳脚软门槛 −10）。

**`sk_yuyangtui` 玉阳腿**（3 黄上 · 拳脚/腿法 · 阳 · 0.80/0.20 · 原创扩展）
- 依据：王处一道号玉阳子、绰号“铁脚仙”，曾独足跂立崖边震慑群豪；细节仍须核对**（待考：《射雕英雄传》王处一初次展示脚力的段落）**。腿法持械不降效（05 §6.3）。
- reqs：`aptitude {apLeg 10}`；`sect {sect_quanzhen, rank 2}`；`hard [sect]`。layerStats `{hit [1, 3], resCC [1, 3]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 铁脚 | `mv_yuyangtui_tiejiao` | 1 | `aoe_single` · 1 | 1.00 | 5% | 0 | 1000 | — | ✓ |
| 跂立千仞 | `mv_yuyangtui_qili` | 4 | `aoe_self`（架势） | 0 | 4% | 2 | 850 | `bf_wenzhong`·承·100%·2；至下次行动前被近战攻击以 0.8 倍反击 | — |
| 扫岳腿 | `mv_yuyangtui_saoyue` | 7 | `aoe_cone {angle:120,r:1,dirCount:6}` | 0.95 | 6% | 1 | 1000 | `bf_panshan`·承·30%·2 | ✓ |

- 核算：扫岳腿以 N=3、AF=0.85 计，0.85 × 1.17 = 0.99，−0.03 = 0.96，取 0.95。被动：`ps_yuyangtui_pinggao` 凭高（5 重，自身所在格高于目标时本武学 Z7 按高一级计）；`ps_yuyangtui_yuanman` 圆满（10 重，`attr:jump flat +1`）。

**`sk_changchunqinna` 长春擒拿手**（4 玄下 · 拳脚/擒拿 · 阳 · 0.75/0.25 · 原创扩展）
- 依据：丘处机道号长春子，性烈而膂力过人；细节仍须核对**（待考：《射雕英雄传》醉仙楼丘处机与江南七怪相争、托举铜缸的段落）**。
- reqs：`attrs {str 25}`；`aptitude {apGrapple 25}`；`sect {sect_quanzhen, rank 2}`；`prereq [sk_sanqingzhang ≥ 4]`；`hard [sect]`。layerStats `{seal [1, 6], parry [1, 4]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 扣腕 | `mv_changchunqinna_kouwan` | 1 | `aoe_single` · 1 | 0.95 | 6% | 0 | 1000 | `bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)`（参数 weapon）·承·20%·2 | ✓ |
| 折肩 | `mv_changchunqinna_zhejian` | 1 | `aoe_single` · 1 | 1.10 | 6% | 1 | 1000 | `bf_waigong_jiang`·承·30%·2 | ✓ |
| 长春回手 | `mv_changchunqinna_huishou` | 4 | `aoe_self`（架势） | 0 | 5% | 2 | 850 | 被近战攻击以 0.9 倍反击，并 30% 施加 `bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)` | — |
| 托缸式 | `mv_changchunqinna_tuogang` | 7 | `aoe_single` · 1 | 1.20 | 7% | 2 | 1000 | 击退 2 | ✓ |

- 核算：扣腕 1 − 0.03；折肩 1.12 − 0.03；托缸式 1.29 − 0.10。被动：`ps_changchunqinna_nawan` 拿人先拿腕（5 重，对持兵器目标 Z3 +8%）；`ps_changchunqinna_dacheng` 大成（10 重，`attr:seal pp +5`）。

**`sk_haotianzhang` 昊天掌**（5 玄中 · 拳脚/拳掌 · 阳 · 0.55/0.45 · 原著；使用者**（待考：《神雕侠侣》全真门人交手段落）**）
- 原著：全真派掌法之名；招式命名为原创扩展。
- reqs：`attrs {str 25}`；`aptitude {apFist 25}`；`sect {sect_quanzhen, rank 2}`；`prereq [sk_sanqingzhang ≥ 4]`；`hard [sect, prereq]`。layerStats `{defIn [1, 5], hit [1, 5]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 昊天正气 | `mv_haotianzhang_zhengqi` | 1 | `aoe_single` · 1 | 1.00 | 6% | 0 | 1000 | — | ✓ |
| 云行雨施 | `mv_haotianzhang_yunxing` | 2 | `aoe_disk {r:1}`（中心点＋六邻格）· 1–2（`ranged`） | 0.75 | 7% | 2 | 1000 | — | ✓ |
| 紫气东来 | `mv_haotianzhang_ziqi` | 4 | `aoe_single` · 1 | 1.25 | 7% | 2 | 1000 | `bf_sangong`·承·40%·2 | ✓ |
| 昊天罔极（普通招；原创扩展命名） | `mv_haotianzhang_wangji` | 7 | `aoe_single` · 1 | 1.40 | 8% | 3 | 1000 | 击退 1；`ultimate:false` | ✓ |

- **AR-16 审计**：`mv_haotianzhang_yunxing` 只明确远程范围，未说明掌力离体，暂记待考；其余均按接触掌击处理。

- 核算：云行雨施 0.70 × 1.29 × 0.85 = 0.768，取 0.75；紫气东来 1.29 − 0.04；昊天罔极 `1.46−0.05=1.41≈1.40`。被动：`ps_haotianzhang_zhengqi` 正气（5 重，对 `morality ≤ −20` 的目标 Z3 +8%）；`ps_haotianzhang_dacheng` 大成（10 重，本武学耗内 −10%）。

**`sk_sanhuajudingzhang` 三花聚顶掌**（6 玄上 · 拳脚/拳掌 · 阳 · 0.40/0.60 · 原著）
- 原著：全真派掌法，神雕中郝大通以此掌误伤古墓孙婆婆致死；情节位置仍须核对**（待考：《神雕侠侣》杨过入全真后与孙婆婆退敌、郝大通出手的段落）**。“三花聚顶”为道家内丹语（精、气、神三花）。
- reqs：`aptitude {apFist 30, apInner 25}`；`sect {sect_quanzhen, rank 3}`；`prereq [sk_haotianzhang ≥ 5]`；`hard [sect, prereq]`。layerStats `{crit [1, 4], pierce [1, 6]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 精化气 | `mv_sanhuajudingzhang_jing` | 1 | `aoe_single` · 1 | 1.00 | 6% | 0 | 1000 | — | ✓ |
| 气化神 | `mv_sanhuajudingzhang_qi` | 3 | `aoe_single` · 1 | 1.15 | 7% | 1 | 1000 | `bf_neishang`·承·30%·4 | ✓ |
| 神还虚 | `mv_sanhuajudingzhang_shen` | 5 | `aoe_single` · 1–3（`ranged`） | 1.15 | 8% | 2 | 1000 | — | ✓ |
| 三花聚顶（绝招） | `mv_sanhuajudingzhang_juding` | 7 | `aoe_single` · 1 | 2.90 | 8% | — | 1200 | `ultimate:true`；气势 100；`bf_neishang`·承·100%·4 | ✓；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- **AR-16 审计**：`mv_sanhuajudingzhang_shen` 只有 `ranged` 几何，无离体掌力证据，暂记待考；其余为贴身掌击。

- 核算：气化神 1.17 − 0.03；神还虚 1.34 × 0.85 = 1.14；三花聚顶 3.0 − 0.10。被动：`ps_sanhuajudingzhang_sanhua` 三花（1 重，对带 `injury` 标签目标 Z3 +4% → +10%）；`ps_sanhuajudingzhang_juding` 聚顶（6 重，本武学内劲部分无视内防 8% → 15%，Z2）；`ps_sanhuajudingzhang_dacheng` 大成（10 重，本武学 `crit flat +8`）。

**`sk_zhongnanjian` 终南剑法**（3 黄上 · 兵器/剑 · 阳 · 0.75/0.25 · 原创扩展）
- reqs：`sect {sect_quanzhen, rank 1}`；`hard [sect]`。layerStats `{parry [1, 3], hit [1, 3]}`。获取：拜师；鹿鼎★白云观。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 樵山问路 | `mv_zhongnanjian_wenlu` | 1 | `aoe_single` · 1 | 1.00 | 5% | 0 | 1000 | — | ✓ |
| 松涛 | `mv_zhongnanjian_songtao` | 4 | `aoe_cone {angle:120,r:1,dirCount:6}` | 0.95 | 5% | 1 | 1000 | — | ✓ |
| 白云出岫 | `mv_zhongnanjian_chuxiu` | 7 | `aoe_dash n3` · 1–3 | 1.20 | 6% | 2 | 1000 | — | ✓ |

- 核算：松涛以 N=3、AF=0.85 计，0.85 × 1.12 = 0.95；白云出岫 1.29 − 0.10。被动：`ps_zhongnanjian_zhonggong` 剑守中宫（5 重，`attr:parry pct +3%`）；`ps_zhongnanjian_yuanman` 入门圆满（10 重，学习全真剑法软门槛 −10）。

**`sk_quanzhenjian` 全真剑法**（5 玄中 · 兵器/剑 · 阳 · 0.60/0.40）——**完整定义见 05 §13.6**，本文不重述数值。
- 招式：定阳针 `mv_quanzhenjian_dingyang`（1 重，1.00）、七星聚会 `mv_quanzhenjian_qixing`（4 重，`aoe_multi` 7 段，1.10）、三清朝元 `mv_quanzhenjian_sanqing`（6 重，`aoe_line n3`，0.95，自身 `bf_jianshi`）、重阳遗意 `mv_quanzhenjian_chongyang`（7 重普通招，1.50、8%、冷却 2、收招 1200，`ultimate:false`）；被动玄门正宗 / 剑随身走 / 同气连枝 / 大成。`setTags: [set_quanzhen_beidou, set_shendiao_xialv]`。本项镜像 05 §13.6。
- 本文对它的依赖：同归剑法、天罡北斗阵以其为前置；玉女素心剑法"全真位"前置（05 §9.3.1）。建议 05 增补前置 `sk_zhongnanjian ≥ 4`（可选，§11 D-5），以构成"黄 → 玄 → 地"剑法链。

**`sk_jinyangong` 金雁功**（6 玄上 · 轻功 · 阳 · 0.80/0.20 · 原著）
- 原著：全真派轻功之名；传授与使用细节仍须核对**（待考：《射雕英雄传》《神雕侠侣》全真人物施展金雁功的段落）**。`Q_skill = QS(6) = 74` 满层。
- reqs：`attrs {agi 30}`；`aptitude {apLight 25}`；`sect {sect_quanzhen, rank 2}`；`hard [sect]`。获取：拜师；射雕"马钰夜授"（maxLayer 8）。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 雁翔 | `mv_jinyangong_yanxiang` | 1 | `aoe_self` | 0 | 5% | 3 | 800 | `bf_jixing`·承·100%·3 | — |
| 雁回（绝招；提升既有招式，原创扩展命名） | `mv_jinyangong_yanhui` | 7 | `aoe_self` | 0 | 8% | — | 1200 | `ultimate:true`；气势 100；自身后撤 4 格（`retreat`，不触发截击）；`bf_piaohu`·承·100%·3 | —；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- 被动：`ps_jinyangong_qingshen` 身轻（1 重，`attr:eva pct +2% → +6%`）；`ps_jinyangong_panya` 攀崖（5 重，探索攀崖体力 −20%，战斗中攀越高差不额外耗移动力，08）；`ps_jinyangong_dacheng` 大成（10 重，`attr:jump flat +1`）。

**`sk_dabeidouzhen` 北斗大阵**（5 玄中 · 杂学/阵法（合击）· 阳 · 0.60/0.40 · 游戏概括名）
- `setTags: [set_quanzhen_beidou]`。
- 原著：神雕重阳宫一役，全真三代弟子以七个天罡北斗阵合成七七四十九人的大阵迎战郭靖；原文对该大阵的正式称谓仍须核对**（待考：《神雕侠侣》郭靖闯重阳宫、四十九道士列阵段落）**。本条是三代弟子使用的简化玩家版**（原创扩展）**，不属于 C13 的两个“七人阵”，保留独立三人门槛。
- reqs：`sect {sect_quanzhen, rank 3}`；`prereq [sk_quanzhenjian ≥ 3]`；`hard [sect]`。`special.formation`：同阵营、装配本武学、未倒地且未受硬控的有效实际单位 ≥ 3；阵主 3 格内且每名阵员 2 格内至少另有一人；`minMembers: 3`、`dissolveBelow: 3`、持续 3 次阵主行动；不生成虚位；`fusible: false`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 列阵 | `mv_dabeidouzhen_liezhen` | 1 | `aoe_allies r3` | 0 | 5% | 5 | 900 | 3 个有效实际单位成阵，持续 3 次阵主行动：阵员常驻 `bf_zhuiji`；与 ≥ 2 名阵员相邻的敌人获得 `bf_suoding` | — |
| 合围 | `mv_dabeidouzhen_hewei` | 1 | `aoe_single` · 1 | 1.20 | 6% | 1 | 1000 | `bf_suoding`·承·60%·2 | ✓ |
| 换位 | `mv_dabeidouzhen_huanwei` | 4 | `aoe_swap`（友方）· 1–3 | 0 | 4% | 2 | 800 | 与 3 格内阵员换位 | — |

- 核算：合围 `1.00×(1+0.12+0.15)−0.03=1.24≈1.20`（条件：目标与 ≥ 2 阵员相邻）。被动：`ps_dabeidouzhen_zhenzhong` 阵中（1 重，阵员 `attr:parry pct +3% → +6%`）；`ps_dabeidouzhen_xianghu` 相护（5 重，阵员被攻击后相邻阵员获得 `bf_yuanhu` 1 回合，每阵每回合 1 次）；`ps_dabeidouzhen_dacheng` 大成（10 重，本阵光环 Z4 +5%，不替天罡北斗阵补人数）。

#### 2.5.1 AR-01 新增玄阶紧凑卡（5 门）

> 下列均为 **（原创扩展）**，`origin: expanded`、`sect: sect_quanzhen`、`sourceChapters: [ch02_shediao, ch03_shendiao]`，`setTags: []`、`conflicts: []`；外功 `special.fusible: true`，内功不可观摩。未另写的普通招式均 `friendlyFire: none`。

**`sk_beidouxinfa` 北斗心法**（5 玄中 · 内功/心法 · `nature: yang` · 0/1）
- 字段：`reqs {attrs {wil:25,wis:25}, aptitude {apInner:25}, sect {id:sect_quanzhen,rank:2}, prereq [{skill:sk_qixingzhuang,layer:4}], hard:[sect,prereq]}`；`inner.contribution {mpMaxPct:17,hpMaxPct:10,attrs:{con:2,wil:3,wis:2},mpRegen:1.5}`，IP `17+10+2×7+5×1.5=48.5`；`stats {parry:5,resMind:5}`；`meridians:[mer_renmai,mer_dumai]`；`yunjin:[tiaoxi,huti]`。
- 招式：北斗守一 `mv_beidouxinfa_shouyi`（1 重，自身，6%/cd3/收招900，`bf_shouyi`·承·2）；斗柄回元 `mv_beidouxinfa_huiyuan`（5 重，自身，7%/cd4/收招900，驱散 1 个 `injury` 并获 `bf_huinei`·承·2）。被动：斗枢 `ps_beidouxinfa_doushu`（招架 +3%→8%）；循斗 `ps_beidouxinfa_xundou`（同装全真阵法时效果抵抗 +5%→12%）；圆满 `ps_beidouxinfa_yuanman`（10 重，全真阵法修炼 +10%）。获取：L2 入门道士于七星桩 4 重后传授。

**`sk_qixingbu` 七星步**（4 玄下 · 轻功 · `nature: yang` · 0.80/0.20）
- 字段：`reqs {attrs {agi:22}, aptitude {apLight:20}, sect {id:sect_quanzhen,rank:2}, prereq [{skill:sk_qixingzhuang,layer:4}], hard:[sect,prereq]}`；`layerStats {eva:[2,5],parry:[1,2]}`（合计 7≤玄阶 10）；满层 `Q_skill=QS(4)=56`。
- 招式：移星 `mv_qixingbu_yixing`（1 重，自身，5%/cd2/收招800，移动 2 格且不触发截击）；换斗 `mv_qixingbu_huandou`（4 重，友方 1–3 格，5%/cd3/收招800，与目标换位）；踏罡 `mv_qixingbu_tagang`（7 重，自身，6%/cd3/收招800，`bf_piaohu`·承·2）。被动：循位 `ps_qixingbu_xunwei`（相邻友方时闪避 +3%→8%）；归阵 `ps_qixingbu_guizhen`（阵法有效时移动后首次攻击 Z3 +5%→12%）。获取：L2 传授；`observable:true`，观摩上限 5 重。

**`sk_chongyangzhang` 重阳掌**（6 玄上 · 拳脚/拳掌 · `nature: yang` · 0.55/0.45）【玄阶预算抽样】
- 字段：`reqs {attrs {str:30,wil:30}, aptitude {apFist:30}, sect {id:sect_quanzhen,rank:3}, prereq [{skill:sk_haotianzhang,layer:5}], hard:[sect,prereq]}`；`layerStats {hit:[2,6],defIn:[1,4]}`（10）；`moveSlots:3`。
- 招式：正阳掌 `mv_chongyangzhang_zhengyang`（1 重，单体近身，1.00，6%/cd0/1000，可招架）；推云 `mv_chongyangzhang_tuiyun`（3 重，`aoe_line n2`，1.00，6%/cd1/1000，可招架）；重阳叠掌 `mv_chongyangzhang_diezhang`（7 重绝招，单体近身，2.90，8%/无冷却/1200，`ultimate:true`、气势 100、100% `bf_neishang`·承·2，可招架）。核算：`1.00`；`0.90×(1+0.12)=1.008≈1.00`；绝招 `3.00−0.10=2.90`。仅重阳叠掌为绝招，前两式 `ultimate:false`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 被动：纯阳贯掌 `ps_chongyangzhang_chunyang`（内劲穿透 +4%→10%）；中正 `ps_chongyangzhang_zhongzheng`（未移动时招架 +3%→8%）；大成 `ps_chongyangzhang_dacheng`（10 重，对 `injury` 目标 Z3 +10%）。获取：L3 亲传；`observable:true`，观摩上限 6 重。

**`sk_tongxuanjian` 通玄剑**（6 玄上 · 兵器/剑 · `nature: harmony` · 0.65/0.35）【玄阶预算抽样】
- 字段：`reqs {attrs {agi:30,wis:30}, aptitude {apSword:30}, sect {id:sect_quanzhen,rank:3}, prereq [{skill:sk_quanzhenjian,layer:5}], hard:[sect,prereq]}`；`layerStats {parry:[2,6],hit:[1,4]}`（10）；`weaponReq:{category:sword}`；`moveSlots:3`。
- 招式：通玄刺 `mv_tongxuanjian_ci`（1 重，单体近身，1.00，6%/cd0/1000，可招架）；三清贯线 `mv_tongxuanjian_sanqing`（4 重，`aoe_line n3`，1.05，6%/cd2/1000，可招架）；破关 `mv_tongxuanjian_poguan`（7 重绝招，单体近身，2.90，8%/无冷却/1200，`ultimate:true`、气势 100、100% `bf_pojia`·承·2，可招架）。核算：`1.00`；`0.85×(1+0.24)=1.054≈1.05`；绝招 `3.00−0.10=2.90`。仅破关为绝招，前两式 `ultimate:false`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 被动：剑气通玄 `ps_tongxuanjian_jianqi`（内劲部分无视内防 4%→10%）；守中 `ps_tongxuanjian_shouzhong`（招架成功获 `bf_shouyi` 1 回合，每回合 1 次）；大成 `ps_tongxuanjian_dacheng`（10 重，持剑时效果命中 +8%）。获取：L3 亲传；`observable:true`，观摩上限 6 重。

**`sk_beidoufuchen` 北斗拂尘**（6 玄上 · 兵器/鞭索（拂尘）· `nature: yang` · 0.65/0.35）【玄阶预算抽样】
- 字段：`reqs {attrs {agi:30,wil:28}, aptitude {apWhip:30}, sect {id:sect_quanzhen,rank:3}, prereq [{skill:sk_qixingbu,layer:5}], hard:[sect,prereq]}`；`layerStats {hit:[2,6],seal:[1,4]}`（10）；`weaponReq:{category:whip,tags:[fuchen]}`；`moveSlots:3`。
- 招式：拂星 `mv_beidoufuchen_fuxing`（1 重，单体 1–2 格，1.00，6%/cd0/1000，可招架）；斗柄横扫 `mv_beidoufuchen_hengsao`（4 重，`aoe_ring r1`，0.95，6%/cd2/1000，可招架）；缠辰 `mv_beidoufuchen_chanchen`（7 重绝招，单体 1–2 格，2.70，8%/无冷却/1200，`ultimate:true`、气势 100、100% `bf_shouqin(level:4,holdRange:1)`·承·2，可招架）。核算：`1.00`；`0.75×1.24=0.93≈0.95`；绝招 `3.00−0.20−0.10（射程）=2.70`。仅缠辰为绝招，前两式 `ultimate:false`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 被动：尘尾循星 `ps_beidoufuchen_xunxing`（两格攻击命中 +3%→8%）；北斗牵制 `ps_beidoufuchen_qianzhi`（缠绕目标对全真阵员伤害 −5%→12%）；大成 `ps_beidoufuchen_dacheng`（10 重，招架后 `ct +50`，每回合 1 次）。获取：L3 亲传；`observable:true`，观摩上限 6 重。

#### 2.5.2 黄阶一行总表（11 门）

> 本表把原有 4 门与 AR-01 新增 7 门统一转写为八字段一行；原有展开卡继续保留为详细定义。伤害缩写 Y1–Y5 的整体预算见 §8.5。

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或（原创扩展） |
|---|---|---|---|---|---|---|---|
| `sk_quanzhentunajue` | 全真吐纳诀 | 全真教 L1 | 2 黄中·内功/心法·`nature:yang` | 射雕、神雕、鹿鼎★ | IP `8+5+2×3+5×1.0=24`；`mer_renmai` | 无；L1 | **（原创扩展）** |
| `sk_sanqingzhang` | 三清掌 | 全真教 L1 | 2 黄中·拳脚/拳掌·阳 | 射雕、神雕、鹿鼎★ | 单体掌＋线2；Y1/Y2 | 无；L1 | **（原创扩展）** |
| `sk_yuyangtui` | 玉阳腿 | 王处一一系 | 3 黄上·拳脚/腿法·阳 | 射雕、神雕 | 单体腿＋架势反击＋扇形扫腿；Y1/Y3 | 无；L2 | **（原创扩展）**，人物依据待考见 K-5 |
| `sk_zhongnanjian` | 终南剑法 | 全真教 L1 | 3 黄上·兵器/剑·阳 | 射雕、神雕、鹿鼎★ | 单体刺＋扇形扫＋突进；Y1/Y3/Y4 | 无；L1 | **（原创扩展）** |
| `sk_baiyunguanxinfa` | 白云观心法 | 鹿鼎北京白云观 | 2 黄中·内功/心法·`nature:harmony` | 鹿鼎★ | IP `8+5+2×3+5×1.0=24`；`attrs {con:1,wil:1,wis:1}`；`mer_renmai` | 无；L1 | **（原创扩展）**；史实宫观不等同小说武学 |
| `sk_chongyangchangquan` | 重阳长拳 | 全真教 / 白云观 | 3 黄上·拳脚/拳掌·阳 | 射雕、神雕、鹿鼎★ | 单体直拳＋线2进步拳；Y1/Y2 | 无；L1 | **（原创扩展）** |
| `sk_quanzhenqinna` | 全真擒拿 | 全真教 / 白云观 | 3 黄上·拳脚/擒拿·阳 | 射雕、神雕、鹿鼎★ | 单体拿腕，30% `bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)`；Y5 | 无；L1 | **（原创扩展）** |
| `sk_longmenjian` | 龙门剑式 | 鹿鼎北京白云观 | 3 黄上·兵器/剑·调和 | 鹿鼎★ | 单体点剑＋线2；Y1/Y2 | 无；L1 | **（原创扩展）**；借全真龙门派名目 |
| `sk_quanzhenfuchen` | 全真拂尘 | 全真教 / 白云观 | 3 黄上·兵器/鞭索（拂尘）·阳 | 射雕、神雕、鹿鼎★ | 单体 1–2 格＋30% `bf_jiansu`；Y5 | 无；L1 | **（原创扩展）** |
| `sk_xuanmenxingbu` | 玄门行步 | 全真教 / 白云观 | 2 黄中·轻功·调和 | 射雕、神雕、鹿鼎★ | 自身 `bf_wenzhong` / `bf_jisu` 二选一；满层 `QS(2)=38` | 无；L1 | **（原创扩展）** |
| `sk_qixingzhuang` | 七星桩 | 全真教 L1 | 3 黄上·杂学/阵法·阳 | 射雕、神雕 | 自身 `bf_wenzhong`；相邻同门互获 `bf_yuanhu`，不构成强制合击 | 无；L1 | **（原创扩展）** |

### 2.6 进阶链与门派内搭配

| 链 | 前置关系 |
|---|---|
| 内功（黄 → 玄 → 地 → 天） | 全真吐纳诀（黄中）→ 4 重 → 全真心法（玄中）→ 6 重 → 金关玉锁二十四诀（地中）→ 5 重 → 先天功（天中）；七星桩（黄上）→ 4 重 → 北斗心法（玄中）；白云观心法为鹿鼎★独立入门支线 |
| 剑（黄 → 玄 → 地 / 天） | 终南剑法（黄上）→（建议 4 重）→ 全真剑法（玄中）→ 5 重 → 通玄剑（玄上）→ 6 重 → 同归剑法（地下）；全真剑法 5 重亦可进入玉女素心剑法全真位（天中） |
| 拳脚 | 三清掌 / 重阳长拳（黄）→ 昊天掌 / 长春擒拿手（玄）→ 重阳掌 / 三花聚顶掌（玄上）。**全真无地阶拳脚**（原著亦无），为有意保留的门派短板 |
| 轻功 / 拂尘 | 玄门行步（黄中）→ 七星步（玄下）→ 金雁功（玄上）；全真拂尘（黄上）→ 北斗拂尘（玄上） |
| 阵法 | 七星桩（黄上）→ 北斗大阵（玄中，3 人）→ 天罡北斗阵（天下，4–6 人） |

- **推荐装配（射雕中期）**：主运全真心法＋辅运全真吐纳诀｜三花聚顶掌、长春擒拿手｜全真剑法、同归剑法｜金雁功｜天罡北斗阵。
- **阴阳搭配**：金关玉锁为调和桥接，可让先天功（阳）与玉女心经（阴）同装不相冲——对应原著"全真、古墓双修方成素心剑"。

---

## 3. 古墓派 `sect_gumu`

> 李莫愁支补录武学见 `skills-bulu-03-shendiao.md` §1：`sk_chiliandugong`、`sk_chilianfuchen`；补录卡归该册定义，本文只登记入口。

### 3.1 门派简介

- **来历**：林朝英所创。林朝英与王重阳相争，于终南山活死人墓中创玉女心经，专克全真武功（神雕追述）。门规严苛：弟子须终身居墓、不涉情爱；下山誓约的逐字仍须核对**（待考：《神雕侠侣》小龙女向杨过说明古墓门规及下山条件的段落）**。
- **神雕（1237–1259）**：小龙女为掌门，孙婆婆随侍；师姊李莫愁被逐后以"赤练仙子"之名横行，以赤练神掌、冰魄银针、拂尘绝招著称。《五毒秘传》由陆无双从李莫愁所藏书物中取走；其版本原文与书中内容仍须核对**（待考：《神雕侠侣》陆无双携书、杨过翻阅相关情节）**。杨过拜入古墓，与小龙女合练玉女心经，终成玉女素心剑法（见 §4）。**强**：人少而精，轻功冠绝一时。
- **倚天**：原著不再明言古墓门派活动，少林屠狮大会上黄衫女子现身且来历指向终南一脉；其是否可直称杨过后人仍须核对**（待考：《倚天屠龙记》屠狮大会黄衫女子出场、自述及旁白）**。本作以黄衫女子羁绊线传授部分古墓入门/中坚武学（★，原创扩展，maxLayer ≤ 8）。
- **敌人配置建议**：李莫愁（神雕具名 Boss，主力赤练神掌 / 冰魄银针 / 三无三不手，地下—地中）；洪凌波（精英，玄上）。

### 3.2 武学总表（27 门）

| ID | 名称 | 大类/子类 | 品阶 | 内力性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_gumuxinfa` | 古墓心法 | 内功/心法 | 3 黄上 | 阴 | 0/1 | 神雕、倚天★ | 拜师（L1）；寒玉床修习；倚天★黄衫女子 | 原著扩展 |
| `sk_hanyuxinjue` | 寒玉心诀 | 内功/心法 | 6 玄上 | 阴 | 0/1 | 神雕 | 拜师（L2）；寒玉床闭关顿悟 | 原创扩展 |
| `sk_yunvxinjing` | 玉女心经 | 内功/心法 | 10 天下 | 阴 | 0/1 | 神雕 | 小龙女传授（L3）；古墓石室解谜 | 原著（基准 §13） |
| `sk_tianluodiwang` | 天罗地网势 | 拳脚/拳掌 | 2 黄中 | 阴 | 0.70/0.30 | 神雕、倚天★ | 拜师（L1）；捕雀修炼 | 原著 |
| `sk_meinvquan` | 美女拳法 | 拳脚/拳掌 | 4 玄下 | 阴 | 0.70/0.30 | 神雕、倚天★ | 拜师（L2） | 原著 |
| `sk_chilianshenzhang` | 赤练神掌 | 拳脚/拳掌 | 7 地下 | 阴 | 0.45/0.55 | 神雕 | 李莫愁投师（邪）；秘籍；观摩 | 原著 |
| `sk_hantanjian` | 寒潭剑法 | 兵器/剑 | 3 黄上 | 阴 | 0.70/0.30 | 神雕 | 拜师（L1） | 原创扩展 |
| `sk_yunvjian` | 玉女剑法 | 兵器/剑 | 6 玄上 | 阴 | 0.60/0.40 | 神雕、倚天★ | 拜师（L2）；古墓石室 | 原著 |
| `sk_jinlingsuo` | 金铃索法 | 兵器/鞭索 | 7 地下 | 阴 | 0.50/0.50 | 神雕 | 小龙女传授（L3） | 原著；兵刃名**（待考：《神雕侠侣》小龙女以白绸金球对敌的段落）** |
| `sk_sanwusanbushou` | 三无三不手 | 兵器/鞭索（拂尘） | 6 玄上 | 阴 | 0.55/0.45 | 神雕 | 李莫愁投师（邪）；观摩 | 原著（三招即"三无"） |
| `sk_buquegong` | 捕雀功 | 轻功 | 3 黄上 | 阴 | 0.80/0.20 | 神雕 | 拜师（L1）；古墓大厅捕雀修炼 | 原著扩展 |
| `sk_gumuqinggong` | 古墓轻功 | 轻功 | 9 地上 | 阴 | 0.80/0.20 | 神雕、倚天★ | 拜师（L3） | 原著扩展 |
| `sk_yufengzhen` | 玉蜂针 | 暗器 | 5 玄中 | 阴 | 0.70/0.30 | 神雕 | 拜师（L2）；需蜂针弹药 | 原著 |
| `sk_bingpoyinzhen` | 冰魄银针 | 暗器 | 7 地下 | 阴 | 0.70/0.30 | 神雕 | 李莫愁投师（邪）；五毒秘传附录 | 原著 |
| `sk_yufengshu` | 驭蜂术 | 杂学/驭兽 | 6 玄上 | 阴 | 0.50/0.50 | 神雕 | 小龙女传授（L2）；周伯通亦可转授 | 原著扩展（名称原创） |
| `sk_wudumichuan` | 五毒秘传 | 杂学/毒 | 6 玄上 | 阴 | 0.50/0.50 | 神雕 | 陆无双携书线；李莫愁邪线传授 | 原著书名，内容**（待考：《神雕侠侣》陆无双携书、杨过翻阅相关情节）** |
| `sk_hanyujinggong` | 寒玉静功 | 内功/心法 | 5 玄中 | 阴 | 0/1 | 神雕 | 寒玉床闭关；古墓 L2 | 原创扩展 |
| `sk_yunvsanshou` | 玉女散手 | 拳脚/拳掌 | 5 玄中 | 阴 | 0.60/0.40 | 神雕 | 古墓 L2；天罗地网势进阶 | 原创扩展 |
| `sk_muzhongyixing` | 墓中移形 | 轻功 | 4 玄下 | 阴 | 0.80/0.20 | 神雕 | 古墓 L2；墓道试炼 | 原创扩展 |
| `sk_baichousuofa` | 白绸索法 | 兵器/鞭索 | 6 玄上 | 阴 | 0.55/0.45 | 神雕 | 古墓 L3；白绸柔劲进阶 | 原创扩展 |
| `sk_yufengyin` | 玉蜂引 | 杂学/驭兽 | 6 玄上 | 阴 | 0.45/0.55 | 神雕 | 古墓 L3；玉蜂哨进阶 | 原创扩展 |
| `sk_gumudaoyin` | 古墓导引 | 内功/心法 | 2 黄中 | 阴 | 0/1 | 神雕 | 古墓 L1 | 原创扩展 |
| `sk_gumujichushou` | 古墓基础手 | 拳脚/擒拿 | 1 黄下 | 阴 | 0.80/0.20 | 神雕 | 古墓 L1 | 原创扩展 |
| `sk_yunvjianji` | 玉女剑基 | 兵器/剑 | 3 黄上 | 阴 | 0.75/0.25 | 神雕 | 古墓 L1 | 原创扩展 |
| `sk_baichouroujin` | 白绸柔劲 | 兵器/鞭索 | 3 黄上 | 阴 | 0.70/0.30 | 神雕 | 古墓 L1 | 原创扩展 |
| `sk_muzhongbu` | 墓中步 | 轻功 | 2 黄中 | 阴 | 0.80/0.20 | 神雕 | 古墓 L1 | 原创扩展 |
| `sk_yufengshao` | 玉蜂哨 | 杂学/驭兽 | 3 黄上 | 阴 | 0.45/0.55 | 神雕 | 古墓 L1；玉蜂浆教学 | 原创扩展 |

### 3.3 天级条目卡

#### `sk_yunvxinjing` 玉女心经（10 天下 · 内功 · 古墓）

> **原著**：林朝英所创，专克全真武功；练功时周身热气须外散、须有人护法，小龙女与杨过于古墓外花丛中合练，因旁人窥扰致小龙女受伤（神雕；窥扰者新修版有改动，见 §11 K-2）。古墓另有"十二少、十二多"养生要诀**（待考：《神雕侠侣》古墓传授玉女心经及养生要诀的段落）**。心经末章即玉女素心剑法（见 §4）。招式与被动效果为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | `nature: yin`；`wOut/wIn: 0/1` |
| 原生书界 | 神雕（基准 §13） |
| reqs | `attrs {agi 50, wil 55, wis 50}`；`aptitude {apInner 55}`；`sect {id: sect_gumu, rank: 3}`；`prereq [{anyOf: [{skill: sk_gumuxinfa, layer: 6}, {skill: sk_hanyuxinjue, layer: 3}]}]`；`hard [sect, prereq]`（外层 AND、组内 OR，见 `decisions/rulings-v1.md` §4） |
| 内功贡献 | `mpMaxPct 44, hpMaxPct 23, attrs {agi 8, wil 8, wis 2}, mpRegen 3.0` → IP 118（= 天下预算）；`stats {resMind 10, resHeat 10}`（20） |
| InnerDef | `seclusionCap: 8`；`auxUsableMoves: [mv_yunvxinjing_hufa]` |
| 层数要点 | 1 重"克全真"；2 重"清灵"；3 重散热；4 重"少思寡欲"；6 重"寒玉相济"；**7 重冰心玉壶（第一绝招）**；8 重"双修"；**9 重护法（第二绝招）**；10 重"玉女大成" |
| 获取 | ① `master`：小龙女 `npc_xiaolongnv`（古墓L3，神雕主线第 3 幕后，02 §2.9 R3），maxLayer 10；② `puzzle`：古墓石室顶玉女心经石刻（林朝英所刻，原著），需古墓身份或小龙女同行（占位 `q_03_side_79`），maxLayer 10 |
| setTags | `[set_gumu_yunv, set_shendiao_xialv]` |
| conflicts | `{with: sk_zuoyouhubo, type: synergy}`：装配本功时左右互搏"纯一系数"+0.2（原著小龙女心无杂念、一学即会，05 §9.3.2）；与阳性主运的阴阳相冲按 05 §5.4（金关玉锁可桥接） |
| special | **修炼规则（原创扩展规则化）**：闭关修炼本功须"同修护法"（羁绊 ≥ 3 的队友同处闭关点）或在古墓寒玉床，否则每日心魔概率 ×2；闭关被伏击打断 → 走火 2 级（致敬小龙女练功被扰受伤）。`fusible: true`；`observable: false` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 散热（原创扩展命名） | `mv_yunvxinjing_sanre` | 3 | `aoe_self` | 0 | 8% | 3 | 900 | 驱散自身 2 个 `heat` / `injury` / `mind` 减益（品阶承）；回复 8% 气血 | — | 支援 |
| 护法（绝招；原创扩展命名） | `mv_yunvxinjing_hufa` | 9 | `aoe_single` · 1（友方） | 0 | 10% | — | 1200 | `ultimate:true`；气势 100；目标 `bf_mian_xin`·承·100%·3、`bf_huinei`·承·100%·3；目标为羁绊 ≥ 3 者时自身同得 | — | 单体支援绝招；仍可作辅运使用；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 冰心玉壶（绝招，原创扩展命名，取王昌龄诗） | `mv_yunvxinjing_bingxin` | 7 | `aoe_allies r2` | 0 | 10% | — | 1200 | `ultimate:true`；气势 100；友方驱散全部 `mind` 减益；自身 `bf_jienei`·承·100%·3、`bf_piaohu`·承·100%·3 | — | 内功绝招以友方效果为主；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 克全真 | `ps_yunvxinjing_kequanzhen` | 1 | stat · Z5 | +6% → +15% | 对"主运内功或所用招式属 `sect_quanzhen`"的目标，本方招式 Z5 加算；与玉女剑法同类被动不叠加（取高）；`auxMode: scaled` |
| 清灵 | `ps_yunvxinjing_qingling` | 2 | stat · 属性层 | `attr:eva pct +3% → +8%`、`attr:spd pct +2% → +5%` | `auxMode: scaled` |
| 少思寡欲（十二少） | `ps_yunvxinjing_shiershao` | 4 | effect | −1 回合 | 心神类减益对自身持续 −1（最低 1）；`auxMode: full` |
| 寒玉相济 | `ps_yunvxinjing_hanyu` | 6 | mechanic | ×1.5 | 主运时于古墓寒玉床闭关，本功及古墓武学修炼 ×1.5；年效说法待核**（待考：《神雕侠侣》小龙女令杨过睡寒玉床修炼的段落）**；灵地系数另计（05 §8.3） |
| 双修 | `ps_yunvxinjing_shuangxiu` | 8 | effect · 属性层 / Z4 | `attr:atkIn pct +8%`、Z4 +5% | 与羁绊 ≥ 3、装配玉女心经 / 全真心法 / 金关玉锁的友方相距 ≤ 2 时双方获得；`auxMode: none` |
| 玉女大成 | `ps_yunvxinjing_dacheng` | 10 | mechanic | — | 玉女素心剑法独练系数 0.5 → 0.6（05 §9.3.1 `soloMult`）；`attr:spd pct +6%` |

### 3.4 地阶条目卡

#### `sk_chilianshenzhang` 赤练神掌（7 地下 · 拳脚/拳掌 · 古墓·李莫愁一系）

> **原著**：李莫愁“赤练仙子”的招牌毒掌，中者掌印殷红、毒发难救；“五毒神掌”是否为同一掌法之别名仍须核对**（待考：《神雕侠侣》李莫愁施展赤练神掌 / 五毒神掌的各处段落与版本用名）**。李莫愁临死于情花丛火中犹吟“问世间，情是何物，直教生死相许”（元好问词，神雕）。招式名除“五毒神掌”外为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阴 · 0.45/0.55 |
| 原生书界 | 神雕 |
| reqs | `attrs {agi 40, wil 35, wis 40}`；`aptitude {apFist 40}`；`morality {max −20}`（软，05 §7.3 邪派武学）；`prereq [sk_wudumichuan ≥ 3]`；`hard [prereq]` |
| layerStats | `{crit [1, 5], effHit [2, 10]}`（15） |
| 层数要点 | 1 重赤练吐信、"毒掌"；2 重朱砂掌印；3 重"赤印"；4 重赤练缠身；5 重翻鳞掌；6 重"邪心"；**7 重绝招生死相许**；9 重五毒神掌；10 重"赤练大成" |
| 获取 | ① `master`：李莫愁 `npc_limochou`（"投师"邪路线，占位 `q_03_faction_80`，原创扩展），maxLayer 10；② `manual`：击败李莫愁后于其行囊得残本 `it_miji_chilianshenzhang_can`（原创扩展），maxLayer 7；③ `observe`，maxLayer 6 |
| setTags · conflicts | `[]`；无 |
| special | 装配时持有 `bf_xielian`（邪气，06 §8.9：`resMind` −15pp、正派 NPC 初见好感 −10）；`fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 赤练吐信 | `mv_chilianshenzhang_tuxin` | 1 | `aoe_single` · 1 | 0.85 | 6% | 0 | 900 | `bf_zhongdu`·承·30%·3 | ✓ | 1 −0.05（mp）−0.07（rec）−0.03 = 0.85 |
| 朱砂掌印 | `mv_chilianshenzhang_zhangyin` | 2 | `aoe_single` · 1 | 0.95 | 8% | 1 | 1000 | `bf_zhongdu`·承·100%·3（2 层） | ✓ | 1.17 −0.20 = 0.97 |
| 赤练缠身 | `mv_chilianshenzhang_chanshen` | 4 | `aoe_single` · 1 | 1.15 | 8% | 2 | 1000 | `bf_shouqin(level:4,holdRange:1)`·承·60%·2 | ✓ | 1.29 −0.12 = 1.17 |
| 翻鳞掌 | `mv_chilianshenzhang_fanlin` | 5 | `aoe_cone {angle:120,r:1,dirCount:6}` | 1.05 | 8% | 2 | 1000 | `bf_zhongdu`·承·50%·3 | ✓ | N=3、AF=0.85；0.85 × 1.29 = 1.10，−0.05 = 1.05 |
| 生死相许（绝招，原创扩展命名） | `mv_chilianshenzhang_xiangxu` | 7 | `aoe_single` · 1 | 2.85 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_judu`·承·100%·3 | ✓ | 3.0 −0.15；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 五毒神掌 | `mv_chilianshenzhang_wudu` | 9 | `aoe_cone {r:2,angle:60,dirCount:6}` | 1.00 | 9% | 3 | 1000 | `bf_zhongdu`·承·70%·3（2 层） | ✓ | N=4、AF=0.80；0.80 × 1.46 = 1.17，−0.14 = 1.03，取 1.00 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 毒掌 | `ps_chilianshenzhang_duzhang` | 1 | stat · Z3 | +5% → +12% | 对带 `poison` 标签的目标 |
| 赤印 | `ps_chilianshenzhang_chiyin` | 3 | trigger | 30% | 命中已中毒 ≥ 3 层的目标时 30% 追加 `bf_judu` 2 回合（品阶承） |
| 邪心 | `ps_chilianshenzhang_xiexin` | 6 | stat | `attr:crit flat +8` | 自身 `morality ≤ −20` 时 |
| 赤练大成 | `ps_chilianshenzhang_dacheng` | 10 | effect | +1 层 | 本武学施加中毒时每次额外 +1 层（受 06 层数上限） |

#### `sk_jinlingsuo` 金铃索法（7 地下 · 兵器/鞭索 · 古墓）

> **原著**：小龙女所使古墓独门兵刃——白绸带端系金球、球中藏铃，以金球打穴、铃声扰敌；正式名称仍须核对**（待考：《神雕侠侣》小龙女以白绸金球对敌的段落）**。招式名为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阴 · 0.50/0.50 |
| 原生书界 | 神雕 |
| weaponReq | `{category: whip}`；持古墓金铃索 `eq_jinlingsuo`（建议 ID，design/10 定级）时 8 重"铃声示警"生效 |
| reqs | `attrs {agi 45, wis 40}`；`aptitude {apWhip 40}`；`sect {sect_gumu, rank 3}`；`prereq [sk_tianluodiwang ≥ 5]`；`hard [sect, prereq]` |
| layerStats | `{seal [3, 10], hit [1, 5]}`（15） |
| 层数要点 | 1 重金铃点穴、铃音乱心、"打穴"；3 重白练缠腕；4 重"长索制敌"；5 重云袖回风；**7 重绝招金铃摄魄**；8 重灵蛇出洞、"铃声示警"；10 重"金铃大成" |
| 获取 | `master`：小龙女（古墓L3），maxLayer 10；杨过羁绊转授，maxLayer 8 |
| setTags · conflicts | `[set_gumu_yunv]`；无 |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 金铃点穴 | `mv_jinlingsuo_dianxue` | 1 | `aoe_single` · 1–2 | 0.90 | 7% | 0 | 1000 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)`·承·25%·1 | ✓ | 1 −0.05（射程 2 折算，本文约定）−0.05 = 0.90 |
| 铃音乱心 | `mv_jinlingsuo_lingyin` | 1 | `aoe_single` · 1–3（`ranged`） | 1.00 | 7% | 2 | 1000 | `bf_luanxin`·承·40%·2 | ✓ | 1.24 × 0.85 = 1.05，−0.06 = 0.99 |
| 白练缠腕 | `mv_jinlingsuo_chanwan` | 3 | `aoe_single` · 1–2 | 1.10 | 8% | 2 | 1000 | `bf_shouqin(level:4,holdRange:1)`·承·50%·2；`bf_jiaoxie`·承·20% | ✓ | 1.29 −0.05（射程）−0.10 −0.05 = 1.09 |
| 云袖回风 | `mv_jinlingsuo_huifeng` | 5 | `aoe_cone {angle:120,r:1,dirCount:6}` | 0.90 | 7% | 1 | 1000 | 击退 1 | ✓ | N=3、AF=0.85；0.85 × 1.12 = 0.95，−0.05 = 0.90 |
| 金铃摄魄（绝招） | `mv_jinlingsuo_shepo` | 7 | `aoe_chain n3` · 1–2 | 2.25 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)`·承·60%·1（每跳） | ✓ | 3.0 × 0.80 = 2.40，−0.12 = 2.28；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 灵蛇出洞 | `mv_jinlingsuo_lingshe` | 8 | `aoe_pull n2` · 1–3 | 1.00 | 8% | 1 | 1000 | — | ✓ | 0.95 × 1.17 = 1.11，−0.10 = 1.01 |

- **AR-17 审计**：`mv_jinlingsuo_lingyin` 是实体金铃发声扰心，卡内未给出“深厚内力主动驱动并控制音波”的事实，故按 21 §4.4.1 条件式口径不标外放；其余远距伤害来自金球、白绸等实体兵器，也不标。

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 打穴 | `ps_jinlingsuo_daxue` | 1 | trigger | 8% → 20% | 本武学命中时施加 `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 1 回合 |
| 长索制敌 | `ps_jinlingsuo_changsuo` | 4 | stat · Z3 | +8% | 对距离恰为 2 的目标 |
| 铃声示警（原创扩展） | `ps_jinlingsuo_lingsheng` | 8 | mechanic | — | 持金铃索时自身不被背击（背击按侧击计，Z7） |
| 金铃大成 | `ps_jinlingsuo_dacheng` | 10 | effect | +1 回合 | 本武学施加的 `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 持续 +1（上限 2 回合，06 §11.1 红线 3） |

#### `sk_bingpoyinzhen` 冰魄银针（7 地下 · 暗器 · 古墓·李莫愁一系）

> **原著**：李莫愁独门暗器，针上淬有剧毒，杨过幼时曾误触此针中毒；解药与中针细节仍须核对**（待考：《神雕侠侣》开篇杨过遇李莫愁、冰魄银针中毒与解毒的段落）**。招式名为原创扩展。
> **暗器预算约定（本文，§11 D-3）**：暗器招式为 `projectile`（×0.92）且不可招架（×0.85，只能闪避或以破箭 / 听风辨器应对），弹药成本不计入倍率（归 design/10 §8）。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阴 · 0.70/0.30 |
| 原生书界 | 神雕 |
| 弹药 | 冰魄银针 `it_bingpoyinzhen`（建议 ID，design/10）；每次施放耗 1 份（多段计 1 份） |
| reqs | `attrs {agi 40, wis 40}`；`aptitude {apHidden 40}`；`morality {max −20}`（软）；`prereq [sk_wudumichuan ≥ 3]`；`hard [prereq]` |
| layerStats | `{effHit [2, 10], hit [1, 5]}`（15） |
| 层数要点 | 1 重单针、"淬毒"；2 重三针连发；4 重冰魄漫天；5 重"冰魄"；**7 重绝招冰魄摄魂**；8 重"独门解药"；10 重"冰魄大成" |
| 获取 | ① `master`：李莫愁（邪路线，同赤练神掌），maxLayer 10；② `manual`：五毒秘传附录 `it_miji_bingpoyinzhen`（原创扩展），maxLayer 8；③ `observe`，maxLayer 6 |
| setTags · conflicts | `[]`；无 |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 单针 | `mv_bingpoyinzhen_danzhen` | 1 | `aoe_bolt` · 1–5 | 0.75 | 7% | 0 | 1000 | `bf_judu`·承·30%·3 | ✗ | 0.92 × 0.85 = 0.78，−0.045 = 0.74 |
| 三针连发 | `mv_bingpoyinzhen_sanzhen` | 2 | `aoe_multi n3 r1` · 1–4 | 0.75 | 8% | 1 | 1000 | `bf_judu`·承·20%·3（每段） | ✗ | 0.85 × 1.17 × 0.78 = 0.78，−0.03 = 0.75 |
| 冰魄漫天 | `mv_bingpoyinzhen_mantian` | 4 | `aoe_cone {r:3,angle:60,dirCount:6}` | 0.75 | 9% | 3 | 1000 | `bf_hanqi`·承·50%·3 | ✗ | N=7、AF=0.70；0.70 × 1.46 × 0.78 = 0.80，−0.05 = 0.75 |
| 冰魄摄魂（绝招，原创扩展命名） | `mv_bingpoyinzhen_shehun` | 7 | `aoe_bolt` · 1–5 | 2.00 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_judu`·承·100%·3；`bf_hanqi`·承·100%·3（7 层） | ✗ | 3.0 × 0.78 = 2.35，−0.15 −0.20 = 2.00；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 淬毒 | `ps_bingpoyinzhen_cuidu` | 1 | stat · Z3 | +5% → +12% | 对已中 `bf_judu` 的目标 |
| 冰魄 | `ps_bingpoyinzhen_hanpo` | 5 | trigger | 30% | 命中时附加 `bf_hanqi` 1 层（品阶承） |
| 独门解药 | `ps_bingpoyinzhen_jieyao` | 8 | mechanic | 每战 2 次 | 可以行动为相邻友方驱散 1 个 `poison` 减益（`antidote` 等效，品阶承）；解药归属**（待考：《神雕侠侣》冰魄银针中毒与解毒段落）** |
| 冰魄大成 | `ps_bingpoyinzhen_dacheng` | 10 | stat · cost | −15% | 本武学耗内 −15% |

#### `sk_gumuqinggong` 古墓轻功（9 地上 · 轻功 · 古墓）

> **原著扩展**：古墓一派以轻功见长，小龙女、杨过、李莫愁皆身法绝伦；是否有“天下第一”之类定评仍须核对**（待考：《神雕侠侣》三人施展轻功及旁白评价的段落）**。入门由捕雀而来（见 `sk_buquegong`）。按 05 §14.6 #7，神雕本书界最高原生轻功为地上，本功即其一。招式为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阴 · 0.80/0.20 |
| 原生书界 | 神雕、倚天★（黄衫女子） |
| 轻功数值 | `Q_skill = QS(9) = 120`（10 重），按 03 §4.5 |
| reqs | `attrs {agi 50, wis 40}`；`aptitude {apLight 45}`；`sect {sect_gumu, rank 3}`；`prereq [sk_buquegong ≥ 6]`；`hard [sect, prereq]` |
| 层数要点 | 1 重绝迹、"身轻"；3 重踏壁；4 重"暗室"；5 重游身；**7 重捕雀分影（第一绝招）**；8 重"踏雪无痕"；**9 重游身分影（第二绝招）**；10 重"身轻如絮" |
| 获取 | `master`：小龙女 / 孙婆婆（古墓L3），maxLayer 10；倚天★黄衫女子（羁绊 ≥ 4，占位 `q_04_bond_85`），maxLayer 8 |
| setTags · conflicts | `[set_gumu_yunv]`；无 |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 绝迹（原创扩展命名） | `mv_gumuqinggong_jueji` | 1 | `aoe_self` | 0 | 5% | 2 | 800 | 本次行动移动力 +2；`bf_piaohu`·承·100%·2 | — |
| 踏壁（原创扩展命名） | `mv_gumuqinggong_tabi` | 3 | `aoe_self` | 0 | 5% | 2 | 800 | 本次移动可沿墙壁 / 崖壁直上 ≤ `jump + 2` 级（08） | — |
| 游身分影（绝招；提升既有招式，原创扩展命名） | `mv_gumuqinggong_youshen` | 9 | `aoe_self` | 0 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_youshi`·承·100%·3；本次行动移动力 +2，移动后仍可出招 | —；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 捕雀分影（绝招，原创扩展命名） | `mv_gumuqinggong_fenying` | 7 | `aoe_self` | 0 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_canying`·承·100%（7 层）；本次行动移动力 +3，移动后仍可出招 | —；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 身轻 | `ps_gumuqinggong_shenqing` | 1 | stat · 属性层 | `attr:eva pct +4% → +10%`、`attr:spd pct +2% → +6%` | |
| 暗室 | `ps_gumuqinggong_anshi` | 4 | stat · 属性层 | `attr:eva pct +10%` | 夜间、室内或昏暗地形中（光照归 08/11；古墓无光处修成，原创扩展） |
| 踏雪无痕 | `ps_gumuqinggong_taxue` | 8 | mechanic | — | 雪/沙/冰/沼不减速、不留痕、不触发陷阱（等同基准 §11 qg4 的地形能力，不改变 `qinggong` 值） |
| 身轻如絮 | `ps_gumuqinggong_dacheng` | 10 | trigger | ×1/战 | 战斗开始获得 `bf_canying` 1 层 |

### 3.5 玄阶 · 黄阶（紧凑表）

**`sk_gumuxinfa` 古墓心法**（3 黄上 · 内功 · 阴 · 原著扩展）
- `nature: yin`。
- 原著：古墓本门内功，小龙女授杨过并令其睡寒玉床修习；助功原文仍须核对**（待考：《神雕侠侣》杨过初入古墓、睡寒玉床练功的段落）**。
- 内功贡献：`mpMaxPct 10, hpMaxPct 5, attrs {agi 2, wil 2}, mpRegen 1.4`（IP 30）；`stats {resHeat 3, resMind 3}`；无招式。
- reqs：`sect {sect_gumu, rank 1}`；`hard [sect]`。获取：拜师小龙女 / 孙婆婆；倚天★黄衫女子（maxLayer 8）。
- 被动：`ps_gumuxinfa_qingxin` 清心寡欲（1 重，`attr:resMind pp +2 → +5`）；`ps_gumuxinfa_hanyuchuang` 寒玉床（4 重，于古墓寒玉床闭关时古墓武学修炼 ×1.3）；`ps_gumuxinfa_yuanman` 圆满（10 重，玉女心经软门槛 −10）。

**`sk_hanyuxinjue` 寒玉心诀**（6 玄上 · 内功 · 阴 · 原创扩展）
- `nature: yin`。
- 依据：寒玉床为古墓至宝（原著）；本作以"寒玉心诀"作借寒玉床修炼的中阶心法，填补古墓玄阶内功（原创扩展）。
- 内功贡献：`mpMaxPct 20, hpMaxPct 10, attrs {wil 4, agi 3, con 1}, mpRegen 2.2`（IP 57）；`stats {resHeat 5, resInjury 5}`。
- reqs：`attrs {wil 30}`；`aptitude {apInner 30}`；`sect {sect_gumu, rank 2}`；`prereq [sk_gumuxinfa ≥ 5]`；`hard [sect, prereq]`。获取：拜师；寒玉床闭关顿悟（占位 `q_03_qiyu_81`，maxLayer 8）。
- `setTags: [set_gumu_yunv]`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 寒玉真气（绝招；提升既有招式，原创扩展命名） | `mv_hanyuxinjue_hanqi` | 7 | `aoe_self` | 0 | 8% | — | 1200 | `ultimate:true`；气势 100；`bf_hutizhenqi`·承·100%·3（护体 = hpMax 18%）；驱散自身全部 `heat` 减益 | —；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- 被动：`ps_hanyuxinjue_hanyu` 寒玉（1 重，`attr:resHeat pp +3 → +8`）；`ps_hanyuxinjue_bingji` 冰肌（5 重，自身所受 `bf_zhuoshao` 持续 −1）；`ps_hanyuxinjue_jingxin` 静心（8 重，闭关心魔概率 −50%）；`ps_hanyuxinjue_dacheng` 寒玉大成（10 重，玉女心经修炼 +15%）。

**`sk_tianluodiwang` 天罗地网势**（2 黄中 · 拳脚/拳掌 · 阴 · 0.70/0.30 · 原著）
- 原著：古墓入门掌法，小龙女令杨过在大厅中以掌力拦截群雀、使之飞不出掌圈；雀数仍须核对**（待考：《神雕侠侣》杨过在古墓大厅练天罗地网势的段落）**。06 §8.7 定身之典型来源。
- reqs：`sect {sect_gumu, rank 1}`；`hard [sect]`。layerStats `{hit [1, 3], parry [1, 3]}`。获取：拜师；倚天★黄衫女子。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 罗网 | `mv_tianluodiwang_luowang` | 1 | `aoe_single` · 1 | 0.95 | 5% | 0 | 1000 | `bf_dingshen`·承·20%·1 | ✓ |
| 天罗 | `mv_tianluodiwang_tianluo` | 4 | `aoe_around` | 0.80 | 6% | 2 | 1000 | `bf_dingshen`·承·15%·1 | ✓ |
| 地网 | `mv_tianluodiwang_diwang` | 7 | `aoe_self`（架势） | 0 | 5% | 3 | 900 | `bf_jieji`·承·100%·2（截击） | — |

- 核算：罗网 1 − 0.05；天罗 0.65 × 1.29 = 0.84，−0.04。被动：`ps_tianluodiwang_buque` 捕雀（5 重，相邻敌人离开相邻格时 15% 获得 `bf_dingshen` 1 回合）；`ps_tianluodiwang_yuanman` 圆满（10 重，美女拳法、金铃索法软门槛 −10）。

**`sk_meinvquan` 美女拳法**（4 玄下 · 拳脚/拳掌 · 阴 · 0.70/0.30 · 原著）
- 原著：林朝英所创，每招摹拟一位古代美女情态；“绿珠坠楼”“文姬归汉”“丽华梳妆”“萍姬针神”“曹令割鼻”“则天垂帘”“红拂夜奔”等名的字形、全表与总数仍须核对**（待考：《神雕侠侣》小龙女传杨过美女拳法及杨过施展的段落）**。招式效果为原创扩展。
- reqs：`attrs {agi 25}`；`aptitude {apFist 25}`；`sect {sect_gumu, rank 2}`；`prereq [sk_tianluodiwang ≥ 4]`；`hard [sect]`。layerStats `{eva [1, 5], hit [1, 5]}`。获取：拜师；倚天★黄衫女子。
- `setTags: [set_gumu_yunv]`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 貂蝉拜月 | `mv_meinvquan_diaochan` | 1 | `aoe_single` · 1 | 0.95 | 6% | 0 | 1000 | `bf_mihuo`·承·10%·1 | ✓ |
| 西施捧心 | `mv_meinvquan_xishi` | 1 | `aoe_self`（架势） | 0 | 5% | 2 | 850 | `bf_xieli`·承·100%·1；被近战攻击以 0.9 倍反击 | — |
| 昭君出塞 | `mv_meinvquan_zhaojun` | 3 | `aoe_dash n3` · 1–3 | 1.00 | 6% | 1 | 1000 | — | ✓ |
| 木兰弯弓 | `mv_meinvquan_mulan` | 5 | `aoe_single` · 1–3（`ranged`） | 1.00 | 7% | 1 | 1000 | — | ✓ |
| 红玉击鼓 | `mv_meinvquan_hongyu` | 7 | `aoe_single` · 1（3 段） | 1.30 | 7% | 2 | 1000 | — | ✓ |

- **AR-16 审计**：`mv_meinvquan_mulan` 仅以“弯弓”姿态命名并给出远程几何，未说明离体掌力，暂记待考；其余为接触拳掌、位移或架势。

- 核算：貂蝉拜月 1 − 0.025；昭君出塞 1.12 − 0.10；木兰弯弓 1.17 × 0.85 = 0.99；红玉击鼓 1 + 0.24 + 0.05。被动：`ps_meinvquan_enuo` 婀娜（4 重，`attr:eva pct +2% → +5%`）；`ps_meinvquan_qingcheng` 倾城（8 重，本武学附带心神类效果的效果命中 +5%）；`ps_meinvquan_dacheng` 大成（10 重，本武学耗内 −10%）。

**`sk_hantanjian` 寒潭剑法**（3 黄上 · 兵器/剑 · 阴 · 0.70/0.30 · 原创扩展）
- 依据：古墓地下暗河寒潭通往墓外，杨过、小龙女曾由此出墓；路线细节仍须核对**（待考：《神雕侠侣》杨过、小龙女经古墓水道离开的段落）**。作古墓入门剑法与玉女剑法前置。
- reqs：`sect {sect_gumu, rank 1}`；`hard [sect]`。layerStats `{hit [1, 3], parry [1, 3]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 寒光 | `mv_hantanjian_hanguang` | 1 | `aoe_single` · 1 | 1.00 | 5% | 0 | 1000 | — | ✓ |
| 潜流 | `mv_hantanjian_qianliu` | 4 | `aoe_behind r2` | 0.85 | 5% | 1 | 1000 | 绕至目标身后出招（背击 Z7） | ✓ |
| 凝冰 | `mv_hantanjian_ningbing` | 7 | `aoe_single` · 1 | 1.10 | 6% | 1 | 1000 | `bf_hanqi`·承·60%·3 | ✓ |

- 核算：潜流 0.90 × 1.12 = 1.01，−0.15；凝冰 1.17 − 0.06。被动：`ps_hantanjian_lengfeng` 冷锋（5 重，对带 `cold` 标签目标 Z3 +6%）；`ps_hantanjian_yuanman` 圆满（10 重，玉女剑法软门槛 −10）。

**`sk_yunvjian` 玉女剑法**（6 玄上 · 兵器/剑 · 阴 · 0.60/0.40 · 原著）
- 原著：林朝英所创，招招克制全真剑法；与全真剑法二人分使、心意相通时合为玉女素心剑法（神雕）。本剑法原著招名表仍须核对**（待考：《神雕侠侣》杨过、小龙女研习玉女剑法及双剑合璧的段落）**；下列招名为原创扩展。
- reqs：`attrs {agi 30}`；`aptitude {apSword 30}`；`sect {sect_gumu, rank 2}`；`prereq [sk_hantanjian ≥ 4]`；`hard [sect]`。layerStats `{eva [1, 5], hit [1, 5]}`。获取：拜师；古墓石室 `puzzle`（maxLayer 8）；倚天★黄衫女子（maxLayer 8）。`setTags: [set_gumu_yunv, set_shendiao_xialv]`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 素手摘星 | `mv_yunvjian_zhaixing` | 1 | `aoe_single` · 1 | 1.00 | 6% | 0 | 1000 | — | ✓ |
| 冷月窥人 | `mv_yunvjian_lengyue` | 2 | `aoe_single` · 1–2（`ranged` 剑气） | 1.00 | 7% | 1 | 1000 | — | ✓ |
| 素衣回风 | `mv_yunvjian_huifeng` | 4 | `aoe_cone {angle:120,r:1,dirCount:6}` | 1.00 | 7% | 1 | 1000 | — | ✓ |
| 破玄式 | `mv_yunvjian_poxuan` | 6 | `aoe_single` · 1 | 1.30 | 7% | 1 | 1000 | 条件：目标主运或所用招式属全真 | ✓ |
| 玉女投梭（绝招，典出谢鲲邻女投梭） | `mv_yunvjian_tousuo` | 7 | `aoe_single` · 1 | 3.00 | 8% | — | 1200 | `ultimate:true`；气势 100 | ✓；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- **核算补记**：破玄式 `1.00×(1+0.12+0.05+0.15)=1.32≈1.30`（冷却、额外耗内、常见条件），先合并条件加成再乘基础 AF；其余招式沿用本节既有预算。
- **AR-16 外放字段**：`mv_yunvjian_lengyue` 明确以剑气离体伤敌，`MoveDef{projection:true; range:{min:1,max:2}; aoe:{tpl:aoe_single}; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; meridianRouteRef:mfr_yunvjian_lengyue}`；全部伤害段 `DamageKind='projected'`。路线按阴性普通攻击 `AT-I6` 展开，命中内关／劳宫／中冲端点。其余均为近身剑招，不标。

- 核算：冷月窥人 `1.00×(1+0.12+0.05)×0.85=0.9945≈0.99`；素衣回风以 N=3、AF=0.85 计，`0.85×(1+0.12+0.05)=0.9945≈1.00`；破玄式 `1.00×(1+0.12+0.05+0.15)=1.32`。被动：`ps_yunvjian_kequanzhen` 克全真（2 重，对使用全真武学的目标 Z5 +4% → +10%，与玉女心经同类被动取高）；`ps_yunvjian_qingling` 轻灵（5 重，`attr:eva pct +3%`）；`ps_yunvjian_suxin` 素心前篇（8 重，与装配全真剑法的羁绊队友相距 ≤ 2 时双方 `attr:hit flat +5`）；`ps_yunvjian_dacheng` 大成（10 重，本武学 Z3 +6%）。

**`sk_sanwusanbushou` 三无三不手**（6 玄上 · 兵器/鞭索（拂尘）· 阴 · 0.55/0.45 · 原著）
- 原著：李莫愁以拂尘使出的狠辣绝招，共三招：无孔不入、无所不至、无所不为；"三无三不"就是这三招的合称，并不存在另一组三个"三不"招名。拂尘按软兵归 `whip`（建议 `design/10` 将拂尘列为鞭索细项）。
- reqs：`aptitude {apWhip 30}`；`morality {max −20}`（软）；`hard []`。layerStats `{effHit [2, 6], hit [1, 4]}`。获取：李莫愁投师（邪）；观摩（maxLayer 6）。`setTags: []`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 无孔不入 | `mv_sanwusanbushou_wukong` | 1 | `aoe_single` · 1 | 0.95 | 6% | 0 | 1000 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)`·承·20%·1 | ✓ |
| 无所不至 | `mv_sanwusanbushou_wusuo` | 3 | `aoe_chain n2` · 1–2 | 1.00 | 7% | 2 | 1000 | — | ✓ |
| 无所不为 | `mv_sanwusanbushou_wusuowei` | 5 | `aoe_single` · 1 | 1.10 | 7% | 2 | 1000 | `bf_zhongdu`·承·60%·3（2 层）；`bf_shouqin(level:4,holdRange:1)`·承·30%·2 | ✓ |
| 三无俱发（绝招；原创扩展命名） | `mv_sanwusanbushou_sanbu` | 7 | `aoe_single` · 1 | 2.90 | 8% | — | 1200 | `ultimate:true`；气势 100；`bf_judu`·承·50%·3 | ✓；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- 核算：无孔不入 1 − 0.04；无所不至 0.80 × 1.29 = 1.03，−0.05（射程）；无所不为 1.29 − 0.12 − 0.06；三无俱发 3.0 − 0.075。被动：`ps_sanwusanbushou_fuchen` 拂尘卷（1 重，命中时 10% → 20% 施加 `bf_shouqin(level:4,holdRange:1)` 1 回合）；`ps_sanwusanbushou_duchen` 毒尘（5 重，对中毒目标 Z3 +6%）；`ps_sanwusanbushou_dacheng` 大成（10 重，`attr:effHit pct +5%`）。

**`sk_buquegong` 捕雀功**（3 黄上 · 轻功 · 阴 · 原著扩展）
- 原著：小龙女令杨过在古墓大厅中捕捉麻雀以练身法（神雕）。`Q_skill = QS(3) = 45` 满层。
- reqs：`sect {sect_gumu, rank 1}`；`hard [sect]`。获取：拜师。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 捕雀 | `mv_buquegong_buque` | 1 | `aoe_self` | 0 | 4% | 3 | 800 | `bf_piaohu`·承·100%·2；本次行动移动力 +1 | — |

- 被动：`ps_buquegong_lingqiao` 灵巧（4 重，`attr:eva pct +2% → +5%`）；`ps_buquegong_yuanman` 圆满（10 重，古墓轻功软门槛 −10）。

**`sk_yufengzhen` 玉蜂针**（5 玄中 · 暗器 · 阴 · 0.70/0.30 · 原著）
- 原著：以古墓玉蜂尾针炼成的暗器，中者麻痒难当，解药与玉蜂相关；具体解毒方式仍须核对**（待考：《神雕侠侣》玉蜂针中毒及解毒段落）**。06 §8.7 以其为麻痹典型来源。弹药 `it_yufengzhen`（建议 ID）。预算按 §3.4 暗器约定（×0.92×0.85）。
- reqs：`aptitude {apHidden 25}`；`sect {sect_gumu, rank 2}`；`hard [sect]`。layerStats `{hit [1, 5], effHit [1, 5]}`。`setTags: [set_gumu_yunv]`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 蜂针 | `mv_yufengzhen_fengzhen` | 1 | `aoe_bolt` · 1–5 | 0.75 | 6% | 0 | 1000 | `bf_mabi`·承·20%·2 | ✗ |
| 群蜂 | `mv_yufengzhen_qunfeng` | 3 | `aoe_disk {r:1}`（中心点＋六邻格）· 1–4 | 0.65 | 7% | 2 | 1000 | `bf_zhongdu`·承·30%·3 | ✗ |
| 麻痒难当 | `mv_yufengzhen_mayang` | 5 | `aoe_bolt` · 1–4 | 0.90 | 7% | 2 | 1000 | `bf_mabi`·承·60%·2 | ✗ |

- 核算：蜂针 0.78 − 0.04；群蜂 0.70 × 1.29 × 0.92 × 0.85 − 0.10 × 30% = 0.676，取 0.65；麻痒难当 1.29 × 0.78 = 1.01，−0.12。被动：`ps_yufengzhen_fengdu` 蜂毒（1 重，命中时 15% → 30% 附加 `bf_zhongdu` 1 层）；`ps_yufengzhen_fengjiang` 蜂浆解药（5 重，可以行动为相邻友方驱散 1 个 `bf_mabi` 或 `poison` 减益，`antidote` 等效、品阶承）；`ps_yufengzhen_dacheng` 大成（10 重，本武学耗内 −10%）。

**`sk_yufengshu` 驭蜂术**（6 玄上 · 杂学/驭兽 · 阴 · 原著扩展）
- 原著：小龙女以玉蜂浆与手势驱使玉蜂，周伯通后亦学得（神雕；"驭蜂术"之名为原创扩展）。强度用魅力 `cha`（05 §2.3 驭兽）。
- reqs：`attrs {cha 30, wis 25}`；`sect {sect_gumu, rank 2}`；`hard [sect]`。获取：小龙女传授；周伯通 `npc_zhoubotong` 转授（羁绊 ≥ 3，`reqsOverride {sect: null}`，maxLayer 8）。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 玉蜂群（绝招；提升既有招式） | `mv_yufengshu_fengqun` | 7 | `aoe_zone {inner:{tpl:aoe_disk,r:1},duration:3}`（目标点＋六邻格）· 1–4 | 0.55/跳 | 8% | — | 1200 | `ultimate:true`；气势 100；每跳 `bf_zhongdu`·承·50%·3；遇火（灼烧 / 火把 / 火场地形）蜂群即散 | ✗；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| 蜂阵护主 | `mv_yufengshu_fengzhen` | 4 | `aoe_zone {inner:{tpl:aoe_disk,r:1},duration:2}`（自身＋六邻格） | 0.25/跳 | 7% | 4 | 1000 | 区内敌方每跳 `bf_mabi`·承·15%·2 | ✗ |
| 蜂语 | `mv_yufengshu_fengyu` | 7 | `aoe_self` | 0 | 5% | 5 | 800 | `bf_tingfeng`·承·100%·3（可选中隐身者）；探索中侦察 6 格内伏兵与陷阱 | — |

- 核算：两招的 `aoe_zone` 内层均为 `aoe_disk {r:1}`，N=7、几何 AF=0.70；其持续地表伤害与控制按 09 §5.3.3 单独审查，0.25/跳是持续伤害折算值，不把 0.70 重复作为每跳 `power`。被动：`ps_yufengshu_niangjiang` 酿浆（1 重，战斗外每日产出玉蜂浆 `it_yufengjiang` 1 份，回内与解麻痒，design/10）；`ps_yufengshu_fengzhong` 蜂众（5 重，蜂群区域持续 +1）；`ps_yufengshu_dacheng` 大成（10 重，蜂群每跳另附 `bf_mabi` 10%）。

**`sk_wudumichuan` 五毒秘传**（6 玄上 · 杂学/毒 · 阴 · 原著书名，机制原创扩展）
- 原著：陆无双持有并称《五毒秘传》为师父之书；其如何从李莫愁所藏书物中取得、杨过翻阅到哪些内容，仍须按基线版本逐字核对**（待考：《神雕侠侣》陆无双携书、杨过翻阅相关情节）**。本文不再把它写成古墓藏书，也不设孙婆婆口授。强度使用毒术技艺 `poi`（05 §2.3），但原稿没有给出学习数值，依 C17 不臆补 `skills.poi` 门槛。兵器持久淬毒只引用 `design/10` §6.5 `poisonCoat`；战内毒伤复用 `bf_zhongdu` / `bf_judu`，不创建 `bf_cuidu`。
- reqs：`attrs {wis 30}`；`hard []`。获取：① 陆无双携书支线中研读或由陆无双转授（占位 `q_03_faction_80`，原创扩展流程），maxLayer 8；② 李莫愁邪线传授（原创扩展），maxLayer 10。`setTags: []`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 淬毒 | `mv_wudumichuan_cuidu` | 1 | `aoe_self` | 0 | 5% | 4 | 900 | `bf_jingzhun`·承·100%·3（效果命中 +，配合被动"毒刃"） | — |
| 毒雾 | `mv_wudumichuan_duwu` | 3 | `aoe_zone {inner:{tpl:aoe_disk,r:1},duration:2}`（目标点＋六邻格）· 1–3 | 0.25/跳 | 7% | 4 | 1000 | 每跳 `bf_zhongdu`·承·40%·3；`friendlyFire: all`（05 §4.6 毒雾敌我皆中） | ✗ |
| 解毒（绝招；提升既有招式） | `mv_wudumichuan_jiedu` | 7 | `aoe_allies r2` | 0 | 8% | — | 1200 | `ultimate:true`；气势 100；友方驱散全部 `poison` 减益（`antidote` 等效，品阶承） | —；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- 核算：毒雾的 `aoe_zone` 内层为 `aoe_disk {r:1}`，N=7、几何 AF=0.70；持续地表伤害与控制按 09 §5.3.3 单独审查，0.25/跳为持续伤害折算。被动：`ps_wudumichuan_duren` 毒刃（1 重，装配时本方兵器 / 暗器招式命中 10% → 20% 附加 `bf_zhongdu` 1 层）；`ps_wudumichuan_shidu` 识毒（4 重，`attr:resPoison pp +5 → +10`）；`ps_wudumichuan_baidu` 百毒谱（8 重，本方施加的中毒持续 +1）；`ps_wudumichuan_dacheng` 大成（10 重，赤练神掌、冰魄银针修炼 +20%）。

#### 3.5.1 AR-01 新增玄阶紧凑卡（5 门）

> 下列均为 **（原创扩展）**，`origin: expanded`、`sect: sect_gumu`、`sourceChapters:[ch03_shendiao]`，未另列时 `setTags:[]`、`conflicts:[]`。古墓采用 `design/17` §7.3 的小规模 T04 变体：L1 侍女/外客、L2 入室、L3 亲传、L4 守墓人、L5 掌门。

**`sk_hanyujinggong` 寒玉静功**（5 玄中 · 内功/心法 · `nature: yin` · 0/1）
- 字段：`reqs {attrs {wil:25,agi:22}, aptitude {apInner:25}, sect {id:sect_gumu,rank:2}, prereq [{skill:sk_gumudaoyin,layer:5}], hard:[sect,prereq]}`；`inner.contribution {mpMaxPct:17,hpMaxPct:10,attrs:{con:2,agi:2,wil:3},mpRegen:1.5}`，IP `17+10+2×7+5×1.5=48.5`；`stats {resHeat:5,resMind:5}`；`meridians:[mer_zushaoyin,mer_yinqiao]`；`yunjin:[tiaoxi,huti]`。
- 招式：寒玉静息 `mv_hanyujinggong_jingxi`（1 重，自身，6%/cd3/900，`bf_shouyi`·承·2）；冰心护脉 `mv_hanyujinggong_humai`（5 重，自身，7%/cd4/900，`bf_hutizhenqi`·承·2，护盾 hpMax 10%）。被动：寒室 `ps_hanyujinggong_hanshi`（室内/寒地回内 +0.2→0.5pp）；静守 `ps_hanyujinggong_jingshou`（心神减益持续 −1，最低 1）；圆满 `ps_hanyujinggong_yuanman`（寒玉心诀修炼 +10%）。获取：寒玉床闭关或 L2 入室。

**`sk_yunvsanshou` 玉女散手**（5 玄中 · 拳脚/拳掌 · `nature: yin` · 0.60/0.40）【玄阶预算抽样】
- 字段：`reqs {attrs {agi:25}, aptitude {apFist:25}, sect {id:sect_gumu,rank:2}, prereq [{skill:sk_tianluodiwang,layer:5}], hard:[sect,prereq]}`；`layerStats {eva:[2,5],hit:[2,5]}`（10）；`moveSlots:3`。
- 招式：拂花 `mv_yunvsanshou_fuhua`（1 重，单体，1.00，6%/cd0/1000，可招架）；回袖 `mv_yunvsanshou_huixiu`（3 重，`aoe_ring r1`，0.95，6%/cd2/1000，可招架）；穿隙 `mv_yunvsanshou_chuanxi`（6 重，单体，1.20，6%/cd2/1000，30% `bf_jiansu`·承·2，可招架）。核算：`1.00`；`0.75×1.24=0.93≈0.95`；`1×1.24−0.10×30%=1.21≈1.20`。
- 被动：柔手 `ps_yunvsanshou_roushou`（闪避后下一掌 Z3 +4%→10%）；罗网余势 `ps_yunvsanshou_luowang`（对减速目标命中 +3→8）；大成 `ps_yunvsanshou_dacheng`（10 重，招架后可后退 1 格，每回合 1 次）。获取：L2 入室；`observable:true`，观摩上限 6 重。

**`sk_muzhongyixing` 墓中移形**（4 玄下 · 轻功 · `nature: yin` · 0.80/0.20）
- 字段：`reqs {attrs {agi:22}, aptitude {apLight:20}, sect {id:sect_gumu,rank:2}, prereq [{skill:sk_muzhongbu,layer:5}], hard:[sect,prereq]}`；`layerStats {eva:[2,5],spd:[1,2]}`（7）；满层 `Q_skill=QS(4)=56`。招式：暗廊移形 `mv_muzhongyixing_yixing`（1 重，自身，5%/cd2/800，移动 2 格）；回身 `mv_muzhongyixing_huishen`（4 重，自身，5%/cd3/800，`bf_piaohu`·承·2）；穿门 `mv_muzhongyixing_chuanmen`（7 重，自身，6%/cd4/800，本次移动无视 1 格敌方控制区）。被动：暗室 `ps_muzhongyixing_anshi`（室内闪避 +3%→8%）；无声 `ps_muzhongyixing_wusheng`（移动不触发首个截击，每回合 1 次）。获取：墓道试炼；`observable:true`，观摩上限 5 重。

**`sk_baichousuofa` 白绸索法**（6 玄上 · 兵器/鞭索 · `nature: yin` · 0.55/0.45）
- 字段：`reqs {attrs {agi:30}, aptitude {apWhip:30}, sect {id:sect_gumu,rank:3}, prereq [{skill:sk_baichouroujin,layer:5}], hard:[sect,prereq]}`；`layerStats {hit:[2,6],parry:[1,4]}`（10）；`weaponReq:{category:whip,tags:[cloth]}`。招式：白绸拂穴 `mv_baichousuofa_fuxue`（1 重，1–2 格，0.95，6%/cd0/1000，20% `bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)`·承·2）；回环 `mv_baichousuofa_huihuan`（4 重，`aoe_around`，0.95，6%/cd2/1000）；卷腕 `mv_baichousuofa_juanwan`（7 重绝招，1–2 格，2.70，8%/无冷却/1200，`ultimate:true`、气势 100、100% `bf_shouqin(level:4,holdRange:1)`·承·2）。绝招核算 `3.00−0.20−0.10（射程）=2.70`；仅卷腕为绝招，前两式 `ultimate:false`。被动：柔韧 `ps_baichousuofa_rouren`（招架 +3%→8%）；借势 `ps_baichousuofa_jieshi`（缠绕目标对本武学 Z3 +5%→12%）；大成 `ps_baichousuofa_dacheng`（10 重，射程 2 招式命中 +8）。获取：L3 亲传；`observable:true`，上限 6 重。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

**`sk_yufengyin` 玉蜂引**（6 玄上 · 杂学/驭兽 · `nature: yin` · 0.45/0.55）
- 字段：`reqs {attrs {cha:30,wis:28}, sect {id:sect_gumu,rank:3}, prereq [{skill:sk_yufengshao,layer:5}], hard:[sect,prereq]}`；`layerStats {effHit:[2,6],eva:[1,4]}`（10）。招式：引蜂 `mv_yufengyin_yinfeng`（1 重，目标点 1–4 格，6%/cd2/1000，目标获 `bf_suoding`·承·2）；蜂路 `mv_yufengyin_fenglu`（4 重，自身，6%/cd3/800，`bf_jisu`·承·2）；群蜂护主 `mv_yufengyin_huzhu`（7 重绝招，自身，8%/无冷却/1200，`ultimate:true`、气势 100、`bf_yuanhu`·承·3、`bf_ruiyi`·承·2）；仅群蜂护主为绝招，前两式 `ultimate:false`。被动：闻香 `ps_yufengyin_wenxiang`（对中毒目标效果命中 +5→12）；群聚 `ps_yufengyin_qunju`（同装驭蜂术时其区域持续不再叠加，只使施加率 +10pp）；大成 `ps_yufengyin_dacheng`（10 重，战斗开始获 `bf_ruiyi` 2 回合）。获取：L3 且玉蜂哨 5 重；`fusible:false`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

#### 3.5.2 黄阶一行总表（10 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或（原创扩展） |
|---|---|---|---|---|---|---|---|
| `sk_gumuxinfa` | 古墓心法 | 古墓派 L1 | 3 黄上·内功/心法·`nature:yin` | 神雕、倚天★ | IP `10+5+2×4+5×1.4=30`；`mer_zushaoyin` | 无；L1 | 原著泛称，内容扩展 |
| `sk_tianluodiwang` | 天罗地网势 | 古墓派 L1 | 2 黄中·拳脚/拳掌·阴 | 神雕、倚天★ | 单体定身＋周身掌；Y5/Y3 | 无；L1 | 原著 |
| `sk_hantanjian` | 寒潭剑法 | 古墓派 L1 | 3 黄上·兵器/剑·阴 | 神雕 | 单体刺＋绕背＋寒气；Y1/Y4/Y5 | 无；L1 | **（原创扩展）** |
| `sk_buquegong` | 捕雀功 | 古墓派 L1 | 3 黄上·轻功·阴 | 神雕 | 自身 `bf_piaohu`；满层 `QS(3)=45` | 无；L1 | 原著情节扩展 |
| `sk_gumudaoyin` | 古墓导引 | 古墓派 L1 | 2 黄中·内功/心法·`nature:yin` | 神雕 | IP `8+5+2×3+5×1.0=24`；`attrs {con:1,agi:1,wil:1}`；`mer_zushaoyin` | 无；L1 | **（原创扩展）** |
| `sk_gumujichushou` | 古墓基础手 | 古墓派 L1 | 1 黄下·拳脚/擒拿·阴 | 神雕 | 单体拿腕＋30% `bf_jiansu`；Y5 | 无；L1 | **（原创扩展）** |
| `sk_yunvjianji` | 玉女剑基 | 古墓派 L1 | 3 黄上·兵器/剑·阴 | 神雕 | 单体点剑＋线2；Y1/Y2 | 无；L1 | **（原创扩展）** |
| `sk_baichouroujin` | 白绸柔劲 | 古墓派 L1 | 3 黄上·兵器/鞭索·阴 | 神雕 | 单体 1–2 格＋30% `bf_shouqin(level:4,holdRange:1)`；Y5 | 无；L1 | **（原创扩展）** |
| `sk_muzhongbu` | 墓中步 | 古墓派 L1 | 2 黄中·轻功·阴 | 神雕 | 自身 `bf_piaohu`；满层 `QS(2)=38` | 无；L1 | **（原创扩展）** |
| `sk_yufengshao` | 玉蜂哨 | 古墓派 L1 | 3 黄上·杂学/驭兽·阴 | 神雕 | 标记目标 `bf_suoding` 2 回合，供玉蜂类技能追踪 | 无；L1，需玉蜂浆教学 | **（原创扩展）** |

### 3.6 进阶链与门派内搭配

| 链 | 前置关系 |
|---|---|
| 内功（黄 → 玄 → 天） | 古墓导引（黄中）→ 5 重 → 寒玉静功（玄中）→ 寒玉心诀（玄上）；古墓心法（黄上）→ 5 重 → 寒玉心诀；寒玉心诀 3 重或古墓心法 6 重可入玉女心经（天下） |
| 剑（黄 → 玄 → 天） | 玉女剑基 / 寒潭剑法（黄上）→ 玉女剑法（玄上）→ 5 重 → 玉女素心剑法古墓位（天中，§4） |
| 拳脚 / 鞭 | 古墓基础手 / 天罗地网势（黄）→ 玉女散手 / 美女拳法（玄）；白绸柔劲（黄上）→ 白绸索法（玄上）→ 金铃索法（地下） |
| 轻功 / 驭蜂 | 墓中步 / 捕雀功（黄）→ 墓中移形（玄下）→ 古墓轻功（地上）；玉蜂哨（黄上）→ 玉蜂引 / 驭蜂术（玄上） |
| 李莫愁一系（邪，`morality ≤ −20` 软门槛） | 五毒秘传（玄上）→ 3 重 → 赤练神掌 / 冰魄银针（地下）；三无三不手（玄上） |

- **推荐装配（神雕中后期，古墓正宗）**：主运玉女心经＋辅运寒玉心诀、金关玉锁（桥接，便于兼修全真）｜美女拳法、天罗地网势｜玉女剑法、玉女素心剑法（或金铃索法，须换主手鞭索）｜古墓轻功｜玉蜂针｜驭蜂术、五毒秘传。
- **正邪分野**：赤练神掌装配即带 `bf_xielian`，与玉女心经同装不禁止，但正派 NPC 好感受影响（12）；这是"古墓同源、正邪殊途"的数据表达。

---

## 4. 杨过自创与传承、独孤求败剑冢剑意（`sect: null`）

### 4.1 传承简介

- **杨过（神雕）**：杨康之子，先后受学于欧阳锋（蛤蟆功、逆转经脉）、全真（全真武功）、古墓（古墓武学、玉女心经）、洪七公与黄药师（打狗棒法招式、弹指神通、玉箫剑法），又于古墓石室习九阴真经要旨（以上他组武学只引用 ID）。断臂后由神雕引至独孤求败剑冢，得玄铁重剑，在山洪、海潮中练剑而成玄铁剑法；与小龙女合使玉女素心剑法；十六年相思中自创黯然销魂掌；襄阳城下击毙蒙哥（原著）。
- **独孤求败剑冢（神雕）**：剑冢石刻与四柄剑（利剑、已弃之紫薇软剑、玄铁重剑、木剑）下的碑文记独孤求败一生剑道**（待考：《神雕侠侣》杨过入剑冢所见四段石刻原文与次序）**。按基准 §13，独孤九剑本体只在笑傲可学；神雕只得"剑冢剑意"。本作把四段碑文做成四门"剑意"杂学（原创扩展），离开神雕后化为残篇，建议并入同源组 `lg_dugu`，在笑傲加速独孤九剑（§11 D-7）。
- **获取结构**：天级三门受 02 §2.9 R3/R4 约束（神雕第 4 幕后；与古墓系合计至多深入 2 系）。

### 4.2 武学总表（11 门）

| ID | 名称 | 大类/子类 | 品阶 | 内力性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_anran` | 黯然销魂掌 | 拳脚/拳掌 | 11 天中 | 阴 | 0.35/0.65 | 神雕 | 杨过羁绊传授（须经"别离"） | 原著（基准 §13） |
| `sk_xuantie` | 玄铁剑法 | 兵器/剑 | 11 天中 | 中性 | 0.55/0.45 | 神雕 | 剑冢奇遇；山洪、海潮练剑；杨过羁绊 | 原著（基准 §13） |
| `sk_suxin` | 玉女素心剑法 | 兵器/剑（双人合璧） | 11 天中 | 调和 | 0.60/0.40 | 神雕 | 合击领悟；古墓石室心经末章 | 原著（基准 §13；规则见 05 §9.3.1） |
| `sk_lijianyi` | 利剑意 | 杂学/心神 | 6 玄上 | 中性 | 0.50/0.50 | 神雕 | 剑冢第一碑 | 原创扩展（碑文原著） |
| `sk_ruanjianyi` | 软剑意 | 杂学/心神 | 6 玄上 | 中性 | 0.50/0.50 | 神雕 | 剑冢第二碑（紫薇软剑已弃） | 原创扩展（碑文原著） |
| `sk_zhongjianyi` | 重剑意 | 杂学/心神 | 8 地中 | 中性 | 0.60/0.40 | 神雕 | 剑冢第三碑（玄铁重剑处） | 原创扩展（碑文原著） |
| `sk_mujianyi` | 木剑意 | 杂学/心神 | 9 地上 | 中性 | 0.60/0.40 | 神雕 | 剑冢第四碑（木剑处） | 原创扩展（碑文原著） |
| `sk_diaopubu` | 雕步 | 轻功 | 4 玄下 | 中性 | 0.80/0.20 | 神雕 | 神雕伴行试炼 | 原创扩展 |
| `sk_haichaolianjian` | 海潮炼剑 | 兵器/剑 | 6 玄上 | 中性 | 0.65/0.35 | 神雕 | 海潮练剑奇遇；山洪步＋剑冢吐纳进阶 | 原创扩展（取材于原著练剑情节） |
| `sk_jianzhongtuna` | 剑冢吐纳 | 内功/心法 | 2 黄中 | 调和 | 0/1 | 神雕 | 剑冢石室静修 | 原创扩展 |
| `sk_shanhongbu` | 山洪步 | 轻功 | 3 黄上 | 中性 | 0.80/0.20 | 神雕 | 山洪练剑前置试炼 | 原创扩展（取材于原著练剑情节） |

### 4.3 天级条目卡

#### `sk_anran` 黯然销魂掌（11 天中 · 拳脚/拳掌 · 杨过）

> **原著**：杨过在与小龙女分别的十六年间所创，取江淹《别赋》"黯然销魂者，唯别而已矣"之意，共十七招，心有所感方显威力（神雕，与周伯通切磋一节）。不同版本/流传文本在"庸人自扰"与"魂不守舍"等招名上存在差异，本文暂沿用下列十七名，须按三联/广州修订版逐字核对**（待考：《神雕侠侣》杨过与周伯通切磋、杨过救郭襄相关段落）**：心惊肉跳、杞人忧天、无中生有、拖泥带水、徘徊空谷、力不从心、行尸走肉、庸人自扰、倒行逆施、废寝忘食、孤形只影、饮恨吞声、六神不安、穷途末路、面无人色、想入非非、呆若木鸡。招式效果为原创扩展；原著定数 17 招，超出"天阶 5–10 招"规范，按原著例外（05 §3.5）。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阴 · 0.35/0.65 |
| 原生书界 | 神雕 |
| reqs | `attrs {con 50, wil 55, wis 50}`；`aptitude {apFist 55, apInner 50}`；`morality {min 0}`；`hard [morality]` |
| layerStats | `{counter [3, 8], resMind [2, 12]}`（20） |
| moveSlots | 5（10 重 6） |
| 层数要点 | 1 重心惊肉跳、拖泥带水、"黯然"；3 重"袖里乾坤"；5 重"心有所感"；**7 重黯然销魂（第一绝招）**；8 重"别赋"；**9 重想入非非（第二绝招）**；**10 重呆若木鸡（第三绝招）**、"黯然大成" |
| 获取 | `master`：杨过 `npc_yangguo`（羁绊 ≥ 4；神雕"十六年之约"一幕之后，02 §2.9 R3；主角本书界须经历"别离"——羁绊 ≥ 3 的同伴离队或倒下，记 `flag anran_bieli`，原创扩展门槛；占位 `q_03_bond_82`），maxLayer 10 |
| setTags · conflicts | `[set_shendiao_xialv]`；无 |
| special | `fusible: false`（以情入武，不可熔铸，原创规则）；`observable: false` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 心惊肉跳 | `mv_anran_xinjing` | 1 | `aoe_single` · 1 | 1.10 | 9% | 1 | 1000 | `bf_zhenshe`·承·50%·1 | ✓ | 1.17 −0.05 |
| 拖泥带水 | `mv_anran_tuoni` | 1 | `aoe_single` · 1（袖卷、掌拍 2 段） | 1.20 | 9% | 1 | 1100 | `bf_jiansu`·承·60%·2 | ✓ | 1.24 −0.06 |
| 杞人忧天 | `mv_anran_qiren` | 2 | `aoe_leap` · 1–3 | 0.95 | 9% | 1 | 1000 | 仰攻不受低打高惩罚（`noLowGroundPenalty`） | ✓ | 0.90 × 1.17 = 1.05，−0.10 |
| 无中生有 | `mv_anran_wuzhong` | 2 | `aoe_single` · 1 | 0.95 | 8% | 1 | 1000 | 不可反击 | ✗ | 1.12 × 0.85 |
| 徘徊空谷 | `mv_anran_paihuai` | 3 | `aoe_dash n3` · 1–3 | 1.15 | 9% | 2 | 1000 | 出招后后撤 1 格 | ✓ | 1.29 −0.10 −0.05 |
| 力不从心 | `mv_anran_libucongxin` | 3 | `aoe_self`（架势） | 0 | 5% | 2 | 800 | `bf_qianlong`·承·100%·1（至下次行动前 Z4 +15%）；被近战攻击以 1.20 倍反击 | — | 触发型 |
| 行尸走肉 | `mv_anran_xingshi` | 4 | `aoe_single` · 1（3 段） | 1.20 | 9% | 2 | 1000 | 自身 `bf_wenzhong`·承·100%·2 | ✓ | 1.29 −0.10 |
| 庸人自扰 | `mv_anran_yongren` | 4 | `aoe_single` · 1 | 1.15 | 8% | 2 | 1000 | `bf_luanxin`·承·50%·2 | ✓ | 1.24 −0.075 |
| 倒行逆施 | `mv_anran_daoxing` | 5 | `aoe_behind r2` | 1.00 | 9% | 2 | 1000 | 绕背出招（背击 Z7） | ✓ | 0.90 × 1.29 = 1.16，−0.15 |
| 废寝忘食 | `mv_anran_feiqin` | 5 | `aoe_single` · 1 | 0.85 | 6% | 0 | 900 | —（无冷却连击用） | ✓ | 1 −0.10 −0.07 |
| 孤形只影 | `mv_anran_guxing` | 6 | `aoe_single` · 1 | 1.25 | 8% | 1 | 1000 | 条件：自身 2 格内无友方 | ✓ | `1.00×(1+0.12+0.15)=1.27≈1.25` |
| 饮恨吞声 | `mv_anran_yinhen` | 6 | `aoe_self` | 0 | 8% | 3 | 800 | `bf_hutizhenqi`·承·100%·2（hpMax 12%）；`bf_xuli`·承·100%（下一本武学招式 Z3 +20%） | — | 蓄力类 |
| 六神不安 | `mv_anran_liushen` | 7 | `aoe_around` | 1.05 | 10% | 3 | 1000 | `bf_luanxin`·承·30%·2 | ✓ | N=6、AF=0.75；0.75 × 1.46 = 1.095，−0.045 = 1.05 |
| 穷途末路 | `mv_anran_qiongtu` | 7 | `aoe_single` · 1 | 1.60 | 9% | 2 | 1000 | 条件：自身气血 < 40% | ✓ | `1.00×(1+0.24+0.05+0.30)=1.59≈1.60` |
| 黯然销魂（绝招；原创扩展命名：十七招一气使完） | `mv_anran_xiaohun` | 7 | `aoe_single` · 1 | 2.45 | 10% | — | 1200 | `ultimate:true`；气势 100；`bf_zhenshe`·承·100%·1 | ✗ | 3.0 × 0.85 = 2.55，−0.10；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 面无人色 | `mv_anran_mianwu` | 8 | `aoe_single` · 1 | 1.30 | 9% | 3 | 1000 | `bf_kongju`·承·40%·1 | ✓ | 1.41 −0.10 |
| 想入非非（绝招） | `mv_anran_xiangru` | 9 | `aoe_multi n5 r2` · 1–2 | 2.15 | 10% | — | 1200 | `ultimate:true`；气势 100；5 段随机落点 | ✓ | `3.00×0.85×0.85=2.1675≈2.15`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 呆若木鸡（绝招） | `mv_anran_daimu` | 10 | `aoe_single` · 1 | 2.80 | 10% | — | 1200 | `ultimate:true`；气势 100；`bf_xuanyun`·承·80%·1 | ✓ | `3.00−0.25×0.80=2.80`；`MoveDef{unlock:10; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 黯然 | `ps_anran_anran` | 1 | stat · Z3 | 见 06 | 装配时常驻 `bf_anran`（06 §8.1：`Z3 +8%×G×(1 − hpPct)`；羁绊队友倒地或未上阵时 ×1.5） |
| 袖里乾坤（原创扩展） | `ps_anran_xiuli` | 3 | stat · 属性层 | `attr:parry flat +5 → +12` | 空手且副手亦空时（独臂以袖代手） |
| 心有所感 | `ps_anran_xinsuo` | 5 | effect | 暴击 +15 / Z3 −10% | 本场羁绊 ≥ 3 的队友倒地后本武学 `crit flat +15`；全队气血均 ≥ 90%（心境平和）时本武学 Z3 −10%；依据仍须核对**（待考：《神雕侠侣》杨过以黯然销魂掌对敌、心境欢愉而掌力减退的段落）** |
| 别赋 | `ps_anran_biefu` | 8 | trigger | 30% | 命中后使目标获得 `bf_xieqi`（泄气）1 回合 |
| 黯然大成 | `ps_anran_dacheng` | 10 | mechanic | — | 招式栏 +1；本武学全部招式冷却 −1（最低 0） |

#### `sk_xuantie` 玄铁剑法（11 天中 · 兵器/剑 · 独孤求败剑意 / 杨过）

> **原著**：独孤求败剑冢碑文有“重剑无锋，大巧不工”；杨过得玄铁重剑，随神雕练剑，剑法返璞归真、以拙胜巧。碑文与练剑地点仍须核对**（待考：《神雕侠侣》杨过入剑冢及随神雕练玄铁剑的段落）**。原著未列招名，下列招名为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 中性 · 0.55/0.45 |
| 原生书界 | 神雕 |
| weaponReq | `{category: sword, tags: [heavy]}`：不持重剑仍可用，但失去 1 重"重剑"与 5 重"神力"（05 §6.2）；本命兵器玄铁重剑 `eq_xuantiejian`（基准 §14，天中），负重 `Q_load 15`（03 §4.5） |
| reqs | `attrs {str 55, con 50, wis 50}`；`aptitude {apSword 55}`；`hard []` |
| layerStats | `{pierce [3, 10], resCC [2, 10]}`（20） |
| 层数要点 | 1 重重剑无锋；2 重山洪倒卷；3 重"以拙胜巧"；4 重海潮叠浪；5 重雕翼扫、"神力"；6 重剑冢葬锋；**7 重草木为剑（第一绝招）**；8 重"不滞于物"；**9 重大巧不工（第二绝招）**；10 重大成 |
| 获取 | ① `qiyu`：剑冢（神雕引路，占位 `q_03_qiyu_83`），maxLayer 7；② 修炼奇遇"山洪练剑"→ `sourceCap 9`、"海潮练剑"→ 10（原著情节，占位 `q_03_qiyu_84`）；③ `master`：杨过（羁绊 ≥ 4），maxLayer 10。进度门槛：神雕第 4 幕后 |
| setTags · conflicts | `[set_shendiao_xialv, set_dugu_jianzhong]`；`{with: sk_dugu9, type: synergy}`：同时装配两者招式 Z3 +5%（02 同源 `lg_dugu`，笑傲起方可同装） |
| special | `fusible: true`；`observable: false` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 重剑无锋 | `mv_xuantie_wufeng` | 1 | `aoe_single` · 1 | 1.10 | 9% | 0 | 1100 | — | ✓ | 1 +0.05 +0.07 |
| 大巧不工（绝招） | `mv_xuantie_daqiao` | 9 | `aoe_single` · 1 | 2.90 | 10% | — | 1200 | `ultimate:true`；气势 100；击退 2 | ✓ | `3.00−0.05（击退）−0.05（第二格）=2.90`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 山洪倒卷 | `mv_xuantie_shanhong` | 2 | `aoe_line n3` | 1.15 | 10% | 2 | 1100 | 每目标击退 1 | ✓ | N=3、AF=0.85；0.85 × 1.41 = 1.20，−0.05 ≈ 1.15 |
| 海潮叠浪 | `mv_xuantie_haichao` | 4 | `aoe_single` · 1（3 段） | 1.35 | 10% | 2 | 1100 | `bf_chihuan`·承·50% | ✓ | 1.41 −0.05 |
| 雕翼扫（原创扩展，致敬神雕以翅助练） | `mv_xuantie_diaoyi` | 5 | `aoe_cone {angle:120,r:1,dirCount:6}` | 1.05 | 9% | 1 | 1100 | — | ✓ | N=3、AF=0.85；0.85 × 1.24 = 1.05 |
| 剑冢葬锋 | `mv_xuantie_zangfeng` | 6 | `aoe_self`（架势） | 0 | 6% | 3 | 800 | `bf_shoushi`·承·100%·2；被近战攻击以 1.0 倍反击并击退 1 | — | 架势 |
| 玄铁千钧 | `mv_xuantie_qianjun` | 7 | `aoe_single` · 1 | 0.90 | 10% | 2 | 1000 | `ultimate:false`；击退 2；`bf_xuanyun`·承·50%·1 | ✗ | 普通招：`1.34×0.85−0.10−0.25×0.50=0.914≈0.90`；`MoveDef{unlock:7; ultimate:false; mpCost:10%; cd:2; recovery:1000}` |
| 草木为剑（绝招；碑文"草木竹石均可为剑"） | `mv_xuantie_caomu` | 7 | `aoe_single` · 1–2（`ranged` 剑气） | 2.20 | 10% | — | 1200 | `ultimate:true`；气势 100；可持任意兵器或空手施放（×0.9） | ✓ | `3.00×0.85×0.90=2.295`，手调为 2.20；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

- **AR-16 外放字段**：`mv_xuantie_caomu` 明确为离体剑气，`MoveDef{projection:true; range:{min:1,max:2}; aoe:{tpl:aoe_single}; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; meridianRouteRef:mfr_xuantie_caomu}`；全部伤害段 `DamageKind='projected'`。文首显式路线含内关、劳宫、中冲，满足持械导引与外放端点要求。其余招式为重剑接触挥击、架势或近身震击，不标。

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 重剑 | `ps_xuantie_zhongjian` | 1 | stat · Z2 / Z9 | 无视外防 10% → 25%；被招架时招架减免 −50% | 仅持 `heavy` 剑 |
| 以拙胜巧 | `ps_xuantie_zhuo` | 3 | stat · Z3 | +6% → +12% | 目标 `combo > 0` 或 `spd` 高于自身时 |
| 神力 | `ps_xuantie_shenli` | 5 | stat / effect / mechanic | `attr:resCC pp +10`；击退 +1 格；战斗开始获得 `bf_wushi_zhaojia` 2 回合 | 仅持 `heavy` 剑（06 §8.9 无视招架之典型来源即玄铁剑法） |
| 不滞于物 | `ps_xuantie_buzhi` | 8 | mechanic | ×0.9 | 可持棍杖、奇门兵器或空手施展本武学（`weaponReq.altCategories`，同 05 独孤九剑 9 重规则） |
| 大巧不工（大成） | `ps_xuantie_dacheng` | 10 | mechanic | 收招 −100 | 本武学全部招式收招 −100 |

#### `sk_suxin` 玉女素心剑法（11 天中 · 兵器/剑（双人合璧）· 古墓 × 全真）

> **原著**：玉女心经末章所载，一人使全真剑法、一人使玉女剑法，两剑招招相补、心意相通方显威力；杨过、小龙女以之败金轮法王等强敌（神雕）。浪迹天涯、花前月下、清饮小酌、抚琴按箫、松下对弈、池边调鹤、扫雪烹茶等名的字形与全表仍须核对，尤须确认“举案齐眉”**（待考：《神雕侠侣》杨过、小龙女练成并施展玉女素心剑法的段落）**。合璧规则以 05 §9.3.1 为准，本卡只补招式与被动。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 调和（全真阳 × 古墓阴）· 0.60/0.40 |
| 原生书界 | 神雕 |
| reqs | `attrs {agi 50, wis 50}`；`aptitude {apSword 55}`；角色位前置（05 §9.3.1）：全真位 `sk_quanzhenjian ≥ 5` / 古墓位 `sk_yunvjian ≥ 5`；`hard [prereq]` |
| layerStats | `{hit [3, 10], eva [2, 10]}`（20） |
| 层数要点 | 1 重浪迹天涯、"合璧"；2 重清饮小酌；3 重抚琴按箫、"相克相济"；4 重松下对弈；5 重池边调鹤；6 重扫雪烹茶、"素心"；**7 重双剑合璧（第一绝招）**；**9 重举案齐眉（第二绝招）**、"同心"；**10 重花前月下（第三绝招）**、"素心大成" |
| 获取 | ① `combo` 合击领悟（05 §7.7：主角与羁绊 ≥ 4 的队友各占一位，合击 5 次 + 羁绊事件，占位 `q_03_bond_86`），maxLayer 10；② `puzzle` 古墓石室·玉女心经末章（须搭档同行），maxLayer 10。进度门槛：神雕第 4 幕后 |
| setTags | `[set_shendiao_xialv, set_gumu_yunv]` |
| special | 05 §9.3.1 全部规则（合璧状态、独练 ×0.5、情缘 Z3 +10%、左右互搏一人合璧 ×0.8、断尘之誓失去情缘加成）；**情花毒联动**：身中 `bf_qinghuadu` 者施放本武学招式即“动情”发作；依据仍须核对**（待考：《神雕侠侣》杨过中情花毒后与小龙女合使剑法的段落）**；`fusible: false`；`observable: false` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 浪迹天涯（全真剑意） | `mv_suxin_langji` | 1 | `aoe_dash n3` · 1–3 | 1.05 | 9% | 1 | 1000 | — | ✓ | 1.17 −0.10 |
| 花前月下（绝招；古墓剑意） | `mv_suxin_huaqian` | 10 | `aoe_single` · 1（3 段） | 2.85 | 10% | — | 1200 | `ultimate:true`；气势 100；自身 `bf_piaohu`·承·100%·2 | ✓ | `3.00−0.15=2.85`；`MoveDef{unlock:10; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 清饮小酌 | `mv_suxin_qingyin` | 2 | `aoe_allies r2`（自身与搭档） | 0 | 8% | 3 | 900 | 回复 10% 气血；`bf_huinei`·承·100%·2 | — | 支援 |
| 抚琴按箫 | `mv_suxin_fuqin` | 3 | `aoe_single` · 1–3（`ranged`，2 段） | 1.10 | 9% | 2 | 1000 | — | ✓ | 1.29 × 0.85 |
| 松下对弈 | `mv_suxin_songxia` | 4 | `aoe_self`（架势） | 0 | 7% | 2 | 850 | `bf_ningshen`·承·100%·2；被近战攻击以 1.1 倍反击 | — | 触发型 |
| 池边调鹤 | `mv_suxin_chibian` | 5 | `aoe_pull n2` · 1–3 | 1.10 | 9% | 2 | 1000 | — | ✓ | 0.95 × 1.29 = 1.23，−0.10 |
| 扫雪烹茶 | `mv_suxin_saoxue` | 6 | `aoe_cone {angle:120,r:1,dirCount:6}` | 0.90 | 8% | 1 | 1000 | `bf_hanqi`·承·30%·3 | ✓ | N=3、AF=0.85；0.85 × 1.12 = 0.95，−0.03 = 0.92，取 0.90 |
| 双剑合璧（绝招，05 §9.3.1） | `mv_suxin_hebi` | 7 | `aoe_single` · 1 | 3.00 | 10% | — | 1200 | `ultimate:true`；气势 100；搭档集气 −300 同时出招（其本武学最高普通招式 ×1.0，流程归 09）；情缘 Z3 +10% | ✓ | 3.0 基准；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 举案齐眉（绝招）**（待考：《神雕侠侣》玉女素心剑法招名）** | `mv_suxin_juan` | 9 | `aoe_allies r2`（自身与搭档） | 0 | 10% | — | 1200 | `ultimate:true`；气势 100；`bf_ruiyi`·承·100%·3；`bf_xieli`·承·100%·3 | — | 群体支援绝招；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 合璧 | `ps_suxin_hebi` | 1 | mechanic | — | 05 §9.3.1：合璧状态全额；独练 ×0.5（玉女心经 10 重 0.6） |
| 相克相济 | `ps_suxin_xiangji` | 3 | trigger | ×1 | 合璧时一人招式被招架，另一人下一次本武学招式获得 `bf_bizhong`（必中 ×1） |
| 素心 | `ps_suxin_suxin` | 6 | effect | −1 回合 | 合璧时双方所受心神类减益持续 −1 |
| 同心 | `ps_suxin_tongxin` | 9 | trigger | 每战 2 次 | 合璧中搭档气血 < 30% 且相邻时，自身获得 `bf_yuanhu` 1 回合 |
| 素心大成 | `ps_suxin_dacheng` | 10 | mechanic | — | 左右互搏一人合璧系数 0.8 → 0.9；招式栏 +1 |

### 4.4 地阶条目卡（剑冢剑意）

> **剑冢四意共通规则（原创扩展）**：四意均为 `misc/mind`（杂学·心神），不可携带；按"持何种剑"触发——利剑意对应普通剑、软剑意对应软剑（`soft`）与鞭索、重剑意对应重剑（`heavy`）、木剑意对应木剑（`wooden`）或无剑。兵器标签由 design/10 标注。四意品阶随独孤求败年岁递进，获取须依次拜读剑冢四碑（占位 `q_03_qiyu_83` 分四段；重、木二意在神雕第 4 幕后）。

#### `sk_zhongjianyi` 重剑意（8 地中 · 杂学/心神 · 独孤求败剑冢）

> 碑文大意（逐字仍须核对）**（待考：《神雕侠侣》独孤求败剑冢重剑石刻）**：“重剑无锋，大巧不工。四十岁前恃之横行天下。”

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 中性 · 0.60/0.40 |
| 原生书界 | 神雕 |
| reqs | `attrs {str 45, wis 40}`；`aptitude {apSword 45}`；`prereq [sk_lijianyi ≥ 3]`；`hard [prereq]` |
| layerStats | `{pierce [2, 8], resCC [2, 7]}`（15） |
| 层数要点 | 1 重负剑、"重剑之意"；4 重沉剑、"沉雄"；**7 重绝招横行天下**；8 重"同源"；10 重"大成" |
| 获取 | 剑冢第三碑（玄铁重剑处），maxLayer 10 |
| setTags · conflicts | `[set_dugu_jianzhong]`；无 |
| special | `fusible: false`；残篇化后建议入同源组 `lg_dugu`（§11 D-7） |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 负剑（原创扩展命名） | `mv_zhongjianyi_fujian` | 1 | `aoe_self` | 0 | 6% | 4 | 800 | `bf_shichen`·承·100%·3（势沉：暴伤 +） | — |
| 沉剑（原创扩展命名） | `mv_zhongjianyi_chenjian` | 4 | `aoe_self`（架势） | 0 | 6% | 3 | 800 | `bf_xushi`·承·100%（蓄势：下一击 Z3 +12%×G、击退 +1） | — |
| 横行天下（绝招，取碑文） | `mv_zhongjianyi_hengxing` | 7 | `aoe_self` | 0 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_wushi_zhaojia`·承·100%·2；`bf_mian_kong`·承·100%·1 | —；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 重剑之意 | `ps_zhongjianyi_zhongjian` | 1 | stat · Z3 | +6% → +14% | 持重剑时剑法招式；代价：剑法招式收招 +50 |
| 沉雄 | `ps_zhongjianyi_chenxiong` | 4 | effect | +1 格 | 持重剑时剑法招式击退距离 +1 |
| 同源 | `ps_zhongjianyi_tongyuan` | 8 | stat · Z3 | +5% | 与玄铁剑法同时装配（相生 ≤ +8%，05 §9.2） |
| 大成 | `ps_zhongjianyi_dacheng` | 10 | stat · Z9 | −30% | 持重剑时剑法招式被招架的招架减免 −30% |

#### `sk_mujianyi` 木剑意（9 地上 · 杂学/心神 · 独孤求败剑冢）

> 碑文大意（逐字仍须核对）**（待考：《神雕侠侣》独孤求败剑冢木剑石刻）**：“四十岁后，不滞于物，草木竹石均可为剑。自此精修，渐进于无剑胜有剑之境。”

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 中性 · 0.60/0.40 |
| 原生书界 | 神雕 |
| reqs | `attrs {wis 55, wil 45}`；`aptitude {apSword 50}`；`prereq [sk_zhongjianyi ≥ 5, sk_xuantie ≥ 5]`；`hard [prereq]` |
| layerStats | `{parry [2, 8], hit [2, 7]}`（15） |
| 层数要点 | 1 重折枝为剑、"不滞于物"；4 重草木竹石、"以木胜铁"；**7 重万物为锋（第一绝招）**；8 重"剑意无形"；**9 重草木竹石（第二绝招）**；10 重"渐近无剑" |
| 获取 | 剑冢第四碑（木剑处），maxLayer 10 |
| setTags · conflicts | `[set_dugu_jianzhong]`；无 |
| special | `fusible: false`；残篇化后建议入同源组 `lg_dugu`（§11 D-7） |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 折枝为剑（原创扩展命名） | `mv_mujianyi_zhezhi` | 1 | `aoe_self` | 0 | 6% | 3 | 800 | 本回合可以空手或任意兵器施展已装配的剑法招式（×0.8） | — | 功能 |
| 草木竹石（绝招；提升既有招式，取碑文） | `mv_mujianyi_caomu` | 9 | `aoe_self` | 0 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_yuanzhuan`·承·100%·3；本回合可空手或持任意兵器施展剑法 | — | 支援绝招；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 万物为锋（绝招，原创扩展命名） | `mv_mujianyi_wanwu` | 7 | `aoe_wave d1 w5`（`ranged`） | 1.55 | 9% | — | 1200 | `ultimate:true`；气势 100；立于草地 / 竹林 / 树林地形时本招 Z3 +20%（08） | ✓ | 3.0 × 0.60 × 0.85 = 1.53；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

- **AR-16 审计**：`mv_mujianyi_wanwu` 的远程波形未说明是剑气还是草木实体飞射，暂记待考；不因 `ranged` 自动标记。其显式路线原误写为 `defense`，本轮依既有 §8.7.3 绑定改回 `attack`，并以阳池→外关收束，满足未来若确认外放时的持械端点要求。

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 不滞于物 | `ps_mujianyi_buzhi` | 1 | mechanic | ×0.7 → ×0.9 | 持棍杖、奇门或空手时可施展剑法武学（`weaponReq.altCategories` 全局放宽） |
| 以木胜铁 | `ps_mujianyi_yimu` | 4 | mechanic | — | 持木剑时免疫品阶 ≤ 本意的 `bf_duanbing`、`bf_jiaoxie` |
| 剑意无形 | `ps_mujianyi_wuxing` | 8 | stat · Z5 | ×0.7 | 敌方 `bf_pojian`（破剑）对自身的 Z5 加成与招架乘数效果 ×0.7 |
| 渐近无剑 | `ps_mujianyi_dacheng` | 10 | stat · Z3 | +6% | 装配时剑法招式伤害 +6% |

### 4.5 玄阶（紧凑表）

**`sk_lijianyi` 利剑意**（6 玄上 · 杂学/心神 · 中性 · 原创扩展）——碑文大意：“凌厉刚猛，无坚不摧，弱冠前以之与河朔群雄争锋。”**（待考：《神雕侠侣》独孤求败剑冢利剑石刻逐字）**
- reqs：`attrs {wis 35}`；`aptitude {apSword 30}`；`hard []`。获取：剑冢第一碑（神雕第 3 幕后），maxLayer 10。`setTags: [set_dugu_jianzhong]`；`fusible: false`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 争锋（绝招；提升既有招式，原创扩展命名） | `mv_lijianyi_zhengfeng` | 7 | `aoe_self` | 0 | 8% | — | 1200 | `ultimate:true`；气势 100；`bf_gongshi`·承·100%·3（攻势）；`bf_ruiyi`·承·100%·2 | —；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- 被动：`ps_lijianyi_lingli` 凌厉（1 重，持普通剑——无 `heavy`/`soft`/`wooden` 标签——时剑法招式无视外防 4% → 10%，Z2）；`ps_lijianyi_wujian` 无坚不摧（5 重，剑法招式对带 `guard` 类增益的目标 Z3 +8%）；`ps_lijianyi_dacheng` 大成（10 重，剑法 `attr:crit flat +5`）。

**`sk_ruanjianyi` 软剑意**（6 玄上 · 杂学/心神 · 中性 · 原创扩展）——碑文大意：“紫薇软剑，三十岁前所用，误伤义士不祥，乃弃之深谷。”软剑原物已弃，冢中只余碑；逐字仍须核对**（待考：《神雕侠侣》独孤求败剑冢软剑石刻）**。
- reqs：`attrs {wis 35, agi 30}`；`hard []`。获取：剑冢第二碑（神雕第 3 幕后），maxLayer 10。`setTags: [set_dugu_jianzhong]`；`fusible: false`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 绕剑（绝招；提升既有招式，原创扩展命名） | `mv_ruanjianyi_raojian` | 7 | `aoe_self` | 0 | 8% | — | 1200 | `ultimate:true`；气势 100；`bf_wushi_zhaojia`·承·100%·2（下一次剑法 / 鞭法招式不经招架）；`bf_piaohu`·承·100%·2 | —；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- 被动：`ps_ruanjianyi_rouren` 柔韧（1 重，持软剑或鞭索时 `attr:combo pp +2 → +6`）；`ps_ruanjianyi_qijian` 弃剑之诫（5 重，本方范围剑招不误伤友方；击杀 `morality ≥ 20` 的目标后本场剑法 Z3 −10%——碑文"误伤义士不祥"之诫，原创扩展规则化）；`ps_ruanjianyi_dacheng` 大成（10 重，剑法 `attr:hit flat +5`）。

#### 4.5.1 AR-01 新增玄阶紧凑卡（2 门）

> 两门均为 **（原创扩展）**，`sect:null`、`lineage:独孤求败剑冢 / 杨过`、`sourceChapters:[ch03_shendiao]`、`conflicts:[]`。海潮炼剑只取材于杨过在海潮中练剑的原著情节，不把武学名称写成原著名目。

**`sk_diaopubu` 雕步**（4 玄下 · 轻功 · `nature: neutral` · 0.80/0.20）
- 字段：`reqs {attrs {agi:22,con:20}, aptitude {apLight:20}, prereq [{skill:sk_shanhongbu,layer:5}], hard:[prereq]}`；`layerStats {spd:[2,5],resCC:[1,2]}`（7）；满层 `Q_skill=QS(4)=56`；`setTags:[]`。
- 招式：随雕跃 `mv_diaopubu_suidiao`（1 重，自身，5%/cd2/800，跃至 2 格内空位）；逆风 `mv_diaopubu_nifeng`（4 重，自身，5%/cd3/800，`bf_wenzhong`·承·2）；踏石 `mv_diaopubu_tashi`（7 重，自身，6%/cd4/800，本次移动忽略 1 格困难地形）。被动：伴雕 `ps_diaopubu_bandiao`（相邻大型友方时抗击退 +5→12pp）；险径 `ps_diaopubu_xianjing`（高差移动消耗 −1，最低 1）。获取：与神雕伴行试炼，山洪步 5 重。

**`sk_haichaolianjian` 海潮炼剑**（6 玄上 · 兵器/剑 · `nature: neutral` · 0.65/0.35）【玄阶预算抽样】
- 字段：`reqs {attrs {str:30,con:30}, aptitude {apSword:30}, prereq [{skill:sk_shanhongbu,layer:6},{skill:sk_jianzhongtuna,layer:5}], hard:[prereq]}`；`layerStats {tough:[2,6],hit:[1,4]}`（10）；`weaponReq:{category:sword}`；`setTags:[set_dugu_jianzhong]`。
- 招式：迎潮 `mv_haichaolianjian_yingchao`（1 重，单体，1.00，6%/cd0/1000，可招架）；破浪 `mv_haichaolianjian_polang`（4 重，`aoe_line n3`，1.05，6%/cd2/1000，可招架）；回潮 `mv_haichaolianjian_huichao`（7 重绝招，单体，2.95，8%/无冷却/1200，`ultimate:true`、气势 100、击退 1，可招架）。核算：`1.00`；`0.85×1.24=1.054≈1.05`；绝招 `3.00−0.05=2.95`。仅回潮为绝招，前两式 `ultimate:false`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 被动：迎浪 `ps_haichaolianjian_yinglang`（受击后下一剑 Z3 +4%→10%）；潮炼 `ps_haichaolianjian_chaolian`（水域或暴雨中修炼 +15%）；大成 `ps_haichaolianjian_dacheng`（10 重，持重剑时抗击退 +15pp）。获取：海潮练剑支线；`observable:true`，观摩上限 5 重。

#### 4.5.2 黄阶一行总表（2 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或（原创扩展） |
|---|---|---|---|---|---|---|---|
| `sk_jianzhongtuna` | 剑冢吐纳 | 剑冢石室 | 2 黄中·内功/心法·`nature:harmony` | 神雕 | IP `8+5+2×3+5×1.0=24`；`attrs {con:1,wil:1,wis:1}`；`mer_dumai`；`setTags:[set_dugu_jianzhong]` | 无 | **（原创扩展）** |
| `sk_shanhongbu` | 山洪步 | 杨过练剑传承 | 3 黄上·轻功·中性 | 神雕 | 自身 `bf_wenzhong`；满层 `QS(3)=45` | 无 | **（原创扩展）**；取材于《神雕侠侣》杨过山洪 / 海潮练剑情节，段落待考 |

### 4.6 进阶链

| 链 | 前置关系 |
|---|---|
| 剑冢 | 剑冢吐纳（黄中）＋山洪步（黄上）→ 海潮炼剑（玄上）；利剑意（玄上）→ 3 重 → 重剑意（地中）→ 5 重 ＋ 玄铁剑法 5 重 → 木剑意（地上）；软剑意独立（第二碑） |
| 身法 | 山洪步（黄上）→ 5 重 → 雕步（玄下）；雕步与海潮炼剑共同服务玄铁重剑修行，不改玄铁剑法的原著获取 |
| 合璧 | 全真剑法 5 重（全真位）/ 玉女剑法 5 重（古墓位）→ 玉女素心剑法 |
| 情 | 黯然销魂掌：羁绊传授，须经"别离"（无前置武学） |

- **推荐装配（神雕终盘，杨过路线）**：主运玉女心经＋辅运金关玉锁（桥接）、寒玉心诀｜黯然销魂掌、美女拳法｜玄铁剑法、玉女素心剑法（持玄铁重剑时素心仍可用，05 §6.2 只看类别）｜古墓轻功｜玉蜂针｜重剑意、木剑意。

---

## 5. 武当派 `sect_wudang`

### 5.1 门派简介

- **神雕末（伏笔）**：少年张君宝随觉远在少林，与郭襄相识（神雕末回；02 C7"神雕中与张君宝结缘"回响）。武当尚未开派。
- **倚天（约 1336–1363）**：张三丰开派，门下宋远桥、俞莲舟、俞岱岩、张松溪、张翠山、殷梨亭、莫声谷七侠。俞岱岩重伤后张三丰以"武林至尊…"二十四字创倚天屠龙功，传张翠山；为七弟子创真武七截阵；晚年当众创传太极拳、太极剑（原著）。**强**：六大派之一，张三丰为当世第一人。
- **笑傲（明中叶）**：冲虚道长为武林泰斗，以太极剑与令狐冲对剑（原著）。太极一脉已残，按 02 §5.7 为残承 `lineageGrade 10`。**中**：大派，高手凋零。
- **侠客（明）**：武当掌门赴侠客岛不归（02 C7）；姓名“愚茶”仍须核对**（待考：《侠客行》侠客岛铜牌与武当掌门相关段落）**。**弱**：掌门空缺。
- **书剑（1753–1759）**：陆菲青（“绵里针”）、马真、张召重（“火手判官”，投身清廷）同出武当；陆菲青传李沅芷。马真身份与结局仍须核对**（待考：《书剑恩仇录》武当人物陆菲青、马真、张召重相关段落）**。**中**：张召重为书界一流高手。
- **飞狐（约 1766–1771）**：福康安“天下掌门人大会”上有武当掌门；姓名仍须核对**（待考：《飞狐外传》天下掌门人大会的武当人物名单）**。本作只提供入门—中坚武学（原创扩展延伸）。
- **低武★**：原著鹿鼎、连城、白马、鸳鸯未见武当；本作在连城（湖北荆州一带，与武当山同省）与鸳鸯（"太岳四侠"之"太岳"为武当山古称，作彩蛋）设"游方武当道人"传授入门武学（原创扩展，须 chapters/09、11 采纳），供 1/1/1 携带书界补位。
- **敌人配置建议**：倚天武当弟子普通地下、七侠为具名（地中—天中）；书剑张召重为具名 Boss（主力无极玄功拳 / 柔云剑术，地下，配凝碧剑）。

### 5.2 武学总表（36 门，另引用武当九阳功）

| ID | 名称 | 大类/子类 | 品阶 | 内力性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_taihegong` | 太和功 | 内功/心法 | 2 黄中 | 调和 | 0/1 | 倚天、笑傲、侠客、书剑、飞狐、连城★、鸳鸯★ | 拜师（L1）；游方道人★ | 原创扩展 |
| `sk_liangyixinfa` | 两仪心法 | 内功/心法 | 5 玄中 | 调和 | 0/1 | 倚天、笑傲、侠客、书剑、飞狐 | 拜师（L2）；秘籍 | 原创扩展 |
| `sk_chunyangwuji` | 纯阳无极功 | 内功/心法 | 8 地中 | 阳 | 0/1 | 倚天、笑傲★、侠客★、书剑★ | 拜师（L3） | 原著；授受**（待考：《倚天屠龙记》武当内功相关段落）** |
| `sk_wudangjiuyang` | 武当九阳功 | 内功/心法 | 地阶（倚天组定） | 阳 | — | 倚天 | 倚天组定义，本文只引用 | 原著 |
| `sk_wudangchangquan` | 武当长拳 | 拳脚/拳掌 | 1 黄下 | 阳 | 0.85/0.15 | 倚天、笑傲、侠客、书剑、飞狐、连城★、鸳鸯★ | 拜师（L1）；游方道人★ | 原著 |
| `sk_mianzhang` | 绵掌 | 拳脚/拳掌 | 5 玄中 | 调和 | 0.45/0.55 | 倚天、笑傲★、侠客★、书剑、飞狐★、连城★、鸳鸯★ | 拜师（L2）；书剑陆菲青 | 原著；出处**（待考：《倚天屠龙记》《书剑恩仇录》武当人物用掌段落）** |
| `sk_wudangjiemaishou` | 武当截脉手 | 拳脚/指法 | 5 玄中 | 阳 | 0.40/0.60 | 倚天、笑傲、侠客、书剑 | 拜师（L2） | 原创扩展 |
| `sk_taijituishou` | 太极推手 | 拳脚/擒拿 | 6 玄上 | 调和 | 0.40/0.60 | 倚天、笑傲、侠客、书剑、飞狐 | 拜师（L3） | 原创扩展（拳理原著） |
| `sk_huzhaojuehushou` | 虎爪绝户手（虎爪手） | 拳脚/擒拿 | 7 地下 | 阳 | 0.75/0.25 | 倚天、笑傲★、侠客★ | 拜师（L4，俞莲舟一系） | 原著；授受**（待考：《倚天屠龙记》俞莲舟、张无忌相关段落）** |
| `sk_wujixuangongquan` | 无极玄功拳 | 拳脚/拳掌 | 7 地下 | 阳 | 0.55/0.45 | 书剑、笑傲★、侠客★ | 拜师（L4）；击败张召重得拳谱 | 原著；出处**（待考：《书剑恩仇录》张召重交手段落）** |
| `sk_taijiquan` | 太极拳 | 拳脚/拳掌 | 11 天中 | 调和 | 0.40/0.60 | 倚天（笑傲残承 10） | 张三丰传授；"太极初传"主线奇遇 | 原著（基准 §13） |
| `sk_zhenwujian` | 真武剑法 | 兵器/剑 | 3 黄上 | 阳 | 0.75/0.25 | 倚天、笑傲、侠客、书剑、飞狐、连城★、鸳鸯★ | 拜师（L1）；游方道人★ | 原创扩展 |
| `sk_rouyunjian` | 柔云剑术 | 兵器/剑 | 7 地下 | 调和 | 0.60/0.40 | 书剑、笑傲★、侠客★、飞狐★ | 陆菲青传授；拜师（L3） | 原著 |
| `sk_raozhirou` | 绕指柔剑 | 兵器/剑 | 6 玄上 | 阴 | 0.45/0.55 | 倚天、笑傲★ | 拜师（L3；殷梨亭一系**（待考：《倚天屠龙记》绕指柔剑使用者）**） | 原著；出处同前 |
| `sk_shenmen13` | 神门十三剑 | 兵器/剑 | 7 地下 | 阳 | 0.70/0.30 | 倚天、笑傲★、侠客★、书剑★ | 拜师（L4） | 原著；出处**（待考：《倚天屠龙记》神门十三剑出场段落）** |
| `sk_yitiantulonggong` | 倚天屠龙功 | 兵器/奇门（笔·钩） | 8 地中 | 调和 | 0.55/0.45 | 倚天 | 张翠山羁绊；王盘山石壁拓字奇遇 | 原著 |
| `sk_taijijian` | 太极剑 | 兵器/剑 | 11 天中 | 调和 | 0.50/0.50 | 倚天（笑傲残承 10） | 张三丰传授；"太极剑传"主线奇遇 | 原著（基准 §13） |
| `sk_wudangyunbu` | 武当云步 | 轻功 | 3 黄上 | 阳 | 0.80/0.20 | 倚天、笑傲、侠客、书剑、飞狐、连城★、鸳鸯★ | 拜师（L1）；游方道人★ | 原创扩展 |
| `sk_tiyunzong` | 梯云纵 | 轻功 | 8 地中 | 阳 | 0.80/0.20 | 倚天、笑傲★、侠客★、书剑★、飞狐★ | 拜师（L3） | 原著 |
| `sk_furongjinzhen` | 芙蓉金针 | 暗器 | 6 玄上 | 阳 | 0.70/0.30 | 书剑、飞狐★ | 陆菲青 / 李沅芷传授 | 原著 |
| `sk_zhenwuqijie` | 真武七截阵 | 杂学/阵法（合击） | 8 地中 | 阳 | 0.55/0.45 | 倚天、笑傲★、侠客★ | 武当门派任务链"真武七截"（原创扩展）；合击领悟 | 原著 |
| `sk_wudangyangshenggong` | 武当养生功 | 内功/心法 | 5 玄中 | 调和 | 0/1 | 倚天、笑傲、侠客、书剑、飞狐 | 武当 L2；太和功 / 真武导引任一进阶 | 原创扩展 |
| `sk_xuanzhenxinfa` | 玄真心法 | 内功/心法 | 5 玄中 | 阳 | 0/1 | 倚天、笑傲、侠客 | 武当 L2；真武桩进阶 | 原创扩展 |
| `sk_lingxuzhang` | 凌虚掌 | 拳脚/拳掌 | 5 玄中 | 调和 | 0.50/0.50 | 倚天、笑傲、侠客、书剑 | 武当 L2；武当长拳 / 武当入门拳任一进阶 | 原创扩展 |
| `sk_xuanxujian` | 玄虚剑 | 兵器/剑 | 6 玄上 | 调和 | 0.55/0.45 | 倚天、笑傲、侠客 | 武当 L3；武当入门剑 / 七侠初剑 / 真武剑法任一进阶 | 原创扩展 |
| `sk_liangyibu` | 两仪步 | 轻功 | 6 玄上 | 调和 | 0.80/0.20 | 倚天、笑傲、侠客、书剑 | 武当 L3；武当行步进阶 | 原创扩展 |
| `sk_wudangfuchen` | 武当拂尘 | 兵器/鞭索（拂尘） | 6 玄上 | 调和 | 0.60/0.40 | 倚天、笑傲、侠客 | 武当 L3；真武拂尘进阶 | 原创扩展 |
| `sk_wudangtuna` | 武当吐纳 | 内功/心法 | 1 黄下 | 阳 | 0/1 | 倚天、笑傲、侠客、书剑、飞狐、连城★、鸳鸯★ | 武当 L1；游方道人★ | 原创扩展 |
| `sk_zhenwudaoyin` | 真武导引 | 内功/心法 | 2 黄中 | 调和 | 0/1 | 倚天、笑傲、侠客、书剑、飞狐 | 武当 L1 | 原创扩展 |
| `sk_wudangrumenquan` | 武当入门拳 | 拳脚/拳掌 | 2 黄中 | 阳 | 0.85/0.15 | 倚天、笑傲、侠客、书剑、飞狐 | 武当 L1 | 原创扩展 |
| `sk_songxiqinna` | 松溪擒拿 | 拳脚/擒拿 | 3 黄上 | 调和 | 0.70/0.30 | 倚天、书剑 | 武当 L1 | 原创扩展命名 |
| `sk_wudangrumenjian` | 武当入门剑 | 兵器/剑 | 3 黄上 | 阳 | 0.75/0.25 | 倚天、笑傲、侠客、书剑、飞狐 | 武当 L1 | 原创扩展 |
| `sk_zhenwufuchen` | 真武拂尘 | 兵器/鞭索（拂尘） | 3 黄上 | 调和 | 0.70/0.30 | 倚天、笑傲、侠客 | 武当 L1 | 原创扩展 |
| `sk_qixiachujian` | 七侠初剑 | 兵器/剑 | 3 黄上 | 阳 | 0.75/0.25 | 倚天 | 武当七侠门下 L1 | 原创扩展 |
| `sk_wudangxingbu` | 武当行步 | 轻功 | 2 黄中 | 调和 | 0.80/0.20 | 倚天、笑傲、侠客、书剑、飞狐 | 武当 L1 | 原创扩展 |
| `sk_songxibu` | 松溪步 | 轻功 | 3 黄上 | 调和 | 0.80/0.20 | 倚天、书剑 | 武当 L1 | 原创扩展命名 |
| `sk_zhenwuzhuang` | 真武桩功 | 内功/心法 | 3 黄上 | 阳 | 0/1 | 倚天、笑傲、侠客 | 武当 L1 | 原创扩展 |

> 注：`sk_wudangjiuyang` 行只作引用，不计入本组 116 门。内力性质取向：太极一系调和（配调和主运得 +12% 相性），纯阳 / 九阳一系阳；绕指柔剑取阴（"百炼钢化为绕指柔"）。

### 5.3 天级条目卡

#### `sk_taijiquan` 太极拳（11 天中 · 拳脚/拳掌 · 武当）

> **原著**：张三丰于武当山当众演示新创太极拳，张无忌现学现用，以之迎战阿三；拳理重在以慢打快、以静制动、后发制人、用意不用力。揽雀尾、单鞭、提手上势、白鹤亮翅、搂膝拗步、手挥琵琶、进步搬拦捶、如封似闭、十字手、抱虎归山、云手等名见《倚天屠龙记》传拳段落；完整次序与"合太极"字样仍须核对**（待考：《倚天屠龙记》张三丰传太极拳、张无忌迎战阿三段落）**。招式效果为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 调和 · 0.40/0.60 |
| 原生书界 | 倚天（笑傲：残承 `partial`、`lineageGrade 10`，已采纳于基准 v1.1 §13 / V11-28；不计入笑傲完整原生天级池） |
| reqs | `attrs {wis 55, wil 50}`；`aptitude {apFist 55}`；`morality {min 10}`；`sect {sect_wudang, rank 4}`；`hard [sect, morality]` |
| layerStats | `{parry [3, 10], counter [2, 10]}`（20） |
| moveSlots | 5（10 重 6） |
| 层数要点 | 1 重揽雀尾、单鞭、"借力打力"；2 重白鹤亮翅；3 重搂膝拗步、"后发制人"；4 重手挥琵琶；5 重进步搬拦捶、"四两拨千斤"；6 重如封似闭；**7 重抱虎归山（第一绝招）**；8 重"以慢打快"；**9 重云手（第二绝招）**；**10 重十字手（第三绝招）**、"合太极" |
| 获取 | ① `master`：张三丰 `npc_zhangsanfeng`（武当L4），maxLayer 10；② `qiyu`"太极初传"（倚天主线：张三丰当众演拳，主角在场即可习得，原著；占位 `q_04_main_87`；`reqsOverride {sect: null}`），maxLayer 10；③ 笑傲印证（残承）：冲虚道长 `npc_chongxu`。进度门槛：倚天第 4 幕后 |
| setTags · conflicts | `[set_wudang_taiji]`；`{with: sk_taijijian, type: synergy}`（见 10 重） |
| special | `fusible: true`；`observable: false`（"当众传拳"以剧情奇遇实现，不开放常规观摩） |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 揽雀尾 | `mv_taijiquan_lanque` | 1 | `aoe_single` · 1 | 0.95 | 8% | 0 | 1000 | `bf_shiheng`·承·50%·1 | ✓ | 1 −0.05 |
| 单鞭 | `mv_taijiquan_danbian` | 1 | `aoe_single` · 1 | 1.05 | 8% | 1 | 1000 | 击退 1 | ✓ | 1.12 −0.05 |
| 白鹤亮翅 | `mv_taijiquan_baihe` | 2 | `aoe_self`（架势） | 0 | 5% | 2 | 800 | `bf_jingshi`·承·100%；被近战攻击以 1.0 倍反击 | — | 触发型 |
| 搂膝拗步 | `mv_taijiquan_louxi` | 3 | `aoe_cone {angle:120,r:1,dirCount:6}` | 0.95 | 8% | 1 | 1000 | — | ✓ | N=3、AF=0.85；0.85 × 1.12 = 0.95 |
| 手挥琵琶 | `mv_taijiquan_shouhui` | 4 | `aoe_single` · 1 | 1.05 | 8% | 1 | 1000 | `bf_waigong_jiang`·承·60%·2 | ✓ | 1.12 −0.06 |
| 进步搬拦捶 | `mv_taijiquan_banlan` | 5 | `aoe_dash n2` · 1–2 | 1.20 | 9% | 2 | 1000 | — | ✓ | 1.29 −0.10 |
| 如封似闭 | `mv_taijiquan_rufeng` | 6 | `aoe_self` | 0 | 8% | 3 | 800 | `bf_shoushi`·承·100%·2；`bf_xieli`·承·100%·2 | — | 架势 |
| 十字手（绝招） | `mv_taijiquan_shizi` | 10 | `aoe_single` · 1（2 段） | 2.85 | 10% | — | 1200 | `ultimate:true`；气势 100；`bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)`（参数 unarmed）·承·100%·2 | ✓ | `3.00−0.15=2.85`；`MoveDef{unlock:10; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 抱虎归山（绝招） | `mv_taijiquan_baohu` | 7 | `aoe_single` · 1 | 2.75 | 10% | — | 1200 | `ultimate:true`；气势 100；借力摔投：与目标换位（`swap`）；`bf_xuanyun`·承·40%·1 | ✓ | 3.0 −0.15 −0.10；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 云手（绝招） | `mv_taijiquan_yunshou` | 9 | `aoe_around` | 2.10 | 10% | — | 1200 | `ultimate:true`；气势 100；`bf_shiheng`·承·100%·1 | ✓ | `3.00×0.75−0.10=2.15`，手调为 2.10；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 借力打力 | `ps_taijiquan_jieli` | 1 | stat · Z3 | +6% → +15% | 对 `atkOut` 高于自身的目标（以条件增伤实现；"按对方攻击计算"的精确钩子见 §11 D-6） |
| 后发制人 | `ps_taijiquan_houfa` | 3 | effect | 见 06 | 装配时常驻 `bf_houfa`（06 §8.4：受近战攻击后以基础招式 ×0.6 反击，每回合 1 次；典型来源即太极拳） |
| 四两拨千斤 | `ps_taijiquan_siliang` | 5 | trigger · Z9 | +10pp | 招架成功时攻击者获得 `bf_shiheng` 1 回合（06 典型来源即太极拳），本次招架减免 +10pp |
| 以慢打快 | `ps_taijiquan_yiman` | 8 | stat | 暴击 +10；速度 −5% | 目标 `spd` 高于自身时本武学 `crit flat +10`；装配时自身 `attr:spd pct −5%` |
| 合太极 | `ps_taijiquan_hetaiji` | 10 | mechanic | — | 招式栏 +1；与太极剑同时装配时双方招式 Z3 +8%（`lg_taiji` 相生，05 §9.2 上限） |

#### `sk_taijijian` 太极剑（11 天中 · 兵器/剑 · 武当）

> **原著**：张三丰当众传授太极剑，张无忌将招式"忘得干干净净"后，以木剑应对八臂神剑方东白所持倚天剑；该段明确太极剑共五十四式，并见三环套月、大魁星、燕子抄水、左拦扫、右拦扫、指南针、持剑归原等名。笑傲中冲虚道长以太极剑与令狐冲对剑，剑招连环成圈。本文招式效果均为原创扩展；具体五十四式次序仍须核对**（待考：《倚天屠龙记》张三丰传太极剑段落）**。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 调和 · 0.50/0.50 |
| 原生书界 | 倚天（笑傲：残承 `partial`、`lineageGrade 10`，已采纳于基准 v1.1 §13 / V11-28；不计入笑傲完整原生天级池） |
| reqs | `attrs {wis 55, agi 50}`；`aptitude {apSword 55}`；`morality {min 10}`；`sect {sect_wudang, rank 4}`；`hard [sect, morality]` |
| layerStats | `{parry [4, 12], hit [2, 8]}`（20） |
| moveSlots | 5（10 重 6） |
| 层数要点 | 1 重三环套月、大魁星、"剑意不在招"；2 重燕子抄水；3 重左右拦扫、"圆转"；4 重抱剑守中；5 重剑圈、"以钝克锐"；6 重黏剑卸兵；**7 重太极生两仪（第一绝招）**；8 重"以静制动"；**9 重剑圈（第二绝招）**；**10 重黏剑卸兵（第三绝招）**、"忘招" |
| 获取 | ① `master`：张三丰（L4），maxLayer 10；② `qiyu`"太极剑传"（倚天主线：张三丰当众授剑，须完成"忘招"——闭关 1 日、期间不装配其他剑法，原创扩展仪式；占位 `q_04_main_88`），maxLayer 10；③ 笑傲印证（残承）：冲虚道长。进度门槛：倚天第 4 幕后 |
| setTags · conflicts | `[set_wudang_taiji]`；`{with: sk_taijiquan, type: synergy}`；受独孤九剑克制（笑傲令狐冲以独孤九剑寻得冲虚剑圈破绽，故本武学只削弱破剑、不免疫） |
| special | `fusible: true`；`observable: false` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 三环套月 | `mv_taijijian_sanhuan` | 1 | `aoe_single` · 1（3 段） | 1.15 | 9% | 1 | 1000 | — | ✓ | 1.17 |
| 大魁星 | `mv_taijijian_dakuixing` | 1 | `aoe_single` · 1 | 0.90 | 8% | 0 | 1000 | 自身 `bf_yuanzhuan`·承·100%·2 | ✓ | 1 −0.10 |
| 燕子抄水 | `mv_taijijian_yanzi` | 2 | `aoe_dash n3` · 1–3 | 1.20 | 9% | 2 | 1000 | — | ✓ | 1.29 −0.10 |
| 左右拦扫 | `mv_taijijian_lansao` | 3 | `aoe_cone {angle:120,r:1,dirCount:6}`（左右 2 段） | 1.00 | 9% | 1 | 1000 | — | ✓ | N=3、AF=0.85；0.85 × 1.17 = 0.99，取 1.00 |
| 抱剑守中（原创扩展命名） | `mv_taijijian_xiaokuixing` | 4 | `aoe_self`（架势） | 0 | 6% | 2 | 850 | `bf_jingshi`·承·100%；被近战攻击以 1.1 倍反击 | — | 触发型 |
| 剑圈（绝招；原创扩展命名，笑傲"剑圈"之说） | `mv_taijijian_jianquan` | 9 | `aoe_around` | 2.15 | 10% | — | 1200 | `ultimate:true`；气势 100；`bf_chizhi`·承·50%·2 | ✓ | `3.00×0.75−0.10×0.50=2.20`，手调为 2.15；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 黏剑卸兵（绝招；原创扩展命名） | `mv_taijijian_zhanjian` | 10 | `aoe_single` · 1 | 3.30 | 10% | — | 1200 | `ultimate:true`；气势 100；条件：目标持兵器；`bf_jiaoxie`·承·80% | ✓ | `3.00×(1+0.15)−0.20×0.80=3.29≈3.30`；目标持兵器按常见条件计入 `Σadj`；`MoveDef{unlock:10; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| 太极生两仪（绝招，原创扩展命名） | `mv_taijijian_liangyi` | 7 | `aoe_single` · 1 | 2.90 | 10% | — | 1200 | `ultimate:true`；气势 100；目标相邻六个六角格内的敌人 `bf_shiheng`·承·100%·1 | ✓ | 3.0 −0.10；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 剑意不在招 | `ps_taijijian_jianyi` | 1 | mechanic | ×0.7 | 本武学招式不可被观摩；敌方 `bf_pojian` 对本武学的 Z5 加成与招架乘数 ×0.7 |
| 圆转 | `ps_taijijian_yuanzhuan` | 3 | stat | 见 06 | 装配时常驻 `bf_yuanzhuan`（06 §8.1 典型来源即太极剑剑意） |
| 以钝克锐 | `ps_taijijian_yidun` | 5 | stat · Z3 / mechanic | +10% | 持木剑（`wooden`）时本武学 Z3 +10%，且免疫品阶 ≤ 本武学的 `bf_duanbing`（原著张无忌以木剑对倚天剑） |
| 以静制动 | `ps_taijijian_jingzhi` | 8 | trigger | — | 战斗开始获得 `bf_jingshi`（静势；06 §8.8 典型来源即太极剑，移动即清空） |
| 忘招（大成） | `ps_taijijian_wangzhao` | 10 | trigger · Z3 | 见 06 | 招式栏 +1；每使用一个本场尚未用过的本武学招式后获得 `bf_ruiyi` 1 回合（"忘得干干净净"——不拘成招） |

### 5.4 地阶条目卡

#### `sk_chunyangwuji` 纯阳无极功（8 地中 · 内功 · 武当）

> **原著**：纯阳无极功为武当内功名目；张三丰曾以本门内功为幼年张无忌疗玄冥寒毒而不能尽除，两者是否在原文中直接等同仍须核对**（待考：《倚天屠龙记》张无忌幼年中玄冥神掌、张三丰疗伤的段落）**。招式与被动为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | `nature: yang`；`wOut/wIn: 0/1` |
| 原生书界 | 倚天、笑傲★、侠客★、书剑★ |
| reqs | `attrs {con 45, wil 40, wis 40}`；`aptitude {apInner 45}`；`sect {id: sect_wudang, rank: 3}`；`prereq [{anyOf: [{skill: sk_liangyixinfa, layer: 5}, {skill: sk_taihegong, layer: 7}]}]`；`hard [sect, prereq]`（外层 AND、组内 OR，见 `decisions/rulings-v1.md` §4） |
| 内功贡献 | `mpMaxPct 32, hpMaxPct 18, attrs {con 5, str 3, wil 4}, mpRegen 1.8` → IP 83（= 地中预算）；`stats {resCold 10, resInjury 5}`（15） |
| InnerDef | `auxUsableMoves: [mv_chunyangwuji_quhan]` |
| 层数要点 | 1 重"纯阳"；2 重纯阳驱寒；4 重无极归一；5 重"寒邪难侵"；**7 重绝招纯阳真火**；8 重"无极"；10 重"纯阳大成" |
| 获取 | `master`：倚天宋远桥 `npc_songyuanqiao` / 俞莲舟 `npc_yulianzhou`，书剑陆菲青（武当L3），maxLayer 10；`manual` `it_miji_chunyangwuji`（笑傲★、侠客★武当藏经），maxLayer 8 |
| setTags · conflicts | `[set_wudang_zhenwu]`；`{with: sk_xuanming, type: counter}`：纯阳驱寒对玄冥寒毒 `bf_handu` 只能压制、不能根治（06 §8.5 寒毒唯九阳根治）；与武当九阳功同为阳，可成三运同源（05 §5.3） |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 纯阳驱寒 | `mv_chunyangwuji_quhan` | 2 | `aoe_single` · 0–1（友方） | 0 | 9% | 3 | 1000 | 驱散目标 2 个 `cold` 减益（品阶承；`bf_handu` 仅压制 2 回合）；回复 12% 气血 | — | 支援；可作辅运使用 |
| 无极归一（原创扩展命名） | `mv_chunyangwuji_guiyi` | 4 | `aoe_self` | 0 | 9% | 4 | 900 | `bf_hutizhenqi`·承·100%·3（hpMax 12%）；`bf_neijin_sheng`·承·100%·2 | — | 支援 |
| 纯阳真火（绝招，原创扩展命名） | `mv_chunyangwuji_zhenhuo` | 7 | 对敌 `aoe_around`；对友 `aoe_allies r2` | 1.50 | 9% | — | 1200 | `ultimate:true`；气势 100；友方各驱散 2 个 `cold` 减益，`bf_yuhan`·承·100%·3 | ✓ | N=6、AF=0.75；3.0 × 0.75 = 2.25，−0.75（友方驱散与增益）= 1.50；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 纯阳 | `ps_chunyangwuji_chunyang` | 1 | stat · 属性层 | `attr:resCold pp +3 → +10` | `auxMode: scaled` |
| 寒邪难侵 | `ps_chunyangwuji_hanxie` | 5 | effect | 每回合 −1 层 | 每回合开始驱散自身 1 层 `bf_hanqi`（`circulate` 等效，品阶承）；`auxMode: full` |
| 无极 | `ps_chunyangwuji_wuji` | 8 | stat · cost | −8% | 装配时武当门派武学招式耗内 −8% |
| 纯阳大成 | `ps_chunyangwuji_dacheng` | 10 | stat · 属性层 | `attr:atkIn pct +8%` | 仅主运 |

#### `sk_huzhaojuehushou` 虎爪绝户手（7 地下 · 拳脚/擒拿 · 武当）

> **原著**：张三丰早年所创、专拿要害的狠辣擒拿，后以其过于阴损而严禁门下轻用；俞莲舟与张无忌的授受关系仍须核对**（待考：《倚天屠龙记》俞莲舟向张无忌讲授或展示虎爪绝户手的段落）**。招式名为原创扩展；“绝户”之效本作抽象为“伤及根本”（创口难愈与内伤），不作具体描写。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阳 · 0.75/0.25 |
| 原生书界 | 倚天、笑傲★、侠客★ |
| reqs | `attrs {str 45, wis 40}`；`aptitude {apGrapple 45}`；`sect {sect_wudang, rank 4}`；`prereq [sk_wudangchangquan ≥ 6]`；`hard [sect, prereq]` |
| layerStats | `{seal [3, 10], crit [1, 5]}`（15） |
| 层数要点 | 1 重虎爪、拿腰眼、"虎威"；3 重猛虎扑食；4 重"扣腕夺兵"；5 重分筋断脉；**7 重绝招绝户一爪**；8 重"拿穴"；10 重"虎爪大成" |
| 获取 | `master`：俞莲舟（L4），maxLayer 10；`manual` `it_miji_huzhaojuehushou`（笑傲★武当藏经），maxLayer 7 |
| setTags · conflicts | `[set_wudang_zhenwu]`；无 |
| special | **门规代价**：对 `morality > −20` 的目标使用本武学招式，本场结束品德 −3（每场至多 1 次；原著张三丰禁门下轻用，原创扩展规则化）；`fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 虎爪 | `mv_huzhaojuehushou_huzhao` | 1 | `aoe_single` · 1 | 0.95 | 7% | 0 | 1000 | `bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)`（参数 unarmed）·承·25%·2 | ✓ | 1 −0.04 |
| 拿腰眼（原创扩展命名） | `mv_huzhaojuehushou_yaoyan` | 1 | `aoe_single` · 1 | 1.05 | 7% | 1 | 1000 | `bf_neishang`·承·50%·4 | ✓ | 1.12 −0.05 |
| 猛虎扑食 | `mv_huzhaojuehushou_pushi` | 3 | `aoe_dash n3` · 1–3 | 1.20 | 8% | 2 | 1000 | — | ✓ | 1.29 −0.10 |
| 分筋断脉 | `mv_huzhaojuehushou_fenjin` | 5 | `aoe_single` · 1 | 1.20 | 8% | 2 | 1000 | `bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)`（参数取目标主手类别）·承·60%·2 | ✓ | 1.29 −0.09 |
| 绝户一爪（绝招） | `mv_huzhaojuehushou_juehu` | 7 | `aoe_single` · 1 | 2.80 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_nanyu`·承·100%·3；`bf_neishang`·承·100%·4（7 层） | ✓ | 3.0 −0.10 −0.10；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 虎威 | `ps_huzhaojuehushou_huwei` | 1 | stat · Z3 | +5% → +12% | 对气血 < 50% 的目标 |
| 扣腕夺兵 | `ps_huzhaojuehushou_kouwan` | 4 | trigger | 10% | 命中持兵器目标时施加 `bf_jiaoxie` |
| 拿穴 | `ps_huzhaojuehushou_naxue` | 8 | trigger | 10% → 20% | 命中时施加 `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 1 回合 |
| 虎爪大成 | `ps_huzhaojuehushou_dacheng` | 10 | mechanic | — | 对身带 `bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)` 的目标，本武学招式不可被招架 |

#### `sk_wujixuangongquan` 无极玄功拳（7 地下 · 拳脚/拳掌 · 武当·书剑）

> **原著**：书剑中张召重所使武当拳法；招名与交手细节仍须核对**（待考：《书剑恩仇录》张召重与红花会群雄交手的段落）**。招式名为原创扩展；“火手判官”为张召重绰号。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阳 · 0.55/0.45 |
| 原生书界 | 书剑、笑傲★、侠客★ |
| reqs | `attrs {str 40, con 40, wis 40}`；`aptitude {apFist 45}`；`sect {sect_wudang, rank 4}`；`prereq [sk_mianzhang ≥ 5]`；`hard [prereq]` |
| layerStats | `{crit [1, 5], pierce [2, 10]}`（15） |
| 层数要点 | 1 重无极起手、玄功贯拳、"刚柔"；3 重连环三拳；5 重震山、"连击"；**7 重绝招火手判官**；10 重"大成" |
| 获取 | ① `master`：书剑武当长辈（L4，陆菲青不传此拳；马真一系**（待考：《书剑恩仇录》马真与张召重的师承段落）**），maxLayer 10；② `manual`：击败张召重得其拳谱 `it_miji_wujixuangongquan`（原创扩展），maxLayer 8；③ 投靠清廷线：张召重 `npc_zhangzhaozhong` 亲授（品德下降，原创扩展，占位 `q_12_faction_89`），maxLayer 10 |
| setTags · conflicts | `[set_wudang_zhenwu]`；无 |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 无极起手（原创扩展命名） | `mv_wujixuangongquan_qishou` | 1 | `aoe_single` · 1 | 1.00 | 7% | 0 | 1000 | — | ✓ | 基准 |
| 玄功贯拳 | `mv_wujixuangongquan_guanquan` | 1 | `aoe_single` · 1 | 1.15 | 8% | 1 | 1000 | `bf_neishang`·承·30%·4 | ✓ | 1.17 −0.03 |
| 连环三拳 | `mv_wujixuangongquan_lianhuan` | 3 | `aoe_single` · 1（3 段） | 1.30 | 8% | 2 | 1000 | — | ✓ | 1.29 |
| 震山 | `mv_wujixuangongquan_zhenshan` | 5 | `aoe_cone {r:2,angle:60,dirCount:6}` | 1.00 | 8% | 2 | 1000 | 击退 1 | ✓ | N=4、AF=0.80；0.80 × 1.29 = 1.03，−0.05 = 0.98，取 1.00 |
| 火手判官（绝招，取张召重绰号） | `mv_wujixuangongquan_huoshou` | 7 | `aoe_single` · 1 | 2.90 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_zhuoshao`·承·100%·2 | ✓ | 3.0 −0.10；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 刚柔 | `ps_wujixuangongquan_gangrou` | 1 | stat · Z2 | 5% → 12% | 本武学内劲部分无视内防 |
| 连击 | `ps_wujixuangongquan_lianji` | 5 | stat · 属性层 | `attr:combo pp +5` | |
| 大成 | `ps_wujixuangongquan_dacheng` | 10 | stat · Z6 | `attr:critDmg pp +15` | 仅本武学 |

#### `sk_rouyunjian` 柔云剑术（7 地下 · 兵器/剑 · 武当·书剑）

> **原著**：书剑中陆菲青所传武当剑法，李沅芷习之；张召重是否亦使仍须核对**（待考：《书剑恩仇录》陆菲青传李沅芷及张召重用剑的段落）**。招式名为原创扩展（取“云”字诗意）。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 调和 · 0.60/0.40 |
| 原生书界 | 书剑、笑傲★、侠客★、飞狐★ |
| weaponReq | `{category: sword}` |
| reqs | `attrs {agi 40, wis 40}`；`aptitude {apSword 45}`；`sect {sect_wudang, rank 3}`（陆菲青羁绊线免）；`prereq [sk_zhenwujian ≥ 5]`；`hard [prereq]` |
| layerStats | `{parry [2, 8], hit [1, 7]}`（15） |
| 层数要点 | 1 重流云、云出无心、"以柔克刚"；3 重缠云；5 重云深不知处、"绵绵"；**7 重绝招柔云万里**；10 重"柔云大成" |
| 获取 | `master`：陆菲青 `npc_lufeiqing`（书剑，羁绊 ≥ 3 或武当L3，占位 `q_12_bond_90`），maxLayer 10；李沅芷 `npc_liyuanzhi` 转授，maxLayer 7；笑傲★/侠客★/飞狐★武当拜师，maxLayer 9 |
| setTags · conflicts | `[]`；无 |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 流云 | `mv_rouyunjian_liuyun` | 1 | `aoe_single` · 1 | 1.00 | 7% | 0 | 1000 | — | ✓ | 基准 |
| 云出无心（取陶渊明"云无心以出岫"） | `mv_rouyunjian_chuxiu` | 1 | `aoe_line n2` | 1.00 | 7% | 1 | 1000 | — | ✓ | N=2、AF=0.90；0.90 × 1.12 = 1.008 ≈ 1.00 |
| 缠云 | `mv_rouyunjian_chanyun` | 3 | `aoe_single` · 1 | 1.20 | 8% | 2 | 1000 | `bf_shouqin(level:4,holdRange:1)`·承·40%·2 | ✓ | 1.29 −0.08 |
| 云深不知处（取贾岛诗） | `mv_rouyunjian_yunshen` | 5 | `aoe_behind r2` | 1.00 | 8% | 2 | 1000 | 绕背出招（背击 Z7） | ✓ | 0.90 × 1.29 = 1.16，−0.15 |
| 柔云万里（绝招） | `mv_rouyunjian_wanli` | 7 | `aoe_cone {r:3,angle:60,dirCount:6}` | 2.05 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_chizhi`·承·50%·2 | ✓ | N=7、AF=0.70；3.0 × 0.70 = 2.10，−0.05 = 2.05；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 以柔克刚 | `ps_rouyunjian_rougang` | 1 | stat · Z3 | +5% → +12% | 对主手为刀、棍杖、枪的目标 |
| 绵绵 | `ps_rouyunjian_mianmian` | 5 | stat · 属性层 | `attr:combo pp +5` | |
| 柔云大成 | `ps_rouyunjian_dacheng` | 10 | trigger | 30% | 本武学招式被招架时追加一击 ×0.5（`followup`） |

#### `sk_shenmen13` 神门十三剑（7 地下 · 兵器/剑 · 武当）

> **原著**：张三丰所创剑法，十三招皆刺敌手腕“神门穴”；使用者与情节位置仍须核对**（待考：《倚天屠龙记》神门十三剑出场段落）**。招式名为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阳 · 0.70/0.30 |
| 原生书界 | 倚天、笑傲★、侠客★、书剑★ |
| reqs | `attrs {agi 40, wis 40}`；`aptitude {apSword 45}`；`sect {sect_wudang, rank 4}`；`prereq [sk_zhenwujian ≥ 5]`；`hard [sect, prereq]` |
| layerStats | `{hit [2, 8], crit [1, 7]}`（15） |
| 层数要点 | 1 重刺神门、连刺、"神门"；3 重封腕；5 重夺兵、"十三式"；**7 重绝招十三剑连环**；10 重"大成" |
| 获取 | `master`：武当（L4），maxLayer 10；`manual` `it_miji_shenmen13`，maxLayer 8 |
| setTags · conflicts | `[set_wudang_zhenwu]`；无 |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 刺神门 | `mv_shenmen13_cixue` | 1 | `aoe_single` · 1 | 0.95 | 7% | 0 | 1000 | `bf_jiaoxie`·承·10%（仅持兵器目标） | ✓ | 1 −0.025 |
| 连刺 | `mv_shenmen13_lianci` | 1 | `aoe_single` · 1（2 段） | 1.10 | 7% | 1 | 1000 | — | ✓ | 1.12 |
| 封腕 | `mv_shenmen13_fengwan` | 3 | `aoe_single` · 1 | 1.20 | 8% | 2 | 1000 | `bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)`（参数 weapon）·承·50%·2 | ✓ | 1.29 −0.075 |
| 夺兵 | `mv_shenmen13_duobing` | 5 | `aoe_single` · 1 | 1.35 | 8% | 2 | 1000 | 条件：目标持兵器；`bf_jiaoxie`·承·40% | ✓ | 1.44 −0.10 |
| 十三剑连环（绝招，原创扩展命名） | `mv_shenmen13_shisan` | 7 | `aoe_single` · 1（13 段） | 2.85 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_jiaoxie`·承·60% | ✓ | 3.0 −0.15；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 神门 | `ps_shenmen13_shenmen` | 1 | stat · 属性层 | `attr:hit flat +4 → +10` | 对持兵器目标 |
| 十三式 | `ps_shenmen13_shisan` | 5 | stat · Z3 | +15% | 对已被缴械（`bf_jiaoxie`）的目标 |
| 大成 | `ps_shenmen13_dacheng` | 10 | effect | +10% | 本武学施加 `bf_jiaoxie` 的概率 +10% |

#### `sk_yitiantulonggong` 倚天屠龙功（8 地中 · 兵器/奇门（判官笔 · 钩）· 武当·张三丰 → 张翠山）

> **原著**：俞岱岩重伤后，张三丰夜间以“武林至尊，宝刀屠龙，号令天下，莫敢不从。倚天不出，谁与争锋”二十四字创出一路书法武功，张翠山在旁看得入神而得其传；后张翠山于王盘山岛以银钩铁划在石壁上书此二十四字，震慑群豪。兵刃名称字形仍须核对**（待考：《倚天屠龙记》张三丰创倚天屠龙功及张翠山王盘山题壁的段落）**。招式按二十四字分六句（原创扩展结构）。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 调和 · 0.55/0.45 |
| 原生书界 | 倚天 |
| weaponReq | `{category: exotic, kinds: [brush, hook]}`；副手持另一件（钩 / 笔）时 1 重被动生效（双兵，design/10） |
| reqs | `attrs {wis 45, str 40}`；`aptitude {apExotic 45}`；`sect {id: sect_wudang, rank: 4}`（张翠山羁绊线免）；`skills {art: 40}`；`hard [sect]`。书画为默认软门槛，字段与范围见 `decisions/rulings-v1.md` §4 |
| layerStats | `{crit [2, 7], hit [2, 8]}`（15） |
| 层数要点 | 1 重武林至尊、宝刀屠龙、"银钩铁划"；2 重号令天下；4 重莫敢不从、"书法入武"；5 重倚天不出；**7 重谁与争锋（第一绝招）**、"题壁"；**9 重号令天下（第二绝招）**；10 重"大成" |
| 获取 | ① `master`：张翠山 `npc_zhangcuishan`（倚天前段在世时，羁绊 ≥ 3，占位 `q_04_bond_91`；锚点事件后窗口关闭），maxLayer 10；② `puzzle`：王盘山岛石壁拓字（`art ≥ 40`，占位 `q_04_qiyu_92`），maxLayer 8；③ `master`：张三丰（武当L4），maxLayer 10 |
| setTags · conflicts | `[set_wudang_zhenwu]`；无 |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 武林至尊 | `mv_yitiantulonggong_wulin` | 1 | `aoe_single` · 1（4 段） | 1.00 | 7% | 0 | 1000 | — | ✓ | 基准 |
| 宝刀屠龙 | `mv_yitiantulonggong_tulong` | 1 | `aoe_single` · 1 | 1.10 | 8% | 1 | 1000 | `bf_pojia`·承·50%·2 | ✓ | 1.17 −0.05 |
| 号令天下（绝招；提升既有招式） | `mv_yitiantulonggong_haoling` | 9 | `aoe_cone {r:2,angle:60,dirCount:6}` | 2.30 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_zhenshe`·承·100%·1 | ✓ | `3.00×0.80−0.10=2.30`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 莫敢不从 | `mv_yitiantulonggong_mogan` | 4 | `aoe_single` · 1 | 1.20 | 8% | 2 | 1000 | `bf_kongju`·承·30%·1 | ✓ | 1.29 −0.075 |
| 倚天不出 | `mv_yitiantulonggong_yitian` | 5 | `aoe_self`（架势） | 0 | 7% | 3 | 850 | `bf_shoushi`·承·100%·2；被近战攻击以 1.0 倍反击 | — | 架势 |
| 谁与争锋（绝招，二十四字一气呵成） | `mv_yitiantulonggong_zhengfeng` | 7 | `aoe_line n4` | 2.20 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_zhenshe`·承·50%·1 | ✓ | 3.0 × 0.75 = 2.25，−0.05；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 银钩铁划 | `ps_yitiantulonggong_yingou` | 1 | stat · Z3 | +5% → +12% | 主手钩 / 笔、副手持另一件时 |
| 书法入武 | `ps_yitiantulonggong_shufa` | 4 | stat · 属性层 | 每 10 点 `art` → `crit flat +1`（上限 +10） | 书画技艺入武 |
| 题壁 | `ps_yitiantulonggong_tibi` | 7 | mechanic | — | 近身招式可借相邻墙体 / 崖壁跃击高处目标（高差 ≤ `jump + 2`），不受低打高惩罚（致敬王盘山石壁书字） |
| 大成 | `ps_yitiantulonggong_dacheng` | 10 | effect | +10% | 本武学附带心神类效果（震慑、恐惧）的概率 +10% |

#### `sk_tiyunzong` 梯云纵（8 地中 · 轻功 · 武当）

> **原著**：武当轻功，身子拔起后可凌空借势再纵；张翠山题壁是否属该轻功表现仍须核对**（待考：《倚天屠龙记》王盘山题壁及武当人物施展梯云纵的段落）**。招式名为原创扩展。按 05 §14.6 #7，笑傲 / 侠客 / 书剑 / 飞狐本书界最高原生轻功为地中，本功即其一。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阳 · 0.80/0.20 |
| 原生书界 | 倚天、笑傲★、侠客★、书剑★、飞狐★ |
| 轻功数值 | `Q_skill = QS(8) = 104`（10 重） |
| reqs | `attrs {agi 45, wis 40}`；`aptitude {apLight 40}`；`sect {sect_wudang, rank 3}`；`prereq [sk_wudangyunbu ≥ 5]`；`hard [sect, prereq]` |
| 层数要点 | 1 重拔身、"凌空"；3 重梯云；4 重"借劲再纵"；5 重纵跃击；**7 重扶摇直上（第一绝招）**；8 重"居高"；10 重"大成" |
| 获取 | `master`：武当（L3），maxLayer 10 |
| setTags · conflicts | `[set_wudang_taiji]`；无 |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 拔身（原创扩展命名） | `mv_tiyunzong_bashen` | 1 | `aoe_self` | 0 | 5% | 2 | 800 | `bf_tengyue`·承·100%·3；本次行动移动力 +1 | — | 功能 |
| 梯云 | `mv_tiyunzong_tiyun` | 3 | `aoe_self`（跃至 4 格内落点，越过单位） | 0 | 6% | 3 | 800 | 落点高差 ≤ `jump + 3` | — | 位移 |
| 纵跃击（原创扩展命名） | `mv_tiyunzong_zongyue` | 5 | `aoe_leap` · 1–3 | 1.05 | 8% | 2 | 1000 | `ultimate:false` | ✓ | 普通招：`0.90×1.29−0.10=1.061≈1.05`；`MoveDef{unlock:5; ultimate:false; mpCost:8%; cd:2; recovery:1000}` |
| 扶摇直上（绝招，取《逍遥游》） | `mv_tiyunzong_fuyao` | 7 | `aoe_self` | 0 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_shenqing`·承·100%·3；`bf_piaohu`·承·100%·3；本次行动额外移动 4 格（可越障） | — | 功能；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 凌空 | `ps_tiyunzong_lingkong` | 1 | stat · 属性层 | `attr:jump flat +1`（7 重起 +2） | |
| 借劲再纵 | `ps_tiyunzong_jiejin` | 4 | mechanic | −25% | 探索攀崖 / 跨沟体力 −25%；战斗中跃上高差不额外耗移动力（08） |
| 居高 | `ps_tiyunzong_jugao` | 8 | stat · 属性层 | `attr:eva pct +8%` | 所在格高于目标 ≥ 2 级时 |
| 大成 | `ps_tiyunzong_dacheng` | 10 | stat · 属性层 | `attr:mov flat +1` | |

#### `sk_zhenwuqijie` 真武七截阵（8 地中 · 杂学/阵法（合击）· 武当）

> **原著**：张三丰从武当山龟、蛇二山的形势得到启发，为七名弟子创真武七截阵；二人合力已兼具攻守，人数增加则威力递增，七人齐出为完整阵势。《倚天屠龙记》中七侠后来因俞岱岩残废、张翠山身故而无法七人齐聚；具体倍数原文仍须核对**（待考：《倚天屠龙记》介绍真武七截阵及七侠缺员的段落）**。玩家侧四人起阵、六人近满及虚拟阵位均为**（原创扩展）**；运行接口见 `design/09` §6.8，该文尚存旧阈值时以 `decisions/rulings-v1.md` C13 为准。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阳 · 0.55/0.45 |
| 原生书界 | 倚天、笑傲★、侠客★ |
| reqs | `attrs {wis 40, wil 40}`；`sect {id: sect_wudang, rank: 4}`；`prereq [{anyOf: [{skill: sk_wudangchangquan, layer: 5}, {skill: sk_mianzhang, layer: 5}, {skill: sk_wudangjiemaishou, layer: 5}, {skill: sk_taijituishou, layer: 5}, {skill: sk_huzhaojuehushou, layer: 5}, {skill: sk_wujixuangongquan, layer: 5}, {skill: sk_taijiquan, layer: 5}, {skill: sk_zhenwujian, layer: 5}, {skill: sk_rouyunjian, layer: 5}, {skill: sk_raozhirou, layer: 5}, {skill: sk_shenmen13, layer: 5}, {skill: sk_yitiantulonggong, layer: 5}, {skill: sk_taijijian, layer: 5}]}]`；`hard [sect, prereq]`（任一武当拳脚或兵器达到 5 重；外层 AND、组内 OR，见 `decisions/rulings-v1.md` §4）；技艺 `formation` 参与阵法强度但不另设学习下限 |
| layerStats | `{parry [2, 7], resCC [2, 8]}`（15；仅阵中） |
| 层数要点 | 1 重结阵、龟蛇合击、"倍增"；4 重玄龟守；5 重灵蛇进、"龟蛇相济"；**7 重七截归真（第一绝招）**；**9 重龟蛇合击（第二绝招）**；10 重"真武坐镇" |
| 获取 | 武当门派任务链"真武七截"（倚天，原创扩展，占位 `q_04_faction_93`），maxLayer 10；`combo` 合击领悟（阵主与至少 3 名合格武当同门、共 4 个实际单位合击 5 次）；笑傲★、侠客★武当长老传授，maxLayer 8 |
| setTags · conflicts | `[set_wudang_zhenwu]`；无 |
| special | `formation`：`minMembers: 4`、`dissolveBelow: 4`、`durationOwnerTurns: 3`、`maxSlots: 7`；阵中光环：阵员常驻 `bf_zhuiji`，相邻阵员互得 `bf_yuanhu`；10 重在已有 6 个实际单位时补 1 个虚拟阵位；`fusible: false`；计入 05 §14.6"地阶合击类 ≤ 3%" |

**阵法规则 `special.formation`**（原创扩展改编；与 `design/09` §6.8 对接）

| 规则 | 值 |
|---|---|
| 阵员 | 同阵营、装配本武学、未倒地且未受硬控的实际单位；起阵与维持均只计这些有效实际单位 |
| 成阵 | `minMembers: 4`：阵主 3 格内有效实际阵员 ≥ 4（含阵主），且每名阵员 2 格内至少另有 1 名有效阵员 |
| 七人之数 | 原著完整阵势为七人。玩家上场 ≤ 6，故 6 个实际单位为“近满阵”；仅阵主本武学有效 10 重且已有 6 个实际单位时生成 1 个虚拟阵位。虚位不降低四人门槛，不增加单位、CT、追击或反击次数；虚实总阵位上限 7 |
| 阵中光环 | 阵员常驻 `bf_zhuiji`；相邻阵员互得 `bf_yuanhu`（每回合 1 次） |
| 持续与阵散 | 持续 3 次阵主行动；每次相关状态变化后复核。有效实际阵员 `< 4`（`dissolveBelow: 4`）、阵主倒地或受硬控时立即阵破；其他阵员失格则按余下实际单位重算 |
| 倍增 | `bonusZ3 = min(0.25, (slotCount - 1) × perSlotBonus)`；`slotCount` 为有效实际单位数加可用虚位，封顶 7；`perSlotBonus` 随层数由 3% 成长至 5%。这是线性加成，不作原著描述的指数倍乘 |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 结阵 | `mv_zhenwuqijie_jiezhen` | 1 | `aoe_allies r3` | 0 | 6% | 5 | 900 | 成阵 3 次阵主行动（须 4 个有效实际单位） | — | 功能 |
| 龟蛇合击（绝招；提升既有招式） | `mv_zhenwuqijie_guishe` | 9 | `aoe_single` · 1 | 3.35 | 9% | — | 1200 | `ultimate:true`；气势 100；条件：目标与 ≥ 2 名阵员相邻；`bf_suoding`·承·100%·2 | ✓ | `3.00×(1+0.15)−0.10（锁定）=3.35`；阵中邻接按常见条件计入 `Σadj`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 玄龟守（原创扩展命名） | `mv_zhenwuqijie_guishou` | 4 | `aoe_self`（架势） | 0 | 7% | 3 | 800 | 自身 `bf_shoushi`·承·100%·2；全体阵员 `bf_yuanhu`·承·100%·2 | — | 架势 |
| 灵蛇进（原创扩展命名） | `mv_zhenwuqijie_shejin` | 5 | `aoe_dash n3`（`through`） | 0.95 | 8% | 2 | 1000 | 穿过并伤及路径上全部敌人 | ✓ | 0.80 × 1.29 = 1.03，−0.10 |
| 七截归真（绝招，原创扩展命名） | `mv_zhenwuqijie_guizhen` | 7 | `aoe_single` · 1–2 | 2.70 | 9% | — | 1200 | `ultimate:true`；气势 100；距目标 ≤ 2 的其余阵员各追加一击（基础招式 ×0.4，`followup`） | ✓ | 3.0 −0.30（阵员追击价值）；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 倍增 | `ps_zhenwuqijie_beizeng` | 1 | stat · Z3 | `min(25%, (slotCount−1)×(3%→5%))` | 仅阵中；虚实阵位合计最多 7，线性计算 |
| 龟蛇相济 | `ps_zhenwuqijie_xiangji` | 5 | trigger | ×0.6 | 阵员被攻击后相邻阵员以基础招式 ×0.6 反击（每阵每回合 1 次） |
| 真武坐镇 | `ps_zhenwuqijie_zuozhen` | 10 | mechanic | — | 仅 6 个有效实际单位在阵时补 1 个虚拟阵位；不改变起阵/维持门槛，不增加行动、追击或反击 |

### 5.5 玄阶 · 黄阶（紧凑表）

**`sk_taihegong` 太和功**（2 黄中 · 内功 · 调和 · 原创扩展；武当山古称太和山）
- `nature: harmony`。
- 内功贡献：`mpMaxPct 8, hpMaxPct 5, attrs {wil 2, con 1}, mpRegen 1.0`（IP 24）；`stats {effRes 3, resInjury 3}`；无招式。
- reqs：`sect {sect_wudang, rank 1}`；`hard [sect]`。获取：武当拜师；连城★ / 鸳鸯★游方武当道人岗位槽（maxLayer 8）。
- 被动：`ps_taihegong_taihe` 太和（1 重，运功调息回内 +5% → +10%）；`ps_taihegong_chonghe` 冲和（5 重，阴阳相冲的"内息相冲"判定概率 −50%，05 §5.4）；`ps_taihegong_yuanman` 圆满（10 重，两仪心法软门槛 −10）。

**`sk_liangyixinfa` 两仪心法**（5 玄中 · 内功 · 调和 · 原创扩展；取"太极生两仪"）
- `nature: harmony`。
- 内功贡献：`mpMaxPct 17, hpMaxPct 10, attrs {wil 3, wis 2, con 2}, mpRegen 1.5`（IP 48.5）；`stats {parry 5, effRes 5}`。
- reqs：`attrs {wil 25}`；`aptitude {apInner 25}`；`sect {sect_wudang, rank 2}`；`prereq [sk_taihegong ≥ 4]`；`hard [sect]`。获取：拜师；秘籍 `it_miji_liangyixinfa`（maxLayer 8）。`setTags: [set_wudang_taiji]`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 两仪化劲 | `mv_liangyixinfa_huajin` | 3 | `aoe_self` | 0 | 6% | 3 | 800 | `bf_xieli`·承·100%·2 | — |

- 被动：`ps_liangyixinfa_xiangsheng` 两仪相生（1 重，主运时阳招、阴招相性各 +2%，Z5）；`ps_liangyixinfa_yuanzhuan` 化圆（5 重，招架成功时 20% 获得 `bf_yuanzhuan` 1 回合）；`ps_liangyixinfa_yuanman` 圆满（10 重，太极拳、太极剑修炼 +10%）。

**`sk_wudangchangquan` 武当长拳**（1 黄下 · 拳脚/拳掌 · 阳 · 0.85/0.15 · 原著）
- 原著：武当入门拳法；张无忌幼时是否明确习得仍须核对**（待考：《倚天屠龙记》张无忌幼年随父母回中土及武当疗伤段落）**。招式名为原创扩展。
- reqs：`sect {sect_wudang, rank 1}`；`hard [sect]`。layerStats `{hit [1, 3], parry [1, 3]}`。获取：拜师；连城★ / 鸳鸯★。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 冲拳 | `mv_wudangchangquan_chongquan` | 1 | `aoe_single` · 1 | 1.00 | 5% | 0 | 1000 | — | ✓ |
| 穿掌劈拳 | `mv_wudangchangquan_piquan` | 4 | `aoe_line n2` | 0.95 | 5% | 1 | 1000 | — | ✓ |
| 翻身劈 | `mv_wudangchangquan_fanshen` | 7 | `aoe_single` · 1 | 1.25 | 5% | 2 | 1000 | — | ✓ |

- 核算：穿掌劈拳 0.85 × 1.12；翻身劈 1 + 0.24。被动：`ps_wudangchangquan_quanjia` 拳架（5 重，`attr:resCC pp +5`）；`ps_wudangchangquan_yuanman` 入门圆满（10 重，首次练满拳掌资质永久 +1——全游戏一次，与 05 罗汉拳同类奖励不叠加；武当拳脚软门槛 −10）。

**`sk_mianzhang` 绵掌**（5 玄中 · 拳脚/拳掌 · 调和 · 0.45/0.55 · 原著）
- 原著：武当绵掌之名；使用者及陆菲青“绵里针”称号是否与绵掌、芙蓉金针直接相应仍须核对**（待考：《倚天屠龙记》武当弟子用掌段落；《书剑恩仇录》陆菲青出场与授艺段落）**。05 §9.2 已定：与铁砂掌刚柔相冲。
- reqs：`attrs {con 25}`；`aptitude {apFist 25}`；`sect {sect_wudang, rank 2}`；`prereq [sk_wudangchangquan ≥ 4]`；`hard [sect]`。layerStats `{defIn [1, 5], parry [1, 5]}`。获取：拜师；书剑陆菲青；连城★ / 鸳鸯★。`setTags: [set_wudang_taiji]`；`conflicts: {with: sk_tieshazhang, type: clash}`（双方招式 −10%，05 §9.2）。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 绵里藏针 | `mv_mianzhang_mianli` | 1 | `aoe_single` · 1 | 1.00 | 6% | 0 | 1000 | `bf_neishang`·承·20%·4 | ✓ |
| 连绵 | `mv_mianzhang_lianmian` | 3 | `aoe_single` · 1（3 段） | 1.15 | 7% | 1 | 1000 | — | ✓ |
| 柔掌卸劲 | `mv_mianzhang_xiejin` | 5 | `aoe_self`（架势） | 0 | 5% | 2 | 850 | 被近战攻击以 0.9 倍反击并施加 `bf_waigong_jiang` 1 回合 | — |
| 绵绵不绝 | `mv_mianzhang_mianmian` | 7 | `aoe_single` · 1 | 1.15 | 7% | 2 | 1000 | `bf_neishang`·承·70%·4（2 层） | ✓ |

- 核算：绵里藏针 1 − 0.02；连绵 1.17；绵绵不绝 1.29 − 0.14。被动：`ps_mianzhang_mianjin` 绵劲（4 重，本武学内劲部分无视内防 4% → 10%，Z2）；`ps_mianzhang_anjin` 暗劲（8 重，对带 `injury` 标签目标 Z3 +8%）；`ps_mianzhang_dacheng` 大成（10 重，`attr:combo pp +5`）。

**`sk_wudangjiemaishou` 武当截脉手**（5 玄中 · 拳脚/指法 · 阳 · 0.40/0.60 · 原创扩展）
- 依据：武当点穴截脉之术（原创扩展命名）；06 §8.7 封内力、封轻功条目中"点气海穴""点环跳穴"两个原创招名即出于本武学。
- reqs：`attrs {wis 25}`；`aptitude {apFinger 25}`；`sect {sect_wudang, rank 2}`；`prereq [sk_wudangchangquan ≥ 4]`；`hard [sect]`。layerStats `{seal [2, 6], hit [1, 4]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 截脉 | `mv_wudangjiemaishou_jiemai` | 1 | `aoe_single` · 1 | 0.95 | 6% | 0 | 1000 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)`·承·25%·1 | ✓ |
| 点气海 | `mv_wudangjiemaishou_qihai` | 3 | `aoe_single` · 1 | 1.20 | 7% | 2 | 1000 | `bf_xueweishoufeng(level:8,acupointRef:sourcePrimary)`·承·40%·2 | ✓ |
| 点环跳 | `mv_wudangjiemaishou_huantiao` | 5 | `aoe_single` · 1–2（`ranged` 指风） | 0.95 | 7% | 1 | 1000 | `bf_fengqinggong`·承·50%·2 | ✓ |
| 解穴 | `mv_wudangjiemaishou_jiexue` | 7 | `aoe_single` · 1（友方） | 0 | 5% | 2 | 1000 | 驱散目标全部 `seal` 减益（`acupoint` 解穴，品阶承；06 §7.1） | — |

- **AR-16 外放字段**：`mv_wudangjiemaishou_huantiao` 明确以指风隔空点穴，`MoveDef{projection:true; range:{min:1,max:2}; aoe:{tpl:aoe_single}; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; meridianRouteRef:mfr_wudangjiemaishou_huantiao}`；伤害段为 `DamageKind='projected'`。路线改为六段阳性显式路线，并由曲池收束至指端商阳；截脉、点气海须接触，解穴为支援，均不标。

- 核算：截脉 1 − 0.05；点气海 1.29 − 0.08；点环跳 1.17 × 0.85 = 0.99，−0.05。被动：`ps_wudangjiemaishou_renxue` 认穴（1 重，`attr:seal pp +2 → +6`）；`ps_wudangjiemaishou_jiemai` 截脉（5 重，对被点穴目标 Z3 +8%）；`ps_wudangjiemaishou_dacheng` 大成（10 重，本武学施加的 `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 持续 +1，上限 2）。

**`sk_taijituishou` 太极推手**（6 玄上 · 拳脚/擒拿 · 调和 · 0.40/0.60 · 原创扩展）
- 依据：太极拳理"以柔克刚、借力打力"（倚天太极拳一节）；"推手""沾连黏随""引进落空"为后世太极拳术语，原创扩展引入作太极拳的中阶练法。
- reqs：`attrs {wis 30}`；`aptitude {apGrapple 30}`；`sect {sect_wudang, rank 3}`；`prereq [sk_mianzhang ≥ 4]`；`hard [sect]`。layerStats `{parry [2, 6], counter [1, 4]}`。`setTags: [set_wudang_taiji]`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 沾粘 | `mv_taijituishou_zhan` | 1 | `aoe_single` · 1 | 0.95 | 6% | 0 | 1000 | `bf_chizhi`·承·40%·2 | ✓ |
| 引进落空 | `mv_taijituishou_yinjin` | 3 | `aoe_self`（架势） | 0 | 5% | 2 | 850 | 被近战攻击：攻击者 `bf_shiheng`·承·100%·1，并以 0.8 倍反击 | — |
| 推 | `mv_taijituishou_tui` | 5 | `aoe_knock n2` | 0.95 | 6% | 1 | 1000 | 击退 2 | ✓ |
| 化劲摔（绝招；提升既有招式，原创扩展命名） | `mv_taijituishou_shuai` | 7 | `aoe_swap` · 1 | 2.65 | 8% | — | 1200 | `ultimate:true`；气势 100；与目标换位；`bf_shiheng`·承·100%·1 | ✓；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- 核算：沾粘 1 − 0.04；推 0.95 × 1.12 = 1.06，−0.10；化劲摔 0.85 × 1.24 = 1.05，−0.15 −0.05。被动：`ps_taijituishou_zhanlian` 沾连黏随（1 重，`attr:parry pct +2% → +6%`）；`ps_taijituishou_luokong` 落空（5 重，招架成功时 30% 使攻击者获得 `bf_waigong_jiang` 1 回合）；`ps_taijituishou_yuanman` 圆满（10 重，太极拳软门槛 −10、修炼 +10%）。

**`sk_zhenwujian` 真武剑法**（3 黄上 · 兵器/剑 · 阳 · 0.75/0.25 · 原创扩展）
- reqs：`sect {sect_wudang, rank 1}`；`hard [sect]`。layerStats `{parry [1, 3], hit [1, 3]}`。获取：拜师；连城★ / 鸳鸯★。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 真武起手 | `mv_zhenwujian_qishou` | 1 | `aoe_single` · 1 | 1.00 | 5% | 0 | 1000 | — | ✓ |
| 龟蛇盘 | `mv_zhenwujian_guishe` | 4 | `aoe_self`（架势） | 0 | 4% | 2 | 850 | 被近战攻击以 0.8 倍反击 | — |
| 真武荡魔 | `mv_zhenwujian_dangmo` | 7 | `aoe_line n2` | 1.00 | 6% | 1 | 1000 | — | ✓ |

- 核算：真武荡魔 0.85 × 1.17 = 0.99。被动：`ps_zhenwujian_jianshou` 剑守（5 重，`attr:parry pct +3%`）；`ps_zhenwujian_yuanman` 入门圆满（10 重，武当剑法软门槛 −10）。

**`sk_raozhirou` 绕指柔剑**（6 玄上 · 兵器/剑 · 阴 · 0.45/0.55 · 原著）
- 原著：武当剑法，取“百炼钢化为绕指柔”之意，以内力运剑、剑刃弯转绕过招架；使用者与情节位置仍须核对**（待考：《倚天屠龙记》武当门人施展绕指柔剑的段落）**。
- reqs：`attrs {agi 30}`；`aptitude {apSword 30, apInner 25}`；`sect {sect_wudang, rank 3}`；`prereq [sk_zhenwujian ≥ 5]`；`hard [sect]`。layerStats `{hit [1, 5], pierce [1, 5]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 绕指 | `mv_raozhirou_raozhi` | 1 | `aoe_single` · 1 | 0.95 | 6% | 1 | 1000 | — | ✗ |
| 百炼 | `mv_raozhirou_bailian` | 3 | `aoe_single` · 1（2 段） | 1.15 | 7% | 1 | 1000 | — | ✓ |
| 绕背刺 | `mv_raozhirou_raobei` | 5 | `aoe_behind r1` | 1.00 | 7% | 2 | 1000 | 绕背出招（背击 Z7） | ✓ |
| 化刚为柔（绝招；提升既有招式） | `mv_raozhirou_huagang` | 7 | `aoe_self`（架势） | 0 | 8% | — | 1200 | `ultimate:true`；气势 100；`bf_yuanzhuan`·承·100%·3；被近战攻击以 1.0 倍反击 | —；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- 核算：绕指 1.12 × 0.85 = 0.95；百炼 1.17；绕背刺 0.90 × 1.29 = 1.16，−0.15。被动：`ps_raozhirou_rou` 柔剑（1 重，对处于守势 `stance.def` 的目标 Z3 +5% → +10%）；`ps_raozhirou_tongyi` 同意（5 重，与软剑意同时装配时 `attr:combo pp +5`，相生）；`ps_raozhirou_dacheng` 大成（10 重，本武学招式被招架时招架减免 −50%，Z9）。

**`sk_wudangyunbu` 武当云步**（3 黄上 · 轻功 · 阳 · 原创扩展）——`Q_skill = QS(3) = 45` 满层。
- reqs：`sect {sect_wudang, rank 1}`；`hard [sect]`。获取：拜师；连城★ / 鸳鸯★。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 云步 | `mv_wudangyunbu_yunbu` | 1 | `aoe_self` | 0 | 4% | 3 | 800 | `bf_piaohu`·承·100%·2；本次行动移动力 +1 | — |

- 被动：`ps_wudangyunbu_qingling` 轻灵（4 重，`attr:eva pct +2% → +4%`）；`ps_wudangyunbu_yuanman` 圆满（10 重，梯云纵软门槛 −10）。

**`sk_furongjinzhen` 芙蓉金针**（6 玄上 · 暗器 · 阳 · 0.70/0.30 · 原著）
- 原著：陆菲青独门暗器，李沅芷亦得传；针形与使用细节仍须核对**（待考：《书剑恩仇录》陆菲青、李沅芷使用芙蓉金针的段落）**。弹药 `it_furongjinzhen`（建议 ID）。预算按 §3.4 暗器约定。
- reqs：`aptitude {apHidden 30}`；`sect {sect_wudang, rank 2}`（陆菲青羁绊线免）；`hard []`。layerStats `{hit [1, 5], seal [1, 5]}`。获取：陆菲青 / 李沅芷传授（书剑），maxLayer 10；飞狐★武当，maxLayer 8。`setTags: []`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 金针 | `mv_furongjinzhen_jinzhen` | 1 | `aoe_bolt` · 1–5 | 0.75 | 6% | 0 | 1000 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)`·承·15%·1 | ✗ |
| 芙蓉满枝 | `mv_furongjinzhen_manzhi` | 3 | `aoe_multi n4 r1` · 1–4 | 0.85 | 7% | 2 | 1000 | — | ✗ |
| 打穴金针 | `mv_furongjinzhen_daxue` | 5 | `aoe_bolt` · 1–4 | 0.90 | 7% | 2 | 1000 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)`·承·50%·1 | ✗ |
| 绵里藏针（绝招；原创扩展，呼应“绵里针”） | `mv_furongjinzhen_mianli` | 7 | `aoe_single` · 1（近身，掌中藏针） | 3.30 | 8% | — | 1200 | `ultimate:true`；气势 100；条件：装配绵掌；`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)`·承·75%·1 | ✓；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

- 核算：金针 `1.00×0.78−0.03=0.75`；芙蓉满枝 `0.85×(1+0.24+0.05)×0.78=0.86`；打穴金针 `1.00×(1+0.24+0.05)×0.78−0.10=0.91≈0.90`；绵里藏针以绝招基准重算为 `3.00×(1+0.15)−0.20×0.75=3.30`（装配绵掌为常见条件，封穴按施加率扣费）。被动：`ps_furongjinzhen_renxue` 认穴（1 重，`attr:seal pp +2`）；`ps_furongjinzhen_zhenxue` 针穴（5 重，对被点穴目标本武学 Z3 +8%）；`ps_furongjinzhen_dacheng` 大成（10 重，本武学耗内 −10%）。

#### 5.5.1 AR-01 新增玄阶紧凑卡（6 门）

> 下列均为 **（原创扩展）**，`origin:expanded`、`sect:sect_wudang`，按 `design/17` §1.3 T02 使用 L1–L5。未另列时 `setTags:[]`、`conflicts:[]`；各书界来源均为当地武当传承，不因同名自动跨界满层。

**`sk_wudangyangshenggong` 武当养生功**（5 玄中 · 内功/心法 · `nature:harmony` · 0/1）
- 字段：`sourceChapters:[ch04_yitian,ch05_xiaoao,ch06_xiake,ch12_shujian,ch13_feihu]`；`reqs {attrs {con:24,wil:24}, aptitude {apInner:25}, sect {id:sect_wudang,rank:2}, prereq [{anyOf:[{skill:sk_taihegong,layer:5},{skill:sk_zhenwudaoyin,layer:5}]}], hard:[sect,prereq]}`；`inner.contribution {mpMaxPct:17,hpMaxPct:10,attrs:{con:3,wil:2,wis:2},mpRegen:1.5}`，IP `17+10+2×7+5×1.5=48.5`；`stats {resInjury:5,resMind:5}`；`meridians:[mer_renmai,mer_chongmai]`；`yunjin:[tiaoxi,liaoshang]`。
- 招式：养息 `mv_wudangyangshenggong_yangxi`（1 重，自身，6%/cd3/900，`bf_huinei`·承·2）；和气护脉 `mv_wudangyangshenggong_humai`（5 重，友方 0–1 格，6%/cd3/1000，驱散 1 个 `injury`）。被动：延年 `ps_wudangyangshenggong_yannian`（受治疗 +3%→8%）；养正 `ps_wudangyangshenggong_yangzheng`（非战斗休整回复 +10%→25%）；圆满 `ps_wudangyangshenggong_yuanman`（纯阳无极功软门槛 −10）。获取：L2，由太和功 / 真武导引任一 5 重进阶。

**`sk_xuanzhenxinfa` 玄真心法**（5 玄中 · 内功/心法 · `nature:yang` · 0/1）
- 字段：`sourceChapters:[ch04_yitian,ch05_xiaoao,ch06_xiake]`；`reqs {attrs {wil:25}, aptitude {apInner:25}, sect {id:sect_wudang,rank:2}, prereq [{skill:sk_zhenwuzhuang,layer:5}], hard:[sect,prereq]}`；`inner.contribution {mpMaxPct:17,hpMaxPct:10,attrs:{con:3,str:2,wil:2},mpRegen:1.5}`，IP `17+10+2×7+5×1.5=48.5`；`stats {defIn:5,tough:5}`；`meridians:[mer_dumai,mer_yangwei]`；`yunjin:[huti,xuli]`。
- 招式：玄真护体 `mv_xuanzhenxinfa_huti`（1 重，自身，6%/cd3/900，`bf_hutizhenqi`·承·2，护盾 hpMax 10%）；蓄真 `mv_xuanzhenxinfa_xuzhen`（5 重，自身，6%/cd4/800，`bf_xuli`·承·2）。被动：真息 `ps_xuanzhenxinfa_zhenxi`（内防 +3%→8%）；桩中运气 `ps_xuanzhenxinfa_zhuangqi`（同装真武桩时抗控制 +5→12pp）；圆满 `ps_xuanzhenxinfa_yuanman`（纯阳无极功修炼 +10%）。获取：L2，真武桩 5 重。

**`sk_lingxuzhang` 凌虚掌**（5 玄中 · 拳脚/拳掌 · `nature:harmony` · 0.50/0.50）
- 字段：`sourceChapters:[ch04_yitian,ch05_xiaoao,ch06_xiake,ch12_shujian]`；`reqs {attrs {wis:25,agi:22}, aptitude {apFist:25}, sect {id:sect_wudang,rank:2}, prereq [{anyOf:[{skill:sk_wudangchangquan,layer:5},{skill:sk_wudangrumenquan,layer:5}]}], hard:[sect,prereq]}`；`layerStats {parry:[2,5],hit:[2,5]}`（10）。招式：凌虚引掌 `mv_lingxuzhang_yinzhang`（1 重，单体，0.95，6%/cd0/1000，30% `bf_jiansu`·承·2）；卸步掌 `mv_lingxuzhang_xiebu`（4 重，单体，1.05，6%/cd1/1000，击退 1）；云回 `mv_lingxuzhang_yunhui`（6 重，自身架势，5%/cd2/850，被近战攻击以 0.85 倍反击）。被动：虚领 `ps_lingxuzhang_xuling`（招架 +3%→8%）；卸力 `ps_lingxuzhang_xieli`（受近身伤害 Z4 −4%→10%）；大成 `ps_lingxuzhang_dacheng`（太极推手修炼 +10%）。获取：L2；`observable:true`，上限 6 重。

**`sk_xuanxujian` 玄虚剑**（6 玄上 · 兵器/剑 · `nature:harmony` · 0.55/0.45）【玄阶预算抽样】
- 字段：`sourceChapters:[ch04_yitian,ch05_xiaoao,ch06_xiake]`；`reqs {attrs {agi:30,wis:30}, aptitude {apSword:30}, sect {id:sect_wudang,rank:3}, prereq [{anyOf:[{skill:sk_wudangrumenjian,layer:5},{skill:sk_qixiachujian,layer:5},{skill:sk_zhenwujian,layer:5}]}], hard:[sect,prereq]}`；`layerStats {parry:[2,6],hit:[1,4]}`（10）；`weaponReq:{category:sword}`。
- 招式：玄虚刺 `mv_xuanxujian_ci`（1 重，单体，1.00，6%/cd0/1000，可招架）；虚实回锋 `mv_xuanxujian_huifeng`（4 重，`aoe_line n2`，1.10，6%/cd2/1000，可招架）；引剑卸势 `mv_xuanxujian_xieshi`（7 重绝招，单体，2.90，8%/无冷却/1200，`ultimate:true`、气势 100、100% `bf_jiansu`·承·2，可招架）。核算：`1.00`；`0.90×1.24=1.116≈1.10`；绝招 `3.00−0.10=2.90`。仅引剑卸势为绝招，前两式 `ultimate:false`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 被动：藏锋 `ps_xuanxujian_cangfeng`（招架 +3%→8%）；虚实 `ps_xuanxujian_xushi`（对处于守势的目标 Z3 +5%→12%）；大成 `ps_xuanxujian_dacheng`（10 重，招架成功 `ct +50`，每回合 1 次）。获取：L3；`observable:true`，上限 6 重。

**`sk_liangyibu` 两仪步**（6 玄上 · 轻功 · `nature:harmony` · 0.80/0.20）
- 字段：`sourceChapters:[ch04_yitian,ch05_xiaoao,ch06_xiake,ch12_shujian]`；`reqs {attrs {agi:30,wis:28}, aptitude {apLight:30}, sect {id:sect_wudang,rank:3}, prereq [{skill:sk_wudangxingbu,layer:5}], hard:[sect,prereq]}`；`layerStats {eva:[2,6],parry:[1,4]}`（10）；满层 `Q_skill=QS(6)=74`。招式：分阴阳 `mv_liangyibu_fenyinyang`（1 重，自身，5%/cd2/800，`bf_piaohu`·承·2）；两仪换位 `mv_liangyibu_huanwei`（4 重，友方 1–3 格，6%/cd3/800，换位）；环行 `mv_liangyibu_huanxing`（7 重绝招，自身，8%/无冷却/1200，`ultimate:true`、气势 100、本次移动可绕过敌方控制区并额外移动 3 格）；仅环行为绝招，前两式 `ultimate:false`。被动：阴阳步 `ps_liangyibu_yinyang`（移动后招架 +3%→8%）；圆转 `ps_liangyibu_yuanzhuan`（换位后双方获 `bf_wenzhong` 1 回合）。获取：L3；`observable:true`，上限 6 重。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`

**`sk_wudangfuchen` 武当拂尘**（6 玄上 · 兵器/鞭索（拂尘）· `nature:harmony` · 0.60/0.40）【玄阶预算抽样】
- 字段：`sourceChapters:[ch04_yitian,ch05_xiaoao,ch06_xiake]`；`reqs {attrs {agi:30,wil:28}, aptitude {apWhip:30}, sect {id:sect_wudang,rank:3}, prereq [{skill:sk_zhenwufuchen,layer:5}], hard:[sect,prereq]}`；`layerStats {parry:[2,6],seal:[1,4]}`（10）；`weaponReq:{category:whip,tags:[fuchen]}`。
- 招式：拂尘点穴 `mv_wudangfuchen_dianxue`（1 重，单体 1–2 格，0.95，6%/cd0/1000，20% `bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)`·承·2，可招架）；圆尘 `mv_wudangfuchen_yuanchen`（4 重，`aoe_ring r1`，0.95，6%/cd2/1000，可招架）；牵丝 `mv_wudangfuchen_qiansi`（7 重绝招，单体 1–2 格，2.70，8%/无冷却/1200，`ultimate:true`、气势 100、100% `bf_shouqin(level:4,holdRange:1)`·承·2，可招架）。核算：`1−0.15×20%=0.97≈0.95`；`0.75×1.24=0.93≈0.95`；绝招 `3.00−0.20−0.10（射程）=2.70`。仅牵丝为绝招，前两式 `ultimate:false`。；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}`
- 被动：尘圆 `ps_wudangfuchen_chenyuan`（招架 +3%→8%）；借丝 `ps_wudangfuchen_jiesi`（对缠绕目标 Z3 +5%→12%）；大成 `ps_wudangfuchen_dacheng`（10 重，招架后自身获 `bf_shouyi` 1 回合，每回合 1 次）。获取：L3；`observable:true`，上限 6 重。

#### 5.5.2 黄阶一行总表（14 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或（原创扩展） |
|---|---|---|---|---|---|---|---|
| `sk_taihegong` | 太和功 | 武当 L1 / 游方道人 | 2 黄中·内功/心法·`nature:harmony` | 倚天、笑傲、侠客、书剑、飞狐、连城★、鸳鸯★ | IP `8+5+2×3+5×1.0=24`；`mer_renmai` | 无；L1 | **（原创扩展）** |
| `sk_wudangchangquan` | 武当长拳 | 武当 L1 / 游方道人 | 1 黄下·拳脚/拳掌·阳 | 倚天、笑傲、侠客、书剑、飞狐、连城★、鸳鸯★ | 单体拳＋线2；Y1/Y2 | 无；L1 | 原著 |
| `sk_zhenwujian` | 真武剑法 | 武当 L1 / 游方道人 | 3 黄上·兵器/剑·阳 | 倚天、笑傲、侠客、书剑、飞狐、连城★、鸳鸯★ | 单体剑＋架势＋线2；Y1/Y2 | 无；L1 | **（原创扩展）** |
| `sk_wudangyunbu` | 武当云步 | 武当 L1 / 游方道人 | 3 黄上·轻功·阳 | 倚天、笑傲、侠客、书剑、飞狐、连城★、鸳鸯★ | 自身 `bf_piaohu`；满层 `QS(3)=45` | 无；L1 | **（原创扩展）** |
| `sk_wudangtuna` | 武当吐纳 | 武当 L1 / 游方道人 | 1 黄下·内功/心法·`nature:yang` | 倚天、笑傲、侠客、书剑、飞狐、连城★、鸳鸯★ | IP `6+4+2×2+5×1.0=19`；`attrs {con:1,wil:1}`；`mer_dumai` | 无；L1 | **（原创扩展）** |
| `sk_zhenwudaoyin` | 真武导引 | 武当 L1 | 2 黄中·内功/心法·`nature:harmony` | 倚天、笑傲、侠客、书剑、飞狐 | IP `8+5+2×3+5×1.0=24`；`attrs {con:1,wil:1,wis:1}`；`mer_renmai` | 无；L1 | **（原创扩展）** |
| `sk_wudangrumenquan` | 武当入门拳 | 武当 L1 | 2 黄中·拳脚/拳掌·阳 | 倚天、笑傲、侠客、书剑、飞狐 | 单体直拳＋线2；Y1/Y2 | 无；L1 | **（原创扩展）** |
| `sk_songxiqinna` | 松溪擒拿 | 武当 L1 | 3 黄上·拳脚/擒拿·调和 | 倚天、书剑 | 单体拿腕＋30% `bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)`；Y5 | 无；L1 | **（原创扩展命名）** |
| `sk_wudangrumenjian` | 武当入门剑 | 武当 L1 | 3 黄上·兵器/剑·阳 | 倚天、笑傲、侠客、书剑、飞狐 | 单体正刺＋线2；Y1/Y2 | 无；L1 | **（原创扩展）** |
| `sk_zhenwufuchen` | 真武拂尘 | 武当 L1 | 3 黄上·兵器/鞭索（拂尘）·调和 | 倚天、笑傲、侠客 | 单体 1–2 格＋30% `bf_jiansu`；Y5 | 无；L1 | **（原创扩展）** |
| `sk_qixiachujian` | 七侠初剑 | 武当七侠门下 | 3 黄上·兵器/剑·阳 | 倚天 | 单体点剑＋相邻援护架势；Y1 | 无；L1 | **（原创扩展）** |
| `sk_wudangxingbu` | 武当行步 | 武当 L1 | 2 黄中·轻功·调和 | 倚天、笑傲、侠客、书剑、飞狐 | 自身 `bf_jisu`；满层 `QS(2)=38` | 无；L1 | **（原创扩展）** |
| `sk_songxibu` | 松溪步 | 武当 L1 | 3 黄上·轻功·调和 | 倚天、书剑 | 自身 `bf_piaohu`；满层 `QS(3)=45` | 无；L1 | **（原创扩展命名）** |
| `sk_zhenwuzhuang` | 真武桩功 | 武当 L1 | 3 黄上·内功/心法·`nature:yang` | 倚天、笑傲、侠客 | IP `10+6+2×4+5×1.2=30`；`attrs {con:2,wil:2}`；`mer_dumai`；桩中运气为玄真心法前置 | 无；L1 | **（原创扩展）** |

### 5.6 进阶链与跨书界说明

| 链 | 前置关系 |
|---|---|
| 内功（黄 → 玄 → 地） | 武当吐纳 / 真武导引 / 太和功（黄）→ 武当养生功 / 两仪心法（玄中）→ 纯阳无极功（地中）；真武桩（黄上）→ 玄真心法（玄中）亦接纯阳支线 |
| 剑（黄 → 玄 / 地） | 武当入门剑 / 七侠初剑 / 真武剑法（黄）→ 玄虚剑 / 绕指柔剑（玄）→ 柔云剑术 / 神门十三剑（地）；太极剑（天中）由张三丰直传 |
| 拳脚 | 武当长拳 / 武当入门拳（黄）→ 绵掌 / 截脉手 / 凌虚掌（玄）；绵掌 4 重 → 太极推手（玄上），5 重 → 无极玄功拳（地下）；武当长拳 6 重 → 虎爪绝户手（地下）；太极拳（天中）由张三丰直传 |
| 轻功 / 拂尘 | 武当行步（黄中）→ 两仪步（玄上）；武当云步（黄上）→ 梯云纵（地中）；真武拂尘（黄上）→ 武当拂尘（玄上） |

- **全池与衰减**：扩充后本组可习得池为倚天 38、笑傲 31（含太极两门 10 品残承）、侠客 28、书剑 24、飞狐 16；池仍随时代收窄，与“武林衰败”曲线一致（基准 §2）。
- **太极残承**：太极拳、太极剑在笑傲为 `partial`、`lineageGrade 10`（02 §5.7、E9）：携带者经冲虚道长印证可恢复到天下；侠客、书剑、飞狐无再遇。
- **中武装配示例（书剑，2/2/2 携带）**：携带太极拳、太极剑（外来压制后 11 → 9 地上）与主运内功各 1 门；本土补齐纯阳无极功、无极玄功拳、柔云剑术；本土再学梯云纵、芙蓉金针。
- **低武★补位（连城 / 鸳鸯）**：太和功、武当长拳、绵掌、真武剑法、武当云步 5 门（黄下—玄中），只作 1/1/1 携带后的补位；须 chapters/09、11 采纳。

---

## 6. 绝情谷 `sect_jueqinggu`

> 本门补录武学见 `skills-bulu-03-shendiao.md` §2：`sk_jueqingbixuejue`、`sk_jindaoheijianjue`；补录卡归该册定义，本文只登记入口。

### 6.1 门派简介

- **神雕（1237–1259）**：谷主公孙止，家传武学以刀剑互易的阴阳倒乱刃法与闭穴功见长；谷中遍生情花，中刺者动情则痛，唯绝情丹可解（原著）。公孙止之妻裘千尺（铁掌帮裘千仞之妹）被其挑断手足筋脉、囚于谷底石窟，以口喷枣核钉为武；女儿公孙绿萼为救杨过而死；大弟子樊一翁以长须、钢杖对敌；谷中弟子以渔网围捕闯谷之人。终局公孙止与裘千尺同坠深渊；十六年后杨过、小龙女于谷底重逢。细节仍须核对**（待考：《神雕侠侣》绝情谷初遇、谷底石窟、谷主夫妇结局及十六年重逢段落）**。
- **谷规**：谷中人是否有断情、茹素禁酒等成文谷规仍须核对**（待考：《神雕侠侣》杨过初入绝情谷、谷宴与弟子生活描写）**；本作以“绝情”为谷中入门心法的主题（原创扩展）。
- **强弱**：人少，谷主一人独强（具名 Boss，地中—地上）；弟子多为玄阶，以渔网阵取胜。
- **情花**：情花毒 `bf_qinghuadu`（06 §8.5，品阶 8–9）由情花丛地形或情花刺物品施加（design/08、10），不由本组武学直接施加；解法绝情丹 `it_jueqingdan`、断肠草 `it_duanchangcao`（06 §4.6 `rx_yiduigongdu`）。

### 6.2 武学总表（15 门）

| ID | 名称 | 大类/子类 | 品阶 | 内力性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_jueqingxinjue` | 绝情心诀 | 内功/心法 | 3 黄上 | 阴 | 0/1 | 神雕 | 拜师（L1） | 原创扩展 |
| `sk_bixuegong` | 闭穴功 | 内功/心法 | 7 地下 | 阴 | 0/1 | 神雕 | 公孙止传授（L4）；裘千尺口授（原创扩展） | 原著 |
| `sk_zhezhishou` | 折枝手 | 拳脚/擒拿 | 1 黄下 | 阴 | 0.80/0.20 | 神雕 | 拜师（L1） | 原创扩展 |
| `sk_jueqingjian` | 绝情剑法 | 兵器/剑 | 3 黄上 | 阴 | 0.70/0.30 | 神雕 | 拜师（L1） | 原创扩展 |
| `sk_changxuzhang` | 长须杖法 | 兵器/棍杖 | 5 玄中 | 阳 | 0.80/0.20 | 神雕 | 樊一翁传授（L2） | 原创扩展命名（原著樊一翁须杖对敌） |
| `sk_yinyangdaoluan` | 阴阳倒乱刃法 | 兵器/刀（刀剑互易） | 8 地中 | 调和 | 0.65/0.35 | 神雕 | 公孙止传授（L4）；剑室奇遇 | 原著 |
| `sk_zaoheding` | 枣核钉 | 暗器 | 6 玄上 | 阴 | 0.60/0.40 | 神雕 | 裘千尺传授（谷底石窟线） | 原著 |
| `sk_yuwangzhen` | 渔网阵 | 杂学/阵法（合击） | 5 玄中 | 阳 | 0.60/0.40 | 神雕 | 拜师（L2） | 原著 |
| `sk_qinghuabufa` | 情花步法 | 轻功 | 5 玄中 | 阴 | 0.80/0.20 | 神雕 | 绝情谷 L2；情花丛试炼 | 原创扩展 |
| `sk_jueqingdaoyin` | 绝情导引 | 内功/心法 | 2 黄中 | 阴 | 0/1 | 神雕 | 绝情谷 L1 | 原创扩展 |
| `sk_gukouquan` | 谷口拳 | 拳脚/拳掌 | 1 黄下 | 阳 | 0.85/0.15 | 神雕 | 绝情谷 L1 | 原创扩展 |
| `sk_jindaojichu` | 金刀基础 | 兵器/刀 | 3 黄上 | 阳 | 0.80/0.20 | 神雕 | 绝情谷 L1；剑室 | 原创扩展 |
| `sk_heijianjichu` | 黑剑基础 | 兵器/剑 | 3 黄上 | 阴 | 0.70/0.30 | 神雕 | 绝情谷 L1；剑室 | 原创扩展 |
| `sk_qinghuabici` | 情花避刺 | 暗器 | 3 黄上 | 阴 | 0.65/0.35 | 神雕 | 绝情谷 L1；情花圃劳作 | 原创扩展 |
| `sk_gudibu` | 谷底步 | 轻功 | 3 黄上 | 调和 | 0.80/0.20 | 神雕 | 绝情谷 L1；谷底石窟 | 原创扩展 |

### 6.3 地阶条目卡

#### `sk_bixuegong` 闭穴功（7 地下 · 内功 · 绝情谷）

> **原著**：公孙止练有闭穴功，能自行封闭周身穴道，点穴对其无效；功法来历与破解细节仍须核对**（待考：《神雕侠侣》公孙止施展闭穴功及裘千尺揭其弱点的段落）**。本作以“罩门”作其代价——闭穴者必有一穴不能闭（原创扩展）。招式为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | `nature: yin`；`wOut/wIn: 0/1` |
| 原生书界 | 神雕 |
| reqs | `attrs {wil 40, con 40, wis 40}`；`aptitude {apInner 40}`；`sect {sect_jueqinggu, rank 4}`；`prereq [sk_jueqingxinjue ≥ 5]`；`hard [sect, prereq]` |
| 内功贡献 | `mpMaxPct 24, hpMaxPct 16, attrs {con 4, wil 4, agi 2}, mpRegen 2.4` → IP 72（= 地下预算）；`stats {resSeal 15}`（15） |
| InnerDef | `auxUsableMoves: [mv_bixuegong_chongxue]` |
| 层数要点 | 1 重闭穴、"自闭"；4 重冲穴、"护穴"；**7 重绝招锁元**；8 重"闭穴成"；10 重"大成" |
| 获取 | ① `master`：公孙止 `npc_gongsunzhi`（绝情谷L4，占位 `q_03_faction_94`），maxLayer 10；② `master`：裘千尺 `npc_qiuqianchi` 口授（谷底石窟线，原创扩展，占位 `q_03_side_95`），maxLayer 8 |
| setTags · conflicts | `[]`；无 |
| special | **代价**：主运时持有 `bf_zhaomen`（罩门，06 §8.9：战斗开始随机设定罩门方位；自该方位或以指法命中时，本击无视持有者全部 `guard` 与外防增益且 Z3 +50%；`lore ≥ 50` 者观察 1 回合可识破）；10 重起罩门方位由玩家战前指定，指法命中不再触发。`fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 闭穴 | `mv_bixuegong_bixue` | 1 | `aoe_self` | 0 | 8% | 4 | 800 | `bf_mian_xue`·承·100%·2（免疫穴道） | — |
| 冲穴 | `mv_bixuegong_chongxue` | 4 | `aoe_self` | 0 | 6% | 3 | 800 | 驱散自身全部 `seal` 减益（冲穴等效，品阶承）；回复 5% 内力 | — |
| 锁元（绝招，原创扩展命名） | `mv_bixuegong_suoyuan` | 7 | `aoe_self` | 0 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_mian_xue`·承·100%·3；`bf_mian_kong`·承·100%·1；`bf_hutizhenqi`·承·100%·3（hpMax 15%） | —；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 自闭 | `ps_bixuegong_zibi` | 1 | trigger | 20% → 45% | 被施加 `seal.point`（点穴）时当即自解（等效冲穴，品阶承）；`auxMode: full` |
| 护穴 | `ps_bixuegong_huxue` | 4 | trigger | — | 被点穴后获得 `bf_huxue`（护穴）2 回合 |
| 闭穴成 | `ps_bixuegong_cheng` | 8 | stat · 属性层 | `attr:resSeal pp +10` | `auxMode: scaled` |
| 大成 | `ps_bixuegong_dacheng` | 10 | mechanic | — | 罩门方位战前自定；指法命中不再触发罩门 |

#### `sk_yinyangdaoluan` 阴阳倒乱刃法（8 地中 · 兵器/刀（刀剑互易）· 绝情谷）

> **原著**：公孙止一手金刀、一手黑剑，刀走剑路、剑作刀使，阴阳倒乱，令对手无从拆解；杨过、小龙女与之对敌方悟其理。兵器正式名称及情花丛交战细节仍须核对**（待考：《神雕侠侣》杨过、小龙女对战公孙止的段落）**。招式名为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 调和 · 0.65/0.35 |
| 原生书界 | 神雕 |
| weaponReq | `{category: blade}` ＋ 副手剑（或主手剑、副手刀，视同）；单持刀或剑可用，但失去 1 重"倒乱"——需 05 §6.2 增补"异类双持" `dualMixed: [blade, sword]`（§11 D-8）；配锯齿金刀 `eq_juchijindao`、黑剑 `eq_heijian`（建议 ID，design/10 定级） |
| reqs | `attrs {agi 45, str 40, wis 45}`；`aptitude {apBlade 45, apSword 40}`；`sect {sect_jueqinggu, rank 4}`；`prereq [sk_jueqingjian ≥ 5]`；`hard [sect, prereq]` |
| layerStats | `{pierce [3, 9], hit [1, 6]}`（15） |
| 层数要点 | 1 重刀剑互易、黑剑穿心、"倒乱"；3 重金刀锯骨；4 重阴阳倒乱、"刀剑换手"；5 重推入情花；**7 重两仪倒转（第一绝招）**；8 重"黑剑柔韧"；**9 重金刀锯骨（第二绝招）**；10 重"大成" |
| 获取 | ① `master`：公孙止（绝情谷L4），maxLayer 10；② `qiyu`：绝情谷剑室（原著谷中藏剑之室，君子剑、淑女剑出于此）得刀剑与刀谱残篇（原创扩展，占位 `q_03_qiyu_96`），maxLayer 7 |
| setTags · conflicts | `[]`；无（与玉女素心剑法的克制关系见 1 重"倒乱"） |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 刀剑互易（原创扩展命名） | `mv_yinyangdaoluan_huyi` | 1 | `aoe_single` · 1（刀一剑一 2 段） | 1.00 | 7% | 0 | 1000 | 两段分别按刀 / 剑类别判定招架与破 X | ✓ | 基准 |
| 黑剑穿心 | `mv_yinyangdaoluan_heijian` | 1 | `aoe_pierce` | 1.05 | 8% | 1 | 1000 | — | ✓ | 0.90 × 1.17 |
| 阴阳倒乱 | `mv_yinyangdaoluan_daoluan` | 4 | `aoe_single` · 1 | 1.10 | 8% | 2 | 1000 | — | ✗ | 1.29 × 0.85 |
| 推入情花（原创扩展命名） | `mv_yinyangdaoluan_qinghua` | 5 | `aoe_knock n2` | 1.10 | 8% | 2 | 1000 | 击退 2；落点为情花丛地形（design/08，建议 `tr_qinghuacong`）时由地形施加 `bf_qinghuadu` | ✓ | 0.95 × 1.29 = 1.23，−0.10 |
| 金刀锯骨（绝招；提升既有招式，原创扩展命名） | `mv_yinyangdaoluan_jindao` | 9 | `aoe_single` · 1 | 2.80 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_liuxue`·承·100%·3（9 层） | ✓ | `3.00−0.20=2.80`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 两仪倒转（绝招，原创扩展命名） | `mv_yinyangdaoluan_liangyi` | 7 | `aoe_around`（2 段） | 2.20 | 9% | — | 1200 | `ultimate:true`；气势 100；`bf_shiheng`·承·50%·1 | ✓ | N=6、AF=0.75；3.0 × 0.75 = 2.25，−0.05 = 2.20；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 倒乱 | `ps_yinyangdaoluan_daoluan` | 1 | mechanic / 判定 | ×0.5；`pierce +4 → +10` | 敌方 `bf_podao`、`bf_pojian` 对本武学的效果 ×0.5（刀剑难辨）；本武学 `attr:pierce flat +4 → +10`；对玉女素心剑法合璧状态的目标无效，原著对应仍须核对**（待考：《神雕侠侣》杨过、小龙女合使双剑破解阴阳倒乱刃法的段落）** |
| 刀剑换手 | `ps_yinyangdaoluan_huanshou` | 4 | mechanic / Z3 | +8% | 主副手互换不增加收招（05 §6.4 的 +150 → 0）；换手后下一招 Z3 +8% |
| 黑剑柔韧 | `ps_yinyangdaoluan_rouren` | 8 | trigger | 30% | 本武学招式被招架时 30% 视为未被招架 |
| 大成 | `ps_yinyangdaoluan_dacheng` | 10 | stat · 属性层 | `attr:crit flat +10` | 仅本武学 |

### 6.4 玄阶 · 黄阶（紧凑表）

**`sk_jueqingxinjue` 绝情心诀**（3 黄上 · 内功 · 阴 · 原创扩展）
- `nature: yin`。
- 内功贡献：`mpMaxPct 10, hpMaxPct 6, attrs {wil 3, con 1}, mpRegen 1.2`（IP 30）；`stats {resMind 3, resPoison 3}`；无招式。
- reqs：`sect {sect_jueqinggu, rank 1}`；`hard [sect]`。获取：拜师。
- 被动：`ps_jueqingxinjue_jueqing` 绝情（1 重，`bf_mihuo` 对自身持续 −1，最低 1）；`ps_jueqingxinjue_duanqing` 断情（5 重，自身 `bf_qinghuadu` 的"动情"发作伤害 −30%，原创扩展）；`ps_jueqingxinjue_yuanman` 圆满（10 重，闭穴功软门槛 −10）。

**`sk_zhezhishou` 折枝手**（1 黄下 · 拳脚/擒拿 · 阴 · 0.80/0.20 · 原创扩展）
- 依据：谷中遍植情花，花枝有刺，弟子习以折枝避刺之手法（原创扩展）。
- reqs：`sect {sect_jueqinggu, rank 1}`；`hard [sect]`。layerStats `{hit [1, 3], parry [1, 3]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 折枝 | `mv_zhezhishou_zhezhi` | 1 | `aoe_single` · 1 | 1.00 | 5% | 0 | 1000 | — | ✓ |
| 拂刺 | `mv_zhezhishou_fuci` | 4 | `aoe_single` · 1 | 1.10 | 5% | 1 | 1000 | `bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)`（参数 unarmed）·承·20%·2 | ✓ |
| 攀枝锁臂 | `mv_zhezhishou_panzhi` | 7 | `aoe_single` · 1 | 1.20 | 5% | 2 | 1000 | `bf_shouqin(level:4,holdRange:1)`·承·30%·2 | ✓ |

- 核算：拂刺 1.12 − 0.03；攀枝锁臂 1.24 − 0.06。被动：`ps_zhezhishou_bici` 避刺（5 重，情花丛地形对自身的伤害与施加率 −50%，08）；`ps_zhezhishou_yuanman` 圆满（10 重，绝情谷拳脚、兵器软门槛 −10）。

**`sk_jueqingjian` 绝情剑法**（3 黄上 · 兵器/剑 · 阴 · 0.70/0.30 · 原创扩展）
- reqs：`sect {sect_jueqinggu, rank 1}`；`hard [sect]`。layerStats `{hit [1, 3], parry [1, 3]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 断情 | `mv_jueqingjian_duanqing` | 1 | `aoe_single` · 1 | 1.00 | 5% | 0 | 1000 | — | ✓ |
| 忘忧 | `mv_jueqingjian_wangyou` | 4 | `aoe_cone {angle:120,r:1,dirCount:6}` | 0.95 | 5% | 1 | 1000 | — | ✓ |
| 肠断（呼应断肠草） | `mv_jueqingjian_changduan` | 7 | `aoe_single` · 1 | 1.25 | 6% | 2 | 1000 | `bf_nanyu`·承·30%·3 | ✓ |

- 核算：忘忧以 N=3、AF=0.85 计，0.85 × 1.12 = 0.95；肠断 1.29 − 0.03。被动：`ps_jueqingjian_lengfeng` 冷锋（5 重，本武学 `attr:crit flat +3`）；`ps_jueqingjian_yuanman` 圆满（10 重，阴阳倒乱刃法软门槛 −10）。

**`sk_changxuzhang` 长须杖法**（5 玄中 · 兵器/棍杖 · 阳 · 0.80/0.20 · 原创扩展命名）
- 原著：公孙止大弟子樊一翁身材矮小、长须拖地，以长须作鞭、钢杖为兵；兵刃细节仍须核对**（待考：《神雕侠侣》樊一翁与杨过等交手的段落）**。
- `weaponReq {category: staff}`。reqs：`attrs {str 25}`；`aptitude {apStaff 25}`；`sect {sect_jueqinggu, rank 2}`；`hard [sect]`。layerStats `{parry [1, 5], resCC [1, 5]}`。获取：樊一翁 `npc_fanyiweng` 传授（maxLayer 10）。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 钢杖 | `mv_changxuzhang_gangzhang` | 1 | `aoe_single` · 1 | 1.00 | 6% | 0 | 1000 | — | ✓ |
| 长须卷 | `mv_changxuzhang_changxu` | 1 | `aoe_pull n1` · 1–2 | 0.90 | 6% | 1 | 1000 | `bf_shouqin(level:4,holdRange:1)`·承·20%·2 | ✓ |
| 横扫千军 | `mv_changxuzhang_hengsao` | 4 | `aoe_cone {angle:120,r:1,dirCount:6}` | 0.95 | 7% | 1 | 1000 | 击退 1 | ✓ |
| 须杖齐施 | `mv_changxuzhang_qishi` | 7 | `aoe_single` · 1（2 段） | 1.30 | 7% | 2 | 1000 | — | ✓ |

- 核算：长须卷 0.95 × 1.12 = 1.06，−0.10 −0.04；横扫千军以 N=3、AF=0.85 计，0.85 × 1.17 = 0.99，−0.05 = 0.94，取 0.95；须杖齐施 1.29。被动：`ps_changxuzhang_changxu` 长须（1 重，本武学射程 2 的招式 `attr:hit flat +5`）；`ps_changxuzhang_lishan` 杖立如山（5 重，`attr:resCC pp +8`）；`ps_changxuzhang_dacheng` 大成（10 重，本武学 Z3 +6%）。

**`sk_zaoheding` 枣核钉**（6 玄上 · 暗器 · 阴 · 0.60/0.40 · 原著）
- 原著：裘千尺手足筋脉被挑断、囚于谷底石窟，以口喷射枣核钉伤人；伤公孙止之目等细节仍须核对**（待考：《神雕侠侣》谷底石窟及裘千尺、公孙止最终冲突段落）**。本作保留“口喷”——不需双手（原创规则化）。弹药枣核 `it_zaoheding`（建议 ID）。预算按 §3.4 暗器约定。
- reqs：`attrs {wil 30}`；`aptitude {apHidden 30}`；`hard []`。layerStats `{hit [1, 5], crit [1, 5]}`。获取：裘千尺（谷底石窟线，羁绊 ≥ 3，占位 `q_03_side_95`），maxLayer 10。
- `setTags: []`：该跨图鉴候选已在 `design/07` §19 淘汰，不再反向登记。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 喷核（绝招；提升既有招式） | `mv_zaoheding_penhe` | 7 | `aoe_bolt` · 1–4 | 2.30 | 8% | — | 1200 | `ultimate:true`；气势 100 | ✗；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| 打眼 | `mv_zaoheding_dayan` | 3 | `aoe_bolt` · 1–3 | 0.95 | 7% | 2 | 1000 | `bf_shimang`·承·40%·1 | ✗ |
| 连珠核 | `mv_zaoheding_lianzhu` | 5 | `aoe_multi n3 r1` · 1–4 | 0.75 | 7% | 1 | 1000 | — | ✗ |

- 核算：喷核 0.78；打眼 1.29 × 0.78 = 1.01，−0.04；连珠核 0.85 × 1.17 × 0.78 = 0.78。被动：`ps_zaoheding_koupen` 口喷（1 重，本武学不受 `bf_jiaoxie`、`bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)`、`bf_shouqin(level:4,holdRange:1)` 影响，仍受 `bf_xueweishoufeng(level:8,acupointRef:sourcePrimary)` 影响）；`ps_zaoheding_yuandu` 怨毒（5 重，对气血比例高于自身的目标 Z3 +8%）；`ps_zaoheding_dacheng` 大成（10 重，本武学 `attr:hit flat +8`）。

**`sk_yuwangzhen` 渔网阵**（5 玄中 · 杂学/阵法（合击）· 阳 · 0.60/0.40 · 原著）
- 原著：绝情谷弟子以渔网围捕闯谷之人，杨过、周伯通等曾遇此阵；网具是否缀刃仍须核对**（待考：《神雕侠侣》周伯通、杨过在绝情谷遭渔网围捕的段落）**。06 §8.7 封轻功的典型来源之一即“渔网”。
- reqs：`sect {sect_jueqinggu, rank 2}`；`hard [sect]`。`special.formation`：成阵 ≥ 2（二人张网）；`fusible: false`。`setTags: []`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 撒网 | `mv_yuwangzhen_sawang` | 1 | `aoe_disk {r:1}`（中心点＋六邻格）· 1–3 | 0.95 | 7% | 3 | 1000 | 条件：另 1 名阵员距目标格 ≤ 3；`bf_shouqin(level:4,holdRange:1)`·承·50%·2；`bf_fengqinggong`·承·50%·2 | ✓ |
| 收网 | `mv_yuwangzhen_shouwang` | 4 | `aoe_pull n1` · 1–3 | 1.25 | 7% | 2 | 1000 | 条件：目标缠绕中 | ✓ |
| 刀网绞杀 | `mv_yuwangzhen_jiaosha` | 7 | `aoe_single` · 1–2 | 1.25 | 7% | 2 | 1000 | 条件：目标缠绕中；`bf_liuxue`·承·100%·3（2 层） | ✓ |

- 核算：撒网 0.70 × (1+0.36+0.05+0.15) − 0.20 × 50% − 0.10 × 50% = 0.942，取 0.95；收网 0.95 ×(1+0.24+0.05+0.15)= 1.37，−0.10；刀网绞杀 1.44 − 0.20。被动：`ps_yuwangzhen_wangmi` 网密（1 重，网中敌人"挣脱"缠绕成功率 −10% → −25%）；`ps_yuwangzhen_zhangwang` 张网（5 重，成阵时阵员获得 `bf_jieji` 2 回合）；`ps_yuwangzhen_dacheng` 大成（10 重，撒网冷却 −1）。

#### 6.4.1 AR-01 新增玄阶紧凑卡（1 门）

**`sk_qinghuabufa` 情花步法**（5 玄中 · 轻功 · `nature:yin` · 0.80/0.20 · **原创扩展**）【玄阶预算抽样】
- 字段：`origin:expanded`；`sect:sect_jueqinggu`；`sourceChapters:[ch03_shendiao]`；`reqs {attrs {agi:25,wis:22}, aptitude {apLight:25}, sect {id:sect_jueqinggu,rank:2}, prereq [{skill:sk_gudibu,layer:5}], hard:[sect,prereq]}`；`layerStats {eva:[2,5],resPoison:[2,5]}`（10）；满层 `Q_skill=QS(5)=65`；`setTags:[]`。
- 招式：避刺 `mv_qinghuabufa_bici`（1 重，自身，5%/cd2/800，`bf_piaohu`·承·2）；穿花 `mv_qinghuabufa_chuanhua`（4 重，单体突进 2，1.00，6%/cd1/1000，可招架）；回谷 `mv_qinghuabufa_huigu`（6 重，自身，6%/cd3/800，后撤 2 格并获 `bf_wenzhong`·承·1）。核算：穿花 `1×(1+0.12)−0.10=1.02≈1.00`；其余为位移 / 架势招式。
- 被动：识花 `ps_qinghuabufa_shihua`（情花丛伤害与 Buff 施加率 −30%→60%）；错步 `ps_qinghuabufa_cuobu`（闪避后 `ct +50`，每回合 1 次）；大成 `ps_qinghuabufa_dacheng`（10 重，情花丛不再减速）。获取：L2，完成情花丛穿行试炼；`observable:true`，观摩上限 5 重。

#### 6.4.2 黄阶一行总表（9 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或（原创扩展） |
|---|---|---|---|---|---|---|---|
| `sk_jueqingxinjue` | 绝情心诀 | 绝情谷 L1 | 3 黄上·内功/心法·`nature:yin` | 神雕 | IP `10+6+2×4+5×1.2=30`；`mer_yinwei` | 无；L1 | **（原创扩展）** |
| `sk_zhezhishou` | 折枝手 | 绝情谷 L1 | 1 黄下·拳脚/擒拿·阴 | 神雕 | 单体拿手＋缠绕；Y1/Y5 | 无；L1 | **（原创扩展）** |
| `sk_jueqingjian` | 绝情剑法 | 绝情谷 L1 | 3 黄上·兵器/剑·阴 | 神雕 | 单体剑＋扇形扫＋30% `bf_nanyu`；Y1/Y3/Y5 | 无；L1 | **（原创扩展）** |
| `sk_jueqingdaoyin` | 绝情导引 | 绝情谷 L1 | 2 黄中·内功/心法·`nature:yin` | 神雕 | IP `8+5+2×3+5×1.0=24`；`attrs {con:1,wil:2}`；`mer_yinwei` | 无；L1 | **（原创扩展）** |
| `sk_gukouquan` | 谷口拳 | 绝情谷 L1 | 1 黄下·拳脚/拳掌·阳 | 神雕 | 单体冲拳＋击退 1；Y1/Y5 | 无；L1 | **（原创扩展）** |
| `sk_jindaojichu` | 金刀基础 | 绝情谷 L1 / 剑室 | 3 黄上·兵器/刀·阳 | 神雕 | 单体劈刀＋扇形扫；Y1/Y3；`setTags:[]` | 无；L1 | **（原创扩展）** |
| `sk_heijianjichu` | 黑剑基础 | 绝情谷 L1 / 剑室 | 3 黄上·兵器/剑·阴 | 神雕 | 单体刺＋线2；Y1/Y2；`setTags:[]` | 无；L1 | **（原创扩展）** |
| `sk_qinghuabici` | 情花避刺 | 绝情谷情花圃 | 3 黄上·暗器·阴 | 神雕 | 投掷情花枝，30% `bf_jiansu`；Y5（投射修正已计） | `skills {poi:10}`；L1 | **（原创扩展）**；不直接施加情花毒 |
| `sk_gudibu` | 谷底步 | 绝情谷 L1 / 谷底石窟 | 3 黄上·轻功·调和 | 神雕 | 自身 `bf_wenzhong`；满层 `QS(3)=45` | 无；L1 | **（原创扩展）** |

### 6.5 进阶链

| 链 | 前置关系 |
|---|---|
| 内功（黄 → 地） | 绝情导引（黄中）→ 绝情心诀（黄上）→ 5 重 → 闭穴功（地下） |
| 刀剑（黄 → 地） | 金刀基础＋黑剑基础（黄上）→ 绝情剑法（黄上）→ 5 重 → 阴阳倒乱刃法（地中）；长须杖法（玄中）独立 |
| 拳脚 / 轻功 | 谷口拳 / 折枝手（黄下）为拳脚入门；谷底步（黄上）→ 5 重 → 情花步法（玄中） |
| 裘千尺线 | 枣核钉（玄上）；闭穴功口授（maxLayer 8） |

- **推荐装配（神雕中期，绝情谷线）**：主运闭穴功（注意罩门）＋辅运绝情心诀｜折枝手｜阴阳倒乱刃法（主手锯齿金刀、副手黑剑）、长须杖法（换杖时用）｜枣核钉｜渔网阵。

---

## 7. 套装候选（已由 `design/07` 收敛）

> 本节是图鉴侧索引，不重定义件数、品阶、效果或可达性；正式成员与阈值唯一见 `design/07` §11。实际 `setTags` 已按 C22 只保留正式关系。

| 正式套装 | ID | 本图鉴成员 | 跨组成员 |
|---|---|---|---|
| 全真·北斗 | `set_quanzhen_beidou` | `sk_xiantiangong`、`sk_jinguanyusuo`、`sk_quanzhenxinfa`、`sk_quanzhenjian`、`sk_tongguijian`、`sk_tiangang`、`sk_dabeidouzhen` | 无 |
| 古墓·玉女 | `set_gumu_yunv` | `sk_yunvxinjing`、`sk_hanyuxinjue`、`sk_yunvjian`、`sk_suxin`、`sk_meinvquan`、`sk_jinlingsuo`、`sk_gumuqinggong`、`sk_yufengzhen` | 无 |
| 神雕侠侣 | `set_shendiao_xialv` | `sk_suxin`、`sk_anran`、`sk_xuantie`、`sk_yunvxinjing`、`sk_yunvjian`、`sk_quanzhenjian` | 无 |
| 独孤剑冢 | `set_dugu_jianzhong` | `sk_xuantie`、`sk_lijianyi`、`sk_ruanjianyi`、`sk_zhongjianyi`、`sk_mujianyi`、`sk_haichaolianjian`、`sk_jianzhongtuna` | `sk_dugu9`（五岳图鉴） |
| 武当·太极 | `set_wudang_taiji` | `sk_taijiquan`、`sk_taijijian`、`sk_liangyixinfa`、`sk_taijituishou`、`sk_mianzhang`、`sk_tiyunzong` | 无 |
| 武当·真武 | `set_wudang_zhenwu` | `sk_chunyangwuji`、`sk_huzhaojuehushou`、`sk_wujixuangongquan`、`sk_shenmen13`、`sk_yitiantulonggong`、`sk_zhenwuqijie` | `sk_wudangjiuyang`（倚天图鉴） |

未采用的 `legacy-set:shujian_mianlizhen`、`legacy-set:chilian_xianzi`、`legacy-set:jueqing_gongsun` 与跨组 `legacy-set:tiezhang_shuishangpiao` 已从实际标签移除；原因与合并去向见 `design/07` §19。装备草案不计入 v1 成员。

---

## 8. 本组统计

> 统计口径：本组按五张武学总表的唯一 ID 计 **116 门**，含 `design/05` §13.6 唯一定义、本文只引用的全真剑法 `sk_quanzhenjian`；武当九阳功 `sk_wudangjiuyang` 由倚天组定义，只引用、不计。本文件实际定义 115 门。C3 受控配额为 `8/18/44/46=116`，本轮只新增玄 19、黄 31，不新增天、地。
>
> **预算口径说明**：本轮新增招式一律按 `design/05` §4.2 现行公式，以 `cost_buff × 施加率` 扣一次；持续回合只采用 `design/06` 条目的默认持续，不再乘入成本。全文未发现沿用“Buff 成本 × 施加率 × 持续回合”的新增条目，故无须向 F2 提交旧口径重算清单；若 06 后续修改默认持续或价值，仍按 §11 D-2 统一回归。
>
> **绝招数量调整（2026-09-27）**：不增删武学或招式 ID，只把既有招式提升为绝招；`MoveDef.ultimate:true` 为唯一真值。

| 范围 | 武学门数 | 调整前绝招 | 调整后绝招 | 本轮提升 / 新增专属路线 | 分配核算 |
|---|---:|---:|---:|---:|---|
| 天阶（10–12） | 8 | 8 | **20** | 12 | 天下 `2×2=4`；天中 `2×2+4×3=16`；合计 20 |
| 地阶（7–9） | 18 | 18 | **23** | 5 | 地上 `2×2=4`；地中 `3×2+4×1=10`；地下 `9×1=9` |
| 玄上（6） | 22 | 3 | **22** | 19 | `22×1=22` |
| **合计** | **48** | **29** | **65** | **36** | 统一前为 67，本轮降格 2；玄中、玄下、黄阶均为 0 |

天阶、地阶与玄上逐门均命中统一裁定；本轮新增招式 ID 为 0，降格 2 条并保留为普通招，既有专属路线均沿用稳定 `mfr_*`。

### 8.1 门派 × 品阶（12 级）

| 门派 | 1 黄下 | 2 黄中 | 3 黄上 | 4 玄下 | 5 玄中 | 6 玄上 | 7 地下 | 8 地中 | 9 地上 | 10 天下 | 11 天中 | 12 天上 | 合计 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 全真教 | 0 | 4 | 7 | 2 | 5 | 5 | 1 | 1 | 0 | 1 | 1 | 0 | **27** |
| 古墓派 | 1 | 3 | 6 | 2 | 3 | 7 | 3 | 0 | 1 | 1 | 0 | 0 | **27** |
| 杨过传承 · 剑冢 | 0 | 1 | 1 | 1 | 0 | 3 | 0 | 1 | 1 | 0 | 3 | 0 | **11** |
| 武当派 | 2 | 4 | 8 | 0 | 6 | 6 | 4 | 4 | 0 | 0 | 2 | 0 | **36** |
| 绝情谷 | 2 | 1 | 6 | 0 | 3 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | **15** |
| **合计** | **5** | **13** | **28** | **5** | **17** | **22** | **9** | **7** | **2** | **2** | **6** | **0** | **116** |
| 大阶小计 | | 黄 46（39.7%） | | | 玄 44（37.9%） | | | 地 18（15.5%） | | | 天 8（6.9%） | | |
| **AR-16 外放招式** | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 1 | 0 | **3** |

> AR-16 外放按武学品阶汇总为：天 1、地 0、玄 2、黄 0、合计 3。另有 6 招因仅见远程几何、姿态命名或实体来源不明而列待考，不计入外放数。

#### AR-16 外放候选审计表

本表是 `tech/04` 构建 `projection-coverage.json` 的图鉴输入之一；结论按 `moveId` 排序。实体兵器和纯位移即使能远距命中，也不属于外放；音功按 21 §4.4.1 的 AR-17 条件式口径判定：基础音波不算，以深厚内力驱动并控制音波者才算。

| `moveId` | 结论 | 依据 | 所在位置 |
|---|---|---|---|
| `mv_haotianzhang_yunxing` | 待考 | 远程范围掌招，但未明示离体掌力 | §2.5 昊天掌 |
| `mv_jinlingsuo_lingyin` | 已审不标 `not_projected` | 实体金铃发声；卡内无深厚内力驱动、控制音波的依据 | §3.2 金铃索法 |
| `mv_meinvquan_mulan` | 待考 | “弯弓”姿态及远程几何不足以证明外放 | §3.3 美女拳法 |
| `mv_mujianyi_wanwu` | 待考 | 未说明波形来自剑气还是草木实体 | §4.5 木剑意 |
| `mv_sanhuajudingzhang_shen` | 待考 | 只有 `ranged` 几何，无离体掌力证据 | §2.5 三花聚顶掌 |
| `mv_suxin_fuqin` | 待考 | 双剑招远距两段，未明示剑气 | §4.3 玉女素心剑法 |
| `mv_wudangjiemaishou_huantiao` | 已标 `projected` | 卡内明确为远程指风 | §5.6 武当截脉手 |
| `mv_xiantiangong_yiqi` | 待考 | 原创招名与远程直线不足以证明离体真气 | §2.2 先天功 |
| `mv_xuantie_caomu` | 已标 `projected` | 卡内明确为远程剑气 | §4.4 玄铁剑法 |
| `mv_yunvjian_lengyue` | 已标 `projected` | 卡内明确为远程剑气 | §3.3 玉女剑法 |

- 天级 8 门与基准 §13 逐条一致：先天功（天中）、天罡北斗阵（天下）、玉女心经（天下）、黯然销魂掌 / 玄铁剑法 / 玉女素心剑法（天中）、太极拳 / 太极剑（天中）；**未新增天级**。
- 调整前为 `8/18/25/15=66`，本轮增加 `0/0/19/31=50`，调整后精确命中 `design/05` §14.5 给本册的受控目标 `8/18/44/46=116`，四阶偏差均为 0。
- 若只对照以 8 门天级机械推导的名义值 `8/24/72/72`，地 / 玄 / 黄分别为 `−6/24=−25.00%`、`−28/72=−38.89%`、`−26/72=−36.11%`。这是“冻结既有天、地且全目录总闸为 1,138”的受控分配结果，不得再自行补门数。

#### 天中／地中绝招区间逐门取值

| 武学 | 品阶 | 绝招数 | 取值理由 |
|---|---:|---:|---|
| 先天功 | 天中 11 | 2 | 现有运功式只有罡气护体与五气朝元两种核心职责，不把普通一气化三清强抬为第三绝招 |
| 黯然销魂掌 | 天中 11 | 3 | 原有掌式充足，三式可分别承担单体爆发、范围乱击、防守反击 |
| 玄铁剑法 | 天中 11 | 2 | 以浑厚重剑劲力取胜；保留草木为剑与大巧不工 |
| 玉女素心剑法 | 天中 11 | 3 | 双剑合璧、双人支援、游身连击三种职责齐全 |
| 太极拳 | 天中 11 | 3 | 抱虎单体、云手范围、十字控场可明确区分 |
| 太极剑 | 天中 11 | 3 | 两仪剑攻、剑圈守御、黏剑卸械可明确区分 |
| 金关玉锁二十四诀 | 地中 8 | 1 | 仅周天护体足以承载核心，另两式是基础开关调息 |
| 重剑意 | 地中 8 | 1 | 现有三式均为蓄势防守链，只保留横行一记核心绝招 |
| 纯阳无极功 | 地中 8 | 1 | 真火是唯一主动攻势，驱寒与归一保留普通运功 |
| 倚天屠龙功 | 地中 8 | 2 | 争锋主攻、号令主范围支援，职责分离 |
| 梯云纵 | 地中 8 | 1 | 轻功以身法运用为主；保留扶摇直上 |
| 真武七截阵 | 地中 8 | 2 | 归真主范围阵击，龟蛇主单体夹击 |
| 阴阳倒乱刃法 | 地中 8 | 2 | 两仪主范围倒乱，金刀主单体奇兵切换 |

### 8.2 按类别 × 大阶

| 大类 | 子类 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---|---|---|---|---|---|
| 内功 | 心法 | 2 | 3 | 7 | 11 | **23** |
| 拳脚 | 拳掌 | 2 | 2 | 7 | 6 | 17 |
| | 指法 | 0 | 0 | 1 | 0 | 1 |
| | 腿法 | 0 | 0 | 0 | 1 | 1 |
| | 擒拿 | 0 | 1 | 2 | 4 | 7 |
| | 小计 | 2 | 3 | 10 | 11 | **26** |
| 兵器 | 剑 | 3 | 3 | 6 | 9 | 21 |
| | 刀 | 0 | 1 | 0 | 1 | 2 |
| | 棍杖 | 0 | 0 | 1 | 0 | 1 |
| | 枪 | 0 | 0 | 0 | 0 | 0 |
| | 鞭索 | 0 | 1 | 4 | 3 | 8 |
| | 奇门 | 0 | 1 | 0 | 0 | 1 |
| | 小计 | 3 | 6 | 11 | 13 | **33** |
| 轻功 | — | 0 | 2 | 6 | 8 | **16** |
| 暗器 | — | 0 | 1 | 3 | 1 | **5** |
| 杂学 | 阵法 | 1 | 1 | 2 | 1 | 5 |
| | 心神 | 0 | 2 | 2 | 0 | 4 |
| | 驭兽 | 0 | 0 | 2 | 1 | 3 |
| | 毒 | 0 | 0 | 1 | 0 | 1 |
| | 小计 | 1 | 3 | 7 | 2 | **13** |
| **合计** | | **8** | **18** | **44** | **46** | **116** |

本轮 50 门新增量按类别为：内功 11、拳脚 9、兵器 15、轻功 11、暗器 1、杂学 3，合计 `11+9+15+11+1+3=50`。23 门内功的 `nature` 分布为阳 8、阴 8、调和 7，均逐门显式登记。

### 8.3 按原生书界

**首现书界**（该武学第一个原生书界）

| 书界 | 境界 | 天 | 地 | 玄 | 黄 | 首现合计 | 本轮首现增量说明 |
|---|---|---|---|---|---|---|---|
| 射雕 `ch02` | 高 | 2 | 2 | 11 | 9 | 24 | 本轮新增玄 5、黄 5；全真新入门链 |
| 神雕 `ch03` | 高 | 4 | 8 | 21 | 21 | 54 | 本轮新增玄 8、黄 14；古墓、剑冢、绝情谷为主 |
| 倚天 `ch04` | 高 | 2 | 6 | 11 | 14 | 33 | 本轮新增玄 6、黄 10；武当新入门链 |
| 书剑 `ch12` | 中 | 0 | 2 | 1 | 0 | 3 | 原有首现；本轮无新增 |
| 鹿鼎 `ch08`★ | 低 | 0 | 0 | 0 | 2 | 2 | 白云观心法、龙门剑式首现；均为原创扩展 |
| **合计** | | **8** | **18** | **44** | **46** | **116** | 本轮首现增量 `0/0/19/31`，与 C3 配额闭合 |

**可习得池**（含跨书界复现；★为原创扩展延伸，须 chapters/ 采纳）

| 书界 | 境界 | 内 | 拳脚 | 兵器 | 轻 | 暗 | 杂 | 合计 | 其中天 / 地 / 玄 / 黄 | 四阶占比 | 局部校核 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|
| 射雕 | 高 | 5 | 8 | 6 | 3 | 0 | 2 | 24 | 2 / 2 / 11 / 9 | 8.33 / 8.33 / 45.83 / 37.50% | 局部池不在高武目标区间 |
| 神雕 | 高 | 13 | 16 | 21 | 11 | 4 | 12 | 77 | 5 / 10 / 32 / 30 | 6.49 / 12.99 / 41.56 / 38.96% | 局部池不在高武目标区间 |
| 倚天 | 高 | 9 | 11 | 11 | 6 | 0 | 1 | 38 | 2 / 7 / 13 / 16 | 5.26 / 18.42 / 34.21 / 42.11% | 玄命中；其余须全目录合并 |
| 笑傲 | 中 | 8 | 9 | 9 | 4 | 0 | 1 | 31 | 2 / 7 / 11 / 11 | 6.45 / 22.58 / 35.48 / 35.48% | 天列两门均为 10 品残承，不计完整原生天级；局部池不单验 |
| 侠客 | 中 | 8 | 8 | 7 | 4 | 0 | 1 | 28 | 0 / 7 / 10 / 11 | 0 / 25.00 / 35.71 / 39.29% | 玄、黄命中；天、地须全目录合并 |
| 书剑 | 中 | 6 | 8 | 4 | 5 | 1 | 0 | 24 | 0 / 5 / 8 / 11 | 0 / 20.83 / 33.33 / 45.83% | 玄命中；其余须全目录合并 |
| 飞狐 | 中 | 5 | 4 | 3 | 3 | 1 | 0 | 16 | 0 / 2 / 5 / 9 | 0 / 12.50 / 31.25 / 56.25% | 局部池不在中武目标区间 |
| 鹿鼎★ | 低 | 3 | 3 | 3 | 1 | 0 | 0 | 10 | 0 / 0 / 1 / 9 | 0 / 0 / 10.00 / 90.00% | 局部入门补位；须全目录合并 |
| 连城★、鸳鸯★（各） | 低 | 2 | 2 | 1 | 1 | 0 | 0 | 6 | 0 / 0 / 1 / 5 | 0 / 0 / 16.67 / 83.33% | 本组不足，由 `ALL14` 补位 |

> 目标区间引用 `design/05` §14.4：高武 `10–15/20–25/30–35/30–35%`，中武 `2–6/15–20/33–38/38–45%`，低武 `0–5/8–12/33–38/48–55%`。上表只校核本图鉴对各书界的**局部贡献**，不能替代全目录唯一 ID 并集；扩充改变了十个书界的分子与分母，须由 F2 / 章节在所有 CX 落盘后重算。神雕“天 5”含回想来源的天罡北斗阵；笑傲两门太极残承另存 `lineageGrade:10`，按可习得池列入天阶栏，但完整原生天级池核对时必须剔除。

### 8.4 境界覆盖与装配可行性

`design/05` §14.6 #4 要求每个正式书界有非互斥、前置闭合的本土内功 / 拳脚 / 兵器各至少 3 门，并且兵器至少 3 门同一子类。下表先核本组，再引用 `skills-general` §11.1 的 `ALL14` 本土底座；`ALL14` 是各书界本地可学来源，不是跨书携带。

| 书界 | 本组内 / 拳 / 兵 | 本组同类兵器证明 | 缺口补位 | 结论 |
|---|---:|---|---|---|
| 天龙 | 0 / 0 / 0 | — | `ALL14` 三内功、三拳脚、三剑链 | 全目录通过；本组不贡献 |
| 射雕 | 5 / 8 / 6 | 终南剑法、全真剑法、同归剑法（另有通玄剑） | 无 | 本组独立通过 |
| 神雕 | 13 / 16 / 21 | 终南剑法、全真剑法、玉女剑法等 | 无 | 本组独立通过 |
| 倚天 | 9 / 11 / 11 | 真武剑法、绕指柔剑、神门十三剑等 | 无 | 本组独立通过 |
| 笑傲 | 8 / 9 / 9 | 真武剑法、柔云剑术、绕指柔剑等 | 无 | 本组独立通过（覆盖证明不靠太极残承） |
| 侠客 | 8 / 8 / 7 | 真武剑法、柔云剑术、神门十三剑等 | 无 | 本组独立通过 |
| 碧血 | 0 / 0 / 0 | — | `ALL14` 三内功、三拳脚、三剑链 | 全目录通过；本组不贡献 |
| 鹿鼎 | 3 / 3 / 3 | 本组为两剑一拂尘，未达同类 3 门 | `ALL14` 三剑链 | 三大类本组通过；同类兵器由通行池补齐 |
| 连城 | 2 / 2 / 1 | 本组仅真武剑法 | `ALL14` 三内功、三拳脚、三剑链 | 全目录通过；本组单独不足 |
| 白马 | 0 / 0 / 0 | — | `ALL14` 三内功、三拳脚、三剑链 | 全目录通过；本组不贡献 |
| 鸳鸯 | 2 / 2 / 1 | 本组仅真武剑法 | `ALL14` 三内功、三拳脚、三剑链 | 全目录通过；本组单独不足 |
| 书剑 | 6 / 8 / 4 | 真武剑法、柔云剑术、神门十三剑、武当入门剑 | 无 | 本组独立通过 |
| 飞狐 | 5 / 4 / 3 | 真武剑法、柔云剑术、武当入门剑 | 无 | 本组独立通过 |
| 雪山 | 0 / 0 / 0 | — | `ALL14` 三内功、三拳脚、三剑链 | 全目录通过；本组不贡献 |

装配槽证明沿 `skills-general` §11.1：三门内功可填主运 1＋辅运 2，三门拳脚可填 3 个拳脚栏，三门同类剑法共享主武器且可填 3 个兵器栏。目录层面的 ID 数与同类武器已闭合；章节仍须保证至少三条来源在同一周目非互斥且前置可达。

### 8.5 黄阶整体预算核对

46 门黄阶已全部进入各门派的八字段一行总表；其中原有 15 门、新增 31 门。表中 Y1–Y5 是下列 `design/05` §4.2 现行预算模板，不是省略预算：

| 模板 | 公式 | 取值与适用 |
|---|---|---|
| Y1 标准单体 | `AF 1.00 × (1+0)` | 5% MPREF、cd0、收招1000、可招架、无附带，取 `1.00` |
| Y2 线 2 | `AF 0.90 × (1+cd1 0.12)=1.008` | 取 `1.00`；若无冷却则取 `0.90` |
| Y3 六格周身 / 扇扫 | `AF 0.75 × (1+cd1 0.12)=0.84` | 取 `0.85` |
| Y4 突进 / 绕背 | `1.00×(1+内力+1% 0.05+cd1 0.12)−位移0.10=1.07` | 取 `1.05` |
| Y5 轻减益 / 击退 | cd0：`1.00−0.03~0.06=0.94~0.97`；cd1：`1.12−0.03~0.06=1.06~1.09` | 依 30% 轻减益或击退 1 的实际成本取 `0.95` / `1.05` / `1.10`，误差 ≤0.05 |
| 支援 / 纯位移 | `power:0` | 单次位移至多 2 格、增益默认不超过 2 回合；不伪配伤害倍率 |
| 黄阶内功 | 黄下 `6+4+2×2+5×1=19`；黄中 `8+5+2×3+5×1=24`；黄上 `10+6+2×4+5×1.2=30` | 11 门内功逐门命中对应 IP，且均显式写 `nature` |
| 黄阶轻功 | `QS(1/2/3)=32/38/45` | 8 门均不越本书界轻功上限 |

所有黄阶无绝招，`layerStats` 入库总量上限为 6。Y5 的持续期采用 06 默认值；不得把持续回合再次乘入 `cost_buff`。

### 8.6 其他自检

| 项 | 结果 |
|---|---|
| 招式 | 本文新定义 303 个 `mv_`（旧 250＋AR-01 玄阶代表式 53），另引用全真剑法 4 个；本次绝招统一不创建新 `mv_*`；天 / 地 / 玄上绝招由统一前 `21/24/22` 调整为 `20/23/22` |
| 被动 | 本文新定义 268 个 `ps_`（旧 215＋新增玄阶 53）；黄阶新增内容以数据模板约束，不在一行卡虚造被动 ID |
| 玄阶预算抽样 | 新增 19 门玄阶中 8 门标“玄阶预算抽样”并列公式，`8÷19=42.11%≥30%`；其余紧凑卡仍给耗内、冷却、收招与附带，导出时全部走同一公式 lint |
| Buff 引用 | 活跃规则共引用 82 个 06 已有 `bf_` ID；本轮只新增既有 `bf_jisu` 的引用，未创建 Buff；`bf_ID` 为记法占位，撤回名只出现在禁止性说明 |
| 内功贡献 | 23 门内功 IP 全部命中 05 §5.5 对应品阶预算；`nature` 为阳 8 / 阴 8 / 调和 7 |
| layerStats | 按大阶上限（黄 6 / 玄 10 / 地 15 / 天 20）逐条校验 |
| 代价 / 合击 | 地阶代价型 1（同归剑法）；另有轻代价 2（闭穴功罩门、虎爪绝户手门规）；地阶合击 1（真武七截阵）——均在 05 §14.6 全局上限内 |
| 原创扩展 | 本轮新增 50 门均在总表和紧凑卡 / 一行表标明“原创扩展”或“取材于原著情节、名称与机制原创”；没有把新造招名伪装成原著引文 |

---

### 8.7 AR-14 经脉运行绑定（`design/21` v2.0）

#### 8.7.1 接口边界与路线码

本节只登记本册既有 `sk_* / mv_*` 与 21 的路线、调息接口，不重定义河流状态、乘区、护体内劲或速度公式。`MoveDef.meridianRouteRef` 指向 `MeridianRouteDef`；太极被动使用 `routeOnTriggerRef`；内功以 `breathProfileRef` 指向 `BreathProfile`。固定结算次序仍是 `Z0–Z4 → Z4M → Z5 → Z5M → Z6–Z10 → 护体真气 → 护体内劲 → mpGuard → 气血`；每个独立单位各有一个 `MeridianFlowModule`，`preview` 无写入、无 RNG 消耗（21 §4.4、§11–§12）。
落库字段严格复用 21 §12：`MeridianRouteDef.id/moveRef/ultimate/purpose/requiredNature/steps`，其中 `RouteStep.acupointRef/segmentCt/riskBp`；`BreathProfile.id/grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp`。

- 路线 ID 为 `mfr_<完整 move ID 去掉 mv_>`，调息档案为 `txp_<完整 skill ID 去掉 sk_>`；二者已由基准 V13-05 登记，schema 见 21 §16.2。路线码只用于本文排版，构建时必须展开真实 `ap_*`。
- `AT/DF/MV` 对应 `purpose:attack/defense/movement`；`Y/I/H` 对应阳 / 阴 / 调和几何。中性武学用 H 且 `requiredNature:[yin,yang,harmony]`，不得写 `neutral`。治疗、纯支援路线不套攻击乘区。
- 表内 `true/false` 显式镜像 `MoveDef.ultimate`，且 `route.ultimate` 必须相等。`IG` 表示附 `innerGuard:{enabled:true,reflectBp:0}`；显示档不提供额外倍率，既有反震继续由 06 单一结算。
- 天 / 地阶全部逐招显式登记；玄上绝招也在 §8.7.6 逐项登记。其余玄 / 黄招式按确定性模板展开唯一 `mfr_<move>`，不得把模板码存入正式数据。

模板引用 21 §5.2 已完整列出的 A 任脉、B 督脉、C 手太阴、D 手厥阴、E 手阳明、F 腰腿、G 带督片段：

| 码 | `purpose / requiredNature` | `steps`（依次） | ΣCT | 适用 |
|---|---|---|---:|---|
| `AT-Y4` | attack / `[yang,harmony]` | `ap_shouyangming_quchi/70/80 → ap_shouyangming_shousanli/70/100 → ap_shouyangming_hegu/70/120 → ap_shouyangming_shangyang/70/140` | 280 | 阳性短攻 |
| `AT-Y6` | attack / `[yang,harmony]` | `ap_dumai_mingmen/70/80 → ap_dumai_zhiyang/70/100 → ap_dumai_shendao/70/120 → ap_dumai_baihui/70/140 → ap_shouyangming_quchi/70/350 → ap_shouyangming_hegu/70/150` | 420 | 阳性换脉攻 |
| `AT-Y8` | attack / `[yang,harmony]` | 督脉 B 四穴后接手阳明 E 四穴；CT 均 70，风险 `80/100/120/140/400/100/120/140` | 560 | 阳性重招 |
| `U-Y8` | attack / `[yang,harmony]` | `ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui→ap_shouyangming_quchi→ap_shouyangming_shousanli→ap_shouyangming_hegu→ap_shouyangming_shangyang`；CT 均 90，风险 `100/150/180/250/350/180/150/120` | 720 | 阳性地阶绝招；防守 / 移动同骨架改 `purpose` |
| `U-Y10` | attack / `[yang,harmony]` | `ap_renmai_qihai→ap_renmai_danzhong→ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui→ap_shouyangming_quchi→ap_shouyangming_shousanli→ap_shouyangming_hegu→ap_shouyangming_shangyang`；CT 均 80，风险 `100/150/350/150/180/250/350/180/150/120` | 800 | 阳性天阶绝招；防守同骨架改 `purpose` |
| `AT-I4` | attack / `[yin,harmony]` | 手太阴 C 四穴；CT 均 70，风险 `80/100/120/140` | 280 | 阴性短攻 |
| `AT-I6` | attack / `[yin,harmony]` | 手厥阴 D 五穴后接 `ap_shoutaiyin_yunmen`；CT 均 70，风险 `80/100/120/140/160/350` | 420 | 阴性换脉攻 |
| `AT-I8` | attack / `[yin,harmony]` | 手太阴 C 四穴后接手厥阴 D 前四穴；CT 均 70，风险 `80/100/120/140/400/100/120/140` | 560 | 阴性重招 |
| `U-I8` | attack / `[yin,harmony]` | `ap_renmai_qihai→ap_renmai_guanyuan→ap_renmai_zhongwan→ap_renmai_danzhong→ap_shoujueyin_tianchi→ap_shoujueyin_quze→ap_shoujueyin_neiguan→ap_shoujueyin_laogong`；CT 均 90，风险 `100/100/150/180/350/200/180/150` | 720 | 阴性地阶绝招；防守 / 移动同骨架改 `purpose` |
| `U-I10` | attack / `[yin,harmony]` | 上列八穴后接 `ap_shoujueyin_zhongchong→ap_shoutaiyin_shaoshang`；CT 均 80，风险 `100/100/120/150/350/180/160/140/120/300` | 800 | 阴性天阶绝招；防守同骨架改 `purpose` |
| `AT-H4` | attack / `[yin,yang,harmony]` | 腰腿 F 四穴；CT 均 70，风险 `80/100/120/140` | 280 | 调和 / 中性短攻 |
| `AT-H6` | attack / `[yin,yang,harmony]` | 带督 G 四穴后接手厥阴 D 前二穴；CT 均 70，风险 `80/100/120/140/400/120` | 420 | 调和 / 中性换脉攻 |
| `AT-H8` | attack / `[yin,yang,harmony]` | 带督 G 四穴后接手太阴 C 四穴；CT 均 70，风险 `80/100/120/140/400/100/120/140` | 560 | 调和 / 中性重招 |
| `U-H8` | attack / `[yin,yang,harmony]` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_daimai_zulinqi→ap_daimai_weidao→ap_daimai_daimai→ap_dumai_zhiyang`；CT 均 90，风险 `100/120/180/250/350/180/160/150` | 720 | 调和 / 中性地阶绝招；防守 / 移动同骨架改 `purpose` |
| `U-H10` | attack / `[yin,yang,harmony]` | 上列八穴后接 `ap_renmai_qihai→ap_renmai_danzhong`；CT 均 80，风险 `100/120/180/250/350/180/160/150/350/150` | 800 | 调和 / 中性天阶绝招；防守同骨架改 `purpose` |
| `U-Y6` | attack / `[yang,harmony]` | `ap_dumai_mingmen→ap_dumai_zhiyang→ap_dumai_shendao→ap_dumai_baihui→ap_shouyangming_hegu→ap_shouyangming_shangyang`；CT 均 100，风险 `100/150/180/250/220/160` | 600 | 阳性玄上绝招 |
| `U-I6` | attack / `[yin,harmony]` | `ap_renmai_qihai→ap_renmai_guanyuan→ap_renmai_zhongwan→ap_renmai_danzhong→ap_shoujueyin_neiguan→ap_shoujueyin_laogong`；CT 均 100，风险 `100/120/180/250/220/180` | 600 | 阴性玄上绝招 |
| `U-H6` | attack / `[yin,yang,harmony]` | `ap_zushaoyin_yongquan→ap_zushaoyin_taixi→ap_zutaiyang_weizhong→ap_dumai_mingmen→ap_daimai_zulinqi→ap_daimai_daimai`；CT 均 100，风险 `100/120/180/250/220/160` | 600 | 调和 / 中性玄上绝招；防守 / 移动同骨架改 `purpose` |
| `DF-Y4/6` | defense / `[yang,harmony]` | 督脉 B 四穴 / B 后接手阳明 E 前二穴；CT 均 70，风险 `50/70/90/110[/300/100]` | 280 / 420 | 阳性防线 |
| `DF-I4/6` | defense / `[yin,harmony]` | 任脉 A 四穴 / A 后接手厥阴 D 前二穴；CT 均 70，风险 `50/70/90/110[/300/100]` | 280 / 420 | 阴性防线 |
| `DF-H4/6` | defense / `[yin,yang,harmony]` | 带督 G 四穴 / G 后接手厥阴 D 前二穴；CT 均 70，风险 `50/70/90/110[/300/100]` | 280 / 420 | 调和 / 中性防线 |
| `MV-Y4/8` | movement / `[yang,harmony]` | 阳跷前 4 / 8 穴；CT 均 60，风险前四 `50/70/90/110`、后四 `250/70/90/110` | 240 / 480 | 阳性轻功 |
| `MV-I4/8` | movement / `[yin,harmony]` | 阴跷前 4；八段为阴跷六穴后接 `ap_shoujueyin_tianchi→ap_shoujueyin_quze`；CT 均 60，风险同上 | 240 / 480 | 阴性轻功 |
| `MV-H4/8` | movement / `[yin,yang,harmony]` | 腰腿 F 四穴 / F 后接带督 G 四穴；CT 均 60，风险同上 | 240 / 480 | 调和 / 中性轻功 |

每个模板均为 1–18 段、穴位不重复、`segmentCt=60/70/80/90/100`、`riskBp=50..450`。玄上、地、天绝招分别增加 600、720、800 CT，配合 1200 收招为 `1800/1920/2000 CT`，均不超过 2000。

##### AR-16 / AR-17 普通外放路线实例登记

下表将本轮新增引用的普通外放路线登记为本册正式 `MeridianRouteDef` 实例；每行与上表展开码合并后得到完整 `steps`。两条路线均为 `ultimate:false`、`purpose:attack`。

| 路线 ID | `moveRef` | `requiredNature` | 展开码 | 合法外放端点 |
|---|---|---|---|---|
| `mfr_wudangjiemaishou_huantiao` | `mv_wudangjiemaishou_huantiao` | `[yang,harmony]` | 显式：`ap_dumai_mingmen/70/80→ap_dumai_zhiyang/70/100→ap_dumai_shendao/70/120→ap_dumai_baihui/70/140→ap_shouyangming_quchi/70/350→ap_shouyangming_shangyang/70/150` | `ap_shouyangming_shangyang` |
| `mfr_yunvjian_lengyue` | `mv_yunvjian_lengyue` | `[yin,harmony]` | `AT-I6` | `ap_shoujueyin_neiguan`、`ap_shoujueyin_laogong`、`ap_shoujueyin_zhongchong` |

#### 8.7.2 天 / 地阶逐招绑定（全真、古墓）

每项格式为 `moveRef→meridianRouteRef/ultimate/purpose/骨架`；每个 `mfr_*` 都是稳定、唯一的路线 ID。

| 武学（品阶 / 性质） | 逐招 `mv_*→mfr_*/ultimate/purpose/骨架` |
|---|---|
| 先天功 `sk_xiantiangong`（天中 / 阳） | `mv_xiantiangong_gangqi→mfr_xiantiangong_gangqi/true/defense/显式`；`mv_xiantiangong_yiqi→mfr_xiantiangong_yiqi/false/attack/AT-Y8`；`mv_xiantiangong_wuqi→mfr_xiantiangong_wuqi/true/attack/显式（见本册绝招显式路线索引）` |
| 天罡北斗阵 `sk_tiangang`（天下 / 阳） | `mv_tiangang_buzhen→mfr_tiangang_buzhen/false/defense/DF-Y6`；`mv_tiangang_hewei→mfr_tiangang_hewei/true/attack/显式`；`mv_tiangang_doubing→mfr_tiangang_doubing/false/movement/MV-Y8`；`mv_tiangang_tianshu→mfr_tiangang_tianshu/false/defense/DF-Y6`；`mv_tiangang_guiyi→mfr_tiangang_guiyi/true/attack/显式（见本册绝招显式路线索引）` |
| 金关玉锁二十四诀 `sk_jinguanyusuo`（地中 / 调和） | `mv_jinguanyusuo_suoqiao→mfr_jinguanyusuo_suoqiao/false/defense/DF-H6`；`mv_jinguanyusuo_kaiguan→mfr_jinguanyusuo_kaiguan/false/defense/DF-H6`；`mv_jinguanyusuo_zhoutian→mfr_jinguanyusuo_zhoutian/true/defense/显式（见本册绝招显式路线索引）` |
| 同归剑法 `sk_tongguijian`（地下 / 阳） | `mv_tongguijian_boming→mfr_tongguijian_boming/false/attack/AT-Y6`；`mv_tongguijian_yushi→mfr_tongguijian_yushi/false/attack/AT-Y8`；`mv_tongguijian_liangbai→mfr_tongguijian_liangbai/false/defense/DF-Y4`；`mv_tongguijian_pofu→mfr_tongguijian_pofu/false/defense/DF-Y4`；`mv_tongguijian_tonggui→mfr_tongguijian_tonggui/true/attack/显式（见本册绝招显式路线索引）`；`mv_tongguijian_bugong→mfr_tongguijian_bugong/false/attack/AT-Y8` |
| 玉女心经 `sk_yunvxinjing`（天下 / 阴） | `mv_yunvxinjing_sanre→mfr_yunvxinjing_sanre/false/defense/DF-I6`；`mv_yunvxinjing_hufa→mfr_yunvxinjing_hufa/true/defense/显式`；`mv_yunvxinjing_bingxin→mfr_yunvxinjing_bingxin/true/defense/显式（见本册绝招显式路线索引）` |
| 赤练神掌 `sk_chilianshenzhang`（地下 / 阴） | `mv_chilianshenzhang_tuxin→mfr_chilianshenzhang_tuxin/false/attack/AT-I6`；`mv_chilianshenzhang_zhangyin→mfr_chilianshenzhang_zhangyin/false/attack/AT-I6`；`mv_chilianshenzhang_chanshen→mfr_chilianshenzhang_chanshen/false/attack/AT-I8`；`mv_chilianshenzhang_fanlin→mfr_chilianshenzhang_fanlin/false/attack/AT-I8`；`mv_chilianshenzhang_xiangxu→mfr_chilianshenzhang_xiangxu/true/attack/显式（见本册绝招显式路线索引）`；`mv_chilianshenzhang_wudu→mfr_chilianshenzhang_wudu/false/attack/AT-I8` |
| 金铃索法 `sk_jinlingsuo`（地下 / 阴） | `mv_jinlingsuo_dianxue→mfr_jinlingsuo_dianxue/false/attack/AT-I6`；`mv_jinlingsuo_lingyin→mfr_jinlingsuo_lingyin/false/attack/AT-I6`；`mv_jinlingsuo_chanwan→mfr_jinlingsuo_chanwan/false/attack/AT-I8`；`mv_jinlingsuo_huifeng→mfr_jinlingsuo_huifeng/false/attack/AT-I8`；`mv_jinlingsuo_shepo→mfr_jinlingsuo_shepo/true/attack/显式（见本册绝招显式路线索引）`；`mv_jinlingsuo_lingshe→mfr_jinlingsuo_lingshe/false/attack/AT-I8` |
| 冰魄银针 `sk_bingpoyinzhen`（地下 / 阴） | `mv_bingpoyinzhen_danzhen→mfr_bingpoyinzhen_danzhen/false/attack/AT-I6`；`mv_bingpoyinzhen_sanzhen→mfr_bingpoyinzhen_sanzhen/false/attack/AT-I6`；`mv_bingpoyinzhen_mantian→mfr_bingpoyinzhen_mantian/false/attack/AT-I8`；`mv_bingpoyinzhen_shehun→mfr_bingpoyinzhen_shehun/true/attack/显式（见本册绝招显式路线索引）` |
| 古墓轻功 `sk_gumuqinggong`（地上 / 阴） | `mv_gumuqinggong_jueji→mfr_gumuqinggong_jueji/false/movement/MV-I4`；`mv_gumuqinggong_tabi→mfr_gumuqinggong_tabi/false/movement/MV-I8`；`mv_gumuqinggong_youshen→mfr_gumuqinggong_youshen/true/movement/显式`；`mv_gumuqinggong_fenying→mfr_gumuqinggong_fenying/true/movement/显式（见本册绝招显式路线索引）` |

#### 8.7.3 天 / 地阶逐招绑定（杨过与剑冢）

| 武学（品阶 / 性质） | 逐招 `mv_*→mfr_*/ultimate/purpose/骨架` |
|---|---|
| 黯然销魂掌 `sk_anran`（天中 / 阴） | `mv_anran_xinjing→mfr_anran_xinjing/false/attack/AT-I6`；`mv_anran_tuoni→mfr_anran_tuoni/false/attack/AT-I6`；`mv_anran_qiren→mfr_anran_qiren/false/attack/AT-I8`；`mv_anran_wuzhong→mfr_anran_wuzhong/false/attack/AT-I6`；`mv_anran_paihuai→mfr_anran_paihuai/false/attack/AT-I8`；`mv_anran_libucongxin→mfr_anran_libucongxin/false/defense/DF-I6`；`mv_anran_xingshi→mfr_anran_xingshi/false/attack/AT-I8`；`mv_anran_yongren→mfr_anran_yongren/false/attack/AT-I8`；`mv_anran_daoxing→mfr_anran_daoxing/false/attack/AT-I8`；`mv_anran_feiqin→mfr_anran_feiqin/false/attack/AT-I6`；`mv_anran_guxing→mfr_anran_guxing/false/attack/AT-I8`；`mv_anran_yinhen→mfr_anran_yinhen/false/defense/DF-I6+IG`；`mv_anran_liushen→mfr_anran_liushen/false/attack/AT-I8`；`mv_anran_qiongtu→mfr_anran_qiongtu/false/attack/AT-I8`；`mv_anran_xiaohun→mfr_anran_xiaohun/true/attack/显式（见本册绝招显式路线索引）`；`mv_anran_mianwu→mfr_anran_mianwu/false/attack/AT-I8`；`mv_anran_xiangru→mfr_anran_xiangru/true/attack/显式`；`mv_anran_daimu→mfr_anran_daimu/true/attack/显式` |
| 玄铁剑法 `sk_xuantie`（天中 / 中性） | `mv_xuantie_wufeng→mfr_xuantie_wufeng/false/attack/AT-H6`；`mv_xuantie_daqiao→mfr_xuantie_daqiao/true/attack/显式`；`mv_xuantie_shanhong→mfr_xuantie_shanhong/false/attack/AT-H8`；`mv_xuantie_haichao→mfr_xuantie_haichao/false/attack/AT-H8`；`mv_xuantie_diaoyi→mfr_xuantie_diaoyi/false/attack/AT-H8`；`mv_xuantie_zangfeng→mfr_xuantie_zangfeng/false/defense/DF-H6`；`mv_xuantie_qianjun→mfr_xuantie_qianjun/false/attack/AT-H8`；`mv_xuantie_caomu→mfr_xuantie_caomu/true/attack/显式（见本册绝招显式路线索引）` |
| 玉女素心剑法 `sk_suxin`（天中 / 调和） | `mv_suxin_langji→mfr_suxin_langji/false/attack/AT-H8`；`mv_suxin_huaqian→mfr_suxin_huaqian/true/attack/显式`；`mv_suxin_qingyin→mfr_suxin_qingyin/false/defense/DF-H6`；`mv_suxin_fuqin→mfr_suxin_fuqin/false/attack/AT-H8`；`mv_suxin_songxia→mfr_suxin_songxia/false/defense/DF-H6`；`mv_suxin_chibian→mfr_suxin_chibian/false/attack/AT-H8`；`mv_suxin_saoxue→mfr_suxin_saoxue/false/attack/AT-H8`；`mv_suxin_hebi→mfr_suxin_hebi/true/attack/显式（见本册绝招显式路线索引）`；`mv_suxin_juan→mfr_suxin_juan/true/defense/显式` |
| 重剑意 `sk_zhongjianyi`（地中 / 中性） | `mv_zhongjianyi_fujian→mfr_zhongjianyi_fujian/false/defense/DF-H4`；`mv_zhongjianyi_chenjian→mfr_zhongjianyi_chenjian/false/defense/DF-H6`；`mv_zhongjianyi_hengxing→mfr_zhongjianyi_hengxing/true/defense/显式（见本册绝招显式路线索引）` |
| 木剑意 `sk_mujianyi`（地上 / 中性） | `mv_mujianyi_zhezhi→mfr_mujianyi_zhezhi/false/defense/DF-H4`；`mv_mujianyi_caomu→mfr_mujianyi_caomu/true/defense/显式`；`mv_mujianyi_wanwu→mfr_mujianyi_wanwu/true/attack/显式（见本册绝招显式路线索引）` |

#### 8.7.4 天 / 地阶逐招绑定（武当）

| 武学（品阶 / 性质） | 逐招 `mv_*→mfr_*/ultimate/purpose/骨架` |
|---|---|
| 太极拳 `sk_taijiquan`（天中 / 调和） | `mv_taijiquan_lanque→mfr_taijiquan_lanque/false/attack/AT-H6`；`mv_taijiquan_danbian→mfr_taijiquan_danbian/false/attack/AT-H6`；`mv_taijiquan_baihe→mfr_taijiquan_baihe/false/defense/DF-H6`；`mv_taijiquan_louxi→mfr_taijiquan_louxi/false/attack/AT-H8`；`mv_taijiquan_shouhui→mfr_taijiquan_shouhui/false/attack/AT-H8`；`mv_taijiquan_banlan→mfr_taijiquan_banlan/false/attack/AT-H8`；`mv_taijiquan_rufeng→mfr_taijiquan_rufeng/false/defense/DF-H6`；`mv_taijiquan_shizi→mfr_taijiquan_shizi/true/attack/显式`；`mv_taijiquan_baohu→mfr_taijiquan_baohu/true/attack/显式（见本册绝招显式路线索引）`；`mv_taijiquan_yunshou→mfr_taijiquan_yunshou/true/attack/显式`。`ps_taijiquan_siliang.routeOnTriggerRef=mfr_taijiquan_rufeng` |
| 太极剑 `sk_taijijian`（天中 / 调和） | `mv_taijijian_sanhuan→mfr_taijijian_sanhuan/false/attack/AT-H6`；`mv_taijijian_dakuixing→mfr_taijijian_dakuixing/false/defense/DF-H4`；`mv_taijijian_yanzi→mfr_taijijian_yanzi/false/attack/AT-H8`；`mv_taijijian_lansao→mfr_taijijian_lansao/false/attack/AT-H8`；`mv_taijijian_xiaokuixing→mfr_taijijian_xiaokuixing/false/defense/DF-H6`；`mv_taijijian_jianquan→mfr_taijijian_jianquan/true/defense/显式`；`mv_taijijian_zhanjian→mfr_taijijian_zhanjian/true/attack/显式`；`mv_taijijian_liangyi→mfr_taijijian_liangyi/true/attack/显式（见本册绝招显式路线索引）` |
| 纯阳无极功 `sk_chunyangwuji`（地中 / 阳） | `mv_chunyangwuji_quhan→mfr_chunyangwuji_quhan/false/defense/DF-Y6`；`mv_chunyangwuji_guiyi→mfr_chunyangwuji_guiyi/false/defense/DF-Y6+IG`；`mv_chunyangwuji_zhenhuo→mfr_chunyangwuji_zhenhuo/true/attack/显式（见本册绝招显式路线索引）` |
| 虎爪绝户手 `sk_huzhaojuehushou`（地下 / 阳） | `mv_huzhaojuehushou_huzhao→mfr_huzhaojuehushou_huzhao/false/attack/AT-Y6`；`mv_huzhaojuehushou_yaoyan→mfr_huzhaojuehushou_yaoyan/false/attack/AT-Y6`；`mv_huzhaojuehushou_pushi→mfr_huzhaojuehushou_pushi/false/attack/AT-Y8`；`mv_huzhaojuehushou_fenjin→mfr_huzhaojuehushou_fenjin/false/attack/AT-Y8`；`mv_huzhaojuehushou_juehu→mfr_huzhaojuehushou_juehu/true/attack/显式（见本册绝招显式路线索引）` |
| 无极玄功拳 `sk_wujixuangongquan`（地下 / 阳） | `mv_wujixuangongquan_qishou→mfr_wujixuangongquan_qishou/false/attack/AT-Y6`；`mv_wujixuangongquan_guanquan→mfr_wujixuangongquan_guanquan/false/attack/AT-Y6`；`mv_wujixuangongquan_lianhuan→mfr_wujixuangongquan_lianhuan/false/attack/AT-Y8`；`mv_wujixuangongquan_zhenshan→mfr_wujixuangongquan_zhenshan/false/attack/AT-Y8`；`mv_wujixuangongquan_huoshou→mfr_wujixuangongquan_huoshou/true/attack/显式（见本册绝招显式路线索引）` |
| 柔云剑术 `sk_rouyunjian`（地下 / 调和） | `mv_rouyunjian_liuyun→mfr_rouyunjian_liuyun/false/attack/AT-H6`；`mv_rouyunjian_chuxiu→mfr_rouyunjian_chuxiu/false/attack/AT-H6`；`mv_rouyunjian_chanyun→mfr_rouyunjian_chanyun/false/attack/AT-H8`；`mv_rouyunjian_yunshen→mfr_rouyunjian_yunshen/false/attack/AT-H8`；`mv_rouyunjian_wanli→mfr_rouyunjian_wanli/true/attack/显式（见本册绝招显式路线索引）` |
| 神门十三剑 `sk_shenmen13`（地下 / 阳） | `mv_shenmen13_cixue→mfr_shenmen13_cixue/false/attack/AT-Y6`；`mv_shenmen13_lianci→mfr_shenmen13_lianci/false/attack/AT-Y6`；`mv_shenmen13_fengwan→mfr_shenmen13_fengwan/false/attack/AT-Y8`；`mv_shenmen13_duobing→mfr_shenmen13_duobing/false/attack/AT-Y8`；`mv_shenmen13_shisan→mfr_shenmen13_shisan/true/attack/显式（见本册绝招显式路线索引）` |
| 倚天屠龙功 `sk_yitiantulonggong`（地中 / 调和） | `mv_yitiantulonggong_wulin→mfr_yitiantulonggong_wulin/false/attack/AT-H6`；`mv_yitiantulonggong_tulong→mfr_yitiantulonggong_tulong/false/attack/AT-H6`；`mv_yitiantulonggong_haoling→mfr_yitiantulonggong_haoling/true/attack/显式`；`mv_yitiantulonggong_mogan→mfr_yitiantulonggong_mogan/false/attack/AT-H8`；`mv_yitiantulonggong_yitian→mfr_yitiantulonggong_yitian/false/defense/DF-H6`；`mv_yitiantulonggong_zhengfeng→mfr_yitiantulonggong_zhengfeng/true/attack/显式（见本册绝招显式路线索引）` |
| 梯云纵 `sk_tiyunzong`（地中 / 阳） | `mv_tiyunzong_bashen→mfr_tiyunzong_bashen/false/movement/MV-Y4`；`mv_tiyunzong_tiyun→mfr_tiyunzong_tiyun/false/movement/MV-Y8`；`mv_tiyunzong_zongyue→mfr_tiyunzong_zongyue/false/movement/MV-Y8`；`mv_tiyunzong_fuyao→mfr_tiyunzong_fuyao/true/movement/显式（见本册绝招显式路线索引）` |
| 真武七截阵 `sk_zhenwuqijie`（地中 / 阳） | `mv_zhenwuqijie_jiezhen→mfr_zhenwuqijie_jiezhen/false/defense/DF-Y6`；`mv_zhenwuqijie_guishe→mfr_zhenwuqijie_guishe/true/attack/显式`；`mv_zhenwuqijie_guishou→mfr_zhenwuqijie_guishou/false/defense/DF-Y6`；`mv_zhenwuqijie_shejin→mfr_zhenwuqijie_shejin/false/movement/MV-Y8`；`mv_zhenwuqijie_guizhen→mfr_zhenwuqijie_guizhen/true/attack/显式（见本册绝招显式路线索引）` |

#### 8.7.5 天 / 地阶逐招绑定（绝情谷）与覆盖核算

| 武学（品阶 / 性质） | 逐招 `mv_*→mfr_*/ultimate/purpose/骨架` |
|---|---|
| 闭穴功 `sk_bixuegong`（地下 / 阴） | `mv_bixuegong_bixue→mfr_bixuegong_bixue/false/defense/DF-I6+IG`；`mv_bixuegong_chongxue→mfr_bixuegong_chongxue/false/defense/DF-I6`；`mv_bixuegong_suoyuan→mfr_bixuegong_suoyuan/true/defense/显式（见本册绝招显式路线索引）` |
| 阴阳倒乱刃法 `sk_yinyangdaoluan`（地中 / 调和） | `mv_yinyangdaoluan_huyi→mfr_yinyangdaoluan_huyi/false/attack/AT-H6`；`mv_yinyangdaoluan_heijian→mfr_yinyangdaoluan_heijian/false/attack/AT-H6`；`mv_yinyangdaoluan_jindao→mfr_yinyangdaoluan_jindao/true/attack/显式`；`mv_yinyangdaoluan_daoluan→mfr_yinyangdaoluan_daoluan/false/attack/AT-H8`；`mv_yinyangdaoluan_qinghua→mfr_yinyangdaoluan_qinghua/false/attack/AT-H8`；`mv_yinyangdaoluan_liangyi→mfr_yinyangdaoluan_liangyi/true/attack/显式（见本册绝招显式路线索引）` |

至此覆盖本册天 / 地阶 26 门、146 个既有招式；统一后天阶绝招 20、地阶绝招 23，均复用既有招式。`route.ultimate` 必须逐项等于 `MoveDef.ultimate`；防守、阵法、治疗与支援路线仍消耗 `flowCt`，但不套攻击乘区。

#### 同门第二／第三绝招显式路线

以下路线沿用既有 ID，只重写步骤；同门路线在穴位集合、CT／风险数组和战术职责上区分。太极卸力触发线也在此显式定义，普通招收招按 1000 核算。

| 武学 | moveRef | 路线 ID | purpose | 职责 | 显式步骤 | 段数 | 路线 CT | 风险数组 | 总风险 | 收招 + 路线 |
|---|---|---|---|---|---|---:|---:|---|---:|---:|
| 黯然销魂掌 | `mv_anran_xiangru` | `mfr_anran_xiangru` | attack | 范围乱击压阵 | 见文首索引 | 10 | 800 | `100/120/140/160/180/200/220/240/260/280` | 1900 | 2000 |
| 〃 | `mv_anran_daimu` | `mfr_anran_daimu` | attack | 防守反击卸势 | 见文首索引 | 10 | 795 | `90/120/150/200/170/140/110/100/130/160` | 1370 | 1995 |
| 玉女心经 | `mv_yunvxinjing_hufa` | `mfr_yunvxinjing_hufa` | defense | 友方护法支援 | 见文首索引 | 10 | 795 | `90/120/150/200/170/140/110/100/130/160` | 1370 | 1995 |
| 玉女素心剑法 | `mv_suxin_juan` | `mfr_suxin_juan` | defense | 双人协力支援 | 见文首索引 | 10 | 750 | `100/110/120/130/140/150/160/170/180/190` | 1450 | 1950 |
| 〃 | `mv_suxin_huaqian` | `mfr_suxin_huaqian` | attack | 突进连击游身 | 见文首索引 | 10 | 750 | `100/110/120/130/140/150/160/170/180/190` | 1450 | 1950 |
| 太极剑 | `mv_taijijian_jianquan` | `mfr_taijijian_jianquan` | defense | 剑圈防守 | 见文首索引 | 10 | 750 | `100/110/120/130/140/150/160/170/180/190` | 1450 | 1950 |
| 〃 | `mv_taijijian_zhanjian` | `mfr_taijijian_zhanjian` | attack | 单体黏剑卸械 | 见文首索引 | 10 | 750 | `100/110/120/130/140/150/160/170/180/190` | 1450 | 1950 |
| 太极拳 | `mv_taijiquan_yunshou` | `mfr_taijiquan_yunshou` | attack | 范围云手控场 | 见文首索引 | 10 | 750 | `100/110/120/130/140/150/160/170/180/190` | 1450 | 1950 |
| 〃 | `mv_taijiquan_shizi` | `mfr_taijiquan_shizi` | attack | 单体十字重击 | 见文首索引 | 10 | 750 | `100/110/120/130/140/150/160/170/180/190` | 1450 | 1950 |
| 玄铁剑法 | `mv_xuantie_caomu` | `mfr_xuantie_caomu` | attack | 范围横扫清场 | 见文首索引 | 10 | 770 | `80/100/120/140/180/220/160/130/110/90` | 1330 | 1970 |
| 〃 | `mv_xuantie_daqiao` | `mfr_xuantie_daqiao` | attack | 单体重剑破阵 | 见文首索引 | 10 | 750 | `100/110/120/130/140/150/160/170/180/190` | 1450 | 1950 |
| 天罡北斗阵 | `mv_tiangang_hewei` | `mfr_tiangang_hewei` | attack | 单体合围锁定 | 见文首索引 | 10 | 750 | `100/110/120/130/140/150/160/170/180/190` | 1450 | 1950 |
| 先天功 | `mv_xiantiangong_gangqi` | `mfr_xiantiangong_gangqi` | defense | 自身罡气护体 | 见文首索引 | 10 | 795 | `90/120/150/200/170/140/110/100/130/160` | 1370 | 1995 |
| 古墓轻功 | `mv_gumuqinggong_youshen` | `mfr_gumuqinggong_youshen` | movement | 游身突进 | 见文首索引 | 8 | 712 | `90/110/130/150/210/170/140/120` | 1120 | 1912 |
| 木剑意 | `mv_mujianyi_caomu` | `mfr_mujianyi_caomu` | defense | 草木竹石支援 | 见文首索引 | 8 | 712 | `90/110/130/150/210/170/140/120` | 1120 | 1912 |
| 阴阳倒乱刃法 | `mv_yinyangdaoluan_jindao` | `mfr_yinyangdaoluan_jindao` | attack | 单体奇兵切换 | 见文首索引 | 8 | 600 | `100/110/120/130/140/150/160/170` | 1080 | 1800 |
| 倚天屠龙功 | `mv_yitiantulonggong_haoling` | `mfr_yitiantulonggong_haoling` | attack | 范围号令控场 | 见文首索引 | 8 | 600 | `100/110/120/130/140/150/160/170` | 1080 | 1800 |
| 真武七截阵 | `mv_zhenwuqijie_guishe` | `mfr_zhenwuqijie_guishe` | attack | 单体龟蛇夹击 | 见文首索引 | 8 | 708 | `100/120/160/220/180/150/130/110` | 1170 | 1908 |
| 太极拳触发线 | `mv_taijiquan_rufeng` | `mfr_taijiquan_rufeng` | defense | 卸力防线，供 `ps_taijiquan_siliang` 触发 | `ap_daimai_zulinqi/70/50 → ap_daimai_weidao/70/70 → ap_daimai_daimai/70/90 → ap_dumai_zhiyang/70/110 → ap_shoujueyin_tianchi/70/300 → ap_shoujueyin_quze/70/100` | 6 | 420 | `50/70/90/110/300/100` | 720 | 1420 |

##### 跨武学高相似路线说明（21 §4.3.4 / MF-V04c）

本任务不保留高相似豁免。路线叙事第三轮将道家单元名下 30 对全部改至 `overlapBp<8000`，且没有新造同序或高相似配对；其余仍涉及本册、但已分派给其他单元的旧配对，由对应路线归属任务处理，不在本任务越权改动。此前暂留的三对共同传承路线也已改开，追溯如下：

| 路线 A | 路线 B | 改前 overlapBp | 改后 overlapBp | 处理 |
|---|---|---:|---:|---|
| `mfr_tongguijian_tonggui` | `mfr_suxin_hebi` | 8750 | 2500 | 保留同归剑法，重写素心合璧的双剑并行段 |
| `mfr_xuantie_caomu` | `mfr_mujianyi_caomu` | 10000 | 2500 | 两侧分别突出重剑外放与木剑卸劲，不再完整继承同一核心段 |
| `mfr_sanhuajudingzhang_juding` | `mfr_jinyangong_yanhui` | 8333 | 5000 | 保留掌法聚劲，改写轻功为带脉、足少阳回身 |

**本轮改写路线镜像核对**

下表仅镜像文首索引的数值，不形成第二份 `steps` 定义；所有招式收招均为 1200 CT。

| 路线 | 模板代号 | 段数 | 路线 CT | 风险列表 | 总风险 | 收招 + 路线 |
|---|---|---:|---:|---|---:|---:|
| `mfr_xiantiangong_gangqi` | 见文首索引 | 10 | 795 | `90/120/150/200/170/140/110/100/130/160` | 1370 | 1995 |
| `mfr_yunvxinjing_hufa` | 见文首索引 | 10 | 795 | `90/120/150/200/170/140/110/100/130/160` | 1370 | 1995 |
| `mfr_yunvxinjing_bingxin` | 见文首索引 | 10 | 800 | `100/120/140/160/180/200/220/240/260/280` | 1900 | 2000 |
| `mfr_bingpoyinzhen_shehun` | 见文首索引 | 8 | 720 | `100/120/140/160/180/200/220/240` | 1360 | 1920 |
| `mfr_gumuqinggong_youshen` | 见文首索引 | 8 | 712 | `90/110/130/150/210/170/140/120` | 1120 | 1912 |
| `mfr_anran_xiaohun` | 见文首索引 | 10 | 800 | `100/120/140/160/180/200/220/240/260/280` | 1900 | 2000 |
| `mfr_anran_xiangru` | 见文首索引 | 10 | 800 | `100/120/140/160/180/200/220/240/260/280` | 1900 | 2000 |
| `mfr_xuantie_daqiao` | 见文首索引 | 10 | 750 | `100/110/120/130/140/150/160/170/180/190` | 1450 | 1950 |
| `mfr_xuantie_caomu` | 见文首索引 | 10 | 770 | `80/100/120/140/180/220/160/130/110/90` | 1330 | 1970 |
| `mfr_suxin_huaqian` | 见文首索引 | 10 | 750 | `100/110/120/130/140/150/160/170/180/190` | 1450 | 1950 |
| `mfr_suxin_hebi` | 见文首索引 | 10 | 800 | `100/120/140/160/180/200/220/240/260/280` | 1900 | 2000 |
| `mfr_mujianyi_caomu` | 见文首索引 | 8 | 712 | `90/110/130/150/210/170/140/120` | 1120 | 1912 |
| `mfr_taijiquan_baohu` | 见文首索引 | 10 | 800 | `100/120/140/160/180/200/220/240/260/280` | 1900 | 2000 |
| `mfr_taijijian_zhanjian` | 见文首索引 | 10 | 750 | `100/110/120/130/140/150/160/170/180/190` | 1450 | 1950 |
| `mfr_huzhaojuehushou_juehu` | 见文首索引 | 8 | 720 | `100/120/140/160/180/200/220/240` | 1360 | 1920 |
| `mfr_wujixuangongquan_huoshou` | 见文首索引 | 8 | 720 | `100/120/140/160/180/200/220/240` | 1360 | 1920 |
| `mfr_shenmen13_shisan` | 见文首索引 | 8 | 720 | `100/120/140/160/180/200/220/240` | 1360 | 1920 |
| `mfr_bixuegong_suoyuan` | 见文首索引 | 8 | 720 | `100/120/140/160/180/200/220/240` | 1360 | 1920 |
| `mfr_jinyangong_yanhui` | 见文首索引 | 6 | 600 | `100/120/140/160/180/200` | 900 | 1800 |
| `mfr_chongyangzhang_diezhang` | 见文首索引 | 6 | 600 | `100/120/140/160/180/200` | 900 | 1800 |
| `mfr_hanyuxinjue_hanqi` | 见文首索引 | 6 | 600 | `100/120/140/160/180/200` | 900 | 1800 |
| `mfr_baichousuofa_juanwan` | 见文首索引 | 6 | 600 | `100/120/140/160/180/200` | 900 | 1800 |
| `mfr_taijituishou_shuai` | 见文首索引 | 6 | 600 | `100/120/140/160/180/200` | 900 | 1800 |
| `mfr_zaoheding_penhe` | 见文首索引 | 6 | 600 | `100/120/140/160/180/200` | 900 | 1800 |

已解决（MF-V04c）：此前已区分 `mfr_xiantiangong_gangqi↔mfr_zhenwuqijie_guishe`、`mfr_chilianshenzhang_xiangxu↔mfr_furongjinzhen_mianli`、`mfr_bingpoyinzhen_shehun↔mfr_zaoheding_penhe`、`mfr_anran_xiaohun↔mfr_zhenwuqijie_guizhen`、`mfr_yunvxinjing_hufa↔mfr_gumuqinggong_youshen`、`mfr_yunvxinjing_bingxin↔mfr_yufengyin_huzhu`，以及无可靠共同底子的 `mfr_tiangang_guiyi↔mfr_chilianshenzhang_xiangxu`、`mfr_tiangang_guiyi↔mfr_yunvjian_tousuo`、`mfr_tiangang_guiyi↔mfr_yufengshu_fengqun`、`mfr_anran_xiangru↔mfr_beidoufuchen_chanchen`、`mfr_huzhaojuehushou_juehu↔mfr_sanwusanbushou_sanbu`、`mfr_lijianyi_zhengfeng↔mfr_wudangfuchen_qiansi`；关联重合 `mfr_tiangang_guiyi↔mfr_furongjinzhen_mianli`、`mfr_suxin_hebi↔mfr_zhenwuqijie_guizhen` 同步消除。

本轮只替换文首索引中的已登记穴位，不改出招方式、段数、逐段 CT 或风险数组。`mfr_taijiquan_baohu`、`mfr_huzhaojuehushou_juehu`、`mfr_wujixuangongquan_huoshou`、`mfr_jinyangong_yanhui`、`mfr_taijituishou_shuai` 的关键段同时按 21 §4.3.1 收束到拳／擒拿或位移动作末端；其余路线在既有动作分类内改写行气叙事。

#### 8.7.6 玄 / 黄阶确定性模板与全轻功速度路线

玄上 22 门各一记绝招，不再依赖隐式派生，逐项登记如下：

| 武学 / 性质 | 玄上绝招显式路线 |
|---|---|
| `sk_sanhuajudingzhang` / 阳 | `mv_sanhuajudingzhang_juding→mfr_sanhuajudingzhang_juding/true/attack/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_jinyangong` / 阳 | `mv_jinyangong_yanhui→mfr_jinyangong_yanhui/true/movement/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_chongyangzhang` / 阳 | `mv_chongyangzhang_diezhang→mfr_chongyangzhang_diezhang/true/attack/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_tongxuanjian` / 中性 | `mv_tongxuanjian_poguan→mfr_tongxuanjian_poguan/true/attack/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_beidoufuchen` / 阳 | `mv_beidoufuchen_chanchen→mfr_beidoufuchen_chanchen/true/attack/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_hanyuxinjue` / 阴 | `mv_hanyuxinjue_hanqi→mfr_hanyuxinjue_hanqi/true/defense/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_yunvjian` / 阴 | `mv_yunvjian_tousuo→mfr_yunvjian_tousuo/true/attack/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_sanwusanbushou` / 阴 | `mv_sanwusanbushou_sanbu→mfr_sanwusanbushou_sanbu/true/attack/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_yufengshu` / 阴 | `mv_yufengshu_fengqun→mfr_yufengshu_fengqun/true/attack/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_wudumichuan` / 阴 | `mv_wudumichuan_jiedu→mfr_wudumichuan_jiedu/true/defense/显式（见文首索引）`（8 段，路线 CT 600，风险 `100/110/120/130/140/150/160/170`，总风险 1080） |
| `sk_baichousuofa` / 阴 | `mv_baichousuofa_juanwan→mfr_baichousuofa_juanwan/true/attack/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_yufengyin` / 阴 | `mv_yufengyin_huzhu→mfr_yufengyin_huzhu/true/defense/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_lijianyi` / 中性 | `mv_lijianyi_zhengfeng→mfr_lijianyi_zhengfeng/true/defense/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_ruanjianyi` / 中性 | `mv_ruanjianyi_raojian→mfr_ruanjianyi_raojian/true/defense/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_haichaolianjian` / 中性 | `mv_haichaolianjian_huichao→mfr_haichaolianjian_huichao/true/attack/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_taijituishou` / 调和 | `mv_taijituishou_shuai→mfr_taijituishou_shuai/true/attack/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_raozhirou` / 调和 | `mv_raozhirou_huagang→mfr_raozhirou_huagang/true/defense/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_furongjinzhen` / 阳 | `mv_furongjinzhen_mianli→mfr_furongjinzhen_mianli/true/attack/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_xuanxujian` / 中性 | `mv_xuanxujian_xieshi→mfr_xuanxujian_xieshi/true/attack/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_liangyibu` / 调和 | `mv_liangyibu_huanxing→mfr_liangyibu_huanxing/true/movement/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_wudangfuchen` / 调和 | `mv_wudangfuchen_qiansi→mfr_wudangfuchen_qiansi/true/attack/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |
| `sk_zaoheding` / 阴 | `mv_zaoheding_penhe→mfr_zaoheding_penhe/true/attack/显式（见文首索引）`（6 段，路线 CT 600，风险 `100/120/140/160/180/200`，总风险 900） |

以上 22 条路线均以文首索引的显式 `steps` 为唯一数据来源，不再按旧 `U-Y/I/H6` 代号二次展开；其中 21 条六段路线收招合计 `1200+600=1800 CT`，`mfr_wudumichuan_jiedu` 八段路线同为 `1200+600=1800 CT`。

| 大阶 | 伤害招 | 防守 / 支援招 | 位移 / 闪避招 | 绝招 |
|---|---|---|---|---|
| 玄 | 按性质取 `AT-Y/I/H6`，轻击可取对应 4 段 | 对应 `DF-Y/I/H4`；明确护体取 6 段并挂 `innerGuard` | 对应 `MV-Y/I/H4`；长跃、追击取 8 段 | 仅玄上有绝招，显式路线见上表；玄中 / 玄下无绝招 |
| 黄 | 对应 4 段攻击模板的前 2–4 段，按现有招式次序递进 | 对应 4 段防守模板的前 2–4 段 | 对应 4 段移动模板的前 2–4 段 | 黄阶无绝招 |

正式数据须展开为每招唯一 `mfr_<move>`，不保存模板码或“前 N 段”。所有轻功的战斗移动、追击、腾跃、脱离与闪避招均挂 movement 路线；速度 Profile 如下，门禁仍读取未修正轻功值：

| 轻功 | 性质 / 品阶 | 速度路线族 |
|---|---|---|
| `sk_jinyangong`、`sk_qixingbu` | 阳 / 玄 | `MV-Y4`，长跃 / 闪避 `MV-Y8` |
| `sk_xuanmenxingbu` | 调和 / 黄 | `MV-H4` 前 2–4 段 |
| `sk_buquegong` | 阴 / 黄 | `MV-I4` 前 2–4 段 |
| `sk_gumuqinggong` | 阴 / 地 | §8.7.2 已逐招绑定 `MV-I4/8` |
| `sk_muzhongyixing` | 阴 / 玄 | `MV-I4`，长跃 / 闪避 `MV-I8` |
| `sk_muzhongbu` | 阴 / 黄 | `MV-I4` 前 2–4 段 |
| `sk_diaopubu` | 中性 / 玄 | `MV-H4`，长跃 / 闪避 `MV-H8` |
| `sk_shanhongbu` | 中性 / 黄 | `MV-H4` 前 2–4 段 |
| `sk_wudangyunbu` | 阳 / 黄 | `MV-Y4` 前 2–4 段 |
| `sk_tiyunzong` | 阳 / 地 | §8.7.4 已逐招绑定 `MV-Y4/8` |
| `sk_liangyibu` | 调和 / 玄 | `MV-H4`，长跃 / 闪避 `MV-H8` |
| `sk_wudangxingbu`、`sk_songxibu` | 调和 / 黄 | `MV-H4` 前 2–4 段 |
| `sk_qinghuabufa` | 阴 / 玄 | `MV-I4`，长跃 / 闪避 `MV-I8` |
| `sk_gudibu` | 调和 / 黄 | `MV-H4` 前 2–4 段 |

速度输出只消费 21 §4.9 已归一的 Profile，不再传原始 `routeQualityBp`；`openingQinggong`、`spd'`、移动与 `evadeRatingDelta` 的投影及“先经脉后擒拿”归 21 / 09。

#### 8.7.7 全内功调息档案与护体显示档

每门内功以 `breathProfileRef` 指向同名 `txp_*`；下表是固定 10 重展示，正式字段依次为 `grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp`，其中 `ct=1000`、`mpCostBp=0`、`outOfBattleScaleBp=15000`。运行时按 `effGrade/effLayer` 重算；离战调息再乘 `15000/10000=1.5`，护体 I / II / III / IV 仅对应黄 / 玄 / 地 / 天 UI 档，不增加倍率。

| 内功 → 调息档案 | `grade/10/nature/scope/1000/0/15000` | 10 重 `reliefBp / repairUnits` | 护体档 |
|---|---|---:|:---:|
| `sk_quanzhentunajue → txp_quanzhentunajue` | `2/10/yang/1/1000/0/15000` | `1500 / 348` | I；`outOfBattleScaleBp:15000` |
| `sk_quanzhenxinfa → txp_quanzhenxinfa` | `5/10/yang/2/1000/0/15000` | `1800 / 420` | II；`outOfBattleScaleBp:15000` |
| `sk_jinguanyusuo → txp_jinguanyusuo` | `8/10/harmony/3/1000/0/15000` | `2205 / 516` | III；`outOfBattleScaleBp:15000` |
| `sk_xiantiangong → txp_xiantiangong` | `11/10/yang/3/1000/0/15000` | `2400 / 564` | IV；`outOfBattleScaleBp:15000` |
| `sk_beidouxinfa → txp_beidouxinfa` | `5/10/yang/2/1000/0/15000` | `1800 / 420` | II；`outOfBattleScaleBp:15000` |
| `sk_baiyunguanxinfa → txp_baiyunguanxinfa` | `2/10/harmony/1/1000/0/15000` | `1575 / 365` | I；`outOfBattleScaleBp:15000` |
| `sk_gumuxinfa → txp_gumuxinfa` | `3/10/yin/1/1000/0/15000` | `1600 / 372` | I；`outOfBattleScaleBp:15000` |
| `sk_hanyuxinjue → txp_hanyuxinjue` | `6/10/yin/2/1000/0/15000` | `1900 / 444` | II；`outOfBattleScaleBp:15000` |
| `sk_yunvxinjing → txp_yunvxinjing` | `10/10/yin/3/1000/0/15000` | `2300 / 540` | IV；`outOfBattleScaleBp:15000` |
| `sk_hanyujinggong → txp_hanyujinggong` | `5/10/yin/2/1000/0/15000` | `1800 / 420` | II；`outOfBattleScaleBp:15000` |
| `sk_gumudaoyin → txp_gumudaoyin` | `2/10/yin/1/1000/0/15000` | `1500 / 348` | I；`outOfBattleScaleBp:15000` |
| `sk_jianzhongtuna → txp_jianzhongtuna` | `2/10/harmony/1/1000/0/15000` | `1575 / 365` | I；`outOfBattleScaleBp:15000` |
| `sk_taihegong → txp_taihegong` | `2/10/harmony/1/1000/0/15000` | `1575 / 365` | I；`outOfBattleScaleBp:15000` |
| `sk_liangyixinfa → txp_liangyixinfa` | `5/10/harmony/2/1000/0/15000` | `1890 / 441` | II；`outOfBattleScaleBp:15000` |
| `sk_chunyangwuji → txp_chunyangwuji` | `8/10/yang/3/1000/0/15000` | `2100 / 492` | III；`outOfBattleScaleBp:15000` |
| `sk_wudangyangshenggong → txp_wudangyangshenggong` | `5/10/harmony/2/1000/0/15000` | `1890 / 441` | II；`outOfBattleScaleBp:15000` |
| `sk_xuanzhenxinfa → txp_xuanzhenxinfa` | `5/10/yang/2/1000/0/15000` | `1800 / 420` | II；`outOfBattleScaleBp:15000` |
| `sk_wudangtuna → txp_wudangtuna` | `1/10/yang/1/1000/0/15000` | `1400 / 324` | I；`outOfBattleScaleBp:15000` |
| `sk_zhenwudaoyin → txp_zhenwudaoyin` | `2/10/harmony/1/1000/0/15000` | `1575 / 365` | I；`outOfBattleScaleBp:15000` |
| `sk_zhenwuzhuang → txp_zhenwuzhuang` | `3/10/yang/1/1000/0/15000` | `1600 / 372` | I；`outOfBattleScaleBp:15000` |
| `sk_jueqingxinjue → txp_jueqingxinjue` | `3/10/yin/1/1000/0/15000` | `1600 / 372` | I；`outOfBattleScaleBp:15000` |
| `sk_bixuegong → txp_bixuegong` | `7/10/yin/3/1000/0/15000` | `2000 / 468` | III；`outOfBattleScaleBp:15000` |
| `sk_jueqingdaoyin → txp_jueqingdaoyin` | `2/10/yin/1/1000/0/15000` | `1500 / 348` | I；`outOfBattleScaleBp:15000` |

调和核算例：金关玉锁 `min(2500,floor((500+800+800)×1.05))=2205`，修复 `floor((120+192+180)×1.05)=516`；非调和纯阳无极功为 `500+800+800=2100`、`120+192+180=492`。标准对标准攻 / 防 / 速度均为 10000 bp；护体内劲按 21 §4.8 的拳脚 / 持械 / 暗器 / 外放适用率 `10000/2500/0/4000`，且严格在护体真气后、`mpGuard` 前结算。

## 9. 本文新增术语与 ID

**本文规则术语**

| 术语 | 含义 | 归属边界 |
|---|---|---|
| 有效实际阵员 | 同阵营、装配对应阵法、未倒地且未受硬控的真实战斗单位；起阵和维持都按此计数 | 本文只给两阵的成员条件；阵法生命周期归 `design/09` |
| 虚拟阵位 | 六个有效实际单位在阵且阵主对应阵法有效 10 重时补出的第七阵位 | 只补阵位与满阵加成，不生成单位、CT、追击或反击，不降低起阵/维持门槛 |
| `anran_bieli` | 黯然销魂掌获取条件的存档旗标：当书界内羁绊 ≥ 3 的同伴曾离队或倒下 | 事件写入归 `chapters/03` 与 `design/12`；本文只读取 |
| 路线 / 调息引用 | `mfr_<完整 move ID 去掉 mv_>` / `txp_<完整 skill ID 去掉 sk_>` | 对象与 schema 归 `design/21`；本文只登记一一绑定，前缀已由基准 V13-05 采纳 |

**ID 盘点**

| 类别 | 数量 | 说明 |
|---|---|---|
| 武学 `sk_` | **115 个本文定义；116 门本组计数** | 本文定义：全真 26（另含 05 定义的 `sk_quanzhenjian` 1）、古墓 27、杨过传承 11、武当 36、绝情谷 15；另引用 `sk_wudangjiuyang` 等跨组 ID 不计。本轮新增 `sk_` 恰 50 个 |
| 招式 `mv_` | **303** | 旧稿 250＋本轮玄阶紧凑卡 53；另引用全真剑法 4 个；本轮黄阶采用模板一行卡，不创建招式 ID |
| 被动 `ps_` | **268** | 旧稿 215＋本轮玄阶紧凑卡 53；前缀按 05 §16 P-4 |
| 套装候选 `set_` | **9**（新 8 ＋沿用 1） | 新：`set_gumu_yunv` `set_shendiao_xialv` `set_dugu_jianzhong` `set_wudang_taiji` `set_wudang_zhenwu` `legacy-set:shujian_mianlizhen` `legacy-set:chilian_xianzi` `legacy-set:jueqing_gongsun`；沿用 05：`set_quanzhen_beidou` |
| 新提议 Buff | **0** | C23 已解决：不登记 `bf_zhenshi`、`bf_cuidu`。前者由阵法运行状态投影 UI“阵中”，后者复用 `design/10` §6.5 `poisonCoat` 与 `bf_zhongdu` / `bf_judu`；两串旧名只可出现在迁移/裁定说明，不得进入 `applyBuff` |
| 装备（建议 ID，design/10 定级） | 7 | `eq_chongyangdaopao` 重阳道袍（原创扩展）、`eq_jinlingsuo` 金铃索、`eq_junzijian` 君子剑、`eq_shunvjian` 淑女剑、`eq_chilianfuchen` 赤练拂尘（原创扩展命名）、`eq_juchijindao` 锯齿金刀**（待考：《神雕侠侣》公孙止兵刃描写）**、`eq_heijian` 黑剑；引用基准 §14 `eq_xuantiejian` |
| 物品（建议 ID，design/10） | 15 | 秘籍 `it_miji_quanzhenxinfa` `it_miji_tongguijian` `it_miji_chilianshenzhang_can` `it_miji_bingpoyinzhen` `it_miji_liangyixinfa` `it_miji_chunyangwuji` `it_miji_huzhaojuehushou` `it_miji_wujixuangongquan` `it_miji_shenmen13`；暗器弹药 `it_bingpoyinzhen` `it_yufengzhen` `it_furongjinzhen` `it_zaoheding`；`it_yufengjiang` 玉蜂浆；引用 `it_jueqingdan` `it_duanchangcao` |
| NPC（引用/岗位槽） | 具名 18；岗位槽 3 | 具名：`npc_mayu` `npc_qiuchuji` `npc_yideng` `npc_xiaolongnv` `npc_limochou` `npc_zhoubotong` `npc_yangguo` `npc_zhangsanfeng` `npc_songyuanqiao` `npc_yulianzhou` `npc_zhangcuishan` `npc_chongxu` `npc_lufeiqing` `npc_liyuanzhi` `npc_zhangzhaozhong` `npc_gongsunzhi` `npc_qiuqianchi` `npc_fanyiweng`；岗位槽：全真知客道人、白云观道长、游方武当道人 |
| 任务（占位，本文件号段 `_71`–`_96`） | 24 | `q_02_bond_72` `q_02_faction_73` `q_02_qiyu_74` `q_02_bond_75` `q_02_faction_77` `q_03_side_76` `q_03_side_79` `q_03_faction_80` `q_03_qiyu_81` `q_03_bond_82` `q_03_qiyu_83` `q_03_qiyu_84` `q_03_bond_86` `q_03_faction_94` `q_03_side_95` `q_03_qiyu_96` `q_04_bond_85` `q_04_main_87` `q_04_main_88` `q_04_bond_91` `q_04_qiyu_92` `q_04_faction_93` `q_12_faction_89` `q_12_bond_90` |
| 其他 | 2 | 存档旗标 `anran_bieli`（黯然"别离"门槛）；地形建议 `tr_qinghuacong` 情花丛（design/08） |
| 经脉路线 / 调息档案（引用） | 天 / 地 146、玄上绝招 22 / 23 | 天 / 地 146 招均绑定唯一同名 `mfr_*`；本轮统一 19 条重复路线定义并将降格路线改回普通模板引用，显式定义太极卸力触发线；玄上 22 记绝招逐项登记；23 门内功引用含 `outOfBattleScaleBp:15000` 的 `txp_*`。对象均由 21 拥有，不计本文新增 ID |

---

### 正式套装反向标签镜像（全局审计）

下表仅镜像 `design/07` §8.4 的正式成员关系，供构建与 lint 读取；不是第二份武学定义。历史候选只以 `legacy-set:<slug>` 保留，不得写入运行态 `setTags`。

| 武学 ID | setTags |
|---|---|
| `sk_dabeidouzhen` | `set_quanzhen_beidou` |
| `sk_haichaolianjian` | `set_dugu_jianzhong` |
| `sk_hanyuxinjue` | `set_gumu_yunv` |
| `sk_jianzhongtuna` | `set_dugu_jianzhong` |
| `sk_liangyixinfa` | `set_wudang_taiji` |
| `sk_lijianyi` | `set_dugu_jianzhong` |
| `sk_meinvquan` | `set_gumu_yunv` |
| `sk_mianzhang` | `set_wudang_taiji` |
| `sk_quanzhenjian` | `set_quanzhen_beidou`、`set_shendiao_xialv` |
| `sk_quanzhenxinfa` | `set_quanzhen_beidou` |
| `sk_ruanjianyi` | `set_dugu_jianzhong` |
| `sk_taijituishou` | `set_wudang_taiji` |
| `sk_yufengzhen` | `set_gumu_yunv` |
| `sk_yunvjian` | `set_gumu_yunv`、`set_shendiao_xialv` |

## 10. 数据校验规则与测试用例

### 10.1 静态规则

| 编号 | 检查 | 通过条件 |
|---|---|---|
| DJ-V01 | 唯一武学与品阶计数 | 五张总表按唯一 `sk_` 为 116 门；天 / 地 / 玄 / 黄恰为 8 / 18 / 44 / 46，十二品为 `5/13/28/5/17/22/9/7/2/2/6/0`；`sk_wudangjiuyang` 只引用、不重复计数 |
| DJ-V02 | 内功性质（AR-02） | 23 门内功各且仅有一个 `nature`，枚举只能为 `yin` / `yang` / `harmony`；数量分别为阴 8 / 阳 8 / 调和 7 |
| DJ-V03 | 内功贡献 | 对每门内功复算 `IP = mpMaxPct + hpMaxPct + 2 × Σattrs + 5 × mpRegen`，必须等于对应预算 |
| DJ-V04 | 七人阵（C13） | `sk_tiangang` 与 `sk_zhenwuqijie` 均为 `minMembers=4`、`dissolveBelow=4`、持续 3 次阵主行动；仅 6 实员且阵主有效 10 重时可补 1 虚位，虚位不得产生行动或额外反应 |
| DJ-V05 | 前置结构（C17） | `prereq` 外层 AND、`anyOf` 内层 OR；纯阳无极功与玉女心经不得回退为自然语言二选一；倚天屠龙功须有 `skills {art: 40}`；五毒秘传因原稿无数值，不强造 `poi: 40` |
| DJ-V06 | 套装闭合（C22） | 本文件归属成员的 `setTags` 与 §7 成员表双向一致；跨归属缺口只列 §11 D-12，不在本文复制定义；套装品阶按 `floor(median(effGrade))` |
| DJ-V07 | Buff 目录（C23） | 活跃规则不得施加 `bf_zhenshi` 或 `bf_cuidu`；运行用 `bf_*` 均能在 `design/06` 找到定义，历史说明中的撤回名不计活跃引用 |
| DJ-V08 | 六角范围（AR-12） | 活跃招式不得保留 `design/09` §5.3.4 所列旧方格、十字、扫掠模板及旧 `cone.n` / `zone.shape` / `leap.splash` 参数；正式 `aoe_disk`、`aoe_spokes`、`aoe_cone` 与结构化 `aoe_zone` 均可使用，并按各自 Nmax 核算 AF |
| DJ-V09 | 门派与职级（AR-07/08） | `sect_quanzhen`、`sect_wudang`、`sect_gumu`、`sect_jueqinggu` 与 `design/17` 一致；所有 `sect.rank` 为 1–5，不得残留 0–4 旧制 |
| DJ-V10 | 天级池（C15 / 基准 v1.6） | 本文不新增补录册之外的普通天阶 ID；神雕全局完整原生天级池固定 18，恰等高武 6–18 上限；笑傲太极拳/剑均为 `partial`、`lineageGrade 10`，不计完整池 |
| DJ-V11 | 标注与考据 | 原创获取/机制有“原创扩展”；每个保留的“待考”均指出书名与要核对的人物、情节、名目或版本差异；不虚构引文与回目号 |
| DJ-V12 | 文档结构 | 目录与一级/二级标题一致，Markdown 表格列数一致，代码围栏成对，无截断句或占位词 |
| DJ-V13 | AR-01 新增量 | 与 v1.1 比较只新增玄 19、黄 31；天、地均为 0；玄阶预算样本 ≥30%，黄阶 46 门均出现在八字段一行表 |
| DJ-V14 | 装配覆盖（05 §14.6 #4） | 每界内功 / 拳脚 / 兵器及同类兵器链均 ≥3；本组不足的书界必须明确由 `skills-general` §11.1 `ALL14` 补齐，不得把携带武学当本土来源 |
| DJ-V15 | 经脉高阶覆盖（AR-14） | §8.7 恰覆盖 26 门天 / 地阶、146 个既有 `mv_*`，并显式覆盖 22 门玄上各一记绝招；每个 `route.ultimate` 与 `MoveDef.ultimate` 同值，路线 ID 必须为同名派生 `mfr_*` |
| DJ-V16 | 路线 schema 与约束 | `purpose` 仅 attack / defense / movement；中性只允许 `requiredNature:[yin,yang,harmony]`；路线 1–18 段、穴位不重复、CT 40–120、风险 0–1200，且 `recovery+ΣsegmentCt≤2000` |
| DJ-V17 | 调息与护体 | 23 门内功各且仅引用一个 `txp_*`；字段为 `id/grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp`，scope 1–3、CT 1000、耗内 0、离战倍率 15000；护体档只显示，`innerGuard.reflectBp=0` |
| DJ-V19 | 绝招数量（2026-09-28） | 天阶 8 门共 20 记（每门 2–3）；地阶 18 门共 23 记（每门 1–2）；玄上 22 门各 1 记；玄中 / 玄下 / 黄阶为 0。统一前为 `21/24/22`，本轮降格 2，新增招式 0 |
| DJ-V18 | 速度与单位隔离 | 16 门轻功全部有 movement 路线族；不把经脉速度写回 `Q_skill` / 门禁；每个独立单位一个 `MeridianFlowModule`，preview 不写状态且不耗 RNG |
| DJ-V20 | AR-16 逐招覆盖 | 审计表按 `moveId` 排序；每个 `projected` 招均有基础 `range/aoe`、恰三项 spread 且 `[0] == aoe`；不从 `ranged`、招名或旧伤害类型反推 |
| DJ-V21 | AR-16 伤害与路线 | 3 个外放招的全部伤害段均为 `DamageKind='projected'`，攻击路线各命中 21 §4.4.1.4 的合法手部／兵器端点 |

### 10.2 二十三门内功 IP 复算

| 内功 | `nature` | 复算 | 结果 |
|---|---|---|---|
| 先天功 | `yang` | `52 + 26 + 2×(6+8+6) + 5×3.5` | 135.5 |
| 金关玉锁二十四诀 | `harmony` | `30 + 18 + 2×(4+5+3) + 5×2.2` | 83 |
| 全真吐纳诀 | `yang` | `8 + 5 + 2×(1+2) + 5×1.0` | 24 |
| 全真心法 | `yang` | `18 + 10 + 2×(3+2+2) + 5×1.3` | 48.5 |
| 北斗心法 | `yang` | `17 + 10 + 2×(2+3+2) + 5×1.5` | 48.5 |
| 白云观心法 | `harmony` | `8 + 5 + 2×(1+1+1) + 5×1.0` | 24 |
| 玉女心经 | `yin` | `44 + 23 + 2×(8+8+2) + 5×3.0` | 118 |
| 古墓心法 | `yin` | `10 + 5 + 2×(2+2) + 5×1.4` | 30 |
| 寒玉心诀 | `yin` | `20 + 10 + 2×(4+3+1) + 5×2.2` | 57 |
| 寒玉静功 | `yin` | `17 + 10 + 2×(2+2+3) + 5×1.5` | 48.5 |
| 古墓导引 | `yin` | `8 + 5 + 2×(1+1+1) + 5×1.0` | 24 |
| 剑冢吐纳 | `harmony` | `8 + 5 + 2×(1+1+1) + 5×1.0` | 24 |
| 纯阳无极功 | `yang` | `32 + 18 + 2×(5+3+4) + 5×1.8` | 83 |
| 太和功 | `harmony` | `8 + 5 + 2×(2+1) + 5×1.0` | 24 |
| 两仪心法 | `harmony` | `17 + 10 + 2×(3+2+2) + 5×1.5` | 48.5 |
| 武当养生功 | `harmony` | `17 + 10 + 2×(3+2+2) + 5×1.5` | 48.5 |
| 玄真心法 | `yang` | `17 + 10 + 2×(3+2+2) + 5×1.5` | 48.5 |
| 武当吐纳 | `yang` | `6 + 4 + 2×(1+1) + 5×1.0` | 19 |
| 真武导引 | `harmony` | `8 + 5 + 2×(1+1+1) + 5×1.0` | 24 |
| 真武桩功 | `yang` | `10 + 6 + 2×(2+2) + 5×1.2` | 30 |
| 闭穴功 | `yin` | `24 + 16 + 2×(4+4+2) + 5×2.4` | 72 |
| 绝情心诀 | `yin` | `10 + 6 + 2×(3+1) + 5×1.2` | 30 |
| 绝情导引 | `yin` | `8 + 5 + 2×(1+2) + 5×1.0` | 24 |

### 10.3 关键规则样例

| 用例 | 输入 | 期望 |
|---|---|---|
| 阵法不足员 | 天罡或真武仅 3 个有效实际单位 | 不得起阵；已成阵则立即阵破 |
| 阵法满编 | 6 个有效实际单位、阵主对应阵法有效 10 重 | `slotCount=7`；仍只有 6 个单位和各自 CT |
| 真武线性加成 | `slotCount=4/6/7`，每位加成 5% | `min(25%,(n−1)×5%)` = 15% / 25% / 25%，不得指数翻倍 |
| 套装奇数件 | 已计件 `effGrade=[5,8,11]` | `g_set=floor(median)=8` |
| 套装偶数件 | 已计件 `effGrade=[5,7,8,11]` | `g_set=floor((7+8)/2)=7` |
| 残承边界 | 笑傲取得太极拳或太极剑 | 保存 `partial` 与 `lineageGrade=10`，不得计入笑傲完整天级池或自动补成 11 |
| 虎爪门规 | 对一时敌对但并非邪派的目标使用虎爪绝户手 | 按 P26 扣品德；“敌对”不自动等同“邪派” |
| 毒刃与淬毒 | 五毒秘传毒刃触发，或装备已有 `poisonCoat` | 只施加既有 `bf_zhongdu` / `bf_judu`；不得生成 `bf_cuidu` |
| 同档零漂移 | 攻、防、速度双方均为标准强度，路线完整提交 | 三个独立乘区均为 10000 bp；不改变原伤害、减伤与速度 |
| 太极卸力触发 | `ps_taijiquan_siliang` 成功触发 | 通过 `routeOnTriggerRef=mfr_taijiquan_rufeng` 运行防线；不另造被动路线 ID |
| 护体内劲顺序 | 纯阳无极功或闭穴功合法护体、承受拳脚伤害 | 护体真气后消费护体内劲，再到 `mpGuard` 与气血；资源守恒 trace 与 21 一致 |
| 调息档案 | 金关玉锁 8 品、10 重、调和、scope 3 | `reliefBp=2205`、`repairUnits=516`；不推进 15 的永久冲穴进度 |
| 外放零档 | 载入 `mv_xuantie_caomu`、`mv_yunvjian_lengyue`、`mv_wudangjiemaishou_huantiao` | 0 档射程与卡内基础值相等、范围等于 `projectionSpreadSteps[0]`，标准 Profile 不得取得 +2 / +4 格 |
| 外放端点与反误标 | 展开三条 `meridianRouteRef`；再检查铃音、实体兵器、七个待考候选 | 三条路线均命中白名单且所有伤害段为 `projected`；其余不得出现 `projection:true` |

---

## 11. 待决事项 / 依赖

### 11.1 替下游给出的建议值

| # | 下游 / 建议值 | 本文处理 |
|---|---|---|
| D-2 | 06、05 §4.2：缴械、恐惧、迷惑 0.25；麻痹、缠绕、封内力 0.20；剧毒、乱心、封经脉 0.15；中毒等 0.10；锁定 0.05 | 均为 `cost_buff` **【建议值】**；本文据此核算，待 06 定价后按 05 统一重算，允许误差仍以 05 为准 |
| D-3 | 05 §4.7、06 §8.6：暗器 `K_delivery=0.92`、默认不可招架 `K_parry=0.85`，弹药不计招式倍率 | 本组 5 门暗器按该 **【建议值】** 核算；新增黄阶情花避刺套用 Y5 且已含投射修正；弹药成本仍归 `design/10` §8 |
| D-5 | 05 §13.6：为 `sk_quanzhenjian` 增补 `sk_zhongnanjian ≥ 4` 前置 | 本文进阶链按“终南剑法 → 全真剑法 → 同归剑法”展示；是否把首段写入全真剑法唯一条目由 05 定稿 |
| D-6 | 05 §4.11：新增 `borrowForce{pct}` 钩子 | 钩子定稿前，太极拳“借力打力”用“对 `atkOut` 高于自身者 Z3 +6%→15%”的 **【建议值】** 代替 |
| D-7 | 02 §5.4：新增同源组 `lg_dugu`，可选扩展 `lg_taiji` | 剑冢四意残篇建议归 `lg_dugu` 并在笑傲加速独孤九剑；太极推手、两仪心法是否入 `lg_taiji` 由 02 决定 |
| D-8 | 05 §6.2、10 §3：`dualMixed: [blade, sword]`、拂尘细分为 `whip`、剑的 `heavy/soft/wooden` 标签、判官笔与钩的双兵语义 | 阴阳倒乱刃法等条目已按这些 **【建议值】** 书写；schema 和装备持用规则由归属文档落地 |
| D-9 | chapters/02、03、04、12、`design/story/`、12 与 18：任务号段 `_71`–`_96`、21 个 NPC 占位 ID、羁绊等级门槛 | 见 §9 ID 盘点；正式编号、正邪线接入、NPC 招募与统一羁绊刻度由对应章节及 `design/story/`、`design/12`、`design/18` 回填 |
| D-10 | chapters/04、08、09、11 与 02 §6.6：黄衫女子 5 门、鹿鼎全真 4 门、连城/鸳鸯武当 5 门的★来源 | **已解决（作者决定 P25）**：保留低武候选，全部明确标（原创扩展）；章节可调整事件包装，但不得默删后造成 1/1/1 装配缺口 |
| D-14 | 06 §8.9、§8.11：既有 Buff 的来源扩展 | `bf_zhaomen` 用于闭穴功，`bf_xielian` 用于赤练神掌，`bf_qianlong` / `bf_xuli` 用于黯然销魂掌；建议 06 在“典型来源”补登，不新建同物 ID |
| D-16 | 08、10：情花丛 `tr_qinghuacong`、情花刺及闭关/解谜地点 | 本文只给内容侧 **【建议值】**；地形定义与物品品阶分别由 08、10 定稿 |
| D-17 | 09 §6.7：玉女素心剑法搭档 CT −300、合击演出、情花毒“动情”时序 | 本文按 05 §9.3.1 写候选参数；事件顺序由 09 统一 |
| D-18 | 09、05：六角“中心点＋六邻格”目标面/持续面 | **已解决**：09 §5.3、§13.1 已定稿为 `aoe_disk {r:1}` 与 `aoe_zone {inner:{tpl:aoe_disk,r:1},duration:N}`；N=7、AF=0.70。本文已替换占位并按 05 §4.2 重算直接伤害；持续地表伤害按 09 §5.3.3 单独审查 |

### 11.2 本文依赖的上游事实

| # | 上游事实 / 冲突 | 本文落实与剩余接口 |
|---|---|---|
| D-1 | C13；基准 §8；05 §7.7、09 §6.8 | **已解决**：天罡北斗阵、真武七截阵均 4 个有效实际单位起阵且低于 4 即散，持续 3 次阵主行动；原著完整阵均为 7 人，游戏中仅“6 实员＋阵主有效 10 重”补 1 虚位。虚位不增单位、CT、追击或反击；北斗大阵 3 人、渔网阵 2 人不套 C13（见 §2.3、§2.5、§5.4） |
| D-4 | C17；`rulings-v1.md` §4 | **已解决**：玉女心经、纯阳无极功使用 `prereq[].anyOf`；倚天屠龙功使用 `skills {art: 40}`；真武七截阵枚举武当拳脚/兵器 OR 分支。五毒秘传原稿无毒术数值，故只说明 `poi` 参与强度，不臆造门槛（见 §3.3、§3.5、§5.4） |
| D-11 | C14、AR-01；05 §14 | **已解决（CXd）**：保留 8 天、18 地，新增玄 19、黄 31，使本图鉴由 `8/18/25/15=66` 达到受控配额 `8/18/44/46=116`；未新增天阶、未删改既有品阶。扩充后的十四书界全目录池仍由 F2 / 章节统一重算（见 §8.3） |
| D-12 | C22；07 | **本文侧已解决**：套装按 `floor(median(effGrade))`，成员与 `setTags` 必须双向闭合；本文给 `sk_zaoheding → legacy-set:tiezhang_shuishangpiao`，倚天组已给 `sk_wudangjiuyang → set_wudang_zhenwu`。仍需五岳组给 `sk_dugu9 → set_dugu_jianzhong`、05 给 `sk_quanzhenjian → set_shendiao_xialv`，07 建唯一成员表（见 §7） |
| D-13 | C23；06、09、10 | **已解决**：撤回 `bf_zhenshi`、`bf_cuidu`；前者由阵法状态投影 UI，后者复用 `poisonCoat` 与 `bf_zhongdu` / `bf_judu`。两旧串仅留在迁移说明与禁止性校验中，不得用于运行时 `applyBuff`（见 §9–§10） |
| D-15 | 03 待决 D-03、05 §14.6 #7 | **已对齐**：神雕最高本土轻功由地上古墓轻功满足；笑傲 / 侠客 / 书剑 / 飞狐由地中梯云纵满足；射雕本组最高仅玄上金雁功 |
| U-1 | C15；基准 v1.6 V16-01～02、§3、§13 | **已解决（v1.6 覆盖 v1.1）**：普通天阶闭集由 51 扩至 59；高武完整原生天阶池允许 6–18，神雕固定 18，恰到上限。本文仅列本图鉴完整／回想子集；补录武学仍归补录册定义，笑傲太极拳／剑为 10 品残承且不计完整池 |
| U-2 | 基准 v1.1 V11-04、V11-28、V11-36 | **已采纳（v1.1）**：`ps_` / `aoe_` / `it_miji_` 前缀已登记；太极笑傲残承固定 10；玩家队伍 ≤6 而剧情 AI 友军另计。本文已分别用于 §9 ID、太极条目与 C13 阵法边界 |
| U-3 | AR-02 | 23 门内功全部显式标 `nature`：`yin=8`、`yang=8`、`harmony=7`；阴阳相性与冲穴只引用 05 和 `design/15`，本文不重定义 |
| U-4 | AR-07、AR-08；`design/17` | 五级 L1–L5 与现行门派资料对齐：全真/武当用 T02；古墓用 §7.3 小规模 T04 变体；绝情谷用 §7.6 T04。月钱、资源与营生只引用 12/16 |
| U-5 | AR-12 | **已解决**：活跃招式已移除旧方格专用十字/九宫与临时占位，统一使用 09 §5.3、§13.1 的 `aoe_disk` / 结构化 `aoe_zone`；直接伤害按 05 §4.2 的 AF=0.70 重算（见 D-18） |
| U-6 | AR-14；`design/21` v2.0 | **已解决（本文侧）**：26 门天 / 地阶、146 招逐一显式绑定；22 门玄上绝招逐项显式登记；16 门轻功接 movement 路线；23 门内功接含离战倍率的调息与护体显示档。公式、状态与结算顺序仍由 21 唯一定义（见 §8.7） |

### 11.3 对基准的修改提案

本次不新增基准修改提案。原稿中与本文直接相关的提案均已有去向：

| 原提案 | 状态 | 追溯 |
|---|---|---|
| 高武完整原生天级上限由 15 放宽到 16 | **已被 v1.6 覆盖** | 基准 V11-17 的 6–16 已由 V16-01～02 扩为 6–18；神雕完整池固定 18 |
| 太极拳、太极剑在笑傲按 10 品残承再遇 | **已采纳（v1.1）** | 基准 V11-28、§13；完整池与残承池分列 |
| 登记 `ps_`、`aoe_`、`it_miji_` 等前缀 | **已采纳（v1.1）** | 基准 V11-04、§12 |
| 玩家队伍六人上限与剧情 AI 友军分开 | **已采纳（v1.1）** | 基准 V11-36、§8；七人阵仍按 C13 作游戏改编 |
| 总武学 661 门、神雕玄阶 16→22 | **已撤回 / 被覆盖** | AR-01 改为全局约 1,100–1,150 门、比例约 1:3:9:9；逐界数量由 05 C3 重定，不在基准另写旧值 |
| 登记 `mfr_* / txp_*` 前缀及经脉动态唯一归属 | **已采纳（v1.3）** | 基准 V13-05～06；具体实例仍由图鉴登记，schema 与战斗经脉动态归 21 |
| Canon §4 明列天 / 地 / 玄上绝招数量区间与默认分配 | **已解决** | M4（`b02edfa`）已在 05 §3.5、§4.8 与 V9 写入十二品数量矩阵；本册按天中 2–3、天下 2、地上 2、地中 1–2、地下 1、玄上 1 执行 |

### 11.4 原著考据待办

> 下表只收仍未逐字核对的原著事实。游戏规则、数值与原创招式名不以考据结论反推；应以三联/广州修订版为基线。

| # | 影响 | 待核对范围 |
|---|---|---|
| K-1 | 仅文本 | 《神雕侠侣》古墓石室口诀："金关玉锁二十四诀"名称、内容及与全真内功的关系 |
| K-2 | 仅文本 | 《神雕侠侣》三联/广州修订版：窥扰小龙女练功者尹志平 / 甄志丙的版本替换范围 |
| K-3 | 影响规则描述 | 《射雕英雄传》全真七子北斗座次；《神雕侠侣》重阳宫四十九人阵的正式名称、七个小阵构成与缺员描写 |
| K-4 | 仅文本 | 《射雕英雄传》《神雕侠侣》：同归剑法创制/出场、昊天掌使用者、郝大通以三花聚顶掌误伤孙婆婆的情节位置 |
| K-5 | 仅文本 | 《射雕英雄传》：金雁功传授细节及马钰在蒙古悬崖授郭靖内功的情节位置 |
| K-6 | 影响招式目录 | 《神雕侠侣》：美女拳法全部招名与总数；天罗地网势捕雀训练所用雀数 |
| K-7 | 仅文本 | 《神雕侠侣》：小龙女所用金铃索的正式名称；寒玉床修炼年效原文 |
| K-8 | 影响来源/名称 | 《神雕侠侣》：赤练神掌与"五毒神掌"的版本关系；《五毒秘传》的确切书名、陆无双取得经过及杨过翻阅内容；冰魄银针解药。三无三不手已确认只有"无孔不入、无所不至、无所不为"三招，不再查不存在的另一组"三不"招名 |
| K-9 | 仅文本 | 《神雕侠侣》：独孤求败剑冢四段石刻逐字、次序及紫薇软剑下落 |
| K-10 | 影响招式目录 | 《神雕侠侣》：黯然销魂掌十七招在基线版本的逐字与次序；"庸人自扰 / 魂不守舍"等版本差异；杨过心境欢愉时掌力大减的具体情节 |
| K-11 | 仅文本 | 《神雕侠侣》：玉女素心剑法招名全表；杨过身中情花毒后与小龙女合使剑法的情节 |
| K-12 | 仅文本 | 《倚天屠龙记》：太极拳完整招序及"合太极"是否为原文；太极剑五十四式除已确认招名外的次序；《笑傲江湖》冲虚剑圈描写。“云手”已确认，“小魁星”不再作为原著招名 |
| K-13 | 影响来源 | 《倚天屠龙记》：纯阳无极功、绕指柔剑、神门十三剑、虎爪绝户手的使用者、授受与出场情节 |
| K-14 | 仅文本 | 《倚天屠龙记》：张翠山兵刃“烂银虎头钩”“镔铁判官笔”字形及王盘山题壁所用轻功 |
| K-15 | 影响来源 | 《书剑恩仇录》：柔云剑术是否张召重亦使、无极玄功拳与芙蓉金针出场、马真身份/结局、陆菲青“绵里针”称号由来 |
| K-16 | 影响人物来源 | 《侠客行》武当掌门“愚茶”的姓名/身份；《飞狐外传》掌门人大会武当掌门姓名 |
| K-17 | 影响装备/来源 | 《神雕侠侣》：锯齿金刀与黑剑正式名称、闭穴功破解、渔网是否缀刃、樊一翁兵刃、裘千尺枣核钉伤公孙止的情节、绝情谷茹素谷规 |

### 11.5 开放问题（附默认值）

| # | 问题 | 结论 / 默认值 |
|---|---|---|
| O-1 | 剑冢四意做成 4 门杂学，还是合为 1 门分段解锁 | **已解决（作者决定 P23）**：保留 4 门；杂学栏 2 格形成持剑类型取舍（见 §4） |
| O-2 | 鹿鼎全真、连城 / 鸳鸯武当的低武★来源是否保留 | **已解决（作者决定 P25）**：保留候选，全部标（原创扩展）；章节须落实或以同阶合法本土来源等价替换（见 §1.2、§5.6） |
| O-3 | 黯然销魂掌是否保留当书界羁绊 ≥ 3 同伴离队或倒下的“别离”门槛 | **已解决（作者决定 P24）**：保留；事件旗标为 `anran_bieli`，由 `chapters/03` / `design/12` 写入（见 §4.3、§9） |
| O-4 | 虎爪绝户手对非邪派目标使用是否扣品德 | **已解决（作者决定 P26）**：保留；临时敌对不等于邪派，目标须按其既有阵营/行为标签判定（见 §5.4、§10.3） |
| O-5 | 六角范围占位模板的最终 ID 与 AF | **已解决**：09/05 已定稿生产 schema；本文已迁为 `aoe_disk {r:1}` / `aoe_zone {inner:{tpl:aoe_disk,r:1},duration:N}`，直接伤害使用 N=7、AF=0.70，持续地表效果单独审查（见 D-18） |
| O-6 | 经脉路线、独立乘区、护体与速度是否由图鉴各自定义 | **已解决：否**。本文仅给绑定，河流状态、调息、攻防 / 速度乘区、护体内劲与逐单位实例统一见 `design/21` §3–§12；`mfr_* / txp_*` 前缀已由基准 V13-05 登记（见 §8.7） |
| O-7 | 全真剑法玄中绝招 `mv_quanzhenjian_chongyang` 是否保留 | **已解决：普通招式**。M4（`b02edfa`）已在 05 §13.6 统一为 7 重、1.50、耗内 8%、冷却 2、收招 1200、`ultimate:false`；本册已镜像 |
| O-8 | 六个远程候选是否确为离体真气 | 默认保持“待考”、不赋 `projection:true`；待逐字核实武学表现或由作者确认后，再补基础范围、三档 spread 与 `DamageKind='projected'` |
| O-9 | 若作者认定“目标持兵器”属于罕见条件，黏剑卸兵是否改按罕见条件核算 | 默认按常见条件取 3.30；若改判罕见，则为 `3.00×1.30−0.16=3.74≈3.75` |
