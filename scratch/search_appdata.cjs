const fs = require('fs');
const path = require('path');

const appDataDir = 'C:/Users/tio/.gemini/antigravity-cli';

function searchDir(dir) {
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          searchDir(fullPath);
        } else {
          if (fullPath.endsWith('.jsonl') || fullPath.endsWith('.log')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('Painel Interativo TUI') || content.includes('startTui')) {
              console.log("FOUND in log: " + fullPath);
            }
          }
        }
      } catch (err) {
        // ignore
      }
    });
  } catch (err) {
    // ignore permission errors
  }
}

searchDir(appDataDir);
