const fs = require('fs');
const path = require('path');

const targetDirs = [
  'src',
  'backend/src'
];

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  content = content.replace(/arx-compact-logo\.png/g, 'arx-logo.jpg');
  content = content.replace(/arx-primary-logo\.png/g, 'arx-logo.jpg');
  content = content.replace(/arx-compact-logo\.svg/g, 'arx-logo.jpg');
  content = content.replace(/arx-primary-logo\.svg/g, 'arx-logo.jpg');
  
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
      if (['.ts', '.tsx', '.js', '.jsx', '.html'].includes(ext)) {
        replaceInFile(fullPath);
      }
    }
  }
}

// Process target directories
for (const dir of targetDirs) {
  walkDir(path.join(__dirname, '..', dir));
}
