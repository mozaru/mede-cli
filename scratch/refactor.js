const fs = require('fs');
const path = require('path');

const projectRoot = 'D:/projetos/11Tech - Projetos/Engernharia de software/mede-cli';
const srcDir = path.join(projectRoot, 'src');

// Find all files in src recursively
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const allFiles = getFiles(srcDir);

// Build map of old absolute paths to new absolute paths
const moves = {};

allFiles.forEach(file => {
  const relativeToSrc = path.relative(srcDir, file);
  const parts = relativeToSrc.split(path.sep);
  const firstDir = parts[0];

  let newRelative = relativeToSrc;

  if (firstDir === 'commands') {
    // src/commands -> src/cli/commands
    newRelative = path.join('cli', 'commands', ...parts.slice(1));
  } else if (firstDir === 'entities') {
    // src/entities -> src/domain/entities
    newRelative = path.join('domain', 'entities', ...parts.slice(1));
  } else if (firstDir === 'models') {
    // src/models -> src/domain/models
    newRelative = path.join('domain', 'models', ...parts.slice(1));
  } else if (firstDir === 'services') {
    if (parts[1] === 'interfaces') {
      // src/services/interfaces -> src/domain/interfaces/services
      newRelative = path.join('domain', 'interfaces', 'services', ...parts.slice(2));
    } else {
      // src/services -> src/application/services
      newRelative = path.join('application', 'services', ...parts.slice(1));
    }
  } else if (firstDir === 'repositories') {
    if (parts[1] === 'interfaces') {
      // src/repositories/interfaces -> src/domain/interfaces/repositories
      newRelative = path.join('domain', 'interfaces', 'repositories', ...parts.slice(2));
    } else {
      // src/repositories -> src/infrastructure/repositories
      newRelative = path.join('infrastructure', 'repositories', ...parts.slice(1));
    }
  } else if (firstDir === 'db') {
    // src/db -> src/infrastructure/db
    newRelative = path.join('infrastructure', 'db', ...parts.slice(1));
  } else if (firstDir === 'shared' && parts[1] === 'llm') {
    // src/shared/llm -> src/infrastructure/llm
    newRelative = path.join('infrastructure', 'llm', ...parts.slice(2));
  }

  const oldAbs = path.resolve(file);
  const newAbs = path.resolve(srcDir, newRelative);
  moves[oldAbs] = newAbs;
});

// A map of normalized/resolved target old path to target new path
const resolvedMoves = {};
Object.entries(moves).forEach(([oldAbs, newAbs]) => {
  const normOld = oldAbs.replace(/\\/g, '/');
  const normNew = newAbs.replace(/\\/g, '/');
  resolvedMoves[normOld] = normNew;
  
  // also add versions without extension
  const ext = path.extname(normOld);
  if (ext) {
    const oldBase = normOld.slice(0, -ext.length);
    const newBase = normNew.slice(0, -ext.length);
    resolvedMoves[oldBase] = newBase;
  }
});

function resolveImportTarget(fileOldDir, importPath) {
  const absoluteResolved = path.resolve(fileOldDir, importPath).replace(/\\/g, '/');
  
  if (resolvedMoves[absoluteResolved]) {
    return resolvedMoves[absoluteResolved];
  }
  
  // Try extensions if original import ended with .js
  const ext = path.extname(absoluteResolved);
  if (ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx') {
    const base = absoluteResolved.slice(0, -ext.length);
    if (resolvedMoves[base]) {
      // Return with original extension (which is typically .js for node module resolution)
      const targetNew = resolvedMoves[base];
      const targetExt = path.extname(targetNew);
      return targetNew.slice(0, -targetExt.length) + ext;
    }
  }

  return null;
}

// Perform refactoring (reading, rewriting imports, and writing to new location)
Object.entries(moves).forEach(([oldAbs, newAbs]) => {
  let content = fs.readFileSync(oldAbs, 'utf8');
  const fileOldDir = path.dirname(oldAbs);
  const fileNewDir = path.dirname(newAbs);

  const patterns = [
    {
      regex: /(import|export)(\s+(?:[\w\s{},*]+|)\s*from\s*['"])(\.\.?\/[^'"]+)(['"])/g,
      replace: (match, p1, p2, p3, p4) => {
        const targetNewAbs = resolveImportTarget(fileOldDir, p3);
        if (targetNewAbs) {
          let newRelPath = path.relative(fileNewDir, targetNewAbs);
          if (!newRelPath.startsWith('.')) newRelPath = './' + newRelPath;
          newRelPath = newRelPath.replace(/\\/g, '/');
          return `${p1}${p2}${newRelPath}${p4}`;
        }
        return match;
      }
    },
    {
      regex: /(import\s*\(\s*['"])(\.\.?\/[^'"]+)(['"]\s*\))/g,
      replace: (match, p1, p2, p3) => {
        const targetNewAbs = resolveImportTarget(fileOldDir, p2);
        if (targetNewAbs) {
          let newRelPath = path.relative(fileNewDir, targetNewAbs);
          if (!newRelPath.startsWith('.')) newRelPath = './' + newRelPath;
          newRelPath = newRelPath.replace(/\\/g, '/');
          return `${p1}${newRelPath}${p3}`;
        }
        return match;
      }
    },
    {
      regex: /(import\s+['"])(\.\.?\/[^'"]+)(['"])/g,
      replace: (match, p1, p2, p3) => {
        const targetNewAbs = resolveImportTarget(fileOldDir, p2);
        if (targetNewAbs) {
          let newRelPath = path.relative(fileNewDir, targetNewAbs);
          if (!newRelPath.startsWith('.')) newRelPath = './' + newRelPath;
          newRelPath = newRelPath.replace(/\\/g, '/');
          return `${p1}${newRelPath}${p3}`;
        }
        return match;
      }
    }
  ];

  patterns.forEach(p => {
    content = content.replace(p.regex, p.replace);
  });

  fs.mkdirSync(fileNewDir, { recursive: true });
  fs.writeFileSync(newAbs, content, 'utf8');
});

// Delete old files that actually moved
Object.entries(moves).forEach(([oldAbs, newAbs]) => {
  if (oldAbs !== newAbs) {
    fs.unlinkSync(oldAbs);
  }
});

// Recursively delete empty directories
function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      removeEmptyDirs(fullPath);
    }
  });
  if (fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
  }
}
removeEmptyDirs(srcDir);

console.log("Refactoring of files and relative imports complete!");
