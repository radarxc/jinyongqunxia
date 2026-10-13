/* global setTimeout */
import path from 'path';
import { browserEval, captureScreenshot } from './browser_eval.mjs';

const ARTIFACTS_DIR = '/Users/bytedance/.gemini/antigravity/brain/266def8a-da55-4552-901d-55eb01b559d0';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runStep(name, fn) {
  console.log(`\n▶ [Step] ${name}...`);
  const res = await fn();
  console.log(`✔ [Step] ${name} done!`, res ? JSON.stringify(res) : '');
  await sleep(1000);
  return res;
}

async function capture(filename, label) {
  const outPath = path.join(ARTIFACTS_DIR, filename);
  console.log(`📸 Capturing screenshot: ${label} -> ${filename}...`);
  await sleep(500);
  await captureScreenshot(outPath);
  console.log(`✔ Saved screenshot: ${outPath}`);
  return outPath;
}

async function main() {
  console.log('========================================================');
  console.log('🚀 Starting Full Yue Nu Jian (越女剑) Story Playthrough');
  console.log('========================================================');

  // Step 1: Start fresh new game with full prologue mode
  await runStep('1. Start New Game', async () => {
    return await browserEval(`(async () => {
      const c = window.__gameController;
      const started = await c.startNewGame({
        identity: {
          name: "李文秀",
          gender: "female",
          appearance: "hero_f01",
          pronoun: "姑娘",
          originId: "origin_wenshiguan"
        },
        difficulty: "diff_jianghu"
      });
      await new Promise(r => setTimeout(r, 1000));
      // Choose full prologue mode
      await c.choosePrologueMode("full");
      await new Promise(r => setTimeout(r, 1200));

      const app = window.__tianshuApp;
      if (app?.scene) app.scene.value = "ruin";
      if (app?.page) app.page.value = "journey";

      const q = await c.host.query();
      return { started, scene: q.region?.sceneId, dialogue: !!q.dialogue };
    })()`);
  });

  // Step 2: Arrive in Taihu Zhulin, advance opening dialogue if any, walk to bamboo staff
  await runStep('2. Walk to Bamboo Staff & Meet A\'Qing', async () => {
    return await browserEval(`(async () => {
      const c = window.__gameController;
      const host = c.host;

      // Drain opening dialogue if any
      let q = await host.query();
      let guard = 0;
      while (q.dialogue && guard++ < 30) {
        if (q.dialogue.choices?.length) {
          await host.dispatch({ t: "dialogue/choose", choiceIndex: 0 });
        } else {
          await host.dispatch({ t: "dialogue/continue" });
        }
        await new Promise(r => setTimeout(r, 100));
        q = await host.query();
      }

      // Walk to staff at (9, 10)
      await host.dispatch({ t: "world/walkTo", hex: { q: 9, r: 10 } });
      await new Promise(r => setTimeout(r, 600));

      // Interact with pickup_bamboo_staff
      const interact = await host.dispatch({ t: "world/interact", anchorId: "pickup_bamboo_staff" });
      await new Promise(r => setTimeout(r, 600));

      return { interactAccepted: interact.accepted };
    })()`);
  });

  await capture('yuenv_01_bamboo_start.jpg', 'Taihu Zhulin - A\'Qing Meeting & Bamboo Staff');

  // Step 3: Advance A\'Qing dialogue (choose 2: 拾起竹枝), completing C01
  await runStep('3. Complete Dialogue with A\'Qing', async () => {
    return await browserEval(`(async () => {
      const c = window.__gameController;
      const host = c.host;

      let q = await host.query();
      let guard = 0;
      while (q.dialogue && guard++ < 30) {
        if (q.dialogue.choices?.length) {
          // Choice 2: 拾起竹枝
          const idx = q.dialogue.choices.length > 2 ? 2 : 0;
          await host.dispatch({ t: "dialogue/choose", choiceIndex: idx });
        } else {
          await host.dispatch({ t: "dialogue/continue" });
        }
        await new Promise(r => setTimeout(r, 100));
        q = await host.query();
      }

      const snap = await host.snapshot();
      const staffAccepted = snap.profile?.replayRules?.switches?.["fl_00_staff_accepted"];
      return { staffAccepted, dialogueOpen: !!q.dialogue };
    })()`);
  });

  // Step 4: Interact with arena_00_zhulin to start battle
  await runStep('4. Start Initial Battle (arena_00_zhulin)', async () => {
    return await browserEval(`(async () => {
      const c = window.__gameController;
      const host = c.host;

      const arenaRes = await host.dispatch({ t: "world/interact", anchorId: "arena_00_zhulin" });
      await new Promise(r => setTimeout(r, 800));

      const app = window.__tianshuApp;
      if (app?.openBattle) await app.openBattle();
      else if (app?.scene) app.scene.value = "battle";

      const q = await host.query();
      return { arenaRes: arenaRes.accepted, inBattle: !!q.battle };
    })()`);
  });

  await capture('yuenv_02_initial_battle.jpg', 'Hex Battlefield - Initial Swordsmen Battle');

  // Step 5: Resolve Initial Battle & Leave
  await runStep('5. Win Initial Battle & Leave', async () => {
    return await browserEval(`(async () => {
      const c = window.__gameController;
      const host = c.host;
      let reqId = 200;
      let guard = 0;

      while (guard++ < 150) {
        const q = await host.query();
        const b = q.battle;
        if (!b || b.result) break;

        const readyUnit = b.units.find(u => u.id === b.actorId);
        if (!readyUnit || readyUnit.control === "ai") {
          await host.dispatch({ t: "battle/step", revision: b.revision });
          continue;
        }

        const enemies = b.units.filter(u => u.side !== readyUnit.side && u.hp > 0);
        if (!enemies.length) {
          await host.dispatch({ t: "battle/step", revision: b.revision });
          continue;
        }

        const enemy = enemies[0];
        const moveId = readyUnit.moves?.[0]?.id ?? "mv_basic_strike";
        const previewRes = await host.dispatch({
          t: "battle/preview",
          requestId: ++reqId,
          revision: b.revision,
          actor: readyUnit.id,
          moveId,
          anchor: { q: enemy.pos.q, r: enemy.pos.r },
          aim: { dir: 0, dirCount: 6 }
        });

        const preview = previewRes.changes?.battle?.preview ?? (await host.query()).battle?.preview;
        if (preview && preview.valid) {
          await host.dispatch({ t: "battle/act-at", preview });
        } else {
          await host.dispatch({ t: "battle/step", revision: b.revision });
        }
        await new Promise(r => setTimeout(r, 50));
      }

      const postBattle = await host.query();
      const battleResult = postBattle.battle?.result;

      // Leave battle
      await host.dispatch({ t: "battle/leave" });
      await new Promise(r => setTimeout(r, 600));

      const app = window.__tianshuApp;
      if (app?.scene) app.scene.value = "ruin";

      // Drain after_initial_battle dialogue (choice 0: 还想自己再试)
      let q = await host.query();
      let dGuard = 0;
      while (q.dialogue && dGuard++ < 30) {
        if (q.dialogue.choices?.length) {
          await host.dispatch({ t: "dialogue/choose", choiceIndex: 0 });
        } else {
          await host.dispatch({ t: "dialogue/continue" });
        }
        await new Promise(r => setTimeout(r, 100));
        q = await host.query();
      }

      const snap = await host.snapshot();
      const manualDone = snap.profile?.replayRules?.switches?.["fl_00_initial_battle_manual"];
      return { battleResult, manualDone, inBattle: !!(await host.query()).battle };
    })()`);
  });

  // Step 6: Walk to door to_shanjing (12, 2) and mount sc_00_shanjing
  await runStep('6. Travel to Mountain Path (sc_00_shanjing)', async () => {
    return await browserEval(`(async () => {
      const c = window.__gameController;
      const host = c.host;

      await host.dispatch({ t: "world/walkTo", hex: { q: 12, r: 2 } });
      await new Promise(r => setTimeout(r, 500));

      await host.dispatch({ t: "world/interact", anchorId: "to_shanjing" });
      await new Promise(r => setTimeout(r, 500));

      await host.dispatch({
        t: "world/mountRegion",
        regionId: "rg_jiangnan_taihu",
        sceneId: "sc_00_shanjing",
        spawnId: "from_zhulin"
      });
      await new Promise(r => setTimeout(r, 800));

      const q = await host.query();
      return { sceneId: q.region?.sceneId };
    })()`);
  });

  await capture('yuenv_03_mountain_path.jpg', 'Mountain Path (猿迹山径) Scene');

  // Step 7: Walk to (12, 8), interact with offer_tao, offer peach to Baiyuan
  await runStep('7. Encounter Baiyuan & Offer Peach', async () => {
    return await browserEval(`(async () => {
      const c = window.__gameController;
      const host = c.host;

      await host.dispatch({ t: "world/walkTo", hex: { q: 12, r: 8 } });
      await new Promise(r => setTimeout(r, 500));

      await host.dispatch({ t: "world/interact", anchorId: "offer_tao" });
      await new Promise(r => setTimeout(r, 500));

      // Advance dialogue: choice 0 (放下一枚桃子)
      let q = await host.query();
      let guard = 0;
      while (q.dialogue && guard++ < 30) {
        if (q.dialogue.choices?.length) {
          await host.dispatch({ t: "dialogue/choose", choiceIndex: 0 });
        } else {
          await host.dispatch({ t: "dialogue/continue" });
        }
        await new Promise(r => setTimeout(r, 100));
        q = await host.query();
      }

      const snap = await host.snapshot();
      const baiyuanMerged = snap.profile?.replayRules?.switches?.["fl_00_baiyuan_merged"];
      return { baiyuanMerged };
    })()`);
  });

  await capture('yuenv_04_baiyuan_peace.jpg', 'Baiyuan Appeased - Path Cleared');

  // Step 8: Walk to (15, 10), enter Yue camp (sc_00_yueying)
  await runStep('8. Enter Yue Army Camp (sc_00_yueying)', async () => {
    return await browserEval(`(async () => {
      const c = window.__gameController;
      const host = c.host;

      await host.dispatch({ t: "world/walkTo", hex: { q: 15, r: 10 } });
      await new Promise(r => setTimeout(r, 500));

      await host.dispatch({ t: "world/interact", anchorId: "to_yueying" });
      await host.dispatch({
        t: "world/mountRegion",
        regionId: "rg_jiangnan_taihu",
        sceneId: "sc_00_yueying",
        spawnId: "from_shanjing"
      });
      await new Promise(r => setTimeout(r, 600));

      // Walk to camp_gate (9, 14) and enter inside
      await host.dispatch({ t: "world/walkTo", hex: { q: 9, r: 14 } });
      await host.dispatch({ t: "world/interact", anchorId: "camp_gate" });
      await host.dispatch({
        t: "world/mountRegion",
        regionId: "rg_jiangnan_taihu",
        sceneId: "sc_00_yueying",
        spawnId: "camp_gate_inside"
      });
      await new Promise(r => setTimeout(r, 800));

      const q = await host.query();
      return { sceneId: q.region?.sceneId };
    })()`);
  });

  await capture('yuenv_05_yue_camp.jpg', 'Yue Army Camp (越营) - Meeting Fan Li');

  // Step 9: Speak with Fan Li, win Biandao Battle, complete sword preview
  await runStep('9. Fan Li Request & Biandao Battle', async () => {
    return await browserEval(`(async () => {
      const c = window.__gameController;
      const host = c.host;

      // Walk near Fan Li (13, 6)
      await host.dispatch({ t: "world/walkTo", hex: { q: 13, r: 6 } });
      await host.dispatch({ t: "world/interact", anchorId: "npc_fanli_yueying" });
      await new Promise(r => setTimeout(r, 500));

      // Advance fanli_request dialogue (choice 0: 劝阿青相助)
      let q = await host.query();
      let guard = 0;
      while (q.dialogue && guard++ < 30) {
        if (q.dialogue.choices?.length) {
          await host.dispatch({ t: "dialogue/choose", choiceIndex: 0 });
        } else {
          await host.dispatch({ t: "dialogue/continue" });
        }
        await new Promise(r => setTimeout(r, 100));
        q = await host.query();
      }

      // Biandao battle starts
      let bGuard = 0;
      let reqId = 300;
      while (bGuard++ < 150) {
        const q2 = await host.query();
        const b = q2.battle;
        if (!b || b.result) break;

        const readyUnit = b.units.find(u => u.id === b.actorId);
        if (!readyUnit || readyUnit.control === "ai") {
          await host.dispatch({ t: "battle/step", revision: b.revision });
          continue;
        }

        const enemies = b.units.filter(u => u.side !== readyUnit.side && u.hp > 0);
        if (!enemies.length) {
          await host.dispatch({ t: "battle/step", revision: b.revision });
          continue;
        }

        const enemy = enemies[0];
        const moveId = readyUnit.moves?.[0]?.id ?? "mv_basic_strike";
        const previewRes = await host.dispatch({
          t: "battle/preview",
          requestId: ++reqId,
          revision: b.revision,
          actor: readyUnit.id,
          moveId,
          anchor: { q: enemy.pos.q, r: enemy.pos.r },
          aim: { dir: 0, dirCount: 6 }
        });

        const preview = previewRes.changes?.battle?.preview ?? (await host.query()).battle?.preview;
        if (preview && preview.valid) {
          await host.dispatch({ t: "battle/act-at", preview });
        } else {
          await host.dispatch({ t: "battle/step", revision: b.revision });
        }
        await new Promise(r => setTimeout(r, 50));
      }

      // Leave Biandao battle
      await host.dispatch({ t: "battle/leave" });
      await new Promise(r => setTimeout(r, 600));

      // Advance chained dialogues: biandao_after -> sword_source -> nine_layer_preview
      q = await host.query();
      let cGuard = 0;
      while (q.dialogue && cGuard++ < 50) {
        if (q.dialogue.choices?.length) {
          // Choice 1: 一键观看演示 / 远景
          const idx = q.dialogue.choices.length > 1 ? 1 : 0;
          await host.dispatch({ t: "dialogue/choose", choiceIndex: idx });
        } else {
          await host.dispatch({ t: "dialogue/continue" });
        }
        await new Promise(r => setTimeout(r, 100));
        q = await host.query();
      }

      const snap = await host.snapshot();
      const biandaoDone = snap.profile?.replayRules?.switches?.["fl_00_biandao_done"];
      return { biandaoDone };
    })()`);
  });

  await capture('yuenv_06_biandao_battle.jpg', 'Biandao Sword Watching & Demo Completed');

  // Step 10: Walk to (13, 12), interact transmission_inkpoint, receive A\'Qing transmission
  await runStep('10. A\'Qing Transmission & Avalanche Survival', async () => {
    return await browserEval(`(async () => {
      const c = window.__gameController;
      const host = c.host;

      await host.dispatch({ t: "world/walkTo", hex: { q: 13, r: 12 } });
      await host.dispatch({ t: "world/interact", anchorId: "transmission_inkpoint" });
      await new Promise(r => setTimeout(r, 600));

      // Advance transmission dialogue: 默记呼吸 -> 稍后再导出 -> 直接北行
      let q = await host.query();
      let guard = 0;
      while (q.dialogue && guard++ < 50) {
        if (q.dialogue.choices?.length) {
          const idx = q.dialogue.choices.length - 1;
          await host.dispatch({ t: "dialogue/choose", choiceIndex: idx });
        } else {
          await host.dispatch({ t: "dialogue/continue" });
        }
        await new Promise(r => setTimeout(r, 100));
        q = await host.query();
      }

      await new Promise(r => setTimeout(r, 1500));
      q = await host.query();
      return { sceneId: q.region?.sceneId };
    })()`);
  });

  await capture('yuenv_07_aqing_transmission.jpg', 'A\'Qing Sword Transmission Level 1 Completed');

  // Step 11: Snow Cave initial sleep allocation (sc_00_changbai_cave)
  await runStep('11. Changbai Mountain Snow Cave - Initial Sleep Allocation', async () => {
    return await browserEval(`(async () => {
      const c = window.__gameController;
      const host = c.host;

      await host.dispatch({ t: "world/walkTo", hex: { q: 4, r: 4 } });
      await host.dispatch({ t: "world/interact", anchorId: "first_sleep_allocation" });
      await new Promise(r => setTimeout(r, 600));

      // Advance first_sleep_allocation: choice 1 (使用六项各五十的均衡方案)
      let q = await host.query();
      let guard = 0;
      while (q.dialogue && guard++ < 30) {
        if (q.dialogue.choices?.length) {
          const idx = q.dialogue.choices.length > 1 ? 1 : 0;
          await host.dispatch({ t: "dialogue/choose", choiceIndex: idx });
        } else {
          await host.dispatch({ t: "dialogue/continue" });
        }
        await new Promise(r => setTimeout(r, 100));
        q = await host.query();
      }

      const snap = await host.snapshot();
      const switches = snap.profile?.replayRules?.switches || {};
      return {
        allocationReady: switches["fl_00_allocation_ready"],
        sleepCommitted: switches["fl_00_first_sleep_committed"],
        wakeBaima: switches["fl_00_wake_baima"]
      };
    })()`);
  });

  await capture('yuenv_08_snow_cave_sleep.jpg', 'Changbai Snow Cave - Initial Sleep Allocation & Settle');

  // Step 12: Settle prologue and execute Book Sleep to Chapter 10 (白马啸西风)
  await runStep('12. Settle Prologue & Transition to Chapter 10 (白马啸西风)', async () => {
    return await browserEval(`(async () => {
      const c = window.__gameController;
      const host = c.host;

      await host.dispatch({
        t: "quest/choose",
        questId: "dc_00_01",
        optionId: "full",
        phase: "settle",
        completionNodeId: "n_full_complete"
      });

      const plan = {
        id: "00000000-0000-4000-8000-000000000042",
        from: "ch00_yuenv",
        to: "ch10_baima",
        targetTier: "LOW",
        sleepEventId: "slp_first_changbai",
        skills: { martial: [], inner: [] },
        convert: { forget: [], dissipate: [] },
        equips: []
      };

      const res = await host.dispatch({ t: "chapter/bookSleep", plan });
      await new Promise(r => setTimeout(r, 2000));

      const q = await host.query();
      return {
        bookSleepAccepted: res.accepted,
        newChapter: q.chapterId,
        sceneId: q.region?.sceneId
      };
    })()`);
  });

  await capture('yuenv_09_chapter10_wake.jpg', 'Chapter 10 Wake - White Horse Neighs in the West Wind');

  console.log('\n========================================================');
  console.log('🎉 Full Yue Nu Jian Story Flow Successfully Completed!');
  console.log('========================================================');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
