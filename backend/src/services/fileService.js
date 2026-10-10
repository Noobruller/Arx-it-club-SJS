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
  // Try project root first
  try {
    const dir = path.dirname(PROJECT_DB_PATH);
    fs.accessSync(dir, fs.constants.W_OK);
    _dbPath = PROJECT_DB_PATH;
  } catch {
    _dbPath = TMP_DB_PATH;
  }
  return _dbPath;
}

/**
 * Read the entire database JSON file.
 * Returns parsed object or null on error.
 */
export function readDb() {
  const filePath = getDbPath();
  // Also try the project path in case tmp was chosen before but project is writable
  for (const fp of [filePath, PROJECT_DB_PATH, TMP_DB_PATH]) {
    try {
      if (fs.existsSync(fp)) {
        const raw = fs.readFileSync(fp, 'utf8');
        return JSON.parse(raw);
      }
    } catch {
      // continue to next
    }
  }
  return null;
}

let _writeTimer = null;
let _pendingData = null;

/**
 * Write the entire database to disk.
 * Uses debouncing (100ms) to batch rapid successive writes.
 */
export function writeDb(data) {
  _pendingData = data;
  if (_writeTimer) return; // already scheduled
  _writeTimer = setTimeout(() => {
    _writeTimer = null;
    const toWrite = _pendingData;
    _pendingData = null;
    if (!toWrite) return;
    const filePath = getDbPath();
    try {
      const tmp = filePath + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(toWrite, null, 2), 'utf8');
      fs.renameSync(tmp, filePath);
    } catch (err) {
      // If project path failed, fall back to tmp
      if (filePath !== TMP_DB_PATH) {
        try {
          const tmp = TMP_DB_PATH + '.tmp';
          fs.writeFileSync(tmp, JSON.stringify(toWrite, null, 2), 'utf8');
          fs.renameSync(tmp, TMP_DB_PATH);
        } catch (err2) {
          console.error('[FileDB] Failed to write database:', err2.message);
        }
      } else {
        console.error('[FileDB] Failed to write database:', err.message);
      }
    }
  }, 100);
}

/**
 * Check if the db file exists and is readable.
 */
export function dbFileExists() {
  return [PROJECT_DB_PATH, TMP_DB_PATH].some(fp => {
    try { return fs.existsSync(fp); } catch { return false; }
  });
}
