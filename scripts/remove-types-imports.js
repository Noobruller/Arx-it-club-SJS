import fs from 'fs';
import { globSync } from 'glob';

const files = globSync('{src,backend}/**/*.{js,jsx}', { ignore: ['**/node_modules/**'] });

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  // regex to remove import { ... } from '.../types.js'
  // It handles multi-line imports
  content = content.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*types\.js['"];?/g, '');
  content = content.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*types['"];?/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Removed type imports from ${file}`);
  }
});
