import fs from 'fs';
import { globSync } from 'glob';

const files = globSync('{src,backend}/**/*.{js,jsx}', { ignore: ['**/node_modules/**'] });

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  // Remove express types: Request, Response, NextFunction, RequestHandler
  content = content.replace(/import\s*\{\s*(Request|Response|NextFunction|RequestHandler)[^}]*\}\s*from\s*['"]express['"];?/g, '');
  content = content.replace(/import\s*express,\s*\{\s*(Request|Response|NextFunction|RequestHandler)[^}]*\}\s*from\s*['"]express['"];?/g, "import express from 'express';");
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Removed express types from ${file}`);
  }
});
