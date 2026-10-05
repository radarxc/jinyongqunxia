"""Regression coverage for catalog ownership, compact moves and check mode."""
from contextlib import redirect_stderr, redirect_stdout
import io
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import bind_moves as bindings


class BindingTests(unittest.TestCase):
    def parse(self, text):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'skills-fixture.md'
            path.write_text(text, encoding='utf-8')
            return bindings.catalog_moves(path)

    def test_compact_suffixes_do_not_capture_passives_or_prerequisites(self):
        rows = self.parse('''#### `sk_fixture` 试剑（5 玄中 · 兵器／剑 · 阴）
- reqs: `sk_foreign`；招式：刺 `_ci`（单体1.0）；扫 `_sao`（锥形）；被动 `_guard`。
''')
        self.assertEqual([r['move'] for r in rows], ['mv_fixture_ci', 'mv_fixture_sao'])
        self.assertTrue(all(r['skill'] == 'sk_fixture' for r in rows))
        self.assertTrue(all(r['grade'] == 5 and r['nature'] == 'yin' for r in rows))

    def test_card_tables_continuations_and_explicit_projection(self):
        rows = self.parse('''### `sk_fixture` 试掌（6 玄上 · 拳脚／掌 · 阳）
#### `sk_fixture` 招式正文
| 招式 | ID | 层 | 效果 |
|---|---|---|---|
| 掌风 | `mv_fixture_wave` | 3 | `MoveDef{projection:true; ultimate:false}` |
| 收掌 | `mv_fixture_close` | 1 | `projection:false` |

## 其他说明
| 武学 | 普通招式 | 被动 |
|---|---|---|
| `sk_fixture` | 另招 `mv_fixture_extra` | `ps_fixture_guard` |
| `sk_fixture` | 旧词根 `mv_legacy_extra` | `ps_fixture_guard` |
''')
        by_id = {r['move']: r for r in rows}
        self.assertEqual(set(by_id), {'mv_fixture_wave', 'mv_fixture_close', 'mv_fixture_extra', 'mv_legacy_extra'})
        self.assertEqual(by_id['mv_legacy_extra']['skill'], 'sk_fixture')
        self.assertTrue(by_id['mv_fixture_wave']['projection'])
        self.assertFalse(by_id['mv_fixture_close']['projection'])
        self.assertEqual(bindings.make_binding(by_id['mv_fixture_wave'])[0]['template'], 'qi_projection')
        self.assertEqual(bindings.make_binding(by_id['mv_fixture_close'])[0]['template'], 'afterimage')

    def test_tier_boundaries_and_emitter_fallback(self):
        self.assertEqual([bindings.tier_for(g) for g in (None, 1, 3, 4, 6, 7, 9, 10, 12)],
                         ['ungraded', 'huang', 'huang', 'xuan', 'xuan', 'di', 'di', 'tian', 'tian'])
        record = dict(move='mv_fixture_a', skill='sk_fixture', grade=12, ultimate=False,
                      projection=False, delivery='inner', nature='harmony', action_context='内功')
        row, fallback = bindings.make_binding(record)
        self.assertEqual(row['mode'], 'bespoke')
        self.assertIsNone(row['emitter'])
        self.assertFalse(fallback)
        record.update(grade=None, delivery='unknown', action_context='未定义器械')
        row, fallback = bindings.make_binding(record)
        self.assertEqual(row['template'], 'plain_strike')
        self.assertEqual(row['emitter'], 'sword')
        self.assertTrue(fallback)

    def test_compact_table_move_column_excludes_passive_suffix(self):
        rows = self.parse('''| ID · 名称 · 品阶 | 性质 | 招式 | 被动 |
|---|---|---|---|
| `sk_fixture` 试掌 · 黄中 2 | 阳 | 推掌 `_push`（1） | `_guard` 守势 |
''')
        self.assertEqual([r['move'] for r in rows], ['mv_fixture_push'])
        self.assertEqual(rows[0]['grade'], 2)

    def test_target_weapon_condition_does_not_change_attacker_delivery(self):
        for condition in ('目标持械', '目标持剑', '目标持兵器', '对持械目标'):
            with self.subTest(condition=condition):
                rows = self.parse(f'''### `sk_fixture` 胡家拳（7 地下 · 拳脚/拳掌 · 阳）
| 招式 | ID | 层 | 效果 |
|---|---|---|---|
| 翻腕夺势 | `mv_fixture_fanwan` | 5 | 单体近身；{condition} |
''')
                self.assertEqual(rows[0]['delivery'], 'fist-grapple')
                self.assertEqual(bindings.emitter_for(rows[0]), ('fist', False))
                self.assertEqual(bindings._delivery('拳脚/拳掌', condition, 'weapon'), 'weapon')

    def test_weapon_identity_precedes_shape_and_opponent_weapon(self):
        cases = [
            ('试剑（5 玄中 · 兵器/剑）', '', '破刀式；扇形扫；目标持刀', 'sword'),
            ('试刀（5 玄中 · 兵器/刀）', '', '破剑式；扇形扫；对手持剑', 'sabre'),
            ('试法（5 玄中 · 兵器/奇门）', 'weaponReq {category:sword}', '破刀式', 'sword'),
            ('试法（5 玄中 · 兵器/刀剑）', 'weaponReq:{category:blade}', '剑招', 'sabre'),
            ('长须杖法（5 玄中 · 兵器/棍杖）', '', '以长须作鞭；扇形扫', 'staff'),
            ('折扇法（5 玄中 · 兵器/奇门（折扇））', '', '扇形扫；破剑式', 'fan'),
            ('试法（5 玄中 · 兵器/奇门）', '', '扇形扫；目标持刀', 'sword'),
        ]
        for title, metadata, action, expected in cases:
            with self.subTest(title=title):
                rows = self.parse(f'''### `sk_fixture` {title}
- {metadata}
| 招式 | ID | 效果 |
|---|---|---|
| 起手 | `mv_fixture_start` | {action} |
''')
                self.assertEqual(len(rows), 1)
                self.assertEqual(bindings.emitter_for(rows[0])[0], expected)

    def test_reviewed_sword_catalogs_include_ordinary_and_ultimate_moves(self):
        expected = {'sk_jueqingjian', 'sk_zhongnanjian', 'sk_dugu9', 'sk_miaojiajian'}
        seen, ultimate = set(), set()
        for name in ('daojia', 'wuyue', 'qianlong'):
            path = bindings.ROOT / f'docs/design/catalog/skills-{name}.md'
            for row in bindings.catalog_moves(path):
                if row['skill'] in expected:
                    with self.subTest(move=row['move']):
                        self.assertEqual(bindings.emitter_for(row), ('sword', False))
                    seen.add(row['skill'])
                    ultimate.add(row['ultimate'])
        self.assertEqual(seen, expected)
        self.assertEqual(ultimate, {False, True})

    def test_reviewed_non_weapon_words_use_audited_sword_fallback(self):
        expected = {
            'daojia': {'mv_yufengshu_fengyu'},
            'gulong': {'mv_tingfengbianwei_xunsheng', 'mv_erengushengcun_cangzhen'},
            'xiaoyao': {'mv_fushidu_shidu', 'mv_fushidu_zhishi'},
            'yitian': {'mv_fenshuiemeici_tielang'},
            'qianlong': {'mv_yaowangdujing_fanzhao'},
            'general': {'mv_huanyirongshu_gaimao'},
            'kangxi': {'mv_gaochangjiguan_bansuo', 'mv_gaochangjiguan_qiansuo',
                        'mv_gaochangjiguan_zhuanshu'},
        }
        bound, fallbacks = [], []
        for name, moves in expected.items():
            rows = bindings.catalog_moves(bindings.ROOT / f'docs/design/catalog/skills-{name}.md')
            selected = {row['move']: row for row in rows if row['move'] in moves}
            self.assertEqual(set(selected), moves)
            for move, row in selected.items():
                with self.subTest(move=move):
                    binding, fallback = bindings.make_binding(row)
                    self.assertEqual(binding['emitter'], 'sword')
                    self.assertTrue(fallback)
                    bound.append(binding)
                    fallbacks.append(row)
        audit = bindings.binding_audit(bound, fallbacks).split('skills_without_moves:')[0]
        for row in fallbacks:
            self.assertIn(row['move'], audit)

    def test_whip_words_require_weapon_meaning_and_exclude_target_equipment(self):
        own = ('兵器/索', '兵器/带', '持长索', '绸带功', '挥索')
        other = ('探索', '目标带 `mark`', '带尸毒', '是否附带',
                 '封门绊索；空格投放', '对手持长索', '目标用绸带',
                 '对手持带', '目标握索')
        for context in own + other:
            with self.subTest(context=context):
                record = dict(delivery='unknown', skill_context='', action_context=context)
                expected = ('whip', False) if context in own else ('sword', True)
                self.assertEqual(bindings.emitter_for(record), expected)

    def test_real_whips_and_held_long_rope_keep_their_emitters(self):
        expected = {'sk_baichousuofa': 3, 'sk_jinlingsuo': 5,
                    'sk_fumosuofa': 3, 'sk_jingangfumoquan': 4}
        seen = dict.fromkeys(expected, 0)
        for name in ('daojia', 'shaolin'):
            rows = bindings.catalog_moves(bindings.ROOT / f'docs/design/catalog/skills-{name}.md')
            for row in rows:
                if row['skill'] in expected and row['delivery'] != 'sonic':
                    with self.subTest(move=row['move']):
                        self.assertEqual(bindings.emitter_for(row), ('whip', False))
                    seen[row['skill']] += 1
        self.assertEqual(seen, expected)

    def test_check_never_writes_and_detects_stale_bytes(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / 'bindings.yaml'
            content = bindings.serialize([])
            output.write_text(content, encoding='utf-8')
            before = output.stat().st_mtime_ns
            with patch.object(bindings, 'collect_bindings', return_value=([], [])):
                with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
                    self.assertEqual(bindings.main(['--check', '--output', str(output)]), 0)
                    self.assertEqual(output.stat().st_mtime_ns, before)
                    output.write_text('stale\n', encoding='utf-8')
                    self.assertEqual(bindings.main(['--check', '--output', str(output)]), 1)
                    self.assertEqual(output.read_text(), 'stale\n')
                    absent = output.with_name('absent.yaml')
                    self.assertEqual(bindings.main(['--check', '--output', str(absent)]), 1)
                    self.assertFalse(absent.exists())
                    output.write_text(content, encoding='utf-8')
                    audit = output.with_name('audit.yaml')
                    with patch.object(bindings, 'binding_audit', return_value='version: 1\n'):
                        self.assertEqual(bindings.main(['--check', '--output', str(output), '--audit', str(audit)]), 1)
                        self.assertFalse(audit.exists())


if __name__ == '__main__':
    unittest.main()
