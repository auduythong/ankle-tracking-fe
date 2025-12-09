# Environment Variables Update Guide

## ⚠️ IMPORTANT: Manual Update Required

You need to manually update the following files to replace `REACT_APP_` with `VITE_APP_`:

### Files to Update:
1. `.env`
2. `.env.production`
3. `.env.staging`

## How to Update

### Option 1: Manual Find & Replace (Recommended)

Open each `.env` file and replace:
```
REACT_APP_ → VITE_APP_
```

**Example transformation:**
```env
# BEFORE (Create React App)
REACT_APP_TOKEN_CLIENT_ID_GOOGLE=your-client-id
REACT_APP_BACKEND_API_TEST_WIFI=https://api.example.com
REACT_APP_SECRET_KEY=your-secret-key
REACT_APP_ENV=development

# AFTER (Vite)
VITE_APP_TOKEN_CLIENT_ID_GOOGLE=your-client-id
VITE_APP_BACKEND_API_TEST_WIFI=https://api.example.com
VITE_APP_SECRET_KEY=your-secret-key
VITE_APP_ENV=development
```

### Option 2: Using Command Line

#### Windows (PowerShell):
```powershell
# Backup first
Copy-Item .env .env.backup
Copy-Item .env.production .env.production.backup
Copy-Item .env.staging .env.staging.backup

# Replace in each file
(Get-Content .env) -replace 'REACT_APP_', 'VITE_APP_' | Set-Content .env
(Get-Content .env.production) -replace 'REACT_APP_', 'VITE_APP_' | Set-Content .env.production
(Get-Content .env.staging) -replace 'REACT_APP_', 'VITE_APP_' | Set-Content .env.staging
```

#### Linux/Mac (Bash):
```bash
# Backup first
cp .env .env.backup
cp .env.production .env.production.backup
cp .env.staging .env.staging.backup

# Replace in each file
sed -i 's/REACT_APP_/VITE_APP_/g' .env
sed -i 's/REACT_APP_/VITE_APP_/g' .env.production
sed -i 's/REACT_APP_/VITE_APP_/g' .env.staging
```

## Environment Variables Reference

Based on your codebase, here are all the environment variables you should have:

### Authentication & API
- `VITE_APP_TOKEN_CLIENT_ID_GOOGLE` - Google OAuth Client ID
- `VITE_APP_BACKEND_API_TEST_WIFI` - Backend API URL
- `VITE_APP_API_URL` - Alternative API URL
- `VITE_APP_API_KEY` - API Key
- `VITE_APP_SECRET_KEY` - Secret key for encryption

### Map & Location
- `VITE_APP_MAPBOX_ACCESS_TOKEN` - Mapbox token
- `VITE_APP_GOOGLE_MAPS_API_KEY` - Google Maps API key
- `VITE_APP_MAP_APPID` - Map application ID
- `VITE_APP_MAP_SECRET` - Map secret key
- `VITE_APP_BUILDING_ID` - Building ID for indoor maps

### App Configuration
- `VITE_APP_VERSION` - Application version
- `VITE_APP_ENV` - Environment (development/staging/production)
- `VITE_APP_BASE_NAME` - Base name for routing
- `VITE_APP_BASENAME` - Alternative base name
- `VITE_APP_DEFAULT_PATH` - Default path

### Theme & UI
- `VITE_APP_FONT_FAMILY` - Font family
- `VITE_APP_I18N_LOCALE` - Default locale
- `VITE_APP_MINI_DRAWER` - Mini drawer setting
- `VITE_APP_THEME` - Theme setting
- `VITE_APP_PRESET_COLOR` - Preset color
- `VITE_APP_THEME_DIRECTION` - Theme direction (ltr/rtl)

## Verification

After updating, verify your `.env` files:

```bash
# Check if any REACT_APP_ remains
grep -r "REACT_APP_" .env*

# Should return nothing if all updated correctly
```

## Next Steps

After updating all `.env` files:

1. ✅ Install dependencies:
   ```bash
   npm install
   ```

2. ✅ Start development server:
   ```bash
   npm run dev
   # or
   npm start
   ```

3. ✅ Test the application

4. ✅ Build for production:
   ```bash
   npm run build:prod
   ```

## Troubleshooting

### Issue: Environment variables are undefined
**Solution:** 
- Make sure you've restarted the dev server after changing `.env` files
- Verify the variable names use `VITE_APP_` prefix
- Check that variables are accessed via `import.meta.env.VITE_APP_*`

### Issue: Build fails
**Solution:**
- Run `npm install` to ensure all dependencies are installed
- Check for any TypeScript errors
- Verify all `.env` files are updated

## Important Notes

⚠️ **Security Reminder:**
- Never commit `.env` files to version control
- Keep `.env.example` updated with variable names (not values)
- Rotate secrets if they were accidentally committed

✅ **What's Already Done:**
- ✅ All source code files updated (16 files)
- ✅ `vite.config.ts` created
- ✅ `tsconfig.json` updated
- ✅ `package.json` updated
- ✅ `index.html` moved to root
- ✅ Environment variable types defined in `vite-env.d.ts`

⏳ **What You Need to Do:**
- ⏳ Update `.env` files (this guide)
- ⏳ Run `npm install`
- ⏳ Test the application
