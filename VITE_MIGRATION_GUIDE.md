# Migration Guide: Create React App to Vite

## ✅ Completed Steps

1. ✅ Created `vite.config.ts` with proper configuration
2. ✅ Moved `index.html` to root directory
3. ✅ Updated `tsconfig.json` for Vite compatibility
4. ✅ Created `tsconfig.node.json` for Vite config
5. ✅ Created `src/vite-env.d.ts` for environment variable types
6. ✅ Updated `package.json` scripts and dependencies
7. ✅ Removed `react-scripts` dependency
8. ✅ Added Vite and related plugins

## 🔄 Manual Steps Required

### 1. Update Environment Variables

Vite requires environment variables to use the `VITE_` prefix instead of `REACT_APP_`.

**Update these files:**
- `.env`
- `.env.production`
- `.env.staging`

**Find and replace:**
```bash
REACT_APP_ → VITE_APP_
```

**Example:**
```env
# Before (CRA)
REACT_APP_TOKEN_CLIENT_ID_GOOGLE=your-client-id
REACT_APP_API_URL=https://api.example.com

# After (Vite)
VITE_APP_TOKEN_CLIENT_ID_GOOGLE=your-client-id
VITE_APP_API_URL=https://api.example.com
```

### 2. Update Code References to Environment Variables

**Find and replace in all source files:**
```typescript
// Before (CRA)
process.env.REACT_APP_

// After (Vite)
import.meta.env.VITE_APP_
```

**Common files to check:**
- `src/index.tsx`
- `src/config.ts` (if exists)
- Any API configuration files
- Any files using environment variables

### 3. Install Dependencies

Run the following command to install new dependencies:

```bash
npm install
```

### 4. Remove Old Build Artifacts

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Remove old build directory if exists
rm -rf build
```

### 5. Update .gitignore (Optional)

Add Vite-specific entries:
```
# Vite
dist
*.local
.vite
```

### 6. Start Development Server

```bash
npm run dev
# or
npm start
```

### 7. Test Build

```bash
# Development build
npm run build

# Staging build
npm run build:staging

# Production build
npm run build:prod
```

## 🔍 Key Differences: CRA vs Vite

| Feature | Create React App | Vite |
|---------|-----------------|------|
| Entry point | `public/index.html` | `index.html` (root) |
| Env prefix | `REACT_APP_` | `VITE_` |
| Env access | `process.env.REACT_APP_*` | `import.meta.env.VITE_*` |
| Build output | `build/` | `dist/` (configurable) |
| Dev server | `npm start` | `npm run dev` |
| Config file | `react-scripts` (hidden) | `vite.config.ts` |

## 📝 Files Modified

- ✅ `vite.config.ts` - Created
- ✅ `tsconfig.json` - Updated for Vite
- ✅ `tsconfig.node.json` - Created
- ✅ `index.html` - Moved to root and updated
- ✅ `package.json` - Updated scripts and dependencies
- ✅ `src/vite-env.d.ts` - Created for env types
- ⏳ `.env*` - Need manual update (REACT_APP_ → VITE_APP_)
- ⏳ Source files - Need to update env variable access

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module 'vite'"
**Solution:** Run `npm install`

### Issue: Environment variables are undefined
**Solution:** 
1. Ensure variables use `VITE_` prefix
2. Access via `import.meta.env.VITE_*`
3. Restart dev server after changing .env files

### Issue: SVG imports not working
**Solution:** Already configured `vite-plugin-svgr` in `vite.config.ts`

### Issue: Absolute imports not working
**Solution:** Already configured path aliases in `vite.config.ts` and `tsconfig.json`

## 🎯 Next Steps

1. Update all `.env*` files (replace `REACT_APP_` with `VITE_APP_`)
2. Update all source code (replace `process.env.REACT_APP_` with `import.meta.env.VITE_APP_`)
3. Run `npm install`
4. Test with `npm run dev`
5. Test build with `npm run build`

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vite Migration Guide](https://vitejs.dev/guide/migration.html)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)
