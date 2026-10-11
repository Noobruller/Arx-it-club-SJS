/**
 * File-based Persistence Service
 * Saves and loads application data directly to/from arx_database.json.
 *
 * On Vercel serverless: writes to /tmp/arx_database.json (ephemeral per-instance)
 * On local dev / persistent server: writes to project root arx_database.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root arx_database.json  (backend/src/services → 3 levels up → project root)
const PROJECT_DB_PATH = path.resolve(__dirname, '../../../arx_database.json');
// Tmp fallback for serverless read-only filesystems
const TMP_DB_PATH = path.join(
  process.env.TMPDIR || process.env.TEMP || '/tmp',
  'arx_database.json'
);

let _dbPath = null;

function getDbPath() {
  if (_dbPath) return _dbPath;
  // Try project root first, verifying actual write capability
  try {
    const dir = path.dirname(PROJECT_DB_PATH);
    const probe = path.join(dir, `.write_probe_${Date.now()}`);
    fs.writeFileSync(probe, '1', 'utf8');
    fs.unlinkSync(probe);
    _dbPath = PROJECT_DB_PATH;
  } catch {
    _dbPath = TMP_DB_PATH;
  }
  return _dbPath;
}

/**
 * Read the entire database JSON file.
 * Automatically chooses the newest available file between TMP_DB_PATH and PROJECT_DB_PATH.
 * Returns parsed object or null on error.
 */
export function readDb() {
  let newestData = null;
  let newestMtime = -1;

  for (const fp of [TMP_DB_PATH, PROJECT_DB_PATH]) {
    try {
      if (fs.existsSync(fp)) {
        const stat = fs.statSync(fp);
        if (stat.mtimeMs > newestMtime) {
          const raw = fs.readFileSync(fp, 'utf8');
          const parsed = JSON.parse(raw);
          newestMtime = stat.mtimeMs;
          newestData = parsed;
        }
      }
    } catch {
      // continue to next candidate
    }
  }
  return newestData;
}

/**
 * Write the entire database to disk.
 * Uses atomic file write (write to .tmp then rename) to guarantee integrity.
 */
export function writeDb(data) {
  if (!data) return;
  const filePath = getDbPath();
  try {
    const tmp = filePath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, filePath);
  } catch (err) {
    // If project path failed (e.g. read-only filesystem), fall back to tmp
    if (filePath !== TMP_DB_PATH) {
      try {
        const tmp = TMP_DB_PATH + '.tmp';
        fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
        fs.renameSync(tmp, TMP_DB_PATH);
      } catch (err2) {
        console.error('[FileDB] Failed to write database:', err2.message);
      }
    } else {
      console.error('[FileDB] Failed to write database:', err.message);
    }
  }
}

/**
 * Check if the db file exists and is readable.
 */
export function dbFileExists() {
  return [PROJECT_DB_PATH, TMP_DB_PATH].some(fp => {
    try { return fs.existsSync(fp); } catch { return false; }
  });
}
