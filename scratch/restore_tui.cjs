const fs = require('fs');
const path = require('path');

const logPath = 'C:/Users/tio/.gemini/antigravity-cli/brain/0958128d-eec9-4fb6-8b53-320b0d3e02bb/.system_generated/logs/transcript_full.jsonl';
const targetFile = 'D:/projetos/11Tech - Projetos/Engernharia de software/mede-cli/src/cli/tui.tsx';

if (!fs.existsSync(logPath)) {
  console.error("Log file not found at " + logPath);
  process.exit(1);
}

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
let tuiContent = null;

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    // Look for the step that viewed tui.tsx
    if (obj.tool_calls) {
      for (const call of obj.tool_calls) {
        if (call.name === 'default_api:view_file' && call.args && call.args.AbsolutePath && call.args.AbsolutePath.includes('tui.tsx')) {
          // Found it! The content will be in the next step or in the system response of the step
        }
      }
    }
    if (obj.content && obj.content.includes('MEDE-CLI — Painel Interativo TUI') && obj.content.includes('504:')) {
      tuiContent = obj.content;
      break;
    }
  } catch (err) {
    // ignore parse error
  }
}

if (!tuiContent) {
  // Let's also scan the non-JSON transcript or do a simple regex on the raw log
  const rawLog = fs.readFileSync(logPath, 'utf8');
  const match = rawLog.match(/Showing lines 1 to 504[\s\S]+?1: (import[\s\S]+?)The above content shows/);
  if (match) {
    tuiContent = match[1];
  }
}

if (!tuiContent) {
  console.error("Could not find tui.tsx content in logs.");
  process.exit(1);
}

// Clean line numbers
// Each line starts with "N: " or similar
const cleanLines = [];
const linesOfCode = tuiContent.split('\n');

for (const line of linesOfCode) {
  const match = line.match(/^\d+:\s?(.*)$/);
  if (match) {
    cleanLines.push(match[1]);
  } else {
    // If it doesn't match the prefix but it's part of code, keep it
    if (line.trim() && !line.includes('Showing lines') && !line.includes('File Path') && !line.includes('Total Lines')) {
      cleanLines.push(line);
    }
  }
}

const finalCode = cleanLines.join('\n');
fs.mkdirSync(path.dirname(targetFile), { recursive: true });
fs.writeFileSync(targetFile, finalCode, 'utf8');

console.log("Successfully restored tui.tsx from logs!");
