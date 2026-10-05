"""Executable MF-T17 fixture for same-skill ultimate rotation."""

from dataclasses import dataclass, replace


@dataclass(frozen=True)
class UltimateRoute:
    move_id: str
    unlock: int
    route_id: str
    nodes: tuple[str, ...]
    segment_ct: int


@dataclass(frozen=True)
class UltimateRotation:
    ultimate_cooldown: int = 0
    last_ultimate_move_id: str | None = None
    fresh_turn_token: int | None = None

    def can_use(self, move_id: str) -> bool:
        return not self.ultimate_cooldown and move_id != self.last_ultimate_move_id

    def pay_f2(self, move_id: str, turn_token: int) -> "UltimateRotation":
        if not self.can_use(move_id):
            raise ValueError("same-skill ultimate is unavailable")
        return UltimateRotation(1, move_id, turn_token)

    def end_normal_action_e2(self, turn_token: int) -> "UltimateRotation":
        if self.ultimate_cooldown and self.fresh_turn_token != turn_token:
            return replace(self, ultimate_cooldown=0, fresh_turn_token=None)
        return self

    def settle_same_skill_normal(self) -> "UltimateRotation":
        return replace(self, last_ultimate_move_id=None)


ULTIMATES = (
    UltimateRoute(
        "mv_xianglong18_zhenjing", 10, "mfr_xianglong18_zhenjing",
        ("ap_renmai_qihai", "ap_renmai_guanyuan", "ap_renmai_zhongwan",
         "ap_renmai_danzhong", "ap_dumai_mingmen", "ap_dumai_zhiyang",
         "ap_dumai_shendao", "ap_shoujueyin_neiguan",
         "ap_shoujueyin_laogong"), 85,
    ),
    UltimateRoute(
        "mv_xianglong18_lianhuan", 7, "mfr_eighteen_palms_chain",
        ("ap_chongmai_qichong", "ap_chongmai_henggu",
         "ap_chongmai_dahe", "ap_chongmai_qixue",
         "ap_shoutaiyin_zhongfu", "ap_shoutaiyin_yunmen",
         "ap_shoutaiyin_chize", "ap_shoutaiyin_taiyuan",
         "ap_shoujueyin_neiguan", "ap_shoujueyin_laogong"), 80,
    ),
    UltimateRoute(
        "mv_xianglong18_shenlong", 9, "mfr_xianglong18_shenlong",
        ("ap_zushaoyin_yongquan", "ap_zushaoyin_taixi",
         "ap_zushaoyin_fuliu", "ap_daimai_zulinqi", "ap_daimai_weidao",
         "ap_yangqiao_jianyu", "ap_shoujueyin_neiguan",
         "ap_shoujueyin_laogong"), 95,
    ),
)


def available_ultimates(layer: int) -> tuple[str, ...]:
    """Return same-skill ultimates unlocked at the current skill layer."""
    return tuple(
        item.move_id for item in sorted(ULTIMATES, key=lambda item: item.unlock)
        if item.unlock <= layer
    )


def run_checks() -> None:
    routes = {item.move_id: item for item in ULTIMATES}
    assert len(routes) == len({item.route_id for item in ULTIMATES}) == 3
    assert len({item.nodes for item in ULTIMATES}) == 3
    assert {item.move_id: item.unlock for item in ULTIMATES} == {
        "mv_xianglong18_lianhuan": 7, "mv_xianglong18_shenlong": 9,
        "mv_xianglong18_zhenjing": 10,
    }
    assert available_ultimates(6) == ()
    assert available_ultimates(7) == available_ultimates(8) == (
        "mv_xianglong18_lianhuan",
    )
    assert available_ultimates(9) == (
        "mv_xianglong18_lianhuan", "mv_xianglong18_shenlong",
    )
    assert available_ultimates(10) == (
        "mv_xianglong18_lianhuan", "mv_xianglong18_shenlong",
        "mv_xianglong18_zhenjing",
    )
    unlocks = tuple(item.unlock for item in sorted(ULTIMATES, key=lambda item: item.unlock))
    assert unlocks[0] <= 7 and unlocks[1:] == (9, 10)
    assert {item.move_id: 1_200 + len(item.nodes) * item.segment_ct
            for item in ULTIMATES} == {
        "mv_xianglong18_zhenjing": 1_965,
        "mv_xianglong18_lianhuan": 2_000,
        "mv_xianglong18_shenlong": 1_960,
    }
    state = UltimateRotation().pay_f2("mv_xianglong18_lianhuan", 7)
    assert state == UltimateRotation(1, "mv_xianglong18_lianhuan", 7)
    assert state.end_normal_action_e2(7).ultimate_cooldown == 1
    assert not state.can_use("mv_xianglong18_shenlong")
    state = state.end_normal_action_e2(8)
    assert state.ultimate_cooldown == 0
    assert not state.can_use("mv_xianglong18_lianhuan")
    assert state.can_use("mv_xianglong18_shenlong")
    state = state.settle_same_skill_normal()
    assert state.can_use("mv_xianglong18_lianhuan")
