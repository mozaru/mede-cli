
import * as Diff from 'diff';

interface ChunkModel
{
  index: number,
  offset: number,
  location: string, // Ex: "@@ -1,3 +1,4 @@"
  content: string
}

interface ChunkApplyModel {
  removedCount : number;
  addedCount : number;
  currentLine: number;
  newContent: string;
}

type DiffFunction = (contentOld: string, contentNew: string) => Array<ChunkModel>;
type ApplyFunction = (content: string, chunk:ChunkModel) => ChunkApplyModel;

function generateDiff(contentOld:string, contentNew:string):Array<ChunkModel>
{
    const patchString = Diff.createPatch('memoria', contentOld, contentNew);
    
    const parsedDiff = Diff.parsePatch(patchString);
    const chunks: Array<ChunkModel> = [];

    if (parsedDiff.length > 0 && parsedDiff[0].hunks) {
        parsedDiff[0].hunks.forEach((hunk, idx) => {
            chunks.push({
                index: idx,
                offset:0,
                location: `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`,
                content: hunk.lines.join('\n')
            });
        });
    }

    return chunks;
}

function applyDiff(content: string, chunk:ChunkModel) : ChunkApplyModel
{
    const match = chunk.location.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
    if (!match) {
        console.error("Formato de location inválido:", chunk.location);
        return {
          removedCount:0,
          addedCount:0,
          currentLine: 0,
          newContent:content
        }
    }

    const startOld = parseInt(match[1]) + chunk.offset;
    const startNew = parseInt(match[2]) + chunk.offset;

    // 2. Recalcular a contagem real baseada no conteúdo fornecido pela IA
    const lines = chunk.content.split('\n');
    const removedCount = lines.filter(l => l.startsWith('-') || l.startsWith(' ')).length;
    const addedCount = lines.filter(l => l.startsWith('+') || l.startsWith(' ')).length;

    // 3. Montar o novo cabeçalho corrigido
    const correctedLocation = `@@ -${startOld},${removedCount} +${startNew},${addedCount} @@`;

    const header = `Index: file.txt\n===\n--- file.txt\n+++ file.txt\n`;
    const patchToApply = header + correctedLocation + '\n' + chunk.content + '\n';
    console.log(patchToApply);
    const result = Diff.applyPatch(content, patchToApply);
    
    return {
      removedCount,
      addedCount,
      currentLine: startOld,
      newContent:typeof result === 'string' ? result : content
    }
}

export {
    ApplyFunction,
    DiffFunction,
    ChunkModel,
    generateDiff,
    applyDiff
}
