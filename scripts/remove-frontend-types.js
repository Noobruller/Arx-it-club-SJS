import fs from 'fs';
import { globSync } from 'glob';

const files = globSync('src/**/*.{js,jsx}', { ignore: ['**/node_modules/**'] });

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  // regex to remove import { ... } from '.../types/index.js'
  // and import { ... } from '.../types'
  // It handles multi-line imports
  content = content.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*types\/index\.js['"];?/g, '');
  content = content.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*types['"];?/g, '');
  // Also catch 'types' or 'types/index'
  content = content.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*types(\/index(\.js)?)?['"];?/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Removed type imports from ${file}`);
  }
});
