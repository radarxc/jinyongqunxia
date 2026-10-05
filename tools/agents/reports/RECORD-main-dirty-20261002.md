# 主检出未提交内容记录（2026-10-02）

作者 10-02 定：主检出的脏文件「记录」，不清理。本文是记录；文件本身仍留在主检出工作区，没有改动。

- 主检出：`/Users/bytedance/Projects/jinyongqunxia`，分支 `claude/vigilant-wright-2unuk1`；比对对象是集成分支 `claude/production-20260930`（`.agents/wt/_prod`）的现版和全部历史。
- 逐条清单：`.agents/archive/main-dirty-20261002/status.tsv`（1904 条，位于主检出，不入库）。
- 独有文件的副本：同目录 `files/`（保持原路径）；3 个已修改独有文件与集成分支现版的差异：`diffs/`。

## 分类统计

| git 状态 | 类别 | 数量 |
|---|---|---|
| ?? | .DS_Store | 8 |
| ?? | generated_images（见该目录 README / MAP.tsv） | 838 |
| ?? | 同集成分支现版 | 156 |
| ?? | 旧立绘 manifest | 30 |
| ?? | 旧立绘副本（与集成分支现图或 generated_images 原图同字节） | 477 |
| ?? | 独有 | 96 |
| ?? | 集成分支历史旧版 | 184 |
| M | 同集成分支现版 | 42 |
| M | 独有 | 3 |
| M | 集成分支历史旧版 | 70 |

说明：

- **同集成分支现版 / 集成分支历史旧版**：内容在集成分支里已有，丢弃不会丢东西。
- **旧立绘副本**：`assets/default/character/` 里 477 张 PNG 都与集成分支现有立绘（199 张）或 `generated_images/` 原图（278 张）同字节，没有独有的。
- **独有**：集成分支历史里从没出现过的版本，共 99 个，副本已存。几乎都是人物提示词，以 ch09 / ch12 / ch14 为主。修改时间集中在 10-01 23 时至 10-02 01 时，与作者 Codex 应用那一轮出图（`.agents/coord/portrait-generation/`）同期，推测是那一轮改写的。集成分支后来按 AR-31 / AR-32 另行改写过同名文件。

## 独有文件

- `M` assets/default/STYLE.md
- `M` assets/default/prompts/characters/INDEX.md
- `M` docs/design/catalog/npcs-ch01-tianlong.md
- `??` assets/default/prompts/characters/ch01-tianlong/npc_kangmin.md
- `??` assets/default/prompts/characters/ch02-shediao/npc_qiuqianren.md
- `??` assets/default/prompts/characters/ch02-shediao/npc_tiemuzhen.md
- `??` assets/default/prompts/characters/ch02-shediao/npc_tuolei.md
- `??` assets/default/prompts/characters/ch02-shediao/npc_wanyanhonglie.md
- `??` assets/default/prompts/characters/ch02-shediao/npc_yideng.md
- `??` assets/default/prompts/characters/ch03-shendiao/npc_zhoubotong.md
- `??` assets/default/prompts/characters/ch06-xiake/npc_fengwanli.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_baoxiang.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_buyuan.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_dingdian.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_fengtan.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_huantiegan.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_kongxincai.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_lingshuanghua.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_lingtusi.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_liurenfeng.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_lukun.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_lutianshu.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_meiniansheng.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_qichangfa.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_qifang.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_shencheng.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_shuidao.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_shuisheng.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_sunjun.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_taohong.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_wangui.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_wangxiaofeng.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_wanzhenshan.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_wukan.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_xuedaolaozu.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_yandaping.md
- `??` assets/default/prompts/characters/ch09-liancheng/npc_zhouqi09.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_afanti.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_changbozhi.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_changhezhi.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_chenjialuo.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_chenshiguan.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_chenzhengde.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_guanmingmei.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_huoayi.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_jiangsigen.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_kasili.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_liyuanzhi.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_lufeiqing.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_luobing.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_muzhuolun.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_qianlong.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_qianzhenglun.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_shishuangying.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_wangweiyang.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_weichunhua.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_wentailai.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_wuchen.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_xinyan.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_xutianhong.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_yangchengxie.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_yanshizhang.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_yuanshixiao.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_yuwanting.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_yuyutong.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_zhangjin.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_zhangzhaozhong.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_zhaobanshan.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_zhaohui.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_zhouqi12.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_zhouyingjie.md
- `??` assets/default/prompts/characters/ch12-shujian/npc_zhouzhongying.md
- `??` assets/default/prompts/characters/ch13-feihu/npc_zhangyunfei.md
- `??` assets/default/prompts/characters/ch13-feihu/npc_zhaobanshan.md
- `??` assets/default/prompts/characters/ch13-feihu/npc_zhongzhaoneng.md
- `??` assets/default/prompts/characters/ch13-feihu/npc_zhongzhaoying.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_baoshu.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_caoyunqi.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_duximeng.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_fanbangzhu.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_hufei.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_hufuren.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_huyidao.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_jingzhidashi.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_liuyuanhe.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_miaorenfeng.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_miaoruolan.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_nanlan.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_pingasi.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_ruanshizhong.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_saizongguan.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_taobaisui.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_taozian.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_tianguinong.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_tianqingwen.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_xiongyuanxian.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_yinji.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_zhengsanniang.md
- `??` assets/default/prompts/characters/ch14-xueshan/npc_zhouyunyang.md
