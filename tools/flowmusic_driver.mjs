import http from 'http';
import fs from 'fs';
import path from 'path';

const TARGET_ID = 'C1976DBB88D699139A5AE6B63D1F5DEF';

export function evalBrowser(expression) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      targetId: TARGET_ID,
      expression,
    });
    const req = http.request('http://127.0.0.1:9223/eval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.ok) return reject(new Error(JSON.stringify(json.error || json)));
          if (json.error) {
            const desc = json.error.exception?.description || JSON.stringify(json.error);
            return reject(new Error(desc));
          }
          resolve(json.result);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

export async function ensureInstrumentalMode() {
  const script = `(() => {
    const btn = document.querySelector('button[aria-label="Toggle instrumental mode"]');
    if (!btn) return { error: 'Toggle instrumental mode button not found' };
    const state = btn.getAttribute('data-state');
    if (state !== 'checked') {
      btn.click();
    }
    return {
      beforeState: state,
      afterState: btn.getAttribute('data-state'),
      ariaChecked: btn.getAttribute('aria-checked')
    };
  })()`;
  return await evalBrowser(script);
}

export async function setSoundPrompt(promptText) {
  const script = `((text) => {
    // Find textarea in Describe the sound section
    const tas = Array.from(document.querySelectorAll('textarea'));
    // Usually the sound textarea is surrounded by 'Describe the sound'
    let soundTa = tas.find(t => {
      const p = t.closest('div');
      return p && p.parentElement && p.parentElement.innerText.includes('Describe the sound');
    });
    if (!soundTa && tas.length >= 3) {
      soundTa = tas[2]; // Fallback to index 2
    }
    if (!soundTa) return { error: 'Sound textarea not found' };

    // Set value using native setter to trigger React/Vue listeners
    const proto = Object.getPrototypeOf(soundTa);
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set ||
                         Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    if (nativeSetter) {
      nativeSetter.call(soundTa, text);
    } else {
      soundTa.value = text;
    }

    soundTa.dispatchEvent(new Event('input', { bubbles: true }));
    soundTa.dispatchEvent(new Event('change', { bubbles: true }));

    const genBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Generate');

    return {
      success: true,
      currentValue: soundTa.value,
      generateBtnDisabled: genBtn ? genBtn.disabled : null
    };
  })(${JSON.stringify(promptText)})`;
  return await evalBrowser(script);
}

export async function clickGenerate() {
  const script = `(() => {
    const genBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Generate');
    if (!genBtn) return { error: 'Generate button not found' };
    if (genBtn.disabled) return { error: 'Generate button is disabled' };
    genBtn.click();
    return { success: true };
  })()`;
  return await evalBrowser(script);
}

export async function getSessionStatus() {
  const script = `(() => {
    const genBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Generate');
    const songCards = Array.from(document.querySelectorAll('div[class*="song"], div[class*="track"], div[class*="card"]'))
      .filter(el => el.innerText.includes('Wandering') || el.innerText.includes('Take') || el.querySelector('button[aria-label*="Play"]'))
      .map(el => ({ text: el.innerText.slice(0, 100) }));
    
    // Check for progress / spinners / download buttons
    const downloadBtns = Array.from(document.querySelectorAll('button[aria-label="Download song"]')).length;
    const allButtons = Array.from(document.querySelectorAll('button')).map(b => b.getAttribute('aria-label') || b.innerText.trim()).filter(Boolean);

    return {
      generateDisabled: genBtn ? genBtn.disabled : null,
      downloadCount: downloadBtns,
      recentActions: allButtons.slice(0, 25)
    };
  })()`;
  return await evalBrowser(script);
}
