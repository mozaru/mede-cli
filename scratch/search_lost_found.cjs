const fs = require('fs');
const path = require('path');

const lostFoundDir = 'D:/projetos/11Tech - Projetos/Engernharia de software/mede-cli/.git/lost-found';

function searchDir(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      searchDir(fullPath);
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('Painel Interativo TUI') || content.includes('startTui')) {
        console.log("FOUND in lost-found: " + fullPath);
        fs.writeFileSync('src/cli/tui.tsx', content, 'utf8');
      }
    }
  });
}

searchDir(lostFoundDir);
