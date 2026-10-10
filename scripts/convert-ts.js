import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import * as babel from '@babel/core';

const files = globSync('{src,backend}/**/*.{ts,tsx}', { ignore: ['**/node_modules/**'] });

// We also need to process root files like server.ts, vite.config.ts
const rootFiles = globSync('*.{ts,tsx}', { ignore: ['**/node_modules/**'] });

const allFiles = [...files, ...rootFiles];

allFiles.forEach(file => {
  const isTSX = file.endsWith('.tsx');
  const ext = isTSX ? '.jsx' : '.js';
  const newPath = file.replace(/\.tsx?$/, ext);

  console.log(`Processing ${file} -> ${newPath}`);

  const code = fs.readFileSync(file, 'utf-8');

  // We want to ONLY strip TypeScript types. We do NOT want to transpile modern JS features or JSX.
  try {
    const result = babel.transformSync(code, {
      filename: file,
      presets: [
        ['@babel/preset-typescript']
      ],
      plugins: ['@babel/plugin-syntax-jsx'],
      retainLines: true, // try to keep line numbers identical
      generatorOpts: {
        retainLines: true,
        jsescOption: {
          minimal: true
        }
      }
    });

    if (result && result.code) {
      fs.writeFileSync(newPath, result.code, 'utf-8');
      fs.unlinkSync(file);
    }
  } catch (err) {
    console.error(`Failed to process ${file}:`, err);
  }
});
