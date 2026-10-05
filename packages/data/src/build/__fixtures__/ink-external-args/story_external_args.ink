EXTERNAL get_flag(id)
EXTERNAL has_item(id)
EXTERNAL quest_stage(id)
EXTERNAL affinity(id)

VAR comparison_id = "initial_value"

=== wake ===
~ comparison_id = "state_original"
Visible introduction.
{ get_flag("fl_fixture_shared"):
fl_fixture_shared
}
{ has_item("it_fixture_tao"):
Has peach.
}
{ not has_item("it_fixture_tao"):
No peach.
}
{ quest_stage("q_fixture_main") == "st_fixture_two":
Quest ready.
}
{ affinity("npc_fixture_friend") >= 1:
Friendly.
}
{ comparison_id == "state_original":
Comparison kept.
}
+ [Continue.]
  -> END
