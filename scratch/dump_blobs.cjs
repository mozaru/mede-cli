const { execSync } = require("child_process");
const fs = require("fs");

const blobs = [
  "a8a3601fc3597636db469d6f5a4344242d472b3c",
  "bcfb0912fd99c331030accc9917c7452c1d3b8b9",
  "316ddffc66dfbcf33fdb4c14df15638010c60672",
  "03fe23cc5258bce0fa9b530463e70bd2b5c2c4c3",
  "22174b262a2012570a012f79b98295dbf584d9a2",
];

blobs.forEach((hash) => {
  try {
    const content = execSync(`git cat-file -p ${hash}`).toString();
    if (
      content.includes("MEDE-CLI — Painel Interativo TUI") ||
      content.includes("import { Box, render, Text")
    ) {
      console.log("FOUND! Dangling blob " + hash + " contains tui.tsx!");
      fs.writeFileSync("src/cli/tui.tsx", content, "utf8");
    }
  } catch (err) {
    console.error("Failed to read blob " + hash + ": " + err.message);
  }
});
