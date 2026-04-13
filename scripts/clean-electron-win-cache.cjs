/**
 * Removes cached Electron Windows x64 zips under %LOCALAPPDATA%\\electron\\Cache.
 * Use when packaging fails with ENOENT renaming electron.exe (often a corrupted partial download).
 */
const fs = require('fs');
const path = require('path');

const local = process.env.LOCALAPPDATA;
if (!local) {
  console.warn('LOCALAPPDATA is not set; skipping electron cache clean.');
  process.exit(0);
}

const cacheDir = path.join(local, 'electron', 'Cache');
if (!fs.existsSync(cacheDir)) {
  process.exit(0);
}

for (const name of fs.readdirSync(cacheDir)) {
  if (!/^electron-.*-win32-x64\.zip$/i.test(name)) continue;
  const full = path.join(cacheDir, name);
  try {
    fs.unlinkSync(full);
    console.log('Removed', full);
  } catch (e) {
    console.warn('Could not remove', full, e.message);
  }
}
