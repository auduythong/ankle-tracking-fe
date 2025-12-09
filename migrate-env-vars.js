const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace process.env.REACT_APP_ with import.meta.env.VITE_APP_
    content = content.replace(/process\.env\.REACT_APP_/g, 'import.meta.env.VITE_APP_');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (!['node_modules', 'build', 'dist', '.git'].includes(file)) {
        walkDir(filePath, fileList);
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

console.log('🔄 Starting environment variable migration...\n');

const srcDir = path.join(__dirname, 'src');
const files = walkDir(srcDir);

let updatedCount = 0;
files.forEach(file => {
  if (replaceInFile(file)) {
    updatedCount++;
  }
});

console.log(`\n✨ Migration complete! Updated ${updatedCount} files.`);
console.log('\n📋 Next steps:');
console.log('1. Update .env files (replace REACT_APP_ with VITE_APP_)');
console.log('2. Run: npm install');
console.log('3. Run: npm run dev');
