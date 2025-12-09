#!/bin/bash

# Script to update all process.env.REACT_APP_ to import.meta.env.VITE_APP_
# This script will be run after manual .env file updates

echo "🔄 Updating environment variable references in source files..."

# Find all TypeScript and JavaScript files in src directory
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -print0 | while IFS= read -r -d '' file; do
  # Replace process.env.REACT_APP_ with import.meta.env.VITE_APP_
  if grep -q "process\.env\.REACT_APP_" "$file"; then
    echo "  📝 Updating: $file"
    sed -i 's/process\.env\.REACT_APP_/import.meta.env.VITE_APP_/g' "$file"
  fi
done

echo "✅ Environment variable references updated!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env files (replace REACT_APP_ with VITE_APP_)"
echo "2. Run: npm install"
echo "3. Run: npm run dev"
