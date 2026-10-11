const fs = require('fs');
const path = require('path');
const targetDirs = [
  'src',
  'backend/src',
  'public',
  'uploads'
];

const targetFiles = [
  'index.html',
  'package.json',
  'README.md',
  'vite.config.ts'
];

const allowedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.html', '.svg', '.css', '.json', '.md'];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Replace Arx -> Arx
  content = content.replace(/Arx/g, 'Arx');
  // Replace arx -> arx
  content = content.replace(/arx/g, 'arx');
  // Replace ARX -> ARX
  content = content.replace(/ARX/g, 'ARX');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else {
      const ext = path.extname(fullPath);
      if (allowedExtensions.includes(ext) || allowedExtensions.includes(ext.toLowerCase())) {
        replaceInFile(fullPath);
      }
    }
  }
}

// Process target directories
for (const dir of targetDirs) {
  walkDir(path.join(__dirname, '..', dir));
}

// Process target individual files
for (const file of targetFiles) {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    replaceInFile(fullPath);
  }
}

console.log('Replacement complete.');
