import BetterSqlite3 from "better-sqlite3";

const dbPath = "D:\\11Tech - Projetos\\Produtos\\11publish\\.mede\\mede.db";
const db = new BetterSqlite3(dbPath);

const phase = db
  .prepare("select * from Phase where name = 'GENERATE_DELIVERY_LOG' order by id desc")
  .get() as any;
const changeSet = db.prepare("select * from ChangeSet where phaseId = ?").get(phase.id) as any;
const chunks = db
  .prepare("select * from ChangeChunk where changeSetId = ? order by [index]")
  .all(changeSet.id);

console.log("Chunks for ChangeSet:", changeSet.id);
for (const chunk of chunks) {
  const lines = chunk.changeContent.split("\n");
  console.log(
    `Chunk ${chunk.index} (${chunk.status}) location=[${chunk.blockLocation}] -> first line: ${JSON.stringify(lines[0])} (total lines: ${lines.length})`,
  );
}

db.close();
