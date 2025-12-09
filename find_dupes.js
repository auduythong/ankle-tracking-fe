const fs = require('fs');

const scanFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const keyRegex = /^\s*"([^"]+)":/;
  const keys = new Map();

  lines.forEach((line, index) => {
    const match = line.match(keyRegex);
    if (match) {
      const key = match[1];
      if (keys.has(key)) {
        console.log(`Duplicate key "${key}" at line ${index + 1}. First seen at ${keys.get(key)}.`);
      } else {
        keys.set(key, index + 1);
      }
    }
  });
};

scanFile('src/utils/locales/vi.json');
