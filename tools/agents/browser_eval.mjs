/* global Buffer */
import fs from 'fs';
import path from 'path';
import http from 'http';

let cachedTargetId = '03F44E454412D6ADBE79037BAE4AB16F';
const EVAL_URL = 'http://127.0.0.1:9223/eval';

function postJson(urlStr, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Connection': 'close',
      },
    }, (res) => {
      let buf = '';
      res.on('data', (chunk) => { buf += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(buf));
        } catch (e) {
          reject(new Error(`Failed to parse JSON response: ${e.message}\nRaw: ${buf.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getJson(urlStr) {
  return new Promise((resolve, reject) => {
    http.get(urlStr, (res) => {
      let buf = '';
      res.on('data', (chunk) => { buf += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(buf));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

export async function getGameTargetId() {
  try {
    const json = await getJson('http://127.0.0.1:9223/targets');
    const targets = json.targets || json.result || [];
    const match = targets.find(t => t.type === 'page' && t.url && t.url.includes(':5173') && !t.url.includes('character-3d'))
      || targets.find(t => t.type === 'page' && ((t.url && t.url.includes(':5173')) || (t.title && t.title.includes('天书录'))));
    if (match) {
      cachedTargetId = match.targetId;
      return match.targetId;
    }
  } catch (e) {
    // fallback
  }
  return cachedTargetId;
}

export async function browserEval(expression, targetId) {
  const tid = targetId || await getGameTargetId();
  const json = await postJson(EVAL_URL, { targetId: tid, expression });
  if (!json.ok) {
    throw new Error(json.error ? (typeof json.error === 'object' ? JSON.stringify(json.error) : json.error) : 'Unknown eval failure');
  }
  if (json.error) {
    const errDesc = json.error.exception?.description || JSON.stringify(json.error);
    throw new Error(`EvalException: ${errDesc}`);
  }
  return json.result;
}

export async function captureScreenshot(outPath, targetId) {
  const tid = targetId || await getGameTargetId();
  const expr = `(async () => {
    try {

      if (!window.html2canvas) {
        await new Promise((resolve) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          s.onload = () => resolve();
          s.onerror = () => resolve();
          document.head.appendChild(s);
        });
      }

      if (window.html2canvas) {
        const renderPromise = window.html2canvas(document.body, {
          useCORS: true,
          logging: false,
          scale: 0.8,
          onclone: (clonedDoc) => {
            const origCanvases = Array.from(document.querySelectorAll('canvas'));
            const clonedCanvases = Array.from(clonedDoc.querySelectorAll('canvas'));
            for (let i = 0; i < origCanvases.length; i++) {
              const orig = origCanvases[i];
              const cloned = clonedCanvases[i];
              if (!cloned) continue;
              try {
                if (orig.closest('.town-stage') && window.__townView?.render) {
                  try { window.__townView.render(performance.now(), false); } catch (_) {}
                }
                if (orig.closest('.region-stage') && window.__regionScene?.render) {
                  try { window.__regionScene.render(performance.now(), false); } catch (_) {}
                }
                if (orig.closest('.worldmap-stage') && window.__worldMapView?.render) {
                  try {
                    window.__FORCE_RENDER__ = true;
                    window.__worldMapView.render(performance.now(), false);
                  } catch (_) {}
                }
                if (orig.classList.contains('viewport-canvas') && window.__viewer?.captureScreenshot) {
                  const shotDataUrl = window.__viewer.captureScreenshot('image/png');
                  const img = clonedDoc.createElement('img');
                  img.src = shotDataUrl;
                  img.style.cssText = cloned.style.cssText;
                  img.style.position = getComputedStyle(orig).position;
                  img.style.top = getComputedStyle(orig).top;
                  img.style.left = getComputedStyle(orig).left;
                  img.className = cloned.className;
                  img.style.width = orig.clientWidth + 'px';
                  img.style.height = orig.clientHeight + 'px';
                  cloned.parentNode.replaceChild(img, cloned);
                  continue;
                }
                if (!orig.classList.contains('battle-vfx') && (orig.closest('.battle-field') || orig.closest('.battle-field-wrap')) && window.__battleRenderer?.render) {
                  try { window.__battleRenderer.render(performance.now(), false); } catch (_) {}
                }
                if (orig.classList.contains('battle-vfx')) {
                  continue;
                }
                const comp = orig.__vueParentComponent || orig._vnode?.component || orig.closest('.town-stage')?.__vueParentComponent || orig.closest('.battle-field')?.__vueParentComponent || orig.closest('.battle-field')?._vnode?.component || orig.closest('.battle-field-wrap')?.__vueParentComponent || orig.closest('.canvas-wrap')?.__vueParentComponent;
                const s = comp?.setupState;
                const r = s?.view?.value || s?.view || s?.renderer?.value || s?.renderer;
                if (r?.render) {
                  if (s?.scene && s?.camera) {
                    r.render(s.scene, s.camera);
                  } else {
                    r.render(performance.now(), false);
                  }
                }
                if (s?.renderOverlay) {
                  try { s.renderOverlay(); } catch (_) {}
                }
                const c2d = document.createElement('canvas');
                c2d.width = orig.width;
                c2d.height = orig.height;
                const ctx = c2d.getContext('2d');
                ctx.drawImage(orig, 0, 0);
                
                // If this is meridian-webgl-canvas, composite overlay on top!
                if (orig.classList.contains('meridian-webgl-canvas')) {
                  const ov = orig.parentElement?.querySelector('.meridian-overlay-canvas');
                  if (ov) {
                    ctx.drawImage(ov, 0, 0);
                  }
                }
                
                const img = clonedDoc.createElement('img');
                img.src = c2d.toDataURL('image/png');
                img.style.cssText = cloned.style.cssText;
                img.style.position = getComputedStyle(orig).position;
                img.style.top = getComputedStyle(orig).top;
                img.style.left = getComputedStyle(orig).left;
                img.className = cloned.className;
                img.style.width = orig.clientWidth + 'px';
                img.style.height = orig.clientHeight + 'px';
                cloned.parentNode.replaceChild(img, cloned);
              } catch (e) {}
            }
          }
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('html2canvas timeout')), 8000));
        const pageCanvas = await Promise.race([renderPromise, timeoutPromise]);
        return pageCanvas.toDataURL("image/jpeg", 0.85);
      }
    } catch (_) {}

    const orig = document.querySelector('canvas');
    if (!orig) return null;
    const comp = orig.__vueParentComponent || orig._vnode?.component;
    const r = comp?.setupState?.view?.value || comp?.setupState?.view || comp?.setupState?.renderer?.value || comp?.setupState?.renderer;
    if (r?.render) r.render(performance.now(), false);
    const outC = document.createElement('canvas');
    outC.width = orig.width || orig.clientWidth;
    outC.height = orig.height || orig.clientHeight;
    const ctx = outC.getContext('2d');
    ctx.drawImage(orig, 0, 0, outC.width, outC.height);

    const scaleX = outC.width / (orig.clientWidth || 1);
    const scaleY = outC.height / (orig.clientHeight || 1);
    const badges = Array.from(document.querySelectorAll('.map-city-badge')).filter(b => b.style.display !== 'none');
    ctx.font = 'bold ' + Math.round(13 * scaleX) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    for (const b of badges) {
      const left = parseFloat(b.style.left) * scaleX;
      const top = parseFloat(b.style.top) * scaleY;
      const text = b.innerText.trim();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(text, left + 1, top + 1);
      ctx.fillStyle = b.classList.contains('ruin') ? '#3b5045' : '#7a2214';
      ctx.fillText(text, left, top);
    }
    return outC.toDataURL("image/jpeg", 0.85);
  })()`;
  const dataUrl = await browserEval(expr, tid);
  if (dataUrl && dataUrl.startsWith('data:image/')) {
    const base64 = dataUrl.split(',')[1];
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
    return outPath;
  }
  throw new Error('Screenshot dataURL invalid');
}

if (process.argv[1] && process.argv[1].endsWith('browser_eval.mjs')) {
  const cmd = process.argv[2] || 'status';
  if (cmd === 'screenshot') {
    const file = process.argv[3] || '/tmp/screen.jpg';
    captureScreenshot(file).then(f => console.log('Saved screenshot to:', f)).catch(e => console.error(e));
  } else if (cmd === 'eval') {
    const expr = process.argv.slice(3).join(' ');
    browserEval(expr).then(res => console.log(JSON.stringify(res, null, 2))).catch(e => console.error(e));
  }
}
