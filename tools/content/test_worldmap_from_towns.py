import importlib.util
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('worldmap_from_towns', HERE / 'worldmap_from_towns.py')
gen = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gen)


def nodes():
    return {'city_dali': {'id': 'city_dali', 'entry': {'sceneId': 'city_dali', 'townSpec': None, 'templateYear': None,
                                                       'gateId': None, 'spawn': None, 'accessNote': '城门进入'}},
            'city_turpan': {'id': 'city_turpan', 'entry': {'sceneId': 'city_turpan', 'townSpec': None,
                                                           'templateYear': None, 'gateId': None, 'spawn': None,
                                                           'accessNote': '城门进入'}}}


class EntryOverridesTest(unittest.TestCase):
    def test_merges_only_this_chapter_and_keeps_derived_fields(self):
        by_id = nodes()
        gen.apply_entry_overrides(by_id, {'ch01': {'city_dali': {'scene': 'sc_01_town_dali', 'gateId': 'gate_s'}},
                                          'ch10': {'city_turpan': {'scene': 'sc_10_town_turpan'}}}, 'ch01')
        self.assertEqual(by_id['city_dali']['entry']['scene'], 'sc_01_town_dali')
        self.assertEqual(by_id['city_dali']['entry']['gateId'], 'gate_s')
        self.assertEqual(by_id['city_dali']['entry']['sceneId'], 'city_dali')
        self.assertNotIn('scene', by_id['city_turpan']['entry'])

    def test_absent_or_empty_overrides_change_nothing(self):
        for overrides in (None, {}, {'ch02': {}}):
            by_id = nodes()
            gen.apply_entry_overrides(by_id, overrides, 'ch01')
            self.assertEqual(by_id, nodes())

    def test_rejects_unknown_chapters_nodes_and_fields(self):
        for overrides in ({'chapter1': {}}, {'ch01': {'city_missing': {'scene': 'x'}}},
                          {'ch01': {'city_dali': {'sceneId': 'other'}}}, {'ch01': {'city_dali': {}}}):
            with self.assertRaises(ValueError):
                gen.apply_entry_overrides(nodes(), overrides, 'ch01')


if __name__ == '__main__':
    unittest.main()
