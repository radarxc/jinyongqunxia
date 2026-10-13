import fs from 'fs';
import path from 'path';
import { browserEval } from '../agents/browser_eval.mjs';

const tid = '1405A88996E383F6C5BAC7BB0EB49347';
const ARTIFACTS_DIR = '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09';

async function captureShot(name) {
  const dataUrl = await browserEval('window.__viewer?.captureScreenshot("image/jpeg", 0.95)', tid);
  if (dataUrl && dataUrl.startsWith('data:image')) {
    const b64 = dataUrl.split(',')[1];
    const outPath = path.join(ARTIFACTS_DIR, `${name}.jpg`);
    fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
    console.log(`Saved screenshot to ${name}.jpg (${fs.statSync(outPath).size} bytes)`);
  }
}

async function testPreset(name, config) {
  console.log(`\n=== Testing calibrated preset: ${name} ===`);
  await browserEval('window.__viewer.clearProps()', tid);
  for (const item of config) {
    await browserEval(`
      window.__viewer.attachProp("${item.id}", "${item.url}", {
        slot: "${item.slot}",
        scale: ${JSON.stringify(item.scale)},
        offset: ${JSON.stringify(item.offset)},
        rotation: ${JSON.stringify(item.rotation)}
      })
    `, tid);
  }
  await new Promise(r => setTimeout(r, 1200));
  await captureShot(`shot_calibrated_${name}`);
}

async function main() {
  // 1. 越女剑仙
  await testPreset('xianxia', [
    {
      id: 'cloth_xianxia_dress',
      url: '/models/props/cloth_xianxia_dress.glb',
      slot: 'root',
      scale: 1.25,
      offset: [0, 0.88, 0],
      rotation: [0, Math.PI / 2, 0]
    },
    {
      id: 'hair_ponytail',
      url: '/models/props/hair_ponytail.glb',
      slot: 'head',
      scale: 0.30,
      offset: [0, 0.03, -0.015],
      rotation: [0, Math.PI, 0]
    },
    {
      id: 'item_qingfeng_sword',
      url: '/models/props/item_qingfeng_sword.glb',
      slot: 'hips',
      scale: 0.50,
      offset: [-0.15, -0.02, 0.04],
      rotation: [0.15, -0.2, -0.3]
    },
    {
      id: 'luxury_jade_pendant',
      url: '/models/props/luxury_jade_pendant.glb',
      slot: 'hips',
      scale: 0.14,
      offset: [0.10, -0.15, 0.10],
      rotation: [0, 0, 0]
    }
  ]);

  // 2. 昆仑仙子
  await testPreset('kunlun', [
    {
      id: 'cloth_kunlun_taoist',
      url: '/models/props/cloth_kunlun_taoist.glb',
      slot: 'root',
      scale: 1.35,
      offset: [0, 0.98, 0],
      rotation: [0, Math.PI / 2, 0]
    },
    {
      id: 'hair_bun_fairy',
      url: '/models/props/hair_bun_fairy.glb',
      slot: 'head',
      scale: 0.32,
      offset: [0, 0.09, -0.02],
      rotation: [0, 0, 0]
    },
    {
      id: 'item_qingfeng_sword',
      url: '/models/props/item_qingfeng_sword.glb',
      slot: 'hips',
      scale: 0.50,
      offset: [-0.15, -0.02, 0.04],
      rotation: [0.15, -0.2, -0.3]
    },
    {
      id: 'luxury_jade_pendant',
      url: '/models/props/luxury_jade_pendant.glb',
      slot: 'hips',
      scale: 0.14,
      offset: [0.10, -0.15, 0.10],
      rotation: [0, 0, 0]
    }
  ]);

  // 3. 魔教教主
  await testPreset('crimson', [
    {
      id: 'cloth_crimson_gown',
      url: '/models/props/cloth_crimson_gown.glb',
      slot: 'root',
      scale: 1.30,
      offset: [0, 0.93, 0],
      rotation: [0, Math.PI / 2, 0]
    },
    {
      id: 'hair_long_flow',
      url: '/models/props/hair_long_flow.glb',
      slot: 'head',
      scale: 0.32,
      offset: [0, 0.02, 0.01],
      rotation: [0, 0, 0]
    },
    {
      id: 'item_folding_fan',
      url: '/models/props/item_folding_fan.glb',
      slot: 'hips',
      scale: 0.24,
      offset: [-0.08, -0.05, 0.12],
      rotation: [0.2, 0, 0.4]
    },
    {
      id: 'luxury_gold_pomander',
      url: '/models/props/luxury_gold_pomander.glb',
      slot: 'hips',
      scale: 0.15,
      offset: [0.09, -0.15, 0.10],
      rotation: [0, 0, 0]
    }
  ]);

  // 4. 暗夜刺客
  await testPreset('assassin', [
    {
      id: 'cloth_black_assassin',
      url: '/models/props/cloth_black_assassin.glb',
      slot: 'root',
      scale: 1.30,
      offset: [0, 0.95, 0],
      rotation: [0, Math.PI / 2, 0]
    },
    {
      id: 'item_bamboo_hat',
      url: '/models/props/item_bamboo_hat.glb',
      slot: 'head',
      scale: 0.40,
      offset: [0, 0.05, -0.01],
      rotation: [0, 0, 0]
    },
    {
      id: 'item_iron_dagger',
      url: '/models/props/item_iron_dagger.glb',
      slot: 'hips',
      scale: 0.24,
      offset: [0.12, 0.0, 0.06],
      rotation: [-0.2, 0.3, 0.6]
    },
    {
      id: 'item_bamboo_scroll',
      url: '/models/props/item_bamboo_scroll.glb',
      slot: 'hips',
      scale: 0.22,
      offset: [-0.12, -0.06, -0.05],
      rotation: [0.1, 0.2, -0.4]
    }
  ]);

  // 5. 金甲战神
  await testPreset('golden', [
    {
      id: 'cloth_golden_armor',
      url: '/models/props/cloth_golden_armor.glb',
      slot: 'root',
      scale: 1.30,
      offset: [0, 0.96, 0],
      rotation: [0, Math.PI / 2, 0]
    },
    {
      id: 'hair_ponytail',
      url: '/models/props/hair_ponytail.glb',
      slot: 'head',
      scale: 0.30,
      offset: [0, 0.03, -0.015],
      rotation: [0, Math.PI, 0]
    },
    {
      id: 'item_wine_gourd',
      url: '/models/props/item_wine_gourd.glb',
      slot: 'hips',
      scale: 0.16,
      offset: [0.12, -0.08, 0.08],
      rotation: [0.1, 0.3, 0.2]
    },
    {
      id: 'luxury_gold_pomander',
      url: '/models/props/luxury_gold_pomander.glb',
      slot: 'hips',
      scale: 0.15,
      offset: [-0.09, -0.15, 0.10],
      rotation: [0, 0, 0]
    }
  ]);

  console.log('\n=== Calibration finished ===');
}

main().catch(console.error);
