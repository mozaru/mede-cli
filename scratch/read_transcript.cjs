const fs = require("fs");
const path = require("path");

const logPath =
  "C:/Users/tio/.gemini/antigravity-cli/brain/0958128d-eec9-4fb6-8b53-320b0d3e02bb/.system_generated/logs/transcript.jsonl";

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, "utf8");
  console.log("transcript.jsonl exists. Size: " + content.length);
  if (content.includes("tui.tsx")) {
    console.log("FOUND tui.tsx in transcript.jsonl!");
  }
} else {
  console.log("transcript.jsonl does not exist.");
}
