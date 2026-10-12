// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function alpha(color: string): number {
  if (/^#[0-9a-f]{6}$/iu.test(color)) return 1;
  const hex = /^#[0-9a-f]{8}$/iu.exec(color);
  if (hex) return Number.parseInt(color.slice(7, 9), 16) / 255;
  const value = color.match(/^rgba?\([^,]+,[^,]+,[^,]+(?:,\s*([\d.]+))?\)$/u);
  if (!value) throw new TypeError(`UNSUPPORTED_COMPUTED_COLOR:${color}`);
  return value[1] === undefined ? 1 : Number(value[1]);
}
function cssRule(source: string, selector: string): string {
  const start = source.indexOf(`${selector} {`);
  const end = source.indexOf('\n}', start);
  if (start < 0 || end < 0) throw new TypeError(`CSS_RULE_MISSING:${selector}`);
  return source.slice(start, end + 2);
}
describe('shop topbar presentation', () => {
  it('renders the title coverage itself at final alpha >= 0.85', () => {
    const css = readFileSync(resolve(process.cwd(), 'apps/game/src/style.css'), 'utf8');
    const styleElement = document.createElement('style');
    styleElement.textContent = `${cssRule(css, ':root')}\n${cssRule(css, '.brand')}`;
    document.head.append(styleElement);
    const topbar = document.createElement('header'); topbar.className = 'topbar halo';
    const brand = document.createElement('div'); brand.className = 'brand';
    brand.textContent = '天书录'; topbar.append(brand); document.body.append(topbar);
    const style = getComputedStyle(brand);
    expect(alpha(style.backgroundColor)).toBeGreaterThanOrEqual(0.85);
    expect(style.backgroundColor).not.toBe('rgb(0, 0, 0)');
    expect(style.borderTopWidth).toBe('');
    expect(brand.getBoundingClientRect().left).toBeGreaterThanOrEqual(0);
    topbar.remove(); styleElement.remove();
  });
});
