=== westward_journey ===
#ts:dialogue/speaker speaker=narrator
雪压洞门，再开时已过千年。
#ts:dialogue/speaker speaker=narrator
你循残卷一路向西：出长白，过关中，沿河西驿路换乘军粮车，又随粟特商队穿入风沙。
#ts:dialogue/speaker speaker=narrator
城国已亡，城与人仍在。高昌国亡已六十余年，故城还伏在更西的黄土下。
#ts:dialogue/speaker speaker=narrator
第一卷，从一囊水、一匹白马和一个不肯替别人选择的人开始。
-> END

=== fengshi_first_talk ===
#ts:dialogue/speaker speaker=npc_shenqinghe10
从东边来的？水先拿稳。这里是西州北路，往北便是庭州地界。
#ts:dialogue/speaker speaker=npc_liwenxiu
风要转了，别追着旧路走。
* [问年份。]
    #ts:dialogue/speaker speaker=player
    如今是哪一年？
    #ts:dialogue/speaker speaker=npc_postman_tang_xiyu
    长安二年。庭州新置北庭都护府，北路的牒文也刚换过。
    -> first_talk_join
* [问旧城。]
    #ts:dialogue/speaker speaker=player
    残卷说的故城，还能找到吗？
    #ts:dialogue/speaker speaker=narrator
    沈青禾朝西边残墙抬了抬手：旧城仍在，先看风，再问路。
    -> first_talk_join
* [帮捡药囊。]
    #ts:dialogue/speaker speaker=player
    风紧，先把药囊收好。
    #ts:dialogue/speaker speaker=narrator
    你只拾近处的药囊，把散开的系绳重新束紧。
    -> first_talk_join

= first_talk_join
#ts:dialogue/speaker speaker=narrator
东边的木栅在风里轻响，路标上的旧布被吹得笔直。
#ts:flag/set flagId=fl_10_cold_entry_talked value=true
#ts:world/openEntrance entranceId=ent_10_fengshi_east
#ts:save/autosave reason=ch10_cold_entry_complete
-> title_card

=== title_card ===
#ts:ui/showTitleCard card=ch10_volume_one
#ts:dialogue/speaker speaker=narrator
第一卷·白马啸西风
-> END
