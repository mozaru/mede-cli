const fs = require('fs');
const path = require('path');

const messagesDir = 'C:/Users/tio/.gemini/antigravity-cli/brain/0958128d-eec9-4fb6-8b53-320b0d3e02bb/.system_generated/messages';
const list = fs.readdirSync(messagesDir);

list.forEach(file => {
  const fullPath = path.join(messagesDir, file);
  if (fs.statSync(fullPath).isFile() && fullPath.endsWith('.json')) {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('tui.tsx') && content.includes('504:')) {
      console.log("Found in message file: " + file);
      // Write it to a temp file
      fs.writeFileSync('scratch/found_msg.json', content, 'utf8');
    }
  }
});
