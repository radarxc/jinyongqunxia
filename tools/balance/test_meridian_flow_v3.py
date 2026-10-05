"""Protocol-3 golden integrity tests for the independent Python oracle."""

import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from balance.meridian_flow_sim import (
    GOLDEN_V3_PATH, LEGACY_RNG_PROTOCOL, LEGACY_RULES_PROTOCOL,
    MeridianFlowV3, Sfc32, STANDARD_PROFILE, V3_REFERENCE, V3_UNIT_ROWS,
    golden_payload, make_v3_spec, v3_golden_payload,
)


class MeridianFlowV3GoldenTest(unittest.TestCase):
    def test_legacy_identity_and_hash_are_unchanged(self) -> None:
        legacy = golden_payload()
        self.assertEqual((legacy["fixtureVersion"], legacy["rulesProtocol"],
                          legacy["rngProtocol"]),
                         (2, LEGACY_RULES_PROTOCOL, LEGACY_RNG_PROTOCOL))
        self.assertEqual(legacy["vectorSha256"],
                         "af33dcd10dc196e18811fe485870666ab139c03a17342fa47113ecc19552cd76")

    def test_v3_file_equals_fresh_independent_model(self) -> None:
        expected = v3_golden_payload()
        actual = json.loads(Path(GOLDEN_V3_PATH).read_text(encoding="utf-8"))
        self.assertEqual(actual, expected)
        self.assertEqual(expected["vectorSha256"],
                         "be7dcad8f03edc48b8f08b86c40f1a204b94e8ec261bbdea625591f5711a7143")

    def test_preview_equivalent_resolution_does_not_cross_unit_state(self) -> None:
        runtimes = [MeridianFlowV3(make_v3_spec(row)) for row in V3_UNIT_ROWS]
        for runtime in runtimes:
            runtime.tick(12)
        untouched = runtimes[1].snapshot_vector()
        runtimes[0].resolve("mfr_golden_v3_attack", V3_REFERENCE,
                            STANDARD_PROFILE, Sfc32(20_260_927, "battle"))
        self.assertEqual(runtimes[1].snapshot_vector(), untouched)


if __name__ == "__main__":
    unittest.main()
