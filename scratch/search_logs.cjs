const fs = require("fs");
const path = require("path");

const brainDir = "C:/Users/tio/.gemini/antigravity-cli/brain/0958128d-eec9-4fb6-8b53-320b0d3e02bb";

function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(fullPath));
    } else {
      if (fullPath.endsWith(".jsonl") || fullPath.endsWith(".log") || fullPath.endsWith(".json")) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = findFiles(brainDir);
console.log("Found files:\n" + files.join("\n"));
