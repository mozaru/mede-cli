const fs = require('fs');
const logPath = 'C:/Users/tio/.gemini/antigravity-cli/brain/0958128d-eec9-4fb6-8b53-320b0d3e02bb/.system_generated/logs/transcript_full.jsonl';

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');
console.log("Total lines in log: " + lines.length);

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('tui.tsx') && line.includes('504:')) {
    console.log("Found on line: " + i);
    // Write just this line to a temp file so we can inspect or parse it
    fs.writeFileSync('scratch/found_line.json', line, 'utf8');
    break;
  }
}
