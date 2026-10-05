#!/usr/bin/env python3
"""Destructive-by-design PWA smoke; restores the touched source asset before exit."""
from __future__ import annotations

import argparse
import json
import shlex
import subprocess
import time
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright


def wait_server(url: str) -> None:
    import urllib.request
    for _ in range(100):
        try:
            with urllib.request.urlopen(url, timeout=1):
                return
        except OSError:
            time.sleep(0.1)
    raise RuntimeError(f"preview did not start: {url}")


def run_build(root: Path, command: str) -> None:
    subprocess.run(shlex.split(command), cwd=root, check=True)


def start_server(root: Path, url: str) -> subprocess.Popen[bytes]:
    parsed = urlparse(url)
    process = subprocess.Popen(["pnpm", "--filter", "./apps/game", "exec", "vite",
        "preview", "--host", parsed.hostname or "127.0.0.1",
        "--port", str(parsed.port or 4173), "--strictPort"], cwd=root)
    wait_server(url)
    return process


def stop_server(process: subprocess.Popen[bytes] | None) -> None:
    if process is None or process.poll() is not None:
        return
    process.terminate()
    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait(timeout=5)


def enter_game(page) -> None:
    page.get_by_role("button", name="新游戏", exact=True).click()
    page.get_by_test_id("character-creation").wait_for()
    page.get_by_test_id("character-name").fill("离线烟测")
    page.get_by_test_id("character-submit").click()
    page.get_by_test_id("cutscene-skip").click()
    page.locator('[data-testid="mode-skip"] input').check()
    page.get_by_test_id("mode-confirm").click()
    for _ in range(20):
        if page.get_by_test_id("export-later").is_visible():
            break
        page.get_by_test_id("cutscene-next").click()
    page.get_by_test_id("export-later").click()
    page.get_by_test_id("allocation-default").click()
    page.get_by_test_id("allocation-review").click()
    page.get_by_test_id("allocation-confirm").click()
    page.get_by_test_id("cutscene-skip").click()
    page.get_by_test_id("baima-continue").click()
    page.locator(".bottom-bar").wait_for()


def download_closure(page, chapter: str) -> dict:
    closure = page.evaluate("c => fetch(`/offline/closure.${c}.json`, {cache:'no-store'}).then(r=>r.json())", chapter)
    page.evaluate("""async c => {
      const hex = b => [...new Uint8Array(b)].map(v => v.toString(16).padStart(2, '0')).join('');
      const responseFor = (value) => new Response(JSON.stringify(value),
        {headers: {'content-type': 'application/json'}});
      for (const f of c.files) {
        const response = await fetch(f.url, {cache: 'no-store'});
        if (!response.ok || response.status === 206) throw new Error(`SMOKE_HTTP:${f.url}`);
        const bytes = await response.arrayBuffer();
        if (bytes.byteLength !== f.bytes || hex(await crypto.subtle.digest('SHA-256', bytes)) !== f.sha256)
          throw new Error(`SMOKE_HASH:${f.url}`);
        const name = f.kind === 'content' ? `ts-content-${c.releaseHash}`
          : f.kind === 'manifest' ? 'ts-manifests-v1' : 'ts-assets-v1';
        const key = f.kind === 'content' ? f.url
          : `${f.url}${f.url.includes('?') ? '&' : '?'}__ts_hash=${f.sha256}`;
        const type = response.headers.get('content-type');
        await (await caches.open(name)).put(key, new Response(bytes,
          {status: 200, headers: type ? {'content-type': type} : {}}));
      }
      const manifests = await caches.open('ts-manifests-v1');
      const assets = c.files.filter(f => f.kind === 'asset' || f.kind === 'vfx');
      await manifests.put('/offline/copied-assets.json', responseFor({format: 1, files: assets}));
      await manifests.put(`/offline/closure.${c.chapter}.json`, responseFor(c));
      for (const f of c.files.filter(f => f.kind === 'manifest')) {
        const hashed = await manifests.match(`${f.url}?__ts_hash=${f.sha256}`);
        if (hashed) await manifests.put(f.url, hashed);
      }
      const record = {format: 1, closure: c, installedAt: Date.now(), lastVerifiedAt: Date.now(),
        state: 'active', pinned: true};
      const meta = await caches.open('ts-offline-meta');
      await meta.put(`/__offline/record/${encodeURIComponent(c.chapter)}/${c.releaseHash}.json`, responseFor(record));
      await meta.put('/__offline/published.json', responseFor({format: 1, records: [record]}));
    }""", closure)
    return closure


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=str(Path(__file__).resolve().parents[3]))
    parser.add_argument("--url", default="http://127.0.0.1:4173")
    parser.add_argument("--chapter", default="ch01_tianlong")
    parser.add_argument("--build-command", default="pnpm --filter ./apps/game build",
        help="argv-style build command; shell syntax is intentionally unsupported")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    run_build(root, args.build_command)
    closure_path = root / "apps/game/dist/offline" / f"closure.{args.chapter}.json"
    closure = json.loads(closure_path.read_text(encoding="utf-8"))
    changed = next((item for item in closure["files"] if item["kind"] in {"asset", "vfx"}), None)
    if not changed:
        raise RuntimeError("closure has no image or VFX asset to mutate")
    public_path = changed["url"].lstrip("/")
    source_asset = root / public_path
    if public_path.startswith("assets/default/"):
        source_asset = root / "assets/default" / public_path.removeprefix("assets/default/")
    original = source_asset.read_bytes()
    server: subprocess.Popen[bytes] | None = start_server(root, args.url)
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            context = browser.new_context(service_workers="allow")
            page = context.new_page(); page.goto(args.url); page.reload()
            page.wait_for_function("navigator.serviceWorker.controller !== null")
            closure = download_closure(page, args.chapter)
            enter_game(page)
            stop_server(server); server = None; context.set_offline(True); page.reload()
            page.wait_for_load_state("domcontentloaded")
            page.wait_for_function("navigator.serviceWorker.controller !== null")
            for item in closure["files"]:
                status = page.evaluate("u => fetch(u).then(r => r.status)", item["url"])
                assert status == 200, f"offline fetch failed: {item['url']} => {status}"
            source_asset.write_bytes(original + b"\n")
            run_build(root, args.build_command)
            context.set_offline(False); server = start_server(root, args.url)
            page.reload(); page.wait_for_function("navigator.serviceWorker.controller !== null")
            enter_game(page)
            registration = page.evaluate_handle("navigator.serviceWorker.ready")
            page.evaluate("r => r.update()", registration)
            page.get_by_text("新版本已就绪", exact=True).wait_for(timeout=30_000)
            page.get_by_role("button", name="立即更新", exact=True).click()
            page.wait_for_function("navigator.serviceWorker.controller.state === 'activated'")
            browser.close()
    finally:
        stop_server(server)
        if source_asset.read_bytes() != original:
            source_asset.write_bytes(original)
            run_build(root, args.build_command)


if __name__ == "__main__":
    main()
