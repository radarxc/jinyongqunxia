import type { RenderWorld } from '@tianshu/render';

export async function mountPlaceholderScene(canvas: HTMLCanvasElement): Promise<() => void> {
  const { createRenderer } = await import('@tianshu/render');
  const world: RenderWorld = await createRenderer(canvas);
  let frame = 0;
  const resize = (): void =>
    world.resize(canvas.clientWidth, canvas.clientHeight, window.devicePixelRatio);
  const draw = (timeMs: number): void => {
    world.render(timeMs);
    frame = requestAnimationFrame(draw);
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });
  frame = requestAnimationFrame(draw);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    world.dispose();
  };
}
