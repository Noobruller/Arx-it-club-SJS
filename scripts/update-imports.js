import fs from 'fs';
import { globSync } from 'glob';

const files = globSync('{src,backend}/**/*.{js,jsx}', { ignore: ['**/node_modules/**'] });
const rootFiles = globSync('*.{js,jsx}', { ignore: ['**/node_modules/**'] });
const allFiles = [...files, ...rootFiles];

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  // Replace imports like './config/index.ts' with './config/index.js'
  // and './components/Button.tsx' with './components/Button.jsx'
  content = content.replace(/from\s+['"]([^'"]+)\.tsx['"]/g, "from '$1.jsx'");
  content = content.replace(/from\s+['"]([^'"]+)\.ts['"]/g, "from '$1.js'");
  content = content.replace(/import\s+['"]([^'"]+)\.tsx['"]/g, "import '$1.jsx'");
  content = content.replace(/import\s+['"]([^'"]+)\.ts['"]/g, "import '$1.js'");

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated imports in ${file}`);
  }
});
