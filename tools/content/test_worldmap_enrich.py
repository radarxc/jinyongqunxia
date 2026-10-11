import copy
import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('worldmap_enrich', HERE / 'worldmap_enrich.py')
enrich_mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(enrich_mod)


def city(importance, era='ch05', status='路府州县'):
    return {'importance': importance, 'eras': {era: {'status': status}}}


def node(node_id, kind='town', point=(10, 10)):
    return {'id': node_id, 'kind': kind, 'point': list(point)}


def doc(nodes, roads, era='ch05'):
    return {'actions': [{'map': {'era': era, 'nodes': nodes, 'roads': roads}}]}


class ClassifyTest(unittest.TestCase):
    def test_capital_follows_the_chapter_status_not_static_importance(self):
        self.assertEqual(enrich_mod.classify(node('city_a'), city('major', status='都城'), 'ch05'),
                         ('capital', 'city_large'))
        self.assertEqual(enrich_mod.classify(node('city_a'), city('capital', status='路府州县'), 'ch05'),
                         ('major', 'city_prefecture'))

    def test_tiers_and_frontier_passes(self):
        self.assertEqual(enrich_mod.classify(node('city_b'), city('secondary'), 'ch05'), ('minor', 'city_county'))
        self.assertEqual(enrich_mod.classify(node('city_b'), city('major', status='边关'), 'ch05'), ('major', 'pass'))
        self.assertEqual(enrich_mod.classify(node('city_b'), city('secondary', status='边关'), 'ch05'), ('minor', 'pass'))
        self.assertEqual(enrich_mod.classify(node('city_b'), city('major', status='未建或废弃'), 'ch05'), ('site', 'ruin'))
        self.assertEqual(enrich_mod.classify(node('city_x'), city('site'), 'ch05'), ('site', 'village'))
        self.assertEqual(enrich_mod.classify(node('city_khotan_kunlun'), city('site'), 'ch05'), ('site', 'pass'))

    def test_relic_sites_use_their_table_and_fall_back_to_ruin(self):
        self.assertEqual(enrich_mod.classify(node('rs_wudang', 'ruin'), None, 'ch05'), ('site', 'daoist'))
        self.assertEqual(enrich_mod.classify(node('rs_unknown', 'ruin'), None, 'ch05'), ('site', 'ruin'))


class EnrichTest(unittest.TestCase):
    def setUp(self):
        self.cities = {'city_a': city('major'), 'city_b': city('secondary')}
        self.roads = [{'key': 'r:0', 'start': 'city_a', 'end': 'city_b'}]
        self.nodes = [node('city_a', point=(10, 10)), node('city_b', point=(20, 14))]

    def test_writes_path_from_matching_variant_then_default(self):
        paths = {'paths': {'r:0': [[10, 10], [15.123, 11.456], [20, 14]]},
                 'variants': {'r:0': [{'start': 'city_a', 'end': 'city_b', 'chapters': ['ch05'],
                                       'path': [[10, 10], [12.5, 13.25], [20, 14]]}]}}
        out = enrich_mod.enrich(doc(copy.deepcopy(self.nodes), copy.deepcopy(self.roads)), self.cities, paths)
        self.assertEqual(out['actions'][0]['map']['roads'][0]['path'], [[10, 10], [12.5, 13.25], [20, 14]])
        out = enrich_mod.enrich(doc(copy.deepcopy(self.nodes), copy.deepcopy(self.roads), era='ch06'),
                                self.cities, paths)
        self.assertEqual(out['actions'][0]['map']['roads'][0]['path'], [[10, 10], [15.12, 11.46], [20, 14]])

    def test_skips_single_point_paths_of_zero_length_approaches(self):
        nodes = [node('city_a', point=(10, 10)), node('rs_b', 'ruin', point=(10, 10))]
        roads = [{'key': 'approach:rs_b', 'start': 'city_a', 'end': 'rs_b'}]
        paths = {'paths': {'approach:rs_b': [[10, 10]]}, 'variants': {}}
        out = enrich_mod.enrich(doc(nodes, roads), self.cities, paths)
        self.assertNotIn('path', out['actions'][0]['map']['roads'][0])

    def test_rejects_a_path_whose_ends_leave_the_nodes(self):
        paths = {'paths': {'r:0': [[10, 10], [19, 14]]}, 'variants': {}}
        with self.assertRaises(SystemExit):
            enrich_mod.enrich(doc(copy.deepcopy(self.nodes), copy.deepcopy(self.roads)), self.cities, paths)

    def test_without_paths_drops_stale_path_and_still_tiers(self):
        roads = [{**self.roads[0], 'path': [[10, 10], [20, 14]]}]
        out = enrich_mod.enrich(doc(copy.deepcopy(self.nodes), roads), self.cities, None)
        m = out['actions'][0]['map']
        self.assertNotIn('path', m['roads'][0])
        self.assertEqual([(n['tier'], n['marker']) for n in m['nodes']],
                         [('major', 'city_prefecture'), ('minor', 'city_county')])

    def test_is_idempotent_and_keeps_canonical_format(self):
        paths = {'paths': {'r:0': [[10, 10], [15, 12], [20, 14]]}, 'variants': {}}
        once = enrich_mod.dump(enrich_mod.enrich(doc(copy.deepcopy(self.nodes), copy.deepcopy(self.roads)),
                                                 self.cities, paths))
        twice = enrich_mod.dump(enrich_mod.enrich(json.loads(once), self.cities, paths))
        self.assertEqual(once, twice)
        self.assertFalse(once.endswith('\n'))


class RepositoryMapsTest(unittest.TestCase):
    def test_every_compiled_map_is_canonical_and_enriched(self):
        cities = {row['id']: row for row in json.loads(enrich_mod.CITIES.read_text(encoding='utf-8'))['cities']}
        paths = json.loads(enrich_mod.ROAD_PATHS.read_text(encoding='utf-8')) if enrich_mod.ROAD_PATHS.exists() else None
        self.assertEqual(len(enrich_mod.MAPS), 14)
        for path in enrich_mod.MAPS:
            text = path.read_text(encoding='utf-8')
            self.assertEqual(enrich_mod.dump(enrich_mod.enrich(json.loads(text), cities, paths)), text, path.name)


if __name__ == '__main__':
    unittest.main()
