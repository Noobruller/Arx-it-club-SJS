import fs from 'fs';
import path from 'path';
import { db } from '../backend/src/services/db.js';

async function exportNow() {
  await db.ensureInitialized();
  db._saveToFile();

  const projectDbPath = path.resolve('./arx_database.json');
  const downloadsDbPath = 'C:\\Users\\Administrator\\Downloads\\arx_database.json';

  const raw = fs.readFileSync(projectDbPath, 'utf8');
  const parsed = JSON.parse(raw);
  parsed.exportedAt = new Date().toISOString();
  
  const updatedContent = JSON.stringify(parsed, null, 2);
  fs.writeFileSync(projectDbPath, updatedContent, 'utf8');
  fs.writeFileSync(downloadsDbPath, updatedContent, 'utf8');

  const stat = fs.statSync(downloadsDbPath);
  console.log('EXPORT_SUCCESS:', downloadsDbPath, 'Size:', stat.size, 'Time:', stat.mtime.toISOString(), 'ExportedAt:', parsed.exportedAt);
}

exportNow().catch(err => {
  console.error('EXPORT_ERROR:', err);
  process.exit(1);
});
