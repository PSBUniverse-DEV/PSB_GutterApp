# Microfrontend Local Routing — Core Fix Needed

## Problem

When the gutter module is built into the host repo (not deployed as a separate child app), `/gutter/*` routes return 404. The `withMicrofrontends()` middleware in `next.config.mjs` sees `psb-gutter-app` as an external app and proxies requests to `psb-gutter-app.vercel.app` instead of serving them locally.

This happens because the `psb-gutter-app` entry in `microfrontends.json` has no `packageName` — so the middleware doesn't know it's served by this same app.

## Root Cause

In `microfrontends.json`, only `psbuniverse_dev` has `"packageName": "psbuniverse"`. The gutter entry doesn't:

```json
"psb-gutter-app": {
  "development": {
    "fallback": "psb-gutter-app.vercel.app"   // ← middleware proxies here
  },
  "routing": [...]
  // no packageName → middleware thinks this is external
}
```

## Fix (two parts)

### 1. `microfrontends.json` — Add `packageName` to gutter entry

```json
"psb-gutter-app": {
  "packageName": "psbuniverse",
  "development": {
    "fallback": "psb-gutter-app.vercel.app"
  },
  "routing": [...]
}
```

This tells `withMicrofrontends` that the gutter routes are served by this same host app.

### 2. `scripts/generate-routes.js` — Auto-set `packageName` for local modules

Right now `syncMicrofrontends()` only syncs route paths. It should also set `packageName` when a module declares `microfrontend: "psb-gutter-app"` in its `index.js` — meaning the module lives in this repo and should be served locally.

In `syncMicrofrontends()`, after the `if (!appEntry?.routing?.[0]) continue;` line, add:

```js
// Read host package name to mark local microfrontends
const pkgPath = path.join(ROOT, "package.json");
const hostPackageName = fs.existsSync(pkgPath)
  ? JSON.parse(fs.readFileSync(pkgPath, "utf-8")).name || null
  : null;
```

(Move that outside the loop, before the `for` block.)

Then inside the loop, after the routing check:

```js
// When a module lives in this host repo, mark the microfrontend entry
// with the host's packageName so withMicrofrontends serves it locally
// instead of proxying to the fallback URL.
if (hostPackageName && appEntry.packageName !== hostPackageName) {
  appEntry.packageName = hostPackageName;
  changed = true;
  console.log(`  SYNC microfrontends.json: "${appName}" → packageName = "${hostPackageName}" (local)`);
}
```

This way, any module that declares `microfrontend: "psb-gutter-app"` in its `index.js` will auto-trigger the `packageName` sync during build — no manual `microfrontends.json` editing needed.

## What the gutter module already did

Added `microfrontend: "psb-gutter-app"` to `src/modules/gutter/index.js`. This is the module-level signal that triggers the sync. The core script just needs to handle it.

## Quick manual fix (until the script is updated)

Add `"packageName": "psbuniverse"` to the `psb-gutter-app` entry in `microfrontends.json` manually. This unblocks local development immediately.
