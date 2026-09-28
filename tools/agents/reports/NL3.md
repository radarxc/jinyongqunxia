# NL3 报告 · 图鉴检查脚本：绝招配额改为按规则逐门判定（读 NU5p 裁定表）

## 1. 摘要（3–6 行）

已删除按册硬编码的 `EXPECTED` 总数快照，正式图鉴改由 `skills-*.md` 动态发现，并对每门正式武学逐品检查正文 `MoveDef.ultimate:true` 数量。
天中、地中精确读取 NU5p §3 的 75 门裁定；新补录而未入表者使用天中 2–3、地中 1–2，并给出不计失败的提示。
裁定表缺失或损坏会明确报错并退出 2；降龙十八掌的三项跨文档例外保持不变。
当前 11 册恰有配额违规 35 门（升 8、降 27）及重复路线步骤定义 221 条，合计 256 个预期存量错误，交由 NU5a / NU5b 修正。
全部 lint 单测 99 项与严格 ID 检查均通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要内容 |
|---|---:|---|
| `tools/lint/check_skill_catalogs.py` | 1,526 | 动态图鉴发现；NU5p 表解析；正文真值计数；逐品配额；提示 / 配置错误；路线 token 边界 |
| `tools/lint/test_check_skill_catalogs.py` | 596 | 43 项专项测试，其中新增品阶、裁定表、回退提示、配置错误、正文独立计数与 token 边界覆盖 |
| `tools/lint/README.md` | 236 | 新配额规则、裁定表契约、错误码、提示语义及不依赖章节版式的路线识别 |
| `tools/agents/reports/NL3.md` | 本报告 | 实现、测试、当前违规清单与下游同步说明 |

只修改以上四个授权路径；未修改图鉴、Canon、`TODO.md` 或其他文档。

## 3. 关键结论与数值

- 固定规则：黄下 / 黄中 / 黄上 / 玄下 / 玄中均 0；玄上 1；地下 1；地上 2；天下 2；天上 3。
- 裁定规则：已入 NU5p 表的天中 / 地中按该门“裁定绝招数”精确相等；未入表的新武学只检查天中 2–3、地中 1–2，并产生 `warnings`。
- NU5p §3 实际解析 75 门，裁定值分布为 1 记 47 门、2 记 23 门、3 记 5 门，即 `47+23+5=75`。
- 正文计数不依赖路线目标：直接扫描审计投影和待决章节之外的 `MoveDef{...ultimate:true...}`，按正式卡 / 表行、路线归属、`mv_*` 前缀或所在卡归属到 `sk_*`；无法唯一归属则报错。
- 正式图鉴由 `docs/design/catalog/skills-*.md` 路径模式判定；不再维护固定册名、门数、绝招总数或迁移日期标记。固定 `AUDIT_VERSION` 检查已删除，因为日期只记录一次迁移批次，不能证明新增武学符合当前规则，反而会阻碍 NXc1 / NXc2 正常补录。
- 当前结果：配额 `9+2+8+4+1+1+0+3+3+3+1=35`；重复路线 `22+19+10+82+67+9+5+7=221`；总错误 `35+221=256`；未入裁定表提示 0。

## 4. 开放问题（附默认值）

无。默认且已实现：新补录天中 / 地中在未进入下一版裁定表前采用合法区间并提示；提示不计 `errors`、不令 `--strict` 失败。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。本任务将既有 Canon / `design/05` 品阶规则和 NU5p 作者裁定落实为工具校验，不改变设计事实。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| NU5a 负责的少林、道家、通行、五绝、逍遥、倚天图鉴 | 对应正文卡、路线镜像与重复步骤表 | 按 §7.1 的 25 门处理配额（升 5、降 20）；把同一路线步骤收敛为唯一一处定义 |
| NU5b 负责的侠客碧血、五岳、康熙、乾隆、古龙图鉴 | 对应正文卡、路线镜像与重复步骤表 | 按 §7.1 的 10 门处理配额（升 3、降 7）；把同一路线步骤收敛为唯一一处定义 |
| 后续新增 `skills-*.md` 图鉴 | 新天中 / 地中武学 | 可先按区间通过并保留“未入裁定表”提示；下一版裁定表应补入逐门精确值 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 当前逐册配额违规（35 门）

以下箭头均为“当前正文绝招数 → NU5p 裁定绝招数”。

- **少林（9，均降）**：`sk_jinzhongzhao` 2→1、`sk_shaolinjiuyang` 2→1、`sk_boruozhang` 2→1、`sk_weituochu` 2→1、`sk_dalijingangzhi` 2→1、`sk_yizhichan` 2→1、`sk_fumozhangfa` 2→1、`sk_jiashafumogong` 2→1、`sk_huanyinzhi` 2→1。
- **道家（2，均降）**：`sk_xuantie` 3→2、`sk_tiyunzong` 2→1。
- **通行（8，均降）**：`sk_yanmengqishe`、`sk_sihaibiaodao`、`sk_kaimenpiguaquan`、`sk_jianghubaizhanjian`、`sk_qihuangmifa`、`sk_baidubianzheng`、`sk_qimenbuzhen`、`sk_qingxinqupu`，均 2→1。
- **五绝（4，均升）**：`sk_dagou` 2→3；`sk_lanhuafuxueshou`、`sk_yuxiaojianfa`、`sk_yiyangshuzhi` 均 1→2。
- **逍遥（1，降）**：`sk_liuyangzhang` 3→2。
- **倚天（1，升）**：`sk_fanliangyi` 1→2。
- **侠客碧血（0）**：无配额违规。
- **五岳（3，均升）**：`sk_taiyuesanqingfeng`、`sk_baibianqianhuan`、`sk_qixianwuxingjian`，均 1→2。
- **康熙（3，均降）**：`sk_yingxiongsanzhao`、`sk_meirensanzhao`、`sk_fuqidaofa`，均 2→1。
- **乾隆（3，均降）**：`sk_yaowangdujing`、`sk_qixinhaitang`、`sk_tianshanyingyang`，均 2→1。
- **古龙（1，降）**：`sk_tangmenanshou` 2→1。

核算：升格 `4+1+3=8` 门；降格 `9+2+8+1+3+3+1=27` 门；合计 `8+27=35` 门，与 NU5p §4 完全一致。

### 7.2 当前逐册重复路线步骤定义（221 条）

每个数字都是同一 `mfr_*` 首次定义之后再次出现具体 `ap_*` 步骤的次数；完整诊断可由 `python3 tools/lint/check_skill_catalogs.py --details` 获取两处 `文件:行号`。

| 册 | 重复定义数 | 处理归属 |
|---|---:|---|
| 少林 | 22 | NU5a |
| 道家 | 19 | NU5a |
| 通行 | 10 | NU5a |
| 五绝 | 82 | NU5a |
| 逍遥 | 67 | NU5a |
| 倚天 | 9 | NU5a |
| 侠客碧血 | 5 | NU5b |
| 五岳 | 7 | NU5b |
| 康熙 | 0 | NU5b |
| 乾隆 | 0 | NU5b |
| 古龙 | 0 | NU5b |
| **合计** | **221** | `22+19+10+82+67+9+5+7=221` |

逐条命中如下（康熙、乾隆、古龙为 0，故不另列）：

- **少林（22）**：

  ```text
  mfr_yijinjing_weituo  mfr_yijinjing_huangu  mfr_jingangbuhuai_hanshan  mfr_shizihou_juyin
  mfr_jinzhongzhao_hongzhong  mfr_shaolinjiuyang_huti  mfr_xisuijing_huanmai  mfr_boruozhang_zhaojian
  mfr_weituochu_dachu  mfr_xumishanzhang_jiezi  mfr_qianshourulaizhang_jieyin  mfr_dalijingangzhi_cuogu
  mfr_yizhichan_guanding  mfr_nianhuazhi_wuxing  mfr_wuxiangjiezhi_wuxiangjie  mfr_longzhaoshou_daoxu
  mfr_fumozhangfa_juding  mfr_ranmudaofa_liaoyuan  mfr_jiashafumogong_zhao  mfr_yiweidujiang_suibo
  mfr_jingangfumoquan_chanxin  mfr_huanyinzhi_hanjin
  ```

- **道家（19）**：

  ```text
  mfr_xiantiangong_gangqi  mfr_tiangang_hewei  mfr_yunvxinjing_hufa  mfr_gumuqinggong_youshen
  mfr_anran_xiangru  mfr_anran_daimu  mfr_xuantie_daqiao  mfr_xuantie_caomu
  mfr_suxin_huaqian  mfr_suxin_juan  mfr_mujianyi_caomu  mfr_taijiquan_shizi
  mfr_taijiquan_yunshou  mfr_taijijian_jianquan  mfr_taijijian_zhanjian  mfr_yitiantulonggong_haoling
  mfr_tiyunzong_zongyue  mfr_zhenwuqijie_guishe  mfr_yinyangdaoluan_jindao
  ```

- **通行（10）**：

  ```text
  mfr_yuenvjian_yixian  mfr_pojunqiangfa_xianzhen  mfr_yanmengqishe_huima  mfr_sihaibiaodao_kailu
  mfr_kaimenpiguaquan_tongbi  mfr_jianghubaizhanjian_zhuke  mfr_qihuangmifa_jinzhen  mfr_baidubianzheng_gongwei
  mfr_qimenbuzhen_fumen  mfr_qingxinqupu_jiefen
  ```

- **五绝（82）**：

  ```text
  mfr_dagou_aokouduozhang  mfr_dagou_tianxiawugou  mfr_tiebogong_zhenbafang  mfr_dagouzhen_shouwang
  mfr_tanzhi_lianzhu  mfr_tanzhi_tianhua  mfr_bihai_dingshen  mfr_bihai_chaosheng
  mfr_lanhuafuxueshou_jiuwan  mfr_yuxiaojianfa_feishenjian  mfr_luoyingshenjianzhang_shenjian  mfr_bitaoxuangong_wanli
  mfr_taohuazhen_ershibaxiu  mfr_hama_fajin  mfr_hama_quanjin  mfr_lingshezhangfa_chan
  mfr_lingshezhangfa_qunshe  mfr_lingshequan_qianbian  mfr_nizhuanjingmai_daozhuan  mfr_liumai_shaoshang
  mfr_liumai_shaoze  mfr_liumai_liumaiqifa  mfr_yiyangzhi_liaoshang  mfr_yiyangzhi_qianyang
  mfr_kurongchangong_fengchun  mfr_kurongchangong_feikufeirong  mfr_yiyangshuzhi_yunyan  mfr_duanjiajianfa_nanzhao
  mfr_kongming_dongsong  mfr_kongming_qishier  mfr_zuoyouhubo_fenxin  mfr_zuoyouhubo_quanli
  mfr_jiuyin_sunyouyu  mfr_jiuyin_buzu  mfr_jiuyin_tianzhidao  mfr_jiuyinshenzhao_shounao
  mfr_jiuyinshenzhao_wujian  mfr_yihun_dingxin  mfr_yihun_yihun  mfr_jiuyinbaigu_guimei
  mfr_jiuyinbaigu_suoming  mfr_cuixinzhang_wuhen  mfr_cuixinzhang_liemai  mfr_dafumoquan_hufa
  mfr_dafumoquan_dafumo  mfr_yijinduangupian_tuotai  mfr_shexinglifan_baibian  mfr_baimangbianfa_fanjiang
  mfr_tiezhang_hushen  mfr_tiezhang_qingtian  mfr_shuishangpiao_jieli  mfr_shuishangpiao_wuhen
  mfr_wumuyishu_hanshan  mfr_lihuaqiang_wudishou  mfr_zhebiejianshu_yijianshuangdiao  mfr_suohouqinnashou_qinlong
  mfr_xiaoyaoyou_tuanfeng  mfr_shexinshu_mihun  mfr_jiudaixingong_hubang  mfr_fengyulianshou_saoxiang
  mfr_zhengoubang_huilan  mfr_pojunguitoudao_huishou  mfr_gaibangchuansheng_hezhi  mfr_xuanfengsaoyetui_canye
  mfr_biluofengyan_yanbosan  mfr_qimenfushou_nawan  mfr_shentuoxueshanzhang_fuzhong  mfr_yushe_shidi
  mfr_lingshebu_tuoqiao  mfr_dumaihuqigong_guidu  mfr_duanshiyangshenggong_humai  mfr_tianlongchanbu_tuili
  mfr_wantongshuangxi_lianhuan  mfr_jiuyinliaoshangpian_biqi  mfr_tongshihenglian_yingqiao  mfr_shoujinpian_suomai
  mfr_biguqipian_guixi  mfr_duanfengzhang_zhenfeng  mfr_tiebifangshen_sheshen  mfr_yangjiaqiangfa_huima
  mfr_huodushanfa_ansuan  mfr_kusangbangfa_zhaohun
  ```

- **逍遥（67）**：

  ```text
  mfr_beiming_kuntun  mfr_beiming_chuangong  mfr_beiming_tianchi  mfr_xiaowuxiang_wuxiangjin
  mfr_xiaowuxiang_wuwo  mfr_lingbo_piaohu  mfr_lingbo_jiangfei  mfr_liuyangzhang_bafu
  mfr_liuyangzhang_yangsui  mfr_liuyangzhang_liuyang  mfr_zhemei_xunmei  mfr_zhemei_liuchu
  mfr_baihongzhang_bingjiao  mfr_baihongzhang_wandao  mfr_langhuanjian_lingxu  mfr_bahuang_duzun
  mfr_bahuang_fanlao  mfr_shengsifu_ciyao  mfr_shengsifu_fuyu  mfr_piaomiaojian_siji
  mfr_huagong_duwu  mfr_huagong_huajin  mfr_chousuizhang_duanhun  mfr_sanxiaoxiaoyaosan_sanxiao
  mfr_douzhuan_xingyi  mfr_douzhuan_xinghe  mfr_canhezhi_guiyi  mfr_huoyandao_hufa
  mfr_huoyandao_fentian  mfr_longxiang_banruo  mfr_longxiang_shilong  mfr_wulundazhuan_tielun
  mfr_wulundazhuan_dazhuan  mfr_beisuqingfeng_mantang  mfr_yanqingzhang_saoqian  mfr_yanqingzhang_yiyang
  mfr_yubijian_xianzong  mfr_qinlonggong_shuaizhi  mfr_qinlonggong_fuhu  mfr_bingcanduzhang_shixin
  mfr_changbaicaogong_huichun  mfr_chuanyinsouhun_shixin  mfr_tianjianzhifa_mingjian  mfr_hanguqiyin_qiyin
  mfr_jiutianjiubu_jiutian  mfr_sijijianzhen_dong  mfr_fushidu_shidu  mfr_huoduozhang_liaoyuan
  mfr_baijiadao_guiyi  mfr_murongjian_zhongxing  mfr_yirongshu_huanrong  mfr_canheqigong_huanyuan
  mfr_shuixiefeidao_tingxiang  mfr_dashouyin_dashouyin  mfr_jingangxiangmochu_fumo  mfr_mizonghufashen_huti
  mfr_mandaluozhen_hufa  mfr_tieyaoqiang_pozhen  mfr_xuehendao_xuehen  mfr_hexiangbu_heli
  mfr_ezuijian_duanjing  mfr_duanmaidao_wuhen  mfr_dongxishuangjian_hebi  mfr_jingedangkouqiang_aobing
  mfr_heiyiqianzong_yexing  mfr_canglangdao_xiaoyue  mfr_youshishuangqiang_tongxin
  ```

- **倚天（9）**：

  ```text
  mfr_jiuyang_huti  mfr_jiuyang_liaoshang  mfr_qiankun_diandao  mfr_xuanming_rusi
  mfr_shenghuoling_yinfengdao  mfr_dajiutianshou_lieyang  mfr_yingzhaoqinna_zhebing  mfr_zhengliangyi_zhengqi
  mfr_qishangquan_tuntu
  ```

- **侠客碧血（5）**：

  ```text
  mfr_taixuan_shibu  mfr_taixuan_sada  mfr_hunyuangong_yangqi  mfr_shenxing_taxi
  mfr_jinshejian_nilinhui
  ```

- **五岳（7）**：

  ```text
  mfr_dugu9_poanqi  mfr_dugu9_poqi  mfr_zixiashengong_guangri  mfr_hanbingzhenqi_fengmai
  mfr_xixing_sangong  mfr_kuihua_cimu  mfr_bixie_feiyanchuanliu
  ```

### 7.3 实现与解析检查

- ✅ **逐门规则**：12 个绝对品阶全部有测试；天中 / 地中命中裁定表时收紧为精确值，未命中时才使用合法区间。黄阶及玄下 / 玄中的 0 配额也纳入正式武学全集，不再只遍历有绝招路线的武学。
- ✅ **正文真值**：配额以正文 `MoveDef.ultimate:true` 计数，不从路线镜像反推；新增回归用例证明缺路线的正文绝招仍触发配额错误，无法归属的真值也不会静默略过。
- ✅ **裁定表解析**：只解析 `## 3.` 至 `## 4.`；每个分册表通过实际表头中的 ``sk_*`` 与“现→裁（变动）”定位列，解析 `当前→裁定（增量）`，并校验增量算术、裁定值 1–3、重复 ID、有效表头和非空结果。
- ✅ **配置失败**：裁定表缺失、不可读、无 §3、坏表头、坏数据、重复 ID 或算术矛盾均抛出 `UltimateRulingsError`；CLI 打印 `ERROR` 并返回 2。
- ✅ **动态范围**：正式图鉴按实际目录和 `skills-[a-z0-9-]+.md` 文件名匹配；删除硬编码 `EXPECTED`、固定册名和 `AUDIT_VERSION` 日期门槛。
- ✅ **外部例外**：`EXTERNAL_WUJUE` / `EXTERNAL_LAYERS` 原处理保留，降龙十八掌三记继续计入五绝的天上配额。
- ✅ **token 边界**：所有 `ap_*` / `mfr_*` 提取均增加 ASCII ID 左边界 `(?<![A-Za-z0-9_])`，测试确认 `xap_*` / `xmfr_*` 不再误命中。
- ✅ **NL2 小修**：“只定义一次”的三种版式断言已移入各自 `subTest`；README 已从固定 §0.12.1 改为不依赖章节号的结构识别。

### 7.4 测试清单与结果

- ✅ 品阶规则：1–12 逐一核对；天中 / 地中命中裁定表的精确值单测通过。
- ✅ 裁定源：真实表解析为 75 门；缺失表、损坏行及 CLI 配置错误退出码均有单测。
- ✅ 新武学回退：天中 / 地中区间内仅提示，区间外同时提示并产生配额错误；摘要显示提示数。
- ✅ 正文计数：无路线目标的正文绝招仍计入；无正式武学归属时明确报错；低阶 0 配额覆盖。
- ✅ 兼容检查：降龙十八掌外部映射、路线 token 边界及 NL2 三种路线表写法均通过。
- ✅ 专项测试：`python3 -m unittest -v tools.lint.test_check_skill_catalogs`，43 / 43 通过。
- ✅ 全量测试：`python3 -m unittest discover -s tools/lint -p "test_*.py"`，99 / 99 通过。
- ✅ 覆盖率：仓库 / 用户未配置覆盖率门禁，按单测流程跳过覆盖率统计；新增用例均已纳入上述全量验证。
- ✅ 严格 ID：`python3 tools/lint/check_ids.py --strict` 退出 0；仅报告基线内既有 `sk_babuganchan`，新增严格失败为 0。
- ✅ 静态检查：`python3 -m py_compile` 与 `git diff --check` 均通过。
- ✅ 当前扫描：非 strict `--details` 退出 0，11 册 256 个预期存量错误；`--strict` 按设计会因这些存量项退出 1，本任务不放宽任何规则。
- ✅ 修改范围：仅 `tools/lint/**` 与本报告；未执行改变仓库状态的 Git 命令。
- ✅ 完整性：报告与 README 无 `TODO`、`此处省略`、`待补充`；表格与代码围栏完整。

