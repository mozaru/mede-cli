const fs = require('fs');
const logPath = 'C:/Users/tio/.gemini/antigravity-cli/brain/0958128d-eec9-4fb6-8b53-320b0d3e02bb/.system_generated/logs/transcript_full.jsonl';

const line = fs.readFileSync(logPath, 'utf8').trim();
console.log("Line starts with: " + line.slice(0, 100));
console.log("Line ends with: " + line.slice(-100));
console.log("Line length: " + line.length);
