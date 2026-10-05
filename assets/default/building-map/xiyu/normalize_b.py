"""Normalize the nine western-kit support buildings; only crop/scale/pad final PNGs."""
import json
import shutil
from pathlib import Path
import yaml
from PIL import Image
from normalize import ROOT, normalize, sha

JOBS = [
    ('stable', [9, 7], 1, [[92, 547], [849, 930], [1449, 622]], '商队马厩', 'design/22 §3.3 stable 9×7'),
    ('biaoju', [14, 11], 2, [[90, 617], [795, 950], [1450, 552]], '商队货栈（护运行同功能外观）', 'design/22 §3.4 yuan_biaoju 14×11'),
    ('casino', [10, 8], 1, [[46, 596], [850, 987], [1494, 625]], '世俗棋戏馆／游戏院（赌场同功能外观）', 'design/22 §3.3 casino 10×8'),
    ('manor', [16, 13], 2, [[95, 654], [801, 993], [1448, 666]], '葡萄架大院', 'design/22 §3.3 manor 16×13'),
    ('palace', [24, 20], 2, [[35, 630], [913, 1001], [1491, 669]], '王府接待殿模块', 'design/22 §3.4 qing_early_palace 24×20'),
    ('temple_hall', [14, 11], 2, [[158, 660], [776, 957], [1405, 643]], '平顶木柱廊礼拜殿与小穹顶', 'design/22 §3.4 ming_temple_hall 14×11'),
    ('pagoda', [7, 7], 2, [[428, 819], [767, 991], [1108, 819]], '砖砌邦克楼／宣礼塔', 'design/22 §3.3 pagoda 7×7'),
    ('guardhouse', [7, 5], 2, [[86, 587], [862, 991], [1458, 681]], '土坯城门守舍', 'design/22 §3.3 guardhouse 7×5'),
    ('warehouse', [10, 8], 2, [[60, 635], [812, 1013], [1490, 694]], '平顶仓屋', 'design/22 §3.3 warehouse 10×8'),
]

def write_small(path, content):
    assert len(content.splitlines()) <= 150
    path.write_text(content, encoding='utf-8')

def main():
    result = []
    for name, footprint, chosen, corners, label, basis in JOBS:
        asset = 'bld_kit_xiyu_' + name
        first = json.loads((ROOT/'sources'/f'{asset}.json').read_text())
        second_path = ROOT/'sources'/f'{asset}_v2.json'
        second = json.loads(second_path.read_text()) if second_path.exists() else None
        record = first if chosen == 1 else second
        candidates = 2 if second else 1
        if second:
            shutil.copy2(first['source_path'], ROOT/'sources'/f'{asset}_candidate1.png')
            shutil.copy2(second['source_path'], ROOT/'sources'/f'{asset}_candidate2.png')
        notes = ('逐张view_image检查原图与灰底QA：主体完整，真实RGBA，入口左下、左上光、右下接触影，无文字／人物／现代物。'
                 '西域通用地域语汇的原创扩展；非具名古迹复原，不证明各年代细部皆相同（待考）。'
                 '占地按同功能骨架；仅等比缩放，剩余投影／比例误差见geometry_qa，不能视为严密拼接准出。')
        row = normalize(asset, record['source_path'], footprint, corners,
                        '西域回部城镇·'+label+'（原创扩展；各年代细部待考）',
                        record['prompt'], basis, notes, candidates=candidates)
        p = ROOT/'meta'/f'{asset}.yaml'
        e = yaml.safe_load(p.read_text())
        e['source_record'] = 'sources/'+asset+('_v2' if chosen == 2 else '')+'.json'
        e['selected_candidate'] = chosen
        e['style_review_references'] = [{
            'file': 'assets/default/baseline/building-map/bld_kit_song_dali_biaoju.png',
            'sha256': sha(ROOT.parents[1]/'baseline/building-map/bld_kit_song_dali_biaoju.png'),
            'role': '已view_image阅图的写实材质／细节密度参照；首候选未作图像输入'}]
        e['references'] = []
        if chosen == 2:
            f = ROOT/'sources'/f'{asset}_candidate1.png'
            e['references'].append({'file': str(f.relative_to(ROOT)), 'sha256': sha(f), 'role': '第二候选编辑目标'})
            if name != 'biaoju':
                f = ROOT/'sources/bld_kit_xiyu_stable.png'
                e['references'].append({'file': str(f.relative_to(ROOT)), 'sha256': sha(f), 'role': '第二候选相机参照，不复制马厩主体'})
        e['selection_note'] = ('共两候选；按主体完整、相机轴斜率和占地比例综合择一；原图及提示词归档。'
                               if candidates == 2 else '首候选双轴及占地比例通过建议公差，未追加第二候选。')
        e['visual_qa'] = {'checked_with': 'view_image original plus neutral-gray composite',
                          'qa_only_composite': f'meta/{name}'+('-v2' if chosen == 2 else '')+'-qa.jpg',
                          'no_pixel_repainting': True}
        e['geometry_qa']['footprint_is_logical'] = True
        e['geometry_qa']['release_note'] = '原始角点目测误差约±4px；严格2:1与实际长宽比未同时通过者仅候选使用。'
        write_small(p, yaml.safe_dump(e, allow_unicode=True, sort_keys=False, width=150, default_flow_style=None))
        result.append(row)
        print(json.dumps(row, ensure_ascii=False))
    write_small(ROOT/'qa-buildings-b.json', json.dumps(result, ensure_ascii=False, indent=2)+'\n')

if __name__ == '__main__':
    main()
