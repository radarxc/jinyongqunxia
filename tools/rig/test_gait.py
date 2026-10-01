"""Golden-vector tests copied from tech/09-character-rig.md section 4.5."""
from __future__ import annotations

import unittest

from tools.rig.gait import cycle_period, motion_mode, pose

FIELDS = ("hip_L", "hip_R", "knee_L", "knee_R", "ankle_L", "ankle_R",
          "shoulder_L", "shoulder_R", "elbow_L", "elbow_R", "bodyY")
VECTORS = {
    ("walk", "light"): [(1.6,1.6,4,18.7,4.4,-4.4,1.1,1.1,27.8,19,-.027),(24.4,-27.5,35.1,4,7.9,-7.9,-20.5,18.3,26.6,20.2,.031),(1.6,1.6,18.7,4,-4.4,4.4,1.1,1.1,19,27.8,-.027),(-27.5,24.4,4,35.1,-7.9,7.9,18.3,-20.5,20.2,26.6,.023)],
    ("walk", "medium"): [(1.4,1.4,4,17.6,4,-4,1,1,27,19,-.025),(22.6,-25.4,32.8,4,7.4,-7.4,-19,17,25.9,20.1,.029),(1.4,1.4,17.6,4,-4,4,1,1,19,27,-.025),(-25.4,22.6,4,32.8,-7.4,7.4,17,-19,20.1,25.9,.021)],
    ("walk", "heavy"): [(1.1,1.1,4,14.6,3.2,-3.2,.8,.8,25.1,18.7,-.020),(17.6,-19.8,26.5,4,5.7,-5.7,-14.8,13.2,24.2,19.6,.022),(1.1,1.1,14.6,4,-3.2,3.2,.8,.8,18.7,25.1,-.020),(-19.8,17.6,4,26.5,-5.7,5.7,13.2,-14.8,19.6,24.2,.017)],
    ("run", "light"): [(2.7,2.7,10,37.7,7.3,-7.3,1.8,1.8,69.7,59.2,-.059),(42.6,-48.1,68.6,10,13.2,-13.2,-34.2,30.6,68.3,60.7,.068),(2.7,2.7,37.7,10,-7.3,7.3,1.8,1.8,59.2,69.7,-.059),(-48.1,42.6,10,68.6,-13.2,13.2,30.6,-34.2,60.7,68.3,.050)],
    ("run", "medium"): [(2.5,2.5,10,35.7,6.7,-6.7,1.7,1.7,68.9,59.1,-.055),(39.5,-44.5,64.3,10,12.3,-12.3,-31.7,28.3,67.5,60.5,.063),(2.5,2.5,35.7,10,-6.7,6.7,1.7,1.7,59.1,68.9,-.055),(-44.5,39.5,10,64.3,-12.3,12.3,28.3,-31.7,60.5,67.5,.047)],
    ("run", "heavy"): [(2,2,10,30,5.3,-5.3,1.3,1.3,66.5,58.9,-.043),(30.8,-34.7,52.3,10,9.6,-9.6,-24.7,22.1,65.4,59.9,.049),(2,2,30,10,-5.3,5.3,1.3,1.3,58.9,66.5,-.043),(-34.7,30.8,10,52.3,-9.6,9.6,22.1,-24.7,59.9,65.4,.036)],
}


class GaitTests(unittest.TestCase):
    def test_all_specification_vectors(self) -> None:
        speeds = {"walk": 1.4, "run": 4.0}
        for (mode, weight), rows in VECTORS.items():
            for phase, expected in zip((0, .25, .5, .75), rows):
                with self.subTest(mode=mode, weight=weight, phase=phase):
                    actual = pose(phase, speeds[mode], weight)
                    for field, value in zip(FIELDS[:-1], expected[:-1]):
                        self.assertAlmostEqual(value, actual[field], delta=.15, msg=field)
                    self.assertAlmostEqual(expected[-1], actual["bodyY"], delta=.0005)

    def test_modes_periods_and_idle(self) -> None:
        self.assertEqual("idle", motion_mode(.05))
        self.assertEqual("walk", motion_mode(.051))
        self.assertEqual("run", motion_mode(2.0))
        self.assertAlmostEqual(1.0, cycle_period(1.4, "medium", "walk"))
        self.assertAlmostEqual(.9976, cycle_period(1.4, "heavy", "walk"), places=4)
        idle = pose(.25, 0, "light")
        self.assertEqual("idle", idle["mode"])
        self.assertAlmostEqual(.004, idle["bodyY"])
        with self.assertRaises(ValueError):
            pose(0, 1, "unknown")
        with self.assertRaisesRegex(ValueError, "finite"):
            pose(0, 1, params={"Ahip": float("nan")})
        with self.assertRaisesRegex(ValueError, "non-negative"):
            pose(0, 1, params={"Ahip": -1})
        with self.assertRaisesRegex(ValueError, "unknown weightClass"):
            cycle_period(0, "unknown", "idle")


if __name__ == "__main__":
    unittest.main()
