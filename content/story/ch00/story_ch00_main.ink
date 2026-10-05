EXTERNAL get_flag(flag_id)
EXTERNAL has_item(item_id)

=== modern_opening ===
#ts:dialogue/speaker speaker=narrator
雨声贴着窗沿落下。桌上的旧书没有题名，翻开的纸页却渗出一线墨光。
#ts:dialogue/speaker speaker=book_spirit
先确认你是谁，再往书里走。画面可以略过，身份与选择不能略过。
#ts:dialogue/speaker speaker=narrator
墨色漫过纸边。再睁眼时，脚下已是湿润的竹叶。
-> END

=== prologue_mode ===
#ts:dialogue/speaker speaker=book_spirit
这是一段入书之梦。你可以亲历越地，也可以读过摘要，或直接去往醒来的年代。
#ts:dialogue/speaker speaker=book_spirit
无论选哪一路，阿青所授的第一层、初眠配点与白马入口都不会少；教学见闻与章内物品不会带走。
-> END

=== aqing_first_meeting ===
#ts:flag/set flagId=fl_00_awake value=true
#ts:quest/advance quest=q_00_main_c_01 stage=st_find_aqing
#ts:dialogue/speaker speaker=narrator
羊铃从竹影后传来。一名牧羊少女弯腰拾起散落的细枝，像是在等你开口。
* [问这里是什么地方]
    #ts:dialogue/speaker speaker=player
    这里是什么地方？我方才还在灯下。
    #ts:dialogue/speaker speaker=npc_aqing
    这里是越地的山林。你若迷了路，先随我走出竹间。
* [问她是谁]
    #ts:dialogue/speaker speaker=player
    你是谁？
    #ts:dialogue/speaker speaker=npc_aqing
    我叫阿青，在这里牧羊。你拿稳脚下那根竹棒，路上有乱石。
* [先帮她拾起竹枝]
    #ts:dialogue/speaker speaker=player
    我先把这些拾起来。
    #ts:dialogue/speaker speaker=npc_aqing
    多谢。留一根在手里吧，遇到拦路的人也好护住自己。
-
#ts:flag/set flagId=fl_00_aqing_found value=true
#ts:quest/advance quest=q_00_main_c_01 stage=st_accept_staff
#ts:flag/set flagId=fl_00_staff_accepted value=true
#ts:quest/advance quest=q_00_main_c_01 stage=st_close
#ts:dialogue/speaker speaker=book_spirit
竹棒与药物只属于这场梦。离开序章时，它们会一并归还书页。
-> END

=== after_initial_battle ===
#ts:dialogue/speaker speaker=npc_aqing
先看清脚下，再看对面。倒下的人已经退开，不必再追。
* [还想自己再试]
    #ts:flag/set flagId=fl_00_initial_battle_manual value=true
    #ts:tutorial/mark tutorial=initial_battle state=completed
    #ts:dialogue/speaker speaker=book_spirit
    已记录手动完成：移动、出招与一次防御、调息或用药都可在教学册重看。
* {get_flag("fl_00_zhulin_loss_streak3")} [请书灵示范一次]
    #ts:flag/set flagId=fl_00_initial_battle_assisted value=true
    #ts:tutorial/mark tutorial=initial_battle state=completed
    #ts:party/giveItem item=it_huoxuewan count=1
    #ts:dialogue/speaker speaker=book_spirit
    示范只替你演出同一组命令，不改变奖励，也不会重掷战场。
-
#ts:quest/advance quest=q_00_main_c_02 stage=st_track
-> END

=== baiyuan_choice ===
#ts:flag/set flagId=fl_00_baiyuan_tracked value=true
#ts:quest/advance quest=q_00_main_c_02 stage=st_baiyuan_choice
#ts:dialogue/speaker speaker=narrator
白猿攀在山径的横枝上，手里绕着竹棒旁的布结。旁边有一处可绕行的浅沟。
-> choose

= choose
* {has_item("it_tao")} [放下一枚桃子]
    #ts:party/takeItem item=it_tao count=1
    #ts:flag/set flagId=fl_00_baiyuan_peaceful value=true
    #ts:tutorial/mark tutorial=nonlethal state=completed
    #ts:dialogue/speaker speaker=narrator
    白猿取走桃子，跃到更高的枝头，把山径让了出来。
    -> baiyuan_after
* {not has_item("it_tao")} [放下一枚桃子（需要一枚桃子）]
    #ts:dialogue/speaker speaker=book_spirit
    行囊里没有桃子，不能提交投果；请选择试手或绕路。
    -> choose
* [以竹棒试手]
    #ts:flag/set flagId=fl_00_baiyuan_spar value=true
    #ts:quest/advance quest=q_00_main_c_02 stage=st_baiyuan_spar
    #ts:battle/start encounter=enc_00_baiyuan
    #ts:dialogue/speaker speaker=book_spirit
    只需命中一次、坚持两轮或主动认输；这是切磋，不是死斗。
    -> END
* [走明示的绕路]
    #ts:flag/set flagId=fl_00_baiyuan_bypass value=true
    #ts:tutorial/mark tutorial=qigong state=pending
    #ts:dialogue/speaker speaker=book_spirit
    绕路同样推进主线；聚气教学会在边道首轮补上。
    -> baiyuan_after

=== baiyuan_after ===
#ts:quest/advance quest=q_00_main_c_02 stage=st_merge
#ts:flag/set flagId=fl_00_baiyuan_merged value=true
#ts:quest/advance quest=q_00_main_c_02 stage=st_close
#ts:dialogue/speaker speaker=npc_aqing
它与我来往，从不替招数取名。你记住它怎样看、怎样动，就够了。
#ts:dialogue/speaker speaker=book_spirit
三条路在这里汇合。投果、切磋与绕路没有数值奖励差别。
-> END

=== fanli_request ===
#ts:dialogue/speaker speaker=npc_fanli
越军需要有人示范如何持剑应敌。我来请阿青，也想请你在阵边作个见证。
* [劝阿青相助]
    #ts:dialogue/speaker speaker=player
    若你愿意，也许能少些人在乱阵里受伤。
* [不置一词]
    #ts:dialogue/speaker speaker=player
    这件事该由阿青自己决定。
* [先问阿青愿不愿]
    #ts:dialogue/speaker speaker=player
    阿青，你愿意去吗？
-
#ts:dialogue/speaker speaker=npc_aqing
我自己去看一看。你们跟得上，就在旁边看。
#ts:flag/set flagId=fl_00_fanli_request_done value=true
#ts:quest/advance quest=q_00_main_c_03 stage=st_drill
#ts:tutorial/mark tutorial=formation state=completed
#ts:flag/set flagId=fl_00_drill_done value=true
#ts:quest/advance quest=q_00_main_c_03 stage=st_biandao
#ts:battle/start encounter=enc_00_biandao
-> END

=== biandao_after ===
#ts:dialogue/speaker speaker=narrator
兵刃落地，双方都被分开看守。范蠡命人先治伤，再查清这场边道冲突。
#ts:dialogue/speaker speaker=npc_fanli
止住这一阵便够了。今日不以俘虏与财物论功。
#ts:flag/set flagId=fl_00_biandao_done value=true
#ts:quest/advance quest=q_00_main_c_03 stage=st_sword_demo
-> END

=== sword_source ===
#ts:dialogue/speaker speaker=npc_aqing
竹枝也好，剑也好，先到的不是招名，是眼前这一点。
* [亲手完成两步演示]
    #ts:dialogue/speaker speaker=book_spirit
    教学投影已启用。你暂时借用阿青的地上九品画像，只完成指定的位移与范围动作。
* [一键观看演示]
    #ts:dialogue/speaker speaker=book_spirit
    辅助演示会播放相同的两步，不改变收据与后续结果。
-
#ts:tutorial/mark tutorial=sword_demo state=completed
#ts:flag/set flagId=fl_00_sword_demo_seen value=true
#ts:quest/advance quest=q_00_main_c_03 stage=st_nine_preview
#ts:dialogue/speaker speaker=book_spirit
越女剑教学投影已经销毁。你见过剑理，却没有正式习得武学、残篇或资质。
-> END

=== nine_layer_preview ===
#ts:dialogue/speaker speaker=npc_aqing
方才是剑的路。接下来只看气息怎样自己寻路，不要把所见当成已有的功力。
* [逐步查看九层远景]
    #ts:dialogue/speaker speaker=book_spirit
    依次确认气息自转、旋流化劲与经脉承压预警。预览不造成伤害，也不写入层数。
* [一键观看九层远景]
    #ts:dialogue/speaker speaker=book_spirit
    已用辅助节奏展示三项远景；数据结果与逐步查看相同。
-
#ts:tutorial/mark tutorial=nine_layer_preview state=completed
#ts:flag/set flagId=fl_00_nine_preview_seen value=true
#ts:quest/advance quest=q_00_main_c_03 stage=st_close
#ts:dialogue/speaker speaker=book_spirit
九层教学投影已经销毁。现在仍未拥有《长生诀》的任何真实层数。
-> END

=== aqing_first_layer ===
#ts:dialogue/speaker speaker=npc_aqing
方才所见是路尽头，不是你已有的功力。先记一呼一吸，让气息自己回环。
* [问这门功法]
    #ts:dialogue/speaker speaker=player
    它究竟是什么功法？
    #ts:dialogue/speaker speaker=npc_aqing
    名字可以以后再懂。眼下只守住这一息，不追第二层。
* [问沉睡是否危险]
    #ts:dialogue/speaker speaker=player
    若我沉睡很久，会不会死？
    #ts:dialogue/speaker speaker=npc_aqing
    第一层会护住生机。你只管把这一息记牢。
* [默记呼吸]
    #ts:dialogue/speaker speaker=narrator
    你随她的节奏吐纳，气息在体内完成第一次闭环。
-
#ts:story/requestTransmission skill=sk_changshengjue source=aqing
#ts:flag/set flagId=fl_00_first_layer_committed value=true
#ts:quest/advance quest=q_00_main_c_04 stage=st_save_export
#ts:save/autosave reason=first_layer_commit
#ts:dialogue/speaker speaker=book_spirit
记录：授法者是阿青，《长生诀》第一层已成。我只保存收据，不曾代她传功。
-> END

=== northbound_departure ===
#ts:dialogue/speaker speaker=book_spirit
这里可以检查存档与导出。普通游玩可以稍后处理；验收流程应先导出、预检并导回同一哈希。
* [已完成导入验证]
    #ts:tutorial/mark tutorial=fx_export_verified state=completed
    #ts:dialogue/speaker speaker=book_spirit
    导回结果与当前档一致，验证收据已经记录。
* [稍后再导出]
    #ts:dialogue/speaker speaker=book_spirit
    已跳过可选导出，不影响继续北行。
-
#ts:dialogue/speaker speaker=narrator
越营的火光渐远。你不能留在这页年代，只得循山路北行。
* [回望越地]
    #ts:dialogue/speaker speaker=player
    若还有重逢之日，我会记得这根竹枝。
* [直接北行]
    #ts:dialogue/speaker speaker=player
    走吧。下一页还在前面。
-
#ts:flag/set flagId=fl_00_save_export_done value=true
#ts:quest/advance quest=q_00_main_c_04 stage=st_northbound
#ts:flag/set flagId=fl_00_northbound value=true
#ts:quest/advance quest=q_00_main_c_04 stage=st_avalanche
#ts:dialogue/speaker speaker=narrator
山色由青转白。风雪压住去路，轰鸣自高处滚落，你被雪浪卷进一处岩洞。
#ts:flag/set flagId=fl_00_avalanche_survived value=true
#ts:quest/advance quest=q_00_main_c_04 stage=st_allocation
-> END

=== first_sleep_allocation ===
#ts:dialogue/speaker speaker=book_spirit
第一层仍在自行运转。沉睡前须确认六项根基：每项先有三十五点，再分配九十点，总和三百。
* [打开手动配点]
    #ts:ui/openAllocation mode=manual
* [使用六项各五十的均衡方案]
    #ts:ui/openAllocation mode=balanced
* [返回检查第一层与携带物]
    #ts:dialogue/speaker speaker=book_spirit
    第一层已成；教学武学和全部章内物品都会清除。确认后仍回到同一配点页。
    -> first_sleep_allocation
-
#ts:flag/set flagId=fl_00_allocation_ready value=true
#ts:quest/advance quest=q_00_main_c_04 stage=st_sleep_commit
#ts:save/autosave reason=first_sleep_snapshot
#ts:flag/set flagId=fl_00_first_sleep_committed value=true
#ts:quest/advance quest=q_00_main_c_04 stage=st_wake
#ts:save/autosave reason=first_sleep_commit
-> wake_to_baima

=== wake_to_baima ===
#ts:dialogue/speaker speaker=narrator
公元前四八二年至公元七〇二年，雪岩外已过一千一百八十四年。
#ts:dialogue/speaker speaker=book_spirit
你仍是原来的年纪。向西走，风蚀废驿就在前方；白马篇尚未正式开始。
#ts:flag/set flagId=fl_00_wake_baima value=true
#ts:quest/advance quest=q_00_main_c_04 stage=st_close
#ts:ui/showTitleCard card=baima_cold_entry
-> END

=== skip_summary ===
#ts:dialogue/speaker speaker=narrator
第一幅：雨夜翻书。你从现代坠入墨色书界，书灵在竹涛中醒来。
#ts:dialogue/speaker speaker=narrator
第二幅：牧羊少女。阿青以竹棒显出剑理；人物与细节只取《越女剑》大意，仍待逐字核对。
#ts:dialogue/speaker speaker=narrator
第三幅：山径白猿。它与阿青交手的旧事化作一段不授武学的见闻。
#ts:dialogue/speaker speaker=narrator
第四幅：范蠡与越军。范蠡请阿青助军习剑的情节以待考大意呈现。
#ts:dialogue/speaker speaker=narrator
第五幅：双重远景。你看见地上九品越女剑与九层功法投影，两者随教学结束而消散。
#ts:dialogue/speaker speaker=narrator
第六幅：越营传功。阿青亲授《长生诀》第一层，书灵只把事实记下。
#ts:dialogue/speaker speaker=narrator
第七幅：长白初眠。雪崩将你送入洞中；确认六项根基后，你将在一千一百八十四年后醒来。
* [确认摘要并进入配点]
    #ts:tutorial/mark tutorial=fx_skip_bridge state=completed
    #ts:tutorial/mark tutorial=prologue_summary state=completed
    #ts:story/requestTransmission skill=sk_changshengjue source=skip_bridge
    #ts:ui/openAllocation mode=manual
    #ts:save/autosave reason=first_sleep_commit
    #ts:ui/showTitleCard card=baima_cold_entry
    #ts:dialogue/speaker speaker=book_spirit
    摘要桥接、第一层与初眠已按同一闭包提交。
-> END

=== skip_direct ===
#ts:dialogue/speaker speaker=book_spirit
直接跳过不会获得越女剑、残篇、经验、物品或关系；《长生诀》第一层与合法属性快照仍不可省略。
* [现在配点]
    #ts:tutorial/mark tutorial=fx_skip_bridge state=completed
    #ts:tutorial/mark tutorial=prologue_direct state=skipped
    #ts:story/requestTransmission skill=sk_changshengjue source=skip_bridge
    #ts:ui/openAllocation mode=manual
    #ts:save/autosave reason=first_sleep_commit
    #ts:ui/showTitleCard card=baima_cold_entry
* [使用默认方案]
    #ts:tutorial/mark tutorial=fx_skip_bridge state=completed
    #ts:tutorial/mark tutorial=prologue_direct state=skipped
    #ts:story/requestTransmission skill=sk_changshengjue source=skip_bridge
    #ts:ui/openAllocation mode=default
    #ts:save/autosave reason=first_sleep_commit
    #ts:ui/showTitleCard card=baima_cold_entry
-
#ts:dialogue/speaker speaker=book_spirit
第一层与初眠已按同一闭包提交。下一步是白马篇的冷入口。
-> END
