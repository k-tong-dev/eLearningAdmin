# ✅ Strapi v5 File Upload Fix - Summary

## 🎯 Problem
Uploading PDF/DOC/DOCX files in Strapi v5 Admin Media Library was failing with "Internal Server Error".

## ✅ Solution Applied

### 1. **Updated `config/plugins.ts`** ✅
- Changed from Cloudinary to **local provider** (Strapi v5 syntax)
- Set file size limit to **10MB** (10485760 bytes)
- Added image breakpoints configuration
- Removed Strapi v4 style configuration

**Key Changes:**
```typescript
provider: 'local',
providerOptions: {
  sizeLimit: 10485760, // 10MB
}
```

### 2. **Updated `config/middlewares.ts`** ✅
- Increased body parser limits to **50MB**:
  - `formLimit: '50mb'`
  - `jsonLimit: '50mb'`
  - `textLimit: '50mb'`
- Set `formidable.maxFileSize` to **10MB** (10 * 1024 * 1024 bytes)
- All required Strapi core middlewares remain intact

**Key Changes:**
```typescript
{
  name: 'strapi::body',
  config: {
    formLimit: '50mb',
    jsonLimit: '50mb',
    textLimit: '50mb',
    formidable: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
    },
  },
}
```

### 3. **Created Upload Directory** ✅
- Verified/created `public/uploads` directory
- Directory has proper structure for file storage

### 4. **Created Helper Scripts** ✅
- `scripts/fix-upload-config.js` - Verifies configuration
- `scripts/verify-upload-permissions.js` - Checks permissions
- `scripts/rebuild-strapi.js` - Clears cache and rebuilds

### 5. **Created Documentation** ✅
- `UPLOAD_FIX_README.md` - Complete guide with troubleshooting
- `UPLOAD_FIX_SUMMARY.md` - This summary document

## 📋 Next Steps (Manual)

### Step 1: Clear Cache & Rebuild
```bash
cd eLearningAdmin

# Option A: Use the script
node scripts/rebuild-strapi.js

# Option B: Manual
rm -rf .cache build
pnpm run build
```

### Step 2: Restart Strapi
```bash
pnpm run develop
```

### Step 3: Test Upload
1. Go to Strapi Admin: `http://localhost:1337/admin`
2. Navigate to Media Library
3. Click "Add new assets"
4. Upload a small PDF file (< 10MB)
5. Verify upload succeeds ✅

### Step 4: Verify Permissions (Optional)
```bash
node scripts/verify-upload-permissions.js
```

## ✅ Verification Checklist

- [x] `config/plugins.ts` uses local provider with 10MB limit
- [x] `config/middlewares.ts` has body parser limits (50MB) and formidable maxFileSize (10MB)
- [x] `public/uploads` directory exists
- [ ] Cache cleared (`.cache` and `build` directories removed)
- [ ] Admin panel rebuilt (`pnpm run build`)
- [ ] Strapi restarted (`pnpm run develop`)
- [ ] Test upload successful in Media Library
- [ ] Job application file uploads work

## 🔍 File Size Limits

| Setting | Value | Location |
|---------|-------|----------|
| Upload Plugin Limit | 10MB | `config/plugins.ts` |
| Formidable Max File Size | 10MB | `config/middlewares.ts` |
| Body Parser Limits | 50MB | `config/middlewares.ts` |

## 📝 Supported File Types

- ✅ PDF (`.pdf`)
- ✅ Word Documents (`.doc`, `.docx`)
- ✅ Images (`.jpg`, `.png`, `.gif`, etc.)
- ✅ Other files (up to 10MB)

## 🎯 Expected Results

After completing the manual steps:
- ✅ Files upload successfully in Media Library
- ✅ No "Internal Server Error" messages
- ✅ PDF/DOC/DOCX files appear correctly
- ✅ Job application file uploads work
- ✅ Files stored in `public/uploads` directory

## 🚨 Important Notes

1. **File Size**: Maximum file size is **10MB**. To increase, update both:
   - `config/plugins.ts` → `sizeLimit`
   - `config/middlewares.ts` → `formidable.maxFileSize`

2. **Permissions**: If uploads still fail, check Media Library permissions:
   - Settings → Users & Permissions Plugin → Roles
   - Ensure "Public" role has upload permission (for job applications)

3. **Cache**: Always clear cache after configuration changes:
   - Remove `.cache` directory
   - Remove `build` directory
   - Rebuild admin panel

4. **Local Provider**: Changed from Cloudinary to local provider. If you need Cloudinary back:
   - Update `config/plugins.ts` to use Cloudinary provider
   - Ensure Cloudinary credentials are in `.env`

## 📚 Files Modified

1. `config/plugins.ts` - Upload plugin configuration
2. `config/middlewares.ts` - Body parser and formidable settings
3. `public/uploads/` - Upload directory (created/verified)

## 📚 Files Created

1. `scripts/fix-upload-config.js` - Configuration verification script
2. `scripts/verify-upload-permissions.js` - Permission check script
3. `scripts/rebuild-strapi.js` - Cache clear and rebuild script
4. `UPLOAD_FIX_README.md` - Complete documentation
5. `UPLOAD_FIX_SUMMARY.md` - This summary

---

**Status**: ✅ Configuration Complete - Manual Steps Required
**Date**: After Strapi v5 upload configuration fixes

