export interface TrackMeta {
  readonly id: string;
  readonly title: string;
  readonly book: string;
  readonly file: string;
  readonly bpm?: number;
  readonly tags?: readonly string[];
}

export interface SoundCueMeta {
  readonly cue: string;
  readonly name: string;
  readonly file: string;
  readonly category: 'combat' | 'item' | 'life' | 'ui' | 'novel';
  readonly book?: string;
  readonly novelId?: string;
  readonly desc?: string;
}

export const NOVEL_MUSIC_TRACKS: readonly TrackMeta[] = [
  // ch00: 越女剑
  {
    id: '01_yuenvjian',
    title: '越女剑 - 金庸群侠传复古风',
    book: '越女剑',
    file: '/assets/music/01_越女剑_金庸群侠传复古风.m4a',
    bpm: 84,
    tags: ['ch00', '越女剑', 'rpg', 'retro', 'dizi', 'guzheng'],
  },
  // ch01: 天龙八部
  {
    id: '02_tianlong_tvb',
    title: '天龙八部 - 港版主题曲风（难念的经）',
    book: '天龙八部',
    file: '/assets/music/02_天龙八部_港版主题曲风_难念的经.m4a',
    bpm: 136,
    tags: ['ch01', '天龙八部', 'tvb', 'fast', 'pipa', 'tanggu'],
  },
  {
    id: '03_tianlong_qiaofeng',
    title: '天龙八部 - 乔峰出场/战神BGM',
    book: '天龙八部',
    file: '/assets/music/03_天龙八部_乔峰出场战神BGM.m4a',
    bpm: 92,
    tags: ['ch01', '天龙八部', 'heroic', 'suona', 'war_drum', 'tragic'],
  },
  {
    id: '04_tianlong_cctv',
    title: '天龙八部 - 央视版主题曲风（宽恕）',
    book: '天龙八部',
    file: '/assets/music/04_天龙八部_央视版主题曲风_宽恕.m4a',
    bpm: 72,
    tags: ['ch01', '天龙八部', 'cctv', 'ethereal', 'xun', 'dongxiao'],
  },
  // ch02: 射雕英雄传
  {
    id: '05_shediao_tvb',
    title: '射雕英雄传 - 港版主题曲风（铁血丹心）',
    book: '射雕英雄传',
    file: '/assets/music/05_射雕英雄传_港版主题曲风_铁血丹心.m4a',
    bpm: 120,
    tags: ['ch02', '射雕英雄传', 'tvb', 'brass', 'chivalric', 'dizi'],
  },
  {
    id: '06_shediao_xianglong',
    title: '射雕英雄传 - 降龙十八掌战斗BGM',
    book: '射雕英雄传',
    file: '/assets/music/06_射雕英雄传_降龙十八掌战斗BGM.m4a',
    bpm: 144,
    tags: ['ch02', '射雕英雄传', 'combat', 'suona', 'tanggu', 'palm_strike'],
  },
  {
    id: '07_shediao_cctv',
    title: '射雕英雄传 - 央视版主题曲风（天地都在我心中）',
    book: '射雕英雄传',
    file: '/assets/music/07_射雕英雄传_央视版主题曲风_天地都在我心中.m4a',
    bpm: 88,
    tags: ['ch02', '射雕英雄传', 'cctv', 'steppes', 'morin_khuur', 'epic'],
  },
  // ch03: 神雕侠侣
  {
    id: '08_shendiao_tvb_duet',
    title: '神雕侠侣 - 港版双笛情话（神话情话）',
    book: '神雕侠侣',
    file: '/assets/music/08_神雕侠侣_港版双笛情话_神话情话.m4a',
    bpm: 128,
    tags: ['ch03', '神雕侠侣', 'tvb', 'romantic', 'twin_flutes', 'passionate'],
  },
  {
    id: '09_shendiao_cliff',
    title: '神雕侠侣 - 绝情谷断肠崖思念',
    book: '神雕侠侣',
    file: '/assets/music/09_神雕侠侣_绝情谷断肠崖思念.m4a',
    bpm: 68,
    tags: ['ch03', '神雕侠侣', 'chamber', 'melancholic', 'erhu', 'guqin'],
  },
  // ch04: 倚天屠龙记
  {
    id: '10_yitian_ma',
    title: '倚天屠龙记 - 马景涛版（刀剑如梦风）',
    book: '倚天屠龙记',
    file: '/assets/music/10_倚天屠龙记_马景涛版_刀剑如梦风.m4a',
    bpm: 124,
    tags: ['ch04', '倚天屠龙记', 'taiwan_90s', 'folk_pop', 'carefree', 'wanderer'],
  },
  {
    id: '11_yitian_su',
    title: '倚天屠龙记 - 苏有朋版（风起云涌风）',
    book: '倚天屠龙记',
    file: '/assets/music/11_倚天屠龙记_苏有朋版_风起云涌风.m4a',
    bpm: 96,
    tags: ['ch04', '倚天屠龙记', 'dramatic', 'orchestral', 'erhu', 'battle'],
  },
  // ch05: 笑傲江湖
  {
    id: '12_xiaoao_tvb',
    title: '笑傲江湖 - 港版逍遥游（活得潇洒风）',
    book: '笑傲江湖',
    file: '/assets/music/12_笑傲江湖_港版逍遥游_活得潇洒风.m4a',
    bpm: 104,
    tags: ['ch05', '笑傲江湖', 'tvb', 'breezy', 'pastoral', 'dizi'],
  },
  {
    id: '13_xiaoao_game_duet',
    title: '笑傲江湖 - 琴箫和鸣游戏原声',
    book: '笑傲江湖',
    file: '/assets/music/13_笑傲江湖_琴箫和鸣游戏原声.m4a',
    bpm: 60,
    tags: ['ch05', '笑傲江湖', 'guqin', 'dongxiao', 'zen', 'duet', 'pure'],
  },
  {
    id: '14_xiaoao_canghai',
    title: '笑傲江湖 - 沧海一声笑传奇风',
    book: '笑傲江湖',
    file: '/assets/music/14_笑傲江湖_沧海一声笑传奇风.m4a',
    bpm: 92,
    tags: ['ch05', '笑傲江湖', 'anthem', 'pentatonic', 'legendary', 'guzheng'],
  },
  // ch06: 侠客行
  {
    id: '18_xiakexing',
    title: '侠客行 - 狂放豪迈赵客缦胡缨',
    book: '侠客行',
    file: '/assets/music/18_侠客行_狂放豪迈赵客缦胡缨.m4a',
    bpm: 150,
    tags: ['ch06', '侠客行', 'folk_rock', 'fast', 'galloping', 'untamed'],
  },
  // ch07: 碧血剑
  {
    id: '19_bixuejian',
    title: '碧血剑 - 明末挽歌山河动荡',
    book: '碧血剑',
    file: '/assets/music/19_碧血剑_明末挽歌山河动荡.m4a',
    bpm: 80,
    tags: ['ch07', '碧血剑', 'historical', 'solemn', 'bells', 'pipa'],
  },
  // ch08: 鹿鼎记
  {
    id: '15_ludingji',
    title: '鹿鼎记 - 市井幽默紫禁城风',
    book: '鹿鼎记',
    file: '/assets/music/15_鹿鼎记_市井幽默紫禁城风.m4a',
    bpm: 126,
    tags: ['ch08', '鹿鼎记', 'comedy', 'suona', 'kuaiban', 'mischievous'],
  },
  // ch09: 书剑恩仇录
  {
    id: '20_shujian',
    title: '书剑恩仇录 - 西域江南红花义气',
    book: '书剑恩仇录',
    file: '/assets/music/20_书剑恩仇录_西域江南红花义气.m4a',
    bpm: 90,
    tags: ['ch09', '书剑恩仇录', 'silk_road', 'oud', 'jiangnan', 'righteous'],
  },
  // ch10: 连城诀
  {
    id: '17_liancheng',
    title: '连城诀 - 血泪沉冤雪谷风',
    book: '连城诀',
    file: '/assets/music/17_连城诀_血泪沉冤雪谷风.m4a',
    bpm: 64,
    tags: ['ch10', '连城诀', 'dark', 'tragic', 'xun', 'gripping'],
  },
  // ch11: 雪山飞狐
  {
    id: '16_xueshan',
    title: '雪山飞狐 - 塞外飞雪孤侠风',
    book: '雪山飞狐',
    file: '/assets/music/16_雪山飞狐_塞外飞雪孤侠风.m4a',
    bpm: 76,
    tags: ['ch11', '雪山飞狐', 'snow', 'dongxiao', 'yangqin', 'solitary'],
  },
  // ch12: 飞狐外传
  {
    id: '23_feihu',
    title: '飞狐外传 - 快意恩仇少年英雄',
    book: '飞狐外传',
    file: '/assets/music/23_飞狐外传_快意恩仇少年英雄.m4a',
    bpm: 118,
    tags: ['ch12', '飞狐外传', 'youth', 'adventurous', 'chivalric'],
  },
  // ch13: 白马啸西风
  {
    id: '21_baimaxiaoxifeng',
    title: '白马啸西风 - 瀚海孤影大漠风情',
    book: '白马啸西风',
    file: '/assets/music/21_白马啸西风_瀚海孤影大漠风情.m4a',
    bpm: 70,
    tags: ['ch13', '白马啸西风', 'desert', 'dombra', 'melancholic', 'vast'],
  },
  // ch14: 鸳鸯刀
  {
    id: '22_yuanyangdao',
    title: '鸳鸯刀 - 诙谐幽默夫妻刀法',
    book: '鸳鸯刀',
    file: '/assets/music/22_鸳鸯刀_诙谐幽默夫妻刀法.m4a',
    bpm: 112,
    tags: ['ch14', '鸳鸯刀', 'comedy', 'playful', 'duet', 'witty'],
  },
];

export const NOVEL_BOOK_ALIASES: Readonly<Record<string, string>> = {
  // Chinese names & short names
  越女剑: '越女剑',
  ch00: '越女剑',
  天龙八部: '天龙八部',
  天龙: '天龙八部',
  ch01: '天龙八部',
  射雕英雄传: '射雕英雄传',
  射雕: '射雕英雄传',
  ch02: '射雕英雄传',
  神雕侠侣: '神雕侠侣',
  神雕: '神雕侠侣',
  ch03: '神雕侠侣',
  倚天屠龙记: '倚天屠龙记',
  倚天: '倚天屠龙记',
  ch04: '倚天屠龙记',
  笑傲江湖: '笑傲江湖',
  笑傲: '笑傲江湖',
  ch05: '笑傲江湖',
  侠客行: '侠客行',
  ch06: '侠客行',
  碧血剑: '碧血剑',
  ch07: '碧血剑',
  鹿鼎记: '鹿鼎记',
  ch08: '鹿鼎记',
  书剑恩仇录: '书剑恩仇录',
  书剑: '书剑恩仇录',
  ch09: '书剑恩仇录',
  连城诀: '连城诀',
  ch10: '连城诀',
  雪山飞狐: '雪山飞狐',
  ch11: '雪山飞狐',
  飞狐外传: '飞狐外传',
  飞狐: '飞狐外传',
  ch12: '飞狐外传',
  白马啸西风: '白马啸西风',
  白马: '白马啸西风',
  ch13: '白马啸西风',
  鸳鸯刀: '鸳鸯刀',
  ch14: '鸳鸯刀',
};

export const SOUND_EFFECT_CUES: readonly SoundCueMeta[] = [
  // 越女剑 (ch00)
  { cue: 'ch00_yuenv_bamboo', name: '越女竹棒破空轻点', file: '/assets/sfx/sfx_ch00_yuenv_bamboo.wav', category: 'novel', book: '越女剑', novelId: 'ch00', desc: '越女剑法翠竹杖，清幽凌厉竹风' },
  { cue: 'ch00_baiyuan_jump', name: '白猿灵捷纵跃清啸', file: '/assets/sfx/sfx_ch00_baiyuan_jump.wav', category: 'novel', book: '越女剑', novelId: 'ch00', desc: '灵猿腾挪纵跃灵巧风声与猿啼啸鸣' },

  // 天龙八部 (ch01)
  { cue: 'ch01_liumai_laser', name: '六脉神剑无形气剑激射', file: '/assets/sfx/sfx_ch01_liumai_laser.wav', category: 'novel', book: '天龙八部', novelId: 'ch01', desc: '指尖嗤嗤声响，无形剑气破空激射' },
  { cue: 'ch01_beiming_absorb', name: '北冥神功真气漩涡倒吸', file: '/assets/sfx/sfx_ch01_beiming_absorb.wav', category: 'novel', book: '天龙八部', novelId: 'ch01', desc: '真气漩涡倒吸，内力狂涌倒灌' },
  { cue: 'ch01_lingbo_steps', name: '凌波微步飘渺踏虚步法', file: '/assets/sfx/sfx_ch01_lingbo_steps.wav', category: 'novel', book: '天龙八部', novelId: 'ch01', desc: '罗袜生尘，踏虚而行空灵清脆步法' },

  // 射雕英雄传 (ch02)
  { cue: 'ch02_xianglong_dragon', name: '降龙十八掌龙啸震天', file: '/assets/sfx/sfx_ch02_xianglong_dragon.wav', category: 'novel', book: '射雕英雄传', novelId: 'ch02', desc: '掌出如龙，巨龙咆哮低频震波与爆裂重击' },
  { cue: 'ch02_dagou_stick', name: '打狗棒法绿竹杖连击', file: '/assets/sfx/sfx_ch02_dagou_stick.wav', category: 'novel', book: '射雕英雄传', novelId: 'ch02', desc: '绿竹杖连环打狗戳击与挑绊' },
  { cue: 'ch02_tanzhi_stone', name: '弹指神通飞石破甲', file: '/assets/sfx/sfx_ch02_tanzhi_stone.wav', category: 'novel', book: '射雕英雄传', novelId: 'ch02', desc: '指力弹出铁菩提飞石极速破空尖啸' },

  // 神雕侠侣 (ch03)
  { cue: 'ch03_xuantie_heavy', name: '玄铁重剑千钧狂潮斩', file: '/assets/sfx/sfx_ch03_xuantie_heavy.wav', category: 'novel', book: '神雕侠侣', novelId: 'ch03', desc: '大巧不工，汹涌澎湃海潮狂压重击' },
  { cue: 'ch03_anran_palm', name: '黯然销魂掌心神悲鸣震', file: '/assets/sfx/sfx_ch03_anran_palm.wav', category: 'novel', book: '神雕侠侣', novelId: 'ch03', desc: '心经剧震悲绝内力轰鸣' },
  { cue: 'ch03_yufeng_needle', name: '玉蜂金针细雨如丝破空', file: '/assets/sfx/sfx_ch03_yufeng_needle.wav', category: 'novel', book: '神雕侠侣', novelId: 'ch03', desc: '细密微型金针暴雨般破风' },

  // 倚天屠龙记 (ch04)
  { cue: 'ch04_yitian_draw', name: '倚天宝剑龙吟出鞘', file: '/assets/sfx/sfx_ch04_yitian_draw.wav', category: 'novel', book: '倚天屠龙记', novelId: 'ch04', desc: '寒芒乍现，青锋出鞘龙吟悠长' },
  { cue: 'ch04_tulong_quake', name: '屠龙宝刀开山斩浪', file: '/assets/sfx/sfx_ch04_tulong_quake.wav', category: 'novel', book: '倚天屠龙记', novelId: 'ch04', desc: '霸道厚重，裂地开山斩击' },
  { cue: 'ch04_taiji_circle', name: '太极阴阳圆转化劲', file: '/assets/sfx/sfx_ch04_taiji_circle.wav', category: 'novel', book: '倚天屠龙记', novelId: 'ch04', desc: '以柔克刚，圆转如意化劲流转' },
  { cue: 'ch04_qiankun_shift', name: '乾坤大挪移气劲牵引', file: '/assets/sfx/sfx_ch04_qiankun_shift.wav', category: 'novel', book: '倚天屠龙记', novelId: 'ch04', desc: '真气错位颠倒牵引的异样空间感' },

  // 笑傲江湖 (ch05)
  { cue: 'ch05_dugu_parry', name: '独孤九剑料敌先机破招', file: '/assets/sfx/sfx_ch05_dugu_parry.wav', category: 'novel', book: '笑傲江湖', novelId: 'ch05', desc: '料敌先机，连环精妙刺击兵刃要害' },
  { cue: 'ch05_bixie_fast', name: '辟邪剑法诡谲极速突刺', file: '/assets/sfx/sfx_ch05_bixie_fast.wav', category: 'novel', book: '笑傲江湖', novelId: 'ch05', desc: '迅捷如鬼魅，三段极速连环阴柔突刺' },
  { cue: 'ch05_xixing_whirl', name: '吸星大法丹田气海吸旋', file: '/assets/sfx/sfx_ch05_xixing_whirl.wav', category: 'novel', book: '笑傲江湖', novelId: 'ch05', desc: '丹田常如空箱，深不见底吸附' },

  // 侠客行 (ch06)
  { cue: 'ch06_taixuan_burst', name: '白首太玄经混沌神芒爆裂', file: '/assets/sfx/sfx_ch06_taixuan_burst.wav', category: 'novel', book: '侠客行', novelId: 'ch06', desc: '混沌初开，旷世神功真气大爆发' },
  { cue: 'ch06_token_drop', name: '赏善罚恶令掷地铜音', file: '/assets/sfx/sfx_ch06_token_drop.wav', category: 'novel', book: '侠客行', novelId: 'ch06', desc: '铁木令掷地清冷沉重金石声' },

  // 碧血剑 (ch07)
  { cue: 'ch07_jinshe_curved', name: '金蛇剑蛇形蜿蜒破空', file: '/assets/sfx/sfx_ch07_jinshe_curved.wav', category: 'novel', book: '碧血剑', novelId: 'ch07', desc: '黄金蛇鳞剑身，破风如毒蛇吐信' },
  { cue: 'ch07_jinshe_cone', name: '金蛇锥连环攒射破甲', file: '/assets/sfx/sfx_ch07_jinshe_cone.wav', category: 'novel', book: '碧血剑', novelId: 'ch07', desc: '金蛇锥破空暴射破甲' },

  // 鹿鼎记 (ch08)
  { cue: 'ch08_musket_fire', name: '燧发火枪火药轰鸣', file: '/assets/sfx/sfx_ch08_musket_fire.wav', category: 'novel', book: '鹿鼎记', novelId: 'ch08', desc: '燧发枪火药剧烈轰鸣' },
  { cue: 'ch08_lime_powder', name: '石灰粉迎面撒出沙沙破风', file: '/assets/sfx/sfx_ch08_lime_powder.wav', category: 'novel', book: '鹿鼎记', novelId: 'ch08', desc: '细密石灰粉末扩散破风' },
  { cue: 'ch08_dice_roll', name: '骨骰在瓷碗中清脆滚动', file: '/assets/sfx/sfx_ch08_dice_roll.wav', category: 'novel', book: '鹿鼎记', novelId: 'ch08', desc: '象牙骨骰在瓷碗中弹跳撞击' },

  // 书剑恩仇录 (ch09)
  { cue: 'ch09_baihua_punch', name: '百花错拳错落拳风', file: '/assets/sfx/sfx_ch09_baihua_punch.wav', category: 'novel', book: '书剑恩仇录', novelId: 'ch09', desc: '百家拳法杂糅错落连珠拳风' },
  { cue: 'ch09_rouyun_sword', name: '柔云剑术绵绵剑意', file: '/assets/sfx/sfx_ch09_rouyun_sword.wav', category: 'novel', book: '书剑恩仇录', novelId: 'ch09', desc: '武当行云流水绵绵不断柔韧剑风' },

  // 连城诀 (ch10)
  { cue: 'ch10_xuedao_slash', name: '血刀经反手撩斩血光', file: '/assets/sfx/sfx_ch10_xuedao_slash.wav', category: 'novel', book: '连城诀', novelId: 'ch10', desc: '阴狠邪异剃刀般斜挑反手撩斩' },
  { cue: 'ch10_shenzhao_revive', name: '神照经起死回生真气回溯', file: '/assets/sfx/sfx_ch10_shenzhao_revive.wav', category: 'novel', book: '连城诀', novelId: 'ch10', desc: '起死回生，暖意融融真气注脉' },

  // 雪山飞狐 (ch11)
  { cue: 'ch11_hujia_saber', name: '胡家刀法缠头裹脑刀花', file: '/assets/sfx/sfx_ch11_hujia_saber.wav', category: 'novel', book: '雪山飞狐', novelId: 'ch11', desc: '飞狐刀法轻灵飞动回环呼啸' },
  { cue: 'ch11_snow_wind', name: '塞外暴风雪裹挟踏雪', file: '/assets/sfx/sfx_ch11_snow_wind.wav', category: 'novel', book: '雪山飞狐', novelId: 'ch11', desc: '寒风凛冽呼啸与踏雪咯吱' },

  // 飞狐外传 (ch12)
  { cue: 'ch12_miaojia_sword', name: '苗家剑法黄龙转身', file: '/assets/sfx/sfx_ch12_miaojia_sword.wav', category: 'novel', book: '飞狐外传', novelId: 'ch12', desc: '一代剑圣，沉稳老辣黄龙刺击' },
  { cue: 'ch12_thunder_bomb', name: '霹雳雷火弹剧烈炸裂', file: '/assets/sfx/sfx_ch12_thunder_bomb.wav', category: 'novel', book: '飞狐外传', novelId: 'ch12', desc: '江湖火器剧烈雷火爆炸冲击波' },

  // 白马啸西风 (ch13)
  { cue: 'ch13_desert_wind', name: '西域大漠黄沙狂风', file: '/assets/sfx/sfx_ch13_desert_wind.wav', category: 'novel', book: '白马啸西风', novelId: 'ch13', desc: '狂暴风沙漫卷沙石颗粒摩擦' },
  { cue: 'ch13_horse_neigh', name: '白马长嘶高亢踏蹄', file: '/assets/sfx/sfx_ch13_horse_neigh.wav', category: 'novel', book: '白马啸西风', novelId: 'ch13', desc: '高亢长嘶与踏沙蹄声' },

  // 鸳鸯刀 (ch14)
  { cue: 'ch14_dual_saber', name: '鸳鸯双刀夫妻合璧清鸣', file: '/assets/sfx/sfx_ch14_dual_saber.wav', category: 'novel', book: '鸳鸯刀', novelId: 'ch14', desc: '短刀长刀相击，如胶似漆合璧双斩' },
  { cue: 'ch14_renzhe_aura', name: '仁者无敌真气震荡', file: '/assets/sfx/sfx_ch14_renzhe_aura.wav', category: 'novel', book: '鸳鸯刀', novelId: 'ch14', desc: '仁者无敌浩然正气宏大共鸣' },

  // 通用战斗与生活系统 (Common Combat / Life / UI)
  { cue: 'sword_swing', name: '剑招破空', file: '/assets/sfx/sfx_sword_swing_01.wav', category: 'combat', desc: '剑招破空轻啸' },
  { cue: 'sword_clash', name: '双剑格挡', file: '/assets/sfx/sfx_sword_clash_01.wav', category: 'combat', desc: '双剑格挡金铁相交' },
  { cue: 'sword_pierce', name: '剑尖突刺', file: '/assets/sfx/sfx_sword_pierce_01.wav', category: 'combat', desc: '剑尖突刺破甲' },
  { cue: 'saber_slash', name: '刀劈破空', file: '/assets/sfx/sfx_saber_slash_01.wav', category: 'combat', desc: '厚重单刀劈空' },
  { cue: 'saber_cleave', name: '沉重力劈', file: '/assets/sfx/sfx_saber_cleave_01.wav', category: 'combat', desc: '沉重力劈肉体打击' },
  { cue: 'dart_throw', name: '暗器破空', file: '/assets/sfx/sfx_dart_throw_01.wav', category: 'combat', desc: '暗器脱手破空尖啸' },
  { cue: 'dart_hit', name: '暗器钉中', file: '/assets/sfx/sfx_dart_hit_01.wav', category: 'combat', desc: '暗器钉中木石' },
  { cue: 'fist_punch', name: '刚猛拳掌', file: '/assets/sfx/sfx_fist_punch_01.wav', category: 'combat', desc: '刚猛拳掌肉搏击打' },
  { cue: 'dodge_whoosh', name: '身法闪避', file: '/assets/sfx/sfx_dodge_whoosh_01.wav', category: 'combat', desc: '身法闪避破空' },
  { cue: 'crit_strike', name: '会心一击', file: '/assets/sfx/sfx_crit_strike_01.wav', category: 'combat', desc: '会心一击破绽致命重创' },
  { cue: 'drink_potion', name: '喝药回甘', file: '/assets/sfx/sfx_drink_potion_01.wav', category: 'item', desc: '拔开药塞咕咚饮药回甘' },
  { cue: 'eating_food', name: '进食爽脆', file: '/assets/sfx/sfx_eating_food_01.wav', category: 'life', desc: '筷击瓷碗咀嚼进食' },
  { cue: 'book_flip', name: '研读翻页', file: '/assets/sfx/sfx_book_flip_01.wav', category: 'ui', desc: '秘籍研读翻动书页' },
  { cue: 'ui_click', name: '竹木点击', file: '/assets/sfx/sfx_ui_click_01.wav', category: 'ui', desc: '界面竹木清脆点击' },
];

export function normalizeBookName(input: string): string {
  const trimmed = input.trim();
  const direct = NOVEL_BOOK_ALIASES[trimmed];
  if (direct) return direct;

  for (const [alias, canonical] of Object.entries(NOVEL_BOOK_ALIASES)) {
    if (trimmed.includes(alias)) return canonical;
  }
  return trimmed;
}

export function getTracksByBook(bookNameOrId: string): readonly TrackMeta[] {
  const canonical = normalizeBookName(bookNameOrId);
  return NOVEL_MUSIC_TRACKS.filter(t => t.book === canonical);
}

export function getSfxByNovel(novelNameOrId: string): readonly SoundCueMeta[] {
  const canonical = normalizeBookName(novelNameOrId);
  const trimmed = novelNameOrId.trim().toLowerCase();
  return SOUND_EFFECT_CUES.filter(s =>
    s.book === canonical || (s.novelId && trimmed.includes(s.novelId))
  );
}

/**
 * 依据技能/招式标识智能映射最匹配的武侠音效
 */
export function resolveMoveSfx(moveIdOrName: string): string {
  const key = moveIdOrName.toLowerCase();

  // 1. 六脉神剑 / 一指禅
  if (key.includes('liumai') || key.includes('六脉') || key.includes('yizhichan') || key.includes('一指禅')) {
    return 'ch01_liumai_laser';
  }
  // 2. 北冥神功 / 吸星大法
  if (key.includes('beiming') || key.includes('北冥') || key.includes('xixing') || key.includes('吸星')) {
    return 'ch01_beiming_absorb';
  }
  // 3. 凌波微步 / 轻功身法
  if (key.includes('lingbo') || key.includes('凌波') || key.includes('gumuqinggong') || key.includes('caoshangfei') || key.includes('轻功')) {
    return 'ch01_lingbo_steps';
  }
  // 4. 降龙十八掌 / 掌法
  if (key.includes('xianglong') || key.includes('降龙') || key.includes('qishang') || key.includes('七伤') || key.includes('dajingangzhang')) {
    return 'ch02_xianglong_dragon';
  }
  // 5. 打狗棒法 / 棍杖法
  if (key.includes('dagou') || key.includes('打狗') || key.includes('gun') || key.includes('棍') || key.includes('杖') || key.includes('bang')) {
    return 'ch02_dagou_stick';
  }
  // 6. 弹指神通 / 飞石
  if (key.includes('tanzhi') || key.includes('弹指') || key.includes('feihuang') || key.includes('飞石') || key.includes('feishi')) {
    return 'ch02_tanzhi_stone';
  }
  // 7. 玄铁重剑 / 重击
  if (key.includes('xuantie') || key.includes('玄铁') || key.includes('heavy') || key.includes('chilian')) {
    return 'ch03_xuantie_heavy';
  }
  // 8. 黯然销魂掌
  if (key.includes('anran') || key.includes('黯然') || key.includes('chousui')) {
    return 'ch03_anran_palm';
  }
  // 9. 玉蜂金针 / 飞针
  if (key.includes('yufeng') || key.includes('玉蜂') || key.includes('zhen') || key.includes('针')) {
    return 'ch03_yufeng_needle';
  }
  // 10. 倚天剑 / 宝剑出鞘
  if (key.includes('yitian') || key.includes('倚天') || key.includes('kunlun') || key.includes('huashan')) {
    return 'ch04_yitian_draw';
  }
  // 11. 屠龙刀 / 开山
  if (key.includes('tulong') || key.includes('屠龙') || key.includes('kaishan')) {
    return 'ch04_tulong_quake';
  }
  // 12. 太极拳剑 / 化劲
  if (key.includes('taiji') || key.includes('太极') || key.includes('chunyang') || key.includes('纯阳')) {
    return 'ch04_taiji_circle';
  }
  // 13. 乾坤大挪移 / 斗转星移
  if (key.includes('qiankun') || key.includes('乾坤') || key.includes('douzhuan') || key.includes('斗转')) {
    return 'ch04_qiankun_shift';
  }
  // 14. 独孤九剑 / 破招
  if (key.includes('dugu') || key.includes('独孤') || key.includes('pozhao') || key.includes('破招')) {
    return 'ch05_dugu_parry';
  }
  // 15. 辟邪剑法 / 葵花宝典
  if (key.includes('bixie') || key.includes('辟邪') || key.includes('kuihua') || key.includes('葵花')) {
    return 'ch05_bixie_fast';
  }
  // 16. 太玄经
  if (key.includes('taixuan') || key.includes('太玄')) {
    return 'ch06_taixuan_burst';
  }
  // 17. 金蛇剑法
  if (key.includes('jinshe') || key.includes('金蛇')) {
    return 'ch07_jinshe_curved';
  }
  // 18. 火枪 / 霹雳雷火
  if (key.includes('huoqiang') || key.includes('火枪') || key.includes('leihuo') || key.includes('雷火')) {
    return 'ch08_musket_fire';
  }
  // 19. 百花错拳 / 拳法 / 散手
  if (key.includes('baihua') || key.includes('百花') || key.includes('quan') || key.includes('拳') || key.includes('sanshou') || key.includes('changquan')) {
    return 'ch09_baihua_punch';
  }
  // 20. 血刀经
  if (key.includes('xuedao') || key.includes('血刀')) {
    return 'ch10_xuedao_slash';
  }
  // 21. 胡家刀法
  if (key.includes('hujia') || key.includes('胡家') || key.includes('hujiadao')) {
    return 'ch11_hujia_saber';
  }
  // 22. 苗家剑法
  if (key.includes('miaojia') || key.includes('苗家')) {
    return 'ch12_miaojia_sword';
  }
  // 23. 鸳鸯双刀
  if (key.includes('yuanyang') || key.includes('鸳鸯')) {
    return 'ch14_dual_saber';
  }
  // 24. 越女剑 / 竹棒
  if (key.includes('yuenv') || key.includes('越女') || key.includes('zhuzhi') || key.includes('竹枝')) {
    return 'ch00_yuenv_bamboo';
  }
  // 基础武器归类
  if (key.includes('jian') || key.includes('剑') || key.includes('sword')) {
    return 'sword_swing';
  }
  if (key.includes('dao') || key.includes('刀') || key.includes('saber') || key.includes('blade')) {
    return 'saber_slash';
  }
  if (key.includes('anqi') || key.includes('暗器') || key.includes('dart') || key.includes('biao')) {
    return 'dart_throw';
  }
  if (key.includes('zhang') || key.includes('掌') || key.includes('palm') || key.includes('fist')) {
    return 'fist_punch';
  }

  return 'sword_swing';
}

/**
 * 依据道具类型映射音效
 */
export function resolveItemSfx(itemId: string): string {
  const id = itemId.toLowerCase();
  if (id.startsWith('it_miji_') || id.includes('manual') || id.includes('book')) {
    return 'book_flip';
  }
  if (id.includes('yao') || id.includes('dan') || id.includes('jiu') || id.includes('potion') || id.includes('cha')) {
    return 'drink_potion';
  }
  if (id.includes('liangbing') || id.includes('rou') || id.includes('food') || id.includes('mi')) {
    return 'eating_food';
  }
  if (id.includes('anqi') || id.includes('shi') || id.includes('zhen') || id.includes('biao')) {
    return 'dart_throw';
  }
  return 'drink_potion';
}

