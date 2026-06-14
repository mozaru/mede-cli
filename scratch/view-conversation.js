import Database from "better-sqlite3";

const dbPath = "C:\\temp\\projeto2\\.mede\\mede.db";
const db = new Database(dbPath);

console.log("--- CONVERSATION FOR PHASE 12 ---");
const rows = db.prepare("SELECT actor, content FROM PhaseConversation WHERE phaseId = 12").all();

for (const row of rows) {
  console.log(`\n================= ACTOR: ${row.actor} =================`);
  console.log(row.content);
}
