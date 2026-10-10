import { execSync } from 'child_process';
import fs from 'fs';

let maxAttempts = 50;
let attempts = 0;

while (attempts < maxAttempts) {
  attempts++;
  try {
    console.log(`Attempt ${attempts}: Running node server.js...`);
    // Run node server.js just to see if it parses. It might start the server, so we timeout after 3 seconds.
    execSync('node server.js', { timeout: 3000, stdio: 'pipe' });
    console.log('Server started successfully (or parsed successfully)!');
    break;
  } catch (err) {
    const output = err.stderr ? err.stderr.toString() : err.message;
    
    // Look for: SyntaxError: The requested module '../utils/jwtUtils.js' does not provide an export named 'TokenPayload'
    // and the file where it happened:
    // file:///C:/Users/Alif%20Computer/Documents/Arx-website/backend/src/middleware/authMiddleware.js:2
    
    const fileMatch = output.match(/file:\/\/\/([A-Za-z]:[^\n:]+):(\d+)/);
    const exportMatch = output.match(/does not provide an export named '([^']+)'/);
    
    if (fileMatch && exportMatch) {
      let filePath = fileMatch[1].replace(/%20/g, ' ').replace(/\//g, '\\');
      const badExport = exportMatch[1];
      
      console.log(`Found bad export '${badExport}' in ${filePath}`);
      
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');
        
        // Remove the bad export from import statements:
        // Case 1: import { ..., badExport, ... }
        // Case 2: import { badExport }
        const regex1 = new RegExp(`,\\s*${badExport}\\b`, 'g');
        const regex2 = new RegExp(`\\b${badExport}\\s*,`, 'g');
        const regex3 = new RegExp(`import\\s*\\{\\s*${badExport}\\s*\\}\\s*from`, 'g');
        
        content = content.replace(regex1, '');
        content = content.replace(regex2, '');
        content = content.replace(regex3, 'import {} from'); // we can leave empty {} or remove it later
        
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Fixed ${badExport} in ${filePath}`);
      } else {
        console.error(`File not found: ${filePath}`);
        break;
      }
    } else {
      // Could be a different error
      if (output.includes('EADDRINUSE') || err.code === 'ETIMEDOUT') {
        console.log('Server parsed successfully and started/timed out!');
        break;
      }
      console.log('Unhandled error format:');
      console.log(output);
      break;
    }
  }
}
