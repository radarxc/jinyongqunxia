import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { sinanSouthAngleRad } from '../../explore/sinan-math';
import TxSinan from './TxSinan.vue';
import { TX_SINAN_STRINGS } from './TxSinan.strings';

describe('TxSinan', () => {
  it.each([
    [[1, 0, 0, -1], Math.PI / 2],
    [[0, 1, 1, 0], 0],
    [[-1, 0, 0, 1], -Math.PI / 2],
    [[0, -1, -1, 0], Math.PI],
  ] as const)('points the spoon handle south for camera basis %j', (basis, expected) => {
    const actual = sinanSouthAngleRad([0, 1], new Float32Array(basis), false);
    expect(Math.atan2(Math.sin(actual - expected), Math.cos(actual - expected))).toBeCloseTo(0, 6);
  });

  it('has the required label and toggles north-up', async () => {
    const wrapper = mount(TxSinan, { props: { south: [0, 1], basis: null, northUp: false } });
    expect(wrapper.get('button').attributes('aria-label')).toBe(TX_SINAN_STRINGS.label);
    expect(wrapper.get('.spoon').attributes('style')).toContain('rotate(1.5707963267948966rad)');
    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('toggle')).toHaveLength(1);
  });

  it('points painted south within one degree and does not toggle in read-only mode', async () => {
    const basis = new Float32Array([Math.SQRT1_2, -Math.SQRT1_2,
      -Math.SQRT1_2 / 2, -Math.SQRT1_2 / 2]);
    const imageSouth = [-0.89442719, 0.4472136] as const;
    const worldSouth = [0, 1] as const;
    const angle = sinanSouthAngleRad(worldSouth, basis, false);
    const expected = Math.atan2(imageSouth[1], imageSouth[0]);
    expect(Math.abs(angle - expected) * 180 / Math.PI).toBeLessThanOrEqual(1);
    const wrapper = mount(TxSinan, { props: { south: worldSouth, basis, northUp: true, interactive: false } });
    const button = wrapper.get('button');
    expect(button.attributes('aria-label')).toBe(TX_SINAN_STRINGS.paintedLabel);
    expect(button.attributes('aria-pressed')).toBeUndefined();
    await button.trigger('click'); expect(wrapper.emitted('toggle')).toBeUndefined();
  });

  it('routes the plate, spoon, ticks and patina through theme variables with defaults', () => {
    const wrapper = mount(TxSinan, { props: { south: [0, 1], basis: null, northUp: false } });
    expect(wrapper.get('#tx-bronze stop').attributes('stop-color'))
      .toBe('var(--sinan-bronze-light, #d1b26e)');
    expect(wrapper.get('#tx-spoon stop').attributes('stop-color'))
      .toBe('var(--sinan-spoon-light, #ead69d)');
    expect(wrapper.get('.earth-plate').classes()).toContain('earth-plate');
    expect(wrapper.get('.ticks').classes()).toContain('ticks');
    expect(wrapper.get('.spoon-handle').classes()).toContain('spoon-handle');
    expect(wrapper.findAll('.patina')).toHaveLength(2);
  });
});
