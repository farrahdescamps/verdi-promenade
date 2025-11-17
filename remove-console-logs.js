const fs = require('fs');
const path = require('path');

function removeConsoleLogs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Remove all console.log, console.error, console.warn, console.debug, console.info
  // This regex handles:
  // - Single line console statements
  // - Multi-line console statements with proper indentation
  // - console statements with objects/arrays spread across lines
  
  // Pattern for single-line console statements
  content = content.replace(/^[ \t]*console\.(log|error|warn|debug|info)\([^;]*\);?\s*$/gm, '');
  
  // Pattern for multi-line console statements
  // Match console.xxx( ... anything ... );
  content = content.replace(/^[ \t]*console\.(log|error|warn|debug|info)\([^)]*(\([^)]*\))*[^;]*\);?\s*$/gm, '');
  
  // More aggressive pattern for complex multi-line statements
  let lines = content.split('\n');
  let inConsoleStatement = false;
  let consoleStartIndent = 0;
  let newLines = [];
  let openParens = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if this line starts a console statement
    if (!inConsoleStatement && /^\s*console\.(log|error|warn|debug|info)\(/.test(line)) {
      inConsoleStatement = true;
      consoleStartIndent = line.search(/\S/);
      
      // Count parentheses in this line
      openParens = (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
      
      // If statement ends on same line, skip it
      if (openParens === 0 && /\);?\s*$/.test(line)) {
        inConsoleStatement = false;
        continue;
      }
      continue;
    }
    
    // If we're in a console statement, count parens and skip
    if (inConsoleStatement) {
      openParens += (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
      
      if (openParens === 0 && /\);?\s*$/.test(line)) {
        inConsoleStatement = false;
      }
      continue;
    }
    
    // Keep the line
    newLines.push(line);
  }
  
  content = newLines.join('\n');
  
  // Remove excessive blank lines (more than 2 consecutive)
  content = content.replace(/\n{4,}/g, '\n\n\n');
  
  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Cleaned: ${filePath}`);
    return true;
  }
  return false;
}

function processDirectory(dir) {
  let filesProcessed = 0;
  
  function walk(directory) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'build') {
          walk(filePath);
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        if (removeConsoleLogs(filePath)) {
          filesProcessed++;
        }
      }
    }
  }
  
  walk(dir);
  console.log(`\n🎉 Done! Processed ${filesProcessed} files.`);
}

// Run the script
const srcDir = path.join(__dirname, 'src');
processDirectory(srcDir);

