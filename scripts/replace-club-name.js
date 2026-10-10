import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

const targetDirs = ['src', 'backend', 'public', 'scripts'];
const targetFiles = [
  'index.html',
  'admin-applications.html',
  'application-status.html',
  'dashboard.html',
  'README.md',
  'DATABASE_HOSTING_GUIDE.md'
];

const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.md'];

let totalReplacements = 0;
let modifiedFilesCount = 0;

function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    
    // Replace "ARX IT CLUB OF SJS" or "ARX IT CLUB OF SJS" or "ARX IT CLUB OF SJS" (case-insensitive)
    // with "ARX IT CLUB OF SJS", ignoring if already followed by "OF SJS"
    const regex = /ARX\s+IT\s+CLUB(?!\s+OF\s+SJS)/gi;
    
    const matches = originalContent.match(regex);
    if (!matches || matches.length === 0) return;
    
    const newContent = originalContent.replace(regex, 'ARX IT CLUB OF SJS');
    
    if (newContent !== originalContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      modifiedFilesCount++;
      totalReplacements += matches.length;
      console.log(`Updated (${matches.length} matches): ${path.relative(rootDir, filePath)}`);
    }
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err.message);
  }
}

function walkDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === '.vercel') {
      continue;
    }
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (allowedExtensions.includes(ext)) {
        processFile(fullPath);
      }
    }
  }
}

console.log('Starting replacement of "ARX IT CLUB OF SJS" -> "ARX IT CLUB OF SJS"...');

for (const dir of targetDirs) {
  walkDirectory(path.join(rootDir, dir));
}

for (const file of targetFiles) {
  const fullPath = path.join(rootDir, file);
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
  }
}

console.log(`\nCompleted!`);
console.log(`Total replacements: ${totalReplacements}`);
console.log(`Files modified: ${modifiedFilesCount}`);
